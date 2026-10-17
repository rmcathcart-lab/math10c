/* Math 10C · Unit 10 · Lesson 3 — Reading Precision Measuring Instruments.
 * Every instrument is drawn to the booklet's true geometry (u10_L03.tex macros \microScale, \vernierScale, \vernierInch):
 *   MicroScale  — sleeve (a mark every 0.5 mm, 0.55 cm per mm) + thimble (0.01 mm per division, 0.22 cm apart, 50 around),
 *                 thimble edge AT the reading; the thimble turns (ticks scroll) and slides.
 *   VScale      — a main scale + sliding vernier: metric 20 divisions of 0.95 mm (0.74 cm per mm), inch 8 divisions of
 *                 7/128 in (0.85 cm per 1/16 in); vernier mark n lands on a main mark when n = the fine reading.
 *   Caliper     — the whole vernier caliper (beam, slider, outside/inside jaws, depth rod), slider moves.
 *   Micrometer  — the whole micrometer (frame, anvil, spindle, sleeve, thimble, ratchet), thimble turns.
 * Explainers: precision (one millimetre, three instruments), mtour (Extension: one turn = 0.5 mm, one division = 0.01 mm),
 *   mread (Extension: sleeve + thimble; notes, half-mm trap, Example 1 checks), vtour (outside, inside, depth),
 *   vread (main scale, then the vernier tick that lines up, then the sum; notes, Example 2, warm-up checks),
 *   why (0.95 mm divisions: each 0.05 mm of slide moves the match one mark), vinch (sixteenths + 128ths; notes and
 *   Example 2 imperial checks), choose (size ladder; flowchart for Examples 3 and 4(a)), bearing (Example 4 check).
 * Colours: coarse blue, fine amber, index red, the matching tick green. */
