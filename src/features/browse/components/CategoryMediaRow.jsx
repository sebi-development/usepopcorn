import useCategoryMedia, { useCategoryMediaGrid, SECTION_TO_TYPE } from '@/features/browse/hooks/useCategoryMedia'
import MediaRow from '@/components/media/MediaRow/MediaRow'
import { CARD_ACTIONS } from '@/components/media/cardActions'
import useUrlGrid from '@/hooks/useUrlGrid'
import { isEmptyFilters, NO_MATCHES } from '@/utils/filters'

const NO_ITEMS = []

// `filters` are the Browse filters from useUrlFilters (stable until a value changes). A filter change
// drops the grid's page from the URL, so the new result set opens on page 1, still in grid mode.
export default function CategoryMediaRow({ section, categoryId, title, filters }) {
  // Upcoming shows two of these rows, so each is named by its category
  const { isExpanded, page, setPage, toggle } = useUrlGrid(categoryId)

  // Row query only fetches while collapsed; grid query only fetches while
  // expanded. Both hooks are always called (rules of hooks), but `enabled`
  // means only one of them is ever actually hitting the network.
  const list = useCategoryMedia(section, categoryId, { enabled: !isExpanded, filters })
  const grid = useCategoryMediaGrid(section, categoryId, page, { enabled: isExpanded, filters })

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
      actions={CARD_ACTIONS.browse}
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
      // An unfiltered category is never empty; a filtered one can be
      emptyNote={isEmptyFilters(filters) ? undefined : NO_MATCHES}
    />
  )
}
