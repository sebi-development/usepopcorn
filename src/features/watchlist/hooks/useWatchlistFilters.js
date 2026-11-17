import { useCallback, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import useUrlFilters from "@/hooks/useUrlFilters"
import { parseFilters, TYPE_FILTER } from "@/utils/filters"
import { getDefs, STREAMING_FILTER } from "@/features/watchlist/constants/filters"
import useWatchlistStreaming from "@/features/watchlist/hooks/useWatchlistStreaming"
import { filterItems, toStreamingOptions } from "@/features/watchlist/utils/watchlistItems"

const READ_FIRST = [TYPE_FILTER, STREAMING_FILTER]

// The All saved grid's filters (kept in the URL) and the titles they leave, filtered on the client: the
// list is already loaded whole, so no filter change makes a request
export default function useWatchlistFilters(items) {
  const [searchParams] = useSearchParams()
  const { type, streaming } = parseFilters(searchParams, READ_FIRST)

  // Streaming services load the first time its pill opens, or at once when the URL already filters by one
  const [streamingOpened, setStreamingOpened] = useState(false)
  const onOpen = useCallback((key) => { if (key === STREAMING_FILTER.key) setStreamingOpened(true) }, [])
  const { data: onServices, isError } = useWatchlistStreaming(items, { enabled: streamingOpened || Boolean(streaming) })
  // Undefined while loading (the pill says "Loading…"); a failed call leaves the pill nothing to pick
  const streamingOptions = useMemo(
    () => (onServices ? toStreamingOptions(items, onServices) : isError ? [] : undefined),
    [items, onServices, isError]
  )

  const defs = useMemo(() => getDefs(type, items, streamingOptions), [type, items, streamingOptions])
  const { filters, setFilter, setFilters, clearFilters } = useUrlFilters(defs)
  const shown = useMemo(() => filterItems(items, filters, onServices), [items, filters, onServices])
  // Filtered by Streaming before its answer is in: every title shows, dimmed, until it lands
  const isPending = Boolean(filters.streaming) && !onServices && !isError

  return { defs, filters, setFilter, setFilters, clearFilters, shown, onOpen, isPending }
}
