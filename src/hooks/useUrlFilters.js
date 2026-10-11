import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"
import { parseFilters, writeFilters } from "@/utils/filters"

/**
 * Filters for `defs` (see src/utils/filters.js), kept in the URL so a filtered view survives a
 * reload, the back button and a shared link. `filters` keeps its identity until a value actually
 * changes, so it can sit in query keys and memo deps. `defs` must be stable (hoisted or memoized).
 */
export default function useUrlFilters(defs) {
  const [searchParams, setSearchParams] = useSearchParams()

  // The string is the value to compare: parsing makes a new object every render, the memo hands
  // back the same one until the string changes. Costs well under a microsecond per render.
  const filtersKey = JSON.stringify(parseFilters(searchParams, defs))
  const filters = useMemo(() => JSON.parse(filtersKey), [filtersKey])

  // `value` undefined / null clears the key
  const setFilter = useCallback((key, value) => {
    setSearchParams(
      (prev) => writeFilters(prev, defs, { ...parseFilters(prev, defs), [key]: value ?? undefined }),
      { replace: true }
    )
  }, [defs, setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams((prev) => writeFilters(prev, defs, {}), { replace: true })
  }, [defs, setSearchParams])

  return { filters, activeCount: Object.keys(filters).length, setFilter, clearFilters }
}
