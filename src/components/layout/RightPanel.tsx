import { ExternalLink, PanelRightClose } from "lucide-react";

import { NowPlayingMedia } from "@/components/player/NowPlayingMedia";
import { PlaybackNotice } from "@/components/player/PlaybackNotice";
import { NowPlayingHeader, QueueList } from "@/components/player/QueueList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/player/player-context";
import { useUi } from "./ui-context";

export function RightPanel({ className }: { className?: string }) {
  const { current } = usePlayer();
  const { toggleRightPanel } = useUi();
  return (
    <aside className={cn("panel flex-col overflow-hidden", className)} aria-label="Now playing and queue">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <h2 className="text-sm font-semibold">Now playing</h2>
        <Button variant="control" size="icon-sm" aria-label="Hide now playing panel" onClick={toggleRightPanel}>
          <PanelRightClose />
        </Button>
      </div>
      <div className="flex flex-col gap-4 px-3 pb-4">
        <NowPlayingMedia />
        <div className="space-y-3 px-1">
          <NowPlayingHeader />
          <PlaybackNotice />
          {current?.externalUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={current.externalUrl} target="_blank" rel="noreferrer">
                <ExternalLink /> Open on {current.source === "youtube" ? "YouTube" : current.source === "audius" ? "Audius" : "Spotify"}
              </a>
            </Button>
          )}
        </div>
      </div>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto border-t border-border px-3 py-4">
        <QueueList />
      </div>
    </aside>
  );
}
