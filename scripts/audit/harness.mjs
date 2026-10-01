// Headless-browser harness for auditing the app at phone and desktop viewports.
//
// It drives the Vite dev server through the Chrome DevTools Protocol and stubs Supabase inside
// the page (fetch + WebSocket), so the app renders signed-in with fixture data and nothing
// touches the production database. TMDB / OMDb requests are real.
//
// Setup (two terminals):
//   pnpm dev
//   "<any Chromium browser>" --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/audit-profile about:blank
// then run one of: pnpm audit:mobile | pnpm audit:cache | pnpm audit:checks
// Override the targets with APP=http://localhost:5173 and CDP=http://127.0.0.1:9222.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = () => process.env.APP || 'http://localhost:5173'
const CDP = process.env.CDP || 'http://127.0.0.1:9222'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
// Screenshots (SHOOT=1) land outside the repo
export const SHOTS = path.join(os.tmpdir(), 'usepopcorn-audit') + path.sep
fs.mkdirSync(SHOTS, { recursive: true })

const env = Object.fromEntries(
  fs.readFileSync(`${ROOT}/.env`, 'utf8').split('\n').filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')])
)
const SUPABASE_URL = env.VITE_SUPABASE_URL
const REF = new URL(SUPABASE_URL).hostname.split('.')[0]

export const ME = '11111111-1111-4111-8111-111111111111'
export const FRIEND = '22222222-2222-4222-8222-222222222222'

