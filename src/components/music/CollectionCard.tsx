import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

import type { Collection } from "@/lib/types";
import { Artwork } from "./Artwork";
import { SourceBadge } from "./SourceBadge";

interface CollectionCardProps {
  collection: Collection;
  subtitle?: string;
  onPlay?: () => void;
}

export function CollectionCard({ collection, subtitle, onPlay }: CollectionCardProps) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-xl p-3 transition-colors hover:bg-surface-hover animate-fade-up">
      <div className="relative">
        <Artwork
          src={collection.artworkUrl}
          hue={collection.hue}
          seed={collection.id}
          alt={`${collection.title} cover`}
          rounded="lg"
          className="w-full shadow-panel"
        />
        {onPlay && (
          <button
            type="button"
            onClick={onPlay}
            aria-label={`Play ${collection.title}`}
            className="absolute bottom-2 right-2 z-10 flex size-11 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-glow transition-all hover:scale-105 focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Play className="size-5 fill-current" />
          </button>
        )}
      </div>
      <div className="min-w-0">
        <Link
          to="/playlist/$id"
          params={{ id: collection.id }}
          className="block truncate font-semibold text-foreground after:absolute after:inset-0 focus-visible:outline-none"
        >
          {collection.title}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{subtitle ?? collection.description}</p>
        <SourceBadge source={collection.source} className="mt-2" />
      </div>
    </div>
  );
}
