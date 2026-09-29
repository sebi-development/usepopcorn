import { useState, useRef, useEffect, useCallback } from "react"

export default function SlidingTabs({
  tabs,
  activeTab,
  onChange,
  duration = 300,
  className = "",
  pillClassName = "",
  tabClassName = "",
  containerPadding = "p-1",
  containerGap = "gap-1",
  containerRadius = "rounded-full",
  pillRadius = "rounded-full",
  tabRadius = "rounded-full",
  // fill: below sm the tabs share the full width (icon over a short label) instead of
  // sizing to their content. Tabs may carry a `shortLabel` shown only below sm.
  fill = false,
}) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const [hasMeasured, setHasMeasured] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const tabRefs = useRef([])
  const containerRef = useRef(null)

  const measureActiveTab = useCallback(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
    const activeElement = tabRefs.current[activeIndex]
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      })
      setHasMeasured(true)
    }
  }, [tabs, activeTab])

  useEffect(() => {
    measureActiveTab()
  }, [measureActiveTab])

  useEffect(() => {
    if (hasMeasured && !isReady) {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsReady(true)
        })
      })
      return () => cancelAnimationFrame(frame)
    }
  }, [hasMeasured, isReady])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(() => measureActiveTab())
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [measureActiveTab])

  return (
    <div
      ref={containerRef}
      className={`relative flex ${fill ? "w-full sm:w-fit" : "w-fit"} bg-surface-900/40 backdrop-blur-md border border-white/5 ${containerPadding} ${containerGap} ${containerRadius} ${className}`}
    >
      <div
        className={`absolute top-1 bottom-1 bg-white/10 backdrop-blur-sm border border-white/10 shadow-sm ${pillRadius} ${pillClassName}`}
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          opacity: hasMeasured ? 1 : 0,
          transitionProperty: "left, width",
          transitionDuration: isReady ? `${duration}ms` : "0ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[index] = el)}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            aria-selected={isActive}
            className={`
              relative z-10 flex items-center font-medium
              ${fill
                ? "flex-1 sm:flex-none flex-col sm:flex-row justify-center gap-0.5 sm:gap-1.5 px-1 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm"
                : "gap-1.5 px-4 py-2 text-sm"}
              transition-colors duration-200 cursor-pointer
              disabled:opacity-40 disabled:cursor-not-allowed
              ${tabRadius}
              ${isActive ? "text-white" : "text-text-muted hover:text-text"}
              ${tabClassName}
            `}
          >
            {tab.icon}
            {fill && tab.shortLabel ? (
              <>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </>
            ) : tab.label}
          </button>
        )
      })}
    </div>
  )
}