import FriendActivityItemSkeleton from "./components/FriendActivityItemSkeleton"

export default function FriendActivityTabSkeleton() {
  return (
    <div className="flex flex-col gap-5">

      {/* Header skeleton — mirrors title + count pill */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 rounded-full skeleton-shimmer" />
        <div className="h-6 w-28 rounded-full skeleton-shimmer" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <FriendActivityItemSkeleton key={i} />
        ))}
      </div>

    </div>
  )
}