/* Live sharing of the teacher's ink with a class.
 *
 * Roles
 *   local   — no backend set in config.js: anyone can write, ink stays on the device (the original behaviour).
 *   teacher — this device signed in with the teacher key. With ?class=B in the URL every stroke is sent to the
 *             backend (and kept in a queue on the device until it's saved, so nothing is lost offline).
 *   viewer  — everyone else. With ?class=B they see the teacher's notes for that class, updated every few seconds.
 *
 * Which block (teacher only — students load nothing extra)
 *   ready() loads the Teaching Hub's shared teaching/js/courses.js and reads Ryan's schedule (the copy cached on this
 *   device, refreshed in the background); the rules are in blockpick.js. The chips show only the blocks this course is
 *   taught in this semester, and the block that's on now is used automatically (the URL is updated to match). A block
 *   chosen in the menu wins until the period ends. Outside this course's classes, with no choice made: "Not live" — no
 *   ink goes to any class. A course that isn't on the schedule (or no schedule yet) works as before: ?class decides.
 *   If courses.js can't load (offline, hub down), the menu shows the A–D chips and ?class decides, as before.
 *   While the page is open it checks again every 20 s: when a block of this course starts, the page moves to it.
 */
import * as Ink from './ink.js';
import { CONFIG } from './config.js';

const lsGet = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
const cleanCls = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16);
let BP = null; // blockpick.js, loaded by ready() for the teacher only
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function setup(lesson) {
  const api = String(lsGet('ink:api') || CONFIG.inkApi || '').trim();
  const q = new URLSearchParams(location.search);
  const cls = cleanCls(q.get('class') || q.get('c'));
  const key = lsGet('ink:teacher');
  const role = !api ? 'local' : key ? 'teacher' : 'viewer';
  return { api, cls, key, role, lesson, inkKey: role === 'teacher' && cls ? lesson + ':' + cls : lesson, readonly: role === 'viewer', label: cls ? CONFIG.classLabel(cls) : '' };
}

/* ---------------- which block: the Teaching Hub's schedule (blockpick.js) ---------------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function apply(st, P, d) {
  st.sched = P; st.mode = d.mode; st.until = d.until || 0;
  st.cls = d.cls; st.label = d.cls ? CONFIG.classLabel(d.cls) : ''; st.inkKey = d.cls ? st.lesson + ':' + d.cls : st.lesson;
  const u = new URL(location.href), had = cleanCls(u.searchParams.get('class') || u.searchParams.get('c'));
  if (had !== d.cls || u.searchParams.has('c')) {
    u.searchParams.delete('c'); if (d.cls) u.searchParams.set('class', d.cls); else u.searchParams.delete('class');
    try { history.replaceState(history.state, '', u.toString()); } catch (e) { /* ignore */ }
  }
}

/* Teacher only: work out the block before the ink starts (Ink.init and start() wait for this). Students: null. */
export function ready(st) {
  if (st.role !== 'teacher') return null;
  st.urlCls = st.cls; st.sched = undefined;
  css();
  return import('./blockpick.js').then((B) => { BP = B; return B.loadTeach(); }).then(async (T) => {
    const none = !BP.hasCache(T), fresh = BP.refresh(T);
    if (fresh && none) await Promise.race([fresh, sleep(3000)]);   // nothing cached yet (a new device or the home-screen app): give the hub a moment
    const P = BP.plan(T, Date.now()); apply(st, P, BP.decide(P, st.urlCls));
    if (fresh) fresh.then(() => recheck(st));
  }).catch(() => { st.sched = null; st.mode = 'fallback'; });
}

