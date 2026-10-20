import getTmdbImageUrl from '@/utils/tmdbImage'

// Home's LCP is the first best-rated poster, whose path only arrives with an RPC. The last one seen
// is kept so the /browse loader can fetch it while that RPC runs; a stale path costs one unused image.
const KEY = 'home-poster'

// The best-rated card's <img> sources. The early fetch uses the same srcset and sizes, so the browser
// picks the same file and the card reuses it.
export function bestRatedPosterSources(path) {
  return {
    src: getTmdbImageUrl(path, 'w342'),
    srcSet: `${getTmdbImageUrl(path, 'w185')} 185w, ${getTmdbImageUrl(path, 'w342')} 342w`,
    sizes: '(min-width: 640px) 180px, 45vw',
  }
}

export function saveHomePoster(path) {
  try {
    if (path) localStorage.setItem(KEY, path)
    else localStorage.removeItem(KEY)
  } catch { /* storage blocked: no early fetch */ }
}

export function preloadHomePoster() {
  let path
  try { path = localStorage.getItem(KEY) } catch { return }
  if (!path) return
  const { src, srcSet, sizes } = bestRatedPosterSources(path)
  const img = new Image()
  img.fetchPriority = 'high'
  img.sizes = sizes
  img.srcset = srcSet
  img.src = src
}
