/* Math 10C · Unit 8 · Lesson 1B — Classifying Systems: How Many Solutions?
 * Warm-up "Head Start" (three races on a track with a clock), Example 1 grids whose answer lines appear on the same grid,
 * and the explainers:
 *   turnSlide (the star: the amber line turns until it is parallel, then slides until it lies on top, with the solution
 *   count, the slope/intercept comparison and the classification chart lighting up live), races (the warm-up races as
 *   distance–time lines), ex1 (Example 1 check: graph and count), gap (the vertical gap between the lines as x moves),
 *   chart (Example 2 check: filling the chart from Example 1), rearr (getting y alone), classify (Example 3 check with a
 *   two-question flowchart), disguise (the same line written two ways: test points, then the algebra).
 * Colours: line 1 / first equation brand blue, line 2 / second equation amber, solutions purple. */
import {
  h, tex, add, box, place, Graph, ValueTable, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, sleep,
  tween, texNum, liveCtx, pulse, shake, COLORS
} from '../blocks.js';

const T = (s) => tex(String(s));
const BL = COLORS.blue, AM = COLORS.amber, PU = COLORS.purple, GR = COLORS.green, RD = COLORS.red, SL = COLORS.slate;
const c1 = (s) => `\\textcolor{${BL}}{${s}}`, c2 = (s) => `\\textcolor{${AM}}{${s}}`, cP = (s) => `\\textcolor{${PU}}{${s}}`;
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u8l1b-panel ' + cls, title ? `<div class="u8l1b-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u8l1b-line ' + cls, html); p.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const hideAll = (...els) => els.flat().forEach((e) => { if (e) e.style.opacity = 0; });
const put = (el, html) => { if (el._h !== html) { el._h = html; el.innerHTML = html; } };
const d1 = (v) => texNum(v, 1), d2 = (v) => texNum(v, 2);
const pm = (v) => String(v).replace('-', '−');
const KIND = {
  one: { n: '1', word: 'one solution', cls: 'u8l1b-k-one' },
  none: { n: '0', word: 'no solution', cls: 'u8l1b-k-none' },
  inf: { n: T('\\infty'), word: 'infinitely many', cls: 'u8l1b-k-inf' }
};
const verdict = (host, kind, x, y, extra = '') => {
  const k = KIND[kind], v = h('div', 'u8l1b-verdict ' + k.cls, `<span class="u8l1b-vn">${k.n}</span><span class="u8l1b-vw">${k.word}${extra}</span>`);
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
  if (o.label) { lab = G.label(o.label[0], o.label[1], T(o.label[3]), { cls: 'bk-ptlab u8l1b-glab', color, pos: o.label[2] || 'e' }); await fadeIn(c, lab); }
  return { L, P0, lab };
}

/* =============================== warm-up: head start =============================== */
const RACES = [
  { n: 'Race 1', A: { n: 'Rosa', i: 'R', f: (t) => 30 + 4 * t }, B: { n: 'Max', i: 'M', f: (t) => 6 * t },
    rule: '<b class="u8l1b-c1">Rosa</b>: <b>30 m</b> head start, runs <b>4 m/s</b><br><b class="u8l1b-c2">Max</b>: no head start, runs <b>6 m/s</b>' },
  { n: 'Race 2', A: { n: 'Lee', i: 'L', f: (t) => 20 + 5 * t }, B: { n: 'Ana', i: 'A', f: (t) => 5 * t },
    rule: '<b class="u8l1b-c1">Lee</b>: <b>20 m</b> head start, runs <b>5 m/s</b><br><b class="u8l1b-c2">Ana</b>: no head start, runs <b>5 m/s</b>' },
  { n: 'Race 3', A: { n: 'Kai', i: 'K', f: (t) => 10 + 3 * t }, B: { n: 'Jo', i: 'J', f: (t) => 2 * (5 + 1.5 * t), mystery: true },
    rule: `<b class="u8l1b-c1">Kai</b>: <b>10 m</b> head start, runs <b>3 m/s</b><br><b class="u8l1b-c2">Jo</b>’s coach: after ${T('t')} s, Jo is at ${T('2(5+1.5t)')} m` }
];
function mountWarm() {
  const host = document.getElementById('u8l1b-races'); if (!host) return;
  const scale = h('div', 'u8l1b-scale'); host.appendChild(scale);
  scale.innerHTML = '<div></div><div class="u8l1b-scl">' + [0, 50, 100, 150, 200].map((m) => `<i style="left:${m / 2}%">${m} m</i>`).join('') + '</div><div></div>';
  const rows = RACES.map((r) => {
    const row = h('div', 'u8l1b-race', `<div class="u8l1b-rn">${r.n}</div><div class="u8l1b-track"><div class="u8l1b-lane"></div><div class="u8l1b-lane"></div><div class="u8l1b-start"></div><div class="u8l1b-fin">FINISH</div><div class="u8l1b-meet"></div></div><div class="u8l1b-rule">${r.rule}<div class="u8l1b-pos"></div></div>`);
    host.appendChild(row);
    const tr = row.querySelector('.u8l1b-track');
    const tok = (who, lane, cls) => { const t = h('div', 'u8l1b-tok ' + cls, who.i); t.style.top = (lane ? 66 : 22) + '%'; tr.appendChild(t); return t; };
    return { r, row, a: tok(r.A, 0, 'u8l1b-ta'), b: tok(r.B, 1, 'u8l1b-tb'), pos: row.querySelector('.u8l1b-pos'), meet: row.querySelector('.u8l1b-meet') };
  });
  const clockV = document.getElementById('u8l1b-clockv');
  let T0 = 0, started = false;
  const at = (d) => `calc(22px + (100% - 44px) * ${(Math.min(200, d) / 200).toFixed(4)})`;
  const setT = (t) => {
    T0 = t; clockV.textContent = (Math.round(t * 10) / 10) + ' s';
    rows.forEach((o) => {
      const dA = Math.min(200, o.r.A.f(t)), dB = Math.min(200, o.r.B.f(t)), myst = o.r.B.mystery && !started;
      o.a.style.left = at(dA); o.b.style.left = myst ? '0%' : at(dB);
      o.b.textContent = myst ? '?' : o.r.B.i; o.b.classList.toggle('u8l1b-myst', myst);
      const side = !myst && Math.abs(dA - dB) < 0.6 && dA < 200;
      o.row.classList.toggle('u8l1b-side', side);
      put(o.pos, myst ? `${o.r.A.n} ${pm(Math.round(dA * 10) / 10)} m · ${o.r.B.n} ?` : `${o.r.A.n} ${Math.round(dA * 10) / 10} m · ${o.r.B.n} ${Math.round(dB * 10) / 10} m` + (side ? ' · <b>side by side!</b>' : ''));
      if (o.r.n === 'Race 1') { const met = t >= 15; o.meet.style.display = met ? 'block' : 'none'; o.meet.style.left = at(90); o.meet.textContent = 'level at 15 s'; }
    });
  };
  setT(0);
  let gen = 0;
  const go = async (t1, ms) => { const g = ++gen, c = liveCtx(), t0 = T0; started = true; await tween(c, ms, (u) => { if (g !== gen) return false; setT(t0 + (t1 - t0) * u); }, (u) => u); };
  document.getElementById('u8l1b-run').addEventListener('click', () => { if (T0 >= 64.9) setT(0); go(65, (65 - T0) * 130); });
  document.getElementById('u8l1b-step').addEventListener('click', () => go(Math.min(65, T0 + 5), 650));
  document.getElementById('u8l1b-reset').addEventListener('click', () => { gen++; started = false; setT(0); });
}

