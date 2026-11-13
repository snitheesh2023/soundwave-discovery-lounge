import { ExternalLink, ListPlus, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/format";
import type { Track } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/player/player-context";
import { Artwork } from "./Artwork";
import { EqBars } from "./EqBars";
import { SourceBadge } from "./SourceBadge";

interface TrackRowProps {
  track: Track;
  index: number;
  queue: Track[];
  showBadge?: boolean | undefined;
  showAlbum?: boolean | undefined;
}

export function TrackRow({ track, index, queue, showBadge = true, showAlbum = true }: TrackRowProps) {
  const player = usePlayer();
  const isCurrent = player.current?.id === track.id;
  const playing = isCurrent && player.isPlaying;

  const onPlay = () => {
    if (isCurrent) player.togglePlay();
    else player.playTrack(track, queue);
  };

  return (
    <li
      className={cn(
        "group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-hover md:grid-cols-[2rem_minmax(0,1.4fr)_minmax(0,1fr)_auto]",
        isCurrent && "bg-surface-2",
      )}
      onDoubleClick={onPlay}
    >
      <div className="relative flex h-8 w-8 items-center justify-center text-sm tabular-nums text-muted-foreground">
        <span className={cn("group-hover:invisible group-focus-within:invisible", isCurrent && "invisible")}>
          {index + 1}
        </span>
        {playing && (
          <EqBars className="absolute group-hover:invisible group-focus-within:invisible" />
        )}
        <button
          type="button"
          onClick={onPlay}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title} by ${track.artist}`}
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-md text-foreground opacity-0 focus-visible:opacity-100 group-hover:opacity-100",
            isCurrent && !playing && "opacity-100",
          )}
        >
          {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
        </button>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <Artwork src={track.artworkUrl} hue={track.hue} seed={track.id} alt="" className="size-10 shrink-0" rounded="sm" />
        <div className="min-w-0">
          <p className={cn("truncate font-medium", isCurrent ? "text-primary" : "text-foreground")}>{track.title}</p>
          <div className="flex min-w-0 items-center gap-2">
            {track.explicit && (
              <span className="rounded-sm bg-muted-foreground/30 px-1 text-[10px] font-bold text-foreground" aria-label="Explicit">
                E
              </span>
            )}
            <p className="truncate text-sm text-muted-foreground">{track.artist}</p>
          </div>
        </div>
      </div>

      {showAlbum && (
        <p className="hidden truncate text-sm text-muted-foreground md:block">{track.album ?? "—"}</p>
      )}

      <div className="flex items-center gap-1 sm:gap-2">
        {showBadge && <SourceBadge source={track.source} className="hidden sm:inline-flex" />}
        <Button
          variant="control"
          size="icon-sm"
          className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
          aria-label={`Add ${track.title} to queue`}
          onClick={() => player.addToQueue(track)}
        >
          <ListPlus />
        </Button>
        {track.externalUrl && (
          <Button variant="control" size="icon-sm" asChild className="hidden sm:inline-flex">
            <a
              href={track.externalUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${track.title} on ${track.source === "youtube" ? "YouTube" : "Spotify"}`}
            >
              <ExternalLink />
            </a>
          </Button>
        )}
        <span className="w-11 text-right text-sm tabular-nums text-muted-foreground">
          {track.durationSec ? formatTime(track.durationSec) : "Live"}
        </span>
      </div>
    </li>
  );
}

export function TrackList({ tracks, showBadge, showAlbum }: { tracks: Track[]; showBadge?: boolean; showAlbum?: boolean }) {
  return (
    <ol className="flex flex-col gap-0.5">
      {tracks.map((t, i) => (
        <TrackRow key={`${t.id}-${i}`} track={t} index={i} queue={tracks} showBadge={showBadge} showAlbum={showAlbum} />
      ))}
    </ol>
  );
}
