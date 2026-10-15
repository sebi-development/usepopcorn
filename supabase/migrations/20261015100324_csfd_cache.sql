-- ČSFD scores cached by IMDb id. The csfd-score Edge Function writes the rows and the app reads them
-- directly. A title with no ČSFD match gets a row too, so it isn't looked up again on every visit
-- until that row expires.

-- ── Table ────────────────────────────────────────────────────────────────────────────────────────
create table if not exists public.csfd_cache (
  imdb_id    text primary key check (imdb_id ~ '^tt[0-9]{7,10}$'),
  -- null: no ČSFD match for this title (a cached "not found")
  csfd_id    int,
  -- null: on ČSFD but not rated yet
  rating     smallint check (rating between 0 and 100),
  -- Set by the function from its TTL policy; the app treats a row past it as a miss
  expires_at timestamptz not null
);

-- ── Access ───────────────────────────────────────────────────────────────────────────────────────
-- Two separate layers, both needed:
--   grants decide which statements a role may run on the table at all
--   RLS policies decide which rows those statements can see or change
alter table public.csfd_cache enable row level security;

-- This project's default ACL gives anon and authenticated every privilege on new public tables
-- (config.toml says that default is removed on 2026-10-30), so access is stated explicitly here:
-- signed-in users read, only the function writes.
revoke all on table public.csfd_cache from anon, authenticated;
grant select on table public.csfd_cache to authenticated;
-- The function's secret key runs as service_role. It bypasses RLS, but not grants. An upsert is
-- an insert that may turn into an update.
grant select, insert, update on table public.csfd_cache to service_role;

drop policy if exists csfd_cache_select_all on public.csfd_cache;
create policy csfd_cache_select_all on public.csfd_cache
  for select to authenticated using (true);

-- No insert / update policy: service_role never checks policies, and with RLS on and no write
-- policy, every other role is refused writes even if a grant were added by mistake.
