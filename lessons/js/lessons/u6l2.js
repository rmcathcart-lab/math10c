/* Math 10C · Unit 6 · Lesson 2 — The Distance and Midpoint Formulas (Extension/Foundation).
 * Warm-up Wi-Fi map, static figures (Section 1, Example 3 answer, Example 5 grids, Example 6), and the explainers:
 *   hidden (every segment hides a right triangle; count, Pythagoras, swing it flat to check), lift (the legs lifted into
 *   symbols → the distance formula; Example 1 checks), order (either point first: signs flip, squares agree),
 *   map (Example 2 on a city map grid), converse (squares on the sides; Example 3), collinear (straight through or a
 *   detour; Example 4), count (two walkers meet in the middle; Example 5), walker (half the run, half the rise;
 *   Example 6), average (each coordinate's average on its own number line; Example 7), backward (the midpoint is
 *   halfway, so go the same again; Example 8).
 * Colours: run amber, rise purple, segments blue, midpoints red. */
import {
  h, tex, add, box, Graph, NumberLine, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pairTex, texNum, svgEl, liveCtx, pulse, rightMark, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const RUN = COLORS.amber, RISE = COLORS.purple, SEG = COLORS.blue, MID = COLORS.red, INK = COLORS.ink, TEAL = COLORS.teal, GRN = COLORS.green;
const P2 = (x, y) => pairTex(x, y);
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u6l2-panel ' + cls, title ? `<div class="u6l2-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u6l2-line ' + cls, html); p.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const hide = (el) => { el.style.opacity = 0; return el; };
const sgn = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);

/** a graph with equal x and y scales that fits in maxW × maxH. o: { x, y, center, g (extra Graph options), pad } */
function sqGraph(host, win, maxW, maxH, o = {}) {
  const g = o.g || {}, numbers = g.numbers !== false;
  const pd = o.pad || [18, 18, numbers && win.ymin >= 0 ? 34 : 18, numbers && win.xmin >= 0 ? 42 : 18];
  const xr = win.xmax - win.xmin, yr = win.ymax - win.ymin;
  const u = Math.min((maxW - pd[1] - pd[3]) / xr, (maxH - pd[0] - pd[2]) / yr);
  const W = u * xr + pd[1] + pd[3], H = u * yr + pd[0] + pd[2];
  const opts = Object.assign({ width: W, height: H, pad: pd }, win, g);
  if (o.x != null) { opts.x = o.x + (o.center ? (maxW - W) / 2 : 0); opts.y = (o.y || 0) + (o.center ? (maxH - H) / 2 : 0); }
  return new Graph(host, opts);
}
/** the helper corner (x2, y1) and which sides of the triangle are "outside" */
const corner = (A, B) => [B[0], A[1]];
const outside = (A, B) => ({ run: B[1] >= A[1] ? 's' : 'n', rise: B[0] >= A[0] ? 'e' : 'w' });
const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];

/** draw the two dashed legs and the right-angle mark; returns { run, rise, rm, C } */
async function drawLegs(G, c, A, B, o = {}) {
  const C = corner(A, B);
  const run = G.segment(A, C, { color: RUN, width: 3.5, dash: true }), rise = G.segment(C, B, { color: RISE, width: 3.5, dash: true });
  const rm = rightMark(G.layers.top, G.toPx(...C), G.toPx(...A), G.toPx(...B), 14, { color: INK, width: 2 });
  rm.style.opacity = 0;
  await G.drawIn(run, o.ms || 600, c); await G.drawIn(rise, o.ms || 600, c);
  await appear(c, rm, 250);
  return { run, rise, rm, C };
}
/** a pill label on a leg (outside the triangle) */
function legLabel(G, A, B, which, html, o = {}) {
  const C = corner(A, B), out = outside(A, B), t = o.t ?? 0.5;
  const [p, q] = which === 'run' ? [A, C] : [C, B], at = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  return G.label(at[0], at[1], html, { pos: o.pos || (which === 'run' ? out.run : out.rise), cls: 'u6l2-legl ' + (which === 'run' ? 'u6l2-lrun' : 'u6l2-lrise'), gap: 6 });
}
/** count squares along a leg with little numbered bubbles, then remove them */
async function countLeg(G, c, from, to, ms = 110) {
  const dx = sgn(to[0] - from[0]), dy = sgn(to[1] - from[1]), n = Math.round(Math.abs(to[0] - from[0]) + Math.abs(to[1] - from[1]));
  const els = [];
  for (let i = 1; i <= n; i++) {
    const e = G.label(from[0] + dx * (i - 0.5), from[1] + dy * (i - 0.5), String(i), { cls: 'u6l2-tick' + (dx ? ' u6l2-tick-r' : ' u6l2-tick-u') });
    e.style.opacity = 0; els.push(e); await pop(c, e, ms * 1.6); await sleep(c, ms * 0.4);
  }
  await sleep(c, 450);
  G.remove(...els);
  return n;
}
/** a little hiker standing at a graph point */
function walkerFig(G, color = INK) {
  const g = svgEl('g', { class: 'u6l2-walker' }, G.layers.top), b = g.body = svgEl('g', { class: 'u6l2-wbody' }, g);
  svgEl('rect', { x: -10, y: -26, width: 7, height: 12, rx: 2.5, fill: RUN }, b);
  svgEl('path', { d: 'M0 -25 V-11 M0 -11 L-6 0 M0 -11 L6 0 M0 -21 L8 -15', stroke: color, 'stroke-width': 3.6, 'stroke-linecap': 'round', fill: 'none' }, b);
  svgEl('circle', { cx: 0, cy: -32, r: 6.5, fill: color }, b);
  g.at = [0, 0];
  g.place = (x, y) => { g.at = [x, y]; const [px, py] = G.toPx(x, y); g.setAttribute('transform', `translate(${px} ${py})`); };
  return g;
}
/** walk the hiker to a point, leaving an arrow trail */
async function walkTo(G, c, w, to, color, ms = 900) {
  const from = w.at.slice(), trail = G.segment(from, to, { color, width: 5, arrowB: true, cls: 'u6l2-trail' });
  await Promise.all([G.drawIn(trail, ms, c), tween(c, ms, (t) => w.place(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t))]);
  w.place(...to);
  return trail;
}
/** fly a copy of `from` (an element on the stage) into the slot `to`, then fill the slot */
async function fly(c, stage, from, to) {
  c.check();
  if (c.fast) { to.classList.add('u6l2-filled'); return; }
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const clone = h('div', 'u6l2-fly ' + [...from.classList].filter((x) => /u6l2-l(run|rise)/.test(x)).join(' '), from.innerHTML);
  stage.appendChild(clone);
  const ax = (a.left - sr.left) / k, ay = (a.top - sr.top) / k;
  clone.style.left = ax + 'px'; clone.style.top = ay + 'px';
  const dx = (b.left + b.width / 2 - sr.left) / k - clone.offsetWidth / 2 - ax, dy = (b.top + b.height / 2 - sr.top) / k - clone.offsetHeight / 2 - ay;
  try { await c.anim(clone, [{ transform: 'translate(0, 0) scale(1)' }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) scale(1.25)`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px) scale(1)` }], 900); }
  finally { clone.remove(); }
  to.classList.add('u6l2-filled');
  await pulse(c, to, 1.12);
}
/** a formula line with empty slots: parts are TeX strings or { slot: TeX } */
function slotLine(P, parts, cls = '') {
  const d = h('div', 'u6l2-line u6l2-fline ' + cls), slots = [];
  parts.forEach((p) => { if (typeof p === 'string') d.insertAdjacentHTML('beforeend', T(p)); else { const s = h('span', 'u6l2-slot ' + (slots.length ? 'u6l2-srise' : 'u6l2-srun'), T(p.slot)); d.appendChild(s); slots.push(s); } });
  P.appendChild(d); return { el: d, slots };
}
const square = (G, pts, color, o = {}) => G.polyline(pts, { closed: true, fill: color, fillOpacity: o.op ?? 0.16, color, width: 2.5 });

/* =============================== warm-up: Wi-Fi =============================== */
const HOUSES = [{ n: 'A', p: [-4, 0], col: '#e8a01e', pos: 'w' }, { n: 'B', p: [3, 4], col: '#d9604f', pos: 'e' }, { n: 'C', p: [-4, 4], col: '#3d8fd6', pos: 'w' },
  { n: 'D', p: [-3, -4], col: '#9a6fd1', pos: 'e' }, { n: 'E', p: [5, -3], col: '#5c9a5e', pos: 'e' }];
