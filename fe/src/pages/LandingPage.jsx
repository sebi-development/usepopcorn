import { useState } from 'react'
import { Link } from 'react-router'
import {
  HiOutlineFilm,
  HiOutlineStar,
  HiOutlineBookmark,
  HiOutlineUsers,
  HiChartBar,
  HiMagnifyingGlass,
  HiXMark,
  HiOutlineArrowRight,
} from 'react-icons/hi2'

const MODALS = {
  search: {
    title: 'Instant Search',
    icon: HiMagnifyingGlass,
    body: 'Type any title and results appear as you type — powered by the OMDb database with over 500,000 films. Debounced queries keep things smooth.',
  },
  rate: {
    title: 'Star Ratings',
    icon: HiOutlineStar,
    body: 'Rate every film you watch with our interactive star picker. Ratings sync to your personal watchlist so you always remember what you thought.',
  },
  watchlist: {
    title: 'Your Watchlist',
    icon: HiOutlineBookmark,
    body: "Add films to your watched list and keep a record of everything you've seen. Your data is persisted in the cloud — accessible from any device.",
  },
  stats: {
    title: 'Watch Stats',
    icon: HiChartBar,
    body: "Curious how much time you've spent watching? UsePopcorn tallies your average rating, total runtime, and film count automatically.",
  },
  profile: {
    title: 'Your Profile',
    icon: HiOutlineUsers,
    body: 'Manage your account, update your display name, and change your password — all from one tidy profile page.',
  },
  discover: {
    title: 'Discover Films',
    icon: HiOutlineFilm,
    body: 'Browse rich film detail pages with posters, cast info, plot summaries, IMDb scores and more. Everything you need before you hit play.',
  },
}

function Modal({ id, onClose }) {
  if (!id) return null
  const { title, icon: Icon, body } = MODALS[id]

  return (
    <div className="lp-overlay" onClick={onClose}>
      <div className="lp-modal" onClick={e => e.stopPropagation()}>
        <button className="lp-modal__close" onClick={onClose} aria-label="Close">
          <HiXMark />
        </button>
        <div className="lp-modal__icon-wrap">
          <Icon />
        </div>
        <h3 className="lp-modal__title">{title}</h3>
        <p className="lp-modal__body">{body}</p>
      </div>
    </div>
  )
}

function BentoCard({ modalId, className = '', children, onClick }) {
  return (
    <div
      className={`lp-card ${className}`}
      onClick={() => onClick(modalId)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(modalId)}
    >
      {children}
      <span className="lp-card__hint">
        Learn more <HiOutlineArrowRight />
      </span>
    </div>
  )
}

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState(null)

  return (
    <>
      <div className="lp-root">

        {/* Hero */}
        <div className="lp-hero">
          <span className="lp-hero__emoji">🍿</span>
          <h1 className="lp-hero__headline">
            Your personal <span>cinema</span> companion
          </h1>
          <p className="lp-hero__sub">
            Search any film, rate what you've seen, and build a watchlist that actually means something.
          </p>
          <div className="lp-cta-group">
            <Link to="/register" className="lp-cta-primary">Get started free</Link>
            <Link to="/login" className="lp-cta-secondary">Sign in</Link>
          </div>
        </div>

        {/* Bento grid */}
        <div className="lp-grid">

          <BentoCard modalId="search" className="lp-card--wide lp-card--accent" onClick={setActiveModal}>
            <HiMagnifyingGlass className="lp-card__icon" />
            <p className="lp-card__title">Search 500k+ films instantly</p>
            <p className="lp-card__desc">
              Live results as you type. Powered by OMDb — every title, every year.
            </p>
          </BentoCard>

          <BentoCard modalId="stats" className="lp-card--tall" onClick={setActiveModal}>
            <HiChartBar className="lp-card__icon" />
            <p className="lp-card__title">Watch Stats</p>
            <div style={{ marginTop: 'auto' }}>
              <p className="lp-stat">142h</p>
              <p className="lp-stat__label">avg. tracked time</p>
            </div>
            <p className="lp-card__desc">
              Average ratings, total runtime, and film count — all calculated for you.
            </p>
          </BentoCard>

          <BentoCard modalId="rate" onClick={setActiveModal}>
            <HiOutlineStar className="lp-card__icon" />
            <p className="lp-card__title">Rate what you watch</p>
            <p className="lp-card__desc">
              Interactive star picker. Your ratings, your opinions, always saved.
            </p>
          </BentoCard>

          <BentoCard modalId="watchlist" onClick={setActiveModal}>
            <HiOutlineBookmark className="lp-card__icon" />
            <p className="lp-card__title">Cloud watchlist</p>
            <p className="lp-card__desc">
              Everything syncs to the cloud. Your list travels with you.
            </p>
          </BentoCard>

          <BentoCard modalId="discover" className="lp-card--wide" onClick={setActiveModal}>
            <HiOutlineFilm className="lp-card__icon" />
            <p className="lp-card__title">Rich film detail pages</p>
            <p className="lp-card__desc">
              Posters, cast, plot summaries, IMDb scores and runtime — everything before you commit.
            </p>
          </BentoCard>

          <BentoCard modalId="profile" onClick={setActiveModal}>
            <HiOutlineUsers className="lp-card__icon" />
            <p className="lp-card__title">Your profile</p>
            <p className="lp-card__desc">
              Update your name or password any time from your account page.
            </p>
          </BentoCard>

        </div>
      </div>

      <Modal id={activeModal} onClose={() => setActiveModal(null)} />
    </>
  )
}