import SkeletonBox from '@/components/ui/SkeletonBox'
import SkeletonText from '@/components/ui/SkeletonText'

export default function MediaDetailSkeleton() {
  return (
    <div className="media-detail-grid delayed-reveal">

      {/* Poster */}
      <div className="[grid-area:poster]">
        <SkeletonBox className="w-full aspect-2/3 rounded-card" />
      </div>

      {/* Info */}
      <div className="[grid-area:info] md:self-end flex flex-col gap-3 md:gap-4">
        <SkeletonBox className="h-9 md:h-14 w-3/4 rounded-lg" />
        <SkeletonBox className="h-4 w-48 max-w-full rounded-full" />
        <div className="flex gap-1.5">
          <SkeletonBox className="h-6 w-14 rounded-full" />
          <SkeletonBox className="h-6 w-16 rounded-full" />
          <SkeletonBox className="h-6 w-12 rounded-full" />
        </div>
      </div>

      {/* Action Section */}
      <div className="[grid-area:rating] md:self-end flex flex-col items-center justify-center py-6 gap-8 w-full">
        {/* Score circle */}
        <SkeletonBox className="w-36 h-36 rounded-full shrink-0" />

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