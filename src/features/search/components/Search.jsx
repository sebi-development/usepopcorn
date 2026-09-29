import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import ActiveSearchModal from '@/features/search/components/ActiveSearchModal'


function Search() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsSearchOpen(true)}
        aria-label="Search"
        className="flex justify-center items-center w-11 h-11 sm:w-3xs sm:h-auto gap-2 sm:px-7 sm:py-2 rounded-lg text-sm text-text-muted bg-surface-100 hover:text-text transition-colors cursor-pointer"
      >
        <FiSearch size={15} />
        <span className="hidden sm:inline">Search...</span>
      </button>

      {isSearchOpen && (
        <ActiveSearchModal onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  )
}

export default Search