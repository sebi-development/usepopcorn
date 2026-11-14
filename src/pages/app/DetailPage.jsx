import { useLocation, useParams } from "react-router"
import { useEffect, useLayoutEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import useMediaDetails from "@/features/media_details/hooks/useMediaDetails"
import { csfdScoreQuery } from "@/features/media_details/hooks/useCsfdScore"

import DetailCard from "@/features/media_details/components/DetailCard"
import DetailBackdrop from "@/features/media_details/components/DetailBackdrop"
import MoviePoster from "@/components/media/MoviePoster"
import MediaDetailSkeleton from "@/features/media_details/components/MediaDetailSkeleton"
import AlertBanner from "@/components/ui/AlertBanner"
import ActionSection from "@/features/media_details/components/ActionSection/ActionSection"
import DetailTabs from "@/features/media_details/components/DetailTabs"
import getTmdbImageUrl from "@/utils/tmdbImage"
import { mdblistScoresQuery } from "@/features/media_details/hooks/useMdblistScores"

const POSTER_SIZES = [185, 342, 500]

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

  // Prefetch the scores so the Scores tab opens filled. A prefetch doesn't subscribe
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
    <div className="media-detail-grid relative">

      <DetailBackdrop path={data.backdrop_path} />

      <div className="[grid-area:poster]">
        <MoviePoster
          src={getTmdbImageUrl(data?.poster_path, 'w500')}
          srcSet={data?.poster_path && POSTER_SIZES.map((w) => `${getTmdbImageUrl(data.poster_path, `w${w}`)} ${w}w`).join(', ')}
          sizes="(min-width: 768px) 240px, 6.5rem"
          alt={data?.title}
          className="w-full aspect-2/3 rounded-card shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
          priority
        />
      </div>

      <div className="[grid-area:info] md:self-end min-w-0">
        <DetailCard media={data} id={id} />
      </div>

      <ActionSection media={data} tmdbId={tmdbId} type={type} />

      <DetailTabs media={data} tmdbId={tmdbId} type={type} />
    </div>
  )
}
