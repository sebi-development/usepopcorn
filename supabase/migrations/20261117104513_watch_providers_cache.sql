-- The streaming services of a title in one country, from TMDB, cached for /watchlist's Streaming filter.
-- Only the watch-providers Edge Function reads and writes it (service role): the app asks the function,
-- which answers from here and fetches TMDB only for titles with no fresh row. A row keeps just the
-- services that stream it (subscription, free, with ads), not TMDB's payload for every country.

-- ── Table ────────────────────────────────────────────────────────────────────────────────────────
create table if not exists public.watch_providers_cache (
  -- ISO 3166-1 code (the profile's country), first: the function reads one country for many titles
  region     text not null check (region ~ '^[A-Z]{2}$'),
  tmdb_id    int not null check (tmdb_id > 0),
  -- TMDB movie and TV ids overlap
  media_type text not null check (media_type in ('movie', 'tv')),
  -- [{ "id": 8, "name": "Netflix" }, …] in TMDB's display order; [] = streams nowhere in the region
  providers  jsonb not null check (jsonb_typeof(providers) = 'array'),
  -- Set by the function; a row past it is answered as is and refreshed behind the response
  expires_at timestamptz not null,
  primary key (region, tmdb_id, media_type)
);

-- ── Access ───────────────────────────────────────────────────────────────────────────────────────
-- No client role reads it: RLS on with no policies, and only service_role holds grants.
alter table public.watch_providers_cache enable row level security;

revoke all on table public.watch_providers_cache from anon, authenticated;
grant select, insert, update on table public.watch_providers_cache to service_role;
