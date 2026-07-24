import MediaRow from "../../../components/MediaRow"

function Favorites({ favorites, isLoading }) {

  if (!isLoading && (!favorites || favorites.length === 0)) return null

  return (
    <div>
      <MediaRow type limit={15} isLoading={isLoading} heading='Favorites' data={favorites} rank={false} showFavorite={false} />
    </div>
  )
}

export default Favorites