import {
  h, tex, add, box, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween, svgEl, liveCtx, pulse, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const S = (tag, a, p) => svgEl(tag, a, p);
const CO = COLORS.blue, FI = COLORS.amber, IDX = COLORS.red, OK = COLORS.green, INK = COLORS.ink, TEAL = COLORS.teal;
const f1 = (v) => v.toFixed(1), f2 = (v) => v.toFixed(2);
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
let CLIP = 0;
function txt(p, x, y, s, a = {}) {
  const t = S('text', Object.assign({ x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'u10l3-st' }, a), p);
  t.textContent = s; return t;
}
function pillAt(host, x, y, html, cls = '') { const d = h('div', 'u10l3-pill ' + cls, html); add(host, d, x, y); return d; }
function panel(stage, x, y, w, hh, title, cls = '') { return add(stage, box(h('div', 'u10l3-panel ' + cls, title ? `<div class="u10l3-ph">${title}</div>` : ''), w, hh), x, y); }
function line(p, html, cls = '') { const d = h('div', 'u10l3-line ' + cls, html); p.appendChild(d); return d; }
const show = (c, el) => fadeIn(c, el, 320);
const hidden = (el) => { el.style.opacity = 0; return el; };
function overlay(stage, W, H) { return add(stage, S('svg', { width: W, height: H, class: 'u10l3-over' }), 0, 0); }
const mixTex = (w, n, d) => (n === 0 ? String(w) : w === 0 ? `\\tfrac{${n}}{${d}}` : `${w}\\tfrac{${n}}{${d}}`);

/* =============================== micrometer scale (booklet \microScale) =============================== */
class MicroScale {
  /** o: { R (reading the figure is built for, mm), r0 (start), rmax, mlo, k (px per booklet cm), x, y, labels } */
  constructor(host, o) {
    const k = this.k = o.k || 80;
    this.R = o.R; this.mlo = o.mlo ?? Math.max(0, Math.floor(o.R + 1e-9) - 6);
    const rmax = Math.max(o.R, o.rmax || 0), mEmax = (rmax - this.mlo) * 0.55, mEf = (o.R - this.mlo) * 0.55;
    this.W = Math.ceil((mEmax + 3.62) * k); this.H = Math.ceil((o.labels === false ? 3.0 : 3.78) * k);
    const el = this.el = box(h('div', 'u10l3-fhost'), this.W, this.H);
    if (o.x != null) add(host, el, o.x, o.y); else host.appendChild(el);
    const svg = this.svg = S('svg', { width: this.W, height: this.H, class: 'u10l3-svg' }, el);
    const X = this.X = (x) => (x + 0.5) * k, Y = this.Y = (y) => (1.45 - y) * k;
    this.sleeve = S('rect', { x: X(-0.45), y: Y(0.86), height: 1.48 * k, width: 1, class: 'u10l3-sleeve' }, svg);
    this.ticks = [];
    const gT = S('g', {}, svg);
    for (let kk = 2 * this.mlo; kk <= Math.floor(rmax / 0.5 + 1e-9); kk++) {
      const v = kk * 0.5, x = X((v - this.mlo) * 0.55), g = S('g', {}, gT);
      let ln, lab = null;
      if (kk % 2) ln = S('line', { x1: x, x2: x, y1: Y(-0.03), y2: Y(-0.26), class: 'u10l3-tk' }, g);
      else if ((kk / 2) % 5 === 0) { ln = S('line', { x1: x, x2: x, y1: Y(0.03), y2: Y(0.48), class: 'u10l3-tk u10l3-tkM' }, g); lab = txt(g, x, Y(0.48) - 13, String(kk / 2)); }
      else ln = S('line', { x1: x, x2: x, y1: Y(0.03), y2: Y(0.30), class: 'u10l3-tk' }, g);
      this.ticks.push({ v, x, g, ln, lab, half: !!(kk % 2) });
    }
    this.sline = S('line', { x1: X(-0.38), y1: Y(0), y2: Y(0), class: 'u10l3-tk u10l3-tkM' }, svg);
    const th = this.th = S('g', {}, svg);
    S('rect', { x: X(0), y: Y(1.35), width: 2.95 * k, height: 2.7 * k, class: 'u10l3-thim' }, th);
    this.thT = S('g', {}, th);
    S('line', { x1: X(0), x2: X(0), y1: Y(1.35), y2: Y(-1.35), class: 'u10l3-tk u10l3-tkM' }, th);
    S('line', { x1: X(1.55), x2: X(3.0), y1: Y(0), y2: Y(0), class: 'u10l3-idx' }, th);
    txt(th, X(2.93), Y(0) - 12, 'index line', { 'text-anchor': 'end', class: 'u10l3-st u10l3-sred' });
    if (o.labels !== false) {
      const cx = X((mEf + 2.5) / 2);
      txt(svg, cx, Y(-1.66), 'Sleeve: a mark every 0.5 mm', { class: 'u10l3-sb' });
      txt(svg, cx, Y(-2.02), 'Thimble: 0.01 mm per division', { class: 'u10l3-sb' });
    }
    this.set(o.r0 ?? o.R);
  }
  set(r) {
    this.r = r; const k = this.k, X = this.X, Y = this.Y, mE = (r - this.mlo) * 0.55;
    this.mE = mE;
    this.sleeve.setAttribute('width', Math.max(1, X(mE) - X(-0.45)));
    this.sline.setAttribute('x2', X(mE));
    this.th.setAttribute('transform', `translate(${mE * k} 0)`);
    for (const t of this.ticks) t.g.style.display = t.x <= X(mE) + 0.5 ? '' : 'none';
    const half = Math.floor(r / 0.5 + 1e-7), f = Math.round(Math.max(0, (r - half * 0.5) / 0.01) * 1e6) / 1e6;
    this.f = f; this.thT.innerHTML = ''; this.thMap = {};
    for (let v = Math.ceil(f - 6.1); v <= Math.floor(f + 6.1); v++) {
      const y = Y(-(v - f) * 0.22), lab = ((v % 50) + 50) % 50, maj = lab % 5 === 0;
      const ln = S('line', { x1: X(0.12), x2: X(maj ? 0.72 : 0.5), y1: y, y2: y, class: 'u10l3-tk' + (maj ? ' u10l3-tkM' : '') }, this.thT);
      const t = maj ? txt(this.thT, X(0.78), y, String(lab), { 'text-anchor': 'start' }) : null;
      if (Math.abs(v - f) < 0.5) this.thMap.cur = { ln, t, lab, y };
    }
  }
  /** turn the thimble from the current reading to r */
  turn(c, r, ms) { const a = this.r; return tween(c, ms ?? Math.min(2600, 500 + Math.abs(r - a) * 420), (t) => this.set(a + (r - a) * t)); }
  tick(v) { return this.ticks.find((t) => Math.abs(t.v - v) < 1e-6); }
  pill(xcm, ycm, html, cls) { return pillAt(this.el, this.X(xcm), this.Y(ycm), html, cls); }
  /** count the sleeve marks from the labelled multiple of 5 up to the coarse reading; returns the bubbles */
  async count(c, coarse) {
    const L5 = Math.max(this.mlo, 5 * Math.floor(coarse / 5 + 1e-9)), out = [], els = [];
    for (let m = L5 + 1; m <= Math.floor(coarse + 1e-9); m++) out.push({ v: m, lab: String(m) });
    if (Math.abs(coarse - Math.floor(coarse + 1e-9) - 0.5) < 1e-6) out.push({ v: coarse, lab: f1(coarse), half: true });
    const lt = this.tick(L5); if (lt && lt.lab) { lt.lab.classList.add('u10l3-hiCt'); }
    for (const b of out) {
      const t = this.tick(b.v); if (!t) continue;
      const e = hidden(pillAt(this.el, t.x, this.Y(b.half ? -0.47 : 0.66), b.lab, 'u10l3-bub' + (b.half ? ' u10l3-bubH' : '')));
      els.push(e); await pop(c, e, 300); await sleep(c, 200);
    }
    return els;
  }
  hiCoarse(coarse) { const t = this.tick(coarse); if (t) { t.ln.classList.add('u10l3-hiC'); if (t.lab) t.lab.classList.add('u10l3-hiCt'); } return t; }
  async hiFine(c, F) {
    const m = this.thMap.cur; if (!m) return null;
    m.ln.classList.add('u10l3-hiF'); if (m.t) m.t.classList.add('u10l3-hiFt');
    const p = hidden(this.pill(this.mE + (m.t ? 1.25 : 0.98), 0, String(F), 'u10l3-pF'));
    await pop(c, p); return p;
  }
}

/* =============================== the whole micrometer =============================== */
class Micrometer {
  /** o: { s (px per mm), x, y, r, rmax } — the gap between anvil and spindle is the reading r */
  constructor(host, o) {
    const s = this.s = o.s || 6, rmax = o.rmax || 8;
    this.ox = 23 * s; this.oy = 15 * s;
    this.W = Math.ceil((23 + 46 + rmax + 37) * s); this.H = Math.ceil(50 * s);
    const el = this.el = box(h('div', 'u10l3-fhost'), this.W, this.H);
    if (o.x != null) add(host, el, o.x, o.y); else host.appendChild(el);
    const svg = this.svg = S('svg', { width: this.W, height: this.H, class: 'u10l3-svg' }, el);
    const g = this.g = S('g', { transform: `translate(${this.ox} ${this.oy}) scale(${s})` }, svg);
    const ns = { 'vector-effect': 'non-scaling-stroke' };
    this.objL = S('g', {}, g);
    S('path', Object.assign({ d: 'M-22,-6 H-10 V20 H34 V-7 H44 V33 H-22 Z', class: 'u10l3-frame' }, ns), g);
    S('rect', Object.assign({ x: -16, y: 23, width: 46, height: 7, rx: 2, class: 'u10l3-plate' }, ns), g);
    S('rect', Object.assign({ x: 35, y: -10.5, width: 7, height: 3.5, rx: 1, class: 'u10l3-steelD' }, ns), g);
    S('rect', Object.assign({ x: -10, y: -3, width: 10, height: 6, class: 'u10l3-steel' }, ns), g);
    this.spindle = S('rect', Object.assign({ y: -3, height: 6, class: 'u10l3-steel' }, ns), g);
    S('rect', Object.assign({ x: 44, y: -5, width: 28 + rmax, height: 10, class: 'u10l3-sleeve2' }, ns), g);
    const sk = S('g', { class: 'u10l3-mtk' }, g);
    S('line', Object.assign({ x1: 44, x2: 72 + rmax, y1: 0, y2: 0 }, ns), sk);
    for (let m = 0; m <= 26 + rmax; m++) {
      S('line', Object.assign({ x1: 46 + m, x2: 46 + m, y1: 0, y2: m % 5 ? -2.2 : -3.4 }, ns), sk);
      S('line', Object.assign({ x1: 46.5 + m, x2: 46.5 + m, y1: 0, y2: 1.7 }, ns), sk);
    }
    const th = this.th = S('g', {}, g);
    S('path', Object.assign({ d: 'M0,-5 L3,-7.6 H27 V7.6 H3 L0,5 Z', class: 'u10l3-thim2' }, ns), th);
    for (let x = 15; x <= 26.5; x += 1.15) S('line', Object.assign({ x1: x, x2: x, y1: -7.6, y2: 7.6, class: 'u10l3-knurl' }, ns), th);
    S('rect', Object.assign({ x: 27, y: -4.3, width: 9, height: 8.6, rx: 1, class: 'u10l3-thim2' }, ns), th);
    for (let x = 28.2; x <= 35; x += 1.1) S('line', Object.assign({ x1: x, x2: x, y1: -4.3, y2: 4.3, class: 'u10l3-knurl' }, ns), th);
    this.thT = S('g', { class: 'u10l3-mtk' }, th);
    this.objF = S('g', {}, g);
    this.set(o.r ?? 3);
  }
  P(x, y) { return [this.ox + x * this.s, this.oy + y * this.s]; }
  set(r) {
    this.r = r;
    this.spindle.setAttribute('x', r); this.spindle.setAttribute('width', 34 - r);
    this.th.setAttribute('transform', `translate(${46 + r} 0)`);
    const half = Math.floor(r / 0.5 + 1e-7), f = (r - half * 0.5) / 0.01;
    this.thT.innerHTML = '';
    for (let v = Math.ceil(f - 13); v <= Math.floor(f + 13); v++) {
      const th = (v - f) * 2 * Math.PI / 50; if (Math.cos(th) < 0.12) continue;
      const y = 6.2 * Math.sin(th), maj = (((v % 50) + 50) % 50) % 5 === 0;
      S('line', { x1: 0.4, x2: maj ? 3.4 : 2.1, y1: y, y2: y, 'vector-effect': 'non-scaling-stroke' }, this.thT);
    }
  }
  turn(c, r, ms) { const a = this.r; return tween(c, ms ?? Math.min(2600, 500 + Math.abs(r - a) * 420), (t) => this.set(a + (r - a) * t)); }
  /** a label pill with a leader line to the point (x, y) in mm */
  label(at, to, html, cls = '') {
    const [px, py] = this.P(...at), [qx, qy] = this.P(...to);
    const ln = S('line', { x1: px, y1: py, x2: qx, y2: qy, class: 'u10l3-lead' }, this.svg);
    const p = pillAt(this.el, px, py, html, 'u10l3-part ' + cls); p.lead = ln; return p;
  }
}

/* =============================== main scale + sliding vernier (booklet \vernierScale / \vernierInch) =============================== */
class VScale {
  /** o: { lo, hi, u (px per main unit), k (px per booklet cm), p (index position), nDiv, div, mainTick(m), verTick(n),
   *       mainTitle, verTitle, x, y, minMain } — ticks return { len (cm), thick, lab } */
  constructor(host, o) {
    Object.assign(this, { nDiv: 20, div: 0.95, minMain: 0, plateL: 1.15, plateR: 0.55 }, o);
    const k = this.k, u = this.u;
    this.padL = Math.round(0.3 * k + 4);
    this.W = Math.ceil((this.hi - this.lo) * u + 2 * this.padL);
    this.y0 = Math.round(1.05 * k + (this.mainTitle ? 30 : 6)); this.H = Math.ceil(this.y0 + 1.0 * k + (this.verTitle ? 32 : 8));
    const el = this.el = box(h('div', 'u10l3-fhost'), this.W, this.H);
    if (o.x != null) add(host, el, o.x, o.y); else host.appendChild(el);
    const svg = this.svg = S('svg', { width: this.W, height: this.H, class: 'u10l3-svg' }, el);
    const X = this.X = (m) => this.padL + (m - this.lo) * u, y0 = this.y0;
    S('rect', { x: 2, y: y0 - 1.05 * k, width: this.W - 4, height: 1.05 * k, class: 'u10l3-mpanel' }, svg);
    this.main = {};
    for (let m = Math.ceil(this.lo); m <= Math.floor(this.hi); m++) {
      if (m < this.minMain) continue;
      const d = this.mainTick(m), x = X(m);
      const ln = S('line', { x1: x, x2: x, y1: y0, y2: y0 - d.len * k, class: 'u10l3-tk' + (d.thick ? ' u10l3-tkM' : '') }, svg);
      const lab = d.lab != null ? txt(svg, x, y0 - d.len * k - 11, d.lab) : null;
      this.main[m] = { ln, lab, x };
    }
    if (this.mainTitle) { const t = add(el, h('div', 'u10l3-ttl', this.mainTitle), this.W / 2, y0 - 1.05 * k - 15); t.style.translate = '-50% -50%'; }
    const cid = 'u10l3c' + (++CLIP);
    S('rect', { x: 2, y: 0, width: this.W - 4, height: this.H }, S('clipPath', { id: cid }, svg));
    this.vg = S('g', { 'clip-path': `url(#${cid})` }, svg);
    this.vgi = S('g', {}, this.vg);
    this.p0 = this.p; const xz = X(this.p0), xe = xz + this.nDiv * this.div * u;
    S('rect', { x: xz - this.plateL * k, y: y0, width: xe - xz + (this.plateL + this.plateR) * k, height: 1.0 * k, class: 'u10l3-vpanel' }, this.vgi);
    this.ver = {};
    for (let n = 0; n <= this.nDiv; n++) {
      const d = this.verTick(n), x = xz + n * this.div * u;
      const ln = S('line', { x1: x, x2: x, y1: y0, y2: y0 + d.len * k, class: 'u10l3-tk' + (d.thick ? ' u10l3-tkM' : '') }, this.vgi);
      const lab = d.lab != null ? txt(this.vgi, x, y0 + d.len * k + 11, d.lab) : null;
      this.ver[n] = { ln, lab, x0: x };
    }
    this.idx = S('line', { x1: xz, x2: xz, y1: y0, y2: y0 + this.verTick(0).len * k, class: 'u10l3-idxV' }, this.vgi);
    this.idxLab = txt(this.vgi, xz - 10, y0 + 0.72 * k, 'index', { 'text-anchor': 'end', class: 'u10l3-st u10l3-sred' });
    if (this.verTitle) { this.vt = add(el, h('div', 'u10l3-ttl', this.verTitle), (xz + xe) / 2, y0 + 1.0 * k + 17); this.vt.style.translate = '-50% -50%'; this.vtx = (xz + xe) / 2; }
    this.hot = S('g', {}, svg);
    this.set(this.p0);
  }
  set(p) {
    this.p = p; const dx = (p - this.p0) * this.u;
    this.vgi.setAttribute('transform', `translate(${dx} 0)`);
    if (this.vt) this.vt.style.left = (this.vtx + dx) + 'px';
  }
  slide(c, p, ms = 1400) { const a = this.p; return tween(c, ms, (t) => this.set(a + (p - a) * t)); }
  vx(n) { return this.X(this.p) + n * this.div * this.u; }
  pill(x, y, html, cls) { return pillAt(this.el, x, y, html, cls); }
  hiMain(m, cls) { const t = this.main[m]; if (t) { t.ln.classList.add(cls); if (t.lab) t.lab.classList.add(cls + 't'); } return t; }
  hiVer(n, cls) { const t = this.ver[n]; if (t) { t.ln.classList.add(cls); if (t.lab) t.lab.classList.add(cls + 't'); } return t; }
  unVer(n, cls) { const t = this.ver[n]; if (t) { t.ln.classList.remove(cls); if (t.lab) t.lab.classList.remove(cls + 't'); } }
  /** sweep a highlight along the vernier marks 0 … upTo */
  async scan(c, upTo, o = {}) {
    const band = S('rect', { y: this.y0 - 0.62 * this.k, width: 16, height: 1.24 * this.k, rx: 6, class: 'u10l3-scanbar' }, this.hot);
    const place = (v) => band.setAttribute('x', this.vx(v) - 8);
    let last = -1;
    await tween(c, o.ms ?? 380 + upTo * 140, (t) => {
      const v = upTo * t; place(v); const n = Math.round(v);
      if (n !== last) { if (last >= 0) this.unVer(last, 'u10l3-hiS'); this.hiVer(n, 'u10l3-hiS'); last = n; }
    }, (t) => t);
    if (last >= 0) this.unVer(last, 'u10l3-hiS');
    place(upTo); return band;
  }
  /** the vernier mark n and the main mark it lands on light up green */
  async match(c, n, m) {
    this.hiVer(n, 'u10l3-hiM'); this.hiMain(m, 'u10l3-hiM');
    const x = this.vx(n), y1 = this.y0 - this.mainTick(m).len * this.k - 2, y2 = this.y0 + this.verTick(n).len * this.k + 2;
    const glow = S('rect', { x: x - 7, y: y1, width: 14, height: y2 - y1, rx: 7, class: 'u10l3-glow' }, this.hot);
    glow.style.opacity = 0; await appear(c, glow, 350); return glow;
  }
}
function vmm(host, M, N, o = {}) {
  const u = o.u || 36, lo = o.lo ?? M - 3;
  return new VScale(host, Object.assign({
    lo, hi: lo + 24, u, k: u / 0.74, p: M + 0.05 * N, nDiv: 20, div: 0.95,
    mainTick: (m) => (m % 5 === 0 ? { len: 0.55, thick: true, lab: String(m) } : { len: 0.32 }),
    verTick: (n) => (n % 5 === 0 ? { len: 0.55, thick: true, lab: String(n) } : { len: 0.32 }),
    mainTitle: '<b>Main scale (mm)</b>', verTitle: '<b>Vernier scale: 0.05 mm per division</b>'
  }, o));
}
function vin(host, W, s16, N, o = {}) {
  const ic = 16 * W + s16, lo = Math.min(ic - 3, 16 * W - 1), hi = ic + 9;
  const u = o.u || Math.min(70, ((o.maxW || 900) - 40) / (hi - lo + 0.8));
  const v = new VScale(host, Object.assign({
    lo, hi, u, k: u / 0.85, p: ic + N / 8, nDiv: 8, div: 0.875,
    mainTick: (m) => (m % 16 === 0 ? { len: 0.62, thick: true, lab: String(m / 16) } : m % 16 === 8 ? { len: 0.52 } : m % 4 === 0 ? { len: 0.42 } : { len: 0.26 }),
    verTick: (n) => ({ len: 0.45, thick: true, lab: String(n) }),
    mainTitle: `<b>Main scale (in): a mark every ${T('\\tfrac{1}{16}')} in</b>`, verTitle: `<b>Vernier: ${T('\\tfrac{1}{128}')} in per division</b>`
  }, o));
  v.ic = ic; return v;
}

/* =============================== the whole vernier caliper =============================== */
class Caliper {
  /** o: { s (px per mm), x, y, L (beam end, mm), open, rod, rodMax } — the main scale's 0 sits Z mm right of the jaw face */
  constructor(host, o) {
    const s = this.s = o.s; this.L = o.L; this.Z = 10; this.rod = !!o.rod;
    const xmin = -17, xmax = o.L + (o.rod ? (o.rodMax || 30) : 0) + 2, ymin = -12.5, ymax = 36.5;
    this.W = Math.ceil((xmax - xmin) * s); this.H = Math.ceil((ymax - ymin) * s);
    this.ox = -xmin * s; this.oy = -ymin * s;
    const el = this.el = box(h('div', 'u10l3-fhost'), this.W, this.H);
    if (o.x != null) add(host, el, o.x, o.y); else host.appendChild(el);
    const svg = this.svg = S('svg', { width: this.W, height: this.H, class: 'u10l3-svg' }, el);
    const ns = { 'vector-effect': 'non-scaling-stroke' };
    const g = this.g = S('g', { transform: `translate(${this.ox} ${this.oy}) scale(${s})` }, svg);
    this.back = S('g', {}, g);
    S('rect', Object.assign({ x: -17, y: 0, width: o.L + 17, height: 13, class: 'u10l3-beam' }, ns), g);
    S('path', Object.assign({ d: 'M-17,13 H0 V32.5 L-2.6,35.6 L-6.5,32 L-17,21 Z', class: 'u10l3-beam' }, ns), g);
    S('path', Object.assign({ d: 'M0,0 H6 L2.2,-8.6 L0.6,-11.2 H0 Z', class: 'u10l3-beam' }, ns), g);
    const tk = S('g', { class: 'u10l3-ctk' }, g);
    for (let m = 0; m <= o.L - this.Z - 3; m++) S('line', Object.assign({ x1: this.Z + m, x2: this.Z + m, y1: 9, y2: 9 - (m % 10 === 0 ? 4.6 : m % 5 === 0 ? 3.4 : 2.3) }, ns), tk);
    for (let m = 0; m <= o.L - this.Z - 3; m += 10) { const [px, py] = this.P(this.Z + m, 2.3); txt(svg, px, py, String(m), { class: 'u10l3-cst' }); }
    if (o.rod) this.rodEl = S('rect', Object.assign({ x: o.L, y: 5.6, height: 1.8, width: 0, class: 'u10l3-rod' }, ns), g);
    const sl = this.sl = S('g', {}, g);
    S('path', Object.assign({ d: 'M0,-2 H-0.6 L-4,-7 L-0.6,-11.2 H0 Z M-0.6,-2 L-7,-2 L-0.6,-11.2', class: 'u10l3-slid' }, ns), sl);
    S('path', Object.assign({ d: 'M0,-2 V-11.2 H-0.6 L-2.4,-8.6 L-6.2,-2 Z', class: 'u10l3-slid' }, ns), sl);
    S('path', Object.assign({ d: 'M2,-2 H44 V19.5 H2 Z M5,0.6 V9 H42 V0.6 Z', 'fill-rule': 'evenodd', class: 'u10l3-slid' }, ns), sl);
    S('path', Object.assign({ d: 'M0,19 H16 V21 L6.5,32 L2.6,35.6 L0,32.5 Z', class: 'u10l3-slid' }, ns), sl);
    S('circle', Object.assign({ cx: 28, cy: -4.2, r: 2.3, class: 'u10l3-slidD' }, ns), sl);
    S('circle', Object.assign({ cx: 10, cy: 21.6, r: 2.4, class: 'u10l3-slidD' }, ns), sl);
    const vt = S('g', { class: 'u10l3-ctk' }, sl);
    for (let n = 0; n <= 20; n++) S('line', Object.assign({ x1: this.Z + 0.95 * n, x2: this.Z + 0.95 * n, y1: 9, y2: 9 + (n % 5 ? 2.2 : 3.4), class: n ? '' : 'u10l3-cidx' }, ns), vt);
    this.front = S('g', {}, g);
    this.set(o.open || 0);
  }
  P(x, y) { return [this.ox + x * this.s, this.oy + y * this.s]; }
  set(v) { this.open = v; this.sl.setAttribute('transform', `translate(${v} 0)`); if (this.rodEl) this.rodEl.setAttribute('width', v); }
  slide(c, v, ms = 1200) { const a = this.open; return tween(c, ms, (t) => this.set(a + (v - a) * t)); }
  label(at, to, html, cls = '') {
    const [px, py] = this.P(...at), [qx, qy] = this.P(...to);
    const ln = S('line', { x1: px, y1: py, x2: qx, y2: qy, class: 'u10l3-lead' }, this.svg);
    const p = pillAt(this.el, px, py, html, 'u10l3-part ' + cls); p.lead = ln; return p;
  }
  /** a block (or a coin seen edge-on) between the outside jaws */
  object(w, kind = 'block') {
    const gg = S('g', {}, this.back);
    if (kind === 'coin') S('rect', { x: 0, y: 14.5, width: w, height: 19, rx: 0.4, class: 'u10l3-coin', 'vector-effect': 'non-scaling-stroke' }, gg);
    else S('rect', { x: 0, y: 21, width: w, height: 9.5, rx: 1.2, class: 'u10l3-obj', 'vector-effect': 'non-scaling-stroke' }, gg);
    return gg;
  }
}

/* =============================== small device icons =============================== */
const ICON = {
  trundle: '<svg viewBox="0 0 64 48"><circle cx="24" cy="30" r="15" fill="#e8eef6" stroke="#3a4254" stroke-width="2.5"/><path d="M24 15v30M9 30h30M13.4 19.4l21.2 21.2M34.6 19.4L13.4 40.6" stroke="#9aa0ab" stroke-width="1.5"/><circle cx="24" cy="30" r="3" fill="#3a4254"/><path d="M24 30L52 6" stroke="#c27a0e" stroke-width="4" stroke-linecap="round"/><path d="M48 4l8 6" stroke="#3a4254" stroke-width="4" stroke-linecap="round"/></svg>',
  tape: '<svg viewBox="0 0 64 48"><rect x="4" y="8" width="30" height="30" rx="7" fill="#f2c94c" stroke="#3a4254" stroke-width="2.5"/><circle cx="19" cy="23" r="6" fill="#fff" stroke="#3a4254" stroke-width="2"/><rect x="30" y="32" width="32" height="6" fill="#fff6d6" stroke="#3a4254" stroke-width="1.5"/><path d="M36 32v3M41 32v3M46 32v4M51 32v3M56 32v3" stroke="#3a4254" stroke-width="1.3"/></svg>',
  ruler: '<svg viewBox="0 0 64 48"><rect x="3" y="16" width="58" height="16" rx="2" fill="#fbe7b2" stroke="#3a4254" stroke-width="2"/><path d="M8 16v6M13 16v4M18 16v4M23 16v8M28 16v4M33 16v4M38 16v6M43 16v4M48 16v4M53 16v8M58 16v4" stroke="#3a4254" stroke-width="1.4"/></svg>',
  caliper: '<svg viewBox="0 0 64 48"><rect x="4" y="12" width="56" height="7" fill="#dfe4ea" stroke="#3a4254" stroke-width="1.8"/><path d="M4 19h7v20l-3 4-4-6z" fill="#dfe4ea" stroke="#3a4254" stroke-width="1.8"/><path d="M20 10h18v12H24v15l-2 4-2-4z" fill="#c9d2dc" stroke="#3a4254" stroke-width="1.8"/><path d="M14 12v-3M18 12v-3M42 12v-3M46 12v-3M50 12v-3M54 12v-3" stroke="#3a4254" stroke-width="1.2"/></svg>',
  micrometer: '<svg viewBox="0 0 64 48"><path d="M4 12h5v18h18V10h6v28H4z" fill="#5a6f8f" stroke="#3a4254" stroke-width="1.6"/><rect x="9" y="14" width="5" height="5" fill="#d7dde5" stroke="#3a4254" stroke-width="1.2"/><rect x="17" y="14" width="10" height="5" fill="#d7dde5" stroke="#3a4254" stroke-width="1.2"/><rect x="33" y="12" width="12" height="9" fill="#e6eaef" stroke="#3a4254" stroke-width="1.4"/><rect x="43" y="10" width="13" height="13" fill="#cdd4dd" stroke="#3a4254" stroke-width="1.4"/><rect x="56" y="12.5" width="6" height="8" fill="#cdd4dd" stroke="#3a4254" stroke-width="1.4"/></svg>'
};
const icon = (k, cls = '') => `<span class="u10l3-ico ${cls}">${ICON[k]}</span>`;

/* =============================== warm-up: the loonie stack =============================== */
function mountWarm() {
  const host = document.getElementById('u10l3-warmfig'); if (!host) return;
  const u = 6.2, H = 300, base = 270, svgW = 300;
  const fig = box(h('div', 'u10l3-fhost'), svgW, H); host.appendChild(fig);
  const svg = S('svg', { width: svgW, height: H, class: 'u10l3-svg' }, fig);
  const rx = 70, Y = (mm) => base - mm * u;
  S('rect', { x: rx, y: Y(41), width: 46, height: 41 * u, rx: 3, class: 'u10l3-rulerB' }, svg);
  for (let m = 0; m <= 40; m++) S('line', { x1: rx + 46, x2: rx + 46 - (m % 10 === 0 ? 22 : m % 5 === 0 ? 15 : 9), y1: Y(m), y2: Y(m), class: 'u10l3-tk' }, svg);
  for (let c = 0; c <= 4; c++) txt(svg, rx - 8, Y(10 * c), c + ' cm', { 'text-anchor': 'end', class: 'u10l3-st u10l3-stB' });
  S('rect', { x: rx - 2, y: base, width: 200, height: 6, fill: '#9aa0ab' }, svg);
  const coins = S('g', {}, svg), coinEls = [];
  for (let i = 0; i < 20; i++) coinEls.push(S('rect', { x: rx + 56, y: Y((i + 1) * 1.75), width: 120, height: 1.75 * u, rx: 2, class: 'u10l3-coinS' }, coins));
  const top = S('line', { x1: rx + 20, x2: rx + 190, y1: Y(35), y2: Y(35), class: 'u10l3-dashR' }, svg);
  const lab = pillAt(fig, rx + 232, Y(17.5), '<b>20</b> loonies', 'u10l3-wlab');
  const cal = new Caliper(host, { s: 4.6, L: 62, open: 1.75 });
  cal.el.classList.add('u10l3-wcal');
  cal.object(1.75, 'coin');
  const [qx, qy] = cal.P(cal.Z + 6, 13);
  const call = pillAt(cal.el, qx + 92, qy + 92, `main scale: <b>1 mm</b><br>vernier: <b>0.75 mm</b>`, 'u10l3-call');
  S('line', { x1: qx + 40, y1: qy + 70, x2: qx, y2: qy - 6, class: 'u10l3-lead u10l3-leadR' }, cal.svg);
  const [lx, ly] = cal.P(1, 30);
  pillAt(cal.el, lx + 70, ly + 18, 'loonie', 'u10l3-wlab u10l3-wgold');
  const btn = document.getElementById('u10l3-stack');
  let busy = false;
  btn.addEventListener('click', async () => {
    if (busy) return; busy = true; const c = liveCtx();
    top.style.opacity = 0; lab.style.opacity = 0;
    coinEls.forEach((e) => (e.style.opacity = 0));
    for (const e of coinEls) { await c.anim(e, [{ opacity: 0, transform: 'translateY(-60px)' }, { opacity: 1, transform: 'none' }], 160); }
    await c.anim(top, [{ opacity: 0 }, { opacity: 1 }], 300); await c.anim(lab, [{ opacity: 0 }, { opacity: 1 }], 300);
    busy = false;
  });
  void call;
}

/* =============================== static figures on the cards =============================== */
function mountStatics() {
  document.querySelectorAll('[data-u10l3-fig]').forEach((el) => {
    const [kind, ...a] = el.dataset.u10l3Fig.split(':'), n = (a[0] || '').split(',').map(Number), maxW = Number(el.dataset.w || 900);
    if (kind === 'micro') {
      const R = n[0] * 0.5 + n[1] * 0.01, mlo = Math.max(0, Math.floor(R + 1e-9) - 6), wcm = (R - mlo) * 0.55 + 3.62;
      new MicroScale(el, { R, k: Math.min(80, maxW / wcm) });
    } else if (kind === 'vmm') {
      vmm(el, n[0], n[1], { u: Math.min(36, (maxW - 12) / 24.8) });
    } else if (kind === 'vin') {
      vin(el, n[0], n[1], n[2], { maxW });
    } else if (kind === 'ico') {
      el.innerHTML = ICON[a[0]] || '';
    }
  });
}

/* =============================== explainer: precision =============================== */
const precision = {
  title: 'One millimetre, three instruments',
  height: 430,
  intro: 'A rod is a bit longer than 25 mm. How exactly can each instrument say? Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, ov = overlay(stage, W, 430), x0 = 40, u = (W - 80) / 60, rY = 70, LEN = 25.32;
    const X = (mm) => x0 + mm * u;
    S('rect', { x: X(0) - 6, y: rY, width: 60 * u + 12, height: 46, rx: 4, class: 'u10l3-rulerB' }, ov);
    for (let m = 0; m <= 60; m++) S('line', { x1: X(m), x2: X(m), y1: rY, y2: rY + (m % 10 === 0 ? 24 : m % 5 === 0 ? 16 : 10), class: 'u10l3-tk' }, ov);
    for (let cm = 0; cm <= 6; cm++) txt(ov, X(10 * cm), rY + 35, String(cm), { class: 'u10l3-st u10l3-stB' });
    txt(ov, X(60) - 2, rY - 14, 'cm', { 'text-anchor': 'end', class: 'u10l3-st' });
    const rod = S('rect', { x: X(0), y: rY - 24, width: LEN * u, height: 18, rx: 4, class: 'u10l3-rodT' }, ov);
    const zl = 40, zr = W - 40, zy = 250, Z = (mm) => zl + (mm - 25) * (zr - zl);
    const zoom = S('g', { opacity: 0 }, ov);
    S('rect', { x: X(25) - 3, y: rY - 30, width: u + 6, height: 64, class: 'u10l3-zbox' }, zoom);
    S('path', { d: `M${X(25) - 3} ${rY + 34} L${zl} ${zy - 50} M${X(26) + 3} ${rY + 34} L${zr} ${zy - 50}`, class: 'u10l3-zline' }, zoom);
    S('rect', { x: zl, y: zy - 50, width: zr - zl, height: 100, rx: 8, class: 'u10l3-zpanel' }, zoom);
    S('rect', { x: zl, y: zy - 44, width: Z(LEN) - zl, height: 14, rx: 3, class: 'u10l3-rodT' }, zoom);
    S('line', { x1: zl, x2: zr, y1: zy, y2: zy, class: 'u10l3-tk u10l3-tkM' }, zoom);
    for (const m of [25, 26]) { S('line', { x1: Z(m), x2: Z(m), y1: zy - 30, y2: zy + 30, class: 'u10l3-tk u10l3-tkM' }, zoom); txt(zoom, Z(m), zy + 62, m + ' mm', { class: 'u10l3-st u10l3-stB' }); }
    const endL = S('line', { x1: Z(LEN), x2: Z(LEN), y1: zy - 48, y2: zy + 48, class: 'u10l3-endR' }, zoom);
    const cal = S('g', { opacity: 0 }, ov), mic = S('g', { opacity: 0 }, ov);
    for (let i = 1; i < 20; i++) S('line', { x1: Z(25 + i * 0.05), x2: Z(25 + i * 0.05), y1: zy, y2: zy - (i % 2 ? 16 : 24), class: 'u10l3-tkC' }, cal);
    for (let i = 2; i < 10; i += 2) txt(cal, Z(25 + i / 10), zy - 36, f2(25 + i / 10), { class: 'u10l3-st u10l3-stC' });
    for (let i = 1; i < 100; i++) if (i % 5) S('line', { x1: Z(25 + i * 0.01), x2: Z(25 + i * 0.01), y1: zy, y2: zy + 12, class: 'u10l3-tkF' }, mic);
    const out = h('div', 'u10l3-prow'); add(stage, out, 40, 360); box(out, W - 80, 60);
    const cell = (cls, html) => { const d = hidden(h('div', 'u10l3-pcell ' + cls, html)); out.appendChild(d); return d; };
    const cR = cell('u10l3-pR', `<b>Ruler</b> ${T('25\\text{ mm}')}<small>nearest 1 mm</small>`);
    const cC = cell('u10l3-pC', `<b>Caliper</b> ${T('25.30\\text{ mm}')}<small>nearest 0.05 mm</small>`);
    const cM = cell('u10l3-pM', `<b>Micrometer</b> ${T('25.32\\text{ mm}')}<small>nearest 0.01 mm</small>`);
    let hc, hm;
    return [
      { cap: 'On a ruler the smallest gap is <b>1 mm</b>. The rod ends somewhere between the 25 mm and 26 mm marks.',
        run: async (c) => { await tween(c, 900, (t) => rod.setAttribute('width', LEN * u * t)); await appear(c, zoom, 500); await pop(c, cR); } },
      { cap: 'A ruler can only say <b>about 25 mm</b>: it reads to the nearest millimetre.',
        run: (c) => pulse(c, cR, 1.08) },
      { cap: 'A <b>vernier caliper</b> splits that millimetre into 20 steps of <b>0.05 mm</b>. The rod ends nearest the 25.30 mark.',
        run: async (c) => { await appear(c, cal, 500); hc = S('circle', { cx: Z(25.3), cy: zy - 22, r: 9, class: 'u10l3-dotC' }, ov); await pop(c, hc); await pop(c, cC); } },
      { cap: 'A <b>micrometer</b> splits it into 100 steps of <b>0.01 mm</b>: the rod ends right at 25.32 mm.',
        run: async (c) => { await appear(c, mic, 500); hm = S('circle', { cx: Z(LEN), cy: zy + 10, r: 8, class: 'u10l3-dotF' }, ov); await pop(c, hm); await pop(c, cM); await pulse(c, endL, 1.02); } },
      { cap: `State a reading to the instrument’s own precision: ${T('25.30\\text{ mm}')} on a 0.05 mm caliper, not ${T('25.3\\text{ mm}')}. That last 0 is a digit the caliper <b>read</b>.`,
        run: async (c) => { cC.classList.add('u10l3-pOn'); await pulse(c, cC, 1.1); } }
    ];
  }
};

