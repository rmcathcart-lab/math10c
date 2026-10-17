/* Math 10C · Unit 7 · Lesson 4 — Using slope–point form to determine the equation of a line.
 * Warm-up balloon, the Section 1 and Example 4 figures, and the explainers:
 *   build (STAR: the slope formula with one point fixed and P(x, y) sliding along the line, the fraction staying equal to m,
 *          then the run jumping across to give y − y₁ = m(x − x₁); chips: the idea, the walkthrough, the warm-up balloon),
 *   anyPoint (pin different points of one line: different-looking equations, one line),
 *   plug (Example 1: the slope and the coordinates drop into the pattern; the sign trap −(−3) → +3),
 *   toMxB (Example 2: expand and isolate y, then walk from the point to the y-axis to check b),
 *   race (Example 3: Priya's y = mx + b against Deshawn's slope–point form, line by line, then general form),
 *   grid (Example 4a: grid points → slope → slope–point → y = mx + b → general form → check),
 *   read (Example 4b: line the equation up with the pattern and read m and (x₁, y₁), then check on a grid),
 *   strategy (flowchart: turn the clues into a slope and a point; chips Examples 5–8),
 *   solve5 … solve8 (each of Examples 5–8 on a grid; perpendicular slopes by giving the slope triangle a quarter turn).
 * Colours: run amber, rise purple, lines blue, fixed point (x₁, y₁) teal, moving point P red, y-intercept green. */
import {
  h, tex, add, box, Graph, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween, pulse,
  texNum, svgEl, liveCtx, place, drawIn, anim, rightMark, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const RUN = COLORS.amber, RISE = COLORS.purple, LINE = COLORS.blue, FIX = COLORS.teal, MOV = COLORS.red, YI = COLORS.green,
  INK = COLORS.ink, GRAY = COLORS.gray;
const tc = (c) => (s) => `\\textcolor{${c}}{${s}}`;
const cR = tc(RISE), cU = tc(RUN), cF = tc(FIX), cP = tc(MOV), cB = tc(LINE), cG = tc(YI);
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
/* ---- tiny rational arithmetic: { n, d } with d > 0, lowest terms ---- */
const Q = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; };
const qv = (q) => q.n / q.d;
const qMul = (a, b) => Q(a.n * b.n, a.d * b.d);
const qAdd = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
const qAbs = (a) => Q(Math.abs(a.n), a.d);
/** TeX of a rational: whole numbers plain, else (−)\tfrac (or \dfrac with big) */
const qT = (q, big) => (q.d === 1 ? String(q.n) : (q.n < 0 ? '-' : '') + `\\${big ? 'd' : 't'}frac{${Math.abs(q.n)}}{${q.d}}`);
/** thousands with a thin space (TeX) */
const tn = (v) => { const s = texNum(v); return Math.abs(v) >= 1000 ? s.replace(/(\d)(\d{3})$/, '$1\\,$2') : s; };
/** plain-text number with a real minus and a narrow space for thousands */
const n = (v) => { const s = String(Math.round(v * 100) / 100).replace('-', '−'); return Math.abs(v) >= 1000 ? s.replace(/(\d)(\d{3})$/, '$1\u202f$2') : s; };
const par = (v) => (v < 0 ? `(${tn(v)})` : tn(v));
/** coefficient in front of a variable: 1 → '', −1 → '-' */
const cx = (q) => (q.d === 1 && q.n === 1 ? '' : q.d === 1 && q.n === -1 ? '-' : qT(q));
/** a·v + c as TeX */
const linTex = (a, c, v = 'x') => {
  if (a.n === 0) return qT(c);
  return `${cx(a)}${v}` + (c.n === 0 ? '' : (c.n > 0 ? '+' : '-') + qT(qAbs(c)));
};
/** y − y₁ tidied: y−5, y+3, y */
const yPart = (y1, yv = 'y') => (y1 > 0 ? `${yv}-${tn(y1)}` : y1 < 0 ? `${yv}+${tn(-y1)}` : yv);
/** m(x − x₁) tidied: 5(x-4), -6(x-2), \tfrac13(x+8), 4x */
const xPart = (m, x1, xv = 'x') => `${cx(m)}` + (x1 > 0 ? `(${xv}-${tn(x1)})` : x1 < 0 ? `(${xv}+${tn(-x1)})` : xv);
const spTidy = (m, P, xv = 'x', yv = 'y') => `${yPart(P[1], yv)}=${xPart(m, P[0], xv)}`;
/** raw substitution, brackets kept: y-(-3)=-6(x-2) */
const spRaw = (m, P, xv = 'x', yv = 'y') => `${yv}-${par(P[1])}=${qT(m)}` + (P[0] < 0 ? `\\bigl(${xv}-${par(P[0])}\\bigr)` : `(${xv}-${par(P[0])})`);
/** y = mx + b from a slope and a point */
const yInt = (m, P) => qAdd(Q(P[1]), qMul(m, Q(-P[0])));
const show = (c, el) => fadeIn(c, el, 320);
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u7l4-panel ' + cls, title ? `<div class="u7l4-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u7l4-line ' + cls, html); p.appendChild(d); return d; };
const okStamp = (host, text) => { const s = stamp(host, text, { ok: true }); s.classList.add('u7l4-stampb'); return s; };

/** move an element (HTML) from one element's spot to another's inside a stage, then land it */
async function fly(c, stage, fromEl, toEl, html, cls = '') {
  const S = stage.getBoundingClientRect(), k = S.width / (stage.offsetWidth || S.width) || 1;
  const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
  const ax = (a.left + a.width / 2 - S.left) / k, ay = (a.top + a.height / 2 - S.top) / k;
  const bx = (b.left + b.width / 2 - S.left) / k, by = (b.top + b.height / 2 - S.top) / k;
  const f = add(stage, h('div', 'u7l4-fly ' + cls, html), ax, ay);
  f.style.translate = '-50% -50%';
  await anim(c, f, [{ left: ax + 'px', top: ay + 'px', transform: 'scale(1)' }, { left: (ax + bx) / 2 + 'px', top: Math.min(ay, by) - 40 + 'px', transform: 'scale(1.25)', offset: 0.5 }, { left: bx + 'px', top: by + 'px', transform: 'scale(1)' }], 750);
  f.remove();
}

/* ---------------------------------------------------------------------------------------------------------------
 * Slope triangle on a Graph: run leg (amber) from (x, y) across, then rise leg (purple) up/down to the line.
 * ------------------------------------------------------------------------------------------------------------- */
