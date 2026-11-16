-- REFERENCE SNAPSHOT of the live DB (pulled 2026-11-16). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_friends_ratings(current_user_id uuid, p_tmdb_id integer, p_limit integer DEFAULT 12, p_cursor_created_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_cursor_id uuid DEFAULT NULL::uuid, p_type text DEFAULT NULL::text)
 RETURNS TABLE(rating_id uuid, score smallint, created_at timestamp with time zone, user_id uuid, username text, avatar_url text, total_count bigint)
 LANGUAGE plpgsql
 STABLE
AS $function$
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
$function$

