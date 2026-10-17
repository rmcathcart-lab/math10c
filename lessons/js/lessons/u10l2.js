/* Math 10C · Unit 10 · Lesson 2 — Estimating Length with Personal Referents.
 * Warm-up (arm span = height), the five body referents to scale (static), and the explainers:
 *   imperial (inch → foot → yard built from thumbs, Henry I's yard; zoom into a mile: furlongs, chains, rods, cubits),
 *   metric (zoom into a kilometre: 1 000 m, 100 cm, 10 mm; imperial vs SI factor chains),
 *   lay (STAR: lay a referent end to end, count, multiply, then compare with a tape measure; Example 1(b), 1(c) checks),
 *   fit (Example 1: every body referent laid along the same object; pick the countable one),
 *   ladder (everyday referents on a ×10 ladder of sizes; where a phone, a gym and the Example 2 towel sit),
 *   towel (Example 2: workbook widths above, paces below), shed (Example 3(a): heel-to-toe around a rectangle),
 *   wheel (Example 3(b): wrap a string, roll it out straight, count pinky nails), card (Example 4: on-screen cm and
 *   1/16-inch rulers, the 1:3 scale), km (Example 5: 20 pool lengths, or 1 111 paces).
 * Colours: imperial blue, SI teal, referent copies amber, true measurement (tape) red. */
