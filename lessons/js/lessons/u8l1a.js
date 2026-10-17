/* Math 10C · Unit 8 · Lesson 1A — Graphing Systems of Linear Equations.
 * Warm-up: hot tea / iced tea (thermometers and a clock that draws both temperature lines). Explainers:
 *   onePair (each equation has many solutions; one pair is on both lists = the crossing point), dragLab (STAR: drag a
 *   point around the grid with a live ✓/✗ for each equation; only the crossing gets ✓ ✓), readGraph (Example 1: drop
 *   to the axes, x first, verify in both; the swapped-pair slip), oneLine (graph one line from y = mx + b, incl. an
 *   off-grid intercept), sameY (the shortcut: a sweep line where the two y-values meet, then set them equal),
 *   byHand (Example 2 by slope–intercept and by tables of values), tickets (Example 3: story → equations → graph →
 *   meaning), ti84 (TI-84 Y=, WINDOW / ZOOM 6, GRAPH, 2nd CALC 5:intersect on a drawn screen), zoomIn (Example 4 (d):
 *   a guess that checks in one equation only; zoom in to the true crossing), breakEven (Example 5: the gap between
 *   cost and revenue is the profit or loss).
 * Colours: line 1 / equation 1 blue, line 2 / equation 2 amber, the solution point purple; profit green, loss red. */
import {
  h, tex, add, box, Graph, ValueTable, stamp, stampIn, mountExplainers, pop, fadeIn, sleep, tween, pulse,
  pairTex, texNum, svgEl, liveCtx, calcNum, COLORS, num
} from '../blocks.js';

const T = (s) => tex(String(s));
const BLUE = COLORS.blue, AMB = COLORS.amber, PUR = COLORS.purple, GRN = COLORS.green, RED = COLORS.red, INK = COLORS.ink;
const k1 = (s) => `\\textcolor{${BLUE}}{${s}}`, k2 = (s) => `\\textcolor{${AMB}}{${s}}`, kp = (s) => `\\textcolor{${PUR}}{${s}}`;
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u8l1a-panel ' + cls, title ? `<div class="u8l1a-ph">${title}</div>` : ''), w, hh), x, y);
const line = (P, html, cls = '') => { const d = h('div', 'u8l1a-line ' + cls, html); P.appendChild(d); return d; };
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
const mark = (ok) => (ok ? '<b class="u8l1a-ok">✓</b>' : '<b class="u8l1a-no">✗</b>');
/** a "check in eq" row for a panel: coloured equation, then the substitution and ✓/✗ */
function checkRow(P, eq, x, y, col) {
  const r = chk(eq, x, y), k = col === AMB ? k2 : k1;
  return line(P, `<span class="u8l1a-ckeq">${T(k(eq.tex))}</span><span class="u8l1a-cksub">${T(r.tex)}</span>${mark(r.ok)}`, 'u8l1a-ck');
}

/* =============================== warm-up: hot tea, iced tea =============================== */
function mountWarm() {
  const host = document.getElementById('u8l1a-tea'); if (!host) return;
  const D = [
    { name: 'Hot tea', T0: 80, r: -4, col: RED, rate: 'cools <b>4 °C</b> every minute', pic: 'mug' },
    { name: 'Iced tea', T0: 5, r: 1, col: BLUE, rate: 'warms <b>1 °C</b> every minute', pic: 'glass' }
  ];
  const MUG = '<svg viewBox="0 0 120 120" class="u8l1a-pic"><path d="M88 46c20 0 20 34 0 34" fill="none" stroke="#5c6475" stroke-width="7"/>' +
    '<rect x="12" y="30" width="80" height="80" rx="10" fill="#fff" stroke="#1c2230" stroke-width="3"/><rect x="16" y="36" width="72" height="12" fill="#965a1e"/>' +
    '<rect x="12" y="64" width="80" height="18" fill="#c93a33"/><text x="52" y="78" text-anchor="middle" font-size="15" font-weight="800" fill="#fff">HOT</text>' +
    '<path class="u8l1a-steam" d="M32 24c6-6-6-10 0-18M52 24c6-6-6-10 0-18M72 24c6-6-6-10 0-18" fill="none" stroke="#9aa0ab" stroke-width="4" stroke-linecap="round"/></svg>';
  const GLASS = '<svg viewBox="0 0 120 120" class="u8l1a-pic"><path d="M16 22 L26 112 L86 112 L96 22 Z" fill="#e2a85c" stroke="#1c2230" stroke-width="3"/>' +
    '<path d="M18 22 L20 38 L92 38 L94 22 Z" fill="#fff"/>' +
    '<rect x="30" y="50" width="20" height="20" rx="3" fill="#fff" fill-opacity=".85" stroke="#2e6ec8" stroke-width="2" transform="rotate(12 40 60)"/>' +
    '<rect x="56" y="56" width="20" height="20" rx="3" fill="#fff" fill-opacity=".85" stroke="#2e6ec8" stroke-width="2" transform="rotate(-10 66 66)"/>' +
    '<rect x="38" y="82" width="20" height="20" rx="3" fill="#fff" fill-opacity=".85" stroke="#2e6ec8" stroke-width="2" transform="rotate(20 48 92)"/>' +
    '<path d="M70 104 L84 6" stroke="#c93a33" stroke-width="7" stroke-linecap="round"/></svg>';
  const cards = D.map((d) => {
    const el = h('div', 'u8l1a-drink', `<div class="u8l1a-dn" style="color:${d.col}">${d.name}</div><div class="u8l1a-dpic">${d.pic === 'mug' ? MUG : GLASS}` +
      `<div class="u8l1a-th"><div class="u8l1a-thf" style="background:${d.col}"></div><div class="u8l1a-thb" style="background:${d.col}"></div></div></div>` +
      `<div class="u8l1a-dt" style="color:${d.col}"></div><div class="u8l1a-dr">${d.rate}</div>`);
    host.appendChild(el);
    return { d, fill: el.querySelector('.u8l1a-thf'), t: el.querySelector('.u8l1a-dt') };
  });
  const right = h('div', 'u8l1a-tright'); host.appendChild(right);
  const clock = h('div', 'u8l1a-clock'); right.appendChild(clock);
  const G = new Graph(right, { width: 380, height: 300, xmin: 0, xmax: 20.5, ymin: 0, ymax: 90, xstep: 1, ystep: 10, xlabels: 5, ylabels: 20, fontSize: 15, origin: true, xtitle: 't', ytitle: 'T', pad: [16, 18, 30, 40] });
  const st = { t: 0 };
  D.forEach((d) => {
    G.curve(() => { const a = G.toPx(0, d.T0), b = G.toPx(st.t, d.T0 + d.r * st.t); return { subs: [[a, b]] }; }, { color: d.col, width: 4 }, 'u8l1a-wline', G.layers.data);
    G.point(0, d.T0, { color: d.col, r: 6 });
  });
  const q = G.label(14, 55, '?', { cls: 'u8l1a-bigq' });
  const meet = G.point(15, 20, { color: PUR, r: 8, label: 'both 20 °C', pos: 'ne', labelCls: 'u8l1a-meet' });
  const set = (t) => {
    st.t = t; G.redraw();
    cards.forEach((cd) => { const v = cd.d.T0 + cd.d.r * t; cd.fill.style.height = (v / 90 * 100).toFixed(1) + '%'; cd.t.textContent = `${num(v, 1)} °C`; });
    clock.innerHTML = `<b>${num(t, 1)}</b> min`;
    const on = t >= 15 - 1e-9; meet.style.opacity = on ? 1 : 0; if (meet.label) meet.label.style.opacity = on ? 1 : 0; q.style.opacity = t > 0 ? 0 : 1;
  };
  set(0);
  let gen = 0;
  document.getElementById('u8l1a-plus').addEventListener('click', () => { gen++; set(Math.min(20, Math.round(st.t) + 1)); });
  document.getElementById('u8l1a-reset').addEventListener('click', () => { gen++; set(0); });
  document.getElementById('u8l1a-run').addEventListener('click', async () => {
    const g = ++gen, c = liveCtx(); let a = st.t; if (a >= 20) { a = 0; set(0); }
    await tween(c, (20 - a) * 400, (k) => { if (g !== gen) return false; set(a + (20 - a) * k); }, (k) => k);
  });
}

