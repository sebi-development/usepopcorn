const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

/**
 * TMDB image sizes for posters:
 *   w92  – tiny thumbnails (≤64px containers)
 *   w154 – small thumbnails
 *   w185 – search results, list items (~80px wide)
 *   w342 – grid cards (~160-200px wide)
 *   w500 – detail page posters, hero images
 *   w780 – full-width / high-DPI detail posters
 *   original – raw upload (avoid in production)
 */

export default function getTmdbImageUrl(path, size = 'w500') {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}
