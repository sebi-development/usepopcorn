const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

// ── TMDB queries ──────────────────────────────────────────────
async function tmdbFetch(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`
    }
  })
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

export async function searchContent(query, type = 'movie') {
  return tmdbFetch(`/search/${type}?query=${query}`)
}

export async function getMediaDetails(id, type = 'movie') {
  const append = type === 'movie'
    ? '?append_to_response=release_dates,watch%2Fproviders' // movies endpoint
    : '?append_to_response=content_ratings,watch%2Fproviders,external_ids'; // series endpoint
  return tmdbFetch(`/${type}/${id}${append}`);
}

export async function getSeasonDetails(tvId, seasonNumber) {
  return tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`)
}

// ── CATEGORIES ──────────────────────────────────────────────
// Shared shape across movie and series: trending, popular, top_rated.

export async function getTrending(type = 'movie', page = 1) {
  return tmdbFetch(`/trending/${type}/week?page=${page}`)
}

export async function getPopular(type = 'movie', page = 1) {
  return tmdbFetch(`/${type}/popular?page=${page}`)
}

export async function getTopRated(type = 'movie', page = 1) {
  return tmdbFetch(`/${type}/top_rated?page=${page}`)
}

// Movie-only categories — no series equivalent exists on TMDB.
export async function getUpcoming(page = 1) {
  return tmdbFetch(`/movie/upcoming?page=${page}`)
}

export async function getNowPlaying(page = 1) {
  return tmdbFetch(`/movie/now_playing?page=${page}`)
}

// Series-only category — closest analogue to "upcoming" for TV,
export async function getOnTheAir(page = 1) {
  return tmdbFetch(`/tv/on_the_air?page=${page}`)
}

// Genre-based discovery — used by the browse page when a genre is selected
// from the CategoryRail. TMDB's /discover endpoint filters by genre id.
export async function getMediaByGenre(type = 'movie', genreId, page = 1) {
  return tmdbFetch(`/discover/${type}?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`)
}