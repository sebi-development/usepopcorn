-- Friends Activity: the Friend filter picks several people, so get_user_feed's
-- p_user_id uuid becomes p_user_ids uuid[] (rating by any of them).
-- Changing a param creates an overload, so the old signature is dropped first. Everything else
-- (other filters, return table, volatility, invoker security, default EXECUTE grants) is unchanged.
drop function if exists public.get_user_feed(uuid, integer, timestamptz, uuid, text, integer, integer[], uuid, timestamptz);

create or replace function public.get_user_feed(
  current_user_id uuid,
  p_limit integer default 20,
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null,
  p_type text default null,
  p_min_score integer default null,
  p_genre_ids integer[] default null,
  p_user_ids uuid[] default null,
  p_since timestamptz default null
)
returns table(id uuid, tmdb_id integer, title text, poster_path text, type text, score smallint, created_at timestamptz, user_id uuid, username text, avatar_url text)
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
    r.created_at,
    p.id as user_id,
    p.username,
    p.avatar_url
  from public.ratings r
  -- Only ratings from people the current user follows
  inner join public.follows f on r.user_id = f.following_id
  inner join public.profiles p on r.user_id = p.id
  where f.follower_id = current_user_id
    and (
      p_cursor_created_at is null
      or (r.created_at, r.id) < (p_cursor_created_at, p_cursor_id)
    )
    and (p_type is null or r.type = p_type)
    and (p_min_score is null or r.score >= p_min_score)
    and (p_genre_ids is null or r.genre_ids && p_genre_ids::smallint[])
    and (p_user_ids is null or r.user_id = any(p_user_ids))
    and (p_since is null or r.created_at >= p_since)
  order by r.created_at desc, r.id desc
  limit least(greatest(p_limit, 1), 50);
end;
$function$;
