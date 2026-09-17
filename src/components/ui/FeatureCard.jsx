import { memo } from 'react'

export default memo(function FeatureCard({ 
  heroBackground, 
  floatingIcon, 
  children,
  onClick,
  className = ""
}) {
  return (
    <div 
      onClick={onClick}
      className={`
        relative aspect-2/3 w-full flex flex-col 
        bg-surface-900 p-1.5 sm:p-2 rounded-[1.75rem] sm:rounded-4xl shadow-xl
        border border-surface-100/10
        cursor-pointer transition-transform duration-300 hover:scale-[1.03] hover:z-10
        ${className}
      `}
    >

      <div 
        className="relative h-[70%] w-full rounded-[1.25rem] sm:rounded-3xl bg-cover bg-center shadow-inner overflow-hidden"
        style={{ background: heroBackground }}
      >
        {floatingIcon && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-surface-900/90 backdrop-blur-md p-1 sm:p-1.5 shadow-xl flex items-center justify-center">
            {floatingIcon}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col px-2 pt-2.5 sm:pt-3 pb-1 sm:pb-2">
        {children}
      </div>
    </div>
  )
})