import { useQuery } from "@tanstack/react-query";
import { getMediaDetails } from "../../../services/tmdb";

export default function useMediaDetails(id, type = 'movie') {
  const { data, isLoading, error } = useQuery({
    queryKey: ['mediaDetails', type, id],
    queryFn: () => getMediaDetails(id, type),
    staleTime: 1000 * 60 * 15,
    enabled: !!id,
    select: (data) => ({
      id: data.id,
      imdb_id: data.imdb_id || data.external_ids?.imdb_id,
      title: data.title || data.name,
      overview: data.overview,
      release_date: data.release_date || data.first_air_date,
      runtime: data.runtime || data.episode_run_time?.[0],
      genres: data.genres,
      poster_path: data.poster_path,
      explicit: data.adult,
      budget: data.budget,
      revenue: data.revenue,
      release_status: data.status,
      origin_country: data.origin_country,
      type
    })
  })

  return { data, isLoading, error }
}