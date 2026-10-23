/* Math 10C · Unit 5 · Lesson 7 — Function Notation: Graphs, Conversions, and Real-World Models.
 * The Celsius/Fahrenheit warm-up, the static figures (booklet grids and answer graphs) and ten explainers.
 * Colour code (whole page): input / independent variable / domain amber, output / dependent variable / range purple,
 * the function's graph teal, forwards read-outs blue, impossible values red. */
import {
  h, tex, add, box, fmt, Graph, ValueTable, stamp, stampIn, mountExplainers, pop, fadeIn, appear, pulse, sleep, tween,
  pairTex, svgEl, liveCtx, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
/* KaTeX allowing \htmlClass (to colour the input variable inside an expression) */
const K = (src) => {
  try { return window.katex.renderToString(String(src), { throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src); }
};
const nT = (v) => fmt(v).replace(/ /g, '\\,'); // a number for TeX: 18\,400
const nH = (v) => fmt(v).replace('-', '−'); // a number for HTML text: 18 400 (narrow no-break space), real minus
const kLab = (v) => (v === 0 ? '0' : nH(v / 1000) + 'k'); // the booklet's 40k, 80k … axis labels
const AMB = COLORS.amber, PUR = COLORS.purple, TEAL = COLORS.teal, BLUE = COLORS.blue, RED = COLORS.red;

/* A Graph whose axis numbers can be formatted (thin-space thousands, or the booklet's "k" labels). */
class LG extends Graph {
  frame() {
    super.frame();
    const o = this.o; if (!o.xfmt && !o.yfmt) return;
    this.layers.axes.querySelectorAll('text.bk-num').forEach((t) => {
      const f = t.getAttribute('text-anchor') === 'middle' ? o.xfmt : o.yfmt; if (!f) return;
      const v = parseFloat(t.textContent.replace('−', '-')); if (Number.isFinite(v)) t.textContent = f(v);
    });
  }
}

/* ---------------- small helpers ---------------- */
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u5l7-panel', title ? `<div class="u5l7-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u5l7-line' + (cls ? ' ' + cls : ''), html); p.appendChild(d); return d; };
const lineIn = (c, p, html, cls) => fadeIn(c, line(p, html, cls));
const dash = (G, a, b, color = 'slate', w = 2.6) => G.segment(a, b, { color, width: w, dash: '7 6' });
const pill = (G, x, y, html, color, pos) => G.label(x, y, html, { pos, cls: 'bk-pill u5l7-gpill', color, gap: 6 });
/** forwards: from (a, 0) up/down to (a, y), then across to the vertical axis */
async function readFwd(c, G, a, y, o = {}) {
  const color = o.color || 'blue', ax = G.axisX(), ay = G.axisY(), out = [];
  out.push(G.point(a, ay, { color, r: 6 })); await pop(c, out[0]);
  if (Math.abs(y - ay) > 1e-9) { const s = dash(G, [a, ay], [a, y], color); out.push(s); await G.drawIn(s, 550, c); }
  const p = G.point(a, y, { color, r: 7.5 }); out.push(p); await pop(c, p);
  if (Math.abs(a - ax) > 1e-9 && Math.abs(y - ay) > 1e-9) { const s = dash(G, [a, y], [ax, y], color); out.push(s); await G.drawIn(s, 550, c); }
  if (o.yLab) { const l = o.labAt === 'pt' ? pill(G, a, y, o.yLab, color, o.yPos || 'nw') : pill(G, ax, y, o.yLab, color, o.yPos || 'w'); out.push(l); await pop(c, l); }
  return out;
}
/** backwards: from (0, b) across to (x, b) for each x, then down/up to the horizontal axis */
async function readBack(c, G, b, xs, o = {}) {
  const color = o.color || 'purple', ax = G.axisX(), ay = G.axisY(), out = [];
  const s0 = G.point(ax, b, { color, r: 6 }); out.push(s0); await pop(c, s0);
  if (o.full) { const hl = G.hline(b, { color, width: 2.2, dash: '4 7' }); out.push(hl); await G.drawIn(hl, 700, c); }
  for (const x of xs) {
    if (!o.full) { const s = dash(G, [ax, b], [x, b], color); out.push(s); await G.drawIn(s, 500, c); }
    const p = G.point(x, b, { color, r: 7.5 }); out.push(p); await pop(c, p);
    if (Math.abs(b - ay) > 1e-9) { const s = dash(G, [x, b], [x, ay], color); out.push(s); await G.drawIn(s, 450, c); }
    if (o.xLab) { const l = pill(G, x, ay, o.xLab(x), color, o.xPos || (b > ay ? 's' : 'n')); out.push(l); await pop(c, l); }
  }
  return out;
}
const say = (stage, x, y, w, html) => { const d = add(stage, h('div', 'u5l7-say', html), x, y); if (w) d.style.width = w + 'px'; d.style.opacity = 0; return d; };
const sayIn = (c, d) => fadeIn(c, d, 380);

/* ============================================================================================================
 * Warm-up: a thermometer with a Celsius scale on top and a Fahrenheit scale underneath (placed at C = (F − 32)/1.8)
 * ============================================================================================================ */
function mountWarm() {
  const host = document.getElementById('u5l7-thermo'); if (!host) return;
  const X = (C) => 470 + 8 * C, cy = 104, W = 968, H = 178;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'u5l7-tsvg', 'aria-label': 'A thermometer with a Celsius scale above and a Fahrenheit scale below' }, host);
  const ink = '#1e2d46', fahr = '#1e6eb4', acc = '#d23c32';
  // glass
  svgEl('rect', { x: 66, y: cy - 17, width: X(55) - 60, height: 34, rx: 17, fill: '#fff', stroke: ink, 'stroke-width': 2.2 }, svg);
  svgEl('circle', { cx: 70, cy, r: 30, fill: '#fff', stroke: ink, 'stroke-width': 2.2 }, svg);
  svgEl('rect', { x: 72, y: cy - 15.5, width: 40, height: 31, fill: '#fff' }, svg);
  svgEl('circle', { cx: 70, cy, r: 23, fill: acc }, svg);
  const fluid = svgEl('rect', { x: 70, y: cy - 9, width: X(20) - 70, height: 18, rx: 4, fill: acc }, svg);
  // Celsius ticks (top)
  for (let C = -45; C <= 55; C += 5) {
    const major = C % 10 === 0, x = X(C);
    svgEl('line', { x1: x, x2: x, y1: cy - 17, y2: cy - (major ? 33 : 25), stroke: ink, 'stroke-width': major ? 2 : 1.3 }, svg);
    if (major) { const t = svgEl('text', { x, y: cy - 39, 'text-anchor': 'middle', class: 'u5l7-tnum' }, svg); t.textContent = String(C).replace('-', '−'); }
  }
  const tc = svgEl('text', { x: X(55) + 10, y: cy - 30, class: 'u5l7-tunit' }, svg); tc.textContent = '°C';
  // Fahrenheit ticks (bottom)
  for (let F = -40; F <= 130; F += 10) {
    const x = X((F - 32) / 1.8); if (x > X(55) + 1) continue;
    const major = F % 20 === 0;
    svgEl('line', { x1: x, x2: x, y1: cy + 17, y2: cy + (major ? 33 : 25), stroke: fahr, 'stroke-width': major ? 2 : 1.3 }, svg);
    if (major) { const t = svgEl('text', { x, y: cy + 53, 'text-anchor': 'middle', class: 'u5l7-tnum u5l7-tf' }, svg); t.textContent = String(F).replace('-', '−'); }
  }
  const tf = svgEl('text', { x: X(55) + 10, y: cy + 46, class: 'u5l7-tunit u5l7-tf' }, svg); tf.textContent = '°F';
  // landmarks
  [[-30, 'Prairie cold snap'], [0, 'water freezes'], [20, 'room temperature']].forEach(([C, s]) => {
    const x = X(C), lab = svgEl('text', { x, y: 18, 'text-anchor': 'middle', class: 'u5l7-tland' }, svg); lab.textContent = s;
    svgEl('path', { d: `M${x} 25V${cy - 70}`, stroke: ink, 'stroke-width': 1.6 }, svg);
    svgEl('polygon', { points: `${x - 5},${cy - 72} ${x + 5},${cy - 72} ${x},${cy - 63}`, fill: ink }, svg);
  });
  const read = document.getElementById('u5l7-tread');
  const show = (C) => { const F = Math.round((1.8 * C + 32) * 10) / 10; read.innerHTML = `${T(`F(${nT(C)})=1.8(${nT(C)})+32=${nT(F)}`)}`; };
  let cur = 20, busy = 0;
  show(20);
  const c = liveCtx();
  document.querySelectorAll('[data-tc]').forEach((b) => b.addEventListener('click', () => {
    const to = Number(b.dataset.tc), from = cur, id = ++busy; cur = to;
    tween(c, 700, (t) => { if (id !== busy) return false; fluid.setAttribute('width', X(from + (to - from) * t) - 70); });
    show(to);
  }));
  // the poll's answer graph: F(C) = 1.8C + 32 meets F = C at (−40, −40)
  const g = document.getElementById('u5l7-g-wu');
  if (g) {
    const G = new LG(g, { width: 340, height: 330, xmin: -60, xmax: 40, ymin: -60, ymax: 110, xstep: 10, ystep: 10, xlabels: 20, ylabels: 20, xtitle: 'C', ytitle: 'F', fontSize: 15 });
    G.fn((x) => 1.8 * x + 32, { color: 'teal' });
    G.fn((x) => x, { color: 'amber', dash: true });
    G.point(-40, -40, { color: 'red', label: T('(-40,\\ -40)'), pos: 'se' });
    G.label(-32, 62, T('F=1.8C+32'), { pos: 'c', color: 'teal', cls: 'bk-ptlab' });
    G.label(22, 22, T('F=C'), { pos: 'se', color: 'amber', cls: 'bk-ptlab' });
  }
}

