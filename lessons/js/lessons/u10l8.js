/* Math 10C · Unit 10 · Lesson 8 — Surface Area and Volume of Spheres and Hemispheres.
 * Warm-up tennis-ball can (unroll the string, split into snug cylinders), static figures (snug cylinder, orange peel,
 * Example 1 tank, Example 2 slice, Example 4 sheds), and the explainers:
 *   overflow (Mika's displacement test: the ball pushes out 2/3 of the cylinder; For discussion 900 mL),
 *   derive (the snug cylinder: 2/3 × πr²(2r) = 4/3 πr³; the warm-up tennis ball),
 *   peel (STAR: the orange peel fills four great circles; Archimedes' unrolled cylinder label),
 *   halve (Example 1 check; what happens if you forget to halve the diameter),
 *   slice (Example 2 check: half the volume; STAR: hemisphere = 2 great circles curved + 1 floor),
 *   string (Example 3 check: circumference → radius → volume; rounding r too early),
 *   domes (Example 4 check: the same dome with and without its floor),
 *   floor (Flowchart: does the flat base count? Example 2(b)/(c), Sana, Tavi, an open bowl),
 *   backwards (Example 5 check: run V = 4/3 πr³ backwards with a cube root; Mika's ball).
 * Colours: curved surface / peel orange, flat floor blue, radius red, diameter amber, cylinder teal, water light blue. */
import {
  h, tex, add, box, place, svgEl, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pulse, drawIn, liveCtx, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const INK = COLORS.ink, RAD = COLORS.red, DIA = COLORS.amber, CYL = COLORS.teal, FLR = COLORS.blue, GRN = COLORS.green;
const PEEL = '#f39a2c', PEEL_D = '#c56a06', PITH = '#fdf0d2', BALL = '#eef3fa', FLOOR_F = '#bcd2f6', WATER = '#8cc4f0', WATER_T = '#b9dcf7';
const EQ = 0.27; // ellipse squash for circles seen from slightly above
const SW = 2.6;
const PI = Math.PI;

/* ---------- numbers ---------- */
/** fixed decimals, thin space for 5+ digit whole parts (booklet style), for TeX */
function tn(v, d = 1) {
  const s = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d), [i, f] = s.split('.');
  const ii = i.replace('-', '').length > 4 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : i;
  return f ? ii + '.' + f : ii;
}

