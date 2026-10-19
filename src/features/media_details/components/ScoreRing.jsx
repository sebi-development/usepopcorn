import { memo } from 'react'

// Ring sizes by the tile they sit in: one score per tile (lg) or the Rotten Tomatoes pair (md).
// Below sm the tiles are compact rows, so the rings shrink with them.
const SIZES = {
  lg: 'size-16 text-base sm:size-28 sm:text-[1.625rem]',
  md: 'size-14 text-sm sm:size-20 sm:text-lg',
}

const TONES = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
}

// Lengths are in pathLength units (the circle is 100 long). A round cap reaches past its dash by
// half the stroke width (ARC_CAP for the 9-wide arc and track), so those dashes are inset by it to
// end where the score does. MARK is half the end mark's dash; its own cap rounds it into a pill.
const GAP = 4
const ARC_CAP = 1.8
const MARK = 0.3

// `pathLength` makes a dash [start, end] a plain slice of 0–100
function Dash({ start, end, ...props }) {
  const length = Math.max(end - start, 0.01)
  return (
    <circle
      cx="50"
      cy="50"
      r="40"
      fill="none"
      pathLength="100"
      strokeLinecap="round"
      strokeDasharray={`${length} ${100 - length}`}
      strokeDashoffset={-start}
      {...props}
    />
  )
}

// A score as a ring gauge: the arc runs clockwise from 6 o'clock to `pct` (0–100), a white mark
// sits in the gap after it and a dim track fills the rest. `tone` colours the arc; the caller picks
// it from the platform's own thresholds. `suffix` (e.g. %) is set smaller so the number keeps the
// room. The halo is a wider faint copy of the arc, not a blur filter, so the ring costs nothing
// when its card lifts on hover. While `loading` it is the bare track, pulsing: the same box as the
// loaded ring, so the score landing shifts nothing.
function ScoreRing({ pct, label, suffix, tone, size = 'lg', loading }) {
  const hasValue = !loading && pct != null
  const p = hasValue ? Math.min(Math.max(pct, 0), 100) : 0
  const arc = hasValue && p > 0 && (p >= 100
    ? { start: 0, end: 100 }
    : { start: Math.min(ARC_CAP, p / 2), end: Math.max(p - ARC_CAP, p / 2) })
  const trackStart = p > 0 ? p + 2 * GAP + ARC_CAP : 0
  const trackEnd = p > 0 ? 100 - GAP - ARC_CAP : 100
  const showTrack = trackEnd - trackStart > 0
  const showMark = hasValue && p > 0 && p < 100 - 2 * GAP

  return (
    <span className={`relative grid place-items-center shrink-0 ${SIZES[size]} ${TONES[tone] ?? ''} ${loading ? 'animate-pulse motion-reduce:animate-none' : ''}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full rotate-90" aria-hidden="true">
        {showTrack && <Dash start={trackStart} end={trackEnd} stroke="white" strokeOpacity={0.12} strokeWidth="9" />}
        {arc && (
          <>
            <Dash {...arc} stroke="currentColor" strokeOpacity={0.18} strokeWidth="16" />
            <Dash {...arc} stroke="currentColor" strokeWidth="9" />
          </>
        )}
        {showMark && <Dash start={p + GAP - MARK} end={p + GAP + MARK} stroke="white" strokeWidth="5" />}
      </svg>
      {!loading && (
        <span className={`relative font-black tabular-nums tracking-tight leading-none ${hasValue ? 'text-white' : 'text-text-muted'}`}>
          {hasValue ? label : '–'}
          {hasValue && suffix && <span className="text-[0.6em] font-bold">{suffix}</span>}
        </span>
      )}
    </span>
  )
}

export default memo(ScoreRing)
