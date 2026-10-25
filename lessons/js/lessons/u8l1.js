/* Math 10C · Unit 8 · Lesson 1 — Solving Systems by Graphing: How Many Solutions?
 * (Merged from the former Lessons 1A and 1B; no graphing calculator: every system is graphed by hand.)
 * Warm-up "Head Start" (three races on a track with a clock), Example 5 grids whose answer lines appear on the same grid,
 * and the explainers:
 *   dragLab (drag a point around the grid with a live ✓/✗ for each equation; only the crossing gets ✓ ✓),
 *   readGraph (Example 1: drop to the axes, x first, verify in both; the swapped-pair slip), sameY (the shortcut: a sweep
 *   line where the two y-values meet, then set them equal; warm-up Race 1 and Example 4), byHand (Example 2 by slope–
 *   intercept and by tables of values), tickets (Example 3: story → equations → graph → meaning), breakEven (Example 4:
 *   the gap between cost and revenue is the profit or loss), turnSlide (the star: the amber line turns until it is
 *   parallel, then slides until it lies on top, with the solution count, the slope/intercept comparison and the
 *   classification chart lighting up live), races (the warm-up races as distance–time lines), count (Example 5 check:
 *   graph and count), classify (Example 7 check with a two-question flowchart).
 * Colours: line 1 / equation 1 blue, line 2 / equation 2 amber, the solution point purple; profit green, loss red. */
import {
  h, tex, add, box, place, Graph, ValueTable, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, sleep, tween, pulse,
  pairTex, texNum, svgEl, liveCtx, COLORS, num
} from '../blocks.js';
import { standup } from '../standup.js';

const T = (s) => tex(String(s));
const BLUE = COLORS.blue, AMB = COLORS.amber, PUR = COLORS.purple, GRN = COLORS.green, RED = COLORS.red, INK = COLORS.ink;
const k1 = (s) => `\\textcolor{${BLUE}}{${s}}`, k2 = (s) => `\\textcolor{${AMB}}{${s}}`, kp = (s) => `\\textcolor{${PUR}}{${s}}`;
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u8l1-panel ' + cls, title ? `<div class="u8l1-ph">${title}</div>` : ''), w, hh), x, y);
const line = (P, html, cls = '') => { const d = h('div', 'u8l1-line ' + cls, html); P.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const say = async (c, P, html, cls) => { const d = line(P, html, cls); await show(c, d); return d; };
const pt = (x, y) => pairTex(x, y);

/* ---------------- equations: value of each side, and the substitution as TeX ---------------- */
const wrap = (v, first) => (v < 0 && !first ? `(${texNum(v)})` : texNum(v));
/** the term k·v as TeX ("2(3)", "+(−4)", "−3", "−\tfrac43(1.7)") */
function term(k, v, first, kt) {
  const a = Math.abs(k), sign = k < 0 ? '-' : first ? '' : '+';
  if (a === 1 && !kt) return sign + wrap(v, first && k > 0);
  return sign + (kt || texNum(a)) + `(${texNum(v)})`;
}
/** a·x + b·y = c */
function STD(a, b, c, t) {
  return { tex: t, a, b, c, L: (x, y) => a * x + b * y, R: () => c, Ls: (x, y) => term(a, x, true) + term(b, y, false), Rs: null,
    f: b ? (x) => (c - a * x) / b : null, vx: b ? null : c / a };
}
/** y = m·x + b (o.bFirst writes b + m·x; o.mt is the TeX of a fractional |m|) */
function YF(m, b, t, o = {}) {
  const tail = (x) => (o.bFirst ? texNum(b) + term(m, x, false, o.mt) : term(m, x, true, o.mt) + (b ? (b < 0 ? '-' : '+') + texNum(Math.abs(b)) : ''));
  return { tex: t, m, b, L: (x, y) => y, R: (x) => m * x + b, Ls: null, Rs: tail, f: (x) => m * x + b };
}
/** substitute (x, y): { ok, tex } with each worked side under a brace */
function chk(eq, x, y) {
  const lv = eq.L(x, y), rv = eq.R(x, y), ok = Math.abs(lv - rv) < 1e-9;
  const side = (s, v) => (s ? `\\underbrace{${s}}_{\\textstyle ${texNum(v)}}` : texNum(v));
  return { ok, tex: `${side(eq.Ls && eq.Ls(x, y), lv)}${ok ? '=' : '\\neq '}${side(eq.Rs && eq.Rs(x, y), rv)}` };
}
const eqLine = (G, eq, o) => (eq.f ? G.line([0, eq.f(0)], [1, eq.f(1)], o) : G.line({ x: eq.vx }, o));
const mark = (ok) => (ok ? '<b class="u8l1-ok">✓</b>' : '<b class="u8l1-no">✗</b>');
/** a "check in eq" row for a panel: coloured equation, then the substitution and ✓/✗ */
function checkRow(P, eq, x, y, col) {
  const r = chk(eq, x, y), k = col === AMB ? k2 : k1;
  return line(P, `<span class="u8l1-ckeq">${T(k(eq.tex))}</span><span class="u8l1-cksub">${T(r.tex)}</span>${mark(r.ok)}`, 'u8l1-ck');
}

const BL = COLORS.blue, AM = COLORS.amber, PU = COLORS.purple, GR = COLORS.green, RD = COLORS.red, SL = COLORS.slate;
const c1 = (s) => `\\textcolor{${BL}}{${s}}`, c2 = (s) => `\\textcolor{${AM}}{${s}}`, cP = (s) => `\\textcolor{${PU}}{${s}}`;
const hideAll = (...els) => els.flat().forEach((e) => { if (e) e.style.opacity = 0; });
const put = (el, html) => { if (el._h !== html) { el._h = html; el.innerHTML = html; } };
const d1 = (v) => texNum(v, 1), d2 = (v) => texNum(v, 2);
const pm = (v) => String(v).replace('-', '−');
const KIND = {
  one: { n: '1', word: 'one solution', cls: 'u8l1-m-k-one' },
  none: { n: '0', word: 'no solution', cls: 'u8l1-m-k-none' },
  inf: { n: T('\\infty'), word: 'infinitely many', cls: 'u8l1-m-k-inf' }
};
const verdict = (host, kind, x, y, extra = '') => {
  const k = KIND[kind], v = h('div', 'u8l1-m-verdict ' + k.cls, `<span class="u8l1-m-vn">${k.n}</span><span class="u8l1-m-vw">${k.word}${extra}</span>`);
  if (x != null) add(host, v, x, y); else host.appendChild(v);
  v.style.opacity = 0; return v;
};

/** a whole line y = m x + b read from get() → [m, b] on every redraw, clipped to the window, arrows at the edges */
function mbLine(G, get, o = {}) {
  return G.curve(() => {
    const [m, b] = get(), L = Math.hypot(1, m), d = [1 / L, m / L], a = [0, b];
    const TT = G._clipT(a, d, -Infinity, Infinity); if (!TT) return { subs: [] };
    const p0 = G.toPx(a[0] + d[0] * TT[0], a[1] + d[1] * TT[0]), p1 = G.toPx(a[0] + d[0] * TT[1], a[1] + d[1] * TT[1]);
    const Lp = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); if (Lp < 2) return { subs: [] };
    const u = [(p1[0] - p0[0]) / Lp, (p1[1] - p0[1]) / Lp];
    if (o.arrows === false) return { subs: [[p0, p1]] };
    return { subs: [[p0, p1]], ends: [{ p: p0, d: [-u[0], -u[1]], s: 'arrow', k: 0, si: 0, last: false }, { p: p1, d: u, s: 'arrow', k: 1, si: 0, last: true }] };
  }, Object.assign({ width: 4 }, o), 'bk-line', G.layers.data);
}
const setDash = (L, on) => { if (on) L.path.setAttribute('stroke-dasharray', '13 10'); else L.path.removeAttribute('stroke-dasharray'); };

/** y = mx + b as TeX with decimals (for lines that move) */
function mbLive(m, b, y = 'y', x = 'x') {
  const z = (v) => Math.abs(v) < 0.005;
  const M = z(m) ? '' : (Math.abs(m - 1) < 0.005 ? '' : Math.abs(m + 1) < 0.005 ? '-' : d2(m)) + x;
  let s = y + '=' + M;
  if (!z(b)) s += M ? (b > 0 ? '+' : '-') + d2(Math.abs(b)) : d2(b); else if (!M) s += '0';
  return s;
}

/** plot y = mx + b the way students do: the y-intercept, one slope step (run, rise), then the whole line */
async function plotMB(G, c, m, b, color, o = {}) {
  const run = o.run || 1, rise = m * run;
  const P0 = G.point(0, b, { color, r: 7 }); P0.style.opacity = 0;
  const s1 = G.segment([0, b], [run, b], { color, width: 3, dash: true }), s2 = G.segment([run, b], [run, b + rise], { color, width: 3, dash: true });
  hideAll(s1, s2);
  const L = G.line({ m, b }, { color, width: o.width || 4, dash: o.dash });
  L.style.opacity = 0;
  await pop(c, P0, 300);
  s1.style.opacity = 1; await G.drawIn(s1, 280, c); s2.style.opacity = 1; await G.drawIn(s2, 280, c);
  L.style.opacity = 1; await G.drawIn(L, 650, c);
  G.remove(s1, s2);
  let lab = null;
  if (o.label) { lab = G.label(o.label[0], o.label[1], T(o.label[3]), { cls: 'bk-ptlab u8l1-m-glab', color, pos: o.label[2] || 'e' }); await fadeIn(c, lab); }
  return { L, P0, lab };
}

/* =============================== warm-up: head start =============================== */
const RACES = [
  { n: 'Race 1', A: { n: 'Rosa', i: 'R', f: (t) => 30 + 4 * t }, B: { n: 'Max', i: 'M', f: (t) => 6 * t },
    rule: '<b class="u8l1-m-c1">Rosa</b>: <b>30 m</b> head start, runs <b>4 m/s</b><br><b class="u8l1-m-c2">Max</b>: no head start, runs <b>6 m/s</b>' },
  { n: 'Race 2', A: { n: 'Lee', i: 'L', f: (t) => 20 + 5 * t }, B: { n: 'Ana', i: 'A', f: (t) => 5 * t },
    rule: '<b class="u8l1-m-c1">Lee</b>: <b>20 m</b> head start, runs <b>5 m/s</b><br><b class="u8l1-m-c2">Ana</b>: no head start, runs <b>5 m/s</b>' },
  { n: 'Race 3', A: { n: 'Kai', i: 'K', f: (t) => 10 + 3 * t }, B: { n: 'Jo', i: 'J', f: (t) => 2 * (5 + 1.5 * t), mystery: true },
    rule: `<b class="u8l1-m-c1">Kai</b>: <b>10 m</b> head start, runs <b>3 m/s</b><br><b class="u8l1-m-c2">Jo</b>’s coach: after ${T('t')} s, Jo is at ${T('2(5+1.5t)')} m` }
];
function mountWarm() {
  const host = document.getElementById('u8l1-m-races'); if (!host) return;
  const scale = h('div', 'u8l1-m-scale'); host.appendChild(scale);
  scale.innerHTML = '<div></div><div class="u8l1-m-scl">' + [0, 50, 100, 150, 200].map((m) => `<i style="left:${m / 2}%">${m} m</i>`).join('') + '</div><div></div>';
  const rows = RACES.map((r) => {
    const row = h('div', 'u8l1-m-race', `<div class="u8l1-m-rn">${r.n}</div><div class="u8l1-m-track"><div class="u8l1-m-lane"></div><div class="u8l1-m-lane"></div><div class="u8l1-m-start"></div><div class="u8l1-m-fin">FINISH</div><div class="u8l1-m-meet"></div></div><div class="u8l1-m-rule">${r.rule}<div class="u8l1-m-pos"></div></div>`);
    host.appendChild(row);
    const tr = row.querySelector('.u8l1-m-track');
    const tok = (who, lane, cls) => { const t = h('div', 'u8l1-m-tok ' + cls, who.i); t.style.top = (lane ? 66 : 22) + '%'; tr.appendChild(t); return t; };
    return { r, row, a: tok(r.A, 0, 'u8l1-m-ta'), b: tok(r.B, 1, 'u8l1-m-tb'), pos: row.querySelector('.u8l1-m-pos'), meet: row.querySelector('.u8l1-m-meet') };
  });
  const clockV = document.getElementById('u8l1-m-clockv');
  let T0 = 0, started = false;
  const at = (d) => `calc(22px + (100% - 44px) * ${(Math.min(200, d) / 200).toFixed(4)})`;
  const setT = (t) => {
    T0 = t; clockV.textContent = (Math.round(t * 10) / 10) + ' s';
    rows.forEach((o) => {
      const dA = Math.min(200, o.r.A.f(t)), dB = Math.min(200, o.r.B.f(t)), myst = o.r.B.mystery && !started;
      o.a.style.left = at(dA); o.b.style.left = myst ? '0%' : at(dB);
      o.b.textContent = myst ? '?' : o.r.B.i; o.b.classList.toggle('u8l1-m-myst', myst);
      const side = !myst && Math.abs(dA - dB) < 0.6 && dA < 200;
      o.row.classList.toggle('u8l1-m-side', side);
      put(o.pos, myst ? `${o.r.A.n} ${pm(Math.round(dA * 10) / 10)} m · ${o.r.B.n} ?` : `${o.r.A.n} ${Math.round(dA * 10) / 10} m · ${o.r.B.n} ${Math.round(dB * 10) / 10} m` + (side ? ' · <b>side by side!</b>' : ''));
      if (o.r.n === 'Race 1') { const met = t >= 15; o.meet.style.display = met ? 'block' : 'none'; o.meet.style.left = at(90); o.meet.textContent = 'level at 15 s'; }
    });
  };
  setT(0);
  let gen = 0;
  const go = async (t1, ms) => { const g = ++gen, c = liveCtx(), t0 = T0; started = true; await tween(c, ms, (u) => { if (g !== gen) return false; setT(t0 + (t1 - t0) * u); }, (u) => u); };
  document.getElementById('u8l1-m-run').addEventListener('click', () => { if (T0 >= 64.9) setT(0); go(65, (65 - T0) * 130); });
  document.getElementById('u8l1-m-step').addEventListener('click', () => go(Math.min(65, T0 + 5), 650));
  document.getElementById('u8l1-m-reset').addEventListener('click', () => { gen++; started = false; setT(0); });
}