/* =============================== Example 1 grids (answers drawn on the same grid) =============================== */
const EX1 = {
  a: { lines: [{ m: 1, b: -2, color: BL, lab: [-1, -3, 'nw', 'y=x-2'] }, { m: -1, b: 6, color: AM, lab: [-1.5, 7.5, 'w', 'y=-x+6'] }], pt: [4, 2] },
  b: { lines: [{ m: 2, b: 3, color: BL, lab: [-3.5, -4, 'w', 'y=2x+3'] }, { m: 2, b: -5, color: AM, lab: [1, -6, 'e', 'y=2x-5'] }] },
  c: { lines: [{ m: 4, b: -6, color: BL, lab: [2.5, 4, 'w', 'y=4x-6'] }, { m: 4, b: -6, color: AM, dash: true, lab: [0.6, -7.2, 'e', '8x-2y-12=0'] }] }
};
function mountEx1() {
  Object.keys(EX1).forEach((k) => {
    const host = document.getElementById('u8l1b-g1' + k); if (!host) return;
    const d = EX1[k];
    const G = new Graph(host, { width: 290, height: 376, xmin: -6.5, xmax: 6.5, ymin: -8.5, ymax: 8.5, xlabels: 2, ylabels: 2, fontSize: 15 });
    const ans = [];
    d.lines.forEach((L) => {
      ans.push(G.line({ m: L.m, b: L.b }, { color: L.color, width: L.dash ? 3.5 : 4, dash: L.dash ? '11 9' : null }));
      ans.push(G.label(L.lab[0], L.lab[1], T(L.color === BL ? c1(L.lab[3]) : c2(L.lab[3])), { cls: 'bk-ptlab u8l1b-glab', pos: L.lab[2] }));
    });
    if (d.pt) ans.push(G.point(d.pt[0], d.pt[1], { color: PU, r: 7, label: T(cP(`(${d.pt[0]},\\ ${d.pt[1]})`)), pos: 'se' }));
    const part = host.closest('.part');
    const sync = () => { const on = part.classList.contains('shown'); ans.forEach((e) => { e.style.display = on ? '' : 'none'; if (e.label) e.label.style.display = on ? '' : 'none'; }); };
    new MutationObserver(sync).observe(part, { attributes: true, attributeFilter: ['class'] }); sync();
  });
}

