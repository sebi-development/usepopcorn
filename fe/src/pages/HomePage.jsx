import { useCallback, useEffect } from "react";
import useMovies from '../hooks/useMovies'
import useDebounce from '../hooks/useDebounce'
import MovieList from "../features/movies/MovieList"
import WatchedList from "../features/watched/WatchedList"
import MovieDetails from "../features/movies/MovieDetails"
import Box from '../components/Box'
import Loader from '../components/Loader'
import { useDispatch, useSelector } from "react-redux";
import { setSelected } from "../store/uiSlice";
import { fetchWatched, fetchAddWatched, fetchDeleteWatched, fetchUpdateWatchedRating } from "../store/watchedSlice"
import ErrorBadge from "../components/ErrorBadge";

function HomePage() {
  // GLOBAL STATE
  const watched = useSelector(state => state.watched.watched)
  const { query, selectedId } = useSelector(state => state.ui)
  const debouncedQuery = useDebounce(query, 500)

  const dispatch = useDispatch()

  // HANDLERS 
  const handleCloseMovie = useCallback(function () {
    dispatch(setSelected(null));
  }, [dispatch]);
  const { movies, isLoading, error } = useMovies(debouncedQuery, handleCloseMovie);

  useEffect(function () {
    dispatch(fetchWatched())
  }, [dispatch])

  function handleSelectMovie(id) {
    dispatch(setSelected(id))
  }

  function handleAddWatched(movie) {
    dispatch(fetchAddWatched(movie))
  }

  function handleDeleteWatched(id) {
    dispatch(fetchDeleteWatched(id))
  }

  function handleUpdateWatchedRating(imdbID, userRating) {
    dispatch(fetchUpdateWatchedRating({ imdbID, userRating }))
  }

  return (
    <>
      <main className="main">
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorBadge message={error} />}
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
            <WatchedList
              watched={watched}
              onDeleteWatched={handleDeleteWatched}
              onUpdateWatchedRating={handleUpdateWatchedRating}
            />
          )}
        </Box>
      </main>
    </>
  );
}

export default HomePage
