import { useLocation, useParams } from "react-router"
import { useMemo, useState, useCallback } from "react"
import { HiOutlineInformationCircle, HiOutlineStar, HiOutlineUsers, HiOutlineListBullet } from "react-icons/hi2"

import useMediaDetails from "../../features/media_details/hooks/useMediaDetails"
import useGetRating from '../../features/ratings/hooks/useGetRating'
import useUploadRating from "../../features/ratings/hooks/useUploadRating"
import useDeleteRating from "../../features/ratings/hooks/useDeleteRating"
import useInteractions from "../../features/interactions/hooks/useInteractions"
import useGetAverageRating from "../../features/ratings/hooks/useGetAverageRating"
import useAverageRatingRealtime from "../../features/ratings/hooks/useAverageRatingRealtime"
import useCurrentUser from "../../features/auth/hooks/useCurrentUser"

import DetailCard from "../../features/media_details/components/DetailCard"
import MoviePoster from "../../components/MoviePoster"
import MediaDetailSkeleton from "../../components/skeletons/MediaDetailSkeleton"
import AlertBanner from "../../components/AlertBanner"
import ActionSection from "../../features/media_details/components/ActionSection"
import SlidingTabs from "../../components/SlidingTabs"
import FriendActivityTab from "../../features/media_details/components/tabs/FriendActivityTab"
import ScoresTab from "../../features/media_details/components/tabs/ScoresTab"
import OverviewTab from "../../features/media_details/components/tabs/OverviewTab"
import SeasonsTab from "../../features/media_details/components/tabs/SeasonsTab"
import useDelayedLoading from "../../hooks/useDelayedLoading"

function TabPanel({ id, activeTab, children }) {
  if (activeTab !== id) return null

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className="animate-in fade-in duration-300"
    >
      {children}
    </div>
  )
}

export default function DetailPage() {
  const { id } = useParams()
  const tmdbId = Number(id)

  const { state } = useLocation()
  const type = state?.type || 'movie'
  const currentUser = useCurrentUser()
  const [activeTab, setActiveTab] = useState("overview")

  const DETAIL_TABS = useMemo(() => {
    const base = [
      { id: "overview", label: "Overview", icon: <HiOutlineInformationCircle size={18} /> },
      { id: "scores", label: "Critic Scores", icon: <HiOutlineStar size={18} /> },
      { id: "social", label: "Friend Activity", icon: <HiOutlineUsers size={18} /> },
    ]
    return type === 'tv'
      ? [...base, { id: "seasons", label: "Episodes", icon: <HiOutlineListBullet size={18} /> }]
      : base
  }, [type])

  // ── Media & ratings ────────────────────────────────────────
  const { data, isLoading, error: errorDetailData } = useMediaDetails(tmdbId, type)
  const showLoading = useDelayedLoading(isLoading)
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

  const handleRate = useCallback((score) => {
    if (!data) return
    mutateUploadRating({
      tmdb_id: tmdbId,
      score,
      title: data.title,
      poster_path: data.poster_path,
      type,
      runtime: type === 'movie' ? data.runtime : data.episode_run_time?.[0] ?? null,
      genre_ids: data.genres?.map(g => g.id) ?? null,
    })
  }, [mutateUploadRating, tmdbId, data, type])

  const handleDelete = useCallback(() => {
    mutateDeleteRating(tmdbId)
  }, [mutateDeleteRating, tmdbId])

  if (showLoading) return <MediaDetailSkeleton />
  if (errorDetailData) return <AlertBanner message='Error fetching data. Please try again' variant="danger" />
  if (!data) return null

  return (
    <div className="media-detail-grid">

      <div className="[grid-area:poster]">
        <MoviePoster
          src={`${import.meta.env.VITE_TMDB_IMAGE_URL}${data?.poster_path}`}
          alt={data?.title}
          className="w-full aspect-2/3 rounded-card"
        />
      </div>

      {/* Media details */}
      <div className="[grid-area:info]">
        <DetailCard media={data} id={id} />
      </div>

      {/* User actions + community score */}
      <ActionSection
        media={data}
        userRating={userRating}
        averageScore={averageScore}
        isWatchlisted={isWatchlisted}
        isFavorited={isFavorited}
        onRate={handleRate}
        onDelete={handleDelete}
      />

      {/* Tabbed Content Area */}
      <div className="[grid-area:about] flex flex-col gap-5 mb-14">

        {/* The Sliding Tabs Header */}
        <SlidingTabs
          tabs={DETAIL_TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="bg-surface-500 border border-surface-100 rounded-card p-6 min-h-[250px]">

          <TabPanel id="overview" activeTab={activeTab}>
            <OverviewTab data={data}></OverviewTab>
          </TabPanel>

          <TabPanel id="scores" activeTab={activeTab}>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-3">
              Platform Scores
            </h3>
            <ScoresTab imdbId={data?.imdb_id} />
          </TabPanel>

          <TabPanel id="social" activeTab={activeTab}>
            <FriendActivityTab tmdbId={tmdbId} />
          </TabPanel>

          {type === 'tv' && (
            <TabPanel id="seasons" activeTab={activeTab}>
              <SeasonsTab tvId={tmdbId} seasons={data?.seasons} />
            </TabPanel>
          )}
        </div>
      </div>
    </div>
  )
}