/* Math 10C · Unit 10 · Lesson 4 — Surface Area and Volume of Pyramids and Cones.
 * A tiny 3-D renderer (Scene3: orthographic view with yaw + tilt, convex solids with dashed hidden edges, cones and
 * cylinders drawn from their tangent lines) draws every solid. Warm-up popcorn tub (pour cones in), static figures for
 * Sections 1-5 and Example 5, answer sketches, and the explainers:
 *   hs (the right triangle inside a pyramid: h, half the side, s; spin, lift it out; Example 1 and 5 checks),
 *   third (three funnels of rice fill the planter box; a cube cut into three pyramids; Example 1(a) check),
 *   net (the skylight unfolds into its net; a closed pyramid for contrast), hsc (the same triangle inside a cone;
 *   Example 2 check), pour (three cones of water fill the cylinder; warm-up popcorn check), unroll (the curved surface
 *   unrolls into a sector, r/s of a circle of radius s; Example 2 check), which (flowchart: h or s?),
 *   hex (Example 3: hexagon → 6 equilateral triangles → raise the apex), scale (Example 4: height ×4, radius ×3,
 *   both doubled), shed (Example 5: volumes add, the hidden square is counted for neither part).
 * Colours: h blue, s red, r / half the side amber, the cross-section triangle purple. */
import {
  h, tex, add, box, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, tween, svgEl, liveCtx, pulse,
  place, arrowHead, easeInOut, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const PI = Math.PI, RAD = PI / 180;
const INK = COLORS.ink, HC = COLORS.blue, SC = COLORS.red, RC = COLORS.amber, TRI = COLORS.purple, GRN = COLORS.green, TEAL = COLORS.teal;
const GLASS = '#cfe9f7', RICE = '#e6cf8f', RICE2 = '#f3e4b8', WATER = '#5aa7e0', WATER2 = '#a9d3f3', POP = '#f6d36b', POP2 = '#fff1bf';
const lerp = (a, b, t) => a + (b - a) * t;
const lerp2 = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
const lerp3 = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t)];
const add3 = (p, q) => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
const sub3 = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const mul3 = (p, k) => [p[0] * k, p[1] * k, p[2] * k];
const dot3 = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const avg3 = (ps) => mul3(ps.reduce((a, p) => add3(a, p), [0, 0, 0]), 1 / ps.length);
const avg2 = (ps) => [ps.reduce((a, p) => a + p[0], 0) / ps.length, ps.reduce((a, p) => a + p[1], 0) / ps.length];
const ph = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
const dist2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const E = easeInOut;
const f1 = (p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1);