/* while the page is open: when a block of this course starts, move to it (unless a block was chosen in the menu) */
let penDown = false, pendingQ = () => 0, switching = false;
function recheck(st) {
  if (!st.sched || switching) return;
  const P = BP.plan(st.sched.T, Date.now()), d = BP.decide(P, st.urlCls);
  st.sched = P;
  if (d.cls === st.cls) { if (st.mode === 'free' && d.mode !== 'free') { st.mode = d.mode; if (!st.cls) status(st, d.mode === 'notlive' ? 'notlive' : 'off', d.mode === 'notlive' ? 'Not live' : 'Not shared'); } return; }
  // a block of this course has started; or the schedule has just arrived and says otherwise than the URL did
  if (d.mode === 'auto' || (st.mode === 'free' && d.mode !== 'free')) switchTo(st, d.cls);
}
function switchTo(st, cls) {
  // never the same switch twice in a minute (a guard against reload loops)
  try { const g = JSON.parse(sessionStorage.getItem('ink:switch') || 'null'); if (g && g.cls === cls && g.from === st.cls && Math.abs(Date.now() - g.at) < 60000) return; } catch (e) { /* ignore */ }
  switching = true;
  let tries = 0;
  const go = () => {
    if ((penDown || pendingQ()) && tries++ < 15) { setTimeout(go, 2000); return; } // let the stroke finish and the queue go
    try { sessionStorage.setItem('ink:switch', JSON.stringify({ cls, from: st.cls, at: Date.now() })); } catch (e) { /* ignore */ }
    Ink.toast(cls ? CONFIG.classLabel(cls) + ' is on — switching to it' : 'No class on now — not sharing');
    const u = new URL(location.href); u.searchParams.delete('c'); if (cls) u.searchParams.set('class', cls); else u.searchParams.delete('class');
    setTimeout(() => { Ink.flush(); location.replace(u.toString()); }, 900);
  };
  go();
}
function watch(st) {
  if (!st.sched) return;
  document.addEventListener('pointerdown', () => { penDown = true; }, true);
  const up = () => { penDown = false; }; document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', up, true);
  setInterval(() => { if (!document.hidden) recheck(st); }, 20000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) recheck(st); });
  addEventListener('focus', () => recheck(st));
}

