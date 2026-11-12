import { createFileRoute } from "@tanstack/react-router";

import { CollectionCard } from "@/components/music/CollectionCard";
import { SampleNotice } from "@/components/music/SampleNotice";
import { EmptyState, Section } from "@/components/music/Section";
import { SourceBadge } from "@/components/music/SourceBadge";
import { SpotifyConnectCard } from "@/components/music/SpotifyConnect";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpotify, useSpotifyPlaylists } from "@/hooks/use-spotify";
import { DEMO_PLAYLISTS } from "@/lib/demo-data";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Your Library · Soundwave" },
      { name: "description", content: "Your playlists from Spotify, or sample playlists in demo mode." },
      { property: "og:title", content: "Your Library · Soundwave" },
      { property: "og:description", content: "Browse your playlists in Soundwave." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { status } = useSpotify();
  const connected = status === "connected";
  const playlists = useSpotifyPlaylists();
  return (
    <div className="flex flex-col gap-8 pt-2">
      <h1 className="text-3xl font-extrabold md:text-4xl">Your Library</h1>
      {connected ? (
        <Section title="Playlists" eyebrow={<SourceBadge source="spotify" />}>
          {playlists.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-xl bg-surface-2" />
              ))}
            </div>
          ) : playlists.isError ? (
            <EmptyState title="Couldn't load your playlists">{(playlists.error as Error).message}</EmptyState>
          ) : (playlists.data ?? []).length === 0 ? (
            <EmptyState title="No playlists yet">Playlists you create or follow on Spotify will appear here.</EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
              {(playlists.data ?? []).map((p) => (
                <CollectionCard key={p.id} collection={p} subtitle={`${p.trackCount} tracks`} />
              ))}
            </div>
          )}
        </Section>
      ) : (
        <>
          <SpotifyConnectCard />
          <Section title="Sample playlists" eyebrow={<SourceBadge source="demo" />}>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
              {DEMO_PLAYLISTS.map((p) => (
                <CollectionCard key={p.id} collection={p} subtitle={p.tagline} />
              ))}
            </div>
            <SampleNotice what="These playlists" />
          </Section>
        </>
      )}
    </div>
  );
}
