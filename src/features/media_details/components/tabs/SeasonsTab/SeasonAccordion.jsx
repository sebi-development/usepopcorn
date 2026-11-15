import { memo, useState } from 'react'
import { HiChevronDown } from 'react-icons/hi2'
import AlertBanner from '@/components/ui/AlertBanner'
import { today } from '@/utils/tmdbItem'
import useSeasonDetails from '@/features/media_details/hooks/useSeasonDetails'
import EpisodeRow, { EpisodeSkeleton } from '@/features/media_details/components/tabs/SeasonsTab/EpisodeRow'

const LIST_CLASS = 'grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-x-6 gap-y-1 px-2 pb-4 pt-1'
const SKELETON_EPISODES = [1, 2, 3, 4, 5, 6, 7, 8]

// Usually a cache hit: the tab's first open fetches every season at once (useAllSeasonDetails)
function SeasonEpisodes({ tvId, seasonNumber }) {
  const { data, isLoading, isError } = useSeasonDetails(tvId, seasonNumber)

  if (isLoading && !data) return (
    <div className={LIST_CLASS}>
      {SKELETON_EPISODES.map((i) => <EpisodeSkeleton key={i} />)}
    </div>
  )

  if (isError || !data?.episodes) return (
    <AlertBanner variant='danger' message="Could not load episodes. Please try again later." />
  )

  // A string, so the memoized rows get equal props on every render
  const todayISO = today()

  return (
    <div className={LIST_CLASS}>
      {data.episodes.map((ep) => (
        <EpisodeRow key={ep.id} episode={ep} seasonNumber={seasonNumber} todayISO={todayISO} />
      ))}
    </div>
  )
}

function SeasonAccordion({ tvId, season, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center gap-3 py-4 text-left hover:bg-surface-100/10 transition-colors rounded-lg px-2">
        <HiChevronDown className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
        <span className="font-bold text-text min-w-0 truncate">{season.name}</span>
        <span className="text-sm text-text-muted shrink-0 whitespace-nowrap">{season.episode_count} episodes • {season.air_date?.slice(0, 4) || 'TBA'}</span>
      </button>
      {isOpen && <SeasonEpisodes tvId={tvId} seasonNumber={season.season_number} />}
    </div>
  )
}

export default memo(SeasonAccordion)
