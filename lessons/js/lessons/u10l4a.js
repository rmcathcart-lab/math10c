/* Math 10C · Unit 10 · Lesson 4A — Converting Units Within the Metric (SI) System.
 * Warm-up road scene (mile vs km bars to scale, "Convert 65 mph" with the miles cancelling), the static metric number
 * line (Section 2), and the explainers:
 *   zoom   (a metre split into 10 dm, 100 cm, 1000 mm; a kilometre; Extension mm → μm → nm by 1000s)
 *   hop    (the metric number line: count steps while the decimal point hops one place per step and the number
 *           re-writes itself; the notes and Examples 1–2 checks)
 *   sci    (Extension: one big jump of 10^n, then tidy into scientific notation; Example 3 checks)
 *   prop   (Sam's cross multiplication and Priya's table of headers side by side; Example 4 check)
 *   ratio  (the whale on a double number line, the smoothie as a tape diagram; Examples 5 and 6 checks)
 *   map    (a 1:250 000 map: what 1 cm stands for; Example 7 checks)
 *   one    (a conversion fraction is a fancy 1: 1 km and 1000 m are the same length)
 *   cancel (unit analysis with units cancelling like fractions; the notes, Examples 8 and 9 checks, an upside-down factor)
 *   rate   (two units change at once; Example 10 check, an upside-down time factor, a one-unit rate)
 *   which  (flowchart: which method fits which question)
 * Colours: right / multiply blue, left / divide purple, the decimal point red, cancelled units red (and blue for a
 * second pair), the unit that is left green. Chips never use assignment questions. */
import {
  h, tex, add, box, NumberLine, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  svgEl, liveCtx, pulse, shake, anim, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const RT = COLORS.blue, LT = COLORS.purple, PT = COLORS.red, KEEP = COLORS.green, INK = COLORS.ink, AMB = COLORS.amber, TEAL = COLORS.teal;
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u10l4a-panel ' + cls, title ? `<div class="u10l4a-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u10l4a-line ' + cls, html); p.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const hide = (el) => { el.style.opacity = 0; return el; };
const centerX = (el, cx) => { el.style.left = Math.round(cx - el.offsetWidth / 2) + 'px'; return el; };
/** booklet number style for TeX: a thin space in the whole-number part from five digits up (58\,400, but 9000) */
function nT(s) {
  s = String(s); const [a, b] = s.split('.');
  const g = a.length >= 5 ? a.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : a;
  return b != null ? g + '.' + b : g;
}

/* =============================== the prefix number line =============================== */
const PF = [['G', -9, 1], ['M', -6, 1], ['k', -3], ['h', -2], ['da', -1], ['', 0], ['d', 1], ['c', 2], ['m', 3], ['\\mu', 6, 1], ['n', 9, 1]];
const pos = (p) => PF.find((q) => q[0] === p)[1];
const uTex = (p, b) => (p === '\\mu' ? `\\mu\\text{${b}}` : `\\text{${p}${b}}`);
const uCap = (p, b) => (p === '\\mu' ? T(`\\mu\\text{${b}}`) : `<b>${p}${b}</b>`);
const pName = (p) => (p === '' ? 'the unit' : p === '\\mu' ? T('\\mu') : `<b>${p}</b>`);

function prefixLine(host, o = {}) {
  const N = new NumberLine(host, {
    x: o.x, y: o.y, width: o.width || 900, height: o.height || 120, axisY: o.axisY, min: -10, max: 10, step: 1,
    labels: PF.filter((q) => q[0] !== '').map((q) => ({ v: q[1], html: `<span class="u10l4a-nlab${q[2] ? ' x' : ''}">${q[0] === '\\mu' ? T('\\mu') : q[0]}</span>` }))
  });
  const px = N.toPx(0);
  svgEl('line', { x1: px, x2: px, y1: N.ay - 15, y2: N.ay + 15, stroke: INK, 'stroke-width': 3.5 }, N.layers.axis);
  N.unitLab = N.mark(0, `<span class="u10l4a-unitlab">Unit${o.base ? ' (' + o.base + ')' : ''}</span>`, { lift: o.unitLift ?? 10 });
  return N;
}
/** a start or end pill under the line at prefix position v (stage coordinates) */
function linePill(stage, N, nx, v, html, cls, y, side) {
  const el = add(stage, h('div', 'u10l4a-pill ' + cls, html), nx + N.toPx(v), y);
  el.style.translate = side === 'l' ? 'calc(-100% + 16px) 0' : side === 'r' ? '-16px 0' : '-50% 0'; return el;
}

/* =============================== the decimal tape =============================== */
/** digits in fixed slots with a decimal point that hops one place per call. o: { D (digits), p (digits before the
 *  point), k (signed places it will move), cx (centre x), y, unit (html) } */
class Tape {
  constructor(host, o) {
    const s = this.slot = o.slot || 52, D = o.D, p = o.p, k = o.k || 0;
    this.lp = Math.max(0, 1 - (p + k)); this.rp = Math.max(0, p + k - D.length);
    this.full = '0'.repeat(this.lp) + D + '0'.repeat(this.rp);
    this.q = this.lp + p; this.e = this.lp + p + k; this.nD = D.length;
    const n = this.full.length, w = n * s;
    this.el = add(host, box(h('div', 'u10l4a-tape'), w + 170, 92), Math.round(o.cx - w / 2), o.y);
    this.dg = [...this.full].map((ch, i) => { const d = add(this.el, h('div', 'u10l4a-dg', ch), i * s, 0); if (i < this.lp || i >= this.lp + D.length) d.style.opacity = 0; return d; });
    this.dot = add(this.el, h('div', 'u10l4a-dot'), this.q * s, 50);
    this.unit = add(this.el, h('div', 'u10l4a-tunit', o.unit || ''), w + 16, 18);
  }
  async hop(c, dir) {
    const s = this.slot, q0 = this.q, q1 = q0 + dir; this.q = q1;
    await tween(c, 380, (t) => { this.dot.style.left = (q0 + dir * t) * s + 'px'; this.dot.style.top = 50 - 34 * Math.sin(Math.PI * t) + 'px'; });
    const d = this.dg[dir > 0 ? q0 : q1];
    if (d && d.style.opacity === '0') { d.classList.add(dir > 0 ? 'new' : 'newl'); await pop(c, d, 240); }
  }
  /** a leading 0 written in front of the point after moving left past every digit */
  async lead(c) { const d = this.dg[0]; if (d.style.opacity === '0') { d.classList.add('newl'); await pop(c, d, 300); } }
  tidyIdx() {
    const out = [], n = this.full.length, e = this.e;
    for (let i = n - 1; i >= e && this.full[i] === '0'; i--) out.push(i);
    for (let i = 0; i < e - 1 && this.full[i] === '0'; i++) out.push(i);
    return { out, pointGone: out.filter((i) => i >= e).length === n - e };
  }
  answer() {
    const { out } = this.tidyIdx(), keep = [...this.full].map((ch, i) => (out.includes(i) ? '' : ch));
    const a = keep.slice(0, this.e).join(''), b = keep.slice(this.e).join('');
    return b ? a + '.' + b : a;
  }
  async tidy(c) {
    const { out, pointGone } = this.tidyIdx();
    const fades = out.map((i) => anim(c, this.dg[i], [{ opacity: 1 }, { opacity: 0.13 }], 420));
    if (pointGone) fades.push(anim(c, this.dot, [{ opacity: 1 }, { opacity: 0 }], 420));
    await Promise.all(fades);
  }
  async setUnit(c, html) { await anim(c, this.unit, [{ opacity: 1 }, { opacity: 0 }], 180); this.unit.innerHTML = html; await anim(c, this.unit, [{ opacity: 0 }, { opacity: 1 }], 260); }
}

/* =============================== fractions for unit analysis =============================== */
/** f: { n: [numTex, unit], d: [numTex, unit] } — units are plain text ('' for none). Returns el with el.nu / el.du */
function fracEl(f) {
  const el = h('div', 'u10l4a-fr');
  const part = (pp, cls) => {
    const d = h('div', cls); let u = null;
    if (pp[0] !== '') d.insertAdjacentHTML('beforeend', T(pp[0]));
    if (pp[1]) { if (pp[0] !== '') d.insertAdjacentHTML('beforeend', '&thinsp;'); u = h('span', 'u10l4a-u', pp[1]); u.appendChild(h('span', 'u10l4a-strike')); d.appendChild(u); }
    el.appendChild(d); return u;
  };
  el.nu = part(f.n, 'num'); el.du = part(f.d, 'den');
  return el;
}
/** a row of fractions joined by ×, centred at cx. Returns { row, fr: [fracEl…], ops: [×…] } with everything visible */
function fracRow(stage, list, cx, y) {
  const row = add(stage, h('div', 'u10l4a-frow'), 0, y), fr = [], ops = [];
  list.forEach((f, i) => { if (i) ops.push(row.appendChild(h('div', 'u10l4a-op', '×'))); fr.push(row.appendChild(fracEl(f))); });
  centerX(row, cx);
  return { row, fr, ops };
}
const strike = (c, u, blue) => { const s = u.querySelector('.u10l4a-strike'); if (blue) s.classList.add('b'); u.classList.add('gone'); return anim(c, s, [{ transform: 'rotate(-18deg) scaleX(0)' }, { transform: 'rotate(-18deg) scaleX(1)' }], 380); };
const hl = (u, cls = 'hl') => u && u.classList.add(cls);

