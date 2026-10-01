-- Everything a card needs to know about the signed-in user's relationship to a title, in one round trip:
-- favorited / watchlisted ids and the user's own rating per title. Read-only, security invoker (RLS applies).
-- ratings is readable by every authenticated user, so it is filtered on auth.uid() explicitly.
-- Returns one jsonb row: { favorites: [tmdb_id], watchlist: [tmdb_id], ratings: { "<tmdb_id>": score } }
create or replace function public.get_my_media_state()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'favorites', coalesce((
      select jsonb_agg(tmdb_id)
      from public.user_media_interactions
      where user_id = auth.uid() and interaction_type = 'favorite'
    ), '[]'::jsonb),
    'watchlist', coalesce((
      select jsonb_agg(tmdb_id)
      from public.user_media_interactions
      where user_id = auth.uid() and interaction_type = 'watchlist'
    ), '[]'::jsonb),
    'ratings', coalesce((
      select jsonb_object_agg(tmdb_id::text, score)
      from public.ratings
      where user_id = auth.uid()
    ), '{}'::jsonb)
  );
$$;
