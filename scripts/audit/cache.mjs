// One scripted browsing session with no reloads (Home, three browse rows, three movies, two series
// with their episodes, a search, the profile), then a report of what the React Query cache holds.
//   pnpm audit:cache
import { openPage } from './harness.mjs'

const page = await openPage({ width: 390, height: 844 })
const nav = async (path, usr = null, settle = 2500) => {
  await page.evaluate(`(history.pushState({ usr: ${JSON.stringify(usr)}, key: 'k' + Math.random().toString(36).slice(2), idx: 1 }, '', ${JSON.stringify(path)}), dispatchEvent(new PopStateEvent('popstate', { state: history.state })), true)`)
  await page.sleep(settle)
}
const type = async (selector, value) => {
  for (let i = 1; i <= value.length; i++) {
    await page.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(value.slice(0, i))}); el.dispatchEvent(new Event('input', { bubbles: true })) })()`)
    await page.sleep(400)
  }
}
const scrollRowToEnd = async () => {
  for (let i = 0; i < 8; i++) {
    await page.evaluate(`(() => { const row = document.querySelector('.overflow-x-auto.scroll-smooth'); if (row) row.scrollTo({ left: row.scrollWidth, behavior: 'instant' }) })()`)
    await page.sleep(700)
  }
}

await page.goto('/browse', 4000)
await nav('/browse?type=movies&category=trending'); await scrollRowToEnd()
await nav('/browse?type=movies&category=popular'); await scrollRowToEnd()
await nav('/browse?type=series&category=trending')
for (const id of [299534, 693134, 550]) await nav('/browse/' + id, { type: 'movie' })
for (const id of [1399, 1396]) {
  await nav('/browse/' + id, { type: 'tv' })
  await page.evaluate(`[...document.querySelectorAll('button[aria-selected]')].find(b => b.textContent.includes('Episodes')).click()`)
  await page.sleep(4000)
}
await page.evaluate(`document.querySelector('button[aria-label="Search"]').click()`)
await page.sleep(300)
await type('input[placeholder^="Search movies"]', 'dune part')
await page.sleep(800)
await page.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`)
await nav('/profile')

const cache = await page.evaluate(`(async () => {
  const qc = (await import('/src/lib/queryClient.js')).default
  return qc.getQueryCache().getAll().map(q => ({ group: q.queryKey[0], bytes: JSON.stringify(q.state.data ?? null).length }))
})()`)
await page.send('HeapProfiler.collectGarbage')
await page.sleep(500)
await page.send('HeapProfiler.collectGarbage')
const heap = (await page.send('Runtime.getHeapUsage')).usedSize

const groups = {}
for (const q of cache) { groups[q.group] ??= { queries: 0, bytes: 0 }; groups[q.group].queries++; groups[q.group].bytes += q.bytes }
const kb = (n) => (n / 1024).toFixed(1).padStart(9) + ' KB'
console.log('group'.padEnd(20), 'queries', '   cached data')
for (const [g, v] of Object.entries(groups).sort((a, b) => b[1].bytes - a[1].bytes)) console.log(g.padEnd(20), String(v.queries).padStart(7), kb(v.bytes))
const total = cache.reduce((a, q) => a + q.bytes, 0)
console.log('TOTAL'.padEnd(20), String(cache.length).padStart(7), kb(total))
console.log('JS heap used after GC:', (heap / 1048576).toFixed(1), 'MB (dev build, indicative only)')
console.log('supabase requests in session:', (await page.calls()).length, '| TMDB/OMDb requests:', (await page.calls('ext')).length)
console.log('errors:', page.errors.map((e) => e.slice(0, 120)))
await page.close()
