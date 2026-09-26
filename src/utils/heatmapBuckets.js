const BUCKETS = [
  { threshold: 0, className: 'bg-surface-100' },
  { threshold: 0.25, className: 'bg-primary/30' },
  { threshold: 0.5, className: 'bg-primary/55' },
  { threshold: 0.75, className: 'bg-primary/80' },
  { threshold: 1, className: 'bg-primary-light' },
]

const REVERSED_BUCKETS = [...BUCKETS].slice(1).reverse()

export function bucketFor(count, max) {
  if (count === 0) return BUCKETS[0].className
  if (max === 0) return BUCKETS[0].className
  const ratio = count / max
  const bucket = REVERSED_BUCKETS.find(b => ratio >= b.threshold)
  return bucket ? bucket.className : BUCKETS[1].className
}
