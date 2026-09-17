import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import ActiveSearchModal from '@/features/search/components/ActiveSearchModal'


function Search() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

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
        <ActiveSearchModal onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  )
}

export default Search