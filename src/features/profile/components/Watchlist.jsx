import MediaRow from "../../../components/MediaRow"

function Favorites({ watchlist, isLoading }) {

  if (!isLoading && (!watchlist || watchlist.length === 0)) return null

  return (
    <div>
      <MediaRow type limit={15} isLoading={isLoading} heading='Watchlist' data={watchlist} rank={false} showWatchList={false} />
    </div>
  )
}

export default Favorites