import {
  h, tex, add, svgEl, place, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween, pulse, liveCtx,
  arrowHead, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const IMP = COLORS.blue, SI = COLORS.teal, REF = COLORS.amber, TRUE = COLORS.red, INK = COLORS.ink, GRN = COLORS.green;
const SKIN = '#f3c9a5', NAIL = '#fdeae4', TAPE = '#f6d55c';

/* ------------------------------ small helpers ------------------------------ */
function SV(stage, W, H) {
  const s = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'u10l2-svg' });
  stage.appendChild(s); s.style.left = '0px'; s.style.top = '0px'; return s;
}
const G = (parent, attrs = {}) => svgEl('g', attrs, parent);
/** an HTML label placed at (x, y) on the stage; hidden until shown */
function lab(stage, x, y, html, pos = 'c', cls = '', gap = 0) {
  const d = h('div', 'u10l2-lab ' + cls, html); stage.appendChild(d); place(d, x, y, pos, gap); d.style.opacity = 0; return d;
}
const show = (c, el, ms = 320) => fadeIn(c, el, ms);
const fadeTo = (c, el, o, ms = 300) => (c ? c.anim(el, [{ opacity: getComputedStyle(el).opacity }, { opacity: o }], ms) : (el.style.opacity = o));
/** a panel of lines (HTML) on the stage */
function panel(stage, x, y, w, hh, title, cls = '') {
  const p = h('div', 'u10l2-panel ' + cls, title ? `<div class="u10l2-ph">${title}</div>` : '');
  p.style.width = w + 'px'; if (hh) p.style.height = hh + 'px'; add(stage, p, x, y); return p;
}
function line(P, html, cls = '') { const d = h('div', 'u10l2-line ' + cls, html); d.style.opacity = 0; P.appendChild(d); return d; }
/** a big counter box */
function counter(stage, x, y, title = 'Count') {
  const d = h('div', 'u10l2-count', `<div class="u10l2-cth">${title}</div><div class="u10l2-ctn">0</div>`); add(stage, d, x, y); d.style.opacity = 0;
  const n = d.querySelector('.u10l2-ctn');
  return { el: d, set(v) { n.textContent = v; } };
}
const thin = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/* icons: drawn in a 40 × 40 box centred on (x, y). Returns an outer <g> (safe to pop) */
function icon(parent, kind, x, y, s = 40, rot = 0) {
  const outer = G(parent, { class: 'u10l2-ic' }), g = G(outer, { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s / 40})` });
  const st = { stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
  const P = (d, fill = SKIN, extra = {}) => svgEl('path', Object.assign({ d, fill }, st, extra), g);
  const finger = (x1, y1, x2, y2, w = 7) => { svgEl('line', { x1, y1, x2, y2, stroke: INK, 'stroke-width': w + 3.5, 'stroke-linecap': 'round' }, g); svgEl('line', { x1, y1, x2, y2, stroke: SKIN, 'stroke-width': w, 'stroke-linecap': 'round' }, g); };
  switch (kind) {
    case 'thumb': P('M-9 19 V-8 A9 9 0 0 1 9 -8 V19'); P('M-5.5 -4 V-10 A5.5 5.5 0 0 1 5.5 -10 V-4 Z', NAIL, { 'stroke-width': 1.5 }); P('M-9 6 H9', 'none', { 'stroke-width': 1.4 }); break;
    case 'nail': P('M-6 19 V-10 A6 6 0 0 1 6 -10 V19'); P('M-4 -5 V-11 A4 4 0 0 1 4 -11 V-5 Z', NAIL, { 'stroke-width': 1.4 }); break;
    case 'fist':
      P('M-18 -5 Q-18 -15 -9 -15 H11 Q18 -15 18 -7 V9 Q18 16 10 16 H-10 Q-18 16 -18 8 Z');
      for (const fx of [-8, 1, 10]) P(`M${fx} -15 V-3`, 'none', { 'stroke-width': 1.6 });
      P('M-18 3 Q-6 -1 7 4', 'none', { 'stroke-width': 1.8 }); break;
    case 'span':
      finger(-6, 6, -19, -3); finger(-4, -2, -9, -18); finger(0, -2, 0, -20); finger(4, -2, 8, -17); finger(6, 0, 18, -9, 6);
      P('M-9 19 Q-12 6 -7 -3 L8 -3 Q12 6 8 19 Z'); break;
    case 'cubit':
      P('M-20 -3 Q-21 5 -15 6 L9 5 L19 3 Q21 0 19 -2 L9 -4 L-15 -8 Q-20 -8 -20 -3 Z');
      P('M9 5 L9 -4', 'none', { 'stroke-width': 1.4 }); break;
    case 'book':
      svgEl('rect', Object.assign({ x: -16, y: -13, width: 32, height: 26, rx: 2, fill: '#e9732f' }, st), g);
      svgEl('rect', { x: -13, y: -13, width: 4, height: 26, fill: '#b9541c' }, g);
      svgEl('rect', { x: -5, y: -7, width: 17, height: 6, rx: 1, fill: '#fff', opacity: 0.85 }, g); break;
    case 'pool':
      svgEl('rect', Object.assign({ x: -18, y: -12, width: 36, height: 24, rx: 2, fill: '#5fb0e6' }, st), g);
      for (const ly of [-6, 0, 6]) svgEl('line', { x1: -16, x2: 16, y1: ly, y2: ly, stroke: '#fff', 'stroke-width': 1.4, 'stroke-dasharray': '3 2' }, g); break;
    case 'pace': footprint(g, -7, 7, 18, -90, false); footprint(g, 7, -7, 18, -90, true); break;
    case 'foot': footprint(g, 0, 0, 34, 0, false); break;
    default: break;
  }
  return outer;
}
/** a footprint (heel at -len/2, toe at +len/2 along the angle). Returns a <g> wrapper (safe to pop). */
function footprint(parent, cx, cy, len, ang = 0, flip = false, o = {}) {
  const outer = G(parent), L = len / 2, w = len * 0.16;
  const d = `M${-L} 0 C${-L} ${-w * 0.95} ${-L * 0.2} ${-w * 0.8} ${L * 0.3} ${-w * 1.15} C${L * 0.85} ${-w * 1.4} ${L} ${-w * 0.55} ${L} 0 C${L} ${w * 0.7} ${L * 0.75} ${w * 1.15} ${L * 0.25} ${w * 0.95} C${-L * 0.25} ${w * 0.75} ${-L} ${w * 0.9} ${-L} 0 Z`;
  svgEl('path', { d, transform: `translate(${cx} ${cy}) rotate(${ang}) scale(1 ${flip ? -1 : 1})`, fill: o.fill || '#7a5537', 'fill-opacity': o.op ?? 0.85, stroke: o.stroke || 'none', 'stroke-width': 1.5 }, outer);
  return outer;
}
/** a dimension line with end bars and a label. */
function dim(parent, x1, y1, x2, y2, color = INK, w = 2.2) {
  const g = G(parent);
  svgEl('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': w }, g);
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 7, ny = dx / L * 7;
  for (const [px, py] of [[x1, y1], [x2, y2]]) svgEl('line', { x1: px - nx, y1: py - ny, x2: px + nx, y2: py + ny, stroke: color, 'stroke-width': w }, g);
  return g;
}
const AH = (parent, x, y, dx, dy, color) => arrowHead(parent, x, y, dx, dy, { color, width: 2.5 });
/** a double-headed arrow (the booklet's referent bars) */
function dblArrow(parent, x1, y, x2, color = INK) {
  const g = G(parent);
  svgEl('line', { x1: x1 + 3, y1: y, x2: x2 - 3, y2: y, stroke: color, 'stroke-width': 2.6 }, g);
  AH(g, x2, y, 1, 0, color); AH(g, x1, y, -1, 0, color); return g;
}

/* =============================== warm-up: arm span =============================== */
function mountWarm() {
  const host = document.getElementById('u10l2-wfig'); if (!host) return;
  const W = 700, H = 300, S = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'u10l2-svg' }, host);
  const gy = 282, ht = 200, px = 142, sy = gy - 165;
  svgEl('rect', { x: 50, y: gy, width: 190, height: 9, fill: '#c8c2b4', rx: 2 }, S);
  const body = G(S, { stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none' });
  svgEl('line', { x1: px, y1: gy - 172, x2: px, y2: gy - 92 }, body);
  svgEl('line', { x1: px, y1: gy - 92, x2: px - 22, y2: gy - 2 }, body);
  svgEl('line', { x1: px, y1: gy - 92, x2: px + 22, y2: gy - 2 }, body);
  const armL = svgEl('line', { x1: px, y1: sy, x2: px - 25, y2: sy + 97 }, body), armR = svgEl('line', { x1: px, y1: sy, x2: px + 25, y2: sy + 97 }, body);
  svgEl('circle', { cx: px, cy: gy - 186, r: 14, fill: '#ffecb3', stroke: INK, 'stroke-width': 2.5 }, S);
  const hd = dim(S, 10, gy - ht, 10, gy, INK, 2);
  svgEl('text', { x: 0, y: 0, class: 'u10l2-svgt', transform: `translate(29 ${gy - 100}) rotate(-90)`, 'text-anchor': 'middle' }, S).textContent = 'height';
  hd.setAttribute('opacity', 1);
  svgEl('text', { x: 256, y: 34, class: 'u10l2-svgt u10l2-svgb' }, S).textContent = 'Arms out wide, fingertip to fingertip:';
  const bars = [['A', 100, 'half your height'], ['B', 200, 'your height'], ['C', 400, 'double your height']].map(([L, w, t], i) => {
    const y = 82 + i * 74, g = G(S);
    svgEl('rect', { x: 288, y: y - 15, width: w, height: 30, fill: '#e8f0fc', rx: 3 }, g);
    dblArrow(g, 288, y, 288 + w, TRUE);
    svgEl('circle', { cx: 266, cy: y, r: 15, fill: TRUE }, g);
    svgEl('text', { x: 266, y: y + 6, class: 'u10l2-svgt u10l2-svgw', 'text-anchor': 'middle' }, g).textContent = L;
    svgEl('text', { x: 288, y: y + 36, class: 'u10l2-svgs' }, g).textContent = t;
    return g;
  });
  const sq = svgEl('rect', { x: px - 100, y: gy - ht, width: 200, height: ht, fill: 'none', stroke: GRN, 'stroke-width': 2.5, 'stroke-dasharray': '8 6', opacity: 0 }, S);
  const span = G(S, { opacity: 0 }); dblArrow(span, px - 100, gy - 210 + 0, px + 100, GRN);
  const spanT = svgEl('text', { x: px, y: gy - 218, class: 'u10l2-svgt u10l2-svgg', 'text-anchor': 'middle', opacity: 0 }, S); spanT.textContent = 'span ≈ height';
  let out = false, busy = false;
  const btn = document.getElementById('u10l2-warms'), ctx = liveCtx();
  const setArms = (t) => {
    const a = (1 - t) * 1.32 + t * Math.PI / 2; // angle from straight down
    armL.setAttribute('x2', px - 100 * Math.sin(a)); armL.setAttribute('y2', sy + 100 * Math.cos(a));
    armR.setAttribute('x2', px + 100 * Math.sin(a)); armR.setAttribute('y2', sy + 100 * Math.cos(a));
  };
  setArms(0);
  btn.addEventListener('click', async () => {
    if (busy) return; busy = true;
    if (!out) {
      await tween(ctx, 900, setArms);
      span.setAttribute('opacity', 1); spanT.setAttribute('opacity', 1); sq.setAttribute('opacity', 1);
      await appear(ctx, span, 300); await appear(ctx, sq, 300);
      bars[1].classList.add('u10l2-win'); await pulse(ctx, bars[1], 1.05);
      btn.textContent = 'Arms down';
    } else {
      span.setAttribute('opacity', 0); spanT.setAttribute('opacity', 0); sq.setAttribute('opacity', 0); bars[1].classList.remove('u10l2-win');
      await tween(ctx, 600, (t) => setArms(1 - t));
      btn.textContent = 'Arms out wide';
    }
    out = !out; busy = false;
  });
}

/* =============================== static: the five body referents =============================== */
const FIVE = [
  { k: 'thumb', name: 'Thumb', cm: 2.5, txt: '≈ 2.5 cm (1 in)' },
  { k: 'fist', name: 'Hand', cm: 10, txt: '≈ 10 cm (4 in = 1 “hand”)' },
  { k: 'span', name: 'Span', cm: 20, txt: '≈ 20 cm' },
  { k: 'cubit', name: 'Cubit', cm: 45, txt: '≈ 45 cm' },
  { k: 'pace', name: 'Pace', cm: 90, txt: '≈ 90 cm (1 yd)' }
];
function mountFive() {
  const host = document.getElementById('u10l2-five'); if (!host) return;
  const W = 900, H = 300, S = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: 'u10l2-svg' }, host);
  const x0 = 160, k = 700 / 90;
  FIVE.forEach((r, i) => {
    const y = 34 + i * 58;
    icon(S, r.k, 26, y, 34);
    svgEl('text', { x: 54, y: y + 7, class: 'u10l2-svgt u10l2-svgb' }, S).textContent = r.name;
    dblArrow(S, x0, y, x0 + r.cm * k, INK);
    const t = svgEl('text', { class: 'u10l2-svgs' }, S); t.textContent = r.txt;
    if (r.k === 'pace') { t.setAttribute('x', x0 + r.cm * k / 2); t.setAttribute('y', y + 28); t.setAttribute('text-anchor', 'middle'); }
    else { t.setAttribute('x', x0 + r.cm * k + 14); t.setAttribute('y', y + 6); }
  });
}

/* =============================== explainer: imperial =============================== */
/** a zoom ladder: rows of bars, each split into parts; a funnel from the first part of one row to the next row */
function zoomLadder(S, stage, o) {
  const { x0, x1, ys, bh, rows } = o;
  const drawRow = async (c, i) => {
    const r = rows[i], y = ys[i], w = x1 - x0, g = G(S); g.style.opacity = 0;
    if (i > 0) {
      const py = ys[i - 1] + bh, pw = w / rows[i - 1].n;
      svgEl('polygon', { points: `${x0},${py} ${x0 + pw},${py} ${x1},${y} ${x0},${y}`, fill: r.color, 'fill-opacity': 0.12, stroke: r.color, 'stroke-opacity': 0.5, 'stroke-dasharray': '5 4' }, g);
    }
    svgEl('rect', { x: x0, y, width: w, height: bh, fill: r.color, 'fill-opacity': 0.18, stroke: r.color, 'stroke-width': 2, rx: 3 }, g);
    const pw = w / r.n;
    for (let j = 1; j < r.n; j++) {
      const big = r.major && j % r.major === 0;
      svgEl('line', { x1: x0 + j * pw, x2: x0 + j * pw, y1: y + (r.n > 200 && !big ? bh * 0.45 : 0), y2: y + bh, stroke: r.color, 'stroke-width': r.n > 200 ? (big ? 1.6 : 0.5) : 1.4 }, g);
    }
    if (r.n <= 12) for (let j = 0; j < r.n; j++) svgEl('text', { x: x0 + (j + 0.5) * pw, y: y + bh / 2 + 6, class: 'u10l2-svgs', 'text-anchor': 'middle', fill: r.color }, g).textContent = String(j + 1);
    else if (r.labelEvery) for (let j = r.labelEvery; j <= r.n; j += r.labelEvery) svgEl('text', { x: x0 + j * pw, y: y - 6, class: 'u10l2-svgxs', 'text-anchor': j === r.n ? 'end' : 'middle', fill: r.color }, g).textContent = String(j);
    if (r.n > 12) svgEl('rect', { x: x0, y: y - 2, width: Math.max(pw, 3), height: bh + 4, fill: 'none', stroke: TRUE, 'stroke-width': 2 }, g);
    else svgEl('rect', { x: x0, y: y - 2, width: pw, height: bh + 4, fill: 'none', stroke: TRUE, 'stroke-width': 2, opacity: i < rows.length - 1 ? 1 : 0 }, g);
    const note = lab(stage, x1 + 16, y + bh / 2, r.html, 'e', 'u10l2-note');
    await appear(c, g, 450); await show(c, note);
  };
  return { drawRow };
}
const imperial = {
  title: 'Imperial units began as body parts',
  height: 440,
  choices: [{ v: 'yard', label: 'Thumb, foot, yard' }, { v: 'mile', label: 'Zoom into a mile' }],
  intro: (v) => (v === 'yard' ? 'How long is an inch, a foot, a yard? Press <b>Next</b>.' : 'A mile is built out of smaller old units. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, S = SV(stage, W, ex.def.height);
    if (v === 'mile') {
      const rows = [
        { n: 8, color: IMP, html: `<b>1 mile</b> = 8 furlongs<br><span class="u10l2-mut">(1 mile = ${T('1\\,760')} yd)</span>` },
        { n: 10, color: '#7b4fc4', html: '<b>1 furlong</b> = 10 chains' },
        { n: 4, color: COLORS.amber, html: '<b>1 chain</b> ≈ 4 rods' },
        { n: 11, color: GRN, html: '<b>1 rod</b> ≈ 11 cubits' }
      ];
      const Z = zoomLadder(S, stage, { x0: 30, x1: W - 250, ys: [38, 140, 242, 344], bh: 40, rows });
      return [
        { cap: `${T('1')} mile ${T('=1\\,760')} yards. Horse races are still measured in <b>furlongs</b>: ${T('8')} furlongs ${T('=1')} mile.`, run: (c) => Z.drawRow(c, 0) },
        { cap: 'Zoom into one furlong (how far oxen could plow before resting): <b>10 chains</b>. A chain is the length of a <b>cricket pitch</b>.', run: (c) => Z.drawRow(c, 1) },
        { cap: 'Zoom into one chain: about <b>4 rods</b>.', run: (c) => Z.drawRow(c, 2) },
        { cap: 'A rod was a pole about <b>11 cubits</b> long. The old units nest inside each other, but the steps are 8, 10, 4, 11: <b>no pattern</b>.', run: (c) => Z.drawRow(c, 3) }
      ];
    }
    const u = Math.min(23.5, (W - 110) / 36), x0 = Math.round((W - 36 * u) / 2) + 8, yb = 236, bh = 38;
    const tiles = [];
    const inchTile = (i) => {
      const g = G(S);
      svgEl('rect', { x: x0 + i * u, y: yb, width: u, height: bh, fill: i % 2 ? '#dbe6fb' : '#b9cdf5', stroke: IMP, 'stroke-width': 1.2 }, g);
      svgEl('text', { x: x0 + (i + 0.5) * u, y: yb + bh / 2 + 5, class: 'u10l2-svgxs', 'text-anchor': 'middle', fill: IMP }, g).textContent = String(i + 1);
      tiles.push(g); return g;
    };
    let thumb, foot, footL, henry, ftBlocks;
    return [
      { cap: 'An <b>inch</b> began as the width of a <b>thumb</b> across the joint.',
        run: async (c) => {
          thumb = icon(S, 'thumb', x0 + u / 2, yb - 26, 46); await pop(c, thumb);
          await pop(c, inchTile(0)); await show(c, lab(stage, x0 + u / 2, yb + bh + 8, '1 in', 's', 'u10l2-sm u10l2-cimp'));
        } },
      { cap: `Lay <b>12 inches</b> end to end: <b>1 foot</b>, about the length of an adult foot. ${T('1\\text{ ft}=12\\text{ in}')}`,
        run: async (c) => {
          for (let i = 1; i < 12; i++) { await pop(c, inchTile(i), 200); await sleep(c, 40); }
          await fadeTo(c, thumb, 0.25);
          foot = footprint(S, x0 + 6 * u, yb - 70, 12 * u, 0, false, { fill: '#c99a6e', op: 0.55, stroke: '#7a5537' }); await appear(c, foot, 500);
          footL = dim(S, x0, yb + bh + 36, x0 + 12 * u, yb + bh + 36, IMP); await appear(c, footL, 300);
          await show(c, lab(stage, x0 + 6 * u, yb + bh + 42, `<b>1 ft</b> = 12 in`, 's', 'u10l2-cimp'));
        } },
      { cap: `${T('3')} feet ${T('=1')} <b>yard</b>. Legend says King Henry I made the yard the distance from his <b>nose</b> to the end of his <b>outstretched thumb</b>.`,
        run: async (c) => {
          await Promise.all([fadeTo(c, foot, 0), fadeTo(c, thumb, 0)]);
          ftBlocks = G(S);
          for (const j of [1, 2]) {
            svgEl('rect', { x: x0 + 12 * j * u, y: yb, width: 12 * u, height: bh, fill: j % 2 ? '#c5d6f7' : '#dbe6fb', stroke: IMP, 'stroke-width': 1.6 }, ftBlocks);
            svgEl('text', { x: x0 + (12 * j + 6) * u, y: yb + bh / 2 + 6, class: 'u10l2-svgs', 'text-anchor': 'middle', fill: IMP }, ftBlocks).textContent = '1 ft';
          }
          await appear(c, ftBlocks, 500);
          henry = G(S);
          const hx = x0 - 30, hy = yb - 128, ay = yb - 72, tx = x0 + 36 * u;
          svgEl('line', { x1: hx + 4, y1: ay, x2: tx - 10, y2: ay, stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, henry);
          svgEl('path', { d: `M${hx - 4} ${hy + 30} Q${hx - 10} ${ay + 40} ${hx - 2} ${yb - 6}`, fill: 'none', stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, henry);
          svgEl('circle', { cx: tx - 10, cy: ay, r: 9, fill: SKIN, stroke: INK, 'stroke-width': 2 }, henry);
          svgEl('path', { d: `M${tx - 6} ${ay - 6} Q${tx} ${ay - 14} ${tx} ${ay - 22}`, fill: 'none', stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round' }, henry);
          svgEl('circle', { cx: hx, cy: hy, r: 26, fill: SKIN, stroke: INK, 'stroke-width': 2.5 }, henry);
          svgEl('path', { d: `M${hx + 24} ${hy - 8} L${x0} ${hy + 4} L${hx + 24} ${hy + 8}`, fill: SKIN, stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, henry);
          svgEl('path', { d: `M${hx - 26} ${hy - 6} L${hx - 22} ${hy - 30} L${hx - 10} ${hy - 20} L${hx} ${hy - 36} L${hx + 10} ${hy - 20} L${hx + 22} ${hy - 30} L${hx + 24} ${hy - 6}`, fill: '#f2c14e', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, henry);
          for (const gx of [x0, tx]) svgEl('line', { x1: gx, y1: gx === x0 ? hy + 4 : ay - 22, x2: gx, y2: yb, stroke: TRUE, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, henry);
          await appear(c, henry, 600);
          await show(c, lab(stage, x0 + 6, hy + 4, 'nose', 'e', 'u10l2-sm u10l2-cred', 4));
          await show(c, lab(stage, tx - 6, ay - 26, 'thumb', 'w', 'u10l2-sm u10l2-cred', 4));
        } },
      { cap: `${T('1\\text{ yd}=3\\text{ ft}=36\\text{ in}')}. The steps are ${T('12')} and ${T('3')}: not tens.`,
        run: async (c) => {
          const g = dim(S, x0, yb + bh + 84, x0 + 36 * u, yb + bh + 84, IMP); await appear(c, g, 300);
          await show(c, lab(stage, x0 + 18 * u, yb + bh + 90, `<b>1 yd</b> = 3 ft = 36 in`, 's', 'u10l2-cimp'));
        } }
    ];
  }
};

/* =============================== explainer: metric =============================== */
const metric = {
  title: 'SI units: every step is a power of 10',
  height: 430,
  choices: [{ v: 'zoom', label: 'Zoom into a kilometre' }, { v: 'vs', label: 'Imperial vs SI' }],
  intro: (v) => (v === 'zoom' ? 'Start with a whole kilometre. Press <b>Next</b>.' : 'Line the two systems up side by side. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, S = SV(stage, W, ex.def.height);
    if (v === 'zoom') {
      const rows = [
        { n: 1000, major: 100, labelEvery: 100, color: SI, html: `<b>1 km</b> = ${T('1\\,000')} m` },
        { n: 100, major: 10, labelEvery: 10, color: '#1f5bd6', html: '<b>1 m</b> = 100 cm' },
        { n: 10, color: COLORS.amber, html: '<b>1 cm</b> = 10 mm' }
      ];
      const Z = zoomLadder(S, stage, { x0: 30, x1: W - 220, ys: [44, 164, 284], bh: 42, rows });
      let P;
      return [
        { cap: `${T('1')} kilometre ${T('=1\\,000')} metres. That many tick marks just blur together.`, run: (c) => Z.drawRow(c, 0) },
        { cap: 'Zoom into <b>one metre</b> (the thin red box): <b>100 centimetres</b>.', run: (c) => Z.drawRow(c, 1) },
        { cap: 'Zoom into <b>one centimetre</b>: <b>10 millimetres</b>.', run: (c) => Z.drawRow(c, 2) },
        { cap: `Every SI step is ${T('\\times10')}, ${T('\\times100')} or ${T('\\times1\\,000')}: a <b>power of 10</b>. That is the whole idea of the metric system.`,
          run: async (c) => { P = lab(stage, ex.W / 2, 362, `${T('1\\text{ km}=1\\,000\\text{ m}\\qquad 1\\text{ m}=100\\text{ cm}\\qquad 1\\text{ cm}=10\\text{ mm}')}`, 's', 'u10l2-big u10l2-boxed', 0); await pop(c, P, 450); } }
      ];
    }
    const bw = 120, gap = Math.min(110, (W - 4 * bw - 40) / 3), x0 = (W - 4 * bw - 3 * gap) / 2;
    const chain = (y, units, facts, color, cls) => {
      const boxes = units.map((u, i) => lab(stage, x0 + i * (bw + gap) + bw / 2, y, `<b>${u}</b>`, 'c', 'u10l2-ubox ' + cls));
      const links = facts.map((f, i) => {
        const xa = x0 + i * (bw + gap) + bw + 6, xb = xa + gap - 12, g = G(S); g.style.opacity = 0;
        svgEl('line', { x1: xb - 4, y1: y, x2: xa + 4, y2: y, stroke: color, 'stroke-width': 2.6 }, g); AH(g, xa, y, -1, 0, color);
        const t = lab(stage, (xa + xb) / 2, y - 12, T(f), 'n', 'u10l2-fac ' + cls);
        return { g, t };
      });
      return { boxes, links };
    };
    let A, B;
    return [
      { cap: `<b>Imperial</b>: ${T('12')} inches in a foot, ${T('3')} feet in a yard, ${T('1\\,760')} yards in a mile.`,
        run: async (c) => {
          await show(c, lab(stage, 20, 52, '<b>Imperial</b>', 'e', 'u10l2-cimp u10l2-big'));
          A = chain(130, ['inch', 'foot', 'yard', 'mile'], ['\\times12', '\\times3', '\\times1\\,760'], IMP, 'u10l2-bimp');
          for (let i = 0; i < 4; i++) { await pop(c, A.boxes[i], 300); if (i < 3) { await appear(c, A.links[i].g, 250); await show(c, A.links[i].t, 250); } }
        } },
      { cap: `<b>SI</b>: ${T('10')} millimetres in a centimetre, ${T('100')} centimetres in a metre, ${T('1\\,000')} metres in a kilometre.`,
        run: async (c) => {
          await show(c, lab(stage, 20, 222, '<b>SI</b>', 'e', 'u10l2-csi u10l2-big'));
          B = chain(300, ['millimetre', 'centimetre', 'metre', 'kilometre'], ['\\times10', '\\times100', '\\times1\\,000'], SI, 'u10l2-bsi');
          for (let i = 0; i < 4; i++) { await pop(c, B.boxes[i], 300); if (i < 3) { await appear(c, B.links[i].g, 250); await show(c, B.links[i].t, 250); } }
        } },
      { cap: `Imperial steps (${T('12,\\ 3,\\ 1\\,760')}) follow <b>no pattern</b>. SI steps are all <b>powers of 10</b>, so changing units just moves the decimal point.`,
        run: async (c) => {
          for (const L of A.links) L.t.classList.add('u10l2-odd');
          for (const L of B.links) L.t.classList.add('u10l2-even');
          await Promise.all([...A.links, ...B.links].map((L) => pulse(c, L.t, 1.25)));
        } },
      { cap: `One fact links the two systems: ${T('1\\text{ in}=2.54\\text{ cm}')} (used in Example 4).`,
        run: async (c) => {
          const xa = x0 + bw / 2, xb = x0 + bw + gap + bw / 2, g = G(S);
          svgEl('path', { d: `M${xa} 152 C${xa} 210 ${xb} 220 ${xb} 278`, fill: 'none', stroke: TRUE, 'stroke-width': 2.6, 'stroke-dasharray': '7 5' }, g);
          await appear(c, g, 400); await pop(c, lab(stage, (xa + xb) / 2 + 20, 215, T('1\\text{ in}=2.54\\text{ cm}'), 'c', 'u10l2-bridge'));
        } }
    ];
  }
};

/* =============================== explainer: lay (STAR) =============================== */
const LAY = {
  desk: { label: 'A desk in hand spans' },
  hall: { label: 'A hallway in paces' },
  usb: { label: 'Example 1(b) check: flash drive' },
  pony: { label: 'Example 1(c) check: pony' }
};
function drawDesk(S, x, y, w, hh) {
  const g = G(S);
  svgEl('rect', { x, y, width: w, height: hh, rx: 6, fill: '#ddb67f', stroke: '#8a6236', 'stroke-width': 2.5 }, g);
  for (const f of [0.28, 0.55, 0.8]) svgEl('path', { d: `M${x + 12} ${y + hh * f} C${x + w * 0.3} ${y + hh * f - 8} ${x + w * 0.6} ${y + hh * f + 8} ${x + w - 12} ${y + hh * f - 3}`, fill: 'none', stroke: '#b98d55', 'stroke-width': 1.5 }, g);
  svgEl('text', { x: x + w / 2, y: y + hh / 2 + 8, class: 'u10l2-svgt', 'text-anchor': 'middle', fill: '#6e4b25' }, g).textContent = 'desk (seen from above)';
  return g;
}
function drawHall(S, x, y, w, hh) {
  const g = G(S);
  svgEl('rect', { x, y, width: w, height: hh, fill: '#ece7db' }, g);
  for (let t = x + 30; t < x + w; t += 30) svgEl('line', { x1: t, x2: t, y1: y, y2: y + hh, stroke: '#d8d1c0', 'stroke-width': 1 }, g);
  for (const yy of [y, y + hh]) svgEl('line', { x1: x, x2: x + w, y1: yy, y2: yy, stroke: '#6b6559', 'stroke-width': 5 }, g);
  for (let t = x + 14; t < x + w - 30; t += 46) svgEl('rect', { x: t, y: y - 26, width: 40, height: 22, fill: '#8fb3d9', stroke: '#4c6f96', 'stroke-width': 1.3 }, g);
  svgEl('text', { x: x + w / 2, y: y + hh + 26, class: 'u10l2-svgs', 'text-anchor': 'middle', fill: '#6b6559' }, g).textContent = 'hallway (lockers along one wall)';
  return g;
}
function drawUsb(S, x, y, w, hh, k) {
  const g = G(S), plug = 1.2 * k;
  svgEl('rect', { x: x + w - plug, y: y + hh * 0.2, width: plug, height: hh * 0.6, fill: '#d2d7de', stroke: '#6b7280', 'stroke-width': 2 }, g);
  for (const f of [0.38, 0.55]) svgEl('rect', { x: x + w - plug * 0.6, y: y + hh * f, width: plug * 0.25, height: hh * 0.1, fill: '#6b7280' }, g);
  svgEl('rect', { x, y, width: w - plug, height: hh, rx: 18, fill: '#3b78d8', stroke: '#1d4f9e', 'stroke-width': 2.5 }, g);
  svgEl('circle', { cx: x + 34, cy: y + hh / 2, r: 12, fill: '#fff', stroke: '#1d4f9e', 'stroke-width': 2 }, g);
  svgEl('text', { x: x + (w - plug) / 2 + 10, y: y + hh / 2 + 9, class: 'u10l2-svgt u10l2-svgw', 'text-anchor': 'middle' }, g).textContent = 'USB flash drive (enlarged)';
  return g;
}
/** a tape measure (or ruler) strip from x0 along y. ticks: [{v (cm), len, label}] */
function tapeStrip(S, stage, x0, y, k, maxCm, ticks, color = TAPE) {
  const g = G(S);
  svgEl('rect', { x: x0 - 8, y, width: maxCm * k + 16, height: 40, rx: 4, fill: color, stroke: '#a88b1d', 'stroke-width': 1.6 }, g);
  for (const t of ticks) {
    const x = x0 + t.v * k;
    svgEl('line', { x1: x, x2: x, y1: y, y2: y + t.len, stroke: INK, 'stroke-width': t.label != null ? 1.6 : 1 }, g);
    if (t.label != null) svgEl('text', { x, y: y + 35, class: 'u10l2-svgxs', 'text-anchor': 'middle' }, g).textContent = t.label;
  }
  return g;
}
const slideIn = (c, g, dx = -900, ms = 700) => (c ? c.anim(g, [{ transform: `translateX(${dx}px)` }, { transform: 'none' }], ms) : null);

function layH(stage, k0, ex) {
  const W = ex.W, H = ex.def.height, S = SV(stage, W, H), x0 = 60;
  const C = {
    desk: { L: 63, r: 20, n: 3, room: 70, ref: 'span', refHtml: `<b>hand span</b> ≈ 20 cm`, oy: 158, oh: 112, ty: 104, th: 50,
      obj: (x, y, w, hh) => drawDesk(S, x, y, w, hh), tapeMax: 70, ticks: (k) => cmTicks(70, 1, 5, 10),
      caps: ['Pick a referent <b>close in size</b> to the desk: the <b>hand span</b>, about 20 cm.',
        'Lay spans end to end along the edge and <b>count</b>: 1, 2, 3.',
        'A little is left over, much less than half a span. Call it <b>about 3 spans</b>.',
        `<b>Multiply</b> the count by the referent: ${T('3\\times20\\text{ cm}=60\\text{ cm}')}.`,
        `The tape measure says <b>63 cm</b>. The estimate is off by ${T('3')} cm (about ${T('5\\%')}): close, for no ruler at all.`],
      est: `Estimate: ${T('3\\times20\\text{ cm}=60\\text{ cm}')}`, tru: `Tape: <b>63 cm</b> &nbsp;·&nbsp; off by 3 cm`, trueLab: '63 cm' },
    hall: { L: 2820, r: 94, n: 30, room: 3000, ref: 'pace', refHtml: `<b>one pace</b> ≈ 90 cm`, oy: 170, oh: 76, foot: true,
      obj: (x, y, w, hh) => drawHall(S, x, y, w, hh), tapeMax: 3000, ticks: () => cmTicks(3000, 100, 500, 500, (v) => v / 100 + ' m'),
      caps: ['A hallway is far too long for a span. Pick the <b>pace</b>, about 90 cm.',
        'Walk the hallway with normal paces and <b>count</b>… <b>30</b> paces.',
        `<b>Multiply</b>: ${T('30\\times90\\text{ cm}=2\\,700\\text{ cm}=27\\text{ m}')}.`,
        `The tape says <b>28.2 m</b>: off by ${T('1.2')} m (about ${T('4\\%')}). This student’s pace is really <b>94 cm</b>, not 90 cm. An estimate is only as good as its referent.`],
      est: `Estimate: ${T('30\\times90\\text{ cm}=2\\,700\\text{ cm}=27\\text{ m}')}`, tru: `Tape: <b>28.2 m</b> &nbsp;·&nbsp; ${T('30\\times94\\text{ cm}=28.2\\text{ m}')}`, trueLab: '28.2 m' },
    usb: { L: 5.08, r: 2.54, n: 2, room: 5.6, ref: 'thumb', refHtml: `<b>thumb width</b> ≈ 1 in`, oy: 168, oh: 112, ty: 100, th: 64,
      obj: (x, y, w, hh, k) => drawUsb(S, x, y, w, hh, k), tapeMax: 5.6, ticks: () => inTicks(2.2, 8),
      caps: ['Example 1(b): a flash drive is tiny, so a pace or a cubit can’t resolve it. Pick the <b>thumb</b>, about 1 in.',
        'Lay your thumb beside the drive and <b>count</b>: <b>2</b> thumb widths.',
        `<b>Multiply</b>: ${T('2\\times1\\text{ in}=2\\text{ in}')}, about ${T('5')} cm.`,
        'Check with an inch ruler: about <b>2 in</b>. Thumb and drive are close in size, so the estimate is a good one.'],
      est: `Estimate: ${T('2\\times1\\text{ in}=2\\text{ in}')} &nbsp;(${T('\\approx5')} cm)`, tru: 'Ruler: about <b>2 in</b>', trueLab: '2 in' }
  }[k0];
  const L = C.L, k = (W - 2 * x0 - 20) / C.room, Lpx = L * k, rPx = C.r * k;
  const cnt = counter(stage, W - 150, 10);
  const P = panel(stage, x0 - 10, 352, W - 2 * x0 + 20, null, '', 'u10l2-eqp');
  let tileG;
  const steps = [];
  steps.push({ cap: C.caps[0], run: async (c) => {
    const o = C.obj(x0, C.oy, Lpx, C.oh, k); await appear(c, o, 400);
    const ic = icon(S, C.ref, 36, 36, 42); await pop(c, ic); await show(c, lab(stage, 64, 36, C.refHtml, 'e', 'u10l2-refc'));
  } });
  steps.push({ cap: C.caps[1], run: async (c) => {
    await appear(c, cnt.el, 200); tileG = G(S);
    for (let i = 0; i < C.n; i++) {
      let t;
      if (C.foot) t = footprint(tileG, x0 + i * rPx + 12, C.oy + C.oh / 2 + (i % 2 ? -14 : 14), 24, 0, i % 2 === 1, { fill: REF, op: 0.95 });
      else {
        t = G(tileG);
        svgEl('rect', { x: x0 + i * rPx + 1, y: C.ty, width: rPx - 2, height: C.th, rx: 8, fill: i % 2 ? '#fbe2b6' : '#f7cf8a', stroke: REF, 'stroke-width': 2 }, t);
        icon(t, C.ref, x0 + (i + 0.5) * rPx, C.ty + C.th / 2, Math.min(C.th - 8, 44));
        svgEl('text', { x: x0 + (i + 1) * rPx - 10, y: C.ty + C.th - 8, class: 'u10l2-svgs', 'text-anchor': 'end', fill: '#8a5a00' }, t).textContent = String(i + 1);
      }
      cnt.set(i + 1); await pop(c, t, C.foot ? 160 : 380); if (!C.foot) await sleep(c, 220);
    }
  } });
  if (k0 === 'desk') steps.push({ cap: C.caps[2], run: async (c) => {
    const g = G(S), xa = x0 + C.n * rPx, xb = x0 + Lpx;
    svgEl('rect', { x: xa, y: C.ty, width: xb - xa, height: C.th, fill: 'url(#u10l2-hatch)', stroke: REF, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
    hatchDef(S); await appear(c, g, 400);
    await show(c, lab(stage, (xa + xb) / 2, C.ty - 4, 'a little bit', 'n', 'u10l2-sm u10l2-camb', 2));
    cnt.set('≈ 3'); await pulse(c, cnt.el, 1.1);
  } });
  const ci = k0 === 'desk' ? 3 : 2;
  steps.push({ cap: C.caps[ci], run: async (c) => { await show(c, line(P, C.est, 'u10l2-lest')); } });
  steps.push({ cap: C.caps[ci + 1], run: async (c) => {
    const ty = C.oy + C.oh + (C.foot ? 34 : 16), tg = tapeStrip(S, stage, x0, ty, k, C.tapeMax, C.ticks(k), k0 === 'usb' ? '#fff8dc' : TAPE);
    await slideIn(c, tg, -W);
    const m = G(S); svgEl('line', { x1: x0 + Lpx, x2: x0 + Lpx, y1: C.foot ? C.oy - 4 : C.ty - 6, y2: ty + 44, stroke: TRUE, 'stroke-width': 3 }, m);
    await appear(c, m, 300);
    await pop(c, lab(stage, x0 + Lpx, ty + 46, C.trueLab, 's', 'u10l2-truel', 2));
    await show(c, line(P, C.tru, 'u10l2-ltrue'));
  } });
  return steps;
}
/** cm ticks for a tape: every `minor`, longer every `mid`, labelled every `lab` */
function cmTicks(max, minor, mid, labEvery, fmtL = (v) => String(v)) {
  const out = [];
  for (let v = 0; v <= max + 1e-9; v += minor) {
    const isL = Math.abs(v / labEvery - Math.round(v / labEvery)) < 1e-9, isM = Math.abs(v / mid - Math.round(v / mid)) < 1e-9;
    out.push({ v, len: isL ? 20 : isM ? 14 : 8, label: isL ? fmtL(Math.round(v * 10) / 10) : null });
  }
  return out;
}
/** inch ticks (positions in cm): every 1/den inch */
function inTicks(maxIn, den = 16) {
  const out = [];
  for (let i = 0; i <= Math.round(maxIn * den); i++) {
    const len = i % den === 0 ? 26 : i % (den / 2) === 0 ? 21 : i % (den / 4) === 0 ? 16 : i % (den / 8) === 0 ? 12 : 8;
    out.push({ v: (i / den) * 2.54, len, label: i % den === 0 ? String(i / den) : null });
  }
  return out;
}
function hatchDef(S) {
  if (S.querySelector('#u10l2-hatch')) return;
  const defs = svgEl('defs', {}, S), p = svgEl('pattern', { id: 'u10l2-hatch', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  svgEl('rect', { width: 8, height: 8, fill: '#fff6e6' }, p); svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 8, stroke: REF, 'stroke-width': 3 }, p);
}
/** the pony: fists stacked from the ground to the withers */
function layPony(stage, ex) {
  const W = ex.W, H = ex.def.height, S = SV(stage, W, H), gy = 424, hw = 266, X0 = 44, k = hw / 121.92, fist = 10.16 * k;
  const pt = (x, y) => `${(X0 + x * hw).toFixed(1)},${(gy - y * hw).toFixed(1)}`;
  const shape = [[0.40, 0], [0.40, 0.5], [0.34, 0.62], [0.30, 0.80], [0.16, 1.03], [0.03, 1.06], [-0.04, 1.13], [-0.01, 1.22], [0.12, 1.33], [0.17, 1.42], [0.22, 1.37], [0.30, 1.29], [0.45, 1.0], [0.75, 0.96], [1.05, 0.98], [1.18, 0.92], [1.27, 0.66], [1.24, 0.52], [1.19, 0.70], [1.17, 0.55], [1.15, 0], [1.06, 0], [1.04, 0.44], [0.98, 0.52], [0.60, 0.52], [0.54, 0.44], [0.51, 0]];
  const sx = X0 + 1.42 * hw, tx = sx + 52;
  const P = panel(stage, tx + 70, 206, W - tx - 84, null, '', 'u10l2-eqp');
  const cnt = counter(stage, W - 150, 10);
  return [
    { cap: `Example 1(c): a pony’s height is measured to the <b>withers</b> (the top of the shoulders). Pick the <b>hand</b>: a fist, ${T('4')} in.`,
      run: async (c) => {
        const g = G(S);
        svgEl('rect', { x: 10, y: gy, width: W - 20, height: 8, fill: '#9c8f74', rx: 2 }, g);
        svgEl('polygon', { points: shape.map(([x, y]) => pt(x, y)).join(' '), fill: '#b07a4f', stroke: '#5c3b20', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
        svgEl('circle', { cx: X0 + 0.13 * hw, cy: gy - 1.24 * hw, r: 4, fill: INK }, g);
        svgEl('path', { d: `M${X0 + 0.30 * hw} ${gy - 1.29 * hw} Q${X0 + 0.42 * hw} ${gy - 1.12 * hw} ${X0 + 0.46 * hw} ${gy - 0.98 * hw}`, fill: 'none', stroke: '#3d2614', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
        await appear(c, g, 400);
        const lv = G(S); svgEl('line', { x1: X0 + 0.45 * hw, x2: tx + 10, y1: gy - hw, y2: gy - hw, stroke: TRUE, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, lv);
        svgEl('circle', { cx: X0 + 0.45 * hw, cy: gy - hw, r: 6, fill: TRUE }, lv);
        await appear(c, lv, 300); await show(c, lab(stage, X0 + 0.47 * hw, gy - hw - 8, 'withers', 'ne', 'u10l2-sm u10l2-cred', 2));
        const ic = icon(S, 'fist', tx + 92, 40, 42); await pop(c, ic); await show(c, lab(stage, tx + 120, 40, '<b>hand (fist)</b> = 4 in', 'e', 'u10l2-refc'));
      } },
    { cap: 'Stack fists from the ground up to the withers and <b>count</b>: <b>12</b> hands.',
      run: async (c) => {
        await appear(c, cnt.el, 200);
        for (let i = 0; i < 12; i++) {
          const t = G(S); svgEl('rect', { x: sx, y: gy - (i + 1) * fist + 1, width: 44, height: fist - 2, rx: 6, fill: i % 2 ? '#fbe2b6' : '#f7cf8a', stroke: REF, 'stroke-width': 1.8 }, t);
          icon(t, 'fist', sx + 22, gy - (i + 0.5) * fist, fist * 0.95);
          cnt.set(i + 1); await pop(c, t, 220); await sleep(c, 60);
        }
      } },
    { cap: `<b>Multiply</b>: ${T('12\\times4\\text{ in}=48\\text{ in}')}, and ${T('48\\div12=4')}, so <b>4 ft</b>.`,
      run: async (c) => { await show(c, line(P, `${T('12\\times4\\text{ in}=48\\text{ in}')}`, 'u10l2-lest')); await show(c, line(P, `${T('48\\text{ in}=4\\text{ ft}')}`, 'u10l2-lest')); } },
    { cap: `In SI that is about <b>122 cm</b> (${T('48\\times2.54=121.92')}). Hands are the natural referent <b>and</b> the standard unit for horses.`,
      run: async (c) => {
        const g = G(S);
        svgEl('rect', { x: tx, y: gy - 130 * k, width: 34, height: 130 * k, fill: TAPE, stroke: '#a88b1d', 'stroke-width': 1.5 }, g);
        for (let v = 0; v <= 130; v += 5) { const y = gy - v * k; svgEl('line', { x1: tx, x2: tx + (v % 50 === 0 ? 22 : v % 10 === 0 ? 15 : 8), y1: y, y2: y, stroke: INK, 'stroke-width': 1.2 }, g); }
        for (const v of [50, 100]) svgEl('text', { x: tx + 30, y: gy - v * k + 5, class: 'u10l2-svgxs', 'text-anchor': 'end' }, g).textContent = String(v);
        await c.anim(g, [{ transform: 'translateY(380px)' }, { transform: 'none' }], 600);
        await pop(c, lab(stage, tx + 40, gy - hw, '≈ 122 cm', 'e', 'u10l2-truel', 2));
        await show(c, line(P, `${T('\\approx122\\text{ cm}')}`, 'u10l2-ltrue'));
      } }
  ];
}
const lay = {
  title: 'Lay a referent end to end: count, then multiply',
  height: 450,
  choices: Object.keys(LAY).map((k) => ({ v: k, label: LAY[k].label })),
  intro: (k) => ({ desk: 'Warm-up question 1, for real: a desk, 3 hand spans wide. Press <b>Next</b>.', hall: 'Warm-up question 2: a hallway, 30 paces long. Press <b>Next</b>.', usb: 'How long is a USB flash drive? Press <b>Next</b>.', pony: 'How tall is a pony? Press <b>Next</b>.' })[k],
  make(stage, k, ex) { return k === 'pony' ? layPony(stage, ex) : layH(stage, k, ex); }
};

/* =============================== explainer: fit (Example 1) =============================== */
const BODY = [
  { k: 'thumb', name: 'thumb', val: '1 in', inch: 1 },
  { k: 'fist', name: 'hand', val: '4 in', inch: 4 },
  { k: 'span', name: 'span', val: '20 cm', inch: 20 / 2.54 },
  { k: 'cubit', name: 'cubit', val: '45 cm', inch: 45 / 2.54 },
  { k: 'pace', name: 'pace', val: '1 yd', inch: 36 }
];
const FIT = {
  rink: { label: 'Example 1(a) check: hockey rink', Lin: 2400, obj: 'hockey rink', objVal: '200 ft',
    counts: ['≈ 2 400', '600', '≈ 300', '≈ 135', '≈ 67'], verdict: ['no', 'no', 'no', 'mid', 'ok'], pick: 4,
    caps: [`Example 1(a): a hockey rink is <b>200 ft</b> long.`,
      `Lay each body referent along it. <b>Thumbs</b>: ${T('200\\times12=2\\,400')}. <b>Hands</b>: 600. Far too many to count.`,
      '<b>Spans</b>: about 300. <b>Cubits</b>: about 135. <b>Paces</b>: about 67.',
      `Pick the referent that gives a <b>countable</b> number: the <b>pace</b>. ${T('200\\text{ ft}\\div3\\text{ ft per pace}\\approx67')} paces.`] },
  usb: { label: 'Example 1(b) check: flash drive', Lin: 2, obj: 'flash drive', objVal: 'about 2 in',
    counts: ['2', T('\\tfrac12'), T('\\approx\\tfrac14'), '≈ 0.1', '≈ 0.06'], verdict: ['ok', 'big', 'big', 'big', 'big'], pick: 0,
    caps: ['Example 1(b): a USB flash drive is only about <b>2 in</b> long.',
      '<b>Thumbs</b>: 2. A <b>hand</b> is already twice as long as the drive.',
      'A <b>span</b>, a <b>cubit</b> or a <b>pace</b> is far too big to <b>resolve</b> it.',
      'Pick the <b>thumb</b> (≈ 1 in): about 2 thumb widths, so about <b>2 in</b> (≈ 5 cm).'] },
  pony: { label: 'Example 1(c) check: pony', Lin: 48, obj: '12-hand pony', objVal: '48 in',
    counts: ['48', '12', '≈ 6', '≈ 2.7', '≈ 1.3'], verdict: ['no', 'ok', 'mid', 'big', 'big'], pick: 1,
    caps: [`Example 1(c): a ${T('12')}-hand pony is ${T('48')} in tall at the withers.`,
      '<b>Thumbs</b>: 48, a lot to stack. <b>Hands</b>: 12.',
      '<b>Spans</b>: about 6. <b>Cubits</b>: about 2.7. <b>Paces</b>: about 1.3, too coarse.',
      `Pick the <b>hand</b> (a fist, 4 in): the unit horses are measured in. ${T('12\\times4=48')} in ${T('=4')} ft.`] }
};
const VERD = { ok: ['countable ✓', 'u10l2-vok'], no: ['too many', 'u10l2-vno'], mid: ['a lot', 'u10l2-vmid'], big: ['too big', 'u10l2-vno'] };
const fit = {
  title: 'Match the size of the referent to the size of the object',
  height: 470,
  choices: Object.keys(FIT).map((k) => ({ v: k, label: FIT[k].label })),
  intro: (k) => `Lay all five body referents along the ${FIT[k].obj}. Which one gives a sensible count? Press <b>Next</b>.`,
  make(stage, k, ex) {
    const W = ex.W, S = SV(stage, W, ex.def.height), D = FIT[k], x0 = 250, Wd = W - x0 - 150, oy = 34, rowY = (i) => 104 + i * 70, rh = 34;
    hatchDef(S);
    const rows = [];
    const drawRow = async (c, i) => {
      const b = BODY[i], y = rowY(i), ratio = b.inch / D.Lin, w = Wd * ratio, g = G(S);
      icon(g, b.k, 30, y + rh / 2, 36);
      const nm = lab(stage, 56, y + 6, `<b>${b.name}</b> <span class="u10l2-mut">${b.val}</span>`, 'e', 'u10l2-rowl');
      const ct = lab(stage, 56, y + 34, `× ${D.counts[i]}`, 'e', 'u10l2-rowc');
      const clipId = 'u10l2-clip' + k + i, cp = svgEl('clipPath', { id: clipId }, svgEl('defs', {}, g));
      const cr = svgEl('rect', { x: x0, y: y - 4, width: 0, height: rh + 8 }, cp);
      const body = G(g, { 'clip-path': `url(#${clipId})` });
      let full = Wd;
      if (ratio >= 1) {
        full = Math.min(w, W - x0 - 14);
        svgEl('rect', { x: x0, y, width: full, height: rh, rx: 6, fill: '#fde3e0', stroke: TRUE, 'stroke-width': 2 }, body);
        if (w > W - x0 - 14) svgEl('path', { d: `M${x0 + full - 10} ${y - 2} l8 ${rh / 4} l-8 ${rh / 4} l8 ${rh / 4} l-8 ${rh / 4}`, fill: 'none', stroke: TRUE, 'stroke-width': 2 }, body);
        svgEl('line', { x1: x0 + Wd, x2: x0 + Wd, y1: y - 6, y2: y + rh + 6, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, body);
      } else if (w >= 1.5) {
        const n = Math.ceil(1 / ratio - 1e-9);
        for (let j = 0; j < n; j++) svgEl('rect', { x: x0 + j * w, y, width: Math.max(w - (w > 12 ? 2 : 1), 1), height: rh, rx: w > 20 ? 5 : 1, fill: j % 2 ? '#fbe2b6' : '#f7cf8a', stroke: w > 12 ? REF : 'none', 'stroke-width': 1.5 }, body);
      } else {
        svgEl('rect', { x: x0, y, width: Wd, height: rh, fill: 'url(#u10l2-hatch)', stroke: REF, 'stroke-width': 1.5 }, body);
      }
      if (w >= 40 && ratio < 1) for (let j = 0; j < Math.floor(1 / ratio + 1e-9); j++) icon(body, b.k, x0 + (j + 0.5) * w, y + rh / 2, Math.min(rh - 6, w - 10));
      await Promise.all([show(c, nm, 250), appear(c, g, 200)]);
      await tween(c, 650, (t) => cr.setAttribute('width', t * full + 2));
      await show(c, ct, 250);
      rows[i] = { g, ct, y };
    };
    return [
      { cap: D.caps[0], run: async (c) => {
        const g = G(S);
        if (k === 'rink') {
          svgEl('rect', { x: x0, y: oy, width: Wd, height: 44, rx: 20, fill: '#f4f9ff', stroke: '#4c6f96', 'stroke-width': 2.5 }, g);
          for (const [f, col, w] of [[0.5, TRUE, 4], [75 / 200, IMP, 4], [125 / 200, IMP, 4], [11 / 200, TRUE, 1.6], [189 / 200, TRUE, 1.6]]) svgEl('line', { x1: x0 + f * Wd, x2: x0 + f * Wd, y1: oy + 2, y2: oy + 42, stroke: col, 'stroke-width': w }, g);
        } else if (k === 'usb') {
          drawUsb(g, x0, oy + 4, Wd, 36, Wd / 5.08);
          g.querySelector('text').textContent = '';
        } else {
          svgEl('rect', { x: x0, y: oy + 6, width: Wd, height: 32, rx: 4, fill: '#ead9c6', stroke: '#8a5a32', 'stroke-width': 2.5 }, g);
          svgEl('text', { x: x0 + Wd / 2, y: oy + 29, class: 'u10l2-svgs', 'text-anchor': 'middle', fill: '#5c3b20' }, g).textContent = 'ground to withers';
        }
        await appear(c, g, 400);
        await show(c, lab(stage, 56, oy + 22, `<b>${D.obj}</b><br><span class="u10l2-mut">${D.objVal}</span>`, 'e', 'u10l2-rowl u10l2-objl'));
      } },
      { cap: D.caps[1], run: async (c) => { await drawRow(c, 0); await drawRow(c, 1); } },
      { cap: D.caps[2], run: async (c) => { for (const i of [2, 3, 4]) await drawRow(c, i); } },
      { cap: D.caps[3], run: async (c) => {
        rows.forEach((r, i) => { const [t, cls] = VERD[D.verdict[i]]; r.ct.innerHTML += ` <span class="u10l2-verd ${cls}">${t}</span>`; });
        await Promise.all(rows.map((r) => show(c, r.ct, 250)));
        const hl = svgEl('rect', { x: 6, y: rows[D.pick].y - 8, width: W - 12, height: rh + 52, rx: 12, fill: GRN, 'fill-opacity': 0.1, stroke: GRN, 'stroke-width': 2.5 }, S);
        S.insertBefore(hl, S.firstChild); await appear(c, hl, 400);
      } }
    ];
  }
};

