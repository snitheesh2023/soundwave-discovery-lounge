import type { Track } from "./types";

const API = "https://api.audius.co/v1";
const APP_NAME = "Soundwave";

interface AudiusTrack {
  id: string;
  title: string;
  duration?: number;
  artwork?: { "150x150"?: string; "480x480"?: string; "1000x1000"?: string } | null;
  user?: { name?: string; handle?: string };
  permalink?: string;
}

export async function searchAudius(query: string): Promise<Track[]> {
  const params = new URLSearchParams({ query, app_name: APP_NAME, limit: "25" });
  const response = await fetch(`${API}/tracks/search?${params}`);
  if (!response.ok) throw new Error(`Audius search failed (${response.status}).`);
  const body = (await response.json()) as { data?: AudiusTrack[] };
  return (body.data ?? []).map((item) => ({
    id: `audius:${item.id}`,
    audiusId: item.id,
    title: item.title,
    artist: item.user?.name ?? item.user?.handle ?? "Audius artist",
    durationSec: item.duration ?? 0,
    artworkUrl: item.artwork?.["480x480"] ?? item.artwork?.["150x150"],
    source: "audius",
    externalUrl: item.permalink ? `https://audius.co${item.permalink}` : `https://audius.co` ,
  }));
}

export function audiusStreamUrl(trackId: string): string {
  const params = new URLSearchParams({ app_name: APP_NAME });
  return `${API}/tracks/${encodeURIComponent(trackId)}/stream?${params}`;
}