/* ============================================================================================================
 * Static figures: the booklet's grids (for sketching) and the answer graphs
 * ============================================================================================================ */
const M_PTS = [[-6, -2], [-2, 6], [2, -2], [6, 6]];
const mFn = (x) => (x <= -2 ? -2 + 2 * (x + 6) : x <= 2 ? 6 - 2 * (x + 2) : -2 + 2 * (x - 2));
const GRID = {
  ex2: { xmin: -4, xmax: 4, ymin: -8, ymax: 5, xtitle: 'x', ytitle: 'f(x)' },
  ex3: { xmin: -8, xmax: 8, ymin: -5, ymax: 9, xlabels: 2, ylabels: 2, xtitle: 'x', ytitle: 'm(x)' },
  ex4: { xmin: 0, xmax: 22, ymin: 0, ymax: 10000, xstep: 2, ystep: 1000, xlabels: 4, ylabels: 2000, xtitle: 't\\text{ (min)}', ytitle: 'V(t)\\text{ (L)}', yfmt: nH, pad: [18, 18, 34, 58] },
  ex5: { xmin: 0, xmax: 5000, ymin: 0, ymax: 160000, xstep: 500, ystep: 20000, xlabels: 1000, ylabels: 40000, xtitle: 'n', ytitle: 'C(n)\\text{ (\\$)}', xfmt: nH, yfmt: kLab, pad: [18, 22, 34, 50] },
  ex6: { xmin: 0, xmax: 90, ymin: 0, ymax: 35000, xstep: 10, ystep: 5000, xlabels: 20, ylabels: 10000, xtitle: 't\\text{ (s)}', ytitle: 'h(t)\\text{ (cm)}', yfmt: kLab, pad: [18, 22, 34, 50] }
};
const grid = (host, k, w, hh, extra = {}) => new LG(host, Object.assign({ width: w, height: hh }, GRID[k], extra));
const drawM = (G, o = {}) => {
  const L = G.polyline(M_PTS, { color: 'ink', width: 3.6, ends: ['closed', 'closed'], ...o });
  G.label(-6, -2, T('M'), { pos: 'sw', cls: 'bk-ptlab' }); G.label(6, 6, T('N'), { pos: 'ne', cls: 'bk-ptlab' });
  return L;
};
const vFn = (t) => -450 * t + 9000, cFn = (n) => 18400 + 27 * n, rFn = (t) => -20 * t * t + 1600 * t;
function mountFigures() {
  const $ = (id) => document.getElementById(id);
  if ($('u5l7-g-ex2')) grid($('u5l7-g-ex2'), 'ex2', 340, 400);
  if ($('u5l7-t-ex2')) new ValueTable($('u5l7-t-ex2'), { headers: ['x', 'f(x)'], rows: [-2, -1, 0, 1, 2, 3].map((x) => [x, 2 * x - 3]), layout: 'h', cellW: 52, cellH: 40, headW: 64, tap: false });
  if ($('u5l7-a-ex2')) {
    const G = grid($('u5l7-a-ex2'), 'ex2', 250, 300, { fontSize: 14 });
    G.line([0, -3], [1, -1], { color: 'red', width: 3 });
    [-2, -1, 0, 1, 2, 3].forEach((x) => G.point(x, 2 * x - 3, { color: 'red', r: 5 }));
  }
  if ($('u5l7-g-ex3')) drawM(grid($('u5l7-g-ex3'), 'ex3', 430, 400));
  if ($('u5l7-g-ex4')) grid($('u5l7-g-ex4'), 'ex4', 430, 360);
  if ($('u5l7-a-ex4')) {
    const G = grid($('u5l7-a-ex4'), 'ex4', 300, 260, { fontSize: 13 });
    G.segment([0, 9000], [20, 0], { color: 'red', width: 3, ends: ['closed', 'closed'] });
    G.point(6, 6300, { color: 'red', r: 5, label: T('(6,\\ 6\\,300)'), pos: 'ne' });
    G.label(20, 0, T('(20,\\ 0)'), { pos: 'n', color: 'red', cls: 'bk-ptlab', gap: 26 });
  }
  if ($('u5l7-g-ex5')) grid($('u5l7-g-ex5'), 'ex5', 430, 340);
  if ($('u5l7-a-ex5')) {
    const G = grid($('u5l7-a-ex5'), 'ex5', 300, 250, { fontSize: 13, xlabels: 2000 });
    G.segment([0, 18400], [5000, 153400], { color: 'red', width: 3, ends: ['closed', 'closed'] });
    G.label(0, 18400, T('(0,\\ 18\\,400)'), { pos: 'se', color: 'red', cls: 'bk-ptlab', gap: 6 });
    G.label(5000, 153400, T('(5\\,000,\\ 153\\,400)'), { pos: 'nw', color: 'red', cls: 'bk-ptlab', gap: 2 });
  }
  if ($('u5l7-g-ex6')) grid($('u5l7-g-ex6'), 'ex6', 430, 330);
  if ($('u5l7-a-ex6')) {
    const G = grid($('u5l7-a-ex6'), 'ex6', 300, 250, { fontSize: 13 });
    G.fn(rFn, { from: 0, to: 80, color: 'red', width: 3, ends: ['closed', 'closed'] });
    G.point(40, 32000, { color: 'red', r: 5, label: T('(40,\\ 32\\,000)'), pos: 'n' });
  }
}

/* ============================================================================================================
 * 1. swap — the same rule in two notations
 * ============================================================================================================ */
