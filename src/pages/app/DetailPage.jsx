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

  // A title always opens at the top. The router doesn't reset scroll on navigation, and on
  // back/forward the browser would restore its saved position after this runs. The restore
  // mode is stored per history entry, so `manual` opts out only the detail entries; cleanup
  // hands `auto` back to whichever page comes next. Layout effect: the old position never paints.
  useLayoutEffect(() => {
    history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
    return () => { history.scrollRestoration = "auto" }
  }, [tmdbId])

  // ── Media ────────────────────────────────────────────────
  const { data, isLoading, error: errorDetailData } = useMediaDetails(tmdbId, type)

  // Start the score lookups early, so the Scores tab is usually filled by the time it's opened.
  // A prefetch only fills the cache and doesn't subscribe, so this page doesn't re-render when the
  // results land; ScoresTab, which reads them, does. MDBList is keyed by the id and type from the
  // URL, so it starts at once; ČSFD needs the IMDb id, which arrives with the title's details.
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

      {/* Media details */}
      <div className="[grid-area:info]">
        <DetailCard media={data} id={id} />
      </div>

      <ActionSectionContainer media={data} tmdbId={tmdbId} type={type} />

      {/* Tabbed Content Area. It owns the tab state, so switching tabs doesn't re-render this page */}
      <DetailTabs media={data} tmdbId={tmdbId} type={type} />
    </div>
  )
}