/* =============================== Example 5 grids (answers drawn on the same grid) =============================== */
const EX1 = {
  a: { lines: [{ m: 1, b: -2, color: BL, lab: [-1, -3, 'nw', 'y=x-2'] }, { m: -1, b: 6, color: AM, lab: [-1.5, 7.5, 'w', 'y=-x+6'] }], pt: [4, 2] },
  b: { lines: [{ m: 2, b: 3, color: BL, lab: [-3.5, -4, 'w', 'y=2x+3'] }, { m: 2, b: -5, color: AM, lab: [1, -6, 'e', 'y=2x-5'] }] },
  c: { lines: [{ m: 4, b: -6, color: BL, lab: [2.5, 4, 'w', 'y=4x-6'] }, { m: 4, b: -6, color: AM, dash: true, lab: [0.6, -7.2, 'e', '8x-2y-12=0'] }] }
};
function mountEx1() {
  Object.keys(EX1).forEach((k) => {
    const host = document.getElementById('u8l1-m-g1' + k); if (!host) return;
    const d = EX1[k];
    const G = new Graph(host, { width: 290, height: 376, xmin: -6.5, xmax: 6.5, ymin: -8.5, ymax: 8.5, xlabels: 2, ylabels: 2, fontSize: 15 });
    const ans = [];
    d.lines.forEach((L) => {
      ans.push(G.line({ m: L.m, b: L.b }, { color: L.color, width: L.dash ? 3.5 : 4, dash: L.dash ? '11 9' : null }));
      ans.push(G.label(L.lab[0], L.lab[1], T(L.color === BL ? c1(L.lab[3]) : c2(L.lab[3])), { cls: 'bk-ptlab u8l1-m-glab', pos: L.lab[2] }));
    });
    if (d.pt) ans.push(G.point(d.pt[0], d.pt[1], { color: PU, r: 7, label: T(cP(`(${d.pt[0]},\\ ${d.pt[1]})`)), pos: 'se' }));
    const part = host.closest('.part');
    const sync = () => { const on = part.classList.contains('shown'); ans.forEach((e) => { e.style.display = on ? '' : 'none'; if (e.label) e.label.style.display = on ? '' : 'none'; }); };
    new MutationObserver(sync).observe(part, { attributes: true, attributeFilter: ['class'] }); sync();
  });
}

/* =============================== dragLab: drag the point, ✓/✗ for each equation =============================== */
const DL = {
  s1: { label: 'Section 1: ' + T('x+2y=8,\\ 2x-y=1'), e1: STD(1, 2, 8, 'x+2y=8'), e2: STD(2, -1, 1, '2x-y=1'), win: { xmin: -2.5, xmax: 9.5, ymin: -2.5, ymax: 9.5 },
    start: [7, 6], tour: [[6, 1], [1, 1], [4, 2], [2, 3]], l1: [7.6, 0.25, 'n'], l2: [4.4, 7.8, 'e'] },
  ex1: { label: 'Example 1 check', e1: YF(1, 5, 'y=x+5'), e2: YF(-2, -1, 'y=-2x-1'), win: { xmin: -6.5, xmax: 5.5, ymin: -5.5, ymax: 6.5 },
    start: [3, 3], tour: [[-1, 4], [0, -1], [-3, 2], [-2, 3]], l1: [0.3, 5.2, 'e'], l2: [1.2, -3.4, 'e'] },
  ex2: { label: 'Example 2 check', e1: STD(1, -1, 2, 'x-y=2'), e2: STD(3, 1, -10, '3x+y=-10'), win: { xmin: -7.5, xmax: 7.5, ymin: -7.5, ymax: 7.5 },
    start: [3, 4], tour: [[4, 2], [-4, 2], [0, -2], [-2, -4]], l1: [5, 3, 'w'], l2: [-5, 6, 'e'] },
  ex3: { label: 'Example 3 check', e1: STD(2, 1, 9, '2x+y=9'), e2: STD(1, 3, 7, 'x+3y=7'), win: { xmin: 0, xmax: 10.5, ymin: 0, ymax: 10.5, origin: true },
    start: [7, 7], tour: [[2, 5], [1, 2], [3, 3], [4, 1]], l1: [2.4, 7, 'e'], l2: [6.6, 0.9, 'n'],
    ctx: (x, y, a, b) => ` (adult $${x}, child $${y}: ${a && b ? 'fits <b>both</b> families' : a ? 'fits the Alvarez family only' : b ? 'fits the Bennett family only' : 'fits neither family'})` }
};
const dragLab = {
  title: 'Drag the point: ✓ or ✗ for each equation',
  height: 480,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 's1', label: DL.s1.label }, { sep: 'Check' }, { v: 'ex1', label: DL.ex1.label }, { v: 'ex2', label: DL.ex2.label }, { v: 'ex3', label: DL.ex3.label }],
  intro: (k) => `Drag the point anywhere on the grid, or press <b>Next</b> for a tour. ${T(k1(DL[k].e1.tex))} and ${T(k2(DL[k].e2.tex))}: which points check in <b>both</b>?`,
  make(stage, k, ex) {
    const d = DL[k], w = d.win;
    const G = new Graph(stage, Object.assign({ x: 12, y: 14, width: 452, height: 452 }, w));
    G.el.classList.add('u8l1-drag'); G.el.setAttribute('data-tap', '');
    eqLine(G, d.e1, { color: BLUE, width: 4 }); eqLine(G, d.e2, { color: AMB, width: 4 });
    G.label(d.l1[0], d.l1[1], T(d.e1.tex), { pos: d.l1[2], cls: 'bk-ptlab', color: BLUE });
    G.label(d.l2[0], d.l2[1], T(d.e2.tex), { pos: d.l2[2], cls: 'bk-ptlab', color: AMB });
    const P = panel(stage, 486, 14, ex.W - 500, 452, 'Is the point on each line?', 'u8l1-dp');
    const ro = line(P, '', 'u8l1-dro');
    const rows = [d.e1, d.e2].map((eq, i) => {
      const r = h('div', 'u8l1-drow ' + (i ? 'u8l1-drow2' : 'u8l1-drow1'), `<div class="u8l1-dh">${T(eq.tex)}</div><div class="u8l1-dsub"></div><div class="u8l1-dmk"></div>`);
      P.appendChild(r); return { r, sub: r.querySelector('.u8l1-dsub'), mk: r.querySelector('.u8l1-dmk'), eq };
    });
    const verdict = line(P, '', 'u8l1-dverd');
    const halo = svgEl('circle', { class: 'u8l1-halo', r: 17 }, G.layers.top);
    const dot = G.point(d.start[0], d.start[1], { color: INK, r: 10, cls: 'u8l1-dragpt' });
    G.track(halo, () => { const [px, py] = G.toPx(dot.gx, dot.gy); halo.setAttribute('cx', px); halo.setAttribute('cy', py); });
    const state = (x, y) => { const a = chk(d.e1, x, y), b = chk(d.e2, x, y); return { a, b }; };
    const upd = () => {
      const x = dot.gx, y = dot.gy, { a, b } = state(x, y);
      ro.innerHTML = `${T(pt(x, y))}`; halo._bkDraw();
      [a, b].forEach((r, i) => { rows[i].sub.innerHTML = T(r.tex); rows[i].mk.innerHTML = mark(r.ok); rows[i].r.classList.toggle('u8l1-good', r.ok); rows[i].r.classList.toggle('u8l1-bad', !r.ok); });
      const col = a.ok && b.ok ? PUR : a.ok ? BLUE : b.ok ? AMB : INK;
      dot.querySelector('circle').setAttribute('fill', col); halo.setAttribute('stroke', col); halo.style.opacity = a.ok && b.ok ? 1 : 0;
      verdict.className = 'u8l1-line u8l1-dverd ' + (a.ok && b.ok ? 'u8l1-win' : '');
      verdict.innerHTML = a.ok && b.ok ? '✓ ✓ On <b>both</b> lines: the solution!' : a.ok || b.ok ? 'On one line only: <b>not</b> a solution of the system' : 'On neither line';
      if (d.ctx) verdict.innerHTML += `<div class="u8l1-dctx">adult $${x}, child $${y}</div>`;
    };
    upd();
    // dragging (finger and Pencil): snap to whole numbers inside the window
    const lo = [Math.ceil(w.xmin), Math.ceil(w.ymin)], hi = [Math.floor(w.xmax), Math.floor(w.ymax)];
    const snapTo = (e) => { const [x, y] = G.fromEvent(e); return [Math.max(lo[0], Math.min(hi[0], Math.round(x))), Math.max(lo[1], Math.min(hi[1], Math.round(y)))]; };
    let drag = false;
    const go = (e) => { const [x, y] = snapTo(e); if (x !== dot.gx || y !== dot.gy) { G.moveTo(dot, x, y); upd(); } };
    G.svg.addEventListener('pointerdown', (e) => { if (e.button > 0) return; e.preventDefault(); drag = true; try { G.svg.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } go(e); });
    G.svg.addEventListener('pointermove', (e) => { if (drag) go(e); });
    const up = () => { drag = false; }; G.svg.addEventListener('pointerup', up); G.svg.addEventListener('pointercancel', up);
    const capFor = (x, y) => {
      const { a, b } = state(x, y), p = T(pt(x, y));
      const s = a.ok && b.ok ? `${p}: ✓ for ${T(k1(d.e1.tex))} <b>and</b> ✓ for ${T(k2(d.e2.tex))}. On <b>both</b> lines: the <b>solution</b> of the system.`
        : a.ok ? `${p}: ✓ for ${T(k1(d.e1.tex))}, but ✗ for ${T(k2(d.e2.tex))}. On the blue line only.`
          : b.ok ? `${p}: ✗ for ${T(k1(d.e1.tex))}, but ✓ for ${T(k2(d.e2.tex))}. On the amber line only.`
            : `${p}: ✗ and ✗. On neither line.`;
      return s + (d.ctx ? d.ctx(x, y, a.ok, b.ok) : '');
    };
    const steps = d.tour.map(([x, y]) => ({ cap: capFor(x, y), run: async (c) => { await G.move(c, dot, x, y, 700); upd(); await pulse(c, P, 1.015); } }));
    steps.push({ cap: `Your turn: drag the point anywhere. <b>Only one point</b> gets ✓ ✓: the point of intersection.`, run: (c) => pulse(c, dot, 1.5) });
    return steps;
  }
};

