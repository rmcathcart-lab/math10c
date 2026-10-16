/* Building blocks for lesson pages: graphs, number lines, tables, mapping diagrams, flowcharts, triangles, stamps,
 * and the auto-wired page widgets (polls, multiple choice, numerical response, tap-to-reveal, flip cards).
 * Reference: lessons/BLOCKS.md.  Demo / test bed: lessons/dev/blocks.html.
 *
 * Conventions
 *  - Constructors take (host, opts). host is a stage, a card or any element; opts.x / opts.y place the block absolutely.
 *  - Creating something returns its element right away (static). Animating takes the explainer context `c` FIRST
 *    and returns a Promise:  const s = G.segment(a, b); await G.drawIn(s, 600, c);
 *    With no `c` everything is instant, so the same code draws a static figure. liveCtx() gives a `c` that never
 *    cancels, for animating outside an explainer (a button on a card).
 *  - Every animation goes through c.anim / c.check, so Back, Start over and a Next click mid-animation (which
 *    replays the steps with c.fast) work without extra code.
 *  - Each block exposes its root (.el), its SVG (.svg), named layers, an HTML overlay (.html) and its coordinate
 *    transform (toPx / fromPx), so a lesson can draw its own things on top. */
import { h, fmt, Explainer } from './explain.js';
import { tex } from './tex.js';
export { h, fmt, tex };

