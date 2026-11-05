import { useQuery } from "@tanstack/react-query"
import { getTvAggregateCredits } from "@/services/tmdb"
import { toTvCast, toTvCrew } from "@/utils/tmdbPerson"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// A series' cast and crew across every season, from one response. Mounted by the Cast tab only, so it
// fetches on the tab's first open; a movie's come with its details instead.
export default function useTvCredits(tvId) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.media.tvCredits(tvId),
    queryFn: async () => {
      const { cast, crew } = await getTvAggregateCredits(tvId)
      return { cast: toTvCast(cast), crew: toTvCrew(crew) }
    },
    enabled: !!tvId,
    ...CACHE.media,
  })

  return { data, isLoading, error }
}
