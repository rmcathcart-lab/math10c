/* Math 10C · Unit 9 · Lesson 7 — Chaining Right Triangles Together.
 * Static figures (every booklet diagram, drawn from the booklet's own coordinates) and the explainers:
 *   cliff (warm-up: the unreachable cliff; the isosceles shortcut hands the 40 m sight line to the right triangle),
 *   towers (Example 1: alternate angles, the shared 38 m carried up to eye level, the two pieces stacked),
 *   noround (never round the shared side: Example 3 and Example 4 worked twice, full accuracy vs rounded early),
 *   chain (★ two right triangles share a side: the side glows as it is found in the first triangle, the triangles pull
 *     apart and it is carried, unrounded, into the second; Example 2 and Example 3 checks),
 *   frame (reading the shared altitude off both triangles: opposite in both, unknown on the bottom → divide),
 *   which (a flowchart: which triangle first, which ratio, how to finish; Examples 1–4),
 *   sightings (Example 4: walk toward the building; both triangles share h, neither has a known side; subtract),
 *   box3d (★ Extension, Example 5: a box turns; the base diagonal is handed up to a vertical triangle whose
 *     hypotenuse is the space diagonal), wedge (Extension, Example 6: the four rectangles; the side face turned
 *     to face us and split by a horizontal line).
 * Unit 9 colours: opposite purple, adjacent amber, hypotenuse blue, reference-angle arc teal; the shared side glows gold. */
import {
  h, tex, add, box, Box, Flowchart, NumberLine, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  svgEl, place, pulse, anim, angleArc, rightMark, arrowHead, drawIn, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const OPP = '#7b4fc4', ADJ = '#c27a0e', ADJT = '#b06a07', HYP = '#1f5bd6', REF = '#13807a', GOLD = '#f0b91e', GOLDD = '#c99400';
const INK = COLORS.ink, RED = COLORS.red, GRN = COLORS.green, GRAY = '#9aa0ab', SLATE = '#5b6475';
const ROLE = { opp: OPP, adj: ADJ, hyp: HYP };
const RAD = Math.PI / 180;
const cO = (s) => `\\textcolor{${OPP}}{${s}}`, cA = (s) => `\\textcolor{${ADJT}}{${s}}`, cH = (s) => `\\textcolor{${HYP}}{${s}}`, cG = (s) => `\\textcolor{${GOLDD}}{${s}}`;
const tanD = (a) => Math.tan(a * RAD), sinD = (a) => Math.sin(a * RAD), cosD = (a) => Math.cos(a * RAD);
const atanD = (v) => Math.atan(v) / RAD, acosD = (v) => Math.acos(v) / RAD;
/** a TeX number with trailing dots: 26.6547… */
const dots = (v, d = 4) => `${v.toFixed(d)}\\ldots`;
const r0 = (v) => String(Math.round(v)), r1 = (v) => (Math.round(v * 10) / 10).toFixed(1), r2 = (v) => v.toFixed(2);
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u9l7-panel', title ? `<div class="u9l7-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u9l7-line ' + cls, html); p.appendChild(d); return d; };
const say = async (c, p, html, cls) => { const d = line(p, html, cls); await fadeIn(c, d, 300); return d; };
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

/* =============================== Scene: a 2-D figure in its own units (y up) =============================== */
class Scene extends Box {
  /** o: { width, height, x, y, xmin, xmax, ymin, ymax, pad (px or [t, r, b, l]) } */
  constructor(host, opts) {
    const o = Object.assign({ width: 600, height: 400, pad: 36 }, opts);
    super(host, o, 'u9l7-scene', o.width, o.height);
    const [pt, pr, pb, pl] = Array.isArray(o.pad) ? o.pad : [o.pad, o.pad, o.pad, o.pad];
    const aw = o.width - pl - pr, ah = o.height - pt - pb;
    const s = this.s = Math.min(aw / (o.xmax - o.xmin), ah / (o.ymax - o.ymin));
    this.ox = pl + (aw - s * (o.xmax - o.xmin)) / 2 - s * o.xmin;
    this.oy = pt + (ah + s * (o.ymax - o.ymin)) / 2 + s * o.ymin;
    this.pts = {};
    this.base = { g: this.svg, d: this.html, dx: 0, dy: 0 };
  }
  pt(name, x, y) { this.pts[name] = [x, y]; return this; }
  U(p) { return typeof p === 'string' ? this.pts[p] : p; }
  P(p) { const q = this.U(p); return [this.ox + q[0] * this.s, this.oy - q[1] * this.s]; }
  /** a layer that can slide: an svg group and an html group */
  layer(parent) {
    const g = svgEl('g', {}, parent ? parent.g : this.svg), d = h('div', 'u9l7-hl');
    (parent ? parent.d : this.html).appendChild(d);
    return { g, d, dx: 0, dy: 0 };
  }
  async slide(c, L, dx, dy, ms = 700) {
    const a = `translate(${L.dx}px, ${L.dy}px)`, b = `translate(${dx}px, ${dy}px)`; L.dx = dx; L.dy = dy;
    await Promise.all([anim(c, L.g, [{ transform: a }, { transform: b }], ms), anim(c, L.d, [{ transform: a }, { transform: b }], ms)]);
  }
  seg(a, b, o = {}) {
    const P = this.P(a), Q = this.P(b);
    const e = svgEl('path', { class: 'bk-stroke ' + (o.cls || ''), d: `M${P[0]} ${P[1]}L${Q[0]} ${Q[1]}`, stroke: o.color || INK, 'stroke-width': o.width || 3, 'stroke-linecap': o.cap || 'round', fill: 'none' }, (o.L || this.base).g);
    if (o.dash) e.setAttribute('stroke-dasharray', o.dash);
    if (o.opacity != null) e.setAttribute('stroke-opacity', o.opacity);
    return e;
  }
  path(pts, o = {}) {
    const d = pts.map((p, i) => { const q = this.P(p); return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('') + (o.closed ? 'Z' : '');
    const e = svgEl('path', { class: 'bk-stroke ' + (o.cls || ''), d, stroke: o.color || INK, 'stroke-width': o.width || 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', fill: o.fill || 'none' }, (o.L || this.base).g);
    if (o.dash) e.setAttribute('stroke-dasharray', o.dash);
    if (o.fillOpacity != null) e.setAttribute('fill-opacity', o.fillOpacity);
    return e;
  }
  poly(pts, o = {}) {
    return svgEl('polygon', { points: pts.map((p) => this.P(p).map((v) => v.toFixed(1)).join(',')).join(' '), fill: o.fill || '#e8f0fc', 'fill-opacity': o.op ?? 1, stroke: o.stroke || 'none', 'stroke-width': o.sw || 0 }, (o.L || this.base).g);
  }
  /** angle arc at V between rays to P and Q (radius in px) */
  arc(V, P, Q, r = 34, o = {}) { return angleArc((o.L || this.base).g, this.P(V), this.P(P), this.P(Q), r, { color: o.color || INK, width: o.width || 2.5 }); }
  /** an arc by centre, radius (px) and angles in degrees (counter-clockwise, as in TikZ) */
  arcC(cen, r, a0, a1, o = {}) {
    const C = this.P(cen), p = (a) => [C[0] + r * Math.cos(a * RAD), C[1] - r * Math.sin(a * RAD)], s = p(a0), e = p(a1);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 0 : 1;
    return svgEl('path', { class: 'bk-stroke bk-arc', d: `M${s[0]} ${s[1]}A${r} ${r} 0 ${large} ${sweep} ${e[0]} ${e[1]}`, fill: 'none', stroke: o.color || INK, 'stroke-width': o.width || 2.2 }, (o.L || this.base).g);
  }
  rmark(V, P, Q, o = {}) { return rightMark((o.L || this.base).g, this.P(V), this.P(P), this.P(Q), o.s || 14, { color: o.color || INK, width: o.width || 2 }); }
  /** an HTML / KaTeX label at a point. o: { pos, gap, dx, dy, cls, color, L, tex } */
  lab(p, html, o = {}) {
    const q = this.P(p);
    return this.hlabel(q[0] + (o.dx || 0), q[1] + (o.dy || 0), o.tex === false ? html : html, { pos: o.pos || 'c', gap: o.gap ?? 6, cls: o.cls || 'u9l7-lab', color: o.color, parent: (o.L || this.base).d });
  }
  /** a vertex letter */
  vname(p, name, pos, o = {}) { return this.lab(p, T(name), Object.assign({ pos, cls: 'u9l7-v', gap: 5 }, o)); }
  /** a label beside segment ab, pushed `off` px to the side away from point `away` */
  sideLab(a, b, html, away, o = {}) {
    const A = this.P(a), B = this.P(b), M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], W = this.P(away);
    let [nx, ny] = norm(-(B[1] - A[1]), B[0] - A[0]); if ((W[0] - M[0]) * nx + (W[1] - M[1]) * ny > 0) { nx = -nx; ny = -ny; }
    const off = o.off ?? 20, d = this.hlabel(M[0] + nx * off + (o.dx || 0), M[1] + ny * off + (o.dy || 0), html, { pos: 'c', cls: o.cls || 'u9l7-lab', color: o.color, parent: (o.L || this.base).d });
    return d;
  }
  /** label inside an angle at V (between rays to P and Q), at distance r px along the bisector */
  angLab(V, P, Q, r, html, o = {}) {
    const v = this.P(V), p = this.P(P), q = this.P(Q), [ux, uy] = norm(p[0] - v[0], p[1] - v[1]), [wx, wy] = norm(q[0] - v[0], q[1] - v[1]), [bx, by] = norm(ux + wx, uy + wy);
    return this.hlabel(v[0] + bx * r, v[1] + by * r, html, { pos: 'c', cls: o.cls || 'u9l7-alab', color: o.color, parent: (o.L || this.base).d });
  }
  /** a gold glow under segment ab (starts hidden) */
  glow(a, b, o = {}) { const e = this.seg(a, b, { color: GOLD, width: o.width || 15, opacity: 0.55, L: o.L, cls: 'u9l7-glow' }); e.style.opacity = 0; return e; }
  /** a role tag (opp / adj / hyp) beside segment ab, away from point `away` */
  tag(a, b, role, away, o = {}) {
    const d = this.sideLab(a, b, role, away, { off: o.off ?? 26, cls: 'u9l7-tag', color: ROLE[role], L: o.L, dx: o.dx, dy: o.dy });
    d.style.opacity = 0; return d;
  }
}
/** colour a side and pop its role tag */
async function role(c, segEl, tagEl, r) { segEl.setAttribute('stroke', ROLE[r]); segEl.setAttribute('stroke-width', 4.5); await anim(c, segEl, [{ opacity: 0.3 }, { opacity: 1 }], 260); await pop(c, tagEl, 300); }
async function glowOn(c, g) { await anim(c, g, [{ opacity: 0 }, { opacity: 1 }], 350); await anim(c, g, [{ opacity: 1 }, { opacity: 0.45 }, { opacity: 1 }], 600); }
/** a gold copy of a segment that flies from one place to another (px offsets) */
async function carry(c, S, a, b, dx, dy, ms = 900) {
  const L = S.layer(); const g = S.seg(a, b, { color: GOLD, width: 9, L }); void g;
  L.g.style.filter = 'drop-shadow(0 0 6px rgba(240,185,30,.9))';
  await appear(c, L.g, 200); await S.slide(c, L, dx, dy, ms); await anim(c, L.g, [{ opacity: 1 }, { opacity: 0 }], 350);
  L.g.remove(); L.d.remove();
}
const chainIcon = (S, px, py) => { const d = h('div', 'u9l7-chain', '<svg viewBox="0 0 40 20"><rect x="2" y="4" width="20" height="12" rx="6"/><rect x="18" y="4" width="20" height="12" rx="6"/></svg>'); S.html.appendChild(d); place(d, px, py, 'c'); d.style.opacity = 0; return d; };

/* =============================== Solid3: a convex solid seen from any direction =============================== */
class Solid3 {
  /** cfg: { verts: {A: [x,y,z]…}, faces: [['A','B','C','D']…], c: [cx,cy,cz], s, ox, oy, view: {yaw, pitch} } */
  constructor(svg, htmlParent, cfg) {
    Object.assign(this, cfg); this.svg = svg; this.hp = htmlParent; this.extras = []; this.labs = [];
    const V = this.verts, cen = [0, 1, 2].map((k) => Object.values(V).reduce((s, p) => s + p[k], 0) / Object.keys(V).length);
    this.normals = this.faces.map((f) => {
      const [a, b, cc] = f.slice(0, 3).map((n) => V[n]), u = [0, 1, 2].map((k) => b[k] - a[k]), v = [0, 1, 2].map((k) => cc[k] - a[k]);
      let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const fc = [0, 1, 2].map((k) => f.reduce((s, nm) => s + V[nm][k], 0) / f.length);
      if (n[0] * (fc[0] - cen[0]) + n[1] * (fc[1] - cen[1]) + n[2] * (fc[2] - cen[2]) < 0) n = n.map((x) => -x);
      return n;
    });
    const seen = {}; this.edges = [];
    this.faces.forEach((f, fi) => f.forEach((a, i) => { const b = f[(i + 1) % f.length], k = [a, b].sort().join(''); if (!seen[k]) { seen[k] = { a, b, faces: [] }; this.edges.push(seen[k]); } seen[k].faces.push(fi); }));
    this.faceG = svgEl('g', {}, svg); this.edgeG = svgEl('g', {}, svg); this.topG = svgEl('g', {}, svg);
    this.edges.forEach((e) => { e.el = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, this.edgeG); });
    this.vl = {};
    for (const n in V) { const d = h('div', 'bk-lab u9l7-v', T(n)); htmlParent.appendChild(d); this.vl[n] = d; }
    this.render();
  }
  pr(p) {
    const yw = this.view.yaw * RAD, pt = this.view.pitch * RAD, dx = p[0] - this.c[0], dy = p[1] - this.c[1], dz = p[2] - this.c[2];
    const X = dx * Math.cos(yw) - dy * Math.sin(yw), Y = dx * Math.sin(yw) + dy * Math.cos(yw);
    return [this.ox + X * this.s, this.oy - (dz * Math.cos(pt) + Y * Math.sin(pt)) * this.s, Y * Math.cos(pt) - dz * Math.sin(pt)];
  }
  P(n) { return this.pr(typeof n === 'string' ? this.verts[n] : n); }
  front(fi) { const n = this.normals[fi], yw = this.view.yaw * RAD, pt = this.view.pitch * RAD, Yn = n[0] * Math.sin(yw) + n[1] * Math.cos(yw); return Yn * Math.cos(pt) - n[2] * Math.sin(pt) < -1e-9; }
  /** register something drawn from 3-D points: kind 'path' (polyline), 'poly' (filled), or a label { lab: div, p, off } */
  add(kind, pts, attrs = {}, parent) {
    const el = svgEl(kind === 'poly' ? 'polygon' : 'path', Object.assign({ fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, attrs), parent || this.topG);
    if (kind === 'path') el.classList.add('bk-stroke');
    this.extras.push({ kind, pts, el }); this.render(); return el;
  }
  label(p, html, o = {}) { const d = h('div', 'bk-lab ' + (o.cls || 'u9l7-lab'), html); if (o.color) d.style.color = o.color; this.hp.appendChild(d); this.labs.push({ d, p, o }); this.render(); return d; }
  render() {
    const V = this.verts, pp = {}; for (const n in V) pp[n] = this.pr(V[n]);
    const cx = Object.values(pp).reduce((s, p) => s + p[0], 0) / Object.keys(pp).length, cy = Object.values(pp).reduce((s, p) => s + p[1], 0) / Object.keys(pp).length;
    this.edges.forEach((e) => {
      const vis = e.faces.some((fi) => this.front(fi)), a = pp[e.a], b = pp[e.b];
      e.el.setAttribute('d', `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`);
      e.el.setAttribute('stroke-dasharray', vis ? '' : '7 6'); e.el.setAttribute('stroke-width', vis ? 2.4 : 1.8); e.el.setAttribute('stroke', vis ? INK : '#7d8596');
    });
    for (const n in V) { const p = pp[n], [ux, uy] = norm(p[0] - cx, p[1] - cy); place(this.vl[n], p[0] + ux * 20, p[1] + uy * 20, 'c'); }
    this.extras.forEach((x) => {
      const q = x.pts.map((p) => this.pr(typeof p === 'string' ? V[p] : p));
      if (x.kind === 'poly') x.el.setAttribute('points', q.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '));
      else x.el.setAttribute('d', q.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(''));
    });
    this.labs.forEach(({ d, p, o }) => {
      const q = this.pr(typeof p === 'function' ? p() : p);
      let dx = o.dx || 0, dy = o.dy || 0;
      if (o.out) { const [ux, uy] = norm(q[0] - cx, q[1] - cy); dx += ux * o.out; dy += uy * o.out; }
      place(d, q[0] + dx, q[1] + dy, 'c');
    });
  }
  async turn(c, yaw, pitch, ms = 1600) {
    const y0 = this.view.yaw, p0 = this.view.pitch;
    await tween(c, ms, (t) => { this.view.yaw = y0 + (yaw - y0) * t; this.view.pitch = p0 + (pitch - p0) * t; this.render(); });
  }
  dimEdges(c, op) { return anim(c, this.edgeG, [{ opacity: this.edgeG.style.opacity || 1 }, { opacity: op }], 400); }
}
const lerp3 = (a, b, t) => [0, 1, 2].map((k) => a[k] + (b[k] - a[k]) * t);
const add3 = (a, b, k = 1) => [0, 1, 2].map((i) => a[i] + b[i] * k);
const unit3 = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
/** points of an arc at V from direction u toward direction w (both unit, perpendicular) through angle deg, radius r (units) */
const arc3 = (V, u, w, deg, r, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const t = deg * RAD * i / n; return add3(add3(V, u, r * Math.cos(t)), w, r * Math.sin(t)); });