/* =============================== explainer: the micrometer (Extension) =============================== */
const mtour = {
  title: 'Extension: inside a micrometer',
  height: 420,
  intro: 'The object goes between the <b>anvil</b> and the <b>spindle</b>. Turning the thimble moves the spindle. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, M = new Micrometer(stage, { s: 5.5, x: 6, y: 58, r: 3, rmax: 4.2 });
    const k = Math.min(60, (W - M.W - 30) / (4.2 * 0.55 + 3.62)), MS = new MicroScale(stage, { R: 1.75, r0: 3, rmax: 4.2, mlo: 0, k, x: W - 10 - (4.2 * 0.55 + 3.62) * k, y: 18 });
    const ov = overlay(stage, W, 420);
    S('path', { d: `M${6 + M.P(50, -5)[0]} ${58 + M.P(50, -5)[1]} L${MS.el.offsetLeft || W - 10 - (4.2 * 0.55 + 3.62) * k} 30`, class: 'u10l3-zline' }, ov);
    const P = panel(stage, M.W + 24, 300, W - M.W - 34, 108, 'Reading');
    let labels = [], coin = null, turnPill = null, l1, l2, l3;
    const sync = (c, r, ms) => Promise.all([M.turn(c, r, ms), MS.turn(c, r, ms)]);
    return [
      { cap: 'The parts: a <b>frame</b> holds the <b>anvil</b>; turning the <b>thimble</b> (or the <b>ratchet</b> on its end) screws the <b>spindle</b> in or out of the <b>sleeve</b>.',
        run: async (c) => {
          const L = [[[-16, -12], [-16, -5], 'frame'], [[-6, 10], [-5, 2], 'anvil'], [[14, 11.5], [14, 1], 'spindle'], [[56, -13], [56, -4], 'sleeve (barrel)'], [[66, 13.5], [62, 7], 'thimble'], [[85, -10], [83, -4], 'ratchet']];
          for (const [at, to, t] of L) { const p = hidden(M.label(at, to, t)); labels.push(p); await pop(c, p, 260); }
        } },
      { cap: 'Turn the thimble <b>one full turn</b>: the spindle moves <b>0.5 mm</b> and one more sleeve mark shows. Whole millimetres are above the line, half millimetres below.',
        run: async (c) => {
          turnPill = hidden(pillAt(stage, M.W + 24 + 10, 250, `1 turn ${T('=0.5\\text{ mm}')}`, 'u10l3-pT')); await pop(c, turnPill);
          await sync(c, 3.5, 2200); l1 = line(P, `gap ${T('3.0\\text{ mm}\\to3.5\\text{ mm}')}`); await show(c, l1);
        } },
      { cap: `The thimble has <b>50 divisions</b> around it, so one division moves the spindle ${T('0.5\\div50=0.01\\text{ mm}')}.`,
        run: async (c) => { await sync(c, 3.51, 1200); l2 = line(P, `1 division ${T('=0.01\\text{ mm}')}: ${T('3.51\\text{ mm}')}`); await show(c, l2); } },
      { cap: 'Open it a little, slip a <b>loonie</b> between the anvil and the spindle, and turn the ratchet until it clicks.',
        run: async (c) => {
          await sync(c, 4.0, 900);
          coin = S('rect', { x: 0, y: -13.25, width: 1.75, height: 26.5, rx: 0.4, class: 'u10l3-coin', 'vector-effect': 'non-scaling-stroke' }, M.objF);
          await appear(c, coin, 400); await sync(c, 1.75, 2400);
        } },
      { cap: `Read it: sleeve <b>1.5 mm</b> + thimble ${T('25\\times0.01=0.25\\text{ mm}')} = <b>1.75 mm</b>, the warm-up’s loonie.`,
        run: async (c) => {
          await MS.count(c, 1.5); MS.hiCoarse(1.5); await MS.hiFine(c, 25);
          l3 = line(P, `${T('1.5+0.25=\\boldsymbol{1.75\\text{ mm}}')}`, 'u10l3-big'); await show(c, l3);
        } }
    ];
  }
};