function house(G, x, y, color) {
  const [px, py] = G.toPx(x, y), g = svgEl('g', { class: 'u6l2-house' }, G.layers.top);
  svgEl('rect', { x: px - 12, y: py - 20, width: 24, height: 15, fill: color, stroke: INK, 'stroke-width': 1.6 }, g);
  svgEl('path', { d: `M${px - 16} ${py - 19} L${px} ${py - 33} L${px + 16} ${py - 19} Z`, fill: color, stroke: INK, 'stroke-width': 1.6, 'fill-opacity': 0.75 }, g);
  svgEl('rect', { x: px - 3, y: py - 13, width: 6, height: 8, fill: '#fff', stroke: INK, 'stroke-width': 1 }, g);
  svgEl('circle', { cx: px, cy: py, r: 5, fill: INK, stroke: '#fff', 'stroke-width': 1.6 }, g);
  return g;
}
function router(G, x, y) {
  const [px, py] = G.toPx(x, y), g = svgEl('g', { class: 'u6l2-router' }, G.layers.top);
  svgEl('circle', { cx: px, cy: py, r: 17, fill: '#fff', stroke: INK, 'stroke-width': 2 }, g);
  for (const r of [5, 9, 13]) svgEl('path', { d: `M${px - r * 0.62} ${py + 3 - r * 0.78} A${r} ${r} 0 0 1 ${px + r * 0.62} ${py + 3 - r * 0.78}`, fill: 'none', stroke: MID, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
  svgEl('rect', { x: px - 7, y: py + 3, width: 14, height: 6, rx: 2, fill: INK }, g);
  return g;
}
const circlePath = (G, r) => G.curve(() => ({ subs: [Array.from({ length: 121 }, (_, i) => G.toPx(r * Math.cos(i * Math.PI / 60), r * Math.sin(i * Math.PI / 60)))], closed: true }), { color: TEAL, width: 3, dash: '10 7', fill: TEAL, fillOpacity: 0.07 }, 'u6l2-edge', G.layers.data);
function mountWifi() {
  const host = document.getElementById('u6l2-wifi'); if (!host) return;
  const G = sqGraph(host, { xmin: -8, xmax: 8, ymin: -6, ymax: 6 }, 560, 440, { g: { xlabels: 2, ylabels: 2 } });
  const [x0, y0] = G.toPx(-8, 6), [x1, y1] = G.toPx(8, -6);
  svgEl('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: '#eef7e6' }, G.layers.bg);
  HOUSES.forEach((d) => { house(G, d.p[0], d.p[1], d.col); G.label(d.p[0], d.p[1], `<b>${d.n}</b>`, { pos: d.pos, cls: 'u6l2-hlab', gap: 17, dy: -12 }); });
  router(G, 0, 0);
  const live = { c: null, e: null, p: null };
  const ctx = liveCtx();
  document.getElementById('u6l2-wc').addEventListener('click', async () => {
    if (live.c) { G.remove(...live.c); live.c = null; return; }
    const A = [0, 0], B = [-4, 4], C = corner(A, B);
    const run = G.segment(A, C, { color: RUN, width: 4, dash: true }), rise = G.segment(C, B, { color: RISE, width: 4, dash: true });
    const hyp = G.segment(A, B, { color: MID, width: 4.5 });
    const l1 = G.label(-2, 0, T('4'), { pos: 's', cls: 'u6l2-legl u6l2-lrun', gap: 6 }), l2 = G.label(-4, 2, T('4'), { pos: 'w', cls: 'u6l2-legl u6l2-lrise', gap: 22 });
    const l3 = G.label(-2, 2, T('\\sqrt{4^2+4^2}=\\sqrt{32}\\approx5.66'), { pos: 'ne', cls: 'u6l2-legl u6l2-lhyp', gap: 4 });
    live.c = [run, rise, hyp, l1, l2, l3];
    [l1, l2, l3].forEach(hide);
    await G.drawIn(run, 500, ctx); await appear(ctx, l1); await G.drawIn(rise, 500, ctx); await appear(ctx, l2); await G.drawIn(hyp, 600, ctx); await pop(ctx, l3);
  });
  document.getElementById('u6l2-wedge').addEventListener('click', async () => {
    if (live.e) { G.remove(...live.e); live.e = null; return; }
    const ci = circlePath(G, 5), lab = G.label(3.54, -3.54, '5 units', { pos: 'se', cls: 'u6l2-edgelab', gap: 4 });
    live.e = [ci, lab]; hide(lab);
    await G.drawIn(ci, 1100, ctx); await appear(ctx, lab);
  });
  document.getElementById('u6l2-w12').addEventListener('click', async () => {
    if (live.p) { G.remove(...live.p); live.p = null; return; }
    const pts = [[5, 0], [4, 3], [3, 4], [0, 5], [-3, 4], [-4, 3], [-5, 0], [-4, -3], [-3, -4], [0, -5], [3, -4], [4, -3]];
    live.p = pts.map((p) => G.point(p[0], p[1], { color: GRN, r: 7.5, cls: 'u6l2-edgept' }));
    live.p.forEach(hide);
    for (const p of live.p) { await pop(ctx, p, 260); await sleep(ctx, 60); }
  });
}

/* =============================== static figures =============================== */
function mountStatics() {
  let host = document.getElementById('u6l2-s1fig');
  if (host) {
    const G = sqGraph(host, { xmin: -6, xmax: 9.5, ymin: -4, ymax: 5 }, 470, 330, { g: { xlabels: 2, ylabels: 2 } });
    const A = [-4, -2], B = [8, 3], C = corner(A, B);
    G.segment(A, C, { color: RUN, width: 3.5, dash: true }); G.segment(C, B, { color: RISE, width: 3.5, dash: true });
    rightMark(G.layers.top, G.toPx(...C), G.toPx(...A), G.toPx(...B), 13, { color: INK, width: 2 });
    G.segment(A, B, { color: SEG, width: 5 });
    legLabel(G, A, B, 'run', T('12')); legLabel(G, A, B, 'rise', T('5'));
    G.point(...A, { color: SEG, label: T('A(-4,\\ -2)'), pos: 'nw' }); G.point(...B, { color: SEG, label: T('B(8,\\ 3)'), pos: 'nw' });
    G.point(...C, { color: INK, label: T('C(8,\\ -2)'), pos: 'sw' });
  }
  host = document.getElementById('u6l2-ex3fig');
  if (host) {
    const G = sqGraph(host, { xmin: -4.5, xmax: 4.5, ymin: 0, ymax: 13 }, 280, 430, { g: { xlabels: 2, ylabels: 2 } });
    G.polyline([[1, 1], [-3, 4], [3, 12]], { closed: true, color: MID, width: 4 });
    G.point(1, 1, { color: MID, label: T('L(1,\\ 1)'), pos: 'e' }); G.point(-3, 4, { color: MID, label: T('M(-3,\\ 4)'), pos: 'n' }); G.point(3, 12, { color: MID, label: T('N(3,\\ 12)'), pos: 'w' });
    rightMark(G.layers.top, G.toPx(-3, 4), G.toPx(1, 1), G.toPx(3, 12), 12, { color: MID, width: 2 });
  }
  const grid5 = (id) => sqGraph(document.getElementById(id), { xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5 }, 330, 330, { g: { xlabels: 2, ylabels: 2 } });
  if (document.getElementById('u6l2-ex5a')) {
    let G = grid5('u6l2-ex5a'); G.segment([-5, 3], [3, 3], { color: INK, width: 4.5 }); G.point(-5, 3, { color: INK, label: T('A'), pos: 'n' }); G.point(3, 3, { color: INK, label: T('B'), pos: 'n' });
    G = grid5('u6l2-ex5b'); G.segment([2, 5], [2, -3], { color: INK, width: 4.5 }); G.point(2, 5, { color: INK, label: T('C'), pos: 'e' }); G.point(2, -3, { color: INK, label: T('D'), pos: 'e' });
    G = grid5('u6l2-ex5aA'); G.segment([-5, 3], [3, 3], { color: INK, width: 4.5 }); G.point(-5, 3, { color: INK, label: T('A'), pos: 'w' }); G.point(3, 3, { color: INK, label: T('B'), pos: 'e' });
    G.segment([-5, 4.2], [-1, 4.2], { color: MID, width: 2.5, arrowA: true, arrowB: true }); G.segment([-1, 4.2], [3, 4.2], { color: MID, width: 2.5, arrowA: true, arrowB: true });
    G.label(-3, 4.2, T('4'), { pos: 'n', color: MID, gap: 2 }); G.label(1, 4.2, T('4'), { pos: 'n', color: MID, gap: 2 });
    G.point(-1, 3, { color: MID, label: T('M(-1,\\ 3)'), pos: 's' });
    G = grid5('u6l2-ex5bA'); G.segment([2, 5], [2, -3], { color: INK, width: 4.5 }); G.point(2, 5, { color: INK, label: T('C'), pos: 'w' }); G.point(2, -3, { color: INK, label: T('D'), pos: 'w' });
    G.segment([3.2, 5], [3.2, 1], { color: MID, width: 2.5, arrowA: true, arrowB: true }); G.segment([3.2, 1], [3.2, -3], { color: MID, width: 2.5, arrowA: true, arrowB: true });
    G.label(3.2, 3, T('4'), { pos: 'e', color: MID, gap: 4 }); G.label(3.2, -1, T('4'), { pos: 'e', color: MID, gap: 4 });
    G.point(2, 1, { color: MID, label: T('M(2,\\ 1)'), pos: 'w' });
  }
  host = document.getElementById('u6l2-ex6fig');
  if (host) {
    const G = sqGraph(host, { xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5 }, 340, 340, { g: { xlabels: 2, ylabels: 2 } });
    G.segment([-2, -3], [4, 5], { color: INK, width: 4.5 });
    G.point(4, 5, { color: INK, label: T('E'), pos: 'n' }); G.point(-2, -3, { color: INK, label: T('F'), pos: 's' });
  }
}

/* =============================== explainer: every segment hides a right triangle =============================== */
const HID = {
  s1: { label: `Section 1: ${T('A')} to ${T('B')}`, A: [-4, -2], B: [8, 3], nA: 'A', nB: 'B', nC: 'C', win: { xmin: -6, xmax: 10, ymin: -4, ymax: 6 },
    run: 'AC=8-(-4)=12', rise: 'CB=3-(-2)=5', sq: ['AB^2=12^2+5^2', '=144+25=169'], res: 'AB=\\sqrt{169}=13', len: 13, lenTex: '13',
    capEnd: `Swing ${T('AB')} down flat around ${T('A')}: it reaches exactly <b>13</b> squares, 1 past the corner. The hypotenuse is the longest side.`, stamp: '13 units ✓' },
  warm: { label: 'Warm-up: house C', A: [0, 0], B: [-4, 4], nA: 'O', nB: 'C', nC: '', posA: 'se', win: { xmin: -7, xmax: 2, ymin: -2, ymax: 6 },
    run: '\\text{run}=4', rise: '\\text{rise}=4', sq: ['OC^2=4^2+4^2', '=16+16=32'], res: 'OC=\\sqrt{32}\\approx5.66', len: Math.sqrt(32), lenTex: '\\approx5.66', edge: 5,
    capEnd: `Swing ${T('OC')} down flat around the router: it reaches about <b>5.66</b> squares, past the 5-unit edge. No Wi-Fi for house C.`, stamp: 'no Wi-Fi', ok: false },
  bridge: { label: `${T('(2,\\ 1)')} to ${T('(7,\\ 13)')}`, A: [2, 1], B: [7, 13], nA: 'P', nB: 'Q', nC: 'C', win: { xmin: 0, xmax: 16, ymin: 0, ymax: 14 },
    run: 'PC=7-2=5', rise: 'CQ=13-1=12', sq: ['PQ^2=5^2+12^2', '=25+144=169'], res: 'PQ=\\sqrt{169}=13', len: 13, lenTex: '13',
    capEnd: `Swing ${T('PQ')} down flat around ${T('P')}: it reaches exactly <b>13</b> squares. The hypotenuse is longer than either leg.`, stamp: '13 units ✓' }
};
const hidden = {
  title: 'Every segment hides a right triangle',
  height: 470,
  choices: Object.keys(HID).map((k) => ({ v: k, label: HID[k].label })),
  intro: 'A slanted segment can’t be measured by counting along it. Watch the right triangle grow out of it. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = HID[k], A = d.A, B = d.B, C = corner(A, B), H = ex.def.height;
    const G = sqGraph(stage, d.win, 560, H - 20, { x: 10, y: 10, center: true });
    const P = panel(stage, 590, 14, ex.W - 604, H - 28, 'Pythagoras');
    const AB = T(d.nA + d.nB), up = B[1] > A[1], right = B[0] > A[0];
    const plab = (n, p) => T((n || '') + P2(p[0], p[1]));
    return [
      { cap: `Segment ${AB} is slanted: it doesn’t run along the grid lines, so we can’t just count squares along it.`,
        run: async (c) => {
          const s = G.segment(A, B, { color: SEG, width: 5 }); await G.drawIn(s, 700, c);
          await G.reveal(G.point(...A, { color: SEG, label: plab(d.nA, A), pos: d.posA || (up ? 's' : 'n') }), c);
          await G.reveal(G.point(...B, { color: SEG, label: plab(d.nB, B), pos: up ? 'n' : 's' }), c);
        } },
      { cap: `Add a third point straight ${up ? 'below' : 'above'} ${T(d.nB)} and straight across from ${T(d.nA)}: ${plab(d.nC, C)}. Now ${AB} is the <b>hypotenuse</b> of a right triangle.`,
        run: async (c) => { await drawLegs(G, c, A, B); await G.reveal(G.point(...C, { color: INK, label: plab(d.nC, C), pos: up ? 's' : 'n' }), c); } },
      { cap: `Count the <b>run</b> (across): <b>${Math.abs(B[0] - A[0])}</b> squares. Subtracting the ${T('x')}-coordinates says the same.`,
        run: async (c) => { await countLeg(G, c, A, C); const l = legLabel(G, A, B, 'run', T(String(Math.abs(B[0] - A[0])))); await pop(c, l); await show(c, line(P, T(d.run), 'u6l2-trun')); } },
      { cap: `Count the <b>rise</b> (up): <b>${Math.abs(B[1] - A[1])}</b> squares.`,
        run: async (c) => { await countLeg(G, c, C, B); const l = legLabel(G, A, B, 'rise', T(String(Math.abs(B[1] - A[1])))); await pop(c, l); await show(c, line(P, T(d.rise), 'u6l2-trise')); } },
      { cap: `Pythagoras: hypotenuse² = run² + rise². ${T(d.sq[0] + d.sq[1].slice(0))}.`,
        run: async (c) => { for (const s of d.sq) await show(c, line(P, T(s))); } },
      { cap: `Take the square root: ${T(d.res)}.`,
        run: async (c) => { const r = line(P, T(d.res), 'u6l2-big'); await pop(c, r); } },
      { cap: d.capEnd,
        run: async (c) => {
          const L = d.len, th0 = Math.atan2(B[1] - A[1], B[0] - A[0]), th1 = right ? 0 : Math.PI, [ax, ay] = G.toPx(...A), rpx = L * G.ux;
          const ln = svgEl('line', { stroke: SEG, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-opacity': 0.55 }, G.layers.top);
          const arc = svgEl('path', { fill: 'none', stroke: SEG, 'stroke-width': 2, 'stroke-dasharray': '6 6', 'stroke-opacity': 0.7 }, G.layers.top);
          const set = (th) => {
            const ex2 = ax + rpx * Math.cos(th), ey = ay - rpx * Math.sin(th), sx = ax + rpx * Math.cos(th0), sy = ay - rpx * Math.sin(th0);
            ln.setAttribute('x1', ax); ln.setAttribute('y1', ay); ln.setAttribute('x2', ex2); ln.setAttribute('y2', ey);
            arc.setAttribute('d', `M${sx} ${sy} A${rpx} ${rpx} 0 0 ${th < th0 ? 1 : 0} ${ex2} ${ey}`);
          };
          await tween(c, 1500, (t) => set(th0 + (th1 - th0) * t));
          const ex2 = A[0] + (right ? L : -L);
          for (let i = 1; i <= Math.floor(L); i++) { const [px] = G.toPx(A[0] + (right ? i : -i), A[1]); svgEl('line', { x1: px, x2: px, y1: ay - 9, y2: ay + 9, stroke: SEG, 'stroke-width': 2 }, G.layers.top); }
          if (d.edge) { const e = G.point(A[0] + (right ? d.edge : -d.edge), A[1], { color: MID, r: 6, label: '<b>edge</b>', pos: 'n', labelColor: MID }); await G.reveal(e, c); }
          const end = G.label(ex2, A[1], T(d.lenTex), { pos: right ? 'ne' : 'nw', cls: 'u6l2-legl u6l2-lhyp', gap: 6 }); await pop(c, end);
          const s = stamp(P, d.stamp, { ok: d.ok ?? true }); s.style.alignSelf = 'center'; s.style.marginTop = '10px'; await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== explainer: lifting the triangle into symbols =============================== */
const LIFT = {
  sym: { label: 'Any two points', sym: true, A: [2, 2], B: [9, 7], win: { xmin: 0, xmax: 10.5, ymin: 0, ymax: 8.5 } },
  ex1a: { label: 'Example 1(a) check', A: [3, -4], B: [9, 4], nA: 'P', nB: 'Q', win: { xmin: -1, xmax: 12, ymin: -6, ymax: 6 },
    run: ['x_2-x_1=9-3=6', '6'], rise: ['y_2-y_1=4-(-4)=8', '8'], slots: ['PQ^2=', '6^2', '8^2'], after: ['PQ=\\sqrt{36+64}', '=\\sqrt{100}=10'], stamp: 'PQ = 10', riseT: 0.75 },
  ex1b: { label: 'Example 1(b) check', A: [-15, 6], B: [-9, -6], nA: 'G', nB: 'H', win: { xmin: -17, xmax: 1, ymin: -8, ymax: 8 },
    run: ['x_2-x_1=-9-(-15)=6', '6'], rise: ['y_2-y_1=-6-6=-12', '-12'], slots: ['GH^2=', '6^2', '(-12)^2'], after: ['GH=\\sqrt{36+144}=\\sqrt{180}', '=\\sqrt{36\\times5}=6\\sqrt5'], stamp: 'GH = 6√5', down: true, riseT: 0.25 }
};
const lift = {
  title: 'The distance formula: lift the triangle into symbols',
  height: 470,
  choices: Object.keys(LIFT).map((k) => ({ v: k, label: LIFT[k].label })),
  intro: (k) => (LIFT[k].sym ? 'The same right triangle, but for <b>any</b> two points. Press <b>Next</b>.' : 'Check the example: the triangle, then the formula. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = LIFT[k], A = d.A, B = d.B, C = corner(A, B), H = ex.def.height;
    const G = sqGraph(stage, d.win, 470, H - 20, d.sym ? { x: 10, y: 10, center: true, g: { numbers: false }, pad: [18, 18, 46, 54] } : { x: 10, y: 10, center: true });
    const PW = ex.W - G.W - 44, P = panel(stage, G.W + 30, 14, PW, H - 28, 'Pythagoras on the triangle');
    const legs = {};
    if (d.sym) {
      const pl = (n, i) => T(`${n}(x_${i},\\ y_${i})`);
      return [
        { cap: `Any two points: ${T('P(x_1,\\ y_1)')} and ${T('Q(x_2,\\ y_2)')}. How far apart are they?`,
          run: async (c) => { const s = G.segment(A, B, { color: SEG, width: 5 }); await G.drawIn(s, 700, c); await G.reveal(G.point(...A, { color: SEG, label: pl('P', 1), pos: 'nw' }), c); await G.reveal(G.point(...B, { color: SEG, label: pl('Q', 2), pos: 'nw' }), c); } },
        { cap: `The corner is straight below ${T('Q')} (same ${T('x')} as ${T('Q')}) and straight across from ${T('P')} (same ${T('y')} as ${T('P')}): ${T('(x_2,\\ y_1)')}.`,
          run: async (c) => { await drawLegs(G, c, A, B); await G.reveal(G.point(...C, { color: INK, label: T('(x_2,\\ y_1)'), pos: 'se' }), c); } },
        { cap: `<b>Run:</b> drop down to the ${T('x')}-axis. From ${T('x_1')} across to ${T('x_2')} is ${T('x_2-x_1')}.`,
          run: async (c) => {
            const g1 = G.segment(A, [A[0], 0], { color: 'gray', width: 2, dash: '5 5' }), g2 = G.segment(B, [B[0], 0], { color: 'gray', width: 2, dash: '5 5' });
            await Promise.all([G.drawIn(g1, 500, c), G.drawIn(g2, 500, c)]);
            const t1 = G.label(A[0], 0, T('x_1'), { pos: 's', cls: 'u6l2-axl', gap: 6 }), t2 = G.label(B[0], 0, T('x_2'), { pos: 's', cls: 'u6l2-axl', gap: 6 });
            await Promise.all([pop(c, t1), pop(c, t2)]);
            await G.drawIn(G.segment([A[0], 0], [B[0], 0], { color: RUN, width: 8, opacity: 0.6, cap: 'butt' }), 600, c);
            legs.run = legLabel(G, A, B, 'run', T('x_2-x_1')); await pop(c, legs.run);
          } },
        { cap: `<b>Rise:</b> across to the ${T('y')}-axis. From ${T('y_1')} up to ${T('y_2')} is ${T('y_2-y_1')}.`,
          run: async (c) => {
            const g1 = G.segment(A, [0, A[1]], { color: 'gray', width: 2, dash: '5 5' }), g2 = G.segment(B, [0, B[1]], { color: 'gray', width: 2, dash: '5 5' });
            await Promise.all([G.drawIn(g1, 500, c), G.drawIn(g2, 500, c)]);
            const t1 = G.label(0, A[1], T('y_1'), { pos: 'w', cls: 'u6l2-axl', gap: 8 }), t2 = G.label(0, B[1], T('y_2'), { pos: 'w', cls: 'u6l2-axl', gap: 8 });
            await Promise.all([pop(c, t1), pop(c, t2)]);
            await G.drawIn(G.segment([0, A[1]], [0, B[1]], { color: RISE, width: 8, opacity: 0.6, cap: 'butt' }), 600, c);
            legs.rise = legLabel(G, A, B, 'rise', T('y_2-y_1')); await pop(c, legs.rise);
          } },
        { cap: `Pythagoras: ${T('d^2=\\text{run}^2+\\text{rise}^2')}. Lift the two legs off the grid and into the equation.`,
          run: async (c) => {
            await show(c, line(P, T('c^2=a^2+b^2'), 'u6l2-mute'));
            const L = slotLine(P, ['d^2=', { slot: '(x_2-x_1)^2' }, '+', { slot: '(y_2-y_1)^2' }]);
            await show(c, L.el);
            await fly(c, stage, legs.run, L.slots[0]); await fly(c, stage, legs.rise, L.slots[1]);
          } },
        { cap: `Take the square root of both sides: that is the <b>distance formula</b>. Run squared, plus rise squared, square-rooted.`,
          run: async (c) => { const f = line(P, T('d=\\sqrt{(\\textcolor{#c27a0e}{x_2-x_1})^2+(\\textcolor{#7b4fc4}{y_2-y_1})^2}'), 'u6l2-boxed'); await pop(c, f, 500); } }
      ];
    }
    const nm = (n, p) => T(n + P2(p[0], p[1]));
    return [
      { cap: `${nm(d.nA, A)} and ${nm(d.nB, B)}. Call ${T(d.nA)} point 1 and ${T(d.nB)} point 2.`,
        run: async (c) => { const s = G.segment(A, B, { color: SEG, width: 5 }); await G.drawIn(s, 700, c); await G.reveal(G.point(...A, { color: SEG, label: nm(d.nA, A), pos: 's' }), c); await G.reveal(G.point(...B, { color: SEG, label: nm(d.nB, B), pos: B[1] > A[1] ? 'n' : 's' }), c); } },
      { cap: `The corner: ${T('(x_2,\\ y_1)=' + P2(C[0], C[1]))}, ${B[1] > A[1] ? 'below' : 'above'} ${T(d.nB)} and across from ${T(d.nA)}.`,
        run: async (c) => { await drawLegs(G, c, A, B); await G.reveal(G.point(...C, { color: INK, label: T(P2(C[0], C[1])), pos: B[1] > A[1] ? 's' : 'n' }), c); } },
      { cap: `<b>Run:</b> ${T(d.run[0])}.`,
        run: async (c) => { legs.run = legLabel(G, A, B, 'run', T(d.run[1])); await pop(c, legs.run); await show(c, line(P, T(d.run[0]), 'u6l2-trun')); } },
      { cap: `<b>Rise:</b> ${T(d.rise[0])}${d.down ? ' (12 down)' : ''}.`,
        run: async (c) => { legs.rise = legLabel(G, A, B, 'rise', T(d.rise[1]), { t: d.riseT }); await pop(c, legs.rise); await show(c, line(P, T(d.rise[0]), 'u6l2-trise')); } },
      { cap: `Lift the legs into Pythagoras: ${T(d.slots[0] + d.slots[1] + '+' + d.slots[2])}.`,
        run: async (c) => { const L = slotLine(P, [d.slots[0], { slot: d.slots[1] }, '+', { slot: d.slots[2] }]); await show(c, L.el); await fly(c, stage, legs.run, L.slots[0]); await fly(c, stage, legs.rise, L.slots[1]); } },
      { cap: `${T(d.after.join(''))}.`,
        run: async (c) => { for (const s of d.after) await show(c, line(P, T(s))); const s = stamp(P, d.stamp); s.style.alignSelf = 'center'; s.style.marginTop = '8px'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: either point first =============================== */
const ORD = {
  s1: { label: `Section 1: ${T('A')} and ${T('B')}`, A: [-4, -2], B: [8, 3], nA: 'A', nB: 'B', win: { xmin: -6, xmax: 10, ymin: -4, ymax: 6 },
    f1: ['8-(-4)=12', '3-(-2)=5'], f2: ['-4-8=-12', '-2-3=-5'], sq: ['12^2=144', '5^2=25', '(-12)^2=144', '(-5)^2=25'], d: '\\sqrt{144+25}=\\sqrt{169}=13',
    w1: '12 right, 5 up', w2: '12 left, 5 down' },
  ex1b: { label: `Example 1(b): ${T('G')} and ${T('H')}`, A: [-15, 6], B: [-9, -6], nA: 'G', nB: 'H', win: { xmin: -17, xmax: 1, ymin: -8, ymax: 8 },
    f1: ['-9-(-15)=6', '-6-6=-12'], f2: ['-15-(-9)=-6', '6-(-6)=12'], sq: ['6^2=36', '(-12)^2=144', '(-6)^2=36', '12^2=144'], d: '\\sqrt{36+144}=\\sqrt{180}=6\\sqrt5',
    w1: '6 right, 12 down', w2: '6 left, 12 up' }
};
const order = {
  title: 'Which point goes first? It doesn’t matter',
  height: 470,
  choices: Object.keys(ORD).map((k) => ({ v: k, label: ORD[k].label })),
  intro: 'Subtract one way, then the other way. Watch the signs, then watch them disappear. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = ORD[k], A = d.A, B = d.B, C = corner(A, B), H = ex.def.height;
    const G = sqGraph(stage, d.win, 470, H - 20, { x: 10, y: 10, center: true });
    const P = panel(stage, G.W + 30, 14, ex.W - G.W - 44, H - 28, '');
    const tb = h('div', 'u6l2-otab'); P.appendChild(tb);
    const cell = (html, cls = '') => { const e = h('div', 'u6l2-oc ' + cls, html); tb.appendChild(e); return e; };
    cell(''); const h1 = cell(`${T(d.nA)} first`, 'u6l2-oh u6l2-oh1'), h2 = cell(`${T(d.nB)} first`, 'u6l2-oh u6l2-oh2');
    cell(`<b class="u6l2-crun">run</b><br>${T('x_2-x_1')}`, 'u6l2-or'); const r1 = cell(T(d.f1[0])), r2 = cell(T(d.f2[0]));
    cell(`<b class="u6l2-crise">rise</b><br>${T('y_2-y_1')}`, 'u6l2-or'); const s1 = cell(T(d.f1[1])), s2 = cell(T(d.f2[1]));
    cell('<b>squared</b>', 'u6l2-or'); const q1 = cell(T(d.sq[0]) + '<br>' + T(d.sq[1])), q2 = cell(T(d.sq[2]) + '<br>' + T(d.sq[3]));
    const dd = h('div', 'u6l2-line u6l2-big u6l2-oend', T('d=' + d.d)); P.appendChild(dd);
    [h1, h2, r1, r2, s1, s2, q1, q2, dd].forEach(hide);
    const off = 0.55, inY = sgn(B[1] - A[1]) * off, inX = sgn(A[0] - B[0]) * off;
    return [
      { cap: `The segment from ${T(d.nA)} to ${T(d.nB)} and its right triangle.`,
        run: async (c) => {
          await G.drawIn(G.segment(A, B, { color: SEG, width: 5 }), 600, c); await drawLegs(G, c, A, B, { ms: 400 });
          await G.reveal(G.point(...A, { color: SEG, label: T(d.nA + P2(...A)), pos: 's' }), c);
          await G.reveal(G.point(...B, { color: SEG, label: T(d.nB + P2(...B)), pos: B[1] > A[1] ? 'n' : 's' }), c);
        } },
      { cap: `<b>${T(d.nA)} first:</b> walk from ${T(d.nA)} to ${T(d.nB)}: ${d.w1}.`,
        run: async (c) => {
          await G.drawIn(G.segment([A[0], A[1] + inY], [C[0] + inX, C[1] + inY], { color: RUN, width: 5, arrowB: true }), 600, c);
          await G.drawIn(G.segment([C[0] + inX, C[1] + inY], [B[0] + inX, B[1]], { color: RISE, width: 5, arrowB: true }), 600, c);
          await show(c, h1); await show(c, r1); await show(c, s1);
        } },
      { cap: `<b>${T(d.nB)} first:</b> walk back from ${T(d.nB)} to ${T(d.nA)}: ${d.w2}. Every sign flips.`,
        run: async (c) => {
          await G.drawIn(G.segment([B[0] - inX, B[1]], [C[0] - inX, C[1] - inY], { color: RISE, width: 5, arrowB: true, dash: '9 6' }), 600, c);
          await G.drawIn(G.segment([C[0] - inX, C[1] - inY], [A[0], A[1] - inY], { color: RUN, width: 5, arrowB: true, dash: '9 6' }), 600, c);
          await show(c, h2); await show(c, r2); await show(c, s2);
        } },
      { cap: `Now square them. A negative times a negative is positive, so both columns give the <b>same</b> squares.`,
        run: async (c) => { await show(c, q1); await show(c, q2); await Promise.all([pulse(c, q1), pulse(c, q2)]); } },
      { cap: `Same squares, same distance: ${T('d=' + d.d)} either way. Squaring erases the sign.`,
        run: async (c) => { await pop(c, dd); const s = stamp(P, 'same either way ✓'); s.style.alignSelf = 'center'; s.style.marginTop = '6px'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: Example 2 on a map =============================== */
function tower(G, x, y) {
  const [px, py] = G.toPx(x, y), g = svgEl('g', { class: 'u6l2-tower' }, G.layers.top);
  svgEl('path', { d: `M${px - 9} ${py + 4} L${px} ${py - 26} L${px + 9} ${py + 4} M${px - 6} ${py - 6} L${px + 6} ${py - 6} M${px - 3.5} ${py - 15} L${px + 3.5} ${py - 15}`, stroke: INK, 'stroke-width': 2.4, fill: 'none', 'stroke-linejoin': 'round' }, g);
  const top = py - 26;
  for (const r of [7, 12]) {
    svgEl('path', { d: `M${px - r * 0.5} ${top - r * 0.85} A${r} ${r} 0 0 0 ${px - r * 0.5} ${top + r * 0.85}`, stroke: MID, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, g);
    svgEl('path', { d: `M${px + r * 0.5} ${top - r * 0.85} A${r} ${r} 0 0 1 ${px + r * 0.5} ${top + r * 0.85}`, stroke: MID, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, g);
  }
  svgEl('circle', { cx: px, cy: py, r: 6, fill: SEG, stroke: '#fff', 'stroke-width': 2 }, g);
  return g;
}
const map = {
  title: 'Example 2 check: the two cell towers',
  height: 480,
  intro: 'A coordinate grid over a city map: 1 unit = 1 km. Press <b>Next</b>.',
  make(stage, k, ex) {
    const H = ex.def.height, A = [-52, 134], B = [89, 61], C = corner(A, B);
    const G = sqGraph(stage, { xmin: -70, xmax: 110, ymin: 0, ymax: 160 }, 540, H - 20, { x: 10, y: 10, center: true, g: { xstep: 10, ystep: 10, xlabels: 20, ylabels: 20 } });
    const bg = G.layers.bg, Pp = (x, y) => G.toPx(x, y).map((v) => v.toFixed(1)).join(' ');
    svgEl('path', { d: `M${Pp(-70, 30)} C${Pp(-20, 60)} ${Pp(10, 0)} ${Pp(50, 40)} S${Pp(90, 120)} ${Pp(110, 110)}`, stroke: '#9ccbee', 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }, bg);
    const [p0x, p0y] = G.toPx(-40, 100), [p1x, p1y] = G.toPx(-10, 75);
    svgEl('rect', { x: p0x, y: p0y, width: p1x - p0x, height: p1y - p0y, rx: 8, fill: '#cfe8c4' }, bg);
    for (const [a, b] of [[[-70, 90], [110, 90]], [[30, 0], [30, 160]], [[-70, 150], [110, 150]]]) svgEl('line', { x1: G.toPx(...a)[0], y1: G.toPx(...a)[1], x2: G.toPx(...b)[0], y2: G.toPx(...b)[1], stroke: '#d8d2c4', 'stroke-width': 6 }, bg);
    G.label(-25, 87.5, 'park', { cls: 'u6l2-mapl' }); G.label(68, 92, 'river', { cls: 'u6l2-mapl u6l2-mapr' });
    const P = panel(stage, G.W + 30, 14, ex.W - G.W - 44, H - 28, 'Distance formula');
    return [
      { cap: `Tower 1 at ${T('(-52,\\ 134)')}, tower 2 at ${T('(89,\\ 61)')}. Far too many squares to count.`,
        run: async (c) => {
          for (const [p, n, pos] of [[A, '1', 'n'], [B, '2', 'sw']]) { const t = tower(G, ...p); await appear(c, t); const l = G.label(p[0], p[1], `Tower ${n} ${T(P2(...p))}`, { pos, cls: 'bk-ptlab', gap: pos === 'n' ? 32 : 12 }); await appear(c, l); }
          await G.drawIn(G.segment(A, B, { color: SEG, width: 4.5 }), 700, c);
        } },
      { cap: `The right triangle is still there. Its corner is ${T('(89,\\ 134)')}: above tower 2, across from tower 1.`,
        run: async (c) => { await drawLegs(G, c, A, B); } },
      { cap: `<b>Run:</b> ${T('x_2-x_1=89-(-52)=141')} km across.`,
        run: async (c) => { await pop(c, legLabel(G, A, B, 'run', T('141'))); await show(c, line(P, T('x_2-x_1=89-(-52)=141'), 'u6l2-trun')); } },
      { cap: `<b>Rise:</b> ${T('y_2-y_1=61-134=-73')}: 73 km down.`,
        run: async (c) => { await pop(c, legLabel(G, A, B, 'rise', T('-73'), { pos: 'w' })); await show(c, line(P, T('y_2-y_1=61-134=-73'), 'u6l2-trise')); } },
      { cap: `Square, add, and take the square root: ${T('d=\\sqrt{141^2+(-73)^2}=\\sqrt{25\\,210}')}.`,
        run: async (c) => { for (const s of ['d=\\sqrt{141^2+(-73)^2}', '=\\sqrt{19\\,881+5329}', '=\\sqrt{25\\,210}']) await show(c, line(P, T(s))); } },
      { cap: `${T('\\sqrt{25\\,210}\\approx158.78')}, so the towers are about <b>159 km</b> apart.`,
        run: async (c) => { await pop(c, line(P, T('\\approx158.78'), 'u6l2-big')); const s = stamp(P, '≈ 159 km'); s.style.alignSelf = 'center'; s.style.marginTop = '8px'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: squares on the sides (converse) =============================== */
/** square on side p→q, built away from the third vertex r */
function sideSquare(p, q, r) {
  const v = [q[0] - p[0], q[1] - p[1]]; let n = [v[1], -v[0]];
  if ((r[0] - p[0]) * n[0] + (r[1] - p[1]) * n[1] > 0) n = [-n[0], -n[1]];
  return [p, q, [q[0] + n[0], q[1] + n[1]], [p[0] + n[0], p[1] + n[1]]];
}
const CONV = {
  ex3: { label: 'Example 3(b) check', N: [3, 12], lens: ['LM=\\sqrt{16+9}=5', 'MN=\\sqrt{36+64}=10', 'LN=\\sqrt{4+121}=5\\sqrt5'], tags: ['5', '10', '5\\sqrt5'], a: [25, 100, 125], ok: true },
  moved: { label: `Move ${T('N')} to ${T('(4,\\ 12)')}`, N: [4, 12], lens: ['LM=\\sqrt{16+9}=5', 'MN=\\sqrt{49+64}=\\sqrt{113}', 'LN=\\sqrt{9+121}=\\sqrt{130}'], tags: ['5', '\\sqrt{113}', '\\sqrt{130}'], a: [25, 113, 130], ok: false }
};
const converse = {
  title: 'Squares on the sides: is there a right angle?',
  height: 470,
  choices: Object.keys(CONV).map((k) => ({ v: k, label: CONV[k].label })),
  intro: 'Measure the three sides, then build a square on each one. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CONV[k], L = [1, 1], M = [-3, 4], N = d.N, H = ex.def.height, [a, b, cc] = d.a;
    const G = sqGraph(stage, { xmin: -12, xmax: 16, ymin: -4, ymax: 20 }, 520, H - 20, { x: 10, y: 10, center: true, g: { xlabels: 4, ylabels: 4 } });
    const P = panel(stage, G.W + 30, 14, ex.W - G.W - 44, H - 28, 'Side lengths');
    const NN = T('N' + P2(...N));
    return [
      { cap: `Plot ${T('L(1,\\ 1)')}, ${T('M(-3,\\ 4)')} and ${NN}, and join them.`,
        run: async (c) => {
          await G.drawIn(G.polyline([L, M, N], { closed: true, color: SEG, width: 4 }), 900, c);
          for (const [p, n, pos] of [[L, 'L', 's'], [M, 'M', 'w'], [N, 'N', 'n']]) await G.reveal(G.point(...p, { color: SEG, label: T(n), pos }), c);
        } },
      { cap: `Measure each side with the distance formula.`,
        run: async (c) => {
          for (let i = 0; i < 3; i++) {
            const [p, q] = [[L, M], [M, N], [L, N]][i], m = mid(p, q);
            const t = G.label(m[0], m[1], T(d.tags[i]), { cls: 'bk-ptlab u6l2-side', pos: ['sw', 'nw', 'e'][i], gap: 4 }); await pop(c, t);
            await show(c, line(P, T(d.lens[i])));
          }
        } },
      { cap: `${T('LN')} is the longest side, so it is the only one that could be the hypotenuse. Test: does ${T('LM^2+MN^2=LN^2')}?`,
        run: async (c) => { await G.drawIn(G.segment(L, N, { color: MID, width: 6 }), 600, c); } },
      { cap: `Build a square on each shorter side: ${T('LM^2=' + a)} and ${T('MN^2=' + b)} square units.`,
        run: async (c) => {
          const s1 = sideSquare(L, M, N), s2 = sideSquare(M, N, L);
          for (const [sq, col, ar] of [[s1, TEAL, a], [s2, SEG, b]]) {
            const e = square(G, sq, col); await G.drawIn(e, 700, c);
            const ctr = [(sq[0][0] + sq[2][0]) / 2, (sq[0][1] + sq[2][1]) / 2], t = G.label(...ctr, T(String(ar)), { cls: 'u6l2-area', color: col }); await pop(c, t);
          }
          await show(c, line(P, T(`LM^2+MN^2=${a}+${b}=${a + b}`)));
        } },
      { cap: `Now the square on the longest side: ${T('LN^2=' + cc)}.`,
        run: async (c) => {
          const sq = sideSquare(L, N, M), e = square(G, sq, MID, { op: 0.12 }); await G.drawIn(e, 800, c);
          const ctr = [(sq[0][0] + sq[2][0]) / 2, (sq[0][1] + sq[2][1]) / 2], t = G.label(...ctr, T(String(cc)), { cls: 'u6l2-area', color: MID }); await pop(c, t);
          await show(c, line(P, T(`LN^2=${d.ok ? '(5\\sqrt5)^2=' : ''}${cc}`)));
        } },
      d.ok
        ? { cap: `${T('25+100=125')}: the two small squares exactly match the big one. So the angle <b>opposite</b> ${T('LN')}, at ${T('M')}, is a right angle.`,
          run: async (c) => {
            await pop(c, line(P, T('25+100=125\\ \\checkmark'), 'u6l2-big'));
            const rm = rightMark(G.layers.top, G.toPx(...M), G.toPx(...L), G.toPx(...N), 13, { color: MID, width: 3 }); await appear(c, rm, 300);
            const s = stamp(P, '∠LMN = 90° ✓'); s.style.alignSelf = 'center'; s.style.marginTop = '6px'; await stampIn(c, s);
          } }
        : { cap: `${T('25+113=138')}, but ${T('LN^2=130')}. The squares don’t match, so there is <b>no right angle</b>. Moving ${T('N')} one unit broke it.`,
          run: async (c) => { await pop(c, line(P, T('138\\ne130'), 'u6l2-big u6l2-no')); const s = stamp(P, 'no right angle', { ok: false }); s.style.alignSelf = 'center'; s.style.marginTop = '6px'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: straight through or a detour (collinear) =============================== */
const COL = {
  ex4: { label: 'Example 4 check', Y: [-1, 10], nY: 'Y', l1: ['XY=\\sqrt{5^2+12^2}=\\sqrt{169}=13', 13], l2: ['YZ=\\sqrt{10^2+24^2}=\\sqrt{676}=26', 26], ok: true },
  detour: { label: `A detour through ${T('W(-6,\\ 14)')}`, Y: [-6, 14], nY: 'W', l1: ['XW=\\sqrt{0^2+16^2}=16', 16], l2: ['WZ=\\sqrt{15^2+20^2}=\\sqrt{625}=25', 25], ok: false }
};
const collinear = {
  title: 'Straight through, or a detour?',
  height: 470,
  choices: Object.keys(COL).map((k) => ({ v: k, label: COL[k].label })),
  intro: 'Compare the trip through the middle point with the straight trip. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = COL[k], X = [-6, -2], Y = d.Y, Z = [9, 34], H = ex.def.height, nY = d.nY;
    const G = sqGraph(stage, { xmin: -8, xmax: 12, ymin: -4, ymax: 36 }, 270, H - 20, { x: 10, y: 10, center: true, g: { xstep: 2, ystep: 2, xlabels: 4, ylabels: 10 } });
    const SX = G.W + 40, SW = ex.W - SX - 20, u = (SW - 60) / 42;
    const strip = add(stage, box(h('div', 'u6l2-strip2'), SW, 170), SX, 16);
    const bar = (x0, len, y, col, html) => { const e = h('div', 'u6l2-bar', html); e.style.left = 30 + x0 * u + 'px'; e.style.top = y + 'px'; e.style.width = len * u + 'px'; e.style.background = col; strip.appendChild(e); return e; };
    const tag = (html, x, y, cls = '') => { const e = h('div', 'u6l2-stag ' + cls, html); e.style.left = 30 + x * u + 'px'; e.style.top = y + 'px'; strip.appendChild(e); return e; };
    const P = panel(stage, SX, 200, SW, H - 214, '');
    const a = d.l1[1], b = d.l2[1], grow = (c, e) => c.anim(e, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 700);
    const lab = (s) => T(s.replace(/Y/g, nY));
    return [
      { cap: `Plot ${T('X(-6,\\ -2)')}, ${T(nY + P2(...Y))} and ${T('Z(9,\\ 34)')}.`,
        run: async (c) => { for (const [p, n, pos] of [[X, 'X', 'e'], [Y, nY, 'w'], [Z, 'Z', 'w']]) await G.reveal(G.point(...p, { color: INK, label: T(n), pos }), c); } },
      { cap: `The first leg of the trip: ${T(d.l1[0])}.`,
        run: async (c) => { await G.drawIn(G.segment(X, Y, { color: TEAL, width: 4.5 }), 600, c); const e = bar(0, a, 20, TEAL, T(String(a))); await grow(c, e); await show(c, line(P, T(d.l1[0]))); } },
      { cap: `The second leg: ${T(d.l2[0])}.`,
        run: async (c) => { await G.drawIn(G.segment(Y, Z, { color: SEG, width: 4.5 }), 600, c); const e = bar(a, b, 20, SEG, T(String(b))); await grow(c, e); await show(c, line(P, T(d.l2[0]))); tag(lab(`X\\to Y\\to Z`), 0, 0, 'u6l2-stag-l'); } },
      { cap: `The straight trip: ${T('XZ=\\sqrt{15^2+36^2}=\\sqrt{1521}=39')}.`,
        run: async (c) => {
          await G.drawIn(G.segment(X, Z, { color: MID, width: 3, dash: '9 7' }), 700, c);
          const e = bar(0, 39, 92, MID, T('39')); await grow(c, e); tag(T('X\\to Z'), 0, 72, 'u6l2-stag-l');
          await show(c, line(P, T('XZ=\\sqrt{15^2+36^2}=\\sqrt{1521}=39')));
        } },
      d.ok
        ? { cap: `${T('13+26=39')} <b>exactly</b>: going through ${T('Y')} costs nothing extra, so ${T('Y')} is on segment ${T('XZ')}. The points are <b>collinear</b>.`,
          run: async (c) => { const m = h('div', 'u6l2-sline'); m.style.left = 30 + 39 * u + 'px'; strip.appendChild(m); await appear(c, m); await pop(c, line(P, T('XY+YZ=13+26=39=XZ'), 'u6l2-big')); const s = stamp(P, 'collinear ✓'); s.style.alignSelf = 'center'; await stampIn(c, s); } }
        : { cap: `${T('16+25=41')}, which is <b>2 more</b> than the straight 39. The trip bends at ${T('W')}, so ${T('W')} is off the line: <b>not collinear</b>.`,
          run: async (c) => { const m = h('div', 'u6l2-sline'); m.style.left = 30 + 39 * u + 'px'; strip.appendChild(m); await appear(c, m); const x = tag('+2 extra', 39.3, 62, 'u6l2-stag-x'); await pop(c, x); await pop(c, line(P, T('XW+WZ=41\\ne39'), 'u6l2-big u6l2-no')); const s = stamp(P, 'not collinear', { ok: false }); s.style.alignSelf = 'center'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: count from both ends =============================== */
const CNT = {
  a: { label: 'Example 5(a) check', A: [-5, 3], B: [3, 3], nA: 'A', nB: 'B', ax: 'x', min: -6, max: 4, avg: '\\dfrac{-5+3}{2}=\\dfrac{-2}{2}=-1' },
  b: { label: 'Example 5(b) check', A: [2, 5], B: [2, -3], nA: 'C', nB: 'D', ax: 'y', min: -4, max: 6, avg: '\\dfrac{5+(-3)}{2}=\\dfrac{2}{2}=1' },
  odd: { label: `An odd count: ${T('(-5,\\ -2)')} to ${T('(2,\\ -2)')}`, A: [-5, -2], B: [2, -2], nA: 'P', nB: 'Q', ax: 'x', min: -6, max: 3, avg: '\\dfrac{-5+2}{2}=\\dfrac{-3}{2}=-1.5' }
};
const count = {
  title: 'Count from both ends',
  height: 470,
  choices: Object.keys(CNT).map((k) => ({ v: k, label: CNT[k].label })),
  intro: 'Two walkers start at the ends and step toward each other, one square at a time. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CNT[k], A = d.A, B = d.B, H = ex.def.height, hz = d.ax === 'x', M = mid(A, B), n = Math.abs(hz ? B[0] - A[0] : B[1] - A[1]);
    const G = sqGraph(stage, { xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5 }, 450, H - 20, { x: 10, y: 10, center: true, g: { xlabels: 2, ylabels: 2 } });
    const P = panel(stage, G.W + 30, 14, ex.W - G.W - 44, H - 28, `The ${T(d.ax)}-coordinates on a number line`);
    const share = hz ? `same ${T('y')}` : `same ${T('x')}`, cA = hz ? A[0] : A[1], cB = hz ? B[0] : B[1], cM = hz ? M[0] : M[1];
    let w1, w2;
    const dot = (p) => { const g = svgEl('circle', { r: 11, fill: RUN, stroke: '#fff', 'stroke-width': 3, class: 'u6l2-wdot' }, G.layers.top); g.at = p.slice(); g.place = (x, y) => { g.at = [x, y]; const [px, py] = G.toPx(x, y); g.setAttribute('cx', px); g.setAttribute('cy', py); }; g.place(...p); return g; };
    const posA = hz ? 'n' : 'e', posB = posA;
    return [
      { cap: `${T(d.nA + P2(...A))} and ${T(d.nB + P2(...B))} have the ${share}, so the segment is ${hz ? 'horizontal' : 'vertical'}.`,
        run: async (c) => { await G.drawIn(G.segment(A, B, { color: INK, width: 4.5 }), 600, c); await G.reveal(G.point(...A, { color: INK, label: T(d.nA + P2(...A)), pos: posA }), c); await G.reveal(G.point(...B, { color: INK, label: T(d.nB + P2(...B)), pos: posB }), c); } },
      { cap: `Count the squares from ${T(d.nA)} to ${T(d.nB)}: <b>${n}</b>.`,
        run: async (c) => { await countLeg(G, c, A, B, 150); } },
      { cap: `A walker starts at each end. They step toward each other at the same speed${n % 2 ? `: ${Math.floor(n / 2)} whole squares each, then half a square more` : `, ${n / 2} squares each`}.`,
        run: async (c) => {
          w1 = dot(A); w2 = dot(B); await Promise.all([pop(c, w1), pop(c, w2)]);
          const ux = sgn(B[0] - A[0]), uy = sgn(B[1] - A[1]);
          let t = 0; const hn = n / 2;
          while (t < hn - 1e-9) {
            const st = Math.min(1, hn - t), a0 = w1.at.slice(), b0 = w2.at.slice();
            await tween(c, 420 * st + 120, (s) => { w1.place(a0[0] + ux * st * s, a0[1] + uy * st * s); w2.place(b0[0] - ux * st * s, b0[1] - uy * st * s); });
            t += st; await sleep(c, 140);
          }
          w1.place(...M); w2.place(...M);
        } },
      { cap: `They meet ${T(String(half(n)))} squares in from each end: the midpoint ${T('M' + P2(...M))}.${n % 2 ? ' A midpoint can sit in the middle of a square.' : ''}`,
        run: async (c) => {
          G.remove(w1, w2);
          const m = G.point(...M, { color: MID, r: 9, label: T('M' + P2(...M)), pos: hz ? 'n' : 'e', labelColor: MID, gap: hz ? 30 : 5 }); await G.reveal(m, c);
          const o = -1.15;
          const segs = hz ? [[[A[0], A[1] + o], [M[0], M[1] + o]], [[M[0], M[1] + o], [B[0], B[1] + o]]] : [[[A[0] + o, A[1]], [M[0] + o, M[1]]], [[M[0] + o, M[1]], [B[0] + o, B[1]]]];
          for (const [p, q] of segs) { await G.drawIn(G.segment(p, q, { color: MID, width: 2.5, arrowA: true, arrowB: true }), 400, c); const mm = mid(p, q); await pop(c, G.label(...mm, T(String(half(n))), { pos: hz ? 's' : 'w', color: MID, gap: 3, cls: 'u6l2-hl' })); }
        } },
      { cap: `In numbers: ${T('M')} keeps the ${share}, and its ${T(d.ax)} is the <b>average</b> of ${T(texNum(cA))} and ${T(texNum(cB))}: ${T(d.avg)}.`,
        run: async (c) => {
          const NL = new NumberLine(P, { width: ex.W - G.W - 72, height: 120, axisY: 82, min: d.min, max: d.max });
          NL.point(cA, { color: INK }); NL.point(cB, { color: INK });
          await appear(c, NL.el);
          await NL.hop(c, cA, cM, { label: T(texNum(Math.abs(cM - cA))), color: RUN, height: 38 }); await NL.hop(c, cM, cB, { label: T(texNum(Math.abs(cB - cM))), color: RUN, height: 38 });
          const mp = NL.point(cM, { color: MID, r: 9 }); await pop(c, mp);
          await show(c, line(P, T(`${d.ax}_M=${d.avg}`), 'u6l2-big'));
          await show(c, line(P, `Add the two ends and halve: the <b>average</b> is the number exactly halfway between them.`, 'u6l2-note'));
        } }
    ];
    function half(v) { return v / 2; }
  }
};

/* =============================== explainer: half the run, half the rise =============================== */
const WALK = {
  ex6: { label: 'Example 6 check', A: [-2, -3], B: [4, 5], nA: 'F', nB: 'E', win: { xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5 },
    whole: '6 right and 8 up', half: ['3 right', '4 up'], ax: ['\\dfrac{-2+4}{2}=1', '\\dfrac{-3+5}{2}=1'] },
  s1: { label: `Section 1: ${T('A')} to ${T('B')}`, A: [-4, -2], B: [8, 3], nA: 'A', nB: 'B', win: { xmin: -6, xmax: 10, ymin: -4, ymax: 6 },
    whole: '12 right and 5 up', half: ['6 right', '2.5 up'], ax: ['\\dfrac{-4+8}{2}=2', '\\dfrac{-2+3}{2}=0.5'] },
  warm: { label: 'Warm-up: the booster', A: [0, 0], B: [-4, 4], nA: 'O', nB: 'C', posA: 'se', win: { xmin: -6, xmax: 2, ymin: -1.5, ymax: 6 },
    whole: '4 left and 4 up', half: ['2 left', '2 up'], ax: ['\\dfrac{0+(-4)}{2}=-2', '\\dfrac{0+4}{2}=2'] }
};
const walker = {
  title: 'Half the run, half the rise',
  height: 480,
  choices: Object.keys(WALK).map((k) => ({ v: k, label: WALK[k].label })),
  intro: 'A hiker walks the triangle instead of the slant: across, then up. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = WALK[k], A = d.A, B = d.B, C = corner(A, B), M = mid(A, B), H = ex.def.height;
    const G = sqGraph(stage, d.win, 520, H - 20, { x: 10, y: 10, center: true, g: { xlabels: d.win.xmax - d.win.xmin > 12 ? 2 : 1, ylabels: 2 } });
    const P = panel(stage, G.W + 30, 14, ex.W - G.W - 44, H - 28, `${T(d.nA)} to ${T(d.nB)}`);
    const rx = B[0] - A[0], ry = B[1] - A[1], H1 = [A[0] + rx / 2, A[1]];
    let w;
    return [
      { cap: `Segment ${T(d.nA + d.nB)} is slanted: there is no shared coordinate to count along.`,
        run: async (c) => { await G.drawIn(G.segment(A, B, { color: SEG, width: 5 }), 700, c); await G.reveal(G.point(...A, { color: SEG, label: T(d.nA + P2(...A)), pos: d.posA || (ry > 0 ? 's' : 'n') }), c); await G.reveal(G.point(...B, { color: SEG, label: T(d.nB + P2(...B)), pos: 'n' }), c); } },
      { cap: `The whole trip from ${T(d.nA)} to ${T(d.nB)}: <b>${d.whole}</b>.`,
        run: async (c) => {
          await drawLegs(G, c, A, B);
          await pop(c, legLabel(G, A, B, 'run', T(texNum(Math.abs(rx))))); await pop(c, legLabel(G, A, B, 'rise', T(texNum(Math.abs(ry)))));
          await show(c, line(P, `whole trip: <b class="u6l2-crun">${d.whole.split(' and ')[0]}</b>, <b class="u6l2-crise">${d.whole.split(' and ')[1]}</b>`));
          void C;
        } },
      { cap: `The hiker walks <b>half the run</b>: ${d.half[0]}…`,
        run: async (c) => { w = walkerFig(G); w.place(...A); await pop(c, w.body); await walkTo(G, c, w, H1, RUN, 900); } },
      { cap: `…then <b>half the rise</b>: ${d.half[1]}. The hiker is standing on the segment, at ${T('M' + P2(...M))}.`,
        run: async (c) => {
          await walkTo(G, c, w, M, RISE, 900);
          await G.reveal(G.point(...M, { color: MID, r: 9, label: T('M' + P2(...M)), pos: rx > 0 ? 'se' : 'sw', labelColor: MID }), c);
          await show(c, line(P, `half of each: <b class="u6l2-crun">${d.half[0]}</b>, <b class="u6l2-crise">${d.half[1]}</b> → ${T('M' + P2(...M))}`));
        } },
      { cap: `Do the same again (${d.half[0]}, ${d.half[1]}) and the hiker lands exactly on ${T(d.nB)}. So ${T('M')} really is halfway.`,
        run: async (c) => { await walkTo(G, c, w, [B[0], M[1]], RUN, 800); await walkTo(G, c, w, B, RISE, 800); } },
      { cap: `Shadows on the axes: ${T('M')}’s ${T('x')} is halfway between the ${T('x')}’s, and its ${T('y')} is halfway between the ${T('y')}’s. Average each coordinate.`,
        run: async (c) => {
          G.remove(w);
          await G.drawIn(G.shadeX(Math.min(A[0], B[0]), Math.max(A[0], B[0]), { color: RUN }), 600, c);
          await G.drawIn(G.shadeY(Math.min(A[1], B[1]), Math.max(A[1], B[1]), { color: RISE }), 600, c);
          await G.drawIn(G.guides(...M, { color: MID }), 600, c);
          await show(c, line(P, T('x_M=' + d.ax[0]), 'u6l2-trun')); await show(c, line(P, T('y_M=' + d.ax[1]), 'u6l2-trise'));
        } }
    ];
  }
};

/* =============================== explainer: the midpoint formula as the average =============================== */
const AVG = {
  sym: { label: 'The formula', sym: true, A: [2, 7], B: [9, 2], win: { xmin: 0, xmax: 10.5, ymin: 0, ymax: 8.5 } },
  ex7a: { label: 'Example 7(a) check', A: [6, 9], B: [14, 1], nA: 'P', nB: 'Q', win: { xmin: -1, xmax: 16, ymin: -1, ymax: 11 }, xr: [4, 16], yr: [0, 10] },
  ex7b: { label: 'Example 7(b) check', A: [-7, 5], B: [-15, -3], nA: 'E', nB: 'F', win: { xmin: -17, xmax: 1, ymin: -5, ymax: 7 }, xr: [-16, -6], yr: [-4, 6] }
};
const average = {
  title: 'The midpoint formula: average the x’s, average the y’s',
  height: 480,
  choices: Object.keys(AVG).map((k) => ({ v: k, label: AVG[k].label })),
  intro: 'Split the two points into their x-values and their y-values, and find the middle of each. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = AVG[k], A = d.A, B = d.B, M = mid(A, B), H = ex.def.height, sym = !!d.sym;
    const G = sqGraph(stage, d.win, 430, H - 20, sym ? { x: 10, y: 10, center: true, g: { numbers: false }, pad: [18, 18, 46, 54] } : { x: 10, y: 10, center: true });
    const PW = ex.W - G.W - 44, P = panel(stage, G.W + 30, 14, PW, H - 28, '');
    const NW = PW - 28;
    const lx = sym ? [{ v: A[0], html: T('x_1') }, { v: B[0], html: T('x_2') }] : null, ly = sym ? [{ v: B[1], html: T('y_2') }, { v: A[1], html: T('y_1') }] : null;
    const xs = sym ? [1, 10] : d.xr, ys = sym ? [1, 8] : d.yr;
    const nmA = sym ? 'P(x_1,\\ y_1)' : d.nA + P2(...A), nmB = sym ? 'Q(x_2,\\ y_2)' : d.nB + P2(...B);
    const xm = sym ? '\\dfrac{x_1+x_2}{2}' : `\\dfrac{${texNum(A[0])}+${B[0] < 0 ? '(' + texNum(B[0]) + ')' : texNum(B[0])}}{2}=\\dfrac{${texNum(A[0] + B[0])}}{2}=${texNum(M[0])}`;
    const ym = sym ? '\\dfrac{y_1+y_2}{2}' : `\\dfrac{${texNum(A[1])}+${B[1] < 0 ? '(' + texNum(B[1]) + ')' : texNum(B[1])}}{2}=\\dfrac{${texNum(A[1] + B[1])}}{2}=${texNum(M[1])}`;
    const gap = (a, b) => (sym ? '' : T((b > a ? '+' : '') + texNum(b - a)));
    const NL = (lab, rng, labels) => { const t = line(P, `<b>${lab}</b>`, 'u6l2-nlh'); const L = new NumberLine(P, { width: NW, height: 74, axisY: 44, min: rng[0], max: rng[1], numbers: true, labels }); hide(t); hide(L.el); return { t, L }; };
    const X = NL(`${T('x')}-values`, xs, lx), Y = NL(`${T('y')}-values`, ys, ly);
    return [
      { cap: `${T(nmA)} and ${T(nmB)}.`,
        run: async (c) => { await G.drawIn(G.segment(A, B, { color: SEG, width: 5 }), 700, c); await G.reveal(G.point(...A, { color: SEG, label: T(nmA), pos: 'n' }), c); await G.reveal(G.point(...B, { color: SEG, label: T(nmB), pos: sym ? 'n' : 's' }), c); } },
      { cap: sym ? `The ${T('x')}-values alone: halfway between ${T('x_1')} and ${T('x_2')} is their average, ${T('\\frac{x_1+x_2}{2}')}.` : `The ${T('x')}-values alone: ${T(texNum(A[0]))} and ${T(texNum(B[0]))}. Halfway between them: add and halve. ${T('x_M=' + xm)}.`,
        run: async (c) => {
          await show(c, X.t); await appear(c, X.L.el);
          const p1 = X.L.point(A[0], { color: SEG }), p2 = X.L.point(B[0], { color: SEG }); await Promise.all([pop(c, p1), pop(c, p2)]);
          await X.L.hop(c, A[0], M[0], { label: gap(A[0], M[0]), color: RUN, height: 24 }); await X.L.hop(c, M[0], B[0], { label: gap(M[0], B[0]), color: RUN, height: 24 });
          await pop(c, X.L.point(M[0], { color: MID, r: 9 })); await show(c, line(P, T('x_M=' + xm), 'u6l2-trun'));
        } },
      { cap: sym ? `The ${T('y')}-values alone: halfway between ${T('y_1')} and ${T('y_2')} is ${T('\\frac{y_1+y_2}{2}')}.` : `The ${T('y')}-values alone: ${T(texNum(A[1]))} and ${T(texNum(B[1]))}. ${T('y_M=' + ym)}.`,
        run: async (c) => {
          await show(c, Y.t); await appear(c, Y.L.el);
          const p1 = Y.L.point(A[1], { color: SEG }), p2 = Y.L.point(B[1], { color: SEG }); await Promise.all([pop(c, p1), pop(c, p2)]);
          await Y.L.hop(c, A[1], M[1], { label: gap(A[1], M[1]), color: RISE, height: 24 }); await Y.L.hop(c, M[1], B[1], { label: gap(M[1], B[1]), color: RISE, height: 24 });
          await pop(c, Y.L.point(M[1], { color: MID, r: 9 })); await show(c, line(P, T('y_M=' + ym), 'u6l2-trise'));
        } },
      { cap: sym ? `Put the two averages together: that point lands exactly halfway along the segment.` : `Put them together: ${T('M' + P2(...M))}. It lands right on the segment, halfway along.`,
        run: async (c) => {
          await G.drawIn(G.vline(M[0], { color: RUN, width: 2.5 }), 500, c); await G.drawIn(G.hline(M[1], { color: RISE, width: 2.5 }), 500, c);
          await G.reveal(G.point(...M, { color: MID, r: 9, label: sym ? T('M') : T('M' + P2(...M)), pos: (B[1] - A[1]) * (B[0] - A[0]) > 0 ? 'nw' : 'ne', labelColor: MID }), c);
        } },
      { cap: `The <b>midpoint formula</b>: average the ${T('x')}’s and average the ${T('y')}’s.`,
        run: async (c) => { const f = line(P, T('M\\left(\\dfrac{x_1+x_2}{2},\\ \\dfrac{y_1+y_2}{2}\\right)'), 'u6l2-boxed'); await pop(c, f, 500); } }
    ];
  }
};

/* =============================== explainer: working backward =============================== */
const BACK = {
  demo: { label: `Endpoint ${T('A(-3,\\ 1)')}, midpoint ${T('M(1,\\ 3)')}` },
  ex8: { label: 'Example 8 check' }
};
const backward = {
  title: 'The midpoint is halfway, so go the same again',
  height: 480,
  choices: Object.keys(BACK).map((k) => ({ v: k, label: BACK[k].label })),
  intro: (k) => (k === 'ex8' ? 'Devon’s page has two coffee blots. Press <b>Next</b>.' : 'One endpoint and the midpoint are known. Where is the other end? Press <b>Next</b>.'),
  make(stage, k, ex) {
    const H = ex.def.height;
    if (k === 'demo') {
      const A = [-3, 1], M = [1, 3], B = [5, 5];
      const G = sqGraph(stage, { xmin: -5, xmax: 7, ymin: -1.5, ymax: 7 }, 520, H - 20, { x: 10, y: 10, center: true });
      const P = panel(stage, G.W + 30, 14, ex.W - G.W - 44, H - 28, 'Check');
      let w;
      return [
        { cap: `We know endpoint ${T('A(-3,\\ 1)')} and the midpoint ${T('M(1,\\ 3)')}. Where is the other end, ${T('B')}?`,
          run: async (c) => { await G.reveal(G.point(...A, { color: SEG, label: T('A(-3,\\ 1)'), pos: 'n' }), c); await G.reveal(G.point(...M, { color: MID, r: 9, label: T('M(1,\\ 3)'), pos: 'nw', labelColor: MID }), c); } },
        { cap: `Walk from ${T('A')} to ${T('M')}: <b>4 right</b> and <b>2 up</b>.`,
          run: async (c) => { w = walkerFig(G); w.place(...A); await pop(c, w.body); await walkTo(G, c, w, [1, 1], RUN); await pop(c, G.label(-1, 1, T('4'), { pos: 's', cls: 'u6l2-legl u6l2-lrun', gap: 8 })); await walkTo(G, c, w, M, RISE); await pop(c, G.label(1, 2, T('2'), { pos: 'e', cls: 'u6l2-legl u6l2-lrise', gap: 8 })); } },
        { cap: `${T('M')} is halfway, so <b>go the same again</b>: 4 right, 2 up. That lands on ${T('B(5,\\ 5)')}.`,
          run: async (c) => { await walkTo(G, c, w, [5, 3], RUN); await pop(c, G.label(3, 3, T('4'), { pos: 's', cls: 'u6l2-legl u6l2-lrun', gap: 8 })); await walkTo(G, c, w, B, RISE); await pop(c, G.label(5, 4, T('2'), { pos: 'e', cls: 'u6l2-legl u6l2-lrise', gap: 8 })); G.remove(w); await G.reveal(G.point(...B, { color: SEG, label: T('B(5,\\ 5)'), pos: 'n' }), c); await G.drawIn(G.segment(A, B, { color: SEG, width: 4 }), 600, c); } },
        { cap: `Check with the formula: the midpoint of ${T('A(-3,\\ 1)')} and ${T('B(5,\\ 5)')} is ${T('\\left(\\frac{-3+5}{2},\\ \\frac{1+5}{2}\\right)=(1,\\ 3)')} ✓`,
          run: async (c) => { await show(c, line(P, T('\\left(\\dfrac{-3+5}{2},\\ \\dfrac{1+5}{2}\\right)=(1,\\ 3)\\ \\checkmark'))); } },
        { cap: `Or solve one coordinate at a time: ${T('\\frac{-3+x}{2}=1')}, so ${T('-3+x=2')} and ${T('x=5')}. Same for ${T('y')}.`,
          run: async (c) => { for (const s of ['\\dfrac{-3+x}{2}=1\\Rightarrow -3+x=2\\Rightarrow x=5', '\\dfrac{1+y}{2}=3\\Rightarrow 1+y=6\\Rightarrow y=5']) await show(c, line(P, T(s))); } }
      ];
    }
    const Q = [-8, -6], M = [3, 3], Pp = [14, 12];
    const G = sqGraph(stage, { xmin: -10, xmax: 16, ymin: -8, ymax: 14 }, 440, H - 20, { x: 10, y: 10, center: true, g: { xlabels: 4, ylabels: 4 } });
    const PW = ex.W - G.W - 44, P = panel(stage, G.W + 30, 14, PW, H - 28, '');
    const note = h('div', 'u6l2-pnote', `<span>${T('P(')}<b class="u6l2-blot u6l2-b1">${T('x_1')}</b>${T(',\\ 12)')}</span><span>${T('Q(-8,\\ -6)')}</span><span>${T('M(3,\\ ')}<b class="u6l2-blot u6l2-b2">${T('y_M')}</b>${T(')')}</span>`);
    P.appendChild(note);
    const b1 = note.querySelector('.u6l2-b1'), b2 = note.querySelector('.u6l2-b2');
    const wipe = async (c, b, v) => { b.innerHTML = T(v); b.classList.add('u6l2-wiped'); await pulse(c, b, 1.25); };
    let XL, YL;
    return [
      { cap: `Devon’s page: ${T('P(x_1,\\ 12)')}, ${T('Q(-8,\\ -6)')}, ${T('M(3,\\ y_M)')}. Coffee hid two numbers. We do know ${T('Q')}, ${T('M')}’s ${T('x')} and ${T('P')}’s ${T('y')}.`,
        run: async (c) => {
          await G.reveal(G.point(...Q, { color: SEG, label: T('Q(-8,\\ -6)'), pos: 'se' }), c);
          await G.drawIn(G.vline(3, { color: MID, width: 2 }), 500, c); await appear(c, G.label(3, 13, T('x=3'), { pos: 'e', cls: 'bk-ptlab', color: MID, gap: 6 }));
          await G.drawIn(G.hline(12, { color: SEG, width: 2 }), 500, c); await appear(c, G.label(-9.5, 12, T('y=12'), { pos: 'ne', cls: 'bk-ptlab', color: SEG, gap: 2 }));
        } },
      { cap: `(i) Just the ${T('x')}’s. ${T('Q')} is at ${T('x=-8')} and ${T('M')} is at ${T('x=3')}: that is <b>11 to the right</b>.`,
        run: async (c) => {
          await show(c, line(P, `<b>${T('x')}-values</b>`, 'u6l2-nlh'));
          XL = new NumberLine(P, { width: PW - 28, height: 84, axisY: 50, min: -10, max: 16, step: 1, labels: [-8, 0, 3].map((v) => ({ v, html: T(texNum(v)) })) }); await appear(c, XL.el);
          await pop(c, XL.point(-8, { color: SEG })); await pop(c, XL.point(3, { color: MID })); await XL.hop(c, -8, 3, { label: T('+11'), color: RUN });
        } },
      { cap: `${T('M')} is halfway, so <b>go the same again</b>: ${T('3+11=14')}. The trailhead is ${T('P(14,\\ 12)')}. (Algebra: ${T('\\frac{x_1+(-8)}{2}=3\\Rightarrow x_1-8=6\\Rightarrow x_1=14')}.)`,
        run: async (c) => {
          await XL.hop(c, 3, 14, { label: T('+11'), color: RUN }); await pop(c, XL.point(14, { color: SEG, r: 9 })); await pop(c, XL.mark(14, T('14'), { pos: 's', color: MID })); await wipe(c, b1, '14');
          await show(c, line(P, T('\\dfrac{x_1+(-8)}{2}=3\\Rightarrow x_1-8=6\\Rightarrow x_1=14'), 'u6l2-sm'));
        } },
      { cap: `(ii) Now both ${T('y')}’s are known: 12 and ${T('-6')}. ${T('y_M=\\frac{12+(-6)}{2}=\\frac{6}{2}=3')}, halfway between them.`,
        run: async (c) => {
          await show(c, line(P, `<b>${T('y')}-values</b>`, 'u6l2-nlh'));
          YL = new NumberLine(P, { width: PW - 28, height: 84, axisY: 50, min: -8, max: 14, step: 1, labels: [-6, 0, 12].map((v) => ({ v, html: T(texNum(v)) })) }); await appear(c, YL.el);
          await pop(c, YL.point(12, { color: SEG })); await pop(c, YL.point(-6, { color: SEG }));
          await YL.hop(c, -6, 3, { label: T('+9'), color: RISE }); await YL.hop(c, 3, 12, { label: T('+9'), color: RISE }); await pop(c, YL.point(3, { color: MID, r: 9 })); await pop(c, YL.mark(3, T('3'), { pos: 's', color: MID }));
          await wipe(c, b2, '3');
        } },
      { cap: `On the grid: from ${T('Q')} to ${T('M(3,\\ 3)')} is 11 right and 9 up, and the same again lands on ${T('P(14,\\ 12)')} ✓`,
        run: async (c) => {
          const w = walkerFig(G); w.place(...Q); await pop(c, w.body);
          await walkTo(G, c, w, [3, -6], RUN, 700); await walkTo(G, c, w, M, RISE, 700);
          await G.reveal(G.point(...M, { color: MID, r: 9, label: T('M(3,\\ 3)'), pos: 'w', labelColor: MID }), c);
          await walkTo(G, c, w, [14, 3], RUN, 700); await walkTo(G, c, w, Pp, RISE, 700); G.remove(w);
          await G.reveal(G.point(...Pp, { color: SEG, label: T('P(14,\\ 12)'), pos: 'sw' }), c);
          await G.drawIn(G.segment(Q, Pp, { color: SEG, width: 4 }), 600, c);
        } }
    ];
  }
};

/* =============================== mount =============================== */
mountWifi();
mountStatics();
export const explainers = mountExplainers({ hidden, lift, order, map, converse, collinear, count, walker, average, backward });
export const _test = { HID, LIFT, ORD, CONV, COL, CNT, WALK, AVG };
