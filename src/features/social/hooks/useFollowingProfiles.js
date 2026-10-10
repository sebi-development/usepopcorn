import { useQuery } from "@tanstack/react-query"
import { getFollowingProfiles } from "@/services/follows"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// Followed users' { id, username }, for the feed's Friend filter. Callers enable it only once
// the names are needed (the pill opened, or a friend already in the URL); useFollow refreshes it.
export default function useFollowingProfiles({ enabled = true } = {}) {
  const currentUser = useCurrentUser()

  const { data: profiles } = useQuery({
    queryKey: queryKeys.followingProfiles(currentUser?.id),
    queryFn: () => getFollowingProfiles(currentUser?.id),
    enabled: !!currentUser?.id && enabled,
    ...CACHE.user,
  })

  return { profiles }
}