// Runs in the page before any app code.
function initScript(SUPABASE_URL, REF, ME, FRIEND, loggedIn) {
  const b64 = (o) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  const exp = Math.floor(Date.now() / 1000) + 86400
  const user = { id: ME, aud: 'authenticated', role: 'authenticated', email: 'audit@example.test', user_metadata: { username: 'audit' }, app_metadata: {} }
  if (loggedIn) {
    const jwt = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: ME, role: 'authenticated', exp })}.stub`
    localStorage.setItem(`sb-${REF}-auth-token`, JSON.stringify({
      access_token: jwt, refresh_token: 'stub', token_type: 'bearer', expires_in: 86400, expires_at: exp, user,
    }))
  }

  const now = Date.now()
  const iso = (daysAgo) => new Date(now - daysAgo * 864e5).toISOString()
  const titles = [
    [550, 'Fight Club', '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'movie'], [27205, 'Inception', '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', 'movie'],
    [157336, 'Interstellar', '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'movie'], [1396, 'Breaking Bad', '/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', 'tv'],
    [1399, 'Game of Thrones', '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', 'tv'], [13, 'Forrest Gump', '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', 'movie'],
    [680, 'Pulp Fiction', '/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg', 'movie'], [603, 'The Matrix', '/p96dm7sCMn4VYAStA6siNz30G1r.jpg', 'movie'],
  ]
  const state = {
    favorites: [550, 27205, 1396],
    watchlist: [157336, 1399, 13],
    ratings: Object.fromEntries(titles.map(([id], i) => [id, 6 + (i % 5)])),
    following: [FRIEND],
  }
  const ratingRows = Array.from({ length: 34 }, (_, i) => {
    const [id, title, poster, type] = titles[i % titles.length]
    return { id: `r-${i}`, tmdb_id: id + (i >= titles.length ? i * 1000 : 0), title: i >= titles.length ? `${title} ${i}` : title, poster_path: poster, type, score: 6 + (i % 5), genre_ids: [18, 28] }
  })
  const interactionRows = (type) => (type === 'favorite' ? state.favorites : state.watchlist).map((id) => {
    const t = titles.find((x) => x[0] === id)
    return { tmdb_id: id, media_type: t[3] === 'tv' ? 'series' : 'movie', title: t[1], poster_path: t[2] }
  })
  const feedRows = Array.from({ length: 21 }, (_, i) => {
    const [id, title, poster, type] = titles[i % titles.length]
    return { id: `f-${i}`, tmdb_id: id, title, poster_path: poster, type, score: 5 + (i % 6), created_at: iso(i), user_id: FRIEND, username: 'a_friend_with_a_long_username', avatar_url: null }
  })
  const weeks = Array.from({ length: 12 }, (_, i) => ({ weekStart: iso((11 - i) * 7).slice(0, 10), count: (i * 3) % 5 }))

  const calls = (window.__sb = { calls: [], state })
  const json = (body, status = 200, headers = {}) => new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })

  function handle(url, method, headers, body) {
    const p = url.pathname
    const q = url.searchParams
    if (p.startsWith('/auth/v1/user')) return json(user)
    if (p.startsWith('/auth/v1/logout')) return json({}, 204)
    if (p.startsWith('/auth/v1/')) return json({ error: 'stubbed' }, 400)
    if (p.startsWith('/rest/v1/rpc/')) {
      const fn = p.split('/').pop()
      const args = body ? JSON.parse(body) : {}
      switch (fn) {
        case 'get_my_media_state': return json({ favorites: state.favorites, watchlist: state.watchlist, ratings: state.ratings })
        case 'get_profile_stats': return json({ totalRated: 34, averageScore: 7.4, moviesRated: 25, seriesRated: 9, totalWatchHours: 61.5, topGenres: [{ type: 'movie', genreId: 18, count: 12 }, { type: 'movie', genreId: 28, count: 9 }, { type: 'tv', genreId: 18, count: 5 }] })
        case 'get_recent_weekly_activity': return json(weeks)
        case 'get_extended_streak': return json(14)
        case 'get_best_rated_since': return json({ movie: { type: 'movie', tmdb_id: 550, title: 'Fight Club', poster_path: titles[0][2], rating: 9 }, tv: { type: 'tv', tmdb_id: 1396, title: 'Breaking Bad', poster_path: titles[3][2], rating: 10 } })
        case 'get_average_rating': return json(7.8)
        case 'get_user_feed': return json(args.p_cursor_id ? [] : feedRows)
        case 'get_friends_ratings': return json([{ rating_id: 'fr-1', score: 8, created_at: iso(2), user_id: FRIEND, username: 'a_friend_with_a_long_username', avatar_url: null, total_count: 1 }])
        case 'get_suggested_users': return json([{ id: '33333333-3333-4333-8333-333333333333', username: 'suggested_user', avatar_url: null, recent_activity_count: 4, mutual_friend_count: 1, suggestion_score: 14 }])
        case 'get_profile_heatmap': return json({ year: args.p_year, joinedAt: '2026-01-10', weeks: Array.from({ length: 39 }, (_, i) => ({ weekStart: new Date(Date.UTC(args.p_year, 0, 5 + i * 7)).toISOString().slice(0, 10), count: (i * 7) % 6 })) })
        default: return json({ message: `unstubbed rpc ${fn}` }, 404)
      }
    }
    const table = p.replace('/rest/v1/', '')
    const single = (headers.get('accept') || '').includes('vnd.pgrst.object')
    if (table === 'profiles') {
      if (method !== 'GET') return json(undefined, 204)
      const id = (q.get('id') || '').replace('eq.', '')
      const row = { id, username: id === ME ? 'audit_user' : 'a_friend_with_a_long_username', avatar_url: null, created_at: '2026-01-10T10:00:00Z', country: 'US' }
      return single ? json(row) : json([{ id: FRIEND, username: 'a_friend_with_a_long_username', avatar_url: null }])
    }
    if (table === 'ratings') {
      if (method === 'GET' || method === 'HEAD') {
        const range = headers.get('range') || '0-19'
        const [from, to] = range.split('-').map(Number)
        const rows = ratingRows.slice(from, to + 1)
        return json(method === 'HEAD' ? undefined : rows, 206, { 'content-range': `${from}-${from + rows.length - 1}/${ratingRows.length}` })
      }
      if (method === 'POST') { const r = JSON.parse(body); state.ratings = { ...state.ratings, [r.tmdb_id]: r.score }; return json(undefined, 201) }
      if (method === 'DELETE') { const id = q.get('tmdb_id').replace('eq.', ''); const { [id]: _gone, ...rest } = state.ratings; state.ratings = rest; return json(undefined, 204) }
    }
    if (table === 'user_media_interactions') {
      const type = (q.get('interaction_type') || '').replace('eq.', '')
      const field = type === 'favorite' ? 'favorites' : 'watchlist'
      // RLS: interactions are only readable by their owner
      if (method === 'GET') return json((q.get('user_id') || '').replace('eq.', '') === ME ? interactionRows(type) : [])
      if (method === 'DELETE') {
        const id = Number(q.get('tmdb_id').replace('eq.', ''))
        const had = state[field].includes(id)
        state[field] = state[field].filter((x) => x !== id)
        return json(had ? [{ id: 'x' }] : [])
      }
      if (method === 'POST') { const r = JSON.parse(body); const f = r.interaction_type === 'favorite' ? 'favorites' : 'watchlist'; state[f] = [...state[f], r.tmdb_id]; return json(undefined, 201) }
    }
    if (table === 'follows') {
      if (method === 'HEAD') return json(undefined, 200, { 'content-range': '*/1' })
      if (method === 'GET' && q.get('following_id')) {
        const hit = state.following.includes(q.get('following_id').replace('eq.', '')) ? [{ id: 'follow-1' }] : []
        return single ? (hit.length ? json(hit[0]) : json({ code: 'PGRST116', message: 'no rows' }, 406)) : json(hit)
      }
      if (method === 'GET') return json(state.following.map((id) => ({ following_id: id })))
      if (method === 'POST') { state.following = [...state.following, JSON.parse(body).following_id]; return json(undefined, 201) }
      if (method === 'DELETE') { const id = q.get('following_id').replace('eq.', ''); state.following = state.following.filter((x) => x !== id); return json(undefined, 204) }
    }
    return json({ message: `unstubbed ${method} ${p}` }, 404)
  }

  const realFetch = window.fetch.bind(window)
  window.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : null
    const url = new URL(req ? req.url : String(input), location.href)
    if (url.origin !== new URL(SUPABASE_URL).origin) {
      calls.calls.push({ t: 'ext', method: 'GET', path: url.host + url.pathname + (url.searchParams.get('page') ? '?page=' + url.searchParams.get('page') : '') })
      return realFetch(input, init)
    }
    const method = (init.method || req?.method || 'GET').toUpperCase()
    const headers = new Headers(init.headers || req?.headers || {})
    const body = typeof init.body === 'string' ? init.body : null
    calls.calls.push({ t: 'sb', method, path: url.pathname.replace('/rest/v1/', '') + (url.search ? '?' + [...url.searchParams.keys()].join('&') : '') })
    await new Promise((r) => setTimeout(r, 60))
    return handle(url, method, headers, body)
  }

  // Realtime would open a socket to production: give it one that never connects.
  const RealWS = window.WebSocket
  window.WebSocket = function (url, protocols) {
    if (!String(url).includes(new URL(SUPABASE_URL).hostname)) return new RealWS(url, protocols)
    return { readyState: 0, send() {}, close() {}, addEventListener() {}, removeEventListener() {}, set onopen(_) {}, set onclose(_) {}, set onerror(_) {}, set onmessage(_) {} }
  }
  Object.assign(window.WebSocket, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 })
}

// What the audit measures on a rendered page.
export const AUDIT = `(() => {
  const vw = window.innerWidth, vh = window.innerHeight
  const visible = (el) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el)
    if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false
    if (cs.pointerEvents === 'none') return false
    for (let p = el.parentElement; p; p = p.parentElement) { const pc = getComputedStyle(p); if (Number(pc.opacity) === 0 || pc.visibility === 'hidden') return false; if (p.inert) return false }
    return true
  }
  const label = (el) => (el.getAttribute('aria-label') || el.textContent.trim().replace(/\\s+/g, ' ').slice(0, 28) || el.tagName.toLowerCase()) + ' <' + el.tagName.toLowerCase() + '>'
  const targets = [...document.querySelectorAll('button, a[href], input, select, textarea, [role=button], [role=radio]')].filter(visible)
    .filter((el) => !(el.tagName === 'BUTTON' && el.disabled))
  // Effective tap area: the element's box plus any absolutely positioned ::before / ::after
  // (used to pad a small control, or to stretch a link over its card).
  const hitBox = (el) => {
    const r = el.getBoundingClientRect()
    let box = { l: r.left, t: r.top, r: r.right, b: r.bottom }
    for (const pseudo of ['::before', '::after']) {
      const cs = getComputedStyle(el, pseudo)
      if (cs.content === 'none' || cs.display === 'none' || cs.position !== 'absolute') continue
      let host = el
      while (host && getComputedStyle(host).position === 'static') host = host.parentElement
      if (!host) continue
      const hr = host.getBoundingClientRect()
      const pb = { l: hr.left + parseFloat(cs.left), t: hr.top + parseFloat(cs.top), r: hr.right - parseFloat(cs.right), b: hr.bottom - parseFloat(cs.bottom) }
      if ([pb.l, pb.t, pb.r, pb.b].some(Number.isNaN)) continue
      box = { l: Math.min(box.l, pb.l), t: Math.min(box.t, pb.t), r: Math.max(box.r, pb.r), b: Math.max(box.b, pb.b) }
    }
    return { w: Math.round(box.r - box.l), h: Math.round(box.b - box.t) }
  }
  const small = targets.map((el) => ({ el: label(el), ...hitBox(el) }))
    .filter((t) => t.w < 44 || t.h < 44)
  const zoomInputs = [...document.querySelectorAll('input, select, textarea')].filter(visible)
    .map((el) => ({ el: (el.name || el.placeholder || el.type), px: parseFloat(getComputedStyle(el).fontSize) })).filter((i) => i.px < 16)
  const pinned = [...document.querySelectorAll('body *')].filter((el) => { const p = getComputedStyle(el).position; return (p === 'sticky' || p === 'fixed') && visible(el) })
    .map((el) => { const r = el.getBoundingClientRect(); return { el: el.tagName.toLowerCase() + '.' + String(el.className).split(' ').filter(Boolean).slice(0, 3).join('.'), pos: getComputedStyle(el).position, h: Math.round(r.height), pctOfViewport: Math.round(r.height / vh * 100) } })
    .filter((p) => p.h > 0 && p.pctOfViewport < 100)
  const wide = [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.right > vw + 1 && visible(el) && getComputedStyle(el).position !== 'fixed' })
    .filter((el) => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return false } return true })
    .slice(0, 5).map((el) => label(el))
  return { viewport: vw + 'x' + vh, pageOverflowX: document.documentElement.scrollWidth - vw, small, zoomInputs, pinned, wide }
})()`

export async function openPage({ width = 375, height = 812, loggedIn = true } = {}) {
  const target = await (await fetch(`${CDP}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  let seq = 0
  const pending = new Map()
  const errors = []
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data)
    if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result) }
    else if (msg.method === 'Runtime.exceptionThrown') errors.push('EXCEPTION ' + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text).split('\n')[0])
    else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push('console.error ' + msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300))
  }
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })) })
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: width < 700 })
  if (width < 700) {
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
    await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' })
  }
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `(${initScript.toString()})(${JSON.stringify(SUPABASE_URL)}, ${JSON.stringify(REF)}, ${JSON.stringify(ME)}, ${JSON.stringify(FRIEND)}, ${loggedIn})` })

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    return r.result.value
  }
  const waitFor = async (expression, timeout = 15000) => {
    const start = Date.now()
    while (Date.now() - start < timeout) { if (await evaluate(`Boolean(${expression})`).catch(() => false)) return true; await sleep(150) }
    throw new Error('timeout waiting for ' + expression)
  }
  return {
    send, evaluate, waitFor, sleep, errors,
    goto: async (path, settle = 1500) => { await send('Page.navigate', { url: APP() + path }); await sleep(settle) },
    shot: async (name) => { const { data } = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(`${SHOTS}${name}.png`, Buffer.from(data, 'base64')); return `${SHOTS}${name}.png` },
    audit: () => evaluate(AUDIT),
    calls: (t = 'sb') => evaluate(`window.__sb.calls.filter(c => c.t === ${JSON.stringify(t)}).map(c => c.method + ' ' + c.path)`),
    resetCalls: () => evaluate('window.__sb.calls.length = 0'),
    click: (selector) => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error('no element: ' + ${JSON.stringify(selector)}); el.click(); return true })()`),
    close: async () => { await fetch(`${CDP}/json/close/${target.id}`); ws.close() },
  }
}
