import { getRealtime } from '@/lib/supabase'

// Opens a realtime channel once the realtime client has loaded (its code is fetched on first use)
// and returns the cleanup, ready to return from a useEffect. `listen(channel)` adds the .on(...) listeners.
export function openChannel(name, listen) {
  let channel
  let closed = false

  getRealtime().then((realtime) => {
    if (closed) return
    channel = realtime.channel(name)
    listen(channel)
    channel.subscribe()
  })

  return () => {
    closed = true
    if (channel) getRealtime().then((realtime) => realtime.removeChannel(channel))
  }
}
