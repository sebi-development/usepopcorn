import { getFeed } from "@/services/follows"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import usePagedList from "@/hooks/usePagedList"
import { fromCursorRpc } from "@/utils/pagination"
import queryKeys from "@/lib/queryKeys"

// The feed is a glance at recent activity, not an archive (full histories live on profiles):
// one page shows on arrival, then "Load more" up to FEED_MAX_PAGES. No scroll loading, and
// realtime invalidations refetch at most a few small pages.
const FEED_PAGE_SIZE = 10
const FEED_MAX_PAGES = 3

// Key must stay queryKeys.feed: useFeedRealtime and useFollow invalidate it.
export default function useFeed() {
  const currentUser = useCurrentUser()
  const userId = currentUser?.id

  return usePagedList({
    queryKey: queryKeys.feed(userId),
    fetchPage: fromCursorRpc(({ limit, cursor }) => getFeed(userId, { limit, cursor }), FEED_PAGE_SIZE),
    initialPageParam: null,
    autoPages: 1,
    maxPages: FEED_MAX_PAGES,
    enabled: !!userId,
  })
}