const SW = {
  f: { label: T('f(x)=2x-3'), dir: 'f2y', name: 'f', v: 'x', rhs: '2x-3', fn: (x) => 2 * x - 3, win: { xmin: -4, xmax: 4, ymin: -8, ymax: 6 } },
  h: { label: 'Ex 1(a) ii check', dir: 'f2y', name: 'h', v: 't', rhs: 't^2+3t-8', fn: (t) => t * t + 3 * t - 8, win: { xmin: -7, xmax: 4, ymin: -12, ymax: 12, ylabels: 4 } },
  b: { label: 'Ex 1(b) check', dir: 'y2f', name: 'f', v: 'x', rhs: '9x-4', fn: (x) => 9 * x - 4, win: { xmin: -2, xmax: 3, ymin: -15, ymax: 20, ystep: 5, xlabels: 1 } },
  F: { label: T('F(C)=1.8C+32'), dir: 'f2y', name: 'F', v: 'C', rhs: '1.8C+32', fn: (c) => 1.8 * c + 32, win: { xmin: -60, xmax: 60, ymin: -60, ymax: 140, xstep: 10, ystep: 20, xlabels: 20, ylabels: 40 } }
};
const swap = {
  title: 'One rule, two notations',
  height: 420,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SW).map((k) => ({ v: k, label: SW[k].label })),
  intro: (k) => (SW[k].dir === 'f2y' ? `Rewrite ${T(SW[k].name + '(' + SW[k].v + ')=' + SW[k].rhs)} in ${T('x')}-${T('y')} notation. Press <b>Next</b>.` : `Rewrite ${T('y=' + SW[k].rhs)} in function notation. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = SW[k], v = d.v, iv = `\\htmlClass{u5l7-iv}{${v}}`, rhsK = d.rhs.split(v).join(iv);
    const fLHS = `\\htmlClass{u5l7-tg u5l7-nm}{${d.name}}(\\htmlClass{u5l7-tg u5l7-in}{${v}})`, yLHS = '\\htmlClass{u5l7-tg u5l7-out}{y}';
    const fT = `${d.name}(${v})`;
    const [l1, l2] = d.dir === 'f2y' ? [fLHS, 'y'] : [yLHS, `${d.name}(${iv})`];
    const wrap = add(stage, h('div', 'u5l7-sw'), 0, 0); box(wrap, ex.W - 400, 420);
    const row = (y, lhs) => {
      const r = add(wrap, h('div', 'u5l7-row'), 26, y);
      const a = h('div', 'u5l7-lhs', K(lhs)), e = h('div', 'u5l7-eqs', K('=')), b = h('div', 'u5l7-rhs', K(rhsK));
      r.append(a, e, b); return { r, a, e, b };
    };
    const R1 = row(40, l1), R2 = row(196, l2);
    [R2.a, R2.e, R2.b].forEach((e) => (e.style.opacity = 0));
    wrap.querySelectorAll('.u5l7-nm').forEach((e) => (e.dataset.tag = 'name'));
    wrap.querySelectorAll('.u5l7-in').forEach((e) => (e.dataset.tag = 'input'));
    wrap.querySelectorAll('.u5l7-out').forEach((e) => (e.dataset.tag = 'output'));
    const tag1 = add(wrap, h('div', 'u5l7-ntag', d.dir === 'f2y' ? 'function notation' : 'x-y notation'), 26, 6);
    const tag2 = add(wrap, h('div', 'u5l7-ntag', d.dir === 'f2y' ? 'x-y notation' : 'function notation'), 26, 162); tag2.style.opacity = 0;
    const arrow = add(wrap, h('div', 'u5l7-repl', `replace ${T(d.dir === 'f2y' ? fT : 'y')} with ${T(d.dir === 'f2y' ? 'y' : fT)} ↓`), 26, 124); arrow.style.opacity = 0;
    const legend = add(wrap, h('div', 'u5l7-leg', `<div class="u5l7-cin">⟷ horizontal axis: input ${T(v)} → <b>domain</b></div><div class="u5l7-cout">↕ vertical axis: output ${T(fT)} (or ${T('y')}) → <b>range</b></div>`), 26, 300); legend.style.opacity = 0;
    const G = new LG(stage, Object.assign({ x: ex.W - 392, y: 22, width: 380, height: 380, xtitle: v, ytitle: fT, fontSize: 15 }, d.win));
    return [
      { cap: d.dir === 'f2y' ? `${T(fT + '=' + d.rhs)} is in <b>function notation</b>: ${T(d.name)} is the function’s <b>name</b> and ${T(v)}, in the brackets, is the <b>input</b>.`
        : `${T('y=' + d.rhs)} is in <b>${T('x')}-${T('y')} notation</b>: ${T('y')} is the <b>output</b> and ${T('x')} is the <b>input</b>.`,
        run: async (c) => { wrap.classList.add('u5l7-tags'); await pulse(c, R1.a, 1.12); } },
      { cap: d.dir === 'f2y' ? `To write it in ${T('x')}-${T('y')} notation, replace the name and its brackets, ${T(fT)}, with ${T('y')}.`
        : `To write it in function notation, replace ${T('y')} with a name and brackets holding the input: ${T(fT)}.`,
        run: async (c) => { wrap.classList.remove('u5l7-tags'); await c.anim(R1.a, [{ opacity: 1 }, { opacity: 0.35 }], 300); await fadeIn(c, arrow); await appear(c, tag2); await pop(c, R2.a); } },
      { cap: `Copy the right side <b>exactly</b>. The rule hasn’t changed, only how it is written.`,
        run: async (c) => { await Promise.all([R2.e, R2.b].map((e) => c.anim(e, [{ opacity: 0, transform: 'translateY(-156px)' }, { opacity: 1, transform: 'none' }], 700))); } },
      { cap: `The independent variable never changes: the input is still ${T(v)}${v !== 'x' ? ', not ' + T('x') : ''}.`,
        run: async (c) => { wrap.classList.add('u5l7-hot'); await Promise.all([R1.b, R2.b].map((e) => pulse(c, e, 1.06))); } },
      { cap: `Inputs (${T(v)}) run along the <b>horizontal axis</b> and make up the <b>domain</b>. Outputs (${T(fT)}, or ${T('y')}) run up the <b>vertical axis</b> and make up the <b>range</b>.`,
        run: async (c) => {
          const xa = G.segment([G.win.xmin, G.axisY()], [G.win.xmax, G.axisY()], { color: 'amber', width: 6, opacity: 0.55 });
          const ya = G.segment([G.axisX(), G.win.ymin], [G.axisX(), G.win.ymax], { color: 'purple', width: 6, opacity: 0.55 });
          await Promise.all([G.drawIn(xa, 600, c), G.drawIn(ya, 600, c)]);
          await G.drawIn(G.fn(d.fn, { color: 'teal' }), 900, c);
          await fadeIn(c, legend);
        } }
    ];
  }
};

/* ============================================================================================================
 * 2. machine — input → rule → output, a table of values, then the graph
 * ============================================================================================================ */
const MC = {
  ex2: { label: 'Example 2 check', name: 'f', rule: '×2, then −3', f: (x) => 2 * x - 3, xs: [-2, -1, 0, 1, 2, 3], sub: (x) => `2(${x})-3`, linear: true },
  sq: { label: T('g(x)=x^2-4'), name: 'g', rule: 'square, then −4', f: (x) => x * x - 4, xs: [-3, -2, -1, 0, 1, 2, 3], sub: (x) => `(${x})^2-4`, linear: false }
};
const subT = (d, x) => `${d.name}(${x})=${d.sub(x)}=${d.f(x)}`;
const machine = {
  title: 'Table of values → points → graph',
  height: 450,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(MC).map((k) => ({ v: k, label: MC[k].label })),
  intro: (k) => `Feed inputs into ${T(MC[k].name + '(x)=' + (k === 'sq' ? 'x^2-4' : '2x-3'))}, record the outputs, plot, join. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = MC[k];
    const G = new LG(stage, { x: ex.W - 416, y: 10, width: 404, height: 430, xmin: -4, xmax: 4, ymin: -8, ymax: 5, xtitle: 'x', ytitle: `${d.name}(x)` });
    // the machine
    const body = add(stage, box(h('div', 'u5l7-mach', `<div class="u5l7-mname">${T(d.name)}</div><div class="u5l7-mrule">${d.rule}</div>`), 190, 96), 150, 26);
    add(stage, h('div', 'u5l7-mio u5l7-cin', 'input'), 40, 8); add(stage, h('div', 'u5l7-mio u5l7-cout', 'output'), 380, 8);
    add(stage, h('div', 'u5l7-marr'), 96, 72); add(stage, h('div', 'u5l7-marr'), 346, 72);
    const subL = add(stage, h('div', 'u5l7-msub', ''), 24, 138);
    const tb = new ValueTable(stage, { x: 20, y: 196, headers: ['x', `${d.name}(x)`], rows: d.xs.map((x) => [x, d.f(x)]), hide: 1, tap: false, layout: 'h', cellW: 58, cellH: 50, headW: 74, diffs: true, diffSpace: 66 });
    const feed = async (c, x, ms) => {
      const a = add(stage, h('div', 'u5l7-mchip u5l7-cin', T(String(x))), 34, 58), b = add(stage, h('div', 'u5l7-mchip u5l7-cout', T(String(d.f(x)))), 372, 58);
      b.style.opacity = 0;
      await c.anim(a, [{ opacity: 0, transform: 'translateX(-20px)' }, { opacity: 1, transform: 'none' }, { opacity: 1, transform: 'translateX(150px) scale(.6)' }, { opacity: 0, transform: 'translateX(170px) scale(.4)' }], ms);
      await pulse(c, body, 1.05, ms * 0.4);
      await c.anim(b, [{ opacity: 0, transform: 'translateX(-60px) scale(.5)' }, { opacity: 1, transform: 'none' }], ms * 0.6);
      return [a, b];
    };
    let chips = [];
    const clearChips = () => { chips.forEach((e) => e.remove()); chips = []; };
    const others = d.xs.slice(1), last = d.xs[d.xs.length - 1];
    const ys = d.xs.map(d.f), ds = ys.slice(1).map((y, i) => y - ys[i]);
    return [
      { cap: `Put ${T('x=' + d.xs[0])} into the machine: ${T(subT(d, d.xs[0]))}.`,
        run: async (c) => { chips = await feed(c, d.xs[0], 900); subL.innerHTML = T(subT(d, d.xs[0])); await fadeIn(c, subL); await tb.reveal(0, 1, c); } },
      { cap: `Do the same for every other input, up to ${T(subT(d, last))}.`,
        run: async (c) => { for (let i = 0; i < others.length; i++) { clearChips(); chips = await feed(c, others[i], 420); subL.innerHTML = T(subT(d, others[i])); await tb.reveal(i + 1, 1, c); } } },
      { cap: `Each column is an ordered pair ${T(`(x,\\ ${d.name}(x))`)}. Plot them.`,
        run: async (c) => { clearChips(); for (let i = 0; i < d.xs.length; i++) { tb.highlight(i, true); await G.reveal(G.point(d.xs[i], ys[i], { color: 'blue', r: 7 }), c, 260); await sleep(c, 90); tb.highlight(i, false); } } },
      { cap: d.linear ? `Each time ${T('x')} goes up by 1, ${T(d.name + '(x)')} goes up by <b>2</b>: equal steps, so the points line up.` : `The steps in ${T(d.name + '(x)')} <b>change</b> (${ds.map((v) => (v > 0 ? '+' : '−') + Math.abs(v)).join(', ')}), so the points do <b>not</b> line up.`,
        run: (c) => tb.diffs(c, { col: 1 }) },
      { cap: d.linear ? `Join them with a straight line, arrows at both ends: every real number is an input. The vertical axis is the ${T('f(x)')}-axis, because ${T('f(x)')} plays the role of ${T('y')}.`
        : `Join them with a smooth curve, not a ruler. ${T('g(x)')} plays the role of ${T('y')} on the vertical axis.`,
        run: async (c) => { const L = d.linear ? G.line([0, -3], [1, -1], { color: 'teal' }) : G.fn(d.f, { color: 'teal' }); await G.drawIn(L, 900, c); G.label(d.linear ? 1.2 : 0, d.linear ? 3.5 : 3.6, T(d.linear ? 'f(x)=2x-3' : 'g(x)=x^2-4'), { pos: d.linear ? 'w' : 'c', color: 'teal', cls: 'bk-ptlab' }); } }
    ];
  }
};

/* ============================================================================================================
 * 3. fwdBack — forwards and backwards on the Celsius → Fahrenheit graph
 * ============================================================================================================ */
