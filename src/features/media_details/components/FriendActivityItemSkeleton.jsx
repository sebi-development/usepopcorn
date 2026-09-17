import SkeletonBox from "@/components/ui/SkeletonBox";
import SkeletonText from "@/components/ui/SkeletonText";


export default function FriendActivityItemSkeleton() {
  return (
    <div className="flex items-center p-5 bg-surface-900/80 border border-white/5 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2.5 shrink-0 min-w-[120px]">
        <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5 min-w-0">
          <SkeletonText lines={1} className="w-16" />
          <SkeletonText lines={1} className="w-10" />
        </div>
      </div>

      <div className="w-[1px] h-10 bg-white/5 shrink-0 mx-3.5 rounded-full" />

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-end justify-between">
          <SkeletonText lines={1} className="w-10" />
          <SkeletonText lines={1} className="w-8" />
        </div>
        <SkeletonBox className="w-full h-2.5 rounded-full" />
      </div>

    </div>
  )
}