/* Math 10C · Unit 10 · Lesson 4B — Imperial Units and Converting Between Imperial and SI.
 * Warm-up race-to-scale bars, and the explainers:
 *   exact (exact factor vs rounded factor, digit by digit), bench (imperial units beside SI benchmarks; a balance for
 *   kg/lb), ladder (the imperial staircase: four multipliers, down = ×, up = ÷), mixed (unpack and pack mixed measures;
 *   Example 1 checks), twoways (proportions vs unit analysis; Example 2 check), chain (STAR: conversion factors snap
 *   onto a unit-analysis chain and their units cancel, beside a tape measure with inches and centimetres; Example 3
 *   and 4 checks), estimate (benchmark estimate vs exact on a number line; Example 5 checks), heights (growth chart
 *   in ft-in and m, dial scale in lb and kg; Example 6 checks), roundup (film cut into DVD loads; Example 7 check).
 * Colours: imperial amber, SI blue, cancelled units red, kept units green. */
import {
  h, tex, add, box, NumberLine, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween, svgEl, liveCtx,
  pulse, anim, COLORS
} from '../blocks.js';

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
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u10l4b-panel ' + cls, title ? `<div class="u10l4b-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u10l4b-line ' + cls, html); p.appendChild(d); return d; };
const hide = (el) => { el.style.opacity = 0; return el; };
const show = (c, el) => fadeIn(c, el, 320);
const say = async (c, p, html, cls) => { const d = hide(line(p, html, cls)); await show(c, d); return d; };
const sstamp = (host, text, ok = true, o = {}) => { const s = stamp(host, text, Object.assign({ ok }, o)); s.style.opacity = 0; return s; };

/* ---------------- fraction cards for unit analysis ---------------- */
/** a fraction card: top/bot = { n: TeX number, u: unit text } */
function fracEl(top, bot, cls = '') {
  const f = h('div', 'u10l4b-fr ' + cls);
  const mk = (p, c) => {
    const r = h('div', c);
    r.num = h('span', 'u10l4b-n', T(p.n)); r.appendChild(r.num);
    r.unit = null;
    if (p.u) { r.unit = h('span', 'u10l4b-u', p.u); r.appendChild(r.unit); }
    return r;
  };
  f.top = mk(top, 'u10l4b-ft'); f.bot = mk(bot, 'u10l4b-fb'); f.append(f.top, f.bot);
  return f;
}
const op = (s) => h('div', 'u10l4b-op', T(s));
/** snap a card onto the chain: it rises from the tray below and clicks into place */
const snap = (c, el) => anim(c, el, [{ opacity: 0, transform: 'translateY(120px) scale(.9) rotate(-6deg)' }, { opacity: 1, transform: 'translateY(-10px) scale(1.05) rotate(1deg)', offset: 0.75 }, { opacity: 1, transform: 'none' }], 700);
/** strike matching units: flash them, then a red slash through each */
async function cancelU(c, ...us) {
  us.forEach((u) => u.classList.add('u10l4b-match'));
  await sleep(c, 350);
  const sl = us.map((u) => { const s = h('i', 'u10l4b-slash'); u.appendChild(s); u.classList.remove('u10l4b-match'); u.classList.add('u10l4b-gone'); return s; });
  await Promise.all(sl.map((s) => anim(c, s, [{ transform: 'rotate(-28deg) scaleX(0)' }, { transform: 'rotate(-28deg) scaleX(1)' }], 380)));
}
const keep = (...us) => us.forEach((u) => u && u.classList.add('u10l4b-keep'));

/* ---------------- a tape measure: inches along the top edge, centimetres along the bottom ---------------- */
class Tape {
  constructor(host, o) {
    this.o = o; this.W = o.width; this.pad = 46;
    const el = this.el = add(host, box(h('div', 'u10l4b-tape'), o.width, 176), o.x, o.y);
    const svg = this.svg = svgEl('svg', { width: o.width, height: 176, viewBox: `0 0 ${o.width} 176` }, el);
    this.html = h('div', 'u10l4b-tapehtml'); el.appendChild(this.html);
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
      if (i % sub === 0 && v % lab === 0 && v > 0) svgEl('text', { x: x - 3, y: y0 + 40, class: 'u10l4b-tnum', 'text-anchor': 'end' }, svg).textContent = v;
      if (i % sub === 0 && v % 12 === 0 && v > 0 && o.maxIn >= 24) { const t = svgEl('text', { x: x + 3, y: y0 + 22, class: 'u10l4b-tft' }, svg); t.textContent = v / 12 + ' ft'; }
    }
    // centimetre ticks (bottom edge, pointing up)
    const maxCm = o.maxIn * 2.54, mm = this.ppc / 10 >= 4.5, cmOk = this.ppc >= 4.5;
    const clab = [1, 2, 5, 10, 20, 50].find((s) => s * this.ppc >= 34);
    for (let i = 0; i <= Math.floor(maxCm * (mm ? 10 : 1)); i++) {
      const v = mm ? i / 10 : i; if (!mm && !cmOk && v % 5) continue;
      const x = this.cx(v), whole = Math.abs(v - Math.round(v)) < 1e-9;
      const len = whole ? (Math.round(v) % 10 === 0 ? 26 : Math.round(v) % 5 === 0 ? 18 : 13) : (i % 5 === 0 ? 9 : 6);
      svgEl('line', { x1: x, x2: x, y1: y1 - len, y2: y1, stroke: '#173a8a', 'stroke-width': whole ? 1.4 : 0.9 }, svg);
      if (whole && Math.round(v) % clab === 0 && v > 0) svgEl('text', { x: x - 3, y: y1 - 30, class: 'u10l4b-tnum u10l4b-tcm', 'text-anchor': 'end' }, svg).textContent = Math.round(v);
    }
    svgEl('text', { x: L - 14, y: y0 + 22, class: 'u10l4b-tunit', 'text-anchor': 'end' }, svg).textContent = 'in';
    svgEl('text', { x: L - 14, y: y1 - 8, class: 'u10l4b-tunit u10l4b-tcm', 'text-anchor': 'end' }, svg).textContent = 'cm';
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
    const a = add(this.html, h('div', 'u10l4b-tread u10l4b-tri', inHtml), 0, 2), b = add(this.html, h('div', 'u10l4b-tread u10l4b-trc', cmHtml), 0, 144);
    for (const p of [a, b]) { p.style.left = Math.min(this.W - 190, Math.max(0, xi - 90)) + 'px'; p.style.width = '180px'; p.style.opacity = 0; }
    await pop(c, a); await pop(c, b);
    return g;
  }
}

