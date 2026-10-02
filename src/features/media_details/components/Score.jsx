import { memo } from 'react'

import tier1 from '@/assets/rating-icons/rating-icon-tier1.avif?no-inline'
import tier2 from '@/assets/rating-icons/rating-icon-tier2.avif?no-inline'
import tier3 from '@/assets/rating-icons/rating-icon-tier3.avif?no-inline'
import tier4 from '@/assets/rating-icons/rating-icon-tier4.avif?no-inline'
import tier5 from '@/assets/rating-icons/rating-icon-tier5.avif?no-inline'

const SCORE_TIERS = [
  { min: 85, classes: "border-primary-light/50 text-primary-light shadow-inner shadow-primary-light/15", icon: { src: tier1, w: 96, h: 124, label: "Must watch" } },
  { min: 75, classes: "border-white/20 text-white/90", icon: { src: tier2, w: 96, h: 110, label: "Good" } },
  { min: 55, classes: "border-white/20 text-white/90", icon: { src: tier3, w: 96, h: 111, label: "Mixed" } },
  { min: 30, classes: "border-danger/40 text-danger", icon: { src: tier4, w: 96, h: 110, label: "Weak" } },
  { min: 0, classes: "border-danger/40 text-danger", icon: { src: tier5, w: 96, h: 95, label: "Terrible" } },
  { min: -Infinity, classes: "border-white/5 text-white/40", icon: null }
];

function Score({ value, size = 'md' }) {
  const displayValue = value !== undefined && value !== null ? value : "--";

  const activeTier = SCORE_TIERS.find(tier =>
    displayValue === "--" ? tier.min === -Infinity : displayValue >= tier.min
  );

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
