import { addDays, addMonths, subWeeks, format } from 'date-fns'
import usePagedList from "@/hooks/usePagedList"
import usePagedGrid from "@/hooks/usePagedGrid"
import { MAX_PAGES, fromTmdb } from "@/utils/pagination"
import { isEmptyFilters, filteredCache } from "@/utils/filters"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"
import {
  getTrending, getPopular, getTopRated,
  getNowPlaying, getOnTheAir, discoverMedia,
} from "@/services/tmdb"

const day = (date) => format(date, 'yyyy-MM-dd')

// Both "Upcoming" rows call this — one function, called twice, so the two
// windows are always tiled correctly and can never drift out of sync.
function getUpcomingWindows() {
  const thisMonthMin = addDays(new Date(), 1)
  const thisMonthMax = addMonths(thisMonthMin, 1)
  const nextMonthMin = addDays(thisMonthMax, 1)
  const nextMonthMax = addMonths(nextMonthMin, 1)

  return {
    thisMonth: { minDate: day(thisMonthMin), maxDate: day(thisMonthMax) },
    nextMonth: { minDate: day(nextMonthMin), maxDate: day(nextMonthMax) },
  }
}

const upcomingParams = ({ minDate, maxDate }) => ({
  sort_by: 'popularity.desc',
  with_release_type: '2|3',
  'release_date.gte': minDate,
  'release_date.lte': maxDate,
})

const genreParams = (genreId) => ({ with_genres: genreId, sort_by: 'popularity.desc' })

// TMDB /discover params that reproduce a category, so a filtered category can still be served
// (the dedicated endpoints like /movie/top_rated take no filters). Trending has no equivalent and
// is never filtered. Top rated needs a vote floor, or 10/10 titles with three votes would lead.
const CATEGORY_DISCOVER = {
  movies: {
    popular: () => ({ sort_by: 'popularity.desc' }),
    top_rated: () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 300 }),
    upcoming: () => upcomingParams(getUpcomingWindows().thisMonth),
    upcoming_next_month: () => upcomingParams(getUpcomingWindows().nextMonth),
    now_playing: () => ({
      sort_by: 'popularity.desc',
      with_release_type: '2|3',
      'release_date.gte': day(subWeeks(new Date(), 6)),
      'release_date.lte': day(new Date()),
    }),
  },
  series: {
    popular: () => ({ sort_by: 'popularity.desc' }),
    top_rated: () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 200 }),
    on_the_air: () => ({
      sort_by: 'popularity.desc',
      'air_date.gte': day(new Date()),
      'air_date.lte': day(addDays(new Date(), 7)),
    }),
  },
}

// Browse filters (src/features/browse/constants/filters.js) → /discover params. Multi values are
// pipe-joined, which /discover reads as OR.
function toDiscoverParams({ genre, year, country, language }, type) {
  return {
    with_genres: genre?.join('|'),
    [type === 'movie' ? 'primary_release_year' : 'first_air_date_year']: year,
    with_origin_country: country?.join('|'),
    with_original_language: language?.join('|'),
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
    upcoming: (page) => discoverMedia('movie', CATEGORY_DISCOVER.movies.upcoming(), page),
    upcoming_next_month: (page) => discoverMedia('movie', CATEGORY_DISCOVER.movies.upcoming_next_month(), page),
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

// Shared between the row (infinite) and grid (paginated) hooks — one place
// that knows how to turn a section + categoryId (+ filters) into a paged TMDB
// fetcher and a base query key, including genre detection. CategoryRail emits
// categoryIds like "genre-28"; we strip the prefix and route to /discover.
// Unfiltered categories keep their own endpoints and keys; any active filter
// switches to /discover under a key that holds the filters, with a shorter
// cache lifetime (`cache`).
function resolveCategoryFetch(section, categoryId, filters) {
  const type = SECTION_TO_TYPE[section]
  const genreId = categoryId.startsWith('genre-') ? categoryId.slice(6) : null

  if (!isEmptyFilters(filters)) {
    const base = genreId ? genreParams(genreId) : CATEGORY_DISCOVER[section]?.[categoryId]?.()
    const params = { ...base, ...toDiscoverParams(filters, type) }
    return {
      queryKeyBase: queryKeys.media.discover(type, categoryId, filters),
      fetchPage: fromTmdb((page) => discoverMedia(type, params, page)),
      cache: filteredCache(CACHE.mediaList, filters),
    }
  }

  if (genreId) {
    return {
      queryKeyBase: queryKeys.media.genre(type, genreId),
      fetchPage: fromTmdb((page) => discoverMedia(type, genreParams(genreId), page)),
      cache: CACHE.mediaList,
    }
  }

  return {
    queryKeyBase: queryKeys.media.category(type, categoryId),
    fetchPage: fromTmdb(FETCH_MAP[section]?.[categoryId]),
    cache: CACHE.mediaList,
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
export default function useCategoryMedia(section, categoryId, { enabled = true, filters } = {}) {
  const { queryKeyBase, fetchPage, cache } = resolveCategoryFetch(section, categoryId, filters)

  return usePagedList({
    queryKey: queryKeyBase,
    fetchPage,
    autoPages: MAX_PAGES,
    ...cache,
    enabled,
  })
}

/**
 * Grid mode — one TMDB page per query, keyed by page number. See
 * usePagedGrid for the keepPreviousData / next-page prefetch behaviour.
 */
export function useCategoryMediaGrid(section, categoryId, page, { enabled = true, filters } = {}) {
  const { queryKeyBase, fetchPage, cache } = resolveCategoryFetch(section, categoryId, filters)

  return usePagedGrid({
    queryKey: queryKeyBase,
    fetchPage,
    page,
    enabled,
    ...cache,
  })
}
