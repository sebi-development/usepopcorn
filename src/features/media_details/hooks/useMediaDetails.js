import { useQuery } from "@tanstack/react-query";
import { getMediaDetails } from "@/services/tmdb";
import { extractRegionalData } from "@/utils/extractRegionalData";

export default function useMediaDetails(id, type = 'movie', userCountry = 'US') {
  const { data, isLoading, error } = useQuery({
    queryKey: ['mediaDetails', type, id, userCountry],
    queryFn: () => getMediaDetails(id, type),
    staleTime: 1000 * 60 * 15,
    enabled: !!id,
    select: (data) => {
      const { certification, regionalReleaseDate, providers } = extractRegionalData(data, userCountry, type);

      const base = {
        id: data.id,
        imdb_id: data.imdb_id || data.external_ids?.imdb_id,
        title: data.title || data.name,
        overview: data.overview,
        genres: data.genres,
        poster_path: data.poster_path,
        explicit: data.adult,
        release_status: data.status,
        origin_country: data.origin_country,
        watch_providers: data['watch/providers'] ?? null,
        credits: data.credits,
        type,
        certification,
        providers,
      };

      if (type === 'movie') {
        return {
          ...base,
          release_date: data.release_date,
          runtime: data.runtime,
          budget: data.budget,
          revenue: data.revenue,
          regionalReleaseDate,
        };
      }

      // TV Series
      return {
        ...base,
        first_air_date: data.first_air_date,
        last_air_date: data.last_air_date,
        number_of_seasons: data.number_of_seasons,
        number_of_episodes: data.number_of_episodes,
        seasons: data.seasons?.map(s => ({ id: s.id, season_number: s.season_number, name: s.name, episode_count: s.episode_count, air_date: s.air_date, poster_path: s.poster_path })) ?? [],
        episode_run_time: data.episode_run_time,
        networks: data.networks,
      };
    }
  })
  

  return { data, isLoading, error }
}