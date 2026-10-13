/* Ink: write on the lesson page with an Apple Pencil.
 *
 * Every element with data-ink="<id>" is a writing surface. Each one gets a transparent SVG layer on top of its
 * content; strokes are stored as points in a 1000-unit-wide coordinate system, so the ink scales with the card
 * (rotate the iPad, print, resize the window) without any re-layout code.
 *
 *  - Apple Pencil (pointerType "pen") writes; a finger scrolls and taps buttons, like Notability.
 *  - A mouse also writes (handy on a laptop). "Finger draws" in the menu lets a finger write too.
 *  - Starting a stroke on a button, link or the calculator presses it instead of writing.
 *  - Tools: pen (4 colours, 3 sizes), highlighter, stroke eraser, laser pointer (fades), hand (pencil scrolls).
 *  - Undo / redo (buttons, Cmd+Z, or a two-finger tap). Ink is saved on this device, per lesson.
 */
import { getStroke } from './vendor/perfect-freehand.js';

const VBW = 1000;                       // viewBox width of every surface
const SVGNS = 'http://www.w3.org/2000/svg';
const INTERACTIVE = 'button, a, input, select, textarea, label, summary, [data-tap], .calc, .no-ink, .tb, .menu-pop';
const PEN_SIZES = [2.1, 3.3, 5.6];
const COLORS = { ink: '#1c2230', blue: '#1f5bd6', red: '#d42a2a', green: '#16884a' };
const HL = { c: '#ffd60a', a: 0.38, size: 22 };

const rid = () => Math.random().toString(36).slice(2, 10);
const S = {
  key: 'ink:default', readonly: false, opHook: null, tool: 'pen', color: 'ink', size: 1, finger: false, hover: true,
  surfaces: new Map(), undo: [], redo: [], active: null, penDownAt: 0, listeners: new Set()
};

function ls(k, v) {
  try {
    if (v === undefined) { const s = localStorage.getItem(k); return s ? JSON.parse(s) : null; }
    if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v));
  } catch (e) { return null; }
}

/* ---------------- strokes ---------------- */
function strokeOpts(s, last) {
  if (s.t === 'hl') return { size: HL.size, thinning: 0, smoothing: 0.6, streamline: 0.5, simulatePressure: false, last, start: { cap: true }, end: { cap: true } };
  if (s.t === 'laser') return { size: 6, thinning: 0.2, smoothing: 0.6, streamline: 0.45, simulatePressure: false, last };
  const pen = s.pen;
  // Full pressure response (Ryan preferred it). Choppiness at light pressure is handled by joining strokes instead.
  return { size: PEN_SIZES[s.w] * (pen ? 1.25 : 1), thinning: pen ? 0.62 : 0.5, smoothing: 0.55, streamline: pen ? 0.32 : 0.45, simulatePressure: !pen, last,
    easing: (t) => t, start: { taper: 0, cap: true }, end: { taper: 0, cap: true } };
}
function outlineToPath(pts) {
  const n = pts.length; if (!n) return '';
  const r = (v) => Math.round(v * 100) / 100;
  let d = 'M' + r(pts[0][0]) + ' ' + r(pts[0][1]) + ' Q';
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    d += ' ' + r(a[0]) + ' ' + r(a[1]) + ' ' + r((a[0] + b[0]) / 2) + ' ' + r((a[1] + b[1]) / 2);
  }
  return d + ' Z';
}
function pathFor(s, last) {
  const pts = s.t === 'hl' ? s.p.map((q) => [q[0], q[1], 0.5]) : s.p;
  return outlineToPath(getStroke(pts, strokeOpts(s, last)));
}
function colorOf(s) { return s.t === 'hl' ? HL.c : s.t === 'laser' ? '#ff2d2d' : (COLORS[s.c] || s.c); }

