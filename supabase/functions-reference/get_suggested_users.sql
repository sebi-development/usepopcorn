-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-02). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_suggested_users(current_user_id uuid)
 RETURNS TABLE(id uuid, username text, avatar_url text, recent_activity_count bigint, mutual_friend_count bigint, suggestion_score bigint)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN QUERY

  WITH my_follows AS (
    SELECT following_id FROM public.follows WHERE follower_id = current_user_id
  ),

  user_activity AS (
    SELECT r.user_id, COUNT(r.id) as activity_count
    FROM public.ratings r
    WHERE r.created_at > NOW() - INTERVAL '14 days'
    GROUP BY r.user_id
  ),

  mutual_connections AS (
    SELECT f.following_id AS suggested_user_id, COUNT(f.follower_id) AS mutual_count
    FROM public.follows f
    WHERE f.follower_id IN (SELECT following_id FROM my_follows)
    GROUP BY f.following_id
  )

  SELECT
    p.id,
    p.username,
    p.avatar_url,
    COALESCE(ua.activity_count, 0) AS recent_activity_count,
    COALESCE(mc.mutual_count, 0) AS mutual_friend_count,
    (COALESCE(mc.mutual_count, 0) * 10 + COALESCE(ua.activity_count, 0)) AS suggestion_score

  FROM public.profiles p
  LEFT JOIN user_activity ua ON p.id = ua.user_id
  LEFT JOIN mutual_connections mc ON p.id = mc.suggested_user_id

  WHERE p.id != current_user_id
  AND NOT EXISTS (SELECT 1 FROM my_follows mf WHERE mf.following_id = p.id)
  AND (COALESCE(mc.mutual_count, 0) * 10 + COALESCE(ua.activity_count, 0)) > 0

  ORDER BY suggestion_score DESC
  LIMIT 4;
END;
$function$
