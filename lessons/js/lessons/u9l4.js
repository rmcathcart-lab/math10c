/* Math 10C · Unit 9 · Lesson 4 — Finding the Measure of an Angle in a Right Triangle.
 * Warm-up (roof pitch: four houses, the 24/12 roof built on demand, every roof angle), static figures (booklet
 * diagrams), and the explainers:
 *   backwards (the star: the calculator run backwards; angle → ratio with sin, ratio → angle with sin⁻¹, the triangle
 *   reshaping as it goes; Example 1 checks), readBack (the ratio graphs read forwards and backwards; sin⁻¹(1.2) has no
 *   angle), nameFirst (name the sides from the angle, then SOH CAH TOA, then the inverse; naming example and
 *   Example 2 checks), sunElev (flagpole and shadow; elevation from the horizontal, not the vertical; the sun climbs),
 *   cliffZ (the star: cliff and kayak; the two horizontals and the line of sight make a Z, so depression = elevation;
 *   paddling in keeps them equal; Example 4 check), isoSplit (no right angle → drop the perpendicular, fold, solve half,
 *   double; Example 5 and a roof gable), chain (two right triangles sharing AD; Example 6 check), choose (flowchart:
 *   which inverse ratio, for every example).
 * Colours (whole unit): opposite purple, adjacent amber, hypotenuse blue, the reference angle red. */
import {
  h, tex, add, box, Box, Graph, Flowchart, RightTriangle, stamp, stampIn, checkCard, mountExplainers, pop, fadeIn, appear,
  sleep, tween, svgEl, angleArc, rightMark, liveCtx, pulse, anim, drawIn, place, texNum, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const OPP = COLORS.purple, ADJ = COLORS.amber, HYP = COLORS.blue, ANG = COLORS.red, INK = COLORS.ink, GRAY = COLORS.gray, ZC = COLORS.orange;
const DEG = Math.PI / 180;
const fx = (v, d = 2) => v.toFixed(d);
const dg = (v, d = 2) => `${fx(v, d)}^\\circ`;
const FN = { sin: Math.sin, cos: Math.cos, tan: Math.tan }, INV = { sin: Math.asin, cos: Math.acos, tan: Math.atan };
const fwd = (fn, a) => FN[fn](a * DEG);
const inv = (fn, k) => INV[fn](k) / DEG;
const KEY = { sin: 'SIN', cos: 'COS', tan: 'TAN' }, SCH = { sin: 'SOH', cos: 'CAH', tan: 'TOA' };
const PAIR = { sin: ['opp', 'hyp'], cos: ['adj', 'hyp'], tan: ['opp', 'adj'] };
const SC = { opp: OPP, adj: ADJ, hyp: HYP }, WORD = { opp: 'OPP', adj: 'ADJ', hyp: 'HYP' }, LONG = { opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' };
const cw = (k, txt) => `<b style="color:${SC[k]}">${txt || WORD[k]}</b>`;
const fnOf = (known) => (known.opp != null && known.hyp != null ? 'sin' : known.adj != null && known.hyp != null ? 'cos' : 'tan');
/** TI-30XIIS key chips: kb('2nd SIN .4217 ) ENTER') */
const kb = (s) => `<span class="u9l4-keys">${s.split(' ').map((k) => `<kbd>${k}</kbd>`).join('')}</span>`;
const lab = (host, x, y, html, cls = '') => { const d = h('div', 'u9l4-abs ' + cls, html); d.style.left = x + 'px'; d.style.top = y + 'px'; host.appendChild(d); return d; };
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u9l4-panel', title ? `<div class="u9l4-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u9l4-line ' + cls, html); p.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const hide0 = (el) => { if (el) el.style.opacity = 0; return el; };
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

/* ======================================================================================
 * Fig: a world-coordinate drawing (equal scale) on a Box, for the booklet figures and the scenes
 * ====================================================================================== */
class Fig extends Box {
  /** o: { x, y, width, height, win: [xmin, xmax, ymin, ymax], pad } */
  constructor(host, o) {
    super(host, o, 'u9l4-fig', o.width, o.height);
    const [x0, x1, y0, y1] = o.win, pad = o.pad ?? 26, W = o.width, H = o.height;
    this.s = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (y1 - y0));
    this.ox = (W - this.s * (x1 - x0)) / 2 - this.s * x0; this.oy = (H + this.s * (y1 - y0)) / 2 + this.s * y0;
    this.gBg = this.layer('bg'); this.gMain = this.layer('main'); this.gTop = this.layer('top');
  }
  P(p) { return [this.ox + this.s * p[0], this.oy - this.s * p[1]]; }
  path(pts, o = {}) {
    const q = pts.map((p) => this.P(p)), d = 'M' + q.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + (o.closed ? 'Z' : '');
    const a = { class: 'bk-stroke ' + (o.cls || ''), d, stroke: o.color || INK, 'stroke-width': o.width || 3, fill: o.fill || 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    if (o.dash) a['stroke-dasharray'] = o.dash === true ? '9 7' : o.dash;
    if (o.fill) a['fill-opacity'] = o.fo ?? 1;
    if (o.op != null) a['stroke-opacity'] = o.op;
    return svgEl('path', a, o.layer || this.gMain);
  }
  seg(a, b, o = {}) { return this.path([a, b], o); }
  poly(pts, o = {}) { return this.path(pts, Object.assign({ closed: true, width: 0, color: 'none' }, o)); }
  dot(p, o = {}) { const q = this.P(p); return svgEl('circle', { cx: q[0], cy: q[1], r: o.r || 5, fill: o.color || INK }, o.layer || this.gTop); }
  right(V, P, Q, o = {}) { return rightMark(o.layer || this.gMain, this.P(V), this.P(P), this.P(Q), o.s || 14, { color: o.color || INK }); }
  /** an angle at V between rays V→P and V→Q: light wedge, arc, label on the bisector */
  wedge(V, P, Q, r, o = {}) {
    const v = this.P(V), p = this.P(P), q = this.P(Q), g = svgEl('g', { class: 'bk-curve u9l4-wedge' }, o.layer || this.gTop), color = o.color || ANG;
    const a1 = Math.atan2(p[1] - v[1], p[0] - v[0]); let d = Math.atan2(q[1] - v[1], q[0] - v[0]) - a1;
    while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    const s = [v[0] + r * Math.cos(a1), v[1] + r * Math.sin(a1)], e = [v[0] + r * Math.cos(a1 + d), v[1] + r * Math.sin(a1 + d)];
    if (o.fill !== false) svgEl('path', { d: `M${v[0]} ${v[1]}L${s[0]} ${s[1]}A${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${e[0]} ${e[1]}Z`, fill: color, 'fill-opacity': o.fo ?? 0.15, stroke: 'none' }, g);
    angleArc(g, v, p, q, r, { color, width: o.width || 3 });
    if (o.label != null) {
      const m = a1 + d / 2, off = r + (o.off ?? 18);
      g.label = this.hlabel(v[0] + Math.cos(m) * off, v[1] + Math.sin(m) * off, o.label, { cls: 'u9l4-anglab' + (o.lcls ? ' ' + o.lcls : ''), color, parent: o.parent });
    }
    return g;
  }
  /** a label at a world point (px offsets dx, dy) */
  lab(p, html, o = {}) { const q = this.P(p); return this.hlabel(q[0] + (o.dx || 0), q[1] + (o.dy || 0), html, { cls: o.cls || 'u9l4-flab', color: o.color, pos: o.pos, parent: o.parent }); }
  /** a side label: beside the midpoint of a–b, on the side away from the world point `away` */
  sideLab(a, b, html, o = {}) {
    const A = this.P(a), B = this.P(b), m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], aw = this.P(o.away || [0, 0]);
    let [nx, ny] = norm(-(B[1] - A[1]), B[0] - A[0]); if (nx * (aw[0] - m[0]) + ny * (aw[1] - m[1]) > 0) { nx = -nx; ny = -ny; }
    const off = o.off ?? 22, t = o.t ?? 0.5, px = A[0] + (B[0] - A[0]) * t, py = A[1] + (B[1] - A[1]) * t;
    return this.hlabel(px + nx * off, py + ny * off, html, { cls: o.cls || 'u9l4-slab', color: o.color, parent: o.parent });
  }
  /** equal-length tick(s) across the middle of a–b */
  tick(a, b, o = {}) {
    const A = this.P(a), B = this.P(b), m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], [ux, uy] = norm(B[0] - A[0], B[1] - A[1]), n = [-uy, ux], L = 8;
    return svgEl('path', { d: `M${m[0] - n[0] * L} ${m[1] - n[1] * L}L${m[0] + n[0] * L} ${m[1] + n[1] * L}`, stroke: o.color || INK, 'stroke-width': 2.5, fill: 'none' }, o.layer || this.gTop);
  }
}

/* ======================================================================================
 * Warm-up: roof pitch
 * ====================================================================================== */