/* =============================== readGraph: Example 1 =============================== */
const E1 = { e1: YF(1, 5, 'y=x+5'), e2: YF(-2, -1, 'y=-2x-1'), sol: [-2, 3] };
const readGraph = {
  title: 'Read the crossing point, then verify it',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ex1', label: 'Example 1 check' }, { v: 'swap', label: 'The slip: ' + T('(3,\\ -2)') + '?' }],
  intro: (k) => (k === 'ex1' ? `${T(k1('y=x+5'))} and ${T(k2('y=-2x-1'))}. Where do they cross? Press <b>Next</b>.`
    : `Someone wrote the answer as ${T('(3,\\ -2)')}. Is that the solution? Press <b>Next</b>.`),
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 14, y: 14, width: 442, height: 442, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5 });
    eqLine(G, E1.e1, { color: BLUE, width: 4 }); eqLine(G, E1.e2, { color: AMB, width: 4 });
    G.label(0.3, 4.6, T('y=x+5'), { pos: 'e', cls: 'bk-ptlab', color: BLUE }); G.label(1.1, -3.6, T('y=-2x-1'), { pos: 'e', cls: 'bk-ptlab', color: AMB });
    const P = panel(stage, 486, 14, ex.W - 500, 442, k === 'ex1' ? 'Read it' : 'Check the swapped pair');
    const [sx, sy] = E1.sol;
    if (k === 'ex1') {
      let S, big;
      return [
        { cap: `The lines cross <b>here</b>.`, run: async (c) => { S = G.point(sx, sy, { color: PUR, r: 9 }); await G.reveal(S, c); await pulse(c, S, 1.5); } },
        { cap: `Straight down to the ${T('x')}-axis: ${T('x=-2')}.`, run: async (c) => {
          await G.drawIn(G.segment([sx, sy], [sx, 0], { color: PUR, width: 3, dash: true }), 500, c);
          await fadeIn(c, G.label(sx, 0, T('-2'), { pos: 's', cls: 'bk-ptlab u8l1-axlab', color: PUR, gap: 4 })); await say(c, P, `${T('x=-2')} <span class="u8l1-sm">(2 left)</span>`, 'u8l1-big');
        } },
        { cap: `Straight across to the ${T('y')}-axis: ${T('y=3')}.`, run: async (c) => {
          await G.drawIn(G.segment([sx, sy], [0, sy], { color: PUR, width: 3, dash: true }), 500, c);
          await fadeIn(c, G.label(0, sy, T('3'), { pos: 'e', cls: 'bk-ptlab u8l1-axlab', color: PUR, gap: 4 })); await say(c, P, `${T('y=3')} <span class="u8l1-sm">(3 up)</span>`, 'u8l1-big');
        } },
        { cap: `Write it as an ordered pair, <b>${T('x')} first</b>: ${T('(-2,\\ 3)')}.`, run: async (c) => { big = await say(c, P, T(kp('(-2,\\ 3)')), 'u8l1-huge'); S.label = G.label(sx, sy, T('(-2,\\ 3)'), { pos: 'nw', cls: 'bk-ptlab', color: PUR }); await fadeIn(c, S.label); void big; } },
        { cap: `Verify in ${T(k1('y=x+5'))}: ${T('3=-2+5')} ✓`, run: (c) => show(c, checkRow(P, E1.e1, sx, sy, BLUE)) },
        { cap: `Verify in ${T(k2('y=-2x-1'))}: ${T('3=-2(-2)-1=4-1')} ✓. On <b>both</b> lines, so ${T('(-2,\\ 3)')} is the solution.`,
          run: async (c) => { await show(c, checkRow(P, E1.e2, sx, sy, AMB)); const s = stamp(P, 'Solution (−2, 3)', { ok: true }); s.classList.add('u8l1-pstamp'); await stampIn(c, s); } }
      ];
    }
    let Q;
    return [
      { cap: `A common slip: the coordinates swapped. Plot ${T('(3,\\ -2)')}: 3 right, 2 down.`, run: async (c) => { Q = G.point(3, -2, { color: INK, r: 9, label: T('(3,\\ -2)'), pos: 'se' }); await G.reveal(Q, c); } },
      { cap: `Check in ${T(k1('y=x+5'))}: ${T('-2\\neq 3+5')}. ✗`, run: (c) => show(c, checkRow(P, E1.e1, 3, -2, BLUE)) },
      { cap: `Check in ${T(k2('y=-2x-1'))}: ${T('-2\\neq -2(3)-1')}. ✗ It is on <b>neither</b> line.`, run: async (c) => { await show(c, checkRow(P, E1.e2, 3, -2, AMB)); const s = stamp(P, 'Not a solution', { ok: false }); s.classList.add('u8l1-pstamp'); await stampIn(c, s); } },
      { cap: `Swap back, ${T('x')} first: ${T('(-2,\\ 3)')} is where the lines cross. ✓ ✓`, run: async (c) => {
        Q.label.innerHTML = T('(-2,\\ 3)'); P.querySelectorAll('.u8l1-ck, .bk-stamp').forEach((e) => e.remove()); await G.move(c, Q, sx, sy, 900); Q.querySelector('circle').setAttribute('fill', PUR); Q.label.style.color = PUR;
        await show(c, line(P, `<b>${T('(-2,\\ 3)')}</b>`, 'u8l1-big')); await show(c, checkRow(P, E1.e1, sx, sy, BLUE)); await show(c, checkRow(P, E1.e2, sx, sy, AMB));
      } }
    ];
  }
};

/* =============================== sameY: the shortcut =============================== */
const SY = {
  bk: { label: T('y=x+1,\\ y=-2x+7'), f1: (x) => x + 1, f2: (x) => -2 * x + 7, t1: 'x+1', t2: '-2x+7', n1: 'y', n2: 'y', v: 'x', x0: 0, xs: 2, ys: 3,
    win: { xmin: -1.5, xmax: 5.5, ymin: -3.5, ymax: 9.5 }, alg: ['3x=6', 'x=2'], back: 'y=2+1=3', sol: '(2,\\ 3)', d: 1 },
  race: { label: 'Warm-up Race 1: ' + T('30+4t=6t'), f1: (x) => 30 + 4 * x, f2: (x) => 6 * x, t1: '30+4t', t2: '6t', n1: 'd', n2: 'd', v: 't', x0: 0, xs: 15, ys: 90,
    win: { xmin: 0, xmax: 21, ymin: 0, ymax: 130, xstep: 1, ystep: 10, xlabels: 5, ylabels: 20, origin: true, xtitle: 't', ytitle: 'd' }, alg: ['30=2t', 't=15'], back: 'd=6(15)=90', sol: '(15,\\ 90)', d: 0,
    say: 'after <b>15 s</b> Max draws level with Rosa, <b>90 m</b> from the start' },
  ex4: { label: 'Example 4 (b) check', f1: (x) => 450 + 3 * x, f2: (x) => 9 * x, t1: '450+3n', t2: '9n', n1: 'C', n2: 'R', v: 'n', x0: 0, xs: 75, ys: 675,
    win: { xmin: 0, xmax: 125, ymin: 0, ymax: 1260, xstep: 10, ystep: 100, xlabels: 20, ylabels: 200, origin: true, xtitle: 'n', ytitle: '\\text{dollars}', pad: [18, 18, 34, 52] },
    alg: ['450=6n', 'n=75'], back: 'R=9(75)=675', sol: '(75,\\ 675)', d: 0, say: '<b>75 mugs</b> break even at <b>$675</b>', form: 'dollars' }
};
const sameY = {
  title: 'Same y at the crossing: set the expressions equal',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'bk', label: SY.bk.label }, { v: 'race', label: SY.race.label }, { v: 'ex4', label: SY.ex4.label }],
  intro: (k) => `${T(k1(SY[k].n1 + '=' + SY[k].t1))} and ${T(k2(SY[k].n2 + '=' + SY[k].t2))}. Both are in the form "${SY[k].form || T(SY[k].n1)} = …". Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SY[k], v = d.v, st = { x: d.x0 };
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 442, height: 442 }, d.win));
    G.fn(d.f1, { color: BLUE, width: 4 }); G.fn(d.f2, { color: AMB, width: 4 });
    const P = panel(stage, 486, 14, ex.W - 500, 442, `At ${T(v)} = …`);
    const sw = G.vline(d.x0, { color: COLORS.slate, width: 2.5 });
    const gap = G.curve(() => { const a = G.toPx(st.x, d.f1(st.x)), b = G.toPx(st.x, d.f2(st.x)); return { subs: [[a, b]] }; }, { color: PUR, width: 7, cap: 'butt' }, 'u8l1-gap', G.layers.data);
    const D1 = G.point(d.x0, d.f1(d.x0), { color: BLUE, r: 7.5 }), D2 = G.point(d.x0, d.f2(d.x0), { color: AMB, r: 7.5 });
    const glab = G.label(d.x0, (d.f1(d.x0) + d.f2(d.x0)) / 2, '', { pos: 'e', cls: 'u8l1-gaplab', gap: 10 });
    [sw, gap, D1, D2, glab].forEach((e) => (e.style.opacity = 0));
    const xr = line(P, '', 'u8l1-xr');
    const r1 = line(P, `${T(k1(d.n1 + '=' + d.t1))} <span class="u8l1-eqv">=</span> <b class="u8l1-v1"></b>`, 'u8l1-yrow');
    const r2 = line(P, `${T(k2(d.n2 + '=' + d.t2))} <span class="u8l1-eqv">=</span> <b class="u8l1-v2"></b>`, 'u8l1-yrow');
    const v1 = r1.querySelector('.u8l1-v1'), v2 = r2.querySelector('.u8l1-v2');
    [xr, r1, r2].forEach((e) => (e.style.opacity = 0));
    const set = (x) => {
      st.x = x; sw.set(x); G.moveTo(D1, x, d.f1(x)); G.moveTo(D2, x, d.f2(x)); gap._bkDraw();
      const a = d.f1(x), b = d.f2(x), g = Math.abs(a - b);
      v1.textContent = num(a, d.d); v2.textContent = num(b, d.d); xr.innerHTML = `<i>${v}</i> = <b>${num(x, d.d)}</b>`;
      glab.gx = x; glab.gy = (a + b) / 2; glab._bkDraw(); glab.textContent = g < 1e-9 ? '' : 'gap ' + num(g, d.d);
    };
    set(d.x0);
    const g0 = Math.abs(d.f1(d.x0) - d.f2(d.x0));
    let S;
    return [
      { cap: `Each line gives a value for every ${T(v)}. At ${T(v + '=' + d.x0)}: blue ${T(texNum(d.f1(d.x0)))}, amber ${T(texNum(d.f2(d.x0)))}, a gap of ${T(texNum(g0))}.`,
        run: async (c) => { for (const e of [sw, D1, D2, gap, glab, xr, r1, r2]) await fadeIn(c, e, 220); } },
      { cap: `Slide ${T(v)} to the right: the gap <b>closes</b>.`, run: (c) => tween(c, 2400, (t) => set(d.x0 + (d.xs - d.x0) * t)) },
      { cap: `At ${T(v + '=' + d.xs)} both give ${T(texNum(d.ys))}: the <b>same</b> value, so this is where the lines <b>cross</b>.`,
        run: async (c) => { set(d.xs); S = G.point(d.xs, d.ys, { color: PUR, r: 9 }); await G.reveal(S, c); await pulse(c, S, 1.5); r1.classList.add('u8l1-hl'); r2.classList.add('u8l1-hl'); } },
      { cap: `So set the two expressions <b>equal</b>: ${T(k1(d.t1) + '=' + k2(d.t2))}.`, run: (c) => say(c, P, T(k1(d.t1) + '=' + k2(d.t2)), 'u8l1-big u8l1-alg') },
      { cap: `Solve: ${T(d.alg.join('\\ \\Rightarrow\\ '))}.`, run: async (c) => { for (const s of d.alg) await say(c, P, T(s), 'u8l1-alg'); } },
      { cap: `Substitute back: ${T(d.back)}. The solution is ${T(d.sol)}${d.say ? ': ' + d.say : ''}.`,
        run: async (c) => { await say(c, P, T(d.back), 'u8l1-alg'); S.label = G.label(d.xs, d.ys, T(d.sol), { pos: 'ne', cls: 'bk-ptlab', color: PUR }); await fadeIn(c, S.label); const s = stamp(P, d.sol.replace('\\ ', ' ').replace(/-/g, '−'), { ok: true }); s.classList.add('u8l1-pstamp'); await stampIn(c, s); } }
    ];
  }
};

/* =============================== byHand: Example 2 =============================== */
const E2 = { e1: STD(1, -1, 2, 'x-y=2'), e2: STD(3, 1, -10, '3x+y=-10'), sol: [-2, -4], xs: [-4, -3, -2, -1] };
const byHand = {
  title: 'Example 2 check: graph both, read, verify',
  height: 480,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'si', label: 'Slope and ' + T('y') + '-intercept' }, { v: 'tv', label: 'Tables of values' }],
  intro: (k) => `${T(k1('x-y=2'))} and ${T(k2('3x+y=-10'))}, by ${k === 'si' ? 'slope and intercept' : 'tables of values'}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 14, y: 18, width: 442, height: 442, xmin: -7.5, xmax: 7.5, ymin: -7.5, ymax: 7.5, xlabels: 2, ylabels: 2 });
    const x0 = 486, W = ex.W - x0 - 14, [sx, sy] = E2.sol;
    const f1 = E2.e1.f, f2 = E2.e2.f;
    const drawL = async (c, eq, col, lab) => { const L = eqLine(G, eq, { color: col, width: 4 }); G.layers.data.insertBefore(L, G.layers.data.firstChild); await G.drawIn(L, 800, c); await fadeIn(c, G.label(lab[0], lab[1], T(lab[3]), { pos: lab[2], cls: 'bk-ptlab', color: col })); };
    const LAB1 = [4.6, 3, 'w', 'y=x-2'], LAB2 = [-4.6, 6.6, 'e', 'y=-3x-10'];
    const verify = async (c, P, st = true) => {
      await show(c, checkRow(P, E2.e1, sx, sy, BLUE)); await show(c, checkRow(P, E2.e2, sx, sy, AMB)); if (!st) return;
      const s = stamp(P, 'Solution (−2, −4)', { ok: true }); s.classList.add('u8l1-pstamp'); await stampIn(c, s);
    };
    const cross = async (c) => { const S = G.point(sx, sy, { color: PUR, r: 9, label: T(pt(sx, sy)), pos: 'se', labelColor: PUR }); await G.reveal(S, c); await pulse(c, S, 1.5); };
    if (k === 'si') {
      const P = panel(stage, x0, 14, W, 452, 'Rearrange, graph, check');
      const pts = async (c, ps, col) => { for (const p of ps) await pop(c, G.point(p[0], p[1], { color: col, r: 7 }), 220); };
      return [
        { cap: `Rearrange each equation for ${T('y')}.`, run: async (c) => { await say(c, P, T(k1('x-y=2\\Rightarrow y=x-2'))); await say(c, P, T(k2('3x+y=-10\\Rightarrow y=-3x-10'))); } },
        { cap: `Blue: start at ${T('(0,\\ -2)')}, then up 1, right 1: ${T('(1,\\ -1)')}, ${T('(2,\\ 0)')}.`, run: async (c) => { await pts(c, [[0, -2], [1, -1], [2, 0]], BLUE); await drawL(c, E2.e1, BLUE, LAB1); } },
        { cap: `Amber: ${T('b=-10')} is off the grid. ${T('x=-4')} gives ${T('y=2')}: start at ${T('(-4,\\ 2)')}, then down 3, right 1.`, run: async (c) => { await pts(c, [[-4, 2], [-3, -1], [-2, -4]], AMB); await drawL(c, E2.e2, AMB, LAB2); } },
        { cap: `The lines cross at ${T('(-2,\\ -4)')}.`, run: async (c) => { await cross(c); await say(c, P, `Crossing: ${T(kp('(-2,\\ -4)'))}`, 'u8l1-big'); } },
        { cap: `Verify in <b>both original</b> equations: ✓ and ✓. The solution is ${T('x=-2,\\ y=-4')}.`, run: (c) => verify(c, P) }
      ];
    }
    // tables of values
    const cw = 62, tw = cw * 2, gx = (W - 2 * tw) / 3;
    const hd1 = add(stage, h('div', 'u8l1-thd', T(k1('y=x-2'))), x0, 10), hd2 = add(stage, h('div', 'u8l1-thd', T(k2('y=-3x-10'))), x0 + W / 2, 10);
    hd1.style.width = hd2.style.width = W / 2 + 'px';
    const tb1 = new ValueTable(stage, { x: x0 + gx, y: 46, headers: ['x', 'y'], rows: E2.xs.map((x) => [x, f1(x)]), hide: 1, tap: false, cellW: cw, cellH: 38, cls: 'u8l1-vt u8l1-vt1' });
    const tb2 = new ValueTable(stage, { x: x0 + 2 * gx + tw, y: 46, headers: ['x', 'y'], rows: E2.xs.map((x) => [x, f2(x)]), hide: 1, tap: false, cellW: cw, cellH: 38, cls: 'u8l1-vt u8l1-vt2' });
    const P = panel(stage, x0, 250, W, 216, 'Check in both');
    const fillPlot = async (c, tb, f, col) => { for (let i = 0; i < E2.xs.length; i++) { await tb.reveal(i, 1, c); await pop(c, G.point(E2.xs[i], f(E2.xs[i]), { color: col, r: 7 }), 200); } };
    return [
      { cap: `Rearrange: ${T(k1('y=x-2'))} and ${T(k2('y=-3x-10'))}. Pick the same ${T('x')}-values for both tables: ${T('-4,\\ -3,\\ -2,\\ -1')}.`, run: async (c) => { await pulse(c, tb1.el, 1.04); await pulse(c, tb2.el, 1.04); } },
      { cap: `Blue: ${T('y=x-2')} gives ${T('-6,\\ -5,\\ -4,\\ -3')}. Plot and join.`, run: async (c) => { await fillPlot(c, tb1, f1, BLUE); await drawL(c, E2.e1, BLUE, LAB1); } },
      { cap: `Amber: ${T('y=-3x-10')} gives ${T('2,\\ -1,\\ -4,\\ -7')}. Plot and join.`, run: async (c) => { await fillPlot(c, tb2, f2, AMB); await drawL(c, E2.e2, AMB, LAB2); } },
      { cap: `The row ${T('x=-2')} gives ${T('y=-4')} in <b>both</b> tables: the same point is on both lines.`, run: async (c) => { tb1.highlight(2, true, 'u8l1-hlp'); tb2.highlight(2, true, 'u8l1-hlp'); await cross(c); } },
      { cap: `Verify ${T('(-2,\\ -4)')} in <b>both original</b> equations: ✓ and ✓.`, run: (c) => verify(c, P, false) }
    ];
  }
};

