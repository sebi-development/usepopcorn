import supabase from "@/lib/supabase"

export async function getInteractions(type, userId) {
  const { data, error } = await supabase
    .from('user_media_interactions')
    .select('tmdb_id, media_type, title, poster_path')
    .eq('interaction_type', type)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  return data
}

export async function toggleInteraction(type, mediaData, currentUserId) {
  const { data, error } = await supabase
    .from('user_media_interactions')
    .delete()
    .eq('user_id', currentUserId)
    .eq('tmdb_id', mediaData.tmdb_id)
    .eq('interaction_type', type)
    .select('id')
  if (error) throw new Error(error.message)

  if (data.length === 0) {
    const { error: insertError } = await supabase
      .from('user_media_interactions')
      .insert({
        user_id: currentUserId,
        tmdb_id: mediaData.tmdb_id,
        interaction_type: type,
        media_type: mediaData.media_type,
        title: mediaData.title,
        poster_path: mediaData.poster_path,
      })
    if (insertError) throw new Error(insertError.message)
    return { status: 'added' }
  }
  return { status: 'removed' }
}