/* =============================== explainer: ladder of everyday referents =============================== */
const LADDER = {
  imp: [{ n: 'thumb', v: '1 in', cm: 2.54 }, { n: 'adult foot', v: '1 ft', cm: 30.48 }, { n: 'pace', v: '1 yd', cm: 91.44 }],
  si: [{ n: 'dime (thick)', v: '1 mm', cm: 0.1, lv: 0 }, { n: 'pinky nail', v: '1 cm', cm: 1, lv: 0 }, { n: 'hockey puck', v: '7.6 cm', cm: 7.6, lv: 0, up: true },
    { n: 'five toes', v: '1 dm', cm: 10, lv: 0 }, { n: 'workbook', v: '20 cm', cm: 20, lv: 1, dx: 22 }, { n: '4-year-old', v: '1 m', cm: 100, lv: 0 },
    { n: 'doorway', v: 'almost 2 m', cm: 200, lv: 1, dx: 34 }, { n: 'Olympic pool', v: '50 m', cm: 5000, lv: 0 }]
};
const ladder = {
  title: 'A ladder of everyday referents',
  height: 440,
  choices: [{ v: 'all', label: 'Everyday referents' }, { v: 'towel', label: 'Example 2: the bath towel' }],
  intro: (v) => (v === 'all' ? 'Put every referent on one ladder of sizes. Press <b>Next</b>.' : 'Which referents suit a bath towel? Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, S = SV(stage, W, ex.def.height), x0 = 56, Wd = W - 112, ay = 214;
    const X = (cm) => x0 + (Math.log10(cm) + 1) / 5 * Wd;
    const items = {};
    const put = (it, side) => {
      const x = X(it.cm), g = G(S), si = side === 'si', up = !si || it.up, col = si ? SI : IMP;
      const ly = up ? ay - 56 - (it.up ? 62 : 0) : ay + 46 + (it.lv || 0) * 62;
      const lx = Math.min(Math.max(x + (it.dx || 0), x0 + 30), W - 60);
      svgEl('line', { x1: x, x2: lx, y1: ay, y2: up ? ly : ly, stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': '3 3' }, g);
      svgEl('circle', { cx: x, cy: ay, r: 7, fill: col, stroke: '#fff', 'stroke-width': 2 }, g);
      const L = lab(stage, lx, ly, `<b>${it.n}</b><br>${it.v}`, up ? 'n' : 's', 'u10l2-ll ' + (si ? 'u10l2-llsi' : 'u10l2-llimp'), 0);
      items[it.n] = { g, L, x };
      return { g, L };
    };
    const base = [
      { cap: `A <b>ladder of sizes</b>: each big tick is <b>10 times</b> the one before, from a millimetre to ${T('100')} metres.`,
        run: async (c) => {
          const g = G(S);
          svgEl('line', { x1: x0 - 10, x2: x0 + Wd + 10, y1: ay, y2: ay, stroke: INK, 'stroke-width': 2.5 }, g);
          ['1 mm', '1 cm', '10 cm', '1 m', '10 m', '100 m'].forEach((t, i) => {
            const x = x0 + i * Wd / 5;
            svgEl('line', { x1: x, x2: x, y1: ay - 12, y2: ay + 12, stroke: INK, 'stroke-width': 2.4 }, g);
            if (i < 5) {
              for (let m = 2; m < 10; m++) { const xm = x + Math.log10(m) * Wd / 5; svgEl('line', { x1: xm, x2: xm, y1: ay - 5, y2: ay + 5, stroke: INK, 'stroke-width': 1 }, g); }
              svgEl('text', { x: x + Wd / 10, y: ay + 32, class: 'u10l2-svgxs', 'text-anchor': 'middle', fill: COLORS.slate }, g).textContent = '×10 →';
            }
            svgEl('text', { x, y: ay + 32, class: 'u10l2-svgs u10l2-svgb', 'text-anchor': 'middle' }, g).textContent = t;
          });
          await appear(c, g, 500);
        } },
      { cap: '<b>Imperial</b> referents: thumb ≈ 1 in, adult foot ≈ 1 ft, adult pace ≈ 1 yd.',
        run: async (c) => { for (const it of LADDER.imp) { const { g, L } = put(it, 'imp'); await appear(c, g, 250); await show(c, L, 250); } } },
      { cap: '<b>SI</b> referents, from the thickness of a dime (≈ 1 mm) to an Olympic pool (50 m).',
        run: async (c) => { for (const it of LADDER.si) { const { g, L } = put(it, 'si'); await appear(c, g, 200); await show(c, L, 200); } } }
    ];
    if (v === 'all') return base.concat([
      { cap: 'Pick a rung <b>close in size</b> to the object. A phone (≈ 7 cm wide) → <b>pinky nails</b>, about 7 of them. A gym (dozens of metres) → <b>paces</b>.',
        run: async (c) => {
          for (const [nm, cm, ref] of [['phone', 7, 'pinky nail'], ['gym', 3000, 'pace']]) {
            const x = X(cm), g = G(S);
            svgEl('rect', { x: x - 8, y: ay - 8, width: 16, height: 16, fill: COLORS.purple, transform: `rotate(45 ${x} ${ay})` }, g);
            await pop(c, g); await pop(c, lab(stage, x, ay - 16, nm, 'n', 'u10l2-tag', 0));
            items[ref].L.classList.add('u10l2-llpick'); await pulse(c, items[ref].L, 1.12);
          }
        } }
    ]);
    return base.concat([
      { cap: 'Example 2: a bath towel is roughly <b>1 to 1.5 m</b> long (the purple band).',
        run: async (c) => {
          const g = svgEl('rect', { x: X(100), y: 40, width: X(150) - X(100), height: 390, fill: COLORS.purple, 'fill-opacity': 0.16, stroke: COLORS.purple, 'stroke-width': 1.5 }, S);
          S.insertBefore(g, S.firstChild); await appear(c, g, 400);
          await pop(c, lab(stage, X(122), 36, 'towel', 'n', 'u10l2-tag', 0));
        } },
      { cap: `How many copies cover it? <b>SI</b>: the <b>workbook</b>, ${T('5')} to ${T('7.5')} widths. <b>Imperial</b>: the <b>pace</b>, ${T('1')} to ${T('1\\tfrac12')}. Pinky nails or thumbs: far too many.`,
        run: async (c) => {
          const P = panel(stage, 10, 8, 236, null, 'Copies to cover the towel', 'u10l2-cnt');
          for (const [n, t, cls] of [['pinky nail', '100 to 150', 'u10l2-vno'], ['thumb', '40 to 60', 'u10l2-vno'], ['adult foot', '3 to 5', 'u10l2-vmid'], ['workbook', '5 to 7.5 ✓', 'u10l2-vok'], ['pace', `1 to ${T('1\\tfrac12')} ✓`, 'u10l2-vok']]) {
            await show(c, line(P, `${n} <span class="u10l2-verd ${cls}">${t}</span>`), 200);
          }
          for (const n of ['workbook', 'pace']) items[n].L.classList.add('u10l2-llpick');
        } }
    ]);
  }
};

/* =============================== explainer: towel (Example 2) =============================== */
const towel = {
  title: 'Example 2 check: one towel, one referent from each system',
  height: 450,
  intro: 'A bath towel, laid out flat. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, S = SV(stage, W, ex.def.height), x0 = 70, L = 137, k = (W - 2 * x0 - 30) / 150, Lpx = L * k, ty = 128, th = 96;
    const P = panel(stage, x0 - 10, 344, W - 2 * x0 + 20, null, '', 'u10l2-eqp');
    const cnt = counter(stage, W - 150, 10);
    return [
      { cap: `A bath towel is roughly ${T('1')} to ${T('1.5')} m long.`,
        run: async (c) => {
          const g = G(S);
          svgEl('rect', { x: x0, y: ty, width: Lpx, height: th, rx: 4, fill: '#cfe3f7', stroke: '#4c7fb3', 'stroke-width': 2.5 }, g);
          for (const f of [0.12, 0.18, 0.82, 0.88]) svgEl('line', { x1: x0 + f * Lpx, x2: x0 + f * Lpx, y1: ty, y2: ty + th, stroke: '#4c7fb3', 'stroke-width': 4 }, g);
          for (let i = 0; i < 9; i++) for (const xx of [x0 - 6, x0 + Lpx + 6]) svgEl('line', { x1: xx - 4, x2: xx + 4, y1: ty + 6 + i * 10.5, y2: ty + 6 + i * 10.5, stroke: '#4c7fb3', 'stroke-width': 2 }, g);
          await appear(c, g, 400);
        } },
      { cap: '(a) <b>SI</b>: the <b>workbook width</b>, about 20 cm. Lay it along the towel: 1, 2, 3 … 6, and most of a 7th.',
        run: async (c) => {
          await show(c, lab(stage, 20, 58, '<b class="u10l2-csi">SI:</b> workbook ≈ 20 cm', 'e', 'u10l2-refc'));
          await appear(c, cnt.el, 200);
          const w = 20 * k;
          for (let i = 0; i < 7; i++) {
            const t = G(S); svgEl('rect', { x: x0 + i * w + 1, y: 76, width: w - 2, height: 48, rx: 4, fill: i === 6 ? '#fff' : i % 2 ? '#d3efe9' : '#b6e3da', stroke: SI, 'stroke-width': 2, 'stroke-dasharray': i === 6 ? '5 4' : null }, t);
            icon(t, 'book', x0 + (i + 0.5) * w, 100, 34);
            cnt.set(i < 6 ? i + 1 : '≈ 7'); await pop(c, t, 300); await sleep(c, 120);
          }
        } },
      { cap: `About ${T('7')} workbook widths: ${T('7\\times20\\text{ cm}=140\\text{ cm}')}, about ${T('1.4')} m.`,
        run: async (c) => { await show(c, line(P, `<b class="u10l2-csi">SI:</b> ${T('7\\times20\\text{ cm}=140\\text{ cm}\\approx1.4\\text{ m}')}`)); } },
      { cap: '(b) <b>Imperial</b>: the <b>pace</b>, about 1 yd. Walk along it: one full pace, then about half a pace more.',
        run: async (c) => {
          await show(c, lab(stage, W - 14, 300, '<b class="u10l2-cimp">Imperial:</b> pace ≈ 1 yd', 'w', 'u10l2-refc'));
          cnt.set(0);
          const p = 90 * k, fy = 266;
          const f0 = footprint(S, x0 + 22, fy, 44, 0, false, { fill: IMP, op: 0.8 }); await pop(c, f0);
          const hop = (xa, xb, t) => { const g = G(S); svgEl('path', { d: `M${xa} ${fy - 18} Q${(xa + xb) / 2} ${fy - 44} ${xb} ${fy - 18}`, fill: 'none', stroke: IMP, 'stroke-width': 2.6 }, g); AH(g, xb, fy - 18, 0.5, 1, IMP); return g; };
          let g = hop(x0, x0 + p); await appear(c, g, 400);
          await pop(c, footprint(S, x0 + p + 22, fy + 14, 44, 0, true, { fill: IMP, op: 0.8 })); cnt.set(1);
          await show(c, lab(stage, x0 + p / 2, fy + 26, '1 pace', 's', 'u10l2-sm u10l2-cimp', 2));
          g = hop(x0 + p, x0 + 1.5 * p); g.querySelector('path').setAttribute('stroke-dasharray', '6 4'); await appear(c, g, 400);
          await show(c, lab(stage, x0 + 1.25 * p, fy + 26, T('\\tfrac12'), 's', 'u10l2-cimp', 2)); cnt.set('1½');
        } },
      { cap: `(c) ${T('1\\tfrac12')} paces ${T('\\times\\ 1')} yd ${T('=1.5\\text{ yd}=1.5\\times3=4.5\\text{ ft}')}, about ${T('1.4')} m. Both systems agree.`,
        run: async (c) => { await show(c, line(P, `<b class="u10l2-cimp">Imperial:</b> ${T('1\\tfrac12\\times1\\text{ yd}=1.5\\text{ yd}=1.5\\times3=4.5\\text{ ft}\\ (\\approx1.4\\text{ m})')}`)); } }
    ];
  }
};

/* =============================== explainer: shed (Example 3a) =============================== */
const shed = {
  title: 'Example 3(a) check: heel-to-toe around the shed',
  height: 440,
  intro: 'The base of a rectangular shed, seen from above. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, S = SV(stage, W, ex.def.height), u = 30, sx = 78, sy = 92, L = 12, Wd = 8;
    const P = panel(stage, sx + L * u + 70, 96, W - (sx + L * u + 84), null, '', 'u10l2-eqp');
    const cnt = counter(stage, W - 150, 10);
    const walk = async (c, n, x, y, dx, dy, ang, ghost) => {
      const g = G(S);
      for (let i = 0; i < n; i++) {
        const f = footprint(g, x + (i + 0.5) * u * dx, y + (i + 0.5) * u * dy, u - 3, ang, i % 2 === 1, { fill: ghost ? COLORS.gray : '#7a5537', op: ghost ? 0.5 : 0.9 });
        if (!ghost) { cnt.set(i + 1); await pop(c, f, 160); }
      }
      if (ghost) await appear(c, g, 500);
      return g;
    };
    return [
      { cap: 'Referent: the <b>adult foot</b> (≈ 1 ft), walked <b>heel-to-toe</b> along the sides of the base.',
        run: async (c) => {
          const g = G(S);
          svgEl('rect', { x: sx, y: sy, width: L * u, height: Wd * u, fill: '#d9cbb3', stroke: '#6e5a3a', 'stroke-width': 3 }, g);
          svgEl('line', { x1: sx, x2: sx + L * u, y1: sy + Wd * u / 2, y2: sy + Wd * u / 2, stroke: '#6e5a3a', 'stroke-width': 2 }, g);
          for (let i = 1; i < 8; i++) svgEl('line', { x1: sx, x2: sx + L * u, y1: sy + i * Wd * u / 8, y2: sy + i * Wd * u / 8, stroke: '#bba98a', 'stroke-width': 1 }, g);
          svgEl('text', { x: sx + L * u / 2, y: sy + Wd * u / 2 - 10, class: 'u10l2-svgt', 'text-anchor': 'middle', fill: '#4d3e26' }, g).textContent = 'shed roof';
          await appear(c, g, 400);
          const ic = icon(S, 'foot', sx + L * u + 92, 36, 40); await pop(c, ic); await show(c, lab(stage, sx + L * u + 118, 36, '<b>adult foot</b> ≈ 1 ft', 'e', 'u10l2-refc'));
        } },
      { cap: 'Walk the long side heel-to-toe and count: <b>12</b> foot lengths.',
        run: async (c) => { await appear(c, cnt.el, 200); await walk(c, L, sx, sy - 16, 1, 0, 0); await show(c, lab(stage, sx + L * u / 2, sy + 10, '12', 's', 'u10l2-side', 2)); await show(c, line(P, 'long side: <b>12</b> ft')); } },
      { cap: 'Walk the short side: <b>8</b> foot lengths.',
        run: async (c) => { cnt.set(0); await walk(c, Wd, sx + L * u + 16, sy, 0, 1, 90); await show(c, lab(stage, sx + L * u - 10, sy + Wd * u / 2, '8', 'w', 'u10l2-side', 2)); await show(c, line(P, 'short side: <b>8</b> ft')); } },
      { cap: 'A rectangle’s <b>opposite sides are equal</b>, so the other two sides are 12 and 8 again: no need to walk them.',
        run: async (c) => {
          await walk(c, L, sx + L * u, sy + Wd * u + 16, -1, 0, 180, true); await walk(c, Wd, sx - 16, sy + Wd * u, 0, -1, -90, true);
          await show(c, lab(stage, sx + L * u / 2, sy + Wd * u - 10, '12', 'n', 'u10l2-side u10l2-ghost', 2)); await show(c, lab(stage, sx + 10, sy + Wd * u / 2, '8', 'e', 'u10l2-side u10l2-ghost', 2));
        } },
      { cap: `${T('P\\approx12+8+12+8=2(8+12)=40')} ft.`,
        run: async (c) => { await show(c, line(P, T('P\\approx12+8+12+8'))); await show(c, line(P, T('=2(8+12)=\\boldsymbol{40\\text{ ft}}'), 'u10l2-lest')); } },
      { cap: 'For a big shed, switch to <b>paces</b> (≈ 1 yd = 3 ft): the long side is only 4 paces, so the counts stay small.',
        run: async (c) => {
          const g = G(S);
          for (let i = 0; i < 4; i++) { svgEl('path', { d: `M${sx + i * 3 * u + 4} ${sy - 44} Q${sx + (i + 0.5) * 3 * u} ${sy - 78} ${sx + (i + 1) * 3 * u - 4} ${sy - 44}`, fill: 'none', stroke: IMP, 'stroke-width': 2.6 }, g); AH(g, sx + (i + 1) * 3 * u - 4, sy - 44, 0.5, 1, IMP); }
          await appear(c, g, 500);
          await show(c, line(P, `long side ${T('=12')} ft ${T('=4')} paces`, 'u10l2-limp'));
        } }
    ];
  }
};

