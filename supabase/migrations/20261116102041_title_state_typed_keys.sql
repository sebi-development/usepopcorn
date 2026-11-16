-- Titles are identified by type + TMDB id everywhere: TMDB movie and TV ids overlap.
--
-- This is the "expand" half, safe for the client that is live now:
--   * a new state RPC next to get_my_media_state (which the live client still calls),
--   * a (user_id, type, tmdb_id) key next to ratings' (user_id, tmdb_id) key (the live client's
--     upsert names that one in ON CONFLICT),
--   * an optional p_type on the two RPCs that look ratings up by id (a call without it works as before).
-- Until the "contract" migration drops the old key, rating the other type of a shared id is refused
-- (unique violation) instead of overwriting the first rating. The contract migration ships after the
-- new client is deployed: it drops the old key and get_my_media_state, and makes p_type required.

-- ── State per title, keyed '<type>:<tmdb_id>' (e.g. 'movie:550', 'tv:1399') ──────────────────────
-- get_my_media_state keys by id alone, so a saved or rated movie also showed as saved or rated on the
-- series with the same id (and its toggle did the wrong thing).
-- Security invoker: the own-rows RLS policies apply. Default EXECUTE grants, as for the other read RPCs.
create or replace function public.get_my_title_state()
returns jsonb
language sql
stable
as $function$
  select jsonb_build_object(
    'favorites', coalesce((
      select jsonb_agg(media_type || ':' || tmdb_id)
      from public.user_media_interactions
      where user_id = (select auth.uid()) and interaction_type = 'favorite'
    ), '[]'::jsonb),
    'watchlist', coalesce((
      select jsonb_agg(media_type || ':' || tmdb_id)
      from public.user_media_interactions
      where user_id = (select auth.uid()) and interaction_type = 'watchlist'
    ), '[]'::jsonb),
    'ratings', coalesce((
      select jsonb_object_agg(type || ':' || tmdb_id, score)
      from public.ratings
      where user_id = (select auth.uid())
    ), '{}'::jsonb)
  );
$function$;

-- ── One rating per user per title (type + id) ───────────────────────────────────────────────────
-- Looser than ratings_user_tmdb_unique, so every existing row fits it. The new client's upsert names it.
create unique index if not exists ratings_user_type_tmdb_key on public.ratings (user_id, type, tmdb_id);

-- ── A title's average ───────────────────────────────────────────────────────────────────────────
-- Adding a parameter creates an overload, and a call with p_tmdb_id alone would then match both:
-- the old signature goes in the same transaction, so callers never see a gap.
drop function if exists public.get_average_rating(integer);

create or replace function public.get_average_rating(p_tmdb_id integer, p_type text default null)
returns numeric
language sql
stable
as $function$
  select round(avg(score)::numeric, 1)
  from public.ratings
  where tmdb_id = p_tmdb_id
    and (p_type is null or type = p_type);
$function$;

-- ── Followed users' ratings of a title (Detail page, Friends tab) ───────────────────────────────
-- Unchanged apart from p_type, added last so positional callers keep working.
drop function if exists public.get_friends_ratings(uuid, integer, integer, timestamptz, uuid);

create or replace function public.get_friends_ratings(
  current_user_id uuid,
  p_tmdb_id integer,
  p_limit integer default 12,
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null,
  p_type text default null
)
returns table(rating_id uuid, score smallint, created_at timestamptz, user_id uuid, username text, avatar_url text, total_count bigint)
language plpgsql
stable
as $function$
begin
  return query
  with base as (
    select
      r.id as b_id,
      r.score as b_score,
      r.created_at as b_created_at,
      p.id as b_user_id,
      p.username as b_username,
      p.avatar_url as b_avatar_url
    from public.ratings r
    inner join public.follows f on r.user_id = f.following_id
    inner join public.profiles p on r.user_id = p.id
    where f.follower_id = current_user_id
      and r.tmdb_id = p_tmdb_id
      and (p_type is null or r.type = p_type)
  ),
  -- Counted before the cursor filter so every page reports the same total
  total as (
    select count(*) as n from base
  )
  select
    b.b_id,
    b.b_score,
    b.b_created_at,
    b.b_user_id,
    b.b_username,
    b.b_avatar_url,
    t.n
  from base b
  cross join total t
  where p_cursor_created_at is null
     or (b.b_created_at, b.b_id) < (p_cursor_created_at, p_cursor_id)
  order by b.b_created_at desc, b.b_id desc
  limit least(greatest(p_limit, 1), 50);
end;
$function$;
