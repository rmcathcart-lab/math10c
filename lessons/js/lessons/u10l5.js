/* Math 10C · Unit 10 · Lesson 5 — Converting Square and Cubic Units: SI and Imperial Systems.
 * Warm-up carpet square (1 yd² split into 9 ft²), static figures (unit square/cube, rectangle, prism, the two bins), and
 * the explainers:
 *   grid (a 1 m square filling with 100 × 100 cm²; the "×100" slip is one row; Example 1 check), shortcut (n steps on the
 *   metric number line → 10ⁿ, 10²ⁿ, 10³ⁿ as rows of zeros), rect (Example 2: 28 m² tiles, each 10 000 cm²), shiftA /
 *   shiftV (Examples 3 and 6: prefix hops, then the decimal point hops 2 or 3 places per step), cube (a 1 m cube filling
 *   with layers of cm³; the 100 cm³ speck; Example 4 check), prism (Example 5: 30 one-metre cubes in 3 layers),
 *   imperial (Example 7: 12 × 12 in² and 12 layers of 12 × 12 in³; 1 yd² and 1 yd³), cancel (Example 8: the table row,
 *   square or cube it, units cancel like fractions), which (flowchart: what kind of unit, smaller or bigger), bins
 *   (Example 9: both bins in cm³ and in², drawn to the same scale).
 * Colours: big units ink, small units blue, the wrong "×k once" red, tiles/blocks amber, imperial purple. */
import {
  h, tex, add, box, NumberLine, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween, svgEl,
  liveCtx, pulse, anim, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
/** a caption equation that may wrap before each = or \approx (the sidebar caption is narrow) */
const TQ = (s) => s.split(/(?==|\\approx)/).map((q) => T(q)).join(' ');
const INK = COLORS.ink, BLUE = COLORS.blue, RED = COLORS.red, AMB = COLORS.amber, TEAL = COLORS.teal, PUR = COLORS.purple, GRN = COLORS.green;
let UID = 0;

/* ---------------- helpers ---------------- */
/** TeX for a number as the booklet writes it: thin spaces in 5+ digit integer parts and 5+ digit decimal parts */
function tn(v) {
  const s = typeof v === 'string' ? v : String(+(+v).toPrecision(12));
  const [i, d] = s.split('.');
  const gi = i.length >= 5 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : i;
  const gd = d && d.length >= 5 ? d.replace(/(\d{3})(?=\d)/g, '$1\\,') : d;
  return gd ? gi + '.' + gd : gi;
}
const U = (n, p) => `\\text{ ${n}}${p > 1 ? '^' + p : ''}`;      // " m^2" style unit
const UU = (n, p) => `\\text{${n}}${p > 1 ? '^' + p : ''}`;      // bare unit
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u10l5-panel ' + cls, title ? `<div class="u10l5-ph">${title}</div>` : ''), w, hh), x, y);
const line = (P, html, cls = '') => { const d = h('div', 'u10l5-line ' + cls, html); d.style.opacity = 0; P.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const say = (c, P, html, cls) => show(c, line(P, html, cls));
const hide = (el) => { el.style.opacity = 0; return el; };
const ANCH = { c: '-50% -50%', l: '0 -50%', r: '-100% -50%', t: '-50% 0', b: '-50% -100%', bl: '0 -100%' };
function lab(host, x, y, html, cls = '', a = 'c') { const d = h('div', 'u10l5-lab ' + cls, html); d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.translate = ANCH[a]; host.appendChild(d); return d; }
async function swap(c, el, html) { await anim(c, el, [{ opacity: 1 }, { opacity: 0 }], 180); el.innerHTML = html; await anim(c, el, [{ opacity: 0 }, { opacity: 1 }], 260); }
async function strike(c, el) { el.classList.add('u10l5-struck'); const x = h('span', 'u10l5-xline'); el.appendChild(x); await anim(c, x, [{ width: '0%' }, { width: '100%' }], 380); }
function stampP(P, text, ok = true) { const s = stamp(P, text, { ok }); s.style.alignSelf = 'center'; s.style.marginTop = '6px'; return s; }
const mkSvg = (stage, W, H) => svgEl('svg', { class: 'u10l5-svg', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, stage);
const fade = (c, el, to = 0, ms = 260) => anim(c, el, [{ opacity: el.style.opacity === '' ? 1 : +el.style.opacity }, { opacity: to }], ms);

/* oblique projection: x right, y up, z back (drawn up and to the right) */
const KX = 0.5, KY = 0.32;
const oblique = (ox, oy, s) => (x, y, z) => [ox + s * (x + z * KX), oy - s * (y + z * KY)];
const pstr = (a) => a.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
function polys(P, x0, x1, y0, y1, z0, z1) {
  return {
    front: [P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0)],
    top: [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)],
    side: [P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0)]
  };
}
/** a box [x0,x1,y0,y1,z0,z1] with its three visible faces. o: { fill: {front, top, side}, stroke, sw, faces } */
function drawBox(parent, P, b, o = {}) {
  const g = svgEl('g', { class: o.cls || '' }, parent), pl = polys(P, ...b), f = o.fill || {};
  g.faces = {};
  for (const k of o.faces || ['front', 'top', 'side']) g.faces[k] = svgEl('polygon', { points: pstr(pl[k]), fill: f[k] ?? 'none', stroke: o.stroke || INK, 'stroke-width': o.sw ?? 2.4, 'stroke-linejoin': 'round' }, g);
  g.set = (b2) => { const p2 = polys(P, ...b2); for (const k in g.faces) g.faces[k].setAttribute('points', pstr(p2[k])); };
  return g;
}
function hiddenEdges(parent, P, b, color = INK) {
  const [x0, x1, y0, y1, , z1] = b, back = P(x0, y0, z1), g = svgEl('g', {}, parent);
  for (const q of [P(x1, y0, z1), P(x0, y1, z1), P(x0, y0, 0)]) svgEl('line', { x1: back[0], y1: back[1], x2: q[0], y2: q[1], stroke: color, 'stroke-width': 1.8, 'stroke-dasharray': '7 6' }, g);
  return g;
}
/** edge labels of an oblique box: bottom (length), left (height), depth */
function boxLabels(host, P, L, Hh, D, t, cls = '') {
  const b = P(L / 2, 0, 0), l = P(0, Hh / 2, 0), d = P(L, 0, D / 2);
  return { b: lab(host, b[0], b[1] + 8, t[0], cls, 't'), l: lab(host, l[0] - 10, l[1], t[1], cls, 'r'), d: lab(host, d[0] + 12, d[1] + 4, t[2], cls, 'l') };
}
const CUBEF = { front: '#a9c4f2', top: '#dbe7fb', side: '#84a8e8' };
const REDF = { front: '#f0a8a3', top: '#f9d6d3', side: '#e3847d' };
const AMBF = { front: '#f2c67a', top: '#fbe6bd', side: '#e3a94a' };

