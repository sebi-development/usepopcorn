const ENDPOINT = 'https://query.wikidata.org/sparql'

const awardsQuery = (tmdbId) => `SELECT ?kind ?awardLabel ?time ?workLabel ?movie ?tv WHERE {
  ?p wdt:P4985 "${tmdbId}" .
  { ?p p:P166 ?s . ?s ps:P166 ?award . BIND("win" AS ?kind) }
  UNION { ?p p:P1411 ?s . ?s ps:P1411 ?award . BIND("nomination" AS ?kind) }
  OPTIONAL { ?s pq:P585 ?time }
  OPTIONAL { ?s pq:P1686 ?work . OPTIONAL { ?work wdt:P4947 ?movie } OPTIONAL { ?work wdt:P4983 ?tv } }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,mul" . }
}`

// Labels: "mul" after "en", because Wikidata keeps a name that is the same in every language (most film
// titles) only as a multilingual label; asking for "en" alone returns the bare Q-id for those.
// A plain GET with no custom headers: a simple CORS request, so the browser sends no preflight.
// Returns the raw SPARQL rows; usePersonAwards trims them.
export async function getPersonAwards(tmdbId) {
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) throw new Error('Invalid person id')
  const params = new URLSearchParams({ format: 'json', query: awardsQuery(tmdbId) })
  const res = await fetch(`${ENDPOINT}?${params}`)
  if (!res.ok) throw new Error(`Wikidata error: ${res.status}`)
  const { results } = await res.json()
  return results.bindings
}
