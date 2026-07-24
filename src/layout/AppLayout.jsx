import { useEffect, useState } from 'react'
import { Outlet, Navigate } from 'react-router'
import supabase from '../lib/supabase'
import Navbar from './Navbar'
import { useQueryClient } from '@tanstack/react-query'

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
  }, [])

  // still loading — don't flash login redirect
  if (session === undefined) return null

  // no session — redirect to login
  if (session === null) return <Navigate to='/login' replace />

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar session={session} />
      <main className="pt-24 px-6 max-w-7xl mx-auto w-full">
        <Outlet context={ { session } }/>
      </main>
    </div>
  )
}

export default AppLayout