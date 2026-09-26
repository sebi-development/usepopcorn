import { useQuery } from "@tanstack/react-query"
import { getBestRatedSince } from "@/services/profiles"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { PERIODS } from "@/utils/periods"

export default function useBestRated(userId, period = 'month', { enabled = true } = {}) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { data, isLoading, isError } = useQuery({
    // Under the ['ratings'] prefix so rating/deleting a title refreshes it
    queryKey: ['ratings', 'bestRated', id, period],
    queryFn: () => getBestRatedSince(id, PERIODS[period].start().toISOString()),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 15,
  })

  return { movie: data?.movie, tv: data?.tv, isLoading, isError }
}
