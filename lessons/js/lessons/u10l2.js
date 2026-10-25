/* Math 10C · Unit 10 · Lesson 2 — Converting Units Within and Between SI and Imperial (old Lessons 4A + 4B merged).
 * Part 1 (SI review, the old 4A page): warm-up road scene (mile vs km bars to scale, "Convert 65 mph" with the miles
 * cancelling), the static metric number line (Section 1), and the explainers
 *   hop    (the metric number line: count steps while the decimal point hops one place per step; notes, Example 1 checks)
 *   map    (a 1:250 000 map: what 1 cm stands for; Example 2 checks)
 *   cancel (unit analysis with units cancelling like fractions; the notes, Example 3(a) check, an upside-down factor)
 *   rate   (two units change at once; Example 3(b) check, an upside-down time factor, a one-unit rate)
 * Colours: right / multiply blue, left / divide purple, the decimal point red, cancelled units red (and blue for a
 * second pair), the unit that is left green. Chips never use assignment questions. */
import {
  h, tex, add, box, NumberLine, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  svgEl, liveCtx, pulse, shake, anim, COLORS
} from '../blocks.js';
import { standup } from '../standup.js';

const T = (s) => tex(s);
/** a caption equation that may wrap before each = or \approx (the sidebar caption is narrow) */
const TQ = (s) => s.split(/(?==|\\approx)/).map((q) => T(q)).join(' ');
const RT = COLORS.blue, LT = COLORS.purple, PT = COLORS.red, KEEP = COLORS.green, INK = COLORS.ink, AMB = COLORS.amber, TEAL = COLORS.teal;
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u10l2-panel ' + cls, title ? `<div class="u10l2-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u10l2-line ' + cls, html); p.appendChild(d); return d; };
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
    labels: PF.filter((q) => q[0] !== '').map((q) => ({ v: q[1], html: `<span class="u10l2-nlab${q[2] ? ' x' : ''}">${q[0] === '\\mu' ? T('\\mu') : q[0]}</span>` }))
  });
  const px = N.toPx(0);
  svgEl('line', { x1: px, x2: px, y1: N.ay - 15, y2: N.ay + 15, stroke: INK, 'stroke-width': 3.5 }, N.layers.axis);
  N.unitLab = N.mark(0, `<span class="u10l2-unitlab">Unit${o.base ? ' (' + o.base + ')' : ''}</span>`, { lift: o.unitLift ?? 10 });
  return N;
}
/** a start or end pill under the line at prefix position v (stage coordinates) */
function linePill(stage, N, nx, v, html, cls, y, side) {
  const el = add(stage, h('div', 'u10l2-pill ' + cls, html), nx + N.toPx(v), y);
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
    this.el = add(host, box(h('div', 'u10l2-tape'), w + 170, 92), Math.round(o.cx - w / 2), o.y);
    this.dg = [...this.full].map((ch, i) => { const d = add(this.el, h('div', 'u10l2-dg', ch), i * s, 0); if (i < this.lp || i >= this.lp + D.length) d.style.opacity = 0; return d; });
    this.dot = add(this.el, h('div', 'u10l2-dot'), this.q * s, 50);
    this.unit = add(this.el, h('div', 'u10l2-tunit', o.unit || ''), w + 16, 18);
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
  const el = h('div', 'u10l2-fr');
  const part = (pp, cls) => {
    const d = h('div', cls); let u = null;
    if (pp[0] !== '') d.insertAdjacentHTML('beforeend', T(pp[0]));
    if (pp[1]) { if (pp[0] !== '') d.insertAdjacentHTML('beforeend', '&thinsp;'); u = h('span', 'u10l2-u', pp[1]); u.appendChild(h('span', 'u10l2-strike')); d.appendChild(u); }
    el.appendChild(d); return u;
  };
  el.nu = part(f.n, 'num'); el.du = part(f.d, 'den');
  return el;
}
/** a row of fractions joined by ×, centred at cx. Returns { row, fr: [fracEl…], ops: [×…] } with everything visible */
function fracRow(stage, list, cx, y) {
  const row = add(stage, h('div', 'u10l2-frow'), 0, y), fr = [], ops = [];
  list.forEach((f, i) => { if (i) ops.push(row.appendChild(h('div', 'u10l2-op', '×'))); fr.push(row.appendChild(fracEl(f))); });
  centerX(row, cx);
  return { row, fr, ops };
}
const strike = (c, u, blue) => { const s = u.querySelector('.u10l2-strike'); if (blue) s.classList.add('b'); u.classList.add('gone'); return anim(c, s, [{ transform: 'rotate(-18deg) scaleX(0)' }, { transform: 'rotate(-18deg) scaleX(1)' }], 380); };
const hl = (u, cls = 'hl') => u && u.classList.add(cls);

/* =============================== warm-up: crossing the border =============================== */
function mountRoad() {
  const host = document.getElementById('u10l2-road'); if (!host) return;
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
  const bar = h('div', 'u10l2-roadbtns'); host.appendChild(bar);
  const drive = h('button', 'pill', 'Drive across'); drive.type = 'button'; bar.appendChild(drive);
  const conv = h('button', 'pill', 'Convert 65 mph'); conv.type = 'button'; bar.appendChild(conv);
  const out = h('div', 'u10l2-roadout'); bar.appendChild(out);
  let x = 190, busy = false;
  drive.onclick = async () => {
    if (busy) return; busy = true; const c = liveCtx(), x0 = x, x1 = x0 < 500 ? 640 : 190;
    await tween(c, 1500, (t) => carAt(x0 + (x1 - x0) * t)); x = x1; busy = false;
  };
  conv.onclick = async () => {
    const c = liveCtx(); out.innerHTML = '';
    const row = h('div', 'u10l2-frow'); out.appendChild(row);
    const a = fracEl({ n: ['65', 'mi'], d: ['1', 'h'] }), b = fracEl({ n: ['1.6093', 'km'], d: ['1', 'mi'] });
    row.append(a, h('div', 'u10l2-op', '×'), b);
    const res = h('div', 'u10l2-res', T('\\approx104.6') + ' <b>km/h</b>'); row.appendChild(res); res.style.opacity = 0;
    hl(a.nu); hl(b.du); await sleep(c, 500);
    await Promise.all([strike(c, a.nu), strike(c, b.du)]); await fadeIn(c, res, 400);
  };
}

/* =============================== static: Section 2 number line =============================== */
function mountStatics() {
  const f = document.getElementById('u10l2-nlfig');
  if (f) prefixLine(f, { width: 940, height: 112, axisY: 52 });
}