/* =============================== tickets: Example 3 =============================== */
const E3 = { e1: STD(2, 1, 9, '2x+y=9'), e2: STD(1, 3, 7, 'x+3y=7') };
const tickets = {
  title: 'Example 3 check: two families, two ticket prices',
  height: 480,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  intro: `Two unknowns: ${T('x')} = adult fee, ${T('y')} = child fee (dollars). Two conditions: one for each family. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 14, y: 14, width: 452, height: 452, xmin: 0, xmax: 10.5, ymin: 0, ymax: 10.5, xlabels: 2, ylabels: 2, origin: true });
    const P = panel(stage, 494, 14, ex.W - 508, 452, 'The story');
    const fam = (name, a, ch, cost, eq, col) => {
      const r = h('div', 'u8l1-fam', `<div class="u8l1-fn" style="color:${col}">${name}</div><div class="u8l1-tix"></div><div class="u8l1-feq"></div>`);
      const tx = r.querySelector('.u8l1-tix');
      const tk = []; for (let i = 0; i < a; i++) tk.push(add(tx, h('div', 'u8l1-tk u8l1-tka', `<small>adult</small><b>${T('x')}</b>`)));
      for (let i = 0; i < ch; i++) tk.push(add(tx, h('div', 'u8l1-tk u8l1-tkc', `<small>child</small><b>${T('y')}</b>`)));
      add(tx, h('div', 'u8l1-tsum', `= $${cost}`));
      r.querySelector('.u8l1-feq').innerHTML = T((col === AMB ? k2 : k1)(eq)); r.style.opacity = 0; P.appendChild(r);
      return { r, tk, a, ch, sum: tx.querySelector('.u8l1-tsum'), eq: r.querySelector('.u8l1-feq') };
    };
    const A = fam('Alvarez', 2, 1, 9, '2x+y=9', BLUE), B = fam('Bennett', 1, 3, 7, 'x+3y=7', AMB);
    const famIn = async (c, F) => { F.r.style.opacity = 1; for (const t of F.tk) await pop(c, t, 220); await fadeIn(c, F.sum); await fadeIn(c, F.eq); };
    const pts = async (c, ps, col) => { for (const p of ps) await G.reveal(G.point(p[0], p[1], { color: col, r: 7, label: T(pt(...p)), pos: p[1] === 0 ? (p[0] < 5 ? 'e' : 'ne') : 'ne' }), c, 260); };
    const meaning = line(P, '', 'u8l1-big u8l1-mean'); meaning.style.opacity = 0;
    let S;
    return [
      { cap: `Alvarez: 2 adult tickets and 1 child ticket cost $9, so ${T(k1('2x+y=9'))}.`, run: (c) => famIn(c, A) },
      { cap: `Bennett: 1 adult ticket and 3 child tickets cost $7, so ${T(k2('x+3y=7'))}.`, run: (c) => famIn(c, B) },
      { cap: `Graph ${T(k1('2x+y=9'))} from its intercepts: ${T('(0,\\ 9)')} and ${T('(4.5,\\ 0)')}.`, run: async (c) => {
        await pts(c, [[0, 9], [4.5, 0]], BLUE); await G.drawIn(G.segment([0, 9], [4.5, 0], { color: BLUE, width: 4 }), 700, c);
        await fadeIn(c, G.label(2.3, 7.3, T('2x+y=9'), { pos: 'e', cls: 'bk-ptlab', color: BLUE }));
      } },
      { cap: `Graph ${T(k2('x+3y=7'))}: ${T('x=7')} gives ${T('y=0')}, and ${T('x=1')} gives ${T('y=2')}. Plot ${T('(7,\\ 0)')} and ${T('(1,\\ 2)')}.`, run: async (c) => {
        await pts(c, [[7, 0], [1, 2]], AMB); await G.drawIn(G.segment([0, 7 / 3], [7, 0], { color: AMB, width: 4 }), 700, c);
        await fadeIn(c, G.label(6.2, 1.6, T('x+3y=7'), { pos: 'e', cls: 'bk-ptlab', color: AMB }));
      } },
      { cap: `The lines cross at ${T('(4,\\ 1)')}: the one price pair that fits <b>both</b> families.`, run: async (c) => {
        S = G.point(4, 1, { color: PUR, r: 9 }); await G.reveal(S, c); await pulse(c, S, 1.5);
        await G.drawIn(G.segment([4, 1], [4, 0], { color: PUR, width: 3, dash: true }), 300, c); await G.drawIn(G.segment([4, 1], [0, 1], { color: PUR, width: 3, dash: true }), 300, c);
        await fadeIn(c, G.label(4, 1, T('(4,\\ 1)'), { pos: 'ne', cls: 'bk-ptlab', color: PUR, gap: 10 }));
      } },
      { cap: `${T('x=4')} and ${T('y=1')}: an adult ticket costs <b>$4</b> and a child ticket <b>$1</b>. Check: ${T('2(4)+1=9')} ✓ and ${T('4+3(1)=7')} ✓.`, run: async (c) => {
        for (const F of [A, B]) { F.tk.forEach((t, i) => { t.querySelector('b').innerHTML = i < F.a ? '$4' : '$1'; t.classList.add('u8l1-paid'); }); F.sum.innerHTML += ' ✓'; await pulse(c, F.r, 1.03); }
        meaning.innerHTML = `Adult <b>$4</b>, child <b>$1</b>`; await show(c, meaning);
      } }
    ];
  }
};

/* =============================== breakEven: Example 4 =============================== */
const C5 = (n) => 450 + 3 * n, R5 = (n) => 9 * n;
const BEW = { xmin: 0, xmax: 125, ymin: 0, ymax: 1260, xstep: 10, ystep: 100, xlabels: 20, ylabels: 200, origin: true, xtitle: 'n', ytitle: '\\text{dollars}', fontSize: 16, pad: [18, 22, 34, 54] };
const breakEven = {
  title: 'Example 4 check: cost, revenue and the gap between them',
  height: 480,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'bd', label: '(b) and (d) break-even' }, { v: 'c', label: '(c) 30 and 90 mugs' }],
  intro: `Cost ${T(k1('C=450+3n'))} and revenue ${T(k2('R=9n'))}, in dollars, for ${T('n')} mugs. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 500, height: 452 }, BEW));
    const P = panel(stage, 534, 14, ex.W - 548, 452, k === 'bd' ? 'Profit or loss?' : 'Profit = revenue − cost');
    const st = { n: 0 };
    const vl = G.vline(0, { color: COLORS.slate, width: 2.5 });
    const gap = G.curve(() => { const a = G.toPx(st.n, C5(st.n)), b = G.toPx(st.n, R5(st.n)); return { subs: [[a, b]] }; }, { color: RED, width: 8, cap: 'butt' }, 'u8l1-gap', G.layers.data);
    const Dc = G.point(0, C5(0), { color: BLUE, r: 7.5 }), Dr = G.point(0, R5(0), { color: AMB, r: 7.5 });
    const glab = G.label(0, 0, '', { pos: 'e', cls: 'u8l1-gaplab', gap: 10 });
    const live = [vl, gap, Dc, Dr, glab]; live.forEach((e) => (e.style.opacity = 0));
    const setN = (n) => {
      st.n = n; vl.set(n); G.moveTo(Dc, n, C5(n)); G.moveTo(Dr, n, R5(n)); gap._bkDraw();
      const p = R5(n) - C5(n), col = p > 1e-9 ? GRN : RED; gap.style.color = col; gap.path.setAttribute('stroke', col);
      glab.gx = n; glab.gy = (C5(n) + R5(n)) / 2; glab._bkDraw(); glab.style.color = col;
      glab.textContent = Math.abs(p) < 1e-9 ? '' : (p > 0 ? 'profit $' : 'loss $') + num(Math.abs(Math.round(p)), 0);
    };
    const lines = async (c) => {
      await G.drawIn(G.line([0, 450], [100, 750], { color: BLUE, width: 4 }), 700, c); await fadeIn(c, G.label(20, 525, T('C=450+3n'), { pos: 'ne', cls: 'bk-ptlab', color: BLUE, gap: 4 }));
    };
    const rev = async (c) => { await G.drawIn(G.line([0, 0], [100, 900], { color: AMB, width: 4 }), 700, c); await fadeIn(c, G.label(104, 936, T('R=9n'), { pos: 'w', cls: 'bk-ptlab', color: AMB, gap: 12 })); };
    const at = async (c, n, show2 = true) => {
      if (live[0].style.opacity === '0') { setN(n); for (const e of live) await fadeIn(c, e, 200); } else await tween(c, 900, (t) => setN(st.n + (n - st.n) * t));
      setN(n);
      if (show2) {
        await say(c, P, `${T('n=' + n)}: cost ${T(k1(`450+3(${n})=${C5(n)}`))}`, 'u8l1-sm2');
        await say(c, P, `revenue ${T(k2(`9(${n})=${R5(n)}`))}`, 'u8l1-sm2');
      }
    };
    const verdict = async (c, n) => {
      const p = R5(n) - C5(n);
      await say(c, P, `${T(`${R5(n)}-${C5(n)}=${p}`)}: a <b class="${p > 0 ? 'u8l1-okc' : 'u8l1-noc'}">${p > 0 ? 'profit' : 'loss'} of $${Math.abs(p)}</b>`, 'u8l1-big2');
    };
    const base = [
      { cap: `Cost ${T(k1('C=450+3n'))} starts at <b>$450</b> (the setup cost) and rises $3 a mug.`, run: lines },
      { cap: `Revenue ${T(k2('R=9n'))} starts at <b>$0</b> and rises $9 a mug.`, run: rev }
    ];
    if (k === 'c') return base.concat([
      { cap: `${T('n=30')}: cost ${T('450+3(30)=540')}, revenue ${T('9(30)=270')}.`, run: (c) => at(c, 30) },
      { cap: `Cost is on top: ${T('270-540=-270')}, a <b>loss of $270</b>.`, run: (c) => verdict(c, 30) },
      { cap: `${T('n=90')}: cost ${T('450+3(90)=720')}, revenue ${T('9(90)=810')}.`, run: (c) => at(c, 90) },
      { cap: `Revenue is on top: ${T('810-720=90')}, a <b>profit of $90</b>.`, run: (c) => verdict(c, 90) }
    ]);
    let S;
    return base.concat([
      { cap: `Slide ${T('n')} up from 0: the cost line is on top (a <b>loss</b>), and the gap shrinks.`, run: async (c) => { await at(c, 0, false); await tween(c, 2600, (t) => setN(70 * t)); } },
      { cap: `At ${T('n=75')} the gap is 0: cost = revenue = $675. The <b>break-even point</b> is ${T('(75,\\ 675)')}.`, run: async (c) => {
        await tween(c, 500, (t) => setN(70 + 5 * t)); setN(75);
        S = G.point(75, 675, { color: PUR, r: 9, label: T('(75,\\ 675)'), pos: 'nw', labelColor: PUR }); await G.reveal(S, c); await pulse(c, S, 1.5);
        await say(c, P, `break-even ${T(kp('(75,\\ 675)'))}`, 'u8l1-big2');
      } },
      { cap: `Algebra agrees: ${T('450+3n=9n\\Rightarrow 450=6n\\Rightarrow n=75')}.`, run: async (c) => { await say(c, P, T(k1('450+3n') + '=' + k2('9n')), 'u8l1-alg'); await say(c, P, T('450=6n'), 'u8l1-alg'); await say(c, P, T('n=75'), 'u8l1-alg'); } },
      { cap: `Left of 75 the cost line is higher: <b>loss</b>. Right of 75 the revenue line is higher: <b>profit</b> (shaded green).`, run: async (c) => {
        live.forEach((e) => (e.style.opacity = 0));
        const lo = G.polyline([[0, 450], [75, 675], [0, 0]], { closed: true, fill: 'gray', fillOpacity: 0.22, color: 'gray', width: 0.1 });
        const hi = G.polyline([[75, 675], [125, 1125], [125, 825]], { closed: true, fill: 'green', fillOpacity: 0.25, color: 'green', width: 0.1 });
        await fadeIn(c, lo, 500); await fadeIn(c, G.label(24, 380, 'loss', { cls: 'u8l1-rlab', color: 'slate' }));
        await fadeIn(c, hi, 500); await fadeIn(c, G.label(108, 920, 'profit', { cls: 'u8l1-rlab', color: 'green' }));
      } }
    ]);
  }
};

