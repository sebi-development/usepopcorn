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
  return tmdbFetch(`/search/${type}?query=${encodeURIComponent(query)}`)
}

export async function getMediaDetails(id, type = 'movie') {
  // credits is only read for a movie's director, so series don't request it.
  // recommendations feeds the Similar tab and tells the page whether to show it, without a second request.
  const append = type === 'movie'
    ? '?append_to_response=release_dates,watch%2Fproviders,credits,recommendations' // movies endpoint
    : '?append_to_response=content_ratings,watch%2Fproviders,external_ids,recommendations'; // series endpoint
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

// /discover is the one TMDB list endpoint that filters (genre, dates, country, language...).
// `params` is a plain object of TMDB query params; null / undefined values are skipped.
export async function discoverMedia(type = 'movie', params = {}, page = 1) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value != null) query.set(key, value)
  }
  query.set('page', page)
  return tmdbFetch(`/discover/${type}?${query}`)
}

// Movie-only category — no series equivalent exists on TMDB.
export async function getNowPlaying(page = 1) {
  return tmdbFetch(`/movie/now_playing?page=${page}`)
}

// Series-only category — closest analogue to "upcoming" for TV,
export async function getOnTheAir(page = 1) {
  return tmdbFetch(`/tv/on_the_air?page=${page}`)
}

export async function getRecommendations(id, type = 'movie', page = 1) {
  return tmdbFetch(`/${type}/${id}/recommendations?page=${page}`)
}