/* ---------------- surfaces ---------------- */
class Surface {
  constructor(el, id) {
    this.el = el; this.id = id; this.strokes = []; this.nodes = new Map();
    const cs = getComputedStyle(el); if (cs.position === 'static') el.style.position = 'relative';
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'ink-layer'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', '0 0 ' + VBW + ' 100000'); svg.setAttribute('preserveAspectRatio', 'xMinYMin slice');
    this.gHl = document.createElementNS(SVGNS, 'g'); this.gHl.setAttribute('opacity', HL.a);
    this.gPen = document.createElementNS(SVGNS, 'g'); this.gLaser = document.createElementNS(SVGNS, 'g'); this.gLaser.setAttribute('class', 'laser');
    svg.append(this.gHl, this.gPen, this.gLaser); el.appendChild(svg); this.svg = svg;
  }
  /* Page (client) coordinates → this layer's 1000-wide units. Measured against the ink layer itself (inside the
   * card's border); `off` is the stroke's alignment correction (see calibrate). */
  measure() { this.rect = this.svg.getBoundingClientRect(); return this.rect; }
  toLocal(cx, cy, off) {
    const r = this.rect || this.measure(), k = VBW / r.width;
    return [(cx + (off ? off[0] : 0) - r.left) * k, (cy + (off ? off[1] : 0) - r.top) * k];
  }
  node(s) {
    const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('fill', colorOf(s)); return p;
  }
  add(s) {
    this.strokes.push(s); const p = this.node(s); p.setAttribute('d', pathFor(s, true)); this.nodes.set(s, p);
    (s.t === 'hl' ? this.gHl : this.gPen).appendChild(p);
  }
  remove(s) { const i = this.strokes.indexOf(s); if (i >= 0) this.strokes.splice(i, 1); const p = this.nodes.get(s); if (p) p.remove(); this.nodes.delete(s); }
  clear() { const old = this.strokes.slice(); old.forEach((s) => this.remove(s)); return old; }
  hit(x, y, rad) {
    const out = [];
    for (const s of this.strokes) {
      const pad = rad + (s.t === 'hl' ? HL.size / 2 : 4);
      if (!s.bb) s.bb = bbox(s.p);
      if (x < s.bb[0] - pad || x > s.bb[2] + pad || y < s.bb[1] - pad || y > s.bb[3] + pad) continue;
      const p = s.p;
      if (p.length === 1) { if (Math.hypot(p[0][0] - x, p[0][1] - y) < pad) out.push(s); continue; }
      for (let i = 1; i < p.length; i++) if (segDist(x, y, p[i - 1], p[i]) < pad) { out.push(s); break; }
    }
    return out;
  }
}
function bbox(p) { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const q of p) { if (q[0] < a) a = q[0]; if (q[1] < b) b = q[1]; if (q[0] > c) c = q[0]; if (q[1] > d) d = q[1]; } return [a, b, c, d]; }
function segDist(x, y, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  let t = L ? ((x - a[0]) * dx + (y - a[1]) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
  return Math.hypot(a[0] + t * dx - x, a[1] + t * dy - y);
}

/* ---------------- saving ---------------- */
let saveTimer = 0;
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(flush, 500); }
export function pack(s) {
  return { id: s.id, t: s.t, c: s.c, w: s.w, pen: s.pen ? 1 : 0, p: s.p.map((q) => [Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10, Math.round(q[2] * 100) / 100]) };
}
function unpack(o) { return { id: o.id || rid(), t: o.t, c: o.c, w: o.w, pen: !!o.pen, p: o.p }; }
function flush() {
  clearTimeout(saveTimer); commitPending();
  if (!S.key) return;
  const out = {};
  S.surfaces.forEach((sf, id) => { if (sf.strokes.length) out[id] = sf.strokes.map(pack); });
  ls(S.key, { v: 1, s: out });
}
function loadInto(sf) {
  const data = S.saved && S.saved.s && S.saved.s[sf.id]; if (!data) return;
  data.forEach((s) => sf.add(unpack(s)));
}

/* ---------------- sharing hooks (js/share.js) ----------------
 * Every change the teacher makes goes out as an op: { a: 'add', s: surface, ...stroke } | { a: 'del', s, ids } | { a: 'reset' }.
 * applyOp() puts an op from the server onto the page without sending it back out. */
function sync(addIt, surf, strokes) {
  if (!S.opHook || !strokes.length) return;
  if (addIt) strokes.forEach((s) => S.opHook(Object.assign({ a: 'add', s: surf }, pack(s))));
  else S.opHook({ a: 'del', s: surf, ids: strokes.map((s) => s.id) });
}
export function onOp(f) { S.opHook = f; }
export function emitOp(op) { if (S.opHook) S.opHook(op); }
export function applyOp(op) {
  if (op.a === 'reset') { wipe(); return; }
  if (op.a === 'space') { const el = document.getElementById(op.id); if (el) el.style.minHeight = op.h; return; }
  const sf = S.surfaces.get(op.s); if (!sf) return;
  if (op.a === 'add') { if (!sf.strokes.some((x) => x.id === op.id)) sf.add(unpack(op)); }
  else if (op.a === 'del') { const ids = new Set(op.ids); sf.strokes.filter((x) => ids.has(x.id)).forEach((x) => sf.remove(x)); }
  save();
}
export function wipe() { S.surfaces.forEach((sf) => sf.clear()); S.undo = []; S.redo = []; emit(); save(); }
export function allOps() { const out = []; S.surfaces.forEach((sf, id) => sf.strokes.forEach((s) => out.push(Object.assign({ a: 'add', s: id }, pack(s))))); return out; }

