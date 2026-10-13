import { memo, useMemo } from "react"
import { HiXMark } from "react-icons/hi2"
import Chip from "@/components/ui/Chip"
import FilterPill from "@/components/filters/FilterPill"
import { getActiveChips } from "@/utils/filters"

const VALUE_CHIP_CLASS = "backdrop-blur-none! before:absolute before:-inset-y-2.5 before:inset-x-0 before:content-[''] md:before:content-none"

function FilterBar({ defs, filters, onChange, onClear, onOpen, className = "" }) {
  const chips = useMemo(() => getActiveChips(defs, filters), [defs, filters])

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {defs.map((def) => (
          <FilterPill key={def.key} def={def} value={filters[def.key]} onChange={onChange} onOpen={onOpen} />
        ))}
        {chips.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 md:min-h-0 px-2 text-xs font-medium text-primary-light hover:text-text cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
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
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(FilterBar)
