import { addDays, addMonths, format } from 'date-fns'
import usePagedList from "@/hooks/usePagedList"
import usePagedGrid from "@/hooks/usePagedGrid"
import { MAX_PAGES, fromTmdb } from "@/utils/pagination"
import {
  getTrending, getPopular, getTopRated,
  getUpcoming, getNowPlaying, getOnTheAir,
  getMediaByGenre,
} from "@/services/tmdb"

// Both "Upcoming" rows call this — one function, called twice, so the two
// windows are always tiled correctly and can never drift out of sync.
function getUpcomingWindows() {
  const thisMonthMin = addDays(new Date(), 1)
  const thisMonthMax = addMonths(thisMonthMin, 1)
  const nextMonthMin = addDays(thisMonthMax, 1)
  const nextMonthMax = addMonths(nextMonthMin, 1)

  return {
    thisMonth: { minDate: format(thisMonthMin, 'yyyy-MM-dd'), maxDate: format(thisMonthMax, 'yyyy-MM-dd') },
    nextMonth: { minDate: format(nextMonthMin, 'yyyy-MM-dd'), maxDate: format(nextMonthMax, 'yyyy-MM-dd') },
  }
}

// Maps section + categoryId → the TMDB fetch function for static (non-genre)
// categories. Each function takes a single `page` argument and returns a TMDB
// paginated response.
const FETCH_MAP = {
  movies: {
    trending: (page) => getTrending('movie', page),
    popular: (page) => getPopular('movie', page),
    top_rated: (page) => getTopRated('movie', page),
    upcoming: (page) => getUpcoming(page, getUpcomingWindows().thisMonth.minDate, getUpcomingWindows().thisMonth.maxDate),
    upcoming_next_month: (page) => getUpcoming(page, getUpcomingWindows().nextMonth.minDate, getUpcomingWindows().nextMonth.maxDate),
    now_playing: (page) => getNowPlaying(page),
  },
  series: {
    trending: (page) => getTrending('tv', page),
    popular: (page) => getPopular('tv', page),
    top_rated: (page) => getTopRated('tv', page),
    on_the_air: (page) => getOnTheAir(page),
  },
}

// Maps browse-page section names to TMDB's media-type path segments.
export const SECTION_TO_TYPE = { movies: 'movie', series: 'tv' }

// Shared across row and grid so the two don't drift. Matching gcTime to
// staleTime — data past staleTime refetches anyway, so a longer gcTime
// just keeps stale objects in memory for no benefit during rapid browsing.
const STALE_TIME = 1000 * 60 * 15
const GC_TIME = 1000 * 60 * 15

// Shared between the row (infinite) and grid (paginated) hooks — one place
// that knows how to turn a section + categoryId into a paged TMDB fetcher
// and a base query key, including genre detection. CategoryRail emits
// categoryIds like "genre-28"; we strip the prefix and route to /discover.
function resolveCategoryFetch(section, categoryId) {
  const type = SECTION_TO_TYPE[section]
  const isGenre = categoryId.startsWith('genre-')

  if (isGenre) {
    const genreId = categoryId.slice(6)
    return {
      queryKeyBase: ['browse', 'genre', type, genreId],
      fetchPage: fromTmdb((page) => getMediaByGenre(type, genreId, page)),
    }
  }

  return {
    queryKeyBase: ['browse', categoryId, type],
    fetchPage: fromTmdb(FETCH_MAP[section]?.[categoryId]),
  }
}

/**
 * Row mode — infinite scroll, capped at MAX_PAGES by usePagedList so it can't
 * grow without bound. Rows scroll horizontally and have no room for a
 * "Load more" button, so every page up to the cap loads automatically.
 * Pass `enabled: false` while grid mode is active so it stops fetching
 * (existing cached data is retained, not cleared, so collapsing back to row
 * mode is instant if still within staleTime).
 */
export default function useCategoryMedia(section, categoryId, { enabled = true } = {}) {
  const { queryKeyBase, fetchPage } = resolveCategoryFetch(section, categoryId)

  return usePagedList({
    queryKey: queryKeyBase,
    fetchPage,
    autoPages: MAX_PAGES,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled,
  })
}

/**
 * Grid mode — one TMDB page per query, keyed by page number. See
 * usePagedGrid for the keepPreviousData / next-page prefetch behaviour.
 */
export function useCategoryMediaGrid(section, categoryId, page, { enabled = true } = {}) {
  const { queryKeyBase, fetchPage } = resolveCategoryFetch(section, categoryId)

  return usePagedGrid({
    queryKey: queryKeyBase,
    fetchPage,
    page,
    enabled,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  })
}
