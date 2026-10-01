import { QueryClient } from '@tanstack/react-query'

const MINUTE = 1000 * 60

// Cache tiers, spread into a query instead of ad-hoc numbers.
//   staleTime: how long a result is served without refetching
//   gcTime:    how long an entry that nothing renders stays in memory
export const CACHE = {
  // Search-as-you-type: one entry per typed term, useless once the text moves on
  ephemeral: { staleTime: 0, gcTime: MINUTE },
  // The signed-in user's Supabase data. Mutations and realtime invalidate it.
  user: { staleTime: 5 * MINUTE, gcTime: 10 * MINUTE },
  // Aggregates derived from ratings (stats, streak, picks, suggestions): invalidated on write,
  // otherwise slow-moving
  aggregate: { staleTime: 15 * MINUTE, gcTime: 10 * MINUTE },
  // One title's or season's TMDB metadata
  media: { staleTime: 15 * MINUTE, gcTime: 30 * MINUTE },
  // TMDB lists (browse rows and grids, recommendations). Browsing creates many of these, so they
  // are dropped as soon as they would need a refetch anyway.
  mediaList: { staleTime: 15 * MINUTE, gcTime: 15 * MINUTE },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...CACHE.user,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default queryClient
