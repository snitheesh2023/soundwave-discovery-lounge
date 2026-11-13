import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FlaskConical,
  Loader2,
  LogOut,
  PlugZap,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSpotify } from "@/hooks/use-spotify";
import { useYouTubeStatus } from "@/hooks/use-youtube";
import { getSpotifyRedirectUri, SPOTIFY_SCOPES } from "@/lib/spotify";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/connections")({
  head: () => ({
    meta: [
      { title: "Connections · Soundwave" },
      {
        name: "description",
        content: "Connect Spotify with its official sign-in and set up YouTube search for Soundwave.",
      },
      { property: "og:title", content: "Connections · Soundwave" },
      {
        property: "og:description",
        content: "Set up Spotify and YouTube for Soundwave, step by step.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConnectionsPage,
});

function ConnectionsPage() {
  return (
    <div className="flex flex-col gap-8 pt-2 pb-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold md:text-4xl">Connections</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Soundwave works with sample data out of the box. Connect Spotify to see your own playlists, and add a
          YouTube key to search videos. Everything plays in each service's official player.
        </p>
      </header>
      <div className="grid gap-6 min-[1800px]:grid-cols-2">
        <SpotifyPanel />
        <YouTubePanel />
      </div>
      <SamplePanel />
    </div>
  );
}

/* ---------- Spotify ---------- */

function SpotifyPanel() {
  const { status, profile, connect, connecting, disconnect } = useSpotify();
  const [redirectUri, setRedirectUri] = useState("");
  useEffect(() => setRedirectUri(getSpotifyRedirectUri()), []);

  const badge =
    status === "connected" ? (
      <StatusBadge tone="ok">Connected</StatusBadge>
    ) : status === "disconnected" ? (
      <StatusBadge tone="idle">Ready to connect</StatusBadge>
    ) : status === "unconfigured" ? (
      <StatusBadge tone="warn">Not configured</StatusBadge>
    ) : (
      <StatusBadge tone="idle">Checking…</StatusBadge>
    );

  return (
    <Panel
      icon={PlugZap}
      iconClass="text-provider-spotify bg-provider-spotify/10"
      title="Spotify"
      badge={badge}
      summary="Your playlists, recent plays and top tracks, read through Spotify's official Web API. Sign-in happens on Spotify's own page; Soundwave never sees your password."
    >
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2/60 p-4">
        {status === "connected" ? (
          <>
            <CheckCircle2 className="size-5 text-provider-spotify" />
            <p className="min-w-0 flex-1 text-sm">
              Signed in as <span className="font-semibold">{profile?.display_name ?? "Spotify listener"}</span>
              {profile?.product && (
                <span className="text-muted-foreground"> · {profile.product === "premium" ? "Premium" : "Free"} plan</span>
              )}
            </p>
            <Button variant="secondary" size="sm" onClick={disconnect}>
              <LogOut /> Disconnect
            </Button>
          </>
        ) : status === "disconnected" ? (
          <>
            <p className="min-w-0 flex-1 text-sm text-muted-foreground">Spotify is set up. Connect your account.</p>
            <Button variant="signal" size="sm" onClick={connect} disabled={connecting}>
              {connecting ? <Loader2 className="animate-spin" /> : <PlugZap />} Connect Spotify
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No Spotify Client ID has been added yet, so the app shows sample playlists. Follow the steps below.
          </p>
        )}
      </div>

      <Steps>
        <Step n={1} title="Create a Spotify app">
          Open the{" "}
          <ExtLink href="https://developer.spotify.com/dashboard">Spotify Developer Dashboard</ExtLink>, choose{" "}
          <em>Create app</em> and tick <em>Web API</em> and <em>Web Playback SDK</em> when asked.
        </Step>
        <Step n={2} title="Add this Redirect URI">
          <p>Paste it exactly into the app's settings. Add one for every address the app runs on.</p>
          <CopyField value={redirectUri || "…/callback"} disabled={!redirectUri} />
        </Step>
        <Step n={3} title="Add the Client ID">
          Copy the <em>Client ID</em> (not the secret) and set it as{" "}
          <Code>VITE_SPOTIFY_CLIENT_ID</Code>. It is a public value, so it's safe in the browser. No client secret is
          needed: sign-in uses Spotify's PKCE flow.
        </Step>
        <Step n={4} title="Allow listeners while in development mode">
          New Spotify apps only work for accounts listed under <em>User Management</em> in the dashboard. Add each
          listener's Spotify email there, or apply for an extended quota.
        </Step>
      </Steps>

      <details className="group rounded-xl border border-border px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium text-muted-foreground group-open:text-foreground">
          Permissions Soundwave asks for
        </summary>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {SPOTIFY_SCOPES.map((s) => (
            <li key={s}>
              <Code>{s}</Code>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-muted-foreground">
          All read-only. Playback uses Spotify's embedded player; full tracks need you to be signed in to Spotify in
          this browser, otherwise Spotify plays short previews.
        </p>
      </details>
    </Panel>
  );
}

/* ---------- YouTube ---------- */

function YouTubePanel() {
  const status = useYouTubeStatus();
  const configured = status.data?.configured === true;

  const badge = status.isLoading ? (
    <StatusBadge tone="idle">Checking…</StatusBadge>
  ) : status.isError ? (
    <StatusBadge tone="warn">Status unknown</StatusBadge>
  ) : configured ? (
    <StatusBadge tone="ok">Search enabled</StatusBadge>
  ) : (
    <StatusBadge tone="warn">Not configured</StatusBadge>
  );

  return (
    <Panel
      icon={Youtube}
      iconClass="text-provider-youtube bg-provider-youtube/10"
      title="YouTube"
      badge={badge}
      summary="Video search uses the YouTube Data API. Videos always play in YouTube's official embedded player, including any ads YouTube shows."
    >
      <div className="flex items-start gap-3 rounded-xl bg-surface-2/60 p-4 text-sm">
        {configured ? (
          <>
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-provider-youtube" />
            <p>A YouTube API key is set up. Search for videos from the Search page.</p>
          </>
        ) : status.isError ? (
          <p className="text-muted-foreground">
            Couldn't check YouTube right now: {(status.error as Error).message}
          </p>
        ) : (
          <p className="text-muted-foreground">
            Without a key, you can still paste any YouTube link into Search to play it. Add a key to search by name.
          </p>
        )}
      </div>

      <Steps>
        <Step n={1} title="Create a Google Cloud project">
          In the <ExtLink href="https://console.cloud.google.com/">Google Cloud Console</ExtLink>, create or pick a
          project.
        </Step>
        <Step n={2} title="Turn on the YouTube Data API v3">
          Enable it from the{" "}
          <ExtLink href="https://console.cloud.google.com/apis/library/youtube.googleapis.com">API library</ExtLink>.
        </Step>
        <Step n={3} title="Create an API key">
          Under <em>Credentials → Create credentials → API key</em>. Restrict it to the YouTube Data API v3.
        </Step>
        <Step n={4} title="Save it as a private secret">
          Store it as <Code>YOUTUBE_API_KEY</Code>. Searches run on the server, so the key never reaches visitors'
          browsers.
        </Step>
      </Steps>

      <p className="text-xs text-muted-foreground">
        The free quota allows roughly 100 searches a day. Soundwave respects YouTube's{" "}
        <ExtLink href="https://www.youtube.com/t/terms">Terms of Service</ExtLink> and never hides ads or downloads
        videos.
      </p>
    </Panel>
  );
}

/* ---------- Sample data ---------- */

function SamplePanel() {
  return (
    <section
      aria-label="Sample data"
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-surface/60 p-5 sm:flex-row sm:items-center"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-provider-sample/10 text-provider-sample">
        <FlaskConical className="size-5" />
      </div>
      <div className="flex-1">
        <h2 className="font-display text-lg font-semibold">About sample content</h2>
        <p className="text-sm text-muted-foreground">
          Anything marked <span className={cn(badgeVariants({ variant: "sample" }), "mx-0.5 align-middle")}>Sample</span> is made up for
          demonstration and has no audio — the player just moves the progress bar so you can try the controls.
        </p>
      </div>
    </section>
  );
}

/* ---------- Building blocks ---------- */

function Panel({
  icon: Icon,
  iconClass,
  title,
  badge,
  summary,
  children,
}: {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  badge: ReactNode;
  summary: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="flex flex-col gap-5 rounded-2xl bg-surface p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", iconClass)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-bold">{title}</h2>
            {badge}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ tone, children }: { tone: "ok" | "warn" | "idle"; children: ReactNode }) {
  return (
    <Badge variant={tone === "ok" ? "default" : tone === "warn" ? "warning" : "secondary"}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </Badge>
  );
}

function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Setup guide</h3>
      <ol className="flex flex-col gap-4">{children}</ol>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-xs text-cyan">
        {n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
        <p className="font-semibold">{title}</p>
        <div className="space-y-2 text-muted-foreground">{children}</div>
      </div>
    </li>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-foreground">{children}</code>;
}

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-0.5 font-medium text-cyan hover:underline"
    >
      {children}
      <ExternalLink className="size-3" aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function CopyField({ value, disabled }: { value: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it manually.");
    }
  };
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 py-1 pl-3 pr-1">
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground" title={value}>
        {value}
      </code>
      <Button variant="ghost" size="sm" onClick={copy} disabled={disabled} aria-label="Copy Redirect URI">
        {copied ? <Check className="text-primary" /> : <Copy />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
