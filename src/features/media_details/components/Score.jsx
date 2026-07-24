import { memo } from 'react'

const SCORE_TIERS = [
  { min: 80, classes: "border-primary-light/50 text-primary-light shadow-inner shadow-primary-light/15" },
  { min: 50, classes: "border-white/20 text-white/90" },
  { min: 0, classes: "border-danger/40 text-danger" },
  { min: -Infinity, classes: "border-white/5 text-white/40" }
];

function Score({ value, size = 'md' }) {
  const displayValue = value !== undefined && value !== null ? value : "--";

  const activeTier = SCORE_TIERS.find(tier => 
    displayValue === "--" ? tier.min === -Infinity : displayValue >= tier.min
  );

  const sizeClasses = size === 'sm' 
    ? "w-14 h-14 text-lg border-[1.5px]" 
    : "w-28 h-28 text-4xl border-2";

  return (
    <div
      className={`
        flex items-center justify-center font-black tracking-tighter
        rounded-full bg-surface-900/50 backdrop-blur-md shadow-inner
        transition-all duration-300
        ${sizeClasses}
        ${activeTier.classes}
      `}
    >
      {displayValue}
    </div>
  );
}
export default memo(Score);