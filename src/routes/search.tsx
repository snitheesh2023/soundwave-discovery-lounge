import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, Link2, Loader2, PlugZap, Play, Search as SearchIcon, X, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

import { CollectionCard } from "@/components/music/CollectionCard";
import { SampleNotice } from "@/components/music/SampleNotice";
import { EmptyState, Section } from "@/components/music/Section";
import { SourceBadge } from "@/components/music/SourceBadge";
import { TrackList } from "@/components/music/TrackRow";
import { VideoCard } from "@/components/music/VideoCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounced } from "@/hooks/use-debounced";
import { useSpotify } from "@/hooks/use-spotify";
import { useYouTubeSearch, useYouTubeStatus } from "@/hooks/use-youtube";
import { generatedArtStyle } from "@/lib/art";
import { BROWSE_GENRES, DEMO_PLAYLISTS, searchDemoTracks, YOUTUBE_EXAMPLE_URL } from "@/lib/demo-data";
import { spotifyApi } from "@/lib/spotify";
import type { Track } from "@/lib/types";
import { parseYouTubeId, youTubeWatchUrl } from "@/lib/youtube-url";
import { usePlayer } from "@/player/player-context";

type Tab = "all" | "spotify" | "youtube";
const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "spotify", label: "Spotify" },
  { id: "youtube", label: "YouTube" },
];

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string; tab?: Tab } => ({
    q: typeof search.q === "string" && search.q ? search.q.slice(0, 200) : undefined,
    tab: search.tab === "spotify" || search.tab === "youtube" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search · Soundwave" },
      { name: "description", content: "Search the Spotify catalog and YouTube videos, then play them in the official players." },
      { property: "og:title", content: "Search · Soundwave" },
      { property: "og:description", content: "Search Spotify and YouTube from one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

function youTubeLinkTrack(id: string): Track {
  return {
    id: `youtube:${id}`,
    title: "YouTube video",
    artist: "Pasted link",
    durationSec: 0,
    artworkUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    source: "youtube",
    youtubeId: id,
    externalUrl: youTubeWatchUrl(id),
  };
}

function SearchPage() {
  const { q = "", tab = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [input, setInput] = useState(q);
  const debounced = useDebounced(input, 400);

  useEffect(() => setInput(q), [q]);
  useEffect(() => {
    if (debounced.trim() === q) return;
    void navigate({ search: (prev) => ({ ...prev, q: debounced.trim() || undefined }), replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const query = q.trim();
  const ytLinkId = parseYouTubeId(input);

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold md:text-4xl">Search</h1>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ search: (prev) => ({ ...prev, q: input.trim() || undefined }) });
          }}
          className="relative max-w-2xl"
        >
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <label htmlFor="search-input" className="sr-only">
            Search songs, artists or paste a YouTube link
          </label>
          <input
            id="search-input"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Songs, artists, or paste a YouTube link"
            className="h-12 w-full rounded-full border border-input bg-surface-2 pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:border-cyan focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          {input && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </form>
        <div role="tablist" aria-label="Search source" className="flex gap-2">
          {TABS.map((t) => (
            <Button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              variant="chip"
              size="sm"
              data-active={tab === t.id}
              onClick={() => void navigate({ search: (prev) => ({ ...prev, tab: t.id === "all" ? undefined : t.id }), replace: true })}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {ytLinkId ? (
        <YouTubeLinkResult id={ytLinkId} />
      ) : !query ? (
        <BrowseView />
      ) : (
        <div className="flex flex-col gap-10">
          {(tab === "all" || tab === "spotify") && <SpotifyResults query={query} limit={tab === "all" ? 6 : undefined} />}
          {(tab === "all" || tab === "youtube") && <YouTubeResults query={query} limit={tab === "all" ? 6 : undefined} />}
        </div>
      )}
    </div>
  );
}

function YouTubeLinkResult({ id }: { id: string }) {
  const player = usePlayer();
  const track = youTubeLinkTrack(id);
  return (
    <div className="flex max-w-2xl flex-col gap-4 rounded-2xl bg-surface-2 p-4 sm:flex-row sm:items-center">
      <img src={track.artworkUrl} alt="" className="aspect-video w-full rounded-lg object-cover sm:w-56" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <SourceBadge source="youtube" className="self-start" />
        <p className="font-semibold">Play this YouTube link</p>
        <p className="text-sm text-muted-foreground">
          Opens in YouTube's official player. Ads and availability are controlled by YouTube.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => player.playTrack(track)}>
            <Play className="fill-current" /> Play video
          </Button>
          <Button variant="outline" asChild>
            <a href={track.externalUrl} target="_blank" rel="noreferrer">
              Open on YouTube
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function BrowseView() {
  const navigate = useNavigate({ from: "/search" });
  return (
    <div className="flex flex-col gap-10">
      <Section title="Browse moods & genres">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {BROWSE_GENRES.map((g) => (
            <button
              key={g.name}
              type="button"
              onClick={() => void navigate({ search: (prev) => ({ ...prev, q: g.name }) })}
              style={generatedArtStyle(g.hue)}
              className="relative aspect-[16/10] overflow-hidden rounded-xl p-4 text-left transition-transform hover:scale-[1.02] focus-visible:scale-[1.02]"
            >
              <span className="absolute inset-0 art-rings" aria-hidden />
              <span className="relative font-display text-lg font-bold text-foreground drop-shadow">{g.name}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Try the YouTube player" eyebrow={<SourceBadge source="youtube" />}>
        <div className="flex max-w-2xl flex-col gap-3 rounded-2xl border border-border bg-surface-2/50 p-4">
          <p className="flex items-center gap-2 text-sm">
            <Link2 className="size-4 text-cyan" /> Paste any YouTube link into the search box to play it — no setup needed.
          </p>
          <div>
            <Button variant="secondary" size="sm" onClick={() => void navigate({ search: (prev) => ({ ...prev, q: YOUTUBE_EXAMPLE_URL }) })}>
              <Youtube /> Use an example link
            </Button>
          </div>
        </div>
      </Section>
      <Section title="Sample playlists" eyebrow={<SourceBadge source="demo" />}>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 2xl:grid-cols-6">
          {DEMO_PLAYLISTS.map((p) => (
            <CollectionCard key={p.id} collection={p} subtitle={p.tagline} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full bg-surface-2" />
      ))}
    </div>
  );
}

function SpotifyResults({ query, limit }: { query: string; limit?: number }) {
  const { status, connect, connecting } = useSpotify();
  const results = useQuery({
    queryKey: ["spotify", "search", query],
    queryFn: () => spotifyApi.searchTracks(query),
    enabled: status === "connected",
    staleTime: 5 * 60_000,
    retry: false,
  });

  if (status === "connected") {
    const items = results.data ?? [];
    return (
      <Section title="Spotify tracks" eyebrow={<SourceBadge source="spotify" />}>
        {results.isLoading ? (
          <ListSkeleton />
        ) : results.isError ? (
          <EmptyState title="Spotify search failed">{(results.error as Error).message}</EmptyState>
        ) : items.length === 0 ? (
          <EmptyState icon={<SearchIcon />} title={`No Spotify tracks for “${query}”`}>
            Try a different spelling or fewer words.
          </EmptyState>
        ) : (
          <TrackList tracks={limit ? items.slice(0, limit) : items} />
        )}
      </Section>
    );
  }

  const sample = searchDemoTracks(query);
  return (
    <Section title="Spotify tracks" eyebrow={<SourceBadge source="spotify" />}>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {status === "unconfigured"
            ? "Spotify catalog search isn't set up for this app yet."
            : "Connect Spotify to search its full catalog."}
        </p>
        {status === "disconnected" ? (
          <Button variant="signal" size="sm" onClick={connect} disabled={connecting}>
            {connecting ? <Loader2 className="animate-spin" /> : <PlugZap />} Connect Spotify
          </Button>
        ) : (
          <Button variant="secondary" size="sm" asChild>
            <Link to="/connections">
              <KeyRound /> Setup guide
            </Link>
          </Button>
        )}
      </div>
      {sample.length > 0 ? (
        <>
          <h3 className="px-1 pt-2 text-sm font-semibold text-muted-foreground">Matches in the sample catalog</h3>
          <TrackList tracks={limit ? sample.slice(0, limit) : sample} />
          <SampleNotice what="These results" />
        </>
      ) : (
        <p className="px-1 text-sm text-muted-foreground">
          No sample tracks match “{query}”. Try “neon”, “harbor” or “Mira”.
        </p>
      )}
    </Section>
  );
}

function YouTubeResults({ query, limit }: { query: string; limit?: number }) {
  const status = useYouTubeStatus();
  const configured = status.data?.configured === true;
  const results = useYouTubeSearch(query, configured);

  let body: React.ReactNode;
  if (status.isLoading) body = <ListSkeleton />;
  else if (!configured) {
    body = (
      <EmptyState
        icon={<Youtube />}
        title="YouTube search isn't configured"
        action={
          <Button variant="secondary" size="sm" asChild>
            <Link to="/connections">
              <KeyRound /> How to add a YouTube API key
            </Link>
          </Button>
        }
      >
        You can still paste any YouTube link into the search box to play it in the official YouTube player.
      </EmptyState>
    );
  } else if (results.isLoading) body = <ListSkeleton />;
  else if (results.isError) {
    body = <EmptyState title="YouTube search failed">{(results.error as Error).message}</EmptyState>;
  } else if (results.data?.error) {
    body = <EmptyState title="YouTube search failed">{results.data.error}</EmptyState>;
  } else {
    const items = results.data?.items ?? [];
    body =
      items.length === 0 ? (
        <EmptyState icon={<SearchIcon />} title={`No embeddable videos for “${query}”`}>
          Only videos whose owners allow embedding are shown.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {(limit ? items.slice(0, limit) : items).map((t) => (
            <VideoCard key={t.id} track={t} queue={items} />
          ))}
        </div>
      );
  }

  return (
    <Section title="YouTube videos" eyebrow={<SourceBadge source="youtube" />}>
      {body}
      {configured && (
        <p className="px-1 text-xs text-muted-foreground">
          Videos play in YouTube's official player. YouTube may show ads.
        </p>
      )}
    </Section>
  );
}
