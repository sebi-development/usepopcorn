import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import CategoryRail from '@/features/browse/components/CategoryRail'
import CategoryMediaRow from '@/features/browse/components/CategoryMediaRow'
import useInteractions from '@/features/interactions/hooks/useInteractions'
import { MOVIE_GENRES, TV_GENRES } from '@/utils/genres'
import HomePage from '@/pages/app/HomePage'

const CATEGORY_TITLES = {
  movies: {
    trending: 'Trending movies', popular: 'Popular movies', top_rated: 'Best rated movies',
    upcoming: 'Upcoming movies', now_playing: 'In theatres',
  },
  series: {
    trending: 'Trending series', popular: 'Popular series', top_rated: 'Best rated series',
    on_the_air: 'On the air',
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

  const active = {
    section: searchParams.get('type') || 'movies',
    categoryId: searchParams.get('category') || 'trending',
  }

  const { data: favorites } = useInteractions('favorite')
  const favoriteSet = useMemo(
    () => new Set((favorites || []).map(f => Number(f.tmdb_id || f.id)).filter(Boolean)),
    [favorites]
  )

  function handleSelect(section, categoryId) {
    setSearchParams({ type: section, category: categoryId }, { replace: true })
  }

  return (
    <main className='flex flex-col gap-10 pb-12'>
      <CategoryRail active={active} onSelect={handleSelect} />
      {active.categoryId === 'home' ?
        <HomePage /> :
        <CategoryMediaRow
          key={`${active.section}.${active.categoryId}`}
          section={active.section}
          categoryId={active.categoryId}
          title={getCategoryTitle(active.section, active.categoryId)}
          favoriteSet={favoriteSet}
        />
      }

    </main>
  )
}