/* =============================== warm-up: crossing the border =============================== */
function mountRoad() {
  const host = document.getElementById('u10l4a-road'); if (!host) return;
  const W = 1000, H = 250, NS = 'http://www.w3.org/2000/svg';
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H }, host);
  const txt = (x, y, s, o = {}) => { const t = svgEl('text', Object.assign({ x, y, 'text-anchor': 'middle', 'font-family': 'ui-rounded, system-ui, sans-serif', 'font-weight': 800, 'font-size': 18, fill: INK }, o), svg); t.textContent = s; return t; };
  // road
  svgEl('rect', { x: 0, y: 196, width: W, height: 40, fill: '#5f646e' }, svg);
  for (let x = 6; x < W; x += 52) svgEl('rect', { x, y: 214, width: 28, height: 4, fill: '#fff' }, svg);
  svgEl('line', { x1: 500, x2: 500, y1: 186, y2: 246, stroke: PT, 'stroke-width': 4, 'stroke-dasharray': '10 7' }, svg);
  txt(500, 180, 'border', { fill: PT, 'font-size': 17 });
  const sign = (cx, lines) => {
    svgEl('rect', { x: cx - 5, y: 150, width: 10, height: 46, fill: '#a7abb3' }, svg);
    svgEl('rect', { x: cx - 62, y: 18, width: 124, height: 134, rx: 10, fill: '#fff', stroke: '#111', 'stroke-width': 4 }, svg);
    lines.forEach(([s, y, fs]) => txt(cx, y, s, { 'font-size': fs, fill: '#111' }));
  };
  sign(90, [['SPEED', 46, 17], ['LIMIT', 66, 17], ['65', 120, 50]]);
  sign(910, [['MAXIMUM', 46, 16], ['110', 106, 48], ['km/h', 138, 19]]);
  txt(104, 178, 'U.S.: mph', { 'text-anchor': 'start', 'font-size': 15, 'font-style': 'italic', 'font-weight': 600 });
  txt(896, 178, 'Alberta: km/h', { 'text-anchor': 'end', 'font-size': 15, 'font-style': 'italic', 'font-weight': 600 });
  // car
  const car = svgEl('g', {}, svg);
  svgEl('path', { d: 'M0 0 L0 -16 L18 -18 L32 -34 L72 -34 L88 -18 L104 -15 L104 0 Z', fill: '#3c78c8', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, car);
  svgEl('rect', { x: 37, y: -30, width: 14, height: 11, fill: '#e8f0fc' }, car);
  svgEl('path', { d: 'M56 -30 L56 -19 L77 -19 L69 -30 Z', fill: '#e8f0fc' }, car);
  for (const x of [24, 82]) { svgEl('circle', { cx: x, cy: 0, r: 10, fill: INK }, car); svgEl('circle', { cx: x, cy: 0, r: 4, fill: '#bbb' }, car); }
  const carAt = (x) => car.setAttribute('transform', `translate(${x} 214)`);
  carAt(190);
  // bars to scale (1 mi = 1.6093 km)
  const bw = 210, bx = 360;
  txt(bx - 14, 62, '1 mile', { 'text-anchor': 'end', 'font-size': 20 });
  svgEl('rect', { x: bx, y: 44, width: bw * 1.6093, height: 26, rx: 4, fill: '#fff4dd', stroke: '#c8901a', 'stroke-width': 2.5 }, svg);
  txt(bx - 14, 112, '1 km', { 'text-anchor': 'end', 'font-size': 20 });
  svgEl('rect', { x: bx, y: 94, width: bw, height: 26, rx: 4, fill: '#e8f0fc', stroke: INK, 'stroke-width': 2.5 }, svg);
  txt(bx + bw + 14, 113, '1 mile ≈ 1.6 km', { 'text-anchor': 'start', fill: PT, 'font-size': 19 });
  txt(bx + bw * 0.8, 146, '(bars drawn to scale)', { 'font-size': 14, 'font-style': 'italic', 'font-weight': 600, fill: '#555' });
  // buttons + output
  const bar = h('div', 'u10l4a-roadbtns'); host.appendChild(bar);
  const drive = h('button', 'pill', 'Drive across'); drive.type = 'button'; bar.appendChild(drive);
  const conv = h('button', 'pill', 'Convert 65 mph'); conv.type = 'button'; bar.appendChild(conv);
  const out = h('div', 'u10l4a-roadout'); bar.appendChild(out);
  let x = 190, busy = false;
  drive.onclick = async () => {
    if (busy) return; busy = true; const c = liveCtx(), x0 = x, x1 = x0 < 500 ? 640 : 190;
    await tween(c, 1500, (t) => carAt(x0 + (x1 - x0) * t)); x = x1; busy = false;
  };
  conv.onclick = async () => {
    const c = liveCtx(); out.innerHTML = '';
    const row = h('div', 'u10l4a-frow'); out.appendChild(row);
    const a = fracEl({ n: ['65', 'mi'], d: ['1', 'h'] }), b = fracEl({ n: ['1.6093', 'km'], d: ['1', 'mi'] });
    row.append(a, h('div', 'u10l4a-op', '×'), b);
    const res = h('div', 'u10l4a-res', T('\\approx104.6') + ' <b>km/h</b>'); row.appendChild(res); res.style.opacity = 0;
    hl(a.nu); hl(b.du); await sleep(c, 500);
    await Promise.all([strike(c, a.nu), strike(c, b.du)]); await fadeIn(c, res, 400);
  };
}

/* =============================== static: Section 2 number line =============================== */
function mountStatics() {
  const f = document.getElementById('u10l4a-nlfig');
  if (f) prefixLine(f, { width: 940, height: 112, axisY: 52 });
}

/* =============================== explainer: zoom (what a prefix means) =============================== */
const ZOOM = {
  m: { label: 'Zoom into a metre', rows: [['1\\text{ m}', 10, '1\\text{ dm}', '=10\\text{ dm}'], ['1\\text{ dm}', 10, '1\\text{ cm}', '=10\\text{ cm}'], ['1\\text{ cm}', 10, '1\\text{ mm}', '=10\\text{ mm}']],
    caps: ['One <b>metre</b>, split into <b>10 equal parts</b>. Each part is a <b>decimetre</b> (deci = a tenth): ' + T('1\\text{ m}=10\\text{ dm}') + '.',
      'Zoom into one decimetre: 10 parts again, each a <b>centimetre</b>. ' + T('1\\text{ dm}=10\\text{ cm}') + ', so ' + T('1\\text{ m}=10\\times10=100\\text{ cm}') + '.',
      'Zoom into one centimetre: 10 <b>millimetres</b>. So ' + T('1\\text{ m}=10\\times10\\times10=1000\\text{ mm}') + '.',
      'Every step down the chart is <b>×10</b>: that is why the prefixes are powers of ten (centi ' + T('10^{-2}') + ', milli ' + T('10^{-3}') + '). The same prefixes work for grams and litres.'],
    eq: '1\\text{ m}=10\\text{ dm}=100\\text{ cm}=1000\\text{ mm}' },
  km: { label: 'Zoom out to a kilometre', rows: [['1\\text{ km}', 10, '1\\text{ hm}', '=10\\text{ hm}'], ['1\\text{ hm}', 10, '1\\text{ dam}', '=10\\text{ dam}'], ['1\\text{ dam}', 10, '1\\text{ m}', '=10\\text{ m}']],
    caps: ['One <b>kilometre</b>, split into 10: each part is a <b>hectometre</b>. ' + T('1\\text{ km}=10\\text{ hm}') + '.',
      'Zoom into one hectometre: 10 <b>decametres</b>. ' + T('1\\text{ hm}=10\\text{ dam}') + '.',
      'Zoom into one decametre: 10 <b>metres</b>. So ' + T('1\\text{ km}=10\\times10\\times10=1000\\text{ m}') + '.',
      '<b>kilo</b> means ' + T('10^{3}=1000') + ' for any base unit: ' + T('1\\text{ kg}=1000\\text{ g}') + ' and ' + T('1\\text{ kL}=1000\\text{ L}') + '.'],
    eq: '1\\text{ km}=10\\text{ hm}=100\\text{ dam}=1000\\text{ m}' },
  ext: { label: 'Extension: milli → micro → nano', rows: [['1\\text{ mm}', 1000, '1\\ \\mu\\text{m}', '=1000\\ \\mu\\text{m}'], ['1\\ \\mu\\text{m}', 1000, '1\\text{ nm}', '=1000\\text{ nm}']],
    caps: ['<b>Extension.</b> One millimetre split into <b>1000</b> equal parts: each is a <b>micrometre</b>, ' + T('1\\ \\mu\\text{m}') + '. Far too many to count!',
      'Zoom into one micrometre: another 1000 parts, each a <b>nanometre</b>. ' + T('1\\ \\mu\\text{m}=1000\\text{ nm}') + '.',
      'Each Extension step is <b>×1000</b>, three places at once. That is why m, ' + T('\\mu') + ' and n sit <b>3 positions apart</b> on the number line.'],
    eq: '1\\text{ mm}=1000\\ \\mu\\text{m}=1\\,000\\,000\\text{ nm}' }
};
const zoom = {
  title: 'What a prefix means: zoom in by tens',
  height: 410,
  choices: Object.keys(ZOOM).map((k) => ({ v: k, label: ZOOM[k].label })),
  intro: 'Split one unit into equal parts, then zoom into one part. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = ZOOM[k], W = ex.W, x0 = 150, BW = W - x0 - 150, gap = d.rows.length === 3 ? 108 : 150, rows = [];
    d.rows.forEach((r, i) => {
      const y = 20 + i * gap, g = svgEl('svg', { width: W, height: 70, class: 'u10l4a-zsvg' }, stage); g.style.left = '0px'; g.style.top = y + 'px';
      svgEl('rect', { x: x0, y: 8, width: BW, height: 34, rx: 4, fill: '#fff', stroke: INK, 'stroke-width': 2.5 }, g);
      svgEl('rect', { x: x0, y: 8, width: BW / r[1], height: 34, fill: i % 2 ? '#e2ebfb' : '#fff1d6', stroke: 'none' }, g);
      for (let j = 1; j < r[1]; j++) { const xx = x0 + BW * j / r[1]; svgEl('line', { x1: xx, x2: xx, y1: r[1] > 10 && j % 100 ? 22 : 8, y2: 42, stroke: INK, 'stroke-width': r[1] > 10 ? (j % 100 ? 0.35 : 1.6) : 1.8 }, g); }
      const wl = add(stage, h('div', 'u10l4a-zlab', T(r[0])), 14, y + 12);
      const pl = add(stage, h('div', 'u10l4a-zsub', 'each part ' + T(r[2])), x0, y + 46);
      const eq = add(stage, h('div', 'u10l4a-zeq', T(r[3])), x0 + BW + 12, y + 12);
      let fun = null;
      if (i) {
        const yy = 20 + (i - 1) * gap + 42;
        fun = svgEl('svg', { width: W, height: gap }, stage); fun.style.left = '0px'; fun.style.top = yy + 'px';
        const pw = BW / d.rows[i - 1][1];
        svgEl('path', { d: `M${x0} 0 L${x0 + pw} 0 L${x0 + BW} ${gap - 34} L${x0} ${gap - 34} Z`, fill: '#9aa0ab', 'fill-opacity': 0.12, stroke: '#7a8090', 'stroke-width': 1.6, 'stroke-dasharray': '6 5' }, fun);
      }
      [g, wl, pl, eq, fun].forEach((e) => e && hide(e)); rows.push([fun, g, wl, pl, eq]);
    });
    const fin = hide(add(stage, h('div', 'u10l4a-line big', T(d.eq)), 0, ex.def.height - 52)); centerX(fin, W / 2);
    const steps = d.rows.map((r, i) => ({
      cap: d.caps[i],
      run: async (c) => { const [fun, g, wl, pl, eq] = rows[i]; if (fun) await appear(c, fun, 350); await appear(c, g, 350); await show(c, wl); await show(c, pl); await pop(c, eq); }
    }));
    steps.push({ cap: d.caps[d.rows.length], run: async (c) => { await pop(c, fin, 420); } });
    return steps;
  }
};

