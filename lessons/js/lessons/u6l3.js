/* Math 10C · Unit 6 · Lesson 3 — Rise Over Run: the slope of a line segment.
 * Warm-up ramps, the example figures, the four-kinds tiles, and the explainers:
 *   count (count run and rise square by square, with signs), slide (a slope triangle slides along a line and scales
 *   up and down; the fraction stays equal), zeroCase (flatten the rise → 0; squeeze the run → undefined),
 *   leftRight (walk each line left to right: uphill, downhill, flat, wall), dial (a steepness dial rotates a line from
 *   flat to vertical with its signed slope read-out), order (steepness = size |m|, Example 5), roof (roofline slope and
 *   pitch, Example 6), rate (slope with units as a rate of change, Example 7), stepOff (step the rise and run off a point,
 *   Example 8a), missing (scale the slope triangle to a missing run or rise, Example 8b).
 * Colours: run amber (horizontal), rise purple (vertical), segments/lines blue; positive green, negative red. */
import {
  h, tex, add, box, Graph, NumberLine, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pairTex, texNum, svgEl, liveCtx, pulse, shake, place, arrowHead, drawIn, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const RUN = COLORS.amber, RISE = COLORS.purple, SEG = COLORS.blue, POS = COLORS.green, NEG = COLORS.red, INK = COLORS.ink, GRAY = COLORS.gray, TEAL = COLORS.teal;
const cR = (s) => `\\textcolor{${RISE}}{${s}}`, cU = (s) => `\\textcolor{${RUN}}{${s}}`;
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
/** reduced [n, d] with d > 0 (integers) */
const red = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
/** TeX of a reduced fraction (sign in front), whole numbers plain */
const fr = (n, d, big) => { const [a, b] = red(n, d); if (b === 1) return String(a); return (a < 0 ? '-' : '') + `\\${big ? 'd' : 't'}frac{${Math.abs(a)}}{${b}}`; };
const rawFr = (r, u) => `\\dfrac{${cR(texNum(r))}}{${cU(texNum(u))}}`;
/** slope TeX: rise/run = reduced */
const slopeTex = (r, u) => { const raw = rawFr(r, u), [a, b] = red(r, u); const same = a === r && b === u; return same ? raw : `${raw}=${fr(r, u, true)}`; };
const n = (v) => texNum(v).replace('-', '−');             // plain-text number with a real minus
const one = (v) => n(Math.round(v * 10) / 10);
const show = (c, el) => fadeIn(c, el, 320);
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u6l3-panel ' + cls, title ? `<div class="u6l3-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u6l3-line ' + cls, html); p.appendChild(d); return d; };

/* ---------------------------------------------------------------------------------------------------------------
 * Slope triangle on a Graph: run leg (amber) from (x, y) across, then rise leg (purple) up/down to the line.
 * s = { x, y, run, rise }. Labels sit outside the triangle. Kept in sync on redraw/setWindow via G.track.
 * ------------------------------------------------------------------------------------------------------------- */
class SlopeTri {
  constructor(G, s, o = {}) {
    this.G = G; this.s = Object.assign({}, s); this.o = o;
    const L = o.layer || G.layers.data, w = o.w || 5;
    this.g = svgEl('g', { class: 'u6l3-tri' }, L);
    this.fill = svgEl('path', { fill: o.fill || SEG, 'fill-opacity': o.fillOp ?? 0.1, stroke: 'none' }, this.g);
    this.mark = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 1.6 }, this.g);
    this.runP = svgEl('path', { class: 'bk-stroke', stroke: o.runColor || RUN, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, this.g);
    this.riseP = svgEl('path', { class: 'bk-stroke', stroke: o.riseColor || RISE, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, this.g);
    this.lRun = o.labels === false ? null : h('div', 'bk-lab u6l3-tlab u6l3-trun');
    this.lRise = o.labels === false ? null : h('div', 'bk-lab u6l3-tlab u6l3-trise');
    if (this.lRun) { G.html.append(this.lRun, this.lRise); }
    G.track(this.g, () => this.draw());
  }
  text(kind, v) {
    const f = kind === 'run' ? this.o.runText : this.o.riseText;
    if (f) return f(v);
    const exact = Math.abs(v - Math.round(v * 2) / 2) < 1e-6;
    return `<b>${kind}</b> ${exact ? n(v) : one(v)}`;
  }
  draw() {
    const G = this.G, { x, y, run, rise } = this.s;
    const P = G.toPx(x, y), C = G.toPx(x + run, y), Q = G.toPx(x + run, y + rise);
    const d = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    this.fill.setAttribute('d', `M${P[0]} ${P[1]} L${C[0]} ${C[1]} L${Q[0]} ${Q[1]} Z`);
    this.runP.setAttribute('d', d(P, C)); this.riseP.setAttribute('d', d(C, Q));
    this.runP.style.display = Math.abs(run) < 1e-9 ? 'none' : ''; this.riseP.style.display = Math.abs(rise) < 1e-9 ? 'none' : '';
    const sx = Math.sign(P[0] - C[0]), sy = Math.sign(Q[1] - C[1]), k = 11;
    this.mark.setAttribute('d', Math.abs(C[0] - P[0]) > 2 * k && Math.abs(Q[1] - C[1]) > 2 * k ? `M${C[0] + sx * k} ${C[1]} L${C[0] + sx * k} ${C[1] + sy * k} L${C[0]} ${C[1] + sy * k}` : '');
    if (!this.lRun) return;
    this.lRun.innerHTML = this.text('run', run); this.lRise.innerHTML = this.text('rise', rise);
    const gap = this.o.gap ?? 6;
    place(this.lRun, (P[0] + C[0]) / 2, P[1], this.o.runSide || (rise >= 0 ? 's' : 'n'), gap);
    place(this.lRise, C[0], (C[1] + Q[1]) / 2, this.o.riseSide || (run >= 0 ? 'e' : 'w'), gap + 2);
    this.lRun.style.visibility = Math.abs(run) < 1e-9 && !this.o.showZero ? 'hidden' : '';
    this.lRise.style.visibility = Math.abs(rise) < 1e-9 && !this.o.showZero ? 'hidden' : '';
  }
  set(s) { Object.assign(this.s, s); this.draw(); return this; }
  to(c, s, ms = 900) { const a = Object.assign({}, this.s); return tween(c, ms, (t) => { const o = {}; for (const k in s) o[k] = a[k] + (s[k] - a[k]) * t; this.set(o); }); }
  els() { return [this.g, this.lRun, this.lRise].filter(Boolean); }
  /** run leg, then rise leg, then labels */
  async drawIn(c, ms = 500) {
    const [lr, ls] = [this.lRun, this.lRise]; this.fill.style.opacity = 0; hide(lr); hide(ls);
    await drawIn(this.runP, ms, c); if (lr) await fadeIn(c, lr, 220);
    await drawIn(this.riseP, ms, c); if (ls) await fadeIn(c, ls, 220);
    await appear(c, this.fill, 250);
  }
  remove() { this.G.remove(this.g); this.lRun && this.lRun.remove(); this.lRise && this.lRise.remove(); }
  ghost() { this.g.style.opacity = 0.28; if (this.lRun) { this.lRun.remove(); this.lRise.remove(); this.lRun = this.lRise = null; } }
}

/** count a leg square by square: from (x, y) along axis 'x' or 'y' for v units (signed); unit pieces + count bubbles */
async function countLeg(c, G, x, y, axis, v, o = {}) {
  const els = [], bubbles = [], s = Math.sign(v), N = Math.abs(v), color = axis === 'x' ? RUN : RISE, ms = o.ms || 260;
  for (let k = 0; k < N; k++) {
    const a = axis === 'x' ? [x + s * k, y] : [x, y + s * k], b = axis === 'x' ? [x + s * (k + 1), y] : [x, y + s * (k + 1)];
    const seg = G.segment(a, b, { color, width: 5.5 }); els.push(seg);
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], lab = (s < 0 ? '−' : '') + (k + 1);
    const pos = axis === 'x' ? (o.side || 's') : (o.side || 'e');
    const bub = G.label(mid[0], mid[1], lab, { pos, cls: 'u6l3-bub ' + (axis === 'x' ? 'u6l3-bub-run' : 'u6l3-bub-rise'), gap: 6 });
    bubbles.push(bub); hide(bub);
    await drawIn(seg, ms, c); await pop(c, bub, 200); bub.style.opacity = 1;
  }
  return { els, bubbles };
}