const MREAD = {
  notes: { label: 'Notes: the 8.77 mm reading', R: 8.77, coarse: 8.5, F: 27 },
  trap: { label: 'The half-millimetre trap', R: 8.77, coarse: 8.5, F: 27, trap: true },
  ex1a: { label: 'Example 1(a) check', R: 11.66, coarse: 11.5, F: 16 },
  ex1b: { label: 'Example 1(b) check', R: 6.35, coarse: 6.0, F: 35 }
};
const mread = {
  title: 'Extension: sleeve + thimble',
  height: 360,
  choices: Object.keys(MREAD).map((k) => ({ v: k, label: MREAD[k].label })),
  intro: (k) => (MREAD[k].trap ? 'Two readings with the <b>same</b> thimble number. Press <b>Next</b>.' : 'Turn the thimble to the reading, then read the <b>sleeve</b> and the <b>thimble</b>. Press <b>Next</b>.'),
  make(stage, key, ex) {
    const d = MREAD[key], W = ex.W, H = ex.def.height, mlo = Math.max(0, Math.floor(d.R + 1e-9) - 6);
    const r0 = d.trap ? Math.max(mlo + 0.2, 8.27 - 1.6) : Math.max(mlo + 0.15, d.R - 2.4);
    const k = Math.min(80, 560 / ((d.R - mlo) * 0.55 + 3.62));
    const MS = new MicroScale(stage, { R: d.R, r0, k, x: 14, y: 10 });
    const P = panel(stage, MS.W + 34, 14, W - MS.W - 48, H - 28, 'Reading');
    const fine = d.F * 0.01, cS = f1(d.coarse);
    let bubs = [];
    if (d.trap) {
      return [
        { cap: 'Turn the thimble until the index line sits on <b>27</b>.',
          run: (c) => MS.turn(c, 8.27, 1800) },
        { cap: 'Count the sleeve marks: 6, 7, <b>8</b>. No half mark shows yet, so the coarse reading is 8 mm.',
          run: async (c) => { bubs = await MS.count(c, 8.0); MS.hiCoarse(8.0); await show(c, line(P, `<span class="u10l3-co">Coarse</span> ${T('8.0\\text{ mm}')}`)); } },
        { cap: `Reading: ${T('8.0+0.27=8.27\\text{ mm}')}.`,
          run: async (c) => { const p = await MS.hiFine(c, 27); await show(c, line(P, `${T('8.0+0.27=8.27\\text{ mm}')}`)); bubs.push(p); } },
        { cap: 'Now turn the thimble <b>one more full turn</b> (50 divisions). The spindle moves 0.5 mm.',
          run: async (c) => { bubs.forEach((b) => b && b.remove()); MS.ticks.forEach((t) => { t.ln.classList.remove('u10l3-hiC'); if (t.lab) t.lab.classList.remove('u10l3-hiCt'); }); await MS.turn(c, 8.77, 2200); } },
        { cap: 'The thimble says <b>27</b> again, but the <b>8.5 mm</b> half mark now shows below the line.',
          run: async (c) => { await MS.count(c, 8.5); MS.hiCoarse(8.5); await MS.hiFine(c, 27); await show(c, line(P, `<span class="u10l3-co">Coarse</span> ${T('8.5\\text{ mm}')}`)); } },
        { cap: `Reading: ${T('8.5+0.27=8.77\\text{ mm}')}. Same thimble number, readings 0.5 mm apart: always look for a half mark <b>below</b> the line.`,
          run: async (c) => { const l = line(P, `${T('8.5+0.27=\\boldsymbol{8.77\\text{ mm}}')}`, 'u10l3-big'); await show(c, l); const s = stamp(P, 'check the half mark', { ok: null, size: 'sm' }); s.classList.add('u10l3-stampP'); await stampIn(c, s); } }
      ];
    }
    const steps = [
      { cap: 'Turn the thimble. Its edge slides along the sleeve and <b>covers</b> every mark to its right.',
        run: (c) => MS.turn(c, d.R) },
      { cap: `Count the sleeve marks up to the edge: whole millimetres above the line${d.coarse % 1 ? ', half millimetres below' : ''}.`,
        run: async (c) => { await MS.count(c, d.coarse); } },
      { cap: `The last mark showing is <b>${cS} mm</b>: the <b>coarse reading</b>.`,
        run: async (c) => { MS.hiCoarse(d.coarse); await show(c, line(P, `<span class="u10l3-co">Coarse (sleeve)</span><br>${T(cS + '\\text{ mm}')}`)); } },
      { cap: `The index line lands on thimble mark <b>${d.F}</b>: the <b>fine reading</b> is ${T(`${d.F}\\times0.01=${f2(fine)}\\text{ mm}`)}.`,
        run: async (c) => { await MS.hiFine(c, d.F); await show(c, line(P, `<span class="u10l3-fi">Fine (thimble)</span><br>${T(`${d.F}\\times0.01=${f2(fine)}\\text{ mm}`)}`)); } },
      { cap: `Add them: ${T(`${cS}+${f2(fine)}=${f2(d.R)}\\text{ mm}`)}. The sleeve alone is only good to 0.5 mm.`,
        run: async (c) => { await show(c, line(P, T(`${cS}+${f2(fine)}=\\boldsymbol{${f2(d.R)}\\text{ mm}}`), 'u10l3-big')); const s = stamp(P, f2(d.R) + ' mm', { ok: true, size: 'sm' }); s.classList.add('u10l3-stampP'); await stampIn(c, s); } }
    ];
    return steps;
  }
};

