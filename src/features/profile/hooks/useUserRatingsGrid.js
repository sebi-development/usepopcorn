import { getUserRatingsPage } from "@/services/ratings"
import usePagedGrid from "@/hooks/usePagedGrid"
import { fromRange } from "@/utils/pagination"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// `fetchPage(page)` over a user's rating history, newest first. Shared with useProfileData,
// whose "Recently rated" row is page 1 of this grid.
export const userRatingsFetcher = (userId) => fromRange((from, to) => getUserRatingsPage(userId, from, to))

// Numbered pages of a user's full rating history, only fetched while the
// profile's "Recently rated" row is expanded. Sits under queryKeys.ratings.all
// so rating or deleting a title refreshes it.
export default function useUserRatingsGrid(userId, page, { enabled = true } = {}) {
  return usePagedGrid({
    queryKey: queryKeys.ratings.byUser(userId),
    fetchPage: userRatingsFetcher(userId),
    page,
    enabled: enabled && !!userId,
    ...CACHE.user,
  })
}
