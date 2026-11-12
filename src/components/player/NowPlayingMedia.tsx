import { Artwork } from "@/components/music/Artwork";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/player/player-context";
import { StageAnchor } from "./stage-anchor";

/** Shows the official embed (via the stage anchor) for YouTube/Spotify, or artwork for samples. */
export function NowPlayingMedia({ spotifyHeight = "h-[232px]", className }: { spotifyHeight?: string; className?: string }) {
  const { current, stageHidden } = usePlayer();
  if (!current) return null;
  if (current.source === "youtube" && !stageHidden) return <StageAnchor className={cn("aspect-video", className)} />;
  if (current.source === "spotify" && !stageHidden) return <StageAnchor className={cn(spotifyHeight, className)} />;
  return (
    <Artwork
      src={current.artworkUrl}
      hue={current.hue}
      seed={current.id}
      alt={`${current.title} artwork`}
      rounded="lg"
      className={cn("w-full shadow-panel", current.source === "youtube" && "aspect-video", className)}
    />
  );
}
