-- REFERENCE SNAPSHOT of the live DB (pulled 2026-10-01). NOT a migration - never applied from here.
-- Change it via: pnpm db:new <name> -> edit the new file in supabase/migrations -> pnpm db:dry -> pnpm db:push

CREATE OR REPLACE FUNCTION public.get_profile_heatmap(p_user_id uuid, p_year integer)
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with profile_start as (
    select created_at::date as joined_at
    from profiles
    where id = p_user_id
  ),
  my_ratings as (
    select id, created_at from ratings where user_id = p_user_id
  ),
  week_range as (
    select
      generate_series(
        date_trunc('week', greatest(
          (select joined_at from profile_start),
          make_date(p_year, 1, 1)
        ))::date,
        date_trunc('week', least(
          make_date(p_year, 12, 31),
          current_date
        ))::date,
        interval '1 week'
      )::date as week_start
  ),
  weekly_counts as (
    select
      w.week_start,
      count(r.id) as rating_count
    from week_range w
    left join my_ratings r
      on date_trunc('week', r.created_at) = w.week_start
    group by w.week_start
    order by w.week_start
  )
  select jsonb_build_object(
    'year', p_year,
    'joinedAt', (select joined_at from profile_start),
    'weeks', (
      select jsonb_agg(
        jsonb_build_object('weekStart', week_start, 'count', rating_count)
        order by week_start
      )
      from weekly_counts
    )
  );
$function$
