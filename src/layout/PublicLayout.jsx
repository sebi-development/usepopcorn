import { Outlet } from "react-router"
import Navbar from "@/layout/Navbar"

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Outlet />
      </main>
    </div>
  )
}