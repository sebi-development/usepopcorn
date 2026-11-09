import { useCallback, useState } from "react"

const fresh = (key, tab) => ({ key, active: tab, switched: false, visited: new Set([tab]) })

// State for a SlidingTabs area whose panels mount only while active (see TabPanel). `resetKey` is the
// page's subject: a cached page keeps the tabs mounted, so a new title or person resets them during
// render and never paints the old tab. `switched` stays false until the first click, so the panel a
// page opens on doesn't fade in; `visited` lets a parent keep a tab's data enabled once it was opened.
export default function useTabs(resetKey, initialTab) {
  const [state, setState] = useState(() => fresh(resetKey, initialTab))
  const current = state.key === resetKey ? state : fresh(resetKey, initialTab)
  if (current !== state) setState(current)

  const selectTab = useCallback((id) => {
    setState((s) => ({ ...s, active: id, switched: true, visited: s.visited.has(id) ? s.visited : new Set(s.visited).add(id) }))
  }, [])

  return { activeTab: current.active, switched: current.switched, visited: current.visited, selectTab }
}
