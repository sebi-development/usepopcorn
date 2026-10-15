// With `href` the whole card is a link that opens in a new tab
function Card({ span, accent, icon: Icon, title, desc, href, className = '', children }) {
  const cardClass = [
    'bento-card',
    span === 'wide' && 'bento-card--wide',
    span === 'tall' && 'bento-card--tall',
    accent && 'bento-card--accent',
    className,
  ].filter(Boolean).join(' ')

  const content = (
    <>
      {Icon && <Icon className="bento-card__icon" />}
      {title && <p className="bento-card__title">{title}</p>}
      {desc && <p className="bento-card__desc">{desc}</p>}
      {children}
    </>
  )

  if (href) {
    return (
      <a className={cardClass} href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return (
    <div className={cardClass} role="button" tabIndex={0}>
      {content}
    </div>
  )
}

function BentoGrid({ children, className = '' }) {
  return (
    <div className={`bento-grid ${className}`}>
      {children}
    </div>
  )
}

BentoGrid.Card = Card

export default BentoGrid
