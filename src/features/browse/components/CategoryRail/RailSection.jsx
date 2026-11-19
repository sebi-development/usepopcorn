import { HiOutlineTag } from "react-icons/hi2"
import { INSPIRE_ITEM } from "@/features/browse/constants/categories"
import { SECTION_TO_TYPE } from "@/features/browse/hooks/useCategoryMedia"
import InspireSearch from "@/features/browse/components/CategoryRail/InspireSearch"
import RailItem from "@/features/browse/components/CategoryRail/RailItem"
import { rowClass } from "@/features/browse/components/CategoryRail/rail"

// Height fold for the Inspire search and the genre list. `inert` keeps folded-away controls out of the tab order.
function Fold({ isVisible, children }) {
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

// One section of the rail (Movies or Series): its categories, the Inspire search and the genres
export default function RailSection({ section, active, showLabels, genresOpen, inspireOpen, onSelect, onToggleGenres, onToggleInspire, onPickSeed }) {
  const { key, label, categories, genres } = section
  const isActive = (id) => active.section === key && active.categoryId === id

  return (
    <div className="flex flex-col w-full">
      <div className="mx-2 my-2 h-px bg-surface-100 shrink-0" />
      <div
        className={`flex items-center h-6 px-2 text-[0.65rem] uppercase tracking-widest text-text-muted/70 whitespace-nowrap overflow-hidden transition-opacity duration-300 ease-out-quint motion-reduce:transition-none ${showLabels ? "opacity-100" : "opacity-0"}`}
      >
        {label}
      </div>

      {categories.map((category) => (
        <RailItem
          key={category.id}
          icon={category.icon}
          label={category.label}
          isActive={isActive(category.id)}
          onClick={() => onSelect(key, category.id)}
        />
      ))}

      <RailItem
        icon={INSPIRE_ITEM.icon}
        label={INSPIRE_ITEM.label}
        isActive={isActive(INSPIRE_ITEM.id)}
        isOpen={inspireOpen}
        onClick={() => onToggleInspire(key)}
      />
      <Fold isVisible={showLabels && inspireOpen}>
        <InspireSearch type={SECTION_TO_TYPE[key]} isOpen={inspireOpen} onSelect={onPickSeed} />
      </Fold>

      <RailItem icon={HiOutlineTag} label="Genres" isOpen={genresOpen} onClick={() => onToggleGenres(key)} />
      <Fold isVisible={showLabels && genresOpen}>
        <div className="ml-4 mt-1 pl-3 border-l border-surface-100 flex flex-col gap-0.5">
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => onSelect(key, genre.id)}
              aria-current={isActive(genre.id) ? "page" : undefined}
              className={`text-left text-sm h-10 md:h-7 px-2 whitespace-nowrap ${rowClass(isActive(genre.id))}`}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </Fold>
    </div>
  )
}