/* =============================== warm-up: race them to scale =============================== */
function mountRace() {
  const btn = document.getElementById('u10l4b-race'), host = document.getElementById('u10l4b-lanes');
  if (!btn || !host) return;
  const races = [{ n: 'A', name: 'The Mile', m: 1609.344, lab: '1 mi ≈ 1609 m', cls: 'u10l4b-ba' }, { n: 'B', name: 'The 1500 m', m: 1500, lab: '1500 m', cls: 'u10l4b-bb' }, { n: 'C', name: '5000 ft hill climb', m: 1524, lab: '5000 ft = 1524 m', cls: 'u10l4b-bc' }];
  const MAX = 1700;
  let on = false;
  const c = liveCtx();
  btn.addEventListener('click', async () => {
    if (on) { host.innerHTML = ''; on = false; btn.textContent = 'Race them to scale'; return; }
    on = true; btn.textContent = 'Hide the race';
    host.innerHTML = '';
    const axis = h('div', 'u10l4b-axis');
    for (let m = 0; m <= MAX; m += 100) { const t = h('div', 'u10l4b-axt' + (m % 500 ? '' : ' u10l4b-axt5'), m % 500 ? '' : hn(m) + ' m'); t.style.left = (m / MAX * 100) + '%'; axis.appendChild(t); }
    const bars = races.map((r) => {
      const ln = h('div', 'u10l4b-lane', `<div class="u10l4b-lname"><b>${r.n}</b> ${r.name}</div>`);
      const track = h('div', 'u10l4b-ltrack'), bar = h('div', 'u10l4b-bar ' + r.cls, `<span>${r.lab}</span>`);
      bar.style.width = (r.m / MAX * 100) + '%'; track.appendChild(bar); ln.appendChild(track); host.appendChild(ln);
      return bar;
    });
    const at = h('div', 'u10l4b-lane'); at.appendChild(h('div', 'u10l4b-lname', '')); const tr = h('div', 'u10l4b-ltrack u10l4b-axrow'); tr.appendChild(axis); at.appendChild(tr); host.appendChild(at);
    await Promise.all(bars.map((b, i) => c.anim(b, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 2400 * races[i].m / 1609, { easing: 'linear' })));
    if (on) { const w = h('div', 'u10l4b-win', 'The mile wins: about 85 m ahead of the 5000 ft climb and 109 m ahead of the 1500 m.'); host.appendChild(w); c.fadeIn(w); }
  });
}

