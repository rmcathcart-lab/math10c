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
async function carry(c, S, a, b, from, to, ms = 900) {
  const L = S.layer(); const g = S.seg(a, b, { color: GOLD, width: 9, L }); void g;
  L.g.style.filter = 'drop-shadow(0 0 6px rgba(240,185,30,.9))';
  L.dx = from[0]; L.dy = from[1]; const tr = `translate(${from[0]}px, ${from[1]}px)`; L.g.style.transform = tr; L.d.style.transform = tr;
  await appear(c, L.g, 200); await S.slide(c, L, to[0], to[1], ms); await anim(c, L.g, [{ opacity: 1 }, { opacity: 0 }], 350);
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

/* =============================== warm-up: the unreachable cliff =============================== */
const CLIFF = { walk: { label: 'Walk A → B: 30° then 60°', a: 30 }, follow: { label: 'Follow-up: 25° then 50°', a: 25 } };
function drawCliff(S, a, d) {
  const b = 2 * a, BT = d, xB = BT * cosD(b), hh = BT * sinD(b), F = d + xB;
  S.pt('A', 0, 0).pt('B', d, 0).pt('F', F, 0).pt('T', F, hh);
  const g = S.layer(); // ground, river, cliff
  S.poly([[-4, 0], [d + 0.35 * xB, 0], [d + 0.35 * xB, -2.2], [-4, -2.2]], { fill: '#cfe5bd', L: g });
  S.poly([[d + 0.35 * xB, 0], [F, 0], [F, -2.2], [d + 0.35 * xB, -2.2]], { fill: '#a9cdee', L: g });
  S.poly([[F, -2.2], [F, hh], [F + 4, hh + 0.6], [F + 12, hh], [F + 16, hh - 2], [F + 16, -2.2]], { fill: '#b3a698', stroke: INK, sw: 2, L: g });
  S.poly([[F, hh], [F + 4, hh + 0.6], [F + 12, hh], [F + 12, hh - 0.5], [F + 4, hh + 0.1], [F, hh - 0.5]], { fill: '#6f9a4e', L: g });
  S.seg([-4, 0], [d + 0.35 * xB, 0], { width: 2.5, L: g }); S.seg([d + 0.35 * xB, 0], [F, 0], { width: 2.5, color: '#4f86b8', L: g });
  S.lab([d + 0.68 * xB, -1.1], 'river', { cls: 'u9l7-river' });
  const shade = S.poly(['A', 'B', 'T'], { fill: '#ffecb3', op: 0.85 });
  const FT = S.seg('F', 'T', { dash: '9 6', width: 2.5 }), rm = S.rmark('F', 'B', 'T');
  const AT = S.seg('A', 'T', { color: RED, width: 3.4 }), BTs = S.seg('B', 'T', { color: RED, width: 3.4 }), BF = S.seg('B', 'F', { width: 0.01, color: INK });
  S.arc('A', 'B', 'T', 58); S.angLab('A', 'B', 'T', 82, T(a + '^\\circ'), { cls: 'u9l7-alab big' });
  S.arc('B', 'F', 'T', 34); S.angLab('B', 'F', 'T', 58, T(b + '^\\circ'), { cls: 'u9l7-alab big', dx: 0 });
  S.arc('B', 'A', 'T', 26, { color: '#b5810f', width: 3 }); const l1 = S.angLab('B', 'A', 'T', 46, '<b>1</b>', { cls: 'u9l7-alab u9l7-num' });
  S.arc('T', 'A', 'B', 46, { color: '#b5810f', width: 3 }); const l2 = S.angLab('T', 'A', 'B', 70, '<b>2</b>', { cls: 'u9l7-alab u9l7-num' });
  for (const n of ['A', 'B']) { svgEl('circle', { cx: S.P(n)[0], cy: S.P(n)[1], r: 6, fill: INK }, S.svg); S.lab(n, `<b>${n}</b>`, { pos: 's', gap: 12, cls: 'u9l7-who' }); }
  svgEl('circle', { cx: S.P('T')[0], cy: S.P('T')[1], r: 6, fill: RED }, S.svg);
  S.lab([d / 2, 0], '40 m', { pos: 's', gap: 40, cls: 'u9l7-lab u9l7-chip' });
  const q = S.lab([F, hh / 2], '? m', { pos: 'e', gap: 10, cls: 'u9l7-lab u9l7-red' });
  return { b, xB, hh, F, shade, FT, rm, AT, BTs, BF, l1, l2, q };
}
const cliff = {
  title: 'The Unreachable Cliff: solve the triangle you can, hand its side on',
  height: 430,
  choices: Object.keys(CLIFF).map((k) => ({ v: k, label: CLIFF[k].label })),
  intro: (v) => (v === 'walk' ? 'The board picture. Answer warm-up 1–3 and guess the big one, then press <b>Next</b>.' : 'The teacher-notes follow-up: the angles are 25° then 50°, still 40 m apart. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const a = CLIFF[v].a, d = 40, b = 2 * a, W = 620;
    const xB = d * cosD(b), F = d + xB, hh = d * sinD(b);
    const S = new Scene(stage, { x: 4, y: 6, width: W, height: 410, xmin: -4, xmax: F + 16, ymin: -2.2, ymax: hh + 1, pad: [22, 8, 58, 8] });
    const K = drawCliff(S, a, d), Pn = panel(stage, W + 16, 8, ex.W - W - 22, 404, 'Work');
    const g = S.glow('B', 'T'), roleBT = S.tag('B', 'T', 'hyp', 'F', { off: 22 }), roleFT = S.tag('F', 'T', 'opp', 'B', { off: 30 }), roleBF = S.tag('B', 'F', 'adj', 'T', { off: 26 });
    const tick = (p, q) => { const P = S.P(p), Q = S.P(q), M = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], [ux, uy] = norm(Q[0] - P[0], Q[1] - P[1]); return svgEl('path', { d: `M${M[0] - uy * 9} ${M[1] + ux * 9}L${M[0] + uy * 9} ${M[1] - ux * 9}`, stroke: GOLDD, 'stroke-width': 3.5, opacity: 0 }, S.svg); };
    const t1 = tick('A', 'B'), t2 = tick('B', 'T'), bt = hide(S.sideLab('B', 'T', '40 m', 'A', { off: 24, cls: 'u9l7-lab u9l7-gold' }));
    const ang1 = 180 - b, ang2 = 180 - a - ang1;
    return [
      { cap: `Angle <b>1</b> and the ${T(b + '^\\circ')} angle sit on a straight line: angle 1 ${T('=180^\\circ-' + b + '^\\circ=' + ang1 + '^\\circ')}.`,
        run: async (c) => { K.l1.innerHTML = `<b>1</b>${T('=' + ang1 + '^\\circ')}`; await pulse(c, K.l1, 1.25); await say(c, Pn, T(`\\angle 1=180^\\circ-${b}^\\circ=${ang1}^\\circ`)); } },
      { cap: `The shaded triangle’s angles add to ${T('180^\\circ')}: angle 2 ${T(`=180^\\circ-${a}^\\circ-${ang1}^\\circ=${ang2}^\\circ`)}.`,
        run: async (c) => { K.l2.innerHTML = `<b>2</b>${T('=' + ang2 + '^\\circ')}`; await pulse(c, K.l2, 1.25); await say(c, Pn, T(`\\angle 2=180^\\circ-${a}^\\circ-${ang1}^\\circ=${ang2}^\\circ`)); } },
      { cap: `Two equal angles (${T(a + '^\\circ')} and ${T(a + '^\\circ')}): the shaded triangle is <b>isosceles</b>. The sides opposite them are equal, so the sight line ${T('BT=AB=40')} m.`,
        run: async (c) => { await Promise.all([appear(c, t1, 300), appear(c, t2, 300)]); await glowOn(c, g); await pop(c, bt); await say(c, Pn, `${T('BT=AB=' + cG('40') + '\\text{ m}')} <span class="u9l7-small muted">(isosceles)</span>`); } },
      { cap: `${T('BT')} is the <b>shared side</b>. The right triangle at the cliff uses it as its <b>hypotenuse</b>, and the height is <b>opposite</b> the ${T(b + '^\\circ')} angle.`,
        run: async (c) => {
          await anim(c, K.shade, [{ opacity: 1 }, { opacity: 0.25 }], 400);
          const arc = S.arc('B', 'F', 'T', 34, { color: REF, width: 4 }); await drawIn(arc, 400, c);
          K.BF.setAttribute('stroke-width', 4.5); K.BF.setAttribute('stroke', ADJ); K.FT.removeAttribute('stroke-dasharray');
          await role(c, K.BTs, roleBT, 'hyp'); await role(c, K.FT, roleFT, 'opp'); await pop(c, roleBF, 300);
        } },
      { cap: `SOH: ${T(`\\sin ${b}^\\circ=\\dfrac{h}{40}`)}, so ${T(`h=40\\sin ${b}^\\circ\\approx${r1(hh)}`)} m. ${v === 'walk' ? 'The big one is <b>B, about 35 m</b>.' : 'Same trick, any angle that doubles.'}`,
        run: async (c) => { await say(c, Pn, T(`\\sin ${b}^\\circ=\\dfrac{${cO('h')}}{${cH('40')}}`)); await say(c, Pn, T(`h=40\\sin ${b}^\\circ=${cO(r2(hh))}\\text{ m}`)); K.q.innerHTML = `${T('h\\approx' + r1(hh))} m`; K.q.classList.remove('u9l7-red'); K.q.style.color = OPP; await pulse(c, K.q, 1.2); } },
      { cap: `Check from A: ${T('BF=40\\cos ' + b + '^\\circ=' + r2(xB))}, so the base is ${T(r2(xB) + '+40=' + r2(F))} m from A, and ${T(`\\tan^{-1}\\!\\left(\\dfrac{${r2(hh)}}{${r2(F)}}\\right)=${a}^\\circ`)} ✓`,
        run: async (c) => { await say(c, Pn, T(`BF=40\\cos ${b}^\\circ=${r2(xB)}`)); await say(c, Pn, T(`\\tan^{-1}\\!\\left(\\tfrac{${r2(hh)}}{${r2(F)}}\\right)=${a}^\\circ`) + ' <span class="u9l7-good">✓</span>'); await stampIn(c, stamp(stage, '✓', { x: W - 50, y: 56 })); } }
    ];
  }
};

