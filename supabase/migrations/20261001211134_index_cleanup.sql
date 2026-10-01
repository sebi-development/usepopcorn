-- Two identical unique constraints on (user_id, tmdb_id, interaction_type): every favorite / watchlist
-- toggle maintained both indexes. Keep user_media_interactions_user_id_tmdb_id_interaction_type_key.
alter table public.user_media_interactions drop constraint if exists unique_user_media_interaction;

-- Same check twice (follower_id <> following_id). Keep follows_no_self_follow.
alter table public.follows drop constraint if exists no_self_follow;

-- follows was only indexed follower-first. Lookups by following_id walked the whole follows_unique
-- index: follower counts, the mutual-friends step of get_suggested_users, and the
-- follows_following_fkey cascade when a profile is deleted.
create index if not exists follows_following_id_idx on public.follows (following_id);
