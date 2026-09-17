import MediaRow from "@/components/media/MediaRow"

function RecentlyRated({ recentlyRated, isLoading, showInfo = false }) {
  if (!isLoading && (!recentlyRated || recentlyRated.length === 0)) return null

  return (
    <div>
      <MediaRow
        limit={15}
        isLoading={isLoading}
        heading="Recently rated"
        data={recentlyRated}
        rank={false}
        showInfo={showInfo}
      />
    </div>
  )
}

export default RecentlyRated