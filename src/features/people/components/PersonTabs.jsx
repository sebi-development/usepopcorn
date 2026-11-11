import { memo, useState } from "react"
import { HiOutlineUser, HiOutlineChartBar } from "react-icons/hi2"
import { RiTrophyLine } from "react-icons/ri"

import useTabs from "@/hooks/useTabs"
import SlidingTabs from "@/components/ui/SlidingTabs"
import TabPanel from "@/components/ui/TabPanel"
import InfoNote from "@/components/ui/InfoNote"
import CollectionTab from "@/features/people/components/tabs/CollectionTab"
import AwardsTab from "@/features/people/components/tabs/AwardsTab"

const TABS = [
  { id: "bio", label: "Biography", shortLabel: "Bio", icon: <HiOutlineUser size={18} /> },
  { id: "collection", label: "Your collection", shortLabel: "Collection", icon: <HiOutlineChartBar size={18} /> },
  { id: "awards", label: "Awards", shortLabel: "Awards", icon: <RiTrophyLine size={18} /> },
]

const PANEL_CLASS = "relative md:flex-1 md:min-h-60 bg-surface-500 border border-surface-100 rounded-card"
// On md+ Biography and Awards can run long, so they scroll within the photo's height. The collection
// is laid out to fit: it stays in flow, and where it can't fit (narrow md widths) the card grows.
const FIT_TAB = "collection"
const SCROLL_CLASS = "p-4 md:p-6 md:pb-10 md:absolute md:inset-0 md:overflow-y-auto"
const FIT_CLASS = "p-4 md:px-6 md:py-5"
const FADE_CLASS = "hidden md:block absolute inset-x-0 bottom-0 h-10 rounded-b-card bg-linear-to-t from-surface-500 pointer-events-none"
const TAP_AREA = "relative before:absolute before:-inset-3"
const BIO_CLAMP_CHARS = 320

function Bio({ text }) {
  const [open, setOpen] = useState(false)

  if (!text) return <InfoNote>No biography available.</InfoNote>

  const long = text.length > BIO_CLAMP_CHARS
  return (
    <>
      <p className={`text-sm text-text leading-relaxed whitespace-pre-line ${long && !open ? 'line-clamp-8 md:line-clamp-none' : ''}`}>
        {text}
      </p>
      {long && (
        <button type="button" onClick={() => setOpen((v) => !v)} className={`${TAP_AREA} md:hidden mt-2 text-sm font-medium text-primary-lighter cursor-pointer`}>
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
    </>
  )
}

// Owns the tab state, so a tab switch re-renders this card only
function PersonTabs({ person, className = "" }) {
  const { activeTab, switched, selectTab } = useTabs(person.id, "bio")
  const fits = activeTab === FIT_TAB

  return (
    <div className={`flex flex-col gap-3 md:gap-4 min-w-0 ${className}`}>
      <SlidingTabs tabs={TABS} activeTab={activeTab} onChange={selectTab} fill />

      <div className={PANEL_CLASS}>
        <div className={fits ? FIT_CLASS : SCROLL_CLASS}>
          <TabPanel id="bio" activeTab={activeTab} animate={switched}>
            <Bio key={person.id} text={person.biography} />
          </TabPanel>
          <TabPanel id="collection" activeTab={activeTab} animate={switched}>
            <CollectionTab person={person} />
          </TabPanel>
          <TabPanel id="awards" activeTab={activeTab} animate={switched}>
            <AwardsTab personId={person.id} />
          </TabPanel>
        </div>
        {!fits && <div className={FADE_CLASS} aria-hidden="true" />}
      </div>
    </div>
  )
}

export default memo(PersonTabs)
