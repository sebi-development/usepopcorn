import { useEffect, useMemo } from "react"
import { useInfiniteQuery, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import {
  getTrending, getPopular, getTopRated,
  getUpcoming, getNowPlaying, getOnTheAir,
  getMediaByGenre,
} from "@/services/tmdb"

// Maps section + categoryId → the TMDB fetch function for static (non-genre)
// categories. Each function takes a single `page` argument and returns a TMDB
// paginated response.
const FETCH_MAP = {
  movies: {
    trending:    (page) => getTrending('movie', page),
    popular:     (page) => getPopular('movie', page),
    top_rated:   (page) => getTopRated('movie', page),
    upcoming:    (page) => getUpcoming(page),
    now_playing: (page) => getNowPlaying(page),
  },
  series: {
    trending:    (page) => getTrending('tv', page),
    popular:     (page) => getPopular('tv', page),
    top_rated:   (page) => getTopRated('tv', page),
    on_the_air:  (page) => getOnTheAir(page),
  },
}

// Maps browse-page section names to TMDB's media-type path segments.
export const SECTION_TO_TYPE = { movies: 'movie', series: 'tv' }

// Hard ceiling on how many pages a row will accumulate via infinite scroll.
// TMDB pages are a fixed 20 items each, so this caps a row at 100 items
// resident in the cache. Grid mode below doesn't need this — it only ever
// holds one (or two, with prefetch) pages at a time.
const MAX_ROW_PAGES = 5

// Shared across row and grid so the two don't drift. Matching gcTime to
// staleTime — data past staleTime refetches anyway, so a longer gcTime
// just keeps stale objects in memory for no benefit during rapid browsing.
const STALE_TIME = 1000 * 60 * 15
const GC_TIME = 1000 * 60 * 15

function cappedNextPageParam(lastPage, allPages) {
  if (allPages.length >= MAX_ROW_PAGES) return undefined
  return lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined
}

// TMDB refuses to serve past page 500 on any endpoint regardless of how
// many total_pages it reports — clamp so pagination controls never offer
// a page that will 400.
function clampTotalPages(totalPages) {
  return Math.min(totalPages ?? 1, 500)
}

// Shared between the row (infinite) and grid (paginated) hooks — one place
// that knows how to turn a section + categoryId into a TMDB fetch function
// and a base query key, including genre detection. CategoryRail emits
// categoryIds like "genre-28"; we strip the prefix and route to /discover.
function resolveCategoryFetch(section, categoryId) {
  const type = SECTION_TO_TYPE[section]
  const isGenre = categoryId.startsWith('genre-')

  if (isGenre) {
    const genreId = categoryId.slice(6)
    return {
      queryKeyBase: ['browse', 'genre', type, genreId],
      fetchFn: (page) => getMediaByGenre(type, genreId, page),
    }
  }

  return {
    queryKeyBase: ['browse', categoryId, type],
    fetchFn: FETCH_MAP[section]?.[categoryId],
  }
}

/**
 * Row mode — infinite scroll, capped at MAX_ROW_PAGES so it can't grow
 * without bound. Pass `enabled: false` while grid mode is active so it
 * stops fetching (existing cached data is retained, not cleared, so
 * collapsing back to row mode is instant if still within staleTime).
 */
export default function useCategoryMedia(section, categoryId, { enabled = true } = {}) {
  const { queryKeyBase, fetchFn } = resolveCategoryFetch(section, categoryId)

  return useInfiniteQuery({
    queryKey: queryKeyBase,
    queryFn: ({ pageParam }) => fetchFn(pageParam),
    initialPageParam: 1,
    getNextPageParam: cappedNextPageParam,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled,
  })
}

/**
 * Grid mode — one TMDB page per query, keyed by page number.
 * `keepPreviousData` means the previous page stays fully rendered while
 * the next one loads — drive any "refreshing" UI off this hook's own
 * `isPlaceholderData` / `isFetching`, not a transition's `isPending`,
 * since nothing here suspends and a plain useQuery has no concept of
 * "hold the old screen until the new one's data is ready."
 *
 * Also opportunistically prefetches page + 1 once the current page
 * lands, so clicking "Next" is usually already-cached rather than a
 * fresh round trip. prefetchQuery no-ops if that page is already fresh,
 * so this never duplicates an in-flight or still-valid fetch.
 */
export function useCategoryMediaGrid(section, categoryId, page, { enabled = true } = {}) {
  const queryClient = useQueryClient()

  // Memoized so this stays referentially stable across renders unless
  // section/categoryId actually change — resolveCategoryFetch() itself
  // returns a fresh array/closure every call, which would otherwise
  // re-fire the prefetch effect below on every unrelated render.
  const { queryKeyBase, fetchFn } = useMemo(
    () => resolveCategoryFetch(section, categoryId),
    [section, categoryId]
  )

  const query = useQuery({
    queryKey: [...queryKeyBase, 'grid', page],
    queryFn: () => fetchFn(page),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled,
  })

  const totalPages = query.data ? clampTotalPages(query.data.total_pages) : 1

  useEffect(() => {
    if (!enabled || !query.data) return
    if (page >= totalPages) return // nothing ahead to prefetch

    queryClient.prefetchQuery({
      queryKey: [...queryKeyBase, 'grid', page + 1],
      queryFn: () => fetchFn(page + 1),
      staleTime: STALE_TIME,
    })
  }, [enabled, query.data, page, totalPages, queryClient, queryKeyBase, fetchFn])

  return { ...query, totalPages }
}
