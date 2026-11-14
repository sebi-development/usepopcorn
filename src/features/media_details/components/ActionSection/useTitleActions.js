import useMediaState from "@/features/interactions/hooks/useMediaState"
import useGetAverageRating from "@/features/ratings/hooks/useGetAverageRating"
import useAverageRatingRealtime from "@/features/ratings/hooks/useAverageRatingRealtime"
import useUploadRating from "@/features/ratings/hooks/useUploadRating"
import useDeleteRating from "@/features/ratings/hooks/useDeleteRating"

// The signed-in user's state for one title (own rating, favorite, watchlist), its live average and the rating writes
export default function useTitleActions(media, tmdbId, type) {
  const { favorites, watchlist, ratings } = useMediaState()
  const { data: averageScore = null } = useGetAverageRating(tmdbId)
  useAverageRatingRealtime(tmdbId)

  const { mutate: uploadRating } = useUploadRating()
  const { mutate: deleteRating } = useDeleteRating()

  const rate = (score) => uploadRating({
    tmdb_id: tmdbId,
    score,
    title: media.title,
    poster_path: media.poster_path,
    type,
    runtime: type === 'movie' ? media.runtime : media.episode_run_time?.[0] ?? null,
    genre_ids: media.genres?.map((genre) => genre.id) ?? null,
  })

  return {
    userScore: ratings.get(tmdbId),
    averageScore,
    isFavorited: favorites.has(tmdbId),
    isWatchlisted: watchlist.has(tmdbId),
    rate,
    removeRating: () => deleteRating(tmdbId),
  }
}
