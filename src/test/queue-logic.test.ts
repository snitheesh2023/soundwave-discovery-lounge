import { describe, expect, it } from "vitest";

import { cycleRepeat, indexAfterEnded, nextIndex, previousIndex } from "@/player/queue-logic";

const off = { shuffle: false, repeat: "off" as const };

describe("queue rules", () => {
  it("next stops at the end of the queue when repeat is off", () => {
    expect(nextIndex(3, 2, off)).toBeNull();
  });

  it("next wraps to the first track when repeat is all", () => {
    expect(nextIndex(3, 2, { shuffle: false, repeat: "all" })).toBe(0);
  });

  it("shuffle never picks the track that is playing", () => {
    expect(nextIndex(4, 1, { shuffle: true, repeat: "off" }, () => 0.5)).toBe(2);
    expect(nextIndex(4, 0, { shuffle: true, repeat: "off" }, () => 0)).toBe(1);
  });

  it("previous wraps to the last track only with repeat all", () => {
    expect(previousIndex(3, 0, "off")).toBeNull();
    expect(previousIndex(3, 0, "all")).toBe(2);
  });

  it("repeat one replays the same track when it ends", () => {
    expect(indexAfterEnded(3, 1, { shuffle: true, repeat: "one" })).toBe(1);
  });

  it("repeat cycles off → all → one → off", () => {
    expect(cycleRepeat("off")).toBe("all");
    expect(cycleRepeat("all")).toBe("one");
    expect(cycleRepeat("one")).toBe("off");
  });
});
