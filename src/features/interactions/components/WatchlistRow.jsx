import { memo, useState } from 'react'
import MediaRow from '@/components/media/MediaRow'
import useInteractions from '@/features/interactions/hooks/useInteractions'
import { useWatchlistCount } from '@/features/interactions/hooks/useMediaState'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'

// Fetches the full watchlist only once the row is within 600px of the viewport
function NearViewportRow() {
  const [isNear, setIsNear] = useState(false)
  const ref = useIntersectionObserver(() => setIsNear(true), { rootMargin: '600px' })
  const { data, isLoading, error } = useInteractions('watchlist', undefined, { enabled: isNear })

  return (
    <div ref={ref}>
      <MediaRow
        heading="Your watchlist"
        data={data}
        // A disabled query isn't "loading", but the row still needs its skeleton until it fetches
        isLoading={!isNear || isLoading}
        isError={Boolean(error)}
        delaySkeleton
        showInfo={false}
        rank={false}
      />
    </div>
  )
}

// The count comes from mediaState (loaded at login), so an empty watchlist renders nothing without a
// fetch. The observer lives in a child so it mounts with its element in place.
export default memo(function WatchlistRow() {
  const count = useWatchlistCount()
  return count > 0 ? <NearViewportRow /> : null
})
