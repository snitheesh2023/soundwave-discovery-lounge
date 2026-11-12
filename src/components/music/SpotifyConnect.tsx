import { Link } from "@tanstack/react-router";
import { Loader2, LogOut, PlugZap, Settings2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSpotify } from "@/hooks/use-spotify";

/** Compact top-bar control reflecting the real Spotify connection state. */
export function SpotifyConnectPill() {
  const { status, profile, connect, connecting, disconnect } = useSpotify();

  if (status === "checking") return <div className="h-9 w-32 rounded-full bg-surface-2" aria-hidden />;

  if (status === "unconfigured") {
    return (
      <Button variant="secondary" size="sm" asChild>
        <Link to="/connections" aria-label="Spotify is not configured. Open connection setup.">
          <PlugZap />
          <span className="hidden sm:inline">Spotify not configured</span>
          <span className="sm:hidden">Setup</span>
        </Link>
      </Button>
    );
  }

  if (status === "disconnected") {
    return (
      <Button variant="signal" size="sm" onClick={connect} disabled={connecting}>
        {connecting ? <Loader2 className="animate-spin" /> : <PlugZap />}
        Connect Spotify
      </Button>
    );
  }

  const name = profile?.display_name ?? "Spotify listener";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-surface-2 py-1 pl-1 pr-3 text-sm font-medium hover:bg-surface-hover"
          aria-label={`Signed in to Spotify as ${name}`}
        >
          <Avatar className="size-7">
            <AvatarImage src={profile?.images?.[0]?.url} alt="" />
            <AvatarFallback className="bg-signal text-xs font-bold text-primary-foreground">
              {name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate sm:inline">{name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate">{name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">Connected via Spotify</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/connections">
            <Settings2 /> Connections
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={disconnect}>
          <LogOut /> Disconnect Spotify
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Larger call-to-action card used in the sidebar and on pages showing sample data. */
export function SpotifyConnectCard({ compact = false }: { compact?: boolean }) {
  const { status, connect, connecting } = useSpotify();
  if (status === "connected" || status === "checking") return null;
  const unconfigured = status === "unconfigured";
  return (
    <div className="relative overflow-hidden rounded-xl bg-hero p-4">
      <p className="font-display text-base font-semibold">
        {unconfigured ? "You're viewing sample data" : "Bring your own library"}
      </p>
      {!compact && (
        <p className="mt-1 text-sm text-muted-foreground">
          {unconfigured
            ? "Spotify isn't set up for this app yet, so playlists and tracks here are made up."
            : "Connect with Spotify's official sign-in to see your playlists and recent plays."}
        </p>
      )}
      <div className="mt-3">
        {unconfigured ? (
          <Button size="sm" variant="secondary" asChild>
            <Link to="/connections">
              <Settings2 /> How to connect
            </Link>
          </Button>
        ) : (
          <Button size="sm" variant="signal" onClick={connect} disabled={connecting}>
            {connecting ? <Loader2 className="animate-spin" /> : <PlugZap />}
            Connect Spotify
          </Button>
        )}
      </div>
    </div>
  );
}
