/* Math 10C · Unit 7 · Lesson 7 — Equations of Lines: A Review of Slope, Intercepts, and Perpendicularity.
 * Static figures (warm-up city map, Example 2 graph, Example 4(b) diagram, review Q9(c) TI-84 screen, Q12 tap-to-plot
 * grids, Q14 phone-plan graph) and the explainers:
 *   planner (warm-up: build the perpendicular road; traps B, C, D; the corner), forms (one line in three forms; graph each
 *   form as it is; horizontal and vertical as limits), dials (b slides, m tilts; Ex 1(b), 1(d)), coverUp (cover-up
 *   intercepts; isolate y with balance moves; Ex 1(a), 1(c)), graphToEq (Ex 2(a) graph → general form through the tidy-up
 *   machine; Ex 2(b); the machine on its own), perpTest (why −1: the turned slope triangle; Ex 3(a)(b)(c)),
 *   altitude (★ Ex 4(a): DE's slope triangle copied to F and turned 90°, dropping the altitude; Ex 4(b); all three
 *   altitudes), rate (Ex 5; per m or per km), whichTool (★ the unit as one which-form / which-tool flowchart, replaying
 *   Examples 1–5).
 * Colours (whole unit): run amber, rise purple, lines blue; y-intercept green, x-intercept magenta, perpendicular teal. */
import {
  h, tex, add, box, Graph, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  texNum, svgEl, place, pulse, rightMark, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const AMB = COLORS.amber, PUR = COLORS.purple, BLUE = COLORS.blue, RED = COLORS.red, GRN = COLORS.green, TEAL = COLORS.teal, INK = COLORS.ink;
const NO = '<b class="u7l7-no">✗</b>', OK = '<b class="u7l7-ok">✓</b>';
const XI = '#c0367a', GRAY = '#8b909b', BROWN = '#8a5a2b', ORNG = '#d4600f';

/* =============================== small helpers =============================== */
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u7l7-panel', title ? `<div class="u7l7-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u7l7-line ' + cls, html); p.appendChild(d); return d; };
const say = async (c, p, html, cls) => { const d = line(p, html, cls); await fadeIn(c, d, 300); return d; };
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
/** a row of equation terms, each its own box so a term can be highlighted or flown */
function eqRow(p, terms, cls = '') {
  const d = h('div', 'u7l7-eq ' + cls);
  d.tm = terms.map((t) => { const s = h('span', 'u7l7-tm', T(t)); d.appendChild(s); return s; });
  p.appendChild(d); return d;
}
/** a term flies from one row to its place in the next (the target appears when it lands) */
async function fly(c, stage, from, to, ms = 700) {
  to.style.opacity = 0;
  if (c.fast) { to.style.opacity = 1; return; }
  const sr = stage.getBoundingClientRect(), k = stage.offsetWidth / (sr.width || 1), a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const g = h('div', 'u7l7-fly', from.innerHTML); stage.appendChild(g);
  g.style.left = (a.left - sr.left) * k + 'px'; g.style.top = (a.top - sr.top) * k + 'px';
  try { await c.anim(g, [{ transform: 'translate(0, 0)' }, { transform: `translate(${(b.left - a.left) * k}px, ${(b.top - a.top) * k}px)` }], ms); } finally { g.remove(); }
  to.style.opacity = 1; await pulse(c, to, 1.15);
}
const rmark = (G, V, P, Q, o = {}) => rightMark(G.layers.top, G.toPx(...V), G.toPx(...P), G.toPx(...Q), o.s || 14, { color: o.color || INK, width: 2.4 });
const pill = (G, x, y, html, o = {}) => G.label(x, y, html, Object.assign({ cls: 'u7l7-pill', pos: 'c' }, o));
const chk = (G, x, y, html, ok, o = {}) => G.label(x, y, html, Object.assign({ cls: 'u7l7-chk ' + (ok ? 'ok' : 'no'), pos: 'c' }, o));
const npt = (G, name, x, y, o = {}) => G.point(x, y, Object.assign({ color: INK, r: 6.5, label: T(name), pos: 'ne' }, o));
/** live equation text that only re-typesets when it changes */
function liveTex(el) { let last = ''; return (s) => { if (s !== last) { last = s; el.innerHTML = T(s); } }; }
/** signed term for "y = mx + b" display */
const mTex = (m) => { const r = Math.round(m * 10) / 10; return r === 1 ? '' : r === -1 ? '-' : texNum(r); };
const bTex = (b) => { const r = Math.round(b * 10) / 10; return r === 0 ? '' : r > 0 ? '+' + texNum(r) : texNum(r); };

/* a slope triangle on a Graph: run (amber) from (x, y) across, then rise (purple). st = { x, y, run, rise } can change: S.upd() */
function stair(G, st, o = {}) {
  const w = o.width ?? 4.5, P = (x, y) => G.toPx(x, y), L = o.layer || G.layers.data, rc = o.runColor || AMB, sc = o.riseColor || PUR;
  const runEl = G.curve(() => ({ subs: st.run ? [[P(st.x, st.y), P(st.x + st.run, st.y)]] : [] }), { color: rc, width: w }, 'u7l7-leg', L);
  const riseEl = G.curve(() => ({ subs: st.rise ? [[P(st.x + st.run, st.y), P(st.x + st.run, st.y + st.rise)]] : [] }), { color: sc, width: w }, 'u7l7-leg', L);
  const mk = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 1.6 }, L);
  G.track(mk, () => {
    if (!st.run || !st.rise || o.mark === false) { mk.setAttribute('d', ''); return; }
    const [cx, cy] = P(st.x + st.run, st.y), s = 9, dx = -Math.sign(st.run) * s, dy = Math.sign(st.rise) * s;
    mk.setAttribute('d', `M${cx + dx} ${cy}L${cx + dx} ${cy - dy}L${cx} ${cy - dy}`);
  });
  const txt = o.text || ((k, v) => `${k} ${T(texNum(v))}`);
  const mkLab = (color) => { const d = h('div', 'bk-lab u7l7-leglab'); d.style.color = color; G.html.appendChild(d); return d; };
  const rl = mkLab(rc), sl = mkLab(sc);
  G.track(rl, () => {
    if (!st.run || o.labels === false) { rl.style.display = 'none'; return; } rl.style.display = '';
    if (rl._v !== st.run) { rl._v = st.run; rl.innerHTML = o.runText || txt('run', st.run); }
    const [px, py] = P(st.x + st.run / 2, st.y); place(rl, px, py, (st.rise > 0) !== !!o.flipRun ? 's' : 'n', 5);
  });
  G.track(sl, () => {
    if (!st.rise || o.labels === false) { sl.style.display = 'none'; return; } sl.style.display = '';
    if (sl._v !== st.rise) { sl._v = st.rise; sl.innerHTML = o.riseText || txt('rise', st.rise); }
    const [px, py] = P(st.x + st.run, st.y + st.rise / 2); place(sl, px, py, (st.run >= 0) !== !!o.flipRise ? 'e' : 'w', 6);
  });
  hide(rl); hide(sl); hide(mk);
  const S = {
    st, els: [runEl, riseEl, mk, rl, sl],
    upd() { S.els.forEach((e) => e._bkDraw && e._bkDraw()); },
    async show(c, ms = 450) { await G.drawIn(runEl, ms, c); await fadeIn(c, rl, 220); await G.drawIn(riseEl, ms, c); await fadeIn(c, sl, 220); await appear(c, mk, 200); },
    showNow() { [rl, sl, mk].forEach((e) => (e.style.opacity = 1)); },
    dim(op = 0.28) { S.els.forEach((e) => (e.style.opacity = op)); },
    remove() { G.remove(...S.els); }
  };
  return S;
}

/* a slope triangle that can be moved and turned: legs run (0,0)→(run,0)→(run,rise) in its own frame, placed at
 * (st.ox, st.oy) and turned st.a degrees counterclockwise. */
function turnTri(G, run, rise, st, o = {}) {
  const R = (p) => { const r = st.a * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r); return [st.ox + p[0] * cs - p[1] * sn, st.oy + p[0] * sn + p[1] * cs]; };
  const P = (p) => G.toPx(...R(p)), L = G.layers.data, w = o.width || 4.5;
  const leg1 = G.curve(() => ({ subs: [[P([0, 0]), P([run, 0])]] }), { color: AMB, width: w }, 'u7l7-leg', L);
  const leg2 = G.curve(() => ({ subs: [[P([run, 0]), P([run, rise])]] }), { color: PUR, width: w }, 'u7l7-leg', L);
  const hyp = G.curve(() => ({ subs: [[P([0, 0]), P([run, rise])]] }), { color: o.hypColor || GRN, width: w - 1, dash: '8 6' }, 'u7l7-leg', L);
  const mk = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 1.6 }, L);
  G.track(mk, () => {
    const C = P([run, 0]), A = P([0, 0]), B = P([run, rise]), u = [A[0] - C[0], A[1] - C[1]], v = [B[0] - C[0], B[1] - C[1]];
    const lu = Math.hypot(...u) || 1, lv = Math.hypot(...v) || 1, s = 9, p1 = [C[0] + u[0] / lu * s, C[1] + u[1] / lu * s], p2 = [p1[0] + v[0] / lv * s, p1[1] + v[1] / lv * s], p3 = [C[0] + v[0] / lv * s, C[1] + v[1] / lv * s];
    mk.setAttribute('d', `M${p1[0]} ${p1[1]}L${p2[0]} ${p2[1]}L${p3[0]} ${p3[1]}`);
  });
  const els = [leg1, leg2, hyp, mk];
  const recolor = (el, col) => { el.path.setAttribute('stroke', col); el.style.color = col; };
  return {
    st, R, els, leg1, leg2, hyp,
    upd() { els.forEach((e) => e._bkDraw && e._bkDraw()); },
    swap() { recolor(leg1, PUR); recolor(leg2, AMB); },
    async show(c) { await G.drawIn(leg1, 400, c); await G.drawIn(leg2, 400, c); await G.drawIn(hyp, 400, c); await appear(c, mk, 200); },
    turn(c, to, ms = 1500) { const a0 = st.a; return tween(c, ms, (t) => { st.a = a0 + (to - a0) * t; this.upd(); }); },
    slide(c, ox, oy, ms = 1100) { const x0 = st.ox, y0 = st.oy; return tween(c, ms, (t) => { st.ox = x0 + (ox - x0) * t; st.oy = y0 + (oy - y0) * t; this.upd(); }); },
    dim(op = 0.25) { els.forEach((e) => (e.style.opacity = op)); }
  };
}
const legLab = (G, color, html, x, y, pos) => { const d = G.label(x, y, html, { cls: 'u7l7-leglab', color, pos, gap: 6 }); return d; };
/** foot of the perpendicular from P to the line through A and B */
const foot = (P, A, B) => { const d = [B[0] - A[0], B[1] - A[1]], t = ((P[0] - A[0]) * d[0] + (P[1] - A[1]) * d[1]) / (d[0] * d[0] + d[1] * d[1]); return [A[0] + t * d[0], A[1] + t * d[1]]; };

