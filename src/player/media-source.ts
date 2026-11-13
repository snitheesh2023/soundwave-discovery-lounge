import type { Source } from "@/lib/types";

export function isMediaSource(source: Source | undefined): source is "youtube" | "spotify" {
  return source === "youtube" || source === "spotify";
}
