import { QueryClient } from '@tanstack/react-query'

const MINUTE = 1000 * 60

// Cache tiers, spread into a query instead of ad-hoc numbers.
//   staleTime: how long a result is served without refetching
//   gcTime:    how long an entry that nothing renders stays in memory
export const CACHE = {
  ephemeral: { staleTime: 0, gcTime: MINUTE },
  user: { staleTime: 5 * MINUTE, gcTime: 10 * MINUTE },
  aggregate: { staleTime: 15 * MINUTE, gcTime: 10 * MINUTE },
  media: { staleTime: 15 * MINUTE, gcTime: 30 * MINUTE },
  mediaList: { staleTime: 15 * MINUTE, gcTime: 15 * MINUTE },
  filtered: { gcTime: 2 * MINUTE },
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
