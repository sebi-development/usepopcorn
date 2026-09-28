import Button from "@/components/ui/Button"
import useIntersectionObserver from "@/hooks/useIntersectionObserver"

const DEFAULT_CAPPED_MESSAGE = "You've reached the end of the recent activity."

// Fires `onIntersect` when scrolled into view. Give it a `key` that changes
// with every loaded page: the observer only reports changes in visibility, so
// a fresh mount is what triggers the next load when a short page leaves the
// sentinel still on screen. Mounting it only while more can load also means
// the observer always finds its element, which a hook called higher up in a
// component that renders a skeleton first would not.
export function AutoSentinel({ onIntersect, className = "h-px" }) {
  const ref = useIntersectionObserver(onIntersect)
  return <div ref={ref} className={className} />
}

/**
 * Footer for a usePagedList: renders whatever the list's `phase` calls for.
 * Pass the hook's `phase`, `pageCount`, `fetchMore` and `isFetchingNextPage`.
 */
export default function LoadMoreFooter({
  phase,
  pageCount,
  onLoadMore,
  isFetching,
  cappedMessage = DEFAULT_CAPPED_MESSAGE,
}) {
  if (phase === 'auto') return <AutoSentinel key={pageCount} onIntersect={onLoadMore} />

  if (phase === 'manual') {
    return (
      <div className="flex justify-center">
        <Button variant="secondary" size="sm" isLoading={isFetching} onClick={onLoadMore}>
          Load more
        </Button>
      </div>
    )
  }

  if (phase === 'capped') {
    return <p className="text-center text-xs text-text-muted">{cappedMessage}</p>
  }

  return null
}
