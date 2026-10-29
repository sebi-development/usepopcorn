import { memo, useState } from "react"
import MediaRow from "@/components/media/MediaRow"
import useInteractions from "@/features/interactions/hooks/useInteractions"
import { useWatchlistCount } from "@/features/interactions/hooks/useMediaState"
import useIntersectionObserver from "@/hooks/useIntersectionObserver"

// Fetches the list only once the row is within 600px of the viewport
function NearViewportRow({ heading, count, showInfo }) {
  const [isNear, setIsNear] = useState(false)
  const ref = useIntersectionObserver(() => setIsNear(true), { rootMargin: '600px' })
  const { data, isLoading, error } = useInteractions('watchlist', undefined, { enabled: isNear })

  return (
    <div ref={ref}>
      <MediaRow
        limit={15}
        heading={heading}
        // From mediaState, so it shows in the skeleton before the list is fetched
        count={count}
        data={data}
        // A disabled query isn't "loading", but the row still needs its skeleton until it fetches
        isLoading={!isNear || isLoading}
        isError={Boolean(error)}
        delaySkeleton
        rank={false}
        showWatchlist={false}
        showInfo={showInfo}
      />
    </div>
  )
}

// The signed-in user's watchlist (Home and their own profile). The count comes from mediaState, so an
// empty watchlist renders nothing without a fetch; the observer lives in a child so it mounts with its element.
function Watchlist({ heading = "Watchlist", showInfo = false }) {
  const count = useWatchlistCount()
  return count > 0 ? <NearViewportRow heading={heading} count={count} showInfo={showInfo} /> : null
}

export default memo(Watchlist)
