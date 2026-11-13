import { useCallback } from "react";

import { cn } from "@/lib/utils";

/**
 * The official embed players live in one persistent element (MediaStage) so playback never
 * restarts when layouts change. Anchors mark where that element should be drawn; the
 * most recently mounted visible anchor wins, otherwise the stage floats above the player bar.
 */
export const stageAnchors: HTMLElement[] = [];

export function StageAnchor({ className }: { className?: string }) {
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      stageAnchors.push(el);
      return () => {
        const i = stageAnchors.indexOf(el);
        if (i >= 0) stageAnchors.splice(i, 1);
      };
    }
    return undefined;
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("w-full rounded-xl bg-surface-2", className)}
    />
  );
}
