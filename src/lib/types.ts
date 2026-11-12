export type Source = "demo" | "spotify" | "youtube";

export interface Track {
  /** Unique across providers, e.g. "demo:aurora", "spotify:<id>", "youtube:<videoId>" */
  id: string;
  title: string;
  artist: string;
  album?: string;
  /** Seconds. 0 means unknown (e.g. live streams). */
  durationSec: number;
  artworkUrl?: string;
  /** Hue used for generated artwork when no artworkUrl exists. */
  hue?: number;
  source: Source;
  spotifyUri?: string;
  youtubeId?: string;
  externalUrl?: string;
  explicit?: boolean;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  artworkUrl?: string;
  hue?: number;
  source: Source;
  trackCount: number;
  owner?: string;
  externalUrl?: string;
}
