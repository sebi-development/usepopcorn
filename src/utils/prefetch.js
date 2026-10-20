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
