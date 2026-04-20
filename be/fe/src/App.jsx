import { createBrowserRouter, RouterProvider } from "react-router"

import HomePage from './pages/HomePage'
import MainLayout from './layout/MainLayout'

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      }
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