/* =============================== explainer: hop (the star) =============================== */
const HOP = {
  notes: { label: `The notes: ${T('1\\text{ km}\\to\\text{mm}')}`, D: '1', p: 1, from: 'k', to: 'm', base: 'm' },
  e1a: { label: `Example 1(a) check: ${T('1\\text{ m}\\to\\text{cm}')}`, D: '1', p: 1, from: '', to: 'c', base: 'm' },
  e1b: { label: `Example 1(b) check: ${T('1\\text{ cm}\\to\\text{m}')}`, D: '1', p: 1, from: 'c', to: '', base: 'm' },
  e1c: { label: `Example 1(c) check: ${T('1\\text{ kL}\\to\\text{L}')}`, D: '1', p: 1, from: 'k', to: '', base: 'L' },
  e2a: { label: `Example 2(a) check: ${T('4.6\\text{ m}\\to\\text{cm}')}`, D: '46', p: 1, from: '', to: 'c', base: 'm' },
  e2b: { label: `Example 2(b) check: ${T('58\\,400\\text{ mg}\\to\\text{kg}')}`, D: '58400', p: 5, from: 'm', to: 'k', base: 'g' },
  e2c: { label: `Ext: Example 2(c) check: ${T('215\\ \\mu\\text{m}\\to\\text{nm}')}`, D: '215', p: 3, from: '\\mu', to: 'n', base: 'm' }
};
const hop = {
  title: 'The metric number line: count the steps, hop the point',
  height: 400,
  choices: Object.keys(HOP).map((k) => ({ v: k, label: HOP[k].label })),
  intro: 'Find the two units on the line, count the steps, and watch the decimal point hop one place per step. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = HOP[key], W = ex.W, a = pos(d.from), b = pos(d.to), k = b - a, n = Math.abs(k), dir = Math.sign(k), right = k > 0;
    const val = d.p < d.D.length ? d.D.slice(0, d.p) + '.' + d.D.slice(d.p) : d.D;
    const nx = 20, N = prefixLine(stage, { x: nx, y: 4, width: W - 40, height: 168, axisY: 92, base: d.base, unitLift: 50 });
    const u0 = uTex(d.from, d.base), u1 = uTex(d.to, d.base), U0 = capU(d.from, d.base), U1 = capU(d.to, d.base);
    const pA = hide(linePill(stage, N, nx, a, 'from ' + T(u0), 'st', 140, right ? 'l' : 'r')), pB = hide(linePill(stage, N, nx, b, 'to ' + T(u1), 'en', 140, right ? 'r' : 'l'));
    if (a === b) pB.style.display = 'none';
    const tape = new Tape(stage, { D: d.D, p: d.p, k, cx: W / 2 + 40, y: 190, unit: T(u0) }); hide(tape.el);
    const cnt = hide(add(stage, h('div', 'u10l4a-count ' + (right ? 'r' : 'l'), `${n} step${n > 1 ? 's' : ''} ${right ? 'right' : 'left'}: ${T(right ? '\\times10^{' + n + '}' : '\\div10^{' + n + '}')}`), 16, 204));
    const ans = tape.answer(), one = d.D === '1';
    const eqT = one ? `1${U0}=10^{${k}}${U1}=${nT(ans)}${U1}` : `${nT(val)}${U0}=${nT(ans)}${U1}`;
    const calcT = one ? '' : right ? `${nT(val)}\\times10^{${n}}=${nT(ans)}` : `${nT(val)}\\div10^{${n}}=${nT(ans)}`;
    const fin = hide(add(stage, h('div', 'u10l4a-line big', T(eqT)), 0, 314)); centerX(fin, W / 2);
    const tidyNote = (() => {
      const { out, pointGone } = tape.tidyIdx(), tz = out.filter((i) => i >= tape.e).length, lz = out.filter((i) => i < tape.e).length;
      const bits = [];
      if (pointGone && tape.e === tape.full.length) bits.push('a point at the very end isn’t written');
      else if (tz) bits.push('zeros at the end of a decimal can go');
      if (lz) bits.push('extra zeros in front can go');
      if (!right && tape.lp) bits.push('write a 0 in front of the point');
      return bits.length ? bits.join('; ') : 'nothing to tidy';
    })();
    const zeros = tape.lp + tape.rp;
    return [
      { cap: `Write the number with its decimal point: ${T(nT(val) + U0)}. Find ${uCap(d.from, d.base)} and ${uCap(d.to, d.base)} on the line.`,
        run: async (c) => { await show(c, pA); if (a !== b) await show(c, pB); await fadeIn(c, tape.el, 380); } },
      { cap: `From ${pName(d.from)} to ${pName(d.to)} is <b>${n} step${n > 1 ? 's' : ''} ${right ? 'right' : 'left'}</b>. ${right ? 'Right means smaller units, so you need <b>more</b> of them: the number gets <b>bigger</b>, ×10 per step.' : 'Left means bigger units, so you need <b>fewer</b> of them: the number gets <b>smaller</b>, ÷10 per step.'}`,
        run: async (c) => { await N.drawIn(N.interval(Math.min(a, b), Math.max(a, b), { color: right ? RT : LT, width: 7 }), 500, c); await pop(c, cnt); } },
      { cap: `Hop! Each step on the line moves the decimal point <b>one place ${right ? 'right' : 'left'}</b>.${zeros ? ' Empty places fill with <b>zeros</b>.' : ''}`,
        run: async (c) => {
          for (let i = 0; i < n; i++) await Promise.all([N.hop(c, a + dir * i, a + dir * (i + 1), { label: right ? '×10' : '÷10', color: right ? RT : LT, height: 20, ms: 380 }), tape.hop(c, dir)]);
        } },
      { cap: `Re-write it: ${tidyNote}. ${calcT ? T(calcT) + ', so ' : ''}${T(eqT)}.`,
        run: async (c) => { if (!right) await tape.lead(c); await tape.tidy(c); await tape.setUnit(c, T(u1)); await pop(c, fin, 420); const s = stamp(stage, '✓', { x: W - 70, y: 336 }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: sci (Extension) =============================== */
const SCI = {
  a: { label: `Example 3(a) check: ${T('18\\text{ km}\\to\\text{mm}')}`, D: '18', p: 2, from: 'k', to: 'm', base: 'm', std: '18\\,000\\,000' },
  b: { label: `Example 3(b) check: ${T('640\\ \\mu\\text{g}\\to\\text{g}')}`, D: '640', p: 3, from: '\\mu', to: '', base: 'g', std: '0.00064' },
  c: { label: `Example 3(c) check: ${T('12\\,400\\text{ cL}\\to\\text{ML}')}`, D: '12400', p: 5, from: 'c', to: 'M', base: 'L', std: '0.000124' }
};
const capU = (p, b) => (p === '\\mu' ? `\\ \\mu\\text{${b}}` : `\\text{ ${p}${b}}`);
const sci = {
  title: 'Extension: one big jump, then scientific notation',
  height: 420,
  choices: Object.keys(SCI).map((k) => ({ v: k, label: SCI[k].label })),
  intro: 'Count the steps and jump all at once, then slide the point so one digit sits in front of it. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = SCI[key], W = ex.W, a = pos(d.from), b = pos(d.to), k = b - a, n = Math.abs(k), right = k > 0;
    const val = nT(d.D), U0 = capU(d.from, d.base), U1 = capU(d.to, d.base);
    const nx = 20, N = prefixLine(stage, { x: nx, y: 4, width: W - 40, height: 168, axisY: 92, base: d.base, unitLift: 50 });
    const pA = hide(linePill(stage, N, nx, a, 'from ' + T(uTex(d.from, d.base)), 'st', 140, right ? 'l' : 'r')), pB = hide(linePill(stage, N, nx, b, 'to ' + T(uTex(d.to, d.base)), 'en', 140, right ? 'r' : 'l'));
    const shift = 1 - d.p, e1 = k - shift; // the point moves left (p − 1) places; the exponent goes up by the same
    const tape = new Tape(stage, { D: d.D, p: d.p, k: shift, cx: W / 2 - 150, y: 196, unit: '' }); hide(tape.el);
    const expEl = add(tape.el, h('div', 'u10l4a-tunit u10l4a-sciexp', T(`\\times10^{${k}}`)), tape.full.length * tape.slot + 16, 14);
    expEl.style.color = INK; expEl.style.fontSize = '40px';
    const unitEl = add(tape.el, h('div', 'u10l4a-tunit', T(uTex(d.to, d.base))), tape.full.length * tape.slot + 190, 18);
    tape.el.style.width = tape.full.length * tape.slot + 300 + 'px';
    const mant = tape.answer(), mT = mant;
    const fin = hide(add(stage, h('div', 'u10l4a-line big', T(`${val}${U0}=${val}\\times10^{${k}}${U1}=${mT}\\times10^{${e1}}${U1}`)), 0, 318)); centerX(fin, W / 2);
    const std = hide(add(stage, h('div', 'u10l4a-line muted', `in standard notation, ${T(d.std + U1)}`), 0, 364)); centerX(std, W / 2);
    const big = { el: null };
    return [
      { cap: `${T(val + U0)} to ${uCap(d.to, d.base)}: from ${pName(d.from)} to ${pName(d.to)} is <b>${n} steps ${right ? 'right' : 'left'}</b>. Too many to hop one at a time.`,
        run: async (c) => { await show(c, pA); await show(c, pB); await N.drawIn(N.interval(Math.min(a, b), Math.max(a, b), { color: right ? RT : LT, width: 7 }), 500, c); } },
      { cap: `${n} steps ${right ? 'right' : 'left'} is ${T(`\\times10^{${k}}`)} in one jump: ${T(`${val}${U0}=${val}\\times10^{${k}}${U1}`)}.`,
        run: async (c) => { big.el = await N.hop(c, a, b, { label: T(`\\times10^{${k}}`), color: right ? RT : LT, height: 20, ms: 700 }); await fadeIn(c, tape.el, 380); } },
      { cap: `Scientific notation wants <b>one</b> non-zero digit in front of the point. Slide the point <b>${-shift} place${-shift > 1 ? 's' : ''} left</b>: the front number gets ${-shift > 1 ? T('10^{' + -shift + '}') : '10'} times smaller, so the exponent goes <b>up ${-shift}</b> to balance.`,
        run: async (c) => {
          let e = k;
          for (let i = 0; i < -shift; i++) { await tape.hop(c, -1); e += 1; expEl.innerHTML = T(`\\times10^{${e}}`); await pulse(c, expEl, 1.15, 320); }
        } },
      { cap: `Tidy the zeros at the end: ${T(`${val}${U0}=${mT}\\times10^{${e1}}${U1}`)}.`,
        run: async (c) => { await tape.tidy(c); await pop(c, fin, 420); await show(c, std); } }
    ];
  }
};

/* =============================== explainer: prop (two arrangements) =============================== */
const PROP = {
  ex4: { label: `Example 4 check: ${T('450\\text{ cm}\\to\\text{m}')}`,
    A: ['1\\text{ m}', '100\\text{ cm}'], B: ['x', '450\\text{ cm}'],
    cross: '(1\\text{ m})(450\\text{ cm})=(x)(100\\text{ cm})',
    solve: 'x=\\dfrac{(1\\text{ m})(450\\,\\cancel{\\text{cm}})}{100\\,\\cancel{\\text{cm}}}=\\dfrac{450}{100}',
    ans: 'x=4.5\\text{ m}', cu: 'cm', tab: [['1', '100'], ['x', '450']],
    pr: '\\dfrac{1}{x}=\\dfrac{100}{450}', pr2: '100x=450', pAns: 'x=\\dfrac{450}{100}=4.5\\text{ m}', fin: '450\\text{ cm}=4.5\\text{ m}' },
  alt: { label: `Another: ${T('1.75\\text{ m}\\to\\text{cm}')}`,
    A: ['1\\text{ m}', '100\\text{ cm}'], B: ['1.75\\text{ m}', 'x'],
    cross: '(1\\text{ m})(x)=(1.75\\text{ m})(100\\text{ cm})',
    solve: 'x=\\dfrac{(1.75\\,\\cancel{\\text{m}})(100\\text{ cm})}{1\\,\\cancel{\\text{m}}}=1.75\\times100',
    ans: 'x=175\\text{ cm}', cu: 'm', tab: [['1', '100'], ['1.75', 'x']],
    pr: '\\dfrac{1}{1.75}=\\dfrac{100}{x}', pr2: 'x=1.75\\times100', pAns: 'x=175\\text{ cm}', fin: '1.75\\text{ m}=175\\text{ cm}' }
};
function pFrac(host, x, y, nTex, dTex) {
  const f = add(host, h('div', 'u10l4a-pfr'), x, y);
  f.n = f.appendChild(h('div', 'num', T(nTex))); f.d = f.appendChild(h('div', 'den', T(dTex)));
  return f;
}
const prop = {
  title: 'Two correct arrangements of the same proportion',
  height: 430,
  choices: Object.keys(PROP).map((k) => ({ v: k, label: PROP[k].label })),
  intro: 'Sam cross-multiplies; Priya builds a table with headers. Same ratio, two layouts. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = PROP[key], W = ex.W, pw = (W - 42) / 2, H = ex.def.height;
    const S = panel(stage, 14, 12, pw, H - 24, 'Sam · cross multiplication'), P = panel(stage, 28 + pw, 12, pw, H - 24, 'Priya · table of headers');
    const row = h('div', 'u10l4a-eqrow'); S.appendChild(row);
    const fA = pFrac(row, 6, 0, d.A[0], d.A[1]), eq = add(row, h('div', 'u10l4a-peq', '='), 190, 34), fB = pFrac(row, 250, 0, d.B[0], d.B[1]);
    const X = svgEl('svg', { width: 400, height: 112, style: 'position:absolute;left:0;top:0;overflow:visible' }, row);
    const xl1 = svgEl('line', { x1: 146, y1: 24, x2: 252, y2: 84, stroke: AMB, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, X);
    const xl2 = svgEl('line', { x1: 146, y1: 84, x2: 252, y2: 24, stroke: RT, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, X);
    [fA, eq, fB, xl1, xl2].forEach(hide);
    const s1 = hide(line(S, T(d.cross))), s2 = hide(line(S, T(d.solve))), s3 = hide(line(S, T(d.ans), 'big'));
    const tb = h('table', 'u10l4a-ptab'); P.appendChild(tb);
    tb.innerHTML = `<tr><th>m</th><th>cm</th></tr>` + d.tab.map((r) => `<tr><td>${T(r[0])}</td><td>${T(r[1])}</td></tr>`).join('');
    tb.style.alignSelf = 'center'; tb.style.margin = '6px 0'; hide(tb);
    const cells = [...tb.querySelectorAll('td')];
    const q1 = hide(line(P, T(d.pr))), q2 = hide(line(P, T(d.pr2))), q3 = hide(line(P, T(d.pAns), 'big'));
    [s1, s2, s3, q1, q2, q3].forEach((e) => { e.style.textAlign = 'center'; });
    let sa = null, sb = null;
    return [
      { cap: `<b>Sam:</b> the known ratio and the unknown ratio, with <b>matching units in matching positions</b> (m on top, cm on the bottom).`,
        run: async (c) => { await pop(c, fA); await appear(c, eq, 200); await pop(c, fB); } },
      { cap: `<b>Sam:</b> cross-multiply. Each top times the <b>other</b> bottom: ${T(d.cross)}.`,
        run: async (c) => {
          fA.n.classList.add('a'); fB.d.classList.add('a'); await appear(c, xl1, 300);
          fA.d.classList.add('b2'); fB.n.classList.add('b2'); await appear(c, xl2, 300); await show(c, s1);
        } },
      { cap: `<b>Sam:</b> divide to get ${T('x')} alone. <b>${d.cu}</b> is on the top and the bottom, so it cancels: ${T(d.ans)}.`,
        run: async (c) => { await show(c, s2); await pop(c, s3); } },
      { cap: `<b>Priya:</b> a table keeps each unit in its own <b>column</b>. Row 1 is the fact ${T('1\\text{ m}=100\\text{ cm}')}; row 2 is the question.`,
        run: async (c) => { await fadeIn(c, tb, 400); } },
      { cap: `<b>Priya:</b> each column makes a ratio: ${T(d.pr)}. Solve: ${T(d.pr2)}, so ${T(d.pAns)}.`,
        run: async (c) => {
          cells[0].classList.add('a'); cells[2].classList.add('a'); await sleep(c, 250); cells[1].classList.add('b2'); cells[3].classList.add('b2');
          await show(c, q1); await show(c, q2); await pop(c, q3);
        } },
      { cap: `Different layouts, <b>the same answer</b>: ${T(d.fin)}. Any arrangement works as long as matching units sit in matching positions.`,
        run: async (c) => {
          sa = stamp(S, 'same ✓', { x: pw - 70, y: H - 70 }); sb = stamp(P, 'same ✓', { x: pw - 70, y: H - 70 });
          await Promise.all([stampIn(c, sa), stampIn(c, sb)]);
        } }
    ];
  }
};

/* =============================== explainer: ratio (whale and smoothie) =============================== */
const ratio = {
  title: 'Ratios from the question: a scale and a recipe',
  height: 420,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'whale', label: 'Example 5 check: the whale' }, { v: 'smoothie', label: 'Example 6 check: the smoothie' }],
  intro: (v) => (v === 'whale' ? 'A double number line: photo centimetres on top, real metres below. Press <b>Next</b>.' : 'A tape diagram: equal-sized parts of yogurt and juice. Press <b>Next</b>.'),
  make(stage, v, ex) { return v === 'whale' ? whaleSteps(stage, ex) : smoothieSteps(stage, ex); }
};
function whaleSteps(stage, ex) {
  const W = ex.W, x0 = 150, w = W - x0 - 40;
  const top = new NumberLine(stage, { x: x0, y: 20, width: w, height: 90, min: 0, max: 3, step: 0.5, arrows: true, labels: [{ v: 0, html: '0' }, { v: 1, html: '1' }, { v: 2, html: '2' }, { v: 2.5, html: '2.5' }] });
  const bot = new NumberLine(stage, { x: x0, y: 150, width: w, height: 90, min: 0, max: 7.2, step: 1.2, arrows: true, labels: [{ v: 0, html: '0' }, { v: 2.4, html: '2.4' }, { v: 4.8, html: '4.8' }] });
  add(stage, h('div', 'u10l4a-tlab', 'photo (cm)'), 14, 20 + top.ay - 14);
  add(stage, h('div', 'u10l4a-tlab', 'actual (m)'), 14, 150 + bot.ay - 14);
  const link = (vt, vb, color) => { const s = svgEl('svg', { width: W, height: 260, style: 'position:absolute;left:0;top:0;overflow:visible' }, stage); svgEl('line', { x1: x0 + top.toPx(vt), y1: 20 + top.ay + 10, x2: x0 + bot.toPx(vb), y2: 150 + bot.ay - 10, stroke: color, 'stroke-width': 3, 'stroke-dasharray': '7 6' }, s); return s; };
  const l1 = hide(link(1, 2.4, TEAL)), l2 = hide(link(2.5, 6, PT));
  const q = hide(add(stage, h('div', 'u10l4a-line big', T('x')), x0 + bot.toPx(6) - 8, 150 + bot.ay + 16));
  const six = hide(add(stage, h('div', 'u10l4a-line big', '<b>6</b>'), x0 + bot.toPx(6) - 8, 150 + bot.ay + 16)); six.style.color = PT;
  const eqs = add(stage, h('div', 'u10l4a-frow'), 0, 300); eqs.style.gap = '40px';
  const e1 = eqs.appendChild(h('div', 'u10l4a-line big', T('\\dfrac{1\\text{ cm}}{2.4\\text{ m}}=\\dfrac{2.5\\text{ cm}}{x}')));
  const e2 = eqs.appendChild(h('div', 'u10l4a-line big', T('(1)(x)=(2.5)(2.4)')));
  const e3 = eqs.appendChild(h('div', 'u10l4a-line big', T('x=6\\text{ m}')));
  centerX(eqs, W / 2); [e1, e2, e3].forEach(hide);
  let band = null;
  return [
    { cap: 'The scale: <b>1 cm</b> on the photo stands for <b>2.4 m</b> of whale. Line them up.',
      run: async (c) => { await pop(c, top.point(1, { color: TEAL })); await pop(c, bot.point(2.4, { color: TEAL })); await appear(c, l1, 300); } },
    { cap: `The flukes are <b>2.5 cm</b> on the photo. Matching units in matching positions: ${T('\\dfrac{1\\text{ cm}}{2.4\\text{ m}}=\\dfrac{2.5\\text{ cm}}{x}')}.`,
      run: async (c) => { await pop(c, top.point(2.5, { color: PT })); await appear(c, l2, 300); await show(c, q); await show(c, e1); } },
    { cap: `2.5 cm is <b>2.5 times</b> as far along the photo line, so ${T('x')} is 2.5 times 2.4 m. Cross-multiplying says the same: ${T('(1)(x)=(2.5)(2.4)')}, so ${T('x=6')} m.`,
      run: async (c) => {
        await top.drawIn(top.interval(0, 2.5, { color: PT, width: 6 }), 500, c); await bot.drawIn(bot.interval(0, 6, { color: PT, width: 6 }), 500, c);
        await show(c, e2); hide(q); await pop(c, six); await pop(c, e3);
      } },
    { cap: 'Is it reasonable? A blue whale’s tail flukes span roughly <b>6 to 7 m</b>, and 6 m lands right in that range. ✓',
      run: async (c) => { band = bot.interval(6, 7, { color: KEEP, width: 16 }); band.style.opacity = 0.35; await bot.drawIn(band, 400, c); const s = stamp(stage, 'reasonable ✓', { x: W - 140, y: 258 }); await stampIn(c, s); } }
  ];
}
function smoothieSteps(stage, ex) {
  const W = ex.W, x0 = 170, bw0 = 64, bw1 = bw0 * 110 / 80, yY = 40, yJ = 130;
  add(stage, h('div', 'u10l4a-tlab', 'yogurt'), 20, yY + 10).style.color = '#8a5a06';
  add(stage, h('div', 'u10l4a-tlab', 'juice'), 20, yJ + 10).style.color = '#9b2c25';
  const mk = (y, cls, n) => Array.from({ length: n }, (_, i) => add(stage, box(h('div', 'u10l4a-blk ' + cls, ''), bw0, 46), x0 + i * bw0, y));
  const Y = mk(yY, 'y', 3), J = mk(yJ, 'j', 7);
  const totY = add(stage, h('div', 'u10l4a-tlab', T('240\\text{ mL}')), x0 + 3 * bw0 + 14, yY + 10), totJ = add(stage, h('div', 'u10l4a-tlab', T('560\\text{ mL}')), x0 + 7 * bw0 + 14, yJ + 10);
  Y.concat(J).concat([totY, totJ]).forEach(hide);
  const ex1 = hide(add(stage, box(h('div', 'u10l4a-blk y add', '+90'), bw0 * 90 / 80, 46), x0 + 3 * bw0, yY));
  const eqs = add(stage, h('div', 'u10l4a-frow'), 0, 230); eqs.style.gap = '34px';
  const e1 = eqs.appendChild(h('div', 'u10l4a-line big', T('240:560=3:7')));
  const e2 = eqs.appendChild(h('div', 'u10l4a-line big', T('\\dfrac{3}{7}=\\dfrac{330}{j}')));
  const e3 = eqs.appendChild(h('div', 'u10l4a-line big', T('3j=2310,\\ \\ j=770\\text{ mL}')));
  centerX(eqs, W / 2); [e1, e2, e3].forEach(hide);
  const e4 = hide(add(stage, h('div', 'u10l4a-line big', T('\\text{extra juice}=770-560=210\\text{ mL}')), 0, 316)); centerX(e4, W / 2);
  const setW = (bw, t) => {
    Y.forEach((b, i) => { b.style.width = bw + 'px'; b.style.left = x0 + i * bw + 'px'; });
    J.forEach((b, i) => { b.style.width = bw + 'px'; b.style.left = x0 + i * bw + 'px'; });
    totY.style.left = x0 + 3 * bw + 14 + 'px'; totJ.style.left = x0 + 7 * bw + 14 + 'px';
  };
  let jx = null;
  return [
    { cap: `The recipe: <b>240 mL</b> of yogurt to <b>560 mL</b> of juice. Both bars are cut into equal parts of <b>80 mL</b>, so the ratio is ${T('240:560=3:7')}.`,
      run: async (c) => { Y.concat(J).forEach((b) => (b.innerHTML = T('80'))); await Promise.all(Y.concat(J).map((b, i) => pop(c, b, 240, { delay: i * 40 }))); await show(c, totY); await show(c, totJ); await show(c, e1); } },
    { cap: 'Dana adds <b>90 mL</b> more yogurt: now there is <b>330 mL</b>. To keep 3 : 7, the yogurt must still be exactly 3 equal parts.',
      run: async (c) => { await pop(c, ex1); totY.innerHTML = T('330\\text{ mL}'); await pulse(c, totY); } },
    { cap: `So each part grows to ${T('330\\div3=110')} mL, in <b>both</b> bars. The proportion: ${T('\\dfrac{3}{7}=\\dfrac{330}{j}')}, so ${T('3j=7(330)=2310')} and ${T('j=770')} mL of juice in total.`,
      run: async (c) => {
        hide(ex1); await tween(c, 700, (t) => setW(bw0 + (bw1 - bw0) * t));
        Y.concat(J).forEach((b) => (b.innerHTML = T('110'))); totJ.innerHTML = T('770\\text{ mL}');
        await show(c, e2); await show(c, e3);
      } },
    { cap: `She already poured 560 mL, so the <b>extra</b> juice is ${T('770-560=210')} mL. (Shortcut: extra to extra, ${T('\\dfrac{3}{7}=\\dfrac{90}{e}')} gives ${T('e=210')} too.)`,
      run: async (c) => {
        jx = add(stage, box(h('div', 'u10l4a-blk j add', T('+210')), 7 * (bw1 - bw0), 34), x0 + 7 * bw0, yJ + 54); await pop(c, jx); await pop(c, e4);
        const s = stamp(stage, '210 mL ✓', { x: W - 110, y: 330 }); await stampIn(c, s);
      } }
  ];
}

/* =============================== explainer: map (1 : 250 000) =============================== */
function drawMap(stage, x, y, w, hh) {
  const s = svgEl('svg', { width: w, height: hh, style: `position:absolute;left:${x}px;top:${y}px;overflow:visible` }, stage);
  svgEl('rect', { x: 0, y: 0, width: w, height: hh, rx: 14, fill: '#eef5e6', stroke: '#9fb48d', 'stroke-width': 2 }, s);
  for (const [px, py, pw, ph] of [[30, 30, 110, 70], [300, 210, 120, 80], [180, 40, 90, 50]]) svgEl('rect', { x: px, y: py, width: pw, height: ph, rx: 6, fill: '#e2edcf' }, s);
  svgEl('path', { d: `M-2 ${hh * 0.62} C ${w * 0.25} ${hh * 0.5}, ${w * 0.4} ${hh * 0.85}, ${w * 0.62} ${hh * 0.7} S ${w * 0.9} ${hh * 0.45}, ${w + 2} ${hh * 0.5}`, fill: 'none', stroke: '#7fb2e5', 'stroke-width': 7, 'stroke-linecap': 'round' }, s);
  svgEl('path', { d: `M ${w * 0.08} ${hh + 2} L ${w * 0.35} ${hh * 0.12} L ${w * 0.9} -2`, fill: 'none', stroke: '#b9b2a1', 'stroke-width': 5 }, s);
  return s;
}
const map = {
  title: 'Map scales: 1 : 250 000',
  height: 420,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'cm', label: 'What 1 map cm stands for' }, { v: 'a', label: 'Example 7(a) check: towns' }, { v: 'b', label: 'Example 7(b) check: lakes' }],
  intro: 'The same unit on both sides of the ratio; convert to a convenient unit at the end. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, H = ex.def.height, mw = 430, mh = H - 30, M = drawMap(stage, 14, 14, mw, mh);
    const sc = add(stage, h('div', 'u10l4a-scalebox', 'Scale ' + T('1:250\\,000')), 30, H - 60);
    const P = panel(stage, mw + 34, 14, W - mw - 48, H - 28, v === 'cm' ? 'What 1 cm stands for' : v === 'a' ? 'Towns: map → ground' : 'Lakes: ground → map');
    const L = (t, cls) => hide(line(P, T(t), cls));
    const dot = (cx, cy, color, lab, ry) => {
      const g = svgEl('g', {}, M);
      if (ry) svgEl('ellipse', { cx, cy, rx: 26, ry, fill: '#7fb2e5', stroke: '#4a86c5', 'stroke-width': 2 }, g);
      else svgEl('circle', { cx, cy, r: 9, fill: color, stroke: '#fff', 'stroke-width': 2.5 }, g);
      const t = add(stage, h('div', 'u10l4a-maplab', lab), 14 + cx - 30, 14 + cy + (ry ? ry + 4 : 12)); return [g, t];
    };
    const seg = (x1, y1, x2, y2, color) => svgEl('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': 4, 'stroke-dasharray': '10 7', 'stroke-linecap': 'round' }, M);
    const segLab = (x, y, html, color) => { const e = add(stage, h('div', 'u10l4a-pill', html), 14 + x, 14 + y); e.style.color = color; e.style.translate = '-50% -50%'; return e; };
    if (v === 'cm') {
      const bar = svgEl('g', {}, M); svgEl('line', { x1: 60, y1: 300, x2: 160, y2: 300, stroke: INK, 'stroke-width': 5 }, bar);
      for (const xx of [60, 160]) svgEl('line', { x1: xx, y1: 290, x2: xx, y2: 310, stroke: INK, 'stroke-width': 3 }, bar);
      const bl = segLab(110, 272, T('1\\text{ cm}'), INK); hide(bar); hide(bl);
      const l1 = L('1\\text{ cm}\\ \\to\\ 250\\,000\\text{ cm}', 'big'), l2 = L('250\\,000\\text{ cm}\\div100=2500\\text{ m}'), l3 = L('2500\\text{ m}\\div1000=2.5\\text{ km}'), l4 = L('1\\text{ cm on the map}=2.5\\text{ km}', 'big');
      const l5 = hide(line(P, `Quick check for Example 7(a): ${T('18.4\\times2.5=46')} km.`));
      return [
        { cap: `${T('1:250\\,000')} means <b>1 cm</b> on the map stands for <b>250 000 cm</b> on the ground. Same unit on both sides.`, run: async (c) => { await appear(c, bar, 300); await pop(c, bl); await show(c, l1); } },
        { cap: `That many centimetres is hard to picture. cm to m is <b>2 steps left</b> on the number line: ${T('\\div100')}, so 2500 m.`, run: async (c) => { await show(c, l2); } },
        { cap: `m to km is <b>3 steps left</b>: ${T('\\div1000')}. Every centimetre on this map is <b>2.5 km</b> on the ground.`, run: async (c) => { await show(c, l3); await pop(c, l4); } },
        { cap: `Handy for estimating: towns 18.4 cm apart are about ${T('18.4\\times2.5=46')} km apart. That matches Example 7(a).`, run: async (c) => { await show(c, l5); } }
      ];
    }
    if (v === 'a') {
      const [gA, tA] = dot(80, 120, PT, 'Town A'), [gB, tB] = dot(360, 250, PT, 'Town B'); const sg = seg(80, 120, 360, 250, PT); hide(sg);
      const lb = hide(segLab(220, 165, T('18.4\\text{ cm}'), PT));
      const l1 = L('\\dfrac{1\\text{ cm (map)}}{250\\,000\\text{ cm (ground)}}=\\dfrac{18.4\\text{ cm}}{x}'), l2 = L('x=18.4\\times250\\,000=4\\,600\\,000\\text{ cm}');
      const l3 = L('4\\,600\\,000\\,\\cancel{\\text{cm}}\\times\\dfrac{1\\,\\cancel{\\text{m}}}{100\\,\\cancel{\\text{cm}}}\\times\\dfrac{1\\text{ km}}{1000\\,\\cancel{\\text{m}}}'), l4 = L('=46\\text{ km}', 'big');
      return [
        { cap: 'Two towns are <b>18.4 cm</b> apart on the map. Every map centimetre is 250 000 ground centimetres.', run: async (c) => { await appear(c, sg, 400); await pop(c, lb); } },
        { cap: `Proportion, matching units: ${T('\\dfrac{1}{250\\,000}=\\dfrac{18.4}{x}')}.`, run: async (c) => { await show(c, l1); } },
        { cap: `Cross-multiply: ${T('x=18.4\\times250\\,000=4\\,600\\,000')} cm. Correct, but a silly unit for a road trip.`, run: async (c) => { await show(c, l2); } },
        { cap: 'Convert to km <b>at the end</b>: cm cancels, then m cancels, leaving km.', run: async (c) => { await show(c, l3); } },
        { cap: `${T('4\\,600\\,000\\div100\\div1000=46')}: the towns are <b>46 km</b> apart.`, run: async (c) => { await pop(c, l4); const s = stamp(P, '46 km ✓'); s.style.alignSelf = 'center'; await stampIn(c, s); } }
      ];
    }
    const [g1, t1] = dot(110, 90, null, 'Lake 1', 16), [g2, t2] = dot(330, 230, null, 'Lake 2', 16); const sg = seg(110, 90, 330, 230, '#1f5bd6'); hide(sg);
    const lb = hide(segLab(220, 150, T('?\\text{ cm}'), RT)), lb2 = hide(segLab(220, 150, T('12.8\\text{ cm}'), RT));
    const l1 = L('32\\text{ km}=32\\times1000\\times100'), l2 = L('=3\\,200\\,000\\text{ cm}'), l3 = L('\\dfrac{1}{250\\,000}=\\dfrac{x}{3\\,200\\,000}'), l4 = L('x=\\dfrac{3\\,200\\,000}{250\\,000}=12.8\\text{ cm}', 'big');
    return [
      { cap: 'Two lakes are <b>32 km</b> apart on the ground. How far apart on the map?', run: async (c) => { await appear(c, sg, 400); await pop(c, lb); } },
      { cap: 'The scale compares <b>cm to cm</b>, so first write 32 km in centimetres: km to cm is <b>5 steps right</b>, ×1000 then ×100.', run: async (c) => { await show(c, l1); await show(c, l2); } },
      { cap: `Now the proportion: ${T('\\dfrac{1}{250\\,000}=\\dfrac{x}{3\\,200\\,000}')}.`, run: async (c) => { await show(c, l3); } },
      { cap: `${T('x=3\\,200\\,000\\div250\\,000=12.8')}: the lakes are <b>12.8 cm</b> apart on the map. (Check: ${T('12.8\\times2.5=32')} km.)`,
        run: async (c) => { await pop(c, l4); hide(lb); await pop(c, lb2); const s = stamp(P, '12.8 cm ✓'); s.style.alignSelf = 'center'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: one (a conversion factor is 1) =============================== */
const ONE = {
  km: { label: `${T('1\\text{ km}=1000\\text{ m}')}`, big: '1 km', small: '100 m', top: '1000\\text{ m}', bot: '1\\text{ km}', ex: ['9\\text{ km}', '9000\\text{ m}'], exCap: '9 km of trail is still the same trail when you call it 9000 m.' },
  L: { label: `${T('1\\text{ L}=1000\\text{ mL}')}`, big: '1 L', small: '100 mL', top: '1000\\text{ mL}', bot: '1\\text{ L}', ex: ['0.64\\text{ L}', '640\\text{ mL}'], exCap: 'A 640 mL drink is the same drink when you call it 0.64 L.' }
};
const one = {
  title: 'A conversion fraction is a fancy 1',
  height: 330,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(ONE).map((k) => ({ v: k, label: ONE[k].label })),
  intro: 'Two names for the same amount make a fraction equal to 1. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = ONE[k], W = ex.W, x0 = 120, bw = 560;
    const s = svgEl('svg', { width: W, height: 150, style: 'position:absolute;left:0;top:0' }, stage);
    const r1 = svgEl('rect', { x: x0, y: 22, width: bw, height: 40, rx: 4, fill: '#fff1d6', stroke: AMB, 'stroke-width': 2.5 }, s);
    const g2 = svgEl('g', {}, s);
    for (let i = 0; i < 10; i++) svgEl('rect', { x: x0 + i * bw / 10, y: 88, width: bw / 10, height: 40, fill: i % 2 ? '#e2ebfb' : '#edf3fd', stroke: RT, 'stroke-width': 2 }, g2);
    const lb1 = add(stage, h('div', 'u10l4a-zlab', T(d.bot)), 20, 30), lb2 = add(stage, h('div', 'u10l4a-zlab', T(d.top)), 14, 96);
    const sm = add(stage, h('div', 'u10l4a-zsub', T('10\\times' + d.small.replace(/(\d+) (\w+)/, '$1\\text{ $2}') + '=' + d.top)), x0 + bw + 16, 100);
    [r1, g2, lb1, lb2, sm].forEach(hide);
    const fr = add(stage, h('div', 'u10l4a-frow'), 0, 160); fr.style.gap = '60px';
    const f1 = fr.appendChild(h('div', 'u10l4a-line big', T(`\\dfrac{${d.top}}{${d.bot}}=1`))), f2 = fr.appendChild(h('div', 'u10l4a-line big', T(`\\dfrac{${d.bot}}{${d.top}}=1`)));
    centerX(fr, W / 2 - 120); [f1, f2].forEach(hide);
    const e = hide(add(stage, h('div', 'u10l4a-line big', T(`${d.ex[0]}=${d.ex[1]}`)), 0, 262)); centerX(e, W / 2);
    return [
      { cap: `${T(d.bot)} and ${T(d.top)}: the <b>same amount</b>, two names. The bars are the same length.`,
        run: async (c) => { await appear(c, r1, 300); await show(c, lb1); await appear(c, g2, 300); await show(c, lb2); await show(c, sm); await stampIn(c, stamp(stage, 'same length', { x: x0 + bw + 130, y: 50, size: 'sm' })); } },
      { cap: `Stack them as a fraction: the same amount over the same amount is <b>1</b>, just like ${T('\\dfrac{5}{5}=1')}.`, run: async (c) => { await pop(c, f1); } },
      { cap: 'Upside down it is <b>still 1</b>. So we may use whichever way up makes the unit we don’t want cancel.', run: async (c) => { await pop(c, f2); } },
      { cap: `Multiplying by 1 changes the <b>name</b>, not the amount. ${d.exCap}`, run: async (c) => { await pop(c, e); } }
    ];
  }
};

/* =============================== explainer: cancel (the star) =============================== */
const CAN = {
  notes: { label: `The notes: ${T('640\\text{ mL}\\to\\text{L}')}`, fr: [{ n: ['640', 'mL'], d: ['1', ''] }, { n: ['1', 'L'], d: ['1000', 'mL'] }], fact: ['1\\text{ L}=1000\\text{ mL}'], keep: 'L', calc: '\\dfrac{640}{1000}\\text{ L}=0.64\\text{ L}' },
  e8a: { label: `Example 8(a) check: ${T('9\\text{ km}\\to\\text{m}')}`, fr: [{ n: ['9', 'km'], d: ['1', ''] }, { n: ['1000', 'm'], d: ['1', 'km'] }], fact: ['1\\text{ km}=1000\\text{ m}'], keep: 'm', calc: '9\\times1000=9000\\text{ m}' },
  e8b: { label: `Ext: Example 8(b) check: ${T('3140\\text{ nm}\\to\\text{m}')}`, fr: [{ n: ['3140', 'nm'], d: ['1', ''] }, { n: ['1', 'm'], d: ['10^{9}', 'nm'] }], fact: ['1\\text{ m}=10^{9}\\text{ nm}'], keep: 'm', calc: '\\dfrac{3140}{10^{9}}=3.14\\times10^{-6}\\text{ m}' },
  e9b: { label: `Example 9(b) check: ${T('5.3\\text{ km}\\to\\text{mm}')}`, fr: [{ n: ['5.3', 'km'], d: ['1', ''] }, { n: ['1000', 'm'], d: ['1', 'km'] }, { n: ['1000', 'mm'], d: ['1', 'm'] }], fact: ['1\\text{ km}=1000\\text{ m}', '1\\text{ m}=1000\\text{ mm}'], keep: 'mm', calc: '5.3\\times1000\\times1000=5\\,300\\,000\\text{ mm}' },
  e9a: { label: `Ext: Example 9(a) check: ${T('0.42\\text{ Gm}\\to\\text{Mm}')}`, fr: [{ n: ['0.42', 'Gm'], d: ['1', ''] }, { n: ['10^{9}', 'm'], d: ['1', 'Gm'] }, { n: ['1', 'Mm'], d: ['10^{6}', 'm'] }], fact: ['1\\text{ Gm}=10^{9}\\text{ m}', '1\\text{ Mm}=10^{6}\\text{ m}'], keep: 'Mm', calc: '0.42\\times10^{3}=420\\text{ Mm}' },
  flip: { label: 'Upside down? 9 km → m', flip: true, fr: [{ n: ['9', 'km'], d: ['1', ''] }, { n: ['1000', 'm'], d: ['1', 'km'] }], keep: 'm', calc: '9\\times1000=9000\\text{ m}' }
};
const cancel = {
  title: 'Unit analysis: units cancel like fractions',
  height: 360,
  choices: Object.keys(CAN).map((k) => ({ v: k, label: CAN[k].label })),
  intro: 'Write the given over 1, then multiply by conversion fractions until only the unit you want is left. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = CAN[key], W = ex.W, n = d.fr.length;
    if (d.flip) return flipSteps(stage, ex, d);
    const R = fracRow(stage, d.fr, W / 2, 40), fr = R.fr;
    fr.slice(1).forEach(hide); R.ops.forEach(hide); hide(fr[0]);
    const res = hide(add(stage, h('div', 'u10l4a-line big', T('=' + d.calc)), 0, 210)); centerX(res, W / 2);
    const g = d.fr[0].n[1];
    const steps = [{ cap: `Write the given as a fraction over 1: ${T(`\\dfrac{${d.fr[0].n[0]}\\text{ ${g}}}{1}`)}. Its unit, <b>${g}</b>, is on <b>top</b>.`, run: async (c) => { await pop(c, fr[0]); } }];
    for (let i = 1; i < n; i++) {
      const u = d.fr[i].d[1], f = d.fr[i];
      steps.push({ cap: `We don’t want <b>${u}</b>. It is on top, so this conversion fraction puts <b>${u}</b> on the <b>bottom</b>: ${T(`\\dfrac{${f.n[0]}\\text{ ${f.n[1]}}}{${f.d[0]}\\text{ ${u}}}`)} (from ${T(d.fact[i - 1])}).`,
        run: async (c) => { await appear(c, R.ops[i - 1], 200); await pop(c, fr[i]); hl(fr[i - 1].nu, i > 1 ? 'hl2' : 'hl'); hl(fr[i].du, i > 1 ? 'hl2' : 'hl'); } });
      steps.push({ cap: `<b>${u}</b> on top and <b>${u}</b> on the bottom: they <b>cancel</b>, just like ${T('\\dfrac{5}{5}=1')}.`,
        run: async (c) => { await Promise.all([strike(c, fr[i - 1].nu, i > 1), strike(c, fr[i].du, i > 1)]); } });
    }
    steps.push({ cap: `Only <b>${d.keep}</b> is left, exactly the unit we want. Tops multiply, bottoms divide: ${T(d.calc)}.`,
      run: async (c) => { fr[n - 1].nu.classList.add('keep'); await pulse(c, fr[n - 1].nu, 1.2, 380); await pop(c, res, 420); await stampIn(c, stamp(stage, '✓', { x: W - 90, y: 230 })); } });
    return steps;
  }
};
function flipSteps(stage, ex, d) {
  const W = ex.W;
  const bad = fracRow(stage, [d.fr[0], { n: ['1', 'km'], d: ['1000', 'm'] }], W / 2, 30);
  const good = fracRow(stage, d.fr, W / 2, 30); hide(good.row);
  hide(bad.fr[1]); hide(bad.ops[0]); hide(bad.fr[0]);
  const ugly = hide(add(stage, h('div', 'u10l4a-line big', 'units: ' + T('\\dfrac{\\text{km}\\times\\text{km}}{\\text{m}}=\\dfrac{\\text{km}^2}{\\text{m}}') + ' ?!'), 0, 196)); centerX(ugly, W / 2);
  const res = hide(add(stage, h('div', 'u10l4a-line big', T('=' + d.calc)), 0, 210)); centerX(res, W / 2);
  let no = null;
  return [
    { cap: `Convert ${T('9\\text{ km}')} to m. Given over 1: <b>km</b> is on top.`, run: async (c) => { await pop(c, bad.fr[0]); } },
    { cap: `Try ${T('\\dfrac{1\\text{ km}}{1000\\text{ m}}')}. It equals 1 too, so is it allowed?`, run: async (c) => { await appear(c, bad.ops[0], 200); await pop(c, bad.fr[1]); hl(bad.fr[0].nu); hl(bad.fr[1].nu); } },
    { cap: 'Both <b>km</b> are on <b>top</b>: nothing cancels. The units come out as km² per m, which is not a length. Wrong way up!',
      run: async (c) => { await show(c, ugly); no = stamp(stage, '✗', { x: W - 90, y: 90, ok: false }); await stampIn(c, no); await shake(c, bad.fr[1]); } },
    { cap: `Flip it: ${T('\\dfrac{1000\\text{ m}}{1\\text{ km}}')}. Now km is on top <b>and</b> on the bottom.`,
      run: async (c) => {
        hide(ugly); if (no) no.remove(); await anim(c, bad.row, [{ opacity: 1, transform: 'rotateX(0deg)' }, { opacity: 0, transform: 'rotateX(90deg)' }], 300);
        bad.row.style.display = 'none'; good.fr[0].nu.classList.add('hl'); good.fr[1].du.classList.add('hl');
        await anim(c, good.row, [{ opacity: 0, transform: 'rotateX(90deg)' }, { opacity: 1, transform: 'rotateX(0deg)' }], 300);
      } },
    { cap: `km cancels and <b>m</b> is left: ${T(d.calc)}. If the units come out strange, a fraction is upside down.`,
      run: async (c) => { await Promise.all([strike(c, good.fr[0].nu), strike(c, good.fr[1].du)]); good.fr[1].nu.classList.add('keep'); await pop(c, res); await stampIn(c, stamp(stage, '✓', { x: W - 90, y: 230 })); } }
  ];
}

/* =============================== explainer: rate (two units at once) =============================== */
const RATE = {
  e10: { label: `Example 10 check: ${T('64\\text{ m/s}\\to\\text{km/min}')}` },
  flip: { label: 'Upside-down time factor' },
  one: { label: `Only one unit changes: ${T('110\\text{ km/h}\\to\\text{m/h}')}` }
};
const rate = {
  title: 'Converting a rate: two units change at once',
  height: 420,
  choices: Object.keys(RATE).map((k) => ({ v: k, label: RATE[k].label })),
  intro: 'A rate is already a fraction. Cancel each unit where it sits. Press <b>Next</b>.',
  make(stage, key, ex) {
    const W = ex.W;
    if (key === 'one') {
      const R = fracRow(stage, [{ n: ['110', 'km'], d: ['', 'h'] }, { n: ['1000', 'm'], d: ['1', 'km'] }], W / 2, 40);
      hide(R.fr[1]); hide(R.ops[0]);
      const res = hide(add(stage, h('div', 'u10l4a-line big', T('=110\\times1000=110\\,000\\ \\dfrac{\\text{m}}{\\text{h}}')), 0, 210)); centerX(res, W / 2);
      return [
        { cap: `${T('110\\text{ km/h}')}: km on top, h on the bottom. We want m/h, so only the <b>distance</b> changes; the hours are fine.`, run: async (c) => { hl(R.fr[0].nu); R.fr[0].du.classList.add('keep'); await pulse(c, R.fr[0], 1.12, 420); } },
        { cap: `km is on top, so ${T('\\dfrac{1000\\text{ m}}{1\\text{ km}}')} puts km on the bottom. km cancels.`, run: async (c) => { await appear(c, R.ops[0], 200); await pop(c, R.fr[1]); hl(R.fr[1].du); await Promise.all([strike(c, R.fr[0].nu), strike(c, R.fr[1].du)]); } },
        { cap: `Left: m on top, h on the bottom. ${T('110\\times1000=110\\,000')} m/h. One unit changing needs one conversion fraction.`, run: async (c) => { R.fr[1].nu.classList.add('keep'); await pop(c, res); } }
      ];
    }
    const good = [{ n: ['64', 'm'], d: ['', 's'] }, { n: ['1', 'km'], d: ['1000', 'm'] }, { n: ['60', 's'], d: ['1', 'min'] }];
    if (key === 'flip') {
      const R = fracRow(stage, [good[0], good[1], { n: ['1', 'min'], d: ['60', 's'] }], W / 2, 34), G = fracRow(stage, good, W / 2, 34);
      hide(G.row); hide(R.fr[1]); hide(R.fr[2]); R.ops.forEach(hide);
      const ugly = hide(add(stage, h('div', 'u10l4a-line big', 'units: ' + T('\\dfrac{\\text{km}\\times\\text{min}}{\\text{s}\\times\\text{s}}') + ' ?!'), 0, 200)); centerX(ugly, W / 2);
      const res = hide(add(stage, h('div', 'u10l4a-line big', T('=\\dfrac{64\\times60}{1000}=3.84\\ \\dfrac{\\text{km}}{\\text{min}}')), 0, 200)); centerX(res, W / 2);
      let no = null;
      return [
        { cap: `${T('64\\text{ m/s}')} with m cancelled the right way: ${T('\\dfrac{1\\text{ km}}{1000\\text{ m}}')}.`,
          run: async (c) => { await appear(c, R.ops[0], 200); await pop(c, R.fr[1]); await Promise.all([strike(c, R.fr[0].nu), strike(c, R.fr[1].du)]); } },
        { cap: `Now the time. Try ${T('\\dfrac{1\\text{ min}}{60\\text{ s}}')} (it equals 1). But s was already on the <b>bottom</b>…`,
          run: async (c) => { await appear(c, R.ops[1], 200); await pop(c, R.fr[2]); hl(R.fr[0].du, 'hl2'); hl(R.fr[2].du, 'hl2'); } },
        { cap: '…so now s is on the bottom <b>twice</b>. Nothing cancels, and the units are km·min per s². Wrong way up!',
          run: async (c) => { await show(c, ugly); no = stamp(stage, '✗', { x: W - 90, y: 90, ok: false }); await stampIn(c, no); } },
        { cap: `Flip it: ${T('\\dfrac{60\\text{ s}}{1\\text{ min}}')}. s on top cancels s on the bottom, leaving km/min: <b>3.84 km/min</b>.`,
          run: async (c) => {
            hide(ugly); if (no) no.remove(); R.row.style.display = 'none'; G.row.style.opacity = 1;
            await Promise.all([strike(c, G.fr[0].nu), strike(c, G.fr[1].du)]); await Promise.all([strike(c, G.fr[0].du, true), strike(c, G.fr[2].nu, true)]);
            G.fr[1].nu.classList.add('keep'); G.fr[2].du.classList.add('keep'); await pop(c, res);
          } }
      ];
    }
    const R = fracRow(stage, good, W / 2, 24);
    hide(R.fr[1]); hide(R.fr[2]); R.ops.forEach(hide);
    const res = hide(add(stage, h('div', 'u10l4a-line big', T('=\\dfrac{64\\times60}{1000}=\\dfrac{3840}{1000}=3.84\\ \\dfrac{\\text{km}}{\\text{min}}')), 0, 162)); centerX(res, W / 2);
    // the sense check: one minute of 64 m every second
    const tx0 = 60, tw = W - 340, ty = 300;
    const trk = svgEl('svg', { width: W, height: 110, style: `position:absolute;left:0;top:${ty - 40}px;overflow:visible` }, stage);
    svgEl('line', { x1: tx0, x2: tx0 + tw, y1: 40, y2: 40, stroke: '#cfc9bb', 'stroke-width': 10, 'stroke-linecap': 'round' }, trk);
    for (let i = 0; i <= 60; i++) svgEl('line', { x1: tx0 + tw * i / 60, x2: tx0 + tw * i / 60, y1: i % 10 ? 50 : 46, y2: i % 10 ? 58 : 66, stroke: INK, 'stroke-width': i % 10 ? 1 : 2 }, trk);
    for (let i = 0; i <= 60; i += 10) { const t = svgEl('text', { x: tx0 + tw * i / 60, y: 84, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#555' }, trk); t.textContent = i + ' s'; }
    const fill = svgEl('line', { x1: tx0, x2: tx0, y1: 40, y2: 40, stroke: KEEP, 'stroke-width': 10, 'stroke-linecap': 'round' }, trk);
    const runner = svgEl('circle', { cx: tx0, cy: 40, r: 11, fill: KEEP, stroke: '#fff', 'stroke-width': 3 }, trk);
    const ctr = add(stage, h('div', 'u10l4a-count', '0 m'), tx0 + tw + 20, ty - 22);
    hide(trk); hide(ctr);
    return [
      { cap: `${T('64\\text{ m/s}')} is a fraction: <b>m on top</b>, <b>s on the bottom</b>. We want km/min, so <b>both</b> change: we need ${T('1\\text{ km}=1000\\text{ m}')} and ${T('1\\text{ min}=60\\text{ s}')}.`,
        run: async (c) => { hl(R.fr[0].nu); hl(R.fr[0].du, 'hl2'); await pulse(c, R.fr[0], 1.12, 420); } },
      { cap: `m is on <b>top</b>, so its fraction puts m on the <b>bottom</b>: ${T('\\dfrac{1\\text{ km}}{1000\\text{ m}}')}. m cancels.`,
        run: async (c) => { await appear(c, R.ops[0], 200); await pop(c, R.fr[1]); hl(R.fr[1].du); await Promise.all([strike(c, R.fr[0].nu), strike(c, R.fr[1].du)]); } },
      { cap: `s is on the <b>bottom</b>, so its fraction puts s on <b>top</b>: ${T('\\dfrac{60\\text{ s}}{1\\text{ min}}')}. s cancels.`,
        run: async (c) => { await appear(c, R.ops[1], 200); await pop(c, R.fr[2]); hl(R.fr[2].nu, 'hl2'); await Promise.all([strike(c, R.fr[0].du, true), strike(c, R.fr[2].nu, true)]); } },
      { cap: `Left: <b>km</b> on top, <b>min</b> on the bottom. Tops multiply, bottoms divide: ${T('\\dfrac{64\\times60}{1000}=3.84')} km/min.`,
        run: async (c) => { R.fr[1].nu.classList.add('keep'); R.fr[2].du.classList.add('keep'); await pop(c, res, 420); } },
      { cap: `Sense check: in one minute (60 s) at 64 m each second, ${T('64\\times60=3840')} m ${T('=3.84')} km. ✓`,
        run: async (c) => {
          await appear(c, trk, 250); await appear(c, ctr, 200);
          await tween(c, 2000, (t) => { const s = Math.round(60 * t), x = tx0 + tw * t; fill.setAttribute('x2', x); runner.setAttribute('cx', x); ctr.textContent = (64 * s).toLocaleString('en-CA').replace(/,/g, ' ') + ' m'; }, (t) => t);
          ctr.textContent = '3 840 m = 3.84 km'; await stampIn(c, stamp(stage, '✓', { x: W - 70, y: 210 }));
        } }
    ];
  }
};

/* =============================== explainer: which (flowchart) =============================== */
const WHICH = {
  e2b: { label: `Example 2(b): ${T('58\\,400\\text{ mg}\\to\\text{kg}')}`, cat: 'n1', m: 'm1', caps: ['One metric prefix changes to another: mg to kg.', 'The <b>number line</b>: 6 steps left, move the point 6 places: <b>0.0584 kg</b>. (A proportion or unit analysis works too; this is quickest.)'] },
  e5: { label: 'Example 5: the whale photo', cat: 'n2', m: 'm2', caps: ['The question gives its own ratio: 1 cm on the photo stands for 2.4 m.', 'A <b>proportion</b>: ' + T('\\frac{1\\text{ cm}}{2.4\\text{ m}}=\\frac{2.5\\text{ cm}}{x}') + ', so <b>6 m</b>.'] },
  e7: { label: `Example 7: a ${T('1:250\\,000')} map`, cat: 'n2', m: 'm2', caps: ['A map scale is a ratio given by the question.', 'A <b>proportion</b> first (4 600 000 cm), then a prefix change at the end to get <b>46 km</b>.'] },
  e10: { label: `Example 10: ${T('64\\text{ m/s}\\to\\text{km/min}')}`, cat: 'n3', m: 'm3', caps: ['A rate: the distance unit <b>and</b> the time unit both change.', '<b>Unit analysis</b>: one fraction for each unit, cancel both, <b>3.84 km/min</b>. (The number line can only change one unit at a time.)'] }
};
const which = {
  title: 'Which method fits the question?',
  height: 360,
  choices: Object.keys(WHICH).map((k) => ({ v: k, label: WHICH[k].label })),
  intro: 'Ask what the question gives you, then pick the method. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = WHICH[k], W = ex.W, cx = [W * 0.18, W * 0.5, W * 0.82];
    const F = new Flowchart(stage, { x: 10, y: 6, width: W - 20, height: 340,
      nodes: {
        start: { x: (W - 20) / 2, y: 36, w: 360, h: 52, html: '<b>What does the question give you?</b>', cls: 'bk-round' },
        n1: { x: cx[0] - 10, y: 148, w: 270, h: 72, html: '<b>A prefix change</b>one metric unit to another' },
        n2: { x: cx[1] - 10, y: 148, w: 270, h: 72, html: '<b>A ratio in the question</b>scale, map, recipe, exchange rate' },
        n3: { x: cx[2] - 10, y: 148, w: 270, h: 72, html: '<b>A chain or a rate</b>two or more units change' },
        m1: { x: cx[0] - 10, y: 280, w: 270, h: 72, html: '<b>Number line</b>count steps, move the point', color: 'blue' },
        m2: { x: cx[1] - 10, y: 280, w: 270, h: 72, html: '<b>Proportion</b>matching units, cross-multiply', color: 'amber' },
        m3: { x: cx[2] - 10, y: 280, w: 270, h: 72, html: '<b>Unit analysis</b>fractions whose units cancel', color: 'green' }
      },
      edges: [{ from: 'start', to: 'n1', route: 'vhv' }, { from: 'start', to: 'n2' }, { from: 'start', to: 'n3', route: 'vhv' }, { from: 'n1', to: 'm1' }, { from: 'n2', to: 'm2' }, { from: 'n3', to: 'm3' }] });
    return [
      { cap: 'Start with the question itself: <b>what does it give you?</b>', run: (c) => F.visit(c, 'start') },
      { cap: d.caps[0], run: async (c) => { await F.go(c, 'start', d.cat); await F.visit(c, d.cat); } },
      { cap: d.caps[1], run: async (c) => { await F.go(c, d.cat, d.m); await F.visit(c, d.m); } }
    ];
  }
};

mountRoad();
mountStatics();
export const explainers = mountExplainers({ zoom, hop, sci, prop, ratio, map, one, cancel, rate, which });
export const _test = { HOP, SCI, PROP, CAN, ZOOM, Tape };
