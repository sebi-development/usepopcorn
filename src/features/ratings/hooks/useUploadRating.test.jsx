import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useUploadRating from './useUploadRating'
import { uploadRating } from '../../../services/ratings'

// ─────────────────────────────────────────────────────────────────────────────
// MOCKS
// Every external dependency the hook touches is replaced with a stub so our
// tests never hit the network, the database, or the real auth system.
// ─────────────────────────────────────────────────────────────────────────────

// 1. The service layer — we want full control over what the "server" returns.
vi.mock('../../../services/ratings', () => ({
  uploadRating: vi.fn(),
}))

// 2. The auth hook — the hook uses currentUser?.id for both the query key and
//    the optimistic data payload. A fixed value makes assertions predictable.
vi.mock('../../auth/hooks/useCurrentUser', () => ({
  default: () => ({ id: 'user-123' }),
}))

// 3. react-hot-toast — we don't need a real DOM toast; we just want to spy on
//    whether .success() and .error() were called and with what message.
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a brand-new QueryClient + a React wrapper component for each test.
 * Why fresh per test? Because React Query's cache is shared inside one client,
 * and leaking state between tests causes false positives / false negatives.
 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }, // never auto-retry — failures must be immediate
    },
  })
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { Wrapper, queryClient }
}

/**
 * The cache key the hook builds for a specific movie+user combination.
 * Keeping this in one place means if the hook's key ever changes, we only
 * fix it here rather than in every single test.
 */
const ratingKey = (tmdb_id = 101) => ['ratings', 'movie', tmdb_id, 'user-123']

/**
 * A realistic rating payload that satisfies the service's required fields.
 * Individual tests can spread-override individual fields as needed.
 */
