import { ChevronDown, ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";

import { ProgressBar, TransportControls, VolumeControl } from "@/components/player/controls";
import { NowPlayingMedia } from "@/components/player/NowPlayingMedia";
import { PlaybackNotice } from "@/components/player/PlaybackNotice";
import { NowPlayingHeader, QueueList } from "@/components/player/QueueList";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/player/player-context";
import { useUi } from "./ui-context";

/** Full-screen now-playing view for small screens (and medium screens without the side panel). */
export function MobileNowPlaying() {
  const { nowPlayingOpen, setNowPlayingOpen } = useUi();
  const { current } = usePlayer();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!nowPlayingOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNowPlayingOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nowPlayingOpen, setNowPlayingOpen]);

  if (!nowPlayingOpen || !current) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Now playing" className="fixed inset-0 z-50 flex flex-col bg-hero animate-fade-up">
      <div className="mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-2">
        <Button ref={closeRef} variant="control" size="icon" aria-label="Close now playing" onClick={() => setNowPlayingOpen(false)}>
          <ChevronDown className="size-6" />
        </Button>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Now playing</p>
        <span className="size-9" />
      </div>
      <div className="mx-auto w-full max-w-lg px-4">
        <NowPlayingMedia spotifyHeight="h-[232px]" />
      </div>
      <div className="scrollbar-thin mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pt-5 pb-8">
        <NowPlayingHeader />
        <ProgressBar />
        <div className="flex justify-center">
          <TransportControls size="lg" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <VolumeControl />
          {current.externalUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={current.externalUrl} target="_blank" rel="noreferrer">
                <ExternalLink /> {current.source === "youtube" ? "YouTube" : "Spotify"}
              </a>
            </Button>
          )}
        </div>
        <PlaybackNotice />
        <div className="rounded-2xl bg-surface/70 p-3">
          <QueueList />
        </div>
      </div>
    </div>
  );
}
