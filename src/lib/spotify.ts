/**
 * Spotify Web API access using the official Authorization Code with PKCE flow.
 * PKCE is designed for browser apps: only the public Client ID is needed, never a secret.
 * Docs: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 */
import type { Collection, Track } from "./types";

const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-read-recently-played",
  "user-top-read",
  "user-library-read",
];

const TOKEN_KEY = "soundwave.spotify.token";
const VERIFIER_KEY = "soundwave.spotify.verifier";
const STATE_KEY = "soundwave.spotify.state";

interface StoredToken {
  accessToken: string;
  refreshToken?: string | undefined;
  expiresAt: number;
  scope?: string | undefined;
}

export class SpotifyApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Public Spotify Client ID (safe in the browser with PKCE). VITE_SPOTIFY_CLIENT_ID overrides it. */
const DEFAULT_SPOTIFY_CLIENT_ID = "8c472be056d24efc996b38bf0a5ac6c9";

export function getSpotifyClientId(): string | undefined {
  const id = (import.meta.env["VITE_SPOTIFY_CLIENT_ID"] as string | undefined) ?? DEFAULT_SPOTIFY_CLIENT_ID;
  return id && id.trim() ? id.trim() : undefined;
}

export function getSpotifyRedirectUri(): string {
  const configured = import.meta.env["VITE_SPOTIFY_REDIRECT_URI"] as string | undefined;
  if (configured && configured.trim()) return configured.trim();
  if (typeof window === "undefined") return "/callback";
  return `${window.location.origin}/callback`;
}

function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

async function sha256Base64Url(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  let binary = "";
  for (const b of new Uint8Array(digest)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function beginSpotifyLogin(): Promise<void> {
  const clientId = getSpotifyClientId();
  if (!clientId) throw new Error("Spotify is not configured (missing VITE_SPOTIFY_CLIENT_ID).");
  const verifier = randomString(64);
  const state = randomString(16);
  const challenge = await sha256Base64Url(verifier);
  localStorage.setItem(VERIFIER_KEY, verifier);
  localStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getSpotifyRedirectUri(),
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: SPOTIFY_SCOPES.join(" "),
    state,
  });
  window.location.assign(`${AUTH_URL}?${params.toString()}`);
}

function readToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as StoredToken) : null;
  } catch {
    return null;
  }
}

function writeToken(json: {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}, previous?: StoredToken | null) {
  const token: StoredToken = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? previous?.refreshToken,
    expiresAt: Date.now() + json.expires_in * 1000,
    scope: json.scope,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}

export function hasSpotifySession(): boolean {
  return readToken() !== null;
}

export function clearSpotifySession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(VERIFIER_KEY);
  localStorage.removeItem(STATE_KEY);
}

export async function completeSpotifyLogin(params: {
  code?: string | undefined;
  state?: string | undefined;
  error?: string | undefined;
}): Promise<void> {
  if (params.error) {
    throw new Error(
      params.error === "access_denied"
        ? "You cancelled the Spotify sign-in."
        : `Spotify returned an error: ${params.error}`,
    );
  }
  const clientId = getSpotifyClientId();
  if (!clientId) throw new Error("Spotify is not configured.");
  const expectedState = localStorage.getItem(STATE_KEY);
  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!params.code) throw new Error("No authorization code was returned.");
  if (!verifier || !expectedState || params.state !== expectedState) {
    throw new Error("This sign-in link is invalid or expired. Please try connecting again.");
  }
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: getSpotifyRedirectUri(),
      code_verifier: verifier,
    }),
  });
  localStorage.removeItem(VERIFIER_KEY);
  localStorage.removeItem(STATE_KEY);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed [${res.status}]: ${body}`);
  }
  writeToken(await res.json());
}

async function refreshToken(token: StoredToken): Promise<StoredToken | null> {
  const clientId = getSpotifyClientId();
  if (!clientId || !token.refreshToken) return null;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
  });
  if (!res.ok) return null;
  writeToken(await res.json(), token);
  return readToken();
}

async function getAccessToken(forceRefresh = false): Promise<string | null> {
  let token = readToken();
  if (!token) return null;
  if (forceRefresh || token.expiresAt - 60_000 < Date.now()) {
    token = await refreshToken(token);
    if (!token) {
      clearSpotifySession();
      return null;
    }
  }
  return token.accessToken;
}

export async function spotifyGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = `${API_BASE}${path}${params ? `?${new URLSearchParams(params)}` : ""}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    const access = await getAccessToken(attempt > 0);
    if (!access) throw new SpotifyApiError(401, "Your Spotify session has ended. Connect again.");
    const res = await fetch(url, { headers: { Authorization: `Bearer ${access}` } });
    if (res.status === 401 && attempt === 0) continue;
    if (!res.ok) {
      const text = await res.text();
      let message = text;
      try {
        message = JSON.parse(text)?.error?.message ?? text;
      } catch {
        /* keep raw text */
      }
      if (res.status === 403) {
        message = `Spotify refused this request (${message}). Apps in development mode only work for users added in the Spotify Developer Dashboard.`;
      } else if (res.status === 429) {
        message = `Spotify rate limit reached. Try again in ${res.headers.get("Retry-After") ?? "a few"} seconds.`;
      }
      throw new SpotifyApiError(res.status, message);
    }
    if (res.status === 204) return {} as T;
    return (await res.json()) as T;
  }
  throw new SpotifyApiError(401, "Your Spotify session has ended. Connect again.");
}

