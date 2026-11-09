import { memo, useState } from "react"
import { FiImage } from "react-icons/fi"

// `priority` is for a poster that is its page's LCP: fetched at once, ahead of other images.
// `fallbackLabel` (e.g. the title) replaces "No image".
function MoviePoster({ src, srcSet, sizes, alt, className = '', priority = false, fallbackLabel }) {
  // An <img> without a src fires neither load nor error, so a missing image starts as the fallback
  const [status, setStatus] = useState(src ? 'loading' : 'error')

  return (
    <div className={`relative bg-surface-100/50 overflow-hidden ${className}`}>

      {status === 'loading' && (
        <div className="absolute inset-0 skeleton-shimmer rounded-inherit overflow-hidden" />
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-surface-100">
          <FiImage className="text-text-muted opacity-40" />
          <span className={`text-text-muted leading-tight text-center ${fallbackLabel ? 'px-3 text-sm font-medium line-clamp-3' : 'opacity-40'}`}>
            {fallbackLabel ?? 'No image'}
          </span>
        </div>
      )}

      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'
          } ${status === 'error' ? 'hidden' : ''}`}
      />
    </div>
  )
}

export default memo(MoviePoster)