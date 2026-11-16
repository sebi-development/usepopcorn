import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { HiMiniUserGroup, HiOutlineUser } from "react-icons/hi2"
import { FiUser, FiBookmark, FiBarChart2, FiLogOut } from "react-icons/fi"
import { LuLoaderCircle } from "react-icons/lu"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import useUserProfile from "@/features/profile/hooks/useUserProfile"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { signOut } from "@/services/session"

const MENU_ITEMS = [
  { to: "/profile", label: "Profile", icon: FiUser },
  { to: "/watchlist", label: "Watchlist", icon: FiBookmark },
  { to: "/profile/stats", label: "Statistics", icon: FiBarChart2 },
  { to: "/community", label: "Friends", icon: HiMiniUserGroup },
]
const ITEM_CLASS = "flex items-center gap-3 px-3 h-11 md:h-8 mx-2 rounded-md text-sm hover:bg-surface-100 transition-colors"

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useOutsideClick(() => setIsOpen(false))
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const closeMenu = () => setIsOpen(false)
  const toggleMenu = () => setIsOpen(prev => !prev)

  const currentUser = useCurrentUser()
  const { profileData } = useUserProfile(currentUser?.id)

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear()
      navigate('/login')
    },
    onError: () => toast.error('Sign out failed. Please try again.'),
  })

  return (
    <div ref={ref} className="md:relative">
      <button
        onClick={toggleMenu}
        aria-label="User menu"
        className="flex items-center justify-center w-11 h-11 md:w-9 md:h-9 rounded-full bg-primary-light text-white cursor-pointer transition-colors hover:bg-primary shrink-0 overflow-hidden"
      >
        {profileData?.avatar_url ? (
          <img
            src={profileData.avatar_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <HiOutlineUser size={18} />
        )}
      </button>

      {isOpen && (
        <div className="glass-panel bg-surface-500/95! absolute top-[calc(100%+0.5rem)] left-0 right-0 md:top-[calc(100%+0.6rem)] md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-52 shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-surface-100 mt-1">
            <p className="text-xs text-text-muted">Signed in as {profileData?.username} </p>
          </div>

          <div className="flex flex-col gap-1 py-2">
            {MENU_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={closeMenu} className={`${ITEM_CLASS} text-text`}>
                <Icon size={15} className="text-text-muted shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col pb-2">
            <div className="mx-2 mb-2 h-px bg-surface-100 shrink-0" />
            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              className={`${ITEM_CLASS} text-danger cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
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
