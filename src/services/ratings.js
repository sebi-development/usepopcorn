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
    // One rating per title: movie and TV ids overlap, so the type is part of the key
    .upsert({ user_id: currentUserId, score, tmdb_id, title, poster_path, type, runtime, genre_ids }, { onConflict: 'user_id,type,tmdb_id' })
  if (error) throw new Error(error.message)
}

export async function getAverageRating(tmdbId, type) {
  const { data, error } = await supabase
    .rpc('get_average_rating', { p_tmdb_id: tmdbId, p_type: type })
  if (error) throw new Error(error.message)
  return data ?? null
}

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

export async function deleteRating(tmdb_id, type, currentUserId) {
  if (!tmdb_id || !type) throw new Error('Missing id')
  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('tmdb_id', tmdb_id)
    .eq('type', type)
    .eq('user_id', currentUserId)
  if (error) throw new Error(error.message)
}