import type { Track } from "@/lib/types";
import type { EngineCallbacks, PlaybackEngine } from "./types";

/* Minimal typings for the official YouTube IFrame Player API. */
interface YTPlayer {
  loadVideoById(id: string): void;
  cueVideoById(id: string): void;
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(v: number): void;
  mute(): void;
  unMute(): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}
interface YTNamespace {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId?: string | undefined;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (e: { data: number }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("Could not load the YouTube player. Check your connection or content blockers."));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

const ERROR_MESSAGES: Record<number, string> = {
  2: "This YouTube link looks invalid.",
  5: "This video can't be played in an embedded player.",
  100: "This video was removed or made private.",
  101: "The video owner doesn't allow playback outside YouTube.",
  150: "The video owner doesn't allow playback outside YouTube.",
};

/** Drives the official YouTube embed. Ads, restrictions and availability are YouTube's. */
export class YouTubeEngine implements PlaybackEngine {
  readonly supportsVolume = true;
  private player: YTPlayer | null = null;
  private ready = false;
  private pendingId: string | null = null;
  private pendingAutoplay = false;
  private poll: ReturnType<typeof setInterval> | null = null;
  private volume = 70;
  private muted = false;
  private disposed = false;

  constructor(private host: HTMLElement, private cb: EngineCallbacks) {}

  load(track: Track, autoplay: boolean) {
    if (!track.youtubeId) return;
    this.cb.onState({ position: 0, duration: track.durationSec, buffering: true });
    if (this.player && this.ready) {
      if (autoplay) this.player.loadVideoById(track.youtubeId);
      else this.player.cueVideoById(track.youtubeId);
      return;
    }
    this.pendingId = track.youtubeId;
    this.pendingAutoplay = autoplay;
    if (this.player) return;
    loadYouTubeApi()
      .then((YT) => {
        if (this.disposed || this.player) return;
        const mount = document.createElement("div");
        this.host.replaceChildren(mount);
        this.player = new YT.Player(mount, {
          videoId: this.pendingId ?? undefined,
          width: "100%",
          height: "100%",
          playerVars: {
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              this.ready = true;
              this.applyVolume();
              if (this.pendingAutoplay) this.player?.playVideo();
            },
            onStateChange: (e) => this.handleState(e.data),
            onError: (e) => {
              this.cb.onState({ isPlaying: false, buffering: false });
              this.cb.onError(ERROR_MESSAGES[e.data] ?? `YouTube player error (${e.data}).`);
            },
          },
        });
      })
      .catch((err: Error) => this.cb.onError(err.message));
  }

  private handleState(state: number) {
    // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
    if (state === 1) {
      this.cb.onState({ isPlaying: true, buffering: false });
      this.startPolling();
    } else if (state === 2) {
      this.cb.onState({ isPlaying: false, buffering: false });
      this.stopPolling();
    } else if (state === 3) {
      this.cb.onState({ buffering: true });
    } else if (state === 0) {
      this.stopPolling();
      this.cb.onState({ isPlaying: false });
      this.cb.onEnded();
    } else if (state === 5) {
      this.cb.onState({ isPlaying: false, buffering: false, duration: this.player?.getDuration() || 0 });
    }
  }

  private startPolling() {
    this.stopPolling();
    const tick = () => {
      if (!this.player) return;
      this.cb.onState({
        position: this.player.getCurrentTime() || 0,
        duration: this.player.getDuration() || 0,
      });
    };
    tick();
    this.poll = setInterval(tick, 500);
  }

  private stopPolling() {
    if (this.poll) clearInterval(this.poll);
    this.poll = null;
  }

  play() {
    if (this.player && this.ready) this.player.playVideo();
    else this.pendingAutoplay = true;
  }

  pause() {
    if (this.player && this.ready) this.player.pauseVideo();
    else this.pendingAutoplay = false;
  }

  seek(seconds: number) {
    if (this.player && this.ready) {
      this.player.seekTo(seconds, true);
      this.cb.onState({ position: seconds });
    }
  }

  setVolume(volume: number, muted: boolean) {
    this.volume = volume;
    this.muted = muted;
    this.applyVolume();
  }

  private applyVolume() {
    if (!this.player || !this.ready) return;
    this.player.setVolume(this.volume);
    if (this.muted) this.player.mute();
    else this.player.unMute();
  }

  stop() {
    this.pendingAutoplay = false;
    this.stopPolling();
    if (this.player && this.ready) this.player.pauseVideo();
  }

  destroy() {
    this.disposed = true;
    this.stopPolling();
    this.player?.destroy();
    this.player = null;
  }
}
