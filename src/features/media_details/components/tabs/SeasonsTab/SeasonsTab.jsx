import { useMemo } from 'react'
import SkeletonBox from '@/components/ui/SkeletonBox'
import SeasonAccordion from '@/features/media_details/components/tabs/SeasonsTab/SeasonAccordion'
import { DOT_CLASS, RATING_LEGEND } from '@/features/media_details/components/tabs/SeasonsTab/episodeTones'

// Shared with the skeleton, so the panel keeps its size when the seasons land
const PANEL_CLASS = 'bg-surface-500 rounded-card p-1 md:p-6'
const LEGEND_CLASS = 'flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-5 pt-4 mt-2 border-t border-surface-100/20'
const SKELETON_SEASONS = [1, 2, 3, 4]

function SeasonsSkeleton() {
  return (
    <div className={PANEL_CLASS}>
      {SKELETON_SEASONS.map((i) => (
        <div key={i} className="flex items-center gap-3 py-4 px-2">
          <SkeletonBox className="w-4 h-4 rounded" />
          <SkeletonBox className="h-5 w-28 rounded" />
          <SkeletonBox className="h-4 w-40 rounded" />
        </div>
      ))}
      <div className={LEGEND_CLASS}>
        {RATING_LEGEND.map(({ label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <SkeletonBox className={DOT_CLASS} />
            <SkeletonBox className="h-3 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// `seasons` comes without TMDB's specials (season 0), see toMediaDetails
export default function SeasonsTab({ tvId, seasons, isBulkLoading }) {
  const newestFirst = useMemo(() => seasons.toSorted((a, b) => b.season_number - a.season_number), [seasons])

  if (isBulkLoading) return <SeasonsSkeleton />

  return (
    <div className={PANEL_CLASS}>
      {newestFirst.map((season, index) => (
        <SeasonAccordion key={season.id} tvId={tvId} season={season} defaultOpen={index === 0} />
      ))}

      <div className={LEGEND_CLASS}>
        {RATING_LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`${DOT_CLASS} ${color}`} />
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
