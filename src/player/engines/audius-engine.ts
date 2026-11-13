import type { Track } from "@/lib/types";
import { audiusStreamUrl } from "@/lib/audius";
import type { EngineCallbacks, PlaybackEngine } from "./types";

/** Direct audio playback for Audius streams; HTMLAudioElement can continue in mobile background. */
export class AudiusEngine implements PlaybackEngine {
  readonly supportsVolume = true;
  private audio = new Audio();
  private disposed = false;

  constructor(private cb: EngineCallbacks) {
    this.audio.preload = "metadata";
    this.audio.addEventListener("playing", this.onPlaying);
    this.audio.addEventListener("pause", this.onPause);
    this.audio.addEventListener("waiting", this.onWaiting);
    this.audio.addEventListener("timeupdate", this.onTimeUpdate);
    this.audio.addEventListener("loadedmetadata", this.onMetadata);
    this.audio.addEventListener("ended", this.onEnded);
    this.audio.addEventListener("error", this.onAudioError);
  }

  load(track: Track, autoplay: boolean) {
    if (!track.audiusId) return;
    this.cb.onState({ position: 0, duration: track.durationSec, buffering: true, isPlaying: false });
    this.audio.src = audiusStreamUrl(track.audiusId);
    this.audio.load();
    if (autoplay) void this.playAudio();
  }

  private playAudio = async () => {
    try {
      await this.audio.play();
    } catch (error) {
      if (this.disposed) return;
      this.cb.onError(error instanceof Error ? error.message : "Audius playback could not start.");
    }
  };

  private onPlaying = () => this.cb.onState({ isPlaying: true, buffering: false });
  private onPause = () => this.cb.onState({ isPlaying: false, buffering: false });
  private onWaiting = () => this.cb.onState({ buffering: true });
  private onTimeUpdate = () => this.cb.onState({ position: this.audio.currentTime, duration: this.audio.duration || 0 });
  private onMetadata = () => this.cb.onState({ duration: this.audio.duration || 0, buffering: false });
  private onEnded = () => { this.cb.onState({ isPlaying: false }); this.cb.onEnded(); };
  private onAudioError = () => {
    if (this.audio.error) this.cb.onError("This Audius track is unavailable or cannot be streamed right now.");
  };

  play() { void this.playAudio(); }
  pause() { this.audio.pause(); }
  seek(seconds: number) {
    if (Number.isFinite(this.audio.duration)) this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration));
  }
  setVolume(volume: number, muted: boolean) { this.audio.volume = Math.max(0, Math.min(1, volume / 100)); this.audio.muted = muted; }
  stop() { this.audio.pause(); this.audio.removeAttribute("src"); this.audio.load(); }
  destroy() {
    this.disposed = true;
    this.stop();
    this.audio.removeEventListener("playing", this.onPlaying);
    this.audio.removeEventListener("pause", this.onPause);
    this.audio.removeEventListener("waiting", this.onWaiting);
    this.audio.removeEventListener("timeupdate", this.onTimeUpdate);
    this.audio.removeEventListener("loadedmetadata", this.onMetadata);
    this.audio.removeEventListener("ended", this.onEnded);
    this.audio.removeEventListener("error", this.onAudioError);
  }
}