/* ---------------- history ---------------- */
function push(act) { S.undo.push(act); if (S.undo.length > 300) S.undo.shift(); S.redo = []; sync(act.type === 'add', act.surf, act.strokes); emit(); save(); }
function apply(act, inverse) {
  const sf = S.surfaces.get(act.surf); if (!sf) return;
  const addIt = (act.type === 'add') !== inverse;
  act.strokes.forEach((s) => { if (addIt) sf.add(s); else sf.remove(s); });
  sync(addIt, act.surf, act.strokes);
}
export function undo() { commitPending();
   const a = S.undo.pop(); if (!a) return; apply(a, true); S.redo.push(a); emit(); save(); }
export function redo() { commitPending();
   const a = S.redo.pop(); if (!a) return; apply(a, false); S.undo.push(a); emit(); save(); }

/* ---------------- pointer handling ---------------- */
function surfaceFor(target) {
  if (!target || !target.closest) return null;
  if (target.closest(INTERACTIVE)) return null;
  const host = target.closest('[data-ink]'); return host ? S.surfaces.get(host.dataset.ink) || null : null;
}
function writes(type) { return type === 'pen' || type === 'mouse' || (type === 'touch' && S.finger); }

/* With a light touch, Safari can lose and regain the Pencil's contact several times within one stroke, which used to
 * leave a chain of short separate strokes. So a Pencil stroke isn't finished on pointerup straight away: if the Pencil
 * touches down again almost at once, right where the moving tip would have got to, the same stroke carries on.
 * A real lift between letters doesn't qualify: the next letter starts somewhere else, not on the line the pen was
 * already travelling along, so it stays a separate stroke. Distances are in on-screen points (zoom included). */
const JOIN_MS = 90, JOIN_ERR = 8;
let pending = null;
const zoom = () => (window.visualViewport && visualViewport.scale) || 1;
function trail(A, x, y) {
  const now = performance.now(), T = A.trail || (A.trail = []);
  T.push([x, y, now]); while (T.length > 2 && now - T[1][2] > 40) T.shift();
}
function liftVelocity(A) {
  const T = A.trail; if (!T || T.length < 2) return [0, 0];
  const a = T[0], b = T[T.length - 1], dt = b[2] - a[2];
  return dt > 4 ? [(b[0] - a[0]) / dt, (b[1] - a[1]) / dt] : [0, 0];
}
function commitPending() {
  if (!pending) return;
  const A = pending.A; clearTimeout(pending.timer); pending = null;
  finishStroke(A);
}
function resumeStroke(e, sf) {
  if (!pending || e.pointerType !== 'pen' || pending.A.sf !== sf) return false;
  const dt = performance.now() - pending.at; if (dt > JOIN_MS) return false;
  const A = pending.A, lc = pending.lift, v = pending.v, z = zoom();
  const err = Math.hypot(e.clientX - (lc[0] + v[0] * dt), e.clientY - (lc[1] + v[1] * dt)) * z;
  const travel = Math.hypot(v[0], v[1]) * dt * z;
  if (err > JOIN_ERR + 0.15 * travel) return false;
  clearTimeout(pending.timer); pending = null;
  A.id = e.pointerId; sf.measure(); S.active = A; A.trail = null;
  addPoint(A, e); trail(A, e.clientX, e.clientY);
  return true;
}
/* Alignment check. Safari can report the Pencil's position and the page's layout in slightly different coordinate
 * spaces (it has happened with pinch zoom), which puts the ink a little off the tip. The event's offsetX/offsetY is
 * worked out by the browser from its own hit-testing, so compare the two once per stroke and, if they disagree by
 * more than a couple of points, shift the stroke onto the tip. */
