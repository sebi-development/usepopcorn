import { useCallback } from "react"
import { useSearchParams } from "react-router"
import { IN_PLACE } from "@/hooks/useUrlFilters"
import { PAGE_PARAM } from "@/utils/pagination"

const GRID_PARAM = "grid"

// `?page=N` of a numbered grid (absent = 1), kept in the URL so Back from a title lands on the same page
export function useUrlPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number.parseInt(searchParams.get(PAGE_PARAM), 10) || 1)

  const setPage = useCallback((next) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      if (next > 1) params.set(PAGE_PARAM, String(next))
      else params.delete(PAGE_PARAM)
      return params
    }, IN_PLACE)
  }, [setSearchParams])

  return { page, setPage }
}

// A MediaRow that expands into a numbered-page grid: `?grid=<rowId>` names the expanded row (one per
// page) and `?page=N` its page. Expanding or collapsing starts the grid on page 1.
export default function useUrlGrid(rowId) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { page, setPage } = useUrlPage()
  const isExpanded = searchParams.get(GRID_PARAM) === rowId

  const toggle = useCallback(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.delete(PAGE_PARAM)
      if (params.get(GRID_PARAM) === rowId) params.delete(GRID_PARAM)
      else params.set(GRID_PARAM, rowId)
      return params
    }, IN_PLACE)
  }, [rowId, setSearchParams])

  return { isExpanded, page: isExpanded ? page : 1, setPage, toggle }
}
