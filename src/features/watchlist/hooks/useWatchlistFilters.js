import { useMemo } from "react"
import { useSearchParams } from "react-router"
import useUrlFilters from "@/hooks/useUrlFilters"
import { parseFilters, TYPE_FILTER } from "@/utils/filters"
import { getDefs } from "@/features/watchlist/constants/filters"
import { filterItems } from "@/features/watchlist/utils/watchlistItems"

// The All saved grid's filters (kept in the URL) and the titles they leave, filtered on the client: the
// list is already loaded whole, so no filter change makes a request
export default function useWatchlistFilters(items) {
  const [searchParams] = useSearchParams()
  const type = parseFilters(searchParams, [TYPE_FILTER]).type
  const defs = useMemo(() => getDefs(type, items), [type, items])
  const { filters, setFilter, setFilters, clearFilters } = useUrlFilters(defs)
  const shown = useMemo(() => filterItems(items, filters), [items, filters])

  return { defs, filters, setFilter, setFilters, clearFilters, shown }
}
