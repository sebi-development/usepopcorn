import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { getFollowingIds } from "@/services/follows"

// Fetches the current user's full following list once and returns it as an array and a Set.
// Widgets pass `followingSet.has(userId)` down to each item instead of N individual queries.
export default function useFollowingIds() {
  const currentUser = useCurrentUser()

  const { data: followingIds, isLoading } = useQuery({
    queryKey: ['followingIds', currentUser?.id],
    queryFn: () => getFollowingIds(currentUser?.id),
    enabled: !!currentUser?.id,
    staleTime: 1000 * 60 * 5,
  })

  const followingSet = useMemo(
    () => new Set(followingIds ?? []),
    [followingIds]
  )

  return { followingIds, followingSet, isLoading }
}
