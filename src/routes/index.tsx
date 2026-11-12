import { createFileRoute, Link } from "@tanstack/react-router";
import { useHydrated } from "@tanstack/react-router";
import { Play, Sparkles } from "lucide-react";

import { Artwork } from "@/components/music/Artwork";
import { CollectionCard } from "@/components/music/CollectionCard";
import { SampleNotice } from "@/components/music/SampleNotice";
import { EmptyState, Section } from "@/components/music/Section";
import { SourceBadge } from "@/components/music/SourceBadge";
import { SpotifyConnectCard } from "@/components/music/SpotifyConnect";
import { TrackCardRow } from "@/components/music/TrackCard";
import { TrackList } from "@/components/music/TrackRow";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpotify, useSpotifyPlaylists, useSpotifyRecent, useSpotifyTop } from "@/hooks/use-spotify";
import { DEMO_MIXES, DEMO_PLAYLISTS, DEMO_RECENT, DEMO_TRENDING, tracksFor } from "@/lib/demo-data";
import { greetingFor } from "@/lib/format";
import { usePlayer } from "@/player/player-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home · Soundwave" },
      { name: "description", content: "Your Soundwave home: featured mixes, recently played and trending tracks." },
      { property: "og:title", content: "Home · Soundwave" },
      { property: "og:description", content: "Featured mixes, recently played and trending tracks in one dark music dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function Greeting() {
  const hydrated = useHydrated();
  const { profile, status } = useSpotify();
  const first = profile?.display_name?.split(" ")[0];
  const greeting = hydrated ? greetingFor(new Date().getHours()) : "Welcome back";
  return (
    <div className="relative overflow-hidden rounded-3xl bg-hero px-5 py-8 md:px-8 md:py-10">
      <div className="relative z-10 max-w-2xl animate-fade-up">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan">
          <Sparkles className="size-3.5" /> Tuned for you
        </p>
        <h1 className="text-4xl font-extrabold md:text-5xl">
          {greeting}
          {first ? <span className="text-signal">, {first}</span> : null}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {status === "connected"
            ? "Fresh picks from your Spotify library, plus anything you find on YouTube."
            : "Explore sample mixes, search YouTube, and connect Spotify to bring your own library."}
        </p>
      </div>
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 hidden size-72 rounded-full bg-signal opacity-20 blur-3xl md:block" />
    </div>
  );
}

function QuickPicks() {
  const player = usePlayer();
  const picks = DEMO_PLAYLISTS.slice(0, 6);
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {picks.map((p) => {
        const tracks = tracksFor(p);
        return (
          <div key={p.id} className="group relative flex items-center gap-3 overflow-hidden rounded-lg bg-surface-2 pr-3 transition-colors hover:bg-surface-hover">
            <Artwork src={p.artworkUrl} hue={p.hue} seed={p.id} alt="" rounded="sm" className="size-14 shrink-0 rounded-r-none" />
            <Link to="/playlist/$id" params={{ id: p.id }} className="min-w-0 flex-1 truncate text-sm font-semibold after:absolute after:inset-0">
              {p.title}
            </Link>
            <button
              type="button"
              aria-label={`Play ${p.title}`}
              onClick={() => tracks[0] && player.playTrack(tracks[0], tracks)}
              className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-glow transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
            >
              <Play className="size-4 translate-x-px fill-current" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex gap-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="w-40 shrink-0 space-y-2 p-2.5">
          <Skeleton className="aspect-square w-full rounded-xl bg-surface-2" />
          <Skeleton className="h-3 w-3/4 bg-surface-2" />
          <Skeleton className="h-3 w-1/2 bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

function HomePage() {
  const { status } = useSpotify();
  const connected = status === "connected";
  const recent = useSpotifyRecent();
  const top = useSpotifyTop();
  const playlists = useSpotifyPlaylists();
  const player = usePlayer();

  return (
    <div className="flex flex-col gap-10 pt-2">
      <Greeting />

      <Section title="Quick picks" eyebrow={<SourceBadge source="demo" />}>
        <QuickPicks />
      </Section>

      {connected && (
        <Section title="Your playlists" eyebrow={<SourceBadge source="spotify" />}>
          {playlists.isLoading ? (
            <RowSkeleton />
          ) : playlists.isError ? (
            <EmptyState title="Couldn't load your playlists">{(playlists.error as Error).message}</EmptyState>
          ) : (playlists.data ?? []).length === 0 ? (
            <EmptyState title="No playlists yet">Playlists you create or follow on Spotify will appear here.</EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 2xl:grid-cols-5">
              {(playlists.data ?? []).slice(0, 10).map((p) => (
                <CollectionCard key={p.id} collection={p} subtitle={`${p.trackCount} tracks${p.owner ? ` · ${p.owner}` : ""}`} />
              ))}
            </div>
          )}
        </Section>
      )}

      <Section title="Featured mixes" eyebrow="Hand-picked moods · sample">
        <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
          {DEMO_MIXES.map((m) => {
            const tracks = tracksFor(m);
            return (
              <CollectionCard
                key={m.id}
                collection={m}
                subtitle={m.tagline}
                onPlay={() => tracks[0] && player.playTrack(tracks[0], tracks)}
              />
            );
          })}
        </div>
      </Section>

      <Section title="Recently played" eyebrow={<SourceBadge source={connected ? "spotify" : "demo"} />}>
        {connected ? (
          recent.isLoading ? (
            <RowSkeleton />
          ) : recent.isError ? (
            <EmptyState title="Recently played isn't available">{(recent.error as Error).message}</EmptyState>
          ) : (recent.data ?? []).length === 0 ? (
            <EmptyState title="Nothing played yet">Play something on Spotify and it will show up here.</EmptyState>
          ) : (
            <TrackCardRow tracks={recent.data ?? []} />
          )
        ) : (
          <>
            <TrackCardRow tracks={DEMO_RECENT} />
            <SampleNotice />
          </>
        )}
      </Section>

      <Section
        title={connected ? "Your top tracks" : "Trending now"}
        eyebrow={<SourceBadge source={connected ? "spotify" : "demo"} />}
      >
        <div className="rounded-2xl bg-surface-2/40 p-2">
          {connected ? (
            top.isLoading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-surface-2" />
                ))}
              </div>
            ) : top.isError ? (
              <EmptyState title="Top tracks aren't available">{(top.error as Error).message}</EmptyState>
            ) : (top.data ?? []).length === 0 ? (
              <EmptyState title="Not enough listening yet">Spotify needs a little more listening history to work out your top tracks.</EmptyState>
            ) : (
              <TrackList tracks={top.data ?? []} />
            )
          ) : (
            <TrackList tracks={DEMO_TRENDING} />
          )}
        </div>
        {!connected && <SampleNotice />}
      </Section>

      <div className="lg:hidden">
        <SpotifyConnectCard />
      </div>
    </div>
  );
}
