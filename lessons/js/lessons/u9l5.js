/* Math 10C · Unit 9 · Lesson 5 — Solving Right Triangles Completely.
 * Warm-up (the leaning tower: the right triangle under a 4° lean), static figures (Tri: a right triangle drawn from the
 * booklet's own coordinates), and the explainers:
 *   tools (four tools, each matched to the pair it needs), whichTool (name the sides, walk the which-tool flowchart,
 *   write and solve; Example 1 checks), twoRoutes (one length by Pythagoras and by trig; a rounded input pulls the routes
 *   apart on a zoomed number line; Example 2 check), twoPieces (why exactly two pieces besides the right angle: a side
 *   alone lets the triangle flex, angles alone give no size), fromGiven (a chain built on a rounded value vs every
 *   unknown from the given data; Example 3 check), solveIt (the star: a six-piece checklist triangle fills in as each
 *   tool is chosen on the flowchart, then the Pythagoras and angle-sum checks; Examples 3–5 checks), ladder (words to a
 *   triangle; Example 5), catchIt (which check catches which slip).
 * Colours: opposite purple, adjacent amber, hypotenuse blue (relative to the reference angle); reference angle green;
 * unknowns red. */
import {
  h, tex, add, box, Box, Flowchart, NumberLine, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  svgEl, pulse, anim, angleArc, rightMark, arrowHead, place, drawIn
} from '../blocks.js';

