-- Home's "of the Month" cards no longer show a poster, so the picks drop poster_path
create or replace function public.get_best_rated_since(p_user_id uuid, p_since timestamp with time zone)
 returns jsonb
 language sql
 stable
as $function$
  select coalesce(jsonb_object_agg(t.type, to_jsonb(t)), '{}'::jsonb)
  from (
    select distinct on (type) type, tmdb_id, title, score as rating
    from public.ratings
    where user_id = p_user_id
      and created_at >= p_since
      and type in ('movie', 'tv')
    order by type, score desc, created_at desc
  ) t;
$function$;
