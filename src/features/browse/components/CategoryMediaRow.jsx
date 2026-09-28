import useCategoryMedia, { useCategoryMediaGrid, SECTION_TO_TYPE } from '@/features/browse/hooks/useCategoryMedia'
import MediaRow from '@/components/media/MediaRow'
import useDelayedLoading from '@/hooks/useDelayedLoading'
import useExpandableGrid from '@/hooks/useExpandableGrid'

export default function CategoryMediaRow({ section, categoryId, title, favoriteSet }) {
  const { isExpanded, page, setPage, toggle } = useExpandableGrid()

  // Row query only fetches while collapsed; grid query only fetches while
  // expanded. Both hooks are always called (rules of hooks), but `enabled`
  // means only one of them is ever actually hitting the network.
  const list = useCategoryMedia(section, categoryId, { enabled: !isExpanded })
  const grid = useCategoryMediaGrid(section, categoryId, page, { enabled: isExpanded })

  const showLoading = useDelayedLoading(list.isLoading)

  return (
    <MediaRow
      heading={title}
      data={list.items}
      mediaType={SECTION_TO_TYPE[section]}
      isLoading={showLoading}
      isError={list.isError}
      onLoadMore={list.fetchMore}
      hasMore={list.phase === 'auto'}
      showFavorite={true}
      favoritedSet={favoriteSet}
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