/* =============================== Example 1: two towers =============================== */
const TW = {
  ex1: { label: 'Example 1 check', n1: 'Ashgrove', n2: 'Birchwood', d: 38, aB: 51, aT: 22, up: true },
  low: { label: 'Shorter second tower', n1: 'Tower 1', n2: 'Tower 2', d: 30, aB: 60, aT: 25, up: false }
};
const towers = {
  title: 'Two towers, one shared horizontal distance',
  height: 470,
  choices: Object.keys(TW).map((k) => ({ v: k, label: TW[k].label })),
  intro: (v) => (v === 'ex1' ? 'Example 1, after the class has tried it. Press <b>Next</b>.' : 'What if the second tower is <b>shorter</b>? Look <b>down</b> to its top. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const o = TW[v], d = o.d, H1 = d * tanD(o.aB), pc = d * tanD(o.aT), H2 = o.up ? H1 + pc : H1 - pc, W = 560;
    const S = new Scene(stage, { x: 0, y: 4, width: W, height: 460, xmin: 0, xmax: d, ymin: 0, ymax: Math.max(H1, H2), pad: [40, 150, 64, 150] });
    S.pt('O', 0, 0).pt('M', 0, H1).pt('N', d, 0).pt('K', d, H1).pt('T2', d, H2).pt('E', d + 0.25 * d, H1);
    S.seg([-0.25 * d, 0], [d * 1.25, 0], { width: 2.5 });
    const t1 = S.seg('O', 'M', { width: 6 }), t2 = S.seg('N', 'T2', { width: 6 });
    S.lab([0, H1 / 2], o.n1, { pos: 'w', gap: 14, cls: 'u9l7-lab u9l7-name' }); S.lab([d, Math.min(H1, H2) / 2], o.n2, { pos: 'e', gap: 14, cls: 'u9l7-lab u9l7-name' });
    const hz = S.seg('M', 'E', { dash: '9 7', width: 2.2 });
    const dl = S.lab([d / 2, 0], `${d} m`, { pos: 's', gap: 10, cls: 'u9l7-lab' });
    const Pn = panel(stage, W + 12, 8, ex.W - W - 18, 454, 'Work');
    // pieces drawn later
    const sB = S.seg('M', 'N', { dash: '3 6', width: 2.6 }), sT = S.seg('M', 'T2', { dash: '3 6', width: 2.6 });
    [sB, sT].forEach(hide);
    const aBarc = hide(S.arc('M', 'E', 'N', 46)), aBl = hide(S.angLab('M', 'E', 'N', 72, T(o.aB + '^\\circ')));
    const aTarc = hide(S.arc('M', 'E', 'T2', 86)), aTl = hide(S.angLab('M', 'E', 'T2', 112, T(o.aT + '^\\circ')));
    const z = hide(S.path([[d * 1.2, H1], 'M', 'N', [-0.2 * d, 0]], { color: REF, width: 5, cls: 'u9l7-z' }));
    const zArc = hide(S.arc('N', 'O', 'M', 46, { color: REF, width: 3.5 })), zl = hide(S.angLab('N', 'O', 'M', 72, T(o.aB + '^\\circ'), { color: REF }));
    const g0 = S.glow('O', 'N'), mk = hide(S.seg('M', 'K', { width: 4.5, color: ADJ })), mkl = hide(S.lab([d / 2, H1], `${d} m`, { pos: o.up ? 's' : 'n', gap: 8, cls: 'u9l7-lab u9l7-gold' }));
    const rk = hide(S.rmark('K', 'M', 'T2')), ro = hide(S.rmark('O', 'N', 'M'));
    const tg = { OM: S.tag('O', 'M', 'opp', [-d, H1 / 2], { off: 30 }), ON: S.tag('O', 'N', 'adj', 'M', { off: 52 }), NM: S.tag('N', 'M', 'hyp', 'O', { off: 26 }), KT: S.tag('K', 'T2', 'opp', 'M', { off: 34 }), MT: S.tag('M', 'T2', 'hyp', 'K', { off: 24 }) };
    const on = S.seg('O', 'N', { width: 0.01 });
    const hd = (x, f) => `${x}=${f}`;
    const N1 = o.n1.split(' ')[0], vH = 'H';
    const stackL = S.layer(), copy = S.seg('O', 'M', { width: 7, color: GOLD, L: stackL }); void copy; hide(stackL.g);
    return [
      { cap: `From the top of ${o.n1}, look along the dashed horizontal: <b>down</b> ${T(o.aB + '^\\circ')} to ${o.n2}’s base, ${o.up ? '<b>up</b>' : 'and <b>down</b>'} ${T(o.aT + '^\\circ')} to its top. Two sight lines make <b>two right triangles</b>.`,
        run: async (c) => { for (const e of [sB, sT]) { e.style.opacity = 1; await drawIn(e, 500, c); } for (const e of [aBarc, aTarc]) await appear(c, e, 250); await pop(c, aBl); await pop(c, aTl); } },
      { cap: `The two horizontals (eye level and the ground) are parallel, so the angles of the <b>Z</b> are equal: the ${T(o.aB + '^\\circ')} angle of depression equals the angle of elevation from ${o.n2}’s base up to ${o.n1}’s top.`,
        run: async (c) => { z.style.opacity = 1; await drawIn(z, 900, c); await appear(c, zArc, 300); await pop(c, zl); await sleep(c, 400); await anim(c, z, [{ opacity: 1 }, { opacity: 0.25 }], 400); } },
      { cap: `Lower triangle, from the ${T(o.aB + '^\\circ')} at the base: ${o.n1}’s height is <b>opposite</b>, the ${T(d)} m is <b>adjacent</b>. TOA: ${T(`${vH}=${d}\\tan ${o.aB}^\\circ=${dots(H1)}\\approx${r0(H1)}`)} m.`,
        run: async (c) => {
          await appear(c, ro, 250); sB.setAttribute('stroke-dasharray', ''); on.setAttribute('stroke-width', 4.5);
          await role(c, t1, tg.OM, 'opp'); await role(c, on, tg.ON, 'adj'); await role(c, sB, tg.NM, 'hyp');
          await say(c, Pn, `<b>Lower</b> ${T(`\\tan ${o.aB}^\\circ=\\dfrac{${cO(vH)}}{${cA(d)}}`)}`);
          await say(c, Pn, T(`${hd(cO(vH), `${d}\\tan ${o.aB}^\\circ`)}=${dots(H1)}`));
          await say(c, Pn, `${N1}: ${T('\\approx' + r0(H1))} m`, 'u9l7-res');
        } },
      { cap: `The horizontal from ${o.n1}’s top across to ${o.n2} is the <b>same ${d} m</b>: the side both triangles share. Carry it up to eye level.`,
        run: async (c) => { await glowOn(c, g0); await carry(c, S, 'O', 'N', [0, 0], [0, -H1 * S.s], 900); await appear(c, mk, 300); await pop(c, mkl); await appear(c, rk, 250); } },
      { cap: o.up ? `Upper triangle, from the ${T(o.aT + '^\\circ')}: the extra height ${T('x')} is <b>opposite</b>, ${T(d)} m is <b>adjacent</b>: ${T(`x=${d}\\tan ${o.aT}^\\circ=${dots(pc)}`)} m.`
        : `Lower-right triangle at eye level, from the ${T(o.aT + '^\\circ')}: the <b>drop</b> ${T('x')} to ${o.n2}’s top is <b>opposite</b>, ${T(d)} m is <b>adjacent</b>: ${T(`x=${d}\\tan ${o.aT}^\\circ=${dots(pc)}`)} m.`,
        run: async (c) => {
          const kt = S.seg('K', 'T2', { width: 4.5 }); kt.style.opacity = 0; sT.setAttribute('stroke-dasharray', '');
          await role(c, kt, tg.KT, 'opp'); await role(c, sT, tg.MT, 'hyp');
          await say(c, Pn, `<b>${o.up ? 'Upper' : 'Eye level'}</b> ${T(`\\tan ${o.aT}^\\circ=\\dfrac{${cO('x')}}{${cA(d)}}`)}`);
          await say(c, Pn, T(`${cO('x')}=${d}\\tan ${o.aT}^\\circ=${dots(pc)}`));
        } },
      { cap: o.up ? `Stack the pieces: ${o.n2} ${T(`=${dots(H1)}+${dots(pc)}=${dots(H2)}\\approx${r0(H2)}`)} m. Add the <b>unrounded</b> values.`
        : `${o.n2} ${T(`=${dots(H1)}-${dots(pc)}=${dots(H2)}\\approx${r0(H2)}`)} m. Looking <b>down</b> to its top means <b>subtract</b>.`,
        run: async (c) => {
          stackL.g.style.opacity = 1; await appear(c, stackL.g, 250); await S.slide(c, stackL, d * S.s, 0, 900);
          await say(c, Pn, `${o.n2}: ${T(`${dots(H1, 3)}${o.up ? '+' : '-'}${dots(pc, 3)}`)}`);
          await say(c, Pn, T(`=${dots(H2)}\\approx${r0(H2)}`) + ' m', 'u9l7-res');
          await pulse(c, t2, 1.04);
        } },
      { cap: `Check: ${T(`\\tan^{-1}\\!\\left(\\dfrac{${H1.toFixed(3)}}{${d}}\\right)=${o.aB}^\\circ`)} ✓ and ${T(`\\tan^{-1}\\!\\left(\\dfrac{${pc.toFixed(3)}}{${d}}\\right)=${o.aT}^\\circ`)} ✓`,
        run: async (c) => { await stampIn(c, stamp(stage, '✓', { x: 60, y: 60 })); } }
    ];
  }
};

/* =============================== never round the shared side =============================== */
const NR = {
  ex3: { label: 'Example 3: round EC first?', nl: [63, 64], cut: [63.5], band: [63.5, 64], good: acosD(4.5 * sinD(35) / 5.8), bad: acosD(2.6 / 5.8),
    L: [`${T('EC=4.5\\sin 35^\\circ=' + cG('2.58109\\ldots'))}`, `${T('\\cos\\angle BEC=\\dfrac{2.58109\\ldots}{5.8}=0.445016\\ldots')}`, `${T('\\angle BEC=63.58^\\circ')}`],
    R: [`${T('EC=4.5\\sin 35^\\circ\\approx' + cG('2.6'))} <span class="u9l7-small">(rounded)</span>`, `${T('\\cos\\angle BEC=\\dfrac{2.6}{5.8}=0.448275\\ldots')}`, `${T('\\angle BEC=63.37^\\circ')}`],
    ga: '64^\\circ', ba: '63^\\circ' },
  ex4: { label: 'Example 4: round the quotients?', nl: [35, 38], cut: [35.5, 36.5, 37.5], band: [36.5, 37.5], good: 25 / (1 / tanD(32) - 1 / tanD(47)), bad: 25 / 0.7,
    L: [`${T('\\tfrac{1}{\\tan 32^\\circ}-\\tfrac{1}{\\tan 47^\\circ}')}`, `${T('=1.60033\\ldots-0.93251\\ldots=0.66781\\ldots')}`, `${T('h=25\\div0.66781\\ldots=37.44')}`],
    R: [`<span class="u9l7-small">to one decimal place:</span>`, `${T('1.6-0.9=0.7')}`, `${T('h=25\\div0.7=35.71')}`],
    ga: '37\\text{ m}', ba: '36\\text{ m}' }
};
const noround = {
  title: 'Never round the shared side',
  height: 450,
  choices: Object.keys(NR).map((k) => ({ v: k, label: NR[k].label })),
  intro: 'The same problem worked twice: once with every digit kept, once rounded partway. Press <b>Next</b>.',
  make(stage, v, ex) {
    const o = NR[v], w = (ex.W - 30) / 2;
    const Lp = panel(stage, 8, 8, w, 196, '<span class="u9l7-good">Keep every digit</span>'), Rp = panel(stage, w + 22, 8, w, 196, '<span class="u9l7-bad">Round too early</span>');
    const N = new NumberLine(stage, { x: 20, y: 214, width: ex.W - 40, height: 200, min: o.nl[0], max: o.nl[1], step: v === 'ex3' ? 0.1 : 0.5, labels: v === 'ex3' ? [{ v: 63, html: T('63^\\circ') }, { v: 63.5, html: T('63.5^\\circ') }, { v: 64, html: T('64^\\circ') }] : [35, 35.5, 36, 36.5, 37, 37.5, 38].map((x) => ({ v: x, html: T(String(x)) })), axisY: 130 });
    const bandG = N.interval(o.band[0], o.band[1], { color: 'green', width: 12, openB: true }), bandL = N.mark((o.band[0] + o.band[1]) / 2, `rounds to ${T(o.ga)}`, { lift: 62, color: GRN });
    const lo = v === 'ex3' ? [63, 63.5] : [35.5, 36.5], bandR = N.interval(lo[0], lo[1], { color: 'red', width: 12, openB: true }), bandRL = N.mark((lo[0] + lo[1]) / 2, `rounds to ${T(o.ba)}`, { lift: 62, color: RED });
    [bandG, bandL, bandR, bandRL].forEach(hide);
    const pg = hide(N.point(o.good, { color: GRN, r: 9 })), pb = hide(N.point(o.bad, { color: RED, r: 9 }));
    const lg = hide(N.mark(o.good, T(o.good.toFixed(2)), { color: GRN, lift: 10, cls: 'u9l7-nlv' })), lb = hide(N.mark(o.bad, T(o.bad.toFixed(2)), { color: RED, lift: 10, cls: 'u9l7-nlv' }));
    return [
      { cap: v === 'ex3' ? `Find ${T('EC')} in the first triangle and carry <b>every digit</b> into the second: ${T('\\angle BEC=63.58^\\circ')}.` : `Keep both quotients unrounded: ${T('h=25\\div0.66781\\ldots=37.44')} m.`,
        run: async (c) => { for (const s of o.L) await say(c, Lp, s); } },
      { cap: v === 'ex3' ? `Now round ${T('EC')} to ${T('2.6')} first. The second triangle starts from the wrong number: ${T('\\cos^{-1}(2.6\\div5.8)=63.37^\\circ')}.` : `Now round each quotient to one decimal place first: ${T('1.6-0.9=0.7')}, and ${T('25\\div0.7=35.71')}.`,
        run: async (c) => { for (const s of o.R) await say(c, Rp, s); } },
      { cap: v === 'ex3' ? `Only ${T('0.2^\\circ')} apart, but ${T('63.5^\\circ')} is the line between rounding <b>down</b> and rounding <b>up</b>.` : `The difference ${T('1.60-0.93')} is <b>small</b>, so a tiny rounding error in either piece is a big error in ${T('h')}.`,
        run: async (c) => { bandR.style.opacity = 1; bandG.style.opacity = 1; await Promise.all([drawIn(bandR, 500, c), drawIn(bandG, 500, c)]); await Promise.all([fadeIn(c, bandRL), fadeIn(c, bandL)]); await pop(c, pg); await fadeIn(c, lg); await pop(c, pb); await fadeIn(c, lb); } },
      { cap: `Full accuracy: ${T(o.ga)} ✓. Rounded early: ${T(o.ba)}, the wrong answer ✗. <b>Never round the shared side:</b> round only the final answer.`,
        run: async (c) => { await say(c, Lp, `<span class="u9l7-good">${T('\\approx' + o.ga)} ✓</span>`, 'u9l7-res'); await say(c, Rp, `<span class="u9l7-bad">${T('\\approx' + o.ba)} ✗</span>`, 'u9l7-res'); await stampIn(c, stamp(stage, '✓', { x: w - 30, y: 150 })); await stampIn(c, stamp(stage, '✗', { ok: false, x: 2 * w - 10, y: 150 })); } }
    ];
  }
};