/* =============================== static figures =============================== */
function figSquare(host, o) {
  const s = o.s, W = o.w * s + 80, H = o.h * s + 56, x0 = 62, y0 = 12;
  const S = svgEl('svg', { class: 'u10l5-fsvg', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, host);
  if (o.grid) {
    const n = o.grid; let d = '';
    for (let i = 1; i < n; i++) d += `M${x0 + o.w * s * i / n} ${y0}V${y0 + o.h * s}M${x0} ${y0 + o.h * s * i / n}H${x0 + o.w * s}`;
    svgEl('path', { d, stroke: '#9aa0ab', 'stroke-width': 1, fill: 'none' }, S);
    svgEl('rect', { x: x0, y: y0 + o.h * s * (n - 1) / n, width: o.w * s / n, height: o.h * s / n, fill: '#9aa0ab', 'fill-opacity': 0.55 }, S);
  }
  svgEl('rect', { x: x0, y: y0, width: o.w * s, height: o.h * s, fill: 'none', stroke: INK, 'stroke-width': 2.6 }, S);
  const t1 = svgEl('text', { x: x0 + o.w * s / 2, y: y0 + o.h * s + 26, class: 'u10l5-svgt', 'text-anchor': 'middle' }, S); t1.textContent = o.b;
  const t2 = svgEl('text', { x: x0 - 10, y: y0 + o.h * s / 2 + 6, class: 'u10l5-svgt', 'text-anchor': 'end' }, S); t2.textContent = o.l;
  if (o.lrot) { t2.setAttribute('transform', `rotate(-90 ${x0 - 14} ${y0 + o.h * s / 2})`); t2.setAttribute('x', x0 - 14); t2.setAttribute('y', y0 + o.h * s / 2); t2.setAttribute('text-anchor', 'middle'); }
  return S;
}
function figBox(host, o) {
  const s = o.s, W = (o.L + o.D * KX) * s + 150, H = (o.H + o.D * KY) * s + 70 + (o.title ? 30 : 0);
  const S = svgEl('svg', { class: 'u10l5-fsvg', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, host);
  const P = oblique(78, H - 40, s), b = [0, o.L, 0, o.H, 0, o.D];
  drawBox(S, P, b, { fill: { front: '#fff', top: '#f4f6fa', side: '#e9edf4' }, sw: 2.4 });
  if (o.grid) {
    const n = o.grid, g = svgEl('g', { stroke: '#9aa0ab', 'stroke-width': 0.9, fill: 'none' }, S); let d = '';
    for (let i = 1; i < n; i++) {
      const t = i / n, seg = (a, c) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
      d += seg(P(t * o.L, 0, 0), P(t * o.L, o.H, 0)) + seg(P(0, t * o.H, 0), P(o.L, t * o.H, 0));            // front
      d += seg(P(t * o.L, o.H, 0), P(t * o.L, o.H, o.D)) + seg(P(0, o.H, t * o.D), P(o.L, o.H, t * o.D));    // top
      d += seg(P(o.L, 0, t * o.D), P(o.L, o.H, t * o.D)) + seg(P(o.L, t * o.H, 0), P(o.L, t * o.H, o.D));    // side
    }
    svgEl('path', { d }, g);
    drawBox(S, P, b, { sw: 2.4 });
  }
  hiddenEdges(S, P, b);
  const tx = (p, str, anchor, dx, dy) => { const t = svgEl('text', { x: p[0] + dx, y: p[1] + dy, class: 'u10l5-svgt', 'text-anchor': anchor }, S); t.textContent = str; };
  tx(P(o.L / 2, 0, 0), o.t[0], 'middle', 0, 26); tx(P(0, o.H / 2, 0), o.t[1], 'end', -10, 6); tx(P(o.L, 0, o.D / 2), o.t[2], 'start', 12, 12);
  if (o.title) { const t = svgEl('text', { x: P(o.L / 2, o.H, o.D)[0], y: P(0, o.H, o.D)[1] - 14, class: 'u10l5-svgt u10l5-svgb', 'text-anchor': 'middle' }, S); t.textContent = o.title; }
  return S;
}
function mountStatics() {
  const $ = (id) => document.getElementById(id);
  if ($('u10l5-f-s1')) figSquare($('u10l5-f-s1'), { w: 1, h: 1, s: 230, grid: 10, b: '1 m = 100 cm', l: '1 m = 100 cm', lrot: true });
  if ($('u10l5-f-ex1')) figSquare($('u10l5-f-ex1'), { w: 1, h: 1, s: 150, b: '1 m', l: '1 m' });
  if ($('u10l5-f-ex2')) figSquare($('u10l5-f-ex2'), { w: 7, h: 4, s: 36, b: '7 m', l: '4 m' });
  if ($('u10l5-f-s2')) figBox($('u10l5-f-s2'), { L: 1, H: 1, D: 1, s: 170, grid: 10, t: ['100 cm', '100 cm', '100 cm'] });
  if ($('u10l5-f-ex4')) figBox($('u10l5-f-ex4'), { L: 1, H: 1, D: 1, s: 150, t: ['1 m', '1 m', '1 m'] });
  if ($('u10l5-f-ex5')) figBox($('u10l5-f-ex5'), { L: 5, H: 3, D: 2, s: 46, t: ['5 m', '3 m', '2 m'] });
  if ($('u10l5-f-ex7a')) figSquare($('u10l5-f-ex7a'), { w: 1, h: 1, s: 150, b: '1 ft', l: '1 ft' });
  if ($('u10l5-f-ex7b')) figBox($('u10l5-f-ex7b'), { L: 1, H: 1, D: 1, s: 150, t: ['1 ft', '1 ft', '1 ft'] });
  if ($('u10l5-f-ex9a')) figBox($('u10l5-f-ex9a'), { L: 1.2, H: 0.7, D: 0.9, s: 190, t: ['1.2 m', '0.7 m', '0.9 m'], title: 'Bin A' });
  if ($('u10l5-f-ex9b')) figBox($('u10l5-f-ex9b'), { L: 1.2192, H: 0.762, D: 0.9144, s: 190, t: ['4 ft', '2.5 ft', '3 ft'], title: 'Bin B' });
}

/* =============================== warm-up: the carpet deal =============================== */
function mountCarpet() {
  const host = document.getElementById('u10l5-carpet'); if (!host) return;
  const Q = 300, x0 = 58, y0 = 44, W = Q + 150, H = Q + 92;
  host.style.position = 'relative'; host.style.width = W + 'px'; host.style.height = H + 'px';
  const S = mkSvg(host, W, H);
  svgEl('rect', { x: x0, y: y0, width: Q, height: Q, fill: '#78a5a0' }, S);
  let d = ''; for (let i = 1; i < 60; i++) d += `M${x0 + i * Q / 60} ${y0}V${y0 + Q}`;
  svgEl('path', { d, stroke: '#46736e', 'stroke-width': 0.8, 'stroke-opacity': 0.5 }, S);
  const gSplit = svgEl('g', { opacity: 0 }, S), gSlip = svgEl('g', { opacity: 0 }, S), gPrice = svgEl('g', { opacity: 0 }, S);
  for (const k of [1, 2]) {
    svgEl('line', { x1: x0 + k * Q / 3, x2: x0 + k * Q / 3, y1: y0, y2: y0 + Q, stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '10 7' }, gSplit);
    svgEl('line', { y1: y0 + k * Q / 3, y2: y0 + k * Q / 3, x1: x0, x2: x0 + Q, stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '10 7' }, gSplit);
  }
  svgEl('rect', { x: x0, y: y0, width: Q, height: Q, fill: 'none', stroke: INK, 'stroke-width': 3.5 }, S);
  const nums = [];
  for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) {
    const n = lab(host, x0 + (q + 0.5) * Q / 3, y0 + (r + 0.5) * Q / 3, String(r * 3 + q + 1), 'u10l5-wnum'); n.style.opacity = 0; nums.push(n);
  }
  svgEl('rect', { x: x0, y: y0 + 2 * Q / 3, width: Q, height: Q / 3, fill: RED, 'fill-opacity': 0.45, stroke: RED, 'stroke-width': 4 }, gSlip);
  const slipLab = lab(host, x0 + Q / 2, y0 + Q * 5 / 6 + 30, '3 ft² is only <b>one row</b> ✗', 'u10l5-wslip'); slipLab.style.opacity = 0;
  const prices = [];
  for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) { const p = lab(host, x0 + (q + 0.5) * Q / 3, y0 + (r + 0.5) * Q / 3 + 26, '$3', 'u10l5-wprice'); p.style.opacity = 0; prices.push(p); }
  const tot = lab(host, x0 + Q / 2, y0 + Q + 58, 'Store A: 9 × $3 = <b>$27</b> per yd² &nbsp;vs&nbsp; Store B: <b>$25</b>', 'u10l5-wtot'); tot.style.opacity = 0;
  lab(host, x0 + Q / 2, y0 - 22, '1 yd = 3 ft', 'u10l5-wdim');
  lab(host, x0 + Q + 12, y0 + Q / 2, '1 yd<br>= 3 ft', 'u10l5-wdim', 'l');
  lab(host, x0 + Q / 2, y0 + Q + 20, 'one square yard', 'u10l5-wcap');
  const c = liveCtx(), on = { split: false, slip: false, price: false };
  const setSplit = async (v) => {
    on.split = v; await anim(c, gSplit, [{ opacity: v ? 0 : 1 }, { opacity: v ? 1 : 0 }], 300);
    if (v) { for (const n of nums) { await pop(c, n, 260); await sleep(c, 90); } } else nums.forEach((n) => (n.style.opacity = 0));
  };
  document.getElementById('u10l5-wsplit').addEventListener('click', () => setSplit(!on.split));
  document.getElementById('u10l5-wslip').addEventListener('click', async () => {
    on.slip = !on.slip;
    await Promise.all([anim(c, gSlip, [{ opacity: on.slip ? 0 : 1 }, { opacity: on.slip ? 1 : 0 }], 300), anim(c, slipLab, [{ opacity: on.slip ? 0 : 1 }, { opacity: on.slip ? 1 : 0 }], 300)]);
  });
  document.getElementById('u10l5-wprice').addEventListener('click', async () => {
    on.price = !on.price;
    if (on.price) { if (!on.split) await setSplit(true); gPrice.style.opacity = 1; for (const p of prices) { await pop(c, p, 240); await sleep(c, 60); } await fadeIn(c, tot); }
    else { prices.forEach((p) => (p.style.opacity = 0)); tot.style.opacity = 0; }
  });
}

