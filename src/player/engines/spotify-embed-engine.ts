import type { Track } from "@/lib/types";
import type { EngineCallbacks, PlaybackEngine } from "./types";

/* Minimal typings for the official Spotify Embed iFrame API. */
interface EmbedController {
  loadUri(uri: string): void;
  play(): void;
  pause(): void;
  resume(): void;
  togglePlay(): void;
  seek(seconds: number): void;
  destroy(): void;
  addListener(
    event: "ready" | "playback_update",
    cb: (e: { data: { isPaused: boolean; isBuffering: boolean; duration: number; position: number } }) => void,
  ): void;
}
interface IFrameAPI {
  createController(
    el: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    cb: (controller: EmbedController) => void,
  ): void;
}
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
  }
}

let apiPromise: Promise<IFrameAPI> | null = null;

function loadSpotifyEmbedApi(): Promise<IFrameAPI> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api);
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("Could not load the Spotify player. Check your connection or content blockers."));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

/**
 * Plays Spotify tracks through the official Spotify embed player. Full-length playback
 * depends on the listener's own Spotify login in the embed; otherwise Spotify shows previews.
 * The embed has no volume API, so volume is controlled inside the Spotify player.
 */
export class SpotifyEmbedEngine implements PlaybackEngine {
  readonly supportsVolume = false;
  private controller: EmbedController | null = null;
  private creating = false;
  private pendingUri: string | null = null;
  private pendingAutoplay = false;
  private endedFired = false;
  private wasPlaying = false;
  private disposed = false;

  constructor(private host: HTMLElement, private cb: EngineCallbacks) {}

  load(track: Track, autoplay: boolean) {
    if (!track.spotifyUri) return;
    this.endedFired = false;
    this.cb.onState({ position: 0, duration: track.durationSec, buffering: true });
    if (this.controller) {
      this.controller.loadUri(track.spotifyUri);
      if (autoplay) this.controller.play();
      return;
    }
    this.pendingUri = track.spotifyUri;
    this.pendingAutoplay = autoplay;
    if (this.creating) return;
    this.creating = true;
    loadSpotifyEmbedApi()
      .then((api) => {
        if (this.disposed) return;
        const mount = document.createElement("div");
        this.host.replaceChildren(mount);
        api.createController(
          mount,
          { uri: this.pendingUri ?? track.spotifyUri!, width: "100%", height: "100%" },
          (controller) => {
            this.controller = controller;
            controller.addListener("ready", () => {
              this.cb.onState({ buffering: false });
              if (this.pendingAutoplay) controller.play();
            });
            controller.addListener("playback_update", (e) => {
              const { isPaused, isBuffering, duration, position } = e.data;
              this.cb.onState({
                isPlaying: !isPaused,
                buffering: isBuffering,
                duration: duration / 1000,
                position: position / 1000,
              });
              if (!isPaused) this.wasPlaying = true;
              if (isPaused && this.wasPlaying && duration > 0 && position >= duration - 800 && !this.endedFired) {
                this.endedFired = true;
                this.wasPlaying = false;
                this.cb.onEnded();
              }
            });
          },
        );
      })
      .catch((err: Error) => this.cb.onError(err.message))
      .finally(() => {
        this.creating = false;
      });
  }

  play() {
    if (this.controller) this.controller.resume();
    else this.pendingAutoplay = true;
  }

  pause() {
    if (this.controller) this.controller.pause();
    else this.pendingAutoplay = false;
  }

  seek(seconds: number) {
    this.controller?.seek(seconds);
    this.cb.onState({ position: seconds });
  }

  setVolume() {
    /* not supported by the Spotify embed API */
  }

  stop() {
    this.pendingAutoplay = false;
    this.controller?.pause();
  }

  destroy() {
    this.disposed = true;
    this.controller?.destroy();
    this.controller = null;
  }
}
