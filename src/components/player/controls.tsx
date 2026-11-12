import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/player/player-context";

export function TransportControls({ size = "md" }: { size?: "md" | "lg" }) {
  const p = usePlayer();
  const RepeatIcon = p.repeat === "one" ? Repeat1 : Repeat;
  const repeatLabel = { off: "Enable repeat", all: "Repeat one", one: "Disable repeat" }[p.repeat];
  return (
    <div className={cn("flex items-center", size === "lg" ? "gap-5" : "gap-2 md:gap-4")}>
      <Button
        variant="control"
        size="icon-sm"
        data-active={p.shuffle}
        aria-pressed={p.shuffle}
        aria-label={p.shuffle ? "Disable shuffle" : "Enable shuffle"}
        onClick={p.toggleShuffle}
      >
        <Shuffle />
      </Button>
      <Button variant="control" size="icon-sm" aria-label="Previous track" onClick={p.previous} disabled={!p.current}>
        <SkipBack className="fill-current" />
      </Button>
      <Button
        variant="play"
        size={size === "lg" ? "icon-lg" : "icon"}
        aria-label={p.isPlaying ? "Pause" : "Play"}
        onClick={p.togglePlay}
        disabled={!p.current}
        className={size === "lg" ? "size-16 [&_svg]:size-7" : undefined}
      >
        {p.buffering && p.isPlaying ? (
          <Loader2 className="animate-spin" />
        ) : p.isPlaying ? (
          <Pause className="fill-current" />
        ) : (
          <Play className="translate-x-px fill-current" />
        )}
      </Button>
      <Button variant="control" size="icon-sm" aria-label="Next track" onClick={p.next} disabled={!p.current}>
        <SkipForward className="fill-current" />
      </Button>
      <Button
        variant="control"
        size="icon-sm"
        data-active={p.repeat !== "off"}
        aria-label={repeatLabel}
        onClick={p.cycleRepeatMode}
        className="relative"
      >
        <RepeatIcon />
        {p.repeat !== "off" && <span aria-hidden className="absolute bottom-0.5 size-1 rounded-full bg-primary" />}
      </Button>
    </div>
  );
}

export function ProgressBar({ className }: { className?: string }) {
  const p = usePlayer();
  const [dragValue, setDragValue] = useState<number | null>(null);
  const duration = p.duration || p.current?.durationSec || 0;
  const value = dragValue ?? Math.min(p.position, duration || 0);
  const live = duration === 0 && p.current?.source === "youtube";
  return (
    <div className={cn("flex w-full items-center gap-2 text-[11px] tabular-nums text-muted-foreground", className)}>
      <span className="w-10 text-right">{formatTime(value)}</span>
      <Slider
        aria-label="Seek"
        min={0}
        max={Math.max(duration, 1)}
        step={1}
        value={[value]}
        disabled={!p.current || duration === 0}
        onValueChange={([v]) => setDragValue(v ?? 0)}
        onValueCommit={([v]) => {
          p.seek(v ?? 0);
          setDragValue(null);
        }}
      />
      <span className="w-10">{live ? "Live" : formatTime(duration)}</span>
    </div>
  );
}

export function VolumeControl({ className }: { className?: string }) {
  const p = usePlayer();
  const level = p.muted ? 0 : p.volume;
  const Icon = level === 0 ? VolumeX : level < 50 ? Volume1 : Volume2;
  const control = (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="control"
        size="icon-sm"
        aria-label={p.muted ? "Unmute" : "Mute"}
        onClick={p.toggleMute}
        disabled={!p.supportsVolume}
      >
        <Icon />
      </Button>
      <Slider
        aria-label="Volume"
        className="w-24"
        min={0}
        max={100}
        step={1}
        value={[level]}
        disabled={!p.supportsVolume}
        onValueChange={([v]) => p.setVolume(v ?? 0)}
      />
    </div>
  );
  if (p.supportsVolume) return control;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div tabIndex={0} className="rounded-full">{control}</div>
      </TooltipTrigger>
      <TooltipContent>Volume is controlled inside the Spotify player</TooltipContent>
    </Tooltip>
  );
}
