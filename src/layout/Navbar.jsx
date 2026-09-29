import { memo } from "react"
import { Link } from "react-router"
import UserMenu from "@/features/auth/components/UserMenu"
import Button from "@/components/ui/Button"
import Logo from "@/components/ui/Logo"
import Search from "@/features/search/components/Search"

function GuestActions() {
  return (
    <div className="flex items-center gap-2">
      <Button as={Link} to="/login" variant="ghost">Sign in</Button>
    </div>
  )
}

// only re-renders when isLoggedIn flips (login / logout)
const Navbar = memo(function Navbar({ isLoggedIn }) {
  return (
    <nav className="
      glass-panel
      relative md:sticky md:top-4 z-50
      w-[calc(100%-2rem)] md:w-[90%] max-w-5xl mx-auto mt-3 md:mt-0
      px-3 py-2 md:px-6 md:py-3
      flex items-center justify-between gap-3 md:gap-4
    ">
      <Logo redirectTo={isLoggedIn ? '/browse' : '/'} />
      {isLoggedIn ? (
        // md:contents keeps the desktop three-way spread; on mobile the two group right
        <div className="flex items-center gap-2 md:contents">
          <Search />
          <UserMenu />
        </div>
      ) : <GuestActions />}
    </nav>
  )
})

export default Navbar