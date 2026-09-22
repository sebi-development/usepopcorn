import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { HiMiniUserGroup, HiOutlineUser } from "react-icons/hi2"
import { FiUser, FiBarChart2, FiLogOut } from "react-icons/fi"
import { LuLoaderCircle } from "react-icons/lu"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import useUserProfile from "@/features/profile/hooks/useUserProfile"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import supabase from "@/lib/supabase"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"


function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useOutsideClick(() => setIsOpen(false))
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const closeMenu = () => setIsOpen(false)
  const toggleMenu = () => setIsOpen(prev => !prev)

  const currentUser = useCurrentUser()
  const { profileData } = useUserProfile(currentUser?.id)

  const {mutate: logout, isPending: isLoggingOut} = useMutation({
    mutationFn: () => supabase.auth.signOut(),
    onSuccess: () => {
      queryClient.clear()
      supabase.removeAllChannels()
      navigate('/login')
    },
    onError: () => toast.error('Sign out failed. Please try again.'),
  })


  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-light text-white cursor-pointer transition-colors hover:bg-primary shrink-0 overflow-hidden"
      >
        {profileData?.avatar_url ? (
          <img
            src={profileData.avatar_url}
            alt="User menu"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <HiOutlineUser size={18} />
        )}
      </button>

      {isOpen && (
        <div className="glass-panel bg-surface-500/95! absolute top-[calc(100%+0.6rem)] left-1/2 -translate-x-1/2 w-52 shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-surface-100 mt-1">
            <p className="text-xs text-text-muted">Signed in as {profileData?.username} </p>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-1 py-2">
            <Link
              to="/profile"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 h-8 mx-2 rounded-md text-sm text-text hover:bg-surface-100 transition-colors"
            >
              <FiUser size={15} className="text-text-muted shrink-0" />
              Profile
            </Link>

            <Link
              to="/profile/stats"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 h-8 mx-2 rounded-md text-sm text-text hover:bg-surface-100 transition-colors"
            >
              <FiBarChart2 size={15} className="text-text-muted shrink-0" />
              Statistics
            </Link>

            <Link
              to="/community"
              onClick={closeMenu}
              className="flex items-center gap-3 px-3 h-8 mx-2 rounded-md text-sm text-text hover:bg-surface-100 transition-colors"
            >
              <HiMiniUserGroup size={15} className="text-text-muted shrink-0" />
              Friends
            </Link>

          </div>

          {/* Logout */}
          <div className="flex flex-col pb-2">
            <div className="mx-2 mb-2 h-px bg-surface-100 shrink-0" />
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-3 h-8 mx-2 rounded-md text-sm text-danger cursor-pointer hover:bg-surface-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingOut
                ? <LuLoaderCircle size={15} className="animate-spin shrink-0" />
                : <FiLogOut size={15} className="shrink-0" />
              }
              Sign out
            </button>
          </div>

        </div>
      )}
    </div>
  )
}

export default UserMenu