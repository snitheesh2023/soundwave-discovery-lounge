import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DEMO_TRENDING } from "@/lib/demo-data";
import { createStableContext } from "@/lib/stable-context";
import type { Source, Track } from "@/lib/types";
import { DemoEngine } from "./engines/demo-engine";
import { SpotifyEmbedEngine } from "./engines/spotify-embed-engine";
import type { EngineCallbacks, PlaybackEngine } from "./engines/types";
import { YouTubeEngine } from "./engines/youtube-engine";
import {
  cycleRepeat,
  indexAfterEnded,
  nextIndex,
  previousIndex,
  RESTART_THRESHOLD_SEC,
  type RepeatMode,
} from "./queue-logic";

interface PlayerState {
  queue: Track[];
  index: number;
  isPlaying: boolean;
  buffering: boolean;
  position: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | null;
  /** Bumps to force (re)loading the current track. */
  loadNonce: number;
  /** User closed the floating video. Playback is paused whenever it is hidden. */
  stageHidden: boolean;
}

interface PlayerApi extends PlayerState {
  current: Track | null;
  supportsVolume: boolean;
  playTrack: (track: Track, queue?: Track[]) => void;
  playIndex: (index: number) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  hideStage: () => void;
  registerHost: (source: "youtube" | "spotify", el: HTMLElement | null) => void;
}

const PlayerContext = createStableContext<PlayerApi | null>("PlayerContext", null);

