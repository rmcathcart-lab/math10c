/* Math 10C · Unit 5 · Lesson 3 — Where Graphs Meet the Axes: x- and y-intercepts.
 * Warm-up dive figure, the Example 4 figure, and the explainers:
 *   meetAxes (a point rides the graph; its other coordinate is 0 on each axis), subst (substitute y = 0 / x = 0, side by
 *   side), sameLine (two forms, one line), crossTouch (miss / touch / cross), lineCount (one, two or infinitely many
 *   intercept points), context (what the intercepts mean in a story), interp (interpolation vs extrapolation). */
import {
  h, tex, add, box, Graph, ValueTable, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pairTex, texNum, svgEl, liveCtx, pulse, arrowHead, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const RED = COLORS.red, BLUE = COLORS.blue, TEAL = COLORS.teal, AMB = COLORS.amber, PUR = COLORS.purple, GRN = COLORS.green;
const R = (s) => `\\textcolor{${RED}}{${s}}`;          // the substituted zero
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u5l3-panel ' + cls, title ? `<div class="u5l3-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u5l3-line ' + cls, html); p.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const hidden = (el) => { el.style.opacity = 0; return el; };
const n = (v) => texNum(v).replace('-', '−');            // plain-text number with a real minus

/* =============================== warm-up: the high dive =============================== */
const dive = (t) => 10 + 5 * t - 5 * t * t;
function mountDive() {
  const host = document.getElementById('u5l3-dive'); if (!host) return;
  const G = new Graph(host, { width: 560, height: 430, xmin: -0.62, xmax: 2.45, ymin: -1.75, ymax: 12.9, grid: false, axes: false, numbers: false, xtitle: '', ytitle: '', pad: [8, 8, 34, 8] });
  const P = (x, y) => G.toPx(x, y), bg = G.layers.bg, ax = G.layers.axes;
  const [x0, y0] = P(0, 0), [xR] = P(2.42, 0), [, yTop] = P(0, 12.9), [xL, yB] = P(-0.62, -1.75);
  // sky grid
  for (let hh = 2; hh <= 12; hh += 2) { const [, py] = P(0, hh); svgEl('line', { x1: x0, x2: xR, y1: py, y2: py, class: 'u5l3-sky' }, bg); }
  for (const t of [0.5, 1, 1.5, 2]) { const [px] = P(t, 0); svgEl('line', { x1: px, x2: px, y1: y0, y2: yTop, class: 'u5l3-sky' }, bg); }
  // pool and a wavy surface
  svgEl('rect', { x: xL, y: y0, width: xR - xL + 8, height: yB - y0, fill: '#bcdcf5' }, bg);
  let d = `M${xL} ${y0}`; for (let px = xL; px < xR + 8; px += 18) d += ` q4.5 -5 9 0 t9 0`;
  svgEl('path', { d, fill: 'none', stroke: '#4d93cc', 'stroke-width': 2.4 }, bg);
  // the tower is the height ruler
  const [tx0] = P(-0.4, 0), [, pTop] = P(0, 9.1), [, pPl] = P(0, 10), [tx1] = P(-0.46, 0);
  svgEl('rect', { x: tx0, y: pTop, width: x0 - tx0, height: y0 - pTop, fill: '#c9cdd6', stroke: '#1e2d46', 'stroke-width': 1.6 }, bg);
  svgEl('rect', { x: tx1, y: pPl, width: x0 - tx1, height: pTop - pPl, fill: '#7f8798', stroke: '#1e2d46', 'stroke-width': 1.6 }, bg);
  for (const hh of [2, 4, 6, 8]) { const [, py] = P(0, hh); svgEl('line', { x1: x0 - 9, x2: x0, y1: py, y2: py, stroke: '#1e2d46', 'stroke-width': 2 }, bg); G.hlabel(P(-0.2, hh)[0], py, String(hh), { cls: 'u5l3-tnum' }); }
  G.hlabel(P(-0.23, 0)[0], pPl + (pTop - pPl) / 2, '10', { cls: 'u5l3-tnum u5l3-tnum-w' });
  G.hlabel(P(-0.2, 0)[0], y0 + 16, '0', { cls: 'u5l3-tnum' });
  // axes
  svgEl('line', { x1: x0, x2: x0, y1: y0, y2: yTop + 4, stroke: '#1c2230', 'stroke-width': 2.6 }, ax); arrowHead(ax, x0, yTop - 2, 0, -1, { width: 2.6 });
  svgEl('line', { x1: x0, x2: xR + 4, y1: y0, y2: y0, stroke: '#1c2230', 'stroke-width': 2.6 }, ax); arrowHead(ax, xR + 8, y0, 1, 0, { width: 2.6 });
  for (const t of [0.5, 1, 1.5, 2]) { const [px] = P(t, 0); svgEl('line', { x1: px, x2: px, y1: y0 - 6, y2: y0 + 6, stroke: '#1c2230', 'stroke-width': 2 }, ax); G.hlabel(px, y0 + 16, String(t), { cls: 'u5l3-tnum' }); }
  G.hlabel(x0 + 140, yB + 17, 'time (seconds)', { cls: 'u5l3-axname' });
  const yl = G.hlabel(P(-0.53, 0)[0], P(0, 5)[1], 'height above water (m)', { cls: 'u5l3-axname u5l3-rot' }); void yl;
  // the dive
  const path = G.fn(dive, { from: 0, to: 2, color: RED, width: 5, arrows: false });
  const fig = svgEl('g', { class: 'u5l3-diver' }, G.layers.top);
  svgEl('circle', { cx: 0, cy: -38, r: 7.5, fill: '#1e2d46' }, fig);
  svgEl('path', { d: 'M0 -30 V-12 M0 -12 L-6 2 M0 -12 L6 2 M0 -26 L11 -34 M0 -26 L-11 -34', stroke: '#1e2d46', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, fig);
  const place = (t) => { const [px, py] = P(t, dive(t)); fig.setAttribute('transform', `translate(${px} ${py})`); };
  const [sx, sy] = P(-0.22, 10); fig.setAttribute('transform', `translate(${sx} ${sy})`);
  const splash = svgEl('g', { class: 'u5l3-splash' }, G.layers.top); splash.style.opacity = 0;
  { const [px, py] = P(2, 0); for (const a of [55, 75, 95, 115, 135]) { const r = a * Math.PI / 180; svgEl('line', { x1: px, y1: py, x2: px + 30 * Math.cos(r), y2: py - 30 * Math.sin(r), stroke: '#2f78b8', 'stroke-width': 3, 'stroke-linecap': 'round' }, splash); } }
  let busy = false;
  document.getElementById('u5l3-play').addEventListener('click', async () => {
    if (busy) return; busy = true; const c = liveCtx();
    splash.style.opacity = 0; fig.setAttribute('transform', `translate(${sx} ${sy})`); await sleep(c, 250);
    await tween(c, 2200, (t) => place(2 * t), (t) => t);
    await pop(c, splash, 420); await sleep(c, 900);
    busy = false;
  });
  let ints = null;
  document.getElementById('u5l3-ints').addEventListener('click', async () => {
    const c = liveCtx();
    if (ints) { G.remove(...ints); ints = null; return; }
    ints = [G.point(0, 10, { color: BLUE, r: 8, label: `<b>jump</b> ${T('(0,\\ 10)')}`, pos: 'ne' }), G.point(2, 0, { color: BLUE, r: 8, label: `<b>splash</b> ${T('(2,\\ 0)')}`, pos: 'nw' })];
    for (const p of ints) { await G.reveal(p, c); }
  });
  void path;
}

/* =============================== Example 4 figure =============================== */
function mountEx4() {
  const host = document.getElementById('u5l3-ex4fig'); if (!host) return;
  const G = new Graph(host, { width: 360, height: 360, xmin: -5, xmax: 5, ymin: -5, ymax: 5, xlabels: 2, ylabels: 2 });
  G.line({ m: 0, b: 3 }, { color: BLUE }); G.label(3.6, 3, T('y=3'), { pos: 's', color: BLUE, cls: 'bk-ptlab' });
  G.line({ x: -2 }, { color: GRN }); G.label(-2, 4.3, T('x=-2'), { pos: 'w', color: GRN, cls: 'bk-ptlab' });
  G.line({ m: 2, b: 0 }, { color: AMB }); G.label(2.2, 4.4, T('y=2x'), { pos: 'e', color: AMB, cls: 'bk-ptlab' });
}

/* =============================== explainer 1: where a graph meets the axes =============================== */
// each graph is a path p(s), s in [0, 1], with its axis meetings in order of travel
const MEET = {
  line: { label: T('y=0.6x+1.5'), win: 5, draw: (G) => G.fn((x) => 0.6 * x + 1.5, { color: BLUE }), p: (s) => { const x = -4.5 + 9 * s; return [x, 0.6 * x + 1.5]; },
    ev: [{ s: 2 / 9, ax: 'x', pt: [-2.5, 0] }, { s: 4.5 / 9, ax: 'y', pt: [0, 1.5] }] },
  para: { label: T('y=\\tfrac12x^2-2'), win: 5, draw: (G) => G.fn((x) => x * x / 2 - 2, { color: PUR }), p: (s) => { const x = -3.8 + 7.6 * s; return [x, x * x / 2 - 2]; },
    ev: [{ s: 1.8 / 7.6, ax: 'x', pt: [-2, 0] }, { s: 0.5, ax: 'y', pt: [0, -2] }, { s: 5.8 / 7.6, ax: 'x', pt: [2, 0] }] },
  circle: { label: T('x^2+y^2=16'), win: 6, draw: (G) => G.curve(() => ({ subs: [Array.from({ length: 121 }, (_, i) => G.toPx(4 * Math.cos(i * Math.PI / 60), 4 * Math.sin(i * Math.PI / 60)))], closed: true }), { color: TEAL }, 'bk-fn', G.layers.data),
    p: (s) => { const a = (135 - 350 * s) * Math.PI / 180; return [4 * Math.cos(a), 4 * Math.sin(a)]; },
    ev: [{ s: 45 / 350, ax: 'y', pt: [0, 4] }, { s: 135 / 350, ax: 'x', pt: [4, 0] }, { s: 225 / 350, ax: 'y', pt: [0, -4] }, { s: 315 / 350, ax: 'x', pt: [-4, 0] }] }
};
const meetAxes = {
  title: 'Where a graph meets the axes',
  height: 470,
  choices: Object.keys(MEET).map((k) => ({ v: k, label: MEET[k].label })),
  intro: 'A point rides along the graph, showing its coordinates. Watch them as it meets each axis. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = MEET[k], wn = d.win, G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -wn, xmax: wn, ymin: -wn, ymax: wn });
    const P = panel(stage, 480, 14, ex.W - 494, 440, 'The moving point');
    const ro = h('div', 'u5l3-ro', `<div class="u5l3-ro-r" data-a="x"><i class="u5l3-ro-k">${T('x')}</i><i class="u5l3-ro-eq">=</i><b class="u5l3-ro-v">?</b></div><div class="u5l3-ro-r" data-a="y"><i class="u5l3-ro-k">${T('y')}</i><i class="u5l3-ro-eq">=</i><b class="u5l3-ro-v">?</b></div>`);
    P.appendChild(ro);
    const rx = ro.children[0], ry = ro.children[1], vx = rx.querySelector('b'), vy = ry.querySelector('b');
    const notes = h('div', 'u5l3-notes'); P.appendChild(notes);
    let tr = null, s0 = 0;
    const setRo = (x, y, exact) => { vx.textContent = exact ? n(x) : n(+x.toFixed(1)); vy.textContent = exact ? n(y) : n(+y.toFixed(1)); };
    const ride = async (c, s1, ms) => { const a = s0; await tween(c, ms, (t) => { const [x, y] = d.p(a + (s1 - a) * t); G.moveTo(tr, x, y); setRo(x, y, false); }); s0 = s1; };
    const steps = [{ cap: `Here is ${d.label}. A point rides along the graph, and the panel shows its coordinates as it moves.`,
      run: async (c) => { await G.drawIn(d.draw(G), 900, c); const [x, y] = d.p(0); tr = G.point(x, y, { color: AMB, r: 9 }); setRo(x, y, false); await pop(c, tr); } }];
    d.ev.forEach((e, i) => {
      const onX = e.ax === 'x', v = onX ? e.pt[0] : e.pt[1];
      steps.push({
        cap: `${i ? 'Keep going.' : 'Slide along…'} It meets the <b>${onX ? 'x' : 'y'}-axis</b>: there the <b>${onX ? 'y' : 'x'}-coordinate is 0</b>. ${onX ? 'x' : 'y'}-intercept ${T(texNum(v))}, intercept point ${T(pairTex(e.pt[0], e.pt[1]))}.`,
        run: async (c) => {
          rx.classList.remove('u5l3-hot'); ry.classList.remove('u5l3-hot');
          await ride(c, e.s, 1500); G.moveTo(tr, e.pt[0], e.pt[1]); setRo(e.pt[0], e.pt[1], true);
          const r = onX ? ry : rx; r.classList.add('u5l3-hot'); await pulse(c, r, 1.12);
          await G.reveal(G.point(e.pt[0], e.pt[1], { color: onX ? RED : BLUE, coords: true, pos: e.pt[0] < 0 || (e.pt[0] === 0 && e.pt[1] < 0) ? 'sw' : 'ne' }), c);
          await show(c, line(notes, `${onX ? 'On the x-axis' : 'On the y-axis'}: ${T(pairTex(e.pt[0], e.pt[1]))}`, onX ? 'u5l3-cx' : 'u5l3-cy'));
        }
      });
    });
    steps.push({ cap: `Every point on the x-axis has ${T('y=0')}; every point on the y-axis has ${T('x=0')}. So to find intercepts: <b>${T('x')}-intercepts: put ${T('y=0')}</b>. <b>${T('y')}-intercepts: put ${T('x=0')}</b>.`,
      run: async (c) => { rx.classList.remove('u5l3-hot'); ry.classList.remove('u5l3-hot'); G.remove(tr); const b = h('div', 'u5l3-rulebox', `<div><b>${T('x')}-intercepts</b>: ${T('y=0')}</div><div><b>${T('y')}-intercepts</b>: ${T('x=0')}</div>`); P.appendChild(b); await pop(c, b); } });
    return steps;
  }
};