/* =============================== svg helpers =============================== */
function poly(g, pts, o = {}) {
  return svgEl('path', { d: 'M' + pts.map(f1).join('L') + 'Z', fill: o.fill || 'none', 'fill-opacity': o.fo, stroke: o.stroke || 'none', 'stroke-width': o.w, 'stroke-dasharray': o.dash, 'stroke-linejoin': 'round', opacity: o.op }, g);
}
function pline(g, pts, o = {}) {
  return svgEl('path', { d: 'M' + pts.map(f1).join('L') + (o.close ? 'Z' : ''), fill: 'none', stroke: o.stroke || INK, 'stroke-width': o.w ?? 2.6, 'stroke-dasharray': o.dash, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: o.op }, g);
}
const seg = (g, a, b, o = {}) => pline(g, [a, b], o);
const DASH = '7 6';
/** a two-headed dimension arrow from a to b (px) */
function dim(g, a, b, color = INK) {
  seg(g, a, b, { stroke: color, w: 2 });
  const dx = b[0] - a[0], dy = b[1] - a[1];
  arrowHead(g, b[0], b[1], dx, dy, { width: 2, color }); arrowHead(g, a[0], a[1], -dx, -dy, { width: 2, color });
}
const panel = (stage, x, y, w, hh, title = '') => add(stage, box(h('div', 'u10l4-panel', title ? `<div class="u10l4-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u10l4-line ' + cls, html); d.style.opacity = 0; p.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const stampAt = (P, text, o = {}) => { const s = stamp(P, text, o); if (o.x == null) { s.style.alignSelf = 'center'; s.style.marginTop = '6px'; } return s; };

/* =============================== Scene3: a small 3-D renderer =============================== */
class Scene3 {
  /** o: { x, y (in an explainer stage), w, h, cx, cy (screen position of the origin), scale (px per unit), yaw, tilt (deg) } */
  constructor(host, o = {}) {
    this.w = o.w; this.h = o.h;
    this.el = box(h('div', 'u10l4-scene'), o.w, o.h);
    if (o.x != null) { this.el.style.position = 'absolute'; add(host, this.el, o.x, o.y); } else { this.el.style.position = 'relative'; host.appendChild(this.el); }
    this.svg = svgEl('svg', { width: o.w, height: o.h, viewBox: `0 0 ${o.w} ${o.h}`, class: 'u10l4-svg' }, this.el);
    this.g = svgEl('g', {}, this.svg);
    this.ov = h('div', 'u10l4-ov'); this.el.appendChild(this.ov);
    this.cx = o.cx ?? o.w / 2; this.cy = o.cy ?? o.h * 0.75; this.S = o.scale ?? 40; this.yaw = o.yaw ?? -28; this.tilt = o.tilt ?? 20;
    this.labs = new Map(); this.draw = o.draw || null; this.uid = 'u10l7c' + Math.random().toString(36).slice(2, 8);
  }
  /** screen [x, y, depth] of a 3-D point [x, y (up), z]; org = [ox, oy, scale?] overrides the origin */
  P(p, org) {
    const t = this.yaw * RAD, f = this.tilt * RAD, c = Math.cos(t), s = Math.sin(t);
    const X = p[0] * c + p[2] * s, Z = -p[0] * s + p[2] * c, S = (org && org[2]) || this.S;
    return [(org ? org[0] : this.cx) + S * X, (org ? org[1] : this.cy) - S * (p[1] * Math.cos(f) - Z * Math.sin(f)), p[1] * Math.sin(f) + Z * Math.cos(f)];
  }
  /** > 0 when a surface with outward normal n faces the viewer */
  facing(n) { const t = this.yaw * RAD, f = this.tilt * RAD; return n[1] * Math.sin(f) + (-n[0] * Math.sin(t) + n[2] * Math.cos(t)) * Math.cos(f); }
  render() {
    this.g.textContent = ''; this.labs.forEach((l) => (l.used = false));
    if (this.draw) this.draw(this);
    this.labs.forEach((l) => (l.el.style.display = l.used ? '' : 'none'));
  }
  /** an HTML label (KaTeX welcome) kept between renders under its key */
  lab(key, html, xy, pos = 'c', o = {}) {
    let l = this.labs.get(key);
    if (!l) { l = { el: h('div', 'u10l4-lab ' + (o.cls || ''), html), html }; this.ov.appendChild(l.el); this.labs.set(key, l); }
    else if (l.html !== html) { l.el.innerHTML = html; l.html = html; }
    l.used = true; place(l.el, xy[0], xy[1], pos, o.gap ?? 6);
    l.el.style.color = o.color || '';
    return l.el;
  }
  L(key) { const l = this.labs.get(key); return l && l.el; }
}
const tw = (c, ms, S, fn, ease = E) => tween(c, ms, (t) => { fn(t); S.render(); }, ease);

/** draw a convex solid. V: 3-D points, F: faces (index lists). o: { org, fill, fo, faceFill(i), stroke, w, hidden (dashed back
 *  edges, default true), open (an open container: back edges light, back faces filled with o.inner), contents() } */
function solid(S, g, V, F, o = {}) {
  const P = V.map((v) => S.P(v, o.org)), C = avg3(V);
  const faces = F.map((f) => {
    let n = [0, 0, 0];
    for (let k = 0; k < f.length; k++) {
      const a = V[f[k]], b = V[f[(k + 1) % f.length]];
      n = add3(n, [(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])]);
    }
    if (dot3(n, sub3(avg3(f.map((k) => V[k])), C)) < 0) n = mul3(n, -1);
    const len = Math.hypot(...n);
    return { f, n, vis: len > 1e-9 && S.facing(n) / len > 1e-4 };
  });
  const edges = new Map();
  faces.forEach((fc) => fc.f.forEach((a, k) => {
    const b = fc.f[(k + 1) % fc.f.length], key = a < b ? a + '-' + b : b + '-' + a;
    if (!edges.has(key)) edges.set(key, { a, b, vis: false, n: 0 });
    const e = edges.get(key); e.n++; if (fc.vis) e.vis = true;
  }));
  if (o.open) edges.forEach((e) => { if (e.n === 1) e.vis = true; });
  const col = o.stroke || INK, w = o.w ?? 2.6;
  if (o.open && o.inner) faces.forEach((fc) => { if (!fc.vis) poly(g, fc.f.map((k) => P[k]), { fill: o.inner }); });
  if (o.hidden !== false) edges.forEach((e) => { if (!e.vis) seg(g, P[e.a], P[e.b], o.open ? { stroke: col, w: w * 0.55, op: 0.45 } : { stroke: col, w: w * 0.6, dash: '6 6', op: 0.7 }); });
  if (o.contents) o.contents();
  faces.forEach((fc, i) => { const fill = o.faceFill ? o.faceFill(i) : o.fill; if (fc.vis && fill) poly(g, fc.f.map((k) => P[k]), { fill, fo: o.fo ?? 1 }); });
  edges.forEach((e) => { if (e.vis) seg(g, P[e.a], P[e.b], { stroke: col, w }); });
  return { P, faces };
}
/** regular polygon in the plane y (vertices at angle rot + 2πi/n; rot = π/n puts an edge midpoint on the +x axis) */
const regPoly = (n, R, rot = PI / n, y = 0) => Array.from({ length: n }, (_, i) => { const a = rot + (2 * PI * i) / n; return [R * Math.cos(a), y, R * Math.sin(a)]; });
const rect = (W, D, y = 0) => [[W / 2, y, D / 2], [-W / 2, y, D / 2], [-W / 2, y, -D / 2], [W / 2, y, -D / 2]];
function pyramidVF(base, apex, o = {}) {
  const n = base.length, V = [...base, apex], F = [];
  if (!o.open) F.push(base.map((_, i) => i));
  for (let i = 0; i < n; i++) F.push([i, (i + 1) % n, n]);
  return [V, F];
}
function prismVF(base, Hh, o = {}) {
  const n = base.length, V = [...base, ...base.map((p) => [p[0], p[1] + Hh, p[2]])], F = [base.map((_, i) => i)];
  if (!o.open) F.push(base.map((_, i) => n + i));
  for (let i = 0; i < n; i++) F.push([i, (i + 1) % n, n + ((i + 1) % n), n + i]);
  return [V, F];
}
/** a prism with a pyramid on top (a convex house shape): base polygon at y = 0, walls to y = wh, apex at wh + rh */
function houseVF(base, wh, rh) {
  const n = base.length, V = [...base, ...base.map((p) => [p[0], wh, p[2]]), [0, wh + rh, 0]], F = [base.map((_, i) => i)];
  for (let i = 0; i < n; i++) { F.push([i, (i + 1) % n, n + ((i + 1) % n), n + i]); F.push([n + i, n + ((i + 1) % n), 2 * n]); }
  return [V, F];
}
function rightMark3(S, g, O, u, v, k, org, color = INK) {
  pline(g, [S.P(add3(O, mul3(u, k)), org), S.P(add3(add3(O, mul3(u, k)), mul3(v, k)), org), S.P(add3(O, mul3(v, k)), org)], { stroke: color, w: 1.8 });
}

/* ---------- circles, cones and cylinders ---------- */
function ellipse(S, c3, r, org) { const [x, y] = S.P(c3, org), a = ((org && org[2]) || S.S) * r; return { x, y, a, b: a * Math.sin(S.tilt * RAD) }; }
const eAt = (El, t) => [El.x + El.a * Math.cos(t), El.y + El.b * Math.sin(t)];
const eArc = (El, t0, t1, n = 48) => Array.from({ length: n + 1 }, (_, i) => eAt(El, t0 + ((t1 - t0) * i) / n));
/** the two tangent lines from A to the ellipse: { far (the arc away from A), near, T1, T2 } or null when A is inside */
function coneShape(A, El) {
  const dx = El.x - A[0], dy = El.y - A[1], R = Math.hypot(El.b * dx, El.a * dy);
  if (R <= El.a * El.b * 1.0005) return null;
  const psi = Math.atan2(El.a * dy, El.b * dx), d = Math.acos((-El.a * El.b) / R), t1 = psi - d, t2 = psi + d;
  const arc1 = eArc(El, t1, t2), arc2 = eArc(El, t2, t1 + 2 * PI);
  const m1 = eAt(El, (t1 + t2) / 2), m2 = eAt(El, (t2 + t1 + 2 * PI) / 2);
  const farFirst = dist2(A, m1) > dist2(A, m2);
  return { far: farFirst ? arc1 : arc2, near: farFirst ? arc2 : arc1, T1: eAt(El, t1), T2: eAt(El, t2) };
}
/** o: { base (centre of the circle), r, H (apex above the base; negative = apex below, a cup), org, fill, fo, stroke, w,
 *  open (rim drawn whole, inside filled with o.inner), hidden, contents() } */
function drawCone(S, g, o) {
  const El = ellipse(S, o.base, o.r, o.org), A = S.P(add3(o.base, [0, o.H, 0]), o.org), cs = coneShape(A, El), col = o.stroke || INK, w = o.w ?? 2.6;
  const full = eArc(El, 0, 2 * PI, 64);
  if (!cs) {
    poly(g, full, { fill: o.fill, fo: o.fo }); if (o.contents) o.contents(); pline(g, full, { stroke: col, w, close: true });
    svgEl('circle', { cx: A[0], cy: A[1], r: 3.5, fill: col }, g); return { A, El, cs };
  }
  poly(g, [A, ...cs.far], { fill: o.fill || 'none', fo: o.fo ?? 1 });
  if (o.open) {
    poly(g, full, { fill: o.inner || '#fff' }); if (o.contents) o.contents();
    seg(g, A, cs.T1, { stroke: col, w }); seg(g, A, cs.T2, { stroke: col, w }); pline(g, full, { stroke: col, w, close: true });
  } else {
    if (o.hidden !== false) pline(g, cs.near, { stroke: col, w: w * 0.6, dash: '6 6', op: 0.7 });
    if (o.contents) o.contents();
    pline(g, cs.far, { stroke: col, w }); seg(g, A, cs.T1, { stroke: col, w }); seg(g, A, cs.T2, { stroke: col, w });
  }
  return { A, El, cs };
}
/** o: { base, r, H, org, fill, fo, open, inner, liquid: { L, color, top }, hidden, contents(), stroke, w } */
function drawCyl(S, g, o) {
  const E0 = ellipse(S, o.base, o.r, o.org), E1 = ellipse(S, add3(o.base, [0, o.H, 0]), o.r, o.org), col = o.stroke || INK, w = o.w ?? 2.6;
  poly(g, [...eArc(E0, PI, 0), ...eArc(E1, 0, -PI)], { fill: o.fill || 'none', fo: o.fo ?? 1 });
  if (o.open) poly(g, eArc(E1, 0, 2 * PI, 64), { fill: o.inner || '#fff' });
  if (o.hidden !== false) pline(g, eArc(E0, PI, 2 * PI), { stroke: col, w: w * 0.6, dash: '6 6', op: 0.7 });
  if (o.liquid && o.liquid.L > 0.002) {
    const EL = ellipse(S, add3(o.base, [0, Math.min(o.liquid.L, o.H), 0]), o.r * 0.985, o.org);
    poly(g, [...eArc(E0, PI, 0), ...eArc(EL, 0, -PI)], { fill: o.liquid.color, fo: 0.92 });
    poly(g, eArc(EL, 0, 2 * PI, 64), { fill: o.liquid.top || o.liquid.color });
  }
  if (o.contents) o.contents();
  seg(g, eAt(E0, PI), eAt(E1, PI), { stroke: col, w }); seg(g, eAt(E0, 0), eAt(E1, 0), { stroke: col, w });
  pline(g, eArc(E0, 0, PI), { stroke: col, w }); pline(g, eArc(E1, 0, 2 * PI, 64), { stroke: col, w, close: true });
  return { E0, E1 };
}

/* =============================== static figures =============================== */
function figPentagon() {
  const host = document.getElementById('u10l4-f1'); if (!host) return;
  const S = new Scene3(host, { w: 300, h: 300, cx: 150, cy: 228, scale: 66, yaw: -8, tilt: 17 });
  const base = regPoly(5, 1.6), A = [0, 2.5, 0], O = [0, 0, 0], M = avg3([base[4], base[0]]);
  S.draw = (S) => {
    const [V, F] = pyramidVF(base, A); solid(S, S.g, V, F, { fill: '#fff' });
    seg(S.g, S.P(A), S.P(O), { stroke: HC, w: 2.6, dash: DASH }); seg(S.g, S.P(A), S.P(M), { stroke: SC, w: 3, dash: '2 6' });
    rightMark3(S, S.g, O, [0, 1, 0], [1, 0, 0], 0.18);
    svgEl('circle', { cx: S.P(O)[0], cy: S.P(O)[1], r: 3.5, fill: INK }, S.g);
    S.lab('h', T('h'), S.P([0, 1.2, 0]), 'w', { color: HC, cls: 'u10l4-big' });
    S.lab('s', T('s'), S.P(lerp3(A, M, 0.5)), 'e', { color: SC, cls: 'u10l4-big' });
    S.lab('a', 'apex', S.P(A), 'n', { cls: 'u10l4-sm' });
  };
  S.render();
}
function figPyrInPrism() {
  const host = document.getElementById('u10l4-f2'); if (!host) return;
  const S = new Scene3(host, { w: 300, h: 300, cx: 150, cy: 240, scale: 58, yaw: -24, tilt: 16 });
  const W = 3.2, D = 2, Hh = 2.9, A = [0, Hh, 0], M = [0, 0, D / 2];
  S.draw = (S) => {
    const [V, F] = prismVF(rect(W, D), Hh); solid(S, S.g, V, F, { fill: '#fff', w: 1.6, stroke: COLORS.slate });
    const [V2, F2] = pyramidVF(rect(W, D), A, { open: true });
    solid(S, S.g, V2, F2, { w: 3.6 });
    seg(S.g, S.P(A), S.P(M), { stroke: SC, w: 3, dash: '2 6' }); seg(S.g, S.P(A), S.P([0, 0, 0]), { stroke: HC, w: 2.4, dash: DASH });
    S.lab('h', T('h'), S.P([0, Hh * 0.55, 0]), 'w', { color: HC, cls: 'u10l4-big' });
    S.lab('s', T('s'), S.P(lerp3(A, M, 0.55)), 'e', { color: SC, cls: 'u10l4-big' });
  };
  S.render();
}
function figCone(id, inCyl) {
  const host = document.getElementById(id); if (!host) return;
  const S = new Scene3(host, { w: 300, h: 300, cx: 150, cy: 245, scale: 72, yaw: -20, tilt: 15 });
  const r = 1.3, Hh = 2.8, A = [0, Hh, 0], Q = [r, 0, 0];
  S.draw = (S) => {
    if (inCyl) drawCyl(S, S.g, { base: [0, 0, 0], r, H: Hh, w: 1.6, stroke: COLORS.slate });
    drawCone(S, S.g, { base: [0, 0, 0], r, H: Hh, fill: '#fff', fo: inCyl ? 0 : 1, w: inCyl ? 3.6 : 2.6 });
    seg(S.g, S.P([0, 0, 0]), S.P(A), { stroke: HC, w: 2.4, dash: DASH }); seg(S.g, S.P([0, 0, 0]), S.P(Q), { stroke: RC, w: 3 });
    seg(S.g, S.P(A), S.P(Q), { stroke: SC, w: 3.4 });
    rightMark3(S, S.g, [0, 0, 0], [0, 1, 0], [1, 0, 0], 0.16);
    svgEl('circle', { cx: S.P([0, 0, 0])[0], cy: S.P([0, 0, 0])[1], r: 3.5, fill: INK }, S.g);
    S.lab('h', T('h'), S.P([0, Hh * 0.45, 0]), 'w', { color: HC, cls: 'u10l4-big' });
    S.lab('r', T('r'), S.P([r / 2, 0, 0]), 's', { color: RC, cls: 'u10l4-big' });
    S.lab('s', T('s'), S.P(lerp3(A, Q, 0.5)), 'e', { color: SC, cls: 'u10l4-big' });
  };
  S.render();
}
/** the cone cut along a slant edge and unrolled (the booklet's picture: r/s = 0.4, a 144° sector) */
function figUnroll() {
  const host = document.getElementById('u10l4-f5'); if (!host) return;
  const S = new Scene3(host, { w: 500, h: 350, cx: 80, cy: 190, scale: 52, yaw: 0, tilt: 16 });
  const r = 1, Hh = 2.45;
  S.draw = (S) => {
    const g = S.g, cn = drawCone(S, g, { base: [0, 0, 0], r, H: Hh, fill: '#fff', hidden: false });
    seg(g, cn.A, cn.cs.T1[0] < cn.cs.T2[0] ? cn.cs.T1 : cn.cs.T2, { stroke: SC, w: 4 });
    seg(g, S.P([0, 0, 0]), S.P([r, 0, 0]), { stroke: RC, w: 2.6 });
    S.lab('r', T('r'), S.P([r / 2, 0, 0]), 's', { color: RC });
    S.lab('s', T('s'), lerp2(cn.A, S.P([-r, 0, 0]), 0.5), 'w', { color: SC });
    S.lab('cut', 'cut along<br>a slant edge', [80, 238], 'c', { cls: 'u10l4-sm u10l4-ctr' });
    const ar = [150, 120]; seg(g, ar, [212, 120], { w: 3 }); arrowHead(g, 222, 120, 1, 0, { width: 3, color: INK });
    S.lab('un', 'unroll', [186, 116], 'n', { cls: 'u10l4-sm' });
    const O = [360, 210], R = 130, a0 = 18 * RAD, a1 = 162 * RAD, pt = (a) => [O[0] + R * Math.cos(a), O[1] - R * Math.sin(a)];
    svgEl('circle', { cx: O[0], cy: O[1], r: R, fill: 'none', stroke: COLORS.gray, 'stroke-width': 1.6, 'stroke-dasharray': '6 6' }, g);
    const arc = Array.from({ length: 49 }, (_, i) => pt(lerp(a0, a1, i / 48)));
    poly(g, [O, ...arc], { fill: GLASS, fo: 0.8 });
    pline(g, arc, { stroke: HC, w: 3.4 }); seg(g, O, pt(a0), { w: 3 }); seg(g, O, pt(a1), { stroke: SC, w: 3.4 });
    svgEl('circle', { cx: O[0], cy: O[1], r: 3.5, fill: INK }, g);
    S.lab('s2', T('s'), lerp2(O, pt(40 * RAD), 0.42), 'se', { gap: 2 });
    S.lab('arc', `arc ${T('=2\\pi r')}`, pt(90 * RAD), 'n', { color: HC });
    S.lab('full', `full circle: ${T('2\\pi s')} around`, [O[0], O[1] + 46], 'c', { cls: 'u10l4-sm u10l4-muted' });
  };
  S.render();
}
function figShed() {
  const host = document.getElementById('u10l4-f6'); if (!host) return;
  const S = new Scene3(host, { w: 330, h: 330, cx: 150, cy: 262, scale: 52, yaw: -30, tilt: 16 });
  S.draw = (S) => {
    const [V, F] = houseVF(rect(3, 3), 2.4, 1.2); solid(S, S.g, V, F, { fill: '#fff' });
    seg(S.g, S.P([0, 3.6, 0]), S.P([0, 2.4, 0]), { stroke: HC, w: 2.2, dash: DASH });
    seg(S.g, S.P([-1.5, 2.4, 1.5]), S.P([1.5, 2.4, 1.5]), { w: 1.4, dash: '4 5', op: 0.6 });
    S.lab('w', T('3') + ' m', S.P([0, 0, 1.5]), 's', { gap: 8 });
    S.lab('d', T('3') + ' m', S.P([1.5, 0, 0]), 'se', { gap: 4 });
    S.lab('h', T('2.4') + ' m', S.P([-1.5, 1.2, 1.5]), 'w');
    S.lab('rh', T('1.2') + ' m', S.P([0, 2.95, 0]), 'e', { cls: 'u10l4-halo', gap: 4 });
  };
  S.render();
}
/* ---------- answer sketches ---------- */
function ansFigs() {
  let host = document.getElementById('u10l4-a1a');
  if (host) {
    const S = new Scene3(host, { w: 330, h: 140, cx: 135, cy: 84, scale: 8.6, yaw: -24, tilt: 14 });
    S.draw = (S) => {
      const [V, F] = pyramidVF(rect(16, 16), [0, 6, 0]); solid(S, S.g, V, F, { fill: '#fff' });
      seg(S.g, S.P([0, 6, 0]), S.P([0, 0, 0]), { stroke: HC, w: 2.2, dash: DASH });
      const top = S.P([0, 6, 0]), bot = S.P([0, 0, 0]); const x = Math.max(...rect(16, 16).map((p) => S.P(p)[0])) + 22;
      dim(S.g, [x, top[1]], [x, bot[1]], HC); seg(S.g, top, [x + 6, top[1]], { w: 1.2, dash: '3 4', op: 0.6 }); seg(S.g, bot, [x + 6, bot[1]], { w: 1.2, dash: '3 4', op: 0.6 });
      S.lab('h', `${T('h=6')} m`, [x + 4, (top[1] + bot[1]) / 2], 'e', { color: HC });
      S.lab('a', `${T('16')} m`, S.P([0, 0, 8]), 's'); S.lab('b', `${T('16')} m`, S.P([8, 0, 0]), 'se', { gap: 2 });
    };
    S.render();
  }
  host = document.getElementById('u10l4-a1b');
  if (host) {
    const sv = svgEl('svg', { width: 260, height: 230, viewBox: '0 0 260 230', class: 'u10l4-svg' }, host), q = 50, cx = 130, cy = 115, t = 62;
    const sq = [[cx - q, cy - q], [cx + q, cy - q], [cx + q, cy + q], [cx - q, cy + q]];
    const tips = [[cx, cy - q - t], [cx + q + t, cy], [cx, cy + q + t], [cx - q - t, cy]];
    for (let i = 0; i < 4; i++) poly(sv, [sq[i], sq[(i + 1) % 4], tips[i]], { fill: GLASS, fo: 0.7, stroke: INK, w: 2.2 });
    poly(sv, sq, { fill: '#fff', stroke: INK, w: 2.2, dash: '6 5' });
    const lab = (html, x, y, cls = '') => { const d = h('div', 'u10l4-lab u10l4-sm ' + cls, html); host.appendChild(d); place(d, x, y, 'c'); };
    lab(T('16\\times16'), cx, cy); lab(T('10'), cx, cy - q - 22); lab(T('10'), cx, cy + q + 22); lab(T('10'), cx - q - 22, cy); lab(T('10'), cx + q + 22, cy);
  }
  host = document.getElementById('u10l4-a2');
  if (host) {
    const S = new Scene3(host, { w: 300, h: 260, cx: 160, cy: 200, scale: 12.5, yaw: -20, tilt: 14 });
    S.draw = (S) => {
      drawCone(S, S.g, { base: [0, 0, 0], r: 5, H: 12, fill: '#fff' });
      seg(S.g, S.P([0, 0, 0]), S.P([0, 12, 0]), { stroke: HC, w: 2.2, dash: DASH }); seg(S.g, S.P([0, 0, 0]), S.P([5, 0, 0]), { stroke: RC, w: 2.6 });
      seg(S.g, S.P([0, 12, 0]), S.P([5, 0, 0]), { stroke: SC, w: 3 });
      const top = S.P([0, 12, 0]), x = S.P([-5, 0, 0])[0] - 20; dim(S.g, [x, top[1]], [x, S.P([0, 0, 0])[1]], HC);
      S.lab('h', `${T('h=12')} cm`, [x - 2, (top[1] + S.P([0, 0, 0])[1]) / 2], 'w', { color: HC });
      S.lab('s', `${T('s=13')} cm`, S.P([3.2, 5, 0]), 'e', { color: SC });
      S.lab('r', `${T('r=5')} cm`, S.P([2.5, 0, 0]), 's', { color: RC, gap: 10 });
    };
    S.render();
  }
  host = document.getElementById('u10l4-a3');
  if (host) {
    const sv = svgEl('svg', { width: 300, height: 200, viewBox: '0 0 300 200', class: 'u10l4-svg' }, host), R = 82, O = [110, 100];
    const V = Array.from({ length: 6 }, (_, i) => [O[0] + R * Math.cos((i * PI) / 3), O[1] - R * Math.sin((i * PI) / 3)]);
    poly(sv, V, { fill: '#fff', stroke: INK, w: 2.4 }); V.forEach((p) => seg(sv, O, p, { w: 1.6 }));
    const M = lerp2(V[0], V[1], 0.5); seg(sv, O, M, { stroke: TRI, w: 2.4, dash: '6 5' });
    svgEl('circle', { cx: O[0], cy: O[1], r: 3.5, fill: INK }, sv);
    const lab = (html, x, y, pos = 'c') => { const d = h('div', 'u10l4-lab u10l4-sm', html); host.appendChild(d); place(d, x, y, pos, 4); };
    lab(`${T('6')} cm`, M[0] + 14, M[1] - 12, 'ne'); const Q = lerp2(O, M, 0.62); seg(sv, Q, [V[0][0] + 14, V[0][1] + 26], { w: 1.2, op: 0.7 }); lab('apothem', V[0][0] + 16, V[0][1] + 26, 'e');
  }
}

/* =============================== warm-up: the popcorn deal =============================== */
function burst(g, x, y, txt) {
  const pts = []; for (let i = 0; i < 24; i++) { const a = (i * PI) / 12, rr = i % 2 ? 30 : 40; pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]); }
  poly(g, pts, { fill: SC, stroke: '#8f231e', w: 1.5 });
  const t = svgEl('text', { x, y: y + 9, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: '#fff', 'font-family': 'inherit' }, g); t.textContent = txt;
}
function puffs(g, El, seed = 1) {
  const R = [0.42, 0.5, 0.45, 0.52, 0.47, 0.5, 0.44, 0.42, 0.4, 0.46, 0.44, 0.46, 0.4];
  [0, 25, 50, 75, 100, 125, 150, 180, 205, 235, 270, 305, 335].forEach((a, i) => {
    svgEl('circle', { cx: El.x + 0.8 * El.a * Math.cos(a * RAD), cy: El.y + 0.8 * El.b * Math.sin(a * RAD) - El.a * 0.06, r: El.a * 0.15 * R[(i + seed) % R.length] * 2, fill: '#fff', stroke: '#c88c14', 'stroke-width': 1 }, g);
  });
  [[-0.35, -0.2], [0.05, -0.25], [0.4, -0.18], [-0.15, -0.34], [0.22, -0.36]].forEach(([dx, dy]) => svgEl('circle', { cx: El.x + dx * El.a, cy: El.y + dy * El.a, r: El.a * 0.17, fill: '#fff', stroke: '#c88c14', 'stroke-width': 1 }, g));
}
function mountPopcorn() {
  const host = document.getElementById('u10l4-pop'); if (!host) return;
  const st = { level: 0, n: 0 }, r = 10, Hh = 20;
  const S = new Scene3(host, { w: 560, h: 380, cx: 0, cy: 0, scale: 6.4, yaw: 0, tilt: 17 });
  const coneOrg = [140, 205], tubOrg = [420, 327];
  S.draw = (S) => {
    const g = S.g, cl = S.uid + 'k', cl2 = S.uid + 't';
    // cone (point down), always full
    const cn = drawCone(S, g, { base: [0, 0, 0], r, H: -Hh, org: coneOrg, fill: '#fff', open: true, inner: POP2 });
    const defs = svgEl('defs', {}, g), cp = svgEl('clipPath', { id: cl }, defs); poly(cp, [cn.A, ...cn.cs.far]);
    const gs = svgEl('g', { 'clip-path': `url(#${cl})` }, g);
    for (let k = -4; k <= 4; k += 2) poly(gs, [cn.A, [cn.El.x + (k - 0.5) * cn.El.a / 4 * 1.2, cn.El.y - 40], [cn.El.x + (k + 0.5) * cn.El.a / 4 * 1.2, cn.El.y - 40]], { fill: SC, fo: 0.85 });
    seg(g, cn.A, cn.cs.T1, { w: 2.6 }); seg(g, cn.A, cn.cs.T2, { w: 2.6 });
    puffs(g, cn.El, 0);
    // tub
    const E0 = ellipse(S, [0, 0, 0], r, tubOrg), E1 = ellipse(S, [0, Hh, 0], r, tubOrg);
    const body = [...eArc(E0, PI, 0), ...eArc(E1, 0, -PI)];
    poly(g, body, { fill: '#fff' }); poly(g, eArc(E1, 0, 2 * PI, 64), { fill: '#fbf3df' });
    if (st.level > 0.002) {
      const EL = ellipse(S, [0, Math.min(st.level, 1) * Hh, 0], r * 0.99, tubOrg);
      poly(g, [...eArc(E0, PI, 0), ...eArc(EL, 0, -PI)], { fill: POP, fo: 0.95 }); poly(g, eArc(EL, 0, 2 * PI, 64), { fill: POP2 });
    }
    const cp2 = svgEl('clipPath', { id: cl2 }, defs); poly(cp2, body);
    const gt = svgEl('g', { 'clip-path': `url(#${cl2})` }, g);
    for (let k = 0; k < 5; k++) { const x0 = E0.x - E0.a + (k * 2 + 0.4) * (E0.a / 5); svgEl('rect', { x: x0, y: E1.y - 60, width: E0.a / 5 * 1.1, height: E0.y - E1.y + 120, fill: SC, 'fill-opacity': 0.55 }, gt); }
    seg(g, eAt(E0, PI), eAt(E1, PI), { w: 2.6 }); seg(g, eAt(E0, 0), eAt(E1, 0), { w: 2.6 }); pline(g, eArc(E0, 0, PI), { w: 2.6 }); pline(g, eArc(E1, 0, 2 * PI, 64), { w: 2.6, close: true });
    if (st.level >= 0.999) puffs(g, E1, 3);
    // dimensions
    const xa = cn.El.x - cn.El.a - 22; dim(g, [xa, cn.El.y], [xa, cn.A[1]]); seg(g, [xa - 6, cn.A[1]], [cn.A[0], cn.A[1]], { w: 1.3, dash: '4 4', op: 0.6 });
    S.lab('ch', '<b>20 cm</b>', [xa - 4, (cn.El.y + cn.A[1]) / 2], 'w');
    const xb = E0.x + E0.a + 22; dim(g, [xb, E1.y], [xb, E0.y]); S.lab('th', '<b>20 cm</b>', [xb + 4, (E0.y + E1.y) / 2], 'e');
    S.lab('cn', '<b>Cone</b>', [cn.A[0], cn.A[1] + 6], 's'); S.lab('tb', '<b>Tub</b>', [E0.x, E0.y + E0.b + 4], 's');
    S.lab('rr', 'both: radius <b>10 cm</b>', [280, 28], 'c', { cls: 'u10l4-sm' });
    burst(g, 240, 300, '$4'); burst(g, 318, 236, '$9');
    if (st.n) S.lab('n', st.n >= 3 ? '<b>3 cones: full!</b>' : `<b>${st.n} cone${st.n > 1 ? 's' : ''}</b>`, [E1.x, E1.y - E1.b - 26], 'n', { cls: 'u10l4-pill' + (st.n >= 3 ? ' u10l4-ok' : '') });
  };
  S.render();
  let busy = false;
  const btn = document.getElementById('u10l4-pour'), b0 = document.getElementById('u10l4-pour0');
  if (btn) btn.onclick = async () => {
    if (busy || st.n >= 3) return; busy = true; const c = liveCtx(), from = st.n / 3; st.n++;
    await tw(c, 900, S, (t) => (st.level = lerp(from, st.n / 3, t))); busy = false;
    if (st.n >= 3) pulse(c, S.L('n'));
  };
  if (b0) b0.onclick = () => { if (busy) return; st.n = 0; st.level = 0; S.render(); };
}

/* =============================== explainer: the right triangle inside (hs, hsc) =============================== */
const HS = {
  sq: { label: 'Square base', n: 4, side: 4, h: 3.2, sym: true },
  pent: { label: 'Pentagonal base', n: 5, R: 2.3, h: 3.2, sym: true },
  ex1: { label: 'Example 1 check: the skylight', n: 4, side: 16, h: 6, unit: 'm', sTex: 's=\\sqrt{6^2+8^2}=\\sqrt{100}=10', sVal: '10' },
  roof: { label: 'Example 5 check: the shed roof', n: 4, side: 3, h: 1.2, body: 2.4, unit: 'm', sTex: 's=\\sqrt{1.2^2+1.5^2}=\\sqrt{3.69}\\approx1.921', sVal: '1.921' }
};
const HSC = {
  cone: { label: 'Any cone', cone: true, r: 2, h: 3.4, sym: true },
  ex2: { label: 'Example 2 check: the wooden cone', cone: true, r: 5, h: 12, unit: 'cm', sTex: 's=\\sqrt{12^2+5^2}=\\sqrt{169}=13', sVal: '13' }
};
const fmtU = (v, u) => `${T(String(v))}${u ? ' ' + u : ''}`;
function crossDef(DATA, title) {
  return {
    title, height: 470,
    choices: Object.keys(DATA).map((k) => ({ v: k, label: DATA[k].label })),
    intro: 'Where are <b>h</b> and <b>s</b>, and how are they connected? Press <b>Next</b>.',
    make(stage, k, ex) {
      const d = DATA[k], Hs = ex.def.height, cone = !!d.cone, body = d.body || 0;
      const R = cone ? d.r : d.R || d.side / (2 * Math.sin(PI / d.n)), a = cone ? d.r : +(R * Math.cos(PI / d.n)).toFixed(6);
      const sLen = Math.hypot(d.h, a), tot = d.h + body, SW = 500;
      const sc = Math.min(440 / (2 * R), 300 / (tot * 0.95));
      const S = new Scene3(stage, { x: 0, y: 0, w: ex.W, h: Hs, cx: SW / 2, cy: Hs - 70 - (R * sc * Math.sin(16 * RAD)), scale: sc, yaw: -28, tilt: 16 });
      const base = cone ? null : regPoly(d.n, R), O = [0, body, 0], A = [0, body + d.h, 0], M = [a, body, 0];
      const st = { rise: 0, hT: 0, aT: 0, sT: 0, tri: false, lift: 0, spin: 0, lab: { h: 0, a: 0, s: 0 } };
      // the flat triangle on the right
      const RX = SW + 50, RW = ex.W - RX - 30, K = Math.min((RW - 70) / a, 170 / d.h);
      const O2 = [RX + 30, 196], M2 = [O2[0] + a * K, O2[1]], A2 = [O2[0], O2[1] - d.h * K];
      const P = panel(stage, RX - 10, 252, ex.W - RX - 4, Hs - 266, '');
      const hTx = d.sym ? 'h' : `h=${d.h}`, aTx = d.sym ? (cone ? 'r' : d.n === 4 ? '\\tfrac12\\text{side}' : 'a') : cone ? `r=${d.r}` : `${a}`;
      S.draw = (S) => {
        const g = S.g, yawNow = -28 + st.spin * 360; S.yaw = yawNow;
        const Ar = [0, body + d.h * Math.max(st.rise, 0.002), 0];
        if (st.rise < 0.02 && !body) {
          if (cone) poly(g, eArc(ellipse(S, O, d.r), 0, 2 * PI, 64), { fill: '#fff', stroke: INK, w: 2.6 }); else poly(g, base.map((p) => S.P(p)), { fill: '#fff', stroke: INK, w: 2.6 });
          svgEl('circle', { cx: S.P(O)[0], cy: S.P(O)[1], r: 4, fill: INK }, g); return;
        }
        if (cone) drawCone(S, g, { base: O, r: d.r, H: d.h * Math.max(st.rise, 0.002), fill: '#fff', fo: 0.85 });
        else if (body) { const [V, F] = houseVF(base, body, d.h * Math.max(st.rise, 0.002)); solid(S, g, V, F, { fill: '#fff', fo: 0.85 }); }
        else { const [V, F] = pyramidVF(base, Ar); solid(S, g, V, F, { fill: '#fff', fo: 0.85 }); }
        if (st.rise < 1) return;
        const pA = S.P(A), pO = S.P(O), pM = S.P(M);
        if (st.tri) poly(g, [pA, pO, pM], { fill: TRI, fo: 0.18 });
        if (st.hT) seg(g, pA, lerp2(pA, pO, st.hT), { stroke: HC, w: 3.2, dash: DASH });
        if (st.aT) seg(g, pO, lerp2(pO, pM, st.aT), { stroke: RC, w: 3.4, dash: DASH });
        if (st.hT >= 1 && st.aT >= 1) rightMark3(S, g, O, [0, 1, 0], [1, 0, 0], Math.min(d.h, a) * 0.16, null, TRI);
        if (st.sT) {
          const n = cone ? [d.h, d.r, 0] : [d.h, a, 0]; // outward normal of the face (or the cone surface) through M
          seg(g, pA, lerp2(pA, pM, st.sT), { stroke: SC, w: 3.6, dash: S.facing(n) > 0 ? null : DASH });
        }
        svgEl('circle', { cx: pO[0], cy: pO[1], r: 4, fill: INK }, g);
        if (st.lab.h) S.lab('h', T(hTx), lerp2(pA, pO, 0.5), 'w', { color: HC, cls: 'u10l4-halo' });
        if (st.lab.a) S.lab('a', T(aTx), lerp2(pO, pM, 0.5), 's', { color: RC, cls: 'u10l4-halo', gap: 8 });
        if (st.lab.s) S.lab('s', T(d.sym ? 's' : 's'), lerp2(pA, pM, 0.5), 'ne', { color: SC, cls: 'u10l4-halo', gap: 4 });
        if (st.lift > 0) {
          const t = st.lift, qA = lerp2(pA, A2, t), qO = lerp2(pO, O2, t), qM = lerp2(pM, M2, t);
          poly(g, [qA, qO, qM], { fill: TRI, fo: 0.16 + 0.1 * t, stroke: TRI, w: 2 });
          seg(g, qA, qO, { stroke: HC, w: 4 }); seg(g, qO, qM, { stroke: RC, w: 4 }); seg(g, qA, qM, { stroke: SC, w: 4.4 });
          if (t >= 1) {
            pline(g, [[O2[0] + 18, O2[1]], [O2[0] + 18, O2[1] - 18], [O2[0], O2[1] - 18]], { stroke: TRI, w: 2 });
            S.lab('h2', T(hTx), lerp2(A2, O2, 0.5), 'w', { color: HC, cls: 'u10l4-big' });
            S.lab('a2', T(aTx), lerp2(O2, M2, 0.5), 's', { color: RC, cls: 'u10l4-big' });
            S.lab('s2', T(d.sym ? 's' : `s=${st.sKnown ? d.sVal : '\\,?'}`), lerp2(A2, M2, 0.5), 'ne', { color: SC, cls: 'u10l4-big', gap: 4 });
          }
        }
      };
      S.render();
      const leg = cone ? 'the radius' : d.n === 4 ? 'half the side' : 'the centre-to-edge distance';
      const shape = cone ? 'cone' : body ? 'roof' : 'pyramid';
      const steps = [
        { cap: cone ? `A right cone: the apex sits <b>directly above the centre</b> of the circular base.` : body ? `The shed: a ${T('3\\times3')} m prism with a square pyramid roof ${T('1.2')} m high.` : `A right pyramid: the apex sits <b>directly above the centre</b> of the base.`,
          run: (c) => tw(c, 1100, S, (t) => (st.rise = t)) },
        { cap: `${T('h')}: <b>straight down</b> from the apex to the centre of the ${body ? 'roof’s base' : 'base'}${d.sym ? '' : `: ${fmtU(d.h, d.unit)}`}.`,
          run: async (c) => { await tw(c, 650, S, (t) => (st.hT = t)); st.lab.h = 1; S.render(); await pop(c, S.L('h')); } },
        { cap: `From the centre straight out to ${cone ? 'the edge of the base' : 'the <b>middle of an edge</b>'}: ${leg}${d.sym ? '' : `, ${cone ? `${T('10\\div2=5')} cm` : fmtU(a, d.unit)}`}.`,
          run: async (c) => { await tw(c, 650, S, (t) => (st.aT = t)); st.lab.a = 1; S.render(); await pop(c, S.L('a')); } },
        { cap: `${T('s')}: from the apex <b>down the ${cone ? 'surface' : 'face'}</b> to that same point. That is the <b>slant height</b>.`,
          run: async (c) => { await tw(c, 650, S, (t) => (st.sT = t)); st.lab.s = 1; S.render(); await pop(c, S.L('s')); } },
        { cap: `The three make a <b>right triangle</b> standing inside the ${shape}. Spin it round to see.`,
          run: async (c) => { st.tri = true; S.render(); await tw(c, 2600, S, (t) => (st.spin = t)); st.spin = 0; S.render(); } },
        { cap: `Lift the triangle out and lay it flat. ${T('s')} is the <b>hypotenuse</b>, opposite the right angle.`,
          run: (c) => tw(c, 1100, S, (t) => (st.lift = t)) }
      ];
      if (d.sym) {
        steps.push({ cap: `Pythagoras: ${T(`s^2=h^2+${cone ? 'r' : d.n === 4 ? '\\left(\\tfrac12\\text{side}\\right)' : 'a'}^2`)}. The slant height is always <b>longer</b> than the height.`,
          run: async (c) => {
            await show(c, line(P, T(`s^2=h^2+${cone ? 'r^2' : d.n === 4 ? '\\left(\\tfrac12\\text{side}\\right)^2' : 'a^2'}`), 'u10l4-big'));
            await show(c, line(P, `<b>Volume</b> uses ${T('h')}; <b>surface area</b> uses ${T('s')}.`));
          } });
      } else {
        steps.push({ cap: `Pythagoras finds the missing side: ${T(d.sTex)} ${d.unit}.`,
          run: async (c) => {
            await show(c, line(P, T(`s^2=${d.h}^2+${a}^2`)));
            await show(c, line(P, T(d.sTex) + ' ' + d.unit));
            st.sKnown = true; S.render(); await pulse(c, S.L('s2'));
            await stampIn(c, stampAt(P, `s ${d.sVal.includes('.') ? '≈' : '='} ${d.sVal} ${d.unit}`));
          } });
      }
      return steps;
    }
  };
}
const hs = crossDef(HS, 'The right triangle inside a pyramid');
const hsc = crossDef(HSC, 'The right triangle inside a cone');
hs.minW = 900; // drawn this wide and scaled to fit beside the sidebar
hsc.minW = 900;

/* =============================== pouring: funnel → box, cone → cylinder =============================== */
/** one scene with a container on the left and a pourer that fills it in three pours. cfg: { kind: 'pyr'|'cone', W, D, r, H, S, fill colours } */
function pourScene(stage, ex, cfg) {
  const Hs = ex.def.height, tilt = 22, ANG = -118, lipUp = 50;
  const S = new Scene3(stage, { x: 0, y: 0, w: ex.W, h: Hs, scale: cfg.S, yaw: cfg.kind === 'pyr' ? -24 : 0, tilt });
  const bx = cfg.bx ?? 230, by = Hs - 66, sc = cfg.S, Hh = cfg.H, boxOrg = [bx, by, sc];
  const topC = S.P([0, Hh, 0], boxOrg), home = [bx + (cfg.gap ?? 420), topC[1]];
  const st = { level: 0, fill: 0, pos: home.slice(), ang: 0, stream: false, guides: false, done: 0 };
  const rimLocal = () => (cfg.kind === 'pyr' ? rect(cfg.W, cfg.D).map((p) => S.P(p, [0, 0, sc])) : eArc(ellipse(S, [0, 0, 0], cfg.r, [0, 0, sc]), 0, 2 * PI, 36));
  const xf = (p, pos, ang) => { const a = ang * RAD; return [pos[0] + p[0] * Math.cos(a) - p[1] * Math.sin(a), pos[1] + p[0] * Math.sin(a) + p[1] * Math.cos(a)]; };
  const lipOf = (pos, ang) => rimLocal().map((p) => xf(p, pos, ang)).reduce((m, p) => (p[1] > m[1] ? p : m));
  const l0 = lipOf([0, 0], ANG), over = [topC[0] - l0[0] - 10, topC[1] - lipUp - l0[1]];
  const drawContainer = (g) => {
    const L = st.level * Hh;
    if (cfg.kind === 'pyr') {
      const [V, F] = prismVF(rect(cfg.W, cfg.D), Hh, { open: true });
      solid(S, g, V, F, { org: boxOrg, fill: GLASS, fo: 0.35, open: true, inner: '#f3f8fb', contents: () => {
        if (L > 0.01) { const [V2, F2] = prismVF(rect(cfg.W * 0.985, cfg.D * 0.985), L); solid(S, g, V2, F2, { org: boxOrg, fill: cfg.c1, stroke: cfg.c0, w: 1, hidden: false, faceFill: (i) => (i === 1 ? cfg.c2 : cfg.c1) }); }
      } });
    } else drawCyl(S, g, { base: [0, 0, 0], r: cfg.r, H: Hh, org: boxOrg, fill: GLASS, fo: 0.35, open: true, inner: '#f3f8fb', liquid: { L, color: cfg.c1, top: cfg.c2 } });
  };
  const drawPourer = (g) => {
    const lev = Hh * Math.cbrt(Math.max(0, st.fill)), org = [0, 0, sc];
    if (cfg.kind === 'pyr') {
      const [V, F] = pyramidVF(rect(cfg.W, cfg.D), [0, -Hh, 0], { open: true });
      solid(S, g, V, F, { org, fill: GLASS, fo: 0.35, open: true, inner: '#f3f8fb', w: 2.6, contents: () => {
        if (lev > 0.02) { const k = lev / Hh, [V2, F2] = pyramidVF(rect(cfg.W * k * 0.97, cfg.D * k * 0.97, -Hh + lev), [0, -Hh, 0]); solid(S, g, V2, F2, { org, fill: cfg.c1, stroke: cfg.c0, w: 1, hidden: false, faceFill: (i) => (i === 0 ? cfg.c2 : cfg.c1) }); }
      } });
    } else drawCone(S, g, { base: [0, 0, 0], r: cfg.r, H: -Hh, org, fill: GLASS, fo: 0.35, open: true, inner: '#f3f8fb', contents: () => {
      if (lev > 0.02) { const A = S.P([0, -Hh, 0], org), El = ellipse(S, [0, -Hh + lev, 0], cfg.r * (lev / Hh) * 0.98, org), cs = coneShape(A, El); if (cs) { poly(g, [A, ...cs.far], { fill: cfg.c1 }); poly(g, eArc(El, 0, 2 * PI, 48), { fill: cfg.c2 }); } }
    } });
  };
  S.draw = (S) => {
    const g = S.g; drawContainer(g);
    if (st.guides) {
      const yb = by, yt = topC[1], x0 = bx + (cfg.kind === 'pyr' ? cfg.W * 0.55 : cfg.r) * sc + 16, x1 = home[0] - (cfg.kind === 'pyr' ? cfg.W * 0.55 : cfg.r) * sc - 16;
      seg(g, [x0, yb], [x1, yb], { stroke: RC, w: 2, dash: '5 6' }); seg(g, [x0, yt], [x1, yt], { stroke: RC, w: 2, dash: '5 6' });
      dim(g, [(x0 + x1) / 2, yt + 4], [(x0 + x1) / 2, yb - 4], RC);
      S.lab('same', `same height ${T('h')}`, [(x0 + x1) / 2 + 6, (yt + yb) / 2], 'e', { color: RC, cls: 'u10l4-halo' });
      S.lab('base', `same base ${T(cfg.kind === 'pyr' ? 'A_{\\text{Base}}' : '\\pi r^2')}`, [(x0 + x1) / 2, yt - 22], 'n', { color: RC, cls: 'u10l4-halo' });
    }
    if (st.stream) {
      const lip = lipOf(st.pos, st.ang), sy = S.P([0, st.level * Hh, 0], boxOrg)[1];
      svgEl('path', { d: `M${lip[0] - 5} ${lip[1]} L${lip[0] + 5} ${lip[1]} L${lip[0] + 3} ${sy} L${lip[0] - 3} ${sy}Z`, fill: cfg.c1, stroke: cfg.c0, 'stroke-width': 1 }, g);
    }
    const g2 = svgEl('g', { transform: `translate(${st.pos[0].toFixed(1)} ${st.pos[1].toFixed(1)}) rotate(${st.ang.toFixed(2)})` }, g);
    drawPourer(g2);
    const atHome = dist2(st.pos, home) < 1;
    S.lab('c1', cfg.name1, [bx, by + 30], 's', { cls: 'u10l4-sm' });
    if (atHome) S.lab('c2', cfg.name2, [home[0], by + 30], 's', { cls: 'u10l4-sm' });
    S.lab('cnt', ['empty', '<b>⅓</b> full', '<b>⅔</b> full', '<b>full!</b>'][st.done], [bx, 14], 's', { cls: 'u10l4-pill' + (st.done === 3 ? ' u10l4-ok' : '') });
  };
  S.render();
  const pour = (k) => async (c) => {
    await tw(c, 3600, S, (t) => {
      const pre = k === 0 ? 0 : 0.16;
      st.fill = k === 0 ? 1 : E(ph(t, 0, pre));
      const a = E(ph(t, pre, pre + 0.22)), b = ph(t, pre + 0.24, 0.8), dd = E(ph(t, 0.82, 1));
      st.pos = lerp2(lerp2(home, over, a), home, dd); st.ang = ANG * a * (1 - dd);
      if (b > 0) { st.fill = 1 - b; st.level = (k + b) / 3; } else st.level = k / 3;
      st.stream = b > 0 && b < 1; st.done = b >= 1 ? k + 1 : k;
    }, (t) => t);
    st.stream = false; st.done = k + 1; S.render(); await pulse(c, S.L('cnt'));
  };
  return { S, st, pour, home, by, topC };
}

const RICECFG = { kind: 'pyr', W: 4, D: 3, H: 3.6, S: 40, c0: '#b89a4a', c1: RICE, c2: RICE2, name1: 'planter box (prism)', name2: 'funnel (pyramid)' };
const third = {
  title: 'One third: three pyramids fill the prism',
  height: 490,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'rice', label: 'Rice: funnel into planter box' }, { v: 'cube', label: 'Why ⅓? Cut a cube into 3' }, { v: 'ex1', label: 'Example 1(a) check: the skylight' }],
  intro: (v) => (v === 'rice' ? 'Mr. Halden’s woodworking class. Press <b>Next</b>.' : v === 'cube' ? 'A cube cut into three identical pyramids. Press <b>Next</b>.' : 'The skylight inside the prism on the same base. Press <b>Next</b>.'),
  make(stage, k, ex) {
    if (k === 'cube') return cubeSteps(stage, ex);
    if (k === 'ex1') return skyThirdSteps(stage, ex);
    const p = pourScene(stage, ex, RICECFG), { S, st } = p;
    const P = panel(stage, ex.W - 300, 14, 286, 180, '');
    return [
      { cap: `A planter box (a prism) and a funnel (a pyramid): <b>same base</b>, <b>same height</b>.`, run: async (c) => { st.guides = true; S.render(); await appear(c, S.L('same')); } },
      { cap: `Fill the funnel with rice.`, run: async (c) => { st.guides = false; await tw(c, 1200, S, (t) => (st.fill = t)); } },
      { cap: `Empty it into the box…`, run: p.pour(0) },
      { cap: `Fill it and pour again: <b>two thirds</b>.`, run: p.pour(1) },
      { cap: `A third time: the box is filled <b>exactly</b>. No rice left over, no room left.`, run: async (c) => { await p.pour(2)(c); await stampIn(c, stampAt(P, '3 funnels = 1 box')); } },
      { cap: `So the pyramid holds ${T('\\tfrac13')} of the prism: ${T('V_{\\text{pyramid}}=\\tfrac13A_{\\text{Base}}h')}.`,
        run: async (c) => { await show(c, line(P, T('V_{\\text{pyramid}}=\\tfrac13V_{\\text{prism}}'), 'u10l4-big')); await show(c, line(P, T('=\\tfrac13A_{\\text{Base}}h'), 'u10l4-big')); } }
    ];
  }
};
function cubeSteps(stage, ex) {
  const Hs = ex.def.height, a = 3.2;
  const S = new Scene3(stage, { x: 0, y: 0, w: ex.W, h: Hs, cx: 320, cy: Hs - 150, scale: 64, yaw: -32, tilt: 22 });
  const P = panel(stage, ex.W - 330, 14, 316, Hs - 28, '');
  const c0 = [-a / 2, 0, -a / 2], Ap = [-a / 2, a, -a / 2]; // shared corner: back-left-top
  const cube = (x, y, z) => [c0[0] + x * a, y * a, c0[2] + z * a];
  const pieces = [
    { base: [cube(1, 0, 0), cube(1, 0, 1), cube(1, 1, 1), cube(1, 1, 0)], dir: [1, 0, 0], color: '#f4c76b', name: 'right face' },
    { base: [cube(0, 0, 1), cube(1, 0, 1), cube(1, 1, 1), cube(0, 1, 1)], dir: [0, 0, 1], color: '#8fc0f0', name: 'front face' },
    { base: [cube(0, 0, 0), cube(1, 0, 0), cube(1, 0, 1), cube(0, 0, 1)], dir: [0, -1, 0], color: '#9fd8b4', name: 'bottom face' }
  ];
  const st = { cube: 1, pieces: 0, ex: 0, lab: false };
  S.draw = (S) => {
    const g = S.g;
    if (st.cube) { const [V, F] = prismVF(rect(a, a), a); solid(S, g, V, F, { fill: '#fff', fo: st.pieces ? 0 : 1, w: st.pieces ? 1.4 : 2.6, stroke: st.pieces ? COLORS.gray : INK }); }
    if (!st.pieces) return;
    const order = pieces.map((pc, i) => { const off = mul3(pc.dir, st.ex * 1.6), V = [...pc.base, Ap].map((p) => add3(p, off)); return { i, V, d: S.P(avg3(V))[2] }; }).sort((u, v) => u.d - v.d);
    for (const o of order) {
      const pc = pieces[o.i], [V, F] = pyramidVF(o.V.slice(0, 4), o.V[4]);
      solid(S, g, V, F, { fill: pc.color, fo: 0.92, hidden: false, w: 2.2 });
      if (st.lab) S.lab('p' + o.i, `base ${T('a^2')}<br>height ${T('a')}`, S.P(avg3(o.V.slice(0, 4))), 'c', { cls: 'u10l4-sm u10l4-tag' });
    }
    S.lab('A', 'shared corner', S.P(add3(Ap, mul3([0, 1, 0], st.ex * 0.2))), 'n', { cls: 'u10l4-sm' });
  };
  S.render();
  return [
    { cap: `A cube with edges ${T('a')}: volume ${T('a^3')}, which is (base ${T('a^2')}) × (height ${T('a')}).`,
      run: async (c) => { await show(c, line(P, T('V_{\\text{cube}}=a^2\\cdot a=a^3'), 'u10l4-big')); } },
    { cap: `It splits into <b>three pyramids</b> whose tips all meet at one corner.`, run: async (c) => { st.pieces = 1; S.render(); await appear(c, S.L('A')); } },
    { cap: `Pull them apart.`, run: (c) => tw(c, 1500, S, (t) => (st.ex = t)) },
    { cap: `Each one has a face of the cube as its <b>base</b> (${T('a^2')}) and reaches across the cube: <b>height</b> ${T('a')}.`,
      run: async (c) => { st.lab = true; S.render(); for (const i of [0, 1, 2]) await pop(c, S.L('p' + i)); } },
    { cap: `Three identical pyramids fill the cube, so each is ${T('\\tfrac13a^3=\\tfrac13(\\text{base})(\\text{height})')}.`,
      run: async (c) => { await show(c, line(P, T('3V_{\\text{pyramid}}=a^3')));
        await show(c, line(P, T('V_{\\text{pyramid}}=\\tfrac13a^2\\cdot a'), 'u10l4-big')); await show(c, line(P, T('=\\tfrac13A_{\\text{Base}}h'), 'u10l4-big')); } },
    { cap: `Back together. These pyramids lean (the tip is over a corner), but the ${T('\\tfrac13')} only needs the <b>same base and height</b>.`,
      run: async (c) => { st.lab = false; await tw(c, 1300, S, (t) => (st.ex = 1 - t)); await stampIn(c, stampAt(P, '3 pyramids = 1 cube')); } }
  ];
}
function skyThirdSteps(stage, ex) {
  const Hs = ex.def.height;
  const S = new Scene3(stage, { x: 0, y: 0, w: ex.W, h: Hs, cx: 290, cy: Hs - 120, scale: 18, yaw: -26, tilt: 18 });
  const P = panel(stage, ex.W - 360, 14, 346, Hs - 28, '');
  const st = { pf: 0, layers: 0 };
  S.draw = (S) => {
    const g = S.g, [V, F] = prismVF(rect(16, 16), 6, {});
    solid(S, g, V, F, { fill: GLASS, fo: 0.25 + st.pf * 0.2, w: 1.8, stroke: COLORS.slate, contents: () => {
      const cols = ['#f4c76b', '#8fc0f0', '#9fd8b4'];
      for (let i = 0; i < 3; i++) { const L = Math.max(0, Math.min(1, st.layers * 3 - i)); if (L <= 0) continue; const [V2, F2] = prismVF(rect(15.9, 15.9, i * 2), 2 * L); solid(S, g, V2, F2, { fill: cols[i], fo: 0.85, hidden: false, w: 1 }); }
    } });
    const [V3, F3] = pyramidVF(rect(16, 16), [0, 6, 0], { open: true }); solid(S, g, V3, F3, { w: 3.6, hidden: !st.layers, fill: null });
    S.lab('a', `${T('16')} m`, S.P([0, 0, 8]), 's', { gap: 8 }); S.lab('b', `${T('16')} m`, S.P([8, 0, 0]), 'se', { gap: 2 });
    S.lab('h', `${T('h=6')} m`, S.P([-8, 3, 8]), 'w', { color: HC, cls: 'u10l4-halo' });
    if (st.layers >= 1) for (let i = 0; i < 3; i++) S.lab('L' + i, T('512'), S.P([8, 2 * i + 1, 8]), 'e', { cls: 'u10l4-tag u10l4-sm' });
  };
  S.render();
  return [
    { cap: `The skylight (heavy lines) inside the prism on the same ${T('16\\times16')} base, ${T('6')} m high.`, run: (c) => appear(c, S.el) },
    { cap: `The prism: ${T('V=A_{\\text{Base}}h=16^2\\times6=256\\times6=1\\,536')} m³.`,
      run: async (c) => { await tw(c, 600, S, (t) => (st.pf = t)); await show(c, line(P, T('V_{\\text{prism}}=16^2\\times6=1\\,536'))); } },
    { cap: `Three skylights’ worth fill the prism: each third holds ${T('1\\,536\\div3=512')} m³.`, run: (c) => tw(c, 1800, S, (t) => (st.layers = t), (t) => t) },
    { cap: `So ${T('V=\\tfrac13A_{\\text{Base}}h=\\tfrac13(256)(6)=512')} m³. The slant height is not needed for volume.`,
      run: async (c) => { await show(c, line(P, T('V=\\tfrac13(256)(6)'))); await show(c, line(P, T('=512') + ' m³', 'u10l4-big')); await stampIn(c, stampAt(P, 'V = 512 m³')); } }
  ];
}

