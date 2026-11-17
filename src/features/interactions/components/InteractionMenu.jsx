import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PiDotsThreeVerticalBold } from "react-icons/pi"
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs"
import Tooltip from "@/components/ui/Tooltip"
import InteractionButton from "@/features/interactions/components/InteractionButton"
import useWatchlistPin from "@/features/interactions/hooks/useWatchlistPin"

// Below md an invisible ::before widens each 32px control to a 44px tap area, sideways only so stacked targets don't overlap
const TAP_AREA = "before:absolute before:-inset-x-1.5 md:before:hidden"
const ITEM_CLASS = `w-8 h-8 md:w-6 md:h-6 rounded-full flex items-center justify-center before:inset-y-0 ${TAP_AREA}`
const DOTS_CLASS = `relative w-8 h-8 md:w-6 md:h-6 rounded-full flex items-center justify-center cursor-pointer text-text before:-top-1.5 before:bottom-0 ${TAP_AREA}`

// Height fold (grid rows 0fr <-> 1fr). Folded items stay mounted: unmounting on close would drop the button
// before its own click runs. clip-y, not hidden, so tooltips can open sideways; `inert` keeps folded items
// out of hover and tab order. Short and on ease-out-quint so it reads as near-instant.
function Fold({ rows, inert = false, onClickCapture, children }) {
  return (
    <div className={`grid transition-[grid-template-rows] duration-150 ease-out-quint motion-reduce:transition-none ${rows}`}>
      <div className="min-h-0 overflow-y-clip" inert={inert} onClickCapture={onClickCapture}>{children}</div>
    </div>
  )
}

const OPEN = "grid-rows-[1fr]"
const CLOSED = "grid-rows-[0fr]"
// Dots: always shown on mobile, revealed instantly on card hover on desktop (CSS only, no state)
const DOTS_HOVER = "md:hidden md:group-hover/card:block"

// Pins the title to Up next or unpins it (watchlist page cards)
function PinButton({ media, isPinned }) {
  const togglePin = useWatchlistPin()
  return (
    <Tooltip label={isPinned ? "Unpin" : "Pin to Up next"} side="left">
      <button
        type="button"
        onClick={() => togglePin(media, isPinned)}
        aria-label={isPinned ? "Unpin from Up next" : "Pin to Up next"}
        aria-pressed={isPinned}
        className={`relative cursor-pointer group/btn active:scale-90 ${ITEM_CLASS}`}
      >
        {isPinned
          ? <BsPinAngleFill className="text-primary-light" size={15} />
          : <BsPinAngle className="text-white/30 group-hover/btn:text-primary-light" size={15} />}
      </button>
    </Tooltip>
  )
}

// Card actions pill, top-right of a MediaCard. The dots fold it open to the items in `actions.menu`; an
// active Favorite / Watchlist listed in `actions.markers` stays visible so it can be toggled without
// opening the menu. A pin's marker is the card's own, so Pin shows only in the open menu.
function InteractionMenu({ id, type, title, posterPath, actions, isFavorited, isWatchlisted, isPinned }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const media = useMemo(() => ({ id, type, title, poster_path: posterPath }), [id, type, title, posterPath])

  const close = useCallback(() => setOpen(false), [])

  // Closes on Escape, outside tap and when the pointer leaves the card; listeners exist only while open
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

  const offers = (name) => actions.menu.includes(name)
  const keepsFav = isFavorited && actions.markers.includes("favorite")
  const keepsWatch = isWatchlisted && actions.markers.includes("watchlist")
  const showFav = open || keepsFav
  const showWatch = open || keepsWatch
  const visible = open || keepsFav || keepsWatch

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className={`absolute top-2 right-2 z-20 flex flex-col items-center rounded-full bg-surface-900/80 border border-surface-100 shadow-sm ${
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
          <PiDotsThreeVerticalBold size={14} />
        </button>
      </div>

      {offers("favorite") && (
        <Fold rows={showFav ? OPEN : CLOSED} inert={!showFav} onClickCapture={close}>
          <InteractionButton
            type="favorite"
            media={media}
            isActive={isFavorited}
            tooltipSide="left"
            tooltipLabel="Favorite"
            className={ITEM_CLASS}
          />
        </Fold>
      )}
      {offers("watchlist") && (
        <Fold rows={showWatch ? OPEN : CLOSED} inert={!showWatch} onClickCapture={close}>
          <InteractionButton
            type="watchlist"
            media={media}
            isActive={isWatchlisted}
            tooltipSide="left"
            tooltipLabel="Watchlist"
            className={ITEM_CLASS}
          />
        </Fold>
      )}
      {offers("pin") && (
        <Fold rows={open ? OPEN : CLOSED} inert={!open} onClickCapture={close}>
          <PinButton media={media} isPinned={isPinned} />
        </Fold>
      )}
    </div>
  )
}

export default memo(InteractionMenu)
