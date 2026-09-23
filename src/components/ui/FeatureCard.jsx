import { memo } from 'react'

// `h-full` lets every card in a grid row match the tallest one; aspect-2/3
// still sets the row height when the content fits.
export const FeatureCardSkeleton = memo(function FeatureCardSkeleton() {
  return (
    <div className="aspect-2/3 h-full w-full rounded-[1.75rem] sm:rounded-4xl bg-surface-900 border border-surface-100/10 p-1.5 sm:p-2 animate-pulse flex flex-col">
      <div className="h-[72%] w-full rounded-[1.25rem] sm:rounded-3xl bg-surface-800" />
      <div className="flex-1 mt-4 mx-2">
        <div className="h-3 w-2/3 bg-surface-800 rounded mb-1.5" />
        <div className="h-3 w-1/2 bg-surface-800 rounded" />
      </div>
    </div>
  )
})

export default memo(function FeatureCard({
  heroBackground,
  heroContent,
  floatingIcon,
  children,
  onClick,
  className = ""
}) {
  return (
    <div
      onClick={onClick}
      className={`
        relative aspect-2/3 h-full w-full flex flex-col
        bg-surface-900 p-1.5 sm:p-2 rounded-[1.75rem] sm:rounded-4xl shadow-xl
        border border-surface-100/10 hover:border-surface-300
        cursor-pointer transition-colors duration-200
        ${className}
      `}
    >

      <div
        className="relative h-[72%] w-full rounded-[1.25rem] sm:rounded-3xl bg-cover bg-center shadow-inner overflow-hidden"
        style={{ background: heroBackground }}
      >
        {heroContent && (
          <div className="absolute inset-0 flex items-center justify-center">
            {heroContent}
          </div>
        )}
        {floatingIcon && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 sm:p-1.5 shadow-xl flex items-center justify-center">
            {floatingIcon}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1 sm:gap-1.5 px-1 sm:px-2 pt-2 sm:pt-2.5 pb-1 sm:pb-1.5">
        {children}
      </div>
    </div>
  )
})
