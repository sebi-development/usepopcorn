import { memo, useMemo } from 'react'
import useRecommendations, { useRecommendationsGrid } from '@/features/browse/hooks/useRecommendations'
import MediaRow from '@/components/media/MediaRow'
import useExpandableGrid from '@/hooks/useExpandableGrid'

const PLACEHOLDER_HEADINGS = { movie: 'Recommended movies', tv: 'Recommended series' }

// `heading` replaces the default "Because you loved…" copy and `emptyNote` is shown
// when TMDB has no recommendations for the seed.
function RecommendationRow({ seed, type, isLoadingSeed, expandable = true, heading: customHeading, emptyNote }) {
  const { data, isLoading, isError } = useRecommendations(seed?.pick, type)

  const { isExpanded, page, setPage, toggle } = useExpandableGrid()
  const grid = useRecommendationsGrid(seed?.pick, type, page, { enabled: expandable && isExpanded })

  const heading = useMemo(() => {
    if (customHeading) return customHeading
    if (!seed) return PLACEHOLDER_HEADINGS[type]
    return (
      <>
        {`Because you loved "${seed.pick.title}"`}
        {seed.note && (
          <span className="ml-2 text-xs font-normal text-text-muted">best of your {seed.note}</span>
        )}
      </>
    )
  }, [customHeading, seed, type])

  if (!seed && !isLoadingSeed) return null

  if (emptyNote && data?.length === 0) {
    return <p className="text-sm text-text-muted md:px-6">{emptyNote}</p>
  }

  return (
    <MediaRow
      heading={heading}
      data={data}
      mediaType={type}
      // No seed here means the seed lookup is still in flight (see the guard above)
      isLoading={!seed || isLoading}
      isError={isError}
      showInfo={true}
      rank={false}
      expandable={expandable}
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

export default memo(RecommendationRow)
