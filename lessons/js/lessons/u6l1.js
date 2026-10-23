/* Math 10C · Unit 6 · Lesson 1 — Length, Distance, and Midpoint of a Line Segment.
 * Warm-up (Can you get Wi-Fi? a router, five houses and the 5-unit signal edge), static figures, and the explainers:
 *   lengths (count the squares, or subtract the coordinates; horizontal, vertical turned 90°; Example 1 / 2 checks),
 *   hidden (the right triangle grows out of a slanted segment, run and rise are counted, squares are built on each side
 *   and a² + b² = c² runs; Example 3 checks), simplify (simplest radical form), lift (the legs lifted into symbols → the
 *   distance formula; Example 4(a) check), map (Example 4(b) on a city map grid), midcount (two walkers meet in the
 *   middle; Example 5(a)), walker (half the run, half the rise; Example 5(b)), average (each coordinate's average on its
 *   own number line; Example 6), backward (the midpoint is halfway, so go the same again; Example 7).
 * Colours: run / horizontal amber, rise / vertical purple, segments / hypotenuse blue, midpoints red. */
import {
  h, tex, add, box, Graph, NumberLine, RightTriangle, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pairTex, texNum, svgEl, liveCtx, pulse, rightMark, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const AMB = COLORS.amber, PUR = COLORS.purple, BLUE = COLORS.blue, RED = COLORS.red, GRN = COLORS.green, INK = COLORS.ink;
const tn = (v) => texNum(v);
const par = (v) => (v < 0 ? `(${tn(v)})` : tn(v));                 // a negative in brackets when it is subtracted
const minus = (a, b) => `${tn(a)}-${par(b)}`;                        // "a-(b)"
const ptT = (n, x, y) => `${n}${pairTex(x, y)}`;                     // "A(-5,\ 5)"
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u6l1-panel', title ? `<div class="u6l1-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u6l1-line ' + cls, html); p.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const hide0 = (el) => { el.style.opacity = 0; return el; };
const lab = (host, x, y, html, cls = '') => { const d = h('div', cls, html); d.style.position = 'absolute'; d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.translate = '-50% -50%'; host.appendChild(d); return d; };
/** √n in simplest form: [k, m] with n = k²·m */
function simpRad(n) { let k = 1; for (let d = 2; d * d <= n; d++) if (n % (d * d) === 0) k = d; return [k, n / (k * k)]; }
const radTex = (n) => { const [k, m] = simpRad(n); return m === 1 ? String(k) : (k === 1 ? '' : k) + `\\sqrt{${m}}`; };

/** a window with equal units that holds every point (and the origin), for a graph of W × H px with 18 px padding */
function fitWin(pts, W, H, pad = 1) {
  const xs = pts.map((p) => p[0]).concat(0), ys = pts.map((p) => p[1]).concat(0);
  const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
  const pw = W - 36, ph = H - 36, u = Math.min(pw / (x1 - x0), ph / (y1 - y0)), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return { xmin: cx - pw / u / 2, xmax: cx + pw / u / 2, ymin: cy - ph / u / 2, ymax: cy + ph / u / 2 };
}
const RUN = AMB, RISE = PUR, SEG = BLUE, MID = RED, TEAL = COLORS.teal;
const P2 = (x, y) => pairTex(x, y);
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
  return G.label(at[0], at[1], html, { pos: o.pos || (which === 'run' ? out.run : out.rise), cls: 'u6l1-legl ' + (which === 'run' ? 'u6l1-lrun' : 'u6l1-lrise'), gap: 6 });
}
/** count squares along a leg with little numbered bubbles, then remove them */
async function countLeg(G, c, from, to, ms = 110) {
  const dx = sgn(to[0] - from[0]), dy = sgn(to[1] - from[1]), n = Math.round(Math.abs(to[0] - from[0]) + Math.abs(to[1] - from[1]));
  const els = [];
  for (let i = 1; i <= n; i++) {
    const e = G.label(from[0] + dx * (i - 0.5), from[1] + dy * (i - 0.5), String(i), { cls: 'u6l1-tick' + (dx ? ' u6l1-tick-r' : ' u6l1-tick-u') });
    e.style.opacity = 0; els.push(e); await pop(c, e, ms * 1.6); await sleep(c, ms * 0.4);
  }
  await sleep(c, 450);
  G.remove(...els);
  return n;
}
/** a little hiker standing at a graph point */
function walkerFig(G, color = INK) {
  const g = svgEl('g', { class: 'u6l1-walker' }, G.layers.top), b = g.body = svgEl('g', { class: 'u6l1-wbody' }, g);
  svgEl('rect', { x: -10, y: -26, width: 7, height: 12, rx: 2.5, fill: RUN }, b);
  svgEl('path', { d: 'M0 -25 V-11 M0 -11 L-6 0 M0 -11 L6 0 M0 -21 L8 -15', stroke: color, 'stroke-width': 3.6, 'stroke-linecap': 'round', fill: 'none' }, b);
  svgEl('circle', { cx: 0, cy: -32, r: 6.5, fill: color }, b);
  g.at = [0, 0];
  g.place = (x, y) => { g.at = [x, y]; const [px, py] = G.toPx(x, y); g.setAttribute('transform', `translate(${px} ${py})`); };
  return g;
}
/** walk the hiker to a point, leaving an arrow trail */
async function walkTo(G, c, w, to, color, ms = 900) {
  const from = w.at.slice(), trail = G.segment(from, to, { color, width: 5, arrowB: true, cls: 'u6l1-trail' });
  await Promise.all([G.drawIn(trail, ms, c), tween(c, ms, (t) => w.place(from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t))]);
  w.place(...to);
  return trail;
}
/** fly a copy of `from` (an element on the stage) into the slot `to`, then fill the slot */
async function fly(c, stage, from, to) {
  c.check();
  if (c.fast) { to.classList.add('u6l1-filled'); return; }
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const clone = h('div', 'u6l1-fly ' + [...from.classList].filter((x) => /u6l1-l(run|rise)/.test(x)).join(' '), from.innerHTML);
  stage.appendChild(clone);
  const ax = (a.left - sr.left) / k, ay = (a.top - sr.top) / k;
  clone.style.left = ax + 'px'; clone.style.top = ay + 'px';
  const dx = (b.left + b.width / 2 - sr.left) / k - clone.offsetWidth / 2 - ax, dy = (b.top + b.height / 2 - sr.top) / k - clone.offsetHeight / 2 - ay;
  try { await c.anim(clone, [{ transform: 'translate(0, 0) scale(1)' }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) scale(1.25)`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px) scale(1)` }], 900); }
  finally { clone.remove(); }
  to.classList.add('u6l1-filled');
  await pulse(c, to, 1.12);
}
/** a formula line with empty slots: parts are TeX strings or { slot: TeX } */
function slotLine(P, parts, cls = '') {
  const d = h('div', 'u6l1-line u6l1-fline ' + cls), slots = [];
  parts.forEach((p) => { if (typeof p === 'string') d.insertAdjacentHTML('beforeend', T(p)); else { const s = h('span', 'u6l1-slot ' + (slots.length ? 'u6l1-srise' : 'u6l1-srun'), T(p.slot)); d.appendChild(s); slots.push(s); } });
  P.appendChild(d); return { el: d, slots };
}