const pour = {
  title: 'One third: three cones fill the cylinder',
  height: 490,
  choices: [{ v: 'water', label: 'Water: cone into cylinder' }, { v: 'pop', label: 'Warm-up check: the popcorn deal' }],
  intro: 'Same base, same height. How many cones of water? Press <b>Next</b>.',
  make(stage, k, ex) {
    const popc = k === 'pop';
    const cfg = popc ? { kind: 'cone', r: 10, H: 20, S: 7.6, c0: '#c88c14', c1: POP, c2: POP2, name1: 'tub (cylinder)', name2: 'cone' }
      : { kind: 'cone', r: 1.9, H: 3.6, S: 44, c0: '#2c78b8', c1: WATER, c2: WATER2, name1: 'cylinder', name2: 'cone' };
    const p = pourScene(stage, ex, cfg), { S, st } = p;
    const P = panel(stage, ex.W - 330, 14, 316, popc ? 250 : 150, '');
    if (!popc) return [
      { cap: `A cylinder and a cone: <b>same circular base</b>, <b>same height</b>.`, run: async (c) => { st.guides = true; S.render(); await appear(c, S.L('same')); } },
      { cap: `Fill the cone with water.`, run: async (c) => { st.guides = false; await tw(c, 1200, S, (t) => (st.fill = t)); } },
      { cap: `Pour it in: one third full.`, run: p.pour(0) },
      { cap: `Again: two thirds.`, run: p.pour(1) },
      { cap: `Three full cones fill the cylinder <b>exactly</b>.`, run: async (c) => { await p.pour(2)(c); await stampIn(c, stampAt(P, '3 cones = 1 cylinder')); } },
      { cap: `${T('V_{\\text{cone}}=\\tfrac13V_{\\text{cylinder}}=\\tfrac13\\pi r^2h')}, for every radius and height.`,
        run: async (c) => { await show(c, line(P, T('V_{\\text{cone}}=\\tfrac13V_{\\text{cylinder}}'), 'u10l4-big')); await show(c, line(P, T('=\\tfrac13\\pi r^2h'), 'u10l4-big')); } }
    ];
    return [
      { cap: `The tub and the cone: both radius ${T('10')} cm, both height ${T('20')} cm.`, run: async (c) => { st.guides = true; S.render(); await appear(c, S.L('same')); } },
      { cap: `The tub: ${T('V=\\pi(10)^2(20)=2000\\pi\\approx6\\,283')} cm³.`, run: async (c) => { st.guides = false; S.render(); await show(c, line(P, `tub: ${T('2000\\pi\\approx6\\,283')} cm³`)); } },
      { cap: `Fill the cone with popcorn and pour it in.`, run: async (c) => { await tw(c, 900, S, (t) => (st.fill = t)); await p.pour(0)(c); } },
      { cap: `Second cone…`, run: p.pour(1) },
      { cap: `Third cone: <b>full</b>. Each cone holds ${T('\\tfrac13(6\\,283)\\approx2\\,094')} cm³, about 2.1 L.`,
        run: async (c) => { await p.pour(2)(c); await show(c, line(P, `cone: ${T('\\tfrac13(2000\\pi)\\approx2\\,094')} cm³`)); } },
      { cap: `One tub of popcorn in cones costs ${T('3\\times\\$4=\\$12')}. The tub costs ${T('\\$9')}: <b>the tub is the better deal</b>.`,
        run: async (c) => { await show(c, line(P, `3 cones: ${T('3\\times\\$4=\\$12')}`, 'u10l4-big')); await show(c, line(P, `1 tub: ${T('\\$9')}`, 'u10l4-big')); await stampIn(c, stampAt(P, 'Tub wins')); } }
    ];
  }
};

