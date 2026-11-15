const ENDPOINT = 'https://query.wikidata.org/sparql'

const awardsQuery = (tmdbId) => `SELECT ?kind ?awardLabel ?time ?workLabel ?movie ?tv WHERE {
  ?p wdt:P4985 "${tmdbId}" .
  { ?p p:P166 ?s . ?s ps:P166 ?award . BIND("win" AS ?kind) }
  UNION { ?p p:P1411 ?s . ?s ps:P1411 ?award . BIND("nomination" AS ?kind) }
  OPTIONAL { ?s pq:P585 ?time }
  OPTIONAL { ?s pq:P1686 ?work . OPTIONAL { ?work wdt:P4947 ?movie } OPTIONAL { ?work wdt:P4983 ?tv } }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,mul" . }
}`

// A title's ids on the streaming services. TMDB movie and TV ids overlap, so the lookup property follows
// the type; SAMPLE keeps one value per service in a single row.
const streamingIdsQuery = (tmdbId, isTV) => `SELECT (SAMPLE(?n) AS ?netflix) (SAMPLE(?d) AS ?disney)
  (SAMPLE(?a) AS ?apple) (SAMPLE(?p) AS ?prime) (SAMPLE(?h) AS ?hulu) (SAMPLE(?k) AS ?peacock) WHERE {
  ?item wdt:${isTV ? 'P4983' : 'P4947'} "${tmdbId}" .
  OPTIONAL { ?item wdt:P1874 ?n }
  OPTIONAL { ?item wdt:P13902 ?d }
  OPTIONAL { ?item wdt:${isTV ? 'P9751' : 'P9586'} ?a }
  OPTIONAL { ?item wdt:P14462 ?p }
  OPTIONAL { ?item wdt:${isTV ? 'P6467' : 'P6466'} ?h }
  OPTIONAL { ?item wdt:P11815 ?k }
}`

// A plain GET with no custom headers: a simple CORS request, so the browser sends no preflight
async function sparql(query) {
  const params = new URLSearchParams({ format: 'json', query })
  const res = await fetch(`${ENDPOINT}?${params}`)
  if (!res.ok) throw new Error(`Wikidata error: ${res.status}`)
  const { results } = await res.json()
  return results.bindings
}

// Labels: "mul" after "en", because Wikidata keeps a name that is the same in every language (most film
// titles) only as a multilingual label; asking for "en" alone returns the bare Q-id for those.
// Returns the raw SPARQL rows; usePersonAwards trims them.
export async function getPersonAwards(tmdbId) {
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) throw new Error('Invalid person id')
  return sparql(awardsQuery(tmdbId))
}

// Returns the one SPARQL row (empty when Wikidata doesn't know the title); useStreamingIds trims it
export async function getStreamingIds(tmdbId, type = 'movie') {
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) throw new Error('Invalid title id')
  const [row] = await sparql(streamingIdsQuery(tmdbId, type === 'tv'))
  return row ?? {}
}
