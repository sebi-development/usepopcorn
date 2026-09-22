import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useToggleInteractions from './useToggleInteractions'
import { toggleInteraction } from '../../../services/interactions'

// Replace the real service call with a stub we control per-test.
vi.mock('../../../services/interactions', () => ({
  toggleInteraction: vi.fn(),
}))

// currentUser?.id feeds directly into the cache key, so give it a fixed,
// predictable value rather than dealing with the real auth logic.
vi.mock('../../auth/hooks/useCurrentUser', () => ({
  default: () => ({ id: 'test-user-id' }),
}))

// Mock toast so we don't need a DOM provider for it and can spy on calls.
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn() },
}))

import toast from 'react-hot-toast'

// A fresh QueryClient per test — we also return the client itself so
// tests can read / seed the cache directly without going through the hook's
// return value (which only exposes { mutate, isPending }).
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { Wrapper, queryClient }
}

// Helper — stable reference to the cache key used by every test.
const makeKey = (type = 'watchlist') => ['interactions', type, 'test-user-id']

// ---------------------------------------------------------------------------
// Shared media fixture
// ---------------------------------------------------------------------------
const MEDIA = {
  tmdb_id: 42,
  title: 'Dune',
  poster_path: '/x.jpg',
  media_type: 'movie',
}

