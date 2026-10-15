
const ENDPOINT = "https://query.wikidata.org/sparql";
const USER_AGENT = "usepopcorn-csfd/1.0 (https://github.com/sebi-development/usepopcorn)";
const TIMEOUT_MS = 4000;

// Resolves null when Wikidata has no mapping. Throws when Wikidata can't be asked (non-2xx status,
// timeout), so the caller answers 502 instead of caching a "not found" that isn't true.
export async function resolveCsfdId(imdbId: string): Promise<number | null> {
  const query = `SELECT ?csfd WHERE { ?item wdt:P345 "${imdbId}" ; wdt:P2529 ?csfd } LIMIT 1`;
  const res = await fetch(`${ENDPOINT}?query=${encodeURIComponent(query)}&format=json`, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Wikidata responded ${res.status}`);

  const data = await res.json();
  const value = data.results?.bindings?.[0]?.csfd?.value;
  const csfdId = Number(value);
  return Number.isInteger(csfdId) && csfdId > 0 ? csfdId : null;
}