/* =============================== explainer: the vernier caliper's three jobs =============================== */
const vtour = {
  title: 'A vernier caliper: outside, inside and depth',
  height: 420,
  intro: 'A caliper is a ruler with a <b>slider</b> on it. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, s = (W - 24) / 162, C = new Caliper(stage, { s, x: 12, y: 56, L: 112, open: 0, rod: true, rodMax: 31 });
    let labs = [], obj = null, pipe = null, blk = null;
    const clearLabs = () => { labs.forEach((p) => { p.lead.remove(); p.remove(); }); labs = []; };
    const tag = (x, y, html, cls) => { const p = hidden(pillAt(stage, x, y, html, 'u10l3-tag ' + (cls || ''))); return p; };
    let t1;
    return [
      { cap: 'The <b>main scale</b> is fixed along the beam. The <b>vernier scale</b> rides on the slider, which also carries the moving jaws and the depth rod.',
        run: async (c) => {
          const L = [[[C.Z + 45, -8], [C.Z + 45, 3.5], 'main scale (beam)'], [[23, 28], [17, 11], 'vernier scale'], [[-12, 41], [-4, 30], 'outside jaws'], [[-12, -10.5], [-1, -8], 'inside jaws'], [[118, 15], [113, 7], 'depth rod']];
          for (const [at, to, t] of L) { const p = hidden(C.label(at, to, t)); labs.push(p); await pop(c, p, 260); }
        } },
      { cap: 'Slide it open: the jaws, the vernier and the depth rod all move <b>together</b>, by the same amount.',
        run: async (c) => { clearLabs(); await C.slide(c, 28, 1300); await C.slide(c, 12, 900); } },
      { cap: '<b>Outside</b> dimensions: close the big jaws onto the object.',
        run: async (c) => {
          await C.slide(c, 24, 600);
          obj = C.object(16); obj.style.opacity = 0; await appear(c, obj, 300); await C.slide(c, 16, 1100);
          t1 = tag(C.P(8, 38)[0] + 12, C.P(8, 38)[1] + 56, 'outside: thickness, diameter'); await pop(c, t1);
        } },
      { cap: '<b>Inside</b> dimensions: put the small jaws inside a pipe and open them until they press on the walls.',
        run: async (c) => {
          obj.remove(); t1.remove(); await C.slide(c, 8, 700);
          pipe = S('g', {}, C.back);
          S('rect', { x: -9, y: -13, width: 9, height: 9, class: 'u10l3-pipe', 'vector-effect': 'non-scaling-stroke' }, pipe);
          S('rect', { x: 22, y: -13, width: 9, height: 9, class: 'u10l3-pipe', 'vector-effect': 'non-scaling-stroke' }, pipe);
          pipe.style.opacity = 0; await appear(c, pipe, 350); await C.slide(c, 22, 1200);
          t1 = tag(C.P(11, -13)[0] + 12, C.P(11, -13)[1] + 40, 'inside: a hole or pipe'); await pop(c, t1);
        } },
      { cap: '<b>Depth</b>: rest the end of the beam on the edge of a hole and slide until the rod touches the bottom.',
        run: async (c) => {
          pipe.remove(); t1.remove(); await C.slide(c, 4, 700);
          blk = S('g', {}, C.front);
          S('path', { d: `M${C.L},-3 h31 v19 h-31 v-6.4 h18 v-7.2 h-18 Z`, class: 'u10l3-pipe', 'fill-rule': 'evenodd', 'vector-effect': 'non-scaling-stroke' }, blk);
          blk.style.opacity = 0; await appear(c, blk, 350); await C.slide(c, 18, 1300);
          t1 = tag(C.P(C.L + 15, 16)[0] + 12, C.P(C.L + 15, 16)[1] + 72, 'depth of a hole'); await pop(c, t1);
        } },
      { cap: 'Whichever job, the reading comes from the <b>same two scales</b>: main scale + vernier.',
        run: async (c) => { const p = hidden(C.label([C.Z + 30, -9], [C.Z + 20, 6], 'read here every time', 'u10l3-partG')); labs.push(p); await pop(c, p); } }
    ];
  }
};