/* =============================== warm-up: ramp rules =============================== */
const RAMPS = [{ k: 'A', run: 120, rise: 10, x: 24, y: 120 }, { k: 'B', run: 180, rise: 20, x: 262, y: 120 }, { k: 'C', run: 400, rise: 25, x: 24, y: 262 }];
function mountRamps() {
  const host = document.getElementById('u6l3-ramps'); if (!host) return;
  const W = 580, H = 300, sx = 1.05, sy = 3 * 1.05;   // heights drawn 3 times taller, like the board
  const wrap = h('div', 'u6l3-rampwrap'); box(wrap, W, H); host.appendChild(wrap);
  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'u6l3-rampsvg' }, wrap);
  const html = h('div', 'bk-html'); wrap.appendChild(html);
  const lab = (x, y, s, pos, cls) => { const d = h('div', 'bk-lab ' + cls, s); html.appendChild(d); return place(d, x, y, pos, 4); };
  const tags = [];
  RAMPS.forEach((r) => {
    const w = r.run * sx, hh = r.rise * sy, x0 = r.x, y0 = r.y;
    svgEl('line', { x1: x0 - 12, x2: x0 + w + 40, y1: y0, y2: y0, stroke: '#b9bec8', 'stroke-width': 2 }, svg);
    svgEl('path', { d: `M${x0} ${y0} L${x0 + w} ${y0} L${x0 + w} ${y0 - hh} Z`, fill: '#d6d8dd', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, svg);
    svgEl('rect', { x: x0 + w, y: y0 - hh, width: 16, height: hh, fill: '#a9adb6', stroke: INK, 'stroke-width': 2 }, svg);
    svgEl('path', { d: `M${x0 + w - 10} ${y0} v-10 h10`, fill: 'none', stroke: INK, 'stroke-width': 1.4 }, svg);
    lab(x0, y0 - hh - 2, `Ramp ${r.k}`, 'ne', 'u6l3-rname');
    lab(x0 + w + 20, y0 - hh / 2, `rise ${r.rise} cm`, 'e', 'u6l3-rrise');
    lab(x0 + w / 2, y0 + 2, `run ${r.run} cm`, 's', 'u6l3-rrun');
    const [a, b] = red(r.rise, r.run);
    const t = lab(x0 + 84, y0 - hh - 2, T(`\\tfrac{${r.rise}}{${r.run}}=\\tfrac{${a}}{${b}}`), 'ne', 'u6l3-rfrac'); hide(t); tags.push(t);
  });
  const note = lab(W - 6, H - 4, 'heights drawn 3 times taller', 'nw', 'u6l3-rnote'); void note;
  // "same run" comparison: all three slopes over a run of 12 cm, from one corner
  const cmp = h('div', 'u6l3-rcmp'); box(cmp, W, H); wrap.appendChild(cmp); cmp.style.opacity = 0; cmp.style.pointerEvents = 'none';
  const cs = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, cmp);
  const ox = 60, oy = 250, runPx = 420, upPx = 150;  // 12 cm across → 420 px; 1 cm up → 150 px (exaggerated)
  svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: '#fffdf7', rx: 12 }, cs);
  svgEl('line', { x1: ox, x2: ox + runPx, y1: oy, y2: oy, stroke: INK, 'stroke-width': 2.5 }, cs);
  const chtml = h('div', 'bk-html'); cmp.appendChild(chtml);
  const clab = (x, y, s, pos, cls) => { const d = h('div', 'bk-lab ' + cls, s); chtml.appendChild(d); return place(d, x, y, pos, 4); };
  clab(ox + runPx / 2, oy + 4, '<b>run 12 cm</b> for every ramp', 's', 'u6l3-rrun');
  const cmpCols = { A: TEAL, B: NEG, C: SEG };
  const cmpLines = RAMPS.map((r) => {
    const up = 12 * r.rise / r.run, py = oy - up * upPx;
    const l = svgEl('line', { x1: ox, y1: oy, x2: ox + runPx, y2: py, stroke: cmpCols[r.k], 'stroke-width': 4.5, 'stroke-linecap': 'round' }, cs);
    svgEl('line', { x1: ox + runPx, x2: ox + runPx, y1: oy, y2: py, stroke: cmpCols[r.k], 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, cs);
    const t = clab(ox + runPx + 8, py, `<b>${r.k}</b>: rise ${n(+up.toFixed(2))} cm`, 'e', 'u6l3-rcl'); t.style.color = cmpCols[r.k];
    return l;
  });
  void cmpLines;
  clab(ox, 20, 'Same run, side by side (heights exaggerated): <b>B</b> climbs most, <b>C</b> least.', 'se', 'u6l3-rcap');
  let shown = false, cmpOn = false;
  document.getElementById('u6l3-rcmp').addEventListener('click', async () => {
    const c = liveCtx(); shown = !shown;
    if (cmpOn) { cmpOn = false; await fadeIn(c, cmp, 1); cmp.style.opacity = 0; }
    for (const t of tags) { if (shown) await pop(c, t, 320); else t.style.opacity = 0; }
  });
  document.getElementById('u6l3-r12').addEventListener('click', async () => {
    const c = liveCtx(); cmpOn = !cmpOn;
    if (cmpOn) await fadeIn(c, cmp, 400); else cmp.style.opacity = 0;
  });
}

/* =============================== static figures =============================== */
const EX1 = [{ k: 'AB', P: [-4, -3], Q: [2, 3], pn: ['sw', 'ne'] }, { k: 'CD', P: [-3, 2], Q: [3, -2], pn: ['nw', 'se'] },
  { k: 'EF', P: [-2, -4], Q: [4, -1], pn: ['sw', 'e'] }, { k: 'GH', P: [1, 4], Q: [4, -2], pn: ['n', 'se'] }];
const segFig = (G, list, o = {}) => list.forEach((s) => {
  G.segment(s.P, s.Q, { color: o.color || INK, width: 4 });
  G.point(s.P[0], s.P[1], { color: INK, r: 5.5, label: T(s.k[0]), pos: s.pn[0] });
  G.point(s.Q[0], s.Q[1], { color: INK, r: 5.5, label: T(s.k[1]), pos: s.pn[1] });
});
const EX2 = { A: [-5, -4], B: [-3, -3], C: [1, -1], D: [5, 1] };
const EX3 = [{ k: 'MN', P: [-4, 3], Q: [2, 3], pn: ['w', 'e'] }, { k: 'PQ', P: [-3, -2], Q: [4, -2], pn: ['w', 'e'] },
  { k: 'RS', P: [1, 4], Q: [1, -3], pn: ['n', 's'] }, { k: 'TU', P: [-2, 4], Q: [-2, -4], pn: ['n', 's'] }];
const EX4 = [
  { k: 1, pts: [[-1, 2], [3, 4]], from: [-1.6, 1.7], to: [3.6, 4.3], lab: [3.6, 4.3, 'e'] },
  { k: 2, pts: [[2, -4], [4, 2]], from: [1.75, -4.75], to: [4.25, 2.75], lab: [4.25, 2.75, 'n'] },
  { k: 3, pts: [[-5, -1], [1, -5]], from: [-5.3, -0.8], to: [1.6, -5.4], lab: [-4.4, -1.65, 's'] },
  { k: 4, pts: [[-4, 5], [-2, -1]], from: [-4.1, 5.3], to: [-1.75, -1.75], lab: [-3.9, 5.2, 'e'] }];
