import { useEffect, useMemo, useState } from 'react'
import { Outlet, Navigate } from 'react-router'
import supabase from '@/lib/supabase'
import Navbar from '@/layout/Navbar'
import { useQueryClient } from '@tanstack/react-query'
import BackgroundMesh from '@/components/ui/BackgroundMesh'

function AppLayout() {
  const [session, setSession] = useState(undefined)
  const queryClient = useQueryClient()

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