-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-02). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_recent_weekly_activity(p_user_id uuid, p_weeks integer DEFAULT 12)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with my_ratings as (
    select id, created_at from ratings where user_id = p_user_id
  ),
  week_range as (
    select
      generate_series(
        date_trunc('week', current_date - (p_weeks - 1) * interval '1 week')::date,
        date_trunc('week', current_date)::date,
        interval '1 week'
      )::date as week_start
  ),
  weekly_counts as (
    select
      w.week_start,
      count(r.id) as rating_count
    from week_range w
    left join my_ratings r on date_trunc('week', r.created_at) = w.week_start
    group by w.week_start
  )
  select jsonb_agg(
    jsonb_build_object('weekStart', week_start, 'count', rating_count)
    order by week_start
  )
  from weekly_counts;
$function$
