import { useEffect, useState } from 'react'
import useSearch from '@/features/search/hooks/useSearch'
import SearchOverlay from '@/features/search/components/SearchOverlay'
import SearchInput from '@/features/search/components/SearchInput'
import SearchResults from '@/features/search/components/SearchResults'


function ActiveSearchModal({ onClose }) {
  const [filter, setFilter] = useState('movie')
  const [query, setQuery] = useState('')
  const [year, setYear] = useState()
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

  const { data: searchResults, isLoading: isSearching } = useSearch(query, filter, year)

  return (
    <SearchOverlay onClose={onClose}>
      <SearchInput
        value={query}
        onChange={e => setQuery(e.target.value)}
        filter={filter}
        onFilterChange={setFilter}
        isLoading={isSearching && query.length > 0}
      />
      {query.length > 0 && (
        <>
          {SearchFilters && <SearchFilters year={year} onChange={setYear} />}
          <SearchResults
            media_type={filter}
            results={searchResults?.results}
            onClose={onClose}
          />
        </>
      )}
    </SearchOverlay>
  )
}

export default ActiveSearchModal