/* =============================== explainer: a unit square fills up (the star) =============================== */
/** the picture: a square Q px, its side labels and a panel. Returns tools the steps use. */
function squareKit(stage, ex, d, o = {}) {
  const H = ex.def.height, W = ex.W, Q = o.Q || 380, x0 = 108, y0 = (H - Q) / 2 - 8, k = d.k;
  const S = mkSvg(stage, W, H), uid = ++UID;
  const defs = svgEl('defs', {}, S), cp = svgEl('clipPath', { id: 'u10l5-cp' + uid }, defs), cr = svgEl('rect', { x: x0, y: y0 + Q, width: Q, height: 0 }, cp);
  svgEl('rect', { x: x0, y: y0, width: Q, height: Q, fill: '#fff' }, S);
  const gFill = svgEl('g', { 'clip-path': `url(#u10l5-cp${uid})` }, S);
  const gMid = svgEl('g', {}, S), gTop = svgEl('g', {}, S);
  svgEl('rect', { x: x0, y: y0, width: Q, height: Q, fill: 'none', stroke: INK, 'stroke-width': 3.5 }, S);
  const P = panel(stage, x0 + Q + 46, 12, W - (x0 + Q + 46) - 12, H - 24, d.title || 'Area of the square');
  const lb = lab(stage, x0 + Q / 2, y0 + Q + 12, T(`1${U(d.big)}`), 'u10l5-side', 't');
  const ll = lab(stage, x0 - 12, y0 + Q / 2, T(`1${U(d.big)}`), 'u10l5-side', 'r');
  const kit = { S, P, Q, x0, y0, k, gFill, gMid, gTop, lb, ll };
  /** the small-unit squares, clipped so that rows can fill from the bottom */
  kit.fillRows = (rows) => { const hh = Q * rows / k; cr.setAttribute('y', y0 + Q - hh); cr.setAttribute('height', hh); };
  svgEl('rect', { x: x0, y: y0, width: Q, height: Q, fill: BLUE, 'fill-opacity': 0.17 }, gFill);
  let gp = ''; for (let i = 1; i < k; i++) gp += `M${(x0 + Q * i / k).toFixed(2)} ${y0}V${y0 + Q}M${x0} ${(y0 + Q * i / k).toFixed(2)}H${x0 + Q}`;
  svgEl('path', { d: gp, stroke: BLUE, 'stroke-width': k > 20 ? 0.55 : 1.6, 'stroke-opacity': k > 20 ? 0.5 : 0.8, fill: 'none' }, gFill);
  /** ruler ticks along the bottom and the left side */
  kit.ticks = () => {
    const g = svgEl('g', { stroke: INK, 'stroke-width': 1.2 }, gTop); let dd = '';
    for (let i = 0; i <= k; i++) { const long = k > 20 ? (i % 10 === 0 ? 10 : 4) : 9, t = Q * i / k; dd += `M${x0 + t} ${y0 + Q}v${long}M${x0} ${y0 + Q - t}h${-long}`; }
    svgEl('path', { d: dd }, g); g.style.opacity = 0; return g;
  };
  return kit;
}
/** steps that build 1 big² = k² small² from the unit square. d: { big, small, k } */
function squareSteps(stage, ex, d) {
  const K = squareKit(stage, ex, d), { P, Q, x0, y0, k } = K, big = d.big, sm = d.small, kk = k * k, cont = k > 20;
  let counter, strip, call, wrongL;
  return [
    { cap: `A square <b>1 ${big}</b> by <b>1 ${big}</b>. Its area is ${TQ(`1${U(big)}\\times1${U(big)}=1${U(big, 2)}`)}.`,
      run: async (c) => { await pulse(c, K.lb, 1.15); await say(c, P, T(`A=1${U(big)}\\times1${U(big)}=1${U(big, 2)}`)); } },
    { cap: `Measure the sides in ${sm === 'in' ? 'inches' : sm === 'ft' ? 'feet' : sm === 'cm' ? 'centimetres' : 'millimetres'}: ${TQ(`1${U(big)}=${k}${U(sm)}`)}, so each side is <b>${k} ${sm}</b>.`,
      run: async (c) => { await appear(c, K.ticks(), 400); await Promise.all([swap(c, K.lb, T(`${k}${U(sm)}`)), swap(c, K.ll, T(`${k}${U(sm)}`))]); await say(c, P, T(`1${U(big)}=${k}${U(sm)}`)); } },
    { cap: `The tempting answer: “multiply by ${k}”, so ${TQ(`1${U(big, 2)}=${k}${U(sm, 2)}`)}. But ${TQ(`${k}${U(sm, 2)}`)} is only <b>one row</b> of ${k} little squares along the bottom.`,
      run: async (c) => {
        strip = svgEl('rect', { x: x0, y: y0 + Q - Q / k, width: Q, height: Q / k, fill: RED, 'fill-opacity': cont ? 1 : 0.55, stroke: cont ? 'none' : RED, 'stroke-width': 2 }, K.gMid);
        await appear(c, strip, 300);
        call = lab(stage, x0 + Q / 2, y0 + Q - Q / k - 14, `${T(`${k}${U(sm, 2)}`)} = just this one row ↓`, 'u10l5-call u10l5-callr', 'b'); await pop(c, call);
        wrongL = line(P, T(`1${U(big, 2)}=${k}${U(sm, 2)}`), 'u10l5-wrong'); await show(c, wrongL); await strike(c, wrongL);
      } },
    { cap: `The square is also <b>${k} ${sm} tall</b>, so it holds <b>${k} rows</b> like that one.`,
      run: async (c) => {
        await Promise.all([fade(c, call), fade(c, strip)]);
        counter = lab(stage, x0 + Q / 2, y0 + Q - 18, '', 'u10l5-call', 'c');
        const set = (r) => { K.fillRows(r); counter.innerHTML = `<b>${Math.max(1, Math.round(r))}</b> row${Math.round(r) > 1 ? 's' : ''}`; counter.style.top = Math.max(y0 + 22, y0 + Q - Q * r / k - 18) + 'px'; };
        if (cont) await tween(c, 2600, (t) => set(1 + (k - 1) * t), (t) => t);
        else for (let r = 1; r <= k; r++) { set(r); await sleep(c, 1500 / k + 60); }
        set(k);
        await say(c, P, T(`${k}\\text{ rows}\\times${k}${U(sm, 2)}=${tn(kk)}${U(sm, 2)}`));
      } },
    ...(cont ? [{ cap: `Check with bigger tiles, 10 ${sm} by 10 ${sm}: 10 across and 10 up make <b>100 tiles</b>, each ${TQ(`10\\times10=100${U(sm, 2)}`)}.`,
      run: async (c) => {
        await fade(c, counter);
        let dd = ''; for (let i = 1; i < 10; i++) dd += `M${x0 + Q * i / 10} ${y0}V${y0 + Q}M${x0} ${y0 + Q * i / 10}H${x0 + Q}`;
        const g = svgEl('path', { d: dd, stroke: INK, 'stroke-width': 2.4, fill: 'none' }, K.gMid); await appear(c, g, 400);
        const tile = svgEl('rect', { x: x0, y: y0 + Q * 0.9, width: Q / 10, height: Q / 10, fill: AMB, 'fill-opacity': 0.75, stroke: INK, 'stroke-width': 2.4 }, K.gMid); await appear(c, tile, 300);
        await pop(c, lab(stage, x0 + 6, y0 + Q * 0.9 - 8, T(`100${U(sm, 2)}`), 'u10l5-call u10l5-calla', 'bl'));
        await say(c, P, T(`100\\text{ tiles}\\times100${U(sm, 2)}=${tn(kk)}${U(sm, 2)}`));
      } }] : []),
    { cap: `${TQ(`1${U(big, 2)}=${k}\\times${k}=${k}^2=${tn(kk)}${U(sm, 2)}`)}. The factor ${k} is used <b>twice</b>: once for each dimension.`,
      run: async (c) => { const r = line(P, T(`1${U(big, 2)}=${k}^2${U(sm, 2)}=${tn(kk)}${U(sm, 2)}`), 'u10l5-boxed'); await pop(c, r, 450); await stampIn(c, stampP(P, `× ${k}², not × ${k}`)); } }
  ];
}
const SQ = {
  cm: { label: `${T('1\\text{ m}^2')} in ${T('\\text{cm}^2')}`, big: 'm', small: 'cm', k: 100 },
  mm: { label: `${T('1\\text{ cm}^2')} in ${T('\\text{mm}^2')}`, big: 'cm', small: 'mm', k: 10 },
  ex1: { label: 'Example 1 check', big: 'm', small: 'cm', k: 100, ex1: true, title: 'Example 1' }
};
const grid = {
  title: 'Why 1 m² is 10 000 cm², not 100 cm²',
  height: 500,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SQ).map((k) => ({ v: k, label: SQ[k].label })),
  intro: (k) => (SQ[k].ex1 ? 'Check Example 1 (a) to (d). Press <b>Next</b>.' : 'Change the units on the sides, then count the little squares. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = SQ[k];
    if (!d.ex1) return squareSteps(stage, ex, d);
    const K = squareKit(stage, ex, d), { P, Q, x0, y0 } = K;
    let counter;
    return [
      { cap: `(a) ${TQ('A=1\\text{ m}\\times1\\text{ m}=1\\text{ m}^2')}.`, run: (c) => say(c, P, '(a) ' + T('A=1\\times1=1\\text{ m}^2')) },
      { cap: `(b) Each side is <b>100 cm</b>. Fill the square: <b>100 rows</b> of 100 squares, ${TQ('100\\times100=10\\,000\\text{ cm}^2')}.`,
        run: async (c) => {
          await appear(c, K.ticks(), 300); await Promise.all([swap(c, K.lb, T('100\\text{ cm}')), swap(c, K.ll, T('100\\text{ cm}'))]);
          counter = lab(stage, x0 + Q / 2, y0 + Q - 18, '', 'u10l5-call', 'c');
          await tween(c, 1800, (t) => { const r = 1 + 99 * t; K.fillRows(r); counter.innerHTML = `<b>${Math.round(r)}</b> rows`; counter.style.top = Math.max(y0 + 22, y0 + Q - Q * r / 100 - 18) + 'px'; }, (t) => t);
          await say(c, P, '(b) ' + T('100\\times100=10\\,000\\text{ cm}^2'));
        } },
      { cap: `(b) In millimetres each side is <b>1000 mm</b>. Zoom in on one ${TQ('\\text{cm}^2')}: it is 10 mm by 10 mm, so ${TQ('1\\text{ cm}^2=100\\text{ mm}^2')}.`,
        run: async (c) => {
          await fade(c, counter);
          const cx = x0 + Q * 0.24, cy = y0 + Q * 0.62, cw = Q / 100, ix = x0 + Q - 196, iy = y0 + 14, iw = 176;
          const mark = svgEl('rect', { x: cx - 3, y: cy - 3, width: cw + 6, height: cw + 6, fill: RED, stroke: RED, 'stroke-width': 1.5 }, K.gTop);
          const g = svgEl('g', {}, K.gTop);
          svgEl('line', { x1: cx, y1: cy - 3, x2: ix, y2: iy + iw, stroke: RED, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, g);
          svgEl('line', { x1: cx + cw + 3, y1: cy - 3, x2: ix + iw, y2: iy + iw, stroke: RED, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, g);
          svgEl('rect', { x: ix, y: iy, width: iw, height: iw, fill: '#fff', stroke: RED, 'stroke-width': 3 }, g);
          let dd = ''; for (let i = 1; i < 10; i++) dd += `M${ix + iw * i / 10} ${iy}V${iy + iw}M${ix} ${iy + iw * i / 10}H${ix + iw}`;
          svgEl('rect', { x: ix, y: iy, width: iw, height: iw, fill: BLUE, 'fill-opacity': 0.15 }, g);
          svgEl('path', { d: dd, stroke: BLUE, 'stroke-width': 1.4, fill: 'none' }, g);
          await appear(c, mark, 250); await appear(c, g, 400);
          await pop(c, lab(stage, ix + iw / 2, iy + iw + 8, T('1\\text{ cm}^2=10\\times10=100\\text{ mm}^2'), 'u10l5-call u10l5-callr', 't'));
          await say(c, P, T('1\\text{ m}=1000\\text{ mm}'));
        } },
      { cap: `So ${TQ('1\\text{ m}^2=10\\,000\\times100=1000\\times1000=1\\,000\\,000\\text{ mm}^2')}.`,
        run: (c) => say(c, P, '(b) ' + T('1000\\times1000=1\\,000\\,000\\text{ mm}^2')) },
      { cap: `(c) ${TQ('1\\text{ m}^2=10\\,000\\text{ cm}^2=1\\,000\\,000\\text{ mm}^2')}: the linear factors 100 and 1000, <b>squared</b>.`,
        run: async (c) => { const r = line(P, '(c) ' + T('1\\text{ m}^2=100^2\\text{ cm}^2=1000^2\\text{ mm}^2'), 'u10l5-boxed'); await pop(c, r, 450); } },
      { cap: `(d) km² to m²: the length is ×1000 <b>and</b> the width is ×1000, so the area is ${TQ('\\times1000^2=\\times1\\,000\\,000')}. Multiplying by 1000 once only converts a length.`,
        run: async (c) => { await say(c, P, '(d) ' + T('1\\text{ km}^2=1000\\times1000\\text{ m}^2')); await say(c, P, T('=1\\,000\\,000\\text{ m}^2')); await stampIn(c, stampP(P, 'factor used twice')); } }
    ];
  }
};

/* =============================== explainer: the metric shortcut as rows of zeros =============================== */
const PRE = { '-3': 'km', '-2': 'hm', '-1': 'dam', 0: 'm', 1: 'dm', 2: 'cm', 3: 'mm' };
const STEPC = [TEAL, AMB, PUR];
function prefixLine(stage, ex, p, y = 6) {
  return new NumberLine(stage, { x: 20, y, width: ex.W - 40, height: 106, axisY: 60, min: -3, max: 3, step: 1, arrows: true,
    labels: [-3, -2, -1, 0, 1, 2, 3].map((v) => ({ v, html: T(UU(PRE[v], p)) })) });
}
const SC = {
  mmm: { label: 'm to mm', from: 0, to: 3 },
  kmm: { label: 'km to m', from: -3, to: 0 },
  mcm: { label: 'm to cm', from: 0, to: 2 }
};
const shortcut = {
  title: 'The metric shortcut: n steps → 10ⁿ, 10²ⁿ, 10³ⁿ',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SC).map((k) => ({ v: k, label: SC[k].label })),
  intro: 'One step on the number line is ×10 for each dimension. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = SC[k], n = d.to - d.from, a = PRE[d.from], b = PRE[d.to];
    const NL = prefixLine(stage, ex, 1);
    const rows = [['Length', '1 dimension', 1], ['Area', '2 dimensions', 2], ['Volume', '3 dimensions', 3]].map(([nm, sub, p], i) => {
      const r = add(stage, h('div', 'u10l5-zrow'), 24, 126 + i * 98); r.style.opacity = 0;
      r.innerHTML = `<div class="u10l5-zname"><b>${nm}</b><small>${sub}</small></div>`;
      const eq = h('div', 'u10l5-zeq'); r.appendChild(eq);
      eq.insertAdjacentHTML('beforeend', T(`1${U(a, p)}=`));
      const dg = h('span', 'u10l5-zdig'); eq.appendChild(dg);
      const total = n * p, zs = [];
      dg.appendChild(h('span', 'u10l5-zd', '1'));
      for (let j = 0; j < total; j++) { const z = h('span', 'u10l5-zd u10l5-z' + Math.floor(j / p), '0'); if ((total - j) % 3 === 0) z.classList.add('u10l5-zgap'); z.style.opacity = 0; dg.appendChild(z); zs.push(z); }
      eq.insertAdjacentHTML('beforeend', T(`${U(b, p)}`));
      const pw = h('span', 'u10l5-zpow', T(`=10^{${total}}${U(b, p)}`)); pw.style.opacity = 0; eq.appendChild(pw);
      return { r, zs, pw, p };
    });
    const runRow = async (c, R) => { await appear(c, R.r, 250); for (let j = 0; j < R.zs.length; j++) { await pop(c, R.zs[j], 220); await sleep(c, 50); } await fadeIn(c, R.pw); };
    return [
      { cap: `${a} to ${b}: <b>${n} steps</b> right on the metric number line, to a smaller unit.`,
        run: async (c) => { for (let i = 0; i < n; i++) await NL.hop(c, d.from + i, d.from + i + 1, { label: T('\\times10'), color: STEPC[i % 3], height: 30 }); } },
      { cap: `<b>Length</b> has one dimension: ×10 per step, so ${TQ(`1${U(a)}=10^{${n}}${U(b)}`)}. One zero per step.`, run: (c) => runRow(c, rows[0]) },
      { cap: `<b>Area</b> has two dimensions: each step is ${TQ('\\times10')} twice, ${TQ('\\times10^2')}. Two zeros per step: ${TQ(`1${U(a, 2)}=10^{${2 * n}}${U(b, 2)}`)}.`, run: (c) => runRow(c, rows[1]) },
      { cap: `<b>Volume</b> has three dimensions: ${TQ('\\times10^3')} per step. Three zeros per step: ${TQ(`1${U(a, 3)}=10^{${3 * n}}${U(b, 3)}`)}.`, run: (c) => runRow(c, rows[2]) },
      { cap: `The rule: <b>${TQ('n')} steps apart</b> → length ${TQ('10^{n}')}, area ${TQ('10^{2n}')}, volume ${TQ('10^{3n}')}. Here ${TQ(`n=${n}`)}.`,
        run: async (c) => { for (const R of rows) await pulse(c, R.pw, 1.12); const s = stamp(stage, '', { x: ex.W - 150, y: 430 }); s.innerHTML = T(`10^{${n}},\\ 10^{${2 * n}},\\ 10^{${3 * n}}`); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainers: prefix hops, then the decimal point hops (Examples 3 and 6) =============================== */
function shiftDef(p, data, title) {
  return {
    title, height: 480,
    choices: Object.keys(data).map((k) => ({ v: k, label: data[k].label })),
    intro: 'Find both units on the number line, count the steps, then move the decimal point. Press <b>Next</b>.',
    make(stage, k, ex) {
      const d = data[k], W = ex.W, n = Math.abs(d.to - d.from), right = d.to > d.from, m = (d.to - d.from) * p;
      const NL = prefixLine(stage, ex, p);
      // the digit strip
      let digs = d.v.replace('.', '').split(''), p0 = d.v.includes('.') ? d.v.indexOf('.') : d.v.length;
      const orig = digs.length;
      let L = 0; if (p0 + m < 1) { L = 1 - (p0 + m); }
      const R = Math.max(0, p0 + m - orig);
      const cells = [...Array(L).fill('0'), ...digs, ...Array(R).fill('0')], ps = p0 + L, pe = ps + m;
      const cw = 46, sw = cells.length * cw, sx = (W - sw) / 2, sy = 132;
      const strip = add(stage, h('div', 'u10l5-strip'), sx, sy); strip.style.width = sw + 'px';
      const cEls = cells.map((v, i) => { const e = h('div', 'u10l5-cell', v); e.style.left = i * cw + 'px'; if (i < L || i >= L + orig) e.style.opacity = 0; strip.appendChild(e); return e; });
      const dot = h('div', 'u10l5-dot'); strip.appendChild(dot);
      const setDot = (b) => { dot.style.left = b * cw + 'px'; };
      setDot(ps);
      const P = panel(stage, 20, 222, W - 40, 246, '', 'u10l5-wide');
      const fromU = T(UU(PRE[d.from], p)), toU = T(UU(PRE[d.to], p));
      const fac = `10^{${p * n}}`, per = `10^${p}`;
      const needed = (i, pt) => {
        let first = cells.findIndex((v, j) => j < pt && v !== '0'); if (first < 0 || first > pt - 1) first = pt - 1;
        let last = -1; for (let j = cells.length - 1; j >= pt; j--) if (cells[j] !== '0') { last = j; break; }
        return (i >= first && i < pt) || (i >= pt && i <= last);
      };
      const intRes = !cells.some((v, j) => j >= pe && v !== '0');
      return [
        { cap: `${TQ(d.vt + U(PRE[d.from], p))} to ${toU}. Find both units on the metric number line.`,
          run: async (c) => { await pop(c, NL.point(d.from, { color: INK })); await pop(c, NL.point(d.to, { color: BLUE })); } },
        { cap: `${fromU} to ${toU} is <b>${n} step${n > 1 ? 's' : ''} ${right ? 'right' : 'left'}</b>: to a ${right ? '<b>smaller</b> unit, so the number gets bigger (multiply)' : '<b>bigger</b> unit, so the number gets smaller (divide)'}.`,
          run: async (c) => { for (let i = 0; i < n; i++) { const a = d.from + (right ? i : -i), b = a + (right ? 1 : -1); await NL.hop(c, a, b, { label: T((right ? '\\times' : '\\div') + per), color: STEPC[i % 3], height: 28 }); } } },
        { cap: `For ${p === 2 ? 'area' : 'volume'} each step is ${TQ('\\times10')} in each of <b>${p} dimensions</b>: ${TQ(per + '=' + (p === 2 ? '100' : '1000'))} per step. ${n} step${n > 1 ? 's' : ''}: ${TQ(n > 1 ? `(${per})^{${n}}=${fac}` : fac)}.`,
          run: (c) => say(c, P, T(`${right ? '\\times' : '\\div'}${n > 1 ? `(${per})^{${n}}=${right ? '\\times' : '\\div'}${fac}` : per}=${right ? '\\times' : '\\div'}${tn(String(10 ** (p * n)))}`)) },
        { cap: `Move the decimal point <b>${Math.abs(m)} places ${right ? 'right' : 'left'}</b>: ${p} places for each step.`,
          run: async (c) => {
            for (let j = 0; j < Math.abs(m); j++) {
              const b0 = ps + (right ? j : -j), b1 = b0 + (right ? 1 : -1), cross = right ? b0 : b1, col = STEPC[Math.floor(j / p) % 3];
              const ce = cEls[cross];
              if (ce.style.opacity === '0') await pop(c, ce, 200);
              ce.style.background = col + '33'; ce.style.borderColor = col;
              await tween(c, 260, (t) => { const b = b0 + (b1 - b0) * t; dot.style.left = b * cw + 'px'; dot.style.marginTop = -Math.sin(Math.PI * t) * 26 + 'px'; });
              dot.style.marginTop = '0px';
            }
            setDot(pe);
            await Promise.all(cEls.map((e, i) => (needed(i, pe) ? anim(c, e, [{ opacity: 1 }], 200) : fade(c, e, 0.12))));
            if (intRes) await fade(c, dot, 0.15);
            await say(c, P, T(`${d.vt}${right ? '\\times' : '\\div'}${fac}=${d.std}${U(PRE[d.to], p)}`));
          } },
        { cap: d.sci ? `Standard notation: <b>${TQ(d.std + U(PRE[d.to], p))}</b>. Scientific notation: <b>${TQ(d.sci + U(PRE[d.to], p))}</b>.` : `${TQ(`${d.vt}${U(PRE[d.from], p)}=${d.std}${U(PRE[d.to], p)}`)}.`,
          run: async (c) => { if (d.sci) await say(c, P, T(`=${d.sci}${U(PRE[d.to], p)}`)); await stampIn(c, stampP(P, `${n} step${n > 1 ? 's' : ''} → ${p * n} places`)); } }
      ];
    }
  };
}
const EX3 = {
  a: { label: 'Example 3(a)', v: '42', vt: '42', from: 0, to: 2, std: '420\\,000', sci: '4.2\\times10^{5}' },
  b: { label: 'Example 3(b)', v: '156000', vt: '156\\,000', from: 2, to: 0, std: '15.6', sci: '1.56\\times10^{1}' },
  c: { label: 'Example 3(c)', v: '0.0037', vt: '0.0037', from: -3, to: 0, std: '3700', sci: '3.7\\times10^{3}' },
  d: { label: 'Example 3(d)', v: '8400000', vt: '8\\,400\\,000', from: 0, to: -3, std: '8.4', sci: '8.4\\times10^{0}' }
};
const EX6 = {
  a: { label: 'Example 6(a)', v: '5.2', vt: '5.2', from: 0, to: 2, std: '5\\,200\\,000' },
  b: { label: 'Example 6(b)', v: '940000', vt: '940\\,000', from: 2, to: 0, std: '0.94' },
  c: { label: 'Example 6(c)', v: '0.0000082', vt: '0.000\\,008\\,2', from: -3, to: 0, std: '8200' },
  d: { label: 'Example 6(d)', v: '63000', vt: '63\\,000', from: 3, to: 2, std: '63' }
};
const shiftA = shiftDef(2, EX3, 'Area: the point moves two places per step');
const shiftV = shiftDef(3, EX6, 'Volume: the point moves three places per step');

/* =============================== explainer: Example 2, the rectangle =============================== */
const RC = {
  cm: { label: 'Example 2(b) check: cm²', sm: 'cm', f: 100, ff: '10\\,000', sides: ['700', '400'], prod: '280\\,000', wrong: '2800' },
  mm: { label: 'Example 2(c) check: mm²', sm: 'mm', f: 1000, ff: '1\\,000\\,000', sides: ['7000', '4000'], prod: '28\\,000\\,000', wrong: '28\\,000' }
};
const rect = {
  title: 'Example 2: every square metre holds the same number of small squares',
  height: 470,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(RC).map((k) => ({ v: k, label: RC[k].label })),
  intro: 'A 7 m by 4 m rectangle, two ways. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = RC[k], H = ex.def.height, s = 60, x0 = 112, y0 = 50, w = 7 * s, hh = 4 * s;
    const S = mkSvg(stage, ex.W, H), gTiles = svgEl('g', {}, S), gTop = svgEl('g', {}, S);
    svgEl('rect', { x: x0, y: y0, width: w, height: hh, fill: 'none', stroke: INK, 'stroke-width': 3.5 }, S);
    const lb = lab(stage, x0 + w / 2, y0 + hh + 12, T('7\\text{ m}'), 'u10l5-side', 't'), ll = lab(stage, x0 - 12, y0 + hh / 2, T('4\\text{ m}'), 'u10l5-side', 'r');
    const P = panel(stage, x0 + w + 40, 12, ex.W - (x0 + w + 40) - 12, H - 24, 'Two ways');
    const tiles = [];
    for (let r = 0; r < 4; r++) for (let q = 0; q < 7; q++) { const t = svgEl('rect', { x: x0 + q * s, y: y0 + r * s, width: s, height: s, fill: TEAL, 'fill-opacity': 0.12, stroke: TEAL, 'stroke-width': 1.6 }, gTiles); t.style.opacity = 0; tiles.push(t); }
    const fine = (q, r) => { let dd = ''; const n = 10; for (let i = 1; i < n; i++) dd += `M${x0 + q * s + s * i / n} ${y0 + r * s}v${s}M${x0 + q * s} ${y0 + r * s + s * i / n}h${s}`; return svgEl('path', { d: dd, stroke: BLUE, 'stroke-width': 0.8, 'stroke-opacity': 0.7, fill: 'none' }, gTop); };
    return [
      { cap: `${TQ('7\\times4=28')} squares of ${TQ('1\\text{ m}^2')}: ${TQ('A=28\\text{ m}^2')}.`,
        run: async (c) => { for (const t of tiles) { await appear(c, t, 90); } await say(c, P, '(a) ' + T('A=7\\times4=28\\text{ m}^2')); } },
      { cap: `<b>Way 1:</b> convert the sides first: ${TQ(`7\\text{ m}=${d.sides[0]}${U(d.sm)}`)} and ${TQ(`4\\text{ m}=${d.sides[1]}${U(d.sm)}`)}.`,
        run: async (c) => { await Promise.all([swap(c, lb, T(`${d.sides[0]}${U(d.sm)}`)), swap(c, ll, T(`${d.sides[1]}${U(d.sm)}`))]); await say(c, P, '<b>1</b> ' + T(`A=${d.sides[0]}\\times${d.sides[1]}`)); await say(c, P, T(`\\phantom{A}=${d.prod}${U(d.sm, 2)}`)); } },
      { cap: `<b>Way 2:</b> each square metre holds ${TQ(`${d.f}^2=${d.ff}${U(d.sm, 2)}`)} (Example 1).`,
        run: async (c) => {
          const f = fine(0, 3); if (d.sm === 'mm') f.setAttribute('stroke-width', 0.5);
          await appear(c, f, 300); svgEl('rect', { x: x0 + 2, y: y0 + 3 * s + 2, width: s - 4, height: s - 4, fill: AMB, 'fill-opacity': 0.3, stroke: AMB, 'stroke-width': 4 }, gTop);
          const l = lab(stage, x0 + s / 2, y0 + 3 * s - 6, T(`${d.ff}${U(d.sm, 2)}`), 'u10l5-call u10l5-calla', 'b'); l.style.translate = '-12% -100%'; await pop(c, l);
        } },
      { cap: `28 squares, each ${TQ(`${d.ff}${U(d.sm, 2)}`)}: ${TQ(`28\\times${d.ff}=${d.prod}${U(d.sm, 2)}`)}. The same answer ✓`,
        run: async (c) => { for (let r = 0; r < 4; r++) for (let q = 0; q < 7; q++) if (q || r !== 3) fine(q, r).style.opacity = 0; for (const e of [...gTop.querySelectorAll('path')].slice(1)) await appear(c, e, 40); await say(c, P, '<b>2</b> ' + T(`28\\times${d.ff}=${d.prod}${U(d.sm, 2)}`)); } },
      { cap: `“Times ${d.f}” once would give ${TQ(`28\\times${d.f}=${d.wrong}${U(d.sm, 2)}`)}: far too small, because it scales only one side.`,
        run: async (c) => { const w2 = line(P, T(`28\\times${d.f}=${d.wrong}${U(d.sm, 2)}`), 'u10l5-wrong'); await show(c, w2); await strike(c, w2); await stampIn(c, stampP(P, 'ways 1 and 2 agree ✓')); } }
    ];
  }
};

/* =============================== explainer: a unit cube fills with layers (the star, part 2) =============================== */
function cubeKit(stage, ex, d) {
  const H = ex.def.height, W = ex.W, E = d.E || 276, ox = 108, oy = H - 52, P = oblique(ox, oy, E), k = d.k;
  const S = mkSvg(stage, W, H);
  const gBack = svgEl('g', {}, S), gFill = svgEl('g', {}, S), gMid = svgEl('g', {}, S), gOut = svgEl('g', {}, S);
  drawBox(gBack, P, [0, 1, 0, 1, 0, 1], { fill: { front: '#fff', top: '#f6f7fa', side: '#eef1f6' }, sw: 0 });
  drawBox(gOut, P, [0, 1, 0, 1, 0, 1], { sw: 3.2 });
  const hid = hiddenEdges(gOut, P, [0, 1, 0, 1, 0, 1]);
  const px0 = ox + E * (1 + KX) + 44;
  const Pn = panel(stage, px0, 12, W - px0 - 12, H - 24, d.title || 'Volume of the cube');
  const L = boxLabels(stage, P, 1, 1, 1, [T(`1${U(d.big)}`), T(`1${U(d.big)}`), T(`1${U(d.big)}`)], 'u10l5-side');
  const kit = { S, P, E, k, gFill, gMid, gOut, hid, Pn, L, ox, oy };
  kit.relabel = (c, html) => Promise.all([swap(c, L.b, html), swap(c, L.l, html), swap(c, L.d, html)]);
  kit.ticks = () => {
    let dd = ''; const seg = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    for (let i = 0; i <= k; i++) {
      const t = i / k, long = k > 20 ? (i % 10 === 0 ? 10 : 4) : 8;
      dd += seg(P(t, 0, 0), [P(t, 0, 0)[0], P(t, 0, 0)[1] + long]) + seg(P(0, t, 0), [P(0, t, 0)[0] - long, P(0, t, 0)[1]]);
      const q = P(1, 0, t); dd += seg(q, [q[0] + long * 0.8, q[1] + long * 0.6]);
    }
    const g = svgEl('path', { d: dd, stroke: INK, 'stroke-width': 1.2, fill: 'none' }, gOut); g.style.opacity = 0; return g;
  };
  /** discrete small cubes: draws layer y (painter's order), returns its group */
  kit.layer = (y, o = {}) => {
    const g = svgEl('g', {}, gFill), u = 1 / k, f = o.fill || CUBEF;
    for (let z = (o.z1 ?? k) - 1; z >= (o.z0 ?? 0); z--) for (let x = 0; x < (o.xn ?? k); x++) {
      const faces = ['top']; if (z === (o.z0 ?? 0)) faces.unshift('front'); if (x === (o.xn ?? k) - 1) faces.push('side');
      drawBox(g, P, [x * u, (x + 1) * u, y * u, (y + 1) * u, z * u, (z + 1) * u], { fill: f, stroke: o.stroke || BLUE, sw: k > 10 ? 0.6 : 1, faces });
    }
    return g;
  };
  return kit;
}
function cubeSteps(stage, ex, d) {
  const K = cubeKit(stage, ex, d), { P, Pn, k, E } = K, big = d.big, sm = d.small, k3 = k ** 3, k2 = k * k, cont = k > 20;
  const smName = { in: 'inches', ft: 'feet', cm: 'centimetres', mm: 'millimetres' }[sm];
  let wrong, call, slab, counter, layers = [];
  const steps = [
    { cap: `A cube <b>1 ${big}</b> on every edge: ${TQ(`V=1\\times1\\times1=1${U(big, 3)}`)}.`,
      run: async (c) => { await pulse(c, K.L.b, 1.15); await say(c, Pn, T(`V=1\\times1\\times1=1${U(big, 3)}`)); } },
    { cap: `Measure the edges in ${smName}: every edge is <b>${k} ${sm}</b>.`,
      run: async (c) => { await appear(c, K.ticks(), 400); await K.relabel(c, T(`${k}${U(sm)}`)); await say(c, Pn, T(`1${U(big)}=${k}${U(sm)}`)); } },
    cont
      ? { cap: `The tempting answer: “times 100”, so ${TQ(`1${U(big, 3)}=100${U(sm, 3)}`)}. But a ${TQ(`100${U(sm, 3)}`)} cube is only about <b>4.6 cm</b> on an edge: this speck.`,
        run: async (c) => {
          const e = 0.0464; wrong = drawBox(K.gMid, P, [0, e, 0, e, 0, e], { fill: REDF, stroke: RED, sw: 1.2 }); await pop(c, wrong);
          const p = P(e, e, 0); call = lab(stage, p[0] + 18, p[1] - 60, `${T(`100${U(sm, 3)}`)}: a cube about 4.6 cm wide`, 'u10l5-call u10l5-callr', 'l');
          const ar = svgEl('line', { x1: p[0] + 22, y1: p[1] - 46, x2: p[0] + 4, y2: p[1] - 4, stroke: RED, 'stroke-width': 2.4 }, K.gOut);
          await Promise.all([pop(c, call), appear(c, ar)]); call.ar = ar;
          const w = line(Pn, T(`1${U(big, 3)}=100${U(sm, 3)}`), 'u10l5-wrong'); await show(c, w); await strike(c, w);
        } }
      : { cap: `The tempting answer: “times ${k}”, so ${TQ(`1${U(big, 3)}=${k}${U(sm, 3)}`)}. But ${k} little cubes make only <b>one row</b> along the front edge.`,
        run: async (c) => {
          wrong = K.layer(0, { z1: 1, fill: REDF, stroke: RED }); K.gMid.appendChild(wrong); await appear(c, wrong, 300);
          const p = P(0.5, 1 / k, 0); call = lab(stage, p[0], p[1] - 10, `${T(`${k}${U(sm, 3)}`)} = one row`, 'u10l5-call u10l5-callr', 'b'); await pop(c, call);
          const w = line(Pn, T(`1${U(big, 3)}=${k}${U(sm, 3)}`), 'u10l5-wrong'); await show(c, w); await strike(c, w);
        } },
    { cap: `Lay down one floor, 1 ${sm} thick: ${TQ(`${k}\\times${k}=${tn(k2)}`)} cubes. ${cont ? 'It is the square from Section 1, one centimetre deep.' : ''}`,
      run: async (c) => {
        await Promise.all([fade(c, wrong), fade(c, call), call.ar ? fade(c, call.ar) : null]);
        if (cont) {
          slab = drawBox(K.gFill, P, [0, 1, 0, 1 / k, 0, 1], { fill: { front: '#7ea6ea', top: '#c8daf8', side: '#6a93dc' }, stroke: BLUE, sw: 1.2 });
          const g = svgEl('g', { stroke: BLUE, 'stroke-width': 0.8, 'stroke-opacity': 0.7 }, K.gFill); slab.grid = g;
          slab.setH = (y) => {
            slab.set([0, 1, 0, y, 0, 1]); let dd = '';
            for (let i = 1; i < 10; i++) { const a = P(i / 10, y, 0), b = P(i / 10, y, 1), e1 = P(0, y, i / 10), e2 = P(1, y, i / 10); dd += `M${a[0]} ${a[1]}L${b[0]} ${b[1]}M${e1[0]} ${e1[1]}L${e2[0]} ${e2[1]}`; }
            g.innerHTML = ''; svgEl('path', { d: dd }, g);
          };
          slab.setH(1 / k); await appear(c, slab, 400); await appear(c, g, 300);
        } else { layers[0] = K.layer(0); hide(layers[0]); await appear(c, layers[0], 500); }
        await say(c, Pn, T(`1\\text{ layer}=${k}\\times${k}=${tn(k2)}${U(sm, 3)}`));
      } },
    { cap: `The cube is <b>${k} ${sm} tall</b>, so stack <b>${k} layers</b>.`,
      run: async (c) => {
        counter = lab(stage, P(0.5, 0, 0)[0], K.oy - 18, '', 'u10l5-call', 'c');
        const setC = (n, y) => { counter.innerHTML = `layer <b>${n}</b>`; counter.style.top = Math.min(K.oy - 18, P(0.5, y, 0)[1] + 20) + 'px'; };
        if (cont) await tween(c, 2600, (t) => { const y = (1 + (k - 1) * t) / k; slab.setH(y); setC(Math.round(y * k), y); }, (t) => t);
        else for (let y = 1; y < k; y++) { layers[y] = K.layer(y); layers[y].style.opacity = 0; setC(y + 1, (y + 1) / k); await anim(c, layers[y], [{ opacity: 0, transform: 'translateY(-24px)' }, { opacity: 1, transform: 'none' }], 160 + 900 / k); }
        setC(k, 1); await fade(c, K.hid, 0.25);
        await say(c, Pn, T(`${k}\\text{ layers}\\times${tn(k2)}=${tn(k3)}${U(sm, 3)}`));
      } }
  ];
  if (cont) steps.push({ cap: `Check with 10 cm blocks: ${TQ('10\\times10\\times10=1000')} blocks, each ${TQ(`10^3=1000${U(sm, 3)}`)}.`,
    run: async (c) => {
      await fade(c, counter);
      let dd = ''; const seg = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      for (let i = 1; i < 10; i++) { const t = i / 10; dd += seg(P(t, 0, 0), P(t, 1, 0)) + seg(P(0, t, 0), P(1, t, 0)) + seg(P(t, 1, 0), P(t, 1, 1)) + seg(P(0, 1, t), P(1, 1, t)) + seg(P(1, 0, t), P(1, 1, t)) + seg(P(1, t, 0), P(1, t, 1)); }
      const g = svgEl('path', { d: dd, stroke: INK, 'stroke-width': 1.8, fill: 'none' }, K.gMid); await appear(c, g, 400);
      const blk = drawBox(K.gMid, P, [0.9, 1, 0.9, 1, 0, 0.1], { fill: AMBF, sw: 2.2 }); await pop(c, blk);
      const q = P(0.95, 1, 0.05), tp = P(0.5, 1, 1), ly = tp[1] - 14;
      const ar = svgEl('line', { x1: tp[0] + 40, y1: ly, x2: q[0], y2: q[1] - 2, stroke: AMB, 'stroke-width': 2.6 }, K.gMid); await appear(c, ar);
      await pop(c, lab(stage, tp[0], ly, T(`10\\times10\\times10=1000${U(sm, 3)}`), 'u10l5-call u10l5-calla', 'b'));
      await say(c, Pn, T(`1000\\text{ blocks}\\times1000${U(sm, 3)}`));
    } });
  steps.push({ cap: `${TQ(`1${U(big, 3)}=${k}\\times${k}\\times${k}=${k}^3=${tn(k3)}${U(sm, 3)}`)}. The factor ${k} is used <b>three times</b>: once for each dimension.`,
    run: async (c) => { const r = line(Pn, T(`1${U(big, 3)}=${k}^3${U(sm, 3)}=${tn(k3)}${U(sm, 3)}`), 'u10l5-boxed'); await pop(c, r, 450); await stampIn(c, stampP(Pn, `× ${k}³, not × ${k}`)); } });
  return steps;
}
const CB = {
  cm: { label: `${T('1\\text{ m}^3')} in ${T('\\text{cm}^3')}`, big: 'm', small: 'cm', k: 100 },
  mm: { label: `${T('1\\text{ cm}^3')} in ${T('\\text{mm}^3')}`, big: 'cm', small: 'mm', k: 10 },
  ex4: { label: 'Example 4 check', big: 'm', small: 'cm', k: 100, ex4: true, title: 'Example 4' }
};
const cube = {
  title: 'Why 1 m³ is 1 000 000 cm³: layers of little cubes',
  height: 500,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(CB).map((k) => ({ v: k, label: CB[k].label })),
  intro: (k) => (CB[k].ex4 ? 'Check Example 4 (a) to (c). Press <b>Next</b>.' : 'Change the units on the edges, then fill the cube layer by layer. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = CB[k];
    if (!d.ex4) return cubeSteps(stage, ex, d);
    const K = cubeKit(stage, ex, d), { P, Pn } = K;
    let slab, pills = [];
    return [
      { cap: `(a) ${TQ('V=1\\times1\\times1=1\\text{ m}^3')}.`, run: (c) => say(c, Pn, '(a) ' + T('V=1\\times1\\times1=1\\text{ m}^3')) },
      { cap: `(b) Every edge is <b>100 cm</b>. One floor 1 cm thick is ${TQ('100\\times100=10\\,000\\text{ cm}^3')}; stack <b>100</b> of them.`,
        run: async (c) => {
          await appear(c, K.ticks(), 300); await K.relabel(c, T('100\\text{ cm}'));
          slab = drawBox(K.gFill, P, [0, 1, 0, 0.01, 0, 1], { fill: { front: '#7ea6ea', top: '#c8daf8', side: '#6a93dc' }, stroke: BLUE, sw: 1.2 });
          await appear(c, slab, 300); await tween(c, 2000, (t) => slab.set([0, 1, 0, 0.01 + 0.99 * t, 0, 1]), (t) => t); await fade(c, K.hid, 0.25);
          await say(c, Pn, '(b) ' + T('100\\times100\\times100=100^3')); await say(c, Pn, T('\\phantom{(b)}=1\\,000\\,000\\text{ cm}^3'));
        } },
      { cap: `(c) ${TQ('1\\text{ m}^3=1\\,000\\,000\\text{ cm}^3')}. In millimetres every edge is 1000 mm: the factor 1000, once for <b>each</b> edge.`,
        run: async (c) => {
          await K.relabel(c, T('1000\\text{ mm}'));
          const at = [P(0.5, 0.1, 0), P(0.13, 0.5, 0), P(1, 0.18, 0.5)];
          for (let i = 0; i < 3; i++) { const e = lab(stage, at[i][0], at[i][1], T('\\times1000'), 'u10l5-call u10l5-calla', 'c'); pills.push(e); await pop(c, e); }
        } },
      { cap: `So ${TQ('1\\text{ m}^3=1000\\times1000\\times1000=1000^3=10^{9}\\text{ mm}^3')}, that is ${TQ('1\\,000\\,000\\,000\\text{ mm}^3')}.`,
        run: async (c) => { const r = line(Pn, '(c) ' + T('1\\text{ m}^3=1000^3\\text{ mm}^3'), ''); await show(c, r); const r2 = line(Pn, T('=10^{9}=1\\,000\\,000\\,000\\text{ mm}^3'), 'u10l5-boxed'); await pop(c, r2, 450); await stampIn(c, stampP(Pn, 'factor used 3 times')); } }
    ];
  }
};

/* =============================== explainer: Example 5, the prism =============================== */
const prism = {
  title: 'Example 5: 30 cubic metres, each a million cubic centimetres',
  height: 470,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ex5', label: 'Example 5 check' }],
  intro: 'Build the 5 m by 2 m by 3 m prism from cubic metres. Press <b>Next</b>.',
  make(stage, k, ex) {
    const H = ex.def.height, s = 68, ox = 110, oy = H - 70, P = oblique(ox, oy, s);
    const S = mkSvg(stage, ex.W, H), gF = svgEl('g', {}, S), gO = svgEl('g', {}, S);
    drawBox(gO, P, [0, 5, 0, 3, 0, 2], { sw: 3.2 }); const hid = hiddenEdges(gO, P, [0, 5, 0, 3, 0, 2]);
    const L = boxLabels(stage, P, 5, 3, 2, [T('5\\text{ m}'), T('3\\text{ m}'), T('2\\text{ m}')], 'u10l5-side');
    const px0 = ox + s * (5 + 2 * KX) + 46, Pn = panel(stage, px0, 12, ex.W - px0 - 12, H - 24, 'Volume of the prism');
    const layer = (y) => { const g = svgEl('g', {}, gF); for (let z = 1; z >= 0; z--) for (let x = 0; x < 5; x++) { const f = ['top']; if (z === 0) f.unshift('front'); if (x === 4) f.push('side'); drawBox(g, P, [x, x + 1, y, y + 1, z, z + 1], { fill: { front: '#bfe3df', top: '#e2f3f1', side: '#9fd2cc' }, stroke: TEAL, sw: 1.6, faces: f }); } g.style.opacity = 0; return g; };
    const Ls = [];
    return [
      { cap: `The floor: ${TQ('5\\times2=10')} cubes of ${TQ('1\\text{ m}^3')}.`, run: async (c) => { Ls[0] = layer(0); await anim(c, Ls[0], [{ opacity: 0, transform: 'translateY(-20px)' }, { opacity: 1, transform: 'none' }], 500); await say(c, Pn, T('5\\times2=10\\text{ cubes per layer}')); } },
      { cap: `3 layers: ${TQ('V=5\\times2\\times3=30\\text{ m}^3')}.`,
        run: async (c) => { for (const y of [1, 2]) { Ls[y] = layer(y); await anim(c, Ls[y], [{ opacity: 0, transform: 'translateY(-20px)' }, { opacity: 1, transform: 'none' }], 450); } await fade(c, hid, 0.25); await say(c, Pn, '(a) ' + T('V=5\\times2\\times3=30\\text{ m}^3')); } },
      { cap: `Each of those cubes is ${TQ('1\\text{ m}^3=1\\,000\\,000\\text{ cm}^3')} (Example 4). <b>Way 1:</b> ${TQ('30\\times1\\,000\\,000=30\\,000\\,000\\text{ cm}^3')}.`,
        run: async (c) => { const b = drawBox(gO, P, [4, 5, 2, 3, 0, 1], { fill: AMBF, sw: 2.4 }); await pop(c, b); const q = P(4.5, 3, 0.5); await pop(c, lab(stage, q[0], q[1] - 14, T('10^{6}\\text{ cm}^3'), 'u10l5-call u10l5-calla', 'b')); await say(c, Pn, '<b>1</b> ' + T('30\\times1\\,000\\,000=30\\,000\\,000\\text{ cm}^3')); } },
      { cap: `<b>Way 2:</b> convert the edges: 500 cm, 200 cm and 300 cm. ${TQ('500\\times200\\times300=30\\,000\\,000\\text{ cm}^3')}.`,
        run: async (c) => { await Promise.all([swap(c, L.b, T('500\\text{ cm}')), swap(c, L.l, T('300\\text{ cm}')), swap(c, L.d, T('200\\text{ cm}'))]); await say(c, Pn, '<b>2</b> ' + T('500\\times200\\times300')); await say(c, Pn, T('\\phantom{2}=30\\,000\\,000\\text{ cm}^3')); } },
      { cap: `“Times 100” once would give ${TQ('30\\times100=3000\\text{ cm}^3')}: a cube only about 14 cm on an edge, not a room-sized prism.`,
        run: async (c) => { const w = line(Pn, T('30\\times100=3000\\text{ cm}^3'), 'u10l5-wrong'); await show(c, w); await strike(c, w); await stampIn(c, stampP(Pn, 'ways 1 and 2 agree ✓')); } }
    ];
  }
};

/* =============================== explainer: imperial units from the unit square and cube (Example 7) =============================== */
const IMP = {
  ft2: { label: `Example 7(a): ${T('1\\text{ ft}^2')}`, kind: 'sq', big: 'ft', small: 'in', k: 12, title: 'Area of the square' },
  ft3: { label: `Example 7(b): ${T('1\\text{ ft}^3')}`, kind: 'cb', big: 'ft', small: 'in', k: 12, title: 'Volume of the cube' },
  yd2: { label: `Warm-up: ${T('1\\text{ yd}^2')}`, kind: 'sq', big: 'yd', small: 'ft', k: 3, title: 'Area of the square' },
  yd3: { label: T('1\\text{ yd}^3'), kind: 'cb', big: 'yd', small: 'ft', k: 3, title: 'Volume of the cube' }
};
const imperial = {
  title: 'Imperial: square the 12 (or the 3), cube the 12 (or the 3)',
  height: 500,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(IMP).map((k) => ({ v: k, label: IMP[k].label })),
  intro: 'The same picture as Sections 1 and 2, with imperial units. Press <b>Next</b>.',
  make(stage, k, ex) { const d = IMP[k]; return d.kind === 'sq' ? squareSteps(stage, ex, d) : cubeSteps(stage, ex, Object.assign({ E: 268 }, d)); }
};

/* =============================== explainer: unit analysis with the table (Example 8) =============================== */
const TROWS = [
  { big: 'ft', small: 'in', k: '12', sq: '144', cb: '1728' },
  { big: 'yd', small: 'ft', k: '3', sq: '9', cb: '27' },
  { big: 'yd', small: 'in', k: '36', sq: '1296', cb: '46\\,656' },
  { big: 'mi', small: 'yd', k: '1760', sq: '3\\,097\\,600', cb: '5\\,451\\,776\\,000' }
];
const EX8 = {
  a: { label: 'Example 8(a)', v: '8', from: 'yd', to: 'ft', p: 2, row: 1, calc: '8\\times9', res: '72' },
  b: { label: 'Example 8(b)', v: '2592', from: 'in', to: 'yd', p: 2, row: 2, calc: '2592\\div1296', res: '2' },
  c: { label: 'Example 8(c)', v: '0.75', from: 'mi', to: 'yd', p: 2, row: 3, calc: '0.75\\times3\\,097\\,600', res: '2\\,323\\,200' },
  d: { label: 'Example 8(d)', v: '3.5', from: 'ft', to: 'in', p: 3, row: 0, calc: '3.5\\times1728', res: '6048' },
  e: { label: 'Example 8(e)', v: '58\\,320', from: 'in', to: 'ft', p: 3, row: 0, calc: '58\\,320\\div1728', res: '33.75' },
  f: { label: 'Example 8(f)', v: '0.02', from: 'mi', to: 'yd', p: 3, row: 3, calc: '0.02\\times5\\,451\\,776\\,000', res: '109\\,035\\,520', sci: '1.09\\times10^{8}' }
};
const cancel = {
  title: 'Unit analysis: square or cube the factor, then cancel',
  height: 480,
  choices: Object.keys(EX8).map((k) => ({ v: k, label: EX8[k].label })),
  intro: 'Pick the row of the table, square or cube it, then let the units cancel. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = EX8[k], r = TROWS[d.row], W = ex.W, p = d.p, down = d.from === r.big; // down: big unit → small unit (multiply)
    const fac = p === 2 ? r.sq : r.cb, sqw = p === 2 ? 'square' : 'cube';
    const tb = add(stage, h('div', 'u10l5-mtbl'), 20, 12); tb.style.width = (W - 40) + 'px';
    tb.innerHTML = '<div class="u10l5-mh">Linear</div><div class="u10l5-mh">Square</div><div class="u10l5-mh">Cubic</div>';
    const cellsT = TROWS.map((R) => [`1${U(R.big)}=${R.k}${U(R.small)}`, `1${U(R.big, 2)}=${R.sq}${U(R.small, 2)}`, `1${U(R.big, 3)}=${R.cb}${U(R.small, 3)}`].map((t) => { const e = h('div', 'u10l5-mc', T(t)); tb.appendChild(e); return e; }));
    const ws = add(stage, h('div', 'u10l5-ua'), 20, 262); ws.style.width = (W - 40) + 'px';
    const unit = (u) => `<span class="u10l5-un">${T(UU(u, p))}</span>`;
    const fr = (nu, de) => `<span class="u10l5-fr"><span class="u10l5-nu">${nu}</span><span class="u10l5-de">${de}</span></span>`;
    const conv = down ? fr(`${T(fac)} ${unit(d.to)}`, `${T('1')} ${unit(d.from)}`) : fr(`${T('1')} ${unit(d.to)}`, `${T(fac)} ${unit(d.from)}`);
    ws.innerHTML = `<span class="u10l5-uap">${fr(`${T(d.v)} ${unit(d.from)}`, T('1'))}</span><span class="u10l5-uap u10l5-op">${T('\\times')}</span><span class="u10l5-uap">${conv}</span><span class="u10l5-uap u10l5-op">${T('=')}</span><span class="u10l5-uap u10l5-res">${T(d.calc)}</span>`;
    const parts = [...ws.querySelectorAll('.u10l5-uap')]; parts.forEach(hide);
    const cutU = [...ws.querySelectorAll('.u10l5-un')].filter((e, i) => i === 0 || i === 2);
    const res = add(stage, h('div', 'u10l5-ures'), 20, 380); res.style.width = (W - 40) + 'px'; hide(res);
    const lin = cellsT[d.row][0], sqc = cellsT[d.row][p - 1];
    return [
      { cap: `Convert ${TQ(`${d.v}${U(d.from, p)}`)} to ${TQ(UU(d.to, p))}. Start from the linear fact: ${TQ(`1${U(r.big)}=${r.k}${U(r.small)}`)}.`,
        run: async (c) => { lin.classList.add('u10l5-hl1'); await pulse(c, lin, 1.08); } },
      { cap: `${p === 2 ? 'Square' : 'Cubic'} units, so ${sqw} it: ${TQ(`1${U(r.big, p)}=${r.k}^${p}=${fac}${U(r.small, p)}`)}.`,
        run: async (c) => { sqc.classList.add('u10l5-hl2'); await pulse(c, sqc, 1.08); } },
      { cap: `Write the given over 1. The conversion fraction puts ${TQ(UU(d.from, p))} on the <b>bottom</b>, so it cancels.`,
        run: async (c) => { for (const e of parts.slice(0, 3)) await fadeIn(c, e); } },
      { cap: `${TQ(UU(d.from, p))} on the top and on the bottom cancel, leaving ${TQ(UU(d.to, p))}.`,
        run: async (c) => { for (const e of cutU) await strike(c, e); } },
      { cap: `${TQ(`${d.calc}=${d.res}`)}, so ${TQ(`${d.v}${U(d.from, p)}=${d.res}${U(d.to, p)}`)}${d.sci ? `${TQ(`=${d.sci}${U(d.to, p)}`)} (2 d.p.)` : ''}.`,
        run: async (c) => { await fadeIn(c, parts[3]); await fadeIn(c, parts[4]); res.innerHTML = T(`=${d.res}${U(d.to, p)}${d.sci ? `=${d.sci}${U(d.to, p)}` : ''}`); await pop(c, res, 450); const s = stamp(stage, `${down ? '×' : '÷'} ${r.k}${p === 2 ? '²' : '³'}`, { x: W - 110, y: 420 }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: which factor? (flowchart) =============================== */
const WH = {
  e2: { label: 'Example 2(b): 7 m to cm', kind: 'len', given: '7\\text{ m}', to: '\\text{cm}', f1: '1\\text{ m}=100\\text{ cm}', f2: null, down: true, calc: '7\\times100=700\\text{ cm}' },
  c3: { label: 'Example 3(c)', kind: 'area', given: '0.0037\\text{ km}^2', to: '\\text{m}^2', f1: '1\\text{ km}=1000\\text{ m}', f2: '1\\text{ km}^2=1000^2=10^{6}\\text{ m}^2', down: true, calc: '0.0037\\times10^{6}=3700\\text{ m}^2' },
  d6: { label: 'Example 6(d)', kind: 'vol', given: '63\\,000\\text{ mm}^3', to: '\\text{cm}^3', f1: '1\\text{ cm}=10\\text{ mm}', f2: '1\\text{ cm}^3=10^3=1000\\text{ mm}^3', down: false, calc: '63\\,000\\div1000=63\\text{ cm}^3' },
  e8: { label: 'Example 8(e)', kind: 'vol', given: '58\\,320\\text{ in}^3', to: '\\text{ft}^3', f1: '1\\text{ ft}=12\\text{ in}', f2: '1\\text{ ft}^3=12^3=1728\\text{ in}^3', down: false, calc: '58\\,320\\div1728=33.75\\text{ ft}^3' },
  b9: { label: 'Example 9(b): Bin B', kind: 'area', given: '59\\text{ ft}^2', to: '\\text{in}^2', f1: '1\\text{ ft}=12\\text{ in}', f2: '1\\text{ ft}^2=12^2=144\\text{ in}^2', down: true, calc: '59\\times144=8496\\text{ in}^2' }
};
const which = {
  title: 'Which factor, and multiply or divide?',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(WH).map((k) => ({ v: k, label: WH[k].label })),
  intro: 'Two questions decide every conversion. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = WH[k], H = ex.def.height, FW = 600;
    const F = new Flowchart(stage, { x: 8, y: 6, width: FW, height: H - 12,
      nodes: {
        start: { x: 300, y: 38, w: 340, h: 54, html: '<b>What is being measured?</b>', cls: 'bk-round' },
        len: { x: 98, y: 146, w: 186, h: 78, html: `<b>Length</b>${T('\\text{cm},\\ \\text{ft}')}: factor once`, color: 'blue' },
        area: { x: 300, y: 146, w: 186, h: 78, html: `<b>Area</b>${T('\\text{cm}^2,\\ \\text{ft}^2')}: factor <b>squared</b>`, color: 'teal' },
        vol: { x: 502, y: 146, w: 186, h: 78, html: `<b>Volume</b>${T('\\text{cm}^3,\\ \\text{ft}^3')}: factor <b>cubed</b>`, color: 'purple' },
        dir: { x: 300, y: 266, w: 340, h: 54, html: '<b>Going to a smaller unit?</b>', cls: 'bk-round' },
        mul: { x: 160, y: 386, w: 250, h: 74, html: '<b>Yes: multiply</b>more of the small units', color: 'green' },
        div: { x: 440, y: 386, w: 250, h: 74, html: '<b>No: divide</b>fewer of the big units', color: 'red' }
      },
      edges: [{ from: 'start', to: 'len', route: 'vhv' }, { from: 'start', to: 'area' }, { from: 'start', to: 'vol', route: 'vhv' },
        { from: 'len', to: 'dir', route: 'vhv' }, { from: 'area', to: 'dir' }, { from: 'vol', to: 'dir', route: 'vhv' },
        { from: 'dir', to: 'mul', label: 'yes', route: 'vhv' }, { from: 'dir', to: 'div', label: 'no', route: 'vhv' }] });
    const Pn = panel(stage, FW + 22, 12, ex.W - FW - 34, H - 24, 'Convert');
    const kn = { len: 'length', area: 'square', vol: 'cubic' }[d.kind], fw = { len: 'used once', area: '<b>squared</b>', vol: '<b>cubed</b>' }[d.kind];
    return [
      { cap: `Convert ${TQ(d.given)} to ${TQ(d.to)}.`, run: async (c) => { await F.visit(c, 'start'); await say(c, Pn, T(`${d.given}\\to${d.to}`)); } },
      { cap: `${d.kind === 'len' ? 'A length' : `${TQ(d.to)} is a ${kn} unit`}, so the linear factor is ${fw}: ${TQ(d.f2 || d.f1)}.`,
        run: async (c) => { await F.go(c, 'start', d.kind); await F.visit(c, d.kind); await say(c, Pn, T(d.f1)); if (d.f2) await say(c, Pn, T(d.f2)); } },
      { cap: `${d.down ? 'Going to a <b>smaller</b> unit: there will be more of them, so <b>multiply</b>.' : 'Going to a <b>bigger</b> unit: there will be fewer of them, so <b>divide</b>.'}`,
        run: async (c) => { await F.go(c, d.kind, 'dir'); await F.visit(c, 'dir'); const e = d.down ? 'mul' : 'div'; await F.go(c, 'dir', e); await F.visit(c, e); } },
      { cap: `${TQ(d.calc)}.`, run: async (c) => { const r = line(Pn, T(d.calc), 'u10l5-boxed'); await pop(c, r, 450); await stampIn(c, stampP(Pn, d.down ? 'multiply' : 'divide')); } }
    ];
  }
};

/* =============================== explainer: Example 9, the two bins =============================== */
const BA = { L: 1.2, H: 0.7, D: 0.9 }, BB = { L: 1.2192, H: 0.762, D: 0.9144 };
const bins = {
  title: 'Example 9: the metric bin and the imperial bin, in one unit',
  height: 500,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'vol', label: 'Example 9(a) check: volume' }, { v: 'sa', label: 'Example 9(b) check: surface area' }],
  intro: 'Two bins, two systems. Convert both to the same unit, then compare. Press <b>Next</b>.',
  make(stage, k, ex) {
    const H = ex.def.height, s = 135, W = ex.W;
    const S = mkSvg(stage, W, H), g = svgEl('g', {}, S), gTop = svgEl('g', {}, S);
    const PA = oblique(80, 214, s), PB = oblique(378, 214, s);
    const fillW = { front: '#fff', top: '#f4f6fa', side: '#e9edf4' };
    const bA = drawBox(g, PA, [0, BA.L, 0, BA.H, 0, BA.D], { fill: fillW, sw: 2.6 }); hiddenEdges(g, PA, [0, BA.L, 0, BA.H, 0, BA.D]);
    const bB = drawBox(g, PB, [0, BB.L, 0, BB.H, 0, BB.D], { fill: fillW, sw: 2.6, stroke: PUR }); hiddenEdges(g, PB, [0, BB.L, 0, BB.H, 0, BB.D], PUR);
    boxLabels(stage, PA, BA.L, BA.H, BA.D, [T('1.2\\text{ m}'), T('0.7\\text{ m}'), T('0.9\\text{ m}')], 'u10l5-sm');
    boxLabels(stage, PB, BB.L, BB.H, BB.D, [T('4\\text{ ft}'), T('2.5\\text{ ft}'), T('3\\text{ ft}')], 'u10l5-sm u10l5-imp');
    lab(stage, PA(BA.L / 2, BA.H, BA.D)[0], PA(0, BA.H, BA.D)[1] - 14, '<b>Bin A</b> (metric)', 'u10l5-btitle', 'b');
    lab(stage, PB(BB.L / 2, BB.H, BB.D)[0], PB(0, BB.H, BB.D)[1] - 14, '<b>Bin B</b> (imperial)', 'u10l5-btitle u10l5-imp', 'b');
    const px0 = 640, Pn = panel(stage, px0, 12, W - px0 - 12, H - 24, k === 'vol' ? 'Volume in cm³' : 'Surface area in in²', 'u10l5-small');
    // comparison bars
    const bx = 120, bw = 330, by = [300, 360];
    const mk = (i, name, color) => { lab(stage, bx - 12, by[i] + 17, `<b>${name}</b>`, 'u10l5-bname', 'r'); const r = svgEl('rect', { x: bx, y: by[i], width: 0, height: 34, rx: 6, fill: color, 'fill-opacity': 0.8 }, S); const t = lab(stage, bx + 8, by[i] + 17, '', 'u10l5-bval', 'l'); return { r, t }; };
    const bar = [mk(0, 'Bin A', TEAL), mk(1, 'Bin B', PUR)];
    const vals = k === 'vol' ? [756000, 849505] : [7905, 8496], max = Math.max(...vals);
    const grow = async (c, i, txt) => { const w = bw * vals[i] / max; await tween(c, 700, (t) => bar[i].r.setAttribute('width', w * t)); bar[i].t.innerHTML = txt; bar[i].t.style.left = (bx + w + 10) + 'px'; await fadeIn(c, bar[i].t); };
    const faceHL = async (c, P, b, face, color, txt) => { const f = drawBox(gTop, P, b, { fill: { [face]: color }, faces: [face], sw: 0 }); f.style.opacity = 0; f.setAttribute('fill-opacity', 0.6); await appear(c, f, 260); const pl = polys(P, ...b)[face], cx = pl.reduce((a, q) => a + q[0], 0) / 4, cy = pl.reduce((a, q) => a + q[1], 0) / 4; await pop(c, lab(stage, cx, cy, T(txt), 'u10l5-flab', 'c')); };
    const diff = async (c, txt) => { const x1 = bx + bw * vals[0] / max, x2 = bx + bw; const br = svgEl('path', { d: `M${x1} ${by[1] + 44}v8H${x2}v-8`, stroke: RED, 'stroke-width': 2.6, fill: 'none' }, S); await appear(c, br); await pop(c, lab(stage, (x1 + x2) / 2 + 30, by[1] + 62, txt, 'u10l5-call u10l5-callr', 't')); };
    if (k === 'vol') return [
      { cap: 'Bin A is measured in metres and Bin B in feet. To compare, put both in the <b>same unit</b>: cubic centimetres.', run: (c) => say(c, Pn, '<b>Common unit:</b> ' + T('\\text{cm}^3')) },
      { cap: `Bin A: ${TQ('V=1.2\\times0.9\\times0.7=0.756\\text{ m}^3')}.`, run: (c) => say(c, Pn, T('V=1.2\\times0.9\\times0.7=0.756\\text{ m}^3'), 'u10l5-la') },
      { cap: `${TQ('1\\text{ m}^3=100^3=10^{6}\\text{ cm}^3')}, so Bin A is ${TQ('0.756\\times10^{6}=756\\,000\\text{ cm}^3')}.`,
        run: async (c) => { await say(c, Pn, T('0.756\\times10^{6}=756\\,000\\text{ cm}^3'), 'u10l5-la'); await grow(c, 0, T('756\\,000\\text{ cm}^3')); } },
      { cap: `Bin B: ${TQ('V=4\\times3\\times2.5=30\\text{ ft}^3')}.`, run: (c) => say(c, Pn, T('V=4\\times3\\times2.5=30\\text{ ft}^3'), 'u10l5-lb') },
      { cap: `${TQ('1\\text{ ft}=30.48\\text{ cm}')}, so ${TQ('1\\text{ ft}^3=30.48^3=28\\,316.846\\,592\\text{ cm}^3')}. Bin B is ${TQ('30\\times28\\,316.846\\,592\\approx849\\,505\\text{ cm}^3')}.`,
        run: async (c) => { await say(c, Pn, T('1\\text{ ft}^3=30.48^3\\text{ cm}^3'), 'u10l5-lb'); await say(c, Pn, T('30\\times28\\,316.846\\,592'), 'u10l5-lb'); await say(c, Pn, T('\\approx849\\,505\\text{ cm}^3'), 'u10l5-lb'); await grow(c, 1, T('849\\,505\\text{ cm}^3')); } },
      { cap: 'Bin B drawn to the same scale on top of Bin A: a little longer, deeper <b>and</b> taller (4 ft is 1.22 m, 3 ft is 0.91 m, 2.5 ft is 0.76 m).',
        run: async (c) => { const o = drawBox(gTop, PA, [0, BB.L, 0, BB.H, 0, BB.D], { stroke: PUR, sw: 2.6 }); o.setAttribute('stroke-dasharray', '8 6'); o.style.opacity = 0; await appear(c, o, 500); } },
      { cap: `Bin B is greater, by ${TQ('849\\,505-756\\,000=93\\,505\\text{ cm}^3')}.`,
        run: async (c) => { await diff(c, T('93\\,505\\text{ cm}^3')); const r = line(Pn, '<b>B</b> greater by ' + T('93\\,505\\text{ cm}^3'), 'u10l5-boxed'); await pop(c, r, 450); } }
    ];
    return [
      { cap: 'Surface area: six faces in three matching pairs. Put both bins in the <b>same unit</b>: square inches.', run: (c) => say(c, Pn, '<b>Common unit:</b> ' + T('\\text{in}^2')) },
      { cap: `Bin A’s faces: top ${TQ('1.2\\times0.9=1.08')}, front ${TQ('1.2\\times0.7=0.84')}, end ${TQ('0.9\\times0.7=0.63')} (all in ${TQ('\\text{m}^2')}).`,
        run: async (c) => { const b = [0, BA.L, 0, BA.H, 0, BA.D]; await faceHL(c, PA, b, 'top', AMB, '1.08'); await faceHL(c, PA, b, 'front', TEAL, '0.84'); await faceHL(c, PA, b, 'side', PUR, '0.63'); } },
      { cap: `Each face has a matching one on the hidden side: ${TQ('SA=2(1.08+0.84+0.63)=5.10\\text{ m}^2')}.`, run: (c) => say(c, Pn, T('SA=2(1.08+0.84+0.63)'), 'u10l5-la').then(() => say(c, Pn, T('\\phantom{SA}=5.10\\text{ m}^2'), 'u10l5-la')) },
      { cap: `${TQ('1\\text{ m}^2\\approx1550.003\\,1\\text{ in}^2')}, so Bin A is ${TQ('5.10\\times1550.003\\,1\\approx7905\\text{ in}^2')}.`,
        run: async (c) => { await say(c, Pn, T('5.10\\times1550.003\\,1\\approx7905\\text{ in}^2'), 'u10l5-la'); await grow(c, 0, T('7905\\text{ in}^2')); } },
      { cap: `Bin B’s faces: ${TQ('4\\times3=12')}, ${TQ('4\\times2.5=10')}, ${TQ('3\\times2.5=7.5')}, so ${TQ('SA=2(29.5)=59\\text{ ft}^2')}.`,
        run: async (c) => { const b = [0, BB.L, 0, BB.H, 0, BB.D]; await faceHL(c, PB, b, 'top', AMB, '12'); await faceHL(c, PB, b, 'front', TEAL, '10'); await faceHL(c, PB, b, 'side', PUR, '7.5'); await say(c, Pn, T('SA=2(12+10+7.5)=59\\text{ ft}^2'), 'u10l5-lb'); } },
      { cap: `${TQ('1\\text{ ft}^2=12^2=144\\text{ in}^2')}, so Bin B is ${TQ('59\\times144=8496\\text{ in}^2')}.`,
        run: async (c) => { await say(c, Pn, T('59\\times144=8496\\text{ in}^2'), 'u10l5-lb'); await grow(c, 1, T('8496\\text{ in}^2')); } },
      { cap: `Bin B is greater, by ${TQ('8496-7905=591\\text{ in}^2')}.`,
        run: async (c) => { await diff(c, T('591\\text{ in}^2')); const r = line(Pn, '<b>B</b> greater by ' + T('591\\text{ in}^2'), 'u10l5-boxed'); await pop(c, r, 450); } }
    ];
  }
};

/* =============================== mount =============================== */
mountStatics();
mountCarpet();
export const explainers = mountExplainers({ grid, shortcut, rect, shiftA, cube, prism, shiftV, imperial, cancel, which, bins });