const ex4Fig = (G, color) => EX4.forEach((L) => {
  G.segment(L.from, L.to, { color: color || INK, width: 4 });
  L.pts.forEach((p) => G.point(p[0], p[1], { color: INK, r: 6 }));
  G.label(L.lab[0], L.lab[1], `Line ${L.k}`, { pos: L.lab[2], cls: 'bk-ptlab u6l3-lname' });
});
function drawRoof(G, o = {}) {
  const peak = o.peak || [4, 6], R = o.right || [8, 1], Lf = o.left || [0, 2.5];
  G.segment(Lf, peak, { color: INK, width: 4.5 }); G.segment(peak, R, { color: INK, width: 4.5 });
  if (o.chimney !== false) {
    const [x0, y0] = G.toPx(0, 4.3), [x1, y1] = G.toPx(1.4, 0.4);
    const ch = svgEl('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: '#a9adb6', stroke: '#8a8f99', 'stroke-width': 1 }, G.layers.top);
    G.label(1.5, 1.4, 'chimney', { pos: 'e', cls: 'bk-ptlab u6l3-small' });
    return ch;
  }
  return null;
}
function mountFigures() {
  const g1 = document.getElementById('u6l3-ex1fig');
  if (g1) segFig(new Graph(g1, { width: 400, height: 400, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, xlabels: 2, ylabels: 2 }), EX1);
  const g2 = document.getElementById('u6l3-ex2fig');
  if (g2) {
    const G = new Graph(g2, { width: 380, height: 380, xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5, xlabels: 2, ylabels: 2 });
    G.segment([-6, -4.5], [6, 1.5], { color: INK, width: 4 });
    Object.entries(EX2).forEach(([k, p]) => G.point(p[0], p[1], { color: INK, r: 6, label: T(k), pos: k === 'A' ? 's' : 'n' }));
  }
  const g3 = document.getElementById('u6l3-ex3fig');
  if (g3) segFig(new Graph(g3, { width: 380, height: 380, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, xlabels: 2, ylabels: 2 }), EX3);
  const g4 = document.getElementById('u6l3-ex4fig');
  if (g4) ex4Fig(new Graph(g4, { width: 380, height: 380, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, xlabels: 2, ylabels: 2 }));
  const g6 = document.getElementById('u6l3-ex6fig');
  if (g6) {
    const G = new Graph(g6, { width: 400, height: 330, xmin: 0, xmax: 9, ymin: 0, ymax: 7, arrows: false, xtitle: '', ytitle: '', origin: true });
    drawRoof(G);
    G.point(4, 6, { color: INK, r: 6, coords: true, pos: 'n' }); G.point(8, 1, { color: INK, r: 6, coords: true, pos: 'ne' });
  }
  const g7a = document.getElementById('u6l3-ex7a');
  if (g7a) {
    const G = new Graph(g7a, RATE.ex7a.g); G.segment([0, 0], [4, 320], { color: INK, width: 4 });
    G.point(3, 240, { color: INK, r: 6, label: T('(3,\\ 240)'), pos: 'nw' });
  }
  const g7b = document.getElementById('u6l3-ex7b');
  if (g7b) {
    const G = new Graph(g7b, RATE.ex7b.g); G.segment([0, 120], [8, 0], { color: INK, width: 4 });
    G.point(0, 120, { color: INK, r: 6, label: T('(0,\\ 120)'), pos: 'ne' }); G.point(4, 60, { color: INK, r: 6, label: T('(4,\\ 60)'), pos: 'ne' });
  }
  const g8 = document.getElementById('u6l3-ex8fig');
  if (g8) {
    const G = new Graph(g8, { width: 400, height: 400, xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5, xlabels: 2, ylabels: 2, interactive: { snap: 1, coords: true, color: 'blue' } });
    G.point(-3, -4, { color: INK, r: 6.5, coords: true, pos: 'se' });
  }
  const g8a = document.getElementById('u6l3-ex8ans');
  if (g8a) {
    const G = new Graph(g8a, { width: 300, height: 300, xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5, xlabels: 2, ylabels: 2, fontSize: 14 });
    G.segment([-13 / 3, -6], [11 / 3, 6], { color: NEG, width: 3.5 });
    G.point(-3, -4, { color: INK, r: 5.5 });
    [[-1, -1], [1, 2], [3, 5]].forEach((p) => G.point(p[0], p[1], { color: NEG, r: 5.5, coords: true, pos: 'nw', labelCls: 'u6l3-small' }));
  }
  // the four kinds of slope
  const kinds = { pos: [[-1.3, -1.2], [1.3, 1.2], POS], neg: [[-1.3, 1.2], [1.3, -1.2], NEG], zero: [[-1.4, 0.8], [1.4, 0.8], SEG], und: [[0.8, -1.4], [0.8, 1.4], RISE] };
  document.querySelectorAll('#u6l3-kinds .u6l3-kind').forEach((el) => {
    const k = kinds[el.dataset.k]; if (!k) return;
    const G = new Graph(el.querySelector('.u6l3-kfig'), { width: 130, height: 110, xmin: -1.7, xmax: 1.8, ymin: -1.6, ymax: 1.6, grid: false, numbers: false, xtitle: '', ytitle: '', pad: 4 });
    G.segment(k[0], k[1], { color: k[2], width: 4.5 });
  });
}

/* =============================== explainer 1: count the rise and the run =============================== */
const CNT = {
  up: { label: 'Up and right', P: [-3, -1], Q: [3, 3] },
  down: { label: 'Down and right', P: [-2, 3], Q: [2, -3] },
  back: { label: 'Counted right to left', P: [3, 3], Q: [-3, -1] },
  ex1: { label: 'Example 1 check', ex: true }
};
const count = {
  title: 'Count the run, then the rise',
  height: 470,
  choices: Object.keys(CNT).map((k) => ({ v: k, label: CNT[k].label })),
  intro: 'Start at one endpoint and count squares to the other: <b>across</b> first (the run), then <b>up or down</b> (the rise). Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CNT[k];
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, d.ex ? 'Example 1' : 'Count from <i>P</i> to <i>Q</i>');
    if (d.ex) return countEx1(G, P);
    const [p, q] = [d.P, d.Q], run = q[0] - p[0], rise = q[1] - p[1];
    let pieces = [];
    const rr = h('div', 'u6l3-ro');
    rr.innerHTML = `<div class="u6l3-ro-r u6l3-ro-run"><span class="u6l3-ro-k">run</span><b class="u6l3-ro-v">?</b></div><div class="u6l3-ro-r u6l3-ro-rise"><span class="u6l3-ro-k">rise</span><b class="u6l3-ro-v">?</b></div>`;
    P.appendChild(rr); const [vRun, vRise] = rr.querySelectorAll('b');
    const res = h('div', 'u6l3-big'); P.appendChild(res);
    const back = run < 0;
    const steps = [
      { cap: `A segment from ${T(`P${pairTex(p[0], p[1])}`)} to ${T(`Q${pairTex(q[0], q[1])}`)}. Start at <b>P</b>${back ? ', the <b>right</b> end this time' : ''}.`,
        run: async (c) => {
          const s = G.segment(p, q, { color: SEG, width: 4.5 }); await G.drawIn(s, 700, c);
          const away = (a, b) => (a[1] > b[1] ? 'n' : 's') + (a[0] > b[0] ? 'e' : 'w');
          await G.reveal(G.point(p[0], p[1], { color: INK, r: 7, label: T('P'), pos: away(p, q) }), c);
          await G.reveal(G.point(q[0], q[1], { color: INK, r: 7, label: T('Q'), pos: away(q, p) }), c);
        } },
      { cap: `<b>Run:</b> count the squares <b>across</b>, moving ${run > 0 ? '<b>right</b>: positive' : '<b>left</b>: negative'}. Run ${T('=' + run)}.`,
        run: async (c) => { const r = await countLeg(c, G, p[0], p[1], 'x', run, { side: rise > 0 ? 's' : 'n' }); pieces = pieces.concat(r.els, r.bubbles); vRun.innerHTML = T(cU(run)); await pulse(c, vRun.parentNode, 1.08); } },
      { cap: `<b>Rise:</b> count the squares ${rise > 0 ? '<b>up</b>: positive' : '<b>down</b>: negative'}, to reach Q. Rise ${T('=' + rise)}.`,
        run: async (c) => { const r = await countLeg(c, G, q[0], p[1], 'y', rise, { side: run > 0 ? 'e' : 'w' }); pieces = pieces.concat(r.els, r.bubbles); vRise.innerHTML = T(cR(rise)); await pulse(c, vRise.parentNode, 1.08); } },
      { cap: `${T('\\text{slope}=\\dfrac{\\text{rise}}{\\text{run}}=' + slopeTex(rise, run))}${red(rise, run)[1] !== Math.abs(run) ? ', in lowest terms.' : '.'}`,
        run: async (c) => { res.innerHTML = T(`\\text{slope}=${slopeTex(rise, run)}`); await pop(c, res); } }
    ];
    if (back) steps.push({ cap: `Two negatives make a positive: counted right to left, it’s the <b>same</b> ${T('\\tfrac{2}{3}')} as counting left to right (run ${T('6')}, rise ${T('4')}). Left to right keeps the run positive, so it’s easier.`,
      run: async (c) => { const t = line(P, `Left to right: ${T(slopeTex(4, 6))}`, 'u6l3-mline u6l3-soft'); await show(c, t); } });
    return steps;
  }
};
function countEx1(G, P) {
  segFig(G, EX1, { color: '#7d8494' });
  const tb = h('table', 'u6l3-ptab'); tb.innerHTML = '<tr><th></th><th class="u6l3-c-rise">rise</th><th class="u6l3-c-run">run</th><th>slope</th></tr>' + EX1.map((s) => `<tr><td>${T(s.k)}</td><td>?</td><td>?</td><td>?</td></tr>`).join('');
  P.appendChild(tb);
  let prev = [];
  const steps = EX1.map((s, i) => {
    const run = s.Q[0] - s.P[0], rise = s.Q[1] - s.P[1];
    return { cap: `${T(s.k)}: from ${T(`${s.k[0]}${pairTex(s.P[0], s.P[1])}`)} run ${T(String(run))} right, rise ${T(String(rise))} ${rise > 0 ? 'up' : 'down'}: ${T(slopeTex(rise, run))}.`,
      run: async (c) => {
        G.remove(prev); prev = [];
        const hl = G.segment(s.P, s.Q, { color: SEG, width: 5 }); prev.push(hl); await G.drawIn(hl, 400, c);
        const a = await countLeg(c, G, s.P[0], s.P[1], 'x', run, { ms: 150, side: rise > 0 ? 's' : 'n' });
        const b = await countLeg(c, G, s.Q[0], s.P[1], 'y', rise, { ms: 150, side: 'e' });
        prev.push(...a.els, ...a.bubbles, ...b.els, ...b.bubbles);
        const cells = tb.rows[i + 1].cells;
        cells[1].innerHTML = T(cR(rise)); cells[2].innerHTML = T(cU(run)); cells[3].innerHTML = T(fr(rise, run, true));
        for (const j of [1, 2, 3]) await pop(c, cells[j].firstChild, 260);
      } };
  });
  steps.push({ cap: `All four, counted left to right: ${T('AB')} and ${T('EF')} rise (positive slopes), ${T('CD')} and ${T('GH')} fall (negative slopes).`, run: async () => { G.remove(prev); prev = []; } });
  return steps;
}