/* =============================== 1. onePair: many solutions each, one pair for both =============================== */
const OP = {
  s1: { label: T('x+2y=8,\\ 2x-y=1'), e1: STD(1, 2, 8, 'x+2y=8'), e2: STD(2, -1, 1, '2x-y=1'), p1: [[0, 4], [8, 0], [4, 2]], p2: [[0, -1], [1, 1], [3, 5]], sol: [2, 3],
    win: { xmin: -1.5, xmax: 9.5, ymin: -2.5, ymax: 8.5 }, v: ['x', 'y'], l1: [6.3, 1.3, 'ne'], l2: [3.6, 7, 'w'] },
  tea: { label: 'Warm-up: hot tea, iced tea', e1: YF(-4, 80, 'T=80-4t', { bFirst: true }), e2: YF(1, 5, 'T=5+t', { bFirst: true }), p1: [[0, 80], [5, 60], [10, 40]], p2: [[0, 5], [5, 10], [10, 15]], sol: [15, 20],
    win: { xmin: 0, xmax: 21, ymin: 0, ymax: 90, xstep: 1, ystep: 10, xlabels: 5, ylabels: 20, origin: true, xtitle: 't', ytitle: 'T' }, v: ['t', 'T'], l1: [3, 70, 'ne'], l2: [12, 14.5, 's'] }
};
const onePair = {
  title: 'Many solutions each, one solution for both',
  height: 470,
  choices: [{ v: 's1', label: OP.s1.label }, { v: 'tea', label: OP.tea.label }],
  intro: (k) => (k === 'tea' ? `The warm-up drinks: hot ${T(k1('T=80-4t'))} and iced ${T(k2('T=5+t'))}, where ${T('t')} is minutes and ${T('T')} is °C. When do they match? Press <b>Next</b>.`
    : `Two equations, ${T(k1('x+2y=8'))} and ${T(k2('2x-y=1'))}. Each has many solutions. Which pair works for <b>both</b>? Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = OP[k], [xv, yv] = d.v, [sx, sy] = d.sol, list = (ps) => ps.map((p) => pt(...p)).join(',\\ ');
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 442, height: 442 }, d.win));
    const x0 = 486, W = ex.W - x0 - 14, cw = Math.min(70, (W - 40) / 4);
    const mkT = (i, eq, col) => {
      const xx = x0 + i * (W / 2) + (W / 2 - 2 * cw) / 2;
      const hd = add(stage, h('div', 'u8l1a-thd', T(i ? k2(eq.tex) : k1(eq.tex))), x0 + i * (W / 2), 8); hd.style.width = W / 2 + 'px';
      const tb = new ValueTable(stage, { x: xx, y: 44, headers: [xv, yv], rows: [], cellW: cw, cellH: 38, tap: false, cls: 'u8l1a-vt ' + (i ? 'u8l1a-vt2' : 'u8l1a-vt1') });
      void col; return tb;
    };
    const t1 = mkT(0, d.e1, BLUE), t2 = mkT(1, d.e2, AMB);
    const P = panel(stage, x0, 248, W, 208, 'Check in both', 'u8l1a-cp');
    let L1, L2, S;
    const plot = async (c, tb, ps, col) => { for (const p of ps) { await tb.addRow(p, c); await pop(c, G.point(p[0], p[1], { color: col, r: 6.5 }), 220); } };
    const lab = (eq, l, col) => G.label(l[0], l[1], T(eq.tex), { pos: l[2], cls: 'bk-ptlab', color: col });
    const r1 = chk(d.e1, sx, sy), r2 = chk(d.e2, sx, sy);
    return [
      { cap: `${T(k1(d.e1.tex))} is true for many pairs: ${T(list(d.p1))} …`, run: (c) => plot(c, t1, d.p1, BLUE) },
      { cap: `Every solution of ${T(k1(d.e1.tex))} is a point on <b>one line</b>.`, run: async (c) => { L1 = eqLine(G, d.e1, { color: BLUE, width: 4 }); await G.drawIn(L1, 800, c); await fadeIn(c, lab(d.e1, d.l1, BLUE)); } },
      { cap: `${T(k2(d.e2.tex))} has its own pairs: ${T(list(d.p2))} …`, run: (c) => plot(c, t2, d.p2, AMB) },
      { cap: `…and its own line.`, run: async (c) => { L2 = eqLine(G, d.e2, { color: AMB, width: 4 }); await G.drawIn(L2, 800, c); await fadeIn(c, lab(d.e2, d.l2, AMB)); } },
      { cap: `Only <b>one</b> pair is on <b>both</b> lists: ${T(kp(pt(sx, sy)))}. It is the point where the lines <b>cross</b>.`,
        run: async (c) => {
          await Promise.all([t1.addRow([sx, sy], c), t2.addRow([sx, sy], c)]); t1.highlight(3, true, 'u8l1a-hlp'); t2.highlight(3, true, 'u8l1a-hlp');
          S = G.point(sx, sy, { color: PUR, r: 9, label: T(pt(sx, sy)), pos: 'se', labelColor: PUR }); await G.reveal(S, c); await pulse(c, S, 1.4);
        } },
      { cap: `It checks in both: ${r1.ok && r2.ok ? '✓ and ✓' : ''}. The <b>solution to the system</b> is ${T(pt(sx, sy))}, the <b>point of intersection</b>${k === 'tea' ? ': after 15 min both drinks are at 20 °C' : ''}.`,
        run: async (c) => {
          await show(c, checkRow(P, d.e1, sx, sy, BLUE)); await show(c, checkRow(P, d.e2, sx, sy, AMB));
        } }
    ];
  }
};

/* =============================== 2. dragLab (star): drag the point, ✓/✗ for each equation =============================== */
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
  choices: [{ v: 's1', label: DL.s1.label }, { sep: 'Check' }, { v: 'ex1', label: DL.ex1.label }, { v: 'ex2', label: DL.ex2.label }, { v: 'ex3', label: DL.ex3.label }],
  intro: (k) => `Drag the point anywhere on the grid, or press <b>Next</b> for a tour. ${T(k1(DL[k].e1.tex))} and ${T(k2(DL[k].e2.tex))}: which points check in <b>both</b>?`,
  make(stage, k, ex) {
    const d = DL[k], w = d.win;
    const G = new Graph(stage, Object.assign({ x: 12, y: 14, width: 452, height: 452 }, w));
    G.el.classList.add('u8l1a-drag'); G.el.setAttribute('data-tap', '');
    eqLine(G, d.e1, { color: BLUE, width: 4 }); eqLine(G, d.e2, { color: AMB, width: 4 });
    G.label(d.l1[0], d.l1[1], T(d.e1.tex), { pos: d.l1[2], cls: 'bk-ptlab', color: BLUE });
    G.label(d.l2[0], d.l2[1], T(d.e2.tex), { pos: d.l2[2], cls: 'bk-ptlab', color: AMB });
    const P = panel(stage, 486, 14, ex.W - 500, 452, 'Is the point on each line?', 'u8l1a-dp');
    const ro = line(P, '', 'u8l1a-dro');
    const rows = [d.e1, d.e2].map((eq, i) => {
      const r = h('div', 'u8l1a-drow ' + (i ? 'u8l1a-drow2' : 'u8l1a-drow1'), `<div class="u8l1a-dh">${T(eq.tex)}</div><div class="u8l1a-dsub"></div><div class="u8l1a-dmk"></div>`);
      P.appendChild(r); return { r, sub: r.querySelector('.u8l1a-dsub'), mk: r.querySelector('.u8l1a-dmk'), eq };
    });
    const verdict = line(P, '', 'u8l1a-dverd');
    const halo = svgEl('circle', { class: 'u8l1a-halo', r: 17 }, G.layers.top);
    const dot = G.point(d.start[0], d.start[1], { color: INK, r: 10, cls: 'u8l1a-dragpt' });
    G.track(halo, () => { const [px, py] = G.toPx(dot.gx, dot.gy); halo.setAttribute('cx', px); halo.setAttribute('cy', py); });
    const state = (x, y) => { const a = chk(d.e1, x, y), b = chk(d.e2, x, y); return { a, b }; };
    const upd = () => {
      const x = dot.gx, y = dot.gy, { a, b } = state(x, y);
      ro.innerHTML = `${T(pt(x, y))}`; halo._bkDraw();
      [a, b].forEach((r, i) => { rows[i].sub.innerHTML = T(r.tex); rows[i].mk.innerHTML = mark(r.ok); rows[i].r.classList.toggle('u8l1a-good', r.ok); rows[i].r.classList.toggle('u8l1a-bad', !r.ok); });
      const col = a.ok && b.ok ? PUR : a.ok ? BLUE : b.ok ? AMB : INK;
      dot.querySelector('circle').setAttribute('fill', col); halo.setAttribute('stroke', col); halo.style.opacity = a.ok && b.ok ? 1 : 0;
      verdict.className = 'u8l1a-line u8l1a-dverd ' + (a.ok && b.ok ? 'u8l1a-win' : '');
      verdict.innerHTML = a.ok && b.ok ? '✓ ✓ On <b>both</b> lines: the solution!' : a.ok || b.ok ? 'On one line only: <b>not</b> a solution of the system' : 'On neither line';
      if (d.ctx) verdict.innerHTML += `<div class="u8l1a-dctx">adult $${x}, child $${y}</div>`;
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

/* =============================== 3. readGraph: Example 1 =============================== */
const E1 = { e1: YF(1, 5, 'y=x+5'), e2: YF(-2, -1, 'y=-2x-1'), sol: [-2, 3] };
const readGraph = {
  title: 'Read the crossing point, then verify it',
  height: 470,
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
          await fadeIn(c, G.label(sx, 0, T('-2'), { pos: 's', cls: 'bk-ptlab u8l1a-axlab', color: PUR, gap: 4 })); await say(c, P, `${T('x=-2')} <span class="u8l1a-sm">(2 left)</span>`, 'u8l1a-big');
        } },
        { cap: `Straight across to the ${T('y')}-axis: ${T('y=3')}.`, run: async (c) => {
          await G.drawIn(G.segment([sx, sy], [0, sy], { color: PUR, width: 3, dash: true }), 500, c);
          await fadeIn(c, G.label(0, sy, T('3'), { pos: 'e', cls: 'bk-ptlab u8l1a-axlab', color: PUR, gap: 4 })); await say(c, P, `${T('y=3')} <span class="u8l1a-sm">(3 up)</span>`, 'u8l1a-big');
        } },
        { cap: `Write it as an ordered pair, <b>${T('x')} first</b>: ${T('(-2,\\ 3)')}.`, run: async (c) => { big = await say(c, P, T(kp('(-2,\\ 3)')), 'u8l1a-huge'); S.label = G.label(sx, sy, T('(-2,\\ 3)'), { pos: 'nw', cls: 'bk-ptlab', color: PUR }); await fadeIn(c, S.label); void big; } },
        { cap: `Verify in ${T(k1('y=x+5'))}: ${T('3=-2+5')} ✓`, run: (c) => show(c, checkRow(P, E1.e1, sx, sy, BLUE)) },
        { cap: `Verify in ${T(k2('y=-2x-1'))}: ${T('3=-2(-2)-1=4-1')} ✓. On <b>both</b> lines, so ${T('(-2,\\ 3)')} is the solution.`,
          run: async (c) => { await show(c, checkRow(P, E1.e2, sx, sy, AMB)); const s = stamp(P, 'Solution (−2, 3)', { ok: true }); s.classList.add('u8l1a-pstamp'); await stampIn(c, s); } }
      ];
    }
    let Q;
    return [
      { cap: `A common slip: the coordinates swapped. Plot ${T('(3,\\ -2)')}: 3 right, 2 down.`, run: async (c) => { Q = G.point(3, -2, { color: INK, r: 9, label: T('(3,\\ -2)'), pos: 'se' }); await G.reveal(Q, c); } },
      { cap: `Check in ${T(k1('y=x+5'))}: ${T('-2\\neq 3+5')}. ✗`, run: (c) => show(c, checkRow(P, E1.e1, 3, -2, BLUE)) },
      { cap: `Check in ${T(k2('y=-2x-1'))}: ${T('-2\\neq -2(3)-1')}. ✗ It is on <b>neither</b> line.`, run: async (c) => { await show(c, checkRow(P, E1.e2, 3, -2, AMB)); const s = stamp(P, 'Not a solution', { ok: false }); s.classList.add('u8l1a-pstamp'); await stampIn(c, s); } },
      { cap: `Swap back, ${T('x')} first: ${T('(-2,\\ 3)')} is where the lines cross. ✓ ✓`, run: async (c) => {
        Q.label.innerHTML = T('(-2,\\ 3)'); P.querySelectorAll('.u8l1a-ck, .bk-stamp').forEach((e) => e.remove()); await G.move(c, Q, sx, sy, 900); Q.querySelector('circle').setAttribute('fill', PUR); Q.label.style.color = PUR;
        await show(c, line(P, `<b>${T('(-2,\\ 3)')}</b>`, 'u8l1a-big')); await show(c, checkRow(P, E1.e1, sx, sy, BLUE)); await show(c, checkRow(P, E1.e2, sx, sy, AMB));
      } }
    ];
  }
};

/* =============================== 4. oneLine: graph one line from y = mx + b =============================== */
const OL = {
  a: { label: T('2x+y=3'), std: '2x+y=3', alg: ['2x+y=3', 'y=-2x+3'], m: '-2', mf: '\\dfrac{-2}{1}', b: 3, start: [0, 3], rise: -2, run: 1, col: BLUE, eq: 'y=-2x+3', lab: [2.4, -1.9, 'e'] },
  b: { label: 'Example 2: ' + T('x-y=2'), std: 'x-y=2', alg: ['x-y=2', '-y=-x+2', 'y=x-2'], m: '1', mf: '\\dfrac{1}{1}', b: -2, start: [0, -2], rise: 1, run: 1, col: BLUE, eq: 'y=x-2', lab: [-1.5, -4.6, 'w'] },
  c: { label: 'Example 2: ' + T('3x+y=-10'), std: '3x+y=-10', alg: ['3x+y=-10', 'y=-3x-10'], m: '-3', mf: '\\dfrac{-3}{1}', b: -10, start: [-4, 2], rise: -3, run: 1, col: AMB, eq: 'y=-3x-10', lab: [-4.7, 4.6, 'e'],
    off: `${T('b=-10')} is <b>off this grid</b>. Pick an ${T('x')} instead: ${T('x=-4')} gives ${T('y=-3(-4)-10=2')}. Plot ${T('(-4,\\ 2)')}.` }
};
const oneLine = {
  title: 'Graph one line from slope–intercept form',
  height: 470,
  choices: [{ v: 'a', label: OL.a.label }, { sep: 'Example 2 check' }, { v: 'b', label: OL.b.label }, { v: 'c', label: OL.c.label }],
  intro: (k) => `Graph ${T(OL[k].std)}. First get ${T('y')} by itself. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = OL[k], kc = d.col === AMB ? k2 : k1;
    const G = new Graph(stage, { x: 14, y: 14, width: 442, height: 442, xmin: -5.5, xmax: 5.5, ymin: -6.5, ymax: 5.5 });
    const P = panel(stage, 486, 14, ex.W - 500, 442, 'Rearrange, then plot');
    const p0 = d.start, p1 = [p0[0] + d.run, p0[1] + d.rise], p2 = [p1[0] + d.run, p1[1] + d.rise];
    const hop = async (c, a, b) => {
      const mid = [a[0], b[1]];
      const v = G.segment(a, mid, { color: COLORS.slate, width: 3.5, ends: [null, 'arrow'] }), hz = G.segment(mid, b, { color: COLORS.slate, width: 3.5, ends: [null, 'arrow'] });
      await G.drawIn(v, 380, c); await fadeIn(c, G.label(a[0], (a[1] + mid[1]) / 2, T((d.rise > 0 ? '+' : '') + d.rise), { pos: 'w', cls: 'bk-ptlab u8l1a-steplab', gap: 6 }));
      await G.drawIn(hz, 300, c); await fadeIn(c, G.label((mid[0] + b[0]) / 2, mid[1], T('+' + d.run), { pos: d.rise < 0 ? 's' : 'n', cls: 'bk-ptlab u8l1a-steplab', gap: 5 }));
      await pop(c, G.point(b[0], b[1], { color: d.col, r: 7, label: T(pt(...b)), pos: 'e' }), 260);
    };
    const steps = [
      { cap: `Rearrange into slope–intercept form: ${T(kc(d.alg[d.alg.length - 1]))}.`, run: async (c) => { for (const s of d.alg) await say(c, P, T(s === d.alg[d.alg.length - 1] ? kc(s) : s), s === d.alg[d.alg.length - 1] ? 'u8l1a-big' : ''); } },
      { cap: `So ${T('m=' + d.m)} and ${T('b=' + d.b)}.`, run: (c) => say(c, P, `${T('m=' + d.mf)}, &nbsp; ${T('b=' + d.b)}`, 'u8l1a-big') },
      { cap: d.off || `Plot the ${T('y')}-intercept ${T(pt(...p0))}.`, run: async (c) => { await G.reveal(G.point(p0[0], p0[1], { color: d.col, r: 7.5, label: T(pt(...p0)), pos: p0[0] ? 'w' : 'e' }), c); if (d.off) await say(c, P, `start at ${T(pt(...p0))}`, 'u8l1a-sm'); } },
      { cap: `Slope ${T(d.mf)}: ${d.rise < 0 ? 'down' : 'up'} ${Math.abs(d.rise)}, right ${d.run} to ${T(pt(...p1))}.`, run: (c) => hop(c, p0, p1) },
      { cap: `Again: ${d.rise < 0 ? 'down' : 'up'} ${Math.abs(d.rise)}, right ${d.run} to ${T(pt(...p2))}.`, run: (c) => hop(c, p1, p2) },
      { cap: `Draw the line through the points: ${T(kc(d.eq))}.`, run: async (c) => {
        const L = G.line(p0, p1, { color: d.col, width: 4 }); G.layers.data.insertBefore(L, G.layers.data.firstChild); await G.drawIn(L, 900, c);
        await fadeIn(c, G.label(d.lab[0], d.lab[1], T(d.eq), { pos: d.lab[2], cls: 'bk-ptlab', color: d.col }));
      } }
    ];
    return steps;
  }
};

