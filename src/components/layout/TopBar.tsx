import { useRouter } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { SpotifyConnectPill } from "@/components/music/SpotifyConnect";
import { Button } from "@/components/ui/button";
import { LogoMark } from "./Logo";

export function TopBar() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-surface/80 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-2">
        <LogoMark className="size-7 lg:hidden" />
        <div className="hidden items-center gap-1 lg:flex">
          <Button variant="secondary" size="icon-sm" aria-label="Go back" onClick={() => router.history.back()}>
            <ChevronLeft />
          </Button>
          <Button variant="secondary" size="icon-sm" aria-label="Go forward" onClick={() => router.history.forward()}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <SpotifyConnectPill />
    </header>
  );
}
