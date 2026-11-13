import type { Collection, Track } from "./types";

export interface ImportedPlaylist extends Collection {
  tracks: Track[];
  importedAt: number;
}

const STORAGE_KEY = "soundwave.imported-playlists.v1";

export function getImportedPlaylists(): ImportedPlaylist[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? (value as ImportedPlaylist[]) : [];
  } catch {
    return [];
  }
}

export function saveImportedPlaylists(playlists: ImportedPlaylist[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field.trim()); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; field = "";
    } else field += c;
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export function parseSpotifyPlaylistCsv(text: string, title: string): ImportedPlaylist {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error("This CSV doesn't contain any playlist tracks.");
  const headers = rows[0]!.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const find = (...names: string[]) => headers.findIndex((h) => names.includes(h));
  const titleIndex = find("trackname", "track", "title", "name");
  const artistIndex = find("artistname", "artistnames", "artist", "artists");
  const albumIndex = find("albumname", "album");
  if (titleIndex < 0 || artistIndex < 0) {
    throw new Error("CSV needs Track Name and Artist Name columns. Export the playlist with those columns and try again.");
  }
  const tracks = rows.slice(1).flatMap((r, i) => {
    const trackTitle = r[titleIndex]?.trim();
    const artist = r[artistIndex]?.trim();
    if (!trackTitle || !artist) return [];
    return [{
      id: "import:" + i + ":" + trackTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: trackTitle, artist, album: albumIndex >= 0 ? r[albumIndex] || undefined : undefined,
      durationSec: 0, source: "spotify" as const,
    }];
  });
  if (!tracks.length) throw new Error("No tracks with both a title and artist were found.");
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "spotify-playlist";
  return {
    id: "imported:" + slug + ":" + Date.now().toString(36),
    title: title.trim() || "Imported Spotify playlist",
    description: "Imported from a Spotify playlist CSV. Match tracks with YouTube to play them.",
    source: "spotify", trackCount: tracks.length, tracks, importedAt: Date.now(),
  };
}
