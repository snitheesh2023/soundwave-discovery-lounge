import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function MobileNav({ className }: { className?: string }) {
  return (
    <nav aria-label="Primary" className={cn("grid grid-cols-4 bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 backdrop-blur", className)}>
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" }}
          className="flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground data-[status=active]:text-foreground [&[data-status=active]_svg]:text-primary"
        >
          <Icon className="size-5" />
          {label === "Your Library" ? "Library" : label}
        </Link>
      ))}
    </nav>
  );
}
