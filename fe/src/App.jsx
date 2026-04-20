import { createBrowserRouter, RouterProvider } from "react-router"

import HomePage from './pages/HomePage'
import MainLayout from './layout/MainLayout'
import ProtectedRoute from './layout/ProtectedRoute'
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"

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
      { path: '/register', element: <RegisterPage /> }
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