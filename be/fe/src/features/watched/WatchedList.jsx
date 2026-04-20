import { handleNotFoundImg, average } from '../../utils/utils.js'
import { HiOutlineStar, HiOutlineClock, HiHashtag } from "react-icons/hi2"
import { LiaImdb } from "react-icons/lia"

export default function WatchedList({ watched, onDeleteWatched }) {
  return (
    <>
      <WatchedSummary watched={watched} />
      <WatchedMovieList watched={watched} onDeleteWatched={onDeleteWatched} />
    </>
  )
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  const iconStyle = { fontSize: "1.8rem" };

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <HiHashtag style={iconStyle} />
          <span>{watched.length} movies</span>
        </p>
        <p>
          <LiaImdb style={{ ...iconStyle, color: "#fcc419" }} />
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <HiOutlineStar style={{ ...iconStyle, color: "#fcc419" }} />
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <HiOutlineClock style={{ ...iconStyle, color: "#adb5bd" }} />
          <span>{Math.round(avgRuntime) || 0} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
      ))}
    </ul>
  )
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} onError={handleNotFoundImg} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <LiaImdb style={{ fontSize: "1.6rem", color: "#fcc419" }} />
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <HiOutlineStar style={{ fontSize: "1.6rem", color: "#fcc419" }} />
          <span>{movie.userRating}</span>
        </p>
        <p>
          <HiOutlineClock style={{ fontSize: "1.6rem", color: "#adb5bd" }} />
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>
          X
        </button>
      </div>
    </li>
  )
}