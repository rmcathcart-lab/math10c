/* Math 10C · Unit 9 · Lesson 2 — Trig Ratios: Calculator Values and Angle Patterns.
 * Warm-up ladders (the 4-to-1 rule), static booklet figures (Examples 1, 2, 4, 5, the SOH CAH TOA triangle), the
 * "Try any angle" dial playground, and the explainers:
 *   calc (TI-30XIIS keystrokes → screen → four decimals → the side ratio the value names; Example 1(a) checks),
 *   rescale (shrink Example 1's triangle until the hypotenuse is 1: the legs ARE sin and cos),
 *   dial (the star: an angle dial opening 0° → 90° with the hypotenuse fixed, live bars for opp/hyp, adj/hyp and tan
 *     climbing off the chart; Example 2 ghost comparison; the complementary swap x ↔ 90° − x),
 *   compare (the 45° benchmark; Example 3 checks by comparing legs), extremes (Example 4(b): the rotating segment r
 *     flattens and stands up; exact values at 0° and 90°), pattern (Example 4(c): table → graph, sin and cos mirror
 *     images), tan90 (Extension, Example 4(d): opp ÷ a vanishing adj; the graph zooms out ×10 each time),
 *   cofn (Extension, Example 5: the side opposite x is adjacent to 90° − x).
 * Colours: opposite purple, adjacent amber, hypotenuse blue, reference-angle arc red, tangent green. */
import {
  h, tex, add, box, Graph, ValueTable, mountExplainers, pop, fadeIn, appear, sleep, tween, svgEl, liveCtx, pulse,
  drawIn, anim, arrowHead, rightMark, angleArc, stamp, stampIn, COLORS
} from '../blocks.js';

const T = (s) => tex(String(s));
const OPP = COLORS.purple, ADJ = COLORS.amber, HYP = COLORS.blue, ANG = COLORS.red, TAN = COLORS.green, INK = COLORS.ink;
const GRAY = '#b4b9c3';
const RAD = Math.PI / 180;
const sn = (a) => clean(Math.sin(a * RAD)), cs = (a) => clean(Math.cos(a * RAD)), tn = (a) => clean(Math.tan(a * RAD));
function clean(v) { return Math.abs(v) < 1e-12 ? 0 : Math.abs(v - Math.round(v)) < 1e-12 ? Math.round(v) : v; }
const f4 = (v) => v.toFixed(4), f2 = (v) => v.toFixed(2);
const thin = (s) => s.replace(/^(\d+)(\d{3})(\.|$)/, '$1\\,$2$3');           // 5729.58 → 5\,729.58 (TeX)
const thinTxt = (s) => s.replace(/^(\d+)(\d{3})(\.|$)/, '$1\u202f$2$3');      // plain text
/** what the TI-30XIIS screen shows (10 digits) */
const scr = (v) => { v = clean(v); const s = String(Number(v.toPrecision(10))); return /\./.test(s) ? s : s + '.'; };
const cO = (s) => `\\textcolor{${OPP}}{${s}}`, cA = (s) => `\\textcolor{${ADJ}}{${s}}`, cH = (s) => `\\textcolor{${HYP}}{${s}}`, cT = (s) => `\\textcolor{${TAN}}{${s}}`;
const bO = (s) => `<b style="color:${OPP}">${s}</b>`, bA = (s) => `<b style="color:${ADJ}">${s}</b>`, bH = (s) => `<b style="color:${HYP}">${s}</b>`, bT = (s) => `<b style="color:${TAN}">${s}</b>`;
const deg = (a) => `${a}^\\circ`;
const show = (c, el) => fadeIn(c, el, 320);
const hide0 = (el) => { el.style.opacity = 0; return el; };

/* ---------------- small drawing helpers ---------------- */
function lab(host, x, y, html, cls = '') { const d = h('div', 'u9l2-lab ' + cls, html); d.style.left = x + 'px'; d.style.top = y + 'px'; host.appendChild(d); return d; }
function mv(el, x, y) { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; }
function setHTML(el, s) { if (el._s !== s) { el._s = s; el.innerHTML = s; } }
function ln(parent, P, Q, o = {}) {
  return svgEl('line', { x1: P[0], y1: P[1], x2: Q[0], y2: Q[1], stroke: o.color || INK, 'stroke-width': o.width || 2.5, 'stroke-linecap': o.cap || 'round', 'stroke-dasharray': o.dash || null, opacity: o.opacity ?? null }, parent);
}
function setLn(el, P, Q) { el.setAttribute('x1', P[0]); el.setAttribute('y1', P[1]); el.setAttribute('x2', Q[0]); el.setAttribute('y2', Q[1]); }
function stageSvg(stage, W, H) { const s = svgEl('svg', { width: W, height: H }, stage); s.style.position = 'absolute'; s.style.left = '0'; s.style.top = '0'; s.style.overflow = 'visible'; return s; }
function panel(stage, x, y, w, hh, title) { const p = add(stage, box(h('div', 'u9l2-panel', title ? `<div class="u9l2-ph">${title}</div>` : ''), w, hh), x, y); return p; }
function pline(p, html, cls = '') { const d = h('div', 'u9l2-line ' + cls, html); p.appendChild(d); return d; }
/** a coloured tag ("opp", "adj", "hyp") */
function tag(host, x, y, text, color) { const d = h('div', 'u9l2-tag', text); d.style.background = color; d.style.left = x + 'px'; d.style.top = y + 'px'; host.appendChild(d); return d; }
const lerp = (P, Q, t) => [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t];
function arcPath(V, r, a0, a1) { // math angles (degrees, counter-clockwise, y up) at px vertex V
  const p = (a) => [V[0] + r * Math.cos(a * RAD), V[1] - r * Math.sin(a * RAD)];
  const [s, e] = [p(a0), p(a1)];
  return `M${s[0]} ${s[1]}A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 0 : 1} ${e[0]} ${e[1]}`;
}

/* =====================================================================================
 * The dial: a quarter circle of radius 1 with axes; right triangles with their corner B on the arc
 * ===================================================================================== */
class Dial {
  constructor(stage, svg, o) {
    this.stage = stage; this.svg = svg; this.O = [o.ox, o.oy]; this.R = o.R;
    const g = this.g = svgEl('g', {}, svg), [ox, oy] = this.O, R = this.R, L = R + 30;
    if (o.circle !== false) {
      this.arcEl = svgEl('path', { d: arcPath(this.O, R, 0, 90), fill: 'none', stroke: GRAY, 'stroke-width': 2.5 }, g);
      if (o.ticks !== false) for (let a = 0; a <= 90; a += 15) {
        const P = this.px(Math.cos(a * RAD), Math.sin(a * RAD)), Q = [ox + (R + 9) * Math.cos(a * RAD), oy - (R + 9) * Math.sin(a * RAD)];
        ln(g, P, Q, { color: GRAY, width: 2 });
        if (a === 30 || a === 45 || a === 60) lab(stage, ox + (R + 26) * Math.cos(a * RAD), oy - (R + 24) * Math.sin(a * RAD), a + '°', 'sm u9l2-dtick').style.color = '#8a909b';
      }
    }
    ln(g, [ox - 6, oy], [ox + L, oy], { color: INK, width: 2 }); arrowHead(g, ox + L + 2, oy, 1, 0, { width: 2, color: INK });
    ln(g, [ox, oy + 6], [ox, oy - L], { color: INK, width: 2 }); arrowHead(g, ox, oy - L - 2, 0, -1, { width: 2, color: INK });
    if (o.ones !== false) { lab(stage, ox + R, oy + 20, T(o.unit || '1'), 'sm'); lab(stage, ox - 18, oy - R, T(o.unit || '1'), 'sm'); }
    if (o.Olabel !== false) lab(stage, ox - 16, oy + 16, T('O'), 'sm');
  }
  px(u, v) { return [this.O[0] + u * this.R, this.O[1] - v * this.R]; }
  tri(a, o) { return new DTri(this, a, o); }
}
/** a right triangle in the dial: hypotenuse O→B (length 1), opposite B→A, adjacent O→A, angle a at O */
class DTri {
  constructor(D, a, o = {}) {
    this.D = D; this.o = o = Object.assign({ labels: 'val', arcR: 52, scale: 1, ghost: false, angle: true, Bdot: true }, o);
    const g = this.g = svgEl('g', {}, D.svg); if (o.ghost) g.setAttribute('opacity', o.ghost === true ? 0.32 : o.ghost);
    const w = o.ghost ? 4 : 6;
    this.adj = ln(g, D.O, D.O, { color: ADJ, width: w }); this.opp = ln(g, D.O, D.O, { color: OPP, width: w }); this.hyp = ln(g, D.O, D.O, { color: HYP, width: w - 1 });
    this.mark = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 2 }, g);
    this.arc = svgEl('path', { fill: 'none', stroke: ANG, 'stroke-width': 3 }, g);
    if (o.Bdot) this.dot = svgEl('circle', { r: 5.5, fill: HYP, stroke: '#fff', 'stroke-width': 2 }, g);
    this.labs = [];
    const L = (cls) => { const d = lab(D.stage, 0, 0, '', cls); this.labs.push(d); if (o.ghost) d.style.opacity = 0.55; return d; };
    if (o.angle) this.la = L('b u9l2-r');
    if (o.labels) { this.lo = L('b halo'); this.lad = L('b halo'); this.lh = o.labels === 'sym' ? L('b halo') : null; }
    if (o.labels === 'val') { this.lo.style.color = OPP; this.lad.style.color = ADJ; }
    if (o.labels === 'sym') { this.lo.style.color = OPP; this.lad.style.color = ADJ; this.lh.style.color = HYP; }
    this.set(a);
  }
  set(a) {
    this.a = a; const D = this.D, k = this.o.scale, c = cs(a) * k, s = sn(a) * k, O = D.O, A = D.px(c, 0), B = D.px(c, s);
    setLn(this.adj, O, A); setLn(this.opp, A, B); setLn(this.hyp, O, B);
    this.opp.style.display = s * D.R < 2 ? 'none' : ''; this.adj.style.display = c * D.R < 2 ? 'none' : '';
    const m = 14, okMark = s * D.R > 18 && c * D.R > 18;
    this.mark.setAttribute('d', okMark ? `M${A[0] - m} ${A[1]}L${A[0] - m} ${A[1] - m}L${A[0]} ${A[1] - m}` : '');
    const r = this.o.arcR;
    this.arc.setAttribute('d', a > 0.5 ? arcPath(O, r, 0, a) : '');
    if (this.dot) { this.dot.setAttribute('cx', B[0]); this.dot.setAttribute('cy', B[1]); }
    if (this.la) { const am = Math.max(a / 2, 7), rr = r + 24; mv(this.la, O[0] + rr * Math.cos(am * RAD) + 6, O[1] - rr * Math.sin(am * RAD)); setHTML(this.la, (Math.round(a * 100) / 100) + '°'); this.la.style.display = a > 0.5 ? '' : 'none'; }
    const md = this.o.labels;
    if (md === 'val') {
      setHTML(this.lo, f4(sn(a))); mv(this.lo, B[0] + 40, (A[1] + B[1]) / 2); this.lo.style.display = s * D.R > 24 ? '' : 'none';
      setHTML(this.lad, f4(cs(a))); mv(this.lad, (O[0] + A[0]) / 2, O[1] + 22); this.lad.style.display = c * D.R > 30 ? '' : 'none';
    } else if (md === 'sym') {
      setHTML(this.lo, T('y')); mv(this.lo, B[0] + 18, (A[1] + B[1]) / 2); this.lo.style.display = s * D.R > 20 ? '' : 'none';
      setHTML(this.lad, T('x')); mv(this.lad, (O[0] + A[0]) / 2, O[1] + 22); this.lad.style.display = c * D.R > 20 ? '' : 'none';
      const mid = lerp(O, B, 0.55); setHTML(this.lh, T('r')); mv(this.lh, mid[0] - 18 * Math.sin(a * RAD), mid[1] - 18 * Math.cos(a * RAD));
    }
    return this;
  }
  els() { return [this.g, ...this.labs]; }
  remove() { this.els().forEach((e) => e.remove()); }
  /** fade everything but the listed sides ('opp', 'adj', 'hyp') */
  focus(keys) { ['opp', 'adj', 'hyp'].forEach((k) => this[k].setAttribute('opacity', !keys || keys.includes(k) ? 1 : 0.18)); }
  thick(keys, w = 10) { ['opp', 'adj', 'hyp'].forEach((k) => this[k].setAttribute('stroke-width', keys.includes(k) ? w : this.o.ghost ? 4 : 6)); }
}

