import { AlertTriangle, ExternalLink, Info } from "lucide-react";

import type { Track } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/player/player-context";

const NOTES: Record<Track["source"], string> = {
  demo: "Sample track — there is no audio. Progress is simulated so you can try the controls.",
  youtube:
    "Played in YouTube's official player. YouTube may show ads and some videos can't be played outside YouTube.",
  spotify:
    "Played in Spotify's official player. Log in inside the player for full tracks; otherwise Spotify may play a preview.",
};

export function PlaybackNotice({ className }: { className?: string }) {
  const { current, error } = usePlayer();
  if (!current) return null;
  if (error) {
    return (
      <div role="alert" className={cn("flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-foreground", className)}>
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="space-y-1">
          <p>{error}</p>
          {current.externalUrl && (
            <a href={current.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-cyan hover:underline">
              Open on {current.source === "youtube" ? "YouTube" : "Spotify"} <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
    );
  }
  return (
    <p className={cn("flex gap-2 text-xs text-muted-foreground", className)}>
      <Info className="mt-0.5 size-3.5 shrink-0" />
      {NOTES[current.source]}
    </p>
  );
}
