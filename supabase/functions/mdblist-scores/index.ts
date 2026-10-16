// mdblist-scores: IMDb, Rotten Tomatoes (critics + audience) and Metacritic scores of one title,
// looked up on MDBList by TMDB id.
//   POST { type: "movie" | "tv", tmdbId } → 200 { imdb, rtCritics, rtAudience, metacritic, rtPath }
//     (all null: MDBList doesn't know the title) · 400 bad input
//     → 502 MDBList failed or the daily quota is used up, nothing cached
// Only signed-in users reach this code: the gateway checks their JWT first (verify_jwt in config.toml).
import { json, preflight } from "../_shared/http.ts";
import { admin } from "../_shared/admin.ts";
import { expiresAt } from "../_shared/ttl.ts";
import { staleWhileRevalidate } from "../_shared/cache.ts";

const API_URL = "https://api.mdblist.com";
// A Supabase secret (supabase secrets set): never shipped to the browser
const API_KEY = Deno.env.get("MDBLIST_API_KEY");
const TIMEOUT_MS = 4000;

type MediaType = "movie" | "tv";
type Scores = {
  imdb: number | null; // 0–10
  rtCritics: number | null; // %
  rtAudience: number | null; // %
  metacritic: number | null; // 0–100
  rtPath: string | null; // path on rottentomatoes.com, e.g. /m/the_matrix
};
// found and year only decide the TTL; they aren't stored or returned
type Fetched = Scores & { found: boolean; year: number | null };
type CacheRow = {
  imdb_rating: number | null;
  rt_critics: number | null;
  rt_audience: number | null;
  metacritic: number | null;
  rt_path: string | null;
  expires_at: string;
};

const NOT_FOUND: Fetched = {
  imdb: null, rtCritics: null, rtAudience: null, metacritic: null, rtPath: null,
  found: false, year: null,
};

function isMediaType(value: unknown): value is MediaType {
  return value === "movie" || value === "tv";
}

function isTmdbId(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function toScores(row: CacheRow): Scores {
  return {
    imdb: row.imdb_rating,
    rtCritics: row.rt_critics,
    rtAudience: row.rt_audience,
    metacritic: row.metacritic,
    rtPath: row.rt_path,
  };
}

function hasScores(row: CacheRow): boolean {
  return [row.imdb_rating, row.rt_critics, row.rt_audience, row.metacritic].some((s) => s !== null);
}

async function readCache(type: MediaType, tmdbId: number): Promise<CacheRow | null> {
  const { data, error } = await admin
    .from("mdblist_cache")
    .select("imdb_rating, rt_critics, rt_audience, metacritic, rt_path, expires_at")
    .eq("media_type", type)
    .eq("tmdb_id", tmdbId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function writeCache(type: MediaType, tmdbId: number, fetched: Fetched): Promise<void> {
  const rated = [fetched.imdb, fetched.rtCritics, fetched.rtAudience, fetched.metacritic]
    .some((score) => score !== null);
  const expires = expiresAt({ found: fetched.found, rated, year: fetched.year });

  const { error } = await admin.from("mdblist_cache").upsert({
    media_type: type,
    tmdb_id: tmdbId,
    imdb_rating: fetched.imdb,
    rt_critics: fetched.rtCritics,
    rt_audience: fetched.rtAudience,
    metacritic: fetched.metacritic,
    rt_path: fetched.rtPath,
    expires_at: expires.toISOString(),
  });
  if (error) throw new Error(error.message);
}

// A 404 is "MDBList doesn't know this title" and is cached. Any other failure (429 = quota used
// up, timeout, 5xx) throws, so it's never cached.
async function fetchScores(type: MediaType, tmdbId: number): Promise<Fetched> {
  if (!API_KEY) throw new Error("MDBLIST_API_KEY is not set");

  // MDBList calls TV "show". Never log this URL: it carries the key.
  const res = await fetch(
    `${API_URL}/tmdb/${type === "tv" ? "show" : "movie"}/${tmdbId}?apikey=${API_KEY}`,
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  if (res.status === 404) return NOT_FOUND;
  if (!res.ok) throw new Error(`MDBList responded ${res.status}`);

  const data = await res.json();

  const ratingOf = (source: string) =>
    data.ratings?.find((rating: { source: string }) => rating.source === source);

  // Trust only the right types: an unexpected value becomes null instead of failing the write
  const valueOf = (source: string): number | null => {
    const value = ratingOf(source)?.value;
    return typeof value === "number" ? value : null;
  };
  const pathOf = (source: string): string | null => {
    const url = ratingOf(source)?.url;
    return typeof url === "string" && url.startsWith("/") ? url : null;
  };

  return {
    imdb: valueOf("imdb"),
    rtCritics: valueOf("tomatoes"),
    rtAudience: valueOf("popcorn"),
    metacritic: valueOf("metacritic"),
    rtPath: pathOf("tomatoes"),
    found: true,
    year: typeof data.year === "number" ? data.year : null,
  };
}

// A failure throws before writeCache, so it's never cached
async function lookup(type: MediaType, tmdbId: number): Promise<Scores> {
  const fetched = await fetchScores(type, tmdbId);
  await writeCache(type, tmdbId, fetched);
  const { found: _found, year: _year, ...scores } = fetched;
  return scores;
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const body = await req.json().catch(() => null);
  const type = body?.type;
  const tmdbId = body?.tmdbId;
  if (!isMediaType(type) || !isTmdbId(tmdbId)) {
    return json({ error: "Invalid type or tmdbId" }, 400);
  }

  try {
    const row = await readCache(type, tmdbId);
    const scores = await staleWhileRevalidate(row, {
      hasData: hasScores,
      fromRow: toScores,
      refresh: () => lookup(type, tmdbId),
    });
    return json(scores);
  } catch (error) {
    console.error(error);
    return json({ error: "Lookup failed" }, 502);
  }
});