/* ---------- small DOM helpers ---------- */
const hide = (el) => { el.style.opacity = 0; return el; };
const show = (c, el) => fadeIn(c, el, 320);
function lab(host, x, y, html, pos = 'c', cls = '', gap = 6) { const d = h('div', 'u10l8-lab ' + cls, html); host.appendChild(d); place(d, x, y, pos, gap); return d; }
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u10l8-panel ' + cls, title ? `<div class="u10l8-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u10l8-line ' + cls, html); p.appendChild(d); return d; };
function svgOn(host, x, y, w, hh) {
  const s = svgEl('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}`, class: 'u10l8-svg' }, host);
  s.style.left = x + 'px'; s.style.top = y + 'px'; return s;
}
/** a static figure: a positioned box holding an SVG and HTML labels */
function figure(id, w, hh) {
  const host = document.getElementById(id); if (!host) return null;
  const wrap = box(h('div', 'u10l8-fig'), w, hh); host.appendChild(wrap);
  const svg = svgEl('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}`, class: 'u10l8-svg' }, wrap);
  return { wrap, svg };
}

/* ---------- SVG drawing: solids in a slightly-from-above view, hidden edges dashed ---------- */
function P(d, attrs, parent) { return svgEl('path', Object.assign({ d, fill: 'none', stroke: INK, 'stroke-width': SW, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, attrs), parent); }
const halfE = (cx, cy, rx, ry, top) => `M${cx - rx} ${cy} A${rx} ${ry} 0 0 ${top ? 1 : 0} ${cx + rx} ${cy}`;
const G = (parent, cls = '') => { const g = svgEl('g', { class: cls }, parent); g.style.transformBox = 'view-box'; g.style.transformOrigin = '0 0'; return g; };
const dot = (g, x, y, r = 3.5, fill = INK) => svgEl('circle', { cx: x, cy: y, r, fill }, g);
const seg = (g, a, b, attrs = {}) => P(`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, attrs, g);
function arrow2(g, a, b, color = INK, w = 2.2) { // double-headed dimension arrow
  const gg = G(g), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, k = 10, s = 5;
  seg(gg, a, b, { stroke: color, 'stroke-width': w });
  for (const [p, sg] of [[a, 1], [b, -1]]) P(`M${p[0] + sg * ux * k - uy * s} ${p[1] + sg * uy * k + ux * s} L${p[0]} ${p[1]} L${p[0] + sg * ux * k + uy * s} ${p[1] + sg * uy * k - ux * s}`, { stroke: color, 'stroke-width': w }, gg);
  return gg;
}

/** sphere centred (cx, cy) */
function sphere(g, cx, cy, r, o = {}) {
  const S = G(g, 'u10l8-sphere');
  S.body = svgEl('circle', { cx, cy, r, fill: o.fill || BALL, stroke: INK, 'stroke-width': SW, 'fill-opacity': o.op ?? 1 }, S);
  if (o.shine !== false) svgEl('ellipse', { cx: cx - r * 0.4, cy: cy - r * 0.42, rx: r * 0.24, ry: r * 0.13, fill: '#fff', opacity: 0.55, transform: `rotate(-38 ${cx - r * 0.4} ${cy - r * 0.42})` }, S);
  if (o.equator !== false) {
    S.back = P(halfE(cx, cy, r, r * EQ, true), { 'stroke-dasharray': '7 6', 'stroke-width': 1.8, opacity: 0.7 }, S);
    S.front = P(halfE(cx, cy, r, r * EQ, false), { 'stroke-width': 2 }, S);
  }
  if (o.dot !== false) dot(S, cx, cy);
  return S;
}
/** hemisphere (dome up) with its flat base centred at (cx, cy) */
function dome(g, cx, cy, r, o = {}) {
  const S = G(g, 'u10l8-dome'), ry = r * EQ;
  S.floor = svgEl('ellipse', { cx, cy, rx: r, ry, fill: FLOOR_F, stroke: FLR, 'stroke-width': 2.4 }, S);
  if (!o.floor) S.floor.style.opacity = 0;
  S.shell = svgEl('path', { d: `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} A${r} ${ry} 0 0 1 ${cx - r} ${cy} Z`, fill: o.fill || BALL, 'fill-opacity': o.op ?? 0.62 }, S);
  if (o.shine !== false) svgEl('ellipse', { cx: cx - r * 0.42, cy: cy - r * 0.55, rx: r * 0.2, ry: r * 0.11, fill: '#fff', opacity: 0.5, transform: `rotate(-45 ${cx - r * 0.42} ${cy - r * 0.55})` }, S);
  S.back = P(halfE(cx, cy, r, ry, true), { 'stroke-dasharray': '7 6', 'stroke-width': 1.8, opacity: 0.7 }, S);
  S.top = P(`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`, {}, S);
  S.front = P(halfE(cx, cy, r, ry, false), {}, S);
  if (o.dot !== false) dot(S, cx, cy);
  return S;
}
/** cylinder: bottom centre (cx, yb), radius r, height hh */
function cylinder(g, cx, yb, r, hh, o = {}) {
  const S = G(g, 'u10l8-cyl'), ry = r * EQ, yt = yb - hh;
  S.body = svgEl('path', { d: `M${cx - r} ${yt} L${cx - r} ${yb} A${r} ${ry} 0 0 0 ${cx + r} ${yb} L${cx + r} ${yt} A${r} ${ry} 0 0 1 ${cx - r} ${yt} Z`, fill: o.fill || '#e7f3f1', 'fill-opacity': o.op ?? 0.55 }, S);
  S.bback = P(halfE(cx, yb, r, ry, true), { 'stroke-dasharray': '7 6', 'stroke-width': 1.8, opacity: 0.7 }, S);
  S.sides = P(`M${cx - r} ${yt} L${cx - r} ${yb} M${cx + r} ${yt} L${cx + r} ${yb}`, { stroke: o.stroke || INK }, S);
  S.bfront = P(halfE(cx, yb, r, ry, false), { stroke: o.stroke || INK }, S);
  S.topE = svgEl('ellipse', { cx, cy: yt, rx: r, ry, fill: o.lid ? (o.fill || '#e7f3f1') : 'none', stroke: o.stroke || INK, 'stroke-width': SW }, S);
  S.yt = yt; return S;
}
/** a soccer ball */
function soccer(g, cx, cy, r) {
  const S = G(g, 'u10l8-soccer');
  svgEl('circle', { cx, cy, r, fill: '#fff', stroke: INK, 'stroke-width': SW }, S);
  const pent = (x, y, s, rot) => svgEl('path', { d: Array.from({ length: 5 }, (_, i) => { const a = rot + i * 2 * PI / 5; return (i ? 'L' : 'M') + (x + s * Math.cos(a)).toFixed(1) + ' ' + (y + s * Math.sin(a)).toFixed(1); }).join(' ') + 'Z', fill: '#2b3140' }, S);
  pent(cx, cy - r * 0.05, r * 0.2, -PI / 2);
  for (let i = 0; i < 5; i++) { const a = -PI / 2 + PI / 5 + i * 2 * PI / 5; pent(cx + r * 0.62 * Math.cos(a), cy - r * 0.05 + r * 0.62 * Math.sin(a), r * 0.15, a); }
  svgEl('ellipse', { cx: cx - r * 0.42, cy: cy - r * 0.45, rx: r * 0.18, ry: r * 0.1, fill: '#fff', opacity: 0.6, transform: `rotate(-40 ${cx - r * 0.42} ${cy - r * 0.45})` }, S);
  return S;
}
/** a tennis ball */
function tball(g, cx, cy, r) {
  const S = G(g, 'u10l8-tball');
  svgEl('circle', { cx, cy, r, fill: '#cfe13c', stroke: '#788c14', 'stroke-width': 2 }, S);
  P(`M${cx - 0.95 * r} ${cy - 0.3 * r} C${cx - 0.2 * r} ${cy - 0.05 * r} ${cx - 0.2 * r} ${cy + 0.75 * r} ${cx + 0.1 * r} ${cy + 0.99 * r}`, { stroke: '#fff', 'stroke-width': 3 }, S);
  P(`M${cx + 0.95 * r} ${cy + 0.3 * r} C${cx + 0.2 * r} ${cy + 0.05 * r} ${cx + 0.2 * r} ${cy - 0.75 * r} ${cx - 0.1 * r} ${cy - 0.99 * r}`, { stroke: '#fff', 'stroke-width': 3 }, S);
  return S;
}
/** an orange (whole) that can be peeled: .peel() turns it into the pale fruit */
function orange(g, cx, cy, r, seed = 3) {
  const S = G(g, 'u10l8-orange'), rnd = rng(seed);
  S.fruit = G(S);
  svgEl('circle', { cx, cy, r, fill: PITH, stroke: '#d9b77a', 'stroke-width': 2 }, S.fruit);
  for (let i = 0; i < 6; i++) { const a = i * PI / 6; P(`M${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)} Q${cx + r * 0.25 * Math.cos(a + 1.2)} ${cy + r * 0.25 * Math.sin(a + 1.2)} ${cx - r * Math.cos(a)} ${cy - r * Math.sin(a)}`, { stroke: '#e5c58c', 'stroke-width': 1.6 }, S.fruit); }
  S.skin = G(S);
  svgEl('circle', { cx, cy, r, fill: PEEL, stroke: PEEL_D, 'stroke-width': 2.4 }, S.skin);
  for (let i = 0; i < 26; i++) { const a = rnd() * 2 * PI, d = Math.sqrt(rnd()) * r * 0.86; svgEl('circle', { cx: cx + d * Math.cos(a), cy: cy + d * Math.sin(a), r: 1.6, fill: PEEL_D, opacity: 0.45 }, S.skin); }
  svgEl('ellipse', { cx: cx - r * 0.4, cy: cy - r * 0.42, rx: r * 0.22, ry: r * 0.12, fill: '#fff', opacity: 0.45, transform: `rotate(-38 ${cx - r * 0.4} ${cy - r * 0.42})` }, S.skin);
  svgEl('ellipse', { cx: cx + 6, cy: cy - r - 3, rx: 11, ry: 5, fill: GRN, transform: `rotate(-20 ${cx + 6} ${cy - r - 3})` }, S.skin);
  return S;
}

/* ---------- peel pieces: irregular wedges tiling a circle of radius R, which fly from a pile onto traced circles ---------- */
function rng(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function wedges(R, n, seed) {
  const rnd = rng(seed), a0 = rnd() * 2 * PI, cuts = [], c0 = [(rnd() - 0.5) * 0.18 * R, (rnd() - 0.5) * 0.18 * R], out = [];
  for (let i = 0; i < n; i++) cuts.push(a0 + (i + (rnd() - 0.5) * 0.35) * 2 * PI / n);
  for (let i = 0; i < n; i++) {
    const t0 = cuts[i], t1 = i + 1 < n ? cuts[i + 1] : cuts[0] + 2 * PI, pts = [c0];
    const e0 = 0.5 + (rnd() - 0.5) * 0.2; // a wobble halfway along the first radial edge
    pts.push([c0[0] + (R * Math.cos(t0) - c0[0]) * e0 + (rnd() - 0.5) * 6, c0[1] + (R * Math.sin(t0) - c0[1]) * e0 + (rnd() - 0.5) * 6]);
    for (let k = 0; k <= 10; k++) { const t = t0 + (t1 - t0) * k / 10, rr = R * (0.965 + (rnd() - 0.5) * 0.035); pts.push([rr * Math.cos(t), rr * Math.sin(t)]); }
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    out.push(pts.map(([x, y]) => [cx + (x - cx) * 0.95, cy + (y - cy) * 0.95]));
  }
  return out;
}
const setT = (g, p) => g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(1)}) scale(${p.s.toFixed(3)})`);
/** pieces for the given circle centres, piled on (px, py) with pile radius scale `ps`; returns [{ g, from, to }] per circle */
function peelSet(parent, centres, R, pile, seed, nPer = 4) {
  const rnd = rng(seed + 77);
  return centres.map((C, i) => wedges(R, nPer, seed + i * 13).map((pts) => {
    const g = G(parent, 'u10l8-piece');
    svgEl('path', { d: 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' Z', fill: PEEL, stroke: PEEL_D, 'stroke-width': 1.4 }, g);
    const from = { x: pile.x + (rnd() - 0.5) * pile.r * 0.7, y: pile.y + (rnd() - 0.5) * pile.r * 0.7, rot: i * 90 + (rnd() - 0.5) * 60, s: pile.s };
    const to = { x: C[0], y: C[1], rot: 0, s: 1 };
    setT(g, from); return { g, from, to };
  }));
}
async function flyPieces(c, list, ms = 900, lift = 70, stagger = 90) {
  await Promise.all(list.map((p, k) => (async () => {
    if (!c || c.fast) { setT(p.g, p.to); return; }
    await sleep(c, k * stagger);
    await tween(c, ms, (t) => setT(p.g, { x: p.from.x + (p.to.x - p.from.x) * t, y: p.from.y + (p.to.y - p.from.y) * t - lift * Math.sin(PI * t), rot: p.from.rot + (p.to.rot - p.from.rot) * t, s: p.from.s + (p.to.s - p.from.s) * t }));
  })()));
}
const traced = (g, cx, cy, r, color = INK) => svgEl('circle', { cx, cy, r, fill: 'none', stroke: color, 'stroke-width': 2.2, 'stroke-dasharray': '8 6', class: 'bk-stroke' }, g);

/* =============================== warm-up: the tennis ball can =============================== */
function mountWarm() {
  const F = figure('u10l8-can', 480, 380); if (!F) return;
  const { svg, wrap } = F, cx = 180, rb = 48, yb = 340, yt = yb - 6 * rb, ry = rb * 0.3;
  const cg = G(svg);
  svgEl('path', { d: `M${cx - rb} ${yt} L${cx - rb} ${yb} A${rb} ${ry} 0 0 0 ${cx + rb} ${yb} L${cx + rb} ${yt} Z`, fill: '#e8f0fc' }, cg);
  for (const k of [1, 3, 5]) tball(cg, cx, yb - k * rb, rb - 1);
  svgEl('path', { d: `M${cx - rb} ${yt} L${cx - rb} ${yb} A${rb} ${ry} 0 0 0 ${cx + rb} ${yb} L${cx + rb} ${yt} Z`, fill: '#e8f0fc', opacity: 0.3 }, cg);
  P(`M${cx - rb} ${yt} L${cx - rb} ${yb} A${rb} ${ry} 0 0 0 ${cx + rb} ${yb} L${cx + rb} ${yt}`, { 'stroke-width': 2.4 }, cg);
  svgEl('rect', { x: cx - rb - 7, y: yt - 12, width: 2 * rb + 14, height: 12, fill: '#e0605a', stroke: '#9c2f2a', 'stroke-width': 1.6 }, cg);
  svgEl('ellipse', { cx, cy: yt - 12, rx: rb + 7, ry: ry + 1, fill: '#e97c76', stroke: '#9c2f2a', 'stroke-width': 1.6 }, cg);
  const sy = yb - 3 * rb; // the string around the middle ball
  P(halfE(cx, sy, rb, ry, false), { stroke: RAD, 'stroke-width': 4 }, cg);
  P(halfE(cx, sy, rb, ry, true), { stroke: RAD, 'stroke-width': 3, 'stroke-dasharray': '5 4' }, cg);
  arrow2(cg, [cx - rb - 26, yt], [cx - rb - 26, yb]);
  lab(wrap, cx - rb - 34, (yt + yb) / 2 - 8, 'height<br>of can', 'w', 'u10l8-wl');
  const hval = hide(lab(wrap, cx - rb - 34, (yt + yb) / 2 + 40, '20.1 cm', 'w', 'u10l8-wl u10l8-wv'));
  const lAround = lab(wrap, cx + rb + 6, sy + 4, 'distance<br>around', 'e', 'u10l8-wl u10l8-wred');
  // one ball close up
  const bx = 392, by = 150, br = 62;
  tball(cg, bx, by, br);
  lab(wrap, bx, by - br - 8, 'one ball, close up', 'n', 'u10l8-wl');
  P(`M${bx - br} ${by} L${bx - br} ${by + br + 30} M${bx + br} ${by} L${bx + br} ${by + br + 30}`, { 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }, cg);
  arrow2(cg, [bx - br, by + br + 24], [bx + br, by + br + 24]);
  lab(wrap, bx, by + br + 30, 'about 6.7 cm', 's', 'u10l8-wl');
  // the unrolled string
  const live = { s: null, k: null }, ctx = liveCtx(), L = PI * 2 * rb, xs = cx + rb + 20;
  document.getElementById('u10l8-wstring').addEventListener('click', async () => {
    if (live.s) { live.s.forEach((e) => e.remove()); live.s = null; hide(hval); lAround.style.opacity = 1; return; }
    lAround.style.opacity = 0;
    const g = G(svg), bar = P(`M${xs} ${yb} L${xs} ${yb - L}`, { stroke: RAD, 'stroke-width': 7, class: 'bk-stroke' }, g);
    const extra = P(`M${xs + 14} ${yt} L${xs + 14} ${yb - L}`, { stroke: INK, 'stroke-width': 2 }, g);
    const guide = P(`M${cx - rb - 26} ${yt} L${xs + 22} ${yt}`, { stroke: INK, 'stroke-width': 1.4, 'stroke-dasharray': '4 4' }, g);
    extra.style.opacity = 0; guide.style.opacity = 0;
    const l1 = hide(lab(wrap, xs + 10, yb - L - 2, 'around ≈ <b>21.0 cm</b>', 'e', 'u10l8-wl u10l8-wred u10l8-wbg'));
    live.s = [g, l1];
    await drawIn(bar, 1400, ctx); await appear(ctx, guide); await appear(ctx, hval); await appear(ctx, extra); await pop(ctx, l1);
  });
  document.getElementById('u10l8-wsnug').addEventListener('click', async () => {
    if (live.k) { live.k.forEach((e) => e.remove()); live.k = null; return; }
    const g = G(svg), els = [g];
    for (const k of [2, 4]) { const l = P(`M${cx - rb - 8} ${yb - k * rb} L${cx + rb + 8} ${yb - k * rb}`, { stroke: CYL, 'stroke-width': 3, 'stroke-dasharray': '9 5', class: 'bk-stroke' }, g); l.style.opacity = 0; }
    const t = hide(lab(wrap, cx, yb + 14, '3 snug cylinders, one ball each', 'c', 'u10l8-wl u10l8-wteal u10l8-wbg'));
    els.push(t); live.k = els;
    for (const l of g.querySelectorAll('path')) await appear(ctx, l, 350);
    await pop(ctx, t);
  });
}

/* =============================== static figures =============================== */
function mountStatics() {
  // Section 1: the snug cylinder
  let F = figure('u10l8-snugfig', 250, 250);
  if (F) {
    const { svg, wrap } = F, cx = 105, r = 72, yb = 222, hh = 2 * r, g = G(svg);
    const C = cylinder(g, cx, yb, r, hh, { op: 0.4 });
    sphere(g, cx, yb - r, r, { op: 0.85 });
    g.appendChild(C.sides); g.appendChild(C.topE); g.appendChild(C.bfront);
    seg(g, [cx, yb - r], [cx + r, yb - r], { stroke: RAD, 'stroke-width': 3 });
    lab(wrap, cx + r / 2, yb - r - 3, T('r'), 'n', 'u10l8-rl');
    arrow2(g, [cx + r + 26, yb - hh], [cx + r + 26, yb]);
    lab(wrap, cx + r + 32, yb - r, T('2r'), 'e', 'u10l8-tl');
  }
  // Section 1: the orange-peel test
  F = figure('u10l8-peelfig', 600, 130);
  if (F) {
    const { svg, wrap } = F, R = 44, cy = 58, g = G(svg);
    const o = orange(g, 52, cy, R); o.skin.remove();
    const cs = [150, 250, 350, 450].map((x) => [x, cy]);
    cs.forEach(([x, y]) => traced(g, x, y, R));
    lab(wrap, 52, cy + R + 4, 'peeled orange', 's', 'u10l8-sm');
    const sets = peelSet(g, cs, R, { x: 52, y: cy, r: R, s: 0.5 }, 11);
    sets.flat().forEach((p) => setT(p.g, p.to));
    seg(g, [450, cy], [450 + R, cy], { stroke: RAD, 'stroke-width': 2.6 }); lab(wrap, 450 + R / 2, cy - 2, T('r'), 'n', 'u10l8-rl');
    lab(wrap, 508, cy, 'the peel fills<br>about <b>4</b> circles<br>of radius ' + T('r'), 'e', 'u10l8-sm');
  }
  // Example 1: the tank
  F = figure('u10l8-ex1fig', 220, 230);
  if (F) {
    const { svg, wrap } = F, cx = 110, cy = 100, r = 88, g = G(svg);
    sphere(g, cx, cy, r);
    lab(wrap, cx, cy + r + 12, T('d=5.8\\text{ m}'), 's', 'u10l8-tl');
  }
  // Example 2: sphere → hemisphere
  F = figure('u10l8-ex2fig', 470, 190);
  if (F) {
    const { svg, wrap } = F, r = 68, g = G(svg);
    sphere(g, 90, 82, r);
    P('M200 82 L262 82', { 'stroke-width': 3 }, g); P('M250 74 L264 82 L250 90', { 'stroke-width': 3 }, g);
    dome(g, 370, 108, r);
    lab(wrap, 90, 82 + r + 10, 'sphere, radius ' + T('r'), 's', 'u10l8-sm');
    lab(wrap, 370, 108 + r * EQ + 10, 'hemisphere, radius ' + T('r'), 's', 'u10l8-sm');
  }
  // Example 4: the two sheds
  for (const [id, floor, name] of [['u10l8-ex4a', true, 'Sana’s shed (with floor)'], ['u10l8-ex4b', false, 'Tavi’s shed (no floor)']]) {
    F = figure(id, 300, 214);
    if (!F) continue;
    const { svg, wrap } = F, g = G(svg), cx = 150, cy = 118, r = 96;
    dome(g, cx, cy, r, { floor });
    lab(wrap, cx, cy + r * EQ + 4, T('d=12\\text{ ft}'), 's', 'u10l8-tl');
    lab(wrap, cx, cy + r * EQ + 36, name, 's', 'u10l8-sm');
  }
}

/* =============================== explainer: Mika's overflow test =============================== */
const OVF = { mika: { label: 'Mika: 480 mL', total: 480 }, disc: { label: 'For discussion: 900 mL', total: 900 } };
const overflow = {
  title: 'Mika’s overflow test',
  height: 440,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(OVF).map((k) => ({ v: k, label: OVF[k].label })),
  intro: 'A ball and a cylinder with the <b>same radius</b>; the cylinder is as tall as the ball. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = OVF[k], tot = d.total, out = tot * 2 / 3, left = tot / 3, Hh = ex.def.height;
    const svg = svgOn(stage, 0, 0, 560, Hh), g = G(svg);
    const cx = 270, r = 70, ry = r * EQ, yb = 336, yt = yb - 2 * r, bx0 = 70, bx1 = 470, btop = 300, bbot = 420;
    // overflow container + its water
    svgEl('path', { d: `M${bx0} ${btop} L${bx0} ${bbot} L${bx1} ${bbot} L${bx1} ${btop}`, fill: '#f3f7fb', stroke: 'none' }, g);
    const bw = svgEl('rect', { x: bx0 + 2, y: bbot - 1, width: bx1 - bx0 - 4, height: 0, fill: WATER, opacity: 0.85 }, g);
    svgEl('rect', { x: cx - 48, y: yb, width: 96, height: bbot - yb, fill: '#d6cfbf', stroke: '#a59c88', 'stroke-width': 1.5 }, g);
    P(`M${bx0} ${btop} L${bx0} ${bbot} L${bx1} ${bbot} L${bx1} ${btop}`, { 'stroke-width': 3 }, g);
    lab(stage, bx0 + 8, bbot - 6, 'overflow container', 'ne', 'u10l8-sm u10l8-muted', 0);
    // cylinder water, ball, cylinder outline
    const back = P(halfE(cx, yb, r, ry, true), { 'stroke-dasharray': '7 6', 'stroke-width': 1.8, opacity: 0.7 }, g);
    const ball = G(g); sphere(ball, cx, 0, r, { fill: '#f1d9b8' });
    const hold = seg(g, [cx, 0], [cx, 0], { 'stroke-width': 1.6 });
    const wBody = svgEl('path', { fill: WATER, opacity: 0.6 }, g), wTop = svgEl('ellipse', { cx, rx: r, ry, fill: WATER_T, stroke: '#4d93cf', 'stroke-width': 1.4, opacity: 0.9 }, g);
    const sp = [P('', { stroke: '#4d93cf', 'stroke-width': 3, 'stroke-dasharray': '6 5' }, g), P('', { stroke: '#4d93cf', 'stroke-width': 3, 'stroke-dasharray': '6 5' }, g)];
    sp.forEach(hide);
    P(`M${cx - r} ${yt} L${cx - r} ${yb} M${cx + r} ${yt} L${cx + r} ${yb}`, {}, g); P(halfE(cx, yb, r, ry, false), {}, g);
    svgEl('ellipse', { cx, cy: yt, rx: r, ry, fill: 'none', stroke: INK, 'stroke-width': SW }, g);
    void back;
    const setWater = (lvl) => { wBody.setAttribute('d', `M${cx - r} ${lvl} L${cx - r} ${yb} A${r} ${ry} 0 0 0 ${cx + r} ${yb} L${cx + r} ${lvl} A${r} ${ry} 0 0 1 ${cx - r} ${lvl} Z`); wTop.setAttribute('cy', lvl); };
    const by0 = yt - r - 34, by1 = yt + r;
    const setBall = (by) => { ball.setAttribute('transform', `translate(0 ${by})`); hold.setAttribute('d', `M${cx} 0 L${cx} ${by - r}`); };
    const frac = (by) => { const dd = Math.max(0, Math.min(2 * r, by + r - yt)); return dd * dd * (3 * r - dd) / (4 * r * r * r); };
    const setBasin = (f) => { const hh = 70 * f; bw.setAttribute('y', bbot - 1 - hh); bw.setAttribute('height', hh); };
    setWater(yt); setBall(by0); setBasin(0);
    const lCyl = lab(stage, cx + r + 12, yt + 10, `<b>${tot} mL</b>`, 'e', 'u10l8-wv');
    const hgt = G(g); arrow2(hgt, [cx - r - 22, yt], [cx - r - 22, yb]); hgt.style.opacity = 0;
    const lH = hide(lab(stage, cx - r - 28, (yt + yb) / 2, 'height =<br>ball’s<br>diameter', 'w', 'u10l8-sm'));
    const rad = seg(g, [cx, yt], [cx + r, yt], { stroke: RAD, 'stroke-width': 3 }); rad.style.opacity = 0;
    const lR = hide(lab(stage, cx + r / 2, yt - ry - 2, 'same ' + T('r'), 'n', 'u10l8-rl'));
    const lOut = hide(lab(stage, (bx0 + cx - 48) / 2, bbot - 40, `<b>${tot === 480 ? 320 : out} mL</b>`, 'c', 'u10l8-wv u10l8-wbg'));
    const lLeft = hide(lab(stage, cx + r + 12, yb - 22, `<b>${left} mL</b> left`, 'e', 'u10l8-wv'));
    // panel
    const Pn = panel(stage, 580, 14, ex.W - 594, Hh - 28, 'Mika’s measurements');
    const p1 = line(Pn, `Cylinder, full: <b>${tot} mL</b>`), p2 = hide(line(Pn, `Overflow (the ball): <b>${out} mL</b>`)), p3 = hide(line(Pn, `Left in the cylinder: <b>${left} mL</b>`));
    const p4 = hide(line(Pn, T(`\\dfrac{${out}}{${tot}}=\\dfrac{2}{3}`) + ' &nbsp; ' + T(`\\dfrac{${left}}{${tot}}=\\dfrac{1}{3}`), 'u10l8-big'));
    const bar = h('div', 'u10l8-bar', `<div class="u10l8-bar-a">ball ${T('\\tfrac23')}</div><div class="u10l8-bar-b">${T('\\tfrac13')}</div>`); Pn.appendChild(hide(bar));
    void p1;
    return [
      { cap: `The cylinder has the ball’s <b>radius</b>, and its height is the ball’s <b>diameter</b>. It is full: <b>${tot} mL</b> of water.`,
        run: async (c) => { await appear(c, rad); await pop(c, lR); await appear(c, hgt); await show(c, lH); await pulse(c, lCyl); } },
      { cap: `Lower the ball straight down. Every bit of ball that goes in pushes the same amount of water over the rim.`,
        run: async (c) => {
          [lR, lH].forEach(hide); rad.style.opacity = 0; hgt.style.opacity = 0;
          sp[0].setAttribute('d', `M${cx - r} ${yt} Q${cx - r - 14} ${yt + 6} ${cx - r - 14} ${yt + 30} L${cx - r - 14} ${bbot - 8}`);
          sp[1].setAttribute('d', `M${cx + r} ${yt} Q${cx + r + 14} ${yt + 6} ${cx + r + 14} ${yt + 30} L${cx + r + 14} ${bbot - 8}`);
          if (!c.fast) sp.forEach((s) => { s.style.opacity = 1; });
          await tween(c, 2600, (t) => { const by = by0 + (by1 - by0) * t; setBall(by); setBasin(frac(by)); });
          sp.forEach(hide);
        } },
      { cap: `The ball is all the way in, touching the bottom. <b>${out} mL</b> spilled out: that is exactly the ball’s volume.`,
        run: async (c) => { await pop(c, lOut); await show(c, p2); } },
      { cap: `Lift the ball out. The water that is left fills only part of the cylinder: <b>${left} mL</b>.`,
        run: async (c) => {
          lCyl.style.opacity = 0;
          await tween(c, 1400, (t) => { setBall(by1 + (by0 - by1) * t); setWater(yt + (4 * r / 3) * Math.min(1, t * 1.6)); });
          await pop(c, lLeft); await show(c, p3);
        } },
      { cap: `${T(`${out}`)} is ${T('\\tfrac23')} of ${T(`${tot}`)}, and the ${T(`${left}`)} left behind is the other ${T('\\tfrac13')}.`,
        run: async (c) => { await pop(c, p4); await show(c, bar); } },
      { cap: `<b>A sphere’s volume is ${T('\\tfrac23')} of its snug cylinder</b> (same radius, height = diameter), whatever the size.`,
        run: async (c) => { const s = stamp(Pn, '⅔ of the cylinder ✓'); s.style.alignSelf = 'center'; s.style.marginTop = '6px'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: the snug cylinder → 4/3 πr³ =============================== */
const DER = {
  r: { label: `Any radius ${T('r')}` },
  tb: { label: `Warm-up tennis ball: ${T('r=3.35')} cm` }
};
const derive = {
  title: 'From the snug cylinder to the sphere formula',
  height: 420,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(DER).map((k) => ({ v: k, label: DER[k].label })),
  intro: 'Mika’s test works for every ball. Turn it into a formula. Press <b>Next</b>.',
  make(stage, k, ex) {
    const num = k === 'tb', Hh = ex.def.height;
    const svg = svgOn(stage, 0, 0, 380, Hh), g = G(svg), cx = 175, r = 118, yb = 380, yt = yb - 2 * r;
    const C = cylinder(g, cx, yb, r, 2 * r, { op: 0.45 }); hide(C);
    const S = sphere(g, cx, yb - r, r, { op: 0.9, fill: num ? '#dbe86a' : BALL }); hide(S);
    const front = G(g); front.appendChild(C.sides.cloneNode()); front.appendChild(C.topE.cloneNode()); front.appendChild(C.bfront.cloneNode()); hide(front);
    const rad = seg(g, [cx, yb - r], [cx + r, yb - r], { stroke: RAD, 'stroke-width': 3.5 }); hide(rad);
    const lR = hide(lab(stage, cx + r / 2, yb - r - 4, num ? T('3.35') : T('r'), 'n', 'u10l8-rl'));
    const hA = G(g); arrow2(hA, [cx + r + 28, yt], [cx + r + 28, yb], DIA, 2.6); hide(hA);
    const lH = hide(lab(stage, cx + r + 34, yb - r, num ? T('6.7') : T('2r'), 'e', 'u10l8-dl'));
    const Pn = panel(stage, 400, 14, ex.W - 414, Hh - 28, num ? 'One tennis ball, cm' : 'Volume', 'u10l8-lg');
    const L = num ? [
      'V_{\\text{cylinder}}=\\pi r^2h',
      'h=2r=2(3.35)=6.7',
      'V_{\\text{cylinder}}=\\pi(3.35)^2(6.7)\\approx236.2\\text{ cm}^3',
      'V_{\\text{sphere}}=\\tfrac23V_{\\text{cylinder}}\\approx\\tfrac23(236.2)\\approx157.5\\text{ cm}^3',
      'V_{\\text{sphere}}=\\tfrac43\\pi(3.35)^3\\approx157.5\\text{ cm}^3'
    ] : [
      'V_{\\text{cylinder}}=\\pi r^2h',
      'h=2r',
      'V_{\\text{cylinder}}=\\pi r^2(2r)=2\\pi r^3',
      'V_{\\text{sphere}}=\\tfrac23V_{\\text{cylinder}}=\\tfrac23(2\\pi r^3)',
      'V_{\\text{sphere}}=\\dfrac43\\pi r^3'
    ];
    const ls = L.map((s, i) => hide(line(Pn, T(s), i === 4 ? 'u10l8-boxed' : '')));
    return [
      { cap: num ? `One tennis ball from the warm-up and the part of the can it sits in: its <b>snug cylinder</b>.` : `A ball in its <b>snug</b> cylinder: touching the top, the bottom and the curved wall all at once.`,
        run: async (c) => { await appear(c, C); await pop(c, S, 500); await appear(c, front); } },
      { cap: num ? `Same radius: ${T('r=3.35')} cm (half of 6.7 cm). The cylinder’s volume is ${T('\\pi r^2h')}.` : `Ball and cylinder have the <b>same radius</b> ${T('r')}. The cylinder’s volume is ${T('\\pi r^2h')}.`,
        run: async (c) => { await appear(c, rad); await pop(c, lR); await show(c, ls[0]); } },
      { cap: num ? `Its height is one ball’s diameter: ${T('h=6.7')} cm.` : `Its height is the ball’s <b>diameter</b>: ${T('h=2r')}.`,
        run: async (c) => { await appear(c, hA); await pop(c, lH); await show(c, ls[1]); } },
      { cap: num ? `${T('\\pi(3.35)^2(6.7)\\approx236.2')} cm³ for the snug cylinder.` : `Substitute ${T('h=2r')}: the snug cylinder holds ${T('\\pi r^2(2r)=2\\pi r^3')}.`,
        run: async (c) => { await show(c, ls[2]); await pulse(c, C); } },
      { cap: num ? `The ball is ${T('\\tfrac23')} of it: about <b>157.5 cm³</b>, the same as ${T('\\tfrac43\\pi r^3')}. (Three balls: about 472.4 of 708.7 cm³, still ${T('\\tfrac23')}.)` : `Mika’s test: the sphere is ${T('\\tfrac23')} of that. ${T('\\tfrac23\\times2\\pi r^3=\\tfrac43\\pi r^3')}.`,
        run: async (c) => { await show(c, ls[3]); await pop(c, ls[4], 500); await pulse(c, S, 1.04); } }
    ];
  }
};

/* =============================== explainer: the orange peel (STAR) and Archimedes =============================== */
const peel = {
  title: 'Why 4πr²? Four great circles',
  height: 430,
  choices: [{ v: 'peel', label: 'The orange-peel test' }, { v: 'arch', label: 'Archimedes: unroll the snug cylinder' }],
  intro: (v) => (v === 'peel' ? 'Peel an orange and flatten the peel. How many circles of the same radius does it cover? Press <b>Next</b>.' : 'Another way to see 4πr². Press <b>Next</b>.'),
  make(stage, k, ex) {
    const W = ex.W, Hh = ex.def.height;
    const svg = svgOn(stage, 0, 0, W, Hh), g = G(svg);
    if (k === 'arch') {
      const cx = 140, r = 82, yb = 290, yt = yb - 2 * r, ry = r * EQ, X0 = 300, Lw = 2 * PI * r;
      const C = cylinder(g, cx, yb, r, 2 * r, { op: 0 });
      const lbl = svgEl('path', { d: C.body.getAttribute('d'), fill: CYL, 'fill-opacity': 0.35 }, g);
      g.insertBefore(lbl, C);
      const S = sphere(g, cx, yb - r, r, { op: 0.95 });
      const front = G(g); front.appendChild(C.sides.cloneNode()); front.appendChild(C.topE.cloneNode()); front.appendChild(C.bfront.cloneNode());
      void S;
      const rad = seg(g, [cx, yb - r], [cx + r, yb - r], { stroke: RAD, 'stroke-width': 3 });
      lab(stage, cx + r / 2, yb - r - 3, T('r'), 'n', 'u10l8-rl');
      const rect = svgEl('rect', { x: cx - r, y: yt, width: 2 * r, height: 2 * r, fill: CYL, 'fill-opacity': 0.3, stroke: CYL, 'stroke-width': 3 }, g); hide(rect);
      const wA = G(g); arrow2(wA, [X0, yb + 22], [X0 + Lw, yb + 22], CYL); hide(wA);
      const hA = G(g); arrow2(hA, [X0 + Lw + 22, yt], [X0 + Lw + 22, yb], DIA); hide(hA);
      const lW = hide(lab(stage, X0 + Lw / 2, yb + 28, `${T('2\\pi r')} &nbsp;(the circumference)`, 's', 'u10l8-tl'));
      const lHt = hide(lab(stage, X0 + Lw + 28, (yt + yb) / 2, T('2r'), 'e', 'u10l8-dl'));
      const f = hide(lab(stage, X0 + Lw / 2, (yt + yb) / 2, T('2\\pi r\\times2r=4\\pi r^2'), 'c', 'u10l8-big u10l8-wbg'));
      const cap0 = hide(lab(stage, W / 2, Hh - 30, `the sphere’s surface: ${T('SA_{\\text{sphere}}=4\\pi r^2')}`, 'c', 'u10l8-big'));
      void rad; void ry;
      return [
        { cap: `Put the sphere in its snug cylinder: radius ${T('r')}, height ${T('2r')}. Colour the cylinder’s curved side (its label).`,
          run: async (c) => { await pulse(c, lbl, 1.03); } },
        { cap: `Peel off the label and <b>unroll</b> it.`,
          run: async (c) => {
            rect.style.opacity = 1;
            await tween(c, 1600, (t) => { rect.setAttribute('x', (cx - r) + (X0 - (cx - r)) * t); rect.setAttribute('width', 2 * r + (Lw - 2 * r) * t); lbl.style.opacity = 1 - t; }, (t) => t);
          } },
        { cap: `It is a <b>rectangle</b>: as long as the circumference, ${T('2\\pi r')}, and as tall as the cylinder, ${T('2r')}.`,
          run: async (c) => { await appear(c, wA); await show(c, lW); await appear(c, hA); await show(c, lHt); } },
        { cap: `Area ${T('=2\\pi r\\times2r=4\\pi r^2')}. Archimedes proved the sphere’s surface is <b>exactly</b> this much: the same 4 great circles as the orange peel.`,
          run: async (c) => { await pop(c, f, 500); await show(c, cap0); } }
      ];
    }
    const R = 76, cy = 160, ox = 100, last = W - 32 - R, first = 290, step = (last - first) / 3;
    const cs = [0, 1, 2, 3].map((i) => [first + i * step, cy]);
    const O = orange(g, ox, cy, R);
    const rad = seg(g, [ox, cy], [ox + R, cy], { stroke: RAD, 'stroke-width': 3 });
    const lR = lab(stage, ox + R / 2, cy - 4, T('r'), 'n', 'u10l8-rl');
    const circ = cs.map(([x, y]) => traced(g, x, y, R)); circ.forEach(hide);
    const cr = seg(g, [cs[3][0], cy], [cs[3][0] + R, cy], { stroke: RAD, 'stroke-width': 3 }); hide(cr);
    const lcr = hide(lab(stage, cs[3][0] + R / 2, cy - 4, T('r'), 'n', 'u10l8-rl'));
    const pg = G(g), sets = peelSet(pg, cs, R, { x: ox, y: cy, r: R, s: 0.5 }, 5); hide(pg);
    const pis = cs.map(([x]) => hide(lab(stage, x, cy + R + 10, T('\\pi r^2'), 's', 'u10l8-tl')));
    const fl = hide(lab(stage, W / 2 + 60, Hh - 52, T('SA_{\\text{sphere}}=\\pi r^2+\\pi r^2+\\pi r^2+\\pi r^2=4\\pi r^2'), 'c', 'u10l8-big'));
    const lOr = lab(stage, ox, cy + R + 10, 'orange', 's', 'u10l8-sm');
    return [
      { cap: `An orange with radius ${T('r')}. Trace <b>four circles</b> with the <b>same radius</b> ${T('r')}.`,
        run: async (c) => { for (const ci of circ) { ci.style.opacity = 1; await drawIn(ci, 450, c); } await appear(c, cr); await pop(c, lcr); } },
      { cap: `Peel the orange and press the pieces of peel flat.`,
        run: async (c) => { rad.style.opacity = 0; lR.style.opacity = 0; lOr.innerHTML = 'peeled orange'; await appear(c, pg); await Promise.all([appear(c, O.skin, 200), pulse(c, pg, 1.06)]); O.skin.style.opacity = 0; } },
      { cap: `Lay the peel inside the circles. <b>One</b> circle full…`,
        run: async (c) => { await flyPieces(c, sets[0], 900, 70, 120); } },
      { cap: `…<b>two</b>, <b>three</b>, <b>four</b>. The peel fills almost exactly <b>four</b> circles of radius ${T('r')}.`,
        run: async (c) => { cr.style.opacity = 0; lcr.style.opacity = 0; for (let i = 1; i < 4; i++) await flyPieces(c, sets[i], 750, 60, 70); } },
      { cap: `Each circle is ${T('\\pi r^2')}, so the surface of a sphere is ${T('SA_{\\text{sphere}}=4\\pi r^2')}: <b>four great circles</b>.`,
        run: async (c) => { for (const p of pis) await pop(c, p, 260); await show(c, fl); } }
    ];
  }
};

/* =============================== explainer: Example 1, halve the diameter first =============================== */
const halve = {
  title: 'Example 1 check: halve the diameter first',
  height: 420,
  choices: [{ v: 'ex1', label: 'Example 1 check' }, { v: 'oops', label: 'Forget to halve?' }],
  intro: (v) => (v === 'ex1' ? 'The propane tank: diameter 5.8 m. Press <b>Next</b>.' : 'What if you put the diameter into the formulas? Press <b>Next</b>.'),
  make(stage, k, ex) {
    const Hh = ex.def.height, svg = svgOn(stage, 0, 0, 360, Hh), g = G(svg), cx = 180, cy = 196;
    if (k === 'oops') {
      const r = 78;
      const ghost = svgEl('circle', { cx, cy, r: 2 * r, fill: '#fde7e5', stroke: RAD, 'stroke-width': 2.4, 'stroke-dasharray': '9 6' }, g); hide(ghost);
      sphere(g, cx, cy, r);
      const dl = seg(g, [cx - r, cy], [cx + r, cy], { stroke: DIA, 'stroke-width': 3.5 });
      const ld = lab(stage, cx, cy + r * EQ + 6, T('5.8'), 's', 'u10l8-dl');
      const gr = seg(g, [cx, cy], [cx - 2 * r, cy], { stroke: RAD, 'stroke-width': 3.5, 'stroke-dasharray': '8 5' }); hide(gr);
      const lg = hide(lab(stage, cx - r, cy - 6, '“r” = 5.8?', 'n', 'u10l8-rl u10l8-wbg'));
      void dl; void ld;
      const Pn = panel(stage, 380, 14, ex.W - 394, Hh - 28, 'Using 5.8 as the radius (wrong)');
      const l1 = hide(line(Pn, T('SA=4\\pi(5.8)^2\\approx422.7\\text{ m}^2'))), l1b = hide(line(Pn, `${T('422.7\\div105.7\\approx4')}: <b>4 times</b> too big`, 'u10l8-no'));
      const l2 = hide(line(Pn, T('V=\\tfrac43\\pi(5.8)^3\\approx817.3\\text{ m}^3'))), l2b = hide(line(Pn, `${T('817.3\\div102.2\\approx8')}: <b>8 times</b> too big`, 'u10l8-no'));
      const l3 = hide(line(Pn, `Doubling the radius: area ${T('\\times2^2=4')}, volume ${T('\\times2^3=8')}.`, 'u10l8-sm'));
      return [
        { cap: `Putting the diameter in for ${T('r')} draws a tank with radius 5.8 m: <b>twice as wide</b> as the real one.`,
          run: async (c) => { await appear(c, ghost); await appear(c, gr); await pop(c, lg); } },
        { cap: `Surface area: ${T('4\\pi(5.8)^2\\approx422.7')} m², <b>4 times</b> the real 105.7 m².`,
          run: async (c) => { await show(c, l1); await show(c, l1b); } },
        { cap: `Volume: ${T('\\tfrac43\\pi(5.8)^3\\approx817.3')} m³, <b>8 times</b> the real 102.2 m³.`,
          run: async (c) => { await show(c, l2); await show(c, l2b); } },
        { cap: `Twice the radius: ${T('2^2=4')} times the area, ${T('2^3=8')} times the volume. <b>Halve the diameter first!</b>`,
          run: async (c) => { await show(c, l3); const s = stamp(Pn, 'halve it first!', { ok: false }); s.style.alignSelf = 'center'; await stampIn(c, s); } }
      ];
    }
    const r = 130;
    sphere(g, cx, cy, r);
    for (const dx of [-0.55, 0, 0.55]) seg(g, [cx + dx * r, cy + r * Math.sqrt(1 - dx * dx) - 4], [cx + dx * r * 1.12, cy + r + 30], { 'stroke-width': 4, stroke: '#8a8f99' });
    const dl = seg(g, [cx - r, cy], [cx + r, cy], { stroke: DIA, 'stroke-width': 4, class: 'bk-stroke' }); hide(dl);
    const ld = hide(lab(stage, cx, cy + r * EQ + 4, T('d=5.8\\text{ m}'), 's', 'u10l8-dl u10l8-wbg'));
    const rl = seg(g, [cx, cy], [cx + r, cy], { stroke: RAD, 'stroke-width': 5 }); hide(rl);
    const lr = hide(lab(stage, cx + r / 2, cy - 6, T('r=2.9\\text{ m}'), 'n', 'u10l8-rl u10l8-wbg'));
    const Pn = panel(stage, 380, 14, ex.W - 394, Hh - 28, 'Spherical tank');
    const L0 = hide(line(Pn, T('r=5.8\\div2=2.9\\text{ m}')));
    const La = ['SA_{\\text{sphere}}=4\\pi r^2=4\\pi(2.9)^2', '=4\\pi(8.41)=33.64\\pi', '\\approx\\boldsymbol{105.7}\\text{ m}^2'].map((s) => hide(line(Pn, T(s), 'u10l8-ind')));
    const Lb = ['V_{\\text{sphere}}=\\tfrac43\\pi r^3=\\tfrac43\\pi(2.9)^3', '=\\tfrac43\\pi(24.389)=32.5187\\pi', '\\approx\\boldsymbol{102.2}\\text{ m}^3'].map((s) => hide(line(Pn, T(s), 'u10l8-ind')));
    La[0].insertAdjacentHTML('afterbegin', '<b>(a)</b> '); Lb[0].insertAdjacentHTML('afterbegin', '<b>(b)</b> ');
    return [
      { cap: `The tank’s <b>diameter</b> is 5.8 m. But every sphere formula uses the <b>radius</b>.`,
        run: async (c) => { dl.style.opacity = 1; await drawIn(dl, 700, c); await pop(c, ld); } },
      { cap: `Halve it first: ${T('r=5.8\\div2=2.9')} m.`,
        run: async (c) => { await appear(c, rl); await pop(c, lr); await show(c, L0); } },
      { cap: `(a) ${T('SA=4\\pi(2.9)^2=33.64\\pi\\approx105.7')} <b>square</b> metres.`,
        run: async (c) => { for (const l of La) await show(c, l); } },
      { cap: `(b) ${T('V=\\tfrac43\\pi(2.9)^3=32.5187\\pi\\approx102.2')} <b>cubic</b> metres. Keep ${T('\\pi')} exact; round only at the end.`,
        run: async (c) => { for (const l of Lb) await show(c, l); } }
    ];
  }
};

/* =============================== explainer: slice a sphere (Example 2) — the STAR hemisphere surface =============================== */
const slice = {
  title: 'Example 2 check: half a sphere',
  height: 440,
  choices: [{ v: 'vol', label: '(a) Volume' }, { v: 'sa', label: '(b), (c) Surface area' }],
  intro: (v) => (v === 'vol' ? 'Slice a sphere exactly through its centre. Press <b>Next</b>.' : 'A hemisphere has a curved dome and a flat floor. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const W = ex.W, Hh = ex.def.height, svg = svgOn(stage, 0, 0, W, Hh), g = G(svg);
    if (k === 'vol') {
      const cx = 165, cy = 220, r = 110, ry = r * EQ;
      const bot = G(g), top = G(g);
      svgEl('path', { d: `M${cx - r} ${cy} A${r} ${r} 0 0 0 ${cx + r} ${cy} A${r} ${ry} 0 0 0 ${cx - r} ${cy} Z`, fill: BALL }, bot);
      P(`M${cx - r} ${cy} A${r} ${r} 0 0 0 ${cx + r} ${cy}`, {}, bot);
      const face = svgEl('ellipse', { cx, cy, rx: r, ry, fill: FLOOR_F, stroke: FLR, 'stroke-width': 2.4 }, bot); hide(face);
      const dm = dome(top, cx, cy, r, { op: 1 });
      dm.back.style.opacity = 0;
      const eqF = P(halfE(cx, cy, r, ry, false), { 'stroke-width': 2 }, g), eqB = P(halfE(cx, cy, r, ry, true), { 'stroke-width': 1.8, 'stroke-dasharray': '7 6', opacity: 0.7 }, g);
      const knife = seg(g, [cx - r - 40, cy], [cx + r + 40, cy], { stroke: RAD, 'stroke-width': 3, 'stroke-dasharray': '10 6', class: 'bk-stroke' }); hide(knife);
      const lr = lab(stage, cx + r / 2, cy - 4, T('r'), 'n', 'u10l8-rl'), rl = seg(g, [cx, cy], [cx + r, cy], { stroke: RAD, 'stroke-width': 3 });
      const lH1 = hide(lab(stage, cx + r + 14, cy - 80, 'hemisphere', 'e', 'u10l8-tl')), lH2 = hide(lab(stage, cx + r + 14, cy + 90, 'hemisphere', 'e', 'u10l8-tl'));
      const Pn = panel(stage, 440, 14, W - 454, Hh - 28, 'Volume', 'u10l8-lg');
      const ls = ['V_{\\text{sphere}}=\\tfrac43\\pi r^3', 'V_{\\text{hemi}}=\\tfrac12\\left(\\tfrac43\\pi r^3\\right)', 'V_{\\text{hemi}}=\\dfrac23\\pi r^3'].map((s, i) => hide(line(Pn, T(s), i === 2 ? 'u10l8-boxed' : '')));
      const sepr = (t) => { top.setAttribute('transform', `translate(0 ${-36 * t})`); bot.setAttribute('transform', `translate(0 ${44 * t})`); };
      return [
        { cap: `A sphere of radius ${T('r')}: ${T('V=\\tfrac43\\pi r^3')}.`, run: async (c) => { await show(c, ls[0]); } },
        { cap: `Slice it exactly through the <b>centre</b>, like cutting a semi-circle from a circle.`,
          run: async (c) => { knife.style.opacity = 1; await drawIn(knife, 700, c); } },
        { cap: `Two equal halves, each a <b>hemisphere</b> with the same radius ${T('r')}.`,
          run: async (c) => {
            knife.style.opacity = 0; eqF.style.opacity = 0; eqB.style.opacity = 0; rl.style.opacity = 0; lr.style.opacity = 0; face.style.opacity = 1; dm.back.style.opacity = 0.7;
            await tween(c, 900, sepr); await show(c, lH1); await show(c, lH2);
          } },
        { cap: `Each half holds half the volume: ${T('V_{\\text{hemi}}=\\tfrac12\\left(\\tfrac43\\pi r^3\\right)=\\tfrac23\\pi r^3')}.`,
          run: async (c) => { await show(c, ls[1]); await pop(c, ls[2], 500); } }
      ];
    }
    // surface area: 2 great circles curved + 1 floor
    const R = 80, dx = 130, dy = 270, cy = 150, xs = [330, 510, 730];
    const D = dome(g, dx, dy, R, { floor: true, op: 1, fill: PEEL });
    D.shell.setAttribute('fill-opacity', 0.9); D.floor.setAttribute('fill-opacity', 1);
    const pith = svgEl('path', { d: D.shell.getAttribute('d'), fill: PITH }, g); hide(pith);
    D.insertBefore(pith, D.top);
    const lCur = lab(stage, dx, dy - R - 8, 'curved', 'n', 'u10l8-tl u10l8-or'), lFl = lab(stage, dx, dy + R * EQ + 6, 'floor', 's', 'u10l8-tl u10l8-bl');
    const circ = xs.map((x, i) => traced(g, x, cy, R, i < 2 ? PEEL_D : FLR)); circ.forEach(hide);
    const plus = hide(lab(stage, (xs[1] + xs[2]) / 2, cy, T('+'), 'c', 'u10l8-big'));
    const pg = G(g), sets = peelSet(pg, xs.slice(0, 2).map((x) => [x, cy]), R, { x: dx, y: dy - R * 0.45, r: R * 0.8, s: 0.45 }, 21); hide(pg);
    const fl = svgEl('ellipse', { cx: dx, cy: dy, rx: R, ry: R * EQ, fill: FLOOR_F, stroke: FLR, 'stroke-width': 2.4 }, g); hide(fl);
    const pis = xs.map((x) => hide(lab(stage, x, cy + R + 8, T('\\pi r^2'), 's', 'u10l8-tl')));
    const br1 = hide(lab(stage, (xs[0] + xs[1]) / 2, cy + R + 44, `curved: ${T('2\\pi r^2')}`, 's', 'u10l8-tl u10l8-or'));
    const br2 = hide(lab(stage, xs[2], cy + R + 44, `floor: ${T('\\pi r^2')}`, 's', 'u10l8-tl u10l8-bl'));
    const fb = hide(lab(stage, 560, Hh - 66, `(b) ${T('SA_{\\text{hemi}}=2\\pi r^2+\\pi r^2=3\\pi r^2')}`, 'c', 'u10l8-big'));
    const fc = hide(lab(stage, 560, Hh - 26, `(c) base <u>not</u> included: ${T('SA=2\\pi r^2')}`, 'c', 'u10l8-big'));
    const x3 = G(g); P(`M${xs[2] - 50} ${cy - 50} L${xs[2] + 50} ${cy + 50} M${xs[2] + 50} ${cy - 50} L${xs[2] - 50} ${cy + 50}`, { stroke: RAD, 'stroke-width': 6 }, x3); hide(x3);
    return [
      { cap: `A hemisphere has two surfaces: the <b>curved</b> dome and the flat circular <b>floor</b>. Trace three circles of radius ${T('r')}.`,
        run: async (c) => { await pulse(c, lCur); await pulse(c, lFl); for (const ci of circ) { ci.style.opacity = 1; await drawIn(ci, 380, c); } } },
      { cap: `Peel the dome. It is <b>half</b> of a sphere’s peel, and a whole sphere’s peel fills 4 circles…`,
        run: async (c) => { await appear(c, pg); await appear(c, pith, 250); } },
      { cap: `…so the dome’s peel fills <b>2 great circles</b>: curved surface ${T('=\\tfrac12(4\\pi r^2)=2\\pi r^2')}.`,
        run: async (c) => { await flyPieces(c, sets.flat(), 850, 60, 80); await pop(c, pis[0], 260); await pop(c, pis[1], 260); await show(c, br1); } },
      { cap: `The floor is <b>1 great circle</b> (a circle through the centre): ${T('\\pi r^2')}.`,
        run: async (c) => {
          fl.style.opacity = 1; D.floor.style.opacity = 0.25;
          await tween(c, 1100, (t) => { fl.setAttribute('cx', dx + (xs[2] - dx) * t); fl.setAttribute('cy', dy + (cy - dy) * t - 40 * Math.sin(PI * t)); fl.setAttribute('ry', R * EQ + (R - R * EQ) * t); });
          await pop(c, plus); await pop(c, pis[2], 260); await show(c, br2);
        } },
      { cap: `(b) A closed hemisphere: curved <b>plus</b> floor, ${T('2\\pi r^2+\\pi r^2=3\\pi r^2')}.`,
        run: async (c) => { await show(c, fb); } },
      { cap: `(c) If the base is <b>not</b> included (an open bowl, a dome with no floor): just ${T('2\\pi r^2')}.`,
        run: async (c) => { await appear(c, x3); await show(c, fc); } }
    ];
  }
};

/* =============================== explainer: Example 3, the string around the soccer ball =============================== */
const string = {
  title: 'Example 3 check: from a string to the volume',
  height: 430,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ex3', label: 'Example 3 check' }, { v: 'early', label: `Round ${T('r')} too early?` }],
  intro: (v) => (v === 'ex3' ? 'A string wrapped once around a soccer ball measures 70 cm. Press <b>Next</b>.' : 'What changes if you round the radius before cubing it? Press <b>Next</b>.'),
  make(stage, k, ex) {
    const W = ex.W, Hh = ex.def.height, svg = svgOn(stage, 0, 0, W, Hh), g = G(svg);
    const cx = 140, cy = 150, r = 100, ry = r * EQ, x0 = 40, sy = 330, Ls = PI * 2 * r;
    soccer(g, cx, cy, r);
    const sF = P(halfE(cx, cy, r, ry, false), { stroke: RAD, 'stroke-width': 4.5, class: 'bk-stroke' }, g), sB = P(halfE(cx, cy, r, ry, true), { stroke: RAD, 'stroke-width': 3, 'stroke-dasharray': '6 5', class: 'bk-stroke' }, g);
    const sL = P(`M${x0} ${sy} L${x0 + Ls} ${sy}`, { stroke: RAD, 'stroke-width': 5, class: 'bk-stroke' }, g);
    const lC = lab(stage, x0 + Ls, sy - 6, `${T('C=70')} cm`, 'ne', 'u10l8-rl u10l8-wbg', 0);
    const ticks = G(g), dls = [];
    for (let i = 0; i <= 3; i++) seg(ticks, [x0 + i * 2 * r, sy - 12], [x0 + i * 2 * r, sy + 12], { 'stroke-width': 2.4 });
    for (let i = 0; i < 3; i++) dls.push(lab(stage, x0 + (i + 0.5) * 2 * r, sy + 12, T('d'), 's', 'u10l8-dl'));
    const lExtra = lab(stage, x0 + 6 * r + (Ls - 6 * r) / 2, sy + 12, 'a bit', 's', 'u10l8-sm');
    const rl = seg(g, [cx, cy], [cx + r, cy], { stroke: RAD, 'stroke-width': 3.5 });
    const lr = lab(stage, cx + r / 2, cy - 4, T('r'), 'n', 'u10l8-rl u10l8-wbg');
    [sF, sB, sL, lC, ticks, lExtra, rl, lr, ...dls].forEach(hide);
    const Pn = panel(stage, 300, 14, W - 314, 268, k === 'ex3' ? 'Soccer ball' : 'Two ways to round');
    if (k === 'early') {
      const a = ['r=\\dfrac{70}{2\\pi}=11.1408\\ldots\\text{ cm}'].map((s) => hide(line(Pn, T(s))));
      const b = hide(line(Pn, `Round first: ${T('V=\\tfrac43\\pi(11.1)^3\\approx5728.7\\text{ cm}^3')}`, 'u10l8-no'));
      const cc = hide(line(Pn, `Keep every digit: ${T('V\\approx\\boldsymbol{5792.2}\\text{ cm}^3')}`, 'u10l8-ok'));
      const d = hide(line(Pn, `Off by about ${T('63.5\\text{ cm}^3')}: cubing makes a small rounding error grow.`, 'u10l8-sm'));
      return [
        { cap: `The string is the circumference: ${T('C=2\\pi r=70')}, so ${T('r=\\dfrac{70}{2\\pi}=11.1408\\ldots')} cm.`,
          run: async (c) => { [sF, sB].forEach((e) => (e.style.opacity = 1)); await drawIn(sF, 500, c); await appear(c, rl); await pop(c, lr); await show(c, a[0]); } },
        { cap: `Round ${T('r')} to 11.1 first, then cube: ${T('\\tfrac43\\pi(11.1)^3\\approx5728.7')} cm³.`,
          run: async (c) => { await show(c, b); } },
        { cap: `Keep all the digits of ${T('r')} (one line on the calculator): ${T('V\\approx5792.2')} cm³.`,
          run: async (c) => { await show(c, cc); } },
        { cap: `The early-rounded answer is off by about 63.5 cm³. <b>Round only at the very end.</b>`,
          run: async (c) => { await show(c, d); const s = stamp(Pn, 'round at the end ✓'); s.style.alignSelf = 'center'; s.style.marginTop = '14px'; await stampIn(c, s); } }
      ];
    }
    const ls = ['C=2\\pi r=70', 'r=\\dfrac{70}{2\\pi}=\\dfrac{35}{\\pi}\\approx11.1408\\text{ cm}', 'V=\\tfrac43\\pi r^3=\\tfrac43\\pi\\left(\\dfrac{35}{\\pi}\\right)^3\\approx\\boldsymbol{5792.2}\\text{ cm}^3', 'V=\\dfrac{C^3}{6\\pi^2}=\\dfrac{70^3}{6\\pi^2}=\\dfrac{343\\,000}{59.2176\\ldots}\\approx5792.2']
      .map((s, i) => hide(line(Pn, T(s), i === 3 ? 'u10l8-sm' : '')));
    return [
      { cap: `Wrap the string once around the ball’s <b>widest</b> point: a <b>great circle</b>, through the centre.`,
        run: async (c) => { sF.style.opacity = 1; sB.style.opacity = 1; await drawIn(sB, 500, c); await drawIn(sF, 600, c); } },
      { cap: `Pull it straight and measure it: <b>70 cm</b>. That is the ball’s <b>circumference</b>.`,
        run: async (c) => { await appear(c, sB, 200); sB.style.opacity = 0.35; sF.style.opacity = 0.35; sL.style.opacity = 1; await drawIn(sL, 1200, c); await pop(c, lC); await show(c, ls[0]); } },
      { cap: `It’s a bit more than <b>3 diameters</b> (exactly ${T('\\pi')} of them), just like the tennis ball can.`,
        run: async (c) => { await appear(c, ticks); for (const d of dls) await pop(c, d, 250); await show(c, lExtra); } },
      { cap: `Solve ${T('2\\pi r=70')} for the radius: ${T('r=\\dfrac{70}{2\\pi}\\approx11.1408')} cm. Keep all the digits.`,
        run: async (c) => { await appear(c, rl); await pop(c, lr); await show(c, ls[1]); } },
      { cap: `${T('V=\\tfrac43\\pi r^3\\approx5792.2')} <b>cm³</b>.`,
        run: async (c) => { await pop(c, ls[2], 500); } },
      { cap: `Or skip ${T('r')} altogether: ${T('V=\\dfrac{C^3}{6\\pi^2}=\\dfrac{70^3}{6\\pi^2}\\approx5792.2')} cm³, the same answer with no rounding along the way.`,
        run: async (c) => { await show(c, ls[3]); } }
    ];
  }
};

/* =============================== explainer: Example 4, the same dome with and without its floor =============================== */
const domes = {
  title: 'Example 4 check: Sana’s and Tavi’s sheds',
  height: 450,
  intro: 'Two domes, both 12 ft across. Only one has a floor. Press <b>Next</b>.',
  make(stage, k, ex) {
    const W = ex.W, Hh = ex.def.height, svg = svgOn(stage, 0, 0, W, Hh), g = G(svg);
    const xa = W * 0.26, xb = W * 0.74, by = 196, r = 104, tr = 30, ty = 290;
    const A = dome(g, xa, by, r, { floor: true }), B = dome(g, xb, by, r, { floor: false });
    A.floor.style.opacity = 0;
    lab(stage, xa, 30, '<b>Sana</b>: with a floor', 'c', 'u10l8-tl'); lab(stage, xb, 30, '<b>Tavi</b>: no floor', 'c', 'u10l8-tl');
    const rA = seg(g, [xa, by], [xa + r, by], { stroke: RAD, 'stroke-width': 3.5 }), rB = seg(g, [xb, by], [xb + r, by], { stroke: RAD, 'stroke-width': 3.5 });
    const lrs = [xa, xb].map((x) => hide(lab(stage, x + r / 2, by - 4, T('r=6'), 'n', 'u10l8-rl u10l8-wbg')));
    const lds = [xa, xb].map((x) => lab(stage, x, by + r * EQ + 4, T('d=12\\text{ ft}'), 's', 'u10l8-dl'));
    [rA, rB].forEach(hide);
    const tile = (x, color, fill) => { const t = svgEl('circle', { cx: x, cy: ty, r: tr, fill, stroke: color, 'stroke-width': 2.4 }, g); hide(t); return t; };
    const tA = [tile(xa - 74, PEEL_D, PEEL), tile(xa, PEEL_D, PEEL)], tAf = tile(xa + 74, FLR, FLOOR_F), tB = [tile(xb - 37, PEEL_D, PEEL), tile(xb + 37, PEEL_D, PEEL)];
    const cA = hide(lab(stage, xa - 37, ty + tr + 4, T('2\\pi r^2=72\\pi'), 's', 'u10l8-sm u10l8-or')), cB = hide(lab(stage, xb, ty + tr + 4, T('2\\pi r^2=72\\pi'), 's', 'u10l8-sm u10l8-or'));
    const fA = hide(lab(stage, xa + 74, ty + tr + 4, T('\\pi r^2=36\\pi'), 's', 'u10l8-sm u10l8-bl'));
    const sA = hide(lab(stage, xa, Hh - 52, T('SA=3\\pi r^2=3\\pi(36)=\\boldsymbol{108\\pi}\\text{ ft}^2') + '<div class="u10l8-sm u10l8-mid">' + T('\\approx339.3\\text{ ft}^2') + '</div>', 'c', 'u10l8-big'));
    const sB = hide(lab(stage, xb, Hh - 52, T('SA=2\\pi r^2=2\\pi(36)=\\boldsymbol{72\\pi}\\text{ ft}^2') + '<div class="u10l8-sm u10l8-mid">' + T('\\approx226.2\\text{ ft}^2') + '</div>', 'c', 'u10l8-big'));
    return [
      { cap: `Same dome, ${T('d=12')} ft. Halve it: ${T('r=6')} ft, so ${T('r^2=36')} ft².`,
        run: async (c) => { await Promise.all([appear(c, rA), appear(c, rB)]); await Promise.all(lrs.map((l) => pop(c, l))); } },
      { cap: `Both sheds need the <b>curved</b> dome: 2 great circles, ${T('2\\pi r^2=2\\pi(36)=72\\pi')} ft².`,
        run: async (c) => { for (const t of [...tA, ...tB]) await pop(c, t, 260); await show(c, cA); await show(c, cB); } },
      { cap: `Only Sana builds a <b>floor</b>: one more great circle, ${T('\\pi r^2=36\\pi')} ft².`,
        run: async (c) => { await appear(c, A.floor, 500); await pop(c, tAf); await show(c, fA); } },
      { cap: `Sana: ${T('3\\pi r^2=108\\pi')} ft² (≈ 339.3 ft²). Tavi: ${T('2\\pi r^2=72\\pi')} ft² (≈ 226.2 ft²).`,
        run: async (c) => { await show(c, sA); await show(c, sB); } },
      { cap: `The difference is exactly one floor: ${T('108\\pi-72\\pi=36\\pi')} ft². The <b>wording</b> decides whether the base counts.`,
        run: async (c) => { await pulse(c, tAf, 1.25); } }
    ];
  }
};

/* =============================== explainer: does the flat base count? (Flowchart) =============================== */
const FL = {
  b: { label: 'Example 2(b)', text: 'Surface area of a hemisphere = curved surface area + area of <b>circular base</b>', yes: true, why: 'The base is named in the statement.', res: T('2\\pi r^2+\\pi r^2=3\\pi r^2') },
  c: { label: 'Example 2(c)', text: 'Surface area of a hemisphere, if the base is <b><u>not</u> included</b>', yes: false, why: 'The wording leaves the base out.', res: T('2\\pi r^2') },
  sana: { label: 'Sana’s shed', text: 'Sana’s shed will <b>include a circular floor</b> built from the same material as the dome.', yes: true, why: 'She builds the floor too.', res: T('3\\pi(6)^2=108\\pi\\text{ ft}^2') },
  tavi: { label: 'Tavi’s shed', text: 'Tavi’s shed will have <b>no floor</b>.', yes: false, why: 'No floor is built.', res: T('2\\pi(6)^2=72\\pi\\text{ ft}^2') },
  hemi: { label: 'Just “a hemisphere”', text: 'Find the surface area of <b>a hemisphere</b> of radius ' + T('r') + '.', yes: true, why: 'Nothing excludes the base, so it counts.', res: T('3\\pi r^2') },
  bowl: { label: 'An open bowl', text: 'A hemispherical <b>open bowl</b>: the flat side is open.', yes: false, why: 'There is no lid over the flat side.', res: T('2\\pi r^2') }
};
const floor = {
  title: 'Does the flat base count?',
  height: 400,
  choices: Object.keys(FL).map((k) => ({ v: k, label: FL[k].label })),
  intro: 'Read the wording, then follow the chart. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = FL[k], W = ex.W, Hh = ex.def.height, fw = W - 360;
    const card = add(stage, box(h('div', 'u10l8-scen', `<div class="u10l8-ph">The wording</div><div class="u10l8-scen-t">${d.text}</div>`), 310, Hh - 28), 14, 14);
    const why = hide(h('div', 'u10l8-line u10l8-sm', d.why)); card.appendChild(why);
    const res = hide(h('div', 'u10l8-line u10l8-big', 'SA ' + T('=') + ' ' + d.res)); card.appendChild(res);
    const F = new Flowchart(stage, {
      x: 340, y: 10, width: fw, height: Hh - 20,
      nodes: {
        q: { x: fw / 2, y: 44, w: 330, h: 58, html: '<b>Surface area of a hemisphere</b>', cls: 'bk-round' },
        d: { x: fw / 2, y: 160, w: 330, h: 104, html: '<b>Is the flat circular base part of the surface?</b>', cls: 'bk-diamond' },
        y: { x: fw * 0.24, y: 312, w: 250, h: 92, html: `<b>Yes: curved + base</b>${T('2\\pi r^2+\\pi r^2=3\\pi r^2')}`, color: 'orange' },
        n: { x: fw * 0.76, y: 312, w: 250, h: 92, html: `<b>No: curved only</b>${T('2\\pi r^2')}`, color: 'blue' }
      },
      edges: [{ from: 'q', to: 'd' }, { from: 'd', to: 'y', label: 'yes, or not mentioned', route: 'hv' }, { from: 'd', to: 'n', label: 'no', route: 'hv' }]
    });
    const end = d.yes ? 'y' : 'n';
    return [
      { cap: `Read the wording: ${d.text}`, run: async (c) => { await pulse(c, card, 1.03); await F.visit(c, 'q'); } },
      { cap: `Is the flat base part of the surface? <b>${d.yes ? 'Yes' : 'No'}.</b> ${d.why}`, run: async (c) => { await F.go(c, 'q', 'd'); await F.visit(c, 'd'); await show(c, why); } },
      { cap: `So ${d.yes ? 'count the curved dome <b>and</b> the floor' : 'count the curved dome <b>only</b>'}: SA ${T('=')} ${d.res}.`, run: async (c) => { await F.go(c, 'd', end); await F.visit(c, end); await pop(c, res); } }
    ];
  }
};

/* =============================== explainer: Example 5, run the formula backwards =============================== */
const BK = {
  ex5: { label: 'Example 5 check', V: '3053.6', unit: 'ft', r3: '728.99', r: '9.0', calc: ['\\dfrac{3(3053.6)}{4\\pi}', '\\dfrac{9160.8}{12.56637}'], lo: 8, hi: 9, note: 'just under 9', near: '9^3=729', chk: '\\tfrac43\\pi(9.0)^3=972\\pi\\approx3053.6\\text{ ft}^3' },
  mika: { label: 'Mika’s ball: 320 mL', V: '320', unit: 'cm', r3: '76.39', r: '4.2', calc: ['\\dfrac{3(320)}{4\\pi}', '\\dfrac{960}{12.56637}'], lo: 4, hi: 5, note: 'between 4 and 5', near: '4^3=64,\\ 5^3=125', chk: '\\tfrac43\\pi(4.2431\\ldots)^3=320\\text{ cm}^3' }
};
const backwards = {
  title: 'Example 5 check: from the volume back to the radius',
  height: 440,
  choices: Object.keys(BK).map((k) => ({ v: k, label: BK[k].label })),
  intro: 'The volume formula is a machine: radius in, volume out. Run it backwards. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = BK[k], W = ex.W, Hh = ex.def.height, svg = svgOn(stage, 0, 0, W, Hh), g = G(svg);
    const xs = [W * 0.14, W * 0.5, W * 0.86], y = 140, bw = 190, bh = 66;
    const boxes = [T('r'), T('r^3'), T('V')].map((s, i) => add(stage, box(h('div', 'u10l8-mbox', `<div class="u10l8-mname">${s}</div><div class="u10l8-mval"></div>`), bw, bh), xs[i] - bw / 2, y - bh / 2));
    const vals = boxes.map((b) => b.querySelector('.u10l8-mval'));
    const curve = (parent, x1, x2, up, color) => { const yy = up ? y - bh / 2 - 6 : y + bh / 2 + 6, ym = up ? yy - 46 : yy + 46;
      P(`M${x1} ${yy} Q${(x1 + x2) / 2} ${ym} ${x2} ${yy}`, { stroke: color, 'stroke-width': 3.5 }, parent);
      const dx = x2 > x1 ? 1 : -1; P(`M${x2 - dx * 4} ${yy + (up ? -15 : 15)} L${x2} ${yy} L${x2 - dx * 15} ${yy + (up ? -3 : 3)}`, { stroke: color, 'stroke-width': 3.5 }, parent); };
    const fw = G(g); curve(fw, xs[0] + 40, xs[1] - 40, true, CYL); curve(fw, xs[1] + 40, xs[2] - 40, true, CYL); hide(fw);
    const lf1 = hide(lab(stage, (xs[0] + xs[1]) / 2, y - bh / 2 - 46, 'cube it ' + T('x^3'), 'n', 'u10l8-tl u10l8-teal')), lf2 = hide(lab(stage, (xs[1] + xs[2]) / 2, y - bh / 2 - 46, T('\\times\\tfrac43\\pi'), 'n', 'u10l8-tl u10l8-teal'));
    const bw1 = G(g); curve(bw1, xs[2] - 40, xs[1] + 40, false, RAD); hide(bw1);
    const bw2 = G(g); curve(bw2, xs[1] - 40, xs[0] + 40, false, RAD); hide(bw2);
    const lb1 = hide(lab(stage, (xs[1] + xs[2]) / 2, y + bh / 2 + 46, `undo: ${T('\\times3\\div4\\pi')}`, 's', 'u10l8-tl u10l8-red')), lb2 = hide(lab(stage, (xs[0] + xs[1]) / 2, y + bh / 2 + 46, `undo: ${T('\\sqrt[3]{\\ \\ }')} cube root`, 's', 'u10l8-tl u10l8-red'));
    const Pn = panel(stage, 14, 268, W - 28, Hh - 282, '');
    const w1 = hide(line(Pn, T(`r^3=\\dfrac{3V}{4\\pi}=${d.calc[0]}=${d.calc[1]}\\approx${d.r3}`)));
    const w2 = hide(line(Pn, T(`r=\\sqrt[3]{${d.r3}}\\approx\\boldsymbol{${d.r}}\\text{ ${d.unit}}`) + ` &nbsp; <span class="u10l8-sm">sense check: ${T(`${d.lo}^3=${d.lo ** 3}`)} and ${T(`${d.hi}^3=${d.hi ** 3}`)}</span>`));
    const w3 = hide(line(Pn, `Check forwards: ${T(d.chk)} ✓`, 'u10l8-ok'));
    return [
      { cap: `Forwards: radius ${T('\\to')} <b>cube</b> it ${T('\\to')} multiply by ${T('\\tfrac43\\pi')} ${T('\\to')} volume.`,
        run: async (c) => { await appear(c, fw); await Promise.all([pop(c, lf1), pop(c, lf2)]); } },
      { cap: `${k === 'ex5' ? 'Example 5' : 'Mika’s ball'} gives the <b>output</b>: ${T(`V=${d.V}`)} ${d.unit}³. Run the machine <b>backwards</b>, undoing each step.`,
        run: async (c) => { vals[2].innerHTML = T(d.V); await pulse(c, boxes[2], 1.08); } },
      { cap: `Undo ${T('\\times\\tfrac43\\pi')}: multiply by 3 and divide by ${T('4\\pi')}. ${T(`r^3=\\dfrac{3V}{4\\pi}\\approx${d.r3}`)}.`,
        run: async (c) => { await appear(c, bw1); await pop(c, lb1); vals[1].innerHTML = T(d.r3); await pulse(c, boxes[1], 1.08); await show(c, w1); } },
      { cap: `Undo the cubing with a <b>cube root</b>: ${T(`r=\\sqrt[3]{${d.r3}}\\approx${d.r}`)} ${d.unit}. It is ${d.note}, since ${T(`${d.lo}^3<${d.r3}<${d.hi}^3`)}.`,
        run: async (c) => { await appear(c, bw2); await pop(c, lb2); vals[0].innerHTML = T(d.r); await pulse(c, boxes[0], 1.08); await show(c, w2); } },
      { cap: `Check by running it forwards: ${T(d.chk)}.`,
        run: async (c) => { await show(c, w3); const s = stamp(Pn, 'checks ✓'); s.style.alignSelf = 'flex-end'; s.style.marginTop = '-34px'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== mount =============================== */
mountWarm();
mountStatics();
export const explainers = mountExplainers({ overflow, derive, peel, halve, slice, string, domes, floor, backwards });
