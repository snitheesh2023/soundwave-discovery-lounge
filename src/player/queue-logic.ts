export type RepeatMode = "off" | "all" | "one";

export interface QueueOptions {
  shuffle: boolean;
  repeat: RepeatMode;
}

/** Index to play when the user presses "next". Returns null when playback should stop. */
export function nextIndex(
  length: number,
  current: number,
  { shuffle, repeat }: QueueOptions,
  random: () => number = Math.random,
): number | null {
  if (length <= 0) return null;
  if (shuffle && length > 1) {
    let r = Math.floor(random() * (length - 1));
    if (r >= current) r += 1;
    return r;
  }
  if (current + 1 < length) return current + 1;
  return repeat === "all" ? 0 : null;
}

/** Index to play when the user presses "previous". */
export function previousIndex(length: number, current: number, repeat: RepeatMode): number | null {
  if (length <= 0) return null;
  if (current > 0) return current - 1;
  return repeat === "all" ? length - 1 : null;
}

/** Index to play automatically when a track finishes. Repeat-one replays the same track. */
export function indexAfterEnded(
  length: number,
  current: number,
  options: QueueOptions,
  random: () => number = Math.random,
): number | null {
  if (length <= 0) return null;
  if (options.repeat === "one") return current;
  return nextIndex(length, current, options, random);
}

/** "Previous" restarts the current track if more than this many seconds have played. */
export const RESTART_THRESHOLD_SEC = 3;

export function cycleRepeat(mode: RepeatMode): RepeatMode {
  return mode === "off" ? "all" : mode === "all" ? "one" : "off";
}
