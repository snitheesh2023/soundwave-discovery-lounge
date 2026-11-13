import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { Track } from "./types";
import { parseIsoDuration, youTubeWatchUrl } from "./youtube-url";

/**
 * YouTube Data API v3 search, run on the server so the API key never reaches the browser.
 * Only metadata is fetched; playback always happens in the official YouTube embed player.
 */

export const getYouTubeStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { configured: Boolean(process.env["YOUTUBE_API_KEY"]) };
});

export interface YouTubeSearchResult {
  configured: boolean;
  items: Track[];
  error?: string;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export const searchYouTube = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ q: z.string().trim().min(1).max(120) }).parse(input))
  .handler(async ({ data }): Promise<YouTubeSearchResult> => {
    const key = process.env["YOUTUBE_API_KEY"];
    if (!key) return { configured: false, items: [] };

    const searchParams = new URLSearchParams({
      part: "snippet",
      type: "video",
      videoEmbeddable: "true",
      safeSearch: "moderate",
      maxResults: "12",
      q: data.q,
      key,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams}`);
    if (!res.ok) {
      const body = await res.text();
      console.error(`YouTube search failed [${res.status}]: ${body}`);
      let reason = body;
      try {
        reason = JSON.parse(body)?.error?.message ?? body;
      } catch {
        /* raw */
      }
      return { configured: true, items: [], error: `YouTube search failed (${res.status}): ${reason}` };
    }
    const json = (await res.json()) as {
      items: {
        id: { videoId?: string };
        snippet: {
          title: string;
          channelTitle: string;
          liveBroadcastContent?: string;
          thumbnails?: Record<string, { url: string }>;
        };
      }[];
    };
    const videos = json.items.filter((i) => i.id.videoId);
    const durations = new Map<string, number>();
    if (videos.length > 0) {
      const vParams = new URLSearchParams({
        part: "contentDetails",
        id: videos.map((v) => v.id.videoId).join(","),
        key,
      });
      const vRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${vParams}`);
      if (vRes.ok) {
        const vJson = (await vRes.json()) as {
          items: { id: string; contentDetails?: { duration?: string } }[];
        };
        for (const v of vJson.items) durations.set(v.id, parseIsoDuration(v.contentDetails?.duration));
      }
    }
    const items: Track[] = videos.map((v) => {
      const id = v.id.videoId!;
      const thumbs = v.snippet.thumbnails ?? {};
      return {
        id: `youtube:${id}`,
        title: decodeEntities(v.snippet.title),
        artist: decodeEntities(v.snippet.channelTitle),
        durationSec: durations.get(id) ?? 0,
        artworkUrl: (thumbs["high"] ?? thumbs["medium"] ?? thumbs["default"])?.url,
        source: "youtube",
        youtubeId: id,
        externalUrl: youTubeWatchUrl(id),
      };
    });
    return { configured: true, items };
  });
