import { useQuery } from "@tanstack/react-query"
import { getWatchProviders } from "@/services/tmdb"
import { getStreamingIds } from "@/services/wikidata"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// A service listed in several plans or channels (with ads, Amazon channels) shows once
const BRANDS = ['netflix', 'disney', 'max', 'hbo', 'paramount', 'apple', 'amazon']
const MAX_PROVIDERS = 4

// The country's subscription services, one per brand, in TMDB's display order, plus TMDB's
// "where to watch" page for the country, the fallback link for a service without one of its own
function toWatchProviders(data, country) {
  const region = data.results?.[country]
  const byBrand = new Map()

  for (const p of region?.flatrate ?? []) {
    const name = p.provider_name.toLowerCase()
    const brand = BRANDS.find((b) => name.includes(b)) ?? name
    const kept = byBrand.get(brand)
    if (!kept || p.display_priority < kept.display_priority) byBrand.set(brand, p)
  }

  return {
    link: region?.link ?? null,
    providers: [...byBrand.values()]
      .sort((a, b) => a.display_priority - b.display_priority)
      .slice(0, MAX_PROVIDERS)
      .map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path ?? null })),
  }
}

// Fetched when the Streaming section opens; waits for the country (the profile's, cached by the navbar)
export function useWatchProviders(tmdbId, type, country) {
  return useQuery({
    queryKey: queryKeys.media.watchProviders(type, tmdbId, country),
    queryFn: async () => toWatchProviders(await getWatchProviders(tmdbId, type), country),
    enabled: !!tmdbId && !!country,
    ...CACHE.media,
  })
}

// The title's ids on the services that have one on Wikidata: { netflix: '26004747', apple: 'umc…' }
export function useStreamingIds(tmdbId, type) {
  return useQuery({
    queryKey: queryKeys.media.streamingIds(type, tmdbId),
    queryFn: async () => Object.fromEntries(
      Object.entries(await getStreamingIds(tmdbId, type)).map(([service, { value }]) => [service, value])
    ),
    enabled: !!tmdbId,
    ...CACHE.media,
  })
}