/* =============================== explainer 2: slide and scale the slope triangle =============================== */
const SL = {
  pos: { label: 'Slope ' + T('\\tfrac{2}{3}'), m: [2, 3], b: -1, x0: -6, slideTo: 3, win: 7 },
  neg: { label: 'Slope ' + T('-\\tfrac{3}{2}'), m: [-3, 2], b: 2, x0: -2, slideTo: 4, win: 7 },
  ex2: { label: 'Example 2 check', ex: true, win: 7 }
};
const slide = {
  title: 'Slide it, scale it: the slope stays the same',
  height: 470,
  choices: Object.keys(SL).map((k) => ({ v: k, label: SL[k].label })),
  intro: 'A slope triangle sits on a line. Watch the fraction as the triangle <b>slides</b> and <b>grows</b>. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = SL[k], wn = d.win;
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -wn, xmax: wn, ymin: -wn, ymax: wn, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, d.ex ? 'Example 2: four pairs' : 'The slope triangle');
    const ro = h('div', 'u6l3-frbox'); P.appendChild(ro);
    const log = h('div', 'u6l3-log'); P.appendChild(log);
    const setRo = (r, u, exact) => { ro.innerHTML = T(`\\dfrac{\\text{rise}}{\\text{run}}=${exact ? slopeTex(r, u) : rawFr(+(r.toFixed(1)), +(u.toFixed(1)))}`); };
    if (d.ex) return slideEx2(G, P, ro, log);
    const [r0, u0] = d.m, m = r0 / u0, y = (x) => m * x + d.b;
    let T1 = null;
    const ghosts = [];
    const sizes = [2, 3, 0.5];
    const steps = [
      { cap: `A slope triangle between two grid points on the line: run ${T(cU(u0))}, rise ${T(cR(r0))}. So ${T('\\tfrac{\\text{rise}}{\\text{run}}=' + slopeTex(r0, u0))}.`,
        run: async (c) => {
          await G.drawIn(G.line({ m, b: d.b }, { color: SEG, width: 4 }), 700, c);
          T1 = new SlopeTri(G, { x: d.x0, y: y(d.x0), run: u0, rise: r0 });
          await T1.drawIn(c, 450); setRo(r0, u0, true); await pop(c, ro);
        } },
      { cap: `<b>Slide</b> it along the line. Wherever it sits, it is still run ${T(cU(u0))} and rise ${T(cR(r0))}: still ${T(fr(r0, u0))}.`,
        run: async (c) => {
          await tween(c, 1800, (t) => { const x = d.x0 + (d.slideTo - d.x0) * t; T1.set({ x, y: y(x) }); });
          await sleep(c, 300);
          await tween(c, 1200, (t) => { const x = d.slideTo + (d.x0 - d.slideTo) * t; T1.set({ x, y: y(x) }); });
          await show(c, line(log, `slid along: ${T(rawFr(r0, u0))}`));
        } }
    ];
    sizes.forEach((s, i) => {
      const r = r0 * s, u = u0 * s, big = s > 1;
      steps.push({
        cap: big ? `<b>Scale it up</b> ×${s}: run ${T(cU(u))}, rise ${T(cR(r))}. ${T(slopeTex(r, u))}, the same slope.`
          : `<b>Shrink it</b> to half: run ${T(cU(texNum(u)))}, rise ${T(cR(texNum(r)))}. ${T(rawFr(r, u))} is ${T(texNum(r))} ÷ ${T(texNum(u))} ${T('=' + fr(r0, u0))} too.`,
        run: async (c) => {
          const g = new SlopeTri(G, T1.s, { labels: false, fillOp: 0.05 }); g.ghost(); ghosts.push(g);
          await T1.to(c, { run: u, rise: r }, 1100);
          ro.innerHTML = T(`\\dfrac{\\text{rise}}{\\text{run}}=${Number.isInteger(r) && Number.isInteger(u) ? slopeTex(r, u) : rawFr(r, u) + '=' + fr(r0, u0, true)}`); await pulse(c, ro, 1.06);
          await show(c, line(log, `×${s}: ${T(rawFr(r, u) + '=' + fr(r0, u0, true))}`));
        }
      });
    });
    steps.push({ cap: `Every slope triangle on the line is a <b>scaled copy</b> of the others, so ${T('\\tfrac{\\text{rise}}{\\text{run}}')} never changes. That one number, ${T(fr(r0, u0))}, is <b>the slope of the line</b>.`,
      run: async (c) => { await T1.to(c, { run: u0, rise: r0 }, 700); const s = stamp(P, `slope ${r0 < 0 ? '−' : ''}${Math.abs(r0)}/${u0}`, { ok: true }); s.classList.add('u6l3-stampb'); await stampIn(c, s); } });
    return steps;
  }
};
function slideEx2(G, P, ro, log) {
  G.segment([-6.5, -4.75], [6.5, 1.75], { color: SEG, width: 4 });
  Object.entries(EX2).forEach(([k, p]) => G.point(p[0], p[1], { color: INK, r: 6.5, label: T(k), pos: k === 'A' ? 'nw' : 'nw' }));
  const pairs = [['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'C']];
  let T1 = null; const ghosts = [];
  const steps = pairs.map(([a, b], i) => {
    const pa = EX2[a], pb = EX2[b], run = pb[0] - pa[0], rise = pb[1] - pa[1];
    return { cap: `(${'abcd'[i]}) ${T(a + b)}: from ${T(`${a}${pairTex(pa[0], pa[1])}`)} to ${T(`${b}${pairTex(pb[0], pb[1])}`)}, run ${T(cU(run))}, rise ${T(cR(rise))}: ${T(slopeTex(rise, run))}.`,
      run: async (c) => {
        if (!T1) { T1 = new SlopeTri(G, { x: pa[0], y: pa[1], run, rise }); await T1.drawIn(c, 450); }
        else { const g = new SlopeTri(G, T1.s, { labels: false }); g.ghost(); ghosts.push(g); await T1.to(c, { x: pa[0], y: pa[1], run, rise }, 1000); }
        ro.innerHTML = T(`\\dfrac{\\text{rise}}{\\text{run}}=${slopeTex(rise, run)}`); await pop(c, ro);
        await show(c, line(log, `${T(a + b)}: ${T(slopeTex(rise, run))}`));
      } };
  });
  steps.push({ cap: `(e) All four pairs give ${T('\\tfrac{1}{2}')}. The slope belongs to the <b>whole line</b>, not to the pair of points you pick.`,
    run: async (c) => { const s = stamp(P, 'all ½', { ok: true }); s.classList.add('u6l3-stampb'); await stampIn(c, s); } });
  return steps;
}

/* =============================== explainer 3: zero and undefined =============================== */
const ZC = {
  flat: { label: 'Flatten the rise to 0', P: [-3, -2], run: 6, rises: [4, 2, 1, 0] },
  stand: { label: 'Squeeze the run to 0', P: [-3, -3], rise: 6, runs: [6, 3, 1, 0.5, 0] },
  ex3: { label: 'Example 3 check', ex: true }
};
const zeroCase = {
  title: 'Why 0, and why undefined?',
  height: 470,
  choices: Object.keys(ZC).map((k) => ({ v: k, label: ZC[k].label })),
  intro: (k) => (k === 'ex3' ? 'Count each segment of Example 3. Press <b>Next</b>.' : 'One endpoint stays put; the other moves. Watch <b>rise ÷ run</b>. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = ZC[k];
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, d.ex ? 'Example 3' : k === 'flat' ? 'Run stays 6' : 'Rise stays 6');
    const ro = h('div', 'u6l3-frbox'); P.appendChild(ro);
    const tb = h('table', 'u6l3-ptab'); P.appendChild(tb);
    if (d.ex) return zeroEx3(G, P, ro, tb);
    const p = d.P, flat = k === 'flat';
    const vals = flat ? d.rises : d.runs;
    tb.innerHTML = `<tr><th class="${flat ? 'u6l3-c-rise' : 'u6l3-c-run'}">${flat ? 'rise' : 'run'}</th><th>slope</th></tr>`;
    let seg = null, Tr = null, Qp = null;
    const st = { run: flat ? d.run : vals[0], rise: flat ? vals[0] : d.rise };
    const mkSeg = () => G.curve(() => ({ subs: [[G.toPx(p[0], p[1]), G.toPx(p[0] + st.run, p[1] + st.rise)]] }), { color: SEG, width: 4.5 }, 'bk-seg', G.layers.data);
    const setQ = (s) => { Object.assign(st, s); seg._bkDraw(); Tr.set({ run: st.run, rise: st.rise }); G.moveTo(Qp, p[0] + st.run, p[1] + st.rise); };
    const live = () => { const r = st.rise, u = st.run; ro.innerHTML = T(`\\dfrac{${cR(one(r).replace('−', '-'))}}{${cU(one(u).replace('−', '-'))}}=${Math.abs(u) < 1e-9 ? '?' : texNum(Math.round(r / u * 100) / 100)}`); };
    const row = (v, s) => { const r = tb.insertRow(); r.innerHTML = `<td>${T(texNum(v))}</td><td>${s}</td>`; return r; };
    const steps = [];
    vals.forEach((v, i) => {
      const r = flat ? v : d.rise, u = flat ? d.run : v, zero = flat ? r === 0 : u === 0;
      const sl = zero ? (flat ? '0' : '\\text{undefined}') : Number.isInteger(r / u) ? String(r / u) : fr(r, u, true);
      let cap;
      if (i === 0) cap = `A segment with run ${T(cU(u))} and rise ${T(cR(r))}: slope ${T(slopeTex(r, u))}.`;
      else if (!zero) cap = flat ? `Lower the end: rise ${T(cR(r))}. Slope ${T(rawFr(r, u) + '=' + fr(r, u))}: <b>flatter, smaller</b>.` : `Squeeze the run to ${T(cU(texNum(u)))}. Slope ${T(rawFr(r, u) + '=' + texNum(r / u))}: <b>steeper, bigger</b>.`;
      else cap = flat ? `Flat: rise ${T(cR(0))}. ${T(rawFr(0, 6) + '=0')}: zero divided by any number is 0. A <b>horizontal</b> segment has slope <b>0</b>.`
        : `Straight up: run ${T(cU(0))}. ${T(rawFr(6, 0))}: no number times 0 makes 6, so we <b>cannot divide by zero</b>. A <b>vertical</b> segment’s slope is <b>undefined</b>.`;
      steps.push({ cap, run: async (c) => {
        if (i === 0) {
          seg = mkSeg(); await G.drawIn(seg, 600, c);
          G.point(p[0], p[1], { color: INK, r: 7 }); Qp = G.point(p[0] + st.run, p[1] + st.rise, { color: INK, r: 8 });
          Tr = new SlopeTri(G, { x: p[0], y: p[1], run: st.run, rise: st.rise }, { showZero: true }); await Tr.drawIn(c, 350);
        } else {
          const a = { ...st }, b = flat ? { rise: r } : { run: u };
          await tween(c, 1100, (t) => { const o = {}; for (const kk in b) o[kk] = a[kk] + (b[kk] - a[kk]) * t; setQ(o); live(); });
        }
        setQ(flat ? { rise: r } : { run: u });
        ro.innerHTML = T(`\\dfrac{\\text{rise}}{\\text{run}}=${zero ? rawFr(r, u) + (flat ? '=0' : '') : slopeTex(r, u)}`);
        const rr = row(v, zero ? `<b class="${flat ? 'u6l3-zero' : 'u6l3-und'}">${flat ? '0' : 'undefined'}</b>` : T(sl)); await show(c, rr);
        if (zero) { const s2 = stamp(P, flat ? 'slope 0' : 'undefined', { ok: flat ? true : false }); s2.classList.add('u6l3-stampb'); await stampIn(c, s2); }
      } });
    });
    return steps;
  }
};
function zeroEx3(G, P, ro, tb) {
  segFig(G, EX3, { color: '#7d8494' });
  tb.innerHTML = '<tr><th></th><th class="u6l3-c-rise">rise</th><th class="u6l3-c-run">run</th><th>slope</th></tr>' + EX3.map((s) => `<tr><td>${T(s.k)}</td><td>?</td><td>?</td><td>?</td></tr>`).join('');
  let prev = [];
  const steps = EX3.map((s, i) => {
    const run = s.Q[0] - s.P[0], rise = s.Q[1] - s.P[1], vert = run === 0;
    return { cap: vert ? `${T(s.k)} is <b>vertical</b>: rise ${T(cR(rise))}, run ${T(cU(0))}. ${T(rawFr(rise, 0))} is <b>undefined</b>.`
      : `${T(s.k)} is <b>horizontal</b>: run ${T(cU(run))}, rise ${T(cR(0))}. ${T(rawFr(0, run) + '=0')}.`,
    run: async (c) => {
      G.remove(prev); prev = [];
      const hl = G.segment(s.P, s.Q, { color: SEG, width: 5 }); prev.push(hl); await G.drawIn(hl, 400, c);
      const r = vert ? await countLeg(c, G, s.P[0], s.P[1], 'y', rise, { ms: 120, side: 'e' }) : await countLeg(c, G, s.P[0], s.P[1], 'x', run, { ms: 130, side: 's' });
      prev.push(...r.els, ...r.bubbles);
      ro.innerHTML = T(`\\dfrac{\\text{rise}}{\\text{run}}=${rawFr(rise, run)}${vert ? '' : '=0'}`);
      const cells = tb.rows[i + 1].cells;
      cells[1].innerHTML = T(cR(rise)); cells[2].innerHTML = T(cU(run)); cells[3].innerHTML = vert ? '<b class="u6l3-und">undefined</b>' : '<b class="u6l3-zero">0</b>';
      for (const j of [1, 2, 3]) await pop(c, cells[j].firstChild, 240);
    } };
  });
  steps.push({ cap: `(b) <b>Horizontal</b> segments have a slope of <b>0</b>. <b>Vertical</b> segments have an <b>undefined</b> slope.`,
    run: async (c) => { G.remove(prev); prev = []; const b = h('div', 'u6l3-rulebox', 'horizontal → slope <b>0</b><br>vertical → slope <b>undefined</b>'); P.appendChild(b); await pop(c, b); } });
  return steps;
}

/* =============================== explainer 4: read it left to right =============================== */
const LR = {
  kinds: { label: 'Walk four lines' },
  ex4: { label: 'Example 4 check' }
};
const WALK = [
  { k: 'pos', a: [-5, -3], b: [5, 3], word: 'uphill', sign: 'positive', col: POS, tile: '↗ uphill: <b>positive</b>' },
  { k: 'neg', a: [-5, 3], b: [5, -2], word: 'downhill', sign: 'negative', col: NEG, tile: '↘ downhill: <b>negative</b>' },
  { k: 'zero', a: [-5, 1], b: [5, 1], word: 'flat', sign: 'zero', col: SEG, tile: '→ flat: <b>zero</b>' },
  { k: 'und', a: [2, -5.5], b: [2, 5.5], word: 'a wall', sign: 'undefined', col: RISE, tile: '↑ a wall: <b>undefined</b>' }];
function walker(G) {
  const g = svgEl('g', { class: 'u6l3-walker' }, G.layers.top), body = svgEl('g', {}, svgEl('g', { transform: 'scale(1.35)' }, g));
  svgEl('circle', { cx: 0, cy: -36, r: 7, fill: INK }, body);
  svgEl('path', { d: 'M0 -29 V-12 M0 -12 L-6 0 M0 -12 L6 0 M0 -24 L-8 -16 M0 -24 L9 -18', stroke: INK, 'stroke-width': 3.6, 'stroke-linecap': 'round', fill: 'none' }, body);
  g.body = body;
  g.at = (x, y, ang = 0) => { const [px, py] = G.toPx(x, y); g.setAttribute('transform', `translate(${px} ${py}) rotate(${ang})`); };
  return g;
}
const leftRight = {
  title: 'Read it left to right',
  height: 470,
  choices: Object.keys(LR).map((k) => ({ v: k, label: LR[k].label })),
  intro: (k) => (k === 'ex4' ? 'Slope triangles on the four lines of Example 4, each from its left marked point. Press <b>Next</b>.' : 'A hiker walks each line from <b>left to right</b>. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, k === 'ex4' ? 'Example 4' : 'Left to right');
    if (k === 'ex4') return lrEx4(G, P);
    const tiles = h('div', 'u6l3-tiles'); P.appendChild(tiles);
    let W = null, prev = null;
    const steps = WALK.map((w) => {
      const m = w.k === 'und' ? null : (w.b[1] - w.a[1]) / (w.b[0] - w.a[0]);
      const cap = w.k === 'pos' ? `Walking left to right, this line goes <b>uphill</b>: rise and run have the same sign, so the slope is <b>positive</b>.`
        : w.k === 'neg' ? `This one goes <b>downhill</b> from left to right: the rise is negative while the run is positive, so the slope is <b>negative</b>.`
          : w.k === 'zero' ? `<b>Flat</b>: no rise at all. Rise ${T('0')}, so the slope is <b>zero</b>.`
            : `A <b>wall</b>: you can’t walk it from left to right at all. Run ${T('0')}, so the slope is <b>undefined</b>.`;
      return { cap, run: async (c) => {
        if (prev) prev.style.opacity = 0.25;
        const L = G.segment(w.a, w.b, { color: w.col, width: 4.5 }); prev = L; await G.drawIn(L, 600, c);
        if (!W) W = walker(G);
        const ang = m == null ? 0 : -Math.atan(m * G.uy / G.ux) * 180 / Math.PI;
        if (w.k === 'und') {
          W.at(-4.5, -5.1); await tween(c, 1400, (t) => W.at(-4.5 + 6.1 * t, -5.1)); await shake(c, W.body);
        } else {
          await tween(c, 1800, (t) => { const x = w.a[0] + 0.3 + (w.b[0] - w.a[0] - 0.6) * t; W.at(x, w.a[1] + m * (x - w.a[0]), ang); });
        }
        const tl = h('div', 'u6l3-tile u6l3-tile-' + w.k, w.tile); tiles.appendChild(tl); await pop(c, tl);
      } };
    });
    steps.push({ cap: `Always read a graph <b>left to right</b>. Up: positive. Down: negative. Flat: zero. Vertical: undefined.`,
      run: async (c) => { if (W) W.style.opacity = 0; if (prev) prev.style.opacity = 0.25; const b = h('div', 'u6l3-rulebox', 'the <b>sign</b> of the slope tells the <b>direction</b>'); P.appendChild(b); await pop(c, b); } });
    return steps;
  }
};
function lrEx4(G, P) {
  ex4Fig(G, '#7d8494');
  const tb = h('table', 'u6l3-ptab'); P.appendChild(tb);
  tb.innerHTML = '<tr><th></th><th class="u6l3-c-rise">rise</th><th class="u6l3-c-run">run</th><th>slope</th></tr>' + EX4.map((L) => `<tr><td>Line ${L.k}</td><td>?</td><td>?</td><td>?</td></tr>`).join('');
  const steps = EX4.map((L, i) => {
    const [a, b] = L.pts, run = b[0] - a[0], rise = b[1] - a[1], col = rise > 0 ? POS : NEG;
    return { cap: `Line ${L.k}: from ${T(pairTex(a[0], a[1]))} to ${T(pairTex(b[0], b[1]))}, run ${T(cU(run))}, rise ${T(cR(rise))}. ${T(slopeTex(rise, run))}: it ${rise > 0 ? '<b>rises</b>' : '<b>falls</b>'}.`,
      run: async (c) => {
        const hl = G.segment(L.from, L.to, { color: col, width: 5 }); await G.drawIn(hl, 400, c);
        const Tr = new SlopeTri(G, { x: a[0], y: a[1], run, rise }, { labels: false, fill: col }); await Tr.drawIn(c, 350);
        const cells = tb.rows[i + 1].cells;
        cells[1].innerHTML = T(cR(rise)); cells[2].innerHTML = T(cU(run)); cells[3].innerHTML = T(`\\textcolor{${col}}{${fr(rise, run, true)}}`);
        for (const j of [1, 2, 3]) await pop(c, cells[j].firstChild, 240);
      } };
  });
  steps.push({ cap: `(b) Lines 1 and 2 <b>rise</b> from left to right: <b>positive</b> slopes. Lines 3 and 4 <b>fall</b>: <b>negative</b> slopes.`,
    run: async (c) => { const b = h('div', 'u6l3-rulebox', 'rises → <b class="u6l3-pos">positive</b><br>falls → <b class="u6l3-neg">negative</b>'); P.appendChild(b); await pop(c, b); } });
  return steps;
}

/* =============================== explainer 5: the steepness dial =============================== */
const DEG = Math.PI / 180;
const mOf = (phi) => Math.tan(phi * DEG);           // phi: the line's angle in degrees, 0 ≤ phi < 180
const phiOf = (m) => (m == null ? 90 : (Math.atan(m) / DEG + 180) % 180);
const DIAL = {
  pos: { label: 'Climb: positive slopes', stops: [[0, 1], [1, 4], [1, 2], [1, 1], [2, 1], [5, 1], null] },
  neg: { label: 'Fall: negative slopes', stops: [[0, 1], [-1, 4], [-1, 2], [-1, 1], [-2, 1], [-5, 1], null] },
  sweep: { label: 'Full turn', sweep: true }
};
const DIAL_TICKS = [[1, 4], [1, 2], [1, 1], [2, 1], [5, 1]];
const dial = {
  title: 'The steepness dial',
  height: 470,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(DIAL).map((k) => ({ v: k, label: DIAL[k].label })),
  intro: 'The line turns about the origin. The dial’s needle points along the line, left to right. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = DIAL[k];
    const G = new Graph(stage, { x: 14, y: 24, width: 400, height: 420, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, xlabels: 2, ylabels: 2 });
    const PW = ex.W - 448;
    const P = panel(stage, 434, 14, PW, 440, '', 'u6l3-dialp');
    // the dial: a half-disc opening to the right; up = steepest rising, down = steepest falling
    const DW = 270, DH = 410, cx = 80, cy = DH / 2, R = 152;
    const row = h('div', 'u6l3-dialrow'); P.appendChild(row);
    const wrap = h('div', 'u6l3-dialwrap'); box(wrap, DW, DH); row.appendChild(wrap);
    const sv = svgEl('svg', { width: DW, height: DH, viewBox: `0 0 ${DW} ${DH}` }, wrap);
    const dh = h('div', 'bk-html'); wrap.appendChild(dh);
    const ptA = (a, r) => [cx + r * Math.cos(a * DEG), cy - r * Math.sin(a * DEG)];
    const arc = (a0, a1, r, col, w) => { const [x0, y0] = ptA(a0, r), [x1, y1] = ptA(a1, r); return svgEl('path', { d: `M${x0} ${y0} A${r} ${r} 0 0 ${a0 > a1 ? 1 : 0} ${x1} ${y1}`, fill: 'none', stroke: col, 'stroke-width': w }, sv); };
    svgEl('path', { d: `M${cx} ${cy - R} A${R} ${R} 0 0 1 ${cx} ${cy + R} Z`, fill: '#f6f5f1' }, sv);
    arc(89.5, 0.5, R, POS, 9); arc(-0.5, -89.5, R, NEG, 9);
    const dlab = (x, y, s, pos, cls) => { const e = h('div', 'bk-lab ' + cls, s); dh.appendChild(e); return place(e, x, y, pos, 3); };
    DIAL_TICKS.forEach(([a, b]) => [1, -1].forEach((sg) => {
      const ang = Math.atan(sg * a / b) / DEG, [x0, y0] = ptA(ang, R - 8), [x1, y1] = ptA(ang, R + 8), [lx, ly] = ptA(ang, R + 14);
      svgEl('line', { x1: x0, y1: y0, x2: x1, y2: y1, stroke: INK, 'stroke-width': 2 }, sv);
      dlab(lx, ly, T((sg < 0 ? '-' : '') + (b === 1 ? String(a) : `\\tfrac{${a}}{${b}}`)), 'e', 'u6l3-dtick');
    }));
    { const [x0, y0] = ptA(0, R - 8), [x1, y1] = ptA(0, R + 8); svgEl('line', { x1: x0, y1: y0, x2: x1, y2: y1, stroke: INK, 'stroke-width': 2 }, sv); dlab(cx + R + 14, cy, T('0'), 'e', 'u6l3-dtick'); }
    dlab(cx - 4, cy - R + 6, 'undefined', 'w', 'u6l3-dtick u6l3-und'); dlab(cx - 4, cy + R - 6, 'undefined', 'w', 'u6l3-dtick u6l3-und');
    dlab(cx + R * 0.42, cy - R * 0.5, 'positive', 'c', 'u6l3-dzone u6l3-pos'); dlab(cx + R * 0.42, cy + R * 0.5, 'negative', 'c', 'u6l3-dzone u6l3-neg');
    const needle = svgEl('line', { x1: cx, y1: cy, x2: cx + R - 14, y2: cy, stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round' }, sv);
    svgEl('circle', { cx, cy, r: 8, fill: INK }, sv);
    const ro = h('div', 'u6l3-dialro'); row.appendChild(ro);
    const roM = h('div', 'u6l3-dm'), roS = h('div', 'u6l3-ds'); ro.append(roM, roS);
    // the line through the origin at angle phi
    const st = { phi: 0 };
    const Lc = G.curve(() => {
      const ph = st.phi * DEG, dx = Math.cos(ph), dy = Math.sin(ph), k = 20;
      return { subs: [[G.toPx(-k * dx, -k * dy), G.toPx(k * dx, k * dy)]] };
    }, { color: SEG, width: 4.5 }, 'bk-line', G.layers.data);
    let Tr = null;
    const colOf = (m) => (m == null ? RISE : Math.abs(m) < 1e-9 ? SEG : m > 0 ? POS : NEG);
    const setPhi = (phi, exact) => {
      st.phi = phi; Lc._bkDraw();
      const nd = phi > 90.0001 ? phi - 180 : phi, [x2, y2] = ptA(nd, R - 14);
      needle.setAttribute('x2', x2); needle.setAttribute('y2', y2);
      const vert = Math.abs(phi - 90) < 1e-6, m = vert ? null : mOf(phi);
      const col = colOf(m); Lc.path.setAttribute('stroke', col); Lc.style.color = col;
      if (exact !== undefined) return;
      roM.innerHTML = vert ? `${T('m')} is <b class="u6l3-und">undefined</b>` : T(`m\\approx${texNum(Math.round(m * 100) / 100)}`);
      roS.innerHTML = vert ? 'vertical: run 0' : `steepness ${T(`|m|\\approx${texNum(Math.round(Math.abs(m) * 100) / 100)}`)}`;
    };
    const setExact = (s) => {
      if (!s) { roM.innerHTML = `${T('m')} is <b class="u6l3-und">undefined</b>`; roS.innerHTML = 'vertical: run = 0'; return; }
      const [a, b] = s, m = a / b, col = colOf(m);
      roM.innerHTML = T(`m=\\textcolor{${col}}{${fr(a, b, true)}}`);
      roS.innerHTML = Math.abs(m) < 1e-9 ? 'horizontal: rise = 0' : `${m > 0 ? '<b class="u6l3-pos">positive</b>' : '<b class="u6l3-neg">negative</b>'} · steepness ${T(`|m|=${fr(Math.abs(a), b)}`)}`;
    };
    const turn = (c, to, ms) => { const a = st.phi; return tween(c, ms, (t) => setPhi(a + (to - a) * t)); };
    const triFor = (s) => { if (Tr) { Tr.remove(); Tr = null; } if (!s || s[0] === 0) return; const [a, b] = s; Tr = new SlopeTri(G, { x: 0, y: 0, run: b, rise: a }, { fill: colOf(a / b) }); };
    setPhi(0); setExact([0, 1]);
    if (d.sweep) {
      return [
        { cap: `Turn the line from flat towards vertical. Watch ${T('m')}: slowly at first, then it <b>races</b> as the line gets steep.`,
          run: async (c) => { if (Tr) Tr.remove(); await turn(c, 88.9, 3600); } },
        { cap: `Straight up: run ${T('0')}. There is no number left: the slope is <b>undefined</b>.`, run: async (c) => { await turn(c, 90, 400); setPhi(90); } },
        { cap: `Keep turning: the line now <b>falls</b> left to right. ${T('m')} is a <b>huge negative</b> number, shrinking in size as the line flattens.`,
          run: async (c) => { await turn(c, 179.9, 3600); setPhi(180 - 1e-9); setExact([0, 1]); } },
        { cap: `Steepness grows towards vertical on <b>both</b> sides. The <b>sign</b> says up or down; the <b>size</b> ${T('|m|')} says how steep.`,
          run: async (c) => { setPhi(0); setExact([0, 1]); const b = h('div', 'u6l3-rulebox', 'sign → direction · size <span class="tex"></span>→ steepness'); b.innerHTML = `sign → direction<br>size ${T('|m|')} → steepness`; ro.appendChild(b); await pop(c, b); } }
      ];
    }
    const steps = [];
    d.stops.forEach((s, i) => {
      const neg = k === 'neg';
      let cap;
      if (!s) cap = `Vertical: run ${T('0')}, so the slope is <b>undefined</b>. ${neg ? 'From either side, the' : 'The'} closer to vertical, the bigger ${T('|m|')}.`;
      else if (s[0] === 0) cap = `Flat: rise ${T('0')}, ${T('m=0')}. The needle points straight across.`;
      else {
        const [a, b] = s, m = a / b, txt = fr(a, b);
        const extra = { 0.25: 'a gentle climb', 0.5: 'steeper', 1: `rise equals run`, 2: `rise ${T('2')} for every ${T('1')} across`, 5: 'very steep: the numbers grow fast near vertical' }[Math.abs(m)];
        const extraN = { 0.25: 'a gentle fall', 0.5: 'steeper', 1: `as steep as ${T('m=1')}`, 2: `just as steep as ${T('m=2')}`, 5: 'very steep: the size grows fast near vertical' }[Math.abs(m)];
        cap = neg ? `${T('m=' + txt)}: run ${T(cU(b))}, rise ${T(cR(a))}, so the line <b>falls</b>. Steepness ${T('|m|=' + fr(Math.abs(a), b))}: ${extraN}.` : `${T('m=' + txt)}: run ${T(cU(b))}, rise ${T(cR(a))}. ${extra[0].toUpperCase() + extra.slice(1)}.`;
      }
      steps.push({ cap, run: async (c) => {
        if (Tr) { Tr.remove(); Tr = null; }
        const to = s ? phiOf(s[0] / s[1]) : 90;
        if (i > 0) await turn(c, to, 1200);
        setPhi(to, true); setExact(s); if (s) { triFor(s); if (Tr) await Tr.drawIn(c, 300); }
        await pulse(c, roM, 1.08);
      } });
    });
    return steps;
  }
};

/* =============================== explainer 6: ordering by steepness =============================== */
const ORD = {
  ex5a: { label: 'Example 5(a) check', sl: [[-5, 1], [2, 1], [-1, 2], [1, 4]], max: 5, step: 1, pos: ['n', 'n', 'ne', 'nw'] },
  ex5b: { label: 'Example 5(b) check', sl: [[-3, 4], [2, 3]], max: 1, step: 0.25, pos: ['ne', 'nw'] },
  mirror: { label: T('3') + ' and ' + T('-3'), sl: [[3, 1], [-3, 1]], max: 4, step: 1, pos: ['ne', 'nw'] }
};
const OCOL = [COLORS.red, COLORS.green, COLORS.blue, COLORS.amber];
const order = {
  title: 'Compare steepness: ignore the sign',
  height: 470,
  choices: Object.keys(ORD).map((k) => ({ v: k, label: ORD[k].label })),
  intro: 'Lines through the origin, then their <b>sizes</b> on a steepness line. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = ORD[k];
    const G = new Graph(stage, { x: 14, y: 14, width: 420, height: 440, xmin: -5.5, xmax: 5.5, ymin: -5.8, ymax: 5.8, xlabels: 2, ylabels: 2 });
    const PW = ex.W - 468, P = panel(stage, 454, 14, PW, 440, 'Steepness = size');
    const sl = d.sl.map(([a, b], i) => ({ a, b, m: a / b, col: OCOL[i], tx: fr(a, b) }));
    const nlHost = h('div', 'u6l3-nlhost'); box(nlHost, PW - 28, 130); P.appendChild(nlHost);
    const NL = new NumberLine(nlHost, { width: PW - 28, height: 130, min: 0, max: d.max, step: d.step, arrows: false,
      labels: d.max === 1 ? [{ v: 0, html: T('0') }, { v: 0.5, html: T('\\tfrac12') }, { v: 1, html: T('1') }] : undefined, labelStep: d.max === 1 ? 0.5 : 1 });
    const list = h('div', 'u6l3-log'); P.appendChild(list);
    const steps = [
      { cap: `Lines through the origin with slopes ${sl.map((s) => T(s.tx)).join(', ')}.`,
        run: async (c) => {
          for (const s of sl) {
            const L = G.line({ m: s.m, b: 0 }, { color: s.col, width: 4 }); s.L = L; await G.drawIn(L, 500, c);
            const r = Math.min(4.3, 4.3 / Math.abs(s.m)), x = s.m > 0 ? r : -r;
            const steep = Math.abs(s.m) > 1, pos = steep ? (s.m > 0 ? 'ne' : 'nw') : (s.m > 0 ? 'nw' : 'ne');
            const lab = G.label(x, s.m * x, T('m=' + fr(s.a, s.b, true)), { pos, cls: 'bk-ptlab', color: s.col }); await fadeIn(c, lab);
          }
        } },
      { cap: `Drop the signs: ${sl.map((s) => T(`|${s.tx}|=${fr(Math.abs(s.a), s.b)}`)).join(', ')}. Put each size on the steepness line.`,
        run: async (c) => { for (const [i, s] of sl.entries()) { const p = NL.point(Math.abs(s.m), { color: s.col, label: T(fr(Math.abs(s.a), s.b, true)), pos: (d.pos || [])[i] || 'n' }); await pop(c, p); } } }
    ];
    const sorted = sl.slice().sort((a, b) => Math.abs(a.m) - Math.abs(b.m));
    if (k === 'ex5a') {
      steps.push({ cap: `Least steep to steepest: ${T(sorted.map((s) => s.tx).join(',\\ '))}.`,
        run: async (c) => { for (const [i, s] of sorted.entries()) { const r = line(list, `${i + 1}. ${T(`\\textcolor{${s.col}}{${fr(s.a, s.b, true)}}`)}`, 'u6l3-mline'); await show(c, r); s.L.path.setAttribute('stroke-width', 7); await sleep(c, 250); s.L.path.setAttribute('stroke-width', 4); } } });
      steps.push({ cap: `${T('-5')} is the <b>smallest number</b> but the <b>steepest line</b>: size, not sign, decides steepness.`,
        run: async (c) => { const s = stamp(P, 'steepest: −5', { ok: true }); s.classList.add('u6l3-stampb'); await stampIn(c, s); } });
    } else if (k === 'ex5b') {
      steps.push({ cap: `Compare ${T('\\tfrac34')} and ${T('\\tfrac23')}: ${T('\\tfrac34=\\tfrac{9}{12}')} and ${T('\\tfrac23=\\tfrac{8}{12}')} (or ${T('0.75')} and about ${T('0.67')}).`,
        run: async (c) => { await show(c, line(list, T('\\tfrac{9}{12}>\\tfrac{8}{12}'), 'u6l3-mline')); await show(c, line(list, T('0.75>0.67'), 'u6l3-mline')); } });
      steps.push({ cap: `So the line with slope ${T('-\\tfrac34')} is <b>steeper</b>. It falls, while the other rises.`,
        run: async (c) => { sl[0].L.path.setAttribute('stroke-width', 7); const s = stamp(P, 'steeper: −3/4', { ok: true }); s.classList.add('u6l3-stampb'); await stampIn(c, s); } });
    } else {
      steps.push({ cap: `Both sizes are ${T('3')}: the lines are <b>equally steep</b>, mirror images in the ${T('y')}-axis. One rises, one falls.`,
        run: async (c) => { await show(c, line(list, `${T('|3|=|-3|=3')}: same steepness`, 'u6l3-mline')); } });
    }
    return steps;
  }
};

/* =============================== explainer 7: roofline and pitch =============================== */
const RF = {
  six: { label: 'A “6 in 12” roof', peak: [4, 5], right: [8, 3], left: [0, 1], chimney: false },
  ex6: { label: 'Example 6 check', peak: [4, 6], right: [8, 1], left: [0, 2.5], chimney: true }
};
const roof = {
  title: 'Slope of a roofline, and its pitch',
  height: 440,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(RF).map((k) => ({ v: k, label: RF[k].label })),
  intro: 'A grid laid over a roof. Find two points you can read <b>exactly</b>. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = RF[k];
    const G = new Graph(stage, { x: 14, y: 14, width: 470, height: 400, xmin: 0, xmax: 9, ymin: 0, ymax: 7, arrows: false, xtitle: '', ytitle: '', origin: true });
    const P = panel(stage, 504, 14, ex.W - 518, 400, d.chimney ? 'Example 6' : 'Roof pitch');
    drawRoof(G, d);
    const run = d.right[0] - d.peak[0], rise = d.right[1] - d.peak[1], k12 = 12 / run, up12 = Math.abs(rise) * k12;
    let Tr = null;
    const steps = [
      { cap: `Two points on the right-hand roofline sit exactly on grid corners: the peak ${T(pairTex(...d.peak))} and the eave ${T(pairTex(...d.right))}.`,
        run: async (c) => { for (const [p, pos] of [[d.peak, 'n'], [d.right, 'ne']]) await G.reveal(G.point(p[0], p[1], { color: INK, r: 7, coords: true, pos }), c); } },
      { cap: `From the peak: run ${T(cU(run))} right, rise ${T(cR(rise))} (down ${Math.abs(rise)}).`,
        run: async (c) => { Tr = new SlopeTri(G, { x: d.peak[0], y: d.peak[1], run, rise }); await Tr.drawIn(c, 500); } },
      { cap: `${T('\\text{slope}=' + slopeTex(rise, run))}: negative, because the roofline <b>falls</b> from left to right.`,
        run: async (c) => { await show(c, line(P, T('\\text{slope}=' + slopeTex(rise, run)), 'u6l3-mline')); } }
    ];
    if (d.chimney) steps.push({ cap: `(b) Left side: the chimney covers part of the left roofline, so where that roofline ends can only be <b>guessed</b>, and the visible part crosses no grid corner except the peak. A grid slope needs two points you can read exactly: <b>no</b>.`,
      run: async (c) => { const q = G.label(0.7, 2.4, '?', { cls: 'u6l3-qmark' }); await pop(c, q); await show(c, line(P, '(b) hidden end: <b>not reliable</b>', 'u6l3-line u6l3-soft')); } });
    steps.push({ cap: `Pitch is a <b>positive</b> rise for every ${T('12')} of run. ${T(`\\tfrac{${Math.abs(rise)}}{${run}}=\\tfrac{${up12}}{12}`)}: multiply top and bottom by ${T(texNum(k12))}.`,
      run: async (c) => {
        const b = h('div', 'u6l3-scale', T(`\\dfrac{${Math.abs(rise)}}{${run}}\\ \\xrightarrow{\\ \\times ${texNum(k12)}\\ }\\ \\dfrac{${up12}}{12}`)); P.appendChild(b); await pop(c, b);
      } });
    steps.push({ cap: `The pitch is “<b>${up12} in 12</b>”${up12 > 12 ? ': it rises more than it runs, a steep roof' : ''}.`,
      run: async (c) => {
        const ic = pitchIcon(up12); P.appendChild(ic); await pop(c, ic);
      } });
    return steps;
  }
};
function pitchIcon(up) {
  const W = 230, H = 120, w = 150, hh = Math.min(100, up / 12 * w * 0.62);
  const d = h('div', 'u6l3-pitch'); box(d, W, H);
  const s = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, d);
  svgEl('path', { d: `M20 ${H - 14} h${w} v-${hh} Z`, fill: '#eef3fd', stroke: SEG, 'stroke-width': 3, 'stroke-linejoin': 'round' }, s);
  const lab = (x, y, t, pos) => { const e = h('div', 'bk-lab u6l3-pitchlab', t); d.appendChild(e); place(e, x, y, pos, 4); };
  lab(20 + w / 2, H - 14, '12', 's'); lab(20 + w, H - 14 - hh / 2, String(up), 'e');
  return d;
}

