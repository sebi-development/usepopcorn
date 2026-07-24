import SkeletonBox from './components/SkeletonBox'
import SkeletonText from './components/SkeletonText'

export default function MediaDetailSkeleton() {
  return (
    <div className="media-detail-grid">

      {/* Poster */}
      <div className="[grid-area:poster]">
        <SkeletonBox className="w-full aspect-2/3 rounded-card" />
      </div>

      {/* Info */}
      <div className="[grid-area:info] flex flex-col gap-6">
        <SkeletonBox className="h-10 w-3/4 rounded-lg" />
        <div className="flex items-center gap-4">
          <SkeletonBox className="h-4 w-16 rounded-full" />
          <SkeletonBox className="h-4 w-20 rounded-full" />
        </div>
        <div className="flex gap-2">
          <SkeletonBox className="h-7 w-16 rounded-full" />
          <SkeletonBox className="h-7 w-20 rounded-full" />
          <SkeletonBox className="h-7 w-14 rounded-full" />
        </div>
      </div>

      {/* Action Section */}
      <div className="[grid-area:rating] flex flex-col items-center justify-center py-6 gap-8 w-full">
        {/* Score circle */}
        <SkeletonBox className="w-28 h-28 rounded-full shrink-0" />

        {/* Rating button */}
        <SkeletonBox className="h-10 w-36 rounded-xl" />

        {/* Watchlist dock */}
        <SkeletonBox className="w-10 h-10 rounded-lg" />
      </div>

      {/* About */}
      <div className="[grid-area:about] bg-surface-500 border border-surface-100 rounded-card p-6 mb-14">
        <SkeletonBox className="h-3 w-24 rounded-full mb-3" />
        <SkeletonText lines={4} />
      </div>

    </div>
  )
}