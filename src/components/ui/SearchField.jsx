import { FiLoader, FiSearch } from 'react-icons/fi'

// A compact search box with its icon inside, a spinner while `isLoading` (the Inspire search, long
// filter lists). Other props go to the <input>; text-base below md, as iOS zooms into smaller inputs.
export default function SearchField({ ref, isLoading = false, className = '', ...props }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-text-muted">
        {isLoading ? <FiLoader size={14} className="animate-spin text-primary-light" /> : <FiSearch size={14} />}
      </span>
      <input
        ref={ref}
        type="text"
        className="w-full h-11 md:h-8 pl-8 pr-2 rounded-md bg-surface-900/60 border border-white/5 text-base md:text-sm text-text placeholder:text-text-muted/70 outline-none focus:border-primary-light/50 transition-colors"
        {...props}
      />
    </div>
  )
}
