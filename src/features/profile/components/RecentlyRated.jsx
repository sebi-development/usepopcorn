import MediaRow from "../../../components/MediaRow"

function RecentlyRated({recentlyRated, isLoading}) {
    if (!isLoading && (!recentlyRated || recentlyRated.length === 0)) return null;
    return (
        <div>
            <MediaRow type limit={15} isLoading={isLoading} heading='Recently rated' data={recentlyRated} rank={false} />
        </div>
    )
}

export default RecentlyRated