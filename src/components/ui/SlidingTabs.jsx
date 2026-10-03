import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react"

// ease-out-quint: leaves quickly, settles softly
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)"

export default function SlidingTabs({
  tabs,
  activeTab,
  onChange,
  duration = 350,
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
  // null until first measured. `animate` is true only when the active tab changed: first paint,
  // resizes and font swaps snap the pill into place instead of making it chase the layout.
  const [pill, setPill] = useState(null)
  const tabRefs = useRef([])
  const containerRef = useRef(null)
  const prevActiveRef = useRef(activeTab)
  const measureRef = useRef(null)

  const measure = useCallback((animate) => {
    const el = tabRefs.current[tabs.findIndex(tab => tab.id === activeTab)]
    if (!el) return
    const x = el.offsetLeft
    const width = el.offsetWidth
    setPill(p => (p && p.x === x && p.width === width ? p : { x, width, animate }))
  }, [tabs, activeTab])

  // Layout effect: the pill starts moving in the same frame the label changes colour
  useLayoutEffect(() => {
    measureRef.current = measure
    measure(prevActiveRef.current !== activeTab)
    prevActiveRef.current = activeTab
  }, [measure, activeTab])

  // Created once; re-observing on every tab change would fire a snap measurement mid-slide
  useEffect(() => {
    const observer = new ResizeObserver(() => measureRef.current?.(false))
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={`relative flex ${fill ? "w-full sm:w-fit" : "w-fit"} bg-surface-900/40 backdrop-blur-md border border-white/5 ${containerPadding} ${containerGap} ${containerRadius} ${className}`}
    >
      {/* Moved with transform (compositor) rather than left. No backdrop-blur of its own: the
          container already blurs, and a moving blur is re-rendered on every frame. */}
      <div
        className={`absolute left-0 top-1 bottom-1 bg-white/10 border border-white/10 shadow-sm will-change-transform transition-[transform,width] motion-reduce:transition-none ${pillRadius} ${pillClassName}`}
        style={{
          width: pill?.width ?? 0,
          transform: `translateX(${pill?.x ?? 0}px)`,
          opacity: pill ? 1 : 0,
          transitionDuration: pill?.animate ? `${duration}ms` : "0ms",
          transitionTimingFunction: EASING,
        }}
      />

      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[index] = el)}
            type="button"
            role="tab"
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            aria-selected={isActive}
            className={`
              relative z-10 flex items-center font-medium
              ${fill
                ? "flex-1 sm:flex-none flex-col sm:flex-row justify-center gap-0.5 sm:gap-1.5 px-1 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm"
                : "gap-1.5 px-4 py-2 text-sm"}
              transition-colors duration-300 cursor-pointer
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
