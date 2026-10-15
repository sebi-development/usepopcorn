import { CACHE } from "@/lib/queryClient";
import queryKeys from "@/lib/queryKeys";
import { getCsfdScore } from "@/services/csfd";
import { useQuery } from "@tanstack/react-query";

function toCsfdScore({ csfdId, rating }) {
  return {
    rating,
    url: csfdId ? `https://www.csfd.cz/film/${csfdId}/` : null,
  };
}

// Shared with DetailPage, which prefetches it on page open
export const csfdScoreQuery = (imdbId) => ({
  queryKey: queryKeys.media.csfdScore(imdbId),
  queryFn: async () => toCsfdScore(await getCsfdScore(imdbId)),
  ...CACHE.media,
})

export default function useCsfdScore(imdbId) {
  return useQuery({
    ...csfdScoreQuery(imdbId),
    enabled: !!imdbId,
  })
}
