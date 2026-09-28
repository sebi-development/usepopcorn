import { useQuery } from "@tanstack/react-query"
import { getRecommendations } from "@/services/tmdb"
import usePagedGrid from "@/hooks/usePagedGrid"
import { fromTmdb } from "@/utils/pagination"

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
  return usePagedGrid({
    queryKey: ['recommendations', pick?.tmdb_id, type],
    fetchPage: fromTmdb((p) => getRecommendations(pick.tmdb_id, type, p)),
    page,
    enabled: enabled && !!pick?.tmdb_id,
    staleTime: STALE_TIME,
  })
}
