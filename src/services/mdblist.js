import supabase from '@/lib/supabase'

// IMDb / Rotten Tomatoes / Metacritic scores of a title, from two sources, cheapest first:
//   1. the mdblist_cache table (a plain read, signed-in users may select)
//   2. the mdblist-scores Edge Function, only when the table has no usable row
export async function getMdblistScores(type, tmdbId) {
  const { data: row, error: cacheError } = await supabase
    .from('mdblist_cache')
    .select('imdb_rating, rt_critics, rt_audience, metacritic, rt_path, expires_at')
    .eq('media_type', type)
    .eq('tmdb_id', tmdbId)
    .maybeSingle()
  if (cacheError) throw new Error(cacheError.message)

  if (row && new Date(row.expires_at) > new Date()) {
    return {
      imdb: row.imdb_rating,
      rtCritics: row.rt_critics,
      rtAudience: row.rt_audience,
      metacritic: row.metacritic,
      rtPath: row.rt_path,
    }
  }

  const { data, error } = await supabase.functions.invoke('mdblist-scores', { body: { type, tmdbId } })
  if (error) throw new Error(error.message)
  return data
}
