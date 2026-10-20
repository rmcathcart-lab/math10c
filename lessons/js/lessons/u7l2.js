/* Math 10C · Unit 7 · Lesson 2 — From Slope to Equation: building linear equations with y = mx + b.
 * Warm-up cricket thermometer (art + a step-by-step graph that ends at T = ¼C + 5), static figures (Example 2 grid,
 * the turned slope triangle, Example 4 grid, the summary thumbnails) and the explainers:
 *   assemble (the equation assembles itself: b drops in from the y-axis, m from the slope triangle; Example 1),
 *   readGraph (read b where the line crosses the y-axis, count m between lattice points, check with a third point;
 *   Example 2), spotError (four students' equations for one line, each graphed: which lands on it?),
 *   copyTri (parallel: copy the slope triangle and slide it to the new y-intercept; Example 3a),
 *   turnTri (perpendicular: turn the slope triangle 90°, rise and run swap, one sign flips; Example 3b),
 *   strategy (flowchart: where does m come from, where does b come from), flatten (slope → 0: y = mx + b collapses to
 *   y = b; Example 4a–c), steepen (a line through (−3, 0) steepens until vertical: m and b run away, x = −3; Example 4d–f).
 * Colours: run amber, rise purple, lines blue, the y-intercept (b) teal. */
import {
  h, tex, add, box, Graph, Flowchart, ValueTable, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pairTex, texNum, svgEl, liveCtx, pulse, place, drawIn, rightMark, anim, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const RUN = COLORS.amber, RISE = COLORS.purple, LINE = COLORS.blue, BCOL = COLORS.teal, INK = COLORS.ink, RED = COLORS.red, GRAY = COLORS.gray, SLATE = COLORS.slate;
const cR = (s) => `\\textcolor{${RISE}}{${s}}`, cU = (s) => `\\textcolor{${RUN}}{${s}}`, cB = (s) => `\\textcolor{${BCOL}}{${s}}`, cM = (s) => `\\textcolor{${LINE}}{${s}}`;

/* =============================== helpers =============================== */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const red = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
/** TeX of n/d in lowest terms, sign in front; whole numbers plain */
const fr = (n, d, big = true) => { const [a, b] = red(n, d); if (b === 1) return String(a); return (a < 0 ? '-' : '') + `\\${big ? 'd' : 't'}frac{${Math.abs(a)}}{${b}}`; };
/** slope as rise (purple) over run (amber), sign in front */
const mRR = (n, d) => { const [a, b] = red(n, d); return (a < 0 ? '-' : '') + `\\dfrac{${cR(Math.abs(a))}}{${cU(b)}}`; };
const par = (v) => (String(v).startsWith('-') ? `\\left(${v}\\right)` : v);
const pr = (x, y) => pairTex(x, y);
const n = (v) => texNum(v).replace('-', '−');
/** "y = mx + b" in TeX. o.color colours m blue and b teal */
function eqTex(nn, d, b, o = {}) {
  const [a, q] = red(nn, d), C = o.color ? cM : (s) => s, CB = o.color ? cB : (s) => s;
  if (a === 0) return `y=${CB(b)}`;
  const mt = q === 1 && Math.abs(a) === 1 ? (a < 0 ? '-' : '') : fr(a, q);
  const mPart = mt === '' || mt === '-' ? mt : C(mt);
  const bPart = b === 0 ? '' : b > 0 ? `+${CB(b)}` : `-${CB(-b)}`;
  return `y=${mPart}x${bPart}`;
}
/** m·x + b worked out at x: "\\tfrac14(-8)-6=-2-6=-8" */
function substTex(nn, d, b, x) {
  const [a, q] = red(nn, d), mx = a * x / q, y = mx + b;
  const mt = q === 1 ? String(a) : fr(a, q, false), bS = b === 0 ? '' : b > 0 ? `+${b}` : `-${-b}`;
  return `${mt}\\left(${x}\\right)${bS}=${texNum(mx)}${bS}=${texNum(y)}`;
}
/** a whole line through the two points get() returns (it can change), clipped to the window, arrows at the edges */
function dynLine(G, get, o) {
  const nv = (x, y) => { const L = Math.hypot(x, y) || 1; return [x / L, y / L]; };
  return G.curve(() => {
    const [a, b] = get(), d = [b[0] - a[0], b[1] - a[1]], tt = G._clipT(a, d, -Infinity, Infinity); if (!tt) return { subs: [] };
    const P = (t) => G.toPx(a[0] + d[0] * t, a[1] + d[1] * t), s0 = P(tt[0]), s1 = P(tt[1]);
    return { subs: [[s0, s1]], ends: [{ p: s0, d: nv(s0[0] - s1[0], s0[1] - s1[1]), s: 'arrow', k: 0, si: 0, last: false }, { p: s1, d: nv(s1[0] - s0[0], s1[1] - s0[1]), s: 'arrow', k: 1, si: 0, last: true }] };
  }, o, 'bk-line', G.layers.data);
}
const show = (c, el) => fadeIn(c, el, 320);
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const unhide = (el) => { if (el) el.style.opacity = ''; return el; };
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u7l2-panel ' + cls, title ? `<div class="u7l2-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u7l2-line ' + cls, html); p.appendChild(d); return d; };
/** centre of el in stage coordinates (offsets only, so a scaled page doesn't matter) */
function posIn(stage, el) {
  let x = el.offsetWidth / 2, y = el.offsetHeight / 2, e = el;
  while (e && e !== stage) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
  return [x, y];
}
const gPos = (G, x, y) => { const [px, py] = G.toPx(x, y); return [G.el.offsetLeft + px, G.el.offsetTop + py]; };
/** a chip flies from stage point `from` into `slot`, which then shows `html` */
async function fly(c, stage, from, slot, html, cls = '') {
  const chip = add(stage, h('div', 'u7l2-fly ' + cls, html), from[0], from[1]);
  chip.style.translate = '-50% -50%';
  const to = posIn(stage, slot), dx = to[0] - from[0], dy = to[1] - from[1];
  await anim(c, chip, [{ opacity: 0, transform: 'translate(0px, 0px) scale(.5)' }, { opacity: 1, transform: 'translate(0px, 0px) scale(1.2)', offset: 0.25 },
    { opacity: 1, transform: `translate(${dx}px, ${dy}px) scale(1)` }], 1150);
  chip.remove();
  slot.innerHTML = html; slot.classList.add('on');
  await pop(c, slot, 300);
}
/** the y = [m] x + [b] builder with two empty slots */
function builder(P, cls = '') {
  const row = h('div', 'u7l2-eqrow ' + cls);
  row.innerHTML = `<div class="u7l2-eqp">${T('y=')}</div><div class="u7l2-slot u7l2-slot-m">${T('m')}</div><div class="u7l2-eqp">${T('x+')}</div><div class="u7l2-slot u7l2-slot-b">${T('b')}</div>`;
  P.appendChild(row);
  const [m, b] = row.querySelectorAll('.u7l2-slot');
  return { row, m, b };
}
/** a Graph whose x and y units are the same size (so right angles look right) */
function sqG(stage, x, y, win, unit, o = {}) {
  const l = win.xmin >= 0 ? 42 : 18, b = win.ymin >= 0 ? 34 : 18;
  return new Graph(stage, Object.assign({ x, y, width: Math.round((win.xmax - win.xmin) * unit) + l + 18, height: Math.round((win.ymax - win.ymin) * unit) + 18 + b }, win, o));
}
/** highlight the y-axis (teal band) */
function yAxisBand(G) {
  const [px] = G.toPx(0, 0), y0 = G.toPx(0, G.win.ymax)[1], y1 = G.toPx(0, G.win.ymin)[1];
  return svgEl('line', { x1: px, x2: px, y1: y0, y2: y1, stroke: BCOL, 'stroke-width': 12, 'stroke-opacity': 0.22, 'stroke-linecap': 'round' }, G.layers.bg);
}

/* ---------------------------------------------------------------------------------------------------------------
 * Slope triangle on a Graph: run leg (amber) from (x, y) across, then rise leg (purple) up/down to the line.
 * Kept in sync via G.track. Can be turned about a graph point with rot(c, deg, about).
 * ------------------------------------------------------------------------------------------------------------- */
