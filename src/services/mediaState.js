import supabase from '@/lib/supabase'

// One round trip: { favorites: [tmdb_id], watchlist: [tmdb_id], ratings: { "<tmdb_id>": score } }
export async function getMediaState() {
  const { data, error } = await supabase.rpc('get_my_media_state')
  if (error) throw new Error(error.message)
  return data
}
