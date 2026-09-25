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
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-surface-100 text-text-muted border border-white/10 pointer-events-none"
          style={{ top: coords.top - 8, left: coords.left }}
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
      className="bento-card bento-card--wide"
      style={{
        '--heatmap-cell': 'clamp(8px, 1.6vw, 12px)',
        '--heatmap-gap': 'clamp(2px, 0.4vw, 4px)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="bento-card__title">Activity</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onYearChange(year - 1)}
            disabled={!canGoBack}
            className="p-1 rounded-md text-text-muted hover:bg-surface-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <HiChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-text w-10 text-center">{year}</span>
          <button
            onClick={() => onYearChange(year + 1)}
            disabled={!canGoForward}
            className="p-1 rounded-md text-text-muted hover:bg-surface-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <HiChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-visible scrollbar-hide pb-1">
        <div className="flex items-start" style={{ gap: '14px', minWidth: 'max-content' }}>
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

      {/* Legend */}
      <div className="flex items-center gap-5 pt-4 mt-2 border-t border-surface-100/20 flex-wrap">
        {HEATMAP_LEGEND.map(({ className, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`block shrink-0 w-2 h-2 rounded-full ${className}`} />
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}