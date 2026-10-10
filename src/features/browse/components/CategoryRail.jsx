import { memo, useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { HiOutlineFilm, HiOutlineTv, HiOutlineTag, HiChevronRight, HiChevronDown } from "react-icons/hi2"

import { useScrollLock } from "@/hooks/useScrollLock"
import InspireSearch from "@/features/browse/components/InspireSearch"
import { SECTION_TO_TYPE } from "@/features/browse/hooks/useCategoryMedia"
import { HOME_ITEM, INSPIRE_ITEM, MOVIE_CATEGORIES, SERIES_CATEGORIES } from "@/features/browse/constants/categories"
import { MOVIE_GENRES, TV_GENRES } from "@/utils/genres"

const MOVIE_GENRE_ITEMS = Object.entries(MOVIE_GENRES)
  .map(([tmdbId, label]) => ({ id: `genre-${tmdbId}`, tmdbId: Number(tmdbId), label }))
  .sort((a, b) => a.label.localeCompare(b.label))

const TV_GENRE_ITEMS = Object.entries(TV_GENRES)
  .map(([tmdbId, label]) => ({ id: `genre-${tmdbId}`, tmdbId: Number(tmdbId), label }))
  .sort((a, b) => a.label.localeCompare(b.label))

// Icon of the selected category, shown on the mobile trigger
function getActiveIcon({ section, categoryId }) {
  if (categoryId === "home") return HOME_ITEM.icon
  if (categoryId === INSPIRE_ITEM.id) return INSPIRE_ITEM.icon
  if (categoryId.startsWith("genre-")) return HiOutlineTag
  const list = section === "series" ? SERIES_CATEGORIES : MOVIE_CATEGORIES
  return list.find((c) => c.id === categoryId)?.icon ?? (section === "series" ? HiOutlineTv : HiOutlineFilm)
}

// `active` is now { section: 'movies' | 'series', categoryId: string } —
// bare category ids collide across sections (both have 'trending'), so the
// active state has to carry which section it belongs to.
//
// md+: the fixed, hover-expanding rail. Below md there is no hover, so a compact
// trigger opens the same rail (icons + labels) as a floating panel over a dimmed page.
//
// Each section has an Inspire item: an accordion like Genres holding a title search for that
// section's media type (`InspireSearch`). `onInspireSelect(seed)` receives the picked title.
// It is a one-shot tool: the accordion folds (and the search clears) after a pick and whenever
// the rail closes, so the next visit starts from the plain rail again.
//
// Motion follows SlidingTabs: one property drives each change, on the `ease-out-quint` curve,
// and reduced motion snaps. Expanding animates only the rail's width: a row's label is a flex item
// that shrinks to nothing on the collapsed rail (the chevron after it lands just outside the
// rail's clip), so the growing rail reveals both and no per-row transitions run. The mobile panel
// moves when it opens, so it has no backdrop blur (a moving blur is re-rendered on every frame);
// it sits over a dimmed page with a solid fill.
const CategoryRail = memo(function CategoryRail({ active, activeLabel, onSelect, onInspireSelect, onExpandChange }) {
  const [expanded, setExpandedState] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [movieGenresOpen, setMovieGenresOpen] = useState(false)
  const [seriesGenresOpen, setSeriesGenresOpen] = useState(false)
  const [inspireOpen, setInspireOpen] = useState(false)
  const panelRef = useRef(null)

  const showLabels = expanded || mobileOpen
  const ActiveIcon = getActiveIcon(active)
  // Also follows the URL: leaving an Inspire page (e.g. browser back) folds its search away
  const onInspirePage = active.categoryId === INSPIRE_ITEM.id

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
    setInspireOpen(false)
  }, [])

  // Freeze the page while the mobile panel is open so touch scrolling only moves the panel
  useScrollLock(mobileOpen)

  useEffect(() => {
    if (!mobileOpen) return
    panelRef.current?.focus()
    const onKeyDown = (e) => { if (e.key === "Escape") closeMobile() }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mobileOpen, closeMobile])

  function setExpanded(value) {
    setExpandedState(value)
    if (!value) setInspireOpen(false)
    onExpandChange?.(value)
  }

  function select(section, categoryId) {
    onSelect(section, categoryId)
    closeMobile()
  }

  // Typing in an Inspire search keeps the rail open even when the pointer wanders off;
  // it folds once focus leaves (see onBlur below)
  function handleRailLeave(e) {
    const el = document.activeElement
    if (el?.tagName === "INPUT" && e.currentTarget.contains(el)) return
    setExpanded(false)
  }

  // Inspire opens its search instead of closing the mobile overlay, so the user can type right away
  function toggleInspire(section) {
    if (onInspirePage && active.section === section) {
      setInspireOpen((v) => !v)
      return
    }
    onSelect(section, INSPIRE_ITEM.id)
    setInspireOpen(true)
  }

  const pickSeed = useCallback((seed) => {
    onInspireSelect(seed)
    closeMobile()
  }, [onInspireSelect, closeMobile])

  function renderItem({ id, label, icon: Icon, section, hasChevron, isOpen, onToggle }) {
    const isActive = active.section === section && active.categoryId === id

    return (
      <button
        key={`${section}-${id}`}
        type="button"
        onClick={() => (hasChevron ? onToggle() : select(section, id))}
        aria-current={isActive ? "page" : undefined}
        aria-expanded={hasChevron ? isOpen : undefined}
        className={`
          flex items-center w-full h-11 md:h-8 rounded-md
          transition-colors duration-200 ease-out
          ${isActive
            ? "bg-primary/15 text-primary-light font-medium"
            : "text-text-muted hover:bg-surface-300/60 hover:text-text"}
        `}
      >
        <span className="flex items-center justify-center w-8 h-full shrink-0">
          <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
        </span>
        <span className="flex-1 min-w-0 pl-1 overflow-hidden whitespace-nowrap text-sm text-left">{label}</span>
        {hasChevron && (
          <span
            className={`flex items-center justify-center w-6 mr-1 shrink-0 transition-transform duration-300 ease-out-quint motion-reduce:transition-none ${isOpen ? "rotate-90" : ""}`}
          >
            <HiChevronRight size={16} />
          </span>
        )}
      </button>
    )
  }

  // Height-animated fold shared by the Genres lists and the Inspire search. `inert` also keeps
  // the folded-away controls out of the tab order.
  function renderAccordion(isOpen, children) {
    const isVisible = showLabels && isOpen
    return (
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out-quint motion-reduce:transition-none"
        style={{ gridTemplateRows: isVisible ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden" inert={!isVisible}>
          {children}
        </div>
      </div>
    )
  }

  function renderGenreList(genreItems, section, isOpen) {
    return renderAccordion(isOpen, (
      <div className="ml-4 mt-1 pl-3 border-l border-surface-100 flex flex-col gap-0.5">
        {genreItems.map((genre) => {
          const genreActive = active.section === section && active.categoryId === genre.id
          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => select(section, genre.id)}
              aria-current={genreActive ? "page" : undefined}
              className={`
                text-left text-sm h-10 md:h-7 px-2 rounded-md whitespace-nowrap
                transition-colors duration-200 ease-out
                ${genreActive
                  ? "bg-primary/15 text-primary-light font-medium"
                  : "text-text-muted hover:bg-surface-300/60 hover:text-text"}
              `}
            >
              {genre.label}
            </button>
          )
        })}
      </div>
    ))
  }

  function renderInspire(section) {
    const isVisible = inspireOpen && onInspirePage && active.section === section
    return (
      <>
        {renderItem({
          ...INSPIRE_ITEM, section,
          hasChevron: true, isOpen: isVisible, onToggle: () => toggleInspire(section),
        })}
        {renderAccordion(isVisible, (
          <InspireSearch type={SECTION_TO_TYPE[section]} isOpen={isVisible} onSelect={pickSeed} />
        ))}
      </>
    )
  }

  function renderSection(sectionKey, categories, genreItems, sectionLabel, SectionIcon, genresOpen, setGenresOpen) {
    return (
      <div className="flex flex-col w-full">
        <div className="mx-2 my-2 h-px bg-surface-100 shrink-0" />
        <div
          className={`flex items-center h-6 px-2 text-[0.65rem] uppercase tracking-widest text-text-muted/70 whitespace-nowrap overflow-hidden transition-opacity duration-300 ease-out-quint motion-reduce:transition-none ${showLabels ? "opacity-100" : "opacity-0"}`}
        >
          {sectionLabel}
        </div>
        {categories.map((cat) => renderItem({ ...cat, section: sectionKey }))}
        {renderInspire(sectionKey)}
        {renderItem({
          id: "genres", label: "Genres", icon: HiOutlineTag,
          section: sectionKey, hasChevron: true,
          isOpen: genresOpen, onToggle: () => setGenresOpen((v) => !v),
        })}
        {renderGenreList(genreItems, sectionKey, genresOpen)}
      </div>
    )
  }

  function renderItems() {
    return (
      <>
        {renderItem({ ...HOME_ITEM, section: "home" })}
        {renderSection("movies", MOVIE_CATEGORIES, MOVIE_GENRE_ITEMS, "Movies", HiOutlineFilm, movieGenresOpen, setMovieGenresOpen)}
        {renderSection("series", SERIES_CATEGORIES, TV_GENRE_ITEMS, "Series", HiOutlineTv, seriesGenresOpen, setSeriesGenresOpen)}
      </>
    )
  }

  return (
    <>
      {/* Mobile trigger: icon + current category, in flow (scrolls away with the page) */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={mobileOpen}
        className="md:hidden self-start max-w-full glass-panel flex items-center gap-2 h-11 px-3 text-sm text-text cursor-pointer"
      >
        <ActiveIcon size={18} className="shrink-0 text-primary-light" />
        <span className="truncate">{activeLabel}</span>
        <HiChevronDown size={16} className="shrink-0 text-text-muted" />
      </button>

      {/* Desktop rail — hidden below md */}
      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={handleRailLeave}
        onFocus={() => setExpanded(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false) }}
        className={`
          glass-panel shadow-xl
          hidden md:flex
          fixed left-5 top-1/2 -translate-y-1/2 z-50
          flex-col gap-1 py-4 px-2 *:shrink-0
          overflow-x-hidden overflow-y-auto scrollbar-hide
          transition-[width] duration-300 ease-out-quint motion-reduce:transition-none
          ${expanded ? "w-56" : "w-12"}
        `}
        style={{ maxHeight: "calc(100dvh - 4rem)" }}
      >
        {renderItems()}
      </div>

      {/* Mobile overlay: the same rail, expanded, floating over a dimmed page. Portalled
          to body so it also dims the navbar. The page itself is scroll-locked while open (see
          useScrollLock above); touch-none on the backdrop and overscroll-contain on the panel
          keep gestures from leaking through. */}
      {mobileOpen && createPortal(
        <>
          <div
            onClick={closeMobile}
            className="md:hidden fixed inset-0 z-50 bg-black/60 touch-none animate-[overlay-fade_200ms_ease-out_both] motion-reduce:animate-none"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Browse categories"
            tabIndex={-1}
            className="
              md:hidden glass-panel backdrop-blur-none! bg-surface-900/95! shadow-xl outline-none
              fixed left-3 top-1/2 -translate-y-1/2 z-50 w-56
              max-h-[calc(100dvh-2rem)]
              flex flex-col gap-1 py-4 px-2 *:shrink-0
              overflow-x-hidden overflow-y-auto overscroll-contain touch-pan-y scrollbar-hide
              animate-[overlay-in_250ms_var(--ease-out-quint)_both] motion-reduce:animate-none
            "
          >
            {renderItems()}
          </div>
        </>,
        document.body
      )}
    </>
  )
})

export default CategoryRail
