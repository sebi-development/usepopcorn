import { useCallback, useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import supabase from "@/lib/supabase"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import useFollowingIds from "@/features/social/hooks/useFollowingIds"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"
import { getFeed } from "@/services/follows"
import { toFeedParams } from "@/features/social/constants/feedFilters"
import { isEmptyFilters } from "@/utils/filters"

// Supabase realtime's `in` filter takes at most 100 values, so followed ids are split into groups,
// one server-filtered listener each. Past MAX_FILTER_GROUPS there is no subscription: the feed
// still refreshes on the next visit through its cache tier.
const MAX_IDS_PER_FILTER = 100
const MAX_FILTER_GROUPS = 10
// get_user_feed clamps p_limit to this
const MAX_FEED_LIMIT = 50

// Live activity from everyone the user follows, without moving the feed under the reader: a new
// rating or a changed score (the feed orders by updated_at) is only counted (`newCount`);
// `showNew()` loads it on request. The event has no author name or avatar (get_user_feed joins
// those), so cards are never drawn from it.
// Deletes are not subscribed: realtime can't filter them by user_id.
// `feedItems` are useFeed's items, used to drop pending activity the feed already shows.
export default function useFeedRealtime(feedItems, filters) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const userId = currentUser?.id
  const { followingIds } = useFollowingIds()
  // Activity since the feed loaded: { id, at } with the rating's updated_at in ms
  const [pending, setPending] = useState([])

  const followingKey = useMemo(() => {
    if (!followingIds?.length) return null
    return [...followingIds].sort().join(',')
  }, [followingIds])

  useEffect(() => {
    if (!followingKey || !userId) return

    const ids = followingKey.split(',')
    const groupCount = Math.ceil(ids.length / MAX_IDS_PER_FILTER)
    if (groupCount > MAX_FILTER_GROUPS) return

    // An insert has updated_at = created_at; an update moves it only when the score changed
    const onChange = ({ new: row }) => {
      setPending((prev) => [...prev.filter((p) => p.id !== row.id), { id: row.id, at: Date.parse(row.updated_at) }])
    }

    const channel = supabase.channel(`feed-realtime-${userId}`)
    for (let i = 0; i < groupCount; i++) {
      const filter = `user_id=in.(${ids.slice(i * MAX_IDS_PER_FILTER, (i + 1) * MAX_IDS_PER_FILTER).join(',')})`
      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ratings', filter }, onChange)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ratings', filter }, onChange)
    }
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [followingKey, userId])

  // Derived, so any refetch of the feed (a follow, a remount, showNew) clears what it now shows.
  // Activity no newer than the feed's newest is shown already, or a stale event (a same-score
  // re-save leaves updated_at as it was).
  const unseen = useMemo(() => {
    if (!pending.length) return []
    const newest = Math.max(...(feedItems ?? []).map((item) => Date.parse(item.updated_at)))
    return pending.filter((p) => p.at > newest).map((p) => p.id)
  }, [pending, feedItems])

  // Unfiltered, every unseen rating belongs in the feed (the channel already listens to followed
  // users only). Filtered, get_user_feed itself says which match, so the SQL stays the only
  // definition of a filter. Unseen ratings are newer than anything the feed loaded, so the ones
  // that match are among the newest `unseen.length` matching rows: one small request per change.
  const isFiltered = !isEmptyFilters(filters)
  const { data: matchingIds } = useQuery({
    queryKey: queryKeys.feedFilterMatches(userId, filters, unseen),
    queryFn: async () => {
      const rows = await getFeed(userId, {
        limit: Math.min(unseen.length, MAX_FEED_LIMIT),
        filterParams: toFeedParams(filters),
      })
      return rows.map((row) => row.id)
    },
    enabled: isFiltered && unseen.length > 0,
    // While a new rating is checked, the last answer for the same filters keeps the count from
    // dropping to zero (another filter's answer would be wrong)
    placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[2] === filters ? previous : undefined),
    ...CACHE.ephemeral,
  })

  const newCount = useMemo(() => {
    if (!isFiltered) return unseen.length
    if (!matchingIds) return 0
    const matching = new Set(matchingIds)
    return unseen.filter((id) => matching.has(id)).length
  }, [isFiltered, unseen, matchingIds])

  // Back to the newest page only: one request instead of refetching every loaded page. Other
  // filtered variants are only marked stale, so they refetch when next shown.
  const showNew = useCallback(() => {
    queryClient.setQueryData(queryKeys.feed.list(userId, filters), (data) => data && {
      pages: data.pages.slice(0, 1),
      pageParams: data.pageParams.slice(0, 1),
    })
    queryClient.invalidateQueries({ queryKey: queryKeys.feed.all(userId) })
    setPending([])
  }, [queryClient, userId, filters])

  return { newCount, showNew }
}
