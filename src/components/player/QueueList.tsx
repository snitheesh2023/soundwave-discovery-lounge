import { Pause, Play, X } from "lucide-react";

import { Artwork } from "@/components/music/Artwork";
import { EqBars } from "@/components/music/EqBars";
import { SourceBadge } from "@/components/music/SourceBadge";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/player/player-context";

export function QueueList() {
  const p = usePlayer();
  const upNext = p.queue.map((t, i) => ({ t, i })).filter(({ i }) => i > p.index);
  return (
    <div className="flex flex-col gap-2">
      <h3 className="px-1 text-sm font-semibold">
        Next up <span className="font-normal text-muted-foreground">· {upNext.length} tracks</span>
      </h3>
      {upNext.length === 0 ? (
        <p className="px-1 text-sm text-muted-foreground">
          Your queue is empty. Use the <span className="font-semibold text-foreground">add to queue</span> button on any track.
        </p>
      ) : (
        <ol className="flex flex-col gap-0.5">
          {upNext.map(({ t, i }) => (
            <li key={`${t.id}-${i}`} className="group flex items-center gap-3 rounded-lg p-1.5 hover:bg-surface-hover">
              <button
                type="button"
                className="relative shrink-0"
                aria-label={`Play ${t.title}`}
                onClick={() => p.playIndex(i)}
              >
                <Artwork src={t.artworkUrl} hue={t.hue} seed={t.id} alt="" className="size-10" rounded="sm" />
                <span className="absolute inset-0 flex items-center justify-center rounded-md bg-background/60 opacity-0 group-hover:opacity-100">
                  <Play className="size-4 fill-current" />
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
              </div>
              <SourceBadge source={t.source} className="hidden 2xl:inline-flex" />
              <button
                type="button"
                aria-label={`Remove ${t.title} from queue`}
                onClick={() => p.removeFromQueue(i)}
                className="rounded-full p-1 text-muted-foreground opacity-0 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function NowPlayingHeader() {
  const p = usePlayer();
  const c = p.current;
  if (!c) return null;
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={cn("truncate font-display text-xl font-bold")}>{c.title}</p>
        <p className="truncate text-sm text-muted-foreground">{c.artist}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 pt-1">
        {p.isPlaying && <EqBars />}
        <SourceBadge source={c.source} />
      </div>
    </div>
  );
}

export function PlayPauseIcon({ playing }: { playing: boolean }) {
  return playing ? <Pause className="fill-current" /> : <Play className="translate-x-px fill-current" />;
}
