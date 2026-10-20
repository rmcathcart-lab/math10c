/* Math 10C · Unit 10 · Lesson 1 — Rounding and Formula Substitution.
 * Warm-up odometer (your age in seconds), static figures for Examples 6–7, and the explainers:
 *   zoom (rounding on a zoomable number line: the number sits between two neighbours at each place value and snaps to
 *   the closer one; the 5 rule; a negative; Example 1), digits (the rounding rule on the digits: place-value digit,
 *   test digit, roll up with carries, drop the rest; Example 2), early (round only at the end: two lanes, one rounds
 *   too soon), sci (Extension: the decimal point hops until 1 ≤ a < 10; Example 3), renorm (Extension: multiply or
 *   divide, then re-normalize the coefficient on a 1-to-10 ruler; Example 4), brackets (brackets drop around each
 *   substituted value; Example 5), routes (substitute first or solve first: two routes, one answer), subfirst
 *   (substitute, then undo: hops, a rolling wheel, a growing sphere, units cancelling; Example 6), undo (solve first by
 *   running the formula backwards; Example 7).
 * Colours: place-value digit teal, test digit amber, the number being rounded red, x blue, y amber. */
import {
  h, tex, add, at, box, NumberLine, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  svgEl, pulse, shake, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
/** a caption equation that may wrap before each = or \approx (the sidebar caption is narrow) */
const TQ = (s) => s.split(/(?==|\\approx)/).map((q) => T(q)).join(' ');
const C = COLORS;
const show = (c, el, ms = 320) => fadeIn(c, el, ms);
const hide = (el) => { el.style.opacity = 0; return el; };
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u10l1-panel ' + cls, title ? `<div class="u10l1-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u10l1-line ' + cls, html); p.appendChild(d); return d; };
const lineT = (p, s, cls = '') => line(p, T(s), cls);

/* ---------------- numbers ---------------- */
/** thin-space thousands in a plain decimal string ('15273.918' → '15\,273.918') */
function grp(s, sep = '\\,') {
  const neg = s[0] === '-'; if (neg) s = s.slice(1);
  let [i, f] = s.split('.');
  if (i.length > 3) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return (neg ? '-' : '') + i + (f != null ? '.' + f : '');
}
const fx = (v, dp) => (Math.abs(v) < 1e-12 ? 0 : v).toFixed(dp);
const nt = (v, dp) => grp(typeof v === 'string' ? v : fx(v, dp));            // TeX
const nsvg = (v, dp) => grp(fx(v, dp), '\u2009').replace('-', '−');           // SVG text
const calcStr = (v) => String(+v.toPrecision(10));                             // a TI-30XIIS screen (10 digits)
/** round half up on the magnitude to the place 10^k */
const rnd = (v, k) => { const p = 10 ** k, s = v < 0 ? -1 : 1; return s * Math.floor(Math.abs(v) / p + 0.5 + 1e-9) * p; };
const dpOf = (k) => Math.max(0, -k);
const NEAR = { 3: 'thousand', 2: 'hundred', 1: 'ten', 0: 'one', '-1': 'tenth', '-2': 'hundredth', '-3': 'thousandth' };
const PLACE = { 4: 'ten thousands', 3: 'thousands', 2: 'hundreds', 1: 'tens', 0: 'ones', '-1': 'tenths', '-2': 'hundredths', '-3': 'thousandths', '-4': 'ten-thousandths', '-5': 'hundred-thousandths' };
/** the digit with place value 10^e in a decimal string */
function digitAt(s, e) {
  const [i, f = ''] = s.replace('-', '').split('.');
  if (e >= 0) { const j = i.length - 1 - e; return j >= 0 ? +i[j] : 0; }
  const j = -e - 1; return j < f.length ? +f[j] : 0;
}

