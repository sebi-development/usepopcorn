import { memo } from "react"
import { Link } from "react-router"
import Button from "@/components/ui/Button"
import Logo from "@/components/ui/Logo"

function GuestActions() {
  return (
    <div className="flex items-center gap-2">
      <Button as={Link} to="/login" variant="ghost">Sign in</Button>
    </div>
  )
}

// Guests (landing/login) keep the floating sticky bar at every size. The logged-in app
// drops it below md to give the screen back; it stays `relative` so the user menu can
// anchor to it.
const POSITION_GUEST = 'sticky top-4'
const POSITION_APP = 'relative md:sticky md:top-4'

// Guests get the Sign in button; the app passes its own actions (search, user menu) as children, so
// this file, shared with the guest pages' entry chunk, doesn't import them
const Navbar = memo(function Navbar({ isLoggedIn, children }) {
  return (
    <nav className={`
      glass-panel
      ${isLoggedIn ? POSITION_APP : POSITION_GUEST} z-50
      w-[calc(100%-2rem)] md:w-[90%] max-w-5xl mx-auto mt-3 md:mt-0
      px-4 py-2 md:px-6 md:py-3
      flex items-center justify-between gap-3 md:gap-4
    `}>
      <Logo className="shrink-0 py-2 -my-2" redirectTo={isLoggedIn ? '/browse' : '/'} />
      {children ?? <GuestActions />}
    </nav>
  )
})

export default Navbar