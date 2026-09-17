import MediaRow from "@/components/media/MediaRow"
 
function Watchlist({ watchlist, isLoading, showInfo = false }) {
  if (!isLoading && (!watchlist || watchlist.length === 0)) return null

  return (
    <div>
      <MediaRow
        limit={15}
        isLoading={isLoading}
        heading="Watchlist"
        data={watchlist}
        rank={false}
        showWatchlist={false}
        showInfo={showInfo}
      />
    </div>
  )
}

export default Watchlist