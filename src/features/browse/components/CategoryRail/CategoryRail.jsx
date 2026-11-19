import { memo, useCallback, useState } from "react"
import { HiChevronDown } from "react-icons/hi2"
import { HOME_ITEM, INSPIRE_ITEM } from "@/features/browse/constants/categories"
import MobileRailPanel from "@/features/browse/components/CategoryRail/MobileRailPanel"
import RailItem from "@/features/browse/components/CategoryRail/RailItem"
import RailSection from "@/features/browse/components/CategoryRail/RailSection"
import { getActiveIcon, SECTIONS } from "@/features/browse/components/CategoryRail/rail"

const NO_GENRES_OPEN = { movies: false, series: false }

// `active` is { section, categoryId }: bare ids collide across sections (both have 'trending').
// md+: a fixed rail that expands on hover. Below md there is no hover, so a compact trigger opens the
// same rows in MobileRailPanel.
// Each section's Inspire fold holds a title search (`onInspireSelect(seed)` gets the pick). It is a
// one-shot tool: it folds, and its search clears, after a pick and whenever the rail closes.
// Motion follows SlidingTabs: one property per change (the rail's width, a fold's height) on the
// `ease-out-quint` curve, and reduced motion snaps.
const CategoryRail = memo(function CategoryRail({ active, activeLabel, onSelect, onInspireSelect }) {
  const [expanded, setExpandedState] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [genresOpen, setGenresOpen] = useState(NO_GENRES_OPEN)
  const [inspireOpen, setInspireOpen] = useState(false)

  const showLabels = expanded || mobileOpen
  const ActiveIcon = getActiveIcon(active)
  // Also follows the URL: leaving an Inspire page (e.g. browser back) folds its search away
  const onInspirePage = active.categoryId === INSPIRE_ITEM.id

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
    setInspireOpen(false)
  }, [])

  function setExpanded(value) {
    setExpandedState(value)
    if (!value) setInspireOpen(false)
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

  // Inspire opens its search instead of closing the mobile panel, so the user can type right away
  function toggleInspire(section) {
    if (onInspirePage && active.section === section) {
      setInspireOpen((v) => !v)
      return
    }
    onSelect(section, INSPIRE_ITEM.id)
    setInspireOpen(true)
  }

  const toggleGenres = (section) => setGenresOpen((open) => ({ ...open, [section]: !open[section] }))

  const pickSeed = useCallback((seed) => {
    onInspireSelect(seed)
    closeMobile()
  }, [onInspireSelect, closeMobile])

  // One set of rows, placed in both the desktop rail and the mobile panel
  const rows = (
    <>
      <RailItem
        icon={HOME_ITEM.icon}
        label={HOME_ITEM.label}
        // A bare /browse URL defaults the section to movies, so Home goes by its category alone
        isActive={active.categoryId === HOME_ITEM.id}
        onClick={() => select("home", HOME_ITEM.id)}
      />
      {SECTIONS.map((section) => (
        <RailSection
          key={section.key}
          section={section}
          active={active}
          showLabels={showLabels}
          genresOpen={genresOpen[section.key]}
          inspireOpen={inspireOpen && onInspirePage && active.section === section.key}
          onSelect={select}
          onToggleGenres={toggleGenres}
          onToggleInspire={toggleInspire}
          onPickSeed={pickSeed}
        />
      ))}
    </>
  )

  return (
    <>
      {/* Mobile trigger: in flow, so it scrolls away with the page */}
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
        {rows}
      </div>

      {mobileOpen && <MobileRailPanel onClose={closeMobile}>{rows}</MobileRailPanel>}
    </>
  )
})

export default CategoryRail
