import SkeletonBox from "@/components/ui/SkeletonBox";
import SkeletonText from "@/components/ui/SkeletonText";


export default function CommunityCardSkeleton() {
  return (
    <article className="p-5 bg-surface-500 border border-surface-100 rounded-card flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <SkeletonText lines={1} className="w-32" />
          <SkeletonText lines={1} className="w-20" />
        </div>
        <SkeletonBox className="w-12 h-4 rounded-full shrink-0" />
      </div>

      {/* Media block */}
      <div className="flex gap-4 p-3 bg-surface-900/40 rounded-xl border border-white/5">
        <SkeletonBox className="w-16 sm:w-20 shrink-0 rounded-md aspect-2/3" />
        <div className="flex flex-col justify-center gap-3 flex-1 min-w-0">
          <SkeletonText lines={2} />
          <SkeletonBox className="w-20 h-7 rounded-md" />
        </div>
      </div>

    </article>
  )
}