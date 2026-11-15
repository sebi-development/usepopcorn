import { memo } from 'react'
import SkeletonBox from '@/components/ui/SkeletonBox'
import { DOT_CLASS, isUnaired, toneOf } from '@/features/media_details/components/tabs/SeasonsTab/episodeTones'

// The skeleton uses the same columns, so nothing moves when the episodes land
const ROW_CLASS = 'grid grid-cols-[8px_44px_minmax(0,1fr)_auto] gap-x-3 items-center py-2 px-2'

export function EpisodeSkeleton() {
  return (
    <div className={ROW_CLASS}>
      <SkeletonBox className={DOT_CLASS} />
      <SkeletonBox className="h-3 w-8 rounded" />
      <SkeletonBox className="h-4 w-3/4 max-w-50 rounded" />
      <SkeletonBox className="h-3 w-10 rounded" />
    </div>
  )
}

function EpisodeRow({ episode, seasonNumber, todayISO }) {
  const unaired = isUnaired(episode, todayISO)
  const code = `S${String(seasonNumber).padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')}`

  return (
    <div className={`${ROW_CLASS} hover:bg-surface-100/10 rounded-md transition-colors cursor-default`}>
      <span className={`${DOT_CLASS} ${toneOf(episode, unaired).color}`} />
      <span className="text-xs font-mono text-text-muted">{code}</span>
      <span className={`text-sm truncate ${unaired ? 'text-text-muted italic' : 'text-text'}`}>{episode.name}</span>
      <span className="text-xs text-text-muted whitespace-nowrap">{unaired || !episode.runtime ? 'TBA' : `${episode.runtime} min`}</span>
    </div>
  )
}

export default memo(EpisodeRow)
