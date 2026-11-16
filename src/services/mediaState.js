import supabase from '@/lib/supabase'

// One round trip, keyed by titleKey ('movie:550'): { favorites: [key], watchlist: [key], ratings: { [key]: score } }
export async function getMediaState() {
  const { data, error } = await supabase.rpc('get_my_title_state')
  if (error) throw new Error(error.message)
  return data
}
