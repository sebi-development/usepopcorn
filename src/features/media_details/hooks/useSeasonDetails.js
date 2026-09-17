import { useQuery } from "@tanstack/react-query";
import { getSeasonDetails } from "@/services/tmdb";

export default function useSeasonDetails(tvId, seasonNumber) {
  return useQuery({
    queryKey: ['seasonDetails', tvId, seasonNumber],
    queryFn: () => getSeasonDetails(tvId, seasonNumber),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    enabled: !!tvId && seasonNumber != null,
    select: (data) => ({
      id: data.id,
      name: data.name,
      overview: data.overview,
      season_number: data.season_number,
      air_date: data.air_date,
      poster_path: data.poster_path,
      episodes: data.episodes?.map((ep) => ({
        id: ep.id,
        name: ep.name,
        overview: ep.overview,
        episode_number: ep.episode_number,
        air_date: ep.air_date,
        runtime: ep.runtime,
        still_path: ep.still_path,
        vote_average: ep.vote_average,
        vote_count: ep.vote_count,
      })) ?? [],
    }),
  });
}
