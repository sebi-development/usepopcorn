import { useState, memo } from "react"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import StarRating from "@/features/ratings/components/StarRating"
import DeleteRating from "@/features/ratings/components/DeleteRating"
import WatchlistButton from "@/features/interactions/components/WatchlistButton"
import Score from "@/features/media_details/components/Score"
import FavoriteButton from "@/features/interactions/components/FavoritesButton"
import ShareButton from "@/features/media_details/components/ShareButton"

const dockBtnClass = "flex items-center justify-center w-10 h-10 rounded-xl bg-surface-500/50 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"

export default memo(function ActionSection({ media, userRating, averageScore, isWatchlisted, isFavorited, onRate, onDelete }) {
  const [isRatingMode, setIsRatingMode] = useState(false)
  const hasRated = !!userRating?.score

  const ratingPanelRef = useOutsideClick(() => setIsRatingMode(false))

  return (
    <div className="[grid-area:rating] flex flex-col items-center justify-center py-6 gap-8 w-full">

      <Score value={averageScore != null ? Math.round(averageScore * 10) : null} />

      <div className="w-full relative flex items-center justify-center h-14">
        <button
          onClick={() => setIsRatingMode(true)}
          className={`absolute px-6 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-text-muted hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-200 cursor-pointer ${
            isRatingMode ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {hasRated ? (
            <span className="flex items-center gap-2">
              Your rating: <strong className="text-amber-400">{userRating?.score}/10</strong>
            </span>
          ) : (
            "Add rating"
          )}
        </button>

        {isRatingMode && (
          <div className="absolute animate-in fade-in zoom-in-95 duration-200">
            <div
              ref={ratingPanelRef}
              className="flex items-center gap-4 bg-surface-900/50 border border-white/5 backdrop-blur-md shadow-inner px-6 py-3 rounded-xl"
            >
              <StarRating
                maxStars={10}
                size={18}
                rating={userRating?.score || 0}
                onRate={(score) => {
                  onRate(score)
                  setIsRatingMode(false)
                }}
              />

              {hasRated && (
                <>
                  <div className="w-[1px] h-6 bg-white/10" />
                  <DeleteRating
                    onClick={() => {
                      onDelete()
                      setIsRatingMode(false)
                    }}
                    hasRating={true}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Dock */}
      <div className="flex items-center justify-center gap-3">
        <WatchlistButton
          media={media}
          isWatchlisted={isWatchlisted}
          className={dockBtnClass}
        />
        <FavoriteButton
          media={media}
          isFavorited={isFavorited}
          className={dockBtnClass}
        />
        <ShareButton className={dockBtnClass} />
      </div>

    </div>
  )
}