const RATING_DATA = {
  tmdb_id: 101,
  score: 8,
  title: 'Dune',
  poster_path: '/dune.jpg',
  type: 'movie',
  runtime: 155,
  genre_ids: [878, 12],
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('useUploadRating', () => {
  // Reset all mock call counts and implementations before every test so that
  // one test's mock setup cannot bleed into the next.
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── 1. OPTIMISTIC UPDATE ──────────────────────────────────────────────────
  it('optimistically writes the rating to the cache before the server responds', async () => {
    // The mutation never settles — we are only testing what happens
    // *during* the in-flight window, not after it resolves.
    uploadRating.mockReturnValue(new Promise(() => {}))

    const { Wrapper, queryClient } = createWrapper()

    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    // By the time React re-renders, onMutate has already run synchronously.
    await waitFor(() => {
      const cached = queryClient.getQueryData(ratingKey(101))
      expect(cached).toMatchObject({
        tmdb_id: 101,
        score: 8,
        title: 'Dune',
        user_id: 'user-123', // the hook injects the current user's id
      })
    })
  })

  // ── 2. OPTIMISTIC UPDATE OVERWRITES A PREVIOUS RATING ────────────────────
  it('replaces an existing cached rating with the new optimistic value', async () => {
    uploadRating.mockReturnValue(new Promise(() => {}))

    const { Wrapper, queryClient } = createWrapper()
    const key = ratingKey(101)

    // Pre-populate the cache as if the user had already rated this movie.
    queryClient.setQueryData(key, {
      tmdb_id: 101,
      score: 5,
      title: 'Dune',
      user_id: 'user-123',
    })

    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ ...RATING_DATA, score: 9 })
    })

    await waitFor(() => {
      expect(queryClient.getQueryData(key)).toMatchObject({ score: 9 })
    })
  })

  // ── 3. ROLLBACK ON ERROR ──────────────────────────────────────────────────
  it('restores the previous cache value when the mutation fails', async () => {
    uploadRating.mockRejectedValue(new Error('db offline'))

    const { Wrapper, queryClient } = createWrapper()
    const key = ratingKey(101)

    const previousRating = { tmdb_id: 101, score: 6, title: 'Dune', user_id: 'user-123' }
    queryClient.setQueryData(key, previousRating)

    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ ...RATING_DATA, score: 9 })
    })

    // After onError runs, the cache must be exactly what it was before.
    await waitFor(() => {
      expect(queryClient.getQueryData(key)).toEqual(previousRating)
    })
  })

  // ── 4. ROLLBACK WHEN CACHE WAS EMPTY ─────────────────────────────────────
  it('restores undefined (no cache entry) when there was no previous rating', async () => {
    uploadRating.mockRejectedValue(new Error('db offline'))

    const { Wrapper, queryClient } = createWrapper()
    const key = ratingKey(101)

    // Cache starts empty — no setQueryData call.
    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    await waitFor(() => {
      // onError should restore undefined, not leave the optimistic value behind.
      expect(queryClient.getQueryData(key)).toBeUndefined()
    })
  })

  // ── 5. SUCCESS TOAST ──────────────────────────────────────────────────────
  it('shows a success toast after the mutation resolves', async () => {
    uploadRating.mockResolvedValue({ id: 'row-1', ...RATING_DATA })

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Rating added successfully')
    })
  })

  // ── 6. ERROR TOAST ────────────────────────────────────────────────────────
  it('shows an error toast with the error message when the mutation fails', async () => {
    uploadRating.mockRejectedValue(new Error('db offline'))

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error adding rating (db offline)')
    })
  })

  // ── 7. NO SUCCESS TOAST ON FAILURE ───────────────────────────────────────
  it('does NOT call toast.success when the mutation fails', async () => {
    uploadRating.mockRejectedValue(new Error('db offline'))

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    expect(toast.success).not.toHaveBeenCalled()
  })

  // ── 8. isPending LIFECYCLE ────────────────────────────────────────────────
  it('exposes isPending=true while the mutation is in flight, false otherwise', async () => {
    let resolveRequest
    uploadRating.mockReturnValue(
      new Promise((res) => {
        resolveRequest = res
      }),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    // Before mutate is called the hook should be idle.
    expect(result.current.isPending).toBe(false)

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })

    // Settle the request and confirm isPending drops back to false.
    await act(async () => {
      resolveRequest({ id: 'row-1' })
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })
  })

  // ── 9. error IS EXPOSED IN RETURN VALUE ───────────────────────────────────
  it('exposes the error object in the return value after a failed mutation', async () => {
    uploadRating.mockRejectedValue(new Error('db offline'))

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    expect(result.current.error).toBeNull()

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error.message).toBe('db offline')
    })
  })

  // ── 10. cancelQueries IS CALLED BEFORE THE OPTIMISTIC UPDATE ─────────────
  it('cancels in-flight queries for the affected key before applying the optimistic update', async () => {
    uploadRating.mockReturnValue(new Promise(() => {}))

    const { Wrapper, queryClient } = createWrapper()
    const cancelSpy = vi.spyOn(queryClient, 'cancelQueries')

    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    await waitFor(() => {
      expect(cancelSpy).toHaveBeenCalledWith({ queryKey: ratingKey(101) })
    })
  })

  // ── 11. onSettled INVALIDATES ['ratings'] ─────────────────────────────────
  it('invalidates the broad ["ratings"] query after the mutation settles (success)', async () => {
    uploadRating.mockResolvedValue({ id: 'row-1' })

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['ratings'] })
    })
  })

  // ── 12. onSettled INVALIDATES ['ratings'] ON ERROR TOO ───────────────────
  it('invalidates ["ratings"] even when the mutation fails', async () => {
    uploadRating.mockRejectedValue(new Error('boom'))

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['ratings'] })
    })
  })

  // ── 13. onSettled INVALIDATES profileStats ────────────────────────────────
  it('invalidates ["profileStats", userId] after the mutation settles', async () => {
    uploadRating.mockResolvedValue({ id: 'row-1' })

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['profileStats', 'user-123'],
      })
    })
  })

  // ── 14. onSettled INVALIDATES profileActivity ─────────────────────────────
  it('invalidates ["profileActivity", userId, currentYear] after the mutation settles', async () => {
    uploadRating.mockResolvedValue({ id: 'row-1' })

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    const currentYear = new Date().getFullYear()

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['profileActivity', 'user-123', currentYear],
      })
    })
  })

  // ── 15. uploadRating SERVICE IS CALLED WITH CORRECT ARGUMENTS ─────────────
  it('calls uploadRating with the mutation data and the current user id', async () => {
    uploadRating.mockResolvedValue({ id: 'row-1' })

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUploadRating(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(RATING_DATA)
    })

    await waitFor(() => {
      expect(uploadRating).toHaveBeenCalledWith(RATING_DATA, 'user-123')
    })
  })
})
