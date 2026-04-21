import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, Link } from "react-router"
import { HiOutlineUser } from "react-icons/hi2"
import { logout } from "../store/authSlice"

function NumResults() {
  const moviesCount = useSelector(state => state.ui.moviesCount)
  return (
    <p className="num-results">
      Found <strong>{moviesCount}</strong> results
    </p>
  )
}

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.auth.user)
  const menuRef = useRef(null)

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <NumResults />
      <div className="user-menu__trigger" onClick={() => setIsOpen(o => !o)}>
        <HiOutlineUser />
      </div>
      {isOpen && (
        <div className="user-menu__dropdown">
          <p className="user-menu__email">{user?.email}</p>
          <Link to="/profile" className="profile-link">
            Edit Profile
          </Link>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu