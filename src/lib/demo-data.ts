import nightDrive from "@/assets/mix-night-drive.jpg";
import rooftop from "@/assets/mix-rooftop.jpg";
import vinyl from "@/assets/mix-vinyl.jpg";
import festival from "@/assets/mix-festival.jpg";

import type { Collection, Track } from "./types";

/**
 * SAMPLE DATA. Every artist, title and album below is fictional and made up for the
 * Soundwave demo. There is no audio attached: demo tracks only simulate progress.
 */
type Seed = [slug: string, title: string, artist: string, album: string, sec: number, hue: number];

const SEEDS: Seed[] = [
  ["aurora-lanes", "Aurora Lanes", "Neon Tidepool", "Low Orbit Radio", 214, 128],
  ["paper-satellites", "Paper Satellites", "Mira Kessel", "Soft Machinery", 187, 205],
  ["glass-harbor", "Glass Harbor", "The Quiet Arcade", "Harborlights", 241, 180],
  ["velvet-static", "Velvet Static", "Juno Vale", "Static Bloom", 199, 320],
  ["midnight-cartography", "Midnight Cartography", "Atlas & Ember", "Maps of Nowhere", 263, 250],
  ["sodium-skies", "Sodium Skies", "Kito Raye", "Streetlight Psalms", 176, 60],
  ["afterglow-protocol", "Afterglow Protocol", "Neon Tidepool", "Low Orbit Radio", 228, 140],
  ["tiny-earthquakes", "Tiny Earthquakes", "Sable Wren", "Fault Lines", 203, 20],
  ["cobalt-hours", "Cobalt Hours", "Mira Kessel", "Soft Machinery", 192, 230],
  ["lantern-season", "Lantern Season", "Fern & Foundry", "Northern Kitchen", 256, 85],
  ["signal-fire", "Signal Fire", "Atlas & Ember", "Maps of Nowhere", 211, 35],
  ["slow-motion-city", "Slow Motion City", "The Quiet Arcade", "Harborlights", 237, 195],
  ["ultraviolet-diner", "Ultraviolet Diner", "Juno Vale", "Static Bloom", 184, 290],
  ["halfway-to-mars", "Halfway to Mars", "Kito Raye", "Streetlight Psalms", 222, 10],
  ["moss-and-chrome", "Moss & Chrome", "Sable Wren", "Fault Lines", 248, 110],
  ["kaleidoscope-heart", "Kaleidoscope Heart", "Pixel Monsoon", "Rainmaker", 195, 165],
  ["weightless", "Weightless", "Pixel Monsoon", "Rainmaker", 206, 215],
  ["copper-moon", "Copper Moon", "Fern & Foundry", "Northern Kitchen", 231, 45],
  ["drift-mode", "Drift Mode", "Neon Tidepool", "Afterhours EP", 219, 150],
  ["electric-garden", "Electric Garden", "Lumen Yard", "Greenhouse Effect", 201, 125],
  ["tidal-memory", "Tidal Memory", "Lumen Yard", "Greenhouse Effect", 244, 190],
  ["satellite-hearts", "Satellite Hearts", "Coral Static", "Night Bus Hymns", 188, 340],
  ["blue-hour-transit", "Blue Hour Transit", "Coral Static", "Night Bus Hymns", 226, 240],
  ["golden-feedback", "Golden Feedback", "Orla Finch", "Warm Circuits", 209, 75],
];

export const DEMO_TRACKS: Track[] = SEEDS.map(([slug, title, artist, album, sec, hue]) => ({
  id: `demo:${slug}`,
  title,
  artist,
  album,
  durationSec: sec,
  hue,
  source: "demo",
}));

const byIndex = (idx: number[]) => idx.map((i) => DEMO_TRACKS[i]!).filter(Boolean);

export const DEMO_TRENDING = byIndex([0, 3, 15, 7, 10, 19, 21, 12, 5, 23]);
export const DEMO_RECENT = byIndex([1, 4, 9, 13, 16, 22, 2, 18]);

