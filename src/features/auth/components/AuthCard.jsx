export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-[400px] bg-surface-900/50 backdrop-blur-xl p-8 rounded-3xl border border-primary-light/20 shadow-2xl flex flex-col gap-6">

      <div className="text-center flex flex-col gap-2.5">
        <h1 className="text-2xl font-bold text-text tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-text-muted leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {children}
      </div>

    </div>
  )
}