import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
import { HiOutlineUser } from "react-icons/hi2"
import {
  RiUserLine, RiUserFill, RiBookmarkLine, RiBookmarkFill, RiBarChart2Line, RiBarChart2Fill,
  RiGroupLine, RiGroupFill, RiLogoutBoxRLine, RiLogoutBoxRFill,
} from "react-icons/ri"
import { LuLoaderCircle } from "react-icons/lu"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useOutsideClick } from "@/hooks/useOutsideClick"
import useUserProfile from "@/features/profile/hooks/useUserProfile"
import useCurrentUser from "@/features/auth/hooks/useCurrentUser"
import { signOut } from "@/services/session"

// Each icon is outlined at rest and filled on hover (a pair, swapped by CSS)
const MENU_ITEMS = [
  { to: "/profile", label: "Profile", icon: [RiUserLine, RiUserFill] },
  { to: "/watchlist", label: "Watchlist", icon: [RiBookmarkLine, RiBookmarkFill] },
  { to: "/profile/stats", label: "Statistics", icon: [RiBarChart2Line, RiBarChart2Fill] },
  { to: "/community", label: "Friends", icon: [RiGroupLine, RiGroupFill] },
]
const LOGOUT_ICON = [RiLogoutBoxRLine, RiLogoutBoxRFill]
const ITEM_CLASS = "group/item flex items-center gap-3 px-3 h-11 md:h-8 mx-2 rounded-md text-sm hover:bg-surface-100 transition-colors"
// Hover moves the icon one step toward white, still readable on the hovered row
const ICON_CLASS = "flex shrink-0 text-text-muted group-hover/item:text-text"
const DANGER_ICON_CLASS = "flex shrink-0 group-hover/item:text-[color-mix(in_oklab,var(--color-danger),white_30%)]"

function MenuIcon({ icon: [Line, Fill], className }) {
  return (
    <span className={className}>
      <Line size={15} className="group-hover/item:hidden" />
      <Fill size={15} className="hidden group-hover/item:block" />
    </span>
  )
}

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useOutsideClick(() => setIsOpen(false))
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const closeMenu = () => setIsOpen(false)
  const toggleMenu = () => setIsOpen(prev => !prev)

  const currentUser = useCurrentUser()
  const { profileData } = useUserProfile(currentUser?.id)

  // The same element until the photo changes, so opening and closing the menu doesn't re-render the avatar
  const avatarUrl = profileData?.avatar_url
  const avatar = useMemo(() => (avatarUrl
    ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
    : <HiOutlineUser size={18} />
  ), [avatarUrl])

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
        {avatar}
      </button>

      {isOpen && (
        <div className="glass-panel bg-surface-500/95! absolute top-[calc(100%+0.5rem)] left-0 right-0 md:top-[calc(100%+0.6rem)] md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-52 shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-surface-100 mt-1">
            <p className="text-xs text-text-muted">Signed in as {profileData?.username} </p>
          </div>

          <div className="flex flex-col gap-1 py-2">
            {MENU_ITEMS.map(({ to, label, icon }) => (
              <Link key={to} to={to} onClick={closeMenu} className={`${ITEM_CLASS} text-text`}>
                <MenuIcon icon={icon} className={ICON_CLASS} />
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
                : <MenuIcon icon={LOGOUT_ICON} className={DANGER_ICON_CLASS} />
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
