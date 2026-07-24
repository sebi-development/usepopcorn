import { useQuery } from "@tanstack/react-query";
import { getOmdbScores } from "../../../services/omdb";

const ONE_HOUR = 1000 * 60 * 60;

export default function useExternalApis(imdbId) {
  return useQuery({
    queryKey: ['externalScores', imdbId],
    queryFn: () => getOmdbScores(imdbId),
    enabled: !!imdbId,
        staleTime: ONE_HOUR,
    gcTime: ONE_HOUR,

    select: (data) => {
      const rtData = data.Ratings?.find(r => r.Source === "Rotten Tomatoes");
      const rtScore = rtData ? rtData.Value : null;

      return {
        imdb: data.imdbRating !== "N/A" ? data.imdbRating : null,
        metacritic: data.Metascore !== "N/A" ? data.Metascore : null,
        rottenTomatoes: rtScore
      }
    }
  })
}