/* =============================== turnSlide (star): turn, then slide =============================== */
const M1 = 0.5, B1 = 1;
const FIRST = `Blue ${T(c1('y=0.5x+1'))} and amber ${T(c2('y=-x+4'))}: <b>different slopes</b>. They cross at exactly one point, ${T(cP('(2,\\ 2)'))}: <b>one solution</b>.`;
const TS = {
  turn: { label: 'Turn, then slide', st: { m: -1, b: 4 }, first: FIRST, moves: [
    { to: { m: 0 }, cap: `<b>Turn</b> the amber line about its ${T('y')}-intercept ${T('(0,\\ 4)')}. The crossing slides along the blue line to ${T(cP('(6,\\ 4)'))}. Still one solution.` },
    { to: { m: 0.4 }, cap: `Turn it closer to the blue slope. The closer the slopes, the <b>farther away</b> the crossing: now ${T(cP('(30,\\ 16)'))}, far off the grid. Still one solution.` },
    { to: { m: 0.5 }, cap: `<b>Equal slopes</b>: the lines are <b>parallel</b>. The crossing has run away for good: <b>no solution</b>.` },
    { to: { b: 2.5 }, cap: `Now <b>slide</b> the amber line down. Same slope, so it stays parallel: the gap shrinks but never closes. Still <b>no solution</b>.` },
    { to: { b: 1 }, cap: `Equal slopes <b>and</b> equal intercepts: it lands exactly <b>on top</b>. Every point of one line is on the other: <b>infinitely many solutions</b>.` }] },
  slide: { label: 'Slide a crossing line', st: { m: -1, b: 4 }, first: FIRST, moves: [
    { to: { b: 7 }, cap: `Slide the amber line <b>up</b>. The crossing moves to ${T(cP('(4,\\ 3)'))}, but there is still exactly <b>one</b>.` },
    { to: { b: 1 }, cap: `Slide it down to intercept 1, the <b>same intercept</b> as the blue line. They still cross once, on the ${T('y')}-axis at ${T(cP('(0,\\ 1)'))}.` },
    { to: { b: -2 }, cap: `Keep sliding: ${T(cP('(-2,\\ 0)'))}. Different slopes <b>always</b> cross exactly once, so for one solution the intercepts can be <b>any values</b>.` }] },
  spin: { label: 'Turn all the way round', st: { m: -1, b: 4 }, first: FIRST, moves: [
    { to: { m: 0.4 }, ms: 2600, cap: `Turn the amber line anticlockwise. As its slope nears ${T('0.5')}, the crossing races off to the right: ${T(cP('(30,\\ 16)'))}.` },
    { to: { m: 0.5 }, cap: `Slopes equal: parallel, <b>no solution</b>. This is the only position with no crossing.` },
    { to: { m: 0.6 }, cap: `Turn a little further and the crossing comes back, from the <b>far left</b>: ${T(cP('(-30,\\ -14)'))}.` },
    { to: { m: 2 }, cap: `…and swings in close: ${T(cP('(-2,\\ 0)'))}. One solution again. Only <b>equal slopes</b> stop two lines from crossing.` }] },
  free: { label: 'Free play', st: { m: -1, b: 4 }, free: true }
};
const miniSvg = (k) => ({
  one: '<line x1="10" y1="40" x2="70" y2="6" class="u8l1-m-sl1"/><line x1="10" y1="6" x2="70" y2="40" class="u8l1-m-sl2"/>',
  none: '<line x1="10" y1="42" x2="70" y2="18" class="u8l1-m-sl1"/><line x1="10" y1="28" x2="70" y2="4" class="u8l1-m-sl2"/>',
  inf: '<line x1="10" y1="40" x2="70" y2="6" class="u8l1-m-sl1 u8l1-m-fat"/><line x1="10" y1="40" x2="70" y2="6" class="u8l1-m-sl2 u8l1-m-dash"/>'
}[k]);
const turnSlide = {
  title: 'Turn one line, then slide it: how many solutions?',
  height: 480,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(TS).map((k) => ({ v: k, label: TS[k].label })),
  intro: (k) => (TS[k].free ? 'Your turn: turn and slide the amber line with the buttons. Press <b>Next</b> to start.' : 'Watch the count and the chart on the right while the amber line moves. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = TS[k], st = Object.assign({}, d.st), W = ex.W;
    const G = new Graph(stage, { x: 8, y: 10, width: 460, height: 460, xmin: -7, xmax: 7, ymin: -7, ymax: 7, xlabels: 2, ylabels: 2 });
    const glow = mbLine(G, () => [M1, B1], { color: PU, width: 16, opacity: 0.22, arrows: false });
    const L1 = mbLine(G, () => [M1, B1], { color: BL });
    const L2 = mbLine(G, () => [st.m, st.b], { color: AM });
    const PV = G.point(0, st.b, { color: AM, r: 6, open: true });
    const X = G.point(2, 2, { color: PU, r: 8 });
    const XL = G.label(2, 2, '', { cls: 'bk-ptlab u8l1-m-xlab', color: PU, pos: 'se', gap: 6 });
    const off = h('div', 'u8l1-m-off'); G.html.appendChild(off);
    const P = add(stage, box(h('div', 'u8l1-m-tsp' + (d.free ? ' u8l1-m-free' : '')), W - 488, 460), 480, 10);
    P.innerHTML = `<div class="u8l1-m-eqs"><div class="u8l1-m-eq">${T(c1('y=0.5x+1'))}</div><div class="u8l1-m-eq u8l1-m-eq2"></div></div>
      <div class="u8l1-m-mid"><div class="u8l1-m-cnt"><div class="u8l1-m-cntk">solutions</div><div class="u8l1-m-cntv"></div><div class="u8l1-m-cnts"></div></div>
      <div class="u8l1-m-cmp"><div class="u8l1-m-cmpr"><div class="u8l1-m-cmpk">slopes</div><div class="u8l1-m-cmpv u8l1-m-sm"></div><div class="u8l1-m-cmpt u8l1-m-smt"></div></div>
      <div class="u8l1-m-cmpr"><div class="u8l1-m-cmpk">intercepts</div><div class="u8l1-m-cmpv u8l1-m-sb"></div><div class="u8l1-m-cmpt u8l1-m-sbt"></div></div></div></div>
      <div class="u8l1-m-mchart">${['one', 'none', 'inf'].map((q) => `<div class="u8l1-m-mc" data-k="${q}"><div class="u8l1-m-mch">${{ one: 'One solution', none: 'No solution', inf: 'Infinitely many' }[q]}</div><svg viewBox="0 0 80 46">${miniSvg(q)}</svg><div class="u8l1-m-mcr">${{ one: 'slopes <b>different</b><br>intercepts <b>any</b>', none: 'slopes <b>equal</b><br>intercepts <b>different</b>', inf: 'slopes <b>equal</b><br>intercepts <b>equal</b>' }[q]}</div></div>`).join('')}</div>`;
    const q = (s) => P.querySelector(s);
    const eq2 = q('.u8l1-m-eq2'), cnt = q('.u8l1-m-cnt'), cntV = q('.u8l1-m-cntv'), cntS = q('.u8l1-m-cnts');
    const sm = q('.u8l1-m-sm'), smt = q('.u8l1-m-smt'), sb = q('.u8l1-m-sb'), sbt = q('.u8l1-m-sbt'), cols = [...P.querySelectorAll('.u8l1-m-mc')];
    let prev = null;
    const upd = () => {
      L2._bkDraw(); G.moveTo(PV, 0, st.b);
      const em = Math.abs(st.m - M1) < 1e-6, eb = Math.abs(st.b - B1) < 1e-6, kind = em ? (eb ? 'inf' : 'none') : 'one';
      put(eq2, T(c2(mbLive(st.m, st.b))));
      put(cntV, KIND[kind].n); put(cntS, KIND[kind].word);
      Object.values(KIND).forEach((kk) => cnt.classList.toggle(kk.cls, kk === KIND[kind]));
      put(sm, `${T(c1('0.5'))} <span class="u8l1-m-and">and</span> ${T(c2(d2(st.m)))}`); put(smt, em ? '<b class="u8l1-m-eqw">equal</b>' : 'different');
      put(sb, `${T(c1('1'))} <span class="u8l1-m-and">and</span> ${T(c2(d2(st.b)))}`); put(sbt, eb ? '<b class="u8l1-m-eqw">equal</b>' : 'different');
      cols.forEach((cl) => cl.classList.toggle('u8l1-m-on', cl.dataset.k === kind));
      setDash(L2, kind === 'inf'); glow.style.display = kind === 'inf' ? '' : 'none';
      if (kind === 'one') {
        const x = (st.b - B1) / (M1 - st.m), y = M1 * x + B1, inside = Math.abs(x) <= 7 && Math.abs(y) <= 7;
        const txt = Math.abs(x) > 999 ? 'very far away' : T(cP(`(${d1(x)},\\ ${d1(y)})`));
        X.style.visibility = inside ? '' : 'hidden'; XL.style.display = inside ? '' : 'none';
        if (inside) { G.moveTo(X, x, y); XL.gx = x; XL.gy = y; put(XL, T(cP(`(${d1(x)},\\ ${d1(y)})`))); XL._bkDraw(); place(XL, ...G.toPx(x, y), (Math.abs(y) < 1.3 ? 'n' : 's') + (x > 3 ? 'w' : 'e'), 6); off.style.display = 'none'; }
        else {
          const sx = x > 0 ? 6.75 : -6.75, [px, py] = G.toPx(sx, M1 * sx + B1);
          put(off, x > 0 ? `${txt} <b>→</b>` : `<b>←</b> ${txt}`); place(off, px, py - 26, x > 0 ? 'w' : 'e', 0); off.style.display = '';
        }
      } else { X.style.visibility = 'hidden'; XL.style.display = 'none'; off.style.display = 'none'; }
      if (prev && prev !== kind) cntV.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], 420);
      prev = kind;
    };
    upd();
    const move = async (c, to, ms = 2300) => {
      const s0 = Object.assign({}, st), a0 = Math.atan(s0.m), a1 = to.m != null ? Math.atan(to.m) : a0;
      await tween(c, ms, (t) => { if (to.m != null) st.m = Math.tan(a0 + (a1 - a0) * t); if (to.b != null) st.b = s0.b + (to.b - s0.b) * t; upd(); });
      Object.assign(st, to); upd();
    };
    if (d.free) {
      const ctl = h('div', 'u8l1-m-ctl'); P.appendChild(ctl);
      let busy = 0;
      const B = (html, title, to) => { const b = h('button', 'pill u8l1-m-cb', html); b.type = 'button'; b.title = title; b.onclick = async () => { const g = ++busy; const tgt = to(); if (g === busy) await move(liveCtx(), tgt, 450); }; ctl.appendChild(b); return b; };
      B('↺ turn', 'Slope up by 0.5', () => ({ m: Math.round((st.m + 0.5) * 2) / 2 })); B('↻ turn', 'Slope down by 0.5', () => ({ m: Math.round((st.m - 0.5) * 2) / 2 }));
      B('↑ slide', 'Slide up 1', () => ({ b: Math.round(st.b + 1) })); B('↓ slide', 'Slide down 1', () => ({ b: Math.round(st.b - 1) }));
      return [{ cap: `Your turn. Make the system have <b>no solution</b>. Then <b>infinitely many</b>. Then one solution again.`, run: async (c) => { await pulse(c, ctl, 1.04); } }];
    }
    return [
      { cap: d.first, run: async (c) => { await pulse(c, X, 1.5); await pulse(c, cnt, 1.06); } },
      ...d.moves.map((mv) => ({ cap: mv.cap, run: (c) => move(c, mv.to, mv.ms) }))
    ];
  }
};

