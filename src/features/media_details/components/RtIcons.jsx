// Rotten Tomatoes' own marks, simplified to a few inline paths (no image request): a fresh tomato
// or a green splat for the Tomatometer, a full or tipped popcorn bucket for the Popcornmeter.
// RT calls a score fresh from 60%.

export function TomatoIcon({ fresh, className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {fresh ? (
        <>
          <circle cx="12" cy="13.5" r="8.5" fill="#fa320a" />
          <path d="M12 8c-1.6-2-3.6-2.6-5.5-2 1.8.5 3 1.3 3.8 2.4-1.6-.2-3 .3-4 1.3 2-.3 3.8 0 5.7.8 1.9-.8 3.7-1.1 5.7-.8-1-1-2.4-1.5-4-1.3.8-1.1 2-1.9 3.8-2.4-1.9-.6-3.9 0-5.5 2z" fill="#00912d" />
        </>
      ) : (
        <path d="M12 2.5l1.7 4.4 4.5-2.1-1.9 4.5 4.8 1.2-4.4 2.3 2.9 4-4.8-.6-.4 4.9-2.4-3.6-2.4 3.6-.4-4.9-4.8.6 2.9-4L3.4 10.5l4.8-1.2-1.9-4.5 4.5 2.1z" fill="#0ac855" />
      )}
    </svg>
  )
}

const Bucket = () => (
  <>
    <path d="M6 11h12l-1.6 10.5H7.6z" fill="#fff" />
    <path d="M9.3 11l.6 10.5M12 11v10.5M14.7 11l-.6 10.5" stroke="#fa320a" strokeWidth="1.5" />
  </>
)

export function PopcornIcon({ fresh, className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {fresh ? (
        <>
          <g fill="#ffd23f">
            <circle cx="7.5" cy="9.5" r="2.3" />
            <circle cx="11" cy="7.5" r="2.6" />
            <circle cx="14.8" cy="8" r="2.4" />
            <circle cx="17" cy="10" r="1.9" />
            <circle cx="12.5" cy="10.2" r="2" />
          </g>
          <Bucket />
        </>
      ) : (
        <>
          <g transform="rotate(-70 12 16)"><Bucket /></g>
          <g fill="#ffd23f">
            <circle cx="3.2" cy="20.6" r="1.6" />
            <circle cx="6.4" cy="21.6" r="1.3" />
            <circle cx="2.6" cy="17.2" r="1.2" />
          </g>
        </>
      )}
    </svg>
  )
}
