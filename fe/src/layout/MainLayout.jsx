import { Outlet } from "react-router"
import Navbar from './Navbar'
import { Toaster } from 'react-hot-toast'

function MainLayout() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#343a40',
            color: '#dee2e6',
            fontSize: '1.6rem',
          },
          success: { iconTheme: { primary: '#40c057', secondary: '#343a40' } },
          error: { iconTheme: { primary: '#fa5252', secondary: '#343a40' } },
        }}
      />
      <Navbar />
      <Outlet />
    </>
  )
}

export default MainLayout