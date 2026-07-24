import React from "react"
import Button from "./Button"

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
          className={`
            w-full py-2 rounded-lg text-sm
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

function FormButton({ children, ...props }) {
  return (
    <Button type='submit' className="w-full mt-2 py-2.5 text-sm font-semibold" {...props}>
      {children}
    </Button>
  )
}

Form.Input = Input
Form.Button = FormButton

export default Form