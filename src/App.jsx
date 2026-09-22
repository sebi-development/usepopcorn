import { lazy, Suspense } from "react"
import { createBrowserRouter, RouterProvider } from "react-router"
import { Toaster } from 'react-hot-toast'

import PublicLayout from "@/layout/PublicLayout"
import AppLayout from "@/layout/AppLayout"

import LandingPage from "@/pages/public/LandingPage"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import BrowsePage from "@/pages/app/BrowsePage"
import ProfilePage from "@/pages/app/ProfilePage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"
import NotFoundPage from "@/pages/public/NotFoundPage"

const DetailPage = lazy(() => import("@/pages/app/DetailPage"))
const CommunityPage = lazy(() => import("@/pages/app/CommunityPage"))
const ProfileStatsPage = lazy(() => import("@/pages/app/ProfileStatsPage"))


const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '*', element: <NotFoundPage /> }
    ],
  },
  {
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: '/browse', element: <BrowsePage /> },
      { path: '/browse/:id', element: <Suspense fallback={null}><DetailPage /></Suspense> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/community', element: <Suspense fallback={null}><CommunityPage /></Suspense> },
      { path: '/profile/stats', element: <Suspense fallback={null}><ProfileStatsPage /></Suspense> },
      { path: '/profile/:userId', element: <ProfilePage /> },
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