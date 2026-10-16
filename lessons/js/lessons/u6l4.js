/* Math 10C · Unit 6 · Lesson 4 — Slope Relationships: the slope formula, collinearity, parallel and perpendicular lines.
 * Warm-up orchard, static figures (Example 1, Sections 3 and 4 tap-to-plot grids) and the explainers:
 *   liftOff (rise and run lifted off the grid onto the axes), sameOrder (either point first, same order; Example 3's three
 *   students), collinear (equal slopes + shared point), missing (slide a point until its slope matches), translate
 *   (parallel = copies of one slope triangle), rotate (the slope triangle turned 90°: rise and run swap, one sign flips),
 *   negRecip (parallel and perpendicular slopes from one slope), classify (parallel / perpendicular / neither flowchart),
 *   rightAngle (slopes show a right angle), dialK (turn the k-line until it is parallel or perpendicular).
 * Colours: run amber (horizontal), rise purple (vertical), segments brand blue. */
import {
  h, tex, add, box, Graph, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  svgEl, liveCtx, pulse, rightMark, drawIn, COLORS, col
} from '../blocks.js';

const T = (s) => tex(s);
const AMB = COLORS.amber, PUR = COLORS.purple, BLUE = COLORS.blue, RED = COLORS.red, GRN = COLORS.green, TEAL = COLORS.teal, INK = COLORS.ink;

/* =============================== helpers =============================== */
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
/** simplified TeX for n/d (integers) */
function frac(n, d) {
  if (d === 0) return '\\text{undefined}';
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(Math.abs(n), d) || 1; n /= g; d /= g;
  if (d === 1) return String(n);
  return (n < 0 ? '-' : '') + `\\dfrac{${Math.abs(n)}}{${d}}`;
}
const par = (v) => (v < 0 ? `(${v})` : `${v}`);
/** slope working from P to Q: sub (the substitution), raw (rise/run), val (simplified) */
function slopeOf(P, Q) {
  const rise = Q[1] - P[1], run = Q[0] - P[0];
  const sub = `\\dfrac{${Q[1]}-${par(P[1])}}{${Q[0]}-${par(P[0])}}`, raw = `\\dfrac{${rise}}{${run}}`, val = frac(rise, run);
  return { rise, run, sub, raw, val, m: rise / run, all: `${sub}=${raw}${raw === val ? '' : '=' + val}` };
}
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u6l4-panel ' + cls, title ? `<div class="u6l4-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u6l4-line ' + cls, html); p.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const hid = (el) => { if (el) el.style.opacity = 0; return el; };
const unhide = (el) => { if (el) el.style.opacity = ''; return el; };
/** a Graph whose x and y units are the same size (so right angles look right) */
function sqG(stage, x, y, win, unit, o = {}) {
  const l = win.xmin >= 0 ? 42 : 18, b = win.ymin >= 0 ? 34 : 18;
  return new Graph(stage, Object.assign({ x, y, width: Math.round((win.xmax - win.xmin) * unit) + l + 18, height: Math.round((win.ymax - win.ymin) * unit) + 18 + b }, win, o));
}
const dOf = (pts) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
function pth(parent, pts, color, o = {}) {
  const p = svgEl('path', { class: 'bk-stroke', d: dOf(pts), fill: 'none', stroke: color, 'stroke-width': o.w || 5, 'stroke-linecap': 'round' }, parent);
  if (o.dash) p.setAttribute('stroke-dasharray', o.dash);
  return p;
}
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const ptLab = (n, x, y) => T(`${n}(${x},\\ ${y})`);
/** a slope triangle from P to Q: run (amber) along P's row, then rise (purple) up/down to Q. o: { seg, runLab, riseLab, hidden, fill } */
function tri(G, P, Q, o = {}) {
  const C = [Q[0], P[1]], p = G.toPx(...P), cc = G.toPx(...C), q = G.toPx(...Q);
  const g = svgEl('g', { class: 'u6l4-tri' }, o.parent || G.layers.data);
  g.style.transformBox = 'view-box'; g.style.transformOrigin = '0px 0px'; // blocks.css centres g transforms; rotate about a graph point instead
  const fill = svgEl('path', { d: dOf([p, cc, q]) + 'Z', fill: o.fill || PUR, 'fill-opacity': 0.09, stroke: 'none' }, g);
  const seg = o.seg ? pth(g, [p, q], col(o.seg), { w: 4.5 }) : null;
  const run = pth(g, [p, cc], AMB), rise = pth(g, [cc, q], PUR);
  const rn = Q[0] - P[0], rs = Q[1] - P[1];
  const rA = o.runAt ?? 0.5, sA = o.riseAt ?? 0.5;
  const rl = o.runLab === false ? null : G.label(P[0] + (C[0] - P[0]) * rA, P[1], o.runLab || T(`\\text{run}=${rn}`), { pos: rs >= 0 ? 's' : 'n', cls: 'bk-ptlab u6l4-runlab', gap: 7 });
  const sl = o.riseLab === false ? null : G.label(C[0], C[1] + (Q[1] - C[1]) * sA, o.riseLab || T(`\\text{rise}=${rs}`), { pos: rn >= 0 ? 'e' : 'w', cls: 'bk-ptlab u6l4-riselab', gap: 7 });
  const t = { g, fill, seg, run, rise, rl, sl, P, Q, C, labs: [rl, sl].filter(Boolean) };
  if (o.hidden !== false) [fill, seg, run, rise, rl, sl].forEach(hid);
  return t;
}
async function showTri(c, t, ms = 420) {
  if (t.seg) { unhide(t.seg); await drawIn(t.seg, ms, c); }
  unhide(t.fill); await appear(c, t.fill, 250);
  unhide(t.run); await drawIn(t.run, ms, c); if (t.rl) { unhide(t.rl); await fadeIn(c, t.rl, 250); }
  unhide(t.rise); await drawIn(t.rise, ms, c); if (t.sl) { unhide(t.sl); await fadeIn(c, t.sl, 250); }
}
const dropTri = (t) => { if (!t) return; t.g.remove(); t.labs.forEach((l) => l.remove()); };
const pt = (G, n, x, y, pos, o = {}) => G.point(x, y, Object.assign({ color: INK, label: o.name ? T(n) : ptLab(n, x, y), pos }, o));
async function showPt(c, G, p) { unhide(p); if (p.label) unhide(p.label); await G.reveal(p, c); }
const hidPt = (p) => { hid(p); if (p.label) hid(p.label); return p; };
/** where line P1Q1 meets line P2Q2 */
function meet(P1, Q1, P2, Q2) {
  const d1 = [Q1[0] - P1[0], Q1[1] - P1[1]], d2 = [Q2[0] - P2[0], Q2[1] - P2[1]], den = d1[0] * d2[1] - d1[1] * d2[0];
  const t = ((P2[0] - P1[0]) * d2[1] - (P2[1] - P1[1]) * d2[0]) / den;
  return [P1[0] + t * d1[0], P1[1] + t * d1[1]];
}
/** the right-angle square at graph point V between graph directions d1 and d2 */
function rmark(G, V, d1, d2, s = 16) {
  const v = G.toPx(...V), a = G.toPx(V[0] + d1[0], V[1] + d1[1]), b = G.toPx(V[0] + d2[0], V[1] + d2[1]);
  return rightMark(G.layers.top, v, a, b, s, { color: INK, width: 2.5 });
}

/* =============================== warm-up: trees in a row =============================== */
const TREES = [['Apple', 1, 1, '#d93b30'], ['Cherry', 4, 3, '#8f1d2a'], ['Plum', 7, 5, '#7b4fc4'], ['Pear', 11, 8, '#b5c227'], ['Peach', 13, 9, '#f08a24']];
function mountOrchard() {
  const host = document.getElementById('u6l4-orchard'); if (!host) return;
  const G = new Graph(host, { width: 600, height: 452, xmin: 0, xmax: 14.4, ymin: 0, ymax: 10.4, xlabels: 2, ylabels: 2 });
  const [x0, y0] = G.toPx(0, 0), [x1, y1] = G.toPx(14.4, 10.4);
  svgEl('rect', { x: x0, y: y1, width: x1 - x0, height: y0 - y1, fill: '#2f9e5b', 'fill-opacity': 0.07 }, G.layers.bg);
  const u = G.ux;
  for (const [name, x, y, fc] of TREES) {
    const [px, py] = G.toPx(x, y), g = svgEl('g', { class: 'u6l4-tree', transform: `translate(${px} ${py})` }, G.layers.top);
    svgEl('rect', { x: -3, y: -0.46 * u, width: 6, height: 0.46 * u, fill: '#7a4a24' }, g);
    svgEl('circle', { cx: 0, cy: -0.8 * u, r: 0.42 * u, fill: '#4fae5a', stroke: '#2f7d3a', 'stroke-width': 1.5 }, g);
    for (const [dx, dy] of [[-0.18, 0.9], [0.15, 0.95], [0.02, 0.63], [0.2, 0.68], [-0.2, 0.64]]) svgEl('circle', { cx: dx * u, cy: -dy * u, r: 0.075 * u, fill: fc }, g);
    svgEl('circle', { cx: 0, cy: 0, r: 5, fill: INK }, g);
    G.label(x, y, name, { pos: 'se', cls: 'bk-ptlab u6l4-treelab', gap: 4 });
  }
  let tris = null, ruler = null;
  document.getElementById('u6l4-wtri').addEventListener('click', async () => {
    if (tris) { tris.forEach(dropTri); tris = null; return; }
    const c = liveCtx();
    tris = [tri(G, [1, 1], [4, 3], { runLab: T('3'), riseLab: T('2') }), tri(G, [4, 3], [7, 5], { runLab: T('3'), riseLab: T('2') })];
    for (const t of tris) await showTri(c, t, 380);
  });
  document.getElementById('u6l4-wruler').addEventListener('click', async () => {
    if (ruler) { G.remove(...ruler); ruler = null; return; }
    const c = liveCtx();
    ruler = [G.line([1, 1], [13, 9], { color: RED, width: 3, dash: '10 7' })];
    await G.drawIn(ruler[0], 900, c);
    const gap = G.segment([11, 23 / 3], [11, 8], { color: RED, width: 4 }); ruler.push(gap);
    const lab = G.label(11, 7.8, `Pear: ${T('\\tfrac13')} too high!`, { pos: 'w', cls: 'bk-ptlab u6l4-redlab', gap: 12 }); ruler.push(lab);
    await G.drawIn(gap, 300, c); await fadeIn(c, lab);
  });
}

