// Pass/fail checks for behaviour the audits can't see from geometry alone: tap areas that are
// extended invisibly, cache hits, layout that must not overlap, the fold on the landing page.
//   pnpm audit:checks
import { openPage } from './harness.mjs'
const ok = (name, pass, detail = '') => console.log((pass ? 'PASS ' : 'FAIL ') + name + (detail ? '  — ' + detail : ''))
const reloadTo = async (page, path, state, settle = 3500) => { await page.goto('/login', 300); await page.evaluate(`(history.replaceState({ usr: ${JSON.stringify(state ?? null)}, key: 'k1', idx: 0 }, '', ${JSON.stringify(path)}), location.reload(), true)`); await page.sleep(settle) }

// 1. Browse row: touch + 5 pages
let page = await openPage({ width: 375, height: 667 })
await page.goto('/browse?type=movies&category=trending', 3000)
for (let i = 0; i < 8; i++) { await page.evaluate(`document.querySelector('.overflow-x-auto.scroll-smooth').scrollTo({ left: 1e6, behavior: 'instant' })`); await page.sleep(700) }
const row = await page.evaluate(`(() => { const ids = [...document.querySelectorAll('.overflow-x-auto.scroll-smooth > div')].length; return { slots: ids } })()`)
const cached = await page.evaluate(`(async () => { const qc = (await import('/src/lib/queryClient.js')).default; const q = qc.getQueryCache().getAll().find(q => q.queryKey[0] === 'browse'); const ids = q.state.data.pages.flatMap(p => p.items.map(i => i.id)); return { total: ids.length, unique: new Set(ids).size } })()`)
ok('row renders each title once, no duplicate-key errors', page.errors.length === 0 && row.slots - (row.slots > cached.unique ? 1 : 0) <= cached.unique, `fetched ${cached.total}, unique ${cached.unique}, cards ${await page.evaluate(`document.querySelectorAll('.group\\\\/card').length`)}, console errors ${page.errors.length}`)
ok('scroll arrows are not rendered for touch', await page.evaluate(`[...document.querySelectorAll('.group\\\\/row > button')].every(b => getComputedStyle(b).display === 'none')`), `${await page.evaluate(`document.querySelectorAll('.group\\\\/row > button').length`)} arrow button(s) in DOM, all display:none`)
await page.goto('/browse?type=movies&category=popular', 3000)
const hit = await page.evaluate(`(() => { const b = document.querySelector('.overflow-x-auto.scroll-smooth button[aria-label="Show details"]'); const r = b.getBoundingClientRect(); const at = (x, y) => b.contains(document.elementFromPoint(x, y)); return { inside: at(r.left + 12, r.top + 12), left9: at(r.left - 9, r.top + 12), up9: at(r.left + 12, r.top - 9), left14: at(r.left - 14, r.top + 12) } })()`)
ok('"Show details" tap area extends ~10px past the 24px chevron', hit.inside && hit.left9 && hit.up9 && !hit.left14, JSON.stringify(hit))
const dots = await page.evaluate(`(() => { const b = document.querySelector('button[aria-label="Card actions"]'); const r = b.getBoundingClientRect(); const at = (x, y) => b.contains(document.elementFromPoint(x, y)); return { size: Math.round(r.width) + 'x' + Math.round(r.height), left5: at(r.left - 5, r.top + 10), up5: at(r.left + 10, r.top - 5), below: at(r.left + 10, r.bottom + 3) } })()`)
ok('card menu dots: 32px control, tap area grows sideways/up only', dots.size === '32x32' && dots.left5 && dots.up5 && !dots.below, JSON.stringify(dots))
const css = await page.evaluate(`({ touch: getComputedStyle(document.querySelector('button')).touchAction, tap: getComputedStyle(document.documentElement).webkitTapHighlightColor, bodyOverflowX: getComputedStyle(document.body).overflowX, rowOverscroll: getComputedStyle(document.querySelector('.overflow-x-auto.scroll-smooth')).overscrollBehaviorX })`)
ok('touch-action / tap highlight / overscroll', css.touch === 'manipulation' && /rgba\(0, 0, 0, 0\)/.test(css.tap) && css.rowOverscroll === 'contain', JSON.stringify(css))
await page.resetCalls()
await page.close()

