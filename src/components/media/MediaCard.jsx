import { useMemo, useState, memo } from "react"
import { useNavigate } from "react-router"
import { HiChevronDown } from "react-icons/hi2"
import { TbRating18Plus } from "react-icons/tb"
import InteractionMenu from "@/features/interactions/components/InteractionMenu"
import MoviePoster from "@/components/media/MoviePoster"
import { getGenreNames } from "@/utils/genres"
import getTmdbImageUrl from "@/utils/tmdbImage"

import RatingBadge from "@/components/media/RatingBadge"
import Chip from "@/components/ui/Chip"

function MediaCard({
  id,
  type = 'movie',
  title,
  posterPath,
  releaseDate,
  voteAverage,
  genreIds,
  isAdult = false,
  rank,
  userRating,
  showFavorite = false,
  showWatchlist = false,
  showInfo = true,
  isFavorited = false,
  isWatchlisted = false,
}) {
  const navigate = useNavigate()
  const [infoOpen, setInfoOpen] = useState(false)
  const [infoOpened, setInfoOpened] = useState(false)

  const releaseYear = releaseDate?.slice(0, 4)
  const displayScore = voteAverage != null ? voteAverage.toFixed(1) : null
  const isUpcoming = releaseDate ? new Date(releaseDate) > new Date() : false

  // Deferred until first opened to save lookup cost for skipped cards.
  // Kept once opened (infoOpened never resets) to prevent layout shift during close animation.
  const genreNames = useMemo(
    () => (infoOpened ? getGenreNames(genreIds ?? [], type) : []),
    [infoOpened, genreIds, type]
  )

  return (
    <div
      onClick={() => navigate(`/browse/${id}`, { state: { type } })}
      // content-visibility lets the browser skip layout/paint for cards scrolled
      // out of view in long rows. Fixed width + aspect-2/3 give it a known size
      // to reserve, so scrolling doesn't shift.
      className="group/card relative overflow-hidden rounded-card cursor-pointer aspect-2/3 hover:scale-105 transition-transform duration-300 hover:z-10 [content-visibility:auto]"
    >
      <MoviePoster
        src={getTmdbImageUrl(posterPath, 'w342')}
        alt={title}
        className="w-full h-full"
      />

      {(showFavorite || showWatchlist) && (
        <InteractionMenu
          id={id}
          type={type}
          title={title}
          posterPath={posterPath}
          showFavorite={showFavorite}
          showWatchlist={showWatchlist}
          isFavorited={isFavorited}
          isWatchlisted={isWatchlisted}
        />
      )}

      {/* Score chip, top-left on the heart's row. In "Recently rated" it is that row's score,
          everywhere else the signed-in user's own rating of the title. */}
      {userRating && (
        <div className="absolute top-2 left-2 z-10 h-[30px] flex items-center">
          <Chip variant="ghost" size="sm" className="shadow-lg font-semibold">
            <RatingBadge text={userRating} size={14} />
          </Chip>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />
      {rank && (
        <span className="absolute bottom-2 left-3 text-5xl font-black leading-none select-none pointer-events-none text-white/20">
          {rank}
        </span>
      )}

      {showInfo && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setInfoOpen((v) => !v); setInfoOpened(true) }}
            className="absolute bottom-2 right-2 z-20 w-6 h-6 rounded-full cursor-pointer bg-surface-900/70 backdrop-blur-sm flex items-center justify-center text-text-muted transition-opacity duration-200 opacity-60 md:opacity-0 md:group-hover/card:opacity-100"
            aria-expanded={infoOpen}
            aria-label="Show details"
          >
            <HiChevronDown size={12} className={`transition-transform duration-200 ${infoOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute inset-0 z-10 bg-surface-900/85 backdrop-blur-sm flex flex-col justify-end p-3 gap-1 transition-opacity duration-200 ${
              infoOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <p className="text-base font-semibold text-text leading-tight line-clamp-2">
              {title}
              {releaseYear && (
                <span className="text-sm font-normal text-text-muted ml-1 whitespace-nowrap">({releaseYear})</span>
              )}
            </p>

            {genreNames.length > 0 && (
              <p className="text-xs text-text-muted line-clamp-1">{genreNames.join(', ')}</p>
            )}

            <div className="flex items-center justify-between gap-2">
              {isUpcoming
                ? (
                  <Chip variant="ghost" size="xs">Upcoming</Chip>
                )
                : displayScore > 0.0
                ? (
                  <Chip variant="ghost" size="xs">
                    <RatingBadge text={displayScore} size={10} className="text-[10px] font-medium text-text" />
                  </Chip>
                )
                : <span />}
              {isAdult && (
                <TbRating18Plus className="text-danger shrink-0" size={18} aria-label="18+" />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default memo(MediaCard)