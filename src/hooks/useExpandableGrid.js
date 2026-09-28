import { useCallback, useState } from "react"

// State for a MediaRow that can expand into a numbered-page grid. Toggling
// resets to page 1 so the grid always starts fresh when entered or left.
export default function useExpandableGrid() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [page, setPage] = useState(1)

  const toggle = useCallback(() => {
    setIsExpanded((v) => !v)
    setPage(1)
  }, [])

  return { isExpanded, page, setPage, toggle }
}
