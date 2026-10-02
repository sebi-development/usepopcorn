import { useState } from 'react';
import { HiStar } from 'react-icons/hi2';

// `children` sit at the end of the star row, after a thin separator (e.g. the delete button)
export default function StarRating({ maxStars = 10, rating = 0, onRate, size = 28, children }) {
  const [hoverRating, setHoverRating] = useState(0);

  function handleRate(starValue) {
    if (onRate) onRate(starValue);
  }

  const displayRating = hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex flex-col items-center gap-1.5 w-full min-w-0">
      {/* Fluid row: stars shrink to fit the container (the md+ rating column is only ~140–240px).
          Below md the row may use the full width with 24px stars and 44px-tall tap targets;
          from md up `size` decides. */}
      <div
        className="flex items-center w-full min-w-0 max-w-84 md:max-w-(--stars-max)"
        style={{ '--stars-max': `${maxStars * (size + 10)}px`, '--star-max': `${size}px` }}
      >
      <div
        className="flex items-center flex-1 min-w-0"
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
              className="relative z-10 flex flex-1 min-w-0 justify-center px-px py-2.5 sm:px-0.5 md:py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light rounded-full transition-transform duration-200 ease-out hover:scale-125 active:scale-75"
            >
              {/* The CSS Ambient Glow */}
              {isCurrentHover && (
                <div className="absolute inset-0 bg-amber-400/40 blur-md rounded-full -z-10 pointer-events-none" />
              )}

              <HiStar
                size={size}
                className={`w-full h-auto max-w-6 md:max-w-(--star-max) transition-colors duration-200 ${isActive
                    ? 'text-amber-400 drop-shadow-sm'
                    : 'text-white/20 hover:text-white/40'
                  }`}
              />
            </button>
          );
        })}
      </div>
      {children && (
        <>
          <div className="w-px h-5 bg-white/10 mx-1.5 shrink-0" />
          {children}
        </>
      )}
      </div>

      <div className="flex items-center justify-center">
        <div
          className="inline-flex items-center px-2 py-0.5 rounded-card text-[11px] border border-white/10 backdrop-blur-md transition-opacity duration-200"
          style={{ background: 'rgba(255,255,255,0.06)', opacity: displayRating > 0 ? 1 : 0 }}
        >
          <span className="text-amber-400 font-semibold">{displayRating}/10</span>
        </div>
      </div>
    </div>
  );
}