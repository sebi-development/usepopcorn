export default function AuthCard({ title, subtitle, icon, children }) {
  return (
    <div className="w-full max-w-[400px] bg-surface-900/50 backdrop-blur-xl p-8 rounded-3xl border border-primary-light/20 shadow-2xl flex flex-col gap-6">

      <div className="text-center flex flex-col items-center gap-4">
        {icon && (
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          <h1 className="text-2xl font-bold text-text tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-muted leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {children}
      </div>

    </div>
  )
}