/* =============================== ★ the chain: two right triangles sharing a side =============================== */
const EC3 = 4.5 * sinD(35), PS2 = 24 * tanD(48), RS2 = PS2 * tanD(57), BEC = acosD(EC3 / 5.8), BC3 = Math.sqrt(5.8 * 5.8 - EC3 * EC3), AC3 = 4.5 * cosD(35);
const CH = {
  ex2: { label: 'Example 2 check', L: 'R', F: 'S', R: 'Q', Tp: 'P', xl: -RS2, xr: 24, ht: PS2, unit: 'mm' },
  ex3: { label: 'Example 3 check', L: 'B', F: 'C', R: 'A', Tp: 'E', xl: -BC3, xr: AC3, ht: EC3, unit: 'm' }
};
const chain = {
  title: 'The chain: solve one triangle, hand the shared side to the other',
  height: 490,
  choices: Object.keys(CH).map((k) => ({ v: k, label: CH[k].label })),
  intro: (v) => (v === 'ex2' ? 'Example 2: find ' + T('QR') + '. Press <b>Next</b>.' : 'Example 3: find ' + T('\\angle BEC') + '. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const o = CH[v], sep = 66, W = ex.W - 12, is2 = v === 'ex2';
    const S = new Scene(stage, { x: 6, y: 0, width: W, height: 300, xmin: o.xl, xmax: o.xr, ymin: 0, ymax: o.ht, pad: [42, 40 + sep, 64, 40 + sep] });
    S.pt('L', o.xl, 0).pt('F', 0, 0).pt('R', o.xr, 0).pt('Tp', 0, o.ht);
    const L2 = S.layer(), L1 = S.layer();
    const f2 = S.poly(['L', 'F', 'Tp'], { fill: '#eef1f6', L: L2 }), f1 = S.poly(['F', 'R', 'Tp'], { fill: '#eef1f6', L: L1 });
    const s2 = { base: S.seg('L', 'F', { L: L2 }), hyp: S.seg('L', 'Tp', { L: L2 }), sh: S.seg('F', 'Tp', { L: L2 }) };
    const s1 = { base: S.seg('F', 'R', { L: L1 }), hyp: S.seg('R', 'Tp', { L: L1 }), sh: S.seg('F', 'Tp', { L: L1 }) };
    S.rmark('F', 'L', 'Tp', { L: L2 }); S.rmark('F', 'R', 'Tp', { L: L1 });
    S.vname('L', o.L, 's', { L: L2 }); S.vname('R', o.R, 's', { L: L1 });
    S.vname('F', o.F, 's', { L: L2, gap: 7 }); S.vname('Tp', o.Tp, 'n', { L: L2 });
    const dupF = hide(S.vname('F', o.F, 's', { L: L1, gap: 7 })), dupT = hide(S.vname('Tp', o.Tp, 'n', { L: L1 }));
    // the givens, as in the booklet
    let a1, a2, ref2;
    if (is2) {
      S.lab([12, 0], '24 mm', { pos: 's', gap: 8, L: L1 });
      a1 = S.arc('R', 'F', 'Tp', 54, { L: L1 }); S.angLab('R', 'F', 'Tp', 80, T('48^\\circ'), { L: L1 });
      a2 = S.arc('Tp', 'F', 'L', 48, { L: L2 }); S.angLab('Tp', 'F', 'L', 74, T('57^\\circ'), { L: L2 });
    } else {
      S.sideLab('L', 'Tp', '5.8 m', 'F', { L: L2, off: 22 }); S.sideLab('R', 'Tp', '4.5 m', 'F', { L: L1, off: 22 });
      a1 = S.arc('R', 'F', 'Tp', 60, { L: L1 }); S.angLab('R', 'F', 'Tp', 88, T('35^\\circ'), { L: L1 });
      ref2 = hide(S.arc('Tp', 'F', 'L', 40, { L: L2, color: REF, width: 4 }));
    }
    const lab2 = hide(S.angLab('Tp', 'F', 'L', is2 ? 74 : 66, is2 ? '' : T('?'), { L: L2, color: REF }));
    const g1 = S.glow('F', 'Tp', { L: L1 }), g2 = S.glow('F', 'Tp', { L: L2 });
    const tg1 = { sh: S.tag('F', 'Tp', 'opp', 'R', { L: L1, off: 30 }), base: S.tag('F', 'R', 'adj', 'Tp', { L: L1, off: is2 ? 48 : 40 }), hyp: S.tag('R', 'Tp', 'hyp', 'F', { L: L1, off: is2 ? 26 : 52 }) };
    const tg2 = { sh: S.tag('F', 'Tp', 'adj', 'L', { L: L2, off: 30 }), base: S.tag('L', 'F', 'opp', 'Tp', { L: L2, off: is2 ? 26 : 40 }), hyp: S.tag('L', 'Tp', 'hyp', 'F', { L: L2, off: is2 ? 26 : 52 }) };
    const shV1 = hide(S.sideLab('F', 'Tp', T(cG(dots(o.ht))), 'R', { L: L1, off: 0, dx: 74, cls: 'u9l7-lab u9l7-goldlab' }));
    const shV2 = hide(S.sideLab('F', 'Tp', T(cG(dots(o.ht))), 'L', { L: L2, off: 0, dx: -74, cls: 'u9l7-lab u9l7-goldlab' }));
    const pick1 = hide(S.lab([o.xr * 0.42, o.ht * 0.32], 'start here', { L: L1, cls: 'u9l7-pickon' })), pick2 = hide(S.lab([o.xl * 0.4, o.ht * 0.3], 'not yet', { L: L2, cls: 'u9l7-pickoff' }));
    const pw = (ex.W - 26) / 2, P2 = panel(stage, 8, 304, pw, 180, `Second: ${T('\\triangle ' + o.Tp + o.F + o.L)}`), P1 = panel(stage, pw + 18, 304, pw, 180, `First: ${T('\\triangle ' + o.Tp + o.F + o.R)}`);
    const link = chainIcon(S, S.P('F')[0], S.P([0, o.ht * 0.55])[1]);
    const n = (x) => T(o.F === 'S' ? x : x);
    void n;
    const steps = [];
    const T1 = `\\triangle ${o.Tp}${o.F}${o.R}`, T2 = `\\triangle ${o.Tp}${o.F}${o.L}`, sh = o.Tp + o.F === 'PS' ? 'PS' : o.F === 'S' ? 'PS' : 'EC';
    steps.push({ cap: is2 ? `Two right triangles share the altitude ${T('PS')}. Which one has <b>enough</b>? ${T(T1)} has a side (24 mm) <b>and</b> an angle (48°). ${T(T2)} has only an angle. Start with ${T(T1)}.`
      : `Two right triangles share the altitude ${T('EC')}. ${T(T1)} has a side (the hypotenuse 4.5 m) <b>and</b> an angle (35°). ${T(T2)} has only a side. Start with ${T(T1)}.`,
    run: async (c) => { f1.setAttribute('fill', '#dff3e8'); await anim(c, f1, [{ opacity: 0.3 }, { opacity: 1 }], 350); await pop(c, pick1); await pop(c, pick2); } });
    steps.push({ cap: is2 ? `In ${T(T1)}, from the 48° angle: ${T('PS')} is <b>opposite</b>, ${T('QS')} is <b>adjacent</b>. Opposite and adjacent: <b>TOA</b>.` : `In ${T(T1)}, from the 35° angle: ${T('EC')} is <b>opposite</b> and ${T('EA')} is the <b>hypotenuse</b>: <b>SOH</b>.`,
      run: async (c) => {
        await Promise.all([appear(c, pick1, 1), anim(c, pick1, [{ opacity: 1 }, { opacity: 0 }], 300), anim(c, pick2, [{ opacity: 1 }, { opacity: 0 }], 300)]);
        a1.setAttribute('stroke', REF); a1.setAttribute('stroke-width', 4);
        await role(c, s1.sh, tg1.sh, 'opp'); if (is2) await role(c, s1.base, tg1.base, 'adj'); await role(c, s1.hyp, tg1.hyp, 'hyp'); if (!is2) await role(c, s1.base, tg1.base, 'adj');
        await say(c, P1, is2 ? T(`\\tan 48^\\circ=\\dfrac{${cO('PS')}}{${cA('24')}}`) : T(`\\sin 35^\\circ=\\dfrac{${cO('EC')}}{${cH('4.5')}}`));
      } });
    steps.push({ cap: is2 ? `${T('PS=24\\tan 48^\\circ=' + dots(PS2))} mm. It <b>glows</b>: this is the shared side. Keep every digit.` : `${T('EC=4.5\\sin 35^\\circ=' + dots(EC3, 5))} m. It <b>glows</b>: this is the shared side. Keep every digit.`,
      run: async (c) => { await say(c, P1, T(is2 ? `${cO('PS')}=24\\tan 48^\\circ=${cG(dots(PS2))}` : `${cO('EC')}=4.5\\sin 35^\\circ=${cG(dots(EC3, 5))}`)); await glowOn(c, g1); await pop(c, shV1); } });
    steps.push({ cap: `Pull the triangles apart: ${T(sh)} belongs to <b>both</b>. Carry it, <b>unrounded</b>, into ${T(T2)}. That is the chain.`,
      run: async (c) => {
        await Promise.all([S.slide(c, L2, -sep, 0, 800), S.slide(c, L1, sep, 0, 800)]); await Promise.all([fadeIn(c, dupF, 200), fadeIn(c, dupT, 200)]);
        await carry(c, S, 'F', 'Tp', [sep, 0], [-sep, 0], 1000); await glowOn(c, g2); await pop(c, shV2); await pop(c, link);
      } });
    steps.push({ cap: is2 ? `In ${T(T2)}, from the 57° angle at ${T('P')}: ${T('RS')} is <b>opposite</b> and ${T('PS')} is now <b>adjacent</b>. TOA again.` : `In ${T(T2)}, from ${T('\\angle BEC')} at ${T('E')}: ${T('EC')} is now <b>adjacent</b> and ${T('EB=5.8')} is the <b>hypotenuse</b>: <b>CAH</b>.`,
      run: async (c) => {
        if (is2) { a2.setAttribute('stroke', REF); a2.setAttribute('stroke-width', 4); } else { ref2.style.opacity = 1; await drawIn(ref2, 400, c); await pop(c, lab2); }
        await role(c, s2.sh, tg2.sh, 'adj'); await role(c, s2.base, tg2.base, 'opp'); await role(c, s2.hyp, tg2.hyp, 'hyp');
        await say(c, P2, is2 ? T(`\\tan 57^\\circ=\\dfrac{${cO('RS')}}{${cA(cG(dots(PS2)))}}`) : T(`\\cos(\\angle BEC)=\\dfrac{${cA(cG(dots(EC3, 5)))}}{${cH('5.8')}}`));
      } });
    steps.push({ cap: is2 ? `${T(`RS=${dots(PS2)}\\times\\tan 57^\\circ=${dots(RS2)}`)} mm.` : `${T(`\\cos(\\angle BEC)=${dots(EC3 / 5.8, 6)}`)}, so ${T(`\\angle BEC=\\cos^{-1}(${dots(EC3 / 5.8, 6)})=${BEC.toFixed(2)}^\\circ`)}.`,
      run: async (c) => {
        if (is2) { await say(c, P2, T(`${cO('RS')}=${dots(PS2)}\\tan 57^\\circ=${dots(RS2)}`)); const l = S.sideLab('L', 'F', T(cO(dots(RS2))), 'Tp', { L: L2, off: 26 }); await pop(c, l); }
        else { await say(c, P2, T(`\\angle BEC=\\cos^{-1}(${dots(EC3 / 5.8, 6)})=${BEC.toFixed(2)}^\\circ`)); lab2.innerHTML = T(BEC.toFixed(1) + '^\\circ'); await pulse(c, lab2, 1.3); }
      } });
    steps.push({ cap: is2 ? `Slide them back together. ${T('S')} lies between ${T('R')} and ${T('Q')}: ${T(`QR=24+${dots(RS2)}=${dots(24 + RS2, 2)}\\approx 65`)} mm.` : `Slide them back together: ${T(`\\angle BEC\\approx 64^\\circ`)}. Rounding ${T('EC')} to 2.6 first would give ${T('63^\\circ')}: the wrong answer.`,
      run: async (c) => {
        await Promise.all([anim(c, link, [{ opacity: 1 }, { opacity: 0 }], 250), anim(c, dupF, [{ opacity: 1 }, { opacity: 0 }], 250), anim(c, dupT, [{ opacity: 1 }, { opacity: 0 }], 250), anim(c, tg1.base, [{ opacity: 1 }, { opacity: 0 }], 250), anim(c, tg2.base, [{ opacity: 1 }, { opacity: 0 }], 250)]);
        await Promise.all([S.slide(c, L2, 0, 0, 800), S.slide(c, L1, 0, 0, 800)]);
        if (is2) {
          const yb = -14 / S.s * 0 - 0, A = S.P('L'), B = S.P('R'), y = A[1] + 54; void yb;
          const br = svgEl('path', { class: 'bk-stroke', d: `M${A[0]} ${y - 8}L${A[0]} ${y}L${B[0]} ${y}L${B[0]} ${y - 8}`, stroke: INK, 'stroke-width': 2.5, fill: 'none' }, S.svg); await drawIn(br, 600, c);
          const l = S.hlabel((A[0] + B[0]) / 2, y + 4, T(`QR\\approx 65\\text{ mm}`), { pos: 's', gap: 2, cls: 'u9l7-res' }); await pop(c, l);
          await say(c, P2, T(`QR=24+${dots(RS2)}=${dots(24 + RS2, 2)}\\approx${cG('65')}`) + ' mm', 'u9l7-res');
        } else { await say(c, P2, T(`\\angle BEC\\approx 64^\\circ`), 'u9l7-res'); }
      } });
    steps.push({ cap: is2 ? `Check: ${T(`\\tan^{-1}\\!\\left(\\tfrac{26.65470}{24}\\right)=48^\\circ`)} ✓ and ${T(`\\tan^{-1}\\!\\left(\\tfrac{41.04464}{26.65470}\\right)=57^\\circ`)} ✓`
      : `Check with Pythagoras: ${T(`BC=\\sqrt{5.8^2-2.58109^2}=${BC3.toFixed(5)}`)}, and ${T(`2.58109^2+${BC3.toFixed(5)}^2=33.64=5.8^2`)} ✓`,
    run: async (c) => { await say(c, P1, is2 ? `${T('\\tan^{-1}(26.65470\\div24)=48^\\circ')} <span class="u9l7-good">✓</span>` : `${T(`BC=${BC3.toFixed(5)}`)}, ${T('2.58109^2+5.19403^2=5.8^2')} <span class="u9l7-good">✓</span>`, 'u9l7-small'); await stampIn(c, stamp(stage, '✓', { x: W - 40, y: 40 })); } });
    return steps;
  }
};

