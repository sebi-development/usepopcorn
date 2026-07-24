import { Link } from 'react-router'
import {
  HiOutlineFilm,
  HiOutlineStar,
  HiOutlineBookmark,
  HiOutlineUsers,
  HiChartBar,
  HiMagnifyingGlass,
} from 'react-icons/hi2'
import BentoGrid from '../../components/BentoGrid'
import Button from '../../components/Button'
import { PopcornIcon } from '../../components/Logo'

export default function LandingPage() {
  return (
    <main className="lp-root">

      {/* Hero */}
      <div className="lp-hero">
        <PopcornIcon className="lp-hero__emoji" />
        <h1 className="lp-hero__headline">
          Your personal <span>cinema</span> companion
        </h1>
        <p className="lp-hero__sub">
          Search any film and series. Rate and keep track what you've seen, and store what you you will use in the future.
        </p>
        <div className="lp-cta-group">
          <Button as={Link} to="/register" variant="solid" size="lg">Get started free</Button>
          <Button as={Link} to="/login" variant="outline" size="lg">Sign in</Button>
        </div>
      </div>

      {/* Bento grid */}
      <BentoGrid>

        <BentoGrid.Card
          span="wide"
          accent
          icon={HiMagnifyingGlass}
          title="Search millions of films and series instantly"
          desc="Live and instant results as you type. Powered by TMDB — every title, every year."
        />

        <BentoGrid.Card
          span="tall"
          icon={HiChartBar}
          title="Watch Stats"
          desc="Average ratings, total runtime, and film count — all calculated for you."
        >
          <div style={{ marginTop: 'auto' }}>
            <p className="bento-stat">142h</p>
            <p className="bento-stat__label">avg. tracked time</p>
          </div>
        </BentoGrid.Card>

        <BentoGrid.Card
          icon={HiOutlineStar}
          title="Rate what you watch"
          desc="Interactive star picker. Your ratings, your opinions, always saved."
        />

        <BentoGrid.Card
          icon={HiOutlineBookmark}
          title="Cloud watchlist"
          desc="Everything syncs to database with your account. Your list travels with you."
        />

        <BentoGrid.Card
          span="wide"
          icon={HiOutlineFilm}
          title="Rich detail pages"
          desc="Posters, cast, plot summaries, TMDB scores and runtime — everything before you commit."
        />

        <BentoGrid.Card
          icon={HiOutlineUsers}
          title="Your profile"
          desc="Browse your saved movies, series and ratings. Every data is searched and calculated for you to help you with your cinema journey.  "
        />
      </BentoGrid>
    </main>
  )
}