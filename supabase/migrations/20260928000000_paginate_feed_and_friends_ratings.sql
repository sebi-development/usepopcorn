-- OPT-035: keyset pagination for get_user_feed and get_friends_ratings.
--
-- Cursor is (created_at, id) of the last row of the previous page, ordered
-- created_at DESC, id DESC. New rows land at the top, so a keyset cursor never
-- repeats or skips items the way OFFSET would while realtime inserts arrive.
-- Pass the cursor timestamp back exactly as PostgREST returned it (a string)
-- so microsecond precision is preserved.
--
-- Both new functions default every new parameter, so the currently deployed
-- client (which only sends current_user_id / p_tmdb_id) keeps working until the
-- new frontend ships. p_limit is clamped server-side so a client can never
-- request an unbounded page.
--
-- The old signatures are DROPPED below. Leaving them would create overloads and
-- PostgREST would fail with "could not choose the best candidate function".
-- RETURNS TABLE also changed for get_friends_ratings (total_count), which
-- CREATE OR REPLACE cannot do in place.

DROP FUNCTION IF EXISTS public.get_user_feed(uuid);
DROP FUNCTION IF EXISTS public.get_friends_ratings(uuid, integer);

CREATE FUNCTION public.get_user_feed(
  current_user_id uuid,
  p_limit integer DEFAULT 20,
  p_cursor_created_at timestamptz DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  tmdb_id integer,
  title text,
  poster_path text,
  type text,
  score smallint,
  created_at timestamptz,
  user_id uuid,
  username text,
  avatar_url text
)
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
$function$;

CREATE FUNCTION public.get_friends_ratings(
  current_user_id uuid,
  p_tmdb_id integer,
  p_limit integer DEFAULT 12,
  p_cursor_created_at timestamptz DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL
)
RETURNS TABLE(
  rating_id uuid,
  score smallint,
  created_at timestamptz,
  user_id uuid,
  username text,
  avatar_url text,
  total_count bigint
)
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
$function$;

-- Per-user ordered scans: feed (each followed user's newest ratings) and the
-- profile "View all" grid (ORDER BY created_at DESC, id DESC per user).
-- Its leading column covers everything ratings_user_id_idx did, so that index
-- is now redundant and is dropped.
CREATE INDEX IF NOT EXISTS ratings_user_created_id_idx
  ON public.ratings (user_id, created_at DESC, id DESC);

DROP INDEX IF EXISTS public.ratings_user_id_idx;
