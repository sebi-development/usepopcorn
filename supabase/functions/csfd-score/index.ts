// csfd-score: the ČSFD rating of one title, looked up by IMDb id.
//   POST { imdbId } → 200 { csfdId, rating }   both null when ČSFD has no match
//                   → 400 bad input · 405 wrong method · 502 Wikidata or ČSFD failed (nothing cached)
// Only signed-in users reach this code: the gateway checks their JWT first (verify_jwt in config.toml).
import { createClient } from "@supabase/supabase-js";
import { csfd, CsfdError } from "node-csfd-api";
import { resolveCsfdId } from "./wikidata.ts";

// What the caller gets back. Both null: ČSFD has no match. rating null: on ČSFD, not rated yet.
type CsfdScore = { csfdId: number | null; rating: number | null };
// What we learned about one film. The release year only decides the TTL; it isn't stored or returned.
type CsfdFilm = CsfdScore & { year: number | null };
type CacheRow = { csfd_id: number | null; rating: number | null; expires_at: string };

// Supabase runtime: keeps the isolate alive until the promise settles, after the response is sent
declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };

// The app calls this from another origin with an Authorization header, so the browser first sends
// an OPTIONS request (preflight) asking whether that's allowed. These headers say yes.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders });
}

const secretKey = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const admin = createClient(Deno.env.get("SUPABASE_URL")!, secretKey, {
  auth: { persistSession: false },
});

// 'tt' followed by 7–10 digits. This check is what makes it safe to put the id into SPARQL.
function isImdbId(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const regex = /^tt\d{7,10}$/;
  return regex.test(value);
}

// A database error throws (→ 502) instead of counting as a miss
async function readCache(imdbId: string): Promise<CacheRow | null> {
  const { data, error } = await admin
    .from("csfd_cache")
    .select("csfd_id, rating, expires_at")
    .eq("imdb_id", imdbId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

const TTL_DAYS = {
  notFound: 14,
  unrated: 3,
  ratedRecent: 7,
  ratedSettled: 30,
  ratedOld: 90,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS);

function expiresAt({ csfdId, rating, year }: CsfdFilm): Date {
  if (csfdId === null) return daysFromNow(TTL_DAYS.notFound);
  if (rating === null) return daysFromNow(TTL_DAYS.unrated);

  // Unknown year counts as recent: the shorter TTL is the safe side
  const age = year === null ? 0 : new Date().getFullYear() - year;
  if (age <= 1) return daysFromNow(TTL_DAYS.ratedRecent);
  if (age <= 5) return daysFromNow(TTL_DAYS.ratedSettled);
  return daysFromNow(TTL_DAYS.ratedOld);
}

function isFresh(row: CacheRow): boolean {
  return new Date(row.expires_at).getTime() > Date.now();
}

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
  const { error } = await admin.from("csfd_cache").upsert({
    imdb_id: imdbId,
    csfd_id: film.csfdId,
    rating: film.rating,
    expires_at: expiresAt(film).toISOString(),
  });
  if (error) throw new Error(error.message);
}

async function lookup(imdbId: string, knownCsfdId: number | null): Promise<CsfdScore> {
  const csfdId = knownCsfdId ?? await resolveCsfdId(imdbId);

  const film: CsfdFilm = csfdId === null
    ? { csfdId: null, rating: null, year: null }
    : await fetchFilm(csfdId);

  await writeCache(imdbId, film);
  return { csfdId: film.csfdId, rating: film.rating };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = await req.json().catch(() => null);
  const imdbId = body?.imdbId;
  if (!isImdbId(imdbId)) return json({ error: "Invalid imdbId" }, 400);

  try {
    const row = await readCache(imdbId);

    if (row && isFresh(row)) {
      return json({ csfdId: row.csfd_id, rating: row.rating });
    }

    // Expired but rated: answer with the old rating now, refresh behind the response
    if (row && row.rating !== null) {
      EdgeRuntime.waitUntil(lookup(imdbId, row.csfd_id).catch(console.error));
      return json({ csfdId: row.csfd_id, rating: row.rating });
    }

    return json(await lookup(imdbId, row?.csfd_id ?? null));
  } catch (error) {
    console.error(error);
    return json({ error: "Lookup failed" }, 502);
  }
});
