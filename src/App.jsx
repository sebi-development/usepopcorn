import { createBrowserRouter, RouterProvider } from "react-router"
import { Toaster } from 'react-hot-toast'

import PublicLayout from "./layout/PublicLayout"
import AppLayout from "./layout/AppLayout"

import LandingPage from "./pages/public/LandingPage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import DetailPage from "./pages/app/DetailPage"
import BrowsePage from "./pages/app/BrowsePage"
import ProfilePage from "./pages/app/ProfilePage"
import ProfileStatsPage from "./pages/app/ProfileStatsPage"
import CommunityPage from "./pages/app/CommunityPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import NotFoundPage from "./pages/public/NotFoundPage"


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
      { path: '/browse/:id', element: <DetailPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/community', element: <CommunityPage /> },
      { path: '/profile/stats', element: <ProfileStatsPage /> },
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