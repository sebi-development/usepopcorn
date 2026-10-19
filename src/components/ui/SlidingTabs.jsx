import { useRef, useEffect, useLayoutEffect, useCallback } from "react"

// ease-out-quint: leaves quickly, settles softly
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)"

// Static, so React never overwrites the values measure() sets
const PILL_STYLE = { width: 0, opacity: 0, transitionTimingFunction: EASING }

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
  // The pill is styled on its DOM node, not via state, so a switch renders once. Only a tab change
  // animates; first paint and resizes snap.
  const pillRef = useRef(null)
  const tabRefs = useRef([])
  const containerRef = useRef(null)
  const prevActiveRef = useRef(activeTab)
  const measureRef = useRef(null)

  const measure = useCallback((animate) => {
    const el = tabRefs.current[tabs.findIndex(tab => tab.id === activeTab)]
    const pill = pillRef.current
    if (!el || !pill) return
    pill.style.transitionDuration = animate ? `${duration}ms` : "0ms"
    pill.style.width = `${el.offsetWidth}px`
    pill.style.transform = `translateX(${el.offsetLeft}px)`
    pill.style.opacity = "1"
  }, [tabs, activeTab, duration])

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
        ref={pillRef}
        className={`absolute left-0 top-1 bottom-1 bg-white/10 border border-white/10 shadow-sm will-change-transform transition-[transform,width] motion-reduce:transition-none ${pillRadius} ${pillClassName}`}
        style={PILL_STYLE}
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
