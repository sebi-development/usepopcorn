-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-02). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_extended_streak(p_user_id uuid)
 RETURNS integer
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with my_ratings as (
    select distinct date_trunc('week', created_at)::date as week_start
    from ratings
    where user_id = p_user_id
  ),
  range_end as (
    select case
      when (select max(week_start) from my_ratings) = date_trunc('week', current_date)::date
        then date_trunc('week', current_date)::date
      else date_trunc('week', current_date - interval '1 week')::date
    end as week_start
  ),
  week_range as (
    select
      generate_series(
        (select min(week_start) from my_ratings),
        (select week_start from range_end),
        interval '1 week'
      )::date as week_start
  ),
  weekly_activity as (
    select w.week_start, (r.week_start is not null) as had_activity
    from week_range w
    left join my_ratings r on r.week_start = w.week_start
  ),
  most_recent_gap as (
    select max(week_start) as gap_week
    from weekly_activity
    where not had_activity
  )
  select count(*)::int
  from weekly_activity, most_recent_gap
  where week_start > coalesce(most_recent_gap.gap_week, (select min(week_start) from weekly_activity) - interval '1 week');
$function$
