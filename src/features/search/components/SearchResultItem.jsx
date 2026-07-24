import { useNavigate } from "react-router"
import MoviePoster from "../../../components/MoviePoster"
import Chip from "../../../components/Chip"
import { getGenreNames } from "../../../utils/genres"

function SearchResultItem({ id, title, poster, releaseYear, media_type, genreIds, onClose, animationDelay = 0 }) {
  const navigate = useNavigate()
  const IMAGE_URL = import.meta.env.VITE_TMDB_IMAGE_URL
  const genres = getGenreNames(genreIds, media_type)

  function handleClick() {
    onClose()
    navigate(`/browse/${id}`, { state: { type: media_type } })
  }

  return (
    <div
      onClick={handleClick}
      style={{ animationDelay: `${animationDelay}ms` }}
      className="flex items-center gap-5 px-5 py-4 cursor-pointer hover:bg-surface-100 transition-colors animate-[item-in_280ms_ease-out_both]"
    >
      <MoviePoster
        src={IMAGE_URL + poster}
        alt={title}
        className="w-16 h-24 shrink-0 rounded-md text-[0.45rem]"
      />
      <div className="flex flex-col gap-1.5 min-w-0">
        <h4 className="text-text font-semibold text-lg truncate">{title}</h4>
        <span className="text-text-muted text-sm">{releaseYear}</span>
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {genres.map(name => <Chip key={name} label={name} size="sm" />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResultItem