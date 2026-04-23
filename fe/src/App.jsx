import { createBrowserRouter, RouterProvider } from "react-router"

import HomePage from './pages/HomePage'
import MainLayout from './layout/MainLayout'
import ProtectedRoute from './layout/ProtectedRoute'
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ProfilePage from "./pages/ProfilePage"
import LandingPage from './pages/LandingPage'

import { profileAction, profileLoader } from "./pages/ProfilePage"

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        )
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        path: '/profile', element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
        loader: profileLoader,
        action: profileAction
      },
      { path: '/landing', element: <LandingPage /> }
    ]
  }
])

function App() {
  return (
    <RouterProvider router={router} >

    </ RouterProvider>
  )
}


export default App