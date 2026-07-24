/**
 * Memoized lazy promise for fetching the user's ISO country code via IP.
 *
 * - Does NOT fire until explicitly called (lazy) — no wasted API calls on landing page.
 * - Calling it multiple times returns the exact same Promise (memoized) — only 1 fetch per session.
 * - Has a 3-second timeout so it never blocks the signup flow.
 * - Fails gracefully — always resolves with null on any failure.
 */

let cachedPromise = null;

export function getCountry() {
  // If a fetch is already in-flight or already resolved, return the same Promise.
  if (cachedPromise) return cachedPromise;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  cachedPromise = fetch('https://ipapi.co/json/', { signal: controller.signal })
    .then(res => {
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      return res.json().then(data => data.country_code ?? null);
    })
    .catch(error => {
      // Silently handle: ad-blockers, timeouts, network failures
      console.warn('Geolocation skipped. Defaulting to null.', error.message);
      return null;
    });

  return cachedPromise;
}