import { isReleased } from "@/utils/tmdbItem"
import { timeSince } from "@/utils/timeAgo"
import { MOODS } from "@/features/watchlist/constants/filters"

const SHELF_LIMIT = 15

// 'short' | 'medium' | 'long' from a movie's minutes or a series' seasons; null while TMDB has no length
export function lengthBucket({ media_type, runtime, seasons }) {
  if (media_type === 'tv') return seasons ? (seasons === 1 ? 'short' : seasons <= 3 ? 'medium' : 'long') : null
  return runtime ? (runtime < 90 ? 'short' : runtime <= 120 ? 'medium' : 'long') : null
}

// The card badge: "1h 56m", "48m" or "2 seasons"
export function lengthLabel({ media_type, runtime, seasons }) {
  if (media_type === 'tv') return seasons ? `${seasons} season${seasons === 1 ? '' : 's'}` : undefined
  if (!runtime) return undefined
  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60
  return hours ? `${hours}h${minutes ? ` ${minutes}m` : ''}` : `${minutes}m`
}

// Waiting longest's badge: how long the title has been on the list
const ageLabel = (item) => timeSince(item.created_at)

// One predicate per filter key (the defs in constants/filters.js)
const MATCHES = {
  type: (item, type) => item.media_type === type,
  length: (item, length) => lengthBucket(item) === length,
  mood: (item, mood) => MOODS[mood][item.media_type].some((id) => item.genre_ids?.includes(id)),
  genre: (item, ids) => ids.some((id) => item.genre_ids?.includes(Number(id))),
  release: (item, release) => (release === 'upcoming'
    ? !isReleased(item)
    : isReleased(item) && item.release_date.startsWith(release.slice(0, 3))),
}

const size = (item) => (item.media_type === 'tv' ? item.seasons : item.runtime) ?? Infinity

// Sorted here, not by the query: an optimistic add lands at the end of the cached list
const SORTS = {
  added: (a, b) => b.created_at.localeCompare(a.created_at),
  oldest: (a, b) => a.created_at.localeCompare(b.created_at),
  // Newest release first; titles with no date yet lead
  release: (a, b) => (b.release_date ?? '9999').localeCompare(a.release_date ?? '9999'),
  // Movies by running time, then series by seasons; unknown lengths last within each
  length: (a, b) => (a.media_type === 'tv') - (b.media_type === 'tv') || size(a) - size(b),
}

// The titles the filters leave, recently added first unless sorted otherwise
export function filterItems(items, { sort = 'added', ...filters }) {
  const active = Object.entries(filters)
  return items.filter((item) => active.every(([key, value]) => MATCHES[key](item, value))).sort(SORTS[sort])
}

// The fixed shelves over the whole list (filters don't narrow them); empty ones are left out. `preset` is
// what "View all" sets on the All saved grid, so a shelf and its grid always list the same titles.
export function toShelves(items) {
  const quick = filterItems(items, { type: 'movie', length: 'short' })
  const waiting = items.length > SHELF_LIMIT ? items.toSorted(SORTS.oldest).slice(0, SHELF_LIMIT) : []
  const upcoming = filterItems(items, { release: 'upcoming' })
  return [
    { id: 'quick', heading: 'Under 90 minutes', items: quick, preset: { type: 'movie', length: 'short' }, badgeOf: lengthLabel },
    { id: 'waiting', heading: 'Waiting longest', items: waiting, preset: { sort: 'oldest' }, badgeOf: ageLabel },
    { id: 'upcoming', heading: 'Not out yet', items: upcoming, preset: { release: 'upcoming' } },
  ].filter((shelf) => shelf.items.length > 0)
}

const count = (n, one, many = `${one}s`) => n && `${n} ${n === 1 ? one : many}`

// "56 movies · 3 series · 4 not out yet"
export function summarize(items) {
  const series = items.filter((item) => item.media_type === 'tv').length
  const upcoming = items.filter((item) => !isReleased(item)).length
  return [count(items.length - series, 'movie'), count(series, 'series', 'series'), upcoming && `${upcoming} not out yet`]
    .filter(Boolean)
    .join(' · ')
}
