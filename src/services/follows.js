import supabase from "@/lib/supabase"

export async function followUser(currentUserId, followingId) {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: currentUserId, following_id: followingId })
  if (error) throw new Error(error.message)
}

export async function unfollowUser(currentUserId, followingId) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', currentUserId)
    .eq('following_id', followingId)
  if (error) throw new Error(error.message)
}

export async function getFollowingIds(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
  if (error) throw new Error(error.message)
  return data.map(row => row.following_id)
}

// `cursor` is the { created_at, id } of the last row of the previous page,
// or null for the first page (keyset paging, see the pagination migration).
export async function getFeed(currentUserId, { limit, cursor }) {
  const { data, error } = await supabase.rpc('get_user_feed', {
    current_user_id: currentUserId,
    p_limit: limit,
    p_cursor_created_at: cursor?.created_at ?? null,
    p_cursor_id: cursor?.id ?? null,
  })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getSuggestedUsers(currentUserId) {
  const { data, error } = await supabase.rpc('get_suggested_users', { current_user_id: currentUserId })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getFriendsRatings(currentUserId, tmdbId, { limit, cursor }) {
  const { data, error } = await supabase.rpc('get_friends_ratings', {
    current_user_id: currentUserId,
    p_tmdb_id: tmdbId,
    p_limit: limit,
    p_cursor_created_at: cursor?.created_at ?? null,
    p_cursor_id: cursor?.id ?? null,
  })
  if (error) throw new Error(error.message)
  return data ?? []
}