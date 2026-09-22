import { useMemo, useState, useRef, memo } from "react"
import { useNavigate } from "react-router"
import { HiChevronDown } from "react-icons/hi2"
import { TbRating18Plus } from "react-icons/tb"
import useInteractions from "@/features/interactions/hooks/useInteractions"
import FavoriteButton from "@/features/interactions/components/FavoritesButton"
import WatchlistButton from "@/features/interactions/components/WatchlistButton"
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
  showUpcomingChip = false,
  isFavorited: isFavoritedProp,
  isWatchlisted: isWatchlistedProp,
}) {
  const navigate = useNavigate()
  const [infoOpen, setInfoOpen] = useState(false)

  // Skip the query subscription entirely when the parent already provides
  // the boolean — avoids N×2 redundant observers in browse grids.
  const needsFavoriteHook = showFavorite && isFavoritedProp === undefined
  const needsWatchlistHook = showWatchlist && isWatchlistedProp === undefined

  const { data: favorites } = useInteractions('favorite', undefined, { enabled: needsFavoriteHook })
  const { data: watchlist } = useInteractions('watchlist', undefined, { enabled: needsWatchlistHook })

  const favoritedSet = useMemo(() => {
    if (!needsFavoriteHook || !favorites) return null
    return new Set(favorites.map(item => Number(item.tmdb_id ?? item.id)))
  }, [favorites, needsFavoriteHook])

  const watchlistedSet = useMemo(() => {
    if (!needsWatchlistHook || !watchlist) return null
    return new Set(watchlist.map(item => Number(item.tmdb_id ?? item.id)))
  }, [watchlist, needsWatchlistHook])

  const isFavorited = isFavoritedProp !== undefined ? isFavoritedProp : (showFavorite && !!id && favoritedSet?.has(Number(id)))
  const isWatchlisted = isWatchlistedProp !== undefined ? isWatchlistedProp : (showWatchlist && !!id && watchlistedSet?.has(Number(id)))
  const activeFavorite = Boolean(isFavorited)

  const releaseYear = releaseDate?.slice(0, 4)
  const displayScore = voteAverage != null ? voteAverage.toFixed(1) : null
  const isUpcoming = releaseDate ? new Date(releaseDate) > new Date() : false

  // Deferred until first opened to save lookup cost for skipped cards.
  // Cached indefinitely afterwards to prevent layout shift during close animation.
  const genresRef = useRef([])
  if (infoOpen && genreIds?.length && genresRef.current.length === 0) {
    genresRef.current = getGenreNames(genreIds, type)
  }
  const genreNames = genresRef.current

  return (
    <div
      onClick={() => navigate(`/browse/${id}`, { state: { type } })}
      className="group/card relative overflow-hidden rounded-card cursor-pointer aspect-2/3 hover:scale-105 transition-transform duration-300 hover:z-10"
    >
      <MoviePoster
        src={getTmdbImageUrl(posterPath, 'w342')}
        alt={title}
        className="w-full h-full"
      />

      {(showFavorite || showWatchlist) && (
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
          {showFavorite && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`transition-opacity duration-300 ${activeFavorite ? 'opacity-100' : 'opacity-60 md:opacity-0 md:group-hover/card:opacity-100'}`}
            >
              <FavoriteButton
                media={{ id, type, title, poster_path: posterPath }}
                isFavorited={activeFavorite}
                hideTooltip={true}
                className="w-8 h-8 rounded-full bg-surface-900/80 backdrop-blur-sm border border-surface-100 shadow-lg hover:bg-surface-500 text-base flex items-center justify-center"
              />
            </div>
          )}
          {showWatchlist && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`transition-opacity duration-300 ${isWatchlisted ? 'opacity-100' : 'opacity-60 md:opacity-0 md:group-hover/card:opacity-100'}`}
            >
              <WatchlistButton
                media={{ id, type, title, poster_path: posterPath }}
                isWatchlisted={isWatchlisted}
                hideTooltip={true}
                className="w-8 h-8 rounded-full bg-surface-900/80 backdrop-blur-sm border border-surface-100 shadow-lg hover:bg-surface-500 text-base"
              />
            </div>
          )}
        </div>
      )}

      {userRating && (
        <div className="absolute top-2 right-2 z-10">
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

      {showUpcomingChip && (
        <div className={`absolute bottom-2 left-2 z-10 pointer-events-none transition-opacity duration-200 ${infoOpen ? 'opacity-0' : 'opacity-100'}`}>
          <Chip variant="ghost" size="xs">Upcoming</Chip>
        </div>
      )}
      {showInfo && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setInfoOpen((v) => !v) }}
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