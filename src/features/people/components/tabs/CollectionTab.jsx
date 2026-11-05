import { memo, useMemo } from "react"
import { Link } from "react-router"
import { HiCheck, HiOutlineLockClosed } from "react-icons/hi2"

import useMediaState from "@/features/interactions/hooks/useMediaState"
import ScoreRing from "@/components/ui/ScoreRing"
import Chip from "@/components/ui/Chip"
import RatingBadge from "@/components/media/RatingBadge"
import SkeletonBox from "@/components/ui/SkeletonBox"
import usePersonShorts from "@/features/people/hooks/usePersonShorts"
import { isReleased } from "@/utils/tmdbItem"
import { defaultRole, isOwnTitle, REGULAR_EPISODES } from "@/features/people/hooks/usePerson"

// Collector levels by the share of the person's released titles the user has rated
const LEVELS = [['First look', 0], ['Fan', 0.25], ['Devotee', 0.5], ['Expert', 0.75], ['Completionist', 1]]
// primary-lighter: the readable violet at chip size
const REACHED_RGB = "151, 117, 250"
const STAT_LABEL = "text-xs text-text-muted"
// The title link is 20px tall: an invisible ::before pads its tap area vertically
const TAP_AREA = "relative before:absolute before:-inset-y-3 before:inset-x-0"
// What isOwnTitle counts, per role; one line on desktop, so the tab fits its card
const RULES = {
  acting: `Feature films and series with ${REGULAR_EPISODES}+ episodes count. Shorts, documentaries and cameos don't.`,
  directing: `Feature films and series with ${REGULAR_EPISODES}+ episodes count. Shorts and video compilations don't.`,
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
    <div className="flex flex-col gap-4">
      {/* On md+ the milestones sit under the text beside the ring, so the tab fits the card's height */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 md:gap-x-6 gap-y-4">
        <div className="md:row-span-2">
          <ScoreRing pct={(rated / total) * 100} label={rated} suffix={`/${total}`} tone="primary" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">Collector level</span>
          <span className="text-xl font-bold text-text leading-tight">{level?.label ?? 'Not started'}</span>
          <p className="text-sm text-text-muted">
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-surface-100">
        <div className="flex flex-col gap-1">
          <span className={STAT_LABEL}>Your average</span>
          {average
            ? <RatingBadge text={average} size={16} className="text-lg font-bold text-text" />
            : <span className="text-lg font-bold text-text-muted">–</span>}
        </div>
        <div className="flex flex-col gap-1">
          <span className={STAT_LABEL}>On your watchlist</span>
          <span className="text-lg font-bold text-text tabular-nums">{watchlisted}</span>
        </div>
        <div className="flex flex-col gap-1 col-span-2 md:col-span-1 min-w-0">
          <span className={STAT_LABEL}>Your highest rated</span>
          {top ? (
            <Link to={`/browse/${top.id}`} state={{ type: top.media_type }} className={`${TAP_AREA} flex items-center gap-2 min-w-0 text-sm font-semibold text-text hover:text-primary-light transition-colors`}>
              <span className="truncate">{top.title}</span>
              <RatingBadge text={top.score} size={14} className="shrink-0 text-text-muted" />
            </Link>
          ) : <span className="text-lg font-bold text-text-muted">–</span>}
        </div>
      </div>

      <p className="text-xs text-text-muted">{RULES[role]}</p>
    </div>
  )
}

export default memo(CollectionTab)
