import { toGenreOptions, TYPE_FILTER } from "@/utils/filters"
import { isReleased } from "@/utils/tmdbItem"

// Moods are genre presets per media type (TMDB's movie and TV genre ids differ). A title fits a mood when
// it has any of its genres. No mood = any title ("Surprise me").
export const MOODS = {
  adrenaline: { label: 'Adrenaline', movie: [28, 53, 80, 27], tv: [10759, 80] },
  feelgood: { label: 'Feel-good', movie: [35, 16, 10751, 10402], tv: [35, 16, 10751] },
  brainfood: { label: 'Brain food', movie: [878, 9648, 99, 36], tv: [10765, 9648, 99] },
  cozy: { label: 'Chill & cozy', movie: [10749, 18], tv: [18] },
}

// One Length filter read per title: running time for a movie, number of seasons for a series
// (lengthBucket in utils/watchlistItems.js). Its labels follow the Type filter.
const LENGTH_LABELS = {
  movie: { short: 'Under 90 min', medium: '90–120 min', long: 'Over 2 h' },
  tv: { short: '1 season', medium: '2–3 seasons', long: '4+ seasons' },
}
const lengthDef = (label) => ({
  key: 'length',
  label: 'Length',
  kind: 'select',
  options: ['short', 'medium', 'long'].map((value) => ({ value, label: label(value) })),
})
// Per Type value; '' = both types
const LENGTH_DEFS = {
  movie: lengthDef((value) => LENGTH_LABELS.movie[value]),
  tv: lengthDef((value) => LENGTH_LABELS.tv[value]),
  '': lengthDef((value) => `${LENGTH_LABELS.movie[value]} · ${LENGTH_LABELS.tv[value]}`),
}

const MOOD = { key: 'mood', label: 'Mood', kind: 'select', options: Object.entries(MOODS).map(([value, { label }]) => ({ value, label })) }
// Recently added is the default order, so it stays out of the URL
const SORT = { key: 'sort', label: 'Sort', kind: 'select', options: [{ value: 'oldest', label: 'Oldest added' }, { value: 'release', label: 'Release date' }, { value: 'length', label: 'Shortest first' }] }

// Filter defs for the saved titles. Genre and Release offer only what the list has (decades with a title
// out, "Not out yet" when something isn't); Type shows once both types are saved.
export function getDefs(type, items) {
  const genres = toGenreOptions([...new Set(items.flatMap((item) => item.genre_ids ?? []))])
  const decades = [...new Set(items.filter(isReleased).map((item) => `${item.release_date.slice(0, 3)}0`))]
    .sort((a, b) => b.localeCompare(a))
    .map((decade) => ({ value: decade, label: `${decade}s` }))
  const release = [items.some((item) => !isReleased(item)) && { value: 'upcoming', label: 'Not out yet' }, ...decades].filter(Boolean)
  return [
    new Set(items.map((item) => item.media_type)).size > 1 && TYPE_FILTER,
    LENGTH_DEFS[type ?? ''],
    MOOD,
    genres.length > 1 && { key: 'genre', label: 'Genre', kind: 'multi', options: genres },
    release.length > 1 && { key: 'release', label: 'Release', kind: 'select', options: release },
    SORT,
  ].filter(Boolean)
}
