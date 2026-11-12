import { useEffect, type ReactNode } from "react";

import { MediaStage } from "@/components/player/MediaStage";
import { usePlayer } from "@/player/player-context";
import { MobileNav } from "./MobileNav";
import { MobileNowPlaying } from "./MobileNowPlaying";
import { PlayerBar } from "./PlayerBar";
import { RightPanel } from "./RightPanel";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useUi } from "./ui-context";

function useSpacebarToggle() {
  const { togglePlay } = usePlayer();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("input, textarea, select, button, a, [role=slider], [contenteditable=true]"))) return;
      e.preventDefault();
      togglePlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay]);
}

export function AppShell({ children }: { children: ReactNode }) {
  const { rightPanelOpen } = useUi();
  useSpacebarToggle();
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <a
        href="#main"
        className="sr-only z-[70] rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <div className="flex min-h-0 flex-1 gap-2 p-2 lg:pb-0">
        <Sidebar className="hidden w-[272px] shrink-0 lg:flex" />
        <main id="main" className="panel scrollbar-thin relative min-w-0 flex-1 overflow-y-auto">
          <TopBar />
          <div className="px-4 pb-10 md:px-6">{children}</div>
        </main>
        {rightPanelOpen && <RightPanel className="hidden w-[384px] shrink-0 xl:flex" />}
      </div>
      <div id="bottom-chrome" className="shrink-0">
        <PlayerBar />
        <MobileNav className="lg:hidden" />
      </div>
      <MobileNowPlaying />
      <MediaStage />
    </div>
  );
}
