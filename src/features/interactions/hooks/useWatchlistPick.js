import { useQuery } from "@tanstack/react-query"
import { getWatchlistPick } from "@/services/interactions"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// Local calendar date as YYYY-MM-DD, so the pick turns over at the user's midnight
function localDay() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

// Shared with browseLoader, which prefetches it next to the other Home cards
export const watchlistPickQuery = (userId, day = localDay()) => ({
  queryKey: queryKeys.watchlistPick.day(userId, day),
  queryFn: () => getWatchlistPick(day),
  ...CACHE.user,
})

export default function useWatchlistPick() {
  const currentUser = useCurrentUser()
  const id = currentUser?.id

  return useQuery({ ...watchlistPickQuery(id), enabled: !!id })
}
