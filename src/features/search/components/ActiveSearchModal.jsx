import { useCallback, useEffect, useMemo, useState } from 'react'
import useSearch from '@/features/search/hooks/useSearch'
import SearchOverlay from '@/features/search/components/SearchOverlay'
import SearchInput from '@/features/search/components/SearchInput'
import SearchResults from '@/features/search/components/SearchResults'
import SlidingTabs from '@/components/ui/SlidingTabs'

// Static — kept at module scope so SlidingTabs never sees a new reference on re-renders.
const SEARCH_TABS = [
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'Series' },
  { id: 'person', label: 'People' },
]
const NO_FILTERS = {}

// State below SearchOverlay, so the overlay never re-renders; `query` is the debounced term
function SearchPanel({ onClose }) {
  const [filter, setFilter] = useState('movie')
  const [query, setQuery] = useState('')
  const [filterValues, setFilterValues] = useState(NO_FILTERS)
  // The filter row is a separate chunk, fetched as the modal opens (well before a first keystroke).
  // A plain dynamic import, not React.lazy: no Suspense reveal delay, and the row simply appears.
  const [SearchFilters, setSearchFilters] = useState(null)

  useEffect(() => {
    let active = true
    import('@/features/search/components/SearchFilters').then((m) => {
      if (active) setSearchFilters(() => m.default)
    })
    return () => { active = false }
  }, [])

  // A pill sends undefined or an empty list when cleared: the key goes, so the filters stay minimal
  const handleFilterChange = useCallback((key, value) => setFilterValues((prev) => {
    const next = { ...prev }
    if (value == null || value.length === 0) delete next[key]
    else next[key] = value
    return next
  }), [])

  const { data: searchResults, isLoading: isSearching } = useSearch(query, filter, filterValues.year)

  // /search can't filter by language, so the pill narrows the page TMDB returned (no extra request)
  const languages = filterValues.language
  const results = useMemo(() => {
    const all = searchResults?.results
    if (!all || !languages?.length || filter === 'person') return all
    return all.filter((item) => languages.includes(item.original_language))
  }, [searchResults, languages, filter])

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 border-b border-surface-100">
        <SearchInput
          onQueryChange={setQuery}
          isLoading={isSearching && query.length > 0}
        />
        <SlidingTabs
          tabs={SEARCH_TABS}
          activeTab={filter}
          onChange={setFilter}
          containerPadding="p-0.5"
          containerGap="gap-0"
          containerRadius="rounded-lg"
          pillRadius="rounded-md"
          tabRadius="rounded-md"
          className="bg-surface-100 backdrop-blur-none border-none"
          pillClassName="bg-surface-500 backdrop-blur-none border-none"
          tabClassName="px-3 py-0.5 text-xs"
        />
      </div>
      {query.length > 0 && (
        <>
          {/* Hidden, not unmounted, for People: a tab switch doesn't remount it */}
          {SearchFilters && (
            <div hidden={filter === 'person'}>
              <SearchFilters filters={filterValues} onChange={handleFilterChange} />
            </div>
          )}
          <SearchResults
            media_type={filter}
            results={results}
            emptyMessage={languages?.length && filter !== 'person' ? 'None of the top matches is in that language' : undefined}
            onClose={onClose}
          />
        </>
      )}
    </>
  )
}

function ActiveSearchModal({ onClose }) {
  return (
    <SearchOverlay onClose={onClose}>
      <SearchPanel onClose={onClose} />
    </SearchOverlay>
  )
}

export default ActiveSearchModal
