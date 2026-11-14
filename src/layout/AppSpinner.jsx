import BackgroundMesh from '@/components/ui/BackgroundMesh'

// The app shell's loading screen: the router shows it while AppLayout's chunk loads, AppLayout while
// the session resolves. Its own file, so it stays in the entry chunk without the shell.
export default function AppSpinner() {
  return (
    <div className="min-h-dvh flex items-center justify-center relative">
      <BackgroundMesh />
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin z-10" />
    </div>
  )
}
