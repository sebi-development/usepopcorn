import { memo, useState } from "react"
import { HiOutlineFilm, HiOutlineTv, HiOutlineTag, HiChevronRight, HiChevronDown } from "react-icons/hi2"

import { HOME_ITEM, MOVIE_CATEGORIES, SERIES_CATEGORIES } from "@/features/browse/constants/categories"
import { MOVIE_GENRES, TV_GENRES } from "@/utils/genres"

const MOVIE_GENRE_ITEMS = Object.entries(MOVIE_GENRES)
  .map(([tmdbId, label]) => ({ id: `genre-${tmdbId}`, tmdbId: Number(tmdbId), label }))
  .sort((a, b) => a.label.localeCompare(b.label))

const TV_GENRE_ITEMS = Object.entries(TV_GENRES)
  .map(([tmdbId, label]) => ({ id: `genre-${tmdbId}`, tmdbId: Number(tmdbId), label }))
  .sort((a, b) => a.label.localeCompare(b.label))

// `active` is now { section: 'movies' | 'series', categoryId: string } —
// bare category ids collide across sections (both have 'trending'), so the
// active state has to carry which section it belongs to.
//
// Below md the rail is an in-flow dropdown opened by a pill (touch has no hover);
// from md up it is the fixed, hover-expanding rail.
const CategoryRail = memo(function CategoryRail({ active, activeLabel, onSelect, onExpandChange }) {
  const [expanded, setExpandedState] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [movieGenresOpen, setMovieGenresOpen] = useState(false)
  const [seriesGenresOpen, setSeriesGenresOpen] = useState(false)

  const showLabels = expanded || mobileOpen

  function setExpanded(value) {
    setExpandedState(value)
    onExpandChange?.(value)
  }

  function select(section, categoryId) {
    onSelect(section, categoryId)
    setMobileOpen(false)
  }

  function renderItem({ id, label, icon: Icon, section, hasChevron, isOpen, onToggle }) {
    const isActive = !hasChevron && active.section === section && active.categoryId === id

    return (
      <button
        key={`${section}-${id}`}
        type="button"
        onClick={() => (hasChevron ? onToggle() : select(section, id))}
        aria-current={isActive ? "page" : undefined}
        aria-expanded={hasChevron ? isOpen : undefined}
        className={`
          flex items-center justify-between w-full h-11 md:h-8 rounded-md
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
              maxWidth: showLabels ? "6rem" : "0px",
              opacity: showLabels ? 1 : 0,
              transition: "max-width 300ms ease, opacity 200ms ease",
              paddingLeft: showLabels ? "0.25rem" : "0px",
            }}
          >
            {label}
          </span>
        </div>
        {hasChevron && (
          <span
            className="flex items-center justify-center shrink-0"
            style={{
              width: showLabels ? "1.5rem" : "0px",
              opacity: showLabels ? 1 : 0,
              marginRight: showLabels ? "0.25rem" : "0px",
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              transition: "width 300ms ease, opacity 200ms ease, transform 300ms ease",
            }}
          >
            <HiChevronRight size={16} />
          </span>
        )}
      </button>
    )
  }

  function renderGenreList(genreItems, section, isOpen) {
    return (
      <div style={{ display: "grid", gridTemplateRows: showLabels && isOpen ? "1fr" : "0fr", transition: "grid-template-rows 300ms ease" }}>
        <div className="overflow-hidden">
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
        </div>
      </div>
    )
  }

  function renderSection(sectionKey, categories, genreItems, sectionLabel, SectionIcon, genresOpen, setGenresOpen) {
    return (
      <div className="flex flex-col w-full">
        <div className="mx-2 my-2 h-px bg-surface-100 shrink-0" />
        <div
          className="flex items-center h-6 px-2 text-[0.65rem] uppercase tracking-widest text-text-muted/70 whitespace-nowrap overflow-hidden"
          style={{ opacity: showLabels ? 1 : 0, transition: "opacity 200ms ease" }}
        >
          {sectionLabel}
        </div>
        {categories.map((cat) => renderItem({ ...cat, section: sectionKey }))}
        {renderItem({
          id: "genres", label: "Genres", icon: HiOutlineTag,
          section: sectionKey, hasChevron: true,
          isOpen: genresOpen, onToggle: () => setGenresOpen((v) => !v),
        })}
        {renderGenreList(genreItems, sectionKey, genresOpen)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 md:contents">
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        className="md:hidden glass-panel flex items-center justify-between w-full h-12 px-4 text-sm text-text cursor-pointer"
      >
        <span className="truncate">{activeLabel}</span>
        <HiChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false) }}
        className={`
          glass-panel shadow-xl
          ${mobileOpen ? "flex" : "hidden"} md:flex flex-col gap-1 py-4 px-2
          w-full max-h-[60dvh]
          md:fixed md:left-5 md:top-1/2 md:-translate-y-1/2 md:z-50 md:max-h-[calc(100dvh-4rem)]
          overflow-x-hidden overflow-y-auto scrollbar-hide
          md:transition-[width] md:duration-300 ease-out
          ${expanded ? "md:w-56" : "md:w-12"}
        `}
      >
        {renderItem({ ...HOME_ITEM, section: "home" })}
        {renderSection("movies", MOVIE_CATEGORIES, MOVIE_GENRE_ITEMS, "Movies", HiOutlineFilm, movieGenresOpen, setMovieGenresOpen)}
        {renderSection("series", SERIES_CATEGORIES, TV_GENRE_ITEMS, "Series", HiOutlineTv, seriesGenresOpen, setSeriesGenresOpen)}
      </div>
    </div>
  )
})

export default CategoryRail