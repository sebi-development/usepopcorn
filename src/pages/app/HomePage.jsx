import useRecommendationSeeds from '@/features/browse/hooks/useRecommendationSeeds'
import RecommendationRow from '@/features/browse/components/RecommendationRow'
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
import FeatureCard, { FeatureCardSkeleton } from '@/components/ui/FeatureCard'
import Chip from '@/components/ui/Chip'
import { HiHeart } from 'react-icons/hi2'
import useBestRated from '@/features/profile/hooks/useBestRated'
import BestRatedCard from '@/features/profile/components/BestRatedCard'

export default function HomePage() {
  const currentUser = useCurrentUser()

  const seeds = useRecommendationSeeds(currentUser?.id)
  const { data: watchlist, isLoading: isLoadingWatchlist, isError: isErrorWatchlist } = useInteractions('watchlist')
  const { data: favorites } = useInteractions('favorite', undefined, { staleTime: Infinity })
  const { data: streakData, isLoading: isLoadingStreak, isError: isErrorStreak, isLoadingExtended, extendedStreak, isSaturated } = useProfileStreak(currentUser?.id)
  const { movie: bestMovie, tv: bestSeries, isLoading: isLoadingBestRated } = useBestRated(currentUser?.id)

  const { data: stats, isLoading: isLoadingStats } = useProfileStats(currentUser?.id)

  const topMovieGenreId = useMemo(
    () => stats?.topGenres?.find(g => g.type === 'movie')?.genreId ?? null,
    [stats]
  )
  const genreCategoryId = topMovieGenreId ? `genre-${topMovieGenreId}` : 'popular'
  // Held until stats resolve so the placeholder 'popular' id doesn't fire a request
  // that is thrown away as soon as the real top genre is known
  const genreQuery = useCategoryMedia('movies', genreCategoryId, { enabled: !isLoadingStats })

  const isLoadingCards = !stats || isLoadingBestRated

  if (!isLoadingCards && !stats.totalRated) return (
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 px-4 sm:px-8 pt-6 w-full max-w-4xl mx-auto">
        <StreakCard
          data={streakData}
          isLoading={isLoadingStreak}
          isError={isErrorStreak}
          isLoadingExtended={isLoadingExtended}
          extendedStreak={extendedStreak}
          isSaturated={isSaturated}
        />

        <BestRatedCard kind="movie" pick={bestMovie} isLoading={isLoadingCards} />
        <BestRatedCard kind="tv" pick={bestSeries} isLoading={isLoadingCards} />

        {isLoadingCards ? (
          <FeatureCardSkeleton />
        ) : (
          <FeatureCard
            heroBackground="linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
            floatingIcon={<HiHeart className="text-2xl sm:text-4xl text-pink-500" />}
          >
            <Chip size="sm" colorRgb="236, 72, 153" className="self-start max-w-full">
              <span className="truncate">Favorites</span>
            </Chip>
            <p className="text-[10px] sm:text-sm text-text-muted leading-tight line-clamp-2">
              You've loved {favorites?.length ?? 0} titles.
            </p>
            <div className="mt-auto">
              <ArrowLink to="/profile" className="text-primary-light text-xs sm:text-sm font-semibold">
                View all
              </ArrowLink>
            </div>
          </FeatureCard>
        )}
      </div>

      <RecommendationRow seed={seeds.movie} type="movie" isLoadingSeed={seeds.isLoading} />
      <RecommendationRow seed={seeds.tv} type="tv" isLoadingSeed={seeds.isLoading} />

      <MediaRow
        heading={`Because you love ${getGenreNames(topMovieGenreId ? [topMovieGenreId] : [], 'movie')} genre` }
        data={genreQuery.data}
        mediaType="movie"
        isLoading={isLoadingStats || genreQuery.isLoading}
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