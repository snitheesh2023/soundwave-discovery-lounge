import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Section({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title: string;
  eyebrow?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)} aria-label={title}>
      <div className="flex items-end justify-between gap-4 px-1">
        <div className="min-w-0">
          {eyebrow && <div className="mb-1 text-xs font-medium text-muted-foreground">{eyebrow}</div>}
          <h2 className="truncate text-xl font-bold md:text-2xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-2/40 px-6 py-10 text-center",
        className,
      )}
    >
      {icon && <div className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-cyan [&_svg]:size-5">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && <div className="max-w-md text-sm text-muted-foreground">{children}</div>}
      {action}
    </div>
  );
}