/* =============================== small helpers =============================== */
export const NS = 'http://www.w3.org/2000/svg';
export function svgEl(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
export const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
export const add = (host, el, x, y) => { host.appendChild(x != null ? at(el, x, y) : el); return el; };
export const box = (el, w, hh) => { if (w != null) el.style.width = w + 'px'; if (hh != null) el.style.height = hh + 'px'; return el; };
/** shrink el's font until it is no wider than maxW (KaTeX scales with the font) */
export function fit(el, maxW, min = 12) {
  let f = parseFloat(getComputedStyle(el).fontSize) || 20;
  while (el.scrollWidth > maxW && f > min) { f -= 1; el.style.fontSize = f + 'px'; }
  return el;
}
export const COLORS = { teal: '#13807a', brand: '#0f5f5a', amber: '#c27a0e', orange: '#e8a01e', red: '#c93a33', blue: '#1f5bd6', green: '#12805a', purple: '#7b4fc4', ink: '#1c2230', slate: '#3a4254', gray: '#9aa0ab', white: '#fff' };
export const col = (c, d) => (c ? COLORS[c] || c : d);
const clean = (v) => { if (Math.abs(v) < 1e-10) return 0; const r = Math.round(v * 1e6) / 1e6; return Math.abs(v - r) < 1e-9 ? r : v; };
/** number for display: rounded, real minus sign. num(-2.5) → "−2.5" */
export function num(v, d = 3) { if (typeof v !== 'number') return String(v); const s = String(parseFloat(clean(v).toFixed(d))); return s.replace('-', '−'); }
/** number for LaTeX (keeps "-", KaTeX draws a proper minus) */
export const texNum = (v, d = 3) => String(parseFloat(clean(v).toFixed(d)));
/** a coordinate pair in KaTeX: pairTex(2, -3) → "(2,\ -3)" */
export const pairTex = (x, y) => `(${typeof x === 'number' ? texNum(x) : x},\\ ${typeof y === 'number' ? texNum(y) : y})`;
let UID = 0;
const uid = (p) => p + (++UID);
const norm = (dx, dy) => { const l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* =============================== animation =============================== */
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const linear = (t) => t;
function setStyles(el, kf) { for (const k in kf) if (k !== 'offset' && k !== 'easing' && k !== 'composite') el.style[k] = kf[k]; }
/** c.anim when there is a context; instant (final keyframe) when there isn't */
export function anim(c, el, kf, ms = 450, o = {}) {
  if (c) return c.anim(el, kf, ms, o);
  setStyles(el, kf[kf.length - 1]); return Promise.resolve();
}
/** frame-by-frame animation: fn(t) with t eased 0 → 1. fn may return false to stop early. Respects cancel and fast. */
export function tween(c, ms, fn, ease = easeInOut) {
  if (c) c.check();
  if (!c || c.fast || !ms) { fn(1); return Promise.resolve(); }
  const p = new Promise((res, rej) => {
    const t0 = performance.now();
    const tick = (now) => {
      try { c.check(); } catch (e) { rej(e); return; }
      const t = Math.min(1, (now - t0) / ms);
      if (fn(ease(t)) === false || t >= 1) res(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  p.catch(() => {}); return p;
}
export const sleep = (c, ms) => (c ? c.sleep(ms) : Promise.resolve());
const POP = [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.12)', offset: 0.65 }, { opacity: 1, transform: 'scale(1)' }];
export const pop = (c, el, ms = 380, o = {}) => (el ? anim(c, el, POP, ms, o) : Promise.resolve());
export const fadeIn = (c, el, ms = 350, o = {}) => (el ? anim(c, el, [{ opacity: 0, transform: o.from || 'translateY(8px)' }, { opacity: 1, transform: 'none' }], ms, o) : Promise.resolve());
export const appear = (c, el, ms = 300, o = {}) => anim(c, el, [{ opacity: 0 }, { opacity: 1 }], ms, o);
export const pulse = (c, el, s = 1.1, ms = 460) => anim(c, el, [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], ms);
export const shake = (c, el) => anim(c, el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], 360);
/** a context for animating outside an explainer (it never cancels and is never fast) */
export function liveCtx() {
  const c = {
    fast: false, check() {},
    anim(el, kf, ms = 450, o = {}) {
      if (!ms) { setStyles(el, kf[kf.length - 1]); return Promise.resolve(); }
      const a = el.animate(kf, { duration: ms, delay: o.delay || 0, easing: o.easing || 'cubic-bezier(.25,.75,.3,1)', fill: 'both' });
      return a.finished.then(() => { setStyles(el, kf[kf.length - 1]); a.cancel(); }, () => {});
    },
    sleep: (ms) => new Promise((r) => setTimeout(r, ms))
  };
  c.pop = (el, ms, o) => pop(c, el, ms, o); c.fadeIn = (el, ms, o) => fadeIn(c, el, ms, o); c.shake = (el) => shake(c, el);
  return c;
}
/** draw strokes in along their length (dashed strokes stay dashed); end dots and arrowheads pop at the ends */
export async function drawIn(el, ms = 700, c, o = {}) {
  if (!el) return;
  if (c) c.check();
  if (!c || c.fast || !ms) return;
  const strokes = el.classList.contains('bk-stroke') ? [el] : [...el.querySelectorAll('.bk-stroke')];
  const e0 = [...el.querySelectorAll('.bk-end0')], e1 = [...el.querySelectorAll('.bk-end:not(.bk-end0)')];
  const extra = [...el.querySelectorAll('.bk-fillg')];
  e1.forEach((e) => (e.style.opacity = 0));
  const jobs = e0.map((e) => pop(c, e, 260)).concat(extra.map((e) => appear(c, e, ms)));
  jobs.push(...strokes.map((s) => maskReveal(c, s, ms, o)));
  await Promise.all(jobs);
  await Promise.all(e1.map((e) => pop(c, e, 260)));
}
async function maskReveal(c, s, ms, o) {
  const svg = s.ownerSVGElement; if (!svg || !s.getTotalLength) return;
  let defs = svg.querySelector(':scope > defs'); if (!defs) defs = svgEl('defs', {}, svg);
  let len = 0; try { len = s.getTotalLength(); } catch (e) { len = 0; }
  if (!len) return;
  const id = uid('bkm'), vb = svg.viewBox.baseVal, W = (vb && vb.width) || 2000, H = (vb && vb.height) || 2000;
  const m = svgEl('mask', { id, maskUnits: 'userSpaceOnUse', x: -400, y: -400, width: W + 800, height: H + 800 }, defs);
  const sw = parseFloat(s.getAttribute('stroke-width')) || 4;
  const mp = svgEl('path', { d: s.getAttribute('d'), fill: 'none', stroke: '#fff', 'stroke-width': sw + 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, m);
  mp.style.strokeDasharray = len + ' ' + (len + 20);
  s.setAttribute('mask', `url(#${id})`);
  try { await c.anim(mp, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], ms, { easing: o.easing || 'ease-in-out' }); }
  finally { s.removeAttribute('mask'); m.remove(); }
}
/** place an HTML label at (px, py): pos 'c' centred, or the side it sits on: n s e w ne nw se sw */
export function place(d, px, py, pos = 'c', gap = 8) {
  d.style.left = px + 'px'; d.style.top = py + 'px';
  const tx = /e/.test(pos) ? gap + 'px' : /w/.test(pos) ? `calc(-100% - ${gap}px)` : '-50%';
  const ty = /s/.test(pos) ? gap + 'px' : /n/.test(pos) ? `calc(-100% - ${gap}px)` : '-50%';
  d.style.translate = tx + ' ' + ty;
  return d;
}
/** an arrowhead polygon with its tip at (x, y) pointing along (dx, dy) */
export function arrowHead(parent, x, y, dx, dy, o = {}) {
  const [ux, uy] = norm(dx, dy), w = Math.min(o.width || 3.5, 5), L = o.L || 9 + w * 1.7, hw = o.hw || 4 + w * 1.05;
  const pts = [[x, y], [x - L * ux + hw * uy, y - L * uy - hw * ux], [x - L * ux - hw * uy, y - L * uy + hw * ux]];
  return svgEl('polygon', { class: 'bk-head ' + (o.cls || ''), points: pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '), fill: o.color || 'currentColor' }, parent);
}
/** an endpoint marker: 'arrow' | 'open' | 'closed' */
function endMark(parent, e, color, w, r) {
  const k = ' bk-end bk-end' + e.k;
  if (e.s === 'arrow') return arrowHead(parent, e.p[0], e.p[1], e.d[0], e.d[1], { width: w, color, cls: k });
  if (e.s !== 'open' && e.s !== 'closed') return null;
  const R = r || 4 + Math.min(w, 4) * 0.75, open = e.s === 'open';
  return svgEl('circle', { class: 'bk-dot' + k + (open ? ' bk-open' : ''), cx: e.p[0], cy: e.p[1], r: R, fill: open ? '#fff' : color, stroke: open ? color : '#fff', 'stroke-width': open ? Math.max(2.5, Math.min(w, 4) * 0.85) : 1.8 }, parent);
}
const pathD = (subs, closed) => subs.filter((s) => s.length).map((s) => 'M' + s.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + (closed ? 'Z' : '')).join('');
const endStyles = (o) => {
  const e = (o.ends || [null, null]).slice();
  if (o.openA) e[0] = 'open'; if (o.closedA) e[0] = 'closed'; if (o.arrowA) e[0] = 'arrow';
  if (o.openB) e[1] = 'open'; if (o.closedB) e[1] = 'closed'; if (o.arrowB) e[1] = 'arrow';
  return e;
};
/** unit direction at the end of a px polyline, looking back at least 8 px for a stable heading */
function dirAt(pts, last) {
  const n = pts.length; if (n < 2) return [1, 0];
  const a = last ? pts[n - 1] : pts[0];
  for (let i = 1; i < n; i++) { const b = last ? pts[n - 1 - i] : pts[i]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) >= 8 || i === n - 1) return norm(a[0] - b[0], a[1] - b[1]); }
  return [1, 0];
}

/* =============================== numeric solvers =============================== */
/** a zero of f between a and b (bisection after scanning for a sign change). null if none. */
export function zero(f, a, b) {
  const N = 400; let lo = null, hi = null, flo;
  for (let i = 0, prev = null, px = a; i <= N; i++) {
    const x = a + (b - a) * i / N, y = f(x);
    if (!Number.isFinite(y)) { prev = null; continue; }
    if (y === 0) return clean(x);
    if (prev != null && Math.sign(prev) !== Math.sign(y)) { lo = px; hi = x; flo = prev; break; }
    prev = y; px = x;
  }
  if (lo == null) { // no sign change: a touching zero (double root)?
    const m = extremum((x) => Math.abs(f(x)), a, b); return Number.isFinite(m.y) && m.y < 1e-7 ? m.x : null;
  }
  for (let k = 0; k < 200; k++) { const m = (lo + hi) / 2, fm = f(m); if (fm === 0) return clean(m); if (Math.sign(fm) === Math.sign(flo)) { lo = m; flo = fm; } else hi = m; }
  return clean((lo + hi) / 2);
}
/** the intersection of f and g nearest to guess (like the calculator's intersect). { x, y } or null */
export function intersect(f, g, guess = 0, o = {}) {
  const d = (x) => f(x) - g(x), span = o.span || 50, step = o.step || 0.05;
  if (d(guess) === 0) return { x: clean(guess), y: clean(f(guess)) };
  for (let r = step; r <= span + 1e-9; r += step) {
    for (const [a, b] of [[guess + r - step, guess + r], [guess - r, guess - r + step]]) {
      const da = d(a), db = d(b);
      if (Number.isFinite(da) && Number.isFinite(db) && (da === 0 || db === 0 || Math.sign(da) !== Math.sign(db))) { const x = zero(d, a, b); if (x != null) return { x, y: clean(f(x)) }; }
    }
  }
  return null;
}
/** the minimum (or { max: true } maximum) of f on [a, b] (golden-section search). { x, y } */
export function extremum(f, a, b, o = {}) {
  const s = o.max ? -1 : 1, F = (x) => s * f(x);
  // coarse scan first so a wide window still finds the right hump
  let best = a, bv = Infinity; const N = 200;
  for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N, v = F(x); if (v < bv) { bv = v; best = x; } }
  let lo = Math.max(a, best - (b - a) / N), hi = Math.min(b, best + (b - a) / N);
  const g = (Math.sqrt(5) - 1) / 2;
  for (let k = 0; k < 120; k++) { const x1 = hi - g * (hi - lo), x2 = lo + g * (hi - lo); if (F(x1) < F(x2)) hi = x2; else lo = x1; }
  let x = (lo + hi) / 2; const r = Math.round(x * 1e6) / 1e6; if (F(r) <= F(x) + 1e-12) x = r; // a flat top: prefer the tidy value
  x = clean(x); return { x, y: clean(f(x)) };
}
/** compile "2*x+1" / "x^2-4" (Math functions allowed) into a function of x — for declarative markup */
export function compile(expr) {
  if (typeof expr === 'function') return expr;
  // eslint-disable-next-line no-new-func
  // a unary minus becomes (-1)* first, so "-x^2" means -(x²) like on paper (JS refuses -x**2)
  const js = String(expr).replace(/(^|[(,+\-*/])\s*-/g, '$1(-1)*').replace(/\^/g, '**');
  return new Function('x', 'with (Math) { return (' + js + '); }');
}

/* =============================== Box: SVG + HTML overlay =============================== */
export class Box {
  constructor(host, o, cls, W, H) {
    this.o = o; this.W = W; this.H = H; this.items = [];
    const el = this.el = h('div', 'bk-box ' + cls + (o.cls ? ' ' + o.cls : ''));
    box(el, W, H);
    if (o.x != null || o.y != null) { el.style.position = 'absolute'; at(el, o.x || 0, o.y || 0); }
    this.svg = svgEl('svg', { class: 'bk-svg', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, el);
    this.defs = svgEl('defs', {}, this.svg);
    this.html = h('div', 'bk-html'); el.appendChild(this.html);
    el.bk = this;
    if (host) host.appendChild(el);
  }
  layer(name, parent) { return svgEl('g', { class: 'bk-L-' + name }, parent || this.svg); }
  /** keep el up to date: draw() now and on every redraw() */
  track(el, draw) { el._bkDraw = draw; draw(); this.items.push(el); return el; }
  redraw() { this.items = this.items.filter((e) => e.parentNode); this.items.forEach((e) => e._bkDraw && e._bkDraw()); }
  /** an HTML label at px coordinates */
  hlabel(px, py, html, o = {}) {
    const d = h('div', 'bk-lab' + (o.cls ? ' ' + o.cls : ''), o.tex ? tex(html) : html);
    if (o.color) d.style.color = col(o.color);
    (o.parent || this.html).appendChild(d); return place(d, px, py, o.pos || 'c', o.gap ?? 8);
  }
  remove(...els) { els.flat().forEach((e) => { if (!e) return; e.remove(); if (e.label) e.label.remove(); }); this.items = this.items.filter((e) => e.parentNode); }
  drawIn(el, ms = 700, c, o) { return drawIn(el, ms, c, o); }
  /** reveal anything this block made: strokes draw in, points pop, labels fade */
  reveal(el, c, ms) {
    if (!el) return Promise.resolve();
    if (el.classList.contains('bk-curve')) return drawIn(el, ms || 700, c);
    if (el.classList.contains('bk-pt')) return Promise.all([pop(c, el, ms || 380), fadeIn(c, el.label, ms || 380)]);
    return fadeIn(c, el, ms || 350);
  }
  /** pointer event → this block's px coordinates (works with the lesson's scaling and page zoom) */
  pxOf(e) { const m = this.svg.getScreenCTM(); if (!m) return [0, 0]; const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); return [p.x, p.y]; }
  /** a stroked item kept up to date: compute() → { subs: [[[px,py],…]], ends: [{p, d, s, k, si, last}], closed, rects } */
  curve(compute, o = {}, cls = '', layer) {
    const g = svgEl('g', { class: 'bk-curve ' + cls + (o.cls ? ' ' + o.cls : '') }, layer || this.svg);
    const color = col(o.color, this.o.color || COLORS.teal), w = o.width || 3.5;
    g.style.color = color;
    const fillg = svgEl('g', { class: 'bk-fillg' }, g);
    const path = svgEl('path', { class: 'bk-stroke', fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': o.cap || 'round', 'stroke-linejoin': 'round' }, g);
    if (o.dash) path.setAttribute('stroke-dasharray', o.dash === true ? `${(w * 2.6).toFixed(1)} ${(w * 2.4).toFixed(1)}` : o.dash);
    if (o.opacity != null) path.setAttribute('stroke-opacity', o.opacity);
    if (o.fill) { path.setAttribute('fill', col(o.fill)); path.setAttribute('fill-opacity', o.fillOpacity ?? 0.18); }
    const ends = svgEl('g', { class: 'bk-ends' }, g);
    g.path = path; g.color = color;
    return this.track(g, () => {
      const r = compute() || { subs: [] }, subs = r.subs.map((s) => s.map((p) => p.slice()));
      (r.ends || []).forEach((e) => { // pull the line back under an arrowhead so the round cap can't poke past the tip
        if (e.s !== 'arrow' || e.si == null) return; const s = subs[e.si]; if (!s || s.length < 2) return;
        const i = e.last ? s.length - 1 : 0, L = (9 + Math.min(w, 5) * 1.7) * 0.55; s[i] = [s[i][0] - e.d[0] * L, s[i][1] - e.d[1] * L];
      });
      path.setAttribute('d', pathD(subs, r.closed) || 'M0 0');
      path.style.display = pathD(subs) ? '' : 'none';
      fillg.innerHTML = ''; (r.rects || []).forEach((q) => svgEl('rect', { x: q[0], y: q[1], width: q[2], height: q[3], fill: color, 'fill-opacity': o.bandOpacity ?? 0.1 }, fillg));
      ends.innerHTML = ''; (r.ends || []).forEach((e) => endMark(ends, e, color, w, o.r));
    });
  }
}
/** the ends of a px polyline as end markers */
const endsOf = (subs, styles, at = [true, true]) => {
  const out = []; if (!subs.length) return out;
  const f = subs[0], l = subs[subs.length - 1];
  if (styles[0] && at[0] && f.length) out.push({ p: f[0], d: dirAt(f, false), s: styles[0], k: 0, si: 0, last: false });
  if (styles[1] && at[1] && l.length) out.push({ p: l[l.length - 1], d: dirAt(l, true), s: styles[1], k: 1, si: subs.length - 1, last: true });
  return out;
};

/* =============================== Graph =============================== */
const THEMES = { calc: { grid: false, arrows: false, numbers: false, ticks: true, xtitle: '', ytitle: '', color: COLORS.blue, fnArrows: false, pad: 6 } };
export class Graph extends Box {
  constructor(host, opts = {}) {
    const o = Object.assign({ width: 440, height: 440, xmin: -10, xmax: 10, ymin: -10, ymax: 10, xstep: 1, ystep: 1, xlabels: 0, ylabels: 0,
      xtitle: 'x', ytitle: 'y', arrows: true, grid: true, axes: true, numbers: true, ticks: false, origin: false, major: 0, pad: null, fontSize: 17, fnArrows: true, theme: '' },
    THEMES[opts.theme] || {}, opts);
    if (o.xscl) o.xstep = o.xscl; if (o.yscl) o.ystep = o.yscl;
    super(host, o, 'bk-graph' + (o.theme ? ' bk-' + o.theme : ''), o.width, o.height);
    const p = o.pad, room = o.numbers || o.xtitle;
    this.P = Array.isArray(p) ? { t: p[0], r: p[1], b: p[2], l: p[3] }
      : p != null ? { t: p, r: p, b: p, l: p }
        : { t: 18, r: 18, b: room && o.ymin >= 0 ? 34 : 18, l: room && o.xmin >= 0 ? 42 : 18 };
    this.win = { xmin: o.xmin, xmax: o.xmax, ymin: o.ymin, ymax: o.ymax, xstep: o.xstep, ystep: o.ystep };
    const id = this.clipId = uid('bkc');
    this.clipRect = svgEl('rect', {}, svgEl('clipPath', { id }, this.defs));
    const L = this.layers = { bg: this.layer('bg'), grid: this.layer('grid'), axes: this.layer('axes'), data: this.layer('data'), top: this.layer('top') };
    L.data.setAttribute('clip-path', `url(#${id})`);
    this.axesHtml = h('div', 'bk-html'); this.el.insertBefore(this.axesHtml, this.html);
    this.frame();
    if (o.interactive) this.interactive(o.interactive === true ? {} : o.interactive);
  }
  /* ---- coordinates ---- */
  toPx(x, y) { const w = this.win, P = this.P; return [P.l + (x - w.xmin) / (w.xmax - w.xmin) * (this.W - P.l - P.r), P.t + (w.ymax - y) / (w.ymax - w.ymin) * (this.H - P.t - P.b)]; }
  fromPx(px, py) { const w = this.win, P = this.P; return [w.xmin + (px - P.l) / (this.W - P.l - P.r) * (w.xmax - w.xmin), w.ymax - (py - P.t) / (this.H - P.t - P.b) * (w.ymax - w.ymin)]; }
  get ux() { return (this.W - this.P.l - this.P.r) / (this.win.xmax - this.win.xmin); }
  get uy() { return (this.H - this.P.t - this.P.b) / (this.win.ymax - this.win.ymin); }
  inside(x, y, slack = 1e-9) { const w = this.win; return x >= w.xmin - slack && x <= w.xmax + slack && y >= w.ymin - slack && y <= w.ymax + slack; }
  axisX() { return clamp(0, this.win.xmin, this.win.xmax); }
  axisY() { return clamp(0, this.win.ymin, this.win.ymax); }
  fromEvent(e) { const [px, py] = this.pxOf(e); return this.fromPx(px, py); }
  /* ---- grid, axes, numbers ---- */
  frame() {
    this.frameBase();
    if (this.o.theme !== 'calc') return; // a real TI-84 draws no axis when 0 is outside the window (don't park it on the edge)
    const w = this.win, ax = this.layers.axes, showX = w.ymin <= 0 && w.ymax >= 0, showY = w.xmin <= 0 && w.xmax >= 0;
    const ls = ax.querySelectorAll('.bk-axis');
    if (ls[0]) ls[0].style.display = showX ? '' : 'none';
    if (ls[1]) ls[1].style.display = showY ? '' : 'none';
    ax.querySelectorAll('.bk-tick, .bk-axhead').forEach((t) => { const vert = t.tagName === 'line' ? t.getAttribute('x1') === t.getAttribute('x2') : null; if (vert !== null) t.style.display = (vert ? showX : showY) ? '' : 'none'; });
  }
  frameBase() {
    const L = this.layers, w = this.win, o = this.o, P = this.P, fs = o.fontSize;
    L.bg.innerHTML = L.grid.innerHTML = L.axes.innerHTML = ''; this.axesHtml.innerHTML = '';
    const [x0, y0] = this.toPx(w.xmin, w.ymax), [x1, y1] = this.toPx(w.xmax, w.ymin), m = 12;
    svgEl('rect', { class: 'bk-plot', x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, L.bg);
    Object.entries({ x: x0 - m, y: y0 - m, width: x1 - x0 + 2 * m, height: y1 - y0 + 2 * m }).forEach(([k, v]) => this.clipRect.setAttribute(k, v));
    const steps = (a, b, s) => { const out = []; if (!(s > 0)) return out; for (let v = Math.ceil(a / s - 1e-9) * s; v <= b + 1e-9; v += s) out.push(parseFloat(v.toFixed(10))); return out; };
    const isMult = (v, s) => s > 0 && Math.abs(v / s - Math.round(v / s)) < 1e-6;
    if (o.grid) {
      const gx = steps(w.xmin, w.xmax, w.xstep), gy = steps(w.ymin, w.ymax, w.ystep), mx = o.major * w.xstep, my = o.major * w.ystep;
      gx.forEach((v) => { const px = this.toPx(v, 0)[0]; svgEl('line', { class: 'bk-gl' + (o.major && isMult(v, mx) ? ' bk-gl-major' : ''), x1: px, x2: px, y1: y0, y2: y1 }, L.grid); });
      gy.forEach((v) => { const py = this.toPx(0, v)[1]; svgEl('line', { class: 'bk-gl' + (o.major && isMult(v, my) ? ' bk-gl-major' : ''), x1: x0, x2: x1, y1: py, y2: py }, L.grid); });
    }
    if (!o.axes) return;
    const [ax, ay] = this.toPx(this.axisX(), this.axisY());
    const ar = o.arrows, eL = ar && w.xmin < 0 ? Math.min(14, P.l - 3) : 0, eR = ar && w.xmax > 0 ? Math.min(14, P.r - 3) : 0;
    const eT = ar && w.ymax > 0 ? Math.min(14, P.t - 3) : 0, eB = ar && w.ymin < 0 ? Math.min(14, P.b - 3) : 0;
    svgEl('line', { class: 'bk-axis', x1: x0 - eL, x2: x1 + eR, y1: ay, y2: ay }, L.axes);
    svgEl('line', { class: 'bk-axis', x1: ax, x2: ax, y1: y1 + eB, y2: y0 - eT }, L.axes);
    const hd = { width: 2.4, L: 12, hw: 6, cls: 'bk-axhead' };
    if (eR > 0) arrowHead(L.axes, x1 + eR, ay, 1, 0, hd); if (eL > 0) arrowHead(L.axes, x0 - eL, ay, -1, 0, hd);
    if (eT > 0) arrowHead(L.axes, ax, y0 - eT, 0, -1, hd); if (eB > 0) arrowHead(L.axes, ax, y1 + eB, 0, 1, hd);
    if (o.ticks) {
      steps(w.xmin, w.xmax, w.xstep).forEach((v) => { if (v) { const px = this.toPx(v, 0)[0]; svgEl('line', { class: 'bk-tick', x1: px, x2: px, y1: ay - 4, y2: ay + 4 }, L.axes); } });
      steps(w.ymin, w.ymax, w.ystep).forEach((v) => { if (v) { const py = this.toPx(0, v)[1]; svgEl('line', { class: 'bk-tick', x1: ax - 4, x2: ax + 4, y1: py, y2: py }, L.axes); } });
    }
    if (o.numbers) {
      const auto = (s, u, min) => { for (const k of [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000]) if (k * s * u >= min) return k * s; return 1000 * s; };
      const xl = o.xlabels || auto(w.xstep, this.ux, Math.max(34, fs * 2.1)), yl = o.ylabels || auto(w.ystep, this.uy, fs * 1.6);
      const below = ay + 6 + fs <= this.H, left = ax - 8 - fs * 1.6 >= 0;
      steps(w.xmin, w.xmax, xl).forEach((v) => {
        if (Math.abs(v) < 1e-9) return; const px = this.toPx(v, 0)[0];
        svgEl('text', { class: 'bk-num', x: px, y: below ? ay + 5 + fs * 0.82 : ay - 7, 'text-anchor': 'middle' }, L.axes).textContent = num(v, 4);
      });
      steps(w.ymin, w.ymax, yl).forEach((v) => {
        if (Math.abs(v) < 1e-9) return; const py = this.toPx(0, v)[1];
        svgEl('text', { class: 'bk-num', x: left ? ax - 7 : ax + 7, y: py + fs * 0.34, 'text-anchor': left ? 'end' : 'start' }, L.axes).textContent = num(v, 4);
      });
      if (o.origin) svgEl('text', { class: 'bk-num', x: ax - 6, y: ay + 5 + fs * 0.82, 'text-anchor': 'end' }, L.axes).textContent = '0';
    }
    if (o.xtitle) this.hlabel(x1 + eR, ay - 2, tex(o.xtitle), { pos: 'nw', gap: 2, cls: 'bk-axt', parent: this.axesHtml });
    if (o.ytitle) this.hlabel(ax + 6, y0 - eT, tex(o.ytitle), { pos: 'e', gap: 4, cls: 'bk-axt', parent: this.axesHtml });
  }
  redraw() { this.frame(); super.redraw(); }
  /** change the viewing window; animated with c. win: { xmin, xmax, ymin, ymax, xstep|xscl, ystep|yscl } */
  setWindow(win, c, ms = 800) {
    const to = Object.assign({}, this.win, win), from = Object.assign({}, this.win);
    if (win.xscl) to.xstep = win.xscl; if (win.yscl) to.ystep = win.yscl;
    this.win.xstep = to.xstep; this.win.ystep = to.ystep;
    return tween(c, ms, (t) => { ['xmin', 'xmax', 'ymin', 'ymax'].forEach((k) => (this.win[k] = from[k] + (to[k] - from[k]) * t)); this.redraw(); });
  }
  clear() {
    this.layers.data.innerHTML = ''; this.layers.top.innerHTML = ''; this.html.innerHTML = ''; this.items = [];
    if (this.ro) this.ro.style.display = 'none'; if (this.userPts) this.userPts = [];
  }
  /* ---- things to draw (all in graph coordinates) ---- */
  /** a point. o: { label, pos ('ne'…), coords (label it "(x, y)"), open, color, r, tex } */
  point(x, y, o = {}) {
    const color = col(o.color, COLORS.teal), open = !!o.open;
    const g = svgEl('g', { class: 'bk-pt' + (open ? ' bk-open' : '') + (o.cls ? ' ' + o.cls : '') }, this.layers[o.layer || 'top']);
    const ci = svgEl('circle', { r: o.r || 6.5, fill: open ? '#fff' : color, stroke: open ? color : '#fff', 'stroke-width': open ? 3 : 2 }, g);
    g.gx = x; g.gy = y; g.color = color;
    const lab = o.coords ? tex(pairTex(x, y)) : o.label;
    if (lab != null) g.label = this.label(x, y, lab, { pos: o.pos || 'ne', cls: 'bk-ptlab' + (o.labelCls ? ' ' + o.labelCls : ''), tex: o.tex, color: o.labelColor || (o.color ? color : null), gap: o.gap ?? 5 });
    return this.track(g, () => { const [px, py] = this.toPx(g.gx, g.gy); ci.setAttribute('cx', px); ci.setAttribute('cy', py); g.style.display = this.inside(g.gx, g.gy, 1e-6) ? '' : 'none'; });
  }
  /** an HTML / KaTeX label at graph coordinates. o: { pos, tex, cls, color, dx, dy, gap } */
  label(x, y, html, o = {}) {
    const d = h('div', 'bk-lab' + (o.cls ? ' ' + o.cls : ''), o.tex ? tex(html) : html);
    if (o.color) d.style.color = col(o.color);
    this.html.appendChild(d); d.gx = x; d.gy = y;
    return this.track(d, () => { const [px, py] = this.toPx(d.gx, d.gy); place(d, px + (o.dx || 0), py + (o.dy || 0), o.pos || 'c', o.gap ?? 8); d.style.visibility = o.clip === false || this.inside(d.gx, d.gy, 1e-6) ? '' : 'hidden'; });
  }
  /** move a point or label (instantly); move(c, …) animates */
  moveTo(el, x, y) { el.gx = x; el.gy = y; el._bkDraw(); if (el.label) { el.label.gx = x; el.label.gy = y; el.label._bkDraw(); } return el; }
  move(c, el, x, y, ms = 700) { const x0 = el.gx, y0 = el.gy; return tween(c, ms, (t) => this.moveTo(el, x0 + (x - x0) * t, y0 + (y - y0) * t)); }
  /** sampled curve y = f(x). o: { from, to, color, width, dash, samples, arrows, ends: [a, b] ('open'|'closed'|'arrow'), openA…, breaks: [x…] } */
  fn(f, o = {}) {
    f = compile(f);
    const arrows = o.arrows ?? this.o.fnArrows, ends = endStyles(o);
    return this.curve(() => {
      const w = this.win, a = Math.max(o.from ?? -Infinity, w.xmin), b = Math.min(o.to ?? Infinity, w.xmax);
      if (!(b >= a)) return { subs: [] };
      const N = o.samples || Math.max(80, Math.round((b - a) * this.ux / 2)), brk = o.breaks || [], H = this.H;
      const inY = (y) => Number.isFinite(y) && y >= w.ymin - 1e-9 && y <= w.ymax + 1e-9;
      const val = (x) => { try { return f(x); } catch (e) { return NaN; } };
      const edge = (pi, po) => { const yb = po[1] > w.ymax ? w.ymax : w.ymin, t = (yb - pi[1]) / (po[1] - pi[1]); return [pi[0] + t * (po[0] - pi[0]), yb, 'edge']; };
      const subs = []; let cur = null, prev = null;
      for (let i = 0; i <= N; i++) {
        const x = a + (b - a) * i / N, y = val(x), pt = [x, y], isIn = inY(y);
        const jump = prev && prev.in && isIn && Math.abs(y - prev[1]) * this.uy > H * 0.6;
        if (prev && (jump || brk.some((bx) => bx > prev[0] && bx <= x))) { if (cur) subs.push(cur); cur = null; }
        else if (prev && prev.in && !isIn) { if (Number.isFinite(y) && cur) cur.push(edge(prev, pt)); if (cur) subs.push(cur); cur = null; }
        else if (prev && !prev.in && isIn && Number.isFinite(prev[1])) cur = [edge(pt, prev)];
        if (isIn) { if (!cur) cur = []; cur.push(pt); }
        pt.in = isIn; prev = pt;
      }
      if (cur) subs.push(cur);
      const ePts = [];
      subs.forEach((s, si) => {
        [[s[0], false], [s[s.length - 1], true]].forEach(([p, last]) => {
          const domEnd = last ? o.to != null && Math.abs(p[0] - o.to) < 1e-9 && o.to <= w.xmax : o.from != null && Math.abs(p[0] - o.from) < 1e-9 && o.from >= w.xmin;
          const onEdge = p[2] === 'edge' || Math.abs(p[0] - w.xmin) < 1e-9 || Math.abs(p[0] - w.xmax) < 1e-9;
          const s2 = domEnd ? ends[last ? 1 : 0] : onEdge && arrows ? 'arrow' : null;
          if (s2) ePts.push({ si, last, s: s2, k: last ? 1 : 0 });
        });
      });
      const px = subs.map((s) => s.map((p) => this.toPx(p[0], p[1])));
      return { subs: px, ends: ePts.map((e) => { const s = px[e.si]; return { ...e, p: e.last ? s[s.length - 1] : s[0], d: dirAt(s, e.last) }; }).filter((e) => px[e.si].length > 1 || e.s !== 'arrow') };
    }, o, 'bk-fn', this.layers.data);
  }
  _clipT(a, d, t0, t1) {
    const w = this.win, p = [-d[0], d[0], -d[1], d[1]], q = [a[0] - w.xmin, w.xmax - a[0], a[1] - w.ymin, w.ymax - a[1]];
    for (let i = 0; i < 4; i++) {
      if (Math.abs(p[i]) < 1e-12) { if (q[i] < 0) return null; continue; }
      const r = q[i] / p[i]; if (p[i] < 0) t0 = Math.max(t0, r); else t1 = Math.min(t1, r);
    }
    return t0 <= t1 ? [t0, t1] : null;
  }
  _lin(a, b, t0, t1, styles, o, cls) {
    return this.curve(() => {
      const d = [b[0] - a[0], b[1] - a[1]], T = this._clipT(a, d, t0, t1); if (!T) return { subs: [] };
      const P = (t) => this.toPx(a[0] + d[0] * t, a[1] + d[1] * t), s = [P(T[0]), P(T[1])];
      return { subs: [s], ends: endsOf([s], [T[0] === t0 ? styles[0] : styles[2] || null, T[1] === t1 ? styles[1] : styles[3] || null]) };
    }, o, cls, this.layers[o.layer || 'data']);
  }
  /** a segment from a to b ([x, y] pairs). o: { openA, openB, closedA, closedB, ends, color, width, dash } */
  segment(a, b, o = {}) { const e = endStyles(o); return this._lin(a, b, 0, 1, [e[0], e[1]], o, 'bk-seg'); }
  /** the whole line through a and b (or { m, b } / { x: k } for a vertical line), clipped to the window, arrows at the edges */
  line(a, b, o = {}) {
    if (a && !Array.isArray(a)) { o = b || {}; const L = a; if (L.x != null) { a = [L.x, 0]; b = [L.x, 1]; } else { a = [0, L.b || 0]; b = [1, (L.b || 0) + L.m]; } }
    const ar = o.arrows ?? true ? 'arrow' : null; return this._lin(a, b, -Infinity, Infinity, [ar, ar, ar, ar], o, 'bk-line');
  }
  /** a ray from a through b. o: { start: 'closed'|'open'|null } */
  ray(a, b, o = {}) { return this._lin(a, b, 0, Infinity, [o.start === undefined ? 'closed' : o.start, 'arrow', null, 'arrow'], o, 'bk-ray'); }
  /** a polyline through graph points. o: { closed, fill, ends, dash, color, width } */
  polyline(pts, o = {}) { const e = endStyles(o); return this.curve(() => { const s = pts.map((p) => this.toPx(p[0], p[1])); return { subs: [s], ends: o.closed ? [] : endsOf([s], e), closed: o.closed }; }, o, 'bk-poly', this.layers[o.layer || 'data']); }
  /** a full-height vertical line at x (dashed by default); returns g with g.set(x) */
  vline(x, o = {}) {
    const st = { x }, g = this.curve(() => { const [px] = this.toPx(st.x, 0), y0 = this.toPx(0, this.win.ymax)[1], y1 = this.toPx(0, this.win.ymin)[1]; return { subs: [[[px, y0], [px, y1]]] }; },
      Object.assign({ color: 'slate', width: 2.5, dash: true }, o), 'bk-vline', this.layers.data);
    g.gx = x; g.set = (v) => { g.gx = st.x = v; g._bkDraw(); return g; }; return g;
  }
  hline(y, o = {}) {
    const st = { y }, g = this.curve(() => { const py = this.toPx(0, st.y)[1], x0 = this.toPx(this.win.xmin, 0)[0], x1 = this.toPx(this.win.xmax, 0)[0]; return { subs: [[[x0, py], [x1, py]]] }; },
      Object.assign({ color: 'slate', width: 2.5, dash: true }, o), 'bk-hline', this.layers.data);
    g.gy = y; g.set = (v) => { g.gy = st.y = v; g._bkDraw(); return g; }; return g;
  }
  /** dashed guide lines from (x, y) to both axes */
  guides(x, y, o = {}) {
    return this.curve(() => { const P = this.toPx(x, y), A = this.toPx(x, this.axisY()), B = this.toPx(this.axisX(), y); return { subs: [[A, P], [B, P]] }; },
      Object.assign({ color: 'gray', width: 2, dash: '5 5' }, o), 'bk-guides', this.layers.data);
  }
  /** domain "shadow": a bar on the x-axis from a to b (±Infinity → arrow to the edge). o: { openA, openB, color, width, band, offset } */
  shadeX(a, b, o = {}) { return this._shade('x', a, b, o); }
  /** range "shadow" on the y-axis */
  shadeY(a, b, o = {}) { return this._shade('y', a, b, o); }
  _shade(ax, a, b, o) {
    const oo = Object.assign({ color: ax === 'x' ? 'amber' : 'purple', width: 9, opacity: 0.6, r: 7.5, cap: 'butt' }, o);
    return this.curve(() => {
      const w = this.win, X = ax === 'x', lo = Math.max(a, X ? w.xmin : w.ymin), hi = Math.min(b, X ? w.xmax : w.ymax), off = o.offset || 0;
      if (hi < lo) return { subs: [] };
      const P = (v) => { const p = X ? this.toPx(v, this.axisY()) : this.toPx(this.axisX(), v); return X ? [p[0], p[1] + off] : [p[0] + off, p[1]]; };
      const p1 = P(lo), p2 = P(hi), s = [p1, p2];
      const st = (v, lim, open) => (!Number.isFinite(v) || (X ? v < w.xmin || v > w.xmax : v < w.ymin || v > w.ymax) ? (lim ? 'arrow' : null) : open ? 'open' : 'closed');
      const ends = [{ p: p1, d: X ? [-1, 0] : [0, 1], s: st(a, true, o.openA), k: 0, si: 0, last: false }, { p: p2, d: X ? [1, 0] : [0, -1], s: st(b, true, o.openB), k: 1, si: 0, last: true }];
      const rects = []; if (o.band) {
        const [x0, y0] = this.toPx(w.xmin, w.ymax), [x1, y1] = this.toPx(w.xmax, w.ymin);
        rects.push(X ? [p1[0], y0, p2[0] - p1[0], y1 - y0] : [x0, p2[1], x1 - x0, p1[1] - p2[1]]);
      }
      return { subs: [s], ends, rects };
    }, oo, 'bk-shade bk-shade-' + ax, this.layers.data);
  }
  /** animated vertical line test. o: { hits: x => [y…] | points: [[x,y]…], from, to, ms, stop (default true), color, minGap (px), snap }
   *  Sweeps left to right and stops at the first x where it clearly crosses twice (hits ≥ minGap px apart), moved on to a
   *  tidy x (a multiple of snap, default xstep) when one is close. Resolves { line, dots, fail: { x, ys } | null } */
  async vlineTest(c, o = {}) {
    const w = this.win, from = o.from ?? w.xmin, to = o.to ?? w.xmax, N = 600, inY = (y) => y >= w.ymin - 1e-9 && y <= w.ymax + 1e-9;
    let hits = o.hits;
    if (!hits && o.points) { const tol = 3 / this.ux; hits = (x) => o.points.filter((p) => Math.abs(p[0] - x) <= tol).map((p) => p[1]); }
    const ysAt = (x) => [...new Set((hits(x) || []).filter((y) => Number.isFinite(y) && inY(y)).map((y) => clean(y)))];
    let stop = to, fail = null;
    if (o.stop !== false) {
      if (o.points) {
        const xs = [...new Set(o.points.map((p) => p[0]))].filter((x) => x >= from && x <= to).sort((p, q) => p - q);
        for (const x of xs) { const ys = [...new Set(o.points.filter((p) => p[0] === x).map((p) => p[1]))]; if (ys.length > 1) { stop = x; fail = { x, ys }; break; } }
      } else {
        const gap = (o.minGap ?? 36) / this.uy, apart = (ys) => ys.length > 1 && Math.max(...ys) - Math.min(...ys) >= gap;
        for (let i = 0; i <= N; i++) { const x = from + (to - from) * i / N, ys = ysAt(x); if (apart(ys)) { stop = x; fail = { x, ys }; break; } }
        // prefer a tidy x (a multiple of snap, default the grid step) just past the first failure, so the numbers are nice
        const sn = o.snap ?? w.xstep;
        if (fail && sn) for (let x = Math.ceil(fail.x / sn - 1e-9) * sn, k = 0; x <= to && k < 4; x += sn, k++) { const ys = ysAt(clean(x)); if (apart(ys)) { stop = clean(x); fail = { x: stop, ys }; break; } }
      }
    }
    const line = this.vline(from, { color: o.color || 'blue', width: 3.5, dash: false, cls: 'bk-vlt' });
    const dots = svgEl('g', { class: 'bk-vlt-dots' }, this.layers.top);
    const paint = (x, ys) => { line.set(x); dots.innerHTML = ''; (ys || ysAt(x)).forEach((y) => { const [px, py] = this.toPx(x, y); svgEl('circle', { class: 'bk-vlt-dot', cx: px, cy: py, r: 8 }, dots); }); };
    const ms = o.ms ?? 2600 * Math.abs(stop - from) / (Math.abs(to - from) || 1);
    await tween(c, ms, (t) => paint(from + (stop - from) * t), linear);
    if (fail) { paint(fail.x, fail.ys); line.classList.add('bk-fail'); dots.classList.add('bk-fail'); if (c) await Promise.all([...dots.children].map((d) => pop(c, d, 360))); }
    else line.classList.add('bk-pass');
    return { line, dots, fail };
  }
  /* ---- graphing-calculator helpers ---- */
  zero(f, a, b) { return zero(compile(f), a, b); }
  intersect(f, g, guess, o) { return intersect(compile(f), compile(g), guess, o); }
  extremum(f, a, b, o) { return extremum(compile(f), a, b, o); }
  /** calculator-style readout in a corner. readout('Intersection', { x, y }); readout(null) hides it. o: { pos: 'bl'|'tl'|'br'|'tr' } */
  readout(title, xy, o = {}) {
    if (!this.ro) { this.ro = h('div', 'bk-readout'); this.el.appendChild(this.ro); }
    const ro = this.ro; if (title == null && !xy) { ro.style.display = 'none'; return ro; }
    const pos = o.pos || (this.o.theme === 'calc' ? 'bl' : 'tl'), P = this.P;
    ro.className = 'bk-readout bk-ro-' + pos;
    ro.style.left = /l/.test(pos) ? P.l + 6 + 'px' : ''; ro.style.right = /r/.test(pos) ? P.r + 6 + 'px' : '';
    ro.style.top = /t/.test(pos) ? P.t + 6 + 'px' : ''; ro.style.bottom = /b/.test(pos) ? P.b + 6 + 'px' : '';
    ro.innerHTML = (title ? `<div class="bk-ro-t">${title}</div>` : '') + (xy ? `<div class="bk-ro-v"><i class="bk-ro-x">X=${calcNum(xy.x)}</i><i class="bk-ro-y">Y=${calcNum(xy.y)}</i></div>` : '');
    ro.style.display = ''; return ro;
  }
  /** a trace cursor on y = f(x). Returns { el, x, y, set(x), move(c, x, ms), remove() }. o: { readout (true), title, color } */
  traceMarker(f, x, o = {}) {
    f = compile(f);
    const g = svgEl('g', { class: 'bk-trace' }, this.layers.top), color = col(o.color, COLORS.orange);
    const ring = svgEl('circle', { r: 9, fill: 'none', stroke: color, 'stroke-width': 3 }, g), cross = svgEl('path', { stroke: color, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
    const T = {
      el: g, x, y: f(x),
      set: (v) => {
        T.x = v; T.y = f(v); const [px, py] = this.toPx(v, T.y), ok = Number.isFinite(T.y) && this.inside(v, T.y, 1e-6);
        g.style.display = ok ? '' : 'none'; ring.setAttribute('cx', px); ring.setAttribute('cy', py);
        cross.setAttribute('d', `M${px - 15} ${py}h8M${px + 7} ${py}h8M${px} ${py - 15}v8M${px} ${py + 7}v8`);
        if (o.readout !== false) this.readout(o.title ?? '', { x: T.x, y: T.y });
        return T;
      },
      move: (c, v, ms = 900) => { const a = T.x; return tween(c, ms, (t) => T.set(a + (v - a) * t)); },
      remove: () => { g.remove(); if (o.readout !== false) this.readout(null); }
    };
    this.track(g, () => T.set(T.x));
    return T;
  }
  /* ---- tap to plot (finger and Pencil) ---- */
  /** o: { snap: 1, max, color, coords (label points), onChange(points), fixed: false } — tap empty grid to add, drag to move, tap a point to remove */
  interactive(o = {}) {
    if (this._ix) return this; this._ix = o; this.userPts = this.userPts || [];
    this.el.setAttribute('data-tap', ''); this.el.classList.add('bk-ix');
    const snap = o.snap ?? 1, S = (v) => (snap ? Math.round(v / snap) * snap : v), w = () => this.win;
    const changed = () => o.onChange && o.onChange(this.userPts.map((p) => [p.gx, p.gy]));
    const mk = (x, y) => { const p = this.point(x, y, { color: o.color || 'blue', coords: o.coords, r: 8, cls: 'bk-upt' }); this.userPts.push(p); return p; };
    let drag = null;
    this.svg.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return; e.preventDefault();
      const [px, py] = this.pxOf(e), [x, y] = this.fromPx(px, py);
      const hit = this.userPts.find((p) => { const q = this.toPx(p.gx, p.gy); return Math.hypot(q[0] - px, q[1] - py) < 24; });
      if (hit) drag = { p: hit, moved: false, isNew: false };
      else if (this.inside(x, y) && !(o.max && this.userPts.length >= o.max)) { drag = { p: mk(S(x), S(y)), moved: false, isNew: true }; changed(); }
      if (drag) try { this.svg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    this.svg.addEventListener('pointermove', (e) => {
      if (!drag) return; const [x, y] = this.fromEvent(e), W = w();
      const nx = clamp(S(x), W.xmin, W.xmax), ny = clamp(S(y), W.ymin, W.ymax);
      if (nx !== drag.p.gx || ny !== drag.p.gy) { drag.moved = true; this.moveTo(drag.p, nx, ny); if (drag.p.label && o.coords) drag.p.label.innerHTML = tex(pairTex(nx, ny)); changed(); }
    });
    const up = () => { if (!drag) return; if (!drag.moved && !drag.isNew) { this.remove(drag.p); this.userPts = this.userPts.filter((p) => p !== drag.p); changed(); } drag = null; };
    this.svg.addEventListener('pointerup', up); this.svg.addEventListener('pointercancel', up);
    return this;
  }
  points() { return (this.userPts || []).map((p) => [p.gx, p.gy]); }
}
/** a number the way the calculator shows it: up to 7 significant digits */
export function calcNum(v) { if (!Number.isFinite(v)) return 'ERR'; v = clean(v); const s = String(parseFloat(v.toPrecision(7))); return s.replace('-', '−'); }

/* =============================== NumberLine =============================== */
export class NumberLine extends Box {
  constructor(host, opts = {}) {
    const o = Object.assign({ width: 640, height: 100, min: -5, max: 5, step: 1, labelStep: 0, minor: 0, arrows: true, pad: 34, axisY: null, numbers: true, labels: null, fontSize: 19 }, opts);
    super(host, o, 'bk-nline', o.width, o.height);
    this.ay = o.axisY ?? o.height - 44;
    this.layers = { axis: this.layer('axis'), data: this.layer('data'), top: this.layer('top') };
    this.axisHtml = h('div', 'bk-html'); this.el.insertBefore(this.axisHtml, this.html);
    this.frame();
  }
  toPx(v) { const o = this.o; return o.pad + (v - o.min) / (o.max - o.min) * (this.W - 2 * o.pad); }
  fromPx(px) { const o = this.o; return o.min + (px - o.pad) / (this.W - 2 * o.pad) * (o.max - o.min); }
  frame() {
    const o = this.o, L = this.layers.axis, ay = this.ay, x0 = this.toPx(o.min), x1 = this.toPx(o.max), ext = o.arrows ? Math.min(24, o.pad - 4) : 0;
    L.innerHTML = ''; this.axisHtml.innerHTML = '';
    svgEl('line', { class: 'bk-axis bk-nl-axis', x1: x0 - ext, x2: x1 + ext, y1: ay, y2: ay }, L);
    if (o.arrows) { arrowHead(L, x1 + ext, ay, 1, 0, { width: 3, cls: 'bk-axhead' }); arrowHead(L, x0 - ext, ay, -1, 0, { width: 3, cls: 'bk-axhead' }); }
    const steps = (s) => { const out = []; for (let v = Math.ceil(o.min / s - 1e-9) * s; v <= o.max + 1e-9; v += s) out.push(parseFloat(v.toFixed(10))); return out; };
    if (o.minor) steps(o.minor).forEach((v) => { const px = this.toPx(v); svgEl('line', { class: 'bk-nl-tk bk-minor', x1: px, x2: px, y1: ay - 5, y2: ay + 5 }, L); });
    steps(o.step).forEach((v) => { const px = this.toPx(v); svgEl('line', { class: 'bk-nl-tk', x1: px, x2: px, y1: ay - 9, y2: ay + 9 }, L); });
    if (!o.numbers) return;
    const labs = Array.isArray(o.labels) ? o.labels : steps(o.labelStep || o.step).map((v) => ({ v, html: typeof o.labels === 'function' ? o.labels(v) : null }));
    labs.forEach((l) => {
      const v = l.v ?? l[0], html = l.html ?? l[1];
      if (html == null) svgEl('text', { class: 'bk-num bk-nl-num', x: this.toPx(v), y: ay + 16 + o.fontSize * 0.8, 'text-anchor': 'middle' }, L).textContent = num(v, 4);
      else this.hlabel(this.toPx(v), ay + 14, html, { pos: 's', gap: 0, cls: 'bk-nl-lab', parent: this.axisHtml });
    });
  }
  /** a point on the line. o: { open, color, label (above), pos, lift } */
  point(v, o = {}) {
    const color = col(o.color, COLORS.teal), open = !!o.open, px = this.toPx(v), py = this.ay - (o.lift || 0);
    const g = svgEl('g', { class: 'bk-pt' + (open ? ' bk-open' : '') }, this.layers.top);
    svgEl('circle', { cx: px, cy: py, r: o.r || 8, fill: open ? '#fff' : color, stroke: open ? color : '#fff', 'stroke-width': open ? 3.2 : 2 }, g);
    g.gx = v; if (o.label != null) g.label = this.hlabel(px, py - 10, o.label, { pos: o.pos || 'n', gap: 2, cls: 'bk-ptlab', tex: o.tex, color: o.color ? color : null });
    return g;
  }
  /** an interval: thick bar from a to b (±Infinity → arrow). o: { openA, openB, color, width, lift } */
  interval(a, b, o = {}) {
    const oo = Object.assign({ color: 'teal', width: 7, r: 8.5 }, o);
    return this.curve(() => {
      const lo = Math.max(a, this.o.min), hi = Math.min(b, this.o.max), y = this.ay - (o.lift || 0), ext = Math.min(22, this.o.pad - 6);
      const p1 = [Number.isFinite(a) && a >= this.o.min ? this.toPx(lo) : this.toPx(this.o.min) - ext, y], p2 = [Number.isFinite(b) && b <= this.o.max ? this.toPx(hi) : this.toPx(this.o.max) + ext, y];
      const st = (v, open) => (Number.isFinite(v) && v >= this.o.min && v <= this.o.max ? (open ? 'open' : 'closed') : 'arrow');
      return { subs: [[p1, p2]], ends: [{ p: p1, d: [-1, 0], s: st(a, o.openA), k: 0, si: 0, last: false }, { p: p2, d: [1, 0], s: st(b, o.openB), k: 1, si: 0, last: true }] };
    }, oo, 'bk-interval', this.layers.data);
  }
  /** an arc hop from a to b with an optional label at the top. Static without c. o: { label, height, color, below, ms, tex } */
  async hop(c, a, b, o = {}) {
    const p1 = this.toPx(a), p2 = this.toPx(b), mx = (p1 + p2) / 2, hh = o.height || Math.min(60, 18 + Math.abs(p2 - p1) * 0.35), sgn = o.below ? 1 : -1, y = this.ay + sgn * 6;
    const g = this.curve(() => {
      const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([p1 + (p2 - p1) * t, y + sgn * 4 * hh * t * (1 - t)]); }
      return { subs: [pts], ends: [{ p: pts[24], d: dirAt(pts, true), s: 'arrow', k: 1, si: 0, last: true }] };
    }, Object.assign({ color: 'amber', width: 3.2 }, o), 'bk-hop', this.layers.data);
    if (o.label != null) g.label = this.hlabel(mx, y + sgn * (hh + 4), o.label, { pos: o.below ? 's' : 'n', gap: 2, cls: 'bk-hoplab', tex: o.tex, color: o.color || 'amber' });
    if (c) { if (g.label) g.label.style.opacity = 0; await drawIn(g, o.ms || 520, c); await fadeIn(c, g.label, 260); }
    return g;
  }
  /** a label at v. o: { pos ('n' above the line, 's' below), lift, tex, cls } */
  mark(v, html, o = {}) { const below = o.pos === 's'; return this.hlabel(this.toPx(v), this.ay + (below ? 14 : -14 - (o.lift || 0)), html, { pos: o.pos || 'n', gap: 0, cls: 'bk-nl-mark' + (o.cls ? ' ' + o.cls : ''), tex: o.tex, color: o.color }); }
  clear() { this.layers.data.innerHTML = ''; this.layers.top.innerHTML = ''; this.html.innerHTML = ''; this.items = []; }
}

/* =============================== ValueTable =============================== */
export class ValueTable {
  constructor(host, opts = {}) {
    const o = this.o = Object.assign({ headers: ['x', 'y'], rows: [], layout: 'v', cellW: 96, cellH: 52, headW: 0, tex: true, hide: null, tap: true, q: '?', diffs: false, diffSpace: 96, cls: '' }, opts);
    this.rows = o.rows.map((r) => r.slice());
    this.el = h('div', 'bk-tablebox' + (o.cls ? ' ' + o.cls : ''));
    if (o.x != null || o.y != null) { this.el.style.position = 'absolute'; at(this.el, o.x || 0, o.y || 0); }
    if (o.diffs) this.el.style[o.layout === 'v' ? 'paddingRight' : 'paddingBottom'] = o.diffSpace + 'px';
    this.grid = h('div', 'bk-table bk-lay-' + o.layout); this.el.appendChild(this.grid);
    this.svg = svgEl('svg', { class: 'bk-tsvg', width: 1, height: 1 }, this.el);
    this.html = h('div', 'bk-html'); this.el.appendChild(this.html);
    this.el.bk = this;
    this.render();
    if (host) host.appendChild(this.el);
  }
  fmt(v) {
    if (v == null) return ''; if (typeof v === 'object' && v.html != null) return v.html;
    if (typeof v === 'number') return this.o.tex ? tex(texNum(v, 4)) : num(v, 4);
    return this.o.tex ? tex(String(v)) : String(v);
  }
  _hidden(r, c) { const hd = this.o.hide; if (!hd) return false; if (typeof hd === 'function') return hd(r, c); if (typeof hd === 'number' || typeof hd === 'string') return c === (typeof hd === 'number' ? hd : this.o.headers.indexOf(hd)); return hd.some((p) => p[0] === r && p[1] === c); }
  _pos(el, r, c) { const v = this.o.layout === 'v'; el.style.gridRow = String(v ? r + 2 : c + 1); el.style.gridColumn = String(v ? c + 1 : r + 2); }
  _tmpl() {
    const o = this.o, v = o.layout === 'v';
    this.grid.style.gridTemplateColumns = v ? `repeat(${o.headers.length}, ${o.cellW}px)` : `${o.headW || o.cellW}px repeat(${this.rows.length}, ${o.cellW}px)`;
    this.grid.style.gridAutoRows = o.cellH + 'px';
  }
  render() {
    this.grid.innerHTML = ''; this.cells = []; this.heads = [];
    this._tmpl();
    this.o.headers.forEach((t, c) => { const d = h('div', 'bk-th', this.fmt(t)); this._pos(d, -1, c); this.grid.appendChild(d); this.heads.push(d); });
    this.rows.forEach((row, r) => this._row(r));
  }
  _row(r) {
    this.cells[r] = this.rows[r].map((v, c) => {
      const el = h('div', 'bk-td'); el.dataset.r = r; el.dataset.c = c; this._pos(el, r, c); this.grid.appendChild(el);
      this._fill(el, v, this._hidden(r, c)); return el;
    });
  }
  _fill(el, v, hid) {
    el.classList.toggle('bk-hid', !!hid);
    el.innerHTML = hid ? `<i class="bk-q">${this.o.q}</i>` : `<div class="bk-tv">${this.fmt(v)}</div>`;
    if (hid && this.o.tap) { el.setAttribute('data-tap', ''); el.setAttribute('role', 'button'); el.onclick = () => this.reveal(+el.dataset.r, +el.dataset.c, liveCtx()); }
    else { el.removeAttribute('data-tap'); el.removeAttribute('role'); el.onclick = null; }
  }
  cell(r, c) { return this.cells[r] && this.cells[r][c]; }
  /** show a hidden cell's value (pops in with c) */
  reveal(r, c, cx) { const el = this.cell(r, c); if (!el || !el.classList.contains('bk-hid')) return Promise.resolve(); this._fill(el, this.rows[r][c], false); return pop(cx, el.firstChild, 380); }
  hide(r, c) { const el = this.cell(r, c); if (el) this._fill(el, this.rows[r][c], true); }
  /** write a value into a cell (pops in with c) */
  set(r, c, v, cx) { this.rows[r][c] = v; const el = this.cell(r, c); this._fill(el, v, false); return pop(cx, el.firstChild, 380); }
  /** reveal a column (default: the last) one cell at a time. o: { col, stagger } */
  async fill(cx, o = {}) {
    const c = o.col ?? this.o.headers.length - 1;
    for (let r = 0; r < this.rows.length; r++) { const el = this.cell(r, c); if (el.classList.contains('bk-hid')) { await this.reveal(r, c, cx); await sleep(cx, o.stagger ?? 220); } }
  }
  /** highlight a row (or with o.col a column) */
  highlight(r, on = true, cls = 'bk-hl') { (this.cells[r] || []).forEach((el) => el.classList.toggle(cls, on)); return this; }
  highlightCol(c, on = true, cls = 'bk-hl') { this.cells.forEach((row) => row[c] && row[c].classList.toggle(cls, on)); if (this.heads[c]) this.heads[c].classList.toggle(cls, on); return this; }
  addRow(vals, cx) { this.rows.push(vals.slice()); this._tmpl(); const r = this.rows.length - 1; this._row(r); return Promise.all(this.cells[r].map((el) => fadeIn(cx, el, 320))); }
  /** first differences between consecutive rows of a column, as curved arrows with labels (+3, +3 …).
   *  o: { col (default last), labels: [..] | fn(d), color, stagger, ms }. Resolves the list of differences. */
  async diffs(cx, o = {}) {
    const c = o.col ?? this.o.headers.length - 1, v = this.o.layout === 'v', color = col(o.color, COLORS.amber);
    const vals = this.rows.map((r) => (typeof r[c] === 'number' ? r[c] : Number(r[c])));
    const ds = vals.slice(1).map((y, i) => clean(y - vals[i]));
    const g = svgEl('g', { class: 'bk-diffs' }, this.svg); this.diffEls = [g];
    for (let i = 0; i < ds.length; i++) {
      const a = this.cell(i, c), b = this.cell(i + 1, c), gw = this.grid.offsetLeft + this.grid.offsetWidth, gh = this.grid.offsetTop + this.grid.offsetHeight;
      let pts, lp, pos;
      if (v) { const x = gw + 8, y1 = a.offsetTop + a.offsetHeight / 2 + 4, y2 = b.offsetTop + b.offsetHeight / 2 - 4, bulge = 30; pts = []; for (let k = 0; k <= 20; k++) { const t = k / 20; pts.push([x + bulge * 4 * t * (1 - t), y1 + (y2 - y1) * t]); } lp = [x + bulge + 6, (y1 + y2) / 2]; pos = 'e'; }
      else { const y = gh + 8, x1 = a.offsetLeft + a.offsetWidth / 2 + 4, x2 = b.offsetLeft + b.offsetWidth / 2 - 4, bulge = 26; pts = []; for (let k = 0; k <= 20; k++) { const t = k / 20; pts.push([x1 + (x2 - x1) * t, y + bulge * 4 * t * (1 - t)]); } lp = [(x1 + x2) / 2, y + bulge + 4]; pos = 's'; }
      const sg = svgEl('g', { class: 'bk-curve bk-diff' }, g); sg.style.color = color;
      svgEl('path', { class: 'bk-stroke', d: pathD([pts]), fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round' }, sg);
      const ar = arrowHead(sg, pts[20][0], pts[20][1], ...dirAt(pts, true), { width: 3, color, cls: 'bk-end bk-end1' });
      void ar;
      const txt = o.labels ? (typeof o.labels === 'function' ? o.labels(ds[i], i) : o.labels[i]) : (ds[i] >= 0 ? '+' : '') + num(ds[i], 4);
      const lab = h('div', 'bk-lab bk-diff-lab', txt); lab.style.color = color; this.html.appendChild(place(lab, lp[0], lp[1], pos, 0)); this.diffEls.push(lab);
      if (cx) { lab.style.opacity = 0; await drawIn(sg, o.ms || 380, cx); await pop(cx, lab, 300); await sleep(cx, o.stagger ?? 120); }
    }
    return ds;
  }
  clearDiffs() { (this.diffEls || []).forEach((e) => e.remove()); this.diffEls = []; }
}

/* =============================== MappingDiagram =============================== */
export class MappingDiagram extends Box {
  constructor(host, opts = {}) {
    const o = Object.assign({ width: 440, height: 300, domain: [], range: [], pairs: [], titles: ['Domain', 'Range'], tex: true, arrows: true, color: COLORS.teal, sort: false }, opts);
    super(host, o, 'bk-map', o.width, o.height);
    const W = o.width, H = o.height, top = o.titles ? 40 : 8, n = Math.max(o.domain.length, o.range.length, 1);
    const ry = (H - top - 8) / 2, cy = top + ry, rx = Math.min(W * 0.16, 30 + 6 * n), cxs = [W * 0.2, W * 0.8];
    this.ovals = cxs.map((cx) => svgEl('ellipse', { class: 'bk-oval', cx, cy, rx, ry }, this.svg));
    this.gArrows = this.layer('arrows');
    if (o.titles) o.titles.forEach((t, i) => this.hlabel(cxs[i], 6, t, { pos: 's', gap: 0, cls: 'bk-map-title' }));
    this.itemEls = [[], []]; this.vals = [o.domain, o.range];
    [o.domain, o.range].forEach((list, side) => list.forEach((v, i) => {
      const y = cy - ry + (i + 1) * (2 * ry) / (list.length + 1);
      const d = this.hlabel(cxs[side], y, o.tex ? tex(String(v)) : String(v), { cls: 'bk-map-item' }); d.cy = y; this.itemEls[side].push(d);
    }));
    this.cxs = cxs; this.arrowEls = o.pairs.map((p, i) => this._arrow(p, i));
    if (!o.arrows) this.arrowEls.forEach((a) => (a.style.display = 'none'));
  }
  item(side, v) { const s = side === 'd' || side === 0 ? 0 : 1, i = this.vals[s].findIndex((x) => String(x) === String(v)); return this.itemEls[s][i]; }
  _arrow(p, i) {
    const a = this.item(0, p[0]), b = this.item(1, p[1]); if (!a || !b) return null;
    const x1 = this.cxs[0] + Math.max(14, (a.offsetWidth || 24) / 2 + 6), x2 = this.cxs[1] - Math.max(14, (b.offsetWidth || 24) / 2 + 8);
    const y1 = a.cy, y2 = b.cy, pts = [];
    for (let k = 0; k <= 24; k++) { const t = k / 24, bend = -10 * 4 * t * (1 - t); pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + bend]); }
    const g = svgEl('g', { class: 'bk-curve bk-map-arrow' }, this.gArrows); g.style.color = col(this.o.color);
    svgEl('path', { class: 'bk-stroke', d: pathD([pts]), fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    arrowHead(g, x2, y2 + 0, ...dirAt(pts, true), { width: 3, color: 'currentColor', cls: 'bk-end bk-end1' });
    g.pair = p; g.idx = i; return g;
  }
  arrow(i) { return this.arrowEls[i]; }
  /** draw arrow i (index into pairs) */
  async drawArrow(c, i, ms = 500) { const g = this.arrowEls[i]; if (!g) return; g.style.display = ''; const a = this.item(0, g.pair[0]); if (c && a) pulse(c, a, 1.15, 380); await drawIn(g, ms, c); }
  /** draw every arrow not yet showing, one after another */
  async drawArrows(c, o = {}) { for (let i = 0; i < this.arrowEls.length; i++) { const g = this.arrowEls[i]; if (g && g.style.display === 'none') { await this.drawArrow(c, i, o.ms || 480); await sleep(c, o.stagger ?? 120); } } }
  highlight(side, v, on = true, cls = 'bk-hot') { const d = this.item(side, v); if (d) d.classList.toggle(cls, on); return d; }
  /** domain values with more than one arrow: highlights them and their arrows (red) and shakes them with c. Resolves the list. */
  async oneToMany(c) {
    const count = {}; this.o.pairs.forEach((p) => (count[p[0]] = (count[p[0]] || 0) + 1));
    const bad = Object.keys(count).filter((k) => count[k] > 1);
    const jobs = [];
    bad.forEach((v) => {
      const d = this.highlight(0, v, true, 'bk-bad'); this.arrowEls.forEach((g) => { if (g && String(g.pair[0]) === String(v)) { g.style.display = ''; g.classList.add('bk-bad'); g.style.color = COLORS.red; } });
      if (c && d) jobs.push(shake(c, d));
    });
    await Promise.all(jobs); return bad;
  }
}

/* =============================== Flowchart =============================== */
export class Flowchart extends Box {
  /** nodes: { id: { x, y (centre), w, h, html, cls, color } }, edges: [{ from, to, label, pts, route: 'straight'|'vh'|'hv', dash, labelAt, id }] */
  constructor(host, opts = {}) {
    const o = Object.assign({ width: 640, height: 400, nodes: {}, edges: [], nodeW: 180, nodeH: 64 }, opts);
    super(host, o, 'bk-flow', o.width, o.height);
    this.gEdges = this.layer('edges'); this.nodes = {}; this.edges = {};
    for (const id in o.nodes) {
      const n = Object.assign({ w: o.nodeW, h: o.nodeH }, o.nodes[id]);
      const el = h('div', 'bk-fc-node' + (n.cls ? ' ' + n.cls : ''), '<div class="bk-fc-in">' + (n.html || '') + '</div>');
      box(el, n.w, n.h); at(el, n.x - n.w / 2, n.y - n.h / 2); if (n.color) el.style.setProperty('--bk-fc', col(n.color));
      this.html.appendChild(el); el.n = n; this.nodes[id] = el;
    }
    (Array.isArray(o.edges) ? o.edges : Object.entries(o.edges).map(([id, e]) => Object.assign({ id }, e))).forEach((e) => this._edge(e));
  }
  _anchor(n, toward) { // where the line from n's centre toward a point leaves n's box
    const dx = toward[0] - n.x, dy = toward[1] - n.y, sx = (n.w / 2 + 3) / Math.abs(dx || 1e-9), sy = (n.h / 2 + 3) / Math.abs(dy || 1e-9), s = Math.min(sx, sy);
    return [n.x + dx * s, n.y + dy * s];
  }
  _edge(e) {
    const A = this.nodes[e.from] && this.nodes[e.from].n, B = this.nodes[e.to] && this.nodes[e.to].n; if (!A || !B) return null;
    let pts = e.pts;
    if (!pts) {
      const r = e.route || 'straight';
      if (r === 'vh') { const s = [A.x, B.y > A.y ? A.y + A.h / 2 + 3 : A.y - A.h / 2 - 3]; pts = [s, [A.x, B.y], this._anchor(B, [A.x, B.y])]; }
      else if (r === 'hv') { const s = [B.x > A.x ? A.x + A.w / 2 + 3 : A.x - A.w / 2 - 3, A.y]; pts = [s, [B.x, A.y], this._anchor(B, [B.x, A.y])]; }
      else if (r === 'vhv') { const s = [A.x, A.y + A.h / 2 + 3], my = (A.y + A.h / 2 + B.y - B.h / 2) / 2; pts = [s, [A.x, my], [B.x, my], [B.x, B.y - B.h / 2 - 3]]; }
      else pts = [this._anchor(A, [B.x, B.y]), this._anchor(B, [A.x, A.y])];
    }
    const g = svgEl('g', { class: 'bk-fc-edge' + (e.dash ? ' bk-dash' : '') + (e.cls ? ' ' + e.cls : '') }, this.gEdges);
    const d = pathD([pts]);
    svgEl('path', { class: 'bk-fc-base', d }, g);
    const hot = svgEl('path', { class: 'bk-fc-hot', d }, g);
    const [x2, y2] = pts[pts.length - 1], dir = dirAt(pts, true);
    arrowHead(g, x2, y2, dir[0], dir[1], { width: 2.6, cls: 'bk-fc-head', L: 13, hw: 6.5 });
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    hot.style.strokeDasharray = len + ' ' + (len + 10); hot.style.strokeDashoffset = len;
    if (e.label) {
      let lp = e.labelAt; // default: middle of the last leg of an elbow route, middle of a straight one
      if (!lp && pts.length > 2) { const p1 = pts[pts.length - 2], p2 = pts[pts.length - 1]; lp = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]; }
      if (!lp) { let acc = 0; for (let i = 1; i < pts.length; i++) { const sl = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + sl >= len / 2) { const t = (len / 2 - acc) / sl; lp = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; break; } acc += sl; } }
      g.label = this.hlabel(lp[0], lp[1], e.label, { cls: 'bk-fc-lab' });
    }
    g.hot = hot; g.len = len; g.e = e;
    const id = e.id || e.from + '>' + e.to; this.edges[id] = g; return g;
  }
  node(id) { return this.nodes[id]; }
  edge(from, to) { return this.edges[to == null ? from : from + '>' + to] || Object.values(this.edges).find((g) => g.e.from === from && g.e.to === to); }
  /** make id the current node (the previous one becomes part of the path) */
  async visit(c, id) {
    if (this.cur && this.cur !== id) { this.nodes[this.cur].classList.remove('bk-on'); this.nodes[this.cur].classList.add('bk-path'); }
    const el = this.nodes[id]; el.classList.remove('bk-path', 'bk-old'); el.classList.add('bk-on'); this.cur = id;
    await pulse(c, el, 1.05);
  }
  /** light the edge from → to (it draws itself in) */
  async go(c, from, to, ms = 480) {
    const g = this.edge(from, to); if (!g) return;
    g.classList.remove('bk-old'); g.classList.add('bk-lit'); if (g.label) g.label.classList.add('bk-lit');
    await anim(c, g.hot, [{ strokeDashoffset: g.len }, { strokeDashoffset: 0 }], ms);
  }
  /** walk a path of node ids: ['top', 'tri', 'insp'] — node, edge, node, edge … */
  async light(c, path, o = {}) {
    for (let i = 0; i < path.length; i++) {
      if (i) await this.go(c, path[i - 1], path[i], o.ms);
      await this.visit(c, path[i]);
      if (i < path.length - 1) await sleep(c, o.pause ?? 150);
    }
  }
  /** turn the current path into "earlier" colours (for a second pass through the chart) */
  fade() {
    Object.values(this.nodes).forEach((el) => { if (el.classList.contains('bk-on') || el.classList.contains('bk-path')) { el.classList.remove('bk-on', 'bk-path'); el.classList.add('bk-old'); } });
    Object.values(this.edges).forEach((g) => { if (g.classList.contains('bk-lit')) { g.classList.remove('bk-lit'); g.classList.add('bk-old'); } if (g.label) g.label.classList.remove('bk-lit'); });
    this.cur = null;
  }
  reset() {
    Object.values(this.nodes).forEach((el) => el.classList.remove('bk-on', 'bk-path', 'bk-old'));
    Object.values(this.edges).forEach((g) => { g.classList.remove('bk-lit', 'bk-old'); g.hot.style.strokeDashoffset = g.len; if (g.label) g.label.classList.remove('bk-lit'); });
    this.cur = null;
  }
}

/* =============================== shapes: right triangle =============================== */
/** an angle arc at vertex V between rays V→P and V→Q (px). Returns the path. */
export function angleArc(parent, V, P, Q, r = 30, o = {}) {
  let a1 = Math.atan2(P[1] - V[1], P[0] - V[0]), a2 = Math.atan2(Q[1] - V[1], Q[0] - V[0]);
  let d = a2 - a1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
  const s = [V[0] + r * Math.cos(a1), V[1] + r * Math.sin(a1)], e = [V[0] + r * Math.cos(a1 + d), V[1] + r * Math.sin(a1 + d)];
  return svgEl('path', { class: 'bk-stroke bk-arc ' + (o.cls || ''), d: `M${s[0]} ${s[1]}A${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${e[0]} ${e[1]}`, fill: 'none', stroke: o.color || 'currentColor', 'stroke-width': o.width || 2.5 }, parent);
}
/** the little square for a right angle at V */
export function rightMark(parent, V, P, Q, s = 16, o = {}) {
  const [ux, uy] = norm(P[0] - V[0], P[1] - V[1]), [vx, vy] = norm(Q[0] - V[0], Q[1] - V[1]);
  return svgEl('path', { class: 'bk-rmark ' + (o.cls || ''), d: `M${V[0] + ux * s} ${V[1] + uy * s}L${V[0] + (ux + vx) * s} ${V[1] + (uy + vy) * s}L${V[0] + vx * s} ${V[1] + vy * s}`, fill: 'none', stroke: o.color || 'currentColor', 'stroke-width': o.width || 2 }, parent);
}
export class RightTriangle extends Box {
  /** o: { width, height, base, rise (proportions), right: 'bl'|'br'|'tl'|'tr', names: { right, base, top } (vertex letters),
   *       sides: { opp-to-letter: html } e.g. { a: '3', b: '4', c: '5' }, angles: { A: '\\theta' }, tex: true, pad } */
  constructor(host, opts = {}) {
    const o = Object.assign({ width: 420, height: 300, base: 4, rise: 3, right: 'bl', names: { right: 'C', base: 'A', top: 'B' }, sides: {}, angles: {}, tex: true, pad: 46, color: COLORS.ink }, opts);
    super(host, o, 'bk-tri', o.width, o.height);
    const s = Math.min((o.width - 2 * o.pad) / o.base, (o.height - 2 * o.pad) / o.rise), bw = o.base * s, bh = o.rise * s;
    const x0 = (o.width - bw) / 2, y0 = (o.height + bh) / 2, R = o.right;
    const C = [R[1] === 'l' ? x0 : x0 + bw, R[0] === 'b' ? y0 : y0 - bh];
    const A = [R[1] === 'l' ? x0 + bw : x0, C[1]], B = [C[0], R[0] === 'b' ? y0 - bh : y0];
    const N = o.names; this.V = { [N.right]: C, [N.base]: A, [N.top]: B }; this.N = N;
    const cen = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    svgEl('polygon', { class: 'bk-tri-fill', points: [A, B, C].map((p) => p.join(',')).join(' ') }, this.svg);
    this.sideEls = {}; this.sideLabs = {};
    const opp = { [N.right]: [A, B], [N.base]: [B, C], [N.top]: [A, C] }; this.opp = opp;
    for (const v in opp) {
      const [P, Q] = opp[v], k = v.toLowerCase();
      const g = svgEl('g', { class: 'bk-curve bk-tri-side' }, this.svg); g.style.color = col(o.color);
      svgEl('path', { class: 'bk-stroke', d: `M${P[0]} ${P[1]}L${Q[0]} ${Q[1]}`, stroke: 'currentColor', 'stroke-width': 3.5, 'stroke-linecap': 'round', fill: 'none' }, g);
      this.sideEls[k] = g;
      const m = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], [nx, ny] = norm(m[0] - cen[0], m[1] - cen[1]);
      g.mid = m; g.out = [nx, ny];
      if (o.sides[k] != null) this.sideLabs[k] = this.hlabel(m[0] + nx * 22, m[1] + ny * 22, o.tex ? tex(String(o.sides[k])) : o.sides[k], { cls: 'bk-tri-lab' });
    }
    rightMark(this.svg, C, A, B, 16, { color: col(o.color) });
    this.vLabs = {};
    for (const v in this.V) { const P = this.V[v], [nx, ny] = norm(P[0] - cen[0], P[1] - cen[1]); if (v) this.vLabs[v] = this.hlabel(P[0] + nx * 20, P[1] + ny * 20, o.tex ? tex(v) : v, { cls: 'bk-tri-v' }); }
    this.arcs = {};
    for (const v in o.angles) this.angle(v, o.angles[v]);
  }
  vertex(v) { return this.V[v]; }
  side(k) { return this.sideEls[k.toLowerCase()]; }
  /** mark the angle at vertex v with an arc and a label inside it */
  angle(v, label, o = {}) {
    const P = this.V[v], others = Object.keys(this.V).filter((k) => k !== v).map((k) => this.V[k]);
    const g = svgEl('g', { class: 'bk-curve bk-tri-ang' }, this.svg); g.style.color = col(o.color, COLORS.amber);
    angleArc(g, P, others[0], others[1], o.r || 34, { color: 'currentColor', width: 3 });
    const bis = norm((others[0][0] - P[0]) / Math.hypot(others[0][0] - P[0], others[0][1] - P[1]) + (others[1][0] - P[0]) / Math.hypot(others[1][0] - P[0], others[1][1] - P[1]), (others[0][1] - P[1]) / Math.hypot(others[0][0] - P[0], others[0][1] - P[1]) + (others[1][1] - P[1]) / Math.hypot(others[1][0] - P[0], others[1][1] - P[1]));
    if (label != null) g.label = this.hlabel(P[0] + bis[0] * ((o.r || 34) + 20), P[1] + bis[1] * ((o.r || 34) + 20), this.o.tex ? tex(label) : label, { cls: 'bk-tri-anglab', color: o.color || 'amber' });
    this.arcs[v] = g; return g;
  }
  /** opposite / adjacent / hypotenuse relative to the angle at v: colours the sides and tags them (animated with c) */
  async highlight(c, v, o = {}) {
    this.clearHighlight();
    const N = this.N, hyp = N.right.toLowerCase(), opp = v.toLowerCase(), adj = Object.keys(this.sideEls).find((k) => k !== hyp && k !== opp);
    const spec = [[opp, 'opp', o.oppColor || COLORS.red, 'opposite'], [adj, 'adj', o.adjColor || COLORS.blue, 'adjacent'], [hyp, 'hyp', o.hypColor || COLORS.teal, 'hypotenuse']];
    this.tags = [];
    for (const [k, short, color, long] of spec) {
      const g = this.sideEls[k]; g.style.color = color; g.classList.add('bk-hl');
      const t = this.hlabel(g.mid[0], g.mid[1], o.long ? long : short, { cls: 'bk-tri-tag' });
      const off = (this.sideLabs[k] ? 40 : 10) + Math.abs(g.out[0]) * t.offsetWidth / 2 + Math.abs(g.out[1]) * t.offsetHeight / 2;
      const tw = t.offsetWidth / 2 + 2, th = t.offsetHeight / 2 + 2; // keep the tag inside the box
      place(t, clamp(g.mid[0] + g.out[0] * off, tw, this.W - tw), clamp(g.mid[1] + g.out[1] * off, th, this.H - th)); t.style.color = color; this.tags.push(t);
      if (c) { t.style.opacity = 0; await anim(c, g, [{ opacity: 0.25 }, { opacity: 1 }], 300); await pop(c, t, 340); await sleep(c, o.stagger ?? 250); }
    }
  }
  clearHighlight() { Object.values(this.sideEls).forEach((g) => { g.style.color = col(this.o.color); g.classList.remove('bk-hl'); }); (this.tags || []).forEach((t) => t.remove()); this.tags = []; }
}

/* =============================== stamps & checks =============================== */
/** a rubber stamp. text defaults to ✓ / ✗. o: { ok (true green, false red, null amber), x, y, rotate, size: 'sm'|'lg' } */
export function stamp(host, text, o = {}) {
  const ok = o.ok === undefined ? true : o.ok;
  const el = h('div', 'bk-stamp ' + (ok === true ? 'bk-ok' : ok === false ? 'bk-no' : 'bk-mid') + (o.size ? ' bk-' + o.size : '') + (o.cls ? ' ' + o.cls : ''), text ?? (ok === false ? '✗' : '✓'));
  el.rot = o.rotate ?? -7; el.style.transform = `rotate(${el.rot}deg)`;
  if (o.x != null) { el.style.position = 'absolute'; at(el, o.x, o.y || 0); el.style.translate = '-50% -50%'; }
  host.appendChild(el); return el;
}
export const stampIn = (c, el, ms = 420) => anim(c, el, [{ opacity: 0, transform: `scale(1.9) rotate(${el.rot - 9}deg)` }, { opacity: 1, transform: `scale(1) rotate(${el.rot}deg)` }], ms, { easing: 'cubic-bezier(.2,1.4,.4,1)' });
/** a substitution check: both sides worked out, then = and a verdict.
 *  o: { at: 'x=2', left, right, values, ok, title, x, y, width, hidden }
 *  left/right: an array of TeX lines, or { tex, sub, f } (f(values) gives the last line). Returns el with el.play(c). */
export function checkCard(host, o = {}) {
  const side = (s) => (Array.isArray(s) ? s.map(String) : [s.tex, s.sub, s.f ? texNum(s.f(o.values || {}), 4) : null].filter((x) => x != null));
  const L = side(o.left || []), R = side(o.right || []), n = Math.max(L.length, R.length);
  const lv = Array.isArray(o.left) ? null : o.left && o.left.f && o.left.f(o.values || {}), rv = Array.isArray(o.right) ? null : o.right && o.right.f && o.right.f(o.values || {});
  const ok = o.ok ?? (lv != null && rv != null ? Math.abs(lv - rv) < 1e-9 : true);
  const el = h('div', 'bk-check' + (o.cls ? ' ' + o.cls : ''));
  if (o.x != null) { el.style.position = 'absolute'; at(el, o.x, o.y || 0); }
  if (o.width) el.style.width = o.width + 'px';
  el.innerHTML = `<div class="bk-ck-h">${o.title || 'Check'}${o.at ? ' with ' + tex(o.at) : ''}</div>`;
  const grid = h('div', 'bk-ck-grid'); el.appendChild(grid);
  grid.innerHTML = '<div class="bk-ck-sh">Left side</div><div></div><div class="bk-ck-sh">Right side</div>';
  const rows = [];
  for (let i = 0; i < n; i++) {
    const last = i === n - 1, a = h('div', 'bk-ck-c' + (last ? ' bk-ck-v' : ''), L[i] != null ? tex((i ? '=' : '') + L[i]) : ''), m = h('div', 'bk-ck-m', last ? (ok ? '=' : '≠') : ''), b = h('div', 'bk-ck-c' + (last ? ' bk-ck-v' : ''), R[i] != null ? tex((i ? '=' : '') + R[i]) : '');
    grid.append(a, m, b); rows.push([a, m, b]);
  }
  const verdict = h('div', 'bk-ck-verdict ' + (ok ? 'bk-ok' : 'bk-no'), ok ? '✓ Both sides are equal' : '✗ The sides are not equal'); el.appendChild(verdict);
  if (o.hidden) { rows.flat().forEach((e) => (e.style.opacity = 0)); verdict.style.opacity = 0; }
  el.rows = rows; el.verdict = verdict; el.ok = ok;
  el.play = async (c, ms = 380) => { for (const r of rows) { await Promise.all(r.map((e) => fadeIn(c, e, ms))); await sleep(c, 200); } await pop(c, verdict, 380); };
  host.appendChild(el); return el;
}

/* =============================== explainers =============================== */
/** mount every [data-explainer] in root from a { name: def } map. Returns { name: Explainer } */
export function mountExplainers(defs, root = document) {
  const out = {};
  root.querySelectorAll('[data-explainer]').forEach((el) => { const d = defs[el.dataset.explainer]; if (d && !el.classList.contains('ex')) out[el.dataset.explainer] = new Explainer(el, d); });
  return out;
}

/* =============================== page widgets (auto-wired) =============================== */
const once = (el, k) => { if (el.dataset['bk' + k]) return false; el.dataset['bk' + k] = '1'; return true; };
const tappable = (el) => { el.setAttribute('data-tap', ''); el.setAttribute('role', 'button'); el.tabIndex = 0; };
/* the most columns (4, 2 or 1) in which no option's math overflows and no option's words need more than two lines */
function fitCols(m, opts) {
  const n = opts.length;
  for (const k of [Math.min(4, n), 2, 1]) {
    m.style.setProperty('--bk-cols', k);
    if (!m.offsetWidth) return; // not laid out (hidden): keep 4 / n
    const lh = parseFloat(getComputedStyle(opts[0]).lineHeight) || 28;
    if (opts.every((o) => o.scrollWidth <= o.clientWidth + 1 && o.offsetHeight <= lh * 2 + 18)) return;
  }
}
/** give behaviour to plain markup in root. Safe to call more than once (wired elements are skipped). Called by boot(). */
export function wireBlocks(root = document) {
  // guess-first polls: <div class="poll"> … .opt … <button data-poll-reveal>
  root.querySelectorAll('.poll').forEach((p) => {
    const btn = p.querySelector('[data-poll-reveal]'); if (!btn || !once(p, 'Poll')) return;
    p.classList.add('bk-poll');
    const opts = [...p.querySelectorAll('.opt')];
    opts.forEach((o) => { tappable(o); o.addEventListener('click', () => { const on = !o.classList.contains('bk-guess'); opts.forEach((x) => x.classList.remove('bk-guess')); o.classList.toggle('bk-guess', on); }); });
    btn.addEventListener('click', () => p.classList.toggle('revealed'));
  });
  // multiple choice: <div class="bk-mc" data-answer="B"> <div>…A…</div> <div>…B…</div> …
  root.querySelectorAll('.bk-mc').forEach((m) => {
    if (!once(m, 'Mc')) return;
    const opts = [...m.children].filter((c) => c.nodeType === 1), ans = (m.dataset.answer || '').trim().toUpperCase();
    opts.forEach((o, i) => {
      const L = String.fromCharCode(65 + i); o.classList.add('bk-opt'); o.dataset.letter = L;
      if (!o.querySelector(':scope > .bk-letter')) o.insertBefore(h('b', 'bk-letter', L), o.firstChild);
      if (ans.split(/[\s,]+/).includes(L)) o.classList.add('bk-right');
      if (m.hasAttribute('data-pick')) { tappable(o); o.addEventListener('click', () => { const on = !o.classList.contains('bk-picked'); opts.forEach((x) => x.classList.remove('bk-picked')); o.classList.toggle('bk-picked', on); }); }
    });
    if (!ans) console.warn('bk-mc without data-answer', m);
    if (m.dataset.cols) m.style.setProperty('--bk-cols', m.dataset.cols);
    else fitCols(m, opts);
  });
  // numerical response: <div class="bk-nr" data-value="45.3">optional prompt</div> → 4 boxes, digits show with the part's answer
  root.querySelectorAll('.bk-nr[data-value]').forEach((n) => {
    if (!once(n, 'Nr')) return;
    const v = String(n.dataset.value).trim(), k = Number(n.dataset.boxes || 4);
    if (v.length > k || /^-/.test(v) || (/^0\d/.test(v))) console.warn('bk-nr: "' + v + '" does not fit the Alberta numerical-response format');
    if (!n.textContent.trim()) n.textContent = 'Record your answer left to right.';
    const b = h('span', 'bk-nr-boxes');
    for (let i = 0; i < k; i++) { const c = h('i', 'bk-nr-b'); if (v[i] != null) { const d = h('b', 'bk-nr-d', v[i]); d.style.setProperty('--i', i); c.appendChild(d); } b.appendChild(c); }
    n.appendChild(b);
  });
  // tap to reveal: <span data-reveal>value</span> shows "?" (or data-reveal="text") until tapped (or the part is shown)
  root.querySelectorAll('[data-reveal]').forEach((r) => {
    if (!once(r, 'Rv')) return;
    const v = h('span', 'bk-rv-v'); while (r.firstChild) v.appendChild(r.firstChild);
    r.classList.add('bk-rv'); r.append(h('span', 'bk-rv-q', r.getAttribute('data-reveal') || '?'), v); tappable(r);
    r.addEventListener('click', () => { r.classList.toggle('bk-on'); if (r.classList.contains('bk-on')) v.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], 300); });
  });
  // flip cards: <div class="bk-flip"><div class="bk-front">…</div><div class="bk-back">…</div></div>
  root.querySelectorAll('.bk-flip').forEach((f) => {
    if (!once(f, 'Flip')) return;
    const inner = h('div', 'bk-flip-in'); while (f.firstChild) inner.appendChild(f.firstChild); f.appendChild(inner); tappable(f);
    inner.querySelectorAll(':scope > .bk-front, :scope > .bk-back').forEach((face) => { const w = h('div', 'bk-face'); while (face.firstChild) w.appendChild(face.firstChild); face.appendChild(w); });
    f.addEventListener('click', () => f.classList.toggle('bk-flipped'));
  });
  // warm-up question toggles: <div class="bk-wq"> … <button class="pill small" data-bk-toggle>Answer</button><div class="bk-ans">…</div></div>
  root.querySelectorAll('[data-bk-toggle]').forEach((b) => {
    if (!once(b, 'Tg')) return;
    b.addEventListener('click', () => { const s = b.closest('.bk-wq, [data-bk-scope]') || b.parentElement; s.classList.toggle('shown'); });
  });
  // declarative figures: <div data-bk-graph='{"xmin":-5, …, "items":[{"fn":["x^2-4"]}, {"point":[2,0,{"label":"A"}]}]}'></div>
  const build = (el, Cls, attr) => {
    if (!once(el, 'Fig')) return;
    let spec; try { spec = JSON.parse(el.getAttribute(attr) || '{}'); } catch (e) { console.warn('bad JSON in ' + attr, el); return; }
    const items = spec.items || []; delete spec.items;
    const B = new Cls(el, spec); el.bk = B;
    items.forEach((it) => { const k = Object.keys(it)[0], args = [].concat(it[k]); if (typeof B[k] !== 'function') { console.warn('unknown ' + attr + ' item', k); return; } if (k === 'hop') args.unshift(null); B[k](...args); });
  };
  root.querySelectorAll('[data-bk-graph]').forEach((el) => build(el, Graph, 'data-bk-graph'));
  root.querySelectorAll('[data-bk-numberline]').forEach((el) => build(el, NumberLine, 'data-bk-numberline'));
  root.querySelectorAll('[data-bk-table]').forEach((el) => {
    if (!once(el, 'Fig')) return;
    let spec; try { spec = JSON.parse(el.getAttribute('data-bk-table')); } catch (e) { console.warn('bad JSON in data-bk-table', el); return; }
    const T = new ValueTable(el, spec); el.bk = T; if (spec.diffs) requestAnimationFrame(() => T.diffs(null));
  });
}
/** ••• Show all / Hide all answers also opens the auto-wired warm-up answers and polls */
export function showAllAnswers(on) {
  document.querySelectorAll('.bk-wq').forEach((w) => w.classList.toggle('shown', on));
  document.querySelectorAll('.poll.bk-poll').forEach((p) => p.classList.toggle('revealed', on));
  document.querySelectorAll('.bk-rv').forEach((r) => r.classList.toggle('bk-on', on));
}
