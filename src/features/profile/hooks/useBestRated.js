import { useQuery } from "@tanstack/react-query"
import { getBestRatedSince } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { PERIODS } from "@/utils/periods"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

export default function useBestRated(userId, period = 'month', { enabled = true } = {}) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, isError } = useQuery({
    // Under queryKeys.ratings.all so rating/deleting a title refreshes it
    queryKey: queryKeys.ratings.bestRated(id, period),
    queryFn: () => getBestRatedSince(id, PERIODS[period].start().toISOString()),
    enabled: !!id && enabled,
    ...CACHE.aggregate,
  })

  return { movie: data?.movie, tv: data?.tv, isLoading, isError }
}
