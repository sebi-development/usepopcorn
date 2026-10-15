import { memo, useMemo } from "react"
import { HiXMark } from "react-icons/hi2"
import Chip from "@/components/ui/Chip"
import FilterPill from "@/components/filters/FilterPill"
import { getActiveChips } from "@/utils/filters"

const VALUE_CHIP_CLASS = "backdrop-blur-none! before:absolute before:-inset-y-2.5 before:inset-x-0 before:content-[''] md:before:content-none"

// `inline` puts the value chips on the pills' own row (a surface with few filters and room to spare,
// like search) instead of under them
function FilterBar({ defs, filters, onChange, onClear, onOpen, inline = false, className = "" }) {
  const chips = useMemo(() => getActiveChips(defs, filters), [defs, filters])

  const chipElements = chips.map((chip) => (
    <Chip
      key={chip.id}
      variant="ghost"
      size="sm"
      onClick={() => onChange(chip.key, chip.remove)}
      aria-label={`Remove ${chip.label}`}
      className={VALUE_CHIP_CLASS}
    >
      <span>{chip.label}</span>
      <HiXMark className="w-3 h-3" />
    </Chip>
  ))

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {defs.map((def) => (
          <FilterPill key={def.key} def={def} value={filters[def.key]} onChange={onChange} onOpen={onOpen} />
        ))}
        {inline && chipElements}
        {onClear && chips.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 md:min-h-0 px-2 text-xs font-medium text-primary-light hover:text-text cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {!inline && chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">{chipElements}</div>
      )}
    </div>
  )
}

export default memo(FilterBar)
