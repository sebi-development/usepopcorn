import { memo } from 'react'
import { Link } from 'react-router'
import { BsBookmarkFill } from 'react-icons/bs'
import FeatureCard, { FeatureCardSkeleton } from '@/components/ui/FeatureCard'
import Chip from '@/components/ui/Chip'
import useWatchlistPick from '@/features/interactions/hooks/useWatchlistPick'
import { useWatchlistCount } from '@/features/interactions/hooks/useMediaState'

const GRADIENT = 'linear-gradient(135deg, #9775fa 0%, #6741d9 100%)'
const ICON = <BsBookmarkFill className="text-xl sm:text-3xl text-violet-200" />
const CHIP_RGB = '121, 80, 242'

const TEXT = 'text-[10px] sm:text-sm text-text-muted leading-tight line-clamp-2'
// Stretched link: the ::after covers the whole card so it is one click target
const STRETCHED = `${TEXT} hover:text-text transition-colors after:absolute after:inset-0 after:z-20`

// Home's "Tonight's pick": the server picks one watchlist title per day (get_watchlist_pick)
export default memo(function WatchlistCard() {
  const { data: pick, isLoading } = useWatchlistPick()
  const count = useWatchlistCount()

  if (isLoading) return <FeatureCardSkeleton />

  return (
    <FeatureCard heroBackground={GRADIENT} floatingIcon={ICON}>
      <Chip size="sm" colorRgb={CHIP_RGB} className="self-start max-w-full">
        <span className="truncate">{pick ? "Tonight's pick" : 'Watchlist'}</span>
      </Chip>
      {pick ? (
        <>
          {/* DetailPage reads the media type from router state (defaults to 'movie') */}
          <Link to={`/browse/${pick.tmdb_id}`} state={{ type: pick.media_type }} className={STRETCHED}>
            {pick.title}
          </Link>
          {count > 0 && <p className="mt-auto text-[10px] sm:text-xs text-text-muted">{count} on your watchlist</p>}
        </>
      ) : count > 0 ? (
        // The pick failed to load but titles exist
        <Link to="/profile" className={STRETCHED}>Open your watchlist</Link>
      ) : (
        <Link to="/browse?type=movies&category=trending" className={STRETCHED}>Save a title to watch later</Link>
      )}
    </FeatureCard>
  )
})
