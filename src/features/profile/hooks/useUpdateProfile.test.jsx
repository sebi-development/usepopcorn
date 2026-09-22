import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import useUpdateProfile from './useUpdateProfile'
import { updateProfile } from '../../../services/profiles'

// ─────────────────────────────────────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../../../services/profiles', () => ({
  updateProfile: vi.fn(),
}))

vi.mock('../../auth/hooks/useCurrentUser', () => ({
  default: () => ({ id: 'user-123' }),
}))

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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries:   { retry: false },
      mutations: { retry: false },
    },
  })
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { Wrapper, queryClient }
}

// Shared payload — realistic update object.
const UPDATE_DATA = { username: 'sebi_dev', country: 'HR' }

// The updated user object the "server" hands back on success.
const UPDATED_USER = {
  id: 'user-123',
  username: 'sebi_dev',
  country: 'HR',
  avatar_url: '/avatar.jpg',
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('useUpdateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── 1. CORRECT RETURN SHAPE ───────────────────────────────────────────────
  it('returns updateUserProfile (function) and isUpdating (boolean)', () => {
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    expect(typeof result.current.updateUserProfile).toBe('function')
    expect(result.current.isUpdating).toBe(false)
  })

  // ── 2. SERVICE CALLED WITH CORRECT ARGUMENTS ──────────────────────────────
  it('calls updateProfile with the mutation data and the current user id', async () => {
    updateProfile.mockResolvedValue(UPDATED_USER)

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(UPDATE_DATA)
    })

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(UPDATE_DATA, 'user-123')
    })
  })

  // ── 3. SUCCESS TOAST ──────────────────────────────────────────────────────
  it('shows a success toast after the profile is updated', async () => {
    updateProfile.mockResolvedValue(UPDATED_USER)

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(UPDATE_DATA)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully')
    })
  })

  // ── 4. PROFILE QUERY INVALIDATED ON SUCCESS ───────────────────────────────
  it('invalidates ["profile", userId] so the profile page re-fetches', async () => {
    updateProfile.mockResolvedValue(UPDATED_USER)

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(UPDATE_DATA)
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['profile', 'user-123'],
      })
    })
  })

  // ── 5. currentUser CACHE UPDATED WITH SERVER RESPONSE ────────────────────
  it('writes the server-returned user object into the ["currentUser"] cache', async () => {
    updateProfile.mockResolvedValue(UPDATED_USER)

    const { Wrapper, queryClient } = createWrapper()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(UPDATE_DATA)
    })

    await waitFor(() => {
      expect(queryClient.getQueryData(['currentUser'])).toEqual(UPDATED_USER)
    })
  })

  // ── 6. setQueryData STORES EXACTLY WHAT THE SERVER RETURNED ──────────────
  it('stores the exact server payload in ["currentUser"] (not a partial / stale value)', async () => {
    const serverResponse = { ...UPDATED_USER, username: 'new_name_from_server' }
    updateProfile.mockResolvedValue(serverResponse)

    const { Wrapper, queryClient } = createWrapper()

    // Seed an old value to ensure it gets replaced, not merged.
    queryClient.setQueryData(['currentUser'], { id: 'user-123', username: 'old_name' })

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile({ username: 'new_name_from_server' })
    })

    await waitFor(() => {
      expect(queryClient.getQueryData(['currentUser'])).toEqual(serverResponse)
    })
  })

  // ── 7. ERROR TOAST WITH MESSAGE ───────────────────────────────────────────
  it('shows toast.error with the error message when the mutation fails', async () => {
    updateProfile.mockRejectedValue(new Error('username already taken'))

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(UPDATE_DATA)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('username already taken')
    })
  })

  // ── 8. NO SUCCESS TOAST ON FAILURE ───────────────────────────────────────
  it('does NOT call toast.success when the mutation fails', async () => {
    updateProfile.mockRejectedValue(new Error('network error'))

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(UPDATE_DATA)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    expect(toast.success).not.toHaveBeenCalled()
  })

  // ── 9. CACHE NOT TOUCHED ON FAILURE ──────────────────────────────────────
  it('does NOT update ["currentUser"] cache when the mutation fails', async () => {
    updateProfile.mockRejectedValue(new Error('db error'))

    const { Wrapper, queryClient } = createWrapper()

    const existingUser = { id: 'user-123', username: 'original' }
    queryClient.setQueryData(['currentUser'], existingUser)

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(UPDATE_DATA)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    // The cache must still hold the original value unchanged.
    expect(queryClient.getQueryData(['currentUser'])).toEqual(existingUser)
  })

  // ── 10. PROFILE QUERY NOT INVALIDATED ON FAILURE ──────────────────────────
  it('does NOT invalidate ["profile"] when the mutation fails', async () => {
    updateProfile.mockRejectedValue(new Error('db error'))

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(UPDATE_DATA)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })

    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  // ── 11. isUpdating LIFECYCLE ──────────────────────────────────────────────
  it('exposes isUpdating=true while the mutation is in flight, false otherwise', async () => {
    let resolveRequest
    updateProfile.mockReturnValue(
      new Promise((res) => {
        resolveRequest = res
      }),
    )

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    // Starts idle.
    expect(result.current.isUpdating).toBe(false)

    act(() => {
      result.current.updateUserProfile(UPDATE_DATA)
    })

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(true)
    })

    // Settle the request and confirm it returns to false.
    await act(async () => {
      resolveRequest(UPDATED_USER)
    })

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false)
    })
  })

  // ── 12. isUpdating RETURNS TO FALSE AFTER FAILURE ─────────────────────────
  it('resets isUpdating to false even when the mutation fails', async () => {
    updateProfile.mockRejectedValue(new Error('db error'))

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(UPDATE_DATA)
    })

    await waitFor(() => {
      expect(result.current.isUpdating).toBe(false)
    })
  })

  // ── 13. ONLY PROFILE QUERY IS INVALIDATED (NOT A BROAD WIPE) ─────────────
  it('invalidates only ["profile", userId] — not unrelated queries', async () => {
    updateProfile.mockResolvedValue(UPDATED_USER)

    const { Wrapper, queryClient } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(UPDATE_DATA)
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled()
    })

    // Should be called exactly once — for the profile key only.
    expect(invalidateSpy).toHaveBeenCalledTimes(1)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile', 'user-123'] })
  })

  // ── 14. WORKS WITH EMAIL UPDATE PAYLOAD ───────────────────────────────────
  it('passes an email payload through to the service unchanged', async () => {
    const emailUpdate = { email: 'new@email.com' }
    updateProfile.mockResolvedValue({ ...UPDATED_USER, email: 'new@email.com' })

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(emailUpdate)
    })

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(emailUpdate, 'user-123')
    })
  })

  // ── 15. WORKS WITH PASSWORD UPDATE PAYLOAD ────────────────────────────────
  it('passes a password payload through to the service unchanged', async () => {
    const passwordUpdate = { password: 'newSecurePass123' }
    updateProfile.mockResolvedValue(UPDATED_USER)

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper })

    act(() => {
      result.current.updateUserProfile(passwordUpdate)
    })

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith(passwordUpdate, 'user-123')
    })
  })
})
