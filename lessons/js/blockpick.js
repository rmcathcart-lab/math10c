/* Which block the teacher's notes go to, from Ryan's schedule in the Teaching Hub (teaching/js/courses.js, the one shared
 * copy every Teacher Ledger loads). Used by the lesson pages (share.js) and the lessons home (index.html), teacher only:
 * students never load this or courses.js.
 *
 *   plan(T, now)   today's periods and this course's classes: { mine (this semester's blocks of this course), auto (the
 *                  block of this course that's on now, or null), next, until (when a choice made now runs out), … }
 *   decide(P, fb)  the block to use: a block chosen in the menu / on the home (until it runs out), else the block that's on,
 *                  else — when the course isn't on the schedule — fb (the ?class in the URL, as before), else none ("Not live")
 *
 * A block of this course counts as on from the end of the period before it (or LEAD minutes before its bell, whichever is
 * later) until its bell at the end. A choice lasts until the period that's on when it's made ends; made outside the
 * periods, until this course's next class starts, or the end of the day. */
import { CONFIG } from './config.js';

export const COURSE = CONFIG.course || ((location.pathname.match(/\/([^/]+)\/lessons\//) || [])[1] || '');
export const PICK = 'ink:pick:' + COURSE;   // { cls, until } on this device (the site's storage namespace, js/ns.js)
const LEAD = 10;                            // minutes before the bell that a block counts as on
const COURSES_JS = new URL('../../../teaching/js/courses.js', import.meta.url).href; // <site>/teaching/js/courses.js

const lsGet = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } };
export const cleanCls = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16);

export function loadTeach(ms = 4000) {
  const ok = () => window.TEACH && typeof window.TEACH.periods === 'function' && typeof window.TEACH.data === 'function';
  if (ok()) return Promise.resolve(window.TEACH);
  return new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = COURSES_JS; s.async = true;
    const t = setTimeout(() => rej(new Error('timeout')), ms);
    s.onload = () => { clearTimeout(t); ok() ? res(window.TEACH) : rej(new Error('no schedule')); };
    s.onerror = () => { clearTimeout(t); rej(new Error('network')); };
    document.head.appendChild(s);
  });
}
/* the hub's settings: refresh in the background when the copy on this device is over a minute old (or missing — e.g.
 * the iPad's home-screen app has its own storage). Resolves when it's done (or straight away: null = nothing to do). */
export function refresh(T) { return T.BACKEND && T.dataAge() > 60000 ? T.refresh().catch(() => {}) : null; }
export const hasCache = (T) => T.dataAge() !== Infinity;

const at = (date, hm) => { const d = date.split('-').map(Number), t = String(hm).split(':').map(Number); return new Date(d[0], d[1] - 1, d[2], t[0], t[1] || 0).getTime(); };
export function plan(T, now) {
  const data = T.data(), d = new Date(now), today = T.key(d);
  const sem = T.currentSemester(data, today);
  const mine = T.classesIn(sem).filter((x) => x.c === COURSE);                       // the chips
  const own = new Set(T.classesIn(T.semesterOn(today, data)).filter((x) => x.c === COURSE).map((x) => x.block)); // taught today
  let prev = -Infinity;
  const ws = T.periods(today, data).map((p) => {
    const s = at(today, p.start), e = at(today, p.end), w = { block: p.block, start: s, from: Math.max(prev, s - LEAD * 60000), to: e, own: own.has(p.block) };
    prev = Math.max(prev, e); return w;
  });
  const w = ws.find((x) => x.from <= now && now < x.to) || null;
  const next = ws.find((x) => x.own && x.from > now) || null;
  const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
  return { T, sem, mine, own, now: w, next, auto: w && w.own ? w : null, until: w ? w.to : next ? next.from : midnight, midnight, name: (T.course(COURSE) || {}).name || COURSE };
}
export function decide(P, fallback) {
  const ov = lsGet(PICK), now = Date.now();
  if (ov && typeof ov.cls === 'string' && ov.until > now) return { cls: cleanCls(ov.cls), mode: ov.cls ? 'manual' : 'off', until: ov.until };
  if (ov) lsSet(PICK, null);
  if (P.auto) return { cls: P.auto.block, mode: 'auto', until: P.auto.to };
  if (!P.mine.length && !P.own.size) return { cls: cleanCls(fallback), mode: 'free' };   // not on the schedule: as before
  return { cls: '', mode: 'notlive' };
}
/* a block chosen by hand ('' = no class), until the period that's on now ends (see above) */
export function choose(P, cls) { lsSet(PICK, { cls: cleanCls(cls), until: P.until }); }
export function unchoose() { lsSet(PICK, null); }
export function fmt(T, ms) { const d = new Date(ms); return T.time(d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0')); }
export const till = (P, ms) => (ms >= P.midnight ? 'the end of the day' : fmt(P.T, ms));
/* the hub's class label under "Block B", when it says more than the course and the block */
export function subLabel(P, x) {
  const l = String(x.label || '').trim(); if (!l) return '';
  const rest = l.replace(P.name, '').replace(new RegExp('block\\s*' + x.block + '\\b', 'i'), '').replace(/[\s\-–—·:,()]+/g, '');
  return rest ? l : '';
}
