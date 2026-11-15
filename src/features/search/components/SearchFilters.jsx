import { memo } from 'react'
import FilterBar from '@/components/filters/FilterBar'
import { LANGUAGE, YEAR } from '@/features/browse/constants/filters'

// /search/* takes a year only; the language pill narrows the returned page by original language
// (genre and country need /discover, which takes no text). State is owned by the modal, not the URL,
// so it can't collide with Browse's params.
const SEARCH_FILTERS = [YEAR, LANGUAGE]

// Loaded on its own (ActiveSearchModal) so FilterBar, FilterPill and the filter option lists stay out
// of the main bundle, which the navbar's search button would otherwise pull in on every page.
function SearchFilters({ filters, onChange }) {
  // Each chip's own ✕ resets it, so no "Clear all"
  return (
    <FilterBar
      defs={SEARCH_FILTERS}
      filters={filters}
      onChange={onChange}
      inline
      className="px-4 py-2 border-b border-surface-100"
    />
  )
}

export default memo(SearchFilters)