/* =============================== explainer: wheel (Example 3b) =============================== */
const wheel = {
  title: 'Example 3(b) check: wrap it, straighten it, count it',
  height: 470,
  intro: 'A road bicycle wheel, 700 mm across. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, S = SV(stage, W, ex.def.height), R = 110, k = R / 35, Cpx = 2 * Math.PI * R, gx = 130, gy = 318, cy = gy - R;
    const ground = G(S); svgEl('line', { x1: 20, x2: W - 20, y1: gy + 5, y2: gy + 5, stroke: '#9c8f74', 'stroke-width': 6 }, ground);
    let wg, spin, str, gstr, dimG;
    const drawWheel = () => {
      wg = G(S); spin = G(wg);
      svgEl('circle', { cx: 0, cy: 0, r: R - 4, fill: 'none', stroke: '#2b2f36', 'stroke-width': 9 }, spin);
      svgEl('circle', { cx: 0, cy: 0, r: R - 14, fill: 'none', stroke: '#9aa0ab', 'stroke-width': 3 }, spin);
      for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; svgEl('line', { x1: 0, y1: 0, x2: (R - 15) * Math.cos(a), y2: (R - 15) * Math.sin(a), stroke: '#9aa0ab', 'stroke-width': 1.3 }, spin); }
      svgEl('circle', { cx: 0, cy: 0, r: 10, fill: '#5d6470' }, spin);
      svgEl('circle', { cx: 0, cy: R - 4, r: 4, fill: '#f2c14e' }, spin);
      str = svgEl('path', { d: '', fill: 'none', stroke: TRUE, 'stroke-width': 4, 'stroke-linecap': 'round' }, S);
      gstr = svgEl('line', { x1: gx, x2: gx, y1: gy - 1, y2: gy - 1, stroke: TRUE, 'stroke-width': 4, 'stroke-linecap': 'round' }, S);
    };
    const arc = (cx, a0, a1) => { const pts = []; const n = 120; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push(`${(cx + (R + 1) * Math.cos(a)).toFixed(1)},${(cy - (R + 1) * Math.sin(a)).toFixed(1)}`); } return 'M' + pts.join(' L'); };
    const at = (s) => {
      const cx = gx + s, th = s / R;
      wg.setAttribute('transform', `translate(${cx} ${cy})`); spin.setAttribute('transform', `rotate(${th * 180 / Math.PI})`);
      str.setAttribute('d', 2 * Math.PI - th > 0.001 ? arc(cx, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI - th)) : '');
      gstr.setAttribute('x2', gx + s);
    };
    const P = panel(stage, 420, 350, W - 434, null, '', 'u10l2-eqp');
    const cnt = counter(stage, W - 150, 10, 'Nails');
    return [
      { cap: 'A wheel’s rim is <b>curved</b>, so no straight referent can be laid along it.',
        run: async (c) => {
          drawWheel(); wg.setAttribute('transform', `translate(${gx} ${cy})`); await appear(c, wg, 400);
          dimG = G(S); dim(dimG, gx - R, cy - R - 22, gx + R, cy - R - 22, INK);
          await appear(c, dimG, 300); dimG.lbl = lab(stage, gx, cy - R - 28, `${T('700')} mm ${T('=70')} cm`, 'n', 'u10l2-sm', 2); await show(c, dimG.lbl);
        } },
      { cap: '<b>Wrap a string</b> once around the tire, and mark where it meets itself.',
        run: async (c) => { await tween(c, 1100, (t) => str.setAttribute('d', arc(gx, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * t))); } },
      { cap: '<b>Lay the string out straight</b>: roll it off along the ground. It is exactly as long as the circumference.',
        run: async (c) => {
          dimG.style.opacity = 0; dimG.lbl.style.opacity = 0;
          await tween(c, 2200, (t) => at(t * Cpx));
          at(Cpx);
        } },
      { cap: 'Measure the string with a small SI referent: <b>pinky-nail widths</b> (≈ 1 cm each). The count <b>is</b> the circumference in centimetres.',
        run: async (c) => {
          await appear(c, cnt.el, 200);
          const tg = G(S);
          for (let i = 1; i < 220; i++) svgEl('line', { x1: gx + i * k, x2: gx + i * k, y1: gy - 8, y2: gy - 1 - (i % 10 === 0 ? 12 : 0), stroke: INK, 'stroke-width': i % 10 === 0 ? 1.4 : 0.8 }, tg);
          const cid = 'u10l2-wclip', cp = svgEl('clipPath', { id: cid }, svgEl('defs', {}, S)), cr = svgEl('rect', { x: gx, y: gy - 30, width: 0, height: 40 }, cp);
          tg.setAttribute('clip-path', `url(#${cid})`);
          // zoom inset: the first 8 nails
          const zx = 30, zy = 352, zg = G(S); zg.style.opacity = 0;
          svgEl('polygon', { points: `${gx},${gy + 8} ${gx + 8 * k},${gy + 8} ${zx + 8 * 44 + 10},${zy} ${zx},${zy}`, fill: COLORS.gray, 'fill-opacity': 0.12 }, zg);
          svgEl('rect', { x: zx, y: zy, width: 8 * 44 + 10, height: 96, rx: 10, fill: '#fff', stroke: COLORS.gray, 'stroke-width': 1.5 }, zg);
          svgEl('line', { x1: zx + 5, x2: zx + 8 * 44 + 5, y1: zy + 74, y2: zy + 74, stroke: TRUE, 'stroke-width': 5 }, zg);
          for (let i = 0; i < 8; i++) icon(zg, 'nail', zx + 5 + (i + 0.5) * 44, zy + 42, 40);
          svgEl('text', { x: zx + 8, y: zy + 92, class: 'u10l2-svgxs', fill: COLORS.slate }, zg).textContent = 'zoom: each nail ≈ 1 cm';
          await appear(c, zg, 400);
          await tween(c, 2200, (t) => { cr.setAttribute('width', t * 220 * k); cnt.set(Math.round(t * 220)); }, (t) => t);
          cnt.set('≈ 220');
        } },
      { cap: `Check with ${T('C=\\pi d')}: ${T('\\pi(70)\\approx220')} cm, so expect roughly <b>220</b> fingernail widths.`,
        run: async (c) => { await show(c, line(P, `${T('C=\\pi d=\\pi(70)=219.9\\ldots')}`)); await show(c, line(P, `${T('\\approx220\\text{ cm}')}: about <b>220</b> nail widths`, 'u10l2-lest')); } }
    ];
  }
};

