import { useInfiniteQuery } from "@tanstack/react-query"
import {
  getTrending, getPopular, getTopRated,
  getUpcoming, getNowPlaying, getOnTheAir,
  getMediaByGenre,
} from "../../../services/tmdb"

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
const SECTION_TO_TYPE = { movies: 'movie', series: 'tv' }

/**
 * Single parameterised hook for all browse-page categories, including genres.
 *
 * Replaces the previous pattern of nine individual wrapper hooks (useTrendingMovies,
 * usePopularMovies, …) plus a CATEGORY_HOOKS dictionary lookup in CategoryMediaRow.
 *
 * The old dictionary approach was technically sound — BrowsePage mounts
 * CategoryMediaRow with `key={section.categoryId}`, forcing a full remount on
 * every category change, so each component instance only ever called one hook
 * for its entire lifetime (no hook-order violation). We're switching to a
 * parameterised hook instead because you can't pre-write a named hook for every
 * possible TMDB genre id; a single hook that branches on the categoryId is the
 * only clean way to support the open-ended genre set.
 *
 * Genre detection: CategoryRail emits categoryIds like "genre-28" for genres.
 * We detect the "genre-" prefix, strip it to extract the raw TMDB genre id,
 * and route to the /discover endpoint via getMediaByGenre(). Non-genre
 * categories resolve through the static FETCH_MAP exactly as before.
 *
 * @param {'movies'|'series'} section  — which rail section is active
 * @param {string} categoryId — e.g. "trending", "popular", or "genre-28"
 */
export default function useCategoryMedia(section, categoryId) {
  // Determine whether this is a genre category or a static category.
  const isGenre = categoryId.startsWith('genre-')

  let queryKey
  let fetchFn

  if (isGenre) {
    // Genre category: strip the "genre-" prefix to get the raw TMDB genre id
    // (e.g. "genre-28" → "28"), then use the /discover endpoint.
    const genreId = categoryId.slice(6)
    const type = SECTION_TO_TYPE[section]
    queryKey = ['browse', 'genre', type, genreId]
    fetchFn = (page) => getMediaByGenre(type, genreId, page)
  } else {
    // Static category: look up the pre-defined fetch function from FETCH_MAP.
    const type = SECTION_TO_TYPE[section]
    queryKey = ['browse', categoryId, type]
    fetchFn = FETCH_MAP[section]?.[categoryId]
  }

  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 1 }) => fetchFn(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 15,
  })
}
