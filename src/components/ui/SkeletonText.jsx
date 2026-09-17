export default function SkeletonText({ lines = 1, className = '' }) {
    const widths = ['w-full', 'w-3/4', 'w-1/2', 'w-5/6', 'w-2/3']

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`skeleton-shimmer h-4 rounded-full ${widths[i % widths.length]}`}
                />
            ))}
        </div>
    )
}