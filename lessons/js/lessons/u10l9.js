/* Math 10C · Unit 10 · Lesson 9 — Measurement: A Cumulative Review.
 * Static figures: the warm-up classroom, cones/spheres/hemispheres/pyramids/prisms for the examples and review questions
 * (one oblique renderer with dashed hidden edges), the micrometer and both vernier calipers.
 * Explainers:
 *   fill (warm-up: stack the basketballs, cube boxes, the two classic mistakes), whichWay (★ which conversion / which
 *   formula flowchart, each example travelling it), ladder (the SI prefix number line with the decimal point hopping;
 *   Ex 1), sizeUp (units that give friendly numbers, instruments matched to the job, a horse in hands; Ex 2), micro
 *   (Extension: the thimble turning; Ex 3), ratioMap (unit analysis with km cancelling on a double number line; a map
 *   scale on a ruler; Ex 4), applied (tiles filling a floor; an aquarium in 10 L doses; Ex 5), wrench (one length line,
 *   two scales; Ex 6), morph (★ one solid morphing prism → cylinder → cone → pyramid → sphere → hemisphere with its
 *   formulas; ⅓ of the prism; the sphere in its cylinder), coneSphere (slant height from the cross-section and the net;
 *   four great circles; Ex 7), backwards (equilateral base; undoing a formula; Ex 8), tank (cone, trucks filling, the
 *   same volume in a narrower cone, the bids with a cubic and a currency conversion; Ex 9).
 * Colours: conversions amber, lengths blue, areas/volumes teal, the answer green, mistakes red. */
import {
  h, tex, fmt, add, box, Box, NumberLine, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  svgEl, place, pulse, arrowHead, rightMark, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const AMB = COLORS.amber, PUR = COLORS.purple, BLUE = COLORS.blue, RED = COLORS.red, GRN = COLORS.green, TEAL = COLORS.teal, INK = COLORS.ink, GRAY = '#8b909b';
const BALL = '#e6782a', BALLD = '#6e320f';

/* =============================== numbers =============================== */
/** TeX number: thin spaces in an integer part of five or more digits (the booklet's style: 1460, 54\,000) */
function tN(v, d) {
  let s = typeof v === 'string' ? v : d != null ? v.toFixed(d) : String(parseFloat(v.toFixed(10)));
  const neg = s[0] === '-'; if (neg) s = s.slice(1);
  let [i, f] = s.split('.'); if (i.length > 4) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
  return (neg ? '-' : '') + i + (f != null ? '.' + f : '');
}
const hN = (v, d) => tN(v, d).replace(/\\,/g, ' ');
const dots = (v, d) => tN(v.toFixed(d)) + '\\ldots';

/* =============================== little layout helpers =============================== */
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u10l9-panel', title ? `<div class="u10l9-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u10l9-line ' + cls, html); p.appendChild(d); return d; };
const say = async (c, p, html, cls) => { const d = line(p, html, cls); await fadeIn(c, d, 300); return d; };
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const pill = (host, x, y, html, cls = '', pos = 'c') => { const d = h('div', 'bk-lab u10l9-pill ' + cls, html); host.appendChild(d); place(d, x, y, pos, 6); return d; };
const pD = (pts, closed) => pts.length ? 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + (closed ? 'Z' : '') : '';
const lerp = (a, b, t) => a + (b - a) * t;
function sline(L, a, b, o = {}) { return svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: o.color || INK, 'stroke-width': o.w || 2, 'stroke-dasharray': o.dash || null, 'stroke-linecap': 'round', opacity: o.op ?? null }, L); }
function dimArrow(L, a, b, o = {}) {
  const g = svgEl('g', {}, L), col = o.color || INK, dx = b[0] - a[0], dy = b[1] - a[1];
  sline(g, a, b, { color: col, w: o.w || 1.8 });
  arrowHead(g, b[0], b[1], dx, dy, { color: col, width: 2, L: 10, hw: 4.5 }); arrowHead(g, a[0], a[1], -dx, -dy, { color: col, width: 2, L: 10, hw: 4.5 });
  return g;
}
/** an SVG + HTML-label box placed in a stage (or in the flow of a card) */
function fbox(host, W, H, x, y, cls = '') { const B = new Box(host, x != null ? { x, y } : {}, 'u10l9-fbox ' + cls, W, H); B.L = B.layer('f'); B.top = B.layer('t'); return B; }
const lab = (B, x, y, html, pos = 'c', cls = 'u10l9-flab') => B.hlabel(x, y, html, { pos, cls, gap: 4 });
const slab = (stage, x, y, html, pos = 'c', cls = '') => { const d = h('div', 'bk-lab u10l9-flab ' + cls, html); stage.appendChild(d); return place(d, x, y, pos, 4); };

/* =============================== 3-D solids (oblique view, hidden edges dashed) =============================== */
const SINE = 0.34, COSE = Math.sqrt(1 - SINE * SINE);
/** sp: { cx, cy (base centre, px), R, H (px), n (polygon sides; 0 = circle), b (0 polygon → 1 circle), rot, ps (polygon size),
 *        wf, wp, ws, wh (profile weights: flat top, point, sphere, hemisphere), inv (apex at the bottom) } */
