import { memo } from 'react'

import tier1 from '@/assets/rating-icons/rating-icon-tier1.avif?no-inline'
import tier2 from '@/assets/rating-icons/rating-icon-tier2.avif?no-inline'
import tier3 from '@/assets/rating-icons/rating-icon-tier3.avif?no-inline'
import tier4 from '@/assets/rating-icons/rating-icon-tier4.avif?no-inline'

const SCORE_TIERS = [
  { min: 80, classes: "border-primary-light/50 text-primary-light shadow-inner shadow-primary-light/15", icon: { src: tier1, w: 96, h: 124, label: "Must watch" } },
  { min: 60, classes: "border-white/20 text-white/90", icon: { src: tier2, w: 96, h: 110, label: "Good" } },
  { min: 40, classes: "border-white/20 text-white/90", icon: { src: tier3, w: 96, h: 111, label: "Mixed" } },
  { min: 20, classes: "border-danger/40 text-danger", icon: { src: tier4, w: 96, h: 110, label: "Weak" } },
  { min: 0, classes: "border-danger/40 text-danger", icon: null }, // TODO: tier 5 icon (spilled bucket) is coming from the designer
  { min: -Infinity, classes: "border-white/5 text-white/40", icon: null }
];

// `display` overrides the shown text while `value` (0-100) still picks the tier, so the card badge can
// show the 1-10 score someone gave and still use the shared tier colours.
function Score({ value, size = 'md', display }) {
  const hasValue = value !== undefined && value !== null
  const displayValue = display ?? (hasValue ? value : "--");

  const activeTier = SCORE_TIERS.find(tier =>
    hasValue ? value >= tier.min : tier.min === -Infinity
  );

  // Compact card badge: no icon, no blur, no transition (rendered on many cards)
  if (size === 'xs') {
    return (
      <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-surface-900/80 border text-xs font-bold ${activeTier.classes}`}>
        {displayValue}
      </div>
    )
  }

  const { icon } = activeTier
  const isSm = size === 'sm'

  // The circle grows when it carries an icon so the popcorn sits above the number
  const sizeClasses = isSm
    ? "w-14 h-14 text-lg border-[1.5px]"
    : icon
      ? "w-36 h-36 text-3xl border-2"
      : "w-28 h-28 text-4xl border-2";

  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-0.5 font-black tracking-tighter
        rounded-full bg-surface-900/50 backdrop-blur-md shadow-inner
        transition-all duration-300
        ${sizeClasses}
        ${activeTier.classes}
      `}
    >
      {icon && !isSm && (
        <img
          src={icon.src}
          width={icon.w}
          height={icon.h}
          alt={icon.label}
          decoding="async"
          className="h-14 w-auto object-contain"
        />
      )}
      {displayValue}
    </div>
  );
}
export default memo(Score);