/* =============================== races: the warm-up races as lines =============================== */
const RC = {
  r1: { label: 'Race 1', A: { n: 'Rosa', i: 'R', h: 30, v: 4 }, B: { n: 'Max', i: 'M', h: 0, v: 6 }, eA: 'd=30+4t', eB: 'd=6t', kind: 'one', labA: [35, 'se'], labB: [24, 'nw'],
    steps: [{ to: 15, cap: `Go! Max gains 2 m every second. At ${T('t=15')} s both are at 90 m: <b>side by side</b>. The lines cross at ${T(cP('(15,\\ 90)'))}.`, meet: [15, 90] },
      { to: 100 / 3, cap: `After that Max stays ahead. They were side by side <b>exactly once</b>: one crossing, <b>one solution</b>.` }] },
  r2: { label: 'Race 2', A: { n: 'Lee', i: 'L', h: 20, v: 5 }, B: { n: 'Ana', i: 'A', h: 0, v: 5 }, eA: 'd=20+5t', eB: 'd=5t', kind: 'none', labA: [24, 'nw'], labB: [32, 'se'],
    steps: [{ to: 20, cap: `Go! The gap is 20 m at the start, 20 m at 10 s, 20 m at 20 s… <b>Same speed, same slope</b>: the lines are parallel.` },
      { to: 36, cap: `Lee reaches the finish still 20 m ahead: Ana never catches him. Parallel lines never meet: <b>no solution</b>.` }] },
  r3: { label: 'Race 3', A: { n: 'Kai', i: 'K', h: 10, v: 3 }, B: { n: 'Jo', i: 'J', h: 10, v: 3 }, eA: 'd=10+3t', eB: 'd=2(5+1.5t)', kind: 'inf', labA: [42, 'nw'], labB: [28, 'se'],
    steps: [{ to: 190 / 3, cap: `Go! Step for step, the whole race. Every point on the line is on <b>both</b> lines: <b>infinitely many solutions</b>.` }] }
};
const races = {
  title: 'The warm-up races as lines: speed = slope, head start = intercept',
  height: 500,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(RC).map((k) => ({ v: k, label: RC[k].label })),
  intro: () => 'Distance–time lines for the two runners. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = RC[k], W = ex.W, X0 = 112, X1 = W - 40, px = (m) => X0 + (Math.min(200, m) / 200) * (X1 - X0);
    const fA = (t) => Math.min(200, d.A.h + d.A.v * t), fB = (t) => Math.min(200, d.B.h + d.B.v * t);
    const tfA = (200 - d.A.h) / d.A.v, tfB = (200 - d.B.h) / d.B.v;
    // track
    const trk = add(stage, box(h('div', 'u8l1-m-xtrack'), X1 - X0 + 36, 100), X0 - 18, 8);
    [d.A, d.B].forEach((r, i) => add(stage, h('div', 'u8l1-m-xname ' + (i ? 'u8l1-m-c2' : 'u8l1-m-c1'), r.n), 10, 22 + i * 46));
    add(stage, box(h('div', 'u8l1-m-xfin'), 16, 100), px(200) - 8, 8); add(stage, box(h('div', 'u8l1-m-xstart'), 4, 100), px(0) - 2, 8); void trk;
    const tok = (r, i) => { const t = h('div', 'u8l1-m-tok ' + (i ? 'u8l1-m-tb' : 'u8l1-m-ta'), r.i); stage.appendChild(t); return t; };
    const tA = tok(d.A, 0), tB = tok(d.B, 1);
    const side = add(stage, h('div', 'u8l1-m-sidepill', 'side by side'), 0, 0); side.style.display = 'none';
    // graph
    const G = new Graph(stage, { x: 8, y: 118, width: 580, height: 372, xmin: 0, xmax: 70, ymin: 0, ymax: 220, xstep: 5, ystep: 20, xlabels: 10, ylabels: 40, xtitle: 't', ytitle: 'd', fontSize: 16 });
    const LA = G.segment([0, d.A.h], [tfA, 200], { color: BL, width: 4.5 }), LB = G.segment([0, d.B.h], [tfB, 200], { color: AM, width: k === 'r3' ? 3.5 : 4.5, dash: k === 'r3' ? '12 10' : null });
    hideAll(LA, LB);
    const lA = G.label(d.labA[0], d.A.h + d.A.v * d.labA[0], T(c1(d.eA)), { cls: 'bk-ptlab u8l1-m-glab', pos: d.labA[1] });
    const lB = G.label(d.labB[0], d.B.h + d.B.v * d.labB[0], T(c2(d.eB)), { cls: 'bk-ptlab u8l1-m-glab', pos: d.labB[1] });
    hideAll(lA, lB);
    const DA = G.point(0, d.A.h, { color: BL, r: 7 }), DB = G.point(0, d.B.h, { color: AM, r: 7 });
    // panel
    const P = panel(stage, 604, 118, W - 612, 372, d.label);
    const eA = line(P, `${T(c1(d.eA))} <span class="u8l1-m-mut">${d.A.n}</span>`), eB = line(P, `${T(c2(d.eB))} <span class="u8l1-m-mut">${d.B.n}</span>`);
    const simp = k === 'r3' ? line(P, `${T('2(5+1.5t)=10+3t')}`, 'u8l1-m-simp') : null;
    const clock = line(P, '', 'u8l1-m-xclock'), posA = line(P, '', 'u8l1-m-xpos'), posB = line(P, '', 'u8l1-m-xpos'), gap = line(P, '', 'u8l1-m-xpos');
    const V = verdict(P, d.kind);
    hideAll(eA, eB, simp);
    let tt = 0;
    const setT = (t) => {
      tt = t; const a = fA(t), b = fB(t);
      place(tA, px(a), 30, 'c'); place(tB, px(b), 76, 'c');
      G.moveTo(DA, Math.min(t, tfA), a); G.moveTo(DB, Math.min(t, tfB), b);
      put(clock, `${T('t=' + d1(t))} s`);
      put(posA, `<b class="u8l1-m-c1">${d.A.n}</b> ${d1(a)} m${a >= 200 ? ' (finished)' : ''}`); put(posB, `<b class="u8l1-m-c2">${d.B.n}</b> ${d1(b)} m${b >= 200 ? ' (finished)' : ''}`);
      put(gap, `gap <b>${pm(d1(Math.abs(a - b)))} m</b>`);
      const sb = Math.abs(a - b) < 0.6 && a < 200; side.style.display = sb ? '' : 'none'; if (sb) place(side, px(a) + 30, 53, 'e', 0);
    };
    setT(0);
    const runTo = (c, t1) => { const t0 = tt; return tween(c, Math.max(900, (t1 - t0) * 75), (u) => setT(t0 + (t1 - t0) * u), (u) => u); };
    const steps = [{ cap: k === 'r3' ? `Kai: ${T(c1('d=10+3t'))}. Jo’s coach: ${T(c2('d=2(5+1.5t)'))}. These <b>look</b> different…`
      : `${d.A.n}: ${T(c1(d.eA))}. ${d.B.n}: ${T(c2(d.eB))}. The head start is the <b>intercept</b>; the speed is the <b>slope</b>.`,
    run: async (c) => {
      await show(c, eA); LA.style.opacity = 1; await G.drawIn(LA, 700, c); await fadeIn(c, lA);
      await show(c, eB); if (k !== 'r3') { LB.style.opacity = 1; await G.drawIn(LB, 700, c); await fadeIn(c, lB); }
    } }];
    if (k === 'r3') steps.push({ cap: `…but expand Jo’s rule: ${T('2(5+1.5t)=10+3t')}. That <b>is</b> Kai’s equation, so Jo’s line lands exactly on top of Kai’s.`,
      run: async (c) => { await show(c, simp); LB.style.opacity = 1; await G.drawIn(LB, 800, c); await fadeIn(c, lB); } });
    d.steps.forEach((s, i) => steps.push({ cap: s.cap, run: async (c) => {
      await runTo(c, s.to);
      if (s.meet) { const M = G.point(s.meet[0], s.meet[1], { color: PU, r: 9, label: T(cP(`(${s.meet[0]},\\ ${s.meet[1]})`)), pos: 'se' }); await G.reveal(M, c); }
      if (i === d.steps.length - 1) await pop(c, V, 420);
    } }));
    return steps;
  }
};