/** a bar chart of ratios: unit height = h / max; values above max climb "off the chart" (arrow) */
class Bars {
  constructor(stage, svg, o) {
    this.o = o = Object.assign({ max: 1.25, bw: 54 }, o); this.stage = stage;
    const g = this.g = svgEl('g', {}, svg), y0 = this.y0 = o.y + o.h, u = this.u = o.h / o.max;
    svgEl('line', { x1: o.x, x2: o.x + o.w, y1: y0, y2: y0, stroke: INK, 'stroke-width': 2 }, g);
    svgEl('line', { x1: o.x, x2: o.x + o.w, y1: y0 - u, y2: y0 - u, stroke: '#9aa0ab', 'stroke-width': 1.6, 'stroke-dasharray': '6 5' }, g);
    lab(stage, o.x - 14, y0 - u, T('1'), 'sm'); lab(stage, o.x - 14, y0, T('0'), 'sm');
    this.items = {}; const n = o.items.length;
    o.items.forEach((it, i) => {
      const cx = o.x + (i + 0.5) * o.w / n;
      const ghost = svgEl('line', { x1: cx - o.bw / 2 - 6, x2: cx + o.bw / 2 + 6, y1: y0, y2: y0, stroke: it.color, 'stroke-width': 3, 'stroke-dasharray': '5 4', opacity: 0 }, g);
      const rect = svgEl('rect', { x: cx - o.bw / 2, y: y0, width: o.bw, height: 0, rx: 5, fill: it.color }, g);
      const head = svgEl('polygon', { points: `${cx - o.bw / 2 - 6},${o.y + 2} ${cx},${o.y - 20} ${cx + o.bw / 2 + 6},${o.y + 2}`, fill: it.color, opacity: 0 }, g);
      const val = h('div', 'u9l2-barval'); val.style.left = cx + 'px'; val.style.color = it.color; stage.appendChild(val);
      const lb = h('div', 'u9l2-barlab', it.label); lb.style.left = cx + 'px'; lb.style.top = (y0 + 8) + 'px'; stage.appendChild(lb);
      const gv = h('div', 'u9l2-lab sm'); gv.style.color = it.color; gv.style.opacity = 0; stage.appendChild(gv);
      this.items[it.key] = { cx, rect, head, val, lb, ghost, gv, v: 0 };
    });
  }
  set(key, v) {
    const it = this.items[key], o = this.o; it.v = v;
    const und = !Number.isFinite(v), off = !und && v > o.max, hp = und ? 0 : off ? o.h + 4 : Math.max(0, v) * this.u;
    it.rect.setAttribute('y', this.y0 - hp); it.rect.setAttribute('height', hp);
    it.head.setAttribute('opacity', off ? 1 : 0);
    setHTML(it.val, und ? 'undefined' : off ? thinTxt(f2(v)) + ' ↑' : f4(v));
    mv(it.val, it.cx, und ? this.y0 - this.u * 0.5 : off ? o.y - 26 : this.y0 - hp - 6);
    return this;
  }
  label(key, html) { setHTML(this.items[key].lb, html); }
  ghost(key, v, text) { const it = this.items[key], y = this.y0 - Math.min(v, this.o.max) * this.u; setLn(it.ghost, [it.cx - this.o.bw / 2 - 8, y], [it.cx + this.o.bw / 2 + 8, y]); it.ghost.setAttribute('opacity', 0.9); setHTML(it.gv, text || f4(v)); mv(it.gv, it.cx + this.o.bw / 2 + 34, y); it.gv.style.opacity = 0.85; }
  unghost() { Object.values(this.items).forEach((it) => { it.ghost.setAttribute('opacity', 0); it.gv.style.opacity = 0; }); }
}
const BAR3 = [
  { key: 's', color: OPP, label: `${T('\\sin x^\\circ')}<br>${T('\\dfrac{\\text{opp}}{\\text{hyp}}')}` },
  { key: 'c', color: ADJ, label: `${T('\\cos x^\\circ')}<br>${T('\\dfrac{\\text{adj}}{\\text{hyp}}')}` },
  { key: 't', color: TAN, label: `${T('\\tan x^\\circ')}<br>${T('\\dfrac{\\text{opp}}{\\text{adj}}')}` }
];
const setBars3 = (B, a) => { B.set('s', sn(a)); B.set('c', cs(a)); B.set('t', a >= 89.9999 ? NaN : tn(a)); };

/* =====================================================================================
 * Static figures (booklet TikZ coordinates)
 * ===================================================================================== */
function fig(host, o) {
  const s = o.scale, pad = o.pad || [30, 34, 34, 34];
  const pts = Object.values(o.pts).concat(o.extra || []);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
  const W = (maxx - minx) * s + pad[1] + pad[3], H = (maxy - miny) * s + pad[0] + pad[2];
  host.style.width = W + 'px'; host.style.height = H + 'px'; host.innerHTML = '';
  const svg = svgEl('svg', { width: W, height: H }, host);
  const P = (p) => [pad[3] + (p[0] - minx) * s, pad[0] + (maxy - p[1]) * s];
  return {
    svg, P, s,
    q: (k) => P(o.pts[k]),
    line: (a, b, oo = {}) => ln(svg, P(a), P(b), oo),
    lab: (p, html, cls = '', dx = 0, dy = 0) => { const [x, y] = P(p); const d = h('div', 'u9l2-fl ' + cls, html); d.style.left = x + dx + 'px'; d.style.top = y + dy + 'px'; host.appendChild(d); return d; }
  };
}
const SW = 2.6; // static stroke width
function triOAB(host, Ax, By, ang, arcR, angAt) { // Example 1 triangles: O(0,0), A(Ax,0), B(Ax,By), right angle at A
  const F = fig(host, { scale: 72, pts: { O: [0, 0], A: [Ax, 0], B: [Ax, By] } });
  const O = F.q('O'), A = F.q('A'), B = F.q('B');
  svgEl('polygon', { points: [O, A, B].map((p) => p.join(',')).join(' '), fill: '#fbfaf6', stroke: INK, 'stroke-width': SW, 'stroke-linejoin': 'round' }, F.svg);
  rightMark(F.svg, A, O, B, 0.16 * 72, { color: INK });
  angleArc(F.svg, O, A, B, arcR * 72, { color: ANG, width: 2.6 });
  F.lab(angAt, T(deg(ang)), 'sm u9l2-r');
  F.lab([0, 0], T('O'), 'v', -14, 12); F.lab([Ax, 0], T('A'), 'v', 14, 12); F.lab([Ax, By], T('B'), 'v', 0, -16);
  return F;
}
function mountFigs() {
  const el = (id) => document.getElementById(id);
  // Example 1
  if (el('u9l2-f1a')) triOAB(el('u9l2-f1a'), 3.4, 1.514, 24, 0.5, [0.88, 0.17]);
  if (el('u9l2-f1b')) triOAB(el('u9l2-f1b'), 1.4, 3.298, 67, 0.6, [0.78, 0.5]);
  // SOH CAH TOA triangle
  if (el('u9l2-sohfig')) {
    const host = el('u9l2-sohfig'), F = fig(host, { scale: 52, pad: [30, 60, 38, 30], pts: { O: [0, 0], A: [4, 0], B: [4, 2.6] } });
    const O = F.q('O'), A = F.q('A'), B = F.q('B');
    svgEl('polygon', { points: [O, A, B].map((p) => p.join(',')).join(' '), fill: '#fff', stroke: 'none' }, F.svg);
    ln(F.svg, O, A, { color: ADJ, width: 5 }); ln(F.svg, A, B, { color: OPP, width: 5 }); ln(F.svg, O, B, { color: HYP, width: 5 });
    rightMark(F.svg, A, O, B, 13, { color: INK }); angleArc(F.svg, O, A, B, 40, { color: ANG, width: 3 });
    F.lab([1.0, 0.27], T('x^\\circ'), 'sm u9l2-r');
    const t1 = F.lab([4, 1.3], 'opp', 'b u9l2-o', 28, 0), t2 = F.lab([2, 0], 'adj', 'b u9l2-a', 0, 20), t3 = F.lab([2, 1.3], 'hyp', 'b u9l2-h', -16, -16);
    [t1, t2, t3].forEach((t) => (t.style.font = '800 19px var(--round)'));
    host.style.margin = '0 auto';
  }
  // Example 2: the quarter circle with both rescaled triangles
  if (el('u9l2-f2')) {
    const F = fig(el('u9l2-f2'), { scale: 66, pad: [24, 30, 30, 40], pts: { O: [0, 0] }, extra: [[4.6, 4.5], [0, -1.55]] });
    const S = F.svg, P = F.P, O = P([0, 0]);
    svgEl('path', { d: arcPath(O, 4 * 66, 0, 90), fill: 'none', stroke: GRAY, 'stroke-width': 2 }, S);
    ln(S, O, P([4.6, 0]), { color: INK, width: 2 }); arrowHead(S, ...P([4.62, 0]), 1, 0, { width: 2, color: INK });
    ln(S, O, P([0, 4.5]), { color: INK, width: 2 }); arrowHead(S, ...P([0, 4.52]), 0, -1, { width: 2, color: INK });
    ln(S, P([4, 0.08]), P([4, -0.08]), { width: 2 }); F.lab([4, 0], T('1'), 'sm', 0, 18);
    ln(S, P([0.08, 4]), P([-0.08, 4]), { width: 2 }); F.lab([0, 4], T('1'), 'sm', -16, 0);
    const tri = (Ax, By, col) => {
      ln(S, O, P([Ax, By]), { color: HYP, width: 3.2 }); ln(S, P([Ax, 0]), P([Ax, By]), { color: OPP, width: 5 });
      rightMark(S, P([Ax, 0]), O, P([Ax, By]), 0.16 * 66, { color: INK });
      svgEl('circle', { cx: P([Ax, By])[0], cy: P([Ax, By])[1], r: 4, fill: INK }, S);
      F.lab([Ax, By], T('B'), 'sm', 13, -12); void col;
    };
    tri(3.654, 1.627); tri(1.563, 3.682);
    svgEl('path', { d: arcPath(O, 0.75 * 66, 0, 24), fill: 'none', stroke: ANG, 'stroke-width': 2.4 }, S); F.lab([1.12, 0.24], T('24^\\circ'), 'sm u9l2-r');
    svgEl('path', { d: arcPath(O, 0.5 * 66, 0, 67), fill: 'none', stroke: ANG, 'stroke-width': 2.4 }, S); F.lab([0.16, 0.8], T('67^\\circ'), 'sm u9l2-r halo');
    F.lab([0, 0], T('O'), 'sm', -12, 12);
    F.lab([3.654, 0.7], T(cO('\\sin 24^\\circ')), 'sm', -42, 0); F.lab([1.563, 1.95], T(cO('\\sin 67^\\circ')), 'sm', 42, 0);
    F.lab([2.1, 1.25], T(cH('1')), 'sm'); F.lab([0.6, 2.0], T(cH('1')), 'sm');
    const dim = (x1, y, html) => {
      const a = P([0, y]), b = P([x1, y]);
      ln(S, a, b, { color: ADJ, width: 2.4 }); arrowHead(S, a[0], a[1], -1, 0, { width: 2, color: ADJ }); arrowHead(S, b[0], b[1], 1, 0, { width: 2, color: ADJ });
      ln(S, [a[0], a[1] - 7], [a[0], a[1] + 7], { color: ADJ, width: 2 }); ln(S, [b[0], b[1] - 7], [b[0], b[1] + 7], { color: ADJ, width: 2 });
      F.lab([x1 / 2, y], T(cA(html)), 'sm', 0, 17);
    };
    dim(1.563, -0.55, '\\cos 67^\\circ'); dim(3.654, -1.15, '\\cos 24^\\circ');
  }
  // Example 4: O, A, B with a°, r, x, y
  if (el('u9l2-f4')) {
    const F = fig(el('u9l2-f4'), { scale: 78, pad: [30, 40, 34, 34], pts: { O: [0, 0], A: [3, 0], B: [3, 2.517] } });
    const O = F.q('O'), A = F.q('A'), B = F.q('B');
    ln(F.svg, O, A, { color: ADJ, width: 4 }); ln(F.svg, A, B, { color: OPP, width: 4 }); ln(F.svg, O, B, { color: HYP, width: 4 });
    rightMark(F.svg, A, O, B, 0.16 * 78, { color: INK }); angleArc(F.svg, O, A, B, 0.7 * 78, { color: ANG, width: 2.6 });
    F.lab([1.05, 0.33], T('a^\\circ'), 'sm u9l2-r');
    F.lab([0, 0], T('O'), 'v', -14, 12); F.lab([3, 0], T('A'), 'v', 14, 12); F.lab([3, 2.517], T('B'), 'v', 0, -16);
    F.lab([1.4, 1.45], T(cH('r')), 'v'); F.lab([1.5, 0], T(cA('x')), 'v', 0, 18); F.lab([3.05, 1.26], T(cO('y')), 'v', 16, 0);
  }
  // Example 5: D, E, F
  if (el('u9l2-f5')) {
    const F = fig(el('u9l2-f5'), { scale: 88, pad: [32, 40, 34, 40], pts: { D: [0, 0], F: [3, 0], E: [0, 2.101] } });
    const D = F.q('D'), Fp = F.q('F'), E = F.q('E');
    svgEl('polygon', { points: [D, Fp, E].map((p) => p.join(',')).join(' '), fill: '#fbfaf6', stroke: INK, 'stroke-width': SW, 'stroke-linejoin': 'round' }, F.svg);
    rightMark(F.svg, D, Fp, E, 0.16 * 88, { color: INK });
    angleArc(F.svg, Fp, D, E, 0.6 * 88, { color: ANG, width: 2.6 }); angleArc(F.svg, E, D, Fp, 0.6 * 88, { color: ANG, width: 2.6 });
    F.lab([2.16, 0.26], T('x^\\circ'), 'sm u9l2-r'); F.lab([0.34, 1.22], T('(90-x)^\\circ'), 'sm u9l2-r halo', 12, 0);
    F.lab([0, 0], T('D'), 'v', -14, 12); F.lab([3, 0], T('F'), 'v', 14, 12); F.lab([0, 2.101], T('E'), 'v', 0, -16);
  }
}

