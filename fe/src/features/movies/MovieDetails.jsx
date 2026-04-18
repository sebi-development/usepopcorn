import { useState, useRef, useEffect } from "react";
import { LiaImdb } from "react-icons/lia";
import useKey from "../../hooks/useKey";
import { API_KEY } from "../../utils/config";
import { handleNotFoundImg } from "../../utils/utils"
import Loader from "../../components/Loader";
import StarRating from "../../components/StarRating";
import useDocumentTitle from "../../hooks/useDocumentTitle";


export default function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');

  const countRef = useRef(0);

  useEffect(function () {
    if (userRating) countRef.current++;

  }, [userRating]);

  const isWatched = watched.map(movie => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(movie => movie.imdbID === selectedId)?.userRating;

  const { Title: title, Year: year, Poster: poster, Runtime: runtime, imdbRating, Plot: plot, Released: released, Actors: actors, Director: director, Genre: genre } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(function () {
    async function getMovieDetails() {
      const url = `http://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedId}`;
      setIsLoading(true);
      const res = await fetch(url);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }

    getMovieDetails();

  }, [selectedId]);

  useDocumentTitle(title)
  useKey('Escape', onCloseMovie);

  return (
    <div className="details">
      {isLoading ? <Loader /> : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <img src={poster} alt={`Poster of ${title} movie`} onError={handleNotFoundImg} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>{released} &bull; {runtime}</p>
              <p>{genre}</p>
              <p><LiaImdb style={{ color: "#e9c645", fontSize: "3rem" }} />{imdbRating} Rating</p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={36}
                    onSetRating={setUserRating} />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to watchlist
                    </button>
                  )}
                </>
              ) : (
                <p>You rated this movie already with  {watchedUserRating} </p>
              )}
            </div>

            <p><em>{plot}</em></p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>

          </section>
        </>
      )}
    </div>
  );
}
