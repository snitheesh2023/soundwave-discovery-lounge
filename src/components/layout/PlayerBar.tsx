import { ListMusic, SkipForward } from "lucide-react";

import { Artwork } from "@/components/music/Artwork";
import { SourceBadge } from "@/components/music/SourceBadge";
import { ProgressBar, TransportControls, VolumeControl } from "@/components/player/controls";
import { PlayPauseIcon } from "@/components/player/QueueList";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/player/player-context";
import { useUi } from "./ui-context";

function isWide() {
  return window.matchMedia("(min-width: 1280px)").matches;
}

export function PlayerBar() {
  const p = usePlayer();
  const ui = useUi();
  const c = p.current;

  const openNowPlaying = () => {
    if (isWide()) {
      if (!ui.rightPanelOpen) ui.toggleRightPanel();
    } else ui.setNowPlayingOpen(true);
  };
  const toggleQueue = () => (isWide() ? ui.toggleRightPanel() : ui.setNowPlayingOpen(true));
  const pct = c && p.duration ? Math.min(100, (p.position / p.duration) * 100) : 0;

  return (
    <>
      {/* Desktop / tablet landscape */}
      <div
        role="region"
        aria-label="Player controls"
        className="hidden h-[84px] grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-center gap-4 px-4 lg:grid"
      >
        <div className="flex min-w-0 items-center gap-3">
          {c && (
            <>
              <button type="button" onClick={openNowPlaying} aria-label="Show now playing" className="shrink-0 rounded-md">
                <Artwork src={c.artworkUrl} hue={c.hue} seed={c.id} alt="" className="size-14" rounded="sm" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{c.title}</p>
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-xs text-muted-foreground">{c.artist}</p>
                  <SourceBadge source={c.source} />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <TransportControls />
          <ProgressBar className="max-w-xl" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="control"
            size="icon-sm"
            aria-label="Toggle now playing and queue"
            data-active={ui.rightPanelOpen}
            onClick={toggleQueue}
          >
            <ListMusic />
          </Button>
          <VolumeControl />
        </div>
      </div>

      {/* Mobile mini player */}
      {c && (
        <div className="px-2 pt-1 lg:hidden">
          <div className="relative flex items-center gap-3 overflow-hidden rounded-xl bg-surface-2 p-2 shadow-panel">
            <button
              type="button"
              onClick={() => ui.setNowPlayingOpen(true)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              aria-label={`Open now playing: ${c.title} by ${c.artist}`}
            >
              <Artwork src={c.artworkUrl} hue={c.hue} seed={c.id} alt="" className="size-11 shrink-0" rounded="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{c.title}</p>
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-xs text-muted-foreground">{c.artist}</p>
                  <SourceBadge source={c.source} className="hidden sm:inline-flex" />
                </div>
              </div>
            </button>
            <Button variant="play" size="icon" aria-label={p.isPlaying ? "Pause" : "Play"} onClick={p.togglePlay}>
              <PlayPauseIcon playing={p.isPlaying} />
            </Button>
            <Button variant="control" size="icon-sm" aria-label="Next track" onClick={p.next}>
              <SkipForward className="fill-current" />
            </Button>
            <div aria-hidden className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-foreground/10">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
