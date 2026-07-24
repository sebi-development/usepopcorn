import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { HiMiniUserGroup, HiOutlineUser } from "react-icons/hi2"
import { FiUser, FiBarChart2, FiLogOut } from "react-icons/fi"
import { useOutsideClick } from "../hooks/useOutsideClick"
import useProfileData from "../features/profile/hooks/useProfileData"
import useCurrentUser from "../features/auth/hooks/useCurrentUser"
import supabase from "../lib/supabase"
import { QueryClient } from "@tanstack/react-query"


function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useOutsideClick(() => setIsOpen(false))
  const navigate = useNavigate()

  const currentUser = useCurrentUser()
  const { profileData } = useProfileData(currentUser?.id)

  async function handleLogout() {
    await supabase.auth.signOut()
    QueryClient.clear()
    supabase.removeAllChannels()
    navigate('/login')
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-light text-white cursor-pointer transition-colors hover:bg-primary shrink-0 overflow-hidden"
      >
        {profileData?.avatar_url ? (
          <img
            src={profileData.avatar_url}
            alt="User menu"
            className="w-full h-full object-cover"
          />
        ) : (
          <HiOutlineUser size={18} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+0.6rem)] left-1/2 -translate-x-1/2 w-52 bg-surface-500 border border-surface-100 rounded-lg shadow-2xl flex flex-col overflow-visible z-50">
          {/* Arrow pointer */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-500 border-l border-t border-surface-100 rotate-45" />

          <div className="px-4 py-3 border-b border-surface-100 mt-1">
            <p className="text-xs text-text-muted">Signed in as {profileData?.username} </p>
          </div>

          {/* Items */}
          <div className="flex flex-col py-1">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface-100 transition-colors"
            >
              <FiUser size={15} className="text-text-muted" />
              Profile
            </Link>

            <Link
              to="/profile/stats"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface-100 transition-colors"
            >
              <FiBarChart2 size={15} className="text-text-muted" />
              Statistics
            </Link>

            <Link
              to="/community"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-surface-100 transition-colors"
            >
              <HiMiniUserGroup size={15} className="text-text-muted" />
              Friends
            </Link>

          </div>

          {/* Logout */}
          <div className="border-t border-surface-100 py-1">
            <button
              onClick={() => {
                handleLogout()
                navigate('/login')
              }
              }
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-surface-100 transition-colors"
            >
              <FiLogOut size={15} />
              Sign out
            </button>
          </div>

        </div>
      )}
    </div>
  )
}

export default UserMenu