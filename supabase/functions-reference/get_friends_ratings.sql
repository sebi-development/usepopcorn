-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-02). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_friends_ratings(current_user_id uuid, p_tmdb_id integer, p_limit integer DEFAULT 12, p_cursor_created_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_cursor_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(rating_id uuid, score smallint, created_at timestamp with time zone, user_id uuid, username text, avatar_url text, total_count bigint)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT
      r.id AS b_id,
      r.score AS b_score,
      r.created_at AS b_created_at,
      p.id AS b_user_id,
      p.username AS b_username,
      p.avatar_url AS b_avatar_url
    FROM public.ratings r
    INNER JOIN public.follows f ON r.user_id = f.following_id
    INNER JOIN public.profiles p ON r.user_id = p.id
    WHERE f.follower_id = current_user_id
      AND r.tmdb_id = p_tmdb_id
  ),
  -- Counted before the cursor filter so every page reports the same total
  total AS (
    SELECT count(*) AS n FROM base
  )
  SELECT
    b.b_id,
    b.b_score,
    b.b_created_at,
    b.b_user_id,
    b.b_username,
    b.b_avatar_url,
    t.n
  FROM base b
  CROSS JOIN total t
  WHERE p_cursor_created_at IS NULL
     OR (b.b_created_at, b.b_id) < (p_cursor_created_at, p_cursor_id)
  ORDER BY b.b_created_at DESC, b.b_id DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 50);
END;
$function$
