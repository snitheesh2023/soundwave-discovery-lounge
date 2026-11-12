import { Badge } from "@/components/ui/badge";
import type { Source } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABEL: Record<Source, string> = { demo: "Sample", spotify: "Spotify", youtube: "YouTube" };
const VARIANT = { demo: "sample", spotify: "spotify", youtube: "youtube" } as const;

export function SourceBadge({ source, className }: { source: Source; className?: string }) {
  return (
    <Badge variant={VARIANT[source]} className={cn("shrink-0", className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {LABEL[source]}
    </Badge>
  );
}
