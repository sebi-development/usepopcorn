import { useLocation, useParams } from "react-router"
import { useEffect, useLayoutEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import useMediaDetails from "@/features/media_details/hooks/useMediaDetails"
import { csfdScoreQuery } from "@/features/media_details/hooks/useCsfdScore"

import DetailCard from "@/features/media_details/components/DetailCard"
import MoviePoster from "@/components/media/MoviePoster"
import MediaDetailSkeleton from "@/features/media_details/components/MediaDetailSkeleton"
import AlertBanner from "@/components/ui/AlertBanner"
import ActionSectionContainer from "@/features/media_details/components/ActionSectionContainer"
import DetailTabs from "@/features/media_details/components/DetailTabs"
import getTmdbImageUrl from "@/utils/tmdbImage"
import { mdblistScoresQuery } from "@/features/media_details/hooks/useMdblistScores"

export default function DetailPage() {
  const { id } = useParams()
  const tmdbId = Number(id)

  const { state } = useLocation()
  const type = state?.type || 'movie'

  // Open each title at the top. `manual` is stored per history entry, so only detail entries skip
  // the browser's scroll restore; layout effect, so the old position never paints.
  useLayoutEffect(() => {
    history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
    return () => { history.scrollRestoration = "auto" }
  }, [tmdbId])

  const { data, isLoading, error: errorDetailData } = useMediaDetails(tmdbId, type)

  // Prefetch the scores so the Scores tab opens filled. A prefetch doesn't subscribe, so this page
  // doesn't re-render when they land. ČSFD waits for the IMDb id from the details.
  const queryClient = useQueryClient()
  const imdbId = data?.imdb_id
  useEffect(() => {
    queryClient.prefetchQuery(mdblistScoresQuery(type, tmdbId))
  }, [queryClient, type, tmdbId])
  useEffect(() => {
    if (!imdbId) return
    queryClient.prefetchQuery(csfdScoreQuery(imdbId))
  }, [queryClient, imdbId])

  if (isLoading) return <MediaDetailSkeleton />
  if (errorDetailData) return <AlertBanner message='Error fetching data. Please try again' variant="danger" />
  if (!data) return null

  return (
    <div className="media-detail-grid">

      <div className="[grid-area:poster]">
        <MoviePoster
          src={getTmdbImageUrl(data?.poster_path, 'w500')}
          alt={data?.title}
          className="w-full aspect-2/3 rounded-card"
        />
      </div>

      <div className="[grid-area:info]">
        <DetailCard media={data} id={id} />
      </div>

      <ActionSectionContainer media={data} tmdbId={tmdbId} type={type} />

      <DetailTabs media={data} tmdbId={tmdbId} type={type} />
    </div>
  )
}