/* =============================== the city map (warm-up) =============================== */
const CITY = { win: { xmin: 0, xmax: 13, ymin: 0, ymax: 9 }, school: [8, 1] };
function cityMap(host, o = {}) {
  const G = new Graph(host, Object.assign({ width: 645, height: 457, ...CITY.win, xlabels: 2, ylabels: 2, fontSize: 16, cls: 'u7l7-city' }, o));
  const bg = G.layers.bg, P = (x, y) => G.toPx(x, y), u = G.ux, v = G.uy;
  for (let i = 0; i < 13; i++) for (let j = 0; j < 9; j++) { const [px, py] = P(i + 0.12, j + 0.88); svgEl('rect', { x: px, y: py, width: 0.76 * u, height: 0.76 * v, rx: 3, fill: '#e7e5df' }, bg); }
  { const [px, py] = P(1.12, 6.88); svgEl('rect', { x: px, y: py, width: 1.76 * u, height: 1.76 * v, rx: 4, fill: '#a9d494' }, bg);
    const [ex, ey] = P(2.0, 6.3); svgEl('ellipse', { cx: ex, cy: ey, rx: 0.45 * u, ry: 0.28 * v, fill: '#78afe1' }, bg);
    G.label(2.0, 5.5, 'park', { cls: 'u7l7-park' }); }
  const road = [[0, 2], [13, 8.5]];
  G.segment(...road, { color: INK, width: 0.36 * u, cap: 'butt' });
  G.segment(...road, { color: '#ffecb3', width: 0.29 * u, cap: 'butt' });
  G.segment(...road, { color: '#c88c14', width: 1.3, dash: '7 6', cap: 'butt' });
  const ms = G.label(10.25, 7.1, 'Main St', { cls: 'u7l7-mainst' });
  ms.style.rotate = `${-Math.atan2(0.5 * v, u) * 180 / Math.PI}deg`;
  // the school, centred on (8, 1)
  const sg = svgEl('g', { class: 'u7l7-schoolg' }, G.layers.top), S = (dx, dy) => P(8 + dx, 1 + dy).map((n) => n.toFixed(1)).join(' ');
  svgEl('path', { d: `M${S(-0.75, -0.55)}L${S(0.75, -0.55)}L${S(0.75, 0.35)}L${S(-0.75, 0.35)}Z`, fill: '#e07a6e', stroke: INK, 'stroke-width': 1.4 }, sg);
  svgEl('path', { d: `M${S(-0.9, 0.3)}L${S(0, 0.85)}L${S(0.9, 0.3)}Z`, fill: '#8f2f25', stroke: INK, 'stroke-width': 1.4 }, sg);
  svgEl('path', { d: `M${S(-0.15, -0.55)}L${S(-0.15, -0.1)}L${S(0.15, -0.1)}L${S(0.15, -0.55)}`, fill: '#fff', stroke: INK, 'stroke-width': 1 }, sg);
  svgEl('path', { d: `M${S(-0.55, -0.2)}L${S(-0.3, -0.2)}L${S(-0.3, 0.1)}L${S(-0.55, 0.1)}ZM${S(0.3, -0.2)}L${S(0.55, -0.2)}L${S(0.55, 0.1)}L${S(0.3, 0.1)}Z`, fill: '#fff', stroke: INK, 'stroke-width': 0.9 }, sg);
  const [scx, scy] = P(8, 1); svgEl('circle', { cx: scx, cy: scy, r: 3.2, fill: INK }, sg);
  G.label(8.95, 1.1, 'School', { cls: 'u7l7-school', pos: 'e', gap: 0 });
  return G;
}

