import supabase from "../lib/supabase"

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

export async function isFollowing(currentUserId, followingId) {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', currentUserId)
    .eq('following_id', followingId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data !== null
}

export async function getFollowingIds(userId) {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)
  if (error) throw new Error(error.message)
  return data.map(row => row.following_id)
}

export async function getFollowersCount(userId) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)
  if (error) throw new Error(error.message)
  return count
}

export async function getFollowingCount(userId) {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)
  if (error) throw new Error(error.message)
  return count
}

export async function getProfileRelationship(currentUserId, targetUserId) {
  const [following, followers, followingCount] = await Promise.all([
    isFollowing(currentUserId, targetUserId),
    getFollowersCount(targetUserId),
    getFollowingCount(targetUserId)
  ])
  return { isFollowing: following, followers, following: followingCount }
}

export async function getFeed(currentUserId) {
  const { data, error } = await supabase
    .rpc('get_user_feed', { current_user_id: currentUserId })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getSuggestedUsers(currentUserId) {
  const { data, error } = await supabase.rpc('get_suggested_users', { current_user_id: currentUserId })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getFriendsRatings(currentUserId, tmdbId) {
  const { data, error } = await supabase
    .rpc('get_friends_ratings', { current_user_id: currentUserId, p_tmdb_id: tmdbId })
  if (error) throw new Error(error.message)
  return data ?? []
}