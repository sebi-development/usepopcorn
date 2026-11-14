import { useQuery } from "@tanstack/react-query"
import { getWatchlistPick } from "@/services/interactions"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"
import { toDay } from "@/utils/dates"

// Shared with browseLoader, which prefetches it next to the other Home cards. The day is the local one,
// so the pick turns over at the user's midnight.
export const watchlistPickQuery = (userId, day = toDay(new Date())) => ({
  queryKey: queryKeys.watchlistPick.day(userId, day),
  queryFn: () => getWatchlistPick(day),
  ...CACHE.user,
})

export default function useWatchlistPick() {
  const currentUser = useCurrentUser()
  const id = currentUser?.id

  return useQuery({ ...watchlistPickQuery(id), enabled: !!id })
}
