import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { createStableContext } from "@/lib/stable-context";

import {
  beginSpotifyLogin,
  clearSpotifySession,
  getSpotifyClientId,
  hasSpotifySession,
  SpotifyApiError,
  spotifyApi,
  type SpotifyProfile,
} from "@/lib/spotify";

/**
 * checking     – before hydration we don't know yet
 * unconfigured – no Spotify Client ID set for this deployment (demo mode)
 * disconnected – configured, user has not connected
 * connected    – user completed the official Spotify OAuth flow
 */
export type SpotifyStatus = "checking" | "unconfigured" | "disconnected" | "connected";

interface SpotifyContextValue {
  status: SpotifyStatus;
  configured: boolean;
  profile: SpotifyProfile | undefined;
  connecting: boolean;
  connect: () => void;
  disconnect: () => void;
  markConnected: () => void;
}

const SpotifyContext = createStableContext<SpotifyContextValue | null>("SpotifyContext", null);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const configured = Boolean(getSpotifyClientId());
  const [status, setStatus] = useState<SpotifyStatus>("checking");
  const [connecting, setConnecting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!configured) setStatus("unconfigured");
    else setStatus(hasSpotifySession() ? "connected" : "disconnected");
  }, [configured]);

  const profileQuery = useQuery({
    queryKey: ["spotify", "me"],
    queryFn: spotifyApi.me,
    enabled: status === "connected",
    staleTime: 5 * 60_000,
    retry: false,
  });

  const disconnect = useCallback(() => {
    clearSpotifySession();
    queryClient.removeQueries({ queryKey: ["spotify"] });
    setStatus(configured ? "disconnected" : "unconfigured");
  }, [configured, queryClient]);

  useEffect(() => {
    const err = profileQuery.error;
    if (err instanceof SpotifyApiError && err.status === 401) {
      toast.error("Your Spotify session ended. Connect again to see your library.");
      disconnect();
    }
  }, [profileQuery.error, disconnect]);

  const connect = useCallback(() => {
    if (!configured) return;
    setConnecting(true);
    beginSpotifyLogin().catch((e: Error) => {
      setConnecting(false);
      toast.error(e.message);
    });
  }, [configured]);

  const markConnected = useCallback(() => {
    setStatus("connected");
    void queryClient.invalidateQueries({ queryKey: ["spotify"] });
  }, [queryClient]);

  return (
    <SpotifyContext.Provider
      value={{ status, configured, profile: profileQuery.data, connecting, connect, disconnect, markConnected }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify(): SpotifyContextValue {
  const ctx = useContext(SpotifyContext);
  if (!ctx) throw new Error("useSpotify must be used inside <SpotifyProvider>");
  return ctx;
}

export function useSpotifyPlaylists() {
  const { status } = useSpotify();
  return useQuery({
    queryKey: ["spotify", "playlists"],
    queryFn: spotifyApi.playlists,
    enabled: status === "connected",
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useSpotifyRecent() {
  const { status } = useSpotify();
  return useQuery({
    queryKey: ["spotify", "recent"],
    queryFn: spotifyApi.recentlyPlayed,
    enabled: status === "connected",
    staleTime: 60_000,
    retry: false,
  });
}

export function useSpotifyTop() {
  const { status } = useSpotify();
  return useQuery({
    queryKey: ["spotify", "top"],
    queryFn: spotifyApi.topTracks,
    enabled: status === "connected",
    staleTime: 10 * 60_000,
    retry: false,
  });
}
