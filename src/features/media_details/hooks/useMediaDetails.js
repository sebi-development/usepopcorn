import { useQuery } from "@tanstack/react-query";
import { getMediaDetails } from "@/services/tmdb";
import queryKeys from "@/lib/queryKeys";
import { CACHE } from "@/lib/queryClient";
import { toMediaItem } from "@/utils/tmdbItem";
import { toCreators, toDirectors, toMovieCast, toMovieCrew } from "@/utils/tmdbPerson";

const SIMILAR_LIMIT = 12;

// The oldest official YouTube trailer, teasers only when there's nothing else: newer "trailers" are
// often promos and re-release cuts ("Review", "25th Anniversary"), the oldest is usually the original
function toTrailerKey(videos = []) {
  const trailers = videos.filter((v) => v.site === 'YouTube' && v.type === 'Trailer');
  const official = trailers.filter((v) => v.official);
  const pool = official.length ? official : trailers;
  const full = pool.filter((v) => !/teaser/i.test(v.name));
  return (full.length ? full : pool).reduce((oldest, v) => (!oldest || v.published_at < oldest.published_at ? v : oldest), null)?.key ?? null;
}

// The age rating in the user's country, and for a movie its theatrical release date (type 3) there
function toRegionalData(data, country, type) {
  if (type !== 'movie') {
    const rating = data.content_ratings?.results?.find((r) => r.iso_3166_1 === country)?.rating
    return { certification: rating || null, regionalReleaseDate: null };
  }
  const release = data.release_dates?.results?.find((r) => r.iso_3166_1 === country)?.release_dates?.find((r) => r.type === 3)
  return { certification: release?.certification || null, regionalReleaseDate: release?.release_date?.slice(0, 10) || null };
}

function toMediaDetails(data, type, userCountry) {
  const { certification, regionalReleaseDate } = toRegionalData(data, userCountry, type);

  const base = {
    id: data.id,
    imdb_id: data.imdb_id || data.external_ids?.imdb_id,
    title: data.title || data.name,
    overview: data.overview,
    genres: data.genres,
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    trailerKey: toTrailerKey(data.videos?.results),
    explicit: data.adult,
    release_status: data.status,
    origin_country: data.origin_country,
    type,
    certification,
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
    // Season 0 holds TMDB's specials, which the Episodes tab leaves out
    seasons: data.seasons?.filter(s => s.season_number > 0).map(s => ({ id: s.id, season_number: s.season_number, name: s.name, episode_count: s.episode_count, air_date: s.air_date })) ?? [],
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
