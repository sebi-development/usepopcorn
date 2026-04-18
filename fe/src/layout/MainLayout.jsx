import { Outlet } from "react-router"
import Navbar from './Navbar'

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default MainLayout