import { HiOutlineFilm, HiOutlineStar, HiOutlineClock, HiOutlineFire } from "react-icons/hi2"

export default function ProfileStats({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="bento-grid opacity-50 animate-pulse pointer-events-none">
        <div className="bento-card h-32" />
        <div className="bento-card h-32" />
        <div className="bento-card h-32" />
        <div className="bento-card bento-card--wide h-48" />
        <div className="bento-card bento-card--accent h-48" />
      </div>
    )
  }

  // Fallback if no stats exist yet
  if (!stats) return null

  return (
    <section className="w-full">
      <h2 className="text-text font-semibold text-xl mb-6 px-6 md:px-0">Your Cinematic Stats</h2>

      <div className="bento-grid">

        {/* Card 1: Total Rated */}
        <div className="bento-card">
          <HiOutlineFilm className="bento-card__icon" />
          <div className="mt-auto pt-4">
            <div className="bento-stat">{stats.totalRated}</div>
            <div className="bento-stat__label">Titles Rated</div>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="bento-card">
          <HiOutlineStar className="bento-card__icon" />
          <div className="mt-auto pt-4">
            <div className="bento-stat">{stats.averageScore}<span className="text-2xl text-text-muted">/10</span></div>
            <div className="bento-stat__label">Average Rating</div>
          </div>
        </div>

        {/* Card 3: Watch Time */}
        <div className="bento-card">
          <HiOutlineClock className="bento-card__icon" />
          <div className="mt-auto pt-4">
            <div className="bento-stat">{stats.totalWatchHours}<span className="text-2xl text-text-muted">h</span></div>
            <div className="bento-stat__label">Watch Time</div>
          </div>
        </div>

        {/* Card 4: Top Genres (Wide) */}
        <div className="bento-card bento-card--wide">
          <HiOutlineFire className="bento-card__icon mb-4" />
          <h3 className="bento-card__title mb-4">Most Watched Genres</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topGenres?.map((genre, index) => (
              <span
                key={genre.name}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${index === 0
                    ? 'bg-primary/20 text-primary-light border border-primary/30'
                    : 'bg-surface-100 text-text-muted'
                  }`}
              >
                {genre.name} <span className="opacity-50 text-xs ml-1">({genre.count})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Card 5: The Cinematic Title (Accent/Tall) */}
        <div className="bento-card bento-card--accent flex items-center justify-center text-center">
          <div>
            <div className="text-white/60 text-sm tracking-widest uppercase mb-2">Current Rank</div>
            <div className="text-3xl font-black text-white leading-tight">
              {stats.totalRated > 50 ? 'Cinephile' : stats.totalRated > 10 ? 'Popcorn Enthusiast' : 'Casual Viewer'}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}