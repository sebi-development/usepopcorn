import { useCallback, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { AUTO_PAGES, MAX_PAGES, DEFAULT_STALE_TIME, DEFAULT_GC_TIME } from "@/utils/pagination"

/**
 * Infinite list over any source adapted by src/utils/pagination.js
 * (`fetchPage(pageParam) → { items, nextCursor, total? }`).
 *
 * Bounded by design: it never accumulates more than `maxPages` pages. `phase`
 * tells the UI who drives the next load:
 *   'auto'   fewer than `autoPages` loaded, a scroll sentinel loads more
 *   'manual' past `autoPages`, an explicit "Load more" button loads more
 *   'capped' `maxPages` reached and the server still has more
 *   'done'   nothing more exists
 *
 * `items` is `undefined` until the first page lands (so callers can tell
 * "not loaded" from "loaded but empty"). `queryKey` and `fetchPage` may be
 * recreated each render; only the key's contents matter to React Query.
 */
export default function usePagedList({
  queryKey,
  fetchPage,
  initialPageParam = 1,
  autoPages = AUTO_PAGES,
  maxPages = MAX_PAGES,
  staleTime = DEFAULT_STALE_TIME,
  gcTime = DEFAULT_GC_TIME,
  enabled = true,
}) {
  const {
    data, isLoading, isError, error,
    hasNextPage, isFetchingNextPage, fetchNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam,
    getNextPageParam: (lastPage, allPages) =>
      allPages.length >= maxPages ? undefined : lastPage.nextCursor,
    staleTime,
    gcTime,
    enabled,
  })

  const items = useMemo(() => data?.pages.flatMap((page) => page.items), [data])

  const pageCount = data?.pages.length ?? 0
  const serverHasMore = data?.pages[pageCount - 1]?.nextCursor !== undefined

  let phase = 'done'
  if (serverHasMore) {
    if (pageCount >= maxPages) phase = 'capped'
    else if (pageCount >= autoPages) phase = 'manual'
    else phase = 'auto'
  }

  const fetchMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    items,
    total: data?.pages[0]?.total,
    pageCount,
    phase,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    fetchMore,
  }
}
