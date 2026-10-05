import { useLocation, useParams } from "react-router"
import { useState, useMemo, useCallback, useEffect, useRef, lazy, Suspense } from "react"
import { HiOutlineInformationCircle, HiOutlineStar, HiOutlineUsers, HiOutlineListBullet, HiOutlineSparkles } from "react-icons/hi2"

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
import SkeletonBox from "@/components/ui/SkeletonBox"
import getTmdbImageUrl from "@/utils/tmdbImage"

const SECTION_HEADER_CLASS = "text-sm font-semibold text-text-muted uppercase tracking-widest mb-3"

// Few users open it, so its chunk is only requested on the first click of the tab
const SimilarTab = lazy(() => import("@/features/media_details/components/tabs/SimilarTab"))

// Shown only if the chunk takes longer than the usual loading delay (delayed-reveal)
function SimilarFallback() {
  return (
    <div className="flex gap-3 overflow-hidden md:px-6 delayed-reveal">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBox key={i} className="flex-none w-32 sm:w-40 md:w-44 aspect-2/3 rounded-card" />
      ))}
    </div>
  )
}

// `animate` fades the panel in, but only after a tab click: the panel shown on arrival appears at once
function TabPanel({ id, activeTab, animate, children }) {
  if (activeTab !== id) return null

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={animate ? "animate-[overlay-fade_250ms_ease-out] motion-reduce:animate-none" : undefined}
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
  const [tabSwitched, setTabSwitched] = useState(false)

  // The route element stays mounted when :id changes (e.g. a card in the Similar tab), so the
  // tab state is reset during render, before the new title paints with a tab it may not have
  const [tabsForId, setTabsForId] = useState(tmdbId)
  if (tabsForId !== tmdbId) {
    setTabsForId(tmdbId)
    setActiveTab("overview")
    setSeasonsTabVisited(false)
    setTabSwitched(false)
  }

  // ...and the window keeps its scroll position, so the new title would open mid-page
  const scrolledForId = useRef(tmdbId)
  useEffect(() => {
    if (scrolledForId.current === tmdbId) return
    scrolledForId.current = tmdbId
    window.scrollTo(0, 0)
  }, [tmdbId])

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId)
    setTabSwitched(true)
    if (tabId === 'seasons') setSeasonsTabVisited(true)
  }, [])

  // ── Media ────────────────────────────────────────────────
  const { data, isLoading, error: errorDetailData } = useMediaDetails(tmdbId, type)

  // Titles TMDB has no recommendations for get no Similar tab
  const hasSimilar = data?.similar?.length > 0

  const DETAIL_TABS = useMemo(() => {
    const tabs = [
      { id: "overview", label: "Overview", shortLabel: "Overview", icon: <HiOutlineInformationCircle size={18} /> },
      { id: "scores", label: "Critic Scores", shortLabel: "Scores", icon: <HiOutlineStar size={18} /> },
      { id: "social", label: "Friend Activity", shortLabel: "Friends", icon: <HiOutlineUsers size={18} /> },
    ]
    if (hasSimilar) tabs.push({ id: "similar", label: "Similar Titles", shortLabel: "Similar", icon: <HiOutlineSparkles size={18} /> })
    if (type === 'tv') tabs.push({ id: "seasons", label: "Episodes", shortLabel: "Episodes", icon: <HiOutlineListBullet size={18} /> })
    return tabs
  }, [type, hasSimilar])

  // Hoist external scores fetch to eliminate waterfall
  // (starts as soon as imdb_id is available, instead of waiting for ScoresTab to mount)
  const externalScores = useExternalApis(data?.imdb_id)

  // ── Bulk season fetch — triggered on first Seasons tab click ──
  const { isLoading: isSeasonsLoading } = useAllSeasonDetails(
    tmdbId,
    data?.seasons,
    type === 'tv' && seasonsTabVisited
  )

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

      {/* Tabbed Content Area */}
      <div className="[grid-area:about] flex flex-col gap-5 mb-8 md:mb-14">

        {/* The Sliding Tabs Header */}
        <SlidingTabs
          tabs={DETAIL_TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
          fill
        />

        <div className="bg-surface-500 border border-surface-100 rounded-card p-4 md:p-6 min-h-62.5">

          <TabPanel id="overview" activeTab={activeTab} animate={tabSwitched}>
            <OverviewTab data={data}></OverviewTab>
          </TabPanel>

          <TabPanel id="scores" activeTab={activeTab} animate={tabSwitched}>
            <h3 className={SECTION_HEADER_CLASS}>Platform Scores</h3>
            <ScoresTab imdbId={data?.imdb_id} prefetchedQuery={externalScores} />
          </TabPanel>

          <TabPanel id="social" activeTab={activeTab} animate={tabSwitched}>
            <FriendActivityTab tmdbId={tmdbId} />
          </TabPanel>

          {hasSimilar && (
            <TabPanel id="similar" activeTab={activeTab} animate={tabSwitched}>
              <h3 className={SECTION_HEADER_CLASS}>Similar Titles</h3>
              {/* Bleeds the row to the card's edges at md, as MediaRow's own margins already do below md */}
              <div className="md:-mx-6">
                <Suspense fallback={<SimilarFallback />}>
                  <SimilarTab items={data.similar} type={type} />
                </Suspense>
              </div>
            </TabPanel>
          )}

          {type === 'tv' && (
            <TabPanel id="seasons" activeTab={activeTab} animate={tabSwitched}>
              <SeasonsTab tvId={tmdbId} seasons={data?.seasons} isBulkLoading={isSeasonsLoading} />
            </TabPanel>
          )}
        </div>
      </div>
    </div>
  )
}