/* =============================== explainer 1 (star): turn, then slide =============================== */
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
  one: '<line x1="10" y1="40" x2="70" y2="6" class="u8l1b-sl1"/><line x1="10" y1="6" x2="70" y2="40" class="u8l1b-sl2"/>',
  none: '<line x1="10" y1="42" x2="70" y2="18" class="u8l1b-sl1"/><line x1="10" y1="28" x2="70" y2="4" class="u8l1b-sl2"/>',
  inf: '<line x1="10" y1="40" x2="70" y2="6" class="u8l1b-sl1 u8l1b-fat"/><line x1="10" y1="40" x2="70" y2="6" class="u8l1b-sl2 u8l1b-dash"/>'
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
    const XL = G.label(2, 2, '', { cls: 'bk-ptlab u8l1b-xlab', color: PU, pos: 'se', gap: 6 });
    const off = h('div', 'u8l1b-off'); G.html.appendChild(off);
    const P = add(stage, box(h('div', 'u8l1b-tsp' + (d.free ? ' u8l1b-free' : '')), W - 488, 460), 480, 10);
    P.innerHTML = `<div class="u8l1b-eqs"><div class="u8l1b-eq">${T(c1('y=0.5x+1'))}</div><div class="u8l1b-eq u8l1b-eq2"></div></div>
      <div class="u8l1b-mid"><div class="u8l1b-cnt"><div class="u8l1b-cntk">solutions</div><div class="u8l1b-cntv"></div><div class="u8l1b-cnts"></div></div>
      <div class="u8l1b-cmp"><div class="u8l1b-cmpr"><div class="u8l1b-cmpk">slopes</div><div class="u8l1b-cmpv u8l1b-sm"></div><div class="u8l1b-cmpt u8l1b-smt"></div></div>
      <div class="u8l1b-cmpr"><div class="u8l1b-cmpk">intercepts</div><div class="u8l1b-cmpv u8l1b-sb"></div><div class="u8l1b-cmpt u8l1b-sbt"></div></div></div></div>
      <div class="u8l1b-mchart">${['one', 'none', 'inf'].map((q) => `<div class="u8l1b-mc" data-k="${q}"><div class="u8l1b-mch">${{ one: 'One solution', none: 'No solution', inf: 'Infinitely many' }[q]}</div><svg viewBox="0 0 80 46">${miniSvg(q)}</svg><div class="u8l1b-mcr">${{ one: 'slopes <b>different</b><br>intercepts <b>any</b>', none: 'slopes <b>equal</b><br>intercepts <b>different</b>', inf: 'slopes <b>equal</b><br>intercepts <b>equal</b>' }[q]}</div></div>`).join('')}</div>`;
    const q = (s) => P.querySelector(s);
    const eq2 = q('.u8l1b-eq2'), cnt = q('.u8l1b-cnt'), cntV = q('.u8l1b-cntv'), cntS = q('.u8l1b-cnts');
    const sm = q('.u8l1b-sm'), smt = q('.u8l1b-smt'), sb = q('.u8l1b-sb'), sbt = q('.u8l1b-sbt'), cols = [...P.querySelectorAll('.u8l1b-mc')];
    let prev = null;
    const upd = () => {
      L2._bkDraw(); G.moveTo(PV, 0, st.b);
      const em = Math.abs(st.m - M1) < 1e-6, eb = Math.abs(st.b - B1) < 1e-6, kind = em ? (eb ? 'inf' : 'none') : 'one';
      put(eq2, T(c2(mbLive(st.m, st.b))));
      put(cntV, KIND[kind].n); put(cntS, KIND[kind].word);
      Object.values(KIND).forEach((kk) => cnt.classList.toggle(kk.cls, kk === KIND[kind]));
      put(sm, `${T(c1('0.5'))} <span class="u8l1b-and">and</span> ${T(c2(d2(st.m)))}`); put(smt, em ? '<b class="u8l1b-eqw">equal</b>' : 'different');
      put(sb, `${T(c1('1'))} <span class="u8l1b-and">and</span> ${T(c2(d2(st.b)))}`); put(sbt, eb ? '<b class="u8l1b-eqw">equal</b>' : 'different');
      cols.forEach((cl) => cl.classList.toggle('u8l1b-on', cl.dataset.k === kind));
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
      const ctl = h('div', 'u8l1b-ctl'); P.appendChild(ctl);
      let busy = 0;
      const B = (html, title, to) => { const b = h('button', 'pill u8l1b-cb', html); b.type = 'button'; b.title = title; b.onclick = async () => { const g = ++busy; const tgt = to(); if (g === busy) await move(liveCtx(), tgt, 450); }; ctl.appendChild(b); return b; };
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

/* =============================== explainer 2: the warm-up races as lines =============================== */
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
    const trk = add(stage, box(h('div', 'u8l1b-xtrack'), X1 - X0 + 36, 100), X0 - 18, 8);
    [d.A, d.B].forEach((r, i) => add(stage, h('div', 'u8l1b-xname ' + (i ? 'u8l1b-c2' : 'u8l1b-c1'), r.n), 10, 22 + i * 46));
    add(stage, box(h('div', 'u8l1b-xfin'), 16, 100), px(200) - 8, 8); add(stage, box(h('div', 'u8l1b-xstart'), 4, 100), px(0) - 2, 8); void trk;
    const tok = (r, i) => { const t = h('div', 'u8l1b-tok ' + (i ? 'u8l1b-tb' : 'u8l1b-ta'), r.i); stage.appendChild(t); return t; };
    const tA = tok(d.A, 0), tB = tok(d.B, 1);
    const side = add(stage, h('div', 'u8l1b-sidepill', 'side by side'), 0, 0); side.style.display = 'none';
    // graph
    const G = new Graph(stage, { x: 8, y: 118, width: 580, height: 372, xmin: 0, xmax: 70, ymin: 0, ymax: 220, xstep: 5, ystep: 20, xlabels: 10, ylabels: 40, xtitle: 't', ytitle: 'd', fontSize: 16 });
    const LA = G.segment([0, d.A.h], [tfA, 200], { color: BL, width: 4.5 }), LB = G.segment([0, d.B.h], [tfB, 200], { color: AM, width: k === 'r3' ? 3.5 : 4.5, dash: k === 'r3' ? '12 10' : null });
    hideAll(LA, LB);
    const lA = G.label(d.labA[0], d.A.h + d.A.v * d.labA[0], T(c1(d.eA)), { cls: 'bk-ptlab u8l1b-glab', pos: d.labA[1] });
    const lB = G.label(d.labB[0], d.B.h + d.B.v * d.labB[0], T(c2(d.eB)), { cls: 'bk-ptlab u8l1b-glab', pos: d.labB[1] });
    hideAll(lA, lB);
    const DA = G.point(0, d.A.h, { color: BL, r: 7 }), DB = G.point(0, d.B.h, { color: AM, r: 7 });
    // panel
    const P = panel(stage, 604, 118, W - 612, 372, d.label);
    const eA = line(P, `${T(c1(d.eA))} <span class="u8l1b-mut">${d.A.n}</span>`), eB = line(P, `${T(c2(d.eB))} <span class="u8l1b-mut">${d.B.n}</span>`);
    const simp = k === 'r3' ? line(P, `${T('2(5+1.5t)=10+3t')}`, 'u8l1b-simp') : null;
    const clock = line(P, '', 'u8l1b-xclock'), posA = line(P, '', 'u8l1b-xpos'), posB = line(P, '', 'u8l1b-xpos'), gap = line(P, '', 'u8l1b-xpos');
    const V = verdict(P, d.kind);
    hideAll(eA, eB, simp);
    let tt = 0;
    const setT = (t) => {
      tt = t; const a = fA(t), b = fB(t);
      place(tA, px(a), 30, 'c'); place(tB, px(b), 76, 'c');
      G.moveTo(DA, Math.min(t, tfA), a); G.moveTo(DB, Math.min(t, tfB), b);
      put(clock, `${T('t=' + d1(t))} s`);
      put(posA, `<b class="u8l1b-c1">${d.A.n}</b> ${d1(a)} m${a >= 200 ? ' (finished)' : ''}`); put(posB, `<b class="u8l1b-c2">${d.B.n}</b> ${d1(b)} m${b >= 200 ? ' (finished)' : ''}`);
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

/* =============================== explainer 3: Example 1 check =============================== */
const E1 = {
  a: { label: '(a)', L: [{ m: 1, b: -2, tex: 'y=x-2', lab: [-1, -3, 'nw'], say: `${T(c1('y=x-2'))}: start at ${T('-2')}, slope ${T('1')}: up 1, right 1.` },
    { m: -1, b: 6, tex: 'y=-x+6', lab: [-1.5, 7.5, 'w'], say: `${T(c2('y=-x+6'))}: start at ${T('6')}, slope ${T('-1')}: down 1, right 1.` }], kind: 'one' },
  b: { label: '(b)', L: [{ m: 2, b: 3, tex: 'y=2x+3', lab: [-3.5, -4, 'w'], say: `${T(c1('y=2x+3'))}: start at ${T('3')}, slope ${T('2')}: up 2, right 1.` },
    { m: 2, b: -5, tex: 'y=2x-5', lab: [4, 3, 'e'], say: `${T(c2('y=2x-5'))}: start at ${T('-5')}, slope ${T('2')}: up 2, right 1.` }], kind: 'none' },
  c: { label: '(c)', L: [{ m: 4, b: -6, tex: 'y=4x-6', lab: [2.5, 4, 'w'], say: `${T(c1('y=4x-6'))}: start at ${T('-6')}, slope ${T('4')}: up 4, right 1.` },
    { m: 4, b: -6, tex: '8x-2y-12=0', lab: [1, -2, 'e'], dash: '11 9' }], kind: 'inf' }
};
const ex1 = {
  title: 'Example 1 check: graph both lines, then count',
  height: 480,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  value: 'a',
  choices: [{ sep: 'Example 1 check' }, ...Object.keys(E1).map((k) => ({ v: k, label: E1[k].label }))],
  intro: () => 'Graph each line from its <b>y-intercept</b> and <b>slope</b>, then count the crossing points. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = E1[k], W = ex.W;
    const G = new Graph(stage, { x: 8, y: 6, width: 380, height: 468, xmin: -6.5, xmax: 6.5, ymin: -8.5, ymax: 8.5, xlabels: 2, ylabels: 2, fontSize: 16 });
    const P = panel(stage, 404, 6, W - 412, 468, `Example 1 ${d.label}`);
    const [A, B] = d.L, cols = [BL, AM];
    const steps = [
      { cap: `Line 1: ${A.say}`, run: async (c) => { const l = line(P, A.say); await show(c, l); await plotMB(G, c, A.m, A.b, BL, { label: [...A.lab, c1(A.tex)] }); } }
    ];
    if (k === 'c') {
      let rows;
      steps.push({ cap: `Line 2 is not in ${T('y=mx+b')} form yet. Get ${T('y')} alone: ${T('8x-2y-12=0')} gives ${T('-2y=-8x+12')}, so ${T('y=4x-6')}.`, run: async (c) => {
        rows = [line(P, `${T(c2('8x-2y-12=0'))}`), line(P, `${T(c2('-2y=-8x+12'))} <span class="u8l1b-mut">subtract ${T('8x')}, add 12</span>`), line(P, `${T(c2('y=4x-6'))} <span class="u8l1b-mut">divide every term by ${T('-2')}</span>`)];
        for (const r of rows) { await show(c, r); await sleep(c, 200); }
      } });
      steps.push({ cap: `Same slope ${T('4')}, same intercept ${T('-6')}: the amber line lands <b>exactly on top</b> of the blue one.`, run: async (c) => {
        const L = G.line({ m: 4, b: -6 }, { color: AM, width: 3.5, dash: '11 9' }); await G.drawIn(L, 900, c);
        const lb = G.label(B.lab[0], B.lab[1], T(c2(B.tex)), { cls: 'bk-ptlab u8l1b-glab', pos: B.lab[2] }); await fadeIn(c, lb);
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
        const r1 = line(P, `${T(c1('2'))} ${T('\\overset{?}{=}')} ${T(c1('4-2=2'))} <b class="u8l1b-ok">✓</b>`), r2 = line(P, `${T(c2('2'))} ${T('\\overset{?}{=}')} ${T(c2('-4+6=2'))} <b class="u8l1b-ok">✓</b>`);
        await show(c, r1); await show(c, r2);
      } });
      steps.push({ cap: `One crossing point, and it checks in both: <b>one solution</b>, ${T(cP('(4,\\ 2)'))}.`, run: (c) => pop(c, V, 420) });
    } else {
      const V = verdict(P, 'none');
      steps.push({ cap: `Same slope: both go up 2 for every 1 across. Measure the vertical gap anywhere: always <b>8</b>. The lines are <b>parallel</b>.`, run: async (c) => {
        for (const x of [-1.5, 1, 2.5]) {
          const s = G.segment([x, 2 * x - 5], [x, 2 * x + 3], { color: SL, width: 3, ends: ['arrow', 'arrow'] }); await G.drawIn(s, 360, c);
          const lb = G.label(x, 2 * x - 1, T('8'), { cls: 'bk-ptlab u8l1b-gaplab', pos: 'e', gap: 4 }); await fadeIn(c, lb);
        }
        await show(c, line(P, `gap ${T('=(2x+3)-(2x-5)=8')}, for every ${T('x')}`));
      } });
      steps.push({ cap: `A gap that is always 8 is never 0: no point is on both lines. <b>No solution.</b>`, run: (c) => pop(c, V, 420) });
    }
    void cols;
    return steps;
  }
};

/* =============================== explainer 4: the gap between the lines =============================== */
const GP = {
  a: { label: '(a)', m1: 1, b1: -2, m2: -1, b2: 6, e1: 'y=x-2', e2: 'y=-x+6', kind: 'one', win: [-8.5, 8.5],
    diff: `The gap goes up by ${T('2')} every step, because the slopes differ by ${T('1-(-1)=2')}. A gap that keeps changing must pass through 0, and only <b>once</b>.`,
    end: `Gap 0 at ${T('x=4')}: the lines meet at ${T(cP('(4,\\ 2)'))}. <b>One solution.</b>` },
  b: { label: '(b)', m1: 2, b1: 3, m2: 2, b2: -5, e1: 'y=2x+3', e2: 'y=2x-5', kind: 'none', win: [-6.5, 14.5],
    diff: `The gap never changes: always ${T('8')}. Equal slopes mean the lines rise <b>together</b>.`,
    end: `A gap stuck at 8 can never be 0: <b>no solution</b>.` },
  c: { label: '(c)', m1: 4, b1: -6, m2: 4, b2: -6, e1: 'y=4x-6', e2: '8x-2y-12=0', kind: 'inf', win: [-8.5, 14.5],
    diff: `The gap is ${T('0')} at every ${T('x')}: equal slopes <b>and</b> equal intercepts.`,
    end: `Zero gap everywhere: every point is on both lines. <b>Infinitely many solutions.</b>` }
};
const gap = {
  title: 'The gap between the lines',
  height: 480,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  value: 'a',
  choices: [{ sep: 'Example 1' }, ...Object.keys(GP).map((k) => ({ v: k, label: GP[k].label }))],
  intro: () => 'Measure the vertical gap between the lines at several values of x. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = GP[k], W = ex.W, f1 = (x) => d.m1 * x + d.b1, f2 = (x) => d.m2 * x + d.b2, g = (x) => f1(x) - f2(x);
    const G = new Graph(stage, { x: 8, y: 6, width: 380, height: 468, xmin: -6.5, xmax: 6.5, ymin: d.win[0], ymax: d.win[1], xlabels: 2, ylabels: 2, fontSize: 16 });
    const L1 = G.line({ m: d.m1, b: d.b1 }, { color: BL, width: 4 }), L2 = G.line({ m: d.m2, b: d.b2 }, { color: AM, width: 3.5, dash: k === 'c' ? '11 9' : null });
    hideAll(L1, L2);
    const st = { x: 0 };
    const R = G.curve(() => ({ subs: [[G.toPx(st.x, f2(st.x)), G.toPx(st.x, f1(st.x))]] }), { color: SL, width: 4 }, 'u8l1b-ruler', G.layers.data);
    const RD0 = G.point(0, 0, { color: SL, r: 5 }), RL = G.label(0, 0, '', { cls: 'bk-ptlab u8l1b-gaplab', pos: 'e', gap: 8 });
    const setX = (x) => { st.x = x; R._bkDraw(); G.moveTo(RD0, x, f1(x)); RL.gx = x; RL.gy = (f1(x) + f2(x)) / 2; put(RL, `gap ${T(d1(g(x)))}`); RL._bkDraw(); };
    hideAll(R, RD0, RL); setX(0);
    const xs = [0, 1, 2, 3, 4, 5];
    const tb = new ValueTable(stage, { x: 404, y: 6, headers: ['x', c1('y'), c2('y'), '\\text{gap}'], rows: xs.map((x) => [x, f1(x), f2(x), g(x)]), cellW: 92, cellH: 44, hide: (r, cc) => cc > 0, tap: false, diffs: true, diffSpace: 88, cls: 'u8l1b-gtab' });
    const P = panel(stage, 404, 330, W - 412, 144, '', 'u8l1b-gverd');
    const eqs = line(P, `${T(c1(d.e1))} <span class="u8l1b-mut">and</span> ${T(c2(d.e2))}`), how = line(P, `gap ${T('=')} ${T(c1('y'))} ${T('-')} ${T(c2('y'))}`, 'u8l1b-mut2');
    const V = verdict(P, d.kind, null, null, d.kind === 'one' ? `: ${T(cP('(4,\\ 2)'))}` : '');
    return [
      { cap: `${T(c1(d.e1))} and ${T(c2(d.e2))}. The <b>gap</b> at any ${T('x')} is blue ${T('y')} minus amber ${T('y')}.`, run: async (c) => {
        L1.style.opacity = 1; L2.style.opacity = 1; await G.drawIn(L1, 500, c); await G.drawIn(L2, 500, c);
        R.style.opacity = 1; RD0.style.opacity = 1; await G.drawIn(R, 300, c); await fadeIn(c, RL);
      } },
      { cap: `Slide across: ${T('x=0,\\ 1,\\ 2,\\ \\dots')} Record both ${T('y')}-values and the gap.`, run: async (c) => {
        for (let r = 0; r < xs.length; r++) {
          const x0 = st.x; await tween(c, 380, (t) => setX(x0 + (xs[r] - x0) * t)); setX(xs[r]);
          for (let cc = 1; cc < 4; cc++) await tb.reveal(r, cc, c);
          await sleep(c, 120);
        }
      } },
      { cap: d.diff, run: (c) => tb.diffs(c, { col: 3, color: SL }) },
      { cap: d.end, run: async (c) => {
        if (k === 'a') { const x0 = st.x; await tween(c, 500, (t) => setX(x0 + (4 - x0) * t)); setX(4); tb.highlight(4, true); const X = G.point(4, 2, { color: PU, r: 8 }); await pop(c, X, 360); }
        else if (k === 'c') { for (let r = 0; r < xs.length; r++) tb.highlight(r, true); }
        else await shake(c, tb.el);
        void eqs; void how; await pop(c, V, 420);
      } }
    ];
  }
};

