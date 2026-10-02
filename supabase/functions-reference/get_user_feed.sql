-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-02). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_user_feed(current_user_id uuid, p_limit integer DEFAULT 20, p_cursor_created_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_cursor_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, tmdb_id integer, title text, poster_path text, type text, score smallint, created_at timestamp with time zone, user_id uuid, username text, avatar_url text)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.tmdb_id,
    r.title,
    r.poster_path,
    r.type,
    r.score,
    r.created_at,
    p.id AS user_id,
    p.username,
    p.avatar_url
  FROM public.ratings r
  -- Only ratings from people the current user follows
  INNER JOIN public.follows f ON r.user_id = f.following_id
  INNER JOIN public.profiles p ON r.user_id = p.id
  WHERE f.follower_id = current_user_id
    AND (
      p_cursor_created_at IS NULL
      OR (r.created_at, r.id) < (p_cursor_created_at, p_cursor_id)
    )
  ORDER BY r.created_at DESC, r.id DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 50);
END;
$function$
