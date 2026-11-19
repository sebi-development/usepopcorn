-- The "contract" half of 20261116102041_title_state_typed_keys.sql. The client that keys titles by type + TMDB id
-- has been live since 2026-11-19, so what only the previous client used goes:
--   * get_my_media_state (replaced by get_my_title_state),
--   * ratings' (user_id, tmdb_id) key (ratings_user_type_tmdb_key holds the same rule per type),
--   * the optional p_type: the two RPCs that look ratings up by id now need the type.

-- A series can now be rated under a movie's id: the id-only key would refuse it
alter table public.ratings drop constraint if exists ratings_user_tmdb_unique;

drop function if exists public.get_my_media_state();

-- ── A title's average, p_type required ──────────────────────────────────────────────────────────
drop function if exists public.get_average_rating(integer, text);

create function public.get_average_rating(p_tmdb_id integer, p_type text)
returns numeric
language sql
stable
as $function$
  select round(avg(score)::numeric, 1)
  from public.ratings
  where tmdb_id = p_tmdb_id
    and type = p_type;
$function$;

-- ── Followed users' ratings of a title, p_type required ─────────────────────────────────────────
-- A required parameter can't follow defaulted ones, so p_type moves up; the client passes every argument by name.
drop function if exists public.get_friends_ratings(uuid, integer, integer, timestamptz, uuid, text);

create function public.get_friends_ratings(
  current_user_id uuid,
  p_tmdb_id integer,
  p_type text,
  p_limit integer default 12,
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null
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
      and r.type = p_type
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