/* =============================== 5. sameY: the shortcut =============================== */
const SY = {
  bk: { label: T('y=x+1,\\ y=-2x+7'), f1: (x) => x + 1, f2: (x) => -2 * x + 7, t1: 'x+1', t2: '-2x+7', n1: 'y', n2: 'y', v: 'x', x0: 0, xs: 2, ys: 3,
    win: { xmin: -1.5, xmax: 5.5, ymin: -3.5, ymax: 9.5 }, alg: ['3x=6', 'x=2'], back: 'y=2+1=3', sol: '(2,\\ 3)', d: 1 },
  tea: { label: 'Warm-up: ' + T('80-4t=5+t'), f1: (x) => 80 - 4 * x, f2: (x) => 5 + x, t1: '80-4t', t2: '5+t', n1: 'T', n2: 'T', v: 't', x0: 0, xs: 15, ys: 20,
    win: { xmin: 0, xmax: 21, ymin: 0, ymax: 90, xstep: 1, ystep: 10, xlabels: 5, ylabels: 20, origin: true, xtitle: 't', ytitle: 'T' }, alg: ['75=5t', 't=15'], back: 'T=5+15=20', sol: '(15,\\ 20)', d: 0,
    say: 'after <b>15 min</b> both drinks are at <b>20 °C</b>' },
  ex5: { label: 'Example 5 (c) check', f1: (x) => 450 + 3 * x, f2: (x) => 9 * x, t1: '450+3n', t2: '9n', n1: 'C', n2: 'R', v: 'n', x0: 0, xs: 75, ys: 675,
    win: { xmin: 0, xmax: 125, ymin: 0, ymax: 1260, xstep: 10, ystep: 100, xlabels: 20, ylabels: 200, origin: true, xtitle: 'n', ytitle: '\\text{dollars}', pad: [18, 18, 34, 52] },
    alg: ['450=6n', 'n=75'], back: 'R=9(75)=675', sol: '(75,\\ 675)', d: 0, say: '<b>75 mugs</b> break even at <b>$675</b>' }
};
const sameY = {
  title: 'Same y at the crossing: set the expressions equal',
  height: 470,
  choices: [{ v: 'bk', label: SY.bk.label }, { v: 'tea', label: SY.tea.label }, { v: 'ex5', label: SY.ex5.label }],
  intro: (k) => `${T(k1(SY[k].n1 + '=' + SY[k].t1))} and ${T(k2(SY[k].n2 + '=' + SY[k].t2))}. Both are in the form "${T(SY[k].n1)} = …". Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SY[k], v = d.v, st = { x: d.x0 };
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 442, height: 442 }, d.win));
    G.fn(d.f1, { color: BLUE, width: 4 }); G.fn(d.f2, { color: AMB, width: 4 });
    const P = panel(stage, 486, 14, ex.W - 500, 442, `At ${T(v)} = …`);
    const sw = G.vline(d.x0, { color: COLORS.slate, width: 2.5 });
    const gap = G.curve(() => { const a = G.toPx(st.x, d.f1(st.x)), b = G.toPx(st.x, d.f2(st.x)); return { subs: [[a, b]] }; }, { color: PUR, width: 7, cap: 'butt' }, 'u8l1a-gap', G.layers.data);
    const D1 = G.point(d.x0, d.f1(d.x0), { color: BLUE, r: 7.5 }), D2 = G.point(d.x0, d.f2(d.x0), { color: AMB, r: 7.5 });
    const glab = G.label(d.x0, (d.f1(d.x0) + d.f2(d.x0)) / 2, '', { pos: 'e', cls: 'u8l1a-gaplab', gap: 10 });
    [sw, gap, D1, D2, glab].forEach((e) => (e.style.opacity = 0));
    const xr = line(P, '', 'u8l1a-xr');
    const r1 = line(P, `${T(k1(d.n1 + '=' + d.t1))} <span class="u8l1a-eqv">=</span> <b class="u8l1a-v1"></b>`, 'u8l1a-yrow');
    const r2 = line(P, `${T(k2(d.n2 + '=' + d.t2))} <span class="u8l1a-eqv">=</span> <b class="u8l1a-v2"></b>`, 'u8l1a-yrow');
    const v1 = r1.querySelector('.u8l1a-v1'), v2 = r2.querySelector('.u8l1a-v2');
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
        run: async (c) => { set(d.xs); S = G.point(d.xs, d.ys, { color: PUR, r: 9 }); await G.reveal(S, c); await pulse(c, S, 1.5); r1.classList.add('u8l1a-hl'); r2.classList.add('u8l1a-hl'); } },
      { cap: `So set the two expressions <b>equal</b>: ${T(k1(d.t1) + '=' + k2(d.t2))}.`, run: (c) => say(c, P, T(k1(d.t1) + '=' + k2(d.t2)), 'u8l1a-big u8l1a-alg') },
      { cap: `Solve: ${T(d.alg.join('\\ \\Rightarrow\\ '))}.`, run: async (c) => { for (const s of d.alg) await say(c, P, T(s), 'u8l1a-alg'); } },
      { cap: `Substitute back: ${T(d.back)}. The solution is ${T(d.sol)}${d.say ? ': ' + d.say : ''}.`,
        run: async (c) => { await say(c, P, T(d.back), 'u8l1a-alg'); S.label = G.label(d.xs, d.ys, T(d.sol), { pos: 'ne', cls: 'bk-ptlab', color: PUR }); await fadeIn(c, S.label); const s = stamp(P, d.sol.replace('\\ ', ' ').replace(/-/g, '−'), { ok: true }); s.classList.add('u8l1a-pstamp'); await stampIn(c, s); } }
    ];
  }
};

/* =============================== 6. byHand: Example 2 =============================== */
const E2 = { e1: STD(1, -1, 2, 'x-y=2'), e2: STD(3, 1, -10, '3x+y=-10'), sol: [-2, -4], xs: [-4, -3, -2, -1] };
const byHand = {
  title: 'Example 2 check: graph both, read, verify',
  height: 480,
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
      const s = stamp(P, 'Solution (−2, −4)', { ok: true }); s.classList.add('u8l1a-pstamp'); await stampIn(c, s);
    };
    const cross = async (c) => { const S = G.point(sx, sy, { color: PUR, r: 9, label: T(pt(sx, sy)), pos: 'se', labelColor: PUR }); await G.reveal(S, c); await pulse(c, S, 1.5); };
    if (k === 'si') {
      const P = panel(stage, x0, 14, W, 452, 'Rearrange, graph, check');
      const pts = async (c, ps, col) => { for (const p of ps) await pop(c, G.point(p[0], p[1], { color: col, r: 7 }), 220); };
      return [
        { cap: `Rearrange each equation for ${T('y')}.`, run: async (c) => { await say(c, P, T(k1('x-y=2\\Rightarrow y=x-2'))); await say(c, P, T(k2('3x+y=-10\\Rightarrow y=-3x-10'))); } },
        { cap: `Blue: start at ${T('(0,\\ -2)')}, then up 1, right 1: ${T('(1,\\ -1)')}, ${T('(2,\\ 0)')}.`, run: async (c) => { await pts(c, [[0, -2], [1, -1], [2, 0]], BLUE); await drawL(c, E2.e1, BLUE, LAB1); } },
        { cap: `Amber: ${T('b=-10')} is off the grid. ${T('x=-4')} gives ${T('y=2')}: start at ${T('(-4,\\ 2)')}, then down 3, right 1.`, run: async (c) => { await pts(c, [[-4, 2], [-3, -1], [-2, -4]], AMB); await drawL(c, E2.e2, AMB, LAB2); } },
        { cap: `The lines cross at ${T('(-2,\\ -4)')}.`, run: async (c) => { await cross(c); await say(c, P, `Crossing: ${T(kp('(-2,\\ -4)'))}`, 'u8l1a-big'); } },
        { cap: `Verify in <b>both original</b> equations: ✓ and ✓. The solution is ${T('x=-2,\\ y=-4')}.`, run: (c) => verify(c, P) }
      ];
    }
    // tables of values
    const cw = 62, tw = cw * 2, gx = (W - 2 * tw) / 3;
    const hd1 = add(stage, h('div', 'u8l1a-thd', T(k1('y=x-2'))), x0, 10), hd2 = add(stage, h('div', 'u8l1a-thd', T(k2('y=-3x-10'))), x0 + W / 2, 10);
    hd1.style.width = hd2.style.width = W / 2 + 'px';
    const tb1 = new ValueTable(stage, { x: x0 + gx, y: 46, headers: ['x', 'y'], rows: E2.xs.map((x) => [x, f1(x)]), hide: 1, tap: false, cellW: cw, cellH: 38, cls: 'u8l1a-vt u8l1a-vt1' });
    const tb2 = new ValueTable(stage, { x: x0 + 2 * gx + tw, y: 46, headers: ['x', 'y'], rows: E2.xs.map((x) => [x, f2(x)]), hide: 1, tap: false, cellW: cw, cellH: 38, cls: 'u8l1a-vt u8l1a-vt2' });
    const P = panel(stage, x0, 250, W, 216, 'Check in both');
    const fillPlot = async (c, tb, f, col) => { for (let i = 0; i < E2.xs.length; i++) { await tb.reveal(i, 1, c); await pop(c, G.point(E2.xs[i], f(E2.xs[i]), { color: col, r: 7 }), 200); } };
    return [
      { cap: `Rearrange: ${T(k1('y=x-2'))} and ${T(k2('y=-3x-10'))}. Pick the same ${T('x')}-values for both tables: ${T('-4,\\ -3,\\ -2,\\ -1')}.`, run: async (c) => { await pulse(c, tb1.el, 1.04); await pulse(c, tb2.el, 1.04); } },
      { cap: `Blue: ${T('y=x-2')} gives ${T('-6,\\ -5,\\ -4,\\ -3')}. Plot and join.`, run: async (c) => { await fillPlot(c, tb1, f1, BLUE); await drawL(c, E2.e1, BLUE, LAB1); } },
      { cap: `Amber: ${T('y=-3x-10')} gives ${T('2,\\ -1,\\ -4,\\ -7')}. Plot and join.`, run: async (c) => { await fillPlot(c, tb2, f2, AMB); await drawL(c, E2.e2, AMB, LAB2); } },
      { cap: `The row ${T('x=-2')} gives ${T('y=-4')} in <b>both</b> tables: the same point is on both lines.`, run: async (c) => { tb1.highlight(2, true, 'u8l1a-hlp'); tb2.highlight(2, true, 'u8l1a-hlp'); await cross(c); } },
      { cap: `Verify ${T('(-2,\\ -4)')} in <b>both original</b> equations: ✓ and ✓.`, run: (c) => verify(c, P, false) }
    ];
  }
};

/* =============================== 7. tickets: Example 3 =============================== */
const E3 = { e1: STD(2, 1, 9, '2x+y=9'), e2: STD(1, 3, 7, 'x+3y=7') };
const tickets = {
  title: 'Example 3 check: two families, two ticket prices',
  height: 480,
  intro: `Two unknowns: ${T('x')} = adult fee, ${T('y')} = child fee (dollars). Two conditions: one for each family. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 14, y: 14, width: 452, height: 452, xmin: 0, xmax: 10.5, ymin: 0, ymax: 10.5, xlabels: 2, ylabels: 2, origin: true });
    const P = panel(stage, 494, 14, ex.W - 508, 452, 'The story');
    const fam = (name, a, ch, cost, eq, col) => {
      const r = h('div', 'u8l1a-fam', `<div class="u8l1a-fn" style="color:${col}">${name}</div><div class="u8l1a-tix"></div><div class="u8l1a-feq"></div>`);
      const tx = r.querySelector('.u8l1a-tix');
      const tk = []; for (let i = 0; i < a; i++) tk.push(add(tx, h('div', 'u8l1a-tk u8l1a-tka', `<small>adult</small><b>${T('x')}</b>`)));
      for (let i = 0; i < ch; i++) tk.push(add(tx, h('div', 'u8l1a-tk u8l1a-tkc', `<small>child</small><b>${T('y')}</b>`)));
      add(tx, h('div', 'u8l1a-tsum', `= $${cost}`));
      r.querySelector('.u8l1a-feq').innerHTML = T((col === AMB ? k2 : k1)(eq)); r.style.opacity = 0; P.appendChild(r);
      return { r, tk, a, ch, sum: tx.querySelector('.u8l1a-tsum'), eq: r.querySelector('.u8l1a-feq') };
    };
    const A = fam('Alvarez', 2, 1, 9, '2x+y=9', BLUE), B = fam('Bennett', 1, 3, 7, 'x+3y=7', AMB);
    const famIn = async (c, F) => { F.r.style.opacity = 1; for (const t of F.tk) await pop(c, t, 220); await fadeIn(c, F.sum); await fadeIn(c, F.eq); };
    const pts = async (c, ps, col) => { for (const p of ps) await G.reveal(G.point(p[0], p[1], { color: col, r: 7, label: T(pt(...p)), pos: p[1] === 0 ? (p[0] < 5 ? 'e' : 'ne') : 'ne' }), c, 260); };
    const meaning = line(P, '', 'u8l1a-big u8l1a-mean'); meaning.style.opacity = 0;
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
        for (const F of [A, B]) { F.tk.forEach((t, i) => { t.querySelector('b').innerHTML = i < F.a ? '$4' : '$1'; t.classList.add('u8l1a-paid'); }); F.sum.innerHTML += ' ✓'; await pulse(c, F.r, 1.03); }
        meaning.innerHTML = `Adult <b>$4</b>, child <b>$1</b>`; await show(c, meaning);
      } }
    ];
  }
};

