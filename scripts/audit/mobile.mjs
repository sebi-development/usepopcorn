// Mobile audit: every screen at a phone viewport. Reports page overflow, tap targets under 44px
// (and which are under the 32px floor), inputs iOS would zoom on focus, and pinned elements.
//   pnpm audit:mobile                      375x667
//   W=320 H=568 pnpm audit:mobile          another viewport
//   ONLY=login,profile SHOOT=1 pnpm audit:mobile   some screens, with screenshots
import { openPage, FRIEND } from './harness.mjs'

const WIDTH = Number(process.env.W || 375)
const HEIGHT = Number(process.env.H || 667)
const SHOOT = process.env.SHOOT === '1'
const TAG = process.env.TAG || 'audit'

const tabClick = (label) => `[...document.querySelectorAll('button[aria-selected]')].find(b => b.textContent.includes(${JSON.stringify(label)})).click()`
const btn = (re) => `[...document.querySelectorAll('button')].find(b => ${re}.test(b.textContent.trim()))`

const screens = [
  { name: 'landing', path: '/', guest: true },
  { name: 'login', path: '/login', guest: true },
  { name: 'register', path: '/register', guest: true },
  { name: 'forgot-password', path: '/forgot-password', guest: true },
  { name: 'home', path: '/browse', settle: 4500 },
  { name: 'browse-trending', path: '/browse?type=movies&category=trending', settle: 3000 },
  { name: 'browse-grid', path: '/browse?type=movies&category=trending', settle: 3000, act: `${btn('/View all/')}.click()`, after: 2000 },
  { name: 'category-rail-open', path: '/browse', settle: 3500, act: `document.querySelector('button[aria-haspopup=dialog]').click()`, after: 600 },
  { name: 'card-menu-open', path: '/browse?type=movies&category=trending', settle: 3000, act: `document.querySelector('button[aria-label="Card actions"]').click()`, after: 500 },
  { name: 'user-menu-open', path: '/browse', settle: 3500, act: `document.querySelector('nav button.rounded-full').click()`, after: 400 },
  { name: 'search-open', path: '/browse', settle: 3500, act: `document.querySelector('button[aria-label="Search"]').click()`, after: 500 },
  { name: 'detail-movie', path: '/browse/550', state: { type: 'movie' }, settle: 3500 },
  { name: 'detail-rating-open', path: '/browse/550', state: { type: 'movie' }, settle: 3500, act: `${btn('/Add rating|Your rating/')}.click()`, after: 500 },
  { name: 'detail-scores', path: '/browse/550', state: { type: 'movie' }, settle: 3500, act: tabClick('Scores'), after: 1200 },
  { name: 'detail-friends', path: '/browse/550', state: { type: 'movie' }, settle: 3500, act: tabClick('Friends'), after: 1200 },
  { name: 'detail-series-episodes', path: '/browse/1396', state: { type: 'tv' }, settle: 3500, act: tabClick('Episodes'), after: 3500 },
  { name: 'profile', path: '/profile', settle: 3500 },
  { name: 'profile-edit-modal', path: '/profile', settle: 3500, act: `${btn('/^Edit Profile$/')}.click()`, after: 1200 },
  { name: 'profile-friend', path: '/profile/' + FRIEND, settle: 3500 },
  { name: 'profile-stats', path: '/profile/stats', settle: 3500 },
  { name: 'community', path: '/community', settle: 3500 },
]

const only = process.env.ONLY?.split(',')
const report = {}
for (const s of screens) {
  if (only && !only.includes(s.name)) continue
  const page = await openPage({ width: WIDTH, height: HEIGHT, loggedIn: !s.guest })
  try {
    if (s.state) {
      await page.goto('/login', 400)
      await page.evaluate(`(history.replaceState({ usr: ${JSON.stringify(s.state)}, key: 'k1', idx: 0 }, '', ${JSON.stringify(s.path)}), location.reload(), true)`)
      await page.sleep(s.settle ?? 2000)
    } else {
      await page.goto(s.path, s.settle ?? 2000)
    }
    if (s.act) { await page.evaluate(`(${s.act}, true)`); await page.sleep(s.after ?? 500) }
    const a = await page.audit()
    report[s.name] = { ...a, errors: page.errors.length }
    if (SHOOT) await page.shot(`${TAG}-${WIDTH}-${s.name}`)
  } catch (e) {
    report[s.name] = { failed: e.message }
  }
  await page.close()
}

const seen = new Map()
console.log(`# viewport ${WIDTH}x${HEIGHT} (${TAG})`)
for (const [name, r] of Object.entries(report)) {
  if (r.failed) { console.log(`\n## ${name}: FAILED ${r.failed}`); continue }
  console.log(`\n## ${name}  overflowX=${r.pageOverflowX}px${r.wide.length ? ' wide=' + JSON.stringify(r.wide) : ''}${r.errors ? ' consoleErrors=' + r.errors : ''}`)
  const groups = new Map()
  for (const t of r.small) { const k = `${t.el} ${t.w}x${t.h}`; groups.set(k, (groups.get(k) || 0) + 1) }
  for (const [k, n] of groups) {
    const [w, h] = k.split(' ').pop().split('x').map(Number)
    const sev = (w < 32 || h < 32) ? 'UNDER-32' : 'under-44'
    console.log(`   ${sev}  ${k}${n > 1 ? '  ×' + n : ''}`)
    seen.set(k, sev)
  }
  for (const z of r.zoomInputs) console.log(`   IOS-ZOOM  input "${z.el}" font-size ${z.px}px`)
  for (const p of r.pinned) if (p.h >= 40) console.log(`   pinned  ${p.pos} ${p.el} ${p.h}px = ${p.pctOfViewport}% of viewport`)
}
const under32 = [...seen.values()].filter((v) => v === 'UNDER-32').length
console.log(`\n# distinct undersized targets: ${seen.size} (${under32} under the 32px floor)`)