function geom(sp) {
  const n = sp.n || 0, b = n ? sp.b ?? 0 : 1, rot = sp.rot ?? 0, ps = sp.ps ?? 1;
  const rr = (th) => { if (!n || b >= 1) return 1; const seg = 2 * Math.PI / n, a = (((th - rot) % seg) + seg) % seg; return (1 - b) * ps * Math.cos(Math.PI / n) / Math.cos(a - Math.PI / n) + b; };
  const wf = sp.wf ?? 0, wp = sp.wp ?? 0, ws = sp.ws ?? 0, wh = sp.wh ?? 0;
  const pr0 = (u) => wf + wp * (1 - u) + ws * Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2)) + wh * Math.sqrt(Math.max(0, 1 - u * u));
  const prof = sp.inv ? (u) => pr0(1 - u) : pr0;
  const P = (th, u) => { const k = sp.R * prof(u) * rr(th), X = k * Math.cos(th), Y = k * Math.sin(th), z = u * sp.H; return [sp.cx + X, sp.cy - z * COSE - Y * SINE, Y]; };
  const ths = []; for (let j = 0; j < 120; j++) ths.push((2 * Math.PI * j) / 120);
  const verts = []; if (n && b < 1) for (let i = 0; i < n; i++) verts.push(rot + (2 * Math.PI * i) / n);
  const TH = ths.concat(verts.map((v) => ((v % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))).sort((a, c) => a - c);
  return { P, prof, n, b, rot, TH, verts, axisTop: [sp.cx, sp.cy - sp.H * COSE], base: [sp.cx, sp.cy] };
}
function hull(P) {
  const p = P.map((q) => [q[0], q[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  up.pop(); lo.pop(); return lo.concat(up);
}
/** split a projected closed ring at its leftmost and rightmost points into the front and back (hidden) chains */
function splitRing(R) {
  let iL = 0, iR = 0; R.forEach((p, i) => { if (p[0] < R[iL][0]) iL = i; if (p[0] > R[iR][0]) iR = i; });
  const chain = (a, b) => { const out = []; for (let i = a; ; i = (i + 1) % R.length) { out.push(R[i]); if (i === b) break; } return out; };
  const A = chain(iL, iR), B = chain(iR, iL), avg = (C) => C.reduce((s, p) => s + p[2], 0) / C.length;
  return avg(A) > avg(B) ? { back: A, front: B } : { back: B, front: A };
}
/** draw a solid into layer L. o: { color, fill, fillOpacity, width, ghost } → geometry */
function drawSolid(L, sp, o = {}) {
  L.innerHTML = '';
  const G = geom(sp), col = o.color || INK, w = o.width || 2.6, dash = o.ghost ? '5 6' : '7 6';
  const US = []; for (let k = 0; k <= 36; k++) US.push(k / 36);
  const all = []; US.forEach((u) => G.TH.forEach((t) => all.push(G.P(t, u))));
  const hl = hull(all);
  if (!o.ghost) svgEl('path', { d: pD(hl, true), fill: o.fill || '#dfe8f8', 'fill-opacity': o.fillOpacity ?? 0.75, stroke: 'none' }, L);
  const ring = (u) => G.TH.map((t) => G.P(t, u));
  const stroke = (pts, d, op = 1, ww = w) => svgEl('path', { d: pD(pts), fill: 'none', stroke: col, 'stroke-width': ww, 'stroke-dasharray': d, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: op }, L);
  const hw = o.ghost ? w * 0.7 : w * 0.8;
  if (G.prof(0) > 0.03) { const s = splitRing(ring(0)); if (!o.noHidden) stroke(s.back, dash, 1, hw); stroke(s.front); }
  if ((sp.ws ?? 0) > 0.04) { const s = splitRing(ring(0.5)); if (!o.noHidden) stroke(s.back, dash, sp.ws, hw); stroke(s.front, null, sp.ws, hw); }
  if (G.prof(1) > 0.03) { const r = ring(1); stroke(r.concat([r[0]])); }
  if (G.verts.length) {
    const op = 1 - G.b, base = G.verts.map((t) => G.P(t, 0)), ext = base.map((p) => p[0]);
    const iL = ext.indexOf(Math.min(...ext)), iR = ext.indexOf(Math.max(...ext)), pl = base[iL], prr = base[iR];
    G.verts.forEach((t, i) => {
      const p = base[i]; const chordY = pl[2] + (prr[2] - pl[2]) * ((p[0] - pl[0]) / ((prr[0] - pl[0]) || 1));
      const hidden = i !== iL && i !== iR && p[2] > chordY + 0.5;
      if (hidden && o.noHidden) return;
      stroke(US.map((u) => G.P(t, u)), hidden ? dash : null, op, hidden ? hw : w);
    });
  }
  svgEl('path', { d: pD(hl, true), fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-dasharray': o.ghost ? dash : null }, L);
  G.hull = hl; return G;
}
/** a horizontal cylinder (a tanker truck): left end at (x, cy), length len, radius r (px) */
function drawLogCyl(L, x, cy, len, r, o = {}) {
  const k = 0.36, col = o.color || INK, g = svgEl('g', {}, L);
  if (o.fill !== false) svgEl('path', { d: `M${x} ${cy - r}L${x + len} ${cy - r}A${r * k} ${r} 0 0 1 ${x + len} ${cy + r}L${x} ${cy + r}A${r * k} ${r} 0 0 1 ${x} ${cy - r}Z`, fill: o.fill || '#dfe8f8', stroke: 'none' }, g);
  svgEl('ellipse', { cx: x, cy, rx: r * k, ry: r, fill: o.endFill || '#eef3fc', stroke: col, 'stroke-width': 2.4 }, g);
  svgEl('path', { d: `M${x + len} ${cy - r}A${r * k} ${r} 0 0 1 ${x + len} ${cy + r}`, fill: 'none', stroke: col, 'stroke-width': 2.4 }, g);
  svgEl('path', { d: `M${x + len} ${cy - r}A${r * k} ${r} 0 0 0 ${x + len} ${cy + r}`, fill: 'none', stroke: col, 'stroke-width': 1.8, 'stroke-dasharray': '6 5' }, g);
  sline(g, [x, cy - r], [x + len, cy - r], { color: col, w: 2.4 }); sline(g, [x, cy + r], [x + len, cy + r], { color: col, w: 2.4 });
  return g;
}

/* =============================== measuring instruments =============================== */
/** micrometer: sleeve (whole mm above the index line, half mm below) + thimble (0.01 mm per division). set(R) redraws */
class Micrometer extends Box {
  constructor(host, o = {}) {
    const W = o.width, H = o.height || 196;
    super(host, o, 'u10l9-micro', W, H);
    this.m = Object.assign({ lo: 0, mmPx: 40, y0: 86, x0: 26, thW: 150, captions: false }, o);
    this.L = this.layer('m'); this.Lt = this.layer('mt');
    if (o.zoom) [this.L, this.Lt].forEach((g) => { g.setAttribute('transform', `scale(${o.zoom})`); g.style.transformBox = 'view-box'; g.style.transformOrigin = '0 0'; });
    this.set(o.R ?? 0);
  }
  X(mm) { const m = this.m; return m.x0 + (mm - m.lo) * m.mmPx; }
  set(R) {
    const m = this.m, L = this.L, y0 = m.y0, xE = this.X(R); this.R = R; L.innerHTML = '';
    svgEl('rect', { x: m.x0 - 16, y: y0 - 30, width: Math.max(0, xE - m.x0 + 16), height: 58, fill: '#f1f2f4', stroke: '#b9bec8', 'stroke-width': 1.2 }, L);
    sline(L, [m.x0 - 10, y0], [xE, y0], { color: INK, w: 2 });
    for (let k = Math.ceil(m.lo * 2); k / 2 <= R + 1e-9; k++) {
      const x = this.X(k / 2); if (x > xE + 0.5) break;
      if (k % 2) sline(L, [x, y0 + 2], [x, y0 + 17], { color: INK, w: 1.8 });
      else { const mm = k / 2, big = mm % 5 === 0; sline(L, [x, y0 - 2], [x, y0 - (big ? 25 : 16)], { color: INK, w: big ? 2.6 : 1.8 }); if (big) { const t = svgEl('text', { x, y: y0 - 30, 'text-anchor': 'middle', class: 'u10l9-mnum' }, L); t.textContent = mm; } }
    }
    // thimble
    const thH = 68, tW = m.thW;
    svgEl('rect', { x: xE, y: y0 - thH, width: tW, height: 2 * thH, fill: '#d3d6dc', stroke: '#9ea4ae', 'stroke-width': 1.2, rx: 3 }, L);
    for (let i = 0; i < 6; i++) svgEl('rect', { x: xE + tW - 34 + i * 5, y: y0 - thH + 2, width: 2, height: 2 * thH - 4, fill: '#bfc3ca' }, L);
    sline(L, [xE, y0 - thH], [xE, y0 + thH], { color: INK, w: 3 });
    const tv = ((R * 100) % 50 + 50) % 50, sp = 10;
    for (let v = Math.ceil(tv - 6.4); v <= Math.floor(tv + 6.4); v++) {
      const y = y0 + (v - tv) * sp, major = ((v % 5) + 5) % 5 === 0;
      sline(L, [xE + 5, y], [xE + (major ? 40 : 26), y], { color: INK, w: major ? 2.2 : 1.5 });
      if (major) { const t = svgEl('text', { x: xE + 45, y: y + 5.5, class: 'u10l9-mnum' }, L); t.textContent = ((v % 50) + 50) % 50; }
    }
    sline(L, [xE + 76, y0], [xE + tW - 4, y0], { color: RED, w: 2, dash: '6 5' });
    const it = svgEl('text', { x: xE + tW - 6, y: y0 - 6, 'text-anchor': 'end', class: 'u10l9-mtag' }, L); it.textContent = 'index line';
    if (m.captions) {
      const cx = (m.x0 - 16 + xE + tW) / 2;
      const t1 = svgEl('text', { x: cx, y: y0 + thH + 22, 'text-anchor': 'middle', class: 'u10l9-mcap' }, L); t1.textContent = 'Sleeve: a mark every 0.5 mm';
      const t2 = svgEl('text', { x: cx, y: y0 + thH + 42, 'text-anchor': 'middle', class: 'u10l9-mcap' }, L); t2.textContent = 'Thimble: 0.01 mm per division';
    }
    this.xE = xE; this.tv = tv;
  }
}
function microStatic(host, k, t) {
  const R = k * 0.5 + t * 0.01, lo = Math.max(0, Math.floor(R) - 6), mmPx = 44, W = Math.ceil((R - lo) * mmPx + 26 + 150 + 26);
  return new Micrometer(host, { R, lo, mmPx, width: W, height: 210, captions: true });
}
/** vernier caliper, metric: main scale in mm, 20 vernier divisions of 0.95 mm (0.05 mm each) */
function vernierMM(host, whole, fine) {
  const u = 33, lo = whole - 3, hi = whole + 21, W = (hi - lo) * u + 40, H = 170, B = fbox(host, W, H), L = B.L, x0 = 20, yb = 76;
  const X = (mm) => x0 + (mm - lo) * u;
  svgEl('rect', { x: 6, y: yb - 44, width: W - 12, height: 44, fill: '#f3f4f6', stroke: '#b9bec8' }, L);
  for (let m = lo; m <= hi; m++) { const big = m % 5 === 0; sline(L, [X(m), yb], [X(m), yb - (big ? 22 : 13)], { w: big ? 2.4 : 1.6 }); if (big) { const t = svgEl('text', { x: X(m), y: yb - 27, 'text-anchor': 'middle', class: 'u10l9-mnum' }, L); t.textContent = m; } }
  const tt = svgEl('text', { x: W / 2, y: 22, 'text-anchor': 'middle', class: 'u10l9-mcap' }, L); tt.textContent = 'Main scale (mm)';
  const R = whole + fine * 0.05, xz = X(R), xe = xz + 19 * 0.95 * u;
  svgEl('rect', { x: xz - 46, y: yb, width: xe - xz + 46 + 0.95 * u + 18, height: 42, fill: '#e2e4e8', stroke: '#b9bec8' }, L);
  for (let n = 0; n <= 20; n++) { const x = xz + 0.95 * n * u, big = n % 5 === 0; sline(L, [x, yb], [x, yb + (big ? 22 : 13)], { w: big ? 2.4 : 1.6, color: n === 0 ? RED : INK }); if (big) { const t = svgEl('text', { x, y: yb + 38, 'text-anchor': 'middle', class: 'u10l9-mnum' }, L); t.textContent = n; } }
  const ix = svgEl('text', { x: xz - 8, y: yb + 36, 'text-anchor': 'end', class: 'u10l9-mtag' }, L); ix.textContent = 'index';
  const tb = svgEl('text', { x: (xz + xe) / 2, y: yb + 72, 'text-anchor': 'middle', class: 'u10l9-mcap' }, L); tb.textContent = 'Vernier scale: 0.05 mm per division';
  return B;
}
/** vernier caliper, inch: main scale every 1/16 in, 8 vernier divisions of 7/128 in (1/128 in each) */
function vernierInch(host, whole, six, fine) {
  const ic = whole * 16 + six, lo = Math.min(ic - 3, whole * 16 - 1), hi = ic + 9, u = 44, W = (hi - lo) * u + 40, H = 178, B = fbox(host, W, H), L = B.L, x0 = 20, yb = 80;
  const X = (s) => x0 + (s - lo) * u;
  svgEl('rect', { x: 6, y: yb - 48, width: W - 12, height: 48, fill: '#f3f4f6', stroke: '#b9bec8' }, L);
  for (let m = lo; m <= hi; m++) {
    const w16 = ((m % 16) + 16) % 16, len = w16 === 0 ? 27 : w16 === 8 ? 22 : w16 % 4 === 0 ? 17 : 11;
    sline(L, [X(m), yb], [X(m), yb - len], { w: w16 === 0 ? 2.6 : 1.6 });
    if (w16 === 0) { const t = svgEl('text', { x: X(m), y: yb - 32, 'text-anchor': 'middle', class: 'u10l9-mnum' }, L); t.textContent = m / 16; }
  }
  const tt = h('div', 'bk-lab u10l9-mcaph', `Main scale (in): a mark every ${T('\\tfrac{1}{16}')} in`); B.html.appendChild(tt); place(tt, W / 2, 14, 'c', 0);
  const xz = X(ic + fine / 8), xe = xz + 7 * u;
  svgEl('rect', { x: xz - 46, y: yb, width: xe - xz + 70, height: 42, fill: '#e2e4e8', stroke: '#b9bec8' }, L);
  for (let n = 0; n <= 8; n++) { const x = xz + 0.875 * n * u; sline(L, [x, yb], [x, yb + 19], { w: 2.2, color: n === 0 ? RED : INK }); const t = svgEl('text', { x, y: yb + 36, 'text-anchor': 'middle', class: 'u10l9-mnum' }, L); t.textContent = n; }
  const ix = svgEl('text', { x: xz - 8, y: yb + 36, 'text-anchor': 'end', class: 'u10l9-mtag' }, L); ix.textContent = 'index';
  const tb = h('div', 'bk-lab u10l9-mcaph', `Vernier: ${T('\\tfrac{1}{128}')} in per division`); B.html.appendChild(tb); place(tb, (xz + xe) / 2, yb + 66, 'c', 0);
  return B;
}

/* =============================== static figures =============================== */
function ballSVG(L, cx, cy, r, w = 1) {
  const g = svgEl('g', {}, L);
  svgEl('circle', { cx, cy, r, fill: BALL, stroke: BALLD, 'stroke-width': w }, g);
  if (r < 5) return g;
  const P = (a, b) => `${(cx + a * r).toFixed(1)} ${(cy + b * r).toFixed(1)}`;
  svgEl('path', { d: `M${P(-1, 0)}L${P(1, 0)}M${P(0, -1)}L${P(0, 1)}M${P(-0.7, -0.71)}C${P(-0.3, -0.3)} ${P(-0.3, 0.3)} ${P(-0.7, 0.71)}M${P(0.7, -0.71)}C${P(0.3, -0.3)} ${P(0.3, 0.3)} ${P(0.7, 0.71)}`, fill: 'none', stroke: BALLD, 'stroke-width': w }, g);
  return g;
}
/** the warm-up classroom: 9 m by 8 m by 3 m, drawn see-through, with 8 balls to scale along the front */
function roomFig(host) {
  const W = 940, H = 330, B = fbox(host, W, H), L = B.L, s = 50, dx = 150, dy = 92, ox = 70, oy = 270;
  const P = (x, y) => [ox + x, oy - y];
  const poly = (pts, attrs) => svgEl('path', Object.assign({ d: pD(pts.map((p) => P(...p)), true) }, attrs), L);
  poly([[dx, dy], [dx + 9 * s, dy], [dx + 9 * s, dy + 3 * s], [dx, dy + 3 * s]], { fill: '#fff4dd' });
  poly([[0, 0], [dx, dy], [dx, dy + 3 * s], [0, 3 * s]], { fill: '#fff8ea' });
  poly([[0, 0], [9 * s, 0], [9 * s + dx, dy], [dx, dy]], { fill: '#e8f0fc' });
  poly([[dx + 110, dy + 52], [dx + 330, dy + 52], [dx + 330, dy + 136], [dx + 110, dy + 136]], { fill: '#fff', stroke: INK, 'stroke-width': 1.6 });
  poly([[42, 26], [96, 59], [96, 168], [42, 135]], { fill: '#e2b765', stroke: INK, 'stroke-width': 1.6 });
  const ln = (a, b, w = 2) => sline(L, P(...a), P(...b), { w });
  ln([0, 0], [dx, dy], 1.6); ln([dx, dy], [dx + 9 * s, dy], 1.6); ln([dx, dy], [dx, dy + 3 * s], 1.6); ln([0, 3 * s], [dx, dy + 3 * s], 1.6); ln([dx, dy + 3 * s], [dx + 9 * s, dy + 3 * s], 1.6); ln([dx + 9 * s, dy + 3 * s], [dx + 9 * s, dy], 1.6);
  svgEl('rect', { x: ox, y: oy - 3 * s, width: 9 * s, height: 3 * s, fill: 'none', stroke: INK, 'stroke-width': 3 }, L);
  ln([9 * s, 0], [9 * s + dx, dy], 3); ln([9 * s + dx, dy], [9 * s + dx, dy + 3 * s], 3); ln([9 * s + dx, dy + 3 * s], [9 * s, 3 * s], 3);
  const br = 0.12 * s; for (let i = 0; i < 8; i++) ballSVG(L, ox + br + i * 2 * br, oy - br, br, 0.6);
  lab(B, ox + 8 * 2 * br + 14, oy - br, '…', 'c', 'u10l9-flab u10l9-dots');
  lab(B, ox + 4.5 * s, oy + 8, '9 m', 's', 'u10l9-flab u10l9-big');
  lab(B, ox - 8, oy - 1.5 * s, '3 m', 'w', 'u10l9-flab u10l9-big');
  lab(B, ox + 9 * s + dx / 2 + 8, oy - dy / 2, '8 m', 'e', 'u10l9-flab u10l9-big');
  const cx = 820, cy = 140, r = 78; ballSVG(L, cx, cy, r, 2.2);
  dimArrow(L, [cx - r, cy + r + 30], [cx + r, cy + r + 30], { w: 2 });
  lab(B, cx, cy + r + 30, 'about 24 cm', 'c', 'u10l9-flab u10l9-big u10l9-wbg');
  lab(B, cx, cy - r - 6, 'one basketball', 'n', 'u10l9-flab u10l9-big');
  const ar = svgEl('g', {}, L); sline(ar, [ox + 2 * br * 2, oy + 44], [ox + 2 * br * 2, oy + 8], { color: RED, w: 2.2 }); arrowHead(ar, ox + 2 * br * 2, oy + 6, 0, -1, { color: RED, width: 2.2 });
  lab(B, ox + 2 * br * 2 + 10, oy + 44, '8 balls, to scale', 'e', 'u10l9-flab u10l9-redlab');
  return B;
}
/** cone/sphere/hemisphere/pyramid figures, booklet labels */
const FIGS = {
  ex7a: (host) => coneFig(host, { r: 8, h: 15, k: 9, rl: T('r=8\\text{ cm}'), hl: T('h=15\\text{ cm}') }),
  q17: (host) => coneFig(host, { r: 9, h: 12, k: 9.5, rl: T('r=9\\text{ cm}'), hl: T('h=12\\text{ cm}') }),
  ex9a: (host) => coneFig(host, { r: 8.1, h: 5.4, k: 13, dl: T('d=16.2\\text{ m}'), hl: T('h=5.4\\text{ m}'), note: 'not to scale' }),
  ex9c: (host) => coneFig(host, { r: 6, h: 9.8415, k: 14, dl: T('d=12\\text{ m}'), hl: T('h=\\,?') }),
  q29: (host) => coneFig(host, { r: 4, h: 10, k: 15, inv: true, dl: T('8\\text{ cm}'), hl: T('10\\text{ cm}') }),
  ex7b: (host) => sphereFig(host, { R: 82, dl: T('18\\text{ in}') }),
  q18: (host) => sphereFig(host, { R: 74, dl: T('14\\text{ in}') }),
  ex8b: (host) => hemiFig(host, { R: 92, rl: T('r=\\,?') }),
  q20: (host) => hemiFig(host, { R: 86, rl: T('r=\\,?') }),
  q28: (host) => hemiFig(host, { R: 90, rl: T('r=6\\text{ cm}'), table: true, above: true }),
  ex8a: (host) => triPyrFig(host, { s: T('8\\text{ m}'), hh: T('15\\text{ m}'), tall: 2.3 }),
  q19: (host) => triPyrFig(host, { s: T('12\\text{ m}'), hh: T('9\\text{ m}'), tall: 1.7 }),
  q26: (host) => triPrismFig(host),
  q27: (host) => sqPyrFig(host),
  ex9b: (host) => truckFig(host)
};
function coneFig(host, o) {
  const R = o.r * o.k, Hh = o.h * o.k, W = Math.max(250, 2 * R + 150), H = Hh * COSE + R * SINE + 90, B = fbox(host, W, H);
  const cx = W / 2 - 20, cy = o.inv ? 40 + R * SINE + Hh * COSE : H - 46 - R * SINE;
  const sp = { cx, cy, R, H: Hh, wp: 1, inv: !!o.inv };
  if (o.inv) { sp.cy = 40 + R * SINE + Hh * COSE; }
  const G = drawSolid(B.L, sp);
  if (o.inv) {
    const top = [cx, sp.cy - Hh * COSE], apex = [cx, sp.cy];
    sline(B.L, apex, top, { dash: '7 6', w: 1.8 });
    dimArrow(B.L, [cx - R, top[1] - R * SINE - 16], [cx + R, top[1] - R * SINE - 16]);
    lab(B, cx, top[1] - R * SINE - 18, o.dl, 'n');
    lab(B, cx + 6, (apex[1] + top[1]) / 2 + 10, o.hl, 'e', 'u10l9-flab u10l9-wbg');
    return B;
  }
  const apex = G.axisTop;
  sline(B.L, [cx, cy], apex, { dash: '7 6', w: 1.8 });
  svgEl('circle', { cx, cy, r: 3, fill: INK }, B.L);
  if (o.dl) { sline(B.L, [cx - R, cy], [cx + R, cy], { w: 2 }); lab(B, cx, cy + R * SINE + 4, o.dl, 's'); }
  else { sline(B.L, [cx, cy], [cx + R, cy], { w: 2 }); lab(B, cx + R / 2, cy + R * SINE + 4, o.rl, 's'); }
  lab(B, cx + 6, (cy + apex[1]) / 2, o.hl, 'e', 'u10l9-flab u10l9-wbg');
  if (o.note) lab(B, cx + R * 0.55, apex[1] + 6, o.note, 'e', 'u10l9-flab u10l9-note');
  return B;
}
function sphereFig(host, o) {
  const R = o.R, W = 2 * R + 80, H = 2 * R + 80, B = fbox(host, W, H), cx = W / 2, cy = 14 + 2 * R;
  drawSolid(B.L, { cx, cy: cy + R * (1 - COSE) * 0, R, H: 2 * R, ws: 1 });
  const ctr = [cx, cy - R * COSE], yb = ctr[1] + R + 24;
  sline(B.L, [cx - R, ctr[1]], [cx - R, yb], { dash: '2 4', w: 1.6 }); sline(B.L, [cx + R, ctr[1]], [cx + R, yb], { dash: '2 4', w: 1.6 });
  dimArrow(B.L, [cx - R, yb], [cx + R, yb]); lab(B, cx, yb + 2, o.dl, 's');
  return B;
}
function hemiFig(host, o) {
  const R = o.R, W = 2 * R + 80, H = R + R * SINE + (o.table ? 70 : 60), B = fbox(host, W, H), cx = W / 2, cy = 16 + R * COSE + 2;
  drawSolid(B.L, { cx, cy, R, H: R, wh: 1 });
  svgEl('circle', { cx, cy, r: 3, fill: INK }, B.L); sline(B.L, [cx, cy], [cx + R, cy], { w: 2 });
  lab(B, cx + R / 2, o.above ? cy - 4 : cy + R * SINE + 4, o.rl, o.above ? 'n' : 's', o.above ? 'u10l9-flab u10l9-wbg' : 'u10l9-flab');
  if (o.table) sline(B.L, [cx - R - 30, cy + R * SINE + 10], [cx + R + 30, cy + R * SINE + 10], { w: 3 });
  return B;
}
/** booklet geometry, scaled: a triangular pyramid (front-left, front-right, back vertices; apex over the centroid) */
function triPyrFig(host, o) {
  const k = 70, W = 260, H = o.tall * k + 90, B = fbox(host, W, H), ox = 110, oy = H - 50, P = (x, y) => [ox + x * k, oy - y * k];
  const FL = P(-1, -0.3), FR = P(0.6, -0.5), Bk = P(0.8, 0.4), C = P(0.133, -0.133), A = P(0.133, o.tall);
  svgEl('path', { d: pD([FL, FR, Bk, A]) + 'Z', fill: '#dfe8f8', stroke: 'none' }, B.L);
  svgEl('path', { d: pD([FL, FR, A], true), fill: '#dfe8f8', stroke: 'none' }, B.L);
  const L = B.L; sline(L, FL, FR, { w: 2.6 }); sline(L, FR, Bk, { w: 2.6 }); sline(L, FL, Bk, { dash: '7 6', w: 2 });
  [FL, FR, Bk].forEach((p) => sline(L, A, p, { w: 2.6 })); sline(L, A, C, { dash: '2 5', w: 2 });
  const xa = ox + 1.25 * k; sline(L, A, [ox + 1.35 * k, A[1]], { dash: '2 4', w: 1.2 }); sline(L, [ox + 0.72 * k, C[1]], [ox + 1.35 * k, C[1]], { dash: '2 4', w: 1.2 });
  dimArrow(L, [xa, C[1]], [xa, A[1]], { w: 1.4 });
  lab(B, ox - 0.25 * k, oy + 0.45 * k, o.s, 's'); lab(B, xa + 6, (A[1] + C[1]) / 2, o.hh, 'e');
  return B;
}
function sqPyrFig(host) {
  const k = 62, W = 300, H = 3.0 * k + 80, B = fbox(host, W, H), ox = 120, oy = H - 44, P = (x, y) => [ox + x * k, oy - y * k], L = B.L;
  const A = P(-1.5, 0), Bq = P(1.5, 0), C = P(2.3, 0.85), D = P(-0.7, 0.85), Ct = P(0.4, 0.425), Ap = P(0.4, 3.0), M = P(0, 0);
  svgEl('path', { d: pD([A, Bq, C, Ap], true), fill: '#dfe8f8' }, L);
  sline(L, A, Bq, { w: 2.6 }); sline(L, Bq, C, { w: 2.6 }); sline(L, C, D, { dash: '7 6', w: 2 }); sline(L, D, A, { dash: '7 6', w: 2 });
  [A, Bq, C].forEach((p) => sline(L, Ap, p, { w: 2.6 })); sline(L, Ap, D, { dash: '7 6', w: 2 });
  sline(L, Ap, Ct, { dash: '2 5', w: 2 }); sline(L, Ct, M, { dash: '2 5', w: 2 });
  lab(B, M[0], M[1] + 4, T('10\\text{ cm}'), 's'); lab(B, Ct[0] + 6, (Ap[1] + Ct[1]) / 2 + 12, T('h=12\\text{ cm}'), 'e', 'u10l9-flab u10l9-wbg');
  return B;
}
function triPrismFig(host) {
  const k = 62, W = 290, H = 3.3 * k + 60, B = fbox(host, W, H), ox = 30, oy = H - 34, P = (x, y) => [ox + x * k, oy - y * k], L = B.L;
  const A = P(0, 0), Bp = P(1.8, 0), C = P(0, 2.4), A2 = P(2.0, 0.9), B2 = P(3.8, 0.9), C2 = P(2.0, 3.3);
  svgEl('path', { d: pD([A, Bp, B2, C2, C], true), fill: '#dfe8f8' }, L);
  svgEl('path', { d: pD([A, Bp, C], true), fill: '#eef3fc' }, L);
  sline(L, A, A2, { dash: '7 6', w: 2 }); sline(L, A2, B2, { dash: '7 6', w: 2 }); sline(L, A2, C2, { dash: '7 6', w: 2 });
  svgEl('path', { d: pD([A, Bp, C], true), fill: 'none', stroke: INK, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, L);
  sline(L, Bp, B2, { w: 2.6 }); sline(L, B2, C2, { w: 2.6 }); sline(L, C2, C, { w: 2.6 });
  rightMark(L, A, Bp, C, 14, { color: INK, width: 1.8 });
  lab(B, (A[0] + Bp[0]) / 2, A[1] + 4, T('6\\text{ cm}'), 's'); lab(B, A[0] - 2, (A[1] + C[1]) / 2, T('8\\text{ cm}'), 'w', 'u10l9-flab u10l9-tight');
  lab(B, (Bp[0] + C[0]) / 2 + 6, (Bp[1] + C[1]) / 2 - 2, T('10\\text{ cm}'), 'ne', 'u10l9-flab u10l9-wbg');
  lab(B, (Bp[0] + B2[0]) / 2 + 6, (Bp[1] + B2[1]) / 2 + 6, T('15\\text{ cm}'), 'se', 'u10l9-flab u10l9-wbg');
  return B;
}
function truckFig(host) {
  const W = 330, H = 150, B = fbox(host, W, H), x = 34, cy = 62, len = 230, r = 46;
  drawLogCyl(B.L, x, cy, len, r);
  dimArrow(B.L, [x, cy + r + 22], [x + len, cy + r + 22]); lab(B, x + len / 2, cy + r + 24, T('9\\text{ m}'), 's');
  dimArrow(B.L, [x + len + 32, cy], [x + len + 32, cy - r]); lab(B, x + len + 36, cy - r / 2, T('1.8\\text{ m}'), 'e');
  sline(B.L, [x + len, cy], [x + len + 40, cy], { dash: '2 4', w: 1.2 }); sline(B.L, [x + len, cy - r], [x + len + 40, cy - r], { dash: '2 4', w: 1.2 });
  return B;
}

/* =============================== explainer: fill (warm-up) =============================== */
const fill = {
  title: 'Fill the classroom',
  height: 440,
  choices: [{ v: 'grid', label: 'Stack them in a grid' }, { v: 'box', label: 'Cube boxes' }, { v: 'oops', label: 'The two traps' }],
  intro: (v) => (v === 'grid' ? 'Count the balls row by row, layer by layer. Press <b>Next</b>.' : v === 'box' ? 'A second way: give every ball its own box. Press <b>Next</b>.' : 'Why answer D, and why not divide by a ball’s volume? Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, PX = W - 314;
    const p = panel(stage, PX, 14, 300, 410);
    if (v === 'grid') {
      const s = 50, x0 = 58, yF = 300, br = 0.12 * s, B = fbox(stage, PX - 12, 420, 0, 6), L = B.L;
      const wall = svgEl('rect', { x: x0, y: yF - 3 * s, width: 9 * s, height: 3 * s, fill: '#fff8ea', stroke: INK, 'stroke-width': 3 }, L);
      const dz = 64, dyz = 40; // depth hint
      const back = svgEl('g', {}, L); sline(back, [x0, yF - 3 * s], [x0 + dz, yF - 3 * s - dyz], { w: 1.6 }); sline(back, [x0 + 9 * s, yF - 3 * s], [x0 + 9 * s + dz, yF - 3 * s - dyz], { w: 1.6 }); sline(back, [x0 + 9 * s, yF], [x0 + 9 * s + dz, yF - dyz], { w: 1.6 }); sline(back, [x0 + dz, yF - 3 * s - dyz], [x0 + 9 * s + dz, yF - 3 * s - dyz], { w: 1.6 }); sline(back, [x0 + 9 * s + dz, yF - 3 * s - dyz], [x0 + 9 * s + dz, yF - dyz], { w: 1.6 });
      lab(B, x0 + 4.5 * s, yF + 6, '9 m', 's', 'u10l9-flab u10l9-big'); lab(B, x0 - 6, yF - 1.5 * s, '3 m', 'w', 'u10l9-flab u10l9-big'); lab(B, x0 + 9 * s + dz / 2 + 6, yF - dyz / 2, '8 m', 'e', 'u10l9-flab u10l9-big');
      const ghosts = svgEl('g', {}, L); L.insertBefore(ghosts, wall);
      const G = svgEl('g', {}, L);
      const row = [], grid = [];
      const put = (i, j) => { const b = ballSVG(G, x0 + br + i * 2 * br, yF - br - j * 2 * br, br, 0.5); b.style.opacity = 0; return b; };
      for (let i = 0; i < 37; i++) row.push(put(i, 0));
      for (let j = 1; j < 12; j++) for (let i = 0; i < 37; i++) grid.push(put(i, j));
      const showN = (arr, c, ms) => tween(c, ms, (t) => { const k = Math.round(t * arr.length); arr.forEach((b, i) => (b.style.opacity = i < k ? 1 : 0)); });
      const l1 = T('9\\div0.24=37.5\\ \\to\\ 37'), l2 = T('3\\div0.24=12.5\\ \\to\\ 12'), l3 = T('8\\div0.24=33.3\\ldots\\ \\to\\ 33');
      return [
        { cap: `One row along the 9 m wall. Same units first: 24 cm = 0.24 m. ${l1} whole balls (half a ball won’t fit).`,
          run: async (c) => { await showN(row, c, 900); await say(c, p, `<b>along 9 m:</b> ${l1}`); } },
        { cap: `Floor to ceiling: ${l2} layers. The front wall holds ${T('37\\times12=444')} balls.`,
          run: async (c) => { await showN(grid, c, 1100); await say(c, p, `<b>up 3 m:</b> ${l2}`); } },
        { cap: `Back into the room: ${l3}, so <b>33 copies</b> of that wall, one behind the other.`,
          run: async (c) => {
            for (let q = 1; q <= 3; q++) { const r = svgEl('rect', { x: x0 + q * dz / 3, y: yF - 3 * s - q * dyz / 3, width: 9 * s, height: 3 * s, fill: '#f3c9a6', 'fill-opacity': 0.5, stroke: BALLD, 'stroke-width': 1, 'stroke-opacity': 0.5 }, ghosts); await appear(c, r, 200); }
            await say(c, p, `<b>back 8 m:</b> ${l3}`);
          } },
        { cap: `Total: ${T('37\\times12\\times33=14\\,652\\approx15\\,000')}. Answer <b>C</b>: the room holds about <b>15 000</b> balls, not hundreds.`,
          run: async (c) => { await say(c, p, `${T('37\\times12\\times33')}<br>${T('=14\\,652')}`, 'u10l9-big u10l9-good'); await stampIn(c, stamp(stage, 'C · about 15 000', { ok: true, x: PX / 2, y: 384, size: 'sm', rotate: -4 })); } }
      ];
    }
    if (v === 'box') {
      const B = fbox(stage, PX - 12, 420, 0, 6), L = B.L, cx = 230, cy = 230, a = 150, d = 56;
      const cube = svgEl('g', {}, L);
      svgEl('path', { d: pD([[cx - a / 2, cy - a / 2], [cx - a / 2 + d, cy - a / 2 - d * 0.62], [cx + a / 2 + d, cy - a / 2 - d * 0.62], [cx + a / 2 + d, cy + a / 2 - d * 0.62], [cx + a / 2, cy + a / 2], [cx - a / 2, cy + a / 2]], true), fill: '#e8f0fc', stroke: INK, 'stroke-width': 2.4 }, cube);
      sline(cube, [cx - a / 2, cy - a / 2], [cx + a / 2, cy - a / 2], { w: 2.4 }); sline(cube, [cx + a / 2, cy - a / 2], [cx + a / 2, cy + a / 2], { w: 2.4 }); sline(cube, [cx + a / 2, cy - a / 2], [cx + a / 2 + d, cy - a / 2 - d * 0.62], { w: 2.4 });
      const ball = ballSVG(L, cx + d * 0.45, cy - d * 0.28, a / 2 - 2, 2);
      const dm = dimArrow(L, [cx - a / 2, cy + a / 2 + 22], [cx + a / 2, cy + a / 2 + 22]); const dl = lab(B, cx, cy + a / 2 + 24, T('0.24\\text{ m}'), 's');
      [cube, ball, dm, dl].forEach(hide);
      return [
        { cap: 'Give each ball its own <b>cube box</b>, 0.24 m on every edge. Boxes stack with no gaps.',
          run: async (c) => { await appear(c, cube, 350); await pop(c, ball, 380); await appear(c, dm, 250); await fadeIn(c, dl); } },
        { cap: `One box: ${T('V=0.24^3=0.013\\,824\\ \\text{m}^3')}.`, run: (c) => say(c, p, `<b>one box:</b><br>${T('0.24^3=0.013\\,824\\ \\text{m}^3')}`) },
        { cap: `Room ÷ box: ${T('216\\div0.013\\,824=15\\,625')} boxes, one ball in each.`, run: async (c) => { await say(c, p, `<b>boxes:</b><br>${T('216\\div0.013\\,824')}<br>${T('=15\\,625')}`, 'u10l9-good'); } },
        { cap: `Close to the grid count, 14 652: the grid wastes the half-ball gaps at the walls. Either way, about <b>15 000</b>.`,
          run: (c) => stampIn(c, stamp(stage, 'about 15 000', { ok: true, x: 230, y: 390, size: 'sm', rotate: -4 })) }
      ];
    }
    // traps
    const B = fbox(stage, PX - 12, 420, 0, 6), L = B.L, a = 150, x1 = 40, y1 = 70;
    const sq = svgEl('rect', { x: x1, y: y1, width: a, height: a, fill: '#e8f0fc', stroke: INK, 'stroke-width': 2.4 }, L);
    const b1 = ballSVG(L, x1 + a / 2, y1 + a / 2, a / 2 - 2, 2);
    const smalls = svgEl('g', {}, L); hide(smalls);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { svgEl('rect', { x: x1 + i * a / 2, y: y1 + j * a / 2, width: a / 2, height: a / 2, fill: 'none', stroke: RED, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, smalls); }
    const dl = lab(B, x1 + a / 2, y1 + a + 6, `${T('24\\text{ cm}')} box`, 's'); const rl = hide(lab(B, x1 + a / 4, y1 - 4, `${T('12\\text{ cm}')}`, 'n', 'u10l9-flab u10l9-redlab'));
    const x2 = 300, cir = svgEl('g', {}, L); hide(cir);
    svgEl('rect', { x: x2, y: y1, width: a, height: a, fill: '#fde3e1', stroke: INK, 'stroke-width': 2.4 }, cir); ballSVG(cir, x2 + a / 2, y1 + a / 2, a / 2, 2);
    const pl = hide(lab(B, x2 + a / 2, y1 + a + 6, `ball fills ${T('\\tfrac{\\pi}{6}\\approx52\\%')}`, 's'));
    return [
      { cap: `<b>D’s trap:</b> using the radius, 12 cm, as the ball’s width. Half the width means ${T('2\\times2\\times2=8')} small boxes in each real box.`,
        run: async (c) => { await appear(c, smalls, 400); await fadeIn(c, rl); await say(c, p, `<b>radius as width:</b><br>${T('216\\div0.12^3=125\\,000')}`, 'u10l9-bad'); } },
      { cap: `${T('216\\div0.12^3=125\\,000')}: eight times too many. That is answer <b>D</b>, about 150 000.`,
        run: (c) => stampIn(c, stamp(stage, 'D: 8 times too many', { ok: false, x: x1 + a / 2, y: y1 + a + 70, size: 'sm', rotate: -5 })) },
      { cap: `<b>Another trap:</b> divide by the ball’s own volume, ${T('V=\\tfrac43\\pi(0.12)^3\\approx0.007\\,24\\ \\text{m}^3')}: ${T('216\\div0.007\\,24\\approx29\\,800')}.`,
        run: async (c) => { await appear(c, cir, 400); await say(c, p, `<b>ball’s volume:</b><br>${T('216\\div0.007\\,24\\approx29\\,800')}`, 'u10l9-bad'); } },
      { cap: `Too many again: balls don’t fill space. A ball fills only ${T('\\tfrac{\\pi}{6}\\approx52\\%')} of its box, so this overcounts about double. The <b>gaps</b> matter.`,
        run: async (c) => { await fadeIn(c, pl); await say(c, p, `<b>cube boxes:</b> ${T('15\\,625')} ✓`, 'u10l9-good'); } }
    ];
  }
};

/* =============================== explainer: whichWay (★ flowchart) =============================== */
const WAYS = {
  e1a: { label: 'Ex 1(a): m and cm → mm', q: `${T('1.46\\text{ m}-54\\text{ cm}')}, in mm`, passes: [{ path: ['start', 'conv', 'convQ', 'L1'], caps: ['What is asked? A difference of two lengths, in mm. Before subtracting: <b>change units</b>.', `What kind of units? m and cm to mm: <b>SI to SI</b>.`, `Prefix line: m → mm is 3 steps right, ${T('\\times1000')}: ${T('1460\\text{ mm}')}. cm → mm is 1 step: ${T('540\\text{ mm}')}.`] }], end: `Now subtract: ${T('1460-540=920\\text{ mm}')}. Smaller unit, bigger number ✓` },
  e4a: { label: 'Ex 4(a): km → mi', q: `${T('1032\\text{ km}')} in miles, with ${T('5\\text{ mi}=8\\text{ km}')}`, passes: [{ path: ['start', 'conv', 'convQ', 'L2'], caps: ['What is asked? The same length in other units: <b>change units</b>.', 'km to mi crosses between the systems: <b>imperial or mixed</b>.', `Unit analysis: ${T('1032\\text{ km}\\times\\dfrac{5\\text{ mi}}{8\\text{ km}}')}, km cancels.`] }], end: `${T('=645\\text{ mi}')}. Miles are longer, so fewer of them ✓` },
  e9d: { label: 'Ex 9(d): m³ → ft³', q: `${T('371.0158\\ldots\\ \\text{m}^3')} in ${T('\\text{ft}^3')}`, passes: [{ path: ['start', 'conv', 'convQ', 'L3'], caps: ['What is asked? A volume in other units: <b>change units</b>.', `${T('\\text{m}^3')} to ${T('\\text{ft}^3')}: <b>cubed units</b>.`, `Cube the linear factor: ${T('1\\text{ m}^3=\\left(\\tfrac{1}{0.3048}\\right)^3=35.3146\\ldots\\ \\text{ft}^3')}.`] }], end: `${T('371.0158\\ldots\\times35.3146\\ldots=13\\,102.2996\\ldots\\ \\text{ft}^3')}. Round only the final cost.` },
  e8a: { label: 'Ex 8(a): a pyramid', q: 'volume of a triangular pyramid, base side 8 m, height 15 m', passes: [{ path: ['start', 'solid', 'solidQ', 'S2'], caps: ['What is asked? The <b>volume</b> of a 3-D solid.', 'What shape is the top? A pyramid comes to <b>a point</b>.', `${T('V=\\tfrac13A_{\\text{Base}}h')} with the perpendicular height: ${T('\\tfrac13(16\\sqrt3)(15)')}.`] }], end: `${T('V=80\\sqrt3\\approx138.6\\ \\text{m}^3')}: exact first, then rounded once.` },
  e7b: { label: 'Ex 7(b): a sphere', q: 'surface area of a balloon, diameter 18 in', passes: [{ path: ['start', 'solid', 'solidQ', 'S3'], caps: ['What is asked? The <b>surface area</b> of a 3-D solid.', 'What shape is the top? A sphere is <b>round</b> all over.', `Radius first: ${T('r=18\\div2=9')} in. Then ${T('SA=4\\pi r^2=324\\pi')}.`] }], end: `${T('SA\\approx1018\\ \\text{in}^2')}, in square units ✓` },
  e9: { label: 'Ex 9: all of it', q: 'a conical tank, tanker trucks, and two bids', passes: [
    { path: ['start', 'solid', 'solidQ', 'S2'], caps: ['(a) The tank’s volume: a <b>3-D solid</b>.', 'A cone: the top is <b>a point</b>.', `${T('V=\\tfrac13\\pi(8.1)^2(5.4)=118.098\\pi\\approx371.0\\ \\text{m}^3')}.`] },
    { path: ['start', 'solid', 'solidQ', 'S1'], caps: ['(b) One truck’s volume: another <b>solid</b>.', 'A cylinder on its side: <b>flat</b> ends.', `${T('V=\\pi(1.8)^2(9)=29.16\\pi')}; ${T('118.098\\pi\\div29.16\\pi=4.05')}, so 5 trucks.`] },
    { path: ['start', 'conv', 'convQ', 'L3', 'L2'], caps: ['(d) The bids need the volume in ft³: <b>change units</b>.', `${T('\\text{m}^3\\to\\text{ft}^3')} is <b>cubed</b>.`, `Cube the factor: ${T('1\\text{ m}^3=35.3146\\ldots\\ \\text{ft}^3')}.`, `And money: ${T('\\text{US\\$}\\to\\text{C\\$}')} is one more ratio: ${T('\\div0.92')}.`] }
  ], end: `Every branch in one problem. Compare in one currency: Northern Cargo, C$2306.82, is cheaper ✓` }
};
const whichWay = {
  title: '★ Which conversion? Which formula?',
  height: 486,
  choices: Object.keys(WAYS).map((k) => ({ v: k, label: WAYS[k].label })),
  intro: (v) => `Follow <b>${WAYS[v].label.split(':')[0]}</b> through the chart. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const W = ex.W, X = (f) => W * f, cw = W / 6 - 10, Q = WAYS[v];
    const F = new Flowchart(stage, {
      x: 0, y: 0, width: W, height: 484,
      nodes: {
        start: { x: X(0.5), y: 32, w: 340, h: 50, html: '<b>What does the question ask for?</b>', cls: 'bk-round' },
        conv: { x: X(0.25), y: 116, w: 290, h: 58, html: '<b>Change units</b>length, area, volume, money', color: AMB },
        solid: { x: X(0.75), y: 116, w: 290, h: 58, html: '<b>Surface area or volume</b>of a 3-D solid', color: TEAL },
        convQ: { x: X(0.25), y: 210, w: 300, h: 62, html: '<b>What kind of units?</b>', cls: 'bk-diamond', color: AMB },
        solidQ: { x: X(0.75), y: 210, w: 300, h: 62, html: '<b>What shape is the top?</b>', cls: 'bk-diamond', color: TEAL },
        L1: { x: X(1 / 12), y: 340, w: cw, h: 100, html: '<b>Prefix line</b>move the decimal: ×10 a step', color: AMB },
        L2: { x: X(3 / 12), y: 340, w: cw, h: 100, html: `<b>Unit analysis</b>a fraction that cancels the old unit`, color: AMB },
        L3: { x: X(5 / 12), y: 340, w: cw, h: 100, html: `<b>Square or cube</b>the linear factor: ${T('100^2\\ \\text{cm}^2')} in a ${T('\\text{m}^2')}`, color: AMB },
        S1: { x: X(7 / 12), y: 340, w: cw, h: 100, html: `<b>Flat top</b>prism, cylinder ${T('V=A_{\\text{Base}}h')}`, color: TEAL },
        S2: { x: X(9 / 12), y: 340, w: cw, h: 100, html: `<b>A point</b>pyramid, cone ${T('V=\\tfrac13A_{\\text{Base}}h')}, SA uses ${T('s')}`, color: TEAL },
        S3: { x: X(11 / 12), y: 340, w: cw, h: 100, html: `<b>Round</b>sphere ${T('4\\pi r^2,\\ \\tfrac43\\pi r^3')}, radius first`, color: TEAL },
        end: { x: X(0.5), y: 450, w: 640, h: 46, html: '<b>Answer:</b> round once, at the end · units on it · does it make sense?', cls: 'bk-round', color: GRN }
      },
      edges: [
        { from: 'start', to: 'conv', route: 'hv' }, { from: 'start', to: 'solid', route: 'hv' }, { from: 'conv', to: 'convQ' }, { from: 'solid', to: 'solidQ' },
        { from: 'convQ', to: 'L1', label: 'SI ↔ SI', route: 'vhv' }, { from: 'convQ', to: 'L2', label: 'imperial, mixed', route: 'vhv' }, { from: 'convQ', to: 'L3', label: 'm², ft³…', route: 'vhv' },
        { from: 'solidQ', to: 'S1', label: 'flat', route: 'vhv' }, { from: 'solidQ', to: 'S2', label: 'a point', route: 'vhv' }, { from: 'solidQ', to: 'S3', label: 'round', route: 'vhv' }
      ]
    });
    F.el.classList.add('u10l9-flow');
    const qb = add(stage, box(h('div', 'u10l9-qcard', `<div class="u10l9-ph">The question</div>${Q.q}`), Math.max(160, X(0.5) - 200), null), 6, 4);
    const steps = [];
    Q.passes.forEach((ps, pi) => {
      ps.path.forEach((id, i) => {
        if (i === 0) {
          steps.push({ cap: ps.caps[0], run: async (c) => { if (pi) F.fade(); if (!pi) await pop(c, qb, 300); await F.visit(c, 'start'); await F.go(c, 'start', ps.path[1]); await F.visit(c, ps.path[1]); } });
        } else if (i >= 2) {
          const from = id === 'L2' && ps.path[i - 1] === 'L3' ? 'convQ' : ps.path[i - 1];
          steps.push({ cap: ps.caps[i - 1], run: async (c) => { await F.go(c, from, id); await F.visit(c, id); } });
        }
      });
    });
    steps.push({ cap: Q.end, run: (c) => F.visit(c, 'end') });
    return steps;
  }
};

/* =============================== explainer: ladder (Section 1) =============================== */
const PREF = [[-3, 'k', 'kilo'], [-2, 'h', 'hecto'], [-1, 'da', 'deca'], [0, 'unit', ''], [1, 'd', 'deci'], [2, 'c', 'centi'], [3, 'm', 'milli'], [6, 'μ', 'micro']];
/** a number in fixed digit cells with a decimal point that slides between them */
function numStrip(host, x, y, D, e, unit, range, cw = 36) {
  const el = add(host, h('div', 'u10l9-strip'), x, y), [i0, i1] = range;
  const cells = {}; for (let i = i0; i <= i1; i++) { const ch = i >= 0 && i < D.length ? D[i] : '0'; const d = h('div', 'u10l9-dg' + (i >= 0 && i < D.length ? '' : ' u10l9-z'), ch); d.style.left = (i - i0) * cw + 'px'; d.style.width = cw + 'px'; el.appendChild(d); cells[i] = d; }
  const dot = h('div', 'u10l9-dot', '.'); el.appendChild(dot);
  const un = h('div', 'u10l9-un', unit); el.appendChild(un);
  const S = { e, D, el };
  const need = (i, ee) => (i >= 0 && i < D.length) || (ee <= 0 && i >= ee - 1 && i < 0) || (ee > D.length && i >= D.length && i < ee);
  const lay = (ee, t = 1, from = ee) => {
    const ex = lerp(from, ee, t);
    Object.entries(cells).forEach(([i, d]) => { i = +i; const a = need(i, from) ? 1 : 0, b = need(i, ee) ? 1 : 0; d.style.opacity = lerp(a, b, t); });
    dot.style.left = ((ex - i0) * cw - 7) + 'px'; dot.style.opacity = ee >= D.length && t === 1 ? 0.15 : 1;
    let last = D.length - 1; if (ee > D.length) last = ee - 1; un.style.left = ((Math.max(last, ee - 1) - i0 + 1) * cw + 12) + 'px';
  };
  lay(e);
  S.to = async (c, ee, ms = 420) => { const f = S.e; await tween(c, ms, (t) => lay(ee, t, f)); S.e = ee; };
  S.unit = (html) => { un.innerHTML = html; };
  S.text = () => { const ee = S.e; if (ee <= 0) return '0.' + '0'.repeat(-ee) + D; if (ee >= D.length) return D + '0'.repeat(ee - D.length); return D.slice(0, ee) + '.' + D.slice(ee); };
  return S;
}
const ladder = {
  title: 'The prefix number line: the decimal point hops',
  height: 360,
  choices: [{ v: 'how', label: 'How it works' }, { v: 'e1a', label: 'Example 1(a) check' }, { v: 'e1b', label: 'Example 1(b) check (Ext)' }, { v: 'e1c', label: 'Example 1(c) check' }],
  intro: (v) => (v === 'how' ? 'Each step along the line is a factor of 10. Press <b>Next</b>.' : 'Check the class’s work. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W;
    const N = new NumberLine(stage, { x: 10, y: 84, width: W - 20, height: 150, min: -3.5, max: 6.5, step: 1, arrows: true, axisY: 100, numbers: true, fontSize: 19,
      labels: PREF.map(([p, s, n]) => ({ v: p, html: `<b>${s}</b>${n ? `<small>${n}</small>` : ''}` })) });
    N.el.classList.add('u10l9-pline');
    const [ux0, ux1] = [N.toPx(3.5), N.toPx(6.4)];
    svgEl('rect', { x: ux0, y: 64, width: ux1 - ux0, height: 82, rx: 10, fill: '#eceef2' }, N.layers.axis).parentNode.insertBefore(N.layers.axis.lastChild, N.layers.axis.firstChild);
    N.hlabel((ux0 + ux1) / 2, 60, 'Extension: ×1000 per prefix', { cls: 'u10l9-extlab', pos: 'n', gap: 0, parent: N.axisHtml });
    const hops = async (c, a, b, color = AMB) => { const st = Math.sign(b - a); for (let p = a; p !== b; p += st) await N.hop(c, p, p + st, { label: st > 0 ? '×10' : '÷10', color, height: 34 }); };
    const strip = (D, e, unit, range) => numStrip(stage, Math.max(10, W / 2 - (range[1] - range[0] + 1) * 18 - 30), 12, D, e, unit, range);
    const here = (p, col = TEAL) => N.point(p, { color: col, r: 9 });
    const wipe = (keep = []) => { N.clear(); keep.forEach(([q, col]) => here(q, col)); };
    const ans = (html, cls = '') => { const d = add(stage, h('div', 'u10l9-ansbox ' + cls, html), 20, 258); hide(d); return d; };
    if (v === 'how') {
      let S; const a1 = ans(''), a2 = ans('');
      return [
        { cap: `Start with ${T('3.2\\text{ km}')}. Metres (the unit) are <b>3 steps right</b> of kilo.`, run: async (c) => { S = strip('32', 1, 'km', [0, 4]); await fadeIn(c, S.el); await pop(c, here(-3)); } },
        { cap: `Each step right <b>multiplies by 10</b>: the decimal point hops one place right. ${T('3.2\\to32\\to320\\to3200')}.`,
          run: async (c) => { for (let k = 0; k < 3; k++) { await Promise.all([N.hop(c, -3 + k, -2 + k, { label: '×10', height: 34 }), S.to(c, 2 + k)]); } S.unit('m'); await pop(c, here(0, GRN)); } },
        { cap: `${T('3.2\\text{ km}=3200\\text{ m}')}. A <b>smaller</b> unit gives a <b>bigger</b> number: more of them fit.`, run: async (c) => { a1.innerHTML = `${T('3.2\\text{ km}=3200\\text{ m}')} ✓ smaller unit, bigger number`; await fadeIn(c, a1); } },
        { cap: `Going left <b>divides by 10</b> per step: ${T('3200\\text{ m}\\to3.2\\text{ km}')} is 3 steps left. Count the steps, and check the direction.`,
          run: async (c) => { wipe([[0, GRN]]); for (let k = 0; k < 3; k++) { await Promise.all([N.hop(c, -k, -k - 1, { label: '÷10', color: PUR, height: 34 }), S.to(c, 3 - k)]); } S.unit('km'); a1.style.opacity = 0; a2.innerHTML = `${T('3200\\text{ m}=3.2\\text{ km}')}: larger unit, smaller number`; await fadeIn(c, a2); } }
      ];
    }
    if (v === 'e1a') {
      let S, S2; const a1 = ans('');
      return [
        { cap: `Example 1(a): ${T('1.46\\text{ m}')} and ${T('54\\text{ cm}')}. Put both in <b>millimetres</b> before subtracting. Start with ${T('1.46\\text{ m}')}.`, run: async (c) => { S = strip('146', 1, 'm', [0, 4]); await fadeIn(c, S.el); await pop(c, here(0)); } },
        { cap: `m → mm is <b>3 steps right</b>: ${T('\\times1000')}. ${T('1.46\\to14.6\\to146\\to1460')}.`,
          run: async (c) => { for (let k = 0; k < 3; k++) await Promise.all([N.hop(c, k, k + 1, { label: '×10', height: 34 }), S.to(c, 2 + k)]); S.unit('mm'); await pop(c, here(3, GRN)); } },
        { cap: `${T('1.46\\text{ m}=1460\\text{ mm}')}. Now ${T('54\\text{ cm}')}: centi → milli is <b>1 step right</b>, ${T('54\\to540\\text{ mm}')}.`,
          run: async (c) => { a1.innerHTML = `${T('1.46\\text{ m}=1460\\text{ mm}')}`; await fadeIn(c, a1); S.el.style.opacity = 0.0; wipe(); S2 = strip('54', 2, 'cm', [0, 4]); await fadeIn(c, S2.el); await pop(c, here(2, BLUE)); await Promise.all([N.hop(c, 2, 3, { label: '×10', color: BLUE, height: 34 }), S2.to(c, 3)]); S2.unit('mm'); } },
        { cap: `Same unit now, so subtract: ${T('1460-540=920\\text{ mm}')}.`, run: async (c) => { a1.innerHTML = `${T('1460\\text{ mm}-540\\text{ mm}=\\mathbf{920\\ mm}')}`; a1.classList.add('u10l9-good'); await pulse(c, a1, 1.06); } }
      ];
    }
    if (v === 'e1b') {
      let S; const a1 = ans('');
      return [
        { cap: `Example 1(b): ${T('0.045\\text{ cm}')} to kilometres. Kilo is <b>5 steps left</b> of centi: divide by 10 five times.`, run: async (c) => { S = strip('45', -1, 'cm', [-7, 1]); await fadeIn(c, S.el); await pop(c, here(2)); } },
        { cap: `Two steps to metres: ${T('0.045\\to0.0045\\to0.00045\\text{ m}')}.`, run: async (c) => { for (let k = 0; k < 2; k++) await Promise.all([N.hop(c, 2 - k, 1 - k, { label: '÷10', color: PUR, height: 34 }), S.to(c, -2 - k)]); S.unit('m'); } },
        { cap: `Three more to kilometres: ${T('0.00045\\to0.00000045\\text{ km}')}. Zeros fill in as the point hops left.`, run: async (c) => { for (let k = 0; k < 3; k++) await Promise.all([N.hop(c, -k, -k - 1, { label: '÷10', color: PUR, height: 34 }), S.to(c, -4 - k)]); S.unit('km'); await pop(c, here(-3, GRN)); } },
        { cap: `Scientific notation: the point hops 7 places right to make the coefficient ${T('4.5')} (between 1 and 10), so ${T('0.00000045\\text{ km}=\\mathbf{4.5\\times10^{-7}\\ km}')}. A larger unit, a smaller number ✓`,
          run: async (c) => { a1.innerHTML = `${T('0.045\\text{ cm}=0.00000045\\text{ km}=\\mathbf{4.5\\times10^{-7}\\ km}')}`; a1.classList.add('u10l9-good'); await fadeIn(c, a1); } }
      ];
    }
    // e1c: four statements
    const ST = [
      { a: 2, b: 0, D: '1', e: 1, t: '1\\text{ cm}=0.01\\text{ m}', res: '0.01\\text{ m}', ok: true },
      { a: 3, b: 0, D: '1', e: 1, t: '1\\text{ mm}=0.001\\text{ m}', res: '0.001\\text{ m}', ok: true },
      { a: 6, b: 3, D: '1', e: 1, t: '1\\ \\mu\\text{m}=0.01\\text{ mm}', res: '0.001\\text{ mm}', ok: false },
      { a: -3, b: 0, D: '1', e: 1, t: '1\\text{ km}=1000\\text{ m}', res: '1000\\text{ m}', ok: true }
    ];
    const cards = ST.map((s, i) => { const d = add(stage, box(h('div', 'u10l9-stc', `<b>${i + 1}.</b> ${T(s.t)}`), (W - 40) / 4 - 8, 70), 20 + i * ((W - 40) / 4), 270); return d; });
    const one = (i) => {
      const s = ST[i], steps = Math.abs(s.b - s.a), left = s.b < s.a, ext = s.a === 6;
      return {
        cap: `Statement ${i + 1}: ${T(s.t)}. ${ext ? 'micro → milli is one ×1000 jump (3 places) <b>left</b>' : `${steps} step${steps > 1 ? 's' : ''} ${left ? 'left (÷10 each)' : 'right'}`}: ${T('1\\to' + s.res)}. ${s.ok ? '<b>True.</b>' : `<b>False:</b> it is ${T(s.res)}, not ${T('0.01\\text{ mm}')}.`}`,
        run: async (c) => {
          N.clear(); stage.querySelectorAll('.u10l9-strip').forEach((e) => e.remove());
          const lo = left ? -steps - 1 : 0, S = numStrip(stage, W / 2 - 150, 12, '1', 1, ['cm', 'mm', 'μm', 'km'][i], [Math.min(lo, -3), Math.max(1, 4)]);
          await pop(c, here(s.a));
          const st = Math.sign(s.b - s.a);
          if (ext) await Promise.all([N.hop(c, s.a, s.b, { label: '÷1000', color: PUR, height: 44 }), S.to(c, 1 - 3, 700)]);
          else for (let p = s.a, k = 1; p !== s.b; p += st, k++) await Promise.all([N.hop(c, p, p + st, { label: st > 0 ? '×10' : '÷10', color: st > 0 ? AMB : PUR, height: 34 }), S.to(c, 1 + st * k)]);
          S.unit(['m', 'm', 'mm', 'm'][i]); await pop(c, here(s.b, s.ok ? GRN : RED));
          cards[i].classList.add(s.ok ? 'u10l9-okc' : 'u10l9-noc'); const sg = h('span', 'u10l9-tick ' + (s.ok ? 'ok' : 'no'), s.ok ? '✓' : '✗'); cards[i].appendChild(sg); await pop(c, sg);
        }
      };
    };
    return [one(0), one(1), one(2), one(3), { cap: `Exactly <b>one</b> statement (Statement 3) is false.`, run: (c) => pulse(c, cards[2], 1.06) }];
  }
};

/* =============================== explainer: sizeUp (Section 2) =============================== */
const INST = [
  { k: 'mic', name: 'micrometer', pr: '0.01 mm', rg: 'up to 25 mm' }, { k: 'cal', name: 'vernier caliper', pr: '0.05 mm', rg: 'up to ~15 cm' },
  { k: 'rul', name: 'ruler', pr: '1 mm', rg: 'up to 30 cm' }, { k: 'tape', name: 'tape measure', pr: '1 mm', rg: 'up to ~30 m' }, { k: 'tw', name: 'trundle wheel', pr: 'about 1 m', rg: 'long distances' }
];
function instIcon(L, k, cx, cy) {
  const g = svgEl('g', {}, L), S = (d, f = 'none', w = 2.4) => svgEl('path', { d, fill: f, stroke: INK, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
  const t = `translate(${cx} ${cy})`; g.setAttribute('transform', t);
  if (k === 'mic') { S('M-40 -14 A26 26 0 0 0 -40 26 L-30 26 A16 16 0 0 1 -30 -6', '#cfd5de'); S('M-30 -6 L-6 -6 L-6 6 L-30 6', '#eceef2'); S('M-6 -12 L30 -12 L30 12 L-6 12 Z', '#bfc5cf'); S('M14 -12 L14 12 M20 -12 L20 12', 'none', 1.4); S('M-44 -8 L-34 -8', 'none', 3); }
  else if (k === 'cal') { S('M-46 -6 L46 -6 L46 4 L-46 4 Z', '#e4e7ec'); S('M-46 -6 L-46 24 L-38 24 L-38 4', '#cfd5de'); S('M-14 -14 L8 -14 L8 12 L-14 12 Z', '#cfd5de'); S('M-14 12 L-14 24 L-6 24 L-6 12', '#cfd5de'); for (let i = -40; i <= 40; i += 8) S(`M${i} -6 L${i} -1`, 'none', 1.2); }
  else if (k === 'rul') { S('M-48 -10 L48 -10 L48 10 L-48 10 Z', '#fbe6a8'); for (let i = -44; i <= 44; i += 6) S(`M${i} -10 L${i} ${(i + 44) % 30 === 0 ? 0 : -4}`, 'none', 1.3); }
  else if (k === 'tape') { S('M-34 -22 L4 -22 Q12 -22 12 -14 L12 18 L-34 18 Z', '#f2c94c'); svgEl('circle', { cx: -11, cy: -2, r: 9, fill: '#fff', stroke: INK, 'stroke-width': 2 }, g); S('M12 10 L46 10 L46 16 L12 16', '#fbe6a8', 2); S('M46 6 L46 20', 'none', 2.6); }
  else { svgEl('circle', { cx: -14, cy: 10, r: 18, fill: '#eceef2', stroke: INK, 'stroke-width': 2.4 }, g); S('M-14 10 L-14 -8', 'none', 1.6); S('M-14 10 L30 -30 L40 -30', 'none', 3); }
  return g;
}
const HORSE = [[0.1, 0], [0.11, 0.3], [0.1, 0.36], [0.12, 0.55], [0.06, 0.66], [0.05, 0.78], [0.0, 0.92], [-0.08, 1.05], [-0.11, 1.07], [-0.3, 0.89], [-0.36, 0.86], [-0.38, 0.91], [-0.34, 0.98], [-0.15, 1.22], [-0.09, 1.34], [-0.05, 1.27], [0.06, 1.16], [0.18, 1.04], [0.26, 1.0], [0.45, 0.94], [0.7, 0.94], [0.85, 0.98], [0.97, 0.94], [1.0, 0.9], [1.06, 0.8], [1.08, 0.55], [1.04, 0.45], [1.02, 0.62], [0.99, 0.74], [0.98, 0.58], [0.96, 0.38], [0.95, 0.3], [0.95, 0.04], [0.97, 0], [0.89, 0], [0.89, 0.28], [0.87, 0.4], [0.83, 0.54], [0.7, 0.53], [0.4, 0.52], [0.24, 0.53], [0.2, 0.45], [0.18, 0.32], [0.17, 0.04], [0.18, 0]];
const HORSE_LEGS = [[[0.2, 0.5], [0.23, 0.3], [0.22, 0.04], [0.24, 0], [0.31, 0], [0.29, 0.3], [0.3, 0.5]], [[0.78, 0.5], [0.8, 0.36], [0.79, 0.04], [0.8, 0], [0.86, 0], [0.86, 0.3], [0.85, 0.5]]];
const sizeUp = {
  title: 'Sizing up: units, instruments, referents',
  height: 420,
  choices: [{ v: 'unit', label: 'Ex 2(a) check: units' }, { v: 'tool', label: 'Ex 2(b) check: instruments' }, { v: 'hand', label: 'Ex 2(c) check: hands' }],
  intro: (v) => (v === 'unit' ? 'Try every imperial unit; keep the one that gives a friendly number. Press <b>Next</b>.' : v === 'tool' ? 'Match each job to the instrument with the right precision and reach. Press <b>Next</b>.' : 'A hand is a 4-inch referent. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W;
    if (v === 'unit') {
      const rows = [
        { o: 'coin diameter', note: 'about 1 in', vals: ['1', '0.083', '0.028', '0.000\\,016'], best: 0 },
        { o: 'soccer field', note: 'about 100 yd', vals: ['3600', '300', '100', '0.057'], best: 2 },
        { o: 'drive between towns', note: 'say 30 mi', vals: ['1\\,900\\,800', '158\\,400', '52\\,800', '30'], best: 3 }
      ];
      const cols = ['inches', 'feet', 'yards', 'miles'], x0 = 250, cw2 = (W - x0 - 20) / 4, y0 = 70, rh = 96;
      const head = cols.map((cn, j) => add(stage, box(h('div', 'u10l9-th', `<b>${cn}</b>`), cw2 - 8, 40), x0 + j * cw2, 16));
      const cells = rows.map((r, i) => {
        add(stage, box(h('div', 'u10l9-rowh', `<b>${r.o}</b><small>${r.note}</small>`), 228, rh - 12), 10, y0 + i * rh);
        return r.vals.map((vv, j) => hide(add(stage, box(h('div', 'u10l9-tc', T(vv)), cw2 - 8, rh - 12), x0 + j * cw2, y0 + i * rh)));
      });
      const B = fbox(stage, 60, 300, 186, y0); const L = B.L;
      svgEl('circle', { cx: 30, cy: 40, r: 16, fill: '#d9b24c', stroke: INK, 'stroke-width': 2 }, L);
      svgEl('rect', { x: 6, y: 120, width: 48, height: 30, fill: '#9fd49b', stroke: INK, 'stroke-width': 2 }, L); sline(L, [30, 120], [30, 150], { w: 1.5, color: '#fff' });
      svgEl('path', { d: 'M10 290 L24 214 L36 214 L50 290 Z', fill: '#c9ced6', stroke: INK, 'stroke-width': 2 }, L); sline(L, [30, 222], [30, 282], { w: 2, color: '#fff', dash: '6 6' });
      const row = (i) => ({
        cap: [`A coin is about 1 in across: ${T('1')} in, or ${T('0.083')} ft, or ${T('0.000\\,016')} mi. <b>Inches</b> give the friendly number.`,
          `A soccer field is about 100 yd: ${T('3600')} in or ${T('0.057')} mi are awkward; <b>yards</b> give ${T('100')}.`,
          `A drive of, say, 30 mi is ${T('158\\,400')} ft. <b>Miles</b> give ${T('30')}: tens of miles.`][i],
        run: async (c) => { for (let j = 0; j < 4; j++) await fadeIn(c, cells[i][j], 200); cells[i].forEach((e, j) => e.classList.add(j === rows[i].best ? 'u10l9-best' : 'u10l9-meh')); await pulse(c, cells[i][rows[i].best], 1.08); }
      });
      return [row(0), row(1), row(2), { cap: 'Rule: choose the unit that makes the measurement a <b>convenient-sized number</b>: not a tiny decimal, not a huge count.', run: (c) => Promise.all(head.map((e) => pulse(c, e, 1.04))) }];
    }
    if (v === 'tool') {
      const n = INST.length, cw2 = (W - 20) / n;
      const cards = INST.map((it, i) => { const d = add(stage, box(h('div', 'u10l9-inst', `<div class="u10l9-isp"></div><b>${it.name}</b><span>reads to ${it.pr}</span><small>${it.rg}</small>`), cw2 - 12, 190), 10 + i * cw2, 200); return d; });
      const B = fbox(stage, W, 420, 0, 0), L = B.L; B.el.style.pointerEvents = 'none';
      INST.forEach((it, i) => instIcon(L, it.k, 10 + i * cw2 + (cw2 - 12) / 2, 252));
      const jobs = [
        { t: 'thickness of a credit card', s: 'under 1 mm', to: 0, why: 'Under a millimetre thick, so it needs <b>0.01 mm</b> precision: the <b>micrometer</b>.' },
        { t: 'width of a doorway', s: 'about 0.9 m', to: 3, why: 'About a metre: too long for a ruler, a job for the <b>tape measure</b>.' },
        { t: 'length of a running track', s: '400 m', to: 4, why: 'A long distance, walked out: the <b>trundle wheel</b> counts turns of a wheel.' }
      ];
      const pills = jobs.map((j, i) => hide(add(stage, h('div', 'u10l9-job', `<b>${j.t}</b><small>${j.s}</small>`), 20 + i * (W / 3), 30)));
      const step = (i) => ({
        cap: jobs[i].why,
        run: async (c) => {
          const p = pills[i], j = jobs[i]; await fadeIn(c, p);
          const x1 = 20 + i * (W / 3), x2 = Math.max(4, Math.min(W - p.offsetWidth - 4, 10 + j.to * cw2 + (cw2 - 12) / 2 - p.offsetWidth / 2));
          await tween(c, 600, (t) => { p.style.left = lerp(x1, x2, t) + 'px'; p.style.top = lerp(30, 120 - i * 0, t) + 'px'; });
          cards[j.to].classList.add('u10l9-hot'); await pulse(c, cards[j.to], 1.05);
          p.style.display = 'none'; const tag = add(stage, h('div', 'u10l9-jtag', j.t), 10 + j.to * cw2 + 6, 158); await fadeIn(c, tag);
        }
      });
      return [step(0), step(1), step(2), { cap: 'Match the <b>precision</b> the job needs (and the <b>reach</b>) to the tool. The vernier caliper and ruler wait for small objects and gaps.', run: (c) => sleep(c, 200) }];
    }
    // hands
    const B = fbox(stage, W, 420, 0, 0), L = B.L, pin = 5.6, yG = 392, xS = 440, hw = 70;
    const Y = (inch) => yG - inch * pin;
    // inch scale
    sline(L, [xS - 16, Y(0)], [xS - 16, Y(62)], { w: 2 });
    for (let i = 0; i <= 60; i += 4) { sline(L, [xS - 16, Y(i)], [xS - (i % 12 === 0 ? 30 : 22), Y(i)], { w: i % 12 === 0 ? 2.2 : 1.4 }); if (i % 12 === 0) lab(B, xS - 34, Y(i), T(`${i}`), 'w', 'u10l9-flab u10l9-sm'); }
    lab(B, xS - 50, Y(62) - 6, 'inches', 'n', 'u10l9-flab u10l9-sm');
    sline(L, [20, yG], [W - 20, yG], { w: 3 });
    // horse
    const hs = 57 * pin, sx = hs * 0.78, hx = 34 + 0.38 * sx, HP = (pts) => pts.map(([x, y]) => [hx + x * sx, yG - y * hs]);
    HORSE_LEGS.forEach((lg) => svgEl('path', { d: pD(HP(lg), true), fill: '#8a5a33', stroke: '#4a2f17', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, L));
    svgEl('path', { d: pD(HP(HORSE), true), fill: '#b9844f', stroke: '#4a2f17', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, L);
    svgEl('circle', { cx: hx - 0.2 * sx, cy: yG - 1.08 * hs, r: 3.5, fill: '#2a1a0c' }, L);
    const wx = hx + 0.26 * sx;
    sline(L, [wx, Y(57)], [xS + hw + 30, Y(57)], { dash: '6 5', color: RED, w: 2 });
    lab(B, wx - 6, Y(57) - 4, 'withers', 'nw', 'u10l9-flab u10l9-sm');
    const handG = svgEl('g', {}, L); const hands = [];
    for (let i = 0; i < 15; i++) {
      const top = i < 14 ? 4 * (i + 1) : 57, bot = 4 * i, gg = svgEl('g', {}, handG);
      svgEl('rect', { x: xS, y: Y(top), width: hw, height: (top - bot) * pin, rx: 5, fill: i < 14 ? '#f6d3b3' : '#fbe6d2', stroke: '#8a5a33', 'stroke-width': 1.6 }, gg);
      if (i < 14) for (let f = 1; f < 4; f++) sline(gg, [xS + f * hw / 4, Y(top) + 3], [xS + f * hw / 4, Y(top) + (top - bot) * pin * 0.55], { color: '#8a5a33', w: 1 });
      hide(gg); hands.push(gg);
    }
    const p = panel(stage, xS + hw + 160, 30, W - (xS + hw + 180), 340);
    const brk = svgEl('g', {}, L); hide(brk);
    for (let f = 0; f < 4; f++) { const a = Y(12 * f + 0.4), b = Y(12 * f + 11.6), x = xS + hw + 12; svgEl('path', { d: `M${x} ${a}Q${x + 12} ${a} ${x + 12} ${(a + b) / 2}Q${x + 12} ${b} ${x} ${b}`, fill: 'none', stroke: TEAL, 'stroke-width': 2.4 }, brk); lab(B, x + 16, (a + b) / 2, `${f + 1} ft`, 'e', 'u10l9-flab u10l9-teal'); }
    const rest = svgEl('g', {}, L); hide(rest); { const a = Y(48.4), b = Y(56.6), x = xS + hw + 12; svgEl('path', { d: `M${x} ${a}Q${x + 12} ${a} ${x + 12} ${(a + b) / 2}Q${x + 12} ${b} ${x} ${b}`, fill: 'none', stroke: AMB, 'stroke-width': 2.4 }, rest); lab(B, x + 16, (a + b) / 2, '9 in', 'e', 'u10l9-flab u10l9-amb'); }
    return [
      { cap: `Example 2(c): stack hand widths up to the horse’s shoulder: ${T('14\\tfrac14')} hands, each a <b>4 in</b> referent.`, run: async (c) => { for (const g of hands) await appear(c, g, 70); } },
      { cap: `${T('14\\tfrac14\\times4=14.25\\times4=57')} inches.`, run: (c) => say(c, p, `${T('14.25\\times4=57\\text{ in}')}`) },
      { cap: `Group the inches into feet: ${T('1\\text{ ft}=12\\text{ in}')}, three hands per foot. Four whole feet…`, run: async (c) => { await appear(c, brk, 400); await say(c, p, `${T('57\\text{ in}\\times\\dfrac{1\\text{ ft}}{12\\text{ in}}')}`); } },
      { cap: `…and 9 in left over, ${T('\\tfrac{9}{12}=\\tfrac34')} ft. The horse is ${T('\\dfrac{57}{12}=4\\tfrac34')} <b>feet</b> tall (4 ft 9 in).`, run: async (c) => { await appear(c, rest, 300); await say(c, p, `${T('=\\dfrac{57}{12}=\\mathbf{4\\tfrac34\\ ft}')}`, 'u10l9-good'); } }
    ];
  }
};

/* =============================== explainer: micro (Extension) =============================== */
const micro = {
  title: 'Extension: inside the micrometer',
  height: 300,
  choices: [{ v: 'how', label: 'How it works' }, { v: 'e3', label: 'Example 3 check' }],
  intro: (v) => (v === 'how' ? 'Turn the thimble and watch both scales. Press <b>Next</b>.' : 'Open the micrometer to the Example 3 reading. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, MW = 620, how = v === 'how', M = new Micrometer(stage, { x: 4, y: how ? 20 : 30, width: MW, height: 250, lo: 0, mmPx: how ? 64 : 44, x0: 30, R: how ? 2 : 0, zoom: how ? 1.3 : 1.08 });
    const p = panel(stage, MW + 20, 20, W - MW - 30, 260, v === 'how' ? 'The reading' : 'Example 3');
    const turn = (c, a, b, ms) => tween(c, ms, (t) => M.set(lerp(a, b, t)));
    const ring = (x, y, col = RED) => { const e = svgEl('circle', { cx: x, cy: y, r: 13, fill: 'none', stroke: col, 'stroke-width': 3 }, M.Lt); return e; };
    if (v === 'how') {
      return [
        { cap: 'The <b>sleeve</b> is fixed: whole millimetres above the index line, half millimetres below. The <b>thimble</b> edge shows how far it is open: 2 mm here.', run: (c) => say(c, p, `${T('2.00\\text{ mm}')}`) },
        { cap: `One full turn of the thimble moves it <b>0.5 mm</b>, and its scale runs once through 0 → 50.`, run: async (c) => { await turn(c, 2, 2.5, 1600); await say(c, p, `one turn: ${T('+0.5\\text{ mm}')} → ${T('2.50\\text{ mm}')}`); } },
        { cap: `So each thimble division is ${T('0.5\\div50=0.01')} mm.`, run: (c) => say(c, p, `${T('0.5\\div50=0.01\\text{ mm}')} per division`) },
        { cap: `Half a turn more: the sleeve shows the <b>2.5</b> half-mark, the index line points at <b>25</b> on the thimble: ${T('2.5+0.25=2.75')} mm.`, run: async (c) => { await turn(c, 2.5, 2.75, 900); await say(c, p, `${T('2.5+0.25=\\mathbf{2.75\\ mm}')}`, 'u10l9-good'); } }
      ];
    }
    return [
      { cap: 'Example 3: open the micrometer to the reading in the booklet.', run: (c) => turn(c, 0, 8.77, 2200) },
      { cap: 'Sleeve: the last mark the thimble has uncovered is the <b>half-mark below the line</b>, just past 8: <b>8.5 mm</b>. (Miss it and you are 0.5 mm short.)', run: async (c) => { await pop(c, ring(M.X(8.5), M.m.y0 + 16)); await say(c, p, `sleeve ${T('=8.5\\text{ mm}')}`); } },
      { cap: `Thimble: the index line points at <b>27</b>, so ${T('27\\times0.01=0.27')} mm.`, run: async (c) => { await pop(c, ring(M.xE + 22, M.m.y0, BLUE)); await say(c, p, `thimble ${T('=27\\times0.01=0.27\\text{ mm}')}`); } },
      { cap: `Reading ${T('=8.5+0.27=8.77')} mm, to the instrument’s 0.01 mm precision.`, run: (c) => say(c, p, `${T('8.5+0.27=\\mathbf{8.77\\ mm}')}`, 'u10l9-good') }
    ];
  }
};

/* =============================== explainer: ratioMap (Section 4) =============================== */
const ratioMap = {
  title: 'A ratio that cancels, and a map scale',
  height: 400,
  choices: [{ v: 'e4a', label: 'Example 4(a) check' }, { v: 'e4b', label: 'Example 4(b) check' }],
  intro: (v) => (v === 'e4a' ? 'Turn 1032 km into miles with 5 mi = 8 km. Press <b>Next</b>.' : 'A map at 1 : 1 500 000. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W;
    if (v === 'e4a') {
      const eq = add(stage, h('div', 'u10l9-eq', ''), 20, 16);
      const NK = new NumberLine(stage, { x: 20, y: 150, width: W - 40, height: 90, min: 0, max: 1100, step: 100, arrows: false, axisY: 34 });
      const NM = new NumberLine(stage, { x: 20, y: 250, width: W - 40, height: 90, min: 0, max: 1100 * 5 / 8, step: 100, arrows: false, axisY: 34 });
      slab(stage, 50, 184, '<b>km</b>', 'w', 'u10l9-amb'); slab(stage, 50, 284, '<b>mi</b>', 'w', 'u10l9-blue');
      const bk = NK.interval(0, 1032, { color: AMB, width: 9, openA: false }), bm = NM.interval(0, 645, { color: BLUE, width: 9 });
      [bk, bm].forEach(hide);
      const xe = 20 + NK.toPx(1032), link = sline(svgEl('svg', { width: W, height: 400, style: 'position:absolute;left:0;top:0;overflow:visible' }, stage), [xe, 184], [xe, 284], { dash: '5 5', w: 2, color: GRN }); hide(link);
      const ek = hide(slab(stage, xe, 160, T('1032'), 'n', 'u10l9-amb')), em = hide(slab(stage, xe, 260, T('645'), 'n', 'u10l9-blue'));
      const st = add(stage, h('div', 'u10l9-ansbox', ''), W - 330, 330); hide(st);
      return [
        { cap: 'Write the distance over 1, then multiply by a conversion fraction with <b>km on the bottom</b>, so km cancels.', run: async (c) => { eq.innerHTML = T('\\dfrac{1032\\text{ km}}{1}\\times\\dfrac{5\\text{ mi}}{8\\text{ km}}'); await fadeIn(c, eq); } },
        { cap: 'km on top and km on the bottom <b>cancel</b>, leaving mi.', run: async (c) => { eq.innerHTML = T('\\dfrac{1032\\,{\\color{#c93a33}\\cancel{\\text{km}}}}{1}\\times\\dfrac{5\\text{ mi}}{8\\,{\\color{#c93a33}\\cancel{\\text{km}}}}=\\dfrac{1032\\times5}{8}\\text{ mi}'); await pulse(c, eq, 1.04); } },
        { cap: `${T('1032\\div8=129')} groups of 8 km, and each group is 5 mi: ${T('129\\times5=645')} mi.`, run: async (c) => { eq.innerHTML = T('\\dfrac{1032\\,{\\color{#c93a33}\\cancel{\\text{km}}}}{1}\\times\\dfrac{5\\text{ mi}}{8\\,{\\color{#c93a33}\\cancel{\\text{km}}}}=129\\times5=\\mathbf{645\\ mi}'); bk.style.opacity = 1; await NK.drawIn(bk, 800, c); } },
        { cap: 'The same road on both scales: 1032 km is 645 mi. Miles are longer, so there are fewer of them ✓', run: async (c) => { bm.style.opacity = 1; await NM.drawIn(bm, 800, c); await appear(c, link, 300); await fadeIn(c, ek, 200); await fadeIn(c, em, 200); st.innerHTML = `${T('1032\\text{ km}\\approx645\\text{ mi}')} ✓`; await fadeIn(c, st); } }
      ];
    }
    // map
    const B = fbox(stage, W, 400, 0, 0), L = B.L, k = 15, mx = 40, my = 60, mw = 42 * k + 20, mh = 190;
    svgEl('rect', { x: mx - 10, y: my, width: mw, height: mh, rx: 10, fill: '#eef5e6', stroke: '#8fae78', 'stroke-width': 2 }, L);
    svgEl('path', { d: `M${mx + 40} ${my + 150} C ${mx + 160} ${my + 90}, ${mx + 260} ${my + 170}, ${mx + 420} ${my + 120} S ${mx + 560} ${my + 60}, ${mx + 620} ${my + 90}`, fill: 'none', stroke: '#8ab6e8', 'stroke-width': 7, 'stroke-linecap': 'round' }, L);
    const tA = [mx + 2 * k, my + 80], tB = [mx + 38 * k, my + 80];
    [tA, tB].forEach((t, i) => { svgEl('circle', { cx: t[0], cy: t[1], r: 8, fill: INK }, L); lab(B, t[0], t[1] - 10, i ? 'Town B' : 'Town A', 'n', 'u10l9-flab'); });
    const ry = my + mh + 22; svgEl('rect', { x: mx - 10, y: ry, width: mw, height: 46, fill: '#fbe6a8', stroke: INK, 'stroke-width': 1.6 }, L);
    for (let i = 0; i <= 40; i++) { const x = mx + 2 * k + (i - 0) * k - 2 * k; sline(L, [x, ry], [x, ry + (i % 5 === 0 ? 18 : 10)], { w: i % 5 === 0 ? 1.8 : 1.1 }); if (i % 5 === 0) { const t = svgEl('text', { x, y: ry + 36, 'text-anchor': 'middle', class: 'u10l9-mnum' }, L); t.textContent = i; } }
    lab(B, mx + 41.3 * k, ry + 23, 'cm', 'c', 'u10l9-flab u10l9-sm');
    const one = svgEl('rect', { x: mx, y: ry - 4, width: k, height: 54, fill: AMB, 'fill-opacity': 0.25, stroke: AMB, 'stroke-width': 2 }, L); hide(one);
    const oneL = hide(lab(B, mx - 8, ry + 52, `${T('1\\text{ cm}')} on the map = ${T('1\\,500\\,000\\text{ cm}')} = 15 km`, 'se', 'u10l9-flab u10l9-amb'));
    const seg = svgEl('line', { x1: tA[0], y1: tA[1], x2: tB[0], y2: tB[1], stroke: GRN, 'stroke-width': 5, 'stroke-linecap': 'round' }, L); hide(seg);
    const dropA = sline(L, [tA[0], tA[1]], [tA[0], ry], { dash: '4 4', w: 1.4, color: GRN }), dropB = sline(L, [tB[0], tB[1]], [tB[0], ry], { dash: '4 4', w: 1.4, color: GRN }); hide(dropA); hide(dropB);
    const p = panel(stage, mx + mw + 20, 20, W - mx - mw - 30, 360);
    return [
      { cap: `Same unit first: ${T('540\\text{ km}=540\\,000\\text{ m}=54\\,000\\,000\\text{ cm}')} (km → m ${T('\\times1000')}, m → cm ${T('\\times100')}).`, run: (c) => say(c, p, `${T('540\\text{ km}')}<br>${T('=540\\,000\\text{ m}')}<br>${T('=54\\,000\\,000\\text{ cm}')}`) },
      { cap: `${T('1:1\\,500\\,000')} means <b>1 cm on the map</b> stands for ${T('1\\,500\\,000')} cm on the ground (15 km).`, run: async (c) => { await appear(c, one, 300); await fadeIn(c, oneL); } },
      { cap: `Map distance ${T('=\\dfrac{54\\,000\\,000}{1\\,500\\,000}=36\\text{ cm}')}.`, run: async (c) => { await say(c, p, `${T('\\dfrac{54\\,000\\,000}{1\\,500\\,000}')}<br>${T('=\\mathbf{36\\ cm}')}`, 'u10l9-good'); seg.style.opacity = 1; await appear(c, dropA, 200); await appear(c, dropB, 200); await pop(c, seg); } },
      { cap: `Check the other way: ${T('36\\times15\\text{ km}=540\\text{ km}')} ✓`, run: (c) => say(c, p, `check: ${T('36\\times15=540\\text{ km}')} ✓`) }
    ];
  }
};

/* =============================== explainer: applied (Section 5) =============================== */
const applied = {
  title: 'Same units first: a floor and a fish tank',
  height: 430,
  choices: [{ v: 'tile', label: 'Example 5(a) check: tiles' }, { v: 'tank', label: 'Example 5(b) check: drops' }],
  intro: (v) => (v === 'tile' ? 'Yards for the floor, inches for the tiles. Press <b>Next</b>.' : 'Centimetres, litres, and drops per 10 L. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, PW = 300, p = panel(stage, W - PW - 6, 14, PW, 400);
    if (v === 'tile') {
      const sc = 2.2, fw = 252 * sc, fh = 126 * sc, x0 = 84, y0 = 60, t = 10.5 * sc, B = fbox(stage, W - PW - 16, 430, 0, 0), L = B.L;
      svgEl('rect', { x: x0, y: y0, width: fw, height: fh, fill: '#f6f1e7', stroke: INK, 'stroke-width': 3 }, L);
      const dl = lab(B, x0 + fw / 2, y0 - 6, `${T('7\\text{ yd}')}`, 'n', 'u10l9-flab u10l9-big'), wl = lab(B, x0 - 6, y0 + fh / 2, `${T('3\\tfrac12\\text{ yd}')}`, 'w', 'u10l9-flab u10l9-big u10l9-tight');
      const G = svgEl('g', {}, L), mk = (i, j, col = '#9cc3e8') => { const r = svgEl('rect', { x: x0 + i * t + 1, y: y0 + j * t + 1, width: t - 2, height: t - 2, fill: col, stroke: '#4d7fb5', 'stroke-width': 0.8 }, G); hide(r); return r; };
      const row = [], colm = [], rest = [];
      for (let i = 0; i < 24; i++) row.push(mk(i, 0)); for (let j = 1; j < 12; j++) colm.push(mk(0, j)); for (let j = 1; j < 12; j++) for (let i = 1; i < 24; i++) rest.push(mk(i, j, '#c3dbf1'));
      const showN = (arr, c, ms) => tween(c, ms, (tt) => { const k = Math.round(tt * arr.length); arr.forEach((b, i) => (b.style.opacity = i < k ? 1 : 0)); });
      return [
        { cap: `Mixed units: the floor is in yards, the tiles in inches. Convert the floor: ${T('1\\text{ yd}=3\\text{ ft}=36\\text{ in}')}.`,
          run: async (c) => { await say(c, p, `${T('7\\times36=252\\text{ in}')}`); await say(c, p, `${T('3\\tfrac12\\times36=126\\text{ in}')}`); dl.innerHTML = T('252\\text{ in}'); wl.innerHTML = T('126\\text{ in}'); await pulse(c, dl, 1.1); } },
        { cap: `Along the length: ${T('252\\div10.5=24')} tiles.`, run: async (c) => { await showN(row, c, 700); await say(c, p, `length: ${T('252\\div10.5=24')}`); } },
        { cap: `Along the width: ${T('126\\div10.5=12')} tiles.`, run: async (c) => { await showN(colm, c, 500); await say(c, p, `width: ${T('126\\div10.5=12')}`); } },
        { cap: `Fill the floor: ${T('24\\times12=288')} tiles.`, run: async (c) => { await showN(rest, c, 900); await say(c, p, `${T('24\\times12=\\mathbf{288}')} tiles`, 'u10l9-good u10l9-big'); } }
      ];
    }
    // aquarium
    const B = fbox(stage, W - PW - 16, 430, 0, 0), L = B.L, s = 5.2, a = 55 * s, b = 25 * s, d = 40 * s * 0.42, x0 = 96, yb = 210;
    const P = (x, y, z) => [x0 + x + z * 0.86, yb - y - z * 0.5];
    const face = (pts, f, op = 1) => svgEl('path', { d: pD(pts, true), fill: f, 'fill-opacity': op, stroke: INK, 'stroke-width': 2 }, L);
    face([P(0, 0, 0), P(a, 0, 0), P(a, 0, d), P(0, 0, d)], '#e8f0fc', 0.4);
    const water = svgEl('g', {}, L);
    const wh = (frac) => { water.innerHTML = ''; const y = b * frac; svgEl('path', { d: pD([P(0, 0, 0), P(a, 0, 0), P(a, 0, d), P(a, y, d), P(0, y, d), P(0, y, 0)], true), fill: '#7fb7ea', 'fill-opacity': 0.55 }, water); svgEl('path', { d: pD([P(0, y, 0), P(a, y, 0), P(a, y, d), P(0, y, d)], true), fill: '#a9d0f3', 'fill-opacity': 0.8, stroke: '#4d7fb5', 'stroke-width': 1 }, water); };
    wh(0);
    face([P(0, 0, 0), P(a, 0, 0), P(a, b, 0), P(0, b, 0)], '#dbe9f9', 0.25); face([P(a, 0, 0), P(a, 0, d), P(a, b, d), P(a, b, 0)], '#dbe9f9', 0.25);
    sline(L, P(0, b, 0), P(0, b, d), { w: 2 }); sline(L, P(0, b, d), P(a, b, d), { w: 2 }); sline(L, P(0, 0, d), P(0, b, d), { dash: '6 5', w: 1.6 }); sline(L, P(0, 0, d), P(a, 0, d), { dash: '6 5', w: 1.6 }); sline(L, P(0, 0, 0), P(0, 0, d), { dash: '6 5', w: 1.6 });
    lab(B, (P(0, 0, 0)[0] + P(a, 0, 0)[0]) / 2, yb + 4, T('55\\text{ cm}'), 's'); lab(B, P(a, 0, d / 2)[0] + 4, P(a, 0, d / 2)[1] + 4, T('40\\text{ cm}'), 'se'); lab(B, x0 - 4, yb - b / 2, T('25\\text{ cm}'), 'w', 'u10l9-flab u10l9-tight');
    const jy = 300, jw = 76, jugs = [];
    for (let i = 0; i < 6; i++) {
      const full = i < 5, g = svgEl('g', {}, L), x = 30 + i * (jw + 14);
      svgEl('rect', { x, y: jy, width: jw, height: 60, rx: 8, fill: 'none', stroke: INK, 'stroke-width': 1.8 }, g);
      svgEl('rect', { x: x + 2, y: jy + 2, width: full ? jw - 4 : (jw - 4) / 2, height: 56, rx: 6, fill: '#a9d0f3' }, g);
      const nd = full ? 4 : 2; for (let q = 0; q < nd; q++) svgEl('path', { d: `M${x + 12 + q * 16} ${jy + 76} q-6 9 0 13 q6 -4 0 -13Z`, fill: TEAL, stroke: 'none' }, g);
      const tl = svgEl('text', { x: x + jw / 2, y: jy + 36, 'text-anchor': 'middle', class: 'u10l9-mnum' }, g); tl.textContent = full ? '10 L' : '5 L';
      hide(g); jugs.push(g);
    }
    return [
      { cap: `Volume first, in cm³: ${T('55\\times40\\times25=55\\,000\\ \\text{cm}^3')}.`, run: async (c) => { await tween(c, 1000, (t) => wh(t)); await say(c, p, `${T('55\\times40\\times25')}<br>${T('=55\\,000\\ \\text{cm}^3')}`); } },
      { cap: `${T('1\\ \\text{cm}^3=1\\text{ mL}')}, so ${T('55\\,000\\text{ mL}=55\\text{ L}')} (${T('\\div1000')}).`, run: (c) => say(c, p, `${T('=55\\,000\\text{ mL}=55\\text{ L}')}`) },
      { cap: `The dose is per <b>10 L</b>: 55 L is ${T('55\\div10=5.5')} doses of 4 drops.`, run: async (c) => { for (const g of jugs) await appear(c, g, 160); await say(c, p, `${T('55\\div10=5.5')} doses`); } },
      { cap: `${T('5.5\\times4=22')} drops.`, run: (c) => say(c, p, `${T('5.5\\times4=\\mathbf{22}')} drops`, 'u10l9-good u10l9-big') }
    ];
  }
};

/* =============================== explainer: wrench (Section 6) =============================== */
const IMP = [[1, 4], [9, 32], [3, 8], [7, 16], [1, 2], [5, 8]], MET = [7, 8, 9, 11, 13, 16];
const wrench = {
  title: 'One length line, two scales',
  height: 380,
  choices: [{ v: 'line', label: 'One line, two scales' }, { v: 'e6a', label: 'Example 6(a) check' }, { v: 'e6b', label: 'Example 6(b) check' }],
  intro: (v) => (v === 'line' ? 'Millimetres on top, inches below, lined up. Press <b>Next</b>.' : 'Place the bolt between the two wrenches, then look at the other scale. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, lo = 5.5, hi = 17;
    const NMM = new NumberLine(stage, { x: 10, y: 54, width: W - 20, height: 90, min: lo, max: hi, step: 1, arrows: false, axisY: 30 });
    const NIN = new NumberLine(stage, { x: 10, y: 214, width: W - 20, height: 110, min: lo / 25.4, max: hi / 25.4, step: 1 / 16, minor: 1 / 32, arrows: false, axisY: 30,
      labels: IMP.map(([n, d]) => ({ v: n / d, html: T(`\\frac{${n}}{${d}}`) })) });
    NIN.el.classList.add('u10l9-inl');
    slab(stage, 40, 84, '<b>mm</b>', 'w', 'u10l9-amb'); slab(stage, 40, 244, '<b>in</b>', 'w', 'u10l9-blue');
    const B = fbox(stage, W, 380, 0, 0); B.el.style.pointerEvents = 'none'; const L = B.L;
    const xOf = (mm) => 10 + NMM.toPx(mm);
    const band = (a, b, col) => { const r = svgEl('rect', { x: xOf(a), y: 70, width: xOf(b) - xOf(a), height: 190, fill: col, 'fill-opacity': 0.14, stroke: col, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, L); hide(r); return r; };
    const mpts = MET.map((m) => { const pt = NMM.point(m, { color: AMB, r: 8 }); hide(pt); return pt; });
    const ipts = IMP.map(([n, d]) => { const pt = NIN.point(n / d, { color: BLUE, r: 8 }); hide(pt); return pt; });
    const ann = add(stage, h('div', 'u10l9-ansbox', ''), 20, 326); hide(ann);
    const conn = (mm, col = GRAY) => { const l = sline(L, [xOf(mm), 84], [xOf(mm), 244], { dash: '4 4', w: 1.6, color: col }); hide(l); return l; };
    if (v === 'line') {
      const cs = IMP.map(([n, d]) => conn(25.4 * n / d, BLUE));
      return [
        { cap: 'The same lengths on two scales: millimetres on top, inches below, lined up using <b>1 in = 25.4 mm</b>.', run: async (c) => { for (const p2 of mpts) await pop(c, p2, 160); for (const p2 of ipts) await pop(c, p2, 160); } },
        { cap: `Each inch size sits at its millimetre length: ${T('\\tfrac14\\text{ in}=6.35')} mm, ${T('\\tfrac38\\text{ in}=9.525')} mm, ${T('\\tfrac12\\text{ in}=12.7')} mm, ${T('\\tfrac58\\text{ in}=15.875')} mm.`, run: async (c) => { for (const l of cs) await appear(c, l, 150); } },
        { cap: 'Now any wrench can be compared with any other: just look straight up or down.', run: async (c) => { ann.innerHTML = `${T('1\\text{ mm}=0.03937\\text{ in}')} &nbsp;·&nbsp; ${T('1\\text{ in}=25.4\\text{ mm}')}`; await fadeIn(c, ann); } }
      ];
    }
    if (v === 'e6a') {
      const bd = band(9, 11, GRN), fits = 2;
      return [
        { cap: 'Example 6(a): the 9 mm wrench is too small and the 11 mm is too large, so the bolt is <b>between 9 and 11 mm</b>.', run: async (c) => { for (const i of [2, 3]) await pop(c, mpts[i], 200); await appear(c, bd, 400); } },
        { cap: `On the inch scale: ${T('9\\times0.03937\\approx0.354')} in and ${T('11\\times0.03937\\approx0.433')} in.`, run: async (c) => { ann.innerHTML = `bolt: between ${T('0.354')} in and ${T('0.433')} in`; await fadeIn(c, ann); } },
        { cap: `The imperial wrenches: ${T('\\tfrac14=0.250')}, ${T('\\tfrac{9}{32}=0.281')}, ${T('\\tfrac38=0.375')}, ${T('\\tfrac{7}{16}=0.438')} (just too large). Only ${T('\\tfrac38')} is inside.`,
          run: async (c) => { for (let i = 0; i < 4; i++) { const pt = ipts[i]; pt.querySelector('circle').setAttribute('fill', i === fits ? GRN : i === 3 ? RED : GRAY); await pop(c, pt, 200); } } },
        { cap: `Zara should try the ${T('\\tfrac38')} <b>in</b> wrench.`, run: (c) => stampIn(c, stamp(stage, '3/8 in', { ok: true, x: xOf(9.525) + 70, y: 300, size: 'sm', rotate: -5 })) }
      ];
    }
    const bd = band(12.7, 15.875, GRN);
    return [
      { cap: `Example 6(b): ${T('\\tfrac12')} in is too small and ${T('\\tfrac58')} in is too large: the bolt is between them.`, run: async (c) => { for (const i of [4, 5]) await pop(c, ipts[i], 200); await appear(c, bd, 400); } },
      { cap: `In millimetres: ${T('\\tfrac12\\times25.4=12.7')} mm and ${T('\\tfrac58\\times25.4=15.875')} mm.`, run: async (c) => { ann.innerHTML = `bolt: between ${T('12.7')} mm and ${T('15.875')} mm`; await fadeIn(c, ann); } },
      { cap: 'The metric wrenches: 11 mm (too small), <b>13 mm (fits)</b>, 16 mm (too large).', run: async (c) => { [3, 4, 5].forEach((i) => mpts[i].querySelector('circle').setAttribute('fill', i === 4 ? GRN : i === 5 ? RED : GRAY)); for (const i of [3, 4, 5]) await pop(c, mpts[i], 200); } },
      { cap: 'Zara should try the <b>13 mm</b> wrench.', run: (c) => stampIn(c, stamp(stage, '13 mm', { ok: true, x: xOf(13) + 70, y: 40, size: 'sm', rotate: -5 })) }
    ];
  }
};

/* =============================== explainer: morph (★ Section 7) =============================== */
const SHAPES = {
  prism: { name: 'Prism', V: 'V=A_{\\text{Base}}\\times h', SA: 'SA=2A_{\\text{Base}}+(\\text{perimeter})h', st: { b: 0, wf: 1, wp: 0, ws: 0, wh: 0, Hk: 1 } },
  cyl: { name: 'Cylinder', V: 'V=\\pi r^2h', SA: 'SA=2\\pi r^2+2\\pi rh', st: { b: 1, wf: 1, wp: 0, ws: 0, wh: 0, Hk: 1 } },
  cone: { name: 'Cone', V: 'V=\\tfrac13\\pi r^2h', SA: 'SA=\\pi r^2+\\pi rs', st: { b: 1, wf: 0, wp: 1, ws: 0, wh: 0, Hk: 1 } },
  pyr: { name: 'Pyramid', V: 'V=\\tfrac13A_{\\text{Base}}h', SA: 'SA=A_{\\text{Base}}+\\text{triangles}\\ \\left(\\tfrac12bs\\right)', st: { b: 0, wf: 0, wp: 1, ws: 0, wh: 0, Hk: 1 } },
  sph: { name: 'Sphere', V: 'V=\\tfrac43\\pi r^3', SA: 'SA=4\\pi r^2', st: { b: 1, wf: 0, wp: 0, ws: 1, wh: 0, Hk: 0 } },
  hemi: { name: 'Hemisphere', V: 'V=\\tfrac23\\pi r^3', SA: 'SA=3\\pi r^2\\ \\text{(with base)}', st: { b: 1, wf: 0, wp: 0, ws: 0, wh: 1, Hk: -1 } }
};
const morph = {
  title: '★ One solid, five shapes',
  height: 450,
  choices: [{ v: 'tour', label: 'Tour all five (and a half)' }, { v: 'third', label: 'Pointed = one third' }, { v: 'arch', label: 'Sphere in a cylinder' }],
  intro: (v) => (v === 'tour' ? 'Watch one solid change shape and its formula change with it. Press <b>Next</b>.' : v === 'third' ? 'The same base and height, with and without a point. Press <b>Next</b>.' : 'A sphere packed exactly into a cylinder. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, SW = 470, R = 138, H0 = 272, B = fbox(stage, SW, 450, 0, 0), ghostL = B.layer('gh'), solidL = B.layer('so'), dimL = B.layer('dim');
    B.svg.insertBefore(ghostL, B.L); B.svg.insertBefore(solidL, B.L);
    const cx = SW / 2 - 10, cy = 404;
    const st = Object.assign({}, SHAPES[v === 'arch' ? 'sph' : 'prism'].st);
    const Hof = (s) => (s.Hk === 1 ? H0 : s.Hk === 0 ? 2 * R : s.Hk === -1 ? R : H0);
    let Hcur = Hof(st);
    const spec = (s, Hh) => ({ cx, cy, R, H: Hh, n: 4, rot: 0.45, ps: 1.05, b: s.b, wf: s.wf, wp: s.wp, ws: s.ws, wh: s.wh });
    const draw = () => drawSolid(solidL, spec(st, Hcur), { fill: '#d6efe9', color: INK });
    let G = draw();
    const toShape = (c, key, ms = 1200) => { const a = Object.assign({}, st), b = SHAPES[key].st, Ha = Hcur, Hb = Hof(b); return tween(c, ms, (t) => { ['b', 'wf', 'wp', 'ws', 'wh'].forEach((k) => (st[k] = lerp(a[k], b[k], t))); Hcur = lerp(Ha, Hb, t); G = draw(); }); };
    const ghost = (key) => { const s = SHAPES[key].st; return drawSolid(ghostL, spec(s, Hof(s)), { ghost: true, color: GRAY, width: 2.2 }); };
    // formula panel
    const p = add(stage, box(h('div', 'u10l9-fpanel'), W - SW - 16, 420), SW + 6, 14);
    const nm = h('div', 'u10l9-fname'), fv = h('div', 'u10l9-fv'), fs = h('div', 'u10l9-fs'), note = h('div', 'u10l9-fnote'); p.append(nm, fv, fs, note);
    const show = (key) => { const S = SHAPES[key]; nm.textContent = S.name; fv.innerHTML = T(S.V); fs.innerHTML = T(S.SA); };
    const swap = async (c, key, txt) => { await tween(c, 200, (t) => (p.style.opacity = 1 - t * 0.85)); show(key); note.innerHTML = txt || ''; await tween(c, 220, (t) => (p.style.opacity = 0.15 + t * 0.85)); };
    const dims = (kind) => {
      dimL.innerHTML = ''; B.html.querySelectorAll('.u10l9-dlab').forEach((e) => e.remove());
      const top = [cx, cy - Hcur * COSE];
      const dl = (x, y, html, pos) => lab(B, x, y, html, pos, 'u10l9-flab u10l9-dlab');
      if (kind === 'h') { sline(dimL, [cx, cy], top, { dash: '7 6', w: 2, color: BLUE }); dl(cx + 6, (cy + top[1]) / 2, T('h'), 'e'); }
      if (kind === 'r' || kind === 'rh') { sline(dimL, [cx, cy], [cx + R, cy], { w: 2.4, color: RED }); svgEl('circle', { cx, cy, r: 3.5, fill: INK }, dimL); dl(cx + R / 2, cy + 4, T('r'), 's'); }
      if (kind === 'rh') { sline(dimL, [cx, cy], top, { dash: '7 6', w: 2, color: BLUE }); dl(cx + 6, (cy + top[1]) / 2, T('h'), 'e'); }
      if (kind === 's') { sline(dimL, [cx, cy], top, { dash: '7 6', w: 2, color: BLUE }); dl(cx - 6, (cy + top[1]) / 2, T('h'), 'w'); sline(dimL, [cx + R, cy], top, { w: 3.2, color: PUR }); dl(cx + R / 2 + 10, (cy + top[1]) / 2, T('s'), 'e'); sline(dimL, [cx, cy], [cx + R, cy], { w: 2.4, color: RED }); dl(cx + R / 2, cy + 4, T('r'), 's'); }
      if (kind === 'sr') { const ctr = [cx, cy - R * COSE]; sline(dimL, ctr, [cx + R, ctr[1]], { w: 2.4, color: RED }); svgEl('circle', { cx: ctr[0], cy: ctr[1], r: 3.5, fill: INK }, dimL); dl(cx + R / 2, ctr[1] - 4, T('r'), 'n'); }
      if (kind === 'hr') { sline(dimL, [cx, cy], [cx + R, cy], { w: 2.4, color: RED }); svgEl('circle', { cx, cy, r: 3.5, fill: INK }, dimL); dl(cx + R / 2, cy - 4, T('r'), 'n'); }
    };
    const baseHi = async (c) => { const bp = G.TH.map((t) => G.P(t, 0)); const e = svgEl('path', { d: pD(bp, true), fill: AMB, 'fill-opacity': 0.35, stroke: AMB, 'stroke-width': 3 }, dimL); await pulse(c, e, 1.02); };
    if (v === 'tour') {
      show('prism'); note.innerHTML = 'the base slides straight up';
      return [
        { cap: `A <b>prism</b>: the base slides straight up. ${T('V=A_{\\text{Base}}\\times h')}: base area times height.`, run: async (c) => { dims('h'); await baseHi(c); } },
        { cap: `Round the base: a <b>cylinder</b>. Still base × height, now with ${T('A_{\\text{Base}}=\\pi r^2')}: ${T('V=\\pi r^2h')}.`, run: async (c) => { dims(''); await toShape(c, 'cyl'); dims('rh'); await swap(c, 'cyl', `${T('A_{\\text{Base}}=\\pi r^2')}: two circles and a rectangle`); } },
        { cap: `Pull the top to a point: a <b>cone</b>, one third of its cylinder: ${T('V=\\tfrac13\\pi r^2h')}. Surface area needs the slant height ${T('s')}.`, run: async (c) => { dims(''); await toShape(c, 'cone'); dims('s'); await swap(c, 'cone', `${T('s^2=h^2+r^2')}: slant for SA, ${T('h')} for V`); } },
        { cap: `Square the base again: a <b>pyramid</b>, one third of its prism: ${T('V=\\tfrac13A_{\\text{Base}}h')}.`, run: async (c) => { dims(''); await toShape(c, 'pyr'); dims('h'); await swap(c, 'pyr', 'each triangle: ½ × base edge × slant'); } },
        { cap: `Round it all: a <b>sphere</b>. Only the radius matters: ${T('V=\\tfrac43\\pi r^3')}, ${T('SA=4\\pi r^2')}.`, run: async (c) => { dims(''); await toShape(c, 'sph', 1500); dims('sr'); await swap(c, 'sph', 'halve a diameter first'); } },
        { cap: `Cut it in half: a <b>hemisphere</b>. ${T('V=\\tfrac23\\pi r^3')}; ${T('SA=3\\pi r^2')} with its flat base, ${T('2\\pi r^2')} without.`, run: async (c) => { dims(''); await toShape(c, 'hemi'); dims('hr'); await swap(c, 'hemi', `curved ${T('2\\pi r^2')} + flat ${T('\\pi r^2')}`); } }
      ];
    }
    if (v === 'third') {
      show('prism'); note.innerHTML = '';
      return [
        { cap: 'A prism, and the pyramid on the <b>same base</b> with the <b>same height</b>.', run: async (c) => { ghost('prism'); dims(''); await toShape(c, 'pyr'); dims('h'); await swap(c, 'pyr', `${T('\\tfrac13')} of the prism`); } },
        { cap: `The pyramid holds exactly <b>one third</b>: ${T('V=\\tfrac13A_{\\text{Base}}h')} (three of them fill the prism).`, run: async (c) => { await pulse(c, p, 1.03); } },
        { cap: `Round both bases: the cone is one third of its cylinder, ${T('V=\\tfrac13\\pi r^2h')}.`, run: async (c) => { dims(''); const a = Object.assign({}, st); await tween(c, 1200, (t) => { st.b = lerp(a.b, 1, t); G = draw(); drawSolid(ghostL, spec(Object.assign({}, SHAPES.prism.st, { b: st.b }), H0), { ghost: true, color: GRAY, width: 2.2 }); }); dims('rh'); await swap(c, 'cone', `${T('\\tfrac13')} of the cylinder`); } },
        { cap: `Volume uses the <b>perpendicular</b> height ${T('h')}, never the slant ${T('s')}: the slant is longer, so it would overcount.`, run: async (c) => { dims('s'); note.innerHTML = `V: ${T('h')} ✓ &nbsp; SA: ${T('s')} ✓`; await pulse(c, note, 1.05); } }
      ];
    }
    // arch
    show('sph'); note.innerHTML = '';
    return [
      { cap: `The sphere fits exactly inside a cylinder with the same radius and height ${T('2r')}.`, run: async (c) => { drawSolid(ghostL, { cx, cy, R, H: 2 * R, b: 1, wf: 1 }, { ghost: true, color: GRAY, width: 2.2 }); dims('sr'); await sleep(c, 200); } },
      { cap: `The cylinder holds ${T('\\pi r^2(2r)=2\\pi r^3')}. The sphere fills <b>two thirds</b> of it: ${T('\\tfrac23\\times2\\pi r^3=\\tfrac43\\pi r^3')}.`, run: async (c) => { note.innerHTML = `${T('\\tfrac23\\times2\\pi r^3=\\tfrac43\\pi r^3')}`; await pulse(c, note, 1.05); } },
      { cap: `Its surface area matches the cylinder’s curved side: ${T('2\\pi r(2r)=4\\pi r^2')}.`, run: async (c) => { note.innerHTML += `<br>${T('2\\pi r(2r)=4\\pi r^2')}`; const s = svgEl('rect', { x: cx - R, y: cy - 2 * R * COSE, width: 2 * R, height: 2 * R * COSE, fill: AMB, 'fill-opacity': 0.12 }, ghostL); await appear(c, s, 400); } },
      { cap: `Half the sphere is a <b>hemisphere</b>: ${T('V=\\tfrac23\\pi r^3')}.`, run: async (c) => { ghostL.innerHTML = ''; dims(''); await toShape(c, 'hemi'); dims('hr'); await swap(c, 'hemi', `half of ${T('\\tfrac43\\pi r^3')}`); } }
    ];
  }
};

/* =============================== explainer: coneSphere (Example 7) =============================== */
const coneSphere = {
  title: 'Slant height first; radius first',
  height: 420,
  choices: [{ v: 'cone', label: 'Example 7(a) check: cone' }, { v: 'sph', label: 'Example 7(b) check: sphere' }],
  intro: (v) => (v === 'cone' ? 'r = 8 cm, h = 15 cm. Where is s? Press <b>Next</b>.' : 'd = 18 in. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, B = fbox(stage, W, 420, 0, 0), L = B.L, L2 = B.layer('x');
    const res = add(stage, h('div', 'u10l9-ansbox', ''), W - 380, 360); hide(res);
    if (v === 'cone') {
      const k = 14, R = 8 * k, Hh = 15 * k, cx = 160, cy = 340, G = drawSolid(L, { cx, cy, R, H: Hh, wp: 1 }), apex = G.axisTop;
      svgEl('circle', { cx, cy, r: 3, fill: INK }, L);
      const tri = svgEl('path', { d: pD([[cx, cy], [cx + R, cy], apex], true), fill: PUR, 'fill-opacity': 0.14, stroke: 'none' }, L2); hide(tri);
      const hL = sline(L2, [cx, cy], apex, { dash: '7 6', w: 2.4, color: BLUE }), rL = sline(L2, [cx, cy], [cx + R, cy], { w: 3, color: RED }), sL = sline(L2, [cx + R, cy], apex, { w: 4, color: PUR });
      const rm = rightMark(L2, [cx, cy], [cx + R, cy], apex, 12, { color: INK, width: 1.6 });
      const lh = lab(B, cx - 6, (cy + apex[1]) / 2, T('h=15'), 'w', 'u10l9-flab u10l9-blue'), lr = lab(B, cx + R / 2, cy + 6, T('r=8'), 's', 'u10l9-flab u10l9-red'), ls = lab(B, cx + R / 2 + 12, (cy + apex[1]) / 2, T('s=\\,?'), 'e', 'u10l9-flab u10l9-pur');
      [tri, hL, rL, sL, rm, lh, lr, ls].forEach(hide);
      const p = panel(stage, 330, 14, W - 340, 150);
      const nx = 330, nc = [nx + 70, 270], nr = 8 * 6.5, sR = 17 * 6.5, sc0 = [nx + 330, 210], ang = 2 * Math.PI * 8 / 17;
      const net = svgEl('g', {}, L); hide(net);
      svgEl('circle', { cx: nc[0], cy: nc[1], r: nr, fill: AMB, 'fill-opacity': 0.25, stroke: INK, 'stroke-width': 2.2 }, net);
      const a0 = Math.PI / 2 - ang / 2, a1 = Math.PI / 2 + ang / 2, P1 = [sc0[0] + sR * Math.cos(a0), sc0[1] + sR * Math.sin(a0)], P2 = [sc0[0] + sR * Math.cos(a1), sc0[1] + sR * Math.sin(a1)];
      svgEl('path', { d: `M${sc0[0]} ${sc0[1]}L${P1[0]} ${P1[1]}A${sR} ${sR} 0 0 1 ${P2[0]} ${P2[1]}Z`, fill: PUR, 'fill-opacity': 0.18, stroke: INK, 'stroke-width': 2.2 }, net);
      sline(net, sc0, P1, { w: 3, color: PUR });
      const n1 = hide(lab(B, nc[0], nc[1], T('\\pi r^2=64\\pi'), 'c', 'u10l9-flab u10l9-wbg')), n2 = hide(lab(B, sc0[0], sc0[1] + sR * 0.62, T('\\pi rs=136\\pi'), 'c', 'u10l9-flab u10l9-wbg')), n3 = hide(lab(B, (sc0[0] + P1[0]) / 2 + 8, (sc0[1] + P1[1]) / 2, T('s=17'), 'e', 'u10l9-flab u10l9-pur'));
      return [
        { cap: `Slice the cone through its apex. The cross-section holds a <b>right triangle</b>: legs ${T('h=15')} and ${T('r=8')}, and the slant height ${T('s')} is the hypotenuse.`, run: async (c) => { await appear(c, tri, 300); for (const e of [hL, rL]) await appear(c, e, 250); await appear(c, sL, 300); await appear(c, rm, 200); for (const e of [lh, lr, ls]) await fadeIn(c, e, 200); } },
        { cap: `${T('s^2=h^2+r^2=15^2+8^2=225+64=289')}, so ${T('s=17')} cm (an 8–15–17 triangle).`, run: async (c) => { ls.innerHTML = T('s=17'); await pulse(c, ls, 1.15); await say(c, p, `${T('s^2=15^2+8^2=289')}`); await say(c, p, `${T('s=\\sqrt{289}=17\\text{ cm}')}`); } },
        { cap: `Unroll the surface: a circular base, ${T('\\pi r^2=\\pi(8)^2=64\\pi')}, and a curved part, ${T('\\pi rs=\\pi(8)(17)=136\\pi')}.`, run: async (c) => { await appear(c, net, 500); for (const e of [n1, n2, n3]) await fadeIn(c, e, 220); } },
        { cap: `${T('SA=64\\pi+136\\pi=200\\pi\\ \\text{cm}^2')}, left in terms of ${T('\\pi')} as asked.`, run: async (c) => { res.innerHTML = T('SA=64\\pi+136\\pi=\\mathbf{200\\pi\\ cm^2}'); res.classList.add('u10l9-good'); await fadeIn(c, res); } }
      ];
    }
    const R = 100, cx = 170, cy = 300, G = drawSolid(L, { cx, cy, R, H: 2 * R, ws: 1 }), ctr = [cx, cy - R * COSE];
    const dA = dimArrow(L2, [cx - R, ctr[1]], [cx + R, ctr[1]], { color: BLUE, w: 2.4 }), dl = lab(B, cx, ctr[1] - 4, T('d=18'), 'n', 'u10l9-flab u10l9-blue u10l9-wbg');
    const rL = sline(L2, ctr, [cx + R, ctr[1]], { w: 3.4, color: RED }); hide(rL);
    const rl = hide(lab(B, cx + R / 2, ctr[1] + 6, T('r=9'), 's', 'u10l9-flab u10l9-red u10l9-wbg'));
    const p = panel(stage, 330, 14, W - 340, 120);
    const discs = []; for (let i = 0; i < 4; i++) { const g = svgEl('g', {}, L); svgEl('circle', { cx: 400 + i * 135, cy: 230, r: 58, fill: TEAL, 'fill-opacity': 0.2, stroke: INK, 'stroke-width': 2 }, g); hide(g); discs.push([g, hide(lab(B, 400 + i * 135, 230, T('\\pi r^2'), 'c', 'u10l9-flab'))]); }
    return [
      { cap: `The formulas use the <b>radius</b>: halve the diameter first, ${T('r=18\\div2=9')} in.`, run: async (c) => { await tween(c, 500, (t) => (dA.style.opacity = 1 - 0.7 * t)); dl.style.opacity = 0.35; await appear(c, rL, 300); await fadeIn(c, rl); } },
      { cap: `A sphere’s surface is exactly <b>four great circles</b>, each ${T('\\pi r^2')}: ${T('SA=4\\pi r^2')}.`, run: async (c) => { for (const [g, l] of discs) { await appear(c, g, 220); await fadeIn(c, l, 150); } } },
      { cap: `${T('SA=4\\pi(9)^2=4\\pi(81)=324\\pi=1017.876\\ldots\\approx1018\\ \\text{in}^2')}.`, run: async (c) => { await say(c, p, `${T('SA=4\\pi(9)^2=324\\pi')}`); res.innerHTML = T('324\\pi=1017.876\\ldots\\approx\\mathbf{1018\\ in^2}'); res.classList.add('u10l9-good'); await fadeIn(c, res); } },
      { cap: `<b>Watch out:</b> 18 used as the radius gives ${T('4\\pi(18)^2=1296\\pi')}: four times too much.`, run: (c) => say(c, p, `${T('4\\pi(18)^2=1296\\pi')} ✗ (×4)`, 'u10l9-bad') }
    ];
  }
};

/* =============================== explainer: backwards (Example 8) =============================== */
const backwards = {
  title: 'A radical base; a formula run backwards',
  height: 420,
  choices: [{ v: 'e8a', label: 'Example 8(a) check' }, { v: 'e8b', label: 'Example 8(b) check: undo the formula' }],
  intro: (v) => (v === 'e8a' ? 'An equilateral base, side 8 m, height 15 m. Press <b>Next</b>.' : 'V = 1526.8 m³. Find r. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, B = fbox(stage, W, 420, 0, 0), L = B.L;
    const res = add(stage, h('div', 'u10l9-ansbox', ''), 20, 362); hide(res);
    if (v === 'e8a') {
      const k = 30, s = 8 * k, A = [40, 300], Bv = [40 + s, 300], C = [40 + s / 2, 300 - s * Math.sqrt(3) / 2], M = [40 + s / 2, 300];
      svgEl('path', { d: pD([A, Bv, C], true), fill: AMB, 'fill-opacity': 0.2, stroke: INK, 'stroke-width': 2.6 }, L);
      lab(B, (A[0] + Bv[0]) / 2, 304, T('8'), 's'); lab(B, (A[0] + C[0]) / 2 - 4, (A[1] + C[1]) / 2, T('8'), 'w'); lab(B, (Bv[0] + C[0]) / 2 + 4, (Bv[1] + C[1]) / 2, T('8'), 'e');
      const alt = svgEl('g', {}, L); sline(alt, C, M, { dash: '7 6', w: 2.4, color: BLUE }); rightMark(alt, M, Bv, C, 12, { color: INK, width: 1.6 }); hide(alt);
      const half = hide(lab(B, (M[0] + Bv[0]) / 2, 304, T('4'), 's', 'u10l9-flab u10l9-red')), hl = hide(lab(B, M[0] + 6, (M[1] + C[1]) / 2, T('4\\sqrt3'), 'e', 'u10l9-flab u10l9-blue u10l9-wbg'));
      const PB = fbox(stage, 280, 340, W - 300, 10), G = drawSolid(PB.L, { cx: 130, cy: 300, R: 100, H: 230, n: 3, rot: -1.75, wp: 1 }); hide(PB.el);
      sline(PB.L, [130, 300], G.axisTop, { dash: '2 5', w: 2 }); lab(PB, 136, 190, T('15'), 'e', 'u10l9-flab u10l9-wbg');
      const p = panel(stage, 330, 14, W - 650, 330);
      return [
        { cap: `The base is an equilateral triangle, side 8 m. Its height splits it into two right triangles: hypotenuse 8, base 4.`, run: async (c) => { await appear(c, alt, 300); await fadeIn(c, half); } },
        { cap: `Height ${T('=\\sqrt{8^2-4^2}=\\sqrt{48}=4\\sqrt3')}. Area ${T('=\\tfrac12(8)(4\\sqrt3)=16\\sqrt3\\ \\text{m}^2')}, the same as ${T('\\tfrac{\\sqrt3}{4}(8)^2')}.`, run: async (c) => { await fadeIn(c, hl); await say(c, p, `${T('A_{\\text{Base}}=\\tfrac{\\sqrt3}{4}(8)^2')}`); await say(c, p, `${T('=16\\sqrt3\\ \\text{m}^2')}`); } },
        { cap: `${T('V=\\tfrac13A_{\\text{Base}}h=\\tfrac13(16\\sqrt3)(15)=80\\sqrt3\\ \\text{m}^3')}, exact.`, run: async (c) => { await appear(c, PB.el, 400); await say(c, p, `${T('V=\\tfrac13(16\\sqrt3)(15)')}`); await say(c, p, `${T('=80\\sqrt3\\ \\text{m}^3')}`, 'u10l9-good'); } },
        { cap: `To one decimal place: ${T('80\\sqrt3=138.564\\ldots\\approx138.6\\ \\text{m}^3')}.`, run: async (c) => { res.innerHTML = T('80\\sqrt3=138.564\\ldots\\approx\\mathbf{138.6\\ m^3}'); res.classList.add('u10l9-good'); await fadeIn(c, res); } }
      ];
    }
    const bw = 150, gap = (W - 40 - 4 * bw) / 3, xs = [0, 1, 2, 3].map((i) => 20 + i * (bw + gap));
    const fw = ['r', 'r^3', '2\\pi r^3', '\\tfrac23\\pi r^3=V'], bwv = ['8.99997\\ldots', '728.99\\ldots', '4580.4', '1526.8'];
    const fb = fw.map((t, i) => add(stage, box(h('div', 'u10l9-opbox', T(t)), bw, 54), xs[i], 40));
    const bb = bwv.map((t, i) => hide(add(stage, box(h('div', 'u10l9-opbox u10l9-back', T(t)), bw, 54), xs[i], 230)));
    const opsF = ['\\text{cube}', '\\times2\\pi', '\\div3'], opsB = ['\\sqrt[3]{\\ }', '\\div2\\pi', '\\times3'];
    const arrF = [], arrB = [];
    for (let i = 0; i < 3; i++) {
      const x1 = xs[i] + bw + 6, x2 = xs[i + 1] - 6, gF = svgEl('g', {}, L), gB = svgEl('g', {}, L);
      sline(gF, [x1, 67], [x2 - 4, 67], { w: 2.4, color: TEAL }); arrowHead(gF, x2, 67, 1, 0, { color: TEAL, width: 2.4 });
      sline(gB, [x2, 257], [x1 + 4, 257], { w: 2.4, color: PUR }); arrowHead(gB, x1, 257, -1, 0, { color: PUR, width: 2.4 });
      arrF.push([gF, lab(B, (x1 + x2) / 2, 60, T(opsF[i]), 'n', 'u10l9-flab u10l9-teal')]); arrB.push([gB, hide(lab(B, (x1 + x2) / 2, 266, T(opsB[i]), 's', 'u10l9-flab u10l9-pur'))]); hide(gB);
    }
    res.style.top = '318px';
    const hint = add(stage, h('div', 'u10l9-hint', 'forwards: the formula'), 20, 4), hint2 = hide(add(stage, h('div', 'u10l9-hint u10l9-pur', 'backwards: undo each step, last first'), 20, 186));
    return [
      { cap: `Forwards, ${T('V=\\tfrac23\\pi r^3')} does three things to ${T('r')}: <b>cube</b> it, <b>× 2π</b>, then <b>÷ 3</b>.`, run: async (c) => { for (const e of fb) await pop(c, e, 200); } },
      { cap: 'Backwards, undo each step in <b>reverse order</b> with the opposite operation: × 3, ÷ 2π, then the cube root.', run: async (c) => { await fadeIn(c, hint2); for (let i = 2; i >= 0; i--) { await appear(c, arrB[i][0], 200); await fadeIn(c, arrB[i][1], 150); } } },
      { cap: `Start from ${T('V=1526.8')}: ${T('3V=4580.4')}, then ${T('\\div2\\pi')}: ${T('r^3=\\dfrac{4580.4}{6.283185\\ldots}=728.99\\ldots')}`, run: async (c) => { for (const i of [3, 2, 1]) await pop(c, bb[i], 260); } },
      { cap: `Cube root: ${T('r=\\sqrt[3]{728.99\\ldots}=8.99997\\ldots\\approx9.0\\ \\text{m}')}.`, run: async (c) => { await pop(c, bb[0], 300); res.innerHTML = T('r=\\sqrt[3]{\\dfrac{3V}{2\\pi}}=8.99997\\ldots\\approx\\mathbf{9.0\\ m}'); res.classList.add('u10l9-good'); await fadeIn(c, res); } },
      { cap: `Check forwards: ${T('\\tfrac23\\pi(9)^3=486\\pi=1526.81\\ldots\\ \\text{m}^3')} ✓`, run: (c) => stampIn(c, stamp(stage, '✓ 1526.8', { ok: true, x: W - 120, y: 384, size: 'sm', rotate: -5 })) }
    ];
  }
};

/* =============================== explainer: tank (Example 9) =============================== */
const tank = {
  title: 'One tank, five trucks, two bids',
  height: 450,
  choices: [{ v: 'ab', label: 'Ex 9(a)(b) check' }, { v: 'c', label: 'Ex 9(c) check' }, { v: 'd', label: 'Ex 9(d) check' }],
  intro: (v) => (v === 'ab' ? 'The tank’s diameter is three times its 5.4 m height. Press <b>Next</b>.' : v === 'c' ? 'The same volume poured into a narrower cone. Press <b>Next</b>.' : 'Two bids: one in C$ per m³, one in US$ per ft³. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, B = fbox(stage, W, 430, 0, 0), L = B.L, k = 17;
    const Vexact = Math.PI * 8.1 * 8.1 * 5.4 / 3;
    if (v === 'ab') {
      const cx = 170, cy = 300, G = drawSolid(L, { cx, cy, R: 8.1 * k, H: 5.4 * k, wp: 1 }, { fill: '#cfe9d9' }), apex = G.axisTop;
      sline(L, [cx, cy], apex, { dash: '7 6', w: 2 }); sline(L, [cx - 8.1 * k, cy], [cx + 8.1 * k, cy], { w: 2 });
      const hl = lab(B, cx + 6, (cy + apex[1]) / 2, T('h=5.4'), 'e', 'u10l9-flab u10l9-wbg'), dl = lab(B, cx, cy + 8.1 * k * SINE + 4, T('d=\\,?'), 's');
      const p = panel(stage, 20, 14, 320, 130);
      const tx = 380, trucks = [];
      for (let i = 0; i < 5; i++) {
        const y = 60 + i * 72, g = svgEl('g', {}, L), lev = svgEl('rect', { x: tx, y: y - 28, width: 0, height: 56, fill: '#8fd0a8' }, g);
        drawLogCyl(g, tx, y, 9 * k * 1.5, 1.8 * k * 0.9, { fill: 'none', endFill: 'none' });
        g.insertBefore(lev, g.firstChild); hide(g); trucks.push({ g, lev, y });
      }
      const len = 9 * k * 1.5, tl = hide(lab(B, tx + len + 40, 20, T('29.16\\pi\\ \\text{m}^3') + ' each', 'e', 'u10l9-flab'));
      const cnt = trucks.map((t, i) => hide(lab(B, tx + len + 40, t.y, i < 4 ? 'full' : '0.05 of a truck', 'e', 'u10l9-flab ' + (i < 4 ? 'u10l9-teal' : 'u10l9-amb'))));
      return [
        { cap: `The diameter is three times the height: ${T('d=3(5.4)=16.2')} m, so ${T('r=16.2\\div2=8.1')} m.`, run: async (c) => { dl.innerHTML = T('d=16.2\\text{ m}'); await pulse(c, dl, 1.15); await say(c, p, `${T('d=16.2,\\ r=8.1')}`); } },
        { cap: `${T('V=\\tfrac13\\pi(8.1)^2(5.4)=118.098\\pi=371.0158\\ldots\\approx371.0\\ \\text{m}^3')}. Keep ${T('118.098\\pi')} for later parts.`, run: (c) => say(c, p, `${T('V=118.098\\pi')}<br>${T('\\approx371.0\\ \\text{m}^3')}`, 'u10l9-good') },
        { cap: `One truck is a cylinder lying on its side: ${T('V=\\pi(1.8)^2(9)=29.16\\pi\\approx91.6\\ \\text{m}^3')}.`, run: async (c) => { for (const t of trucks) await appear(c, t.g, 150); await fadeIn(c, tl); } },
        { cap: `${T('\\dfrac{118.098\\pi}{29.16\\pi}=4.05')}: four full trucks and a little more (π cancels, so this is exact).`, run: async (c) => { for (let i = 0; i < 5; i++) { const t = trucks[i], wfull = len, w = i < 4 ? wfull : wfull * 0.05; t.lev.setAttribute('y', t.y - 1.8 * k * 0.9); t.lev.setAttribute('height', 2 * 1.8 * k * 0.9); await tween(c, i < 4 ? 400 : 250, (q) => t.lev.setAttribute('width', w * q)); await fadeIn(c, cnt[i], 120); } } },
        { cap: 'Four trucks would leave concentrate behind, so round <b>up</b>: <b>5 trucks</b>.', run: (c) => stampIn(c, stamp(stage, '5 trucks', { ok: true, x: 210, y: 392, size: 'sm', rotate: -5 })) }
      ];
    }
    if (v === 'c') {
      const cx = 260, cy = 372, sp = { cx, cy, R: 8.1 * k, H: 5.4 * k, wp: 1 };
      let G = drawSolid(L, sp, { fill: '#cfe9d9' });
      const dimL = B.layer('d');
      const dims = (r, hh, hl) => { dimL.innerHTML = ''; B.html.querySelectorAll('.u10l9-dlab').forEach((e) => e.remove()); const top = [cx, cy - hh * k * COSE]; sline(dimL, [cx, cy], top, { dash: '7 6', w: 2 }); sline(dimL, [cx - r * k, cy], [cx + r * k, cy], { w: 2 }); lab(B, cx + 6, (cy + top[1]) / 2, hl, 'e', 'u10l9-flab u10l9-wbg u10l9-dlab'); lab(B, cx, cy + r * k * SINE + 2, T(`d=${tN(2 * r)}\\text{ m}`), 's', 'u10l9-flab u10l9-dlab'); };
      dims(8.1, 5.4, T('h=5.4'));
      const p = panel(stage, W - 420, 14, 400, 300);
      return [
        { cap: `Same volume, ${T('118.098\\pi\\ \\text{m}^3')}, in a cone with ${T('d=12')} m: ${T('r=6')} m. A narrower base…`, run: async (c) => { await tween(c, 1400, (t) => { sp.R = lerp(8.1, 6, t) * k; sp.H = lerp(5.4, 9.8415, t) * k; G = drawSolid(L, sp, { fill: '#cfe9d9' }); }); dims(6, 9.8415, T('h=\\,?')); await say(c, p, `${T('r=12\\div2=6\\text{ m}')}`); } },
        { cap: `${T('\\tfrac13\\pi(6)^2h=118.098\\pi')}, so ${T('12\\pi h=118.098\\pi')}. Divide both sides by ${T('12\\pi')}.`, run: (c) => say(c, p, `${T('\\tfrac13\\pi(6)^2h=118.098\\pi')}<br>${T('12\\pi h=118.098\\pi')}`) },
        { cap: `${T('h=\\dfrac{118.098}{12}=9.8415\\approx9.8')} m. Narrower, so taller: it makes sense ✓`, run: async (c) => { dims(6, 9.8415, T('h=9.8\\text{ m}')); await say(c, p, `${T('h=\\dfrac{118.098}{12}=9.8415')}`); await say(c, p, `${T('h\\approx\\mathbf{9.8\\ m}')}`, 'u10l9-good u10l9-big'); } }
      ];
    }
    // bids
    const ft3 = Vexact / 0.3048 ** 3, pf = 150 * 5 + 4.8 * Vexact, nc = 110 * 5 + 0.12 * ft3, ncC = nc / 0.92;
    const bx = 60, bw = 520, mx = 2600, by = [250, 320];
    const bar = (i, col, label) => { const r = svgEl('rect', { x: bx + 170, y: by[i], width: 0, height: 44, rx: 6, fill: col }, L); const t = lab(B, bx + 160, by[i] + 22, label, 'w', 'u10l9-flab'); return { r, t }; };
    const b1 = bar(0, AMB, '<b>Prairie Freight</b>'), b2 = bar(1, TEAL, '<b>Northern Cargo</b>');
    const v1 = hide(lab(B, bx + 178, by[0] + 22, '', 'e', 'u10l9-flab u10l9-onbar')), v2 = hide(lab(B, bx + 178, by[1] + 22, '', 'e', 'u10l9-flab u10l9-onbar'));
    const grow = (c, b, val) => tween(c, 800, (t) => b.r.setAttribute('width', (bw * val / mx) * t));
    // unit cube 1 m = 3.2808 ft
    const cg = svgEl('g', {}, L), cxx = W - 250, cyy = 190, a = 150, d = 60; hide(cg);
    svgEl('path', { d: pD([[cxx, cyy], [cxx + a, cyy], [cxx + a + d, cyy - d * 0.6], [cxx + a + d, cyy - a - d * 0.6], [cxx + d, cyy - a - d * 0.6], [cxx, cyy - a]], true), fill: '#dff0ea', stroke: INK, 'stroke-width': 2.4 }, cg);
    sline(cg, [cxx, cyy - a], [cxx + a, cyy - a], { w: 2.4 }); sline(cg, [cxx + a, cyy - a], [cxx + a, cyy], { w: 2.4 }); sline(cg, [cxx + a, cyy - a], [cxx + a + d, cyy - a - d * 0.6], { w: 2.4 });
    const fu = a / 3.2808; for (let i = 1; i <= 3; i++) { sline(cg, [cxx + i * fu, cyy], [cxx + i * fu, cyy - a], { w: 1, color: TEAL }); sline(cg, [cxx, cyy - i * fu], [cxx + a, cyy - i * fu], { w: 1, color: TEAL }); }
    const cl1 = hide(lab(B, cxx + a / 2, cyy + 4, `1 m = ${T('3.2808')} ft`, 's', 'u10l9-flab u10l9-sm'));
    const p = panel(stage, 20, 14, W - 300, 210);
    return [
      { cap: `Prairie Freight is already in C$ per m³: ${T('150(5)+4.80(371.0158\\ldots)=750+1780.88=\\text{C\\$}2530.88')}.`, run: async (c) => { await say(c, p, `Prairie: ${T('150(5)+4.80(371.0158\\ldots)=\\text{C\\$}2530.88')}`); v1.innerHTML = 'C$2530.88'; await grow(c, b1, pf); await fadeIn(c, v1); } },
      { cap: `Northern Cargo charges per ft³. ${T('1\\text{ ft}=12(2.54)=30.48\\text{ cm}=0.3048\\text{ m}')}, so a 1 m edge is ${T('\\tfrac{1}{0.3048}=3.2808\\ldots')} ft and ${T('1\\text{ m}^3=3.2808\\ldots^3=35.3146\\ldots\\ \\text{ft}^3')}: <b>cube</b> the factor.`, run: async (c) => { await appear(c, cg, 400); await fadeIn(c, cl1); } },
      { cap: `Volume: ${T('371.0158\\ldots\\times35.3146\\ldots=13\\,102.2996\\ldots\\ \\text{ft}^3')}. Cost: ${T('110(5)+0.12(13\\,102.2996\\ldots)=\\text{US\\$}2122.28')}.`, run: (c) => say(c, p, `Northern: ${T('550+0.12(13\\,102.2996\\ldots)=\\text{US\\$}2122.2759\\ldots')}`) },
      { cap: `Compare in one currency. ${T('\\text{C\\$}1=\\text{US\\$}0.92')}, so divide by 0.92: ${T('2122.2759\\ldots\\div0.92\\approx\\text{C\\$}2306.82')}.`, run: async (c) => { await say(c, p, `${T('\\div0.92')}: ${T('\\text{C\\$}2306.82')}`); v2.innerHTML = 'C$2306.82'; await grow(c, b2, ncC); await fadeIn(c, v2); } },
      { cap: `${T('\\text{C\\$}2306.82<\\text{C\\$}2530.88')}: <b>Northern Cargo is cheaper</b>, by about C$224.05.`, run: (c) => stampIn(c, stamp(stage, 'Northern Cargo', { ok: true, x: bx + 170 + bw * ncC / mx + 120, y: by[1] + 22, size: 'sm', rotate: -4 })) }
    ];
  }
};

/* =============================== static mount =============================== */
function mountStatic() {
  const room = document.getElementById('u10l9-room'); if (room) roomFig(room);
  document.querySelectorAll('[data-u10l9-fig]').forEach((el) => { const f = FIGS[el.dataset.u10l9Fig]; if (f) f(el); });
  document.querySelectorAll('[data-u10l9-micro]').forEach((el) => { const [k, t] = el.dataset.u10l9Micro.split(',').map(Number); microStatic(el, k, t); });
  document.querySelectorAll('[data-u10l9-vernier]').forEach((el) => { const [w, f] = el.dataset.u10l9Vernier.split(',').map(Number); vernierMM(el, w, f); });
  document.querySelectorAll('[data-u10l9-vinch]').forEach((el) => { const [w, s, f] = el.dataset.u10l9Vinch.split(',').map(Number); vernierInch(el, w, s, f); });
}

/* =============================== mount =============================== */
mountStatic();
export const explainers = mountExplainers({ fill, whichWay, ladder, sizeUp, micro, ratioMap, applied, wrench, morph, coneSphere, backwards, tank });
export const _test = { geom, tN };
