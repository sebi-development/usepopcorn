import supabase from "@/lib/supabase"

// What a list item holds. The metadata columns are filled for the watchlist only (null on favorites).
const LIST_COLUMNS = 'tmdb_id, media_type, title, poster_path, genre_ids, release_date, runtime, seasons, created_at'

// Newest saved first
export async function getInteractions(type, userId) {
  const { data, error } = await supabase
    .from('user_media_interactions')
    .select(LIST_COLUMNS)
    .eq('interaction_type', type)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

// One title from the signed-in user's watchlist for `day` (YYYY-MM-DD); null when the watchlist is empty
export async function getWatchlistPick(day) {
  const { data, error } = await supabase.rpc('get_watchlist_pick', { p_day: day }).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

// Saves a title to a list. A title already there is left as it is (no UPDATE policy on this table), and
// then nothing comes back: null. Movie and TV ids overlap, so the conflict key holds the type.
export async function addInteraction(type, mediaData, currentUserId) {
  const { data, error } = await supabase
    .from('user_media_interactions')
    .upsert({
      user_id: currentUserId,
      tmdb_id: mediaData.tmdb_id,
      interaction_type: type,
      media_type: mediaData.media_type,
      title: mediaData.title,
      poster_path: mediaData.poster_path,
      // Watchlist adds only; undefined is left out of the request, so the columns stay null
      genre_ids: mediaData.genre_ids,
      release_date: mediaData.release_date,
      runtime: mediaData.runtime,
      seasons: mediaData.seasons,
    }, { onConflict: 'user_id,interaction_type,media_type,tmdb_id', ignoreDuplicates: true })
    .select(LIST_COLUMNS)
  if (error) throw new Error(error.message)
  return data[0] ?? null
}

// Takes a title off a list; nothing to delete is not an error
export async function removeInteraction(type, { tmdb_id, media_type }, currentUserId) {
  const { error } = await supabase
    .from('user_media_interactions')
    .delete()
    .eq('user_id', currentUserId)
    .eq('interaction_type', type)
    .eq('media_type', media_type)
    .eq('tmdb_id', tmdb_id)
  if (error) throw new Error(error.message)
}
