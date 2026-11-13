export type Source = "demo" | "spotify" | "youtube" | "audius";

export interface Track {
  /** Unique across providers, e.g. "demo:aurora", "spotify:<id>", "youtube:<videoId>" */
  id: string;
  title: string;
  artist: string;
  album?: string | undefined;
  /** Seconds. 0 means unknown (e.g. live streams). */
  durationSec: number;
  artworkUrl?: string | undefined;
  /** Hue used for generated artwork when no artworkUrl exists. */
  hue?: number | undefined;
  source: Source;
  spotifyUri?: string | undefined;
  youtubeId?: string | undefined;
  audiusId?: string | undefined;
  externalUrl?: string | undefined;
  explicit?: boolean | undefined;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  artworkUrl?: string | undefined;
  hue?: number | undefined;
  source: Source;
  trackCount: number;
  owner?: string | undefined;
  externalUrl?: string | undefined;
}
