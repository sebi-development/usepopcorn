import { memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { HiChevronDown } from "react-icons/hi2"
import { FiSearch } from "react-icons/fi"
import Chip from "@/components/ui/Chip"
import { useOutsideClick } from "@/hooks/useOutsideClick"

const GROW = { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }

// A quick re-toggle starts from wherever the running grow/shrink
const restart = (el, keyframes) => {
  el.getAnimations().forEach((animation) => animation.cancel())
  el.animate(keyframes, GROW)
}

// Lists longer than this get a search box; Type, Score and Period are short enough to scan
const SEARCH_MIN_OPTIONS = 8

// A multi list commits its picks once they pause this long (or as it closes), so ticking three
// genres in a row is one URL change, one request and one cache entry instead of three
const COMMIT_DELAY = 400

// Order-free identity of a multi value (the URL keeps them sorted, picks come in any order)
const sameValues = (a, b) => (a ? [...a].sort().join() : "") === (b ? [...b].sort().join() : "")

// Case- and accent-insensitive, so "cote" finds "Côte d'Ivoire"
const fold = (text) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

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
// A select picks one value and closes; a multi toggles values and stays open, its picks held as a
// draft until they are committed (COMMIT_DELAY).
const FilterPill = memo(function FilterPill({ def, value, onChange, onOpen }) {
  const [isOpen, setIsOpen] = useState(false)

  // Multi picks not committed yet ({ value }), null when the pill shows the committed value.
  // Any new committed value (this pill's commit, a removed chip, Clear all) supersedes it.
  const [draft, setDraft] = useState(null)
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setDraft(null)
  }
  const current = draft ? draft.value : value

  useEffect(() => {
    if (!draft || !isOpen) return
    const timer = setTimeout(() => onChange(def.key, draft.value), COMMIT_DELAY)
    return () => clearTimeout(timer)
  }, [draft, isOpen, def.key, onChange])

  // Closing commits what is pending at once (an outside click closes in the capture phase, so
  // before whatever was clicked reacts)
  const close = useCallback(() => {
    setIsOpen(false)
    if (draft) onChange(def.key, draft.value)
  }, [draft, def.key, onChange])
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
  const isActive = current != null
  const count = def.kind === "multi" && current ? current.length : 0

  function toggle() {
    if (isOpen) return close()
    onOpen?.(def.key)
    setIsOpen(true)
  }

  function pick(optionValue) {
    if (def.kind === "multi") {
      const picked = current ?? []
      const next = picked.includes(optionValue)
        ? picked.filter((v) => v !== optionValue)
        : [...picked, optionValue]
      // Ticked back to what is committed: nothing left to commit
      setDraft(sameValues(next, value) ? null : { value: next.length ? next : undefined })
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

      {isOpen && <OptionList def={def} value={current} onPick={pick} panelRef={panelRef} id={listId} />}
    </div>
  )
})

export default FilterPill