const fFn = (C) => 1.8 * C + 32;
const FB = { fwd: 'Forwards: ' + T('F(20)'), back: 'Backwards: ' + T('F(C)=50'), same: T('F(C)=C') + ' (the big one)' };
const fwdBack = {
  title: 'Reading a graph forwards and backwards',
  height: 460,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(FB).map((k) => ({ v: k, label: FB[k] })),
  intro: (k) => (k === 'fwd' ? `Use the graph of ${T('F(C)=1.8C+32')} to find ${T('F(20)')}. Press <b>Next</b>.` : k === 'back' ? `Use the graph of ${T('F(C)=1.8C+32')} to solve ${T('F(C)=50')}. Press <b>Next</b>.` : `Where do the two scales show the same number? Press <b>Next</b>.`),
  make(stage, k, ex) {
    const G = new LG(stage, { x: 10, y: 10, width: 570, height: 440, xmin: -50, xmax: 50, ymin: -60, ymax: 130, xstep: 10, ystep: 10, xlabels: 20, ylabels: 20, xtitle: 'C\\,(^{\\circ}\\mathrm{C})', ytitle: 'F(C)\\,(^{\\circ}\\mathrm{F})', fontSize: 16 });
    const P = panel(stage, 596, 10, ex.W - 606, 440, k === 'fwd' ? 'Forwards' : k === 'back' ? 'Backwards' : 'Output = input');
    const draw = { cap: `The graph of ${T('F(C)=1.8C+32')}: the input ${T('C')} (Celsius) runs across, the output ${T('F(C)')} (Fahrenheit) runs up.`,
      run: async (c) => { await G.drawIn(G.fn(fFn, { color: 'teal' }), 900, c); G.label(-5, 110, T('F(C)=1.8C+32'), { pos: 'w', color: 'teal', cls: 'bk-ptlab' }); } };
    if (k === 'fwd') return [draw,
      { cap: `${T('F(20)')} gives the <b>input</b>. Find ${T('20')} on the <b>horizontal</b> axis…`,
        run: async (c) => { await pop(c, G.point(20, 0, { color: 'blue', r: 7 })); await lineIn(c, P, `${T('F(20)=\\,?')} &nbsp;input given`, 'u5l7-cin'); } },
      { cap: `…go <b>up</b> to the graph…`, run: async (c) => { const s = dash(G, [20, 0], [20, 68], 'blue'); await G.drawIn(s, 700, c); await pop(c, G.point(20, 68, { color: 'blue', r: 7.5 })); await lineIn(c, P, '① up from the horizontal axis'); } },
      { cap: `…then <b>across</b> to the vertical axis and read the output: about ${T('68')}. Check: ${T('1.8(20)+32=36+32=68')}.`,
        run: async (c) => { const s = dash(G, [20, 68], [0, 68], 'blue'); await G.drawIn(s, 700, c); await pop(c, pill(G, 0, 68, T('68'), 'blue', 'w')); await lineIn(c, P, '② across to the vertical axis'); } },
      { cap: `${T('F(20)=68')}: a ${T('20^{\\circ}\\text{C}')} room is ${T('68^{\\circ}\\text{F}')}. A vertical line meets the graph only <b>once</b>, so there is exactly one output.`,
        run: async (c) => { await lineIn(c, P, `${T('F(20)=68')}`, 'u5l7-big'); await lineIn(c, P, `ordered pair ${T('(20,\\ 68)')}`); G.label(20, 68, T('(20,\\ 68)'), { pos: 'nw', cls: 'bk-ptlab', color: 'blue' }); } }
    ];
    if (k === 'back') return [draw,
      { cap: `${T('F(C)=50')} gives the <b>output</b>. Find ${T('50')} on the <b>vertical</b> axis…`,
        run: async (c) => { await pop(c, G.point(0, 50, { color: 'purple', r: 7 })); await lineIn(c, P, `${T('F(C)=50')} &nbsp;output given`, 'u5l7-cout'); } },
      { cap: `…go <b>across</b> at that height and stop at <b>every</b> point of the graph. This line meets it only once.`,
        run: async (c) => { const hl = G.hline(50, { color: 'purple', width: 2, dash: '3 7' }); await G.drawIn(hl, 800, c); await pop(c, G.point(10, 50, { color: 'purple', r: 7.5 })); await lineIn(c, P, '① across from the vertical axis'); } },
      { cap: `…then <b>down</b> to the horizontal axis: ${T('C=10')}.`,
        run: async (c) => { const s = dash(G, [10, 50], [10, 0], 'purple'); await G.drawIn(s, 600, c); await pop(c, pill(G, 10, 0, T('10'), 'purple', 's')); await lineIn(c, P, '② down to the horizontal axis'); } },
      { cap: `Check: ${T('F(10)=1.8(10)+32=50')} ✓. A ${T('50^{\\circ}\\text{F}')} day is ${T('10^{\\circ}\\text{C}')}.`,
        run: async (c) => { await lineIn(c, P, `${T('C=10')}`, 'u5l7-big'); await lineIn(c, P, `check: ${T('F(10)=50')} ✓`); } }
    ];
    return [draw,
      { cap: `The same number on both scales means the output equals the input: ${T('F(C)=C')}. Draw the line ${T('F=C')}, where every output equals its input.`,
        run: async (c) => { await G.drawIn(G.fn((x) => x, { color: 'amber', dash: true }), 900, c); G.label(42, 42, T('F=C'), { pos: 'nw', color: 'amber', cls: 'bk-ptlab' }); await lineIn(c, P, `solve ${T('F(C)=C')}`); } },
      { cap: `The two graphs meet at ${T('(-40,\\ -40)')}.`,
        run: async (c) => { await pop(c, G.point(-40, -40, { color: 'red', r: 8, label: T('(-40,\\ -40)'), pos: 'se' })); await lineIn(c, P, `they meet at ${T('(-40,\\ -40)')}`); } },
      { cap: `Check: ${T('F(-40)=1.8(-40)+32=-72+32=-40')} ✓. ${T('-40^{\\circ}\\text{C}')} is exactly ${T('-40^{\\circ}\\text{F}')}.`,
        run: async (c) => { await lineIn(c, P, `${T('F(-40)=-40')} ✓`, 'u5l7-big'); await lineIn(c, P, 'Prairie cold snaps reach about −40°: the one temperature you never need to convert.'); } }
    ];
  }
};

/* ============================================================================================================
 * 4. sweep — a vertical line meets a function once; a horizontal line can meet it 0, 1, 2, 3 … times
 * ============================================================================================================ */
const P_PTS = [[-6, -3], [-3, 3], [1, -1], [4, 5]];
const pHits = (b) => {
  const out = [];
  for (let i = 0; i < 3; i++) {
    const [a, q] = [P_PTS[i], P_PTS[i + 1]], lo = Math.min(a[1], q[1]), hi = Math.max(a[1], q[1]);
    if (b < lo - 1e-9 || b > hi + 1e-9) continue;
    const x = a[0] + (b - a[1]) * (q[0] - a[0]) / (q[1] - a[1]);
    if (!out.some((u) => Math.abs(u - x) < 1e-9)) out.push(Math.round(x * 1e6) / 1e6);
  }
  return out.sort((u, w) => u - w);
};
const pAt = (x) => { for (let i = 0; i < 3; i++) { const [a, q] = [P_PTS[i], P_PTS[i + 1]]; if (x >= a[0] - 1e-9 && x <= q[0] + 1e-9) return a[1] + (x - a[0]) * (q[1] - a[1]) / (q[0] - a[0]); } return null; };
const SWEEP_B = [[2, 'three'], [3, 'two'], [-2, 'one'], [6, 'no']];
const sweep = {
  title: 'How many answers? Count the crossings',
  height: 460,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  intro: `The graph of a function ${T('p')}. Compare a <b>vertical</b> line (an input) with a <b>horizontal</b> line (an output). Press <b>Next</b>.`,
  make(stage, v, ex) {
    const G = new LG(stage, { x: 10, y: 10, width: 520, height: 440, xmin: -8, xmax: 8, ymin: -5, ymax: 7, xlabels: 2, ylabels: 2, xtitle: 'x', ytitle: 'p(x)' });
    const P = panel(stage, 546, 10, ex.W - 556, 440, 'Count the solutions');
    const count = line(P, '', 'u5l7-count'); count.style.opacity = 0;
    let vl, hl, dots, cur = [];
    const clearCur = () => { G.remove(...cur); cur = []; };
    const steps = [
      { cap: `The graph of a function ${T('p')}, with domain ${T('-6\\le x\\le 4')}.`,
        run: async (c) => { await G.drawIn(G.polyline(P_PTS, { color: 'teal', width: 3.8, ends: ['closed', 'closed'] }), 1000, c); } },
      { cap: `<b>Forwards</b>, ${T('p(a)')}: a vertical line at any input meets the graph <b>at most once</b>, so ${T('p(a)')} has exactly one answer.`,
        run: async (c) => { const r = await G.vlineTest(c, { hits: (x) => { const y = pAt(x); return y == null ? [] : [y]; }, ms: 2200 }); vl = r; } },
      { cap: `<b>Backwards</b>, ${T('p(x)=b')}: slide a <b>horizontal</b> line up the graph and count the crossings. The count keeps changing!`,
        run: async (c) => {
          if (vl) { G.remove(vl.line, vl.dots); vl = null; }
          hl = G.hline(-4.5, { color: 'purple', width: 3.5, dash: false }); dots = svgEl('g', {}, G.layers.top);
          count.style.opacity = 1;
          const paint = (b) => { hl.set(b); dots.innerHTML = ''; const xs = pHits(b); xs.forEach((x) => { const [px, py] = G.toPx(x, b); svgEl('circle', { cx: px, cy: py, r: 8, fill: PUR, stroke: '#fff', 'stroke-width': 2 }, dots); }); count.innerHTML = `${T('b=' + (Math.round(b * 10) / 10))}: <b>${xs.length}</b> crossing${xs.length === 1 ? '' : 's'}`; };
          await tween(c, 4200, (t) => paint(-4.5 + 11 * t), (t) => t);
          paint(6.5);
        } }
    ];
    SWEEP_B.forEach(([b, word]) => {
      const xs = pHits(b);
      steps.push({
        cap: xs.length ? `${T('p(x)=' + b)}: <b>${word}</b> crossing${xs.length === 1 ? '' : 's'}, so ${word} solution${xs.length === 1 ? '' : 's'}: ${T('x=' + xs.join(',\\ '))}.${b === 3 ? ' (The peak counts once.)' : ''}`
          : `${T('p(x)=6')}: the graph never reaches 6. <b>No solution.</b>`,
        run: async (c) => {
          if (hl) { G.remove(hl, dots); hl = null; count.style.opacity = 0; }
          clearCur();
          if (!xs.length) { const l = G.hline(b, { color: 'red', width: 2.4, dash: '4 7' }); cur.push(l); await G.drawIn(l, 600, c); await lineIn(c, P, `${T('p(x)=6')} → no solution`, 'u5l7-cred'); return; }
          cur = await readBack(c, G, b, xs, { full: true, xLab: (x) => T(String(x)), xPos: b > 0 ? 's' : 'n' });
          await lineIn(c, P, `${T('p(x)=' + b)} → ${T('x=' + xs.join(',\\ '))}`);
        }
      });
    });
    return steps;
  }
};

/* ============================================================================================================
 * 5. exThree — Example 3 check on the graph of m
 * ============================================================================================================ */