// 2. Recommendations: "View all" page 1 is a cache hit
page = await openPage({ width: 375, height: 667 })
await page.goto('/browse', 4500)
await page.resetCalls()
await page.evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('View all')).click()`)
await page.sleep(1500)
const recs = (await page.calls('ext')).filter(c => c.includes('recommendations'))
ok('recommendations "View all": only page 2 is requested', recs.length === 1 && recs[0].endsWith('?page=2'), JSON.stringify(recs))
await page.close()

// 3. Detail page: rate on a phone
page = await openPage({ width: 375, height: 667 })
await reloadTo(page, '/browse/550', { type: 'movie' })
const cta = await page.evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(b => /Add rating|Your rating/.test(b.textContent)); const r = b.getBoundingClientRect(); return Math.round(r.height) })()`)
ok('rating CTA is 52px tall', cta === 52, cta + 'px')
await page.evaluate(`[...document.querySelectorAll('button')].find(b => /Add rating|Your rating/.test(b.textContent)).click()`)
await page.sleep(400)
const overlap = await page.evaluate(`(() => { const panel = document.querySelector('[role=radiogroup]').closest('.rounded-xl').getBoundingClientRect(); const score = document.querySelector('.rounded-full.font-black').getBoundingClientRect(); const dock = document.querySelector('button[aria-label="Toggle Watchlist"]').getBoundingClientRect(); const star = document.querySelector('[role=radio]').getBoundingClientRect(); return { gapAbove: Math.round(panel.top - score.bottom), gapBelow: Math.round(dock.top - panel.bottom), star: Math.round(star.width) + 'x' + Math.round(star.height) } })()`)
ok('open rating panel no longer overlaps the score or the dock', overlap.gapAbove >= 0 && overlap.gapBelow >= 0, JSON.stringify(overlap))
await page.resetCalls()
await page.evaluate(`document.querySelectorAll('[role=radio]')[7].click()`)
await page.sleep(900)
ok('tapping the 8th star saves an 8', (await page.calls()).some(c => c.startsWith('POST ratings')) && await page.evaluate(`[...document.querySelectorAll('button')].some(b => b.textContent.includes('8/10'))`), JSON.stringify(await page.calls()))
await page.close()

// 4. Own profile: avatar overlay + modal on the smallest phone
page = await openPage({ width: 320, height: 568 })
await page.goto('/profile', 3500)
const av = await page.evaluate(`(() => { const wrap = document.querySelector('.rounded-full.overflow-hidden.group'); const r = wrap.getBoundingClientRect(); const els = [document.elementFromPoint(r.left + r.width * 0.38, r.top + r.height / 2), document.elementFromPoint(r.left + r.width * 0.62, r.top + r.height / 2)]; return { hits: els.map(e => e.tagName + (e.closest('button') ? ' in <button>' : '')), page: document.documentElement.scrollWidth - innerWidth } })()`)
ok('avatar: no invisible edit/remove button under a tap', av.hits.every(h => !h.includes('button')), JSON.stringify(av))
await page.evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Edit Profile').click()`)
await page.sleep(1200)
const modal = await page.evaluate(`(() => { const panel = [...document.querySelectorAll('.fixed.inset-0')].find(e => e.textContent.includes('Edit Profile')).firstElementChild; const r = panel.getBoundingClientRect(); const before = panel.scrollTop; panel.scrollTop = 1e5; const del = [...panel.querySelectorAll('button')].find(b => b.textContent.includes('Delete Account')).getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), viewport: innerHeight, scrollable: panel.scrollHeight > panel.clientHeight, scrolled: panel.scrollTop > before, deleteVisibleAfterScroll: del.bottom <= innerHeight && del.top >= 0, close: (() => { const c = panel.querySelector('button[aria-label="Close modal"]').getBoundingClientRect(); return Math.round(c.width) + 'x' + Math.round(c.height) })() } })()`)
ok('modal fits the 320x568 screen and scrolls to its last control', modal.top >= 0 && modal.bottom <= modal.viewport && modal.scrollable && modal.deleteVisibleAfterScroll && modal.close === '44x44', JSON.stringify(modal))
ok('no console errors on profile', page.errors.length === 0, String(page.errors.length))
await page.close()

// 5. Landing: CTA above the fold
for (const [w, h] of [[320, 568], [375, 667], [430, 932]]) {
  page = await openPage({ width: w, height: h, loggedIn: false })
  await page.goto('/', 1500)
  const l = await page.evaluate(`(() => { const b = [...document.querySelectorAll('a')].find(a => a.textContent.includes('Get started')).getBoundingClientRect(); return { bottom: Math.round(b.bottom), h: Math.round(b.height), vh: innerHeight } })()`)
  ok(`landing ${w}x${h}: primary CTA fully above the fold`, l.bottom <= l.vh && l.h === 52, JSON.stringify(l))
  await page.close()
}
