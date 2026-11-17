// watch-providers: which of the big streaming services (SERVICES) carry a list of titles in one country,
// from TMDB, cached per title and country in watch_providers_cache. Used by /watchlist's Streaming filter.
//   POST { region: "CZ", titles: [["movie", 603], ["tv", 1396]] }
//     → 200 { services: { netflix: "Netflix" }, titles: { "movie:603": ["netflix"] } }
//       (a title on none of them, or whose TMDB lookup failed, is left out) · 400 bad input
//     → 502 the cache read failed
// Only signed-in users reach this code: the gateway checks their JWT first (verify_jwt in config.toml).
import { inBackground, json, preflight } from "../_shared/http.ts";
import { admin } from "../_shared/admin.ts";
import { isFresh } from "../_shared/ttl.ts";

const API_URL = "https://api.themoviedb.org/3";
const API_KEY = Deno.env.get("TMDB_API_KEY");
const TIMEOUT_MS = 4000;
// Catalogues change every week or so; an expired row still answers while it refreshes
const TTL_MS = 3 * 24 * 60 * 60 * 1000;
// A watchlist holds tens to a few hundred titles
const MAX_TITLES = 500;
// TMDB requests in flight at once while filling the cache
const BATCH = 20;
// The ways to watch without paying per title
const KINDS = ["flatrate", "free", "ads"];
// The services the filter offers; a title's page lists every other one. TMDB ids per service: plans with
// ads and old names count as the service, Amazon channels (a separate subscription) don't.
const SERVICES = [
  { key: "netflix", label: "Netflix", ids: [8, 1796] },
  { key: "max", label: "HBO Max", ids: [1899, 384] },
  { key: "prime", label: "Prime Video", ids: [119, 9, 2100] },
  { key: "disney", label: "Disney+", ids: [337] },
  { key: "apple", label: "Apple TV", ids: [350] },
  { key: "skyshowtime", label: "SkyShowtime", ids: [1773] },
  { key: "voyo", label: "Voyo", ids: [627] },
  { key: "canal", label: "Canal+", ids: [381] },
  { key: "sweettv", label: "Sweet.tv", ids: [2781] },
];
const SERVICE_OF = new Map(SERVICES.flatMap((service) => service.ids.map((id) => [id, service])));

type MediaType = "movie" | "tv";
type Title = [MediaType, number];
type Provider = { id: number; name: string };
type CacheRow = { media_type: MediaType; tmdb_id: number; providers: Provider[]; expires_at: string };
type TmdbProvider = { provider_id?: unknown; provider_name?: unknown; display_priority?: number };

const keyOf = ([type, id]: Title) => `${type}:${id}`;

function isTitle(value: unknown): value is Title {
  return Array.isArray(value) && value.length === 2 && (value[0] === "movie" || value[0] === "tv") &&
    Number.isInteger(value[1]) && value[1] > 0;
}

async function readCache(region: string, titles: Title[]): Promise<Map<string, CacheRow>> {
  const { data, error } = await admin
    .from("watch_providers_cache")
    .select("media_type, tmdb_id, providers, expires_at")
    .eq("region", region)
    .in("tmdb_id", [...new Set(titles.map(([, id]) => id))]);
  if (error) throw new Error(error.message);
  return new Map((data as CacheRow[]).map((row) => [keyOf([row.media_type, row.tmdb_id]), row]));
}

// The region's services from TMDB's payload (every country, rent and buy included), one entry each, in
// TMDB's display order. A 404 (TMDB dropped the title) streams nowhere; any other failure throws.
async function fetchProviders(region: string, [type, id]: Title): Promise<Provider[]> {
  if (!API_KEY) throw new Error("TMDB_API_KEY is not set");
  // Never log this URL: it carries the key
  const res = await fetch(`${API_URL}/${type}/${id}/watch/providers?api_key=${API_KEY}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`TMDB responded ${res.status}`);

  const country = (await res.json()).results?.[region] ?? {};
  const entries = KINDS.flatMap((kind): TmdbProvider[] => country[kind] ?? [])
    .filter((p) => typeof p.provider_id === "number" && typeof p.provider_name === "string")
    .sort((a, b) => (a.display_priority ?? 0) - (b.display_priority ?? 0));
  const byId = new Map(entries.map((p) => [p.provider_id as number, { id: p.provider_id as number, name: p.provider_name as string }]));
  return [...byId.values()];
}

// Looks the titles up on TMDB, BATCH at a time, and stores the answers in one write. A failed lookup is
// only logged and left uncached, so the next call tries it again.
async function refresh(region: string, titles: Title[]): Promise<Map<string, Provider[]>> {
  const found = new Map<string, Provider[]>();
  for (let i = 0; i < titles.length; i += BATCH) {
    const batch = titles.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map((title) => fetchProviders(region, title)));
    results.forEach((result, j) => {
      if (result.status === "fulfilled") found.set(keyOf(batch[j]), result.value);
      else console.error(result.reason);
    });
  }
  if (found.size === 0) return found;

  const expiresAt = new Date(Date.now() + TTL_MS).toISOString();
  const rows = titles
    .filter((title) => found.has(keyOf(title)))
    .map(([type, id]) => ({ region, media_type: type, tmdb_id: id, providers: found.get(keyOf([type, id])), expires_at: expiresAt }));
  const { error } = await admin.from("watch_providers_cache").upsert(rows);
  // The answers still go back; the titles are fetched again next time
  if (error) console.error(error.message);
  return found;
}

// Each title as the SERVICES that carry it (several ids of one service count once), their labels once
function toResponse(answers: [string, Provider[]][]) {
  const services: Record<string, string> = {};
  const titles: Record<string, string[]> = {};
  for (const [key, list] of answers) {
    const found = [...new Set(list.flatMap((p) => SERVICE_OF.get(p.id) ?? []))];
    found.forEach((service) => (services[service.key] = service.label));
    if (found.length) titles[key] = found.map((service) => service.key);
  }
  return { services, titles };
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const body = await req.json().catch(() => null);
  const region = body?.region;
  const titles = body?.titles;
  if (
    typeof region !== "string" || !/^[A-Z]{2}$/.test(region) ||
    !Array.isArray(titles) || titles.length === 0 || titles.length > MAX_TITLES || !titles.every(isTitle)
  ) {
    return json({ error: "Invalid region or titles" }, 400);
  }

  try {
    const cached = await readCache(region, titles);
    const missing = titles.filter((title) => !cached.has(keyOf(title)));
    // Expired rows answer now and refresh behind the response; titles with no row are waited for
    const stale = titles.filter((title) => cached.has(keyOf(title)) && !isFresh(cached.get(keyOf(title))!));
    if (stale.length) inBackground(refresh(region, stale));
    const fetched = await refresh(region, missing);

    const answers = titles
      .map((title): [string, Provider[]] => [keyOf(title), fetched.get(keyOf(title)) ?? cached.get(keyOf(title))?.providers ?? []])
      .filter(([, list]) => list.length > 0);
    return json(toResponse(answers));
  } catch (error) {
    console.error(error);
    return json({ error: "Lookup failed" }, 502);
  }
});
