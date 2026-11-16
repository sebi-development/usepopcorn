import { useQuery } from "@tanstack/react-query"
import { getWatchlistFriendsRatings } from "@/services/interactions"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// Friends' average score and count per saved title. Under friendsRatings.all, so a follow or unfollow
// (useFollow) refreshes it; aggregate tier, since friends' scores move slowly.
export default function useWatchlistFriendsRatings({ enabled = true } = {}) {
  const currentUser = useCurrentUser()
  const id = currentUser?.id

  const { data, isError } = useQuery({
    queryKey: queryKeys.friendsRatings.watchlist(id),
    queryFn: getWatchlistFriendsRatings,
    enabled: !!id && enabled,
    ...CACHE.aggregate,
  })
  return { data, isError }
}