const E3 = { a: '(a)(b) check', c: '(c) check', de: '(d)(e) check', f: '(f) check' };
const exThree = {
  title: 'Example 3 check',
  height: 460,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(E3).map((k) => ({ v: k, label: E3[k] })),
  intro: (k) => ({ a: 'Forwards: read the outputs for the inputs −3, 1 and 4.', c: 'Backwards: find every input with output 6, 0 and 8.', de: 'Points and intercepts in function notation.', f: 'Domain and range as shadows on the axes.' }[k] + ' Press <b>Next</b>.'),
  make(stage, k, ex) {
    const G = new LG(stage, Object.assign({ x: 10, y: 10, width: 500, height: 440 }, GRID.ex3));
    drawM(G, { color: 'teal' });
    const P = panel(stage, 526, 10, ex.W - 536, 440, { a: 'Forwards', c: 'Backwards', de: 'Function notation', f: 'Domain and range' }[k]);
    let cur = [];
    const clr = () => { cur.forEach((e) => G.remove(e)); cur = []; };
    if (k === 'a') {
      const steps = [-3, 1, 4].map((a, i) => {
        const y = mFn(a);
        return { cap: y === 0 ? `${['i', 'ii', 'iii'][i]}) ${T(`m(${a})`)}: at ${T('x=' + a)} the graph is right on the ${T('x')}-axis, so ${T(`m(${a})=0`)}.`
          : `${['i', 'ii', 'iii'][i]}) ${T(`m(${a})`)}: from ${T('x=' + a)} go <b>${y > 0 ? 'up' : 'down'}</b> to the graph, then across: ${T(`m(${a})=${y}`)}.`,
        run: async (c) => { await readFwd(c, G, a, y, { color: 'blue', yLab: y ? T(String(y)) : null }); await lineIn(c, P, `${T(`m(${a})=${y}`)} &nbsp;→&nbsp; ${T(pairTex(a, y))}`); } };
      });
      steps.push({ cap: `(b) Each statement ${T('m(a)=b')} is the ordered pair ${T('(a,\\ b)')}: ${T('(-3,\\ 4)')}, ${T('(1,\\ 0)')} and ${T('(4,\\ 2)')}.`,
        run: async (c) => { for (const a of [-3, 1, 4]) { const l = G.label(a, mFn(a), T(pairTex(a, mFn(a))), { pos: a === 1 ? 'se' : 'ne', cls: 'bk-ptlab', color: 'blue' }); await fadeIn(c, l); } } });
      return steps;
    }
    if (k === 'c') {
      const D = [[6, [-2, 6], 'the two peaks'], [0, [-5, 1, 3], 'three solutions'], [8, [], '']];
      return D.map(([b, xs, why], i) => ({
        cap: xs.length ? `${['i', 'ii', 'iii'][i]}) ${T(`m(x)=${b}`)}: go across at ${T(String(b))} and count every crossing: ${T('x=' + xs.join(',\\ '))} (${why}).`
          : `${['i', 'ii', 'iii'][i]}) ${T('m(x)=8')}: the graph never rises above ${T('6')}, so there is <b>no solution</b>.`,
        run: async (c) => {
          clr();
          if (!xs.length) { const l = G.hline(8, { color: 'red', width: 2.4, dash: '4 7' }); cur.push(l); await G.drawIn(l, 600, c); await lineIn(c, P, `${T('m(x)=8')} → no solution`, 'u5l7-cred'); return; }
          cur = await readBack(c, G, b, xs, { full: true, xLab: (x) => T(String(x)), xPos: b > 0 ? 's' : 'n' });
          await lineIn(c, P, `${T(`m(x)=${b}`)} → ${T('x=' + xs.join(',\\ '))}`);
        }
      }));
    }
    if (k === 'de') return [
      { cap: `(d) ${T('M=(-6,\\ -2)')}: input ${T('-6')}, output ${T('-2')}. So ${T('m(-6)=-2')}.`,
        run: async (c) => { await pop(c, G.point(-6, -2, { color: 'blue', r: 8 })); await lineIn(c, P, `${T('M(-6,\\ -2)')}: ${T('m(-6)=-2')}`); } },
      { cap: `${T('N=(6,\\ 6)')}, so ${T('m(6)=6')}.`,
        run: async (c) => { await pop(c, G.point(6, 6, { color: 'blue', r: 8 })); await lineIn(c, P, `${T('N(6,\\ 6)')}: ${T('m(6)=6')}`); } },
      { cap: `(e) The ${T('x')}-intercepts are where the <b>output is 0</b>: ${T('m(-5)=0')}, ${T('m(1)=0')}, ${T('m(3)=0')}.`,
        run: async (c) => { for (const x of [-5, 1, 3]) await pop(c, G.point(x, 0, { color: 'purple', r: 8, label: T(String(x)), pos: x === 1 ? 'se' : 'sw' })); await lineIn(c, P, `${T('m(-5)=0,\\ m(1)=0,\\ m(3)=0')}`, 'u5l7-cout'); } },
      { cap: `The ${T('y')}-intercept is the <b>output at ${T('x=0')}</b>: ${T('m(0)=2')}.`,
        run: async (c) => { await pop(c, G.point(0, 2, { color: 'amber', r: 8, label: T('2'), pos: 'w' })); await lineIn(c, P, `${T('m(0)=2')}`, 'u5l7-cin'); } }
    ];
    return [
      { cap: `<b>Domain:</b> squash the graph onto the ${T('x')}-axis. It runs from ${T('-6')} (at ${T('M')}) to ${T('6')} (at ${T('N')}), endpoints included.`,
        run: async (c) => { await G.drawIn(G.shadeX(-6, 6, { band: true }), 800, c); } },
      { cap: `${T('\\{x\\mid -6\\le x\\le 6,\\ x\\in\\mathbb{R}\\}')}`, run: async (c) => { await lineIn(c, P, `<b>Domain</b><br>${T('\\{x\\mid -6\\le x\\le 6,\\ x\\in\\mathbb{R}\\}')}`, 'u5l7-cin'); } },
      { cap: `<b>Range:</b> squash it onto the vertical axis. The lowest point is ${T('-2')} and the highest is ${T('6')}.`,
        run: async (c) => { await G.drawIn(G.shadeY(-2, 6, { band: true }), 800, c); } },
      { cap: `${T('\\{m(x)\\mid -2\\le m(x)\\le 6,\\ m(x)\\in\\mathbb{R}\\}')}`, run: async (c) => { await lineIn(c, P, `<b>Range</b><br>${T('\\{m(x)\\mid -2\\le m(x)\\le 6,\\ m(x)\\in\\mathbb{R}\\}')}`, 'u5l7-cout'); } }
    ];
  }
};

/* ============================================================================================================
 * Candle scene (sections 4 and 5): a candle beside the graph of h(t) = −2t + 12, drawn to the graph's height scale
 * ============================================================================================================ */
