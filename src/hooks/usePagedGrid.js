import { useEffect, useRef } from "react"
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { DEFAULT_STALE_TIME, DEFAULT_GC_TIME } from "@/utils/pagination"
import queryKeys from "@/lib/queryKeys"

/**
 * Numbered-page grid over any source adapted by src/utils/pagination.js
 * (`fetchPage(page) → { items, totalPages }`). One page per query, keyed
 * `queryKeys.gridPage(queryKey, page)`, so only one page (two with prefetch)
 * is ever resident.
 *
 * `keepPreviousData` keeps the old page rendered while the next loads — drive
 * "refreshing" UI off this hook's own `isPlaceholderData` / `isFetching`.
 *
 * Once a page lands, page + 1 is prefetched so "Next" is usually a cache hit.
 * prefetchQuery no-ops when that page is already fresh, so it never duplicates
 * an in-flight or still-valid fetch.
 *
 * `queryKey` and `fetchPage` are read through a ref, so callers don't need to
 * memoize them; the prefetch effect only re-runs when the page or data changes.
 */
export default function usePagedGrid({
  queryKey,
  fetchPage,
  page,
  enabled = true,
  prefetchNext = true,
  staleTime = DEFAULT_STALE_TIME,
  gcTime = DEFAULT_GC_TIME,
}) {
  const queryClient = useQueryClient()

  const latest = useRef({ queryKey, fetchPage })
  useEffect(() => {
    latest.current = { queryKey, fetchPage }
  })

  const query = useQuery({
    queryKey: queryKeys.gridPage(queryKey, page),
    queryFn: () => fetchPage(page),
    placeholderData: keepPreviousData,
    staleTime,
    gcTime,
    enabled,
  })

  const data = query.data
  const totalPages = data?.totalPages ?? 1

  useEffect(() => {
    if (!enabled || !prefetchNext || !data) return
    if (page >= totalPages) return // nothing ahead to prefetch

    const { queryKey: key, fetchPage: fetcher } = latest.current
    queryClient.prefetchQuery({
      queryKey: queryKeys.gridPage(key, page + 1),
      queryFn: () => fetcher(page + 1),
      staleTime,
      // Without it a prefetched page nobody opens would outlive the grid's own pages
      gcTime,
    })
  }, [enabled, prefetchNext, data, page, totalPages, staleTime, gcTime, queryClient])

  // `items` is undefined until the first page lands
  return { ...query, items: data?.items, totalPages }
}
