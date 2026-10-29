import { memo } from 'react'
import { FiSearch } from 'react-icons/fi'
import { LuLoaderCircle } from 'react-icons/lu'

// The icon and the text field of the search row; the type tabs are a sibling (ActiveSearchModal), so a
// tab switch doesn't re-render this and a keystroke doesn't re-render them.
function SearchInput({ value, onChange, isLoading }) {
  return (
    <>
      {isLoading
        ? <LuLoaderCircle className="text-text-muted shrink-0 animate-spin" size={20} />
        : <FiSearch className="text-text-muted shrink-0" size={20} />
      }
      <input
        type="text"
        value={value}
        onChange={onChange}
        autoFocus
        placeholder="Search movies, series & people..."
        className="w-full h-11 bg-transparent text-text text-lg placeholder:text-text-muted outline-none"
      />
    </>
  )
}

export default memo(SearchInput)
