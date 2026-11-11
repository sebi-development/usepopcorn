import { memo } from 'react'
import { HiOutlineLockClosed } from 'react-icons/hi2'

import getScoreTier from '@/utils/scoreTier'

// `locked`: not released yet. Same size as the empty circle, so nothing shifts.
function Score({ value, locked = false }) {
  if (locked) return (
    <div
      role="img"
      aria-label="Rating locked until release"
      className="flex items-center justify-center w-36 h-36 rounded-full border-2 border-dashed border-white/10 bg-surface-900/30 text-white/30"
    >
      <HiOutlineLockClosed size={32} />
    </div>
  )

  const hasValue = value !== undefined && value !== null;
  const displayValue = hasValue ? value : "--";

  const activeTier = getScoreTier(value)
  const { icon } = activeTier

  // One size with or without the icon, so the average arriving shifts nothing below it
  const textSize = icon ? "text-3xl" : "text-4xl"

  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-0.5 w-36 h-36 border-2 font-black tracking-tighter
        rounded-full bg-surface-900/50 shadow-inner backdrop-blur-md
        ${textSize}
        ${activeTier.classes}
      `}
    >
      {icon && (
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