/* =============================== explainer: unfold the net =============================== */
const NET = {
  ex1: { label: 'Example 1(b) check: the skylight', side: 16, h: 6, s: 10, unit: 'm', base: false, S: 12.5, S0: 21 },
  closed: { label: 'A closed pyramid: the base counts', side: 6, h: 4, s: 5, unit: 'cm', base: true, S: 29, S0: 46 }
};
const net = {
  title: 'Unfold the pyramid into its net',
  height: 480,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(NET).map((k) => ({ v: k, label: NET[k].label })),
  intro: (v) => (NET[v].base ? 'A closed square pyramid: base 6 cm, height 4 cm. Press <b>Next</b>.' : 'The glass skylight: base 16 m by 16 m, height 6 m. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = NET[k], Hs = ex.def.height, half = d.side / 2, a0 = Math.atan2(d.h, half), SWc = 290;
    const S = new Scene3(stage, { x: 0, y: 0, w: ex.W, h: Hs, cx: SWc, cy: Hs - 110, scale: d.S, yaw: -28, tilt: 20 });
    const P = panel(stage, ex.W - 330, 14, 316, Hs - 28, '');
    const B = regPoly(4, half * Math.SQRT2), st = { u: 0, sOn: 0, baseX: 0, one: 0, all: 0 }, triA = 0.5 * d.side * d.s, u = d.unit;
    S.draw = (S) => {
      const g = S.g, beta = (1 - E(st.u)) * (PI - a0);
      S.tilt = lerp(20, 52, E(st.u)); S.yaw = lerp(-28, 0, E(st.u)); S.cy = lerp(Hs - 110, Hs / 2 + 6, E(st.u)); S.S = lerp(d.S0, d.S, E(st.u));
      const tris = [0, 1, 2, 3].map((i) => {
        const p = B[i], q = B[(i + 1) % 4], M = lerp3(p, q, 0.5), n = mul3(M, 1 / Math.hypot(M[0], M[2]));
        const ap = add3(M, add3(mul3(n, d.s * Math.cos(beta)), [0, d.s * Math.sin(beta), 0]));
        return { i, pts: [p, q, ap], M, ap, d: S.P(avg3([p, q, ap]))[2] };
      });
      const bp = B.map((p) => S.P(p));
      poly(g, bp, d.base ? { fill: '#fff4dd', stroke: INK, w: 2.6 } : { fill: '#f6f6f6', stroke: INK, w: 2, dash: st.u > 0.5 ? '7 6' : null });
      if (st.baseX) S.lab('bx', d.base ? `base ${T(`${d.side}\\times${d.side}=${d.side * d.side}`)}` : 'base: no glass<br>not counted', avg2(bp), 'c', { cls: 'u10l4-sm u10l4-ctr ' + (d.base ? 'u10l4-tag' : 'u10l4-no') });
      tris.sort((x, y) => x.d - y.d).forEach((t) => {
        const pp = t.pts.map((p) => S.P(p)), lit = (st.one && t.i === 3) || st.all;
        poly(g, pp, { fill: lit ? '#9fd0f0' : GLASS, fo: st.u > 0.3 ? 0.9 : 0.55, stroke: INK, w: 2.4 });
        if (st.sOn && t.i === 3) seg(g, S.P(t.ap), S.P(t.M), { stroke: SC, w: 3.2 });
        if ((st.one && t.i === 3) || st.all) S.lab('t' + t.i, T(String(triA)), S.P(avg3([t.M, t.pts[0], t.ap])), 'c', { cls: 'u10l4-tag' });
      });
      if (st.u === 0) {
        seg(g, S.P([0, d.h, 0]), S.P([0, 0, 0]), { stroke: HC, w: 2.4, dash: DASH });
        S.lab('h', `${T('h=' + d.h)} ${u}`, S.P([0, d.h * 0.45, 0]), 'w', { color: HC, cls: 'u10l4-halo' });
      }
      if (st.u < 0.5) S.lab('sd', `${T(String(d.side))} ${u}`, S.P(lerp3(B[0], B[1], 0.5)), 's', { gap: 8 });
      if (st.sOn) { const t0 = tris.find((t) => t.i === 3); S.lab('s', `${T('s=' + d.s)} ${u}`, S.P(lerp3(t0.ap, t0.M, 0.45)), 'e', { color: SC, cls: 'u10l4-halo', gap: 8 }); }
    };
    S.render();
    const steps = [
      { cap: `Surface area needs ${T('s')}. Half the base is ${T(String(half))} ${u}: ${T(`s=\\sqrt{${d.h}^2+${half}^2}=\\sqrt{${d.h * d.h + half * half}}=${d.s}`)} ${u}.`,
        run: async (c) => { st.sOn = 1; S.render(); await pop(c, S.L('s')); await show(c, line(P, T(`s=\\sqrt{${d.h}^2+${half}^2}=${d.s}`) + ` ${u}`)); } },
      { cap: `Unfold: each triangle folds down flat around its base edge. This is the <b>net</b>.`, run: (c) => tw(c, 2400, S, (t) => (st.u = t)) },
      d.base
        ? { cap: `This pyramid is closed, so the square base is a real face: ${T(`${d.side}\\times${d.side}=${d.side * d.side}`)} ${u}².`,
          run: async (c) => { st.baseX = 1; S.render(); await pop(c, S.L('bx')); await show(c, line(P, `base: ${T(`${d.side * d.side}`)} ${u}²`)); } }
        : { cap: `The base is <b>not</b> glass: it sits on the atrium roof and is never seen. Don’t count it.`,
          run: async (c) => { st.baseX = 1; S.render(); await pop(c, S.L('bx')); } },
      { cap: `One triangle: ${T(`\\tfrac12(${d.side})(${d.s})=${triA}`)} ${u}².`, run: async (c) => { st.one = 1; S.render(); await pop(c, S.L('t3')); await show(c, line(P, `one triangle: ${T(`\\tfrac12(${d.side})(${d.s})=${triA}`)}`)); } },
      { cap: d.base ? `Four triangles: ${T(`4(${triA})=${4 * triA}`)}. Total ${T(`SA=${d.side * d.side}+${4 * triA}=${d.side * d.side + 4 * triA}`)} ${u}².` : `Four triangles: ${T(`SA=4(${triA})=${4 * triA}`)} ${u}² of glass.`,
        run: async (c) => {
          st.all = 1; S.render(); for (const i of [0, 1, 2]) await pop(c, S.L('t' + i));
          const tot = d.base ? d.side * d.side + 4 * triA : 4 * triA;
          await show(c, line(P, T(d.base ? `SA=${d.side * d.side}+4(${triA})=${tot}` : `SA=4(${triA})=${tot}`) + ` ${u}²`, 'u10l4-big'));
          await stampIn(c, stampAt(P, `SA = ${tot} ${u}²`));
        } }
    ];
    steps.unshift({ cap: d.base ? `A closed square pyramid: base ${T(String(d.side))} ${u}, height ${T('h=' + d.h)} ${u}.` : `The skylight: a square base ${T('16')} m on a side, height ${T('h=6')} m.`, run: (c) => appear(c, S.L('h')) });
    return steps;
  }
};

