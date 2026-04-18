import { useEffect, useState } from "react";

import { API_KEY } from "../utils/config";
import { setMoviesCount } from "../store/uiSlice";
import { useDispatch } from "react-redux";

export default function useMovies(query, callback) {
  const dispatch = useDispatch()
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(function () {

    callback?.()

    const controller = new AbortController()
    async function fetchMovies() {
      try {
        setIsLoading(true)
        setError('')

        const url = `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`
        const res = await fetch(url, { signal: controller.signal })

        if (!res.ok) throw new Error('Something wrong wiith fetching movies. Please try again.')

        const data = await res.json()
        if (data.Response === 'False') throw new Error('Movie not found')

        const uniqueMovies = data.Search.filter(
          (movie, index, self) => index === self.findIndex((m) => m.imdbID === movie.imdbID)
        );

        setMovies(uniqueMovies)
        setError('')
        dispatch(setMoviesCount(uniqueMovies.length))

      }
      catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      }
      finally {
        setIsLoading(false)
      }

    }


    if (query.length < 2) {
      setMovies([])
      setError('')
      dispatch(setMoviesCount(0))
      return
    }


    fetchMovies()

    return function () {
      controller.abort()
    }
  }, [query])

  return { movies, isLoading, error }
}