/* =============================== explainer: use the exact factor =============================== */
const EXA = {
  cm: { label: 'Example 4(b) numbers: 315 cm → in', v: 315, from: 'cm', to: 'in', dp: 4,
    ex: { fact: '1\\text{ in}=2.54\\text{ cm}', tag: 'exact', op: '\\div', k: 2.54, scr: '124.015748' },
    rd: { fact: '1\\text{ cm}\\approx0.3937\\text{ in}', tag: 'rounded', op: '\\times', k: 0.3937, scr: '124.0155' },
    rA: '124.0157', rB: '124.0155', why: 'to four decimal places', key: 'At the nearest inch both say 124, but a key written to four decimals says 124.0157.' },
  ft: { label: 'Example 7 numbers: 1650 m → ft', v: 1650, from: 'm', to: 'ft', dp: 2,
    ex: { fact: '1\\text{ ft}=0.3048\\text{ m}', tag: 'exact', op: '\\div', k: 0.3048, scr: '5413.385827' },
    rd: { fact: '1\\text{ m}\\approx3.2808\\text{ ft}', tag: 'rounded', op: '\\times', k: 3.2808, scr: '5413.32' },
    rA: '5413.39', rB: '5413.32', why: 'to two decimal places', key: 'Even the tenths differ: 5413.4 vs 5413.3. The key uses the exact factor.' }
};
function screen(p, digits, label) {
  const s = h('div', 'u10l4b-scr'); s.appendChild(h('div', 'u10l4b-scrl', label));
  const d = h('div', 'u10l4b-scrd'); [...digits].forEach((ch) => d.appendChild(h('i', 'u10l4b-dg', ch))); s.appendChild(d); s.digits = [...d.children];
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
    const top = add(stage, box(h('div', 'u10l4b-qbar', `Convert <b>${hn(d.v)} ${d.from}</b> to <b>${d.to}</b>.`), ex.W - 36, 46), 18, 14);
    const A = panel(stage, 18, 74, PW, H - 92, `${T(d.ex.fact)} <span class="u10l4b-tag u10l4b-tagx">${d.ex.tag}</span>`, 'u10l4b-pA');
    const B = panel(stage, 36 + PW, 74, PW, H - 92, `${T(d.rd.fact)} <span class="u10l4b-tag">${d.rd.tag}</span>`, 'u10l4b-pB');
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
            for (const e of [a, b]) if (e) { e.classList.add(same ? 'u10l4b-same' : 'u10l4b-diff'); }
          }
          await Promise.all([pulse(c, sA, 1.05), pulse(c, sB, 1.05)]);
        } },
      { cap: `Rounded ${d.why}: <b>${d.rA}</b> vs <b>${d.rB}</b>. ${d.key}`,
        run: async (c) => {
          await say(c, A, T(`\\approx ${tn(+d.rA, d.dp)}${U(d.to)}`), 'u10l4b-big');
          await say(c, B, T(`\\approx ${tn(+d.rB, d.dp)}${U(d.to)}`), 'u10l4b-big u10l4b-off');
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
    const e = add(stage, box(h('div', 'u10l4b-bimp' + (part ? ' u10l4b-part' : ''), part ? T(tn(nImp - i, 4).replace(/0+$/, '')) : (w > 50 ? T('1' + U(d.imp)) : '')), w, 46), x0 + i * impW, yI);
    e.part = part; imp.push(hide(e));
  }
  for (let i = 0; i < Math.ceil(nSi - 1e-9); i++) {
    const w = Math.min(1, nSi - i) * ppu, part = nSi - i < 1 - 1e-9;
    const txt = part ? (w > 34 ? T(String(parseFloat((nSi - i).toFixed(4)))) : '') : (w > 44 ? T('1' + U(d.si)) : w > 15 && ((i + 1) % 5 === 0 || i === 0) ? `<small>${i + 1}</small>` : '');
    const e = add(stage, box(h('div', 'u10l4b-bsi' + (i % 2 ? ' u10l4b-alt' : '') + (part ? ' u10l4b-part' : ''), txt), w, 46), x0 + i * ppu, yS);
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
  if (text) { const t = svgEl('text', { x, y: y - hh / 2 + 6, 'text-anchor': 'middle', class: 'u10l4b-wt' }, e); t.textContent = text; }
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
          run: async (c) => { await appear(c, lb3); await tip(c, -3, 0); await say(c, P, T('1\\text{ kg}\\approx2.2\\text{ lb}'), 'u10l4b-big'); } },
        { cap: 'The kilogram is the <b>heavier</b> unit. kg → lb: <b>multiply</b> by 2.2 (the number gets bigger). lb → kg: <b>divide</b> by 2.2 (the number gets smaller).',
          run: async (c) => { await say(c, P, `kg → lb: ${T('\\times2.2')}`, 'u10l4b-imp'); await say(c, P, `lb → kg: ${T('\\div2.2')}`, 'u10l4b-si'); const s = sstamp(P, 'fewer kg than lb'); await stampIn(c, s); } }
      ];
    }
    const x0 = 60, yI = 96, yS = 168;
    let B = bars(stage, d, d.n, d.ppu, x0, yI, yS);
    const lab = (y, t, cls) => add(stage, h('div', 'u10l4b-rowlab ' + cls, t), 6, y + 10);
    const lI = hide(lab(yI, d.imp, 'u10l4b-imp')), lS = hide(lab(yS, d.si, 'u10l4b-si'));
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
        run: async (c) => { await say(c, P, `${T(d.fact)}${d.L === 1.609344 ? '' : ' <span class="u10l4b-tag u10l4b-tagx">exact</span>'}`, 'u10l4b-big'); await say(c, P, `Benchmark: ${T(d.bench)}`, 'u10l4b-bmk'); } },
      { cap: d.dir, run: async (c) => { await say(c, P, d.dir); } }
    ];
    if (d.five) steps.push({ cap: 'Scale it up: <b>5 mi ≈ 8 km</b> (more precisely, about 8.05 km). Worth memorizing.',
      run: async (c) => {
        [...B.imp, ...B.si].forEach((e) => e.remove());
        B = bars(stage, d, 5, 108, x0, yI, yS);
        for (const e of B.imp) await anim(c, e, [{ opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left' }, { opacity: 1, transform: 'scaleX(1)', transformOrigin: 'left' }], 260);
        for (const e of B.si) await anim(c, e, [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], 160);
        await say(c, P, T('5\\text{ mi}\\approx8\\text{ km}'), 'u10l4b-bmk');
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
  for (const [id, col] of [['u10l4b-ah', IMP], ['u10l4b-ahp', COLORS.purple]]) {
    const m = svgEl('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs);
    svgEl('path', { d: 'M0 0 L10 5 L0 10 z', fill: col }, m);
  }
  const pts = ['mi', 'yd', 'ft', 'in'].map((u) => STEPS[u]);
  let d = `M${pts[0][0] - 10} ${pts[0][1] + bh + 6}`;
  pts.forEach((p, i) => { d += ` H${i < 3 ? pts[i + 1][0] - 10 : p[0] + bw + 10}`; if (i < 3) d += ` V${pts[i + 1][1] + bh + 6}`; });
  svgEl('path', { d, fill: 'none', stroke: '#d6d0bf', 'stroke-width': 6, 'stroke-linejoin': 'round' }, svg);
  const names = { mi: 'mile', yd: 'yard', ft: 'foot', in: 'inch' };
  for (const u in STEPS) {
    const [x, y] = STEPS[u], n = add(stage, box(h('div', 'u10l4b-step', `<div class="u10l4b-stepn"><b>${u}</b> <small>${names[u]}</small></div>`), bw, bh), x, y);
    n.val = h('div', 'u10l4b-stepv'); n.appendChild(n.val); nodes[u] = n;
  }
  const arrows = {};
  [['mi', 'yd', '1760'], ['yd', 'ft', '3'], ['ft', 'in', '12']].forEach(([a, b, k]) => {
    const [x1, y1] = STEPS[a], [x2, y2] = STEPS[b];
    arrows[a + b] = svgEl('path', { d: `M${x1 + bw + 6} ${y1 + bh / 2} C${x2 + 40} ${y1 + bh / 2} ${x2 + bw / 2} ${y1 + bh / 2} ${x2 + bw / 2} ${y2 - 6}`, fill: 'none', stroke: IMP, 'stroke-width': 3, 'marker-end': 'url(#u10l4b-ah)' }, svg);
    add(stage, h('div', 'u10l4b-mult', T(`\\times${k}`) + ' <small>/ ' + T(`\\div${k}`) + '</small>'), x2 + bw / 2 + 12, y2 - 40);
  });
  const sc = svgEl('path', { d: `M${STEPS.mi[0] + 90} ${STEPS.mi[1] + bh + 6} C110 330 330 240 ${STEPS.ft[0] - 8} ${STEPS.ft[1] + bh / 2}`, fill: 'none', stroke: COLORS.purple, 'stroke-width': 3, 'stroke-dasharray': '9 6', 'marker-end': 'url(#u10l4b-ahp)' }, svg);
  add(stage, h('div', 'u10l4b-mult u10l4b-multp', T('\\times5280') + ' <small>/ ' + T('\\div5280') + '</small>'), 14, 236);
  add(stage, h('div', 'u10l4b-dirtag', '<b>down</b> (smaller unit): multiply · <b>up</b> (bigger unit): divide'), 30, 384);
  return { nodes, arrows, sc, bw, bh };
}
/** light a path, then show the value in the step box it reaches */
async function reach(c, S, path, u, html, from) {
  if (from) S.nodes[from].classList.replace('u10l4b-on', 'u10l4b-was');
  if (path) await anim(c, path, [{ strokeWidth: 3 }, { strokeWidth: 9 }, { strokeWidth: 4 }], 650);
  const n = S.nodes[u]; n.classList.remove('u10l4b-was'); n.classList.add('u10l4b-on'); n.val.innerHTML = html; await pop(c, n.val);
}
const ladder = {
  title: 'The imperial staircase: four multipliers',
  height: 446,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(LAD).map((k) => ({ v: k, label: LAD[k].label })),
  intro: 'Each step down the staircase is a smaller unit, with its own multiplier. Press <b>Next</b>.',
  make(stage, k, ex) {
    const S = staircase(stage, ex.W), A = S.arrows;
    const P = panel(stage, ex.W - 290, 16, 282, 190, 'Work', 'u10l4b-pnar');
    if (k === 'down') return [
      { cap: 'Going <b>down</b> the stairs (to a smaller unit) means <b>multiply</b>: more of the smaller units fit.',
        run: async (c) => { await reach(c, S, null, 'mi', T(q(2, 'mi'))); await say(c, P, T('2\\text{ mi}\\to\\ ?\\text{ in}')); } },
      { cap: `Fact: 1 mi = 5280 ft. Take the shortcut: ${T('2\\times5280=10\\,560')} ft.`,
        run: async (c) => { await reach(c, S, S.sc, 'ft', T(q(10560, 'ft')), 'mi'); await say(c, P, T('2\\times5280=10\\,560\\text{ ft}')); } },
      { cap: `Fact: 1 ft = 12 in. ${T('10\\,560\\times12=126\\,720')} in.`,
        run: async (c) => { await reach(c, S, A.ftin, 'in', T(q(126720, 'in')), 'ft'); await say(c, P, T('10\\,560\\times12=126\\,720\\text{ in}'), 'u10l4b-big'); } },
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
        run: async (c) => { await reach(c, S, S.sc, 'mi', T(q(1.5, 'mi')), 'ft'); await say(c, P, T('7920\\div5280=1.5\\text{ mi}'), 'u10l4b-big'); } },
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
  a: { label: 'Example 1(a)', pack: false, big: 'ft', small: 'in', k: 12, qq: 8, r: 5 },
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
  choices: [{ sep: 'Example 1 check:' }, ...Object.keys(MIX).map((k) => ({ v: k, label: MIX[k].label }))],
  intro: 'A mixed measure is whole big units plus some small ones. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = MIX[key], x0 = 40, wid = ex.W - 80, sc = wid / d.total, bw = d.k * sc, y = 120;
    const head = add(stage, box(h('div', 'u10l4b-qbar', d.pack ? `Convert <b>${hn(d.total)} ${d.small}</b> to ${d.big} and ${d.small}.` : `Convert <b>${d.qq} ${d.big} ${hn(d.r)} ${d.small}</b> to ${d.small}.`), ex.W - 36, 46), 18, 14);
    head.style.opacity = 1;
    const P = panel(stage, 40, 292, ex.W - 80, 166, 'Work'), stX = ex.W - 80 - 150;
    const blocks = [], labs = [];
    for (let i = 0; i < d.qq; i++) {
      const b = hide(add(stage, box(h('div', 'u10l4b-blk' + (i % 2 ? ' u10l4b-alt' : ''), bw > 46 ? T('1' + U(d.big)) : bw > 18 ? `<small>${i + 1}</small>` : ''), bw, 56), x0 + i * bw, y));
      blocks.push(b);
    }
    const rest = hide(add(stage, box(h('div', 'u10l4b-blk u10l4b-rest', d.r * sc > 50 ? T(hn(d.r) + U(d.small)) : ''), d.r * sc, 56), x0 + d.qq * bw, y));
    const brace = (from, to, html, below = true) => { to = Math.min(to, ex.W - 8); const e = hide(add(stage, box(h('div', 'u10l4b-brace' + (below ? '' : ' u10l4b-brup'), html), to - from, 22), from, below ? y + 62 : y - 28)); return e; };
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
            const br = hide(add(stage, box(h('div', 'u10l4b-brace u10l4b-brall', T(`${tn(d.total)}${U(d.small)}`)), d.qq * bw + d.r * sc, 22), x0, y + 112)); await appear(c, br);
            await say(c, P, T(`${tn(d.qq * d.k)}+${tn(d.r)}=${tn(d.total)}${U(d.small)}`), 'u10l4b-big');
            const s = sstamp(P, `${hn(d.total)} ${d.small}`, true, { x: stX, y: 92 }); await stampIn(c, s);
          } }
      ];
    }
    // pack: one long bar, cut into big units
    const long = hide(add(stage, box(h('div', 'u10l4b-long', T(tn(d.total) + U(d.small))), wid, 56), x0, y));
    const tsvg = add(stage, svgEl('svg', { width: wid, height: 56, viewBox: `0 0 ${wid} 56` }), x0, y);
    if (sc >= 4) for (let i = 1; i < d.total; i++) svgEl('line', { x1: i * sc, x2: i * sc, y1: 0, y2: 10, stroke: INK, 'stroke-width': 1 }, tsvg);
    tsvg.style.opacity = 0;
    [...blocks, rest].forEach((b) => stage.appendChild(b));
    return [
      { cap: `${hn(d.total)} ${d.small} in one long piece. How many whole ${d.big === 'ft' ? 'feet' : d.big === 'yd' ? 'yards' : 'miles'} are in it?`,
        run: async (c) => { await anim(c, long, [{ opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left' }, { opacity: 1, transform: 'scaleX(1)', transformOrigin: 'left' }], 700); await appear(c, tsvg); } },
      { cap: `Fact: 1 ${d.big} = ${hn(d.k)} ${d.small}. Cut off ${hn(d.k)} ${d.small} at a time: <b>${d.qq}</b> whole ${d.big === 'ft' ? 'feet' : d.big === 'yd' ? 'yards' : 'miles'} fit.`,
        run: async (c) => {
          long.innerHTML = ''; long.classList.add('u10l4b-longc');
          const ms = d.qq > 10 ? 45 : 260;
          for (const b of blocks) await anim(c, b, [{ opacity: 0, transform: 'scaleY(.2)' }, { opacity: 1, transform: 'none' }], ms);
          await say(c, P, `Fact: ${T(`1${U(d.big)}=${tn(d.k)}${U(d.small)}`)}`);
        } },
      { cap: `That is a division with a remainder: ${T(`${tn(d.total)}\\div${tn(d.k)}=${d.qq}`)} remainder <b>${hn(d.r)}</b> (${T(`${d.qq}\\times${tn(d.k)}=${tn(d.qq * d.k)}`)}, and ${T(`${tn(d.total)}-${tn(d.qq * d.k)}=${tn(d.r)}`)}).`,
        run: async (c) => {
          await anim(c, rest, [{ opacity: 0 }, { opacity: 1 }], 300); await pulse(c, rest, 1.1);
          const br = brace(x0, x0 + d.qq * bw, T(`${d.qq}${U(d.big)}`)); await appear(c, br);
          const br2 = brace(x0 + d.qq * bw - (d.r * sc < 70 ? 40 : 0), x0 + d.qq * bw + d.r * sc + (d.r * sc < 70 ? 40 : 0), T(`${tn(d.r)}${U(d.small)}`), false); br2.classList.add('u10l4b-brrest'); await appear(c, br2);
          await say(c, P, T(`${tn(d.total)}\\div${tn(d.k)}=${d.qq}\\ \\text{remainder}\\ ${tn(d.r)}`));
          await say(c, P, `Calculator: ${T(`${tn(d.total)}\\div${tn(d.k)}=${tn(d.total / d.k, 4)}\\ldots`)}, so ${d.qq} whole; ${T(`${tn(d.total)}-${d.qq}\\times${tn(d.k)}=${tn(d.r)}`)}`, 'u10l4b-sm');
        } },
      { cap: `So ${hn(d.total)} ${d.small} = <b>${d.qq} ${d.big} ${hn(d.r)} ${d.small}</b>. The remainder is always smaller than ${hn(d.k)}.`,
        run: async (c) => { await say(c, P, T(`${tn(d.total)}${U(d.small)}=${d.qq}${U(d.big)}\\ ${tn(d.r)}${U(d.small)}`), 'u10l4b-big'); const s = sstamp(P, `${d.qq} ${d.big} ${hn(d.r)} ${d.small}`, true, { x: stX, y: 60 }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: one chain, two methods =============================== */
const TWO = {
  yd: { label: '2.5 yd → in', v: 2.5, u: ['yd', 'ft', 'in'], k: [3, 12] },
  ex2: { label: 'Example 2 check: 0.6 mi → in', v: 0.6, u: ['mi', 'ft', 'in'], k: [5280, 12] }
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
    const route = add(stage, h('div', 'u10l4b-route', `<span class="u10l4b-ru">${tn(d.v)} ${u0}</span><span class="u10l4b-ra">${T('\\times' + tn(d.k[0]))}</span><span class="u10l4b-ru">${u1}</span><span class="u10l4b-ra">${T('\\times' + tn(d.k[1]))}</span><span class="u10l4b-ru">${u2}</span>`), 18, 12);
    route.style.opacity = 0;
    const L = panel(stage, 18, 70, PW, H - 86, 'Proportional reasoning', 'u10l4b-pbig'), R = panel(stage, 36 + PW, 70, PR, H - 86, 'Unit analysis', 'u10l4b-pbig');
    const row = h('div', 'u10l4b-chain u10l4b-chsm'); R.appendChild(row);
    const f0 = fracEl({ n: tn(d.v), u: u0 }, { n: '1' }), f1 = fracEl({ n: tn(d.k[0]), u: u1 }, { n: '1', u: u0 }), f2 = fracEl({ n: tn(d.k[1]), u: u2 }, { n: '1', u: u1 });
    const o1 = op('\\times'), o2 = op('\\times');
    [f0, o1, f1, o2, f2].forEach((e) => { row.appendChild(e); hide(e); });
    let sL;
    return [
      { cap: `Route: ${u0} → ${u1} → ${u2}. Two facts: 1 ${u0} = ${hn(d.k[0])} ${u1}, and 1 ${u1} = ${hn(d.k[1])} ${u2}.`,
        run: async (c) => { await show(c, route); } },
      { cap: `<b>Proportion 1</b> (${u0} to ${u1}): the fact on one side, the question on the other. ${T(`x=${tn(d.v)}\\times${tn(d.k[0])}=${tn(d.m1)}`)} ${u1}.`,
        run: async (c) => {
          await say(c, L, T(`\\dfrac{1${U(u0)}}{${tn(d.k[0])}${U(u1)}}=\\dfrac{${tn(d.v)}${U(u0)}}{x}`), 'u10l4b-frl');
          await say(c, L, T(`x=${tn(d.v)}\\times${tn(d.k[0])}=${tn(d.m1)}${U(u1)}`));
        } },
      { cap: `<b>Proportion 2</b> (${u1} to ${u2}) uses the answer from proportion 1: ${T(`y=${tn(d.m1)}\\times${tn(d.k[1])}=${tn(d.m2)}`)} ${u2}.`,
        run: async (c) => {
          await say(c, L, T(`\\dfrac{1${U(u1)}}{${tn(d.k[1])}${U(u2)}}=\\dfrac{${tn(d.m1)}${U(u1)}}{y}`), 'u10l4b-frl');
          sL = await say(c, L, T(`y=${tn(d.m2)}${U(u2)}`), 'u10l4b-big');
        } },
      { cap: `<b>Unit analysis:</b> start with ${hn(d.v)} ${u0} over 1, then snap on both factors, each with the unit to get rid of on the <b>bottom</b>.`,
        run: async (c) => { await show(c, f0); for (const e of [o1, f1, o2, f2]) { if (e.classList.contains('u10l4b-op')) await appear(c, e); else await snap(c, e); } } },
      { cap: `${u0} cancels, then ${u1} cancels. Only <b>${u2}</b> is left: the unit we want.`,
        run: async (c) => { await cancelU(c, f0.top.unit, f1.bot.unit); await cancelU(c, f1.top.unit, f2.bot.unit); keep(f2.top.unit); } },
      { cap: `Multiply the tops: ${T(`${tn(d.v)}\\times${tn(d.k[0])}\\times${tn(d.k[1])}=${tn(d.m2)}`)} ${u2}. <b>Both methods agree.</b>`,
        run: async (c) => {
          await say(c, R, T(`=${tn(d.v)}\\times${tn(d.k[0])}\\times${tn(d.k[1])}`));
          await say(c, R, T(`=${tn(d.m2)}${U(u2)}`), 'u10l4b-big');
          const s1 = sstamp(L, `${hn(d.m2)} ${u2}`); const s2 = sstamp(R, `${hn(d.m2)} ${u2}`); await stampIn(c, s1); await stampIn(c, s2);
        } }
    ];
  }
};

/* =============================== explainer: STAR, snap on a factor, cancel a unit =============================== */
const CH = {
  ft: { label: '1 ft → cm', maxIn: 14 },
  ex3: { label: 'Example 3 check: 1 m → in', maxIn: 42 },
  ex4a: { label: 'Example 4(a) check', maxIn: 90 },
  ex4b: { label: 'Example 4(b) check', maxIn: 130 }
};
const chain = {
  title: 'Unit analysis: snap on a factor, cancel a unit',
  height: 450,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(CH).map((k) => ({ v: k, label: CH[k].label })),
  intro: 'Each conversion factor is worth 1. Choose it so the unit you want gone is on the bottom. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CH[k], W = ex.W;
    const row = add(stage, h('div', 'u10l4b-chain'), 24, 22);
    const tray = add(stage, box(h('div', 'u10l4b-tray', 'conversion factors'), W - 48, 50), 24, 196);
    const res = add(stage, box(h('div', 'u10l4b-res'), W - 48, 50), 24, 196); res.style.opacity = 0;
    const tape = new Tape(stage, { x: 10, y: 262, width: W - 20, maxIn: d.maxIn }); tape.el.style.opacity = 0;
    const put = (...els) => els.forEach((e) => { row.appendChild(e); hide(e); });
    const result = async (c, html) => { tray.style.opacity = 0; res.innerHTML = html; await show(c, res); };
    const tapeIn = (c) => appear(c, tape.el, 400);
    if (k === 'ft') {
      const f0 = fracEl({ n: '1', u: 'ft' }, { n: '1' }), f1 = fracEl({ n: '12', u: 'in' }, { n: '1', u: 'ft' }), f2 = fracEl({ n: '2.54', u: 'cm' }, { n: '1', u: 'in' });
      const o1 = op('\\times'), o2 = op('\\times'), eq = op('='), ans = h('div', 'u10l4b-ansq', T(q(30.48, 'cm')));
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
      const o1 = op('\\cdot'), eq = op('='), ans = h('div', 'u10l4b-ansq', T('39.37\\,\\dfrac{\\text{in}}{\\text{m}}'));
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
      const o1 = op('\\times'), o2 = op('\\times'), eq = op('='), ans = h('div', 'u10l4b-ansq', T(q(2.0574, 'm')));
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
    const o1 = op('\\times'), o2 = op('\\times'), eq = op('='), ans = h('div', 'u10l4b-ansq', T('124.0157\\ldots\\text{ in}'));
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
  a: { label: 'Example 5(a)', min: 1.5, max: 2.0, step: 0.05, labs: [1.5, 1.6, 1.7, 1.8, 1.9, 2.0], dp: 2, unit: 'm',
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
  choices: [{ sep: 'Example 5 check:' }, ...Object.keys(EST).map((k) => ({ v: k, label: EST[k].label }))],
  intro: 'A benchmark estimate tells you roughly where the answer should land. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = EST[k], W = ex.W, PW = (W - 54) / 2;
    const head = add(stage, box(h('div', 'u10l4b-qbar', `${d.q} Benchmark: ${T(d.bench)}`), W - 36, 46), 18, 12); head.style.opacity = 1;
    const A = panel(stage, 18, 70, PW, 180, 'Estimate (mental math)', 'u10l4b-pE'), B = panel(stage, 36 + PW, 70, PW, 180, 'Exact (calculator)', 'u10l4b-pX');
    const NL = new NumberLine(stage, { x: 30, y: 290, width: W - 60, height: 130, min: d.min, max: d.max, step: d.step, labels: d.labs.map((v, i) => ({ v, html: T((d.dp === 2 ? v.toFixed(1) : String(v)) + (i === d.labs.length - 1 ? U(d.unit) : '')) })) });
    const pt = (v, color, html, pos = 'n') => { const p = NL.point(v, { color }); const m = NL.mark(v, html, { pos }); p.style.opacity = 0; m.style.opacity = 0; return [p, m]; };
    const reveal = async (c, [p, m]) => { await pop(c, p); await pop(c, m); };
    if (d.wrong) {
      return [
        { cap: '<b>Direction first.</b> A kilogram is <b>heavier</b> than a pound (1 kg ≈ 2.2 lb), so there must be <b>fewer</b> kilograms than pounds: the answer is less than 150.',
          run: async (c) => { await NL.drawIn(NL.interval(0, 150, { color: GRN }), 700, c); await say(c, A, 'kg is the bigger unit, so the number must be <b>smaller than 150</b>'); } },
        { cap: '330 kg is <b>bigger</b> than 150: impossible. 330 is what you get by <b>multiplying</b> by 2.2 instead of dividing.',
          run: async (c) => { const w = pt(330, RED, '<b class="u10l4b-red">330 ✗</b>'); await reveal(c, w); await say(c, B, `${T('150\\times2.2=330')}: the wrong way`, 'u10l4b-off'); } },
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
  a: { label: 'Example 6(a)', who: 'Wayne Gretzky', ft: 6, inch: 0 },
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
  choices: [{ sep: 'Example 6 check:' }, ...Object.keys(HT).map((k) => ({ v: k, label: HT[k].label }))],
  intro: 'Read the same height (or mass) on an imperial scale and an SI scale. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = HT[k], H = ex.def.height, W = ex.W;
    const P = panel(stage, W - 306, 20, 296, H - 40, d.who ? d.who : 'a ' + d.what);
    if (d.who) {
      const svg = add(stage, svgEl('svg', { width: 560, height: H, viewBox: `0 0 560 ${H}` }), 10, 0);
      const floor = H - 34, top = 30, ppi = (floor - top) / 96, sx = 130;
      svgEl('rect', { x: sx, y: top, width: 70, height: floor - top, fill: '#fffaf0', stroke: '#c9c3b2' }, svg);
      for (let i = 0; i <= 96; i++) { const y = floor - i * ppi, L = i % 12 === 0 ? 26 : i % 6 === 0 ? 16 : 8; svgEl('line', { x1: sx, x2: sx + L, y1: y, y2: y, stroke: IMP, 'stroke-width': i % 12 ? 1 : 2 }, svg); if (i % 12 === 0 && i) { const t = svgEl('text', { x: sx - 8, y: y + 6, 'text-anchor': 'end', class: 'u10l4b-gimp' }, svg); t.textContent = i / 12 + ' ft'; } }
      const ppc = ppi / 2.54;
      for (let cm = 0; cm <= 96 * 2.54; cm += 10) { const y = floor - cm * ppc, L = cm % 50 === 0 ? 26 : 14; svgEl('line', { x1: sx + 70 - L, x2: sx + 70, y1: y, y2: y, stroke: SI, 'stroke-width': cm % 50 ? 1 : 2 }, svg); if (cm % 50 === 0 && cm) { const t = svgEl('text', { x: sx + 78, y: y + 6, class: 'u10l4b-gsi' }, svg); t.textContent = (cm / 100).toFixed(1) + ' m'; } }
      svgEl('line', { x1: 20, x2: 550, y1: floor, y2: floor, stroke: INK, 'stroke-width': 2 }, svg);
      const others = Object.values(HT).filter((o) => o.who && o !== d);
      others.forEach((o, i) => { const hi = o.ft * 12 + o.inch, ox = 290 + i * 105; person(svg, ox, floor, hi * ppi, '#c9ccd3', 0.7); const t = svgEl('text', { x: ox, y: floor + 20, 'text-anchor': 'middle', class: 'u10l4b-gname' }, svg); t.textContent = o.who.split(' ').pop(); });
      const inches = d.ft * 12 + d.inch, cm = inches * 2.54, m = cm / 100, hpx = inches * ppi, yH = floor - hpx;
      const me = person(svg, 500, floor, hpx, IMP);
      const myn = svgEl('text', { x: 500, y: floor + 20, 'text-anchor': 'middle', class: 'u10l4b-gname u10l4b-gme' }, svg); myn.textContent = d.who.split(' ').pop(); me.style.transform = 'scaleY(0)';
      const hl = svgEl('line', { x1: sx - 4, x2: 500, y1: yH, y2: yH, stroke: RED, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }, svg); hl.style.opacity = 0;
      const pI = hide(add(stage, h('div', 'u10l4b-hread u10l4b-imp', T(`${d.ft}'${d.inch}''=${inches}\\text{ in}`)), 6, yH - 44));
      const pS = hide(add(stage, h('div', 'u10l4b-hread u10l4b-si', T(`${tn(m, 2)}\\text{ m}`)), 214, yH - 44));
      return [
        { cap: `${d.who}: ${T(`${d.ft}'${d.inch}''`)} means <b>${d.ft} ft ${d.inch} in</b>.`,
          run: async (c) => { await anim(c, me, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], 900); await anim(c, hl, [{ opacity: 0 }, { opacity: 1 }], 300); } },
        { cap: `Single unit first: ${T(`${d.ft}\\times12+${d.inch}=${inches}`)} in.`,
          run: async (c) => { await pop(c, pI); await say(c, P, T(`${d.ft}'${d.inch}''=${d.ft}\\times12+${d.inch}=${inches}\\text{ in}`)); } },
        { cap: `Cross to SI: ${T(`${inches}\\times2.54=${tn(cm)}`)} cm = ${T(tn(m))} m.`,
          run: async (c) => { await say(c, P, T(`${inches}\\times2.54=${tn(cm)}\\text{ cm}`)); await say(c, P, T(`=${tn(m)}\\text{ m}`)); } },
        { cap: `To the nearest hundredth: <b>${tn(m, 2)} m</b>. Read across: the head line meets the metre scale there too.`,
          run: async (c) => { await pop(c, pS); await say(c, P, T(`\\approx\\mathbf{${tn(m, 2)}}\\text{ m}`), 'u10l4b-big'); const s = sstamp(P, `${tn(m, 2)} m`); await stampIn(c, s); } }
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
      if (major) { const [tx, ty] = pt(lb, R - 16); const t = svgEl('text', { x: tx, y: ty + 7, 'text-anchor': 'middle', class: 'u10l4b-dimp' }, svg); t.textContent = hn(lb); }
    }
    for (let kg = 0; kg <= kgMax + 1e-9; kg += d.kgStep / 2) {
      const major = Math.abs(kg / d.kgStep - Math.round(kg / d.kgStep)) < 1e-9, lb = kg * 2.2, [x1, y1] = pt(lb, R - 62), [x2, y2] = pt(lb, R - (major ? 80 : 72));
      svgEl('line', { x1, y1, x2, y2, stroke: SI, 'stroke-width': major ? 2.5 : 1.2 }, svg);
      if (major) { const [tx, ty] = pt(lb, R - 98); const t = svgEl('text', { x: tx, y: ty + 6, 'text-anchor': 'middle', class: 'u10l4b-dsi' }, svg); t.textContent = hn(kg); }
    }
    const ul = svgEl('text', { x: cx, y: cy + 70, 'text-anchor': 'middle', class: 'u10l4b-dimp' }, svg); ul.textContent = 'lb (outer)';
    const uk = svgEl('text', { x: cx, y: cy + 96, 'text-anchor': 'middle', class: 'u10l4b-dsi' }, svg); uk.textContent = 'kg (inner)';
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
        run: async (c) => { await say(c, P, T(`${tn(d.lb)}\\text{ lb}\\times\\dfrac{1\\text{ kg}}{2.2\\text{ lb}}`), 'u10l4b-frl'); await say(c, P, T(`=${tn(d.lb)}\\div2.2=${tn(kg, 2)}\\ldots`)); } },
      { cap: `To the nearest kilogram: <b>${hn(kgR)} kg</b>. Fewer kilograms than pounds, because the kilogram is the heavier unit ✓`,
        run: async (c) => { await say(c, P, T(`\\approx\\mathbf{${tn(kgR)}}\\text{ kg}`), 'u10l4b-big'); const s = sstamp(P, `${hn(kgR)} kg`); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: film to DVDs, rounding up =============================== */
const RU = {
  ex7: { label: 'Example 7 check: 1650 m', m: 1650 },
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
    const film = hide(add(stage, box(h('div', 'u10l4b-film', `<span>${hn(d.m)} m of film</span>`), ft * sc, 54), x0, y));
    const ruler = add(stage, svgEl('svg', { width: wid + 20, height: 30, viewBox: `0 0 ${wid + 20} 30` }), x0, y + 58); ruler.style.opacity = 0;
    for (let f = 0; f <= 6000; f += 500) { const x = f * sc; svgEl('line', { x1: x, x2: x, y1: 0, y2: f % 1000 ? 7 : 13, stroke: INK, 'stroke-width': 1.4 }, ruler); if (f % 1000 === 0 && f < 6000) { const t = svgEl('text', { x: x + 2, y: 27, class: 'u10l4b-rtx' }, ruler); t.textContent = hn(f) + (f ? ' ft' : ''); } }
    const loads = [], discs = [];
    for (let i = 0; i < need; i++) {
      const w = Math.max(6, Math.min(1200, ft - i * 1200) * sc);
      loads.push(hide(add(stage, box(h('div', 'u10l4b-load' + (i % 2 ? ' u10l4b-alt' : '') + (i === full ? ' u10l4b-lastl' : ''), ''), w, 54), x0 + i * 1200 * sc, y)));
      const dk = hide(add(stage, h('div', 'u10l4b-disc', `<div class="u10l4b-fill"></div><b>DVD ${i + 1}</b>`), x0 + i * 1200 * sc + 1200 * sc / 2 - 52, y + 104));
      dk.fill = dk.firstChild; dk.fill.style.height = '0%'; discs.push(dk);
    }
    const P = panel(stage, 40, 330, W - 80, 126, '');
    return [
      { cap: `${hn(d.m)} m of film, but the DVD capacity is in <b>feet</b>. Convert first.`,
        run: async (c) => { await anim(c, film, [{ opacity: 0, transform: 'scaleX(0)', transformOrigin: 'left' }, { opacity: 1, transform: 'scaleX(1)', transformOrigin: 'left' }], 900); } },
      { cap: `Exact fact 1 ft = 0.3048 m: ${TQ(`${tn(d.m)}\\div0.3048=${tn(ft, 4)}\\ldots\\approx${tn(ft, 2)}`)} ft.`,
        run: async (c) => { await appear(c, ruler); film.innerHTML = `<span>${T(`\\approx${tn(ft, 2)}\\text{ ft}`)}</span>`; await pulse(c, film, 1.03); await say(c, P, T(`${tn(d.m)}\\text{ m}\\times\\dfrac{1\\text{ ft}}{0.3048\\text{ m}}=${tn(ft, 4)}\\ldots\\approx${tn(ft, 2)}\\text{ ft}`), 'u10l4b-frl'); } },
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
          await say(c, P, `${T(`${tn(n, 3)}\\ldots`)} rounds <b>up</b> to <b>${need} DVDs</b>`, 'u10l4b-big');
          const s = sstamp(P, `${need} DVDs`, true, { x: W - 80 - 110, y: 64 }); await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== mount =============================== */
mountRace();
export const explainers = mountExplainers({ exact, bench, ladder, mixed, twoways, chain, estimate, heights, roundup });
export const _test = { EXA, BEN, MIX, TWO, CH, EST, HT, RU };