export interface Mix extends Collection {
  tagline: string;
  trackIds: string[];
}

const ids = (idx: number[]) => byIndex(idx).map((t) => t.id);

export const DEMO_MIXES: Mix[] = [
  {
    id: "demo-night-drive",
    title: "Night Drive",
    tagline: "Synth glow for empty highways",
    description: "Neon Tidepool, Kito Raye, Coral Static and more",
    artworkUrl: nightDrive,
    source: "demo",
    trackCount: 8,
    trackIds: ids([0, 6, 18, 13, 5, 21, 22, 4]),
  },
  {
    id: "demo-rooftop",
    title: "Rooftop Lo‑fi",
    tagline: "Warm beats for golden hour",
    description: "The Quiet Arcade, Fern & Foundry, Orla Finch",
    artworkUrl: rooftop,
    source: "demo",
    trackCount: 8,
    trackIds: ids([2, 11, 9, 17, 23, 1, 8, 20]),
  },
  {
    id: "demo-crate-digger",
    title: "Crate Digger",
    tagline: "Deep cuts with neon edges",
    description: "Juno Vale, Sable Wren, Pixel Monsoon",
    artworkUrl: vinyl,
    source: "demo",
    trackCount: 7,
    trackIds: ids([3, 12, 7, 14, 15, 16, 10]),
  },
  {
    id: "demo-mainstage",
    title: "Mainstage Energy",
    tagline: "Lasers, bass and big drops",
    description: "Lumen Yard, Atlas & Ember, Neon Tidepool",
    artworkUrl: festival,
    source: "demo",
    trackCount: 7,
    trackIds: ids([19, 10, 6, 0, 15, 21, 5]),
  },
];

export const DEMO_PLAYLISTS: Mix[] = [
  ...DEMO_MIXES,
  {
    id: "demo-focus-flow",
    title: "Focus Flow",
    tagline: "Calm, steady, wordless",
    description: "Ambient textures for deep work",
    hue: 200,
    source: "demo",
    trackCount: 6,
    trackIds: ids([8, 16, 20, 1, 11, 17]),
  },
  {
    id: "demo-sunday-kitchen",
    title: "Sunday Kitchen",
    tagline: "Slow mornings, warm coffee",
    description: "Folk-tinged indie and soft grooves",
    hue: 70,
    source: "demo",
    trackCount: 6,
    trackIds: ids([9, 17, 23, 2, 14, 4]),
  },
];

export function findDemoCollection(id: string): Mix | undefined {
  return DEMO_PLAYLISTS.find((p) => p.id === id);
}

export function tracksFor(mix: Mix): Track[] {
  return mix.trackIds
    .map((id) => DEMO_TRACKS.find((t) => t.id === id))
    .filter((t): t is Track => Boolean(t));
}

export function searchDemoTracks(query: string): Track[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DEMO_TRACKS.filter((t) =>
    [t.title, t.artist, t.album ?? ""].some((v) => v.toLowerCase().includes(q)),
  );
}

export const BROWSE_GENRES: { name: string; hue: number }[] = [
  { name: "Synthwave", hue: 300 },
  { name: "Lo‑fi", hue: 40 },
  { name: "Indie", hue: 150 },
  { name: "Electronic", hue: 200 },
  { name: "Hip‑hop", hue: 20 },
  { name: "Ambient", hue: 230 },
  { name: "Jazz", hue: 70 },
  { name: "Folk", hue: 110 },
  { name: "Soul", hue: 350 },
  { name: "Classical", hue: 260 },
];

/**
 * Public example video for trying the official YouTube player without an API key.
 * Playback, ads and availability are controlled entirely by YouTube.
 */
export const YOUTUBE_EXAMPLE_URL = "https://www.youtube.com/watch?v=jfKfPfyJRdk";
