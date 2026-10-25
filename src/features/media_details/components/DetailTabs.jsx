import { useState, useMemo, useCallback, lazy, Suspense, memo } from "react"
import { HiOutlineInformationCircle, HiOutlineStar, HiOutlineUsers, HiOutlineListBullet, HiOutlineSparkles } from "react-icons/hi2"

import useAllSeasonDetails from "@/features/media_details/hooks/useAllSeasonDetails"
import SlidingTabs from "@/components/ui/SlidingTabs"
import SkeletonBox from "@/components/ui/SkeletonBox"
import FriendActivityTab from "@/features/media_details/components/tabs/FriendActivityTab"
import ScoresTab from "@/features/media_details/components/tabs/ScoresTab"
import OverviewTab from "@/features/media_details/components/tabs/OverviewTab"
import SeasonsTab from "@/features/media_details/components/tabs/SeasonsTab"

const PANEL_CARD_CLASS = "bg-surface-500 border border-surface-100 rounded-card p-4 md:p-6 min-h-62.5"
const UNBOXED_TABS = new Set(["similar", "scores"])

// Its chunk loads on the first click of the tab
const SimilarTab = lazy(() => import("@/features/media_details/components/tabs/SimilarTab"))

function SimilarFallback() {
  return (
    <div className="flex gap-3 overflow-hidden md:px-6 delayed-reveal">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBox key={i} className="flex-none w-32 sm:w-40 md:w-44 aspect-2/3 rounded-card" />
      ))}
    </div>
  )
}

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

// Owns the tab state, so a tab switch re-renders this area only, not DetailPage
function DetailTabs({ media, tmdbId, type }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [seasonsTabVisited, setSeasonsTabVisited] = useState(false)
  const [tabSwitched, setTabSwitched] = useState(false)

  // A cached title keeps this mounted, so reset during render: it never paints a tab it may not have
  const [tabsForId, setTabsForId] = useState(tmdbId)
  if (tabsForId !== tmdbId) {
    setTabsForId(tmdbId)
    setActiveTab("overview")
    setSeasonsTabVisited(false)
    setTabSwitched(false)
  }

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId)
    setTabSwitched(true)
    if (tabId === 'seasons') setSeasonsTabVisited(true)
  }, [])

  // Titles TMDB has no recommendations for get no Similar tab
  const hasSimilar = media.similar?.length > 0

  const tabs = useMemo(() => {
    const list = [
      { id: "overview", label: "Overview", shortLabel: "Overview", icon: <HiOutlineInformationCircle size={18} /> },
      { id: "scores", label: "Critic Scores", shortLabel: "Scores", icon: <HiOutlineStar size={18} /> },
      { id: "social", label: "Friend Activity", shortLabel: "Friends", icon: <HiOutlineUsers size={18} /> },
    ]
    if (hasSimilar) list.push({ id: "similar", label: "Similar Titles", shortLabel: "Similar", icon: <HiOutlineSparkles size={18} /> })
    if (type === 'tv') list.push({ id: "seasons", label: "Episodes", shortLabel: "Episodes", icon: <HiOutlineListBullet size={18} /> })
    return list
  }, [type, hasSimilar])

  // Bulk season fetch, enabled by the first Seasons click
  const { isLoading: isSeasonsLoading } = useAllSeasonDetails(
    tmdbId,
    media.seasons,
    type === 'tv' && seasonsTabVisited
  )

  return (
    <div className="[grid-area:about] flex flex-col gap-5 mb-8 md:mb-14">

      <SlidingTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        fill
      />

      {/* Tabs sit in a card, except those made of cards themselves */}
      <div className={UNBOXED_TABS.has(activeTab) ? undefined : PANEL_CARD_CLASS}>

        <TabPanel id="overview" activeTab={activeTab} animate={tabSwitched}>
          <OverviewTab data={media}></OverviewTab>
        </TabPanel>

        <TabPanel id="scores" activeTab={activeTab} animate={tabSwitched}>
          <ScoresTab media={media} />
        </TabPanel>

        <TabPanel id="social" activeTab={activeTab} animate={tabSwitched}>
          <FriendActivityTab tmdbId={tmdbId} />
        </TabPanel>

        {hasSimilar && (
          <TabPanel id="similar" activeTab={activeTab} animate={tabSwitched}>
            <div className="md:-ml-6">
              <Suspense fallback={<SimilarFallback />}>
                <SimilarTab items={media.similar} type={type} />
              </Suspense>
            </div>
          </TabPanel>
        )}

        {type === 'tv' && (
          <TabPanel id="seasons" activeTab={activeTab} animate={tabSwitched}>
            <SeasonsTab tvId={tmdbId} seasons={media.seasons} isBulkLoading={isSeasonsLoading} />
          </TabPanel>
        )}
      </div>
    </div>
  )
}

export default memo(DetailTabs)
