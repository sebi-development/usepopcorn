import { HiOutlineFilm, HiOutlineTag, HiOutlineTv } from "react-icons/hi2"
import { HOME_ITEM, INSPIRE_ITEM, MOVIE_CATEGORIES, SERIES_CATEGORIES } from "@/features/browse/constants/categories"
import { toGenreOptions } from "@/utils/filters"
import { MOVIE_GENRES, TV_GENRES } from "@/utils/genres"

// A genre's category id is "genre-<TMDB id>", which useCategoryMedia routes to /discover
const genreItems = (map) => toGenreOptions(Object.keys(map)).map(({ value, label }) => ({ id: `genre-${value}`, label }))

export const SECTIONS = [
  { key: "movies", label: "Movies", icon: HiOutlineFilm, categories: MOVIE_CATEGORIES, genres: genreItems(MOVIE_GENRES) },
  { key: "series", label: "Series", icon: HiOutlineTv, categories: SERIES_CATEGORIES, genres: genreItems(TV_GENRES) },
]

// Rows and genre links share the hover fill and the active tint
export const rowClass = (isActive) => `rounded-md transition-colors duration-200 ease-out ${isActive
  ? "bg-primary/15 text-primary-light font-medium"
  : "text-text-muted hover:bg-surface-300/60 hover:text-text"}`

// Icon of the selected category, shown on the mobile trigger
export function getActiveIcon({ section, categoryId }) {
  if (categoryId === HOME_ITEM.id) return HOME_ITEM.icon
  if (categoryId === INSPIRE_ITEM.id) return INSPIRE_ITEM.icon
  if (categoryId.startsWith("genre-")) return HiOutlineTag
  const current = SECTIONS.find((s) => s.key === section) ?? SECTIONS[0]
  return current.categories.find((c) => c.id === categoryId)?.icon ?? current.icon
}
