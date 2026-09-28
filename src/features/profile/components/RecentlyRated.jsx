import MediaRow from "@/components/media/MediaRow"
import useExpandableGrid from "@/hooks/useExpandableGrid"
import useUserRatingsGrid from "@/features/profile/hooks/useUserRatingsGrid"

// Rows shown while collapsed; "View all" is only worth offering past this.
const ROW_LIMIT = 15

function RecentlyRated({ userId, recentlyRated, ratingsCount, isLoading, showInfo = false }) {
  const { isExpanded, page, setPage, toggle } = useExpandableGrid()
  const grid = useUserRatingsGrid(userId, page, { enabled: isExpanded })

  if (!isLoading && (!recentlyRated || recentlyRated.length === 0)) return null

  return (
    <div>
      <MediaRow
        limit={ROW_LIMIT}
        isLoading={isLoading}
        heading="Recently rated"
        data={recentlyRated}
        rank={false}
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
    </div>
  )
}

export default RecentlyRated
