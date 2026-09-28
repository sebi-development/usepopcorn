import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { getRecommendations } from "@/services/tmdb"

const STALE_TIME = 1000 * 60 * 15

export default function useRecommendations(pick, type) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recommendations', pick?.tmdb_id, type],
    queryFn: () => getRecommendations(pick.tmdb_id, type),
    enabled: !!pick?.tmdb_id,
    staleTime: STALE_TIME,
  })

  return { data: data?.results, isLoading, isError }
}

// Grid mode — one TMDB page per query, only fetched while expanded.
export function useRecommendationsGrid(pick, type, page, { enabled = true } = {}) {
  const query = useQuery({
    queryKey: ['recommendations', pick?.tmdb_id, type, 'grid', page],
    queryFn: () => getRecommendations(pick.tmdb_id, type, page),
    placeholderData: keepPreviousData,
    enabled: enabled && !!pick?.tmdb_id,
    staleTime: STALE_TIME,
  })

  return { ...query, totalPages: query.data?.total_pages ?? 1 }
}