/* =============================== explainer: the city planner (warm-up) =============================== */
const planner = {
  title: 'City Planner: the road at a right angle',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'build', label: 'Build the road' }, { v: 'traps', label: 'Traps B, C and D' }, { v: 'corner', label: 'Where is the corner?' }],
  intro: (v) => ({ build: 'Main St is <b>x − 2y + 4 = 0</b>; the school is at (8, 1). Press <b>Next</b>.', traps: 'Three wrong roads, three different mistakes. Press <b>Next</b>.', corner: 'Where does the new road meet Main St? Press <b>Next</b>.' })[v],
  make(stage, v, ex) {
    const G = cityMap(stage, { x: 8, y: 10, width: 560, height: 400 }), Pn = panel(stage, 584, 10, ex.W - 596, 450, v === 'traps' ? 'Test each road' : 'Work');
    const road = (o = {}) => G.segment([8, 1], [6, 5], Object.assign({ color: BLUE, width: 6 }, o));
    if (v === 'traps') {
      return [
        { cap: `<b>B</b>: ${T('y=2x-15')} passes the school (${T('2(8)-15=1')}), but slope ${T('2')} only <b>flips</b> ${T('\\frac12')}. It crosses Main St at a slant.`,
          run: async (c) => { const s = G.segment([8, 1], [12, 9], { color: RED, width: 4, dash: '9 7' }); await G.drawIn(s, 700, c); await pop(c, pill(G, 10.9, 4.6, 'B', { color: RED })); await pop(c, chk(G, 12.1, 6.7, '≠ 90°', false)); await say(c, Pn, `B: ${T('m=2')} ${NO}, since ${T('\\frac12\\times2=1')}`); } },
        { cap: `<b>C</b>: ${T('y=-\\frac12x+5')} passes the school (${T('-4+5=1')}), but only <b>changes the sign</b>. It meets Main St at ${T('(3,\\ 3.5)')}, not square.`,
          run: async (c) => { const s = G.segment([0, 5], [10, 0], { color: RED, width: 4, dash: '9 7' }); await G.drawIn(s, 700, c); await pop(c, pill(G, 5.4, 1.6, 'C', { color: RED })); await pop(c, chk(G, 3, 4.6, '≠ 90°', false)); await say(c, Pn, `C: ${T('m=-\\frac12')} ${NO}, since ${T('\\frac12\\times\\left(-\\frac12\\right)=-\\frac14')}`); } },
        { cap: `<b>D</b>: ${T('y=-2x+2')} has the right slope, but copies Main St’s intercept, 2. At ${T('x=8')} it gives ${T('-14')}, not 1: it <b>misses the school</b>.`,
          run: async (c) => { const s = G.segment([0, 2], [1, 0], { color: RED, width: 5 }); await G.drawIn(s, 500, c); await pop(c, pill(G, 1.1, 1.5, 'D', { color: RED })); await say(c, Pn, `D: ${T('m=-2')} ${OK} but misses the school ${NO}`); } },
        { cap: `Only <b>A</b>, ${T('y=-2x+17')}, does both: slope ${T('-2')} (flip <b>and</b> change the sign) through the school ${T('(8,\\ 1)')}.`,
          run: async (c) => { await G.drawIn(road(), 600, c); await appear(c, rmark(G, [6, 5], [8, 6], [7, 3], { s: 13, color: TEAL }), 300); await say(c, Pn, `A: ${T('m=-2')} ${OK} and ${T('-2(8)+17=1')} ${OK}`, 'u7l7-good'); } }
      ];
    }
    if (v === 'corner') {
      return [
        { cap: `Main St: ${T('y=\\frac12x+2')}. New road: ${T('y=-2x+17')}. At the corner both equations give the <b>same</b> ${T('y')}.`,
          run: async (c) => { await G.drawIn(road(), 600, c); await say(c, Pn, T('\\tfrac12x+2=-2x+17'), 'u7l7-mline'); } },
        { cap: `Collect the ${T('x')}-terms: ${T('\\frac52x=15')}, so ${T('x=6')}. Then ${T('y=\\frac12(6)+2=5')}. The corner is ${T('(6,\\ 5)')}.`,
          run: async (c) => { await say(c, Pn, T('\\tfrac52x=15\\ \\Rightarrow\\ x=6')); await say(c, Pn, T('y=\\tfrac12(6)+2=5')); const p = G.point(6, 5, { color: TEAL, r: 8, label: T('(6,\\ 5)'), pos: 'nw' }); await G.reveal(p, c); await appear(c, rmark(G, [6, 5], [8, 6], [7, 3], { s: 13, color: TEAL }), 300); } },
        { cap: `From the school the road runs 2 blocks left and 4 up: ${T('\\sqrt{2^2+4^2}=\\sqrt{20}\\approx4.5')} blocks long. Solving two equations together is <b>Unit 8</b>.`,
          run: async (c) => { await stair(G, { x: 8, y: 1, run: -2, rise: 4 }, { width: 4 }).show(c); await say(c, Pn, `Length ${T('\\sqrt{20}\\approx4.5')} blocks`); } }
      ];
    }
    let S1;
    return [
      { cap: `Main St is ${T('x-2y+4=0')}. <b>Cover up</b> the ${T('x')}-term (${T('x=0')}): ${T('-2y+4=0')}, so ${T('y=2')}. It crosses the ${T('y')}-axis at ${T('(0,\\ 2)')}.`,
        run: async (c) => { const p = G.point(0, 2, { color: GRN, r: 8, label: T('(0,\\ 2)'), pos: 'ne' }); await G.reveal(p, c); await say(c, Pn, `1. ${T('-2y+4=0\\ \\Rightarrow\\ y=2')}`); } },
      { cap: `Its slope: ${T('2y=x+4')}, so ${T('y=\\frac12x+2')}. On the map: <b>2 right, 1 up</b>.`,
        run: async (c) => { S1 = stair(G, { x: 2, y: 3, run: 2, rise: 1 }, { width: 4 }); await S1.show(c); await say(c, Pn, `2. ${T('y=\\tfrac12x+2,\\ m=\\tfrac12')}`); } },
      { cap: `A right angle needs the <b>negative reciprocal</b>: flip ${T('\\frac12')} to ${T('\\frac21')} and change the sign, ${T('m=-2')}. From the school: 1 left, 2 up.`,
        run: async (c) => { S1.dim(0.35); const S = stair(G, { x: 8, y: 1, run: -1, rise: 2 }, { width: 4 }); await S.show(c); await say(c, Pn, `3. ${T('m=-2')} <span class="u7l7-small">(${T('\\tfrac12\\times(-2)=-1')})</span>`); } },
      { cap: `Slope–point through the school ${T('(8,\\ 1)')}: ${T('y-1=-2(x-8)')}, so ${T('y=-2x+16+1=-2x+17')}.`,
        run: async (c) => {
          await G.drawIn(road(), 700, c); await G.drawIn(G.segment([6, 5], [4, 9], { color: BLUE, width: 3, dash: '6 6' }), 400, c);
          await say(c, Pn, `4. ${T('y-1=-2(x-8)')}`); await say(c, Pn, `&emsp;${T('y=-2x+17')}`, 'u7l7-mline');
        } },
      { cap: `Check the school: ${T('-2(8)+17=1')} ✓. The new road meets Main St at a right angle. <b>Answer A.</b>`,
        run: async (c) => { await appear(c, rmark(G, [6, 5], [8, 6], [7, 3], { s: 13, color: TEAL }), 300); await say(c, Pn, `Check: ${T('-2(8)+17=1')} ${OK}`, 'u7l7-good'); const s = stamp(Pn, 'A', { ok: true }); s.style.alignSelf = 'center'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: one line, three forms =============================== */
const FORMS = [
  { tag: 'Slope–point', eq: 'y-1=\\tfrac12(x-8)' },
  { tag: 'Slope–intercept', eq: 'y=\\tfrac12x-3' },
  { tag: 'General', eq: 'x-2y-6=0' }
];
const forms = {
  title: 'Three forms of one line',
  height: 470,
  choices: [{ v: 'morph', label: 'One line, three forms' }, { v: 'graph', label: 'Graph each form as it is' }, { v: 'hv', label: 'Horizontal and vertical' }],
  intro: (v) => ({ morph: 'The bike path from the warm-up: through the school (8, 1), parallel to Main St. Press <b>Next</b>.', graph: 'Graph the same line three times, once from each form, without converting. Press <b>Next</b>.', hv: 'Turn a line through (−2, 4) until it is flat, then until it stands up. Press <b>Next</b>.' })[v],
  make(stage, v, ex) {
    const win = { xmin: -2, xmax: 10, ymin: -5, ymax: 4 };
    if (v === 'graph') {
      const W3 = Math.floor((ex.W - 40) / 3), Gs = [], meth = [
        `<b>Slope–point</b> ${T('y-1=\\frac12(x-8)')}<br>plot ${T('(8,\\ 1)')}, step 2 right, 1 up`,
        `<b>Slope–intercept</b> ${T('y=\\frac12x-3')}<br>plot ${T('b=-3')}, step 2 right, 1 up`,
        `<b>General</b> ${T('x-2y-6=0')}<br>cover up: ${T('(6,\\ 0)')} and ${T('(0,\\ -3)')}`];
      for (let i = 0; i < 3; i++) {
        const x = 8 + i * (W3 + 12), G = new Graph(stage, { x, y: 92, width: W3, height: 268, ...win, xlabels: 2, ylabels: 2, fontSize: 14 });
        const t = add(stage, box(h('div', 'u7l7-mini-t', meth[i]), W3, 80), x, 6); hide(t); G.t = t; Gs.push(G);
      }
      const L = (G) => G.line([0, -3], [2, -2], { color: BLUE, width: 3.5 });
      return [
        { cap: `${T('y-1=\\frac12(x-8)')} shows a <b>point</b> and the <b>slope</b>: plot ${T('(8,\\ 1)')}, then step 2 right, 1 up (or 2 left, 1 down) and rule the line.`,
          run: async (c) => { const G = Gs[0]; await fadeIn(c, G.t); await G.reveal(G.point(8, 1, { color: INK, r: 6 }), c); const S = stair(G, { x: 6, y: 0, run: 2, rise: 1 }, { width: 3.5, labels: false }); await S.show(c); await G.drawIn(L(G), 600, c); } },
        { cap: `${T('y=\\frac12x-3')} shows the <b>${T('y')}-intercept</b>: plot ${T('b=-3')} on the ${T('y')}-axis, step 2 right, 1 up, and rule the line.`,
          run: async (c) => { const G = Gs[1]; await fadeIn(c, G.t); await G.reveal(G.point(0, -3, { color: GRN, r: 6.5 }), c); const S = stair(G, { x: 0, y: -3, run: 2, rise: 1 }, { width: 3.5, labels: false }); await S.show(c); await G.drawIn(L(G), 600, c); } },
        { cap: `${T('x-2y-6=0')}: <b>cover up</b> ${T('y')}: ${T('x-6=0')}, ${T('x=6')}. Cover up ${T('x')}: ${T('-2y-6=0')}, ${T('y=-3')}. Join the two intercepts.`,
          run: async (c) => { const G = Gs[2]; await fadeIn(c, G.t); await G.reveal(G.point(6, 0, { color: XI, r: 6.5 }), c); await G.reveal(G.point(0, -3, { color: GRN, r: 6.5 }), c); await G.drawIn(L(G), 600, c); } },
        { cap: `The <b>same line</b> three times. No converting needed: each form tells you how to start the graph.`,
          run: async (c) => { for (const G of Gs) { const [px, py] = G.toPx(7.6, -3.4); const s = stamp(G.html, '✓', { ok: true, x: px, y: py, size: 'sm' }); await stampIn(c, s); } } }
      ];
    }
    if (v === 'hv') {
      const G = new Graph(stage, { x: 14, y: 6, width: 456, height: 456, xmin: -6, xmax: 6, ymin: -6, ymax: 6, xlabels: 2, ylabels: 2 });
      const Pn = panel(stage, 492, 6, ex.W - 504, 456, 'Through (−2, 4)');
      const st = { th: 45 }, A = [-2, 4], B = [-1, 5];
      const setB = () => { const r = st.th * Math.PI / 180; B[0] = -2 + Math.cos(r); B[1] = 4 + Math.sin(r); };
      const ln = G.line(A, B, { color: BLUE, width: 4 }); hide(ln);
      const liveEl = add(Pn, h('div', 'u7l7-live'), null, null), live = liveTex(liveEl), mEl = line(Pn, '', 'u7l7-dial');
      const show = () => {
        setB(); ln._bkDraw();
        if (Math.abs(st.th - 90) < 1e-6) { live('x=-2'); mEl.innerHTML = `slope <i class="m">undefined</i>`; return; }
        const m = Math.tan(st.th * Math.PI / 180), r = m > 30 ? Math.round(m) : Math.round(m * 10) / 10;
        live(Math.abs(r) < 1e-9 ? 'y-4=0(x+2)' : `y-4=${r === 1 ? '' : texNum(r)}(x+2)`); mEl.innerHTML = `slope <i class="m">${texNum(r)}</i>`;
      };
      let ghost;
      return [
        { cap: `A line through ${T('(-2,\\ 4)')} with slope ${T('1')}: ${T('y-4=1(x+2)')}.`,
          run: async (c) => { const p = G.point(-2, 4, { color: INK, r: 7, label: T('(-2,\\ 4)'), pos: 'nw' }); await G.reveal(p, c); show(); await appear(c, ln, 400); await fadeIn(c, liveEl); } },
        { cap: `Turn the slope down to ${T('0')}: ${T('y-4=0(x+2)')}, so ${T('y=4')}. A <b>horizontal</b> line, ${T('y=k')}, slope ${T('0')}.`,
          run: async (c) => { await tween(c, 1300, (t) => { st.th = 45 * (1 - t); show(); }); st.th = 0; show(); await say(c, Pn, `Horizontal: ${T('y=4')}, ${T('m=0')}`); ghost = G.line({ m: 0, b: 4 }, { color: GRAY, width: 3, dash: '7 6' }); } },
        { cap: `Now stand it up: slope ${T('1,\\ 5,\\ 20,\\ 100')}… The run shrinks toward ${T('0')} and the slope grows without limit.`,
          run: async (c) => { await tween(c, 2200, (t) => { st.th = 89.4 * Math.pow(t, 0.7); show(); }); } },
        { cap: `At ${T('90^\\circ')} the run is ${T('0')}: the slope is <b>undefined</b>, so there is no ${T('y=mx+b')} at all. Every point has ${T('x=-2')}: a <b>vertical</b> line, ${T('x=k')}.`,
          run: async (c) => { await tween(c, 400, (t) => { st.th = 89.4 + 0.6 * t; show(); }); st.th = 90; show(); await say(c, Pn, `Vertical: ${T('x=-2')}, slope undefined`); } },
        { cap: `General form fits both: ${T('y-4=0')} and ${T('x+2=0')}. Horizontal and vertical lines are <b>perpendicular</b>, even though ${T('0')} and “undefined” can’t be multiplied.`,
          run: async (c) => { void ghost; await appear(c, rmark(G, [-2, 4], [0, 4], [-2, 2], { s: 16, color: TEAL }), 300); await say(c, Pn, `General form: ${T('y-4=0')} and ${T('x+2=0')}`, 'u7l7-good'); } }
      ];
    }
    // morph
    const G = new Graph(stage, { x: 8, y: 10, width: 470, height: 368, ...win, xlabels: 2, ylabels: 2 });
    const Pn = panel(stage, 494, 10, ex.W - 506, 450, 'One line');
    const cards = FORMS.map((f) => { const d = h('div', 'u7l7-fcard', `<div class="u7l7-ftag">${f.tag}</div><div class="u7l7-eq">${T(f.eq)}</div>`); Pn.appendChild(d); hide(d); return d; });
    const on = (i) => cards.forEach((d, j) => d.classList.toggle('on', i === j));
    const work = h('div', 'u7l7-line u7l7-small'); Pn.appendChild(work);
    return [
      { cap: `Slope–point form ${T('y-1=\\frac12(x-8)')} shows a <b>point</b>, ${T('(8,\\ 1)')}, and the <b>slope</b>, ${T('\\frac12')}.`,
        run: async (c) => { on(0); await fadeIn(c, cards[0]); await G.reveal(G.point(8, 1, { color: INK, r: 7, label: T('(8,\\ 1)'), pos: 'se' }), c); await stair(G, { x: 8, y: 1, run: -2, rise: -1 }, { width: 4 }).show(c); await G.drawIn(G.line([0, -3], [2, -2], { color: BLUE, width: 4 }), 700, c); } },
        { cap: `Expand and isolate ${T('y')}: ${T('y-1=\\frac12x-4')}, so ${T('y=\\frac12x-3')}. Slope–intercept form shows ${T('b=-3')}.`,
          run: async (c) => { on(1); await fadeIn(c, cards[1]); await G.reveal(G.point(0, -3, { color: GRN, r: 7.5, label: T('b=-3'), pos: 'se' }), c); } },
        { cap: `Multiply by 2 and gather everything on one side: ${T('2y=x-6')}, so ${T('x-2y-6=0')}. General form: integers, ${T('A\\ge0')}.`,
          run: async (c) => { on(2); await fadeIn(c, cards[2]); } },
        { cap: `General form gives both intercepts by covering up: ${T('y=0')} gives ${T('x=6')}; ${T('x=0')} gives ${T('y=-3')}.`,
          run: async (c) => { await G.reveal(G.point(6, 0, { color: XI, r: 7.5, label: T('(6,\\ 0)'), pos: 'se' }), c); work.innerHTML = `${T('x-2(0)-6=0\\Rightarrow x=6')}`; await fadeIn(c, work); } },
        { cap: `Three outfits, <b>one line</b>: every point on it satisfies all three. Check ${T('(8,\\ 1)')} in general form: ${T('8-2(1)-6=0')} ✓.`,
          run: async (c) => { on(-1); cards.forEach((d) => d.classList.add('on')); await say(c, Pn, `Check ${T('(8,\\ 1)')}: ${T('8-2-6=0')} ${OK}`, 'u7l7-good'); } }
      ];
  }
};

/* =============================== explainer: the two dials (Section 1) =============================== */
const dials = {
  title: 'y = mx + b: b slides the line, m tilts it',
  height: 470,
  choices: [{ v: 'dials', label: 'Two dials' }, { v: 'ex1b', label: 'Example 1(b) check' }, { v: 'ex1d', label: 'Example 1(d) check' }],
  intro: (v) => ({ dials: 'Watch what each number in <b>y = mx + b</b> does to the line. Press <b>Next</b>.', ex1b: 'Example 1(b): the y-intercept of y = −3x + 18. Press <b>Next</b>.', ex1d: 'Example 1(d): slope −5 and y-intercept 7. Press <b>Next</b>.' })[v],
  make(stage, v, ex) {
    if (v === 'ex1b') {
      const G = new Graph(stage, { x: 14, y: 6, width: 456, height: 456, xmin: -2, xmax: 8, ymin: -4, ymax: 20, ystep: 2, ylabels: 4, xlabels: 2 });
      const Pn = panel(stage, 492, 6, ex.W - 504, 456, 'Read it off');
      return [
        { cap: `${T('y=-3x+18')} is already in the form ${T('y=mx+b')}: the slope is ${T('m=-3')} and the constant is ${T('b=18')}.`,
          run: async (c) => { await G.drawIn(G.line({ m: -3, b: 18 }, { color: BLUE, width: 4 }), 700, c); await say(c, Pn, T('y=\\color{#1f5bd6}{-3}x\\color{#12805a}{+18}'), 'u7l7-mline'); } },
        { cap: `The <b>${T('y')}-intercept</b> is the constant: the line crosses the ${T('y')}-axis at ${T('18')}.`,
          run: async (c) => { await G.reveal(G.point(0, 18, { color: GRN, r: 8, label: T('(0,\\ 18)'), pos: 'e', gap: 10 }), c); await say(c, Pn, `${T('y')}-intercept ${T('18')}`, 'u7l7-good'); } },
        { cap: `A ${T('(3)')} and B ${T('(-3)')} come from the slope: 1 right, 3 down, anywhere on the line. D ${T('(-18)')} has the wrong sign. <b>Answer C.</b>`,
          run: async (c) => { await stair(G, { x: 2, y: 12, run: 1, rise: -3 }, { width: 4 }).show(c); await say(c, Pn, `A, B: the slope, not ${T('b')}. D: wrong sign.`, 'u7l7-small'); const s = stamp(Pn, 'C', { ok: true }); s.style.alignSelf = 'center'; await stampIn(c, s); } }
      ];
    }
    if (v === 'ex1d') {
      const G = new Graph(stage, { x: 14, y: 6, width: 456, height: 456, xmin: -3, xmax: 3, ymin: -12, ymax: 12, ystep: 2, ylabels: 4, xlabels: 1 });
      const Pn = panel(stage, 492, 6, ex.W - 504, 456, 'Slope −5, y-intercept 7');
      const opt = (f, name, x, col, dash) => async (c) => { await G.drawIn(G.fn(f, { color: col, width: 3.5, dash }), 600, c); await pop(c, pill(G, x, Math.max(-10.5, Math.min(10.5, f(x))), name, { color: col })); };
      return [
        { cap: `Slope ${T('-5')} and ${T('y')}-intercept ${T('7')}: start at ${T('(0,\\ 7)')}, then <b>1 right, 5 down</b>.`,
          run: async (c) => { await G.reveal(G.point(0, 7, { color: GRN, r: 8, label: T('(0,\\ 7)'), pos: 'nw', gap: 10 }), c); await stair(G, { x: 0, y: 7, run: 1, rise: -5 }, { width: 4 }).show(c); } },
        { cap: `A: ${T('y=7x-5')} <b>swaps</b> them: its slope is ${T('7')} and it crosses at ${T('-5')}.`,
          run: async (c) => { await opt((x) => 7 * x - 5, 'A', 1.9, RED, '8 6')(c); await say(c, Pn, `A ${T('y=7x-5')}: ${T('m=7,\\ b=-5')} ${NO}`); } },
        { cap: `B: ${T('y=-\\frac15x+7')} crosses at 7, but uses the <b>reciprocal</b> slope: far too shallow.`,
          run: async (c) => { await opt((x) => -x / 5 + 7, 'B', -2.3, ORNG, '8 6')(c); await say(c, Pn, `B ${T('y=-\\tfrac15x+7')}: ${T('m=-\\tfrac15')} ${NO}`); } },
        { cap: `D: ${T('y=-5x-7')} has the right slope (it runs parallel), but crosses at ${T('-7')}.`,
          run: async (c) => { await opt((x) => -5 * x - 7, 'D', -2.4, BROWN, '8 6')(c); await say(c, Pn, `D ${T('y=-5x-7')}: ${T('b=-7')} ${NO}`); } },
        { cap: `Only C, ${T('y=-5x+7')}, has both: ${T('m=-5')} and ${T('b=7')}. <b>Answer C.</b>`,
          run: async (c) => { await opt((x) => -5 * x + 7, 'C', 0.6, BLUE)(c); await say(c, Pn, `C ${T('y=-5x+7')} ${OK}`, 'u7l7-good'); const s = stamp(Pn, 'C', { ok: true }); s.style.alignSelf = 'center'; await stampIn(c, s); } }
      ];
    }
    const G = new Graph(stage, { x: 14, y: 6, width: 456, height: 456, xmin: -6, xmax: 6, ymin: -6, ymax: 6, xlabels: 2, ylabels: 2 });
    const Pn = panel(stage, 492, 6, ex.W - 504, 456, 'The two dials');
    const st = { m: 2, b: 1 }, A = [0, 1], B = [1, 3];
    const ln = G.line(A, B, { color: BLUE, width: 4 }); hide(ln);
    const bp = G.point(0, 1, { color: GRN, r: 8 }); hide(bp);
    const S = stair(G, { x: 0, y: 1, run: 1, rise: 2 }, { width: 3.5, text: (k, v) => `${k} ${T(texNum(Math.round(v * 10) / 10))}` });
    const liveEl = add(Pn, h('div', 'u7l7-live'), null, null), live = liveTex(liveEl);
    const dm = line(Pn, '', 'u7l7-dial'), db = line(Pn, '', 'u7l7-dial');
    const show = () => {
      A[1] = st.b; B[1] = st.b + st.m; ln._bkDraw(); G.moveTo(bp, 0, st.b); S.st.y = st.b; S.st.rise = st.m; S.upd();
      live(`y=${mTex(st.m)}x${bTex(st.b)}`);
      dm.innerHTML = `<i class="m">m = ${texNum(Math.round(st.m * 10) / 10).replace('-', '−')}</i> tilts the line`; db.innerHTML = `<i class="b">b = ${texNum(Math.round(st.b * 10) / 10).replace('-', '−')}</i> slides it`;
    };
    show(); hide(liveEl); hide(dm); hide(db);
    const turn = (key, to, ms) => (c) => { const a = st[key]; return tween(c, ms, (t) => { st[key] = a + (to - a) * t; show(); }).then(() => { st[key] = to; show(); }); };
    return [
      { cap: `${T('y=2x+1')}: it crosses the ${T('y')}-axis at ${T('b=1')} and climbs 2 for every 1 across, ${T('m=2')}.`,
        run: async (c) => { await appear(c, ln, 400); await pop(c, bp); await S.show(c); await fadeIn(c, liveEl); await fadeIn(c, dm); await fadeIn(c, db); } },
      { cap: `Turn the <b>b dial</b>: ${T('b')} from 1 up to 4, then down to ${T('-3')}. The line <b>slides</b>; its steepness never changes.`,
        run: async (c) => { await pulse(c, db, 1.06); await turn('b', 4, 900)(c); await turn('b', -3, 1300)(c); } },
      { cap: `Turn the <b>m dial</b>: ${T('m')} from 2 down to ${T('\\frac12')}. The line <b>tilts</b> about its ${T('y')}-intercept, which stays put.`,
        run: async (c) => { await pulse(c, dm, 1.06); await turn('m', 0.5, 1200)(c); } },
      { cap: `Past zero: ${T('m=-2')}. A negative slope falls from left to right. ${T('b')} stayed at ${T('-3')} the whole time.`,
        run: async (c) => { await turn('m', -2, 1300)(c); } },
      { cap: `So in ${T('y=mx+b')}: <b>${T('m')}</b> is the number in front of ${T('x')} and <b>${T('b')}</b> is the constant. Read them straight off (once ${T('y')} is alone).`,
        run: async (c) => { await say(c, Pn, `${T('y=-2x-3')}: ${T('m=-2,\\ b=-3')}`, 'u7l7-good'); } }
    ];
  }
};

/* =============================== explainer: cover up / isolate y (Section 1) =============================== */
function tiles(p, terms) {
  const row = h('div', 'u7l7-tiles'); p.appendChild(row);
  row.tl = terms.map((t) => { const d = h('div', 'u7l7-tile' + (t === '=' || t === '0' ? ' eqs' : ''), T(t)); row.appendChild(d); return d; });
  return row;
}
async function cover(c, tile, lab) { const d = h('div', 'u7l7-cover', `<small>${lab}</small>${T('0')}`); tile.appendChild(d); await pop(c, d, 380); return d; }
const coverUp = {
  title: 'General form: cover up, or isolate y',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'cover', label: 'Cover up: both intercepts' }, { v: 'iso', label: 'Isolate y: balance moves' }, { v: 'ex1a', label: 'Example 1(a) check' }, { v: 'ex1c', label: 'Example 1(c) check' }],
  intro: (v) => ({ cover: 'Two intercepts straight from 4x + 3y − 12 = 0. Press <b>Next</b>.', iso: 'Solve 4x + 3y − 12 = 0 for y, one move at a time. Press <b>Next</b>.', ex1a: 'Example 1(a): the slope of 5y = 4x − 20. Press <b>Next</b>.', ex1c: 'Example 1(c): where 6x − 3y + 21 = 0 crosses the y-axis. Press <b>Next</b>.' })[v],
  make(stage, v, ex) {
    const win = v === 'ex1a' ? { xmin: -2, xmax: 8, ymin: -6, ymax: 4 } : v === 'ex1c' ? { xmin: -6, xmax: 4, ymin: -1, ymax: 9 } : { xmin: -2, xmax: 6, ymin: -2, ymax: 6 };
    const G = new Graph(stage, { x: 14, y: 6, width: 456, height: 456, ...win, xlabels: 2, ylabels: 2 });
    const Pn = panel(stage, 492, 6, ex.W - 504, 456, v === 'iso' || v === 'ex1a' ? 'Moves that keep the balance' : 'Cover up');
    if (v === 'cover') {
      const R = tiles(Pn, ['4x', '+3y', '-12', '=', '0']); let cv;
      return [
        { cap: `General form: ${T('4x+3y-12=0')}. Each term is a tile.`, run: async (c) => { for (const t of R.tl) await pop(c, t, 220); } },
        { cap: `<b>Cover up</b> the ${T('y')}-term (that is, put ${T('y=0')}): ${T('4x-12=0')}, so ${T('x=3')}. The ${T('x')}-intercept is ${T('(3,\\ 0)')}.`,
          run: async (c) => { cv = await cover(c, R.tl[1], 'y = 0'); await say(c, Pn, T('4x-12=0\\ \\Rightarrow\\ x=3')); await G.reveal(G.point(3, 0, { color: XI, r: 8, label: T('(3,\\ 0)'), pos: 'ne' }), c); } },
        { cap: `Now cover up the ${T('x')}-term (${T('x=0')}): ${T('3y-12=0')}, so ${T('y=4')}. The ${T('y')}-intercept is ${T('(0,\\ 4)')}.`,
          run: async (c) => { cv.remove(); await cover(c, R.tl[0], 'x = 0'); await say(c, Pn, T('3y-12=0\\ \\Rightarrow\\ y=4')); await G.reveal(G.point(0, 4, { color: GRN, r: 8, label: T('(0,\\ 4)'), pos: 'ne' }), c); } },
        { cap: `Two points fix a line: join the intercepts. No solving for ${T('y')} needed.`,
          run: async (c) => { await G.drawIn(G.line([3, 0], [0, 4], { color: BLUE, width: 4 }), 700, c); } }
      ];
    }
    if (v === 'iso') {
      let r1, r2, r3;
      return [
        { cap: `${T('4x+3y-12=0')}. Goal: ${T('y')} alone on the left. Every move must keep both sides equal.`,
          run: async (c) => { r1 = eqRow(Pn, ['4x', '+3y', '-12', '=', '0']); await fadeIn(c, r1); } },
        { cap: `Move ${T('4x')} across: subtracting ${T('4x')} from both sides, it arrives on the right as ${T('-4x')}.`,
          run: async (c) => { r1.tm[0].classList.add('hl'); r2 = eqRow(Pn, ['3y', '-12', '=', '-4x']); r2.tm[3].classList.add('hl'); await fly(c, stage, r1.tm[0], r2.tm[3]); } },
        { cap: `Move ${T('-12')} across: adding 12 to both sides, it arrives as ${T('+12')}. Now ${T('3y=-4x+12')}.`,
          run: async (c) => { r2.tm[1].classList.add('hl'); r3 = eqRow(Pn, ['3y', '=', '-4x', '+12']); r3.tm[3].classList.add('hl'); await fly(c, stage, r2.tm[1], r3.tm[3]); } },
        { cap: `Divide <b>every</b> term by 3: ${T('y=-\\frac43x+4')}. Slope ${T('-\\frac43')}, ${T('y')}-intercept ${T('4')}: the same 4 the cover-up gives.`,
          run: async (c) => {
            const r4 = eqRow(Pn, ['y', '=', '-\\tfrac43x', '+4']); r4.tm[2].classList.add('hl'); r4.tm[3].classList.add('hlb'); await fadeIn(c, r4);
            await G.drawIn(G.line([0, 4], [3, 0], { color: BLUE, width: 4 }), 600, c); await G.reveal(G.point(0, 4, { color: GRN, r: 8 }), c);
            await stair(G, { x: 0, y: 4, run: 3, rise: -4 }, { width: 4 }).show(c);
          } }
      ];
    }
    if (v === 'ex1a') {
      let r1;
      return [
        { cap: `${T('5y=4x-20')}. The ${T('y')} is not alone (it has a 5), so ${T('4')} is <b>not</b> the slope yet.`,
          run: async (c) => { r1 = eqRow(Pn, ['5y', '=', '4x', '-20']); await fadeIn(c, r1); r1.tm[0].classList.add('hl'); } },
        { cap: `Divide <b>every</b> term by 5: ${T('y=\\frac45x-4')}.`,
          run: async (c) => { await say(c, Pn, T('\\dfrac{5y}{5}=\\dfrac{4x}{5}-\\dfrac{20}{5}')); const r = eqRow(Pn, ['y', '=', '\\tfrac45x', '-4']); r.tm[2].classList.add('hl'); await fadeIn(c, r); } },
        { cap: `Now read it: ${T('m=\\frac45')} (and ${T('b=-4')}). From ${T('(0,\\ -4)')}: 5 right, 4 up.`,
          run: async (c) => { await G.drawIn(G.line([0, -4], [5, 0], { color: BLUE, width: 4 }), 600, c); await G.reveal(G.point(0, -4, { color: GRN, r: 8 }), c); await stair(G, { x: 0, y: -4, run: 5, rise: 4 }, { width: 4 }).show(c); await say(c, Pn, `${T('m=\\tfrac45')}`, 'u7l7-good u7l7-mline'); } }
      ];
    }
    // ex1c
    const R = tiles(Pn, ['6x', '-3y', '+21', '=', '0']); let cv;
    return [
      { cap: `${T('6x-3y+21=0')}: we want where it crosses the ${T('y')}-axis, so ${T('x=0')} there.`, run: async (c) => { for (const t of R.tl) await pop(c, t, 220); } },
      { cap: `Cover up the ${T('x')}-term: ${T('-3y+21=0')}, so ${T('-3y=-21')} and ${T('y=7')}.`,
        run: async (c) => { cv = await cover(c, R.tl[0], 'x = 0'); await say(c, Pn, T('-3y+21=0')); await say(c, Pn, T('-3y=-21\\ \\Rightarrow\\ y=7')); } },
      { cap: `The line crosses the ${T('y')}-axis at ${T('(0,\\ 7)')}. <b>Answer B.</b> (Isolating ${T('y')} gives ${T('y=2x+7')}: the same ${T('b')}.)`,
        run: async (c) => { await G.reveal(G.point(0, 7, { color: GRN, r: 8, label: T('(0,\\ 7)'), pos: 'nw', gap: 10 }), c); await G.drawIn(G.line({ m: 2, b: 7 }, { color: BLUE, width: 4 }), 600, c); const s = stamp(Pn, 'B', { ok: true }); s.style.alignSelf = 'center'; await stampIn(c, s); } },
      { cap: `Cover up ${T('y')} instead: ${T('6x+21=0')}, so ${T('x=-3.5')}, the ${T('x')}-intercept. (A ${T('(0,\\ 21)')} forgot to divide by ${T('-3')}.)`,
        run: async (c) => { cv.remove(); await cover(c, R.tl[1], 'y = 0'); await G.reveal(G.point(-3.5, 0, { color: XI, r: 8, label: T('(-3.5,\\ 0)'), pos: 'nw' }), c); } }
    ];
  }
};

/* =============================== explainer: from a graph to general form (Section 2) =============================== */
function machine(p) {
  const m = h('div', 'u7l7-mach', '<div class="u7l7-mach-h">Tidy-up machine: general form</div>'); p.appendChild(m);
  const rules = h('div', 'u7l7-rules'); m.appendChild(rules);
  m.r = ['integers', 'A ≥ 0', 'no common factor', '= 0'].map((t) => { const d = h('div', 'u7l7-rule', t); rules.appendChild(d); return d; });
  m.light = async (c, i) => { m.r[i].classList.add('on'); await pulse(c, m.r[i], 1.12); };
  return m;
}
const graphToEq = {
  title: 'From a graph to general form',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ex2a', label: 'Example 2(a) check' }, { v: 'ex2b', label: 'Example 2(b) check' }, { v: 'tidy', label: 'The tidy-up machine' }],
  intro: (v) => ({ ex2a: 'Example 2(a): read two lattice points, find the slope, then tidy up. Press <b>Next</b>.', ex2b: 'Example 2(b): the point (10.3, k) on line PQ. Press <b>Next</b>.', tidy: 'Feed y = −¾x + 5/2 into the tidy-up machine. Press <b>Next</b>.' })[v],
  make(stage, v, ex) {
    if (v === 'tidy') {
      const G = new Graph(stage, { x: 14, y: 6, width: 456, height: 456, xmin: -4, xmax: 6, ymin: -3, ymax: 7, xlabels: 2, ylabels: 2 });
      const Pn = panel(stage, 492, 6, ex.W - 504, 456, 'In: y = −¾x + 5/2');
      const M = machine(Pn);
      return [
        { cap: `Into the machine: ${T('y=-\\frac34x+\\frac52')}. General form has rules: integers, ${T('A\\ge0')}, no common factor, everything on one side.`,
          run: async (c) => { await G.drawIn(G.line([2, 1], [-2, 4], { color: BLUE, width: 4 }), 600, c); await say(c, Pn, T('y=-\\tfrac34x+\\tfrac52'), 'u7l7-mline'); } },
        { cap: `<b>Integers</b>: multiply every term by 4, the common denominator: ${T('4y=-3x+10')}.`,
          run: async (c) => { await say(c, Pn, T('4y=-3x+10')); await M.light(c, 0); } },
        { cap: `<b>Everything on one side</b>, with the ${T('x')}-term positive: ${T('3x+4y-10=0')}. ${T('A=3\\ge0')} ✓.`,
          run: async (c) => { await say(c, Pn, T('3x+4y-10=0'), 'u7l7-mline'); await M.light(c, 3); await M.light(c, 1); } },
        { cap: `${T('3')}, ${T('4')} and ${T('-10')} share <b>no common factor</b> ✓. Out comes ${T('3x+4y-10=0')}. Check the lattice point ${T('(2,\\ 1)')}: ${T('6+4-10=0')} ✓.`,
          run: async (c) => { await M.light(c, 2); await G.reveal(G.point(2, 1, { color: INK, r: 7, label: T('(2,\\ 1)'), pos: 'ne' }), c); await say(c, Pn, `${T('3(2)+4(1)-10=0')} ${OK}`, 'u7l7-good'); } },
        { cap: `If ${T('A')} came out negative (${T('-3x-4y+10=0')}), multiply by ${T('-1')}. If all three shared a factor (${T('6x+8y-20=0')}), divide it out.`,
          run: async (c) => { await say(c, Pn, `${T('-3x-4y+10=0')} → ×(−1)`, 'u7l7-small'); await say(c, Pn, `${T('6x+8y-20=0')} → ÷2`, 'u7l7-small'); } }
      ];
    }
    const big = v === 'ex2b';
    const G = new Graph(stage, { x: 8, y: 8, width: 500, height: 346, xmin: -12, xmax: 6, ymin: -3, ymax: 9, xlabels: 2, ylabels: 2 });
    const Pn = panel(stage, 524, 8, ex.W - 536, 452, big ? 'Find k' : 'Equation of PQ');
    const L = G.line([-9, 0], [0, 6], { color: BLUE, width: 4 });
    const P = npt(G, 'P', -9, 0, { pos: 'nw' }), Q = npt(G, 'Q', 0, 6, { pos: 'nw' });
    void L; void P;
    if (big) {
      let pt;
      return [
        { cap: `Line ${T('PQ')} is ${T('y=\\frac23x+6')} (part (a)). The point ${T('(10.3,\\ k)')} is off the right edge of the grid.`,
          run: async (c) => { await say(c, Pn, T('y=\\tfrac23x+6'), 'u7l7-mline'); } },
        { cap: `Widen the window so ${T('x=10.3')} fits.`,
          run: async (c) => { await G.setWindow({ xmin: -12, xmax: 14, ymin: -3, ymax: 15 }, c, 1100); } },
        { cap: `Substitute ${T('x=10.3')}: ${T('k=\\frac23(10.3)+6=6.8\\overline{6}+6=12.8\\overline{6}')}.`,
          run: async (c) => { await G.drawIn(G.guides(10.3, 12.8667), 500, c); pt = G.point(10.3, 12.8667, { color: TEAL, r: 8, label: T('(10.3,\\ k)'), pos: 'nw' }); await G.reveal(pt, c); await say(c, Pn, T('k=\\tfrac23(10.3)+6')); await say(c, Pn, T('=6.8\\overline{6}+6=12.8\\overline{6}')); } },
        { cap: `To the nearest tenth, ${T('k\\approx12.9')}. (On the TI-30XIIS: ${T('2\\div3\\times10.3+6')}.)`,
          run: async (c) => { await say(c, Pn, T('k\\approx12.9'), 'u7l7-good u7l7-mline'); } }
      ];
    }
    let mac;
    return [
      { cap: `Read two lattice points off the graph: ${T('P(-9,\\ 0)')} and ${T('Q(0,\\ 6)')}.`,
        run: async (c) => { P.label.innerHTML = T('P(-9,\\ 0)'); Q.label.innerHTML = T('Q(0,\\ 6)'); await pulse(c, P.label, 1.25); await pulse(c, Q.label, 1.25); } },
      { cap: `Slope from ${T('P')} to ${T('Q')}: run 9, rise 6. ${T('m=\\frac{6-0}{0-(-9)}=\\frac69=\\frac23')}.`,
        run: async (c) => { await stair(G, { x: -9, y: 0, run: 9, rise: 6 }, { width: 4, flipRun: true }).show(c); await say(c, Pn, T('m=\\dfrac{6-0}{0-(-9)}=\\dfrac23')); } },
      { cap: `${T('Q')} is on the ${T('y')}-axis, so ${T('b=6')}: ${T('y=\\frac23x+6')}.`,
        run: async (c) => { Q.querySelector('circle').setAttribute('fill', GRN); await pulse(c, Q, 1.6); await say(c, Pn, T('y=\\tfrac23x+6'), 'u7l7-mline'); mac = machine(Pn); await fadeIn(c, mac); } },
      { cap: `<b>Integers</b>: multiply every term by 3: ${T('3y=2x+18')}.`,
        run: async (c) => { await say(c, Pn, T('3y=2x+18')); await mac.light(c, 0); } },
      { cap: `<b>One side</b>, ${T('x')}-term positive: subtract ${T('3y')} from both sides, ${T('0=2x-3y+18')}. So ${T('2x-3y+18=0')}; no common factor.`,
        run: async (c) => { await say(c, Pn, T('2x-3y+18=0'), 'u7l7-mline u7l7-good'); await mac.light(c, 3); await mac.light(c, 1); await mac.light(c, 2); } },
      { cap: `Check both points. ${T('P')}: ${T('2(-9)-3(0)+18=0')} ✓. ${T('Q')}: ${T('2(0)-3(6)+18=0')} ✓.`,
        run: async (c) => { await say(c, Pn, `${T('P')}: ${T('-18-0+18=0')} ${OK} &ensp; ${T('Q')}: ${T('0-18+18=0')} ${OK}`, 'u7l7-small'); } }
    ];
  }
};

/* =============================== explainer: testing perpendicularity (Section 3) =============================== */
const perpTest = {
  title: 'Perpendicular: slopes multiply to −1',
  height: 470,
  choices: [{ v: 'why', label: 'Why −1? Turn the triangle' }, { v: 'ex3a', label: 'Example 3(a) check' }, { v: 'ex3b', label: 'Example 3(b) check' }, { v: 'ex3c', label: 'Example 3(c) check' }],
  intro: (v) => ({ why: 'Main St from the warm-up has slope ½. Turn its slope triangle 90°. Press <b>Next</b>.', ex3a: 'Example 3(a): perpendicular to 4y + x + 8 = 0. Press <b>Next</b>.', ex3b: 'Example 3(b): which pairs of the four lines are perpendicular? Press <b>Next</b>.', ex3c: 'Example 3(c): perpendicular to 6x + y + 5 = 0. Press <b>Next</b>.' })[v],
  make(stage, v, ex) {
    const W = v === 'ex3b' || v === 'ex3c' || v === 'ex3a' ? { xmin: -4, xmax: 4, ymin: -4, ymax: 4 } : { xmin: -6, xmax: 6, ymin: -6, ymax: 6 };
    const G = new Graph(stage, { x: 14, y: 6, width: 456, height: 456, ...W, xlabels: v === 'why' ? 2 : 1, ylabels: v === 'why' ? 2 : 1 });
    const Pn = panel(stage, 492, 6, ex.W - 504, 456, v === 'why' ? 'Turn it' : 'Compare the slopes');
    if (v === 'why') {
      // corner on Main St itself (y = x/2 + 2): (-2, 1)
      const O = [-2, 1], tri = turnTri(G, 4, 2, { ox: O[0], oy: O[1], a: 0 }, { hypColor: BLUE });
      tri.els.forEach(hide);
      let l1, l2;
      return [
        { cap: `Main St has slope ${T('\\frac12')}. A slope triangle on it: run 4, rise 2.`,
          run: async (c) => { await G.drawIn(G.line(O, [2, 3], { color: BLUE, width: 3.5 }), 600, c); tri.els.forEach((e) => (e.style.opacity = 1)); await tri.show(c); l1 = legLab(G, AMB, 'run 4', 0, 1, 's'); l2 = legLab(G, PUR, 'rise 2', 2, 2, 'e'); await fadeIn(c, l1); await fadeIn(c, l2); await say(c, Pn, T('m_1=\\frac{2}{4}=\\frac12'), 'u7l7-mline'); } },
        { cap: `Turn the whole triangle a <b>quarter turn</b> (90°) about its corner at ${T('(-2,\\ 1)')}.`,
          run: async (c) => { G.remove(l1, l2); await tri.turn(c, 90); } },
        { cap: `The old run (4) now points <b>up</b>: rise 4. The old rise (2) now points <b>left</b>: run ${T('-2')}. ${T('m_2=\\frac{4}{-2}=-2')}.`,
          run: async (c) => { tri.swap(); await fadeIn(c, legLab(G, PUR, 'rise 4', -2, 3, 'e')); await fadeIn(c, legLab(G, AMB, 'run −2', -3, 5, 'n')); await say(c, Pn, T('m_2=\\frac{4}{-2}=-2'), 'u7l7-mline'); } },
        { cap: `${T('\\frac12')} became ${T('-2')}: <b>flipped</b> and <b>sign changed</b>. Their product is ${T('\\frac12\\times(-2)=-1')}, and the lines meet at 90°.`,
          run: async (c) => { await G.drawIn(G.line(O, [-4, 5], { color: TEAL, width: 3.5 }), 600, c); await appear(c, rmark(G, O, [2, 3], [-4, 5], { s: 16, color: TEAL }), 300); await say(c, Pn, T('m_1\\times m_2=\\tfrac12\\times(-2)=-1'), 'u7l7-good'); } }
      ];
    }
    if (v === 'ex3a') {
      const X = [-8 / 17, -32 / 17];
      return [
        { cap: `${T('4y+x+8=0')}: isolate ${T('y')}. ${T('4y=-x-8')}, so ${T('y=-\\frac14x-2')} and ${T('m=-\\frac14')}.`,
          run: async (c) => { await G.drawIn(G.line({ m: -0.25, b: -2 }, { color: BLUE, width: 4 }), 600, c); await stair(G, { x: -4, y: -1, run: 4, rise: -1 }, { width: 3.5 }).show(c); await say(c, Pn, T('y=-\\tfrac14x-2,\\ m=-\\tfrac14')); } },
        { cap: `Perpendicular slope: flip ${T('\\frac14')} to ${T('4')} and change the sign: ${T('m=4')}.`,
          run: async (c) => { await say(c, Pn, `⊥: ${T('m=4')}`, 'u7l7-mline'); } },
        { cap: `Only A, ${T('y=4x')}, has slope ${T('4')}. Check: ${T('-\\frac14\\times4=-1')} ✓.`,
          run: async (c) => { await G.drawIn(G.line({ m: 4, b: 0 }, { color: TEAL, width: 4 }), 600, c); await pop(c, pill(G, 0.85, 3.4, 'A', { color: TEAL })); await appear(c, rmark(G, X, [X[0] + 1, X[1] - 0.25], [X[0] + 0.25, X[1] + 1], { s: 15, color: TEAL }), 300); await say(c, Pn, `A ${T('y=4x')}: ${T('-\\tfrac14\\times4=-1')} ${OK}`, 'u7l7-good'); } },
        { cap: `B ${T('(m=1)')}, C ${T('(m=\\frac14)')} and D ${T('(m=-\\frac14)')} all fail; D is even <b>parallel</b> to the given line. <b>Answer A.</b>`,
          run: async (c) => { await G.drawIn(G.line({ m: -0.25, b: 0 }, { color: GRAY, width: 3, dash: '7 6' }), 500, c); await pop(c, pill(G, 3.2, -0.35, 'D', { color: GRAY })); await say(c, Pn, `B: ${T('1')} ${NO} &ensp; C: ${T('\\tfrac14')} ${NO} &ensp; D: ${T('-\\tfrac14')} ${NO}`, 'u7l7-small'); const s = stamp(Pn, 'A', { ok: true }); s.style.alignSelf = 'center'; await stampIn(c, s); } }
      ];
    }
    if (v === 'ex3b') {
      const Ls = [
        { n: '1)', m: 4, b: 0, col: BLUE, at: 0.75 }, { n: '2)', m: -4, b: 5, col: BROWN, at: 1.95 },
        { n: '3)', m: 0.25, b: 0.75, col: ORNG, at: -3.2 }, { n: '4)', m: -0.25, b: 1.75, col: TEAL, at: -3.2 }
      ];
      const A = [7 / 17, 28 / 17], B = [1, 1];
      return [
        { cap: `Isolate ${T('y')} in each: ${T('1)\\ y=4x')}, ${T('2)\\ y=-4x+5')}, ${T('3)\\ y=\\frac14x+\\frac34')}, ${T('4)\\ y=-\\frac14x+\\frac74')}.`,
          run: async (c) => { for (const L of Ls) { await G.drawIn(G.line({ m: L.m, b: L.b }, { color: L.col, width: 3.5 }), 400, c); await pop(c, pill(G, L.at, L.m * L.at + L.b + (L.m > 0 ? 0.45 : 0.45), L.n, { color: L.col }), 260); } } },
        { cap: `The slopes are ${T('4')}, ${T('-4')}, ${T('\\frac14')} and ${T('-\\frac14')}. Look for pairs that multiply to ${T('-1')}.`,
          run: async (c) => { await say(c, Pn, T('m_1=4,\\ m_2=-4,\\ m_3=\\tfrac14,\\ m_4=-\\tfrac14')); } },
        { cap: `${T('1)\\&4)')}: ${T('4\\times\\left(-\\frac14\\right)=-1')} ✓. Lines 1 and 4 meet at a right angle.`,
          run: async (c) => { await appear(c, rmark(G, A, [A[0] + 0.25, A[1] + 1], [A[0] + 1, A[1] - 0.25], { s: 15, color: TEAL }), 300); await say(c, Pn, `${T('1)\\&4)')}: ${T('4\\times(-\\tfrac14)=-1')} ${OK}`); } },
        { cap: `${T('2)\\&3)')}: ${T('-4\\times\\frac14=-1')} ✓. They meet at ${T('(1,\\ 1)')}, also square.`,
          run: async (c) => { await appear(c, rmark(G, B, [B[0] + 0.25, B[1] - 1], [B[0] + 1, B[1] + 0.25], { s: 15, color: ORNG }), 300); await say(c, Pn, `${T('2)\\&3)')}: ${T('-4\\times\\tfrac14=-1')} ${OK}`); } },
        { cap: `No other pair works: ${T('1)\\&2)')} give ${T('-16')}, ${T('1)\\&3)')} give ${T('1')}. <b>Answer C.</b>`,
          run: async (c) => { await say(c, Pn, `${T('1)\\&2)')}: ${T('-16')} ${NO} &ensp; ${T('1)\\&3)')}: ${T('1')} ${NO}`, 'u7l7-small'); const s = stamp(Pn, 'C', { ok: true }); s.style.alignSelf = 'center'; await stampIn(c, s); } }
      ];
    }
    // ex3c
    const X = [-33 / 37, 13 / 37];
    return [
      { cap: `${T('6x+y+5=0')} gives ${T('y=-6x-5')}, so ${T('m=-6')}. A perpendicular line needs the negative reciprocal, ${T('\\frac16')}.`,
        run: async (c) => { await G.drawIn(G.line({ m: -6, b: -5 }, { color: BLUE, width: 4 }), 600, c); await say(c, Pn, `${T('m=-6')} → need ${T('\\tfrac16')}`, 'u7l7-mline'); } },
      { cap: `Isolate ${T('y')} in each option. i) ${T('y=-\\frac16x+\\frac12')}, ii) ${T('y=\\frac16x+\\frac12')}, iii) ${T('y=6x+3')}, iv) ${T('y=-\\frac16x-\\frac12')}.`,
        run: async (c) => { await say(c, Pn, `i) ${T('-\\tfrac16')} ${NO} &ensp; ii) ${T('\\tfrac16')} ${OK}`); await say(c, Pn, `iii) ${T('6')} ${NO} &ensp; iv) ${T('-\\tfrac16')} ${NO}`); } },
      { cap: `Only ii) has slope ${T('\\frac16')}: ${T('-6\\times\\frac16=-1')} ✓, a right angle.`,
        run: async (c) => { await G.drawIn(G.line({ m: 1 / 6, b: 0.5 }, { color: TEAL, width: 4 }), 600, c); await pop(c, pill(G, 3, 1.35, 'ii)', { color: TEAL })); await appear(c, rmark(G, X, [X[0] + 1, X[1] + 1 / 6], [X[0] + 1 / 6, X[1] - 1], { s: 15, color: TEAL }), 300); } },
      { cap: `i) and iv) only <b>flip</b>; iii) only <b>changes the sign</b>. <b>Answer B.</b>`,
        run: async (c) => { await G.drawIn(G.line({ m: 6, b: 3 }, { color: GRAY, width: 3, dash: '7 6' }), 500, c); await pop(c, pill(G, -0.35, 2.4, 'iii)', { color: GRAY })); const s = stamp(Pn, 'B', { ok: true }); s.style.alignSelf = 'center'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== ★ explainer: altitudes (Section 4) =============================== */
const TRI = { D: [-7, -3], E: [3, 1], F: [-6, 9] };
const altitude = {
  title: '★ The altitude: the side’s slope triangle, turned 90°',
  height: 470,
  choices: [{ v: 'ex4a', label: 'Example 4(a) check: altitude from F' }, { v: 'ex4b', label: 'Example 4(b) check: ⊥ through C' }, { v: 'three', label: 'All three altitudes' }],
  intro: (v) => ({ ex4a: 'DE has slope 2/5 and F is (−6, 9). (D and E are drawn for illustration: only DE’s slope and F matter.) Press <b>Next</b>.', ex4b: 'AB is x − 3y + 6 = 0; CD is perpendicular to AB at C. Press <b>Next</b>.', three: 'Every vertex has an altitude. Where do the three meet? Press <b>Next</b>.' })[v],
  make(stage, v, ex) {
    if (v === 'ex4b') {
      const G = new Graph(stage, { x: 8, y: 60, width: 470, height: 307, xmin: -8, xmax: 8, ymin: -3, ymax: 7, xlabels: 2, ylabels: 2 });
      const Pn = panel(stage, 494, 6, ex.W - 506, 456, 'CD ⊥ AB');
      const C = [0, 2], tri = turnTri(G, 3, 1, { ox: 0, oy: 2, a: 0 }, { hypColor: BLUE }); tri.els.forEach(hide);
      let l1, l2;
      return [
        { cap: `${T('AB')}: ${T('x-3y+6=0')}. Cover up ${T('x')}: ${T('-3y+6=0')}, ${T('y=2')}. So ${T('C(0,\\ 2)')}.`,
          run: async (c) => { await G.drawIn(G.line([-6, 0], [6, 4], { color: INK, width: 3.5 }), 600, c); await pop(c, G.label(-7.2, -0.4, T('A'), { cls: 'bk-ptlab', pos: 'n', gap: 12 })); await pop(c, G.label(7.2, 4.4, T('B'), { cls: 'bk-ptlab', pos: 'n', gap: 12 })); await G.reveal(G.point(...C, { color: GRN, r: 8, label: T('C(0,\\ 2)'), pos: 'se' }), c); await say(c, Pn, `${T('C')}: ${T('-3y+6=0\\Rightarrow y=2')}`); } },
        { cap: `Slope of ${T('AB')}: ${T('3y=x+6')}, ${T('y=\\frac13x+2')}, so ${T('m_{AB}=\\frac13')}: run 3, rise 1.`,
          run: async (c) => { tri.els.forEach((e) => (e.style.opacity = 1)); await tri.show(c); l1 = legLab(G, AMB, 'run 3', 1.5, 2, 's'); l2 = legLab(G, PUR, 'rise 1', 3, 2.5, 'e'); await fadeIn(c, l1); await fadeIn(c, l2); await say(c, Pn, T('m_{AB}=\\tfrac13')); } },
        { cap: `Turn the slope triangle a quarter turn about ${T('C')}: run 3, rise 1 becomes <b>rise 3</b>, <b>run ${T('-1')}</b>.`,
          run: async (c) => { G.remove(l1, l2); await tri.turn(c, 90); tri.swap(); await fadeIn(c, legLab(G, PUR, 'rise 3', 0, 3.5, 'e')); await fadeIn(c, legLab(G, AMB, 'run −1', -0.5, 5, 'n')); } },
        { cap: `${T('m_{CD}=\\frac{3}{-1}=-3')}. Slope–point through ${T('C')}: ${T('y-2=-3(x-0)')}, so ${T('y=-3x+2')}.`,
          run: async (c) => { await G.drawIn(G.segment([1, -1], [-1, 5], { color: TEAL, width: 4, dash: '9 7' }), 600, c); await pop(c, G.label(-1, 5, T('D'), { cls: 'bk-ptlab', pos: 'w', gap: 10 })); await appear(c, rmark(G, C, [3, 3], [-1, 5], { s: 15, color: TEAL }), 300); await say(c, Pn, T('m_{CD}=-3')); await say(c, Pn, T('y-2=-3(x-0)\\Rightarrow y=-3x+2')); } },
        { cap: `General form: ${T('3x+y-2=0')}. Check ${T('C')}: ${T('3(0)+2-2=0')} ✓. <b>Answer B.</b>`,
          run: async (c) => { await say(c, Pn, T('3x+y-2=0'), 'u7l7-mline u7l7-good'); const s = stamp(Pn, 'B', { ok: true }); s.style.alignSelf = 'center'; await stampIn(c, s); } }
      ];
    }
    const G = new Graph(stage, { x: 8, y: 6, width: 385, height: 460, xmin: -9, xmax: 5, ymin: -5, ymax: 12, xlabels: 2, ylabels: 2, fontSize: 15 });
    const Pn = panel(stage, 408, 6, ex.W - 420, 456, v === 'three' ? 'Three altitudes' : 'Altitude from F');
    const { D, E, F } = TRI;
    const triangle = async (c) => {
      await G.drawIn(G.polyline([D, E, F, D], { color: INK, width: 3.2 }), 700, c);
      for (const [n, p, pos] of [['D', D, 'sw'], ['E', E, 'e'], ['F', F, 'nw']]) await G.reveal(npt(G, n, ...p, { pos }), c, 200);
    };
    if (v === 'three') {
      const fF = foot(F, D, E), fD = foot(D, E, F), fE = foot(E, D, F), Hc = [-3, 1.5];
      const alt = async (c, V, ft, Sp, col) => { await G.drawIn(G.segment(V, ft, { color: col, width: 3.5, dash: '8 6' }), 600, c); await appear(c, rmark(G, ft, V, Sp, { s: 12, color: col }), 200); };
      return [
        { cap: `The altitude from ${T('F')} (Example 4(a)): slope ${T('-\\frac52')}, perpendicular to ${T('DE')}.`,
          run: async (c) => { await triangle(c); await alt(c, F, fF, E, TEAL); await say(c, Pn, `from ${T('F')}: ${T('m=-\\tfrac52')} (${T('m_{DE}=\\tfrac25')})`); } },
        { cap: `From ${T('D')}: ${T('m_{EF}=\\frac{9-1}{-6-3}=-\\frac89')}, so the altitude from ${T('D')} has slope ${T('\\frac98')}.`,
          run: async (c) => { await alt(c, D, fD, F, ORNG); await say(c, Pn, `from ${T('D')}: ${T('m=\\tfrac98')} (${T('m_{EF}=-\\tfrac89')})`); } },
        { cap: `From ${T('E')}: ${T('m_{DF}=\\frac{9-(-3)}{-6-(-7)}=12')}, so the altitude from ${T('E')} has slope ${T('-\\frac1{12}')}.`,
          run: async (c) => { await alt(c, E, fE, F, PUR); await say(c, Pn, `from ${T('E')}: ${T('m=-\\tfrac1{12}')} (${T('m_{DF}=12')})`); } },
        { cap: `All three altitudes pass through <b>one point</b>, ${T('(-3,\\ 1.5)')}. That happens in every triangle.`,
          run: async (c) => { await G.reveal(G.point(...Hc, { color: RED, r: 8, label: T('(-3,\\ 1.5)'), pos: 'sw', gap: 8 }), c); await say(c, Pn, `They meet at ${T('(-3,\\ 1.5)')}`, 'u7l7-good'); } }
      ];
    }
    // ex4a ★
    const tri = turnTri(G, 5, 2, { ox: D[0], oy: D[1], a: 0 }, { hypColor: BLUE }); tri.els.forEach(hide);
    const fF = foot(F, D, E); let l1, l2;
    return [
      { cap: `Triangle ${T('DEF')}. Side ${T('DE')} has slope ${T('\\frac25')}: its slope triangle is <b>run 5, rise 2</b>.`,
        run: async (c) => { await triangle(c); tri.els.forEach((e) => (e.style.opacity = 1)); await tri.show(c); l1 = legLab(G, AMB, 'run 5', -4.5, -3, 's'); l2 = legLab(G, PUR, 'rise 2', -2, -2, 'e'); await fadeIn(c, l1); await fadeIn(c, l2); await say(c, Pn, T('m_{DE}=\\tfrac25')); } },
      { cap: `The altitude from ${T('F')} must be <b>perpendicular</b> to ${T('DE')}. Slide a copy of the slope triangle up to ${T('F')}.`,
        run: async (c) => { G.remove(l1, l2); await tri.slide(c, F[0], F[1]); } },
      { cap: `Now turn it a <b>quarter turn</b> clockwise about ${T('F')}. The run of 5 swings down; the rise of 2 swings across.`,
        run: async (c) => { await tri.turn(c, -90, 1600); } },
      { cap: `The turned triangle is <b>rise ${T('-5')}, run 2</b>: ${T('m=\\frac{-5}{2}=-\\frac52')}, the negative reciprocal of ${T('\\frac25')}.`,
        run: async (c) => { tri.swap(); await fadeIn(c, legLab(G, PUR, 'rise −5', -6, 6.5, 'w')); await fadeIn(c, legLab(G, AMB, 'run 2', -5, 4, 's')); await say(c, Pn, `${T('m=-\\tfrac52')} <span class="u7l7-small">(${T('\\tfrac25\\times(-\\tfrac52)=-1')})</span>`); } },
      { cap: `Follow that slope down from ${T('F')}: the <b>altitude</b> meets side ${T('DE')} at a right angle.`,
        run: async (c) => { tri.dim(0.3); await G.drawIn(G.segment(F, fF, { color: TEAL, width: 4.5, dash: '9 7' }), 800, c); await appear(c, rmark(G, fF, F, E, { s: 13, color: TEAL }), 300); } },
      { cap: `Slope–point through ${T('F(-6,\\ 9)')}: ${T('y-9=-\\frac52(x+6)')}, so ${T('y=-\\frac52x-15+9=-\\frac52x-6')}.`,
        run: async (c) => { await say(c, Pn, T('y-9=-\\tfrac52(x+6)')); await say(c, Pn, T('y=-\\tfrac52x-6')); } },
      { cap: `Multiply by 2: ${T('2y=-5x-12')}, so ${T('5x+2y=-12')}. Check ${T('F')}: ${T('5(-6)+2(9)=-12')} ✓. <b>Answer C.</b>`,
        run: async (c) => { await say(c, Pn, T('5x+2y=-12'), 'u7l7-mline u7l7-good'); await say(c, Pn, `${T('F')}: ${T('-30+18=-12')} ${OK}`, 'u7l7-small'); const s = stamp(Pn, 'C', { ok: true }); s.style.alignSelf = 'center'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: rate of change (Section 5) =============================== */
const rate = {
  title: 'A rate of change from two measurements',
  height: 470,
  choices: [{ v: 'ex5', label: 'Example 5 check' }, { v: 'units', label: 'Per metre or per kilometre?' }],
  intro: (v) => ({ ex5: 'Base of the trail: 15.4 °C. 2 400 m higher: 1.0 °C. Press <b>Next</b>.', units: 'Same two measurements, two different units for the run. Press <b>Next</b>.' })[v],
  make(stage, v, ex) {
    const G = new Graph(stage, { x: 8, y: 18, width: 470, height: 444, xmin: 0, xmax: 3, ymin: -2, ymax: 18, xstep: 0.25, xlabels: 0.5, ystep: 1, ylabels: 2, xtitle: '\\text{km}', ytitle: '^\\circ\\text{C}', origin: true });
    const Pn = panel(stage, 494, 6, ex.W - 506, 456, v === 'units' ? 'Choose the units' : 'Rate of change');
    const base = () => G.point(0, 15.4, { color: INK, r: 7, label: T('(0,\\ 15.4)'), pos: 'ne' }), top = () => G.point(2.4, 1, { color: INK, r: 7, label: T('(2.4,\\ 1.0)'), pos: 'n', gap: 10 });
    if (v === 'units') {
      return [
        { cap: `The two measurements: ${T('15.4\\,^\\circ\\text{C}')} at the base, ${T('1.0\\,^\\circ\\text{C}')} at ${T('2\\,400')} m. The rise is ${T('1.0-15.4=-14.4')} °C either way.`,
          run: async (c) => { await G.reveal(base(), c); await G.reveal(top(), c); await G.drawIn(G.segment([0, 15.4], [2.4, 1], { color: BLUE, width: 4 }), 500, c); } },
        { cap: `Run in <b>metres</b>: ${T('\\frac{-14.4}{2\\,400}=-0.006')} °C per m. True, but not the units asked for.`,
          run: async (c) => { await say(c, Pn, `${T('\\dfrac{-14.4\\ ^\\circ\\text{C}}{2\\,400\\text{ m}}=-0.006')} °C/m`); } },
        { cap: `Run in <b>kilometres</b>: ${T('\\frac{-14.4}{2.4}=-6.0')} °C per km. A km is ${T('1\\,000')} m, so the rate per km is ${T('1\\,000')} times the rate per m.`,
          run: async (c) => { await say(c, Pn, `${T('\\dfrac{-14.4\\ ^\\circ\\text{C}}{2.4\\text{ km}}=-6.0')} °C/km`, 'u7l7-good'); await say(c, Pn, T('-0.006\\times1\\,000=-6'), 'u7l7-small'); } },
        { cap: `Same slope, different units. A rate’s units are always <b>output per input</b>: convert the input to the unit asked for <i>before</i> dividing.`,
          run: async (c) => { await say(c, Pn, `<b>output per input</b>: °C per km`); } }
      ];
    }
    return [
      { cap: `Input: <b>elevation</b> (km). Output: <b>temperature</b> (°C). At the base: ${T('(0,\\ 15.4)')}.`,
        run: async (c) => { await G.reveal(base(), c); } },
      { cap: `The question asks per <b>km</b>: ${T('2\\,400')} m ${T('=2.4')} km. At the top: ${T('(2.4,\\ 1.0)')}.`,
        run: async (c) => { await say(c, Pn, T('2\\,400\\text{ m}\\div1\\,000=2.4\\text{ km}')); await G.reveal(top(), c); } },
      { cap: `Run ${T('2.4')} km; rise ${T('1.0-15.4=-14.4')} °C.`,
        run: async (c) => { await G.drawIn(G.segment([0, 15.4], [2.4, 1], { color: BLUE, width: 4 }), 500, c); await stair(G, { x: 0, y: 15.4, run: 2.4, rise: -14.4 }, { width: 4, runText: `run ${T('2.4')} km`, riseText: `rise ${T('-14.4')} °C`, flipRun: true }).show(c); } },
      { cap: `Rate ${T('=\\frac{\\Delta\\text{temperature}}{\\Delta\\text{elevation}}=\\frac{-14.4}{2.4}=-6.0')} °C/km.`,
        run: async (c) => { await say(c, Pn, `${T('\\dfrac{1.0-15.4}{2.4}=\\dfrac{-14.4}{2.4}=-6.0')}`, 'u7l7-mline'); await say(c, Pn, T('-6.0\\,^\\circ\\text{C/km}'), 'u7l7-good u7l7-mline'); } },
      { cap: `Meaning: each kilometre climbed is ${T('6.0\\,^\\circ\\text{C}')} colder: ${T('15.4\\to9.4\\to3.4')}, and ${T('1.0')} at 2.4 km.`,
        run: async (c) => {
          for (const [x, y] of [[0, 15.4], [1, 9.4]]) { const S = stair(G, { x, y, run: 1, rise: -6 }, { width: 3, labels: false, runColor: AMB, riseColor: PUR }); await S.show(c, 300); }
          for (const [x, y] of [[1, 9.4], [2, 3.4]]) await G.reveal(G.point(x, y, { color: TEAL, r: 6, label: T(texNum(y)), pos: 'ne' }), c, 250);
          await say(c, Pn, `−6.0 °C for every km gained`, 'u7l7-small');
        } }
    ];
  }
};

/* =============================== ★ explainer: which form? which tool? =============================== */
const WT = {
  '1ab': { label: 'Ex 1(a), (b)', win: { xmin: -2, xmax: 8, ymin: -6, ymax: 20, ystep: 2 } },
  '1c': { label: 'Ex 1(c)', win: { xmin: -6, xmax: 4, ymin: -1, ymax: 9 } },
  '2a': { label: 'Ex 2(a)', win: { xmin: -12, xmax: 6, ymin: -3, ymax: 9 } },
  '3b': { label: 'Ex 3(b)', win: { xmin: -4, xmax: 4, ymin: -4, ymax: 4 } },
  '4b': { label: 'Ex 4(b)', win: { xmin: -8, xmax: 8, ymin: -3, ymax: 7 } },
  '5': { label: 'Ex 5', win: { xmin: 0, xmax: 3, ymin: -2, ymax: 18, xstep: 0.5, ystep: 2 } }
};
const whichTool = {
  title: '★ Which form? Which tool?',
  height: 486,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(WT).map((k) => ({ v: k, label: WT[k].label + ' check' })),
  intro: () => 'Each example travels the flowchart from its <b>question</b> to its <b>tool</b>. Press <b>Next</b>.',
  make(stage, v, ex) {
    const FW = ex.W - 16, k = FW / 980, X = (x) => x * k;
    const F = new Flowchart(stage, {
      x: 8, y: 2, width: FW, height: 300,
      nodes: {
        start: { x: X(490), y: 24, w: X(440), h: 40, html: '<b>What does the question ask for?</b>', cls: 'bk-round' },
        A: { x: X(125), y: 92, w: X(220), h: 46, html: '<b>A slope or an intercept</b>' },
        B: { x: X(370), y: 92, w: X(220), h: 46, html: '<b>An equation of a line</b>' },
        C: { x: X(620), y: 92, w: X(210), h: 46, html: '<b>Parallel or perpendicular?</b>' },
        D: { x: X(860), y: 92, w: X(220), h: 46, html: '<b>A rate of change</b>' },
        A1: { x: X(125), y: 172, w: X(220), h: 58, html: `<b>Already ${T('y=mx+b')}?</b>`, cls: 'bk-diamond' },
        B1: { x: X(370), y: 172, w: X(220), h: 58, html: '<b>Slope known?</b>', cls: 'bk-diamond' },
        C1: { x: X(620), y: 172, w: X(210), h: 58, html: `<b>Isolate ${T('y')} in each</b>compare the slopes` },
        D1: { x: X(860), y: 172, w: X(220), h: 58, html: '<b>Δ output ÷ Δ input</b>from two points' },
        A2: { x: X(58), y: 266, w: X(108), h: 54, html: `<b>Read ${T('m')}, ${T('b')}</b>`, color: TEAL },
        A3: { x: X(180), y: 266, w: X(120), h: 54, html: `<b>Isolate ${T('y')}</b>or cover up`, color: TEAL },
        B2a: { x: X(316), y: 266, w: X(136), h: 54, html: `<b>Find ${T('m')}</b>${T('\\tfrac{\\Delta y}{\\Delta x}')}, ${T('\\parallel')} or ${T('\\perp')}` },
        B2: { x: X(455), y: 266, w: X(128), h: 54, html: '<b>Slope–point</b>then tidy up', color: TEAL },
        C2: { x: X(620), y: 266, w: X(196), h: 54, html: `<b>Product ${T('-1')}? Equal?</b>${T('\\perp')} or ${T('\\parallel')}`, color: TEAL },
        D2: { x: X(860), y: 266, w: X(220), h: 54, html: '<b>Give units</b>output per input', color: TEAL }
      },
      edges: [
        { from: 'start', to: 'A', route: 'vhv' }, { from: 'start', to: 'B', route: 'vhv' }, { from: 'start', to: 'C', route: 'vhv' }, { from: 'start', to: 'D', route: 'vhv' },
        { from: 'A', to: 'A1' }, { from: 'B', to: 'B1' }, { from: 'C', to: 'C1' }, { from: 'D', to: 'D1' },
        { from: 'A1', to: 'A2', label: 'yes', route: 'vhv' }, { from: 'A1', to: 'A3', label: 'no', route: 'vhv' },
        { from: 'B1', to: 'B2a', label: 'no', route: 'vhv' }, { from: 'B1', to: 'B2', label: 'yes', route: 'vhv' }, { from: 'B2a', to: 'B2' },
        { from: 'C1', to: 'C2' }, { from: 'D1', to: 'D2' }
      ]
    });
    F.el.classList.add('u7l7-flow');
    const w = WT[v].win, G = new Graph(stage, { x: 8, y: 306, width: 250, height: 176, ...w, numbers: false, xtitle: '', ytitle: '', arrows: false });
    const Wk = add(stage, box(h('div', 'u7l7-work'), ex.W - 282, 176), 270, 306);
    const wl = (c, html, cls) => say(c, Wk, html, cls);
    const path = (c, ids) => F.light(c, ids, { pause: 80 });
    if (v === '1ab') {
      return [
        { cap: `Ex 1(a): the <b>slope</b> of ${T('5y=4x-20')}.`, run: async (c) => { await path(c, ['start', 'A']); await wl(c, `1(a) ${T('5y=4x-20')}`); } },
        { cap: `Not ${T('y=mx+b')} yet (the ${T('y')} has a 5): <b>no</b>. Isolate ${T('y')}: ${T('y=\\frac45x-4')}, so ${T('m=\\frac45')}.`,
          run: async (c) => { await path(c, ['A', 'A1', 'A3']); await wl(c, `${T('y=\\tfrac45x-4')} → ${T('m=\\tfrac45')}`, 'u7l7-good'); await G.drawIn(G.line({ m: 0.8, b: -4 }, { color: BLUE, width: 3 }), 400, c); } },
        { cap: `Ex 1(b): the ${T('y')}-intercept of ${T('y=-3x+18')}. Already ${T('y=mx+b')}: <b>yes</b>. Read ${T('b=18')}. <b>Answer C.</b>`,
          run: async (c) => { F.fade(); await path(c, ['start', 'A', 'A1', 'A2']); await wl(c, `1(b) ${T('y=-3x+18')} → ${T('b=18')}`, 'u7l7-good'); await G.drawIn(G.line({ m: -3, b: 18 }, { color: TEAL, width: 3 }), 400, c); await G.reveal(G.point(0, 18, { color: GRN, r: 6 }), c); } }
      ];
    }
    if (v === '1c') {
      return [
        { cap: `Ex 1(c): where ${T('6x-3y+21=0')} crosses the ${T('y')}-axis: an <b>intercept</b>.`, run: async (c) => { await path(c, ['start', 'A']); await wl(c, T('6x-3y+21=0')); } },
        { cap: `General form, not ${T('y=mx+b')}: <b>no</b>. Fastest tool: <b>cover up</b> the ${T('x')}-term.`, run: async (c) => { await path(c, ['A', 'A1', 'A3']); } },
        { cap: `${T('-3y+21=0')}, so ${T('y=7')}: ${T('(0,\\ 7)')}. <b>Answer B.</b>`,
          run: async (c) => { await wl(c, `${T('x=0')}: ${T('-3y+21=0\\Rightarrow y=7')}`, 'u7l7-good'); await G.drawIn(G.line({ m: 2, b: 7 }, { color: BLUE, width: 3 }), 400, c); await G.reveal(G.point(0, 7, { color: GRN, r: 6 }), c); } }
      ];
    }
    if (v === '2a') {
      return [
        { cap: `Ex 2(a): the <b>equation</b> of line ${T('PQ')}, in general form.`, run: async (c) => { await path(c, ['start', 'B']); await G.drawIn(G.line([-9, 0], [0, 6], { color: BLUE, width: 3 }), 400, c); } },
        { cap: `Slope known? <b>No</b>: find it from the lattice points ${T('P(-9,\\ 0)')}, ${T('Q(0,\\ 6)')}: ${T('m=\\frac69=\\frac23')}.`,
          run: async (c) => { await path(c, ['B', 'B1', 'B2a']); await wl(c, T('m=\\tfrac{6-0}{0-(-9)}=\\tfrac23')); await G.reveal(G.point(-9, 0, { color: INK, r: 5 }), c); await G.reveal(G.point(0, 6, { color: GRN, r: 5 }), c); } },
        { cap: `Slope–point through ${T('Q(0,\\ 6)')}: ${T('y-6=\\frac23(x-0)')}. Tidy up: ${T('3y=2x+18')}, so ${T('2x-3y+18=0')}.`,
          run: async (c) => { await path(c, ['B2a', 'B2']); await wl(c, T('y-6=\\tfrac23(x-0)\\ \\Rightarrow\\ 3y=2x+18')); await wl(c, T('2x-3y+18=0'), 'u7l7-good'); } }
      ];
    }
    if (v === '3b') {
      return [
        { cap: `Ex 3(b): which pairs of the four lines are <b>perpendicular</b>?`, run: async (c) => { await path(c, ['start', 'C']); } },
        { cap: `Isolate ${T('y')} in each: slopes ${T('4')}, ${T('-4')}, ${T('\\frac14')}, ${T('-\\frac14')}.`,
          run: async (c) => { await path(c, ['C', 'C1']); await wl(c, T('m_1=4,\\ m_2=-4,\\ m_3=\\tfrac14,\\ m_4=-\\tfrac14')); for (const [m, b, col] of [[4, 0, BLUE], [-4, 5, BROWN], [0.25, 0.75, ORNG], [-0.25, 1.75, TEAL]]) await G.drawIn(G.line({ m, b }, { color: col, width: 2.5 }), 250, c); } },
        { cap: `Products of ${T('-1')}: ${T('1)\\&4)')} and ${T('2)\\&3)')}. <b>Answer C.</b>`,
          run: async (c) => { await path(c, ['C1', 'C2']); await wl(c, `${T('4\\times(-\\tfrac14)=-1')} ✓ &ensp; ${T('-4\\times\\tfrac14=-1')} ✓`, 'u7l7-good'); } }
      ];
    }
    if (v === '4b') {
      return [
        { cap: `Ex 4(b): the <b>equation</b> of ${T('CD')}, perpendicular to ${T('AB:\\ x-3y+6=0')} at ${T('C')}.`, run: async (c) => { await path(c, ['start', 'B']); await G.drawIn(G.line([-6, 0], [6, 4], { color: INK, width: 3 }), 400, c); } },
        { cap: `Slope known? <b>No</b>: ${T('m_{AB}=\\frac13')}, so ${T('\\perp')} gives ${T('m=-3')}. Cover up ${T('x')} for ${T('C(0,\\ 2)')}.`,
          run: async (c) => { await path(c, ['B', 'B1', 'B2a']); await wl(c, `${T('y=\\tfrac13x+2')}: ${T('m_{CD}=-3')}, ${T('C(0,\\ 2)')}`); await G.reveal(G.point(0, 2, { color: GRN, r: 5 }), c); } },
        { cap: `Slope–point through ${T('C')}: ${T('y-2=-3(x-0)')}. Tidy up: ${T('3x+y-2=0')}. <b>Answer B.</b>`,
          run: async (c) => { await path(c, ['B2a', 'B2']); await wl(c, T('y-2=-3x\\ \\Rightarrow\\ 3x+y-2=0'), 'u7l7-good'); await G.drawIn(G.line({ m: -3, b: 2 }, { color: TEAL, width: 3 }), 400, c); } }
      ];
    }
    return [
      { cap: `Ex 5: the <b>rate</b> of temperature change per km.`, run: async (c) => { await path(c, ['start', 'D']); } },
      { cap: `Two measurements: ${T('(0,\\ 15.4)')} and ${T('(2.4,\\ 1.0)')} (2 400 m = 2.4 km). Divide the changes.`,
        run: async (c) => { await path(c, ['D', 'D1']); await wl(c, T('\\dfrac{1.0-15.4}{2.4}=\\dfrac{-14.4}{2.4}=-6.0')); await G.drawIn(G.segment([0, 15.4], [2.4, 1], { color: BLUE, width: 3 }), 400, c); } },
      { cap: `Units, output per input: ${T('-6.0')} °C/km. The temperature drops 6.0 °C per km gained.`,
        run: async (c) => { await path(c, ['D1', 'D2']); await wl(c, T('-6.0\\,^\\circ\\text{C/km}'), 'u7l7-good'); } }
    ];
  }
};

/* =============================== static figures =============================== */
function mountStatic() {
  const city = document.getElementById('u7l7-city');
  if (city) { const G = cityMap(city); G.label(7.05, 2.35, '?', { cls: 'u7l7-qmark' }); }
  const e2 = document.getElementById('u7l7-ex2fig');
  if (e2) {
    const G = new Graph(e2, { width: 440, height: 305, xmin: -12, xmax: 6, ymin: -3, ymax: 9, xlabels: 2, ylabels: 2, fontSize: 15 });
    G.line([-9, 0], [0, 6], { color: BLUE, width: 3.5 }); npt(G, 'P', -9, 0, { pos: 'nw' }); npt(G, 'Q', 0, 6, { pos: 'ne' });
  }
  const e4 = document.getElementById('u7l7-ex4bfig');
  if (e4) {
    const G = new Graph(e4, { width: 470, height: 273, xmin: -7.6, xmax: 7.6, ymin: -2, ymax: 6.3, grid: false, numbers: false });
    G.segment([-6.9, -0.3], [6.9, 4.3], { color: INK, width: 3.5 }); G.label(-6.9, -0.3, T('A'), { pos: 'w', cls: 'bk-ptlab' }); G.label(6.9, 4.3, T('B'), { pos: 'e', cls: 'bk-ptlab' });
    G.segment([-1, 5], [1, -1], { color: INK, width: 3.5, dash: '9 7' }); G.label(-1, 5, T('D'), { pos: 'nw', cls: 'bk-ptlab' });
    G.point(0, 2, { color: INK, r: 5.5 }); G.label(0.75, 2.85, T('C'), { cls: 'bk-ptlab' });
  }
  const q9 = document.getElementById('u7l7-q9calc');
  if (q9) {
    const G = new Graph(q9, { width: 300, height: 220, theme: 'calc', xmin: -12, xmax: 8, ymin: -2, ymax: 12, xscl: 2, yscl: 2 });
    G.fn((x) => -4 / 3 * x + 10); G.fn((x) => 0.75 * x + 8.5);
    q9.appendChild(h('div', 'u7l7-calc-cap', 'TI-84 window x:[−12, 8, 2], y:[−2, 12, 2]'));
  }
  document.querySelectorAll('[data-u7l7-plot]').forEach((el) => new Graph(el, { width: 300, height: 300, xmin: -6, xmax: 6, ymin: -6, ymax: 6, xlabels: 2, ylabels: 2, fontSize: 14, interactive: { snap: 1, color: 'blue' } }));
  const q14 = document.getElementById('u7l7-q14fig');
  if (q14) {
    const G = new Graph(q14, { width: 400, height: 441, xmin: 0, xmax: 14, ymin: 0, ymax: 80, xstep: 1, ystep: 5, xlabels: 2, ylabels: 10, xtitle: 'd', ytitle: 'C', fontSize: 15 });
    G.segment([0, 25], [11, 80], { color: BLUE, width: 3.5 }); G.point(0, 25, { color: INK, r: 5.5 }); G.point(8, 65, { color: INK, r: 5.5 });
    q14.appendChild(h('div', 'u7l7-calc-cap', 'data used (GB) · monthly cost ($)'));
  }
}

/* =============================== mount =============================== */
mountStatic();
export const explainers = mountExplainers({ planner, forms, dials, coverUp, graphToEq, perpTest, altitude, rate, whichTool });
