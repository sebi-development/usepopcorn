import supabase from '@/lib/supabase'

// The ČSFD rating of a title, from two sources, cheapest first:
//   1. the csfd_cache table (a plain read, signed-in users may select)
//   2. the csfd-score Edge Function, only when the table has no usable row
export async function getCsfdScore(imdbId) {
  const { data: row, error: cacheError } = await supabase
    .from('csfd_cache')
    .select('csfd_id, rating, expires_at')
    .eq('imdb_id', imdbId)
    .maybeSingle()
  if (cacheError) throw new Error(cacheError.message)

  if (row && new Date(row.expires_at) > new Date()) {
    return { csfdId: row.csfd_id, rating: row.rating }
  }

  const { data, error } = await supabase.functions.invoke('csfd-score', { body: { imdbId } })
  if (error) throw new Error(error.message)
  return data
}
