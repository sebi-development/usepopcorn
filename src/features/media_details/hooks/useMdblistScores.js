import { CACHE } from "@/lib/queryClient";
import queryKeys from "@/lib/queryKeys";
import { getMdblistScores } from "@/services/mdblist";
import { useQuery } from "@tanstack/react-query";

function toMdblistScores({ imdb, rtCritics, rtAudience, metacritic, rtPath }) {
  return {
    imdb, rtCritics, rtAudience, metacritic,
    rtUrl: rtPath ? `https://www.rottentomatoes.com${rtPath}` : null,
  }
}

// Shared with DetailPage, which prefetches it on page open
export const mdblistScoresQuery = (type, tmdbId) => ({
  queryKey: queryKeys.media.mdblistScores(type, tmdbId),
  queryFn: async () => toMdblistScores(await getMdblistScores(type, tmdbId)),
  ...CACHE.media,
})

export default function useMdblistScores(type, tmdbId) {
  return useQuery({
    ...mdblistScoresQuery(type, tmdbId),
    enabled: !!tmdbId,
  })
}