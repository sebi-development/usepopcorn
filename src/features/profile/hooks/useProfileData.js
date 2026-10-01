import { useQuery } from "@tanstack/react-query"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import useUserProfile from "@/features/profile/hooks/useUserProfile"
import { userRatingsFetcher } from "@/features/profile/hooks/useUserRatingsGrid"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

export default function useProfileData(userId) {
  const currentUser = useCurrentUser()
  const id = userId ?? currentUser?.id

  const { profileData, isLoading: isLoadingProfile } = useUserProfile(id)

  // Page 1 of the "View all" grid (same cache entry), which already carries the exact total:
  // one request feeds the row and the ratings count, and expanding the row is a cache hit.
  const { data: firstPage, isLoading: isLoadingRatings } = useQuery({
    queryKey: queryKeys.gridPage(queryKeys.ratings.byUser(id), 1),
    queryFn: () => userRatingsFetcher(id)(1),
    enabled: !!id,
    ...CACHE.user,
  })

  return {
    profileData,
    recentRatings: firstPage?.items,
    ratingsCount: firstPage?.total,
    isLoadingProfile,
    isLoadingRatings,
  }
}
