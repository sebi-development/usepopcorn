import { LuLoaderCircle } from "react-icons/lu"

const variants = {
  solid: 'bg-primary text-white hover:bg-primary-light btn-glow',
  secondary: 'bg-surface-100 text-text hover:bg-surface-500',
  outline: 'bg-transparent border border-primary text-primary-light hover:bg-primary/10',
  ghost: 'bg-transparent text-text-muted hover:text-text hover:bg-surface-100/50',
  danger: 'bg-red-600/20 text-red-400 border border-red-500/30 hover:opacity-75',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

function Button({
  as: Component = 'button',
  variant = 'solid',
  size = 'md',
  className = '',
  isLoading = false,
  disabled,
  children,
  ...props
}) {
  const stateStyles = disabled || isLoading
    ? 'opacity-80 brightness-90 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer'

  const base = `rounded-xl font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 no-underline ${stateStyles}`

  return (
    <Component
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && <LuLoaderCircle className="animate-spin text-inherit" size={16} />}

      <span className={isLoading ? "opacity-70" : "opacity-100 transition-opacity"}>
        {children}
      </span>
    </Component>
  )
}

export default Button