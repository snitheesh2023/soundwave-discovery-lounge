import { Pause, Play } from "lucide-react";

import { formatTime } from "@/lib/format";
import type { Track } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/player/player-context";
import { SourceBadge } from "./SourceBadge";

export function VideoCard({ track, queue }: { track: Track; queue: Track[] }) {
  const player = usePlayer();
  const isCurrent = player.current?.id === track.id;
  const playing = isCurrent && player.isPlaying;
  return (
    <div className="group relative flex flex-col gap-2 rounded-xl p-2 transition-colors hover:bg-surface-hover">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-2">
        {track.artworkUrl && (
          <img src={track.artworkUrl} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-background/85 px-1.5 py-0.5 text-[11px] font-medium tabular-nums">
          {track.durationSec ? formatTime(track.durationSec) : "Live"}
        </span>
        <button
          type="button"
          onClick={() => (isCurrent ? player.togglePlay() : player.playTrack(track, queue))}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title} in the YouTube player`}
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-background/40 transition-opacity focus-visible:opacity-100 group-hover:opacity-100",
            playing ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 translate-x-px fill-current" />}
          </span>
        </button>
      </div>
      <div className="min-w-0 px-0.5">
        <p className={cn("line-clamp-2 text-sm font-semibold", isCurrent && "text-primary")}>{track.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
          <SourceBadge source="youtube" />
        </div>
      </div>
    </div>
  );
}
