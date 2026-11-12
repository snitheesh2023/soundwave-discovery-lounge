import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Artwork } from "@/components/music/Artwork";
import { SourceBadge } from "@/components/music/SourceBadge";
import { SpotifyConnectCard } from "@/components/music/SpotifyConnect";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpotify, useSpotifyPlaylists } from "@/hooks/use-spotify";
import { DEMO_PLAYLISTS } from "@/lib/demo-data";
import type { Collection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar({ className }: { className?: string }) {
  const { status } = useSpotify();
  const playlistsQuery = useSpotifyPlaylists();
  const connected = status === "connected";
  const playlists: Collection[] = connected ? (playlistsQuery.data ?? []) : DEMO_PLAYLISTS;

  return (
    <aside className={cn("flex-col gap-2", className)} aria-label="Primary">
      <nav className="panel flex flex-col gap-1 p-3">
        <Logo className="mb-3 px-2 pt-1" />
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-surface-2 data-[status=active]:text-foreground [&[data-status=active]_svg]:text-primary"
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="panel flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Playlists</h2>
          {connected ? (
            <SourceBadge source="spotify" />
          ) : (
            <SourceBadge source="demo" />
          )}
        </div>
        <ul className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
          {connected && playlistsQuery.isLoading &&
            Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="size-11 rounded-md bg-surface-2" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4 bg-surface-2" />
                  <Skeleton className="h-3 w-1/2 bg-surface-2" />
                </div>
              </li>
            ))}
          {connected && playlistsQuery.isError && (
            <li className="p-3 text-sm text-muted-foreground">
              Couldn't load your playlists. {(playlistsQuery.error as Error).message}
            </li>
          )}
          {connected && playlistsQuery.isSuccess && playlists.length === 0 && (
            <li className="flex flex-col items-start gap-2 p-3 text-sm text-muted-foreground">
              <Plus className="size-4" /> No playlists yet. Create one in Spotify and it will show up here.
            </li>
          )}
          {playlists.map((p) => (
            <li key={p.id}>
              <Link
                to="/playlist/$id"
                params={{ id: p.id }}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-hover data-[status=active]:bg-surface-2"
              >
                <Artwork src={p.artworkUrl} hue={p.hue} seed={p.id} alt="" className="size-11 shrink-0" rounded="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Playlist · {p.trackCount} tracks
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="p-3 pt-0">
          <SpotifyConnectCard compact />
        </div>
      </div>
    </aside>
  );
}
