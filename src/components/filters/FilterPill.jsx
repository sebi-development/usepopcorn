import { memo, useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { HiChevronDown } from "react-icons/hi2"
import { FiSearch } from "react-icons/fi"
import Chip from "@/components/ui/Chip"
import { useOutsideClick } from "@/hooks/useOutsideClick"

// Same motion as SlidingTabs: ease-out-quint (the `ease-out-quint` theme token), leaves quickly
// and settles softly
const GROW = { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }

// A quick re-toggle starts from wherever the running grow/shrink is, so it is dropped rather than
// left to stack under the new one
const restart = (el, keyframes) => {
  el.getAnimations().forEach((animation) => animation.cancel())
  el.animate(keyframes, GROW)
}

// Lists longer than this get a search box; Type, Score and Period are short enough to scan
const SEARCH_MIN_OPTIONS = 8

// Case- and accent-insensitive, so "cote" finds "Côte d'Ivoire"
const fold = (text) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

// Fractional layout width. offsetWidth rounds, and a pill held even 0.3px under its label's width
// shows an ellipsis (the label flickered to "Gen…" at the end of a close)
const widthOf = (el) => el.getBoundingClientRect().width

// The open list. Mounted only while open, so its search query resets every time the list closes.
// Rows are plain centred text with UserMenu's hover fill, so they read as choices, not more pills.
// The search is never focused for the user: most picks are a scroll and a tap, so a caret or a
// raised phone keyboard on every open would be noise. Tapping the box starts a search.
function OptionList({ def, value, onPick, panelRef, id }) {
  const [query, setQuery] = useState("")
  const options = def.options
  const searchable = options?.length > SEARCH_MIN_OPTIONS

  const folded = useMemo(() => options?.map((option) => fold(option.label)), [options])
  const needle = fold(query.trim())
  const shown = needle ? options.filter((_, i) => folded[i].includes(needle)) : options

  // Enter takes the first match; a multi clears the query so the next value can be searched
  function handleKeyDown(e) {
    if (e.key !== "Enter" || !shown?.length) return
    onPick(shown[0].value)
    if (def.kind === "multi") setQuery("")
  }

  return (
    // Border colour of the outline pill and a light, static blur (the list never moves, only its
    // clip changes while it opens, so the blur isn't re-rendered across the screen). No shadow:
    // the opening clip would cut it off and it would pop in when the reveal ends.
    // A searchable list is at least min-w-28 wide, so short options (Year) leave room to type
    <div
      ref={panelRef}
      id={id}
      className={`absolute top-[calc(100%+0.375rem)] left-0 z-50 flex flex-col overflow-hidden rounded-2xl border border-surface-300 bg-surface-900/80 backdrop-blur-sm ${searchable ? "min-w-28" : ""}`}
    >
      {searchable && (
        <div className="relative mx-1.5 mt-1.5">
          <FiSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={`Search ${def.label.toLowerCase()} options`}
            // size={1}: the input must not widen the list when it is measured at max-content.
            // text-base below md: iOS zooms the page when a focused input is under 16px
            size={1}
            className="w-full h-11 md:h-8 pl-8 pr-2 rounded-md bg-surface-900/60 border border-white/5 text-base md:text-sm text-text outline-none focus:border-primary-light/50 transition-colors"
          />
        </div>
      )}

      <div className="flex flex-col gap-0.5 p-1.5 max-h-64 overflow-y-auto overscroll-contain scrollbar-hide">
        {options === undefined ? (
          <p className="py-2 text-center text-sm text-text-muted whitespace-nowrap">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="py-2 text-center text-xs text-text-muted whitespace-nowrap">No matches</p>
        ) : shown.map((option) => {
          const selected = def.kind === "multi" ? !!value?.includes(option.value) : value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onPick(option.value)}
              aria-pressed={selected}
              className={`shrink-0 h-11 md:h-8 px-1.5 rounded-md truncate text-center text-sm cursor-pointer hover:bg-surface-100 transition-colors ${selected ? "text-primary-light" : "text-text-muted hover:text-text"}`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// One filter: an outline pill that drops its option list right under itself.
// Opening grows the pill to fit its longest option (pushing the pills after it), and the list
// hangs underneath at exactly the pill's width, so both share edges and a centre line. The pill
// never outgrows the room left on its row: longer options truncate instead.
// The chevron only shows when there is something to pick: `options` undefined means "not loaded
// yet" (opening calls `onOpen(key)` so the surface can load them), an empty list disables the pill.
// A select picks one value and closes; a multi toggles values and stays open.
const FilterPill = memo(function FilterPill({ def, value, onChange, onOpen }) {
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])
  const ref = useOutsideClick(close)
  const panelRef = useRef(null)
  // The pill's width while its list is open (null while closed)
  const openWidth = useRef(null)
  const listId = useId()

  // Sized before paint, once per open (and again if the options arrive while open, e.g. Friend);
  // typing in the search never re-measures, so the list keeps its width while it filters.
  // The pill's width (it has to reflow the row to push its neighbours) and the list's clip-path
  // (paint only) run on one timing, so the list is revealed exactly as wide as the pill on every
  // frame. Reduced motion just snaps.
  useLayoutEffect(() => {
    const wrap = ref.current
    const panel = panelRef.current
    const motion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (isOpen && panel) {
      // The measured width includes a running shrink, so a reopen continues from where the pill is
      const from = openWidth.current ?? widthOf(wrap)
      panel.style.width = "max-content"
      const room = wrap.parentElement.getBoundingClientRect().right - wrap.getBoundingClientRect().left
      const to = Math.max(from, Math.min(widthOf(panel), room))
      panel.style.width = `${to}px`
      wrap.style.width = `${to}px`
      openWidth.current = to
      if (motion && to > from) {
        restart(wrap, [{ width: `${from}px` }, { width: `${to}px` }])
        restart(panel, [{ clipPath: `inset(0 ${to - from}px 0 0 round 1rem)` }, { clipPath: "inset(0 round 1rem)" }])
      }
    } else if (!isOpen && openWidth.current != null) {
      const from = widthOf(wrap)
      openWidth.current = null
      wrap.getAnimations().forEach((animation) => animation.cancel())
      wrap.style.width = ""
      const to = widthOf(wrap)
      if (motion && from > to) restart(wrap, [{ width: `${from}px` }, { width: `${to}px` }])
    }
  }, [isOpen, def.options, ref])

  const hasOptions = def.options === undefined || def.options.length > 0
  const isActive = value != null
  const count = def.kind === "multi" && value ? value.length : 0

  function toggle() {
    if (!isOpen) onOpen?.(def.key)
    setIsOpen((open) => !open)
  }

  function pick(optionValue) {
    if (def.kind === "multi") {
      const current = value ?? []
      const next = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue]
      onChange(def.key, next.length ? next : undefined)
    } else {
      onChange(def.key, value === optionValue ? undefined : optionValue)
      close()
    }
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <Chip
        variant="outline"
        active={isActive}
        onClick={hasOptions ? toggle : undefined}
        aria-expanded={hasOptions ? isOpen : undefined}
        aria-controls={isOpen ? listId : undefined}
        className={`w-full min-h-11 md:min-h-0 ${hasOptions ? "" : "opacity-50"}`}
      >
        <span className="truncate">{def.label}{count > 1 && ` · ${count}`}</span>
        {hasOptions && (
          <HiChevronDown
            className={`w-3 h-3 shrink-0 transition-transform duration-300 ease-out-quint motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </Chip>

      {isOpen && <OptionList def={def} value={value} onPick={pick} panelRef={panelRef} id={listId} />}
    </div>
  )
})

export default FilterPill
