import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiSearch, FiLoader } from 'react-icons/fi'
import useSearch from '@/features/search/hooks/useSearch'
import Chip from '@/components/ui/Chip'

const MAX_RESULTS = 6
const PLACEHOLDERS = { movie: 'Movie you like', tv: 'Series you like' }

// The rail is only ~200px wide, so a suggestion is just what identifies a title: name and year.
// Which type it is doesn't need saying, the search is scoped to the section it was opened from.
function toSeed(item, type) {
  return {
    tmdb_id: item.id,
    type,
    title: item.title || item.name,
    year: (item.release_date || item.first_air_date)?.slice(0, 4),
  }
}

// The button's ::after stretches over the whole row, so the row is one click target while the
// year Chip stays outside the button (a Chip is a <button> itself). The Chip is decoration for
// sighted users; the year is repeated for screen readers inside the button.
const Suggestion = memo(function Suggestion({ seed, onSelect }) {
  return (
    <li className="relative flex items-center gap-2 min-h-11 md:min-h-8 px-2 py-1 rounded-md text-text-muted hover:bg-surface-300/60 hover:text-text has-focus-visible:bg-surface-300/60 transition-colors duration-200">
      <button
        type="button"
        onClick={() => onSelect(seed)}
        title={seed.title}
        className="flex-1 min-w-0 text-left text-sm leading-tight line-clamp-2 outline-none cursor-pointer after:absolute after:inset-0 after:rounded-md"
      >
        {seed.title}
        {seed.year && <span className="sr-only">, {seed.year}</span>}
      </button>
      {seed.year && (
        <span aria-hidden="true" className="shrink-0 pointer-events-none">
          <Chip variant="ghost" size="xs" className="tabular-nums backdrop-blur-none!">{seed.year}</Chip>
        </span>
      )}
    </li>
  )
})

// Keeps the input focused while a suggestion is pressed (Safari doesn't focus buttons on click), so
// the rail doesn't see a blur and fold before the click lands.
const keepInputFocus = (e) => e.preventDefault()

// One-shot search inside a category rail section ("movie" | "tv"). The rail folds it away (isOpen
// false) after a pick or when the rail closes, and that also clears the query, so the next use starts
// clean. Query state is local so typing re-renders this component, not the whole rail.
const InspireSearch = memo(function InspireSearch({ type, isOpen, onSelect }) {
  const [query, setQuery] = useState('')
  const [prevOpen, setPrevOpen] = useState(isOpen)
  const inputRef = useRef(null)
  const trimmed = query.trim()

  // Reset while folded instead of in an effect, so there is no extra render with stale text
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen)
    if (!isOpen) setQuery('')
  }

  const { data, isFetching } = useSearch(trimmed, type)

  // A hidden instance (display: none) can't take focus, so only the visible one reacts
  useEffect(() => {
    if (isOpen) inputRef.current?.focus({ preventScroll: true })
  }, [isOpen])

  const suggestions = useMemo(
    () => data?.results?.slice(0, MAX_RESULTS).map((item) => toSeed(item, type)),
    [data, type]
  )

  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Enter' || !suggestions?.length) return
    onSelect(suggestions[0])
    inputRef.current?.blur()
  }, [suggestions, onSelect])

  return (
    <div className="flex flex-col gap-1 px-1 pt-1 pb-2">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-text-muted">
          {isFetching && trimmed ? (
            <FiLoader size={14} className="animate-spin text-primary-light" />
          ) : (
            <FiSearch size={14} />
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDERS[type]}
          aria-label={`Find recommendations similar to a ${type === 'tv' ? 'series' : 'movie'}`}
          // text-base below md: iOS zooms the page when a focused input is under 16px
          className="w-full h-11 md:h-8 pl-8 pr-2 rounded-md bg-surface-900/60 border border-white/5 text-base md:text-sm text-text placeholder:text-text-muted/70 outline-none focus:border-primary-light/50 transition-colors"
        />
      </div>

      {trimmed && (
        <ul onMouseDown={keepInputFocus} className="flex flex-col gap-0.5">
          {!isFetching && suggestions?.length === 0 && (
            <li className="px-2 py-2 text-xs text-text-muted">No titles found</li>
          )}
          {suggestions?.map((seed) => (
            <Suggestion key={seed.tmdb_id} seed={seed} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </div>
  )
})

export default InspireSearch