function mountRoofs() {
  const host = document.getElementById('u9l4-roofs'); if (!host) return;
  const W = Math.max(860, host.clientWidth || 980), H = 372;
  const B = new Box(host, {}, 'u9l4-roofbox', W, H);
  const gy = 322, wallH = 80, hs = 96, u = hs / 12, ey = gy - wallH;
  svgEl('rect', { x: 0, y: gy, width: W, height: H - gy, fill: '#d9ead0' }, B.svg);
  svgEl('path', { d: `M0 ${gy}H${W}`, stroke: '#1e2d46', 'stroke-width': 2.5 }, B.svg);
  const P = [4, 6, 12, 24], roofG = [], angEls = [];
  let built = false, mystery;
  const cxOf = (i) => W * (0.125 + 0.25 * i);
  function drawRoof(g, cx, p) {
    g.innerHTML = '';
    if (p <= 0) return;
    const py = ey - p * u;
    svgEl('path', { d: `M${cx - hs - 10} ${ey + 10 * p / 12}L${cx} ${py}L${cx + hs + 10} ${ey + 10 * p / 12}L${cx + hs} ${ey}H${cx - hs}Z`, fill: '#be6e50', stroke: '#1e2d46', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    svgEl('path', { d: `M${cx} ${ey}V${py}`, stroke: '#fff', 'stroke-width': 2.4, 'stroke-dasharray': '6 5' }, g);
    svgEl('path', { d: `M${cx - hs} ${ey}H${cx}`, stroke: '#fff', 'stroke-width': 2.4 }, g);
    const t = svgEl('text', { x: cx + 6, y: (ey + py) / 2 + 7, class: 'u9l4-rise' }, g); t.textContent = p;
  }
  P.forEach((p, i) => {
    const cx = cxOf(i);
    svgEl('rect', { x: cx - 84, y: ey, width: 168, height: wallH, fill: '#ffecb3', stroke: '#1e2d46', 'stroke-width': 2 }, B.svg);
    svgEl('rect', { x: cx - 13, y: gy - 42, width: 26, height: 42, fill: '#fff', stroke: '#1e2d46', 'stroke-width': 1.6 }, B.svg);
    for (const wx of [cx - 66, cx + 36]) svgEl('rect', { x: wx, y: ey + 16, width: 30, height: 24, fill: '#e8f0fc', stroke: '#1e2d46', 'stroke-width': 1.6 }, B.svg);
    const t = svgEl('text', { x: cx - hs / 2, y: ey + 13, class: 'u9l4-run' }, B.svg); t.textContent = '12';
    const g = svgEl('g', {}, B.svg); roofG.push(g);
    if (i < 3) drawRoof(g, cx, p);
    B.hlabel(cx, gy + 26, `${p}/12`, { cls: 'u9l4-pitch' });
    // the roof angle at the left eave
    const a = Math.atan(p / 12), ag = svgEl('g', { class: 'u9l4-rang' }, B.svg);
    angleArc(ag, [cx - hs, ey], [cx, ey], [cx, ey - p * u], 30, { color: ANG, width: 3 });
    const lx = cx - hs + Math.cos(a) * 70 - Math.sin(a) * 24, ly = ey - Math.sin(a) * 70 - Math.cos(a) * 24;
    const L = B.hlabel(lx, ly, `${fx(Math.atan(p / 12) / DEG, 1)}°`, { cls: 'u9l4-rangl' });
    ag.style.opacity = 0; L.style.opacity = 0; angEls.push([ag, L]);
  });
  const mx = cxOf(3);
  mystery = svgEl('g', {}, B.svg);
  svgEl('rect', { x: mx - hs - 6, y: ey - 196, width: 2 * hs + 12, height: 186, fill: '#fff6f4', stroke: ANG, 'stroke-width': 2.5, 'stroke-dasharray': '9 6', rx: 10 }, mystery);
  const q = svgEl('text', { x: mx, y: ey - 78, class: 'u9l4-qmark' }, mystery); q.textContent = '?';
  const c = liveCtx();
  async function build() {
    if (built) return; built = true;
    await anim(c, mystery, [{ opacity: 1 }, { opacity: 0 }], 300);
    await tween(c, 1300, (t) => drawRoof(roofG[3], mx, 24 * t));
  }
  const bR = document.getElementById('u9l4-wroof'), bA = document.getElementById('u9l4-wang');
  if (bR) bR.addEventListener('click', build);
  if (bA) bA.addEventListener('click', async () => {
    await build();
    for (const [g, L] of angEls) { await Promise.all([appear(c, g, 300), pop(c, L, 320)]); await sleep(c, 120); }
  });
}

/* ======================================================================================
 * Static figures (booklet diagrams)
 * ====================================================================================== */
function tri(host, o) {
  const t = new RightTriangle(host, Object.assign({ pad: 44 }, o));
  Object.values(t.vLabs).forEach((e) => e.remove());
  return t;
}
function mountFigs() {
  const el = (id) => document.getElementById(id);
  if (el('u9l4-figN')) { const t = tri(el('u9l4-figN'), { width: 320, height: 260, base: 4, rise: 3, right: 'bl', names: { right: 'R', base: 'X', top: 'Y' }, sides: { x: '21', r: '35' } }); t.angle('Y', 'p^\\circ', { color: ANG, r: 30 }); }
  if (el('u9l4-fig2a')) { const t = tri(el('u9l4-fig2a'), { width: 250, height: 290, base: 2.05, rise: 4, right: 'bl', names: { right: 'R', base: 'X', top: 'Y' }, sides: { y: '5', r: '11' } }); t.angle('Y', 'a^\\circ', { color: ANG, r: 34 }); }
  if (el('u9l4-fig2b')) { const t = tri(el('u9l4-fig2b'), { width: 270, height: 290, base: 2.935, rise: 3.412, right: 'bl', names: { right: 'R', base: 'X', top: 'Y' }, sides: { y: '15', r: '23' } }); t.angle('X', 'b^\\circ', { color: ANG, r: 34 }); }
  if (el('u9l4-fig2c')) { const t = tri(el('u9l4-fig2c'), { width: 280, height: 260, base: 3.62, rise: 2.67, right: 'tl', names: { right: 'R', base: 'Z', top: 'Q' }, sides: { z: '14', q: '19' } }); t.angle('Q', 'c^\\circ', { color: ANG, r: 34 }); }
  if (el('u9l4-figED')) {
    const F = new Fig(el('u9l4-figED'), { width: 470, height: 250, win: [-1.6, 6.6, -0.6, 3.6], pad: 10 });
    const H = [0, 3], K = [5, 0];
    F.seg(H, [6.2, 3], { dash: true, width: 2.4 }); F.seg([-1.2, 0], K, { dash: true, width: 2.4 }); F.seg(H, K, { width: 3.5 });
    F.wedge(H, [1, 3], K, 52, { color: ANG }); F.wedge(K, [4, 0], H, 52, { color: ANG });
    F.lab([3.0, 2.5], 'angle of<br>depression', { cls: 'u9l4-flab u9l4-sm' }); F.lab([2.15, 0.5], 'angle of<br>elevation', { cls: 'u9l4-flab u9l4-sm' });
    F.lab([6.2, 3], 'horizontal line', { pos: 'n', cls: 'u9l4-flab u9l4-sm', dx: -40 }); F.lab([-1.2, 0], 'horizontal line', { pos: 's', cls: 'u9l4-flab u9l4-sm', dx: 40 });
    F.dot(H); F.dot(K); F.lab(H, 'observer', { pos: 'n' }); F.lab(K, 'object', { pos: 's' });
  }
  if (el('u9l4-fig3')) {
    const F = new Fig(el('u9l4-fig3'), { width: 380, height: 250, win: [-1.2, 4.0, -0.5, 2.7], pad: 10 });
    const B = [0, 0], Tp = [0, 2.57], S = [3.69, 0];
    F.seg(B, Tp); F.seg(B, S); F.seg(S, Tp, { dash: true, width: 2.4 }); F.right(B, Tp, S);
    F.lab([0, 1.285], T('6.4') + ' m', { pos: 'w' }); F.lab([1.845, 0], T('9.2') + ' m', { pos: 's' });
    F.wedge(S, B, Tp, 40, { label: T('\\theta^\\circ'), off: 16 });
  }
  if (el('u9l4-fig4a')) cliffFig(el('u9l4-fig4a'));
  if (el('u9l4-fig5')) isoFig(el('u9l4-fig5'), false);
  if (el('u9l4-fig5b')) isoFig(el('u9l4-fig5b'), true);
  if (el('u9l4-fig6')) {
    const F = new Fig(el('u9l4-fig6'), { width: 440, height: 250, win: [-0.3, 6.4, -0.4, 3.1], pad: 10 });
    const B = [0, 0], D = [0.643, 0], C = [6, 0], A = [0.643, 2.857];
    F.seg(B, C); F.seg(A, B); F.seg(A, D); F.seg(A, C); F.right(D, B, A, { s: 11 });
    F.lab(A, T('A'), { pos: 'n' }); F.lab(B, T('B'), { pos: 'sw' }); F.lab(D, T('D'), { pos: 's', dx: 10 }); F.lab(C, T('C'), { pos: 'se' });
    F.lab([0.32, 0], T('9'), { pos: 's', dx: -4 }); F.sideLab(A, B, T('41'), { away: [3, 0] }); F.sideLab(A, C, T('85'), { away: [0.6, 0] });
  }
}
function cliffFig(host) {
  const F = new Fig(host, { width: 420, height: 230, win: [-1.0, 6.6, -0.6, 2.7], pad: 8 });
  const B = [0, 0], Tp = [0, 2.19], K = [5, 0];
  F.seg(Tp, B); F.seg(B, K); F.seg(Tp, K); F.seg(Tp, [5.7, 2.19], { dash: true, width: 2.4 }); F.right(B, Tp, K, { s: 12 });
  F.lab([0, 1.1], T('68') + ' m', { pos: 'w' }); F.lab([2.5, 0], T('155') + ' m', { pos: 's' }); F.lab([5.7, 2.19], 'horizontal', { pos: 'n', dx: -30, cls: 'u9l4-flab u9l4-sm' });
  F.wedge(Tp, [1, 2.19], K, 46, { label: T('\\alpha^\\circ'), off: 22 });
  F.dot(K); F.lab(K, 'kayaker', { pos: 'se', cls: 'u9l4-flab u9l4-sm' });
}
function isoFig(host, split) {
  const F = new Fig(host, { width: split ? 330 : 400, height: split ? 210 : 250, win: [-4.6, 4.6, -0.6, 4.3], pad: 6 });
  const Pp = [-4, 0], Q = [0, 3.83], R = [4, 0], M = [0, 0];
  F.path([Pp, Q, R], { closed: true });
  F.lab(Q, T('Q'), { pos: 'n' }); F.lab(Pp, T('P'), { pos: 'sw' }); F.lab(R, T('R'), { pos: 'se' });
  if (!split) {
    F.sideLab(Pp, Q, T('18') + ' cm', { away: [0, 1], off: 30 }); F.sideLab(Q, R, T('18') + ' cm', { away: [0, 1], off: 30 });
    F.lab([0, 0], T('26') + ' cm', { pos: 's' }); F.tick(Pp, Q); F.tick(Q, R);
  } else {
    F.seg(Q, M, { dash: true, width: 2.4 }); F.right(M, R, Q, { s: 11 }); F.lab(M, T('M'), { pos: 's' });
    F.sideLab(Pp, Q, T('18'), { away: [0, 1] }); F.lab([-2.1, 0], T('13'), { pos: 's' });
  }
}

/* ======================================================================================
 * Explainer 1 (the star): the calculator run backwards
 * ====================================================================================== */
const BW = {
  demo: { label: 'Demo: sin 30° and back', items: [{ fn: 'sin', dir: 'f', a: 30 }, { fn: 'sin', dir: 'b', k: 0.5, ks: '0.5', keys: '.5' }, { fn: 'sin', dir: 'b', k: 0.8, ks: '0.8', keys: '.8' }], notInv: true },
  ex1a: { label: 'Example 1(a) check', items: [{ fn: 'sin', dir: 'f', a: 79, nm: '(i)' }, { fn: 'tan', dir: 'f', a: 11, nm: '(ii)' }, { fn: 'cos', dir: 'f', a: 52, nm: '(iii)' }] },
  ex1b: { label: 'Example 1(b) check', items: [
    { fn: 'sin', dir: 'b', k: 0.4217, ks: '0.4217', keys: '.4217', v: 'a^\\circ', nm: '(i)' },
    { fn: 'cos', dir: 'b', k: 0.6820, ks: '0.6820', keys: '.6820', v: 'b^\\circ', nm: '(ii)' },
    { fn: 'tan', dir: 'b', k: 2.75, ks: '2.7500', keys: '2.75', v: '\\angle P', nm: '(iii)' },
    { fn: 'sin', dir: 'b', k: 0.6, ks: '\\tfrac{3}{5}', keys: '3 ÷ 5', v: '\\angle C', nm: '(iv)' }] }
};
const backwards = {
  title: 'The calculator run backwards',
  height: 480,
  choices: Object.keys(BW).map((k) => ({ v: k, label: BW[k].label })),
  intro: 'Forwards, an angle goes in and a ratio comes out. Can the calculator run the other way? Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = BW[key], W = ex.W, H = 480, TW = 330;
    const items = d.items.map((it) => {
      const o = Object.assign({}, it);
      if (it.dir === 'f') { o.val = fwd(it.fn, it.a); o.vs = texNum(o.val, 4); o.ang = it.a; }
      else { o.ang = inv(it.fn, it.k); o.exact = Math.abs(o.ang - Math.round(o.ang)) < 1e-6; }
      o.angS = o.exact || it.dir === 'f' ? `${Math.round(o.ang)}^\\circ` : dg(o.ang);
      return o;
    });
    // ---- the triangle (left) ----
    const tb = new Box(stage, { x: 8, y: 8 }, 'u9l4-tribox', TW, H - 16);
    const gT = svgEl('g', {}, tb.svg), labs = h('div', 'u9l4-tlabs'); tb.html.appendChild(labs);
    const st = { th: 40, fn: items[0].fn, angLab: '?' };
    const Vx = 30, Vy = 362;
    function drawTri() {
      gT.innerHTML = ''; labs.innerHTML = '';
      const r = st.th * DEG; let adj, opp;
      if (st.fn === 'tan') { adj = Math.min(250, 300 / Math.tan(r)); opp = adj * Math.tan(r); } else { adj = 270 * Math.cos(r); opp = 270 * Math.sin(r); }
      const V = [Vx, Vy], R = [Vx + adj, Vy], U = [Vx + adj, Vy - opp], used = PAIR[st.fn];
      const sides = { adj: [V, R], opp: [R, U], hyp: [V, U] };
      for (const k of ['adj', 'opp', 'hyp']) {
        const on = used.includes(k), [a, b] = sides[k];
        svgEl('path', { d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, stroke: on ? SC[k] : GRAY, 'stroke-width': on ? 5 : 2.5, 'stroke-linecap': 'round', fill: 'none' }, gT);
        if (on) {
          const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], off = k === 'adj' ? [0, 22] : k === 'opp' ? [30, 0] : [-30, -18];
          tb.hlabel(m[0] + off[0], m[1] + off[1], WORD[k].toLowerCase(), { cls: 'u9l4-ttag', color: SC[k], parent: labs });
        }
      }
      if (opp > 20 && adj > 20) rightMark(gT, R, V, U, 13, { color: INK });
      const g = svgEl('g', {}, gT);
      svgEl('path', { d: `M${Vx} ${Vy}L${Vx + 50} ${Vy}A50 50 0 0 0 ${Vx + 50 * Math.cos(r)} ${Vy - 50 * Math.sin(r)}Z`, fill: ANG, 'fill-opacity': 0.15 }, g);
      angleArc(g, V, R, U, 50, { color: ANG, width: 3 });
      tb.hlabel(Vx + 78 * Math.cos(r / 2) + 8, Vy - 78 * Math.sin(r / 2), st.angLab === '?' ? '?' : T(st.angLab), { cls: 'u9l4-anglab', color: ANG, parent: labs });
      const [p, q] = used, val = fwd(st.fn, st.th);
      tb.hlabel(TW / 2, Vy + 62, `${cw(p, WORD[p].toLowerCase())} ÷ ${cw(q, WORD[q].toLowerCase())} ${T('=' + fx(val, 4))}`, { cls: 'u9l4-tread', parent: labs });
    }
    drawTri();
    // ---- the machine (right) ----
    const mx = TW + 18 + (W - TW - 18) / 2, my = 196, gap = Math.min(215, (W - TW - 18) / 2 - 84);
    const sL = mx - gap, sR = mx + gap;
    lab(stage, sL, my - 66, 'angle', 'u9l4-sloth'); lab(stage, sR, my - 66, 'ratio', 'u9l4-sloth');
    const card = (x) => add(stage, box(h('div', 'u9l4-card'), 150, 72), x - 75, my - 36);
    const cL = card(sL), cR = card(sR);
    const mach = add(stage, box(h('div', 'u9l4-mach', '<div class="u9l4-m2">2nd</div><div class="u9l4-mkey">SIN</div><div class="u9l4-msub">TI-30XIIS</div>'), 150, 116), mx - 75, my - 58);
    const mKey = mach.querySelector('.u9l4-mkey'), m2 = mach.querySelector('.u9l4-m2');
    const dir = lab(stage, mx, 82, '', 'u9l4-dir');
    const tok = hide0(add(stage, box(h('div', 'u9l4-card u9l4-tok'), 150, 72), 0, my - 36));
    const keysEl = hide0(lab(stage, mx, 318, '', 'u9l4-keyrow'));
    const readEl = hide0(lab(stage, mx, 384, '', 'u9l4-read'));
    const mode = { fn: items[0].fn, inv: items[0].dir === 'b' };
    const setMach = () => { mKey.innerHTML = KEY[mode.fn] + (mode.inv ? '<sup>−1</sup>' : ''); m2.style.visibility = mode.inv ? 'visible' : 'hidden'; mach.classList.toggle('u9l4-inv', mode.inv);
      dir.innerHTML = mode.inv ? '<b>backwards:</b> angle <span class="u9l4-arr">⟵</span> ratio' : '<b>forwards:</b> angle <span class="u9l4-arr">⟶</span> ratio'; };
    setMach();
    async function setMode(c, fn, isInv) {
      if (mode.fn === fn && mode.inv === isInv) return;
      await anim(c, mach, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }], 220);
      mode.fn = fn; mode.inv = isInv; setMach();
      await anim(c, mach, [{ transform: 'rotateY(90deg)' }, { transform: 'rotateY(0deg)' }], 220);
    }
    async function feed(c, from, html) {
      tok.innerHTML = html; tok.style.left = (from - 75) + 'px';
      await anim(c, tok, [{ opacity: 1, transform: 'translateX(0) scale(1)' }, { opacity: 0, transform: `translateX(${mx - from}px) scale(.45)` }], 650);
      await pulse(c, mach, 1.08);
    }
    async function morph(c, to) { const a = st.th; await tween(c, 900, (t) => { st.th = a + (to - a) * t; drawTri(); }); }
    const steps = items.map((it) => {
      const F = `\\${it.fn}`, fnm = it.nm ? `${it.nm} ` : '';
      if (it.dir === 'f') {
        const raw = String(+it.val.toPrecision(9));
        return {
          cap: `${fnm}<b>Forwards:</b> angle in, ratio out. ${T(`${F} ${it.a}^\\circ=${it.vs}`)}${it.vs.length > 4 ? ' to four decimal places' : ''}. The triangle shows it: ${cw(PAIR[it.fn][0], LONG[PAIR[it.fn][0]])} ÷ ${cw(PAIR[it.fn][1], LONG[PAIR[it.fn][1]])}.`,
          run: async (c) => {
            await setMode(c, it.fn, false); hide0(keysEl); hide0(readEl);
            cL.innerHTML = T(`${it.a}^\\circ`); cR.innerHTML = ''; cR.classList.add('u9l4-empty'); await pop(c, cL);
            st.fn = it.fn; st.angLab = `${it.a}^\\circ`; await morph(c, it.a);
            await feed(c, sL, cL.innerHTML);
            cR.classList.remove('u9l4-empty'); cR.innerHTML = T(it.vs); await pop(c, cR);
            keysEl.innerHTML = kb(`${KEY[it.fn]} ${it.a} ) ENTER`) + ` <span class="u9l4-screen">${raw}</span>`; await show(c, keysEl);
            readEl.innerHTML = `${T(`${F} ${it.a}^\\circ`)} = the ${cw(PAIR[it.fn][0], LONG[PAIR[it.fn][0]])} ÷ ${cw(PAIR[it.fn][1], LONG[PAIR[it.fn][1]])} for a ${T(`${it.a}^\\circ`)} angle`; await show(c, readEl);
          }
        };
      }
      const exactS = it.exact ? `${Math.round(it.ang)}^\\circ` : dg(it.ang), rnd = `${Math.round(it.ang)}^\\circ`, who = it.v ? `${it.v}` : '\\theta';
      return {
        cap: `${fnm}<b>Backwards</b> (${kb(`2nd ${KEY[it.fn]}`)}): ratio in, angle out. ${T(`\\${it.fn}^{-1}(${it.ks})=${exactS}`)}${it.exact ? '' : `, so ${T(`${who}\\approx${rnd}`)} to the nearest degree`}.`,
        run: async (c) => {
          await setMode(c, it.fn, true); hide0(keysEl); hide0(readEl);
          cR.classList.remove('u9l4-empty'); cR.innerHTML = T(it.ks); cL.innerHTML = '?'; cL.classList.add('u9l4-empty'); st.fn = it.fn; st.angLab = '?'; drawTri(); await pop(c, cR);
          await feed(c, sR, cR.innerHTML);
          cL.classList.remove('u9l4-empty'); cL.innerHTML = T(exactS); await pop(c, cL);
          st.angLab = exactS; await morph(c, it.ang);
          keysEl.innerHTML = kb(`2nd ${KEY[it.fn]} ${it.keys} ) ENTER`) + ` <span class="u9l4-screen">${String(+it.ang.toPrecision(10))}</span>`; await show(c, keysEl);
          readEl.innerHTML = `${T(`\\${it.fn}^{-1}(${it.ks})`)}: “the angle whose ${it.fn === 'sin' ? 'sine' : it.fn === 'cos' ? 'cosine' : 'tangent'} is ${T(it.ks)}”`; await show(c, readEl);
        }
      };
    });
    if (d.notInv) steps.push({
      cap: `Careful: ${T('\\sin^{-1}')} does <b>not</b> mean ${T('1\\div\\sin')}. ${T('1\\div\\sin30^\\circ=1\\div0.5=2')}: a number, not an angle. ${T('\\sin^{-1}(0.5)=30^\\circ')} undoes the sine.`,
      run: async (c) => {
        readEl.innerHTML = T('\\dfrac{1}{\\sin30^\\circ}=2\\qquad\\text{but}\\qquad\\sin^{-1}(0.5)=30^\\circ'); await show(c, readEl);
        const s = stamp(stage, '≠ 1 ÷ sin', { ok: false, x: mx, y: 440, size: 'sm' }); await stampIn(c, s);
      }
    });
    return steps;
  }
};

