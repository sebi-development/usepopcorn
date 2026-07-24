import { useMemo } from "react"
import { useNavigate } from "react-router"
import { HiStar } from "react-icons/hi2"
import useInteractions from "../features/interactions/hooks/useInteractions"
import FavoriteButton from "../features/interactions/components/FavoritesButton"
import WatchlistButton from "../features/interactions/components/WatchlistButton"
import MoviePoster from "./MoviePoster"

export default function MediaCard({
  id,
  type = 'movie',
  title,
  posterPath,
  rank,
  userRating,
  showFavorite = false,
  showWatchlist = false,
  isFavorited: isFavoritedProp
}) {
  const navigate = useNavigate()

  // Fetch both lists autonomously
  const { data: favorites } = useInteractions('favorite')
  const { data: watchlist } = useInteractions('watchlist')

  // 2. Derive states only if the flags are active — use Set<number> for O(1) and type-safe lookups
  const favoritedSet = useMemo(() => {
    if (!favorites) return new Set()
    return new Set(favorites.map(item => Number(item.tmdb_id ?? item.id)))
  }, [favorites])

  const watchlistedSet = useMemo(() => {
    if (!watchlist) return new Set()
    return new Set(watchlist.map(item => Number(item.tmdb_id ?? item.id)))
  }, [watchlist])

  const isFavorited = isFavoritedProp !== undefined ? isFavoritedProp : (showFavorite && !!id && favoritedSet.has(Number(id)))
  const isWatchlisted = showWatchlist && !!id && watchlistedSet.has(Number(id))

  const activeFavorite = Boolean(isFavorited)

  return (
    <div
      onClick={() => navigate(`/browse/${id}`, { state: { type } })} 
      className="group/card relative overflow-hidden rounded-card cursor-pointer aspect-2/3 hover:scale-105 transition-transform duration-300 hover:z-10"
    >
      {/* Poster */}
      <MoviePoster
        src={import.meta.env.VITE_TMDB_IMAGE_URL + posterPath}
        alt={title}
        className="w-full h-full"
      />

      {/* Action Buttons (Top Left) */}
      {(showFavorite || showWatchlist) && (
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">

          {/* Favorite Heart Overlay */}
          {showFavorite && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`transition-opacity duration-300 ${activeFavorite ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'}`}
            >
              <FavoriteButton
                media={{ id, type, title, poster_path: posterPath }}
                isFavorited={activeFavorite}
                hideTooltip={true}
                className="w-8 h-8 rounded-full bg-surface-900/80 backdrop-blur-sm border border-surface-100 shadow-lg hover:bg-surface-500 text-base flex items-center justify-center"
              />
            </div>
          )}

          {/* Watchlist Bookmark Overlay */}
          {showWatchlist && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`transition-opacity duration-300 ${isWatchlisted ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'}`}
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

      {/* Rating Chip (Top Right) */}
      {userRating && (
        <div className="absolute top-2 right-2 bg-surface-900/80 backdrop-blur-sm border border-surface-100 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold text-text z-10 shadow-lg">
          <HiStar className="text-amber-300" size={14} />
          <span>{userRating}</span>
        </div>
      )}

      {/* Rank */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      {rank && (
        <span className="absolute bottom-2 left-3 text-5xl font-black text-white/20 leading-none select-none pointer-events-none">
          {rank}
        </span>
      )}
    </div>
  )
}