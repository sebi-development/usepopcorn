export default function BackgroundMesh() {
  return (
    <div
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-surface-900"
      style={{ contain: "strict" }}
    >
      {/* Animated Aurora Blobs — will-change promotes each to its own GPU layer */}
      <div
        className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] max-w-162.5 max-h-162.5 bg-primary/20 rounded-full blur-[80px] animate-blob"
        style={{ willChange: "transform" }}
      />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] max-w-187.5 max-h-187.5 bg-primary-light/15 rounded-full blur-[100px] animate-blob animation-delay-2000"
        style={{ willChange: "transform" }}
      />
      <div
        className="absolute top-[25%] left-[35%] w-[40vw] h-[40vw] max-w-125 max-h-125 bg-primary/12 rounded-full blur-[70px] animate-blob animation-delay-4000"
        style={{ willChange: "transform" }}
      />
      {/* Accent blob — bottom-left for asymmetric depth */}
      <div
        className="absolute bottom-[10%] left-[5%] w-[30vw] h-[30vw] max-w-95 max-h-95 bg-primary-light/8 rounded-full blur-[60px] animate-blob animation-delay-3000"
        style={{ willChange: "transform" }}
      />

      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.035]" />
    </div>
  )
}
