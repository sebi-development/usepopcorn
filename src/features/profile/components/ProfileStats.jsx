import { HiOutlineFilm, HiOutlineStar, HiOutlineFire, HiOutlineClock } from "react-icons/hi2"
import { getGenreNames } from "@/utils/genres"
import AlertBanner from "@/components/ui/AlertBanner"
import BentoCardSkeleton from "@/components/ui/BentoCardSkeleton"

const STAT_CARDS = [
  { key: 'totalRated', label: 'Titles Rated', icon: HiOutlineFilm },
  { key: 'averageScore', label: 'Average Rating', icon: HiOutlineStar, unit: '/10' },
  { key: 'totalWatchHours', label: 'Movie Watch Time', icon: HiOutlineClock, unit: 'h' },
]

// The first threshold the user's rating count passes names their rank
const RANKS = [[250, 'Total Cinematist'], [150, 'Cinephile'], [100, 'Popcorn Enthusiast']]
const rankFor = (totalRated) => RANKS.find(([min]) => totalRated > min)?.[1] ?? 'Casual Viewer'

export default function ProfileStats({ stats, isLoading, isError }) {
  if (isLoading) {
    return (
      <div className="bento-grid bento-grid--stats">
        {STAT_CARDS.map(({ key }) => <BentoCardSkeleton key={key} className="h-32" />)}
        <BentoCardSkeleton className="bento-card--wide h-48" />
        <BentoCardSkeleton className="bento-card--accent h-48" />
      </div>
    )
  }

  if (isError) {
    return <AlertBanner variant="danger" message="Couldn't load your stats. Please try again." />
  }

  if (!stats) {
    return <AlertBanner variant="info" message="Rate a few titles to see your stats here." />
  }

  return (
    <section className="w-full">
      <h2 className="heading-section mb-6">Your Cinematic Stats</h2>

      <div className="bento-grid bento-grid--stats">
        {STAT_CARDS.map(({ key, label, icon: Icon, unit }) => (
          <div key={key} className="bento-card">
            <Icon className="bento-card__icon" />
            <div className="mt-auto pt-4">
              <p className="bento-stat">
                {stats[key] ?? '—'}
                {unit && <span className="text-2xl text-text-muted">{unit}</span>}
              </p>
              <p className="bento-stat__label">{label}</p>
            </div>
          </div>
        ))}

        <div className="bento-card bento-card--wide">
          <HiOutlineFire className="bento-card__icon mb-4" />
          <h3 className="bento-card__title mb-4">Most Watched Genres</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topGenres?.map((genre, index) => {
              const [name] = getGenreNames([genre.genreId], genre.type)
              return (
                <span
                  key={`${genre.type}-${genre.genreId}`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${index === 0
                    ? 'bg-primary/20 text-primary-light border border-primary/30'
                    : 'bg-surface-100 text-text-muted'
                    }`}
                >
                  {name ?? 'Unknown'} <span className="opacity-50 text-xs ml-1">({genre.count})</span>
                </span>
              )
            })}
          </div>
        </div>

        <div className="bento-card bento-card--accent flex items-center justify-center text-center">
          <div>
            <p className="text-white/60 text-sm tracking-widest uppercase mb-2">Current Rank</p>
            <p className="text-xl sm:text-3xl font-black text-white leading-tight break-words">
              {rankFor(stats.totalRated)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
