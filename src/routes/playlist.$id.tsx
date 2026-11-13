import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Play, Youtube } from "lucide-react";

import { Artwork } from "@/components/music/Artwork";
import { SampleNotice } from "@/components/music/SampleNotice";
import { EmptyState } from "@/components/music/Section";
import { SourceBadge } from "@/components/music/SourceBadge";
import { TrackList } from "@/components/music/TrackRow";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpotify } from "@/hooks/use-spotify";
import { useYouTubeStatus } from "@/hooks/use-youtube";
import { findDemoCollection, tracksFor } from "@/lib/demo-data";
import { spotifyApi } from "@/lib/spotify";
import { getImportedPlaylists, saveImportedPlaylists, type ImportedPlaylist } from "@/lib/imported-playlists";
import { searchYouTube } from "@/lib/youtube.functions";
import { youTubeWatchUrl } from "@/lib/youtube-url";
import type { Collection, Track } from "@/lib/types";
import { usePlayer } from "@/player/player-context";

export const Route = createFileRoute("/playlist/$id")({
  head: () => ({
    meta: [
      { title: "Playlist · Soundwave" },
      { name: "description", content: "Browse and play a playlist in Soundwave." },
      { property: "og:title", content: "Playlist · Soundwave" },
      { property: "og:description", content: "Browse and play a playlist in Soundwave." },
      { property: "og:type", content: "music.playlist" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlaylistPage,
});

function Header({ collection, tracks }: { collection: Collection; tracks: Track[] }) {
  const player = usePlayer();
  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-hero p-5 sm:flex-row sm:items-end md:p-8">
      <Artwork src={collection.artworkUrl} hue={collection.hue} seed={collection.id} alt={`${collection.title} cover`} rounded="lg" priority className="w-40 shadow-panel md:w-52" />
      <div className="min-w-0 flex-1 space-y-3">
        <SourceBadge source={collection.source} />
        <h1 className="text-3xl font-extrabold md:text-5xl">{collection.title}</h1>
        <p className="text-sm text-muted-foreground">{collection.description}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="play" size="icon-lg" aria-label={`Play ${collection.title}`} disabled={tracks.length === 0} onClick={() => tracks[0] && player.playTrack(tracks[0], tracks)}>
            <Play className="translate-x-px fill-current" />
          </Button>
          <span className="text-sm text-muted-foreground">{tracks.length || collection.trackCount} tracks</span>
          {collection.externalUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={collection.externalUrl} target="_blank" rel="noreferrer"><ExternalLink /> Open on Spotify</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PlaylistPage() {
  const { id } = Route.useParams();
  const demo = findDemoCollection(id);
  const { status } = useSpotify();
  const [imported, setImported] = useState<ImportedPlaylist | undefined>(() => getImportedPlaylists().find((p) => p.id === id));
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const youtubeStatus = useYouTubeStatus();
  useEffect(() => { setImported(getImportedPlaylists().find((p) => p.id === id)); }, [id]);
  const enabled = !demo && !imported && status === "connected";
  const meta = useQuery({ queryKey: ["spotify", "playlist", id], queryFn: () => spotifyApi.playlist(id), enabled, retry: false });
  const tracks = useQuery({ queryKey: ["spotify", "playlist", id, "tracks"], queryFn: () => spotifyApi.playlistTracks(id), enabled, retry: false });

  if (imported) {
    const matched = imported.tracks.filter((t) => t.source === "youtube" && t.youtubeId);
    const findMatches = async () => {
      setMatching(true); setMatchError(null);
      try {
        const out: Track[] = [];
        for (let start = 0; start < imported.tracks.length; start += 4) {
          const batch = imported.tracks.slice(start, start + 4);
          const found = await Promise.all(batch.map(async (track) => {
            const result = await searchYouTube({ data: { q: `${track.title} ${track.artist} official audio` } });
            const video = result.items[0];
            if (!video?.youtubeId) return null;
            return { ...video, title: track.title, artist: track.artist, album: track.album, source: "youtube" as const, externalUrl: youTubeWatchUrl(video.youtubeId) };
          }));
          out.push(...found.filter((t): t is Track => Boolean(t)));
        }
        const updated = { ...imported, tracks: out, trackCount: out.length };
        saveImportedPlaylists(getImportedPlaylists().map((p) => p.id === id ? updated : p)); setImported(updated);
        if (!out.length) setMatchError("No YouTube matches found. Check YouTube search setup and try again.");
      } catch (e) { setMatchError(e instanceof Error ? e.message : "YouTube matching failed."); }
      finally { setMatching(false); }
    };
    return <div className="flex flex-col gap-6 pt-2"><Header collection={imported} tracks={imported.tracks} />
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-2/40 p-4">
        <div className="flex-1 text-sm text-muted-foreground">{matched.length ? `${matched.length} tracks matched to YouTube.` : "Find playable YouTube videos for this Spotify playlist."}{matchError && <p role="alert" className="mt-1 text-destructive">{matchError}</p>}</div>
        <Button onClick={findMatches} disabled={matching || youtubeStatus.data?.configured !== true}><Youtube />{matching ? "Finding matches…" : matched.length ? "Refresh YouTube matches" : "Find YouTube matches"}</Button>
        {youtubeStatus.data?.configured === false && <p className="w-full text-xs text-muted-foreground">YouTube search needs an API key. Add it in Connections.</p>}
      </div>
      {imported.tracks.length ? <TrackList tracks={imported.tracks} showBadge /> : <EmptyState title="No tracks found in this import" />}
      <p className="text-xs text-muted-foreground">Video matches may differ from the original recording. Playback uses YouTube’s official player and may include ads.</p>
    </div>;
  }

  if (demo) {
    const list = tracksFor(demo);
    return (
      <div className="flex flex-col gap-6 pt-2">
        <Header collection={demo} tracks={list} />
        <TrackList tracks={list} showBadge={false} />
        <SampleNotice what="This playlist and its tracks" />
      </div>
    );
  }

  if (status === "checking") return <Skeleton className="mt-2 h-64 w-full rounded-3xl bg-surface-2" />;
  if (status !== "connected") {
    return (
      <EmptyState className="mt-6" title="Connect Spotify to open this playlist" action={<Button asChild variant="secondary"><Link to="/library">Back to library</Link></Button>}>
        This looks like a Spotify playlist. Connect your account to view it.
      </EmptyState>
    );
  }
  if (meta.isLoading) return <Skeleton className="mt-2 h-64 w-full rounded-3xl bg-surface-2" />;
  if (meta.isError || !meta.data) {
    return <EmptyState className="mt-6" title="Playlist unavailable">{(meta.error as Error | null)?.message ?? "Not found."}</EmptyState>;
  }
  return (
    <div className="flex flex-col gap-6 pt-2">
      <Header collection={meta.data} tracks={tracks.data ?? []} />
      {tracks.isLoading ? (
        <Skeleton className="h-40 w-full bg-surface-2" />
      ) : tracks.isError ? (
        <EmptyState title="Couldn't load tracks">{(tracks.error as Error).message}</EmptyState>
      ) : (tracks.data ?? []).length === 0 ? (
        <EmptyState title="This playlist is empty" />
      ) : (
        <TrackList tracks={tracks.data ?? []} showBadge={false} />
      )}
    </div>
  );
}
