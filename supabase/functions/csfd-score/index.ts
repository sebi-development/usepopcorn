// csfd-score: the ČSFD rating of one title, looked up by IMDb id.
//   POST { imdbId } → 200 { csfdId, rating } (both null: no ČSFD match) · 400 bad input
//                   → 502 Wikidata or ČSFD failed, nothing cached
// Only signed-in users reach this code: the gateway checks their JWT first (verify_jwt in config.toml).
import { csfd, CsfdError } from "node-csfd-api";
import { resolveCsfdId } from "./wikidata.ts";
import { json, preflight } from "../_shared/http.ts";
import { admin } from "../_shared/admin.ts";
import { expiresAt } from "../_shared/ttl.ts";
import { staleWhileRevalidate } from "../_shared/cache.ts";

// rating null with a csfdId: on ČSFD, not rated yet
type CsfdScore = { csfdId: number | null; rating: number | null };
// year only decides the TTL; it isn't stored or returned
type CsfdFilm = CsfdScore & { year: number | null };
type CacheRow = { csfd_id: number | null; rating: number | null; expires_at: string };

// This check is what makes it safe to put the id into the SPARQL query
function isImdbId(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const regex = /^tt\d{7,10}$/;
  return regex.test(value);
}

async function readCache(imdbId: string): Promise<CacheRow | null> {
  const { data, error } = await admin
    .from("csfd_cache")
    .select("csfd_id, rating, expires_at")
    .eq("imdb_id", imdbId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

// A 404 from ČSFD means the id is dead: cached as "no match". Any other error throws.
async function fetchFilm(csfdId: number): Promise<CsfdFilm> {
  try {
    const { rating, year } = await csfd.movie(csfdId);
    return { csfdId, rating, year: Number(year) || null };
  } catch (error) {
    if (error instanceof CsfdError && error.reason === "not-found") {
      return { csfdId: null, rating: null, year: null };
    }
    throw error;
  }
}

async function writeCache(imdbId: string, film: CsfdFilm): Promise<void> {
  const expires = expiresAt({ found: film.csfdId !== null, rated: film.rating !== null, year: film.year });
  const { error } = await admin.from("csfd_cache").upsert({
    imdb_id: imdbId,
    csfd_id: film.csfdId,
    rating: film.rating,
    expires_at: expires.toISOString(),
  });
  if (error) throw new Error(error.message);
}

// A failure throws before writeCache, so it's never cached
async function lookup(imdbId: string, knownCsfdId: number | null): Promise<CsfdScore> {
  const csfdId = knownCsfdId ?? await resolveCsfdId(imdbId);

  const film: CsfdFilm = csfdId === null
    ? { csfdId: null, rating: null, year: null }
    : await fetchFilm(csfdId);

  await writeCache(imdbId, film);
  return { csfdId: film.csfdId, rating: film.rating };
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const body = await req.json().catch(() => null);
  const imdbId = body?.imdbId;
  if (!isImdbId(imdbId)) return json({ error: "Invalid imdbId" }, 400);

  try {
    const row = await readCache(imdbId);
    const score = await staleWhileRevalidate(row, {
      hasData: (row) => row.rating !== null,
      fromRow: (row) => ({ csfdId: row.csfd_id, rating: row.rating }),
      // A ČSFD id we already know skips Wikidata: the mapping never changes
      refresh: () => lookup(imdbId, row?.csfd_id ?? null),
    });
    return json(score);
  } catch (error) {
    console.error(error);
    return json({ error: "Lookup failed" }, 502);
  }
});