/* =============================== reading the shared side off both triangles =============================== */
const FR = { letters: { label: 'The frame, in letters' }, nums: { label: 'Try numbers: XW = 5, 40°, 62°', XW: 5, Y: 40, Z: 62 } };
const frame = {
  title: 'Reading the shared side off both triangles',
  height: 440,
  choices: Object.keys(FR).map((k) => ({ v: k, label: FR[k].label })),
  intro: (v) => (v === 'letters' ? 'The frame from the booklet. Press <b>Next</b>.' : 'The same frame with numbers (not from the assignment). Press <b>Next</b>.'),
  make(stage, v, ex) {
    const nums = v === 'nums', o = FR[v], W = 500, sep = 36;
    const XW = nums ? o.XW : 2.6, YW = nums ? o.XW / tanD(o.Y) : 2.6, WZ = nums ? o.XW / tanD(o.Z) : 1.6;
    const S = new Scene(stage, { x: 4, y: 10, width: W, height: 420, xmin: -YW, xmax: WZ, ymin: 0, ymax: XW, pad: [44, 30 + sep, 80, 30 + sep] });
    S.pt('Y', -YW, 0).pt('W', 0, 0).pt('Z', WZ, 0).pt('X', 0, XW);
    const LY = S.layer(), LZ = S.layer();
    const sY = { b: S.seg('Y', 'W', { L: LY }), h: S.seg('Y', 'X', { L: LY }), s: S.seg('W', 'X', { L: LY }) }, sZ = { b: S.seg('W', 'Z', { L: LZ }), h: S.seg('Z', 'X', { L: LZ }), s: S.seg('W', 'X', { L: LZ }) };
    S.rmark('W', 'Y', 'X', { L: LY }); const rz = hide(S.rmark('W', 'Z', 'X', { L: LZ }));
    S.vname('Y', 'Y', 'sw', { L: LY }); S.vname('Z', 'Z', 'se', { L: LZ }); S.vname('W', 'W', 's', { L: LY, gap: 8 }); S.vname('X', 'X', 'n', { L: LY });
    const dW = hide(S.vname('W', 'W', 's', { L: LZ, gap: 8 })), dX = hide(S.vname('X', 'X', 'n', { L: LZ }));
    const aY = S.arc('Y', 'W', 'X', 40, { L: LY, color: REF, width: 3.5 }), aZ = S.arc('Z', 'W', 'X', 40, { L: LZ, color: REF, width: 3.5 });
    S.angLab('Y', 'W', 'X', 64, nums ? T(o.Y + '^\\circ') : T('\\angle Y'), { L: LY, color: REF }); S.angLab('Z', 'W', 'X', 64, nums ? T(o.Z + '^\\circ') : T('\\angle Z'), { L: LZ, color: REF });
    [aY, aZ].forEach(hide);
    if (nums) { S.sideLab('W', 'X', T(XW + '\\text{ cm}'), 'Y', { L: LZ, off: 34 }); }
    const gY = S.glow('W', 'X', { L: LY }), gZ = S.glow('W', 'X', { L: LZ });
    const tY = { s: S.tag('W', 'X', 'opp', 'Z', { L: LY, off: 28 }), b: S.tag('Y', 'W', 'adj', 'X', { L: LY, off: 52 }) }, tZ = { s: S.tag('W', 'X', 'opp', 'Y', { L: LZ, off: nums ? 64 : 28 }), b: S.tag('W', 'Z', 'adj', 'X', { L: LZ, off: 52 }) };
    const Pn = panel(stage, W + 14, 8, ex.W - W - 20, 424, 'The frame');
    const yw = nums ? dots(YW) : 'YW', wz = nums ? dots(WZ) : 'WZ', xw = nums ? String(XW) : 'XW', tyY = nums ? `\\tan ${o.Y}^\\circ` : '\\tan(\\angle Y)', tyZ = nums ? `\\tan ${o.Z}^\\circ` : '\\tan(\\angle Z)';
    return [
      { cap: `${T('XW')} meets ${T('YZ')} at a right angle: it is an <b>altitude</b>. It splits ${T('\\triangle XYZ')} into two right triangles, and ${T('XW')} is a leg of <b>both</b>.`,
        run: async (c) => { await Promise.all([S.slide(c, LY, -sep, 0, 700), S.slide(c, LZ, sep, 0, 700)]); await appear(c, rz, 200); await Promise.all([fadeIn(c, dW, 200), fadeIn(c, dX, 200)]); await Promise.all([glowOn(c, gY), glowOn(c, gZ)]); } },
      { cap: `In ${T('\\triangle XWY')}, from ${nums ? T(o.Y + '^\\circ') : T('\\angle Y')}: ${T('XW')} is <b>opposite</b>, ${T('YW')} is <b>adjacent</b>. Opposite and adjacent: <b>TOA</b>.`,
        run: async (c) => { aY.style.opacity = 1; await drawIn(aY, 400, c); await role(c, sY.s, tY.s, 'opp'); await role(c, sY.b, tY.b, 'adj'); await say(c, Pn, `In ${T('\\triangle XWY')}: ${T(`${tyY}=\\dfrac{${cO(xw)}}{${cA('YW')}}`)}`); } },
      { cap: `The unknown ${T('YW')} is on the <b>bottom</b>, so it and ${T(nums ? `\\tan ${o.Y}^\\circ` : '\\tan(\\angle Y)')} swap places: ${T(`YW=\\dfrac{${xw}}{${tyY}}`)}${nums ? T('=' + dots(YW)) : ''}.`,
        run: async (c) => { await say(c, Pn, T(`${cA('YW')}=\\dfrac{${cO(xw)}}{${tyY}}${nums ? '=' + dots(YW) : ''}`)); if (nums) { const l = S.sideLab('Y', 'W', T(cA(dots(YW, 3))), 'X', { L: LY, off: 26 }); await pop(c, l); } } },
      { cap: `In ${T('\\triangle XWZ')}, from ${nums ? T(o.Z + '^\\circ') : T('\\angle Z')}: the <b>same</b> ${T('XW')} is opposite again, and ${T('WZ')} is adjacent. TOA again.`,
        run: async (c) => { aZ.style.opacity = 1; await drawIn(aZ, 400, c); await role(c, sZ.s, tZ.s, 'opp'); await role(c, sZ.b, tZ.b, 'adj'); await say(c, Pn, `In ${T('\\triangle XWZ')}: ${T(`${tyZ}=\\dfrac{${cO(xw)}}{${cA('WZ')}}`)}`); } },
      { cap: `Unknown on the bottom again: ${T(`WZ=\\dfrac{${xw}}{${tyZ}}`)}${nums ? T('=' + dots(WZ)) : ''}.`,
        run: async (c) => { await say(c, Pn, T(`${cA('WZ')}=\\dfrac{${cO(xw)}}{${tyZ}}${nums ? '=' + dots(WZ) : ''}`)); if (nums) { const l = S.sideLab('W', 'Z', T(cA(dots(WZ, 3))), 'X', { L: LZ, off: 26 }); await pop(c, l); } } },
      { cap: `Slide them back. ${T('W')} lies between ${T('Y')} and ${T('Z')}, so ${T('YZ=YW+WZ')}${nums ? T(`=${dots(YW)}+${dots(WZ)}=${dots(YW + WZ, 3)}\\approx ${r1(YW + WZ)}`) + ' cm' : ''}.`,
        run: async (c) => {
          await Promise.all([anim(c, dW, [{ opacity: 1 }, { opacity: 0 }], 200), anim(c, dX, [{ opacity: 1 }, { opacity: 0 }], 200), anim(c, tY.b, [{ opacity: 1 }, { opacity: 0 }], 200), anim(c, tZ.b, [{ opacity: 1 }, { opacity: 0 }], 200)]);
          await Promise.all([S.slide(c, LY, 0, 0, 700), S.slide(c, LZ, 0, 0, 700)]);
          const A = S.P('Y'), B = S.P('Z'), y = A[1] + 50;
          const br = svgEl('path', { class: 'bk-stroke', d: `M${A[0]} ${y - 8}L${A[0]} ${y}L${B[0]} ${y}L${B[0]} ${y - 8}`, stroke: INK, 'stroke-width': 2.5, fill: 'none' }, S.svg); await drawIn(br, 500, c);
          await pop(c, S.hlabel((A[0] + B[0]) / 2, y + 2, T(nums ? `YZ\\approx${r1(YW + WZ)}\\text{ cm}` : 'YZ=YW+WZ'), { pos: 's', gap: 2, cls: 'u9l7-res' }));
          await say(c, Pn, T(`YZ=${cA('YW')}+${cA('WZ')}${nums ? `\\approx${r1(YW + WZ)}` : ''}`), 'u9l7-res');
        } }
    ];
  }
};