function calibrate(A, ev) {
  if (A.calDone || (A.calTries = (A.calTries || 0) + 1) > 4) return;
  const sh = spaceShift(ev); if (!sh) return;
  const dx = sh.dx, dy = sh.dy;
  A.calDone = true;
  if (Math.abs(dx) < 2.5 && Math.abs(dy) < 2.5) return;
  const r = A.sf.rect || A.sf.measure(), u = VBW / r.width, old = A.off || [0, 0];
  A.off = [dx, dy];
  if (A.s) { A.s.p.forEach((q) => { q[0] += (dx - old[0]) * u; q[1] += (dy - old[1]) * u; }); A.dirty = true; }
}
function onDown(e) {
  if (S.active || S.readonly || S.tool === 'hand' || !writes(e.pointerType)) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const sf = surfaceFor(e.target); if (!sf) { commitPending(); return; }
  e.preventDefault();
  if (resumeStroke(e, sf)) { try { sf.el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } document.body.classList.add('inking'); hideDot(); return; }
  commitPending();
  sf.measure();
  const pr = pressure(e, null);
  S.penDownAt = Date.now(); hideDot();
  if (S.tool === 'eraser') {
    S.active = { id: e.pointerId, sf, erase: [] }; calibrate(S.active, e);
    const [x, y] = sf.toLocal(e.clientX, e.clientY, S.active.off); eraseAt(x, y);
  } else {
    const [x, y] = sf.toLocal(e.clientX, e.clientY);
    const s = { id: rid(), t: S.tool === 'highlighter' ? 'hl' : S.tool === 'laser' ? 'laser' : 'pen', c: S.color, w: S.size, pen: e.pointerType === 'pen', p: [[x, y, pr]] };
    const node = sf.node(s); (s.t === 'hl' ? sf.gHl : s.t === 'laser' ? sf.gLaser : sf.gPen).appendChild(node);
    S.active = { id: e.pointerId, sf, s, node, dirty: true }; calibrate(S.active, e); trail(S.active, e.clientX, e.clientY); schedule();
  }
  try { sf.el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  document.body.classList.add('inking');
}
/* Pencil pressure, eased so a light touch still gives a solid line. A reading of 0 mid-stroke (it happens with a
 * light touch) keeps the previous value instead of jumping. */
function pressure(e, prev) {
  if (e.pointerType !== 'pen') return 0.5;
  const p = e.pressure;
  if (!(p > 0)) return prev != null ? prev : 0.5;
  return Math.max(0.05, Math.min(1, p));
}
function addPoint(A, ev) {
  const [x, y] = A.sf.toLocal(ev.clientX, ev.clientY, A.off);
  const last = A.s.p[A.s.p.length - 1];
  if (Math.abs(last[0] - x) + Math.abs(last[1] - y) < 0.4) return;
  A.s.p.push([x, y, pressure(ev, last[2])]);
  A.dirty = true;
}
/* Pencil hover (iPad Pro M2 and later, iPad Air M2 and later, iPad mini A17 Pro): Safari sends pen pointermove
 * events with no buttons pressed while the Pencil hovers just above the screen. Show a laser dot there so the
 * class can see what you're pointing at. It takes the pen colour (yellow for the highlighter, a ring for the eraser).
 * When the page is pinch-zoomed, Safari's clientX/Y and the page's layout can be in shifted coordinate spaces, so the
 * dot doesn't use clientX/Y directly: it sits inside the lesson and is placed with the same correction as the pen
 * (spaceShift), and is shrunk by the zoom so it stays the same size on screen. */
let dot = null, dotTimer = 0;
const shift = { dx: 0, dy: 0 };
/* How far the event's clientX/Y is from the layout's coordinate space, worked out from the browser's own
 * offsetX/offsetY on a block element. Remembered, so events over inline text can use the last good value. */
function spaceShift(ev) {
  const t = ev.target;
  if (!(t instanceof HTMLElement) || !t.offsetWidth || typeof ev.offsetX !== 'number') return null;
  if (getComputedStyle(t).display === 'inline') return null;
  const tr = t.getBoundingClientRect(), k = tr.width / t.offsetWidth; if (!(k > 0)) return null;
  shift.dx = tr.left + (t.clientLeft + ev.offsetX) * k - ev.clientX;
  shift.dy = tr.top + (t.clientTop + ev.offsetY) * k - ev.clientY;
  return shift;
}
function hoverDot(e) {
  if (!S.hover || S.readonly || e.pointerType !== 'pen' || e.buttons || S.active || pending) return hideDot();
  const host = (e.target.closest && e.target.closest('.board')) || document.querySelector('.lesson') || document.body;
  if (!dot) { dot = document.createElement('div'); dot.id = 'hoverdot'; dot.setAttribute('aria-hidden', 'true'); }
  if (dot.parentNode !== host) { if (getComputedStyle(host).position === 'static') host.style.position = 'relative'; host.appendChild(dot); }
  spaceShift(e);
  const hr = host.getBoundingClientRect(), s = (hr.width / host.offsetWidth) || 1, z = zoom();
  const x = (e.clientX + shift.dx - hr.left) / s, y = (e.clientY + shift.dy - hr.top) / s;
  const c = S.tool === 'highlighter' ? HL.c : S.tool === 'laser' ? '#ff2d2d' : S.tool === 'hand' ? '#13807a' : (COLORS[S.color] || '#ff2d2d');
  dot.className = S.tool === 'eraser' ? 'ring show' : 'show';
  dot.style.setProperty('--dc', S.tool === 'eraser' ? '#6a7182' : c);
  dot.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + (1 / (s * z)) + ')';
  clearTimeout(dotTimer); dotTimer = setTimeout(hideDot, 350);
}
function hideDot() { if (dot) dot.classList.remove('show'); }
function onMove(e) {
  if (e.pointerType === 'pen' && !S.active) hoverDot(e);
  const A = S.active; if (!A || e.pointerId !== A.id) return;
  e.preventDefault();
  calibrate(A, e);
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null, list = evs && evs.length ? evs : [e];
  for (const ev of list) {
    if (A.erase) { const [x, y] = A.sf.toLocal(ev.clientX, ev.clientY, A.off); eraseAt(x, y); continue; }
    addPoint(A, ev);
  }
  if (!A.erase) { trail(A, e.clientX, e.clientY); if (A.dirty) schedule(); }
}
function onUp(e) {
  const A = S.active; if (!A || e.pointerId !== A.id) return;
  S.active = null; document.body.classList.remove('inking'); S.penDownAt = Date.now();
  try { A.sf.el.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  A.sf.rect = null;
  if (A.erase) { if (A.erase.length) push({ type: 'erase', surf: A.sf.id, strokes: A.erase }); return; }
  if (A.s.pen) { pending = { A, at: performance.now(), lift: A.trail && A.trail.length ? A.trail[A.trail.length - 1].slice(0, 2) : [e.clientX, e.clientY], v: liftVelocity(A), timer: setTimeout(commitPending, JOIN_MS) }; return; }
  finishStroke(A);
}
function finishStroke(A) {
  const s = A.s; A.node.remove();
  if (s.t === 'laser') { fadeLaser(A.sf, s); return; }
  A.sf.add(s); push({ type: 'add', surf: A.sf.id, strokes: [s] });
}
function eraseAt(x, y) {
  const A = S.active, k = VBW / (A.sf.rect ? A.sf.rect.width : 1000);
  A.sf.hit(x, y, 9 * Math.max(1, k)).forEach((s) => { A.sf.remove(s); A.erase.push(s); });
}
let raf = 0;
function schedule() { if (!raf) raf = requestAnimationFrame(paint); }
function paint() { raf = 0; const A = S.active; if (A && A.dirty && A.node) { A.node.setAttribute('d', pathFor(A.s, true)); A.dirty = false; } }
function fadeLaser(sf, s) {
  const p = sf.node(s); p.setAttribute('d', pathFor(s, true)); sf.gLaser.appendChild(p);
  const a = p.animate([{ opacity: 1 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }], { duration: 1500, easing: 'ease-in' });
  a.onfinish = () => p.remove();
}

/* Safari scrolls the page when the Pencil drags unless touchstart is cancelled, so cancel it for Pencil touches
 * that land on a writing surface. Finger touches are left alone (they scroll), except while the Pencil is down,
 * so a resting palm can't drag the page mid-stroke. */
function touchBlocks(e, start) {
  if (S.tool === 'hand' || S.readonly) return false;
  const list = start ? e.changedTouches : e.touches;
  for (const t of list) {
    const stylus = t.touchType === 'stylus';
    if ((stylus || S.finger) && surfaceFor(t.target)) return true;
  }
  return false;
}
let twoTap = null;
function onTouchStart(e) {
  if (touchBlocks(e, true)) { e.preventDefault(); return; }
  const direct = [...e.touches].filter((t) => t.touchType !== 'stylus');
  if (direct.length === 2 && !S.active && !S.finger) twoTap = { t: Date.now(), pts: direct.map((t) => [t.clientX, t.clientY]), moved: false };
  else if (direct.length > 2) twoTap = null;
}
function onTouchMove(e) {
  if (S.active || touchBlocks(e, false)) { e.preventDefault(); }
  if (twoTap) for (const t of e.touches) { const q = twoTap.pts.find((p) => Math.hypot(p[0] - t.clientX, p[1] - t.clientY) < 30); if (!q) twoTap.moved = true; }
}
function onTouchEnd(e) {
  if (twoTap && e.touches.length === 0) {
    const ok = !twoTap.moved && Date.now() - twoTap.t < 320 && Date.now() - S.penDownAt > 400;
    twoTap = null; if (ok) { undo(); toast('Undo'); }
  }
}

/* ---------------- public API ---------------- */
function emit() { S.listeners.forEach((f) => f(S)); }
export function onChange(f) { S.listeners.add(f); f(S); }
export function state() { return S; }
export function setTool(t) { S.tool = t; settings(); emit(); }
export function setColor(c) { S.color = c; if (S.tool !== 'pen') S.tool = 'pen'; settings(); emit(); }
export function setSize(i) { S.size = i; settings(); emit(); }
export function setFinger(on) { S.finger = on; settings(); emit(); }
export function setHover(on) { S.hover = on; if (!on) hideDot(); settings(); emit(); }
function settings() { ls('ink:settings', { tool: S.tool === 'laser' || S.tool === 'eraser' ? 'pen' : S.tool, color: S.color, size: S.size, finger: S.finger, hover: S.hover }); }

export function register(el) {
  const id = el.dataset.ink; if (!id || S.surfaces.has(id)) return S.surfaces.get(id);
  const sf = new Surface(el, id); S.surfaces.set(id, sf); loadInto(sf); return sf;
}
export function clearSurface(id) {
  commitPending();
  const sf = S.surfaces.get(id); if (!sf || !sf.strokes.length) return;
  push({ type: 'erase', surf: id, strokes: sf.clear() });
}
export function clearAll() {
  commitPending();
  S.surfaces.forEach((sf, id) => { if (sf.strokes.length) S.undo.push({ type: 'erase', surf: id, strokes: sf.clear() }); });
  if (S.opHook) S.opHook({ a: 'reset' });
  S.redo = []; emit(); flush();
}
export function hasInk() { for (const sf of S.surfaces.values()) if (sf.strokes.length) return true; return false; }

/* opts.readonly: a student's view — no writing, nothing saved on the device (the notes come from the server). */
export function init(key, opts = {}) {
  S.readonly = !!opts.readonly; S.key = S.readonly ? null : 'ink:' + key; S.saved = S.key ? ls(S.key) : null;
  if (S.readonly) document.body.classList.add('viewer');
  const st = ls('ink:settings'); if (st) { S.tool = st.tool || 'pen'; S.color = st.color || 'ink'; S.size = st.size != null ? st.size : 1; S.finger = !!st.finger; S.hover = st.hover !== false; }
  document.querySelectorAll('[data-ink]').forEach(register);
  document.addEventListener('pointerdown', onDown, { passive: false });
  document.addEventListener('pointermove', onMove, { passive: false });
  document.addEventListener('pointerup', onUp); document.addEventListener('pointercancel', onUp);
  document.addEventListener('pointerleave', hideDot); document.addEventListener('pointerout', (e) => { if (!e.relatedTarget && e.pointerType === 'pen') hideDot(); });
  const remeasure = () => { if (S.active) S.active.sf.rect = null; };
  document.addEventListener('scroll', () => { hideDot(); remeasure(); }, { passive: true });
  if (window.visualViewport) { visualViewport.addEventListener('scroll', remeasure); visualViewport.addEventListener('resize', remeasure); }
  document.addEventListener('touchstart', onTouchStart, { passive: false });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd); document.addEventListener('touchcancel', () => { twoTap = null; });
  addEventListener('pagehide', flush); document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  emit();
}

let toastTimer = 0;
export function toast(msg) {
  let t = document.getElementById('toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1100);
}
export { COLORS, flush };
