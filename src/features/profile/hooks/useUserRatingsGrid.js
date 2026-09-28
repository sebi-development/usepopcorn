import { getUserRatingsPage } from "@/services/ratings"
import usePagedGrid from "@/hooks/usePagedGrid"
import { fromRange } from "@/utils/pagination"

const STALE_TIME = 1000 * 60 * 5

// Numbered pages of a user's full rating history, only fetched while the
// profile's "Recently rated" row is expanded. Sits under the ['ratings']
// prefix so rating or deleting a title refreshes it.
export default function useUserRatingsGrid(userId, page, { enabled = true } = {}) {
  return usePagedGrid({
    queryKey: ['ratings', 'user', userId],
    fetchPage: fromRange((from, to) => getUserRatingsPage(userId, from, to)),
    page,
    enabled: enabled && !!userId,
    staleTime: STALE_TIME,
  })
}
