import { memo, useCallback, useMemo } from 'react'
import FilterBar from '@/components/filters/FilterBar'
import { YEAR } from '@/features/browse/constants/filters'

// /search/* filters by year only (genre, country and language need /discover, which takes no text).
// State is owned by the modal, not the URL, so it can't collide with Browse's `year` param.
const SEARCH_FILTERS = [YEAR]
const NO_FILTERS = {}

// Loaded on its own (ActiveSearchModal) so FilterBar, FilterPill and the filter option lists stay out
// of the main bundle, which the navbar's search button would otherwise pull in on every page.
function SearchFilters({ year, onChange }) {
  const filters = useMemo(() => (year ? { year } : NO_FILTERS), [year])
  const handleChange = useCallback((_key, value) => onChange(value), [onChange])

  // One filter: the chip's own ✕ is the only reset needed, so no "Clear all"
  return (
    <FilterBar
      defs={SEARCH_FILTERS}
      filters={filters}
      onChange={handleChange}
      inline
      className="px-4 py-2 border-b border-surface-100"
    />
  )
}

export default memo(SearchFilters)
