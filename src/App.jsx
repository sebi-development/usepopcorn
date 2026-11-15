import { createBrowserRouter, RouterProvider, redirect } from "react-router"
import { Toaster } from 'react-hot-toast'
import { LuLoaderCircle } from "react-icons/lu"

import PublicLayout from "@/layout/PublicLayout"
import AppSpinner from "@/layout/AppSpinner"
import { hasAuthRedirect, hasStoredSession } from "@/lib/sessionStore"

// ─── T0: Critical first-paint bundle ──────────────────────────────────────────
// Only the landing page: it is the public entry. Login and Register (and react-hook-form) are lazy so
// a signed-in load of /browse doesn't download them; PublicLayout prefetches them after the first paint.
import LandingPage from "@/pages/public/LandingPage"
import NotFoundPage from "@/pages/public/NotFoundPage"

// Every other page is a route-level `lazy`: the router loads the module before it renders the
// route, so nothing suspends. A React.lazy page always suspends on its first render, and React
// reveals a suspended boundary no sooner than 300ms after its fallback (FALLBACK_THROTTLE_MS),
// which held a cold load of /browse back by ~280ms. Navigations keep the current page until the
// module is in; AppLayout's prefetch cascade has usually loaded it already.
const page = (load) => async () => ({ Component: (await load()).default })

// ─── Signed-in shell: AppLayout (navbar search, user menu) and Supabase, apart from the guest entry.
// index.html asks for these chunks next to the entry when a session is stored (vite.config.js). ───
const AppLayout = page(() => import("@/layout/AppLayout"))

// ─── T1: prefetched the moment session resolves in AppLayout ─────────────────
const BrowsePage = page(() => import("@/pages/app/BrowsePage"))

// ─── Auth forms: prefetched by PublicLayout after the first paint ──────────────────────────
const LoginPage = page(() => import("@/pages/auth/LoginPage"))
const RegisterPage = page(() => import("@/pages/auth/RegisterPage"))

// ─── T2: commonly visited, prefetched once the first screen's queries settle ─────────────────
const DetailPage = page(() => import("@/pages/app/DetailPage"))
const ProfilePage = page(() => import("@/pages/app/ProfilePage"))
const ForgotPasswordPage = page(() => import("@/pages/auth/ForgotPasswordPage"))
const ResetPasswordPage = page(() => import("@/pages/auth/ResetPasswordPage"))

// ─── T3: low priority, prefetched last ───────────────────────────────────────
const ProfileStatsPage = page(() => import("@/pages/app/ProfileStatsPage"))
const CommunityPage = page(() => import("@/pages/app/CommunityPage"))

// ─── T4: rarely visited, never prefetched: chunk and data load on navigation ──────────
// No loader: one would put its query factory (and the TMDB service) in the entry bundle
const PersonPage = page(() => import("@/pages/app/PersonPage"))

// Home's data prefetch, a module of its own so its queries and Supabase stay out of the entry chunk
const browseLoader = (args) => import("@/pages/app/browseLoader").then((module) => module.default(args))

// A signed-in visitor skips the landing page and the auth forms (not /reset-password: the
// recovery link signs the user in, and the reset form has to open for them). The stored session
// decides without loading Supabase. A sign-in link's tokens (URL hash) need the client to become one,
// and the client then clears the hash, which runs this loader again: every run waits for that one
// exchange, then the stored session answers again.
let linkSession = null
async function redirectIfSignedIn() {
  if (hasAuthRedirect()) {
    linkSession ??= import("@/services/session").then((module) => module.getSession()).finally(() => { linkSession = null })
  }
  const signedIn = linkSession ? await linkSession : hasStoredSession()
  if (signedIn) throw redirect('/browse')
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
      { path: '/', element: <LandingPage />, loader: redirectIfSignedIn },
      { path: '/login', lazy: LoginPage, loader: redirectIfSignedIn },
      { path: '/register', lazy: RegisterPage, loader: redirectIfSignedIn },
      { path: '/forgot-password', lazy: ForgotPasswordPage },
      { path: '/reset-password', lazy: ResetPasswordPage },
      { path: '*', element: <NotFoundPage /> }
    ],
  },
  {
    lazy: AppLayout,
    errorElement: <NotFoundPage />,
    hydrateFallbackElement: <AppSpinner />,
    children: [
      { path: '/browse', lazy: BrowsePage, loader: browseLoader },
      { path: '/browse/:id', lazy: DetailPage },
      { path: '/person/:id', lazy: PersonPage },
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