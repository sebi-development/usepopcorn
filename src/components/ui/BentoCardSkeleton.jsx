// A bento card's box (span and size from `className`) filled with the shimmer
export default function BentoCardSkeleton({ className = '' }) {
  return (
    <div className={`bento-card skeleton-shimmer pointer-events-none ${className}`} />
  )
}