class SlopeTri {
  constructor(G, s, o = {}) {
    this.G = G; this.s = Object.assign({}, s); this.o = o; this.ang = 0; this.about = null;
    const w = o.w || 5;
    this.g = svgEl('g', { class: 'u7l2-tri' }, o.layer || G.layers.data);
    this.g.style.transformBox = 'view-box'; this.g.style.transformOrigin = '0px 0px';
    this.fill = svgEl('path', { fill: o.fill || LINE, 'fill-opacity': o.fillOp ?? 0.12, stroke: 'none' }, this.g);
    this.mark = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 1.6 }, this.g);
    this.runP = svgEl('path', { class: 'bk-stroke', stroke: o.runColor || RUN, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, this.g);
    this.riseP = svgEl('path', { class: 'bk-stroke', stroke: o.riseColor || RISE, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, this.g);
    this.lRun = o.labels === false ? null : h('div', 'bk-lab u7l2-tlab u7l2-trun');
    this.lRise = o.labels === false ? null : h('div', 'bk-lab u7l2-tlab u7l2-trise');
    if (this.lRun) G.html.append(this.lRun, this.lRise);
    G.track(this.g, () => this.draw());
  }
  text(kind, v) { const f = kind === 'run' ? this.o.runText : this.o.riseText; if (f) return f(v); return `<b>${kind}</b> ${n(Math.round(v * 10) / 10)}`; }
  draw() {
    const G = this.G, { x, y, run, rise } = this.s;
    const P = G.toPx(x, y), C = G.toPx(x + run, y), Q = G.toPx(x + run, y + rise);
    const d = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    this.fill.setAttribute('d', `M${P[0]} ${P[1]} L${C[0]} ${C[1]} L${Q[0]} ${Q[1]} Z`);
    this.runP.setAttribute('d', d(P, C)); this.riseP.setAttribute('d', d(C, Q));
    const sx = Math.sign(P[0] - C[0]), sy = Math.sign(Q[1] - C[1]), k = 10;
    this.mark.setAttribute('d', Math.abs(C[0] - P[0]) > 2 * k && Math.abs(Q[1] - C[1]) > 2 * k ? `M${C[0] + sx * k} ${C[1]} L${C[0] + sx * k} ${C[1] + sy * k} L${C[0]} ${C[1] + sy * k}` : '');
    if (this.about) { const [ax, ay] = G.toPx(...this.about); this.g.setAttribute('transform', `rotate(${-this.ang} ${ax} ${ay})`); }
    if (!this.lRun) return;
    this.lRun.innerHTML = this.text('run', run); this.lRise.innerHTML = this.text('rise', rise);
    const gap = this.o.gap ?? 6;
    place(this.lRun, (P[0] + C[0]) / 2, P[1], this.o.runSide || (rise >= 0 ? 's' : 'n'), gap);
    place(this.lRise, C[0], (C[1] + Q[1]) / 2, this.o.riseSide || (run >= 0 ? 'e' : 'w'), gap + 2);
    this.lRun.style.visibility = Math.abs(run) < 1e-9 ? 'hidden' : '';
    this.lRise.style.visibility = Math.abs(rise) < 1e-9 ? 'hidden' : '';
  }
  set(s) { Object.assign(this.s, s); this.draw(); return this; }
  to(c, s, ms = 900) { const a = Object.assign({}, this.s); return tween(c, ms, (t) => { const o = {}; for (const k in s) o[k] = a[k] + (s[k] - a[k]) * t; this.set(o); }); }
  /** turn the triangle (counterclockwise for positive deg) about a graph point; labels are hidden first */
  async rot(c, deg, about, ms = 1600) {
    this.about = about; this.labels(false);
    await tween(c, ms, (t) => { this.ang = deg * t; this.draw(); });
  }
  labels(on) { [this.lRun, this.lRise].forEach((l) => { if (l) l.style.display = on ? '' : 'none'; }); }
  tip() { return [this.s.x + this.s.run, this.s.y + this.s.rise]; }
  async drawIn(c, ms = 500) {
    const [lr, ls] = [this.lRun, this.lRise]; this.fill.style.opacity = 0; hide(lr); hide(ls);
    await drawIn(this.runP, ms, c); if (lr) await fadeIn(c, lr, 220);
    await drawIn(this.riseP, ms, c); if (ls) await fadeIn(c, ls, 220);
    await appear(c, this.fill, 250);
  }
  remove() { this.g.remove(); if (this.lRun) { this.lRun.remove(); this.lRise.remove(); } }
  fade(op = 0.3) { this.g.style.opacity = op; if (this.lRun) { this.lRun.style.opacity = op; this.lRise.style.opacity = op; } }
}
/** right-angle mark at graph point V between directions to graph points A and B */
function rmark(G, V, A, B, s = 16, color = INK) {
  const v = G.toPx(...V);
  return rightMark(G.layers.top, v, G.toPx(...A), G.toPx(...B), s, { color, width: 2.4 });
}

