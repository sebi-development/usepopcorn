import { handleNotFoundImg } from '../../utils/utils.js'
import { HiOutlineCalendarDays } from "react-icons/hi2"

export default function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  )
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)} >
      <img src={movie.Poster} alt={`${movie.Title} poster`} onError={handleNotFoundImg} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <HiOutlineCalendarDays style={{ fontSize: "1.8rem", color: "#adb5bd" }} />
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}