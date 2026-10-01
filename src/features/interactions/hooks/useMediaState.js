import { useQuery } from "@tanstack/react-query"
import { getMediaState } from "@/services/mediaState"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import queryKeys from "@/lib/queryKeys"
import { CACHE } from "@/lib/queryClient"

// The signed-in user's relationship to titles (favorited, watchlisted, own rating) in one cache entry.
// The cache holds the plain RPC payload so identical refetches keep their reference; the lookups below
// are derived once per payload by `select`. Mutations patch it with patchMediaState.
export const mediaStateQuery = (userId) => ({
  queryKey: queryKeys.mediaState(userId),
  queryFn: getMediaState,
  ...CACHE.user,
})

const EMPTY = { favorites: new Set(), watchlist: new Set(), ratings: new Map() }

// `select` runs once per observer, and every MediaRow is one. Remembering the last payload makes
// them all share a single set of lookups instead of each building (and holding) its own.
let lastRaw
let lastLookups

function toLookups(raw) {
  if (raw !== lastRaw) {
    lastRaw = raw
    lastLookups = {
      favorites: new Set(raw.favorites),
      watchlist: new Set(raw.watchlist),
      ratings: new Map(Object.entries(raw.ratings).map(([id, score]) => [Number(id), score])),
    }
  }
  return lastLookups
}

export default function useMediaState() {
  const currentUser = useCurrentUser()
  const id = currentUser?.id

  const { data } = useQuery({ ...mediaStateQuery(id), enabled: !!id, select: toLookups })
  return data ?? EMPTY
}

const countFavorites = (raw) => raw.favorites.length

// For a component that only shows the number: it re-renders when the count changes, not on
// every watchlist toggle or rating.
export function useFavoritesCount() {
  const currentUser = useCurrentUser()
  const id = currentUser?.id

  const { data } = useQuery({ ...mediaStateQuery(id), enabled: !!id, select: countFavorites })
  return data ?? 0
}

// Optimistic update helper. No-op until the state has loaded (the settle-time invalidation fetches it).
export function patchMediaState(queryClient, userId, updater) {
  queryClient.setQueryData(queryKeys.mediaState(userId), (old) => (old ? updater(old) : old))
}
