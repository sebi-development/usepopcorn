import { useCallback, useMemo } from "react"
import MediaRow from "@/components/media/MediaRow/MediaRow"
import { CARD_ACTIONS } from "@/components/media/cardActions"
import FilterBar from "@/components/filters/FilterBar"
import Chip from "@/components/ui/Chip"
import { useUrlPage } from "@/hooks/useUrlGrid"
import useInteractions from "@/features/interactions/hooks/useInteractions"
import { PIN_LIMIT } from "@/features/interactions/hooks/useWatchlistPin"
import TonightPanel from "@/features/watchlist/components/TonightPanel/TonightPanel"
import FriendsRatedShelf from "@/features/watchlist/components/FriendsRatedShelf"
import useWatchlistFilters from "@/features/watchlist/hooks/useWatchlistFilters"
import { lengthLabel, toShelves, toUpNext } from "@/features/watchlist/utils/watchlistItems"
import { isEmptyFilters, NO_MATCHES } from "@/utils/filters"
import { PAGE_SIZE } from "@/utils/pagination"

const ALL_SAVED_ID = "all-saved"
const NO_ITEMS = []

// The signed-in user's whole watchlist: Tonight's draw and the All saved grid share the URL filters; Up next
// (pinned titles) and the shelves are fixed, over the full list (friends' ratings load on approach)
export default function WatchlistPage() {
  const { data, isLoading, error } = useInteractions("watchlist")
  const items = data ?? NO_ITEMS
  const { defs, filters, setFilter, setFilters, clearFilters, shown, onOpen, isPending } = useWatchlistFilters(items)
  const shelves = useMemo(() => toShelves(items), [items])
  const upNext = useMemo(() => toUpNext(items), [items])

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
      <TonightPanel
        items={items}
        shown={shown}
        filters={filters}
        setFilter={setFilter}
        setFilters={setFilters}
        isLoading={isLoading}
        isError={Boolean(error)}
      />

      {upNext.length > 0 && (
        <MediaRow
          heading="Up next"
          count={`${upNext.length} / ${PIN_LIMIT}`}
          data={upNext}
          rank={false}
          badgeOf={lengthLabel}
          showAdded
          actions={CARD_ACTIONS.watchlist}
        />
      )}

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
          actions={CARD_ACTIONS.watchlist}
          expandable
          onToggleExpand={() => showShelf(shelf.preset)}
        />
      ))}

      {total > 0 && <FriendsRatedShelf items={items} />}

      {/* Loading, error and an empty list are Tonight's notes */}
      {total > 0 && (
        <section id={ALL_SAVED_ID} className="flex flex-col gap-4 scroll-mt-4 md:scroll-mt-28">
          <h2 className="text-text font-semibold text-xl md:px-6">
            All saved
            <Chip
              variant="count"
              size="sm"
              label={isEmptyFilters(filters) ? total : `${shown.length} of ${total}`}
              className="ml-2 align-middle"
            />
          </h2>
          <FilterBar defs={defs} filters={filters} onChange={setFilter} onClear={clearFilters} onOpen={onOpen} className="md:px-6" />
          <MediaRow
            data={pageItems}
            isExpanded
            isPending={isPending}
            gridItems={pageItems}
            page={current}
            totalPages={totalPages}
            onPageChange={setPage}
            badgeOf={lengthLabel}
            showAdded
            actions={CARD_ACTIONS.watchlist}
            emptyNote={NO_MATCHES}
          />
        </section>
      )}
    </div>
  )
}
