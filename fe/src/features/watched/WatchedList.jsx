import { useState } from 'react'
import { handleNotFoundImg, average } from '../../utils/utils.js'
import { HiOutlineStar, HiOutlineClock, HiHashtag, HiPencil } from "react-icons/hi2"
import { LiaImdb } from "react-icons/lia"
import StarRating from '../../components/StarRating.jsx'

export default function WatchedList({ watched, onDeleteWatched, onUpdateWatchedRating }) {
  return (
    <>
      <WatchedSummary watched={watched} />
      <WatchedMovieList
        watched={watched}
        onDeleteWatched={onDeleteWatched}
        onUpdateWatchedRating={onUpdateWatchedRating}
      />
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

function WatchedMovieList({ watched, onDeleteWatched, onUpdateWatchedRating }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
          onUpdateWatchedRating={onUpdateWatchedRating}
        />
      ))}
    </ul>
  )
}

function WatchedMovie({ movie, onDeleteWatched, onUpdateWatchedRating }) {
  const [isEditingRating, setIsEditingRating] = useState(false)

  function handleUpdateRating(userRating) {
    onUpdateWatchedRating(movie.imdbID, userRating)
    setIsEditingRating(false)
  }

  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} onError={handleNotFoundImg} />
      <h3>{movie.title}</h3>
      <div className="watched-movie-meta">
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
        <button
          className="btn-edit"
          type="button"
          title="Edit rating"
          onClick={() => setIsEditingRating((isEditing) => !isEditing)}
        >
          <HiPencil />
        </button>
        <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>
          X
        </button>
      </div>
      {isEditingRating && (
        <div className="watched-rating-editor">
          <StarRating
            key={`${movie.imdbID}-${movie.userRating}`}
            maxRating={10}
            className="watched-rating-stars"
            defaultRating={movie.userRating}
            onSetRating={handleUpdateRating}
            showText={false}
          />
        </div>
      )}
    </li>
  )
}
