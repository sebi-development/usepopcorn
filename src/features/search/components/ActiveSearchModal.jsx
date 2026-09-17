import { useState } from 'react'
import useSearch from '@/features/search/hooks/useSearch'
import SearchOverlay from '@/features/search/components/SearchOverlay'
import SearchInput from '@/features/search/components/SearchInput'
import SearchResults from '@/features/search/components/SearchResults'


function ActiveSearchModal({ onClose }) {
  const [filter, setFilter] = useState('movie')
  const [query, setQuery] = useState('')

  const { data: searchResults, isLoading: isSearching } = useSearch(query, filter)

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
        <SearchResults
          media_type={filter}
          results={searchResults?.results}
          onClose={onClose}
        />
      )}
    </SearchOverlay>
  )
}

export default ActiveSearchModal
