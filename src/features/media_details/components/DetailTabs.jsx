import { useMemo, lazy, Suspense, memo } from "react"
import { HiOutlineInformationCircle, HiOutlineStar, HiOutlineUsers, HiOutlineListBullet, HiOutlineSparkles } from "react-icons/hi2"
import { TbMasksTheater } from "react-icons/tb"

import useAllSeasonDetails from "@/features/media_details/hooks/useAllSeasonDetails"
import useTabs from "@/hooks/useTabs"
import SlidingTabs from "@/components/ui/SlidingTabs"
import TabPanel from "@/components/ui/TabPanel"
import SkeletonBox from "@/components/ui/SkeletonBox"
import FriendActivityTab from "@/features/media_details/components/tabs/FriendActivityTab"
import ScoresTab from "@/features/media_details/components/tabs/ScoresTab"
import OverviewTab from "@/features/media_details/components/tabs/OverviewTab"
import SeasonsTab from "@/features/media_details/components/tabs/SeasonsTab"

const PANEL_CARD_CLASS = "bg-surface-500 border border-surface-100 rounded-card p-4 md:p-6 min-h-62.5"
const UNBOXED_TABS = new Set(["cast", "similar", "scores"])

// Their chunks load on the first click of the tab
const CastTab = lazy(() => import("@/features/media_details/components/tabs/CastTab"))
const SimilarTab = lazy(() => import("@/features/media_details/components/tabs/SimilarTab"))

function RowFallback() {
  return (
    <div className="flex gap-3 overflow-hidden md:px-6 delayed-reveal">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBox key={i} className="flex-none w-32 sm:w-40 md:w-44 aspect-2/3 rounded-card" />
      ))}
    </div>
  )
}

// Owns the tab state, so a tab switch re-renders this area only, not DetailPage
function DetailTabs({ media, tmdbId, type }) {
  const { activeTab, switched: tabSwitched, visited, selectTab } = useTabs(tmdbId, "overview")

  // Titles TMDB has no recommendations for get no Similar tab
  const hasSimilar = media.similar?.length > 0
  // A movie's cast is known from its details; a series' only once the tab fetches it
  const hasCast = type === 'tv' || media.cast?.length > 0

  const tabs = useMemo(() => {
    const list = [
      // "Info" on phones: six series tabs must fit a 320px screen
      { id: "overview", label: "Overview", shortLabel: "Info", icon: <HiOutlineInformationCircle size={18} /> },
      hasCast && { id: "cast", label: "Cast", shortLabel: "Cast", icon: <TbMasksTheater size={18} /> },
      { id: "scores", label: "Critic Scores", shortLabel: "Scores", icon: <HiOutlineStar size={18} /> },
      { id: "social", label: "Friend Activity", shortLabel: "Friends", icon: <HiOutlineUsers size={18} /> },
      hasSimilar && { id: "similar", label: "Similar Titles", shortLabel: "Similar", icon: <HiOutlineSparkles size={18} /> },
      type === 'tv' && { id: "seasons", label: "Episodes", shortLabel: "Episodes", icon: <HiOutlineListBullet size={18} /> },
    ]
    return list.filter(Boolean)
  }, [type, hasSimilar, hasCast])

  // Bulk season fetch, enabled by the first Seasons click
  const { isLoading: isSeasonsLoading } = useAllSeasonDetails(
    tmdbId,
    media.seasons,
    type === 'tv' && visited.has('seasons')
  )

  return (
    <div className="[grid-area:about] flex flex-col gap-5 mb-8 md:mb-14">

      <SlidingTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={selectTab}
        fill
      />

      {/* Tabs sit in a card, except those made of cards themselves */}
      <div className={UNBOXED_TABS.has(activeTab) ? undefined : PANEL_CARD_CLASS}>

        <TabPanel id="overview" activeTab={activeTab} animate={tabSwitched}>
          <OverviewTab data={media}></OverviewTab>
        </TabPanel>

        {hasCast && (
          <TabPanel id="cast" activeTab={activeTab} animate={tabSwitched}>
            <div className="md:-ml-6">
              <Suspense fallback={<RowFallback />}>
                <CastTab media={media} tmdbId={tmdbId} type={type} />
              </Suspense>
            </div>
          </TabPanel>
        )}

        <TabPanel id="scores" activeTab={activeTab} animate={tabSwitched}>
          <ScoresTab media={media} />
        </TabPanel>

        <TabPanel id="social" activeTab={activeTab} animate={tabSwitched}>
          <FriendActivityTab tmdbId={tmdbId} />
        </TabPanel>

        {hasSimilar && (
          <TabPanel id="similar" activeTab={activeTab} animate={tabSwitched}>
            <div className="md:-ml-6">
              <Suspense fallback={<RowFallback />}>
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
