import useRecommendationSeeds from '@/features/browse/hooks/useRecommendationSeeds'
import RecommendationRow from '@/features/browse/components/RecommendationRow'
import useInteractions from '@/features/interactions/hooks/useInteractions'
import { useFavoritesCount, useHasNoActivity } from '@/features/interactions/hooks/useMediaState'
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
import { PopcornIcon } from '@/components/ui/Logo'
import useBestRated from '@/features/profile/hooks/useBestRated'
import BestRatedCard from '@/features/profile/components/BestRatedCard'

const WELCOME_ICON = <PopcornIcon className="text-4xl" />

export default function HomePage() {
  const currentUser = useCurrentUser()

  const seeds = useRecommendationSeeds(currentUser?.id)
  const { data: watchlist, isLoading: isLoadingWatchlist, error: watchlistError } = useInteractions('watchlist')
  const favoritesCount = useFavoritesCount()
  const hasNoActivity = useHasNoActivity()
  const { data: streakData, isLoading: isLoadingStreak, isError: isErrorStreak, isLoadingExtended, extendedStreak, isSaturated } = useProfileStreak(currentUser?.id)
  const { movie: bestMovie, tv: bestSeries, isLoading: isLoadingBestRated } = useBestRated(currentUser?.id)

  const { data: stats, isLoading: isLoadingStats } = useProfileStats(currentUser?.id)

  const topMovieGenreId = useMemo(
    () => stats?.topGenres?.find(g => g.type === 'movie')?.genreId ?? null,
    [stats]
  )
  // 'popular' is only a placeholder id for the hook and is never fetched: without a top movie
  // genre (nothing rated yet, or only series) there is no genre row at all
  const genreCategoryId = topMovieGenreId ? `genre-${topMovieGenreId}` : 'popular'
  const genreQuery = useCategoryMedia('movies', genreCategoryId, { enabled: Boolean(topMovieGenreId) })

  const isLoadingCards = isLoadingStats || isLoadingBestRated

  // Only for someone who has done nothing yet: no ratings, favorites or saved titles. (Stats are null,
  // not zeros, for a user with no ratings, so they can't tell "new" from "loading" on their own.)
  if (hasNoActivity) return (
    <div className="flex justify-center md:pt-6">
      <InfoCard icon={WELCOME_ICON} title="Welcome to usePopcorn" subtitle="Rate a few titles and this page fills in with picks made for you.">
        <ul className="flex flex-col gap-3 text-sm text-text-muted list-disc marker:text-primary-light pl-5">
          <li>Search any movie or series and give it a rating</li>
          <li>Save things you want to watch to your watchlist</li>
          <li>Come back here for picks based on what you loved</li>
        </ul>
        <Button as={Link} to="/browse?type=movies&category=trending" variant="solid">
          Start browsing
        </Button>
      </InfoCard>
    </div>
  )

  return (
    <main className="flex flex-col gap-8 md:gap-10 pb-12">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 px-0 sm:px-8 pt-2 sm:pt-6 w-full max-w-4xl mx-auto">
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
              You've loved {favoritesCount} titles.
            </p>
            <div className="mt-auto">
              {/* Stretched over the card like its three neighbours, instead of a 16px-tall text target */}
              <ArrowLink to="/profile" stretched className="text-primary-light text-xs sm:text-sm font-semibold">
                View all
              </ArrowLink>
            </div>
          </FeatureCard>
        )}
      </div>

      <RecommendationRow seed={seeds.movie} type="movie" isLoadingSeed={seeds.isLoading} />
      <RecommendationRow seed={seeds.tv} type="tv" isLoadingSeed={seeds.isLoading} />

      {topMovieGenreId && (
        <MediaRow
          heading={`Because you love ${getGenreNames([topMovieGenreId], 'movie')} genre`}
          data={genreQuery.items}
          mediaType="movie"
          isLoading={genreQuery.isLoading}
          isError={genreQuery.isError}
          onLoadMore={genreQuery.fetchMore}
          hasMore={genreQuery.phase === 'auto'}
          showInfo={true}
          rank={false}
          showRating
          showFavorite
          showWatchlist
        />
      )}

      {/* Nothing saved, no row: an empty "Your watchlist" heading is just noise */}
      {(isLoadingWatchlist || watchlistError || watchlist?.length > 0) && (
        <MediaRow
          heading="Your watchlist"
          data={watchlist}
          isLoading={isLoadingWatchlist}
          isError={Boolean(watchlistError)}
          delaySkeleton
          showInfo={false}
          rank={false}
        />
      )}
    </main>
  )
}