import useRecommendations from '@/features/browse/hooks/useRecommendations'
import useInteractions from '@/features/interactions/hooks/useInteractions'
import useProfileStats from '@/features/profile/hooks/useProfileStats'
import useCurrentUser from '@/features/auth/hooks/useCurrentUser'
import useCategoryMedia from '@/features/browse/hooks/useCategoryMedia'
import MediaRow from '@/components/media/MediaRow'
import StreakCard from '@/features/profile/components/StreakCard'
import { useMemo } from 'react'
import { getGenreNames } from '@/utils/genres'
import InfoCard from '@/components/ui/InfoCard'
import Button from '@/components/ui/Button'
import { Link } from 'react-router'
import ArrowLink from '@/components/ui/ArrowLink'
import useProfileStreak from '@/features/profile/hooks/useProfileStreak'
import FeatureCard from '@/components/ui/FeatureCard'
import { HiStar, HiHeart } from 'react-icons/hi2'
import useBestRatedRecent from '@/features/profile/hooks/useBestRatedRecent'
import RatingBadge from '@/components/media/RatingBadge'

export default function HomePage() {
  const currentUser = useCurrentUser()

  const { seedTitle, data: recsData, isLoading: isLoadingRecs, isError: isErrorRecs } = useRecommendations()
  const { data: watchlist, isLoading: isLoadingWatchlist, isError: isErrorWatchlist } = useInteractions('watchlist')
  const { data: favorites } = useInteractions('favorite', undefined, { staleTime: Infinity })
  const { data: streakData, isLoading: isLoadingStreak, isError: isErrorStreak, isLoadingExtended, extendedStreak, isSaturated } = useProfileStreak(currentUser?.id)
  const { data: bestRecent, isLoading: isLoadingBestRecent, isError: isErrorBestRecent } = useBestRatedRecent(currentUser?.id)

  const { data: stats } = useProfileStats(currentUser?.id)

  const topMovieGenreId = useMemo(
    () => stats?.topGenres?.find(g => g.type === 'movie')?.genreId ?? null,
    [stats]
  )
  const genreCategoryId = topMovieGenreId ? `genre-${topMovieGenreId}` : 'popular'
  const genreQuery = useCategoryMedia('movies', genreCategoryId)

  const isLoadingCards = !stats || isLoadingBestRecent

  if (!isLoadingCards && !seedTitle) return (
    <InfoCard title="Welcome to usePopcorn" subtitle="Rate a few titles and this page fills in with picks made for you.">
      <ul className="flex flex-col gap-3 text-sm text-text-muted">
        <li>Search any movie or series and give it a rating</li>
        <li>Save things you want to watch to your watchlist</li>
        <li>Come back here for picks based on what you loved</li>
      </ul>
      <Button as={Link} to="/browse?type=movies&category=trending" variant="solid">
        Start browsing
      </Button>
    </InfoCard>
  )

  return (
    <main className="flex flex-col gap-8 md:gap-10 pb-12">
      <div className="grid grid-cols-3 gap-3 sm:gap-5 px-4 sm:px-8 pt-6 w-full max-w-3xl mx-auto">
        <StreakCard
          data={streakData}
          isLoading={isLoadingStreak}
          isError={isErrorStreak}
          isLoadingExtended={isLoadingExtended}
          extendedStreak={extendedStreak}
          isSaturated={isSaturated}
        />

        {isLoadingCards ? (
          <div className="aspect-2/3 w-full rounded-[1.75rem] sm:rounded-4xl bg-surface-900 border border-surface-100/10 p-1.5 sm:p-2 animate-pulse flex flex-col">
            <div className="h-[70%] w-full rounded-[1.25rem] sm:rounded-3xl bg-surface-800" />
            <div className="flex-1 mt-4 mx-2">
              <div className="h-3 w-2/3 bg-surface-800 rounded mb-1.5" />
              <div className="h-3 w-1/2 bg-surface-800 rounded" />
            </div>
          </div>
        ) : (
          <FeatureCard
            heroBackground={
              bestRecent?.poster_path
                ? `url('https://image.tmdb.org/t/p/w342${bestRecent.poster_path}') center/cover`
                : "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)"
            }
            floatingIcon={<HiStar className="text-2xl sm:text-4xl text-amber-400" />}
          >
            <h3 className="text-xs sm:text-base font-bold text-text leading-tight mb-0.5 sm:mb-1">
              Top of the Month
            </h3>
            <p className="text-[10px] sm:text-sm text-text-muted leading-tight line-clamp-2 mb-auto">
              {bestRecent?.title ?? bestRecent?.name ?? 'No ratings yet'}
            </p>
            <div className="pt-2 sm:pt-3 mt-1.5 sm:mt-2 border-t border-surface-100/10 flex items-center gap-1 sm:gap-3 text-xs sm:text-sm text-text-muted">
              {bestRecent?.rating != null && (
                <RatingBadge text={`${bestRecent.rating}/10`} size={14} className="text-text text-xs sm:text-sm font-bold" />
              )}
            </div>
          </FeatureCard>
        )}

        {isLoadingCards ? (
          <div className="aspect-2/3 w-full rounded-[1.75rem] sm:rounded-4xl bg-surface-900 border border-surface-100/10 p-1.5 sm:p-2 animate-pulse flex flex-col">
            <div className="h-[70%] w-full rounded-[1.25rem] sm:rounded-3xl bg-surface-800" />
            <div className="flex-1 mt-4 mx-2">
              <div className="h-3 w-2/3 bg-surface-800 rounded mb-1.5" />
              <div className="h-3 w-1/2 bg-surface-800 rounded" />
            </div>
          </div>
        ) : (
          <FeatureCard
            heroBackground="linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
            floatingIcon={<HiHeart className="text-2xl sm:text-4xl text-pink-500" />}
          >
            <h3 className="text-xs sm:text-base font-bold text-text leading-tight mb-1">
              Favorites
            </h3>
            <p className="text-[10px] sm:text-sm text-text-muted leading-tight mb-auto line-clamp-2">
              You've loved {favorites?.length ?? 0} titles.
            </p>
            <div className="pt-2 sm:pt-3 mt-1.5 sm:mt-2 border-t border-surface-100/10">
              <ArrowLink to="/profile" className="text-primary-light text-xs sm:text-sm font-semibold">
                View all
              </ArrowLink>
            </div>
          </FeatureCard>
        )}
      </div>

      {seedTitle && (
        <MediaRow
          heading={`Because you loved "${seedTitle.title}"`}
          data={recsData}
          mediaType={seedTitle.type}
          isLoading={isLoadingRecs}
          isError={isErrorRecs}
          showInfo={true}
          rank={false}
        />
      )}

      <MediaRow
        heading={`Because you love ${getGenreNames(topMovieGenreId ? [topMovieGenreId] : [], 'movie')}`}
        data={genreQuery.data}
        mediaType="movie"
        isLoading={genreQuery.isLoading}
        isError={genreQuery.isError}
        fetchNextPage={genreQuery.fetchNextPage}
        hasNextPage={genreQuery.hasNextPage}
        isFetchingNextPage={genreQuery.isFetchingNextPage}
        showInfo={true}
        rank={false}
      />

      <MediaRow
        heading="Your watchlist"
        data={watchlist}
        isLoading={isLoadingWatchlist}
        isError={isErrorWatchlist}
        showInfo={false}
        rank={false}
      />
    </main>
  )
}