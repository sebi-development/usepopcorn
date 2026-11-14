// The visitor's ISO country code from their IP, or null (any failure, or no answer within 3 s). Requested
// only when first asked for (the auth forms warm it on hover), then shared by every later call.
let country

export function getCountry() {
  country ??= fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => data?.country_code ?? null)
    .catch(() => null)
  return country
}
