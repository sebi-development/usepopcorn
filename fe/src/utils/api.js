import store from '../store'
import { BACKEND_URL } from './config'

async function request(path, options = {}) {
  const token = store.getState().auth.token

  if (!token) throw new Error('Not authenticated')

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) throw new Error(data.error)

  return data
}

export function getWatchedMovies() {
  return request('/watched')
}

export function addWatchedMovie(movie) {
  return request('/watched', {
    method: 'POST',
    body: JSON.stringify(movie),
  })
}

export function deleteWatchedMovie(imdbID) {
  return request(`/watched/${imdbID}`, {
    method: 'DELETE',
  })
}