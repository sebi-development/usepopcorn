import { useLocation, useParams } from "react-router"
import { useState, useMemo, useCallback } from "react"
import { HiOutlineInformationCircle, HiOutlineStar, HiOutlineUsers, HiOutlineListBullet } from "react-icons/hi2"

import useMediaDetails from "@/features/media_details/hooks/useMediaDetails"
import useAllSeasonDetails from "@/features/media_details/hooks/useAllSeasonDetails"
import useExternalApis from "@/features/media_details/hooks/useExternalApis"

import DetailCard from "@/features/media_details/components/DetailCard"
import MoviePoster from "@/components/media/MoviePoster"
import MediaDetailSkeleton from "@/features/media_details/components/MediaDetailSkeleton"
import AlertBanner from "@/components/ui/AlertBanner"
import ActionSectionContainer from "@/features/media_details/components/ActionSectionContainer"
import SlidingTabs from "@/components/ui/SlidingTabs"
import FriendActivityTab from "@/features/media_details/components/tabs/FriendActivityTab"
import ScoresTab from "@/features/media_details/components/tabs/ScoresTab"
import OverviewTab from "@/features/media_details/components/tabs/OverviewTab"
import SeasonsTab from "@/features/media_details/components/tabs/SeasonsTab"
import useDelayedLoading from "@/hooks/useDelayedLoading"
import getTmdbImageUrl from "@/utils/tmdbImage"

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
  const [activeTab, setActiveTab] = useState("overview")
  const [seasonsTabVisited, setSeasonsTabVisited] = useState(false)

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId)
    if (tabId === 'seasons') setSeasonsTabVisited(true)
  }, [])

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

  // ── Media ────────────────────────────────────────────────
  const { data, isLoading, error: errorDetailData } = useMediaDetails(tmdbId, type)
  const showLoading = useDelayedLoading(isLoading)

  // OPT-018: hoist external scores fetch to eliminate waterfall
  // (starts as soon as imdb_id is available, instead of waiting for ScoresTab to mount)
  const externalScores = useExternalApis(data?.imdb_id)

  // ── Bulk season fetch (OPT-010) — triggered on first Seasons tab click ──
  const { isLoading: isSeasonsLoading } = useAllSeasonDetails(
    tmdbId,
    data?.seasons,
    type === 'tv' && seasonsTabVisited
  )

  if (showLoading) return <MediaDetailSkeleton />
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

      {/* Tabbed Content Area */}
      <div className="[grid-area:about] flex flex-col gap-5 mb-14">

        {/* The Sliding Tabs Header */}
        <SlidingTabs
          tabs={DETAIL_TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        <div className="bg-surface-500 border border-surface-100 rounded-card p-6 min-h-62.5">

          <TabPanel id="overview" activeTab={activeTab}>
            <OverviewTab data={data}></OverviewTab>
          </TabPanel>

          <TabPanel id="scores" activeTab={activeTab}>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-3">
              Platform Scores
            </h3>
            <ScoresTab imdbId={data?.imdb_id} prefetchedQuery={externalScores} />
          </TabPanel>

          <TabPanel id="social" activeTab={activeTab}>
            <FriendActivityTab tmdbId={tmdbId} />
          </TabPanel>

          {type === 'tv' && (
            <TabPanel id="seasons" activeTab={activeTab}>
              <SeasonsTab tvId={tmdbId} seasons={data?.seasons} isBulkLoading={isSeasonsLoading} />
            </TabPanel>
          )}
        </div>
      </div>
    </div>
  )
}