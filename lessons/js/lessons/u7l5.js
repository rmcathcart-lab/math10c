/* Math 10C · Unit 7 · Lesson 5 — Graphing Linear Equations: A Strategy for Every Form.
 * Warm-up Speed Sketch (four cars sketched by their own strategies), example grids (tap to plot) with answer figures,
 * and the explainers:
 *   morph   (star) one line in three forms: the equation morphs token by token y=mx+b → slope–point → general → back,
 *           while the same line stays on the grid and each form lights up the feature it shows directly
 *   flow    which strategy for which form (Flowchart)
 *   step    plot the start point, step the slope again and again, join (Ex 1a, 1b, 2a)
 *   cover   general form: cover the x-term, cover the y-term; C = 0 and fraction intercepts (Ex 1c, 2b, 2c)
 *   dials   m tilts the line about (0, b); b slides it (sign and size of m)
 *   match   Example 3 check: solve for y, read m and b, find the graph
 *   data    table → collinear → slope → intercept → general form → check → solve for x (Example 4)
 *   machine y = 9/5 x + 32 as a two-step machine, and its reverse x = 5/9 (y − 32)
 * Colours: line blue, run amber, rise purple, slope purple, y-intercept green, x-intercept orange, given point red. */
import {
  h, tex, add, box, Graph, ValueTable, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pairTex, texNum, svgEl, liveCtx, pulse, shake, place, anim, COLORS, calcNum, arrowHead
} from '../blocks.js';

const T = (s) => tex(s);
const LINE = COLORS.blue, RUN = COLORS.amber, RISE = COLORS.purple, SL = COLORS.purple, YI = COLORS.green, XI = COLORS.orange,
  PT = COLORS.red, INK = COLORS.ink, GRAY = COLORS.gray, TEAL = COLORS.teal;
const tc = (c, s) => `\\textcolor{${c}}{${s}}`;
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const red = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
/** TeX of n/d reduced, sign in front */
const fr = (n, d = 1, big) => { const [a, b] = red(n, d); if (b === 1) return String(a); return (a < 0 ? '-' : '') + `\\${big ? 'd' : 't'}frac{${Math.abs(a)}}{${b}}`; };
const n = (v) => texNum(v).replace('-', '−');
const show = (c, el) => fadeIn(c, el, 320);
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const dim = (els, on = true) => els.flat().forEach((e) => { if (e) { e.style.transition = 'opacity .35s'; e.style.opacity = on ? 0.22 : 1; if (e.label) e.label.style.opacity = on ? 0.22 : 1; } });
function panel(stage, x, y, w, hh, title, cls = '') { return add(stage, box(h('div', 'u7l5-panel ' + cls, title ? `<div class="u7l5-ph">${title}</div>` : ''), w, hh), x, y); }
function pl(P, html, cls = '') { const d = h('div', 'u7l5-pl ' + cls, html); P.appendChild(d); return d; }
async function pls(c, P, html, cls) { const d = pl(P, html, cls); await show(c, d); return d; }
const grid = (host, o) => new Graph(host, Object.assign({ width: 440, height: 440, xmin: -7, xmax: 7, ymin: -7, ymax: 7, xlabels: 2, ylabels: 2, fontSize: 16 }, o));

/* ---------------------------------------------------------------------------------------------------------------
 * EqMorph: an equation made of tokens "key:tex" (tex '~-' = a unary minus). to(c, spec) morphs to a new token list:
 * tokens with the same key and tex glide to their new places, the others fade out / in. hl(keys, cls) colours tokens.
 * ------------------------------------------------------------------------------------------------------------- */
