import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, Navigate } from 'react-router'
import supabase from '@/lib/supabase'
import Navbar from '@/layout/Navbar'
import { useQueryClient } from '@tanstack/react-query'
import BackgroundMesh from '@/components/ui/BackgroundMesh'
import { mediaStateQuery } from '@/features/interactions/hooks/useMediaState'
import queryKeys from '@/lib/queryKeys'
import { prefetch, onIdle, whenQueriesSettle } from '@/utils/prefetch'
import { saveHomePoster } from '@/utils/homePoster'

// Full-screen spinner while the session resolves; also the router's fallback on a cold load
// while the page module downloads, so the two waits look like one
export function AppSpinner() {
  return (
    <div className="min-h-dvh flex items-center justify-center relative">
      <BackgroundMesh />
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin z-10" />
    </div>
  )
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
        queryClient.setQueryData(queryKeys.currentUser, data.session.user)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      // Keep cache in sync on auth changes
      queryClient.setQueryData(queryKeys.currentUser, session?.user ?? null)
      // Signed out: drop the remembered Home poster (the next user's loader would fetch it)
      if (!session) saveHomePoster(null)
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  // Prefetch cascade — fires once per session, never on re-renders.
  // T1 at once; T2 and T3 only after the first screen's queries settle, each in its own idle slot,
  // so on a slow link they don't take bandwidth from that screen's data and LCP image.
  useEffect(() => {
    if (!session || prefetchedRef.current) return
    prefetchedRef.current = true

    // T1: BrowsePage — first authenticated screen, needs to be ready instantly.
    prefetch(() => import('@/pages/app/BrowsePage'))
    // Favorite/watchlist/own-rating state every card reads, warm before the first cards render.
    queryClient.prefetchQuery(mediaStateQuery(session.user.id))

    whenQueriesSettle(queryClient, () => {
      // T2: ProfilePage and DetailPage — commonly visited but not immediate.
      prefetch(() => import('@/pages/app/ProfilePage'))
      prefetch(() => import('@/pages/app/DetailPage'))

      // T3: Community and Stats — lowest traffic, load last.
      onIdle(() => {
        prefetch(() => import('@/pages/app/CommunityPage'))
        prefetch(() => import('@/pages/app/ProfileStatsPage'))
      })
    })
  }, [session, queryClient])

  const outletContext = useMemo(() => ({ session }), [session])
  const isLoggedIn = Boolean(session)

  // still loading
  if (session === undefined) return <AppSpinner />;

  if (session === null) return <Navigate to='/login' replace />

  return (
    // flow-root keeps the navbar's mobile top margin inside this box: collapsed through it, the
    // margin moved <body> down 12px when the layout replaced the spinner (a CLS of 12/viewport)
    <div className="min-h-dvh relative flow-root">
      <BackgroundMesh />
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="pt-4 px-4 md:pt-24 md:px-6 max-w-7xl mx-auto w-full relative z-10">
        <Outlet context={outletContext} />
      </main>
    </div>
  )
}

export default AppLayout