import { memo, useMemo } from 'react'
import useRecommendations, { useRecommendationsGrid } from '@/features/browse/hooks/useRecommendations'
import MediaRow from '@/components/media/MediaRow/MediaRow'
import { CARD_ACTIONS } from '@/components/media/cardActions'
import useUrlGrid from '@/hooks/useUrlGrid'

const PLACEHOLDER_HEADINGS = { movie: 'Recommended movies', tv: 'Recommended series' }

// `heading` replaces the default "Because you loved…" copy and `emptyNote` is shown
// when TMDB has no recommendations for the seed.
function RecommendationRow({ seed, type, isLoadingSeed, expandable = true, heading: customHeading, emptyNote }) {
  const { data, isLoading, isError } = useRecommendations(seed?.pick, type)

  // Home shows one row per type
  const { isExpanded, page, setPage, toggle } = useUrlGrid(`recommended-${type}`)
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
      showRating
      actions={CARD_ACTIONS.browse}
      expandable={expandable}
      isExpanded={isExpanded}
      isPending={grid.isPlaceholderData || (grid.isFetching && isExpanded)}
      onToggleExpand={toggle}
      gridItems={grid.items}
      gridError={grid.error}
      page={page}
      totalPages={grid.totalPages}
      onPageChange={setPage}
      emptyNote={emptyNote}
    />
  )
}

export default memo(RecommendationRow)
