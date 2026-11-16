import { memo, useMemo, useState } from "react"
import MediaRow from "@/components/media/MediaRow/MediaRow"
import useIntersectionObserver from "@/hooks/useIntersectionObserver"
import useWatchlistFriendsRatings from "@/features/watchlist/hooks/useWatchlistFriendsRatings"
import { friendsLabel, toFriendsRated } from "@/features/watchlist/utils/watchlistItems"

// The last shelf: its RPC waits until it is within 600px of the viewport, so the row lands out of view and
// pushes nothing the user is looking at. No skeleton: an optional shelf only shows once it has titles.
function FriendsRatedShelf({ items }) {
  const [isNear, setIsNear] = useState(false)
  const ref = useIntersectionObserver(() => setIsNear(true), { rootMargin: '600px' })
  const { data, isError } = useWatchlistFriendsRatings({ enabled: isNear })
  const rated = useMemo(() => toFriendsRated(items, data), [items, data])

  // Answered with nothing to show: the observer is done, so its element (and the page's gap for it) goes
  if ((data || isError) && rated.length === 0) return null

  return (
    <div ref={ref}>
      {rated.length > 0 && (
        <MediaRow
          heading="Your friends rated these"
          count={rated.length}
          data={rated}
          limit={15}
          rank={false}
          // Top-left star: the friends' average (the pin marker's corner, so no Pin on this shelf)
          showRating
          badgeOf={friendsLabel}
          showAdded
          showFavorite
          showWatchlist
        />
      )}
    </div>
  )
}

export default memo(FriendsRatedShelf)
