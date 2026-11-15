import queryClient from "@/lib/queryClient"
import { getSession } from "@/services/session"
import { mediaStateQuery } from "@/features/interactions/hooks/useMediaState"
import { profileStatsQuery } from "@/features/profile/hooks/useProfileStats"
import { bestRatedQuery } from "@/features/profile/hooks/useBestRated"
import { watchlistPickQuery } from "@/features/interactions/hooks/useWatchlistPick"

// /browse's route loader, imported by App.jsx on demand so its queries (and Supabase) stay out of the
// entry chunk. It runs in parallel with the route's `lazy` import, so Home's above-the-fold queries
// (its cards wait on stats, best-rated and the watchlist pick) start next to the BrowsePage chunk
// download instead of after it. Fire-and-forget: the hooks pick up the in-flight or cached results,
// and nothing here blocks the render.
export default async function browseLoader({ request }) {
  const category = new URL(request.url).searchParams.get('category')
  if (category && category !== 'home') return null
  const userId = (await getSession())?.user.id
  if (userId) {
    queryClient.prefetchQuery(mediaStateQuery(userId))
    queryClient.prefetchQuery(profileStatsQuery(userId))
    queryClient.prefetchQuery(bestRatedQuery(userId))
    queryClient.prefetchQuery(watchlistPickQuery(userId))
  }
  return null
}