/* =============================== static figures =============================== */
function mountFigures() {
  const e1 = document.getElementById('u6l4-ex1fig');
  if (e1) {
    const G = new Graph(e1, { width: 380, height: 380, xmin: 0, xmax: 10.6, ymin: 0, ymax: 10.6, xlabels: 2, ylabels: 2 });
    G.segment([1, 2], [9, 8], { color: BLUE }); G.segment([2, 9], [8, 1], { color: BLUE });
    pt(G, 'R', 1, 2, 'se', { name: true }); pt(G, 'S', 9, 8, 'nw', { name: true }); pt(G, 'T', 2, 9, 'ne', { name: true }); pt(G, 'U', 8, 1, 'ne', { name: true });
  }
  const tap = (id, clearId, win, unit, draw) => {
    const host = document.getElementById(id); if (!host) return;
    const G = sqG(host, null, null, win, unit, { xlabels: 2, ylabels: 2, interactive: { snap: 1, coords: true, color: 'red' } });
    draw(G);
    const b = document.getElementById(clearId);
    if (b) b.addEventListener('click', () => { G.remove(...(G.userPts || [])); G.userPts = []; });
  };
  tap('u6l4-s3fig', 'u6l4-s3clear', { xmin: -10, xmax: 8, ymin: -6, ymax: 6 }, 27, (G) => {
    G.segment([-4, 3], [4, -1], { color: BLUE }); pt(G, 'A', -4, 3, 'n', { name: true, color: BLUE }); pt(G, 'B', 4, -1, 's', { name: true, color: BLUE });
  });
  tap('u6l4-s4fig', 'u6l4-s4clear', { xmin: -2, xmax: 8, ymin: -8, ymax: 6 }, 27, (G) => {
    G.segment([0, 0], [6, 3], { color: BLUE }); pt(G, 'A', 6, 3, 'n', { color: BLUE }); pt(G, 'O', 0, 0, 'sw', { name: true, color: BLUE });
  });
}

/* =============================== 1. rise and run lifted off the grid =============================== */
const W10 = { xmin: 0, xmax: 11, ymin: 0, ymax: 10 };
const LIFT = {
  demo: { label: 'Any two points', A: ['M', 2, 3, 'nw'], B: ['N', 10, 7, 'n'], win: W10, rl: 'e' },
  rs: { label: 'Example 1 check: ' + T('RS'), A: ['R', 1, 2, 'n'], B: ['S', 9, 8, 'nw'], win: W10, rl: 'e' },
  tu: { label: 'Example 1 check: ' + T('TU'), A: ['T', 2, 9, 'sw'], B: ['U', 8, 1, 'w'], win: W10, rl: 'e' },
  ex2: { label: 'Example 2 check', A: ['P', -3, 4, 'nw'], B: ['Q', 9, -6, 'sw'], win: { xmin: -7, xmax: 11, ymin: -8, ymax: 6 }, rl: 'w', lab: 2 }
};
const words = (v, pos, neg) => `${Math.abs(v)} ${v >= 0 ? pos : neg}`;
const liftOff = {
  title: 'Rise and run, lifted off the grid',
  height: 480,
  choices: Object.keys(LIFT).map((k) => ({ v: k, label: LIFT[k].label })),
  intro: 'Count the rise and the run on the grid first, then find the same numbers straight from the coordinates. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = LIFT[k], [an, x1, y1, ap] = d.A, [bn, x2, y2, bp] = d.B, A = [x1, y1], B = [x2, y2];
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 450, height: 452, xlabels: d.lab || 1, ylabels: d.lab || 1 }, d.win));
    const P = panel(stage, 484, 14, ex.W - 498, 452, 'Slope of ' + T(an + bn));
    const s = slopeOf(A, B), run = s.run, rise = s.rise;
    G.segment(A, B, { color: BLUE, width: 4.5 });
    pt(G, an, x1, y1, ap); pt(G, bn, x2, y2, bp);
    const t = tri(G, A, B, { runLab: T(`${run}`), riseLab: T(`${rise}`) });
    const dots = [];
    for (let i = 1; i <= Math.abs(run); i++) dots.push([x1 + i * Math.sign(run), y1, AMB]);
    for (let i = 1; i <= Math.abs(rise); i++) dots.push([x2, y1 + i * Math.sign(rise), PUR]);
    const dotEls = dots.map(([x, y, cl]) => { const [px, py] = G.toPx(x, y); return hid(svgEl('circle', { cx: px, cy: py, r: 4.5, fill: cl }, G.layers.top)); });
    let fBox;
    return [
      { cap: `Count squares from ${T(an)} to ${T(bn)}: run ${words(run, 'right', 'left')}, rise ${words(rise, 'up', 'down')}. Slope ${T(`=\\dfrac{\\text{rise}}{\\text{run}}=${s.raw}${s.raw === s.val ? '' : '=' + s.val}`)}.`,
        run: async (c) => {
          await showTri(c, t, 380);
          for (const e of dotEls) { unhide(e); pop(c, e, 200); await sleep(c, Math.abs(run) + Math.abs(rise) > 14 ? 30 : 55); }
          await show(c, line(P, `Counting: ${T(`\\dfrac{\\text{rise}}{\\text{run}}=${s.raw}`)}`, 'u6l4-muted'));
        } },
      { cap: `Now drop both points onto the <b>x-axis</b>. The run is the gap between the x-coordinates: ${T(`x_${bn}-x_${an}=${x2}-${par(x1)}=${run}`)}. Same as counting!`,
        run: async (c) => {
          const g1 = G.segment(A, [x1, 0], { color: 'gray', width: 2.2, dash: '6 6' }), g2 = G.segment(B, [x2, 0], { color: 'gray', width: 2.2, dash: '6 6' });
          await Promise.all([G.drawIn(g1, 500, c), G.drawIn(g2, 500, c)]);
          const arr = G.segment([x1, 0], [x2, 0], { color: AMB, width: 6, ends: [null, 'arrow'], layer: 'top' });
          await G.drawIn(arr, 600, c);
          await fadeIn(c, G.label((x1 + x2) / 2, 0, T(`${x2}-${par(x1)}=${run}`), { pos: 'n', cls: 'bk-ptlab u6l4-runlab', gap: 10 }));
          await show(c, line(P, `<b>run</b> ${T(`=x_${bn}-x_${an}=${x2}-${par(x1)}=${run}`)}`, 'u6l4-crun'));
        } },
      { cap: `Slide both points across to the <b>y-axis</b>. The rise is the gap between the y-coordinates: ${T(`y_${bn}-y_${an}=${y2}-${par(y1)}=${rise}`)}.`,
        run: async (c) => {
          const g1 = G.segment(A, [0, y1], { color: 'gray', width: 2.2, dash: '6 6' }), g2 = G.segment(B, [0, y2], { color: 'gray', width: 2.2, dash: '6 6' });
          await Promise.all([G.drawIn(g1, 500, c), G.drawIn(g2, 500, c)]);
          const arr = G.segment([0, y1], [0, y2], { color: PUR, width: 6, ends: [null, 'arrow'], layer: 'top' });
          await G.drawIn(arr, 600, c);
          await fadeIn(c, G.label(0, (y1 + y2) / 2, T(`${y2}-${par(y1)}=${rise}`), { pos: d.rl, cls: 'bk-ptlab u6l4-riselab', gap: 10 }));
          await show(c, line(P, `<b>rise</b> ${T(`=y_${bn}-y_${an}=${y2}-${par(y1)}=${rise}`)}`, 'u6l4-crise'));
        } },
      { cap: `No grid needed: subtract the coordinates, <b>y on top, x underneath, same order</b>. ${T(`m_{${an}${bn}}=${s.val}`)}.`,
        run: async (c) => {
          await c.anim(G.layers.grid, [{ opacity: 1 }, { opacity: 0.15 }], 700);
          fBox = line(P, `${T(`m_{${an}${bn}}=\\dfrac{y_${bn}-y_${an}}{x_${bn}-x_${an}}`)}<br>${T(`\\phantom{m_{${an}${bn}}}=${s.all}`)}`, 'u6l4-big');
          await show(c, fBox);
        } },
      { cap: `That is the <b>slope formula</b>: rise and run lifted off the grid. It works for any two points, even far apart or with negative coordinates.`,
        run: async (c) => { const b = line(P, `<div class="u6l4-gen">${T('m=\\dfrac{\\color{#7b4fc4}y_2-y_1}{\\color{#c27a0e}x_2-x_1}')}</div>`, 'u6l4-rulebox'); await pop(c, b); } }
    ];
  }
};

