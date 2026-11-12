import { Home, Library, Search, Settings2, type LucideIcon } from "lucide-react";

export const NAV_ITEMS: { to: "/" | "/search" | "/library" | "/connections"; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Your Library", icon: Library },
  { to: "/connections", label: "Connections", icon: Settings2 },
];
