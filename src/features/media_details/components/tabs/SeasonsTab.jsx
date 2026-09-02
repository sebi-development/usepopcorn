import { memo, useState, useMemo } from 'react'
import useSeasonDetails from '../../hooks/useSeasonDetails'
import { HiChevronDown } from 'react-icons/hi2'
import SkeletonBox from '../../../../components/skeletons/components/SkeletonBox'
import AlertBanner from '../../../../components/AlertBanner'

const RATING_LEGEND = [
  { color: 'bg-success', label: 'Great' },
  { color: 'bg-warning', label: 'Mixed' },
  { color: 'bg-danger', label: 'Poor' },
  { color: 'bg-surface-300', label: 'Unaired' },
]

const EpisodeRow = memo(function EpisodeRow({ episode, seasonNumber, todayISO }) {
  const isUnaired = episode.vote_count === 0 || !episode.air_date || episode.air_date > todayISO
  const dotColor = isUnaired
    ? 'bg-surface-300'
    : episode.vote_average >= 7.5
      ? 'bg-success'
      : episode.vote_average >= 6.0
        ? 'bg-warning'
        : 'bg-danger'
  const code = `S${String(seasonNumber).padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')}`

  return (
    <div className="grid grid-cols-[8px_44px_minmax(0,1fr)_auto] gap-x-3 items-center py-2 px-2 hover:bg-surface-100/10 rounded-md transition-colors cursor-default">
      <span className={`block shrink-0 w-2 h-2 rounded-full ${dotColor}`} />
      <span className="text-xs font-mono text-text-muted">{code}</span>
      <span className={`text-sm truncate ${isUnaired ? 'text-text-muted italic' : 'text-text'}`}>{episode.name}</span>
      <span className="text-xs text-text-muted whitespace-nowrap">{isUnaired || !episode.runtime ? 'TBA' : `${episode.runtime} min`}</span>
    </div>
  )
})

function EpisodeSkeleton() {
  return (
    <div className="grid grid-cols-[8px_44px_minmax(0,1fr)_auto] gap-x-3 items-center py-2 px-2">
      <SkeletonBox className="w-2 h-2 rounded-full" />
      <SkeletonBox className="h-3 w-8 rounded" />
      <SkeletonBox className="h-4 w-3/4 max-w-50 rounded" />
      <SkeletonBox className="h-3 w-10 rounded" />
    </div>
  )
}

function SeasonEpisodes({ tvId, seasonNumber }) {
  const { data, isLoading, isError } = useSeasonDetails(tvId, seasonNumber)

  // Data should already be in cache from the bulk fetch.
  // If somehow it's still loading, show skeleton.
  if (isLoading && !data) return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-6 gap-y-1 px-2 pb-4 pt-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <EpisodeSkeleton key={i} />
      ))}
    </div>
  )

  if (isError || !data?.episodes) return (
    <AlertBanner variant='danger' message="Could not load episodes. Please try again later." />
  )

  // Compute once per list render — primitive string for memo-friendly props (OPT-027)
  const todayISO = new Date().toISOString().split('T')[0]

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-6 gap-y-1 px-2 pb-4 pt-1">
      {data.episodes.map((ep) => (
        <EpisodeRow key={ep.id} episode={ep} seasonNumber={seasonNumber} todayISO={todayISO} />
      ))}
    </div>
  )
}

function SeasonsLoadingSkeleton() {
  return (
    <div className="bg-surface-500 rounded-card p-6 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-4 px-2">
          <SkeletonBox className="w-4 h-4 rounded" />
          <SkeletonBox className="h-5 w-28 rounded" />
          <SkeletonBox className="h-4 w-40 rounded" />
        </div>
      ))}
      {/* Legend skeleton to match non-loading layout */}
      <div className="flex items-center gap-5 pt-4 mt-2 border-t border-surface-100/20">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <SkeletonBox className="w-2 h-2 rounded-full" />
            <SkeletonBox className="h-3 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

const SeasonAccordion = memo(function SeasonAccordion({ tvId, season, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center gap-3 py-4 text-left hover:bg-surface-100/10 transition-colors rounded-lg px-2">
        <HiChevronDown className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
        <span className="font-bold text-text">{season.name}</span>
        <span className="text-sm text-text-muted">{season.episode_count} episodes • {season.air_date?.slice(0, 4) || 'TBA'}</span>
      </button>
      {isOpen && <SeasonEpisodes tvId={tvId} seasonNumber={season.season_number} />}
    </div>
  )
})

export default function SeasonsTab({ tvId, seasons, isBulkLoading }) {
  const filteredSeasons = useMemo(() => {
    if (!seasons) return []
    return seasons.filter(s => s.season_number > 0).sort((a, b) => b.season_number - a.season_number)
  }, [seasons])

  if (isBulkLoading) return <SeasonsLoadingSkeleton />

  return (
    <div className="bg-surface-500 rounded-card p-6">
      {filteredSeasons.map((season, index) => (
        <SeasonAccordion
          key={season.id}
          tvId={tvId}
          season={season}
          defaultOpen={index === 0}
        />
      ))}

      {/* Legend */}
      <div className="flex items-center gap-5 pt-4 mt-2 border-t border-surface-100/20">
        {RATING_LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`block shrink-0 w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
