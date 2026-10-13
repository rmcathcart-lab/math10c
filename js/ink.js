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

const S = {
  key: 'ink:default', tool: 'pen', color: 'ink', size: 1, finger: false, hover: true,
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
  toLocal(cx, cy) { const r = this.rect || this.el.getBoundingClientRect(), k = VBW / r.width; return [(cx - r.left) * k, (cy - r.top) * k]; }
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
function flush() {
  clearTimeout(saveTimer);
  const out = {};
  S.surfaces.forEach((sf, id) => {
    if (!sf.strokes.length) return;
    out[id] = sf.strokes.map((s) => ({ t: s.t, c: s.c, w: s.w, pen: s.pen ? 1 : 0, p: s.p.map((q) => [Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10, Math.round(q[2] * 100) / 100]) }));
  });
  ls(S.key, { v: 1, s: out });
}
function loadInto(sf) {
  const data = S.saved && S.saved.s && S.saved.s[sf.id]; if (!data) return;
  data.forEach((s) => sf.add({ t: s.t, c: s.c, w: s.w, pen: !!s.pen, p: s.p }));
}

/* ---------------- history ---------------- */
function push(act) { S.undo.push(act); if (S.undo.length > 300) S.undo.shift(); S.redo = []; emit(); save(); }
function apply(act, inverse) {
  const sf = S.surfaces.get(act.surf); if (!sf) return;
  const addIt = (act.type === 'add') !== inverse;
  act.strokes.forEach((s) => { if (addIt) sf.add(s); else sf.remove(s); });
}
export function undo() { const a = S.undo.pop(); if (!a) return; apply(a, true); S.redo.push(a); emit(); save(); }
export function redo() { const a = S.redo.pop(); if (!a) return; apply(a, false); S.undo.push(a); emit(); save(); }

/* ---------------- pointer handling ---------------- */
function surfaceFor(target) {
  if (!target || !target.closest) return null;
  if (target.closest(INTERACTIVE)) return null;
  const host = target.closest('[data-ink]'); return host ? S.surfaces.get(host.dataset.ink) || null : null;
}
function writes(type) { return type === 'pen' || type === 'mouse' || (type === 'touch' && S.finger); }

function onDown(e) {
  if (S.active || S.tool === 'hand' || !writes(e.pointerType)) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const sf = surfaceFor(e.target); if (!sf) return;
  e.preventDefault();
  sf.rect = sf.el.getBoundingClientRect();
  const [x, y] = sf.toLocal(e.clientX, e.clientY), pr = pressure(e);
  S.penDownAt = Date.now(); hideDot();
  if (S.tool === 'eraser') {
    S.active = { id: e.pointerId, sf, erase: [] }; eraseAt(x, y);
  } else {
    const s = { t: S.tool === 'highlighter' ? 'hl' : S.tool === 'laser' ? 'laser' : 'pen', c: S.color, w: S.size, pen: e.pointerType === 'pen', p: [[x, y, pr]] };
    const node = sf.node(s); (s.t === 'hl' ? sf.gHl : s.t === 'laser' ? sf.gLaser : sf.gPen).appendChild(node);
    S.active = { id: e.pointerId, sf, s, node, dirty: true }; schedule();
  }
  try { sf.el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  document.body.classList.add('inking');
}
function pressure(e) { return e.pointerType === 'pen' ? Math.max(0.05, e.pressure || 0.5) : 0.5; }
/* Pencil hover (iPad Pro M2 and later, iPad Air M2 and later, iPad mini A17 Pro): Safari sends pen pointermove
 * events with no buttons pressed while the Pencil hovers just above the screen. Show a laser dot there so the
 * class can see what you're pointing at. It takes the pen colour (yellow for the highlighter, a ring for the eraser). */
let dot = null, dotTimer = 0;
function hoverDot(e) {
  if (!S.hover || e.pointerType !== 'pen' || e.buttons || S.active) return hideDot();
  if (!dot) { dot = document.createElement('div'); dot.id = 'hoverdot'; dot.setAttribute('aria-hidden', 'true'); document.body.appendChild(dot); }
  const c = S.tool === 'highlighter' ? HL.c : S.tool === 'laser' ? '#ff2d2d' : S.tool === 'hand' ? '#13807a' : (COLORS[S.color] || '#ff2d2d');
  dot.className = S.tool === 'eraser' ? 'ring show' : 'show';
  dot.style.setProperty('--dc', S.tool === 'eraser' ? '#6a7182' : c);
  dot.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
  clearTimeout(dotTimer); dotTimer = setTimeout(hideDot, 350);
}
function hideDot() { if (dot) dot.classList.remove('show'); }
function onMove(e) {
  if (e.pointerType === 'pen' && !S.active) hoverDot(e);
  const A = S.active; if (!A || e.pointerId !== A.id) return;
  e.preventDefault();
  const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null, list = evs && evs.length ? evs : [e];
  for (const ev of list) {
    const [x, y] = A.sf.toLocal(ev.clientX, ev.clientY);
    if (A.erase) { eraseAt(x, y); continue; }
    const last = A.s.p[A.s.p.length - 1];
    if (Math.abs(last[0] - x) + Math.abs(last[1] - y) < 0.4) continue;
    A.s.p.push([x, y, pressure(ev)]);
  }
  if (!A.erase) { A.dirty = true; schedule(); }
}
function onUp(e) {
  const A = S.active; if (!A || e.pointerId !== A.id) return;
  S.active = null; document.body.classList.remove('inking'); S.penDownAt = Date.now();
  try { A.sf.el.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  A.sf.rect = null;
  if (A.erase) { if (A.erase.length) push({ type: 'erase', surf: A.sf.id, strokes: A.erase }); return; }
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
function paint() { raf = 0; const A = S.active; if (A && A.dirty && A.node) { A.node.setAttribute('d', pathFor(A.s, false)); A.dirty = false; } }
function fadeLaser(sf, s) {
  const p = sf.node(s); p.setAttribute('d', pathFor(s, true)); sf.gLaser.appendChild(p);
  const a = p.animate([{ opacity: 1 }, { opacity: 1, offset: 0.55 }, { opacity: 0 }], { duration: 1500, easing: 'ease-in' });
  a.onfinish = () => p.remove();
}

/* Safari scrolls the page when the Pencil drags unless touchstart is cancelled, so cancel it for Pencil touches
 * that land on a writing surface. Finger touches are left alone (they scroll), except while the Pencil is down,
 * so a resting palm can't drag the page mid-stroke. */
function touchBlocks(e, start) {
  if (S.tool === 'hand') return false;
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
  const sf = S.surfaces.get(id); if (!sf || !sf.strokes.length) return;
  push({ type: 'erase', surf: id, strokes: sf.clear() });
}
export function clearAll() {
  S.surfaces.forEach((sf, id) => { if (sf.strokes.length) S.undo.push({ type: 'erase', surf: id, strokes: sf.clear() }); });
  S.redo = []; emit(); flush();
}
export function hasInk() { for (const sf of S.surfaces.values()) if (sf.strokes.length) return true; return false; }

export function init(key) {
  S.key = 'ink:' + key; S.saved = ls(S.key);
  const st = ls('ink:settings'); if (st) { S.tool = st.tool || 'pen'; S.color = st.color || 'ink'; S.size = st.size != null ? st.size : 1; S.finger = !!st.finger; S.hover = st.hover !== false; }
  document.querySelectorAll('[data-ink]').forEach(register);
  document.addEventListener('pointerdown', onDown, { passive: false });
  document.addEventListener('pointermove', onMove, { passive: false });
  document.addEventListener('pointerup', onUp); document.addEventListener('pointercancel', onUp);
  document.addEventListener('pointerleave', hideDot); document.addEventListener('pointerout', (e) => { if (!e.relatedTarget && e.pointerType === 'pen') hideDot(); });
  document.addEventListener('scroll', hideDot, { passive: true });
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