/* =====================================================================================
 * Warm-up: four ladders against a wall
 * ===================================================================================== */
function mountWarm() {
  const host = document.getElementById('u9l2-wfig'); if (!host) return;
  const svg = svgEl('svg', { viewBox: '0 0 1000 330', width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid meet' }, host);
  const gy = 282, s = 27;
  const ladder = (x0, up, out, letter) => {
    const H = up * s, O = out * s, top = [x0, gy - H], foot = [x0 + O, gy];
    svgEl('rect', { x: x0 - 70, y: gy, width: O + 150, height: 14, fill: '#cfe3bf' }, svg);
    ln(svg, [x0 - 70, gy], [x0 + O + 80, gy], { color: '#1e2d46', width: 2.4 });
    svgEl('rect', { x: x0 - 26, y: gy - H - 14, width: 26, height: H + 14, fill: '#c98a6e', stroke: '#1e2d46', 'stroke-width': 1.6 }, svg);
    for (let y = gy - 10; y > gy - H - 10; y -= 10) ln(svg, [x0 - 26, y], [x0, y], { color: '#fff', width: 1, opacity: 0.8 });
    const L = Math.hypot(H, O), ux = (top[0] - foot[0]) / L, uy = (top[1] - foot[1]) / L, nx = -uy * 6, ny = ux * 6;
    for (let d = 14; d < L - 6; d += 16) { const p = [foot[0] + ux * d, foot[1] + uy * d]; ln(svg, [p[0] - nx, p[1] - ny], [p[0] + nx, p[1] + ny], { color: '#9a6a12', width: 2.6 }); }
    ln(svg, [foot[0] - nx, foot[1] - ny], [top[0] - nx, top[1] - ny], { color: '#e8a01e', width: 3.4 });
    ln(svg, [foot[0] + nx, foot[1] + ny], [top[0] + nx, top[1] + ny], { color: '#e8a01e', width: 3.4 });
    angleArc(svg, foot, [foot[0] - 10, gy], top, Math.min(26, O * 0.8 + 8), { color: ANG, width: 3 });
    const vx = x0 - 40;
    ln(svg, [vx, gy - 2], [vx, gy - H + 2], { color: '#1e2d46', width: 1.8 }); arrowHead(svg, vx, gy, 0, 1, { width: 1.6, color: '#1e2d46' }); arrowHead(svg, vx, gy - H, 0, -1, { width: 1.6, color: '#1e2d46' });
    svgEl('text', { x: vx - 8, y: gy - H / 2 + 7, 'text-anchor': 'end', class: 'u9l2-wt' }, svg).textContent = up + ' m';
    const hy = gy + 26;
    ln(svg, [x0, hy], [foot[0], hy], { color: '#1e2d46', width: 1.8 });
    if (O > 20) { arrowHead(svg, x0, hy, -1, 0, { width: 1.6, color: '#1e2d46' }); arrowHead(svg, foot[0], hy, 1, 0, { width: 1.6, color: '#1e2d46' }); }
    svgEl('text', { x: x0 + O / 2 + (O < 20 ? 22 : 0), y: hy + 22, 'text-anchor': 'middle', class: 'u9l2-wt' }, svg).textContent = out + ' m';
    const bx = x0 + O / 2 + 36, by = gy - H - 4;
    svgEl('circle', { cx: bx, cy: by, r: 17, fill: '#1e2d46' }, svg);
    svgEl('text', { x: bx, y: by + 8, 'text-anchor': 'middle', class: 'u9l2-wl' }, svg).textContent = letter;
  };
  ladder(150, 4, 1, 'A'); ladder(370, 6, 3, 'B'); ladder(650, 8, 2, 'C'); ladder(875, 5, 0.5, 'D');
}

/* =====================================================================================
 * Explainer 1: calculator values and the side ratio each one names (Example 1(a))
 * ===================================================================================== */
const CALC = {
  s24: { fn: 'sin', a: 24, label: 'Example 1(a)(i): sin 24°' }, c24: { fn: 'cos', a: 24, label: '(ii): cos 24°' },
  s67: { fn: 'sin', a: 67, label: '(iii): sin 67°' }, c67: { fn: 'cos', a: 67, label: '(iv): cos 67°' },
  s30: { fn: 'sin', a: 30, label: 'Demo: sin 30°' }, t45: { fn: 'tan', a: 45, label: 'Demo: tan 45°' }
};
const FN = { sin: { f: sn, num: 'opp', den: 'hyp', sides: ['AB', 'OB'], mn: 'SOH', word: 'opposite over hypotenuse' },
  cos: { f: cs, num: 'adj', den: 'hyp', sides: ['OA', 'OB'], mn: 'CAH', word: 'adjacent over hypotenuse' },
  tan: { f: tn, num: 'opp', den: 'adj', sides: ['AB', 'OA'], mn: 'TOA', word: 'opposite over adjacent' } };
const SIDECOL = { opp: OPP, adj: ADJ, hyp: HYP };
const calc = {
  title: 'Press the keys, read the screen, name the ratio',
  height: 440,
  choices: [CALC.s24, CALC.c24, CALC.s67, CALC.c67].map((d, i) => ({ v: Object.keys(CALC)[i], label: d.label })).concat([{ sep: 'Demos' }, { v: 's30', label: CALC.s30.label }, { v: 't45', label: CALC.t45.label }]),
  intro: 'A trig ratio on the calculator is a <b>side ratio</b> in disguise. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = CALC[key], F = FN[d.fn], a = d.a, v = F.f(a), screen = scr(v), r4 = f4(v), W = ex.W;
    const svg = stageSvg(stage, W, 440), hyp = 330, O = [44, 392], A = [O[0] + hyp * cs(a), O[1]], B = [A[0], O[1] - hyp * sn(a)];
    svgEl('polygon', { points: [O, A, B].map((p) => p.join(',')).join(' '), fill: '#fbfaf6' }, svg);
    const sides = { adj: ln(svg, O, A, { color: INK, width: 3 }), opp: ln(svg, A, B, { color: INK, width: 3 }), hyp: ln(svg, O, B, { color: INK, width: 3 }) };
    rightMark(svg, A, O, B, 14, { color: INK });
    const arc = hide0(svgEl('path', { d: arcPath(O, 46, 0, a), fill: 'none', stroke: ANG, 'stroke-width': 3.2 }, svg));
    const am = Math.max(a / 2, 10), al = hide0(lab(stage, O[0] + 74 * Math.cos(am * RAD) + 8, O[1] - 74 * Math.sin(am * RAD), T(deg(a)), 'b u9l2-r'));
    lab(stage, O[0] - 14, O[1] + 14, T('O'), 'sm'); lab(stage, A[0] + 14, A[1] + 14, T('A'), 'sm'); lab(stage, B[0], B[1] - 16, T('B'), 'sm');
    const tagAt = { hyp: [(O[0] + B[0]) / 2 - 30 * sn(a), (O[1] + B[1]) / 2 - 30 * cs(a)], opp: [A[0] + 36, (A[1] + B[1]) / 2], adj: [(O[0] + A[0]) / 2, O[1] + 26] };
    const tags = {}; for (const k of ['opp', 'adj', 'hyp']) tags[k] = hide0(tag(stage, ...tagAt[k], k, SIDECOL[k]));
    // right: keys, screen, rounding, meaning
    const px = Math.max(470, A[0] + 90), pw = W - px - 8;
    const P = panel(stage, px, 8, pw, 424, 'TI-30XIIS · DEG');
    const fr = pline(P, '', 'u9l2-big'); fr.style.minHeight = '62px';
    const keys = h('div', 'u9l2-keys'); P.appendChild(keys);
    const kl = [[d.fn.toUpperCase(), ''], ...String(a).split('').map((k) => [k, 'num']), [')', 'num'], ['ENTER', 'ent']].map(([t, c]) => hide0(h('span', 'u9l2-key ' + c, t)));
    kl.forEach((k) => keys.appendChild(k));
    const sc = h('div', 'u9l2-scr', `<div class="u9l2-s1"><span class="u9l2-in"></span><span class="u9l2-deg">DEG</span></div><div class="u9l2-s2">&nbsp;</div>`); P.appendChild(sc);
    const sIn = sc.querySelector('.u9l2-in'), sOut = sc.querySelector('.u9l2-s2');
    const rd = hide0(pline(P, '')), mean = hide0(pline(P, ''));
    // rounding
    const dec = screen.split('.')[1] || '', exact = dec.length <= 4, d5 = dec[4] || '0';
    const shown = exact ? `${screen.replace(/\.$/, '')}` : `${screen.slice(0, screen.indexOf('.') + 5)}<span class="u9l2-dig-hl">${d5}</span>${screen.slice(screen.indexOf('.') + 6)}`;
    const roundTxt = exact ? `exactly, so <b>${r4}</b> to four decimal places.` : `the fifth decimal is <b>${d5}</b>, so round ${Number(d5) >= 5 ? 'up' : 'down'}: <b>${r4}</b>.`;
    // meaning bars
    const [nk, dk] = [F.num, F.den], [ns, ds] = F.sides, BL = pw - 120;
    const bars = h('div', ''); bars.style.position = 'relative'; bars.style.height = '86px'; P.appendChild(bars); hide0(bars);
    const mk = (y, col, text) => { const b = h('div', 'u9l2-hbar'); b.style.background = col; b.style.left = '0px'; b.style.top = y + 'px'; b.style.width = '0px'; bars.appendChild(b); const t = h('div', 'u9l2-hbl', text); t.style.top = (y + 15) + 'px'; bars.appendChild(t); return [b, t]; };
    const [bd, td] = mk(4, SIDECOL[dk], `${ds} (${dk})`), [bn, tnum] = mk(46, SIDECOL[nk], `${ns} (${nk})`);
    const ratioTex = `\\${d.fn} ${deg(a)}=\\dfrac{${F.num === 'opp' ? cO(ns) : cA(ns)}}{${F.den === 'hyp' ? cH(ds) : cA(ds)}}`;
    const meanCap = d.fn === 'tan'
      ? `So ${T(`\\dfrac{${ns}}{${ds}}=${r4.replace(/0+$/, '').replace(/\.$/, '')}`)}: the opposite side is <b>exactly as long as</b> the adjacent side. A ${a}° right triangle is isosceles.`
      : `So ${T(`\\dfrac{${ns}}{${ds}}\\approx${r4}`)}: the ${nk === 'opp' ? 'opposite' : 'adjacent'} side is about <b>${Math.round(v * 100)}%</b> of the hypotenuse, in <b>any</b> right triangle with a ${a}° angle.`;
    return [
      { cap: `The reference angle is ${T(`\\angle O=${deg(a)}`)}. The right angle is at ${T('A')}, so ${T('OB')}, across from it, is the ${bH('hypotenuse')}.`,
        run: async (c) => { await appear(c, arc, 300); await pop(c, al); sides.hyp.setAttribute('stroke', HYP); sides.hyp.setAttribute('stroke-width', 6); await pop(c, tags.hyp); } },
      { cap: `${T(`\\${d.fn}`)} is <b>${F.mn}</b>: ${F.word}. ${d.fn === 'cos' ? `Next to ${T('\\angle O')} is ${T('OA')}` : `Across from ${T('\\angle O')} is ${T('AB')}`}${d.fn === 'tan' ? `, next to it is ${T('OA')}` : ''}: ${T(ratioTex)}.`,
        run: async (c) => {
          for (const k of [nk, dk]) { if (k === 'hyp') continue; sides[k].setAttribute('stroke', SIDECOL[k]); sides[k].setAttribute('stroke-width', 6); await pop(c, tags[k]); }
          fr.innerHTML = T(ratioTex); await show(c, fr);
        } },
      { cap: `Check <b>DEG</b> on the screen. Then ${kl.map((k) => `<b>${k.textContent}</b>`).join(' ')}. ${T(`\\${d.fn}`)} opens its own bracket; close it.`,
        run: async (c) => {
          let typed = d.fn + '(';
          for (let i = 0; i < kl.length; i++) {
            await pop(c, kl[i], 220);
            if (i > 0 && i < kl.length - 1) typed += kl[i].textContent;
            sIn.textContent = i === 0 ? d.fn + '(' : typed; if (i === kl.length - 1) sOut.textContent = screen;
            await sleep(c, 120);
          }
        } },
      { cap: `The screen shows ${T(screen)}. To four decimal places: ${roundTxt}`,
        run: async (c) => { sOut.innerHTML = shown; rd.innerHTML = T(`\\${d.fn} ${deg(a)}${exact ? '=' : '\\approx'}\\boldsymbol{${r4}}`); await show(c, rd); } },
      { cap: meanCap,
        run: async (c) => {
          mean.innerHTML = T(ratioTex + `${exact ? '=' : '\\approx'}${exact ? r4.replace(/0+$/, '').replace(/\.$/, '') : r4}`); await show(c, mean);
          bars.style.opacity = 1;
          await anim(c, bd, [{ width: '0px' }, { width: BL + 'px' }], 500); td.style.left = (BL + 8) + 'px';
          await anim(c, bn, [{ width: '0px' }, { width: (BL * Math.min(v, 1.1)) + 'px' }], 700); tnum.style.left = (BL * Math.min(v, 1.1) + 8) + 'px';
        } }
    ];
  }
};

/* =====================================================================================
 * Explainer 2: rescale a triangle so the hypotenuse is 1
 * ===================================================================================== */
const rescale = {
  title: 'Shrink the triangle until the hypotenuse is 1',
  height: 450,
  choices: [{ v: 24, label: 'Example 1 → 2: the 24° triangle' }, { v: 67, label: 'the 67° triangle' }],
  intro: 'Same angle, any size: the ratios never change. So pick the size that makes them easiest to see. Press <b>Next</b>.',
  make(stage, a, ex) {
    const W = ex.W, svg = stageSvg(stage, W, 450), k0 = 1.5, s = sn(a), c = cs(a);
    const D = new Dial(stage, svg, { ox: 64, oy: 406, R: 236, ticks: false });
    D.arcEl.setAttribute('stroke-dasharray', '8 6');
    const rl = lab(stage, D.O[0] + 236 * 0.74, D.O[1] - 236 * 0.74 - 14, 'radius 1', 'sm'); rl.style.color = '#8a909b'; rl.style.rotate = '-45deg';
    const t = D.tri(a, { scale: k0, labels: null }), t2 = { };
    const lo = lab(stage, 0, 0, '', 'b halo'), la2 = lab(stage, 0, 0, '', 'b halo'), lh = lab(stage, 0, 0, '', 'b halo');
    lo.style.color = OPP; la2.style.color = ADJ; lh.style.color = HYP;
    const place = (k) => {
      const A = D.px(c * k, 0), B = D.px(c * k, s * k), O = D.O, mid = lerp(O, B, 0.5);
      mv(lo, B[0] + 46, (A[1] + B[1]) / 2); mv(la2, (O[0] + A[0]) / 2, O[1] + 22); mv(lh, mid[0] - 34 * s, mid[1] - 34 * c);
      setHTML(lo, f4(s * k)); setHTML(la2, f4(c * k)); setHTML(lh, String(Math.round(k * 10000) / 10000));
    };
    place(k0); void t2;
    const px = 520, P = panel(stage, px, 14, W - px - 8, 420, 'The ratios');
    const l1 = hide0(pline(P, T(`\\text{Before: }\\sin ${deg(a)}=\\dfrac{${cO(f4(s * k0))}}{${cH('1.5')}}=${f4(s)}`)));
    const l2 = hide0(pline(P, T(`\\text{After: }\\sin ${deg(a)}=\\dfrac{${cO(f4(s))}}{${cH('1')}}=${f4(s)}`)));
    const l3 = hide0(pline(P, `The <b style="color:${OPP}">vertical leg</b> is ${T(`\\sin ${deg(a)}`)}`, 'u9l2-big'));
    const l4 = hide0(pline(P, `The <b style="color:${ADJ}">horizontal leg</b> is ${T(`\\cos ${deg(a)}`)}`, 'u9l2-big'));
    const ghosts = [];
    return [
      { cap: `Example 1’s ${a}° triangle. Say its hypotenuse is ${T(cH('1.5'))} units: then the opposite leg is ${T(cO(f4(s * k0)))} and the adjacent leg is ${T(cA(f4(c * k0)))}.`,
        run: async (c2) => { await show(c2, l1); } },
      { cap: `<b>Divide every side by 1.5.</b> Same angle, same shape (similar triangles), but now the hypotenuse is exactly ${T('1')} and ${T('B')} lands on the quarter circle.`,
        run: async (c2) => { await tween(c2, 1400, (u) => { const k = k0 + (1 - k0) * u; t.o.scale = k; t.set(a); place(k); }); await show(c2, l2); } },
      { cap: `${T(`\\sin ${deg(a)}=\\dfrac{\\text{opp}}{1}=\\text{opp}`)}: the vertical leg <b>is</b> the sine, ${T(cO(f4(s)))}. The ratio did not change when the triangle shrank.`,
        run: async (c2) => { t.thick(['opp'], 11); await pulse(c2, lo, 1.3); await show(c2, l3); } },
      { cap: `${T(`\\cos ${deg(a)}=\\dfrac{\\text{adj}}{1}=\\text{adj}`)}: the horizontal leg <b>is</b> the cosine, ${T(cA(f4(c)))}.`,
        run: async (c2) => { t.thick(['adj'], 11); await pulse(c2, la2, 1.3); await show(c2, l4); } },
      { cap: `Every right triangle with hypotenuse ${T('1')} has its corner on this one quarter circle. Open the angle and read sine and cosine <b>straight off the legs</b>.`,
        run: async (c2) => { t.thick([], 0); for (const b of [15, 45, 75].filter((x) => Math.abs(x - a) > 8)) { const g = D.tri(b, { ghost: 0.3, labels: null, angle: false }); ghosts.push(g); await appear(c2, g.g, 350); } } }
    ];
  }
};

/* =====================================================================================
 * Explainer 3 (the star): the angle dial
 * ===================================================================================== */
function dialStage(stage, ex, H, items) {
  const W = ex.W, svg = stageSvg(stage, W, H);
  const D = new Dial(stage, svg, { ox: 60, oy: H - 52, R: H - 140 });
  const bx = Math.max(500, D.O[0] + D.R + 90), B = new Bars(stage, svg, { x: bx, y: 74, w: W - bx - 30, h: H - 210, items });
  const rd = add(stage, h('div', 'u9l2-readout', ''), bx, 8);
  return { svg, D, B, rd };
}
const DIAL = { sweep: 'Sweep 0° → 90°', ex2: 'Example 2: 24° → 67°', swap: 'Swap: 24° ↔ 66°' };
const dial = {
  title: 'Open the dial: the hypotenuse stays 1',
  height: 480,
  choices: Object.keys(DIAL).map((k) => ({ v: k, label: DIAL[k] })),
  intro: (v) => v === 'swap' ? 'Flip a triangle over the 45° line: what happens to its sine and cosine? Press <b>Next</b>.' : 'The hypotenuse is a radius, so it is always 1. Press <b>Next</b> and watch the legs.',
  make(stage, key, ex) {
    if (key === 'swap') return swapSteps(stage, ex);
    const { D, B, rd } = dialStage(stage, ex, 480, BAR3);
    const a0 = key === 'sweep' ? 0 : 24, t = D.tri(a0, { labels: 'val' });
    const setA = (a) => { t.set(a); setBars3(B, a); rd.innerHTML = 'x = ' + (Math.round(a * 10) / 10) + '°'; };
    setA(a0);
    const go = (a1, ms = 1300) => (c) => { const from = t.a; return tween(c, ms, (u) => setA(from + (a1 - from) * u)); };
    if (key === 'sweep') {
      const st = (a) => `${T(`\\sin ${deg(a)}=${f4(sn(a))}`)}, ${T(`\\cos ${deg(a)}=${f4(cs(a))}`)}`;
      return [
        { cap: `At ${T('0^\\circ')} the triangle is flat: ${bO('opp')} ${T('=0')} and ${bA('adj')} is the whole hypotenuse, ${T('1')}. So ${T('\\sin 0^\\circ=0')}, ${T('\\cos 0^\\circ=1')}, ${T('\\tan 0^\\circ=0')}.`,
          run: async (c) => { await pulse(c, B.items.c.val, 1.3); } },
        { cap: `Open to ${T('30^\\circ')}: ${bO('opp')} climbs, ${bA('adj')} shrinks. ${T('\\sin 30^\\circ=0.5')} exactly: the opposite leg is half the hypotenuse.`, run: go(30) },
        { cap: `At ${T('45^\\circ')} the legs are <b>equal</b> (${T('0.7071')}): ${T('\\sin 45^\\circ=\\cos 45^\\circ')} and ${T('\\tan 45^\\circ=1')}.`, run: go(45) },
        { cap: `${T('60^\\circ')}: now ${bO('opp')} is the longer leg. ${st(60)}. ${T(`\\tan 60^\\circ=${f4(tn(60))}`)} is already over the top of the chart.`, run: go(60) },
        { cap: `${T('80^\\circ')}: ${bA('adj')} is tiny (${T(f4(cs(80)))}), so ${T(`\\tan 80^\\circ=\\dfrac{${f4(sn(80))}}{${f4(cs(80))}}=${f4(tn(80))}`)}: way off the chart.`, run: go(80) },
        { cap: `${T('90^\\circ')}: ${bO('opp')} ${T('=1')}, ${bA('adj')} ${T('=0')}. ${T('\\sin 90^\\circ=1')}, ${T('\\cos 90^\\circ=0')}, and ${T('\\tan 90^\\circ=\\frac{1}{0}')} is <b>undefined</b>. Sine went up ${T('0\\to1')}, cosine down ${T('1\\to0')}.`, run: go(90, 900) }
      ];
    }
    // Example 2: 24° → 67°
    let g = null;
    return [
      { cap: `Example 2: hypotenuse ${T('1')}, angle ${T('24^\\circ')}. The ${bO('vertical leg')} is ${T(`\\sin 24^\\circ=${f4(sn(24))}`)}; the ${bA('horizontal leg')} is ${T(`\\cos 24^\\circ=${f4(cs(24))}`)}.`,
        run: async (c) => { t.thick(['opp', 'adj'], 9); await pulse(c, t.lo, 1.3); await pulse(c, t.lad, 1.3); t.thick([], 0); } },
      { cap: `Leave a ghost at ${T('24^\\circ')} and open the angle to ${T('67^\\circ')}. ${T('B')} slides up the arc; the hypotenuse is still ${T('1')}.`,
        run: async (c) => { g = D.tri(24, { ghost: true, labels: null, arcR: 80 }); B.ghost('s', sn(24)); B.ghost('c', cs(24)); B.ghost('t', tn(24)); await appear(c, g.g, 300); await go(67, 1600)(c); } },
      { cap: `(a) ${bO('Opposite')} grew from ${T(f4(sn(24)))} to ${T(f4(sn(67)))}. Same hypotenuse, so ${T('\\sin=\\frac{\\text{opp}}{\\text{hyp}}')} <b>increases</b>.`,
        run: async (c) => { t.thick(['opp'], 11); g.thick(['opp'], 8); await pulse(c, B.items.s.rect, 1.05); } },
      { cap: `${bA('Adjacent')} shrank from ${T(f4(cs(24)))} to ${T(f4(cs(67)))}, so ${T('\\cos=\\frac{\\text{adj}}{\\text{hyp}}')} <b>decreases</b>.`,
        run: async (c) => { t.thick(['adj'], 11); g.thick(['adj'], 8); await pulse(c, B.items.c.rect, 1.05); } },
      { cap: `(b) ${T('\\tan=\\frac{\\text{opp}}{\\text{adj}}')}: the top grew <b>and</b> the bottom shrank, so tangent <b>increases</b> fast: ${T(`\\tan 24^\\circ\\approx${f4(tn(24))}`)} to ${T(`\\tan 67^\\circ\\approx${f4(tn(67))}`)}.`,
        run: async (c) => { t.thick(['opp', 'adj'], 9); g.thick(['opp', 'adj'], 7); await pulse(c, B.items.t.val, 1.3); } }
    ];
  }
};
/** the complementary swap: flip the 24° triangle over the 45° line; its legs become the 66° triangle's legs, swapped */
function swapSteps(stage, ex) {
  const x = 24, y = 90 - x, s = sn(x), c = cs(x);
  const items = [
    { key: 's1', color: OPP, label: T(`\\sin ${deg(x)}`) }, { key: 'c2', color: ADJ, label: T(`\\cos ${deg(y)}`) },
    { key: 'c1', color: ADJ, label: T(`\\cos ${deg(x)}`) }, { key: 's2', color: OPP, label: T(`\\sin ${deg(y)}`) }];
  const { svg, D, B, rd } = dialStage(stage, ex, 480, items);
  B.set('s1', s); B.set('c1', c); B.set('c2', 0); B.set('s2', 0);
  Object.values(B.items).forEach((it) => (it.val.style.opacity = 0)); B.items.s1.val.style.opacity = 1; B.items.c1.val.style.opacity = 1;
  rd.innerHTML = 'x = 24°';
  const g = svgEl('g', {}, svg), O = D.O;
  const adj = ln(g, O, O, { color: ADJ, width: 7 }), opp = ln(g, O, O, { color: OPP, width: 7 }), hyp = ln(g, O, O, { color: HYP, width: 5 });
  const mark = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 2 }, g);
  const arc1 = svgEl('path', { fill: 'none', stroke: ANG, 'stroke-width': 3 }, g), arc2 = hide0(svgEl('path', { fill: 'none', stroke: ANG, 'stroke-width': 3, 'stroke-dasharray': '7 4' }, g));
  const la1 = lab(stage, 0, 0, '24°', 'b u9l2-r'), la2 = hide0(lab(stage, 0, 0, '66°', 'b u9l2-r'));
  const lo = lab(stage, 0, 0, f4(s), 'b halo'), lad = lab(stage, 0, 0, f4(c), 'b halo'); lo.style.color = OPP; lad.style.color = ADJ;
  const t1 = hide0(tag(stage, 0, 0, '', OPP)), t2 = hide0(tag(stage, 0, 0, '', ADJ));
  const mid = (P, Q) => lerp(P, Q, 0.5);
  // flip: A from (c,0) to (0,c); B from (c,s) to (s,c)
  const draw = (Au, Bu, oppSeg, adjSeg) => {
    const A = D.px(...Au), Bp = D.px(...Bu);
    setLn(hyp, O, Bp);
    const [p1, p2] = oppSeg || [A, Bp], [q1, q2] = adjSeg || [O, A]; setLn(opp, p1, p2); setLn(adj, q1, q2);
    const crossOK = Math.abs((A[0] - O[0]) * (Bp[1] - A[1]) - (A[1] - O[1]) * (Bp[0] - A[0])) > 900 && !oppSeg;
    if (crossOK) { const u = norm2(O[0] - A[0], O[1] - A[1]), v = norm2(Bp[0] - A[0], Bp[1] - A[1]), m = 14; mark.setAttribute('d', `M${A[0] + u[0] * m} ${A[1] + u[1] * m}L${A[0] + (u[0] + v[0]) * m} ${A[1] + (u[1] + v[1]) * m}L${A[0] + v[0] * m} ${A[1] + v[1] * m}`); } else if (!oppSeg) mark.setAttribute('d', '');
    const aO = Math.atan2(O[1] - A[1], A[0] - O[0]) / RAD, aB = Math.atan2(O[1] - Bp[1], Bp[0] - O[0]) / RAD; // math angles of OA and OB
    arc1.setAttribute('d', Math.abs(aB - aO) > 0.5 ? arcPath(O, 52, Math.min(aO, aB), Math.max(aO, aB)) : '');
    const am = (aO + aB) / 2; mv(la1, O[0] + 78 * Math.cos(am * RAD) + 6, O[1] - 78 * Math.sin(am * RAD)); la1.style.opacity = Math.abs(aB - aO) > 4 ? 1 : 0;
    mv(lo, ...mid(p1, p2).map((v2, i) => v2 + (i === 0 ? (Math.abs(p1[0] - p2[0]) < 2 ? 46 : 0) : (Math.abs(p1[0] - p2[0]) < 2 ? 0 : -18))));
    mv(lad, ...mid(q1, q2).map((v2, i) => v2 + (i === 0 ? (Math.abs(q1[0] - q2[0]) < 2 ? 46 : 0) : (Math.abs(q1[0] - q2[0]) < 2 ? 0 : 22))));
  };
  draw([c, 0], [c, s]);
  const R = D.R;
  const diag = hide0(ln(svg, O, [O[0] + (R + 24) * Math.SQRT1_2, O[1] - (R + 24) * Math.SQRT1_2], { color: '#6a7182', width: 2, dash: '8 6' }));
  return [
    { cap: `A ${T('24^\\circ')} triangle with hypotenuse ${T('1')}: ${T(`\\sin 24^\\circ=${cO(f4(s))}`)} (the ${bO('opposite')} leg), ${T(`\\cos 24^\\circ=${cA(f4(c))}`)} (the ${bA('adjacent')} leg).`,
      run: async (cx) => { await pulse(cx, lo, 1.3); await pulse(cx, lad, 1.3); } },
    { cap: `Flip the triangle over the ${T('45^\\circ')} line. Its hypotenuse now makes ${T('90^\\circ-24^\\circ=66^\\circ')} with the ground: the two angles are <b>complementary</b>.`,
      run: async (cx) => {
        await appear(cx, diag, 300);
        await tween(cx, 1600, (u) => draw(lerp([c, 0], [0, c], u), lerp([c, s], [s, c], u)));
        const aB = 66; arc2.setAttribute('d', arcPath(O, 104, 0, aB)); mv(la2, O[0] + 130 * Math.cos(33 * RAD), O[1] - 130 * Math.sin(33 * RAD));
        await appear(cx, arc2, 300); await pop(cx, la2); rd.innerHTML = '24° ↔ 66°';
      } },
    { cap: `Slide the legs to make the ${T('66^\\circ')} triangle. The ${bO('purple')} leg (${T(f4(s))}) lands <b>next to</b> ${T('66^\\circ')}: it is now ${bA('adjacent')}. The amber leg (${T(f4(c))}) is now ${bO('opposite')}.`,
      run: async (cx) => {
        const A0 = D.px(0, c), B0 = D.px(s, c), OO = D.px(0, 0), S0 = D.px(s, 0);
        mark.setAttribute('d', ''); la1.style.opacity = 0.35; arc1.setAttribute('opacity', 0.35);
        await tween(cx, 1300, (u) => draw([0, c], [s, c], [lerp(A0, OO, u), lerp(B0, S0, u)], [lerp(OO, S0, u), lerp(A0, B0, u)]));
        const m = 14; mark.setAttribute('d', `M${S0[0] - m} ${S0[1]}L${S0[0] - m} ${S0[1] - m}L${S0[0]} ${S0[1] - m}`);
        opp.setAttribute('stroke', ADJ); adj.setAttribute('stroke', OPP); lo.style.color = ADJ; lad.style.color = OPP;
        t1.textContent = 'adj of 66°'; t1.style.background = ADJ; mv(t1, (OO[0] + S0[0]) / 2, OO[1] + 34);
        t2.textContent = 'opp of 66°'; t2.style.background = OPP; mv(t2, S0[0] + 76, (S0[1] + B0[1]) / 2 + 34);
        await pop(cx, t1); await pop(cx, t2);
      } },
    { cap: `Same lengths, new names: ${T(`\\sin 24^\\circ=\\cos 66^\\circ=${f4(s)}`)} and ${T(`\\cos 24^\\circ=\\sin 66^\\circ=${f4(c)}`)}. In general ${T('\\sin x^\\circ=\\cos(90-x)^\\circ')} (Section 5, Extension).`,
      run: async (cx) => {
        B.items.c2.val.style.opacity = 1; B.items.s2.val.style.opacity = 1;
        await tween(cx, 900, (u) => { B.set('c2', s * u); B.set('s2', c * u); });
        await pulse(cx, B.items.c2.val, 1.3); await pulse(cx, B.items.s2.val, 1.3);
      } }
  ];
}
function norm2(x, y) { const L = Math.hypot(x, y) || 1; return [x / L, y / L]; }