/* =============================== count: Example 5 check =============================== */
const EC = {
  a: { label: '(a)', L: [{ m: 1, b: -2, tex: 'y=x-2', lab: [-1, -3, 'nw'], say: `${T(c1('y=x-2'))}: start at ${T('-2')}, slope ${T('1')}: up 1, right 1.` },
    { m: -1, b: 6, tex: 'y=-x+6', lab: [-1.5, 7.5, 'w'], say: `${T(c2('y=-x+6'))}: start at ${T('6')}, slope ${T('-1')}: down 1, right 1.` }], kind: 'one' },
  b: { label: '(b)', L: [{ m: 2, b: 3, tex: 'y=2x+3', lab: [-3.5, -4, 'w'], say: `${T(c1('y=2x+3'))}: start at ${T('3')}, slope ${T('2')}: up 2, right 1.` },
    { m: 2, b: -5, tex: 'y=2x-5', lab: [4, 3, 'e'], say: `${T(c2('y=2x-5'))}: start at ${T('-5')}, slope ${T('2')}: up 2, right 1.` }], kind: 'none' },
  c: { label: '(c)', L: [{ m: 4, b: -6, tex: 'y=4x-6', lab: [2.5, 4, 'w'], say: `${T(c1('y=4x-6'))}: start at ${T('-6')}, slope ${T('4')}: up 4, right 1.` },
    { m: 4, b: -6, tex: '8x-2y-12=0', lab: [1, -2, 'e'], dash: '11 9' }], kind: 'inf' }
};
const count = {
  title: 'Example 5 check: graph both lines, then count',
  height: 480,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  value: 'a',
  choices: [{ sep: 'Example 5 check' }, ...Object.keys(EC).map((k) => ({ v: k, label: EC[k].label }))],
  intro: () => 'Graph each line from its <b>y-intercept</b> and <b>slope</b>, then count the crossing points. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = EC[k], W = ex.W;
    const G = new Graph(stage, { x: 8, y: 6, width: 380, height: 468, xmin: -6.5, xmax: 6.5, ymin: -8.5, ymax: 8.5, xlabels: 2, ylabels: 2, fontSize: 16 });
    const P = panel(stage, 404, 6, W - 412, 468, `Example 5 ${d.label}`);
    const [A, B] = d.L, cols = [BL, AM];
    const steps = [
      { cap: `Line 1: ${A.say}`, run: async (c) => { const l = line(P, A.say); await show(c, l); await plotMB(G, c, A.m, A.b, BL, { label: [...A.lab, c1(A.tex)] }); } }
    ];
    if (k === 'c') {
      let rows;
      steps.push({ cap: `Line 2 is not in ${T('y=mx+b')} form yet. Get ${T('y')} alone: ${T('8x-2y-12=0')} gives ${T('-2y=-8x+12')}, so ${T('y=4x-6')}.`, run: async (c) => {
        rows = [line(P, `${T(c2('8x-2y-12=0'))}`), line(P, `${T(c2('-2y=-8x+12'))} <span class="u8l1-m-mut">subtract ${T('8x')}, add 12</span>`), line(P, `${T(c2('y=4x-6'))} <span class="u8l1-m-mut">divide every term by ${T('-2')}</span>`)];
        for (const r of rows) { await show(c, r); await sleep(c, 200); }
      } });
      steps.push({ cap: `Same slope ${T('4')}, same intercept ${T('-6')}: the amber line lands <b>exactly on top</b> of the blue one.`, run: async (c) => {
        const L = G.line({ m: 4, b: -6 }, { color: AM, width: 3.5, dash: '11 9' }); await G.drawIn(L, 900, c);
        const lb = G.label(B.lab[0], B.lab[1], T(c2(B.tex)), { cls: 'bk-ptlab u8l1-m-glab', pos: B.lab[2] }); await fadeIn(c, lb);
      } });
      const V = verdict(P, 'inf');
      steps.push({ cap: `Every point on the line is on both: ${T(cP('(1,\\ -2)'))}, ${T(cP('(2,\\ 2)'))}, ${T(cP('(3,\\ 6)'))}, … <b>Infinitely many solutions.</b>`, run: async (c) => {
        for (const [x, y] of [[1, -2], [2, 2], [3, 6], [0.5, -4]]) { const p = G.point(x, y, { color: PU, r: 7 }); await pop(c, p, 260); }
        await pop(c, V, 420);
      } });
      return steps;
    }
    steps.push({ cap: `Line 2: ${B.say}`, run: async (c) => { const l = line(P, B.say); await show(c, l); await plotMB(G, c, B.m, B.b, AM, { label: [...B.lab, c2(B.tex)] }); } });
    if (k === 'a') {
      const V = verdict(P, 'one', null, null, `: ${T(cP('(4,\\ 2)'))}`);
      steps.push({ cap: `They cross at ${T(cP('(4,\\ 2)'))}. Check it in <b>both</b> equations.`, run: async (c) => {
        const X = G.point(4, 2, { color: PU, r: 8, label: T(cP('(4,\\ 2)')), pos: 'se' }); await G.reveal(X, c);
        const r1 = line(P, `${T(c1('2'))} ${T('\\overset{?}{=}')} ${T(c1('4-2=2'))} <b class="u8l1-m-ok">✓</b>`), r2 = line(P, `${T(c2('2'))} ${T('\\overset{?}{=}')} ${T(c2('-4+6=2'))} <b class="u8l1-m-ok">✓</b>`);
        await show(c, r1); await show(c, r2);
      } });
      steps.push({ cap: `One crossing point, and it checks in both: <b>one solution</b>, ${T(cP('(4,\\ 2)'))}.`, run: (c) => pop(c, V, 420) });
    } else {
      const V = verdict(P, 'none');
      steps.push({ cap: `Same slope: both go up 2 for every 1 across. Measure the vertical gap anywhere: always <b>8</b>. The lines are <b>parallel</b>.`, run: async (c) => {
        for (const x of [-1.5, 1, 2.5]) {
          const s = G.segment([x, 2 * x - 5], [x, 2 * x + 3], { color: SL, width: 3, ends: ['arrow', 'arrow'] }); await G.drawIn(s, 360, c);
          const lb = G.label(x, 2 * x - 1, T('8'), { cls: 'bk-ptlab u8l1-m-gaplab', pos: 'e', gap: 4 }); await fadeIn(c, lb);
        }
        await show(c, line(P, `gap ${T('=(2x+3)-(2x-5)=8')}, for every ${T('x')}`));
      } });
      steps.push({ cap: `A gap that is always 8 is never 0: no point is on both lines. <b>No solution.</b>`, run: (c) => pop(c, V, 420) });
    }
    void cols;
    return steps;
  }
};

/* =============================== classify: Example 7 check — the flowchart =============================== */
const CL = {
  jo: { label: 'Kai and Jo', e1: ['d=10+3t'], e2: ['d=2(5+1.5t)', 'd=10+3t'], m: ['3', '3'], b: ['10', '10'], kind: 'inf', v: 't' },
  a: { label: '(a)', e1: ['5x+2y=20', '2y=-5x+20', 'y=-\\tfrac{5}{2}x+10'], e2: ['y=-\\tfrac{5}{2}x', 'y=-\\tfrac{5}{2}x+0'], m: ['-\\tfrac{5}{2}', '-\\tfrac{5}{2}'], b: ['10', '0'], kind: 'none' },
  b: { label: '(b)', e1: ['x-3y+9=0', '-3y=-x-9', 'y=\\tfrac{1}{3}x+3'], e2: ['y=\\tfrac{1}{3}x+3'], m: ['\\tfrac{1}{3}', '\\tfrac{1}{3}'], b: ['3', '3'], kind: 'inf' },
  c: { label: '(c)', e1: ['6x+y=11', 'y=-6x+11'], e2: ['x-5y=20', '-5y=-x+20', 'y=\\tfrac{1}{5}x-4'], m: ['-6', '\\tfrac{1}{5}'], b: ['11', '-4'], kind: 'one' }
};
const classify = {
  title: 'Example 7 check: same slope? same intercept?',
  height: 470,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ sep: 'Warm-up' }, { v: 'jo', label: CL.jo.label }, { sep: 'Example 7 check' }, ...['a', 'b', 'c'].map((k) => ({ v: k, label: CL[k].label }))],
  value: 'a',
  intro: () => 'Rearrange both equations, then answer two questions. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CL[k], W = ex.W, FW = W - 470, IX = Math.min(FW / 2 + 158, FW - 96), NX = Math.min(FW / 2 - 36, IX - 180); // bottom boxes fit the width given
    const P = panel(stage, 8, 6, 444, 458, '', 'u8l1-m-clp');
    const blk = (rows, col) => { const b = h('div', 'u8l1-m-cblk u8l1-m-cb' + col); rows.forEach((r, i) => b.appendChild(h('div', 'u8l1-m-cr' + (i === rows.length - 1 && rows.length > 1 ? ' u8l1-m-cfin' : ''), T((col === 1 ? c1 : c2)(r))))); P.appendChild(b); return b; };
    const B1k = blk(d.e1, 1), B2k = blk(d.e2, 2);
    const later = [...B1k.children].slice(1).concat([...B2k.children].slice(1)); hideAll(later);
    const cm = line(P, `slopes: ${T(c1(d.m[0]))} <span class="u8l1-m-and">and</span> ${T(c2(d.m[1]))}`, 'u8l1-m-cmpl'), cb = line(P, `intercepts: ${T(c1(d.b[0]))} <span class="u8l1-m-and">and</span> ${T(c2(d.b[1]))}`, 'u8l1-m-cmpl');
    hideAll(cm, cb);
    const F = new Flowchart(stage, { x: 462, y: 6, width: FW, height: 458, nodes: {
      start: { x: FW / 2, y: 34, w: Math.min(380, FW - 20), h: 52, html: `<b>Write both as ${T('y=mx+b')}</b>`, cls: 'bk-round' },
      q1: { x: FW / 2, y: 132, w: 210, h: 52, html: '<b>Same slope?</b>', color: 'purple' },
      one: { x: 84, y: 250, w: 150, h: 84, html: '<b>One solution</b>lines cross once', color: 'green' },
      q2: { x: FW / 2 + 64, y: 250, w: 250, h: 52, html: `<b>Same ${T('y')}-intercept?</b>`, color: 'purple' },
      none: { x: NX, y: 392, w: 170, h: 84, html: '<b>No solution</b>parallel lines', color: 'red' },
      inf: { x: IX, y: 392, w: 180, h: 84, html: '<b>Infinitely many</b>the same line', color: 'teal' } },
    edges: [{ from: 'start', to: 'q1' },
      { from: 'q1', to: 'one', label: 'no', pts: [[FW / 2 - 108, 132], [84, 132], [84, 205]] },
      { from: 'q1', to: 'q2', label: 'yes', pts: [[FW / 2, 161], [FW / 2, 221]] },
      { from: 'q2', to: 'none', label: 'no', pts: [[NX, 279], [NX, 347]] },
      { from: 'q2', to: 'inf', label: 'yes', pts: [[IX, 279], [IX, 347]] }] });
    const sameM = d.m[0] === d.m[1], sameB = d.b[0] === d.b[1];
    const stp = verdict(P, d.kind);
    const steps = [
      { cap: `Write both equations in ${T('y=mx+b')} form.`, run: async (c) => { await F.visit(c, 'start'); for (const r of later) { await show(c, r); await sleep(c, 120); } } },
      { cap: `<b>Same slope?</b> ${T(c1(d.m[0]))} and ${T(c2(d.m[1]))}: ${sameM ? '<b>yes</b>.' : '<b>no</b>.'}`, run: async (c) => { await show(c, cm); await F.go(c, 'start', 'q1'); await F.visit(c, 'q1'); } }
    ];
    if (!sameM) {
      steps.push({ cap: `Different slopes: the lines cross exactly once. <b>One solution.</b> (It is at ${T('\\left(\\tfrac{75}{31},\\ -\\tfrac{109}{31}\\right)')}: no wonder we did not graph it!)`,
        run: async (c) => { await F.go(c, 'q1', 'one'); await F.visit(c, 'one'); await pop(c, stp, 420); } });
    } else {
      steps.push({ cap: `Same slope, so ask: <b>same ${T('y')}-intercept?</b> ${T(c1(d.b[0]))} and ${T(c2(d.b[1]))}: ${sameB ? '<b>yes</b>.' : '<b>no</b>.'}`, run: async (c) => { await show(c, cb); await F.go(c, 'q1', 'q2'); await F.visit(c, 'q2'); } });
      steps.push({ cap: sameB ? `Same slope and same intercept: ${k === 'jo' ? 'Kai’s and Jo’s rules are' : 'the two equations are'} the same line. <b>Infinitely many solutions.</b>`
        : `Same slope, different intercepts: parallel lines that never meet. <b>No solution.</b>`,
      run: async (c) => { const to = sameB ? 'inf' : 'none'; await F.go(c, 'q2', to); await F.visit(c, to); await pop(c, stp, 420); } });
    }
    return steps;
  }
};

/* =============================== mount =============================== */
mountWarm();
mountEx1();
export const explainers = mountExplainers({ dragLab, readGraph, sameY, byHand, tickets, breakEven, turnSlide, races, count, classify });
export const _test = { STD, YF, chk, DL, SY, E1, E2, E3, TS, RC, EC, CL };

