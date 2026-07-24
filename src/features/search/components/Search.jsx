import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import useSearch from '../hooks/useSearch'
import SearchOverlay from './SearchOverlay'
import SearchInput from './SearchInput'
import SearchResults from './SearchResults'


function Search() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [filter, setFilter] = useState('movie')
  const [query, setQuery] = useState('')

  const { data: searchResults, isLoading: isSearching } = useSearch(query, filter)

  function handleClose() {
    setIsSearchOpen(false)
    setQuery('')
  }

  return (
    <>
      <button
        onClick={() => setIsSearchOpen(true)}
        className="flex justify-center items-center w-3xs gap-2 px-7 py-2 rounded-lg text-sm text-text-muted bg-surface-100 hover:text-text transition-colors cursor-pointer"
      >
        <FiSearch size={15} />
        <span>Search...</span>
      </button>

      {isSearchOpen && (
        <SearchOverlay onClose={handleClose}>
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
              onClose={handleClose}
            />
          )}
        </SearchOverlay>
      )}
    </>
  )
}

export default Search