/* =============================== which triangle first? (flowchart) =============================== */
const WH = {
  ex1: { label: 'Example 1', yes: true, n: ['The triangle at Birchwood’s base has 38 m and 51°: <b>yes</b>.', `${T('\\text{Ashgrove}=38\\tan 51^\\circ')} (TOA)`, `Upper triangle shares the 38 m: ${T('x=38\\tan 22^\\circ')} (TOA)`, `Add the pieces: Birchwood ${T('\\approx 62')} m`] },
  ex2: { label: 'Example 2', yes: true, n: [`${T('\\triangle PSQ')} has 24 mm and 48°: <b>yes</b>.`, `${T('PS=24\\tan 48^\\circ')} (TOA)`, `In ${T('\\triangle PSR')}: ${T('RS=PS\\tan 57^\\circ')} (TOA)`, `Add: ${T('QR=24+RS\\approx 65')} mm`] },
  ex3: { label: 'Example 3', yes: true, n: [`${T('\\triangle EAC')} has 4.5 m and 35°: <b>yes</b>.`, `${T('EC=4.5\\sin 35^\\circ')} (SOH)`, `In ${T('\\triangle EBC')}: ${T('\\cos(\\angle BEC)=\\tfrac{EC}{5.8}')} (CAH)`, `Read the angle: ${T('\\angle BEC\\approx 64^\\circ')}`] },
  ex4: { label: 'Example 4', yes: false, n: ['Both triangles have only an angle: <b>no</b>. The only length is the 25 m between A and B.', `${T('x=\\tfrac{h}{\\tan 47^\\circ}')}, ${T('x+25=\\tfrac{h}{\\tan 32^\\circ}')} (TOA twice)`, `Subtract: ${T('25=h\\left(\\tfrac{1}{\\tan 32^\\circ}-\\tfrac{1}{\\tan 47^\\circ}\\right)')}`, `Solve: ${T('h\\approx 37')} m`] }
};
const which = {
  title: 'Which triangle first? Which ratio? How to finish?',
  height: 440,
  choices: Object.keys(WH).map((k) => ({ v: k, label: WH[k].label })),
  intro: 'Follow one example through the plan. Press <b>Next</b>.',
  make(stage, v, ex) {
    const o = WH[v], FW = 600;
    const F = new Flowchart(stage, { x: 4, y: 4, width: FW, height: 430,
      nodes: {
        start: { x: 300, y: 34, w: 400, h: 48, html: '<b>Two right triangles share a side</b>', cls: 'bk-round' },
        q: { x: 300, y: 122, w: 470, h: 74, html: '<b>Does one triangle have a side AND an angle?</b>(or two sides)', color: 'amber' },
        solve: { x: 160, y: 228, w: 290, h: 70, html: '<b>Solve it first</b>find the shared side; keep every digit', color: 'blue' },
        carry: { x: 160, y: 318, w: 290, h: 64, html: '<b>Carry it across</b>SOH, CAH or TOA in the other', color: 'blue' },
        alg: { x: 470, y: 268, w: 250, h: 92, html: '<b>Neither has a side</b>write both distances in terms of h; subtract', color: 'purple' },
        fin: { x: 300, y: 398, w: 330, h: 50, html: '<b>Finish:</b> add, subtract, or read the angle', cls: 'bk-round', color: 'green' }
      },
      edges: [{ from: 'start', to: 'q' }, { from: 'q', to: 'solve', label: 'yes', route: 'vhv' }, { from: 'q', to: 'alg', label: 'no', route: 'vhv' }, { from: 'solve', to: 'carry' }, { from: 'carry', to: 'fin', route: 'vh' }, { from: 'alg', to: 'fin', route: 'vh' }] });
    const Pn = panel(stage, FW + 16, 8, ex.W - FW - 22, 424, o.label);
    const path = o.yes ? ['q', 'solve', 'carry', 'fin'] : ['q', 'alg', 'alg', 'fin'];
    const caps = o.yes ? ['Does one triangle have a known side and a known angle?', 'Solve that triangle first: the shared side comes out of it.', 'Carry the shared side across and choose the ratio there.', 'Finish the question.']
      : ['Does one triangle have a known side and a known angle?', 'No: write each horizontal distance in terms of h.', 'Subtract to eliminate the unknown distance.', 'Finish the question.'];
    return path.map((id, i) => ({
      cap: `${caps[i]} ${o.n[i]}`,
      run: async (c) => {
        if (i === 0) { await F.visit(c, 'start'); await F.go(c, 'start', 'q'); }
        else if (path[i] !== path[i - 1]) await F.go(c, path[i - 1], id);
        else await pulse(c, F.node(id), 1.06);
        await say(c, Pn, `<span class="u9l7-step">${i + 1}</span> ${o.n[i]}`);
      }
    }));
  }
};

