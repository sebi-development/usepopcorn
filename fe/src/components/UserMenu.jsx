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
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.auth.user)

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="user-menu">
      <NumResults />
      <div className="user-menu__container">
        <div className="user-menu__trigger">
          <HiOutlineUser />
        </div>
        <div className="user-menu__dropdown">
          <p className="user-menu__email">Hello, {user?.name}</p>
          <Link to="/profile" className="profile-link">
            Edit Profile
          </Link>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserMenu