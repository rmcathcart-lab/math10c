/* Math 10C · Unit 10 · Lesson 3 — Surface Area and Volume of Prisms and Cylinders.
 * A small 3-D engine (orthographic camera, painter's sort, dashed hidden edges for "wire" solids, nets that fold about
 * their hinges, a sheet that rolls into a cylinder) drives the explainers:
 *   rollit (warm-up: one sheet rolled two ways, then filled with rice), prisms (a base pushed straight back; bases, sides,
 *   right angles; a slanted push is not a right prism), layers (volume as 1-unit layers of the base; Examples 1, 2, 4),
 *   net (unfold a prism onto the table, add every face; Example 1 and the Example 2 box), capacity (1 cm³ = 1 mL up to
 *   1 L; Example 2(b) with units cancelling), cylnet (open the lids, unroll the side: SA = 2πr² + 2πrh; Example 3/4),
 *   radius (halve the diameter; round at the end; Example 4), backwards (cube root by guess-and-check then ∛; how many
 *   layers of the base fit; Examples 5 and 6), label (peel the label off the poster tube; Example 7), solveh (what is
 *   left for the rectangle; Example 8).
 * Static figures on the cards are ports of the booklet's TikZ (same coordinates, dimensions and labels).
 * Colours: bases teal, side faces amber, curved surfaces blue, highlights red, water blue. */
import { h, tex, add, box, svgEl, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween, pulse, place, COLORS, NumberLine } from '../blocks.js';

const T = (s) => tex(s);
const RAD = Math.PI / 180, PI = Math.PI;
const INK = COLORS.ink, TEAL = COLORS.teal, AMB = COLORS.amber, BLUE = COLORS.blue, RED = COLORS.red;
const F = { base: '#a9dcd5', side: '#ffdc9c', curve: '#bcd2fb', hi: '#ffb1a8', water: '#6ea8ee', glass: '#e8f1fb', paper: '#fff4d6', rice: '#ecd9a0', card: '#d9c29a', label: '#ffc4bb', gray: '#e3e0d8' };

/* ---------------- numbers (TeX) ---------------- */
const thin = (s) => { const [i, f] = s.split('.'); const ii = i.length > 3 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : i; return f != null ? ii + '.' + f : ii; };
const fx = (v, d) => thin(v.toFixed(d));                         // fixed decimals
const nf = (v, d = 2) => thin(String(parseFloat(v.toFixed(d)))); // trimmed

/* ---------------- vectors ---------------- */
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vmul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vcross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vunit = (a) => { const L = Math.hypot(...a) || 1; return vmul(a, 1 / L); };
const vmid = (a, b) => vmul(vadd(a, b), 0.5);
function newell(P) {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; x += (a[1] - b[1]) * (a[2] + b[2]); y += (a[2] - b[2]) * (a[0] + b[0]); z += (a[0] - b[0]) * (a[1] + b[1]); }
  const L = Math.hypot(x, y, z); return L ? [x / L, y / L, z / L] : [0, 0, 0];
}
const cen = (P) => vmul(P.reduce((s, p) => vadd(s, p), [0, 0, 0]), 1 / P.length);
function rotAxis(p, a, k, th) {
  const v = vsub(p, a), c = Math.cos(th), s = Math.sin(th), kv = vcross(k, v), kd = vdot(k, v);
  return [a[0] + v[0] * c + kv[0] * s + k[0] * kd * (1 - c), a[1] + v[1] * c + kv[1] * s + k[1] * kd * (1 - c), a[2] + v[2] * c + kv[2] * s + k[2] * kd * (1 - c)];
}
const LIGHT = vunit([-0.45, -0.8, 0.55]);
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`;
}

/* =============================== the 3-D scene =============================== */
class Scene3 {
  constructor(host, o) {
    this.W = o.width; this.H = o.height;
    this.el = box(h('div', 'u10l3-scene'), o.width, o.height);
    if (o.x != null) add(host, this.el, o.x, o.y); else host.appendChild(this.el);
    this.svg = svgEl('svg', { width: o.width, height: o.height, viewBox: `0 0 ${o.width} ${o.height}` }, this.el);
    this.gF = svgEl('g', {}, this.svg); this.gT = svgEl('g', {}, this.svg);
    this.html = h('div', 'u10l3-labs'); this.el.appendChild(this.html);
    this.cam = Object.assign({ yaw: -30, elev: 20, s: 10, ox: o.width / 2, oy: o.height / 2 }, o.cam || {});
    this.objs = []; this.labs = []; this.lines = [];
  }
  P(p, cam = this.cam) {
    const t = cam.yaw * RAD, e = cam.elev * RAD, xp = p[0] * Math.cos(t) - p[1] * Math.sin(t), d = p[0] * Math.sin(t) + p[1] * Math.cos(t);
    return [cam.ox + cam.s * xp, cam.oy - cam.s * (p[2] * Math.cos(e) + d * Math.sin(e))];
  }
  view() { const t = this.cam.yaw * RAD, e = this.cam.elev * RAD; return [-Math.sin(t) * Math.cos(e), -Math.cos(t) * Math.cos(e), Math.sin(e)]; }
  obj(o) { this.objs.push(o); return o; }
  /** an HTML label pinned to a 3-D point (or a function giving one) */
  label(at, html, o = {}) { const d = h('div', 'u10l3-lab ' + (o.cls || ''), html); this.html.appendChild(d); if (o.hide) d.style.opacity = 0; this.labs.push({ at, d, pos: o.pos || 'c', gap: o.gap ?? 6 }); return d; }
  /** an overlay polyline through 3-D points (or a function giving them), drawn on top of the faces */
  line(at, o = {}) {
    const e = svgEl('path', { fill: o.fill || 'none', 'fill-opacity': o.fillOp, stroke: o.color || INK, 'stroke-width': o.width || 2.5, 'stroke-dasharray': o.dash ? '7 6' : null, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, this.gT);
    if (o.hide) e.style.opacity = 0; this.lines.push({ at, e, close: o.close }); return e;
  }
  points() { const out = []; this.objs.forEach((o) => { if (!o.hide) o.faces().forEach((f) => out.push(...f.P)); }); return out; }
  /** camera that fits pts inside (an optional box of) the scene, seen from yaw/elev */
  fit(pts, yaw, elev, o = {}) {
    const c0 = { yaw, elev, s: 1, ox: 0, oy: 0 }, q = pts.map((p) => this.P(p, c0)), bx = o.box || { x: 0, y: 0, w: this.W, h: this.H }, pad = o.pad ?? 40;
    const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = Math.min((bx.w - 2 * pad) / Math.max(x1 - x0, 1e-6), (bx.h - 2 * (o.padY ?? pad)) / Math.max(y1 - y0, 1e-6), o.maxS || 1e9);
    return { yaw, elev, s, ox: bx.x + bx.w / 2 - (s * (x0 + x1)) / 2, oy: bx.y + bx.h / 2 - (s * (y0 + y1)) / 2 };
  }
  setCam(cam) { Object.assign(this.cam, cam); return this; }
  async camTo(c, tgt, ms = 1000, each) {
    const a = { ...this.cam };
    await tween(c, ms, (t) => { for (const k in tgt) this.cam[k] = a[k] + (tgt[k] - a[k]) * t; if (each) each(t); this.render(); });
  }
  render() {
    const w = this.view(), all = [];
    for (const o of this.objs) {
      if (o.hide) continue;
      for (const f of o.faces()) { f.o = o; f.n = newell(f.P); f.vis = f.always || vdot(f.n, w) > 1e-6; f.k = vdot(cen(f.P), w) + (f.bias || 0) + (o.bias || 0); all.push(f); }
    }
    all.sort((a, b) => a.k - b.k);
    this.gF.textContent = '';
    const pth = (pts, close) => 'M' + pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') + (close ? 'Z' : '');
    const edges = new Map(), key = (p) => p.map((v) => Math.round(v * 1000)).join(',');
    for (const f of all) {
      const o = f.o, wire = o.mode === 'wire', pts = f.P.map((p) => this.P(p));
      if (f.op !== 0) {
        let fill = f.fill || F.gray; if (!wire && !f.flat) fill = shade(fill, 0.8 + 0.2 * Math.abs(vdot(f.n, LIGHT)));
        const strokeAll = !wire && !f.edges && f.stroke !== 'none', seam = !wire && f.edges && (f.op == null || f.op === 1);
        svgEl('path', { d: pth(pts, true), fill, 'fill-opacity': f.op ?? (wire ? 0.24 : 1), stroke: strokeAll ? f.stroke || o.stroke || INK : seam ? fill : 'none', 'stroke-width': strokeAll ? f.sw || o.sw || 2 : 1, 'stroke-linejoin': 'round' }, this.gF);
      }
      if (f.grid && (f.vis || !wire)) {
        const d = f.grid.map(([a, b]) => { const p = this.P(a), q = this.P(b); return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`; }).join('');
        svgEl('path', { d, stroke: f.gridColor || 'rgba(28,34,48,.35)', 'stroke-width': 1, fill: 'none' }, this.gF);
      }
      if (!wire && f.edges && f.stroke !== 'none') {
        const d = f.edges.map(([i, j]) => `M${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}L${pts[j][0].toFixed(1)} ${pts[j][1].toFixed(1)}`).join('');
        svgEl('path', { d, stroke: f.stroke || o.stroke || INK, 'stroke-width': f.sw || o.sw || 2, fill: 'none', 'stroke-linecap': 'round' }, this.gF);
      }
      if (wire && !f.noEdges) for (let i = 0; i < f.P.length; i++) {
        const j = (i + 1) % f.P.length, ka = key(f.P[i]), kb = key(f.P[j]), k = ka < kb ? ka + '|' + kb : kb + '|' + ka;
        const e = edges.get(k) || { a: pts[i], b: pts[j], vis: false, o }; e.vis = e.vis || f.vis; edges.set(k, e);
      }
    }
    if (edges.size) {
      const hid = [], vis = [];
      edges.forEach((e) => { if (Math.hypot(e.a[0] - e.b[0], e.a[1] - e.b[1]) < 0.5) return; (e.vis ? vis : hid).push(e); });
      const seg = (e) => `M${e.a[0].toFixed(1)} ${e.a[1].toFixed(1)}L${e.b[0].toFixed(1)} ${e.b[1].toFixed(1)}`;
      if (hid.length) svgEl('path', { d: hid.filter((e) => e.o.hidden !== false).map(seg).join(''), stroke: '#7d8391', 'stroke-width': 2, 'stroke-dasharray': '7 6', fill: 'none' }, this.gF);
      if (vis.length) svgEl('path', { d: vis.map(seg).join(''), stroke: INK, 'stroke-width': 2.6, 'stroke-linecap': 'round', fill: 'none' }, this.gF);
    }
    for (const L of this.lines) { const pts = (typeof L.at === 'function' ? L.at() : L.at).map((p) => this.P(p)); L.e.setAttribute('d', pth(pts, L.close)); }
    for (const L of this.labs) { const p = typeof L.at === 'function' ? L.at() : L.at, q = this.P(p); place(L.d, q[0], q[1], L.pos, L.gap); }
  }
}

/* ---------------- solids ---------------- */
/** a prism: base polygon (3-D points) pushed along dir. Faces b0, b1 (bases) and s0… (sides), outward-facing */
function prismFaces(base, dir) {
  const n = base.length, top = base.map((p) => vadd(p, dir));
  const fs = [{ P: base.slice(), role: 'base', id: 'b0' }, { P: top, role: 'base', id: 'b1' }];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; fs.push({ P: [base[i], base[j], top[j], top[i]], role: 'side', id: 's' + i }); }
  const C = cen(base.concat(top));
  fs.forEach((f) => { if (vdot(newell(f.P), vsub(cen(f.P), C)) < 0) f.P.reverse(); });
  return fs;
}
const circlePts = (r, z, N = 48, c = [0, 0]) => Array.from({ length: N }, (_, i) => [c[0] + r * Math.cos((2 * PI * i) / N), c[1] + r * Math.sin((2 * PI * i) / N), z]);
/** a sheet of width 2πr and height h rolled k of the way into a cylinder (k = 1 closed, 0 flat in the plane y = −r),
 *  touching the front line x = 0, y = −r. Optional lids hinged at the front line: dk = 1 closed, 0 opened flat. */
function tubeFaces(o) {
  const N = o.N || 60, r = o.r, H = o.h, C = 2 * PI * r, R = o.k > 1e-4 ? r / o.k : 0, sh = o.shift || [0, 0, 0];
  const at = (u) => (R ? [R * Math.sin(u / R), -r + R * (1 - Math.cos(u / R))] : [u, -r]);
  const P3 = (x, y, z) => [x + sh[0], y + sh[1], z + sh[2]];
  const fs = [];
  for (let j = 0; j < N; j++) {
    const [x0, y0] = at(-C / 2 + (j * C) / N), [x1, y1] = at(-C / 2 + ((j + 1) * C) / N), ed = [[0, 1], [2, 3]];
    if (j === 0) ed.push([3, 0]); if (j === N - 1) ed.push([1, 2]);
    fs.push({ P: [P3(x0, y0, 0), P3(x1, y1, 0), P3(x1, y1, H), P3(x0, y0, H)], fill: o.fill || F.curve, edges: ed, role: 'curve', op: o.op, stroke: o.stroke, sw: o.sw });
  }
  if (o.lids) for (const top of [true, false]) {
    const b = 90 * (1 - o.dk) * RAD, ey = Math.cos(b), ez = top ? Math.sin(b) : -Math.sin(b), c0 = [0, -r + r * Math.cos(b), top ? H + r * Math.sin(b) : -r * Math.sin(b)];
    const pts = []; for (let i = 0; i < N; i++) { const t = (2 * PI * i) / N; pts.push(P3(c0[0] + r * Math.cos(t), c0[1] + r * Math.sin(t) * ey, c0[2] + r * Math.sin(t) * ez)); }
    fs.push({ P: pts, fill: o.lidFill || F.base, role: top ? 'top' : 'bottom', c: P3(...c0), op: o.lidOp, stroke: o.stroke, sw: o.sw });
  }
  return fs;
}
/** the point on a tube's sheet at arc length u (from the front line) and height z */
function tubeAt(o, u, z) { const r = o.r, R = o.k > 1e-4 ? r / o.k : 0, sh = o.shift || [0, 0, 0]; const [x, y] = R ? [R * Math.sin(u / R), -r + R * (1 - Math.cos(u / R))] : [u, -r]; return [x + sh[0], y + sh[1], z + sh[2]]; }
function lidCentre(o, top) { const b = 90 * (1 - o.dk) * RAD, sh = o.shift || [0, 0, 0]; return [sh[0], -o.r + o.r * Math.cos(b) + sh[1], (top ? o.h + o.r * Math.sin(b) : -o.r * Math.sin(b)) + sh[2]]; }
/** a net (2-D faces on the table, z = 0) folded up about its hinges by fraction f (1 = folded, 0 = flat) */
function foldNet(net, f) {
  const by = {}, Tm = {}; net.forEach((x) => (by[x.id] = x));
  const get = (id) => {
    if (Tm[id]) return Tm[id];
    const fc = by[id]; if (!fc.parent) return (Tm[id] = (p) => p);
    const a = [fc.hinge[0][0], fc.hinge[0][1], 0], b = [fc.hinge[1][0], fc.hinge[1][1], 0], k = vunit(vsub(b, a));
    if (fc.sg == null) { const c = cen(fc.pts.map((q) => [q[0], q[1], 0])); fc.sg = rotAxis(c, a, k, 0.02)[2] > 0 ? 1 : -1; }
    const th = fc.sg * fc.ang * RAD * f, par = get(fc.parent);
    return (Tm[id] = (p) => par(rotAxis(p, a, k, th)));
  };
  const out = {}; net.forEach((fc) => { const g = get(fc.id); out[fc.id] = fc.pts.map((q) => g([q[0], q[1], 0])); }); return out;
}

/* ---------------- panels and lines ---------------- */
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u10l3-panel', title ? `<div class="u10l3-ph">${title}</div>` : ''), w, hh), x, y);
const line = (P, html, cls = '') => { const d = h('div', 'u10l3-line ' + cls, html); d.style.opacity = 0; P.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
async function say(c, P, html, cls) { const d = line(P, html, cls); await show(c, d); return d; }
function stampAt(P, text, ok = true) { const s = stamp(P, text, { ok, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = '6px'; s.style.opacity = 0; return s; }
async function cancelSwap(c, el, texB) { await sleep(c, 250); el.innerHTML = T(texB); await pulse(c, el, 1.06); }
const DIM = 'u10l3-dim', AREA = 'u10l3-area';
const cm = (s) => T(s + '\\ \\text{cm}');

/* =============================== static figures (booklet TikZ) =============================== */
/** items: { l: [[x,y]…], dash, close } · { ell: [cx,cy,rx,ry] } · { arc: [cx,cy,rx,ry,a0,a1], dash } · { circ: [cx,cy,r] } · { dot: [x,y] }
 *  { arr: [[x,y],[x,y]], both } · { lab: [x,y], html, at: 'c'|'below'|'above'|'left'|'right'|'below right', fill }. u = px per TikZ unit */
function tikz(host, items, o = {}) {
  const u = o.u || 60, pad = o.pad ?? 16, xs = [], ys = [];
  items.forEach((it) => {
    if (it.l) it.l.forEach((p) => { xs.push(p[0]); ys.push(p[1]); });
    if (it.arr) it.arr.forEach((p) => { xs.push(p[0]); ys.push(p[1]); });
    const e = it.ell || it.arc || (it.circ && [it.circ[0], it.circ[1], it.circ[2], it.circ[2]]); if (e) { xs.push(e[0] - e[2], e[0] + e[2]); ys.push(e[1] - e[3], e[1] + e[3]); }
  });
  const ex = o.extra || [0, 0, 0, 0]; // extra room [left, right, bottom, top] in units, for labels
  const x0 = Math.min(...xs) - ex[0], x1 = Math.max(...xs) + ex[1], y0 = Math.min(...ys) - ex[2], y1 = Math.max(...ys) + ex[3];
  const W = (x1 - x0) * u + 2 * pad, H = (y1 - y0) * u + 2 * pad, X = (x) => pad + (x - x0) * u, Y = (y) => pad + (y1 - y) * u;
  const wrap = box(h('div', 'u10l3-tk'), W, H); host.appendChild(wrap);
  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, wrap);
  const st = (it) => ({ fill: 'none', stroke: INK, 'stroke-width': it.w || 2.2, 'stroke-dasharray': it.dash ? '6 5' : null, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
  items.forEach((it) => {
    if (it.l) svgEl('path', { d: 'M' + it.l.map((p) => X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('L') + (it.close ? 'Z' : ''), ...st(it) }, svg);
    if (it.ell) svgEl('ellipse', { cx: X(it.ell[0]), cy: Y(it.ell[1]), rx: it.ell[2] * u, ry: it.ell[3] * u, ...st(it) }, svg);
    if (it.circ) svgEl('circle', { cx: X(it.circ[0]), cy: Y(it.circ[1]), r: it.circ[2] * u, ...st(it) }, svg);
    if (it.arc) {
      const [cx, cy, rx, ry, a0, a1] = it.arc, p = (a) => [X(cx + rx * Math.cos(a * RAD)), Y(cy + ry * Math.sin(a * RAD))], [sx, sy] = p(a0), [ex2, ey2] = p(a1);
      svgEl('path', { d: `M${sx} ${sy}A${rx * u} ${ry * u} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 0 ${ex2} ${ey2}`, ...st(it) }, svg);
    }
    if (it.dot) svgEl('circle', { cx: X(it.dot[0]), cy: Y(it.dot[1]), r: 3.2, fill: INK }, svg);
    if (it.arr) {
      const [a, b] = it.arr, ax = X(a[0]), ay = Y(a[1]), bx = X(b[0]), by = Y(b[1]);
      svgEl('path', { d: `M${ax} ${ay}L${bx} ${by}`, ...st(it), 'stroke-width': 1.8 }, svg);
      const head = (px, py, dx, dy) => { const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L; svgEl('path', { d: `M${px} ${py}L${px - 11 * ux + 5 * uy} ${py - 11 * uy - 5 * ux}L${px - 11 * ux - 5 * uy} ${py - 11 * uy + 5 * ux}Z`, fill: INK }, svg); };
      head(ax, ay, ax - bx, ay - by); if (it.both) head(bx, by, bx - ax, by - ay);
    }
    if (it.lab) {
      const d = h('div', 'u10l3-tkl' + (it.fill ? ' u10l3-tkf' : ''), it.html), at = it.at || 'c';
      const pos = { c: 'c', below: 's', above: 'n', left: 'w', right: 'e', 'below right': 'se', 'above right': 'ne' }[at];
      wrap.appendChild(d); place(d, X(it.lab[0]), Y(it.lab[1]), pos, 2);
    }
  });
  return wrap;
}
/* the booklet's prisms: front face A…, back face A'…; hidden edges dashed */
const triPrism = (A, B, C, Ap, Bp, Cp, extra = []) => [{ l: [A, Ap], dash: true }, { l: [Ap, Bp], dash: true }, { l: [Ap, Cp], dash: true }, { l: [A, B, C], close: true }, { l: [B, Bp] }, { l: [C, Cp] }, { l: [Bp, Cp] }, ...extra];
const boxPrism = (A, B, C, D, Ap, Bp, Cp, Dp, extra = []) => [{ l: [Ap, A], dash: true }, { l: [Ap, Bp], dash: true }, { l: [Ap, Dp], dash: true }, { l: [A, B, C, D], close: true }, { l: [B, Bp, Cp, C] }, { l: [D, Dp, Cp] }, ...extra];
const cylFig = (top, rx, ry, extra = []) => [{ ell: [0, top, rx, ry] }, { l: [[-rx, top], [-rx, 0]] }, { l: [[rx, top], [rx, 0]] }, { arc: [0, 0, rx, ry, 180, 360] }, { arc: [0, 0, rx, ry, 0, 180], dash: true }, ...extra];
const L = (x, y, html, at, fill) => ({ lab: [x, y], html, at, fill });

function mountStatics() {
  const q = (id) => document.getElementById(id);
  // Section 1 gallery
  if (q('u10l3-g1')) tikz(q('u10l3-g1'), triPrism([0, 0], [0, 1.5], [1.1, 0], [0.75, 0.45], [0.75, 1.95], [1.85, 0.45]), { u: 80 });
  if (q('u10l3-g2')) tikz(q('u10l3-g2'), boxPrism([0, 0], [1.7, 0], [1.7, 1.05], [0, 1.05], [0.75, 0.45], [2.45, 0.45], [2.45, 1.5], [0.75, 1.5]), { u: 80 });
  if (q('u10l3-g3')) tikz(q('u10l3-g3'), boxPrism([0, 0], [1.3, 0], [1.3, 1.3], [0, 1.3], [0.7, 0.42], [2.0, 0.42], [2.0, 1.72], [0.7, 1.72]), { u: 80 });
  // Example 1
  if (q('u10l3-ex1fig')) tikz(q('u10l3-ex1fig'), triPrism([0, 0], [0, 3.36], [2.52, 0], [1.7, 1.0], [1.7, 4.36], [4.22, 1.0], [
    { l: [[0, 0.3], [0.3, 0.3], [0.3, 0]], w: 1.6 },
    L(-0.05, 1.68, cm('12'), 'left'), L(1.26, -0.05, cm('9'), 'below'), L(0.62, 2.7, cm('15'), 'right', true), L(3.37, 0.52, cm('11'), 'below right')]), { u: 66, extra: [1.1, 0.9, 0.4, 0] });
  // Example 2
  if (q('u10l3-ex2fig')) tikz(q('u10l3-ex2fig'), boxPrism([0, 0], [3, 0], [3, 1.8], [0, 1.8], [1.7, 1], [4.7, 1], [4.7, 2.8], [1.7, 2.8], [
    L(1.5, -0.05, cm('20'), 'below'), L(-0.05, 0.9, cm('12'), 'left'), L(3.9, 0.45, cm('15'), 'below right')]), { u: 62, extra: [1.1, 0.6, 0.4, 0] });
  // Example 3: the net, with tap-to-reveal blanks
  const blank = (t) => `<span class="u10l3-blank" data-reveal="______">${T(t)}</span>`;
  if (q('u10l3-ex3fig')) tikz(q('u10l3-ex3fig'), [
    { circ: [0, 8, 1] }, { dot: [0, 8] }, L(0.35, 8.35, T('r')), L(1.35, 8, T('A_{\\text{circle}}=') + ' ' + blank('\\pi r^{2}'), 'right'),
    { l: [[-1, 6.3], [5.3, 6.3], [5.3, 4.6], [-1, 4.6]], close: true }, L(2.15, 5.45, 'height ' + T('=h')),
    L(5.7, 5.75, T('A_{\\text{rect}}=l\\times w'), 'right'), L(5.7, 5.2, T('=') + ' ' + blank('2\\pi rh'), 'right'),
    { arr: [[-1, 4.2], [5.3, 4.2]], both: true }, L(2.15, 3.75, 'circumference ' + T('=') + ' ' + blank('2\\pi r')),
    { circ: [0, 1.7, 1] }, { dot: [0, 1.7] }, L(1.35, 1.7, T('A_{\\text{circle}}=') + ' ' + blank('\\pi r^{2}'), 'right')
  ], { u: 50, extra: [0, 4.6, 0, 0] });
  // Example 4
  if (q('u10l3-ex4fig')) tikz(q('u10l3-ex4fig'), cylFig(3.9, 1.3, 0.35, [{ dot: [0, 0] }, { arr: [[-1.3, -0.15], [1.3, -0.15]], both: true },
    L(0, -0.55, T('d=8.4\\ \\text{cm}'), 'below'), L(1.45, 1.95, T('h=12.6\\ \\text{cm}'), 'right')]), { u: 62, extra: [0.2, 2.6, 1.0, 0] });
  // Example 5
  if (q('u10l3-ex5fig')) tikz(q('u10l3-ex5fig'), boxPrism([0, 0], [1.4, 0], [1.4, 1.4], [0, 1.4], [1, 0.59], [2.4, 0.59], [2.4, 1.99], [1, 1.99], [
    L(0.7, -0.05, T('s'), 'below'), L(-0.05, 0.7, T('s'), 'left')]), { u: 70, extra: [0.4, 0.2, 0.4, 0] });
  // Example 6
  if (q('u10l3-ex6fig')) tikz(q('u10l3-ex6fig'), triPrism([0, 0], [0, 1.8], [2.1, 0], [1.7, 1], [1.7, 2.8], [3.8, 1], [
    { l: [[0, 0.3], [0.3, 0.3], [0.3, 0]], w: 1.6 },
    L(-0.05, 0.9, cm('3.6'), 'left'), L(1.05, -0.05, cm('4.2'), 'below'), L(3.2, 0.45, T('L=?'), 'below right')]), { u: 70, extra: [1.3, 0.5, 0.4, 0] });
  // Example 7
  if (q('u10l3-ex7fig')) tikz(q('u10l3-ex7fig'), cylFig(3.3, 0.55, 0.3, [
    L(0.7, 1.65, T('h=21.5\\ \\text{in}'), 'right'), { arr: [[0, 3.6], [0, 4.1]] }, L(0, 4.1, 'circumference ' + T('=3.75\\ \\text{in}'), 'above')]), { u: 66, extra: [2.2, 2.4, 0.2, 0.6] });
  // warm-up board: the sheet and the two tubes, to scale
  const wf = q('u10l3-wfig');
  if (wf) {
    const S = new Scene3(wf, { width: 540, height: 330 }), rT = 21.6 / (2 * PI), rS = 27.9 / (2 * PI);
    S.obj({ mode: 'solid', faces: () => [{ P: [[-10.8, 0, 0], [10.8, 0, 0], [10.8, 0, 27.9], [-10.8, 0, 27.9]], fill: F.paper, stroke: AMB, flat: true }] });
    const tall = { r: rT, h: 27.9, k: 1, fill: F.paper, stroke: AMB, shift: [-24, 6, 0] }, shrt = { r: rS, h: 21.6, k: 1, fill: F.paper, stroke: AMB, shift: [25, 6, 0] };
    S.obj({ mode: 'solid', faces: () => tubeFaces(tall) }); S.obj({ mode: 'solid', faces: () => tubeFaces(shrt) });
    S.setCam(S.fit(S.points(), 0, 14, { pad: 20, padY: 34 }));
    S.label([0, 0, 0], cm('21.6'), { pos: 's', cls: DIM }); S.label([10.8, 0, 13.95], cm('27.9'), { pos: 'e', cls: DIM });
    S.label([-24, 6 - rT, 0], 'tall tube', { pos: 's', cls: 'u10l3-cap' }); S.label([25, 6 - rS, 0], 'short tube', { pos: 's', cls: 'u10l3-cap' });
    S.render();
  }
}

/* =============================== warm-up explainer: roll it two ways =============================== */
const rollit = {
  title: 'One sheet, two tubes',
  height: 470,
  intro: 'Two copies of the same sheet of paper. Press <b>Next</b>.',
  make(stage, v, ex) {
    const H = ex.def.height, PW = 330, rT = 21.6 / (2 * PI), rS = 27.9 / (2 * PI), VT = PI * rT * rT * 27.9, VS = PI * rS * rS * 21.6;
    const S = new Scene3(stage, { x: 0, y: 0, width: ex.W - PW - 20, height: H });
    const P = panel(stage, ex.W - PW - 10, 14, PW, H - 28, 'Same paper?');
    const A = { r: rT, h: 27.9, k: 0, fill: F.paper, stroke: AMB, shift: [-16, 0, 0] }, B = { r: rS, h: 21.6, k: 0, fill: F.paper, stroke: AMB, shift: [16, 0, 0] };
    const RA = { r: rT * 0.97, h: 0, k: 1, lids: true, dk: 1, fill: F.rice, lidFill: F.rice, stroke: '#b89a4a', sw: 1.2, shift: [-16, 0.03 * rT, 0] };
    const RB = { r: rS * 0.97, h: 0, k: 1, lids: true, dk: 1, fill: F.rice, lidFill: F.rice, stroke: '#b89a4a', sw: 1.2, shift: [16, 0.03 * rS, 0] };
    const rice = (R) => ({ mode: 'solid', faces: () => (R.h > 0.05 ? tubeFaces(R).filter((f) => f.role !== 'bottom') : []) });
    S.obj(rice(RA)); S.obj(rice(RB));
    S.obj({ mode: 'solid', faces: () => tubeFaces(A) }); S.obj({ mode: 'solid', faces: () => tubeFaces(B) });
    const fitAt = (ka, kb, elev) => { const a = A.k, b = B.k; A.k = ka; B.k = kb; const p = S.points(); A.k = a; B.k = b; return S.fit(p, 0, elev, { pad: elev ? 70 : 26, padY: 40 }); };
    const camFlat = fitAt(0, 0, 0), camRolled = fitAt(1, 1, 18);
    S.setCam(camFlat);
    const lab = (at, html, pos, cls = DIM) => S.label(at, html, { pos, cls, hide: true });
    const dA1 = lab(() => tubeAt(A, 0, 0), cm('21.6'), 's'), dA2 = lab(() => tubeAt(A, 21.6 / 2 - (21.6 / 4) * A.k, 13.95), cm('27.9'), 'w');
    const dB1 = lab(() => tubeAt(B, 0, 0), cm('27.9'), 's'), dB2 = lab(() => tubeAt(B, 27.9 / 2 - (27.9 / 4) * B.k, 10.8), cm('21.6'), 'w');
    const rlA = S.line(() => [vadd(A.shift, [0, 0, 27.9]), vadd(A.shift, [rT, 0, 27.9])], { color: RED, width: 3, hide: true });
    const rlB = S.line(() => [vadd(B.shift, [0, 0, 21.6]), vadd(B.shift, [rS, 0, 21.6])], { color: RED, width: 3, hide: true });
    const rA = lab(() => vadd(A.shift, [rT / 2, 0, 27.9]), T('3.44'), 'n', 'u10l3-rl'), rB = lab(() => vadd(B.shift, [rS / 2, 0, 21.6]), T('4.44'), 'n', 'u10l3-rl');
    const vA = lab(() => vadd(A.shift, [0, -rT, 0]), T('\\approx' + fx(VT, 0) + '\\ \\text{cm}^3'), 's', 'u10l3-vol'), vB = lab(() => vadd(B.shift, [0, -rS, 0]), T('\\approx' + fx(VS, 0) + '\\ \\text{cm}^3'), 's', 'u10l3-vol');
    const pct = lab(() => vadd(B.shift, [rS, 0, 21.6 * VT / VS]), T('\\approx77\\%'), 'e', 'u10l3-rl');
    S.render();
    return [
      { cap: `Two copies of one sheet, <b>21.6 cm by 27.9 cm</b>. The second one is turned sideways.`,
        run: async (c) => { for (const d of [dA1, dA2, dB1, dB2]) await pop(c, d); } },
      { cap: `Roll the first one the <b>tall</b> way: the 21.6 cm side goes <b>around</b>, and 27.9 cm is the <b>height</b>.`,
        run: async (c) => { const a = { ...S.cam }, mid = fitAt(1, 0, 10); await tween(c, 1500, (t) => { A.k = t; for (const k in mid) S.cam[k] = a[k] + (mid[k] - a[k]) * t; S.render(); }); } },
      { cap: `Roll the second one the <b>short</b> way: the 27.9 cm side goes <b>around</b>, and 21.6 cm is the <b>height</b>.`,
        run: async (c) => { const a = { ...S.cam }; await tween(c, 1500, (t) => { B.k = t; for (const k in camRolled) S.cam[k] = a[k] + (camRolled[k] - a[k]) * t; S.render(); }); } },
      { cap: `Same paper: each curved surface is ${T('21.6\\times27.9\\approx603\\ \\text{cm}^2')}. But the radii differ: ${T('r=\\frac{21.6}{2\\pi}\\approx3.44')} cm and ${T('r=\\frac{27.9}{2\\pi}\\approx4.44')} cm.`,
        run: async (c) => {
          await appear(c, rlA); await pop(c, rA); await appear(c, rlB); await pop(c, rB);
          await say(c, P, `Tall: ${T('r\\approx3.44,\\ h=27.9')}`); await say(c, P, `Short: ${T('r\\approx4.44,\\ h=21.6')}`);
        } },
      { cap: `Fill both with rice. ${T('V=\\pi r^{2}h')}: tall ${T('\\approx' + fx(VT, 0) + '\\ \\text{cm}^3')}, short ${T('\\approx' + fx(VS, 0) + '\\ \\text{cm}^3')}. The squared radius beats the extra height.`,
        run: async (c) => {
          for (const o of [A, B]) o.op = 0.55;
          await tween(c, 1400, (t) => { RA.h = 27.9 * t; RB.h = 21.6 * t; S.render(); });
          await pop(c, vA); await pop(c, vB);
          await say(c, P, `Tall: ${T('\\pi(3.44)^2(27.9)\\approx' + fx(VT, 0))}`); await say(c, P, `Short: ${T('\\pi(4.44)^2(21.6)\\approx' + fx(VS, 0))}`);
        } },
      { cap: `Pour the tall tube’s rice into the short tube: it only fills it about <b>77%</b> of the way (${T(fx(VT, 0) + '\\div' + fx(VS, 0) + '\\approx0.77')}). <b>B wins</b>: same surface, more space inside.`,
        run: async (c) => {
          await tween(c, 1300, (t) => { RA.h = 27.9 * (1 - t); RB.h = 21.6 * (1 - (1 - VT / VS) * t); S.render(); });
          await pop(c, pct);
          await say(c, P, T('\\dfrac{' + fx(VT, 0) + '}{' + fx(VS, 0) + '}\\approx0.77'), 'u10l3-big');
          const s = stampAt(P, 'B: short tube ✓'); await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== 1. right prisms =============================== */
const PRISMS = {
  tri: { label: 'Triangular prism', base: [[0, 0], [5, 0], [0, 6]], d: 7, name: 'triangle', sides: 3 },
  rect: { label: 'Rectangular prism', base: [[0, 0], [8, 0], [8, 5], [0, 5]], d: 6, name: 'rectangle', sides: 4 },
  cube: { label: 'Cube', base: [[0, 0], [6, 0], [6, 6], [0, 6]], d: 6, name: 'square', sides: 4 },
  obl: { label: 'Pushed at a slant', base: [[0, 0], [7, 0], [7, 5], [0, 5]], d: 6, slant: 3.2, name: 'rectangle', sides: 4, oblique: true }
};
const prisms = {
  title: 'A right prism is a base pushed straight back',
  height: 460,
  choices: Object.keys(PRISMS).map((k) => ({ v: k, label: PRISMS[k].label })),
  intro: 'Watch a base turn into a prism. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = PRISMS[k], H = ex.def.height, PW = 320;
    const S = new Scene3(stage, { x: 0, y: 0, width: ex.W - PW - 20, height: H });
    const P = panel(stage, ex.W - PW - 10, 14, PW, H - 28, 'Faces');
    const st = { t: 0, hi: -1 }, base = d.base.map(([x, z]) => [x, 0, z]), dir = (t) => [(d.slant || 0) * t, d.d * t, 0];
    S.obj({ mode: 'wire', faces: () => {
      if (st.t < 0.004) return [{ P: base.slice(), fill: F.base, op: 0.5, always: true }];
      return prismFaces(base, dir(st.t)).map((f) => ({ ...f, fill: f.role === 'base' ? F.base : st.hi === 99 || f.id === 's' + st.hi ? F.hi : F.side, op: f.role === 'base' ? 0.45 : 0.32 }));
    } });
    st.t = 1; S.setCam(S.fit(S.points(), -32, 20, { pad: 50 })); st.t = 0;
    const lb0 = S.label(cen(base), 'base', { cls: 'u10l3-tag', hide: true });
    const lb1 = S.label(() => vadd(cen(base), dir(st.t)), 'base', { cls: 'u10l3-tag', hide: true });
    const hEdge = () => [base[1], vadd(base[1], dir(st.t))];
    const lh = S.label(() => vmid(...hEdge()), T('h'), { pos: 'se', cls: DIM, hide: true });
    // right-angle marks: at base[1], between the base edge to base[2] and the push direction
    const mark = (i, j) => () => { const v = base[i], e1 = vmul(vunit(vsub(base[j], base[i])), 0.8), e2 = vmul(vunit(dir(1)), 0.8); return [vadd(v, e1), vadd(vadd(v, e1), e2), vadd(v, e2)]; };
    const m1 = S.line(mark(1, 2), { color: RED, width: 2.6, hide: true }), m2 = S.line(mark(2, 1), { color: RED, width: 2.6, hide: true });
    const ghost = S.line(() => [base[1], vadd(base[1], [0, d.d, 0])], { color: RED, width: 2.4, dash: true, hide: true });
    S.render();
    const sideWord = d.oblique ? 'parallelogram' : d.name === 'square' ? 'square' : 'rectangular';
    return [
      { cap: `Start with a <b>${d.name}</b>. This flat shape will be the <b>base</b>.`, run: (c) => pop(c, lb0) },
      { cap: d.oblique ? `This time push it back <b>at a slant</b>, not straight back.` : `<b>Push it straight back.</b> As it slides, the base sweeps out a prism.`,
        run: async (c) => { await tween(c, 1500, (t) => { st.t = t; S.render(); }); await pop(c, lh); } },
      { cap: `Front and back: the <b>two congruent, parallel bases</b>, both copies of the ${d.name}.${k === 'cube' ? ' (In a cube, any two opposite faces could be the bases.)' : ''}`,
        run: async (c) => { await pop(c, lb1); await say(c, P, `<b>2</b> bases (${d.name}s)`); } },
      { cap: `One side face for each side of the ${d.name}: <b>${d.sides} ${sideWord} faces</b>.`,
        run: async (c) => {
          for (let i = 0; i < d.sides; i++) { st.hi = i; S.render(); await sleep(c, 420); }
          st.hi = -1; S.render();
          await say(c, P, `<b>${d.sides}</b> ${sideWord} side faces`); await say(c, P, `<b>${2 + d.sides}</b> faces in all`, 'u10l3-big');
        } },
      d.oblique
        ? { cap: `The sides lean, so they do <b>not</b> meet the base at a right angle: this is <b>not a right prism</b>. Its height ${T('h')} is the straight distance between the bases (dashed), not the slanted edge.`,
          run: async (c) => { await appear(c, ghost); const s = stampAt(P, 'not a right prism', false); await stampIn(c, s); } }
        : { cap: `Every side face meets the base at a <b>right angle</b> (red marks), so the sides are rectangles: a <b>right prism</b>.`,
          run: async (c) => { await appear(c, m1); await appear(c, m2); const s = stampAt(P, 'right prism ✓'); await stampIn(c, s); } },
      { cap: `Turn it around. However it sits, the volume is the base area times the distance between the bases: ${T('V_{\\text{Prism}}=A_{\\text{Base}}\\times h')}.`,
        run: async (c) => {
          await say(c, P, T('V_{\\text{Prism}}=A_{\\text{Base}}\\times h'), 'u10l3-big');
          const y0 = S.cam.yaw; await S.camTo(c, { yaw: y0 + 60 }, 1300); await S.camTo(c, { yaw: y0 }, 1300);
        } }
    ];
  }
};

/* =============================== 2. volume = layers =============================== */
const LAY = {
  tri: { label: 'Example 1 check: 54 × 11' },
  box: { label: 'Example 2(a) check: blocks' },
  cyl: { label: 'Example 4 check: πr² × h' }
};
const layers = {
  title: 'Volume: stack layers of the base',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(LAY).map((k) => ({ v: k, label: LAY[k].label })),
  intro: 'Each layer is 1 unit thick. Press <b>Next</b>.',
  make(stage, k, ex) {
    const H = ex.def.height, PW = 330;
    const S = new Scene3(stage, { x: 0, y: 0, width: ex.W - PW - 20, height: H });
    const P = panel(stage, ex.W - PW - 10, 14, PW, H - 28, 'Layer by layer');
    const st = { n: 0 };
    let base, along, total, A, unit, yaw, elev, gridOf = null, sideFill = F.side, labels = [];
    if (k === 'tri') { base = [[0, 0, 0], [9, 0, 0], [0, 0, 12]]; along = [0, 1, 0]; total = 11; A = 54; unit = '\\text{cm}^3'; yaw = -38; elev = 18; }
    else if (k === 'box') {
      base = [[0, 0, 0], [20, 0, 0], [20, 15, 0], [0, 15, 0]]; along = [0, 0, 1]; total = 12; A = 300; yaw = -30; elev = 26;
      gridOf = (f, z0, t, isTop) => {
        const g = [];
        if (f.id === 's0') for (let x = 1; x < 20; x++) g.push([[x, 0, z0], [x, 0, z0 + t]]);
        if (f.id === 's1') for (let y = 1; y < 15; y++) g.push([[20, y, z0], [20, y, z0 + t]]);
        if (f.id === 'b1' && isTop) { for (let x = 1; x < 20; x++) g.push([[x, 0, z0 + t], [x, 15, z0 + t]]); for (let y = 1; y < 15; y++) g.push([[0, y, z0 + t], [20, y, z0 + t]]); }
        return g;
      };
    } else { base = circlePts(4.2, 0, 48); along = [0, 0, 1]; total = 12.6; A = PI * 4.2 * 4.2; yaw = 0; elev = 24; sideFill = F.curve; }
    const slabs = () => {
      const out = [], n = st.n;
      if (n < 0.004) {
        const f = { P: base.slice(), fill: F.base, always: true, id: 'b1' };
        if (gridOf) f.grid = gridOf(f, 0, 0, true);
        return [f];
      }
      for (let i = 0; i < Math.ceil(n - 1e-9); i++) {
        const t = Math.min(1, n - i), fs = prismFaces(base.map((p) => vadd(p, vmul(along, i))), vmul(along, t));
        fs.forEach((f) => {
          f.fill = f.role === 'base' ? F.base : sideFill;
          if (k === 'cyl' && f.role === 'side') f.edges = [[0, 1], [2, 3]];
          if (gridOf) f.grid = gridOf(f, i, t, i === Math.ceil(n - 1e-9) - 1);
          out.push(f);
        });
      }
      return out;
    };
    S.obj({ mode: 'solid', faces: slabs });
    st.n = total; S.setCam(S.fit(S.points(), yaw, elev, { pad: 46 })); st.n = 0;
    if (k === 'tri') labels = [S.label([4.5, 0, 0], cm('9'), { pos: 's', cls: DIM, hide: true }), S.label([0, 0, 6], cm('12'), { pos: 'w', cls: DIM, hide: true }), S.label([9, 5.5, 0], cm('11'), { pos: 'se', cls: DIM, hide: true })];
    if (k === 'box') labels = [S.label([10, 0, 0], cm('20'), { pos: 's', cls: DIM, hide: true }), S.label([20, 7.5, 0], cm('15'), { pos: 'se', cls: DIM, hide: true }), S.label([0, 0, 6], cm('12'), { pos: 'w', cls: DIM, hide: true })];
    if (k === 'cyl') labels = [S.label([2.1, 0, 0], T('r=4.2'), { pos: 'n', cls: DIM, hide: true }), S.label([4.2, 0, 6.3], cm('12.6'), { pos: 'e', cls: DIM, hide: true })];
    const rline = k === 'cyl' ? S.line([[0, 0, 0], [4.2, 0, 0]], { color: RED, width: 3, hide: true }) : null;
    S.render();
    const cnt = line(P, '', 'u10l3-count'); const vol = line(P, '', 'u10l3-big');
    const Atex = k === 'cyl' ? '55.42' : String(A);
    const setCnt = () => {
      const n = st.n, whole = Math.abs(n - Math.round(n)) < 1e-6;
      cnt.innerHTML = `<b>${whole ? Math.round(n) : nf(n, 1)}</b> layer${n === 1 ? '' : 's'}`;
      vol.innerHTML = T(k === 'cyl' ? 'V\\approx' + fx(A * n, 2) + '\\ \\text{cm}^3' : 'V=' + thin(String(Math.round(A * n))) + '\\ \\text{cm}^3');
    };
    const grow = async (c, to, each = 150) => { const from = Math.floor(st.n + 1e-9); for (let i = from + 1; i <= Math.floor(to + 1e-9); i++) { const a = st.n; await tween(c, each, (t) => { st.n = a + (i - a) * t; S.render(); setCnt(); }); } if (to > st.n + 1e-9) { const a = st.n; await tween(c, 500, (t) => { st.n = a + (to - a) * t; S.render(); setCnt(); }); } };
    const startCount = async (c) => { setCnt(); P.append(cnt, vol); await show(c, cnt); await show(c, vol); };
    if (k === 'tri') return [
      { cap: `The base is the right triangle: ${T('A_{\\text{Base}}=\\tfrac12(9)(12)=54\\ \\text{cm}^2')}.`,
        run: async (c) => { await pop(c, labels[0]); await pop(c, labels[1]); await say(c, P, T('A_{\\text{Base}}=54\\ \\text{cm}^2')); } },
      { cap: `A slice of the prism <b>1 cm thick</b> is a copy of the base: it holds ${T('54\\ \\text{cm}^3')}.`,
        run: async (c) => { await startCount(c); await grow(c, 1, 600); } },
      { cap: `Keep slicing to the back. The prism is <b>11 cm long</b>, so there are <b>11 slices</b>.`,
        run: async (c) => { await grow(c, 11, 170); await pop(c, labels[2]); } },
      { cap: `${T('V=A_{\\text{Base}}\\times h=54\\times11=594\\ \\text{cm}^3')}. Same as Example 1(b).`,
        run: async (c) => { await say(c, P, T('54\\times11=594\\ \\text{cm}^3'), 'u10l3-big u10l3-ok'); const s = stampAt(P, '594 cm³ ✓'); await stampIn(c, s); } }
    ];
    if (k === 'box') return [
      { cap: `The floor of the box is the base: ${T('20\\times15=300\\ \\text{cm}^2')}. That is <b>300</b> of the 1 cm blocks.`,
        run: async (c) => { await pop(c, labels[0]); await pop(c, labels[1]); await say(c, P, T('A_{\\text{Base}}=20\\times15=300')); } },
      { cap: `One layer of blocks, 1 cm high: <b>300 blocks</b> = ${T('300\\ \\text{cm}^3')}.`,
        run: async (c) => { await startCount(c); await grow(c, 1, 600); } },
      { cap: `Stack layers up to the height, <b>12 cm</b>: 12 layers of 300.`,
        run: async (c) => { await grow(c, 12, 190); await pop(c, labels[2]); } },
      { cap: `${T('V=300\\times12=3\\,600\\ \\text{cm}^3')}: exactly the number of 1 cm blocks that fit.`,
        run: async (c) => { await say(c, P, T('300\\times12=3\\,600\\ \\text{cm}^3'), 'u10l3-big u10l3-ok'); const s = stampAt(P, '3 600 blocks ✓'); await stampIn(c, s); } }
    ];
    return [
      { cap: `The base is a circle. Halve the diameter: ${T('r=8.4\\div2=4.2')} cm, so ${T('A_{\\text{Base}}=\\pi(4.2)^2=17.64\\pi\\approx55.42\\ \\text{cm}^2')}.`,
        run: async (c) => { await appear(c, rline); await pop(c, labels[0]); await say(c, P, T('A_{\\text{Base}}=17.64\\pi\\approx55.42')); } },
      { cap: `One layer 1 cm thick holds about ${T('55.42\\ \\text{cm}^3')}.`,
        run: async (c) => { await startCount(c); await grow(c, 1, 600); } },
      { cap: `Stack <b>12 full layers</b>: ${T('12\\times17.64\\pi=211.68\\pi\\approx665.01\\ \\text{cm}^3')} so far…`,
        run: async (c) => { await grow(c, 12, 160); } },
      { cap: `…and the height is 12.6 cm, so the last layer is only <b>0.6 of a layer</b>: 12.6 layers in all.`,
        run: async (c) => { await grow(c, 12.6); await pop(c, labels[1]); } },
      { cap: `${T('V=\\pi r^{2}h=\\pi(4.2)^2(12.6)=222.264\\pi\\approx698.3\\ \\text{cm}^3')}. Keep ${T('\\pi')} exact until this last step.`,
        run: async (c) => { await say(c, P, T('222.264\\pi\\approx698.3\\ \\text{cm}^3'), 'u10l3-big u10l3-ok'); const s = stampAt(P, '698.3 cm³ ✓'); await stampIn(c, s); } }
    ];
  }
};

/* =============================== 2. surface area = the net =============================== */
const HYP = 180 - Math.atan2(12, 9) / RAD;
const NETS = {
  tri: {
    label: 'Example 1 check', yaw: -32, elev: 22,
    faces: [
      { id: 'bot', pts: [[0, 0], [9, 0], [9, 11], [0, 11]], fill: F.side },
      { id: 'front', parent: 'bot', hinge: [[0, 0], [9, 0]], ang: 90, pts: [[0, 0], [9, 0], [0, -12]], fill: F.base },
      { id: 'back', parent: 'bot', hinge: [[0, 11], [9, 11]], ang: 90, pts: [[0, 11], [9, 11], [0, 23]], fill: F.base },
      { id: 'left', parent: 'bot', hinge: [[0, 0], [0, 11]], ang: 90, pts: [[0, 0], [0, 11], [-12, 11], [-12, 0]], fill: F.side },
      { id: 'hyp', parent: 'bot', hinge: [[9, 0], [9, 11]], ang: HYP, pts: [[9, 0], [24, 0], [24, 11], [9, 11]], fill: F.side }
    ],
    dims: (cur) => [[vmid(cur.bot[0], cur.bot[1]), cm('9'), 's'], [vmid(cur.front[0], cur.front[2]), cm('12'), 'w'], [vmid(cur.front[1], cur.front[2]), cm('15'), 'ne'], [vmid(cur.hyp[0], cur.hyp[3]), cm('11'), 'se']]
  },
  box: {
    label: 'A box: the Example 2 container', yaw: -30, elev: 24,
    faces: [
      { id: 'bot', pts: [[0, 0], [20, 0], [20, 15], [0, 15]], fill: F.base },
      { id: 'front', parent: 'bot', hinge: [[0, 0], [20, 0]], ang: 90, pts: [[0, 0], [20, 0], [20, -12], [0, -12]], fill: F.side },
      { id: 'back', parent: 'bot', hinge: [[0, 15], [20, 15]], ang: 90, pts: [[0, 15], [20, 15], [20, 27], [0, 27]], fill: F.side },
      { id: 'left', parent: 'bot', hinge: [[0, 0], [0, 15]], ang: 90, pts: [[0, 0], [0, 15], [-12, 15], [-12, 0]], fill: '#f6c98a' },
      { id: 'right', parent: 'bot', hinge: [[20, 0], [20, 15]], ang: 90, pts: [[20, 0], [32, 0], [32, 15], [20, 15]], fill: '#f6c98a' },
      { id: 'top', parent: 'right', hinge: [[32, 0], [32, 15]], ang: 90, pts: [[32, 0], [52, 0], [52, 15], [32, 15]], fill: F.base }
    ],
    dims: (cur) => [[vmid(cur.front[0], cur.front[1]), cm('20'), 's'], [vmid(cur.right[0], cur.right[1]), cm('12'), 's'], [vmid(cur.bot[3], cur.bot[0]), cm('15'), 'c']]
  }
};
const net = {
  title: 'Unfold it: surface area is every face added up',
  height: 480,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(NETS).map((k) => ({ v: k, label: NETS[k].label })),
  intro: 'Cut along some edges and lay the prism flat. Press <b>Next</b>.',
  make(stage, k, ex) {
    const D = NETS[k], H = ex.def.height, PW = 330;
    const S = new Scene3(stage, { x: 0, y: 0, width: ex.W - PW - 20, height: H });
    const P = panel(stage, ex.W - PW - 10, 14, PW, H - 28, 'Running total');
    const st = { f: 1, fill: {} }; let cur = foldNet(D.faces, 1);
    S.obj({ mode: 'solid', faces: () => { cur = foldNet(D.faces, st.f); return D.faces.map((fc) => ({ P: cur[fc.id], fill: st.fill[fc.id] || fc.fill, id: fc.id, always: true })); } });
    const c0 = S.fit(S.points(), D.yaw, D.elev, { pad: 60 });
    st.f = 0; const c1 = S.fit(S.points(), 0, 90, { pad: 34 }); st.f = 1;
    S.setCam(c0);
    const dims = D.dims(cur).map((x, i) => S.label(() => D.dims(cur)[i][0], x[1], { pos: x[2], cls: DIM }));
    const area = {}; D.faces.forEach((fc) => (area[fc.id] = S.label(() => cen(cur[fc.id]), '', { cls: AREA, hide: true })));
    S.render();
    const tot = line(P, '', 'u10l3-big'); let sum = 0;
    const hiFaces = async (c, ids, vals) => { ids.forEach((id) => (st.fill[id] = F.hi)); S.render(); for (let i = 0; i < ids.length; i++) { area[ids[i]].innerHTML = T(vals[i]); await pop(c, area[ids[i]]); } await sleep(c, 250); ids.forEach((id) => delete st.fill[id]); S.render(); };
    const addRow = async (c, html, v) => { await say(c, P, html); sum += v; tot.innerHTML = T('SA=' + thin(String(sum)) + '\\ \\text{cm}^2'); if (tot.style.opacity !== '1') await show(c, tot); else await pulse(c, tot, 1.08); P.appendChild(tot); };
    const unfold = { cap: `Cut along some edges and <b>unfold it flat</b> on the table, then look straight down: that flat pattern is the <b>net</b>.`,
      run: async (c) => { const a = { ...S.cam }; await tween(c, 2200, (t) => { st.f = 1 - t; for (const q in c1) S.cam[q] = a[q] + (c1[q] - a[q]) * t; S.render(); }); } };
    if (k === 'tri') return [
      { cap: `Example 1’s prism: a right-triangle base with sides 9, 12 and 15 cm, and 11 cm long. <b>5 faces</b>: 2 triangles, 3 rectangles.`, run: (c) => sleep(c, 200) },
      unfold,
      { cap: `The two triangles (the bases): ${T('\\tfrac12(9)(12)=54')} each.`,
        run: async (c) => { await hiFaces(c, ['front', 'back'], ['54', '54']); await addRow(c, `2 triangles: ${T('2\\times54=108')}`, 108); } },
      { cap: `Three rectangles, all 11 cm long: ${T('9\\times11=99')}, ${T('12\\times11=132')} and ${T('15\\times11=165')}.`,
        run: async (c) => {
          for (const [id, a, w] of [['bot', 99, 9], ['left', 132, 12], ['hyp', 165, 15]]) { await hiFaces(c, [id], [String(a)]); await addRow(c, T(`${w}\\times11=${a}`), a); }
        } },
      { cap: `Shortcut: the three rectangles make <b>one strip</b>, as long as the triangle’s perimeter: ${T('(9+12+15)\\times11=36\\times11=396')}.`,
        run: async (c) => {
          const strip = S.line(() => [cur.left[3], cur.left[2], cur.hyp[2], cur.hyp[1]], { color: RED, width: 4, close: true, hide: true });
          S.render(); await appear(c, strip);
          const t = S.label(() => vmid(cur.hyp[2], cur.hyp[3]), T('36\\times11=396'), { pos: 'n', cls: 'u10l3-rl', hide: true }); S.render(); await pop(c, t);
        } },
      { cap: `${T('SA=2(54)+396=108+396=504\\ \\text{cm}^2')}. Every face counted exactly once.`,
        run: async (c) => { tot.classList.add('u10l3-ok'); const s = stampAt(P, '504 cm² ✓'); await stampIn(c, s); } }
    ];
    return [
      { cap: `A box 20 cm long, 15 cm wide and 12 cm high: <b>6 rectangular faces</b>.`, run: (c) => sleep(c, 200) },
      unfold,
      { cap: `Top and bottom: ${T('20\\times15=300')} each.`, run: async (c) => { await hiFaces(c, ['bot', 'top'], ['300', '300']); await addRow(c, `top, bottom: ${T('2\\times300=600')}`, 600); } },
      { cap: `Front and back: ${T('20\\times12=240')} each.`, run: async (c) => { await hiFaces(c, ['front', 'back'], ['240', '240']); await addRow(c, `front, back: ${T('2\\times240=480')}`, 480); } },
      { cap: `The two ends: ${T('15\\times12=180')} each.`, run: async (c) => { await hiFaces(c, ['left', 'right'], ['180', '180']); await addRow(c, `ends: ${T('2\\times180=360')}`, 360); } },
      { cap: `${T('SA=600+480+360=1\\,440\\ \\text{cm}^2')}. A box’s faces come in <b>matching pairs</b>.`,
        run: async (c) => { tot.classList.add('u10l3-ok'); const s = stampAt(P, '1 440 cm² ✓'); await stampIn(c, s); } }
    ];
  }
};

/* =============================== 3. capacity =============================== */
const capacity = {
  title: 'Volume and capacity',
  height: 470,
  choices: [{ v: 'litre', label: 'From 1 mL to 1 L' }, { v: 'ex2', label: 'Example 2(b) check' }],
  intro: (v) => (v === 'ex2' ? 'Fill the AquaGlow tank with water. Press <b>Next</b>.' : 'Build a litre out of 1 cm cubes. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const H = ex.def.height, PW = 400;
    const S = new Scene3(stage, { x: 0, y: 0, width: ex.W - PW - 20, height: H });
    const P = panel(stage, ex.W - PW - 10, 14, PW, H - 28, k === 'ex2' ? 'Unit analysis' : 'Counting cubes');
    const Lx = k === 'ex2' ? 20 : 10, Ly = k === 'ex2' ? 15 : 10, Lz = k === 'ex2' ? 12 : 10;
    const st = { w: 0, blocks: [] };
    const boxPts = (x, y, z) => [[0, 0, 0], [x, 0, 0], [x, y, 0], [0, y, 0]];
    S.obj({ mode: 'wire', faces: () => prismFaces(boxPts(Lx, Ly), [0, 0, Lz]).map((f) => ({ ...f, fill: F.glass, op: 0.18 })) });
    S.obj({ mode: 'solid', bias: 0, faces: () => (st.w > 0.01 ? prismFaces(boxPts(Lx, Ly), [0, 0, st.w]).map((f) => ({ ...f, fill: F.water, op: 0.62, stroke: '#3f7fd0', sw: 1.4 })) : []) });
    // cube blocks for the litre: [x, y, z, dx, dy, dz]
    S.obj({ mode: 'solid', faces: () => {
      const out = [];
      st.blocks.forEach(([x, y, z, dx, dy, dz]) => prismFaces([[x, y, z], [x + dx, y, z], [x + dx, y + dy, z], [x, y + dy, z]], [0, 0, dz]).forEach((f) => {
        f.fill = f.role === 'base' ? '#f2b36a' : '#f7c98e'; f.sw = 1.6;
        const g = [];
        if (f.id === 's0') { for (let i = 1; i < dx; i++) g.push([[x + i, y, z], [x + i, y, z + dz]]); for (let j = 1; j < dz; j++) g.push([[x, y, z + j], [x + dx, y, z + j]]); }
        if (f.id === 's1') { for (let i = 1; i < dy; i++) g.push([[x + dx, y + i, z], [x + dx, y + i, z + dz]]); for (let j = 1; j < dz; j++) g.push([[x + dx, y, z + j], [x + dx, y + dy, z + j]]); }
        if (f.id === 'b1') { for (let i = 1; i < dx; i++) g.push([[x + i, y, z + dz], [x + i, y + dy, z + dz]]); for (let j = 1; j < dy; j++) g.push([[x, y + j, z + dz], [x + dx, y + j, z + dz]]); }
        f.grid = g; f.gridColor = 'rgba(120,70,10,.55)'; out.push(f);
      }));
      return out;
    } });
    S.setCam(S.fit(S.points(), -30, 24, { pad: 50, box: { x: 50, y: 0, w: S.W - 50, h: H } }));
    const dims = k === 'ex2'
      ? [S.label([10, 0, 0], cm('20'), { pos: 's', cls: DIM }), S.label([20, 7.5, 0], cm('15'), { pos: 'se', cls: DIM }), S.label([0, 0, 6], cm('12'), { pos: 'w', cls: DIM })]
      : [S.label([5, 0, 0], cm('10'), { pos: 's', cls: DIM, hide: true }), S.label([10, 5, 0], cm('10'), { pos: 'se', cls: DIM, hide: true }), S.label([0, 0, 5], cm('10'), { pos: 'w', cls: DIM, hide: true })];
    S.render();
    const fill = (c, to, ms = 1400) => { const a = st.w; return tween(c, ms, (t) => { st.w = a + (to - a) * t; S.render(); }); };
    if (k === 'litre') {
      const cube1 = S.label([0.5, 0, 1], '1 cm', { pos: 'n', cls: DIM, hide: true });
      return [
        { cap: `One cube, <b>1 cm</b> on each side: a volume of ${T('1\\ \\text{cm}^3')}. Filled with water it holds exactly <b>1 millilitre</b>.`,
          run: async (c) => { st.blocks = [[0, 0, 0, 1, 1, 1]]; S.render(); await pop(c, cube1); await say(c, P, T('1\\ \\text{cm}^3=1\\ \\text{mL}'), 'u10l3-big'); } },
        { cap: `A row of 10 cubes: ${T('10\\ \\text{cm}^3')}.`, run: async (c) => { cube1.style.opacity = 0; st.blocks = [[0, 0, 0, 10, 1, 1]]; S.render(); await pop(c, dims[0]); await say(c, P, `1 row: ${T('10\\ \\text{cm}^3')}`); } },
        { cap: `A layer of 10 rows: ${T('10\\times10=100\\ \\text{cm}^3')}.`, run: async (c) => { st.blocks = [[0, 0, 0, 10, 10, 1]]; S.render(); await pop(c, dims[1]); await say(c, P, `1 layer: ${T('100\\ \\text{cm}^3')}`); } },
        { cap: `10 layers fill the 10 cm cube: ${T('10\\times10\\times10=1000\\ \\text{cm}^3')}.`,
          run: async (c) => { for (let i = 2; i <= 10; i++) { st.blocks = [[0, 0, 0, 10, 10, i]]; S.render(); await sleep(c, 170); } await pop(c, dims[2]); await say(c, P, `10 layers: ${T('1000\\ \\text{cm}^3')}`); } },
        { cap: `Pour in water instead: ${T('1000\\ \\text{cm}^3=1000\\ \\text{mL}=1\\ \\text{L}')}. A litre is a 10 cm cube.`,
          run: async (c) => { st.blocks = []; S.render(); await fill(c, 10); await say(c, P, T('1000\\ \\text{cm}^3=1000\\ \\text{mL}=1\\ \\text{L}'), 'u10l3-big'); } },
        { cap: `A 1 m cube is 10 litre-cubes long, wide and high: ${T('10\\times10\\times10=1000')}, so ${T('1\\ \\text{m}^3=1000\\ \\text{L}')}.`,
          run: async (c) => { await say(c, P, T('1\\ \\text{m}^3=1000\\ \\text{L}'), 'u10l3-big'); } }
      ];
    }
    const jug = h('div', 'u10l3-jug', `<div class="u10l3-jugbar"><div class="u10l3-jugfill"></div></div><div class="u10l3-jugl">${T('1\\ \\text{US gal}=3.7854\\ \\text{L}')}</div>`); jug.style.opacity = 0;
    return [
      { cap: `The tank’s <b>inside</b> measures 20 by 15 by 12 cm: ${T('V=20\\times15\\times12=3\\,600\\ \\text{cm}^3')}.`,
        run: async (c) => { await say(c, P, T('V=3\\,600\\ \\text{cm}^3')); } },
      { cap: `Fill it with water. Every ${T('1\\ \\text{cm}^3')} holds ${T('1\\ \\text{mL}')}, so the units cancel like a fraction.`,
        run: async (c) => {
          await fill(c, 12, 1600);
          const l = await say(c, P, T('3\\,600\\ \\text{cm}^3\\times\\dfrac{1\\ \\text{mL}}{1\\ \\text{cm}^3}=3\\,600\\ \\text{mL}'));
          await cancelSwap(c, l, '3\\,600\\ \\textcolor{#c93a33}{\\cancel{\\text{cm}^3}}\\times\\dfrac{1\\ \\text{mL}}{1\\ \\textcolor{#c93a33}{\\cancel{\\text{cm}^3}}}=3\\,600\\ \\text{mL}');
        } },
      { cap: `${T('1000\\ \\text{mL}')} make ${T('1\\ \\text{L}')}: ${T('3\\,600\\div1000=3.60\\ \\text{L}')}.`,
        run: async (c) => {
          const l = await say(c, P, T('3\\,600\\ \\text{mL}\\times\\dfrac{1\\ \\text{L}}{1000\\ \\text{mL}}=3.60\\ \\text{L}'));
          await cancelSwap(c, l, '3\\,600\\ \\textcolor{#c93a33}{\\cancel{\\text{mL}}}\\times\\dfrac{1\\ \\text{L}}{1000\\ \\textcolor{#c93a33}{\\cancel{\\text{mL}}}}=3.60\\ \\text{L}');
        } },
      { cap: `A US gallon is ${T('3.7854\\ \\text{L}')}, a little more than the tank holds: ${T('3.6\\div3.7854=0.95102\\ldots\\approx0.95\\ \\text{US gal}')}.`,
        run: async (c) => {
          const l = await say(c, P, T('3.60\\ \\text{L}\\times\\dfrac{1\\ \\text{US gal}}{3.7854\\ \\text{L}}\\approx0.95\\ \\text{US gal}'));
          await cancelSwap(c, l, '3.60\\ \\textcolor{#c93a33}{\\cancel{\\text{L}}}\\times\\dfrac{1\\ \\text{US gal}}{3.7854\\ \\textcolor{#c93a33}{\\cancel{\\text{L}}}}\\approx0.95\\ \\text{US gal}');
          P.appendChild(jug); await show(c, jug);
          const f = jug.querySelector('.u10l3-jugfill'); await tween(c, 900, (t) => { f.style.width = (95.1 * t).toFixed(1) + '%'; });
          const s = stampAt(P, '3.60 L ≈ 0.95 US gal ✓'); await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== 4. the cylinder's net =============================== */
const CYL = {
  gen: { label: 'Any cylinder: r and h', r: 4, h: 7 },
  ex4: { label: 'Example 4 check: r = 4.2, h = 12.6', r: 4.2, h: 12.6 }
};
const cylnet = {
  title: 'Unroll a cylinder: two circles and a rectangle',
  height: 500,
  choices: Object.keys(CYL).map((k) => ({ v: k, label: CYL[k].label })),
  intro: (v) => (v === 'ex4' ? 'The canister from Example 4. Press <b>Next</b>.' : 'Open the lids, then unroll the side. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const D = CYL[k], H = ex.def.height, PW = 340, g = k === 'gen', r = D.r, hh = D.h, C = 2 * PI * r;
    const S = new Scene3(stage, { x: 0, y: 0, width: ex.W - PW - 20, height: H });
    const P = panel(stage, ex.W - PW - 10, 14, PW, H - 28, g ? 'The net' : 'The net, with numbers');
    const tb = { r, h: hh, k: 1, dk: 1, lids: true, fill: F.curve, lidFill: F.base };
    S.obj({ mode: 'solid', faces: () => tubeFaces(tb) });
    const ptsClosed = S.points(); tb.dk = 0; const ptsOpen = S.points(); tb.dk = 1;
    const c0 = S.fit(ptsClosed.concat(ptsOpen), 0, 22, { pad: 40 });
    tb.k = 0; tb.dk = 0; const c1 = S.fit(S.points(), 0, 0, { pad: 34, padY: 30 }); tb.k = 1; tb.dk = 1;
    S.setCam(c0);
    S.line(() => { const c = lidCentre(tb, true); return [c, vadd(c, [r, 0, 0])]; }, { color: RED, width: 3 });
    const rT = S.label(() => vadd(lidCentre(tb, true), [r / 2, 0, 0]), T(g ? 'r' : 'r=4.2'), { pos: 'n', cls: 'u10l3-rl' });
    const hL = S.line(() => [tubeAt(tb, C / 4, 0), tubeAt(tb, C / 4, hh)], { color: AMB, width: 3 });
    const hT = S.label(() => tubeAt(tb, C / 4, hh / 2), T(g ? 'h' : 'h=12.6'), { pos: 'e', cls: DIM });
    const circ = S.line(() => [tubeAt(tb, -C / 2, -0.01), tubeAt(tb, C / 2, -0.01)], { color: BLUE, width: 5, hide: true });
    const circT = S.label(() => tubeAt(tb, C / 2 - C * 0.22, 0), T(g ? '\\text{circumference}=2\\pi r' : '2\\pi(4.2)\\approx26.39'), { pos: 's', cls: 'u10l3-bl', hide: true, gap: 8 });
    const rim = S.line(() => tubeFaces(tb).find((f) => f.role === 'bottom').P, { color: BLUE, width: 4, close: true, hide: true });
    const aRect = S.label(() => tubeAt(tb, -C / 4, hh / 2), T(g ? '2\\pi rh' : '105.84\\pi'), { cls: AREA, hide: true });
    const aTop = S.label(() => vadd(lidCentre(tb, true), [-r * 0.15, 0, -r * 0.45]), T(g ? '\\pi r^2' : '17.64\\pi'), { cls: AREA, hide: true });
    const aBot = S.label(() => vadd(lidCentre(tb, false), [0, 0, -r * 0.4]), T(g ? '\\pi r^2' : '17.64\\pi'), { cls: AREA, hide: true });
    S.render();
    const cut = { cap: `Cut straight down the side and <b>unroll</b> the curved surface until it lies flat.`,
      run: async (c) => { const a = { ...S.cam }; await tween(c, 2200, (t) => { tb.k = 1 - t; for (const q in c1) S.cam[q] = a[q] + (c1[q] - a[q]) * t; S.render(); }); } };
    const open = { cap: `Open the two circular ends: the top flips up and the bottom flips down.`, run: (c) => tween(c, 1300, (t) => { tb.dk = 1 - t; S.render(); }) };
    if (g) return [
      { cap: `A right cylinder: base radius ${T('r')} and height ${T('h')}. Two circles joined by a curved side.`, run: (c) => sleep(c, 200) },
      open, cut,
      { cap: `The rectangle’s long side wrapped <b>once around the circle</b>, so its length is the circumference, ${T('2\\pi r')}.`,
        run: async (c) => { await appear(c, rim); await appear(c, circ); await pop(c, circT); await say(c, P, `length ${T('=2\\pi r')}, width ${T('=h')}`); } },
      { cap: `Its other side is the height ${T('h')}: ${T('A_{\\text{rect}}=l\\times w=(2\\pi r)(h)=2\\pi rh')}.`,
        run: async (c) => { await pop(c, aRect); await say(c, P, T('A_{\\text{rect}}=2\\pi rh')); } },
      { cap: `Top and bottom are circles of radius ${T('r')}: ${T('\\pi r^2')} each.`,
        run: async (c) => { await pop(c, aTop); await pop(c, aBot); await say(c, P, T('A_{\\text{circle}}=\\pi r^2\\ \\text{(two of them)}')); } },
      { cap: `Add the three pieces: ${T('SA_{\\text{Cylinder}}=\\pi r^2+\\pi r^2+2\\pi rh=2\\pi r^2+2\\pi rh')}.`,
        run: async (c) => { await say(c, P, T('SA=2\\pi r^2+2\\pi rh'), 'u10l3-big u10l3-ok'); } },
      { cap: `And the volume is the prism rule with a circular base: ${T('V=A_{\\text{Base}}\\times h=\\pi r^2h')}.`,
        run: async (c) => { await say(c, P, T('V=\\pi r^{2}h'), 'u10l3-big'); } }
    ];
    return [
      { cap: `The canister: diameter 8.4 cm, so ${T('r=4.2')} cm; height ${T('h=12.6')} cm.`, run: (c) => sleep(c, 200) },
      open, cut,
      { cap: `The rectangle’s length is the circumference: ${T('2\\pi(4.2)=8.4\\pi\\approx26.39')} cm. Its width is the height, 12.6 cm.`,
        run: async (c) => { await appear(c, rim); await appear(c, circ); await pop(c, circT); await say(c, P, `${T('8.4\\pi')} by ${T('12.6')}`); } },
      { cap: `${T('A_{\\text{rect}}=8.4\\pi\\times12.6=105.84\\pi\\approx332.51\\ \\text{cm}^2')}.`,
        run: async (c) => { await pop(c, aRect); await say(c, P, `rectangle: ${T('105.84\\pi')}`); } },
      { cap: `Each circle: ${T('\\pi(4.2)^2=17.64\\pi\\approx55.42\\ \\text{cm}^2')}.`,
        run: async (c) => { await pop(c, aTop); await pop(c, aBot); await say(c, P, `circles: ${T('2\\times17.64\\pi=35.28\\pi')}`); } },
      { cap: `${T('SA=35.28\\pi+105.84\\pi=141.12\\pi=443.3415\\ldots\\approx443.3\\ \\text{cm}^2')}.`,
        run: async (c) => { await say(c, P, T('SA=141.12\\pi\\approx443.3\\ \\text{cm}^2'), 'u10l3-big u10l3-ok'); const s = stampAt(P, '443.3 cm² ✓'); await stampIn(c, s); } },
      { cap: `And ${T('V=\\pi r^2h=17.64\\pi\\times12.6=222.264\\pi\\approx698.3\\ \\text{cm}^3')}: cubic units for volume, square units for area.`,
        run: async (c) => { await say(c, P, T('V=222.264\\pi\\approx698.3\\ \\text{cm}^3'), 'u10l3-big'); } }
    ];
  }
};

/* =============================== 4. radius first, round last =============================== */
const radius = {
  title: 'Radius first, round last',
  height: 460,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'dr', label: 'Halve the diameter' }, { v: 'round', label: 'Round only at the end' }],
  intro: (v) => (v === 'dr' ? 'Look down on the Example 4 canister. Press <b>Next</b>.' : 'Two ways to work Example 4. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const H = ex.def.height;
    if (k === 'dr') {
      const PW = 360, W = ex.W - PW - 20, u = 22, cx = 8.4 * u + 14, cy = H / 2;
      const svg = add(stage, svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }), 0, 0);
      const P = panel(stage, ex.W - PW - 10, 14, PW, H - 28, 'The volume');
      const hid = (e) => { e.style.opacity = 0; return e; };
      const small = svgEl('circle', { cx, cy, r: 4.2 * u, fill: F.base, stroke: TEAL, 'stroke-width': 3 }, svg);
      const dia = svgEl('line', { x1: cx - 4.2 * u, y1: cy, x2: cx + 4.2 * u, y2: cy, stroke: INK, 'stroke-width': 3 }, svg);
      const big = hid(svgEl('circle', { cx, cy, r: 8.4 * u, fill: 'rgba(201,58,51,.07)', stroke: RED, 'stroke-width': 3, 'stroke-dasharray': '9 7' }, svg));
      const rad = hid(svgEl('line', { x1: cx, y1: cy, x2: cx + 4.2 * u, y2: cy, stroke: RED, 'stroke-width': 5 }, svg));
      const lab = (x, y, html, cls, pos = 'c') => { const d = h('div', 'u10l3-lab ' + cls, html); d.style.opacity = 0; stage.appendChild(d); place(d, x, y, pos, 6); return d; };
      const dl = lab(cx, cy, T('d=8.4'), DIM, 'n'), rl = lab(cx + 2.1 * u, cy, T('r=4.2'), 'u10l3-rl', 's');
      // squares (drawn at a smaller scale): r × r, and 2r × 2r split into four
      const sqS = 16, bigL = W - 20 - 8.4 * sqS, midX = bigL + 4.2 * sqS;
      const sq = hid(svgEl('g', {}, svg));
      svgEl('rect', { x: midX - 2.1 * sqS, y: 24, width: 4.2 * sqS, height: 4.2 * sqS, fill: F.base, stroke: TEAL, 'stroke-width': 2.5 }, sq);
      const sq2 = hid(svgEl('g', {}, svg));
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j]) => svgEl('rect', { x: bigL + i * 4.2 * sqS, y: 160 + j * 4.2 * sqS, width: 4.2 * sqS, height: 4.2 * sqS, fill: 'rgba(201,58,51,.12)', stroke: RED, 'stroke-width': 2.5 }, sq2));
      const q1 = lab(midX, 24 + 4.2 * sqS + 2, T('4.2^2=17.64'), DIM, 's'), q2 = lab(midX, 160 + 8.4 * sqS + 2, T('8.4^2=4\\times17.64'), DIM, 's');
      const Vr = PI * 4.2 * 4.2 * 12.6, Vd = PI * 8.4 * 8.4 * 12.6;
      return [
        { cap: `Looking down on the canister: the distance <b>across</b> the top, through the centre, is the diameter, ${T('8.4')} cm.`, run: (c) => pop(c, dl) },
        { cap: `The radius goes from the centre to the edge: <b>half</b> the diameter, ${T('r=8.4\\div2=4.2')} cm.`, run: async (c) => { await appear(c, rad); await pop(c, rl); await say(c, P, `Right: ${T('r=4.2')}`); } },
        { cap: `Put 8.4 in for ${T('r')} by mistake, and the circle is <b>twice as wide</b>…`, run: async (c) => { await appear(c, big, 600); } },
        { cap: `…but <b>4 times</b> the area, because the radius is <b>squared</b>: ${T('8.4^2=70.56=4\\times17.64')}.`,
          run: async (c) => { await appear(c, sq); await pop(c, q1); await appear(c, sq2); await pop(c, q2); } },
        { cap: `So the volume comes out 4 times too big: ${T('\\pi(8.4)^2(12.6)\\approx' + fx(Vd, 1))} instead of ${T('\\pi(4.2)^2(12.6)\\approx' + fx(Vr, 1) + '\\ \\text{cm}^3')}.`,
          run: async (c) => {
            await say(c, P, `${T('\\pi(4.2)^2(12.6)\\approx' + fx(Vr, 1))}`, 'u10l3-ok'); await say(c, P, `${T('\\pi(8.4)^2(12.6)\\approx' + thin(Vd.toFixed(1)))}`, 'u10l3-no');
            const s = stampAt(P, 'halve the diameter first'); await stampIn(c, s);
          } }
      ];
    }
    const P = panel(stage, 14, 14, ex.W - 28, 196, '');
    P.classList.add('u10l3-cols');
    const colA = h('div', 'u10l3-col'), colB = h('div', 'u10l3-col'); colA.innerHTML = '<div class="u10l3-ph">Exact all the way</div>'; colB.innerHTML = '<div class="u10l3-ph">Rounded too early</div>'; P.append(colA, colB);
    const N = new NumberLine(stage, { x: 30, y: 224, width: ex.W - 60, height: 130, min: 697.8, max: 698.6, step: 0.1, labels: [697.8, 697.9, 698, 698.1, 698.2, 698.3, 698.4, 698.5, 698.6].map((v) => ({ v, html: T(v.toFixed(1)) })) });
    N.el.style.opacity = 0;
    const V = PI * 4.2 * 4.2 * 12.6, Ve = 55.4 * 12.6;
    return [
      { cap: `Exact: keep ${T('\\pi')} and every digit. ${T('\\pi\\times4.2^2\\times12.6=698.2629\\ldots\\approx698.3\\ \\text{cm}^3')}.`,
        run: async (c) => { await say(c, colA, T('A_{\\text{Base}}=\\pi(4.2)^2=55.4176\\ldots')); await say(c, colA, T('V=55.4176\\ldots\\times12.6=698.2629\\ldots'), 'u10l3-ok'); } },
      { cap: `Too early: round the base area to ${T('55.4')} first, then ${T('55.4\\times12.6=698.04\\approx698.0\\ \\text{cm}^3')}.`,
        run: async (c) => { await say(c, colB, T('A_{\\text{Base}}\\approx55.4')); await say(c, colB, T('V\\approx55.4\\times12.6=698.04'), 'u10l3-no'); } },
      { cap: `On a number line the two answers round to <b>different tenths</b>: ${T('698.3')} (right) and ${T('698.0')} (wrong).`,
        run: async (c) => {
          await appear(c, N.el);
          await pop(c, N.point(V, { color: TEAL })); await N.hop(c, V, 698.3, { label: T('698.26\\ldots\\to698.3'), color: TEAL });
          await pop(c, N.point(Ve, { color: RED })); await N.hop(c, Ve, 698.0, { label: T('698.04\\to698.0'), color: RED });
        } },
      { cap: `Same for the surface area: rounding ${T('2\\pi r')} to ${T('26.4')} first gives ${T('2(55.4)+26.4\\times12.6=443.44\\approx443.4')}, not ${T('443.3')}.`,
        run: async (c) => { await say(c, colA, T('SA=141.12\\pi=443.3415\\ldots\\approx443.3'), 'u10l3-ok'); await say(c, colB, T('SA\\approx110.8+332.64=443.44\\approx443.4'), 'u10l3-no'); } },
      { cap: `Use the ${T('\\pi')} key, keep every digit in the calculator, and <b>round once</b>, at the very end.`,
        run: async (c) => { const s = stamp(stage, 'round once, at the end', { ok: true, x: ex.W / 2, y: 398, size: 'sm' }); s.style.opacity = 0; await stampIn(c, s); } }
    ];
  }
};

/* =============================== 5. working backwards =============================== */
const backwards = {
  title: 'Work backwards from the volume',
  height: 470,
  choices: [{ v: 'cube', label: 'Example 5 check: ∛74.5' }, { v: 'tri', label: 'Example 6 check: 145.3 ÷ 7.56' }],
  intro: (v) => (v === 'cube' ? 'A cube with a volume of 74.5 m³. How long is a side? Press <b>Next</b>.' : 'How many layers of the triangle fit in 145.3 cm³? Press <b>Next</b>.'),
  make(stage, k, ex) {
    const H = ex.def.height, PW = 360;
    const S = new Scene3(stage, { x: 0, y: 0, width: ex.W - PW - 20, height: H - 90 });
    const P = panel(stage, ex.W - PW - 10, 14, PW, H - 28, k === 'cube' ? 'Guess and check' : 'Layers');
    // a volume meter under the scene
    const MW = ex.W - PW - 70, max = k === 'cube' ? 130 : 160, target = k === 'cube' ? 74.5 : 145.3;
    const meter = add(stage, h('div', 'u10l3-meter', `<div class="u10l3-mfill"></div><div class="u10l3-mtgt" style="left:${(target / max) * 100}%"><span class="u10l3-mtl">${T(target + (k === 'cube' ? '\\ \\text{m}^3' : '\\ \\text{cm}^3'))}</span></div><div class="u10l3-mval"></div>`), 26, H - 70);
    box(meter, MW, 34);
    const mf = meter.querySelector('.u10l3-mfill'), mv = meter.querySelector('.u10l3-mval');
    const setM = (v, d) => { mf.style.width = Math.min(100, (v / max) * 100).toFixed(2) + '%'; mf.classList.toggle('over', v > target + 1e-6); mv.innerHTML = T(nf(v, d)); mv.style.left = Math.min(96, (v / max) * 100) + '%'; };
    if (k === 'cube') {
      const st = { s: 3 };
      S.obj({ mode: 'solid', faces: () => prismFaces([[0, 0, 0], [st.s, 0, 0], [st.s, st.s, 0], [0, st.s, 0]], [0, 0, st.s]).map((f) => ({ ...f, fill: f.role === 'base' ? F.base : F.side })) });
      st.s = 5; S.setCam(S.fit(S.points(), -30, 22, { pad: 30 })); st.s = 3;
      const sl = S.label(() => [st.s / 2, 0, 0], '', { pos: 's', cls: DIM });
      const upd = () => { S.render(); sl.innerHTML = T('s=' + nf(st.s, 5)); setM(st.s ** 3, 3); };
      upd();
      const go = (c, to, ms = 900) => { const a = st.s; return tween(c, ms, (t) => { st.s = a + (to - a) * t; upd(); }); };
      const s0 = Math.cbrt(74.5);
      return [
        { cap: `${T('V=s^3=74.5')}: which side length, cubed, makes 74.5? Try ${T('s=4')}: ${T('4^3=64')}. <b>Too small.</b>`,
          run: async (c) => { await go(c, 4); await say(c, P, `${T('4^3=64')} &nbsp;too small`); } },
        { cap: `Try ${T('s=4.5')}: ${T('4.5^3\\approx91.1')}. <b>Too big.</b>`, run: async (c) => { await go(c, 4.5); await say(c, P, `${T('4.5^3\\approx91.1')} &nbsp;too big`); } },
        { cap: `Try ${T('s=4.2')}: ${T('4.2^3\\approx74.09')}. Very close, a little small.`, run: async (c) => { await go(c, 4.2); await say(c, P, `${T('4.2^3\\approx74.09')} &nbsp;close`); } },
        { cap: `The <b>cube root</b> undoes the cube in one step: ${T('s=\\sqrt[3]{74.5}=4.207770\\ldots')} m.`,
          run: async (c) => { await go(c, s0, 700); await say(c, P, T('s=\\sqrt[3]{74.5}=4.207770\\ldots\\ \\text{m}'), 'u10l3-big'); } },
        { cap: `The answer is wanted in centimetres: ${T('4.207770\\ldots\\times100=420.777\\ldots\\approx421\\ \\text{cm}')}.`,
          run: async (c) => { await say(c, P, T('\\times100=420.777\\ldots\\approx421\\ \\text{cm}'), 'u10l3-big u10l3-ok'); const s = stampAt(P, '421 cm ✓'); await stampIn(c, s); } }
      ];
    }
    const st = { n: 0 }, A = 7.56, Lfull = 145.3 / A, base = [[0, 0, 0], [4.2, 0, 0], [0, 0, 3.6]];
    S.obj({ mode: 'solid', faces: () => {
      if (st.n < 0.004) return [{ P: base.slice(), fill: F.base, always: true }];
      const out = []; for (let i = 0; i < Math.ceil(st.n - 1e-9); i++) prismFaces(base.map((p) => vadd(p, [0, i, 0])), [0, Math.min(1, st.n - i), 0]).forEach((f) => { f.fill = f.role === 'base' ? F.base : F.side; f.sw = 1.6; out.push(f); });
      return out;
    } });
    st.n = 20; S.setCam(S.fit(S.points(), -58, 16, { pad: 30, box: { x: 60, y: 0, w: S.W - 60, h: S.H } })); st.n = 0;
    const lb = S.label([2.1, 0, 0], cm('4.2'), { pos: 's', cls: DIM }), lh = S.label([0, 0, 1.8], cm('3.6'), { pos: 'w', cls: DIM });
    const cnt = line(P, '', 'u10l3-count');
    const upd = () => { S.render(); setM(A * st.n, 2); cnt.innerHTML = `<b>${Number.isInteger(Math.round(st.n * 1e6) / 1e6) ? Math.round(st.n) : nf(st.n, 2)}</b> layers`; };
    upd(); void lb; void lh;
    const grow = async (c, to, each) => { for (let i = Math.floor(st.n + 1e-9) + 1; i <= Math.floor(to + 1e-9); i++) { const a = st.n; await tween(c, each, (t) => { st.n = a + (i - a) * t; upd(); }); } if (to > st.n + 1e-9) { const a = st.n; await tween(c, 700, (t) => { st.n = a + (to - a) * t; upd(); }); } };
    return [
      { cap: `The triangular end is the base: ${T('A_{\\text{Base}}=\\tfrac12(4.2)(3.6)=7.56\\ \\text{cm}^2')}.`, run: async (c) => { await say(c, P, T('A_{\\text{Base}}=7.56\\ \\text{cm}^2')); } },
      { cap: `Each 1 cm of length adds one layer of the base: ${T('7.56\\ \\text{cm}^3')}.`, run: async (c) => { await show(c, cnt); await grow(c, 1, 600); } },
      { cap: `Add layers until the volume reaches ${T('145.3')}: 19 layers make ${T('19\\times7.56=143.64')}, and a 20th would overshoot (${T('151.2')}).`,
        run: async (c) => { await grow(c, 19, 140); await say(c, P, T('19\\times7.56=143.64')); } },
      { cap: `The rest, ${T('145.3-143.64=1.66')}, is only ${T('1.66\\div7.56\\approx0.22')} of a layer: ${T('L\\approx19.22')} cm.`,
        run: async (c) => { await grow(c, Lfull); await say(c, P, T('L\\approx19.22\\ \\text{layers}')); } },
      { cap: `In one step, divide: ${T('L=\\dfrac{V}{A_{\\text{Base}}}=\\dfrac{145.3}{7.56}=19.21957\\ldots\\approx19.2')} cm.`,
        run: async (c) => { await say(c, P, T('L=\\frac{145.3}{7.56}\\approx19.2\\ \\text{cm}'), 'u10l3-big u10l3-ok'); const s = stampAt(P, '19.2 cm ✓'); await stampIn(c, s); } }
    ];
  }
};

/* =============================== 6. peel off the label =============================== */
const label = {
  title: 'The label is just a rectangle',
  height: 480,
  intro: 'The Example 7 poster tube, wrapped in its label. Press <b>Next</b>.',
  make(stage, v, ex) {
    const H = ex.def.height, PW = 360, C = 3.75, r = C / (2 * PI), hh = 21.5, gap = 1.6;
    const S = new Scene3(stage, { x: 0, y: 0, width: ex.W - PW - 20, height: H });
    const P = panel(stage, ex.W - PW - 10, 14, PW, H - 28, 'Curved surface only');
    const core = { r, h: hh, k: 1, dk: 1, lids: true, fill: F.card, lidFill: '#cdb48a', N: 40 };
    const lab = { r: r * 1.04, h: hh * 0.999, k: 1, fill: F.label, stroke: RED, sw: 1.6, N: 40, shift: [0, 0, 0] };
    S.obj({ mode: 'solid', faces: () => tubeFaces(core) });
    S.obj({ mode: 'solid', bias: 0.02, faces: () => tubeFaces(lab) });
    const end = r + gap + C / 2;
    const c0 = S.fit(S.points(), 0, 16, { pad: 50, padY: 44 });
    lab.k = 0; lab.shift = [end, 0, 0]; const c1 = S.fit(S.points(), 0, 0, { pad: 50, padY: 44 }); lab.k = 1; lab.shift = [0, 0, 0];
    S.setCam(c0);
    const hT = S.label([r, 0, hh / 2], T('21.5\\ \\text{in}'), { pos: 'e', cls: DIM }), cT = S.label([0, 0, hh], 'around: ' + T('3.75\\ \\text{in}'), { pos: 'n', cls: DIM, gap: 22 });
    const w1 = S.label(() => tubeAt(lab, 0, 0), T('3.75\\ \\text{in}'), { pos: 's', cls: DIM, hide: true }), w2 = S.label(() => tubeAt(lab, C / 2, hh / 2), T('21.5\\ \\text{in}'), { pos: 'e', cls: DIM, hide: true });
    const ar = S.label(() => tubeAt(lab, 0, hh * 0.55), T('80.625'), { cls: AREA, hide: true });
    S.render();
    return [
      { cap: `The poster tube is ${T('21.5')} in tall, and its base is ${T('3.75')} in around (the circumference). The label covers the curved side.`, run: (c) => sleep(c, 200) },
      { cap: `<b>Peel the label off</b> and lay it flat. The two circular ends stay on the tube.`,
        run: async (c) => { hT.style.opacity = 0; cT.style.opacity = 0; const a = { ...S.cam }; await tween(c, 2200, (t) => { lab.k = 1 - t; lab.shift = [end * t, 0, 0]; for (const q in c1) S.cam[q] = a[q] + (c1[q] - a[q]) * t; S.render(); }); } },
      { cap: `It is a <b>rectangle</b>: the distance around (${T('3.75')} in) by the height (${T('21.5')} in).`,
        run: async (c) => { await pop(c, w1); await pop(c, w2); await say(c, P, `${T('3.75\\ \\text{in}')} by ${T('21.5\\ \\text{in}')}`); } },
      { cap: `Area ${T('=3.75\\times21.5=80.625\\approx81\\ \\text{in}^2')}. No circles, and no ${T('\\pi')}: the circumference was given.`,
        run: async (c) => { await pop(c, ar); await say(c, P, T('3.75\\times21.5=80.625'), 'u10l3-big'); await say(c, P, T('\\approx81\\ \\text{in}^2'), 'u10l3-big u10l3-ok'); const s = stampAt(P, '81 in² ✓'); await stampIn(c, s); } }
    ];
  }
};

/* =============================== 7. what is left for the rectangle =============================== */
const solveh = {
  title: 'Example 8 check: the height from the surface area',
  height: 480,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  intro: 'A closed can: 250 cm² of metal, radius 3.5 cm. Press <b>Next</b>.',
  make(stage, v, ex) {
    const H = ex.def.height, PW = 380, W = ex.W - PW - 20, r = 3.5, Cw = 2 * PI * r, hT = (250 - 2 * PI * r * r) / Cw, circ = PI * r * r;
    const u = Math.min((W - 210) / Cw, (H - 40) / (4 * r + hT + 0.6));
    const svg = add(stage, svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }), 0, 0);
    const P = panel(stage, ex.W - PW - 10, 14, PW, H - 28, 'Share out the 250 cm²');
    const x0 = (W - Cw * u) / 2 - 50, yTop = (H - (4 * r + hT) * u) / 2 + 2 * r * u, yBot = yTop + hT * u; // rectangle top/bottom (final)
    const cxC = x0 + (Cw * u) / 2;
    const ghost = svgEl('rect', { x: x0, y: yTop, width: Cw * u, height: hT * u, fill: 'none', stroke: '#9aa0ab', 'stroke-width': 2, 'stroke-dasharray': '7 6' }, svg);
    const rect = svgEl('rect', { x: x0, y: yBot, width: Cw * u, height: 0, fill: F.curve, stroke: BLUE, 'stroke-width': 3 }, svg);
    const c1 = svgEl('circle', { cx: cxC, cy: yTop - r * u, r: r * u, fill: '#fff', stroke: TEAL, 'stroke-width': 3 }, svg);
    const c2 = svgEl('circle', { cx: cxC, cy: yBot + r * u, r: r * u, fill: '#fff', stroke: TEAL, 'stroke-width': 3 }, svg);
    const lab = (x, y, html, cls, pos = 'c') => { const d = h('div', 'u10l3-lab ' + cls, html); d.style.opacity = 0; stage.appendChild(d); place(d, x, y, pos, 6); return d; };
    const q = lab(x0 + Cw * u + 4, (yTop + yBot) / 2, T('h=?'), DIM, 'e');
    q.style.opacity = 1;
    const a1 = lab(cxC, yTop - r * u, T('12.25\\pi'), AREA), a2 = lab(cxC, yBot + r * u, T('12.25\\pi'), AREA);
    const wl = lab(x0 + Cw * u * 0.18, yBot, T('2\\pi(3.5)=7\\pi\\approx21.99'), 'u10l3-bl', 's');
    const live = lab(cxC - Cw * u * 0.25, (yTop + yBot) / 2, '', AREA);
    const bar = h('div', 'u10l3-share', `<div class="u10l3-sh1" style="width:${(2 * circ / 250) * 100}%"></div><div class="u10l3-sh2" style="width:${(1 - 2 * circ / 250) * 100}%"></div>`);
    bar.style.opacity = 0;
    return [
      { cap: `The whole surface is ${T('250\\ \\text{cm}^2')}: two circles and one rectangle whose height ${T('h')} we don’t know yet.`,
        run: async (c) => { await say(c, P, T('SA=2\\pi r^2+2\\pi rh=250')); } },
      { cap: `Each circle: ${T('\\pi(3.5)^2=12.25\\pi\\approx38.48')}. Both together: ${T('24.5\\pi=76.969\\ldots\\ \\text{cm}^2')}.`,
        run: async (c) => { c1.setAttribute('fill', F.base); c2.setAttribute('fill', F.base); await pop(c, a1); await pop(c, a2); await say(c, P, T('2\\pi(3.5)^2=76.969\\ldots')); P.appendChild(bar); await show(c, bar); } },
      { cap: `What is left must be the rectangle: ${T('250-76.969\\ldots=173.030\\ldots\\ \\text{cm}^2')}.`,
        run: async (c) => { bar.classList.add('u10l3-sh-on'); await say(c, P, T('250-76.969\\ldots=173.030\\ldots')); } },
      { cap: `The rectangle wraps once around the can, so its width is the circumference: ${T('2\\pi(3.5)=21.991\\ldots')} cm.`,
        run: async (c) => { await pop(c, wl); await say(c, P, T('21.991\\ldots\\times h=173.030\\ldots')); } },
      { cap: `Grow its height until the area reaches 173.03: ${T('h=\\dfrac{173.030\\ldots}{21.991\\ldots}=7.868\\ldots\\approx7.9')} cm.`,
        run: async (c) => {
          live.style.opacity = 1;
          await tween(c, 1800, (t) => { const hh = hT * Math.max(0, t); rect.setAttribute('y', yBot - hh * u); rect.setAttribute('height', Math.max(0, hh * u)); live.innerHTML = T(fx(Cw * hh, 2)); }, (t) => t);
          ghost.style.opacity = 0; q.innerHTML = T('h\\approx7.868'); await pulse(c, q, 1.15);
          await say(c, P, T('h=7.868\\ldots\\approx7.9\\ \\text{cm}'), 'u10l3-big u10l3-ok');
        } },
      { cap: `Check: ${T('2\\pi(3.5)^2+2\\pi(3.5)(7.868)=250.0')} ✓`,
        run: async (c) => { const s = stampAt(P, '250.0 cm² ✓'); await stampIn(c, s); } }
    ];
  }
};

/* =============================== mount =============================== */
mountStatics();
export const explainers = mountExplainers({ rollit, prisms, layers, net, capacity, cylnet, radius, backwards, label, solveh });
export const _test = { Scene3, prismFaces, tubeFaces, foldNet };
