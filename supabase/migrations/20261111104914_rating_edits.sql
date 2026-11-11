-- Rating edits: updated_at gets a meaning ("the score changed"), the old score is kept, Movie of the
-- month counts first ratings only, and the feed orders by latest activity so an edit shows up there.

-- Last score before the latest change; null = never changed (or changed before this migration).
-- Nullable, no default: a metadata-only change, no table rewrite.
alter table public.ratings add column if not exists previous_score smallint;

-- Only a real score change is an edit: same-score re-saves (the upsert always sets every column) and
-- title/poster refreshes no longer bump updated_at. Replaces set_updated_at, which only this table used.
create or replace function public.ratings_score_changed()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.previous_score = old.score;
  new.updated_at = now();
  return new;
end;
$function$;

drop trigger if exists ratings_set_updated_at on public.ratings;
drop trigger if exists ratings_score_changed on public.ratings;
create trigger ratings_score_changed
  before update of score on public.ratings
  for each row
  when (old.score is distinct from new.score)
  execute function public.ratings_score_changed();

drop function if exists public.set_updated_at();

-- Movie of the month: titles first rated in the period. Re-scoring an old film no longer makes it eligible.
create or replace function public.get_best_rated_since(p_user_id uuid, p_since timestamptz)
returns jsonb
language sql
stable
as $function$
  select coalesce(jsonb_object_agg(t.type, to_jsonb(t)), '{}'::jsonb)
  from (
    select distinct on (type) type, tmdb_id, title, poster_path, score as rating
    from public.ratings
    where user_id = p_user_id
      and created_at >= p_since
      and type in ('movie', 'tv')
    order by type, score desc, created_at desc
  ) t;
$function$;

-- Feed by latest activity (updated_at = created_at until the score changes), so an edit is new activity.
-- The return table gains updated_at and previous_score, and the cursor param is renamed; Postgres
-- changes neither in place, so the function is dropped first. Filters, volatility, invoker security
-- and default EXECUTE grants are as before.
drop function if exists public.get_user_feed(uuid, integer, timestamptz, uuid, text, integer, integer[], uuid[], timestamptz);

create or replace function public.get_user_feed(
  current_user_id uuid,
  p_limit integer default 20,
  p_cursor_at timestamptz default null,
  p_cursor_id uuid default null,
  p_type text default null,
  p_min_score integer default null,
  p_genre_ids integer[] default null,
  p_user_ids uuid[] default null,
  p_since timestamptz default null
)
returns table(id uuid, tmdb_id integer, title text, poster_path text, type text, score smallint, previous_score smallint, created_at timestamptz, updated_at timestamptz, user_id uuid, username text, avatar_url text)
language plpgsql
stable
as $function$
begin
  return query
  select
    r.id,
    r.tmdb_id,
    r.title,
    r.poster_path,
    r.type,
    r.score,
    r.previous_score,
    r.created_at,
    r.updated_at,
    p.id as user_id,
    p.username,
    p.avatar_url
  from public.ratings r
  -- Only ratings from people the current user follows
  inner join public.follows f on r.user_id = f.following_id
  inner join public.profiles p on r.user_id = p.id
  where f.follower_id = current_user_id
    and (
      p_cursor_at is null
      or (r.updated_at, r.id) < (p_cursor_at, p_cursor_id)
    )
    and (p_type is null or r.type = p_type)
    and (p_min_score is null or r.score >= p_min_score)
    and (p_genre_ids is null or r.genre_ids && p_genre_ids::smallint[])
    and (p_user_ids is null or r.user_id = any(p_user_ids))
    and (p_since is null or r.updated_at >= p_since)
  order by r.updated_at desc, r.id desc
  limit least(greatest(p_limit, 1), 50);
end;
$function$;

-- Keyset twin of ratings_user_created_id_idx for the feed's (updated_at, id) order
drop index if exists public.ratings_user_updated_idx;
create index if not exists ratings_user_updated_id_idx on public.ratings (user_id, updated_at desc, id desc);
