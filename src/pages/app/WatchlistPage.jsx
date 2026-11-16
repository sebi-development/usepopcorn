import { useCallback, useMemo } from "react"
import MediaRow from "@/components/media/MediaRow/MediaRow"
import FilterBar from "@/components/filters/FilterBar"
import ArrowLink from "@/components/ui/ArrowLink"
import Chip from "@/components/ui/Chip"
import { useUrlPage } from "@/hooks/useUrlGrid"
import useInteractions from "@/features/interactions/hooks/useInteractions"
import useWatchlistFilters from "@/features/watchlist/hooks/useWatchlistFilters"
import { lengthLabel, summarize, toShelves } from "@/features/watchlist/utils/watchlistItems"
import { isEmptyFilters, NO_MATCHES } from "@/utils/filters"
import { PAGE_SIZE } from "@/utils/pagination"

const ALL_SAVED_ID = "all-saved"
const NO_ITEMS = []
const NOTHING_SAVED = <>Nothing saved yet. <ArrowLink to="/browse?type=movies&category=trending" className="text-primary-light">Find something to watch</ArrowLink></>

// The signed-in user's whole watchlist: fixed shelves over the full list, then every title under the URL filters
export default function WatchlistPage() {
  const { data, isLoading, error } = useInteractions("watchlist")
  const items = data ?? NO_ITEMS
  const { defs, filters, setFilter, setFilters, clearFilters, shown } = useWatchlistFilters(items)
  const shelves = useMemo(() => toShelves(items), [items])

  // In the URL, so Back from a title lands on the same page; a filter change drops it (page 1)
  const { page, setPage } = useUrlPage()
  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
  // Removing the last title of the last page lands on the page before it
  const current = Math.min(page, totalPages)
  const pageItems = useMemo(() => shown.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), [shown, current])

  // A shelf's "View all": its filters on the grid below, then the grid in view
  const showShelf = useCallback((preset) => {
    setFilters(preset)
    document.getElementById(ALL_SAVED_ID)?.scrollIntoView({ behavior: "smooth" })
  }, [setFilters])

  const total = items.length

  return (
    <div className="flex flex-col gap-8 md:gap-10 py-6 md:py-10 pb-12">
      <header className="flex flex-col gap-1 md:px-6">
        <h1 className="text-2xl font-black text-text tracking-tight sm:text-3xl">
          Watchlist
          {data && <Chip variant="count" size="sm" label={total} className="ml-3 align-middle" />}
        </h1>
        {total > 0 && <p className="text-xs sm:text-sm text-text-muted">{summarize(items)}</p>}
      </header>

      {shelves.map((shelf) => (
        <MediaRow
          key={shelf.id}
          heading={shelf.heading}
          count={shelf.items.length}
          data={shelf.items}
          limit={15}
          rank={false}
          badgeOf={shelf.badgeOf}
          showAdded
          showFavorite
          showWatchlist
          expandable
          onToggleExpand={() => showShelf(shelf.preset)}
        />
      ))}

      <section id={ALL_SAVED_ID} className="flex flex-col gap-4 scroll-mt-4 md:scroll-mt-28">
        <h2 className="text-text font-semibold text-xl md:px-6">
          All saved
          {data && (
            <Chip
              variant="count"
              size="sm"
              label={isEmptyFilters(filters) ? total : `${shown.length} of ${total}`}
              className="ml-2 align-middle"
            />
          )}
        </h2>
        {total > 0 && <FilterBar defs={defs} filters={filters} onChange={setFilter} onClear={clearFilters} className="md:px-6" />}
        <MediaRow
          data={pageItems}
          isLoading={isLoading}
          isError={Boolean(error)}
          delaySkeleton
          isExpanded
          gridItems={pageItems}
          page={current}
          totalPages={totalPages}
          onPageChange={setPage}
          badgeOf={lengthLabel}
          showAdded
          showFavorite
          showWatchlist
          emptyNote={total ? NO_MATCHES : NOTHING_SAVED}
        />
      </section>
    </div>
  )
}
