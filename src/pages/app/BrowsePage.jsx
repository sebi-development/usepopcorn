import { useMemo } from 'react'
import { useTrending, usePopular, useNowPlaying } from '../../features/browse/hooks/useMovieQueries'
import MediaRow from '../../components/MediaRow'
import useInteractions from '../../features/interactions/hooks/useInteractions'
import useDelayedLoading from '../../hooks/useDelayedLoading'

function BrowsePage() {
  const { data: dataTrending, isLoading: isLoadingTrending, error: trendingError, fetchNextPage: fetchNextPageTrending, hasNextPage: hasNextPageTrending, isFetchingNextPage: isFetchingTrending } = useTrending()
  const { data: dataPopular, isLoading: isLoadingPopular, error: popularError, fetchNextPage: fetchNextPagePopular, hasNextPage: hasNextPagePopular, isFetchingNextPage: isFetchingPopular } = usePopular()
  const { data: dataNowPlaying, isLoading: isLoadingNowPlaying, error: nowPlayingError, fetchNextPage: fetchNextPageNowPlaying, hasNextPage: hasNextPageNowPlaying, isFetchingNextPage: isFetchingNowPlaying } = useNowPlaying()

  const showLoadingTrending = useDelayedLoading(isLoadingTrending)
  const showLoadingPopular = useDelayedLoading(isLoadingPopular)
  const showLoadingNowPlaying = useDelayedLoading(isLoadingNowPlaying)

  const { data: favorites } = useInteractions('favorite')

  const favoriteSet = useMemo(() => new Set((favorites || []).map(f => Number(f.tmdb_id || f.id)).filter(Boolean)), [favorites])


  return (
    <main className='flex flex-col gap-10 pb-12'>
      <MediaRow heading='Trending now' data={dataTrending} isLoading={showLoadingTrending} limit={40} fetchNextPage={fetchNextPageTrending} hasNextPage={hasNextPageTrending} isFetchingNextPage={isFetchingTrending} showFavorite={true} favoritedSet={favoriteSet} isError={trendingError} />
      <MediaRow heading='Popular now' data={dataPopular} isLoading={showLoadingPopular} limit={40} fetchNextPage={fetchNextPagePopular} hasNextPage={hasNextPagePopular} isFetchingNextPage={isFetchingPopular} showFavorite={true} favoritedSet={favoriteSet} isError={popularError} />
      <MediaRow heading='Currently in theatres' data={dataNowPlaying} isLoading={showLoadingNowPlaying} limit={20} fetchNextPage={fetchNextPageNowPlaying} hasNextPage={hasNextPageNowPlaying} isFetchingNextPage={isFetchingNowPlaying} showFavorite={true} favoritedSet={favoriteSet} isError={nowPlayingError} />
    </main>
  )
}

export default BrowsePage