/* =====================================================================================
 * Explainer 4: comparing ratios without a calculator (45° benchmark, Example 3)
 * ===================================================================================== */
const CMP = {
  bench: { label: 'The 45° benchmark' },
  a: { label: 'Example 3(a): sin 18°, sin 71°', fn: 'sin', A: 18, B: 71 },
  b: { label: '(b): cos 12°, cos 55°', fn: 'cos', A: 12, B: 55 },
  c: { label: '(c): tan 22°, tan 80°', fn: 'tan', A: 22, B: 80 },
  d: { label: '(d): sin 50°, cos 50°, tan 50°' }
};
const compare = {
  title: 'Compare the legs, not the decimals',
  height: 460,
  choices: Object.keys(CMP).map((k) => ({ v: k, label: CMP[k].label })),
  intro: 'Draw the angles with the <b>same hypotenuse</b> and the comparison is a matter of looking. Press <b>Next</b>.',
  make(stage, key, ex) {
    const W = ex.W, H = 460, svg = stageSvg(stage, W, H), D = new Dial(stage, svg, { ox: 60, oy: H - 48, R: 330 });
    const px = 500, P = panel(stage, px, 10, W - px - 8, H - 20, key === 'bench' ? 'The 45° benchmark' : 'Reasoning');
    const L = () => hide0(pline(P, ''));
    const set = async (c, el, html) => { el.innerHTML = html; await show(c, el); };
    if (key === 'bench') {
      let t1, t2, t3; const l1 = L(), l2 = L(), l3 = L();
      return [
        { cap: `At ${T('45^\\circ')} the triangle is <b>isosceles</b>: ${bO('opp')} ${T('=')} ${bA('adj')} ${T(`=${f4(sn(45))}`)}. So ${T('\\sin 45^\\circ=\\cos 45^\\circ')} and ${T('\\tan 45^\\circ=1')}.`,
          run: async (c) => { t1 = D.tri(45, { labels: 'val' }); await appear(c, t1.g, 400); await set(c, l1, `${T('45^\\circ')}: ${T('\\text{opp}=\\text{adj}')}, ${T('\\tan=1')}`); } },
        { cap: `Below ${T('45^\\circ')} (here ${T('30^\\circ')}): the ${bA('adjacent')} leg is longer. ${T('\\cos 30^\\circ>\\sin 30^\\circ')} and ${T(`\\tan 30^\\circ=${f4(tn(30))}<1`)}.`,
          run: async (c) => { t1.remove(); t1 = D.tri(45, { ghost: true, labels: null, angle: false }); t2 = D.tri(30, { labels: 'val', arcR: 60 }); await appear(c, t2.g, 400); t2.thick(['adj'], 10); await set(c, l2, `Below ${T('45^\\circ')}: ${T('\\cos>\\sin')}, ${T('\\tan<1')}`); } },
        { cap: `Above ${T('45^\\circ')} (here ${T('60^\\circ')}): the ${bO('opposite')} leg is longer. ${T('\\sin 60^\\circ>\\cos 60^\\circ')} and ${T(`\\tan 60^\\circ=${f4(tn(60))}>1`)}.`,
          run: async (c) => { t2.remove(); t3 = D.tri(60, { labels: 'val', arcR: 60 }); await appear(c, t3.g, 400); t3.thick(['opp'], 10); await set(c, l3, `Above ${T('45^\\circ')}: ${T('\\sin>\\cos')}, ${T('\\tan>1')}`); } }
      ];
    }
    if (key === 'd') {
      let t; const l1 = L(), l2 = L(), l3 = L(), l4 = L();
      const g45 = D.tri(45, { ghost: true, labels: null, angle: false });
      return [
        { cap: `${T('50^\\circ>45^\\circ')}, so the triangle is past the isosceles one (ghost): the ${bO('opposite')} leg is longer than the ${bA('adjacent')} leg.`,
          run: async (c) => { void g45; t = D.tri(50, { labels: 'val', arcR: 62 }); await appear(c, t.g, 400); t.thick(['opp', 'adj'], 9); await set(c, l1, `${T('50^\\circ>45^\\circ')}: ${T(`${cO('\\text{opp}')}>${cA('\\text{adj}')}`)}`); } },
        { cap: `Same hypotenuse, so ${T('\\sin 50^\\circ=\\frac{\\text{opp}}{\\text{hyp}}')} beats ${T('\\cos 50^\\circ=\\frac{\\text{adj}}{\\text{hyp}}')}.`,
          run: async (c) => { await set(c, l2, T('\\cos 50^\\circ<\\sin 50^\\circ')); } },
        { cap: `${T('\\tan 50^\\circ=\\frac{\\text{opp}}{\\text{adj}}>1')} (bigger over smaller), but sine and cosine are both less than ${T('1')} (each leg is shorter than the hypotenuse).`,
          run: async (c) => { await set(c, l3, `${T('\\tan 50^\\circ>1>\\sin 50^\\circ')}`); } },
        { cap: `Order: ${T('\\cos 50^\\circ<\\sin 50^\\circ<\\tan 50^\\circ')}, so ${T('\\tan 50^\\circ')} is the greatest. Calculator check: ${T(`${f4(cs(50))}<${f4(sn(50))}<${f4(tn(50))}`)} ✓`,
          run: async (c) => { await set(c, l4, `<b>${T('\\tan 50^\\circ')} is greatest.</b><br>${T(`${f4(cs(50))}<${f4(sn(50))}<${f4(tn(50))}`)}`); } }
      ];
    }
    const d = CMP[key], f = FN[d.fn].f, big = f(d.A) > f(d.B) ? d.A : d.B, small = big === d.A ? d.B : d.A;
    let tA, tB; const l1 = L(), l2 = L(), l3 = L(), l4 = L();
    const side = d.fn === 'sin' ? 'opp' : d.fn === 'cos' ? 'adj' : null;
    const sideWord = side === 'opp' ? bO('opposite') : bA('adjacent');
    const why = d.fn === 'sin'
      ? `Same hypotenuse, so compare the ${sideWord} (vertical) legs: the ${T(deg(d.B))} leg is longer.`
      : d.fn === 'cos' ? `Same hypotenuse, so compare the ${sideWord} (horizontal) legs: the ${T(deg(d.A))} leg is longer.`
        : `${T('\\tan=\\frac{\\text{opp}}{\\text{adj}}')}. At ${T(deg(d.A))} ${bO('opp')} is shorter than ${bA('adj')}: less than ${T('1')}. At ${T(deg(d.B))} ${bO('opp')} is long and ${bA('adj')} is short: far more than ${T('1')}.`;
    return [
      { cap: `Draw ${T(deg(d.A))} and ${T(deg(d.B))} with the <b>same hypotenuse</b> (${T('1')}).`,
        run: async (c) => {
          tA = D.tri(d.A, { labels: null, arcR: 98 }); await appear(c, tA.g, 400); tA.la.style.opacity = 1;
          tB = D.tri(d.B, { labels: null, arcR: 54 }); await appear(c, tB.g, 400);
          await set(c, l1, `${T(`\\${d.fn}=${d.fn === 'sin' ? '\\frac{\\text{opp}}{\\text{hyp}}' : d.fn === 'cos' ? '\\frac{\\text{adj}}{\\text{hyp}}' : '\\frac{\\text{opp}}{\\text{adj}}'}`)} <span class="muted">(${d.fn === 'sin' ? 'SOH' : d.fn === 'cos' ? 'CAH' : 'TOA'})</span>`);
        } },
      { cap: why,
        run: async (c) => {
          if (side) { tA.focus([side]); tB.focus([side]); tA.thick([side], 11); tB.thick([side], 11); }
          else { tA.focus(['opp', 'adj']); tB.focus(['opp', 'adj']); tA.thick(['opp', 'adj'], 9); tB.thick(['opp', 'adj'], 9); }
          await set(c, l2, side ? `${T(deg(big))}: longer ${side === 'opp' ? bO('opp') : bA('adj')}` : `${T(`\\tan ${deg(d.A)}<1<\\tan ${deg(d.B)}`)}`);
        } },
      { cap: `So ${T(`\\boldsymbol{\\${d.fn} ${deg(big)}}`)} is greater${d.fn === 'cos' ? ': cosine <b>decreases</b> as the angle opens' : d.fn === 'sin' ? ': sine <b>increases</b> as the angle opens' : ': tangent <b>increases</b> as the angle opens'}.`,
        run: async (c) => { await set(c, l3, `<b>${T(`\\${d.fn} ${deg(big)}>\\${d.fn} ${deg(small)}`)}</b>`); const st = stamp(P, '✓', { ok: true }); st.style.alignSelf = 'flex-start'; await stampIn(c, st); } },
      { cap: `Calculator check, afterwards: ${T(`\\${d.fn} ${deg(d.A)}\\approx${f4(f(d.A))}`)} and ${T(`\\${d.fn} ${deg(d.B)}\\approx${f4(f(d.B))}`)}.`,
        run: async (c) => { await set(c, l4, `<span class="muted">Check:</span> ${T(`${f4(f(d.A))}`)} vs ${T(`${f4(f(d.B))}`)}`); } }
    ];
  }
};