/* =============================== 8. ti84: the graphing calculator =============================== */
class Calc extends Graph {
  constructor(host, o = {}) { super(host, Object.assign({ theme: 'calc' }, o)); }
  get dx() { return (this.win.xmax - this.win.xmin) / 94; } // one pixel column of the TI-84 screen
  get mid() { return (this.win.xmin + this.win.xmax) / 2; } // the cursor starts in the middle column
}
const M = (s) => String(s).replace(/-/g, '−');
const inv = (s) => `<b class="u8l1a-inv">${s}</b>`;
function lcd(host) {
  const d = h('div', 'u8l1a-lcd'); d.style.display = 'none'; host.appendChild(d);
  return {
    el: d,
    show(lines, cls = '') { d.className = 'u8l1a-lcd ' + cls; d.innerHTML = lines.map((l) => (typeof l === 'object' ? `<div class="u8l1a-ln ${l.cls || ''}">${l.t}</div>` : `<div class="u8l1a-ln">${l}</div>`)).join(''); d.style.display = ''; return d; },
    hide() { d.style.display = 'none'; },
    ln(i) { return d.children[i]; }
  };
}
function hud(G) {
  const tl = h('div', 'u8l1a-ceq'), bl = h('div', 'u8l1a-cbot'); tl.style.display = bl.style.display = 'none'; G.el.append(tl, bl);
  return {
    eq(s) { tl.innerHTML = s ? M(s) : ''; tl.style.display = s ? '' : 'none'; },
    bot(title, xy) {
      if (!title && !xy) { bl.style.display = 'none'; return; }
      bl.innerHTML = (title ? `<div class="u8l1a-cbt">${title}</div>` : '') + (xy ? `<div class="u8l1a-cxy"><i>X=${calcNum(xy.x)}</i><i>Y=${calcNum(xy.y)}</i></div>` : '');
      bl.style.display = '';
    },
    el: bl
  };
}
class Keys {
  constructor(stage, x, y, w) { this.el = add(stage, box(h('div', 'u8l1a-keys'), w, 50), x, y); this.clear(); }
  clear() { this.el.innerHTML = '<b class="u8l1a-kl">Keys</b>'; }
  async set(c, ks) { this.clear(); for (const k of ks) { const e = h('kbd', k === '2nd' ? 'u8l1a-k2' : '', k); this.el.appendChild(e); await pop(c, e, 220); await sleep(c, 110); } }
}
const MENUS = {
  calc: { tabs: ['CALCULATE'], items: ['value', 'zero', 'minimum', 'maximum', 'intersect', 'dy/dx', '∫f(x)dx'] },
  zoom: { tabs: ['ZOOM', 'MEMORY'], items: ['ZBox', 'Zoom In', 'Zoom Out', 'ZDecimal', 'ZSquare', 'ZStandard', 'ZTrig', 'ZInteger', 'ZoomStat', 'ZoomFit'] }
};
function menuLines(m, sel) {
  const n = m.items.length, first = Math.max(0, Math.min(sel - 6, n - 7)), rows = [m.tabs.map((t, i) => (i ? t : inv(t))).join('  ')];
  for (let i = first; i < Math.min(n, first + 7); i++) { const more = i === first + 6 && n > first + 7, lab = String((i + 1) % 10) + (more ? '↓' : ':'); rows.push((i === sel ? inv(lab) : lab) + m.items[i]); }
  return rows;
}
async function pick(c, L, key, sel) { const m = MENUS[key]; L.show(menuLines(m, 0), 'u8l1a-menu'); for (let i = 1; i <= sel; i++) { await sleep(c, 150); L.show(menuLines(m, i), 'u8l1a-menu'); } await sleep(c, 450); }
const yEditor = (ys) => ['Plot1 Plot2 Plot3', ...[1, 2, 3, 4, 5, 6, 7].map((i) => ({ t: `Y${i}=${M(ys[i - 1] || '')}`, cls: i === 1 ? 'u8l1a-y1' : i === 2 ? 'u8l1a-y2' : '' }))];
const winLines = (w) => ['WINDOW', ...[['Xmin', w.xmin], ['Xmax', w.xmax], ['Xscl', w.xscl], ['Ymin', w.ymin], ['Ymax', w.ymax], ['Yscl', w.yscl], ['Xres', 1]].map(([k, v]) => `${k}=${M(v)}`)];
const STDW = { xmin: -10, xmax: 10, xscl: 1, ymin: -10, ymax: 10, yscl: 1 };
const wTex = (w) => `x{:}\\,[${w.xmin},${w.xmax},${w.xscl}],\\ y{:}\\,[${w.ymin},${w.ymax},${w.yscl}]`;
const TI = {
  bk: { label: T('y=x+1,\\ y=-2x+7'), y1: 'X+1', y2: '-2X+7', f1: (x) => x + 1, f2: (x) => -2 * x + 7, win: STDW, zoom: true, sol: [2, 3],
    solve: [`Both are already solved for ${T('y')}: ${T(k1('y=x+1'))}, ${T(k2('y=-2x+7'))}.`], ver: [YF(1, 1, 'y=x+1'), YF(-2, 7, 'y=-2x+7')] },
  ex4: { label: 'Example 4 check', y1: '(-4/3)X+2/3', y2: '2X-5', f1: (x) => -4 / 3 * x + 2 / 3, f2: (x) => 2 * x - 5, win: STDW, zoom: true, sol: [1.7, -1.6],
    solve: [T(k1('4x+3y=2\\Rightarrow y=-\\tfrac43x+\\tfrac23')), T(k2('2x-y=5\\Rightarrow y=2x-5'))], ver: [STD(4, 3, 2, '4x+3y=2'), STD(2, -1, 5, '2x-y=5')] },
  ex5: { label: 'Example 5 check', y1: '450+3X', y2: '9X', f1: (x) => 450 + 3 * x, f2: (x) => 9 * x, win: { xmin: 0, xmax: 120, xscl: 10, ymin: 0, ymax: 1200, yscl: 100 }, zoom: false, sol: [75, 675],
    solve: [`Already “dollars = …”: ${T(k1('C=450+3n'))}, ${T(k2('R=9n'))}. Use ${T('X')} for ${T('n')}.`], ver: [YF(3, 450, 'C=450+3n', { bFirst: true }), YF(9, 0, 'R=9n')] }
};
const ti84 = {
  title: 'TI-84: Y=, WINDOW, GRAPH, then 2nd CALC 5:intersect',
  height: 450,
  choices: [{ v: 'bk', label: TI.bk.label }, { sep: 'Check' }, { v: 'ex4', label: TI.ex4.label }, { v: 'ex5', label: TI.ex5.label }],
  intro: 'Graphing calculator (TI-83/84) keystrokes. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = TI[k], [sx, sy] = d.sol;
    const G = new Calc(stage, Object.assign({ x: 26, y: 26, width: 500, height: 330 }, STDW));
    const L = lcd(G.el), H = hud(G), K = new Keys(stage, 16, 384, 530);
    const P = panel(stage, 572, 14, ex.W - 586, 422, 'On paper');
    const kk = (...ks) => ks.map((s) => `<kbd${s === '2nd' ? ' class="u8l1a-k2"' : ''}>${s}</kbd>`).join(' ');
    let tr;
    const cursor = (f, x, title) => {
      const t = G.traceMarker(f, x, { readout: false });
      t.title = title; t.show = () => H.bot(t.title, { x: t.x, y: t.y }); t.show();
      t.glide = (c, x2, ms = 900) => { const a = t.x; return tween(c, ms, (u) => { t.set(a + (x2 - a) * u); t.show(); }); };
      return t;
    };
    const snap = (x) => G.mid + Math.round((x - G.mid) / G.dx) * G.dx;
    const steps = [
      { cap: `<b>Step 1:</b> solve each equation for ${T('y')}.`, run: async (c) => { for (const s of d.solve) await say(c, P, s, 'u8l1a-sm2'); } },
      { cap: `${kk('Y=')}: one equation in <b>Y1</b>, the other in <b>Y2</b>.`, run: async (c) => { await K.set(c, ['Y=']); L.show(yEditor([d.y1, d.y2])); await pulse(c, L.ln(1), 1.05); await pulse(c, L.ln(2), 1.05); } }
    ];
    if (d.zoom) {
      steps.push({ cap: `${kk('ZOOM')} <b>6:ZStandard</b> sets the standard window ${T(wTex(STDW))} and graphs both lines.`,
        run: async (c) => { await K.set(c, ['ZOOM', '6']); await pick(c, L, 'zoom', 5); L.hide(); await G.drawIn(G.fn(d.f1, { color: BLUE }), 600, c); await G.drawIn(G.fn(d.f2, { color: AMB }), 600, c); } });
    } else {
      steps.push({ cap: `${kk('WINDOW')}: ${T(wTex(d.win))}, so the crossing point is on the screen.`, run: async (c) => { await K.set(c, ['WINDOW']); L.show(winLines(d.win)); await sleep(c, 300); } });
      steps.push({ cap: `${kk('GRAPH')}: both lines.`, run: async (c) => { await K.set(c, ['GRAPH']); L.hide(); await G.setWindow(d.win, c, 900); await G.drawIn(G.fn(d.f1, { color: BLUE }), 600, c); await G.drawIn(G.fn(d.f2, { color: AMB }), 600, c); } });
    }
    steps.push(
      { cap: `${kk('2nd', 'TRACE')} opens CALC; choose <b>5:intersect</b>.`, run: async (c) => { await K.set(c, ['2nd', 'TRACE', '5']); await pick(c, L, 'calc', 4); L.hide(); } },
      { cap: `<b>First curve?</b> The cursor is on Y1: ${kk('ENTER')}.`, run: async (c) => { await K.set(c, ['ENTER']); H.eq('Y1=' + d.y1); tr = cursor(d.f1, G.mid, 'First curve?'); await pop(c, tr.el); } },
      { cap: `<b>Second curve?</b> It jumps to Y2: ${kk('ENTER')}.`, run: async (c) => { await K.set(c, ['ENTER']); tr.remove(); H.eq('Y2=' + d.y2); tr = cursor(d.f2, G.mid, 'Second curve?'); await pop(c, tr.el); } },
      { cap: `<b>Guess?</b> Move close to the crossing with ${kk('◀')} ${kk('▶')}, then ${kk('ENTER')}.`, run: async (c) => { await K.set(c, ['◀', '▶', 'ENTER']); tr.title = 'Guess?'; await tr.glide(c, snap(sx + 4 * G.dx), 1000); } },
      { cap: `<b>Intersection</b> X = ${M(calcNum(sx))}, Y = ${M(calcNum(sy))}. The solution is ${T(pt(sx, sy))}. Verify by substituting into the <b>original</b> equations.`,
        run: async (c) => {
          tr.remove(); H.eq(null); await G.reveal(G.point(sx, sy, { color: PUR, r: 7 }), c); H.bot('Intersection', { x: sx, y: sy }); await pulse(c, H.el, 1.1);
          await say(c, P, `Solution ${T(kp(pt(sx, sy)))}`, 'u8l1a-big');
          await show(c, checkRow(P, d.ver[0], sx, sy, BLUE)); await show(c, checkRow(P, d.ver[1], sx, sy, AMB));
        } }
    );
    return steps;
  }
};
function mountTiFigure() {
  const host = document.getElementById('u8l1a-tiscreen'); if (!host) return;
  const G = new Calc(host, Object.assign({ width: 330, height: 220 }, STDW));
  G.el.classList.add('u8l1a-tistat');
  G.fn((x) => x + 1, { color: BLUE }); G.fn((x) => -2 * x + 7, { color: AMB });
  const t = G.traceMarker((x) => x + 1, 2, { readout: false }); void t;
  const H = hud(G); H.bot('Intersection', { x: 2, y: 3 });
}

