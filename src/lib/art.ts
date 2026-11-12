import type { CSSProperties } from "react";

/** Deterministic generative artwork for tracks without cover images. */
export function generatedArtStyle(hue = 200): CSSProperties {
  const h2 = (hue + 70) % 360;
  const h3 = (hue + 200) % 360;
  return {
    backgroundImage: [
      `radial-gradient(circle at 25% 20%, oklch(0.88 0.17 ${hue} / 0.95), transparent 55%)`,
      `radial-gradient(circle at 85% 85%, oklch(0.62 0.2 ${h2} / 0.9), transparent 60%)`,
      `linear-gradient(135deg, oklch(0.32 0.08 ${h3}), oklch(0.2 0.05 ${hue}))`,
    ].join(","),
  };
}

export function hueFromString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) % 360;
  return h;
}
