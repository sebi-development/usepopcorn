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

// TMDB poster widths for the srcset; no w780, so a retina desktop keeps today's w500
const POSTER_SIZES = [185, 342, 500]

// Fades only at the bottom (several stops, so no visible band where it ends); the sides meet the screen edge
const BACKDROP_FADE = "linear-gradient(to bottom, #000 0%, #000 40%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.2) 85%, transparent 100%)"
const BACKDROP_STYLE = { maskImage: BACKDROP_FADE, WebkitMaskImage: BACKDROP_FADE }
// Dims toward the page colour instead of fading the image's opacity, which washes it out
const BACKDROP_SCRIM = "linear-gradient(90deg, rgba(7,9,11,0.7), rgba(7,9,11,0.1) 60%, rgba(7,9,11,0.4)), linear-gradient(rgba(7,9,11,0.3), rgba(7,9,11,0.3))"

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
    <div className="media-detail-grid relative">

      {/* Full width, from the top of the page. It reaches up past the navbar (the part above the page is
          clipped), or an edge would show under it. */}
      {data.backdrop_path && (
        <div aria-hidden="true" className="pointer-events-none absolute -z-10 left-1/2 w-screen -translate-x-1/2 -top-28 h-80 md:-top-44 md:h-144" style={BACKDROP_STYLE}>
          <img
            src={getTmdbImageUrl(data.backdrop_path, 'w780')}
            srcSet={`${getTmdbImageUrl(data.backdrop_path, 'w780')} 780w, ${getTmdbImageUrl(data.backdrop_path, 'w1280')} 1280w`}
            sizes="100vw"
            alt=""
            decoding="async"
            className="size-full object-cover object-[50%_25%]"
          />
          <div className="absolute inset-0" style={{ background: BACKDROP_SCRIM }} />
        </div>
      )}

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

      <ActionSectionContainer media={data} tmdbId={tmdbId} type={type} />

      <DetailTabs media={data} tmdbId={tmdbId} type={type} />
    </div>
  )
}
