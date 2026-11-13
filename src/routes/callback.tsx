import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSpotify } from "@/hooks/use-spotify";
import { completeSpotifyLogin } from "@/lib/spotify";

export const Route = createFileRoute("/callback")({
  validateSearch: (s: Record<string, unknown>): { code?: string | undefined; state?: string | undefined; error?: string | undefined } => ({
    code: typeof s["code"] === "string" ? s["code"] : undefined,
    state: typeof s["state"] === "string" ? s["state"] : undefined,
    error: typeof s["error"] === "string" ? s["error"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Connecting Spotify · Soundwave" },
      { name: "description", content: "Finishing the Spotify sign-in." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Connecting Spotify · Soundwave" },
      { property: "og:description", content: "Finishing the Spotify sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CallbackPage,
});

function CallbackPage() {
  const params = Route.useSearch();
  const navigate = useNavigate();
  const { markConnected } = useSpotify();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    completeSpotifyLogin(params)
      .then(() => {
        markConnected();
        toast.success("Spotify connected");
        void navigate({ to: "/", replace: true });
      })
      .catch((e: Error) => setError(e.message));
  }, [params, markConnected, navigate]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      {error ? (
        <>
          <AlertTriangle className="size-8 text-destructive" />
          <h1 className="text-2xl font-bold">Spotify didn't connect</h1>
          <p className="max-w-md text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="secondary"><Link to="/connections">Back to connections</Link></Button>
        </>
      ) : (
        <>
          <Loader2 className="size-8 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Connecting to Spotify…</h1>
        </>
      )}
    </div>
  );
}