/* ======================================================================================
 * Explainer 2: read the ratio graph forwards and backwards
 * ====================================================================================== */
const RB = {
  sin: { label: 'sin: Example 1 (i) and (iv)', fn: 'sin', ymax: 1.3, ystep: 0.1, ylab: 0.2, f: { a: 79, nm: '1(a)(i)' }, b: [{ k: 0.4217, ks: '0.4217', nm: '1(b)(i)' }, { k: 0.6, ks: '\\tfrac35=0.6', nm: '1(b)(iv)' }], end: 'over' },
  cos: { label: 'cos: Example 1 (iii) and (ii)', fn: 'cos', ymax: 1.1, ystep: 0.1, ylab: 0.2, f: { a: 52, nm: '1(a)(iii)' }, b: [{ k: 0.682, ks: '0.6820', nm: '1(b)(ii)' }], end: 'falls' },
  tan: { label: 'tan: Example 1 (ii) and (iii)', fn: 'tan', ymax: 3.25, ystep: 0.25, ylab: 0.5, f: { a: 11, nm: '1(a)(ii)' }, b: [{ k: 2.75, ks: '2.75', nm: '1(b)(iii)' }], end: 'climb' }
};
const readBack = {
  title: 'Read the ratio graph forwards and backwards',
  height: 460,
  choices: Object.keys(RB).map((k) => ({ v: k, label: RB[k].label })),
  intro: 'Each ratio has a graph for angles from 0° to 90°. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = RB[key], fn = d.fn, f = (x) => fwd(fn, x), GW = 590, H = 460;
    const G = new Graph(stage, { x: 6, y: 6, width: GW, height: H - 12, xmin: 0, xmax: 90, ymin: 0, ymax: d.ymax, xstep: 10, ystep: d.ystep, xlabels: 10, ylabels: d.ylab, xtitle: '\\theta^\\circ', ytitle: `\\${fn}\\theta`, arrows: false, major: 0 });
    const P = panel(stage, GW + 18, 6, ex.W - GW - 24, H - 12, `${fn} forwards and backwards`);
    const fv = f(d.f.a), fvs = texNum(fv, 4), word = { sin: 'climbs from 0 to 1', cos: 'falls from 1 to 0', tan: 'climbs from 0 with no ceiling' }[fn];
    const bs = d.b.map((b) => Object.assign({ ang: inv(fn, b.k) }, b));
    const guide = (a, b, color) => G.segment(a, b, { color, width: 3, dash: true, ends: [null, 'arrow'] });
    let curve;
    const steps = [
      { cap: `The graph of ${T(`\\${fn}\\theta`)} for acute angles: as the angle opens, it <b>${word}</b>.`,
        run: async (c) => { curve = G.fn(f, { from: 0, to: fn === 'tan' ? 89.5 : 90, color: HYP, width: 4 }); await G.drawIn(curve, 1100, c); } },
      { cap: `<b>Forwards</b> (${d.f.nm}): <b>up</b> from ${T(`${d.f.a}^\\circ`)} to the curve, then <b>across</b>: ${T(`\\${fn}${d.f.a}^\\circ\\approx${fvs}`)}.`,
        run: async (c) => {
          await G.drawIn(guide([d.f.a, 0], [d.f.a, fv], INK), 600, c); await G.reveal(G.point(d.f.a, fv, { color: INK, r: 6 }), c);
          await G.drawIn(guide([d.f.a, fv], [0, fv], INK), 600, c);
          await pop(c, G.label(d.f.a / 2, fv, T(fvs), { pos: 'n', cls: 'bk-ptlab' }));
          await show(c, line(P, `<b>forwards</b> ${T(`\\${fn}${d.f.a}^\\circ\\approx${fvs}`)}`));
        } }
    ];
    bs.forEach((b) => steps.push({
      cap: `<b>Backwards</b> (${b.nm}): start at ${T(b.ks)}, go <b>across</b> to the curve, then <b>down</b>: ${T(`\\${fn}^{-1}(${b.k})=${dg(b.ang)}`)}${Math.abs(b.ang - Math.round(b.ang)) > 0.005 ? `, about ${T(`${Math.round(b.ang)}^\\circ`)}` : ''}.`,
      run: async (c) => {
        await G.drawIn(guide([0, b.k], [b.ang, b.k], ANG), 700, c); await G.reveal(G.point(b.ang, b.k, { color: ANG, r: 6 }), c);
        await G.drawIn(guide([b.ang, b.k], [b.ang, 0], ANG), 600, c);
        await pop(c, G.label(b.ang, 0, T(dg(b.ang)), { pos: 'ne', cls: 'bk-ptlab', color: ANG, dy: -6 }));
        await show(c, line(P, `<b style="color:${ANG}">backwards</b> ${T(`\\${fn}^{-1}(${b.k})=${dg(b.ang)}`)}`));
      }
    }));
    if (d.end === 'over') steps.push({
      cap: `What about ${T('\\sin^{-1}(1.2)')}? Go across at ${T('1.2')}: the line <b>never meets</b> the curve (a sine is opp ÷ hyp, never more than 1). No angle: the calculator says <b>ERROR</b>.`,
      run: async (c) => {
        await G.drawIn(G.segment([0, 1.2], [90, 1.2], { color: ANG, width: 3, dash: true }), 800, c);
        const s = stamp(stage, 'ERROR', { ok: false, x: G.toPx(70, 1.2)[0] + 6, y: G.toPx(70, 1.2)[1] + 34, size: 'sm' }); await stampIn(c, s);
        await show(c, line(P, `${T('\\sin^{-1}(1.2)')}: no angle`));
      } });
    if (d.end === 'falls') steps.push({
      cap: `Cosine <b>falls</b>: the bigger cosine ${T('0.6820')} belongs to the <b>smaller</b> angle ${T('47^\\circ')}; the smaller cosine ${T('0.6157')} to ${T('52^\\circ')}. Still one angle for each value.`,
      run: async (c) => { await show(c, line(P, `${T('0.6820>0.6157')} so ${T('47^\\circ<52^\\circ')}`)); } });
    if (d.end === 'climb') steps.push({
      cap: `Tangent has <b>no ceiling</b>: near ${T('90^\\circ')} it shoots up (${T('\\tan85^\\circ\\approx11.4')}). Every positive number is the tangent of exactly one acute angle.`,
      run: async (c) => { await pulse(c, curve, 1.02); await show(c, line(P, `${T('\\tan85^\\circ\\approx11.43')}, ${T('\\tan89^\\circ\\approx57.29')}`)); } });
    return steps;
  }
};

