function Card({ span, accent, icon: Icon, title, desc, className = '', children }) {
  const cardClass = [
    'bento-card',
    span === 'wide' && 'bento-card--wide',
    span === 'tall' && 'bento-card--tall',
    accent && 'bento-card--accent',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClass} role="button" tabIndex={0}>
      {Icon && <Icon className="bento-card__icon" />}
      {title && <p className="bento-card__title">{title}</p>}
      {desc && <p className="bento-card__desc">{desc}</p>}
      {children}
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