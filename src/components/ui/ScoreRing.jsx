import { memo } from 'react'

const SIZES = {
  lg: 'size-16 text-base sm:size-28 sm:text-[1.625rem]',
  md: 'size-14 text-sm sm:size-20 sm:text-lg',
}

const TONES = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  primary: 'text-primary-lighter',
}

// In pathLength units (the circle is 100 long). Round caps overhang their dash by ARC_CAP, so
// dashes are inset by it to end exactly at the score.
const GAP = 4
const ARC_CAP = 1.8
const MARK = 0.3

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

// Cuts the shimmer down to the track's band (r 40, stroke 9 in the 100 box), so loading shows an empty ring
const TRACK_BAND = 'radial-gradient(closest-side, transparent 71%, #000 71.5%, #000 88.5%, transparent 89%)'
const TRACK_MASK = { maskImage: TRACK_BAND, WebkitMaskImage: TRACK_BAND }

function ScoreRing({ pct, label, suffix, tone, size = 'lg', loading }) {
  if (loading) return <span aria-hidden="true" className={`skeleton-shimmer rounded-full shrink-0 ${SIZES[size]}`} style={TRACK_MASK} />

  const hasValue = pct != null
  const p = hasValue ? Math.min(Math.max(pct, 0), 100) : 0
  const arc = hasValue && p > 0 && (p >= 100
    ? { start: 0, end: 100 }
    : { start: Math.min(ARC_CAP, p / 2), end: Math.max(p - ARC_CAP, p / 2) })
  const trackStart = p > 0 ? p + 2 * GAP + ARC_CAP : 0
  const trackEnd = p > 0 ? 100 - GAP - ARC_CAP : 100
  const showTrack = trackEnd - trackStart > 0
  const showMark = hasValue && p > 0 && p < 100 - 2 * GAP

  return (
    <span className={`relative grid place-items-center shrink-0 ${SIZES[size]} ${TONES[tone] ?? ''}`}>
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
      <span className={`relative font-black tabular-nums tracking-tight leading-none ${hasValue ? 'text-white' : 'text-text-muted'}`}>
        {hasValue ? label : '–'}
        {hasValue && suffix && <span className="text-[0.6em] font-bold">{suffix}</span>}
      </span>
    </span>
  )
}

export default memo(ScoreRing)
