import { useQuery } from "@tanstack/react-query"
import { getRecommendations } from "@/services/tmdb"
import usePagedGrid from "@/hooks/usePagedGrid"
import { fromTmdb } from "@/utils/pagination"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

const recommendationsFetcher = (pick, type) => fromTmdb((page) => getRecommendations(pick.tmdb_id, type, page))

// Row mode: page 1 of the grid below, under the same cache entry, so "View all" opens on data
// that is already there instead of requesting the first page a second time.
export default function useRecommendations(pick, type) {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.gridPage(queryKeys.media.recommendations(pick?.tmdb_id, type), 1),
    queryFn: () => recommendationsFetcher(pick, type)(1),
    enabled: !!pick?.tmdb_id,
    ...CACHE.mediaList,
  })

  return { data: data?.items, isLoading, isError }
}

// Grid mode — one TMDB page per query, only fetched while expanded.
export function useRecommendationsGrid(pick, type, page, { enabled = true } = {}) {
  return usePagedGrid({
    queryKey: queryKeys.media.recommendations(pick?.tmdb_id, type),
    fetchPage: recommendationsFetcher(pick, type),
    page,
    enabled: enabled && !!pick?.tmdb_id,
    ...CACHE.mediaList,
  })
}
