import { useQuery } from "@tanstack/react-query";
import { getMediaDetails } from "@/services/tmdb";
import { extractRegionalData } from "@/utils/extractRegionalData";
import queryKeys from "@/lib/queryKeys";
import { CACHE } from "@/lib/queryClient";
import { toMediaItem } from "@/utils/tmdbItem";
import { toCreators, toDirectors, toMovieCast, toMovieCrew } from "@/utils/tmdbPerson";

const SIMILAR_LIMIT = 12;

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
    similar: data.recommendations?.results?.slice(0, SIMILAR_LIMIT).map(toMediaItem) ?? [],
  };

  if (type === 'movie') {
    return {
      ...base,
      release_date: data.release_date,
      runtime: data.runtime,
      budget: data.budget,
      revenue: data.revenue,
      regionalReleaseDate,
      directors: toDirectors(data.credits?.crew),
      crew: toMovieCrew(data.credits?.crew),
      cast: toMovieCast(data.credits?.cast),
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
    creators: toCreators(data.created_by),
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
