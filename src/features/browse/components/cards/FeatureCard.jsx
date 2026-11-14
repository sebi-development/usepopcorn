import { Link } from 'react-router'
import Chip from '@/components/ui/Chip'
import SkeletonBox from '@/components/ui/SkeletonBox'

// Shared with the skeleton. The hero sets the card's shape, the text adds what it needs, and the grid
// stretches every card in a row to the tallest one.
const SHELL_CLASS = "relative w-full flex flex-col bg-surface-900 p-1.5 sm:p-2 rounded-[1.75rem] sm:rounded-4xl border border-surface-100/10"
// Sized by the card's width, so a longer text below can't squeeze it: every hero in a row matches
const HERO_SHAPE = "aspect-9/10 w-full shrink-0 rounded-[1.25rem] sm:rounded-3xl"
const BODY_CLASS = "flex-1 flex flex-col gap-1 sm:gap-1.5 px-1 sm:px-2 pt-2 sm:pt-2.5 pb-1 sm:pb-1.5"
const TEXT = 'text-[10px] sm:text-sm text-text-muted group-hover:text-text transition-colors leading-tight line-clamp-2'

function FeatureCardSkeleton() {
  return (
    <div className={SHELL_CLASS}>
      <SkeletonBox className={HERO_SHAPE} />
      {/* A loaded card's rows (chip, one line, rating), so the row keeps its height when it loads */}
      <div className={BODY_CLASS}>
        <SkeletonBox className="h-6 w-2/3 rounded-full" />
        <SkeletonBox className="h-3 sm:h-4.5 w-3/4 rounded" />
        <SkeletonBox className="mt-auto h-4 sm:h-5 w-1/3 rounded" />
      </div>
    </div>
  )
}

// One Home card: a gradient hero with the theme's icon, a chip and a line of text. The whole card is
// one link; children add extra body content (a rating, the streak's weeks).
export default function FeatureCard({ theme, label, text, to, state, ariaLabel, hero, isLoading, children }) {
  if (isLoading) return <FeatureCardSkeleton />

  const { gradient, Icon, iconClass, rgb } = theme

  return (
    <div className={`${SHELL_CLASS} group shadow-xl hover:border-surface-300 transition-colors duration-200`}>
      <div className={`relative ${HERO_SHAPE} shadow-inner overflow-hidden`} style={{ background: gradient }}>
        {hero && <div className="absolute inset-0 flex items-center justify-center">{hero}</div>}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 shadow-xl flex items-center justify-center">
          <Icon className={`text-xl sm:text-3xl ${iconClass}`} />
        </div>
      </div>

      <div className={BODY_CLASS}>
        <Chip variant="glow" size="sm" colorRgb={rgb} className="self-start max-w-full">
          <span className="truncate">{label}</span>
        </Chip>
        {text && <p className={TEXT}>{text}</p>}
        {children}
      </div>

      <Link
        to={to}
        state={state}
        aria-label={ariaLabel ?? (text ? `${label}: ${text}` : label)}
        className="absolute inset-0 z-20 rounded-[1.75rem] sm:rounded-4xl"
      />
    </div>
  )
}