/* ---------------- network ---------------- */
async function get(st, params) {
  const r = await fetch(st.api + '?' + new URLSearchParams(params), { credentials: 'omit', redirect: 'follow', cache: 'no-store' });
  const j = await r.json(); if (!j.ok) throw new Error(j.error || 'error'); return j;
}
async function post(st, body) {
  const r = await fetch(st.api, { method: 'POST', credentials: 'omit', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
  const j = await r.json(); if (!j.ok) throw new Error(j.error || 'error'); return j;
}
async function fetchAll(st, epoch, since, onPage) {
  let r;
  do { r = await get(st, { op: 'poll', lesson: st.lesson, cls: st.cls, epoch, since }); onPage(r); epoch = r.epoch; since = r.last; } while (r.more);
  return { epoch, last: since };
}
const parse = (j) => { try { return JSON.parse(j); } catch (e) { return null; } };

/* ---------------- status badge ---------------- */
let badge = null;
function status(st, state, text) {
  if (!badge) return;
  const tag = st.role === 'teacher' && st.cls ? (st.mode === 'auto' ? 'Auto' : st.mode === 'manual' ? 'Manual' : '') : '';
  badge.className = 'share-badge ' + state; badge.innerHTML = '<i></i><span>' + text + '</span>' + (tag ? '<em>' + tag + '</em>' : '');
  let title = { live: 'Notes are shared live', saving: 'Saving your notes…', offline: 'Can’t reach the server — will keep trying', off: 'Your notes aren’t going to any class — tap to pick one', notlive: 'No class of this course is on now, so your notes aren’t going to any class — tap to pick one', badkey: 'The teacher key was not accepted' }[state] || '';
  if (tag && st.sched) title += st.mode === 'auto' ? ' · ' + st.label + ' is on now (until ' + BP.fmt(st.sched.T, st.until) + ')' : ' · you picked ' + st.label + ' (until ' + BP.till(st.sched, st.until) + ')';
  badge.title = title;
}
const openMenu = (e) => { e.stopPropagation(); const b = document.querySelector('[data-act=menu]'); if (b) b.click(); };

export function start(st, badgeEl) {
  badge = badgeEl;
  if (st.role === 'local') { badge.remove(); return; }
  if (st.role === 'teacher') {
    watch(st);
    if (st.cls) return teacher(st);
    badge.onclick = openMenu;
    return st.mode === 'notlive' ? status(st, 'notlive', 'Not live') : status(st, 'off', 'Not shared');
  }
  if (!st.cls) { status(st, 'off', 'View only'); return; }
  viewer(st);
}

/* ---------------- teacher: send every change ---------------- */
function teacher(st) {
  const qKey = 'inkq:' + st.lesson + ':' + st.cls;
  let queue = lsGet(qKey) || [], busy = false, timer = 0, fails = 0, dirty = false;
  const saveQ = () => lsSet(qKey, queue.length ? queue : null);
  pendingQ = () => { if (queue.length && !busy) { fails = 0; flush(); } return queue.length; };
  Ink.onOp((op) => {
    dirty = true;
    if (op.a === 'reset') queue = [];
    if (op.p) { let j = JSON.stringify(op); while (j.length > 45000 && op.p.length > 4) { op.p = op.p.filter((_, i) => i % 2 === 0 || i === op.p.length - 1); j = JSON.stringify(op); } }
    queue.push(op); saveQ(); kick(600);
  });
  const kick = (ms) => { clearTimeout(timer); timer = setTimeout(flush, ms); if (queue.length) status(st, fails ? 'offline' : 'saving', 'Saving · ' + st.label); };
  async function flush() {
    if (busy) return kick(400);
    if (!queue.length) { status(st, 'live', 'Live · ' + st.label); return; }
    busy = true;
    let n = 0, size = 0; while (n < queue.length && size < 250000) { size += JSON.stringify(queue[n]).length; n++; }
    try {
      await post(st, { op: 'push', key: st.key, lesson: st.lesson, cls: st.cls, ops: queue.slice(0, n) });
      queue.splice(0, n); saveQ(); fails = 0;
    } catch (e) {
      fails++;
      if (e.message === 'badkey') { busy = false; status(st, 'badkey', 'Teacher key not accepted'); return; }
      status(st, 'offline', 'Offline · ' + st.label);
    }
    busy = false;
    if (queue.length) kick(fails ? Math.min(30000, 1500 * Math.pow(2, fails)) : 50); else status(st, 'live', 'Live · ' + st.label);
  }
  badge.onclick = (e) => { if (queue.length) { fails = 0; flush(); } else openMenu(e); };
  addEventListener('online', () => { fails = 0; flush(); });
  // On opening: send anything left from last time, then load the saved notes from the server (the server copy wins).
  (async () => {
    status(st, 'saving', 'Loading · ' + st.label);
    if (queue.length) { await flush(); if (queue.length) return; }
    dirty = false;
    const ops = [];
    try { await fetchAll(st, '', 1, (r) => r.ops.forEach((j) => ops.push(j))); } catch (e) { status(st, 'offline', 'Offline · ' + st.label); return; }
    if (!dirty && !queue.length) { Ink.wipe(); ops.forEach((j) => { const op = parse(j); if (op) Ink.applyOp(op); }); }
    status(st, 'live', 'Live · ' + st.label);
  })();
}

/* ---------------- viewer: poll for changes ---------------- */
function viewer(st) {
  let epoch = '', last = 1, quiet = 0, timer = 0, first = true;
  status(st, 'saving', 'Connecting…');
  async function tick() {
    clearTimeout(timer);
    if (document.hidden) { timer = setTimeout(tick, 5000); return; }
    let changed = false;
    try {
      const r = await fetchAll(st, epoch, last, (pg) => {
        if (pg.full) { Ink.wipe(); }
        pg.ops.forEach((j) => { const op = parse(j); if (op) { Ink.applyOp(op); changed = true; } });
      });
      epoch = r.epoch; last = r.last;
      status(st, 'live', 'Live notes · ' + st.label);
      if (changed && !first && badge) badge.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], 400);
      first = false; quiet = changed ? 0 : quiet + 1;
      timer = setTimeout(tick, quiet > 60 ? 8000 : 2500);
    } catch (e) {
      status(st, 'offline', 'Offline · retrying');
      timer = setTimeout(tick, 8000);
    }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  tick();
}

/* ---------------- menu section ---------------- */
let showAll = false;
function chipsHTML(st) {
  const P = st.sched, sched = P && !showAll; // with a schedule: only this course's blocks this semester
  const list = sched ? P.mine.map((x) => ({ c: x.block, sub: BP.subLabel(P, x), title: x.label })) : CONFIG.classes.map((c) => ({ c }));
  if (st.cls && !list.some((x) => x.c === st.cls)) list.push({ c: st.cls });
  const now = P && P.auto ? P.auto.block : '';
  const chips = list.map((x) => `<button class="chip${x.c === st.cls ? ' on' : ''}${x.c === now ? ' now' : ''}" data-cls="${esc(x.c)}"${x.title ? ` title="${esc(x.title)}"` : ''}>${esc(CONFIG.classLabel(x.c))}${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</button>`).join('');
  const more = sched && list.length < CONFIG.classes.length ? '<button class="mp-more" data-m="allblocks" type="button">Show all blocks</button>' : '';
  return chips + `<button class="chip${st.cls ? '' : ' on'}" data-cls="">Off</button>` + more;
}
function liveHTML(st) {
  const P = st.sched; if (P === undefined) return '';
  if (P === null) return '<div class="mp-live">Couldn’t load your schedule from the Teaching Hub, so every block is shown. Pick the class you’re teaching.</div>';
  const T = P.T, name = esc(P.name);
  const back = '<button class="mp-more" data-m="auto" type="button">Back to automatic</button>';
  const nxt = P.next ? ` Next: <b>${esc(CONFIG.classLabel(P.next.block))}</b> at ${BP.fmt(T, P.next.start)}.` : '';
  if (st.mode === 'auto' && P.auto && P.auto.block === st.cls) return `<div class="mp-live auto"><b>Live · ${esc(st.label)}</b> — picked for you: ${esc(st.label)} is on until ${BP.fmt(T, P.auto.to)}.</div>`;
  if (st.mode === 'auto') return `<div class="mp-live">${esc(st.label)}’s class is over, but your notes still go to it.${nxt} Pick another block, or Off.</div>`;
  if (st.mode === 'manual') return `<div class="mp-live manual"><b>Live · ${esc(st.label)}</b> — your choice${st.until > Date.now() ? ' until ' + BP.till(P, st.until) + ', then the block is picked from your schedule again' : ''}. ${back}</div>`;
  if (st.mode === 'off') return `<div class="mp-live">Not shared until ${BP.till(P, st.until)}. ${back}</div>`;
  if (st.mode === 'notlive') return `<div class="mp-live notlive"><b>Not live</b> — no ${name} class on right now, so your notes aren’t going to any class.${nxt} Pick a block to share with it.</div>`;
  if (!P.sem) return '<div class="mp-live">No schedule from the Teaching Hub on this device yet, so the block isn’t picked for you.</div>';
  return `<div class="mp-live">${name} isn’t on this semester’s schedule in the Teaching Hub, so the block isn’t picked for you.</div>`;
}
export function menuSection(st) {
  if (st.role === 'local') return { html: '', wire() {} };
  if (st.role === 'viewer') {
    return {
      bottom: true,
      html: `<div class="mp-sep"></div><div class="mp-h">Teacher</div>
        <form class="mp-signin"><input type="password" autocomplete="off" placeholder="Teacher key" aria-label="Teacher key"><button class="pill small" type="submit">Sign in</button></form>`,
      wire(menu) {
        const f = menu.querySelector('.mp-signin'), inp = f.querySelector('input');
        f.onsubmit = async (e) => {
          e.preventDefault(); const key = inp.value.trim().toUpperCase(); if (!key) return;
          try { await post(st, { op: 'check', key }); lsSet('ink:teacher', key); location.reload(); } catch (err) { inp.value = ''; inp.placeholder = err.message === 'badkey' ? 'Key not accepted' : 'Can’t reach the server'; }
        };
      }
    };
  }
  if (st.sched) st.sched = BP.plan(st.sched.T, Date.now()); // the clock has moved on since the page opened
  const go = (cls) => { const u = new URL(location.href); u.searchParams.delete('c'); if (cls) u.searchParams.set('class', cls); else u.searchParams.delete('class'); location.href = u.toString(); };
  return {
    html: `<div class="mp-h">Share live with a class</div>${liveHTML(st)}
      <div class="mp-classes">${chipsHTML(st)}</div>
      ${st.cls ? `<div class="mp-link">Student link: <b>${esc(studentLink(st))}</b></div><button class="mp-item" data-m="qr">Show the class link as a QR code</button>` : st.mode === 'notlive' ? '' : '<div class="mp-tip">Pick a class: your notes go to that class’s link, live. Each class keeps its own notes.</div>'}
      <button class="mp-item" data-m="signout">Sign out of teacher mode</button><div class="mp-sep"></div>`,
    wire(menu, close) {
      const wireChips = () => {
        menu.querySelectorAll('[data-cls]').forEach((b) => (b.onclick = () => {
          const P = st.sched;
          if (P) BP.choose(P, b.dataset.cls); // lasts until this period ends (blockpick.js)
          go(b.dataset.cls);
        }));
        const all = menu.querySelector('[data-m=allblocks]');
        if (all) all.onclick = (e) => { e.stopPropagation(); showAll = true; menu.querySelector('.mp-classes').innerHTML = chipsHTML(st); wireChips(); };
      };
      wireChips();
      const auto = menu.querySelector('[data-m=auto]'); if (auto) auto.onclick = () => { BP.unchoose(); const P = st.sched; go(P && P.auto ? P.auto.block : ''); };
      const qr = menu.querySelector('[data-m=qr]'); if (qr) qr.onclick = () => { close(); showQR(st); };
      menu.querySelector('[data-m=signout]').onclick = () => { lsSet('ink:teacher', null); location.reload(); };
    }
  };
}
export function studentLink(st) { return location.origin + location.pathname + '?class=' + encodeURIComponent(st.cls); }
function showQR(st) {
  const url = studentLink(st), box = document.createElement('div'); box.className = 'qr-pop no-ink';
  let svg = '';
  try { const q = window.qrcode(0, 'M'); q.addData(url); q.make(); svg = q.createSvgTag({ cellSize: 10, margin: 2, scalable: true }); } catch (e) { svg = ''; }
  box.innerHTML = `<div class="qr-card"><div class="kicker">${st.label} · today’s notes</div><div class="qr-img">${svg}</div><div class="qr-url">${url.replace(/^https?:\/\//, '')}</div><button class="pill dark">Close</button></div>`;
  box.onclick = (e) => { if (e.target === box || e.target.tagName === 'BUTTON') box.remove(); };
  document.body.appendChild(box);
}

/* styles for the block picker (teacher only, so students load nothing extra) */
function css() {
  if (document.getElementById('share-css')) return;
  const s = document.createElement('style'); s.id = 'share-css';
  s.textContent = `.mp-live { margin: 2px 10px 6px; padding: 8px 11px; border-radius: 12px; background: #f4f2ec; font-size: 14.5px; line-height: 1.38; color: var(--ink2); }
.mp-live b { color: var(--ink); }
.mp-live.auto, .mp-live.manual { background: #e3f4ea; }
.mp-live.notlive { background: var(--amber-soft); }
.mp-more { border: none; background: none; color: var(--muted); font: 600 14px var(--font); text-decoration: underline; text-underline-offset: 2px; cursor: pointer; padding: 4px 6px; }
.mp-live .mp-more { padding: 0 2px; color: var(--ink); }
.mp-classes .chip small { display: block; font-size: 11.5px; font-weight: 600; opacity: .75; margin-top: -1px; }
.mp-classes .chip.now:not(.on) { border-color: var(--ok); box-shadow: inset 0 0 0 1px var(--ok); }
.share-badge em { font-style: normal; font-size: 10.5px; letter-spacing: .05em; text-transform: uppercase; padding: 1px 6px; border-radius: 8px; background: rgba(255,255,255,.75); }
.share-badge.notlive { background: var(--amber-soft); color: var(--amber); cursor: pointer; }
.share-badge.off, .share-badge.live { cursor: pointer; }`;
  document.head.appendChild(s);
}
