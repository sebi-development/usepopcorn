import { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, Navigate, ScrollRestoration } from 'react-router'
import { getSession, onSessionChange } from '@/services/session'
import Navbar from '@/layout/Navbar'
import AppSpinner from '@/layout/AppSpinner'
import { useQueryClient } from '@tanstack/react-query'
import BackgroundMesh from '@/components/ui/BackgroundMesh'
import Search from '@/features/search/components/Search'
import UserMenu from '@/features/auth/components/UserMenu'
import { mediaStateQuery } from '@/features/interactions/hooks/useMediaState'
import queryKeys from '@/lib/queryKeys'
import { prefetch, onIdle, whenQueriesSettle } from '@/layout/prefetch'

// The signed-in navbar's right side. Here, not in Navbar, so the guest pages' bundle never holds them.
const APP_ACTIONS = <><Search /><UserMenu /></>

// A lazy route: the whole signed-in shell (this, search, the user menu, Supabase) loads apart from
// the entry, and index.html asks for it early when a session is stored (vite.config.js)
function AppLayout() {
  const [session, setSession] = useState(undefined)
  const queryClient = useQueryClient()
  const prefetchedRef = useRef(false)

  useEffect(() => {
    getSession().then((session) => {
      setSession(session)
      // Seed the cache immediately — no extra network call
      if (session?.user) queryClient.setQueryData(queryKeys.currentUser, session.user)
    })

    // Keep the cache in sync on auth changes; returns the unsubscribe
    return onSessionChange((session, event) => {
      // The same user signing in again (a password check, a refocused tab) changes nothing the app reads
      if (event === 'SIGNED_IN' && session?.user?.id === queryClient.getQueryData(queryKeys.currentUser)?.id) return
      setSession(session)
      queryClient.setQueryData(queryKeys.currentUser, session?.user ?? null)
    })
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

    // Read once, not via useLocation (that would re-render the layout on every navigation)
    const startedOnHome = window.location.pathname === '/browse'

    whenQueriesSettle(queryClient, () => {
      // T2: ProfilePage, DetailPage and WatchlistPage — commonly visited but not immediate.
      prefetch(() => import('@/pages/app/ProfilePage'))
      prefetch(() => import('@/pages/app/DetailPage'))
      prefetch(() => import('@/pages/app/WatchlistPage'))

      // T3: Community and Stats — lowest traffic, load last, and only for a session that starts on Home
      // (one that opens on a title or a person rarely goes there).
      if (!startedOnHome) return
      onIdle(() => {
        prefetch(() => import('@/pages/app/CommunityPage'))
        prefetch(() => import('@/pages/app/ProfileStatsPage'))
      })
    })
  }, [session, queryClient])

  const outletContext = useMemo(() => ({ session }), [session])

  // still loading
  if (session === undefined) return <AppSpinner />;

  if (session === null) return <Navigate to='/login' replace />

  return (
    <div className="min-h-dvh relative flow-root">
      {/* Back returns to where the page was scrolled, a new page opens at the top. URL writes that only change
          what a page shows (filters, a grid's page) keep the scroll: IN_PLACE in useUrlFilters */}
      <ScrollRestoration />
      <BackgroundMesh />
      <Navbar isLoggedIn>{APP_ACTIONS}</Navbar>
      <main className="pt-4 px-4 md:pt-24 md:px-6 max-w-7xl mx-auto w-full relative z-10">
        <Outlet context={outletContext} />
      </main>
    </div>
  )
}

export default AppLayout