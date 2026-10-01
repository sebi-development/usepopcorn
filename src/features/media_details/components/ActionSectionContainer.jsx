import { useMemo, useCallback } from "react"
import useUploadRating from "@/features/ratings/hooks/useUploadRating"
import useDeleteRating from "@/features/ratings/hooks/useDeleteRating"
import useMediaState from "@/features/interactions/hooks/useMediaState"
import useGetAverageRating from "@/features/ratings/hooks/useGetAverageRating"
import useAverageRatingRealtime from "@/features/ratings/hooks/useAverageRatingRealtime"
import ActionSection from "@/features/media_details/components/ActionSection"

export default function ActionSectionContainer({ media, tmdbId, type }) {
  // ── User state (rating, favorite, watchlist) — one cached read model ──
  const { favorites, watchlist, ratings } = useMediaState()
  const userScore = ratings.get(tmdbId)
  const isWatchlisted = watchlist.has(tmdbId)
  const isFavorited = favorites.has(tmdbId)

  // ── Ratings ────────────────────────────────────────────────
  const { data: averageRating } = useGetAverageRating(tmdbId)
  const averageScore = averageRating != null ? averageRating : null

  useAverageRatingRealtime(tmdbId)

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
      userScore={userScore}
      averageScore={averageScore}
      isWatchlisted={isWatchlisted}
      isFavorited={isFavorited}
      onRate={handleRate}
      onDelete={handleDelete}
    />
  )
}
