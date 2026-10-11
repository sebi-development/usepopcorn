import { subDays, subMonths, subYears } from "date-fns"
import { MOVIE_GENRES, TV_GENRES } from "@/utils/genres"

// Filter defs for the Friends Activity feed (shape in src/utils/filters.js), served by the
// optional get_user_feed params (see toFeedParams). Genre and Friend take several values (any of
// them matches); Type, Score and Period are one choice each by nature.

// Shared ids (Comedy, Drama...) carry the same name in both maps, so merging loses nothing
const GENRE_OPTIONS = Object.entries({ ...MOVIE_GENRES, ...TV_GENRES })
  .map(([value, label]) => ({ value, label }))
  .sort((a, b) => a.label.localeCompare(b.label))

const GENRE_IDS_BY_TYPE = {
  movie: new Set(Object.keys(MOVIE_GENRES)),
  tv: new Set(Object.keys(TV_GENRES)),
}

// Genre options for the chosen type, plus any already selected genre of the other type so its
// chip keeps a name and can still be deselected
export function getFeedGenreOptions(type, selected) {
  const ids = GENRE_IDS_BY_TYPE[type]
  if (!ids) return GENRE_OPTIONS
  return GENRE_OPTIONS.filter((option) => ids.has(option.value) || selected?.includes(option.value))
}

// Rolling windows; the query key holds the id and the start is computed at fetch time
const PERIOD_START = {
  week: () => subDays(new Date(), 7),
  month: () => subMonths(new Date(), 1),
  year: () => subYears(new Date(), 1),
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const FEED_FILTERS = [
  { key: 'type', label: 'Type', kind: 'select', options: [{ value: 'movie', label: 'Movies' }, { value: 'tv', label: 'Series' }] },
  { key: 'score', label: 'Score', kind: 'select', options: ['9', '8', '7', '6'].map((value) => ({ value, label: `${value}+` })) },
  { key: 'genre', label: 'Genre', kind: 'multi', options: GENRE_OPTIONS },
  // Followed users are only known at runtime: CommunityPage fills the options in
  { key: 'friend', label: 'Friend', kind: 'multi', validate: (value) => UUID_RE.test(value) },
  {
    key: 'period', label: 'Period', kind: 'select', options: [
      { value: 'week', label: 'Past week' }, { value: 'month', label: 'Past month' }, { value: 'year', label: 'Past year' },
    ],
  },
]

// Only the active filters are sent: an unfiltered call matches the RPC on its base params alone
export function toFeedParams({ type, score, genre, friend, period } = {}) {
  const params = {}
  if (type) params.p_type = type
  if (score) params.p_min_score = Number(score)
  if (genre) params.p_genre_ids = genre.map(Number)
  if (friend) params.p_user_ids = friend
  if (period) params.p_since = PERIOD_START[period]().toISOString()
  return params
}