/* =============================== explainer 8: slope as a rate of change =============================== */
const RATE = {
  ex7a: { label: 'Example 7(a) check', g: { width: 420, height: 330, xmin: 0, xmax: 4.6, ymin: 0, ymax: 360, xstep: 1, ystep: 80, xtitle: '\\text{Time (h)}', ytitle: '\\text{Distance (km)}', origin: true },
    A: [0, 0], B: [3, 240], end: [4, 320], xu: 'h', yu: 'km', per: 'km/h', step: 1, mean: 'The car travels <b>80 km every hour</b>: the slope is its <b>speed</b>.' },
  ex7b: { label: 'Example 7(b) check', g: { width: 420, height: 330, xmin: 0, xmax: 10, ymin: 0, ymax: 135, xstep: 2, ystep: 30, xtitle: '\\text{Time (min)}', ytitle: '\\text{Volume (L)}', origin: true },
    A: [0, 120], B: [4, 60], end: [8, 0], xu: 'min', yu: 'L', per: 'L/min', step: 1, mean: 'The negative sign means the volume is <b>decreasing</b>: the tank loses <b>15 L every minute</b>.' },
  walk: { label: 'Walking to school', g: { width: 420, height: 330, xmin: 0, xmax: 6.5, ymin: 0, ymax: 400, xstep: 1, ystep: 100, xtitle: '\\text{Time (min)}', ytitle: '\\text{Distance (m)}', origin: true },
    A: [0, 0], B: [5, 300], end: [6, 360], xu: 'min', yu: 'm', per: 'm/min', step: 1, mean: 'She walks <b>60 m every minute</b>.' }
};
const rate = {
  title: 'Slope with units: a rate of change',
  height: 440,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(RATE).map((k) => ({ v: k, label: RATE[k].label })),
  intro: 'Real axes have units, so the rise and the run do too. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = RATE[k];
    const G = new Graph(stage, Object.assign({ x: 14, y: 14 }, d.g, { width: 480, height: 400 }));
    const P = panel(stage, 514, 14, ex.W - 528, 400, 'Rate of change');
    const run = d.B[0] - d.A[0], rise = d.B[1] - d.A[1], m = rise / run;
    const unit = (v, u) => `${n(v)} ${u}`;
    let Tr = null;
    const steps = [
      { cap: `Two points you can read exactly: ${T(pairTex(...d.A))} and ${T(pairTex(...d.B))}.`,
        run: async (c) => { await G.drawIn(G.segment(d.A, d.end, { color: SEG, width: 4.5 }), 700, c); for (const p of [d.A, d.B]) await G.reveal(G.point(p[0], p[1], { color: INK, r: 7, coords: !!(p[0] || p[1]), pos: p === d.A ? 'ne' : 'nw' }), c); } },
      { cap: `Run ${T(cU(texNum(run)))} ${d.xu}, rise ${T(cR(texNum(rise)))} ${d.yu}. The units come along.`,
        run: async (c) => { Tr = new SlopeTri(G, { x: d.A[0], y: d.A[1], run, rise }, { runSide: 'n', runText: (v) => `<b>run</b> ${unit(v, d.xu)}`, riseText: (v) => `<b>rise</b> ${unit(v, d.yu)}` }); await Tr.drawIn(c, 600); } },
      { cap: `${T(`\\text{slope}=\\dfrac{${cR(texNum(rise))}\\text{ ${d.yu}}}{${cU(texNum(run))}\\text{ ${d.xu}}}=${texNum(m)}\\text{ ${d.per}}`)}, read “${n(m)} ${d.yu} <b>per</b> ${d.xu === 'h' ? 'hour' : 'minute'}”.`,
        run: async (c) => { const b = h('div', 'u6l3-scale', T(`\\dfrac{${cR(texNum(rise))}\\text{ ${d.yu}}}{${cU(texNum(run))}\\text{ ${d.xu}}}=\\boldsymbol{${texNum(m)}\\text{ ${d.per}}}`)); P.appendChild(b); await pop(c, b); } },
      { cap: `Step by step: every ${T('1')} ${d.xu}, the graph ${m > 0 ? 'rises' : 'falls'} ${T(texNum(Math.abs(m)))} ${d.yu}. ${d.mean}`,
        run: async (c) => {
          Tr.ghost();
          const N = Math.round(run / d.step);
          for (let i = 0; i < N; i++) {
            const x = d.A[0] + i * d.step, y = d.A[1] + i * d.step * m;
            const s = new SlopeTri(G, { x, y, run: d.step, rise: d.step * m }, { labels: false, fillOp: 0.18, w: 4 }); await s.drawIn(c, 220);
            const l = G.label(x + d.step, y + d.step * m / 2, `${m > 0 ? '+' : '−'}${Math.abs(m)}`, { pos: 'e', cls: 'u6l3-bub u6l3-bub-rise', gap: 5 }); await pop(c, l, 220);
          }
          await show(c, line(P, d.mean, 'u6l3-line'));
        } }
    ];
    return steps;
  }
};

