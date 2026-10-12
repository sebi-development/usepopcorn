import { useQuery } from "@tanstack/react-query"
import { getBestRatedSince } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { PERIODS } from "@/utils/periods"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// Shared with the /browse route loader, which starts Home's poster query before the page chunk is in
export const bestRatedQuery = (userId, period = 'month') => ({
  // Under queryKeys.ratings.all so rating/deleting a title refreshes it
  queryKey: queryKeys.ratings.bestRated(userId, period),
  queryFn: () => getBestRatedSince(userId, PERIODS[period].start().toISOString()),
  ...CACHE.aggregate,
})

export default function useBestRated(userId, period = 'month', { enabled = true } = {}) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, isError } = useQuery({ ...bestRatedQuery(id, period), enabled: !!id && enabled })

  return { movie: data?.movie, tv: data?.tv, isLoading, isError }
}