/* =====================================================================================
 * Explainer 5: the extremes at 0° and 90° (Example 4(b))
 * ===================================================================================== */
const extremes = {
  title: 'Sweep the segment r: flat, then standing up',
  height: 450,
  intro: `A segment of length ${T('r')} rotates about ${T('O')}. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const W = ex.W, H = 450, svg = stageSvg(stage, W, H), D = new Dial(stage, svg, { ox: 64, oy: H - 52, R: 320, ticks: false, unit: 'r' });
    D.arcEl.setAttribute('stroke-dasharray', '8 6');
    const t = D.tri(40, { labels: 'sym', arcR: 50 });
    t.la.style.display = 'none';
    const al = lab(stage, 0, 0, T('a^\\circ'), 'b u9l2-r');
    const setA = (a) => { t.set(a); t.la.style.display = 'none'; const am = Math.max(a / 2, 8); mv(al, D.O[0] + 78 * Math.cos(am * RAD) + 6, D.O[1] - 78 * Math.sin(am * RAD)); al.style.display = a > 0.5 ? '' : 'none'; };
    setA(40);
    const go = (a1, ms = 1500) => (c) => { const from = t.a; return tween(c, ms, (u) => setA(from + (a1 - from) * u)); };
    const px = 480, P = panel(stage, px, 10, W - px - 8, H - 20, 'Exact values');
    const top = pline(P, T(`\\sin a^\\circ=\\frac{${cO('y')}}{${cH('r')}}\\quad\\cos a^\\circ=\\frac{${cA('x')}}{${cH('r')}}\\quad\\tan a^\\circ=\\frac{${cO('y')}}{${cA('x')}}`));
    top.style.fontSize = '22px';
    const grid = h('table', 'u9l2-tbl'); grid.style.margin = '6px 0'; P.appendChild(grid);
    grid.innerHTML = `<tr><th></th><th>${T('\\sin')}</th><th>${T('\\cos')}</th><th>${T('\\tan')}</th></tr><tr><td class="u9l2-rh">${T('0^\\circ')}</td><td></td><td></td><td></td></tr><tr><td class="u9l2-rh">${T('90^\\circ')}</td><td></td><td></td><td style="min-width:150px"></td></tr>`;
    const cell = (r, c) => grid.rows[r].cells[c];
    const fill = async (c, r, k, html) => { const d = h('div', '', html); cell(r, k).appendChild(d); await pop(c, d, 300); };
    const note = hide0(pline(P, ''));
    return [
      { cap: `Relative to ${T('a^\\circ')}: ${T(cO('y'))} is opposite, ${T(cA('x'))} is adjacent, ${T(cH('r'))} is the hypotenuse.`,
        run: async (c) => { await pulse(c, top, 1.06); } },
      { cap: `Shrink ${T('a')} toward ${T('0^\\circ')}: the triangle flattens. ${T(cO('y'))} shrinks toward ${T('0')} while ${T(cA('x'))} grows toward ${T(cH('r'))}.`, run: go(0.0001) },
      { cap: `Substitute ${T('y=0')}, ${T('x=r')}: ${T('\\sin 0^\\circ=\\frac{0}{r}=0')}, ${T('\\cos 0^\\circ=\\frac{r}{r}=1')}, ${T('\\tan 0^\\circ=\\frac{0}{r}=0')}.`,
        run: async (c) => { await fill(c, 1, 1, T('\\frac{0}{r}=\\mathbf{0}')); await fill(c, 1, 2, T('\\frac{r}{r}=\\mathbf{1}')); await fill(c, 1, 3, T('\\frac{0}{r}=\\mathbf{0}')); } },
      { cap: `Now open ${T('a')} toward ${T('90^\\circ')}: the triangle stands up straight. ${T(cA('x'))} shrinks toward ${T('0')} while ${T(cO('y'))} grows toward ${T(cH('r'))}.`, run: go(89.9999, 1900) },
      { cap: `Substitute ${T('x=0')}, ${T('y=r')}: ${T('\\sin 90^\\circ=\\frac{r}{r}=1')} and ${T('\\cos 90^\\circ=\\frac{0}{r}=0')}.`,
        run: async (c) => { await fill(c, 2, 1, T('\\frac{r}{r}=\\mathbf{1}')); await fill(c, 2, 2, T('\\frac{0}{r}=\\mathbf{0}')); } },
      { cap: `${T('\\tan 90^\\circ=\\frac{r}{0}')}: you cannot divide by ${T('0')}, so ${T('\\tan 90^\\circ')} is <b>undefined</b>. The calculator gives an error.`,
        run: async (c) => { await fill(c, 2, 3, `${T('\\frac{r}{0}')} <b class="u9l2-err">undefined</b>`); note.innerHTML = `<div class="u9l2-scr" style="max-width:260px"><div class="u9l2-s1"><span>tan(90)</span><span class="u9l2-deg">DEG</span></div><div class="u9l2-s2" style="font-size:22px">DOMAIN ERROR</div></div>`; await show(c, note); } }
    ];
  }
};

/* =====================================================================================
 * Explainer 6: the pattern (Example 4(c)): table → graph; sin and cos are mirror images
 * ===================================================================================== */
const ANGS = [0, 15, 30, 45, 60, 75, 90];
const pattern = {
  title: 'Example 4(c) check: the table, then the picture',
  height: 520,
  intro: 'Fill the table on the calculator (two decimal places), then plot it. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, cw = 84, hw = 120, tw = hw + cw * 7;
    const tb = new ValueTable(stage, { x: (W - tw) / 2, y: 4, layout: 'h', headers: ['x^\\circ', '\\sin x^\\circ', '\\cos x^\\circ'], rows: ANGS.map((a) => [deg(a), f2(sn(a)), f2(cs(a))]), hide: (r, c) => c > 0, tap: false, cellW: cw, headW: hw, cellH: 44, cls: 'u9l2-tb' });
    const G = new Graph(stage, { x: (W - 640) / 2, y: 150, width: 640, height: 360, xmin: -6, xmax: 100, ymin: -0.12, ymax: 1.18, xstep: 15, ystep: 0.25, xlabels: 15, ylabels: 0.25, xtitle: 'x^\\circ', ytitle: '', fontSize: 15 });
    const sinF = (x) => Math.sin(x * RAD), cosF = (x) => Math.cos(x * RAD);
    let cs1, cs2; const ptsS = [], ptsC = [];
    return [
      { cap: `${T('\\sin x^\\circ')} for each angle, rounded to two decimal places: ${T('\\sin 15^\\circ=0.2588\\ldots\\approx0.26')}.`,
        run: (c) => tb.fill(c, { col: 1, stagger: 120 }) },
      { cap: `Plot them: ${T('\\sin x^\\circ')} <b>increases from 0 to 1</b>, quickly at first, then levelling off near ${T('90^\\circ')}.`,
        run: async (c) => { for (const a of ANGS) { const p = G.point(a, sinF(a), { color: OPP, r: 6 }); ptsS.push(p); await pop(c, p, 160); } cs1 = G.fn(sinF, { from: 0, to: 90, color: OPP, width: 3.5, arrows: false }); await G.drawIn(cs1, 900, c); } },
      { cap: `${T('\\cos x^\\circ')} the same way: ${T('\\cos 15^\\circ=0.9659\\ldots\\approx0.97')}.`,
        run: (c) => tb.fill(c, { col: 2, stagger: 120 }) },
      { cap: `${T('\\cos x^\\circ')} <b>decreases from 1 to 0</b>. The two curves cross at ${T('45^\\circ')}, where ${T('\\sin 45^\\circ=\\cos 45^\\circ\\approx0.71')}.`,
        run: async (c) => { for (const a of ANGS) { const p = G.point(a, cosF(a), { color: ADJ, r: 6 }); ptsC.push(p); await pop(c, p, 160); } cs2 = G.fn(cosF, { from: 0, to: 90, color: ADJ, width: 3.5, arrows: false }); await G.drawIn(cs2, 900, c); } },
      { cap: `Fold the picture along ${T('x=45^\\circ')}: the curves land on each other. The rows are <b>mirror images</b>: ${T('\\sin 15^\\circ=\\cos 75^\\circ=0.26')}, ${T('\\sin 30^\\circ=\\cos 60^\\circ=0.50')} …`,
        run: async (c) => {
          const vl = G.vline(45); await G.drawIn(vl, 500, c);
          for (const [r1, r2] of [[1, 5], [2, 4]]) { tb.cell(r1, 1).classList.add('u9l2-pair'); tb.cell(r2, 2).classList.add('u9l2-pair'); await pulse(c, tb.cell(r1, 1), 1.12); await pulse(c, tb.cell(r2, 2), 1.12); }
        } }
    ];
  }
};

/* =====================================================================================
 * Explainer 7 (Extension): tangent near 90°
 * ===================================================================================== */
const TROWS = [45, 80, 89, 89.9, 89.99];
const tan90 = {
  title: 'Extension: tangent near 90°',
  height: 470,
  intro: 'Tangent is opp ÷ adj. What happens when adj gets really small? Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, H = 470;
    const G = new Graph(stage, { x: 6, y: 10, width: 470, height: 450, xmin: -16, xmax: 96, ymin: -0.6, ymax: 6.6, xstep: 15, ystep: 1, xlabels: 30, xtitle: 'x^\\circ', ytitle: '\\tan x^\\circ', fontSize: 15, grid: true });
    const tanF = (x) => (x >= 90 ? NaN : Math.tan(x * RAD));
    const px = 500, P = panel(stage, px, 10, W - px - 8, H - 20, 'tan x = opp ÷ adj (hyp 1)');
    const tbl = h('table', 'u9l2-tbl'); tbl.style.margin = '2px 0'; tbl.style.fontSize = '18px'; P.appendChild(tbl);
    tbl.innerHTML = `<tr><th>${T('x^\\circ')}</th><th>${T(cO('\\text{opp}'))}</th><th>${T(cA('\\text{adj}'))}</th><th>${T(cT('\\tan x^\\circ'))}</th></tr>`;
    const adjTxt = (a) => { const c = cs(a); return c >= 0.1 ? f4(c) : c.toPrecision(4); };
    const row = (a) => { const tr = tbl.insertRow(); tr.innerHTML = `<td>${T(deg(a))}</td><td>${T(f4(sn(a)))}</td><td>${T(adjTxt(a))}</td><td>${T(thin(f2(tn(a))))}</td>`; tr.style.opacity = 0; return tr; };
    const rows = TROWS.map(row);
    const last = tbl.insertRow(); last.innerHTML = `<td>${T('90^\\circ')}</td><td>${T('1')}</td><td>${T('0')}</td><td><b class="u9l2-err">undefined</b></td>`; last.style.opacity = 0;
    let curve;
    const pt = (a) => G.point(a, tn(a), { color: TAN, r: 6 });
    const zoom = (ymax, ys) => (c) => G.setWindow({ ymin: -ymax * 0.09, ymax, yscl: ys }, c, 1100);
    return [
      { cap: `Up to ${T('45^\\circ')} the tangent grows slowly: ${T('\\tan 45^\\circ=1')} (opp ${T('=')} adj). At ${T('80^\\circ')}, ${T(`\\tan 80^\\circ=${f4(sn(80))}\\div${f4(cs(80))}=${f2(tn(80))}`)}.`,
        run: async (c) => { curve = G.fn(tanF, { from: 0, to: 89.9999, color: TAN, width: 3.5, samples: 3000 }); await G.drawIn(curve, 1000, c); for (const i of [0, 1]) { await pop(c, pt(TROWS[i]), 200); await appear(c, rows[i], 250); } } },
      { cap: `${T('89^\\circ')}: the ${bA('adjacent')} side is only ${T(adjTxt(89))}. ${T(`\\tan 89^\\circ\\approx${f2(tn(89))}`)}. Zoom out ×10 to see it.`,
        run: async (c) => { await zoom(66, 10)(c); await pop(c, pt(89), 200); await appear(c, rows[2], 250); } },
      { cap: `${T('89.9^\\circ')}: adj ${T(`\\approx${adjTxt(89.9)}`)}, ${T(`\\tan 89.9^\\circ\\approx${f2(tn(89.9))}`)}, ten times bigger again. Zoom out ×10.`,
        run: async (c) => { await zoom(660, 100)(c); await pop(c, pt(89.9), 200); await appear(c, rows[3], 250); } },
      { cap: `${T('89.99^\\circ')}: ${T(`\\tan 89.99^\\circ\\approx${thin(f2(tn(89.99)))}`)}. Every zoom-out, the curve is <b>still</b> shooting off the top.`,
        run: async (c) => { await zoom(6600, 1000)(c); await pop(c, pt(89.99), 200); await appear(c, rows[4], 250); } },
      { cap: `At ${T('90^\\circ')} the adjacent side is ${T('0')}: ${T('\\frac{1}{0}')} is <b>undefined</b>. As ${T('x^\\circ')} increases toward ${T('90^\\circ')}, ${T('\\tan x^\\circ')} <b>increases without bound</b>.`,
        run: async (c) => { const vl = G.vline(90, { color: ANG }); await G.drawIn(vl, 500, c); await appear(c, last, 300); } }
    ];
  }
};

/* =====================================================================================
 * Explainer 8 (Extension): sin x = cos(90 − x) in triangle DEF
 * ===================================================================================== */
const COF = { gen: { label: 'Example 5(b): why', x: null }, c1: { label: '5(c)(i): sin 63°', x: 63 }, c2: { label: '5(c)(ii): sin 9°', x: 9 } };
const cofn = {
  title: 'One side, two names',
  height: 440,
  choices: Object.keys(COF).map((k) => ({ v: k, label: COF[k].label })),
  intro: 'Triangle DEF: right angle at D, angle x at F. Press <b>Next</b>.',
  make(stage, key, ex) {
    const W = ex.W, H = 440, svg = stageSvg(stage, W, H), d = COF[key], x = d.x;
    const ang = x ?? Math.atan(2.101 / 3) / RAD; // booklet shape for the general case
    const DF = 1, DE = Math.tan(ang * RAD), sc = Math.min(400 / DF, 330 / DE), Dp = [70, 390], Fp = [70 + DF * sc, 390], Ep = [70, 390 - DE * sc];
    svgEl('polygon', { points: [Dp, Fp, Ep].map((p) => p.join(',')).join(' '), fill: '#fbfaf6' }, svg);
    const sDE = ln(svg, Dp, Ep, { color: INK, width: 3 }), sDF = ln(svg, Dp, Fp, { color: INK, width: 3 }), sEF = ln(svg, Ep, Fp, { color: INK, width: 3 });
    rightMark(svg, Dp, Fp, Ep, 14, { color: INK });
    const aF = angleArc(svg, Fp, Dp, Ep, 44, { color: ANG, width: 3 }), aE = hide0(angleArc(svg, Ep, Dp, Fp, 44, { color: ANG, width: 3 }));
    const bis = (V, P, Q, r) => { const u = norm2(P[0] - V[0], P[1] - V[1]), v = norm2(Q[0] - V[0], Q[1] - V[1]), b = norm2(u[0] + v[0], u[1] + v[1]); return [V[0] + b[0] * r, V[1] + b[1] * r]; };
    const xT = x == null ? 'x^\\circ' : deg(x), eT = x == null ? '(90-x)^\\circ' : deg(90 - x);
    const lF = lab(stage, ...(ang < 20 ? [Fp[0] - 74, Fp[1] - 30] : bis(Fp, Dp, Ep, 76)), T(xT), 'b u9l2-r');
    const lE = hide0(lab(stage, ...bis(Ep, Dp, Fp, x != null && x < 20 ? 64 : 96), T(eT), 'b u9l2-r halo'));
    lab(stage, Dp[0] - 16, Dp[1] + 14, T('D'), 'b'); lab(stage, Fp[0] + 16, Fp[1] + 14, T('F'), 'b'); lab(stage, Ep[0], Ep[1] - 18, T('E'), 'b');
    const mDE = lerp(Dp, Ep, 0.5), mDF = lerp(Dp, Fp, 0.5), mEF = lerp(Ep, Fp, 0.5), nEF = norm2(Ep[1] - Fp[1], Fp[0] - Ep[0]);
    const tgDE = hide0(tag(stage, mDE[0] - 40, mDE[1], 'opp', OPP)), tgDF = hide0(tag(stage, mDF[0], mDF[1] + 26, 'adj', ADJ)), tgEF = hide0(tag(stage, mEF[0] - nEF[0] * 30, mEF[1] - nEF[1] * 30, 'hyp', HYP));
    const col = (el, c) => { el.setAttribute('stroke', c); el.setAttribute('stroke-width', 6); };
    const px = Math.max(520, Fp[0] + 60), P = panel(stage, px, 10, W - px - 8, H - 20, 'Two angles, one triangle');
    const l0 = hide0(pline(P, '')), l1 = hide0(pline(P, '')), l2 = hide0(pline(P, '')), l3 = hide0(pline(P, '', 'u9l2-big')), l4 = hide0(pline(P, ''));
    const set = async (c, el, html) => { el.innerHTML = html; await show(c, el); };
    const fx = x == null ? 'x' : String(x), fy = x == null ? '(90-x)' : String(90 - x);
    const steps = [
      { cap: `The angles add to ${T('180^\\circ')} and ${T('\\angle D=90^\\circ')}, so ${T(`\\angle E=180^\\circ-90^\\circ-${xT}=${eT}`)}.`,
        run: async (c) => { await appear(c, aE, 300); await pop(c, lE); await set(c, l0, T(`\\angle E=${eT}`)); } },
      { cap: `Stand at ${T('F')} (angle ${T(xT)}). ${T('DE')} is ${bO('opposite')}, ${T('EF')} is the ${bH('hypotenuse')}: ${T(`\\sin ${fx}^\\circ=\\dfrac{${cO('DE')}}{${cH('EF')}}`)}.`,
        run: async (c) => { col(sDE, OPP); col(sDF, ADJ); col(sEF, HYP); await pop(c, tgDE); await pop(c, tgDF); await pop(c, tgEF); await pulse(c, lF, 1.3); await set(c, l1, T(`\\sin ${fx}^\\circ=\\dfrac{${cO('DE')}}{${cH('EF')}}`)); } },
      { cap: `Walk to ${T('E')} (angle ${T(eT)}). The <b>same side</b> ${T('DE')} is now ${bA('adjacent')}: ${T(`\\cos ${fy}^\\circ=\\dfrac{${cA('DE')}}{${cH('EF')}}`)}.`,
        run: async (c) => {
          col(sDE, ADJ); col(sDF, OPP); tgDE.textContent = 'adj'; tgDE.style.background = ADJ; tgDF.textContent = 'opp'; tgDF.style.background = OPP;
          aF.setAttribute('opacity', 0.3); lF.style.opacity = 0.4; await pop(c, tgDE); await pop(c, tgDF); await pulse(c, lE, 1.3);
          await set(c, l2, T(`\\cos ${fy}^\\circ=\\dfrac{${cA('DE')}}{${cH('EF')}}`));
        } },
      { cap: `Same fraction ${T('\\frac{DE}{EF}')}, so ${T(x == null ? '\\sin x^\\circ=\\cos(90-x)^\\circ' : `\\sin ${deg(x)}=\\cos ${deg(90 - x)}`)}. The “co” in cosine means “of the <b>co</b>mplement”.`,
        run: async (c) => { await set(c, l3, `<b>${T(x == null ? '\\sin x^\\circ=\\cos(90-x)^\\circ' : `\\sin ${deg(x)}=\\cos ${deg(90 - x)}`)}</b>`); const st = stamp(P, '✓', { ok: true }); st.style.alignSelf = 'flex-start'; await stampIn(c, st); } }
    ];
    if (x != null) steps.push({ cap: `Calculator check: ${T(`\\sin ${deg(x)}\\approx${f4(sn(x))}`)} and ${T(`\\cos ${deg(90 - x)}\\approx${f4(cs(90 - x))}`)} ✓`,
      run: async (c) => { await set(c, l4, `<span class="muted">Check:</span> ${T(`${f4(sn(x))}=${f4(cs(90 - x))}`)}`); } });
    return steps;
  }
};

/* =====================================================================================
 * "Try any angle" playground (not an explainer: a slider and buttons)
 * ===================================================================================== */
function mountPlay() {
  const host = document.getElementById('u9l2-play'), ctl = document.getElementById('u9l2-ctl'); if (!host || !ctl) return;
  const build = () => {
    host.innerHTML = '';
    const W = host.clientWidth || 980, H = 470, ex = { W };
    const { D, B, rd } = dialStage(host, ex, H, BAR3);
    const t = D.tri(30, { labels: 'val' });
    return { D, B, rd, t };
  };
  let S = build(), cur = 30;
  const set = (a) => { cur = a; S.t.set(a); setBars3(S.B, a); S.rd.innerHTML = 'x = ' + (Math.round(a * 10) / 10) + '°'; rng.value = Math.round(a); cv.textContent = Math.round(a) + '°'; };
  const rng = h('input'); rng.type = 'range'; rng.min = 0; rng.max = 90; rng.step = 1; rng.value = 30; rng.setAttribute('aria-label', 'Angle in degrees');
  const cv = h('span', 'u9l2-cv', '30°');
  rng.oninput = () => set(+rng.value);
  ctl.append(rng, cv);
  let gen = 0;
  const glide = (a1) => { const g = ++gen, from = cur, lc = liveCtx(); tween(lc, 700, (u) => { if (g !== gen) return false; set(from + (a1 - from) * u); }); };
  for (const a of [0, 15, 30, 45, 60, 75, 90]) { const b = h('button', 'pill small', a + '°'); b.type = 'button'; b.onclick = () => glide(a); ctl.appendChild(b); }
  const sw = h('button', 'pill', 'Swap x ↔ 90° − x'); sw.type = 'button'; sw.onclick = () => glide(90 - Math.round(cur)); ctl.appendChild(sw);
  set(30);
  let lastW = host.clientWidth; new ResizeObserver(() => { if (Math.abs(host.clientWidth - lastW) > 2) { lastW = host.clientWidth; S = build(); set(cur); } }).observe(host);
}

/* =============================== mount =============================== */
mountWarm();
mountFigs();
mountPlay();
export const explainers = mountExplainers({ calc, rescale, dial, compare, extremes, pattern, tan90, cofn });
export const _test = { CALC, CMP, COF, scr, sn, cs, tn };