/* ======================================================================================
 * Explainer 3: name the sides first, then choose the ratio
 * ====================================================================================== */
const NF = {
  name: { label: 'Naming example: p°', base: 4, rise: 3, right: 'bl', names: { right: 'R', base: 'X', top: 'Y' }, sides: { x: '21', r: '35' }, v: 'Y', ang: 'p^\\circ', known: { adj: 21, hyp: 35 } },
  e2a: { label: 'Example 2(a) check', base: 2.05, rise: 4, right: 'bl', names: { right: 'R', base: 'X', top: 'Y' }, sides: { y: '5', r: '11' }, v: 'Y', ang: 'a^\\circ', known: { opp: 5, hyp: 11 } },
  e2b: { label: 'Example 2(b) check', base: 2.935, rise: 3.412, right: 'bl', names: { right: 'R', base: 'X', top: 'Y' }, sides: { y: '15', r: '23' }, v: 'X', ang: 'b^\\circ', known: { adj: 15, hyp: 23 } },
  e2c: { label: 'Example 2(c) check', base: 3.62, rise: 2.67, right: 'tl', names: { right: 'R', base: 'Z', top: 'Q' }, sides: { z: '14', q: '19' }, v: 'Q', ang: 'c^\\circ', known: { adj: 14, opp: 19 } }
};
const nameFirst = {
  title: 'Name the sides first, then choose the ratio',
  height: 470,
  choices: Object.keys(NF).map((k) => ({ v: k, label: NF[k].label })),
  intro: 'Two sides are known and the angle is not. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = NF[key], H = 470, TW = 460, fn = fnOf(d.known), [pk, qk] = PAIR[fn], num = d.known[pk], den = d.known[qk];
    const ratio = num / den, th = inv(fn, ratio), rnd = Math.round(th), rs = texNum(ratio, 4);
    const roles = ['opp', 'adj', 'hyp'], unk = roles.find((k) => d.known[k] == null);
    const Tr = new RightTriangle(stage, { x: 6, y: 6, width: TW, height: H - 12, base: d.base, rise: d.rise, right: d.right, names: d.names, sides: d.sides, pad: 62 });
    Object.values(Tr.vLabs).forEach((e) => e.remove());
    const arc = Tr.angle(d.v, d.ang, { color: ANG, r: 38 }); hide0(arc); hide0(arc.label);
    const px = TW + 18, pw = ex.W - px - 6;
    const cardW = (pw - 20) / 3, cards = {};
    for (const [i, f] of ['sin', 'cos', 'tan'].entries()) {
      const [a, b] = PAIR[f];
      cards[f] = add(stage, box(h('div', 'u9l4-soh', `<div class="u9l4-soht">${SCH[f]}</div>${T(`\\${f}\\theta=\\dfrac{\\color{${SC[a]}}{\\text{${a}}}}{\\color{${SC[b]}}{\\text{${b}}}}`)}`), cardW, 100), px + i * (cardW + 10), 8);
    }
    const L1 = hide0(lab(stage, px + pw / 2, 150, '', 'u9l4-eq')), L2 = hide0(lab(stage, px + pw / 2, 214, '', 'u9l4-eq')), L3 = hide0(lab(stage, px + pw / 2, 268, '', 'u9l4-keyrow'));
    const sideKey = { hyp: d.names.right.toLowerCase(), opp: d.v.toLowerCase() };
    sideKey.adj = Object.values(d.names).map((n) => n.toLowerCase()).find((k) => k !== sideKey.hyp && k !== sideKey.opp);
    const knownTxt = roles.filter((k) => d.known[k] != null).map((k) => `${T(String(d.known[k]))} is ${cw(k, LONG[k].toUpperCase())}`).join(' and ');
    const F = `\\${fn}`;
    return [
      { cap: `Find ${T(d.ang)}. It is marked in red, and every side gets its name <b>from this angle</b>.`,
        run: async (c) => { await appear(c, arc, 400); await pop(c, arc.label); } },
      { cap: `Name the sides: the ${cw('hyp', 'hypotenuse')} faces the right angle, the ${cw('opp', 'opposite')} faces ${T(d.ang)}, the ${cw('adj', 'adjacent')} touches it.`,
        run: (c) => Tr.highlight(c, d.v, { oppColor: OPP, adjColor: ADJ, hypColor: HYP, long: true }) },
      { cap: `Known: ${knownTxt}. The ${LONG[unk]} is not given, so leave it out.`,
        run: async (c) => {
          const g = Tr.side(sideKey[unk]), tg = (Tr.tags || [])[roles.indexOf(unk)];
          await Promise.all([anim(c, g, [{ opacity: 1 }, { opacity: 0.22 }], 400), tg ? anim(c, tg, [{ opacity: 1 }, { opacity: 0.3 }], 400) : null]);
        } },
      { cap: `${cw(pk, LONG[pk].toUpperCase())} with ${cw(qk, LONG[qk].toUpperCase())}: that pair is <b>${SCH[fn]}</b>, the ${{ sin: 'sine', cos: 'cosine', tan: 'tangent' }[fn]}.`,
        run: async (c) => {
          for (const f in cards) if (f !== fn) cards[f].classList.add('u9l4-dim');
          cards[fn].classList.add('u9l4-on'); await pulse(c, cards[fn], 1.08);
        } },
      { cap: `Write it as an equation: ${T(`${F}\\,${d.ang}=\\dfrac{${num}}{${den}}=${rs}`)}.`,
        run: async (c) => { L1.innerHTML = T(`${F}\\,${d.ang}=\\dfrac{${num}}{${den}}=${rs}`); await show(c, L1); } },
      { cap: `Run it backwards: ${T(`${d.ang}=\\${fn}^{-1}(${rs})=${dg(th)}`)}, so ${T(`${d.ang}\\approx${rnd}^\\circ`)}.`,
        run: async (c) => {
          L2.innerHTML = T(`${d.ang}=\\${fn}^{-1}(${rs})=${dg(th)}\\approx\\boldsymbol{${rnd}^\\circ}`); await show(c, L2);
          L3.innerHTML = kb(`2nd ${KEY[fn]} ${num} ÷ ${den} ) ENTER`); await show(c, L3);
          arc.label.innerHTML = T(`${rnd}^\\circ`); await pulse(c, arc.label, 1.25);
        } },
      { cap: `Check by running it <b>forwards</b> again: the ${fn} of ${T(dg(th, 4) + '\\ldots')} gives back ${T(`\\tfrac{${num}}{${den}}`)}. ✓`,
        run: async (c) => {
          const k = checkCard(stage, { title: 'Check: forwards again', left: [`${F}\\,${fx(th, 4)}\\ldots^\\circ`, fx(fwd(fn, th), 4)], right: [`\\tfrac{${num}}{${den}}`, fx(ratio, 4)], ok: true, x: px, y: 300, width: pw, hidden: true });
          await k.play(c);
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 4: the sun's angle of elevation (Example 3)
 * ====================================================================================== */
const sunElev = {
  title: 'Angle of elevation of the sun',
  height: 450,
  choices: [{ v: 'ex3', label: 'Example 3 check' }],
  intro: 'A flagpole, its shadow and the sun. Press <b>Next</b>.',
  make(stage, key, ex) {
    const H = 450, FW = 600, pole = 6.4, s0 = 9.2, s1 = 3.7, th0 = Math.atan(pole / s0) / DEG, th1 = Math.atan(pole / s1) / DEG, ratio = pole / s0;
    const F = new Fig(stage, { x: 6, y: 6, width: FW, height: H - 12, win: [-5.2, 11, -1.1, 10.2], pad: 12 });
    const O = [0, 0], Tp = [0, pole];
    F.poly([[-5.2, 0], [11, 0], [11, -1.1], [-5.2, -1.1]], { fill: '#e2edd5', layer: F.gBg });
    F.seg([-5.2, 0], [11, 0], { width: 2.5, layer: F.gBg });
    const dyn = svgEl('g', {}, F.gMain), dynT = svgEl('g', {}, F.gTop), dynH = h('div', 'u9l4-dyn'); F.html.appendChild(dynH);
    const st = { s: s0, vis: { ray: false, arc: false, name: false, top: false } }, els = {};
    function redraw() {
      dyn.innerHTML = ''; dynT.innerHTML = ''; dynH.innerHTML = '';
      const S = [st.s, 0], u = norm(-st.s, pole), sun = [Tp[0] + u[0] * 3.4, Tp[1] + u[1] * 3.4], th = Math.atan(pole / st.s) / DEG;
      // sun
      const sp = F.P(sun), sg = svgEl('g', {}, dyn);
      for (let i = 0; i < 12; i++) { const a = i * 30 * DEG; svgEl('path', { d: `M${sp[0] + 27 * Math.cos(a)} ${sp[1] + 27 * Math.sin(a)}L${sp[0] + 38 * Math.cos(a)} ${sp[1] + 38 * Math.sin(a)}`, stroke: '#e8a01e', 'stroke-width': 3, 'stroke-linecap': 'round' }, sg); }
      svgEl('circle', { cx: sp[0], cy: sp[1], r: 21, fill: '#ffd34d', stroke: '#e8a01e', 'stroke-width': 3 }, sg);
      // shadow and pole
      els.shadow = F.seg(O, S, { color: st.vis.name ? ADJ : '#5b6475', width: st.vis.name ? 7 : 9, op: st.vis.name ? 1 : 0.55, layer: dyn });
      els.pole = F.seg(O, Tp, { color: st.vis.name ? OPP : INK, width: 6, layer: dyn });
      F.path([Tp, [0.9, pole - 0.35], [0, pole - 0.7]], { closed: true, fill: ANG, color: ANG, width: 1, layer: dyn });
      F.right(O, Tp, S, { layer: dyn, s: 13 });
      if (st.vis.ray) els.ray = F.seg(sun, S, { color: '#e8a01e', width: 3, dash: '10 7', layer: dyn });
      if (st.vis.arc) els.arc = F.wedge(S, [st.s - 1, 0], Tp, 56, { label: T(st.vis.num ? dg(th, 1) : '\\theta^\\circ'), parent: dynH, layer: dynT, off: 22 });
      if (st.vis.top) els.top = F.wedge(Tp, O, S, 44, { color: GRAY, label: T(dg(90 - th)), parent: dynH, layer: dynT, off: 26 });
      F.lab([0, pole / 2], (st.vis.name ? `<b style="color:${OPP}">OPP</b> ` : '') + T('6.4') + ' m', { pos: 'w', cls: 'u9l4-slab', parent: dynH, dx: -4 });
      F.lab([st.s / 2, 0], (st.vis.name ? `<b style="color:${ADJ}">ADJ</b> ` : '') + T(fx(st.s, 1)) + ' m', { pos: 's', cls: 'u9l4-slab', parent: dynH, dy: 4 });
    }
    redraw();
    const P = panel(stage, FW + 18, 6, ex.W - FW - 24, H - 12, 'Example 3');
    let topStamp;
    return [
      { cap: `A ${T('6.4')} m flagpole casts a ${T('9.2')} m shadow on level ground.`,
        run: async (c) => { await pulse(c, els.pole, 1.02); } },
      { cap: `The sun’s ray just grazes the <b>top of the pole</b> and lands at the <b>tip of the shadow</b>.`,
        run: async (c) => { st.vis.ray = true; redraw(); await drawIn(els.ray, 900, c); } },
      { cap: `The <b>angle of elevation</b> of the sun: from the <b>horizontal</b> ground at the shadow’s tip, <b>up</b> to the ray.`,
        run: async (c) => { st.vis.arc = true; redraw(); await appear(c, els.arc, 400); await pop(c, els.arc.label); } },
      { cap: `Name the sides from ${T('\\theta^\\circ')}: the pole is ${cw('opp', 'OPPOSITE')}, the shadow is ${cw('adj', 'ADJACENT')}. OPP and ADJ: <b>TOA</b>.`,
        run: async (c) => { st.vis.name = true; redraw(); await Promise.all([pulse(c, els.pole, 1.03), pulse(c, els.shadow, 1.03)]); await show(c, line(P, `<b>TOA</b>: ${cw('opp')} ${T('6.4')}, ${cw('adj')} ${T('9.2')}`)); } },
      { cap: `${T(`\\tan\\theta^\\circ=\\dfrac{6.4}{9.2}=${fx(ratio, 4)}`)}, so ${T(`\\theta^\\circ=\\tan^{-1}(${fx(ratio, 4)})=${dg(th0)}\\approx${dg(th0, 1)}`)}.`,
        run: async (c) => {
          await show(c, line(P, T(`\\tan\\theta^\\circ=\\dfrac{6.4}{9.2}=${fx(ratio, 4)}`)));
          await show(c, line(P, T(`\\theta^\\circ=\\tan^{-1}(${fx(ratio, 4)})`)));
          await show(c, line(P, T(`=${dg(th0)}\\approx\\boldsymbol{${dg(th0, 1)}}`)));
          await show(c, line(P, kb('2nd TAN 6.4 ÷ 9.2 ) ENTER')));
          st.vis.num = true; redraw();
        } },
      { cap: `<b>Not</b> from the vertical: the angle at the top of the pole is ${T(`90^\\circ-${dg(th0)}=${dg(90 - th0)}`)}. That is <b>not</b> the angle of elevation.`,
        run: async (c) => {
          st.vis.top = true; redraw(); await appear(c, els.top, 400);
          const q = F.P(Tp); topStamp = stamp(stage, '✗ vertical', { ok: false, x: 6 + q[0] + 130, y: 6 + q[1] + 10, size: 'sm' }); await stampIn(c, topStamp);
        } },
      { cap: `Later in the day the sun climbs: the shadow shrinks and the angle of elevation grows. A ${T('3.7')} m shadow gives ${T(`\\tan^{-1}\\!\\left(\\tfrac{6.4}{3.7}\\right)=${dg(th1, 1)}`)}.`,
        run: async (c) => {
          if (topStamp) topStamp.remove(); st.vis.top = false; redraw();
          await tween(c, 2200, (t) => { st.s = s0 + (s1 - s0) * t; redraw(); });
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 5 (the star): the cliff, the kayak and the Z (Example 4)
 * ====================================================================================== */
const CZ = { demo: { label: 'Demo: the Z, paddling in', ex: false }, ex4: { label: 'Example 4 check', ex: true } };
const cliffZ = {
  title: 'Angle of depression = angle of elevation: the Z',
  height: 480,
  choices: Object.keys(CZ).map((k) => ({ v: k, label: CZ[k].label })),
  intro: 'A cliff 68 m high, and a kayak on the water 155 m from its base. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = CZ[key], H = 480, FW = 640, ht = 68, d0 = 155, d1 = 60, a0 = Math.atan(ht / d0) / DEG, a1 = Math.atan(ht / d1) / DEG, ratio = ht / d0;
    const F = new Fig(stage, { x: 6, y: 6, width: FW, height: H - 12, win: [-30, 180, -14, 84], pad: 8 });
    const B = [0, 0], Tp = [0, ht];
    F.poly([[0, 0], [180, 0], [180, -14], [0, -14]], { fill: '#cfe4f5', layer: F.gBg });
    for (let x = 12; x < 178; x += 22) F.path([[x, -5], [x + 4, -3.6], [x + 8, -5]], { color: '#7fb1da', width: 2, layer: F.gBg });
    F.poly([[-30, -14], [-30, ht], [0, ht], [0, -14]], { fill: '#c9b48e', layer: F.gBg });
    for (const [x, y] of [[-20, 50], [-12, 30], [-24, 18], [-8, 8], [-18, 62]]) F.path([[x, y], [x + 6, y - 3]], { color: '#8d7650', width: 2, layer: F.gBg });
    F.seg([-30, ht], [0, ht], { color: '#5d9b45', width: 5, layer: F.gBg });
    F.seg(B, Tp, { width: 3.5, layer: F.gBg });
    F.dot(Tp, { r: 6 }); F.lab(Tp, 'observer', { pos: 'nw', cls: 'u9l4-flab u9l4-sm' });
    const dyn = svgEl('g', {}, F.gMain), dynT = svgEl('g', {}, F.gTop), dynH = h('div', 'u9l4-dyn'); F.html.appendChild(dynH);
    const st = { d: d0, vis: {} }, els = {};
    function redraw() {
      dyn.innerHTML = ''; dynT.innerHTML = ''; dynH.innerHTML = '';
      const K = [st.d, 0], a = Math.atan(ht / st.d) / DEG, aLab = st.vis.num ? T(dg(a, 1)) : T('\\alpha^\\circ');
      if (st.vis.z) els.z = F.path([[st.d, ht], Tp, K, B], { color: ZC, width: 12, op: 0.45, layer: dyn });
      els.water = F.seg(B, K, { color: st.vis.name ? ADJ : INK, width: st.vis.name ? 6 : 3.5, layer: dyn });
      if (st.vis.name) els.cliff = F.seg(B, Tp, { color: OPP, width: 6, layer: dyn });
      F.right(B, Tp, K, { layer: dyn, s: 13 });
      if (st.vis.hor) els.hor = F.seg(Tp, [178, ht], { dash: true, width: 2.6, layer: dyn });
      if (st.vis.los) els.los = F.seg(Tp, K, { color: HYP, width: 3.5, layer: dyn });
      if (st.vis.dep) els.dep = F.wedge(Tp, [10, ht], K, 64, { label: aLab, parent: dynH, layer: dynT, off: 26 });
      if (st.vis.elev) els.elev = F.wedge(K, [st.d - 10, 0], Tp, 64, { label: aLab, parent: dynH, layer: dynT, off: 26 });
      // the kayak
      const k = F.P(K), kg = svgEl('g', {}, dyn);
      svgEl('path', { d: `M${k[0] - 22} ${k[1] - 3}Q${k[0]} ${k[1] + 9} ${k[0] + 22} ${k[1] - 3}Z`, fill: '#e8503a', stroke: INK, 'stroke-width': 1.5 }, kg);
      svgEl('circle', { cx: k[0] + 2, cy: k[1] - 17, r: 4.5, fill: INK }, kg); svgEl('path', { d: `M${k[0] + 2} ${k[1] - 12}V${k[1] - 3}M${k[0] - 12} ${k[1] - 16}L${k[0] + 16} ${k[1] - 2}`, stroke: INK, 'stroke-width': 2.4 }, kg);
      F.dot(K, { r: 5, layer: dynT });
      F.lab([0, ht / 2], (st.vis.name ? `<b style="color:${OPP}">OPP</b> ` : '') + T('68') + ' m', { pos: 'w', cls: 'u9l4-slab', parent: dynH, dx: -6 });
      F.lab([st.d / 2, 0], (st.vis.name ? `<b style="color:${ADJ}">ADJ</b> ` : '') + T(fx(st.d, 0)) + ' m', { pos: 's', cls: 'u9l4-slab', parent: dynH, dy: 4 });
      if (st.vis.hor) F.lab([178, ht], 'horizontal', { pos: 'n', dx: -46, cls: 'u9l4-flab u9l4-sm', parent: dynH });
      if (st.vis.z) F.lab([Math.max(30, st.d * 0.42), 0], 'horizontal', { pos: 'n', dx: 40, dy: -2, cls: 'u9l4-flab u9l4-sm', parent: dynH });
    }
    redraw();
    const P = panel(stage, FW + 18, 6, ex.W - FW - 24, H - 12, d.ex ? 'Example 4' : 'The Z');
    const steps = [
      { cap: `The cliff is ${T('68')} m high, and the kayaker is ${T('155')} m from its base.`,
        run: async (c) => { await pulse(c, els.water, 1.02); } },
      { cap: `From the top: the <b>horizontal</b> at eye level (dashed), and the <b>line of sight</b> down to the kayak.`,
        run: async (c) => { st.vis.hor = true; st.vis.los = true; redraw(); await drawIn(els.hor, 700, c); await drawIn(els.los, 800, c); } },
      { cap: `The <b>angle of depression</b> is measured <b>down</b> from the horizontal to the line of sight. It sits <b>outside</b> the triangle.`,
        run: async (c) => { st.vis.dep = true; redraw(); await appear(c, els.dep, 400); await pop(c, els.dep.label); await show(c, line(P, `depression: horizontal → line of sight`)); } },
      { cap: `The water is horizontal too. Two <b>parallel</b> horizontals, cut by the line of sight, make a <b>Z</b>.`,
        run: async (c) => { st.vis.z = true; redraw(); await drawIn(els.z, 1300, c); } },
      { cap: `The angles in the two corners of a Z are <b>equal</b> (alternate angles). So the angle of <b>elevation</b> of the cliff top from the kayak is also ${T('\\alpha^\\circ')}.`,
        run: async (c) => {
          st.vis.elev = true; redraw(); await appear(c, els.elev, 400); await pop(c, els.elev.label);
          await show(c, line(P, `<b>depression from the top</b> ${T('=')} <b>elevation from the bottom</b>`));
        } }
    ];
    if (d.ex) steps.push(
      { cap: `Inside the right triangle, from ${T('\\alpha^\\circ')} at the kayak: the cliff is ${cw('opp', 'OPPOSITE')} (${T('68')}), the water is ${cw('adj', 'ADJACENT')} (${T('155')}): <b>TOA</b>.`,
        run: async (c) => { st.vis.name = true; redraw(); await Promise.all([pulse(c, els.cliff, 1.02), pulse(c, els.water, 1.02)]); await show(c, line(P, `<b>TOA</b>: ${cw('opp')} ${T('68')}, ${cw('adj')} ${T('155')}`)); } },
      { cap: `${T(`\\tan\\alpha^\\circ=\\dfrac{68}{155}=${fx(ratio, 4)}`)}, so ${T(`\\alpha^\\circ=\\tan^{-1}(${fx(ratio, 4)})=${dg(a0)}`)}. The angle of depression is about ${T('24^\\circ')}.`,
        run: async (c) => {
          await show(c, line(P, T(`\\tan\\alpha^\\circ=\\dfrac{68}{155}=${fx(ratio, 4)}`)));
          await show(c, line(P, T(`\\alpha^\\circ=\\tan^{-1}(${fx(ratio, 4)})`)));
          await show(c, line(P, T(`=${dg(a0)}\\approx\\boldsymbol{24^\\circ}`)));
          await show(c, line(P, kb('2nd TAN 68 ÷ 155 ) ENTER')));
          st.vis.num = true; redraw();
        } });
    else steps.push(
      { cap: `Paddle in from ${T('155')} m to ${T('60')} m: both angles grow <b>together</b>, from ${T(dg(a0, 1))} to ${T(dg(a1, 1))}, and stay equal the whole way.`,
        run: async (c) => {
          st.vis.num = true; redraw();
          await tween(c, 2600, (t) => { st.d = d0 + (d1 - d0) * t; redraw(); });
          await show(c, line(P, `${T('155')} m: both ${T(dg(a0, 1))}`)); await show(c, line(P, `${T('60')} m: both ${T(dg(a1, 1))}`));
        } });
    return steps;
  }
};

/* ======================================================================================
 * Explainer 6: split the isosceles triangle (Example 5)
 * ====================================================================================== */
const IS = {
  ex5: { label: 'Example 5 check', half: 13, leg: 18, unit: ' cm' },
  roof: { label: 'Demo: a 6/12 roof gable', half: 12, rise: 6, unit: '' }
};
const isoSplit = {
  title: 'Split the isosceles triangle, solve half, double',
  height: 470,
  choices: Object.keys(IS).map((k) => ({ v: k, label: IS[k].label })),
  intro: (k) => (k === 'roof' ? 'The gable end of a 6/12 roof: 24 across, 6 up to the peak. What is the angle at the peak? Press <b>Next</b>.' : 'Isosceles triangle PQR: what is the angle at Q? Press <b>Next</b>.'),
  make(stage, key, ex) {
    const d = IS[key], H = 470, FW = 590, ex5 = key === 'ex5';
    const ht = ex5 ? Math.sqrt(d.leg * d.leg - d.half * d.half) : d.rise;
    const fn = ex5 ? 'sin' : 'tan', num = d.half, den = ex5 ? d.leg : d.rise, ratio = num / den, half = inv(fn, ratio), whole = 2 * half;
    const F = new Fig(stage, { x: 6, y: 6, width: FW, height: H - 12, win: [-d.half - 2.4, d.half + 2.4, -2.4, ht + 2.6], pad: 10 });
    const Pp = [-d.half, 0], Q = [0, ht], R = [d.half, 0], M = [0, 0];
    F.poly([Pp, Q, R], { fill: '#f2f8f7', layer: F.gBg });
    const sPQ = F.seg(Pp, Q), sQR = F.seg(Q, R), sPR = F.seg(Pp, R);
    F.tick(Pp, Q); F.tick(Q, R);
    F.lab(Q, T('Q'), { pos: 'n', cls: 'u9l4-vlab' }); F.lab(Pp, T('P'), { pos: 'sw', cls: 'u9l4-vlab' }); F.lab(R, T('R'), { pos: 'se', cls: 'u9l4-vlab' });
    if (ex5) { F.sideLab(Pp, Q, T('18') + ' cm', { away: [0, 1], off: 34 }); F.sideLab(Q, R, T('18') + ' cm', { away: [0, 1], off: 34 }); }
    const baseL = F.lab([0, 0], T(String(2 * d.half)) + d.unit, { pos: 's', dy: 18 });
    const apex = F.wedge(Q, Pp, R, 40, { label: '?', off: 18 }); hide0(apex); hide0(apex.label);
    // the perpendicular and the fold
    const QM = hide0(F.seg(Q, M, { dash: true, width: 3 })), rm = hide0(F.right(M, R, Q, { s: 14 })), mL = hide0(F.lab(M, T('M'), { pos: 's', cls: 'u9l4-vlab', dy: -2 }));
    const half13 = [hide0(F.lab([-d.half / 2, 0], T(String(d.half)), { pos: 'n', cls: 'u9l4-slab', dy: -2 })), hide0(F.lab([d.half / 2, 0], T(String(d.half)), { pos: 'n', cls: 'u9l4-slab', dy: -2 }))];
    const riseL = ex5 ? null : hide0(F.lab([0, ht / 2], T('6'), { pos: 'e', cls: 'u9l4-slab' }));
    const flap = svgEl('g', {}, F.gMain); flap.style.opacity = 0;
    F.path([Q, M, R], { closed: true, fill: HYP, fo: 0.18, color: HYP, width: 3, layer: flap });
    const mp = F.P(M); flap.style.transformBox = 'view-box'; flap.style.transformOrigin = `${mp[0]}px ${mp[1]}px`;
    const P = panel(stage, FW + 18, 6, ex.W - FW - 24, H - 12, ex5 ? 'Example 5(b)' : '6/12 roof gable');
    let hw;
    const pq = ex5 ? 'PQ' : '', ang = '\\angle PQM';
    return [
      { cap: ex5 ? `Isosceles triangle ${T('PQR')}: ${T('PQ=QR=18')} cm and ${T('PR=26')} cm. Find the angle at ${T('Q')}.` : `The gable: ${T('24')} across, two equal rafters, the peak ${T('Q')} is ${T('6')} above the eaves. Find the angle at the peak.`,
        run: async (c) => { await appear(c, apex, 400); await pop(c, apex.label); } },
      { cap: `SOH CAH TOA? Which side is the hypotenuse? There is <b>no right angle</b>, so there is no hypotenuse: the ratios can’t be used yet.`,
        run: async (c) => { const s = stamp(stage, 'no right angle', { ok: false, x: 6 + F.P(Q)[0] + 150, y: 6 + F.P(Q)[1] + 30, size: 'sm' }); await stampIn(c, s); await sleep(c, 500); await anim(c, s, [{ opacity: 1 }, { opacity: 0.25 }], 400); } },
      { cap: `Drop a <b>perpendicular</b> from ${T('Q')} straight down to the base. It meets ${T('PR')} at ${T('M')} at a <b>right angle</b>.`,
        run: async (c) => { await appear(c, QM, 10); await drawIn(QM, 800, c); await appear(c, rm, 300); await pop(c, mL); if (riseL) await pop(c, riseL); } },
      { cap: `Fold along ${T('QM')}: the two halves match exactly. They are <b>congruent</b>, so ${T('M')} cuts the base in half: ${T(`PM=MR=${2 * d.half}\\div2=${d.half}`)}.`,
        run: async (c) => {
          await appear(c, flap, 300);
          await anim(c, flap, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(-1)' }], 1300);
          await sleep(c, 400);
          await anim(c, flap, [{ transform: 'scaleX(-1)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 0 }], 900);
          await anim(c, baseL, [{ opacity: 1 }, { opacity: 0.3 }], 300);
          for (const e of half13) await pop(c, e);
        } },
      { cap: ex5 ? `${T('QM')} also cuts the angle at ${T('Q')} in half. In right triangle ${T('PMQ')}, from ${T(ang)}: ${T('PM=13')} is ${cw('opp', 'OPPOSITE')}, ${T('PQ=18')} is the ${cw('hyp', 'HYPOTENUSE')}: <b>SOH</b>.`
        : `${T('QM')} also cuts the peak angle in half. In right triangle ${T('PMQ')}, from ${T(ang)}: ${T('PM=12')} is ${cw('opp', 'OPPOSITE')}, the rise ${T('QM=6')} is ${cw('adj', 'ADJACENT')}: <b>TOA</b>.`,
        run: async (c) => {
          await anim(c, apex, [{ opacity: 1 }, { opacity: 0 }], 300); apex.label.style.opacity = 0;
          const PM = F.seg(Pp, M, { color: OPP, width: 7 });
          const other = ex5 ? F.seg(Pp, Q, { color: HYP, width: 7 }) : F.seg(Q, M, { color: ADJ, width: 7 });
          await Promise.all([drawIn(PM, 600, c), drawIn(other, 600, c)]);
          hw = F.wedge(Q, M, Pp, 52, { label: T(ang), off: 30 }); await appear(c, hw, 400); await pop(c, hw.label);
          await show(c, line(P, ex5 ? `<b>SOH</b>: ${cw('opp')} ${T('13')}, ${cw('hyp')} ${T('18')}` : `<b>TOA</b>: ${cw('opp')} ${T('12')}, ${cw('adj')} ${T('6')}`));
        } },
      { cap: `${T(`\\${fn}(${ang})=\\dfrac{${num}}{${den}}=${texNum(ratio, 4)}`)}, so ${T(`${ang}=\\${fn}^{-1}(${texNum(ratio, 4)})=${dg(half)}`)}.`,
        run: async (c) => {
          await show(c, line(P, T(`\\${fn}(${ang})=\\dfrac{${num}}{${den}}=${texNum(ratio, 4)}`)));
          await show(c, line(P, T(`${ang}=\\${fn}^{-1}(${texNum(ratio, 4)})=${dg(half)}`)));
          hw.label.innerHTML = T(dg(half)); await pulse(c, hw.label, 1.2);
        } },
      { cap: `Double it: ${T(`\\angle PQR=2(${dg(half)})=${dg(whole)}\\approx${Math.round(whole)}^\\circ`)}. Keep the decimals until the end.`,
        run: async (c) => {
          await show(c, line(P, T(`\\angle PQR=2(${dg(half)})`)));
          await show(c, line(P, T(`=${dg(whole)}\\approx\\boldsymbol{${Math.round(whole)}^\\circ}`)));
          await show(c, line(P, kb(`2 × 2nd ${KEY[fn]} ${num} ÷ ${den} ) ENTER`)));
          const big = F.wedge(Q, Pp, R, 30, { color: ZC, fo: 0.2 }); await appear(c, big, 400);
          const s = stamp(P, `${Math.round(whole)}°`, { ok: true, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = 'auto'; await stampIn(c, s);
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 7: two right triangles, solved in a chain (Example 6)
 * ====================================================================================== */
const chain = {
  title: 'Two right triangles sharing a side',
  height: 490,
  choices: [{ v: 'ex6', label: 'Example 6 check' }],
  intro: 'Angle BAC spans two right triangles that share side AD. Press <b>Next</b>.',
  make(stage, key, ex) {
    const H = 490, FW = 600, FH = 340;
    const AD = Math.sqrt(41 * 41 - 81), DC = Math.sqrt(85 * 85 - AD * AD), a1 = Math.atan(9 / AD) / DEG, a2 = Math.atan(DC / AD) / DEG, sum = a1 + a2;
    const angB = Math.acos(9 / 41) / DEG, angC = Math.asin(AD / 85) / DEG;
    const F = new Fig(stage, { x: 6, y: 6, width: FW, height: FH, win: [-12, 79, -5, 44], pad: 14 });
    const B = [-9, 0], D = [0, 0], C = [75, 0], A = [0, 40];
    const fL = F.poly([A, B, D], { fill: OPP, fo: 0.1, layer: F.gBg }), fR = F.poly([A, D, C], { fill: HYP, fo: 0.08, layer: F.gBg });
    hide0(fL); hide0(fR);
    const sBD = F.seg(B, D), sDC = F.seg(D, C), sAB = F.seg(A, B), sAD = F.seg(A, D), sAC = F.seg(A, C); F.right(D, B, A, { s: 12 });
    F.lab(A, T('A'), { pos: 'n', cls: 'u9l4-vlab' }); F.lab(B, T('B'), { pos: 'sw', cls: 'u9l4-vlab' }); F.lab(D, T('D'), { pos: 'se', cls: 'u9l4-vlab', dx: -2 }); F.lab(C, T('C'), { pos: 'se', cls: 'u9l4-vlab' });
    F.lab([-4.5, 0], T('9'), { pos: 's', cls: 'u9l4-slab' }); F.sideLab(A, B, T('41'), { away: [10, 0], off: 18 }); F.sideLab(A, C, T('85'), { away: [0, 0], off: 20 });
    const adL = hide0(F.lab([0, 20], T('AD=40'), { pos: 'e', cls: 'u9l4-slab', dx: 4 })), dcL = hide0(F.lab([37.5, 0], T('DC=75'), { pos: 's', cls: 'u9l4-slab' }));
    const wa = F.wedge(A, B, D, 70, { color: ANG, label: T('\\angle BAD'), off: 30 }), wb = F.wedge(A, D, C, 52, { color: ZC, label: T('\\angle DAC'), off: 26 });
    for (const w of [wa, wb]) { hide0(w); hide0(w.label); }
    const P = panel(stage, FW + 18, 6, ex.W - FW - 24, FH, 'Example 6');
    const P2 = panel(stage, 6, FH + 16, ex.W - 12, H - FH - 22, 'Check another way: the angles of △ABC');
    const colour = (el, color, w) => { el.setAttribute('stroke', color); el.setAttribute('stroke-width', w); };
    return [
      { cap: `Two right triangles share side ${T('AD')}. Known: ${T('AB=41')}, ${T('BD=9')}, ${T('AC=85')}. The goal: ${T('\\angle BAC')}.`,
        run: async (c) => { await pulse(c, sAD, 1.02); } },
      { cap: `In ${T('\\triangle ABD')}, ${T('AB=41')} faces the right angle: it is the hypotenuse. Pythagoras: ${T('AD=\\sqrt{41^2-9^2}=\\sqrt{1600}=40')}.`,
        run: async (c) => { await appear(c, fL, 400); colour(sAB, HYP, 6); await show(c, line(P, T('AD=\\sqrt{41^2-9^2}=\\sqrt{1600}=40'))); await pop(c, adL); } },
      { cap: `${T('AD')} is shared, so use it in ${T('\\triangle ADC')}, where ${T('AC=85')} is the hypotenuse: ${T('DC=\\sqrt{85^2-40^2}=\\sqrt{5625}=75')}.`,
        run: async (c) => { colour(sAB, INK, 3); await appear(c, fR, 400); colour(sAC, HYP, 6); await show(c, line(P, T('DC=\\sqrt{85^2-40^2}=\\sqrt{5625}=75'))); await pop(c, dcL); colour(sAC, INK, 3); } },
      { cap: `${T('AD')} splits ${T('\\angle BAC')} into two pieces, one in each triangle: ${T('\\angle BAC=\\angle BAD+\\angle DAC')}.`,
        run: async (c) => { await appear(c, wa, 300); await pop(c, wa.label); await appear(c, wb, 300); await pop(c, wb.label); } },
      { cap: `In ${T('\\triangle ABD')}, from ${T('\\angle BAD')}: ${T('BD=9')} is ${cw('opp', 'OPPOSITE')}, ${T('AD=40')} is ${cw('adj', 'ADJACENT')}: TOA. ${T(`\\angle BAD=\\tan^{-1}\\!\\left(\\tfrac{9}{40}\\right)=${dg(a1)}`)}.`,
        run: async (c) => { colour(sBD, OPP, 6); colour(sAD, ADJ, 6); await pulse(c, wa.label, 1.15); await show(c, line(P, T(`\\angle BAD=\\tan^{-1}\\!\\left(\\tfrac{9}{40}\\right)=${dg(a1)}`))); } },
      { cap: `In ${T('\\triangle ADC')}, from ${T('\\angle DAC')}: ${T('DC=75')} is ${cw('opp', 'OPPOSITE')}, ${T('AD=40')} is ${cw('adj', 'ADJACENT')}: TOA. ${T(`\\angle DAC=\\tan^{-1}\\!\\left(\\tfrac{75}{40}\\right)=${dg(a2)}`)}.`,
        run: async (c) => { colour(sBD, INK, 3); colour(sDC, OPP, 6); await pulse(c, wb.label, 1.15); await show(c, line(P, T(`\\angle DAC=\\tan^{-1}\\!\\left(\\tfrac{75}{40}\\right)=${dg(a2)}`))); } },
      { cap: `Add the two pieces: ${T(`\\angle BAC=${dg(a1)}+${dg(a2)}=${dg(sum)}\\approx75^\\circ`)}.`,
        run: async (c) => {
          colour(sDC, INK, 3); colour(sAD, INK, 3);
          await show(c, line(P, T(`\\angle BAC=${dg(sum)}\\approx\\boldsymbol{75^\\circ}`)));
          await show(c, line(P, kb('2nd TAN 9 ÷ 40 ) + 2nd TAN 75 ÷ 40 ) ENTER')));
        } },
      { cap: `Check another way: in the big triangle, ${T(`\\angle B=\\cos^{-1}\\!\\left(\\tfrac{9}{41}\\right)=${dg(angB)}`)} and ${T(`\\angle C=\\sin^{-1}\\!\\left(\\tfrac{40}{85}\\right)=${dg(angC)}`)}. The angles add to ${T('180^\\circ')}. ✓`,
        run: async (c) => {
          await show(c, line(P2, `${T(`\\angle B=\\cos^{-1}\\!\\left(\\tfrac{9}{41}\\right)=${dg(angB)}`)} &nbsp;&nbsp; ${T(`\\angle C=\\sin^{-1}\\!\\left(\\tfrac{40}{85}\\right)=${dg(angC)}`)}`));
          await show(c, line(P2, T(`\\angle BAC=180^\\circ-${dg(angB)}-${dg(angC)}=${dg(180 - angB - angC)}`)));
          const s = stamp(stage, '✓ same answer', { ok: true, x: ex.W - 140, y: H - 46, size: 'sm' }); await stampIn(c, s);
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 8: which inverse ratio? (flowchart for every example)
 * ====================================================================================== */
const CH = {
  N: { label: 'Naming: p°', q: `Find ${T('p^\\circ')} with ${T('21')} and ${T('35')} known.`, split: false, sides: `${T('21')} is ${cw('adj', 'ADJ')}, ${T('35')} is ${cw('hyp', 'HYP')}`, fn: 'cos', expr: '\\cos^{-1}\\!\\left(\\tfrac{21}{35}\\right)', val: inv('cos', 21 / 35), res: '53^\\circ' },
  a: { label: 'Ex 2(a)', q: `Find ${T('a^\\circ')} with ${T('5')} and ${T('11')} known.`, split: false, sides: `${T('5')} is ${cw('opp', 'OPP')}, ${T('11')} is ${cw('hyp', 'HYP')}`, fn: 'sin', expr: '\\sin^{-1}\\!\\left(\\tfrac{5}{11}\\right)', val: inv('sin', 5 / 11), res: '27^\\circ' },
  b: { label: 'Ex 2(b)', q: `Find ${T('b^\\circ')} with ${T('15')} and ${T('23')} known.`, split: false, sides: `${T('15')} is ${cw('adj', 'ADJ')}, ${T('23')} is ${cw('hyp', 'HYP')}`, fn: 'cos', expr: '\\cos^{-1}\\!\\left(\\tfrac{15}{23}\\right)', val: inv('cos', 15 / 23), res: '49^\\circ' },
  c: { label: 'Ex 2(c)', q: `Find ${T('c^\\circ')} with ${T('14')} and ${T('19')} known.`, split: false, sides: `${T('14')} is ${cw('adj', 'ADJ')}, ${T('19')} is ${cw('opp', 'OPP')}`, fn: 'tan', expr: '\\tan^{-1}\\!\\left(\\tfrac{19}{14}\\right)', val: inv('tan', 19 / 14), res: '54^\\circ' },
  e3: { label: 'Ex 3', q: `The sun: pole ${T('6.4')} m, shadow ${T('9.2')} m.`, split: false, sides: `the pole is ${cw('opp', 'OPP')}, the shadow is ${cw('adj', 'ADJ')}`, fn: 'tan', expr: '\\tan^{-1}\\!\\left(\\tfrac{6.4}{9.2}\\right)', val: inv('tan', 6.4 / 9.2), res: '34.8^\\circ' },
  e4: { label: 'Ex 4(b)', q: `The cliff: depression = elevation at the kayak (the Z). Cliff ${T('68')} m, water ${T('155')} m.`, split: false, sides: `the cliff is ${cw('opp', 'OPP')}, the water is ${cw('adj', 'ADJ')}`, fn: 'tan', expr: '\\tan^{-1}\\!\\left(\\tfrac{68}{155}\\right)', val: inv('tan', 68 / 155), res: '24^\\circ' },
  e5: { label: 'Ex 5(b)', q: `Isosceles ${T('PQR')}: ${T('18')}, ${T('18')}, ${T('26')}. No right angle!`, split: true, sides: `in half ${T('PMQ')}: ${T('13')} is ${cw('opp', 'OPP')}, ${T('18')} is ${cw('hyp', 'HYP')}`, fn: 'sin', expr: '2\\sin^{-1}\\!\\left(\\tfrac{13}{18}\\right)', val: 2 * inv('sin', 13 / 18), res: '92^\\circ' }
};
const choose = {
  title: 'Which inverse ratio?',
  height: 440,
  choices: Object.keys(CH).map((k) => ({ v: k, label: CH[k].label })),
  intro: (k) => `${CH[k].q} Press <b>Next</b>.`,
  make(stage, key, ex) {
    const d = CH[key], W = ex.W - 12, cx = W / 2, dx = Math.min(310, W / 3);
    const F = new Flowchart(stage, { x: 6, y: 4, width: W, height: 380,
      nodes: {
        start: { x: cx, y: 36, w: 260, h: 50, html: '<b>Find an angle</b>', cls: 'bk-round' },
        right: { x: cx, y: 122, w: 330, h: 62, html: '<b>Is it in a right triangle?</b>', cls: 'bk-diamond' },
        split: { x: cx - dx, y: 122, w: 250, h: 74, html: '<b>Make one</b>drop a perpendicular, or find a shared side', cls: 'bk-dashed', color: 'slate' },
        name: { x: cx, y: 218, w: 330, h: 62, html: '<b>Name the two known sides</b>from the angle' },
        sin: { x: cx - dx, y: 326, w: 270, h: 74, html: `<b>opp &amp; hyp: SOH</b>${T('\\theta=\\sin^{-1}\\!\\left(\\tfrac{\\text{opp}}{\\text{hyp}}\\right)')}`, color: OPP },
        cos: { x: cx, y: 326, w: 270, h: 74, html: `<b>adj &amp; hyp: CAH</b>${T('\\theta=\\cos^{-1}\\!\\left(\\tfrac{\\text{adj}}{\\text{hyp}}\\right)')}`, color: ADJ },
        tan: { x: cx + dx, y: 326, w: 270, h: 74, html: `<b>opp &amp; adj: TOA</b>${T('\\theta=\\tan^{-1}\\!\\left(\\tfrac{\\text{opp}}{\\text{adj}}\\right)')}`, color: HYP }
      },
      edges: [
        { from: 'start', to: 'right' }, { from: 'right', to: 'split', label: 'no' }, { from: 'right', to: 'name', label: 'yes' },
        { from: 'split', to: 'name', route: 'vh' }, { from: 'name', to: 'sin', route: 'vhv' }, { from: 'name', to: 'cos' }, { from: 'name', to: 'tan', route: 'vhv' }
      ] });
    const res = hide0(lab(stage, ex.W / 2, 410, '', 'u9l4-eq'));
    const prev = d.split ? 'split' : 'right';
    return [
      { cap: `${d.q} ${d.split ? 'There is <b>no right angle</b>: make one first (split the triangle down the middle).' : 'The angle is in a <b>right triangle</b>.'}`,
        run: (c) => F.light(c, d.split ? ['start', 'right', 'split'] : ['start', 'right']) },
      { cap: `Name the known sides from the angle: ${d.sides}.`,
        run: async (c) => { await F.go(c, prev, 'name'); await F.visit(c, 'name'); } },
      { cap: `That pair is <b>${SCH[d.fn]}</b>: ${T(`${d.expr}=${dg(d.val)}\\approx${d.res}`)}.`,
        run: async (c) => { await F.go(c, 'name', d.fn); await F.visit(c, d.fn); res.innerHTML = T(`${d.expr}=${dg(d.val)}\\approx\\boldsymbol{${d.res}}`); await show(c, res); } }
    ];
  }
};

/* =============================== mount =============================== */
mountRoofs();
mountFigs();
export const explainers = mountExplainers({ backwards, readBack, nameFirst, sunElev, cliffZ, isoSplit, chain, choose });
export const _test = { BW, RB, NF, CZ, IS, CH };
