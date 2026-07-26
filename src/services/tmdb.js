const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

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
    ? '?append_to_response=release_dates,watch%2Fproviders'
    : '?append_to_response=watch%2Fproviders'
  return tmdbFetch(`/${type}/${id}${append}`)
}

// CATEGORIES
export async function getNowPlaying(page = 1) {
  return tmdbFetch(`/movie/now_playing?language=en-US&page=${page}`)
}

export async function getTrending(page = 1) {
  return tmdbFetch(`/trending/movie/week?page=${page}`)
}

export async function getPopular(page = 1) {
  return tmdbFetch(`/movie/popular?page=${page}`)
}