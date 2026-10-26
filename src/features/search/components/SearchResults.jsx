import SearchResultItem from "@/features/search/components/SearchResultItem"

const STAGGER_STEP_MS = 30
const MAX_STAGGERED_ITEMS = 6

function SearchResults({ results, media_type, onClose }) {
  const isPerson = media_type === 'person'
  return (
    <div className="max-h-[min(28rem,65dvh)] overflow-y-auto overscroll-contain rounded-b-card divide-y divide-surface-100/60">
      {!results?.length && (
        <p className="text-text-muted text-sm px-4 py-6 text-center">No results found</p>
      )}
      {results?.map((item, index) => (
        <SearchResultItem
          id={item.id}
          onClose={onClose}
          media_type={media_type}
          title={item.title || item.name}
          poster={isPerson ? item.profile_path : item.poster_path}
          // A person shows their department and known-for titles where a title shows its year and genres
          subtitle={isPerson ? item.known_for_department : item?.release_date?.slice(0, 4) || item?.first_air_date?.slice(0, 4)}
          genreIds={item.genre_ids}
          tags={item.known_for}
          animationDelay={Math.min(index, MAX_STAGGERED_ITEMS) * STAGGER_STEP_MS}
          key={item.id}
        />
      ))}
    </div>
  )
}

export default SearchResults