/* =============================== Example 4: two sightings =============================== */
const H4 = 25 / (1 / tanD(32) - 1 / tanD(47)), X4 = H4 / tanD(47);
const sightings = {
  title: 'Two sightings, 25 m apart: neither triangle has a known side',
  height: 470,
  choices: [{ v: 'walk', label: 'Walk toward the building' }, { v: 'ex4', label: 'Example 4 check' }],
  intro: (v) => (v === 'walk' ? 'Watch the angle of elevation as you walk from A to B. Press <b>Next</b>.' : 'Example 4 (a), (b) and (c), after the class has tried them. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = 600, walk = v === 'walk';
    const S = new Scene(stage, { x: 0, y: 4, width: W, height: 460, xmin: 0, xmax: X4 + 25, ymin: 0, ymax: H4, pad: [40, 40, 150, 70] });
    S.pt('C', 0, 0).pt('T', 0, H4).pt('B', X4, 0).pt('A', X4 + 25, 0);
    S.seg([-3, 0], [X4 + 29, 0], { width: 2.5 });
    S.poly([[-4.5, 0], [0, 0], [0, H4], [-4.5, H4]], { fill: '#d9dee8', stroke: INK, sw: 1.5 });
    const TC = S.seg('C', 'T', { width: 6 }); S.rmark('C', 'B', 'T');
    S.vname('C', 'C', 'sw'); S.vname('T', 'T', 'n'); S.vname('A', 'A', 's', { gap: 8 }); S.vname('B', 'B', 's', { gap: 8 });
    const hl = S.lab([0, H4 / 2], T('h'), { pos: 'w', gap: 46, cls: 'u9l7-lab u9l7-big' });
    const gh = S.glow('C', 'T');
    const Pn = panel(stage, W + 12, 8, ex.W - W - 18, 454, walk ? 'Angle of elevation' : 'Work');
    if (walk) {
      const L = S.layer(), sl = S.seg('A', 'T', { color: RED, width: 3, L }), arcHost = S.layer(L);
      const man = h('div', 'u9l7-walker', '<svg viewBox="0 0 30 60"><circle cx="15" cy="8" r="6"/><path d="M15 14v22M15 36l-8 20M15 36l8 20M15 20l-10 10M15 20l10 10"/></svg>'); S.html.appendChild(man);
      const read = h('div', 'u9l7-readout', ''); Pn.appendChild(read);
      let xNow = X4 + 25, arcEl = null, alab = null;
      const draw = (x) => {
        xNow = x; const P = S.P([x, 0]), Tq = S.P('T'); sl.setAttribute('d', `M${P[0]} ${P[1]}L${Tq[0]} ${Tq[1]}`);
        place(man, P[0], P[1], 'n', 0); const ang = atanD(H4 / x);
        if (arcEl) arcEl.remove(); if (alab) alab.remove();
        arcEl = angleArc(arcHost.g, P, S.P([0, 0]), Tq, 40, { color: REF, width: 3.5 }); alab = S.angLab([x, 0], [0, 0], 'T', 64, T(ang.toFixed(0) + '^\\circ'), { color: REF, cls: 'u9l7-alab big' });
        read.innerHTML = `${T(`\\theta=${ang.toFixed(1)}^\\circ`)}<div class="u9l7-small muted">${(X4 + 25 - x).toFixed(0)} m walked</div>`;
      };
      draw(X4 + 25);
      const ghost = () => S.seg('A', 'T', { color: RED, width: 2, dash: '6 6', opacity: 0.5 });
      return [
        { cap: `From ${T('A')} on level ground, the angle of elevation of the top ${T('T')} is ${T('32^\\circ')}.`, run: async (c) => { await pulse(c, read, 1.15); } },
        { cap: `Walk ${T('25')} m straight toward the building. The angle grows: at ${T('B')} it is ${T('47^\\circ')}.`,
          run: async (c) => { ghost(); await tween(c, 2600, (t) => draw(X4 + 25 - 25 * t)); } },
        { cap: `Two right triangles, ${T('\\triangle TAC')} and ${T('\\triangle TBC')}, share the height ${T('h=TC')}: the shared side.`,
          run: async (c) => { await glowOn(c, gh); const f = S.poly(['A', 'C', 'T'], { fill: '#e8f0fc', op: 0.6 }); S.svg.insertBefore(f, S.svg.firstChild.nextSibling); await appear(c, f, 400); } },
        { cap: `But <b>neither</b> triangle has a known side: ${T('AC')}, ${T('BC')} and ${T('h')} are all unknown. Only the ${T('25')} m <b>between</b> ${T('A')} and ${T('B')} is known. Call ${T('BC=x')}.`,
          run: async (c) => { await pop(c, S.lab([X4 / 2, 0], T('x'), { pos: 's', gap: 10, cls: 'u9l7-lab u9l7-big' })); await pop(c, S.lab([X4 + 12.5, 0], '25 m', { pos: 's', gap: 10 })); await say(c, Pn, `Known: ${T('32^\\circ, 47^\\circ, 25\\text{ m}')}`); await say(c, Pn, `Unknown: ${T('h, x')}`); } },
        { cap: `The plan: write ${T('x')} and ${T('x+25')} in terms of ${T('h')}, then <b>subtract</b> so ${T('x')} disappears. That is Example 4.`, run: async (c) => { await say(c, Pn, '<b>Plan:</b> two expressions, subtract.'); } }
      ];
    }
    S.lab([X4 / 2, 0], T('x'), { pos: 's', gap: 8 }); S.lab([X4 + 12.5, 0], '25 m', { pos: 's', gap: 8 });
    const sA = S.seg('A', 'T'), sB = S.seg('B', 'T'); S.arc('A', 'C', 'T', 40); S.angLab('A', 'C', 'T', 66, T('32^\\circ')); S.arc('B', 'C', 'T', 34); S.angLab('B', 'C', 'T', 58, T('47^\\circ'));
    const tgh = S.tag('C', 'T', 'opp', 'B', { off: 30 }), tB = S.tag('C', 'B', 'adj', 'T', { off: 46, dx: 44 });
    // bar model below the ground
    const by = (k) => S.P([0, 0])[1] + 82 + k * 40, P0 = S.P('C')[0], PB = S.P('B')[0], PA = S.P('A')[0];
    const bar = (x1, y, color, html) => { const r = svgEl('rect', { x: P0, y: y - 13, width: x1 - P0, height: 26, rx: 6, fill: color, 'fill-opacity': 0.22, stroke: color, 'stroke-width': 2 }, S.svg); r.style.opacity = 0; const l = S.hlabel((P0 + x1) / 2, y, html, { cls: 'u9l7-barlab' }); l.style.opacity = 0; return [r, l]; };
    const bB = bar(PB, by(0), ADJ, T(`x=\\tfrac{h}{\\tan 47^\\circ}`)), bA = bar(PA, by(1), ADJ, T(`x+25=\\tfrac{h}{\\tan 32^\\circ}`));
    const gap = hide(S.hlabel((PB + PA) / 2, by(0), T(cG('25')), { cls: 'u9l7-gapl' })), gr = svgEl('rect', { x: PB, y: by(0) - 13, width: PA - PB, height: 26, rx: 6, fill: GOLD, 'fill-opacity': 0.35, stroke: GOLDD, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, S.svg); gr.style.opacity = 0;
    return [
      { cap: `(a) In ${T('\\triangle TBC')}, from ${T('47^\\circ')}: ${T('h')} is <b>opposite</b>, ${T('x')} is <b>adjacent</b>. ${T('\\tan 47^\\circ=\\tfrac{h}{x}')}, so ${T('x=\\tfrac{h}{\\tan 47^\\circ}')}.`,
        run: async (c) => { const bc = S.seg('C', 'B', { width: 0.01 }); await role(c, TC, tgh, 'opp'); await role(c, bc, tB, 'adj'); sB.setAttribute('stroke', HYP); await say(c, Pn, `(a) ${T(`\\tan 47^\\circ=\\dfrac{${cO('h')}}{${cA('x')}}`)}`); await say(c, Pn, T(`${cA('x')}=\\dfrac{h}{\\tan 47^\\circ}`)); await appear(c, bB[0], 300); await fadeIn(c, bB[1]); } },
      { cap: `(b) In ${T('\\triangle TAC')}, from ${T('32^\\circ')}: ${T('\\tan 32^\\circ=\\tfrac{h}{x+25}')}, so ${T('x+25=\\tfrac{h}{\\tan 32^\\circ}')}.`,
        run: async (c) => { sA.setAttribute('stroke', HYP); await say(c, Pn, `(b) ${T(`\\tan 32^\\circ=\\dfrac{${cO('h')}}{${cA('x+25')}}`)}`); await say(c, Pn, T(`${cA('x+25')}=\\dfrac{h}{\\tan 32^\\circ}`)); await appear(c, bA[0], 300); await fadeIn(c, bA[1]); } },
      { cap: `(c) The long bar minus the short bar is the ${T('25')} m. Subtract (a) from (b): ${T(`25=\\tfrac{h}{\\tan 32^\\circ}-\\tfrac{h}{\\tan 47^\\circ}=h(1.60033\\ldots-0.93251\\ldots)=h(0.66781\\ldots)`)}.`,
        run: async (c) => { await appear(c, gr, 400); await pop(c, gap); await say(c, Pn, `(c) ${T(`25=h\\left(\\tfrac{1}{\\tan 32^\\circ}-\\tfrac{1}{\\tan 47^\\circ}\\right)`)}`); await say(c, Pn, T(`25=h(${dots(1 / tanD(32), 5)}-${dots(1 / tanD(47), 5)})=h(${dots(1 / tanD(32) - 1 / tanD(47), 5)})`), 'u9l7-small'); } },
      { cap: `${T(`h=25\\div ${dots(1 / tanD(32) - 1 / tanD(47), 5)}=${dots(H4)}\\approx 37`)} m. Keep the two quotients unrounded: their difference is small.`,
        run: async (c) => { await say(c, Pn, T(`h=\\dfrac{25}{0.66781\\ldots}=${dots(H4)}\\approx${cG('37')}\\text{ m}`), 'u9l7-res'); hl.innerHTML = T('h\\approx37\\text{ m}'); hl.style.color = OPP; await pulse(c, hl, 1.2); } },
      { cap: `Check: ${T(`x=37.4353\\div\\tan 47^\\circ=${X4.toFixed(3)}`)} m, so ${T('AC=' + (X4 + 25).toFixed(3))} and ${T(`\\tan^{-1}\\!\\left(\\tfrac{37.4353}{${(X4 + 25).toFixed(3)}}\\right)=32^\\circ`)} ✓`,
        run: async (c) => { await say(c, Pn, `${T(`\\tan^{-1}\\!\\left(\\tfrac{37.4353}{${(X4 + 25).toFixed(3)}}\\right)=32^\\circ`)} <span class="u9l7-good">✓</span>`, 'u9l7-small'); await stampIn(c, stamp(stage, '✓', { x: W - 40, y: 50 })); } }
    ];
  }
};

/* =============================== ★ Extension: the box and its space diagonal =============================== */
const BOXF = [['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H'], ['A', 'B', 'F', 'E'], ['B', 'C', 'G', 'F'], ['C', 'D', 'H', 'G'], ['D', 'A', 'E', 'H']];
const boxVerts = (l, w, hh) => ({ A: [0, 0, 0], B: [l, 0, 0], C: [l, w, 0], D: [0, w, 0], E: [0, 0, hh], F: [l, 0, hh], G: [l, w, hh], H: [0, w, hh] });
const BX = { ex5: { label: 'Example 5 check', l: 4, w: 3, hh: 12, s: 25 }, spin: { label: 'Any box: l × w × h', l: 6, w: 2, hh: 3, s: 46 } };
const box3d = {
  title: 'A box hides two right triangles that share the base diagonal',
  height: 480,
  choices: Object.keys(BX).map((k) => ({ v: k, label: BX[k].label })),
  intro: (v) => (v === 'ex5' ? 'Example 5: a box 4 cm by 3 cm by 12 cm. Press <b>Next</b>.' : 'A box 6 by 2 by 3: find the diagonal through the inside. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const o = BX[v], W = 520, ex5 = v === 'ex5', AC = Math.hypot(o.l, o.w), AG = Math.hypot(AC, o.hh), ang = atanD(o.hh / AC);
    const hostEl = add(stage, box(h('div', 'u9l7-3d'), W, 470), 4, 4), svg = svgEl('svg', { width: W, height: 470 }, hostEl), hp = h('div', 'u9l7-hl'); hostEl.appendChild(hp);
    const yaw0 = -28, pit0 = 22, faceOn = Math.atan2(-o.w, o.l) / RAD;
    const B = new Solid3(svg, hp, { verts: boxVerts(o.l, o.w, o.hh), faces: BOXF, c: [o.l / 2, o.w / 2, o.hh / 2], s: o.s, ox: W / 2, oy: 240, view: { yaw: yaw0, pitch: pit0 } });
    ['F', 'E', 'H'].forEach((n) => { if (ex5) B.vl[n].style.opacity = 0; });
    const V = B.verts;
    B.label(lerp3(V.A, V.B, 0.5), T(String(o.l)), { out: 22 }); B.label(lerp3(V.B, V.C, 0.5), T(String(o.w)), { out: 22 }); B.label(lerp3(V.C, V.G, 0.5), T(String(o.hh)), { out: 22 });
    const base = B.add('poly', ['A', 'B', 'C'], { fill: '#fff1d6', 'fill-opacity': 0.9, stroke: 'none' }, B.faceG), vert = B.add('poly', ['A', 'C', 'G'], { fill: '#dbe7fb', 'fill-opacity': 0.85, stroke: 'none' }, B.faceG);
    [base, vert].forEach(hide);
    const acDot = B.add('path', ['A', 'C'], { stroke: INK, 'stroke-width': 2.4, 'stroke-dasharray': '2 6' }), agDot = B.add('path', ['A', 'G'], { stroke: INK, 'stroke-width': 2.4, 'stroke-dasharray': '2 6' });
    const ux = unit3([1, 0, 0]), uy = unit3([0, 1, 0]), uAC = unit3([o.l, o.w, 0]), z = [0, 0, 1], k = Math.min(o.l, o.w) * 0.22;
    const rmB = hide(B.add('path', [add3(V.B, ux, -k), add3(add3(V.B, ux, -k), uy, k), add3(V.B, uy, k)], { stroke: INK, 'stroke-width': 2 }));
    const rmC = hide(B.add('path', [add3(V.C, uAC, -k * 1.4), add3(add3(V.C, uAC, -k * 1.4), z, k * 1.4), add3(V.C, z, k * 1.4)], { stroke: INK, 'stroke-width': 2 }));
    const acGlow = hide(B.add('path', ['A', 'C'], { stroke: GOLD, 'stroke-width': 15, 'stroke-opacity': 0.55 }, B.faceG));
    const acL = B.add('path', ['A', 'C'], { stroke: ADJ, 'stroke-width': 4.5 }), cgL = B.add('path', ['C', 'G'], { stroke: OPP, 'stroke-width': 4.5 }), agL = B.add('path', ['A', 'G'], { stroke: HYP, 'stroke-width': 5 });
    [acL, cgL, agL].forEach(hide);
    const acLab = hide(B.label(lerp3(V.A, V.C, 0.55), T(cG(ex5 ? '5' : '\\sqrt{40}')), { dy: 18, cls: 'u9l7-lab u9l7-goldlab' }));
    const agLab = hide(B.label(lerp3(V.A, V.G, 0.5), T(cH(String(AG))), { dx: -22, dy: -6, cls: 'u9l7-lab u9l7-big' }));
    const arcPts = arc3(V.A, uAC, z, ang, AC * 0.26), arcEl = hide(B.add('path', arcPts, { stroke: REF, 'stroke-width': 3.5 }));
    const arcLab = hide(B.label(add3(add3(V.A, uAC, AC * 0.42), z, AC * 0.2), T(`${ang.toFixed(0)}^\\circ`), { color: REF, cls: 'u9l7-lab u9l7-alab big' }));
    const Pn = panel(stage, W + 14, 8, ex.W - W - 20, 464, ex5 ? 'Example 5' : 'Any box');
    const steps = [
      { cap: ex5 ? `A box: base ${T('ABCD')} is 4 cm by 3 cm, and ${T('G')} is 12 cm directly above ${T('C')}. Watch it turn: the dotted ${T('AG')} runs through the <b>inside</b>.` : `A box 6 by 2 by 3. The dotted ${T('AG')} is a <b>space diagonal</b>: it runs through the inside of the box.`,
        run: async (c) => { await B.turn(c, yaw0 + 360, pit0, 4200); B.view.yaw = yaw0; B.render(); } },
      { cap: `${ex5 ? '(a) ' : ''}The base hides a right triangle: ${T('\\triangle ABC')}, with the right angle at ${T('B')}.`,
        run: async (c) => { await appear(c, base, 400); await appear(c, rmB, 300); } },
      { cap: `${T(`AC=\\sqrt{${o.l}^2+${o.w}^2}=\\sqrt{${o.l * o.l + o.w * o.w}}${ex5 ? '=5' : '\\approx' + AC.toFixed(2)}`)}${ex5 ? ' cm' : ''}. ${T('AC')} glows: it is the side the two triangles <b>share</b>.`,
        run: async (c) => { await appear(c, acL, 300); await appear(c, acGlow, 400); await pop(c, acLab); await say(c, Pn, T(`AC=\\sqrt{${o.l}^2+${o.w}^2}=${ex5 ? cG('5') + '\\text{ cm}' : cG('\\sqrt{40}')}`)); } },
      { cap: `${T('\\triangle ACG')} stands <b>vertically</b> on ${T('AC')}: ${T('CG')} is vertical, so the right angle is at ${T('C')}.`,
        run: async (c) => { await appear(c, vert, 400); await appear(c, rmC, 300); await appear(c, cgL, 300); } },
      { cap: `Turn the box until ${T('\\triangle ACG')} faces us: a flat right triangle with legs ${T(ex5 ? '5' : '\\sqrt{40}')} and ${T(String(o.hh))}.`,
        run: async (c) => { await Promise.all([B.turn(c, faceOn, 4, 1800), B.dimEdges(c, 0.28)]); } },
      { cap: ex5 ? `${T('AG=\\sqrt{5^2+12^2}=\\sqrt{169}=13')} cm. The box’s diagonal is the <b>hypotenuse</b> of the second right triangle.` : `${T(`AG=\\sqrt{AC^2+CG^2}=\\sqrt{40+9}=\\sqrt{49}=7`)}. In one line: ${T('d=\\sqrt{l^2+w^2+h^2}')}.`,
        run: async (c) => { agDot.style.opacity = 0; agL.style.opacity = 1; await drawIn(agL, 700, c); await pop(c, agLab); await say(c, Pn, T(ex5 ? `AG=\\sqrt{${cA('5')}^2+${cO('12')}^2}=\\sqrt{169}=${cH('13')}\\text{ cm}` : `AG=\\sqrt{${cA('40')}+${cO('3')}^2}=\\sqrt{49}=${cH('7')}`)); if (!ex5) await say(c, Pn, T('d=\\sqrt{l^2+w^2+h^2}'), 'u9l7-res'); } }
    ];
    if (ex5) steps.push(
      { cap: `${T('\\tan(\\angle GAC)=\\tfrac{12}{5}')}, so ${T('\\angle GAC=\\tan^{-1}(2.4)=67.38^\\circ\\approx 67^\\circ')}.`,
        run: async (c) => { arcEl.style.opacity = 1; await drawIn(arcEl, 500, c); await pop(c, arcLab); await say(c, Pn, T(`\\tan(\\angle GAC)=\\dfrac{${cO('12')}}{${cA('5')}}`)); await say(c, Pn, T('\\angle GAC=\\tan^{-1}(2.4)=67.38^\\circ\\approx67^\\circ'), 'u9l7-res'); } },
      { cap: `Turn back: ${T('67^\\circ')} is the angle the diagonal ${T('AG')} makes with the base. Two right triangles, chained by ${T('AC')}.`,
        run: async (c) => { await Promise.all([B.turn(c, yaw0, pit0, 1800), B.dimEdges(c, 1)]); } });
    else steps.push({ cap: `Turn back. The base diagonal was handed up from the floor triangle to the vertical one: the same chain in 3-D.`, run: async (c) => { await Promise.all([B.turn(c, yaw0, pit0, 1800), B.dimEdges(c, 1)]); } });
    void acDot;
    return steps;
  }
};

/* =============================== Extension: the wedge =============================== */
const WV = { A: [0, 0, 0], B: [11, 0, 0], C: [11, 6, 0], D: [0, 6, 0], E: [0, 0, 2], F: [11, 0, 2], G: [11, 6, 9], H: [0, 6, 9] };
const WF = [['A', 'B', 'C', 'D'], ['A', 'B', 'F', 'E'], ['D', 'C', 'G', 'H'], ['E', 'F', 'G', 'H'], ['A', 'D', 'H', 'E'], ['B', 'C', 'G', 'F']];
const HEE = atanD(7 / 6);
const wedge = {
  title: 'The wedge: rectangles, and a right triangle hiding in a side face',
  height: 470,
  choices: [{ v: 'a', label: '(a) The four rectangles' }, { v: 'bc', label: '(b)–(c) The side face' }],
  intro: (v) => (v === 'a' ? 'Example 6 (a): which faces are rectangles? Press <b>Next</b>.' : 'Example 6 (b) and (c): work in the side face ' + T('ADHE') + '. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = 560, yaw0 = -22, pit0 = 16;
    const hostEl = add(stage, box(h('div', 'u9l7-3d'), W, 460), 4, 4), svg = svgEl('svg', { width: W, height: 460 }, hostEl), hp = h('div', 'u9l7-hl'); hostEl.appendChild(hp);
    const S3 = new Solid3(svg, hp, { verts: WV, faces: WF, c: [5.5, 3, 4.5], s: 34, ox: W / 2, oy: 240, view: { yaw: yaw0, pitch: pit0 } });
    const V = WV, mid = (a, b) => lerp3(V[a], V[b], 0.5);
    S3.label(mid('A', 'B'), '11', { out: 24 }); S3.label(mid('A', 'D'), '6', { out: 22 }); S3.label(mid('A', 'E'), '2', { out: 24 }); S3.label(mid('C', 'G'), '9', { out: 24 });
    const Pn = panel(stage, W + 14, 8, ex.W - W - 20, 454, v === 'a' ? 'Rectangles?' : 'Side face ADHE');
    const face = (f, color) => hide(S3.add('poly', f, { fill: color, 'fill-opacity': 0.45, stroke: 'none' }, S3.faceG));
    if (v === 'a') {
      const R = [['A', 'B', 'C', 'D'], ['A', 'B', 'F', 'E'], ['D', 'C', 'G', 'H'], ['E', 'F', 'G', 'H']].map((f) => face(f, '#a8d8c2'));
      const Tz = [face(['A', 'D', 'H', 'E'], '#f3b3ad'), face(['B', 'C', 'G', 'F'], '#f3b3ad')];
      const txt = [`Base ${T('ABCD')}: 11 by 6, a rectangle.`, `Front ${T('ABFE')}: ${T('EA=FB=2')}, so a rectangle.`, `Back ${T('DCGH')}: ${T('HD=GC=9')}, so a rectangle.`, `Top ${T('EFGH')}: ${T('EF')} and ${T('HG')} run along ${T('AB')}; ${T('EH')} and ${T('FG')} lie in faces perpendicular to ${T('AB')}. The corners are ${T('90^\\circ')}: a rectangle.`];
      const show = (i) => async (c) => { R.forEach((g, j) => { if (j !== i) g.setAttribute('fill-opacity', 0.16); }); R[i].setAttribute('fill-opacity', 0.45); await appear(c, R[i], 400); await say(c, Pn, `<span class="u9l7-step ok">${i + 1}</span> ${txt[i].split(':')[0]}`); };
      const steps = [
        { cap: txt[0], run: show(0) }, { cap: txt[1], run: show(1) },
        { cap: `Turn the solid around to look at the back.`, run: async (c) => { await S3.turn(c, 205, 24, 1700); } },
        { cap: txt[2], run: show(2) },
        { cap: `Turn back to the front, and look at the slanted top.`, run: async (c) => { await S3.turn(c, yaw0, pit0, 1700); } },
        { cap: txt[3], run: show(3) }
      ];
      return steps;
    }
    const sf = face(['A', 'D', 'H', 'E'], '#dbe7fb');
    const Ep = [0, 6, 2], eh = hide(S3.add('path', [Ep, 'E'], { stroke: ADJ, 'stroke-width': 4.5, 'stroke-dasharray': '9 6' })), hE = hide(S3.add('path', [Ep, 'H'], { stroke: OPP, 'stroke-width': 4.5 })), EH = hide(S3.add('path', ['E', 'H'], { stroke: HYP, 'stroke-width': 5 }));
    const rmE = hide(S3.add('path', [add3(Ep, [0, -1, 0], 0.7), add3(add3(Ep, [0, -1, 0], 0.7), [0, 0, 1], 0.7), add3(Ep, [0, 0, 1], 0.7)], { stroke: INK, 'stroke-width': 2 }));
    const Elab = hide(S3.label(Ep, T("E'"), { dx: -20, dy: 14, cls: 'bk-lab u9l7-v' }));
    const l6 = hide(S3.label(lerp3(Ep, V.E, 0.5), T(cA('6')), { dy: 18 })), l7 = hide(S3.label(lerp3(Ep, V.H, 0.5), T(cO('7')), { dx: -18 })), lEH = hide(S3.label(lerp3(V.E, V.H, 0.5), T(cH('\\sqrt{85}')), { dx: 30, dy: 6 }));
    const a1 = hide(S3.add('path', arc3(V.E, [0, 1, 0], [0, 0, 1], HEE, 1.6), { stroke: REF, 'stroke-width': 3.5 })), a1l = hide(S3.label(add3(add3(V.E, [0, 1, 0], 2.3), [0, 0, 1], 1.1), T('49.40^\\circ'), { color: REF, cls: 'u9l7-lab u9l7-alab' }));
    const a2 = hide(S3.add('path', arc3(V.E, [0, 0, -1], [0, 1, 0], 90 + HEE, 0.9), { stroke: RED, 'stroke-width': 3.5 })), a2l = hide(S3.label(add3(V.E, [0, -1, 0.2], 0.4), T('139^\\circ'), { color: RED, dx: 34, dy: 18, cls: 'u9l7-lab u9l7-alab' }));
    return [
      { cap: `Work in the side face ${T('ADHE')}: a right trapezoid. ${T('EA=2')} and ${T('HD=9')} are vertical; ${T('AD=6')} is horizontal.`, run: async (c) => { await appear(c, sf, 400); await say(c, Pn, `${T('EA=2')}, ${T('HD=9')}, ${T('AD=6')}`); } },
      { cap: `Turn the solid so face ${T('ADHE')} faces us.`, run: async (c) => { await Promise.all([S3.turn(c, 90, 4, 1800), S3.dimEdges(c, 0.35)]); } },
      { cap: `Draw the horizontal from ${T('E')} across to ${T('DH')}, meeting it at ${T("E'")}: level with ${T('E')}, directly above ${T('D')}. ${T("EE'")} splits the face.`,
        run: async (c) => { eh.style.opacity = 1; await drawIn(eh, 600, c); await appear(c, rmE, 250); await pop(c, Elab); } },
      { cap: `${T("EE'=AD=6")} cm and ${T("E'H=9-2=7")} cm (the <b>difference</b> in heights): the legs of right triangle ${T("EE'H")}.`,
        run: async (c) => { await pop(c, l6); hE.style.opacity = 1; await drawIn(hE, 500, c); await pop(c, l7); await say(c, Pn, T("EE'=" + cA('6') + ",\\quad E'H=9-2=" + cO('7'))); } },
      { cap: `(b) From the angle at ${T('E')}: ${T("E'H")} is opposite, ${T("EE'")} adjacent. ${T("\\tan(\\angle HEE')=\\tfrac{7}{6}")}, so ${T("\\angle HEE'=\\tan^{-1}(7/6)=49.40^\\circ")}.`,
        run: async (c) => { EH.style.opacity = 1; await drawIn(EH, 500, c); a1.style.opacity = 1; await drawIn(a1, 400, c); await pop(c, a1l); await say(c, Pn, T("\\angle HEE'=\\tan^{-1}\\!\\left(\\tfrac{" + cO('7') + '}{' + cA('6') + "}\\right)=49.40^\\circ")); } },
      { cap: `${T('EA')} is vertical and ${T("EE'")} horizontal, so ${T("\\angle AEE'=90^\\circ")}. Then ${T("\\angle HEA=90^\\circ+49.40^\\circ=139.40^\\circ\\approx139^\\circ")}: obtuse.`,
        run: async (c) => { a2.style.opacity = 1; await drawIn(a2, 600, c); await pop(c, a2l); await say(c, Pn, T('\\angle HEA=90^\\circ+49.40^\\circ\\approx' + '139^\\circ'), 'u9l7-res'); } },
      { cap: `(c) ${T('EH')} is the hypotenuse: ${T('EH=\\sqrt{6^2+7^2}=\\sqrt{85}=9.2195\\ldots\\approx 9.2')} cm.`,
        run: async (c) => { await pop(c, lEH); await say(c, Pn, T('EH=\\sqrt{' + cA('6') + '^2+' + cO('7') + '^2}=\\sqrt{85}\\approx9.2\\text{ cm}'), 'u9l7-res'); } },
      { cap: `Turn back: ${T('E')} is the notch corner of the wedge, which is why ${T('\\angle HEA')} is obtuse.`, run: async (c) => { await Promise.all([S3.turn(c, yaw0, pit0, 1800), S3.dimEdges(c, 1)]); } }
    ];
  }
};

/* =============================== static figures (the booklet’s own coordinates and labels) =============================== */
/** a Scene in TikZ units: k px per unit, window [x0, x1, y0, y1] */
function fig(id, k, win, pad = 30) {
  const host = document.getElementById(id); if (!host) return null;
  const [x0, x1, y0, y1] = win, p = Array.isArray(pad) ? pad : [pad, pad, pad, pad];
  return new Scene(host, { width: (x1 - x0) * k + p[1] + p[3], height: (y1 - y0) * k + p[0] + p[2], xmin: x0, xmax: x1, ymin: y0, ymax: y1, pad: p });
}
const FS = 'u9l7-lab u9l7-fs';
function mountStatic() {
  let S = fig('u9l7-f1', 62, [-0.4, 4.3, 0, 6.2], [26, 120, 46, 110]);
  if (S) {
    S.seg([-0.4, 0], [4.3, 0], { width: 2 }); S.seg([0, 0], [0, 4.7], { width: 4.5 }); S.seg([3.8, 0], [3.8, 6.2], { width: 4.5 });
    S.seg([0, 4.7], [4.3, 4.7], { dash: '8 6', width: 2 }); S.seg([0, 4.7], [3.8, 6.2], { dash: '2 5', width: 2.4 }); S.seg([0, 4.7], [3.8, 0], { dash: '2 5', width: 2.4 });
    S.arcC([0, 4.7], 1.2 * S.s, 0, 21.5); S.arcC([0, 4.7], 0.85 * S.s, 0, -51);
    S.lab([2.6, 5.15], T('22^\\circ'), { cls: FS }); S.lab([1.44, 4.01], T('51^\\circ'), { cls: FS }); S.lab([1.9, -0.05], '38 m', { pos: 's', cls: FS });
    S.lab([0, 2.35], 'Ashgrove', { pos: 'w', cls: FS }); S.lab([3.8, 3.1], 'Birchwood', { pos: 'e', cls: FS });
  }
  S = fig('u9l7-ffr', 78, [-2.6, 1.6, 0, 2.6], [40, 40, 44, 40]);
  if (S) {
    S.pt('Y', -2.6, 0).pt('W', 0, 0).pt('Z', 1.6, 0).pt('X', 0, 2.6);
    S.path(['Y', 'Z', 'X', 'Y'], { width: 2.5, closed: true }); S.seg('X', 'W', { width: 2.5 }); S.rmark('W', 'Y', 'X');
    S.vname('Y', 'Y', 'sw'); S.vname('W', 'W', 's'); S.vname('Z', 'Z', 'se'); S.vname('X', 'X', 'n');
  }
  S = fig('u9l7-f2', 70, [-4.1, 2.4, 0, 2.665], [40, 40, 50, 40]);
  if (S) {
    S.pt('R', -4.1, 0).pt('S', 0, 0).pt('Q', 2.4, 0).pt('P', 0, 2.665);
    S.path(['R', 'Q', 'P', 'R'], { width: 2.5, closed: true }); S.seg('P', 'S', { width: 2.5 }); S.rmark('S', 'R', 'P');
    S.arcC('Q', 0.9 * S.s, 180, 132); S.arcC('P', 0.9 * S.s, 270, 213);
    S.vname('R', 'R', 's'); S.vname('S', 'S', 's'); S.vname('Q', 'Q', 'se'); S.vname('P', 'P', 'n');
    S.lab([1.2, -0.02], '24 mm', { pos: 's', cls: FS }); S.lab([1.03, 0.61], T('48^\\circ'), { cls: FS }); S.lab([-0.72, 1.35], T('57^\\circ'), { cls: FS });
  }
  S = fig('u9l7-f3', 70, [-3.71, 2.63, 0, 1.84], [40, 40, 50, 40]);
  if (S) {
    S.pt('B', -3.71, 0).pt('C', 0, 0).pt('A', 2.63, 0).pt('E', 0, 1.84);
    S.path(['B', 'A', 'E', 'B'], { width: 2.5, closed: true }); S.seg('E', 'C', { width: 2.5 }); S.rmark('C', 'B', 'E');
    S.arcC('A', 1.1 * S.s, 180, 145);
    S.vname('B', 'B', 's'); S.vname('C', 'C', 's'); S.vname('A', 'A', 's'); S.vname('E', 'E', 'n');
    S.lab([-1.95, 1.0], '5.8 m', { pos: 'nw', gap: 2, cls: FS }); S.lab([1.25, 0.98], '4.5 m', { pos: 'ne', gap: 2, cls: FS }); S.lab([0.91, 0.54], T('35^\\circ'), { cls: FS });
  }
  S = fig('u9l7-f4', 105, [-0.2, 3.9, 0, 2.25], [40, 24, 60, 40]);
  if (S) {
    S.pt('C', 0, 0).pt('T', 0, 2.25).pt('B', 2.09, 0).pt('A', 3.59, 0);
    S.seg([-0.2, 0], [3.9, 0], { width: 2.5 }); S.seg('C', 'T', { width: 5.5 }); S.seg('T', 'B', { width: 2.5 }); S.seg('T', 'A', { width: 2.5 });
    S.path([[0, 0.22], [0.22, 0.22], [0.22, 0]], { width: 2 });
    S.arc('A', 'T', 'C', 0.5 * S.s, { width: 2 }); S.arc('B', 'T', 'C', 0.5 * S.s, { width: 2 });
    S.lab([3.59 - 0.85 * cosD(16), 0.85 * sinD(16)], T('32^\\circ'), { cls: FS }); S.lab([2.09 - 0.85 * cosD(23.5), 0.85 * sinD(23.5)], T('47^\\circ'), { cls: FS });
    S.vname('A', 'A', 's'); S.vname('B', 'B', 's'); S.vname('C', 'C', 'sw'); S.vname('T', 'T', 'n');
    S.lab([0, 1.12], T('h'), { pos: 'w', cls: 'u9l7-lab' }); S.lab([2.84, -0.25], '25 m', { pos: 's', cls: FS }); S.lab([1.05, -0.05], T('x'), { pos: 's', cls: FS });
  }
  S = fig('u9l7-f5', 78, [0, 3.3, 0, 3.9], [30, 50, 40, 40]);
  if (S) {
    const P = { A: [0, 0], B: [2.4, 0], C: [3.3, 0.9], D: [0.9, 0.9], E: [0, 3], F: [2.4, 3], G: [3.3, 3.9], H: [0.9, 3.9] };
    for (const n in P) S.pt(n, ...P[n]);
    S.path(['A', 'B', 'F', 'E', 'A'], { width: 2.4 }); S.path(['B', 'C', 'G', 'F'], { width: 2.4 }); S.path(['E', 'H', 'G'], { width: 2.4 });
    S.path(['A', 'D', 'C'], { width: 1.8, dash: '7 5' }); S.seg('D', 'H', { width: 1.8, dash: '7 5' });
    S.seg('A', 'C', { width: 2.6, dash: '2 5' }); S.seg('A', 'G', { width: 2.6, dash: '2 5' });
    S.vname('A', 'A', 'sw'); S.vname('B', 'B', 'se'); S.vname('C', 'C', 'e'); S.lab('D', T('D'), { pos: 'nw', cls: 'u9l7-v u9l7-fs', gap: 3 }); S.vname('G', 'G', 'e');
    S.lab([1.2, 0], '4', { pos: 's', cls: FS }); S.lab([2.85, 0.4], '3', { pos: 'e', cls: FS }); S.lab([3.3, 2.4], '12', { pos: 'e', cls: FS });
  }
  S = fig('u9l7-f6', 64, [-0.4, 7.6, -0.9, 4.4], [34, 130, 36, 120]);
  if (S) {
    S.path([[0, 0], [5, 0], [5, 0.9], [0, 0.9], [0, 0]], { width: 2.4 });
    S.path([[0, 0.9], [2.6, 4.4], [7.6, 4.4], [5, 0.9]], { width: 2.4 });
    for (const [a, b] of [[[0, 0], [2.6, 0.35]], [[2.6, 0.35], [7.6, 0.35]], [[7.6, 0.35], [5, 0]], [[2.6, 0.35], [2.6, 4.4]], [[7.6, 0.35], [7.6, 4.4]]]) S.seg(a, b, { width: 1.8, dash: '7 5' });
    S.lab([0, 0], T('A'), { pos: 'sw', cls: 'u9l7-v', gap: 3 }); S.lab([5, -0.02], T('B'), { pos: 's', cls: 'u9l7-v', gap: 3 });
    S.lab([2.6, 4.4], T('H'), { pos: 'nw', cls: 'u9l7-v', gap: 3 }); S.lab([7.6, 4.4], T('G'), { pos: 'ne', cls: 'u9l7-v', gap: 3 });
    S.lab([0, 0.9], T('E'), { pos: 'nw', cls: 'u9l7-v', gap: 3 }); S.lab([5.05, 0.72], T('F'), { pos: 'e', cls: 'u9l7-v', gap: 3 });
    S.lab([2.6, 0.35], T('D'), { pos: 'ne', cls: 'u9l7-v u9l7-fs', gap: 3 }); S.lab([7.6, 0.3], T('C'), { pos: 's', cls: 'u9l7-v u9l7-fs', gap: 3 });
    S.lab([2.5, -0.4], `${T('AB=11')} cm`, { pos: 's', cls: FS, gap: 2 }); S.lab([-0.15, 0.45], `${T('EA=2')} cm`, { pos: 'w', cls: FS });
    S.lab([7.7, 2.4], `${T('GC=9')} cm`, { pos: 'e', cls: FS });
    S.lab([0.55, -0.75], `${T('AD=6')} cm`, { pos: 's', cls: FS, gap: 2 });
    const a = S.P([0.55, -0.62]), b = S.P([1.05, 0.13]); svgEl('path', { d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, stroke: INK, 'stroke-width': 1.4 }, S.svg); arrowHead(S.svg, b[0], b[1], b[0] - a[0], b[1] - a[1], { width: 1.4, color: INK });
  }
}

/* =============================== mount =============================== */
mountStatic();
export const explainers = mountExplainers({ cliff, towers, noround, chain, frame, which, sightings, box3d, wedge });
export const _test = { PS2, RS2, EC3, BEC, H4, X4, HEE };