/* =============================== explainer: hop (the star) =============================== */
const HOP = {
  notes: { label: `The notes: ${T('1\\text{ km}\\to\\text{mm}')}`, D: '1', p: 1, from: 'k', to: 'm', base: 'm' },
  kL: { label: `${T('1\\text{ kL}\\to\\text{L}')}`, D: '1', p: 1, from: 'k', to: '', base: 'L' },
  e1a: { label: `Example 1(a): ${T('4.6\\text{ m}\\to\\text{cm}')}`, D: '46', p: 1, from: '', to: 'c', base: 'm' },
  e1b: { label: `Example 1(b): ${T('58\\,400\\text{ mg}\\to\\text{kg}')}`, D: '58400', p: 5, from: 'm', to: 'k', base: 'g' },
  e1c: { label: `Example 1(c): ${T('36\\text{ mm}\\to\\text{m}')}`, D: '36', p: 2, from: 'm', to: '', base: 'm' }
};
const capU = (p, b) => (p === '\\mu' ? `\\ \\mu\\text{${b}}` : `\\text{ ${p}${b}}`);
const hop = {
  title: 'The metric number line: count the steps, hop the point',
  height: 400,
  choices: Object.keys(HOP).map((k) => ({ v: k, label: HOP[k].label })),
  intro: 'Find both units on the line, count the steps, and watch the point hop one place per step. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = HOP[key], W = ex.W, a = pos(d.from), b = pos(d.to), k = b - a, n = Math.abs(k), dir = Math.sign(k), right = k > 0;
    const val = d.p < d.D.length ? d.D.slice(0, d.p) + '.' + d.D.slice(d.p) : d.D;
    const nx = 20, N = prefixLine(stage, { x: nx, y: 4, width: W - 40, height: 168, axisY: 92, base: d.base, unitLift: 50 });
    const u0 = uTex(d.from, d.base), u1 = uTex(d.to, d.base), U0 = capU(d.from, d.base), U1 = capU(d.to, d.base);
    const pA = hide(linePill(stage, N, nx, a, 'from ' + T(u0), 'st', 140, right ? 'l' : 'r')), pB = hide(linePill(stage, N, nx, b, 'to ' + T(u1), 'en', 140, right ? 'r' : 'l'));
    if (a === b) pB.style.display = 'none';
    const tape = new Tape(stage, { D: d.D, p: d.p, k, cx: W / 2 + 40, y: 190, unit: T(u0) }); hide(tape.el);
    const cnt = hide(add(stage, h('div', 'u10l2-count ' + (right ? 'r' : 'l'), `${n} step${n > 1 ? 's' : ''} ${right ? 'right' : 'left'}: ${T(right ? '\\times10^{' + n + '}' : '\\div10^{' + n + '}')}`), 16, 204));
    const ans = tape.answer(), one = d.D === '1';
    const eqT = one ? `1${U0}=10^{${k}}${U1}=${nT(ans)}${U1}` : `${nT(val)}${U0}=${nT(ans)}${U1}`;
    const calcT = one ? '' : right ? `${nT(val)}\\times10^{${n}}=${nT(ans)}` : `${nT(val)}\\div10^{${n}}=${nT(ans)}`;
    const fin = hide(add(stage, h('div', 'u10l2-line big', T(eqT)), 0, 314)); centerX(fin, W / 2);
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
      { cap: `Re-write it: ${tidyNote}. ${calcT ? TQ(calcT) + ', so ' : ''}${TQ(eqT)}.`,
        run: async (c) => { if (!right) await tape.lead(c); await tape.tidy(c); await tape.setUnit(c, T(u1)); await pop(c, fin, 420); const s = stamp(stage, '✓', { x: W - 70, y: 336 }); await stampIn(c, s); } }
    ];
  }
};

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
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'cm', label: 'What 1 map cm stands for' }, { v: 'a', label: 'Example 2(a) check: towns' }, { v: 'b', label: 'Example 2(b) check: lakes' }],
  intro: 'The same unit on both sides of the ratio; convert to a convenient unit at the end. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, H = ex.def.height, mw = 430, mh = H - 30, M = drawMap(stage, 14, 14, mw, mh);
    const sc = add(stage, h('div', 'u10l2-scalebox', 'Scale ' + T('1:250\\,000')), 30, H - 60);
    const P = panel(stage, mw + 34, 14, W - mw - 48, H - 28, v === 'cm' ? 'What 1 cm stands for' : v === 'a' ? 'Towns: map → ground' : 'Lakes: ground → map');
    const L = (t, cls) => hide(line(P, T(t), cls));
    const dot = (cx, cy, color, lab, ry) => {
      const g = svgEl('g', {}, M);
      if (ry) svgEl('ellipse', { cx, cy, rx: 26, ry, fill: '#7fb2e5', stroke: '#4a86c5', 'stroke-width': 2 }, g);
      else svgEl('circle', { cx, cy, r: 9, fill: color, stroke: '#fff', 'stroke-width': 2.5 }, g);
      const t = add(stage, h('div', 'u10l2-maplab', lab), 14 + cx - 30, 14 + cy + (ry ? ry + 4 : 12)); return [g, t];
    };
    const seg = (x1, y1, x2, y2, color) => svgEl('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': 4, 'stroke-dasharray': '10 7', 'stroke-linecap': 'round' }, M);
    const segLab = (x, y, html, color) => { const e = add(stage, h('div', 'u10l2-pill', html), 14 + x, 14 + y); e.style.color = color; e.style.translate = '-50% -50%'; return e; };
    if (v === 'cm') {
      const bar = svgEl('g', {}, M); svgEl('line', { x1: 60, y1: 300, x2: 160, y2: 300, stroke: INK, 'stroke-width': 5 }, bar);
      for (const xx of [60, 160]) svgEl('line', { x1: xx, y1: 290, x2: xx, y2: 310, stroke: INK, 'stroke-width': 3 }, bar);
      const bl = segLab(110, 272, T('1\\text{ cm}'), INK); hide(bar); hide(bl);
      const l1 = L('1\\text{ cm}\\ \\to\\ 250\\,000\\text{ cm}', 'big'), l2 = L('250\\,000\\text{ cm}\\div100=2500\\text{ m}'), l3 = L('2500\\text{ m}\\div1000=2.5\\text{ km}'), l4 = L('1\\text{ cm on the map}=2.5\\text{ km}', 'big');
      const l5 = hide(line(P, `Quick check for Example 2(a): ${T('18.4\\times2.5=46')} km.`));
      return [
        { cap: `${T('1:250\\,000')} means <b>1 cm</b> on the map stands for <b>250 000 cm</b> on the ground. Same unit on both sides.`, run: async (c) => { await appear(c, bar, 300); await pop(c, bl); await show(c, l1); } },
        { cap: `That many centimetres is hard to picture. cm to m is <b>2 steps left</b> on the number line: ${T('\\div100')}, so 2500 m.`, run: async (c) => { await show(c, l2); } },
        { cap: `m to km is <b>3 steps left</b>: ${T('\\div1000')}. Every centimetre on this map is <b>2.5 km</b> on the ground.`, run: async (c) => { await show(c, l3); await pop(c, l4); } },
        { cap: `Handy for estimating: towns 18.4 cm apart are about ${T('18.4\\times2.5=46')} km apart. That matches Example 2(a).`, run: async (c) => { await show(c, l5); } }
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
      { cap: `${TQ('x=3\\,200\\,000\\div250\\,000=12.8')}: the lakes are <b>12.8 cm</b> apart on the map. (Check: ${T('12.8\\times2.5=32')} km.)`,
        run: async (c) => { await pop(c, l4); hide(lb); await pop(c, lb2); const s = stamp(P, '12.8 cm ✓'); s.style.alignSelf = 'center'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: cancel (the star) =============================== */
const CAN = {
  notes: { label: `The notes: ${T('640\\text{ mL}\\to\\text{L}')}`, fr: [{ n: ['640', 'mL'], d: ['1', ''] }, { n: ['1', 'L'], d: ['1000', 'mL'] }], fact: ['1\\text{ L}=1000\\text{ mL}'], keep: 'L', calc: '\\dfrac{640}{1000}\\text{ L}=0.64\\text{ L}' },
  e8a: { label: `${T('9\\text{ km}\\to\\text{m}')}`, fr: [{ n: ['9', 'km'], d: ['1', ''] }, { n: ['1000', 'm'], d: ['1', 'km'] }], fact: ['1\\text{ km}=1000\\text{ m}'], keep: 'm', calc: '9\\times1000=9000\\text{ m}' },
  e8b: { label: `Ext: ${T('3140\\text{ nm}\\to\\text{m}')}`, fr: [{ n: ['3140', 'nm'], d: ['1', ''] }, { n: ['1', 'm'], d: ['10^{9}', 'nm'] }], fact: ['1\\text{ m}=10^{9}\\text{ nm}'], keep: 'm', calc: '\\dfrac{3140}{10^{9}}=3.14\\times10^{-6}\\text{ m}' },
  e9b: { label: `Example 3(a) check: ${T('5.3\\text{ km}\\to\\text{mm}')}`, fr: [{ n: ['5.3', 'km'], d: ['1', ''] }, { n: ['1000', 'm'], d: ['1', 'km'] }, { n: ['1000', 'mm'], d: ['1', 'm'] }], fact: ['1\\text{ km}=1000\\text{ m}', '1\\text{ m}=1000\\text{ mm}'], keep: 'mm', calc: '5.3\\times1000\\times1000=5\\,300\\,000\\text{ mm}' },
  e9a: { label: `Ext: ${T('0.42\\text{ Gm}\\to\\text{Mm}')}`, fr: [{ n: ['0.42', 'Gm'], d: ['1', ''] }, { n: ['10^{9}', 'm'], d: ['1', 'Gm'] }, { n: ['1', 'Mm'], d: ['10^{6}', 'm'] }], fact: ['1\\text{ Gm}=10^{9}\\text{ m}', '1\\text{ Mm}=10^{6}\\text{ m}'], keep: 'Mm', calc: '0.42\\times10^{3}=420\\text{ Mm}' },
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
    const res = hide(add(stage, h('div', 'u10l2-line big', T('=' + d.calc)), 0, 210)); centerX(res, W / 2);
    const g = d.fr[0].n[1];
    const steps = [{ cap: `Write the given as a fraction over 1: ${T(`\\dfrac{${d.fr[0].n[0]}\\text{ ${g}}}{1}`)}. Its unit, <b>${g}</b>, is on <b>top</b>.`, run: async (c) => { await pop(c, fr[0]); } }];
    for (let i = 1; i < n; i++) {
      const u = d.fr[i].d[1], f = d.fr[i];
      steps.push({ cap: `We don’t want <b>${u}</b>. It is on top, so this conversion fraction puts <b>${u}</b> on the <b>bottom</b>: ${T(`\\dfrac{${f.n[0]}\\text{ ${f.n[1]}}}{${f.d[0]}\\text{ ${u}}}`)} (from ${T(d.fact[i - 1])}).`,
        run: async (c) => { await appear(c, R.ops[i - 1], 200); await pop(c, fr[i]); hl(fr[i - 1].nu, i > 1 ? 'hl2' : 'hl'); hl(fr[i].du, i > 1 ? 'hl2' : 'hl'); } });
      steps.push({ cap: `<b>${u}</b> on top and <b>${u}</b> on the bottom: they <b>cancel</b>, just like ${T('\\dfrac{5}{5}=1')}.`,
        run: async (c) => { await Promise.all([strike(c, fr[i - 1].nu, i > 1), strike(c, fr[i].du, i > 1)]); } });
    }
    steps.push({ cap: `Only <b>${d.keep}</b> is left, exactly the unit we want. Tops multiply, bottoms divide: ${TQ(d.calc)}.`,
      run: async (c) => { fr[n - 1].nu.classList.add('keep'); await pulse(c, fr[n - 1].nu, 1.2, 380); await pop(c, res, 420); await stampIn(c, stamp(stage, '✓', { x: W - 90, y: 230 })); } });
    return steps;
  }
};
function flipSteps(stage, ex, d) {
  const W = ex.W;
  const bad = fracRow(stage, [d.fr[0], { n: ['1', 'km'], d: ['1000', 'm'] }], W / 2, 30);
  const good = fracRow(stage, d.fr, W / 2, 30); hide(good.row);
  hide(bad.fr[1]); hide(bad.ops[0]); hide(bad.fr[0]);
  const ugly = hide(add(stage, h('div', 'u10l2-line big', 'units: ' + T('\\dfrac{\\text{km}\\times\\text{km}}{\\text{m}}=\\dfrac{\\text{km}^2}{\\text{m}}') + ' ?!'), 0, 196)); centerX(ugly, W / 2);
  const res = hide(add(stage, h('div', 'u10l2-line big', T('=' + d.calc)), 0, 210)); centerX(res, W / 2);
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
    { cap: `km cancels and <b>m</b> is left: ${TQ(d.calc)}. If the units come out strange, a fraction is upside down.`,
      run: async (c) => { await Promise.all([strike(c, good.fr[0].nu), strike(c, good.fr[1].du)]); good.fr[1].nu.classList.add('keep'); await pop(c, res); await stampIn(c, stamp(stage, '✓', { x: W - 90, y: 230 })); } }
  ];
}

/* =============================== explainer: rate (two units at once) =============================== */
const RATE = {
  e10: { label: `Example 3(b) check: ${T('64\\text{ m/s}\\to\\text{km/min}')}` },
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
      const res = hide(add(stage, h('div', 'u10l2-line big', T('=110\\times1000=110\\,000\\ \\dfrac{\\text{m}}{\\text{h}}')), 0, 210)); centerX(res, W / 2);
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
      const ugly = hide(add(stage, h('div', 'u10l2-line big', 'units: ' + T('\\dfrac{\\text{km}\\times\\text{min}}{\\text{s}\\times\\text{s}}') + ' ?!'), 0, 200)); centerX(ugly, W / 2);
      const res = hide(add(stage, h('div', 'u10l2-line big', T('=\\dfrac{64\\times60}{1000}=3.84\\ \\dfrac{\\text{km}}{\\text{min}}')), 0, 200)); centerX(res, W / 2);
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
    const res = hide(add(stage, h('div', 'u10l2-line big', T('=\\dfrac{64\\times60}{1000}=\\dfrac{3840}{1000}=3.84\\ \\dfrac{\\text{km}}{\\text{min}}')), 0, 162)); centerX(res, W / 2);
    // the sense check: one minute of 64 m every second
    const tx0 = 60, tw = W - 340, ty = 300;
    const trk = svgEl('svg', { width: W, height: 110, style: `position:absolute;left:0;top:${ty - 40}px;overflow:visible` }, stage);
    svgEl('line', { x1: tx0, x2: tx0 + tw, y1: 40, y2: 40, stroke: '#cfc9bb', 'stroke-width': 10, 'stroke-linecap': 'round' }, trk);
    for (let i = 0; i <= 60; i++) svgEl('line', { x1: tx0 + tw * i / 60, x2: tx0 + tw * i / 60, y1: i % 10 ? 50 : 46, y2: i % 10 ? 58 : 66, stroke: INK, 'stroke-width': i % 10 ? 1 : 2 }, trk);
    for (let i = 0; i <= 60; i += 10) { const t = svgEl('text', { x: tx0 + tw * i / 60, y: 84, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#555' }, trk); t.textContent = i + ' s'; }
    const fill = svgEl('line', { x1: tx0, x2: tx0, y1: 40, y2: 40, stroke: KEEP, 'stroke-width': 10, 'stroke-linecap': 'round' }, trk);
    const runner = svgEl('circle', { cx: tx0, cy: 40, r: 11, fill: KEEP, stroke: '#fff', 'stroke-width': 3 }, trk);
    const ctr = add(stage, h('div', 'u10l2-count', '0 m'), tx0 + tw + 20, ty - 22);
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

mountRoad();
mountStatics();
/* =============================== Part 2: imperial units and converting between systems (the old Lesson 4B) ===============================
 * The old 4B page's code, wrapped in a block so its helper names don't clash with Part 1's. Example numbers are the merged
 * lesson's (old 4B Examples 1-7 = Examples 4-10). Explainers: exact, bench, ladder, mixed, twoways, chain, estimate, heights,
 * roundup, and the Gimli Glider history animation. Classes u10l2b-. */
const B = (() => {
  const T = (s) => tex(s);
  /** a caption equation that may wrap before each = or \approx (the sidebar caption is narrow) */
  const TQ = (s) => s.split(/(?==|\\approx)/).map((q) => T(q)).join(' ');
  const IMP = COLORS.amber, SI = COLORS.blue, RED = COLORS.red, GRN = COLORS.green, INK = COLORS.ink;

  /* ---------------- number formatting ---------------- */
  const group = (s, sep) => { const [i, d] = s.split('.'); const neg = i.startsWith('-'); let a = neg ? i.slice(1) : i; if (a.length >= 5) a = a.replace(/\B(?=(\d{3})+(?!\d))/g, sep); return (neg ? '-' : '') + a + (d != null ? '.' + d : ''); };
  const str = (v, dp) => (dp == null ? String(parseFloat(v.toFixed(6))) : v.toFixed(dp));
  /** TeX number with thin spaces from five digits on, like the booklet (5280, 38\,016) */
  const tn = (v, dp) => group(str(v, dp), '\\,');
  /** HTML number with narrow no-break spaces */
  const hn = (v, dp) => group(str(v, dp), ' ');
  const U = (u) => `\\text{ ${u}}`;
  const q = (v, u, dp) => tn(v, dp) + U(u);

  /* ---------------- small layout helpers ---------------- */
  const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u10l2b-panel ' + cls, title ? `<div class="u10l2b-ph">${title}</div>` : ''), w, hh), x, y);
  const line = (p, html, cls = '') => { const d = h('div', 'u10l2b-line ' + cls, html); p.appendChild(d); return d; };
  const hide = (el) => { el.style.opacity = 0; return el; };
  const show = (c, el) => fadeIn(c, el, 320);
  const say = async (c, p, html, cls) => { const d = hide(line(p, html, cls)); await show(c, d); return d; };
  const sstamp = (host, text, ok = true, o = {}) => { const s = stamp(host, text, Object.assign({ ok }, o)); s.style.opacity = 0; return s; };

  /* ---------------- fraction cards for unit analysis ---------------- */
  /** a fraction card: top/bot = { n: TeX number, u: unit text } */
  function fracEl(top, bot, cls = '') {
    const f = h('div', 'u10l2b-fr ' + cls);
    const mk = (p, c) => {
      const r = h('div', c);
      r.num = h('span', 'u10l2b-n', T(p.n)); r.appendChild(r.num);
      r.unit = null;
      if (p.u) { r.unit = h('span', 'u10l2b-u', p.u); r.appendChild(r.unit); }
      return r;
    };
    f.top = mk(top, 'u10l2b-ft'); f.bot = mk(bot, 'u10l2b-fb'); f.append(f.top, f.bot);
    return f;
  }
  const op = (s) => h('div', 'u10l2b-op', T(s));
  /** snap a card onto the chain: it rises from the tray below and clicks into place */
  const snap = (c, el) => anim(c, el, [{ opacity: 0, transform: 'translateY(120px) scale(.9) rotate(-6deg)' }, { opacity: 1, transform: 'translateY(-10px) scale(1.05) rotate(1deg)', offset: 0.75 }, { opacity: 1, transform: 'none' }], 700);
  /** strike matching units: flash them, then a red slash through each */
  async function cancelU(c, ...us) {
    us.forEach((u) => u.classList.add('u10l2b-match'));
    await sleep(c, 350);
    const sl = us.map((u) => { const s = h('i', 'u10l2b-slash'); u.appendChild(s); u.classList.remove('u10l2b-match'); u.classList.add('u10l2b-gone'); return s; });
    await Promise.all(sl.map((s) => anim(c, s, [{ transform: 'rotate(-28deg) scaleX(0)' }, { transform: 'rotate(-28deg) scaleX(1)' }], 380)));
  }
  const keep = (...us) => us.forEach((u) => u && u.classList.add('u10l2b-keep'));

  /* ---------------- a tape measure: inches along the top edge, centimetres along the bottom ---------------- */
  class Tape {
    constructor(host, o) {
      this.o = o; this.W = o.width; this.pad = 46;
      const el = this.el = add(host, box(h('div', 'u10l2b-tape'), o.width, 176), o.x, o.y);
      const svg = this.svg = svgEl('svg', { width: o.width, height: 176, viewBox: `0 0 ${o.width} 176` }, el);
      this.html = h('div', 'u10l2b-tapehtml'); el.appendChild(this.html);
      const y0 = 36, y1 = 136; this.y0 = y0; this.y1 = y1;
      const L = this.pad, R = o.width - 14;
      this.ppi = (R - L) / o.maxIn; this.ppc = this.ppi / 2.54;
      svgEl('rect', { x: L - 8, y: y0, width: R - L + 16, height: y1 - y0, rx: 6, fill: '#f7d65a', stroke: '#b98f12', 'stroke-width': 1.6 }, svg);
      // inch ticks (top edge, pointing down)
      const sub = [8, 4, 2, 1].find((s) => this.ppi / s >= 5) || 1;
      const lab = [1, 2, 6, 12, 24].find((s) => s * this.ppi >= 34);
      for (let i = 0; i <= o.maxIn * sub + 1e-9; i++) {
        const v = i / sub, x = this.x(v);
        const len = i % sub === 0 ? (v % 12 === 0 && v > 0 ? 34 : 24) : (i % (sub / 2) === 0 ? 16 : i % (sub / 4) === 0 ? 11 : 7);
        svgEl('line', { x1: x, x2: x, y1: y0, y2: y0 + len, stroke: INK, 'stroke-width': i % sub === 0 ? 1.6 : 1 }, svg);
        if (i % sub === 0 && v % lab === 0 && v > 0) svgEl('text', { x: x - 3, y: y0 + 40, class: 'u10l2b-tnum', 'text-anchor': 'end' }, svg).textContent = v;
        if (i % sub === 0 && v % 12 === 0 && v > 0 && o.maxIn >= 24) { const t = svgEl('text', { x: x + 3, y: y0 + 22, class: 'u10l2b-tft' }, svg); t.textContent = v / 12 + ' ft'; }
      }
      // centimetre ticks (bottom edge, pointing up)
      const maxCm = o.maxIn * 2.54, mm = this.ppc / 10 >= 4.5, cmOk = this.ppc >= 4.5;
      const clab = [1, 2, 5, 10, 20, 50].find((s) => s * this.ppc >= 34);
      for (let i = 0; i <= Math.floor(maxCm * (mm ? 10 : 1)); i++) {
        const v = mm ? i / 10 : i; if (!mm && !cmOk && v % 5) continue;
        const x = this.cx(v), whole = Math.abs(v - Math.round(v)) < 1e-9;
        const len = whole ? (Math.round(v) % 10 === 0 ? 26 : Math.round(v) % 5 === 0 ? 18 : 13) : (i % 5 === 0 ? 9 : 6);
        svgEl('line', { x1: x, x2: x, y1: y1 - len, y2: y1, stroke: '#173a8a', 'stroke-width': whole ? 1.4 : 0.9 }, svg);
        if (whole && Math.round(v) % clab === 0 && v > 0) svgEl('text', { x: x - 3, y: y1 - 30, class: 'u10l2b-tnum u10l2b-tcm', 'text-anchor': 'end' }, svg).textContent = Math.round(v);
      }
      svgEl('text', { x: L - 14, y: y0 + 22, class: 'u10l2b-tunit', 'text-anchor': 'end' }, svg).textContent = 'in';
      svgEl('text', { x: L - 14, y: y1 - 8, class: 'u10l2b-tunit u10l2b-tcm', 'text-anchor': 'end' }, svg).textContent = 'cm';
      this.top = svgEl('g', {}, svg);
    }
    x(inches) { return this.pad + inches * this.ppi; }
    cx(cm) { return this.pad + cm * this.ppc; }
    /** slide a red hairline from 0 to `inches`, then pop the two readouts */
    async mark(c, inches, inHtml, cmHtml) {
      const g = svgEl('g', {}, this.top);
      const ln = svgEl('line', { y1: this.y0 - 8, y2: this.y1 + 8, stroke: RED, 'stroke-width': 3 }, g);
      const sh = svgEl('rect', { y: this.y0, height: this.y1 - this.y0, x: this.pad, fill: RED, 'fill-opacity': 0.12 }, g);
      const set = (v) => { const x = this.x(v); ln.setAttribute('x1', x); ln.setAttribute('x2', x); sh.setAttribute('width', Math.max(0, x - this.pad)); };
      set(0); await tween(c, 1300, (t) => set(inches * t));
      const xi = this.x(inches);
      const a = add(this.html, h('div', 'u10l2b-tread u10l2b-tri', inHtml), 0, 2), b = add(this.html, h('div', 'u10l2b-tread u10l2b-trc', cmHtml), 0, 144);
      for (const p of [a, b]) { p.style.left = Math.min(this.W - 190, Math.max(0, xi - 90)) + 'px'; p.style.width = '180px'; p.style.opacity = 0; }
      await pop(c, a); await pop(c, b);
      return g;
    }
  }

  /* =============================== warm-up: race them to scale =============================== */
  function mountRace() {
    const btn = document.getElementById('u10l2b-race'), host = document.getElementById('u10l2b-lanes');
    if (!btn || !host) return;
    const races = [{ n: 'A', name: 'The Mile', m: 1609.344, lab: '1 mi ≈ 1609 m', cls: 'u10l2b-ba' }, { n: 'B', name: 'The 1500 m', m: 1500, lab: '1500 m', cls: 'u10l2b-bb' }, { n: 'C', name: '5000 ft hill climb', m: 1524, lab: '5000 ft = 1524 m', cls: 'u10l2b-bc' }];
    const MAX = 1700;
    let on = false;
    const c = liveCtx();
    btn.addEventListener('click', async () => {
      if (on) { host.innerHTML = ''; on = false; btn.textContent = 'Race them to scale'; return; }
      on = true; btn.textContent = 'Hide the race';
      host.innerHTML = '';
      const axis = h('div', 'u10l2b-axis');
      for (let m = 0; m <= MAX; m += 100) { const t = h('div', 'u10l2b-axt' + (m % 500 ? '' : ' u10l2b-axt5'), m % 500 ? '' : hn(m) + ' m'); t.style.left = (m / MAX * 100) + '%'; axis.appendChild(t); }
      const bars = races.map((r) => {
        const ln = h('div', 'u10l2b-lane', `<div class="u10l2b-lname"><b>${r.n}</b> ${r.name}</div>`);
        const track = h('div', 'u10l2b-ltrack'), bar = h('div', 'u10l2b-bar ' + r.cls, `<span>${r.lab}</span>`);
        bar.style.width = (r.m / MAX * 100) + '%'; track.appendChild(bar); ln.appendChild(track); host.appendChild(ln);
        return bar;
      });
      const at = h('div', 'u10l2b-lane'); at.appendChild(h('div', 'u10l2b-lname', '')); const tr = h('div', 'u10l2b-ltrack u10l2b-axrow'); tr.appendChild(axis); at.appendChild(tr); host.appendChild(at);
      await Promise.all(bars.map((b, i) => c.anim(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 2400 * races[i].m / 1609, { easing: 'linear' })));
      if (on) { const w = h('div', 'u10l2b-win', 'The mile wins: about 85 m ahead of the 5000 ft climb and 109 m ahead of the 1500 m.'); host.appendChild(w); c.fadeIn(w); }
    });
  }

  /* =============================== explainer: use the exact factor =============================== */
  const EXA = {
    cm: { label: 'Example 7(b) numbers: 315 cm → in', v: 315, from: 'cm', to: 'in', dp: 4,
      ex: { fact: '1\\text{ in}=2.54\\text{ cm}', tag: 'exact', op: '\\div', k: 2.54, scr: '124.015748' },
      rd: { fact: '1\\text{ cm}\\approx0.3937\\text{ in}', tag: 'rounded', op: '\\times', k: 0.3937, scr: '124.0155' },
      rA: '124.0157', rB: '124.0155', why: 'to four decimal places', key: 'At the nearest inch both say 124, but a key written to four decimals says 124.0157.' },
    ft: { label: 'Example 10 numbers: 1650 m → ft', v: 1650, from: 'm', to: 'ft', dp: 2,
      ex: { fact: '1\\text{ ft}=0.3048\\text{ m}', tag: 'exact', op: '\\div', k: 0.3048, scr: '5413.385827' },
      rd: { fact: '1\\text{ m}\\approx3.2808\\text{ ft}', tag: 'rounded', op: '\\times', k: 3.2808, scr: '5413.32' },
      rA: '5413.39', rB: '5413.32', why: 'to two decimal places', key: 'Even the tenths differ: 5413.4 vs 5413.3. The key uses the exact factor.' }
  };
  function screen(p, digits, label) {
    const s = h('div', 'u10l2b-scr'); s.appendChild(h('div', 'u10l2b-scrl', label));
    const d = h('div', 'u10l2b-scrd'); [...digits].forEach((ch) => d.appendChild(h('i', 'u10l2b-dg', ch))); s.appendChild(d); s.digits = [...d.children];
    p.appendChild(s); return s;
  }
  const exact = {
    title: 'Use the exact factor',
    height: 440,
    minW: 860, // drawn this wide and scaled to fit beside the sidebar
    choices: Object.keys(EXA).map((k) => ({ v: k, label: EXA[k].label })),
    intro: 'Two facts in the table connect the same pair of units. Do they give the same answer? Press <b>Next</b>.',
    make(stage, k, ex) {
      const d = EXA[k], H = ex.def.height, PW = (ex.W - 54) / 2;
      const top = add(stage, box(h('div', 'u10l2b-qbar', `Convert <b>${hn(d.v)} ${d.from}</b> to <b>${d.to}</b>.`), ex.W - 36, 46), 18, 14);
      const A = panel(stage, 18, 74, PW, H - 92, `${T(d.ex.fact)} <span class="u10l2b-tag u10l2b-tagx">${d.ex.tag}</span>`, 'u10l2b-pA');
      const B = panel(stage, 36 + PW, 74, PW, H - 92, `${T(d.rd.fact)} <span class="u10l2b-tag">${d.rd.tag}</span>`, 'u10l2b-pB');
      hide(A); hide(B); top.style.opacity = 1;
      let sA, sB, wA, wB;
      return [
        { cap: `The table has <b>two</b> facts linking ${d.from} and ${d.to}: one is <b>exact</b> (true by definition), the other is <b>rounded</b> to four decimal places.`,
          run: async (c) => { await show(c, A); await show(c, B); } },
        { cap: `Exact fact: ${d.ex.op === '\\div' ? 'divide' : 'multiply'} by ${T(String(d.ex.k))}. ${T(`${tn(d.v)}${d.ex.op}${d.ex.k}`)} on the calculator:`,
          run: async (c) => { wA = await say(c, A, T(`${tn(d.v)}${d.ex.op}${d.ex.k}=`)); sA = screen(A, d.ex.scr, 'screen'); hide(sA); await show(c, sA); } },
        { cap: `Rounded fact: ${d.rd.op === '\\times' ? 'multiply' : 'divide'} by ${T(String(d.rd.k))}. ${T(`${tn(d.v)}${d.rd.op}${d.rd.k}`)}:`,
          run: async (c) => { wB = await say(c, B, T(`${tn(d.v)}${d.rd.op}${d.rd.k}=`)); sB = screen(B, d.rd.scr, 'screen'); hide(sB); await show(c, sB); } },
        { cap: 'Compare the screens digit by digit: <b>green</b> digits agree, <b>red</b> digits don’t. The rounded factor has already lost some accuracy.',
          run: async (c) => {
            const n = Math.max(sA.digits.length, sB.digits.length);
            for (let i = 0; i < n; i++) {
              const a = sA.digits[i], b = sB.digits[i], same = a && b && a.textContent === b.textContent;
              for (const e of [a, b]) if (e) { e.classList.add(same ? 'u10l2b-same' : 'u10l2b-diff'); }
            }
            await Promise.all([pulse(c, sA, 1.05), pulse(c, sB, 1.05)]);
          } },
        { cap: `Rounded ${d.why}: <b>${d.rA}</b> vs <b>${d.rB}</b>. ${d.key}`,
          run: async (c) => {
            await say(c, A, T(`\\approx ${tn(+d.rA, d.dp)}${U(d.to)}`), 'u10l2b-big');
            await say(c, B, T(`\\approx ${tn(+d.rB, d.dp)}${U(d.to)}`), 'u10l2b-big u10l2b-off');
          } },
        { cap: '<b>Use the exact factor when there is one</b> (divide by 2.54, 0.3048 or 0.9144), so your answer matches the key to the last digit.',
          run: async (c) => { const s1 = sstamp(A, 'matches the key', true); await stampIn(c, s1); const s2 = sstamp(B, 'off in the last place', false); await stampIn(c, s2); } }
      ];
    }
  };

  /* =============================== explainer: benchmarks side by side =============================== */
  const BEN = {
    in: { label: '1 in vs cm', imp: 'in', si: 'cm', L: 2.54, ref: 'imp', n: 1, ppu: 330, fact: '1\\text{ in}=2.54\\text{ cm}', bench: '1\\text{ in}\\approx2.5\\text{ cm}',
      c1: 'One <b>inch</b> (amber). Lay <b>centimetres</b> beside it (blue).', c2: 'Two whole centimetres and a bit more fit along one inch.',
      dir: 'The centimetre is the <b>smaller</b> unit, so the cm number is <b>bigger</b>: inches → cm, <b>multiply</b> by 2.54.' },
    ft: { label: '1 ft vs cm', imp: 'ft', si: 'cm', L: 30.48, ref: 'imp', n: 1, ppu: 29, fact: '1\\text{ ft}=30.48\\text{ cm}', bench: '1\\text{ ft}\\approx30\\text{ cm}',
      c1: 'One <b>foot</b>: about the length of a school ruler.', c2: 'Count the centimetres: 30 whole ones and a sliver more.',
      dir: 'A 30 cm ruler is <b>about a foot</b>. Feet → cm makes the number about <b>30 times bigger</b>.' },
    yd: { label: '1 m vs yd', imp: 'yd', si: 'm', L: 0.9144, ref: 'si', n: 1, ppu: 860, fact: '1\\text{ yd}=0.9144\\text{ m}', bench: '1\\text{ m}\\approx1.1\\text{ yd}',
      c1: 'One <b>metre</b> (blue) and one <b>yard</b> (amber). The yard is a little shorter.', c2: 'To match the metre, the yard needs about one-tenth more.',
      dir: 'A metre is a bit <b>longer</b> than a yard: about 1.1 yd. Metres → yards makes the number a little <b>bigger</b>.' },
    mi: { label: '1 mi vs km', imp: 'mi', si: 'km', L: 1.609344, ref: 'imp', n: 1, ppu: 330, fact: '1\\text{ mi}\\approx1.6093\\text{ km}', bench: '1\\text{ mi}\\approx1.6\\text{ km}',
      c1: 'One <b>mile</b>. Lay <b>kilometres</b> beside it.', c2: 'One whole kilometre and about six-tenths more.',
      dir: 'Kilometres are <b>shorter</b>, so there are more of them: miles → km, <b>multiply</b> by about 1.6.', five: true },
    kg: { label: '1 kg vs lb', kg: true }
  };
  function bars(stage, d, n, ppu, x0, yI, yS, o = {}) {
    // returns elements (not yet shown): imp segments, si blocks
    const imp = [], si = [];
    const impW = d.L * ppu; // one imperial unit, px
    const refLen = d.ref === 'imp' ? n * d.L : n; // in SI units
    const nImp = d.ref === 'imp' ? n : refLen / d.L, nSi = refLen;
    for (let i = 0; i < Math.ceil(nImp - 1e-9); i++) {
      const w = Math.min(1, nImp - i) * impW, part = nImp - i < 1 - 1e-9;
      const e = add(stage, box(h('div', 'u10l2b-bimp' + (part ? ' u10l2b-part' : ''), part ? T(tn(nImp - i, 4).replace(/0+$/, '')) : (w > 50 ? T('1' + U(d.imp)) : '')), w, 46), x0 + i * impW, yI);
      e.part = part; imp.push(hide(e));
    }
    for (let i = 0; i < Math.ceil(nSi - 1e-9); i++) {
      const w = Math.min(1, nSi - i) * ppu, part = nSi - i < 1 - 1e-9;
      const txt = part ? (w > 34 ? T(String(parseFloat((nSi - i).toFixed(4)))) : '') : (w > 44 ? T('1' + U(d.si)) : w > 15 && ((i + 1) % 5 === 0 || i === 0) ? `<small>${i + 1}</small>` : '');
      const e = add(stage, box(h('div', 'u10l2b-bsi' + (i % 2 ? ' u10l2b-alt' : '') + (part ? ' u10l2b-part' : ''), txt), w, 46), x0 + i * ppu, yS);
      e.part = part; si.push(hide(e));
    }
    return { imp, si };
  }
  function balance(stage, W, H) {
    const svg = add(stage, svgEl('svg', { width: 560, height: H - 20, viewBox: `0 0 560 ${H - 20}` }), 20, 10);
    const cx = 280, cy = 120, L = 190;
    svgEl('path', { d: `M${cx} ${cy} L${cx - 40} ${H - 60} L${cx + 40} ${H - 60} Z`, fill: '#d9d5c9', stroke: INK, 'stroke-width': 2 }, svg);
    svgEl('rect', { x: cx - 120, y: H - 62, width: 240, height: 14, rx: 4, fill: '#bdb7a6', stroke: INK, 'stroke-width': 1.5 }, svg);
    const beam = svgEl('g', {}, svg); beam.style.transformBox = 'view-box'; beam.style.transformOrigin = '0 0';
    svgEl('rect', { x: cx - L - 6, y: cy - 6, width: 2 * L + 12, height: 12, rx: 6, fill: '#6b5a3a' }, beam);
    svgEl('circle', { cx, cy, r: 9, fill: INK }, svg);
    const pan = (side) => {
      const g = svgEl('g', {}, svg); g.style.transformBox = 'view-box'; g.style.transformOrigin = '0 0';
      svgEl('path', { d: 'M0 0 L-60 120 M0 0 L60 120', stroke: '#777', 'stroke-width': 1.6 }, g);
      svgEl('path', { d: 'M-78 120 Q0 150 78 120 Z', fill: '#c9c3b2', stroke: INK, 'stroke-width': 1.8 }, g);
      g.load = svgEl('g', {}, g); g.side = side; return g;
    };
    const P = [pan(-1), pan(1)];
    const set = (deg) => {
      beam.setAttribute('transform', `rotate(${deg} ${cx} ${cy})`);
      const r = deg * Math.PI / 180;
      P.forEach((p) => p.setAttribute('transform', `translate(${cx + p.side * L * Math.cos(r)} ${cy + p.side * L * Math.sin(r)})`));
    };
    return { svg, P, set, deg: 0 };
  }
  function weight(g, x, w, hh, color, text, y = 122) {
    const e = svgEl('g', {}, g);
    svgEl('rect', { x: x - w / 2, y: y - hh, width: w, height: hh, rx: 4, fill: color, stroke: INK, 'stroke-width': 1.4 }, e);
    if (text) { const t = svgEl('text', { x, y: y - hh / 2 + 6, 'text-anchor': 'middle', class: 'u10l2b-wt' }, e); t.textContent = text; }
    e.style.opacity = 0; return e;
  }
  const bench = {
    title: 'Side by side: imperial units against SI benchmarks',
    height: 460,
    minW: 966, // drawn this wide and scaled to fit beside the sidebar
    choices: Object.keys(BEN).map((k) => ({ v: k, label: BEN[k].label })),
    intro: 'How big is each imperial unit compared with an SI unit you already know? Press <b>Next</b>.',
    make(stage, k, ex) {
      const d = BEN[k], H = ex.def.height;
      if (d.kg) {
        const B = balance(stage, ex.W, H); B.set(-18);
        const P = panel(stage, 600, 30, ex.W - 620, H - 60, 'Mass');
        const kgW = weight(B.P[0].load, 0, 62, 62, SI, '1 kg');
        const lb1 = weight(B.P[1].load, -44, 42, 38, IMP, '1 lb'), lb2 = weight(B.P[1].load, 2, 42, 38, IMP, '1 lb'), lb3 = weight(B.P[1].load, 38, 18, 18, IMP, '');
        const tip = (c, from, to) => tween(c, 700, (t) => { B.deg = from + (to - from) * t; B.set(B.deg); });
        B.set(0); kgW.style.opacity = 0;
        return [
          { cap: 'Put a <b>1 kg</b> mass on the left pan. The beam tips down on that side.',
            run: async (c) => { await appear(c, kgW); await tip(c, 0, -18); await say(c, P, `${T('1\\text{ kg}')} on the left`); } },
          { cap: 'Add <b>1 lb</b>, then another <b>1 lb</b> on the right. Still not balanced: two pounds is less than a kilogram.',
            run: async (c) => { await appear(c, lb1); await tip(c, -18, -12); await appear(c, lb2); await tip(c, -12, -3); await say(c, P, `${T('2\\text{ lb}')}: not enough`); } },
          { cap: 'Add <b>0.2 lb</b> more and the beam levels: <b>1 kg ≈ 2.2 lb</b>.',
            run: async (c) => { await appear(c, lb3); await tip(c, -3, 0); await say(c, P, T('1\\text{ kg}\\approx2.2\\text{ lb}'), 'u10l2b-big'); } },
          { cap: 'The kilogram is the <b>heavier</b> unit. kg → lb: <b>multiply</b> by 2.2 (the number gets bigger). lb → kg: <b>divide</b> by 2.2 (the number gets smaller).',
            run: async (c) => { await say(c, P, `kg → lb: ${T('\\times2.2')}`, 'u10l2b-imp'); await say(c, P, `lb → kg: ${T('\\div2.2')}`, 'u10l2b-si'); const s = sstamp(P, 'fewer kg than lb'); await stampIn(c, s); } }
        ];
      }
      const x0 = 60, yI = 96, yS = 168;
      let B = bars(stage, d, d.n, d.ppu, x0, yI, yS);
      const lab = (y, t, cls) => add(stage, h('div', 'u10l2b-rowlab ' + cls, t), 6, y + 10);
      const lI = hide(lab(yI, d.imp, 'u10l2b-imp')), lS = hide(lab(yS, d.si, 'u10l2b-si'));
      const P = panel(stage, 60, 250, ex.W - 120, H - 270, '');
      const refFirst = d.ref === 'imp' ? B.imp : B.si, other = d.ref === 'imp' ? B.si : B.imp;
      const steps = [
        { cap: d.c1, run: async (c) => {
          await appear(c, lI); await appear(c, lS);
          for (const e of refFirst) await anim(c, e, [{ opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left' }, { opacity: 1, transform: 'scaleX(1)', transformOrigin: 'left' }], 500);
          if (d.ref === 'si') for (const e of other.filter((e) => !e.part)) await anim(c, e, [{ opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left' }, { opacity: 1, transform: 'scaleX(1)', transformOrigin: 'left' }], 500);
        } },
        { cap: d.c2, run: async (c) => {
          const list = d.ref === 'si' ? other.filter((e) => e.part) : other;
          const ms = list.length > 10 ? 50 : 260;
          for (const e of list) await anim(c, e, [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], ms);
        } },
        { cap: `${T(d.fact)}${d.L === 1.609344 ? '' : ' <b>(exact)</b>'}. For mental math, the <b>benchmark</b> is ${T(d.bench)}.`,
          run: async (c) => { await say(c, P, `${T(d.fact)}${d.L === 1.609344 ? '' : ' <span class="u10l2b-tag u10l2b-tagx">exact</span>'}`, 'u10l2b-big'); await say(c, P, `Benchmark: ${T(d.bench)}`, 'u10l2b-bmk'); } },
        { cap: d.dir, run: async (c) => { await say(c, P, d.dir); } }
      ];
      if (d.five) steps.push({ cap: 'Scale it up: <b>5 mi ≈ 8 km</b> (more precisely, about 8.05 km). Worth memorizing.',
        run: async (c) => {
          [...B.imp, ...B.si].forEach((e) => e.remove());
          B = bars(stage, d, 5, 108, x0, yI, yS);
          for (const e of B.imp) await anim(c, e, [{ opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left' }, { opacity: 1, transform: 'scaleX(1)', transformOrigin: 'left' }], 260);
          for (const e of B.si) await anim(c, e, [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], 160);
          await say(c, P, T('5\\text{ mi}\\approx8\\text{ km}'), 'u10l2b-bmk');
        } });
      return steps;
    }
  };

  /* =============================== explainer: the imperial staircase =============================== */
  const STEPS = { mi: [30, 24], yd: [250, 112], ft: [470, 200], in: [690, 288] };
  const LAD = {
    down: { label: 'Down the stairs: 2 mi → in' },
    routes: { label: 'Two routes to a mile' },
    up: { label: 'Up the stairs: 7920 ft → mi' }
  };
  function staircase(stage, W) {
    const svg = add(stage, svgEl('svg', { width: W, height: 420, viewBox: `0 0 ${W} 420` }), 0, 0);
    const bw = 180, bh = 80, nodes = {};
    const defs = svgEl('defs', {}, svg);
    for (const [id, col] of [['u10l2b-ah', IMP], ['u10l2b-ahp', COLORS.purple]]) {
      const m = svgEl('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs);
      svgEl('path', { d: 'M0 0 L10 5 L0 10 z', fill: col }, m);
    }
    const pts = ['mi', 'yd', 'ft', 'in'].map((u) => STEPS[u]);
    let d = `M${pts[0][0] - 10} ${pts[0][1] + bh + 6}`;
    pts.forEach((p, i) => { d += ` H${i < 3 ? pts[i + 1][0] - 10 : p[0] + bw + 10}`; if (i < 3) d += ` V${pts[i + 1][1] + bh + 6}`; });
    svgEl('path', { d, fill: 'none', stroke: '#d6d0bf', 'stroke-width': 6, 'stroke-linejoin': 'round' }, svg);
    const names = { mi: 'mile', yd: 'yard', ft: 'foot', in: 'inch' };
    for (const u in STEPS) {
      const [x, y] = STEPS[u], n = add(stage, box(h('div', 'u10l2b-step', `<div class="u10l2b-stepn"><b>${u}</b> <small>${names[u]}</small></div>`), bw, bh), x, y);
      n.val = h('div', 'u10l2b-stepv'); n.appendChild(n.val); nodes[u] = n;
    }
    const arrows = {};
    [['mi', 'yd', '1760'], ['yd', 'ft', '3'], ['ft', 'in', '12']].forEach(([a, b, k]) => {
      const [x1, y1] = STEPS[a], [x2, y2] = STEPS[b];
      arrows[a + b] = svgEl('path', { d: `M${x1 + bw + 6} ${y1 + bh / 2} C${x2 + 40} ${y1 + bh / 2} ${x2 + bw / 2} ${y1 + bh / 2} ${x2 + bw / 2} ${y2 - 6}`, fill: 'none', stroke: IMP, 'stroke-width': 3, 'marker-end': 'url(#u10l2b-ah)' }, svg);
      add(stage, h('div', 'u10l2b-mult', T(`\\times${k}`) + ' <small>/ ' + T(`\\div${k}`) + '</small>'), x2 + bw / 2 + 12, y2 - 40);
    });
    const sc = svgEl('path', { d: `M${STEPS.mi[0] + 90} ${STEPS.mi[1] + bh + 6} C110 330 330 240 ${STEPS.ft[0] - 8} ${STEPS.ft[1] + bh / 2}`, fill: 'none', stroke: COLORS.purple, 'stroke-width': 3, 'stroke-dasharray': '9 6', 'marker-end': 'url(#u10l2b-ahp)' }, svg);
    add(stage, h('div', 'u10l2b-mult u10l2b-multp', T('\\times5280') + ' <small>/ ' + T('\\div5280') + '</small>'), 14, 236);
    add(stage, h('div', 'u10l2b-dirtag', '<b>down</b> (smaller unit): multiply · <b>up</b> (bigger unit): divide'), 30, 384);
    return { nodes, arrows, sc, bw, bh };
  }
  /** light a path, then show the value in the step box it reaches */
  async function reach(c, S, path, u, html, from) {
    if (from) S.nodes[from].classList.replace('u10l2b-on', 'u10l2b-was');
    if (path) await anim(c, path, [{ strokeWidth: 3 }, { strokeWidth: 9 }, { strokeWidth: 4 }], 650);
    const n = S.nodes[u]; n.classList.remove('u10l2b-was'); n.classList.add('u10l2b-on'); n.val.innerHTML = html; await pop(c, n.val);
  }
  const ladder = {
    title: 'The imperial staircase: four multipliers',
    height: 446,
    minW: 940, // drawn this wide and scaled to fit beside the sidebar
    choices: Object.keys(LAD).map((k) => ({ v: k, label: LAD[k].label })),
    intro: 'Each step down the staircase is a smaller unit, with its own multiplier. Press <b>Next</b>.',
    make(stage, k, ex) {
      const S = staircase(stage, ex.W), A = S.arrows;
      const P = panel(stage, ex.W - 290, 16, 282, 190, 'Work', 'u10l2b-pnar');
      if (k === 'down') return [
        { cap: 'Going <b>down</b> the stairs (to a smaller unit) means <b>multiply</b>: more of the smaller units fit.',
          run: async (c) => { await reach(c, S, null, 'mi', T(q(2, 'mi'))); await say(c, P, T('2\\text{ mi}\\to\\ ?\\text{ in}')); } },
        { cap: `Fact: 1 mi = 5280 ft. Take the shortcut: ${T('2\\times5280=10\\,560')} ft.`,
          run: async (c) => { await reach(c, S, S.sc, 'ft', T(q(10560, 'ft')), 'mi'); await say(c, P, T('2\\times5280=10\\,560\\text{ ft}')); } },
        { cap: `Fact: 1 ft = 12 in. ${T('10\\,560\\times12=126\\,720')} in.`,
          run: async (c) => { await reach(c, S, A.ftin, 'in', T(q(126720, 'in')), 'ft'); await say(c, P, T('10\\,560\\times12=126\\,720\\text{ in}'), 'u10l2b-big'); } },
        { cap: 'Two steps, two facts, both <b>written down</b>. A mile is a long way in inches!',
          run: async (c) => { const s = sstamp(stage, '2 mi = 126 720 in', true, { x: ex.W - 160, y: 408 }); await stampIn(c, s); } }
      ];
      if (k === 'routes') return [
        { cap: 'Start with <b>1 mile</b> at the top of the stairs.', run: async (c) => { await reach(c, S, null, 'mi', T(q(1, 'mi'))); } },
        { cap: 'Step down to yards: 1 mi = 1760 yd.', run: async (c) => { await reach(c, S, A.miyd, 'yd', T(q(1760, 'yd')), 'mi'); await say(c, P, T('1\\times1760=1760\\text{ yd}')); } },
        { cap: `Step down to feet: ${T('1760\\times3=5280')} ft.`, run: async (c) => { await reach(c, S, A.ydft, 'ft', T(q(5280, 'ft')), 'yd'); await say(c, P, T('1760\\times3=5280\\text{ ft}')); } },
        { cap: 'The shortcut says the same: <b>1 mi = 5280 ft</b>. The facts agree, so use whichever route is shorter.',
          run: async (c) => { await anim(c, S.sc, [{ strokeWidth: 3 }, { strokeWidth: 9 }, { strokeWidth: 4 }], 900); await say(c, P, T('1\\text{ mi}=1760\\text{ yd}=5280\\text{ ft}')); } }
      ];
      return [
        { cap: 'Going <b>up</b> the stairs (to a bigger unit) means <b>divide</b>: fewer of the bigger units fit.',
          run: async (c) => { await reach(c, S, null, 'ft', T(q(7920, 'ft'))); await say(c, P, T('7920\\text{ ft}\\to\\ ?\\text{ mi}')); } },
        { cap: `Shortcut up: ${T('7920\\div5280=1.5')} mi.`,
          run: async (c) => { await reach(c, S, S.sc, 'mi', T(q(1.5, 'mi')), 'ft'); await say(c, P, T('7920\\div5280=1.5\\text{ mi}'), 'u10l2b-big'); } },
        { cap: `Check by the other route: ${T('7920\\div3=2640')} yd, then ${T('2640\\div1760=1.5')} mi ✓`,
          run: async (c) => {
            await reach(c, S, A.ydft, 'yd', T(q(2640, 'yd')), 'mi'); await say(c, P, T('7920\\div3=2640\\text{ yd}'));
            await reach(c, S, A.miyd, 'mi', T(q(1.5, 'mi') + '\\ \\checkmark'), 'yd'); await say(c, P, T('2640\\div1760=1.5\\text{ mi}'));
          } },
        { cap: '<b>Direction check:</b> a bigger unit gives a smaller number (7920 → 1.5) ✓',
          run: async (c) => { const s = sstamp(stage, '7920 ft = 1.5 mi', true, { x: ex.W - 160, y: 408 }); await stampIn(c, s); } }
      ];
    }
  };

  /* =============================== explainer: mixed measures, unpack and pack =============================== */
  const MIX = {
    a: { label: 'Example 4(a)', pack: false, big: 'ft', small: 'in', k: 12, qq: 8, r: 5 },
    b: { label: '(b)', pack: false, big: 'yd', small: 'ft', k: 3, qq: 6, r: 1 },
    c: { label: '(c)', pack: false, big: 'mi', small: 'yd', k: 1760, qq: 2, r: 410 },
    d: { label: '(d)', pack: true, big: 'ft', small: 'in', k: 12, total: 68 },
    e: { label: '(e)', pack: true, big: 'yd', small: 'ft', k: 3, total: 97 },
    f: { label: '(f)', pack: true, big: 'mi', small: 'yd', k: 1760, total: 5555 }
  };
  for (const v of Object.values(MIX)) { if (v.pack) { v.qq = Math.floor(v.total / v.k); v.r = v.total - v.qq * v.k; } else v.total = v.qq * v.k + v.r; }
  const mixed = {
    title: 'Mixed measures: unpack and pack',
    height: 470,
    choices: [{ sep: 'Example 4 check:' }, ...Object.keys(MIX).map((k) => ({ v: k, label: MIX[k].label }))],
    intro: 'A mixed measure is whole big units plus some small ones. Press <b>Next</b>.',
    make(stage, key, ex) {
      const d = MIX[key], x0 = 40, wid = ex.W - 80, sc = wid / d.total, bw = d.k * sc, y = 120;
      const head = add(stage, box(h('div', 'u10l2b-qbar', d.pack ? `Convert <b>${hn(d.total)} ${d.small}</b> to ${d.big} and ${d.small}.` : `Convert <b>${d.qq} ${d.big} ${hn(d.r)} ${d.small}</b> to ${d.small}.`), ex.W - 36, 46), 18, 14);
      head.style.opacity = 1;
      const P = panel(stage, 40, 292, ex.W - 80, 166, 'Work'), stX = ex.W - 80 - 150;
      const blocks = [], labs = [];
      for (let i = 0; i < d.qq; i++) {
        const b = hide(add(stage, box(h('div', 'u10l2b-blk' + (i % 2 ? ' u10l2b-alt' : ''), bw > 46 ? T('1' + U(d.big)) : bw > 18 ? `<small>${i + 1}</small>` : ''), bw, 56), x0 + i * bw, y));
        blocks.push(b);
      }
      const rest = hide(add(stage, box(h('div', 'u10l2b-blk u10l2b-rest', d.r * sc > 50 ? T(hn(d.r) + U(d.small)) : ''), d.r * sc, 56), x0 + d.qq * bw, y));
      const brace = (from, to, html, below = true) => { to = Math.min(to, ex.W - 8); const e = hide(add(stage, box(h('div', 'u10l2b-brace' + (below ? '' : ' u10l2b-brup'), html), to - from, 22), from, below ? y + 62 : y - 28)); return e; };
      if (!d.pack) {
        return [
          { cap: `${d.qq} ${d.big} ${hn(d.r)} ${d.small} is <b>${d.qq} whole ${d.big === 'ft' ? 'feet' : d.big === 'yd' ? 'yards' : 'miles'}</b> plus <b>${hn(d.r)} extra ${d.small === 'in' ? 'inches' : d.small === 'ft' ? (d.r === 1 ? 'foot' : 'feet') : 'yards'}</b>.`,
            run: async (c) => {
              for (const b of blocks) await anim(c, b, [{ opacity: 0, transform: 'translateY(-16px)' }, { opacity: 1, transform: 'none' }], 220);
              await anim(c, rest, [{ opacity: 0, transform: 'translateY(-16px)' }, { opacity: 1, transform: 'none' }], 300);
              if (d.r * sc <= 50) { const l = brace(x0 + d.qq * bw - 30, x0 + d.qq * bw + d.r * sc + 30, T(hn(d.r) + U(d.small)), false); await appear(c, l); }
            } },
          { cap: `Write the fact: 1 ${d.big} = ${hn(d.k)} ${d.small}. Each block is ${hn(d.k)} ${d.small}, so ${T(`${d.qq}\\times${tn(d.k)}=${tn(d.qq * d.k)}`)} ${d.small}.`,
            run: async (c) => {
              await say(c, P, `Fact: ${T(`1${U(d.big)}=${tn(d.k)}${U(d.small)}`)}`);
              if (bw > 46) for (const b of blocks) { b.innerHTML = T(tn(d.k) + U(d.small)); await pulse(c, b, 1.06, 200); }
              const br = brace(x0, x0 + d.qq * bw, T(`${d.qq}\\times${tn(d.k)}=${tn(d.qq * d.k)}`)); await appear(c, br);
              await say(c, P, T(`${d.qq}\\times${tn(d.k)}=${tn(d.qq * d.k)}${U(d.small)}`));
            } },
          { cap: `Add the extra ${hn(d.r)} ${d.small}: ${T(`${tn(d.qq * d.k)}+${tn(d.r)}=${tn(d.total)}`)} ${d.small}.`,
            run: async (c) => {
              const br = hide(add(stage, box(h('div', 'u10l2b-brace u10l2b-brall', T(`${tn(d.total)}${U(d.small)}`)), d.qq * bw + d.r * sc, 22), x0, y + 112)); await appear(c, br);
              await say(c, P, T(`${tn(d.qq * d.k)}+${tn(d.r)}=${tn(d.total)}${U(d.small)}`), 'u10l2b-big');
              const s = sstamp(P, `${hn(d.total)} ${d.small}`, true, { x: stX, y: 92 }); await stampIn(c, s);
            } }
        ];
      }
      // pack: one long bar, cut into big units
      const long = hide(add(stage, box(h('div', 'u10l2b-long', T(tn(d.total) + U(d.small))), wid, 56), x0, y));
      const tsvg = add(stage, svgEl('svg', { width: wid, height: 56, viewBox: `0 0 ${wid} 56` }), x0, y);
      if (sc >= 4) for (let i = 1; i < d.total; i++) svgEl('line', { x1: i * sc, x2: i * sc, y1: 0, y2: 10, stroke: INK, 'stroke-width': 1 }, tsvg);
      tsvg.style.opacity = 0;
      [...blocks, rest].forEach((b) => stage.appendChild(b));
      return [
        { cap: `${hn(d.total)} ${d.small} in one long piece. How many whole ${d.big === 'ft' ? 'feet' : d.big === 'yd' ? 'yards' : 'miles'} are in it?`,
          run: async (c) => { await anim(c, long, [{ opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left' }, { opacity: 1, transform: 'scaleX(1)', transformOrigin: 'left' }], 700); await appear(c, tsvg); } },
        { cap: `Fact: 1 ${d.big} = ${hn(d.k)} ${d.small}. Cut off ${hn(d.k)} ${d.small} at a time: <b>${d.qq}</b> whole ${d.big === 'ft' ? 'feet' : d.big === 'yd' ? 'yards' : 'miles'} fit.`,
          run: async (c) => {
            long.innerHTML = ''; long.classList.add('u10l2b-longc');
            const ms = d.qq > 10 ? 45 : 260;
            for (const b of blocks) await anim(c, b, [{ opacity: 0, transform: 'scaleY(.2)' }, { opacity: 1, transform: 'none' }], ms);
            await say(c, P, `Fact: ${T(`1${U(d.big)}=${tn(d.k)}${U(d.small)}`)}`);
          } },
        { cap: `That is a division with a remainder: ${T(`${tn(d.total)}\\div${tn(d.k)}=${d.qq}`)} remainder <b>${hn(d.r)}</b> (${T(`${d.qq}\\times${tn(d.k)}=${tn(d.qq * d.k)}`)}, and ${T(`${tn(d.total)}-${tn(d.qq * d.k)}=${tn(d.r)}`)}).`,
          run: async (c) => {
            await anim(c, rest, [{ opacity: 0 }, { opacity: 1 }], 300); await pulse(c, rest, 1.1);
            const br = brace(x0, x0 + d.qq * bw, T(`${d.qq}${U(d.big)}`)); await appear(c, br);
            const br2 = brace(x0 + d.qq * bw - (d.r * sc < 70 ? 40 : 0), x0 + d.qq * bw + d.r * sc + (d.r * sc < 70 ? 40 : 0), T(`${tn(d.r)}${U(d.small)}`), false); br2.classList.add('u10l2b-brrest'); await appear(c, br2);
            await say(c, P, T(`${tn(d.total)}\\div${tn(d.k)}=${d.qq}\\ \\text{remainder}\\ ${tn(d.r)}`));
            await say(c, P, `Calculator: ${T(`${tn(d.total)}\\div${tn(d.k)}=${tn(d.total / d.k, 4)}\\ldots`)}, so ${d.qq} whole; ${T(`${tn(d.total)}-${d.qq}\\times${tn(d.k)}=${tn(d.r)}`)}`, 'u10l2b-sm');
          } },
        { cap: `So ${hn(d.total)} ${d.small} = <b>${d.qq} ${d.big} ${hn(d.r)} ${d.small}</b>. The remainder is always smaller than ${hn(d.k)}.`,
          run: async (c) => { await say(c, P, T(`${tn(d.total)}${U(d.small)}=${d.qq}${U(d.big)}\\ ${tn(d.r)}${U(d.small)}`), 'u10l2b-big'); const s = sstamp(P, `${d.qq} ${d.big} ${hn(d.r)} ${d.small}`, true, { x: stX, y: 60 }); await stampIn(c, s); } }
      ];
    }
  };

  /* =============================== explainer: one chain, two methods =============================== */
  const TWO = {
    yd: { label: '2.5 yd → in', v: 2.5, u: ['yd', 'ft', 'in'], k: [3, 12] },
    ex2: { label: 'Example 5 check: 0.6 mi → in', v: 0.6, u: ['mi', 'ft', 'in'], k: [5280, 12] }
  };
  for (const d of Object.values(TWO)) { d.m1 = d.v * d.k[0]; d.m2 = d.m1 * d.k[1]; }
  const twoways = {
    title: 'One chain, two methods',
    height: 500,
    minW: 800, // drawn this wide and scaled to fit beside the sidebar
    choices: Object.keys(TWO).map((k) => ({ v: k, label: TWO[k].label })),
    intro: 'Two facts are needed, so the conversion is a chain. Do it both ways. Press <b>Next</b>.',
    make(stage, k, ex) {
      const d = TWO[k], H = ex.def.height, PW = (ex.W - 54) * 0.415, PR = ex.W - 54 - PW, [u0, u1, u2] = d.u;
      const route = add(stage, h('div', 'u10l2b-route', `<span class="u10l2b-ru">${tn(d.v)} ${u0}</span><span class="u10l2b-ra">${T('\\times' + tn(d.k[0]))}</span><span class="u10l2b-ru">${u1}</span><span class="u10l2b-ra">${T('\\times' + tn(d.k[1]))}</span><span class="u10l2b-ru">${u2}</span>`), 18, 12);
      route.style.opacity = 0;
      const L = panel(stage, 18, 70, PW, H - 86, 'Proportional reasoning', 'u10l2b-pbig'), R = panel(stage, 36 + PW, 70, PR, H - 86, 'Unit analysis', 'u10l2b-pbig');
      const row = h('div', 'u10l2b-chain u10l2b-chsm'); R.appendChild(row);
      const f0 = fracEl({ n: tn(d.v), u: u0 }, { n: '1' }), f1 = fracEl({ n: tn(d.k[0]), u: u1 }, { n: '1', u: u0 }), f2 = fracEl({ n: tn(d.k[1]), u: u2 }, { n: '1', u: u1 });
      const o1 = op('\\times'), o2 = op('\\times');
      [f0, o1, f1, o2, f2].forEach((e) => { row.appendChild(e); hide(e); });
      let sL;
      return [
        { cap: `Route: ${u0} → ${u1} → ${u2}. Two facts: 1 ${u0} = ${hn(d.k[0])} ${u1}, and 1 ${u1} = ${hn(d.k[1])} ${u2}.`,
          run: async (c) => { await show(c, route); } },
        { cap: `<b>Proportion 1</b> (${u0} to ${u1}): the fact on one side, the question on the other. ${T(`x=${tn(d.v)}\\times${tn(d.k[0])}=${tn(d.m1)}`)} ${u1}.`,
          run: async (c) => {
            await say(c, L, T(`\\dfrac{1${U(u0)}}{${tn(d.k[0])}${U(u1)}}=\\dfrac{${tn(d.v)}${U(u0)}}{x}`), 'u10l2b-frl');
            await say(c, L, T(`x=${tn(d.v)}\\times${tn(d.k[0])}=${tn(d.m1)}${U(u1)}`));
          } },
        { cap: `<b>Proportion 2</b> (${u1} to ${u2}) uses the answer from proportion 1: ${T(`y=${tn(d.m1)}\\times${tn(d.k[1])}=${tn(d.m2)}`)} ${u2}.`,
          run: async (c) => {
            await say(c, L, T(`\\dfrac{1${U(u1)}}{${tn(d.k[1])}${U(u2)}}=\\dfrac{${tn(d.m1)}${U(u1)}}{y}`), 'u10l2b-frl');
            sL = await say(c, L, T(`y=${tn(d.m2)}${U(u2)}`), 'u10l2b-big');
          } },
        { cap: `<b>Unit analysis:</b> start with ${hn(d.v)} ${u0} over 1, then snap on both factors, each with the unit to get rid of on the <b>bottom</b>.`,
          run: async (c) => { await show(c, f0); for (const e of [o1, f1, o2, f2]) { if (e.classList.contains('u10l2b-op')) await appear(c, e); else await snap(c, e); } } },
        { cap: `${u0} cancels, then ${u1} cancels. Only <b>${u2}</b> is left: the unit we want.`,
          run: async (c) => { await cancelU(c, f0.top.unit, f1.bot.unit); await cancelU(c, f1.top.unit, f2.bot.unit); keep(f2.top.unit); } },
        { cap: `Multiply the tops: ${T(`${tn(d.v)}\\times${tn(d.k[0])}\\times${tn(d.k[1])}=${tn(d.m2)}`)} ${u2}. <b>Both methods agree.</b>`,
          run: async (c) => {
            await say(c, R, T(`=${tn(d.v)}\\times${tn(d.k[0])}\\times${tn(d.k[1])}`));
            await say(c, R, T(`=${tn(d.m2)}${U(u2)}`), 'u10l2b-big');
            const s1 = sstamp(L, `${hn(d.m2)} ${u2}`); const s2 = sstamp(R, `${hn(d.m2)} ${u2}`); await stampIn(c, s1); await stampIn(c, s2);
          } }
      ];
    }
  };

  /* =============================== explainer: STAR, snap on a factor, cancel a unit =============================== */
  const CH = {
    ft: { label: '1 ft → cm', maxIn: 14 },
    ex3: { label: 'Example 6 check: 1 m → in', maxIn: 42 },
    ex4a: { label: 'Example 7(a) check', maxIn: 90 },
    ex4b: { label: 'Example 7(b) check', maxIn: 130 }
  };
  const chain = {
    title: 'Unit analysis: snap on a factor, cancel a unit',
    height: 450,
    minW: 820, // drawn this wide and scaled to fit beside the sidebar
    choices: Object.keys(CH).map((k) => ({ v: k, label: CH[k].label })),
    intro: 'Each conversion factor is worth 1. Choose it so the unit you want gone is on the bottom. Press <b>Next</b>.',
    make(stage, k, ex) {
      const d = CH[k], W = ex.W;
      const row = add(stage, h('div', 'u10l2b-chain'), 24, 22);
      const tray = add(stage, box(h('div', 'u10l2b-tray', 'conversion factors'), W - 48, 50), 24, 196);
      const res = add(stage, box(h('div', 'u10l2b-res'), W - 48, 50), 24, 196); res.style.opacity = 0;
      const tape = new Tape(stage, { x: 10, y: 262, width: W - 20, maxIn: d.maxIn }); tape.el.style.opacity = 0;
      const put = (...els) => els.forEach((e) => { row.appendChild(e); hide(e); });
      const result = async (c, html) => { tray.style.opacity = 0; res.innerHTML = html; await show(c, res); };
      const tapeIn = (c) => appear(c, tape.el, 400);
      if (k === 'ft') {
        const f0 = fracEl({ n: '1', u: 'ft' }, { n: '1' }), f1 = fracEl({ n: '12', u: 'in' }, { n: '1', u: 'ft' }), f2 = fracEl({ n: '2.54', u: 'cm' }, { n: '1', u: 'in' });
        const o1 = op('\\times'), o2 = op('\\times'), eq = op('='), ans = h('div', 'u10l2b-ansq', T(q(30.48, 'cm')));
        put(f0, o1, f1, o2, f2, eq, ans);
        return [
          { cap: 'Start with what you have: <b>1 ft</b>, written over 1.', run: async (c) => { await pop(c, f0); await tapeIn(c); } },
          { cap: 'Snap on <b>12 in per 1 ft</b>. ft is on the bottom, so it cancels the ft on top.',
            run: async (c) => { await appear(c, o1); await snap(c, f1); await cancelU(c, f0.top.unit, f1.bot.unit); } },
          { cap: 'Now inches are on top. Snap on <b>2.54 cm per 1 in</b>: in cancels.',
            run: async (c) => { await appear(c, o2); await snap(c, f2); await cancelU(c, f1.top.unit, f2.bot.unit); keep(f2.top.unit); } },
          { cap: `Only <b>cm</b> is left. Multiply the tops: ${T('1\\times12\\times2.54=30.48')} cm.`,
            run: async (c) => { await appear(c, eq); await pop(c, ans); await result(c, T('1\\text{ ft}=30.48\\text{ cm}\\ \\text{(exact)}')); } },
          { cap: 'On the tape: 12 inches lines up with <b>30.48 cm</b>, just past the 30 cm benchmark.',
            run: async (c) => { await tape.mark(c, 12, T('12\\text{ in}=1\\text{ ft}'), T('30.48\\text{ cm}')); } }
        ];
      }
      if (k === 'ex3') {
        const f1 = fracEl({ n: '100', u: 'cm' }, { n: '1', u: 'm' }), f2 = fracEl({ n: '1', u: 'in' }, { n: '2.54', u: 'cm' });
        const o1 = op('\\cdot'), eq = op('='), ans = h('div', 'u10l2b-ansq', T('39.37\\,\\dfrac{\\text{in}}{\\text{m}}'));
        put(f1, o1, f2, eq, ans);
        return [
          { cap: 'The student starts with <b>100 cm per 1 m</b>: a metre is 100 cm. The unit she wants is <b>inches per metre</b>.',
            run: async (c) => { await pop(c, f1); await tapeIn(c); } },
          { cap: 'She snaps on <b>1 in per 2.54 cm</b>, with cm on the bottom.', run: async (c) => { await appear(c, o1); await snap(c, f2); } },
          { cap: '(a) <b>cm cancels</b>: once on top, once on the bottom. Left: <b>in</b> on top and <b>m</b> on the bottom, inches per metre.',
            run: async (c) => { await cancelU(c, f1.top.unit, f2.bot.unit); keep(f2.top.unit, f1.bot.unit); } },
          { cap: `(b) ${T('\\dfrac{100}{2.54}=39.370078\\ldots\\approx39.37')}.`,
            run: async (c) => { await appear(c, eq); await pop(c, ans); } },
          { cap: '(c) On the tape: <b>100 cm</b> (one metre) lines up with about <b>39.37 in</b>, a little over 3 ft. So <b>1 m ≈ 39.37 in</b>.',
            run: async (c) => { await tape.mark(c, 100 / 2.54, T('\\approx39.37\\text{ in}'), T('100\\text{ cm}=1\\text{ m}')); await result(c, T('1\\text{ m}\\approx39.37\\text{ in}')); } }
        ];
      }
      if (k === 'ex4a') {
        const f0 = fracEl({ n: '81', u: 'in' }, { n: '1' }), f1 = fracEl({ n: '2.54', u: 'cm' }, { n: '1', u: 'in' }), f2 = fracEl({ n: '1', u: 'm' }, { n: '100', u: 'cm' });
        const o1 = op('\\times'), o2 = op('\\times'), eq = op('='), ans = h('div', 'u10l2b-ansq', T(q(2.0574, 'm')));
        put(f0, o1, f1, o2, f2, eq, ans);
        return [
          { cap: `Mixed measure? <b>Single unit first</b>: 6 ft 9 in = ${T('6\\times12+9=81')} in.`,
            run: async (c) => { await pop(c, f0); await tapeIn(c); } },
          { cap: 'Cross to SI with the exact fact: snap on <b>2.54 cm per 1 in</b>. in cancels.',
            run: async (c) => { await appear(c, o1); await snap(c, f1); await cancelU(c, f0.top.unit, f1.bot.unit); } },
          { cap: 'The answer is wanted in metres: snap on <b>1 m per 100 cm</b>. cm cancels.',
            run: async (c) => { await appear(c, o2); await snap(c, f2); await cancelU(c, f1.top.unit, f2.bot.unit); keep(f2.top.unit); } },
          { cap: `Tops over bottoms: ${T('\\dfrac{81\\times2.54\\times1}{100}=2.0574')} m ${T('\\approx2.057')} m (three decimal places).`,
            run: async (c) => { await appear(c, eq); await pop(c, ans); await result(c, T('6\\text{ ft }9\\text{ in}\\approx2.057\\text{ m}')); } },
          { cap: 'On the tape: 81 in (6 ft 9 in) lines up with <b>205.74 cm</b>, just over 2 m.',
            run: async (c) => { await tape.mark(c, 81, T('81\\text{ in}=6\\text{ ft }9\\text{ in}'), T('205.74\\text{ cm}')); } }
        ];
      }
      const f0 = fracEl({ n: '3.15', u: 'm' }, { n: '1' }), f1 = fracEl({ n: '100', u: 'cm' }, { n: '1', u: 'm' }), f2 = fracEl({ n: '1', u: 'in' }, { n: '2.54', u: 'cm' });
      const o1 = op('\\times'), o2 = op('\\times'), eq = op('='), ans = h('div', 'u10l2b-ansq', T('124.0157\\ldots\\text{ in}'));
      put(f0, o1, f1, o2, f2, eq, ans);
      return [
        { cap: 'Now the other direction: start with <b>3.15 m</b>.', run: async (c) => { await pop(c, f0); await tapeIn(c); } },
        { cap: 'Snap on <b>100 cm per 1 m</b>: m cancels.', run: async (c) => { await appear(c, o1); await snap(c, f1); await cancelU(c, f0.top.unit, f1.bot.unit); } },
        { cap: 'Snap on <b>1 in per 2.54 cm</b> (the exact fact, upside down so cm is on the bottom): cm cancels.',
          run: async (c) => { await appear(c, o2); await snap(c, f2); await cancelU(c, f1.top.unit, f2.bot.unit); keep(f2.top.unit); } },
        { cap: `Tops over bottoms: ${TQ('\\dfrac{3.15\\times100}{2.54}=124.0157\\ldots\\approx124')} in (nearest inch).`,
          run: async (c) => { await appear(c, eq); await pop(c, ans); } },
        { cap: `Split into feet: ${T('124\\div12=10')} remainder 4. On the tape, 315 cm sits just past the 10 ft mark: <b>10 ft 4 in</b>.`,
          run: async (c) => { await tape.mark(c, 315 / 2.54, T('124\\text{ in}=10\\text{ ft }4\\text{ in}'), T('315\\text{ cm}')); await result(c, T('3.15\\text{ m}\\approx10\\text{ ft }4\\text{ in}')); } }
      ];
    }
  };

  /* =============================== explainer: estimate first, then convert =============================== */
  const EST = {
    a: { label: 'Example 8(a)', min: 1.5, max: 2.0, step: 0.05, labs: [1.5, 1.6, 1.7, 1.8, 1.9, 2.0], dp: 2, unit: 'm',
      q: 'Convert <b>5 ft 9 in</b> to metres.', bench: '1\\text{ in}\\approx2.5\\text{ cm}',
      est: ['5\\text{ ft }9\\text{ in}=69\\text{ in}', '69\\times2.5\\approx172\\text{ cm}\\approx1.7\\text{ m}'], ev: 1.725, evTex: '\\approx1.7',
      exa: ['69\\times2.54=175.26\\text{ cm}', '=1.7526\\text{ m}\\approx\\mathbf{1.75}\\text{ m}'], xv: 1.7526, xvTex: '1.75', capX: '69\\times2.54=175.26\\text{ cm}=1.7526\\text{ m}\\approx1.75\\text{ m}',
      end: 'The exact answer (1.75 m) lands right beside the estimate: <b>reasonable</b> ✓' },
    b: { label: '(b)', min: 20, max: 30, step: 1, labs: [20, 22, 24, 26, 28, 30], dp: 1, unit: 'mi',
      q: 'Convert <b>40 km</b> to miles.', bench: '5\\text{ mi}\\approx8\\text{ km}',
      est: ['40\\text{ km}=5\\times8\\text{ km}', '\\approx5\\times5=25\\text{ mi}'], ev: 25, evTex: '\\approx25',
      exa: ['40\\text{ km}\\times\\dfrac{1\\text{ mi}}{1.6093\\text{ km}}', '=24.86\\ldots\\approx\\mathbf{24.9}\\text{ mi}'], xv: 24.8555, xvTex: '24.9', capX: '40\\div1.6093=24.86\\ldots\\approx24.9\\text{ mi}',
      end: '24.9 mi is close to 25 ✓ (km is the smaller unit, so the mile number is smaller).' },
    c: { label: '(c)', min: 0, max: 350, step: 10, labs: [0, 50, 100, 150, 200, 250, 300, 350], dp: 0, unit: 'kg', wrong: 330,
      q: 'A student writes <b>150 lb = 330 kg</b>.', bench: '1\\text{ kg}\\approx2.2\\text{ lb}',
      est: ['150\\div2\\approx75\\text{ kg}', '\\text{(a bit less, since }2.2>2)'], ev: 75, evTex: '\\approx75',
      exa: ['150\\div2.2=68.18\\ldots', '\\approx\\mathbf{68}\\text{ kg}'], xv: 68.18, xvTex: '68',
      end: 'Corrected: <b>68 kg</b>. The student multiplied by 2.2 instead of dividing.' }
  };
  const estimate = {
    title: 'Estimate first, then convert',
    height: 480,
    choices: [{ sep: 'Example 8 check:' }, ...Object.keys(EST).map((k) => ({ v: k, label: EST[k].label }))],
    intro: 'A benchmark estimate tells you roughly where the answer should land. Press <b>Next</b>.',
    make(stage, k, ex) {
      const d = EST[k], W = ex.W, PW = (W - 54) / 2;
      const head = add(stage, box(h('div', 'u10l2b-qbar', `${d.q} Benchmark: ${T(d.bench)}`), W - 36, 46), 18, 12); head.style.opacity = 1;
      const A = panel(stage, 18, 70, PW, 180, 'Estimate (mental math)', 'u10l2b-pE'), B = panel(stage, 36 + PW, 70, PW, 180, 'Exact (calculator)', 'u10l2b-pX');
      const NL = new NumberLine(stage, { x: 30, y: 290, width: W - 60, height: 130, min: d.min, max: d.max, step: d.step, labels: d.labs.map((v, i) => ({ v, html: T((d.dp === 2 ? v.toFixed(1) : String(v)) + (i === d.labs.length - 1 ? U(d.unit) : '')) })) });
      const pt = (v, color, html, pos = 'n') => { const p = NL.point(v, { color }); const m = NL.mark(v, html, { pos }); p.style.opacity = 0; m.style.opacity = 0; return [p, m]; };
      const reveal = async (c, [p, m]) => { await pop(c, p); await pop(c, m); };
      if (d.wrong) {
        return [
          { cap: '<b>Direction first.</b> A kilogram is <b>heavier</b> than a pound (1 kg ≈ 2.2 lb), so there must be <b>fewer</b> kilograms than pounds: the answer is less than 150.',
            run: async (c) => { await NL.drawIn(NL.interval(0, 150, { color: GRN }), 700, c); await say(c, A, 'kg is the bigger unit, so the number must be <b>smaller than 150</b>'); } },
          { cap: '330 kg is <b>bigger</b> than 150: impossible. 330 is what you get by <b>multiplying</b> by 2.2 instead of dividing.',
            run: async (c) => { const w = pt(330, RED, '<b class="u10l2b-red">330 ✗</b>'); await reveal(c, w); await say(c, B, `${T('150\\times2.2=330')}: the wrong way`, 'u10l2b-off'); } },
          { cap: `Estimate: 2.2 is about 2, so ${T('150\\div2\\approx75')} kg, a little less since we really divide by more than 2.`,
            run: async (c) => { for (const s of d.est) await say(c, A, T(s)); await reveal(c, pt(d.ev, IMP, T(d.evTex), 'n')); } },
          { cap: `Exact: ${T('150\\div2.2=68.18\\ldots\\approx68')} kg. Close to the estimate, inside the green zone ✓`,
            run: async (c) => { for (const s of d.exa) await say(c, B, T(s)); await reveal(c, pt(d.xv, SI, `<b>${T(d.xvTex)}</b>`, 's')); } },
          { cap: d.end, run: async (c) => { const s = sstamp(B, '68 kg'); await stampIn(c, s); } }
        ];
      }
      return [
        { cap: `Estimate with the benchmark ${T(d.bench)}: ${T(d.est[1])}.`,
          run: async (c) => { for (const s of d.est) await say(c, A, T(s)); } },
        { cap: 'Mark the estimate on the number line.', run: async (c) => { await reveal(c, pt(d.ev, IMP, `est. ${T(d.evTex)}`, 'n')); } },
        { cap: `Now convert exactly: ${TQ(d.capX)}.`,
          run: async (c) => { for (const s of d.exa) await say(c, B, T(s)); } },
        { cap: 'Mark the exact answer. How far is it from the estimate?',
          run: async (c) => { await reveal(c, pt(d.xv, SI, `<b>${T(d.xvTex)}</b>`, 's')); } },
        { cap: d.end, run: async (c) => { const s = sstamp(B, 'reasonable'); await stampIn(c, s); } }
      ];
    }
  };

  /* =============================== explainer: heights on a growth chart, masses on a dial =============================== */
  const HT = {
    a: { label: 'Example 9(a)', who: 'Wayne Gretzky', ft: 6, inch: 0 },
    b: { label: '(b)', who: 'Shaquille O’Neal', ft: 7, inch: 1 },
    c: { label: '(c)', who: 'Simone Biles', ft: 4, inch: 8 },
    d: { label: '(d)', what: 'bull moose', lb: 1200, max: 1400, lbStep: 200, kgStep: 100 },
    e: { label: '(e)', what: 'Canada goose', lb: 9, max: 12, lbStep: 2, kgStep: 1 },
    f: { label: '(f)', what: 'grizzly bear', lb: 600, max: 700, lbStep: 100, kgStep: 50 }
  };
  function person(svg, x, floor, hpx, color, op = 1) {
    const s = hpx, g = svgEl('g', { opacity: op }, svg);
    const w = s * 0.26;
    svgEl('circle', { cx: x, cy: floor - s + s * 0.065, r: s * 0.065, fill: color }, g);
    svgEl('path', { d: `M${x - w / 2} ${floor - s * 0.82} Q${x} ${floor - s * 0.87} ${x + w / 2} ${floor - s * 0.82} L${x + w * 0.42} ${floor - s * 0.47} L${x + w * 0.2} ${floor - s * 0.47} L${x + w * 0.22} ${floor} L${x + w * 0.04} ${floor} L${x} ${floor - s * 0.42} L${x - w * 0.04} ${floor} L${x - w * 0.22} ${floor} L${x - w * 0.2} ${floor - s * 0.47} L${x - w * 0.42} ${floor - s * 0.47} Z`, fill: color }, g);
    g.style.transformBox = 'view-box'; g.style.transformOrigin = `${x}px ${floor}px`;
    return g;
  }
  const heights = {
    title: 'Heights on a growth chart, masses on a scale',
    height: 500,
    minW: 880, // drawn this wide and scaled to fit beside the sidebar (the chart is 570 px, the work panel sits to its right)
    choices: [{ sep: 'Example 9 check:' }, ...Object.keys(HT).map((k) => ({ v: k, label: HT[k].label }))],
    intro: 'Read the same height (or mass) on an imperial scale and an SI scale. Press <b>Next</b>.',
    make(stage, k, ex) {
      const d = HT[k], H = ex.def.height, W = ex.W;
      const P = panel(stage, W - 306, 20, 296, H - 40, d.who ? d.who : 'a ' + d.what);
      if (d.who) {
        const svg = add(stage, svgEl('svg', { width: 560, height: H, viewBox: `0 0 560 ${H}` }), 10, 0);
        const floor = H - 34, top = 30, ppi = (floor - top) / 96, sx = 130;
        svgEl('rect', { x: sx, y: top, width: 70, height: floor - top, fill: '#fffaf0', stroke: '#c9c3b2' }, svg);
        for (let i = 0; i <= 96; i++) { const y = floor - i * ppi, L = i % 12 === 0 ? 26 : i % 6 === 0 ? 16 : 8; svgEl('line', { x1: sx, x2: sx + L, y1: y, y2: y, stroke: IMP, 'stroke-width': i % 12 ? 1 : 2 }, svg); if (i % 12 === 0 && i) { const t = svgEl('text', { x: sx - 8, y: y + 6, 'text-anchor': 'end', class: 'u10l2b-gimp' }, svg); t.textContent = i / 12 + ' ft'; } }
        const ppc = ppi / 2.54;
        for (let cm = 0; cm <= 96 * 2.54; cm += 10) { const y = floor - cm * ppc, L = cm % 50 === 0 ? 26 : 14; svgEl('line', { x1: sx + 70 - L, x2: sx + 70, y1: y, y2: y, stroke: SI, 'stroke-width': cm % 50 ? 1 : 2 }, svg); if (cm % 50 === 0 && cm) { const t = svgEl('text', { x: sx + 78, y: y + 6, class: 'u10l2b-gsi' }, svg); t.textContent = (cm / 100).toFixed(1) + ' m'; } }
        svgEl('line', { x1: 20, x2: 550, y1: floor, y2: floor, stroke: INK, 'stroke-width': 2 }, svg);
        const others = Object.values(HT).filter((o) => o.who && o !== d);
        others.forEach((o, i) => { const hi = o.ft * 12 + o.inch, ox = 290 + i * 105; person(svg, ox, floor, hi * ppi, '#c9ccd3', 0.7); const t = svgEl('text', { x: ox, y: floor + 20, 'text-anchor': 'middle', class: 'u10l2b-gname' }, svg); t.textContent = o.who.split(' ').pop(); });
        const inches = d.ft * 12 + d.inch, cm = inches * 2.54, m = cm / 100, hpx = inches * ppi, yH = floor - hpx;
        const me = person(svg, 500, floor, hpx, IMP);
        const myn = svgEl('text', { x: 500, y: floor + 20, 'text-anchor': 'middle', class: 'u10l2b-gname u10l2b-gme' }, svg); myn.textContent = d.who.split(' ').pop(); me.style.transform = 'scaleY(0)';
        const hl = svgEl('line', { x1: sx - 4, x2: 500, y1: yH, y2: yH, stroke: RED, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }, svg); hl.style.opacity = 0;
        const pI = hide(add(stage, h('div', 'u10l2b-hread u10l2b-imp', T(`${d.ft}'${d.inch}''=${inches}\\text{ in}`)), 6, yH - 44));
        const pS = hide(add(stage, h('div', 'u10l2b-hread u10l2b-si', T(`${tn(m, 2)}\\text{ m}`)), 214, yH - 44));
        return [
          { cap: `${d.who}: ${T(`${d.ft}'${d.inch}''`)} means <b>${d.ft} ft ${d.inch} in</b>.`,
            run: async (c) => { await anim(c, me, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], 900); await anim(c, hl, [{ opacity: 0 }, { opacity: 1 }], 300); } },
          { cap: `Single unit first: ${T(`${d.ft}\\times12+${d.inch}=${inches}`)} in.`,
            run: async (c) => { await pop(c, pI); await say(c, P, T(`${d.ft}'${d.inch}''=${d.ft}\\times12+${d.inch}=${inches}\\text{ in}`)); } },
          { cap: `Cross to SI: ${T(`${inches}\\times2.54=${tn(cm)}`)} cm = ${T(tn(m))} m.`,
            run: async (c) => { await say(c, P, T(`${inches}\\times2.54=${tn(cm)}\\text{ cm}`)); await say(c, P, T(`=${tn(m)}\\text{ m}`)); } },
          { cap: `To the nearest hundredth: <b>${tn(m, 2)} m</b>. Read across: the head line meets the metre scale there too.`,
            run: async (c) => { await pop(c, pS); await say(c, P, T(`\\approx\\mathbf{${tn(m, 2)}}\\text{ m}`), 'u10l2b-big'); const s = sstamp(P, `${tn(m, 2)} m`); await stampIn(c, s); } }
        ];
      }
      // dial scale
      const svg = add(stage, svgEl('svg', { width: 560, height: H, viewBox: `0 0 560 ${H}` }), 10, 0);
      const cx = 280, cy = 255, R = 190, kgMax = d.max / 2.2;
      const ang = (lb) => (-130 + 260 * lb / d.max) * Math.PI / 180, pt = (lb, r) => [cx + r * Math.sin(ang(lb)), cy - r * Math.cos(ang(lb))];
      svgEl('circle', { cx, cy, r: R + 22, fill: '#fbfaf6', stroke: INK, 'stroke-width': 3 }, svg);
      svgEl('circle', { cx, cy, r: R - 62, fill: '#eef3fc', stroke: '#c9d6ef', 'stroke-width': 1.5 }, svg);
      const fine = d.lbStep / (d.max <= 20 ? 4 : 4);
      for (let lb = 0; lb <= d.max + 1e-9; lb += fine) {
        const major = Math.abs(lb / d.lbStep - Math.round(lb / d.lbStep)) < 1e-9, [x1, y1] = pt(lb, R + 20), [x2, y2] = pt(lb, R + (major ? 2 : 10));
        svgEl('line', { x1, y1, x2, y2, stroke: IMP, 'stroke-width': major ? 3 : 1.5 }, svg);
        if (major) { const [tx, ty] = pt(lb, R - 16); const t = svgEl('text', { x: tx, y: ty + 7, 'text-anchor': 'middle', class: 'u10l2b-dimp' }, svg); t.textContent = hn(lb); }
      }
      for (let kg = 0; kg <= kgMax + 1e-9; kg += d.kgStep / 2) {
        const major = Math.abs(kg / d.kgStep - Math.round(kg / d.kgStep)) < 1e-9, lb = kg * 2.2, [x1, y1] = pt(lb, R - 62), [x2, y2] = pt(lb, R - (major ? 80 : 72));
        svgEl('line', { x1, y1, x2, y2, stroke: SI, 'stroke-width': major ? 2.5 : 1.2 }, svg);
        if (major) { const [tx, ty] = pt(lb, R - 98); const t = svgEl('text', { x: tx, y: ty + 6, 'text-anchor': 'middle', class: 'u10l2b-dsi' }, svg); t.textContent = hn(kg); }
      }
      const ul = svgEl('text', { x: cx, y: cy + 70, 'text-anchor': 'middle', class: 'u10l2b-dimp' }, svg); ul.textContent = 'lb (outer)';
      const uk = svgEl('text', { x: cx, y: cy + 96, 'text-anchor': 'middle', class: 'u10l2b-dsi' }, svg); uk.textContent = 'kg (inner)';
      const needle = svgEl('line', { x1: cx, y1: cy, stroke: RED, 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
      svgEl('circle', { cx, cy, r: 10, fill: INK }, svg);
      const setN = (lb) => { const [x, y] = pt(lb, R + 14); needle.setAttribute('x2', x); needle.setAttribute('y2', y); };
      setN(0);
      const kg = d.lb / 2.2, kgR = Math.round(kg);
      return [
        { cap: `A ${d.what} on the scale: about <b>${hn(d.lb)} lb</b> on the outer (pound) ring.`,
          run: async (c) => { await tween(c, 1200, (t) => setN(d.lb * t)); await say(c, P, T(q(d.lb, 'lb'))); } },
        { cap: `The inner ring reads <b>kilograms</b>. The same needle points to about ${hn(kgR)} kg.`,
          run: async (c) => { await anim(c, needle, [{ strokeWidth: 4 }, { strokeWidth: 9 }, { strokeWidth: 4 }], 700); } },
        { cap: `Exact: ${T(`${tn(d.lb)}\\text{ lb}\\times\\dfrac{1\\text{ kg}}{2.2\\text{ lb}}=${tn(kg, 2)}\\ldots`)} kg. lb cancels.`,
          run: async (c) => { await say(c, P, T(`${tn(d.lb)}\\text{ lb}\\times\\dfrac{1\\text{ kg}}{2.2\\text{ lb}}`), 'u10l2b-frl'); await say(c, P, T(`=${tn(d.lb)}\\div2.2=${tn(kg, 2)}\\ldots`)); } },
        { cap: `To the nearest kilogram: <b>${hn(kgR)} kg</b>. Fewer kilograms than pounds, because the kilogram is the heavier unit ✓`,
          run: async (c) => { await say(c, P, T(`\\approx\\mathbf{${tn(kgR)}}\\text{ kg}`), 'u10l2b-big'); const s = sstamp(P, `${hn(kgR)} kg`); await stampIn(c, s); } }
      ];
    }
  };

  /* =============================== explainer: film to DVDs, rounding up =============================== */
  const RU = {
    ex7: { label: 'Example 10 check: 1650 m', m: 1650 },
    m1100: { label: '1100 m of film', m: 1100 }
  };
  const roundup = {
    title: 'Film to DVDs: why the count rounds up',
    height: 470,
    choices: Object.keys(RU).map((k) => ({ v: k, label: RU[k].label })),
    intro: 'Convert the film to feet, then cut it into 1200 ft DVD loads. Press <b>Next</b>.',
    make(stage, k, ex) {
      const d = RU[k], W = ex.W, ft = d.m / 0.3048, n = ft / 1200, full = Math.floor(n), need = Math.ceil(n), left = ft - full * 1200;
      const x0 = 40, wid = W - 80, sc = wid / 6000, y = 70;
      const film = hide(add(stage, box(h('div', 'u10l2b-film', `<span>${hn(d.m)} m of film</span>`), ft * sc, 54), x0, y));
      const ruler = add(stage, svgEl('svg', { width: wid + 20, height: 30, viewBox: `0 0 ${wid + 20} 30` }), x0, y + 58); ruler.style.opacity = 0;
      for (let f = 0; f <= 6000; f += 500) { const x = f * sc; svgEl('line', { x1: x, x2: x, y1: 0, y2: f % 1000 ? 7 : 13, stroke: INK, 'stroke-width': 1.4 }, ruler); if (f % 1000 === 0 && f < 6000) { const t = svgEl('text', { x: x + 2, y: 27, class: 'u10l2b-rtx' }, ruler); t.textContent = hn(f) + (f ? ' ft' : ''); } }
      const loads = [], discs = [];
      for (let i = 0; i < need; i++) {
        const w = Math.max(6, Math.min(1200, ft - i * 1200) * sc);
        loads.push(hide(add(stage, box(h('div', 'u10l2b-load' + (i % 2 ? ' u10l2b-alt' : '') + (i === full ? ' u10l2b-lastl' : ''), ''), w, 54), x0 + i * 1200 * sc, y)));
        const dk = hide(add(stage, h('div', 'u10l2b-disc', `<div class="u10l2b-fill"></div><b>DVD ${i + 1}</b>`), x0 + i * 1200 * sc + 1200 * sc / 2 - 52, y + 104));
        dk.fill = dk.firstChild; dk.fill.style.height = '0%'; discs.push(dk);
      }
      const P = panel(stage, 40, 330, W - 80, 126, '');
      return [
        { cap: `${hn(d.m)} m of film, but the DVD capacity is in <b>feet</b>. Convert first.`,
          run: async (c) => { await anim(c, film, [{ opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left' }, { opacity: 1, transform: 'scaleX(1)', transformOrigin: 'left' }], 900); } },
        { cap: `Exact fact 1 ft = 0.3048 m: ${TQ(`${tn(d.m)}\\div0.3048=${tn(ft, 4)}\\ldots\\approx${tn(ft, 2)}`)} ft.`,
          run: async (c) => { await appear(c, ruler); film.innerHTML = `<span>${T(`\\approx${tn(ft, 2)}\\text{ ft}`)}</span>`; await pulse(c, film, 1.03); await say(c, P, T(`${tn(d.m)}\\text{ m}\\times\\dfrac{1\\text{ ft}}{0.3048\\text{ m}}=${tn(ft, 4)}\\ldots\\approx${tn(ft, 2)}\\text{ ft}`), 'u10l2b-frl'); } },
        { cap: `Cut the film into 1200 ft DVD loads: <b>${full}</b> full DVDs.`,
          run: async (c) => {
            film.style.opacity = 0.25;
            for (let i = 0; i < full; i++) { await appear(c, loads[i], 250); await appear(c, discs[i], 200); await anim(c, discs[i].fill, [{ height: '0%' }, { height: '100%' }], 350); }
          } },
        { cap: `${T(`${tn(ft, 2)}\\div1200=${tn(n, 3)}\\ldots`)} About ${hn(Math.round(left))} ft of film is <b>left over</b>, with nowhere to go.`,
          run: async (c) => { await appear(c, loads[full], 300); await pulse(c, loads[full], 1.08); await say(c, P, T(`${tn(ft, 2)}\\div1200=${tn(n, 3)}\\ldots`)); } },
        { cap: n - full < 0.5 ? `Normal rounding says ${full}, but ${full} DVDs leave film behind. Round <b>up</b>: <b>${need} DVDs</b>.` : `${full} DVDs aren’t enough, so the count rounds <b>up</b>: <b>${need} DVDs</b> (the last one only partly full).`,
          run: async (c) => {
            await appear(c, discs[full], 250); await anim(c, discs[full].fill, [{ height: '0%' }, { height: Math.round((n - full) * 100) + '%' }], 600);
            await say(c, P, `${T(`${tn(n, 3)}\\ldots`)} rounds <b>up</b> to <b>${need} DVDs</b>`, 'u10l2b-big');
            const s = sstamp(P, `${need} DVDs`, true, { x: W - 80 - 110, y: 64 }); await stampIn(c, s);
          } }
      ];
    }
  };

  /* =============================== mount =============================== */
  mountRace();
  const explainers = { exact, bench, ladder, mixed, twoways, chain, estimate, heights, roundup };
  const test = { EXA, BEN, MIX, TWO, CH, EST, HT, RU };

  /* =============================== Math History: the Gimli Glider (u10l2b-hist) =============================== */
  (function gimliGlider() {
    const svg = document.getElementById('u10l2b-hist'); if (!svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k])); (parent || svg).appendChild(e); return e; };
    const txt = (s, attrs, parent) => { const e = mk('text', attrs, parent); e.textContent = s; return e; };
    const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
    const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
    const op = (el, v) => { el.style.opacity = v; };
    const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    // the fuel bar: 0 to 24 000 kg
    const BX = 24, BW = 552, BY = 40, BH = 32, KG = (k) => BX + (BW * k) / 24000, NEED = 22300, REAL = 10100;
    txt('Fuel needed: 22 300 kg', { x: BX, y: 28, class: 'u10l2bh-title' });
    mk('rect', { x: BX, y: BY, width: BW, height: BH, rx: 7, class: 'u10l2bh-tank' });
    const fill = mk('rect', { x: BX, y: BY, width: 0, height: BH, rx: 7, class: 'u10l2bh-fill' });
    const half = mk('g', {});
    mk('line', { x1: KG(NEED / 2), x2: KG(NEED / 2), y1: BY - 4, y2: BY + BH + 4, class: 'u10l2bh-half' }, half);
    txt('half', { x: KG(NEED / 2), y: BY + BH + 16, 'text-anchor': 'middle', class: 'u10l2bh-small' }, half);
    mk('line', { x1: KG(NEED), x2: KG(NEED), y1: BY - 6, y2: BY + BH + 6, class: 'u10l2bh-need' });
    txt('needed', { x: KG(NEED), y: BY + BH + 18, 'text-anchor': 'middle', class: 'u10l2bh-small' });
    const val = txt('', { x: 0, y: BY + 22, 'text-anchor': 'end', class: 'u10l2bh-val' });
    const st1 = txt('Crew’s sums: litres × 1.77 → “22 300 kg”. Enough!', { x: BX, y: 114, class: 'u10l2bh-st' });
    const st2 = txt('But 1.77 is pounds per litre: 22 300 lb ≈ 10 100 kg.', { x: BX, y: 114, class: 'u10l2bh-st u10l2bh-bad' });
    // the glide
    const GY = 276, glide = mk('g', {});
    mk('line', { x1: 0, x2: 600, y1: GY, y2: GY, class: 'u10l2bh-ground' }, glide);
    mk('rect', { x: 440, y: GY - 5, width: 150, height: 9, rx: 2, class: 'u10l2bh-runway' }, glide);
    for (let x = 452; x < 584; x += 22) mk('line', { x1: x, x2: x + 10, y1: GY, y2: GY, class: 'u10l2bh-dash' }, glide);
    txt('Gimli, Manitoba', { x: 515, y: 296, 'text-anchor': 'middle', class: 'u10l2bh-place' }, glide);
    txt('41 000 ft', { x: 24, y: 158, class: 'u10l2bh-alt' }, glide);
    const path = mk('path', { d: 'M60,170 C210,178 380,236 486,270', class: 'u10l2bh-path' }, glide);
    const trail = mk('path', { d: 'M60,170 C210,178 380,236 486,270', class: 'u10l2bh-trail' }, glide);
    const out = txt('both engines stop', { x: 96, y: 160, class: 'u10l2bh-out' }, glide);
    const clock = txt('', { x: 590, y: 158, 'text-anchor': 'end', class: 'u10l2bh-clock' }, glide);
    const safe = txt('landed: all 69 on board survive', { x: 590, y: 184, 'text-anchor': 'end', class: 'u10l2bh-safe' }, glide);
    const plane = mk('g', {}, glide), body = mk('g', { transform: 'scale(1.25)' }, plane);
    mk('path', { d: 'M-22,-2.5 L14,-3 Q23,-2.5 25,0.5 Q23,3.5 14,3.5 L-22,3 Z', class: 'u10l2bh-jet' }, body);
    mk('path', { d: 'M-22,-1 L-27,-12 L-20,-12 L-12,-2 Z', class: 'u10l2bh-jet' }, body);
    mk('path', { d: 'M-3,1 L7,1 L-5,10 L-11,10 Z', class: 'u10l2bh-wing' }, body);
    mk('path', { d: 'M17,-2.2 L21,-2 L22.5,0 L17,0 Z', class: 'u10l2bh-win' }, body);
    const LEN = path.getTotalLength ? path.getTotalLength() : 470;
    trail.style.strokeDasharray = `${LEN} ${LEN}`;
    const T = 13400;
    function draw(t) {
      // fill up to the crew's number, then drop to what was really there
      const up = ease(seg(t, 400, 3200)), down = ease(seg(t, 4300, 6100));
      const kg = NEED * up - (NEED - REAL) * down, w = KG(kg) - BX;
      fill.setAttribute('width', Math.max(0, w).toFixed(1));
      fill.classList.toggle('bad', t >= 4300);
      val.setAttribute('x', (BX + w - 8).toFixed(1)); op(val, w > 90 ? 1 : 0);
      val.textContent = t < 4300 ? fmt(kg) : fmt(kg) + ' kg';
      op(st1, t < 4300 ? seg(t, 900, 1300) : 0); op(st2, seg(t, 4300, 4700)); op(half, seg(t, 5600, 6100));
      // the glide
      op(glide, seg(t, 6400, 6900));
      const g = ease(seg(t, 7300, 12500)), pt = path.getPointAtLength ? path.getPointAtLength(g * LEN) : { x: 60, y: 170 }, pt2 = path.getPointAtLength ? path.getPointAtLength(Math.min(LEN, g * LEN + 2)) : { x: 61, y: 170 };
      const ang = g >= 1 ? 0 : (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
      const p = g >= 1 ? { x: 520, y: GY - 6 } : g > 0.97 ? { x: pt.x + (520 - pt.x) * ((g - 0.97) / 0.03), y: pt.y + (GY - 6 - pt.y) * ((g - 0.97) / 0.03) } : { x: pt.x, y: pt.y - 6 };
      plane.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      trail.style.strokeDashoffset = (LEN * (1 - g)).toFixed(1);
      op(out, seg(t, 6900, 7300) * (1 - seg(t, 9000, 9600)));
      clock.textContent = t < 7300 ? '' : 'gliding: ' + Math.floor(17 * g) + ' min';
      op(safe, seg(t, 12600, 13000));
    }
    let t0 = 0, raf = 0;
    function frame(now) { if (!t0) t0 = now; const t = Math.min(T, now - t0); draw(t); if (t < T) raf = requestAnimationFrame(frame); }
    function play() {
      cancelAnimationFrame(raf); t0 = 0;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(T); return; }
      draw(0); raf = requestAnimationFrame(frame);
    }
    draw(0);
    svg.addEventListener('click', play);
    const btn = svg.closest('.hist-anim') && svg.closest('.hist-anim').querySelector('.hist-play'); if (btn) btn.addEventListener('click', play);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.5 });
      io.observe(svg);
    } else play();
  })();
  return { explainers, test };
})();

export const explainers = mountExplainers({ hop, map, cancel, rate, ...B.explainers });
export const _test = { HOP, CAN, Tape, ...B.test };

/* ============ Stand Up Break! — convert within and between SI and imperial (the lesson's facts, Section 4) ============ */
(() => {
  const N = (v, d) => { // LaTeX number: d decimals (or trimmed), thin spaces in an integer part of 5+ digits
    let [i, f] = (d != null ? v.toFixed(d) : (Math.round(v * 1e8) / 1e8).toFixed(8).replace(/\.?0+$/, '')).split('.');
    if (i.length > 4) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
    return i + (f != null ? '.' + f : '');
  };
  const H = (v, d) => N(v, d).replace(/\\,/g, '\u202f');
  const bord = (x, d) => { const f = x * 10 ** d; return Math.abs(f - Math.floor(f) - 0.5) < 0.06; };
  const dots = (v, d) => N(Math.floor(v * 10 ** d + 1e-7) / 10 ** d, d) + '\\ldots';  // truncated, for a calculator display
  const U = (u) => '\\text{ ' + u + '}';
  const PL = { 1: 'one decimal place', 2: 'two decimal places', 3: 'three decimal places', 0: 'the nearest whole number' };
  const fi = (F, I) => F + U('ft') + '\\ ' + I + U('in');

  /* ---------- Beginning: one conversion ---------- */
  const PF = [['k', -3], ['h', -2], ['da', -1], ['', 0], ['d', 1], ['c', 2], ['m', 3]];
  const siQ = (r) => { // count steps on the metric number line
    const b = r.pick(['m', 'm', 'g', 'L']), A = r.pick(PF), B = r.pick(PF), k = B[1] - A[1];
    if (Math.abs(k) < 2 || (b === 'L' && (A[0] === 'h' || A[0] === 'da' || B[0] === 'h' || B[0] === 'da'))) return null;
    const v = r.int(12, 990) / r.pick([1, 10, 100]), w = v * 10 ** k;
    if (w < 0.0001 || w > 1e7 || Math.round(v) === v && v % 10 === 0) return null;
    const u1 = A[0] + b, u2 = B[0] + b;
    return { text: 'Convert using the metric number line.', q: N(v) + U(u1) + '=\\ ?' + U(u2),
      a: ['\\text{' + u1 + '}\\to\\text{' + u2 + '}:\\ ' + Math.abs(k) + '\\text{ steps ' + (k > 0 ? 'right' : 'left') + '}:\\ ' + (k > 0 ? '\\times' : '\\div') + '10^{' + Math.abs(k) + '}',
        N(v) + (k > 0 ? '\\times ' : '\\div ') + N(10 ** Math.abs(k)) + '=' + N(w) + U(u2)] };
  };
  const mixQ = (r) => { // imperial: mixed → single, or single → mixed
    const t = r.pick([['ft', 'in', 12, 3, 9], ['yd', 'ft', 3, 4, 40], ['mi', 'yd', 1760, 1, 4], ['yd', 'in', 36, 2, 9]]), [Bg, Sm, m, lo, hi] = t;
    const big = r.int(lo, hi), sm = r.int(1, m - 1), tot = big * m + sm;
    if (Sm === 'yd' && sm < 50) return null;
    if (r.chance(0.5)) return { text: 'Convert to a single unit.', q: big + U(Bg) + '\\ ' + sm + U(Sm) + '=\\ ?' + U(Sm),
      a: [big + '\\times ' + m + '=' + N(big * m) + U(Sm), N(big * m) + '+' + sm + '=' + N(tot) + U(Sm)] };
    return { text: 'Convert to ' + (Bg === 'mi' ? 'miles and yards' : Bg === 'yd' ? 'yards and ' + (Sm === 'ft' ? 'feet' : 'inches') : 'feet and inches') + '.', q: N(tot) + U(Sm) + '=\\ ?' + U(Bg) + '\\ ?' + U(Sm),
      a: [N(tot) + '\\div ' + m + '=' + big + '\\text{ R }' + sm, '=' + big + U(Bg) + '\\ ' + sm + U(Sm)] };
  };
  const ONE = [ // [from, to, factor (multiply), fact, places, range lo, hi, divisor] — exact facts used where they exist
    ['in', 'cm', 2.54, '1\\text{ in}=2.54\\text{ cm}', 1, 3, 40],
    ['cm', 'in', 1 / 2.54, '1\\text{ in}=2.54\\text{ cm}', 1, 12, 150, 2.54],
    ['ft', 'm', 0.3048, '1\\text{ ft}=0.3048\\text{ m}', 2, 6, 90],
    ['yd', 'm', 0.9144, '1\\text{ yd}=0.9144\\text{ m}', 1, 15, 220],
    ['m', 'yd', 1 / 0.9144, '1\\text{ yd}=0.9144\\text{ m}', 1, 10, 200, 0.9144],
    ['mi', 'km', 1.6093, '1\\text{ mi}\\approx 1.6093\\text{ km}', 1, 3, 90],
    ['lb', 'kg', 1 / 2.2, '1\\text{ kg}\\approx 2.2\\text{ lb}', 1, 5, 250, 2.2],
    ['kg', 'lb', 2.2, '1\\text{ kg}\\approx 2.2\\text{ lb}', 0, 4, 120]
  ];
  const oneQ = (r) => {
    const [f, t, k, fact, dp, lo, hi, dv] = r.pick(ONE), v = r.int(lo, hi), w = v * k;
    if (bord(w, dp)) return null;
    const exact = Math.abs(w * 10 ** dp - Math.round(w * 10 ** dp)) < 1e-9;
    return { text: 'Convert, to ' + PL[dp] + '.', q: v + U(f) + '\\approx\\ ?' + U(t),
      a: [fact, v + (dv ? '\\div ' + N(dv) : '\\times ' + N(k)) + '=' + (exact ? '' : dots(w, dp + 2) + '\\approx ') + N(w, dp) + U(t)] };
  };

  /* ---------- Progressing: across the systems with a mixed measure, a chain, a map scale, an SI rate ---------- */
  const fi2m = (r) => {
    const F = r.int(4, 9), I = r.int(1, 11), inch = 12 * F + I, cm = inch * 2.54, dp = r.pick([2, 3]);
    if (bord(cm / 100, dp)) return null;
    return { text: 'Convert to metres, to ' + PL[dp] + '.', q: fi(F, I) + '\\approx\\ ?' + U('m'),
      a: [F + '\\times 12+' + I + '=' + inch + U('in'), inch + '\\times 2.54=' + N(cm) + U('cm') + '=' + N(cm / 100) + U('m') + (Math.abs(cm * 10 ** (dp - 2) - Math.round(cm * 10 ** (dp - 2))) < 1e-9 ? '' : '\\approx ' + N(cm / 100, dp) + U('m'))] };
  };
  const m2fi = (r) => {
    const X = r.int(150, 360) / 100, ex = X * 100 / 2.54, inch = Math.round(ex);
    if (bord(ex, 0) || inch % 12 === 0) return null;
    return { text: 'Convert to feet and inches, to the nearest inch.', q: N(X, 2) + U('m') + '\\approx\\ ?' + U('ft') + '\\ ?' + U('in'),
      a: [N(X, 2) + U('m') + '=' + N(X * 100) + U('cm'), N(X * 100) + '\\div 2.54=' + dots(ex, 3) + '\\approx ' + inch + U('in'), inch + '\\div 12=' + Math.floor(inch / 12) + '\\text{ R }' + (inch % 12) + '\\ \\Rightarrow\\ ' + fi(Math.floor(inch / 12), inch % 12)] };
  };
  const chainQ = (r) => { // imperial chain with unit analysis
    const t = r.pick([['mi', 'in', [5280, 'ft', 'mi'], [12, 'in', 'ft']], ['mi', 'ft', [1760, 'yd', 'mi'], [3, 'ft', 'yd']], ['yd', 'in', [3, 'ft', 'yd'], [12, 'in', 'ft']]]);
    const v = t[0] === 'mi' ? r.pick([0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 1.5, 2.5, 0.25, 0.75, 1.25]) : r.int(14, 95), [f1, u1, d1] = t[2], [f2, u2, d2] = t[3], w = v * f1 * f2;
    if (t[0] === 'mi' && t[1] === 'ft' && v === 0.25) return null;
    return { text: 'Convert with unit analysis. Show the units cancelling.', q: N(v) + U(t[0]) + '=\\ ?' + U(t[1]),
      a: ['\\dfrac{' + N(v) + U(t[0]) + '}{1}\\times\\dfrac{' + f1 + U(u1) + '}{1' + U(d1) + '}\\times\\dfrac{' + f2 + U(u2) + '}{1' + U(d2) + '}', '=' + N(v) + '\\times ' + f1 + '\\times ' + f2 + '=' + N(w) + U(t[1])] };
  };
  const SCALES = [25000, 50000, 100000, 200000, 250000, 500000, 1000000];
  const mapQ = (r) => {
    const n = r.pick(SCALES), d = r.int(15, 240) / 10, cm = d * n, km = cm / 100000;
    if (km > 2500) return null;
    return { text: `A map has a scale of 1&#8202;:&#8202;${H(n)}. Two towns are ${H(d, 1)} cm apart on the map. How far apart are they on the ground, in kilometres?`, q: '1:' + N(n) + ',\\quad ' + N(d, 1) + U('cm') + '\\to\\ ?' + U('km'),
      a: [N(d, 1) + '\\times ' + N(n) + '=' + N(cm) + U('cm'), N(cm) + U('cm') + '\\times\\dfrac{1\\text{ m}}{100\\text{ cm}}\\times\\dfrac{1\\text{ km}}{1000\\text{ m}}=' + N(km) + U('km')] };
  };
  const rateSI = (r) => {
    if (r.chance(0.5)) { const v = r.int(4, 45), w = v * 3.6; return { text: 'Convert the speed with unit analysis.', q: v + '\\ \\text{m/s}=\\ ?\\ \\text{km/h}',
      a: ['\\dfrac{' + v + '\\text{ m}}{\\text{s}}\\times\\dfrac{1\\text{ km}}{1000\\text{ m}}\\times\\dfrac{3600\\text{ s}}{1\\text{ h}}', '=\\dfrac{' + v + '\\times 3600}{1000}=' + N(w) + '\\ \\text{km/h}'] }; }
    const v = r.int(3, 24) * 5, w = v / 3.6; if (bord(w, 1)) return null;
    return { text: 'Convert the speed with unit analysis, to the nearest tenth.', q: v + '\\ \\text{km/h}\\approx\\ ?\\ \\text{m/s}',
      a: ['\\dfrac{' + v + '\\text{ km}}{\\text{h}}\\times\\dfrac{1000\\text{ m}}{1\\text{ km}}\\times\\dfrac{1\\text{ h}}{3600\\text{ s}}', '=\\dfrac{' + N(v * 1000) + '}{3600}=' + dots(w, 3) + '\\approx ' + N(w, 1) + '\\ \\text{m/s}'] };
  };

  /* ---------- Mastery: a rate across the systems, a map scale backwards, which race is longer ---------- */
  const rateX = (r) => {
    const k = r.pick(['mph', 'mph', 'kmh']);
    if (k === 'mph') { const S = r.int(4, 16) * 5, w = S * 1609.3 / 3600; if (bord(w, 1)) return null;
      return { text: 'Convert the speed to metres per second, to the nearest tenth. (1 mi ≈ 1.6093 km)', q: S + '\\ \\text{mi/h}\\approx\\ ?\\ \\text{m/s}',
        a: ['\\dfrac{' + S + '\\text{ mi}}{\\text{h}}\\times\\dfrac{1.6093\\text{ km}}{1\\text{ mi}}\\times\\dfrac{1000\\text{ m}}{1\\text{ km}}\\times\\dfrac{1\\text{ h}}{3600\\text{ s}}', '=\\dfrac{' + S + '\\times 1609.3}{3600}=' + dots(w, 3) + '\\approx ' + N(w, 1) + '\\ \\text{m/s}'] }; }
    const S = r.int(6, 24) * 5, w = S * 1000 / 0.3048 / 3600; if (bord(w, 1)) return null;
    return { text: 'Convert the speed to feet per second, to the nearest tenth. (1 ft = 0.3048 m)', q: S + '\\ \\text{km/h}\\approx\\ ?\\ \\text{ft/s}',
      a: ['\\dfrac{' + S + '\\text{ km}}{\\text{h}}\\times\\dfrac{1000\\text{ m}}{1\\text{ km}}\\times\\dfrac{1\\text{ ft}}{0.3048\\text{ m}}\\times\\dfrac{1\\text{ h}}{3600\\text{ s}}', '=\\dfrac{' + N(S * 1000) + '}{0.3048\\times 3600}=' + dots(w, 3) + '\\approx ' + N(w, 1) + '\\ \\text{ft/s}'] };
  };
  const mapBack = (r) => {
    const n = r.pick(SCALES), D = r.int(4, 60) * (n >= 500000 ? 10 : n >= 100000 ? 2 : 0.5), cm = D * 100000, d = cm / n;
    if (d < 1 || d > 60 || bord(d, 1)) return null;
    const ex = Math.abs(d * 10 - Math.round(d * 10)) < 1e-9;
    return { text: `On a map with a scale of 1&#8202;:&#8202;${H(n)}, how far apart are two lakes that are ${H(D)} km apart on the ground? Answer in centimetres${ex ? '' : ', to the nearest tenth'}.`, q: '1:' + N(n) + ',\\quad ' + N(D) + U('km') + '\\to\\ ?' + U('cm'),
      a: [N(D) + U('km') + '=' + N(D) + '\\times 1000\\times 100=' + N(cm) + U('cm'), '\\dfrac{' + N(cm) + '}{' + N(n) + '}=' + (ex ? N(d) : dots(d, 3) + '\\approx ' + N(d, 1)) + U('cm')] };
  };
  const RACES = [ // [imperial value, unit, metres per unit, metric value (m), how to show it]
    [440, 'yd', 0.9144, 400, '400\\text{ m}'], [880, 'yd', 0.9144, 800, '800\\text{ m}'], [100, 'yd', 0.9144, 100, '100\\text{ m}'], [220, 'yd', 0.9144, 200, '200\\text{ m}'],
    [1, 'mi', 1609.3, 1500, '1500\\text{ m}'], [3, 'mi', 1609.3, 5000, '5\\text{ km}'], [6, 'mi', 1609.3, 10000, '10\\text{ km}'], [2, 'mi', 1609.3, 3000, '3\\text{ km}'],
    [13.1, 'mi', 1609.3, 21100, '21.1\\text{ km}'], [26.2, 'mi', 1609.3, 42200, '42.2\\text{ km}'], [5, 'mi', 1609.3, 8000, '8\\text{ km}'], [12, 'mi', 1609.3, 20000, '20\\text{ km}'],
    [100, 'ft', 0.3048, 30, '30\\text{ m}'], [50, 'yd', 0.9144, 45, '45\\text{ m}']];
  const raceQ = (r) => {
    const [v, u, k, M, mt] = r.pick(RACES), I = v * k, diff = Math.abs(I - M), dp = diff < 20 ? 1 : 0;
    if (bord(diff, dp)) return null;
    const fact = u === 'mi' ? '1\\text{ mi}\\approx 1.6093\\text{ km}' : u === 'yd' ? '1\\text{ yd}=0.9144\\text{ m}' : '1\\text{ ft}=0.3048\\text{ m}';
    return { text: `Which is longer, and by how many metres (to ${PL[dp]})?`, q: N(v) + U(u) + '\\quad\\text{or}\\quad ' + mt,
      a: [fact + ':\\quad ' + N(v) + U(u) + '=' + N(v) + '\\times ' + N(k) + '=' + N(I) + U('m'), (I > M ? N(v) + U(u) : mt) + '\\text{ is longer by }' + (Math.abs(diff * 10 ** dp - Math.round(diff * 10 ** dp)) < 1e-9 ? '' : dots(diff, dp + 2) + '\\approx ') + N(diff, dp) + U('m')] };
  };
  const ftinDiff = (r) => { // two heights in different systems: who is taller, by how many cm?
    const F = r.int(5, 6), I = r.int(0, 11), inch = 12 * F + I, cm = inch * 2.54, M = Math.round(cm + r.pick([-9, -7, -6, -5, -4, -3, 3, 4, 5, 6, 7, 9])) / 100, d = Math.abs(cm - M * 100);
    if (d < 1 || bord(d, 1)) return null;
    const [A, B] = r.shuffle(['Ava', 'Ben', 'Cam', 'Dana', 'Eli', 'Fay']).slice(0, 2);
    return { text: `${A} is ${F}&prime;${I}&Prime; tall. ${B} is ${H(M, 2)} m tall. Who is taller, and by how many centimetres (to the nearest tenth)?`, q: F + "'" + I + "''\\quad\\text{or}\\quad " + N(M, 2) + U('m'),
      a: [F + '\\times 12+' + I + '=' + inch + U('in'), inch + '\\times 2.54=' + N(cm) + U('cm') + '\\quad\\text{vs}\\quad ' + N(M * 100) + U('cm'), '\\text{' + (cm > M * 100 ? A : B) + ' is taller by }' + N(d, 1) + U('cm')] };
  };
  const lv = (list) => (r) => { for (;;) { const x = r.pick(list)(r); if (x) return x; } };
  standup('u10l2', {
    intro: 'Convert at your whiteboard station: write each conversion fraction so the unwanted unit cancels, and check the direction.',
    levels: { BEG: lv([siQ, mixQ, oneQ, oneQ]), PRG: lv([fi2m, m2fi, chainQ, mapQ, rateSI]), MAS: lv([rateX, mapBack, raceQ, ftinDiff]) }
  });
})();
