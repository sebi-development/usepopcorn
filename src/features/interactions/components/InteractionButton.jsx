import { IoMdHeart } from 'react-icons/io'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs'
import Tooltip from '@/components/ui/Tooltip'
import useToggleInteractions from '@/features/interactions/hooks/useToggleInteractions'

// Per list: its name in the tooltip and its icon, filled while the title is on it. The idle icons
// preview the fill on hover.
const KINDS = {
  favorite: {
    name: 'favorites',
    ariaLabel: 'Toggle Favorite',
    active: <IoMdHeart className="text-danger drop-shadow-[0_0_8px_rgba(250,82,82,0.6)]" size={18} />,
    idle: <IoMdHeart className="text-white/30 group-hover/btn:text-danger group-hover/btn:drop-shadow-[0_0_8px_rgba(250,82,82,0.6)] transition-all duration-300" size={18} />,
  },
  watchlist: {
    name: 'watchlist',
    ariaLabel: 'Toggle Watchlist',
    active: <BsBookmarkFill className="text-primary-light drop-shadow-[0_0_8px_rgba(121,80,242,0.6)]" size={16} />,
    idle: (
      <>
        <BsBookmark className="text-white/30 group-hover/btn:opacity-0 transition-opacity duration-300" size={16} />
        <BsBookmarkFill className="absolute opacity-0 group-hover/btn:opacity-100 text-primary-light drop-shadow-[0_0_8px_rgba(121,80,242,0.6)] transition-opacity duration-300" size={16} />
      </>
    ),
  },
}

// Adds a title to the user's favorites or watchlist (`type`), or takes it off
export default function InteractionButton({ type, media, isActive = false, className = '', tooltipSide = 'bottom', tooltipLabel }) {
  const { toggle } = useToggleInteractions(type)
  const kind = KINDS[type]

  if (!media?.id && !media?.tmdb_id) return null

  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    toggle(media, isActive)
  }

  return (
    <Tooltip label={tooltipLabel ?? `${isActive ? 'Remove from' : 'Add to'} ${kind.name}`} side={tooltipSide}>
      <button
        onClick={handleClick}
        aria-label={kind.ariaLabel}
        aria-pressed={isActive}
        className={`relative flex items-center justify-center transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group/btn active:scale-90 ${className}`}
      >
        {isActive ? kind.active : kind.idle}
      </button>
    </Tooltip>
  )
}
