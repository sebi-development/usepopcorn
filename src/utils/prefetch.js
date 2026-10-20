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
