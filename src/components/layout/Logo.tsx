import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <defs>
        <linearGradient id="sw-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--lime)" }} />
          <stop offset="1" style={{ stopColor: "var(--cyan)" }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#sw-grad)" />
      <path
        d="M6 17c2.2 0 2.2-6 4.4-6s2.2 10 4.4 10 2.2-14 4.4-14 2.2 12 4.4 12S25.8 15 26 15"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: "var(--primary-foreground)" }}
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5 rounded-lg", className)} aria-label="Soundwave home">
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-tight">Soundwave</span>
    </Link>
  );
}