/* ---------- Mapping ---------- */

interface SpImage {
  url: string;
  width?: number | null;
}
interface SpTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  explicit?: boolean;
  is_local?: boolean;
  artists: { name: string }[];
  album?: { name: string; images: SpImage[] };
  external_urls?: { spotify?: string };
}
interface SpPlaylist {
  id: string;
  name: string;
  description?: string | null;
  images?: SpImage[] | null;
  owner?: { display_name?: string };
  tracks?: { total: number };
  items?: { total: number };
  external_urls?: { spotify?: string };
}
export interface SpotifyProfile {
  id: string;
  display_name: string | null;
  email?: string;
  product?: string;
  images?: SpImage[];
}

function pickImage(images: SpImage[] | null | undefined): string | undefined {
  if (!images || images.length === 0) return undefined;
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  return (sorted.find((i) => (i.width ?? 0) >= 200) ?? sorted[sorted.length - 1])?.url;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
}

export function mapSpotifyTrack(t: SpTrack): Track {
  return {
    id: `spotify:${t.id}`,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    album: t.album?.name,
    durationSec: Math.round(t.duration_ms / 1000),
    artworkUrl: pickImage(t.album?.images),
    source: "spotify",
    spotifyUri: t.uri,
    externalUrl: t.external_urls?.spotify,
    explicit: t.explicit,
  };
}

function mapPlaylist(p: SpPlaylist): Collection {
  return {
    id: p.id,
    title: p.name,
    description: p.description ? stripHtml(p.description) : `By ${p.owner?.display_name ?? "Spotify user"}`,
    artworkUrl: pickImage(p.images),
    source: "spotify",
    trackCount: p.tracks?.total ?? p.items?.total ?? 0,
    owner: p.owner?.display_name,
    externalUrl: p.external_urls?.spotify,
  };
}

const usable = (t: SpTrack | null | undefined): t is SpTrack => Boolean(t && t.id && !t.is_local);

export const spotifyApi = {
  me: () => spotifyGet<SpotifyProfile>("/me"),
  playlists: async () => {
    const res = await spotifyGet<{ items: (SpPlaylist | null)[] }>("/me/playlists", { limit: "30" });
    return res.items.filter((p): p is SpPlaylist => Boolean(p)).map(mapPlaylist);
  },
  playlist: async (id: string) => mapPlaylist(await spotifyGet<SpPlaylist>(`/playlists/${encodeURIComponent(id)}`, { fields: "id,name,description,images,owner(display_name),tracks(total),external_urls" })),
  playlistTracks: async (id: string) => {
    const res = await spotifyGet<{ items: { track: SpTrack | null }[] }>(
      `/playlists/${encodeURIComponent(id)}/tracks`,
      { limit: "50" },
    );
    return res.items.map((i) => i.track).filter(usable).map(mapSpotifyTrack);
  },
  recentlyPlayed: async () => {
    const res = await spotifyGet<{ items: { track: SpTrack }[] }>("/me/player/recently-played", {
      limit: "20",
    });
    const seen = new Set<string>();
    return res.items
      .map((i) => i.track)
      .filter(usable)
      .filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)))
      .map(mapSpotifyTrack);
  },
  topTracks: async () => {
    const res = await spotifyGet<{ items: SpTrack[] }>("/me/top/tracks", {
      limit: "10",
      time_range: "short_term",
    });
    return res.items.filter(usable).map(mapSpotifyTrack);
  },
  searchTracks: async (q: string) => {
    const res = await spotifyGet<{ tracks: { items: SpTrack[] } }>("/search", {
      q,
      type: "track",
      limit: "10",
    });
    return res.tracks.items.filter(usable).map(mapSpotifyTrack);
  },
};