/* =============================== 2. same order, top and bottom (Example 3) =============================== */
const sameOrder = {
  title: 'Either point first, but the same order top and bottom',
  height: 480,
  choices: [{ v: 'demo', label: 'Either point first' }, { v: 'ex3', label: 'Example 3 check' }],
  intro: (v) => (v === 'demo' ? 'Find the slope of <b>AB</b> starting from A, then from B, then with the order mixed up. Press <b>Next</b>.' : 'Draw each student’s answer as a line through <b>W</b>. Does it lie along <b>WZ</b>? Press <b>Next</b>.'),
  make(stage, k, ex) {
    if (k === 'demo') {
      const A = [-3, -1], B = [5, 5];
      const G = sqG(stage, 14, 30, { xmin: -5, xmax: 7, ymin: -3, ymax: 7 }, 38);
      const P = panel(stage, G.W + 34, 14, ex.W - G.W - 48, 452, 'Slope of ' + T('AB'));
      G.segment(A, B, { color: BLUE, width: 4.5 }); pt(G, 'A', -3, -1, 'nw'); pt(G, 'B', 5, 5, 'nw');
      let t1, t2;
      return [
        { cap: `Start at ${T('A')}: run 8 right, rise 6 up. ${T('\\dfrac{5-(-1)}{5-(-3)}=\\dfrac{6}{8}=\\dfrac34')}.`,
          run: async (c) => { t1 = tri(G, A, B); await showTri(c, t1); await show(c, line(P, `<b>A first</b> ${T('\\dfrac{y_B-y_A}{x_B-x_A}=\\dfrac{5-(-1)}{5-(-3)}=\\dfrac{6}{8}=\\dfrac34')}`, 'u6l4-card')); } },
        { cap: `Start at ${T('B')} instead: run 8 <b>left</b> (−8), rise 6 <b>down</b> (−6). Both signs flip, and a negative over a negative is positive: still ${T('\\dfrac34')}.`,
          run: async (c) => { dropTri(t1); t2 = tri(G, B, A); await showTri(c, t2); await show(c, line(P, `<b>B first</b> ${T('\\dfrac{y_A-y_B}{x_A-x_B}=\\dfrac{-1-5}{-3-5}=\\dfrac{-6}{-8}=\\dfrac34')}`, 'u6l4-card')); } },
        { cap: `<b>Mixed order</b> (B − A on top, A − B underneath) flips only <b>one</b> sign: ${T('-\\dfrac34')}. That line slopes the wrong way!`,
          run: async (c) => {
            dropTri(t2);
            const L = G.line(A, [1, -4], { color: RED, width: 3, dash: '10 7' }); await G.drawIn(L, 700, c);
            await fadeIn(c, G.label(-4.2, 0.2, T('-\\tfrac34') + '?', { pos: 'n', cls: 'bk-ptlab u6l4-redlab' }));
            const r = line(P, `<b>Mixed</b> ${T('\\dfrac{y_B-y_A}{x_A-x_B}=\\dfrac{5-(-1)}{-3-5}=\\dfrac{6}{-8}=-\\dfrac34')}`, 'u6l4-card u6l4-bad'); await show(c, r);
            const s = stamp(r, '✗', { ok: false, size: 'sm' }); s.classList.add('u6l4-cstamp'); await stampIn(c, s);
          } },
        { cap: `Either point may go first, as long as the <b>same point comes first on top and on the bottom</b>.`,
          run: async (c) => { await pop(c, line(P, '<b>Same order, top and bottom.</b> Start from either end.', 'u6l4-rulebox')); } }
      ];
    }
    // Example 3: W(14, 3), Z(-6, 11)
    const W = [14, 3], Z = [-6, 11];
    const G = new Graph(stage, { x: 14, y: 14, width: 470, height: 452, xmin: -8, xmax: 16, ymin: -2, ymax: 14, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 504, 14, ex.W - 518, 452, 'Three students');
    G.segment(W, Z, { color: BLUE, width: 5 }); pt(G, 'W', 14, 3, 'sw'); pt(G, 'Z', -6, 11, 'ne');
    const STU = [
      { n: 'Amara', w: '\\dfrac{3-11}{-6-14}=\\dfrac{-8}{-20}=\\dfrac25', m: 2 / 5, ok: false, why: 'mixed order: wrong sign', cap: `<b>Amara</b> used ${T('y_W-y_Z')} on top but ${T('x_Z-x_W')} underneath. Mixed order flips the sign: her line ${T('\\tfrac25')} rises, but WZ falls.` },
      { n: 'Ben', w: '\\dfrac{-6-14}{11-3}=\\dfrac{-20}{8}=-\\dfrac52', m: -5 / 2, ok: false, why: 'run over rise: upside down', cap: `<b>Ben</b> put the run on top: run over rise. The sign is right, but ${T('-\\tfrac52')} is far too steep. His fraction is upside down.` },
      { n: 'Chloe', w: '\\dfrac{11-3}{-6-14}=\\dfrac{8}{-20}=-\\dfrac25', m: -2 / 5, ok: true, why: 'same order: correct', cap: `<b>Chloe</b> used ${T('Z')} first on top <b>and</b> underneath. Her line lies right along WZ: ${T('m_{WZ}=-\\dfrac25')} ✓` }
    ];
    let cur = null;
    const steps = [{ cap: `${T('Z')} is up on the left and ${T('W')} is down on the right: WZ <b>falls</b> from left to right, so its slope must be <b>negative</b>.`,
      run: async (c) => { const a = G.segment([-6, 11], [14, 11], { color: 'gray', width: 2, dash: '6 6' }); await G.drawIn(a, 500, c); await G.drawIn(G.segment([14, 11], W, { color: 'gray', width: 2, dash: '6 6' }), 400, c); } }];
    STU.forEach((s) => steps.push({ cap: s.cap, run: async (c) => {
      if (cur) G.remove(cur);
      cur = G.line(W, [W[0] - 4, W[1] - 4 * s.m], { color: s.ok ? GRN : RED, width: 3.5, dash: s.ok ? null : '10 7' });
      await G.drawIn(cur, 700, c);
      const r = line(P, `<div class="u6l4-stn">${s.n}</div>${T(s.w)}<div class="u6l4-why">${s.why}</div>`, 'u6l4-card u6l4-stcard' + (s.ok ? '' : ' u6l4-bad')); await show(c, r);
      const st = stamp(r, s.ok ? '✓' : '✗', { ok: s.ok, size: 'sm' }); st.classList.add('u6l4-cstamp'); await stampIn(c, st);
    } }));
    steps.push({ cap: `Correct slope: ${T('m_{WZ}=\\dfrac{y_Z-y_W}{x_Z-x_W}=\\dfrac{11-3}{-6-14}=\\dfrac{8}{-20}=-\\dfrac25')}. Check the sign and the steepness against the picture.`,
      run: async (c) => { await pulse(c, P.lastChild, 1.04); } });
    return steps;
  }
};

/* =============================== 3. collinear points =============================== */
const COL = {
  yes: { label: 'Same slope, shared point', win: { xmin: -8, xmax: 8, ymin: -5, ymax: 6 }, pts: [['P', -5, -4, 'nw'], ['Q', -1, -1, 'nw'], ['R', 7, 5, 'nw']], pairs: [[0, 1], [1, 2]], share: 1, v: 'col' },
  par: { label: 'Same slope, no shared point', win: { xmin: -8, xmax: 7, ymin: -5, ymax: 8 }, pts: [['G', -5, 1, 'nw'], ['H', 3, 7, 'nw'], ['I', -2, -4, 'se'], ['J', 6, 2, 'se']], pairs: [[0, 1], [2, 3]], segs: [[0, 1], [2, 3]], v: 'par' },
  bend: { label: 'Different slopes', win: { xmin: -8, xmax: 7, ymin: -4, ymax: 6 }, pts: [['P', -5, -3, 'nw'], ['Q', -1, 1, 'nw'], ['R', 6, 4, 'n']], pairs: [[0, 1], [1, 2]], share: 1, v: 'bend' },
  trees: { label: 'Warm-up orchard', win: { xmin: 0, xmax: 14, ymin: 0, ymax: 10 }, names: true, pts: [['Apple', 1, 1, 'nw'], ['Cherry', 4, 3, 'nw'], ['Plum', 7, 5, 'nw'], ['Pear', 11, 8, 'nw'], ['Peach', 13, 9, 'nw']], pairs: [[0, 1], [0, 2], [0, 3], [0, 4]], v: 'trees', lab: 2 },
  ex4: { label: 'Example 4 check', win: { xmin: -6, xmax: 13, ymin: -22, ymax: 12 }, pts: [['X', -4, 10, 'ne'], ['Y', 2, -2, 'ne'], ['Z', 11, -20, 'w']], pairs: [[0, 1], [1, 2]], share: 1, v: 'col', lab: 2, ylab: 4 }
};
const collinear = {
  title: 'Collinear: equal slopes and a shared point',
  height: 480,
  choices: Object.keys(COL).map((k) => ({ v: k, label: COL[k].label })),
  intro: 'Are these points on one straight line? Measure the slope between pairs of points. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = COL[k];
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 470, height: 452, xlabels: d.lab || 1, ylabels: d.ylab || d.lab || 1 }, d.win));
    const P = panel(stage, 504, 14, ex.W - 518, 452, 'Slopes');
    const PT = d.pts.map(([n, x, y]) => [x, y]);
    (d.segs || []).forEach(([i, j]) => G.segment(PT[i], PT[j], { color: BLUE, width: 4 }));
    const pts = d.pts.map(([n, x, y, pos]) => pt(G, n, x, y, pos, { name: d.names }));
    const S = d.pairs.map(([i, j]) => slopeOf(PT[i], PT[j]));
    const nm = (i, j) => (d.names ? `${d.pts[i][0]} → ${d.pts[j][0]}: ` : '');
    const mName = (i, j) => (d.names ? 'm' : `m_{${d.pts[i][0]}${d.pts[j][0]}}`);
    let t = null;
    const steps = d.pairs.map(([i, j], q) => ({
      cap: `${d.names ? `${d.pts[i][0]} to ${d.pts[j][0]}` : `${T(d.pts[i][0] + d.pts[j][0])}`}: rise ${T(String(S[q].rise))}, run ${T(String(S[q].run))}, slope ${T(S[q].val)}.${q && S[q].val !== S[0].val ? ' <b>Different!</b>' : q ? ' The same slope.' : ''}`,
      run: async (c) => {
        dropTri(t); t = tri(G, PT[i], PT[j], { runLab: T(`${S[q].run}`), riseLab: T(`${S[q].rise}`) }); await showTri(c, t, 380);
        await show(c, line(P, nm(i, j) + T(`${mName(i, j)}=${S[q].all}`), q && S[q].val !== S[0].val ? 'u6l4-hot' : ''));
      }
    }));
    const done = async (c, text, ok) => { const s = stamp(P, text, { ok }); s.classList.add('u6l4-pstamp'); await stampIn(c, s); };
    if (d.v === 'col') {
      steps.push({ cap: `${T(`${mName(0, 1)}=${mName(1, 2)}`)} <b>and</b> the two segments share the point ${T(d.pts[d.share][0])}.`,
        run: async (c) => { dropTri(t); t = null; await pulse(c, pts[d.share].label, 1.3); await show(c, line(P, `Equal slopes <b>and</b> shared point ${T(d.pts[d.share][0])}`, 'u6l4-rulebox')); } });
      steps.push({ cap: `So one straight line passes through all three points: they are <b>collinear</b>.`,
        run: async (c) => { await G.drawIn(G.line(PT[0], PT[2], { color: GRN, width: 3 }), 800, c); await done(c, 'collinear ✓', true); } });
    } else if (d.v === 'par') {
      steps.push({ cap: `Equal slopes, but ${T('GH')} and ${T('IJ')} share <b>no point</b>. Extend them: two different lines that never meet.`,
        run: async (c) => { dropTri(t); t = null; for (const [i, j] of d.segs) await G.drawIn(G.line(PT[i], PT[j], { color: BLUE, width: 2.5, dash: '10 7' }), 700, c); await show(c, line(P, 'Equal slopes, <b>no shared point</b>', 'u6l4-rulebox')); } });
      steps.push({ cap: `Equal slopes alone only prove the segments are <b>parallel</b>. Collinear needs the shared point too.`,
        run: async (c) => done(c, 'parallel, not collinear', null) });
    } else if (d.v === 'bend') {
      steps.push({ cap: `The slopes are different, so the path <b>bends</b> at ${T('Q')}. No single line passes through all three points.`,
        run: async (c) => { dropTri(t); t = null; await G.drawIn(G.polyline([PT[0], PT[1], PT[2]], { color: RED, width: 3 }), 800, c); await done(c, 'not collinear ✗', false); } });
    } else {
      steps.push({ cap: `Hold up the ruler from the Apple through the Peach: it passes ${T('x=11')} at ${T('y=7\\tfrac23')}. The <b>Pear</b> is ${T('\\tfrac13')} of a unit too high.`,
        run: async (c) => { dropTri(t); t = null; await G.drawIn(G.line(PT[0], PT[4], { color: GRN, width: 3 }), 800, c); await G.drawIn(G.segment([11, 23 / 3], [11, 8], { color: RED, width: 4 }), 300, c); await done(c, 'Pear out of line', false); } });
    }
    return steps;
  }
};