const T = (s) => tex(s);
const OPP = '#7b4fc4', ADJ = '#c27a0e', HYP = '#1f5bd6', REF = '#12805a', UNK = '#c93a33', INK = '#1c2230';
const DEG = Math.PI / 180;
const key = (k) => k.split('').sort().join('');
const norm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u9l5-panel', title ? `<div class="u9l5-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u9l5-line ' + cls, html); p.appendChild(d); return d; };
const hide0 = (el) => { el.style.opacity = 0; return el; };
const show = (c, el) => fadeIn(c, el, 320);
const lab = (host, x, y, html, cls = '') => { const d = h('div', cls, html); d.style.position = 'absolute'; host.appendChild(d); place(d, x, y); return d; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ======================================================================================
 * Tri: a right triangle from vertex coordinates (y up), fitted into a box, with side labels, angle arcs and
 * opposite / adjacent / hypotenuse colouring relative to a reference angle.
 * ====================================================================================== */
class Tri extends Box {
  constructor(host, opts = {}) {
    const o = Object.assign({ width: 300, height: 240, pad: 44, pts: {}, right: null, names: true, sides: {}, angles: {}, color: INK, fill: true }, opts);
    super(host, o, 'u9l5-tri', o.width, o.height);
    const ks = Object.keys(o.pts), xs = ks.map((k) => o.pts[k][0]), ys = ks.map((k) => o.pts[k][1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const [pt, pr, pb, pl] = Array.isArray(o.pad) ? o.pad : [o.pad, o.pad, o.pad, o.pad];
    const aw = o.width - pl - pr, ah = o.height - pt - pb, s = Math.min(aw / (x1 - x0 || 1), ah / (y1 - y0 || 1));
    const ox = pl + (aw - (x1 - x0) * s) / 2, oy = pt + (ah - (y1 - y0) * s) / 2;
    this.V = {}; ks.forEach((k) => { this.V[k] = [ox + (o.pts[k][0] - x0) * s, oy + (y1 - o.pts[k][1]) * s]; });
    this.ks = ks; this.rv = o.right; this.tags = [];
    this.cen = [0, 1].map((i) => ks.reduce((a, k) => a + this.V[k][i], 0) / 3);
    if (o.fill) this.fillEl = svgEl('polygon', { class: 'u9l5-tri-fill', points: ks.map((k) => this.V[k].join(',')).join(' ') }, this.svg);
    this.gArc = this.layer('arcs'); this.gSide = this.layer('sides'); this.gTop = this.layer('top');
    this.sideEls = {};
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
      const k = key(ks[i] + ks[j]), P = this.V[ks[i]], Q = this.V[ks[j]];
      const g = svgEl('g', { class: 'bk-curve u9l5-side' }, this.gSide); g.style.color = o.color;
      g.path = svgEl('path', { class: 'bk-stroke', d: `M${P[0]} ${P[1]}L${Q[0]} ${Q[1]}`, stroke: 'currentColor', 'stroke-width': 3.2, 'stroke-linecap': 'round', fill: 'none' }, g);
      const m = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; let n = norm(-(Q[1] - P[1]), Q[0] - P[0]);
      if ((m[0] - this.cen[0]) * n[0] + (m[1] - this.cen[1]) * n[1] < 0) n = [-n[0], -n[1]];
      g.mid = m; g.out = n; this.sideEls[k] = g;
    }
    if (o.right) { const [a, b] = ks.filter((k) => k !== o.right); this.rmark = rightMark(this.gTop, this.V[o.right], this.V[a], this.V[b], 14, { color: o.color }); }
    this.vl = {};
    (o.names === true ? ks : (o.names || [])).forEach((v) => { const P = this.V[v], [nx, ny] = norm(P[0] - this.cen[0], P[1] - this.cen[1]); this.vl[v] = this.text(P[0] + nx * 20, P[1] + ny * 20, T(v), 'u9l5-vlab'); });
    this.sl = {}; for (const k in o.sides) { const v = o.sides[k]; if (v && typeof v === 'object') this.sideLabel(k, v.label, v); else this.sideLabel(k, v); }
    this.arcs = {}; this.al = {};
    for (const v in o.angles) { const a = o.angles[v]; if (a && typeof a === 'object') this.arc(v, a.label, a); else this.arc(v, a); }
  }
  text(x, y, html, cls) { const d = h('div', cls, html); this.html.appendChild(d); place(d, x, y); return d; }
  /** a label beside side k (outside the triangle); o: { cls, color, gap } */
  sideLabel(k, html, o = {}) {
    k = key(k); if (this.sl[k]) this.sl[k].remove();
    if (html == null) { delete this.sl[k]; return null; }
    const g = this.sideEls[k], d = h('div', 'u9l5-slab' + (o.cls ? ' ' + o.cls : ''), T(String(html)));
    if (o.color) d.style.color = o.color;
    this.html.appendChild(d);
    const off = (o.gap ?? 7) + Math.abs(g.out[0]) * d.offsetWidth / 2 + Math.abs(g.out[1]) * d.offsetHeight / 2;
    place(d, g.mid[0] + g.out[0] * off, g.mid[1] + g.out[1] * off);
    d.off = off; d.base = o.color || ''; this.sl[k] = d; return d;
  }
  /** an angle arc at v with a label inside (or outside with o.out); o: { color, r, out, cls, dist } */
  arc(v, label, o = {}) {
    if (this.arcs[v]) this.arcs[v].remove(); if (this.al[v]) this.al[v].remove();
    const P = this.V[v], [A, B] = this.ks.filter((k) => k !== v).map((k) => this.V[k]);
    const la = Math.hypot(A[0] - P[0], A[1] - P[1]), lb = Math.hypot(B[0] - P[0], B[1] - P[1]);
    const r = o.r || Math.max(16, Math.min(30, 0.26 * Math.min(la, lb)));
    const g = svgEl('g', { class: 'bk-curve u9l5-arc' }, this.gArc); g.style.color = o.color || INK; g.base = o.color || INK; g.r = r;
    angleArc(g, P, A, B, r, { color: 'currentColor', width: o.width || 2.4 });
    this.arcs[v] = g;
    if (label != null) {
      const ua = norm(A[0] - P[0], A[1] - P[1]), ub = norm(B[0] - P[0], B[1] - P[1]); let bis = norm(ua[0] + ub[0], ua[1] + ub[1]);
      if (o.out) bis = [-bis[0], -bis[1]];
      const d = h('div', 'u9l5-alab' + (o.cls ? ' ' + o.cls : ''), T(label)); this.html.appendChild(d);
      const off = (o.out ? 9 : r + 5) + (o.dist || 0) + Math.abs(bis[0]) * d.offsetWidth / 2 + Math.abs(bis[1]) * d.offsetHeight / 2;
      place(d, P[0] + bis[0] * off, P[1] + bis[1] * off);
      this.al[v] = d;
    }
    return g;
  }
  setAngleLabel(v, label, cls) { const a = this.arcs[v], d = this.al[v]; if (!d) return this.arc(v, label, { cls }); d.className = 'u9l5-alab' + (cls ? ' ' + cls : ''); d.style.color = ''; d.innerHTML = T(label); return a; }
  hypK() { const [a, b] = this.ks.filter((k) => k !== this.rv); return key(a + b); }
  oppK(v) { const [a, b] = this.ks.filter((k) => k !== v); return key(a + b); }
  adjK(v) { return key(v + this.rv); }
  paint(k, color, w) { const g = this.sideEls[key(k)]; g.style.color = color; g.path.setAttribute('stroke-width', w || 3.2); const l = this.sl[key(k)]; if (l && !l.classList.contains('u9l5-unk') && !l.classList.contains('u9l5-found')) l.style.color = color === INK ? l.base : color; }
  /** colour and tag the sides relative to the angle at ref (null: only the hypotenuse and the two legs) */
  async roles(c, ref, o = {}) {
    this.clearRoles();
    const spec = ref ? [[this.oppK(ref), OPP, 'opp'], [this.adjK(ref), ADJ, 'adj'], [this.hypK(), HYP, 'hyp']]
      : [[this.hypK(), HYP, 'hyp']].concat(this.ks.filter((k) => k !== this.rv).map((v) => [this.adjK(v), INK, 'leg']));
    if (ref && this.arcs[ref]) { this.arcs[ref].style.color = REF; this.arcs[ref].querySelector('path').setAttribute('stroke-width', 3.6); this.refV = ref; }
    for (const [k, color, short] of spec) {
      this.paint(k, color, short === 'leg' ? 3.6 : 5.5);
      const t = this.tag(k, short, color);
      if (c) { t.style.opacity = 0; await anim(c, this.sideEls[k], [{ opacity: 0.25 }, { opacity: 1 }], 260); await pop(c, t, 300); await sleep(c, o.stagger ?? 160); }
    }
  }
  tag(k, text, color) {
    const g = this.sideEls[k], l = this.sl[k], d = h('div', 'u9l5-tag', text); d.style.color = color; this.html.appendChild(d);
    const ext = (e) => Math.abs(g.out[0]) * e.offsetWidth / 2 + Math.abs(g.out[1]) * e.offsetHeight / 2;
    const off = (l ? l.off + ext(l) + 6 : 8) + ext(d), tw = d.offsetWidth / 2 + 2, th = d.offsetHeight / 2 + 2;
    place(d, clamp(g.mid[0] + g.out[0] * off, tw, this.W - tw), clamp(g.mid[1] + g.out[1] * off, th, this.H - th));
    this.tags.push(d); return d;
  }
  clearRoles() {
    Object.keys(this.sideEls).forEach((k) => this.paint(k, INK));
    this.tags.forEach((t) => t.remove()); this.tags = [];
    if (this.refV && this.arcs[this.refV]) { const a = this.arcs[this.refV]; a.style.color = a.base; a.querySelector('path').setAttribute('stroke-width', 2.4); }
    this.refV = null;
  }
}

/* ---------------- the which-tool flowchart ---------------- */
function toolChart(stage, x, y, w = 560) {
  const lw = (w - 24) / 4, lx = (i) => lw / 2 + i * (lw + 8);
  return new Flowchart(stage, {
    x, y, width: w, height: 300, cls: 'u9l5-flow',
    nodes: {
      start: { x: w / 2, y: 26, w: 240, h: 44, html: '<b>Next missing piece</b>', cls: 'bk-round' },
      angQ: { x: w * 0.25, y: 120, w: 248, h: 70, html: '<b>An angle?</b>Is the other acute angle known?', cls: 'bk-diamond' },
      sideQ: { x: w * 0.75, y: 120, w: 248, h: 70, html: '<b>A side?</b>Are the other two sides given?', cls: 'bk-diamond' },
      sum: { x: lx(0), y: 252, w: lw, h: 92, html: `<b>Angle sum</b>${T('90^\\circ-\\text{other}')}`, color: 'green' },
      inv: { x: lx(1), y: 252, w: lw, h: 92, html: `<b>Inverse ratio</b>${T('\\sin^{-1}')} ${T('\\cos^{-1}')} ${T('\\tan^{-1}')}`, color: 'red' },
      pyth: { x: lx(2), y: 252, w: lw, h: 92, html: `<b>Pythagoras</b>${T('a^2+b^2=c^2')}`, color: 'slate' },
      ratio: { x: lx(3), y: 252, w: lw, h: 92, html: '<b>SOH CAH TOA</b>a side and an angle', color: 'teal' }
    },
    edges: [{ from: 'start', to: 'angQ', label: 'angle' }, { from: 'start', to: 'sideQ', label: 'side' },
      { from: 'angQ', to: 'sum', label: 'yes' }, { from: 'angQ', to: 'inv', label: 'no' },
      { from: 'sideQ', to: 'pyth', label: 'yes' }, { from: 'sideQ', to: 'ratio', label: 'no' }]
  });
}

/* ======================================================================================
 * Warm-up: the leaning tower
 * ====================================================================================== */
function mountWarm() {
  const host = document.getElementById('u9l5-wfig'); if (!host) return;
  const W = 450, H = 440, gy = 405, bx = 175, L = 330, u = L / 8.4, lean = 4 * DEG;
  const svg = svgEl('svg', { width: W, height: H }, host);
  svgEl('rect', { x: 0, y: gy, width: W, height: H - gy, fill: '#cfe3bf' }, svg);
  svgEl('line', { x1: 0, x2: W, y1: gy, y2: gy, stroke: INK, 'stroke-width': 2 }, svg);
  const tower = svgEl('g', { class: 'u9l5-wfade', transform: `rotate(4 ${bx} ${gy})` }, svg);
  const R = (x0, y0, x1, y1, attrs) => svgEl('rect', Object.assign({ x: bx + x0 * u, y: gy - y1 * u, width: (x1 - x0) * u, height: (y1 - y0) * u }, attrs), tower);
  const M = { fill: '#f5f0e4', stroke: INK, 'stroke-width': 1.5 }, A = { fill: '#c9cdd4' };
  const arch = (xx, hw, ya, yb) => { R(xx - hw, ya, xx + hw, yb, A); svgEl('circle', { cx: bx + xx * u, cy: gy - yb * u, r: hw * u, fill: '#c9cdd4' }, tower); };
  R(-1.2, 0, 1.2, 1.2, M); [-0.8, -0.27, 0.27, 0.8].forEach((xx) => arch(xx, 0.13, 0.15, 0.8));
  for (let k = 0; k < 6; k++) { const yb = 1.2 + k; R(-1.15, yb, 1.15, yb + 1, M); R(-1.22, yb + 0.94, 1.22, yb + 1, M); [-0.86, -0.43, 0, 0.43, 0.86].forEach((xx) => arch(xx, 0.12, yb + 0.12, yb + 0.68)); }
  R(-0.8, 7.2, 0.8, 8.4, M); [-0.4, 0, 0.4].forEach((xx) => arch(xx, 0.1, 7.35, 7.9));
  svgEl('line', { x1: bx, y1: gy, x2: bx, y2: gy - L, stroke: UNK, 'stroke-width': 3 }, tower);
  svgEl('circle', { cx: bx, cy: gy - L, r: 4, fill: UNK }, tower);
  const Tp = [bx + L * Math.sin(lean), gy - L * Math.cos(lean)];
  // plumb line, right angle, shift arrow, the 4° angle
  svgEl('line', { x1: bx, y1: gy, x2: bx, y2: Tp[1] - 44, stroke: INK, 'stroke-width': 2.6, 'stroke-dasharray': '10 6' }, svg);
  rightMark(svg, [bx, Tp[1]], [bx, gy], [Tp[0], Tp[1]], 11, { color: INK, width: 1.8 });
  svgEl('line', { x1: Tp[0], y1: Tp[1], x2: Tp[0], y2: Tp[1] - 30, stroke: UNK, 'stroke-width': 1.6 }, svg);
  svgEl('line', { x1: bx + 3, y1: Tp[1] - 22, x2: Tp[0] - 3, y2: Tp[1] - 22, stroke: UNK, 'stroke-width': 2.4 }, svg);
  arrowHead(svg, bx, Tp[1] - 22, -1, 0, { color: UNK, width: 2.2, L: 8, hw: 4.5 }); arrowHead(svg, Tp[0], Tp[1] - 22, 1, 0, { color: UNK, width: 2.2, L: 8, hw: 4.5 });
  const t1 = svgEl('text', { x: Tp[0] + 10, y: Tp[1] - 15, class: 'u9l5-wt', fill: UNK }, svg); t1.textContent = '? m';
  const ra = 210;
  angleArc(svg, [bx, gy], [bx, gy - 10], [bx + Math.sin(lean) * 10, gy - Math.cos(lean) * 10], ra, { color: INK, width: 2.6 });
  svgEl('line', { x1: bx - 2, y1: gy - ra, x2: bx - 60, y2: gy - ra + 14, stroke: INK, 'stroke-width': 1.4 }, svg);
  const t4 = svgEl('text', { x: bx - 64, y: gy - ra + 22, class: 'u9l5-wt', 'text-anchor': 'end', fill: INK }, svg); t4.textContent = '4°';
  const tp = svgEl('text', { x: bx - 12, y: Tp[1] - 32, class: 'u9l5-wt-s', 'text-anchor': 'end' }, svg); tp.textContent = 'plumb line (straight up)';

  // the right triangle (toggle)
  const tri = svgEl('g', { class: 'u9l5-wfade' }, svg); tri.style.opacity = 0;
  svgEl('line', { x1: bx, y1: gy, x2: Tp[0], y2: Tp[1], stroke: HYP, 'stroke-width': 6, 'stroke-linecap': 'round' }, tri);
  svgEl('line', { x1: bx, y1: gy, x2: bx, y2: Tp[1], stroke: ADJ, 'stroke-width': 5, 'stroke-linecap': 'round' }, tri);
  svgEl('line', { x1: bx, y1: Tp[1], x2: Tp[0], y2: Tp[1], stroke: OPP, 'stroke-width': 5, 'stroke-linecap': 'round' }, tri);
  angleArc(tri, [bx, gy], [bx, gy - 10], [bx + Math.sin(lean) * 10, gy - Math.cos(lean) * 10], ra, { color: REF, width: 4 });
  const tl = (x, y, s, fill, anchor = 'start') => { const t = svgEl('text', { x, y, class: 'u9l5-wt', fill, 'text-anchor': anchor, stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke' }, tri); t.textContent = s; };
  tl(Tp[0] + 40, 200, 'hypotenuse 56 m', HYP); tl(bx - 56, 300, 'height', ADJ, 'end'); tl(bx - 56, 322, '(adjacent)', ADJ, 'end');
  tl(Tp[0] + 40, Tp[1] + 34, 'shift (opposite)', OPP);
  // angle with the ground (toggle)
  const gnd = svgEl('g', { class: 'u9l5-wfade' }, svg); gnd.style.opacity = 0;
  angleArc(gnd, [bx, gy], [bx + 10, gy], [bx + Math.sin(lean) * 10, gy - Math.cos(lean) * 10], 78, { color: REF, width: 4 });
  { const t = svgEl('text', { x: bx + 104 * Math.cos(43 * DEG), y: gy - 104 * Math.sin(43 * DEG), class: 'u9l5-wt', fill: REF, stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke' }, gnd); t.textContent = '?°'; }
  const toggle = (btn, g, extra) => { if (!btn) return; btn.addEventListener('click', () => { const on = !btn.classList.contains('on'); btn.classList.toggle('on', on); g.style.opacity = on ? 1 : 0; if (extra) extra(); }); };
  const bT = document.getElementById('u9l5-wtri'), bG = document.getElementById('u9l5-wgnd');
  const dim = () => { tower.style.opacity = (bT && bT.classList.contains('on')) ? 0.4 : 1; };
  toggle(bT, tri, dim); toggle(bG, gnd);
}

/* ======================================================================================
 * Static figures (booklet coordinates)
 * ====================================================================================== */
const FIGS = {
  'u9l5-f1a': { width: 210, height: 230, pad: [34, 30, 30, 50], pts: { R: [0, 0], Y: [0, 4], X: [2.035, 0] }, right: 'R', names: false, sides: { RY: '11.4', RX: '5.8' }, angles: { Y: { label: 'x^\\circ', out: true } } },
  'u9l5-f1b': { width: 210, height: 230, pad: [34, 30, 30, 50], pts: { R: [0, 0], P: [0, 4], X: [2.403, 0] }, right: 'R', names: false, sides: { PR: '21.5', RX: 'x' }, angles: { P: { label: '31^\\circ', out: true } } },
  'u9l5-f1c': { width: 210, height: 230, pad: [30, 14, 30, 14], pts: { L: [0, 0], T: [0.882, 1.658], V: [4, 0] }, right: 'T', names: false, sides: { LV: '33.5', TV: 'x' }, angles: { L: '62^\\circ' } },
  'u9l5-f1d': { width: 210, height: 230, pad: [34, 18, 30, 40], pts: { R: [0, 0], T: [0, 3.2], L: [4.315, 0] }, right: 'R', names: false, sides: { RT: '8.1', LT: '13.6' }, angles: { T: { label: 'x^\\circ', out: true } } },
  'u9l5-f2': { width: 330, height: 330, pad: [40, 30, 40, 64], pts: { F: [0, 0], A: [0, 3], S: [3.637, 0] }, right: 'F', names: false, sides: { AF: '14\\text{ m}', AS: '22\\text{ m}' }, angles: { S: { label: '\\theta^\\circ', r: 34 } } },
  'u9l5-f3': { width: 330, height: 330, pad: [44, 44, 40, 44], pts: { A: [0, 0], B: [4, 0], C: [4, -4.4424] }, right: 'B', sides: { AB: '25' }, angles: { A: { label: '48^\\circ', r: 30 } } },
  'u9l5-f4': { width: 330, height: 330, pad: [44, 50, 44, 50], pts: { E: [0, 0], D: [0, 3.2], F: [-2.27, 0] }, right: 'E', sides: { DE: '8.6', EF: '6.1' } },
  'u9l5-f5': { width: 330, height: 330, pad: [36, 70, 40, 70], pts: { W: [0, 0], T: [0, 3.69], F: [1.26, 0] }, right: 'W', sides: { FT: '6.5\\text{ m}', FW: '2.1\\text{ m}' } }
};
function mountFigs() { for (const id in FIGS) { const el = document.getElementById(id); if (el) new Tri(el, FIGS[id]); } }

/* ======================================================================================
 * Explainer 1: four tools, four pairs
 * ====================================================================================== */
const TRI43 = { pts: { C: [0, 0], A: [4, 0], B: [0, 3] }, right: 'C', names: false };
const TOOLS = [
  { name: 'Pythagoras', col: '#3a4254', sides: { BC: '6', AC: '8', AB: { label: '?', cls: 'u9l5-unk' } }, angles: {}, give: 'two sides', want: 'the third side', f: 'a^2+b^2=c^2', pair: 'side + side → side',
    cap: '<b>Two sides → the third side.</b> No angle involved: the <b>Pythagorean Theorem</b>.' },
  { name: 'SOH CAH TOA', col: '#13807a', sides: { AB: '10', BC: { label: '?', cls: 'u9l5-unk' } }, angles: { A: '35^\\circ' }, give: 'a side and an acute angle', want: 'another side', f: '\\sin\\theta=\\tfrac{\\text{opp}}{\\text{hyp}}', pair: 'side + angle → side',
    cap: '<b>A side and an acute angle → another side.</b> A primary ratio: <b>SOH</b>, <b>CAH</b> or <b>TOA</b>.' },
  { name: 'Inverse ratio', col: '#c93a33', sides: { BC: '6', AC: '8' }, angles: { A: { label: '?', cls: 'u9l5-unk' } }, give: 'two sides', want: 'an acute angle', f: '\\theta=\\tan^{-1}\\tfrac{\\text{opp}}{\\text{adj}}', pair: 'side + side → angle',
    cap: '<b>Two sides → an angle.</b> Run a ratio backwards: ' + T('\\sin^{-1}') + ', ' + T('\\cos^{-1}') + ' or ' + T('\\tan^{-1}') + '.' },
  { name: 'Angle sum', col: '#12805a', sides: {}, angles: { A: '35^\\circ', B: { label: '?', cls: 'u9l5-unk' } }, give: 'one acute angle', want: 'the other acute angle', f: '\\angle A+\\angle B=90^\\circ', pair: 'angle → angle',
    cap: '<b>One acute angle → the other.</b> The two acute angles add to ' + T('90^\\circ') + ', so subtract.' }
];
const tools = {
  title: 'Four tools: match the tool to the pair you have',
  height: 400,
  intro: 'Every right triangle has the right angle for free. What else you know decides the tool. Press <b>Next</b>.',
  make(stage, v, ex) {
    const gap = 12, cw = (ex.W - 3 * gap) / 4, cards = [];
    TOOLS.forEach((t, i) => {
      const card = add(stage, box(h('div', 'u9l5-tool'), cw, 388), i * (cw + gap), 4); card.style.setProperty('--bk-tc', t.col); hide0(card);
      card.appendChild(h('div', 'u9l5-tool-h', t.name));
      const fig = h('div'); card.appendChild(fig);
      new Tri(fig, Object.assign({ width: cw - 16, height: 176, pad: [26, 30, 30, 40], sides: t.sides, angles: t.angles }, TRI43));
      card.appendChild(h('div', 'u9l5-tool-g', `<b>Have:</b> ${t.give}<br><b>Want:</b> ${t.want}`));
      card.appendChild(h('div', 'u9l5-tool-f', T(t.f)));
      const pr = h('div', 'u9l5-pair', t.pair); hide0(pr); card.appendChild(pr); card.pair = pr;
      cards.push(card);
    });
    const steps = TOOLS.map((t, i) => ({ cap: t.cap, run: async (c) => { cards.forEach((k) => k.classList.remove('u9l5-on')); cards[i].classList.add('u9l5-on'); await fadeIn(c, cards[i], 420); } }));
    steps.push({ cap: 'Each tool connects one <b>pair</b> of knowns to one unknown. Name what you have, name what you want, and pick the tool that joins them.',
      run: async (c) => { cards.forEach((k) => k.classList.remove('u9l5-on')); for (const k of cards) { await pop(c, k.pair, 300); await sleep(c, 120); } } });
    steps.push({ cap: '<b>Two sides</b> appear twice. What you <b>want</b> decides: a side → Pythagoras; an angle → an inverse ratio.',
      run: async (c) => { cards[0].classList.add('u9l5-on'); cards[2].classList.add('u9l5-on'); await Promise.all([pulse(c, cards[0], 1.04), pulse(c, cards[2], 1.04)]); } });
    return steps;
  }
};

/* ======================================================================================
 * Explainer 2: which tool? name the sides, walk the flowchart, solve (Example 1 checks)
 * ====================================================================================== */
const U = { cls: 'u9l5-unk' };
const WT = {
  demo: { label: 'Demo: two legs → hypotenuse', pts: { C: [0, 0], A: [4, 0], B: [0, 3] }, right: 'C', names: false, pad: [40, 40, 44, 54],
    sides: { AC: '12', BC: '9', AB: Object.assign({ label: 'x' }, U) }, angles: {}, unk: { side: 'AB', val: 'x=15' }, ref: null,
    given: `two sides, ${T('9')} and ${T('12')}`, want: `the side ${T('x')}`,
    rolesCap: `No angle is involved. ${T('x')} is across from the right angle: the <b class="u9l5-ch">hypotenuse</b>. 9 and 12 are the legs.`,
    path: ['start', 'sideQ', 'pyth'], tool: 'Pythagoras', toolCap: 'A <b>side</b> is missing and the other two sides are given: <b>Pythagoras</b>.',
    eqA: ['x^2=9^2+12^2=81+144=225'], eqCap: 'Square the legs, add, and take the square root.',
    eqB: ['x=\\sqrt{225}=15'], ansCap: `${T('x=15')} exactly: no rounding needed this time.` },
  a: { label: 'Example 1(a) check', pts: { R: [0, 0], Y: [0, 4], X: [2.035, 0] }, right: 'R', names: false, pad: [40, 40, 34, 70],
    sides: { RY: '11.4', RX: '5.8' }, angles: { Y: Object.assign({ label: 'x^\\circ', out: true }, U) }, unk: { angle: 'Y', val: 'x\\approx27^\\circ' }, ref: 'Y',
    given: `two sides, ${T('11.4')} and ${T('5.8')}`, want: `the angle ${T('x^\\circ')}`,
    rolesCap: `Name the sides from ${T('x^\\circ')}: ${T('5.8')} is <b class="u9l5-co">opposite</b>, ${T('11.4')} is <b class="u9l5-ca">adjacent</b>.`,
    path: ['start', 'angQ', 'inv'], tool: 'Inverse tan', toolCap: 'An <b>angle</b> is missing and the other acute angle is unknown: run a ratio <b>backwards</b>.',
    eqA: ['\\tan x^\\circ=\\dfrac{5.8}{11.4}=0.50877\\ldots'], eqCap: 'Opposite and adjacent: <b>TOA</b>.',
    eqB: ['x^\\circ=\\tan^{-1}(0.50877\\ldots)=26.9657\\ldots^\\circ\\approx27^\\circ'], ansCap: `${T('\\tan^{-1}')} undoes tan: ${T('x^\\circ\\approx27^\\circ')} (nearest degree).` },
  b: { label: 'Example 1(b) check', pts: { R: [0, 0], P: [0, 4], X: [2.403, 0] }, right: 'R', names: false, pad: [40, 40, 34, 70],
    sides: { PR: '21.5', RX: Object.assign({ label: 'x' }, U) }, angles: { P: { label: '31^\\circ', out: true } }, unk: { side: 'RX', val: 'x\\approx12.9' }, ref: 'P',
    given: `a side, ${T('21.5')}, and an angle, ${T('31^\\circ')}`, want: `the side ${T('x')}`,
    rolesCap: `Name the sides from ${T('31^\\circ')}: ${T('21.5')} is <b class="u9l5-ca">adjacent</b>, ${T('x')} is <b class="u9l5-co">opposite</b>.`,
    path: ['start', 'sideQ', 'ratio'], tool: 'TOA', toolCap: 'A <b>side</b> is missing, but only one side is given (with an angle): <b>SOH CAH TOA</b>.',
    eqA: ['\\tan31^\\circ=\\dfrac{x}{21.5}'], eqCap: `Opposite and adjacent: <b>TOA</b>. ${T('x')} is on <b>top</b>, so multiply.`,
    eqB: ['x=21.5\\tan31^\\circ=12.9185\\ldots\\approx12.9'], ansCap: `${T('x\\approx12.9')} (nearest tenth).` },
  c: { label: 'Example 1(c) check', pts: { L: [0, 0], T: [0.882, 1.658], V: [4, 0] }, right: 'T', names: false, pad: [50, 24, 50, 24],
    sides: { LV: '33.5', TV: Object.assign({ label: 'x' }, U) }, angles: { L: '62^\\circ' }, unk: { side: 'TV', val: 'x\\approx29.6' }, ref: 'L',
    given: `a side, ${T('33.5')}, and an angle, ${T('62^\\circ')}`, want: `the side ${T('x')}`,
    rolesCap: `From ${T('62^\\circ')}: ${T('x')} is <b class="u9l5-co">opposite</b>; ${T('33.5')}, across from the right angle, is the <b class="u9l5-ch">hypotenuse</b>.`,
    path: ['start', 'sideQ', 'ratio'], tool: 'SOH', toolCap: 'A <b>side</b> is missing and only one side is given (with an angle): <b>SOH CAH TOA</b>.',
    eqA: ['\\sin62^\\circ=\\dfrac{x}{33.5}'], eqCap: `Opposite and hypotenuse: <b>SOH</b>. ${T('x')} is on <b>top</b>, so multiply.`,
    eqB: ['x=33.5\\sin62^\\circ=29.5787\\ldots\\approx29.6'], ansCap: `${T('x\\approx29.6')} (nearest tenth).` },
  d: { label: 'Example 1(d) check', pts: { R: [0, 0], T: [0, 3.2], L: [4.315, 0] }, right: 'R', names: false, pad: [40, 30, 34, 60],
    sides: { RT: '8.1', LT: '13.6' }, angles: { T: Object.assign({ label: 'x^\\circ', out: true }, U) }, unk: { angle: 'T', val: 'x\\approx53^\\circ' }, ref: 'T',
    given: `two sides, ${T('8.1')} and ${T('13.6')}`, want: `the angle ${T('x^\\circ')}`,
    rolesCap: `From ${T('x^\\circ')}: ${T('8.1')} is <b class="u9l5-ca">adjacent</b>, ${T('13.6')} is the <b class="u9l5-ch">hypotenuse</b>.`,
    path: ['start', 'angQ', 'inv'], tool: 'Inverse cos', toolCap: 'An <b>angle</b> is missing and the other acute angle is unknown: run a ratio <b>backwards</b>.',
    eqA: ['\\cos x^\\circ=\\dfrac{8.1}{13.6}=0.59559\\ldots'], eqCap: 'Adjacent and hypotenuse: <b>CAH</b>.',
    eqB: ['x^\\circ=\\cos^{-1}(0.59559\\ldots)=53.4454\\ldots^\\circ\\approx53^\\circ'], ansCap: `${T('\\cos^{-1}')} undoes cos: ${T('x^\\circ\\approx53^\\circ')} (nearest degree).` }
};
const whichTool = {
  title: 'Which tool? Name the sides, then follow the flowchart',
  height: 490,
  choices: Object.keys(WT).map((k) => ({ v: k, label: WT[k].label })),
  intro: 'One unknown. Say what is given and what is wanted, then let the questions pick the tool. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = WT[k], FW = 560, fx = ex.W - FW;
    const tri = new Tri(stage, { x: 0, y: 0, width: 330, height: 300, pad: d.pad, pts: d.pts, right: d.right, names: d.names, sides: d.sides, angles: d.angles });
    const F = toolChart(stage, fx, 0, FW);
    const P = panel(stage, 0, 310, 330, 176, 'What we have');
    const gl = hide0(line(P, `<b>Given:</b> ${d.given}`, 'u9l5-sm')), wl = hide0(line(P, `<b>Wanted:</b> ${d.want}`, 'u9l5-sm')), tlb = hide0(line(P, `<b>Tool:</b> ${d.tool}`, 'u9l5-sm'));
    const Wk = panel(stage, fx, 310, FW, 176, 'Work');
    const eA = d.eqA.map((s) => hide0(line(Wk, T(s), 'u9l5-eq'))), eB = d.eqB.map((s) => hide0(line(Wk, T(s), 'u9l5-eq')));
    const unkEl = () => (d.unk.side ? tri.sl[key(d.unk.side)] : tri.al[d.unk.angle]);
    return [
      { cap: `Given: <b>${d.given}</b>. Wanted: <b>${d.want}</b>.`, run: async (c) => { await show(c, gl); await show(c, wl); await pulse(c, unkEl(), 1.35); } },
      { cap: d.rolesCap, run: (c) => tri.roles(c, d.ref) },
      { cap: d.toolCap, run: async (c) => { await F.light(c, d.path); await show(c, tlb); } },
      { cap: d.eqCap, run: async (c) => { for (const e of eA) await show(c, e); } },
      { cap: d.ansCap, run: async (c) => {
        for (const e of eB) await show(c, e);
        if (d.unk.side) tri.sideLabel(d.unk.side, d.unk.val, { cls: 'u9l5-found' }); else tri.setAngleLabel(d.unk.angle, d.unk.val, 'u9l5-found');
        await pop(c, unkEl(), 380);
      } }
    ];
  }
};

/* ======================================================================================
 * Explainer 3: two routes to the same side (Example 2 check)
 * ====================================================================================== */
const TR = {
  ex2: { label: 'Example 2 check', pts: { F: [0, 0], A: [0, 3], S: [3.637, 0] }, right: 'F', names: false, pad: [40, 30, 50, 64],
    sides: { AF: '14', AS: '22', FS: Object.assign({ label: '?' }, U) }, angles: { S: { label: '\\theta', r: 30 } }, unit: '\\text{ m}', unk: 'FS',
    cap0: 'Example 2: antenna 14 m, wire 22 m. Wanted: the base, from the stake to the foot of the antenna.',
    r1: { h: 'Route 1: Pythagoras', lines: ['\\sqrt{22^2-14^2}=\\sqrt{288}'], v: 16.97056, s: '16.9706\\ldots', r: '17.0', cap: 'Route 1, <b>Pythagoras</b>, uses only the given 14 and 22: ' + T('16.9706\\ldots') + ' m.' },
    r2: { h: 'Route 2: trig, rounded angle', lines: ['\\theta=39.52\\ldots^\\circ\\to\\boldsymbol{40^\\circ}', '22\\cos40^\\circ'], v: 16.85298, s: '16.8530\\ldots', r: '16.9', cap: 'Route 2 rounds ' + T('\\theta') + ' to ' + T('40^\\circ') + ' first, then uses CAH: ' + T('22\\cos40^\\circ=16.8530\\ldots') + ' m.' },
    r3: { lines: ['22\\cos39.5212\\ldots^\\circ'], cap: 'Feed route 2 the <b>unrounded</b> angle, ' + T('39.5212\\ldots^\\circ') + ': ' + T('22\\cos39.5212\\ldots^\\circ=16.9706\\ldots') + '. The routes agree.' },
    cmp: { ok: false, cap: 'Rounded: <b>17.0 m</b> against <b>16.9 m</b>. About 12 cm apart, and only one can be right.', gap: '0.12\\text{ m}' },
    nl: { min: 16.8, max: 17.0, step: 0.05, minor: 0.01, dec: 2 } },
  tower: { label: 'Demo: the tower’s height', pts: { B: [0, 0], H: [0, 5], T: [1.5, 5] }, right: 'H', names: false, pad: [34, 60, 40, 60], ntsc: true,
    sides: { BT: '56', HT: '\\text{shift}', BH: Object.assign({ label: '?' }, U) }, angles: { B: { label: '4^\\circ', r: 46 } }, unit: '\\text{ m}', unk: 'BH',
    cap0: 'The warm-up tower: 56 m long, leaning 4°. Wanted: the height of the top.',
    r1: { h: 'Route 1: CAH, from the given', lines: ['56\\cos4^\\circ'], v: 55.863587, s: '55.8636\\ldots', r: '55.9', cap: 'Route 1, <b>CAH</b>, uses only the given 56 and ' + T('4^\\circ') + ': ' + T('55.8636\\ldots') + ' m.' },
    r2: { h: 'Route 2: Pythagoras, rounded shift', lines: ['\\text{shift}=3.906\\ldots\\to\\boldsymbol{3.9}', '\\sqrt{56^2-3.9^2}'], v: 55.864031, s: '55.8640\\ldots', r: '55.9', cap: 'Route 2 rounds the shift to 3.9 m first, then uses Pythagoras: ' + T('55.8640\\ldots') + ' m.' },
    r3: { lines: ['\\sqrt{56^2-3.9063\\ldots^2}'], cap: 'Feed route 2 the <b>unrounded</b> shift, ' + T('3.9063\\ldots') + ': ' + T('55.8636\\ldots') + '. The routes agree exactly.' },
    cmp: { ok: null, cap: 'Rounded, both give <b>55.9 m</b>. But zoom in: the digits behind differ. Rounding early always leaves a mark.', gap: '0.0004\\text{ m}' },
    nl: { min: 55.862, max: 55.866, step: 0.001, minor: 0.0005, dec: 3 } }
};
const twoRoutes = {
  title: 'Two routes to the same side',
  height: 400,
  choices: Object.keys(TR).map((k) => ({ v: k, label: TR[k].label })),
  intro: 'One side, two routes. Do they land in the same place? Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = TR[k], TW = 300, rx = TW + 18, rw = (ex.W - rx - 12) / 2;
    const tri = new Tri(stage, { x: 0, y: 0, width: TW, height: 300, pad: d.pad, pts: d.pts, right: d.right, names: d.names, sides: d.sides, angles: d.angles });
    if (d.ntsc) tri.text(TW / 2, 290, 'not to scale', 'u9l5-ntsc');
    const mk = (r, x, col) => {
      const p = panel(stage, x, 0, rw, 178, `<span style="color:${col}">${r.h}</span>`); p.style.borderColor = col; hide0(p);
      const ls = r.lines.map((s) => line(p, T(s), 'u9l5-eq'));
      const v = line(p, T(`=${r.s}`) + ` <span class="u9l5-hint">${T('\\approx')}</span> <b>${T(r.r + d.unit)}</b>`, 'u9l5-eq'); p.val = v; p.ls = ls; return p;
    };
    const p1 = mk(d.r1, rx, HYP), p2 = mk(d.r2, rx + rw + 12, UNK);
    const NL = new NumberLine(stage, { x: rx, y: 190, width: ex.W - rx, height: 110, min: d.nl.min, max: d.nl.max, step: d.nl.step, minor: d.nl.minor, labels: (v) => T(v.toFixed(d.nl.dec)), cls: 'u9l5-nl', arrows: false });
    const r2left = d.r2.v < d.r1.v;
    const pt1 = NL.point(d.r1.v, { color: HYP, label: 'route 1', pos: r2left ? 'ne' : 'nw' }), pt2 = NL.point(d.r2.v, { color: UNK, label: 'route 2', pos: r2left ? 'nw' : 'ne' });
    [pt1, pt2].forEach((p) => { hide0(p); hide0(p.label); });
    const verdict = add(stage, box(h('div', 'u9l5-verdict'), ex.W - rx, 52), rx, 318); hide0(verdict);
    const dx = NL.toPx(d.r1.v) - NL.toPx(d.r2.v);
    let fixLine;
    return [
      { cap: d.cap0, run: async (c) => { await pulse(c, tri.sl[key(d.unk)], 1.35); } },
      { cap: d.r1.cap, run: async (c) => { await show(c, p1); await Promise.all([pop(c, pt1), fadeIn(c, pt1.label)]); } },
      { cap: d.r2.cap, run: async (c) => { await show(c, p2); await Promise.all([pop(c, pt2), fadeIn(c, pt2.label)]); } },
      { cap: d.cmp.cap, run: async (c) => {
        verdict.className = 'u9l5-verdict ' + (d.cmp.ok === false ? 'u9l5-v-no' : 'u9l5-v-mid');
        verdict.innerHTML = (d.cmp.ok === false ? '✗ The routes disagree: ' : 'Same to the tenth, but apart by ') + T(d.cmp.gap);
        await pop(c, verdict);
      } },
      { cap: d.r3.cap, run: async (c) => {
        p2.ls.forEach((e) => (e.style.opacity = 0.35));
        fixLine = line(p2, T(d.r3.lines[0] + '=' + d.r1.s), 'u9l5-eq'); fixLine.style.color = '#12805a'; hide0(fixLine);
        p2.val.style.display = 'none';
        await show(c, fixLine);
        await Promise.all([anim(c, pt2, [{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], 800), anim(c, pt2.label, [{ opacity: 1 }, { opacity: 0 }], 600)]);
        verdict.className = 'u9l5-verdict u9l5-v-ok'; verdict.innerHTML = '✓ With full precision the routes agree exactly';
        await pop(c, verdict);
      } },
      { cap: 'Only a <b>rounded input</b> pulls the routes apart. Carry full precision and round <b>once</b>, at the end.', run: async (c) => { await pulse(c, p1, 1.03); } }
    ];
  }
};

/* ======================================================================================
 * Explainer 4: why exactly two pieces?
 * ====================================================================================== */
const twoPieces = {
  title: 'How much do you need to know?',
  height: 440,
  intro: 'A right triangle has six measures. How many must be given before the rest are fixed? Press <b>Next</b>.',
  make(stage, v, ex) {
    const LW = 290, P = panel(stage, 0, 0, LW, 436, 'Known so far');
    const kl = line(P, '', 'u9l5-big'), cnt = line(P, '', 'u9l5-line'), verdict = line(P, '', 'u9l5-line');
    const note = line(P, '', 'u9l5-sm'); note.style.marginTop = 'auto';
    const sx = LW + 20, sw = ex.W - sx, svg = svgEl('svg', { width: sw, height: 440 }, stage); svg.style.position = 'absolute'; svg.style.left = sx + 'px'; svg.style.top = '0';
    const html = h('div'); html.style.cssText = `position:absolute;left:${sx}px;top:0;width:${sw}px;height:440px;pointer-events:none`; stage.appendChild(html);
    const Rr = Math.min(200, (sw - 60) / 2), cx = sw / 2, cy = 392, unit = (2 * Rr) / 10;
    const semi = svgEl('path', { d: `M${cx - Rr} ${cy}A${Rr} ${Rr} 0 0 1 ${cx + Rr} ${cy}`, fill: 'none', stroke: '#9aa0ab', 'stroke-width': 2, 'stroke-dasharray': '8 6' }, svg); semi.style.opacity = 0;
    const circ = svgEl('path', { d: '', fill: 'none', stroke: ADJ, 'stroke-width': 2, 'stroke-dasharray': '6 6' }, svg); circ.style.opacity = 0;
    const poly = svgEl('polygon', { class: 'u9l5-tri-fill', points: '' }, svg);
    const sAB = svgEl('line', { stroke: INK, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, svg), sAC = svgEl('line', { stroke: INK, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, svg), sBC = svgEl('line', { stroke: INK, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, svg);
    const rm = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 2 }, svg), arcA = svgEl('path', { fill: 'none', stroke: REF, 'stroke-width': 3 }, svg), arcB = svgEl('path', { fill: 'none', stroke: REF, 'stroke-width': 3 }, svg);
    arcA.style.opacity = 0; arcB.style.opacity = 0;
    const L = (cls = 'u9l5-slab') => { const d = h('div', cls); d.style.position = 'absolute'; html.appendChild(d); return d; };
    const lA = L('u9l5-vlab'), lB = L('u9l5-vlab'), lC = L('u9l5-vlab'), lc = L(), lb = L(), la = L(), lAng = L('u9l5-alab'), lBng = L('u9l5-alab');
    lA.innerHTML = T('A'); lB.innerHTML = T('B'); lC.innerHTML = T('C'); lAng.style.color = REF; lBng.style.color = REF;
    const st = { A: [cx - Rr, cy], B: [cx + Rr, cy], C: [0, 0] };
    const setC = (t) => { st.C = [cx + Rr * Math.cos(t), cy - Rr * Math.sin(t)]; };
    const setScaled = (Lh) => { st.A = [cx - Rr, cy]; st.B = [cx - Rr + Lh, cy]; const a = 35 * DEG, b = Lh * Math.cos(a); st.C = [st.A[0] + b * Math.cos(a), cy - b * Math.sin(a)]; };
    const arcPath = (V, P, Q, r) => { let a1 = Math.atan2(P[1] - V[1], P[0] - V[0]), a2 = Math.atan2(Q[1] - V[1], Q[0] - V[0]); let dd = a2 - a1; while (dd <= -Math.PI) dd += 2 * Math.PI; while (dd > Math.PI) dd -= 2 * Math.PI; return `M${V[0] + r * Math.cos(a1)} ${V[1] + r * Math.sin(a1)}A${r} ${r} 0 0 ${dd > 0 ? 1 : 0} ${V[0] + r * Math.cos(a1 + dd)} ${V[1] + r * Math.sin(a1 + dd)}`; };
    const out = (P, Q, d) => { const m = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], cen = [(st.A[0] + st.B[0] + st.C[0]) / 3, (st.A[1] + st.B[1] + st.C[1]) / 3]; const n = norm(m[0] - cen[0], m[1] - cen[1]); return [m[0] + n[0] * d, m[1] + n[1] * d]; };
    const draw = () => {
      const { A, B, C } = st;
      poly.setAttribute('points', [A, B, C].map((p) => p.join(',')).join(' '));
      [[sAB, A, B], [sAC, A, C], [sBC, B, C]].forEach(([s, P, Q]) => { s.setAttribute('x1', P[0]); s.setAttribute('y1', P[1]); s.setAttribute('x2', Q[0]); s.setAttribute('y2', Q[1]); });
      const u1 = norm(A[0] - C[0], A[1] - C[1]), u2 = norm(B[0] - C[0], B[1] - C[1]), s = 14;
      rm.setAttribute('d', `M${C[0] + u1[0] * s} ${C[1] + u1[1] * s}L${C[0] + (u1[0] + u2[0]) * s} ${C[1] + (u1[1] + u2[1]) * s}L${C[0] + u2[0] * s} ${C[1] + u2[1] * s}`);
      arcA.setAttribute('d', arcPath(A, B, C, 40)); arcB.setAttribute('d', arcPath(B, A, C, 40));
      place(lA, A[0] - 18, A[1] + 4); place(lB, B[0] + 18, B[1] + 4); { const n = norm(C[0] - cx, C[1] - cy); place(lC, C[0] + n[0] * 20, C[1] + n[1] * 20); }
      place(lc, (A[0] + B[0]) / 2, A[1] + 22); const pb = out(A, C, 22), pa = out(B, C, 22); place(lb, ...pb); place(la, ...pa);
      const bA = norm((B[0] - A[0]) / Math.hypot(B[0] - A[0], B[1] - A[1]) + (C[0] - A[0]) / Math.hypot(C[0] - A[0], C[1] - A[1]), (B[1] - A[1]) / Math.hypot(B[0] - A[0], B[1] - A[1]) + (C[1] - A[1]) / Math.hypot(C[0] - A[0], C[1] - A[1]));
      place(lAng, A[0] + bA[0] * 66, A[1] + bA[1] * 66);
      const bB = norm((A[0] - B[0]) / Math.hypot(A[0] - B[0], A[1] - B[1]) + (C[0] - B[0]) / Math.hypot(C[0] - B[0], C[1] - B[1]), (A[1] - B[1]) / Math.hypot(A[0] - B[0], A[1] - B[1]) + (C[1] - B[1]) / Math.hypot(C[0] - B[0], C[1] - B[1]));
      place(lBng, B[0] + bB[0] * 66, B[1] + bB[1] * 66);
    };
    const setLabs = (c, b, a) => { lc.innerHTML = T(c); lb.innerHTML = T(b); la.innerHTML = T(a); [lc, lb, la].forEach((e) => { e.style.color = e.innerHTML.includes('?') ? UNK : INK; }); };
    const known = (s, n, v, col) => { kl.innerHTML = s; cnt.innerHTML = `<b>${n} of 6</b> measures`; verdict.innerHTML = v; verdict.style.color = col; };
    setC(110 * DEG); setLabs('?', '?', '?'); draw();
    let stp;
    const t35 = (180 - 70) * DEG, t6 = (180 - 2 * Math.acos(0.6) / DEG) * DEG;
    return [
      { cap: 'Six measures: three sides, three angles. The <b>right angle</b> is always known: that is 1 of 6.',
        run: async (c) => { known(T('\\angle C=90^\\circ'), 1, 'not enough yet', UNK); await pulse(c, rm, 1.3); } },
      { cap: 'Give one side, the hypotenuse ' + T('c=10') + '. Still not enough: the triangle can <b>flex</b>. Every point on the half-circle makes a right angle.',
        run: async (c) => {
          setLabs('c=10', '?', '?'); known(`${T('\\angle C=90^\\circ')}, ${T('c=10')}`, 2, 'not enough: it flexes', UNK);
          await appear(c, semi, 400);
          await tween(c, 2600, (t) => { const k = t < 0.35 ? 110 - (t / 0.35) * 75 : t < 0.8 ? 35 + ((t - 0.35) / 0.45) * 110 : 145 - ((t - 0.8) / 0.2) * 35; setC(k * DEG); draw(); });
          setC(110 * DEG); draw();
        } },
      { cap: 'Add one acute angle, ' + T('\\angle A=35^\\circ') + '. Now it is <b>locked</b>: only one triangle fits. Three measures fix the other three.',
        run: async (c) => {
          setC(t35); draw(); lAng.innerHTML = T('35^\\circ'); await Promise.all([appear(c, arcA, 300), fadeIn(c, lAng)]);
          known(`${T('\\angle C=90^\\circ')}, ${T('c=10')}, ${T('\\angle A=35^\\circ')}`, 3, '✓ locked: solvable', REF);
          stp = add(html, stamp(html, 'one triangle', { ok: true, size: 'sm' }), cx + Rr - 70, 40); stp.style.position = 'absolute'; await stampIn(c, stp);
        } },
      { cap: 'Or give <b>two sides</b>: ' + T('c=10') + ' and ' + T('b=6') + '. The 6 can only reach the half-circle at one point: locked again.',
        run: async (c) => {
          stp.remove(); arcA.style.opacity = 0; lAng.innerHTML = '';
          circ.setAttribute('d', `M${cx - Rr + 6 * unit} ${cy}A${6 * unit} ${6 * unit} 0 0 0 ${cx - Rr + 6 * unit * Math.cos(80 * DEG)} ${cy - 6 * unit * Math.sin(80 * DEG)}`); await appear(c, circ, 400);
          const t0 = t35; await tween(c, 1000, (t) => { setC(t0 + (t6 - t0) * t); draw(); });
          setLabs('c=10', 'b=6', '?'); known(`${T('\\angle C=90^\\circ')}, ${T('c=10')}, ${T('b=6')}`, 3, '✓ locked: solvable', REF);
          stp = add(html, stamp(html, 'one triangle', { ok: true, size: 'sm' }), cx + Rr - 70, 40); stp.style.position = 'absolute'; await stampIn(c, stp);
        } },
      { cap: 'Two acute angles but <b>no side</b>? ' + T('55^\\circ') + ' was never new: it is ' + T('90^\\circ-35^\\circ') + '. Every size fits, so nothing can be measured.',
        run: async (c) => {
          stp.remove(); semi.style.opacity = 0; circ.style.opacity = 0; setLabs('?', '?', '?');
          setScaled(2 * Rr); draw(); lAng.innerHTML = T('35^\\circ'); lBng.innerHTML = T('55^\\circ'); arcA.style.opacity = 1; arcB.style.opacity = 1;
          known(`${T('\\angle C=90^\\circ')}, ${T('\\angle A=35^\\circ')}, ${T('\\angle B=55^\\circ')}`, '3', 'but only 2 independent: no size', UNK);
          await tween(c, 2400, (t) => { const s = t < 0.5 ? 1 - t * 1.1 : 0.45 + (t - 0.5) * 1.1; setScaled(2 * Rr * s); draw(); });
          setScaled(2 * Rr); draw();
          stp = add(html, stamp(html, 'any size', { ok: false, size: 'sm' }), cx + Rr - 70, 40); stp.style.position = 'absolute'; await stampIn(c, stp);
        } },
      { cap: 'So solving needs exactly <b>two</b> pieces besides the right angle, at least one a <b>side</b>: a side and an acute angle, or two sides.',
        run: async (c) => { note.innerHTML = '<b>Enough to solve:</b><br>• one side + one acute angle<br>• two sides'; await show(c, note); } }
    ];
  }
};

/* ======================================================================================
 * Explainer 5: a chain built on a rounded value vs every unknown from the given data
 * ====================================================================================== */
const FG = {
  ex3: { label: 'Example 3 check: BC, then AC',
    cap0: 'Example 3 gives ' + T('AB=25') + ' and ' + T('\\angle A=48^\\circ') + '. Two students find ' + T('BC') + ', then ' + T('AC') + '.',
    given: `Given: ${T('AB=25')}, ${T('\\angle A=48^\\circ')}`,
    c1: `${T('BC=25\\tan48^\\circ=27.765\\ldots')}<br>writes down <span class="u9l5-rnd">${T('27.8')}</span>`, c1cap: 'Student 1 finds ' + T('BC=27.765\\ldots') + ' and writes down the rounded <b>27.8</b>…',
    c2: `${T('AC=\\sqrt{25^2+27.8^2}')}<br>${T('=37.388\\ldots')}`, c2cap: '…then builds ' + T('AC') + ' on that rounded 27.8 with Pythagoras: ' + T('37.388\\ldots') + '.',
    h1: `${T('BC=25\\tan48^\\circ')}<br>${T('=27.765\\ldots')}`, h1cap: 'Student 2 finds ' + T('BC') + ' the same way: ' + T('27.765\\ldots') + '…',
    h2: `${T('AC=25\\div\\cos48^\\circ')}<br>${T('=37.362\\ldots')}`, h2cap: '…but takes ' + T('AC') + ' straight from the <b>given</b> 25 and ' + T('48^\\circ') + ' (CAH), skipping the rounded value: ' + T('37.362\\ldots') + '.',
    v1: { cls: 'u9l5-v-mid', html: `${T('37.388\\ldots\\approx37.4')} (lucky)` }, v2: { cls: 'u9l5-v-ok', html: `${T('37.362\\ldots\\approx37.4')} ✓` },
    vcap: 'Off by 0.026. Both round to <b>37.4</b> this time, but the chain carried the rounding error along with it.' },
  demo: { label: 'Demo: 15 and 50°, the chain flips',
    cap0: 'Same shape of problem with ' + T('AB=15') + ' and ' + T('\\angle A=50^\\circ') + '. Again: ' + T('BC') + ', then ' + T('AC') + '.',
    given: `Given: ${T('AB=15')}, ${T('\\angle A=50^\\circ')}`,
    c1: `${T('BC=15\\tan50^\\circ=17.876\\ldots')}<br>writes down <span class="u9l5-rnd">${T('17.9')}</span>`, c1cap: 'Student 1 finds ' + T('BC=17.876\\ldots') + ' and writes down <b>17.9</b>…',
    c2: `${T('AC=\\sqrt{15^2+17.9^2}')}<br>${T('=23.354\\ldots')}`, c2cap: '…then uses the rounded 17.9: ' + T('\\sqrt{15^2+17.9^2}=23.354\\ldots') + '.',
    h1: `${T('BC=15\\tan50^\\circ')}<br>${T('=17.876\\ldots')}`, h1cap: 'Student 2 finds ' + T('BC=17.876\\ldots') + '…',
    h2: `${T('AC=15\\div\\cos50^\\circ')}<br>${T('=23.335\\ldots')}`, h2cap: '…and takes ' + T('AC') + ' from the given 15 and ' + T('50^\\circ') + ': ' + T('15\\div\\cos50^\\circ=23.335\\ldots') + '.',
    v1: { cls: 'u9l5-v-no', html: `${T('23.354\\ldots\\approx23.4')} ✗` }, v2: { cls: 'u9l5-v-ok', html: `${T('23.335\\ldots\\approx23.3')} ✓` },
    vcap: 'Now the answers differ: <b>23.4</b> against <b>23.3</b>. The rounded 17.9 changed the final answer.' }
};
const fromGiven = {
  title: 'Build on the given data, not on a rounded answer',
  height: 430,
  choices: Object.keys(FG).map((k) => ({ v: k, label: FG[k].label })),
  intro: 'Two ways to find the second unknown. Watch where each one starts. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = FG[k], gap = 40, cw = (ex.W - gap) / 2, nw = cw - 90;
    const svg = svgEl('svg', { width: ex.W, height: 430 }, stage); svg.style.position = 'absolute'; svg.style.left = '0'; svg.style.top = '0';
    const col = (x, title, color) => { const t = add(stage, box(h('div', 'u9l5-col-h', title), cw, 28), x, 0); t.style.position = 'absolute'; t.style.color = color; return t; };
    col(0, 'Chain: each step from the last', UNK); col(cw + gap, 'Every unknown from the given', REF);
    const node = (x, y, w, hh, html, cls = '') => { const n = add(stage, box(h('div', 'u9l5-node ' + cls, html), w, hh), x, y); return n; };
    const x0 = 0, x1 = cw + gap;
    const g1 = node(x0 + 20, 38, nw, 50, d.given, 'u9l5-given'), g2 = node(x1 + 20, 38, nw, 50, d.given, 'u9l5-given');
    const c1 = hide0(node(x0 + 20, 130, nw, 84, d.c1)), c2 = hide0(node(x0 + 20, 256, nw, 84, d.c2, 'u9l5-bad'));
    const k1 = hide0(node(x1 + 20, 130, nw, 84, d.h1)), k2 = hide0(node(x1 + 20, 256, nw, 84, d.h2, 'u9l5-good'));
    const v1 = add(stage, box(h('div', 'u9l5-verdict ' + d.v1.cls, d.v1.html), nw, 44), x0 + 20, 368), v2 = add(stage, box(h('div', 'u9l5-verdict ' + d.v2.cls, d.v2.html), nw, 44), x1 + 20, 368);
    hide0(v1); hide0(v2);
    const arr = (pts, color) => { const g = svgEl('g', { class: 'bk-curve' }, svg); g.style.opacity = 0; svgEl('path', { class: 'bk-stroke', d: 'M' + pts.map((p) => p.join(' ')).join('L'), fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g); const a = pts[pts.length - 1], b = pts[pts.length - 2]; const [ux, uy] = norm(a[0] - b[0], a[1] - b[1]); arrowHead(g, a[0], a[1], ux, uy, { color, width: 3, L: 12, hw: 6 }); return g; };
    const mid0 = x0 + 20 + nw / 2, mid1 = x1 + 20 + nw / 2, rgt = x1 + 20 + nw;
    const a1 = arr([[mid0, 90], [mid0, 128]], UNK), a2 = arr([[mid0, 216], [mid0, 254]], UNK);
    const b1 = arr([[mid1, 90], [mid1, 128]], REF), b2 = arr([[rgt - 30, 90], [rgt - 30, 110], [rgt + 40, 110], [rgt + 40, 236], [rgt - 30, 236], [rgt - 30, 254]], REF);
    const go = async (c, a, n) => { a.style.opacity = 1; await drawIn(a, 450, c); await fadeIn(c, n, 380); };
    return [
      { cap: d.cap0, run: async (c) => { await Promise.all([pulse(c, g1, 1.05), pulse(c, g2, 1.05)]); } },
      { cap: d.c1cap, run: (c) => go(c, a1, c1) },
      { cap: d.c2cap, run: (c) => go(c, a2, c2) },
      { cap: d.h1cap, run: (c) => go(c, b1, k1) },
      { cap: d.h2cap, run: (c) => go(c, b2, k2) },
      { cap: d.vcap, run: async (c) => { await pop(c, v1); await pop(c, v2); } }
    ];
  }
};

/* ======================================================================================
 * Explainer 6 (the star): solve it — a six-piece checklist triangle, the which-tool flowchart, and the checks
 * ====================================================================================== */
const SV = {
  tower: { label: 'Demo: the leaning tower', pts: { B: [0, 0], H: [0, 5], T: [1.5, 5] }, right: 'H', pad: [50, 70, 44, 70], ntsc: true,
    intro: 'The tower: base ' + T('B') + ', top ' + T('T') + ', and ' + T('H') + ' on the plumb line level with the top. Given: ' + T('BT=56') + ' m and ' + T('\\angle B=4^\\circ') + '.',
    angles: ['B', 'H', 'T'], sides: ['BT', 'HT', 'BH'], given: { BT: '56', B: '4^\\circ' }, arcR: { B: 50 },
    steps: [
      { p: 'T', path: ['start', 'angQ', 'sum'], why: T('\\angle T') + ': an <b>angle</b>, and the other acute angle (' + T('4^\\circ') + ') is known → <b>angle sum</b>.', tool: 'angle sum',
        work: ['\\angle T=90^\\circ-4^\\circ=86^\\circ'], val: '86^\\circ', done: T('\\angle T=86^\\circ') + ', the same as the tower’s angle with the ground.' },
      { p: 'HT', ref: 'B', path: ['start', 'sideQ', 'ratio'], why: T('HT') + ' (the shift): a <b>side</b>, and only one side is given → <b>SOH CAH TOA</b>. From ' + T('4^\\circ') + ': opposite and hypotenuse.', tool: 'SOH',
        work: ['\\sin4^\\circ=\\dfrac{HT}{56}', 'HT=56\\sin4^\\circ=3.9063\\ldots\\approx3.9'], val: '3.9', done: T('HT') + ' is on top: multiply. ' + T('HT=3.9063\\ldots\\approx3.9') + ' m.' },
      { p: 'BH', ref: 'B', path: ['start', 'sideQ', 'ratio'], why: T('BH') + ' (the height): a side; ' + T('HT') + ' was found, not given → <b>CAH</b> from the given 56 and ' + T('4^\\circ') + '.', tool: 'CAH',
        work: ['\\cos4^\\circ=\\dfrac{BH}{56}', 'BH=56\\cos4^\\circ=55.8636\\ldots\\approx55.9'], val: '55.9', done: T('BH=55.8636\\ldots\\approx55.9') + ' m. Every piece came from 56 and ' + T('4^\\circ') + '.' }
    ],
    pyth: ['HT^2+BH^2=3.9063^2+55.8636^2', '=3136.00=56^2\\ \\checkmark'], sum: ['90^\\circ+4^\\circ+86^\\circ=180^\\circ\\ \\checkmark'] },
  ex3: { label: 'Example 3 check', pts: { A: [0, 0], B: [4, 0], C: [4, -4.4424] }, right: 'B', pad: [46, 60, 44, 50],
    intro: 'Example 3. Given: ' + T('AB=25') + ' and ' + T('\\angle A=48^\\circ') + ', plus the right angle at ' + T('B') + '.',
    angles: ['A', 'B', 'C'], sides: ['AB', 'BC', 'AC'], given: { AB: '25', A: '48^\\circ' }, arcR: {},
    steps: [
      { p: 'C', path: ['start', 'angQ', 'sum'], why: T('\\angle C') + ': an <b>angle</b>, and the other acute angle (' + T('48^\\circ') + ') is known → <b>angle sum</b>.', tool: 'angle sum',
        work: ['\\angle C=90^\\circ-48^\\circ=42^\\circ'], val: '42^\\circ', done: T('\\angle C=42^\\circ') + '. Fill it in.' },
      { p: 'BC', ref: 'A', path: ['start', 'sideQ', 'ratio'], why: T('BC') + ': a <b>side</b>, only one side given → <b>SOH CAH TOA</b>. From ' + T('48^\\circ') + ': opposite and adjacent.', tool: 'TOA',
        work: ['\\tan48^\\circ=\\dfrac{BC}{25}', 'BC=25\\tan48^\\circ=27.7653\\ldots\\approx27.8'], val: '27.8', done: T('BC') + ' is on top: multiply. ' + T('BC=27.7653\\ldots\\approx27.8') + '.' },
      { p: 'AC', ref: 'A', path: ['start', 'sideQ', 'ratio'], why: T('AC') + ': a side; ' + T('BC') + ' was found, not given → <b>CAH</b> from the given 25 and ' + T('48^\\circ') + '.', tool: 'CAH',
        work: ['\\cos48^\\circ=\\dfrac{25}{AC}', 'AC=\\dfrac{25}{\\cos48^\\circ}=37.3619\\ldots\\approx37.4'], val: '37.4', done: T('AC') + ' is on the bottom: divide. ' + T('AC=37.3619\\ldots\\approx37.4') + '.' }
    ],
    pyth: ['AB^2+BC^2=25^2+27.7653^2=1395.91', 'AC^2=37.3619^2=1395.91\\ \\checkmark'], sum: ['90^\\circ+48^\\circ+42^\\circ=180^\\circ\\ \\checkmark'] },
  ex4: { label: 'Example 4 check', pts: { E: [0, 0], D: [0, 3.2], F: [-2.27, 0] }, right: 'E', pad: [46, 70, 46, 70],
    intro: 'Example 4. Given: ' + T('DE=8.6') + ' and ' + T('EF=6.1') + ', plus the right angle at ' + T('E') + '. No acute angle is given.',
    angles: ['D', 'E', 'F'], sides: ['DE', 'EF', 'DF'], given: { DE: '8.6', EF: '6.1' }, arcR: {},
    steps: [
      { p: 'DF', hyp: true, path: ['start', 'sideQ', 'pyth'], why: T('DF') + ': a <b>side</b>, and the other two sides are given → <b>Pythagoras</b>. ' + T('DF') + ' is the hypotenuse.', tool: 'Pythagoras',
        work: ['DF=\\sqrt{8.6^2+6.1^2}=\\sqrt{111.17}', '=10.5437\\ldots\\approx10.5'], val: '10.5', done: T('DF=10.5437\\ldots\\approx10.5') + '.' },
      { p: 'F', ref: 'F', path: ['start', 'angQ', 'inv'], why: T('\\angle F') + ': an <b>angle</b>, and the other acute angle is unknown → <b>inverse ratio</b>. From ' + T('F') + ': opposite and adjacent.', tool: 'inverse tan',
        work: ['\\tan F=\\dfrac{8.6}{6.1}=1.40984\\ldots', 'F=\\tan^{-1}(1.40984\\ldots)=54.6518\\ldots^\\circ\\approx55^\\circ'], val: '55^\\circ', done: T('\\angle F=54.6518\\ldots^\\circ\\approx55^\\circ') + '. Keep the unrounded value.' },
      { p: 'D', path: ['start', 'angQ', 'sum'], why: T('\\angle D') + ': an angle, and now the other acute angle is known → <b>angle sum</b>, from the unrounded ' + T('F') + '.', tool: 'angle sum',
        work: ['\\angle D=90^\\circ-54.6518^\\circ=35.3482^\\circ\\approx35^\\circ'], val: '35^\\circ', done: T('\\angle D=35.3482^\\circ\\approx35^\\circ') + '.' }
    ],
    pyth: ['DE^2+EF^2=8.6^2+6.1^2=111.17', 'DF^2=10.5437^2=111.17\\ \\checkmark'], sum: ['90^\\circ+54.6518^\\circ+35.3482^\\circ=180^\\circ\\ \\checkmark'] },
  ex5: { label: 'Example 5 check', pts: { W: [0, 0], T: [0, 3.69], F: [1.26, 0] }, right: 'W', pad: [44, 96, 44, 96],
    intro: 'Example 5, the ladder. Given: ' + T('FT=6.5') + ' m (the ladder) and ' + T('WF=2.1') + ' m, plus the right angle at ' + T('W') + '.',
    angles: ['F', 'T', 'W'], sides: ['FT', 'FW', 'TW'], given: { FT: '6.5', FW: '2.1' }, arcR: {},
    steps: [
      { p: 'TW', hyp: true, path: ['start', 'sideQ', 'pyth'], why: T('WT') + ': a <b>side</b>, and the other two sides are given → <b>Pythagoras</b>. The ladder is the hypotenuse.', tool: 'Pythagoras',
        work: ['WT=\\sqrt{6.5^2-2.1^2}=\\sqrt{37.84}', '=6.1514\\ldots\\approx6.2'], val: '6.2', done: 'Subtract: the hypotenuse is known. ' + T('WT=6.1514\\ldots\\approx6.2') + ' m.' },
      { p: 'F', ref: 'F', path: ['start', 'angQ', 'inv'], why: T('\\angle F') + ' (ladder to ground): an <b>angle</b>, other acute angle unknown → <b>inverse ratio</b>. From ' + T('F') + ': adjacent and hypotenuse.', tool: 'inverse cos',
        work: ['\\cos F=\\dfrac{2.1}{6.5}=0.32308\\ldots', 'F=\\cos^{-1}(0.32308\\ldots)=71.1509\\ldots^\\circ\\approx71^\\circ'], val: '71^\\circ', done: T('\\angle F=71.1509\\ldots^\\circ\\approx71^\\circ') + ', from the two given lengths.' },
      { p: 'T', path: ['start', 'angQ', 'sum'], why: T('\\angle T') + ' (ladder to wall): the other acute angle is now known → <b>angle sum</b>, from the unrounded ' + T('F') + '.', tool: 'angle sum',
        work: ['\\angle T=90^\\circ-71.1509^\\circ=18.8491^\\circ\\approx19^\\circ'], val: '19^\\circ', done: T('\\angle T=18.8491^\\circ\\approx19^\\circ') + '.' }
    ],
    pyth: ['WF^2+WT^2=2.1^2+6.1514^2=42.25', 'FT^2=6.5^2=42.25\\ \\checkmark'], sum: ['90^\\circ+71.1509^\\circ+18.8491^\\circ=180^\\circ\\ \\checkmark'] }
};
const SIDE_SHOW = { TW: 'WT', FW: 'WF', BT: 'BT' };
const solveIt = {
  title: 'Solve it: fill in all six',
  height: 600,
  choices: Object.keys(SV).map((k) => ({ v: k, label: SV[k].label })),
  intro: 'A checklist of six measures. Tick off what is given, then let the flowchart pick a tool for each missing piece. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = SV[k], FW = 560, fx = ex.W - FW, TW = fx - 12;
    const angles = {}; d.angles.forEach((v) => { if (v === d.right) return; angles[v] = d.given[v] ? { label: d.given[v], r: d.arcR[v] } : { label: '?', cls: 'u9l5-unk', r: d.arcR[v] }; });
    const sides = {}; d.sides.forEach((s) => { sides[s] = d.given[s] ? d.given[s] : { label: '?', cls: 'u9l5-unk' }; });
    const tri = new Tri(stage, { x: 0, y: 0, width: TW, height: 330, pad: d.pad, pts: d.pts, right: d.right, names: true, sides, angles });
    if (d.ntsc) tri.text(TW / 2, 320, 'not to scale', 'u9l5-ntsc');
    // checklist
    const CK = panel(stage, 0, 338, TW, 258, 'Checklist: six measures');
    const grid = h('div', 'u9l5-ck'); CK.appendChild(grid);
    const rows = {};
    const show_ = (s) => (SIDE_SHOW[s] || s);
    const order = d.angles.map((v) => ['a', v]).concat(d.sides.map((s) => ['s', s]));
    for (const [t, p] of order) {
      const name = t === 'a' ? T('\\angle ' + p) : T(show_(p));
      const isR = t === 'a' && p === d.right, g = d.given[p];
      const nEl = h('div', 'u9l5-ckv', name), vEl = h('div', 'u9l5-ckv', isR ? T('90^\\circ') : g ? T(g) : `<span class="u9l5-cu">${T('?')}</span>`);
      const tEl = h('div', 'u9l5-ckt', isR ? '<span class="u9l5-badge u9l5-given">right angle</span>' : g ? '<span class="u9l5-badge u9l5-given">given</span>' : '');
      grid.append(nEl, vEl, tEl); rows[p] = { vEl, tEl }; if (!isR && !g) [nEl, vEl, tEl].forEach((e) => (e.style.opacity = 0.75));
    }
    const F = toolChart(stage, fx, 0, FW);
    const Wk = panel(stage, fx, 306, FW, 290, 'Work');
    const wHead = line(Wk, '', 'u9l5-line'), wLines = h('div'); Wk.appendChild(wLines);
    const unkEl = (p) => (p.length === 2 ? tri.sl[key(p)] : tri.al[p]);
    const steps = [{ cap: d.intro + ' Three to find.', run: async (c) => { for (const p of Object.keys(d.given)) await pulse(c, unkEl(p), 1.25); } }];
    d.steps.forEach((s, i) => {
      const isSide = s.p.length === 2;
      steps.push({ cap: s.why, run: async (c) => {
        F.fade(); tri.clearRoles(); wLines.innerHTML = '';
        wHead.innerHTML = `<b>Find ${T(isSide ? show_(s.p) : '\\angle ' + s.p)}</b> &nbsp;<span class="u9l5-badge" style="background:#13807a">${s.tool}</span>`;
        await pulse(c, unkEl(s.p), 1.35);
        await F.light(c, s.path, { pause: 80 });
        if (s.ref) await tri.roles(c, s.ref, { stagger: 80 }); else if (s.hyp) await tri.roles(c, null, { stagger: 80 });
      } });
      steps.push({ cap: s.done, run: async (c) => {
        for (const w of s.work) { const e = hide0(line(wLines, T(w), 'u9l5-eq')); await show(c, e); }
        if (isSide) tri.sideLabel(s.p, s.val, { cls: 'u9l5-found' }); else tri.setAngleLabel(s.p, s.val, 'u9l5-found');
        rows[s.p].vEl.innerHTML = T(s.val); rows[s.p].tEl.innerHTML = `<span class="u9l5-ok">✓</span>&nbsp;${s.tool}`;
        [rows[s.p].vEl, rows[s.p].tEl, rows[s.p].vEl.previousSibling].forEach((e) => (e.style.opacity = 1));
        await Promise.all([pop(c, unkEl(s.p), 380), pop(c, rows[s.p].vEl, 380)]);
      } });
    });
    let stp;
    steps.push({ cap: '<b>Check 1:</b> the Pythagorean Theorem, with the <b>unrounded</b> sides.', run: async (c) => {
      F.fade(); tri.clearRoles(); wLines.innerHTML = ''; wHead.innerHTML = '<b>Consistency check</b>';
      const hh = hide0(line(wLines, '<b>Pythagoras</b>', 'u9l5-sm')); await show(c, hh);
      for (const w of d.pyth) { const e = hide0(line(wLines, T(w), 'u9l5-eq')); await show(c, e); }
    } });
    steps.push({ cap: '<b>Check 2:</b> the three angles add to ' + T('180^\\circ') + '. Every side and every angle: <b>solved</b>.', run: async (c) => {
      const hh = hide0(line(wLines, '<b>Angle sum</b>', 'u9l5-sm')); hh.style.marginTop = '6px'; await show(c, hh);
      for (const w of d.sum) { const e = hide0(line(wLines, T(w), 'u9l5-eq')); await show(c, e); }
      stp = stamp(stage, 'solved', { ok: true, x: TW - 70, y: 40, size: 'lg' }); await stampIn(c, stp);
    } });
    return steps;
  }
};

/* ======================================================================================
 * Explainer 7: from words to a triangle — the ladder (Example 5)
 * ====================================================================================== */
const ladder = {
  title: 'From words to a triangle: the ladder',
  height: 470,
  intro: 'Example 5 in words. Build the triangle before you calculate anything. Press <b>Next</b>.',
  make(stage, v, ex) {
    const SW = 500, gy = 440, wx = 130, m = 56, Lm = 6.5;
    const svg = svgEl('svg', { width: SW, height: 470 }, stage); svg.style.position = 'absolute'; svg.style.left = '0'; svg.style.top = '0';
    const html = h('div'); html.style.cssText = `position:absolute;left:0;top:0;width:${SW}px;height:470px;pointer-events:none`; stage.appendChild(html);
    svgEl('rect', { x: 0, y: gy, width: SW, height: 30, fill: '#cfe3bf' }, svg);
    svgEl('rect', { x: wx - 70, y: 14, width: 70, height: gy - 14, fill: '#e9d3c3', stroke: '#8a6a55', 'stroke-width': 1.5 }, svg);
    for (let y = gy - 22; y > 14; y -= 22) { svgEl('line', { x1: wx - 70, x2: wx, y1: y, y2: y, stroke: '#b99a86', 'stroke-width': 1 }, svg); const o = ((gy - y) / 22) % 2 ? 0 : 17; for (let x = wx - 70 + o + 17; x < wx; x += 35) svgEl('line', { x1: x, x2: x, y1: y, y2: y + 22, stroke: '#b99a86', 'stroke-width': 1 }, svg); }
    svgEl('line', { x1: 0, x2: SW, y1: gy, y2: gy, stroke: INK, 'stroke-width': 2.4 }, svg);
    svgEl('line', { x1: wx, x2: wx, y1: 14, y2: gy, stroke: INK, 'stroke-width': 2.4 }, svg);
    const lad = svgEl('g', {}, svg);
    const drawLadder = (dm) => {
      lad.innerHTML = '';
      const hm = Math.sqrt(Lm * Lm - dm * dm), F = [wx + dm * m, gy], Tt = [wx, gy - hm * m], [ux, uy] = norm(Tt[0] - F[0], Tt[1] - F[1]), nx = -uy * 9, ny = ux * 9;
      for (const sgn of [-1, 1]) svgEl('line', { x1: F[0] + sgn * nx, y1: F[1] + sgn * ny, x2: Tt[0] + sgn * nx, y2: Tt[1] + sgn * ny, stroke: '#8b5e34', 'stroke-width': 5, 'stroke-linecap': 'round' }, lad);
      for (let s = 0.35; s < Lm; s += 0.35) { const p = [F[0] + ux * s * m, F[1] + uy * s * m]; svgEl('line', { x1: p[0] - nx, y1: p[1] - ny, x2: p[0] + nx, y2: p[1] + ny, stroke: '#8b5e34', 'stroke-width': 3 }, lad); }
      return { F, Tt };
    };
    let pts = drawLadder(0.8);
    const hm = Math.sqrt(Lm * Lm - 2.1 * 2.1), W = [wx, gy], Fp = [wx + 2.1 * m, gy], Tp = [wx, gy - hm * m];
    const ov = svgEl('g', {}, svg);
    const seg = (P, Q, color, w) => { const g = svgEl('g', { class: 'bk-curve' }, ov); g.style.opacity = 0; svgEl('path', { class: 'bk-stroke', d: `M${P[0]} ${P[1]}L${Q[0]} ${Q[1]}`, stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, g); return g; };
    const sHyp = seg(Fp, Tp, HYP, 6), sAdj = seg(W, Fp, ADJ, 6), sOpp = seg(W, Tp, OPP, 6);
    const rmk = rightMark(ov, W, Fp, Tp, 16, { color: INK, width: 2.4 }); rmk.style.opacity = 0;
    const aF = angleArc(ov, Fp, W, Tp, 34, { color: REF, width: 3.4 }), aT = angleArc(ov, Tp, W, Fp, 46, { color: REF, width: 3.4 }); aF.style.opacity = 0; aT.style.opacity = 0;
    const L = (x, y, s, cls, color) => { const d = h('div', cls, s); d.style.position = 'absolute'; if (color) d.style.color = color; html.appendChild(d); place(d, x, y); d.style.opacity = 0; return d; };
    const lW = L(W[0] - 22, W[1] + 16, T('W'), 'u9l5-vlab'), lF = L(Fp[0] + 10, Fp[1] + 18, T('F'), 'u9l5-vlab'), lT = L(Tp[0] - 22, Tp[1] - 6, T('T'), 'u9l5-vlab');
    const mid = [(Fp[0] + Tp[0]) / 2, (Fp[1] + Tp[1]) / 2];
    const l65 = L(mid[0] + 46, mid[1], T('6.5\\text{ m}'), 'u9l5-slab', HYP), l21 = L((W[0] + Fp[0]) / 2, gy + 16, T('2.1\\text{ m}'), 'u9l5-slab', ADJ), lWT = L(wx + 26, (gy + Tp[1]) / 2 + 40, T('?'), 'u9l5-slab', UNK);
    const lAF = L(Fp[0] - 44, Fp[1] - 22, T('?'), 'u9l5-alab', REF), lAT = L(Tp[0] + 22, Tp[1] + 72, T('?'), 'u9l5-alab', REF);
    const P = panel(stage, SW + 20, 0, ex.W - SW - 20, 466, 'The triangle in the words');
    const pl = [
      `<b>Right angle</b> at ${T('W')}: the wall meets the ground.`,
      `<b class="u9l5-ch">Hypotenuse</b> ${T('FT')}: the ladder, ${T('6.5')} m.`,
      `${T('WF=2.1')} m along the ground; ${T('WT')}, up the wall, is <b class="u9l5-cu">unknown</b>.`,
      `${T('\\angle F')}: ladder and <b>ground</b>. From ${T('F')}, ${T('WF')} is <b class="u9l5-ca">adjacent</b>, ${T('WT')} <b class="u9l5-co">opposite</b>.`,
      `${T('\\angle T')}: ladder and <b>wall</b>.`,
      `<b>Plan:</b> ${T('WT')} by Pythagoras (two sides given); ${T('\\angle F')} by ${T('\\cos^{-1}')}; ${T('\\angle T=90^\\circ-\\angle F')}.`
    ].map((s) => hide0(line(P, s, 'u9l5-sm')));
    const on = (c, ...els) => Promise.all(els.map((e) => appear(c, e, 320)));
    return [
      { cap: 'A 6.5 m ladder leans on a vertical wall. Slide its foot out until it is <b>2.1 m</b> from the wall.',
        run: async (c) => { await tween(c, 1500, (t) => { pts = drawLadder(0.8 + 1.3 * t); }); pts = drawLadder(2.1); } },
      { cap: 'The wall meets the ground at a <b>right angle</b>: call that corner ' + T('W') + '.', run: async (c) => { await on(c, rmk, lW); await show(c, pl[0]); } },
      { cap: T('F') + ' is the foot and ' + T('T') + ' the top. The ladder ' + T('FT') + ' is across from the right angle: the <b>hypotenuse</b>.',
        run: async (c) => { await on(c, lF, lT); sHyp.style.opacity = 1; await Promise.all([this_draw(c, sHyp), on(c, l65)]); await show(c, pl[1]); } },
      { cap: T('WF=2.1') + ' m is along the ground. The height ' + T('WT') + ' up the wall is what we want.',
        run: async (c) => { sOpp.style.opacity = 1; await this_draw(c, sOpp); await on(c, lWT); await show(c, pl[2]); } },
      { cap: '“The angle with the <b>ground</b>” is at ' + T('F') + ', between the ladder and the ground.',
        run: async (c) => { sAdj.style.opacity = 1; await this_draw(c, sAdj); await on(c, l21, aF, lAF); await show(c, pl[3]); } },
      { cap: '“The angle with the <b>wall</b>” is at ' + T('T') + ', between the ladder and the wall. A different corner!', run: async (c) => { await on(c, aT, lAT); await show(c, pl[4]); } },
      { cap: 'Two sides are given, so: Pythagoras for ' + T('WT') + ', ' + T('\\cos^{-1}') + ' for ' + T('\\angle F') + ', and the angle sum for ' + T('\\angle T') + '.', run: async (c) => { await show(c, pl[5]); } }
    ];
  }
};
const this_draw = (c, g) => drawIn(g, 600, c);

/* ======================================================================================
 * Explainer 8: which check catches which slip
 * ====================================================================================== */
const CI = {
  ex3: { label: 'Slip in Example 3', pts: { A: [0, 0], B: [4, 0], C: [4, -4.4424] }, right: 'B', pad: [46, 60, 44, 50],
    sides: { AB: '25', BC: '27.8', AC: '16.7' }, angles: { A: '48^\\circ', C: '42^\\circ' }, bad: { side: 'AC' },
    claim: `${T('\\angle C=42^\\circ')}, ${T('BC=27.8')}, ${T('AC=16.7')}`,
    cap0: 'A classmate solved Example 3: ' + T('\\angle C=42^\\circ') + ', ' + T('BC=27.8') + ', ' + T('AC=16.7') + '. Check it before trusting it.',
    checks: [
      { n: 'Angles add to 180°', w: ['90^\\circ+48^\\circ+42^\\circ=180^\\circ'], ok: true, cap: '<b>Check 1:</b> the angles add to ' + T('180^\\circ') + '. It passes, but it only tests the angles.' },
      { n: 'Hypotenuse is the longest side', w: ['AC=16.7<AB=25'], ok: false, cap: '<b>Check 2:</b> the hypotenuse must be the longest side. ' + T('AC=16.7') + ' is shorter than the leg ' + T('AB=25') + '.' },
      { n: 'Pythagoras', w: ['25^2+27.8^2\\approx1398', '16.7^2\\approx279'], ok: false, cap: '<b>Check 3:</b> Pythagoras: ' + T('25^2+27.8^2\\approx1398') + ', but ' + T('16.7^2\\approx279') + '. Not even close.' }
    ],
    fixCap: 'The slip: ' + T('\\cos48^\\circ=\\tfrac{25}{AC}') + ' has ' + T('AC') + ' on the <b>bottom</b>, so divide: ' + T('AC=25\\div\\cos48^\\circ=37.4') + ', not ' + T('25\\cos48^\\circ=16.7') + '.',
    fix: { side: ['AC', '37.4'] },
    fixed: [['90^\\circ+48^\\circ+42^\\circ=180^\\circ'], ['AC=37.4>AB=25'], ['25^2+27.7653^2=1395.91', '37.3619^2=1395.91']] },
  ex4: { label: 'Slip in Example 4', pts: { E: [0, 0], D: [0, 3.2], F: [-2.27, 0] }, right: 'E', pad: [46, 70, 46, 70],
    sides: { DE: '8.6', EF: '6.1', DF: '10.5' }, angles: { F: '35^\\circ', D: '55^\\circ' }, bad: { angles: ['F', 'D'] },
    claim: `${T('DF=10.5')}, ${T('\\angle F=35^\\circ')}, ${T('\\angle D=55^\\circ')}`,
    cap0: 'A classmate solved Example 4: ' + T('DF=10.5') + ', ' + T('\\angle F=35^\\circ') + ', ' + T('\\angle D=55^\\circ') + '. Check it.',
    checks: [
      { n: 'Angles add to 180°', w: ['90^\\circ+35^\\circ+55^\\circ=180^\\circ'], ok: true, cap: '<b>Check 1:</b> the angles add to ' + T('180^\\circ') + '. Passes.' },
      { n: 'Pythagoras', w: ['8.6^2+6.1^2=111.17', '10.5437^2=111.17'], ok: true, cap: '<b>Check 2:</b> Pythagoras passes too: ' + T('DF') + ' came straight from the two given legs.' },
      { n: 'Bigger angle faces the longer leg', w: ['DE=8.6>EF=6.1', '\\text{so }\\angle F>\\angle D\\text{, but }35^\\circ<55^\\circ'], ok: false, cap: '<b>Check 3:</b> ' + T('\\angle F') + ' faces the longer leg ' + T('DE=8.6') + ', so it must be the bigger acute angle. It isn’t.' }
    ],
    fixCap: 'The slip: from ' + T('F') + ', ' + T('DE') + ' is opposite and ' + T('EF') + ' adjacent, so ' + T('\\tan F=\\tfrac{8.6}{6.1}') + ', not ' + T('\\tfrac{6.1}{8.6}') + '. Then ' + T('\\angle F=55^\\circ') + ', ' + T('\\angle D=35^\\circ') + '.',
    fix: { angles: [['F', '55^\\circ'], ['D', '35^\\circ']] },
    fixed: [['90^\\circ+55^\\circ+35^\\circ=180^\\circ'], ['8.6^2+6.1^2=111.17', '10.5437^2=111.17'], ['\\angle F=55^\\circ>\\angle D=35^\\circ']] }
};
const catchIt = {
  title: 'Which check catches the slip?',
  height: 480,
  choices: Object.keys(CI).map((k) => ({ v: k, label: CI[k].label })),
  intro: 'A classmate’s finished triangle. Run the checks one at a time. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CI[k], TW = 340;
    const tri = new Tri(stage, { x: 0, y: 0, width: TW, height: 330, pad: d.pad, pts: d.pts, right: d.right, names: true, sides: d.sides, angles: d.angles });
    const CP = panel(stage, 0, 340, TW, 136, 'Classmate’s answer'); line(CP, d.claim, 'u9l5-sm');
    const P = panel(stage, TW + 20, 0, ex.W - TW - 20, 476, 'Checks');
    const grid = h('div', 'u9l5-chk'); P.appendChild(grid);
    const rows = d.checks.map((ch, i) => {
      if (i) grid.appendChild(h('div', 'u9l5-chk-sep'));
      const n = h('div', 'u9l5-chk-n', ch.n), m = h('div', 'u9l5-chk-m ' + (ch.ok ? 'u9l5-y' : 'u9l5-n'), ch.ok ? '✓' : '✗'), w = h('div', 'u9l5-chk-w', ch.w.map((s) => T(s)).join('<br>'));
      grid.append(n, m, w); [n, m, w].forEach(hide0); return { n, m, w };
    });
    const fixL = hide0(line(P, '', 'u9l5-sm')); fixL.style.marginTop = 'auto'; fixL.style.color = REF;
    const badEls = () => (d.bad.side ? [tri.sl[key(d.bad.side)]] : d.bad.angles.map((v) => tri.al[v]));
    const steps = [{ cap: d.cap0, run: async (c) => { await pulse(c, CP, 1.03); } }];
    d.checks.forEach((ch, i) => steps.push({ cap: ch.cap, run: async (c) => {
      const r = rows[i]; await show(c, r.n); await show(c, r.w); await pop(c, r.m, 360);
      if (!ch.ok) { badEls().forEach((e) => { e.style.color = UNK; }); await Promise.all(badEls().map((e) => pulse(c, e, 1.3))); }
    } }));
    steps.push({ cap: d.fixCap, run: async (c) => {
      if (d.fix.side) tri.sideLabel(d.fix.side[0], d.fix.side[1], { cls: 'u9l5-found' }); else d.fix.angles.forEach(([v, l]) => tri.setAngleLabel(v, l, 'u9l5-found'));
      d.fixed.forEach((w, i) => { rows[i].w.innerHTML = w.map((s) => T(s)).join('<br>'); rows[i].m.className = 'u9l5-chk-m u9l5-y'; rows[i].m.textContent = '✓'; });
      fixL.innerHTML = '<b>Fixed:</b> every check passes.';
      await Promise.all(rows.map((r) => pop(c, r.m, 360))); await show(c, fixL);
    } });
    return steps;
  }
};

/* ---------------- mount ---------------- */
mountWarm();
mountFigs();
export const explainers = mountExplainers({ tools, whichTool, twoRoutes, twoPieces, fromGiven, solveIt, ladder, catchIt });
