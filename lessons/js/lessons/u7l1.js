/* Math 10C · Unit 7 · Lesson 1 — Slope–Intercept Form and the Graph of a Line.
 * Warm-up cups (stacks + "plot the stacks"), the Example 1 sort, the example figures, the flowchart, and the explainers:
 *   linTest (graph each relation and drop it in the LINEAR / NON-LINEAR bin; Example 1), cups (cup stacks → table →
 *   graph → h = 2n + 10), readMB (find b where the line crosses, count a slope triangle for m; Examples 2–3),
 *   dials (STAR: an m dial tilts the line, a b dial slides it, live equation; draggable; Example 3 check),
 *   balance (a balance scale: divide every term to get y alone; the trap of dividing only some terms; Examples 4–5),
 *   stepGraph (plot (0, b), step rise/run both ways; negative slope two ways; Example 6a), intercepts (set x = 0, set
 *   y = 0, join; Example 6b), match (match four equations to four lines: b first, then the sign and size of m).
 * Colours: m and lines blue, b / y-intercept green, run amber, rise purple; wrong / non-linear red. */
import {
  h, tex, add, box, Graph, Flowchart, stamp, stampIn, checkCard, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pairTex, texNum, svgEl, liveCtx, pulse, place, arrowHead, drawIn, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const RUN = COLORS.amber, RISE = COLORS.purple, LINE = COLORS.blue, BC = COLORS.green, RED = COLORS.red, INK = COLORS.ink, GRAY = COLORS.gray;
const cR = (s) => `\\textcolor{${RISE}}{${s}}`, cU = (s) => `\\textcolor{${RUN}}{${s}}`;
const cM = (s) => `\\textcolor{${LINE}}{${s}}`, cB = (s) => `\\textcolor{${BC}}{${s}}`, cX = (s) => `\\textcolor{${RED}}{${s}}`;
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const red = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
/** TeX of a reduced fraction (sign in front), whole numbers plain */
const fr = (n, d, big) => { const [a, b] = red(n, d); if (b === 1) return String(a); return (a < 0 ? '-' : '') + `\\${big ? 'd' : 't'}frac{${Math.abs(a)}}{${b}}`; };
/* a "q" is a number or an exact fraction [n, d] */
const qv = (q) => (Array.isArray(q) ? q[0] / q[1] : q);
const qt = (q, big) => (Array.isArray(q) ? fr(q[0], q[1], big) : texNum(q));
const qabs = (q) => (Array.isArray(q) ? [Math.abs(q[0]), Math.abs(q[1])] : Math.abs(q));
/** y = mx + b as TeX, m blue and b green (each with its sign); m, b numbers or [n, d] */
function eqTex(m, b, o = {}) {
  const col = o.color !== false, C1 = col ? cM : (s) => s, C2 = col ? cB : (s) => s, mv = qv(m), bv = qv(b);
  let s = '';
  if (Math.abs(mv) > 1e-12) {
    const mag = Math.abs(Math.abs(mv) - 1) < 1e-12 ? '' : qt(qabs(m), o.big);
    s = (mag || mv < 0 ? C1((mv < 0 ? '-' : '') + mag) : '') + (o.x || 'x');
  }
  if (Math.abs(bv) > 1e-12 || !s) {
    const mag = qt(qabs(b), o.big);
    if (!s) s = C2((bv < 0 ? '-' : '') + mag);
    else s += bv < 0 ? `\\mathbin{${C2('-')}}${C2(mag)}` : `+${C2(mag)}`;
  }
  return `${o.y || 'y'}=${s}`;
}
const n = (v) => texNum(v).replace('-', '−');
const show = (c, el) => fadeIn(c, el, 320);
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u7l1-panel ' + cls, title ? `<div class="u7l1-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u7l1-line ' + cls, html); p.appendChild(d); return d; };
const norm2 = (x, y) => { const L = Math.hypot(x, y) || 1; return [x / L, y / L]; };

/** a whole line y = m x + b read from get() each redraw (so it can tilt and slide), arrows at the window edges */
function dynLine(G, get, o = {}) {
  return G.curve(() => {
    const L = get(); if (!L) return { subs: [] };
    const a = L.x != null ? [L.x, 0] : [0, L.b], d = L.x != null ? [0, 1] : [1, L.m];
    const t = G._clipT(a, d, -Infinity, Infinity); if (!t) return { subs: [] };
    const P = (s) => G.toPx(a[0] + d[0] * s, a[1] + d[1] * s), A = P(t[0]), B = P(t[1]);
    if (o.arrows === false) return { subs: [[A, B]] };
    return { subs: [[A, B]], ends: [{ p: A, d: norm2(A[0] - B[0], A[1] - B[1]), s: 'arrow', k: 0, si: 0, last: false }, { p: B, d: norm2(B[0] - A[0], B[1] - A[1]), s: 'arrow', k: 1, si: 0, last: true }] };
  }, Object.assign({ color: LINE, width: 4.5 }, o), 'bk-line', G.layers.data);
}

/* ---------------------------------------------------------------------------------------------------------------
 * Slope triangle on a Graph: run leg (amber) from (x, y) across, then rise leg (purple) up/down to the line.
 * ------------------------------------------------------------------------------------------------------------- */
