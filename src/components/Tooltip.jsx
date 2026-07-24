function Tooltip({ label, children, side = 'top', disabled = false }) {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrows = {
    top: '-bottom-1 left-1/2 -translate-x-1/2 border-r border-b',
    bottom: '-top-1 left-1/2 -translate-x-1/2 border-l border-t',
    left: '-right-1 top-1/2 -translate-y-1/2 border-t border-r',
    right: '-left-1 top-1/2 -translate-y-1/2 border-b border-l',
  }

  const enterAnimation = {
    top: 'translate-y-1 group-hover:translate-y-0',
    bottom: 'translate-y-1 group-hover:translate-y-0',
    left: 'translate-x-1 group-hover:translate-x-0',
    right: '-translate-x-1 group-hover:translate-x-0',
  }

  if (disabled) return children

  return (
    <div className="relative group">
      {children}
      <div
        className={`
          pointer-events-none absolute ${positions[side]} z-50
          px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap
          bg-surface-100 text-text-muted border border-white/10
          opacity-0 group-hover:opacity-100
          ${enterAnimation[side]}
          transition-all duration-150 ease-out
        `}
      >
        <div className={`absolute ${arrows[side]} w-2 h-2 bg-surface-100 rotate-45 border-white/10`} />
        {label}
      </div>
    </div>
  )
}

export default Tooltip