/* ============ Stand Up Break! — solve a system by graphing, by hand (lessons/js/standup.js) ============
 * Every system is built from its solution, so the lines cross on grid points. A line is { A, B, C }: Ax + By = C.
 * The answer shows the lines' starting facts, the crossing point, the check in both original equations, and a small
 * answer graph (blue line 1, amber line 2, purple crossing). */
{
  const BL = COLORS.blue, AM = COLORS.amber, PU = COLORS.purple;
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const tm = (k, v, first) => (k === 0 ? '' : (k < 0 ? '-' : first ? '' : '+') + (Math.abs(k) === 1 && v ? '' : Math.abs(k)) + v);
  const fr = (n, d) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return [n / g + 0, d / g]; };
  const frT = (n, d) => { const [p, q] = fr(n, d); return q === 1 ? String(p) : (p < 0 ? '-' : '') + `\\tfrac{${Math.abs(p)}}{${q}}`; };
  const decT = (n, d) => { const [p, q] = fr(n, d); return q === 1 ? String(p) : q === 2 ? String(p / q) : frT(p, q); }; // 4.5, or ⅓-type fractions
  const pt = (x, y) => `(${x},\\ ${y})`;
  const cT = (col, s) => `\\textcolor{${col}}{${s}}`;
  const L = (A, B, C) => (A < 0 || (A === 0 && B < 0) ? { A: -A, B: -B, C: -C + 0 } : { A, B, C });
  const gen = (l, X = 'x', Y = 'y') => tm(l.A, X, true) + tm(l.B, Y, !l.A) + '=' + l.C;
  function si(l) { // y = mx + b, from Ax + By = C
    const [mp, mq] = fr(-l.A, l.B), [bp, bq] = fr(l.C, l.B);
    const mx = mp === 0 ? '' : mq === 1 ? tm(mp, 'x', true) : (mp < 0 ? '-' : '') + `\\tfrac{${Math.abs(mp)}}{${mq}}x`;
    const bt = bp === 0 ? '' : (bp < 0 ? '-' : mx ? '+' : '') + (bq === 1 ? Math.abs(bp) : `\\tfrac{${Math.abs(bp)}}{${bq}}`);
    return 'y=' + ((mx + bt) || '0');
  }
  const slopeT = (l) => frT(-l.A, l.B), intT = (l) => frT(l.C, l.B);
  const mb = (m, b) => L(-m, 1, b);                       // y = mx + b with integer m, b
  const parallel = (a, b) => a.A * b.B === a.B * b.A;
  // the substitution check in an equation as it was written ('si': y = mx + b; 'gen': Ax + By = C)
  function check(l, form, x, y) {
    const k = (c, v, first) => (c === 1 ? (first ? '' : '+') : c === -1 ? '-' : (c > 0 && !first ? '+' : '') + c) + `(${v})`;
    if (form === 'si') { const [mp, mq] = fr(-l.A, l.B), [bp, bq] = fr(l.C, l.B); const m = mq === 1 ? mp : null; return `${y}=` + (m === null ? `${frT(mp, mq)}(${x})` : k(m, x, true)) + (bp ? (bp < 0 ? '-' : '+') + (bq === 1 ? Math.abs(bp) : `\\tfrac{${Math.abs(bp)}}{${bq}}`) : '') + '\\ \\checkmark'; }
    return (l.A ? k(l.A, x, true) : '') + (l.B ? k(l.B, y, !l.A) : '') + `=${l.C}\\ \\checkmark`;
  }
  // lattice points of a line inside a window, nearest the origin first (skipping one point)
  function lattice(l, w, skip) {
    const out = [];
    for (let x = w.x0; x <= w.x1; x++) { const n = l.C - l.A * x; if (n % l.B === 0) { const y = n / l.B; if (y >= w.y0 && y <= w.y1 && !(skip && skip[0] === x && skip[1] === y)) out.push([x, y + 0]); } }
    return out.sort((p, q) => (p[0] * p[0] + p[1] * p[1]) - (q[0] * q[0] + q[1] * q[1]));
  }
  /* a small answer graph: the two lines and the crossing point */
  function graph(lines, P, w) {
    const S = 200, pad = 14, sx = S / (w.x1 - w.x0), sy = S / (w.y1 - w.y0);
    const X = (x) => +(pad + (x - w.x0) * sx).toFixed(1), Y = (y) => +(pad + (w.y1 - y) * sy).toFixed(1);
    let g = '';
    for (let x = Math.ceil(w.x0 / w.step) * w.step; x <= w.x1; x += w.step) g += `<line x1="${X(x)}" y1="${Y(w.y0)}" x2="${X(x)}" y2="${Y(w.y1)}" stroke="${x === 0 ? '#3a4254' : '#d5d9e0'}" stroke-width="${x === 0 ? 1.4 : 0.7}"/>`;
    for (let y = Math.ceil(w.y0 / w.step) * w.step; y <= w.y1; y += w.step) g += `<line x1="${X(w.x0)}" y1="${Y(y)}" x2="${X(w.x1)}" y2="${Y(y)}" stroke="${y === 0 ? '#3a4254' : '#d5d9e0'}" stroke-width="${y === 0 ? 1.4 : 0.7}"/>`;
    const tick = (x, y, s, anchor) => `<text x="${x}" y="${y}" font-size="9.5" fill="#5b6273" text-anchor="${anchor}">${s}</text>`;
    for (let x = Math.ceil(w.x0 / w.lab) * w.lab; x <= w.x1; x += w.lab) if (x) g += tick(X(x), Y(Math.max(w.y0, 0)) + 11, String(x).replace('-', '−'), 'middle');
    for (let y = Math.ceil(w.y0 / w.lab) * w.lab; y <= w.y1; y += w.lab) if (y) g += tick(X(Math.max(w.x0, 0)) - 3, Y(y) + 3, String(y).replace('-', '−'), 'end');
    lines.forEach(({ l, col }) => {
      const c = [];
      if (l.B) [w.x0, w.x1].forEach((x) => c.push([x, (l.C - l.A * x) / l.B]));
      if (l.A) [w.y0, w.y1].forEach((y) => c.push([(l.C - l.B * y) / l.A, y]));
      const inn = c.filter(([x, y]) => x >= w.x0 - 1e-9 && x <= w.x1 + 1e-9 && y >= w.y0 - 1e-9 && y <= w.y1 + 1e-9);
      let best = null, bd = -1;
      inn.forEach((p) => inn.forEach((q) => { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2; if (d > bd) { bd = d; best = [p, q]; } }));
      if (best) g += `<line x1="${X(best[0][0])}" y1="${Y(best[0][1])}" x2="${X(best[1][0])}" y2="${Y(best[1][1])}" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/>`;
    });
    g += `<circle cx="${X(P[0])}" cy="${Y(P[1])}" r="4.6" fill="${PU}" stroke="#fff" stroke-width="1.5"/>`;
    const W = S + 2 * pad;
    return `<svg viewBox="0 0 ${W} ${W}" width="${W}" height="${W}" style="max-width:100%;height:auto;display:block;margin:4px auto" role="img" aria-label="The two lines cross at (${P[0]}, ${P[1]})">${g}</svg>`;
  }
  const W8 = { x0: -8, x1: 8, y0: -8, y1: 8, step: 1, lab: 4 };
  const half = (e, col) => { const i = e.indexOf('='); return cT(col, e.slice(0, i)) + '&' + cT(col, e.slice(i)); };
  const sysT = (a, b) => `\\begin{aligned}${half(a, BL)}\\\\${half(b, AM)}\\end{aligned}`;
  const solve = 'Solve the system by graphing both lines by hand. Then check your solution in both equations.';

  /* Beginning: both lines already y = mx + b, integer slopes */
  function beg(r) {
    for (;;) {
      const m1 = r.pick([1, 2, 3, -1, -2, -3]), m2 = r.pick([1, 2, 3, -1, -2, -3, [1, 2], [-1, 2]]), x0 = r.int(-4, 4), y0 = r.int(-5, 5);
      if (Array.isArray(m2) && x0 % 2) continue;
      const M2 = Array.isArray(m2) ? m2[0] / m2[1] : m2;
      if (m1 === M2) continue;
      const b1 = y0 - m1 * x0, b2 = y0 - M2 * x0;
      if (b1 === b2 || Math.abs(b1) > 6 || Math.abs(b2) > 6) continue;
      const l1 = mb(m1, b1), l2 = Array.isArray(m2) ? L(-m2[0], m2[1], m2[1] * b2) : mb(m2, b2);
      const e1 = si(l1), e2 = si(l2);
      return { text: solve, q: sysT(e1, e2),
        a: [`${cT(BL, `b=${b1},\\ m=${slopeT(l1)}`)}\\qquad ${cT(AM, `b=${b2},\\ m=${slopeT(l2)}`)}`,
          `\\text{The lines cross at } ${cT(PU, pt(x0, y0))}`,
          `${check(l1, 'si', x0, y0)}\\qquad ${check(l2, 'si', x0, y0)}`],
        atext: graph([{ l: l1, col: BL }, { l: l2, col: AM }], [x0, y0], W8) };
    }
  }
  /* Progressing: rearrange first (one or both in general form; a fraction slope sometimes) */
  function prg(r) {
    for (;;) {
      const x0 = r.int(-5, 5), y0 = r.int(-6, 6);
      // line 1: Ax ± y = C
      const l1 = (() => { const A = r.pick([1, 2, 3, 4, -2, -3]), B = r.pick([1, -1]); return L(A, B, A * x0 + B * y0); })();
      let l2, f2;
      if (r.chance(0.45)) { // y = (p/q)x + b
        const [p, q] = r.pick([[1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [3, 2], [-3, 2]]);
        if (x0 % q) continue;
        l2 = L(-p, q, q * y0 - p * x0); f2 = 'si';
      } else { const A = r.pick([1, 2, 3, -1, -2, 5]), B = r.pick([1, -1]); l2 = L(A, B, A * x0 + B * y0); f2 = 'gen'; }
      if (parallel(l1, l2)) continue;
      const b1 = l1.C / l1.B, b2 = l2.C / l2.B;
      if (!Number.isInteger(b2) || Math.abs(b1) > 7 || Math.abs(b2) > 7 || b1 === b2) continue;
      const e1 = gen(l1), e2 = f2 === 'si' ? si(l2) : gen(l2);
      const rear = (l, e, f) => (f === 'si' ? cT(l === l1 ? BL : AM, e) + `:\\ b=${intT(l)},\\ m=${slopeT(l)}` : cT(l === l1 ? BL : AM, `${e}\\ \\Rightarrow\\ ${si(l)}`));
      return { text: solve, q: sysT(e1, e2),
        a: [rear(l1, e1, 'gen'), rear(l2, e2, f2),
          `\\text{The lines cross at } ${cT(PU, pt(x0, y0))}`, `${check(l1, 'gen', x0, y0)}\\qquad ${check(l2, f2, x0, y0)}`],
        atext: graph([{ l: l1, col: BL }, { l: l2, col: AM }], [x0, y0], W8) };
    }
  }
  /* Mastery: (a) both in general form with fraction slopes (graph from lattice points or intercepts);
   *          (b) a two-family ticket story: write the system, graph it in the first quadrant, interpret the crossing */
  function masA(r) {
    for (;;) {
      const x0 = r.int(-4, 4), y0 = r.int(-4, 4);
      const A1 = r.pick([1, 2, 3, 4, -1, -2]), B1 = r.pick([2, 3, -2, -3]), A2 = r.pick([1, 2, 3, 5, -1, -3]), B2 = r.pick([1, 2, 3, -1, -2, 4]);
      if (gcd(A1, B1) !== 1 || gcd(A2, B2) !== 1 || Math.abs(B2) === 1 && Math.abs(A2) === 1) continue;
      const l1 = L(A1, B1, A1 * x0 + B1 * y0), l2 = L(A2, B2, A2 * x0 + B2 * y0);
      if (parallel(l1, l2) || (l1.A < 0 && l1.B < 0) || (l2.A < 0 && l2.B < 0)) continue;
      const p1 = lattice(l1, W8, [x0, y0]), p2 = lattice(l2, W8, [x0, y0]);
      if (p1.length < 2 || p2.length < 2) continue;
      const pts = (ps) => pt(...ps[0]) + '\\text{ and }' + pt(...ps[1]);
      return { text: solve + ' (Hint: find two points on each line that land on grid points.)', q: sysT(gen(l1), gen(l2)),
        a: [`${cT(BL, gen(l1))}:\\ ${pts(p1)}`, `${cT(AM, gen(l2))}:\\ ${pts(p2)}`,
          `\\text{The lines cross at } ${cT(PU, pt(x0, y0))}`, `${check(l1, 'gen', x0, y0)}\\qquad ${check(l2, 'gen', x0, y0)}`],
        atext: graph([{ l: l1, col: BL }, { l: l2, col: AM }], [x0, y0], W8) };
    }
  }
  const STORY = [
    ['zoo', 'adult', 'child'], ['fun run', 'adult', 'child'], ['water park', 'adult', 'child'], ['science centre', 'adult', 'student'],
    ['bowling alley', 'adult', 'youth'], ['corn maze', 'adult', 'child'], ['hockey game', 'adult', 'student']];
  const FAM = ['Alvarez', 'Bennett', 'Chen', 'Dubois', 'Okafor', 'Singh', 'Nguyen', 'Kowalski', 'Martel', 'Haddad'];
  function masB(r) {
    for (;;) {
      const x0 = r.int(3, 8), y0 = r.int(1, 5); if (y0 >= x0) continue;
      const a1 = r.int(1, 3), c1 = r.int(1, 3), a2 = r.int(1, 3), c2 = r.int(1, 4);
      if (a1 * c2 === a2 * c1) continue;
      const T1 = a1 * x0 + c1 * y0, T2 = a2 * x0 + c2 * y0, top = Math.max(T1 / a1, T1 / c1, T2 / a2, T2 / c2);
      if (top > 12) continue;
      const [s, A, C] = r.pick(STORY), [f1, f2] = r.shuffle(FAM).slice(0, 2), n = Math.ceil(top);
      const many = (k, w) => `${k} ${w} ticket${k === 1 ? '' : 's'}`;
      const l1 = L(a1, c1, T1), l2 = L(a2, c2, T2), w = { x0: 0, x1: n, y0: 0, y1: n, step: 1, lab: n > 8 ? 4 : 2 };
      return { text: `At the ${s}, the ${f1} family pays $${T1} for ${many(a1, A)} and ${many(c1, C)}. The ${f2} family pays $${T2} for ${many(a2, A)} and ${many(c2, C)}. ` +
          `Let <i>x</i> be the price of one ${A} ticket and <i>y</i> the price of one ${C} ticket, in dollars. Write a system of equations and solve it by graphing.`, q: '',
        a: [sysT(gen(l1), gen(l2)),
          `\\text{Intercepts: }${cT(BL, `${pt(0, decT(T1, c1))},\\ ${pt(decT(T1, a1), 0)}`)}\\quad ${cT(AM, `${pt(0, decT(T2, c2))},\\ ${pt(decT(T2, a2), 0)}`)}`,
          `\\text{The lines cross at } ${cT(PU, pt(x0, y0))}`, `${check(l1, 'gen', x0, y0)}\\qquad ${check(l2, 'gen', x0, y0)}`],
        atext: `An ${A} ticket costs <b>$${x0}</b> and a${/^[aeiou]/.test(C) ? 'n' : ''} ${C} ticket costs <b>$${y0}</b>.` + graph([{ l: l1, col: BL }, { l: l2, col: AM }], [x0, y0], w) };
    }
  }
  standup('u8l1', {
    intro: 'Graph both lines by hand on your whiteboard grid, read the crossing point, then check it in both equations.',
    levels: { BEG: beg, PRG: prg, MAS: (r) => (r.chance(0.5) ? masA(r) : masB(r)) }
  });
}