class SlopeTri {
  constructor(G, s, o = {}) {
    this.G = G; this.s = Object.assign({}, s); this.o = o;
    const L = o.layer || G.layers.data, w = o.w || 5;
    this.g = svgEl('g', { class: 'u7l1-tri' }, L);
    this.fill = svgEl('path', { fill: o.fill || LINE, 'fill-opacity': o.fillOp ?? 0.1, stroke: 'none' }, this.g);
    this.runP = svgEl('path', { class: 'bk-stroke', stroke: RUN, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, this.g);
    this.riseP = svgEl('path', { class: 'bk-stroke', stroke: RISE, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, this.g);
    this.lRun = o.labels === false ? null : h('div', 'bk-lab u7l1-tlab u7l1-trun');
    this.lRise = o.labels === false ? null : h('div', 'bk-lab u7l1-tlab u7l1-trise');
    if (this.lRun) G.html.append(this.lRun, this.lRise);
    G.track(this.g, () => this.draw());
  }
  draw() {
    const G = this.G, { x, y, run, rise } = this.s;
    const P = G.toPx(x, y), C = G.toPx(x + run, y), Q = G.toPx(x + run, y + rise);
    const d = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    this.fill.setAttribute('d', `M${P[0]} ${P[1]} L${C[0]} ${C[1]} L${Q[0]} ${Q[1]} Z`);
    this.runP.setAttribute('d', d(P, C)); this.riseP.setAttribute('d', d(C, Q));
    if (!this.lRun) return;
    if (this.o.words) { this.lRun.innerHTML = `<b>${run > 0 ? 'right' : 'left'}</b> ${n(Math.abs(run))}`; this.lRise.innerHTML = `<b>${rise > 0 ? 'up' : 'down'}</b> ${n(Math.abs(rise))}`; }
    else { this.lRun.innerHTML = `<b>run</b> ${n(run)}`; this.lRise.innerHTML = `<b>rise</b> ${n(rise)}`; }
    place(this.lRun, (P[0] + C[0]) / 2, P[1], this.o.runSide || (rise >= 0 ? 's' : 'n'), 6);
    place(this.lRise, C[0], (C[1] + Q[1]) / 2, this.o.riseSide || (run >= 0 ? 'e' : 'w'), 8);
  }
  async drawIn(c, ms = 450) {
    const [lr, ls] = [this.lRun, this.lRise]; this.fill.style.opacity = 0; hide(lr); hide(ls);
    await drawIn(this.runP, ms, c); if (lr) await fadeIn(c, lr, 200);
    await drawIn(this.riseP, ms, c); if (ls) await fadeIn(c, ls, 200);
    await appear(c, this.fill, 220);
  }
  remove() { this.G.remove(this.g); if (this.lRun) { this.lRun.remove(); this.lRise.remove(); } }
  /** keep the legs, faded, and drop the labels (so the next triangle's labels have room) */
  quiet() { this.g.style.opacity = 0.45; if (this.lRun) { this.lRun.remove(); this.lRise.remove(); this.lRun = this.lRise = null; } }
}

/* =============================== cups: shared drawing =============================== */
/** one cup (12 cm tall, 5 cm base, 8 cm rim) with its bottom centre at (cx, base) px; s px per cm */
function drawCup(parent, cx, base, s) {
  const g = svgEl('g', {}, parent), b = 2.5 * s, t = 4 * s, H = 12 * s, wr = (2.5 + 1.5 * 10.6 / 12) * s, yb = base - 10.6 * s;
  svgEl('path', { d: `M${cx - b} ${base} L${cx + b} ${base} L${cx + t} ${base - H} L${cx - t} ${base - H} Z`, fill: '#dc4646', stroke: INK, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, g);
  svgEl('path', { d: `M${cx - wr} ${yb} L${cx + wr} ${yb} L${cx + t} ${base - H} L${cx - t} ${base - H} Z`, fill: '#efa3a3', stroke: INK, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, g);
  return g;
}
/** a nested stack of k cups: higher cups sit behind (inside) the lower ones */
function drawStack(parent, cx, base, s, k) {
  const g = svgEl('g', {}, parent);
  for (let i = k; i >= 1; i--) drawCup(g, cx, base - 2 * (i - 1) * s, s);
  return g;
}
/** a vertical dimension arrow from y0 to y1 (px) at x */
function dimArrow(svg, x, y0, y1, color = INK) {
  svgEl('line', { x1: x, x2: x, y1: y0, y2: y1, stroke: color, 'stroke-width': 2 }, svg);
  arrowHead(svg, x, y1, 0, y1 - y0, { color, width: 2 }); arrowHead(svg, x, y0, 0, y0 - y1, { color, width: 2 });
}

/* =============================== warm-up: stacking cups =============================== */
function mountCups() {
  const host = document.getElementById('u7l1-cups'); if (!host) return;
  const W = 560, H = 330, s = 9, base = 272;
  const wrap = box(h('div', 'u7l1-cupwrap'), W, H); host.appendChild(wrap);
  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, wrap);
  const html = h('div', 'bk-html'); wrap.appendChild(html);
  const lab = (x, y, str, pos, cls) => { const d = h('div', 'bk-lab ' + cls, str); html.appendChild(d); return place(d, x, y, pos, 4); };
  svgEl('rect', { x: 0, y: base, width: W, height: 12, fill: '#e3cdb4' }, svg);
  svgEl('line', { x1: 0, x2: W, y1: base, y2: base, stroke: '#8c6a43', 'stroke-width': 2.5 }, svg);
  const xs = [72, 202, 332, 462];
  [1, 2, 3].forEach((k, i) => {
    const cx = xs[i], ht = 12 + 2 * (k - 1);
    drawStack(svg, cx, base, s, k);
    dimArrow(svg, cx + 46, base, base - ht * s);
    lab(cx + 4, base - ht * s - 6, `${ht} cm`, 'n', 'u7l1-cupdim');
    lab(cx, base + 14, `${k} cup${k > 1 ? 's' : ''}`, 's', 'u7l1-cuplab');
  });
  // the mystery stack of 4
  const cx4 = xs[3], ht4 = 18;
  const myst = svgEl('rect', { x: cx4 - 46, y: base - ht4 * s - 10, width: 92, height: ht4 * s + 6, rx: 8, fill: 'none', stroke: RED, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' }, svg);
  const q = lab(cx4, base - ht4 * s / 2 - 4, '?', 'c', 'u7l1-cupq');
  lab(cx4, base + 14, '4 cups', 's', 'u7l1-cuplab');
  const g4 = drawStack(svg, cx4, base, s, 4); g4.style.opacity = 0;
  const d4 = svgEl('g', {}, svg); dimArrow(d4, cx4 + 46, base, base - ht4 * s); d4.style.opacity = 0;
  const l4 = lab(cx4 + 4, base - ht4 * s - 6, '18 cm', 'n', 'u7l1-cupdim'); l4.style.opacity = 0;
  let on4 = false;
  document.getElementById('u7l1-c4').addEventListener('click', async (e) => {
    on4 = !on4; e.currentTarget.textContent = on4 ? 'Hide 4 cups' : 'Show 4 cups';
    myst.style.opacity = q.style.opacity = on4 ? 0 : 1;
    const c = liveCtx();
    if (on4) { await appear(c, g4, 350); await Promise.all([appear(c, d4, 250), fadeIn(c, l4, 250)]); } else g4.style.opacity = d4.style.opacity = l4.style.opacity = 0;
  });
  // plot overlay
  const ov = box(h('div', 'u7l1-cupplot'), W, H); wrap.appendChild(ov); ov.style.opacity = 0; ov.style.pointerEvents = 'none';
  const G = new Graph(ov, { width: W, height: H, xmin: 0, xmax: 6, ymin: 0, ymax: 22, ystep: 2, ylabels: 4, xtitle: 'n', ytitle: 'h', origin: true });
  const pts = [1, 2, 3, 4].map((k) => G.point(k, 10 + 2 * k, { color: INK, r: 6.5, label: T(pairTex(k, 10 + 2 * k)), pos: 'nw', labelCls: 'u7l1-small' }));
  const ln = dynLine(G, () => ({ m: 2, b: 10 }), { dash: true, width: 3 });
  const p0 = G.point(0, 10, { color: BC, r: 8, label: '0 cups: 10 cm', pos: 'se', labelCls: 'u7l1-bint' });
  const eq = G.label(4.7, 10, T(eqTex(2, 10, { y: 'h', x: 'n' })), { pos: 'c', cls: 'u7l1-cupeq' });
  const all = [...pts, ...pts.map((p) => p.label), ln, p0, p0.label, eq];
  let onP = false;
  document.getElementById('u7l1-cplot').addEventListener('click', async (e) => {
    onP = !onP; e.currentTarget.textContent = onP ? 'Back to the cups' : 'Plot the stacks';
    const c = liveCtx();
    if (!onP) { ov.style.opacity = 0; return; }
    all.forEach(hide); ov.style.opacity = 1;
    for (const p of pts) { await Promise.all([pop(c, p, 300), fadeIn(c, p.label, 300)]); }
    await appear(c, ln, 400); await Promise.all([pop(c, p0, 380), fadeIn(c, p0.label, 380)]); await pop(c, eq, 380);
  });
}

/* =============================== Example 1: sort tiles =============================== */
function mountSort() {
  const root = document.getElementById('u7l1-sort'); if (!root) return;
  const pool = root.querySelector('[data-bin="pool"]'), lin = root.querySelector('[data-bin="lin"]'), non = root.querySelector('[data-bin="non"]');
  const tiles = [...root.querySelectorAll('.u7l1-tile')];
  const order = (bin) => [...bin.children].sort((a, b) => a.dataset.k.localeCompare(b.dataset.k)).forEach((t) => bin.appendChild(t));
  tiles.forEach((t) => t.addEventListener('click', () => {
    const where = t.parentNode === pool ? lin : t.parentNode === lin ? non : pool;
    t.classList.remove('u7l1-ok', 'u7l1-no'); where.appendChild(t); order(where);
  }));
  document.getElementById('u7l1-sortchk').addEventListener('click', () => tiles.forEach((t) => {
    t.classList.remove('u7l1-ok', 'u7l1-no');
    if (t.parentNode === pool) return;
    const ok = (t.parentNode === lin) === (t.dataset.lin === '1'); t.classList.add(ok ? 'u7l1-ok' : 'u7l1-no');
  }));
  document.getElementById('u7l1-sortreset').addEventListener('click', () => { tiles.forEach((t) => { t.classList.remove('u7l1-ok', 'u7l1-no'); pool.appendChild(t); }); order(pool); });
}

/* =============================== static figures =============================== */
function mountFigures() {
  const g2 = document.getElementById('u7l1-ex2fig');
  if (g2) {
    const G = new Graph(g2, { width: 380, height: 380, xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5, xlabels: 2, ylabels: 2 });
    G.line({ m: 0.75, b: 2 }, { color: LINE, width: 4 });
    G.point(-4, -1, { color: INK, r: 6, label: T('A'), pos: 'se' }); G.point(0, 2, { color: INK, r: 6, label: T('B'), pos: 'se' });
    G.label(-3.3, 4.6, T('y=\\tfrac{3}{4}x+2'), { cls: 'bk-ptlab u7l1-glab', color: LINE });
  }
  const g3 = document.getElementById('u7l1-ex3fig');
  if (g3) {
    const G = new Graph(g3, { width: 300, height: 432, xmin: -4, xmax: 4, ymin: -4, ymax: 8, xlabels: 2, ylabels: 2 });
    G.line({ m: 3, b: -2 }, { color: LINE, width: 4 }); G.line({ m: -1.5, b: 4 }, { color: RED, width: 4 });
    G.point(0, -2, { color: INK, r: 5.5 }); G.point(0, 4, { color: INK, r: 5.5 });
    G.label(0.8, 6.3, T('y=3x-2'), { pos: 'c', cls: 'bk-ptlab u7l1-glab', color: LINE });
    G.label(-3.95, -1.2, T('y=-\\tfrac{3}{2}x+4'), { pos: 'e', cls: 'bk-ptlab u7l1-glab', color: RED });
  }
  const g4 = document.getElementById('u7l1-ex4fig');
  if (g4) {
    const G = new Graph(g4, { width: 376, height: 410, xmin: -5, xmax: 5, ymin: -6, ymax: 5, xlabels: 2, ylabels: 2 });
    G.line({ m: 2, b: -3 }, { color: LINE, width: 4 });
    G.point(0, -3, { color: INK, r: 6, coords: true, pos: 'se' }); G.point(2, 1, { color: INK, r: 6, coords: true, pos: 'nw' });
    G.label(-2.5, 4.1, T('3y=6x-9'), { cls: 'bk-ptlab u7l1-glab', color: LINE });
  }
  ['u7l1-ex6a', 'u7l1-ex6b'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) new Graph(el, { width: 400, height: 400, xmin: -8.5, xmax: 8.5, ymin: -8.5, ymax: 8.5, xlabels: 2, ylabels: 2, fontSize: 15, interactive: { snap: 1, color: 'blue' } });
  });
  const a6 = document.getElementById('u7l1-ex6aans');
  if (a6) {
    const G = new Graph(a6, { width: 300, height: 300, xmin: -8.5, xmax: 8.5, ymin: -8.5, ymax: 8.5, xlabels: 4, ylabels: 4, fontSize: 14 });
    G.line({ m: 3, b: -4 }, { color: RED, width: 3.5 });
    [[0, -4], [1, -1], [2, 2], [-1, -7]].forEach((p) => G.point(p[0], p[1], { color: RED, r: 5.5 }));
  }
  const b6 = document.getElementById('u7l1-ex6bans');
  if (b6) {
    const G = new Graph(b6, { width: 300, height: 300, xmin: -8.5, xmax: 8.5, ymin: -8.5, ymax: 8.5, xlabels: 4, ylabels: 4, fontSize: 14 });
    G.line({ m: 5 / 6, b: -5 }, { color: RED, width: 3.5 });
    G.point(0, -5, { color: RED, r: 5.5, coords: true, pos: 'w', labelCls: 'u7l1-small' }); G.point(6, 0, { color: RED, r: 5.5, coords: true, pos: 'nw', labelCls: 'u7l1-small' });
  }
  const fl = document.getElementById('u7l1-flow');
  if (fl) {
    new Flowchart(fl, { width: 930, height: 236, cls: 'u7l1-flow',
      nodes: {
        start: { x: 95, y: 52, w: 170, h: 64, html: '<b>A linear equation</b>', cls: 'bk-round' },
        q: { x: 300, y: 52, w: 180, h: 64, html: `<b>Solved for ${T('y')}?</b>` },
        re: { x: 300, y: 182, w: 250, h: 70, html: '<b>Rearrange</b>reorder, or divide every term', color: 'purple' },
        form: { x: 520, y: 52, w: 160, h: 64, html: T('y=mx+b'), color: 'blue' },
        m1: { x: 790, y: 52, w: 260, h: 64, html: `<b>Plot ${T('(0,\\,b)')}</b>then step rise / run`, color: 'green' },
        m2: { x: 790, y: 172, w: 260, h: 70, html: '<b>Two intercepts</b>set x = 0, then y = 0; join', color: 'amber' }
      },
      edges: [{ from: 'start', to: 'q' }, { from: 'q', to: 'form', label: 'yes' }, { from: 'q', to: 're', label: 'no' }, { from: 're', to: 'form', route: 'hv' },
        { from: 'form', to: 'm1' }, { from: 'form', to: 'm2', route: 'vh' }] });
  }
}

/* =============================== explainer: linear or not? =============================== */
const LT = {
  ex1: { label: 'Example 1 check', ex: true, items: [
    { k: '(a)', tex: 'y=5x-3', f: (x) => 5 * x - 3, lin: true, why: `only ${T('x')} to the first power: ${T('m=5')}, ${T('b=-3')}` },
    { k: '(b)', tex: `y=x^{${cX('3')}}`, f: (x) => x ** 3, lin: false, why: `${T('x')} is <b>cubed</b>` },
    { k: '(c)', tex: `y=2x^{${cX('2')}}+7`, f: (x) => 2 * x * x + 7, lin: false, why: `${T('x')} is <b>squared</b>` },
    { k: '(d)', tex: 'y=-\\tfrac{2}{5}x+6', f: (x) => -0.4 * x + 6, lin: true, why: `already ${T('y=mx+b')}: ${T('m=-\\tfrac{2}{5}')}, ${T('b=6')}` },
    { k: '(e)', tex: 'y=9-x', f: (x) => 9 - x, lin: true, why: `reorder it: ${T('y=-x+9')}` },
    { k: '(f)', tex: `y=\\dfrac{3}{${cX('x')}+2}`, f: (x) => 3 / (x + 2), breaks: [-2], lin: false, why: `${T('x')} is in a <b>denominator</b>` },
    { k: '(g)', tex: 'y=7x', f: (x) => 7 * x, lin: true, why: `${T('m=7')} and ${T('b=0')}` },
    { k: '(h)', tex: `y=3^{${cX('x')}}`, f: (x) => 3 ** x, lin: false, why: `${T('x')} is an <b>exponent</b>` }] },
  breaks: { label: 'Five ways to bend a line', items: [
    { k: T('x^2'), tex: `y=x^{${cX('2')}}`, f: (x) => x * x, lin: false, why: `${T('x')} <b>raised to a power</b>: the graph bends` },
    { k: T('\\sqrt{x}'), tex: `y=\\sqrt{${cX('x')}}`, f: (x) => Math.sqrt(x), from: 0, lin: false, why: `${T('x')} <b>under a root</b>` },
    { k: T('\\tfrac{4}{x}'), tex: `y=\\dfrac{4}{${cX('x')}}`, f: (x) => 4 / x, breaks: [0], lin: false, why: `${T('x')} <b>in a denominator</b>` },
    { k: T('2^x'), tex: `y=2^{${cX('x')}}`, f: (x) => 2 ** x, lin: false, why: `${T('x')} as an <b>exponent</b>` },
    { k: T('xy'), tex: `${cX('x')}y=4`, f: (x) => 4 / x, breaks: [0], lin: false, why: `${T('x')} <b>times another variable</b> (the same curve as ${T('y=\\tfrac{4}{x}')})` },
    { k: T('2x+1'), tex: 'y=2x+1', f: (x) => 2 * x + 1, lin: true, why: `${T('x')} to the first power, times a number, plus a number` }] }
};
const linTest = {
  title: 'Is it a straight line?',
  height: 470,
  choices: Object.keys(LT).map((k) => ({ v: k, label: LT[k].label })),
  intro: 'Look at what happens to <b>x</b> in each equation, then check with the graph. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = LT[k], items = d.items;
    const P = panel(stage, 14, 14, 450, 440, d.ex ? 'Example 1' : 'What happens to x?');
    const eq = h('div', 'u7l1-lt-eq', '&nbsp;'); P.appendChild(eq);
    const why = h('div', 'u7l1-lt-why'); P.appendChild(why);
    const verdict = h('div', 'u7l1-verdict'); P.appendChild(verdict); hide(verdict);
    const bins = h('div', 'u7l1-bins'); P.appendChild(bins);
    bins.innerHTML = '<div class="u7l1-xbin u7l1-xbin-lin"><div class="u7l1-xbin-h">LINEAR</div><div class="u7l1-xbin-b"></div></div><div class="u7l1-xbin u7l1-xbin-non"><div class="u7l1-xbin-h">NON-LINEAR</div><div class="u7l1-xbin-b"></div></div>';
    const [bLin, bNon] = bins.querySelectorAll('.u7l1-xbin-b');
    const GW = Math.min(500, ex.W - 494);
    const G = new Graph(stage, { x: 480, y: 14, width: GW, height: 440, xmin: -5, xmax: 5, ymin: -10, ymax: 10, ystep: 2, xlabels: 1, ylabels: 2 });
    let cur = null;
    const steps = items.map((it) => ({
      cap: `${d.ex ? it.k + ' ' : ''}${T(it.tex.replace(/\\textcolor\{[^}]*\}\{([^}]*)\}/g, '$1'))}: ${it.why}. <b>${it.lin ? 'Linear' : 'Non-linear'}.</b>`,
      run: async (c) => {
        if (cur) G.remove(cur);
        eq.innerHTML = T(it.tex); await pop(c, eq, 300);
        why.innerHTML = it.why;
        cur = G.fn(it.f, { color: it.lin ? LINE : RED, width: 4.5, breaks: it.breaks, from: it.from });
        await G.drawIn(cur, 800, c);
        verdict.className = 'u7l1-verdict ' + (it.lin ? 'u7l1-v-lin' : 'u7l1-v-non');
        verdict.textContent = it.lin ? 'straight line: LINEAR' : 'curve: NON-LINEAR';
        await pop(c, verdict, 300);
        const chip = h('span', 'u7l1-xchip', d.ex ? it.k : it.k); (it.lin ? bLin : bNon).appendChild(chip); await pop(c, chip, 300);
      }
    }));
    const lins = items.filter((it) => it.lin);
    steps.push({
      cap: d.ex ? `Sorted. LINEAR: (a), (d), (e), (g). NON-LINEAR: (b), (c), (f), (h). All four linear ones graph as <b>straight lines</b>.`
        : `Only ${T('x')} to the <b>first power</b>, times a number, plus a number, keeps the graph <b>straight</b>: ${T('y=mx+b')}.`,
      run: async (c) => {
        if (cur) G.remove(cur); cur = null;
        hide(verdict); eq.innerHTML = T('y=mx+b'); why.innerHTML = `${T('x')} to the first power only`;
        for (const it of lins) await G.drawIn(G.fn(it.f, { color: LINE, width: 3.5 }), 400, c);
      }
    });
    return steps;
  }
};

/* =============================== explainer: cups → h = 2n + 10 =============================== */
const cups = {
  title: 'From cup stacks to h = 2n + 10',
  height: 470,
  intro: 'Stack the cups, fill the table, plot the points. Press <b>Next</b>.',
  make(stage, k, ex) {
    const s = 10, base = 420, cx = 120;
    const wrap = add(stage, box(h('div', 'u7l1-stackwrap'), 250, 450), 14, 10);
    const sv = svgEl('svg', { width: 250, height: 450, viewBox: '0 0 250 450' }, wrap);
    const hl = h('div', 'bk-html'); wrap.appendChild(hl);
    svgEl('rect', { x: 0, y: base, width: 250, height: 10, fill: '#e3cdb4' }, sv);
    svgEl('line', { x1: 0, x2: 250, y1: base, y2: base, stroke: '#8c6a43', 'stroke-width': 2.5 }, sv);
    const stack = svgEl('g', {}, sv), dims = svgEl('g', {}, sv);
    const nlab = place(h('div', 'bk-lab u7l1-stack-n', ''), 125, 18, 's', 0); hl.appendChild(nlab);
    const setN = (k2) => { nlab.innerHTML = k2 ? `${T('n=' + k2)}, ${T('h=' + (2 * k2 + 10))} cm` : `${T('n=0')}, ${T('h=10')} cm?`; };
    const addCup = (k2) => { const g = drawCup(stack, cx, base - 2 * (k2 - 1) * s, s); stack.insertBefore(g, stack.firstChild); return g; };
    const setDim = (ht, col = INK) => { dims.innerHTML = ''; dimArrow(dims, cx + 58, base, base - ht * s, col); };
    // the table
    const TX = 276, TY = 40, RH = 50;
    const tb = add(stage, h('div', 'u7l1-ctab'), TX, TY);
    tb.innerHTML = `<div class="u7l1-ctr u7l1-cth"><div>${T('n')} (cups)</div><div>${T('h')} (cm)</div></div>` + [0, 1, 2, 3, 4].map((r) => `<div class="u7l1-ctr${r === 0 ? ' u7l1-ct0' : ''}"><div>${T(String(r))}</div><div>${T(String(10 + 2 * r))}</div></div>`).join('');
    const rows = [...tb.querySelectorAll('.u7l1-ctr:not(.u7l1-cth)')]; rows.forEach(hide);
    const diffs = [0, 1, 2, 3].map((r) => { const d = add(stage, h('div', 'u7l1-cdiff' + (r === 0 ? ' u7l1-cd0' : ''), '+2'), TX + 184, TY + 44 + RH * (r + 1) - 15); return hide(d); });
    const GX = 520, GW = ex.W - GX - 14;
    const G = new Graph(stage, { x: GX, y: 14, width: GW, height: 440, xmin: 0, xmax: 6, ymin: 0, ymax: 22, ystep: 2, ylabels: 4, xtitle: 'n', ytitle: 'h', origin: true });
    const pt = (k2) => G.point(k2, 10 + 2 * k2, { color: INK, r: 6.5 });
    const doors = h('div', 'u7l1-panel u7l1-cdoor'); add(stage, box(doors, 214, 120), TX, 340); hide(doors);
    return [
      { cap: `One cup is <b>12 cm</b> tall. In the table and on the graph: ${T('n=1')}, ${T('h=12')}.`,
        run: async (c) => { await appear(c, addCup(1), 300); setDim(12); setN(1); await show(c, rows[1]); await G.reveal(pt(1), c); } },
      { cap: `Nest a second cup inside: only its <b>2 cm lip</b> sticks up. ${T('n=2')}, ${T('h=14')}.`,
        run: async (c) => { await appear(c, addCup(2), 300); setDim(14); setN(2); await show(c, rows[2]); await G.reveal(pt(2), c); } },
      { cap: `Three cups: ${T('16')} cm. Four cups: ${T('18')} cm. The points line up.`,
        run: async (c) => { for (const k2 of [3, 4]) { await appear(c, addCup(k2), 300); setDim(10 + 2 * k2); setN(k2); await show(c, rows[k2]); await G.reveal(pt(k2), c); } } },
      { cap: `Each cup adds ${T('2')} cm: ${T('+2')} down the table. On the graph: run ${T(cU('1'))}, rise ${T(cR('2'))}. The slope is ${T(cM('m=2'))}.`,
        run: async (c) => { for (const d of diffs.slice(1)) await pop(c, d, 260); const t = new SlopeTri(G, { x: 2, y: 14, run: 1, rise: 2 }); await t.drawIn(c, 350); } },
      { cap: `Run it <b>backwards</b>: take away one lip. ${T('0')} cups gives ${T('10')} cm, where the line meets the ${T('h')}-axis: ${T(cB('b=10'))}.`,
        run: async (c) => { setN(0); [...stack.children].forEach((g) => (g.style.opacity = 0.18)); setDim(10, BC); await show(c, rows[0]); await pop(c, diffs[0], 260); await G.reveal(G.point(0, 10, { color: BC, r: 8, label: T('(0,\\,10)'), pos: 'e', labelCls: 'u7l1-bint' }), c); } },
      { cap: `Join them: ${T(eqTex(2, 10, { y: 'h', x: 'n' }))}. The same shape as ${T('y=mx+b')}, with slope ${T(cM('2'))} and intercept ${T(cB('10'))}.`,
        run: async (c) => { await G.drawIn(dynLine(G, () => ({ m: 2, b: 10 }), { width: 3.5 }), 700, c); const e = G.label(4.2, 7, T(eqTex(2, 10, { y: 'h', x: 'n' })), { cls: 'u7l1-cupeq' }); await pop(c, e); } },
      { cap: `The door: ${T('2n+10=200')}, so ${T('2n=190')} and ${T('n=95')} cups.`,
        run: async (c) => { doors.innerHTML = `<div class="u7l1-ph">The big one</div><div class="u7l1-line">${T('2n+10=200')}</div><div class="u7l1-line">${T('2n=190')}</div><div class="u7l1-line">${T('n=95')} cups</div>`; await show(c, doors); } }
    ];
  }
};

/* =============================== explainer: read m and b off a graph =============================== */
const RM = {
  count: { label: 'Count it off', win: [-6.5, 6.5, -6.5, 6.5], gw: 440 },
  ex2: { label: 'Example 2 check', win: [-6.5, 6.5, -6.5, 6.5], gw: 440 },
  ex3: { label: 'Example 3 check', win: [-4.5, 4.5, -4.5, 8.5], gw: 330 }
};
const readMB = {
  title: 'Read b where it crosses, count m from there',
  height: 470,
  choices: Object.keys(RM).map((k) => ({ v: k, label: RM[k].label })),
  intro: 'Find the <b>y-intercept</b> first, then count a slope triangle to the next grid point on the line. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = RM[k], [x0, x1, y0, y1] = d.win;
    const G = new Graph(stage, { x: 14, y: 14, width: d.gw, height: 440, xmin: x0, xmax: x1, ymin: y0, ymax: y1, xlabels: 2, ylabels: 2 });
    const PX = 474, P = panel(stage, PX, 14, ex.W - PX - 14, 440, k === 'ex2' ? 'Example 2' : k === 'ex3' ? 'Example 3' : 'Read the line');
    const ro = h('div', 'u7l1-ro'); P.appendChild(ro);
    ro.innerHTML = `<div class="u7l1-ro-r u7l1-ro-b"><span class="u7l1-ro-k">y-int</span><b>?</b></div><div class="u7l1-ro-r u7l1-ro-m"><span class="u7l1-ro-k">slope</span><b>?</b></div>`;
    const [vB, vM] = ro.querySelectorAll('b');
    const eqb = h('div', 'u7l1-eqbox', '&nbsp;'); P.appendChild(eqb);
    const log = h('div', 'u7l1-log'); P.appendChild(log);
    const setB = async (c, t) => { vB.innerHTML = T(cB(t)); await pulse(c, vB.parentNode, 1.06); };
    const setM = async (c, t) => { vM.innerHTML = T(cM(t.replace(/\\tfrac/g, '\\dfrac'))); await pulse(c, vM.parentNode, 1.06); };
    const bDot = (b, o = {}) => G.point(0, b, Object.assign({ color: BC, r: 8, label: T(pairTex(0, b)), pos: 'nw', labelCls: 'u7l1-bint' }, o));
    if (k === 'count') {
      return [
        { cap: 'A line on a grid. Where does it cross the <b>y-axis</b>?', run: (c) => G.drawIn(G.line({ m: 2 / 3, b: -1 }, { color: LINE, width: 4.5 }), 700, c) },
        { cap: `At ${T('(0,-1)')}: the <b>y-intercept</b> is ${T(cB('-1'))}.`, run: async (c) => { await G.reveal(bDot(-1), c); await setB(c, '-1'); } },
        { cap: `From there to the next grid point on the line: run ${T(cU('3'))}, rise ${T(cR('2'))}. Slope ${T(cM('\\tfrac{2}{3}'))}.`,
          run: async (c) => { const t = new SlopeTri(G, { x: 0, y: -1, run: 3, rise: 2 }); await t.drawIn(c); await G.reveal(G.point(3, 1, { color: INK, r: 6 }), c); await setM(c, '\\tfrac{2}{3}'); } },
        { cap: `This line is ${T(eqTex([2, 3], -1))}. The slope and the y-intercept are sitting <b>in the equation</b>.`,
          run: async (c) => { eqb.innerHTML = T(eqTex([2, 3], -1, { big: true })); await pop(c, eqb); } }
      ];
    }
    if (k === 'ex2') {
      return [
        { cap: `Naomi’s line, with ${T('A(-4,-1)')} and ${T('B(0,2)')} marked.`,
          run: async (c) => { await G.drawIn(G.line({ m: 0.75, b: 2 }, { color: LINE, width: 4.5 }), 700, c); await G.reveal(G.point(-4, -1, { color: INK, r: 7, label: T('A'), pos: 'nw' }), c); await G.reveal(G.point(0, 2, { color: INK, r: 7, label: T('B'), pos: 'se' }), c); } },
        { cap: `(a) From ${T('A')} to ${T('B')}: run ${T(cU('4'))} right, rise ${T(cR('3'))} up. Slope ${T('\\dfrac{3}{4}')}.`,
          run: async (c) => { const t = new SlopeTri(G, { x: -4, y: -1, run: 4, rise: 3 }, { riseSide: 'w' }); await t.drawIn(c); await setM(c, '\\tfrac{3}{4}'); line(log, `${T('m=\\dfrac{2-(-1)}{0-(-4)}=\\dfrac{3}{4}')}`); } },
        { cap: `${T('B')} is on the ${T('y')}-axis, so the y-intercept is ${T(cB('2'))}.`,
          run: async (c) => { await G.reveal(bDot(2, { label: T('(0,\\,2)'), pos: 'nw' }), c); await setB(c, '2'); } },
        { cap: `(b) Compare with ${T('y=\\tfrac{3}{4}x+2')}: the coefficient of ${T('x')} <b>is</b> the slope, and the constant <b>is</b> the y-intercept.`,
          run: async (c) => { eqb.innerHTML = T(eqTex([3, 4], 2, { big: true })); await pop(c, eqb); const s = stamp(P, 'they match', { ok: true }); s.classList.add('u7l1-stampb'); await stampIn(c, s); } }
      ];
    }
    // ex3
    return [
      { cap: `${T('y=3x-2')} crosses the ${T('y')}-axis at ${T('(0,-2)')}: ${T(cB('b=-2'))}.`,
        run: async (c) => { await G.drawIn(G.line({ m: 3, b: -2 }, { color: LINE, width: 4.5 }), 600, c); await G.reveal(bDot(-2, { pos: 'w' }), c); await setB(c, '-2'); } },
      { cap: `From ${T('(0,-2)')}: right ${T(cU('1'))}, up ${T(cR('3'))} lands on ${T('(1,1)')}. ${T(cM('m=3'))}.`,
        run: async (c) => { const t = new SlopeTri(G, { x: 0, y: -2, run: 1, rise: 3 }); await t.drawIn(c); await G.reveal(G.point(1, 1, { color: INK, r: 6 }), c); await setM(c, '3'); line(log, `${T('y=3x-2')}: slope ${T(cM('3'))}, y-int ${T(cB('-2'))}`); } },
      { cap: `${T('y=-\\tfrac{3}{2}x+4')} crosses at ${T('(0,4)')}: ${T(cB('b=4'))}.`,
        run: async (c) => { await G.drawIn(G.line({ m: -1.5, b: 4 }, { color: RED, width: 4.5 }), 600, c); await G.reveal(bDot(4, { pos: 'w' }), c); await setB(c, '4'); vM.innerHTML = '?'; } },
      { cap: `From ${T('(0,4)')}: right ${T(cU('2'))}, down ${T(cR('3'))} lands on ${T('(2,1)')}. ${T(cM('m=-\\tfrac{3}{2}'))}.`,
        run: async (c) => { const t = new SlopeTri(G, { x: 0, y: 4, run: 2, rise: -3 }); await t.drawIn(c); await setM(c, '-\\tfrac{3}{2}'); line(log, `${T('y=-\\tfrac{3}{2}x+4')}: slope ${T(cM('-\\tfrac{3}{2}'))}, y-int ${T(cB('4'))}`); } },
      { cap: `(b) The conjecture: the graph of ${T('y=mx+b')} has <b>slope ${T('m')}</b> and <b>y-intercept ${T('b')}</b>.`,
        run: async (c) => { eqb.innerHTML = T(`y=${cM('m')}x+${cB('b')}`); await pop(c, eqb); const r = h('div', 'u7l1-rulebox', `${T(cM('m'))} = slope<br>${T(cB('b'))} = y-intercept`); P.appendChild(r); await pop(c, r); } }
    ];
  }
};

/* =============================== explainer: the two dials (star) =============================== */
const DEG = Math.PI / 180;
const M_SNAP = [[-4, 1], [-3, 1], [-2, 1], [-3, 2], [-1, 1], [-2, 3], [-1, 2], [-1, 3], [0, 1], [1, 3], [1, 2], [2, 3], [1, 1], [3, 2], [2, 1], [3, 1], [4, 1]];
const M_LAB = [[-2, 1], [-1, 1], [-1, 2], [0, 1], [1, 2], [1, 1], [2, 1]];
const B_MIN = -6, B_MAX = 6, B_STEP = 25;      // b dial: 25° per unit, b = 0 straight up, turning clockwise raises b
/** the m dial: a half-disc opening right; the needle points along the line (left to right). onSet([n, d]) on drag */
function mDial(host, onSet) {
  const DW = 200, DH = 284, cx = 28, cy = 152, R = 118;
  const el = box(h('div', 'u7l1-dial u7l1-dial-m'), DW, DH); el.setAttribute('data-tap', ''); host.appendChild(el);
  const sv = svgEl('svg', { width: DW, height: DH, viewBox: `0 0 ${DW} ${DH}` }, el);
  const hl = h('div', 'bk-html'); el.appendChild(hl);
  const pt = (a, r) => [cx + r * Math.cos(a * DEG), cy - r * Math.sin(a * DEG)];
  svgEl('path', { d: `M${cx} ${cy - R} A${R} ${R} 0 0 1 ${cx} ${cy + R} Z`, fill: '#eef3fd', stroke: '#b8cdf2', 'stroke-width': 2 }, sv);
  M_SNAP.forEach(([a, b]) => {
    const ang = Math.atan(a / b) / DEG, labd = M_LAB.some((q) => q[0] === a && q[1] === b);
    const [x0, y0] = pt(ang, R - (labd ? 12 : 7)), [x1, y1] = pt(ang, R);
    svgEl('line', { x1: x0, y1: y0, x2: x1, y2: y1, stroke: INK, 'stroke-width': labd ? 2.2 : 1.4 }, sv);
    if (labd) { const [lx, ly] = pt(ang, R + 6); const t = h('div', 'bk-lab u7l1-dtick', T(fr(a, b))); hl.appendChild(t); place(t, lx, ly, 'e', 2); }
  });
  const nm = h('div', 'bk-lab u7l1-dname', `${T(cM('m'))} tilts`); hl.appendChild(nm); place(nm, 4, 2, 'se', 0);
  const needle = svgEl('line', { x1: cx, y1: cy, x2: cx + R - 22, y2: cy, stroke: LINE, 'stroke-width': 6, 'stroke-linecap': 'round' }, sv);
  const grip = svgEl('circle', { cx: cx + R - 22, cy, r: 11, fill: LINE, stroke: '#fff', 'stroke-width': 2.5 }, sv);
  svgEl('circle', { cx, cy, r: 8, fill: INK }, sv);
  const set = (m) => { const [x2, y2] = pt(Math.atan(m) / DEG, R - 22); needle.setAttribute('x2', x2); needle.setAttribute('y2', y2); grip.setAttribute('cx', x2); grip.setAttribute('cy', y2); };
  let drag = false;
  const move = (e) => {
    const r = sv.getBoundingClientRect(), k = r.width / DW, px = (e.clientX - r.left) / k, py = (e.clientY - r.top) / k;
    let a = Math.atan2(cy - py, Math.max(px - cx, 0.01)) / DEG; a = Math.max(-80, Math.min(80, a));
    let best = M_SNAP[0], bd = 1e9; M_SNAP.forEach((q) => { const dd = Math.abs(Math.atan(q[0] / q[1]) / DEG - a); if (dd < bd) { bd = dd; best = q; } });
    onSet(best);
  };
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); drag = true; try { el.setPointerCapture(e.pointerId); } catch (er) { /* */ } move(e); });
  el.addEventListener('pointermove', (e) => { if (drag) move(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => el.addEventListener(t, () => { drag = false; }));
  return { el, set };
}
/** the b dial: a round knob, b = −6 … 6. onSet(b) on drag */
function bDial(host, onSet) {
  const DW = 220, DH = 284, cx = 110, cy = 152, R = 102;
  const el = box(h('div', 'u7l1-dial u7l1-dial-b'), DW, DH); el.setAttribute('data-tap', ''); host.appendChild(el);
  const sv = svgEl('svg', { width: DW, height: DH, viewBox: `0 0 ${DW} ${DH}` }, el);
  const hl = h('div', 'bk-html'); el.appendChild(hl);
  const pt = (a, r) => [cx + r * Math.cos(a * DEG), cy - r * Math.sin(a * DEG)];
  const angB = (b) => 90 - B_STEP * b;
  svgEl('circle', { cx, cy, r: R, fill: '#eef8f3', stroke: '#a9d8c2', 'stroke-width': 2 }, sv);
  for (let b = B_MIN; b <= B_MAX; b++) {
    const [x0, y0] = pt(angB(b), R - (b % 2 ? 6 : 11)), [x1, y1] = pt(angB(b), R);
    svgEl('line', { x1: x0, y1: y0, x2: x1, y2: y1, stroke: INK, 'stroke-width': b % 2 ? 1.4 : 2.2 }, sv);
    const [lx, ly] = pt(angB(b), R - 25); const t = h('div', 'bk-lab u7l1-dtick', T(String(b))); hl.appendChild(t); place(t, lx, ly, 'c', 0);
  }
  const nm = h('div', 'bk-lab u7l1-dname', `${T(cB('b'))} slides`); hl.appendChild(nm); place(nm, 4, 2, 'se', 0);
  const knob = svgEl('circle', { cx, cy, r: 34, fill: '#fff', stroke: BC, 'stroke-width': 3 }, sv);
  void knob;
  const ptr = svgEl('line', { x1: cx, y1: cy, x2: cx, y2: cy - 52, stroke: BC, 'stroke-width': 6, 'stroke-linecap': 'round' }, sv);
  const grip = svgEl('circle', { cx, cy: cy - 52, r: 11, fill: BC, stroke: '#fff', 'stroke-width': 2.5 }, sv);
  svgEl('circle', { cx, cy, r: 7, fill: INK }, sv);
  const set = (b) => { const [x2, y2] = pt(angB(b), 52); ptr.setAttribute('x2', x2); ptr.setAttribute('y2', y2); grip.setAttribute('cx', x2); grip.setAttribute('cy', y2); };
  let drag = false;
  const move = (e) => {
    const r = sv.getBoundingClientRect(), k = r.width / DW, px = (e.clientX - r.left) / k, py = (e.clientY - r.top) / k;
    const a = Math.atan2(cy - py, px - cx) / DEG; let dd = 90 - a; while (dd > 180) dd -= 360; while (dd <= -180) dd += 360;
    onSet(Math.max(B_MIN, Math.min(B_MAX, Math.round(dd / B_STEP))));
  };
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); drag = true; try { el.setPointerCapture(e.pointerId); } catch (er) { /* */ } move(e); });
  el.addEventListener('pointermove', (e) => { if (drag) move(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => el.addEventListener(t, () => { drag = false; }));
  return { el, set };
}
const DL = {
  tilt: { label: 'Turn m', m: [1, 1], b: 1 },
  slide: { label: 'Turn b', m: [1, 2], b: 0 },
  ex3: { label: 'Example 3 check', m: [1, 1], b: 0 }
};
const dials = {
  title: 'Two dials: m tilts the line, b slides it',
  height: 500,
  choices: Object.keys(DL).map((k) => ({ v: k, label: DL[k].label })),
  intro: 'Press <b>Next</b> to turn the dials, or <b>drag either dial</b> yourself at any time.',
  make(stage, k, ex) {
    const d = DL[k];
    const G = new Graph(stage, { x: 14, y: 14, width: 470, height: 470, xmin: -8.5, xmax: 8.5, ymin: -8.5, ymax: 8.5, xlabels: 2, ylabels: 2 });
    const PX = 498, P = panel(stage, PX, 14, ex.W - PX - 14, 470, '', 'u7l1-dialp');
    const eqb = h('div', 'u7l1-eqbox u7l1-eqbig'); P.appendChild(eqb);
    const row = h('div', 'u7l1-dials'); P.appendChild(row);
    const st = { m: qv(d.m), mq: d.m, b: d.b };
    let tri = null;
    const Lc = dynLine(G, () => ({ m: st.m, b: st.b }));
    const dot = G.point(0, st.b, { color: BC, r: 8.5 });
    const dl = G.label(0, st.b, '', { pos: 'w', cls: 'bk-ptlab u7l1-bint', gap: 12 });
    const hint = h('div', 'u7l1-dhint', 'drag a dial: the line follows'); P.appendChild(hint);
    const setTri = () => { if (tri) tri.remove(); tri = null; const [a, b] = st.mq; if (a !== 0) tri = new SlopeTri(G, { x: 0, y: st.b, run: b, rise: a }); };
    const render = (exact) => {
      Lc._bkDraw(); G.moveTo(dot, 0, st.b); dl.gx = 0; dl.gy = st.b; dl._bkDraw();
      dl.innerHTML = T(pairTex(0, Math.round(st.b * 100) / 100));
      mD.set(st.m); bD.set(st.b);
      if (exact) { eqb.innerHTML = T(eqTex(st.mq, st.b, { big: true })); setTri(); } else if (tri) { tri.remove(); tri = null; }
    };
    const mD = mDial(row, (q) => { st.mq = q; st.m = qv(q); render(true); });
    const bD = bDial(row, (b) => { st.b = b; render(true); });
    render(true);
    const ghosts = [];
    const ghost = () => { const g = G.line({ m: st.m, b: st.b }, { color: GRAY, width: 2.5, arrows: false }); g.style.opacity = 0.55; ghosts.push(g); };
    const to = async (c, mq, b, ms = 1300) => {
      const a0 = Math.atan(st.m), a1 = Math.atan(qv(mq)), b0 = st.b;
      if (tri) { tri.remove(); tri = null; }
      eqb.innerHTML = T(eqTex(mq, b, { big: true }));
      await tween(c, ms, (t) => { st.m = Math.tan(a0 + (a1 - a0) * t); st.b = b0 + (b - b0) * t; render(false); });
      st.m = qv(mq); st.mq = mq; st.b = b; render(true);
      await pulse(c, eqb, 1.06);
      if (tri) await tri.drawIn(c, 280);
    };
    if (k === 'tilt') {
      return [
        { cap: `Start with ${T('y=x+1')}: slope ${T(cM('1'))}, y-intercept ${T(cB('1'))}.`, run: async (c) => { await G.drawIn(Lc, 600, c); await pop(c, dot); await pulse(c, eqb, 1.06); } },
        { cap: `Turn <b>m</b> up to ${T(cM('2'))}: <b>steeper</b>. Rise ${T(cR('2'))} for every run ${T(cU('1'))}.`, run: async (c) => { ghost(); await to(c, [2, 1], 1); } },
        { cap: `Turn it down to ${T(cM('\\tfrac{1}{3}'))}: a gentle climb, rise ${T(cR('1'))} per run ${T(cU('3'))}.`, run: async (c) => { ghost(); await to(c, [1, 3], 1); } },
        { cap: `${T(cM('m=0'))}: <b>flat</b>. The equation is just ${T('y=1')}, a horizontal line.`, run: async (c) => { ghost(); await to(c, [0, 1], 1); } },
        { cap: `Past zero, ${T('m')} is <b>negative</b> and the line <b>falls</b>: ${T(cM('m=-\\tfrac{3}{2}'))}, down ${T(cR('3'))} for every ${T(cU('2'))} across.`, run: async (c) => { ghost(); await to(c, [-3, 2], 1); } },
        { cap: `Every line pivoted about ${T('(0,\\,1)')}. Turning ${T(cM('m'))} changes the <b>tilt</b>; the y-intercept never moved.`, run: async (c) => { ghost(); await pulse(c, dot, 1.6, 600); await pulse(c, dl, 1.15); } }
      ];
    }
    if (k === 'slide') {
      return [
        { cap: `Start with ${T('y=\\tfrac{1}{2}x')}: here ${T(cB('b=0'))}, so the line passes through the origin.`, run: async (c) => { await G.drawIn(Lc, 600, c); await pop(c, dot); await pulse(c, eqb, 1.06); } },
        { cap: `Turn <b>b</b> to ${T(cB('3'))}: the whole line slides <b>up 3</b>. Same tilt: still ${T(cM('\\tfrac{1}{2}'))}.`, run: async (c) => { ghost(); await to(c, [1, 2], 3); } },
        { cap: `Turn b to ${T(cB('-4'))}: it slides <b>down</b>. The green dot rides the ${T('y')}-axis: it is always ${T('(0,\\,b)')}.`, run: async (c) => { ghost(); await to(c, [1, 2], -4); } },
        { cap: `Same slope ${T(cM('\\tfrac{1}{2}'))} every time, so the copies are <b>parallel</b>. Turning ${T(cB('b'))} only <b>slides</b> the line.`, run: async (c) => { ghost(); await pulse(c, eqb, 1.06); } }
      ];
    }
    // Example 3 check
    let t1 = null, t2 = null;
    return [
      { cap: `Example 3’s two lines, dashed. Can the dials land on them?`,
        run: async (c) => { t1 = G.line({ m: 3, b: -2 }, { color: LINE, width: 3, dash: '10 8' }); t2 = G.line({ m: -1.5, b: 4 }, { color: RED, width: 3, dash: '10 8' }); await G.drawIn(t1, 500, c); await G.drawIn(t2, 500, c); } },
      { cap: `Dial ${T(cM('m=3'))} and ${T(cB('b=-2'))}: the line lands exactly on ${T('y=3x-2')}.`, run: async (c) => { await to(c, [3, 1], -2, 1500); } },
      { cap: `Dial ${T(cM('m=-\\tfrac{3}{2}'))} and ${T(cB('b=4'))}: exactly on ${T('y=-\\tfrac{3}{2}x+4')}.`, run: async (c) => { await to(c, [-3, 2], 4, 1500); } },
      { cap: `The conjecture holds: in ${T('y=mx+b')}, ${T(cM('m'))} is the <b>slope</b> and ${T(cB('b'))} is the <b>y-intercept</b>.`,
        run: async (c) => { const s = stamp(stage, 'slope m, y-int b', { ok: true, x: 140, y: 400 }); await stampIn(c, s); void t1; void t2; } }
    ];
  }
};

/* =============================== explainer: keep the balance =============================== */
class Balance {
  constructor(stage, x, y, w = 560, hh = 252) {
    this.el = add(stage, box(h('div', 'u7l1-bal'), w, hh), x, y);
    const sv = this.svg = svgEl('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, this.el);
    this.cx = w / 2; this.cy = 34; this.R = 158; this.hang = 120; this.th = 0;
    svgEl('path', { d: `M${this.cx - 8} ${this.cy} L${this.cx + 8} ${this.cy} L${this.cx + 10} ${hh - 22} L${this.cx - 10} ${hh - 22} Z`, fill: '#cfc7b5' }, sv);
    svgEl('path', { d: `M${this.cx - 70} ${hh - 4} L${this.cx + 70} ${hh - 4} L${this.cx + 40} ${hh - 24} L${this.cx - 40} ${hh - 24} Z`, fill: '#b9b0a0' }, sv);
    this.parts = [0, 1].map(() => ({
      s1: svgEl('line', { stroke: '#8a8f99', 'stroke-width': 2 }, sv), s2: svgEl('line', { stroke: '#8a8f99', 'stroke-width': 2 }, sv),
      pan: svgEl('path', { fill: '#e9e4d8', stroke: INK, 'stroke-width': 2.5 }, sv),
      txt: add(this.el, h('div', 'u7l1-pan'), 0, 0), div: hide(add(this.el, h('div', 'u7l1-div'), 0, 0))
    }));
    this.beam = svgEl('line', { stroke: INK, 'stroke-width': 9, 'stroke-linecap': 'round' }, sv);
    svgEl('circle', { cx: this.cx, cy: this.cy, r: 9, fill: '#fff', stroke: INK, 'stroke-width': 3 }, sv);
    this.draw();
  }
  draw() {
    const { cx, cy, R, hang } = this, a = this.th * DEG, dx = R * Math.cos(a), dy = R * Math.sin(a);
    const ends = [[cx - dx, cy - dy], [cx + dx, cy + dy]];
    this.beam.setAttribute('x1', ends[0][0]); this.beam.setAttribute('y1', ends[0][1]); this.beam.setAttribute('x2', ends[1][0]); this.beam.setAttribute('y2', ends[1][1]);
    this.parts.forEach((p, i) => {
      const [ex, ey] = ends[i], py = ey + hang, hw = 104;
      p.s1.setAttribute('x1', ex); p.s1.setAttribute('y1', ey); p.s1.setAttribute('x2', ex - hw + 6); p.s1.setAttribute('y2', py);
      p.s2.setAttribute('x1', ex); p.s2.setAttribute('y1', ey); p.s2.setAttribute('x2', ex + hw - 6); p.s2.setAttribute('y2', py);
      p.pan.setAttribute('d', `M${ex - hw} ${py} Q${ex} ${py + 30} ${ex + hw} ${py} Z`);
      p.txt.style.left = ex + 'px'; p.txt.style.top = (py + 2) + 'px';
      p.div.style.left = ex + 'px'; p.div.style.top = (py + 22) + 'px';
    });
  }
  async set(c, L, R) { const ps = this.parts; if (L != null) ps[0].txt.innerHTML = T(L); if (R != null) ps[1].txt.innerHTML = T(R); await Promise.all([L != null && pop(c, ps[0].txt, 320), R != null && pop(c, ps[1].txt, 320)]); }
  async divs(c, txt) { for (const p of this.parts) { p.div.textContent = txt; await pop(c, p.div, 260); } }
  undiv() { this.parts.forEach((p) => hide(p.div)); }
  tilt(c, deg, ms = 700) { const a = this.th; return tween(c, ms, (t) => { this.th = a + (deg - a) * t; this.draw(); }); }
}
const BL = {
  ex4: { label: 'Example 4 check', win: [-6.5, 6.5, -6.5, 6.5] },
  trap: { label: 'Trap: only some terms', win: [-6.5, 6.5, -6.5, 6.5] },
  ex5b: { label: 'Example 5(b): reorder', win: [-2.5, 16.5, -2.5, 12.5], xl: 2 },
  ex5c: { label: 'Example 5(c) check', win: [-4.5, 4.5, -4.5, 4.5] }
};
const balance = {
  title: 'Get y alone, and keep the balance',
  height: 470,
  choices: Object.keys(BL).map((k) => ({ v: k, label: BL[k].label })),
  intro: 'An equation is a balance. Whatever you do to one side, do to the <b>whole</b> other side. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = BL[k], [x0, x1, y0, y1] = d.win;
    const B = new Balance(stage, 14, 8);
    const alg = panel(stage, 14, 272, 560, 184, '', 'u7l1-alg');
    const GX = 590, GW = Math.min(440, ex.W - GX - 14), GH = Math.min(440, Math.round(GW * (y1 - y0) / (x1 - x0)));
    const G = new Graph(stage, { x: GX, y: 14 + Math.round((440 - GH) / 2), width: GW, height: GH, xmin: x0, xmax: x1, ymin: y0, ymax: y1, xlabels: d.xl || 2, ylabels: 2, fontSize: 15 });
    const L = (html) => line(alg, html);
    const okDot = (b) => G.point(0, b, { color: BC, r: 8, label: T(pairTex(0, b)), pos: 'nw', labelCls: 'u7l1-bint' });
    if (k === 'ex4') {
      let wrong = null, no = null;
      return [
        { cap: `${T('3y=6x-9')}: the two sides balance. Can we read ${T('m=6')} and ${T('b=-9')} straight off?`,
          run: async (c) => { await B.set(c, '3y', '6x-9'); L(T('3y=6x-9')); await G.drawIn(G.line({ m: 2, b: -3 }, { color: LINE, width: 4.5 }), 600, c); G.point(0, -3, { color: INK, r: 6 }); G.point(2, 1, { color: INK, r: 6 }); } },
        { cap: `No: ${T('y=6x-9')} would be this red line, far too steep, crossing at ${T('-9')} (off the grid).`,
          run: async (c) => { wrong = G.line({ m: 6, b: -9 }, { color: RED, width: 3.5, dash: true }); await G.drawIn(wrong, 600, c); no = stamp(stage, '✗', { ok: false, x: GX + 90, y: 70 }); await stampIn(c, no); } },
        { cap: `The 6 and the ${T('-9')} belong to ${T('3y')}: <b>three</b> ${T('y')}’s. Divide by 3, and to keep the balance, divide <b>every term</b>.`,
          run: async (c) => { G.remove(wrong); if (no) no.remove(); await B.divs(c, '÷ 3'); await B.set(c, `\\dfrac{3y}{${cR('3')}}`, `\\dfrac{6x}{${cR('3')}}-\\dfrac{9}{${cR('3')}}`); L(T(`\\dfrac{3y}{${cR('3')}}=\\dfrac{6x}{${cR('3')}}-\\dfrac{9}{${cR('3')}}`)); } },
        { cap: `${T(eqTex(2, -3))}: still balanced. Now ${T(cM('m=2'))} and ${T(cB('b=-3'))}, and they fit the graph.`,
          run: async (c) => { B.undiv(); await B.set(c, 'y', '2x-3'); L(T(eqTex(2, -3))); await G.reveal(okDot(-3), c); const t = new SlopeTri(G, { x: 0, y: -3, run: 1, rise: 2 }); await t.drawIn(c); } },
        { cap: `Check the point ${T('(2,\\,1)')} from the graph in the original equation: both sides give ${T('3')}.`,
          run: async (c) => { B.el.style.opacity = 0; const k2 = checkCard(stage, { at: '(2,\\,1)', left: { tex: '3y', sub: '3(1)', f: ({ y }) => 3 * y }, right: { tex: '6x-9', sub: '6(2)-9', f: ({ x }) => 6 * x - 9 }, values: { x: 2, y: 1 }, hidden: true, x: 34, y: 10, width: 520 }); await k2.play(c); } }
      ];
    }
    if (k === 'trap') {
      let wrong = null, no = null;
      return [
        { cap: `${T('2y=4x+6')} balances. Its graph is the blue line. Divide by 2…`,
          run: async (c) => { await B.set(c, '2y', '4x+6'); L(T('2y=4x+6')); await G.drawIn(G.line({ m: 2, b: 3 }, { color: LINE, width: 4.5 }), 600, c); } },
        { cap: `…but only <b>some</b> of the terms: ${T('y=2x+6')}. The balance <b>tips</b>, and the red line misses the graph.`,
          run: async (c) => { await B.set(c, `\\dfrac{2y}{${cR('2')}}`, `\\dfrac{4x}{${cR('2')}}+6`); await B.tilt(c, 9, 700); L(`${T('y=2x+6')} ✗`); wrong = G.line({ m: 2, b: 6 }, { color: RED, width: 3.5, dash: true }); await G.drawIn(wrong, 600, c); no = stamp(stage, '✗', { ok: false, x: GX + 90, y: 70 }); await stampIn(c, no); } },
        { cap: `Divide <b>every</b> term by 2, the 6 too. Level again.`,
          run: async (c) => { G.remove(wrong); if (no) no.remove(); await B.set(c, null, `\\dfrac{4x}{${cR('2')}}+\\dfrac{6}{${cR('2')}}`); await B.tilt(c, 0, 600); L(T(`\\dfrac{2y}{${cR('2')}}=\\dfrac{4x}{${cR('2')}}+\\dfrac{6}{${cR('2')}}`)); } },
        { cap: `${T(eqTex(2, 3))}: ${T(cM('m=2'))}, ${T(cB('b=3'))}, right on the blue line.`,
          run: async (c) => { await B.set(c, 'y', '2x+3'); L(`${T(eqTex(2, 3))} ✓`); await G.reveal(okDot(3), c); const t = new SlopeTri(G, { x: 0, y: 3, run: 1, rise: 2 }); await t.drawIn(c); } }
      ];
    }
    if (k === 'ex5b') {
      return [
        { cap: `${T('y=9-\\tfrac{3}{5}x')} is already solved for ${T('y')}, but the terms are in the wrong order for ${T('y=mx+b')}.`,
          run: async (c) => { await B.set(c, 'y', '9-\\tfrac{3}{5}x'); L(T('y=9-\\tfrac{3}{5}x')); } },
        { cap: `Swap them. Each term takes <b>its own sign</b> along: ${T('-\\tfrac{3}{5}x')} to the front, ${T('+9')} to the back.`,
          run: async (c) => { await B.set(c, null, `${cM('-\\tfrac{3}{5}x')}+${cB('9')}`); L(T(eqTex([-3, 5], 9))); } },
        { cap: `Slope ${T(cM('-\\tfrac{3}{5}'))}, y-intercept ${T(cB('9'))}: start at ${T('(0,\\,9)')}, then down ${T(cR('3'))}, right ${T(cU('5'))}.`,
          run: async (c) => { await G.drawIn(G.line({ m: -0.6, b: 9 }, { color: LINE, width: 4.5 }), 600, c); await G.reveal(G.point(0, 9, { color: BC, r: 8, label: T('(0,\\,9)'), pos: 'ne', labelCls: 'u7l1-bint' }), c); const t = new SlopeTri(G, { x: 0, y: 9, run: 5, rise: -3 }); await t.drawIn(c); L(`slope ${T(cM('-\\tfrac{3}{5}'))}, y-intercept ${T(cB('9'))}`); } }
      ];
    }
    // ex5c
    return [
      { cap: `${T('8y=6x+3')}: <b>eight</b> ${T('y')}’s. Divide <b>every term</b> by 8.`,
        run: async (c) => { await B.set(c, '8y', '6x+3'); L(T('8y=6x+3')); await B.divs(c, '÷ 8'); await B.set(c, `\\dfrac{8y}{${cR('8')}}`, `\\dfrac{6x}{${cR('8')}}+\\dfrac{3}{${cR('8')}}`); } },
      { cap: `${T('y=\\dfrac{6}{8}x+\\dfrac{3}{8}')}, and ${T('\\dfrac{6}{8}')} reduces to ${T('\\dfrac{3}{4}')}.`,
        run: async (c) => { B.undiv(); await B.set(c, 'y', '\\dfrac{6}{8}x+\\dfrac{3}{8}'); L(T('y=\\dfrac{6}{8}x+\\dfrac{3}{8}')); } },
      { cap: `${T(eqTex([3, 4], [3, 8]))}: slope ${T(cM('\\tfrac{3}{4}'))}, y-intercept ${T(cB('\\tfrac{3}{8}'))}, just above the origin.`,
        run: async (c) => { await B.set(c, 'y', eqTex([3, 4], [3, 8]).slice(2)); L(T(eqTex([3, 4], [3, 8], { big: true }))); await G.drawIn(G.line({ m: 0.75, b: 0.375 }, { color: LINE, width: 4.5 }), 600, c); await G.reveal(G.point(0, 0.375, { color: BC, r: 8, label: T('(0,\\,\\tfrac{3}{8})'), pos: 'nw', labelCls: 'u7l1-bint' }), c); const t = new SlopeTri(G, { x: 0, y: 0.375, run: 4, rise: 3 }, { riseSide: 'w' }); await t.drawIn(c); } }
    ];
  }
};

/* =============================== explainer: plot b, then step rise / run =============================== */
const SG = {
  pos: { label: T('y=\\tfrac{2}{3}x+1'), m: [2, 3], b: 1,
    hops: [{ from: [0, 1], run: 3, rise: 2 }, { from: [3, 3], run: 3, rise: 2 }, { from: [0, 1], run: -3, rise: -2, back: true }, { from: [-3, -1], run: -3, rise: -2, back: true }] },
  neg: { label: 'Negative: ' + T('y=-\\tfrac{3}{4}x+2'), m: [-3, 4], b: 2, two: true,
    hops: [{ from: [0, 2], run: 4, rise: -3 }, { from: [0, 2], run: -4, rise: 3, alt: true }] },
  ex6a: { label: 'Example 6(a) check', m: [3, 1], b: -4, ex: true,
    hops: [{ from: [0, -4], run: 1, rise: 3 }, { from: [1, -1], run: 1, rise: 3 }, { from: [0, -4], run: -1, rise: -3, back: true }] }
};
const stepGraph = {
  title: 'Plot b, then step rise over run',
  height: 500,
  choices: Object.keys(SG).map((k) => ({ v: k, label: SG[k].label })),
  intro: 'Two numbers draw the whole line: <b>b</b> says where to start, <b>m</b> says how to step. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = SG[k], [mn, md] = d.m, b = d.b;
    const G = new Graph(stage, { x: 14, y: 14, width: 470, height: 470, xmin: -8.5, xmax: 8.5, ymin: -8.5, ymax: 8.5, xlabels: 2, ylabels: 2 });
    const PX = 500, P = panel(stage, PX, 14, ex.W - PX - 14, 470, d.ex ? 'Example 6(a)' : 'Graph it');
    const eqb = h('div', 'u7l1-eqbox', T(eqTex(d.m, b, { big: true }))); P.appendChild(eqb);
    const ro = h('div', 'u7l1-ro'); P.appendChild(ro);
    const mFrac = d.two ? `\\dfrac{${cR('-3')}}{${cU('4')}}\\ \\text{or}\\ \\dfrac{${cR('3')}}{${cU('-4')}}` : `\\dfrac{${cR(String(mn))}}{${cU(String(md))}}`;
    ro.innerHTML = `<div class="u7l1-ro-r u7l1-ro-b"><span class="u7l1-ro-k">start</span><b>?</b></div><div class="u7l1-ro-r u7l1-ro-m"><span class="u7l1-ro-k">step</span><b>?</b></div>`;
    const [vB, vM] = ro.querySelectorAll('b');
    const lst = h('div', 'u7l1-plist'); P.appendChild(lst);
    const pts = [[0, b]];
    const addPt = (p) => { const s = h('span', 'u7l1-xchip', T(pairTex(p[0], p[1]))); lst.appendChild(s); return s; };
    const tris = [];
    const mLine = md === 1 ? `${T(cM(`m=${mn}=\\tfrac{${mn}}{1}`))}` : T(cM('m=' + fr(mn, md)));
    const steps = [
      { cap: `${T(eqTex(d.m, b))}: ${mLine}, so ${mn < 0 ? 'down' : 'up'} ${T(cR(String(Math.abs(mn))))} for every ${T(cU(String(md)))} across; ${T(cB('b=' + b))}.`,
        run: async (c) => { vB.innerHTML = T(cB(pairTex(0, b))); vM.innerHTML = T(mFrac); await pulse(c, ro, 1.04); } },
      { cap: `Plot the y-intercept ${T(pairTex(0, b))} first.`,
        run: async (c) => { await G.reveal(G.point(0, b, { color: BC, r: 8.5, label: T(pairTex(0, b)), pos: 'w', labelCls: 'u7l1-bint' }), c); await pop(c, addPt([0, b])); } }
    ];
    d.hops.forEach((hp, i) => {
      const to = [hp.from[0] + hp.run, hp.from[1] + hp.rise]; pts.push(to);
      const dir = `${hp.run > 0 ? 'right' : 'left'} ${T(cU(String(Math.abs(hp.run))))}, ${hp.rise > 0 ? 'up' : 'down'} ${T(cR(String(Math.abs(hp.rise))))}`;
      let cap;
      if (d.two) cap = hp.alt ? `Or read it as ${T(`\\dfrac{3}{-4}`)}: ${dir} from ${T(pairTex(0, b))}, landing on ${T(pairTex(to[0], to[1]))}.` : `Read ${T('-\\tfrac{3}{4}')} as ${T(`\\dfrac{-3}{4}`)}: ${dir}, landing on ${T(pairTex(to[0], to[1]))}.`;
      else if (hp.back) cap = `${i === d.hops.findIndex((q) => q.back) ? 'Step backwards too' : 'Again'}: ${dir}, to ${T(pairTex(to[0], to[1]))}.`;
      else cap = `${i ? 'Again' : 'From there'}: ${dir}, to ${T(pairTex(to[0], to[1]))}.`;
      steps.push({ cap, run: async (c) => {
        tris.forEach((q) => q.quiet());
        const t = new SlopeTri(G, { x: hp.from[0], y: hp.from[1], run: hp.run, rise: hp.rise }, { fillOp: 0.06, words: true }); tris.push(t);
        await t.drawIn(c, 380); await G.reveal(G.point(to[0], to[1], { color: INK, r: 6.5 }), c); await pop(c, addPt(to));
      } });
    });
    steps.push({ cap: d.two ? `Both steps land on the <b>same line</b>. Join the points: the graph of ${T(eqTex(d.m, b))}.` : `Join the points with a ruler: the graph of ${T(eqTex(d.m, b))}.`,
      run: async (c) => {
        tris.forEach((q) => q.quiet()); await G.drawIn(G.line({ m: mn / md, b }, { color: LINE, width: 4.5 }), 800, c);
        const r = h('div', 'u7l1-rulebox', `<b>1.</b> Plot ${T(cB('(0,\\,b)'))}<br><b>2.</b> Step ${T(`\\tfrac{${cR('\\text{rise}')}}{${cU('\\text{run}')}}`)}, both ways<br><b>3.</b> Join with a ruler`); P.appendChild(r); await pop(c, r);
      } });
    return steps;
  }
};

