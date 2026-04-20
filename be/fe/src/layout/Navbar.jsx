import { useRef } from "react"
import useKey from "../hooks/useKey"
import { useDispatch, useSelector } from "react-redux"

import { setQuery } from '../store/uiSlice'

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}

function Search() {
  const query = useSelector(state => state.ui.query)
  const dispatch = useDispatch()

  const inputEl = useRef(null)

  useKey('Enter', function () {
    if (document.activeElement === inputEl.current) return
    inputEl.current.focus()
    dispatch(setQuery(''))
  })

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => dispatch(setQuery(e.target.value))}
      ref={inputEl}
    />
  )
}


function NumResults() {
  const moviesCount = useSelector(state => state.ui.moviesCount)
  return (
    <p className="num-results">
      Found <strong> {moviesCount} </strong> results
    </p>
  )
}

export default function Navbar() {

  return (
    <nav className="nav-bar">
      <Logo />
      <Search />
      <NumResults />
    </nav>
  )
}