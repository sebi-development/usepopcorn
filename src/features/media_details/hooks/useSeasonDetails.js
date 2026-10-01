import { useQuery } from "@tanstack/react-query";
import { getSeasonDetails } from "@/services/tmdb";
import queryKeys from "@/lib/queryKeys";
import { CACHE } from "@/lib/queryClient";

// TMDB sends every episode with its crew and guest stars. The episode list shows a handful of
// fields, so only those are cached: a few KB per season instead of hundreds.
function toSeason(data) {
  return {
    id: data.id,
    season_number: data.season_number,
    episodes: data.episodes?.map((ep) => ({
      id: ep.id,
      name: ep.name,
      episode_number: ep.episode_number,
      air_date: ep.air_date,
      runtime: ep.runtime,
      vote_average: ep.vote_average,
      vote_count: ep.vote_count,
    })) ?? [],
  };
}

// Shared with useAllSeasonDetails, which fills the same cache entries in bulk.
export const seasonQuery = (tvId, seasonNumber) => ({
  queryKey: queryKeys.media.season(tvId, seasonNumber),
  queryFn: async () => toSeason(await getSeasonDetails(tvId, seasonNumber)),
  ...CACHE.media,
});

export default function useSeasonDetails(tvId, seasonNumber) {
  return useQuery({
    ...seasonQuery(tvId, seasonNumber),
    enabled: !!tvId && seasonNumber != null,
  });
}
