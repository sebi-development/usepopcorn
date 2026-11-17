import { getFunctions } from '@/lib/supabase'

// Which big streaming services carry the titles in `region`, from the watch-providers Edge Function (its
// cache, else TMDB). `titles`: [['movie', 603], …] → { services: { netflix: 'Netflix' }, titles: { 'movie:603': ['netflix'] } }
export async function getStreamingServices(region, titles) {
  const { data, error } = await (await getFunctions()).invoke('watch-providers', { body: { region, titles } })
  if (error) throw new Error(error.message)
  return data
}