const INITIAL: PlayerState = {
  queue: DEMO_TRENDING,
  index: 0,
  isPlaying: false,
  buffering: false,
  position: 0,
  duration: DEMO_TRENDING[0]?.durationSec ?? 0,
  volume: 70,
  muted: false,
  shuffle: false,
  repeat: "off",
  error: null,
  loadNonce: 0,
  stageHidden: false,
};

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>(INITIAL);
  const stateRef = useRef(state);
  stateRef.current = state;

  const autoplayRef = useRef(false);
  const hosts = useRef<{ youtube: HTMLElement | null; spotify: HTMLElement | null }>({
    youtube: null,
    spotify: null,
  });
  const engines = useRef<Partial<Record<Source, PlaybackEngine>>>({});
  const activeSource = useRef<Source | null>(null);

  const patch = useCallback((p: Partial<PlayerState>) => setState((s) => ({ ...s, ...p })), []);

  const handleEnded = useCallback(() => {
    const s = stateRef.current;
    const idx = indexAfterEnded(s.queue.length, s.index, s);
    if (idx === null) {
      setState((prev) => ({ ...prev, isPlaying: false }));
      return;
    }
    autoplayRef.current = true;
    setState((prev) => ({ ...prev, index: idx, position: 0, loadNonce: prev.loadNonce + 1 }));
  }, []);

  const makeCallbacks = useCallback(
    (source: Source): EngineCallbacks => ({
      onState: (p) => {
        if (activeSource.current !== source) return;
        setState((s) => ({ ...s, ...p }));
      },
      onEnded: () => {
        if (activeSource.current === source) handleEnded();
      },
      onError: (message) => {
        if (activeSource.current === source) patch({ error: message, isPlaying: false });
      },
    }),
    [handleEnded, patch],
  );

  const getEngine = useCallback(
    (source: Source): PlaybackEngine | null => {
      const existing = engines.current[source];
      if (existing) return existing;
      let engine: PlaybackEngine | null = null;
      if (source === "demo") engine = new DemoEngine(makeCallbacks("demo"));
      if (source === "youtube" && hosts.current.youtube)
        engine = new YouTubeEngine(hosts.current.youtube, makeCallbacks("youtube"));
      if (source === "spotify" && hosts.current.spotify)
        engine = new SpotifyEmbedEngine(hosts.current.spotify, makeCallbacks("spotify"));
      if (engine) engines.current[source] = engine;
      return engine;
    },
    [makeCallbacks],
  );

  const current = state.queue[state.index] ?? null;

  // Load whenever the current track changes (or a reload is requested).
  useEffect(() => {
    if (!current) return;
    const autoplay = autoplayRef.current;
    autoplayRef.current = false;
    for (const [src, engine] of Object.entries(engines.current)) {
      if (src !== current.source) engine?.stop();
    }
    activeSource.current = current.source;
    const engine = getEngine(current.source);
    if (!engine) {
      patch({ error: "The player is still starting up. Try again in a moment." });
      return;
    }
    setState((s) => ({ ...s, error: null, isPlaying: autoplay && s.isPlaying, stageHidden: false }));
    engine.load(current, autoplay);
    const st = stateRef.current;
    engine.setVolume(st.volume, st.muted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, state.loadNonce]);

  useEffect(() => {
    if (!current) return;
    engines.current[current.source]?.setVolume(state.volume, state.muted);
  }, [state.volume, state.muted, current]);

  useEffect(() => {
    const all = engines.current;
    return () => {
      for (const engine of Object.values(all)) engine?.destroy();
    };
  }, []);

  const activeEngine = () => {
    const c = stateRef.current.queue[stateRef.current.index];
    return c ? getEngine(c.source) : null;
  };

  const playTrack = useCallback((track: Track, queue?: Track[]) => {
    const list = queue && queue.length > 0 ? queue : [track];
    const idx = Math.max(0, list.findIndex((t) => t.id === track.id));
    autoplayRef.current = true;
    setState((s) => ({
      ...s,
      queue: list,
      index: idx,
      position: 0,
      isPlaying: true,
      loadNonce: s.loadNonce + 1,
    }));
  }, []);

  const playIndex = useCallback((index: number) => {
    autoplayRef.current = true;
    setState((s) =>
      index < 0 || index >= s.queue.length
        ? s
        : { ...s, index, position: 0, isPlaying: true, loadNonce: s.loadNonce + 1 },
    );
  }, []);

  const api: PlayerApi = useMemo(() => {
    const engineFor = activeEngine;
    return {
      ...state,
      current,
      supportsVolume: current ? (engines.current[current.source]?.supportsVolume ?? current.source !== "spotify") : true,
      playTrack,
      playIndex,
      togglePlay: () => {
        const engine = engineFor();
        if (!engine) return;
        if (stateRef.current.isPlaying) {
          engine.pause();
          patch({ isPlaying: false });
        } else {
          engine.play();
          patch({ isPlaying: true, stageHidden: false, error: null });
        }
      },
      next: () => {
        const s = stateRef.current;
        const idx = nextIndex(s.queue.length, s.index, s);
        if (idx !== null) playIndex(idx);
      },
      previous: () => {
        const s = stateRef.current;
        if (s.position > RESTART_THRESHOLD_SEC) {
          engineFor()?.seek(0);
          return;
        }
        const idx = previousIndex(s.queue.length, s.index, s.repeat);
        if (idx !== null) playIndex(idx);
        else engineFor()?.seek(0);
      },
      seek: (seconds) => engineFor()?.seek(seconds),
      setVolume: (volume) => patch({ volume, muted: volume === 0 }),
      toggleMute: () => setState((s) => ({ ...s, muted: !s.muted })),
      toggleShuffle: () => setState((s) => ({ ...s, shuffle: !s.shuffle })),
      cycleRepeatMode: () => setState((s) => ({ ...s, repeat: cycleRepeat(s.repeat) })),
      addToQueue: (track) =>
        setState((s) => {
          const queue = [...s.queue];
          queue.splice(s.index + 1, 0, track);
          return { ...s, queue };
        }),
      removeFromQueue: (index) =>
        setState((s) => {
          if (index === s.index || index < 0 || index >= s.queue.length) return s;
          const queue = s.queue.filter((_, i) => i !== index);
          return { ...s, queue, index: index < s.index ? s.index - 1 : s.index };
        }),
      hideStage: () => {
        engineFor()?.pause();
        patch({ stageHidden: true, isPlaying: false });
      },
      registerHost: (source, el) => {
        hosts.current[source] = el;
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, current, playTrack, playIndex, patch]);

  return <PlayerContext.Provider value={api}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerApi {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

