import { toGenreOptions, TYPE_FILTER } from "@/utils/filters"
import { isReleased } from "@/utils/tmdbItem"
import { isMajorRole, ROLE_LABELS } from "@/features/people/hooks/usePerson"

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

// Parses the URL; the pill itself is built per person (roleDef)
export const ROLE = { key: 'role', label: 'Role', kind: 'select', options: [{ value: 'acting' }, { value: 'directing' }] }
const SORT = { key: 'sort', label: 'Sort', kind: 'select', options: [{ value: 'popular', label: 'Popular' }, { value: 'rated', label: 'Top rated' }] }
// For completionists: what's left to watch. Not rated lists released titles only, as an unreleased one can't be rated.
const RATED = { key: 'rated', label: 'Your rating', kind: 'select', options: [{ value: 'no', label: 'Not rated' }, { value: 'yes', label: 'Rated' }] }

export const hasBothRoles = (person) => person.acting.length > 0 && person.directing.length > 0

// Named after the role in view, its list leading with the primary role (defaultRole), each with its count
const roleDef = (person, role, primary) => ({
  ...ROLE,
  label: ROLE_LABELS[role],
  options: [primary, primary === 'acting' ? 'directing' : 'acting'].map((r) => ({ value: r, label: `${ROLE_LABELS[r]} · ${person[r].length}` })),
})

// Filter defs offering only what the credits in view (`role`) have. Years are the ones with a title
// out: no empty year, and no placeholder (TMDB dates some unscheduled projects 2099).
export function getDefs(person, role, primary) {
  const credits = person[role]
  const years = [...new Set(credits.filter(isReleased).map((c) => c.release_date.slice(0, 4)))]
    .sort((a, b) => b.localeCompare(a))
    .map((year) => ({ value: year, label: year }))
  return [
    hasBothRoles(person) && roleDef(person, role, primary),
    new Set(credits.map((c) => c.media_type)).size > 1 && TYPE_FILTER,
    { key: 'genre', label: 'Genre', kind: 'multi', options: toGenreOptions([...new Set(credits.flatMap((c) => c.genre_ids ?? []))]) },
    years.length > 1 && { key: 'year', label: 'Year', kind: 'select', options: years },
    RATED,
    SORT,
  ].filter(Boolean)
}

// Their most voted titles in the primary role (major roles when there are any), at most two per character
export function pickKnownFor(person, primary) {
  const major = person.acting.filter(isMajorRole)
  const credits = primary === 'directing' ? person.directing : major.length ? major : person.acting
  const perCharacter = new Map()
  return credits
    .toSorted(SORTS.popular)
    .filter((c) => {
      const name = characterOf(c)
      perCharacter.set(name, (perCharacter.get(name) ?? 0) + 1)
      return !name || perCharacter.get(name) <= MAX_PER_CHARACTER
    })
    .slice(0, KNOWN_FOR_LIMIT)
}

// The credits the filters leave, newest first unless sorted otherwise. `ratings` (the user's own)
// is read only while a filter uses it.
export function filterCredits(credits, { type, genre, year, rated, sort }, ratings) {
  return credits
    .filter((c) => (!type || c.media_type === type)
      && (!genre || genre.some((g) => c.genre_ids?.includes(Number(g))))
      && (!year || c.release_date?.startsWith(year))
      && (!rated || (rated === 'yes' ? ratings.has(c.id) : isReleased(c) && !ratings.has(c.id))))
    .sort(SORTS[sort ?? 'newest'])
}