/* =============================== explainer: card (Example 4) =============================== */
const card = {
  title: 'Example 4 check: measure the scale diagram in both systems',
  height: 480,
  intro: 'The scale diagram of the access card, with a ruler drawn to the same scale. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, S = SV(stage, W, ex.def.height), k = 80, x0 = 64, cy0 = 30, cw = 3 * k, ch = 2 * k, ry = cy0 + ch + 4;
    const P = panel(stage, x0 - 10, 336, W - 2 * x0 + 20, null, '', 'u10l2-eqp');
    const cardAt = (x, ghost, nm) => {
      const g = G(S);
      svgEl('rect', { x, y: cy0, width: cw, height: ch, rx: 8, fill: ghost ? '#f6f8fc' : '#eaf2ff', stroke: ghost ? COLORS.gray : INK, 'stroke-width': 2.5, 'stroke-dasharray': ghost ? '8 6' : null }, g);
      svgEl('text', { x: x + cw / 2, y: cy0 + ch / 2 + 7, class: 'u10l2-svgt', 'text-anchor': 'middle', fill: ghost ? COLORS.gray : INK }, g).textContent = ghost ? nm : 'sample card';
      return g;
    };
    const cmRuler = () => {
      const g = G(S);
      svgEl('rect', { x: x0 - 22, y: ry, width: 10.5 * k + 44, height: 64, rx: 4, fill: '#fff8dc', stroke: '#b8a46a', 'stroke-width': 1.6 }, g);
      for (let i = 0; i <= 105; i++) { const x = x0 + i * k / 10; svgEl('line', { x1: x, x2: x, y1: ry, y2: ry + (i % 10 === 0 ? 26 : i % 5 === 0 ? 17 : 10), stroke: INK, 'stroke-width': i % 10 === 0 ? 1.6 : 1 }, g); if (i % 10 === 0) svgEl('text', { x, y: ry + 46, class: 'u10l2-svgs', 'text-anchor': 'middle' }, g).textContent = String(i / 10); }
      svgEl('text', { x: x0 + 10.5 * k + 16, y: ry + 58, class: 'u10l2-svgxs', 'text-anchor': 'end', fill: COLORS.slate }, g).textContent = 'cm';
      return g;
    };
    const inRuler = () => {
      const g = G(S), ki = 2.54 * k;
      svgEl('rect', { x: x0 - 22, y: ry, width: 4.25 * ki + 44, height: 64, rx: 4, fill: '#eef4ff', stroke: '#7f9cc9', 'stroke-width': 1.6 }, g);
      for (const t of inTicks(4.25, 16)) { const x = x0 + t.v * k; svgEl('line', { x1: x, x2: x, y1: ry, y2: ry + t.len, stroke: INK, 'stroke-width': t.label ? 1.6 : 1 }, g); if (t.label) svgEl('text', { x, y: ry + 48, class: 'u10l2-svgs', 'text-anchor': 'middle' }, g).textContent = t.label; }
      svgEl('text', { x: x0 + 4.25 * ki + 14, y: ry + 58, class: 'u10l2-svgxs', 'text-anchor': 'end', fill: COLORS.slate }, g).textContent = 'in';
      return g;
    };
    const mark = async (c, cm, txt, cls) => {
      const x = x0 + cm * k, g = G(S); svgEl('line', { x1: x, x2: x, y1: cy0 - 6, y2: ry + 30, stroke: TRUE, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, g);
      await appear(c, g, 300); const L = lab(stage, x, 1, txt, 's', 'u10l2-truel ' + (cls || ''), 0); await pop(c, L); return [g, L];
    };
    let cmR, inR, m1, ghosts = [];
    const drop = (...els) => els.flat().forEach((e) => e && (e.style.opacity = 0));
    return [
      { cap: `On paper the diagram is ${T('3.0')} cm long. Here the diagram and the ruler are drawn to the <b>same scale</b>, so the ruler reads true.`,
        run: async (c) => { await appear(c, cardAt(x0), 400); } },
      { cap: '(a) <b>SI</b>: line up the <b>0</b> with the left edge. The right edge reads <b>3.0 cm</b>.',
        run: async (c) => { cmR = cmRuler(); await c.anim(cmR, [{ transform: 'translateY(120px)', opacity: 0 }, { transform: 'none', opacity: 1 }], 600); m1 = await mark(c, 3, '3.0 cm'); await show(c, line(P, `(a) ${T('3.0\\text{ cm}')}`, 'u10l2-lsi')); } },
      { cap: `<b>Imperial</b>: the edge lands just short of ${T('1\\tfrac{3}{16}')} in. Exactly: ${T('3.0\\div2.54=1.1811\\ldots\\approx1.18')} in.`,
        run: async (c) => { drop(cmR, m1); inR = inRuler(); await c.anim(inR, [{ transform: 'translateY(120px)', opacity: 0 }, { transform: 'none', opacity: 1 }], 600); m1 = await mark(c, 3, '≈ 1.18 in', 'u10l2-truei'); P.lastChild.innerHTML += ` &nbsp;=&nbsp; ${T('3.0\\div2.54\\approx1.18\\text{ in}')}`; await pulse(c, P.lastChild, 1.04); } },
      { cap: `(b) The scale is ${T('1:3')}: each ${T('1')} cm on the diagram is ${T('3')} cm on the real card. Three diagram lengths: ${T('3.0\\times3=9.0')} cm.`,
        run: async (c) => {
          drop(inR, m1); cmR = cmRuler(); await appear(c, cmR, 300);
          for (const j of [1, 2]) { const g = cardAt(x0 + j * cw, true, j === 1 ? '× 2' : '× 3'); ghosts.push(g); await pop(c, g, 380); }
          m1 = await mark(c, 9, '9.0 cm'); await show(c, line(P, `(b) ${T('3.0\\times3=9.0\\text{ cm}')}`, 'u10l2-lsi'));
        } },
      { cap: `In inches: ${T('9.0\\div2.54=3.5433\\ldots\\approx3.54')} in, the same as ${T('1.18\\times3')}. The length is multiplied by 3; the <b>unit</b> does not change.`,
        run: async (c) => { drop(cmR, m1); inR = inRuler(); await appear(c, inR, 300); m1 = await mark(c, 9, '≈ 3.54 in', 'u10l2-truei'); P.lastChild.innerHTML += ` &nbsp;=&nbsp; ${T('9.0\\div2.54\\approx3.54\\text{ in}')}`; await pulse(c, P.lastChild, 1.04); } },
      { cap: '(c) Cards like this are made to a <b>fixed standard size</b>, and one is always in your wallet: a personal referent for about <b>9 cm</b>, or <b>3½ in</b>.',
        run: async (c) => { const s = stamp(stage, 'referent ✓', { ok: true, x: x0 + 1.5 * cw, y: cy0 + ch - 28 }); await stampIn(c, s); await show(c, line(P, `(c) a referent for ${T('\\approx9')} cm or ${T('\\approx3\\tfrac12')} in`, 'u10l2-lest')); } }
    ];
  }
};

