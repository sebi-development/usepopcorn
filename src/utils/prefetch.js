// Prefetch a lazy chunk without blocking — resolves the dynamic import so
// the module is cached by the time the user navigates to it.
export function prefetch(factory) {
  factory().catch(() => {/* network fail is fine — the route's lazy() imports it again on navigation */})
}

// ric with a setTimeout fallback for environments without requestIdleCallback.
export function onIdle(cb) {
  if ('requestIdleCallback' in window) requestIdleCallback(cb, { timeout: 3000 })
  else setTimeout(cb, 200)
}

// Calls cb in an idle slot after the page's first contentful paint, so a prefetch never competes with
// it (an SPA's load event can fire before React has painted). Falls back to load without paint timing.
export function afterFirstPaint(cb) {
  if (performance.getEntriesByName('first-contentful-paint').length) return onIdle(cb)
  if (!PerformanceObserver.supportedEntryTypes?.includes('paint')) {
    return addEventListener('load', () => onIdle(cb), { once: true })
  }
  const observer = new PerformanceObserver((list) => {
    if (!list.getEntriesByName('first-contentful-paint').length) return
    observer.disconnect()
    onIdle(cb)
  })
  observer.observe({ type: 'paint' })
}

// Calls cb in an idle slot once no query is fetching, so prefetches don't share a slow link with the
// first screen's data. Checks again after each wait: the render a result triggers can start new queries.
export function whenQueriesSettle(queryClient, cb) {
  onIdle(() => {
    if (!queryClient.isFetching()) return cb()
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      if (queryClient.isFetching()) return
      unsubscribe()
      whenQueriesSettle(queryClient, cb)
    })
  })
}
