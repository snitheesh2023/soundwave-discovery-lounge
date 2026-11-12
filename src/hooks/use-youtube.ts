import { useQuery } from "@tanstack/react-query";

import { getYouTubeStatus, searchYouTube } from "@/lib/youtube.functions";

export function useYouTubeStatus() {
  return useQuery({
    queryKey: ["youtube", "status"],
    queryFn: () => getYouTubeStatus(),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useYouTubeSearch(query: string, enabled: boolean) {
  const q = query.trim();
  return useQuery({
    queryKey: ["youtube", "search", q],
    queryFn: () => searchYouTube({ data: { q } }),
    enabled: enabled && q.length > 0,
    staleTime: 10 * 60_000,
    retry: false,
  });
}
