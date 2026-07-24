import { useState } from "react"
import { FiImage } from "react-icons/fi"

function MoviePoster({ src, alt, className = '' }) {
  const [status, setStatus] = useState('loading')

  return (
    <div className={`relative bg-surface-100/50 overflow-hidden ${className}`}>

      {status === 'loading' && (
        <div className="absolute inset-0 skeleton-shimmer rounded-inherit overflow-hidden" />
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-surface-100">
          <FiImage className="text-text-muted opacity-40" />
          <span className="text-text-muted opacity-40 leading-tight text-center">No image</span>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'
          } ${status === 'error' ? 'hidden' : ''}`}
      />
    </div>
  )
}

export default MoviePoster