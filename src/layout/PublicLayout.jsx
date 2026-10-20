import { useEffect } from "react"
import { Outlet } from "react-router"
import Navbar from "@/layout/Navbar"
import BackgroundMesh from "@/components/ui/BackgroundMesh"
import { prefetch, onIdle } from "@/utils/prefetch"

export default function PublicLayout() {
  // Login and Register are lazy routes; warm them so the landing page's buttons open them at once
  useEffect(() => {
    onIdle(() => {
      prefetch(() => import("@/pages/auth/LoginPage"))
      prefetch(() => import("@/pages/auth/RegisterPage"))
    })
  }, [])

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