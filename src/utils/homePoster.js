import getTmdbImageUrl from '@/utils/tmdbImage'

// Home's LCP is the first best-rated poster, whose path only arrives with an RPC. The last one seen is
// kept between visits so the /browse loader can fetch it while that RPC runs. The entry is single-use:
// read and removed at load, written again when the tab is hidden. A stale path costs one unused image.
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
  try {
    path = localStorage.getItem(KEY)
    localStorage.removeItem(KEY)
  } catch { return }
  if (!path) return
  const { src, srcSet, sizes } = bestRatedPosterSources(path)
  const img = new Image()
  img.fetchPriority = 'high'
  img.sizes = sizes
  img.srcset = srcSet
  img.src = src
}

let remembering = false

// Saves getPath() when the page is hidden (tab switch, close, navigation away), so the entry only
// exists while the app isn't open. Safe to call on every load: it registers once.
export function rememberHomePosterOnHide(getPath) {
  if (remembering) return
  remembering = true
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveHomePoster(getPath())
  })
}