/* =============================== explainer: unroll the cone =============================== */
const UNR = {
  demo: { label: `${T('r=2,\\ s=5')} (the booklet’s picture)`, r: 2, s: 5, S: 38 },
  ex2: { label: 'Example 2 check: the wooden cone', r: 5, s: 13, S: 15, unit: 'cm' }
};
const unroll = {
  title: 'Unroll the curved surface of a cone',
  height: 480,
  choices: Object.keys(UNR).map((k) => ({ v: k, label: UNR[k].label })),
  intro: 'Cut it, flatten it, and see what shape it makes. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = UNR[k], Hs = ex.def.height, r = d.r, s = d.s, hh = Math.sqrt(s * s - r * r), sc = d.S, deg = (360 * r) / s;
    const S = new Scene3(stage, { x: 0, y: 0, w: ex.W, h: Hs, cx: 150, cy: Hs - 80, scale: sc, yaw: 0, tilt: 16 });
    const P = panel(stage, ex.W - 300, 14, 286, Hs - 28, '');
    const O = [ex.W - 300 - 30 - sc * s * Math.sin(Math.min(deg, 180) * RAD / 2) - 4, 70 + sc * s], Rs = sc * s;
    const phi0 = 90 + deg / 2, thc = PI; // the cut: the left slant edge
    const st = { cut: 0, u: 0, sLab: 0, arc: 0, full: 0, baseLab: 0 };
    S.draw = (S) => {
      const g = S.g, u = E(st.u);
      const A = S.P([0, hh, 0]), N = 72;
      const bnd = Array.from({ length: N + 1 }, (_, i) => {
        const th = thc + (2 * PI * i) / N, cp = S.P([r * Math.cos(th), 0, r * Math.sin(th)]);
        const ph2 = (phi0 - (deg * i) / N) * RAD, sp = [O[0] + Rs * Math.cos(ph2), O[1] - Rs * Math.sin(ph2)];
        return lerp2(cp, sp, u);
      });
      const apex = lerp2(A, O, u);
      // the base disc stays behind
      const El = ellipse(S, [0, 0, 0], r);
      poly(g, eArc(El, 0, 2 * PI, 64), { fill: '#fff4dd', stroke: INK, w: 2 });
      if (st.full) svgEl('circle', { cx: O[0], cy: O[1], r: Rs, fill: 'none', stroke: COLORS.gray, 'stroke-width': 2, 'stroke-dasharray': '7 7' }, g);
      if (u < 0.02) { drawCone(S, g, { base: [0, 0, 0], r, H: hh, fill: GLASS, fo: 0.9 }); }
      else {
        poly(g, [apex, ...bnd], { fill: GLASS, fo: 0.9 });
        for (let i = 6; i < N; i += 6) seg(g, apex, bnd[i], { stroke: '#7fb6da', w: 1.2 });
        pline(g, bnd, { stroke: st.arc ? HC : INK, w: st.arc ? 4 : 2.6 });
        seg(g, apex, bnd[N], { w: 2.6 });
      }
      if (st.cut) seg(g, apex, lerp2(apex, bnd[0], st.cut), { stroke: SC, w: 4 });
      seg(g, S.P([0, 0, 0]), S.P([r, 0, 0]), { stroke: RC, w: 2.6 }); S.lab('r', T('r' + (d.unit ? '=' + r : '')), S.P([r / 2, 0, 0]), 's', { color: RC, cls: 'u10l4-halo' });
      if (!st.sLab && st.u === 0) S.lab('s0', T('s' + (d.unit ? '=' + s : '')), lerp2(A, S.P([-r, 0, 0]), 0.5), 'w', { color: SC, cls: 'u10l4-halo' });
      else S.lab('s1', T('s'), lerp2(O, bnd[0], 0.5), 'w', { color: SC, cls: 'u10l4-halo u10l4-big' });
      if (st.sLab) S.lab('s2', T('s'), lerp2(O, bnd[N], 0.5), 'e', { cls: 'u10l4-halo u10l4-big' });
      if (st.arc) S.lab('arc', `arc ${T('=2\\pi r')}`, [O[0], O[1] - Rs - 4], 'n', { color: HC, cls: 'u10l4-halo u10l4-big' });
      if (st.full) S.lab('full', `full circle: ${T('2\\pi s')} around, area ${T('\\pi s^2')}`, [O[0], Math.min(Hs - 20, O[1] + Rs * 0.55)], 'c', { cls: 'u10l4-sm u10l4-halo' });
      if (st.baseLab) S.lab('bl', `base ${T('\\pi r^2')}`, [El.x, El.y + El.b + 6], 's', { cls: 'u10l4-sm u10l4-halo' });
    };
    S.render();
    const fr = d.unit ? `\\dfrac{${r}}{${s}}` : `\\dfrac{2}{5}`;
    return [
      { cap: `A cone with radius ${T('r')} and slant height ${T('s')}${d.unit ? `: ${T('r=5')} cm, ${T('s=13')} cm` : ''}.`, run: (c) => appear(c, S.L('s0')) },
      { cap: `Cut along one slant edge.`, run: (c) => tw(c, 700, S, (t) => (st.cut = t)) },
      { cap: `Unroll the curved surface and lay it flat.`, run: (c) => tw(c, 2600, S, (t) => (st.u = t)) },
      { cap: `It is a <b>sector</b> (a pizza slice) of a circle. Its two straight edges are slant heights, so its radius is ${T('s')}.`, run: async (c) => { st.sLab = 1; S.render(); await pop(c, S.L('s1')); await pop(c, S.L('s2')); } },
      { cap: `The arc wrapped around the base, so the arc is as long as the base’s circumference: ${T('2\\pi r')}.`, run: async (c) => { st.arc = 1; S.render(); await pop(c, S.L('arc')); } },
      { cap: `The full circle of radius ${T('s')} would be ${T('2\\pi s')} around, with area ${T('\\pi s^2')}.`, run: async (c) => { st.full = 1; S.render(); await appear(c, S.L('full')); } },
      { cap: `The sector is the fraction ${T('\\dfrac{2\\pi r}{2\\pi s}=\\dfrac rs')} of that circle${d.unit ? `: ${T(fr)}` : `: ${T('\\dfrac25')}, a ${deg.toFixed(0)}° slice`}.`,
        run: async (c) => { await show(c, line(P, T('\\text{fraction}=\\frac{2\\pi r}{2\\pi s}=\\frac rs'))); if (d.unit) await show(c, line(P, T(`=${fr}`))); } },
      { cap: d.unit ? `Curved area ${T(`=\\tfrac{5}{13}\\times\\pi(13)^2=65\\pi\\approx204.2`)} cm². Add the base ${T('25\\pi')}: ${T('SA=90\\pi\\approx282.7')} cm².` : `Curved area ${T('=\\dfrac rs\\times\\pi s^2=\\pi rs')}. Add the base: ${T('SA_{\\text{cone}}=\\pi r^2+\\pi rs')}.`,
        run: async (c) => {
          st.baseLab = 1; S.render(); await pop(c, S.L('bl'));
          if (d.unit) { await show(c, line(P, T('\\pi rs=\\pi(5)(13)=65\\pi'))); await show(c, line(P, T('SA=25\\pi+65\\pi=90\\pi'))); await show(c, line(P, T('\\approx282.7') + ' cm²', 'u10l4-big')); }
          else { await show(c, line(P, T('\\frac rs\\times\\pi s^2=\\pi rs'), 'u10l4-big')); await show(c, line(P, T('SA_{\\text{cone}}=\\pi r^2+\\pi rs'), 'u10l4-big')); }
        } }
    ];
  }
};

