-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-10, after feed_filter_friends). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_user_feed(current_user_id uuid, p_limit integer DEFAULT 20, p_cursor_created_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_cursor_id uuid DEFAULT NULL::uuid, p_type text DEFAULT NULL::text, p_min_score integer DEFAULT NULL::integer, p_genre_ids integer[] DEFAULT NULL::integer[], p_user_ids uuid[] DEFAULT NULL::uuid[], p_since timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(id uuid, tmdb_id integer, title text, poster_path text, type text, score smallint, created_at timestamp with time zone, user_id uuid, username text, avatar_url text)
 LANGUAGE plpgsql
 STABLE
AS $function$
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
$function$
