import MediaRow from "@/components/media/MediaRow"

function Favorites({ favorites, isLoading, showInfo = false }) {
  if (!isLoading && (!favorites || favorites.length === 0)) return null

  return (
    <div>
      <MediaRow
        limit={15}
        isLoading={isLoading}
        heading="Favorites"
        data={favorites}
        rank={false}
        showFavorite={false}
        showInfo={showInfo}
      />
    </div>
  )
}

export default Favorites