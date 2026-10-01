-- RLS: stop evaluating auth.uid() / auth.role() once per scanned row, and scope every policy to the
-- `authenticated` role (they were `public`, so anon requests evaluated them too, always to false).
-- `alter policy` keeps the policy in place (no window without one) and is safe to re-run.
--
-- Read-for-every-signed-in-user policies become `to authenticated using (true)`. Their old predicates
-- (auth.uid() is not null / auth.role() = 'authenticated') are always true for that role, but as a
-- security qual they also stopped any non-leakproof user filter from being an index condition:
--   * profiles: `username ilike '%x%'` could never use idx_profiles_username_trgm
--   * ratings:  `user_id = auth.uid()` in get_my_media_state() scanned the whole table
alter policy follows_select_all on public.follows to authenticated using (true);
alter policy profiles_select_own on public.profiles to authenticated using (true);
alter policy ratings_select_all on public.ratings to authenticated using (true);

-- Own-row policies: `(select auth.uid())` is planned as an InitPlan, computed once per statement.
alter policy follows_insert_own on public.follows to authenticated
  with check (follower_id = (select auth.uid()));
alter policy follows_delete_own on public.follows to authenticated
  using (follower_id = (select auth.uid()));

alter policy profiles_update_own on public.profiles to authenticated
  using ((select auth.uid()) = id);

alter policy ratings_insert_own on public.ratings to authenticated
  with check ((select auth.uid()) = user_id);
alter policy ratings_update_own on public.ratings to authenticated
  using ((select auth.uid()) = user_id);
alter policy ratings_delete_own on public.ratings to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can read own interactions" on public.user_media_interactions to authenticated
  using ((select auth.uid()) = user_id);
alter policy "Users can insert own interactions" on public.user_media_interactions to authenticated
  with check ((select auth.uid()) = user_id);
alter policy "Users can delete own interactions" on public.user_media_interactions to authenticated
  using ((select auth.uid()) = user_id);
