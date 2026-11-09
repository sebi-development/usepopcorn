// One tab's panel, mounted only while its tab is active (state from useTabs). `animate` fades it in,
// passed once the user has switched tabs, so the panel a page opens on appears at once.
export default function TabPanel({ id, activeTab, animate, children }) {
  if (activeTab !== id) return null

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={animate ? "animate-[overlay-fade_250ms_ease-out] motion-reduce:animate-none" : undefined}
    >
      {children}
    </div>
  )
}
