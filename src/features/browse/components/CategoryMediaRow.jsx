import { useState } from 'react'
import useCategoryMedia, { useCategoryMediaGrid, SECTION_TO_TYPE } from '@/features/browse/hooks/useCategoryMedia'
import MediaRow from '@/components/media/MediaRow'
import useExpandableGrid from '@/hooks/useExpandableGrid'
import { isEmptyFilters } from '@/utils/filters'

const NO_ITEMS = []

// `filters` are the Browse filters from useUrlFilters (stable until a value changes)
export default function CategoryMediaRow({ section, categoryId, title, filters }) {
  const { isExpanded, page, setPage, toggle } = useExpandableGrid()

  // New filters mean a new result set: back to its first page, staying in grid mode
  const [prevFilters, setPrevFilters] = useState(filters)
  if (filters !== prevFilters) {
    setPrevFilters(filters)
    setPage(1)
  }

  // Row query only fetches while collapsed; grid query only fetches while
  // expanded. Both hooks are always called (rules of hooks), but `enabled`
  // means only one of them is ever actually hitting the network.
  const list = useCategoryMedia(section, categoryId, { enabled: !isExpanded, filters })
  const grid = useCategoryMediaGrid(section, categoryId, page, { enabled: isExpanded, filters })

  const shown = isExpanded ? grid.items : list.items
  if (shown?.length === 0 && !isEmptyFilters(filters)) return (
    <div className="md:px-6">
      <h2 className="text-text font-semibold text-xl mb-2">{title}</h2>
      <p className="text-sm text-text-muted">No titles match these filters.</p>
    </div>
  )

  return (
    <MediaRow
      heading={title}
      // While expanded the row query is off, so a filter change leaves it without data for the new
      // key; MediaRow renders nothing without data, so it gets an empty row behind the grid
      data={isExpanded ? (list.items ?? NO_ITEMS) : list.items}
      mediaType={SECTION_TO_TYPE[section]}
      isLoading={list.isLoading}
      delaySkeleton
      isError={list.isError}
      onLoadMore={list.fetchMore}
      hasMore={list.phase === 'auto'}
      showFavorite
      showWatchlist
      showRating
      expandable
      isExpanded={isExpanded}
      // isPlaceholderData is true exactly while keepPreviousData is
      // standing in for the page that hasn't arrived yet — the correct
      // signal here, not a transition's isPending (see usePagedGrid.js).
      isPending={grid.isPlaceholderData || (grid.isFetching && isExpanded)}
      onToggleExpand={toggle}
      gridItems={grid.items}
      gridError={grid.error}
      page={page}
      totalPages={grid.totalPages}
      onPageChange={setPage}
    />
  )
}