/* ---------------- counting hops on a Graph ---------------- */
/** an arc from graph point p to q, bulging by `bulge` px in the px direction (nx, ny) */
function hopArc(G, p, q, o) {
  const b = o.bulge || 12;
  return G.curve(() => {
    const P = G.toPx(p[0], p[1]), Q = G.toPx(q[0], q[1]), C = [(P[0] + Q[0]) / 2 + o.nx * b * 2, (P[1] + Q[1]) / 2 + o.ny * b * 2], pts = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12, u = 1 - t; pts.push([u * u * P[0] + 2 * t * u * C[0] + t * t * Q[0], u * u * P[1] + 2 * t * u * C[1] + t * t * Q[1]]); }
    return { subs: [pts] };
  }, { color: o.color, width: 2.6 }, 'u6l1-hop', G.layers.top);
}
/** unit hops from A to B (a horizontal or vertical run), numbered 1, 2, 3 … ; side: px direction [nx, ny] */
async function countHops(G, c, A, B, o) {
  const horiz = A[1] === B[1], dd = horiz ? B[0] - A[0] : B[1] - A[1], n = Math.round(Math.abs(dd)), s = Math.sign(dd), [nx, ny] = o.side, b = 11, els = [];
  for (let i = 0; i < n; i++) {
    const p = horiz ? [A[0] + s * i, A[1]] : [A[0], A[1] + s * i], q = horiz ? [A[0] + s * (i + 1), A[1]] : [A[0], A[1] + s * (i + 1)];
    const arc = hopArc(G, p, q, { color: o.color, nx, ny, bulge: b });
    const l = hide0(G.label((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, String(i + 1), { cls: 'u6l1-hopn', color: o.color, dx: nx * (b + 12), dy: ny * (b + 12) }));
    els.push(arc, l);
    await G.drawIn(arc, o.ms || 150, c); await appear(c, l, 80);
  }
  return els;
}
/** a right-angle mark at graph point K between the directions to P and Q (tracks zooms) */
function rightAngle(G, K, P, Q, color) {
  return G.curve(() => {
    const k = G.toPx(...K), p = G.toPx(...P), q = G.toPx(...Q), s = 14;
    const u = [p[0] - k[0], p[1] - k[1]], v = [q[0] - k[0], q[1] - k[1]], lu = Math.hypot(...u) || 1, lv = Math.hypot(...v) || 1;
    const a = [k[0] + u[0] / lu * s, k[1] + u[1] / lu * s], b = [k[0] + v[0] / lv * s, k[1] + v[1] / lv * s];
    return { subs: [[a, [a[0] + v[0] / lv * s, a[1] + v[1] / lv * s], b]] };
  }, { color: color || INK, width: 2 }, 'u6l1-ra', G.layers.top);
}

/* =============================== warm-up: Wi-Fi =============================== */
const HOUSES = [{ n: 'A', p: [-4, 0], col: '#e8a01e', pos: 'w' }, { n: 'B', p: [3, 4], col: '#d9604f', pos: 'e' }, { n: 'C', p: [-4, 4], col: '#3d8fd6', pos: 'w' },
  { n: 'D', p: [-3, -4], col: '#9a6fd1', pos: 'e' }, { n: 'E', p: [5, -3], col: '#5c9a5e', pos: 'e' }];
function house(G, x, y, color) {
  const [px, py] = G.toPx(x, y), g = svgEl('g', { class: 'u6l1-house' }, G.layers.top);
  svgEl('rect', { x: px - 12, y: py - 20, width: 24, height: 15, fill: color, stroke: INK, 'stroke-width': 1.6 }, g);
  svgEl('path', { d: `M${px - 16} ${py - 19} L${px} ${py - 33} L${px + 16} ${py - 19} Z`, fill: color, stroke: INK, 'stroke-width': 1.6, 'fill-opacity': 0.75 }, g);
  svgEl('rect', { x: px - 3, y: py - 13, width: 6, height: 8, fill: '#fff', stroke: INK, 'stroke-width': 1 }, g);
  svgEl('circle', { cx: px, cy: py, r: 5, fill: INK, stroke: '#fff', 'stroke-width': 1.6 }, g);
  return g;
}
function router(G, x, y) {
  const [px, py] = G.toPx(x, y), g = svgEl('g', { class: 'u6l1-router' }, G.layers.top);
  svgEl('circle', { cx: px, cy: py, r: 17, fill: '#fff', stroke: INK, 'stroke-width': 2 }, g);
  for (const r of [5, 9, 13]) svgEl('path', { d: `M${px - r * 0.62} ${py + 3 - r * 0.78} A${r} ${r} 0 0 1 ${px + r * 0.62} ${py + 3 - r * 0.78}`, fill: 'none', stroke: MID, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
  svgEl('rect', { x: px - 7, y: py + 3, width: 14, height: 6, rx: 2, fill: INK }, g);
  return g;
}
const circlePath = (G, r) => G.curve(() => ({ subs: [Array.from({ length: 121 }, (_, i) => G.toPx(r * Math.cos(i * Math.PI / 60), r * Math.sin(i * Math.PI / 60)))], closed: true }), { color: TEAL, width: 3, dash: '10 7', fill: TEAL, fillOpacity: 0.07 }, 'u6l1-edge', G.layers.data);
function mountWifi() {
  const host = document.getElementById('u6l1-wifi'); if (!host) return;
  const w = Math.min(560, host.clientWidth || 560); // the one-screen layout gives it a narrower column
  const G = sqGraph(host, { xmin: -8, xmax: 8, ymin: -6, ymax: 6 }, w, w * 440 / 560, { g: { xlabels: 2, ylabels: 2 } });
  const [x0, y0] = G.toPx(-8, 6), [x1, y1] = G.toPx(8, -6);
  svgEl('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: '#eef7e6' }, G.layers.bg);
  HOUSES.forEach((d) => { house(G, d.p[0], d.p[1], d.col); G.label(d.p[0], d.p[1], `<b>${d.n}</b>`, { pos: d.pos, cls: 'u6l1-hlab', gap: 17, dy: -12 }); });
  router(G, 0, 0);
  const live = { c: null, e: null, p: null };
  const ctx = liveCtx();
  document.getElementById('u6l1-wc').addEventListener('click', async () => {
    if (live.c) { G.remove(...live.c); live.c = null; return; }
    const A = [0, 0], B = [-4, 4], C = corner(A, B);
    const run = G.segment(A, C, { color: RUN, width: 4, dash: true }), rise = G.segment(C, B, { color: RISE, width: 4, dash: true });
    const hyp = G.segment(A, B, { color: MID, width: 4.5 });
    const l1 = G.label(-2, 0, T('4'), { pos: 's', cls: 'u6l1-legl u6l1-lrun', gap: 6 }), l2 = G.label(-4, 2, T('4'), { pos: 'w', cls: 'u6l1-legl u6l1-lrise', gap: 22 });
    const l3 = G.label(-2, 2, T('\\sqrt{4^2+4^2}=\\sqrt{32}\\approx5.66'), { pos: 'ne', cls: 'u6l1-legl u6l1-lhyp', gap: 4 });
    live.c = [run, rise, hyp, l1, l2, l3];
    [l1, l2, l3].forEach(hide);
    await G.drawIn(run, 500, ctx); await appear(ctx, l1); await G.drawIn(rise, 500, ctx); await appear(ctx, l2); await G.drawIn(hyp, 600, ctx); await pop(ctx, l3);
  });
  document.getElementById('u6l1-wedge').addEventListener('click', async () => {
    if (live.e) { G.remove(...live.e); live.e = null; return; }
    const ci = circlePath(G, 5), lab = G.label(3.54, -3.54, '5 units', { pos: 'se', cls: 'u6l1-edgelab', gap: 4 });
    live.e = [ci, lab]; hide(lab);
    await G.drawIn(ci, 1100, ctx); await appear(ctx, lab);
  });
  document.getElementById('u6l1-w12').addEventListener('click', async () => {
    if (live.p) { G.remove(...live.p); live.p = null; return; }
    const pts = [[5, 0], [4, 3], [3, 4], [0, 5], [-3, 4], [-4, 3], [-5, 0], [-4, -3], [-3, -4], [0, -5], [3, -4], [4, -3]];
    live.p = pts.map((p) => G.point(p[0], p[1], { color: GRN, r: 7.5, cls: 'u6l1-edgept' }));
    live.p.forEach(hide);
    for (const p of live.p) { await pop(ctx, p, 260); await sleep(ctx, 60); }
  });
}

/* =============================== static figures =============================== */
function segFig(id, segs, win, o = {}) {
  const host = document.getElementById(id); if (!host) return null;
  const G = new Graph(host, Object.assign({ width: 400, height: 400, xlabels: 2, ylabels: 2 }, win, o));
  for (const s of segs) {
    G.segment(s[0].slice(1, 3), s[1].slice(1, 3), { color: BLUE, width: 4 });
    for (const p of s) G.point(p[1], p[2], { color: BLUE, label: T(p[0]), pos: p[3], labelColor: INK });
  }
  return G;
}
function mountStatics() {
  segFig('u6l1-ex1fig', [[['A', -5, 5, 'n'], ['B', 1, 5, 'n']], [['C', 4, 3, 'e'], ['D', 4, -4, 'e']]], { xmin: -7, xmax: 7, ymin: -7, ymax: 7 });
  segFig('u6l1-ex3fig', [[['A', -5, -2, 's'], ['B', -2, 7, 'n']], [['C', 3, 6, 'n'], ['D', 7, -4, 's']]], { xmin: -7, xmax: 9, ymin: -7, ymax: 9 });
  let G = segFig('u6l1-ex3ans', [[['A', -5, -2, 'w'], ['B', -2, 7, 'n']], [['C', 3, 6, 'n'], ['D', 7, -4, 's']]], { xmin: -7, xmax: 9, ymin: -7, ymax: 9 }, { width: 300, height: 300, fontSize: 15 });
  if (G) {
    G.segment([-5, -2], [-2, -2], { color: AMB, width: 3, dash: true }); G.segment([-2, -2], [-2, 7], { color: PUR, width: 3, dash: true });
    G.segment([3, 6], [7, 6], { color: AMB, width: 3, dash: true }); G.segment([7, 6], [7, -4], { color: PUR, width: 3, dash: true });
    G.label(-3.5, -2, T('3'), { pos: 's', color: AMB, cls: 'bk-ptlab' }); G.label(-2, 3.5, T('9'), { pos: 'w', color: PUR, cls: 'bk-ptlab' });
    G.label(5, 6, T('4'), { pos: 'n', color: AMB, cls: 'bk-ptlab' }); G.label(7, 2.5, T('10'), { pos: 'e', color: PUR, cls: 'bk-ptlab' });
  }
  const th = document.getElementById('u6l1-thmfig');
  if (th) {
    const R = new RightTriangle(th, { width: 300, height: 190, base: 4, rise: 3, right: 'br', sides: { a: 'b', b: 'a', c: 'c' }, pad: 34 });
    Object.values(R.vLabs).forEach((e) => e.remove());
    const sc = { a: PUR, b: AMB, c: BLUE };
    for (const k in sc) { R.side(k).style.color = sc[k]; if (R.sideLabs[k]) R.sideLabs[k].style.color = sc[k]; }
  }
  const grid5 = (id, w = 300, numbers = true) => { const e = document.getElementById(id); return e ? sqGraph(e, { xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5 }, w, w, { g: { xlabels: 2, ylabels: 2, numbers } }) : null; };
  G = grid5('u6l1-ex5a');
  if (G) {
    G.segment([-5, 3], [3, 3], { color: INK, width: 4.5 }); G.point(-5, 3, { color: INK, label: T('A'), pos: 'n' }); G.point(3, 3, { color: INK, label: T('B'), pos: 'n' });
    G = grid5('u6l1-ex5b');
    G.segment([-2, -3], [4, 5], { color: INK, width: 4.5 }); G.point(4, 5, { color: INK, label: T('E'), pos: 'w' }); G.point(-2, -3, { color: INK, label: T('F'), pos: 'e' });
    G = grid5('u6l1-ex5aA', 260, false); G.segment([-5, 3], [3, 3], { color: INK, width: 4.5 }); G.point(-5, 3, { color: INK, label: T('A'), pos: 'w' }); G.point(3, 3, { color: INK, label: T('B'), pos: 'e' });
    G.segment([-5, 4.5], [-1, 4.5], { color: MID, width: 2.5, arrowA: true, arrowB: true }); G.segment([-1, 4.5], [3, 4.5], { color: MID, width: 2.5, arrowA: true, arrowB: true });
    G.label(-3, 4.5, T('4'), { pos: 'n', color: MID, gap: 2 }); G.label(1.5, 4.5, T('4'), { pos: 'n', color: MID, gap: 2 });
    G.point(-1, 3, { color: MID, label: T('M(-1,\\ 3)'), pos: 's' });
    G = grid5('u6l1-ex5bA', 260, false); G.segment([-2, -3], [4, 5], { color: INK, width: 4.5 });
    G.segment([-2, -3], [-2, 1], { color: RISE, width: 3, dash: true }); G.segment([-2, 1], [1, 1], { color: RUN, width: 3, dash: true });
    G.segment([1, 1], [1, 5], { color: RISE, width: 3, dash: true }); G.segment([1, 5], [4, 5], { color: RUN, width: 3, dash: true });
    G.label(-2, -1, T('4'), { pos: 'w', color: RISE, cls: 'bk-ptlab' }); G.label(-0.5, 1, T('3'), { pos: 'n', color: RUN, cls: 'bk-ptlab' });
    G.label(1, 3, T('4'), { pos: 'w', color: RISE, cls: 'bk-ptlab' }); G.label(2.5, 5, T('3'), { pos: 'n', color: RUN, cls: 'bk-ptlab' });
    G.point(4, 5, { color: INK, label: T('E'), pos: 'e' }); G.point(-2, -3, { color: INK, label: T('F'), pos: 'e' });
    G.point(1, 1, { color: MID, label: T('M(1,\\ 1)'), pos: 'e' });
  }
}

/* ======================================================================================
 * Explainer: count the squares, or subtract (horizontal and vertical segments)
 * ====================================================================================== */
// each segment: P1 → P2; the difference shown is (coordinate of P2) − (coordinate of P1)
const LEN = {
  demoH: { label: 'Horizontal demo', segs: [{ name: 'RS', P1: ['R', -3, 3], P2: ['S', 5, 3] }] },
  demoV: { label: 'Vertical: turn it 90°', turn: true, segs: [{ name: 'RS', P1: ['R', -1, -2], P2: ['S', -1, 4] }] },
  ex1: { label: 'Example 1 check', segs: [{ name: 'AB', P1: ['A', -5, 5], P2: ['B', 1, 5] }, { name: 'CD', P1: ['D', 4, -4], P2: ['C', 4, 3] }] },
  ex2: { label: 'Example 2 check', fresh: true, segs: [{ name: 'PQ', P1: ['P', 5, -2], P2: ['Q', -4, -2] }, { name: 'UV', P1: ['U', 3, -2], P2: ['V', 3, -11] }] }
};
const lengths = {
  title: 'Count the squares, or subtract the coordinates',
  height: 480,
  minW: 950, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(LEN).map((k) => ({ v: k, label: LEN[k].label })),
  intro: (k) => (LEN[k].turn ? 'The same two ways, for a vertical segment. Press <b>Next</b>.' : 'Two ways to measure a horizontal or vertical segment. Do they always agree? Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = LEN[k], GW = 460, segs = d.segs.map((s) => Object.assign({}, s, { H: s.P1[2] === s.P2[2] }));
    const pts = segs.flatMap((s) => [s.P1.slice(1), s.P2.slice(1)]).concat([[-6, -6], [6, 6]], d.turn ? [[-4, 1], [2, 1]] : []);
    const G = new Graph(stage, Object.assign({ x: 8, y: 10, width: GW, height: 460, xlabels: 2, ylabels: 2 }, fitWin(pts, GW, 460, 1)));
    const P = panel(stage, GW + 28, 10, ex.W - GW - 36, 460, 'Count or subtract');
    const tb = h('div', 'u6l1-ct', `<div class="u6l1-cth">seg.</div><div class="u6l1-cth">count</div><div class="u6l1-cth">subtract</div>`); P.appendChild(tb);
    let hops = [], drops = [];
    const steps = [];
    // label sides: labels away from the axis the drop lines go to; hops and the length pill toward it
    const labPos = (s, p) => (s.H ? (p[2] > 0 ? 'n' : 's') : (p[1] > 0 ? 'e' : 'w'));
    const hopSide = (s) => (s.H ? [0, s.P1[2] > 0 ? 1 : -1] : [s.P1[1] > 0 ? -1 : 1, 0]);
    const drawSeg = (s, c) => {
      const A = s.P1.slice(1), B = s.P2.slice(1);
      s.seg = G.segment(A, B, { color: BLUE, width: 4.5 });
      s.pA = G.point(...A, { color: BLUE, label: T(s.P1[0]), pos: labPos(s, s.P1), labelColor: INK });
      s.pB = G.point(...B, { color: BLUE, label: T(s.P2[0]), pos: labPos(s, s.P2), labelColor: INK });
      return Promise.all([G.drawIn(s.seg, 500, c), G.reveal(s.pA, c), G.reveal(s.pB, c)]);
    };
    if (d.turn) {
      const s = segs[0], A0 = [-4, 1], B0 = [2, 1], C0 = [-1, 1], A = A0.slice(), B = B0.slice();
      steps.push({ cap: 'Start with a <b>horizontal</b> segment, 6 units long.',
        run: async (c) => { s.seg = G.segment(A, B, { color: BLUE, width: 4.5 }); s.pA = G.point(...A, { color: BLUE }); s.pB = G.point(...B, { color: BLUE }); await G.drawIn(s.seg, 500, c); await Promise.all([G.reveal(s.pA, c), G.reveal(s.pB, c)]); } });
      steps.push({ cap: `Turn it ${T('90^\\circ')} about its middle. Now it is <b>vertical</b>: both endpoints share the same <b>x</b>-coordinate.`,
        run: async (c) => {
          await tween(c, 1200, (t) => {
            const a = t * Math.PI / 2, cs = Math.cos(a), sn = Math.sin(a);
            const rot = (p0, p) => { const dx = p0[0] - C0[0], dy = p0[1] - C0[1]; p[0] = C0[0] + dx * cs - dy * sn; p[1] = C0[1] + dx * sn + dy * cs; };
            rot(A0, A); rot(B0, B); s.seg._bkDraw(); G.moveTo(s.pA, ...A); G.moveTo(s.pB, ...B);
          });
          G.remove(s.pA, s.pB);
          s.pA = G.point(...s.P1.slice(1), { color: BLUE, label: T(s.P1[0]), pos: 'w', labelColor: INK }); s.pB = G.point(...s.P2.slice(1), { color: BLUE, label: T(s.P2[0]), pos: 'w', labelColor: INK });
          await Promise.all([fadeIn(c, s.pA.label), fadeIn(c, s.pB.label)]);
        } });
    }
    segs.forEach((s, i) => {
      const H = s.H, X = H ? 'x' : 'y', Y = H ? 'y' : 'x', col = H ? AMB : PUR, ci = H ? 1 : 2, word = H ? 'right minus left' : 'upper minus lower';
      const a = s.P1[ci], b = s.P2[ci], diff = b - a, len = Math.abs(diff), neg = diff < 0;
      const A = s.P1.slice(1), B = s.P2.slice(1);
      const subT = `${X}_{${s.P2[0]}}-${X}_{${s.P1[0]}}=${minus(b, a)}=${tn(diff)}`;
      let cells;
      steps.push({
        cap: `${T(s.name)} is <b>${H ? 'horizontal' : 'vertical'}</b>. Count the squares from ${T(s.P1[0])} to ${T(s.P2[0])}: <b>${len}</b>.`,
        run: async (c) => {
          G.remove(...hops, ...drops); hops = []; drops = [];
          if (d.fresh && i > 0) { const q = segs[i - 1]; G.remove(q.seg, q.pA, q.pB, q.pA.label, q.pB.label, q.pill); }
          if (!s.seg) await drawSeg(s, c);
          hops = await countHops(G, c, A, B, { color: col, side: hopSide(s) });
          cells = [h('div', 'u6l1-ctn', T(s.name)), h('div', 'u6l1-ctn', `<span style="color:${col}">${len}</span>`), h('div', '', '')];
          cells.forEach((e) => tb.appendChild(e)); await Promise.all(cells.slice(0, 2).map((e) => show(c, e)));
        }
      });
      steps.push({
        cap: neg
          ? `${T(ptT(...s.P1))} and ${T(ptT(...s.P2))}: same ${T(Y)}. Subtract the ${T(X)}’s in the order given: ${T(`${minus(b, a)}=${tn(diff)}`)}. <b>Negative!</b>`
          : `${T(ptT(...s.P1))} and ${T(ptT(...s.P2))}: same ${T(Y)}. Subtract the ${T(X)}’s, ${word}: ${T(`${minus(b, a)}=${diff}`)}. The <b>same</b> as the count.`,
        run: async (c) => {
          G.remove(...hops); hops = [];
          const [nx, ny] = hopSide(s), at = (t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
          // the length pill halfway along, unless that lands on the axis it runs along (then a quarter of the way)
          const ci2 = H ? 0 : 1, m = [0.5, 0.25, 0.75].map(at).find((q) => Math.abs(q[ci2]) >= 1.2) || at(0.5);
          s.pill = G.label(...m, T(String(len)), { cls: 'u6l1-pill', color: col, dx: nx * 24, dy: ny * 24 });
          G.remove(s.pA.label, s.pB.label);
          const lA = G.label(...A, T(ptT(...s.P1)), { pos: labPos(s, s.P1), cls: 'bk-ptlab', gap: 6 }), lB = G.label(...B, T(ptT(...s.P2)), { pos: labPos(s, s.P2), cls: 'bk-ptlab', gap: 6 });
          s.pA.label = lA; s.pB.label = lB;
          for (const p of [A, B]) {
            const v = H ? p[0] : p[1], ln = G.segment(p, H ? [p[0], 0] : [0, p[1]], { color: 'gray', width: 2, dash: '5 5' });
            const pl = G.label(H ? p[0] : 0, H ? 0 : p[1], T(tn(v)), { cls: 'u6l1-pill', color: col });
            drops.push(ln, pl);
          }
          await Promise.all([pop(c, s.pill), fadeIn(c, lA), fadeIn(c, lB)]);
          for (const e of drops) await (e.classList.contains('bk-curve') ? G.drawIn(e, 300, c) : pop(c, e, 260));
          cells[2].innerHTML = T(neg ? subT : `${subT}\\ \\checkmark`); if (neg) cells[2].classList.add('u6l1-cr');
          await show(c, cells[2]);
        }
      });
      if (neg) steps.push({
        cap: `A length can’t be negative. Take the size: ${T(`|${tn(diff)}|=${len}`)}, just like the count. The sign only told us <b>which way</b> we walked.`,
        run: async (c) => { cells[2].classList.remove('u6l1-cr'); cells[2].innerHTML = T(`|${minus(b, a)}|=|${tn(diff)}|=${len}\\ \\checkmark`); await pulse(c, cells[2], 1.06); }
      });
    });
    const kinds = [...new Set(segs.map((s) => s.H))];
    steps.push({
      cap: kinds.length > 1 ? `No grid? Subtract the coordinates that change. <b>Horizontal:</b> ${T('|x_2-x_1|')}. <b>Vertical:</b> ${T('|y_2-y_1|')}.`
        : kinds[0] ? `No grid? Subtract. <b>Length</b> ${T('=|x_2-x_1|')}: the ${T('y')}-coordinates play no part.` : `<b>Length</b> ${T('=|y_2-y_1|')}: the ${T('x')}-coordinates play no part. Same idea, turned ${T('90^\\circ')}.`,
      run: async (c) => {
        G.remove(...drops); drops = [];
        const r = h('div', 'u6l1-rule', kinds.map((H) => `<div class="${H ? 'u6l1-ca' : 'u6l1-cp'}"><b>${H ? 'Horizontal' : 'Vertical'}:</b> length ${T(H ? '=|x_2-x_1|' : '=|y_2-y_1|')}</div>`).join(''));
        P.appendChild(r); await pop(c, r);
      }
    });
    return steps;
  }
};

/* ======================================================================================
 * Explainer 6 (the star): the right triangle hidden under a slanted segment
 * ====================================================================================== */
const HID = {
  demo: { label: 'Demo: run 4, rise 3', A: ['P', -3, -1], B: ['Q', 1, 2] },
  ex3a: { label: 'Example 3(a) check: AB', A: ['A', -5, -2], B: ['B', -2, 7] },
  ex3b: { label: 'Example 3(b) check: CD', A: ['C', 3, 6], B: ['D', 7, -4] },
  warm: { label: 'Warm-up: house C', A: ['O', 0, 0], B: ['C', -4, 4] }
};
const hidden = {
  title: 'The right triangle hiding under a slanted segment',
  height: 500,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(HID).map((k) => ({ v: k, label: HID[k].label })),
  intro: 'A slanted segment has no row of squares to count. But it hides something. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = HID[k], [nA, xA, yA] = d.A, [nB, xB, yB] = d.B, A = [xA, yA], B = [xB, yB], K = [xB, yA], name = nA + nB;
    const run = Math.abs(xB - xA), rise = Math.abs(yB - yA), c2 = run * run + rise * rise, [rk, rm] = simpRad(c2), cDec = Math.sqrt(c2);
    const up = yB > yA, sy = up ? 1 : -1, sx = xB > xA ? 1 : -1;
    // outward squares: run square away from B (vertically), rise square away from A (horizontally), hypotenuse square away from K
    const runN = [0, -sy * run], riseN = [sx * rise, 0];
    const v = [xB - xA, yB - yA]; let hn = [-v[1], v[0]]; if (hn[0] * (K[0] - xA) + hn[1] * (K[1] - yA) > 0) hn = [v[1], -v[0]];
    const corners = [A, B, K, [A[0] + runN[0], A[1] + runN[1]], [K[0] + runN[0], K[1] + runN[1]], [K[0] + riseN[0], K[1] + riseN[1]], [B[0] + riseN[0], B[1] + riseN[1]], [A[0] + hn[0], A[1] + hn[1]], [B[0] + hn[0], B[1] + hn[1]]];
    const GW = 600, GH = 480;
    const win0 = fitWin([A, B, K, [-5, -5], [5, 5]], GW, GH, 2), win1 = fitWin(corners, GW, GH, 1);
    const G = new Graph(stage, Object.assign({ x: 6, y: 12, width: GW, height: GH }, win0));
    const P = panel(stage, GW + 22, 5, ex.W - GW - 28, GH, 'Run, rise, Pythagoras');
    const exact = rm === 1 ? `${rk}` : `\\sqrt{${c2}}=${rk === 1 ? '' : `\\sqrt{${rk * rk}\\times${rm}}=`}${radTex(c2)}`;
    const dec = Math.abs(cDec - Math.round(cDec)) < 1e-9 ? '' : `\\approx${cDec.toFixed(2)}`;
    const st = { r: 0, s: 0 }, sq = { a: 0, b: 0, c: 0 };
    const ends = [];
    let corner, legR, legS, ra, hopsR = [], hopsS = [], pillR, pillS, labA, labB, labC;
    const PX = (p) => G.toPx(p[0], p[1]);
    const square = (key, p, q, n, color) => G.curve(() => { const t = sq[key], a = PX(p), b = PX(q), c = PX([q[0] + n[0] * t, q[1] + n[1] * t]), e = PX([p[0] + n[0] * t, p[1] + n[1] * t]); return { subs: [[a, b, c, e]], closed: true }; },
      { color, width: 3, fill: color, fillOpacity: 0.15 }, 'u6l1-sq', G.layers.data);
    const cen = (p, q, n) => [(p[0] + q[0] + n[0]) / 2, (p[1] + q[1] + n[1]) / 2];
    return [
      { cap: `Segment ${T(name)} from ${T(ptT(nA, xA, yA))} to ${T(ptT(nB, xB, yB))}. It is <b>slanted</b>: there is no row of squares to count along.`,
        run: async (c) => {
          const s = G.segment(A, B, { color: BLUE, width: 5 }); await G.drawIn(s, 700, c);
          for (const [n, x, y] of [d.A, d.B]) { const p = G.point(x, y, { color: BLUE, label: T(ptT(n, x, y)), pos: (y === Math.max(yA, yB)) ? 'n' : 's', labelColor: INK }); ends.push([p, n]); await G.reveal(p, c); }
        } },
      { cap: `Every slanted segment hides a <b>right triangle</b>. Slide straight across from ${T(nA)} (the <b class="u6l1-ca">run</b>), then ${up ? 'up' : 'down'} to ${T(nB)} (the <b class="u6l1-cp">rise</b>).`,
        run: async (c) => {
          legR = G.curve(() => ({ subs: [[PX(A), PX([xA + (K[0] - xA) * st.r, yA])]] }), { color: AMB, width: 5 }, 'u6l1-leg', G.layers.data);
          legS = G.curve(() => ({ subs: [[PX(K), PX([K[0], yA + (yB - yA) * st.s])]] }), { color: PUR, width: 5 }, 'u6l1-leg', G.layers.data);
          corner = G.point(...A, { color: INK, r: 6 });
          await tween(c, 1100, (t) => { st.r = t; legR._bkDraw(); G.moveTo(corner, xA + (K[0] - xA) * t, yA); });
          await tween(c, 1100, (t) => { st.s = t; legS._bkDraw(); G.moveTo(corner, K[0], yA + (yB - yA) * t); });
          G.remove(corner); ra = rightAngle(G, K, A, B); await appear(c, ra);
        } },
      { cap: `Count the <b class="u6l1-ca">run</b>: <b>${run}</b> squares. Or subtract the ${T('x')}’s: ${T(`|${minus(xB, xA)}|=${run}`)}.`,
        run: async (c) => {
          hopsR = await countHops(G, c, A, K, { color: AMB, side: [0, sy] });
          await show(c, line(P, `<b>run</b> ${T(`a=|${minus(xB, xA)}|=${run}`)}`, 'u6l1-ca'));
        } },
      { cap: `Count the <b class="u6l1-cp">rise</b>: <b>${rise}</b> squares. Or subtract the ${T('y')}’s: ${T(`|${minus(yB, yA)}|=${rise}`)}.`,
        run: async (c) => {
          hopsS = await countHops(G, c, K, B, { color: PUR, side: [sx, 0], ms: 120 });
          await show(c, line(P, `<b>rise</b> ${T(`b=|${minus(yB, yA)}|=${rise}`)}`, 'u6l1-cp'));
        } },
      { cap: `Build a <b>square</b> on each leg. Count the little squares inside: ${T(`a^2=${run * run}`)} and ${T(`b^2=${rise * rise}`)}.`,
        run: async (c) => {
          G.remove(...hopsR, ...hopsS); hopsR = []; hopsS = [];
          for (const [p, n] of ends) p.label.innerHTML = T(n);
          await G.setWindow(win1, c, 900);
          const sa = square('a', A, K, runN, AMB); await tween(c, 700, (t) => { sq.a = t; sa._bkDraw(); });
          labA = G.label(...cen(A, K, runN), T(`a^2=${run * run}`), { cls: 'u6l1-sqlab', color: AMB }); await pop(c, labA);
          const sb = square('b', K, B, riseN, PUR); await tween(c, 800, (t) => { sq.b = t; sb._bkDraw(); });
          labB = G.label(...cen(K, B, riseN), T(`b^2=${rise * rise}`), { cls: 'u6l1-sqlab', color: PUR }); await pop(c, labB);
        } },
      { cap: `Now a square on the slanted side, the <b class="u6l1-cb">hypotenuse</b>. Its area is ${T('c^2')}: too awkward to count.`,
        run: async (c) => {
          const sc = square('c', A, B, hn, BLUE); await tween(c, 900, (t) => { sq.c = t; sc._bkDraw(); });
          labC = G.label(...cen(A, B, hn), T('c^2=\\ ?'), { cls: 'u6l1-sqlab', color: BLUE }); await pop(c, labC);
        } },
      { cap: `Pythagoras: the two leg squares <b>together</b> have exactly the area of the big one. ${T(`${run * run}+${rise * rise}=${c2}`)}, so ${T(`c^2=${c2}`)}.`,
        run: async (c) => {
          for (const s of ['a^2+b^2=c^2', `${run}^2+${rise}^2=c^2`, `${run * run}+${rise * rise}=c^2`, `${c2}=c^2`]) await show(c, line(P, T(s)));
          labC.innerHTML = T(`c^2=${c2}`); await pulse(c, labC, 1.2);
        } },
      { cap: `So ${exact.split('=').map((e, i) => T(i ? '=' + e : `${name}=${e}`)).join('\u200b')}${dec ? `, or ${T(dec)}` : ''} units.${rm === 1 ? ' A whole number this time!' : ''}`,
        run: async (c) => {
          // the exact value on two lines when it is a chain (AB = √90, then = √(9 × 10) = 3√10), so it fits the panel
          const ch = exact.split('=');
          await show(c, line(P, `${T(`${name}=${ch[0]}`)}`, 'u6l1-cb'));
          if (ch.length > 1) await show(c, line(P, `${T('=' + ch.slice(1).join('='))}`, 'u6l1-cb'));
          if (dec) await show(c, line(P, `${T(`${name}${dec}`)} units`, 'u6l1-cb'));
          const sp = stamp(P, `${name} = ${rm === 1 ? rk : (rk === 1 ? '' : rk) + '√' + rm}`, { ok: true, size: 'sm' }); sp.style.alignSelf = 'center'; sp.style.marginTop = 'auto'; await stampIn(c, sp);
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 8: simplest radical form
 * ====================================================================================== */
const SR = { r72: { label: 'Demo: √72', n: 72 }, r90: { label: 'Example 3(a): √90', n: 90 }, r116: { label: 'Example 3(b): √116', n: 116 } };
const simplify = {
  title: 'Simplest radical form: find the biggest perfect square',
  height: 420,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SR).map((k) => ({ v: k, label: SR[k].label })),
  intro: 'Is there a perfect square hiding under the root? Press <b>Next</b>.',
  make(stage, key, ex) {
    const n = SR[key].n, [k, m] = simpRad(n), ks = [];
    for (let j = 2; j * j <= n; j++) ks.push(j);
    const fits = ks.filter((j) => n % (j * j) === 0), tw = 84, gap = 12, x0 = (ex.W - ks.length * (tw + gap) + gap) / 2, ty = 70;
    const head = lab(stage, ex.W / 2, 26, T(`\\sqrt{${n}}`), 'u6l1-big'); head.style.fontSize = '34px';
    const tiles = ks.map((j, i) => { const t = add(stage, h('div', 'u6l1-tile', `<div class="u6l1-tn">${j * j}</div><div class="u6l1-ts">${T(`${j}^2`)}</div>`), x0 + i * (tw + gap), ty); return hide0(t); });
    const qs = ks.map((j, i) => { const q = n / (j * j), ok = Number.isInteger(q); const e = add(stage, h('div', 'u6l1-tq', `${String(+q.toFixed(2)).replace('.', '.')}<br><b class="${ok ? 'u6l1-cg' : 'u6l1-cr'}">${ok ? '✓' : '✗'}</b>`), x0 + i * (tw + gap), ty + tw + 6); return hide0(e); });
    const e1 = hide0(lab(stage, ex.W / 2, 268, '', 'u6l1-steq')), e2 = hide0(lab(stage, ex.W / 2, 330, '', 'u6l1-steq')), e3 = hide0(lab(stage, ex.W / 2, 386, '', 'u6l1-steq'));
    const sq = Math.sqrt(n), fitWord = fits.length > 1 ? `Several fit (${fits.map((j) => j * j).join(', ')}). Use the <b>biggest</b>` : `Only ${k * k} fits`;
    return [
      { cap: `Simplify ${T(`\\sqrt{${n}}`)}. Here are the perfect squares up to ${n}.`,
        run: async (c) => { for (const t of tiles) await pop(c, t, 220); } },
      { cap: `Divide ${n} by each one. A whole-number answer (green) means that square <b>divides ${n} evenly</b>.`,
        run: async (c) => { for (let i = 0; i < ks.length; i++) { const ok = fits.includes(ks[i]); tiles[i].classList.add(ok ? 'u6l1-yes' : 'u6l1-no'); await fadeIn(c, qs[i], 200); } } },
      { cap: `${fitWord}: ${T(`${n}=${k * k}\\times${m}`)}.`,
        run: async (c) => { tiles[ks.indexOf(k)].classList.add('u6l1-best'); await pulse(c, tiles[ks.indexOf(k)], 1.12); e1.innerHTML = T(`\\sqrt{${n}}=\\sqrt{${k * k}\\times${m}}`); await show(c, e1); } },
      { cap: `The root splits: ${T(`\\sqrt{${k * k}}\\times\\sqrt{${m}}`)}, and ${T(`\\sqrt{${k * k}}=${k}`)} comes out front: ${T(`\\sqrt{${n}}=${k}\\sqrt{${m}}`)}.`,
        run: async (c) => { e2.innerHTML = T(`=\\sqrt{${k * k}}\\times\\sqrt{${m}}=\\boldsymbol{${k}\\sqrt{${m}}}`); await show(c, e2); } },
      { cap: `Decimal (calculator): ${T(`\\sqrt{${n}}\\approx${sq.toFixed(4)}`)}, so ${T(`\\approx${sq.toFixed(2)}`)} to the nearest hundredth. Round only at the end.`,
        run: async (c) => { e3.innerHTML = T(`\\approx${sq.toFixed(4)}\\ldots\\approx\\boldsymbol{${sq.toFixed(2)}}`); await show(c, e3); } }
    ];
  }
};

/* =============================== explainer: lifting the triangle into symbols =============================== */
const LIFT = {
  sym: { label: 'Any two points', sym: true, A: [2, 2], B: [9, 7], win: { xmin: 0, xmax: 10.5, ymin: 0, ymax: 8.5 } },
  demo: { label: `Demo: ${T('P(3,\\ -4)')} to ${T('Q(9,\\ 4)')}`, A: [3, -4], B: [9, 4], nA: 'P', nB: 'Q', win: { xmin: -1, xmax: 12, ymin: -6, ymax: 6 },
    run: ['x_2-x_1=9-3=6', '6'], rise: ['y_2-y_1=4-(-4)=8', '8'], slots: ['PQ^2=', '6^2', '8^2'], after: ['PQ=\\sqrt{36+64}', '=\\sqrt{100}=10'], stamp: 'PQ = 10', riseT: 0.75 },
  ex4a: { label: 'Example 4(a) check', A: [-15, 6], B: [-9, -6], nA: 'G', nB: 'H', win: { xmin: -17, xmax: 1, ymin: -8, ymax: 8 },
    run: ['x_2-x_1=-9-(-15)=6', '6'], rise: ['y_2-y_1=-6-6=-12', '-12'], slots: ['GH^2=', '6^2', '(-12)^2'], after: ['GH=\\sqrt{36+144}=\\sqrt{180}', '=\\sqrt{36\\times5}=6\\sqrt5'], stamp: 'GH = 6√5', down: true, riseT: 0.25 }
};
const lift = {
  title: 'The distance formula: lift the triangle into symbols',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(LIFT).map((k) => ({ v: k, label: LIFT[k].label })),
  intro: (k) => (LIFT[k].sym ? 'The same right triangle, but for <b>any</b> two points. Press <b>Next</b>.' : k === 'demo' ? 'The triangle, then the formula. Press <b>Next</b>.' : 'Check the example: the triangle, then the formula. Press <b>Next</b>.'),
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
            const t1 = G.label(A[0], 0, T('x_1'), { pos: 's', cls: 'u6l1-axl', gap: 6 }), t2 = G.label(B[0], 0, T('x_2'), { pos: 's', cls: 'u6l1-axl', gap: 6 });
            await Promise.all([pop(c, t1), pop(c, t2)]);
            await G.drawIn(G.segment([A[0], 0], [B[0], 0], { color: RUN, width: 8, opacity: 0.6, cap: 'butt' }), 600, c);
            legs.run = legLabel(G, A, B, 'run', T('x_2-x_1')); await pop(c, legs.run);
          } },
        { cap: `<b>Rise:</b> across to the ${T('y')}-axis. From ${T('y_1')} up to ${T('y_2')} is ${T('y_2-y_1')}.`,
          run: async (c) => {
            const g1 = G.segment(A, [0, A[1]], { color: 'gray', width: 2, dash: '5 5' }), g2 = G.segment(B, [0, B[1]], { color: 'gray', width: 2, dash: '5 5' });
            await Promise.all([G.drawIn(g1, 500, c), G.drawIn(g2, 500, c)]);
            const t1 = G.label(0, A[1], T('y_1'), { pos: 'w', cls: 'u6l1-axl', gap: 8 }), t2 = G.label(0, B[1], T('y_2'), { pos: 'w', cls: 'u6l1-axl', gap: 8 });
            await Promise.all([pop(c, t1), pop(c, t2)]);
            await G.drawIn(G.segment([0, A[1]], [0, B[1]], { color: RISE, width: 8, opacity: 0.6, cap: 'butt' }), 600, c);
            legs.rise = legLabel(G, A, B, 'rise', T('y_2-y_1')); await pop(c, legs.rise);
          } },
        { cap: `Pythagoras: ${T('d^2=\\text{run}^2+\\text{rise}^2')}. Lift the two legs off the grid and into the equation.`,
          run: async (c) => {
            await show(c, line(P, T('c^2=a^2+b^2'), 'u6l1-mute'));
            const L = slotLine(P, ['d^2=', { slot: '(x_2-x_1)^2' }, '+', { slot: '(y_2-y_1)^2' }]);
            await show(c, L.el);
            await fly(c, stage, legs.run, L.slots[0]); await fly(c, stage, legs.rise, L.slots[1]);
          } },
        { cap: `Take the square root of both sides: that is the <b>distance formula</b>. Run squared, plus rise squared, square-rooted.`,
          run: async (c) => { const f = line(P, T('d=\\sqrt{(\\textcolor{#c27a0e}{x_2-x_1})^2+(\\textcolor{#7b4fc4}{y_2-y_1})^2}'), 'u6l1-boxed'); await pop(c, f, 500); } }
      ];
    }
    const nm = (n, p) => T(n + P2(p[0], p[1]));
    return [
      { cap: `${nm(d.nA, A)} and ${nm(d.nB, B)}. Call ${T(d.nA)} point 1 and ${T(d.nB)} point 2.`,
        run: async (c) => { const s = G.segment(A, B, { color: SEG, width: 5 }); await G.drawIn(s, 700, c); await G.reveal(G.point(...A, { color: SEG, label: nm(d.nA, A), pos: 's' }), c); await G.reveal(G.point(...B, { color: SEG, label: nm(d.nB, B), pos: B[1] > A[1] ? 'n' : 's' }), c); } },
      { cap: `The corner: ${T('(x_2,\\ y_1)=' + P2(C[0], C[1]))}, ${B[1] > A[1] ? 'below' : 'above'} ${T(d.nB)} and across from ${T(d.nA)}.`,
        run: async (c) => { await drawLegs(G, c, A, B); await G.reveal(G.point(...C, { color: INK, label: T(P2(C[0], C[1])), pos: B[1] > A[1] ? 's' : 'n' }), c); } },
      { cap: `<b>Run:</b> ${T(d.run[0])}.`,
        run: async (c) => { legs.run = legLabel(G, A, B, 'run', T(d.run[1])); await pop(c, legs.run); await show(c, line(P, T(d.run[0]), 'u6l1-trun')); } },
      { cap: `<b>Rise:</b> ${T(d.rise[0])}${d.down ? ' (12 down)' : ''}.`,
        run: async (c) => { legs.rise = legLabel(G, A, B, 'rise', T(d.rise[1]), { t: d.riseT }); await pop(c, legs.rise); await show(c, line(P, T(d.rise[0]), 'u6l1-trise')); } },
      { cap: `Lift the legs into Pythagoras: ${T(d.slots[0] + d.slots[1] + '+' + d.slots[2])}.`,
        run: async (c) => { const L = slotLine(P, [d.slots[0], { slot: d.slots[1] }, '+', { slot: d.slots[2] }]); await show(c, L.el); await fly(c, stage, legs.run, L.slots[0]); await fly(c, stage, legs.rise, L.slots[1]); } },
      { cap: `${T(d.after.join(''))}.`,
        run: async (c) => { for (const s of d.after) await show(c, line(P, T(s))); const s = stamp(P, d.stamp); s.style.alignSelf = 'center'; s.style.marginTop = '8px'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: Example 2 on a map =============================== */
function tower(G, x, y) {
  const [px, py] = G.toPx(x, y), g = svgEl('g', { class: 'u6l1-tower' }, G.layers.top);
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
  title: 'Example 4(b) check: the two cell towers',
  height: 480,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  intro: 'A coordinate grid over a city map: 1 unit = 1 km. Press <b>Next</b>.',
  make(stage, k, ex) {
    const H = ex.def.height, A = [-52, 134], B = [89, 61], C = corner(A, B);
    const G = sqGraph(stage, { xmin: -70, xmax: 110, ymin: 0, ymax: 160 }, 540, H - 20, { x: 10, y: 10, center: true, g: { xstep: 10, ystep: 10, xlabels: 20, ylabels: 20 } });
    const bg = G.layers.bg, Pp = (x, y) => G.toPx(x, y).map((v) => v.toFixed(1)).join(' ');
    svgEl('path', { d: `M${Pp(-70, 30)} C${Pp(-20, 60)} ${Pp(10, 0)} ${Pp(50, 40)} S${Pp(90, 120)} ${Pp(110, 110)}`, stroke: '#9ccbee', 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }, bg);
    const [p0x, p0y] = G.toPx(-40, 100), [p1x, p1y] = G.toPx(-10, 75);
    svgEl('rect', { x: p0x, y: p0y, width: p1x - p0x, height: p1y - p0y, rx: 8, fill: '#cfe8c4' }, bg);
    for (const [a, b] of [[[-70, 90], [110, 90]], [[30, 0], [30, 160]], [[-70, 150], [110, 150]]]) svgEl('line', { x1: G.toPx(...a)[0], y1: G.toPx(...a)[1], x2: G.toPx(...b)[0], y2: G.toPx(...b)[1], stroke: '#d8d2c4', 'stroke-width': 6 }, bg);
    G.label(-25, 87.5, 'park', { cls: 'u6l1-mapl' }); G.label(68, 92, 'river', { cls: 'u6l1-mapl u6l1-mapr' });
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
        run: async (c) => { await pop(c, legLabel(G, A, B, 'run', T('141'))); await show(c, line(P, T('x_2-x_1=89-(-52)=141'), 'u6l1-trun')); } },
      { cap: `<b>Rise:</b> ${T('y_2-y_1=61-134=-73')}: 73 km down.`,
        run: async (c) => { await pop(c, legLabel(G, A, B, 'rise', T('-73'), { pos: 'w' })); await show(c, line(P, T('y_2-y_1=61-134=-73'), 'u6l1-trise')); } },
      { cap: `Square, add, and take the square root: ${T('d=\\sqrt{141^2+(-73)^2}=\\sqrt{25\\,210}')}.`,
        run: async (c) => { for (const s of ['d=\\sqrt{141^2+(-73)^2}', '=\\sqrt{19\\,881+5329}', '=\\sqrt{25\\,210}']) await show(c, line(P, T(s))); } },
      { cap: `${T('\\sqrt{25\\,210}\\approx158.78')}, so the towers are about <b>159 km</b> apart.`,
        run: async (c) => { await pop(c, line(P, T('\\approx158.78'), 'u6l1-big')); const s = stamp(P, '≈ 159 km'); s.style.alignSelf = 'center'; s.style.marginTop = '8px'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: count from both ends =============================== */
const CNT = {
  a: { label: 'Example 5(a) check', A: [-5, 3], B: [3, 3], nA: 'A', nB: 'B', ax: 'x', min: -6, max: 4, avg: '\\dfrac{-5+3}{2}=\\dfrac{-2}{2}=-1' },
  b: { label: `Vertical: ${T('C(2,\\ 5)')} to ${T('D(2,\\ -3)')}`, A: [2, 5], B: [2, -3], nA: 'C', nB: 'D', ax: 'y', min: -4, max: 6, avg: '\\dfrac{5+(-3)}{2}=\\dfrac{2}{2}=1' },
  odd: { label: `An odd count: ${T('(-5,\\ -2)')} to ${T('(2,\\ -2)')}`, A: [-5, -2], B: [2, -2], nA: 'P', nB: 'Q', ax: 'x', min: -6, max: 3, avg: '\\dfrac{-5+2}{2}=\\dfrac{-3}{2}=-1.5' }
};
const midcount = {
  title: 'Count from both ends',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(CNT).map((k) => ({ v: k, label: CNT[k].label })),
  intro: 'Two walkers start at the ends and step toward each other, one square at a time. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CNT[k], A = d.A, B = d.B, H = ex.def.height, hz = d.ax === 'x', M = mid(A, B), n = Math.abs(hz ? B[0] - A[0] : B[1] - A[1]);
    const G = sqGraph(stage, { xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5 }, 450, H - 20, { x: 10, y: 10, center: true, g: { xlabels: 2, ylabels: 2 } });
    const P = panel(stage, G.W + 30, 14, ex.W - G.W - 44, H - 28, `The ${T(d.ax)}-coordinates on a number line`);
    const share = hz ? `same ${T('y')}` : `same ${T('x')}`, cA = hz ? A[0] : A[1], cB = hz ? B[0] : B[1], cM = hz ? M[0] : M[1];
    let w1, w2;
    const dot = (p) => { const g = svgEl('circle', { r: 11, fill: RUN, stroke: '#fff', 'stroke-width': 3, class: 'u6l1-wdot' }, G.layers.top); g.at = p.slice(); g.place = (x, y) => { g.at = [x, y]; const [px, py] = G.toPx(x, y); g.setAttribute('cx', px); g.setAttribute('cy', py); }; g.place(...p); return g; };
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
          for (const [p, q] of segs) { await G.drawIn(G.segment(p, q, { color: MID, width: 2.5, arrowA: true, arrowB: true }), 400, c); const mm = mid(p, q); await pop(c, G.label(...mm, T(String(half(n))), { pos: hz ? 's' : 'w', color: MID, gap: 3, cls: 'u6l1-hl' })); }
        } },
      { cap: `In numbers: ${T('M')} keeps the ${share}, and its ${T(d.ax)} is the <b>average</b> of ${T(texNum(cA))} and ${T(texNum(cB))}: ${T(d.avg)}.`,
        run: async (c) => {
          const NL = new NumberLine(P, { width: ex.W - G.W - 72, height: 120, axisY: 82, min: d.min, max: d.max });
          NL.point(cA, { color: INK }); NL.point(cB, { color: INK });
          await appear(c, NL.el);
          await NL.hop(c, cA, cM, { label: T(texNum(Math.abs(cM - cA))), color: RUN, height: 38 }); await NL.hop(c, cM, cB, { label: T(texNum(Math.abs(cB - cM))), color: RUN, height: 38 });
          const mp = NL.point(cM, { color: MID, r: 9 }); await pop(c, mp);
          await show(c, line(P, T(`${d.ax}_M=${d.avg}`), 'u6l1-big'));
          await show(c, line(P, `Add the two ends and halve: the <b>average</b> is the number exactly halfway between them.`, 'u6l1-note'));
        } }
    ];
    function half(v) { return v / 2; }
  }
};

/* =============================== explainer: half the run, half the rise =============================== */
const WALK = {
  ex5b: { label: 'Example 5(b) check', A: [-2, -3], B: [4, 5], nA: 'F', nB: 'E', win: { xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5 },
    whole: '6 right and 8 up', half: ['3 right', '4 up'], ax: ['\\dfrac{-2+4}{2}=1', '\\dfrac{-3+5}{2}=1'] },
  dec: { label: `A decimal midpoint: ${T('A(-4,\\ -2)')} to ${T('B(8,\\ 3)')}`, A: [-4, -2], B: [8, 3], nA: 'A', nB: 'B', win: { xmin: -6, xmax: 10, ymin: -4, ymax: 6 },
    whole: '12 right and 5 up', half: ['6 right', '2.5 up'], ax: ['\\dfrac{-4+8}{2}=2', '\\dfrac{-2+3}{2}=0.5'] },
  warm: { label: 'Warm-up: the booster', A: [0, 0], B: [-4, 4], nA: 'O', nB: 'C', posA: 'se', win: { xmin: -6, xmax: 2, ymin: -1.5, ymax: 6 },
    whole: '4 left and 4 up', half: ['2 left', '2 up'], ax: ['\\dfrac{0+(-4)}{2}=-2', '\\dfrac{0+4}{2}=2'] }
};
const walker = {
  title: 'Half the run, half the rise',
  height: 480,
  minW: 880, // drawn this wide and scaled to fit beside the sidebar
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
          await show(c, line(P, `whole trip: <b class="u6l1-crun">${d.whole.split(' and ')[0]}</b>, <b class="u6l1-crise">${d.whole.split(' and ')[1]}</b>`));
          void C;
        } },
      { cap: `The hiker walks <b>half the run</b>: ${d.half[0]}…`,
        run: async (c) => { w = walkerFig(G); w.place(...A); await pop(c, w.body); await walkTo(G, c, w, H1, RUN, 900); } },
      { cap: `…then <b>half the rise</b>: ${d.half[1]}. The hiker is standing on the segment, at ${T('M' + P2(...M))}.`,
        run: async (c) => {
          await walkTo(G, c, w, M, RISE, 900);
          await G.reveal(G.point(...M, { color: MID, r: 9, label: T('M' + P2(...M)), pos: rx > 0 ? 'se' : 'sw', labelColor: MID }), c);
          await show(c, line(P, `half of each: <b class="u6l1-crun">${d.half[0]}</b>, <b class="u6l1-crise">${d.half[1]}</b> → ${T('M' + P2(...M))}`));
        } },
      { cap: `Do the same again (${d.half[0]}, ${d.half[1]}) and the hiker lands exactly on ${T(d.nB)}. So ${T('M')} really is halfway.`,
        run: async (c) => { await walkTo(G, c, w, [B[0], M[1]], RUN, 800); await walkTo(G, c, w, B, RISE, 800); } },
      { cap: `Shadows on the axes: ${T('M')}’s ${T('x')} is halfway between the ${T('x')}’s, and its ${T('y')} is halfway between the ${T('y')}’s. Average each coordinate.`,
        run: async (c) => {
          G.remove(w);
          await G.drawIn(G.shadeX(Math.min(A[0], B[0]), Math.max(A[0], B[0]), { color: RUN }), 600, c);
          await G.drawIn(G.shadeY(Math.min(A[1], B[1]), Math.max(A[1], B[1]), { color: RISE }), 600, c);
          await G.drawIn(G.guides(...M, { color: MID }), 600, c);
          await show(c, line(P, T('x_M=' + d.ax[0]), 'u6l1-trun')); await show(c, line(P, T('y_M=' + d.ax[1]), 'u6l1-trise'));
        } }
    ];
  }
};

/* =============================== explainer: the midpoint formula as the average =============================== */
const AVG = {
  sym: { label: 'The formula', sym: true, A: [2, 7], B: [9, 2], win: { xmin: 0, xmax: 10.5, ymin: 0, ymax: 8.5 } },
  ex6a: { label: 'Example 6(a) check', A: [6, 9], B: [14, 1], nA: 'P', nB: 'Q', win: { xmin: -1, xmax: 16, ymin: -1, ymax: 11 }, xr: [4, 16], yr: [0, 10] },
  ex6b: { label: 'Example 6(b) check', A: [-7, 5], B: [-15, -3], nA: 'R', nB: 'S', win: { xmin: -17, xmax: 1, ymin: -5, ymax: 7 }, xr: [-16, -6], yr: [-4, 6] }
};
const average = {
  title: 'The midpoint formula: average the x’s, average the y’s',
  height: 480,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
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
    const NL = (lab, rng, labels) => { const t = line(P, `<b>${lab}</b>`, 'u6l1-nlh'); const L = new NumberLine(P, { width: NW, height: 74, axisY: 44, min: rng[0], max: rng[1], numbers: true, labels }); hide(t); hide(L.el); return { t, L }; };
    const X = NL(`${T('x')}-values`, xs, lx), Y = NL(`${T('y')}-values`, ys, ly);
    return [
      { cap: `${T(nmA)} and ${T(nmB)}.`,
        run: async (c) => { await G.drawIn(G.segment(A, B, { color: SEG, width: 5 }), 700, c); await G.reveal(G.point(...A, { color: SEG, label: T(nmA), pos: 'n' }), c); await G.reveal(G.point(...B, { color: SEG, label: T(nmB), pos: sym ? 'n' : 's' }), c); } },
      { cap: sym ? `The ${T('x')}-values alone: halfway between ${T('x_1')} and ${T('x_2')} is their average, ${T('\\frac{x_1+x_2}{2}')}.` : `The ${T('x')}-values alone: ${T(texNum(A[0]))} and ${T(texNum(B[0]))}. Halfway between them: add and halve. ${T('x_M=' + xm)}.`,
        run: async (c) => {
          await show(c, X.t); await appear(c, X.L.el);
          const p1 = X.L.point(A[0], { color: SEG }), p2 = X.L.point(B[0], { color: SEG }); await Promise.all([pop(c, p1), pop(c, p2)]);
          await X.L.hop(c, A[0], M[0], { label: gap(A[0], M[0]), color: RUN, height: 24 }); await X.L.hop(c, M[0], B[0], { label: gap(M[0], B[0]), color: RUN, height: 24 });
          await pop(c, X.L.point(M[0], { color: MID, r: 9 })); await show(c, line(P, T('x_M=' + xm), 'u6l1-trun'));
        } },
      { cap: sym ? `The ${T('y')}-values alone: halfway between ${T('y_1')} and ${T('y_2')} is ${T('\\frac{y_1+y_2}{2}')}.` : `The ${T('y')}-values alone: ${T(texNum(A[1]))} and ${T(texNum(B[1]))}. ${T('y_M=' + ym)}.`,
        run: async (c) => {
          await show(c, Y.t); await appear(c, Y.L.el);
          const p1 = Y.L.point(A[1], { color: SEG }), p2 = Y.L.point(B[1], { color: SEG }); await Promise.all([pop(c, p1), pop(c, p2)]);
          await Y.L.hop(c, A[1], M[1], { label: gap(A[1], M[1]), color: RISE, height: 24 }); await Y.L.hop(c, M[1], B[1], { label: gap(M[1], B[1]), color: RISE, height: 24 });
          await pop(c, Y.L.point(M[1], { color: MID, r: 9 })); await show(c, line(P, T('y_M=' + ym), 'u6l1-trise'));
        } },
      { cap: sym ? `Put the two averages together: that point lands exactly halfway along the segment.` : `Put them together: ${T('M' + P2(...M))}. It lands right on the segment, halfway along.`,
        run: async (c) => {
          await G.drawIn(G.vline(M[0], { color: RUN, width: 2.5 }), 500, c); await G.drawIn(G.hline(M[1], { color: RISE, width: 2.5 }), 500, c);
          await G.reveal(G.point(...M, { color: MID, r: 9, label: sym ? T('M') : T('M' + P2(...M)), pos: (B[1] - A[1]) * (B[0] - A[0]) > 0 ? 'nw' : 'ne', labelColor: MID }), c);
        } },
      { cap: `The <b>midpoint formula</b>: average the ${T('x')}’s and average the ${T('y')}’s.`,
        run: async (c) => { const f = line(P, T('M\\left(\\dfrac{x_1+x_2}{2},\\ \\dfrac{y_1+y_2}{2}\\right)'), 'u6l1-boxed'); await pop(c, f, 500); } }
    ];
  }
};

/* =============================== explainer: working backward =============================== */
const BACK = {
  demo: { label: `Endpoint ${T('A(-3,\\ 1)')}, midpoint ${T('M(1,\\ 3)')}` },
  ex7: { label: 'Example 7 check' }
};
const backward = {
  title: 'The midpoint is halfway, so go the same again',
  height: 480,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(BACK).map((k) => ({ v: k, label: BACK[k].label })),
  intro: (k) => (k === 'ex7' ? 'Devon’s page has two coffee blots. Press <b>Next</b>.' : 'One endpoint and the midpoint are known. Where is the other end? Press <b>Next</b>.'),
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
          run: async (c) => { w = walkerFig(G); w.place(...A); await pop(c, w.body); await walkTo(G, c, w, [1, 1], RUN); await pop(c, G.label(-1, 1, T('4'), { pos: 's', cls: 'u6l1-legl u6l1-lrun', gap: 8 })); await walkTo(G, c, w, M, RISE); await pop(c, G.label(1, 2, T('2'), { pos: 'e', cls: 'u6l1-legl u6l1-lrise', gap: 8 })); } },
        { cap: `${T('M')} is halfway, so <b>go the same again</b>: 4 right, 2 up. That lands on ${T('B(5,\\ 5)')}.`,
          run: async (c) => { await walkTo(G, c, w, [5, 3], RUN); await pop(c, G.label(3, 3, T('4'), { pos: 's', cls: 'u6l1-legl u6l1-lrun', gap: 8 })); await walkTo(G, c, w, B, RISE); await pop(c, G.label(5, 4, T('2'), { pos: 'e', cls: 'u6l1-legl u6l1-lrise', gap: 8 })); G.remove(w); await G.reveal(G.point(...B, { color: SEG, label: T('B(5,\\ 5)'), pos: 'n' }), c); await G.drawIn(G.segment(A, B, { color: SEG, width: 4 }), 600, c); } },
        { cap: `Check with the formula: the midpoint of ${T('A(-3,\\ 1)')} and ${T('B(5,\\ 5)')} is ${T('\\left(\\frac{-3+5}{2},\\ \\frac{1+5}{2}\\right)=(1,\\ 3)')} ✓`,
          run: async (c) => { await show(c, line(P, T('\\left(\\dfrac{-3+5}{2},\\ \\dfrac{1+5}{2}\\right)=(1,\\ 3)\\ \\checkmark'))); } },
        { cap: `Or solve one coordinate at a time: ${T('\\frac{-3+x}{2}=1')}, so ${T('-3+x=2')} and ${T('x=5')}. Same for ${T('y')}.`,
          run: async (c) => { for (const s of ['\\dfrac{-3+x}{2}=1\\Rightarrow -3+x=2\\Rightarrow x=5', '\\dfrac{1+y}{2}=3\\Rightarrow 1+y=6\\Rightarrow y=5']) await show(c, line(P, T(s))); } }
      ];
    }
    const Q = [-8, -6], M = [3, 3], Pp = [14, 12];
    const G = sqGraph(stage, { xmin: -10, xmax: 16, ymin: -8, ymax: 14 }, 440, H - 20, { x: 10, y: 10, center: true, g: { xlabels: 4, ylabels: 4 } });
    const PW = ex.W - G.W - 44, P = panel(stage, G.W + 30, 14, PW, H - 28, '');
    const note = h('div', 'u6l1-pnote', `<span>${T('P(')}<b class="u6l1-blot u6l1-b1">${T('x_1')}</b>${T(',\\ 12)')}</span><span>${T('Q(-8,\\ -6)')}</span><span>${T('M(3,\\ ')}<b class="u6l1-blot u6l1-b2">${T('y_M')}</b>${T(')')}</span>`);
    P.appendChild(note);
    const b1 = note.querySelector('.u6l1-b1'), b2 = note.querySelector('.u6l1-b2');
    const wipe = async (c, b, v) => { b.innerHTML = T(v); b.classList.add('u6l1-wiped'); await pulse(c, b, 1.25); };
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
          await show(c, line(P, `<b>${T('x')}-values</b>`, 'u6l1-nlh'));
          XL = new NumberLine(P, { width: PW - 28, height: 84, axisY: 50, min: -10, max: 16, step: 1, labels: [-8, 0, 3].map((v) => ({ v, html: T(texNum(v)) })) }); await appear(c, XL.el);
          await pop(c, XL.point(-8, { color: SEG })); await pop(c, XL.point(3, { color: MID })); await XL.hop(c, -8, 3, { label: T('+11'), color: RUN });
        } },
      { cap: `${T('M')} is halfway, so <b>go the same again</b>: ${T('3+11=14')}. The trailhead is ${T('P(14,\\ 12)')}. (Algebra: ${T('\\frac{x_1+(-8)}{2}=3\\Rightarrow x_1-8=6\\Rightarrow x_1=14')}.)`,
        run: async (c) => {
          await XL.hop(c, 3, 14, { label: T('+11'), color: RUN }); await pop(c, XL.point(14, { color: SEG, r: 9 })); await pop(c, XL.mark(14, T('14'), { pos: 's', color: MID })); await wipe(c, b1, '14');
          await show(c, line(P, T('\\dfrac{x_1+(-8)}{2}=3\\Rightarrow x_1-8=6\\Rightarrow x_1=14'), 'u6l1-sm'));
        } },
      { cap: `(ii) Now both ${T('y')}’s are known: 12 and ${T('-6')}. ${T('y_M=\\frac{12+(-6)}{2}=\\frac{6}{2}=3')}, halfway between them.`,
        run: async (c) => {
          await show(c, line(P, `<b>${T('y')}-values</b>`, 'u6l1-nlh'));
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
export const explainers = mountExplainers({ lengths, hidden, simplify, lift, map, midcount, walker, average, backward });
export const _test = { LEN, HID, SR, LIFT, CNT, WALK, AVG, simpRad };