/* =============================== 9. zoomIn: Example 4 (d) =============================== */
const E4 = { e1: STD(4, 3, 2, '4x+3y=2'), e2: STD(2, -1, 5, '2x-y=5'), sol: [1.7, -1.6], guess: [2, -2] };
const zoomIn = {
  title: 'Example 4 check: a guess by eye, then zoom in',
  height: 470,
  intro: `${T(k1('4x+3y=2'))} and ${T(k2('2x-y=5'))}, graphed by hand. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 14, y: 14, width: 442, height: 442, xmin: -2.5, xmax: 4.5, ymin: -5.5, ymax: 1.5 });
    const P = panel(stage, 486, 14, ex.W - 500, 442, 'Check the guess');
    const [gx, gy] = E4.guess, [sx, sy] = E4.sol;
    let Q, ring;
    return [
      { cap: `Both lines by hand. They cross <b>between</b> grid lines.`, run: async (c) => {
        await G.drawIn(eqLine(G, E4.e1, { color: BLUE, width: 4 }), 700, c); await G.drawIn(eqLine(G, E4.e2, { color: AMB, width: 4 }), 700, c);
        await fadeIn(c, G.label(3.3, -3.3, T('4x+3y=2'), { pos: 'ne', cls: 'bk-ptlab', color: BLUE }));
        await fadeIn(c, G.label(2.55, 0.6, T('2x-y=5'), { pos: 'w', cls: 'bk-ptlab', color: AMB }));
        const [px, py] = G.toPx(sx, sy); ring = svgEl('circle', { cx: px, cy: py, r: 34, class: 'u8l1a-ring' }, G.layers.top); await pop(c, ring, 400);
      } },
      { cap: `A guess by eye: ${T('(2,\\ -2)')}?`, run: async (c) => { Q = G.point(gx, gy, { color: INK, r: 7, label: T('(2,\\ -2)'), pos: 'se' }); await G.reveal(Q, c); } },
      { cap: `Check in ${T(k1('4x+3y=2'))}: ${T('4(2)+3(-2)=2')} ✓. It is on the blue line…`, run: (c) => show(c, checkRow(P, E4.e1, gx, gy, BLUE)) },
      { cap: `…but in ${T(k2('2x-y=5'))}: ${T('2(2)-(-2)=6\\neq5')} ✗. Not on the amber line, so ${T('(2,\\ -2)')} is <b>not</b> the solution.`,
        run: async (c) => { await show(c, checkRow(P, E4.e2, gx, gy, AMB)); const s = stamp(P, 'Not a solution', { ok: false }); s.classList.add('u8l1a-pstamp'); await stampIn(c, s); } },
      { cap: `Zoom in: the lines really cross at ${T('x=1.7')}, ${T('y=-1.6')}, between the grid lines.`, run: async (c) => {
        ring.remove(); await G.setWindow({ xmin: 1.25, xmax: 2.25, ymin: -2.1, ymax: -1.1, xstep: 0.1, ystep: 0.1 }, c, 1400);
        const S = G.point(sx, sy, { color: PUR, r: 9, label: T('(1.7,\\ -1.6)'), pos: 'nw', labelColor: PUR }); await G.reveal(S, c); await pulse(c, S, 1.4);
      } },
      { cap: `${T('(1.7,\\ -1.6)')} checks in <b>both</b>. Hard to read from a hand-drawn graph: the calculator’s <b>5:intersect</b> finds it.`, run: async (c) => {
        P.querySelectorAll('.u8l1a-line, .bk-stamp').forEach((e) => e.remove());
        await say(c, P, `${T(kp('(1.7,\\ -1.6)'))}`, 'u8l1a-big'); await show(c, checkRow(P, E4.e1, sx, sy, BLUE)); await show(c, checkRow(P, E4.e2, sx, sy, AMB));
      } }
    ];
  }
};

/* =============================== 10. breakEven: Example 5 =============================== */
const C5 = (n) => 450 + 3 * n, R5 = (n) => 9 * n;
const BEW = { xmin: 0, xmax: 125, ymin: 0, ymax: 1260, xstep: 10, ystep: 100, xlabels: 20, ylabels: 200, origin: true, xtitle: 'n', ytitle: '\\text{dollars}', fontSize: 16, pad: [18, 22, 34, 54] };
const breakEven = {
  title: 'Example 5 check: cost, revenue and the gap between them',
  height: 480,
  choices: [{ v: 'b', label: '(b) 30 and 90 mugs' }, { v: 'ce', label: '(c)–(e) break-even' }, { v: 'f', label: '(f) 250 mugs' }],
  intro: `Cost ${T(k1('C=450+3n'))} and revenue ${T(k2('R=9n'))}, in dollars, for ${T('n')} mugs. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 500, height: 452 }, BEW));
    const P = panel(stage, 534, 14, ex.W - 548, 452, k === 'ce' ? 'Profit or loss?' : 'Profit = revenue − cost');
    const st = { n: 0 };
    const vl = G.vline(0, { color: COLORS.slate, width: 2.5 });
    const gap = G.curve(() => { const a = G.toPx(st.n, C5(st.n)), b = G.toPx(st.n, R5(st.n)); return { subs: [[a, b]] }; }, { color: RED, width: 8, cap: 'butt' }, 'u8l1a-gap', G.layers.data);
    const Dc = G.point(0, C5(0), { color: BLUE, r: 7.5 }), Dr = G.point(0, R5(0), { color: AMB, r: 7.5 });
    const glab = G.label(0, 0, '', { pos: k === 'f' ? 'w' : 'e', cls: 'u8l1a-gaplab', gap: 10 });
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
        await say(c, P, `${T('n=' + n)}: cost ${T(k1(`450+3(${n})=${C5(n)}`))}`, 'u8l1a-sm2');
        await say(c, P, `revenue ${T(k2(`9(${n})=${R5(n)}`))}`, 'u8l1a-sm2');
      }
    };
    const verdict = async (c, n) => {
      const p = R5(n) - C5(n);
      await say(c, P, `${T(`${R5(n)}-${C5(n)}=${p}`)}: a <b class="${p > 0 ? 'u8l1a-okc' : 'u8l1a-noc'}">${p > 0 ? 'profit' : 'loss'} of $${Math.abs(p)}</b>`, 'u8l1a-big2');
    };
    const base = [
      { cap: `Cost ${T(k1('C=450+3n'))} starts at <b>$450</b> (the setup cost) and rises $3 a mug.`, run: lines },
      { cap: `Revenue ${T(k2('R=9n'))} starts at <b>$0</b> and rises $9 a mug.`, run: rev }
    ];
    if (k === 'b') return base.concat([
      { cap: `${T('n=30')}: cost ${T('450+3(30)=540')}, revenue ${T('9(30)=270')}.`, run: (c) => at(c, 30) },
      { cap: `Cost is on top: ${T('270-540=-270')}, a <b>loss of $270</b>.`, run: (c) => verdict(c, 30) },
      { cap: `${T('n=90')}: cost ${T('450+3(90)=720')}, revenue ${T('9(90)=810')}.`, run: (c) => at(c, 90) },
      { cap: `Revenue is on top: ${T('810-720=90')}, a <b>profit of $90</b>.`, run: (c) => verdict(c, 90) }
    ]);
    if (k === 'ce') {
      let S;
      return base.concat([
        { cap: `Slide ${T('n')} up from 0: the cost line is on top (a <b>loss</b>), and the gap shrinks.`, run: async (c) => { await at(c, 0, false); await tween(c, 2600, (t) => setN(70 * t)); } },
        { cap: `At ${T('n=75')} the gap is 0: cost = revenue = $675. The <b>break-even point</b> is ${T('(75,\\ 675)')}.`, run: async (c) => {
          await tween(c, 500, (t) => setN(70 + 5 * t)); setN(75);
          S = G.point(75, 675, { color: PUR, r: 9, label: T('(75,\\ 675)'), pos: 'nw', labelColor: PUR }); await G.reveal(S, c); await pulse(c, S, 1.5);
          await say(c, P, `break-even ${T(kp('(75,\\ 675)'))}`, 'u8l1a-big2');
        } },
        { cap: `Algebra agrees: ${T('450+3n=9n\\Rightarrow 450=6n\\Rightarrow n=75')}.`, run: async (c) => { await say(c, P, T(k1('450+3n') + '=' + k2('9n')), 'u8l1a-alg'); await say(c, P, T('450=6n'), 'u8l1a-alg'); await say(c, P, T('n=75'), 'u8l1a-alg'); } },
        { cap: `Left of 75 the cost line is higher: <b>loss</b>. Right of 75 the revenue line is higher: <b>profit</b> (shaded green).`, run: async (c) => {
          live.forEach((e) => (e.style.opacity = 0));
          const lo = G.polyline([[0, 450], [75, 675], [0, 0]], { closed: true, fill: 'gray', fillOpacity: 0.22, color: 'gray', width: 0.1 });
          const hi = G.polyline([[75, 675], [125, 1125], [125, 825]], { closed: true, fill: 'green', fillOpacity: 0.25, color: 'green', width: 0.1 });
          await fadeIn(c, lo, 500); await fadeIn(c, G.label(24, 380, 'loss', { cls: 'u8l1a-rlab', color: 'slate' }));
          await fadeIn(c, hi, 500); await fadeIn(c, G.label(108, 920, 'profit', { cls: 'u8l1a-rlab', color: 'green' }));
        } }
      ]);
    }
    return base.concat([
      { cap: `250 mugs is off this grid. Zoom out to ${T('n')} up to 260 and $2400.`, run: (c) => { G.o.xlabels = 40; G.o.ylabels = 400; return G.setWindow({ xmin: 0, xmax: 260, ymin: 0, ymax: 2450, xstep: 20, ystep: 200 }, c, 1300); } },
      { cap: `${T('n=250')}: cost ${T('450+3(250)=1200')}, revenue ${T('9(250)=2250')}.`, run: (c) => at(c, 250) },
      { cap: `Revenue is on top: profit ${T('=2250-1200=1050')}. The club makes <b>$1050</b>.`, run: async (c) => { await verdict(c, 250); const s = stamp(P, 'Profit $1050', { ok: true }); s.classList.add('u8l1a-pstamp'); await stampIn(c, s); } }
    ]);
  }
};

/* =============================== mount =============================== */
mountWarm();
mountTiFigure();
export const explainers = mountExplainers({ onePair, dragLab, readGraph, oneLine, sameY, byHand, tickets, ti84, zoomIn, breakEven });
export const _test = { STD, YF, chk, OP, DL, OL, SY, TI, E1, E2, E3, E4 };
