import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { isMediaSource, usePlayer } from "@/player/player-context";
import { stageAnchors } from "./stage-anchor";

const FLOAT_HEADER = 32;

function place(el: HTMLDivElement, source: "youtube" | "spotify") {
  for (let i = stageAnchors.length - 1; i >= 0; i--) {
    const r = stageAnchors[i]!.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      el.dataset["mode"] = "anchored";
      el.style.top = `${r.top}px`;
      el.style.left = `${r.left}px`;
      el.style.width = `${r.width}px`;
      el.style.height = `${r.height}px`;
      return;
    }
  }
  const vw = window.innerWidth;
  const gap = vw >= 1024 ? 16 : 8;
  const width = Math.min(400, vw - gap * 2);
  const height = (source === "youtube" ? (width * 9) / 16 : 152) + FLOAT_HEADER;
  const chrome = document.getElementById("bottom-chrome");
  const bottom = chrome ? chrome.getBoundingClientRect().top : window.innerHeight;
  el.dataset["mode"] = "floating";
  el.style.top = `${bottom - gap - height}px`;
  el.style.left = `${vw - gap - width}px`;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
}

/**
 * Single persistent host for the official YouTube and Spotify embed players. It is never
 * hidden while media plays: closing it pauses playback (no background/hidden playback).
 */
export function MediaStage() {
  const p = usePlayer();
  const ref = useRef<HTMLDivElement>(null);
  const source = p.current?.source;
  const active = isMediaSource(source) && !p.stageHidden;
  const { registerHost } = p;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!active || !isMediaSource(source)) {
      el.dataset["mode"] = "hidden";
      return;
    }
    let raf = 0;
    const tick = () => {
      place(el, source);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [active, source]);

  return (
    <div
      ref={ref}
      data-mode="hidden"
      role="region"
      aria-label={source === "youtube" ? "YouTube player" : "Spotify player"}
      className="group fixed left-0 top-0 z-[60] flex h-px w-px flex-col overflow-hidden rounded-xl bg-surface-2 data-[mode=floating]:shadow-panel data-[mode=floating]:ring-1 data-[mode=floating]:ring-border data-[mode=hidden]:pointer-events-none data-[mode=hidden]:invisible"
    >
      <div className="hidden h-8 shrink-0 items-center justify-between gap-2 px-3 text-xs text-muted-foreground group-data-[mode=floating]:flex">
        <span className="truncate">
          {source === "youtube" ? "YouTube official player · ads may play" : "Spotify official player"}
        </span>
        <button
          type="button"
          onClick={p.hideStage}
          className="rounded-full p-1 hover:bg-surface-hover hover:text-foreground"
          aria-label="Close player (pauses playback)"
          title="Close player (pauses playback)"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        <div
          ref={(el) => registerHost("youtube", el)}
          className={cn("media-host absolute inset-0", source !== "youtube" && "hidden")}
        />
        <div
          ref={(el) => registerHost("spotify", el)}
          className={cn("media-host absolute inset-0", source !== "spotify" && "hidden")}
        />
      </div>
    </div>
  );
}
