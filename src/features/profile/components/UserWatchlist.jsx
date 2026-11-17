import { memo, useMemo, useState } from "react"
import MediaRow from "@/components/media/MediaRow/MediaRow"
import { CARD_ACTIONS } from "@/components/media/cardActions"
import useInteractions from "@/features/interactions/hooks/useInteractions"
import useMediaState from "@/features/interactions/hooks/useMediaState"
import useIntersectionObserver from "@/hooks/useIntersectionObserver"
import useUrlGrid from "@/hooks/useUrlGrid"
import { PAGE_SIZE } from "@/utils/pagination"
import { titleKey } from "@/utils/tmdbItem"

const ROW_LIMIT = 15
const NO_ITEMS = []

// Another user's watchlist, last on their profile: fetched once it is within 600px of the viewport, so it
// lands out of view, and shown only once it has titles. "Watch together" is the part of it on the viewer's
// own watchlist (mediaState), so it needs no request and follows the viewer's toggles at once.
function UserWatchlist({ userId }) {
  const [isNear, setIsNear] = useState(false)
  const ref = useIntersectionObserver(() => setIsNear(true), { rootMargin: '600px' })
  const { data, error } = useInteractions('watchlist', userId, { enabled: isNear })
  const items = data ?? NO_ITEMS
  const { watchlist } = useMediaState()
  const together = useMemo(
    () => items.filter((item) => watchlist.has(titleKey(item.media_type, item.tmdb_id))),
    [items, watchlist]
  )

  // "View all" pages through the fetched list in place
  const { isExpanded, page, setPage, toggle } = useUrlGrid('watchlist')
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const gridItems = useMemo(
    () => (isExpanded ? items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE) : undefined),
    [isExpanded, items, current]
  )

  // An empty watchlist: the observer is done, so its element (and the page's gap for it) goes
  if (data?.length === 0) return null

  return (
    <div ref={ref} className="flex flex-col gap-12 md:gap-16">
      {together.length > 0 && (
        <MediaRow
          heading="Watch together"
          count={together.length}
          data={together}
          limit={ROW_LIMIT}
          rank={false}
          actions={CARD_ACTIONS.saved}
          showInfo={false}
        />
      )}
      {(data || error) && (
        <MediaRow
          heading="Watchlist"
          count={data?.length}
          data={data}
          isError={Boolean(error)}
          limit={ROW_LIMIT}
          rank={false}
          actions={CARD_ACTIONS.save}
          showInfo={false}
          expandable={items.length > ROW_LIMIT}
          isExpanded={isExpanded}
          onToggleExpand={toggle}
          gridItems={gridItems}
          page={current}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

export default memo(UserWatchlist)
