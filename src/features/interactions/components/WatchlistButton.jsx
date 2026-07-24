// src/features/interactions/components/WatchlistButton.jsx
import useToggleInteractions from '../../interactions/hooks/useToggleInteractions'
import Tooltip from '../../../components/Tooltip'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'
import toast from 'react-hot-toast'

export default function WatchlistButton({ media, className = '', isWatchlisted, hideTooltip = false }) {
  const { mutate } = useToggleInteractions('watchlist')
  const activeWatchlist = Boolean(isWatchlisted)

  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()

    if (!media) return

    mutate({
      tmdb_id: media.id || media.tmdb_id,
      title: media.title || media.name,
      poster_path: media.poster_path,
      media_type: media.media_type || media.type || 'movie'
    })

    toast.success(activeWatchlist ? "Removed from Watchlist" : "Added to Watchlist")
  }

  if (!media?.id && !media?.tmdb_id) return null

  return (
    <Tooltip label={activeWatchlist ? 'Remove from watchlist' : 'Add to watchlist'} side="bottom" disabled={hideTooltip}>
      <button
        onClick={handleClick}
        className={`relative flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/btn active:scale-90 ${className}`}
        aria-label="Toggle Watchlist"
      >
        {activeWatchlist ? (
          <BsBookmarkFill className="text-primary-light drop-shadow-[0_0_8px_rgba(121,80,242,0.6)] animate-in zoom-in duration-300" size={16} />
        ) : (
          <BsBookmark className="text-white/30 group-hover/btn:text-primary-light group-hover/btn:drop-shadow-[0_0_8px_rgba(121,80,242,0.6)] transition-all duration-300" size={16} />
        )}
      </button>
    </Tooltip>
  )
}