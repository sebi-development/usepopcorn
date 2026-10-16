-- IMDb, Rotten Tomatoes (critics + audience) and Metacritic scores from MDBList, cached by TMDB id.
-- The mdblist-scores Edge Function writes the rows and the app reads them directly. A title MDBList
-- doesn't know gets a row too (every score null), so it isn't asked for again until that row expires.

-- ── Table ────────────────────────────────────────────────────────────────────────────────────────
create table if not exists public.mdblist_cache (
  -- TMDB movie and TV ids overlap (movie 603 is The Matrix, show 603 is Veronica's Closet)
  media_type  text not null check (media_type in ('movie', 'tv')),
  tmdb_id     int not null check (tmdb_id > 0),
  imdb_rating numeric(3, 1) check (imdb_rating between 0 and 10),
  -- Rotten Tomatoes Tomatometer (critics) and Popcornmeter (audience), in percent
  rt_critics  smallint check (rt_critics between 0 and 100),
  rt_audience smallint check (rt_audience between 0 and 100),
  metacritic  smallint check (metacritic between 0 and 100),
  -- Path on rottentomatoes.com (e.g. /m/the_matrix), for the tile's link
  rt_path     text check (rt_path like '/%'),
  -- Set by the function from its TTL policy; the app treats a row past it as a miss
  expires_at  timestamptz not null,
  primary key (media_type, tmdb_id)
);

-- ── Access ───────────────────────────────────────────────────────────────────────────────────────
-- Same as csfd_cache: signed-in users read, only the function (service_role) writes.
alter table public.mdblist_cache enable row level security;

revoke all on table public.mdblist_cache from anon, authenticated;
grant select on table public.mdblist_cache to authenticated;
grant select, insert, update on table public.mdblist_cache to service_role;

drop policy if exists mdblist_cache_select_all on public.mdblist_cache;
create policy mdblist_cache_select_all on public.mdblist_cache
  for select to authenticated using (true);