/* =============================== explainer 5: Example 2 check — building the chart =============================== */
const CH = [
  { tag: 'Example 1 (a)', e1: 'y=x-2', e2: 'y=-x+6', m: [1, -1], b: [-2, 6], kind: 'one', head: 'One Solution', sl: 'different', ic: 'any values', pt: [4, 2] },
  { tag: 'Example 1 (b)', e1: 'y=2x+3', e2: 'y=2x-5', m: [2, 2], b: [3, -5], kind: 'none', head: 'No Solution', sl: 'equal', ic: 'different' },
  { tag: 'Example 1 (c)', e1: 'y=4x-6', e2: 'y=4x-6', e2o: '8x-2y-12=0', m: [4, 4], b: [-6, -6], kind: 'inf', head: 'Infinitely Many', sl: 'equal', ic: 'equal' }
];
const chart = {
  title: 'Example 2 check: the classification chart',
  height: 500,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  intro: () => 'The three systems from Example 1, side by side. Press <b>Next</b> to fill the chart.',
  make(stage, k, ex) {
    const W = ex.W, cw = (W - 16) / 3;
    const st = { b2: 6 };
    const cols = CH.map((d, i) => {
      const x0 = 8 + i * cw;
      add(stage, box(h('div', 'u8l1b-chtag', d.tag), cw - 12, 28), x0 + 6, 0);
      const G = new Graph(stage, { x: x0 + (cw - 210) / 2, y: 30, width: 210, height: 256, xmin: -6, xmax: 6, ymin: -8, ymax: 8, numbers: false, xtitle: '', ytitle: '', ystep: 1 });
      const L1 = G.line({ m: d.m[0], b: d.b[0] }, { color: BL, width: 3.5 });
      const L2 = i === 0 ? mbLine(G, () => [-1, st.b2], { color: AM, width: 3.5 }) : G.line({ m: d.m[1], b: d.b[1] }, { color: AM, width: 3, dash: i === 2 ? '10 8' : null });
      const X = i === 0 ? G.point(4, 2, { color: PU, r: 6 }) : null;
      const eqs = add(stage, box(h('div', 'u8l1b-cheq', `${T(c1(d.e1))}<span class="u8l1b-gap1"></span>${T(c2(d.e2o || d.e2))}`), cw - 12, 34), x0 + 6, 292);
      const cell = add(stage, box(h('div', 'u8l1b-chcell u8l1b-k' + d.kind), cw - 12, 168), x0 + 6, 330);
      cell.innerHTML = `<div class="u8l1b-chhd">?</div><div class="u8l1b-chln">Slopes: <span class="u8l1b-chnum">${T(c1(texNum(d.m[0])))}, ${T(c2(texNum(d.m[1])))}</span> <b class="u8l1b-chv"></b></div><div class="u8l1b-chln">Intercepts: <span class="u8l1b-chnum">${T(c1(texNum(d.b[0])))}, ${T(c2(texNum(d.b[1])))}</span> <b class="u8l1b-chv"></b></div>`;
      const [hd, v1, v2] = [cell.querySelector('.u8l1b-chhd'), ...cell.querySelectorAll('.u8l1b-chv')];
      const nums = cell.querySelectorAll('.u8l1b-chnum'); hideAll([...nums]);
      hideAll(L1, L2, X, eqs);
      return { d, G, L1, L2, X, eqs, cell, hd, v1, v2, nums };
    });
    const fillCol = async (c, o, icTxt) => {
      o.eqs.style.opacity = 1; await fadeIn(c, o.eqs);
      o.L1.style.opacity = 1; await o.G.drawIn(o.L1, 500, c); o.L2.style.opacity = 1; await o.G.drawIn(o.L2, 500, c);
      if (o.X) { o.X.style.opacity = 1; await pop(c, o.X, 300); }
      o.hd.textContent = o.d.head; o.cell.classList.add('u8l1b-lit'); await pop(c, o.hd, 360);
      await fadeIn(c, o.nums[0]); o.v1.textContent = o.d.sl; await pop(c, o.v1, 300);
      await fadeIn(c, o.nums[1]); if (icTxt) { o.v2.textContent = icTxt; await pop(c, o.v2, 300); }
    };
    const a = cols[0];
    return [
      { cap: `(a): slopes ${T(c1('1'))} and ${T(c2('-1'))} are <b>different</b>. The lines cross once: <b>one solution</b>.`, run: (c) => fillCol(c, a, '') },
      { cap: `(b): slopes ${T(c1('2'))} and ${T(c2('2'))} are <b>equal</b>; intercepts ${T(c1('3'))} and ${T(c2('-5'))} are <b>different</b>. Parallel: <b>no solution</b>.`, run: (c) => fillCol(c, cols[1], 'different') },
      { cap: `(c): rearranged, ${T(c2('8x-2y-12=0'))} is ${T(c2('y=4x-6'))}. Slopes equal <b>and</b> intercepts equal: the same line, <b>infinitely many</b>.`, run: (c) => fillCol(c, cols[2], 'equal') },
      { cap: `Back to (a): do its intercepts matter? Slide the amber line: it still crosses once, even when the intercepts are <b>equal</b> (both ${T('-2')}). Intercepts: <b>any values</b>.`, run: async (c) => {
        const upd = () => { a.L2._bkDraw(); const x = (st.b2 + 2) / 2; a.G.moveTo(a.X, x, x - 2); };
        await tween(c, 1600, (t) => { st.b2 = 6 - 8 * t; upd(); }); st.b2 = -2; upd(); await sleep(c, 700);
        await tween(c, 1400, (t) => { st.b2 = -2 + 8 * t; upd(); }); st.b2 = 6; upd();
        a.v2.textContent = 'any values'; await pop(c, a.v2, 320);
      } }
    ];
  }
};

