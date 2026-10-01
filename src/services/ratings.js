import supabase from '@/lib/supabase'

// Columns a rating card renders (poster, title, own score, genres for the info overlay)
const RATING_CARD_COLUMNS = 'id, tmdb_id, title, poster_path, type, score, genre_ids'

export async function uploadRating(ratingData, currentUserId) {
  const { score, tmdb_id, title, poster_path, type, runtime, genre_ids } = ratingData
  if (!score || !tmdb_id || !title || !type) {
    throw new Error('Missing required rating data')
  }
  const { error } = await supabase
    .from('ratings')
    .upsert({ user_id: currentUserId, score, tmdb_id, title, poster_path, type, runtime, genre_ids }, { onConflict: 'user_id,tmdb_id' })
  if (error) throw new Error(error.message)
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
    .select(RATING_CARD_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

// One numbered page of a user's ratings (inclusive `from`..`to` range) plus
// the total row count, in a single request. Same ordering as getUserRatings,
// with id as tiebreaker so pages never overlap or skip on equal timestamps.
export async function getUserRatingsPage(userId, from, to) {
  const { data, error, count } = await supabase
    .from('ratings')
    .select(RATING_CARD_COLUMNS, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to)
  if (error) throw new Error(error.message)
  return { items: data, count: count ?? 0 }
}

export async function getUserRatingsCount(userId) {
  const { count, error } = await supabase
    .from('ratings')
    .select('id', { count: 'exact', head: true })
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