import { useMemo, useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'

import CategoryRail from '@/features/browse/components/CategoryRail'
import CategoryMediaRow from '@/features/browse/components/CategoryMediaRow'
import { MOVIE_GENRES, TV_GENRES } from '@/utils/genres'
import InspirationPanel from '@/features/browse/components/InspirationPanel'
import { INSPIRE_ITEM } from '@/features/browse/constants/categories'
import { SECTION_TO_TYPE } from '@/features/browse/hooks/useCategoryMedia'
import HomePage from '@/pages/app/HomePage'

const CATEGORY_TITLES = {
  movies: {
    trending: 'Trending movies', popular: 'Popular movies', top_rated: 'Best rated movies',
    upcoming: 'Upcoming movies', now_playing: 'In theatres', inspire: 'Movie inspiration',
  },
  series: {
    trending: 'Trending series', popular: 'Popular series', top_rated: 'Best rated series',
    on_the_air: 'On the air', inspire: 'Series inspiration',
  },
}

// Resolves a display title for any category, including dynamic genre ids.
// Static categories hit CATEGORY_TITLES directly; genre ids (e.g. "genre-28")
// fall back to the MOVIE_GENRES / TV_GENRES maps to produce "Horror movies" etc.
function getCategoryTitle(section, categoryId) {
  const staticTitle = CATEGORY_TITLES[section]?.[categoryId]
  if (staticTitle) return staticTitle

  if (categoryId.startsWith('genre-')) {
    const genreId = Number(categoryId.slice(6))
    const genreMap = section === 'movies' ? MOVIE_GENRES : TV_GENRES
    const genreName = genreMap[genreId]
    if (genreName) return `${genreName} ${section === 'movies' ? 'movies' : 'series'}`
  }

  return categoryId
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const section = searchParams.get('type') || 'movies'
  const categoryId = searchParams.get('category') || 'home'

  const active = useMemo(
    () => ({ section, categoryId }),
    [section, categoryId]
  )

  const activeLabel = categoryId === 'home' ? 'Home' : getCategoryTitle(section, categoryId)

  // Titles picked in the rail's Inspire searches, one per media type ({ movie, tv }), so they
  // survive switching categories and picking a series doesn't discard the movie
  const [inspireSeeds, setInspireSeeds] = useState({})
  const handleInspireSelect = useCallback(
    (seed) => setInspireSeeds((prev) => ({ ...prev, [seed.type]: seed })),
    []
  )
  const mediaType = SECTION_TO_TYPE[section] ?? 'movie'

  const handleSelect = useCallback(
    (section, categoryId) => {
      setSearchParams({ type: section, category: categoryId }, { replace: true })
    },
    [setSearchParams]
  )

  return (
    <main className='flex flex-col gap-6 md:gap-10 pb-12'>
      <CategoryRail active={active} activeLabel={activeLabel} onSelect={handleSelect} onInspireSelect={handleInspireSelect} />
      {active.categoryId === 'home' ? (
        <HomePage />
      ) : active.categoryId === INSPIRE_ITEM.id ? (
        <InspirationPanel type={mediaType} seed={inspireSeeds[mediaType]} />
      ) : active.categoryId === 'upcoming' ? (
        <>
          <CategoryMediaRow section="movies" categoryId="upcoming" title="Upcoming this month" />
          <CategoryMediaRow section="movies" categoryId="upcoming_next_month" title="Upcoming next month" />
        </>
      ) : (
        <CategoryMediaRow
          key={`${active.section}.${active.categoryId}`}
          section={active.section}
          categoryId={active.categoryId}
          title={getCategoryTitle(active.section, active.categoryId)}
         
        />
      )}

    </main>
  )
}