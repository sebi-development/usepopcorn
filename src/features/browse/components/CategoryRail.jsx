import { memo, useState } from "react"
import {
  HiOutlineHome,
  HiOutlineArrowTrendingUp,
  HiOutlineFire,
  HiOutlineCalendarDays,
  HiOutlineStar,
  HiOutlineFilm,
  HiOutlineTag,
  HiChevronRight
} from "react-icons/hi2"

export const RAIL_CATEGORIES = [
  { id: "home", label: "Home", icon: HiOutlineHome },
  { id: "trending", label: "Trending", icon: HiOutlineArrowTrendingUp },
  { id: "popular", label: "Popular", icon: HiOutlineFire },
  { id: "upcoming", label: "Upcoming", icon: HiOutlineCalendarDays },
  { id: "top_rated", label: "Best Rated", icon: HiOutlineStar },
  { id: "now_playing", label: "In Theatres", icon: HiOutlineFilm },
  { id: "genres", label: "Genres", icon: HiOutlineTag, hasChevron: true },
]

// Floating icon rail — collapsed by default, expands on hover/focus to
// reveal labels. Outer capsule mirrors Navbar's glass-pill treatment;
// individual item states use rounded rectangles (rounded-card), not pills.
//
// `onExpandChange` is optional — lets a parent page render a scrim or
// other reaction to the expand/collapse state without this component
// needing to know about page layout.
const CategoryRail = memo(function CategoryRail({ active, onSelect, onExpandChange }) {
  const [expanded, setExpandedState] = useState(false)

  function setExpanded(value) {
    setExpandedState(value)
    onExpandChange?.(value)
  }

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false)
      }}
      className={`
        glass-panel shadow-xl
        fixed left-5 top-1/2 -translate-y-1/2 z-50
        flex flex-col gap-1 py-4 px-2
        transition-[width] duration-300 ease-out overflow-hidden
        ${expanded ? "w-56" : "w-12"}
      `}
    >
      {RAIL_CATEGORIES.map(({ id, label, icon: Icon, hasChevron }) => {
        const isActive = active === id

        const item = (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-current={isActive ? "page" : undefined}
            className={`
              flex items-center justify-between w-full h-8 rounded-md
              transition-colors duration-200 ease-out
              ${isActive
                ? "bg-primary/15 text-primary-light font-medium"
                : "text-text-muted hover:bg-surface-300/60 hover:text-text"}
            `}
          >
            <div className="flex items-center h-full">
              <span className="flex items-center justify-center w-8 h-full shrink-0">
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              </span>
              <span
                className="text-sm whitespace-nowrap overflow-hidden text-left"
                style={{
                  maxWidth: expanded ? "6rem" : "0px",
                  opacity: expanded ? 1 : 0,
                  transition: "max-width 300ms ease, opacity 200ms ease",
                  paddingLeft: expanded ? "0.25rem" : "0px",
                }}
              >
                {label}
              </span>
            </div>
            {hasChevron && (
              <span 
                className="flex items-center justify-center shrink-0"
                style={{
                  width: expanded ? "1.5rem" : "0px",
                  opacity: expanded ? 1 : 0,
                  transition: "width 300ms ease, opacity 200ms ease",
                  marginRight: expanded ? "0.25rem" : "0px",
                }}
              >
                <HiChevronRight size={16} />
              </span>
            )}
          </button>
        )

        if (id === "home") {
          return (
            <div key="home-group" className="flex flex-col w-full">
              {item}
              <div className="mx-2 my-2 h-px bg-surface-100 shrink-0" />
            </div>
          )
        }

        return item
      })}
    </div>
  )
})

export default CategoryRail