/* =============================== explainer: which height? (flowchart) =============================== */
const WH = {
  ex1a: { label: 'Example 1(a)', passes: [{ path: ['q', 'vol', 'useh', 'given', 'yes'], caps: ['Example 1(a): the <b>volume</b> of the skylight.', 'Volume uses the perpendicular height.', `${T('h=6')} m is given: substitute. ${T('V=\\tfrac13(256)(6)=512')} m³.`] }] },
  ex1b: { label: 'Example 1(b)', passes: [{ path: ['q', 'sa', 'uses', 'given', 'no', 'yes'], caps: ['Example 1(b): the <b>surface area</b> of the skylight.', 'Surface area uses the slant height.', `${T('s')} is not given: Pythagoras with ${T('h=6')} and half the side, 8: ${T('s=10')} m.`, `Then substitute: ${T('4\\times\\tfrac12(16)(10)=320')} m².`] }] },
  ex2: { label: 'Example 2', passes: [
    { path: ['q', 'vol', 'useh', 'given', 'yes'], caps: ['Example 2, first the <b>volume</b>.', 'Volume uses the height.', `${T('h=12')} cm is given: ${T('V=\\tfrac13\\pi(5)^2(12)=100\\pi\\approx314.2')} cm³.`] },
    { path: ['q', 'sa', 'uses', 'given', 'no', 'yes'], caps: ['Now the <b>surface area</b>.', 'Surface area uses the slant height.', `Not given: ${T('s=\\sqrt{5^2+12^2}=13')} cm.`, `${T('SA=\\pi(5)^2+\\pi(5)(13)=90\\pi\\approx282.7')} cm².`] }] },
  ex5: { label: 'Example 5(b) roof', passes: [{ path: ['q', 'sa', 'uses', 'given', 'no', 'yes'], caps: ['Example 5(b): the <b>surface area</b> of the roof.', 'Surface area uses the slant height.', `Not given: ${T('s=\\sqrt{1.2^2+1.5^2}\\approx1.921')} m.`, `${T('4\\cdot\\tfrac12(3)(1.921\\ldots)\\approx11.53')} m² of roof.`] }] }
};
const which = {
  title: 'Which height do I need?',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(WH).map((k) => ({ v: k, label: WH[k].label })),
  intro: 'Volume or surface area? That decides which height. Press <b>Next</b>.',
  make(stage, k, ex) {
    const W = Math.min(ex.W - 20, 940), x0 = (ex.W - W) / 2, cxm = W / 2, L = cxm - 240, R = cxm + 240;
    const F = new Flowchart(stage, { x: x0, y: 6, width: W, height: 458,
      nodes: {
        q: { x: cxm, y: 38, w: 340, h: 54, html: '<b>What are you finding?</b>', cls: 'bk-round' },
        vol: { x: L, y: 132, w: 330, h: 74, html: `<b>Volume</b>${T('\\tfrac13A_{\\text{Base}}h')} or ${T('\\tfrac13\\pi r^2h')}`, color: 'blue' },
        sa: { x: R, y: 132, w: 330, h: 74, html: `<b>Surface area</b>base + triangles or ${T('\\pi r^2+\\pi rs')}`, color: 'red' },
        useh: { x: L, y: 232, w: 300, h: 56, html: `<b>Use ${T('h')}</b>the perpendicular height`, color: 'blue' },
        uses: { x: R, y: 232, w: 300, h: 56, html: `<b>Use ${T('s')}</b>the slant height`, color: 'red' },
        given: { x: cxm, y: 322, w: 250, h: 54, html: '<b>Is it given?</b>', cls: 'bk-round' },
        yes: { x: L, y: 412, w: 300, h: 60, html: '<b>Substitute</b>and round once, at the end', color: 'green' },
        no: { x: R, y: 412, w: 300, h: 60, html: `<b>Pythagoras</b>${T('s^2=h^2+r^2')} (or half the side)`, color: 'purple' }
      },
      edges: [
        { from: 'q', to: 'vol', label: 'V' }, { from: 'q', to: 'sa', label: 'SA' },
        { from: 'vol', to: 'useh' }, { from: 'sa', to: 'uses' },
        { from: 'useh', to: 'given' }, { from: 'uses', to: 'given' },
        { from: 'given', to: 'yes', label: 'yes' }, { from: 'given', to: 'no', label: 'no' },
        { from: 'no', to: 'yes', label: 'then', dash: true }
      ] });
    const steps = [];
    WH[k].passes.forEach((ps, pi) => {
      const p = ps.path, segs = [[p[0], p[1]], [p[1], p[2]], p.slice(2, 5)];
      if (p.length > 5) segs.push([p[4], p[5]]);
      segs.forEach((sg, i) => steps.push({ cap: ps.caps[i], run: async (c) => { if (pi && !i) F.fade(); await F.light(c, sg); } }));
    });
    return steps;
  }
};

