import { createBrowserRouter, RouterProvider } from "react-router"
import { Toaster } from 'react-hot-toast'
import { LuLoaderCircle } from "react-icons/lu"

import PublicLayout from "@/layout/PublicLayout"
import AppLayout, { AppSpinner } from "@/layout/AppLayout"
import supabase from "@/lib/supabase"
import queryClient from "@/lib/queryClient"
import { mediaStateQuery } from "@/features/interactions/hooks/useMediaState"
import { profileStatsQuery } from "@/features/profile/hooks/useProfileStats"
import { bestRatedQuery } from "@/features/profile/hooks/useBestRated"

// ─── T0: Critical first-paint bundle ──────────────────────────────────────────
// Only what the user sees before they've done anything: landing, login, register.
import LandingPage from "@/pages/public/LandingPage"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import NotFoundPage from "@/pages/public/NotFoundPage"

// Every other page is a route-level `lazy`: the router loads the module before it renders the
// route, so nothing suspends. A React.lazy page always suspends on its first render, and React
// reveals a suspended boundary no sooner than 300ms after its fallback (FALLBACK_THROTTLE_MS),
// which held a cold load of /browse back by ~280ms. Navigations keep the current page until the
// module is in; AppLayout's prefetch cascade has usually loaded it already.
const page = (load) => async () => ({ Component: (await load()).default })

// ─── T1: prefetched the moment session resolves in AppLayout ─────────────────
const BrowsePage = page(() => import("@/pages/app/BrowsePage"))

// ─── T2: commonly visited, prefetched in the first idle slot ─────────────────
const DetailPage = page(() => import("@/pages/app/DetailPage"))
const ProfilePage = page(() => import("@/pages/app/ProfilePage"))
const ForgotPasswordPage = page(() => import("@/pages/auth/ForgotPasswordPage"))
const ResetPasswordPage = page(() => import("@/pages/auth/ResetPasswordPage"))

// ─── T3: low priority, prefetched last ───────────────────────────────────────
const ProfileStatsPage = page(() => import("@/pages/app/ProfileStatsPage"))
const CommunityPage = page(() => import("@/pages/app/CommunityPage"))

// A route loader runs in parallel with the route's `lazy` import, so Home's above-the-fold queries
// (its cards wait on stats and best-rated; the best-rated poster is the page's LCP) start next to the
// BrowsePage chunk download instead of after it. Fire-and-forget: the hooks pick up the in-flight
// or cached results, and nothing here blocks the render.
async function browseLoader({ request }) {
  const category = new URL(request.url).searchParams.get('category')
  if (category && category !== 'home') return null
  const { data } = await supabase.auth.getSession()
  const userId = data.session?.user.id
  if (userId) {
    queryClient.prefetchQuery(mediaStateQuery(userId))
    queryClient.prefetchQuery(profileStatsQuery(userId))
    queryClient.prefetchQuery(bestRatedQuery(userId))
  }
  return null
}

// Shown in place of the layout while a cold load fetches its lazy page module
const publicFallback = (
  <div className="flex items-center justify-center min-h-dvh">
    <LuLoaderCircle className="animate-spin text-primary" size={28} />
  </div>
)

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <NotFoundPage />,
    hydrateFallbackElement: publicFallback,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', lazy: ForgotPasswordPage },
      { path: '/reset-password', lazy: ResetPasswordPage },
      { path: '*', element: <NotFoundPage /> }
    ],
  },
  {
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    hydrateFallbackElement: <AppSpinner />,
    children: [
      { path: '/browse', lazy: BrowsePage, loader: browseLoader },
      { path: '/browse/:id', lazy: DetailPage },
      { path: '/profile', lazy: ProfilePage },
      { path: '/community', lazy: CommunityPage },
      { path: '/profile/stats', lazy: ProfileStatsPage },
      { path: '/profile/:userId', lazy: ProfilePage },
      { path: '*', element: <NotFoundPage /> }
    ],
  }
])

const toastOptions = {
  style: {
    background: '#2b3035',
    color: '#dee2e6',
    border: '1px solid #343a40',
    borderRadius: '0.9rem',
  },
  success: {
    iconTheme: {
      primary: '#40c057',
      secondary: '#2b3035',
    }
  },
  error: {
    iconTheme: {
      primary: '#fa5252',
      secondary: '#2b3035',
    }
  }
}

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={toastOptions}
      />
    </>
  )
}

export default App