/* =============================== explainer 9: step off the rise and run =============================== */
const SO = {
  ex8a: { label: 'Example 8(a) check', start: [-3, -4], r: 3, u: 2, fwd: 3, back: 1, seg: [[-5, -7], [4, 6.5]], win: 7.5, three: [[-1, -1], [1, 2], [3, 5]] },
  neg: { label: 'Slope ' + T('-\\tfrac{2}{3}'), start: [-3, 4], r: -2, u: 3, fwd: 3, back: 1, seg: [[-6, 6], [7.5, -3]], win: 7.5 },
  whole: { label: 'Slope ' + T('2'), start: [-2, -3], r: 2, u: 1, fwd: 4, back: 1, seg: [[-3, -5], [2.75, 6.5]], win: 6.5 }
};
const stepOff = {
  title: 'From a slope back to points',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SO).map((k) => ({ v: k, label: SO[k].label })),
  intro: 'Start at the given point and step off the run and the rise, again and again. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = SO[k], wn = d.win;
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -wn, xmax: wn, ymin: -wn, ymax: wn, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'Stepping off the slope');
    const [x0, y0] = d.start, m = d.r / d.u;
    const ro = h('div', 'u6l3-frbox'); P.appendChild(ro);
    const leg = h('div', 'u6l3-leg', `each step: <b class="u6l3-c-run">run ${n(d.u)}</b> (right), <b class="u6l3-c-rise">rise ${n(d.r)}</b> (${d.r > 0 ? 'up' : 'down'})`); hide(leg); P.appendChild(leg);
    const log = h('div', 'u6l3-log'); P.appendChild(log);
    const how = d.u === 1 ? `${T(String(d.r))} is ${T(`\\tfrac{${d.r}}{1}`)}: run ${T(cU('1'))} right, rise ${T(cR(String(d.r)))} up`
      : `run ${T(cU(String(d.u)))} right, rise ${T(cR(String(d.r)))} ${d.r > 0 ? 'up' : 'down'}`;
    const steps = [{ cap: `Start at ${T(pairTex(x0, y0))}. Slope ${T(fr(d.r, d.u))} means ${how}.`,
      run: async (c) => { await G.reveal(G.point(x0, y0, { color: INK, r: 7.5, coords: true, pos: d.r > 0 ? 'se' : 'sw', labelCls: 'u6l3-ptl' }), c); ro.innerHTML = T(`m=${fr(d.r, d.u, true)}=${rawFr(d.r, d.u)}`); await pop(c, ro); await show(c, leg); } }];
    const pts = [];
    for (let i = 1; i <= d.fwd; i++) {
      const a = [x0 + (i - 1) * d.u, y0 + (i - 1) * d.r], b = [x0 + i * d.u, y0 + i * d.r];
      steps.push({ cap: `${i === 1 ? 'Step' : 'Again'}: run ${T(cU(String(d.u)))}, rise ${T(cR(String(d.r)))} → ${T(pairTex(b[0], b[1]))}.`,
        run: async (c) => {
          const s = new SlopeTri(G, { x: a[0], y: a[1], run: d.u, rise: d.r }, { labels: false, fillOp: 0.12, w: 4.5 }); await s.drawIn(c, 300);
          const p = G.point(b[0], b[1], { color: NEG, r: 7, coords: true, pos: d.r > 0 ? 'nw' : 'ne', labelCls: 'u6l3-ptl' }); pts.push(p); await G.reveal(p, c);
          await show(c, line(log, T(`${pairTex(a[0], a[1])}\\to${pairTex(b[0], b[1])}`), 'u6l3-mline'));
        } });
    }
    for (let i = 1; i <= d.back; i++) {
      const a = [x0 - (i - 1) * d.u, y0 - (i - 1) * d.r], b = [x0 - i * d.u, y0 - i * d.r];
      steps.push({ cap: `Step <b>backward</b> too: run ${T(cU(String(-d.u)))} (left), rise ${T(cR(String(-d.r)))} ${-d.r > 0 ? '(up)' : '(down)'}. ${T(rawFr(-d.r, -d.u) + '=' + fr(d.r, d.u))}, the same slope → ${T(pairTex(b[0], b[1]))}.`,
        run: async (c) => {
          const s = new SlopeTri(G, { x: a[0], y: a[1], run: -d.u, rise: -d.r }, { labels: false, fillOp: 0.12, w: 4.5 }); await s.drawIn(c, 300);
          const p = G.point(b[0], b[1], { color: NEG, r: 7, coords: true, pos: d.r > 0 ? 'se' : 'ne', labelCls: 'u6l3-ptl' }); await G.reveal(p, c);
          await show(c, line(log, `backward: ${T(`${pairTex(a[0], a[1])}\\to${pairTex(b[0], b[1])}`)}`, 'u6l3-mline'));
        } });
    }
    steps.push({ cap: k === 'ex8a' ? `Join them with a ruler and extend the segment past both axes. Three other integer points: ${d.three.map((p) => T(pairTex(...p))).join(', ')}.`
      : `Join them: every point is the same rise-over-run step from the last, so they all lie on <b>one line</b> with slope ${T(fr(d.r, d.u))}.`,
    run: async (c) => { await G.drawIn(G.segment(d.seg[0], d.seg[1], { color: SEG, width: 4 }), 900, c); } });
    return steps;
  }
};

