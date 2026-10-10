import { useCallback, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import supabase from "@/lib/supabase"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import useFollowingIds from "@/features/social/hooks/useFollowingIds"
import queryKeys from "@/lib/queryKeys"
import { matchesFeedFilters } from "@/features/social/constants/feedFilters"

// Supabase realtime's `in` filter takes at most 100 values, so followed ids are split into groups,
// one server-filtered listener each. Past MAX_FILTER_GROUPS there is no subscription: the feed
// still refreshes on the next visit through its cache tier.
const MAX_IDS_PER_FILTER = 100
const MAX_FILTER_GROUPS = 10

// Live ratings from everyone the user follows, without moving the feed under the reader:
// - a new rating is only counted (`newCount`), and only if it passes the active `filters`;
//   `showNew()` loads it on request. The event has no author name or avatar (get_user_feed joins
//   those), so cards are never drawn from it.
// - a re-score patches that card's score in place (same height, same position), in every
//   filtered variant of the feed.
// Deletes are not subscribed: realtime can't filter them by user_id.
// `feedItems` are useFeed's items, used to drop pending ratings the feed already shows.
export default function useFeedRealtime(feedItems, filters) {
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const userId = currentUser?.id
  const { followingIds } = useFollowingIds()
  // The fields matchesFeedFilters reads, so switching filters recounts without refetching
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

    const feedKey = queryKeys.feed.all(userId)

    const onInsert = ({ new: row }) => {
      const { id, user_id, type, score, genre_ids } = row
      setPending((prev) => (prev.some((r) => r.id === id) ? prev : [...prev, { id, user_id, type, score, genre_ids }]))
    }

    // Only the page holding the rating gets a new object, so only that card re-renders
    const onUpdate = ({ new: row }) => {
      queryClient.setQueriesData({ queryKey: feedKey }, (data) => data && {
        ...data,
        pages: data.pages.map((page) => page.items.some((item) => item.id === row.id)
          ? { ...page, items: page.items.map((item) => (item.id === row.id ? { ...item, score: row.score } : item)) }
          : page),
      })
    }

    const channel = supabase.channel(`feed-realtime-${userId}`)
    for (let i = 0; i < groupCount; i++) {
      const filter = `user_id=in.(${ids.slice(i * MAX_IDS_PER_FILTER, (i + 1) * MAX_IDS_PER_FILTER).join(',')})`
      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ratings', filter }, onInsert)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ratings', filter }, onUpdate)
    }
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [followingKey, userId, queryClient])

  // Derived, so any other refetch of the feed (a follow, a remount) clears what it now shows
  const newCount = useMemo(() => {
    if (!pending.length) return 0
    const shown = new Set(feedItems?.map((item) => item.id))
    return pending.filter((row) => !shown.has(row.id) && matchesFeedFilters(row, filters)).length
  }, [pending, feedItems, filters])

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
