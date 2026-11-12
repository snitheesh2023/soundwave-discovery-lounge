import { Pause, Play } from "lucide-react";

import type { Track } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/player/player-context";
import { Artwork } from "./Artwork";
import { SourceBadge } from "./SourceBadge";

export function TrackCard({ track, queue }: { track: Track; queue: Track[] }) {
  const player = usePlayer();
  const isCurrent = player.current?.id === track.id;
  const playing = isCurrent && player.isPlaying;
  return (
    <div className="group relative flex w-40 shrink-0 flex-col gap-2 rounded-xl p-2.5 transition-colors hover:bg-surface-hover sm:w-44">
      <div className="relative">
        <Artwork
          src={track.artworkUrl}
          hue={track.hue}
          seed={track.id}
          alt={`${track.title} artwork`}
          rounded="lg"
          className={cn("w-full", track.source === "youtube" && "object-cover")}
        />
        <button
          type="button"
          onClick={() => (isCurrent ? player.togglePlay() : player.playTrack(track, queue))}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title} by ${track.artist}`}
          className={cn(
            "absolute bottom-2 right-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-all hover:scale-105 focus-visible:opacity-100 group-hover:opacity-100",
            playing ? "opacity-100" : "opacity-0",
          )}
        >
          {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 translate-x-px fill-current" />}
        </button>
      </div>
      <div className="min-w-0">
        <p className={cn("truncate text-sm font-semibold", isCurrent && "text-primary")}>{track.title}</p>
        <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
      </div>
      <SourceBadge source={track.source} className="self-start" />
    </div>
  );
}

export function TrackCardRow({ tracks }: { tracks: Track[] }) {
  return (
    <div className="scrollbar-none -mx-2 flex gap-1 overflow-x-auto px-0 pb-1">
      {tracks.map((t) => (
        <TrackCard key={t.id} track={t} queue={tracks} />
      ))}
    </div>
  );
}