const hFn = (t) => -2 * t + 12;
function candleScene(stage, ex, win) {
  const G = new LG(stage, Object.assign({ x: 236, y: 8, width: ex.W - 246, height: 444, xtitle: 't\\text{ (h)}', ytitle: 'h(t)\\text{ (cm)}' }, win));
  const base = 8 + G.toPx(0, 0)[1], uy = G.uy, cx = 120;
  add(stage, box(h('div', 'u5l7-plate'), 120, 10), cx - 60, base);
  const wax = add(stage, h('div', 'u5l7-wax'), cx - 26, 0), wick = add(stage, h('div', 'u5l7-wick'), cx - 1.5, 0), flame = add(stage, h('div', 'u5l7-flame'), cx - 11, 0);
  const clock = add(stage, h('div', 'u5l7-read'), 14, 2);
  // a ruler on the left, in cm, to the graph's scale
  const ruler = add(stage, h('div', 'u5l7-ruler'), 34, base - 12 * uy); box(ruler, 22, 12 * uy);
  for (let k = 0; k <= 12; k += 2) add(ruler, h('div', 'u5l7-rt', String(k)), 0, 12 * uy - k * uy);
  const st = { t: 0 };
  const set = (t) => {
    st.t = t; const hh = Math.max(0, hFn(t));
    box(wax, 52, hh * uy); wax.style.top = base - hh * uy + 'px';
    wick.style.top = base - hh * uy - 10 + 'px'; box(wick, 3, 10);
    flame.style.top = base - hh * uy - 40 + 'px'; flame.style.opacity = hh > 0 ? 1 : 0; wick.style.opacity = hh > 0 ? 1 : 0;
    clock.innerHTML = `${T('t=' + (Math.round(t * 10) / 10))} h &nbsp; ${T('h=' + (Math.round(hh * 10) / 10))} cm`;
  };
  set(0);
  const burn = (c, to, ms = 1400) => { const a = st.t; return tween(c, ms, (u) => set(a + (to - a) * u)); };
  return { G, set, burn, st };
}
const CA = { ev: 'Evaluate ' + T('h(4)'), so: 'Solve ' + T('h(t)=8') };
const candle = {
  title: 'Function notation tells a story',
  height: 460,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(CA).map((k) => ({ v: k, label: CA[k] })),
  intro: (k) => (k === 'ev' ? `${T('h(4)')}: how tall is the candle after 4 hours? Press <b>Next</b>.` : `${T('h(t)=8')}: when is the candle 8 cm tall? Press <b>Next</b>.`),
  make(stage, k, ex) {
    const S = candleScene(stage, ex, { xmin: 0, xmax: 8, ymin: 0, ymax: 14, ylabels: 2 }), G = S.G;
    const cx0 = 236 + 0.47 * (ex.W - 246), card = say(stage, cx0, 22, ex.W - cx0 - 14, '');
    const draw = { cap: `${T('h(t)=-2t+12')}: the candle starts ${T('12')} cm tall and burns down ${T('2')} cm every hour.`,
      run: async (c) => { await G.drawIn(G.fn(hFn, { from: 0, to: 6, color: 'teal' }), 900, c); G.label(0.6, 11, T('h(t)=-2t+12'), { pos: 'e', color: 'teal', cls: 'bk-ptlab' }); } };
    let tr;
    if (k === 'ev') return [draw,
      { cap: `${T('h(4)')} asks: how tall is the candle after ${T('4')} hours? Let the clock run to ${T('t=4')}…`,
        run: async (c) => { tr = G.point(0, 12, { color: 'blue', r: 7 }); await pop(c, tr); await Promise.all([S.burn(c, 4, 1600), G.move(c, tr, 4, 4, 1600)]); } },
      { cap: `Substitute ${T('4')} for ${T('t')}: ${T('h(4)=-2(4)+12=-8+12=4')}. On the graph: up from ${T('t=4')}, across to ${T('4')}.`,
        run: async (c) => { await readFwd(c, G, 4, 4, { color: 'blue', yLab: T('4') }); } },
      { cap: `In words: <b>after 4 hours</b> (the input), the candle is <b>4 cm tall</b> (the output).`,
        run: async (c) => { card.innerHTML = `${T('h(4)=4')}<br><span class="u5l7-cin">input: time, <b>4 h</b></span><br><span class="u5l7-cout">output: height, <b>4 cm</b></span><br>“After 4 hours, the candle is 4 cm tall.”`; await sayIn(c, card); } }
    ];
    return [draw,
      { cap: `${T('h(t)=8')} gives the <b>output</b>: the candle is ${T('8')} cm tall. <b>When?</b> Go across at ${T('8')}…`,
        run: async (c) => { const s = dash(G, [0, 8], [2, 8], 'purple'); await pop(c, G.point(0, 8, { color: 'purple', r: 6 })); await G.drawIn(s, 600, c); await pop(c, G.point(2, 8, { color: 'purple', r: 7.5 })); } },
      { cap: `…then down: ${T('t=2')}. With algebra: ${T('-2t+12=8')}, so ${T('-2t=-4')} and ${T('t=2')}.`,
        run: async (c) => { const s = dash(G, [2, 8], [2, 0], 'purple'); await G.drawIn(s, 500, c); await pop(c, pill(G, 2, 0, T('2'), 'purple', 'n')); await S.burn(c, 2, 1200); } },
      { cap: `In words: the candle is <b>8 cm tall</b> (output) <b>2 hours</b> after it is lit (input). So ${T('h(2)=8')}.`,
        run: async (c) => { card.innerHTML = `${T('-2t+12=8')}<br>${T('-2t=-4')}<br>${T('t=2')}, so ${T('h(2)=8')}<br>“2 hours after it is lit, the candle is 8 cm tall.”`; await sayIn(c, card); } }
    ];
  }
};
const limits = {
  title: 'Where does the model stop?',
  height: 460,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  intro: `The rule ${T('h(t)=-2t+12')} accepts any number. The candle doesn’t. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const S = candleScene(stage, ex, { xmin: -2, xmax: 8, ymin: -4, ymax: 16, ylabels: 2 }), G = S.G;
    const cx0 = 236 + 0.5 * (ex.W - 246), card = say(stage, cx0, 18, ex.W - cx0 - 14, '');
    let full;
    return [
      { cap: `As a rule, ${T('h(t)=-2t+12')} works for <b>every</b> real number ${T('t')}: its graph is a whole line.`,
        run: async (c) => { full = G.line([0, 12], [6, 0], { color: 'teal' }); await G.drawIn(full, 900, c); } },
      { cap: `Burn the candle: at ${T('t=6')}, ${T('h(6)=-12+12=0')}. The candle is gone.`,
        run: async (c) => { await S.burn(c, 6, 1800); await pop(c, G.point(6, 0, { color: 'blue', r: 7, label: T('(6,\\ 0)'), pos: 'ne' })); } },
      { cap: `${T('h(7)=-2(7)+12=-2')}. A height of ${T('-2')} cm is impossible: after ${T('t=6')} the rule no longer describes the candle.`,
        run: async (c) => { const s = G.segment([6, 0], [8, -4], { color: 'red', width: 6, opacity: 0.45 }); await G.drawIn(s, 500, c); await pop(c, G.point(7, -2, { color: 'red', r: 7, label: T('(7,\\ -2)'), pos: 'sw' })); const [px, py] = G.toPx(7, -2); await stampIn(c, stamp(stage, '✗ impossible', { ok: false, x: 236 + px - 120, y: 8 + py + 6, size: 'sm' })); } },
      { cap: `${T('h(-1)=14')}? A time <b>before</b> the candle is lit isn’t part of the story either.`,
        run: async (c) => { const s = G.segment([-2, 16], [0, 12], { color: 'red', width: 6, opacity: 0.45 }); await G.drawIn(s, 500, c); await pop(c, G.point(-1, 14, { color: 'red', r: 7, label: T('(-1,\\ 14)'), pos: 'ne' })); } },
      { cap: `Keep only the part that makes sense: from ${T('(0,\\ 12)')} (just lit) to ${T('(6,\\ 0)')} (melted), with both endpoints included.`,
        run: async (c) => { await c.anim(full, [{ opacity: 1 }, { opacity: 0.25 }], 400); await G.drawIn(G.segment([0, 12], [6, 0], { color: 'teal', width: 5, ends: ['closed', 'closed'] }), 900, c); } },
      { cap: `<b>Domain</b>: the segment’s shadow on the ${T('t')}-axis. <b>Range</b>: its shadow on the ${T('h')}-axis.`,
        run: async (c) => {
          await G.drawIn(G.shadeX(0, 6, {}), 600, c); await G.drawIn(G.shadeY(0, 12, {}), 600, c);
          card.innerHTML = `<span class="u5l7-cin"><b>Domain</b> ${T('\\{t\\mid 0\\le t\\le 6,\\ t\\in\\mathbb{R}\\}')}</span><br><span class="u5l7-cout"><b>Range</b> ${T('\\{h(t)\\mid 0\\le h(t)\\le 12,\\ h(t)\\in\\mathbb{R}\\}')}</span>`;
          await sayIn(c, card);
        } }
    ];
  }
};

/* ============================================================================================================
 * 6. pool — Example 4 check: a pool draining beside the graph of V(t) = −450t + 9000
 * ============================================================================================================ */
const PO = { abc: '(a)–(c) check', d: '(d) check', e: '(e) check', f: '(f) check' };
const pool = {
  title: 'Example 4 check: draining a pool',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(PO).map((k) => ({ v: k, label: PO[k] })),
  intro: (k) => ({ abc: 'Sketch the graph, then find and explain ' + T('V(6)') + '.', d: 'Evaluate ' + T('V(0)') + ', ' + T('V(15)') + ' and ' + T('V(22)') + '.', e: 'When is ' + T('V(t)=1\\,350') + '?', f: 'A sensible domain and range.' }[k] + ' Press <b>Next</b>.'),
  make(stage, k, ex) {
    const G = new LG(stage, Object.assign({ x: 210, y: 8, width: ex.W - 220, height: 454 }, GRID.ex4));
    // the pool, drawn to the graph's volume scale
    const px0 = 40, tw = 130;
    const tank = add(stage, h('div', 'u5l7-tank'), px0, 0), water = add(tank, h('div', 'u5l7-water'));
    const read = add(stage, h('div', 'u5l7-read'), 14, 430);
    const st = { t: 0 };
    const draw = () => {
      const top = 8 + G.toPx(0, 10000)[1], bot = 8 + G.toPx(0, 0)[1], V = Math.max(0, vFn(st.t));
      tank.style.top = top + 'px'; box(tank, tw, bot - top);
      water.style.height = (bot - top) * V / 10000 + 'px';
      read.innerHTML = `${T('t=' + (Math.round(st.t * 10) / 10))} &nbsp;${T('V=' + nT(Math.round(V)))} L`;
    };
    G.track(tank, draw);
    const drain = (c, to, ms = 1400) => { const a = st.t; return tween(c, ms, (u) => { st.t = a + (to - a) * u; draw(); }); };
    const note = say(stage, 210 + G.toPx(10.5, 0)[0], 8 + G.toPx(0, 9800)[1], ex.W - 230 - G.toPx(10.5, 0)[0], '');
    const lineSeg = () => G.segment([0, 9000], [20, 0], { color: 'teal', ends: ['closed', 'closed'] });
    if (k !== 'abc') lineSeg();
    if (k === 'abc') return [
      { cap: `(a) Start: ${T('V(0)=9\\,000')}. The pool is full before draining begins.`,
        run: async (c) => { await pop(c, G.point(0, 9000, { color: 'teal', r: 7, label: T('(0,\\ 9\\,000)'), pos: 'ne' })); } },
      { cap: `It loses ${T('450')} L every minute, so it is empty when ${T('t=9\\,000\\div450=20')}. Join ${T('(0,\\ 9\\,000)')} to ${T('(20,\\ 0)')}.`,
        run: async (c) => { await G.drawIn(lineSeg(), 900, c); G.label(20, 0, T('(20,\\ 0)'), { pos: 'n', cls: 'bk-ptlab', color: 'teal', gap: 30 }); } },
      { cap: `(b) ${T('V(6)=-450(6)+9\\,000=-2\\,700+9\\,000=6\\,300')}.`,
        run: async (c) => { await drain(c, 6, 1500); await readFwd(c, G, 6, 6300, { color: 'blue', yLab: T('6\\,300'), yPos: 'ne' }); } },
      { cap: `(c) In words: <b>6 minutes</b> after draining begins, <b>${nH(6300)} litres</b> of water remain in the pool.`,
        run: async (c) => { note.innerHTML = `${T('V(6)=6\\,300')}<br><span class="u5l7-cin">input: <b>6 min</b> after draining begins</span><br><span class="u5l7-cout">output: <b>${nH(6300)} L</b> remain</span>`; await sayIn(c, note); } }
    ];
    if (k === 'd') return [
      { cap: `i) ${T('V(0)=-450(0)+9\\,000=9\\,000')}: the <b>initial volume</b>, before draining starts.`,
        run: async (c) => { await pop(c, G.point(0, 9000, { color: 'blue', r: 8 })); await pop(c, pill(G, 0, 9000, T('9\\,000'), 'blue', 'ne')); } },
      { cap: `ii) ${T('V(15)=-6\\,750+9\\,000=2\\,250')}: after 15 minutes, ${T('2\\,250')} L remain.`,
        run: async (c) => { await drain(c, 15, 1600); await readFwd(c, G, 15, 2250, { color: 'blue', yLab: T('2\\,250'), yPos: 'ne' }); } },
      { cap: `iii) ${T('V(22)=-9\\,900+9\\,000=-900')}. Follow the rule past ${T('t=20')}, below the axis…`,
        run: async (c) => { await drain(c, 20, 700); await G.setWindow({ ymin: -2000 }, c, 800); const s = G.segment([20, 0], [22, -900], { color: 'red', width: 4, dash: true }); await G.drawIn(s, 500, c); await pop(c, G.point(22, -900, { color: 'red', r: 7 })); } },
      { cap: `A <b>negative volume is impossible</b>. The pool is empty at ${T('t=20')} (${T('V(20)=0')}) and stays empty, so the rule no longer describes the pool.`,
        run: async (c) => { const [px, py] = G.toPx(22, -900); await stampIn(c, stamp(stage, '✗ impossible', { ok: false, x: 210 + px - 110, y: 8 + py + 22, size: 'sm' })); } }
    ];
    if (k === 'e') return [
      { cap: `${T('V(t)=1\\,350')} gives the <b>output</b>. Go across at ${T('1\\,350')} to the graph…`,
        run: async (c) => { await pop(c, G.point(0, 1350, { color: 'purple', r: 6 })); const s = dash(G, [0, 1350], [17, 1350], 'purple'); await G.drawIn(s, 700, c); await pop(c, G.point(17, 1350, { color: 'purple', r: 7.5 })); } },
      { cap: `…then down to the time: ${T('t=17')} minutes.`,
        run: async (c) => { const s = dash(G, [17, 1350], [17, 0], 'purple'); await G.drawIn(s, 400, c); await pop(c, pill(G, 17, 0, T('17'), 'purple', 'n')); await drain(c, 17, 1500); } },
      { cap: `With algebra: ${T('-450t+9\\,000=1\\,350')}, so ${T('-450t=-7\\,650')} and ${T('t=17')}.`,
        run: async (c) => { note.innerHTML = `${T('-450t+9\\,000=1\\,350')}<br>${T('-450t=-7\\,650')}<br>${T('t=17')} minutes`; await sayIn(c, note); } }
    ];
    return [
      { cap: `The model runs from ${T('t=0')} (full) to ${T('t=20')} (empty). Its shadow on the ${T('t')}-axis is the <b>domain</b>.`,
        run: async (c) => { await G.drawIn(G.shadeX(0, 20, { band: true }), 800, c); note.innerHTML = `<span class="u5l7-cin"><b>Domain</b> ${T('\\{t\\mid 0\\le t\\le 20,\\ t\\in\\mathbb{R}\\}')}</span>`; await sayIn(c, note); } },
      { cap: `The volume goes from ${T('9\\,000')} L down to ${T('0')} L: the <b>range</b>.`,
        run: async (c) => { await G.drawIn(G.shadeY(0, 9000, { band: true }), 800, c); await fadeIn(c, line(note, `<span class="u5l7-cout"><b>Range</b> ${T('\\{V(t)\\mid 0\\le V(t)\\le 9\\,000,\\ V(t)\\in\\mathbb{R}\\}')}</span>`)); } }
    ];
  }
};

/* ============================================================================================================
 * 7. cost — Example 5 check, with a zoomed-in view for small n and a fixed + variable cost bar
 * ============================================================================================================ */
const CO = { a: '(a) check', b: '(b)(c) check', d: '(d) check', e: '(e) check' };
const cost = {
  title: 'Example 5 check: cost of production',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(CO).map((k) => ({ v: k, label: CO[k] })),
  intro: (k) => ({ a: 'Sketch the graph for up to 5 000 pairs.', b: 'Find and explain ' + T('C(120)') + '.', d: 'What does ' + T('C(0)') + ' mean?', e: 'How many pairs for ' + T('\\$29\\,200') + '?' }[k] + ' Press <b>Next</b>.'),
  make(stage, k, ex) {
    const G = new LG(stage, Object.assign({ x: 8, y: 8, width: 470, height: 454 }, GRID.ex5));
    const ZW = ex.W - 500;
    const Z = new LG(stage, { x: 490, y: 8, width: ZW, height: 300, xmin: 0, xmax: 500, ymin: 0, ymax: 40000, xstep: 50, ystep: 5000, xlabels: 100, ylabels: 10000, xtitle: 'n', ytitle: 'C(n)', yfmt: kLab, fontSize: 15, pad: [18, 22, 34, 46] });
    Z.el.style.opacity = 0; const ztag = add(stage, h('div', 'u5l7-ztag', 'zoomed in: 0 to 500 pairs'), 490 + ZW - 250, 2); ztag.style.opacity = 0;
    // the cost bar: fixed (gray) + per pair (amber), 0 to 40 000 across the bar
    const barX = 540, barW = ex.W - barX - 20, bv = (v) => barW * v / 40000;
    const bar = add(stage, h('div', 'u5l7-bar'), barX, 360); box(bar, barW, 40); bar.style.opacity = 0;
    const fixed = add(bar, h('div', 'u5l7-bfix')), vari = add(bar, h('div', 'u5l7-bvar'));
    const blab = add(stage, h('div', 'u5l7-blab'), barX, 410); box(blab, barW, 50);
    const setBar = (n) => { box(fixed, bv(18400), 40); vari.style.left = bv(18400) + 'px'; box(vari, bv(27 * n), 40); };
    const showBar = async (c, n, text) => { setBar(0); await appear(c, bar); await c.anim(vari, [{ width: '0px' }, { width: bv(27 * n) + 'px' }], 800); blab.innerHTML = text; await fadeIn(c, blab); };
    const mainLine = () => G.segment([0, 18400], [5000, 153400], { color: 'teal', ends: ['closed', 'closed'] });
    const zoomIn = async (c) => {
      const r = G.polyline([[0, 0], [500, 0], [500, 40000], [0, 40000]], { closed: true, color: 'amber', width: 2.4, dash: '5 4' });
      await G.drawIn(r, 500, c); await appear(c, Z.el, 400); await appear(c, ztag, 300);
      await Z.drawIn(Z.segment([0, 18400], [500, cFn(500)], { color: 'teal' }), 700, c);
    };
    if (k !== 'a') mainLine();
    if (k === 'a') return [
      { cap: `Start: ${T('C(0)=18\\,400')}, the cost before any earbuds are made.`,
        run: async (c) => { await pop(c, G.point(0, 18400, { color: 'teal', r: 7, label: T('(0,\\ 18\\,400)'), pos: 'se' })); } },
      { cap: `The largest input: ${T('C(5\\,000)=18\\,400+27(5\\,000)=18\\,400+135\\,000=153\\,400')}.`,
        run: async (c) => { await pop(c, G.point(5000, 153400, { color: 'teal', r: 7, label: T('(5\\,000,\\ 153\\,400)'), pos: 'nw' })); } },
      { cap: `Join them: the cost rises ${T('\\$27')} for every pair. Strictly, ${T('n')} counts whole pairs, so the graph is 5&#8239;001 dots, packed so close that we draw them as a line from ${T('(0,\\ 18\\,400)')} to ${T('(5\\,000,\\ 153\\,400)')}.`,
        run: async (c) => { await G.drawIn(mainLine(), 1000, c); } }
    ];
    if (k === 'b') return [
      { cap: `${T('n=120')} is tiny on this scale, so <b>zoom in</b> on the first 500 pairs.`, run: (c) => zoomIn(c) },
      { cap: `Up from ${T('120')}, then across: ${T('C(120)=18\\,400+27(120)=18\\,400+3\\,240=21\\,640')}.`,
        run: async (c) => { await readFwd(c, Z, 120, cFn(120), { color: 'blue', yLab: T('21\\,640'), labAt: 'pt', yPos: 'nw' }); } },
      { cap: `The cost is a <b>fixed</b> part plus <b>${T('\\$27')} per pair</b>: ${T('18\\,400+3\\,240')}.`,
        run: (c) => showBar(c, 120, `<span class="u5l7-cfix">fixed ${T('18\\,400')}</span> + <span class="u5l7-cin">${T('27\\times120=3\\,240')}</span> = <b>${T('21\\,640')}</b>`) },
      { cap: `(c) In words: it costs <b>$${nH(21640)}</b> to produce <b>120 pairs</b> of earbuds.`,
        run: async (c) => { await pulse(c, blab, 1.06); } }
    ];
    if (k === 'd') return [
      { cap: `${T('C(0)=18\\,400+27(0)=18\\,400')}: the output when the input is 0, where the graph meets the vertical axis.`,
        run: async (c) => { await pop(c, G.point(0, 18400, { color: 'amber', r: 8 })); await pop(c, pill(G, 0, 18400, T('18\\,400'), 'amber', 'se')); } },
      { cap: `It is the <b>fixed cost</b> (equipment, facility) paid before producing a single pair.`,
        run: (c) => showBar(c, 0, `<span class="u5l7-cfix">fixed cost ${T('\\$18\\,400')}</span>, even when ${T('n=0')}`) }
    ];
    return [
      { cap: `${T('\\$29\\,200')} is an <b>output</b>. Zoom in on the first 500 pairs.`, run: (c) => zoomIn(c) },
      { cap: `Across at ${T('29\\,200')} to the line, then down: ${T('n=400')}.`,
        run: async (c) => { await readBack(c, Z, 29200, [400], { xLab: () => T('400'), xPos: 'n' }); } },
      { cap: `With algebra: ${T('18\\,400+27n=29\\,200')}, so ${T('27n=10\\,800')} and ${T('n=400')} pairs.`,
        run: (c) => showBar(c, 400, `<span class="u5l7-cfix">fixed ${T('18\\,400')}</span> + <span class="u5l7-cin">${T('27\\times400=10\\,800')}</span> = <b>${T('29\\,200')}</b>`) }
    ];
  }
};

