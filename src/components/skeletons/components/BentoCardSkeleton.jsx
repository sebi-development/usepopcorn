export default function BentoCardSkeleton({ className = '' }) {
  return (
    <div className={`bento-card opacity-50 animate-pulse pointer-events-none ${className}`} />
  )
}
