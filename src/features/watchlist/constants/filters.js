import { toGenreOptions, TYPE_FILTER } from "@/utils/filters"

// Moods are genre presets per media type (TMDB's movie and TV genre ids differ). A title fits a mood when
// it has any of its genres. No mood = any title ("Surprise me"). `hint` is the Tonight panel's second line.
// TV has no Horror genre: horror series are tagged Mystery.
export const MOODS = {
  adrenaline: { label: 'Adrenaline', hint: 'Action, Thriller, Crime', movie: [28, 53, 80], tv: [10759, 80] },
  horror: { label: 'Horror', hint: 'Horror, Mystery, Thriller', movie: [27, 9648, 53], tv: [9648] },
  feelgood: { label: 'Feel-good', hint: 'Comedy, Animation, Family', movie: [35, 16, 10751, 10402], tv: [35, 16, 10751] },
  brainfood: { label: 'Brain food', hint: 'Sci-Fi, Docs, History', movie: [878, 99, 36], tv: [10765, 99] },
  cozy: { label: 'Chill & cozy', hint: 'Romance, Drama', movie: [10749, 18], tv: [18] },
  epic: { label: 'Epic', hint: 'Adventure, Fantasy, War', movie: [12, 14, 10752, 37], tv: [10768, 37] },
}

// One Length filter read per title: running time for a movie, number of seasons for a series
// (lengthBucket in utils/watchlistItems.js). Its labels follow the Type filter.
export const LENGTH_LABELS = {
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
// The services that carry a saved title, loaded when the pill first opens, so a URL value is checked by its shape
export const STREAMING_FILTER = { key: 'streaming', label: 'Streaming', kind: 'multi', validate: (value) => /^[a-z0-9-]+$/.test(value) }
// Recently added is the default order, so it stays out of the URL
const SORT = { key: 'sort', label: 'Sort', kind: 'select', options: [{ value: 'oldest', label: 'Oldest added' }, { value: 'release', label: 'Release date' }, { value: 'length', label: 'Shortest first' }] }

// The one media type in the list, or undefined when both are saved
export const onlyType = (items) => {
  const types = new Set(items.map((item) => item.media_type))
  return types.size === 1 ? [...types][0] : undefined
}

// Filter defs for the saved titles. Genre and Release offer only what the list has (decades with a title
// out); Type shows once both types are saved, and Length is labelled
// for the one type a single-type list holds. `streamingOptions` stay undefined until the pill first opens.
export function getDefs(type, items, streamingOptions) {
  const genres = toGenreOptions([...new Set(items.flatMap((item) => item.genre_ids ?? []))])
  const decades = [...new Set(items.map((item) => `${item.release_date.slice(0, 3)}0`))]
    .sort((a, b) => b.localeCompare(a))
    .map((decade) => ({ value: decade, label: `${decade}s` }))
  const single = onlyType(items)
  return [
    !single && items.length > 0 && TYPE_FILTER,
    LENGTH_DEFS[type ?? single ?? ''],
    MOOD,
    genres.length > 1 && { key: 'genre', label: 'Genre', kind: 'multi', options: genres },
    decades.length > 1 && { key: 'release', label: 'Release', kind: 'select', options: decades },
    items.length > 0 && { ...STREAMING_FILTER, options: streamingOptions },
    SORT,
  ].filter(Boolean)
}
