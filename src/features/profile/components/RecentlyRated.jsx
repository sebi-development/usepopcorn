import MediaRow from "@/components/media/MediaRow/MediaRow"
import useUrlGrid from "@/hooks/useUrlGrid"
import useUserRatingsGrid from "@/features/profile/hooks/useUserRatingsGrid"

// Rows shown while collapsed; "View all" is only worth offering past this.
const ROW_LIMIT = 15

function RecentlyRated({ userId, recentlyRated, ratingsCount, isLoading, showInfo = false }) {
  const { isExpanded, page, setPage, toggle } = useUrlGrid("rated")
  const grid = useUserRatingsGrid(userId, page, { enabled: isExpanded })

  if (!isLoading && (!recentlyRated || recentlyRated.length === 0)) return null

  return (
    <MediaRow
      limit={ROW_LIMIT}
      isLoading={isLoading}
      heading="Recently rated"
      data={recentlyRated}
      rank={false}
      showRating
      showInfo={showInfo}
      expandable={ratingsCount > ROW_LIMIT}
      isExpanded={isExpanded}
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

export default RecentlyRated
