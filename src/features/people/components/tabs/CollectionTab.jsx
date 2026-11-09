import { memo, useMemo } from "react"
import { Link } from "react-router"
import { HiCheck, HiOutlineLockClosed } from "react-icons/hi2"
import { BsBookmarkFill } from "react-icons/bs"
import { RiInformationLine } from "react-icons/ri"

import useMediaState from "@/features/interactions/hooks/useMediaState"
import ScoreRing from "@/components/ui/ScoreRing"
import Chip from "@/components/ui/Chip"
import StatChip from "@/components/media/StatChip"
import SkeletonBox from "@/components/ui/SkeletonBox"
import usePersonShorts from "@/features/people/hooks/usePersonShorts"
import { isReleased } from "@/utils/tmdbItem"
import { defaultRole, isOwnTitle, REGULAR_EPISODES } from "@/features/people/hooks/usePerson"

// Collector levels by the share of the person's released titles the user has rated
const LEVELS = [['First look', 0], ['Fan', 0.25], ['Devotee', 0.5], ['Expert', 0.75], ['Completionist', 1]]
// primary-lighter: the readable violet at chip size
const REACHED_RGB = "151, 117, 250"
const STAT_LABEL = "text-xs text-text-muted"
const STAT = "flex flex-col items-start gap-1.5 md:gap-1 min-w-0"
// The title link is only one chip tall: an invisible ::before pads its tap area vertically
const TAP_AREA = "relative before:absolute before:-inset-y-3 before:inset-x-0"
// What isOwnTitle counts, per role; one line on desktop, so the tab fits its card
const RULES = {
  acting: `Counts feature films and series with ${REGULAR_EPISODES}+ episodes. Shorts and cameos are excluded.`,
  directing: `Counts feature films, series they created and series with ${REGULAR_EPISODES}+ episodes. Shorts and video compilations are excluded.`,
}

// The user's progress through the person's own titles, from the cached media state
function useCollection(person, role, shortIds) {
  const { ratings, watchlist } = useMediaState()

  return useMemo(() => {
    // No shortIds (the request failed): shorts count rather than the tab staying blank
    const shorts = new Set(shortIds)
    const own = person[role].filter((c) => isOwnTitle(c, role, shorts))
    const credits = [...new Map(own.map((c) => [`${c.media_type}:${c.id}`, c])).values()]
    // An unreleased title can't be rated yet, so only released ones count
    const released = credits.filter(isReleased)
    const rated = released.filter((c) => ratings.has(c.id)).toSorted((a, b) => ratings.get(b.id) - ratings.get(a.id))
    const total = released.length

    return {
      total,
      rated: rated.length,
      average: rated.length ? (rated.reduce((sum, c) => sum + ratings.get(c.id), 0) / rated.length).toFixed(1) : null,
      top: rated[0] && { ...rated[0], score: ratings.get(rated[0].id) },
      watchlisted: credits.filter((c) => watchlist.has(c.id)).length,
      // With few titles thresholds meet; the higher level keeps the spot
      milestones: LEVELS
        .map(([label, share]) => ({ label, at: Math.max(1, Math.ceil(share * total)) }))
        .filter((m, i, all) => m.at !== all[i + 1]?.at),
    }
  }, [person, role, shortIds, ratings, watchlist])
}

function CollectionSkeleton() {
  return (
    <div className="flex items-center gap-4 md:gap-6 delayed-reveal">
      <ScoreRing tone="primary" loading />
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <SkeletonBox className="h-3 w-1/3 rounded-full" />
        <SkeletonBox className="h-6 w-1/2 rounded-full" />
        <SkeletonBox className="h-4 w-full rounded-full" />
      </div>
    </div>
  )
}

// Mounts on the tab's first open, which starts the shorts request
function CollectionTab({ person }) {
  const role = defaultRole(person)
  const shorts = usePersonShorts(person.id, role)
  const { total, rated, average, top, watchlisted, milestones } = useCollection(person, role, shorts.data)

  if (shorts.isLoading) return <CollectionSkeleton />
  if (!total) return <p className="text-sm text-text-muted">None of their titles is out yet, so there is nothing to collect.</p>

  const level = milestones.findLast((m) => rated >= m.at)
  const next = milestones.find((m) => rated < m.at)

  return (
    <div className="flex flex-col gap-4 md:gap-3">
      {/* On md+ the milestones sit under the text beside the ring, so the tab fits the card's height */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 md:gap-x-6 gap-y-4">
        <div className="md:row-span-2">
          <ScoreRing pct={(rated / total) * 100} label={rated} suffix={`/${total}`} tone="primary" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className={STAT_LABEL}>Collector level</span>
          <span className="mt-0.5 text-xl font-bold tracking-tight text-text leading-tight">{level?.label ?? 'Not started'}</span>
          <p className="mt-2 text-sm leading-snug text-text-muted">
            {!next ? `You've watched all ${total} of their titles.` : (
              <>
                {rated ? `You've watched ${rated} of their ${total} titles. Rate ${next.at - rated} more` : `Rate one of their ${total} titles`}
                {' '}to reach <strong className="font-semibold text-text">{next.label}</strong>.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 col-span-2 md:col-span-1">
          {milestones.map((m) => (rated >= m.at
            ? <Chip key={m.label} size="sm" colorRgb={REACHED_RGB} icon={HiCheck} label={m.label} />
            : <Chip key={m.label} variant="outline" size="sm" icon={HiOutlineLockClosed} label={`${m.label} · ${m.at}`} />
          ))}
        </div>
      </div>

      {/* On phones the highest-rated title gets a row of its own: a third of the width truncates it */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 md:pt-3 border-t border-surface-100">
        <div className={STAT}>
          <span className={STAT_LABEL}>Your average</span>
          <StatChip text={average ?? '–'} className="text-xs" />
        </div>
        <div className={STAT}>
          <span className={STAT_LABEL}>On your watchlist</span>
          <StatChip text={String(watchlisted)} icon={BsBookmarkFill} iconClassName="text-primary-light" className="text-xs" />
        </div>
        <div className={`${STAT} col-span-2 md:col-span-1`}>
          <span className={STAT_LABEL}>Your highest rated</span>
          {top ? (
            <Link to={`/browse/${top.id}`} state={{ type: top.media_type }} className={`${TAP_AREA} flex items-center gap-2 min-w-0 max-w-full text-sm font-semibold text-text hover:text-primary-light transition-colors`}>
              <StatChip text={top.score} className="text-xs" />
              <span className="truncate">{top.title}</span>
            </Link>
          ) : <StatChip text="–" className="text-xs" />}
        </div>
      </div>

      <div className="mt-2 flex items-start gap-2 rounded-lg border border-surface-100/60 px-2.5 py-1 text-[11px] leading-snug text-text-muted">
        <RiInformationLine size={13} className="mt-px shrink-0" aria-hidden="true" />
        <p>{RULES[role]}</p>
      </div>
    </div>
  )
}

export default memo(CollectionTab)
