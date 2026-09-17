import { useMemo, useCallback } from "react"
import useGetRating from "@/features/ratings/hooks/useGetRating"
import useUploadRating from "@/features/ratings/hooks/useUploadRating"
import useDeleteRating from "@/features/ratings/hooks/useDeleteRating"
import useInteractions from "@/features/interactions/hooks/useInteractions"
import useGetAverageRating from "@/features/ratings/hooks/useGetAverageRating"
import useAverageRatingRealtime from "@/features/ratings/hooks/useAverageRatingRealtime"
import ActionSection from "@/features/media_details/components/ActionSection"

// OPT-020: isolates all interaction/rating hooks so background refetches
// of watchlist/favorites/ratings only re-render this subtree, not the entire DetailPage.
export default function ActionSectionContainer({ media, tmdbId, type }) {
  // ── Ratings ────────────────────────────────────────────────
  const { data: userRating } = useGetRating(tmdbId)
  const { data: averageRating } = useGetAverageRating(tmdbId)
  const averageScore = averageRating != null ? averageRating : null

  useAverageRatingRealtime(tmdbId)

  // ── Interactions ───────────────────────────────────────────
  const { data: watchlist } = useInteractions('watchlist')
  const { data: favorites } = useInteractions('favorite')

  const isWatchlisted = useMemo(
    () => watchlist?.some(item => item.tmdb_id === tmdbId) ?? false,
    [watchlist, tmdbId]
  )
  const isFavorited = useMemo(
    () => favorites?.some(item => item.tmdb_id === tmdbId) ?? false,
    [favorites, tmdbId]
  )

  // ── Mutations & Callbacks ──────────────────────────────────
  const { mutate: mutateUploadRating } = useUploadRating()
  const { mutate: mutateDeleteRating } = useDeleteRating()

  // OPT-019: extract primitives so handleRate doesn't depend on the full media object
  const mediaTitle = media?.title
  const mediaPoster = media?.poster_path
  const mediaRuntime = type === 'movie' ? media?.runtime : media?.episode_run_time?.[0] ?? null
  const mediaGenreIds = useMemo(() => media?.genres?.map(g => g.id) ?? null, [media?.genres])

  const handleRate = useCallback((score) => {
    if (!mediaTitle) return
    mutateUploadRating({
      tmdb_id: tmdbId,
      score,
      title: mediaTitle,
      poster_path: mediaPoster,
      type,
      runtime: mediaRuntime,
      genre_ids: mediaGenreIds,
    })
  }, [mutateUploadRating, tmdbId, mediaTitle, mediaPoster, mediaRuntime, mediaGenreIds, type])

  const handleDelete = useCallback(() => {
    mutateDeleteRating(tmdbId)
  }, [mutateDeleteRating, tmdbId])

  return (
    <ActionSection
      media={media}
      userRating={userRating}
      averageScore={averageScore}
      isWatchlisted={isWatchlisted}
      isFavorited={isFavorited}
      onRate={handleRate}
      onDelete={handleDelete}
    />
  )
}
