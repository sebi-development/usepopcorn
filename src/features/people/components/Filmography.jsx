import { memo, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import MediaRow from "@/components/media/MediaRow"
import FilterBar from "@/components/filters/FilterBar"
import Chip from "@/components/ui/Chip"
import useUrlFilters from "@/hooks/useUrlFilters"
import useMediaState from "@/features/interactions/hooks/useMediaState"
import { PAGE_SIZE } from "@/utils/pagination"
import { parseFilters } from "@/utils/filters"
import { MOVIE_GENRES, TV_GENRES } from "@/utils/genres"
import { isReleased } from "@/utils/tmdbItem"
import { defaultRole, isMajorRole } from "@/features/people/hooks/usePerson"

const KNOWN_FOR_LIMIT = 10
const MAX_PER_CHARACTER = 2
// "Natasha Romanoff / Black Widow" -> "natasha romanoff", "Woody (voice)" -> "woody"
const characterOf = (c) => c.character?.split('/')[0].replace(/\(.*?\)/g, '').trim().toLowerCase()
// Below this many votes an average says little, so Top rated puts the title last
const MIN_VOTES = 50

const SORTS = {
  popular: (a, b) => b.vote_count - a.vote_count,
  newest: (a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''),
  rated: (a, b) => (b.vote_count >= MIN_VOTES) - (a.vote_count >= MIN_VOTES) || b.vote_average - a.vote_average,
}

const ROLE = { key: 'role', label: 'Role', kind: 'select', options: [{ value: 'acting', label: 'Actor' }, { value: 'directing', label: 'Director' }] }
const TYPE = { key: 'type', label: 'Type', kind: 'select', options: [{ value: 'movie', label: 'Movies' }, { value: 'tv', label: 'Series' }] }
const SORT = { key: 'sort', label: 'Sort', kind: 'select', options: [{ value: 'popular', label: 'Popular' }, { value: 'rated', label: 'Top rated' }] }
// For completionists: what's left to watch. Not rated lists released titles only, as an unreleased one can't be rated.
const RATED = { key: 'rated', label: 'Your rating', kind: 'select', options: [{ value: 'no', label: 'Not rated' }, { value: 'yes', label: 'Rated' }] }

const hasBothRoles = (person) => person.acting.length > 0 && person.directing.length > 0

// Filter defs offering only what the credits in view (`role`) have. Years are the ones with a title
// out: no empty year, and no placeholder (TMDB dates some unscheduled projects 2099).
function getDefs(person, role) {
  const credits = person[role]
  const years = [...new Set(credits.filter(isReleased).map((c) => c.release_date.slice(0, 4)))]
    .sort((a, b) => b.localeCompare(a))
    .map((year) => ({ value: year, label: year }))
  const genres = [...new Set(credits.flatMap((c) => c.genre_ids ?? []))]
    .map((id) => ({ value: String(id), label: MOVIE_GENRES[id] ?? TV_GENRES[id] }))
    .sort((a, b) => a.label.localeCompare(b.label))
  return [
    hasBothRoles(person) && ROLE,
    new Set(credits.map((c) => c.media_type)).size > 1 && TYPE,
    { key: 'genre', label: 'Genre', kind: 'multi', options: genres },
    years.length > 1 && { key: 'year', label: 'Year', kind: 'select', options: years },
    RATED,
    SORT,
  ].filter(Boolean)
}

function Filmography({ person }) {
  // The role picks the list the other filters' options come from, so it is read before the defs
  const [searchParams] = useSearchParams()
  const role = (hasBothRoles(person) && parseFilters(searchParams, [ROLE]).role) || defaultRole(person)
  const defs = useMemo(() => getDefs(person, role), [person, role])
  const { filters, setFilter, clearFilters } = useUrlFilters(defs)
  const { ratings } = useMediaState()
  // Ratings change the list only while it filters by them
  const ratingsInUse = filters.rated ? ratings : null

  const knownFor = useMemo(() => {
    const major = person.acting.filter(isMajorRole)
    const credits = defaultRole(person) === 'directing' ? person.directing : major.length ? major : person.acting
    const perCharacter = new Map()
    return credits
      .toSorted(SORTS.popular)
      .filter((c) => {
        const name = characterOf(c)
        perCharacter.set(name, (perCharacter.get(name) ?? 0) + 1)
        return !name || perCharacter.get(name) <= MAX_PER_CHARACTER
      })
      .slice(0, KNOWN_FOR_LIMIT)
  }, [person])

  const shown = useMemo(() => {
    const { type, genre, year, rated, sort } = filters
    return person[role]
      .filter((c) => (!type || c.media_type === type)
        && (!genre || genre.some((g) => c.genre_ids?.includes(Number(g))))
        && (!year || c.release_date?.startsWith(year))
        && (!rated || (rated === 'yes' ? ratingsInUse.has(c.id) : isReleased(c) && !ratingsInUse.has(c.id))))
      .sort(SORTS[sort ?? 'newest'])
  }, [person, role, filters, ratingsInUse])

  const [page, setPage] = useState(1)
  const [prevFilters, setPrevFilters] = useState(filters)
  if (filters !== prevFilters) {
    setPrevFilters(filters)
    setPage(1)
  }
  const pageItems = useMemo(() => shown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [shown, page])

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <MediaRow heading="Known for" data={knownFor} rank={false} showRating showFavorite showWatchlist />

      <div className="flex flex-col gap-4">
        <h2 className="text-text font-semibold text-xl md:px-6">
          Filmography <Chip variant="count" size="sm" label={shown.length} className="ml-2 align-middle" />
        </h2>
        <FilterBar defs={defs} filters={filters} onChange={setFilter} onClear={clearFilters} className="md:px-6" />
        {shown.length === 0 ? (
          <p className="text-sm text-text-muted md:px-6">No titles match these filters.</p>
        ) : (
          <MediaRow
            data={pageItems}
            isExpanded
            gridItems={pageItems}
            page={page}
            totalPages={Math.ceil(shown.length / PAGE_SIZE)}
            onPageChange={setPage}
            showRating
            showFavorite
            showWatchlist
          />
        )}
      </div>
    </div>
  )
}

export default memo(Filmography)