class SlopeTri {
  constructor(G, s, o = {}) {
    this.G = G; this.s = Object.assign({}, s); this.o = o;
    const L = o.layer || G.layers.data, w = o.w || 5;
    this.g = svgEl('g', { class: 'u7l4-tri' }, L);
    this.fill = svgEl('path', { fill: o.fill || LINE, 'fill-opacity': o.fillOp ?? 0.1, stroke: 'none' }, this.g);
    this.runP = svgEl('path', { class: 'bk-stroke', stroke: RUN, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, this.g);
    this.riseP = svgEl('path', { class: 'bk-stroke', stroke: RISE, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, this.g);
    this.lRun = o.labels === false ? null : h('div', 'bk-lab u7l4-tlab u7l4-trun');
    this.lRise = o.labels === false ? null : h('div', 'bk-lab u7l4-tlab u7l4-trise');
    if (this.lRun) G.html.append(this.lRun, this.lRise);
    G.track(this.g, () => this.draw());
  }
  text(kind, v) { const f = kind === 'run' ? this.o.runText : this.o.riseText; return f ? f(v) : `<b>${kind}</b> ${n(v)}`; }
  draw() {
    const G = this.G, { x, y, run, rise } = this.s;
    const P = G.toPx(x, y), C = G.toPx(x + run, y), R = G.toPx(x + run, y + rise);
    const d = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    this.fill.setAttribute('d', `M${P[0]} ${P[1]} L${C[0]} ${C[1]} L${R[0]} ${R[1]} Z`);
    this.runP.setAttribute('d', d(P, C)); this.riseP.setAttribute('d', d(C, R));
    this.runP.style.display = Math.abs(run) < 1e-9 ? 'none' : ''; this.riseP.style.display = Math.abs(rise) < 1e-9 ? 'none' : '';
    if (!this.lRun) return;
    this.lRun.innerHTML = this.text('run', run); this.lRise.innerHTML = this.text('rise', rise);
    const gap = this.o.gap ?? 6;
    place(this.lRun, (P[0] + C[0]) / 2, P[1], this.o.runSide || (rise >= 0 ? 's' : 'n'), gap);
    place(this.lRise, C[0], (C[1] + R[1]) / 2, this.o.riseSide || (run >= 0 ? 'e' : 'w'), gap + 2);
    const tiny = Math.abs(run) < 1e-9 && Math.abs(rise) < 1e-9;
    this.lRun.style.visibility = Math.abs(run) < 1e-9 || tiny ? 'hidden' : '';
    this.lRise.style.visibility = Math.abs(rise) < 1e-9 || tiny ? 'hidden' : '';
  }
  set(s) { Object.assign(this.s, s); this.draw(); return this; }
  els() { return [this.g, this.lRun, this.lRise].filter(Boolean); }
  async drawIn(c, ms = 500) {
    const [lr, ls] = [this.lRun, this.lRise]; this.fill.style.opacity = 0; hide(lr); hide(ls);
    await drawIn(this.runP, ms, c); if (lr) await fadeIn(c, lr, 220);
    await drawIn(this.riseP, ms, c); if (ls) await fadeIn(c, ls, 220);
    await appear(c, this.fill, 250);
  }
  remove() { this.G.remove(this.g); if (this.lRun) { this.lRun.remove(); this.lRise.remove(); } }
}

/** a "pin" ring around the fixed point (x₁, y₁) */
function pinRing(G, x, y) {
  const g = svgEl('circle', { r: 13, fill: 'none', stroke: FIX, 'stroke-width': 3, 'stroke-dasharray': '5 4' }, G.layers.top);
  g.gx = x; g.gy = y;
  G.track(g, () => { const [px, py] = G.toPx(g.gx, g.gy); g.setAttribute('cx', px); g.setAttribute('cy', py); });
  return g;
}
const moveRing = (G, g, x, y) => { g.gx = x; g.gy = y; g._bkDraw(); };

/** put thin spaces into 4-digit axis numbers (1000 → 1 000) */
function thinAxis(G) { G.svg.querySelectorAll('.bk-num').forEach((t) => { if (/^\d{4}$/.test(t.textContent)) t.textContent = t.textContent.replace(/(\d)(\d{3})$/, '$1\u202f$2'); }); }

/* =============================== warm-up: the balloon =============================== */
function mountBalloon() {
  const host = document.getElementById('u7l4-sky'); if (!host) return;
  const W = 560, H = 330, gy = 290, top = 40, hy = (hh) => gy - (gy - top) * hh / 1000, BX = 300;
  const wrap = h('div', 'u7l4-skywrap'); box(wrap, W, H); host.appendChild(wrap);
  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, wrap);
  svgEl('rect', { x: 0, y: 0, width: W, height: H, rx: 14, fill: '#d6e9f8' }, svg);
  svgEl('rect', { x: 0, y: gy, width: W, height: H - gy, fill: '#8cbf6a' }, svg);
  [[430, 70], [150, 120], [470, 200]].forEach(([x, y]) => { [[0, 0, 15], [17, 5, 18], [35, 0, 14]].forEach(([dx, dy, r]) => svgEl('circle', { cx: x + dx, cy: y + dy, r, fill: '#fff', opacity: 0.9 }, svg)); });
  // altitude scale
  svgEl('line', { x1: 70, x2: 70, y1: hy(0), y2: hy(1000), stroke: INK, 'stroke-width': 3 }, svg);
  const html = h('div', 'bk-html'); wrap.appendChild(html);
  const lab = (x, y, s, pos, cls) => { const d = h('div', 'bk-lab ' + cls, s); html.appendChild(d); return place(d, x, y, pos, 4); };
  for (let v = 0; v <= 1000; v += 200) { svgEl('line', { x1: 62, x2: 78, y1: hy(v), y2: hy(v), stroke: INK, 'stroke-width': 2.5 }, svg); lab(58, hy(v), n(v), 'w', 'u7l4-sknum'); }
  lab(70, hy(1000) - 6, 'm', 'n', 'u7l4-sknum');
  // landing target
  svgEl('ellipse', { cx: BX, cy: gy + 14, rx: 48, ry: 12, fill: '#fff', stroke: INK, 'stroke-width': 1.5 }, svg);
  svgEl('ellipse', { cx: BX, cy: gy + 14, rx: 28, ry: 7, fill: MOV }, svg);
  // guide line and balloon
  const guide = svgEl('line', { x1: 78, x2: BX - 30, stroke: MOV, 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
  const b = svgEl('g', {}, svg); b.style.transformBox = 'view-box'; b.style.transformOrigin = '0 0';
  svgEl('path', { d: 'M-12 -2 L-7 22 M12 -2 L7 22', stroke: INK, 'stroke-width': 1.8 }, b);
  svgEl('path', { d: 'M0 2 C-40 -22 -32 -64 0 -64 C32 -64 40 -22 0 2 Z', fill: MOV, stroke: INK, 'stroke-width': 2.4 }, b);
  svgEl('path', { d: 'M0 2 C-14 -22 -11 -62 0 -64 C11 -62 14 -22 0 2 Z', fill: '#ffeab3' }, b);
  svgEl('rect', { x: -8, y: 22, width: 16, height: 12, rx: 2, fill: '#a86d1c', stroke: INK, 'stroke-width': 1.6 }, b);
  const clock = lab(W - 20, 22, '', 'sw', 'u7l4-clock');
  const hl = lab(BX + 34, 0, '', 'e', 'u7l4-skh');
  let t = 5;
  const set = (tt) => {
    t = tt; const hh = Math.max(0, 1000 - 40 * tt), py = hy(hh);
    b.setAttribute('transform', `translate(${BX} ${py - 34})`);
    guide.setAttribute('y1', py); guide.setAttribute('y2', py);
    const mm = Math.floor(tt + 1e-9), ss = Math.round((tt - mm) * 60);
    clock.innerHTML = `10:${String(mm).padStart(2, '0')}${ss ? ':' + String(ss).padStart(2, '0') : ''}`;
    hl.innerHTML = `${n(Math.round(hh))} m`; place(hl, BX + 36, py - 40, 'e', 4);
  };
  set(5);
  let gen = 0;
  host.parentElement.querySelectorAll('[data-u7l4-t]').forEach((btn) => btn.addEventListener('click', () => {
    const to = +btn.dataset.u7l4T, from = t, my = ++gen, c = liveCtx();
    tween(c, Math.min(2600, 300 + Math.abs(to - from) * 110), (k) => { if (my !== gen) return false; set(from + (to - from) * k); });
  }));
}

/* =============================== static figures =============================== */
function mountFigures() {
  const s1 = document.getElementById('u7l4-s1fig');
  if (s1) {
    const G = new Graph(s1, { width: 370, height: 330, xmin: -1, xmax: 7, ymin: -1, ymax: 6, numbers: false });
    G.line({ m: 0.75, b: 0.25 }, { color: LINE, width: 4 });
    const t = new SlopeTri(G, { x: 1, y: 1, run: 4, rise: 3 }, { fillOp: 0.08, runText: () => `run ${T('=x-x_1')}`, riseText: () => `rise ${T('=y-y_1')}` });
    void t;
    G.point(1, 1, { color: FIX, label: T('(x_1,y_1)'), pos: 'nw' });
    G.point(5, 4, { color: MOV, label: T('P(x,y)'), pos: 'nw' });
  }
  const e4 = document.getElementById('u7l4-ex4fig');
  if (e4) {
    const G = new Graph(e4, { width: 400, height: 400, xmin: -7, xmax: 7, ymin: -7, ymax: 7, xlabels: 2, ylabels: 2 });
    G.line({ m: 2, b: 2 }, { color: INK, width: 3.5 });
    G.point(-3, -4, { color: INK, label: T('(-3,-4)'), pos: 'se' });
    G.point(1, 4, { color: INK, label: T('(1,4)'), pos: 'se' });
  }
}

/* =============================== explainer 1 (STAR): build slope–point form =============================== */
const BD = {
  idea: { label: 'The idea', A: [-3, -2], m: Q(2, 3), win: { xmin: -7, xmax: 7, ymin: -7, ymax: 7 }, xl: 2, yl: 2, P0: 3, stops: [6, -6, 3], gen: true, stampAt: [4.2, -5] },
  walk: { label: 'Walkthrough: ' + T('m=4,\\ A(2,-1)'), A: [2, -1], m: Q(4), win: { xmin: -2, xmax: 6, ymin: -10, ymax: 10 }, xl: 1, yl: 2, P0: 3, stops: [4, 0, 3], stampAt: [4.3, -6.5] },
  balloon: { label: 'Warm-up balloon', A: [5, 800], m: Q(-40), win: { xmin: 0, xmax: 30, ymin: 0, ymax: 1100, xstep: 5, ystep: 100 }, xl: 5, yl: 200, P0: 10, stops: [15, 0, 10], xv: 't', yv: 'h', stampAt: [21, 900] }
};
const build = {
  title: 'Slope–point form: one point fixed, one point free',
  height: 530,
  choices: Object.keys(BD).map((k) => ({ v: k, label: BD[k].label })),
  intro: (k) => (k === 'balloon'
    ? 'The balloon’s height–time line: one known point, <b>(5, 800)</b> (10:05, 800 m), and slope <b>−40</b> m per minute. Press <b>Next</b>.'
    : 'Fix one point on a line. Let a second point <b>slide</b> along it. Watch the slope between them. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = BD[k], [x1, y1] = d.A, m = d.m, mv = qv(m), xv = d.xv || 'x', yv = d.yv || 'y', gen = !!d.gen;
    const f = (x) => y1 + mv * (x - x1);
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 450, height: 502, xlabels: d.xl, ylabels: d.yl, xtitle: xv, ytitle: yv }, d.win));
    G.track(svgEl('g', {}, G.layers.data), () => thinAxis(G));
    const gStamp = (text) => { const [sx, sy] = G.toPx(...d.stampAt); return stamp(stage, text, { ok: true, x: 14 + sx, y: 14 + sy }); };
    const Pn = panel(stage, 482, 14, ex.W - 496, 502, 'Slope from the fixed point to P');
    const rows = h('div', 'u7l4-ptrows'); Pn.appendChild(rows);
    const Aname = gen ? T(cF('(x_1,y_1)')) : T(cF(`A(${tn(x1)},${tn(y1)})`));
    const rowA = h('div', 'u7l4-ptrow u7l4-ptA', `<span class="u7l4-ptk">fixed</span>${Aname}`); rows.appendChild(rowA);
    const rowP = h('div', 'u7l4-ptrow u7l4-ptP', '<span class="u7l4-ptk">moving</span><span class="u7l4-ptv"></span>'); rows.appendChild(rowP); hide(rowP);
    const ro = h('div', 'u7l4-frbox'); Pn.appendChild(ro); hide(ro);
    const log = h('div', 'u7l4-log'); Pn.appendChild(log);
    // the cross-multiply strip (symbolic)
    const numT = gen ? `${yv}-y_1` : `${yv}-${par(y1)}`, denT = gen ? `${xv}-x_1` : `${xv}-${par(x1)}`, mT = gen ? 'm' : qT(m);
    const fx = h('div', 'u7l4-fx');
    fx.innerHTML = `<div class="u7l4-fxfrac"><div class="u7l4-fxn">${T(cR(numT))}</div><div class="u7l4-fxbar"></div><div class="u7l4-fxd">${T(cU(denT))}</div></div>`
      + `<div class="u7l4-fxeq">${T('=')}</div><div class="u7l4-fxm">${T(cB(mT))}</div><div class="u7l4-fxslot">${T(cU(`(${denT})`))}</div>`;
    Pn.appendChild(fx); hide(fx);
    const [fxN, fxBar, fxD, fxSlot] = ['.u7l4-fxn', '.u7l4-fxbar', '.u7l4-fxd', '.u7l4-fxslot'].map((s) => fx.querySelector(s));
    hide(fxSlot);
    const final = h('div', 'u7l4-spfinal'); Pn.appendChild(final); hide(final);
    const spT = gen ? `${yv}-y_1=m(${xv}-x_1)` : spTidy(m, d.A, xv, yv);
    const spRawT = gen ? spT : `${yv}-${par(y1)}=${qT(m)}(${xv}-${par(x1)})`;
    let Pt = null, tri = null, px = d.P0;
    const ptName = (x, y) => `P(${tn(x)},${tn(y)})`;
    const setP = (x) => { px = x; const y = f(x); G.moveTo(Pt, x, y); tri.set({ run: x - x1, rise: y - y1 }); };
    const fracAt = (x) => { const y = f(x), r = y - y1, u = x - x1, val = Q(r, u);
      return `\\dfrac{${yv}-${gen ? 'y_1' : par(y1)}}{${xv}-${gen ? 'x_1' : par(x1)}}=\\dfrac{${cP(tn(y))}-${par(y1)}}{${cP(tn(x))}-${par(x1)}}=\\dfrac{${cR(tn(r))}}{${cU(tn(u))}}=${cB(qT(val))}`; };
    const setRo = (x) => { ro.innerHTML = T(fracAt(x)); rowP.querySelector('.u7l4-ptv').innerHTML = T(cP(ptName(x, f(x)))); };
    const yv0 = f(d.P0), r0 = yv0 - y1, u0 = d.P0 - x1;
    const steps = [
      { cap: gen ? `A line with slope ${T('m')}. <b>Pin</b> one point on it: the <b>fixed</b> point ${T(cF('(x_1,y_1)'))}, here ${T(`(${x1},${y1})`)}.`
        : d.yv ? `Time ${T('t')} (minutes after 10:00) across, height ${T('h')} (m) up. The one reading we have, ${T(cF('(5,800)'))}, is the <b>fixed</b> point; the slope is ${T(cB('-40'))} m/min.`
          : `A line with slope ${T(cB('4'))} passes through the <b>fixed</b> point ${T(cF('A(2,-1)'))}.`,
        run: async (c) => {
          await G.drawIn(G.line({ m: mv, b: f(0) }, { color: LINE, width: 4 }), 700, c);
          await pop(c, G.point(x1, y1, { color: FIX, r: 7.5, label: gen ? T(cF('(x_1,y_1)')) : T(cF(d.yv ? '(5,800)' : 'A(2,-1)')), pos: 'nw' }));
          pinRing(G, x1, y1);
        } },
      { cap: `A second point ${T(cP('P'))} on the line: ${T(cP(ptName(d.P0, yv0)))}. From the fixed point to ${T('P')}: rise ${T(cR(tn(r0)))}, run ${T(cU(tn(u0)))}, slope ${T(`\\tfrac{${tn(r0)}}{${tn(u0)}}=${qT(m)}`)}.`,
        run: async (c) => {
          tri = new SlopeTri(G, { x: x1, y: y1, run: u0, rise: r0 }, { riseSide: 'e' });
          Pt = G.point(d.P0, yv0, { color: MOV, r: 7.5, label: T(cP('P')), pos: mv < 0 ? 'ne' : 'nw' });
          await pop(c, Pt); await tri.drawIn(c, 420);
          setRo(d.P0); await show(c, rowP); await show(c, ro);
        } },
      { cap: `Now let ${T(cP('P'))} <b>slide</b> along the line, even past the fixed point. The rise and the run change, but the fraction <b>stays equal to</b> ${T(cB(qT(m)))}.`,
        run: async (c) => {
          for (const xs of d.stops) {
            ro.style.opacity = 0.3; const xa = px;
            await tween(c, 1300, (t) => setP(xa + (xs - xa) * t));
            setRo(xs); ro.style.opacity = 1; await pulse(c, ro, 1.04);
            const yy = f(xs);
            await show(c, line(log, `${T(cP(ptName(xs, yy)))}: ${T(`\\tfrac{${tn(yy - y1)}}{${tn(xs - x1)}}=${qT(m)}`)}`));
          }
        } },
      { cap: gen ? `So for <b>every</b> point ${T(cP('P(x,y)'))} on the line, rise ${T(cR('y-y_1'))} over run ${T(cU('x-x_1'))} equals ${T(cB('m'))}: ${T('\\dfrac{y-y_1}{x-x_1}=m')}.`
        : `So for <b>any</b> point ${T(cP(`P(${xv},${yv})`))} on the line: ${T(`\\dfrac{${numT}}{${denT}}=${mT}`)}. That one equation describes every position of ${T('P')}.`,
        run: async (c) => {
          Pt.label.innerHTML = T(cP(`P(${xv},${yv})`));
          tri.o.runText = () => `run ${T('=' + denT)}`; tri.o.riseText = () => `rise ${T('=' + numT)}`; tri.draw();
          rowP.querySelector('.u7l4-ptv').innerHTML = T(cP(`P(${xv},${yv})`));
          ro.innerHTML = T(`\\dfrac{${numT}}{${denT}}=${mT}`);
          await pulse(c, Pt.label, 1.2);
          log.style.display = 'none';
          await show(c, fx);
        } },
      { cap: `Clear the fraction: <b>multiply both sides by</b> ${T(`(${denT})`)}. The run jumps across and multiplies the slope: ${T(spRawT)}.`,
        run: async (c) => {
          const S = fx.getBoundingClientRect(), k = S.width / (fx.offsetWidth || S.width) || 1;
          const a = fxD.getBoundingClientRect(), b = fxSlot.getBoundingClientRect(), nn = fxN.getBoundingClientRect(), e = fx.querySelector('.u7l4-fxeq').getBoundingClientRect();
          const dx = (b.left + b.width / 2 - (a.left + a.width / 2)) / k, dy = (b.top + b.height / 2 - (a.top + a.height / 2)) / k;
          await anim(c, fxD, [{ transform: 'translate(0,0)' }, { transform: `translate(${dx / 2}px, ${dy - 46}px)`, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px)` }], 1100);
          fxSlot.style.opacity = 1; fxD.style.opacity = 0;
          await anim(c, fxBar, [{ opacity: 1 }, { opacity: 0 }], 250);
          const ndy = (e.top + e.height / 2 - (nn.top + nn.height / 2)) / k;
          await anim(c, fxN, [{ transform: 'translate(0,0)' }, { transform: `translate(0, ${ndy}px)` }], 500);
          final.innerHTML = `<div class="u7l4-spk">slope–point form</div>${T(spT)}`;
          await pop(c, final);
        } },
      { cap: gen ? `What about the fixed point itself? In the fraction, ${T('P=(x_1,y_1)')} gives ${T('\\tfrac{0}{0}')}: no value. In ${T('y-y_1=m(x-x_1)')} it gives ${T('0=0')} ✓. The new equation works for <b>every</b> point on the line.`
        : `What about the fixed point itself? In the fraction it gives ${T('\\tfrac{0}{0}')}: no value. In ${T(spT)} it gives ${T('0=0')} ✓. So the new equation holds for <b>every</b> point on the <b>entire</b> line.`,
        run: async (c) => {
          const xa = px; await tween(c, 1200, (t) => setP(xa + (x1 - xa) * t));
          ro.innerHTML = T(gen ? `\\dfrac{y_1-y_1}{x_1-x_1}=\\dfrac{0}{0}\\ \\ \\textcolor{${MOV}}{\\text{no value}}`
            : `\\dfrac{${tn(y1)}-${par(y1)}}{${tn(x1)}-${par(x1)}}=\\dfrac{0}{0}\\ \\ \\textcolor{${MOV}}{\\text{no value}}`);
          await pulse(c, ro, 1.05);
          const chk = gen ? `y_1-y_1=m(x_1-x_1)\\ \\Rightarrow\\ 0=0\\ \\checkmark` : `${tn(y1)}-${par(y1)}=${qT(m)}(${tn(x1)}-${par(x1)})\\ \\Rightarrow\\ 0=0\\ \\checkmark`;
          await show(c, line(final, T(chk), 'u7l4-chk'));
        } }
    ];
    // the last step depends on the chip
    const b = yInt(m, d.A);
    if (gen) {
      steps.push({ cap: `That is <b>slope–point form</b>: ${T('y-y_1=m(x-x_1)')}, with ${T(cB('m'))} the slope and ${T(cF('(x_1,y_1)'))} any known point. Put them in and the equation is done.`,
        run: async (c) => { await stampIn(c, gStamp('slope–point form')); } });
    } else if (d.yv) {
      steps.push({ cap: `Expand: ${T('h-800=-40t+200')}, so ${T(`h=-40t+${cG('1\\,000')}`)}: 1 000 m at 10:00 (Q3). Touch down: ${T('h=0')} gives ${T('40t=1\\,000')}, ${T('t=25')}: <b>10:25</b>.`,
        run: async (c) => {
          await show(c, line(final, T(`h=-40t+${cG('1\\,000')}`)));
          await pop(c, G.point(0, 1000, { color: YI, r: 7.5, label: T(cG('(0,1\\,000)')), pos: 'ne' }));
          await pop(c, G.point(25, 0, { color: INK, r: 7.5, label: '10:25', pos: 'ne' }));
          await stampIn(c, gStamp('lands 10:25'));
        } });
    } else {
      steps.push({ cap: `Expand: ${T('y+1=4x-8')}, so ${T(`y=4x${cG('-9')}`)}. The line crosses the ${T('y')}-axis at ${T(cG('-9'))}.`,
        run: async (c) => {
          await show(c, line(final, T(`y+1=4x-8\\ \\Rightarrow\\ y=4x${cG(qT(b).startsWith('-') ? qT(b) : '+' + qT(b))}`)));
          await pop(c, G.point(0, qv(b), { color: YI, r: 7.5, label: T(cG(`(0,${qT(b)})`)), pos: 'e' }));
          await stampIn(c, gStamp('intercept −9'));
        } });
    }
    return steps;
  }
};

/* =============================== explainer 2: any point works =============================== */
const AP = {
  four: { label: 'Slope ' + T('4'), m: Q(4), pts: [[2, -1], [3, 3], [1, -5]], win: { xmin: -2, xmax: 6, ymin: -10, ymax: 10 }, xl: 1, yl: 2 },
  neg: { label: 'Slope ' + T('-\\tfrac{2}{3}'), m: Q(-2, 3), pts: [[-3, 3], [3, -1], [6, -3]], win: { xmin: -7, xmax: 7, ymin: -7, ymax: 7 }, xl: 2, yl: 2 }
};
const anyPoint = {
  title: 'Any point on the line will do',
  height: 480,
  choices: Object.keys(AP).map((k) => ({ v: k, label: AP[k].label })),
  intro: 'One line. <b>Pin</b> a different point each time and write slope–point form. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = AP[k], m = d.m, mv = qv(m), P0 = d.pts[0], b = yInt(m, P0), f = (x) => qv(b) + mv * x;
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 430, height: 452, xlabels: d.xl, ylabels: d.yl }, d.win));
    const Pn = panel(stage, 462, 14, ex.W - 476, 452, 'Pin a point, write the equation');
    const tab = h('div', 'u7l4-aptab'); Pn.appendChild(tab);
    const lattice = []; for (let x = Math.ceil(d.win.xmin); x <= d.win.xmax; x++) { const y = f(x); if (Number.isInteger(Math.round(y * 1e9) / 1e9) && y >= d.win.ymin && y <= d.win.ymax) lattice.push([x, y]); }
    let ring = null, tri = null;
    const rows = [];
    const steps = [
      { cap: `One line with slope ${T(cB(qT(m)))}. Several points with whole-number coordinates sit on it.`,
        run: async (c) => {
          await G.drawIn(G.line({ m: mv, b: qv(b) }, { color: LINE, width: 4 }), 700, c);
          for (const [x, y] of lattice) G.point(x, y, { color: GRAY, r: 5 });
          await sleep(c, 200);
        } }
    ];
    d.pts.forEach((P, i) => {
      const mid = linTex(m, qMul(m, Q(-P[0])));   // m x − m x₁
      steps.push({ cap: `${i ? 'Now pin' : 'Pin'} ${T(cF(`(${P[0]},${P[1]})`))} as ${T('(x_1,y_1)')}: ${T(spTidy(m, P))}.${i === 2 ? ' Three different-looking equations…' : ''}`,
        run: async (c) => {
          if (!ring) { ring = pinRing(G, P[0], P[1]); const bk = d.pts.some((q) => q[0] + m.d > d.win.xmax - 0.5); tri = new SlopeTri(G, { x: P[0], y: P[1], run: bk ? -m.d : m.d, rise: bk ? -m.n : m.n }, { fillOp: 0.12, riseSide: 'e' }); }
          else { const a = [ring.gx, ring.gy]; await tween(c, 800, (t) => { const x = a[0] + (P[0] - a[0]) * t, y = a[1] + (P[1] - a[1]) * t; moveRing(G, ring, x, y); tri.set({ x, y }); }); }
          G.point(P[0], P[1], { color: FIX, r: 6.5 });
          const r = h('div', 'u7l4-aprow', `<span class="u7l4-apk">${T(cF(`(${P[0]},${P[1]})`))}</span><span class="u7l4-apeq">${T(spTidy(m, P))}</span><span class="u7l4-apx"></span>`);
          r.dataset.mid = mid; tab.appendChild(r); rows.push(r); await show(c, r);
        } });
    });
    steps.push({ cap: `…but expand each one and they <b>all</b> become ${T('y=' + linTex(m, b))}. Different points, the <b>same line</b>.`,
      run: async (c) => {
        for (const r of rows) { const x = r.querySelector('.u7l4-apx'); x.innerHTML = T(`\\Rightarrow\\ y=${linTex(m, b)}`); await show(c, x); }
        await stampIn(c, okStamp(Pn, 'one line'));
      } });
    return steps;
  }
};

/* =============================== explainer 3: plug into the pattern (Example 1) =============================== */
const PL = {
  a: { label: 'Example 1(a)', P: [4, 7], m: Q(5) },
  b: { label: 'Example 1(b)', P: [2, -3], m: Q(-6) },
  c: { label: 'Example 1(c)', P: [-8, -2], m: Q(1, 3) }
};
const plug = {
  title: 'Into the pattern: substitute, then tidy the signs',
  height: 320,
  choices: Object.keys(PL).map((k) => ({ v: k, label: PL[k].label })),
  intro: 'Three blanks in the pattern: the slope and the two coordinates of the point. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = PL[k], [x1, y1] = d.P, m = d.m;
    const given = add(stage, h('div', 'u7l4-given'), 24, 30);
    given.innerHTML = `<div class="u7l4-gk">Given</div><div class="u7l4-gpt">point ${T('(')}<span class="u7l4-gx">${T(cF(tn(x1)))}</span>${T(',')}<span class="u7l4-gy">${T(cF(tn(y1)))}</span>${T(')')}</div><div class="u7l4-gm">slope <span class="u7l4-gmv">${T(cB(qT(m, true)))}</span></div>`;
    const tm = add(stage, h('div', 'u7l4-tmpl'), 300, 40);
    const slot = (inner, cls) => `<span class="u7l4-slot ${cls}">${T(inner)}</span>`;
    tm.innerHTML = `<span>${T('y-')}</span>${slot(cF('y_1'), 'u7l4-sy')}<span>${T('=')}</span>${slot(cB('m'), 'u7l4-sm')}<span>${T('(x-')}</span>${slot(cF('x_1'), 'u7l4-sx')}<span>${T(')')}</span>`;
    const [sY, sM, sX] = ['.u7l4-sy', '.u7l4-sm', '.u7l4-sx'].map((s) => tm.querySelector(s));
    const tidy = add(stage, h('div', 'u7l4-tidy'), 300, 170); hide(tidy);
    const note = add(stage, h('div', 'u7l4-tnote'), 300, 270); hide(note);
    const neg = x1 < 0 || y1 < 0;
    const fill = (el, v) => { el.innerHTML = T(v); el.classList.add('u7l4-slot-on'); };
    const steps = [
      { cap: `The pattern ${T('y-y_1=m(x-x_1)')} has three blanks: ${T(cB('m'))}, ${T(cF('x_1'))} and ${T(cF('y_1'))}. Both minus signs are <b>part of the pattern</b>: they stay.`,
        run: async (c) => { for (const s of [sY, sM, sX]) await pulse(c, s, 1.15, 380); } },
      { cap: `The slope ${T(qT(m))} goes in for ${T(cB('m'))}.`,
        run: async (c) => { await fly(c, stage, given.querySelector('.u7l4-gmv'), sM, T(cB(qT(m))), 'u7l4-flyb'); fill(sM, cB(qT(m))); await pop(c, sM); } },
      { cap: `The point ${T(`(${x1},${y1})`)}: ${T(`x_1=${x1}`)} goes with ${T('x')}, ${T(`y_1=${y1}`)} goes with ${T('y')}${neg ? '. A negative coordinate goes in <b>with brackets</b>' : ''}.`,
        run: async (c) => {
          await fly(c, stage, given.querySelector('.u7l4-gx'), sX, T(cF(par(x1))), 'u7l4-flyf'); fill(sX, cF(par(x1))); await pop(c, sX);
          await fly(c, stage, given.querySelector('.u7l4-gy'), sY, T(cF(par(y1))), 'u7l4-flyf'); fill(sY, cF(par(y1))); await pop(c, sY);
        } }
    ];
    if (neg) {
      const parts = [];
      if (y1 < 0) parts.push(`${T(`y-(${y1})`)} is ${T(`y+${-y1}`)}`);
      if (x1 < 0) parts.push(`${T(`x-(${x1})`)} is ${T(`x+${-x1}`)}`);
      steps.push({ cap: `Tidy the signs: subtracting a negative is adding. ${parts.join(', and ')}.`,
        run: async (c) => {
          tidy.innerHTML = `<span class="u7l4-tk">tidy</span>${T(spTidy(m, d.P))}`;
          await show(c, tidy);
          note.innerHTML = [y1, x1].filter((v) => v < 0).map((v) => `${T(`-(${v})`)} becomes ${T(`+${-v}`)}`).join('&emsp;'); await show(c, note);
        } });
    }
    steps.push({ cap: `Done: ${T('\\boldsymbol{' + spTidy(m, d.P) + '}')}. Slope–point form needs <b>only substitution</b>, no solving.`,
      run: async (c) => { if (!neg) { tidy.innerHTML = `<span class="u7l4-tk">answer</span>${T(spTidy(m, d.P))}`; await show(c, tidy); } await stampIn(c, stamp(stage, '✓', { ok: true, x: ex.W - 70, y: 210, size: 'lg' })); } });
    return steps;
  }
};

/* =============================== explainer 4: to y = mx + b (Example 2) =============================== */
const TM = {
  a: { label: 'Example 2(a)', m: Q(6), P: [-4, 3], win: { xmin: -6, xmax: 2, ymin: -6, ymax: 30, ystep: 3 }, yl: 6 },
  b: { label: 'Example 2(b)', m: Q(-8), P: [-1, 5], win: { xmin: -4, xmax: 2, ymin: -8, ymax: 10, ystep: 1 }, yl: 2 }
};
const toMxB = {
  title: 'From a point and a slope to y = mx + b',
  height: 470,
  choices: Object.keys(TM).map((k) => ({ v: k, label: TM[k].label })),
  intro: 'Write slope–point form, expand, isolate <b>y</b>, then check <b>b</b> on the graph. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = TM[k], m = d.m, [x1, y1] = d.P, b = yInt(m, d.P), mx1 = qMul(m, Q(-x1)), mv = qv(m);
    const GW = 330;
    const Pn = panel(stage, 14, 14, ex.W - GW - 42, 442, 'The algebra');
    const G = new Graph(stage, Object.assign({ x: ex.W - GW - 14, y: 14, width: GW, height: 442, xlabels: 1, ylabels: d.yl }, d.win));
    const sgn = (q) => (q.n < 0 ? '-' : '+') + qT(qAbs(q));
    const L1 = `y-${tn(y1)}=${qT(m)}\\bigl(x-(${x1})\\bigr)=${xPart(m, x1)}`;
    const L2 = `y-${tn(y1)}=${qT(m)}x${sgn(mx1)}`;
    const L3 = `y=${qT(m)}x${cG(sgn(b))}`;
    const steps = [
      { cap: `Slope–point form with ${T(`m=${qT(m)}`)} and ${T(cF(`(${x1},${y1})`))}: ${T(L1)}.`,
        run: async (c) => {
          await G.drawIn(G.line({ m: mv, b: qv(b) }, { color: LINE, width: 3.5 }), 600, c);
          await pop(c, G.point(x1, y1, { color: FIX, r: 7, label: T(cF(`(${x1},${y1})`)), pos: 'w' }));
          await show(c, line(Pn, T(L1), 'u7l4-mline u7l4-big'));
        } },
      { cap: `Distribute the ${T(qT(m))}: ${T(`${qT(m)}\\times x=${qT(m)}x`)} and ${T(`${qT(m)}\\times${-x1}=${qT(mx1)}`)}.`,
        run: async (c) => { await show(c, line(Pn, T(L2), 'u7l4-mline u7l4-big')); } },
      { cap: `Isolate ${T('y')}: add ${T(tn(y1))} to both sides. ${T(`${qT(mx1)}+${tn(y1)}=${qT(b)}`)}.`,
        run: async (c) => {
          const r = line(Pn, `${T(L3)}<span class="u7l4-badge">${T(`+${tn(y1)}`)} on both sides</span>`, 'u7l4-mline u7l4-big u7l4-boxed'); await show(c, r);
        } },
      { cap: `Check ${T(cG('b'))} on the graph: walk from ${T(`(${x1},${y1})`)} to the ${T('y')}-axis. Run ${T(cU(tn(-x1)))}, so rise ${T(cR(`${-x1}\\times ${par(qv(m))}=${tn(-x1 * mv)}`))}: ${T(`${tn(y1)}${-x1 * mv < 0 ? '' : '+'}${tn(-x1 * mv)}=${cG(qT(b))}`)} ✓.`,
        run: async (c) => {
          const t = new SlopeTri(G, { x: x1, y: y1, run: -x1, rise: -x1 * mv }, { fillOp: 0.08, runSide: mv > 0 ? 's' : 'n', riseSide: 'w' }); await t.drawIn(c, 600);
          await pop(c, G.point(0, qv(b), { color: YI, r: 7.5, label: T(cG(`(0,${qT(b)})`)), pos: mv > 0 ? 'se' : 'ne' }));
          await show(c, line(Pn, `Check: ${T(`${tn(y1)}${-x1 * mv < 0 ? '' : '+'}${tn(-x1 * mv)}=${qT(b)}`)} ✓`, 'u7l4-chk'));
          await stampIn(c, okStamp(Pn, `intercept ${n(qv(b))}`));
        } }
    ];
    return steps;
  }
};

/* =============================== explainer 5: Priya against Deshawn (Example 3) =============================== */
const race = {
  title: 'Two methods, line by line',
  height: 480,
  intro: 'Slope <b>−5</b>, point <b>(4, −2)</b>. Priya uses <b>y = mx + b</b>; Deshawn uses <b>slope–point form</b>. Press <b>Next</b>.',
  make(stage, v, ex) {
    const w = (ex.W - 42) / 2;
    const lane = (x, name, form, cls) => {
      const p = panel(stage, x, 14, w, 330, '', 'u7l4-lane ' + cls);
      p.innerHTML = `<div class="u7l4-lh"><b>${name}</b><span>${T(form)}</span></div><div class="u7l4-track"><i></i><i></i><i></i><i></i></div><div class="u7l4-lines"></div>`;
      return { p, lines: p.querySelector('.u7l4-lines'), dots: [...p.querySelectorAll('.u7l4-track i')], k: 0 };
    };
    const A = lane(14, 'Priya', 'y=mx+b', 'u7l4-lane-p'), B = lane(28 + w, 'Deshawn', 'y-y_1=m(x-x_1)', 'u7l4-lane-d');
    const add1 = async (c, L, html, cls = '') => { const r = h('div', 'u7l4-line u7l4-mline ' + cls, html); L.lines.appendChild(r); L.dots[L.k++].classList.add('on'); await show(c, r); };
    const merge = add(stage, box(h('div', 'u7l4-merge'), ex.W - 28, 112), 14, 356); hide(merge);
    return [
      { cap: `Both start with their pattern and the slope ${T('-5')}. Deshawn puts the point in <b>at the same time</b>.`,
        run: async (c) => { await Promise.all([add1(c, A, T('y=-5x+b')), add1(c, B, T('y-(-2)=-5(x-4)'))]); } },
      { cap: `Priya substitutes the point ${T('(4,-2)')} to find ${T('b')}. Deshawn just expands.`,
        run: async (c) => { await Promise.all([add1(c, A, T('-2=-5(4)+b')), add1(c, B, T('y+2=-5x+20'))]); } },
      { cap: `Priya: ${T('-2=-20+b')}, so ${T('b=18')}. Deshawn subtracts 2 and is <b>finished</b>: ${T('y=-5x+18')}.`,
        run: async (c) => { await Promise.all([add1(c, A, T('-2=-20+b\\ \\Rightarrow\\ b=18')), add1(c, B, T('\\boldsymbol{y=-5x+18}'), 'u7l4-done')]); await stampIn(c, stamp(B.p, 'done', { ok: true, x: w - 60, y: 290 })); } },
      { cap: `Priya needs <b>one more line</b>: put ${T('b=18')} back into ${T('y=-5x+b')}. The same answer, ${T('y=-5x+18')}.`,
        run: async (c) => { await add1(c, A, T('\\boldsymbol{y=-5x+18}'), 'u7l4-done'); await stampIn(c, stamp(A.p, 'done', { ok: true, x: w - 60, y: 290 })); } },
      { cap: `(c) General form: add ${T('5x')} and subtract ${T('18')} on both sides: ${T('\\boldsymbol{5x+y-18=0}')}. Both methods always agree.`,
        run: async (c) => { merge.innerHTML = `<div>${T('y=-5x+18\\ \\Longrightarrow\\ 5x+y-18=0')}</div><div class="u7l4-mnote">Slope–point form builds the point into the equation, so the separate step of <b>solving for b</b> is not needed.</div>`; await show(c, merge); } },
      { cap: `Remember the balloon? Q3 (1 000 m at 10:00) was <b>Priya’s</b> method: find ${T('b')} first. The bridge, ${T('h-800=-40(t-5)')}, was <b>Deshawn’s</b>.`,
        run: async (c) => { await pulse(c, merge, 1.03); } }
    ];
  }
};

/* =============================== explainer 6: from the grid (Example 4a) =============================== */
const grid = {
  title: 'Example 4(a): from a grid to general form',
  height: 480,
  intro: 'Find two grid points, the slope, then the equation in every form. Press <b>Next</b>.',
  make(stage, v, ex) {
    const G = new Graph(stage, { x: 14, y: 14, width: 452, height: 452, xmin: -7, xmax: 7, ymin: -7, ymax: 7, xlabels: 2, ylabels: 2 });
    G.line({ m: 2, b: 2 }, { color: LINE, width: 4 });
    const Pn = panel(stage, 484, 14, ex.W - 498, 452, 'The algebra');
    const lat = [-4, -3, -2, -1, 0, 1, 2].map((x) => [x, 2 * x + 2]);
    let ring;
    return [
      { cap: 'Look where the line crosses grid corners <b>exactly</b>. Any two of these points will do; use the two marked ones.',
        run: async (c) => {
          const rings = lat.map(([x, y]) => G.point(x, y, { color: GRAY, r: 5 }));
          for (const r of rings) await pop(c, r, 200);
          await pop(c, G.point(-3, -4, { color: INK, r: 7, label: T('(-3,-4)'), pos: 'w' }));
          await pop(c, G.point(1, 4, { color: INK, r: 7, label: T('(1,4)'), pos: 'se' }));
        } },
      { cap: `From ${T('(-3,-4)')} to ${T('(1,4)')}: run ${T(cU('4'))}, rise ${T(cR('8'))}. ${T('m=\\dfrac{4-(-4)}{1-(-3)}=\\dfrac{8}{4}=2')}.`,
        run: async (c) => { const t = new SlopeTri(G, { x: -3, y: -4, run: 4, rise: 8 }); await t.drawIn(c, 500); await show(c, line(Pn, T('m=\\dfrac{4-(-4)}{1-(-3)}=\\dfrac{8}{4}=2'), 'u7l4-mline')); } },
      { cap: `Pin ${T(cF('(1,4)'))} as ${T('(x_1,y_1)')}: ${T('y-4=2(x-1)')}.`,
        run: async (c) => { ring = pinRing(G, 1, 4); await pop(c, ring); await show(c, line(Pn, T('y-4=2(x-1)'), 'u7l4-mline')); } },
      { cap: `Expand: ${T('y-4=2x-2')}, so ${T(`y=2x${cG('+2')}`)}. The grid agrees: the line crosses the ${T('y')}-axis at ${T(cG('2'))}.`,
        run: async (c) => { await show(c, line(Pn, T(`y-4=2x-2\\ \\Rightarrow\\ y=2x${cG('+2')}`), 'u7l4-mline')); await pop(c, G.point(0, 2, { color: YI, r: 7.5, label: T(cG('(0,2)')), pos: 'nw' })); } },
      { cap: `General form: move ${T('y')} to the side with the ${T('x')}-term so ${T('A')} stays positive: ${T('0=2x-y+2')}, that is ${T('\\boldsymbol{2x-y+2=0}')}.`,
        run: async (c) => { await show(c, line(Pn, T('\\boldsymbol{2x-y+2=0}'), 'u7l4-mline u7l4-boxed')); } },
      { cap: `Check with the <b>other</b> point, ${T('(-3,-4)')}: ${T('2(-3)-(-4)+2=-6+4+2=0')} ✓.`,
        run: async (c) => { await pulse(c, G.point(-3, -4, { color: YI, r: 9 }), 1.4); await show(c, line(Pn, `Check ${T('(-3,-4)')}: ${T('2(-3)-(-4)+2=0')} ✓`, 'u7l4-chk')); await stampIn(c, okStamp(Pn, 'on the line')); } }
    ];
  }
};

/* =============================== explainer 7: read m and (x₁, y₁) (Example 4b) =============================== */
const RD = {
  trap: { label: 'The sign trap', eq: 'y+4=2(x-3)', rw: `y-${cP('(-4)')}=2(x-3)`, m: Q(2), P: [3, -4], why: `${T('y+4')} is ${T('y-(-4)')}, so ${T('y_1=-4')}, <b>not</b> ${T('4')}. The bracket ${T('x-3')} already matches: ${T('x_1=3')}.`, win: { xmin: -2, xmax: 8, ymin: -9, ymax: 1 } },
  i: { label: 'Example 4(b)(i)', eq: 'y-5=-\\dfrac{2}{3}(x+9)', rw: `y-5=-\\dfrac{2}{3}\\bigl(x-${cP('(-9)')}\\bigr)`, m: Q(-2, 3), P: [-9, 5], why: `${T('y-5')} matches. ${T('x+9')} is ${T('x-(-9)')}, so ${T('x_1=-9')}.`, win: { xmin: -12, xmax: 2, ymin: -3, ymax: 11 } },
  ii: { label: '(ii)', eq: 'y+7=4x', rw: `y-${cP('(-7)')}=4(x-${cP('0')})`, m: Q(4), P: [0, -7], why: `${T('y+7')} is ${T('y-(-7)')}, and a plain ${T('4x')} is ${T('4(x-0)')}: no number with ${T('x')} means ${T('x_1=0')}.`, win: { xmin: -5, xmax: 5, ymin: -9, ymax: 1 } },
  iii: { label: '(iii)', eq: 'y=-6(x-10)', rw: `y-${cP('0')}=-6(x-10)`, m: Q(-6), P: [10, 0], why: `A plain ${T('y')} is ${T('y-0')}, so ${T('y_1=0')}. The bracket ${T('x-10')} matches: ${T('x_1=10')}.`, win: { xmin: -1, xmax: 13, ymin: -8, ymax: 6 } }
};
const read = {
  title: 'Reading m and (x₁, y₁) back out',
  height: 440,
  choices: Object.keys(RD).map((k) => ({ v: k, label: RD[k].label })),
  intro: 'Line the equation up under the pattern, then read the slope and the point. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = RD[k], m = d.m, [x1, y1] = d.P, mv = qv(m);
    const GW = 400;
    const Pn = panel(stage, 14, 14, ex.W - GW - 42, 412, 'Line it up');
    const G = new Graph(stage, Object.assign({ x: ex.W - GW - 14, y: 14, width: GW, height: 412, xlabels: 2, ylabels: 2 }, d.win));
    const pat = line(Pn, `<span class="u7l4-rk">pattern</span>${T(`y-${cF('y_1')}=${cB('m')}(x-${cF('x_1')})`)}`, 'u7l4-rrow u7l4-soft');
    const eq = line(Pn, `<span class="u7l4-rk">given</span>${T(d.eq)}`, 'u7l4-rrow');
    void pat;
    const rw = line(Pn, '', 'u7l4-rrow'); const res = line(Pn, '', 'u7l4-rres'); hide(rw); hide(res);
    const steps = [
      { cap: `Compare ${T(d.eq)} with the pattern. The pattern has <b>minus</b> signs: ${T('y-y_1')} and ${T('x-x_1')}.`,
        run: async (c) => { await pulse(c, eq, 1.05); } },
      { cap: d.why,
        run: async (c) => { rw.innerHTML = `<span class="u7l4-rk">rewrite</span>${T(d.rw)}`; await show(c, rw); } },
      { cap: `So ${T(cB(`m=${qT(m)}`))} and ${T(cF(`(x_1,y_1)=(${x1},${y1})`))}.`,
        run: async (c) => { res.innerHTML = `${T(cB(`m=${qT(m)}`))}<span class="u7l4-gap"></span>${T(cF(`(x_1,y_1)=(${x1},${y1})`))}`; await pop(c, res); } },
      { cap: `Check on the grid: plot ${T(cF(`(${x1},${y1})`))} and step the slope: run ${T(cU(String(m.d)))}, rise ${T(cR(String(m.n)))}. That is the line of ${T(d.eq)}.`,
        run: async (c) => {
          await pop(c, G.point(x1, y1, { color: FIX, r: 7.5, label: T(cF(`(${x1},${y1})`)), pos: mv < 0 ? 'sw' : 'w' }));
          const t = new SlopeTri(G, { x: x1, y: y1, run: m.d, rise: m.n }, { fillOp: 0.12 }); await t.drawIn(c, 420);
          await G.drawIn(G.line({ m: mv, b: y1 - mv * x1 }, { color: LINE, width: 4 }), 700, c);
          await stampIn(c, okStamp(Pn, 'read it right'));
        } }
    ];
    return steps;
  }
};

/* =============================== explainer 8: strategy flowchart =============================== */
const FS = {
  e5: { label: 'Example 5', mS: 'mTwo', pS: 'pTwo', caps: [`Two points: the <b>slope formula</b>, ${T('m=\\dfrac{9-(-3)}{-2-4}=\\dfrac{12}{-6}=-2')}.`, `Either point will do: ${T(cF('P(4,-3)'))}.`, `Slope–point form: ${T('y+3=-2(x-4)')}.`, `Expand and collect: ${T('\\boldsymbol{2x+y-5=0}')}.`] },
  e6: { label: 'Example 6', mS: 'mGiven', pS: 'pX', caps: [`The slope is given: ${T('m=\\tfrac{3}{4}')}.`, `An ${T('x')}-intercept of ${T('8')} is the point ${T(cF('(8,0)'))}.`, `Slope–point form: ${T('y-0=\\tfrac{3}{4}(x-8)')}.`, `Multiply by 4 and collect: ${T('\\boldsymbol{3x-4y-24=0}')}.`] },
  e7: { label: 'Example 7', mS: 'mPerp', pS: 'pGiven', caps: [`Perpendicular to ${T('2x-3y+12=0')} (slope ${T('\\tfrac{2}{3}')}): flip and change the sign, ${T('m=-\\tfrac{3}{2}')}.`, `The point is given: ${T(cF('(-4,2)'))}.`, `Slope–point form: ${T('y-2=-\\tfrac{3}{2}(x+4)')}.`, `Multiply by 2 and collect: ${T('\\boldsymbol{3x+2y+8=0}')}.`] },
  e8: { label: 'Example 8', mS: 'mPerp', pS: 'pX', caps: [`Perpendicular to ${T('4x-9y-27=0')} (slope ${T('\\tfrac{4}{9}')}): ${T('m=-\\tfrac{9}{4}')}.`, `The ${T('x')}-intercept of ${T('3x-5y-15=0')} is ${T('5')}: the point ${T(cF('(5,0)'))}.`, `Slope–point form: ${T('y-0=-\\tfrac{9}{4}(x-5)')}.`, `Multiply by 4 and collect: ${T('\\boldsymbol{9x+4y-45=0}')}.`] }
};
const strategy = {
  title: 'Turn the clues into a slope and a point',
  height: 470,
  choices: Object.keys(FS).map((k) => ({ v: k, label: FS[k].label })),
  intro: 'Every question in this section ends the same way. The work is finding <b>m</b> and <b>a point</b>. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = FS[k], Wf = Math.min(ex.W - 8, 960), s = Wf / 960, X = (v) => v * s;
    const sw = X(270), nodes = {
      mGiven: { x: X(150), y: 40, w: sw, h: 48, html: `<b>given</b> ${T('m')}`, color: LINE },
      mTwo: { x: X(150), y: 102, w: sw, h: 48, html: '<b>two points</b> → slope formula', color: LINE },
      mPar: { x: X(150), y: 164, w: sw, h: 48, html: '<b>parallel</b> line → same slope', color: LINE },
      mPerp: { x: X(150), y: 226, w: sw, h: 48, html: '<b>perpendicular</b> → flip, change sign', color: LINE },
      pGiven: { x: X(810), y: 40, w: sw, h: 48, html: '<b>given</b> point', color: FIX },
      pTwo: { x: X(810), y: 102, w: sw, h: 48, html: '<b>two points</b> → use either', color: FIX },
      pX: { x: X(810), y: 164, w: sw, h: 48, html: `<b>${T('x')}-intercept</b> ${T('a')} → ${T('(a,0)')}`, color: FIX },
      pY: { x: X(810), y: 226, w: sw, h: 48, html: `<b>${T('y')}-intercept</b> ${T('b')} → ${T('(0,b)')}`, color: FIX },
      mN: { x: X(385), y: 133, w: X(130), h: 58, html: `<b>slope</b>${T('m')}`, color: LINE, cls: 'bk-round' },
      pN: { x: X(575), y: 133, w: X(150), h: 58, html: `<b>point</b>${T('(x_1,y_1)')}`, color: FIX, cls: 'bk-round' },
      sp: { x: X(480), y: 330, w: X(330), h: 58, html: `<b>slope–point form</b>${T('y-y_1=m(x-x_1)')}`, color: INK },
      gen: { x: X(480), y: 420, w: X(470), h: 58, html: `<b>tidy up</b>clear fractions, all on one side, ${T('A\\ge0')}`, color: COLORS.brand }
    };
    const edges = ['mGiven', 'mTwo', 'mPar', 'mPerp'].map((id) => ({ from: id, to: 'mN' }))
      .concat(['pGiven', 'pTwo', 'pX', 'pY'].map((id) => ({ from: id, to: 'pN' })))
      .concat([{ from: 'mN', to: 'sp' }, { from: 'pN', to: 'sp' }, { from: 'sp', to: 'gen' }]);
    const F = new Flowchart(stage, { x: Math.max(0, (ex.W - Wf) / 2), y: 2, width: Wf, height: 460, nodes, edges });
    F.el.classList.add('u7l4-flow');
    return [
      { cap: d.caps[0], run: async (c) => { await F.visit(c, d.mS); await F.go(c, d.mS, 'mN'); await F.visit(c, 'mN'); } },
      { cap: d.caps[1], run: async (c) => { await F.visit(c, d.pS); await F.go(c, d.pS, 'pN'); await F.visit(c, 'pN'); } },
      { cap: d.caps[2], run: async (c) => { await Promise.all([F.go(c, 'mN', 'sp'), F.go(c, 'pN', 'sp')]); await F.visit(c, 'sp'); } },
      { cap: d.caps[3], run: async (c) => { await F.go(c, 'sp', 'gen'); await F.visit(c, 'gen'); } }
    ];
  }
};

/* =============================== explainers 9–12: Examples 5–8 on a grid =============================== */
/** a slope triangle (run then rise from a pivot) given a quarter turn counter-clockwise about the pivot */
async function quarterTurn(c, G, pivot, run, rise) {
  const [px, py] = G.toPx(pivot[0], pivot[1]), ux = G.ux, uy = G.uy;
  const g = svgEl('g', {}, G.layers.top); g.style.transformBox = 'view-box'; g.style.transformOrigin = `${px}px ${py}px`;
  const C = [px + run * ux, py], R = [px + run * ux, py - rise * uy];
  svgEl('path', { d: `M${px} ${py} L${C[0]} ${C[1]} L${R[0]} ${R[1]} Z`, fill: GRAY, 'fill-opacity': 0.15, stroke: 'none' }, g);
  svgEl('path', { d: `M${px} ${py} L${C[0]} ${C[1]}`, stroke: RUN, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '8 6' }, g);
  svgEl('path', { d: `M${C[0]} ${C[1]} L${R[0]} ${R[1]}`, stroke: RISE, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '8 6' }, g);
  await appear(c, g, 300);
  await anim(c, g, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-90deg)' }], 1400);
  return g;
}
/** a right-angle mark where two lines y = m1 x + b1 and y = m2 x + b2 meet */
function rightAt(G, m1, b1, m2, b2) {
  const x = (b2 - b1) / (m1 - m2), y = m1 * x + b1;
  const V = G.toPx(x, y), d1 = 1 / Math.hypot(1, m1), d2 = 1 / Math.hypot(1, m2);
  const P = G.toPx(x + d1, y + m1 * d1), R = G.toPx(x - d2 * Math.sign(m2), y - m2 * d2 * Math.sign(m2));
  const g = svgEl('g', {}, G.layers.top); rightMark(g, V, P, R, 18, { color: INK, width: 2.2 });
  return g;
}
const SV = {
  e5: {
    title: 'Example 5 on the grid', win: { xmin: -6, xmax: 10, ymin: -5, ymax: 11 },
    intro: 'Two points give the slope and a point. Press <b>Next</b>.',
    steps: (G, Pn, okS) => [
      { cap: `Plot ${T('P(4,-3)')} and ${T('Q(-2,9)')}.`,
        run: async (c) => { await pop(c, G.point(4, -3, { color: FIX, r: 7, label: T(cF('P(4,-3)')), pos: 'e' })); await pop(c, G.point(-2, 9, { color: INK, r: 7, label: T('Q(-2,9)'), pos: 'e' })); } },
      { cap: `From ${T('P')} to ${T('Q')}: run ${T(cU('-6'))}, rise ${T(cR('12'))}. ${T('m=\\dfrac{9-(-3)}{-2-4}=\\dfrac{12}{-6}=-2')}.`,
        run: async (c) => { const t = new SlopeTri(G, { x: 4, y: -3, run: -6, rise: 12 }, { runSide: 's' }); await t.drawIn(c, 500); await show(c, line(Pn, T('m=\\dfrac{9-(-3)}{-2-4}=\\dfrac{12}{-6}=-2'), 'u7l4-mline')); } },
      { cap: `Pin ${T(cF('P(4,-3)'))}: ${T('y-(-3)=-2(x-4)')}.`,
        run: async (c) => { await pop(c, pinRing(G, 4, -3)); await G.drawIn(G.line({ m: -2, b: 5 }, { color: LINE, width: 4 }), 700, c); await show(c, line(Pn, T('y-(-3)=-2(x-4)'), 'u7l4-mline')); } },
      { cap: `Expand: ${T('y+3=-2x+8')}.`, run: async (c) => { await show(c, line(Pn, T('y+3=-2x+8'), 'u7l4-mline')); } },
      { cap: `Collect on the left, ${T('x')}-term positive: add ${T('2x')}, subtract ${T('8')}. ${T('\\boldsymbol{2x+y-5=0}')}.`,
        run: async (c) => { await show(c, line(Pn, T('\\boldsymbol{2x+y-5=0}'), 'u7l4-mline u7l4-boxed')); } },
      { cap: `Check with the <b>other</b> point, ${T('Q(-2,9)')}: ${T('2(-2)+9-5=-4+9-5=0')} ✓.`,
        run: async (c) => { await show(c, line(Pn, `Check ${T('Q(-2,9)')}: ${T('2(-2)+9-5=0')} ✓`, 'u7l4-chk')); await stampIn(c, okS()); } }
    ]
  },
  e6: {
    title: 'Example 6 on the grid', win: { xmin: -2, xmax: 13, ymin: -9, ymax: 6 },
    intro: 'An intercept is a point. Press <b>Next</b>.',
    steps: (G, Pn, okS) => [
      { cap: `An ${T('x')}-intercept of ${T('8')} means the line crosses the ${T('x')}-axis at ${T(cF('(8,0)'))}: that is our point.`,
        run: async (c) => { await pop(c, G.point(8, 0, { color: FIX, r: 7.5, label: T(cF('(8,0)')), pos: 'nw' })); await pop(c, pinRing(G, 8, 0)); } },
      { cap: `Slope ${T('\\tfrac{3}{4}')}: from ${T('(8,0)')} run ${T(cU('4'))}, rise ${T(cR('3'))}.`,
        run: async (c) => { const t = new SlopeTri(G, { x: 8, y: 0, run: 4, rise: 3 }, { fillOp: 0.12 }); await t.drawIn(c, 450); await G.drawIn(G.line({ m: 0.75, b: -6 }, { color: LINE, width: 4 }), 700, c); } },
      { cap: `Slope–point form: ${T('y-0=\\tfrac{3}{4}(x-8)')}.`, run: async (c) => { await show(c, line(Pn, T('y-0=\\tfrac{3}{4}(x-8)'), 'u7l4-mline')); } },
      { cap: `<b>Clear the fraction</b>: multiply both sides by ${T('4')}. ${T('4y=3(x-8)=3x-24')}.`,
        run: async (c) => { await show(c, line(Pn, `${T('4y=3x-24')}<span class="u7l4-badge">${T('\\times4')} both sides</span>`, 'u7l4-mline')); } },
      { cap: `Collect on the side where ${T('3x')} is positive: ${T('0=3x-4y-24')}, so ${T('\\boldsymbol{3x-4y-24=0}')}.`,
        run: async (c) => { await show(c, line(Pn, T('\\boldsymbol{3x-4y-24=0}'), 'u7l4-mline u7l4-boxed')); } },
      { cap: `Check ${T('(8,0)')}: ${T('3(8)-4(0)-24=0')} ✓. (The graph also shows the ${T('y')}-intercept: ${T('-6')}.)`,
        run: async (c) => { await show(c, line(Pn, `Check ${T('(8,0)')}: ${T('3(8)-4(0)-24=0')} ✓`, 'u7l4-chk')); await pop(c, G.point(0, -6, { color: YI, r: 6.5, label: T(cG('(0,-6)')), pos: 'e' })); await stampIn(c, okS()); } }
    ]
  },
  e7: {
    title: 'Example 7 on the grid', win: { xmin: -9, xmax: 5, ymin: -7, ymax: 7 },
    intro: 'Perpendicular: give the slope triangle a <b>quarter turn</b>. Press <b>Next</b>.',
    steps: (G, Pn, okS) => [
      { cap: `The given line: ${T('2x-3y+12=0')}. Solve for ${T('y')}: ${T('y=\\dfrac{2x+12}{3}=\\tfrac{2}{3}x+4')}, slope ${T('\\tfrac{2}{3}')}.`,
        run: async (c) => { await G.drawIn(G.line({ m: 2 / 3, b: 4 }, { color: GRAY, width: 3.5 }), 700, c); G.label(1.2, 6.4, T('2x-3y+12=0'), { pos: 'w', cls: 'bk-ptlab u7l4-gl' }); await show(c, line(Pn, T('y=\\tfrac{2}{3}x+4,\\quad m_{\\text{given}}=\\tfrac{2}{3}'), 'u7l4-mline')); } },
      { cap: `Its slope triangle: run ${T(cU('3'))}, rise ${T(cR('2'))}. Copy it to the point ${T(cF('(-4,2)'))}.`,
        run: async (c) => {
          const t = new SlopeTri(G, { x: -6, y: 0, run: 3, rise: 2 }, { labels: false, fillOp: 0.1 }); await t.drawIn(c, 350);
          await pop(c, G.point(-4, 2, { color: FIX, r: 7.5, label: T(cF('(-4,2)')), pos: 'ne' }));
        } },
      { cap: `A <b>quarter turn</b>: run ${T(cU('3'))}, rise ${T(cR('2'))} becomes run ${T(cU('-2'))}, rise ${T(cR('3'))}. The slope flips and changes sign: ${T('m_{\\perp}=\\dfrac{3}{-2}=-\\tfrac{3}{2}')}.`,
        run: async (c) => {
          const g = await quarterTurn(c, G, [-4, 2], 3, 2); await sleep(c, 200); g.remove();
          const t = new SlopeTri(G, { x: -4, y: 2, run: -2, rise: 3 }, { fillOp: 0.12 }); await t.drawIn(c, 300);
          await show(c, line(Pn, T('m_{\\perp}=-\\tfrac{3}{2}'), 'u7l4-mline'));
        } },
      { cap: `Slope–point form with ${T(cF('(-4,2)'))}: ${T('y-2=-\\tfrac{3}{2}(x+4)')}. The two lines meet at a right angle.`,
        run: async (c) => { await G.drawIn(G.line({ m: -1.5, b: -4 }, { color: LINE, width: 4 }), 700, c); await appear(c, rightAt(G, 2 / 3, 4, -1.5, -4), 300); await show(c, line(Pn, T('y-2=-\\tfrac{3}{2}(x+4)'), 'u7l4-mline')); } },
      { cap: `Clear the fraction: ${T('\\times2')} on both sides, ${T('2y-4=-3(x+4)=-3x-12')}.`,
        run: async (c) => { await show(c, line(Pn, `${T('2y-4=-3x-12')}<span class="u7l4-badge">${T('\\times2')}</span>`, 'u7l4-mline')); } },
      { cap: `Add ${T('3x+12')} to both sides: ${T('\\boldsymbol{3x+2y+8=0}')}.`, run: async (c) => { await show(c, line(Pn, T('\\boldsymbol{3x+2y+8=0}'), 'u7l4-mline u7l4-boxed')); } },
      { cap: `Check ${T('(-4,2)')}: ${T('3(-4)+2(2)+8=-12+4+8=0')} ✓.`, run: async (c) => { await show(c, line(Pn, `Check ${T('(-4,2)')}: ${T('-12+4+8=0')} ✓`, 'u7l4-chk')); await stampIn(c, okS()); } }
    ]
  },
  e8: {
    title: 'Example 8 on the grid', win: { xmin: -3, xmax: 11, ymin: -4, ymax: 10 },
    intro: 'One line gives the <b>point</b>, the other gives the <b>slope</b>. Press <b>Next</b>.',
    steps: (G, Pn, okS) => [
      { cap: `The shared ${T('x')}-intercept: in ${T('3x-5y-15=0')} set ${T('y=0')}. ${T('3x-15=0')}, ${T('x=5')}: the point ${T(cF('(5,0)'))}.`,
        run: async (c) => {
          await G.drawIn(G.line({ m: 0.6, b: -3 }, { color: GRAY, width: 3, dash: '7 6' }), 600, c); G.label(10.9, 5.0, T('3x-5y-15=0'), { pos: 'w', cls: 'bk-ptlab u7l4-gl' });
          await pop(c, G.point(5, 0, { color: FIX, r: 7.5, label: T(cF('(5,0)')), pos: 'nw' }));
          await show(c, line(Pn, T('3x-15=0\\ \\Rightarrow\\ x=5,\\ \\text{point }(5,0)'), 'u7l4-mline'));
        } },
      { cap: `The slope of ${T('4x-9y-27=0')}: ${T('y=\\dfrac{4x-27}{9}=\\tfrac{4}{9}x-3')}, slope ${T('\\tfrac{4}{9}')}: run ${T(cU('9'))}, rise ${T(cR('4'))}.`,
        run: async (c) => {
          await G.drawIn(G.line({ m: 4 / 9, b: -3 }, { color: GRAY, width: 3.5 }), 600, c); G.label(3.6, -2.2, T('4x-9y-27=0'), { pos: 'c', cls: 'bk-ptlab u7l4-gl' });
          const t = new SlopeTri(G, { x: 0, y: -3, run: 9, rise: 4 }, { labels: false, fillOp: 0.1 }); await t.drawIn(c, 350);
          await show(c, line(Pn, T('y=\\tfrac{4}{9}x-3,\\quad m_{\\text{given}}=\\tfrac{4}{9}'), 'u7l4-mline'));
        } },
      { cap: `A <b>quarter turn</b> at ${T('(5,0)')}: run ${T(cU('9'))}, rise ${T(cR('4'))} becomes run ${T(cU('-4'))}, rise ${T(cR('9'))}. ${T('m_{\\perp}=\\dfrac{9}{-4}=-\\tfrac{9}{4}')}.`,
        run: async (c) => {
          const g = await quarterTurn(c, G, [5, 0], 9, 4); await sleep(c, 200); g.remove();
          const t = new SlopeTri(G, { x: 5, y: 0, run: -4, rise: 9 }, { fillOp: 0.12 }); await t.drawIn(c, 300);
          await show(c, line(Pn, T('m_{\\perp}=-\\tfrac{9}{4}'), 'u7l4-mline'));
        } },
      { cap: `Slope–point form: ${T('y-0=-\\tfrac{9}{4}(x-5)')}. It meets ${T('4x-9y-27=0')} at a right angle.`,
        run: async (c) => { await G.drawIn(G.line({ m: -2.25, b: 11.25 }, { color: LINE, width: 4 }), 700, c); await appear(c, rightAt(G, 4 / 9, -3, -2.25, 11.25), 300); await show(c, line(Pn, T('y-0=-\\tfrac{9}{4}(x-5)'), 'u7l4-mline')); } },
      { cap: `Clear the fraction: ${T('\\times4')}, ${T('4y=-9(x-5)=-9x+45')}.`, run: async (c) => { await show(c, line(Pn, `${T('4y=-9x+45')}<span class="u7l4-badge">${T('\\times4')}</span>`, 'u7l4-mline')); } },
      { cap: `Add ${T('9x-45')} to both sides: ${T('\\boldsymbol{9x+4y-45=0}')}.`, run: async (c) => { await show(c, line(Pn, T('\\boldsymbol{9x+4y-45=0}'), 'u7l4-mline u7l4-boxed')); } },
      { cap: `Check ${T('(5,0)')}: ${T('9(5)+4(0)-45=0')} ✓.`, run: async (c) => { await show(c, line(Pn, `Check ${T('(5,0)')}: ${T('9(5)+4(0)-45=0')} ✓`, 'u7l4-chk')); await stampIn(c, okS()); } }
    ]
  }
};
const solveDef = (k) => ({
  title: SV[k].title,
  height: 520,
  intro: SV[k].intro,
  make(stage, v, ex) {
    const d = SV[k];
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 492, height: 492, xlabels: 2, ylabels: 2 }, d.win));
    const Pn = panel(stage, 524, 14, ex.W - 538, 492, 'Clues → slope and point → general form');
    return d.steps(G, Pn, () => okStamp(Pn, 'general form'));
  }
});

/* =============================== mount =============================== */
mountBalloon();
mountFigures();
export const explainers = mountExplainers({ build, anyPoint, plug, toMxB, race, grid, read, strategy, solve5: solveDef('e5'), solve6: solveDef('e6'), solve7: solveDef('e7'), solve8: solveDef('e8') });
export const _test = { BD, AP, PL, TM, RD, FS, SV, Q, qT, spTidy, spRaw, yInt, linTex };
