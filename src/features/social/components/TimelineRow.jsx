// One row of the activity timeline: the dot sits on the vertical line drawn by the parent.
export default function TimelineRow({ sticky = false, children }) {
  return (
    <div className="flex gap-4 relative">
      <div className="w-10 shrink-0 flex justify-center pt-9 relative z-10">
        <div className={`${sticky ? 'sticky top-32 ' : ''}w-2.5 h-2.5 rounded-full bg-surface-100 ring-[6px] ring-surface-900`} />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