/* =============================== explainer 6: getting y alone =============================== */
const RA = {
  s1: { label: '3x + y = 5', rows: [['3x+y=5'], ['y=-3x+5', `subtract ${T('3x')} from both sides`]], m: '-3', b: '5', mv: -3, bv: 5, run: 1 },
  s2: { label: '2x + 3y = 12', rows: [['2x+3y=12'], ['3y=-2x+12', `subtract ${T('2x')} from both sides`], ['y=-\\tfrac{2}{3}x+4', `divide <b>every</b> term by ${T('3')}`]], m: '-\\tfrac{2}{3}', b: '4', mv: -2 / 3, bv: 4, run: 3 },
  s3: { label: 'x − 2y − 6 = 0', rows: [['x-2y-6=0'], ['-2y=-x+6', `subtract ${T('x')}, add ${T('6')}`], ['y=\\tfrac{1}{2}x-3', `divide <b>every</b> term by ${T('-2')}: every sign flips`]], m: '\\tfrac{1}{2}', b: '-3', mv: 0.5, bv: -3, run: 2 },
  e1c: { label: '8x − 2y − 12 = 0', rows: [['8x-2y-12=0'], ['-2y=-8x+12', `subtract ${T('8x')}, add ${T('12')}`], ['y=4x-6', `divide <b>every</b> term by ${T('-2')}`]], m: '4', b: '-6', mv: 4, bv: -6, run: 1 }
};
const rearr = {
  title: 'Into y = mx + b: get y alone',
  height: 430,
  minW: 900, // the step notes need ~570 px beside the graph
  choices: [{ v: 's1', label: RA.s1.label }, { v: 's2', label: RA.s2.label }, { v: 's3', label: RA.s3.label }, { sep: 'Example 1 (c)' }, { v: 'e1c', label: RA.e1c.label }],
  intro: (k) => `Goal: ${T('y')} alone on the left, everything else on the right. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = RA[k], W = ex.W, LW = W - 330;
    const rows = d.rows.map((r, i) => {
      const el = add(stage, box(h('div', 'u8l1b-arow', `<div class="u8l1b-aeq">${T(r[0])}</div><div class="u8l1b-anote">${r[1] || 'as given'}</div>`), LW - 20, 64), 14, 14 + i * 78);
      if (i) el.style.opacity = 0; return el;
    });
    const pills = add(stage, box(h('div', 'u8l1b-pills', `<div class="u8l1b-pm">slope ${T('m=' + d.m)}</div><div class="u8l1b-pb">${T('y')}-intercept ${T('b=' + d.b)}</div>`), LW - 20, 64), 14, 14 + d.rows.length * 78 + 10);
    pills.style.opacity = 0;
    const G = new Graph(stage, { x: W - 314, y: 8, width: 304, height: 410, xmin: -6, xmax: 6, ymin: -8, ymax: 8, xlabels: 2, ylabels: 2, fontSize: 15 });
    const steps = d.rows.slice(1).map((r, i) => ({ cap: `${r[1][0].toUpperCase() + r[1].slice(1)}.`, run: async (c) => { await show(c, rows[i + 1]); } }));
    steps.push({ cap: `${T('y')} is alone. Read it off: slope ${T('m=' + d.m)}, ${T('y')}-intercept ${T('b=' + d.b)}.`, run: (c) => fadeIn(c, pills) });
    steps.push({ cap: `Check on the grid: start at ${T(d.b)}, then the slope: ${d.run > 1 ? `right ${d.run}, ${d.mv * d.run > 0 ? 'up' : 'down'} ${Math.abs(d.mv * d.run)}` : `right 1, ${d.mv > 0 ? 'up' : 'down'} ${Math.abs(d.mv)}`}.`,
      run: (c) => plotMB(G, c, d.mv, d.bv, BL, { run: d.run }) });
    return steps;
  }
};

/* =============================== explainer 7: Example 3 check — the flowchart =============================== */
const CL = {
  jo: { label: 'Kai and Jo', e1: ['d=10+3t'], e2: ['d=2(5+1.5t)', 'd=10+3t'], m: ['3', '3'], b: ['10', '10'], kind: 'inf', v: 't' },
  a: { label: '(a)', e1: ['5x+2y=20', '2y=-5x+20', 'y=-\\tfrac{5}{2}x+10'], e2: ['y=-\\tfrac{5}{2}x', 'y=-\\tfrac{5}{2}x+0'], m: ['-\\tfrac{5}{2}', '-\\tfrac{5}{2}'], b: ['10', '0'], kind: 'none' },
  b: { label: '(b)', e1: ['x-3y+9=0', '-3y=-x-9', 'y=\\tfrac{1}{3}x+3'], e2: ['y=\\tfrac{1}{3}x+3'], m: ['\\tfrac{1}{3}', '\\tfrac{1}{3}'], b: ['3', '3'], kind: 'inf' },
  c: { label: '(c)', e1: ['6x+y=11', 'y=-6x+11'], e2: ['x-5y=20', '-5y=-x+20', 'y=\\tfrac{1}{5}x-4'], m: ['-6', '\\tfrac{1}{5}'], b: ['11', '-4'], kind: 'one' }
};
const classify = {
  title: 'Example 3 check: same slope? same intercept?',
  height: 470,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ sep: 'Warm-up' }, { v: 'jo', label: CL.jo.label }, { sep: 'Example 3 check' }, ...['a', 'b', 'c'].map((k) => ({ v: k, label: CL[k].label }))],
  value: 'a',
  intro: () => 'Rearrange both equations, then answer two questions. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CL[k], W = ex.W, FW = W - 470, IX = Math.min(FW / 2 + 158, FW - 96), NX = Math.min(FW / 2 - 36, IX - 180); // bottom boxes fit the width given
    const P = panel(stage, 8, 6, 444, 458, '', 'u8l1b-clp');
    const blk = (rows, col) => { const b = h('div', 'u8l1b-cblk u8l1b-cb' + col); rows.forEach((r, i) => b.appendChild(h('div', 'u8l1b-cr' + (i === rows.length - 1 && rows.length > 1 ? ' u8l1b-cfin' : ''), T((col === 1 ? c1 : c2)(r))))); P.appendChild(b); return b; };
    const B1k = blk(d.e1, 1), B2k = blk(d.e2, 2);
    const later = [...B1k.children].slice(1).concat([...B2k.children].slice(1)); hideAll(later);
    const cm = line(P, `slopes: ${T(c1(d.m[0]))} <span class="u8l1b-and">and</span> ${T(c2(d.m[1]))}`, 'u8l1b-cmpl'), cb = line(P, `intercepts: ${T(c1(d.b[0]))} <span class="u8l1b-and">and</span> ${T(c2(d.b[1]))}`, 'u8l1b-cmpl');
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

/* =============================== explainer 8: the same line in disguise =============================== */
const DG = {
  e1c: { label: 'Example 1 (c)', xv: 'x', main: { tex: 'y=4x-6', col: 1, m: 4, b: -6 }, other: { tex: '8x-2y-12=0', col: 2, head: '8x-2y-12', f: (x, y) => 8 * x - 2 * y - 12 },
    xs: [0, 1, 2, 3], alg: [['8x-2y-12=0', '', 2], ['4x-y-6=0', `divide every term by ${T('2')}`, 0], ['y=4x-6', `add ${T('y')} to both sides`, 1]], target: '0',
    why: `Divide every term of ${T(c2('8x-2y-12=0'))} by 2 and rearrange: it turns into ${T(c1('y=4x-6'))}.`,
    g: { xmin: -6, xmax: 6, ymin: -8, ymax: 8 } },
  e3b: { label: 'Example 3 (b)', xv: 'x', main: { tex: 'y=\\tfrac{1}{3}x+3', col: 2, m: 1 / 3, b: 3 }, other: { tex: 'x-3y+9=0', col: 1, head: 'x-3y+9', f: (x, y) => x - 3 * y + 9 },
    xs: [-3, 0, 3, 6], alg: [['y=\\tfrac{1}{3}x+3', '', 2], ['3y=x+9', `multiply every term by ${T('3')}`, 0], ['0=x-3y+9', `subtract ${T('3y')} from both sides`, 1]], target: '0',
    why: `Multiply every term of ${T(c2('y=\\tfrac{1}{3}x+3'))} by 3 and rearrange: it turns into ${T(c1('x-3y+9=0'))}.`,
    g: { xmin: -7, xmax: 7, ymin: -3, ymax: 9 } },
  jo: { label: 'Warm-up: Jo’s coach', xv: 't', yv: 'd', main: { tex: 'd=10+3t', col: 1, m: 3, b: 10 }, other: { tex: 'd=2(5+1.5t)', col: 2, head: '2(5+1.5t)', f: (t) => 2 * (5 + 1.5 * t) },
    xs: [0, 10, 20, 30], alg: [['d=2(5+1.5t)', '', 2], ['d=10+3t', 'expand the brackets', 1]], target: 'same',
    why: `Expand ${T(c2('2(5+1.5t)'))}: it is ${T(c1('10+3t'))}, Kai’s rule.`,
    g: { xmin: 0, xmax: 36, ymin: 0, ymax: 120, xstep: 2, ystep: 10, xlabels: 10, ylabels: 20, xtitle: 't', ytitle: 'd' } }
};
const disguise = {
  title: 'The same line in disguise',
  height: 470,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(DG).map((k) => ({ v: k, label: DG[k].label })),
  intro: () => 'Two equations that look different. Do they describe the same line? Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = DG[k], W = ex.W, cm = d.main.col === 1 ? c1 : c2, co = d.other.col === 1 ? c1 : c2, colM = d.main.col === 1 ? BL : AM, colO = d.other.col === 1 ? BL : AM;
    const G = new Graph(stage, Object.assign({ x: 8, y: 6, width: 370, height: 458, xlabels: 2, ylabels: 2, fontSize: 16 }, d.g));
    const yv = d.yv || 'y';
    const rows = d.xs.map((x) => { const y = d.main.m * x + d.main.b; return [x, y, k === 'jo' ? d.other.f(x) : d.other.f(x, y)]; });
    const tb = new ValueTable(stage, { x: 396, y: 6, headers: [d.xv, cm(yv), co(d.other.head)], rows: rows.map((r) => [r[0], r[1], { html: T(texNum(r[2]) + '\\ \\checkmark') }]), cellW: k === 'jo' ? 130 : 140, cellH: 46, hide: (r, cc) => cc > 0, tap: false, cls: 'u8l1b-dtab' });
    const P = panel(stage, 396, 250, W - 404, 214, '', 'u8l1b-dalg');
    const eqs = line(P, `${T(cm(d.main.tex))} <span class="u8l1b-and">vs</span> ${T(co(d.other.tex))}`, 'u8l1b-dhead');
    const alg = d.alg.map((a) => line(P, `${T(a[2] === 1 ? c1(a[0]) : a[2] === 2 ? c2(a[0]) : a[0])} ${a[1] ? `<span class="u8l1b-mut">${a[1]}</span>` : ''}`)); hideAll(alg);
    void eqs;
    let Lm, Lo;
    return [
      { cap: `${T(cm(d.main.tex))} and ${T(co(d.other.tex))} <b>look</b> different. Graph ${T(cm(d.main.tex))}.`, run: async (c) => {
        Lm = G.line({ m: d.main.m, b: d.main.b }, { color: colM, width: 4.5 }); await G.drawIn(Lm, 700, c);
      } },
      { cap: `Take points on that line and test them in ${T(co(d.other.tex))}. ${d.target === '0' ? `Each one gives ${T('0')}` : 'Each one gives the same distance'}: ✓ every time.`, run: async (c) => {
        for (let r = 0; r < rows.length; r++) {
          const p = G.point(rows[r][0], rows[r][1], { color: PU, r: 7 }); await pop(c, p, 260);
          for (let cc = 1; cc < 3; cc++) await tb.reveal(r, cc, c);
          await sleep(c, 140);
        }
      } },
      { cap: `Why? ${d.why} Same equation, written another way.`, run: async (c) => { for (const a of alg) { await show(c, a); await sleep(c, 160); } } },
      { cap: `So the ${d.other.col === 1 ? 'blue' : 'amber'} line lies exactly on top: the same line, <b>infinitely many solutions</b>.`, run: async (c) => {
        Lo = G.line({ m: d.main.m, b: d.main.b }, { color: colO, width: 3.5, dash: '11 9' }); await G.drawIn(Lo, 900, c);
      } }
    ];
  }
};

mountWarm();
mountEx1();
export const explainers = mountExplainers({ turnSlide, races, ex1, gap, chart, rearr, classify, disguise });