/* =============================== explainer: reading a vernier caliper (the star) =============================== */
const VREAD = {
  notes: { label: 'Notes: 54.65 mm', M: 54, N: 13 },
  ex2a: { label: 'Example 2(a) check', M: 42, N: 13 },
  ex2b: { label: 'Example 2(b) check', M: 77, N: 4 },
  warm: { label: 'Warm-up: one loonie', M: 1, N: 15, coin: true }
};
const vread = {
  title: 'Reading a vernier caliper',
  height: 440,
  choices: Object.keys(VREAD).map((k) => ({ v: k, label: VREAD[k].label })),
  intro: 'Close the jaws, then read the <b>main scale</b>, then the <b>vernier</b>, then add. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = VREAD[key], W = ex.W, R = d.M + 0.05 * d.N, fine = 0.05 * d.N, start = R + 6;
    const C = new Caliper(stage, { s: 4.9, x: 8, y: 2, L: 122, open: start });
    if (d.coin) C.object(R, 'coin'); else C.object(R);
    const V = vmm(stage, d.M, d.N, { u: 36 }); V.el.style.left = ((W - V.W) / 2) + 'px'; V.el.style.top = '272px';
    const startP = start; V.set(startP);
    const ov = overlay(stage, W, 440);
    const [ax, ay] = C.P(C.Z + V.lo, -1), [bx, by] = C.P(C.Z + V.hi, 15);
    S('rect', { x: 8 + ax, y: 2 + ay, width: bx - ax, height: by - ay, rx: 4, class: 'u10l3-zbox' }, ov);
    S('path', { d: `M${8 + ax} ${2 + by} L${(W - V.W) / 2 + 2} 274 M${8 + bx} ${2 + by} L${(W + V.W) / 2 - 2} 274`, class: 'u10l3-zline' }, ov);
    const P = panel(stage, C.W + 22, 8, W - C.W - 30, 240, 'Reading');
    const fT = f2(fine), rT = f2(R), match = d.M + d.N;
    return [
      { cap: `Close the jaws on the ${d.coin ? 'loonie' : 'object'}. The vernier slides along the main scale with them.`,
        run: (c) => Promise.all([C.slide(c, R, 1600), V.slide(c, R, 1600)]) },
      { cap: `The <b>index</b> is the vernier’s own 0 mark (red). It sits just past the ${d.M} mm mark.`,
        run: async (c) => { await pulse(c, V.idxLab, 1.3); const p = hidden(V.pill(V.X(R), V.y0 + 0.55 * V.k + 34, 'index', 'u10l3-pI')); await pop(c, p); } },
      { cap: `<b>Coarse reading</b>: the last main-scale mark at or left of the index: <b>${d.M} mm</b>.`,
        run: async (c) => {
          V.hiMain(d.M, 'u10l3-hiC'); const p = hidden(V.pill(V.X(d.M), V.y0 - 0.55 * V.k - 11, String(d.M), 'u10l3-pC')); await pop(c, p);
          await show(c, line(P, `<span class="u10l3-co">Coarse (main scale)</span><br>${T(d.M + '\\text{ mm}')}`));
        } },
      { cap: '<b>Fine reading</b>: look along the whole vernier for the mark that lines up with a main-scale mark.',
        run: (c) => V.scan(c, d.N) },
      { cap: `Vernier mark <b>${d.N}</b> lines up exactly with the ${match} mm mark. Fine reading: ${T(`${d.N}\\times0.05=${fT}\\text{ mm}`)}.`,
        run: async (c) => { await V.match(c, d.N, match); await show(c, line(P, `<span class="u10l3-fi">Fine (vernier)</span><br>${T(`${d.N}\\times0.05=${fT}\\text{ mm}`)}`)); } },
      { cap: `Add: ${T(`${d.M}+${fT}=${rT}\\text{ mm}`)}${d.coin ? ', one loonie, the same as the stack gave' : ''}. Stated to the caliper’s 0.05 mm, so two decimals.`,
        run: async (c) => { await show(c, line(P, T(`${d.M}+${fT}=\\boldsymbol{${rT}\\text{ mm}}`), 'u10l3-big')); const s = stamp(P, rT + ' mm', { ok: true, size: 'sm' }); s.classList.add('u10l3-stampP'); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: why the vernier works =============================== */
const why = {
  title: 'Why each vernier division is worth 0.05 mm',
  height: 440,
  intro: 'The secret is that vernier divisions are a little <b>shorter</b> than main-scale divisions. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, u1 = (W - 60) / 22.6;
    const A = new VScale(stage, { lo: -1, hi: 21, u: u1, k: 44, p: 0, x: 0, y: 4,
      mainTick: (m) => (m % 5 === 0 ? { len: 0.55, thick: true, lab: String(m) } : { len: 0.32 }),
      verTick: (n) => (n % 5 === 0 ? { len: 0.55, thick: true, lab: String(n) } : { len: 0.32 }), mainTitle: '<b>Main scale (mm)</b>' });
    A.el.style.left = ((W - A.W) / 2) + 'px';
    const MW = W - 40, u2 = 150;
    const wrap = add(stage, box(h('div', 'u10l3-mag'), MW, 186), 20, 214);
    const B = new VScale(wrap, { lo: -1, hi: 22, u: u2, k: 64, p: 0, x: 0, y: 0, minMain: 0,
      mainTick: (m) => ({ len: 0.5, thick: m % 5 === 0, lab: String(m) }),
      verTick: (n) => ({ len: 0.5, thick: n % 5 === 0, lab: String(n) }), mainTitle: '<b>Magnified</b>' });
    const pan = (cmm) => { B.el.style.left = (MW / 2 - B.X(cmm)) + 'px'; };
    pan(2.6);
    const gaps = S('g', {}, B.svg);
    let lit = [];
    const light = (c, n) => { lit.forEach(([a, m]) => { A.unVer(a, 'u10l3-hiM'); B.unVer(a, 'u10l3-hiM'); A.main[m] && A.main[m].ln.classList.remove('u10l3-hiM'); B.main[m] && B.main[m].ln.classList.remove('u10l3-hiM'); }); lit = [[n, n]]; A.hiVer(n, 'u10l3-hiM'); A.hiMain(n, 'u10l3-hiM'); B.hiVer(n, 'u10l3-hiM'); B.hiMain(n, 'u10l3-hiM'); return sleep(c, 300); };
    const both = (c, p, ms) => Promise.all([A.slide(c, p, ms), B.slide(c, p, ms)]);
    const readout = hidden(pillAt(stage, W - 120, 414, '', 'u10l3-pT'));
    return [
      { cap: 'Jaws closed: the vernier’s 0 is on the main 0, and its <b>20</b> lines up with the <b>19 mm</b> mark.',
        run: async (c) => { A.hiVer(0, 'u10l3-hiM'); A.hiMain(0, 'u10l3-hiM'); A.hiVer(20, 'u10l3-hiM'); A.hiMain(19, 'u10l3-hiM'); await sleep(c, 400); } },
      { cap: `So 20 vernier divisions fit in 19 mm: each is ${T('19\\div20=0.95\\text{ mm}')}, which is <b>0.05 mm shorter</b> than a main division.`,
        run: async (c) => {
          for (let n = 1; n <= 4; n++) {
            const xa = B.X(0.95 * n), xb = B.X(n), y = B.y0;
            S('rect', { x: xa, y: y - 3, width: xb - xa, height: 6, class: 'u10l3-gap' }, gaps);
            const p = hidden(pillAt(B.el, (xa + xb) / 2, B.y0 + 0.5 * B.k + 44, f2(0.05 * n), 'u10l3-gapL')); await pop(c, p, 260);
          }
        } },
      { cap: 'Slide the jaws open <b>0.05 mm</b>: the first gap closes, and vernier mark <b>1</b> lines up.',
        run: async (c) => { gaps.innerHTML = ''; B.el.querySelectorAll('.u10l3-gapL').forEach((e) => e.remove()); [0, 20].forEach((n) => A.unVer(n, 'u10l3-hiM')); [0, 19].forEach((m) => A.main[m].ln.classList.remove('u10l3-hiM')); await both(c, 0.05, 900); await light(c, 1); readout.innerHTML = 'opening 0.05 mm'; await pop(c, readout); } },
      { cap: 'Another 0.05 mm (0.10 mm open): now mark <b>2</b> lines up. Each 0.05 mm moves the match one mark along.',
        run: async (c) => { await both(c, 0.10, 900); await light(c, 2); readout.innerHTML = 'opening 0.10 mm'; } },
      { cap: `Open to 0.65 mm: mark <b>13</b> lines up. The matching mark counts the 0.05 mm steps: ${T('13\\times0.05=0.65\\text{ mm}')}.`,
        run: async (c) => {
          const a = 2.6; await Promise.all([both(c, 0.65, 1500), tween(c, 1500, (t) => pan(a + (13 - a) * t))]);
          await light(c, 13); readout.innerHTML = 'opening 0.65 mm'; await pulse(c, readout, 1.1);
        } }
    ];
  }
};

/* =============================== explainer: the inch scale =============================== */
const VIN = {
  notes: { label: `Notes: ${T('2\\tfrac{19}{128}')} in`, W: 2, s16: 2, N: 3, mm: 54.65 },
  ex2a: { label: 'Example 2(a) imperial check', W: 1, s16: 10, N: 7, mm: 42.65 },
  ex2b: { label: 'Example 2(b) imperial check', W: 3, s16: 0, N: 5, mm: 77.2 }
};
const vinch = {
  title: 'The inch scale: sixteenths plus 128ths',
  height: 450,
  choices: Object.keys(VIN).map((k) => ({ v: k, label: VIN[k].label })),
  intro: 'The same jaw opening, read on the caliper’s <b>inch</b> scale. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = VIN[key], W = ex.W, V = vin(stage, d.W, d.s16, d.N, { maxW: W - 20 });
    V.el.style.left = ((W - V.W) / 2) + 'px'; V.el.style.top = '6px';
    const p1 = V.p; V.set(p1 + 2.2);
    const P = panel(stage, 20, V.H + 18, W - 40, 450 - V.H - 30, '');
    P.classList.add('u10l3-fpanel');
    // coarse in lowest terms
    const g16 = d.s16 ? gcd(d.s16, 16) : 1, cn = d.s16 / g16, cd = 16 / g16;
    const coarseT = mixTex(d.W, cn, cd), n128 = d.s16 * 8, tot = n128 + d.N, gt = gcd(tot, 128);
    const ansT = mixTex(d.W, tot / gt, 128 / gt), dec = d.W + tot / 128, mmIn = d.mm / 25.4;
    const coarseFull = d.s16 ? `${d.W}\\tfrac{${d.s16}}{16}${g16 > 1 ? '=' + coarseT : ''}` : String(d.W);
    const match = V.ic + d.N;
    const steps = [
      { cap: `Main-scale marks every ${T('\\tfrac{1}{16}')} in; the vernier has 8 divisions, each worth ${T('\\tfrac{1}{128}')} in. Close the jaws.`,
        run: (c) => V.slide(c, p1, 1300) },
      { cap: d.s16 ? `<b>Coarse</b>: the index is just past the ${d.W} in mark plus <b>${d.s16}</b> sixteenths: ${T(coarseFull + '\\text{ in}')}.` : `<b>Coarse</b>: the index is just past the <b>${d.W} in</b> mark.`,
        run: async (c) => {
          for (let i = 1; i <= d.s16; i++) { const p = hidden(V.pill(V.X(16 * d.W + i) , V.y0 - 0.26 * V.k - 16, String(i), 'u10l3-bub')); await pop(c, p, 220); }
          V.hiMain(V.ic, 'u10l3-hiC');
          await show(c, line(P, `<span class="u10l3-co">Coarse</span> ${T(coarseFull + '\\text{ in}')}`));
        } },
      { cap: `<b>Fine</b>: vernier mark <b>${d.N}</b> lines up with a main-scale mark, so the fine reading is ${T(`\\tfrac{${d.N}}{128}`)} in.`,
        run: async (c) => { await V.scan(c, d.N); await V.match(c, d.N, match); await show(c, line(P, `<span class="u10l3-fi">Fine</span> ${T(`\\tfrac{${d.N}}{128}\\text{ in}`)}`)); } }
    ];
    if (d.s16) steps.push({ cap: `Use a common denominator: ${T(`\\tfrac{${cn}}{${cd}}=\\tfrac{${n128}}{128}`)}, so ${T(coarseT + `=${d.W}\\tfrac{${n128}}{128}`)} in.`,
      run: (c) => show(c, line(P, T(`${coarseT}\\text{ in}=${d.W}\\tfrac{${n128}}{128}\\text{ in}`))) });
    steps.push({ cap: `Add: ${T((d.s16 ? `${d.W}\\tfrac{${n128}}{128}` : String(d.W)) + `+\\tfrac{${d.N}}{128}=${ansT}`)} in${gt === 1 ? `, already in lowest terms (${tot} is odd)` : ''}.`,
      run: async (c) => { await show(c, line(P, T((d.s16 ? `${d.W}\\tfrac{${n128}}{128}` : String(d.W)) + `\\text{ in}+\\tfrac{${d.N}}{128}\\text{ in}=\\boldsymbol{${ansT}\\text{ in}}`), 'u10l3-big')); } });
    steps.push({ cap: `Check against the metric reading: ${T(`${ansT}\\text{ in}\\approx${dec.toFixed(3)}\\text{ in}`)} and ${T(`${f2(d.mm)}\\div25.4\\approx${mmIn.toFixed(3)}\\text{ in}`)}, the same to the nearest ${T('\\tfrac{1}{128}')} in.`,
      run: async (c) => { await show(c, line(P, `Check: ${T(`${ansT}\\approx${dec.toFixed(3)}`)} and ${T(`${f2(d.mm)}\\div25.4\\approx${mmIn.toFixed(3)}`)}`, 'u10l3-sm')); const s = stamp(P, '✓', { ok: true, size: 'sm' }); s.classList.add('u10l3-stampP'); await stampIn(c, s); } });
    return steps;
  }
};

/* =============================== explainer: choosing the device =============================== */
const ITEMS = [
  { p: '(a)', t: 'The length of a hockey rink', est: 'about 60 m long: track or field size', path: ['q1', 'trundle'], ans: 'trundle wheel' },
  { p: '(b)', t: 'The width of a doorway', est: 'about 90 cm: room size', path: ['q1', 'tape'], ans: 'tape measure' },
  { p: '(c)', t: 'The thickness of a stack of 10 coins', est: 'about 2 cm, fits on a desk; to find one coin we want a fraction of a millimetre', path: ['q1', 'q2', 'caliper'], ans: 'vernier caliper' },
  { p: '(d)', t: 'The diameter of a small drill bit', est: 'a few millimetres; close sizes differ by hundredths of a millimetre', path: ['q1', 'q2', 'micro'], ans: 'micrometer' },
  { p: '(e)', t: 'The length of a pencil', est: 'about 19 cm, fits on a desk; the nearest millimetre is plenty', path: ['q1', 'q2', 'ruler'], ans: 'ruler' }
];
const choose = {
  title: 'Choosing the right device',
  height: 470,
  choices: [{ v: 'ladder', label: 'Size and precision' }, { v: 'ex3', label: 'Example 3 check' }, { v: 'ex4a', label: 'Example 4(a) check' }],
  intro: (k) => (k === 'ladder' ? 'Each device suits a range of sizes and reads to its own precision. Press <b>Next</b>.' : 'Two questions: <b>how big</b> is it, and <b>how precise</b> must the reading be? Press <b>Next</b>.'),
  make(stage, key, ex) {
    const W = ex.W;
    if (key === 'ladder') {
      const ov = overlay(stage, W, 470), x0 = 70, x1 = W - 40, ax = 418, D = (x1 - x0) / 8, X = (m) => x0 + (Math.log10(m) + 5) * D;
      S('line', { x1: x0, x2: x1, y1: ax, y2: ax, class: 'u10l3-tk u10l3-tkM' }, ov);
      ['0.01 mm', '0.1 mm', '1 mm', '1 cm', '10 cm', '1 m', '10 m', '100 m', '1 km'].forEach((t, i) => { S('line', { x1: x0 + i * D, x2: x0 + i * D, y1: ax - 8, y2: ax + 8, class: 'u10l3-tk u10l3-tkM' }, ov); txt(ov, x0 + i * D, ax + 24, t, { class: 'u10l3-st u10l3-stB' }); });
      const B = [
        { k: 'micrometer', n: 'Micrometer', a: 1e-5, b: 0.025, pr: 'reads to 0.01 mm', col: '#7b4fc4' },
        { k: 'caliper', n: 'Vernier caliper', a: 5e-5, b: 0.15, pr: 'reads to 0.05 mm', col: '#1f5bd6' },
        { k: 'ruler', n: 'Ruler', a: 1e-3, b: 0.3, pr: 'reads to 1 mm', col: '#c27a0e' },
        { k: 'tape', n: 'Tape measure', a: 0.01, b: 30, pr: 'room dimensions', col: '#12805a' },
        { k: 'trundle', n: 'Trundle wheel', a: 1, b: 1000, pr: 'long distances', col: '#c93a33' }
      ];
      const rows = B.map((b, i) => {
        const y = 22 + i * 74, g = S('g', { opacity: 0 }, ov);
        S('rect', { x: X(b.a), y, width: X(b.b) - X(b.a), height: 50, rx: 12, fill: b.col, 'fill-opacity': 0.14, stroke: b.col, 'stroke-width': 2.5 }, g);
        const lab = hidden(add(stage, h('div', 'u10l3-band', `${icon(b.k)}<span class="u10l3-bn"><b>${b.n}</b><small>${b.pr}</small></span>`), X(b.a) + 8, y + 3));
        lab.style.setProperty('--c', b.col);
        return { g, lab };
      });
      return [
        { cap: 'A size ladder: each step to the right is <b>10 times</b> bigger, from a hundredth of a millimetre to a kilometre.', run: (c) => sleep(c, 200) },
        { cap: 'The <b>micrometer</b>: very small objects, to the nearest <b>0.01 mm</b>.', run: async (c) => { await appear(c, rows[0].g, 400); await pop(c, rows[0].lab); } },
        { cap: 'The <b>vernier caliper</b>: small objects (outside, inside, depth) to a fine fraction of a millimetre, here <b>0.05 mm</b>.', run: async (c) => { await appear(c, rows[1].g, 400); await pop(c, rows[1].lab); } },
        { cap: 'The <b>ruler</b>: lengths that fit on a desk, to the nearest <b>1 mm</b>.', run: async (c) => { await appear(c, rows[2].g, 400); await pop(c, rows[2].lab); } },
        { cap: 'The <b>tape measure</b>: flexible, for room dimensions and other medium lengths.', run: async (c) => { await appear(c, rows[3].g, 400); await pop(c, rows[3].lab); } },
        { cap: 'The <b>trundle wheel</b>: rolled along the ground for long distances.', run: async (c) => { await appear(c, rows[4].g, 400); await pop(c, rows[4].lab); } },
        { cap: 'The ranges <b>overlap</b> (these are typical sizes). Pick the device that fits the size <b>and</b> gives the precision the job needs.', run: (c) => sleep(c, 200) }
      ];
    }
    const F = new Flowchart(stage, {
      x: 0, y: 0, width: W, height: 470,
      nodes: {
        q1: { x: 330, y: 50, w: 330, h: 64, html: '<b>How big is it?</b>', cls: 'bk-round', color: 'brand' },
        trundle: { x: 110, y: 180, w: 196, h: 74, html: `${icon('trundle', 'sm')}<b>Trundle wheel</b>`, color: 'red' },
        tape: { x: 340, y: 180, w: 196, h: 74, html: `${icon('tape', 'sm')}<b>Tape measure</b>`, color: 'green' },
        q2: { x: 690, y: 180, w: 300, h: 64, html: '<b>How precise must it be?</b>', cls: 'bk-round', color: 'brand' },
        ruler: { x: 500, y: 340, w: 190, h: 74, html: `${icon('ruler', 'sm')}<b>Ruler</b>`, color: 'amber' },
        caliper: { x: 700, y: 340, w: 190, h: 74, html: `${icon('caliper', 'sm')}<b>Vernier caliper</b>`, color: 'blue' },
        micro: { x: W - 104, y: 340, w: 190, h: 74, html: `${icon('micrometer', 'sm')}<b>Micrometer</b>`, color: 'purple' }
      },
      edges: [
        { from: 'q1', to: 'trundle', label: 'track or field' }, { from: 'q1', to: 'tape', label: 'room' }, { from: 'q1', to: 'q2', label: 'fits on a desk' },
        { from: 'q2', to: 'ruler', label: 'nearest mm' }, { from: 'q2', to: 'caliper', label: '0.05 mm' }, { from: 'q2', to: 'micro', label: '0.01 mm' }
      ]
    });
    const card = add(stage, box(h('div', 'u10l3-item'), 360, 150), 16, 300);
    const setItem = (it) => { card.innerHTML = `<div class="u10l3-ip">${it.p}</div><div class="u10l3-it">${it.t}</div><div class="u10l3-ie">${it.est}</div><div class="u10l3-ia"></div>`; };
    const run1 = (it) => async (c) => { F.reset(); setItem(it); await fadeIn(c, card, 250); await F.light(c, it.path, { pause: 250 }); const a = card.querySelector('.u10l3-ia'); a.innerHTML = '→ <b>' + it.ans + '</b>'; await pop(c, a); };
    if (key === 'ex4a') {
      const it = { p: 'Ex 4(a)', t: 'A small steel ball bearing’s diameter, to the nearest 0.01 mm', est: 'small, and hundredths of a millimetre are asked for', path: ['q1', 'q2', 'micro'], ans: 'micrometer' };
      return [
        { cap: 'A ball bearing is small: it fits on a desk.', run: async (c) => { setItem(it); await fadeIn(c, card, 250); await F.light(c, ['q1', 'q2'], { pause: 250 }); } },
        { cap: 'The nearest <b>0.01 mm</b> is asked for: only the <b>micrometer</b> reads that finely.', run: async (c) => { await F.go(c, 'q2', 'micro'); await F.visit(c, 'micro'); const a = card.querySelector('.u10l3-ia'); a.innerHTML = '→ <b>micrometer</b>'; await pop(c, a); } },
        { cap: 'Why not a ruler? Its marks are <b>1 mm</b> apart, 100 times coarser than 0.01 mm, and it can’t close squarely on a sphere.', run: async (c) => { const n = F.node('ruler'); n.classList.add('u10l3-nope'); await pulse(c, n, 1.06); } }
      ];
    }
    return ITEMS.map((it) => ({ cap: `${it.p} ${it.t}: ${it.est} → <b>${it.ans}</b>.`, run: run1(it) }));
  }
};

/* =============================== explainer: Example 4 check (Extension) =============================== */
const bearing = {
  title: 'Example 4 check: the ball bearing',
  height: 420,
  intro: 'Choose the instrument, then read it. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, R = 4.63, r0 = 5.6;
    const M = new Micrometer(stage, { s: 4.5, x: 6, y: 34, r: r0, rmax: 5.8 });
    const wcm = r0 * 0.55 + 3.62, k = Math.min(70, (W - M.W - 26) / wcm);
    const MS = new MicroScale(stage, { R, r0, rmax: r0, mlo: 0, k, x: W - 8 - wcm * k, y: 30 });
    const P = panel(stage, 10, M.H + 44, M.W - 4, 420 - M.H - 56, 'Reading');
    const ball = S('g', {}, M.objF);
    S('circle', { cx: R / 2, cy: 0, r: R / 2, class: 'u10l3-ball', 'vector-effect': 'non-scaling-stroke' }, ball);
    S('circle', { cx: R / 2 - 0.7, cy: -0.7, r: 0.6, fill: '#fff', 'fill-opacity': 0.8 }, ball);
    const sync = (c, r, ms) => Promise.all([M.turn(c, r, ms), MS.turn(c, r, ms)]);
    let rul;
    return [
      { cap: '(a) The diameter is wanted to the nearest <b>0.01 mm</b>: use a <b>micrometer</b>. A ruler’s marks are 1 mm apart, 100 times coarser, and a ruler can’t close squarely on a sphere.',
        run: async (c) => {
          rul = S('g', {}, M.objF);
          S('rect', { x: -1, y: 6.5, width: 9, height: 4, class: 'u10l3-rulerB', 'vector-effect': 'non-scaling-stroke' }, rul);
          for (let m = 0; m <= 7; m++) S('line', { x1: m, x2: m, y1: 6.5, y2: m % 5 ? 8 : 9, class: 'u10l3-tk', 'vector-effect': 'non-scaling-stroke' }, rul);
          rul.style.opacity = 0; await appear(c, rul, 400);
        } },
      { cap: '(b) Turn the ratchet until the spindle closes on the ball.',
        run: async (c) => { rul.remove(); await sync(c, R, 2000); } },
      { cap: 'Sleeve: count 1, 2, 3, 4, then the half mark below the line: <b>4.5 mm</b> is the last mark showing.',
        run: async (c) => { await MS.count(c, 4.5); MS.hiCoarse(4.5); await show(c, line(P, `<span class="u10l3-co">Coarse (sleeve)</span> ${T('4.5\\text{ mm}')}`)); } },
      { cap: `Thimble: the index line is on <b>13</b>: ${T('13\\times0.01=0.13\\text{ mm}')}.`,
        run: async (c) => { await MS.hiFine(c, 13); await show(c, line(P, `<span class="u10l3-fi">Fine (thimble)</span> ${T('13\\times0.01=0.13\\text{ mm}')}`)); } },
      { cap: `Diameter: ${T('4.5+0.13=4.63\\text{ mm}')}.`,
        run: async (c) => { await show(c, line(P, T('4.5+0.13=\\boldsymbol{4.63\\text{ mm}}'), 'u10l3-big')); const s = stamp(P, '4.63 mm', { ok: true, size: 'sm' }); s.classList.add('u10l3-stampP'); await stampIn(c, s); } }
    ];
  }
};

/* =============================== mount =============================== */
mountWarm();
mountStatics();
export const explainers = mountExplainers({ precision, mtour, mread, vtour, vread, why, vinch, choose, bearing });
export const _test = { MREAD, VREAD, VIN, ITEMS, MicroScale, VScale };
