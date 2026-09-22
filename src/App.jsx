import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider } from "react-router"
import { Toaster } from 'react-hot-toast'

import PublicLayout from "@/layout/PublicLayout"
import AppLayout from "@/layout/AppLayout"

// ─── T0: Critical first-paint bundle ──────────────────────────────────────────
// Only what the user sees before they've done anything: landing, login, register.
import LandingPage from "@/pages/public/LandingPage"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import NotFoundPage from "@/pages/public/NotFoundPage"

// ─── T1: Lazy — prefetched the moment session resolves in AppLayout ───────────
// BrowsePage is the first authenticated view; it and its deps arrive during the
// auth spinner so there's zero wait on navigation.
const BrowsePage = lazy(() => import("@/pages/app/BrowsePage"))

// ─── T2: Lazy — loaded on demand (user navigates there) ──────────────────────
const DetailPage = lazy(() => import("@/pages/app/DetailPage"))
const ProfilePage = lazy(() => import("@/pages/app/ProfilePage"))
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"))
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"))

// ─── T3: Lazy — low priority, prefetched after BrowsePage mounts ─────────────
const ProfileStatsPage = lazy(() => import("@/pages/app/ProfileStatsPage"))
const CommunityPage = lazy(() => import("@/pages/app/CommunityPage"))


const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <Suspense fallback={null}><ForgotPasswordPage /></Suspense> },
      { path: '/reset-password', element: <Suspense fallback={null}><ResetPasswordPage /></Suspense> },
      { path: '*', element: <NotFoundPage /> }
    ],
  },
  {
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: '/browse', element: <Suspense fallback={null}><BrowsePage /></Suspense> },
      { path: '/browse/:id', element: <Suspense fallback={null}><DetailPage /></Suspense> },
      { path: '/profile', element: <Suspense fallback={null}><ProfilePage /></Suspense> },
      { path: '/community', element: <Suspense fallback={null}><CommunityPage /></Suspense> },
      { path: '/profile/stats', element: <Suspense fallback={null}><ProfileStatsPage /></Suspense> },
      { path: '/profile/:userId', element: <Suspense fallback={null}><ProfilePage /></Suspense> },
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