import { useState, useCallback } from 'react'
import useCategoryMedia, { useCategoryMediaGrid, SECTION_TO_TYPE } from '@/features/browse/hooks/useCategoryMedia'
import MediaRow from '@/components/media/MediaRow'
import useDelayedLoading from '@/hooks/useDelayedLoading'

export default function CategoryMediaRow({ section, categoryId, title, favoriteSet }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [page, setPage] = useState(1)

  // Row query only fetches while collapsed; grid query only fetches while
  // expanded. Both hooks are always called (rules of hooks), but `enabled`
  // means only one of them is ever actually hitting the network.
  const {
    data, isLoading, error,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useCategoryMedia(section, categoryId, { enabled: !isExpanded })

  const {
    data: gridData, error: gridError, totalPages,
    isPlaceholderData, isFetching: isGridFetching,
  } = useCategoryMediaGrid(section, categoryId, page, { enabled: isExpanded })

  const showLoading = useDelayedLoading(isLoading)

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((v) => !v)
    setPage(1) // start fresh each time grid mode is entered or left
  }, [])

  return (
    <MediaRow
      heading={title}
      data={data}
      mediaType={SECTION_TO_TYPE[section]}
      isLoading={showLoading}
      isError={error}
      limit={40}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      showFavorite={true}
      favoritedSet={favoriteSet}
      showUpcomingChip={categoryId === 'upcoming'}
      expandable
      isExpanded={isExpanded}
      // isPlaceholderData is true exactly while keepPreviousData is
      // standing in for the page that hasn't arrived yet — the correct
      // signal here, not a transition's isPending (see useCategoryMedia.js).
      isPending={isPlaceholderData || (isGridFetching && isExpanded)}
      onToggleExpand={handleToggleExpand}
      gridData={gridData}
      gridError={gridError}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  )
}