/* =============================== explainer: km (Example 5) =============================== */
const km = {
  title: 'Example 5 check: build a kilometre out of a smaller referent',
  height: 420,
  choices: [{ v: 'pool', label: 'From pool lengths' }, { v: 'pace', label: 'From paces' }],
  intro: (v) => (v === 'pool' ? 'Nothing Marcus knows is 1 km long. Press <b>Next</b>.' : 'Try the same thing with a much smaller referent. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const W = ex.W, S = SV(stage, W, ex.def.height), x0 = 40, Wd = W - 80, by = 150, bh = 52;
    const P = panel(stage, x0 - 10, 312, Wd + 20, null, '', 'u10l2-eqp');
    const cnt = counter(stage, W - 150, 10, v === 'pool' ? 'Pools' : 'Paces');
    const first = { cap: `Marcus needs a referent for ${T('1')} km ${T('=1\\,000')} m, but nothing he knows is that long.`,
      run: async (c) => {
        const g = G(S); svgEl('rect', { x: x0, y: by, width: Wd, height: bh, rx: 6, fill: '#f1efe8', stroke: INK, 'stroke-width': 2 }, g);
        dim(g, x0, by - 26, x0 + Wd, by - 26, INK); await appear(c, g, 400);
        await show(c, lab(stage, x0 + Wd / 2, by - 32, `${T('1\\text{ km}=1\\,000\\text{ m}')}`, 'n', '', 2));
      } };
    if (v === 'pool') {
      const pw = Wd / 20;
      return [first,
        { cap: 'Start from a referent he does know: an <b>Olympic swimming pool</b> is <b>50 m</b> long.',
          run: async (c) => { await appear(c, cnt.el, 200); const t = G(S); poolTile(t, x0, by, pw, bh, 1); cnt.set(1); await pop(c, t); await show(c, lab(stage, x0 + pw / 2, by + bh + 34, '50 m', 's', 'u10l2-sm u10l2-csi', 0)); } },
        { cap: `Lay pool lengths end to end and count: … <b>20</b> of them reach ${T('1')} km.`,
          run: async (c) => { for (let i = 1; i < 20; i++) { const t = G(S); poolTile(t, x0 + i * pw, by, pw, bh, i + 1); cnt.set(i + 1); await pop(c, t, 220); await sleep(c, 40); } } },
        { cap: `${T('1\\,000\\text{ m}\\div50\\text{ m per pool length}=20')}. So ${T('1')} km is about <b>20 pool lengths</b>.`,
          run: async (c) => { await show(c, line(P, `${T('1\\,000\\text{ m}\\div50\\text{ m}=\\boldsymbol{20}')} pool lengths`, 'u10l2-lest')); } }
      ];
    }
    return [first,
      { cap: `Start from the <b>pace</b>, about ${T('1')} yd ${T('\\approx0.9')} m. Zoom in: the first ${T('10')} m is about 11 paces.`,
        run: async (c) => {
          const zx = x0 + 300, zy = by + bh + 30, zw = 520, zh = 70, zg = G(S); zg.style.opacity = 0;
          svgEl('polygon', { points: `${x0},${by + bh} ${x0 + Wd / 100},${by + bh} ${zx + zw},${zy} ${zx},${zy}`, fill: COLORS.gray, 'fill-opacity': 0.13 }, zg);
          svgEl('rect', { x: zx, y: zy, width: zw, height: zh, rx: 10, fill: '#fff', stroke: COLORS.gray, 'stroke-width': 1.5 }, zg);
          const pk = (zw - 20) / 10; for (let i = 0; i < 11; i++) footprint(zg, zx + 10 + i * 0.9 * pk + 10, zy + zh / 2 + (i % 2 ? -12 : 12), 22, 0, i % 2 === 1, { fill: IMP, op: 0.85 });
          svgEl('rect', { x: x0, y: by - 2, width: Math.max(Wd / 100, 3), height: bh + 4, fill: 'none', stroke: TRUE, 'stroke-width': 2 }, S);
          await appear(c, zg, 500); await show(c, lab(stage, zx + zw + 8, zy + zh / 2, `first ${T('10')} m`, 'e', 'u10l2-sm', 0));
        } },
      { cap: 'Pace the whole kilometre and count …',
        run: async (c) => {
          await appear(c, cnt.el, 200); hatchDef(S);
          const fill = svgEl('rect', { x: x0, y: by, width: 0, height: bh, fill: 'url(#u10l2-hatch)' }, S);
          await tween(c, 2400, (t) => { fill.setAttribute('width', t * Wd); cnt.set(thin(Math.round(t * 1111))); }, (t) => t);
          fill.setAttribute('width', Wd); cnt.set('≈ ' + thin(1111));
        } },
      { cap: `${T('1\\,000\\div0.9\\approx1\\,111')} paces: correct, but hard to picture or to count without losing track. ${T('20')} pool lengths is the easier referent.`,
        run: async (c) => { await show(c, line(P, `${T('1\\,000\\text{ m}\\div0.9\\text{ m}\\approx1\\,111')} paces &nbsp;<span class="u10l2-verd u10l2-vmid">works, but hard to picture</span>`)); await show(c, line(P, `${T('1\\,000\\text{ m}\\div50\\text{ m}=20')} pool lengths &nbsp;<span class="u10l2-verd u10l2-vok">easier ✓</span>`)); } }
    ];
  }
};
function poolTile(g, x, y, w, hh, n) {
  svgEl('rect', { x: x + 1, y, width: w - 2, height: hh, rx: 3, fill: n % 2 ? '#5fb0e6' : '#7cc1ee', stroke: '#2d78ad', 'stroke-width': 1.5 }, g);
  for (const f of [0.3, 0.5, 0.7]) svgEl('line', { x1: x + 4, x2: x + w - 4, y1: y + hh * f, y2: y + hh * f, stroke: '#fff', 'stroke-width': 1.2, 'stroke-dasharray': '3 2' }, g);
  svgEl('text', { x: x + w / 2, y: y + hh + 22, class: 'u10l2-svgxs', 'text-anchor': 'middle', fill: '#2d78ad' }, g).textContent = String(n);
}

/* =============================== mount =============================== */
mountWarm();
mountFive();
export const explainers = mountExplainers({ imperial, metric, lay, fit, ladder, towel, shed, wheel, card, km });
