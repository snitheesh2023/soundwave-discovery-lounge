import { Link } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";

import { useSpotify } from "@/hooks/use-spotify";

/** Clearly labels sections that show made-up sample data. */
export function SampleNotice({ what = "These tracks" }: { what?: string }) {
  const { status, connect } = useSpotify();
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-muted-foreground">
      <FlaskConical className="size-3.5 text-provider-sample" />
      <span>{what} are sample data with no audio.</span>
      {status === "disconnected" ? (
        <button type="button" onClick={connect} className="font-semibold text-cyan hover:underline">
          Connect Spotify for your own
        </button>
      ) : status === "unconfigured" ? (
        <Link to="/connections" className="font-semibold text-cyan hover:underline">
          Set up Spotify
        </Link>
      ) : null}
    </p>
  );
}
