import { HiOutlineFilm, HiOutlineStar, HiOutlineFire, HiOutlineClock } from "react-icons/hi2"
import { getGenreNames } from "@/utils/genres"
import AlertBanner from "@/components/ui/AlertBanner"
import BentoCardSkeleton from "@/components/ui/BentoCardSkeleton"

export default function ProfileStats({ stats, isLoading, isError }) {

  if (isLoading) {
    return (
      <div className="bento-grid">
        <BentoCardSkeleton className="h-32" />
        <BentoCardSkeleton className="h-32" />
        <BentoCardSkeleton className="h-32" />
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
      <h2 className="text-text font-semibold text-xl mb-6 px-6 md:px-0">Your Cinematic Stats</h2>

      <div className="bento-grid">

        {/* Card 1: Total Rated */}
        <div className="bento-card">
          <HiOutlineFilm className="bento-card__icon" />
          <div className="mt-auto pt-4">
            <p className="bento-stat">{stats.totalRated}</p>
            <p className="bento-stat__label">Titles Rated</p>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="bento-card">
          <HiOutlineStar className="bento-card__icon" />
          <div className="mt-auto pt-4">
            <p className="bento-stat">
              {stats.averageScore != null ? stats.averageScore : '—'}
              <span className="text-2xl text-text-muted">/10</span>
            </p>
            <p className="bento-stat__label">Average Rating</p>
          </div>
        </div>

        {/* Card 3: Watch Time */}
        <div className="bento-card">
          <HiOutlineClock className="bento-card__icon" />
          <div className="mt-auto pt-4">
            <p className="bento-stat">
              {stats.totalWatchHours != null ? stats.totalWatchHours : '—'}
              <span className="text-2xl text-text-muted">h</span>
            </p>
            <p className="bento-stat__label">Movie Watch Time</p>
          </div>
        </div>

        {/* Card 4: Top Genres (Wide) */}
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

        {/* Card 5: The Cinematic Title (Accent) */}
        <div className="bento-card bento-card--accent flex items-center justify-center text-center">
          <div>
            <p className="text-white/60 text-sm tracking-widest uppercase mb-2">Current Rank</p>
            <p className="text-3xl font-black text-white leading-tight">
              {stats.totalRated > 50 ? 'Cinephile' : stats.totalRated > 10 ? 'Popcorn Enthusiast' : 'Casual Viewer'}
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}