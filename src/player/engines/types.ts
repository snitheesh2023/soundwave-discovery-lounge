import type { Track } from "@/lib/types";

export interface EngineCallbacks {
  onState: (patch: { isPlaying?: boolean; position?: number; duration?: number; buffering?: boolean }) => void;
  onEnded: () => void;
  onError: (message: string) => void;
}

export interface PlaybackEngine {
  readonly supportsVolume: boolean;
  load(track: Track, autoplay: boolean): void;
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  setVolume(volume: number, muted: boolean): void;
  stop(): void;
  destroy(): void;
}