/* ============================================================================================================
 * 8. rocket — Example 6 check: the rocket's height beside the graph of h(t) = −20t² + 1600t
 * ============================================================================================================ */
const ROCKET_SVG = '<svg viewBox="0 0 40 70" width="34" height="60"><path d="M20 2C30 12 32 28 30 46H10C8 28 10 12 20 2Z" fill="#e9eef7" stroke="#1e2d46" stroke-width="2.2"/><circle cx="20" cy="24" r="5" fill="#7fb6ef" stroke="#1e2d46" stroke-width="2"/><path d="M10 36L2 52L10 48ZM30 36L38 52L30 48Z" fill="#c93a33" stroke="#1e2d46" stroke-width="2" stroke-linejoin="round"/><path d="M14 46L20 66L26 46Z" fill="#f0a020"/></svg>';
const RO = { a: '(a) check', bc: '(b)(c) check', d: '(d) check', efg: '(e)–(g) check' };
const rocket = {
  title: 'Example 6 check: a model rocket',
  height: 470,
  choices: Object.keys(RO).map((k) => ({ v: k, label: RO[k] })),
  intro: (k) => ({ a: 'Sketch the graph from a few points.', bc: 'Compare ' + T('h(20)') + ' and ' + T('h(60)') + '.', d: 'Evaluate ' + T('h(0)') + ', ' + T('h(80)') + ' and ' + T('h(90)') + '.', efg: 'Highest point, landing time, domain and range.' }[k] + ' Press <b>Next</b>.'),
  make(stage, k, ex) {
    const GX = 150, G = new LG(stage, Object.assign({ x: GX, y: 8, width: ex.W - GX - 10, height: 454 }, GRID.ex6));
    const pad = add(stage, box(h('div', 'u5l7-pad'), 90, 8), 30, 0);
    const rk = add(stage, h('div', 'u5l7-rocket', ROCKET_SVG), 58, 0);
    const read = add(stage, h('div', 'u5l7-read'), GX + G.toPx(63, 0)[0], 14);
    const link = svgEl('line', { stroke: '#9aa0ab', 'stroke-width': 2, 'stroke-dasharray': '4 5' }, svgEl('svg', { class: 'u5l7-link', width: ex.W, height: 470 }, stage));
    link.ownerSVGElement.style.left = '0px'; link.ownerSVGElement.style.top = '0px'; link.ownerSVGElement.style.pointerEvents = 'none';
    const st = { t: 0, on: false };
    const draw = () => {
      const t = st.t, H = Math.max(0, rFn(t)), gy = 8 + G.toPx(0, 0)[1], y = 8 + G.toPx(0, H)[1], down = t > 40 && t < 80;
      pad.style.top = gy + 'px';
      rk.style.top = y - 60 + 'px'; rk.style.transform = down ? 'rotate(180deg)' : 'none';
      read.innerHTML = `${T('t=' + Math.round(t))} s<br>${T('h=' + nT(Math.round(H)))} cm`;
      const [px] = G.toPx(Math.min(t, 80), 0);
      link.setAttribute('x1', 96); link.setAttribute('y1', y); link.setAttribute('x2', GX + px); link.setAttribute('y2', y);
      link.style.opacity = st.on && H > 0 ? 1 : 0;
    };
    G.track(rk, draw);
    const fly = (c, to, ms = 1500) => { const a = st.t; st.on = true; return tween(c, ms, (u) => { st.t = a + (to - a) * u; draw(); }); };
    const curve = () => G.fn(rFn, { from: 0, to: 80, color: 'teal', ends: ['closed', 'closed'] });
    if (k !== 'a') curve();
    if (k === 'a') {
      const ts = [0, 20, 40, 60, 80];
      return [
        { cap: `Make a table: ${T('h(0)=0')}, ${T('h(20)=24\\,000')}, ${T('h(40)=32\\,000')}, ${T('h(60)=24\\,000')}, ${T('h(80)=0')}. Plot the points.`,
          run: async (c) => { for (const t of ts) await G.reveal(G.point(t, rFn(t), { color: 'blue', r: 7, label: t === 40 ? T('(40,\\ 32\\,000)') : null, pos: 'n' }), c, 280); } },
        { cap: `Join them with a smooth curve, not a ruler: a parabola that opens <b>down</b>, from ${T('(0,\\ 0)')} to ${T('(80,\\ 0)')}.`,
          run: async (c) => { await G.drawIn(curve(), 1100, c); } },
        { cap: `Follow the rocket: up to a peak at ${T('40')} s, then back down to the ground at ${T('80')} s.`,
          run: async (c) => { await fly(c, 80, 3000); } }
      ];
    }
    if (k === 'bc') return [
      { cap: `(b) ${T('h(20)=-20(20)^2+1\\,600(20)=-8\\,000+32\\,000=24\\,000')}.`,
        run: async (c) => { await fly(c, 20, 1300); await readFwd(c, G, 20, 24000, { color: 'blue', yLab: T('24\\,000'), yPos: 'ne' }); } },
      { cap: `${T('h(60)=-20(60)^2+1\\,600(60)=-72\\,000+96\\,000=24\\,000')}.`,
        run: async (c) => { await fly(c, 60, 1800); await readFwd(c, G, 60, 24000, { color: 'purple' }); } },
      { cap: `(c) Yes, ${T('h(20)=h(60)')}: the same height, ${T('24\\,000')} cm. But <b>not the same meaning</b>: at ${T('20')} s the rocket is <b>rising</b>, at ${T('60')} s it is <b>falling</b>.`,
        run: async (c) => { await fadeIn(c, G.label(20, 24000, '↑ rising', { pos: 'sw', cls: 'bk-pill', color: 'blue', gap: 10 })); await fadeIn(c, G.label(60, 24000, '↓ falling', { pos: 'se', cls: 'bk-pill', color: 'purple', gap: 10 })); } }
    ];
    if (k === 'd') return [
      { cap: `i) ${T('h(0)=0')}: the rocket is on the ground at the moment of launch.`,
        run: async (c) => { await pop(c, G.point(0, 0, { color: 'blue', r: 8, label: T('(0,\\ 0)'), pos: 'ne' })); } },
      { cap: `ii) ${T('h(80)=-128\\,000+128\\,000=0')}: back on the ground. It lands ${T('80')} s after launch.`,
        run: async (c) => { await fly(c, 80, 2600); await pop(c, G.point(80, 0, { color: 'blue', r: 8, label: T('(80,\\ 0)'), pos: 'nw' })); } },
      { cap: `iii) ${T('h(90)=-162\\,000+144\\,000=-18\\,000')}. Follow the rule past ${T('80')} s, below the ground…`,
        run: async (c) => { await G.setWindow({ ymin: -20000 }, c, 900); const s = G.fn(rFn, { from: 80, to: 90, color: 'red', dash: true, arrows: false }); await G.drawIn(s, 500, c); await pop(c, G.point(90, -18000, { color: 'red', r: 7 })); } },
      { cap: `A <b>negative height is impossible</b>: the rocket landed at ${T('t=80')} s and does not keep going underground. The rule no longer applies.`,
        run: async (c) => { const [px, py] = G.toPx(90, -18000); await stampIn(c, stamp(stage, '✗ impossible', { ok: false, x: GX + px - 90, y: 8 + py - 50, size: 'sm' })); } }
    ];
    return [
      { cap: `(e) The flight is symmetric: ${T('h(20)=h(60)')}, so the peak is halfway between, at ${T('t=40')}: ${T('h(40)=-32\\,000+64\\,000=32\\,000')} cm.`,
        run: async (c) => {
          for (const t of [20, 60]) await pop(c, G.point(t, 24000, { color: 'gray', r: 6 }));
          await G.drawIn(dash(G, [40, 0], [40, 32000], 'amber'), 600, c);
          await pop(c, G.point(40, 32000, { color: 'amber', r: 8, label: T('(40,\\ 32\\,000)'), pos: 'n' }));
          await fly(c, 40, 1500);
        } },
      { cap: `(f) It lands when ${T('h(t)=0')}: ${T('-20t^2+1\\,600t=0')}, ${T('-20t(t-80)=0')}, so ${T('t=0')} (launch) or ${T('t=80')} s.`,
        run: async (c) => { for (const t of [0, 80]) await pop(c, G.point(t, 0, { color: 'purple', r: 8, label: T(`(${t},\\ 0)`), pos: t ? 'nw' : 'ne' })); } },
      { cap: `(g) <b>Domain</b> ${T('\\{t\\mid 0\\le t\\le 80,\\ t\\in\\mathbb{R}\\}')}: from launch to landing.`,
        run: async (c) => { await G.drawIn(G.shadeX(0, 80, { band: true }), 800, c); } },
      { cap: `<b>Range</b> ${T('\\{h(t)\\mid 0\\le h(t)\\le 32\\,000,\\ h(t)\\in\\mathbb{R}\\}')}: from the ground to the peak.`,
        run: async (c) => { await G.drawIn(G.shadeY(0, 32000, { band: true }), 800, c); } }
    ];
  }
};

/* ============ wiring ============ */
mountWarm();
mountFigures();
export const explainers = mountExplainers({ swap, machine, fwdBack, sweep, exThree, candle, limits, pool, cost, rocket });
