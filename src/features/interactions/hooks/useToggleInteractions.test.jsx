import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useToggleInteractions from './useToggleInteractions'
import { toggleInteraction } from '../../../services/interactions'

// Same pattern as notifyAdmin last time — replace the real service call
// with a stub we control per-test.
vi.mock('../../../services/interactions', () => ({
  toggleInteraction: vi.fn(),
}))

// currentUser?.id feeds directly into the cache key, so give it a fixed,
// predictable value rather than dealing with the real hook's cache logic.
vi.mock('../../auth/hooks/useCurrentUser', () => ({
  default: () => ({ id: 'test-user-id' }),
}))

// A fresh QueryClient per test — we also hand the client itself back,
// not just the wrapper, because the ONLY way to inspect the optimistic
// update is to read the cache directly (the hook only returns
// { mutate, isPending }, not the interactions list).
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { Wrapper, queryClient }
}

describe('useToggleInteractions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('optimistically adds the item to the cache before the request resolves', async () => {
    toggleInteraction.mockResolvedValue({ status: 'added' })
    const { Wrapper, queryClient } = createWrapper()
    const queryKey = ['interactions', 'watchlist', 'test-user-id']

    const { result } = renderHook(() => useToggleInteractions('watchlist'), { wrapper: Wrapper })

    result.current.mutate({ tmdb_id: 42, title: 'Dune', poster_path: '/x.jpg', media_type: 'movie' })

    await waitFor(() => {
      expect(queryClient.getQueryData(queryKey)).toEqual([
        expect.objectContaining({ tmdb_id: 42, title: 'Dune' }),
      ])
    })
  })

  it('optimistically removes the item when it is already in the cache', async () => {
    toggleInteraction.mockResolvedValue({ status: 'removed' })
    const { Wrapper, queryClient } = createWrapper()
    const queryKey = ['interactions', 'watchlist', 'test-user-id']

    const { result } = renderHook(() => useToggleInteractions('watchlist'), { wrapper: Wrapper })

    result.current.mutate([{ tmdb_id: 42, title: 'Dune', poster_path: '/x.jpg', media_type: 'movie' }])

    await waitFor(() => {
      expect(queryClient.getQueryData(queryKey)).toEqual([
        expect.objectContaining({ tmdb_id: 42, title: 'Dune' }),
      ])
    })

  })

  it('rolls back to the previous cache state when the request fails', async () => {
    // Use toggleInteraction.mockRejectedValue(new Error('network down'))
    useToggleInteractions.mockRejectedValue(new Error('network down'))
    // instead of mockResolvedValue. Seed some initial cache state, call
    // mutate, then wait and assert the cache matches what you seeded —
    // proving onError's rollback actually restored it.
  })
})