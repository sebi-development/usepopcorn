import { useState, memo } from "react"
import { HiOutlineLockClosed } from "react-icons/hi2"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import { today } from "@/utils/tmdbItem"
import StarRating from "@/features/ratings/components/StarRating"
import DeleteRating from "@/features/ratings/components/DeleteRating"
import InteractionButton from "@/features/interactions/components/InteractionButton"
import Score from "@/features/media_details/components/ActionSection/Score"
import ShareButton from "@/features/media_details/components/ActionSection/ShareButton"
import useTitleActions from "@/features/media_details/components/ActionSection/useTitleActions"

const DOCK_BUTTON_CLASS = "flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-xl bg-surface-500/50 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"

// The title's average score, the user's own rating and the watchlist / favorite / share dock
function ActionSection({ media, tmdbId, type }) {
  const { userScore, averageScore, isFavorited, isWatchlisted, rate, removeRating } = useTitleActions(media, tmdbId, type)
  const [isRatingMode, setIsRatingMode] = useState(false)
  const ratingPanelRef = useOutsideClick(() => setIsRatingMode(false))

  const hasRated = !!userScore
  // Out somewhere: its release date, or the regional one in the user's country
  const isReleased = [media.release_date || media.first_air_date, media.regionalReleaseDate].some((day) => day && day <= today())
  const isLocked = !hasRated && !isReleased

  return (
    <div className="[grid-area:rating] md:self-end flex flex-col items-center justify-center py-2 md:py-6 gap-4 md:gap-8 w-full">

      <Score value={averageScore != null ? Math.round(averageScore * 10) : null} locked={isLocked} />

      <div className="w-full relative flex items-center justify-center min-h-14 md:h-14">
        <button
          onClick={() => setIsRatingMode(true)}
          disabled={isLocked}
          className={`absolute min-h-13 md:min-h-0 px-6 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-text-muted hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-text-muted disabled:hover:bg-transparent disabled:hover:border-white/10 ${
            isRatingMode ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {isLocked ? (
            <span className="flex items-center gap-2">
              <HiOutlineLockClosed size={16} />
              Rating opens on release
            </span>
          ) : hasRated ? (
            <span className="flex items-center gap-2">
              Your rating: <strong className="text-amber-400">{userScore}/10</strong>
            </span>
          ) : (
            "Add rating"
          )}
        </button>

        {isRatingMode && (
          <div className="w-full md:absolute md:inset-x-0 flex justify-center">
            <div
              ref={ratingPanelRef}
              className="flex items-center justify-center w-full max-w-sm md:w-88 md:max-w-none bg-surface-900/50 border border-white/5 backdrop-blur-md shadow-inner px-2 md:px-5 py-2.5 rounded-xl"
            >
              <StarRating
                maxStars={10}
                size={24}
                rating={userScore || 0}
                onRate={(score) => {
                  rate(score)
                  setIsRatingMode(false)
                }}
              >
                {hasRated && (
                  <DeleteRating
                    className="md:p-1"
                    onClick={() => {
                      removeRating()
                      setIsRatingMode(false)
                    }}
                    hasRating={true}
                  />
                )}
              </StarRating>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <InteractionButton type="watchlist" media={media} isActive={isWatchlisted} className={DOCK_BUTTON_CLASS} />
        <InteractionButton type="favorite" media={media} isActive={isFavorited} className={DOCK_BUTTON_CLASS} />
        <ShareButton className={DOCK_BUTTON_CLASS} />
      </div>

    </div>
  )
}

export default memo(ActionSection)
