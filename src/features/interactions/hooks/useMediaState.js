import { useQuery } from "@tanstack/react-query"
import { getMediaState } from "@/services/mediaState"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"

// The signed-in user's relationship to titles (favorited, watchlisted, own rating) in one cache entry.
// The cache holds the plain RPC payload so identical refetches keep their reference; the lookups below
// are derived once per payload by `select`. Mutations patch it with patchMediaState.
export const mediaStateKey = (userId) => ['mediaState', userId]

export const mediaStateQuery = (userId) => ({
  queryKey: mediaStateKey(userId),
  queryFn: getMediaState,
  staleTime: 1000 * 60 * 5,
})

const EMPTY = { favorites: new Set(), watchlist: new Set(), ratings: new Map() }

function toLookups(raw) {
  return {
    favorites: new Set(raw.favorites),
    watchlist: new Set(raw.watchlist),
    ratings: new Map(Object.entries(raw.ratings).map(([id, score]) => [Number(id), score])),
  }
}

export default function useMediaState() {
  const currentUser = useCurrentUser()
  const id = currentUser?.id

  const { data } = useQuery({ ...mediaStateQuery(id), enabled: !!id, select: toLookups })
  return data ?? EMPTY
}

// Optimistic update helper. No-op until the state has loaded (the settle-time invalidation fetches it).
export function patchMediaState(queryClient, userId, updater) {
  queryClient.setQueryData(mediaStateKey(userId), (old) => (old ? updater(old) : old))
}
