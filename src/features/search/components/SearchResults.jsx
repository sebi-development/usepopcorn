import SearchResultItem from "./SearchResultItem"

const STAGGER_STEP_MS = 30
const MAX_STAGGERED_ITEMS = 6

function SearchResults({ results, media_type, onClose }) {
  return (
    <div className="max-h-[28rem] overflow-y-auto divide-y divide-surface-100/60">
      {!results?.length && (
        <p className="text-text-muted text-sm px-4 py-6 text-center">No results found</p>
      )}
      {results?.map((item, index) => (
        <SearchResultItem
          id={item.id}
          onClose={onClose}
          media_type={media_type}
          title={item.title || item.name}
          poster={item.poster_path}
          releaseYear={item?.release_date?.slice(0, 4) || item?.first_air_date?.slice(0, 4)}
          genreIds={item.genre_ids}
          animationDelay={Math.min(index, MAX_STAGGERED_ITEMS) * STAGGER_STEP_MS}
          key={item.id}
        />
      ))}
    </div>
  )
}

export default SearchResults