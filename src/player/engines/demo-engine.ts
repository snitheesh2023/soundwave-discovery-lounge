import type { Track } from "@/lib/types";
import type { EngineCallbacks, PlaybackEngine } from "./types";

/** Simulated playback for sample tracks. No audio is produced. */
export class DemoEngine implements PlaybackEngine {
  readonly supportsVolume = true;
  private timer: ReturnType<typeof setInterval> | null = null;
  private position = 0;
  private duration = 0;

  constructor(private cb: EngineCallbacks) {}

  load(track: Track, autoplay: boolean) {
    this.clear();
    this.position = 0;
    this.duration = track.durationSec;
    this.cb.onState({ position: 0, duration: this.duration, isPlaying: false, buffering: false });
    if (autoplay) this.play();
  }

  play() {
    if (this.timer) return;
    if (this.position >= this.duration) this.position = 0;
    this.cb.onState({ isPlaying: true });
    this.timer = setInterval(() => {
      this.position = Math.min(this.duration, this.position + 0.25);
      this.cb.onState({ position: this.position });
      if (this.position >= this.duration) {
        this.clear();
        this.cb.onState({ isPlaying: false });
        this.cb.onEnded();
      }
    }, 250);
  }

  pause() {
    this.clear();
    this.cb.onState({ isPlaying: false });
  }

  seek(seconds: number) {
    this.position = Math.max(0, Math.min(this.duration, seconds));
    this.cb.onState({ position: this.position });
  }

  setVolume() {
    /* no audio */
  }

  stop() {
    this.clear();
  }

  destroy() {
    this.clear();
  }

  private clear() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
