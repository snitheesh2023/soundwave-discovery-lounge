import { generatedArtStyle, hueFromString } from "@/lib/art";
import { cn } from "@/lib/utils";

interface ArtworkProps {
  src?: string;
  hue?: number;
  seed?: string;
  alt: string;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
  priority?: boolean;
}

const radius = { sm: "rounded-md", md: "rounded-lg", lg: "rounded-xl", full: "rounded-full" };

export function Artwork({ src, hue, seed, alt, className, rounded = "md", priority }: ArtworkProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn("aspect-square object-cover bg-surface-2", radius[rounded], className)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      style={generatedArtStyle(hue ?? hueFromString(seed ?? alt))}
      className={cn("relative aspect-square overflow-hidden", radius[rounded], className)}
    >
      <div className="absolute inset-0 art-rings" />
      <div className="absolute inset-0 art-grain opacity-60" />
    </div>
  );
}
