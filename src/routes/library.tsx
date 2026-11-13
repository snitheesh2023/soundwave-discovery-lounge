import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileUp, Trash2 } from "lucide-react";

import { CollectionCard } from "@/components/music/CollectionCard";
import { SampleNotice } from "@/components/music/SampleNotice";
import { EmptyState, Section } from "@/components/music/Section";
import { SourceBadge } from "@/components/music/SourceBadge";
import { SpotifyConnectCard } from "@/components/music/SpotifyConnect";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpotify, useSpotifyPlaylists } from "@/hooks/use-spotify";
import { DEMO_PLAYLISTS } from "@/lib/demo-data";
import { getImportedPlaylists, parseSpotifyPlaylistCsv, saveImportedPlaylists, type ImportedPlaylist } from "@/lib/imported-playlists";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Your Library · Soundwave" },
      { name: "description", content: "Your Spotify playlists and imported playlists." },
      { property: "og:title", content: "Your Library · Soundwave" },
      { property: "og:description", content: "Browse your playlists in Soundwave." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

function ImportSpotifyPlaylist({ onImported }: { onImported: (playlist: ImportedPlaylist) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true); setError(null);
    try {
      const name = file.name.replace(/\.csv$/i, "").replace(/[_-]+/g, " ");
      onImported(parseSpotifyPlaylistCsv(await file.text(), name));
    } catch (e) { setError(e instanceof Error ? e.message : "Couldn't read that CSV."); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-2/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="font-semibold">Import a Spotify playlist</p><p className="text-sm text-muted-foreground">Choose a CSV export with Track Name and Artist Name columns. It stays in this browser.</p>{error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}</div>
      <input ref={inputRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={onFile} />
      <Button variant="secondary" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}><FileUp />{busy ? "Importing…" : "Choose CSV"}</Button>
    </div>
  );
}

function LibraryPage() {
  const { status } = useSpotify();
  const connected = status === "connected";
  const playlists = useSpotifyPlaylists();
  const [imported, setImported] = useState<ImportedPlaylist[]>([]);
  useEffect(() => setImported(getImportedPlaylists()), []);
  const addImported = (playlist: ImportedPlaylist) => { const next = [playlist, ...imported]; setImported(next); saveImportedPlaylists(next); };
  const removeImported = (id: string) => { const next = imported.filter((p) => p.id !== id); setImported(next); saveImportedPlaylists(next); };
  return (
    <div className="flex flex-col gap-8 pt-2">
      <h1 className="text-3xl font-extrabold md:text-4xl">Your Library</h1>
      <Section title="Import from Spotify" eyebrow={<SourceBadge source="spotify" />}>
        <ImportSpotifyPlaylist onImported={addImported} />
        <p className="px-1 text-xs text-muted-foreground">After importing, open a playlist and choose “Find YouTube matches” to play its tracks from YouTube.</p>
      </Section>
      {imported.length > 0 && <Section title="Imported playlists" eyebrow={<SourceBadge source="spotify" />}>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {imported.map((p) => <div key={p.id} className="relative"><CollectionCard collection={p} subtitle={p.trackCount + " tracks · imported"} /><Button variant="control" size="icon-sm" aria-label={"Remove " + p.title} className="absolute right-2 top-2 bg-background/80" onClick={() => removeImported(p.id)}><Trash2 /></Button></div>)}
        </div>
      </Section>}
      {connected ? (
        <Section title="Spotify playlists" eyebrow={<SourceBadge source="spotify" />}>
          {playlists.isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="aspect-square w-full rounded-xl bg-surface-2" />)}</div>
            : playlists.isError ? <EmptyState title="Couldn't load your Spotify playlists">Spotify's Developer app is blocking playlist access. Import a playlist CSV above to use its track list with YouTube.</EmptyState>
            : (playlists.data ?? []).length === 0 ? <EmptyState title="No playlists yet">Playlists you create or follow on Spotify will appear here.</EmptyState>
            : <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">{(playlists.data ?? []).map((p) => <CollectionCard key={p.id} collection={p} subtitle={p.trackCount + " tracks"} />)}</div>}
        </Section>
      ) : (
        <><SpotifyConnectCard /><Section title="Sample playlists" eyebrow={<SourceBadge source="demo" />}><div className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">{DEMO_PLAYLISTS.map((p) => <CollectionCard key={p.id} collection={p} subtitle={p.tagline} />)}</div><SampleNotice what="These playlists" /></Section></>
      )}
    </div>
  );
}
