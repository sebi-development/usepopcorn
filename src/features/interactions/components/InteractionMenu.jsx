import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PiDotsThreeVerticalBold } from "react-icons/pi"
import FavoriteButton from "@/features/interactions/components/FavoritesButton"
import WatchlistButton from "@/features/interactions/components/WatchlistButton"

// Below md the controls are 32px and an invisible ::before widens each tap area to 44px. It only
// grows sideways (and upwards for the dots), so the stacked targets never overlap.
const TAP_AREA = "before:absolute before:-inset-x-1.5 md:before:hidden"
const ITEM_CLASS = `w-8 h-8 md:w-7 md:h-7 rounded-full flex items-center justify-center before:inset-y-0 ${TAP_AREA}`
// The dots are the pill's raised capsule, visibly distinct from the plain action icons
const DOTS_CLASS = `relative w-8 h-8 md:w-7 md:h-7 rounded-full flex items-center justify-center cursor-pointer bg-white/10 text-text hover:bg-white/20 transition-colors before:-top-1.5 before:bottom-0 ${TAP_AREA}`

// Height fold (grid rows 0fr <-> 1fr, same technique as the category rail). clip-y, not hidden, so
// tooltips can still open sideways; `inert` keeps folded items out of hover and tab order.
function Fold({ rows, inert = false, onClickCapture, children }) {
  return (
    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${rows}`}>
      <div className="min-h-0 overflow-y-clip" inert={inert} onClickCapture={onClickCapture}>{children}</div>
    </div>
  )
}

const OPEN = "grid-rows-[1fr]"
const CLOSED = "grid-rows-[0fr]"
// Only the click-to-open roll is animated. Hover just shows / hides the dots instantly (no automatic
// entrance animation): always there on mobile, desktop reveals them on card hover (CSS only, no state)
const DOTS_HOVER = "md:hidden md:group-hover/card:block"

// Card actions in one glass pill, top-right of a MediaCard. The dots roll the pill open to reveal
// Favorite / Watchlist; an action that is already active stays on the card so it can be toggled
// directly without opening the menu.
function InteractionMenu({ id, type, title, posterPath, showFavorite, showWatchlist, isFavorited, isWatchlisted }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const media = useMemo(() => ({ id, type, title, poster_path: posterPath }), [id, type, title, posterPath])

  const close = useCallback(() => setOpen(false), [])

  // The menu is a one-shot tool: it closes after an action, on Escape, on an outside tap and when the
  // pointer leaves the card (this element's parent). Listeners exist only while open, not per card at rest.
  useEffect(() => {
    if (!open) return
    const card = ref.current?.parentElement
    const onPointerDown = (e) => { if (!ref.current?.contains(e.target)) close() }
    const onKeyDown = (e) => { if (e.key === "Escape") close() }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    card?.addEventListener("mouseleave", close)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      card?.removeEventListener("mouseleave", close)
    }
  }, [open, close])

  const showFav = showFavorite && (open || isFavorited)
  const showWatch = showWatchlist && (open || isWatchlisted)
  // Nothing to show on desktop until hover, unless an action is active or the menu is open: then the
  // pill (dots included) is always there, so hovering never makes anything appear or move
  const visible = open || isFavorited || isWatchlisted

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-2 right-2 z-20 flex flex-col items-center rounded-full bg-surface-900/80 backdrop-blur-sm border border-surface-100 shadow-sm ${
        visible ? "" : "md:opacity-0 md:group-hover/card:opacity-100"
      }`}
    >
      <div className={visible ? "" : DOTS_HOVER}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Card actions"
          className={DOTS_CLASS}
        >
          <PiDotsThreeVerticalBold size={16} />
        </button>
      </div>

      {showFavorite && (
        <Fold rows={showFav ? OPEN : CLOSED} inert={!showFav} onClickCapture={close}>
          <FavoriteButton
            media={media}
            isFavorited={isFavorited}
            tooltipSide="left"
            tooltipLabel="Favorite"
            className={ITEM_CLASS}
          />
        </Fold>
      )}
      {showWatchlist && (
        <Fold rows={showWatch ? OPEN : CLOSED} inert={!showWatch} onClickCapture={close}>
          <WatchlistButton
            media={media}
            isWatchlisted={isWatchlisted}
            tooltipSide="left"
            tooltipLabel="Watchlist"
            className={ITEM_CLASS}
          />
        </Fold>
      )}
    </div>
  )
}

export default memo(InteractionMenu)
