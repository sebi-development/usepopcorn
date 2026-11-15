import { memo } from 'react'
import { HiStar, HiFilm } from 'react-icons/hi2'
import FeatureCard from '@/features/browse/components/cards/FeatureCard'
import RatingBadge from '@/components/media/RatingBadge'
import { PERIODS } from '@/utils/periods'

const KINDS = {
  movie: {
    noun: 'Movie',
    theme: { gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', Icon: HiFilm, iconClass: 'text-sky-200', rgb: '14, 165, 233' },
    browseTo: '/browse?type=movies&category=trending',
  },
  tv: {
    noun: 'Series',
    theme: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', Icon: HiStar, iconClass: 'text-amber-400', rgb: '245, 158, 11' },
    browseTo: '/browse?type=series&category=trending',
  },
}

export default memo(function BestRatedCard({ pick, kind, period = 'month', isLoading }) {
  const { noun, theme, browseTo } = KINDS[kind]
  const periodLabel = PERIODS[period].label

  return (
    <FeatureCard
      theme={theme}
      isLoading={isLoading}
      label={`${noun} of the ${periodLabel}`}
      text={pick ? pick.title : `Rate a ${noun.toLowerCase()} this ${periodLabel.toLowerCase()}`}
      to={pick ? `/browse/${pick.tmdb_id}` : browseTo}
      // DetailPage reads the media type from router state (defaults to 'movie')
      state={pick && { type: pick.type }}
    >
      {pick && <RatingBadge text={`${pick.rating}/10`} size={14} className="mt-auto text-text text-xs sm:text-sm font-bold" />}
    </FeatureCard>
  )
})
