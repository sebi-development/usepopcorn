const q = encodeURIComponent

// One entry per service: its TMDB provider ids (plans and ad tiers included), its title page from the
// Wikidata id (formats from Wikidata's own formatter URLs), and its search where that works from a link.
// Disney+ search 404s from a link and Max's Wikidata ids are an old format, so each has one way only.
const SERVICES = [
  { key: 'netflix', providerIds: [8, 175, 1796], direct: (id) => `https://www.netflix.com/title/${id}`, search: (title) => `https://www.netflix.com/search?q=${q(title)}` },
  { key: 'prime', providerIds: [9, 119, 613, 2100], direct: (id) => `https://www.primevideo.com/detail/${id}`, search: (title) => `https://www.primevideo.com/search?phrase=${q(title)}` },
  { key: 'apple', providerIds: [350], direct: (id, type) => `https://tv.apple.com/${type === 'tv' ? 'show' : 'movie'}/${id}`, search: (title) => `https://tv.apple.com/search?term=${q(title)}` },
  { key: 'disney', providerIds: [337], direct: (id) => `https://www.disneyplus.com/browse/${id}` },
  { key: 'max', providerIds: [384, 1899], search: (title) => `https://play.hbomax.com/search?q=${q(title)}` },
  { key: 'hulu', providerIds: [15], direct: (id, type) => `https://www.hulu.com/${type === 'tv' ? 'series' : 'movie'}/${id}` },
  { key: 'peacock', providerIds: [386, 387], direct: (id) => `https://www.peacocktv.com/stream-${id}` },
]
const BY_PROVIDER = new Map(SERVICES.flatMap((service) => service.providerIds.map((id) => [id, service])))

// The title's page on the service ('title'), else a search there ('search'), else TMDB's "where to
// watch" page for the country ('where'), passed in as `fallback`
export function streamingLink(providerId, { ids, title, type, fallback }) {
  const service = BY_PROVIDER.get(providerId)
  const id = ids?.[service?.key]
  if (id && service.direct) return { href: service.direct(id, type), kind: 'title' }
  if (service?.search) return { href: service.search(title), kind: 'search' }
  return { href: fallback, kind: 'where' }
}
