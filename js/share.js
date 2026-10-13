/* Live sharing of the teacher's ink with a class.
 *
 * Roles
 *   local   — no backend set in config.js: anyone can write, ink stays on the device (the original behaviour).
 *   teacher — this device signed in with the teacher key. With ?class=B in the URL every stroke is sent to the
 *             backend (and kept in a queue on the device until it's saved, so nothing is lost offline).
 *   viewer  — everyone else. With ?class=B they see the teacher's notes for that class, updated every few seconds.
 */
import * as Ink from './ink.js';
import { CONFIG } from './config.js';

const lsGet = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };

export function setup(lesson) {
  const api = String(lsGet('ink:api') || CONFIG.inkApi || '').trim();
  const q = new URLSearchParams(location.search);
  const cls = String(q.get('class') || q.get('c') || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16);
  const key = lsGet('ink:teacher');
  const role = !api ? 'local' : key ? 'teacher' : 'viewer';
  return { api, cls, key, role, lesson, inkKey: role === 'teacher' && cls ? lesson + ':' + cls : lesson, readonly: role === 'viewer', label: cls ? CONFIG.classLabel(cls) : '' };
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
  badge.className = 'share-badge ' + state; badge.innerHTML = '<i></i><span>' + text + '</span>';
  badge.title = { live: 'Notes are shared live', saving: 'Saving your notes…', offline: 'Can’t reach the server — will keep trying', off: '', badkey: 'The teacher key was not accepted' }[state] || '';
}

export function start(st, badgeEl) {
  badge = badgeEl;
  if (st.role === 'local') { badge.remove(); return; }
  if (st.role === 'teacher') return st.cls ? teacher(st) : status(st, 'off', 'Not shared');
  if (!st.cls) { status(st, 'off', 'View only'); return; }
  viewer(st);
}

/* ---------------- teacher: send every change ---------------- */
function teacher(st) {
  const qKey = 'inkq:' + st.lesson + ':' + st.cls;
  let queue = lsGet(qKey) || [], busy = false, timer = 0, fails = 0, dirty = false;
  const saveQ = () => lsSet(qKey, queue.length ? queue : null);
  Ink.onOp((op) => {
    dirty = true;
    if (op.a === 'reset') queue = [];
    if (op.p) { let j = JSON.stringify(op); while (j.length > 45000 && op.p.length > 4) { op.p = op.p.filter((_, i) => i % 2 === 0 || i === op.p.length - 1); j = JSON.stringify(op); } }
    queue.push(op); saveQ(); kick(600);
  });
  const kick = (ms) => { clearTimeout(timer); timer = setTimeout(flush, ms); if (queue.length) status(st, fails ? 'offline' : 'saving', st.label + ' · Saving'); };
  async function flush() {
    if (busy) return kick(400);
    if (!queue.length) { status(st, 'live', st.label + ' · Live'); return; }
    busy = true;
    let n = 0, size = 0; while (n < queue.length && size < 250000) { size += JSON.stringify(queue[n]).length; n++; }
    try {
      await post(st, { op: 'push', key: st.key, lesson: st.lesson, cls: st.cls, ops: queue.slice(0, n) });
      queue.splice(0, n); saveQ(); fails = 0;
    } catch (e) {
      fails++;
      if (e.message === 'badkey') { busy = false; status(st, 'badkey', 'Teacher key not accepted'); return; }
      status(st, 'offline', st.label + ' · Offline');
    }
    busy = false;
    if (queue.length) kick(fails ? Math.min(30000, 1500 * Math.pow(2, fails)) : 50); else status(st, 'live', st.label + ' · Live');
  }
  badge.onclick = () => { if (queue.length) { fails = 0; flush(); } };
  addEventListener('online', () => { fails = 0; flush(); });
  // On opening: send anything left from last time, then load the saved notes from the server (the server copy wins).
  (async () => {
    status(st, 'saving', st.label + ' · Loading');
    if (queue.length) { await flush(); if (queue.length) return; }
    dirty = false;
    const ops = [];
    try { await fetchAll(st, '', 1, (r) => r.ops.forEach((j) => ops.push(j))); } catch (e) { status(st, 'offline', st.label + ' · Offline'); return; }
    if (!dirty && !queue.length) { Ink.wipe(); ops.forEach((j) => { const op = parse(j); if (op) Ink.applyOp(op); }); }
    status(st, 'live', st.label + ' · Live');
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
  const chips = [...new Set(CONFIG.classes.concat(st.cls ? [st.cls] : []))].map((c) => `<button class="chip${c === st.cls ? ' on' : ''}" data-cls="${c}">${CONFIG.classLabel(c)}</button>`).join('');
  return {
    html: `<div class="mp-h">Share live with a class</div>
      <div class="mp-classes">${chips}<button class="chip${st.cls ? '' : ' on'}" data-cls="">Off</button></div>
      ${st.cls ? `<div class="mp-link">Student link: <b>${studentLink(st)}</b></div><button class="mp-item" data-m="qr">Show the class link as a QR code</button>` : '<div class="mp-tip">Pick a class: your notes go to that class’s link, live. Each class keeps its own notes.</div>'}
      <button class="mp-item" data-m="signout">Sign out of teacher mode</button><div class="mp-sep"></div>`,
    wire(menu, close) {
      menu.querySelectorAll('[data-cls]').forEach((b) => (b.onclick = () => { const u = new URL(location.href); if (b.dataset.cls) u.searchParams.set('class', b.dataset.cls); else u.searchParams.delete('class'); location.href = u.toString(); }));
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
