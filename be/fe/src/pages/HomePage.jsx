import { useCallback, useEffect, useState } from "react";
import useMovies from '../hooks/useMovies'
import useDebounce from '../hooks/useDebounce'
import MovieList from "../features/movies/MovieList"
import WatchedList from "../features/watched/WatchedList"
import MovieDetails from "../features/movies/MovieDetails"
import Box from '../components/Box'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'
import { useDispatch, useSelector } from "react-redux";
import { removeMovie, setWatched, upsertMovie } from "../store/watchedSlice";
import { setSelected } from "../store/uiSlice";
import { addWatchedMovie, deleteWatchedMovie, getWatchedMovies } from "../utils/api";

function HomePage() {
  // GLOBAL STATE
  const watched = useSelector(state => state.watched.watched)
  const { query, selectedId } = useSelector(state => state.ui)
  const debouncedQuery = useDebounce(query, 500)
  const [isWatchedLoading, setIsWatchedLoading] = useState(true)
  const [watchedError, setWatchedError] = useState('')

  const dispatch = useDispatch()

  // HANDLERS 
  const handleCloseMovie = useCallback(function () {
    dispatch(setSelected(null));
  }, [dispatch]);
  const { movies, isLoading, error } = useMovies(debouncedQuery, handleCloseMovie);

  useEffect(function () {
    let ignore = false

    async function loadWatched() {
      try {
        setIsWatchedLoading(true)
        const movies = await getWatchedMovies()

        if (ignore) return

        dispatch(setWatched(movies))
        setWatchedError('')
      }
      catch (err) {
        if (!ignore) setWatchedError(err.message)
      }
      finally {
        if (!ignore) setIsWatchedLoading(false)
      }
    }

    loadWatched()

    return function () {
      ignore = true
    }
  }, [dispatch])

  function handleSelectMovie(id) {
    dispatch(setSelected(id))
  }

  function handleAddWatched(movie) {
    async function saveMovie() {
      try {
        const savedMovie = await addWatchedMovie(movie)
        dispatch(upsertMovie(savedMovie))
        setWatchedError('')
      }
      catch (err) {
        setWatchedError(err.message)
      }
    }

    saveMovie()
  }

  function handleDeleteWatched(id) {
    async function removeWatchedMovie() {
      try {
        await deleteWatchedMovie(id)
        dispatch(removeMovie(id))
        setWatchedError('')
      }
      catch (err) {
        setWatchedError(err.message)
      }
    }

    removeWatchedMovie()
  }

  return (
    <>
      <main className="main">
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              {isWatchedLoading && <Loader />}
              {!isWatchedLoading && !watchedError && (
                <WatchedList watched={watched} onDeleteWatched={handleDeleteWatched} />
              )}
              {!isWatchedLoading && watchedError && (
                <ErrorMessage message={watchedError} />
              )}
            </>
          )}
        </Box>
      </main>
    </>
  );
}

export default HomePage