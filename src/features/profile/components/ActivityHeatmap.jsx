import { useMemo, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'
import AlertBanner from '@/components/ui/AlertBanner'
import BentoCardSkeleton from '@/components/ui/BentoCardSkeleton'
import { bucketFor } from '@/utils/heatmapBuckets'

function HeatmapTooltip({ label, children }) {
  const anchorRef = useRef(null)
  const [coords, setCoords] = useState(null)

  function handleEnter() {
    const rect = anchorRef.current.getBoundingClientRect()
    setCoords({ top: rect.top, left: rect.left + rect.width / 2 })
  }

  return (
    <>
      <div
        ref={anchorRef}
        className="inline-block"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setCoords(null)}
      >
        {children}
      </div>

      {coords && createPortal(
        // left is clamped by half the max tooltip width (8rem) so it never leaves the screen
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full w-max max-w-64 text-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 text-text-muted border border-white/10 pointer-events-none"
          style={{ top: coords.top - 8, left: `clamp(8rem, ${coords.left}px, calc(100vw - 8rem))` }}
        >
          {label}
        </div>,
        document.body
      )}
    </>
  )
}

const HEATMAP_LEGEND = [
  { className: 'bg-surface-100', label: 'No activity' },
  { className: 'bg-primary/30', label: 'Light' },
  { className: 'bg-primary/55', label: 'Moderate' },
  { className: 'bg-primary/80', label: 'Active' },
  { className: 'bg-primary-light', label: 'Peak' },
]

// Months per row below md (desktop is a single scrolling row). Change to grid-cols-4 etc. to retune.
const MONTHS_PER_ROW = 'grid-cols-3'

function formatWeekRange(weekStart) {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${startLabel} – ${endLabel}`
}

export default function ActivityHeatmap({ data, year, onYearChange, minYear, isError, isLoading }) {
  const maxCount = useMemo(() => {
    if (!data?.weeks?.length) return 0
    return Math.max(...data.weeks.map(w => w.count))
  }, [data])

  const monthGroups = useMemo(() => {
    if (!data?.weeks?.length) return []
    const groups = []
    let current = null

    data.weeks.forEach(week => {
      const month = new Date(week.weekStart).getMonth()
      if (!current || current.month !== month) {
        current = {
          month,
          label: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short' }),
          weeks: [],
        }
        groups.push(current)
      }
      current.weeks.push(week)
    })

    return groups
  }, [data])

  if (isLoading) return <BentoCardSkeleton className="bento-card--wide h-55" />

  if (isError) return <div className="bento-card bento-card--wide"><AlertBanner variant="danger" message="Failed to load activity heatmap." /></div>

  const joinedYear = data?.joinedAt ? new Date(data.joinedAt).getFullYear() : minYear
  const canGoBack = year > joinedYear
  const canGoForward = year < new Date().getFullYear()

  return (
    <div
      className="bento-card bento-card--wide [--heatmap-cell:10px] [--heatmap-gap:3px] md:[--heatmap-cell:clamp(8px,1.6vw,12px)] md:[--heatmap-gap:clamp(2px,0.4vw,4px)]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="bento-card__title">Activity</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onYearChange(year - 1)}
            disabled={!canGoBack}
            className="flex items-center justify-center w-11 h-11 md:w-auto md:h-auto md:p-1 rounded-md text-text-muted hover:bg-surface-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <HiChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-text w-10 text-center">{year}</span>
          <button
            onClick={() => onYearChange(year + 1)}
            disabled={!canGoForward}
            className="flex items-center justify-center w-11 h-11 md:w-auto md:h-auto md:p-1 rounded-md text-text-muted hover:bg-surface-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <HiChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-visible scrollbar-hide pb-1">
        <div className={`grid ${MONTHS_PER_ROW} gap-x-3 gap-y-4 md:flex md:items-start md:gap-3.5 md:min-w-max`}>
          {monthGroups.map(group => (
            <div key={`${group.month}-${group.weeks[0].weekStart}`} className="flex flex-col items-center">
              <span className="mb-1.5 text-[0.65rem] text-text-muted border border-surface-100 rounded-md px-1.5 py-0.5">
                {group.label}
              </span>
              <div className="flex" style={{ gap: 'var(--heatmap-gap)' }}>
                {group.weeks.map(week => (
                  <HeatmapTooltip
                    key={week.weekStart}
                    label={`${week.count} rating${week.count === 1 ? '' : 's'} — week of ${formatWeekRange(week.weekStart)}`}
                  >
                    <div
                      className={`rounded-sm ${bucketFor(week.count, maxCount)}`}
                      style={{ width: 'var(--heatmap-cell)', height: 'var(--heatmap-cell)' }}
                    />
                  </HeatmapTooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend: a single "Less ▪▪▪▪▪ More" strip below md, labelled dots from md up */}
      <div className="flex items-center justify-end gap-1 pt-3 mt-3 md:justify-start md:gap-5 md:pt-4 md:mt-2 md:flex-wrap border-t border-surface-100/20">
        <span className="md:hidden mr-0.5 text-[10px] text-text-muted">Less</span>
        {HEATMAP_LEGEND.map(({ className, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`block shrink-0 w-2.5 h-2.5 rounded-sm md:w-2 md:h-2 md:rounded-full ${className}`} />
            <span className="hidden md:inline text-xs text-text-muted">{label}</span>
          </div>
        ))}
        <span className="md:hidden ml-0.5 text-[10px] text-text-muted">More</span>
      </div>
    </div>
  )
}