describe('useToggleInteractions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // -------------------------------------------------------------------------
  // 1. Optimistic ADD — cache is empty before mutation
  // -------------------------------------------------------------------------
  it('optimistically adds the item to the cache before the request resolves', async () => {
    // Never resolves during the optimistic window we are testing.
    toggleInteraction.mockReturnValue(new Promise(() => {}))

    const { Wrapper, queryClient } = createWrapper()
    const queryKey = makeKey()

    const { result } = renderHook(() => useToggleInteractions('watchlist'), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate(MEDIA)
    })

    // The cache should reflect the optimistic update synchronously.
    await waitFor(() => {
      const cached = queryClient.getQueryData(queryKey)
      expect(cached).toEqual([
        expect.objectContaining({
          tmdb_id: 42,
          title: 'Dune',
          id: 'temp-id',
          interaction_type: 'watchlist',
        }),
      ])
    })
  })

  // -------------------------------------------------------------------------
  // 2. Optimistic REMOVE — item already present in cache
  // -------------------------------------------------------------------------
  it('optimistically removes the item when it is already in the cache', async () => {
    toggleInteraction.mockReturnValue(new Promise(() => {}))

    const { Wrapper, queryClient } = createWrapper()
    const queryKey = makeKey()

    // Seed two items; only the matching one should be removed.
    queryClient.setQueryData(queryKey, [
      {
        tmdb_id: 42,
        title: 'Dune',
        poster_path: '/x.jpg',
        media_type: 'movie',
        id: 'existing-id',
        interaction_type: 'watchlist',
      },
      {
        tmdb_id: 99,
        title: 'Interstellar',
        poster_path: '/y.jpg',
        media_type: 'movie',
        id: 'other-id',
        interaction_type: 'watchlist',
      },
    ])

    const { result } = renderHook(() => useToggleInteractions('watchlist'), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate(MEDIA)
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData(queryKey)
      // tmdb_id 42 must be gone; 99 must survive.
      expect(cached).toHaveLength(1)
      expect(cached[0]).toMatchObject({ tmdb_id: 99, title: 'Interstellar' })
    })
  })

  // -------------------------------------------------------------------------
  // 3. Rollback — cache is restored when the request fails
  // -------------------------------------------------------------------------
  it('rolls back to the previous cache state when the request fails', async () => {
    toggleInteraction.mockRejectedValue(new Error('network down'))

    const { Wrapper, queryClient } = createWrapper()
    const queryKey = makeKey()

    const initial = [
      {
        tmdb_id: 99,
        title: 'Interstellar',
        poster_path: '/y.jpg',
        media_type: 'movie',
        id: 'other-id',
        interaction_type: 'watchlist',
      },
    ]
    queryClient.setQueryData(queryKey, initial)

    const { result } = renderHook(() => useToggleInteractions('watchlist'), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate(MEDIA)
    })

    // After the error resolves, onError must have restored the seeded data.
    await waitFor(() => {
      const cached = queryClient.getQueryData(queryKey)
      expect(cached).toEqual(initial)
    })
  })

  // -------------------------------------------------------------------------
  // 4. toast.error is called with the error message on failure
  // -------------------------------------------------------------------------
  it('calls toast.error with the error message when the mutation fails', async () => {
    toggleInteraction.mockRejectedValue(new Error('network down'))

    const { Wrapper } = createWrapper()

    const { result } = renderHook(() => useToggleInteractions('watchlist'), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate(MEDIA)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Something went wrong: network down',
      )
    })
  })

  // -------------------------------------------------------------------------
  // 5. isPending reflects the in-flight mutation state
  // -------------------------------------------------------------------------
  it('exposes isPending=true while the mutation is in flight', async () => {
    // A promise we control so the mutation never settles.
    let resolveRequest
    toggleInteraction.mockReturnValue(
      new Promise((res) => {
        resolveRequest = res
      }),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useToggleInteractions('watchlist'), {
      wrapper: Wrapper,
    })

    expect(result.current.isPending).toBe(false)

    act(() => {
      result.current.mutate(MEDIA)
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })

    // Resolve and confirm isPending returns to false.
    await act(async () => {
      resolveRequest({ status: 'added' })
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // 6. onSettled invalidates the query so fresh data is fetched
  // -------------------------------------------------------------------------
  it('invalidates the query after the mutation settles (success)', async () => {
    toggleInteraction.mockResolvedValue({ status: 'added' })

    const { Wrapper, queryClient } = createWrapper()
    const queryKey = makeKey()

    // Spy on invalidateQueries after the client is created.
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useToggleInteractions('watchlist'), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate(MEDIA)
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey })
    })
  })

  it('invalidates the query after the mutation settles (error)', async () => {
    toggleInteraction.mockRejectedValue(new Error('boom'))

    const { Wrapper, queryClient } = createWrapper()
    const queryKey = makeKey()

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useToggleInteractions('watchlist'), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate(MEDIA)
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey })
    })
  })

  // -------------------------------------------------------------------------
  // 7. tmdb_id normalization — mediaData.id is used when tmdb_id is absent
  // -------------------------------------------------------------------------
  it('uses mediaData.id as tmdb_id when tmdb_id is not provided', async () => {
    toggleInteraction.mockReturnValue(new Promise(() => {}))

    const { Wrapper, queryClient } = createWrapper()
    const queryKey = makeKey()

    const { result } = renderHook(() => useToggleInteractions('watchlist'), {
      wrapper: Wrapper,
    })

    act(() => {
      // Pass id instead of tmdb_id — the hook should normalize this.
      result.current.mutate({ id: 77, title: 'Arrival', poster_path: '/z.jpg', media_type: 'movie' })
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData(queryKey)
      expect(cached).toEqual([
        expect.objectContaining({ tmdb_id: 77, title: 'Arrival' }),
      ])
    })
  })

  // -------------------------------------------------------------------------
  // 8. Works correctly with different interaction types (favorites)
  // -------------------------------------------------------------------------
  it('uses the correct query key for the "favorites" interaction type', async () => {
    toggleInteraction.mockReturnValue(new Promise(() => {}))

    const { Wrapper, queryClient } = createWrapper()
    const watchlistKey = makeKey('watchlist')
    const favoritesKey = makeKey('favorites')

    const { result } = renderHook(() => useToggleInteractions('favorites'), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate(MEDIA)
    })

    await waitFor(() => {
      // The favorites cache should contain the item.
      expect(queryClient.getQueryData(favoritesKey)).toEqual([
        expect.objectContaining({ tmdb_id: 42, interaction_type: 'favorites' }),
      ])
    })

    // The watchlist cache must remain untouched.
    expect(queryClient.getQueryData(watchlistKey)).toBeUndefined()
  })

  // -------------------------------------------------------------------------
  // 9. Cancels in-flight queries before applying the optimistic update
  // -------------------------------------------------------------------------
  it('cancels in-flight queries before applying the optimistic update', async () => {
    toggleInteraction.mockReturnValue(new Promise(() => {}))

    const { Wrapper, queryClient } = createWrapper()
    const cancelSpy = vi.spyOn(queryClient, 'cancelQueries')

    const { result } = renderHook(() => useToggleInteractions('watchlist'), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.mutate(MEDIA)
    })

    await waitFor(() => {
      expect(cancelSpy).toHaveBeenCalledWith({
        queryKey: makeKey('watchlist'),
      })
    })
  })
})