/* =============================== 3b. a missing coordinate =============================== */
const MISS = {
  demo: { label: 'Demo: ' + T('C(3,\\ k)'), A: ['A', -3, -2, 'nw'], B: ['B', 6, 4, 'nw'], C: 'C', cx: 3, v: 'k', from: 7, to: 2, win: { xmin: -7, xmax: 8, ymin: -5, ymax: 8 }, alg: ['\\dfrac{k-(-2)}{3-(-3)}=\\dfrac{2}{3}', '\\dfrac{k+2}{6}=\\dfrac23', 'k+2=4', 'k=2'] },
  ex4b: { label: 'Example 4(b) check', A: ['X', -4, 10, 'ne'], B: ['Z', 11, -20, 'w'], C: 'W', cx: 5, v: 'w', from: 4, to: -8, win: { xmin: -6, xmax: 13, ymin: -22, ymax: 12 }, lab: 2, ylab: 4, alg: ['\\dfrac{w-10}{5-(-4)}=-2', '\\dfrac{w-10}{9}=-2', 'w-10=-18', 'w=-8'] }
};
const missing = {
  title: 'A missing coordinate',
  height: 480,
  choices: Object.keys(MISS).map((k) => ({ v: k, label: MISS[k].label })),
  intro: (k) => `The point ${T(`${MISS[k].C}(${MISS[k].cx},\\ ${MISS[k].v})`)} must lie on the segment. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = MISS[k], [an, ax, ay, ap] = d.A, [bn, bx, by, bp] = d.B, A = [ax, ay], B = [bx, by], v = d.v;
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 470, height: 452, xlabels: d.lab || 1, ylabels: d.ylab || d.lab || 1 }, d.win));
    const P = panel(stage, 504, 14, ex.W - 518, 452, 'Find ' + T(v));
    const s = slopeOf(A, B);
    G.segment(A, B, { color: BLUE, width: 4.5 }); pt(G, an, ax, ay, ap); pt(G, bn, bx, by, bp);
    const st = { y: d.from };
    let Cp, seg, ro;
    const roHtml = () => { const r = st.y - ay, rn = d.cx - ax; return `${T(`${v}=${st.y}`)}: ${T(`m_{${an}${d.C}}=\\dfrac{${st.y}-${par(ay)}}{${d.cx}-${par(ax)}}=${frac(r, rn)}`)}`; };
    return [
      { cap: `First the slope of the segment: ${T(`m_{${an}${bn}}=${s.all}`)}.`,
        run: async (c) => { await show(c, line(P, T(`m_{${an}${bn}}=${s.all}`), 'u6l4-big')); } },
      { cap: `${T(d.C)} has x-coordinate ${T(String(d.cx))}, so it sits somewhere on the line ${T(`x=${d.cx}`)}. Try ${T(`${v}=${d.from}`)}: the slope from ${T(an)} is ${T(frac(d.from - ay, d.cx - ax))}. Not equal, so not on the segment.`,
        run: async (c) => {
          await G.drawIn(G.vline(d.cx, { color: 'gray', width: 2 }), 500, c);
          seg = G.curve(() => ({ subs: [[G.toPx(ax, ay), G.toPx(d.cx, st.y)]] }), { color: RED, width: 3.5, dash: '9 7' }, 'u6l4-try', G.layers.data);
          Cp = G.point(d.cx, st.y, { color: RED, r: 8, label: T(`${d.C}(${d.cx},\\ ${v})`), pos: 'e' });
          await G.drawIn(seg, 500, c); await G.reveal(Cp, c);
          ro = line(P, roHtml(), 'u6l4-ro'); await show(c, ro);
        } },
      { cap: `Slide ${T(d.C)} along ${T(`x=${d.cx}`)}, watching its slope from ${T(an)}… it lines up when ${T(`${v}=${d.to}`)}: the slope is ${T(s.val)}.`,
        run: async (c) => {
          const dir = Math.sign(d.to - d.from);
          for (let y = d.from + dir; dir > 0 ? y <= d.to : y >= d.to; y += dir) { st.y = y; seg._bkDraw(); G.moveTo(Cp, d.cx, y); ro.innerHTML = roHtml(); await sleep(c, 170); }
          Cp.querySelector('circle').setAttribute('fill', GRN); ro.classList.add('u6l4-good'); await pulse(c, ro, 1.05);
        } },
      { cap: `Algebra goes straight there: <b>set the slope with ${T(v)} in it equal to</b> ${T(s.val)} and solve. ${T(`${v}=${d.to}`)}.`,
        run: async (c) => { for (const a of d.alg) await show(c, line(P, T(a), a === d.alg[d.alg.length - 1] ? 'u6l4-big u6l4-ans' : 'u6l4-mline')); } }
    ];
  }
};

/* =============================== 4. parallel: copies of one slope triangle =============================== */
const TRANS = {
  s3: { label: 'Section 3 check', A: ['A', -4, 3, 'n'], B: ['B', 4, -1, 's'], moves: [{ dx: 3, dy: -4, n: ['C', 'D'], pos: ['w', 's'], txt: '3 right and 4 down' }, { dx: -5, dy: 2, n: ['E', 'F'], pos: ['n', 'se'], txt: '5 left and 2 up' }] },
  demo: { label: 'Another segment', A: ['K', -3, -4, 'w'], B: ['L', 0, 2, 'w'], moves: [{ dx: 5, dy: -1, n: ['M', 'N'], pos: ['e', 'e'], txt: '5 right and 1 down' }, { dx: -5, dy: 2, n: ['S', 'T'], pos: ['w', 'w'], txt: '5 left and 2 up' }] }
};
const translate = {
  title: 'Parallel lines: copies of one slope triangle',
  height: 470,
  choices: Object.keys(TRANS).map((k) => ({ v: k, label: TRANS[k].label })),
  intro: 'Slide the segment, slope triangle and all, without turning it. What happens to its slope? Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = TRANS[k], [an, ax, ay, ap] = d.A, [bn, bx, by, bp] = d.B, A = [ax, ay], B = [bx, by];
    const G = sqG(stage, 14, 60, { xmin: -10, xmax: 8, ymin: -6, ymax: 6 }, 26, { xlabels: 2, ylabels: 2 });
    const P = panel(stage, G.W + 34, 14, ex.W - G.W - 48, 440, 'Slopes');
    const s = slopeOf(A, B);
    G.segment(A, B, { color: BLUE, width: 4.5 }); pt(G, an, ax, ay, ap, { name: true }); pt(G, bn, bx, by, bp, { name: true });
    const t0 = tri(G, A, B, { runLab: T(`${s.run}`), riseLab: T(`${s.rise}`) });
    const imgs = [];
    const steps = [{ cap: `${T(an + bn)} and its slope triangle: run ${T(String(s.run))}, rise ${T(String(s.rise))}. ${T(`m_{${an}${bn}}=${s.all}`)}.`,
      run: async (c) => { await showTri(c, t0); await show(c, line(P, T(`m_{${an}${bn}}=${s.all}`))); } }];
    d.moves.forEach((mv) => {
      const C = [ax + mv.dx, ay + mv.dy], D = [bx + mv.dx, by + mv.dy], sc = slopeOf(C, D), [cn, dn] = mv.n;
      steps.push({ cap: `Translate ${mv.txt}: ${T(`${an}${pairTex2(A)}\\to ${cn}${pairTex2(C)}`)}, ${T(`${bn}${pairTex2(B)}\\to ${dn}${pairTex2(D)}`)}. The slope triangle slides along unchanged.`,
        run: async (c) => {
          const cp = tri(G, A, B, { seg: TEAL, runLab: false, riseLab: false, hidden: false });
          const [dx, dy] = [mv.dx * G.ux, -mv.dy * G.uy];
          await tween(c, 1300, (q) => cp.g.setAttribute('transform', `translate(${dx * q} ${dy * q})`));
          dropTri(cp);
          const t = tri(G, C, D, { seg: TEAL, hidden: false, runLab: T(`${sc.run}`), riseLab: T(`${sc.rise}`) }); imgs.push([C, D]);
          const p1 = pt(G, cn, ...C, mv.pos[0], { name: true, color: TEAL }), p2 = pt(G, dn, ...D, mv.pos[1], { name: true, color: TEAL });
          await Promise.all([G.reveal(p1, c), G.reveal(p2, c), ...t.labs.map((l) => fadeIn(c, l))]);
          await show(c, line(P, T(`m_{${cn}${dn}}=${sc.all}`)));
        } });
    });
    steps.push({ cap: `Same rise, same run, so the <b>same slope</b> every time. A translated copy points the same way: <b>parallel lines have equal slopes</b>.`,
      run: async (c) => {
        const Ls = [[A, B], ...imgs].map(([p, q]) => G.line(p, q, { color: 'gray', width: 2, dash: '8 7' }));
        await Promise.all(Ls.map((L) => G.drawIn(L, 800, c)));
        await pop(c, line(P, `<b>Parallel</b> ${T('\\Leftrightarrow')} <b>equal slopes</b>`, 'u6l4-rulebox'));
      } });
    return steps;
  }
};
const pairTex2 = (p) => `(${p[0]},\\ ${p[1]})`;

/* =============================== 5. perpendicular: rotate the slope triangle 90° =============================== */
const ROT = {
  s4: { label: 'Section 4 check: ' + T('A(6,\\ 3)'), a: 6, b: 3, n: 'A' },
  d25: { label: T('(2,\\ 5)'), a: 2, b: 5, n: 'A' },
  d51: { label: T('(5,\\ 1)'), a: 5, b: 1, n: 'A' },
  gen: { label: 'Any point ' + T('P(a,\\ b)'), a: 5, b: 3, n: 'P', gen: true }
};
const rotate = {
  title: 'Perpendicular: turn the slope triangle 90°',
  height: 490,
  choices: Object.keys(ROT).map((k) => ({ v: k, label: ROT[k].label })),
  intro: 'Rotate the segment and its slope triangle a quarter-turn clockwise about the origin. Watch what happens to the rise and the run. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = ROT[k], a = d.a, b = d.b, g = d.gen, n = d.n, n2 = g ? 'Q' : n + "'";
    const G = sqG(stage, 14, 14, { xmin: -2, xmax: 8, ymin: -8, ymax: 6 }, 31, { xlabels: 2, ylabels: 2 });
    const P = panel(stage, G.W + 34, 14, ex.W - G.W - 48, 462, 'Slopes');
    const O = [0, 0], A = [a, b], A2 = [b, -a];
    const at = g ? 'a' : String(a), bt = g ? 'b' : String(b);
    G.segment(O, A, { color: BLUE, width: 4.5 });
    G.point(0, 0, { color: INK, label: T('O'), pos: 'sw' });
    G.point(a, b, { color: BLUE, label: g ? T('P(a,\\ b)') : ptLab(n, a, b), pos: 'n' });
    const t0 = tri(G, O, A, { runLab: T(`\\text{run}=${at}`), riseLab: T(`\\text{rise}=${bt}`) });
    const m1 = g ? '\\dfrac{b}{a}' : frac(b, a), m2 = g ? '-\\dfrac{a}{b}' : frac(-a, b);
    let cp, l1, l2;
    const [ox, oy] = G.toPx(0, 0);
    return [
      { cap: `${T('O' + n)}: run ${T(at)}, rise ${T(bt)}. ${T(`m_{O${n}}=\\dfrac{${bt}}{${at}}${g || m1 === `\\dfrac{${b}}{${a}}` ? '' : '=' + m1}`)}.`,
        run: async (c) => { await showTri(c, t0); await show(c, line(P, T(`m_{O${n}}=\\dfrac{${bt}-0}{${at}-0}=${g ? m1 : `\\dfrac{${b}}{${a}}` + (frac(b, a) === `\\dfrac{${b}}{${a}}` ? '' : '=' + m1)}`), 'u6l4-big')); } },
      { cap: `Turn the whole triangle <b>90° clockwise</b> about ${T('O')}. ${g ? T('P(a,\\ b)\\to Q(b,\\ -a)') : T(`${n}(${a},\\ ${b})\\to ${n2}(${b},\\ ${-a})`)}: swap the coordinates, then change the sign of the new y.`,
        run: async (c) => {
          cp = tri(G, O, A, { seg: RED, runLab: false, riseLab: false, hidden: false });
          await tween(c, 1700, (q) => cp.g.setAttribute('transform', `rotate(${90 * q} ${ox} ${oy})`));
          const p2 = G.point(b, -a, { color: RED, label: g ? T('Q(b,\\ -a)') : ptLab(n2, b, -a), pos: 'e' }); await G.reveal(p2, c);
        } },
      { cap: `The old <b>run</b> (amber) now stands up, pointing <b>down</b>: it is the new rise, ${T(g ? '-a' : String(-a))}. The old <b>rise</b> (purple) now lies flat: the new run, ${T(bt)}. <b>Rise and run swap, and one sign flips.</b>`,
        run: async (c) => {
          l1 = G.label(0, -a / 2, T(`\\text{rise}=${g ? '-a' : -a}`), { pos: 'e', cls: 'bk-ptlab u6l4-runlab', gap: 8 });
          l2 = G.label(b / 2, -a, T(`\\text{run}=${bt}`), { pos: 's', cls: 'bk-ptlab u6l4-riselab', gap: 8 });
          await Promise.all(t0.labs.map((l) => c.anim(l, [{ opacity: 1 }, { opacity: 0.3 }], 300)));
          await fadeIn(c, l1); await pulse(c, l1, 1.15); await fadeIn(c, l2); await pulse(c, l2, 1.15);
        } },
      { cap: `${T(`m_{O${n2}}=\\dfrac{${g ? '-a' : -a}}{${bt}}${g ? '' : '=' + m2}`)}: the slope turned <b>upside down</b> and <b>changed sign</b>. That is the <b>negative reciprocal</b>.`,
        run: async (c) => { await show(c, line(P, T(`m_{O${n2}}=\\dfrac{${g ? '-a' : -a}-0}{${bt}-0}=${g ? m2 : `\\dfrac{${-a}}{${b}}` + (m2 === `\\dfrac{${-a}}{${b}}` ? '' : '=' + m2)}`), 'u6l4-big')); } },
      { cap: `Multiply: ${T(`${m1}\\times${m2.startsWith('-') ? `\\left(${m2}\\right)` : m2}=-1`)}. Perpendicular slopes always have a product of ${T('-1')}.`,
        run: async (c) => {
          const mk = rmark(G, O, [a, b], [b, -a], 18); mk.style.opacity = 0; await appear(c, mk);
          const r = line(P, T(`m_{O${n}}\\times m_{O${n2}}=${m1}\\times${m2.startsWith('-') ? `\\left(${m2}\\right)` : m2}=-1`), 'u6l4-rulebox'); await pop(c, r);
          if (g) await show(c, line(P, `for any ${T('a,\\ b\\ne0')}`, 'u6l4-muted'));
        } }
    ];
  }
};

/* =============================== 6. parallel and perpendicular slopes from one slope =============================== */
const NR = {
  ex5: { label: 'Example 5 check: ' + T('\\tfrac58'), win: { xmin: -8, xmax: 10, ymin: -8, ymax: 8 }, unit: 25,
    g: { P: [-7, -3], Q: [1, 2], n: ['A', 'C'], pos: ['w', 'n'] }, p: { P: [-1, -7], Q: [7, -2], n: ['G', 'H'], pos: ['w', 'e'] }, q: { P: [-3, 6], Q: [2, -2], n: ['B', 'F'], pos: ['e', 'e'] },
    given: 'm_{AC}=\\dfrac58', parT: 'm_{GH}=\\dfrac58', f0: '\\dfrac58', f1: '\\dfrac85', f2: '-\\dfrac85', perpT: 'm_{BF}=-\\dfrac85', check: '\\dfrac58\\times\\left(-\\dfrac85\\right)=-1' },
  ex6: { label: 'Example 6 check', win: { xmin: -2, xmax: 12, ymin: -6, ymax: 10 }, unit: 27, calc: true,
    g: { P: [3, 8], Q: [9, -4], n: ['P', 'Q'], pos: ['e', 'w'], coords: true }, p: { P: [-1, 9], Q: [5, -3] }, q: { P: [0, -1], Q: [12, 5] },
    given: 'm_{PQ}=\\dfrac{-12}{6}=-2', givenCap: 'm_{PQ}=\\dfrac{-4-8}{9-3}=\\dfrac{-12}{6}=-2', parT: 'm=-2', f0: '-\\dfrac21', f1: '-\\dfrac12', f2: '\\dfrac12', perpT: 'm=\\dfrac12', check: '-2\\times\\dfrac12=-1' },
  d3: { label: 'Slope ' + T('3'), win: { xmin: -6, xmax: 6, ymin: -6, ymax: 6 }, unit: 35,
    g: { P: [-4, -4], Q: [-2, 2] }, p: { P: [1, -5], Q: [3, 1] }, q: { P: [-5, 3], Q: [1, 1] },
    given: 'm=3', parT: 'm=3', f0: '\\dfrac31', f1: '\\dfrac13', f2: '-\\dfrac13', perpT: 'm=-\\dfrac13', check: '3\\times\\left(-\\dfrac13\\right)=-1' },
  zero: { label: 'Slope ' + T('0'), win: { xmin: -6, xmax: 6, ymin: -6, ymax: 6 }, unit: 35, zero: true,
    g: { P: [-4, 1], Q: [4, 1] }, p: { P: [-4, -3], Q: [4, -3] }, q: { P: [0, -5], Q: [0, 5] },
    given: 'm=0', parT: 'm=0', f0: '\\dfrac01', f1: '\\dfrac10', f2: '\\text{undefined}', perpT: '\\text{undefined (vertical)}', check: '' }
};
const negRecip = {
  title: 'Parallel and perpendicular slopes from one slope',
  height: 480,
  choices: Object.keys(NR).map((k) => ({ v: k, label: NR[k].label })),
  intro: 'Given one slope: a <b>parallel</b> line copies the slope triangle; a <b>perpendicular</b> line turns it 90°. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = NR[k];
    const G = sqG(stage, 14, 14, d.win, d.unit, { xlabels: 2, ylabels: 2 });
    const P = panel(stage, G.W + 34, 14, ex.W - G.W - 48, 452, '');
    const seg = (s, color) => {
      const el = G.segment(s.P, s.Q, { color, width: 4.5 }); hid(el);
      const ps = s.n ? s.n.map((nn, i) => hidPt(pt(G, nn, ...(i ? s.Q : s.P), s.pos[i], { name: !s.coords, color }))) : [];
      return { el, ps, show: async (c) => { unhide(el); await G.drawIn(el, 600, c); for (const p of ps) await showPt(c, G, p); } };
    };
    const S1 = seg(d.g, BLUE), S2 = seg(d.p, TEAL), S3 = seg(d.q, RED);
    const short = (s) => ({ runLab: T(`${s.Q[0] - s.P[0]}`), riseLab: T(`${s.Q[1] - s.P[1]}`) });
    const t1 = d.zero ? null : tri(G, d.g.P, d.g.Q, short(d.g));
    const t2 = d.zero ? null : tri(G, d.p.P, d.p.Q, short(d.p)), t3 = d.zero ? null : tri(G, d.q.P, d.q.Q, short(d.q));
    const row = (lab, cls) => { const r = h('div', 'u6l4-nrrow ' + cls, `<div class="u6l4-nrl">${lab}</div><div class="u6l4-nrv"></div>`); P.appendChild(r); hid(r); return r; };
    const rG = row('Given', 'u6l4-nrg'), rP = row('Parallel', 'u6l4-nrp'), rQ = row('Perpendicular', 'u6l4-nrq'), rC = row('Check', 'u6l4-nrc');
    const card = h('span', 'u6l4-fcard', T(d.f0));
    const at = d.zero ? [0, 1] : meet(d.g.P, d.g.Q, d.q.P, d.q.Q);
    const dir = (s) => [s.Q[0] - s.P[0], s.Q[1] - s.P[1]];
    const flip = async (c, el, html) => { await c.anim(el, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }], 260); el.innerHTML = html; await c.anim(el, [{ transform: 'rotateY(90deg)' }, { transform: 'rotateY(0deg)' }], 260); };
    return [
      { cap: d.calc ? `First the slope of ${T('PQ')}: ${T(d.givenCap)}.` : `The given segment has slope ${T(d.given.split('=').pop())}${d.zero ? ': it is horizontal' : ''}.`,
        run: async (c) => { await S1.show(c); if (!d.zero) await showTri(c, t1, 380); rG.querySelector('.u6l4-nrv').innerHTML = T(d.given); unhide(rG); await show(c, rG); } },
      { cap: `<b>Parallel:</b> slide a copy of the same slope triangle somewhere else. Same rise, same run: ${T(d.parT)}.`,
        run: async (c) => { await S2.show(c); if (t2) await showTri(c, t2, 380); rP.querySelector('.u6l4-nrv').innerHTML = T(d.parT); unhide(rP); await show(c, rP); } },
      { cap: d.zero ? `<b>Perpendicular:</b> write ${T('0=\\dfrac01')} and flip it: ${T('\\dfrac10')}, division by zero. The slope is <b>undefined</b>.` : `<b>Perpendicular:</b> turning the triangle 90° swaps rise and run, so <b>flip the fraction</b>: ${T(d.f0)} becomes ${T(d.f1)}.`,
        run: async (c) => { const v = rQ.querySelector('.u6l4-nrv'); v.innerHTML = ''; v.appendChild(card); unhide(rQ); await show(c, rQ); await sleep(c, 250); await flip(c, card, T(d.f1)); } },
      { cap: d.zero ? `Undefined slope means a <b>vertical</b> line. Special case: horizontal and vertical lines are <b>perpendicular</b>, even though ${T('0')} and undefined can’t be multiplied.` : `…and one sign flips: <b>change the sign</b>. ${T(d.perpT)}, the <b>negative reciprocal</b>.`,
        run: async (c) => {
          if (d.zero) card.innerHTML = T(d.f2); else await flip(c, card, T(d.f2));
          await S3.show(c); if (t3) await showTri(c, t3, 380);
          const mk = rmark(G, at, dir(d.g), dir(d.q), 15); mk.style.opacity = 0; await appear(c, mk);
        } },
      { cap: d.zero ? `Two horizontal lines (slope 0) are parallel; a horizontal and a vertical line are perpendicular.` : `Check: ${T(d.check)} ✓. Perpendicular slopes multiply to ${T('-1')}.`,
        run: async (c) => { rC.querySelector('.u6l4-nrv').innerHTML = d.zero ? 'horizontal ⊥ vertical' : T(d.check); unhide(rC); await pop(c, rC); } }
    ];
  }
};

/* =============================== 6b. parallel, perpendicular, or neither =============================== */
const CL = {
  c: { label: 'Example 5(c) check', m1: '\\dfrac{3}{10}', m2: '\\dfrac{9}{30}', eq: '\\dfrac{9}{30}=\\dfrac{3}{10}=m_1', isEq: true, L: [{ m: 0.3, b: 1.5 }, { m: 0.3, b: -1.5 }], v: 'par',
    caps: ['Simplify first: ' + T('\\dfrac{9}{30}=\\dfrac{3}{10}') + '. The slopes are <b>equal</b>.', 'Equal slopes: the lines are <b>parallel</b>.'] },
  d: { label: 'Example 5(d) check', m1: '\\dfrac{4}{9}', m2: '-\\dfrac{9}{4}', eq: '\\dfrac49\\ne-\\dfrac94', prod: '\\dfrac{4}{9}\\times\\left(-\\dfrac{9}{4}\\right)=-1', L: [{ m: 4 / 9, b: 0 }, { m: -9 / 4, b: 0 }], v: 'perp',
    caps: ['Not equal, so not parallel.', 'Multiply: ' + T('\\dfrac{4}{9}\\times\\left(-\\dfrac{9}{4}\\right)=-1') + '. Negative reciprocals: <b>perpendicular</b>.'] },
  trap: { label: T('\\tfrac23') + ' and ' + T('\\tfrac32'), m1: '\\dfrac{2}{3}', m2: '\\dfrac{3}{2}', eq: '\\dfrac23\\ne\\dfrac32', prod: '\\dfrac{2}{3}\\times\\dfrac{3}{2}=1\\ne-1', L: [{ m: 2 / 3, b: 0 }, { m: 1.5, b: 0 }], v: 'nei',
    caps: ['Not equal, so not parallel.', 'The product is ' + T('+1') + ', not ' + T('-1') + '. Flipped but the sign never changed: <b>neither</b>.'] },
  hv: { label: T('0') + ' and undefined', m1: '0', m2: '\\text{undefined}', eq: '0\\ne\\text{undefined}', prod: '0\\times\\text{undefined}:\\ \\text{can’t multiply}', L: [{ m: 0, b: 1.5 }, { x: 1.5 }], v: 'perp',
    caps: ['Not equal, so not parallel.', 'They can’t be multiplied, but slope 0 is horizontal and undefined is vertical: the special case, <b>perpendicular</b>.'] }
};
const classify = {
  title: 'Parallel, perpendicular, or neither?',
  height: 480,
  choices: Object.keys(CL).map((k) => ({ v: k, label: CL[k].label })),
  intro: 'Follow the flowchart with two slopes. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CL[k], FW = ex.W - 400;
    const P = panel(stage, 14, 14, 366, 222, 'The two slopes', 'u6l4-sm');
    const G = sqG(stage, 30, 244, { xmin: -6, xmax: 6, ymin: -4, ymax: 4 }, 25, { numbers: false });
    const c1 = FW * 0.33, c2 = FW - 112;
    const F = new Flowchart(stage, { x: 392, y: 14, width: FW, height: 452,
      nodes: {
        start: { x: c1, y: 44, w: 290, h: 58, html: `<b>Two slopes</b>${T('m_1')} and ${T('m_2')}`, cls: 'bk-round' },
        eq: { x: c1, y: 160, w: 290, h: 64, html: '<b>Equal?</b>simplify first', color: 'blue' },
        par: { x: c2, y: 160, w: 200, h: 64, html: '<b>Parallel</b>', color: 'teal' },
        prod: { x: c1, y: 284, w: 290, h: 64, html: `<b>Product ${T('=-1')}?</b>`, color: 'blue' },
        perp: { x: c2, y: 284, w: 200, h: 78, html: '<b>Perpendicular</b><span class="u6l4-fsm">or one 0, one undefined</span>', color: 'red' },
        nei: { x: c1, y: 402, w: 290, h: 58, html: '<b>Neither</b>', color: 'slate' }
      },
      edges: [{ from: 'start', to: 'eq' }, { from: 'eq', to: 'par', label: 'yes' }, { from: 'eq', to: 'prod', label: 'no' }, { from: 'prod', to: 'perp', label: 'yes' }, { from: 'prod', to: 'nei', label: 'no' }] });
    const lines = d.L.map((L, i) => { const el = G.line(L.x != null ? { x: L.x } : { m: L.m, b: L.b }, { color: i ? RED : BLUE, width: 3.5 }); hid(el); return el; });
    const steps = [
      { cap: `Start with ${T(`m_1=${d.m1}`)} and ${T(`m_2=${d.m2}`)}.`,
        run: async (c) => { await F.visit(c, 'start'); await show(c, line(P, `${T(`m_1=${d.m1}`)}, &nbsp; ${T(`m_2=${d.m2}`)}`, 'u6l4-mline')); } },
      { cap: d.caps[0],
        run: async (c) => { await F.go(c, 'start', 'eq'); await F.visit(c, 'eq'); await show(c, line(P, T(d.eq), d.isEq ? 'u6l4-good' : '')); } }
    ];
    if (d.v === 'par') {
      steps.push({ cap: d.caps[1], run: async (c) => { await F.go(c, 'eq', 'par'); await F.visit(c, 'par'); for (const L of lines) { unhide(L); await G.drawIn(L, 600, c); } } });
    } else {
      steps.push({ cap: d.caps[1], run: async (c) => { await F.go(c, 'eq', 'prod'); await F.visit(c, 'prod'); await show(c, line(P, T(d.prod), d.v === 'perp' ? 'u6l4-good' : 'u6l4-hot')); } });
      steps.push({ cap: d.v === 'perp' ? 'The lines meet at a right angle.' : 'The lines cross, but not at a right angle.',
        run: async (c) => {
          await F.go(c, 'prod', d.v); await F.visit(c, d.v);
          for (const L of lines) { unhide(L); await G.drawIn(L, 600, c); }
          if (d.v === 'perp') { const V = d.L[1].x != null ? [1.5, 1.5] : [0, 0], d1 = d.L[0].m != null ? [1, d.L[0].m] : [0, 1], d2 = d.L[1].x != null ? [0, -1] : [1, d.L[1].m]; const mk = rmark(G, V, d1, d2, 14); mk.style.opacity = 0; await appear(c, mk); }
        } });
    }
    return steps;
  }
};

/* =============================== 7. using slope to find a right angle =============================== */
const RA = {
  ex7: { label: 'Example 7 check', win: { xmin: -5, xmax: 3, ymin: -3, ymax: 7 }, unit: 42, pts: [['D', -3, 1, 'w'], ['E', -1, 5, 'ne'], ['F', 1, -1, 'e']] },
  demo: { label: 'Triangle ' + T('JKL') + ': test every corner', win: { xmin: -4, xmax: 5, ymin: -3, ymax: 6 }, unit: 46, pts: [['J', -2, -1, 'sw'], ['K', 3, 1, 'e'], ['L', 0, 4, 'n']] }
};
const prodTex = (a, b) => `${a}\\times${b.startsWith('-') ? `\\left(${b}\\right)` : b}`;
const rightAngle = {
  title: 'Using slope to find a right angle',
  height: 480,
  choices: Object.keys(RA).map((k) => ({ v: k, label: RA[k].label })),
  intro: (k) => (k === 'ex7' ? 'Is the angle at <b>D</b> a right angle? Test the two sides that meet there. Press <b>Next</b>.' : 'Is triangle <b>JKL</b> right-angled anywhere? Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = RA[k];
    const G = sqG(stage, 14, 14, d.win, d.unit, { xlabels: 1, ylabels: 1 });
    const P = panel(stage, G.W + 34, 14, ex.W - G.W - 48, 452, 'Slopes');
    const V = d.pts.map(([n, x, y]) => [x, y]), N = d.pts.map((p) => p[0]);
    const triEl = G.polyline(V, { closed: true, color: BLUE, width: 4, fill: BLUE, fillOpacity: 0.05 }); hid(triEl);
    const pts = d.pts.map(([n, x, y, pos]) => hidPt(pt(G, n, x, y, pos)));
    const plot = { cap: k === 'ex7' ? `Plot ${T('\\triangle DEF')}. The angle at ${T('D')} is formed by the sides ${T('DE')} and ${T('DF')}.` : `Plot ${T('\\triangle JKL')}. A right angle could be at any of the three corners.`,
      run: async (c) => { unhide(triEl); await G.drawIn(triEl, 800, c); for (const p of pts) await showPt(c, G, p); } };
    if (k === 'ex7') {
      const [D, E, F] = V, sE = slopeOf(D, E), sF = slopeOf(D, F);
      const tE = tri(G, D, E, { runLab: T('2'), riseLab: T('4') }), tF = tri(G, D, F, { runLab: T('4'), riseLab: T('-2'), runAt: 0.6 });
      const [dx, dy] = G.toPx(...D);
      return [plot,
        { cap: `${T('DE')}: run 2, rise 4. ${T(`m_{DE}=${sE.all}`)}.`, run: async (c) => { await showTri(c, tE, 380); await show(c, line(P, T(`m_{DE}=${sE.all}`))); } },
        { cap: `${T('DF')}: run 4, rise −2. ${T(`m_{DF}=${sF.all}`)}.`, run: async (c) => { await showTri(c, tF, 380); await show(c, line(P, T(`m_{DF}=${sF.all}`))); } },
        { cap: `Turn ${T('DE')}’s slope triangle 90° clockwise about ${T('D')}: it lands right along ${T('DF')}. Rise and run swap (4 and 2), and one sign flips.`,
          run: async (c) => {
            const cp = tri(G, D, E, { seg: RED, runLab: false, riseLab: false, hidden: false });
            await tween(c, 1500, (q) => cp.g.setAttribute('transform', `rotate(${90 * q} ${dx} ${dy})`));
          } },
        { cap: `${T(`m_{DE}\\times m_{DF}=${prodTex('2', '-\\dfrac12')}=-1`)}, so ${T('DE\\perp DF')}: ${T('\\triangle DEF')} is <b>right-angled at</b> ${T('D')}.`,
          run: async (c) => {
            const mk = rmark(G, D, [2, 4], [4, -2], 18); mk.style.opacity = 0; await appear(c, mk);
            await pop(c, line(P, T(`m_{DE}\\times m_{DF}=${prodTex('2', '-\\dfrac12')}=-1`), 'u6l4-rulebox'));
            const s = stamp(stage, 'right angle at D ✓', { ok: true, x: G.W / 2 + 14, y: 44 }); await stampIn(c, s);
          } }
      ];
    }
    const [J, K, L] = V, sJK = slopeOf(J, K), sJL = slopeOf(J, L), sKL = slopeOf(K, L);
    return [plot,
      { cap: `The three slopes: ${T(`m_{JK}=${sJK.val}`)}, ${T(`m_{JL}=${sJL.val}`)}, ${T(`m_{KL}=${sKL.val}`)}.`,
        run: async (c) => { for (const [n, s] of [['JK', sJK], ['JL', sJL], ['KL', sKL]]) await show(c, line(P, T(`m_{${n}}=${s.all}`), 'u6l4-mline')); } },
      { cap: `At ${T('J')}: ${T(`${prodTex(sJK.val, sJL.val)}=1`)}. Reciprocals, but the sign did not flip: <b>not</b> a right angle.`,
        run: async (c) => { await pulse(c, pts[0].label, 1.3); await show(c, line(P, `at ${T('J')}: ${T(`${prodTex(sJK.val, sJL.val)}=1`)}`, 'u6l4-hot')); } },
      { cap: `At ${T('K')}: ${T(`${prodTex(sJK.val, sKL.val)}=-\\dfrac25`)}. At ${T('L')}: ${T(`${prodTex(sJL.val, sKL.val)}=-\\dfrac52`)}. Neither is ${T('-1')}.`,
        run: async (c) => { await show(c, line(P, `at ${T('K')}: ${T(`${prodTex(sJK.val, sKL.val)}=-\\dfrac25`)}`, 'u6l4-hot')); await show(c, line(P, `at ${T('L')}: ${T(`${prodTex(sJL.val, sKL.val)}=-\\dfrac52`)}`, 'u6l4-hot')); } },
      { cap: `No pair of sides has a product of ${T('-1')}, so ${T('\\triangle JKL')} has <b>no right angle</b>. Testing every corner is the only way to be sure.`,
        run: async (c) => { const s = stamp(stage, 'no right angle', { ok: false, x: G.W / 2 + 14, y: 44 }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== 8. solving for an unknown slope: turn the k-line =============================== */
const KD = {
  a: { label: 'Example 8(a) check: parallel', to: -7.5, v: 'par',
    alg: ['\\dfrac{k}{9}=-\\dfrac{5}{6}', 'k=9\\times\\left(-\\dfrac{5}{6}\\right)=-\\dfrac{45}{6}', 'k=-\\dfrac{15}{2}\\ (=-7.5)'] },
  b: { label: 'Example 8(b) check: perpendicular', to: 10.8, v: 'perp',
    alg: ['-\\dfrac{5}{6}\\times\\dfrac{k}{9}=-1', '-\\dfrac{5k}{54}=-1\\ \\Rightarrow\\ 5k=54', 'k=\\dfrac{54}{5}\\ (=10.8)'] }
};
const dialK = {
  title: 'Turn the dial: find k',
  height: 490,
  choices: Object.keys(KD).map((k) => ({ v: k, label: KD[k].label })),
  intro: `One line has slope ${T('-\\tfrac56')}. The other has run 9 and rise <b>k</b>. Change k until the lines are right. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = KD[k];
    const G = sqG(stage, 14, 14, { xmin: -10, xmax: 10, ymin: -10, ymax: 10 }, 21.5, { xlabels: 2, ylabels: 2 });
    const P = panel(stage, G.W + 34, 14, ex.W - G.W - 48, 462, 'Find ' + T('k'));
    const fix = (x) => 3 - (5 / 6) * x, S = [-8, -2], st = { k: 3 };
    const L1 = G.fn(fix, { color: BLUE, width: 3.5 }); hid(L1);
    const t1 = tri(G, [-6, 8], [0, 3], { runLab: T('6'), riseLab: T('-5') });
    const L2 = G.curve(() => { const m = st.k / 9, a = [-10, S[1] + m * (-10 - S[0])], b = [10, S[1] + m * (10 - S[0])]; return { subs: [[G.toPx(...a), G.toPx(...b)]] }; }, { color: RED, width: 3.5 }, 'u6l4-kline', G.layers.data); hid(L2);
    const g2 = svgEl('g', {}, G.layers.data); hid(g2);
    const run2 = pth(g2, [G.toPx(...S), G.toPx(1, S[1])], AMB), rise2 = svgEl('path', { class: 'bk-stroke', fill: 'none', stroke: PUR, 'stroke-width': 5, 'stroke-linecap': 'round' }, g2);
    const fill2 = svgEl('path', { fill: PUR, 'fill-opacity': 0.09 }, g2);
    const lr = G.label(-3.5, S[1], T('9'), { pos: 's', cls: 'bk-ptlab u6l4-runlab', gap: 6 }); hid(lr);
    const lk = G.label(1, S[1], T('k'), { pos: 'e', cls: 'bk-ptlab u6l4-riselab', gap: 8 }); hid(lk);
    const drawK = () => {
      const q = [1, S[1] + st.k]; L2._bkDraw();
      rise2.setAttribute('d', dOf([G.toPx(1, S[1]), G.toPx(...q)])); fill2.setAttribute('d', dOf([G.toPx(...S), G.toPx(1, S[1]), G.toPx(...q)]) + 'Z');
      lk.gy = S[1] + st.k / 2; lk._bkDraw();
    };
    drawK();
    const fmtK = (v) => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(1)).replace('-', '−');
    const ro = h('div', 'u6l4-kro'); P.appendChild(ro); hid(ro);
    const setRo = (exact) => { ro.innerHTML = `<div>${T('k')} = <b>${exact ? fmtK(st.k) : fmtK(Math.round(st.k * 10) / 10)}</b></div><div class="u6l4-muted">slope ${T('\\dfrac{k}{9}')} ≈ ${(st.k / 9).toFixed(2).replace('-', '−')}</div>`; };
    const X = meet([0, 3], [6, -2], S, [1, S[1] + d.to]);
    return [
      { cap: `The blue line has slope ${T('-\\dfrac56')}: run 6, rise ${T('-5')}.`,
        run: async (c) => { unhide(L1); await G.drawIn(L1, 700, c); await showTri(c, t1, 380); await show(c, line(P, `${T('m_1=-\\dfrac56')}, &nbsp; ${T('m_2=\\dfrac{k}{9}')}`, 'u6l4-mline')); } },
      { cap: `The red line’s slope triangle has run ${T('9')} and rise ${T('k')}, so its slope is ${T('\\dfrac{k}{9}')}. Try ${T('k=3')}: slope ${T('\\tfrac13')}.`,
        run: async (c) => { unhide(L2); await G.drawIn(L2, 700, c); unhide(g2); await appear(c, g2); unhide(lr); unhide(lk); await fadeIn(c, lr); await fadeIn(c, lk); setRo(true); unhide(ro); await show(c, ro); } },
      { cap: d.v === 'par' ? `Turn the dial down: the red line swings round until it runs <b>parallel</b> to the blue one, at ${T('k=-7.5')}.` : `Turn the dial up: the red line swings round until it crosses the blue one at a <b>right angle</b>, at ${T('k=10.8')}.`,
        run: async (c) => {
          const k0 = st.k;
          await tween(c, 2200, (q) => { st.k = k0 + (d.to - k0) * q; drawK(); setRo(false); });
          st.k = d.to; drawK(); setRo(true);
          if (d.v === 'perp') { const mk = rmark(G, X, [6, -5], [9, d.to], 15); mk.style.opacity = 0; await appear(c, mk); }
          const s = stamp(stage, d.v === 'par' ? 'parallel' : 'perpendicular', { ok: true, x: G.W / 2 + 14, y: 40 }); await stampIn(c, s);
        } },
      { cap: d.v === 'par' ? `Algebra: parallel means <b>equal slopes</b>, so ${T('\\dfrac{k}{9}=-\\dfrac56')}. Multiply both sides by 9: ${T('k=-\\dfrac{15}{2}')}.` : `Algebra: perpendicular means the <b>product is</b> ${T('-1')}: ${T('-\\dfrac56\\times\\dfrac{k}{9}=-1')}, so ${T('k=\\dfrac{54}{5}')}. (Or: the negative reciprocal is ${T('\\dfrac65')}, and ${T('\\dfrac{k}{9}=\\dfrac65')}.)`,
        run: async (c) => { for (let i = 0; i < d.alg.length; i++) await show(c, line(P, T(d.alg[i]), i === d.alg.length - 1 ? 'u6l4-big u6l4-ans' : 'u6l4-mline')); } }
    ];
  }
};

/* =============================== mount =============================== */
mountOrchard();
mountFigures();
export const explainers = mountExplainers({ liftOff, sameOrder, collinear, missing, translate, rotate, negRecip, classify, rightAngle, dialK });
export const _test = { LIFT, COL, MISS, TRANS, ROT, NR, CL, RA, KD, frac, slopeOf };
