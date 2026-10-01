import { useQuery } from "@tanstack/react-query";
import { getMediaDetails } from "@/services/tmdb";
import { extractRegionalData } from "@/utils/extractRegionalData";
import queryKeys from "@/lib/queryKeys";
import { CACHE } from "@/lib/queryClient";

// TMDB's detail payload carries the full cast and crew plus release dates and streaming providers
// for every country: hundreds of KB for a big title. The detail page reads a few dozen fields, so
// the payload is reduced to those before it is cached (the cache then holds a few KB per title).
function toMediaDetails(data, type, userCountry) {
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
      director: data.credits?.crew?.find(c => c.job === 'Director')?.name ?? null,
    };
  }

  // TV Series
  return {
    ...base,
    first_air_date: data.first_air_date,
    last_air_date: data.last_air_date,
    number_of_seasons: data.number_of_seasons,
    number_of_episodes: data.number_of_episodes,
    seasons: data.seasons?.map(s => ({ id: s.id, season_number: s.season_number, name: s.name, episode_count: s.episode_count, air_date: s.air_date })) ?? [],
    episode_run_time: data.episode_run_time,
    network: data.networks?.[0]?.name ?? null,
  };
}

export default function useMediaDetails(id, type = 'movie', userCountry = 'US') {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.media.details(type, id, userCountry),
    queryFn: async () => toMediaDetails(await getMediaDetails(id, type), type, userCountry),
    enabled: !!id,
    ...CACHE.media,
  })

  return { data, isLoading, error }
}
