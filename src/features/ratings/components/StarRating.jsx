import { useState } from 'react';
import { HiStar } from 'react-icons/hi2';

export default function StarRating({ maxStars = 10, rating = 0, onRate, size = 28 }) {
  const [hoverRating, setHoverRating] = useState(0);

  function handleRate(starValue) {
    if (onRate) onRate(starValue);
  }

  const displayRating = hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHoverRating(0)}
        role="radiogroup"
        aria-label="Rate this movie"
      >
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isActive = displayRating >= starValue;
          const isCurrentHover = hoverRating === starValue;

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={rating === starValue}
              onClick={() => handleRate(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onFocus={() => setHoverRating(starValue)}
              onBlur={() => setHoverRating(0)}
              className="relative z-10 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light rounded-full transition-transform duration-200 ease-out hover:scale-125 active:scale-75"
            >
              {/* The CSS Ambient Glow */}
              {isCurrentHover && (
                <div className="absolute inset-0 bg-amber-400/40 blur-md rounded-full -z-10 pointer-events-none" />
              )}

              <HiStar
                size={size}
                className={`transition-colors duration-200 ${isActive
                    ? 'text-amber-400 drop-shadow-sm'
                    : 'text-white/20 hover:text-white/40'
                  }`}
              />
            </button>
          );
        })}
      </div>

      <div
        className="inline-flex items-center px-3 py-1 rounded-card text-xs border border-white/10 backdrop-blur-md transition-opacity duration-200"
        style={{ background: 'rgba(255,255,255,0.06)', opacity: displayRating > 0 ? 1 : 0 }}
      >
        <span className="text-amber-400 font-semibold">{displayRating}/10</span>
      </div>
    </div>
  );
}