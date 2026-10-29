import { memo, useMemo, useState } from "react"
import MediaRow from "@/components/media/MediaRow"
import FilterBar from "@/components/filters/FilterBar"
import Chip from "@/components/ui/Chip"
import useUrlFilters from "@/hooks/useUrlFilters"
import { PAGE_SIZE } from "@/utils/pagination"
import { MOVIE_GENRES, TV_GENRES } from "@/utils/genres"

const KNOWN_FOR_LIMIT = 10
const MAX_PER_CHARACTER = 2
// Votes rank the title, not the part, so Known for skips cameos: top 15 billing or 5+ episodes
const isMajorRole = (c) => (c.media_type === 'movie' ? c.order < 15 : c.episode_count >= 5)
// "Natasha Romanoff / Black Widow" -> "natasha romanoff", "Woody (voice)" -> "woody"
const characterOf = (c) => c.character?.split('/')[0].replace(/\(.*?\)/g, '').trim().toLowerCase()
// Below this many votes an average says little, so Top rated puts the title last
const MIN_VOTES = 50

const SORTS = {
  popular: (a, b) => b.vote_count - a.vote_count,
  newest: (a, b) => (b.release_date ?? '').localeCompare(a.release_date ?? ''),
  rated: (a, b) => (b.vote_count >= MIN_VOTES) - (a.vote_count >= MIN_VOTES) || b.vote_average - a.vote_average,
}

const ROLE = { key: 'role', label: 'Role', kind: 'select', options: [{ value: 'acting', label: 'Acting' }, { value: 'directing', label: 'Directing' }] }
const TYPE = { key: 'type', label: 'Type', kind: 'select', options: [{ value: 'movie', label: 'Movies' }, { value: 'tv', label: 'Series' }] }
// Newest is the default, so it needs no option
const SORT = { key: 'sort', label: 'Sort', kind: 'select', options: [{ value: 'popular', label: 'Popular' }, { value: 'rated', label: 'Top rated' }] }

const defaultRole = (person) => (person.known_for_department === 'Directing' || !person.acting.length ? 'directing' : 'acting')

// Filter defs (shape in src/utils/filters.js) offering only what this person's credits have
function getDefs(person) {
  const credits = [...person.acting, ...person.directing]
  const years = [...new Set(credits.map((c) => c.release_date?.slice(0, 4)).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a))
    .map((year) => ({ value: year, label: year }))
  const genres = [...new Set(credits.flatMap((c) => c.genre_ids ?? []))]
    .map((id) => ({ value: String(id), label: MOVIE_GENRES[id] ?? TV_GENRES[id] }))
    .sort((a, b) => a.label.localeCompare(b.label))
  return [
    person.acting.length > 0 && person.directing.length > 0 && ROLE,
    new Set(credits.map((c) => c.media_type)).size > 1 && TYPE,
    { key: 'genre', label: 'Genre', kind: 'multi', options: genres },
    years.length > 1 && { key: 'year', label: 'Year', kind: 'select', options: years },
    SORT,
  ].filter(Boolean)
}

// A person's credits arrive in one request (see usePerson), so filters and pages are client-side
function Filmography({ person }) {
  const defs = useMemo(() => getDefs(person), [person])
  const { filters, setFilter, clearFilters } = useUrlFilters(defs)

  // At most two per character, so one franchise can't fill the row
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
    const { role, type, genre, year, sort } = filters
    return person[role ?? defaultRole(person)]
      .filter((c) => (!type || c.media_type === type)
        && (!genre || genre.some((g) => c.genre_ids?.includes(Number(g))))
        && (!year || c.release_date?.startsWith(year)))
      .sort(SORTS[sort ?? 'newest'])
  }, [person, filters])

  // New filters mean a new result set: back to its first page
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
          // MediaRow held in its grid mode: the same cards and numbered pages as Browse's "View all"
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