/* =============================== explainer: Example 3, the hexagonal pyramid =============================== */
const hex = {
  title: 'Example 3 check: from hexagon to pyramid',
  height: 480,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  intro: 'A regular hexagon with sides of 6 cm, seen from directly above. Press <b>Next</b>.',
  make(stage, k, ex) {
    const Hs = ex.def.height, sc = 23, base = regPoly(6, 6, 0), A = [0, 12, 0];
    const S = new Scene3(stage, { x: 0, y: 0, w: ex.W, h: Hs, cx: 290, cy: Hs / 2, scale: sc, yaw: -12, tilt: 90 });
    const P = panel(stage, ex.W - 360, 14, 346, Hs - 28, '');
    const st = { sp: 0, one: 0, all: 0, up: 0, water: 0, apo: 0 };
    S.draw = (S) => {
      const g = S.g, u = E(st.up);
      S.tilt = lerp(90, 20, u); S.cy = lerp(Hs / 2, Hs - 90, u);
      const bp = base.map((p) => S.P(p)), O = S.P([0, 0, 0]);
      if (st.up === 0) {
        poly(g, bp, { fill: '#fff', stroke: INK, w: 2.8 });
        for (let i = 0; i < 6; i++) {
          const tri = [O, bp[i], bp[(i + 1) % 6]];
          if (st.all || (st.one && i === 0)) poly(g, tri, { fill: i % 2 ? '#c9b6ee' : '#ddd0f5', stroke: TRI, w: 1.2 });
          if (st.sp) seg(g, O, lerp2(O, bp[i], st.sp), { w: 2 });
        }
        if (st.apo) { const M = lerp2(bp[0], bp[1], 0.5); seg(g, O, lerp2(O, M, st.apo), { stroke: TRI, w: 3, dash: '6 5' }); S.lab('ap', T('3\\sqrt3'), lerp2(O, M, 0.55), 'nw', { color: TRI, cls: 'u10l4-halo' }); S.lab('hf', T('3'), lerp2(bp[0], M, 0.5), 'e', { cls: 'u10l4-halo u10l4-sm' }); }
        if (st.sp >= 1) S.lab('r', T('6'), lerp2(O, bp[3], 0.5), 'n', { cls: 'u10l4-halo u10l4-sm' });
        S.lab('side', `${T('6')} cm`, lerp2(bp[1], bp[2], 0.5), 's', { gap: 6 });
        poly(g, bp, { stroke: INK, w: 2.8 });
        if (st.one && !st.all) S.lab('t0', T('9\\sqrt3'), avg2([O, bp[0], bp[1]]), 'c', { cls: 'u10l4-tag u10l4-sm' });
        return;
      }
      const [V, F] = pyramidVF(base, [0, 12 * u + 0.001, 0]);
      solid(S, g, V, F, { fo: 0.9, faceFill: (i) => (i === 0 ? '#ddd0f5' : st.water ? '#bfe0f7' : '#fff') });
      if (u >= 1) { seg(g, S.P(A), O, { stroke: HC, w: 2.6, dash: DASH }); S.lab('h', `${T('h=12')} cm`, S.P([0, 6, 0]), 'w', { color: HC, cls: 'u10l4-halo' }); }
      S.lab('side', `${T('6')} cm`, lerp2(bp[1], bp[2], 0.5), 's', { gap: 6 });
    };
    S.render();
    return [
      { cap: `Join the centre to each vertex: <b>six triangles</b>. The centre-to-vertex distance is also ${T('6')} cm, so they are <b>equilateral</b>.`, run: (c) => tw(c, 900, S, (t) => (st.sp = t)) },
      { cap: `One triangle: its height meets the base at the midpoint (3 and 3). Height ${T('=\\sqrt{6^2-3^2}=\\sqrt{27}=3\\sqrt3')}.`,
        run: async (c) => { st.one = 1; await tw(c, 600, S, (t) => (st.apo = t)); await show(c, line(P, T('\\text{height}=\\sqrt{6^2-3^2}=\\sqrt{27}=3\\sqrt3'))); } },
      { cap: `Area of one triangle ${T('=\\tfrac12(6)(3\\sqrt3)=9\\sqrt3')} cm².`, run: async (c) => { await pop(c, S.L('t0')); await show(c, line(P, T('\\tfrac12(6)(3\\sqrt3)=9\\sqrt3'))); } },
      { cap: `Six of them: ${T('A_{\\text{hex}}=6(9\\sqrt3)=54\\sqrt3\\approx93.53')}, about ${T('94')} cm².`,
        run: async (c) => { st.all = 1; S.render(); await show(c, line(P, T('A_{\\text{hex}}=54\\sqrt3\\approx94') + ' cm²', 'u10l4-big')); } },
      { cap: `Now raise the apex ${T('12')} cm straight above the centre.`, run: (c) => tw(c, 2200, S, (t) => (st.up = t)) },
      { cap: `${T('V=\\tfrac13A_{\\text{Base}}h=\\tfrac13(54\\sqrt3)(12)=216\\sqrt3\\approx374.12')} cm³. Keep ${T('54\\sqrt3')} exact until the end.`,
        run: async (c) => { await show(c, line(P, T('V=\\tfrac13(54\\sqrt3)(12)'))); await show(c, line(P, T('=216\\sqrt3\\approx374.12') + ' cm³', 'u10l4-big')); } },
      { cap: `Fill it with water: ${T('1')} cm³ ${T('=1')} mL, so it holds <b>374 mL</b>.`, run: async (c) => { st.water = 1; S.render(); await stampIn(c, stampAt(P, '374 mL')); } }
    ];
  }
};