/* =============================== explainer 10: a missing rise or run =============================== */
const MS = {
  ex8b: { label: 'Example 8(b) check', m: [-5, 6], r0: 5, u0: -6, rise: 20,
    g: { xmin: -27, xmax: 3, ymin: -3, ymax: 23, xstep: 6, ystep: 5 } },
  demo: { label: 'Slope ' + T('\\tfrac25') + ', rise ' + T('14'), m: [2, 5], r0: 2, u0: 5, rise: 14,
    g: { xmin: -3, xmax: 38, ymin: -2, ymax: 16, xstep: 5, ystep: 2 } },
  ramp: { label: 'The big one: ' + T('\\tfrac{1}{12}') + ', rise 60 cm', m: [1, 12], r0: 1, u0: 12, rise: 60, units: 'cm',
    g: { xmin: -4, xmax: 44, ymin: -0.6, ymax: 4.6, xstep: 12, ystep: 1 }, zoom: { xmin: -40, xmax: 790, ymin: -10, ymax: 75, xstep: 120, ystep: 10 } }
};
const missing = {
  title: 'Find the missing run',
  height: 450,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(MS).map((k) => ({ v: k, label: MS[k].label })),
  intro: 'The slope is a small triangle. The segment is that triangle copied over and over, like a staircase. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = MS[k], [ma, mb] = d.m, kk = d.rise / d.r0, run = kk * d.u0;
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 470, height: 420, xlabels: 0, ylabels: 0, origin: true }, d.g));
    const P = panel(stage, 504, 14, ex.W - 518, 420, 'Scale the slope');
    const eq = h('div', 'u6l3-eqs'); P.appendChild(eq);
    const u = d.units ? ` ${d.units}` : '', par = (v) => (v < 0 ? `(${v})` : String(v));
    let first = null;
    const steps = [
      { cap: `Slope ${T(fr(ma, mb))}${ma < 0 ? `: one part is negative. The rise ${T(String(d.rise))} is <b>up</b>, so write it as ${T(`\\tfrac{${d.r0}}{${d.u0}}`)}: up ${T(String(d.r0))}, left ${T(String(-d.u0))}` : `: rise ${T(String(d.r0))} for every run of ${T(String(d.u0))}`}.`,
        run: async (c) => {
          first = new SlopeTri(G, { x: 0, y: 0, run: d.u0, rise: d.r0 }, { fillOp: 0.2, runSide: 'n' }); await first.drawIn(c, 450);
          await show(c, line(eq, T(`m=\\dfrac{${cR(d.r0)}}{${cU(d.u0)}}`), 'u6l3-mline'));
        } },
      { cap: `The segment rises ${T(String(d.rise))}${u}. How many ${T(String(d.r0))}s make ${T(String(d.rise))}? ${T(`${d.rise}\\div${d.r0}=${kk}`)}, so it is ${T(String(kk))} copies of the small triangle.`,
        run: async (c) => {
          const N = kk > 8 ? 3 : kk;
          for (let i = 1; i < N; i++) { const s = new SlopeTri(G, { x: i * d.u0, y: i * d.r0, run: d.u0, rise: d.r0 }, { labels: false, fillOp: 0.2, w: 4 }); await s.drawIn(c, 160); }
          if (d.zoom) { first.ghost(); await G.setWindow(d.zoom, c, 1300); }
          await show(c, line(eq, T(`${d.rise}\\div${d.r0}=${kk}\\ \\text{copies}`), 'u6l3-mline'));
        } },
      { cap: `So the run is ${T(String(kk))} times as long too: ${T(`${kk}\\times${par(d.u0)}=${run}`)}${u}. The run is ${T('\\boldsymbol{' + run + '}')}${u}${d.units ? ` (${n(run / 100)} m)` : ''}.`,
        run: async (c) => {
          const B = new SlopeTri(G, { x: 0, y: 0, run, rise: d.rise }, { fillOp: 0.06, w: 5, runSide: 'n', runText: (v) => `<b>run</b> ${n(v)}${u}`, riseText: (v) => `<b>rise</b> ${n(v)}${u}` }); await B.drawIn(c, 700);
          await show(c, line(eq, T(`\\dfrac{${cR(d.r0)}}{${cU(d.u0)}}\\xrightarrow{\\ \\times${kk}\\ }\\dfrac{${cR(d.rise)}}{${cU(run)}}`), 'u6l3-mline'));
        } },
      { cap: `Check: ${T(`\\dfrac{${d.rise}}{${run}}=${fr(d.rise, run)}`)} ✓. Or in one line: ${T(`\\text{run}=\\text{rise}\\div\\text{slope}=${d.rise}\\div\\left(${fr(ma, mb)}\\right)=${run}`)}.`,
        run: async (c) => { await show(c, line(eq, T(`\\text{run}=${d.rise}\\div\\left(${fr(ma, mb)}\\right)=${run}`), 'u6l3-mline u6l3-soft')); const s = stamp(P, `run ${n(run)}`, { ok: true }); s.classList.add('u6l3-stampb'); await stampIn(c, s); } }
    ];
    return steps;
  }
};

/* =============================== mount =============================== */
mountRamps();
mountFigures();
export const explainers = mountExplainers({ count, slide, zeroCase, leftRight, dial, order, roof, rate, stepOff, missing });
export const _test = { CNT, SL, ZC, ORD, RF, RATE, SO, MS, red, fr };
