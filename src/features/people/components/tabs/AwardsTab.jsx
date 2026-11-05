import { memo } from "react"
import { Link } from "react-router"
// Not hi2's trophy, which would join the entry chunk (see PersonTabs)
import { RiTrophyLine } from "react-icons/ri"

import usePersonAwards from "@/features/people/hooks/usePersonAwards"
import Chip from "@/components/ui/Chip"
import AlertBanner from "@/components/ui/AlertBanner"
import SkeletonBox from "@/components/ui/SkeletonBox"

const SECTION_HEADER_CLASS = "text-xs font-semibold text-text-muted uppercase tracking-widest"
// amber-300, the colour of the app's stars
const HONOUR_RGB = "252, 211, 77"
// The film links are 20px tall: an invisible ::before pads each tap area vertically
const TAP_AREA = "relative before:absolute before:-inset-y-3 before:inset-x-0"

const SKELETON_WIDTHS = ['w-1/2', 'w-full', 'w-5/6', 'w-3/4']

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// "2 wins · 8 nominations", "1 win", "3 nominations"
function summary({ wins, nominations }) {
  if (!wins) return plural(nominations, 'nomination')
  return wins === nominations ? plural(wins, 'win') : `${plural(wins, 'win')} · ${plural(nominations, 'nomination')}`
}

// Its Wikidata request starts when the tab first opens
function AwardsTab({ personId }) {
  const { data, isLoading, error } = usePersonAwards(personId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 delayed-reveal">
        {SKELETON_WIDTHS.map((w) => <SkeletonBox key={w} className={`h-4 rounded-full ${w}`} />)}
      </div>
    )
  }
  if (error) return <AlertBanner message="Couldn't load awards. Please try again." variant="danger" />

  const { tally, wins, honours } = data
  if (!tally.length && !honours.length) return <p className="text-sm text-text-muted">No major awards on record.</p>

  return (
    <div className="flex flex-col gap-5">
      {tally.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-start">
          {tally.map((t) => (
            <li key={t.name} className="flex items-center gap-3 min-w-0">
              <RiTrophyLine size={22} className="shrink-0 text-amber-300" aria-hidden="true" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-text">{t.name}</span>
                <span className="text-xs text-text-muted">{summary(t)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {wins.length > 0 && (
        <div>
          <h3 className={`${SECTION_HEADER_CLASS} mb-1`}>Wins</h3>
          <ul>
            {wins.map((w) => (
              <li key={w.key} className="flex gap-3 py-2.5 border-b border-surface-100/30 last:border-0 text-sm">
                <span className="w-10 shrink-0 text-text-muted tabular-nums">{w.year}</span>
                <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-3 flex-1 min-w-0">
                  <span className="text-text">{w.category} <span className="text-text-muted">· {w.ceremony}</span></span>
                  {w.film && (w.id ? (
                    <Link to={`/browse/${w.id}`} state={{ type: w.type }} className={`${TAP_AREA} font-medium text-primary-lighter hover:text-text transition-colors`}>
                      {w.film}
                    </Link>
                  ) : (
                    <span className="text-text-muted">{w.film}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {honours.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`${SECTION_HEADER_CLASS} mr-1`}>Honours</h3>
          {honours.map((h) => (
            <Chip key={h.label} size="sm" colorRgb={HONOUR_RGB} label={h.year ? `${h.label} · ${h.year}` : h.label} />
          ))}
        </div>
      )}

      <p className="text-[11px] text-text-muted">Source: Wikidata</p>
    </div>
  )
}

export default memo(AwardsTab)
