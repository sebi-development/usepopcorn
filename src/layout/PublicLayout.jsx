import { Outlet } from "react-router"
import Navbar from "@/layout/Navbar"
import BackgroundMesh from "@/components/ui/BackgroundMesh"

export default function PublicLayout() {
  return (
    <div className="min-h-dvh flex flex-col relative">
      <BackgroundMesh />
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-6 md:py-12 px-4 relative z-10">
        <Outlet />
      </main>
    </div>
  )
}