/* =============================== explainer: two intercepts =============================== */
const IC = {
  ex6b: { label: 'Example 6(b) check', m: [5, 6], b: -5, xi: 6, ex: true,
    xsolve: ['0=\\tfrac{5}{6}x-5', '5=\\tfrac{5}{6}x', 'x=5\\times\\tfrac{6}{5}=6'], xcap: `Add 5 to both sides, then multiply both sides by ${T('\\tfrac{6}{5}')}: ${T('x=6')}.` },
  neg: { label: T('y=-2x+6'), m: [-2, 1], b: 6, xi: 3,
    xsolve: ['0=-2x+6', '2x=6', 'x=3'], xcap: `Add ${T('2x')} to both sides, then divide by 2: ${T('x=3')}.` }
};
const intercepts = {
  title: 'Two intercepts, one line',
  height: 500,
  choices: Object.keys(IC).map((k) => ({ v: k, label: IC[k].label })),
  intro: 'Every point on the <b>y-axis</b> has <b>x = 0</b>; every point on the <b>x-axis</b> has <b>y = 0</b>. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = IC[k], [mn, md] = d.m, b = d.b, xi = d.xi, mt = fr(mn, md);
    const G = new Graph(stage, { x: 14, y: 14, width: 470, height: 470, xmin: -8.5, xmax: 8.5, ymin: -8.5, ymax: 8.5, xlabels: 2, ylabels: 2 });
    const PX = 500, P = panel(stage, PX, 14, ex.W - PX - 14, 470, d.ex ? 'Example 6(b)' : 'Find both intercepts');
    const eqb = h('div', 'u7l1-eqbox', T(eqTex(d.m, b, { big: true }))); P.appendChild(eqb);
    const alg = h('div', 'u7l1-alg'); P.appendChild(alg);
    const band = (axis, color) => {
      const g = svgEl('g', {}, G.layers.bg);
      const [ax, ay] = G.toPx(0, 0), [x0, y0] = G.toPx(G.win.xmin, G.win.ymax), [x1, y1] = G.toPx(G.win.xmax, G.win.ymin);
      if (axis === 'y') svgEl('rect', { x: ax - 9, y: y0, width: 18, height: y1 - y0, fill: color, 'fill-opacity': 0.22 }, g);
      else svgEl('rect', { x: x0, y: ay - 9, width: x1 - x0, height: 18, fill: color, 'fill-opacity': 0.22 }, g);
      return g;
    };
    const L = (html, cls = '') => line(alg, html, cls);
    let bY = null;
    return [
      { cap: `${T(eqTex(d.m, b))}: find where the line crosses <b>each axis</b>, then join the two points.`, run: (c) => pulse(c, eqb, 1.06) },
      { cap: `On the ${T('y')}-axis, ${T('x=0')}: ${T(`y=${mt}(${cB('0')})${b < 0 ? '-' : '+'}${Math.abs(b)}=${b}`)}. The y-intercept is ${T(cB(String(b)))}.`,
        run: async (c) => { bY = band('y', BC); await appear(c, bY, 300); L(`${T('x=0')}: ${T(`y=${mt}(0)${b < 0 ? '-' : '+'}${Math.abs(b)}=${cB(String(b))}`)}`); await G.reveal(G.point(0, b, { color: BC, r: 8.5, label: T(pairTex(0, b)), pos: 'w', labelCls: 'u7l1-bint' }), c); } },
      { cap: `On the ${T('x')}-axis, ${T('y=0')}: ${T(d.xsolve[0])}.`,
        run: async (c) => { if (bY) bY.style.opacity = 0.3; await appear(c, band('x', RUN), 300); L(`${T('y=0')}: ${T(d.xsolve[0])}`); } },
      { cap: d.xcap,
        run: async (c) => { for (const s of d.xsolve.slice(1)) await show(c, L(T(s))); await G.reveal(G.point(xi, 0, { color: INK, r: 8, label: T(pairTex(xi, 0)), pos: mn > 0 ? 'nw' : 'ne' }), c); } },
      { cap: `Join ${T(pairTex(0, b))} and ${T(pairTex(xi, 0))}.`, run: (c) => G.drawIn(G.line({ m: mn / md, b }, { color: LINE, width: 4.5 }), 800, c) },
      { cap: `Check: from ${T(pairTex(0, b))} to ${T(pairTex(xi, 0))} is run ${T(cU(String(xi)))}, rise ${T(cR(String(-b)))}: slope ${T(red(-b, xi)[1] === xi ? `\\tfrac{${-b}}{${xi}}` : `\\tfrac{${-b}}{${xi}}=${mt}`)}, the same as ${T(cM('m'))} ✓.`,
        run: async (c) => { const t = new SlopeTri(G, { x: 0, y: b, run: xi, rise: -b }, { fillOp: 0.06 }); await t.drawIn(c, 450); L(`slope ${T(`\\dfrac{${-b}}{${xi}}=${fr(mn, md, true)}`)} ✓`, 'u7l1-soft'); } }
    ];
  }
};