/* ---------------- a strip of digit boxes ---------------- */
function strip(host, s, o = {}) {
  const el = h('div', 'u10l1-strip' + (o.cls ? ' ' + o.cls : ''));
  const neg = s[0] === '-', b = neg ? s.slice(1) : s, [ip, fp] = b.split('.'), cells = [];
  if (neg) el.appendChild(h('div', 'u10l1-dg u10l1-sign', '<div class="u10l1-dgv">−</div>'));
  const mk = (ch, e, gap) => { const d = h('div', 'u10l1-dg' + (gap ? ' u10l1-gap' : ''), `<div class="u10l1-dgv">${ch}</div>`); d.exp = e; d.dv = d.firstChild; el.appendChild(d); cells.push(d); return d; };
  [...ip].forEach((ch, i) => mk(ch, ip.length - 1 - i, i > 0 && (ip.length - 1 - i) % 3 === 2));
  let pt = null;
  if (fp != null) { pt = h('div', 'u10l1-pt', '.'); el.appendChild(pt); [...fp].forEach((ch, i) => mk(ch, -(i + 1), !o.noFracGap && i > 0 && i % 3 === 0)); }
  host.appendChild(el);
  return { el, cells, pt, at: (e) => cells.find((d) => d.exp === e) };
}
/** a little tag above ('n') or below ('s') a digit box */
function tagAt(S, cell, html, cls, pos = 's') {
  const t = h('div', 'u10l1-tag ' + cls, html); S.el.appendChild(t);
  t.style.left = (cell.offsetLeft + cell.offsetWidth / 2) + 'px';
  t.style.top = (pos === 's' ? cell.offsetTop + cell.offsetHeight + 8 : cell.offsetTop - 8) + 'px';
  t.style.translate = pos === 's' ? '-50% 0' : '-50% -100%';
  return t;
}
/** roll a digit like an odometer wheel */
async function roll(c, cell, to, cls) {
  const dv = cell.dv;
  if (c.fast) { dv.textContent = to; if (cls) cell.classList.add(cls); return; }
  await c.anim(dv, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-75%)', opacity: 0 }], 220);
  dv.textContent = to; if (cls) cell.classList.add(cls);
  await c.anim(dv, [{ transform: 'translateY(75%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], 260);
}
const dropOut = (c, el) => c.anim(el, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(46px)', opacity: 0 }], 380);

/* =============================== warm-up: the seconds odometer =============================== */
function mountOdo() {
  const host = document.getElementById('u10l1-odo'); if (!host) return;
  const sub = document.getElementById('u10l1-odo-sub'), reels = [];
  for (let i = 0; i < 10; i++) {
    const d = h('div', 'u10l1-od' + (i > 0 && (10 - i) % 3 === 0 ? ' u10l1-odgap' : '')), reel = h('div', 'u10l1-reel');
    for (let k = 0; k <= 9; k++) reel.appendChild(h('div', 'u10l1-rd', String(k)));
    d.appendChild(reel); host.appendChild(d); reels.push(reel);
  }
  let val = 0, timer = null;
  const thin = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
  const set = (n, slow) => {
    val = n; const s = String(Math.round(n)).padStart(10, '0');
    reels.forEach((r, i) => { r.style.transitionDuration = (slow ? 900 + i * 130 : 280) + 'ms'; r.style.transform = `translateY(${-(+s[i]) * 10}%)`; });
  };
  const live = document.getElementById('u10l1-live');
  const stop = () => { if (timer) { clearInterval(timer); timer = null; live.textContent = 'Count live'; } };
  live.addEventListener('click', () => {
    if (timer) { stop(); return; }
    live.textContent = 'Stop'; sub.innerHTML = 'one tick every second…';
    timer = setInterval(() => set(val + 1, false), 1000);
  });
  const Y = 31536000;
  const go = (n, txt) => { stop(); set(n, true); sub.innerHTML = txt; };
  document.getElementById('u10l1-y15').addEventListener('click', () => go(15 * Y, `15 years × ${thin(Y)} s = ${thin(15 * Y)} s`));
  document.getElementById('u10l1-y16').addEventListener('click', () => go(16 * Y, `16 years × ${thin(Y)} s = ${thin(16 * Y)} s`));
  document.getElementById('u10l1-bil').addEventListener('click', () => go(1e9, `${thin(1e9)} s ÷ ${thin(Y)} s per year ≈ 31.7 years`));
  document.getElementById('u10l1-zero').addEventListener('click', () => go(0, '&nbsp;'));
  set(0, false);
}

/* =============================== static figures (Examples 6 and 7) =============================== */
const svgT = (x, y, s) => `<text x="${x}" y="${y}" class="u10l1-svgt" text-anchor="middle">${s}</text>`;
const FIG = {
  circle: `<svg viewBox="0 0 160 130" width="160" height="130" aria-hidden="true"><circle cx="80" cy="65" r="52" class="u10l1-fs"/><circle cx="80" cy="65" r="2.8" class="u10l1-fdot"/><line x1="80" y1="65" x2="122.6" y2="35.2" class="u10l1-fl"/>${svgT(94, 42, 'r')}</svg>`,
  sphere: `<svg viewBox="0 0 160 130" width="160" height="130" aria-hidden="true"><circle cx="80" cy="65" r="52" class="u10l1-fs"/><path d="M28 65 A52 15 0 0 1 132 65" class="u10l1-fl u10l1-fdash"/><path d="M28 65 A52 15 0 0 0 132 65" class="u10l1-fl"/><circle cx="80" cy="65" r="2.8" class="u10l1-fdot"/><line x1="80" y1="65" x2="122.6" y2="35.2" class="u10l1-fl"/>${svgT(94, 42, 'r')}</svg>`,
  disc: `<svg viewBox="0 0 160 130" width="160" height="130" aria-hidden="true"><circle cx="80" cy="65" r="52" class="u10l1-fs u10l1-ffill"/><circle cx="80" cy="65" r="2.8" class="u10l1-fdot"/><line x1="80" y1="65" x2="122.6" y2="35.2" class="u10l1-fl"/>${svgT(94, 42, 'r')}${svgT(60, 56, 'A')}</svg>`,
  cylinder: `<svg viewBox="0 0 160 150" width="160" height="150" aria-hidden="true"><path d="M34 125 A46 12 0 0 1 126 125" class="u10l1-fl u10l1-fdash"/><path d="M34 125 A46 12 0 0 0 126 125" class="u10l1-fs"/><ellipse cx="80" cy="40" rx="46" ry="12" class="u10l1-fs"/><line x1="34" y1="40" x2="34" y2="125" class="u10l1-fs"/><line x1="126" y1="40" x2="126" y2="125" class="u10l1-fs"/><line x1="80" y1="40" x2="126" y2="40" class="u10l1-fl"/><circle cx="80" cy="40" r="2.6" class="u10l1-fdot"/>${svgT(103, 22, 'r')}${svgT(140, 88, 'h')}</svg>`,
  cone: `<svg viewBox="0 0 160 160" width="160" height="160" aria-hidden="true"><path d="M30 130 A50 13 0 0 1 130 130" class="u10l1-fl u10l1-fdash"/><path d="M30 130 A50 13 0 0 0 130 130" class="u10l1-fs"/><line x1="30" y1="130" x2="80" y2="16" class="u10l1-fs"/><line x1="130" y1="130" x2="80" y2="16" class="u10l1-fs"/><line x1="80" y1="130" x2="80" y2="16" class="u10l1-fl u10l1-fdash"/><line x1="80" y1="130" x2="130" y2="130" class="u10l1-fl"/><circle cx="80" cy="130" r="2.6" class="u10l1-fdot"/>${svgT(105, 158, 'r')}${svgT(90, 80, 'h')}</svg>`
};
function mountFigs() { document.querySelectorAll('[data-u10l1-fig]').forEach((el) => { el.innerHTML = FIG[el.dataset.u10l1Fig] || ''; }); }

/* =============================== explainer: zoomable number line =============================== */
class ZoomLine {
  constructor(stage, x, y, w, hh, ay) {
    this.el = add(stage, box(h('div', 'u10l1-zl'), w, hh), x, y);
    this.svg = svgEl('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, this.el);
    this.gA = svgEl('g', {}, this.svg); this.gD = svgEl('g', {}, this.svg); this.gT = svgEl('g', {}, this.svg);
    this.html = h('div', 'u10l1-zlh'); this.el.appendChild(this.html);
    Object.assign(this, { W: w, ay, pad: 40, view: [0, 1], fns: [], skip: [], quiet: false });
  }
  toPx(v) { const [a, b] = this.view; return this.pad + (v - a) / (b - a) * (this.W - 2 * this.pad); }
  set(a, b) { this.view = [a, b]; this.draw(); this.fns.forEach((f) => f()); }
  track(f) { this.fns.push(f); f(); return f; }
  draw() {
    const [a, b] = this.view, L = this.gA, ay = this.ay, wv = b - a, Lpx = this.W - 2 * this.pad;
    const M = 10 ** Math.ceil(Math.log10(wv / 1.6) - 1e-9), m = M / 10, mpx = m / wv * Lpx, dM = Math.max(0, -Math.round(Math.log10(M))), dm = Math.max(0, -Math.round(Math.log10(m)));
    L.innerHTML = '';
    svgEl('line', { x1: 8, x2: this.W - 8, y1: ay, y2: ay, class: 'u10l1-zax' }, L);
    svgEl('path', { d: `M${this.W - 2} ${ay} l-15 -8 v16 z`, class: 'u10l1-zhead' }, L);
    svgEl('path', { d: `M2 ${ay} l15 -8 v16 z`, class: 'u10l1-zhead' }, L);
    const wOf = (s) => s.length * 9.8 + 14;
    const big = nsvg(Math.max(Math.abs(a), Math.abs(b)), dM);
    let f = 10; for (const k of [1, 2, 5, 10]) if (k * 10 * mpx > wOf(big)) { f = k; break; }
    const i0 = Math.ceil(a / m - 1e-9), i1 = Math.floor(b / m + 1e-9);
    for (let i = i0; i <= i1; i++) {
      const v = i * m, px = this.toPx(v); if (px < 16 || px > this.W - 16) continue;
      const major = i % 10 === 0;
      svgEl('line', { x1: px, x2: px, y1: ay - (major ? 14 : 7), y2: ay + (major ? 14 : 7), class: 'u10l1-ztk' + (major ? ' u10l1-zmaj' : '') }, L);
      if (this.skip.some((s) => Math.abs(s - v) < m / 100)) continue;
      let lab = null;
      if (major && (i / 10) % f === 0) lab = nsvg(v, dM);
      else if (!major && !this.quiet && mpx > wOf(nsvg(v, dm))) lab = nsvg(v, dm);
      if (lab) { const t = svgEl('text', { x: px, y: ay + 37, 'text-anchor': 'middle', class: 'u10l1-znum' + (major ? ' u10l1-znmaj' : '') }, L); t.textContent = lab; }
    }
  }
}
function zoomTo(c, Z, a1, b1, ms = 1200) {
  const [a0, b0] = Z.view, w0 = b0 - a0, w1 = b1 - a1, c0 = (a0 + b0) / 2, c1 = (a1 + b1) / 2;
  return tween(c, ms, (t) => {
    const w = Math.exp(Math.log(w0) + (Math.log(w1) - Math.log(w0)) * t);
    const cc = Math.abs(w0 - w1) < 1e-12 ? c0 + (c1 - c0) * t : c1 + (c0 - c1) * (w - w1) / (w0 - w1);
    Z.set(cc - w / 2, cc + w / 2);
  });
}
function zlab(Z, v, y, html, cls) {
  const d = h('div', 'u10l1-zlab ' + cls, html); Z.html.appendChild(d);
  Z.track(() => { d.style.left = Z.toPx(v) + 'px'; d.style.top = y + 'px'; });
  return d;
}

const ZM = {
  ex1a: { label: `Example 1: ${T('837.4629')}`, s: '837.4629', ks: [2, 1, 0, -1, -2] },
  ex1b: { label: `Example 1: ${T('15\\,273.918')}`, s: '15273.918', ks: [2, 1, 0, -1, -2] },
  rule: { label: `Notes: ${T('52\\,148.673')} to the ten`, s: '52148.673', ks: [1] },
  half: { label: 'Exactly halfway', s: '6.25', ks: [-1] },
  neg: { label: 'A negative number', s: '-2.86', ks: [-1] }
};
const RT_COLS = [['One', 0], ['Ten', 1], ['Hundred', 2], ['Tenth', -1], ['Hundredth', -2], ['1st Dec.<br>Place', -1, true], ['2nd Dec.<br>Place', -2, true]];
const zoom = {
  title: 'Rounding on a zoomable number line',
  height: 470,
  choices: Object.keys(ZM).map((k) => ({ v: k, label: ZM[k].label })),
  intro: (k) => `Where does ${T(nt(ZM[k].s))} sit? Zoomed out, it is somewhere between two big neighbours. Press <b>Next</b> to zoom in${ZM[k].ks.length > 1 ? ', one place value at a time' : ''}.`,
  make(stage, key, ex) {
    const d = ZM[key], v = +d.s, W = ex.W, multi = d.ks.length > 1, num = T(nt(d.s));
    const S = strip(stage, d.s, { cls: 'u10l1-strip-md', noFracGap: true }); at(S.el, (W - S.el.offsetWidth) / 2, 40);
    const Z = new ZoomLine(stage, 14, 140, W - 28, 176, 86);
    const sg = v < 0 ? -1 : 1, kTop = Math.max(...d.ks) + 1;
    const nb = (k) => {
      const p = 10 ** k, a = sg * Math.floor(Math.abs(v) / p + 1e-9) * p, b = a + sg * p, r = rnd(v, k);
      return { k, p, a, b, lo: Math.min(a, b), hi: Math.max(a, b), mid: (a + b) / 2, r, dp: dpOf(k), mdp: dpOf(k - 1), td: digitAt(d.s, k - 1), win: Math.abs(r - a) < p / 100 ? 'a' : 'b' };
    };
    const top = nb(kTop); Z.set(top.lo - 0.2 * top.p, top.hi + 0.2 * top.p);
    const dot = svgEl('circle', { r: 9, cy: Z.ay, class: 'u10l1-zdot' }, Z.gT); Z.track(() => dot.setAttribute('cx', Z.toPx(v)));
    zlab(Z, v, Z.ay - 40, num, 'u10l1-znl');
    // the table (Example 1) or a result box
    let cellOf = {}, res = null;
    if (multi) {
      const tb = add(stage, h('table', 'u10l1-rt u10l1-rt-st'), 14, 330); box(tb, W - 28);
      tb.innerHTML = `<tr><th class="u10l1-rtn">Number</th>${RT_COLS.map((cc) => `<th>${cc[0]}</th>`).join('')}</tr><tr><td class="u10l1-rtn">${num}</td>${RT_COLS.map(() => '<td></td>').join('')}</tr>`;
      const tds = tb.rows[1].cells; RT_COLS.forEach((cc, i) => { (cellOf[cc[1]] = cellOf[cc[1]] || []).push({ td: tds[i + 1], dup: !!cc[2] }); });
    } else res = add(stage, h('div', 'u10l1-zres'), 0, 352);
    let cur = [];
    const clearCur = () => { cur.forEach((e) => e.remove()); cur = []; S.el.querySelectorAll('.u10l1-tag').forEach((e) => e.remove()); S.cells.forEach((cl) => cl.classList.remove('u10l1-pv', 'u10l1-td')); };
    const L = {};
    const zoomIn = async (c, n) => {
      clearCur(); Z.skip = [n.lo, n.hi, n.mid]; Z.quiet = true;
      await zoomTo(c, Z, n.lo - 0.2 * n.p, n.hi + 0.2 * n.p);
      const hl = svgEl('line', { y1: Z.ay - 26, y2: Z.ay + 24, class: 'u10l1-zhalf' }, Z.gD); Z.track(() => { const px = Z.toPx(n.mid); hl.setAttribute('x1', px); hl.setAttribute('x2', px); });
      L.a = zlab(Z, n.a, Z.ay + 52, T(nt(n.a, n.dp)), 'u10l1-znb'); L.b = zlab(Z, n.b, Z.ay + 52, T(nt(n.b, n.dp)), 'u10l1-znb');
      const pm = zlab(Z, n.mid, Z.ay + 52, `halfway ${T(nt(n.mid, n.mdp))}`, 'u10l1-zmid');
      cur.push(hl, L.a, L.b, pm);
      await Promise.all([pop(c, L.a), pop(c, L.b)]); await appear(c, hl, 250); await fadeIn(c, pm, 250);
      const pv = S.at(n.k), td = S.at(n.k - 1);
      if (pv) { pv.classList.add('u10l1-pv'); const t = tagAt(S, pv, 'place-value digit', 'u10l1-tpv', 'n'); await pop(c, t, 300); }
      if (td) { td.classList.add('u10l1-td'); const t = tagAt(S, td, 'test digit', 'u10l1-ttd', 's'); await pop(c, t, 300); }
    };
    const snap = async (c, n) => {
      const bar = svgEl('line', { y1: Z.ay, y2: Z.ay, class: 'u10l1-zsnap' }, Z.gD), g = svgEl('circle', { r: 9, cy: Z.ay, class: 'u10l1-zghost' }, Z.gT);
      cur.push(bar, g);
      let t0 = 0; const upd = () => { const xa = Z.toPx(v), xb = Z.toPx(v + (n.r - v) * t0); bar.setAttribute('x1', xa); bar.setAttribute('x2', xb); g.setAttribute('cx', xb); };
      Z.track(upd);
      await tween(c, 750, (t) => { t0 = t; upd(); });
      const win = L[n.win], lose = L[n.win === 'a' ? 'b' : 'a'];
      win.classList.add('u10l1-win'); lose.classList.add('u10l1-lose'); await pulse(c, win, 1.18);
      if (multi) for (const o of cellOf[n.k]) if (!o.dup) { o.td.innerHTML = T(nt(n.r, n.dp)); await pop(c, o.td.firstChild, 320); }
      if (res) { res.innerHTML = T(`${nt(d.s)}\\approx\\mathbf{${nt(n.r, n.dp)}}`); at(res, (W - res.offsetWidth) / 2, 352); await pop(c, res, 420); }
    };
    const why = (n) => (n.td >= 5 ? `<b>${n.td}</b> is 5 or more: at or past halfway` : `<b>${n.td}</b> is less than 5: not yet halfway`);
    const between = (n) => `${num} is between ${T(nt(n.a, n.dp))} and ${T(nt(n.b, n.dp))}, and halfway is ${T(nt(n.mid, n.mdp))}.`;
    if (multi) {
      const steps = [...d.ks].sort((p, q) => q - p).map((k) => {
        const n = nb(k);
        return { cap: `<b>Nearest ${NEAR[k]}:</b> zoom in. ${between(n)} Test digit ${why(n)}, so it snaps to <b>${T(nt(n.r, n.dp))}</b>.`,
          run: async (c) => { await zoomIn(c, n); await snap(c, n); } };
      });
      steps.push({ cap: `<b>Tenth</b> and <b>1st decimal place</b> name the same place, and so do <b>hundredth</b> and <b>2nd decimal place</b>: copy those answers across.`,
        run: async (c) => { for (const k of [-1, -2]) for (const o of cellOf[k]) if (o.dup) { o.td.innerHTML = T(nt(rnd(v, k), dpOf(k))); await pop(c, o.td.firstChild, 320); } } });
      return steps;
    }
    const n = nb(d.ks[0]);
    const cap1 = `Round to the nearest <b>${NEAR[n.k]}</b>: zoom in. ${between(n)}` + (key === 'half' ? ` It sits <b>exactly</b> on the halfway mark!` : '');
    const cap2 = key === 'half' ? `Neither neighbour is closer, so the rule settles it: a test digit of <b>5</b> rounds <b>up</b>, to <b>${T(nt(n.r, n.dp))}</b>.`
      : key === 'neg' ? `Test digit ${why(n)}, so round “up”: <b>away from 0</b>, to <b>${T(nt(n.r, n.dp))}</b>. On the line it really is the closer neighbour.`
        : `Test digit ${why(n)}, so it snaps <b>up</b> to <b>${T(nt(n.r, n.dp))}</b>. Drop the digits after it (the ones digit becomes 0).`;
    return [{ cap: cap1, run: (c) => zoomIn(c, n) }, { cap: cap2, run: (c) => snap(c, n) }];
  }
};

/* =============================== explainer: the rule on the digits =============================== */
const DG = {
  rule: { label: `Notes: ${T('52\\,148.673')}`, s: '52148.673', k: 1, task: 'to the nearest ten' },
  a: { label: 'Example 2(a)', s: '24.83917', k: -3, task: 'to three decimal places' },
  b: { label: 'Example 2(b)', s: '32.647', k: -2, task: 'to the nearest hundredth' },
  c: { label: 'Example 2(c)', calc: '7\\,942\\div356', scr: '7942/356', v: 7942 / 356, k: -1, task: 'to the nearest tenth' },
  d: { label: 'Example 2(d)', calc: '2.85\\times3.47', scr: '2.85*3.47', v: 2.85 * 3.47, k: -2, task: 'to the second decimal place' },
  carry: { label: 'A carry: Example 4(a)', s: '1.9926', k: -1, task: 'to one decimal place' }
};
const digits = {
  title: 'The rounding rule on the digits',
  height: 420,
  choices: Object.keys(DG).map((k) => ({ v: k, label: DG[k].label })),
  intro: (k) => (DG[k].calc ? 'A calculated value: calculate first, then round. Press <b>Next</b>.' : 'Find the place, read the test digit, roll, drop. Press <b>Next</b>.'),
  make(stage, key, ex) {
    const d = DG[key], W = ex.W, s = d.s || calcStr(d.v), k = d.k;
    const pvD = digitAt(s, k), td = digitAt(s, k - 1), up = td >= 5, rolls = [];
    if (up) { let e = k; for (;;) { const g = digitAt(s, e); if (g < 9) { rolls.push({ e, to: g + 1 }); break; } rolls.push({ e, to: 0 }); e++; } }
    const carry = rolls.length > 1, res = nt(rnd(+s, k), dpOf(k)), zeros = k > 0;
    let scr = null;
    if (d.calc) {
      scr = add(stage, h('div', 'u10l1-scr', `<div class="u10l1-scr1">${d.scr}</div><div class="u10l1-scr2">${s}</div>`), 0, 12); at(scr, (W - 330) / 2, 12); hide(scr);
    }
    const S = strip(stage, s, { cls: 'u10l1-strip-lg' }); at(S.el, (W - S.el.offsetWidth) / 2, 134); if (d.calc) hide(S.el);
    const meter = add(stage, h('div', 'u10l1-meter', `<div class="u10l1-mg u10l1-mdown">${[0, 1, 2, 3, 4].map((i) => `<span class="u10l1-mk" data-i="${i}">${i}</span>`).join('')}<div class="u10l1-ml">round down</div></div><div class="u10l1-mg u10l1-mup">${[5, 6, 7, 8, 9].map((i) => `<span class="u10l1-mk" data-i="${i}">${i}</span>`).join('')}<div class="u10l1-ml">round up</div></div>`), 0, 262);
    at(meter, (W - meter.offsetWidth) / 2, 262); hide(meter);
    const out = add(stage, h('div', 'u10l1-dres', T(`${nt(s)}\\approx\\mathbf{${res}}`)), 0, 360); at(out, (W - out.offsetWidth) / 2, 356); hide(out);
    const pvCell = S.at(k), tdCell = S.at(k - 1);
    const steps = [];
    if (d.calc) steps.push({ cap: `Calculator first: ${T(d.calc + '=' + s)}. Keep <b>every</b> digit on the screen until the rounding.`, run: async (c) => { await show(c, scr); await sleep(c, 250); await show(c, S.el); } });
    steps.push({ cap: `Round ${d.task}: the place-value digit is the <b>${PLACE[k]}</b> digit, <b>${pvD}</b>.`,
      run: async (c) => { pvCell.classList.add('u10l1-pv'); await pulse(c, pvCell, 1.12); await pop(c, tagAt(S, pvCell, 'place-value digit', 'u10l1-tpv', 'n'), 300); } });
    steps.push({ cap: `The test digit is the one just to its right: <b>${td}</b>.`,
      run: async (c) => { tdCell.classList.add('u10l1-td'); await pulse(c, tdCell, 1.12); await pop(c, tagAt(S, tdCell, 'test digit', 'u10l1-ttd', 's'), 300); await show(c, meter); const mk = meter.querySelector(`[data-i="${td}"]`); mk.classList.add('u10l1-mon'); await pulse(c, mk, 1.3); } });
    steps.push({ cap: up ? (carry ? `<b>${td}</b> is 5 or more: round <b>up</b>. But the place-value digit is a <b>9</b>: it rolls over to 0 and carries 1 into the next place, like an odometer.` : `<b>${td}</b> is 5 or more: round <b>up</b>. The ${pvD} rolls up to <b>${pvD + 1}</b>.`) : `<b>${td}</b> is less than 5: round <b>down</b>. The ${pvD} stays <b>${pvD}</b>.`,
      run: async (c) => { if (!up) { await pulse(c, pvCell, 1.15); return; } for (const r of rolls) { const cl = S.at(r.e); cl.classList.add('u10l1-rolled'); await roll(c, cl, r.to); } } });
    steps.push({ cap: `Drop every digit to its right${zeros ? ' (left of the decimal point they become <b>zeros</b>, to hold the places)' : ''}: ${T(`${nt(s)}\\approx${res}`)}.`,
      run: async (c) => {
        const right = S.cells.filter((cl) => cl.exp < k), jobs = [];
        for (const cl of right) { if (cl.exp >= 0) jobs.push(roll(c, cl, 0, 'u10l1-zero')); else jobs.push(dropOut(c, cl)); }
        if (k >= 0 && S.pt) jobs.push(dropOut(c, S.pt));
        if (tdCell.exp < 0) S.el.querySelectorAll('.u10l1-ttd').forEach((t) => jobs.push(c.anim(t, [{ opacity: 1 }, { opacity: 0 }], 300)));
        await Promise.all(jobs); await pop(c, out, 420);
      } });
    return steps;
  }
};

/* =============================== explainer: round only at the end =============================== */
function erData() {
  const rf = 100 / (2 * Math.PI), Af = Math.PI * rf * rf, Ae = Math.PI * 15.9 * 15.9;
  const Vf = 4 / 3 * Math.PI * 1000, Ve = 4 / 3 * 3.14 * 1000;
  const g = (v) => grp(calcStr(v));
  return {
    circle: { label: `Circle: ${T('C=100')}, then its area`, dp: -1,
      L: [`r=\\dfrac{100}{2\\pi}=${g(rf)}`, `A=\\pi r^{2}=\\pi(${g(rf)})^{2}`, `=${g(Af)}`], R: [`r=\\dfrac{100}{2\\pi}\\approx\\textcolor{#c93a33}{15.9}`, `A=\\pi r^{2}=\\pi(\\textcolor{#c93a33}{15.9})^{2}`, `=${g(Ae)}`], f: [Af, Ae],
      caps: [`A circle has circumference 100. First the radius: ${T('r=\\frac{100}{2\\pi}=15.9154\\ldots')}. The right side rounds it to 15.9 <b>right away</b>.`,
        `Now the area, ${T('A=\\pi r^2')}. The left side squares every digit of ${T('r')}; the right side squares 15.9.`] },
    pi: { label: `${T('\\pi')}, not 3.14`, dp: -1,
      L: ['V=\\tfrac{4}{3}\\pi r^{3}=\\tfrac{4}{3}\\pi(10)^{3}', `=${g(Vf)}`], R: ['V=\\tfrac{4}{3}\\pi r^{3}\\approx\\tfrac{4}{3}(\\textcolor{#c93a33}{3.14})(10)^{3}', `=${g(Ve)}`], f: [Vf, Ve],
      caps: [`A sphere with radius 10: ${T('V=\\tfrac43\\pi r^3')}. The left side uses the ${T('\\pi')} key; the right side uses 3.14, which is ${T('\\pi')} <b>rounded early</b>.`,
        `Calculate both: ${T(grp(calcStr(Vf)))} and ${T(grp(calcStr(Ve)))}.`] },
    ex2d: { label: 'Example 2(d): round the inputs first?', dp: -2,
      L: ['2.85\\times3.47', '=9.8895'], R: ['\\textcolor{#c93a33}{2.9}\\times\\textcolor{#c93a33}{3.5}', '=10.15'], f: [2.85 * 3.47, 2.9 * 3.5],
      caps: ['Example 2(d) again. The left side multiplies first. The right side rounds each number to one decimal place <b>before</b> multiplying.', `Multiply: ${T('9.8895')} on the left, ${T('10.15')} on the right.`] }
  };
}
const ER = erData();
const early = {
  title: 'Round only at the end',
  height: 450,
  choices: Object.keys(ER).map((k) => ({ v: k, label: ER[k].label })),
  intro: 'Two students do the same calculation. One keeps every digit; one rounds too soon. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = ER[key], W = ex.W, lw = (W - 40) / 2;
    const PL = panel(stage, 12, 12, lw, 262, '✓ Keep every digit', 'u10l1-lane u10l1-lane-ok'), PR = panel(stage, 28 + lw, 12, lw, 262, '✗ Rounded too early', 'u10l1-lane u10l1-lane-no');
    const fL = rnd(d.f[0], d.dp), fR = rnd(d.f[1], d.dp), dp = dpOf(d.dp), diff = fx(Math.abs(fL - fR), dp);
    const lo = Math.min(fL, fR), hi = Math.max(fL, fR), st = 10 ** Math.floor(Math.log10(hi - lo)), sdp = dpOf(Math.round(Math.log10(st)));
    const nmin = Math.floor(lo / st - 1e-9) * st - st, nmax = Math.ceil(hi / st + 1e-9) * st + st;
    const N = new NumberLine(stage, { x: 30, y: 300, width: W - 60, height: 130, axisY: 70, min: nmin, max: nmax, step: st, labels: (v) => T(nt(v, sdp)) });
    hide(N.el);
    const half = d.L.length - 1;
    const steps = [
      { cap: d.caps[0], run: async (c) => { for (let i = 0; i < half; i++) { await show(c, lineT(PL, d.L[i])); await show(c, lineT(PR, d.R[i])); } } },
      { cap: d.caps[1], run: async (c) => { for (let i = half; i < d.L.length; i++) { await show(c, lineT(PL, d.L[i])); await show(c, lineT(PR, d.R[i])); } } },
      { cap: `Round each answer at the end${d.dp === -1 ? ', to the nearest tenth' : ', to the second decimal place'}: <b>${T(nt(fL, dp))}</b> against <b>${T(nt(fR, dp))}</b>. Rounding too early knocked the answer off by <b>${diff}</b>.`,
        run: async (c) => {
          await pop(c, lineT(PL, `\\approx\\mathbf{${nt(fL, dp)}}`, 'u10l1-big')); await pop(c, lineT(PR, `\\approx\\mathbf{${nt(fR, dp)}}`, 'u10l1-big'));
          await appear(c, N.el);
          const a = N.point(fL, { color: C.teal, label: T(nt(fL, dp)) }), b = N.point(fR, { color: C.red, label: T(nt(fR, dp)) });
          await Promise.all([pop(c, a), fadeIn(c, a.label)]); await Promise.all([pop(c, b), fadeIn(c, b.label)]);
          await N.hop(c, fR, fL, { label: `off by ${diff}`, below: true, color: 'red', height: 26 });
        } },
      { cap: key === 'pi' ? `${T('\\pi')} is not 3.14. Use the ${T('\\pi')} key, keep every digit, and round <b>once, at the very end</b>.` : 'Keep every digit (the calculator remembers them), and round <b>once, at the very end</b>.',
        run: async (c) => { const s1 = stamp(PL, 'Accurate', { ok: true, size: 'sm' }), s2 = stamp(PR, 'Drifted', { ok: false, size: 'sm' }); s1.classList.add('u10l1-lstamp'); s2.classList.add('u10l1-lstamp'); await stampIn(c, s1); await stampIn(c, s2); } }
    ];
    return steps;
  }
};

/* =============================== explainer: scientific notation (Extension) =============================== */
const SC = {
  nep: { label: 'Notes: Neptune', s: '4500000000', tx: '4\\,500\\,000\\,000', unit: '\\text{ km}' },
  a: { label: 'Example 3(a)', s: '68400000', tx: '68\\,400\\,000' },
  b: { label: 'Example 3(b)', s: '0.00005127', tx: '0.000\\,051\\,27' },
  warm: { label: 'Warm-up: 1 year in seconds', s: '31536000', tx: '31\\,536\\,000', unit: '\\text{ s}' }
};
const sci = {
  title: 'Scientific notation: hop the decimal point',
  height: 420,
  choices: Object.keys(SC).map((k) => ({ v: k, label: SC[k].label })),
  intro: 'Hop the decimal point until exactly one non-zero digit is in front of it, and count the hops. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = SC[key], W = ex.W, small = d.s.includes('.'), dg = d.s.replace('.', ''), len = dg.length;
    const start = small ? d.s.indexOf('.') : len, f = [...dg].findIndex((ch) => ch !== '0'), target = f + 1, n = start - target;
    let last = len - 1; while (dg[last] === '0') last--;
    const aStr = dg[f] + (last > f ? '.' + dg.slice(f + 1, last + 1) : ''), aR = rnd(+aStr, -1), tdD = +(dg[f + 2] || 0), unit = d.unit || '';
    const sciT = `${aStr}\\times10^{${n}}`, sciR = `${fx(aR, 1)}\\times10^{${n}}`;
    // cells
    const CW = 50, SP = 8, GG = 14, xs = []; let x = 0;
    for (let j = 0; j < len; j++) {
      const gap = small ? j > 1 && (j - 1) % 3 === 0 : j > 0 && (len - j) % 3 === 0;
      if (j) x += SP + (gap ? GG : 0); xs.push(x); x += CW;
    }
    const total = x, x0 = (W - total) / 2, Y = 120, bx = (j) => x0 + (j === 0 ? xs[0] - 6 : j === len ? xs[len - 1] + CW + 6 : (xs[j - 1] + CW + xs[j]) / 2);
    const cells = [...dg].map((ch, j) => add(stage, box(h('div', 'u10l1-sc', ch), CW, 66), x0 + xs[j], Y));
    const dot = add(stage, h('div', 'u10l1-scpt'), bx(start), Y + 60); hide(dot);
    const cnt = add(stage, h('div', 'u10l1-sccnt', '&nbsp;'), 0, 40); box(cnt, 300); at(cnt, (W - 300) / 2, 34); hide(cnt);
    const P = panel(stage, 60, 236, W - 120, 168, '', 'u10l1-scp');
    const dir = n > 0 ? 'left' : 'right';
    const brace = add(stage, h('div', 'u10l1-scbrace', `${T('a=' + aStr)}`), 0, Y + 82); hide(brace);
    const steps = [
      { cap: small ? `In ${T(d.tx)}, the decimal point sits right after the first 0.` : `Where is the decimal point in ${T(d.tx)}? It is hidden at the very end, after the last digit.`,
        run: async (c) => { await pop(c, dot, 380); } },
      { cap: `Hop it <b>${dir}</b> until exactly <b>one non-zero digit</b> is in front of it: <b>${Math.abs(n)} hops</b>.`,
        run: async (c) => {
          await appear(c, cnt);
          const stepJ = n > 0 ? -1 : 1;
          for (let i = 1; i <= Math.abs(n); i++) {
            const j0 = start + stepJ * (i - 1), j1 = start + stepJ * i, xa = bx(j0), xb = bx(j1);
            if (c.fast) { dot.style.left = xb + 'px'; } else await c.anim(dot, [{ left: xa + 'px', top: Y + 60 + 'px' }, { left: (xa + xb) / 2 + 'px', top: Y + 18 + 'px', offset: 0.5 }, { left: xb + 'px', top: Y + 60 + 'px' }], 300);
            cnt.innerHTML = `${i} hop${i > 1 ? 's' : ''} ${dir}`;
          }
          dot.style.left = bx(target) + 'px'; cnt.innerHTML = `${Math.abs(n)} hops ${dir}`;
        } },
      { cap: `${small ? `Hopped <b>right ${-n}</b> (a small number), so the exponent is <b>negative</b>: ${T('n=' + n)}.` : `Hopped <b>left ${n}</b> (a big number), so ${T('n=' + n)}.`} ${T(d.tx + '=' + sciT)}, and ${T('1\\le ' + aStr + '<10')}.`,
        run: async (c) => {
          const ph = cells.filter((_, j) => (small ? j < f : j > last)); ph.forEach((e) => e.classList.add('u10l1-scph'));
          cells.slice(f, last + 1).forEach((e) => e.classList.add('u10l1-sca'));
          box(brace, xs[last] + CW - xs[f]); at(brace, x0 + xs[f], Y + 76); await pop(c, brace);
          await show(c, lineT(P, d.tx + unit + '=' + sciT + unit));
        } },
      { cap: aR === +aStr && aStr.length <= 3 ? `To the nearest tenth: ${T(aStr)} already stops at the tenths, so the answer is ${T(sciR + unit)}.`
        : `Round the coefficient to the nearest tenth: test digit <b>${tdD}</b> ${tdD >= 5 ? 'is 5 or more, round up' : 'is less than 5, round down'}: ${T(sciR + unit)}.`,
        run: async (c) => {
          if (!(aR === +aStr && aStr.length <= 3)) { if (cells[f + 1]) cells[f + 1].classList.add('u10l1-pv'); if (cells[f + 2]) cells[f + 2].classList.add('u10l1-td'); }
          await sleep(c, 200); await pop(c, lineT(P, '\\approx\\mathbf{' + sciR + '}' + unit, 'u10l1-big'), 420);
        } }
    ];
    return steps;
  }
};

/* =============================== explainer: re-normalizing (Extension) =============================== */
const RN = {
  a: { label: 'Example 4(a)', v0: 3.24 * 6.15, v1: 1.9926,
    steps: [
      [`Multiply the coefficients: ${T('3.24\\times6.15=19.926')}.`, '3.24\\times6.15=19.926', 'v0'],
      [`Add the exponents: ${T('10^{3}\\times10^{-7}=10^{3+(-7)}=10^{-4}')}.`, '10^{3}\\times10^{-7}=10^{3+(-7)}=10^{-4}'],
      [`So the product is ${T('19.926\\times10^{-4}')}. But 19.926 is <b>not</b> between 1 and 10: not scientific notation yet.`, '=19.926\\times10^{-4}', 'bad'],
      [`Re-normalize: hop the decimal point <b>1 left</b> (${T('\\div10')}) and raise the exponent <b>by 1</b> (${T('\\times10')}). The two cancel, so the value is unchanged: ${T('1.9926\\times10^{-3}')}.`, '=\\underbrace{1.9926}_{19.926\\div10}\\times\\underbrace{10^{-3}}_{10^{-4}\\times10}', 'v1'],
      [`Round to one decimal place: test digit <b>9</b> is 5 or more, and the 9 carries: ${T('1.99\\ldots\\to2.0')}, so ${T('2.0\\times10^{-3}')}.`, '\\approx\\mathbf{2.0\\times10^{-3}}', 'fin']
    ] },
  b: { label: 'Example 4(b)', v0: 7.36 / 4.21,
    steps: [
      [`Divide the coefficients: ${T('7.36\\div4.21=1.7482\\ldots')}.`, '7.36\\div4.21=1.7482\\ldots', 'v0'],
      [`Subtract the exponents: ${TQ('10^{-3}\\div10^{-9}=10^{-3-(-9)}=10^{6}')}.`, '10^{-3}\\div10^{-9}=10^{-3-(-9)}=10^{6}'],
      [`${T('1.7482\\ldots')} is already between 1 and 10, so there is nothing to re-normalize: ${T('1.7482\\ldots\\times10^{6}')}.`, '=1.7482\\ldots\\times10^{6}', 'good'],
      [`Round to one decimal place: test digit <b>4</b> is less than 5, round down: ${T('1.7\\times10^{6}')}.`, '\\approx\\mathbf{1.7\\times10^{6}}', 'fin']
    ] },
  c: { label: 'Example 4(c)', v0: 84.216 * 12.5073, v1: 84.216 * 12.5073 / 1000,
    steps: [
      [`Multiply in standard notation: ${TQ('84.216\\times12.5073=1\\,053.3147768')}. Far bigger than 10.`, '84.216\\times12.5073=1\\,053.3147768', 'v0'],
      [`Hop the decimal point <b>3 places left</b>, so ${T('n=3')}: ${T('1.0533147768\\times10^{3}')}. Now ${T('1\\le a<10')}.`, '=1.0533147768\\times10^{3}', 'v1'],
      [`Round to one decimal place: test digit <b>5</b>, so round <b>up</b>: ${T('1.1\\times10^{3}')}.`, '\\approx\\mathbf{1.1\\times10^{3}}', 'fin']
    ] }
};
const renorm = {
  title: 'Re-normalizing the coefficient',
  height: 450,
  choices: Object.keys(RN).map((k) => ({ v: k, label: RN[k].label })),
  intro: 'Work out the coefficient and the power of ten, then check: is the coefficient between 1 and 10? Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = RN[key], W = ex.W, P = panel(stage, 12, 12, W - 24, 278, '', 'u10l1-rnp');
    const N = new NumberLine(stage, { x: 40, y: 306, width: W - 80, height: 124, axisY: 72, min: 0, max: 20, step: 1, labels: [0, 1, 5, 10, 15, 20].map((v) => ({ v, html: T(String(v)) })) });
    const zone = N.interval(1, 10, { openB: true, color: 'green', width: 9 }); zone.style.opacity = 0.55;
    N.mark(5.5, T('1\\le a<10'), { pos: 'n', lift: 16, cls: 'u10l1-zonelab' });
    const mk = svgEl('circle', { r: 11, cy: N.ay, class: 'u10l1-rnmk' }, N.layers.top); mk.style.opacity = 0;
    const ml = add(N.html, h('div', 'u10l1-rnml', '')); hide(ml);
    const xOf = (v) => (v > 20 ? N.toPx(20) + 22 : N.toPx(v));
    const place = (v, txt) => { const px = xOf(v); mk.setAttribute('cx', px); ml.innerHTML = txt; ml.style.left = px + 'px'; ml.style.top = (N.ay - 30) + 'px'; ml.style.translate = v > 20 ? '-100% -100%' : ''; };
    const inZone = (v) => v >= 1 && v < 10;
    const shown = (v) => (v > 20 ? `${T(grp(calcStr(v).slice(0, 8)) + '\\ldots')} →` : T(calcStr(v).length > 7 ? calcStr(v).slice(0, 6) + '\\ldots' : calcStr(v)));
    return d.steps.map(([cap, tx, act]) => ({
      cap,
      run: async (c) => {
        const ln = lineT(P, tx, act === 'fin' ? 'u10l1-big' : ''); await (act === 'fin' ? pop(c, ln, 420) : show(c, ln));
        if (act === 'v0') { place(d.v0, shown(d.v0)); mk.classList.toggle('u10l1-in', inZone(d.v0)); await appear(c, mk); await appear(c, ml); }
        if (act === 'bad') await shake(c, ml);
        if (act === 'good') await pulse(c, ml, 1.15);
        if (act === 'v1') {
          const a = d.v0 > 20 ? 21.5 : d.v0, b = d.v1; ml.style.translate = '';
          await tween(c, 900, (t) => { const px = (d.v0 > 20 ? N.toPx(20) + 22 : N.toPx(a)) + (N.toPx(b) - (d.v0 > 20 ? N.toPx(20) + 22 : N.toPx(a))) * t; mk.setAttribute('cx', px); ml.style.left = px + 'px'; });
          place(b, shown(b)); mk.classList.add('u10l1-in'); await pulse(c, ml, 1.15);
        }
        if (act === 'fin') { const s = stamp(P, 'scientific notation ✓', { ok: true, size: 'sm' }); s.classList.add('u10l1-pstamp'); await stampIn(c, s); }
      }
    }));
  }
};

/* =============================== explainer: brackets drop in =============================== */
const BR = {
  why: { label: `Why brackets? ${T('(-3)^2')} vs ${T('-3^2')}`, why: true },
  a: { label: 'Example 5(a)', expr: 'y^{2}-5x+2', sub: '(4)^{2}-5(-3)+2', toks: [{ v: 'y', p: '2' }, { t: '-5' }, { v: 'x' }, { t: '+2' }],
    evals: [['=16+15+2', `Powers and products first: ${T('(4)^2=16')}, and ${T('-5(-3)=+15')}.`], ['=\\mathbf{33}', 'Add: <b>33</b>.']] },
  b: { label: 'Example 5(b)', expr: '6x^{2}+y-y^{3}', sub: '6(-3)^{2}+(4)-(4)^{3}', toks: [{ t: '6' }, { v: 'x', p: '2' }, { t: '+' }, { v: 'y' }, { t: '-' }, { v: 'y', p: '3' }],
    evals: [['=6(9)+4-64', `Powers first: ${T('(-3)^2=9')} (the brackets square the negative too) and ${T('(4)^3=64')}.`], ['=54+4-64', `Multiply: ${T('6(9)=54')}.`], ['=\\mathbf{-6}', 'Add and subtract, left to right: <b>−6</b>.']] },
  c: { label: 'Example 5(c)', expr: '3x^{2}-2y+y^{2}', sub: '3(-3)^{2}-2(4)+(4)^{2}', toks: [{ t: '3' }, { v: 'x', p: '2' }, { t: '-2' }, { v: 'y' }, { t: '+' }, { v: 'y', p: '2' }],
    evals: [['=3(9)-8+16', `Powers first: ${T('(-3)^2=9')} and ${T('(4)^2=16')}; and ${T('2(4)=8')}.`], ['=27-8+16', `Multiply: ${T('3(9)=27')}.`], ['=\\mathbf{35}', 'Left to right: <b>35</b>.']] }
};
const VAL = { x: { v: '-3', cls: 'u10l1-vx' }, y: { v: '4', cls: 'u10l1-vy' } };
/** an expression row: tokens are { t: TeX } or { v: letter, p: power } */
function exprRow(host, toks, o = {}) {
  const el = h('div', 'u10l1-expr' + (o.cls ? ' ' + o.cls : '')), slots = [];
  toks.forEach((tk) => {
    if (tk.t != null) { el.appendChild(h('div', 'u10l1-et', T(tk.t))); return; }
    const s = h('div', 'u10l1-slot ' + VAL[tk.v].cls);
    const bl = h('div', 'u10l1-br', '('), core = h('div', 'u10l1-core', T(tk.v)), br = h('div', 'u10l1-br', ')');
    s.append(bl, core, br); if (tk.p) s.appendChild(h('div', 'u10l1-pw', T(tk.p)));
    if (!o.brackets) { bl.style.opacity = 0; br.style.opacity = 0; }
    if (o.noBr) { bl.style.display = 'none'; br.style.display = 'none'; }
    s.bl = bl; s.br = br; s.core = core; s.v = tk.v; el.appendChild(s); slots.push(s);
  });
  host.appendChild(el); return { el, slots };
}
async function dropBrackets(c, s) {
  const kf = [{ opacity: 0, transform: 'translateY(-90px)' }, { opacity: 1, transform: 'translateY(6px)', offset: 0.75 }, { opacity: 1, transform: 'translateY(0)' }];
  await Promise.all([c.anim(s.bl, kf, 520, { easing: 'ease-in' }), c.anim(s.br, kf, 520, { easing: 'ease-in' })]);
}
async function swapIn(c, s, val) {
  await c.anim(s.core, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(30px)' }], 220);
  s.core.innerHTML = T(val); s.classList.add('u10l1-filled');
  await c.anim(s.core, [{ opacity: 0, transform: 'translateY(-50px)' }, { opacity: 1, transform: 'none' }], 320);
}
const brackets = {
  title: 'Substitute in brackets',
  height: 430,
  choices: Object.keys(BR).map((k) => ({ v: k, label: BR[k].label })),
  intro: (k) => (BR[k].why ? 'Why do the brackets matter? Press <b>Next</b>.' : `Evaluate ${T(BR[k].expr)} when ${T('x=-3')} and ${T('y=4')}. Press <b>Next</b>.`),
  make(stage, key, ex) {
    const d = BR[key], W = ex.W;
    if (d.why) {
      const lw = (W - 40) / 2;
      const PL = panel(stage, 12, 12, lw, 400, 'With brackets', 'u10l1-lane u10l1-lane-ok'), PR = panel(stage, 28 + lw, 12, lw, 400, 'Without brackets', 'u10l1-lane u10l1-lane-no');
      const eL = exprRow(PL, [{ v: 'x', p: '2' }], { cls: 'u10l1-expr-sm' }), eR = exprRow(PR, [{ v: 'x', p: '2' }], { cls: 'u10l1-expr-sm', noBr: true });
      return [
        { cap: `${T('x^2')} means ${T('x')} times ${T('x')}. Put in ${T('x=-3')} two ways: with brackets, and without.`,
          run: async (c) => { await dropBrackets(c, eL.slots[0]); await Promise.all([swapIn(c, eL.slots[0], '-3'), swapIn(c, eR.slots[0], '-3')]); } },
        { cap: `With brackets the <b>whole</b> ${T('-3')} is squared: ${T('(-3)^2=(-3)(-3)=9')}.`,
          run: async (c) => { await show(c, lineT(PL, '(-3)^{2}=(-3)(-3)')); await pop(c, lineT(PL, '=\\mathbf{9}', 'u10l1-big')); } },
        { cap: `Without brackets the square happens <b>before</b> the negative, so it only touches the 3: ${T('-3^2=-(3\\times3)=-9')}.`,
          run: async (c) => { await show(c, lineT(PR, '-3^{2}=-(3\\times3)')); await pop(c, lineT(PR, '=\\mathbf{-9}', 'u10l1-big')); } },
        { cap: 'Same letter, same value, different answers. <b>Bracket every value you substitute</b>: it is never wrong, and for a negative it is essential.',
          run: async (c) => { const s1 = stamp(PL, '✓ 9', { ok: true }), s2 = stamp(PR, '✗ −9', { ok: false }); s1.classList.add('u10l1-lstamp'); s2.classList.add('u10l1-lstamp'); await stampIn(c, s1); await stampIn(c, s2); } }
      ];
    }
    const vals = add(stage, h('div', 'u10l1-vals', `<div class="u10l1-val u10l1-vx">${T('x=-3')}</div><div class="u10l1-val u10l1-vy">${T('y=4')}</div>`), W - 250, 14);
    const E = exprRow(stage, d.toks); at(E.el, (W - E.el.offsetWidth) / 2, 64);
    const P = panel(stage, 80, 196, W - 160, 218, '', 'u10l1-brp');
    const steps = [
      { cap: 'Replace every variable with its value, <b>always in brackets</b>. First the brackets drop in: one pair for every variable.',
        run: async (c) => { for (const s of E.slots) await dropBrackets(c, s); } },
      { cap: `Now each letter slides out and its value slides in: ${T('x\\to(-3)')} and ${T('y\\to(4)')}.`,
        run: async (c) => { await pulse(c, vals, 1.06); for (const s of E.slots) await swapIn(c, s, VAL[s.v].v); await show(c, lineT(P, d.expr + '=' + d.sub)); } }
    ];
    d.evals.forEach(([tx, cap], i) => steps.push({ cap, run: async (c) => { const last = i === d.evals.length - 1, ln = lineT(P, tx, last ? 'u10l1-big' : ''); await (last ? pop(c, ln, 420) : show(c, ln)); } }));
    return steps;
  }
};

/* =============================== explainer: two routes (Flowchart) =============================== */
const RO = {
  ex6b: { label: `Example 6(b): ${T('C=2\\pi r')}`, top: 'C=2\\pi r,\\quad C=100', L1: '100=2\\pi r', L2: 'r=\\dfrac{100}{2\\pi}', R1: 'r=\\dfrac{C}{2\\pi}', R2: 'r=\\dfrac{100}{2\\pi}', end: 'r=15.9154\\ldots\\approx15.9', v: 'r' },
  ex7a: { label: `Example 7(a): ${T('A=\\pi r^2')}`, top: 'A=\\pi r^{2},\\quad A=60', L1: '60=\\pi r^{2}', L2: 'r=\\sqrt{\\dfrac{60}{\\pi}}', R1: 'r=\\sqrt{\\dfrac{A}{\\pi}}', R2: 'r=\\sqrt{\\dfrac{60}{\\pi}}', end: 'r=4.3702\\ldots\\approx4.4', v: 'r' },
  ex7c: { label: `Example 7(c): ${T('V=\\tfrac13\\pi r^2h')}`, top: 'V=\\tfrac{1}{3}\\pi r^{2}h,\\quad V=90,\\ r=6', L1: '90=\\tfrac{1}{3}\\pi(6)^{2}h', L2: 'h=\\dfrac{3(90)}{\\pi(6)^{2}}', R1: 'h=\\dfrac{3V}{\\pi r^{2}}', R2: 'h=\\dfrac{3(90)}{\\pi(6)^{2}}', end: 'h=2.3873\\ldots\\approx2.4', v: 'h' }
};
const routes = {
  title: 'Substitute first, or solve first?',
  height: 440,
  choices: Object.keys(RO).map((k) => ({ v: k, label: RO[k].label })),
  intro: 'Two routes through the same formula. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = RO[key], W = ex.W, nw = Math.min(390, W * 0.42);
    const node = (head, t) => `<b>${head}</b>${T(t)}`;
    const F = new Flowchart(stage, { x: 0, y: 0, width: W, height: 440,
      nodes: {
        top: { x: W / 2, y: 50, w: 440, h: 76, html: node('The formula and what you know', d.top), cls: 'bk-round' },
        L1: { x: W * 0.26, y: 168, w: nw, h: 86, html: node('Substitute first', d.L1), color: 'blue' },
        L2: { x: W * 0.26, y: 286, w: nw, h: 92, html: node('…then solve', d.L2), color: 'blue' },
        R1: { x: W * 0.74, y: 168, w: nw, h: 86, html: node('Solve first', d.R1), color: 'purple' },
        R2: { x: W * 0.74, y: 286, w: nw, h: 92, html: node('…then substitute', d.R2), color: 'purple' },
        end: { x: W / 2, y: 396, w: 440, h: 70, html: node('Same answer', d.end), color: 'green', cls: 'bk-round' }
      },
      edges: [{ from: 'top', to: 'L1', route: 'vhv' }, { from: 'top', to: 'R1', route: 'vhv' }, { from: 'L1', to: 'L2' }, { from: 'R1', to: 'R2' }, { from: 'L2', to: 'end', route: 'vhv' }, { from: 'R2', to: 'end', route: 'vhv' }] });
    F.el.classList.add('u10l1-flow');
    return [
      { cap: 'Two ways to use a formula. Both start the same way: write the formula and the values you know.', run: (c) => F.visit(c, 'top') },
      { cap: `<b>Substitute first:</b> put the numbers in right away, then undo the operations around ${T(d.v)}.`, run: (c) => F.light(c, ['top', 'L1', 'L2']) },
      { cap: `<b>Solve first:</b> rearrange with letters until ${T(d.v)} is alone, then put the numbers in.`, run: async (c) => { F.fade(); await F.light(c, ['top', 'R1', 'R2']); } },
      { cap: `Both routes reach the same thing to type into the calculator, and the same answer: ${T(d.end)}. Solving first pays off when you reuse a formula for many values.`,
        run: async (c) => { await Promise.all([F.go(c, 'L2', 'end'), F.go(c, 'R2', 'end')]); await F.visit(c, 'end'); } }
    ];
  }
};

/* =============================== explainer: substitute, then undo (Example 6) =============================== */
const SF = {
  a: { label: 'Example 6(a)', lines: ['d=vt', '84=(12)t', '\\dfrac{84}{12}=\\dfrac{12t}{12}', 't=\\mathbf{7}'] },
  b: { label: 'Example 6(b)', lines: ['C=2\\pi r', '100=2\\pi r', '\\dfrac{100}{2\\pi}=\\dfrac{2\\pi r}{2\\pi}', 'r=\\dfrac{100}{6.28318\\ldots}=15.9154\\ldots', 'r\\approx\\mathbf{15.9}', '\\text{Check: }2\\pi(15.9155)=100.0\\ \\checkmark'] },
  c: { label: 'Example 6(c)', lines: ['V=\\tfrac{4}{3}\\pi r^{3}', '150=\\tfrac{4}{3}\\pi r^{3}', 'r^{3}=\\dfrac{3(150)}{4\\pi}=\\dfrac{450}{12.56637\\ldots}', '=35.8098\\ldots', 'r=\\sqrt[3]{35.8098\\ldots}=3.2961\\ldots', 'r\\approx\\mathbf{3.3}'] },
  units: { label: 'With units: Example 6(a) as a trip', lines: ['84\\text{ km}=(12\\text{ km/h})\\,t', 't=\\dfrac{84\\text{ km}}{12\\text{ km/h}}', '=\\dfrac{84\\,\\cancel{\\text{km}}}{12}\\times\\dfrac{\\text{h}}{\\cancel{\\text{km}}}', 't=\\mathbf{7\\text{ h}}'] }
};
const subfirst = {
  title: 'Substitute, then undo',
  height: 450,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SF).map((k) => ({ v: k, label: SF[k].label })),
  intro: (k) => (k === 'units' ? 'Units are part of the substitution too. Press <b>Next</b>.' : 'Substitute the value, then undo whatever is being done to the unknown. Press <b>Next</b>.'),
  make(stage, key, ex) {
    const d = SF[key], W = ex.W, FW = 420, H = ex.def.height;
    const fig = panel(stage, 12, 12, FW, H - 24, '', 'u10l1-sffig'), P = panel(stage, FW + 28, 12, W - FW - 40, H - 24, '', 'u10l1-sfp');
    const L = (i, cls) => lineT(P, d.lines[i], cls);
    if (key === 'a' || key === 'units') {
      const U = key === 'units';
      add(fig, h('div', 'u10l1-sfh', U ? `Distance in km: each hop of 12 km takes 1 hour` : `How many 12s make 84?`), 0, 18);
      const N = new NumberLine(fig, { x: 8, y: 150, width: FW - 16, height: 130, axisY: 86, min: 0, max: 84, step: 12, labels: (v) => T(String(v)), fontSize: 16 });
      const cnt = add(fig, h('div', 'u10l1-sfcnt', '&nbsp;'), 0, 300); box(cnt, FW);
      const hops = async (c) => { for (let i = 0; i < 7; i++) { await N.hop(c, 12 * i, 12 * (i + 1), { label: U ? T('1\\text{ h}') : T('+12'), color: 'amber', height: 30, ms: 300 }); cnt.innerHTML = `${i + 1} hop${i ? 's' : ''}`; } cnt.innerHTML = U ? `7 hops: ${T('t=7\\text{ h}')}` : `7 hops: ${T('t=7')}`; await pulse(c, cnt, 1.12); };
      if (U) return [
        { cap: `Units ride along with the numbers: ${T('84\\text{ km}=(12\\text{ km/h})\\,t')}.`, run: async (c) => { await show(c, L(0)); } },
        { cap: `Undo the ${T('\\times12\\text{ km/h}')}: divide both sides by ${T('12\\text{ km/h}')}.`, run: async (c) => { await show(c, L(1)); } },
        { cap: `Dividing by ${T('\\text{km/h}')} is multiplying by ${T('\\text{h/km}')}, so the <b>km cancel</b> like a common factor.`, run: async (c) => { await show(c, L(2)); } },
        { cap: `${T('t=7\\text{ h}')}. The leftover unit, hours, tells you that you found a <b>time</b>.`, run: async (c) => { await hops(c); await pop(c, L(3, 'u10l1-big'), 420); } }
      ];
      return [
        { cap: `Write the formula, then substitute: ${T('d=vt')} becomes ${T('84=(12)t')}.`, run: async (c) => { await show(c, L(0)); await show(c, L(1)); } },
        { cap: `${T('t')} is being multiplied by 12. Undo it: divide <b>both sides</b> by 12.`, run: async (c) => { await show(c, L(2)); } },
        { cap: `${T('t=7')}: seven hops of 12 reach 84. Exact, so no rounding is needed.`, run: async (c) => { await hops(c); await pop(c, L(3, 'u10l1-big'), 420); } }
      ];
    }
    if (key === 'b') {
      const R = 46, base = 300, x0 = 22 + R, x1 = x0 + 2 * Math.PI * R;
      const sv = svgEl('svg', { width: FW, height: H - 24, viewBox: `0 0 ${FW} ${H - 24}`, class: 'u10l1-sfsvg' }, fig);
      svgEl('line', { x1: 8, x2: FW - 8, y1: base, y2: base, class: 'u10l1-ground' }, sv);
      const trail = svgEl('line', { x1: x0, x2: x0, y1: base, y2: base, class: 'u10l1-trail' }, sv);
      const wheel = svgEl('g', {}, sv);
      svgEl('circle', { cx: 0, cy: 0, r: R, class: 'u10l1-wheel' }, wheel);
      const spoke = svgEl('line', { x1: 0, y1: 0, x2: R * Math.cos(-35 * Math.PI / 180), y2: R * Math.sin(-35 * Math.PI / 180), class: 'u10l1-spoke' }, wheel);
      svgEl('circle', { cx: 0, cy: 0, r: 3.5, class: 'u10l1-hub' }, wheel);
      const mark = svgEl('circle', { cx: 0, cy: R, r: 7, class: 'u10l1-wmark' }, wheel);
      const setW = (cx) => { const ang = (cx - x0) / R * 180 / Math.PI; wheel.setAttribute('transform', `translate(${cx} ${base - R}) rotate(${ang})`); trail.setAttribute('x2', cx); };
      setW(x0);
      const cl = add(fig, h('div', 'u10l1-sflab u10l1-sfc', T('C=100')), 0, base + 14); hide(cl);
      const rl = add(fig, h('div', 'u10l1-sflab u10l1-sfr', T('r\\approx15.9')), 0, 0); hide(rl);
      add(fig, h('div', 'u10l1-sfh', 'Roll the circle once: its trail is C'), 0, 18);
      return [
        { cap: `Substitute: ${T('C=2\\pi r')} becomes ${T('100=2\\pi r')}. Roll the circle once along the ground: its trail is the circumference, 100.`,
          run: async (c) => { await show(c, L(0)); await show(c, L(1)); await tween(c, 1800, (t) => setW(x0 + (x1 - x0) * t)); setW(x1); at(cl, (x0 + x1) / 2, base + 14); cl.style.translate = '-50% 0'; await pop(c, cl); } },
        { cap: `${T('r')} is being multiplied by ${T('2\\pi')}. Undo it: divide <b>both sides</b> by ${T('2\\pi')}.`, run: async (c) => { await show(c, L(2)); } },
        { cap: `Calculate, keeping every digit: ${T('r=15.9154\\ldots')}.`, run: async (c) => { await show(c, L(3)); } },
        { cap: `Round at the end, to the nearest tenth (test digit 1): ${T('r\\approx15.9')}. Check: ${T('2\\pi(15.9155)=100.0')} ✓`,
          run: async (c) => { await pulse(c, spoke, 1.1); at(rl, x1 - 10, base - 2 * R - 46); rl.style.translate = '-50% 0'; await pop(c, rl); await pop(c, L(4, 'u10l1-big'), 420); await show(c, L(5, 'u10l1-sm')); } }
      ];
    }
    // c: grow a sphere until its volume reaches 150
    const sv = svgEl('svg', { width: FW, height: H - 24, viewBox: `0 0 ${FW} ${H - 24}`, class: 'u10l1-sfsvg' }, fig);
    const cx = FW / 2, cy = 250, K = 44, rT = Math.cbrt(450 / (4 * Math.PI));
    const ball = svgEl('circle', { cx, cy, class: 'u10l1-ball' }, sv), back = svgEl('path', { class: 'u10l1-eqb' }, sv), front = svgEl('path', { class: 'u10l1-eqf' }, sv), rad = svgEl('line', { x1: cx, y1: cy, y2: cy, class: 'u10l1-spoke' }, sv);
    svgEl('circle', { cx, cy, r: 3.5, class: 'u10l1-hub' }, sv);
    const read = add(fig, h('div', 'u10l1-read', ''), 0, 54); box(read, FW);
    const setS = (r) => { const R = r * K, ry = R * 0.28; ball.setAttribute('r', R); back.setAttribute('d', `M${cx - R} ${cy} A${R} ${ry} 0 0 1 ${cx + R} ${cy}`); front.setAttribute('d', `M${cx - R} ${cy} A${R} ${ry} 0 0 0 ${cx + R} ${cy}`); rad.setAttribute('x2', cx + R); read.innerHTML = `<i>r</i> = ${r.toFixed(2)} &nbsp;&nbsp; <i>V</i> = ${(4 / 3 * Math.PI * r ** 3).toFixed(1)}`; };
    setS(1);
    add(fig, h('div', 'u10l1-sfh', 'Grow the sphere until its volume is 150'), 0, 18);
    return [
      { cap: `Substitute: ${T('V=\\frac43\\pi r^3')} becomes ${T('150=\\frac43\\pi r^3')}.`, run: async (c) => { await show(c, L(0)); await show(c, L(1)); } },
      { cap: `Undo the ${T('\\times\\frac43\\pi')}: multiply both sides by 3, then divide by ${T('4\\pi')}. ${T('r^3=35.8098\\ldots')}`, run: async (c) => { await show(c, L(2)); await show(c, L(3)); } },
      { cap: `Undo the cube with a <b>cube root</b>: ${T('r=\\sqrt[3]{35.8098\\ldots}=3.2961\\ldots')}. The growing sphere reaches a volume of 150 at exactly that radius.`,
        run: async (c) => { await show(c, L(4)); await tween(c, 1800, (t) => setS(1 + (rT - 1) * t)); setS(rT); await pulse(c, read, 1.12); } },
      { cap: `Round at the end, to the nearest tenth (test digit 9): ${T('r\\approx3.3')}.`, run: async (c) => { await pop(c, L(5, 'u10l1-big'), 420); } }
    ];
  }
};

/* =============================== explainer: run the formula backwards (Example 7) =============================== */
const UN = {
  a: { label: 'Example 7(a)', inV: 'r', outV: 'A', op: ['(\\ \\ )^{2}', '\\times\\pi'], inv: ['\\sqrt{\\ \\ }', '\\div\\pi'], f: 'r=\\sqrt{\\dfrac{A}{\\pi}}', root: true,
    say: ['<b>square</b> it', `<b>multiply by ${T('\\pi')}</b>`], undo: `${T('\\div\\pi')} undoes ${T('\\times\\pi')}, then ${T('\\sqrt{\\ }')} undoes the square`,
    vals: ['60', '19.0986\\ldots', '4.3702\\ldots'], sub: `${T('A=60')}`, run: `${T('60\\div\\pi=19.0986\\ldots')}, then ${T('\\sqrt{19.0986\\ldots}=4.3702\\ldots')}`, fin: 'r\\approx\\mathbf{4.4}', td: 7,
    subLine: 'r=\\sqrt{\\dfrac{60}{\\pi}}=\\sqrt{19.0986\\ldots}=4.3702\\ldots' },
  b: { label: 'Example 7(b)', inV: 'r', outV: 'V', op: ['(\\ \\ )^{2}', '\\times\\pi h'], inv: ['\\sqrt{\\ \\ }', '\\div\\pi h'], f: 'r=\\sqrt{\\dfrac{V}{\\pi h}}', root: true,
    say: ['<b>square</b> it', `<b>multiply by ${T('\\pi h')}</b>`], undo: `${T('\\div\\pi h')} undoes ${T('\\times\\pi h')}, then ${T('\\sqrt{\\ }')} undoes the square`,
    vals: ['250', '15.9154\\ldots', '3.9894\\ldots'], sub: `${T('V=250')} and ${T('h=5')}`, run: `${T('250\\div(5\\pi)=15.9154\\ldots')}, then ${T('\\sqrt{15.9154\\ldots}=3.9894\\ldots')}`, fin: 'r\\approx\\mathbf{4.0}', td: 8,
    subLine: 'r=\\sqrt{\\dfrac{250}{\\pi(5)}}=\\sqrt{15.9154\\ldots}=3.9894\\ldots' },
  c: { label: 'Example 7(c)', inV: 'h', outV: 'V', op: ['\\times\\pi r^{2}', '\\div3'], inv: ['\\div\\pi r^{2}', '\\times3'], f: 'h=\\dfrac{3V}{\\pi r^{2}}',
    say: [`<b>multiply by ${T('\\pi r^2')}</b>`, `<b>divide by 3</b> (that is the ${T('\\tfrac13')})`], undo: `${T('\\times3')} undoes ${T('\\div3')}, then ${T('\\div\\pi r^2')} undoes ${T('\\times\\pi r^2')}`,
    vals: ['90', '270', '2.3873\\ldots'], sub: `${T('V=90')} and ${T('r=6')}`, run: `${T('90\\times3=270')}, then ${T('270\\div(\\pi(6)^2)=2.3873\\ldots')}`, fin: 'h\\approx\\mathbf{2.4}', td: 8,
    subLine: 'h=\\dfrac{3(90)}{\\pi(6)^{2}}=\\dfrac{270}{113.0973\\ldots}=2.3873\\ldots' }
};
const undo = {
  title: 'Solve first: run the formula backwards',
  height: 470,
  choices: Object.keys(UN).map((k) => ({ v: k, label: UN[k].label })),
  intro: 'A formula is a recipe for the answer. Run it backwards to get the unknown. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = UN[key], W = ex.W, xs = [W * 0.08, W * 0.35, W * 0.64, W * 0.91], yF = 68, yB = 196, nwid = [84, 190, 190, 84];
    const sv = svgEl('svg', { width: W, height: 260, viewBox: `0 0 ${W} 260`, class: 'u10l1-unsvg' }, stage); sv.style.left = '0px'; sv.style.top = '0px';
    const nodeEl = (i, y, html, cls) => { const e = add(stage, box(h('div', 'u10l1-un ' + cls, html), nwid[i], 62), xs[i] - nwid[i] / 2, y - 31); return hide(e); };
    const arrow = (xa, xb, y, cls) => { const g = svgEl('g', { class: 'u10l1-unarr ' + cls }, sv), dirn = xb > xa ? 1 : -1; svgEl('line', { x1: xa, x2: xb - dirn * 10, y1: y, y2: y }, g); svgEl('path', { d: `M${xb} ${y} l${-dirn * 14} -8 v16 z` }, g); g.style.opacity = 0; return g; };
    const edge = (i, j) => [xs[i] + (j > i ? 1 : -1) * (nwid[i] / 2 + 6), xs[j] - (j > i ? 1 : -1) * (nwid[j] / 2 + 6)];
    add(stage, h('div', 'u10l1-unrow', 'the formula: forwards →'), 14, yF - 60);
    const rowB = add(stage, h('div', 'u10l1-unrow u10l1-unrowb', '← backwards: undo the last step first'), 14, yB + 38); hide(rowB);
    const F = [nodeEl(0, yF, T(d.inV), 'u10l1-unv'), nodeEl(1, yF, T(d.op[0]), 'u10l1-unop'), nodeEl(2, yF, T(d.op[1]), 'u10l1-unop'), nodeEl(3, yF, T(d.outV), 'u10l1-unv')];
    const FA = [0, 1, 2].map((i) => arrow(...edge(i, i + 1), yF, 'u10l1-fwd'));
    const B = [nodeEl(3, yB, T(d.outV), 'u10l1-unv'), nodeEl(2, yB, T(d.inv[1]), 'u10l1-unop u10l1-uninv'), nodeEl(1, yB, T(d.inv[0]), 'u10l1-unop u10l1-uninv'), nodeEl(0, yB, T(d.inV), 'u10l1-unv')];
    const BA = [[3, 2], [2, 1], [1, 0]].map(([i, j]) => arrow(...edge(i, j), yB, 'u10l1-bwd'));
    const VL = [[3, 2], [2, 1], [1, 0]].map(([i, j], k) => { const [xa, xb] = edge(i, j); const e = add(stage, h('div', 'u10l1-unval', T(d.vals[k])), (xa + xb) / 2, yB - 30); e.style.translate = '-50% -100%'; return hide(e); });
    const P = panel(stage, 60, 262, W - 120, 194, '', 'u10l1-unp');
    return [
      { cap: `Read the formula as a recipe: start with ${T(d.inV)}, ${d.say[0]}, then ${d.say[1]}. Out comes ${T(d.outV)}.`,
        run: async (c) => { for (let i = 0; i < 4; i++) { await pop(c, F[i], 300); if (i < 3) { await appear(c, FA[i], 260); } } } },
      { cap: `To get ${T(d.inV)} back, run it <b>backwards</b>, undoing the <b>last</b> step first: ${d.undo}.`,
        run: async (c) => { await appear(c, rowB); for (let i = 0; i < 4; i++) { await pop(c, B[i], 300); if (i < 3) await appear(c, BA[i], 260); } } },
      { cap: `Written as a formula: ${T(d.f)}${d.root ? ` (the positive root, since ${T(d.inV + '>0')})` : ''}.`, run: async (c) => { await pop(c, lineT(P, d.f, 'u10l1-boxed'), 420); } },
      { cap: `Substitute ${d.sub} and run the numbers backwards: ${d.run}.`,
        run: async (c) => { for (const e of VL) { await pop(c, e, 320); await sleep(c, 120); } await show(c, lineT(P, d.subLine)); } },
      { cap: `Round at the end, to the nearest tenth (test digit ${d.td}): ${T(d.fin)}.`,
        run: async (c) => { await pop(c, lineT(P, d.fin, 'u10l1-big'), 420); } }
    ];
  }
};

/* =============================== mount =============================== */
mountOdo();
mountFigs();
export const explainers = mountExplainers({ zoom, digits, early, sci, renorm, brackets, routes, subfirst, undo });
export const _test = { ZM, DG, ER, SC, RN, BR, RO, SF, UN, rnd, nt };
