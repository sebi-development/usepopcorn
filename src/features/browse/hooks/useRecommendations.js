import { useQuery } from "@tanstack/react-query"
import { getRecommendations } from "@/services/tmdb"

// `pick` is a best-rated row ({ tmdb_id, ... }); `type` is 'movie' | 'tv'.
export default function useRecommendations(pick, type) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recommendations', pick?.tmdb_id, type],
    queryFn: () => getRecommendations(pick.tmdb_id, type),
    enabled: !!pick?.tmdb_id,
    staleTime: 1000 * 60 * 15,
  })

  return { data: data?.results, isLoading, isError }
}