/* =============================== explainer 2: substitute y = 0, then x = 0 =============================== */
const circ = (r) => (G) => G.curve(() => ({ subs: [Array.from({ length: 121 }, (_, i) => G.toPx(r * Math.cos(i * Math.PI / 60), r * Math.sin(i * Math.PI / 60)))], closed: true }), { color: TEAL }, 'bk-fn', G.layers.data);
const SUB = {
  sec1: { label: T('y=0.6x+1.5'), eq: 'y=0.6x+1.5', g: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 }, draw: (G) => G.fn((x) => 0.6 * x + 1.5, { color: BLUE }),
    xl: [`${R('0')}=0.6x+1.5`, '-0.6x=1.5', 'x=-2.5'], xp: [[-2.5, 0]], yl: [`y=0.6(${R('0')})+1.5`, 'y=1.5'], yp: [[0, 1.5]] },
  demo: { label: T('2x+5y=10'), eq: '2x+5y=10', g: { xmin: -6, xmax: 6, ymin: -6, ymax: 6 }, draw: (G) => G.fn((x) => 2 - 0.4 * x, { color: BLUE }),
    xl: [`2x+5(${R('0')})=10`, '2x=10', 'x=5'], xp: [[5, 0]], yl: [`2(${R('0')})+5y=10`, '5y=10', 'y=2'], yp: [[0, 2]] },
  ex1: { label: 'Example 1 check', eq: '4x-3y+24=0', g: { xmin: -10, xmax: 10, ymin: -10, ymax: 10, xlabels: 2, ylabels: 2 }, draw: (G) => G.fn((x) => 4 * x / 3 + 8, { color: BLUE }),
    xl: [`4x-3(${R('0')})+24=0`, '4x=-24', 'x=-6'], xp: [[-6, 0]], yl: [`4(${R('0')})-3y+24=0`, '-3y=-24', 'y=8'], yp: [[0, 8]] },
  ex2: { label: 'Example 2 check', eq: 'x^2+y^2=36', g: { xmin: -8, xmax: 8, ymin: -8, ymax: 8, xlabels: 2, ylabels: 2 }, draw: circ(6),
    xl: [`x^2+${R('0')}^2=36`, 'x^2=36', 'x=\\pm6'], xp: [[6, 0], [-6, 0]], yl: [`${R('0')}^2+y^2=36`, 'y^2=36', 'y=\\pm6'], yp: [[0, 6], [0, -6]] },
  ex3: { label: 'Example 3 check', eq: 'y=x^2-2x-24', g: { xmin: -8, xmax: 10, ymin: -28, ymax: 8, ystep: 2, xlabels: 2, ylabels: 4 }, draw: (G) => G.fn((x) => x * x - 2 * x - 24, { color: PUR }),
    xl: [`${R('0')}=x^2-2x-24`, '0=(x-6)(x+4)', 'x=6\\ \\text{or}\\ x=-4'], xp: [[6, 0], [-4, 0]], yl: [`y=${R('0')}^2-2(${R('0')})-24`, 'y=-24'], yp: [[0, -24]] }
};
const ptsTex = (ps) => ps.map((p) => pairTex(p[0], p[1])).join(',\\ ');
const subst = {
  title: 'Substitute y = 0, then x = 0',
  height: 500,
  choices: [{ v: 'sec1', label: SUB.sec1.label }, { v: 'demo', label: SUB.demo.label }, { sep: 'Examples' }, { v: 'ex1', label: SUB.ex1.label }, { v: 'ex2', label: SUB.ex2.label }, { v: 'ex3', label: SUB.ex3.label }],
  intro: (k) => `Find the intercepts of ${T(SUB[k].eq)} algebraically, then see them on the graph. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SUB[k], LW = ex.W - 474;
    const tag = add(stage, h('div', 'u5l3-eqtag', T(SUB[k].eq)), 14, 10);
    const PX = panel(stage, 14, 66, LW, 206, `${T('x')}-intercept(s): substitute ${T('y=0')}`, 'u5l3-px');
    const PY = panel(stage, 14, 284, LW, 206, `${T('y')}-intercept(s): substitute ${T('x=0')}`, 'u5l3-py');
    const G = new Graph(stage, Object.assign({ x: ex.W - 450, y: 10, width: 440, height: 480 }, d.g));
    const lines = (Pn, ls) => ls.map((s) => hidden(line(Pn, T(s), 'u5l3-mline')));
    const lx = lines(PX, d.xl), ly = lines(PY, d.yl);
    const rx = hidden(line(PX, `<b>${d.xp.length > 1 ? 'Points' : 'Point'}</b> ${T(ptsTex(d.xp))}`, 'u5l3-res u5l3-cx'));
    const ry = hidden(line(PY, `<b>${d.yp.length > 1 ? 'Points' : 'Point'}</b> ${T(ptsTex(d.yp))}`, 'u5l3-res u5l3-cy'));
    void tag;
    const plot = async (c, ps, color) => { for (const p of ps) { await G.reveal(G.point(p[0], p[1], { color, coords: true, pos: p[0] < 0 ? 'nw' : p[1] < 0 ? 'se' : 'ne' }), c); } };
    return [
      { cap: `<b>${T('x')}-intercepts:</b> every point on the x-axis has ${T('y=0')}. Put <b>${T('0')} in for ${T('y')}</b>, then solve for ${T('x')}.`,
        run: async (c) => { for (const e of lx) { await show(c, e); await sleep(c, 280); } } },
      { cap: () => `The ${T('y')}-coordinate is 0, so the ${d.xp.length > 1 ? 'points are' : 'point is'} ${T(ptsTex(d.xp))}. Plot ${d.xp.length > 1 ? 'them' : 'it'} on the x-axis.`,
        run: async (c) => { await show(c, rx); await plot(c, d.xp, RED); } },
      { cap: `<b>${T('y')}-intercept${d.yp.length > 1 ? 's' : ''}:</b> every point on the y-axis has ${T('x=0')}. Put <b>${T('0')} in for ${T('x')}</b>, then solve for ${T('y')}.`,
        run: async (c) => { for (const e of ly) { await show(c, e); await sleep(c, 280); } } },
      { cap: `The ${T('x')}-coordinate is 0: ${T(ptsTex(d.yp))}. Plot on the y-axis.`,
        run: async (c) => { await show(c, ry); await plot(c, d.yp, BLUE); } },
      { cap: `Now draw the graph: it passes through every intercept point we found. ✓`,
        run: async (c) => { await G.drawIn(d.draw(G), 1100, c); } }
    ];
  }
};

/* =============================== explainer 3: same line, two forms =============================== */
const sameLine = {
  title: 'Two forms, one line',
  height: 470,
  intro: `Are ${T('y=\\tfrac43x+8')} and ${T('4x-3y+24=0')} really the same line? Press <b>Next</b>.`,
  make(stage, v, ex) {
    const LW = ex.W - 474;
    const A = add(stage, h('div', 'u5l3-form u5l3-fa', `<b>A</b>${T('y=\\tfrac43x+8')}`), 14, 12);
    const B = add(stage, h('div', 'u5l3-form u5l3-fb', `<b>B</b>${T('4x-3y+24=0')}`), 14 + LW / 2 + 6, 12);
    box(A, LW / 2 - 6); box(B, LW / 2 - 6);
    const PR = panel(stage, 14, 72, LW, 156, 'Rearrange form B: solve for y');
    const steps = ['4x+24=3y', 'y=\\dfrac{4x+24}{3}', 'y=\\tfrac43x+8\\ \\checkmark'].map((s) => hidden(line(PR, T(s), 'u5l3-mline')));
    const xs = [-6, -3, 0, 3];
    const tb = new ValueTable(stage, { x: 14 + (LW - 3 * 120) / 2, y: 242, headers: ['x', '\\text{A: }y', '\\text{B: }y'], rows: xs.map((x) => [x, 4 * x / 3 + 8, 4 * x / 3 + 8]), hide: (r, cc) => cc > 0, tap: false, cellW: 120, cellH: 44 });
    tb.el.style.opacity = 0;
    const G = new Graph(stage, { x: ex.W - 450, y: 10, width: 440, height: 450, xmin: -10, xmax: 6, ymin: -4, ymax: 13, xlabels: 2, ylabels: 2 });
    return [
      { cap: `Form B has ${T('x')} and ${T('y')} on one side. Solve it for ${T('y')}: add ${T('3y')} to both sides, divide by 3…`,
        run: async (c) => { for (const e of steps) { await show(c, e); await sleep(c, 300); } } },
      { cap: `…and it <b>is</b> form A. Another way to check: give both forms the same inputs.`,
        run: async (c) => { await appear(c, tb.el); await tb.fill(c, { col: 1 }); } },
      { cap: `For form B, substitute each ${T('x')} and solve for ${T('y')}: the <b>same outputs</b> every time.`,
        run: async (c) => { await tb.fill(c, { col: 2 }); } },
      { cap: `Same ordered pairs, so the same graph: form A (blue) and form B (dashed orange) lie exactly on top of each other.`,
        run: async (c) => {
          for (let i = 0; i < xs.length; i++) { tb.highlight(i, true); await G.reveal(G.point(xs[i], 4 * xs[i] / 3 + 8, { color: 'slate', r: 6 }), c, 260); tb.highlight(i, false); }
          await G.drawIn(G.fn((x) => 4 * x / 3 + 8, { color: BLUE, width: 6 }), 800, c);
          await G.drawIn(G.fn((x) => 4 * x / 3 + 8, { color: AMB, width: 3, dash: true }), 800, c);
        } },
      { cap: `One line, one pair of intercepts, ${T('(-6,\\ 0)')} and ${T('(0,\\ 8)')}, whichever form you substitute into. Pick the form that is easier to work with.`,
        run: async (c) => { tb.highlight(0, true); tb.highlight(2, true); await G.reveal(G.point(-6, 0, { color: RED, coords: true, pos: 'se', r: 8 }), c); await G.reveal(G.point(0, 8, { color: RED, coords: true, pos: 'e', r: 8 }), c); } }
    ];
  }
};

/* =============================== explainer 4: cross, touch, or miss =============================== */
const CT = {
  para: { label: 'parabola slides down', win: { xmin: -5, xmax: 5, ymin: -6, ymax: 6 }, ks: [3, 0, -4] },
  circle: { label: 'circle slides left', win: { xmin: -4, xmax: 12, ymin: -8, ymax: 8, xlabels: 2, ylabels: 2 }, ks: [7, 5, 4] }
};
const CTX = {
  para: [
    { eq: 'y=x^2+3', sub: '0=x^2+3', sol: 'x^2=-3', res: 'no real solution', cnt: 0, pts: [], word: 'misses', what: `${T('x^2=-3')}: no real number squares to a negative.` },
    { eq: 'y=x^2', sub: '0=x^2', sol: 'x=0', res: 'one', cnt: 1, pts: [[0, 0]], word: 'touches', what: `just one solution, ${T('x=0')}: the vertex sits on the axis.` },
    { eq: 'y=x^2-4', sub: '0=x^2-4', sol: 'x=\\pm2', res: 'two', cnt: 2, pts: [[-2, 0], [2, 0]], word: 'crosses', what: `${T('x^2=4')}, so ${T('x=\\pm2')}.` }
  ],
  circle: [
    { eq: '(x-7)^2+y^2=25', sub: '(0-7)^2+y^2=25', sol: 'y^2=-24', res: 'no real solution', cnt: 0, pts: [], word: 'misses', what: `${T('y^2=-24')}: no real solution.` },
    { eq: '(x-5)^2+y^2=25', sub: '(0-5)^2+y^2=25', sol: 'y=0', res: 'one', cnt: 1, pts: [[0, 0]], word: 'touches', what: `${T('y^2=0')}: just ${T('y=0')}.` },
    { eq: '(x-4)^2+y^2=25', sub: '(0-4)^2+y^2=25', sol: 'y=\\pm3', res: 'two', cnt: 2, pts: [[0, 3], [0, -3]], word: 'crosses', what: `${T('y^2=9')}, so ${T('y=\\pm3')}.` }
  ]
};
const crossTouch = {
  title: 'Cross, touch, or miss',
  height: 470,
  choices: Object.keys(CT).map((k) => ({ v: k, label: CT[k].label })),
  intro: (k) => (k === 'para' ? `Slide ${T('y=x^2+k')} down and count its ${T('x')}-intercepts. Press <b>Next</b>.` : `Slide a circle of radius 5 toward the ${T('y')}-axis and count its ${T('y')}-intercepts. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = CT[k], rows = CTX[k], isP = k === 'para', ax = isP ? 'x' : 'y', zero = isP ? 'y=0' : 'x=0';
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 440, height: 440 }, d.win));
    const P = panel(stage, 480, 14, ex.W - 494, 440, `${T(ax)}-intercepts: substitute ${T(zero)}`);
    const st = { k: d.ks[0] };
    const curve = isP ? G.fn((x) => x * x + st.k, { color: PUR })
      : G.curve(() => ({ subs: [Array.from({ length: 121 }, (_, i) => G.toPx(st.k + 5 * Math.cos(i * Math.PI / 60), 5 * Math.sin(i * Math.PI / 60)))], closed: true }), { color: TEAL }, 'bk-fn', G.layers.data);
    const eqLab = h('div', 'u5l3-eqtag u5l3-eqsm', T(rows[0].eq)); P.appendChild(eqLab);
    const body = h('div', 'u5l3-ctbody'); P.appendChild(body);
    const ints = [];
    const slide = (c, to) => { const a = st.k; return tween(c, 1300, (t) => { st.k = a + (to - a) * t; curve._bkDraw(); }); };
    const say = async (c, r) => {
      eqLab.innerHTML = T(r.eq); body.innerHTML = '';
      const l1 = line(body, T(r.sub), 'u5l3-mline'), l2 = line(body, T(r.sol), 'u5l3-mline');
      const l3 = line(body, `<b>${r.cnt === 0 ? 'No' : r.cnt === 1 ? 'One' : 'Two'}</b> ${T(ax)}-intercept${r.cnt === 1 ? '' : 's'}: it <b>${r.word}</b> the ${T(ax)}-axis`, 'u5l3-res ' + (r.cnt ? (isP ? 'u5l3-cx' : 'u5l3-cy') : 'u5l3-cno'));
      for (const e of [l1, l2, l3]) await show(c, e);
      G.remove(...ints.splice(0)); for (const p of r.pts) { const q = G.point(p[0], p[1], { color: isP ? RED : BLUE, r: 8, coords: true, pos: p[1] < 0 ? 'se' : isP && p[0] < 0 ? 'nw' : 'ne' }); ints.push(q); await G.reveal(q, c); }
    };
    return [
      { cap: () => `${T(rows[0].eq)} ${rows[0].word} the ${T(ax)}-axis. Substitute ${T(zero)}: ${rows[0].what} <b>No ${T(ax)}-intercepts.</b>`,
        run: async (c) => { await G.drawIn(curve, 900, c); await say(c, rows[0]); } },
      { cap: () => `Slide it to ${T(rows[1].eq)}: it just <b>touches</b> the axis. Substitute ${T(zero)}: ${rows[1].what} <b>One</b> ${T(ax)}-intercept. Touching counts as meeting.`,
        run: async (c) => { G.remove(...ints.splice(0)); body.innerHTML = ''; await slide(c, d.ks[1]); await say(c, rows[1]); } },
      { cap: () => `Slide further, to ${T(rows[2].eq)}: now it <b>crosses</b> the axis twice. Substitute ${T(zero)}: ${rows[2].what} <b>Two</b> ${T(ax)}-intercepts.`,
        run: async (c) => { G.remove(...ints.splice(0)); body.innerHTML = ''; await slide(c, d.ks[2]); await say(c, rows[2]); } },
      { cap: isP ? `Miss, touch, cross: <b>0, 1 or 2</b> ${T('x')}-intercepts. But there is always exactly <b>one</b> ${T('y')}-intercept: ${T('x=0')} gives one ${T('y')}.`
        : `Miss, touch, cross: <b>0, 1 or 2</b> ${T('y')}-intercepts. The algebra and the picture always agree.`,
        run: async (c) => {
          if (isP) { const q = G.point(0, -4, { color: BLUE, r: 8, coords: true, pos: 'se' }); await G.reveal(q, c); await show(c, line(body, `${T('y')}-intercept: ${T('y=0^2-4=-4')}`, 'u5l3-res u5l3-cy')); }
          else { const s = stamp(body, 'algebra = picture', { ok: true }); s.style.alignSelf = 'center'; s.style.marginTop = '18px'; await stampIn(c, s); }
        } }
    ];
  }
};

