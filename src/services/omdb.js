const BASE_URL = 'https://www.omdbapi.com'
const API_KEY = import.meta.env.VITE_OMDB_API_KEY

export async function getOmdbScores(imdbId) {
  const res = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${imdbId}`)

  if (!res.ok) throw new Error('Network error connecting to OMDb api')

  const data = await res.json()

  if (data.Response === "False") {
    throw new Error(data.Error || 'OMDb API Error')
  }
  return data
}