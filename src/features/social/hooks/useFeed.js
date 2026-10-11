import { getFeed } from "@/services/follows"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import usePagedList from "@/hooks/usePagedList"
import { fromCursorRpc } from "@/utils/pagination"
import { filteredCache } from "@/utils/filters"
import { toFeedParams } from "@/features/social/constants/feedFilters"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// The feed is a glance at recent activity, not an archive (full histories live on profiles):
// one page shows on arrival, then "Load more" up to FEED_MAX_PAGES. No scroll loading, and
// realtime invalidations refetch at most a few small pages.
const FEED_PAGE_SIZE = 10
const FEED_MAX_PAGES = 3

// `filters` are the feed filters from useUrlFilters (FEED_FILTERS); each combination is its own
// list under queryKeys.feed.all, which useFeedRealtime and useFollow refresh, and is dropped from
// memory soon after it stops being shown (CACHE.filtered).
export default function useFeed(filters) {
  const currentUser = useCurrentUser()
  const userId = currentUser?.id

  return usePagedList({
    queryKey: queryKeys.feed.list(userId, filters),
    fetchPage: fromCursorRpc(
      ({ limit, cursor }) => getFeed(userId, { limit, cursor, filterParams: toFeedParams(filters) }),
      FEED_PAGE_SIZE
    ),
    initialPageParam: null,
    autoPages: 1,
    maxPages: FEED_MAX_PAGES,
    ...filteredCache(CACHE.user, filters),
    enabled: !!userId,
  })
}
