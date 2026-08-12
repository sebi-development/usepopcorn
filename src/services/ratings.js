import supabase from '../lib/supabase'

export async function uploadRating(ratingData, currentUserId) {
  const { score, tmdb_id, title, poster_path, type, runtime, genre_ids } = ratingData
  if (!score || !tmdb_id || !title || !type) {
    throw new Error('Missing required rating data')
  }
  const { data, error } = await supabase
    .from('ratings')
    .upsert({ user_id: currentUserId, score, tmdb_id, title, poster_path, type, runtime, genre_ids }, { onConflict: 'user_id,tmdb_id' })
    .select()
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function getRating(tmdb_id, currentUserId) {
  if (!tmdb_id) throw new Error('Missing id')
  const { data, error } = await supabase
    .from('ratings')
    .select()
    .eq('user_id', currentUserId)
    .eq('tmdb_id', tmdb_id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function getAverageRating(tmdbId) {
  const { data, error } = await supabase
    .rpc('get_average_rating', { p_tmdb_id: tmdbId })
  if (error) throw new Error(error.message)
  return data ?? null
}

export async function getUserRatings(limit = null, userId) {
  let query = supabase
    .from('ratings')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function getUserRatingsCount(userId) {
  const { count, error } = await supabase
    .from('ratings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function deleteRating(tmdb_id, currentUserId) {
  if (!tmdb_id) throw new Error('Missing id')
  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('tmdb_id', tmdb_id)
    .eq('user_id', currentUserId)
  if (error) throw new Error(error.message)
}