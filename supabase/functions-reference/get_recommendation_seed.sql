-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-01). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_recommendation_seed(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with recent_ratings as (
    select tmdb_id, type, title, score
    from ratings
    where user_id = p_user_id
    order by created_at desc
    limit 10
  )
  select jsonb_build_object(
    'tmdb_id', tmdb_id,
    'type', type,
    'title', title,
    'score', score
  )
  from recent_ratings
  order by score desc, tmdb_id
  limit 1;
$function$
