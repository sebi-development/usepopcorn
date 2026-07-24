import { useMemo, useCallback } from 'react'
import { useTrending, usePopular, useNowPlaying } from '../../features/browse/hooks/useMovieQueries'
import MediaRow from '../../components/MediaRow'
import useInteractions from '../../features/interactions/hooks/useInteractions'

function BrowsePage() {
  const { data: dataTrending, fetchNextPage: fetchNextPageTrending, hasNextPage: hasNextPageTrending, isFetchingNextPage: isFetchingTrending } = useTrending()
  const { data: dataPopular, fetchNextPage: fetchNextPagePopular, hasNextPage: hasNextPagePopular, isFetchingNextPage: isFetchingPopular } = usePopular()
  const { data: dataNowPlaying, fetchNextPage: fetchNextPageNowPlaying, hasNextPage: hasNextPageNowPlaying, isFetchingNextPage: isFetchingNowPlaying } = useNowPlaying()

  const { data: favorites } = useInteractions('favorite')

  const favoriteSet = useMemo(() => new Set((favorites || []).map(f => Number(f.tmdb_id || f.id)).filter(Boolean)), [favorites])
  
  const checkIsFavorited = useCallback((item) => favoriteSet.has(Number(item?.tmdb_id || item?.id)), [favoriteSet])

  return (
    <main className='flex flex-col gap-10 pb-12'>
      <MediaRow heading='Trending now' data={dataTrending} isLoading={!dataTrending} limit={40} fetchNextPage={fetchNextPageTrending} hasNextPage={hasNextPageTrending} isFetchingNextPage={isFetchingTrending} showFavorite={true} checkIsFavorited={checkIsFavorited} />
      <MediaRow heading='Popular now' data={dataPopular} isLoading={!dataPopular} limit={40} fetchNextPage={fetchNextPagePopular} hasNextPage={hasNextPagePopular} isFetchingNextPage={isFetchingPopular} showFavorite={true} checkIsFavorited={checkIsFavorited} />
      <MediaRow heading='Currently in theatres' data={dataNowPlaying} isLoading={!dataNowPlaying} limit={20} fetchNextPage={fetchNextPageNowPlaying} hasNextPage={hasNextPageNowPlaying} isFetchingNextPage={isFetchingNowPlaying} showFavorite={true} checkIsFavorited={checkIsFavorited} />
    </main>
  )
}

export default BrowsePage