/* =============================== explainer 5: how many intercept points can a line have? =============================== */
const LC = {
  typ: { label: T('y=-\\tfrac12x+2'), draw: (G) => G.line({ m: -0.5, b: 2 }, { color: BLUE }), lab: [3.2, 0.4, 'y=-\\tfrac12x+2', 'n'],
    xs: `${T('0=-\\tfrac12x+2')}, so ${T('x=4')}`, ys: `${T('y=-\\tfrac12(0)+2=2')}`, xp: [[4, 0]], yp: [[0, 2]], count: 'Two intercept points', cnt: 2,
    end: `Two different intercept points, ${T('(4,\\ 0)')} and ${T('(0,\\ 2)')}: the usual case for a slanted line.` },
  a: { label: 'Ex 4 (a) ' + T('y=3'), draw: (G) => G.line({ m: 0, b: 3 }, { color: BLUE }), lab: [3.6, 3, 'y=3', 'n'],
    xs: `${T('0=3')}: impossible. <b>No</b> ${T('x')}-intercept`, ys: `${T('y=3')}`, xp: [], yp: [[0, 3]], count: 'One intercept point', cnt: 1,
    end: `A horizontal line runs <b>parallel</b> to the ${T('x')}-axis and never meets it. <b>One</b> intercept point, ${T('(0,\\ 3)')}.` },
  b: { label: 'Ex 4 (b) ' + T('x=-2'), draw: (G) => G.line({ x: -2 }, { color: GRN }), lab: [-2, 4.2, 'x=-2', 'w'],
    xs: `${T('x=-2')}`, ys: `${T('0=-2')}: impossible. <b>No</b> ${T('y')}-intercept`, xp: [[-2, 0]], yp: [], count: 'One intercept point', cnt: 1,
    end: `A vertical line runs parallel to the ${T('y')}-axis. <b>One</b> intercept point, ${T('(-2,\\ 0)')}.` },
  c: { label: 'Ex 4 (c) ' + T('y=0'), draw: (G) => G.line({ m: 0, b: 0 }, { color: RED, width: 9, opacity: 0.45 }), lab: [3.6, 0, 'y=0', 'n'],
    xs: `${T('0=0')}: true for <b>every</b> ${T('x')}`, ys: `${T('y=0')}`, xp: 'all', yp: [[0, 0]], count: 'Infinitely many', cnt: Infinity,
    end: `The line <b>is</b> the ${T('x')}-axis: every one of its points is an ${T('x')}-intercept point. <b>Infinitely many</b>.` },
  d: { label: 'Ex 4 (d) ' + T('y=2x'), draw: (G) => G.line({ m: 2, b: 0 }, { color: AMB }), lab: [2.1, 4.4, 'y=2x', 'e'],
    xs: `${T('0=2x')}, so ${T('x=0')}`, ys: `${T('y=2(0)=0')}`, xp: [[0, 0]], yp: [[0, 0]], count: 'One intercept point', cnt: 1,
    end: `Both intercepts are 0, at the <b>same</b> point: the origin. <b>One</b> intercept point, ${T('(0,\\ 0)')}.` }
};
const lineCount = {
  title: 'How many intercept points can a line have?',
  height: 470,
  choices: [{ v: 'typ', label: LC.typ.label }, { sep: 'Example 4 check' }, ...['a', 'b', 'c', 'd'].map((k) => ({ v: k, label: LC[k].label }))],
  intro: (k) => `Substitute ${T('y=0')} and ${T('x=0')} into ${T(LC[k].lab[2])}, then count the intercept points. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = LC[k], G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -5, xmax: 5, ymin: -5, ymax: 5 });
    const P = panel(stage, 480, 14, ex.W - 494, 440, T(d.lab[2]));
    const pts = [];
    const dot = (p, color) => { const q = G.point(p[0], p[1], { color, r: 8 }); pts.push(q); return q; };
    return [
      { cap: `Draw ${T(d.lab[2])}.`, run: async (c) => { await G.drawIn(d.draw(G), 800, c); const L = G.label(d.lab[0], d.lab[1], T(d.lab[2]), { pos: d.lab[3], cls: 'bk-ptlab' }); await fadeIn(c, L); } },
      { cap: `<b>${T('x')}-intercept:</b> substitute ${T('y=0')}. ${d.xs}.`,
        run: async (c) => {
          await show(c, line(P, `${T('y=0')}: ${d.xs}`, 'u5l3-mline2'));
          if (d.xp === 'all') { for (let x = -4; x <= 4; x++) { if (x === 0) continue; await pop(c, dot([x, 0], RED), 200); } }
          else for (const p of d.xp) await G.reveal(dot(p, RED), c);
        } },
      { cap: `<b>${T('y')}-intercept:</b> substitute ${T('x=0')}. ${d.ys}.`,
        run: async (c) => { await show(c, line(P, `${T('x=0')}: ${d.ys}`, 'u5l3-mline2')); for (const p of d.yp) await G.reveal(dot(p, BLUE), c); } },
      { cap: d.end,
        run: async (c) => { const s = stamp(P, d.count, { ok: d.cnt === 2 ? true : d.cnt === 1 ? null : false }); s.style.alignSelf = 'center'; s.style.marginTop = '26px'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer 6: what the intercepts mean =============================== */
const CTXS = {
  dive: { label: 'Warm-up: the high dive', f: dive, t1: 2, g: { xmin: -1.4, xmax: 2.6, ymin: -2.5, ymax: 12.5, xstep: 0.5, ystep: 1, xlabels: 0.5, ylabels: 2, xtitle: 't', ytitle: 'h' },
    v0: 10, start: 'platform', end: 'splash', vint: [`Put ${T('t=0')}:`, T('h=10+5(0)-5(0)^2'), T('h=10')],
    hint: [`Put ${T('h=0')}:`, `${T('0=10+5t-5t^2')}`, `${T('0=-5(t-2)(t+1)')}`, `${T('t=2')} or ${T('t=-1')}`],
    cap1: `<b>Vertical intercept:</b> put ${T('t=0')}. ${T('h=10')}: at the start she is on the <b>10 m platform</b>.`,
    cap2: 'Play the dive. Her height on the left matches the graph on the right.',
    cap3: `<b>Horizontal intercept:</b> put ${T('h=0')} and factor: ${T('t=2')} or ${T('t=-1')}.`,
    cap4: `${T('t=2')}: height 0 means she reaches the water. <b>The splash, 2 s after the jump.</b>`,
    cap5: `${T('t=-1')} is one second <b>before</b> the jump. Extend the curve backwards (grey): the rule doesn’t describe her then. <b>Reject it.</b>`,
    neg: -1, ext: [-1.15, 0] },
  balloon: { label: 'Example 5 check: the balloon', f: (t) => 800 - 40 * t, t1: 20, g: { xmin: -1.5, xmax: 30, ymin: -150, ymax: 900, xstep: 5, ystep: 100, xtitle: 't', ytitle: 'h' },
    v0: 800, start: 'descent begins', end: 'landing', vint: [`Put ${T('t=0')}:`, T('h=800-40(0)'), T('h=800')],
    hint: [`Put ${T('h=0')}:`, `${T('0=800-40t')}`, `${T('40t=800')}`, `${T('t=20')}`],
    cap1: `<b>Vertical intercept:</b> put ${T('t=0')}. ${T('h=800')}: <b>800 m up</b> at the instant the descent begins.`,
    cap2: 'Play the descent: 40 m lower every minute. The balloon’s height matches the graph.',
    cap3: `<b>Horizontal intercept:</b> put ${T('h=0')}. ${T('40t=800')}, so ${T('t=20')}.`,
    cap4: `${T('(20,\\ 0)')}: height 0. <b>The balloon reaches the ground 20 minutes after the descent begins.</b>`,
    cap5: `Past ${T('t=20')} the formula gives negative heights (grey), but the balloon is on the ground. The graph stops at ${T('(20,\\ 0)')}.`,
    neg: null, ext: [20, 23.5] }
};
const context = {
  title: 'What the intercepts mean',
  height: 470,
  choices: Object.keys(CTXS).map((k) => ({ v: k, label: CTXS[k].label })),
  intro: (k) => `Each intercept of ${k === 'dive' ? T('h=10+5t-5t^2') : T('h=800-40t')} tells part of the story. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = CTXS[k], SW = 200, PX0 = 14 + SW + 12, PW = ex.W - 454 - PX0 - 12;
    const G = new Graph(stage, Object.assign({ x: ex.W - 454, y: 10, width: 440, height: 450 }, d.g));
    const py = (hh) => G.toPx(0, hh)[1] + 10, base = py(0);
    // the scene, drawn to the same vertical scale as the graph
    const sc = svgEl('svg', { class: 'u5l3-scene', width: SW, height: 450, viewBox: `0 0 ${SW} 450` }); add(stage, sc, 14, 0); sc.style.position = 'absolute'; sc.style.top = '10px';
    const sy = (hh) => py(hh) - 10;
    let obj, posObj;
    if (k === 'dive') {
      svgEl('rect', { x: 0, y: sy(0), width: SW, height: 450 - sy(0), fill: '#bcdcf5' }, sc);
      svgEl('line', { x1: 0, x2: SW, y1: sy(0), y2: sy(0), stroke: '#4d93cc', 'stroke-width': 3 }, sc);
      svgEl('rect', { x: 30, y: sy(9.4), width: 56, height: sy(0) - sy(9.4), fill: '#c9cdd6', stroke: '#1e2d46', 'stroke-width': 1.6 }, sc);
      svgEl('rect', { x: 24, y: sy(10), width: 80, height: sy(9.4) - sy(10), fill: '#7f8798', stroke: '#1e2d46', 'stroke-width': 1.6 }, sc);
      for (const hh of [2, 4, 6, 8]) { svgEl('text', { x: 58, y: sy(hh) + 6, class: 'u5l3-sctxt', 'text-anchor': 'middle' }, sc).textContent = hh; }
      obj = svgEl('g', {}, sc);
      svgEl('circle', { cx: 0, cy: -38, r: 7.5, fill: '#1e2d46' }, obj);
      svgEl('path', { d: 'M0 -30 V-12 M0 -12 L-6 2 M0 -12 L6 2 M0 -26 L11 -34 M0 -26 L-11 -34', stroke: '#1e2d46', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, obj);
      posObj = (t) => { const x = t <= 0 ? 80 : 110 + (SW - 150) * t / 2; obj.setAttribute('transform', `translate(${x} ${sy(Math.max(0, d.f(t)))})`); };
    } else {
      svgEl('rect', { x: 0, y: sy(0), width: SW, height: 450 - sy(0), fill: '#cfe6c2' }, sc);
      svgEl('line', { x1: 0, x2: SW, y1: sy(0), y2: sy(0), stroke: '#5c8a3e', 'stroke-width': 3 }, sc);
      svgEl('line', { x1: 40, x2: 40, y1: sy(0), y2: sy(850), stroke: '#1e2d46', 'stroke-width': 2 }, sc);
      for (let hh = 0; hh <= 800; hh += 200) { svgEl('line', { x1: 34, x2: 46, y1: sy(hh), y2: sy(hh), stroke: '#1e2d46', 'stroke-width': 2 }, sc); svgEl('text', { x: 52, y: sy(hh) + 6, class: 'u5l3-sctxt' }, sc).textContent = hh; }
      obj = svgEl('g', {}, sc);
      svgEl('path', { d: 'M-34 -78 a34 36 0 1 1 68 0 q0 18 -22 34 h-24 q-22 -16 -22 -34z', fill: '#e8a01e', stroke: '#1e2d46', 'stroke-width': 2 }, obj);
      svgEl('path', { d: 'M0 -114 q-14 30 -8 70 M0 -114 q14 30 8 70', fill: 'none', stroke: '#c93a33', 'stroke-width': 3 }, obj);
      svgEl('path', { d: 'M-12 -44 L-9 -16 M12 -44 L9 -16', stroke: '#1e2d46', 'stroke-width': 1.6 }, obj);
      svgEl('rect', { x: -12, y: -16, width: 24, height: 16, fill: '#a8754a', stroke: '#1e2d46', 'stroke-width': 1.6 }, obj);
      posObj = (t) => obj.setAttribute('transform', `translate(${SW / 2 + 20} ${sy(Math.max(0, d.f(Math.min(t, d.t1))))})`);
    }
    posObj(0);
    const P = panel(stage, PX0, 14, PW, 440, 'Substitute', 'u5l3-ctxp');
    const trace = { from: 0, to: 0.0001, color: RED, arrows: false, width: 4.5 };
    let cur, mk;
    return [
      { cap: d.cap1, run: async (c) => { for (const s of d.vint) await show(c, line(P, s, 'u5l3-sm')); mk = G.point(0, d.v0, { color: BLUE, r: 8, label: `<b>start</b> ${T(pairTex(0, d.v0))}`, pos: 'e' }); await G.reveal(mk, c); } },
      { cap: d.cap2, run: async (c) => {
        cur = G.fn(d.f, trace); const tp = G.point(0, d.v0, { color: RED, r: 7 });
        await tween(c, 2400, (t) => { const tt = d.t1 * t; trace.to = Math.max(0.0001, tt); cur._bkDraw(); G.moveTo(tp, tt, d.f(tt)); posObj(tt); }, (t) => t);
        G.remove(tp);
      } },
      { cap: d.cap3, run: async (c) => { for (const s of d.hint) await show(c, line(P, s, 'u5l3-sm')); } },
      { cap: d.cap4, run: async (c) => { await G.reveal(G.point(d.t1, 0, { color: RED, r: 8, label: `<b>${d.end}</b> ${T(pairTex(d.t1, 0))}`, pos: k === 'dive' ? 'nw' : 'ne' }), c); } },
      { cap: d.cap5, run: async (c) => {
        const e = G.fn(d.f, { from: d.ext[0], to: d.ext[1], color: 'gray', dash: true, arrows: false, width: 3.5 }); await G.drawIn(e, 800, c);
        if (d.neg != null) { const q = G.point(d.neg, 0, { open: true, color: 'gray', r: 8, label: T('t=-1'), pos: 'nw' }); await G.reveal(q, c); }
        const s = stamp(P, d.neg != null ? '✗ no meaning' : 'stops here', { ok: false, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = '10px'; await stampIn(c, s);
      } }
    ];
  }
};

/* =============================== explainer 7: interpolation or extrapolation =============================== */
const bal = (t) => 800 - 40 * t;
const IP = {
  d: { label: 'Example 5(d) check: ' + T('t=12'), t: 12, kind: 'interpolation', by: 't',
    caps: [`Find the height at ${T('t=12')}. Draw the vertical line ${T('t=12')}.`, `Read across to the ${T('h')}-axis: about ${T('320')} m. That’s an <b>estimate</b> from the graph.`,
      `Formula: ${T('h=800-40(12)=320')} m <b>exactly</b>.`, `${T('t=12')} lies <b>between</b> the plotted points ${T('t=10')} and ${T('t=15')}: <b>interpolation</b>.`],
    work: ['h=800-40(12)', '=320\\text{ m}'] },
  e: { label: 'Example 5(e) check: ' + T('h=160'), t: 16, kind: 'extrapolation', by: 'h',
    caps: [`When is the height 160 m? Draw the horizontal line ${T('h=160')}.`, `It meets the line (extended past the last point) at about ${T('t=16')}. An <b>estimate</b>.`,
      `Formula: ${T('160=800-40t')}, ${T('40t=640')}, ${T('t=16')} minutes <b>exactly</b>.`, `${T('t=16')} lies <b>beyond</b> the last plotted point, ${T('t=15')}: <b>extrapolation</b>.`],
    work: ['160=800-40t', '40t=640', 't=16\\text{ min}'] },
  far: { label: 'Too far: ' + T('t=25'), t: 25, kind: 'too far', by: 't',
    caps: [`What about ${T('t=25')}? That’s far beyond the plotted points. Draw ${T('t=25')}.`, `Extend the line that far and it is <b>below the ground</b>.`,
      `Formula: ${T('h=800-40(25)=-200')}. A negative height!`, `The balloon landed at ${T('t=20')}. Extrapolate past the end of the story and the model <b>stops making sense</b>.`],
    work: ['h=800-40(25)', '=-200\\text{ m}\\ ✗'] }
};
const interp = {
  title: 'Interpolation or extrapolation?',
  height: 470,
  choices: Object.keys(IP).map((k) => ({ v: k, label: IP[k].label })),
  intro: 'The table of values plotted four points, from <b>t = 0</b> to <b>t = 15</b>. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = IP[k], GW = 560;
    const G = new Graph(stage, { x: 14, y: 10, width: GW, height: 450, xmin: -1, xmax: 27, ymin: -300, ymax: 900, xstep: 5, ystep: 100, xtitle: 't', ytitle: 'h' });
    const P = panel(stage, GW + 34, 14, ex.W - GW - 48, 440, 'Exact, by formula');
    const zone = (a, b, color) => { const [x0, y0] = G.toPx(a, 900), [x1, y1] = G.toPx(b, -300); return svgEl('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: color, 'fill-opacity': 0.1 }, G.layers.bg); };
    const pts = [0, 5, 10, 15].map((t) => G.point(t, bal(t), { color: 'ink', r: 7 }));
    void pts;
    const z1 = zone(0, 15, GRN), z2 = zone(15, 27, AMB); z1.style.opacity = 0; z2.style.opacity = 0;
    const lz1 = G.label(7.5, 860, '<b>interpolate</b>', { color: GRN, cls: 'bk-ptlab' }), lz2 = G.label(21, 860, '<b>extrapolate</b>', { color: AMB, cls: 'bk-ptlab' });
    lz1.style.opacity = 0; lz2.style.opacity = 0;
    const y = bal(d.t);
    let L;
    return [
      { cap: `Between the first and last plotted points (green) we <b>interpolate</b>. Beyond them (orange) we must extend the graph: <b>extrapolate</b>.`,
        run: async (c) => { await G.drawIn(G.segment([0, 800], [15, 200], { color: BLUE }), 700, c); await appear(c, z1); await appear(c, lz1); await G.drawIn(G.segment([15, 200], [27, -280], { color: BLUE, dash: true }), 700, c); await appear(c, z2); await appear(c, lz2); } },
      { cap: d.caps[0], run: async (c) => { L = d.by === 't' ? G.vline(d.t, { color: PUR }) : G.hline(160, { color: PUR }); await G.drawIn(L, 600, c); } },
      { cap: d.caps[1], run: async (c) => { await G.drawIn(G.guides(d.t, y, { color: PUR }), 600, c); await G.reveal(G.point(d.t, y, { color: PUR, r: 8, label: T(pairTex(d.t, y)), pos: y < 0 ? 'w' : 'ne' }), c); } },
      { cap: d.caps[2], run: async (c) => { for (const s of d.work) await show(c, line(P, T(s), 'u5l3-mline')); } },
      { cap: d.caps[3], run: async (c) => { const s = stamp(P, d.kind, { ok: k === 'd' ? true : k === 'e' ? null : false }); s.style.alignSelf = 'center'; s.style.marginTop = '24px'; await stampIn(c, s); } }
    ];
  }
};

/* =============================== mount =============================== */
mountDive();
mountEx4();
export const explainers = mountExplainers({ meetAxes, subst, sameLine, crossTouch, lineCount, context, interp });
export const _test = { MEET, SUB, LC, IP };