class EqMorph {
  constructor(host, cls = '') { this.el = h('div', 'u7l5-eqm ' + cls); host.appendChild(this.el); this.map = new Map(); this.covers = []; }
  parse(spec) {
    return spec.trim().split(/\s+/).map((t) => {
      const i = t.indexOf(':'), k = t.slice(0, i); let s = t.slice(i + 1), u = false;
      if (s[0] === '~') { u = true; s = s.slice(1); }
      return [k, s, u];
    });
  }
  mk(k, s, u) {
    const op = !u && /^[-+=]$/.test(s), e = h('span', 'u7l5-tk' + (op ? ' u7l5-op' : ''), T(s === '-' ? '-' : s));
    e.k = k; e.s = s; e.u = u; return e;
  }
  set(spec) { this.el.innerHTML = ''; this.map = new Map(); this.parse(spec).forEach(([k, s, u]) => { const e = this.mk(k, s, u); this.el.appendChild(e); this.map.set(k, e); }); return this; }
  async to(c, spec, ms = 700) {
    this.uncover(); this.clear();
    const toks = this.parse(spec), old = this.map, pos = new Map(), next = new Map();
    old.forEach((e, k) => pos.set(k, [e.offsetLeft, e.offsetTop]));
    const els = toks.map(([k, s, u]) => { const o = old.get(k); const e = o && o.s === s && o.u === u ? o : this.mk(k, s, u); next.set(k, e); return e; });
    const ghosts = [...old.entries()].filter(([k, e]) => next.get(k) !== e).map(([k, e]) => { const [x, y] = pos.get(k); e.classList.add('u7l5-ghost'); e.style.left = x + 'px'; e.style.top = y + 'px'; return e; });
    this.el.innerHTML = ''; els.forEach((e) => this.el.appendChild(e)); ghosts.forEach((g) => this.el.appendChild(g));
    this.map = next;
    const jobs = [];
    els.forEach((e) => {
      const p = pos.get(e.k);
      if (old.get(e.k) === e && p) { const dx = p[0] - e.offsetLeft, dy = p[1] - e.offsetTop; if (Math.abs(dx) + Math.abs(dy) > 0.5) jobs.push(anim(c, e, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], ms)); }
      else jobs.push(anim(c, e, [{ opacity: 0, transform: 'translateY(-16px) scale(.7)' }, { opacity: 1, transform: 'none' }], ms * 0.8, { delay: ms * 0.25 }));
    });
    ghosts.forEach((g) => jobs.push(anim(c, g, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(16px) scale(.7)' }], ms * 0.6)));
    try { await Promise.all(jobs); } finally { ghosts.forEach((g) => g.remove()); }
  }
  tok(k) { return this.map.get(k); }
  hl(keys, cls) { keys.forEach((k) => { const e = this.map.get(k); if (e) e.classList.add(cls); }); }
  clear() { this.map.forEach((e) => e.classList.remove('u7l5-hm', 'u7l5-hb', 'u7l5-hp', 'u7l5-hx', 'u7l5-hdim')); }
  /** a "cover" card over some tokens, labelled */
  cover(keys, label) {
    const es = keys.map((k) => this.map.get(k)).filter(Boolean); if (!es.length) return null;
    const l = Math.min(...es.map((e) => e.offsetLeft)), t = Math.min(...es.map((e) => e.offsetTop)),
      r = Math.max(...es.map((e) => e.offsetLeft + e.offsetWidth)), b = Math.max(...es.map((e) => e.offsetTop + e.offsetHeight));
    const d = h('div', 'u7l5-cov', `<span>${label}</span>`);
    d.style.left = l - 6 + 'px'; d.style.top = t - 4 + 'px'; d.style.width = r - l + 12 + 'px'; d.style.height = b - t + 8 + 'px';
    this.el.appendChild(d); this.covers.push(d); return d;
  }
  uncover() { this.covers.forEach((d) => d.remove()); this.covers = []; }
}

/* slope staircase from (x, y): rise leg (purple) then run leg (amber), then a point */
async function stepSlope(c, G, x, y, rise, run, o = {}) {
  const ms = o.ms ?? 260;
  const a = G.segment([x, y], [x, y + rise], { color: RISE, width: 4.5 }); await G.drawIn(a, ms, c);
  const b = G.segment([x, y + rise], [x + run, y + rise], { color: RUN, width: 4.5 }); await G.drawIn(b, ms, c);
  const els = [a, b];
  if (o.labels) {
    const la = G.label(x, y + rise / 2, (rise > 0 ? '+' : '−') + Math.abs(rise), { pos: run > 0 ? 'w' : 'e', cls: 'u7l5-legl u7l5-legr', gap: 6 });
    const lb = G.label(x + run / 2, y + rise, (run > 0 ? '+' : '−') + Math.abs(run), { pos: rise > 0 ? 'n' : 's', cls: 'u7l5-legl u7l5-legu', gap: 6 });
    els.push(la, lb); await Promise.all([fadeIn(c, la, 200), fadeIn(c, lb, 200)]);
  }
  if (o.point !== false) { const p = G.point(x + run, y + rise, { color: o.color || LINE, r: 6.5, coords: o.coords, pos: o.pos || 'se' }); els.push(p); await G.reveal(p, c, 240); }
  return els;
}
/** the slope as rise over run: [rise, run] with run > 0 unless flip */
const riseRun = (m) => [m[0], m[1]];

/* =============================== warm-up: Speed Sketch =============================== */
const CARCOL = { 1: '#d23c32', 2: '#286ebe', 3: '#3c9650', 4: '#e6961e' };
function carSVG(col) {
  return `<svg viewBox="0 0 64 30" width="64" height="30"><path d="M3 21 V12 L9 11 H18 L24 4 H38 L44 11 L61 14 L62 21 Z" fill="${col}" stroke="#1e2d46" stroke-width="2" stroke-linejoin="round"/><path d="M26 7 H37 L41 11 H24 Z" fill="#e8f0fc" stroke="#1e2d46" stroke-width="1.4"/><circle cx="15" cy="22" r="5.5" fill="#1e2d46"/><circle cx="15" cy="22" r="2.2" fill="#bbb"/><circle cx="50" cy="22" r="5.5" fill="#1e2d46"/><circle cx="50" cy="22" r="2.2" fill="#bbb"/></svg>`;
}
function mountWarm() {
  const host = document.getElementById('u7l5-wgraph'); if (!host) return;
  document.querySelectorAll('.u7l5-car').forEach((e) => { e.querySelector('.u7l5-carsvg').innerHTML = carSVG(CARCOL[e.dataset.car]); });
  const GW = host.clientWidth || 400; // the size comes from the CSS (smaller on the one-screen warm-up)
  const G = new Graph(host, { width: GW, height: GW, xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5, xlabels: 2, ylabels: 2, fontSize: 15 });
  let busy = false;
  const SK = {
    1: async (c, col) => { const p = G.point(0, 3, { color: col, coords: true, pos: 'ne' }); await G.reveal(p, c);
      let x = 0, y = 3; for (let i = 0; i < 2; i++) { await stepSlope(c, G, x, y, -1, 2, { color: col, ms: 220 }); x += 2; y -= 1; }
      await G.drawIn(G.line([0, 3], [2, 2], { color: col, width: 4 }), 600, c); },
    2: async (c, col) => { const a = G.point(0, 4, { color: col, coords: true, pos: 'ne' }); await G.reveal(a, c); const b = G.point(6, 0, { color: col, coords: true, pos: 'n' }); await G.reveal(b, c);
      await G.drawIn(G.line([0, 4], [6, 0], { color: col, width: 4 }), 600, c); },
    3: async (c, col) => { const p = G.point(3, 1, { color: col, coords: true, pos: 'e' }); await G.reveal(p, c);
      await stepSlope(c, G, 3, 1, 2, 1, { color: col, ms: 220 }); await stepSlope(c, G, 3, 1, -2, -1, { color: col, ms: 220 });
      await G.drawIn(G.line([3, 1], [4, 3], { color: col, width: 4 }), 600, c); },
    4: async (c, col) => { const a = G.point(0, -5, { color: col, coords: true, pos: 'e' }); await G.reveal(a, c); const b = G.point(2.5, 0, { color: col, coords: true, pos: 'se' }); await G.reveal(b, c);
      await G.drawIn(G.line([0, -5], [2.5, 0], { color: col, width: 4, dash: '10 9' }), 600, c); }
  };
  document.querySelectorAll('[data-sketch]').forEach((b) => b.addEventListener('click', async () => {
    if (busy) return; busy = true; const k = b.dataset.sketch;
    try { await SK[k](liveCtx(), CARCOL[k]); } finally { busy = false; }
  }));
  const cl = document.getElementById('u7l5-wclear'); if (cl) cl.addEventListener('click', () => { if (!busy) G.clear(); });
}

/* =============================== example figures =============================== */
function smallGrid(id, o = {}) {
  const el = document.getElementById(id); if (!el) return null;
  return new Graph(el, Object.assign({ width: 290, height: 290, xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5, xlabels: 2, ylabels: 2, fontSize: 13 }, o));
}
function ansGrid(id, line, pts, o = {}) {
  const G = smallGrid(id, Object.assign({ width: 230, height: 230, fontSize: 12 }, o)); if (!G) return;
  G.line(line[0], line[1], { color: LINE, width: 3 });
  pts.forEach((p) => G.point(p[0], p[1], { color: p[2] || PT, r: 5 }));
  return G;
}
function mountFigures() {
  ['u7l5-g1a', 'u7l5-g1b', 'u7l5-g1c', 'u7l5-g2a', 'u7l5-g2b', 'u7l5-g2c'].forEach((id) => smallGrid(id, { interactive: { snap: 1, color: 'blue' } }));
  ansGrid('u7l5-a1a', [[0, -6], [2, 0]], [[0, -6], [1, -3], [2, 0], [3, 3]]);
  ansGrid('u7l5-a1b', [[0, -6], [2, 0]], [[1, -3], [2, 0], [3, 3], [0, -6]]);
  ansGrid('u7l5-a1c', [[0, -6], [2, 0]], [[2, 0], [0, -6]]);
  ansGrid('u7l5-a2a', [[4, -1], [1, 1]], [[4, -1], [1, 1], [-2, 3], [-5, 5]]);
  ansGrid('u7l5-a2b', [[0, 0], [4, 3]], [[0, 0], [4, 3], [-4, -3]]);
  ansGrid('u7l5-a2c', [[2, 0], [-1, 2]], [[2, 0], [-1, 2], [5, -2]]);
  // Example 3: graphs A–D
  const g4 = document.getElementById('u7l5-ex3figs');
  if (g4) EX3G.forEach((d) => {
    const f = h('div', 'u7l5-g4i'); g4.appendChild(f); f.appendChild(h('div', 'u7l5-g4t', `Graph ${d.k}`));
    const G = new Graph(f, { width: 220, height: 220, xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5, xlabels: 4, ylabels: 4, fontSize: 13 });
    G.segment(d.a, d.b, { color: INK, width: 3, ends: ['arrow', 'arrow'] });
  });
  // Example 4: data table, tap-to-plot grid, answer graph
  const t5 = document.getElementById('u7l5-ex5tab');
  if (t5) new ValueTable(t5, { headers: ['x', 'y'], rows: EX5.xs.map((x, i) => [x, EX5.ys[i]]), layout: 'h', cellW: 74, cellH: 50, tap: false });
  const f5 = document.getElementById('u7l5-ex5fig');
  if (f5) new Graph(f5, { width: 420, height: 400, xmin: 0, xmax: 80, ymin: 0, ymax: 180, xstep: 5, ystep: 10, xlabels: 10, ylabels: 20, origin: true, fontSize: 14, interactive: { snap: 1, color: 'blue' } });
  const a5 = document.getElementById('u7l5-ex5ans');
  if (a5) {
    const G = new Graph(a5, { width: 300, height: 290, xmin: 0, xmax: 80, ymin: 0, ymax: 180, xstep: 10, ystep: 20, xlabels: 20, ylabels: 40, origin: true, fontSize: 12 });
    G.segment([0, 32], [80, 176], { color: LINE, width: 3 });
    EX5.xs.forEach((x, i) => G.point(x, EX5.ys[i], { color: PT, r: 4.5 }));
  }
}
const EX3G = [{ k: 'A', a: [-2.5, 6], b: [3.5, -6] }, { k: 'B', a: [-6, 1], b: [6, 5] }, { k: 'C', a: [-6, 4], b: [6, 0] }, { k: 'D', a: [-8 / 3, -6], b: [4 / 3, 6] }];
const EX5 = { xs: [0, 10, 20, 30, 40, 50, 60, 70], ys: [32, 50, 68, 86, 104, 122, 140, 158] };

/* =============================== 1. morph (star) =============================== */
const MO = {
  ex1: {
    label: `Example 1: ${T('y=3x-6')}`, m: [3, 1], b: -6, P: [1, -3], xi: [2, 1], step: [3, 1],
    si: 'y:y eq:= m:3 x:x s1:- b:6', hlM: ['m'], hlB: ['s1', 'b'],
    sp: [['y:y eq:= m:3 x:x s1:- k1:3 s2:- k2:3', `split ${T('-6')} into ${T('-3-3')}`],
      ['y:y eq:= m:3 lp:( x:x s1:- one:1 rp:) s2:- k2:3', `factor: ${T('3x-3=3(x-1)')}`],
      ['y:y s2p:+ k2:3 eq:= m:3 lp:( x:x s1:- one:1 rp:)', `add ${T('3')} to both sides`]],
    hlP: ['s2p', 'k2', 's1', 'one'], spRead: 'y-(-3)=3(x-1)',
    gf: [['y:y s2p:+ k2:3 eq:= m:3 x:x s1:- k1:3', 'expand the bracket'],
      ['zero:0 eq:= m:3 x:x sy:- y:y s1:- k1:3 s2:- k2:3', `subtract ${T('y')} and ${T('3')} from both sides`],
      ['m:3 x:x sy:- y:y s1:- b:6 eq:= zero:0', `collect ${T('-3-3=-6')}, swap sides`]],
    covX: ['m', 'x'], covY: ['sy', 'y'], leftX: '-y-6=0', leftY: '3x-6=0',
    back: `add ${T('y')} to both sides, swap sides`,
    forms: ['y=3x-6', 'y+3=3(x-1)', '3x-y-6=0'], spNote: ''
  },
  car3: {
    label: `Cars #3 and #4: ${T('y=2x-5')}`, m: [2, 1], b: -5, P: [3, 1], xi: [5, 2], step: [2, 1],
    si: 'y:y eq:= m:2 x:x s1:- b:5', hlM: ['m'], hlB: ['s1', 'b'],
    sp: [['y:y eq:= m:2 x:x s1:- k1:6 s2:+ k2:1', `split ${T('-5')} into ${T('-6+1')}`],
      ['y:y eq:= m:2 lp:( x:x s1:- one:3 rp:) s2:+ k2:1', `factor: ${T('2x-6=2(x-3)')}`],
      ['y:y s2p:- k2:1 eq:= m:2 lp:( x:x s1:- one:3 rp:)', `subtract ${T('1')}: car #3!`]],
    hlP: ['s2p', 'k2', 's1', 'one'], spRead: 'y-1=2(x-3)',
    gf: [['y:y s2p:- k2:1 eq:= m:2 x:x s1:- k1:6', 'expand the bracket'],
      ['zero:0 eq:= m:2 x:x sy:- y:y s1:- k1:6 s2:+ k2:1', `subtract ${T('y')}, add ${T('1')}`],
      ['m:2 x:x sy:- y:y s1:- b:5 eq:= zero:0', `collect ${T('-6+1=-5')}; double it: car #4`]],
    covX: ['m', 'x'], covY: ['sy', 'y'], leftX: '-y-5=0', leftY: '2x-5=0',
    back: `add ${T('y')} to both sides, swap sides`,
    forms: ['y=2x-5', 'y-1=2(x-3)', '2x-y-5=0'], spNote: ` Car #4, ${T('4x-2y-10=0')}, is this general form doubled.`
  },
  car1: {
    label: `Car #1: ${T('y=-\\tfrac{1}{2}x+3')}`, m: [-1, 2], b: 3, P: [2, 2], xi: [6, 1], step: [-1, 2],
    si: 'y:y eq:= sm:~- m:\\tfrac{1}{2} x:x s1:+ b:3', hlM: ['sm', 'm'], hlB: ['s1', 'b'],
    sp: [['y:y eq:= sm:~- m:\\tfrac{1}{2} x:x s1:+ k1:1 s2:+ k2:2', `split ${T('3')} into ${T('1+2')}`],
      ['y:y eq:= sm:~- m:\\tfrac{1}{2} lp:( x:x s1:- one:2 rp:) s2:+ k2:2', `factor: ${T('-\\tfrac12x+1=-\\tfrac12(x-2)')}`],
      ['y:y s2p:- k2:2 eq:= sm:~- m:\\tfrac{1}{2} lp:( x:x s1:- one:2 rp:)', `subtract ${T('2')} from both sides`]],
    hlP: ['s2p', 'k2', 's1', 'one'], spRead: 'y-2=-\\tfrac12(x-2)',
    gf: [['y:y s2p:- k2:2 eq:= sm:~- m:\\tfrac{1}{2} x:x s1:+ k1:1', 'expand the bracket'],
      ['y2:2y s2p:- k2:4 eq:= smx:~- x:x s1:+ k1:2', `multiply every term by ${T('2')}: no fractions`],
      ['x:x s1p:+ y2:2y s2p:- k2:4 s1:- k1:2 eq:= zero:0', `add ${T('x')}, subtract ${T('2')}`],
      ['x:x s1p:+ y2:2y s6:- b:6 eq:= zero:0', `collect ${T('-4-2=-6')}`]],
    covX: ['x'], covY: ['s1p', 'y2'], leftX: '2y-6=0', leftY: 'x-6=0',
    back: `subtract ${T('x')}, add ${T('6')}, divide by ${T('2')}`,
    forms: ['y=-\\tfrac12x+3', 'y-2=-\\tfrac12(x-2)', 'x+2y-6=0'], spNote: ''
  }
};
const morph = {
  title: 'One line, three forms',
  height: 470,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(MO).map((k) => ({ v: k, label: MO[k].label })),
  intro: 'Watch the <b>equation</b> change shape while the <b>line</b> on the grid never moves. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = MO[k], [mn, md] = d.m, mT = fr(mn, md), b = d.b, [px, py] = d.P, xi = d.xi[0] / d.xi[1], xiT = fr(d.xi[0], d.xi[1]);
    const G = grid(stage, { x: 14, y: 14 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, '');
    const tabs = h('div', 'u7l5-tabs'); P.appendChild(tabs);
    const tab = ['slope–intercept', 'slope–point', 'general'].map((t, i) => { const e = h('div', 'u7l5-tab u7l5-tab' + i, t); tabs.appendChild(e); return e; });
    const on = (i) => tab.forEach((e, j) => e.classList.toggle('on', j === i));
    const E = new EqMorph(P, 'u7l5-eqbig'); E.set(d.si);
    const note = h('div', 'u7l5-mnote', '&nbsp;'); P.appendChild(note);
    const feats = h('div', 'u7l5-feats'); P.appendChild(feats);
    const setNote = (s) => { note.innerHTML = s ? `<span class="u7l5-arrow">↻</span> ${s}` : '&nbsp;'; };
    let L, bPt, bTri, pPt, pTri, xPt, yPt;
    const seq = async (c, list) => { for (const [spec, s] of list) { setNote(s); await E.to(c, spec); await sleep(c, 350); } };
    const stepD = d.step, riseT = stepD[0], runT = stepD[1];
    const stairs = async (c, x, y) => stepSlope(c, G, x, y, riseT, runT, { point: false, labels: true, ms: 300 });
    return [
      { cap: `One line, written in <b>slope–intercept form</b>: ${T(d.forms[0])}.`,
        run: async (c) => { on(0); L = G.line([0, b], [md, b + mn], { color: LINE, width: 4.5 }); await G.drawIn(L, 900, c); } },
      { cap: `${T('y=mx+b')} shows the <b>slope</b> ${T(tc(SL, 'm=' + mT))} and the <b><i>y</i>-intercept</b> ${T(tc(YI, 'b=' + b))} directly: plot ${T(tc(YI, pairTex(0, b)))}, step the slope.`,
        run: async (c) => {
          E.hl(d.hlM, 'u7l5-hm'); E.hl(d.hlB, 'u7l5-hb');
          bPt = G.point(0, b, { color: YI, r: 8, coords: true, pos: b < 0 ? 'w' : 'nw' }); await G.reveal(bPt, c);
          bTri = await stairs(c, 0, b);
          await pls(c, feats, `<b class="u7l5-fl0">slope–intercept</b> shows ${T(tc(SL, 'm=' + mT))} and ${T(tc(YI, pairTex(0, b)))}`);
        } },
      { cap: `Morph to <b>slope–point form</b>. Each move keeps the equation balanced, so the line does not move.`,
        run: async (c) => { E.clear(); on(1); await seq(c, d.sp); setNote(''); } },
      { cap: `${T('y-y_1=m(x-x_1)')} shows the slope ${T(tc(SL, mT))} and the <b>point</b> ${T(tc(PT, pairTex(px, py)))}: ${T(d.spRead)}. The signs in the equation are the <b>opposite</b> of the coordinates.`,
        run: async (c) => {
          E.hl(d.hlM, 'u7l5-hm'); E.hl(d.hlP, 'u7l5-hp');
          dim([bPt, bTri]);
          pPt = G.point(px, py, { color: PT, r: 8, coords: true, pos: 'e' }); await G.reveal(pPt, c);
          pTri = await stairs(c, px, py);
          await pls(c, feats, `<b class="u7l5-fl1">slope–point</b> shows ${T(tc(SL, 'm=' + mT))} and ${T(tc(PT, pairTex(px, py)))}`);
        } },
      { cap: `Morph to <b>general form</b>: clear any fractions and gather every term on one side.${d.spNote}`,
        run: async (c) => { E.clear(); on(2); await seq(c, d.gf); setNote(''); } },
      { cap: `General form hides the slope, but the intercepts drop out. Cover ${T('x')} (${T('x=0')}): ${T(d.leftX)}, so ${T(tc(YI, 'y=' + b))}. Cover ${T('y')} (${T('y=0')}): ${T(d.leftY)}, so ${T(tc(XI, 'x=' + xiT))}.`,
        run: async (c) => {
          dim([pPt, pTri]);
          const c1 = E.cover(d.covX, 'x = 0'); await pop(c, c1, 300);
          dim([bPt], false); bPt.label.style.opacity = 1; yPt = bPt; await pulse(c, bPt, 1.5);
          await sleep(c, 500); E.uncover();
          const c2 = E.cover(d.covY, 'y = 0'); await pop(c, c2, 300);
          xPt = G.point(xi, 0, { color: XI, r: 8, coords: true, pos: xi > 0 ? 'se' : 'sw' }); await G.reveal(xPt, c);
          await sleep(c, 500); E.uncover();
          E.hl(d.covX, 'u7l5-hx'); E.hl(d.covY, 'u7l5-hb');
          await pls(c, feats, `<b class="u7l5-fl2">general</b> gives ${T(tc(XI, pairTex(xiT, 0)))} and ${T(tc(YI, pairTex(0, b)))}`);
        } },
      { cap: `Back to ${T('y=mx+b')}: ${d.back}. Three equations, <b>one line</b>, and each form shows a different feature of it.`,
        run: async (c) => {
          E.clear(); on(0); setNote(d.back); await E.to(c, d.si); setNote('');
          dim([bPt, bTri, pPt, pTri, xPt], false);
          const s = stamp(P, 'one line ✓', { ok: true }); s.classList.add('u7l5-mstamp'); await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== 2. flow: which strategy =============================== */
const FN = {
  start: { x: 470, y: 34, w: 360, h: 50, html: '<b>Which form is the equation in?</b>', cls: 'bk-round' },
  si: { x: 112, y: 132, w: 196, h: 68, html: `<b>${T('y=mx+b')}</b>slope–intercept`, color: YI },
  sp: { x: 338, y: 132, w: 232, h: 68, html: `<b>${T('y-y_1=m(x-x_1)')}</b>slope–point`, color: PT },
  gf: { x: 590, y: 132, w: 228, h: 68, html: `<b>${T('Ax+By+C=0')}</b>general`, color: XI },
  hv: { x: 826, y: 132, w: 200, h: 68, html: `<b>${T('y=k')} or ${T('x=k')}</b>horizontal / vertical`, color: LINE },
  si2: { x: 112, y: 240, w: 196, h: 76, html: `<b>Plot ${T('(0,b)')}</b>then step ${T('m=\\tfrac{\\text{rise}}{\\text{run}}')}` },
  sp2: { x: 338, y: 240, w: 232, h: 76, html: `<b>Plot ${T('(x_1,y_1)')}</b>then step ${T('m=\\tfrac{\\text{rise}}{\\text{run}}')}` },
  gf2: { x: 590, y: 240, w: 228, h: 76, html: `<b>Cover ${T('x')}, cover ${T('y')}</b>the two intercepts` },
  hv2: { x: 826, y: 240, w: 200, h: 76, html: `<b>One point</b>${T('(0,k)')} or ${T('(k,0)')}; rule the line` },
  gfa: { x: 488, y: 350, w: 190, h: 58, html: '<b>Two easy points</b>join them', cls: 'bk-round', color: COLORS.green },
  gfb: { x: 706, y: 350, w: 226, h: 58, html: `<b>Same point or a fraction</b>find another point`, cls: 'bk-round', color: COLORS.red }
};
const FE = [
  { from: 'start', to: 'si', route: 'vhv' }, { from: 'start', to: 'sp', route: 'vhv' }, { from: 'start', to: 'gf', route: 'vhv' }, { from: 'start', to: 'hv', route: 'vhv' },
  { from: 'si', to: 'si2' }, { from: 'sp', to: 'sp2' }, { from: 'gf', to: 'gf2' }, { from: 'hv', to: 'hv2' },
  { from: 'gf2', to: 'gfa', route: 'vhv', label: 'usually' }, { from: 'gf2', to: 'gfb', route: 'vhv', label: 'careful' }
];
const FP = {
  a: { eq: 'y=3x-6', label: `Ex 1(a) ${T('y=3x-6')}`, path: ['start', 'si', 'si2'],
    caps: [`${T('y=3x-6')}: which form is it?`, `Already solved for ${T('y')}: <b>slope–intercept</b>, with ${T('m=3')} and ${T('b=-6')}.`, `Plot ${T('(0,-6)')}, then step up 3, right 1, again and again. Join the points.`] },
  b: { eq: 'y+3=3(x-1)', label: `Ex 1(b) ${T('y+3=3(x-1)')}`, path: ['start', 'sp', 'sp2'],
    caps: [`${T('y+3=3(x-1)')}: which form is it?`, `A bracket ${T('(x-x_1)')}: <b>slope–point</b>. ${T('m=3')}, and ${T('y+3=y-(-3)')} gives the point ${T('(1,-3)')}.`, `Plot ${T('(1,-3)')}, step up 3, right 1 (and down 3, left 1). Join the points.`] },
  c: { eq: '3x-y-6=0', label: `Ex 1(c) ${T('3x-y-6=0')}`, path: ['start', 'gf', 'gf2', 'gfa'],
    caps: [`${T('3x-y-6=0')}: which form is it?`, `Everything on one side, ${T('=0')}: <b>general form</b>.`, `${T('x=0')}: ${T('-y-6=0')}, ${T('y=-6')}. ${T('y=0')}: ${T('3x-6=0')}, ${T('x=2')}.`, `${T('(0,-6)')} and ${T('(2,0)')} are two different grid points: join them.`] },
  d: { eq: '3x-4y=0', label: `Ex 2(b) ${T('3x-4y=0')}`, path: ['start', 'gf', 'gf2', 'gfb'],
    caps: [`${T('3x-4y=0')}: which form is it?`, `General form, with ${T('C=0')}.`, `${T('x=0')} gives ${T('y=0')}, and ${T('y=0')} gives ${T('x=0')}: both intercepts are ${T('(0,0)')}.`, `One point is not a line. Pick a convenient ${T('x')}: ${T('x=4')} gives ${T('12-4y=0')}, ${T('y=3')}. Join ${T('(0,0)')} and ${T('(4,3)')}.`] },
  e: { eq: '2x+3y-4=0', label: `Ex 2(c) ${T('2x+3y-4=0')}`, path: ['start', 'gf', 'gf2', 'gfb'],
    caps: [`${T('2x+3y-4=0')}: which form is it?`, `General form.`, `${T('y=0')}: ${T('x=2')}. But ${T('x=0')}: ${T('3y=4')}, ${T('y=\\tfrac43')}, a fraction, hard to plot.`, `Find lattice points instead: ${T('x=-1')} gives ${T('y=2')}, ${T('x=5')} gives ${T('y=-2')}. Join ${T('(2,0)')}, ${T('(-1,2)')}, ${T('(5,-2)')}.`] },
  f: { eq: 'y=4', label: T('y=4'), path: ['start', 'hv', 'hv2'],
    caps: [`${T('y=4')}: which form is it?`, `No ${T('x')} at all: every point has ${T('y=4')}. A <b>horizontal</b> line, slope ${T('0')}.`, `Plot ${T('(0,4)')} and rule a horizontal line through it. (${T('x=-3')} would be vertical through ${T('(-3,0)')}.)`] }
};
const flow = {
  title: 'Which strategy? Read the form',
  height: 384,
  side: false, // the flowchart needs the full width: beside the sidebar its text would shrink to about 13 px
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(FP).map((k) => ({ v: k, label: FP[k].label })),
  intro: (k) => `Follow the chart for ${T(FP[k].eq)}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = FP[k], F = new Flowchart(stage, { x: Math.max(0, (ex.W - 940) / 2), y: 2, width: 940, height: 382, nodes: FN, edges: FE });
    add(stage, h('div', 'u7l5-fceq', T(d.eq)), 12, 10);
    return d.path.map((id, i) => ({ cap: d.caps[i], run: async (c) => { if (i) await F.go(c, d.path[i - 1], id); await F.visit(c, id); } }));
  }
};

/* =============================== step: start point + slope =============================== */
const ST = {
  a: { label: `Ex 1(a) ${T('y=3x-6')}`, form: 'si', eq: 'y=3x-6', P: [0, -6], m: [3, 1], fwd: 3, back: 0, chk: [2, 0], chkT: '0=3(2)-6' },
  b: { label: `Ex 1(b) ${T('y+3=3(x-1)')}`, form: 'sp', eq: 'y+3=3(x-1)', read: 'y-(-3)=3(x-1)', P: [1, -3], m: [3, 1], fwd: 2, back: 1, chk: [0, -6], chkT: '-6+3=3(0-1)' },
  c: { label: `Ex 2(a) ${T('y+1=-\\tfrac{2}{3}(x-4)')}`, form: 'sp', eq: 'y+1=-\\dfrac{2}{3}(x-4)', read: 'y-(-1)=-\\tfrac{2}{3}(x-4)', P: [4, -1], m: [2, -3], neg: true, fwd: 3, back: 0, chk: [1, 1], chkT: '1+1=-\\tfrac23(1-4)' },
  d: { label: `Car #1 ${T('y=-\\tfrac{1}{2}x+3')}`, form: 'si', eq: 'y=-\\tfrac{1}{2}x+3', P: [0, 3], m: [-1, 2], fwd: 3, back: 2, chk: [4, 1], chkT: '1=-\\tfrac12(4)+3' }
};
const step = {
  title: 'Plot the start point, step the slope',
  height: 470,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(ST).map((k) => ({ v: k, label: ST[k].label })),
  intro: (k) => `Graph ${T(ST[k].eq)} without rearranging it. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = ST[k], [x0, y0] = d.P, [r, u] = d.m, G = grid(stage, { x: 14, y: 14 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, d.form === 'si' ? 'Slope–intercept form' : 'Slope–point form');
    pl(P, T(d.eq), 'u7l5-big');
    const mT = fr(r, u), rr = `\\dfrac{${tc(RISE, r)}}{${tc(RUN, u)}}`;
    const dir = (rise, run) => `${rise > 0 ? 'up' : 'down'} ${Math.abs(rise)}, ${run > 0 ? 'right' : 'left'} ${Math.abs(run)}`;
    const pts = [d.P]; for (let i = 1; i <= d.fwd; i++) pts.push([x0 + i * u, y0 + i * r]);
    const bpts = []; for (let i = 1; i <= d.back; i++) bpts.push([x0 - i * u, y0 - i * r]);
    const list = (a) => a.map((p) => T(pairTex(p[0], p[1]))).join(', ');
    const steps = [];
    if (d.form === 'si') steps.push({ cap: `Already solved for ${T('y')}: the constant is ${T(tc(YI, 'b=' + y0))}, so the line crosses the ${T('y')}-axis at ${T(tc(YI, pairTex(0, y0)))}.`,
      run: async (c) => { await pls(c, P, `${T('b=' + y0)}: start at ${T(tc(YI, pairTex(0, y0)))}`); } });
    else steps.push({ cap: `Match ${T('y-y_1=m(x-x_1)')}: ${T(d.read)}. The point is ${T(tc(PT, pairTex(x0, y0)))}: the numbers in the brackets have the <b>opposite</b> signs.`,
      run: async (c) => { await pls(c, P, `${T('y-y_1=m(x-x_1)')}`, 'u7l5-soft'); await pls(c, P, T(d.read)); await pls(c, P, `start at ${T(tc(PT, pairTex(x0, y0)))}, not ${T(pairTex(-x0, -y0))}`); } });
    const col0 = d.form === 'si' ? YI : PT;
    steps.push({ cap: `Plot the start point ${T(pairTex(x0, y0))}.`, run: async (c) => { await G.reveal(G.point(x0, y0, { color: col0, r: 8, coords: true, pos: 'e' }), c); } });
    steps.push({ cap: d.neg ? `${T('m=' + mT + '=' + rr)}: ${dir(r, u)}. (${T(`\\tfrac{-2}{3}`)}, down 2, right 3, works too.)` : `${T('m=' + mT + '=' + rr)}: ${dir(r, u)}.`,
      run: async (c) => { await pls(c, P, `${T('m=' + rr)}: <b>${dir(r, u)}</b>`); await stepSlope(c, G, x0, y0, r, u, { labels: true, coords: true, pos: 'e' }); } });
    if (d.fwd > 1) steps.push({ cap: `Step the slope again and again: ${list(pts.slice(2))}.`,
      run: async (c) => { for (let i = 1; i < d.fwd; i++) await stepSlope(c, G, x0 + i * u, y0 + i * r, r, u, { coords: true, pos: 'e' }); await pls(c, P, `points: ${list(pts)}`); } });
    if (d.back) steps.push({ cap: `Step <b>backwards</b> too (${dir(-r, -u)}): ${list(bpts)}.`,
      run: async (c) => { for (let i = 0; i < d.back; i++) await stepSlope(c, G, x0 - i * u, y0 - i * r, -r, -u, { coords: true, pos: 'w' }); await pls(c, P, `backwards: ${list(bpts)}`); } });
    steps.push({ cap: `Join the points and extend the line both ways. Check ${T(pairTex(d.chk[0], d.chk[1]))}: ${T(d.chkT)} ✓`,
      run: async (c) => { await G.drawIn(G.line(d.P, [x0 + u, y0 + r], { color: LINE, width: 4.5 }), 800, c); await pls(c, P, `check ${T(pairTex(d.chk[0], d.chk[1]))}: ${T(d.chkT)} ✓`, 'u7l5-ok'); } });
    return steps;
  }
};

/* =============================== cover: general form intercepts =============================== */
const CV = {
  a: { label: `Ex 1(c) ${T('3x-y-6=0')}`, kind: 'ok', spec: 'tx:3x sy:- ty:y sc:- tc:6 eq:= z:0', eq: '3x-y-6=0', A: 3, B: -1, C: -6, yL: '-y-6=0', xL: '3x-6=0' },
  b: { label: `Ex 2(b) ${T('3x-4y=0')}`, kind: 'zero', spec: 'tx:3x sy:- ty:4y eq:= z:0', eq: '3x-4y=0', A: 3, B: -4, C: 0, yL: '-4y=0', xL: '3x=0', pick: 4 },
  c: { label: `Ex 2(c) ${T('2x+3y-4=0')}`, kind: 'frac', spec: 'tx:2x sy:+ ty:3y sc:- tc:4 eq:= z:0', eq: '2x+3y-4=0', A: 2, B: 3, C: -4, yL: '3y-4=0', xL: '2x-4=0' },
  d: { label: `Car #2 ${T('2x+3y-12=0')}`, kind: 'ok', spec: 'tx:2x sy:+ ty:3y sc:- tc:12 eq:= z:0', eq: '2x+3y-12=0', A: 2, B: 3, C: -12, yL: '3y-12=0', xL: '2x-12=0' }
};
const cover = {
  title: 'General form: cover x, cover y',
  height: 470,
  minW: 840, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(CV).map((k) => ({ v: k, label: CV[k].label })),
  intro: (k) => `Graph ${T(CV[k].eq)} from its intercepts. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = CV[k], G = grid(stage, { x: 14, y: 14 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'General form');
    const E = new EqMorph(P, 'u7l5-eqmid'); E.set(d.spec);
    const yi = -d.C / d.B, xi = -d.C / d.A, yiT = fr(-d.C, d.B), xiT = fr(-d.C, d.A);
    let c1, c2, yP, xP;
    const coverX = { cap: `Every point on the ${T('y')}-axis has ${T('x=0')}: <b>cover the ${T('x')}-term</b>. ${T(d.yL)}, so ${T(tc(YI, 'y=' + yiT))}.`,
      run: async (c) => {
        E.uncover(); c1 = E.cover(['tx'], 'x = 0'); await pop(c, c1, 320);
        await pls(c, P, `${T('x=0')}: ${T(d.yL)} → ${T(tc(YI, 'y=' + yiT))}`);
        yP = G.point(0, yi, { color: YI, r: 8, coords: d.kind !== 'frac', open: d.kind === 'frac', pos: 'ne' }); await G.reveal(yP, c);
      } };
    const coverY = { cap: `Every point on the ${T('x')}-axis has ${T('y=0')}: <b>cover the ${T('y')}-term</b>. ${T(d.xL)}, so ${T(tc(XI, 'x=' + xiT))}.`,
      run: async (c) => {
        E.uncover(); c2 = E.cover(['sy', 'ty'], 'y = 0'); await pop(c, c2, 320);
        await pls(c, P, `${T('y=0')}: ${T(d.xL)} → ${T(tc(XI, 'x=' + xiT))}`);
        xP = G.point(xi, 0, { color: XI, r: 8, coords: true, pos: xi > 0 ? 'se' : 'sw' }); await G.reveal(xP, c);
      } };
    if (d.kind === 'ok') return [coverX, coverY,
      { cap: `Two different points are enough: draw the line through ${T(pairTex(0, yi))} and ${T(pairTex(xi, 0))}. No rearranging needed.`,
        run: async (c) => { E.uncover(); await G.drawIn(G.line([0, yi], [xi, 0], { color: LINE, width: 4.5 }), 800, c); const s = stamp(P, 'graphed ✓', { ok: true }); s.classList.add('u7l5-pstamp'); await stampIn(c, s); } }];
    if (d.kind === 'zero') {
      const q = d.pick, qy = -d.A * q / d.B;
      return [coverX, coverY,
        { cap: `Both intercepts are the <b>same point</b>, ${T('(0,0)')}: when ${T('C=0')}, the line passes through the origin. One point is not a line.`,
          run: async (c) => { E.uncover(); await pulse(c, xP, 1.6); await pls(c, P, `${T('C=0')}: only ${T('(0,0)')}`, 'u7l5-warn'); } },
        { cap: `Substitute a convenient ${T('x')}: ${T(`x=${q}`)} gives ${T(`12-4y=0`)}, so ${T(`y=${qy}`)}. Likewise ${T(`x=-${q}`)} gives ${T(pairTex(-q, -qy))}.`,
          run: async (c) => {
            await pls(c, P, `${T(`x=${q}`)}: ${T(`3(${q})-4y=0`)} → ${T(`y=${qy}`)}`);
            await G.reveal(G.point(q, qy, { color: LINE, r: 7, coords: true, pos: 'se' }), c); await G.reveal(G.point(-q, -qy, { color: LINE, r: 7, coords: true, pos: 'se' }), c);
          } },
        { cap: `Draw the line through ${T('(0,0)')} and ${T(pairTex(q, qy))}.`,
          run: async (c) => { await G.drawIn(G.line([0, 0], [q, qy], { color: LINE, width: 4.5 }), 800, c); const s = stamp(P, 'graphed ✓', { ok: true }); s.classList.add('u7l5-pstamp'); await stampIn(c, s); } }];
    }
    // fraction intercept: find lattice points with a table
    const xs = [-1, 0, 1, 2, 3, 4, 5], rows = xs.map((x) => [x, fr(-d.C - d.A * x, d.B)]), good = xs.map((x) => Number.isInteger((-d.C - d.A * x) / d.B));
    let tb;
    return [coverY,
      { cap: `Now ${T('x=0')}: ${T(d.yL)}, so ${T(tc(YI, 'y=' + yiT))}, about ${T('1.33')}: <b>between grid lines</b>, hard to plot accurately.`,
        run: async (c) => {
          E.uncover(); c1 = E.cover(['tx'], 'x = 0'); await pop(c, c1, 320);
          await pls(c, P, `${T('x=0')}: ${T(d.yL)} → ${T(tc(YI, 'y=' + yiT))} ✗`, 'u7l5-warn');
          yP = G.point(0, yi, { color: YI, r: 8, open: true, pos: 'ne' }); await G.reveal(yP, c);
          const q = G.label(0, yi, '?', { pos: 'w', cls: 'u7l5-q', gap: 12 }); await pop(c, q);
        } },
      { cap: `Find <b>lattice points</b> instead: try convenient ${T('x')}-values until ${T('y=\\dfrac{4-2x}{3}')} is an integer.`,
        run: async (c) => {
          E.uncover();
          tb = new ValueTable(P, { headers: ['x', 'y'], rows, layout: 'h', cellW: Math.min(54, Math.floor((ex.W - 488 - 34 - 46) / rows.length)), cellH: 46, headW: 46, hide: 1, tap: false, cls: 'u7l5-ctab' });
          await show(c, tb.el); await tb.fill(c, { stagger: 160 });
        } },
      { cap: `${T('x=-1')} gives ${T('y=2')} and ${T('x=5')} gives ${T('y=-2')}: plot ${T('(-1,2)')} and ${T('(5,-2)')}.`,
        run: async (c) => {
          xs.forEach((x, i) => { if (good[i]) tb.cell(i, 1).classList.add('u7l5-good'); });
          for (const [x, y] of [[-1, 2], [5, -2]]) await G.reveal(G.point(x, y, { color: LINE, r: 7, coords: true, pos: 'ne' }), c);
        } },
      { cap: `Draw the line through ${T('(2,0)')}, ${T('(-1,2)')} and ${T('(5,-2)')}. It passes through ${T('(0,\\tfrac43)')} on its way.`,
        run: async (c) => { await G.drawIn(G.line([-1, 2], [5, -2], { color: LINE, width: 4.5 }), 800, c); } }];
  }
};

/* =============================== dials: m tilts, b slides =============================== */
const DI = {
  m: { label: 'Tilt: change m', b: 1, seq: [[1, 3], [3, 1], [0, 1], [-1, 3], [-2, 1]] },
  b: { label: 'Slide: change b', m: [2, 1], seq: [3, -2, 0] }
};
const dials = {
  title: 'Read the line from m and b',
  height: 470,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(DI).map((k) => ({ v: k, label: DI[k].label })),
  intro: (k) => (k === 'm' ? 'Keep <b>b</b> fixed and turn the <b>m</b> dial. Press <b>Next</b>.' : 'Keep <b>m</b> fixed and slide <b>b</b>. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = DI[k], G = grid(stage, { x: 14, y: 14 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'y = mx + b');
    const eq = pl(P, '', 'u7l5-big u7l5-live');
    const mkGauge = (name, lo, hi, color, ticks) => {
      const g = h('div', 'u7l5-gauge'); P.appendChild(g);
      g.innerHTML = `<div class="u7l5-gn" style="color:${color}">${name}</div><div class="u7l5-gt"><div class="u7l5-gk" style="background:${color}"></div>${ticks.map((t) => `<span class="u7l5-gtick" style="left:${(t - lo) / (hi - lo) * 100}%">${n(t)}</span>`).join('')}</div>`;
      const knob = g.querySelector('.u7l5-gk'); return (v) => { knob.style.left = `${(Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * 100}%`; };
    };
    const gm = mkGauge('m', -3, 3, SL, [-3, -2, -1, 0, 1, 2, 3]), gb = mkGauge('b', -5, 5, YI, [-4, -2, 0, 2, 4]);
    const desc = pl(P, '', 'u7l5-desc');
    const rules = h('div', 'u7l5-rules', `<div><b>sign</b> of ${T(tc(SL, 'm'))}: rises (+) or falls (−)</div><div><b>size</b> of ${T(tc(SL, 'm'))}: steep (big) or shallow (small)</div><div>${T(tc(YI, 'b'))}: where it crosses the ${T('y')}-axis</div>`); P.appendChild(rules);
    const st = { m: k === 'm' ? d.seq[0][0] / d.seq[0][1] : d.m[0] / d.m[1], b: k === 'm' ? d.b : 1 };
    const A = [0, st.b], B = [1, st.b + st.m];
    const L = G.line(A, B, { color: LINE, width: 4.5 }), bp = G.point(0, st.b, { color: YI, r: 8 });
    const mTex = (m) => { const f = [[1, 3], [-1, 3], [1, 2], [-1, 2], [2, 3], [-2, 3]].find(([p, q]) => Math.abs(m - p / q) < 1e-6); return f ? fr(f[0], f[1]) : texNum(Math.round(m * 10) / 10); };
    const words = (m) => (Math.abs(m) < 1e-9 ? 'flat (horizontal)' : `${m > 0 ? '<b class="u7l5-up">rises</b>' : '<b class="u7l5-down">falls</b>'}, ${Math.abs(m) >= 1.5 ? '<b>steep</b>' : Math.abs(m) <= 0.5 ? '<b>shallow</b>' : 'medium'}`);
    const paint = () => {
      A[1] = st.b; B[1] = st.b + st.m; L._bkDraw(); G.moveTo(bp, 0, st.b); gm(st.m); gb(st.b);
      const mt = mTex(st.m), bt = Math.round(st.b * 10) / 10;
      const mp = mt === '1' ? '' : mt === '-1' ? '-' : mt;
      eq.innerHTML = T(`y=${mp ? tc(SL, mp) : ''}x${bt === 0 ? '' : tc(YI, (bt > 0 ? '+' : '') + texNum(bt))}`);
      desc.innerHTML = `${words(st.m)}; crosses the ${T('y')}-axis at ${T(tc(YI, pairTex(0, bt)))}`;
    };
    paint();
    const tilt = (c, m1) => { const a0 = Math.atan(st.m), a1 = Math.atan(m1); return tween(c, 1100, (t) => { st.m = Math.abs(t - 1) < 1e-9 ? m1 : Math.tan(a0 + (a1 - a0) * t); paint(); }); };
    const slide = (c, b1) => { const b0 = st.b; return tween(c, 1000, (t) => { st.b = b0 + (b1 - b0) * t; paint(); }); };
    if (k === 'm') {
      const ms = d.seq.map(([p, q]) => p / q);
      return [
        { cap: `${T('m=\\tfrac13')}: <b>positive</b> and <b>small</b>, so the line rises gently. ${T('b=1')} pins it to ${T('(0,1)')}.`, run: async (c) => { await pop(c, bp); } },
        { cap: `Turn ${T('m')} up to ${T('3')}: the line tilts about ${T('(0,1)')} and gets <b>steeper</b>. The <b>size</b> of ${T('m')} is the steepness.`, run: (c) => tilt(c, ms[1]) },
        { cap: `${T('m=0')}: <b>flat</b>, a horizontal line through ${T('(0,1)')}.`, run: (c) => tilt(c, ms[2]) },
        { cap: `${T('m=-\\tfrac13')}: <b>negative</b>, so the line <b>falls</b> from left to right, gently.`, run: (c) => tilt(c, ms[3]) },
        { cap: `${T('m=-2')}: falls <b>steeply</b>. The <b>sign</b> of ${T('m')} gives the direction; the <b>size</b> gives the steepness. ${T('b')} never changed.`, run: (c) => tilt(c, ms[4]) }
      ];
    }
    return [
      { cap: `${T('y=2x+1')}: rises steeply and crosses the ${T('y')}-axis at ${T('(0,1)')}.`, run: async (c) => { await pop(c, bp); } },
      { cap: `${T('b=3')}: the whole line <b>slides up</b> 2. Same tilt, so it is parallel to where it was.`, run: (c) => slide(c, 3) },
      { cap: `${T('b=-2')}: it slides <b>down</b> and now crosses at ${T('(0,-2)')}.`, run: (c) => slide(c, -2) },
      { cap: `${T('b=0')}: through the origin. ${T('b')} says <b>where</b> the line crosses; ${T('m')} says how it <b>tilts</b>.`, run: (c) => slide(c, 0) }
    ];
  }
};

/* =============================== match: Example 3 check =============================== */
const MT = [
  { e: '3x-y+2=0', s: 'y=3x+2', m: '3', b: 2, w: 'steep, rising', g: 'D' },
  { e: 'y=-2x+1', s: 'y=-2x+1', m: '-2', b: 1, w: 'steep, falling', g: 'A' },
  { e: 'y-1=-\\tfrac{1}{3}(x-3)', s: 'y=-\\tfrac13x+2', m: '-\\tfrac13', b: 2, w: 'shallow, falling', g: 'C' },
  { e: '3y-x-9=0', s: 'y=\\tfrac13x+3', m: '\\tfrac13', b: 3, w: 'shallow, rising', g: 'B' }
];
const MCOL = [COLORS.red, COLORS.teal, COLORS.purple, COLORS.amber];
const match = {
  title: 'Example 3 check: match by m and b',
  height: 440,
  minW: 880, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ex3', label: 'Example 3 check' }],
  intro: 'Four graphs, four equations. Solve each for <b>y</b> and read <b>m</b> and <b>b</b>. Press <b>Next</b>.',
  make(stage, k, ex) {
    const gw = 196, gap = (ex.W - 4 * gw) / 5, Gs = {}, frames = {};
    EX3G.forEach((d, i) => {
      const x = gap + i * (gw + gap), f = add(stage, box(h('div', 'u7l5-mframe'), gw + 12, gw + 40), x - 6, 6);
      f.appendChild(h('div', 'u7l5-mft', `Graph ${d.k}`)); frames[d.k] = f;
      const G = new Graph(f, { width: gw, height: gw, xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5, xlabels: 4, ylabels: 4, fontSize: 12 });
      G.segment(d.a, d.b, { color: INK, width: 3, ends: ['arrow', 'arrow'] }); Gs[d.k] = G;
    });
    const W = add(stage, box(h('div', 'u7l5-mwork'), ex.W - 28, 168), 14, 260);
    const steps = MT.map((d, i) => ({
      cap: `Eqn ${i + 1}: ${T(d.e)} ${d.e === d.s ? 'is already' : 'becomes'} ${T(d.s)}. ${T('m=' + d.m)}: ${d.w}. ${T('b=' + d.b)}. That is <b>Graph ${d.g}</b>.`,
      run: async (c) => {
        W.innerHTML = '';
        const row = h('div', 'u7l5-mrow'); W.appendChild(row);
        const a = h('div', 'u7l5-mcell', `<span class="u7l5-mtag" style="background:${MCOL[i]}">Eqn ${i + 1}</span> ${T(d.e)}`); row.appendChild(a); await show(c, a);
        if (d.e !== d.s) { const b = h('div', 'u7l5-mcell', `→ ${T(d.s)}`); row.appendChild(b); await show(c, b); }
        const r2 = h('div', 'u7l5-mrow'); W.appendChild(r2);
        const m = h('div', 'u7l5-mchip u7l5-mm', `${T(tc(SL, 'm=' + d.m))} ${d.w}`), bb = h('div', 'u7l5-mchip u7l5-mb', `${T(tc(YI, 'b=' + d.b))} crosses at ${T(pairTex(0, d.b))}`);
        r2.append(m, bb); await show(c, m); await show(c, bb);
        const G = Gs[d.g]; const p = G.point(0, d.b, { color: YI, r: 6 }); await pop(c, p);
        frames[d.g].classList.add('on'); frames[d.g].style.setProperty('--mc', MCOL[i]);
        const t = h('div', 'u7l5-mtag u7l5-mtag2', `Eqn ${i + 1}`); t.style.background = MCOL[i]; frames[d.g].appendChild(t); await pop(c, t);
      }
    }));
    steps.push({ cap: `Each graph used once: ${T('1\\to D,')} ${T('2\\to A,')} ${T('3\\to C,')} ${T('4\\to B')}. Eqns 1 and 3 share ${T('b=2')}, so the <b>sign</b> of ${T('m')} decided between D and C.`,
      run: async (c) => { W.innerHTML = ''; const r = h('div', 'u7l5-mrow u7l5-msum', MT.map((d, i) => `<span><span class="u7l5-mtag" style="background:${MCOL[i]}">Eqn ${i + 1}</span> → <b>${d.g}</b></span>`).join('')); W.appendChild(r); await show(c, r); const s = stamp(W, 'matched ✓', { ok: true }); s.classList.add('u7l5-mst'); await stampIn(c, s); } });
    return steps;
  }
};

/* =============================== data: table → equation =============================== */
const DA = {
  ex5: { label: 'Example 4 check', xs: EX5.xs, ys: EX5.ys, m: [9, 5], b: 32, mult: 5, gf: '9x-5y+160=0', mid: '5y=9x+160', chk: [30, 86], chkT: '9(30)-5(86)+160=270-430+160=0',
    solve: ['9x=5y-160', 'x=\\dfrac{5y-160}{9}', '=\\dfrac{5}{9}(y-32)'], g: { xmax: 80, ymax: 180, xstep: 10, ystep: 20, xlabels: 10, ylabels: 20 }, meaning: true },
  own: { label: `Try: ${T('(0,5),(2,8),\\ldots')}`, xs: [0, 2, 4, 6, 8], ys: [5, 8, 11, 14, 17], m: [3, 2], b: 5, mult: 2, gf: '3x-2y+10=0', mid: '2y=3x+10', chk: [4, 11], chkT: '3(4)-2(11)+10=12-22+10=0',
    solve: ['3x=2y-10', 'x=\\dfrac{2y-10}{3}', '=\\dfrac{2}{3}(y-5)'], g: { xmax: 10, ymax: 20, xstep: 1, ystep: 2, xlabels: 2, ylabels: 4 } }
};
const data = {
  title: 'From a table of data to an equation',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(DA).map((k) => ({ v: k, label: DA[k].label })),
  intro: 'Plot, check the steps, find the slope and intercept, then general form. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = DA[k], N = d.xs.length, ch = Math.min(46, Math.floor(400 / (N + 1)));
    const tb = new ValueTable(stage, { x: 12, y: 14, headers: ['x', 'y'], rows: d.xs.map((x, i) => [x, d.ys[i]]), cellW: 66, cellH: ch, tap: false, diffs: true, diffSpace: 74 });
    const G = new Graph(stage, Object.assign({ x: 232, y: 14, width: 410, height: 440, xmin: 0, ymin: 0, origin: true, fontSize: 14 }, d.g));
    const P = panel(stage, 656, 14, ex.W - 670, 440, 'Equation');
    const x0 = d.xs[0], y0 = d.ys[0], x1 = d.xs[N - 1], y1 = d.ys[N - 1], dx = d.xs[1] - x0, dy = d.ys[1] - y0, mT = fr(d.m[0], d.m[1], true);
    const steps = [
      { cap: `Plot the ${N} ordered pairs.`, run: async (c) => { for (let i = 0; i < N; i++) { tb.highlight(i, true); await G.reveal(G.point(d.xs[i], d.ys[i], { color: PT, r: 6 }), c, 160); tb.highlight(i, false); } } },
      { cap: `Every step of ${T('+' + dx)} in ${T('x')} gives ${T('+' + dy)} in ${T('y')}: equal steps, so the points are <b>collinear</b>.`,
        run: async (c) => { await tb.diffs(c, { col: 1 }); } },
      { cap: `Slope from two of the points, ${T(pairTex(x0, y0))} and ${T(pairTex(x1, y1))}: ${T(`m=\\dfrac{${y1}-${y0}}{${x1}-${x0}}=\\dfrac{${y1 - y0}}{${x1 - x0}}=${mT}`)}.`,
        run: async (c) => {
          const a = G.segment([x0, y0], [x1, y0], { color: RUN, width: 4.5 }); await G.drawIn(a, 500, c);
          const b = G.segment([x1, y0], [x1, y1], { color: RISE, width: 4.5 }); await G.drawIn(b, 500, c);
          const la = G.label((x0 + x1) / 2, y0, `run ${x1 - x0}`, { pos: 's', cls: 'u7l5-legl u7l5-legu', gap: 6 }), lb = G.label(x1, (y0 + y1) / 2, `rise ${y1 - y0}`, { pos: 'w', cls: 'u7l5-legl u7l5-legr', gap: 8 });
          await show(c, la); await show(c, lb);
          await pls(c, P, T(`m=\\dfrac{${tc(RISE, y1 - y0)}}{${tc(RUN, x1 - x0)}}=${tc(SL, mT)}`));
        } },
      { cap: `At ${T('x=0')} the table gives ${T('y=' + d.b)}: that is the ${T('y')}-intercept. So ${T(`y=${fr(d.m[0], d.m[1])}x+${d.b}`)}.`,
        run: async (c) => {
          await pop(c, G.point(0, d.b, { color: YI, r: 8 })); await pls(c, P, T(`y=${tc(SL, fr(d.m[0], d.m[1]))}x+${tc(YI, d.b)}`), 'u7l5-big');
          await G.drawIn(G.line([0, d.b], [d.m[1], d.b + d.m[0]], { color: LINE, width: 3.5 }), 800, c);
        } },
      { cap: `General form: multiply every term by ${T(d.mult)} to clear the fraction, then move everything to one side with ${T('A>0')}: ${T(d.gf)}.`,
        run: async (c) => { await pls(c, P, `×${d.mult}: ${T(d.mid)}`, 'u7l5-soft'); await pls(c, P, T(d.gf), 'u7l5-big u7l5-gf'); } },
      { cap: `Check with another point, ${T(pairTex(d.chk[0], d.chk[1]))}: ${T(d.chkT)} ✓`,
        run: async (c) => { await pls(c, P, `check ${T(pairTex(d.chk[0], d.chk[1]))}: ${T(d.chkT.split('=').slice(1).join('='))} ✓`, 'u7l5-ok'); } },
      { cap: `Back again: solve the general form for ${T('x')}. ${T(d.solve[0])}, so ${T(d.solve[1] + d.solve[2])}.`,
        run: async (c) => { await pls(c, P, `${T(d.solve[1])}<br>${T('\\phantom{x}' + d.solve[2])}`, 'u7l5-solve'); } }
    ];
    if (d.meaning) steps.push({ cap: `${T('x=0')} gives ${T('32')} and ${T('x=100')} gives ${T('\\tfrac95(100)+32=212')}: freezing and boiling water. ${T('x')} is <b>°C</b> and ${T('y')} is <b>°F</b>.`,
      run: async (c) => { const t = h('div', 'u7l5-temp', '<span>x = °C</span><span>y = °F</span>'); P.appendChild(t); await pop(c, t); } });
    return steps;
  }
};

/* =============================== machine: forwards and backwards =============================== */
const MC = { boil: { label: '100 °C (boiling)', x: 100 }, body: { label: '37 °C (body)', x: 37 }, cold: { label: '−40 °C', x: -40 } };
const machine = {
  title: 'Forwards and backwards',
  height: 420,
  choices: Object.keys(MC).map((k) => ({ v: k, label: MC[k].label })),
  intro: (k) => `Send ${T(texNum(MC[k].x))} through ${T('y=\\tfrac95x+32')}, then bring it back. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const x = MC[k].x, a = Math.round(x * 9 / 5 * 1000) / 1000, y = Math.round((a + 32) * 1000) / 1000;
    const W = ex.W, bw = 170, bh = 74, gapX = (W - 2 * 120 - 2 * bw) / 3;
    const row = (yy, cls, labels, ends) => {
      const xs = [20, 20 + 120 + gapX, 20 + 120 + 2 * gapX + bw, W - 140];
      const io0 = add(stage, box(h('div', 'u7l5-io', `<span>${ends[0]}</span>`), 120, bh), xs[0], yy);
      const m1 = add(stage, box(h('div', 'u7l5-mach ' + cls, `<span>${labels[0]}</span>`), bw, bh), xs[1], yy);
      const m2 = add(stage, box(h('div', 'u7l5-mach ' + cls, `<span>${labels[1]}</span>`), bw, bh), xs[2], yy);
      const io1 = add(stage, box(h('div', 'u7l5-io', `<span>${ends[1]}</span>`), 120, bh), xs[3], yy);
      const ar = [[xs[0] + 120, xs[1]], [xs[1] + bw, xs[2]], [xs[2] + bw, xs[3]]].map(([p, q]) => { const e = add(stage, box(h('div', 'u7l5-marr ' + cls), q - p - 16, 6), p + 8, yy + bh / 2 - 3); return e; });
      const els = [io0, m1, m2, io1, ...ar]; els.forEach(hide);
      return { els, pts: [xs[0] + 60, xs[1] + bw / 2, xs[2] + bw / 2, xs[3] + 60], yy };
    };
    const F = row(40, 'u7l5-fwd', [`× ${T('\\tfrac95')}`, `+ ${T('32')}`], [`${T('x')} °C`, `${T('y')} °F`]);
    const B = row(212, 'u7l5-bwd', [`− ${T('32')}`, `× ${T('\\tfrac59')}`], [`${T('y')} °F`, `${T('x')} °C`]);
    add(stage, h('div', 'u7l5-mlab', `forwards: ${T('y=\\tfrac95x+32')}`), 20, 4); add(stage, h('div', 'u7l5-mlab u7l5-mlabb', `backwards: ${T('x=\\tfrac59(y-32)')}`), 20, 176);
    const labs = stage.querySelectorAll('.u7l5-mlab'); labs.forEach(hide);
    const tok = add(stage, h('div', 'u7l5-tok', ''), 0, 0); hide(tok);
    const at = (px, yy, v) => { tok.innerHTML = n(v); tok.style.left = px + 'px'; tok.style.top = yy + bh + 10 + 'px'; };
    const travel = async (c, R, vals) => {
      at(R.pts[0], R.yy, vals[0]); tok.style.opacity = 1; await pop(c, tok);
      for (let i = 1; i < 4; i++) {
        const p0 = R.pts[i - 1], p1 = R.pts[i];
        await tween(c, 650, (t) => { tok.style.left = p0 + (p1 - p0) * t + 'px'; });
        at(p1, R.yy, vals[i]); await pulse(c, tok, 1.18, 300); await sleep(c, 200);
      }
    };
    const outT = h('div', 'u7l5-mout', ''); add(stage, outT, 20, 360); hide(outT);
    return [
      { cap: `${T('y=\\tfrac95x+32')} as a machine: first <b>multiply</b> by ${T('\\tfrac95')}, then <b>add</b> ${T('32')}.`,
        run: async (c) => { await show(c, labs[0]); for (const e of F.els) await appear(c, e, 180); } },
      { cap: `Send in ${T(texNum(x))}: ${T(`${texNum(x)}\\times\\tfrac95=${texNum(a)}`)}, then ${T(`${texNum(a)}+32=${texNum(y)}`)}.`,
        run: (c) => travel(c, F, [x, x, a, y]) },
      { cap: `To go <b>backwards</b>, undo each step in <b>reverse order</b>: subtract ${T('32')} first, then multiply by the reciprocal ${T('\\tfrac59')}.`,
        run: async (c) => { hide(tok); await show(c, labs[1]); for (const e of B.els) await appear(c, e, 180); } },
      { cap: `Send ${T(texNum(y))} back: ${T(`${texNum(y)}-32=${texNum(a)}`)}, then ${T(`${texNum(a)}\\times\\tfrac59=${texNum(x)}`)}. Back where we started.`,
        run: (c) => travel(c, B, [y, y, a, x]) },
      { cap: x === -40 ? `${T('-40')} °C is ${T('-40')} °F: the one temperature where both scales agree. The backward machine is ${T('x=\\tfrac59(y-32)')}.` : `The backward machine is exactly ${T('x=\\tfrac59(y-32)')}: solving for the other variable <b>reverses</b> the relationship.`,
        run: async (c) => { outT.innerHTML = `${T(texNum(x))} °C ${T('\\rightleftarrows')} ${T(texNum(y))} °F`; await show(c, outT); const s = stamp(stage, 'reversed ✓', { ok: true }); s.style.left = W - 250 + 'px'; s.style.top = '352px'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== mount =============================== */
mountWarm();
mountFigures();
export const explainers = mountExplainers({ morph, flow, step, cover, dials, match, data, machine });
export const _test = { MO, FP, ST, CV, DI, MT, DA, MC, fr, red };
