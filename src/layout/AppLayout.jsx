import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, Navigate } from 'react-router'
import supabase from '@/lib/supabase'
import Navbar from '@/layout/Navbar'
import { useQueryClient } from '@tanstack/react-query'
import BackgroundMesh from '@/components/ui/BackgroundMesh'

// Prefetch a lazy chunk without blocking — resolves the dynamic import so
// the module is cached by the time the user navigates to it.
function prefetch(factory) {
  factory().catch(() => {/* network fail is fine — lazy() will retry on navigation */})
}

// ric with a setTimeout fallback for environments without requestIdleCallback.
function onIdle(cb) {
  if ('requestIdleCallback' in window) requestIdleCallback(cb, { timeout: 3000 })
  else setTimeout(cb, 200)
}

function AppLayout() {
  const [session, setSession] = useState(undefined)
  const queryClient = useQueryClient()
  const prefetchedRef = useRef(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      // Seed the cache immediately — no extra network call
      if (data.session?.user) {
        queryClient.setQueryData(['currentUser'], data.session.user)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      // Keep cache in sync on auth changes
      queryClient.setQueryData(['currentUser'], session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  // Prefetch cascade — fires once per session, never on re-renders.
  // T1 → T2 → T3, each tier in its own idle slot so they don't
  // race with the user's first navigation to /browse.
  useEffect(() => {
    if (!session || prefetchedRef.current) return
    prefetchedRef.current = true

    // T1: BrowsePage — first authenticated screen, needs to be ready instantly.
    prefetch(() => import('@/pages/app/BrowsePage'))

    // T2: ProfilePage and DetailPage — commonly visited but not immediate.
    onIdle(() => {
      prefetch(() => import('@/pages/app/ProfilePage'))
      prefetch(() => import('@/pages/app/DetailPage'))
    })

    // T3: Community and Stats — lowest traffic, load last.
    onIdle(() => {
      prefetch(() => import('@/pages/app/CommunityPage'))
      prefetch(() => import('@/pages/app/ProfileStatsPage'))
    })
  }, [session])

  const outletContext = useMemo(() => ({ session }), [session])
  const isLoggedIn = Boolean(session)

  // still loading
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <BackgroundMesh />
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin z-10" />
      </div>
    );
  }

  if (session === null) return <Navigate to='/login' replace />

  return (
    <div className="min-h-screen relative">
      <BackgroundMesh />
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="pt-24 px-6 max-w-7xl mx-auto w-full relative z-10">
        <Outlet context={outletContext} />
      </main>
    </div>
  )
}

export default AppLayout