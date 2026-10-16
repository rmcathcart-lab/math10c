/* Math 10C · Unit 6 · Lesson 1 — Measuring the Length of a Line Segment (Extension/Foundation).
 * Warm-up (the spider and the fly: room, flat wall, the room opened out flat), static figures, and the explainers:
 *   segment (line vs segment, AB-bar vs AB, three kinds of segment), countH / countV (count the squares, or subtract the
 *   coordinates; Example 1 / 2(a) / 3 / 4(a) checks), whyAbs (the order of subtraction only flips the sign),
 *   letters (Example 2(b) / 4(b): the segment slides, the length stays), pythag (why a² + b² = c², by rearranging four
 *   triangles), hidden (the star: the right triangle grows out of a slanted segment, run and rise are counted, squares
 *   are built on each side and a² + b² = c² runs; Example 5 checks), simplify (simplest radical form).
 * Colours: run / horizontal amber, rise / vertical purple, the segment / hypotenuse blue. */
import {
  h, tex, add, box, Graph, NumberLine, RightTriangle, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pairTex, texNum, svgEl, liveCtx, pulse, drawIn, anim, COLORS
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

/* ======================================================================================
 * Warm-up: the spider and the fly
 * ====================================================================================== */
function spider(parent, x, y, s = 1) {
  const g = svgEl('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  for (const a of [25, 55, 125, 155, 205, 235, 305, 335]) {
    const r = a * Math.PI / 180, k = a < 90 || a > 270 ? 1 : -1, x1 = 11 * Math.cos(r), y1 = -11 * Math.sin(r);
    svgEl('path', { d: `M0 0L${x1} ${y1}L${x1 + k * 5} ${y1 + 6}`, stroke: '#111', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, g);
  }
  svgEl('circle', { r: 6.5, fill: '#111' }, g); svgEl('circle', { cy: -7, r: 4, fill: '#111' }, g);
  svgEl('circle', { cx: -1.6, cy: -7.8, r: 1.1, fill: '#fff' }, g); svgEl('circle', { cx: 1.6, cy: -7.8, r: 1.1, fill: '#fff' }, g);
  return g;
}
function fly(parent, x, y, s = 1) {
  const g = svgEl('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  svgEl('ellipse', { cx: -6, cy: -5, rx: 8, ry: 4, transform: 'rotate(35 -6 -5)', fill: '#d6f3fb', stroke: '#1e2d46', 'stroke-width': 1.2 }, g);
  svgEl('ellipse', { cx: 6, cy: -5, rx: 8, ry: 4, transform: 'rotate(-35 6 -5)', fill: '#d6f3fb', stroke: '#1e2d46', 'stroke-width': 1.2 }, g);
  svgEl('ellipse', { rx: 4, ry: 7, fill: '#1e2d46' }, g);
  svgEl('circle', { cx: -2.2, cy: -5.5, r: 1.8, fill: RED }, g); svgEl('circle', { cx: 2.2, cy: -5.5, r: 1.8, fill: RED }, g);
  return g;
}
const txt = (parent, x, y, s, cls, anchor = 'middle') => { const t = svgEl('text', { x, y, class: cls, 'text-anchor': anchor }, parent); t.textContent = s; return t; };
const poly = (parent, pts, attrs) => svgEl('polygon', Object.assign({ points: pts.map((p) => p.join(',')).join(' ') }, attrs), parent);

function mountWarm() {
  const host = document.getElementById('u6l1-wfig'); if (!host) return;
  const W = host.clientWidth || 966, H = 400;
  const room = svgEl('svg', { width: W, height: H, class: 'u6l1-wview' }, host);
  const net = svgEl('svg', { width: W, height: H, class: 'u6l1-wview' }, host);
  net.style.opacity = 0; net.style.pointerEvents = 'none';

  /* ---- the room (oblique view) ---- */
  const P3 = (x, y, z) => [52 + 15 * x + 7 * y, 335 - 4.4 * y - 15 * z];
  const face = (pts, fill, op = 1) => poly(room, pts.map((p) => P3(...p)), { fill, 'fill-opacity': op });
  face([[0, 12, 0], [30, 12, 0], [30, 12, 12], [0, 12, 12]], '#e8f0fc');
  face([[0, 0, 0], [30, 0, 0], [30, 12, 0], [0, 12, 0]], '#fff3cf');
  face([[0, 0, 0], [0, 12, 0], [0, 12, 12], [0, 0, 12]], '#cfe0f5', 0.8);
  face([[30, 0, 0], [30, 12, 0], [30, 12, 12], [30, 0, 12]], '#cfe0f5', 0.8);
  const edge = (pts, w, op = 1) => svgEl('polyline', { points: pts.map((p) => P3(...p).join(',')).join(' '), fill: 'none', stroke: '#1e2d46', 'stroke-width': w, 'stroke-opacity': op, 'stroke-linejoin': 'round' }, room);
  edge([[0, 12, 0], [30, 12, 0]], 1.2, 0.45); edge([[0, 12, 0], [0, 12, 12]], 1.2, 0.45); edge([[30, 12, 0], [30, 12, 12]], 1.2, 0.45);
  edge([[0, 0, 0], [30, 0, 0], [30, 0, 12], [0, 0, 12], [0, 0, 0]], 2.4);
  edge([[0, 0, 12], [0, 12, 12], [30, 12, 12], [30, 0, 12]], 2.4);
  edge([[0, 0, 0], [0, 12, 0]], 2.4); edge([[30, 0, 0], [30, 12, 0]], 2.4);
  svgEl('polyline', { points: [[0, 6, 11], [0, 6, 12], [30, 6, 12], [30, 6, 1]].map((p) => P3(...p).join(',')).join(' '), fill: 'none', stroke: RED, 'stroke-width': 3.5, 'stroke-dasharray': '11 7', 'stroke-linejoin': 'round' }, room);
  { const [x, y] = P3(15, 9, 12); const r = svgEl('rect', { x: x - 82, y: y - 34, width: 164, height: 28, rx: 6, fill: '#fff', stroke: RED, 'stroke-width': 1.6 }, room); void r; txt(room, x, y - 14, 'the obvious route', 'u6l1-wt-r'); }
  spider(room, ...P3(0, 6, 11), 1.15); fly(room, ...P3(30, 6, 1), 1.25);
  { const [x, y] = P3(0, 6, 11); txt(room, x + 56, y + 30, 'Spider', 'u6l1-wt-b', 'start'); txt(room, x + 56, y + 50, '1 m below the ceiling', 'u6l1-wt-s', 'start'); }
  { const [x, y] = P3(30, 6, 1); txt(room, x - 56, y - 44, 'Fly', 'u6l1-wt-b', 'end'); txt(room, x - 56, y - 24, '1 m above the floor', 'u6l1-wt-s', 'end'); }
  { const [x, y] = P3(15, 0, 0); txt(room, x, y + 26, '30 m', 'u6l1-wt-b'); }
  { const [x, y] = P3(0, 0, 6); txt(room, x - 10, y + 6, '12 m', 'u6l1-wt-b', 'end'); }
  { const [x, y] = P3(30, 6, 0); txt(room, x + 12, y + 18, '12 m', 'u6l1-wt-b', 'start'); }

  /* ---- the flat wall (question 2) ---- */
  const fx = 680, fy = 112, cs = 52;
  txt(room, fx + 2 * cs, fy - 22, 'A flat wall', 'u6l1-wt-b');
  svgEl('rect', { x: fx, y: fy, width: 4 * cs, height: 3 * cs, fill: '#e8f0fc' }, room);
  for (let i = 1; i < 4; i++) svgEl('line', { x1: fx + i * cs, x2: fx + i * cs, y1: fy, y2: fy + 3 * cs, stroke: '#b9c3d3', 'stroke-width': 1 }, room);
  for (let j = 1; j < 3; j++) svgEl('line', { x1: fx, x2: fx + 4 * cs, y1: fy + j * cs, y2: fy + j * cs, stroke: '#b9c3d3', 'stroke-width': 1 }, room);
  svgEl('rect', { x: fx, y: fy, width: 4 * cs, height: 3 * cs, fill: 'none', stroke: '#1e2d46', 'stroke-width': 2.2 }, room);
  svgEl('polyline', { points: `${fx + 6},${fy + 3 * cs + 12} ${fx + 4 * cs + 12},${fy + 3 * cs + 12} ${fx + 4 * cs + 12},${fy + 6}`, fill: 'none', stroke: '#7a8294', 'stroke-width': 3, 'stroke-linejoin': 'round' }, room);
  poly(room, [[fx + 4 * cs + 12, fy - 2], [fx + 4 * cs + 6, fy + 10], [fx + 4 * cs + 18, fy + 10]], { fill: '#7a8294' });
  txt(room, fx + 2 * cs, fy + 3 * cs + 36, '4 m', 'u6l1-wt-b'); txt(room, fx + 4 * cs + 22, fy + 1.5 * cs + 6, '3 m', 'u6l1-wt-b', 'start');
  spider(room, fx + 12, fy + 3 * cs - 12, 0.8); fly(room, fx + 4 * cs - 12, fy + 12, 0.85);
  txt(room, fx + 2 * cs, fy + 3 * cs + 70, 'edges: 4 + 3 = 7 m', 'u6l1-wt');
  const straightT = txt(room, fx + 2 * cs, fy + 3 * cs + 98, 'straight: ? m', 'u6l1-wt-r');
  const diag = svgEl('path', { class: 'bk-stroke', d: `M${fx} ${fy + 3 * cs}L${fx + 4 * cs} ${fy}`, stroke: BLUE, 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, room);
  diag.style.display = 'none';

  /* ---- the room opened out flat (net), 1 m = 10 px ---- */
  const u = 10, X = (x) => 40 + u * (x + 12), Y = (y) => 22 + u * (36 - y);
  const rect = (x0, y0, x1, y1, fill, name) => {
    svgEl('rect', { x: X(x0), y: Y(y1), width: u * (x1 - x0), height: u * (y1 - y0), fill }, net);
    for (let x = x0 + 1; x < x1; x++) svgEl('line', { x1: X(x), x2: X(x), y1: Y(y0), y2: Y(y1), stroke: '#c9d2df', 'stroke-width': 0.8 }, net);
    for (let y = y0 + 1; y < y1; y++) svgEl('line', { x1: X(x0), x2: X(x1), y1: Y(y), y2: Y(y), stroke: '#c9d2df', 'stroke-width': 0.8 }, net);
    svgEl('rect', { x: X(x0), y: Y(y1), width: u * (x1 - x0), height: u * (y1 - y0), fill: 'none', stroke: '#1e2d46', 'stroke-width': 2 }, net);
    txt(net, X((x0 + x1) / 2), Y(y1) + 20, name, 'u6l1-wt-s');
  };
  rect(0, 24, 30, 36, '#e8f0fc', 'ceiling'); rect(0, 12, 30, 24, '#f6f1fd', 'side wall'); rect(0, 0, 30, 12, '#fff3cf', 'floor');
  rect(-12, 24, 0, 36, '#cfe0f5', 'end wall'); rect(30, 0, 42, 12, '#cfe0f5', 'end wall');
  const route = svgEl('path', { class: 'bk-stroke', d: `M${X(-1)} ${Y(30)}L${X(31)} ${Y(6)}`, stroke: BLUE, 'stroke-width': 4.5, 'stroke-linecap': 'round', fill: 'none' }, net);
  const triG = svgEl('g', {}, net); triG.style.opacity = 0;
  const runL = svgEl('path', { class: 'bk-stroke', d: `M${X(-1)} ${Y(30)}L${X(31)} ${Y(30)}`, stroke: AMB, 'stroke-width': 4, 'stroke-dasharray': '10 6', fill: 'none' }, triG);
  const riseL = svgEl('path', { class: 'bk-stroke', d: `M${X(31)} ${Y(30)}L${X(31)} ${Y(6)}`, stroke: PUR, 'stroke-width': 4, 'stroke-dasharray': '10 6', fill: 'none' }, triG);
  svgEl('path', { d: `M${X(31) - 12} ${Y(30)}v12h12`, stroke: INK, 'stroke-width': 2, fill: 'none' }, triG);
  txt(triG, X(15), Y(30) - 10, 'run 32', 'u6l1-wt-a'); txt(triG, X(31) + 12, Y(18), 'rise 24', 'u6l1-wt-p', 'start');
  txt(triG, X(14) - 10, Y(16) + 8, '40', 'u6l1-wt-blue', 'end');
  spider(net, X(-1), Y(30), 0.9); fly(net, X(31), Y(6), 0.95);
  const info = svgEl('g', {}, net), ix = X(42) + 34;
  txt(info, ix, 70, 'Opened out flat,', 'u6l1-wt-b', 'start'); txt(info, ix, 96, 'the crawl is one', 'u6l1-wt-b', 'start'); txt(info, ix, 122, 'straight segment.', 'u6l1-wt-b', 'start');
  const form = svgEl('g', {}, net); form.style.opacity = 0;
  txt(form, ix, 180, 'run = 1 + 30 + 1 = 32', 'u6l1-wt-a', 'start'); txt(form, ix, 212, 'rise = 6 + 12 + 6 = 24', 'u6l1-wt-p', 'start');
  txt(form, ix, 256, '√(32² + 24²)', 'u6l1-wt-blue', 'start'); txt(form, ix, 288, '= √1600 = 40 m', 'u6l1-wt-blue', 'start');

  let flat = false, wallOn = false, triOn = false, busy = false;
  const bFlat = document.getElementById('u6l1-wflat'), bWall = document.getElementById('u6l1-wwall'), bTri = document.getElementById('u6l1-wtri');
  const setFlat = async (on, c) => {
    flat = on; bFlat.textContent = on ? 'Back to the room' : 'Open the room out flat';
    room.style.opacity = on ? 0 : 1; net.style.opacity = on ? 1 : 0; net.style.pointerEvents = on ? '' : 'none';
    if (on) { await sleep(c, 350); await drawIn(route, 1100, c); }
  };
  const run = (fn) => async () => { if (busy) return; busy = true; try { await fn(liveCtx()); } finally { busy = false; } };
  bFlat.addEventListener('click', run((c) => setFlat(!flat, c)));
  bWall.addEventListener('click', run(async (c) => {
    if (flat) await setFlat(false, c);
    wallOn = !wallOn; diag.style.display = wallOn ? '' : 'none'; straightT.textContent = wallOn ? 'straight: √(4² + 3²) = 5 m' : 'straight: ? m';
    if (wallOn) await drawIn(diag, 700, c);
  }));
  bTri.addEventListener('click', run(async (c) => {
    if (!flat) { await setFlat(true, c); triOn = false; }
    triOn = !triOn;
    if (!triOn) { triG.style.opacity = 0; form.style.opacity = 0; return; }
    triG.style.opacity = 1; await drawIn(runL, 700, c); await drawIn(riseL, 600, c); await fadeIn(c, form, 400);
  }));
}

/* ======================================================================================
 * Static figures
 * ====================================================================================== */
function segFig(id, segs, win, o = {}) {
  const host = document.getElementById(id); if (!host) return null;
  const G = new Graph(host, Object.assign({ width: 400, height: 400, xlabels: 2, ylabels: 2 }, win, o));
  for (const s of segs) {
    G.segment(s[0].slice(1, 3), s[1].slice(1, 3), { color: BLUE, width: 4 });
    for (const p of s) G.point(p[1], p[2], { color: BLUE, label: T(p[0]), pos: p[3], labelColor: INK });
  }
  return G;
}
function mountFigs() {
  segFig('u6l1-ex1fig', [[['A', -5, 5, 'n'], ['B', 1, 5, 'n']], [['C', -4, 2, 'n'], ['D', 3, 2, 'n']], [['E', -5, -4, 's'], ['F', 3, -4, 's']]], { xmin: -7, xmax: 7, ymin: -7, ymax: 7 });
  segFig('u6l1-ex3fig', [[['G', -4, 5, 'n'], ['H', -4, -3, 's']], [['I', 1, 4, 'ne'], ['J', 1, -2, 'se']], [['K', 4, 3, 'n'], ['L', 4, -4, 's']]], { xmin: -7, xmax: 7, ymin: -7, ymax: 7 });
  segFig('u6l1-ex5fig', [[['A', -5, -2, 's'], ['B', -2, 7, 'n']], [['C', 3, 6, 'n'], ['D', 7, -4, 's']]], { xmin: -7, xmax: 9, ymin: -7, ymax: 9 });
  const G = segFig('u6l1-ex5ans', [[['A', -5, -2, 'w'], ['B', -2, 7, 'n']], [['C', 3, 6, 'n'], ['D', 7, -4, 's']]], { xmin: -7, xmax: 9, ymin: -7, ymax: 9 }, { width: 340, height: 340, fontSize: 15 });
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
}

/* ======================================================================================
 * Explainer 1: what is a line segment?
 * ====================================================================================== */
const segment = {
  title: 'Line or line segment?',
  height: 450,
  intro: 'What makes a <b>segment</b> different from a <b>line</b>? Press <b>Next</b>.',
  make(stage, v, ex) {
    const G = new Graph(stage, { x: 10, y: 6, width: 440, height: 440, xmin: -6, xmax: 6, ymin: -6, ymax: 6, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 476, 6, ex.W - 486, 440, 'Words and symbols');
    const A = [-4, -2], B = [3, 3];
    let pA, pB, L, S, tape, tapeL, eA, eB;
    return [
      { cap: 'Two points, <b>A</b> and <b>B</b>.',
        run: async (c) => { pA = G.point(...A, { color: BLUE, label: T('A'), pos: 'nw', labelColor: INK }); pB = G.point(...B, { color: BLUE, label: T('B'), pos: 'nw', labelColor: INK }); await G.reveal(pA, c); await G.reveal(pB, c); } },
      { cap: 'A <b>line</b> through them goes on <b>forever</b> both ways (that is what the arrows mean). It has no length.',
        run: async (c) => { L = G.line(A, B, { color: 'gray', width: 3 }); await G.drawIn(L, 900, c); await show(c, line(P, '<b>line</b> <span class="u6l1-sm">never ends: no length</span>')); } },
      { cap: `Keep only the piece <b>between</b> A and B: the <b>line segment</b> ${T('AB')}, written ${T('\\overline{AB}')}. A and B are its <b>endpoints</b>.`,
        run: async (c) => {
          await anim(c, L, [{ opacity: 1 }, { opacity: 0.22 }], 400);
          S = G.segment(A, B, { color: BLUE, width: 5.5 }); await G.drawIn(S, 700, c);
          eA = G.label(...A, 'endpoint', { pos: 'se', cls: 'bk-ptlab u6l1-sm', color: BLUE }); eB = G.label(...B, 'endpoint', { pos: 'se', cls: 'bk-ptlab u6l1-sm', color: BLUE });
          await Promise.all([fadeIn(c, eA), fadeIn(c, eB)]);
          await show(c, line(P, `<b>segment</b> ${T('\\overline{AB}')} <span class="u6l1-sm">the piece between the endpoints</span>`, 'u6l1-cb'));
        } },
      { cap: `It stops at each end, so it has a definite <b>length</b>. The length is written ${T('AB')}, with <b>no bar</b>.`,
        run: async (c) => {
          G.remove(eA, eB);
          const d = [B[0] - A[0], B[1] - A[1]], len = Math.hypot(...d), nrm = [-d[1] / len * 0.8, d[0] / len * 0.8];
          const a2 = [A[0] + nrm[0], A[1] + nrm[1]], b2 = [B[0] + nrm[0], B[1] + nrm[1]];
          tape = G.segment(a2, b2, { color: INK, width: 2.5, ends: ['arrow', 'arrow'] }); await G.drawIn(tape, 600, c);
          tapeL = G.label((a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2, `${T('AB')} = ?`, { pos: 'nw', cls: 'u6l1-seglab', gap: 2 }); await pop(c, tapeL);
          await show(c, line(P, `<b>length</b> ${T('AB')} <span class="u6l1-sm">a number of units, never negative</span>`));
        } },
      { cap: 'Today: three kinds of segment and how to measure each. <b>Horizontal</b> and <b>vertical</b>: count or subtract. <b>Slanted</b>: a hidden right triangle.',
        run: async (c) => {
          G.remove(tape, tapeL); await anim(c, L, [{ opacity: 0.22 }, { opacity: 0 }], 300);
          const hS = G.segment([-5, 5], [-1, 5], { color: AMB, width: 5.5, closedA: true, closedB: true }), vS = G.segment([5, -5], [5, -1], { color: PUR, width: 5.5, closedA: true, closedB: true });
          await G.drawIn(hS, 500, c); await G.drawIn(vS, 500, c);
          const box3 = h('div', 'u6l1-rule', `<div class="u6l1-ca"><b>horizontal</b>: count, or subtract the ${T('x')}’s</div><div class="u6l1-cp"><b>vertical</b>: count, or subtract the ${T('y')}’s</div><div class="u6l1-cb"><b>slanted</b>: right triangle + Pythagoras</div>`);
          P.appendChild(box3); await pop(c, box3);
        } }
    ];
  }
};

/* ======================================================================================
 * Explainers 2 and 5: count the squares, or subtract (horizontal / vertical)
 * ====================================================================================== */
// each segment: P1 → P2; the difference shown is (coordinate of P2) − (coordinate of P1)
const CH = {
  demo: { label: 'Demo', segs: [{ name: 'RS', P1: ['R', -3, 3], P2: ['S', 5, 3] }] },
  ex1: { label: 'Example 1 check', segs: [{ name: 'AB', P1: ['A', -5, 5], P2: ['B', 1, 5] }, { name: 'CD', P1: ['C', -4, 2], P2: ['D', 3, 2] }, { name: 'EF', P1: ['E', -5, -4], P2: ['F', 3, -4] }] },
  ex2a: { label: 'Example 2(a) check', segs: [{ name: 'PQ', P1: ['P', 5, -2], P2: ['Q', -4, -2], given: true }] }
};
const CV = {
  demo: { label: 'Demo: turn it 90°', turn: true, segs: [{ name: 'RS', P1: ['R', -1, -2], P2: ['S', -1, 4] }] },
  ex3: { label: 'Example 3 check', segs: [{ name: 'GH', P1: ['H', -4, -3], P2: ['G', -4, 5] }, { name: 'IJ', P1: ['J', 1, -2], P2: ['I', 1, 4] }, { name: 'KL', P1: ['L', 4, -4], P2: ['K', 4, 3] }] },
  ex4a: { label: 'Example 4(a) check', segs: [{ name: 'UV', P1: ['U', 3, -2], P2: ['V', 3, -11], given: true }] }
};
function countDef(H) {
  const D = H ? CH : CV, X = H ? 'x' : 'y', Y = H ? 'y' : 'x', col = H ? AMB : PUR, ci = H ? 1 : 2, word = H ? 'right minus left' : 'upper minus lower';
  return {
    title: H ? 'Count the squares, or subtract the x-coordinates' : 'Vertical: count the squares, or subtract the y-coordinates',
    height: 480,
    choices: Object.keys(D).map((k) => ({ v: k, label: D[k].label })),
    intro: H ? 'Two ways to measure a horizontal segment. Do they always agree? Press <b>Next</b>.' : 'The same two ways, for a vertical segment. Press <b>Next</b>.',
    make(stage, k, ex) {
      const d = D[k], GW = 460, segs = d.segs.map((s) => Object.assign({}, s));
      const pts = segs.flatMap((s) => [s.P1.slice(1), s.P2.slice(1)]).concat([[-6, -6], [6, 6]], d.turn ? [[-4, 1], [2, 1]] : []);
      const G = new Graph(stage, Object.assign({ x: 8, y: 10, width: GW, height: 460, xlabels: 2, ylabels: 2 }, fitWin(pts, GW, 460, 1)));
      const P = panel(stage, GW + 28, 10, ex.W - GW - 36, 460, 'Count or subtract');
      const tb = h('div', 'u6l1-ct', `<div class="u6l1-cth">seg.</div><div class="u6l1-cth">count</div><div class="u6l1-cth">subtract</div>`); P.appendChild(tb);
      let hops = [], drops = [];
      const steps = [];
      // label sides: labels away from the axis the drop lines go to; hops and the length pill toward it
      const labPos = (p) => (H ? (p[2] > 0 ? 'n' : 's') : (p[1] > 0 ? 'e' : 'w'));
      const hopSide = (s) => (H ? [0, s.P1[2] > 0 ? 1 : -1] : [s.P1[1] > 0 ? -1 : 1, 0]);
      const drawSeg = (s, c) => {
        const A = s.P1.slice(1), B = s.P2.slice(1);
        s.seg = G.segment(A, B, { color: BLUE, width: 4.5 });
        s.pA = G.point(...A, { color: BLUE, label: T(s.P1[0]), pos: labPos(s.P1, s.P2), labelColor: INK });
        s.pB = G.point(...B, { color: BLUE, label: T(s.P2[0]), pos: labPos(s.P2, s.P1), labelColor: INK });
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
      segs.forEach((s) => {
        const a = s.P1[ci], b = s.P2[ci], diff = b - a, len = Math.abs(diff), neg = diff < 0;
        const A = s.P1.slice(1), B = s.P2.slice(1);
        const subT = `${X}_{${s.P2[0]}}-${X}_{${s.P1[0]}}=${minus(b, a)}=${tn(diff)}`;
        let cells;
        steps.push({
          cap: `${T(s.name)}: count the squares from ${T(s.P1[0])} to ${T(s.P2[0])}: <b>${len}</b>.`,
          run: async (c) => {
            G.remove(...hops, ...drops); hops = []; drops = [];
            if (!s.seg) await drawSeg(s, c);
            hops = await countHops(G, c, A, B, { color: col, side: hopSide(s) });
            cells = [h('div', 'u6l1-ctn', T(s.name)), h('div', 'u6l1-ctn', `<span style="color:${col}">${len}</span>`), h('div', '', '')];
            cells.forEach((e) => tb.appendChild(e)); await Promise.all(cells.slice(0, 2).map((e) => show(c, e)));
          }
        });
        steps.push({
          cap: neg
            ? `${T(ptT(...s.P1))} and ${T(ptT(...s.P2))}: same ${T(Y)}. Subtract in the order given: ${T(`${minus(b, a)}=${tn(diff)}`)}. <b>Negative!</b>`
            : `${T(ptT(...s.P1))} and ${T(ptT(...s.P2))}: same ${T(Y)}. Subtract, ${word}: ${T(`${minus(b, a)}=${diff}`)}. The <b>same</b> as the count.`,
          run: async (c) => {
            G.remove(...hops); hops = [];
            const [nx, ny] = hopSide(s), m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
            s.pill = G.label(...m, T(String(len)), { cls: 'u6l1-pill', color: col, dx: nx * 24, dy: ny * 24 });
            G.remove(s.pA.label, s.pB.label);
            const lA = G.label(...A, T(ptT(...s.P1)), { pos: labPos(s.P1, s.P2), cls: 'bk-ptlab', gap: 6 }), lB = G.label(...B, T(ptT(...s.P2)), { pos: labPos(s.P2, s.P1), cls: 'bk-ptlab', gap: 6 });
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
          cap: `A length can’t be negative. Take the size: ${T(`|${tn(diff)}|=${len}`)}, just like the count.`,
          run: async (c) => { const e = h('div', 'u6l1-ctn', ''); cells[2].classList.remove('u6l1-cr'); cells[2].innerHTML = T(`|${minus(b, a)}|=|${tn(diff)}|=${len}\\ \\checkmark`); await pulse(c, cells[2], 1.06); void e; }
        });
      });
      steps.push({
        cap: H ? `No grid? Subtract. <b>Length</b> ${T('=|x_2-x_1|')}: the ${T('y')}-coordinates play no part.` : `<b>Length</b> ${T('=|y_2-y_1|')}: the ${T('x')}-coordinates play no part. Same idea, turned ${T('90^\\circ')}.`,
        run: async (c) => { G.remove(...drops); drops = []; const r = h('div', 'u6l1-rule', `<b>${H ? 'Horizontal' : 'Vertical'}:</b> length ${T(H ? '=|x_2-x_1|' : '=|y_2-y_1|')}`); P.appendChild(r); await pop(c, r); }
      });
      return steps;
    }
  };
}

/* ======================================================================================
 * Explainer 3: why the absolute value? (a number line)
 * ====================================================================================== */
const ABS = {
  ex2a: { label: 'Example 2(a): 5 and −4', x1: 5, x2: -4 },
  d1: { label: '2 and 7', x1: 2, x2: 7 },
  d2: { label: '−6 and −1', x1: -6, x2: -1 }
};
const whyAbs = {
  title: 'Why the absolute value?',
  height: 400,
  choices: Object.keys(ABS).map((k) => ({ v: k, label: ABS[k].label })),
  intro: 'Two endpoints on the x-axis. Subtract them both ways. Press <b>Next</b>.',
  make(stage, k, ex) {
    const { x1, x2 } = ABS[k], d21 = x2 - x1, d12 = x1 - x2, len = Math.abs(d21);
    const dir = (dd) => (dd < 0 ? '<b class="u6l1-cr">left</b>' : '<b class="u6l1-cg">right</b>');
    const N = new NumberLine(stage, { x: 20, y: 12, width: ex.W - 40, height: 204, axisY: 98, min: -8, max: 8 });
    const P = panel(stage, 20, 222, 560, 170, 'Subtract both ways'), Q = panel(stage, 600, 222, ex.W - 620, 170, 'Length');
    const negD = d21 < 0 ? d21 : d12;
    return [
      { cap: `Two endpoints: ${T(`x_1=${tn(x1)}`)} and ${T(`x_2=${tn(x2)}`)}.`,
        run: async (c) => { for (const [v, n] of [[x1, 'x_1'], [x2, 'x_2']]) { const p = N.point(v, { color: BLUE, label: T(n) }); await pop(c, p); } } },
      { cap: `${T(`x_2-x_1=${minus(x2, x1)}=${tn(d21)}`)}: from ${T('x_1')} you walk <b>${len} steps</b> ${dir(d21)}.`,
        run: async (c) => { await N.hop(c, x1, x2, { label: T(tn(d21)), color: d21 < 0 ? RED : GRN, height: 54 }); await show(c, line(P, T(`x_2-x_1=${minus(x2, x1)}=${tn(d21)}`), d21 < 0 ? 'u6l1-cr' : 'u6l1-cg')); } },
      { cap: `The other order: ${T(`x_1-x_2=${minus(x1, x2)}=${tn(d12)}`)}: from ${T('x_2')} you walk <b>${len} steps</b> ${dir(d12)}.`,
        run: async (c) => { await N.hop(c, x2, x1, { label: T(tn(d12)), color: d12 < 0 ? RED : GRN, below: true, height: 54 }); await show(c, line(P, T(`x_1-x_2=${minus(x1, x2)}=${tn(d12)}`), d12 < 0 ? 'u6l1-cr' : 'u6l1-cg')); } },
      { cap: `The same <b>${len} steps</b> either way. The sign only tells <b>which way</b> you walked. A length is just <b>how far</b>.`,
        run: async (c) => { const iv = N.interval(Math.min(x1, x2), Math.max(x1, x2), { color: BLUE }); await N.drawIn(iv, 700, c); const t = h('div', 'u6l1-big u6l1-cb', `<b>${len} units</b>`); Q.appendChild(t); await pop(c, t); } },
      { cap: `Absolute value bars drop the sign: ${T(`|${tn(negD)}|=${len}`)} and ${T(`|${len}|=${len}`)}. So length ${T('=|x_2-x_1|')}, in either order.`,
        run: async (c) => {
          const b = h('div', 'u6l1-absbig', `|<i class="u6l1-minus">−</i>${len}| = ${len}`); Q.appendChild(b); await pop(c, b);
          const m = b.querySelector('.u6l1-minus'); await sleep(c, 300); await anim(c, m, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-26px)' }], 700); m.style.display = 'none';
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 4: letters for coordinates (Example 2(b), 4(b))
 * ====================================================================================== */
const LET = {
  ex2b: { label: 'Example 2(b) check', n: ['M', 'N'], P1: (a, b) => [a - 3, b], P2: (a, b) => [a + 5, b], t1: 'M(a-3,\\ b)', t2: 'N(a+5,\\ b)', H: true,
    vals: [[0, 2], [3, -4], [-4, 6]], len: 8,
    alg: ['MN=|x_N-x_M|', '=|(a+5)-(a-3)|', '=|a+5-a+3|', '=|8|=8'] },
  ex4b: { label: 'Example 4(b) check', n: ['S', 'T'], P1: (a, b) => [a, b], P2: (a, b) => [a, b - 12], t1: 'S(a,\\ b)', t2: 'T(a,\\ b-12)', H: false,
    vals: [[-3, 6], [4, 8], [-6, 3]], len: 12,
    alg: ['ST=|y_T-y_S|', '=|(b-12)-b|', '=|b-12-b|', '=|-12|=12'] }
};
const letters = {
  title: 'Letters for coordinates: slide the segment',
  height: 480,
  choices: Object.keys(LET).map((k) => ({ v: k, label: LET[k].label })),
  intro: 'Pick values for the letters, plot the segment, and measure it. Then pick new values. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = LET[k], GW = 470, col = d.H ? AMB : PUR;
    const G = new Graph(stage, { x: 8, y: 6, width: GW, height: 470, xmin: -10, xmax: 10, ymin: -10, ymax: 10, xlabels: 2, ylabels: 2 });
    const P = panel(stage, GW + 26, 6, ex.W - GW - 34, 470, 'The segment');
    line(P, `${T(d.t1)} to ${T(d.t2)}`, 'u6l1-big');
    const ro = h('div', 'u6l1-ro', `<div>${T('a')} = <b class="u6l1-va">?</b></div><div>${T('b')} = <b class="u6l1-vb">?</b></div>`); P.appendChild(ro);
    const va = ro.querySelector('.u6l1-va'), vb = ro.querySelector('.u6l1-vb');
    const cA = line(P, '', 'u6l1-big'), cB = line(P, '', 'u6l1-big'), cL = line(P, '', 'u6l1-big');
    const algBox = h('div', 'u6l1-rule'); algBox.style.opacity = 0; P.appendChild(algBox);
    const A = [0, 0], B = [0, 0];
    let seg, pA, pB, pill;
    const setTxt = (a, b) => {
      const p1 = d.P1(a, b), p2 = d.P2(a, b);
      va.textContent = tn(a).replace('-', '−'); vb.textContent = tn(b).replace('-', '−');
      cA.innerHTML = T(ptT(d.n[0], ...p1)); cB.innerHTML = T(ptT(d.n[1], ...p2)); cL.innerHTML = `length <b style="color:${col}">${d.len}</b>`;
      pA.label.innerHTML = T(ptT(d.n[0], ...p1)); pB.label.innerHTML = T(ptT(d.n[1], ...p2));
    };
    const place = (a, b) => { const p1 = d.P1(a, b), p2 = d.P2(a, b); A[0] = p1[0]; A[1] = p1[1]; B[0] = p2[0]; B[1] = p2[1]; seg._bkDraw(); G.moveTo(pA, ...A); G.moveTo(pB, ...B); G.moveTo(pill, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2); };
    const steps = d.vals.map(([a, b], i) => {
      const p1 = d.P1(a, b), p2 = d.P2(a, b);
      return {
        cap: i === 0
          ? `Try ${T(`a=${tn(a)}`)} and ${T(`b=${tn(b)}`)}: ${T(ptT(d.n[0], ...p1))} and ${T(ptT(d.n[1], ...p2))}. Length <b>${d.len}</b>.`
          : `Now ${T(`a=${tn(a)}`)} and ${T(`b=${tn(b)}`)}: the segment <b>slides</b> to ${T(ptT(d.n[0], ...p1))} and ${T(ptT(d.n[1], ...p2))}. Length still <b>${d.len}</b>.`,
        run: async (c) => {
          if (i === 0) {
            A[0] = p1[0]; A[1] = p1[1]; B[0] = p2[0]; B[1] = p2[1];
            seg = G.segment(A, B, { color: BLUE, width: 4.5 });
            pA = G.point(...A, { color: BLUE, label: '', pos: 'n', labelColor: INK }); pB = G.point(...B, { color: BLUE, label: '', pos: d.H ? 'n' : 's', labelColor: INK });
            pill = G.label((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, T(String(d.len)), { cls: 'u6l1-pill', color: col, dx: d.H ? 0 : 24, dy: d.H ? 24 : 0 });
            setTxt(a, b); await G.drawIn(seg, 600, c); await Promise.all([G.reveal(pA, c), G.reveal(pB, c)]); await pop(c, pill);
          } else {
            const [a0, b0] = d.vals[i - 1];
            await tween(c, 1300, (t) => { const aa = a0 + (a - a0) * t, bb = b0 + (b - b0) * t; place(aa, bb); va.textContent = num1(aa); vb.textContent = num1(bb); });
            place(a, b); setTxt(a, b); await pulse(c, pill, 1.25);
          }
        }
      };
    });
    steps.push({
      cap: `Algebra shows why: the ${T(d.H ? 'a' : 'b')}’s cancel and ${T(d.H ? 'b' : 'a')} never appears. The length is <b>${d.len}</b> wherever the segment sits.`,
      run: async (c) => { algBox.innerHTML = d.alg.map((s) => `<div>${T(s)}</div>`).join(''); await show(c, algBox); }
    });
    return steps;
  }
};
const num1 = (v) => String(Math.round(v * 10) / 10).replace('-', '−');

/* ======================================================================================
 * Explainer 6 (the star): the right triangle hidden under a slanted segment
 * ====================================================================================== */
const HID = {
  demo: { label: 'Demo: run 4, rise 3', A: ['P', -3, -1], B: ['Q', 1, 2] },
  ex5a: { label: 'Example 5(a) check: AB', A: ['A', -5, -2], B: ['B', -2, 7] },
  ex5b: { label: 'Example 5(b) check: CD', A: ['C', 3, 6], B: ['D', 7, -4] }
};
const hidden = {
  title: 'The right triangle hiding under a slanted segment',
  height: 500,
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
      { cap: `So ${T(`${name}=${exact}`)}${dec ? `, or ${T(dec)}` : ''} units.${rm === 1 ? ' A whole number this time!' : ''}`,
        run: async (c) => {
          await show(c, line(P, `${T(`${name}=${exact}`)}`, 'u6l1-cb'));
          if (dec) await show(c, line(P, `${T(`${name}${dec}`)} units`, 'u6l1-cb'));
          const sp = stamp(P, `${name} = ${rm === 1 ? rk : (rk === 1 ? '' : rk) + '√' + rm}`, { ok: true, size: 'sm' }); sp.style.alignSelf = 'center'; sp.style.marginTop = 'auto'; await stampIn(c, sp);
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 7: why a² + b² = c² (four triangles, rearranged)
 * ====================================================================================== */
const PY = { p34: { label: 'a = 3, b = 4', a: 3, b: 4 }, p25: { label: 'a = 2, b = 5', a: 2, b: 5 } };
const pythag = {
  title: 'Why does a² + b² = c²?',
  height: 420,
  choices: Object.keys(PY).map((k) => ({ v: k, label: PY[k].label })),
  intro: 'Four copies of one right triangle, and two ways to fit them in a square. Press <b>Next</b>.',
  make(stage, k, ex) {
    const { a, b } = PY[k], s = a + b, c2 = a * a + b * b, S = 300, u = S / s, top = 50;
    const svg = svgEl('svg', { width: ex.W, height: 420 }, stage); svg.style.position = 'absolute'; svg.style.left = '0'; svg.style.top = '0';
    const L0 = 30, R0 = 30 + S + 70;
    const px = (x0, p) => [x0 + u * p[0], top + S - u * p[1]];
    const frame = (x0) => {
      const g = svgEl('g', {}, svg);
      for (let i = 1; i < s; i++) { svgEl('line', { x1: x0 + i * u, x2: x0 + i * u, y1: top, y2: top + S, stroke: '#e3e1da', 'stroke-width': 1 }, g); svgEl('line', { x1: x0, x2: x0 + S, y1: top + i * u, y2: top + i * u, stroke: '#e3e1da', 'stroke-width': 1 }, g); }
      svgEl('rect', { x: x0, y: top, width: S, height: S, fill: 'none', stroke: INK, 'stroke-width': 3 }, g);
      return g;
    };
    const quad = (x0, pts, color, op = 0.2) => poly(svg, pts.map((p) => px(x0, p)), { fill: color, 'fill-opacity': op, stroke: color, 'stroke-width': 2.5 });
    const TRI = [[[0, 0], [a, 0], [0, b]], [[s, 0], [s, a], [a, 0]], [[s, s], [b, s], [s, a]], [[0, s], [0, b], [b, s]]];
    const MOVE = [[0, 0], [0, b], [-b, -a], [a, 0]];
    const tri = (x0, t) => { const g = svgEl('g', {}, svg); poly(g, t.map((p) => px(x0, p)), { fill: '#d9d6cc', stroke: INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }); return g; };
    const tlab = (x, y, html, color) => { const e = lab(stage, x, y, html, 'u6l1-pf-lab'); e.style.color = color || INK; return hide0(e); };
    const EQ = panel(stage, R0 + S + 30, top, ex.W - (R0 + S + 30) - 8, S, 'So');
    let gL, tL = [], tR = [], cSq, aSq, bSq;
    return [
      { cap: `A right triangle with legs ${T(`a=${a}`)}, ${T(`b=${b}`)} and hypotenuse ${T('c')}. Fit <b>four copies</b> into a big square of side ${T(`a+b=${s}`)}.`,
        run: async (c) => {
          gL = frame(L0); await appear(c, gL);
          for (const t of TRI) { const g = tri(L0, t); tL.push(g); await pop(c, g, 300); }
          const ls = [tlab(L0 + u * a / 2, top + S + 18, T('a'), AMB), tlab(L0 + u * (a + s) / 2, top + S + 18, T('b'), PUR), tlab(L0 - 16, top + S - u * b / 2, T('b'), PUR), tlab(L0 - 16, top + S - u * (b + s) / 2, T('a'), AMB)];
          for (const e of ls) await appear(c, e, 200);
        } },
      { cap: `The space left in the middle is a <b>tilted square</b> built on the hypotenuse. Its area is ${T('c^2')}.`,
        run: async (c) => { cSq = quad(L0, [[a, 0], [s, a], [b, s], [0, b]], BLUE); await appear(c, cSq, 500); const e = tlab(L0 + S / 2, top + S / 2, T('c^2'), BLUE); await pop(c, e); } },
      { cap: 'Copy the big square with the <b>same four triangles</b>, then <b>slide</b> three of them to new places.',
        run: async (c) => {
          const g = frame(R0); await appear(c, g);
          for (const t of TRI) { const e = tri(R0, t); tR.push(e); }
          await Promise.all(tR.map((e) => appear(c, e, 300)));
          for (let i = 1; i < 4; i++) { const [mx, my] = MOVE[i]; await c.anim(tR[i], [{ transform: 'translate(0px, 0px)' }, { transform: `translate(${u * mx}px, ${-u * my}px)` }], 900); }
        } },
      { cap: `Now the empty space is <b>two squares</b>: one on leg ${T('a')} (area ${T(`a^2=${a * a}`)}) and one on leg ${T('b')} (area ${T(`b^2=${b * b}`)}). Count the little squares!`,
        run: async (c) => {
          aSq = quad(R0, [[0, b], [a, b], [a, s], [0, s]], AMB); bSq = quad(R0, [[a, 0], [s, 0], [s, b], [a, b]], PUR);
          await appear(c, aSq, 400); const ea = tlab(R0 + u * a / 2, top + u * a / 2, T('a^2'), AMB); await pop(c, ea);
          await appear(c, bSq, 400); const eb = tlab(R0 + u * (a + s) / 2, top + S - u * b / 2, T('b^2'), PUR); await pop(c, eb);
        } },
      { cap: `Same big square, same four triangles taken away, so what is left over is equal: ${T('a^2+b^2=c^2')}. Here ${T(`${a}^2+${b}^2=${a * a}+${b * b}=${c2}`)}.`,
        run: async (c) => {
          const eqs = [`a^2+b^2=c^2`, `${a}^2+${b}^2=c^2`, `${a * a}+${b * b}=${c2}`, `c=\\sqrt{${c2}}${Number.isInteger(Math.sqrt(c2)) ? '=' + Math.sqrt(c2) : ''}`];
          for (const s2 of eqs) await show(c, line(EQ, T(s2), 'u6l1-big'));
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 8: simplest radical form
 * ====================================================================================== */
const SR = { r72: { label: 'Demo: √72', n: 72 }, r90: { label: 'Example 5(a): √90', n: 90 }, r116: { label: 'Example 5(b): √116', n: 116 } };
const simplify = {
  title: 'Simplest radical form: find the biggest perfect square',
  height: 420,
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

/* =============================== mount =============================== */
mountWarm();
mountFigs();
export const explainers = mountExplainers({ segment, countH: countDef(true), whyAbs, letters, countV: countDef(false), pythag, hidden, simplify });
export const _test = { CH, CV, ABS, LET, HID, PY, SR, simpRad };
