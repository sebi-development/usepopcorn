// src/features/interactions/components/FavoritesButton.jsx
import useToggleInteractions from '../../interactions/hooks/useToggleInteractions'
import Tooltip from '../../../components/Tooltip'
import { IoMdHeart } from 'react-icons/io'
import toast from 'react-hot-toast'

export default function FavoriteButton({ media, className = '', isFavorited, hideTooltip = false }) {
  const { mutate } = useToggleInteractions('favorite')
  const activeFavorite = Boolean(isFavorited)

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
    
    toast.success(activeFavorite ? "Removed from Favorites" : "Added to Favorites")
  }

  if (!media?.id && !media?.tmdb_id) return null

  return (
    <Tooltip label={activeFavorite ? 'Remove from favorites' : 'Add to favorites'} side="bottom" disabled={hideTooltip}>
      <button
        onClick={handleClick}
        className={`relative flex items-center justify-center transition-all duration-300 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed group/btn active:scale-90 ${className}`}
        aria-label="Toggle Favorite"
      >
        {activeFavorite ? (
          <IoMdHeart className="text-danger drop-shadow-[0_0_8px_rgba(250,82,82,0.6)] animate-in zoom-in spin-in-12 duration-300" size={18} />
        ) : (
          <IoMdHeart className="text-white/30 group-hover/btn:text-danger group-hover/btn:drop-shadow-[0_0_8px_rgba(250,82,82,0.6)] transition-all duration-300" size={18} />
        )}
      </button>
    </Tooltip>
  )
}