/* =============================== explainer: Example 4, scaling =============================== */
const SCL = {
  p1: { label: 'Problem 1: height ×4' },
  p2: { label: 'Problem 2: radius ×3' },
  both: { label: 'Both doubled' }
};
const scale = {
  title: 'Example 4 check: scaling a cone',
  height: 470,
  choices: Object.keys(SCL).map((k) => ({ v: k, label: SCL[k].label })),
  intro: (v) => (v === 'p1' ? 'Same radius, taller cone. Press <b>Next</b>.' : v === 'p2' ? 'Same height, wider cone. Press <b>Next</b>.' : 'Double the radius <b>and</b> the height. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const Hs = ex.def.height, P = panel(stage, ex.W - 340, 14, 326, Hs - 28, '');
    const cfg = k === 'p1' ? { r1: 3, h1: 6, r2: 3, h2: 24, sc: 15, x1: 90, x2: 290 }
      : k === 'p2' ? { r1: 4, h1: 8, r2: 12, h2: 8, sc: 12.5, x1: 80, x2: 330 } : { r1: 2.5, h1: 5, r2: 5, h2: 10, sc: 26, x1: 100, x2: 330 };
    const S = new Scene3(stage, { x: 0, y: 0, w: ex.W, h: Hs, cx: 0, cy: Hs - 60, scale: cfg.sc, yaw: 0, tilt: 15 });
    const st = { r2: cfg.r1, h2: cfg.h1, show2: 0, bands: 0, top: 0, grid: 0 };
    S.draw = (S) => {
      const g = S.g, u = E(st.top);
      S.tilt = lerp(15, 90, u); S.cy = lerp(Hs - 60, Hs / 2 + 20, u);
      const o1 = [cfg.x1, S.cy], o2 = [cfg.x2, S.cy];
      drawCone(S, g, { base: [0, 0, 0], r: cfg.r1, H: cfg.h1, org: o1, fill: '#e3f1ef' });
      if (st.show2) {
        if (st.bands) for (let i = 0; i < 4; i++) drawCyl(S, g, { base: [0, cfg.h1 * i, 0], r: cfg.r1, H: cfg.h1, org: o2, fill: i % 2 ? '#fff4dd' : '#fde8c0', fo: 0.8, w: 1.4, stroke: RC, hidden: false });
        drawCone(S, g, { base: [0, 0, 0], r: st.r2, H: st.h2, org: o2, fill: '#cfe4fb', fo: st.bands ? 0.85 : 1 });
      }
      if (st.grid) {
        const E2 = ellipse(S, [0, 0, 0], cfg.r2, o2), s1 = cfg.r1 * cfg.sc * 2, x0 = E2.x - E2.a, y0 = E2.y - E2.a;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
          svgEl('rect', { x: x0 + i * s1, y: y0 + j * s1, width: s1, height: s1, fill: 'none', stroke: RC, 'stroke-width': 2 }, g);
          svgEl('circle', { cx: x0 + (i + 0.5) * s1, cy: y0 + (j + 0.5) * s1, r: s1 / 2, fill: '#e3f1ef', 'fill-opacity': 0.8, stroke: TEAL, 'stroke-width': 1.5 }, g);
        }
        const E1 = ellipse(S, [0, 0, 0], cfg.r1, o1);
        svgEl('rect', { x: E1.x - E1.a, y: E1.y - E1.a, width: 2 * E1.a, height: 2 * E1.a, fill: 'none', stroke: RC, 'stroke-width': 2 }, g);
      }
      const lab = (key, o, r, hh, txt, color) => {
        const top = S.P([0, hh, 0], o), bot = S.P([r, 0, 0], o);
        const ty = Math.min(top[1], S.P([0, 0, -r], o)[1]);
        if (u < 0.5 && ty > 70) S.lab(key, txt, [o[0], ty - 8], 'n', { cls: 'u10l4-sm u10l4-halo u10l4-ctr', color });
        else if (u < 0.5) S.lab(key, txt, [o[0] + r * cfg.sc + 14, (top[1] + bot[1]) / 2], 'e', { cls: 'u10l4-sm u10l4-halo', color });
        else S.lab(key, txt, [o[0], bot[1] + r * cfg.sc + 8], 's', { cls: 'u10l4-sm u10l4-halo u10l4-ctr', color });
      };
      const v1 = k === 'p1' ? '15' : k === 'p2' ? '20' : '10';
      lab('l1', o1, cfg.r1, cfg.h1, `${k === 'both' ? `${T('r,\\ h')}` : k === 'p1' ? T('h=6') : T('r=4')}<br>${T('V=' + v1)}`, INK);
      if (st.show2) lab('l2', o2, st.r2, st.h2, `${k === 'p1' ? T('h=' + Math.round(st.h2)) : k === 'p2' ? T('r=' + Math.round(st.r2)) : T(`${st.r2 > cfg.r1 + 1e-6 ? '2r' : 'r'},\\ ${st.h2 > cfg.h1 + 1e-6 ? '2h' : 'h'}`)}<br>${T('V=\\,?')}`, HC);
    };
    S.render();
    if (k === 'p1') return [
      { cap: `Cone 1: height ${T('6')} cm, volume ${T('15')} cm³.`, run: (c) => appear(c, S.L('l1')) },
      { cap: `Cone 2: the <b>same radius</b>, but height ${T('24')} cm. Stretch it: ${T('24\\div6=4')} times as tall.`, run: async (c) => { st.show2 = 1; await tw(c, 1600, S, (t) => (st.h2 = lerp(6, 24, t))); } },
      { cap: `Its matching cylinder is <b>4</b> of cone 1’s cylinders stacked up, so it holds 4 times as much…`, run: (c) => { st.bands = 1; S.render(); return appear(c, S.el); } },
      { cap: `…and the cone is ${T('\\tfrac13')} of it either way. In ${T('V=\\tfrac13\\pi r^2h')}, ${T('r^2')} is unchanged, so ${T('V')} grows with ${T('h')}: ${T('\\times4')}.`,
        run: async (c) => { await show(c, line(P, T('V=\\tfrac13\\pi r^2\\,h'), 'u10l4-big')); await show(c, line(P, `${T('r^2')} same, ${T('h\\times4')}`)); await show(c, line(P, `${T('\\Rightarrow V\\times4')}`)); } },
      { cap: `${T('V_2=4(15)=60')} cm³. No formula needed.`, run: async (c) => { await show(c, line(P, T('V_2=4(15)=60') + ' cm³', 'u10l4-big')); await stampIn(c, stampAt(P, '60 cm³')); } }
    ];
    if (k === 'p2') return [
      { cap: `Cone 1: radius ${T('4')} cm, volume ${T('20')} cm³.`, run: (c) => appear(c, S.L('l1')) },
      { cap: `Cone 2: the <b>same height</b>, radius ${T('12')} cm: ${T('12\\div4=3')} times as wide.`, run: async (c) => { st.show2 = 1; await tw(c, 1600, S, (t) => (st.r2 = lerp(4, 12, t))); } },
      { cap: `Look down on the two bases from above.`, run: (c) => tw(c, 1600, S, (t) => (st.top = t)) },
      { cap: `Every length of the base is ${T('\\times3')}, so the square around it holds ${T('3\\times3=9')} small squares: the base area is ${T('\\times9')}.`,
        run: async (c) => { st.grid = 1; S.render(); await show(c, line(P, `radius ${T('\\times3')}`)); await show(c, line(P, `base area ${T('\\times3^2=\\times9')}`)); } },
      { cap: `Same height, 9 times the base: the volume is ${T('\\times9')}, <b>not</b> ${T('\\times3')}. ${T('V_2=9(20)=180')} cm³.`,
        run: async (c) => { await show(c, line(P, T('V_2=9(20)=180') + ' cm³', 'u10l4-big')); await stampIn(c, stampAt(P, '180 cm³')); } }
    ];
    return [
      { cap: `A cone with radius ${T('r')} and height ${T('h')} holds ${T('10')} cm³.`, run: (c) => appear(c, S.L('l1')) },
      { cap: `Double the radius: the base area is ${T('\\times2^2=\\times4')}.`, run: async (c) => { st.show2 = 1; await tw(c, 1300, S, (t) => (st.r2 = lerp(2.5, 5, t))); await show(c, line(P, `radius ${T('\\times2')}: base ${T('\\times4')}`)); } },
      { cap: `Double the height too: ${T('\\times2')} again.`, run: async (c) => { await tw(c, 1300, S, (t) => (st.h2 = lerp(5, 10, t))); await show(c, line(P, `height ${T('\\times2')}`)); } },
      { cap: `Altogether ${T('\\times4\\times2=\\times8')}: ${T('10\\times8=80')} cm³. Double every length and a cone holds <b>8 times</b> as much.`,
        run: async (c) => { await show(c, line(P, `${T('V\\times2^2\\times2=\\times8')}`, 'u10l4-big')); await show(c, line(P, T('V_2=8(10)=80') + ' cm³', 'u10l4-big')); await stampIn(c, stampAt(P, '× 8')); } }
    ];
  }
};

/* =============================== explainer: Example 5, the shed =============================== */
const shed = {
  title: 'Example 5 check: the garden shed',
  height: 480,
  minW: 840, // drawn this wide and scaled to fit beside the sidebar
  intro: 'A prism with a pyramid roof. Volumes add; hidden faces don’t count. Press <b>Next</b>.',
  make(stage, k, ex) {
    const Hs = ex.def.height, P = panel(stage, ex.W - 380, 14, 366, Hs - 28, '');
    const S = new Scene3(stage, { x: 0, y: 0, w: ex.W, h: Hs, cx: 270, cy: Hs - 60, scale: 72, yaw: -30, tilt: 16 });
    const st = { body: 0, roof: 0, lift: 0, shared: 0, tri: 0, walls: 0, faces: 0 };
    const sq = rect(3, 3);
    S.draw = (S) => {
      const g = S.g, lift = E(st.lift) * 1.0;
      const [V, F] = prismVF(sq, 2.4);
      solid(S, g, V, F, { fill: st.body ? '#fde8c0' : '#fff', faceFill: (i) => (i === 1 && st.shared ? '#f6c3c0' : st.walls && i >= 2 ? '#fde8c0' : st.body ? '#fde8c0' : '#fff') });
      if (st.shared && lift > 0.05) {
        poly(g, rect(3, 3, 2.4 + lift).map((p) => S.P(p)), { fill: '#f6c3c0', fo: 0.85, stroke: SC, w: 2, dash: '6 5' });
      }
      const top = sq.map((p) => [p[0], 2.4 + lift, p[2]]), [V2, F2] = pyramidVF(top, [0, 3.6 + lift, 0]);
      solid(S, g, V2, F2, { fill: st.roof || st.faces ? '#cfe4fb' : '#fff', fo: st.shared && lift > 0.05 ? 0.9 : 1 });
      if (st.tri) {
        const A = S.P([0, 3.6, 0]), O = S.P([0, 2.4, 0]), M = S.P([1.5, 2.4, 0]);
        poly(g, [A, O, M], { fill: TRI, fo: 0.2 }); seg(g, A, O, { stroke: HC, w: 3, dash: DASH }); seg(g, O, M, { stroke: RC, w: 3, dash: DASH }); seg(g, A, M, { stroke: SC, w: 3.6 });
        S.lab('th', T('1.2'), lerp2(A, O, 0.5), 'w', { color: HC, cls: 'u10l4-halo u10l4-sm' }); S.lab('ta', T('1.5'), lerp2(O, M, 0.5), 's', { color: RC, cls: 'u10l4-halo u10l4-sm', gap: 4 });
        S.lab('ts', T('s'), lerp2(A, M, 0.5), 'ne', { color: SC, cls: 'u10l4-halo', gap: 2 });
      }
      S.lab('w', `${T('3')} m`, S.P([0, 0, 1.5]), 's', { gap: 8 }); S.lab('d', `${T('3')} m`, S.P([1.5, 0, 0]), 'se', { gap: 4 });
      S.lab('hh', `${T('2.4')} m`, S.P([-1.5, 1.2, 1.5]), 'w');
      if (!st.tri) S.lab('rh', `${T('1.2')} m`, S.P([-1.5, 3, 1.5]), 'w', { cls: lift > 0.05 ? 'u10l4-hid' : '' });
      if (st.shared && lift > 0.05) { S.lab('x1', '✗ hidden', S.P([1.5, 2.4, 1.5]), 'e', { cls: 'u10l4-no u10l4-sm' }); S.lab('x2', '✗ hidden', S.P([1.5, 2.4 + lift, 1.5]), 'e', { cls: 'u10l4-no u10l4-sm' }); }
    };
    S.render();
    return [
      { cap: `<b>Volume</b>, part 1: the prism. ${T('V=(3)(3)(2.4)=21.6')} m³.`, run: async (c) => { st.body = 1; S.render(); await show(c, line(P, `prism: ${T('(3)(3)(2.4)=21.6')}`)); } },
      { cap: `Part 2: the roof. ${T('V=\\tfrac13(9)(1.2)=3.6')} m³.`, run: async (c) => { st.roof = 1; S.render(); await show(c, line(P, `roof: ${T('\\tfrac13(9)(1.2)=3.6')}`)); } },
      { cap: `Add the parts: ${T('V=21.6+3.6=25.2')} m³.`, run: async (c) => { await show(c, line(P, T('V=21.6+3.6=25.2') + ' m³', 'u10l4-big')); } },
      { cap: `<b>Surface area</b>: lift the roof off. The top of the prism and the bottom of the roof are the <b>same</b> ${T('3\\times3')} square.`,
        run: async (c) => { st.body = 0; st.roof = 0; st.shared = 1; await tw(c, 1300, S, (t) => (st.lift = t)); P.querySelectorAll('.u10l4-line').forEach((e) => (e.style.opacity = 0.35)); } },
      { cap: `That square is hidden inside the shed: count it for <b>neither</b> part. Put the roof back.`, run: async (c) => { await tw(c, 1100, S, (t) => (st.lift = 1 - t)); st.shared = 0; S.render(); } },
      { cap: `Prism part: floor ${T('3\\times3=9')} m² plus four walls ${T('4(3)(2.4)=28.8')} m².`, run: async (c) => { st.walls = 1; S.render(); await show(c, line(P, `floor + walls: ${T('9+28.8')}`)); } },
      { cap: `Roof: the slant height from the triangle inside. ${T('s=\\sqrt{1.2^2+1.5^2}=\\sqrt{3.69}\\approx1.921')} m.`, run: async (c) => { st.tri = 1; S.render(); await pop(c, S.L('ts')); await show(c, line(P, T('s=\\sqrt{3.69}=1.9209\\ldots'))); } },
      { cap: `Four triangles: ${T('4\\cdot\\tfrac12(3)(1.9209\\ldots)\\approx11.526')} m². ${T('SA=9+28.8+11.526\\approx49.3')} m².`,
        run: async (c) => { st.faces = 1; S.render(); await show(c, line(P, `roof: ${T('4\\cdot\\tfrac12(3)(1.9209\\ldots)=11.5256\\ldots')}`)); await show(c, line(P, T('SA\\approx49.3') + ' m²', 'u10l4-big')); await stampIn(c, stampAt(P, 'SA ≈ 49.3 m²')); } }
    ];
  }
};

/* =============================== mount =============================== */
figPentagon(); figPyrInPrism(); figCone('u10l4-f3', false); figCone('u10l4-f4', true); figUnroll(); figShed(); ansFigs(); mountPopcorn();
export const explainers = mountExplainers({ hs, hsc, third, pour, net, unroll, which, hex, scale, shed });
export const _test = { Scene3, HS, HSC, NET, UNR, WH };
