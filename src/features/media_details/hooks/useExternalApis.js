import { useQuery } from "@tanstack/react-query";
import { getOmdbScores } from "@/services/omdb";
import queryKeys from "@/lib/queryKeys";

// Longer than the TMDB tiers on purpose: critic scores barely move and OMDb's free key is
// capped per day, so a title is asked for at most once an hour.
const ONE_HOUR = 1000 * 60 * 60;

function toScores(data) {
  const rtData = data.Ratings?.find(r => r.Source === "Rotten Tomatoes");

  return {
    imdb: data.imdbRating !== "N/A" ? data.imdbRating : null,
    metacritic: data.Metascore !== "N/A" ? data.Metascore : null,
    rottenTomatoes: rtData ? rtData.Value : null,
  }
}

export default function useExternalApis(imdbId) {
  return useQuery({
    queryKey: queryKeys.media.externalScores(imdbId),
    queryFn: async () => toScores(await getOmdbScores(imdbId)),
    enabled: !!imdbId,
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR,
  })
}
