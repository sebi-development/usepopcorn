import { memo } from "react"
import { Link } from "react-router"
import UserMenu from "../components/UserMenu"
import Button from "../components/Button"
import Logo from "../components/Logo"
import Search from "../features/search/components/Search"

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
      sticky top-4 z-50
      w-[90%] max-w-5xl mx-auto
      bg-surface-500/80 backdrop-blur-md
      border border-surface-100 rounded-2xl
      px-6 py-3
      flex items-center justify-between gap-4
    ">
      <Logo redirectTo={isLoggedIn ? '/browse' : '/'} />
      {isLoggedIn && <Search />}
      {isLoggedIn ? <UserMenu /> : <GuestActions />}
    </nav>
  )
})

export default Navbar