/* =============================== warm-up: the cricket thermometer =============================== */
function mountCrickets() {
  const host = document.getElementById('u7l2-crickets'); if (!host) return;
  const W = 960, H = 250;
  const wrap = h('div', 'u7l2-crwrap'); box(wrap, W, H); host.appendChild(wrap);
  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, wrap);
  const html = h('div', 'bk-html'); wrap.appendChild(html);
  const lab = (x, y, s, pos, cls) => { const d = h('div', 'bk-lab ' + cls, s); html.appendChild(d); return place(d, x, y, pos, 2); };
  svgEl('rect', { x: 0, y: 0, width: W, height: H, rx: 16, fill: '#eef5ea' }, svg);
  svgEl('rect', { x: 70, y: 196, width: W - 70, height: 8, fill: '#bcd8b0' }, svg);
  const scenes = [{ x: 30, C: 20, t: 10 }, { x: 345, C: 60, t: 20 }, { x: 660, C: 100, t: null }];
  const ty = (t) => 180 - t * 3.6;                    // 0 °C at y = 180, 40 °C at y = 36
  scenes.forEach((s) => {
    const x = s.x + 40;
    // thermometer
    svgEl('rect', { x: x - 11, y: 24, width: 22, height: 168, rx: 11, fill: '#fff', stroke: INK, 'stroke-width': 2.2 }, svg);
    svgEl('circle', { cx: x, cy: 200, r: 19, fill: '#fff', stroke: INK, 'stroke-width': 2.2 }, svg);
    [0, 10, 20, 30, 40].forEach((t) => { svgEl('line', { x1: x + 11, x2: x + 20, y1: ty(t), y2: ty(t), stroke: INK, 'stroke-width': 1.8 }, svg); lab(x + 22, ty(t), String(t), 'e', 'u7l2-crt'); });
    if (s.t != null) {
      svgEl('rect', { x: x - 5, y: ty(s.t), width: 10, height: 200 - ty(s.t), fill: RED }, svg);
      svgEl('circle', { cx: x, cy: 200, r: 14, fill: RED }, svg);
      lab(x, 236, `${s.t} °C`, 'c', 'u7l2-crtemp');
    } else {
      svgEl('circle', { cx: x, cy: 200, r: 14, fill: '#f0b9b4' }, svg);
      lab(x, 110, '?', 'c', 'u7l2-crq');
      lab(x, 236, '? °C', 'c', 'u7l2-crtemp u7l2-crtq');
    }
    lab(x - 18, 30, '°C', 'w', 'u7l2-crt');
    // cricket, facing left
    const cx = s.x + 170, cy = 172, g = svgEl('g', {}, svg);
    svgEl('path', { d: `M${cx + 34} ${cy - 2} L${cx + 58} ${cy - 30} L${cx + 74} ${cy + 16}`, fill: 'none', stroke: '#2f6b28', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
    svgEl('path', { d: `M${cx - 8} ${cy + 8} l-8 14 M${cx + 10} ${cy + 8} l-4 14`, fill: 'none', stroke: '#2f6b28', 'stroke-width': 3 }, g);
    svgEl('ellipse', { cx: cx + 12, cy, rx: 38, ry: 17, fill: '#5aa64b', stroke: INK, 'stroke-width': 2 }, g);
    svgEl('circle', { cx: cx - 28, cy: cy - 3, r: 13, fill: '#3f8a33', stroke: INK, 'stroke-width': 2 }, g);
    svgEl('circle', { cx: cx - 33, cy: cy - 7, r: 4, fill: '#fff' }, g); svgEl('circle', { cx: cx - 34, cy: cy - 7, r: 2, fill: INK }, g);
    svgEl('path', { d: `M${cx - 36} ${cy - 13} C${cx - 58} ${cy - 46} ${cx - 26} ${cy - 62} ${cx - 8} ${cy - 70}`, fill: 'none', stroke: INK, 'stroke-width': 1.8 }, g);
    svgEl('path', { d: `M${cx - 30} ${cy - 15} C${cx - 42} ${cy - 50} ${cx - 10} ${cy - 54} ${cx + 8} ${cy - 62}`, fill: 'none', stroke: INK, 'stroke-width': 1.8 }, g);
    // speech bubble
    const bx = s.x + 196, by = 66;
    svgEl('path', { d: `M${bx - 50} ${by + 34} L${bx - 66} ${by + 70} L${bx - 26} ${by + 36}`, fill: '#fff', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
    svgEl('ellipse', { cx: bx, cy: by, rx: 86, ry: 42, fill: '#fff', stroke: INK, 'stroke-width': 2 }, svg);
    svgEl('path', { d: `M${bx - 52} ${by + 34} L${bx - 26} ${by + 34}`, stroke: '#fff', 'stroke-width': 4 }, svg);
    lab(bx, by - 14, 'chirp!', 'c', 'u7l2-crchirp');
    lab(bx, by + 14, `<b class="u7l2-crn">${s.C}</b> per min`, 'c', 'u7l2-crper');
  });
}

/* the warm-up graph: plot (20, 10) and (60, 20), extend back to (0, 5), rise over run → T = ¼C + 5 */
function mountWarmGraph() {
  const host = document.getElementById('u7l2-wgraph'); if (!host) return;
  const G = new Graph(host, { width: 500, height: 330, xmin: 0, xmax: 110, ymin: 0, ymax: 35, xstep: 10, ystep: 5, xlabels: 20, ylabels: 5, xtitle: 'C', ytitle: 'T', origin: true });
  const ro = document.getElementById('u7l2-wro');
  let busy = false, stage = 0, made = [];
  const say = (html) => { ro.innerHTML = html; };
  const clear = () => { made.forEach((e) => { if (e.remove) e.remove(); }); made = []; G.clear(); stage = 0; say(''); };
  const steps = [
    async (c) => {
      const a = G.point(20, 10, { color: INK, label: T('(20,\\ 10)'), pos: 'nw' }), b = G.point(60, 20, { color: INK, label: T('(60,\\ 20)'), pos: 'nw' });
      await G.reveal(a, c); await G.reveal(b, c);
      say(`Two readings: 20 chirps at ${T('10\\ ^\\circ\\text{C}')}, 60 chirps at ${T('20\\ ^\\circ\\text{C}')}.`);
    },
    async (c) => {
      await G.drawIn(G.line([20, 10], [60, 20], { color: LINE, width: 4 }), 900, c);
      const p = G.point(0, 5, { color: BCOL, r: 8, label: T(cB('(0,\\ 5)')), pos: 'e' }); await G.reveal(p, c);
      say(`Silent (${T('C=0')}) at ${T('5\\ ^\\circ\\text{C}')}: the line meets the ${T('T')}-axis at ${T(cB('(0,\\ 5)'))}. That is the <b class="u7l2-c-b">${T('T')}-intercept</b>, ${T(cB('b=5'))}.`);
    },
    async (c) => {
      const t = new SlopeTri(G, { x: 20, y: 10, run: 40, rise: 10 }, { runText: () => '<b>run</b> 40 chirps', riseText: () => '<b>rise</b> 10 °C' }); made.push(t);
      await t.drawIn(c, 500);
      say(`${T(`m=\\dfrac{\\text{rise}}{\\text{run}}=\\dfrac{${cR(10)}}{${cU(40)}}=\\dfrac14`)} °C per chirp. So ${T(`T=${cM('\\tfrac14')}C+${cB(5)}`)}. At 100 chirps: ${T('\\tfrac14(100)+5=30')}.`);
    }
  ];
  const go = async (k) => {
    if (busy) return; busy = true;
    try { if (k < stage) clear(); const c = liveCtx(); while (stage <= k) { await steps[stage](c); stage++; } } finally { busy = false; }
  };
  [1, 2, 3].forEach((k) => { const b = document.getElementById('u7l2-wb' + k); if (b) b.onclick = () => go(k - 1); });
  const b0 = document.getElementById('u7l2-wb0'); if (b0) b0.onclick = () => { if (!busy) clear(); };
}

/* =============================== static figures =============================== */
function mountFigures() {
  const e2 = document.getElementById('u7l2-ex2fig');
  if (e2) {
    const G = new Graph(e2, { width: 400, height: 400, xmin: -8, xmax: 8, ymin: -8, ymax: 8, xlabels: 2, ylabels: 2 });
    G.line({ m: 0.25, b: -6 }, { color: LINE, width: 4 });
    G.line({ m: -2, b: 5 }, { color: RED, width: 4 });
    G.label(7, -3.1, T('l_1'), { cls: 'bk-ptlab u7l2-lname', color: LINE });
    G.label(-2.2, 6.6, T('l_2'), { cls: 'bk-ptlab u7l2-lname', color: RED });
  }
  const wf = document.getElementById('u7l2-whyfig');
  if (wf) {
    const G = sqG(wf, null, null, { xmin: -4, xmax: 4, ymin: -3, ymax: 4 }, 40, { xlabels: 1, ylabels: 1 });
    G.line({ m: 2 / 3, b: 0 }, { color: LINE, width: 3.5 });
    G.line({ m: -1.5, b: 0 }, { color: RED, width: 3.5 });
    new SlopeTri(G, { x: 0, y: 0, run: 3, rise: 2 }, { w: 4, runSide: 'n', runText: () => 'run 3', riseText: () => 'rise 2' });
    // the turned triangle, drawn the booklet's way: up 3 from the origin, then 2 left
    const p = (a, b) => G.toPx(a, b);
    const tg = svgEl('g', {}, G.layers.data);
    svgEl('path', { d: `M${p(0, 0)} L${p(0, 3)} L${p(-2, 3)} Z`, fill: RED, 'fill-opacity': 0.12 }, tg);
    svgEl('path', { d: `M${p(0, 0)} L${p(0, 3)}`, stroke: RISE, 'stroke-width': 4, 'stroke-linecap': 'round' }, tg);
    svgEl('path', { d: `M${p(0, 3)} L${p(-2, 3)}`, stroke: RUN, 'stroke-width': 4, 'stroke-linecap': 'round' }, tg);
    G.label(0, 1.6, 'rise 3', { pos: 'e', cls: 'bk-ptlab u7l2-tlab u7l2-trise' });
    G.label(-1, 3, 'run −2', { pos: 'n', cls: 'bk-ptlab u7l2-tlab u7l2-trun' });
    G.label(3.1, -1.3, T(cM('m=\\tfrac23')), { cls: 'bk-ptlab u7l2-mlab' });
    G.label(-3, 1.3, T(`\\textcolor{${RED}}{m=-\\tfrac32}`), { cls: 'bk-ptlab u7l2-mlab' });
  }
  const e4 = document.getElementById('u7l2-ex4fig');
  if (e4) {
    const G = new Graph(e4, { width: 400, height: 400, xmin: -8, xmax: 8, ymin: -8, ymax: 8, xlabels: 2, ylabels: 2 });
    G.line({ m: 0, b: 3 }, { color: LINE, width: 4 });
    G.line({ m: 0, b: -6 }, { color: RED, width: 4 });
    G.line({ x: -3 }, { color: COLORS.teal, width: 4 });
    G.label(6.6, 3, T('L_1'), { pos: 'n', cls: 'bk-ptlab u7l2-lname', color: LINE });
    G.label(6.6, -6, T('L_2'), { pos: 's', cls: 'bk-ptlab u7l2-lname', color: RED });
    G.label(-3, 7.2, T('L_3'), { pos: 'w', cls: 'bk-ptlab u7l2-lname', color: COLORS.teal });
  }
  const hv = (id, vert) => {
    const el = document.getElementById(id); if (!el) return;
    const G = new Graph(el, { width: 150, height: 150, xmin: -4, xmax: 4, ymin: -4, ymax: 4, numbers: false, xtitle: '', ytitle: '' });
    if (vert) { G.line({ x: 1 }, { color: LINE, width: 3.5 }); G.point(1, 0, { color: INK, r: 5, label: T('(k,\\ 0)'), pos: 'se' }); }
    else { G.line({ m: 0, b: 2 }, { color: LINE, width: 3.5 }); G.point(0, 2, { color: BCOL, r: 5, label: T('(0,\\ k)'), pos: 'se' }); }
  };
  hv('u7l2-hvH', false); hv('u7l2-hvV', true);
}

/* =============================== explainer 1: the equation assembles itself =============================== */
const AS = {
  ex1a: { label: 'Example 1(a) check', n: 3, d: 4, b: -5, given: `through ${T('(0,\\ -5)')}, slope ${T('\\tfrac34')}`, fromPoint: true },
  ex1b: { label: 'Example 1(b) check', n: -2, d: 5, b: 7, given: `${T('y')}-intercept ${T('7')}, slope ${T('-\\tfrac25')}` },
  demo: { label: 'Slope ' + T('\\tfrac53') + ', through ' + T('(0,\\ -2)'), n: 5, d: 3, b: -2, given: `through ${T('(0,\\ -2)')}, slope ${T('\\tfrac53')}`, fromPoint: true }
};
const assemble = {
  title: 'The equation builds itself',
  height: 470,
  minW: 840, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(AS).map((k) => ({ v: k, label: AS[k].label })),
  intro: 'Two empty slots: one for the slope, one for the y-intercept. Watch each number travel from the graph into the equation. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = AS[k], m = d.n / d.d, b = d.b, [a, q] = red(d.n, d.d);
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -8, xmax: 8, ymin: -8, ymax: 8, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'Build the equation');
    const giv = line(P, `<b>Given:</b> ${d.given}`, 'u7l2-given'); hide(giv);
    const B = builder(P); hide(B.row);
    const fin = h('div', 'u7l2-final'); P.appendChild(fin);
    const log = h('div', 'u7l2-log'); P.appendChild(log);
    const mT = fr(d.n, d.d), up = a > 0 ? 'up' : 'down', tidy = b < 0;
    let pt, tri;
    return [
      { cap: `Given: ${d.given}. The target is ${T('y=mx+b')}: two empty slots to fill.`,
        run: async (c) => { unhide(giv); await show(c, giv); unhide(B.row); await pop(c, B.row); } },
      { cap: d.fromPoint ? `${T(pr(0, b))} has ${T('x=0')}, so it sits <b>on the ${T('y')}-axis</b>. It <b>is</b> the ${T('y')}-intercept: ${T(cB('b=' + b))}.`
        : `The ${T('y')}-intercept is ${T(String(b))}: the line crosses the ${T('y')}-axis at ${T(pr(0, b))}. So ${T(cB('b=' + b))}.`,
        run: async (c) => {
          const band = yAxisBand(G); await appear(c, band, 400);
          pt = G.point(0, b, { color: BCOL, r: 8, label: T(cB(pr(0, b))), pos: 'w' }); await G.reveal(pt, c);
        } },
      { cap: `Drop ${T(cB('b=' + b))} into its slot.`,
        run: (c) => fly(c, stage, gPos(G, 0, b), B.b, T(cB(b)), 'u7l2-fly-b') },
      { cap: `Slope ${T(mT)}: from the ${T('y')}-intercept, run ${T(cU(q))} right, rise ${T(cR(Math.abs(a)))} ${up}.`,
        run: async (c) => {
          tri = new SlopeTri(G, { x: 0, y: b, run: q, rise: a }); await tri.drawIn(c, 450);
          const e = G.point(q, b + a, { color: INK, r: 6 }); await G.reveal(e, c);
        } },
      { cap: `Drop ${T(`m=${mT}`)} into its slot: rise over run.`,
        run: (c) => fly(c, stage, gPos(G, q / 2, b + a / 2), B.m, T(mRR(d.n, d.d)), 'u7l2-fly-m') },
      { cap: tidy ? `Tidy up: ${T(`+(${b})`)} is written ${T(String(b))}. The equation is ${T(eqTex(d.n, d.d, b))}.`
        : `Nothing to tidy: the equation is ${T(eqTex(d.n, d.d, b))}.`,
        run: async (c) => {
          if (tidy) { B.b.innerHTML = T(cB(`(${b})`)); await pulse(c, B.b, 1.12); }
          fin.innerHTML = T(eqTex(d.n, d.d, b, { color: true })); await pop(c, fin);
          await G.drawIn(G.line({ m, b }, { color: LINE, width: 4 }), 800, c);
        } },
      { cap: `Check: ${T('x=0')} gives ${T(`y=${fr(d.n, d.d, false)}(0)${b < 0 ? '' : '+'}${b}=${b}`)} ✓, and the coefficient of ${T('x')} is ${T(mT)} ✓.`,
        run: async (c) => {
          await show(c, line(log, `${T('x=0')}: ${T(`y=${b}`)} ✓ &nbsp; slope ${T(mT)} ✓`));
          const s = stamp(P, 'done', { ok: true }); s.classList.add('u7l2-stampb'); await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== explainer 2: read m and b off a grid =============================== */
const RG = {
  l1: { label: 'Example 2 check: ' + T('l_1'), name: 'l_1', n: 1, d: 4, b: -6, P3: [-8, -8], color: LINE },
  l2: { label: 'Example 2 check: ' + T('l_2'), name: 'l_2', n: -2, d: 1, b: 5, P3: [3, -1], color: RED },
  demo: { label: 'Another line', name: 'l', n: 2, d: 3, b: -1, P3: [-3, -3], color: LINE }
};
const readGraph = {
  title: 'Read b, count m, write the equation',
  height: 470,
  minW: 840, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(RG).map((k) => ({ v: k, label: RG[k].label })),
  intro: 'First find where the line crosses the y-axis, then count the slope to a second grid point. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = RG[k], b = d.b, [a, q] = red(d.n, d.d), P2 = [q, b + a], P3 = d.P3;
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -8, xmax: 8, ymin: -8, ymax: 8, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, `Line ${T(d.name)}`);
    const B = builder(P);
    const fin = h('div', 'u7l2-final'); P.appendChild(fin);
    const log = h('div', 'u7l2-log'); P.appendChild(log);
    const L = G.line({ m: a / q, b }, { color: d.color, width: 4 }); hide(L);
    const mT = fr(a, q);
    return [
      { cap: `Line ${T(d.name)} passes through lattice points. First: where does it cross the <b>${T('y')}-axis</b>?`,
        run: async (c) => { unhide(L); await G.drawIn(L, 800, c); const band = yAxisBand(G); await appear(c, band, 400); } },
      { cap: `At ${T(pr(0, b))}, exactly on a grid corner. So ${T(cB('b=' + b))}.`,
        run: async (c) => {
          const p = G.point(0, b, { color: BCOL, r: 8, label: T(cB(pr(0, b))), pos: a > 0 ? 'nw' : 'sw' }); await G.reveal(p, c);
          await fly(c, stage, gPos(G, 0, b), B.b, T(cB(b)), 'u7l2-fly-b');
        } },
      { cap: `Now a second lattice point, where the line passes exactly through a grid corner: ${T(pr(...P2))}.`,
        run: async (c) => { const p = G.point(P2[0], P2[1], { color: INK, r: 7, label: T(pr(...P2)), pos: a > 0 ? 'nw' : 'sw' }); await G.reveal(p, c); await pulse(c, p, 1.4); } },
      { cap: `Count from ${T(pr(0, b))} to ${T(pr(...P2))}: run ${T(cU(q))} right, rise ${T(cR(Math.abs(a)))} ${a > 0 ? 'up' : 'down'}.`,
        run: async (c) => { const t = new SlopeTri(G, { x: 0, y: b, run: q, rise: a }); await t.drawIn(c, 450); } },
      { cap: `${T(`m=\\dfrac{\\text{rise}}{\\text{run}}=\\dfrac{${a}}{${q}}${q === 1 ? '=' + a : ''}`)}. Drop it into the ${T('m')} slot.`,
        run: (c) => fly(c, stage, gPos(G, q / 2, b + a / 2), B.m, T(mRR(a, q)), 'u7l2-fly-m') },
      { cap: `So line ${T(d.name)} is ${T(eqTex(a, q, b))}.`,
        run: async (c) => { fin.innerHTML = T(eqTex(a, q, b, { color: true })); await pop(c, fin); } },
      { cap: `Check with a <b>third</b> point on the line, ${T(pr(...P3))}: ${T(substTex(a, q, b, P3[0]))} ✓.`,
        run: async (c) => {
          const p = G.point(P3[0], P3[1], { color: INK, r: 7, label: T(pr(...P3)), pos: 'e' }); await G.reveal(p, c);
          await show(c, line(log, `${T(pr(...P3))}: ${T(substTex(a, q, b, P3[0]))} ✓`));
          const s = stamp(P, 'on the line', { ok: true }); s.classList.add('u7l2-stampb'); await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== explainer 3: spot the mistake =============================== */
const SE = [
  { who: 'A', n: -2, d: 3, b: 3, why: () => `Right ${T('b')}, but the slope is ${T('\\tfrac{\\text{run}}{\\text{rise}}')}: the dashed line is <b>too shallow</b>. Rise goes on top.` },
  { who: 'B', n: -3, d: 2, b: 2, why: () => `Right slope, but ${T('2')} is where the line crosses the <b>${T('x')}-axis</b>. The dashed line misses ${T('(0,\\ 3)')}. ${T('b')} is read on the ${T('y')}-axis.` },
  { who: 'C', n: 3, d: 2, b: 3, why: () => `The line <b>falls</b> from left to right, so its slope must be <b>negative</b>. C’s dashed line climbs.` },
  { who: 'D', n: -3, d: 2, b: 3, ok: true, why: () => `From ${T('(0,\\ 3)')}: run ${T(cU(2))}, rise ${T(cR(-3))} lands on ${T('(2,\\ 0)')}. D’s line sits exactly on the given line ✓.` }
];
const spotError = {
  title: 'Spot the mistake',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Four equations for one line, but only one is right. Graph each one and compare. Press <b>Next</b>.',
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -8, xmax: 8, ymin: -8, ymax: 8, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'Four answers');
    const cards = SE.map((s) => {
      const el = h('div', 'u7l2-scard', `<div class="u7l2-sw">${s.who}</div><div class="u7l2-se">${T(eqTex(s.n, s.d, s.b))}</div><div class="u7l2-sv"></div>`);
      P.appendChild(el); return el;
    });
    let prev = null;
    const steps = [{ cap: `The line passes through ${T('(0,\\ 3)')} and ${T('(2,\\ 0)')}. Four students wrote these equations for it.`,
      run: async (c) => {
        await G.drawIn(G.line({ m: -1.5, b: 3 }, { color: LINE, width: 5 }), 800, c);
        await G.reveal(G.point(0, 3, { color: BCOL, r: 7, label: T('(0,\\ 3)'), pos: 'w' }), c);
        await G.reveal(G.point(2, 0, { color: INK, r: 7, label: T('(2,\\ 0)'), pos: 'ne' }), c);
        for (const e of cards) await show(c, e);
      } }];
    SE.forEach((s, i) => steps.push({
      cap: `<b>${s.who}</b>: ${T(eqTex(s.n, s.d, s.b))}. ${s.why()}`,
      run: async (c) => {
        if (prev) prev.style.opacity = 0.18;
        cards.forEach((e, j) => e.classList.toggle('on', j === i));
        const L = G.line({ m: s.n / s.d, b: s.b }, { color: s.ok ? COLORS.green : RED, width: 4, dash: s.ok ? null : '10 7' });
        await G.drawIn(L, 900, c); prev = L;
        if (s.ok) { const t = new SlopeTri(G, { x: 0, y: 3, run: 2, rise: -3 }); await t.drawIn(c, 380); }
        if (s.who === 'B') { const p = G.point(0, 2, { color: RED, r: 6, label: T('(0,\\ 2)'), pos: 'w', labelColor: RED }); await G.reveal(p, c); }
        const v = cards[i].querySelector('.u7l2-sv'); v.innerHTML = s.ok ? '✓' : '✗'; v.classList.add(s.ok ? 'ok' : 'no'); await pop(c, v);
      }
    }));
    return steps;
  }
};

/* =============================== explainer 4: parallel = copy the slope triangle =============================== */
const CP = {
  ex3a: { label: 'Example 3(a) check', g: [1, 2, 7], b: -3, other: { m: 5, b: -3, tex: 'y=5x-3' }, win: { xmin: -8, xmax: 8, ymin: -6, ymax: 10 }, steps: [-1, 3], lab: [-6, 4, 'n'] },
  demo: { label: 'Parallel to ' + T('y=2x-5') + ', through ' + T('(0,\\ 3)'), g: [2, 1, -5], b: 3, win: { xmin: -8, xmax: 8, ymin: -8, ymax: 8 }, steps: [-2, 2], lab: [4, 3, 'e'] }
};
const copyTri = {
  title: 'Parallel: copy the slope triangle',
  height: 470,
  minW: 840, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(CP).map((k) => ({ v: k, label: CP[k].label })),
  intro: 'A parallel line climbs exactly as steeply, so it has the very same slope triangle. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CP[k], [gn, gd, gb] = d.g, [a, q] = red(gn, gd), b = d.b, gT = eqTex(gn, gd, gb), mT = fr(a, q);
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 440, height: 440, xlabels: 2, ylabels: 2 }, d.win));
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'The new line');
    const B = builder(P);
    const fin = h('div', 'u7l2-final'); P.appendChild(fin);
    const log = h('div', 'u7l2-log'); P.appendChild(log);
    let t0, cp;
    return [
      { cap: `The given line ${T(gT)}: slope ${T(mT)}, so run ${T(cU(q))}, rise ${T(cR(a))}.`,
        run: async (c) => {
          await G.drawIn(G.line({ m: a / q, b: gb }, { color: SLATE, width: 4 }), 800, c);
          G.label(d.lab[0], d.lab[1], T(gT), { pos: d.lab[2], cls: 'bk-ptlab u7l2-glab' });
          t0 = new SlopeTri(G, { x: 0, y: gb, run: q, rise: a }); await t0.drawIn(c, 420);
        } },
      { cap: `<b>Parallel lines have equal slopes.</b> Copy the slope triangle: the new line has ${T(`m=${mT}`)} too.`,
        run: async (c) => {
          t0.labels(false); cp = new SlopeTri(G, { x: 0, y: gb, run: q, rise: a }, { fill: LINE, fillOp: 0.22 }); await pulse(c, cp.g, 1.04);
          await fly(c, stage, gPos(G, q / 2, gb + a / 2), B.m, T(mRR(a, q)), 'u7l2-fly-m');
        } },
      { cap: d.other ? `${T('b')}: the same ${T('y')}-intercept as ${T(d.other.tex)}, which crosses the ${T('y')}-axis at ${T(pr(0, b))}. So ${T(cB('b=' + b))}.`
        : `${T('b')}: the line passes through ${T(pr(0, b))}, on the ${T('y')}-axis. So ${T(cB('b=' + b))}.`,
        run: async (c) => {
          if (d.other) await G.drawIn(G.line({ m: d.other.m, b: d.other.b }, { color: GRAY, width: 3, dash: '8 6' }), 700, c);
          const p = G.point(0, b, { color: BCOL, r: 8, label: T(cB(pr(0, b))), pos: 'w' }); await G.reveal(p, c);
          await fly(c, stage, gPos(G, 0, b), B.b, T(cB(b)), 'u7l2-fly-b');
        } },
      { cap: `Slide the copied triangle along the ${T('y')}-axis to ${T(pr(0, b))}, then step it off again and again.`,
        run: async (c) => {
          t0.fade(0.35);
          await cp.to(c, { y: b }, 1100);
          for (let i = 1; i <= d.steps[1]; i++) { const s = new SlopeTri(G, { x: i * q, y: b + i * a, run: q, rise: a }, { labels: false, fillOp: 0.12, w: 4 }); await s.drawIn(c, 170); }
          for (let i = -1; i >= d.steps[0]; i--) { const s = new SlopeTri(G, { x: i * q, y: b + i * a, run: q, rise: a }, { labels: false, fillOp: 0.12, w: 4 }); await s.drawIn(c, 170); }
        } },
      { cap: `Join the steps: ${T(eqTex(a, q, b))}. Same steepness, different ${T('y')}-intercept: the two lines never meet.`,
        run: async (c) => {
          await G.drawIn(G.line({ m: a / q, b }, { color: LINE, width: 4.5 }), 800, c);
          fin.innerHTML = T(eqTex(a, q, b, { color: true })); await pop(c, fin);
          await show(c, line(log, `${T(`m=${mT}`)} matches ${T(gT)} ✓<br>${T('x=0')} gives ${T(`y=${b}`)} ✓`));
          const s = stamp(P, 'parallel', { ok: true }); s.classList.add('u7l2-stampb'); await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== explainer 5: perpendicular = turn the slope triangle =============================== */
const TT = {
  fig: { label: 'Section 3 figure: slope ' + T('\\tfrac23'), run: 3, rise: 2, win: { xmin: -5, xmax: 5, ymin: -4, ymax: 5 }, unit: 44 },
  ex3b: { label: 'Example 3(b) check', ex: true, win: { xmin: -8, xmax: 6, ymin: -6, ymax: 13 }, unit: 23 },
  demo: { label: 'Slope ' + T('-\\tfrac34'), run: 4, rise: -3, win: { xmin: -5, xmax: 5, ymin: -4, ymax: 5 }, unit: 44 }
};
const turnTri = {
  title: 'Perpendicular: turn the slope triangle 90°',
  height: 490,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(TT).map((k) => ({ v: k, label: TT[k].label })),
  intro: 'Turn a slope triangle a quarter-turn and its line turns with it, to a right angle. Watch the rise and the run. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = TT[k];
    const G = sqG(stage, 14, 14, d.win, d.unit, { xlabels: d.ex ? 2 : 1, ylabels: d.ex ? 2 : 1 });
    const P = panel(stage, G.W + 34, 14, ex.W - G.W - 48, 462, d.ex ? 'The perpendicular line' : 'Slopes');
    return d.ex ? turnEx3b(G, P, stage) : turnOrigin(G, P, d);
  }
};
function turnOrigin(G, P, d) {
  const u = d.run, r = d.rise, m1 = fr(r, u), nu = -r, nr = u, m2 = fr(nr, nu);
  let t, fl;
  const dir = (v) => (v < 0 ? 'left' : 'right');
  return [
    { cap: `The blue line has slope ${T(m1)}: run ${T(cU(u))}, rise ${T(cR(r))}.`,
      run: async (c) => {
        await G.drawIn(G.line({ m: r / u, b: 0 }, { color: LINE, width: 4 }), 700, c);
        t = new SlopeTri(G, { x: 0, y: 0, run: u, rise: r }); await t.drawIn(c, 420);
        await show(c, line(P, T(`m_{\\text{blue}}=\\dfrac{${cR(r)}}{${cU(u)}}${fr(r, u) === `\\dfrac{${r}}{${u}}` ? '' : '=' + m1}`), 'u7l2-big'));
      } },
    { cap: `Turn the slope triangle a <b>quarter-turn</b> (${T('90^\\circ')}) counterclockwise about the origin.`,
      run: async (c) => { const g = new SlopeTri(G, { x: 0, y: 0, run: u, rise: r }, { labels: false }); g.fade(0.25); await t.rot(c, 90, [0, 0]); } },
    { cap: `The old <b class="u7l2-c-run">run</b> ${T(String(u))} now stands <b>up</b>: a rise of ${T(String(u))}. The old <b class="u7l2-c-rise">rise</b> ${T(String(r))} now lies flat: a run of ${T(String(nu))} (to the ${dir(nu)}).`,
      run: async (c) => {
        const l1 = G.label(0, u / 2, `<b>rise</b> ${n(u)}`, { pos: nu < 0 ? 'e' : 'w', cls: 'bk-ptlab u7l2-tlab u7l2-trun' });
        const l2 = G.label(nu / 2, u, `<b>run</b> ${n(nu)}`, { pos: 'n', cls: 'bk-ptlab u7l2-tlab u7l2-trise' });
        await fadeIn(c, l1); await pulse(c, l1, 1.15); await fadeIn(c, l2); await pulse(c, l2, 1.15);
      } },
    { cap: `The turned (red) line has slope ${T(`\\dfrac{${nr}}{${nu}}${m2 === `\\dfrac{${nr}}{${nu}}` ? '' : '=' + m2}`)}. It meets the blue line at a <b>right angle</b>.`,
      run: async (c) => {
        await G.drawIn(G.line({ m: nr / nu, b: 0 }, { color: RED, width: 4 }), 700, c);
        const mk = rmark(G, [0, 0], [u, r], [nu, nr], 16); mk.style.opacity = 0; await appear(c, mk);
        await show(c, line(P, T(`m_{\\text{red}}=\\dfrac{${cR(nr)}}{${cU(nu)}}${m2 === `\\dfrac{${nr}}{${nu}}` ? '' : '=' + m2}`), 'u7l2-big'));
      } },
    { cap: `Rise and run <b>swap places</b> and <b>one sign changes</b>: ${T(`${m1}\\times${par(m2)}=-1`)}. The slopes are <b>negative reciprocals</b>.`,
      run: async (c) => { const rb = line(P, T(`${m1}\\times${par(m2)}=-1`), 'u7l2-rulebox'); await pop(c, rb); } },
    { cap: `Shortcut: <b>flip</b> the fraction, then <b>change its sign</b>. ${T(m1)} ${T('\\to')} ${T(fr(u, r))} ${T('\\to')} ${T(m2)}.`,
      run: async (c) => {
        fl = h('div', 'u7l2-flip', T(m1)); P.appendChild(fl); await pop(c, fl);
        await anim(c, fl, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(90deg)' }], 280); fl.innerHTML = T(`${m1}\\ \\xrightarrow{\\text{flip}}\\ ${fr(u, r)}`);
        await anim(c, fl, [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], 280); await sleep(c, 350);
        fl.innerHTML = T(`${m1}\\ \\xrightarrow{\\text{flip}}\\ ${fr(u, r)}\\ \\xrightarrow{\\text{sign}}\\ ${m2}`); await pulse(c, fl, 1.06);
      } }
  ];
}
function turnEx3b(G, P, stage) {
  const A = [3, -4], Bp = [-6, 2];
  const Bd = builder(P, 'u7l2-eqrow-sm');
  const fin = h('div', 'u7l2-final'); P.appendChild(fin);
  const log = h('div', 'u7l2-log'); P.appendChild(log);
  let t;
  return [
    { cap: `Plot ${T('(3,\\ -4)')} and ${T('(-6,\\ 2)')} and join them.`,
      run: async (c) => {
        await G.reveal(G.point(...A, { color: INK, label: T('(3,\\ -4)'), pos: 'e' }), c);
        await G.reveal(G.point(...Bp, { color: INK, label: T('(-6,\\ 2)'), pos: 's' }), c);
        await G.drawIn(G.line(A, Bp, { color: SLATE, width: 3.5 }), 700, c);
      } },
    { cap: `Its slope: ${T('m=\\dfrac{2-(-4)}{-6-3}=\\dfrac{6}{-9}=-\\dfrac23')}. On the grid: run ${T(cU(9))}, rise ${T(cR(-6))}.`,
      run: async (c) => {
        t = new SlopeTri(G, { x: -6, y: 2, run: 9, rise: -6 }, { riseSide: 'e' }); await t.drawIn(c, 450);
        await show(c, line(log, T('m=\\dfrac{6}{-9}=-\\dfrac23')));
      } },
    { cap: `In lowest terms the triangle is smaller: run ${T(cU(3))}, rise ${T(cR(-2))}. The same slope, ${T('-\\tfrac23')}.`,
      run: (c) => t.to(c, { run: 3, rise: -2 }, 1000) },
    { cap: `Turn it ${T('90^\\circ')} counterclockwise about ${T('(-6,\\ 2)')}: the run ${T('3')} stands up as a <b>rise of ${T('3')}</b>, the rise ${T('-2')} lies flat as a <b>run of ${T('2')}</b>.`,
      run: async (c) => {
        const g = new SlopeTri(G, { x: -6, y: 2, run: 3, rise: -2 }, { labels: false }); g.fade(0.25);
        await t.rot(c, 90, [-6, 2]);
        const l1 = G.label(-6, 3.5, '<b>rise</b> 3', { pos: 'w', cls: 'bk-ptlab u7l2-tlab u7l2-trun' });
        const l2 = G.label(-5, 5, '<b>run</b> 2', { pos: 'n', cls: 'bk-ptlab u7l2-tlab u7l2-trise' });
        await fadeIn(c, l1); await fadeIn(c, l2);
      } },
    { cap: `The perpendicular slope is ${T('m=\\dfrac32')}: flipped and sign changed. Check: ${T('-\\dfrac23\\times\\dfrac32=-1')} ✓.`,
      run: async (c) => {
        await fly(c, stage, gPos(G, -5, 3.5), Bd.m, T(mRR(3, 2)), 'u7l2-fly-m');
        await show(c, line(log, T('-\\dfrac23\\times\\dfrac32=-1')));
      } },
    { cap: `It passes through ${T('(0,\\ 11)')}, on the ${T('y')}-axis, so ${T(cB('b=11'))}.`,
      run: async (c) => {
        const p = G.point(0, 11, { color: BCOL, r: 8, label: T(cB('(0,\\ 11)')), pos: 'e' }); await G.reveal(p, c);
        await fly(c, stage, gPos(G, 0, 11), Bd.b, T(cB(11)), 'u7l2-fly-b');
      } },
    { cap: `Step the turned triangle on from ${T('(-6,\\ 2)')}: ${T('(-4,\\ 5)')}, ${T('(-2,\\ 8)')}, ${T('(0,\\ 11)')}. It lands right on the ${T('y')}-intercept.`,
      run: async (c) => {
        for (let i = 1; i <= 2; i++) { const s = new SlopeTri(G, { x: -4 + 2 * (i - 1), y: 5 + 3 * (i - 1), run: 2, rise: 3 }, { labels: false, fill: RED, fillOp: 0.14, w: 4 }); await s.drawIn(c, 220); }
        for (const p of [[-4, 5], [-2, 8]]) await G.reveal(G.point(p[0], p[1], { color: RED, r: 5.5 }), c);
      } },
    { cap: `${T(eqTex(3, 2, 11))}, at a right angle to the line through the two points.`,
      run: async (c) => {
        await G.drawIn(G.line({ m: 1.5, b: 11 }, { color: RED, width: 4.5 }), 800, c);
        const mk = rmark(G, Bp, A, [-4, 5], 14); mk.style.opacity = 0; await appear(c, mk);
        fin.innerHTML = T(eqTex(3, 2, 11, { color: true })); await pop(c, fin);
        const s = stamp(P, 'perpendicular', { ok: true }); s.classList.add('u7l2-stampb'); await stampIn(c, s);
      } }
  ];
}

/* =============================== explainer 6: where do m and b come from? =============================== */
const FN = {
  top: { x: 480, y: 34, w: 330, h: 50, html: `<b>Build ${T('y=mx+b')}</b>`, cls: 'bk-round' },
  mQ: { x: 250, y: 118, w: 260, h: 52, html: `<b>Where does ${T('m')} come from?</b>`, color: 'blue' },
  bQ: { x: 730, y: 118, w: 260, h: 52, html: `<b>Where does ${T('b')} come from?</b>`, color: 'teal' },
  mGiven: { x: 85, y: 222, w: 150, h: 70, html: '<b>Given</b>use it' },
  mGraph: { x: 250, y: 222, w: 150, h: 70, html: '<b>A graph</b>count rise ÷ run' },
  mPts: { x: 415, y: 222, w: 150, h: 70, html: '<b>Two points</b>slope formula' },
  mPar: { x: 160, y: 326, w: 170, h: 70, html: '<b>Parallel line</b>copy: same slope' },
  mPerp: { x: 360, y: 326, w: 190, h: 70, html: '<b>Perpendicular line</b>turn: flip, change sign' },
  bGiven: { x: 585, y: 222, w: 120, h: 70, html: '<b>Given</b>use it' },
  bPt: { x: 722, y: 222, w: 134, h: 70, html: `<b>Point ${T('(0,\\ k)')}</b>${T('b=k')}` },
  bGraph: { x: 876, y: 222, w: 164, h: 70, html: `<b>A graph</b>where it crosses the ${T('y')}-axis` },
  bSame: { x: 760, y: 326, w: 300, h: 70, html: `<b>Same ${T('y')}-intercept as another line</b>${T('y=\\ldots x+q')} gives ${T('b=q')}` }
};
const FE = [
  { from: 'top', to: 'mQ' }, { from: 'top', to: 'bQ' },
  { from: 'mQ', to: 'mGiven' }, { from: 'mQ', to: 'mGraph' }, { from: 'mQ', to: 'mPts' }, { from: 'mQ', to: 'mPar' },
  { from: 'mPts', to: 'mPerp', label: 'then', dash: true },
  { from: 'bQ', to: 'bGiven' }, { from: 'bQ', to: 'bPt' }, { from: 'bQ', to: 'bGraph' }, { from: 'bQ', to: 'bSame', route: 'vhv' }
];
const FP = {
  ex1a: { label: 'Example 1(a)', m: ['mGiven'], b: ['bPt'], mCap: `the slope ${T('\\tfrac34')} is <b>given</b>.`, bCap: `${T('(0,\\ -5)')} is a point with ${T('x=0')}: ${T('b=-5')}.`, eq: eqTex(3, 4, -5, { color: true }) },
  ex2: { label: 'Example 2, ' + T('l_1'), m: ['mGraph'], b: ['bGraph'], mCap: `count it on the <b>graph</b>: run 4, rise 1, ${T('m=\\tfrac14')}.`, bCap: `read it on the <b>graph</b>: ${T('l_1')} crosses the ${T('y')}-axis at ${T('(0,\\ -6)')}.`, eq: eqTex(1, 4, -6, { color: true }) },
  ex3a: { label: 'Example 3(a)', m: ['mPar'], b: ['bSame'], mCap: `a <b>parallel</b> line, ${T('y=\\tfrac12x+7')}: copy its slope, ${T('m=\\tfrac12')}.`, bCap: `the <b>same ${T('y')}-intercept</b> as ${T('y=5x-3')}: ${T('b=-3')}.`, eq: eqTex(1, 2, -3, { color: true }) },
  ex3b: { label: 'Example 3(b)', m: ['mPts', 'mPerp'], b: ['bPt'], mCap: `<b>two points</b> give ${T('-\\tfrac23')}, then <b>perpendicular</b>: flip and change sign, ${T('m=\\tfrac32')}.`, bCap: `the point ${T('(0,\\ 11)')} has ${T('x=0')}: ${T('b=11')}.`, eq: eqTex(3, 2, 11, { color: true }) }
};
const strategy = {
  title: 'Where do m and b come from?',
  height: 458,
  side: false, // the flowchart needs the full width: beside the sidebar its text would shrink to about 12 px
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(FP).map((k) => ({ v: k, label: FP[k].label })),
  intro: (k) => `Trace ${FP[k].label}: one path finds ${T('m')}, the other finds ${T('b')}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = FP[k], W = 960;
    const F = new Flowchart(stage, { x: Math.max(0, (ex.W - W) / 2), y: 2, width: W, height: 372, nodes: FN, edges: FE });
    const res = add(stage, h('div', 'u7l2-fcres'), Math.max(0, (ex.W - 560) / 2), 380); box(res, 560, 70); hide(res);
    return [
      { cap: `${T('m')}: ${d.mCap}`, run: (c) => F.light(c, ['top', 'mQ', ...d.m]) },
      { cap: `${T('b')}: ${d.bCap}`, run: async (c) => { F.fade(); await F.light(c, ['top', 'bQ', ...d.b]); } },
      { cap: `Both numbers found: substitute. ${T(d.eq.replace(/\\textcolor\{[^}]*\}/g, ''))}.`,
        run: async (c) => { res.innerHTML = T(d.eq); unhide(res); await pop(c, res); } }
    ];
  }
};

/* =============================== explainer 7: flatten — y = mx + b collapses to y = b =============================== */
const flatten = {
  title: 'Flatten it: the x term vanishes',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  intro: 'A line through (0, 3). Keep the y-intercept, shrink the slope to zero. This is Example 4(a)–(c). Press <b>Next</b>.',
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -8, xmax: 8, ymin: -8, ymax: 8, xlabels: 2, ylabels: 2 });
    const PX = 474, PW = ex.W - 488;
    const P = panel(stage, PX, 14, PW, 440, 'The equation');
    const live = h('div', 'u7l2-live'); P.appendChild(live);
    const mb = line(P, `${T(cM('m=0'))} &nbsp; ${T(cB('b=3'))}`, 'u7l2-big u7l2-mbl'); hide(mb);
    const coll = h('div', 'u7l2-coll'); P.appendChild(coll); hide(coll);
    const st = { m: 2 };
    const L = dynLine(G, () => [[0, 3], [1, 3 + st.m]], { color: LINE, width: 4.5 }); hide(L);
    const setLive = (m, exact) => { live.innerHTML = T(exact ? `y=${cM(m)}x+${cB(3)}` : `y\\approx${cM(texNum(Math.round(m * 10) / 10))}x+${cB(3)}`); };
    let tri, tb;
    return [
      { cap: `A line through ${T('(0,\\ 3)')} with slope ${T('2')}: ${T('y=2x+3')}.`,
        run: async (c) => {
          unhide(L); await drawIn(L, 700, c);
          await G.reveal(G.point(0, 3, { color: BCOL, r: 8, label: T(cB('(0,\\ 3)')), pos: 'nw' }), c);
          tri = new SlopeTri(G, { x: 0, y: 3, run: 2, rise: 4 }); await tri.drawIn(c, 380);
          setLive(2, true); await pop(c, live);
        } },
      { cap: `Keep the run, shrink the rise: the slope drops toward ${T('0')} and the line flattens. ${T('b')} stays ${T('3')}.`,
        run: async (c) => {
          await tween(c, 2400, (t) => { st.m = 2 * (1 - t); L._bkDraw(); tri.set({ rise: 2 * st.m }); setLive(st.m); });
          st.m = 0; L._bkDraw(); setLive(0, true);
        } },
      { cap: `Flat: this is ${T('L_1')}. Any run gives a rise of ${T('0')}, so ${T(cM('m=0'))}. It crosses the ${T('y')}-axis at ${T('(0,\\ 3)')}, so ${T(cB('b=3'))}.`,
        run: async (c) => {
          await fadeIn(c, G.label(6.6, 3, T('L_1'), { pos: 'n', cls: 'bk-ptlab u7l2-lname', color: LINE }));
          unhide(mb); await show(c, mb);
        } },
      { cap: `Substitute into ${T('y=mx+b')}: ${T('y=0\\cdot x+3')}. The term ${T('0\\cdot x')} is always ${T('0')}, so it vanishes: ${T('\\boldsymbol{y=3}')}.`,
        run: async (c) => {
          coll.innerHTML = `<span class="u7l2-cy">${T('y=')}</span><span class="u7l2-cz">${T('0\\cdot x+')}</span><span class="u7l2-cb">${T(cB('3'))}</span>`;
          unhide(coll); await show(c, coll); await sleep(c, 400);
          const z = coll.querySelector('.u7l2-cz');
          await anim(c, z, [{ opacity: 1, maxWidth: '200px' }, { opacity: 0, maxWidth: '0px' }], 900);
          coll.innerHTML = T(`\\boldsymbol{y=${cB(3)}}`); await pulse(c, coll, 1.12);
        } },
      { cap: `Every point on ${T('L_1')} has ${T('y')}-coordinate ${T('3')}, whatever ${T('x')} is. That is exactly what ${T('y=3')} says.`,
        run: async (c) => {
          tb = new ValueTable(stage, { x: PX + 24, y: 290, headers: ['x', 'y'], rows: [[-5, 3], [0, 3], [4, 3], [7, 3]], layout: 'h', cellW: Math.min(74, Math.floor((PW - 40) / 5)), cellH: 48, hide: 1, tap: false });
          for (const p of [[-5, 3], [4, 3], [7, 3]]) await G.reveal(G.point(p[0], p[1], { color: INK, r: 6 }), c);
          await tb.fill(c);
        } },
      { cap: `${T('L_2')} is horizontal too, crossing the ${T('y')}-axis at ${T('(0,\\ -6)')}: ${T('m=0')}, ${T('b=-6')}, so ${T('\\boldsymbol{y=-6}')}.`,
        run: async (c) => {
          await G.drawIn(G.line({ m: 0, b: -6 }, { color: RED, width: 4.5 }), 700, c);
          await G.reveal(G.point(0, -6, { color: BCOL, r: 7, label: T(cB('(0,\\ -6)')), pos: 'nw' }), c);
          await fadeIn(c, G.label(6.6, -6, T('L_2:\\ y=-6'), { pos: 'n', dx: -40, cls: 'bk-ptlab u7l2-lname', color: RED }));
        } }
    ];
  }
};

/* =============================== explainer 8: steepen — the slope and y-intercept run away =============================== */
const SM = [1, 2, 5, 50];
const steepen = {
  title: 'Stand it up: no m, no b',
  height: 470,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  intro: 'A line through (−3, 0). Make it steeper and steeper, and watch m and b in the table. This is Example 4(d)–(f). Press <b>Next</b>.',
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -8, xmax: 8, ymin: -8, ymax: 8, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'Through (−3, 0)');
    const tab = h('table', 'u7l2-stab'); tab.innerHTML = `<thead><tr><th>${T('m')}</th><th>equation</th><th>${T('b')}</th></tr></thead><tbody></tbody>`; P.appendChild(tab);
    const body = tab.querySelector('tbody');
    const fin = h('div', 'u7l2-final'); P.appendChild(fin);
    const st = { ang: 45 };
    const L = dynLine(G, () => { const a = st.ang * Math.PI / 180; return [[-3, 0], [-3 + Math.cos(a), Math.sin(a)]]; }, { color: LINE, width: 4.5 }); hide(L);
    const yi = G.point(0, 3, { color: BCOL, r: 8 }); hide(yi);
    const yiLab = G.label(0, 3, '', { pos: 'e', cls: 'bk-ptlab u7l2-yil', clip: false });
    const setAng = (a) => { st.ang = a; L._bkDraw(); const m = Math.tan(a * Math.PI / 180), b = 3 * m; G.moveTo(yi, 0, b); yiLab.gy = Math.min(b, 7.6); yiLab._bkDraw(); yiLab.innerHTML = b > 8 ? `${T(cB('b'))} ↑ off the grid` : T(cB(`(0,\\ ${texNum(Math.round(b * 10) / 10)})`)); };
    const row = (cells) => { const tr = h('tr', ''); tr.innerHTML = cells.map((x) => `<td>${x}</td>`).join(''); body.appendChild(tr); return tr; };
    const angOf = (m) => Math.atan(m) * 180 / Math.PI;
    const steps = []; let rs;
    SM.forEach((m, i) => steps.push({
      cap: i === 0 ? `Start with slope ${T('1')}: ${T('y=x+3')}. It crosses the ${T('y')}-axis at ${T('(0,\\ 3)')}, so ${T('b=3')}.`
        : i === 1 ? `Steeper: slope ${T('2')} gives ${T('y=2x+6')}. The ${T('y')}-intercept climbs to ${T('6')}.`
          : i === 2 ? `Slope ${T('5')}: ${T('y=5x+15')}. The ${T('y')}-intercept ${T('(0,\\ 15)')} is already off the grid.`
            : `Slope ${T('50')}: ${T('y=50x+150')}. The steeper the line, the bigger ${T('m')} and the farther away ${T('b')}. No number is big enough.`,
      run: async (c) => {
        if (i === 0) { unhide(L); setAng(45); await drawIn(L, 700, c); unhide(yi); await G.reveal(yi, c); await G.reveal(G.point(-3, 0, { color: INK, r: 6.5, label: T('(-3,\\ 0)'), pos: 'nw' }), c); }
        else { const a0 = st.ang, a1 = angOf(m); await tween(c, 1100, (t) => setAng(a0 + (a1 - a0) * t)); }
        setAng(angOf(m));
        await show(c, row([T(cM(m)), T(eqTex(m, 1, 3 * m)), T(cB(3 * m))]));
      }
    }));
    steps.push({ cap: `Vertical: from ${T('(-3,\\ -8)')} to ${T('(-3,\\ 8)')} the run is ${T('0')}, and ${T('\\tfrac{16}{0}')} is <b>undefined</b>. No slope, and the line never meets the ${T('y')}-axis: <b>no ${T('y')}-intercept</b>.`,
      run: async (c) => {
        const a0 = st.ang; await tween(c, 900, (t) => setAng(a0 + (90 - a0) * t)); setAng(90); hide(yi); yiLab.style.display = 'none';
        rs = G.segment([-3, -8], [-3, 8], { color: RISE, width: 6 }); await G.drawIn(rs, 700, c);
        await fadeIn(c, G.label(-3, 4, '<b>rise</b> 16, <b>run</b> 0', { pos: 'w', cls: 'bk-ptlab u7l2-tlab u7l2-trise' }));
        await show(c, row([`<b class="u7l2-und">undefined</b>`, '—', `<b class="u7l2-und">none</b>`]));
      } });
    steps.push({ cap: `${T('y=mx+b')} has no value to substitute for ${T('m')}. Instead: every point on ${T('L_3')} has ${T('x=-3')}. Its equation is ${T('\\boldsymbol{x=-3}')}.`,
      run: async (c) => {
        await anim(c, rs, [{ opacity: 1 }, { opacity: 0.3 }], 400);
        for (const p of [[-3, -6], [-3, 6]]) await G.reveal(G.point(p[0], p[1], { color: INK, r: 6.5, label: T(pr(p[0], p[1])), pos: 'e' }), c);
        fin.innerHTML = T(`${cM('x')}=-3`); await pop(c, fin);
        const s = stamp(P, 'x = −3', { ok: true }); s.classList.add('u7l2-stampb'); await stampIn(c, s);
      } });
    return steps;
  }
};

/* =============================== mount =============================== */
mountCrickets();
mountWarmGraph();
mountFigures();
export const explainers = mountExplainers({ assemble, readGraph, spotError, copyTri, turnTri, strategy, flatten, steepen });
export const _test = { AS, RG, SE, CP, TT, FP, red, fr, eqTex, substTex };
