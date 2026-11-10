import React from "react"
import Button from "@/components/ui/Button"

function Form({ onSubmit, children }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {children}
    </form>
  )
}

const Input = React.forwardRef(function Input({ name, type = 'text', label, error, icon: Icon, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="absolute left-3.5 text-text-muted w-4 h-4 pointer-events-none" />
        )}
        <input
          name={name}
          type={type}
          ref={ref}
          {...props}
          // text-base below md: iOS zooms the page when a focused input is under 16px
          className={`
            w-full py-2.5 md:py-2 rounded-lg text-base md:text-sm
            bg-surface-100 text-text 
            border border-white/5
            outline-none ring-0
            transition-all duration-200
            focus:border-primary focus:bg-surface-900/40 focus:shadow-inner
            placeholder:text-text-muted
            ${Icon ? 'pl-10 pr-4' : 'px-4'} 
          `}
        />
      </div>
      {error && (
        <p className="text-danger text-xs mt-0.5">{error.message}</p>
      )}
    </div>
  )
})

// Native checkbox (keeps keyboard, form state and react-hook-form's register as they are); the box
// and the tick are styled off `peer-checked`. One animated property per change: the tick's scale.
const Checkbox = React.forwardRef(function Checkbox({ label, ...props }, ref) {
  return (
    <label className="flex items-center gap-2 w-fit py-1.5 cursor-pointer select-none text-xs text-text-muted hover:text-text">
      <span className="relative flex size-4 shrink-0">
        <input
          type="checkbox"
          ref={ref}
          {...props}
          className="
            peer size-4 appearance-none cursor-pointer rounded-[5px]
            bg-surface-100 border border-white/5
            transition-colors duration-150 motion-reduce:transition-none
            checked:bg-primary-light checked:border-primary-light
            active:scale-90 motion-reduce:active:scale-100
            outline-none focus-visible:ring-2 focus-visible:ring-primary-lighter/60
          "
        />
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="
            absolute inset-0 size-4 p-[3px] pointer-events-none text-white
            scale-0 peer-checked:scale-100
            transition-transform duration-200 ease-out-quint motion-reduce:transition-none
          "
        >
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
        </svg>
      </span>
      {label}
    </label>
  )
})

function FormButton({ children, ...props }) {
  return (
    <Button type='submit' className="w-full mt-2 h-[52px] md:h-auto py-2.5 text-sm font-semibold" {...props}>
      {children}
    </Button>
  )
}

Form.Input = Input
Form.Checkbox = Checkbox
Form.Button = FormButton

export default Form