/* =============================== explainer: which line is which? =============================== */
const MT = {
  sign: { label: 'b first, then the sign of m', lines: [
    { k: 'A', m: [-3, 1], b: -2, col: RED, lab: [-2.0, 4.6, 'w'] },
    { k: 'B', m: [2, 1], b: 1, col: LINE, lab: [2.3, 5.2, 'e'] },
    { k: 'C', m: [1, 3], b: -2, col: COLORS.teal, lab: [5.6, -0.3, 'n'] },
    { k: 'D', m: [-2, 1], b: 1, col: COLORS.orange, lab: [3.4, -5.4, 'e'] }],
  order: ['B', 'D', 'C', 'A'] },
  steep: { label: 'Same b: which is steeper?', lines: [
    { k: 'A', m: [1, 3], b: -1, col: COLORS.teal, lab: [5.6, 0.9, 'n'] },
    { k: 'B', m: [-2, 1], b: 3, col: COLORS.orange, lab: [4.2, -5.3, 'e'] },
    { k: 'C', m: [3, 1], b: -1, col: LINE, lab: [2.1, 5.3, 'e'] },
    { k: 'D', m: [-1, 2], b: 3, col: RED, lab: [-5.2, 5.0, 's'] }],
  order: ['C', 'A', 'D', 'B'] }
};
const match = {
  title: 'Which line is which?',
  height: 470,
  choices: Object.keys(MT).map((k) => ({ v: k, label: MT[k].label })),
  intro: 'Four equations, four lines. Read <b>b</b> to find where each one crosses, then <b>m</b> to pick the tilt. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = MT[k];
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5, xlabels: 2, ylabels: 2 });
    const els = {};
    d.lines.forEach((L) => {
      const ln = G.line({ m: qv(L.m), b: L.b }, { color: L.col, width: 4 });
      const lb = G.label(L.lab[0], L.lab[1], L.k, { pos: L.lab[2], cls: 'bk-ptlab u7l1-lname', color: L.col });
      els[L.k] = [ln, lb];
    });
    const PX = 474, P = panel(stage, PX, 14, ex.W - PX - 14, 440, 'Match each equation');
    const cards = h('div', 'u7l1-cards'); P.appendChild(cards);
    const byK = Object.fromEntries(d.lines.map((L) => [L.k, L]));
    const cardEls = d.order.map((kk) => { const L = byK[kk]; const cd = h('div', 'u7l1-mcard', `${T(eqTex(L.m, L.b))}<span class="u7l1-mto">→ ?</span>`); cards.appendChild(cd); return cd; });
    const dim = (keep) => d.lines.forEach((L) => els[L.k].forEach((e) => { e.style.opacity = keep.includes(L.k) ? 1 : 0.15; }));
    let ring = null;
    const steps = d.order.map((kk, i) => {
      const L = byK[kk], bv = L.b, same = d.lines.filter((q) => q.b === bv).map((q) => q.k), other = byK[same.find((q) => q !== kk)];
      const mv = qv(L.m), ov = qv(other.m);
      const why = Math.sign(mv) !== Math.sign(ov) ? `${T('m=' + qt(L.m))} is ${mv > 0 ? 'positive (it <b>rises</b>)' : 'negative (it <b>falls</b>)'}`
        : `both ${mv > 0 ? 'rise' : 'fall'}; ${T('|m|=' + qt(qabs(L.m)))} is the ${Math.abs(mv) > Math.abs(ov) ? '<b>steeper</b>' : '<b>gentler</b>'} one`;
      return {
        cap: `${T(eqTex(L.m, L.b))}: ${T(cB('b=' + bv))}, so it crosses at ${T(pairTex(0, bv))}: ${same.join(' or ')}. ${why[0].toUpperCase() + why.slice(1)}: <b>${kk}</b>.`,
        run: async (c) => {
          cardEls.forEach((e) => e.classList.remove('on')); cardEls[i].classList.add('on');
          if (ring) G.remove(ring); ring = G.point(0, bv, { color: BC, r: 9 }); await pop(c, ring);
          dim(same); await sleep(c, 400); dim([kk]); await pulse(c, els[kk][1], 1.3);
          const to = cardEls[i].querySelector('.u7l1-mto'); to.textContent = '→ ' + kk; to.style.color = L.col; await pop(c, to);
        }
      };
    });
    steps.push({ cap: `Read ${T(cB('b'))} first: it narrows the choice to the lines through ${T('(0,\\,b)')}. Then the sign and size of ${T(cM('m'))} pick one.`,
      run: async (c) => { cardEls.forEach((e) => e.classList.remove('on')); if (ring) G.remove(ring); ring = null; dim(d.lines.map((q) => q.k)); await sleep(c, 200); } });
    return steps;
  }
};

/* =============================== mount =============================== */
mountCups();
mountSort();
mountFigures();
export const explainers = mountExplainers({ linTest, cups, readMB, dials, balance, stepGraph, intercepts, match });
export const _test = { eqTex, fr, LT, SG, IC, MT };
