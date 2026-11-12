import { cn } from "@/lib/utils";

export function EqBars({ active = true, className }: { active?: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("inline-flex h-3.5 items-end gap-[2px]", className)}>
      {[0, 0.2, 0.4, 0.1].map((delay, i) => (
        <span
          key={i}
          className={cn("w-[3px] origin-bottom rounded-full bg-primary", active ? "animate-eq h-full" : "h-1/3")}
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}
