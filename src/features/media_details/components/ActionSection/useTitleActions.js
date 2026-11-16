import useMediaState from "@/features/interactions/hooks/useMediaState"
import useGetAverageRating from "@/features/ratings/hooks/useGetAverageRating"
import useAverageRatingRealtime from "@/features/ratings/hooks/useAverageRatingRealtime"
import useUploadRating from "@/features/ratings/hooks/useUploadRating"
import useDeleteRating from "@/features/ratings/hooks/useDeleteRating"
import { titleKey } from "@/utils/tmdbItem"

// The signed-in user's state for one title (own rating, favorite, watchlist), its live average and the rating writes
export default function useTitleActions(media, tmdbId, type) {
  const { favorites, watchlist, ratings } = useMediaState()
  const key = titleKey(type, tmdbId)
  const { data: averageScore = null } = useGetAverageRating(tmdbId, type)
  useAverageRatingRealtime(tmdbId, type)

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
    userScore: ratings.get(key),
    averageScore,
    isFavorited: favorites.has(key),
    isWatchlisted: watchlist.has(key),
    rate,
    removeRating: () => deleteRating({ tmdbId, type }),
  }
}
