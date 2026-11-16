import { memo } from 'react'
import { BsBookmarkFill } from 'react-icons/bs'
import FeatureCard from '@/features/browse/components/cards/FeatureCard'
import useWatchlistPick from '@/features/interactions/hooks/useWatchlistPick'
import { useWatchlistCount } from '@/features/interactions/hooks/useMediaState'

const THEME = { gradient: 'linear-gradient(135deg, #9775fa 0%, #6741d9 100%)', Icon: BsBookmarkFill, iconClass: 'text-violet-200', rgb: '121, 80, 242' }

// Where the card leads: today's pick, else the watchlist (the pick failed to load), else somewhere to find titles
function linkFor(pick, count) {
  // DetailPage reads the media type from router state (defaults to 'movie')
  if (pick) return { text: pick.title, to: `/browse/${pick.tmdb_id}`, state: { type: pick.media_type } }
  if (count > 0) return { text: 'Open your watchlist', to: '/watchlist' }
  return { text: 'Save a title to watch later', to: '/browse?type=movies&category=trending' }
}

export default memo(function WatchlistCard() {
  // The server picks one watchlist title per day (get_watchlist_pick)
  const { data: pick, isLoading } = useWatchlistPick()
  const count = useWatchlistCount()

  return <FeatureCard theme={THEME} isLoading={isLoading} label={pick ? "Today's pick" : 'Watchlist'} {...linkFor(pick, count)} />
})
