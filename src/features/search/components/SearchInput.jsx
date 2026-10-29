import { memo, useEffect, useRef } from 'react'
import { FiSearch } from 'react-icons/fi'
import { LuLoaderCircle } from 'react-icons/lu'

const DEBOUNCE_MS = 200

// Uncontrolled: typing renders nothing; the panel gets the text after a pause (at once when cleared)
function SearchInput({ onQueryChange, isLoading }) {
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])

  function handleChange(e) {
    const { value } = e.target
    clearTimeout(timer.current)
    if (!value) return onQueryChange('')
    timer.current = setTimeout(() => onQueryChange(value), DEBOUNCE_MS)
  }

  return (
    <>
      {isLoading
        ? <LuLoaderCircle className="text-text-muted shrink-0 animate-spin" size={20} />
        : <FiSearch className="text-text-muted shrink-0" size={20} />
      }
      <input
        type="text"
        onChange={handleChange}
        autoFocus
        placeholder="Search movies, series & people..."
        className="w-full h-11 bg-transparent text-text text-lg placeholder:text-text-muted outline-none"
      />
    </>
  )
}

export default memo(SearchInput)
