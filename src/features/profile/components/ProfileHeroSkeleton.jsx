import SkeletonBox from '@/components/ui/SkeletonBox'

export default function ProfileHeroSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">

      {/* Avatar circle */}
      <SkeletonBox className="w-40 h-40 rounded-full shrink-0" />

      {/* Details */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <SkeletonBox className="h-10 w-48 rounded-lg" />
        <SkeletonBox className="h-4 w-36 rounded-full" />
        <SkeletonBox className="h-8 w-24 rounded-lg mt-2" />
      </div>

    </div>
  )
}