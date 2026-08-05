import { Link } from "react-router"
import Button from "../../components/Button"


export default function NotFoundPage() {

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      {/* Semantic Screen Reader Fallback */}
      <h1 className="sr-only">404 - Oops! Page Not Found</h1>

      {/* ASCII Art Group */}
      <div
        className="flex flex-col items-center gap-4 mb-8"
        aria-hidden="true"
      >
        {/* "OOPS" Headline */}
        <pre className="inline-block w-fit font-bold leading-none select-none text-left rounded-md shadow-lg" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "14px", lineHeight: "1.17", whiteSpace: "pre", color: "#fff", padding: "16px", margin: "0", backgroundColor: "transparent" }}>
          <span style={{ color: '#AAAAAA' }}>   </span><span style={{ color: '#FFFFFF' }}>▄▄▄▄</span><span style={{ color: '#AAAAAA' }}>▄     </span><span style={{ color: '#FFFFFF' }}>▄▄▄▄</span><span style={{ color: '#AAAAAA' }}>▄   </span><span style={{ color: '#FFFFFF' }}>▄▄▄▄</span><span style={{ color: '#AAAAAA' }}>▄     </span><span style={{ color: '#FFFFFF' }}>▄▄</span><span style={{ color: '#AAAAAA' }}>▄  </span>{"\n"}
          <span style={{ color: '#AAAAAA' }}> </span><span style={{ color: '#FFFFFF' }}>▄</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▀</span><span style={{ color: '#AAAAAA' }}>▀ </span><span style={{ color: '#FFFFFF' }}>▀██</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▄</span><span style={{ color: '#AAAAAA' }}>▄ </span><span style={{ color: '#FFFFFF' }}>▄</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▀</span><span style={{ color: '#AAAAAA' }}>▀ </span><span style={{ color: '#FFFFFF' }}>▀██</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▄</span><span style={{ color: '#AAAAAA' }}>▄</span><span style={{ color: '#FFFFFF' }}>▀███</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▀</span><span style={{ color: '#FFFFFF' }}>▀█</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▄</span><span style={{ color: '#AAAAAA' }}>▄</span><span style={{ color: '#FFFFFF' }}>▄</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▀</span><span style={{ color: '#FFFFFF' }}>▀█</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▀</span><span style={{ color: '#AAAAAA' }}>▀ </span>{"\n"}
          <span style={{ color: '#AAAAAA' }}> </span><span style={{ color: '#FFFFFF' }}>█</span><span style={{ color: '#AAAAAA' }}>█    </span><span style={{ color: '#FFFFFF' }}>██</span><span style={{ color: '#AAAAAA' }}>█ </span><span style={{ color: '#FFFFFF' }}>█</span><span style={{ color: '#AAAAAA' }}>█    </span><span style={{ color: '#FFFFFF' }}>██</span><span style={{ color: '#AAAAAA' }}>█ </span><span style={{ color: '#FFFFFF' }}>██▄▄</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▄▀</span><span style={{ color: '#FFFFFF' }}>▀▀▀</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▄</span><span style={{ color: '#FFFFFF' }}>▄</span><span style={{ color: '#AAAAAA' }}>▄  </span>{"\n"}
          <span style={{ color: '#FFFFFF' }}>▐█</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▄</span><span style={{ color: '#AAAAAA' }}>▄ </span><span style={{ color: '#FFFFFF' }}>▄██</span><span style={{ color: '#AAAAAA' }}>█ </span><span style={{ color: '#FFFFFF' }}>▐█</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▄</span><span style={{ color: '#AAAAAA' }}>▄ </span><span style={{ color: '#FFFFFF' }}>▄██</span><span style={{ color: '#AAAAAA' }}>█  </span><span style={{ color: '#FFFFFF' }}>██</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▄</span><span style={{ color: '#AAAAAA' }}>       </span><span style={{ color: '#FFFFFF' }}>▄</span><span style={{ color: '#AAAAAA' }}>▄</span><span style={{ color: '#FFFFFF' }}>▀█</span><span style={{ color: '#AAAAAA' }}>█</span>{"\n"}
          <span style={{ color: '#AAAAAA' }}> </span><span style={{ color: '#FFFFFF' }}>▀███</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▀</span><span style={{ color: '#FFFFFF' }}>▀</span><span style={{ color: '#AAAAAA' }}>▀   </span><span style={{ color: '#FFFFFF' }}>▀███</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▀</span><span style={{ color: '#FFFFFF' }}>▀</span><span style={{ color: '#AAAAAA' }}>▀  </span><span style={{ color: '#FFFFFF' }}>▄██</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▀</span><span style={{ color: '#AAAAAA' }}>      </span><span style={{ color: '#FFFFFF' }}>▀██</span><span style={{ color: '#FFFFFF', backgroundColor: '#AAAAAA' }}>▀</span><span style={{ color: '#AAAAAA' }}>▀ </span>
        </pre>

        <h2 className="inline-block w-fit font-bold leading-none select-none text-[18px] sm:text-xl md:text-3xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-text to-surface-300 drop-shadow-lg text-left">
          404
        </h2>
      </div>

      {/* Standard Typography */}
      <h3 className="text-2xl md:text-3xl font-bold text-text mb-3 tracking-wide">
        Page not found
      </h3>

      <p className="text-text-muted text-base md:text-lg max-w-md mb-8 leading-relaxed">
        The signal was lost in the void. The page you're looking for doesn't exist, has been moved, or you lack the required clearance.
      </p>

      <Button as={Link} to="/browse" variant="solid" className="px-8 py-3">
        Take me home
      </Button>
    </main>
  )
}