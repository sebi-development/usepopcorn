// Aurora blobs: gradient glows (.mesh-blob in index.css), no blur filter. RGB is the theme's
// primary (103 65 217) and primary-light (121 80 242); spread is ~2x the blur they replaced.
// will-change promotes each to its own GPU layer for the transform animation.
const BLOBS = [
  {
    className: "top-[-15%] left-[-10%] w-[55vw] h-[55vw] max-w-162.5 max-h-162.5",
    style: { "--blob-rgb": "103 65 217", "--blob-alpha": 0.2, "--blob-spread": "160px", willChange: "transform" },
  },
  {
    className: "bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] max-w-187.5 max-h-187.5 animation-delay-2000",
    style: { "--blob-rgb": "121 80 242", "--blob-alpha": 0.15, "--blob-spread": "200px", willChange: "transform" },
  },
  {
    className: "top-[25%] left-[35%] w-[40vw] h-[40vw] max-w-125 max-h-125 animation-delay-4000",
    style: { "--blob-rgb": "103 65 217", "--blob-alpha": 0.12, "--blob-spread": "140px", willChange: "transform" },
  },
  {
    // Accent blob — bottom-left for asymmetric depth
    className: "bottom-[10%] left-[5%] w-[30vw] h-[30vw] max-w-95 max-h-95 animation-delay-3000",
    style: { "--blob-rgb": "121 80 242", "--blob-alpha": 0.08, "--blob-spread": "120px", willChange: "transform" },
  },
]

export default function BackgroundMesh() {
  return (
    <div
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-surface-900"
      style={{ contain: "strict" }}
    >
      {BLOBS.map(({ className, style }, i) => (
        <div key={i} className={`absolute mesh-blob animate-blob ${className}`} style={style} />
      ))}

      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.035]" />
    </div>
  )
}
