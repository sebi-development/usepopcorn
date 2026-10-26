import { useQuery } from "@tanstack/react-query"
import { getTvAggregateCredits } from "@/services/tmdb"
import { toTvCast } from "@/utils/tmdbPerson"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// A series' cast across every season. Mounted by the Cast tab only, so it fetches on the tab's first
// open; a movie's cast comes with its details instead.
export default function useTvCast(tvId) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.media.tvCast(tvId),
    queryFn: async () => toTvCast((await getTvAggregateCredits(tvId)).cast),
    enabled: !!tvId,
    ...CACHE.media,
  })

  return { data, isLoading, error }
}
