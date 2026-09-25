import { memo } from 'react'
import { Link } from 'react-router'
import { HiStar, HiFilm } from 'react-icons/hi2'
import FeatureCard, { FeatureCardSkeleton } from '@/components/ui/FeatureCard'
import Chip from '@/components/ui/Chip'
import RatingBadge from '@/components/media/RatingBadge'
import { PERIODS } from '@/utils/periods'

const KINDS = {
  movie: {
    noun: 'Movie',
    colorRgb: '14, 165, 233',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    icon: <HiFilm className="text-2xl sm:text-4xl text-sky-400" />,
    browseTo: '/browse?type=movies&category=trending',
  },
  tv: {
    noun: 'Series',
    colorRgb: '245, 158, 11',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    icon: <HiStar className="text-2xl sm:text-4xl text-amber-400" />,
    browseTo: '/browse?type=series&category=trending',
  },
}

const TEXT = 'text-[10px] sm:text-sm text-text-muted leading-tight line-clamp-2'
// Stretched link: the ::after covers the whole card so it is one click target,
// without nesting the title Chip (a <button>) in an <a>
const STRETCHED = `${TEXT} hover:text-text transition-colors after:absolute after:inset-0 after:z-20`

export default memo(function BestRatedCard({ pick, kind, period = 'month', isLoading }) {
  if (isLoading) return <FeatureCardSkeleton />

  const { noun, colorRgb, gradient, icon, browseTo } = KINDS[kind]
  const periodLabel = PERIODS[period].label

  return (
    <FeatureCard
      heroBackground={
        pick?.poster_path
          ? `url('https://image.tmdb.org/t/p/w342${pick.poster_path}') center/cover`
          : gradient
      }
      // The icon only decorates the gradient placeholder; a poster stands alone
      floatingIcon={pick?.poster_path ? undefined : icon}
    >
      <Chip size="sm" colorRgb={colorRgb} className="self-start max-w-full">
        <span className="truncate">{noun} of the {periodLabel}</span>
      </Chip>
      {pick ? (
        <>
          {/* DetailPage reads the media type from router state (defaults to 'movie') */}
          <Link to={`/browse/${pick.tmdb_id}`} state={{ type: pick.type }} className={STRETCHED}>
            {pick.title}
          </Link>
          <RatingBadge text={`${pick.rating}/10`} size={14} className="mt-auto text-text text-xs sm:text-sm font-bold" />
        </>
      ) : (
        <Link to={browseTo} className={STRETCHED}>
          Rate a {noun.toLowerCase()} this {periodLabel.toLowerCase()}
        </Link>
      )}
    </FeatureCard>
  )
})
