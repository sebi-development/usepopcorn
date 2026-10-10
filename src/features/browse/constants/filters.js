import { MOVIE_GENRES, TV_GENRES } from "@/utils/genres"
import { getCountryOptions } from "@/utils/getCountries"
import { HOME_ITEM, INSPIRE_ITEM } from "@/features/browse/constants/categories"

// Filter defs for Browse (shape in src/utils/filters.js). Every filter maps to a TMDB /discover
// param (see toDiscoverParams in useCategoryMedia.js). Genre, country and language are multi
// (/discover ORs pipe-separated values); a year is single, /discover takes only one.

const toGenreOptions = (map) => Object.entries(map)
  .map(([value, label]) => ({ value, label }))
  .sort((a, b) => a.label.localeCompare(b.label))

// Newest first, next year included so Upcoming can be narrowed to it
const YEAR_MAX = new Date().getFullYear() + 1
const YEAR_MIN = 1950
const YEAR_OPTIONS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => {
  const year = String(YEAR_MAX - i)
  return { value: year, label: year }
})

const LANGUAGE_CODES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'sv', 'da', 'no', 'pl', 'tr', 'ru', 'hi', 'ja', 'ko', 'zh']
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' })
const LANGUAGE_OPTIONS = LANGUAGE_CODES
  .map((code) => ({ value: code, label: languageNames.of(code) }))
  .sort((a, b) => a.label.localeCompare(b.label))

const COUNTRY_OPTIONS = getCountryOptions().map(({ code, name }) => ({ value: code, label: name }))

const YEAR = { key: 'year', label: 'Year', kind: 'select', options: YEAR_OPTIONS }
const COUNTRY = { key: 'country', label: 'Country', kind: 'multi', options: COUNTRY_OPTIONS }
const LANGUAGE = { key: 'language', label: 'Language', kind: 'multi', options: LANGUAGE_OPTIONS }
const genre = (map) => ({ key: 'genre', label: 'Genre', kind: 'multi', options: toGenreOptions(map) })

const MOVIE_FILTERS = [genre(MOVIE_GENRES), YEAR, COUNTRY, LANGUAGE]
const SERIES_FILTERS = [genre(TV_GENRES), YEAR, COUNTRY, LANGUAGE]
// A genre category already is the genre (and /discover can't mix AND with OR genres)
const GENRE_CATEGORY_FILTERS = [YEAR, COUNTRY, LANGUAGE]
const NO_FILTERS = []

// Trending has no /discover equivalent, Home and Inspire aren't lists: no filters there
const UNFILTERABLE = new Set([HOME_ITEM.id, INSPIRE_ITEM.id, 'trending'])

export function getBrowseFilters(section, categoryId) {
  if (UNFILTERABLE.has(categoryId)) return NO_FILTERS
  if (categoryId.startsWith('genre-')) return GENRE_CATEGORY_FILTERS
  return section === 'series' ? SERIES_FILTERS : MOVIE_FILTERS
}
