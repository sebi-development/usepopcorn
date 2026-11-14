import MediaRow from "@/components/media/MediaRow/MediaRow"

function Favorites({ favorites, isLoading, showInfo = false }) {
  if (!isLoading && (!favorites || favorites.length === 0)) return null

  return (
    <MediaRow
      limit={15}
      isLoading={isLoading}
      heading="Favorites"
      count={favorites?.length}
      data={favorites}
      rank={false}
      showFavorite={false}
      showInfo={showInfo}
    />
  )
}

export default Favorites