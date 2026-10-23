/* Math 10C · Unit 8 · Lesson 6 — Systems of Linear Equations: Cumulative Review.
 * Static figures: the warm-up mobiles, the how-many-solutions minis, the Example 4(f) grid (+ answer graph) and the
 * review question 15 grid (+ answer graph). Explainers:
 *   mobile (warm-up: each level bar is an equation; Mobile A by substitution, Mobile B by substitution and by elimination),
 *   howMany (one / none / infinitely many: the graph, the slopes and intercepts, and what the algebra gives; line 2 turning
 *   until parallel, then sliding onto line 1), methods (one system, three roads to (2, 3): graphing, substitution with the
 *   expression lifting into the other equation, elimination with the opposite terms cancelling), choose (★ a system
 *   travels a which-method flowchart, then is solved and checked; Example 1(b), 2(a), 2(b), 2(c), 3 and two demos),
 *   tables (Example 1: two tables → two lines → the crossing; where the gaps between the tables flip), setEq (decimals:
 *   a hand-drawn graph only estimates, so a sweep line finds where the two y-values match, then set them equal:
 *   Example 2(c) and Example 4(c)),
 *   trip (Example 3: the two trips drawn to scale, the motion organizer, the equations, then a race against the clock),
 *   plans (★ Example 4: three plan lines on one graph; a sweep line shows the lowest line, the "best plan" band changing
 *   at the two crossovers).
 * Colours (whole unit): Eq. 1 / line 1 blue, Eq. 2 / line 2 amber, the solution purple; Plan 3 green. */
import {
  h, tex, add, box, Graph, ValueTable, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pairTex, texNum, svgEl, place, pulse, anim, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const BLUE = '#1f5bd6', AMB = '#c27a0e', AMBT = '#b06a07', PUR = '#7b4fc4', GRN = '#12805a', RED = COLORS.red, TEAL = COLORS.teal, INK = COLORS.ink, GRAY = '#9aa0ab';
const cB = (s) => `\\textcolor{${BLUE}}{${s}}`, cA = (s) => `\\textcolor{${AMBT}}{${s}}`, cP = (s) => `\\textcolor{${PUR}}{${s}}`, cG = (s) => `\\textcolor{${GRN}}{${s}}`;
const tag = (k, txt) => `<span class="u8l6-eqtag e${k}">${txt || 'Eq. ' + k}</span>`;
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u8l6-panel', title ? `<div class="u8l6-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u8l6-line ' + cls, html); p.appendChild(d); return d; };
const say = async (c, p, html, cls) => { const d = line(p, html, cls); await fadeIn(c, d, 300); return d; };
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const money = (v) => '\\$' + v.toFixed(2);
/** position of el inside the stage (layout coordinates: unaffected by page zoom) */
function posIn(el, stage) { let x = 0, y = 0, e = el; while (e && e !== stage) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return [x, y]; }
/** a coloured pill label for a line on a graph */
const lineLab = (G, x, y, html, color, pos = 'c') => G.label(x, y, html, { cls: 'u8l6-pill', pos, color });

/* =============================== the mobiles =============================== */
const SHAPE = { star: '#f0b91e', moon: '#7878c8', tri: '#46a05a', circ: '#3278d2', sq: '#d23c32' };
function shapeEl(parent, kind, cx, cy, s, o = {}) {
  const g = svgEl('g', { class: 'u8l6-shape' }, parent), st = { fill: SHAPE[kind], stroke: INK, 'stroke-width': 2.2, 'stroke-linejoin': 'round' };
  if (o.ghost) { st['fill-opacity'] = 0.55; st['stroke-dasharray'] = '5 4'; }
  const pts = (a) => a.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');
  if (kind === 'star') {
    const R = 0.75 * s, r = R / 2.3, a = [];
    for (let i = 0; i < 10; i++) { const t = Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; a.push([cx + q * Math.cos(t), cy - q * Math.sin(t)]); }
    svgEl('polygon', Object.assign({ points: pts(a) }, st), g);
  } else if (kind === 'moon') {
    const a = [], d = Math.PI / 180;
    for (let t = 56.25; t <= 303.75 + 1e-9; t += 4.125) a.push([cx + 0.6 * s * Math.cos(t * d), cy - 0.6 * s * Math.sin(t * d)]);
    for (let t = 273.82; t >= 86.18 - 1e-9; t -= 3.1273) a.push([cx + 0.3 * s + 0.5 * s * Math.cos(t * d), cy - 0.5 * s * Math.sin(t * d)]);
    svgEl('polygon', Object.assign({ points: pts(a) }, st), g);
  } else if (kind === 'tri') svgEl('polygon', Object.assign({ points: pts([[cx - 0.7 * s, cy + 0.55 * s], [cx + 0.7 * s, cy + 0.55 * s], [cx, cy - 0.65 * s]]) }, st), g);
  else if (kind === 'circ') svgEl('circle', Object.assign({ cx, cy, r: 0.65 * s }, st), g);
  else if (kind === 'sq') svgEl('rect', Object.assign({ x: cx - 0.65 * s, y: cy - 0.65 * s, width: 1.3 * s, height: 1.3 * s }, st), g);
  g.cx = cx; g.cy = cy; return g;
}
const MOB = {
  A: { hook: [0, 8.1], total: 'total 20 g', bars: [[-2.6, 2.6, 8.1]],
    strings: [[-2.6, 8.1, -2.6, 6.75], [2.6, 8.1, 2.6, 6.7], [2.6, 5.5, 2.6, 4.9]],
    shapes: { s: ['star', -2.6, 6.05], m1: ['moon', 2.6, 6.1], m2: ['moon', 2.6, 4.3] }, name: 'Mobile A' },
  B: { hook: [0, 8.3], total: 'total 48 g', bars: [[-4.6, 4.6, 8.3], [-6.8, -2.4, 7.0]],
    strings: [[-4.6, 8.3, -4.6, 7.0], [-6.8, 7.0, -6.8, 6.2], [-6.8, 4.95, -6.8, 4.3], [-2.4, 7.0, -2.4, 6.3], [4.6, 8.3, 4.6, 7.1], [4.6, 5.8, 4.6, 5.1]],
    shapes: { t1: ['tri', -6.8, 5.6], t2: ['tri', -6.8, 3.7], c: ['circ', -2.4, 5.65], s: ['sq', 4.6, 6.45], t3: ['tri', 4.6, 4.5] }, name: 'Mobile B' }
};
/** draw a mobile into an svg. (ox, oy) is the px position of the TikZ origin, s px per unit. */
function drawMobile(svg, key, ox, oy, s) {
  const M = MOB[key], X = (x) => ox + x * s, Y = (y) => oy - y * s, root = svgEl('g', {}, svg);
  const hl = svgEl('g', {}, root);
  M.strings.forEach(([a, b, c, d]) => svgEl('line', { x1: X(a), y1: Y(b), x2: X(c), y2: Y(d), stroke: INK, 'stroke-width': 2 }, root));
  M.bars.forEach(([a, b, y]) => { svgEl('line', { x1: X(a), y1: Y(y), x2: X(b), y2: Y(y), stroke: '#aa7712', 'stroke-width': 7, 'stroke-linecap': 'round' }, root); svgEl('circle', { cx: X((a + b) / 2), cy: Y(y), r: 4, fill: INK }, root); });
  const [hx, hy] = M.hook;
  svgEl('line', { x1: X(hx), y1: Y(hy), x2: X(hx), y2: Y(hy + 0.5), stroke: INK, 'stroke-width': 2.6 }, root);
  svgEl('circle', { cx: X(hx), cy: Y(hy + 0.72), r: 0.22 * s, fill: 'none', stroke: INK, 'stroke-width': 2.6 }, root);
  const tw = M.total.length * 11.6 + 16;
  svgEl('rect', { x: X(hx + 0.55), y: Y(hy + 0.6) - 17, width: tw, height: 34, rx: 7, fill: '#ffecb3', stroke: '#c88c14', 'stroke-width': 2 }, root);
  const t = svgEl('text', { x: X(hx + 0.55) + 8, y: Y(hy + 0.6) + 7, class: 'u8l6-hook', fill: INK }, root); t.textContent = M.total;
  const nm = svgEl('text', { x: X(0), y: Y(3.0) + 8, class: 'u8l6-mobname', fill: INK, 'text-anchor': 'middle' }, root); nm.textContent = M.name;
  const shapes = {};
  for (const k in M.shapes) { const [kind, x, y] = M.shapes[k]; shapes[k] = shapeEl(root, kind, X(x), Y(y), s); shapes[k].kind = kind; }
  /** a translucent box around a region (TikZ units), for "this side" */
  const region = (x0, x1, y0, y1, color) => svgEl('rect', { x: X(x0), y: Y(y1), width: (x1 - x0) * s, height: (y1 - y0) * s, rx: 12, fill: color, 'fill-opacity': 0.13, stroke: color, 'stroke-width': 2.5, 'stroke-dasharray': '8 6' }, hl);
  return { root, shapes, X, Y, s, region, hl };
}

/* =============================== explainer: warm-up mobiles =============================== */
const mobile = {
  title: 'Balance the Mobile: each level bar is an equation',
  height: 430,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'A', label: 'Mobile A' }, { v: 'Bs', label: 'Mobile B: substitution' }, { v: 'Be', label: 'Mobile B: elimination' }],
  intro: (v) => (v === 'A' ? 'One level bar, one total: two equations. Press <b>Next</b>.' : v === 'Bs' ? 'Two level bars and a total. Swap shapes for shapes (substitution). Press <b>Next</b>.' : 'The same mobile, solved by subtracting two equations (elimination). Press <b>Next</b>.'),
  make(stage, v, ex) {
    const isA = v === 'A', s = isA ? 46 : 38, W = isA ? 420 : 520, HH = 400;
    const host = add(stage, box(h('div', ''), W, HH), 8, 14), svg = svgEl('svg', { width: W, height: HH }, host);
    const Mo = isA ? drawMobile(svg, 'A', 204, 470, s) : drawMobile(svg, 'B', 302, 420, s); // A sits right enough for the two ghost moons by the star
    const Pn = panel(stage, W + 24, 14, ex.W - W - 34, 400, 'Equations');
    const WPOS = isA ? { s: 's', m1: 'e', m2: 'e' } : { t1: 'e', t2: 'e', c: 'e', s: 'w', t3: 'w' };
    const wl = (k, txt) => { const sh = Mo.shapes[k], p = WPOS[k], d = h('div', 'bk-lab u8l6-wlab', txt); host.appendChild(d); place(d, sh.cx + (p === 'e' ? 0.8 : p === 'w' ? -0.8 : 0) * s, sh.cy + (p === 's' ? 0.85 * s : 0), p, 4); return d; };
    const sideLab = (x, y, txt, color) => { const d = h('div', 'bk-lab u8l6-sidelab', txt); d.style.color = color; host.appendChild(d); place(d, Mo.X(x), Mo.Y(y), 'c'); return d; };
    const ghosts = (k, kind, n) => { const sh = Mo.shapes[k], g = svgEl('g', {}, Mo.root); for (let i = 0; i < n; i++) shapeEl(g, kind, sh.cx + (i - (n - 1) / 2) * 1.45 * s, sh.cy, s * 0.8, { ghost: true }); return g; };
    if (isA) {
      return [
        { cap: `A <b>level</b> bar: the left side weighs the same as the right side. Let a star weigh ${T('s')} grams and a moon ${T('m')} grams. One star balances two moons: ${T(cB('s=2m'))}.`,
          run: async (c) => { await appear(c, Mo.region(-3.45, -1.75, 5.15, 7.6, BLUE), 300); await appear(c, Mo.region(1.75, 3.45, 3.55, 7.6, BLUE), 300); await say(c, Pn, `${tag(1)}${T(cB('s=2m'))} <span class="muted u8l6-small">(the level bar)</span>`); } },
        { cap: `The whole mobile weighs 20 g: ${T(cA('s+2m=20'))}. Two equations, two unknowns: a <b>system</b>.`,
          run: async (c) => { await say(c, Pn, `${tag(2)}${T(cA('s+2m=20'))} <span class="muted u8l6-small">(the total)</span>`); } },
        { cap: `<b>Substitute:</b> Eq. 1 says a star is worth 2 moons, so swap it. Now 4 moons weigh 20 g: ${T('2m+2m=20')}, so ${T('4m=20')} and ${T('m=5')}.`,
          run: async (c) => { const sh = Mo.shapes.s; await anim(c, sh, [{ opacity: 1 }, { opacity: 0 }], 400); const g = ghosts('s', 'moon', 2); await appear(c, g, 400); await say(c, Pn, `${T(`${cB('2m')}+2m=20`)}`); await say(c, Pn, `${T('4m=20\\ \\Rightarrow\\ ' + cP('m=5'))}`); } },
        { cap: `Back-substitute: ${T('s=2(5)=10')}. A moon is <b>5 g</b> and a star is <b>10 g</b>. Check: ${T('10=5+5')} ✓ and ${T('10+2(5)=20')} ✓`,
          run: async (c) => {
            await say(c, Pn, `${T('s=2(5)=' + cP('10'))}`);
            for (const [k, t] of [['s', '10 g'], ['m1', '5 g'], ['m2', '5 g']]) await pop(c, wl(k, t), 300);
            await say(c, Pn, `<span class="u8l6-good">Check: ${T('10=5+5')} ✓ &nbsp; ${T('10+10=20')} ✓</span>`);
          } }
      ];
    }
    const vars = `Let ${T('t')}, ${T('c')} and ${T('s')} be the masses in grams of a triangle, the circle and the square.`;
    if (v === 'Bs') {
      return [
        { cap: `${vars} The small bar is level: one circle balances two triangles, ${T(cB('c=2t'))}.`,
          run: async (c) => { await appear(c, Mo.region(-7.65, -5.95, 3.0, 6.35, BLUE), 300); await appear(c, Mo.region(-3.2, -1.6, 4.85, 6.45, BLUE), 300); await say(c, Pn, `${tag(1)}${T(cB('c=2t'))} <span class="muted u8l6-small">(small bar)</span>`); } },
        { cap: `The top bar is level: left side ${T('2t+c')}, right side ${T('s+t')}. So ${T(cA('2t+c=s+t'))}.`,
          run: async (c) => { await appear(c, Mo.region(-7.8, -1.45, 2.85, 7.45, AMB), 300); await appear(c, Mo.region(3.75, 5.45, 3.7, 7.45, AMB), 300); await say(c, Pn, `${tag(2)}${T(cA('2t+c=s+t'))} <span class="muted u8l6-small">(top bar)</span>`); } },
        { cap: `The whole mobile weighs 48 g: ${T(cG('2t+c+s+t=48'))}.`,
          run: async (c) => { await say(c, Pn, `${tag(3)}${T(cG('2t+c+s+t=48'))} <span class="muted u8l6-small">(total)</span>`); } },
        { cap: `<b>Substitute</b> ${T(cB('c=2t'))} into Eq. 2: swap the circle for 2 triangles. ${T('2t+2t=s+t')}, so ${T('s=3t')}: the square balances 3 triangles.`,
          run: async (c) => { await anim(c, Mo.shapes.c, [{ opacity: 1 }, { opacity: 0 }], 400); await appear(c, ghosts('c', 'tri', 2), 400); await say(c, Pn, `${T(`2t+${cB('2t')}=s+t\\ \\Rightarrow\\ s=3t`)}`); } },
        { cap: `Substitute ${T('c=2t')} and ${T('s=3t')} into the total: ${T('2t+2t+3t+t=48')}, so ${T('8t=48')} and ${T('t=6')}.`,
          run: async (c) => { await say(c, Pn, `${T('2t+2t+3t+t=48')}`); await say(c, Pn, `${T('8t=48\\ \\Rightarrow\\ ' + cP('t=6'))}`); } },
        { cap: `Back-substitute: ${T('c=2(6)=12')} and ${T('s=3(6)=18')}. The square is <b>18 g</b>: answer <b>C</b>. Check: ${T('6+6+12+18+6=48')} ✓`,
          run: async (c) => {
            await say(c, Pn, `${T('c=2(6)=' + cP('12') + ',\\ \\ s=3(6)=' + cP('18'))}`);
            for (const [k, t] of [['t1', '6 g'], ['t2', '6 g'], ['c', '12 g'], ['s', '18 g'], ['t3', '6 g']]) await pop(c, wl(k, t), 260);
            await say(c, Pn, `<span class="u8l6-good">Check: ${T('6+6+12+18+6=48')} ✓</span>`);
          } }
      ];
    }
    return [
      { cap: `${vars} The top bar is level and the total is 48 g, so each side weighs ${T('48\\div2=24')} g.`,
        run: async (c) => { await appear(c, Mo.region(-7.8, -1.45, 2.85, 7.45, GRAY), 300); await appear(c, Mo.region(3.75, 5.45, 3.7, 7.45, GRAY), 300); await pop(c, sideLab(-4.6, 7.75, '24 g', INK)); await pop(c, sideLab(4.6, 7.75, '24 g', INK)); } },
      { cap: `The right side is the square and one triangle: ${T(cB('s+t=24'))}.`,
        run: async (c) => { await say(c, Pn, `${tag(1)}${T(cB('s+t=24'))} <span class="muted u8l6-small">(right side)</span>`); } },
      { cap: `The small bar says ${T('c=2t')}, so the top bar’s balance ${T('2t+c=s+t')} becomes ${T('4t=s+t')}, that is ${T(cA('s-3t=0'))}.`,
        run: async (c) => { await say(c, Pn, `${T('2t+2t=s+t')}`, 'u8l6-small'); await say(c, Pn, `${tag(2)}${T(cA('s-3t=0'))} <span class="muted u8l6-small">(top bar)</span>`); } },
      { cap: `The ${T('s')}-coefficients <b>match</b>: subtract. ${T('(s+t)-(s-3t)=24-0')}. The ${T('s')}’s cancel: ${T('4t=24')}, so ${T('t=6')}.`,
        run: async (c) => { await say(c, Pn, `${T(`(${cB('s+t')})-(${cA('s-3t')})=24-0`)}`); await say(c, Pn, `${T('\\cancel{s}-\\cancel{s}+t+3t=24')}`, 'u8l6-small'); await say(c, Pn, `${T('4t=24\\ \\Rightarrow\\ ' + cP('t=6'))}`); } },
      { cap: `Back-substitute into Eq. 1: ${T('s+6=24')}, so ${T('s=18')}. The square is <b>18 g</b>: answer <b>C</b>, the same as by substitution.`,
        run: async (c) => { await say(c, Pn, `${T('s+6=24\\ \\Rightarrow\\ ' + cP('s=18'))}`); for (const [k, t] of [['s', '18 g'], ['t3', '6 g']]) await pop(c, wl(k, t), 260); await say(c, Pn, `<span class="u8l6-good">Two methods, one answer ✓</span>`); } }
    ];
  }
};

/* =============================== explainer: how many solutions =============================== */
const HM = {
  one: { label: 'One solution', m: -1, b: 5 },
  none: { label: 'No solution', m: 2, b: 3 },
  inf: { label: 'Infinitely many', m: 2, b: -1 },
  turn: { label: 'Turn line 2', m: -1, b: 5 }
};
const howMany = {
  title: 'How many solutions? Graph, slopes, algebra',
  height: 450,
  minW: 820, // the compare panel needs ~350 px beside the graph
  choices: Object.keys(HM).map((k) => ({ v: k, label: HM[k].label })),
  intro: (v) => (v === 'turn' ? 'Start with two crossing lines, then turn and slide line 2. Press <b>Next</b>.' : 'Line 1 is always ' + T(cB('y=2x-1')) + '. Compare line 2 three ways. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const G = new Graph(stage, { x: 8, y: 8, width: 430, height: 430, xmin: -6, xmax: 6, ymin: -6, ymax: 6, xlabels: 2, ylabels: 2, fontSize: 15 });
    const Pn = panel(stage, 458, 8, ex.W - 468, 430, v === 'turn' ? 'Line 2' : 'Compare');
    const L1 = G.line({ m: 2, b: -1 }, { color: BLUE, width: 4 });
    const st = { m: HM[v].m, b: HM[v].b };
    const L2 = G.curve(() => { const w = G.win; return { subs: [[G.toPx(w.xmin, st.m * w.xmin + st.b), G.toPx(w.xmax, st.m * w.xmax + st.b)]] }; }, { color: AMB, width: 4, dash: v === 'inf' ? '12 9' : null }, 'u8l6-l2', G.layers.data);
    hide(L2);
    const eq2 = (m, b) => `y=${m === 1 ? '' : m === -1 ? '-' : m}x${b < 0 ? b : '+' + b}`;
    if (v === 'turn') {
      const sol = G.point(2, 3, { color: PUR, r: 8 });
      const upd = () => { L2._bkDraw(); const den = 2 - st.m; if (Math.abs(den) < 1e-6) { sol.style.display = 'none'; return; } const x = (st.b + 1) / den; G.moveTo(sol, x, 2 * x - 1); };
      hide(sol);
      return [
        { cap: `Line 2 is ${T(cA('y=-x+5'))}. Different slopes (${T('2')} and ${T('-1')}): the lines cross once, at ${T(cP('(2,\\ 3)'))}.`,
          run: async (c) => { await appear(c, L2, 300); await G.drawIn(L2, 500, c); await G.reveal(sol, c); await say(c, Pn, `${T(cA('y=-x+5'))}: slope ${T('-1')}, crosses at ${T(cP('(2,\\ 3)'))}`); } },
        { cap: `Turn line 2 (keep ${T('b=5')}) until its slope is ${T('2')} too. Watch the crossing point: it runs away and leaves the grid. Equal slopes, different intercepts: <b>parallel</b>, no solution.`,
          run: async (c) => { await tween(c, 2600, (t) => { st.m = -1 + 3 * t; upd(); }); st.m = 2; upd(); await say(c, Pn, `${T(cA('y=2x+5'))}: slope ${T('2')} = slope ${T('2')} → parallel, <b>no</b> crossing`); } },
        { cap: `Now slide it down. At ${T('b=-1')} it lands exactly on line 1: <b>the same line</b>. Every point on it is on both lines: <b>infinitely many</b> solutions.`,
          run: async (c) => { await tween(c, 1800, (t) => { st.b = 5 - 6 * t; upd(); }); st.b = -1; upd(); L2.path.setAttribute('stroke-dasharray', '12 9'); await say(c, Pn, `${T(cA('y=2x-1'))}: same slope, same intercept → <b>infinitely many</b>`); } },
        { cap: `Only the slopes decide <b>one</b> solution. When the slopes are equal, the intercepts decide: different → <b>none</b>, equal → <b>infinitely many</b>.`,
          run: async (c) => { await say(c, Pn, `<b>slopes differ</b> → one<br><b>slopes equal</b>, ${T('b')} differ → none<br><b>slopes equal</b>, ${T('b')} equal → infinitely many`, 'u8l6-small'); } }
      ];
    }
    const steps = [
      { cap: `Line 1: ${T(cB('y=2x-1'))}. Line 2: ${T(cA(v === 'inf' ? '4x-2y=2' : eq2(st.m, st.b)))}.` + (v === 'inf' ? ` Rearranged: ${T('-2y=-4x+2')}, so ${T(cA('y=2x-1'))}.` : ''),
        run: async (c) => { await appear(c, L2, 200); await G.drawIn(L2, 600, c); await say(c, Pn, `${tag(1)}${T(cB('y=2x-1'))}<br>${tag(2)}${T(cA(v === 'inf' ? '4x-2y=2\\ \\to\\ y=2x-1' : eq2(st.m, st.b)))}`); } }
    ];
    if (v === 'one') {
      steps.push({ cap: `<b>Slopes</b> ${T('2')} and ${T('-1')}: different. The lines must cross, exactly once.`, run: async (c) => { await say(c, Pn, `Slopes ${T('2')}, ${T('-1')}: <b>different</b>`); } });
      steps.push({ cap: `<b>Algebra:</b> set them equal. ${T('2x-1=-x+5')}, so ${T('3x=6')} and ${T('x=2')}; then ${T('y=2(2)-1=3')}. One value for each variable.`,
        run: async (c) => { await say(c, Pn, `${T('2x-1=-x+5')}<br>${T('3x=6\\Rightarrow x=2,\\ y=3')}`); const p = G.point(2, 3, { color: PUR, r: 8, label: T(cP('(2,\\ 3)')), pos: 'e', gap: 10 }); await G.reveal(p, c); } });
      steps.push({ cap: `<b>One solution:</b> ${T(cP('(2,\\ 3)'))}, the only point on both lines.`, run: async (c) => { const s = stamp(Pn, 'one solution', { ok: true, size: 'sm' }); s.style.alignSelf = 'center'; await stampIn(c, s); } });
    } else if (v === 'none') {
      steps.push({ cap: `<b>Slopes</b> ${T('2')} and ${T('2')}: equal. <b>Intercepts</b> ${T('-1')} and ${T('3')}: different. The lines are parallel: always 4 units apart vertically.`,
        run: async (c) => { await say(c, Pn, `Slopes ${T('2')}, ${T('2')}: <b>equal</b><br>Intercepts ${T('-1')}, ${T('3')}: <b>different</b>`); for (const x of [-2, 1]) { const s = G.segment([x, 2 * x - 1], [x, 2 * x + 3], { color: GRAY, width: 2.5, dash: '5 4' }); await G.drawIn(s, 300, c); } } });
      steps.push({ cap: `<b>Algebra:</b> write both as ${T('2x-y=\\ldots')}: ${T(cB('2x-y=1'))} and ${T(cA('2x-y=-3'))}. Subtract: ${T('0=4')}. That is <b>false</b>: no pair ${T('(x,y)')} can make it true.`,
        run: async (c) => { await say(c, Pn, `${T(cB('2x-y=1'))}<br>${T(cA('2x-y=-3'))}<br>subtract: ${T('0=4')} <span class="u8l6-bad">✗ false</span>`); } });
      steps.push({ cap: `<b>No solution.</b> Parallel lines never meet.`, run: async (c) => { const s = stamp(Pn, 'no solution', { ok: false, size: 'sm' }); s.style.alignSelf = 'center'; await stampIn(c, s); } });
    } else {
      steps.push({ cap: `<b>Slopes</b> ${T('2')} and ${T('2')}: equal. <b>Intercepts</b> ${T('-1')} and ${T('-1')}: equal. Line 2 lies right on top of line 1.`,
        run: async (c) => { await say(c, Pn, `Slopes ${T('2')}, ${T('2')}: <b>equal</b><br>Intercepts ${T('-1')}, ${T('-1')}: <b>equal</b>`); for (const x of [-1, 1, 3]) await G.reveal(G.point(x, 2 * x - 1, { color: PUR, r: 6 }), c, 200); } });
      steps.push({ cap: `<b>Algebra:</b> ${T(cB('2x-y=1'))} times 2 is ${T('4x-2y=2')}. Subtract ${T(cA('4x-2y=2'))}: ${T('0=0')}. That is <b>always true</b>.`,
        run: async (c) => { await say(c, Pn, `${T('2\\times(' + cB('2x-y=1') + '):\\ 4x-2y=2')}<br>subtract ${T(cA('4x-2y=2'))}: ${T('0=0')} <span class="u8l6-good">✓ true</span>`); } });
      steps.push({ cap: `<b>Infinitely many solutions:</b> every point on the line, like ${T('(-1,-3)')}, ${T('(1,1)')}, ${T('(3,5)')}, works in both equations.`, run: async (c) => { const s = stamp(Pn, 'infinitely many', { ok: null, size: 'sm' }); s.style.alignSelf = 'center'; await stampIn(c, s); } });
    }
    return steps;
  }
};

/* =============================== explainer: three methods =============================== */
const methods = {
  title: 'One system, three roads to the same point',
  height: 440,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'graph', label: 'Graphing' }, { v: 'sub', label: 'Substitution' }, { v: 'elim', label: 'Elimination' }],
  intro: () => `The system ${T(cB('y=2x-1'))}, ${T(cA('x+y=5'))}. Pick a road. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const GW = 330, gx = ex.W - GW - 8;
    const G = new Graph(stage, { x: gx, y: 10, width: GW, height: 410, xmin: -2, xmax: 6, ymin: -3, ymax: 7, fontSize: 15, xlabels: 2, ylabels: 2 });
    const r1 = add(stage, h('div', 'u8l6-row', `${tag(1)}<span class="u8l6-pc">${T(cB('y='))}</span><span class="u8l6-pc u8l6-src">${T(cB('2x-1'))}</span>`), 14, 14);
    const r2 = add(stage, h('div', 'u8l6-row', `${tag(2)}<span>${T(cA('x+y=5'))}</span>`), 14, 64);
    const sol = () => G.point(2, 3, { color: PUR, r: 8, label: T(cP('(2,\\ 3)')), pos: 'e', gap: 10 });
    const verify = async (c, y0) => {
      const d = add(stage, h('div', 'u8l6-row u8l6-verify', `Verify: ${T(cB('3=2(2)-1'))} ✓ &nbsp; ${T(cA('2+3=5'))} ✓`), 14, y0); await fadeIn(c, d);
    };
    const drawLines = (c, ms) => Promise.all([G.drawIn(G.line({ m: 2, b: -1 }, { color: BLUE, width: 3.5 }), ms, c), G.drawIn(G.line({ m: -1, b: 5 }, { color: AMB, width: 3.5 }), ms, c)]);
    if (v === 'graph') {
      return [
        { cap: `Eq. 1 is already ${T('y=mx+b')}: start at ${T('b=-1')}, then <b>rise 2, run 1</b>, again and again.`,
          run: async (c) => {
            for (const x of [0, 1, 2, 3]) await G.reveal(G.point(x, 2 * x - 1, { color: BLUE, r: 6 }), c, 220);
            await G.drawIn(G.line({ m: 2, b: -1 }, { color: BLUE, width: 3.5 }), 600, c);
            await fadeIn(c, add(stage, h('div', 'u8l6-row', `${T(cB('b=-1,\\ m=2'))}`), 60, 130));
          } },
        { cap: `Rearrange Eq. 2: ${T(cA('y=-x+5'))}. Start at ${T('b=5')}, then <b>down 1, right 1</b>.`,
          run: async (c) => {
            await fadeIn(c, add(stage, h('div', 'u8l6-row', `${T(cA('x+y=5\\ \\to\\ y=-x+5'))}`), 60, 180));
            for (const x of [0, 1, 2, 3]) await G.reveal(G.point(x, 5 - x, { color: AMB, r: 6 }), c, 220);
            await G.drawIn(G.line({ m: -1, b: 5 }, { color: AMB, width: 3.5 }), 600, c);
          } },
        { cap: `Read the crossing point: ${T(cP('(2,\\ 3)'))}. By hand, graphing is exact only when the crossing lands on grid points like this one.`,
          run: async (c) => { await G.reveal(sol(), c); await fadeIn(c, add(stage, h('div', 'u8l6-row', `crossing: ${T(cP('(2,\\ 3)'))}`), 60, 240)); } },
        { cap: `Verify in <b>both</b> equations: ${T(cB('3=2(2)-1'))} ✓ and ${T(cA('2+3=5'))} ✓`, run: (c) => verify(c, 300) }
      ];
    }
    if (v === 'sub') {
      let slot, work;
      return [
        { cap: `<b>Step 1.</b> Solve one equation for one variable. Eq. 1 is already done: ${T('y')} is isolated, ${T(cB('y=2x-1'))}.`,
          run: async (c) => { const src = r1.querySelector('.u8l6-src'); await pulse(c, src, 1.15); src.style.background = '#e7efff'; src.style.borderRadius = '8px'; } },
        { cap: `<b>Step 2.</b> Substitute into the <i>other</i> equation: replace ${T('y')} in Eq. 2 with what it equals. The expression <b>lifts</b> out of Eq. 1 and drops into ${T('y')}’s place.`,
          run: async (c) => {
            work = add(stage, h('div', 'u8l6-row u8l6-tight', `<span>${T(cA('x+{}'))}</span><span class="u8l6-slot">${T(cA('y'))}</span><span>${T(cA('{}=5'))}</span>`), 60, 140);
            slot = work.querySelector('.u8l6-slot');
            await fadeIn(c, work);
            const src = r1.querySelector('.u8l6-src'), [sx, sy] = posIn(src, stage), [tx, ty] = posIn(slot, stage);
            const fly = add(stage, h('div', 'u8l6-piece lift', T(cB('(2x-1)'))), sx - 6, sy - 3);
            await anim(c, slot, [{ opacity: 1 }, { opacity: 0.15 }], 250);
            await tween(c, 1100, (t) => { fly.style.left = sx - 6 + (tx - sx - 4) * t + 'px'; fly.style.top = sy - 3 + (ty - sy) * t - 70 * Math.sin(Math.PI * t) + 'px'; });
            fly.remove(); slot.innerHTML = T(cB('(2x-1)')); slot.style.opacity = 1; await pulse(c, slot, 1.1);
          } },
        { cap: `<b>Step 3.</b> Solve for the remaining variable: ${T('x+2x-1=5')}, so ${T('3x=6')} and ${T('x=2')}.`,
          run: async (c) => { await fadeIn(c, add(stage, h('div', 'u8l6-row', T('3x-1=5')), 60, 190)); await fadeIn(c, add(stage, h('div', 'u8l6-row', T('3x=6\\ \\Rightarrow\\ x=2')), 60, 236)); } },
        { cap: `<b>Step 4.</b> Back-substitute into Eq. 1: ${T(cB('y=2(2)-1=3'))}. The solution is ${T(cP('(2,\\ 3)'))}, the same crossing point as the graph.`,
          run: async (c) => { await fadeIn(c, add(stage, h('div', 'u8l6-row', `${T(cB('y=2(2)-1=3'))} &nbsp;→&nbsp; ${T(cP('(2,\\ 3)'))}`), 60, 282)); await drawLines(c, 500); await G.reveal(sol(), c); } },
        { cap: `Verify in <b>both</b> equations: ${T(cB('3=2(2)-1'))} ✓ and ${T(cA('2+3=5'))} ✓`, run: (c) => verify(c, 340) }
      ];
    }
    // elimination: aligned columns
    const X0 = 70, COLS = [0, 92, 190, 232], cell = (tx, col, y, color) => { const d = add(stage, h('div', 'u8l6-piece', T(color ? color(tx) : tx)), X0 + COLS[col], y); return d; };
    const rowA = [], rowB = [];
    return [
      { cap: `Line the equations up with ${T('x')} and ${T('y')} on the left. Eq. 1 ${T(cB('y=2x-1'))} becomes ${T(cB('2x-y=1'))}.`,
        run: async (c) => {
          [['2x', 0], ['-\\,y', 1], ['=', 2], ['1', 3]].forEach(([t, k]) => rowA.push(cell(t, k, 140, cB)));
          [['x', 0], ['+\\,y', 1], ['=', 2], ['5', 3]].forEach(([t, k]) => rowB.push(cell(t, k, 190, cA)));
          for (const e of rowA) await fadeIn(c, e, 200);
          for (const e of rowB) await fadeIn(c, e, 200);
        } },
      { cap: `The ${T('y')}-coefficients are <b>opposites</b> (${T('-1')} and ${T('+1')}): <b>add</b>. Two balanced scales put together still balance: left plus left equals right plus right.`,
        run: async (c) => {
          const plus = add(stage, h('div', 'u8l6-piece', T('+')), X0 - 40, 190); await pop(c, plus);
          const rule = add(stage, box(h('div', 'u8l6-rule'), 280, null), X0 - 10, 236); await anim(c, rule, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 400);
        } },
      { cap: `The ${T('y')}’s cancel: ${T('-y+y=0')}. What is left is ${T('3x=6')}, so ${T('x=2')}.`,
        run: async (c) => {
          for (const e of [rowA[1], rowB[1]]) { const s = add(stage, box(h('div', 'u8l6-strike'), 58, null), parseFloat(e.style.left) - 4, parseFloat(e.style.top) + 15); s.style.transform = 'rotate(-14deg)'; await anim(c, s, [{ transform: 'rotate(-14deg) scaleX(0)' }, { transform: 'rotate(-14deg) scaleX(1)' }], 300); }
          [['3x', 0], ['0', 1], ['=', 2], ['6', 3]].forEach(([t, k], i) => { const d = cell(t, k, 246); if (i === 1) d.style.color = GRAY; hide(d); });
          for (const d of [...stage.querySelectorAll('.u8l6-piece')].slice(-4)) await fadeIn(c, d, 220);
          await fadeIn(c, add(stage, h('div', 'u8l6-row', T('x=2')), X0 + 300, 246));
        } },
      { cap: `Back-substitute into Eq. 2: ${T(cA('2+y=5'))}, so ${T('y=3')}. The solution is ${T(cP('(2,\\ 3)'))} again.`,
        run: async (c) => { await fadeIn(c, add(stage, h('div', 'u8l6-row', `${T(cA('2+y=5'))} → ${T('y=3')} → ${T(cP('(2,\\ 3)'))}`), 60, 300)); await drawLines(c, 500); await G.reveal(sol(), c); } },
      { cap: `Verify in <b>both</b> equations: ${T(cB('3=2(2)-1'))} ✓ and ${T(cA('2+3=5'))} ✓. Three methods, one answer.`, run: (c) => verify(c, 354) }
    ];
  }
};

/* =============================== explainer: ★ choosing a method =============================== */
const SYS = {
  e1b: { label: 'Example 1(b)', e: ['y=2x-1', 'y=-x+8'], path: ['q1', 'q2', 'q3', 'sub'],
    ans: ['<b>No</b>: we want an exact answer.', '<b>No</b>: neither is in the form ' + T('Ax+By=C') + '.', '<b>Yes</b>: ' + T('y') + ' is already isolated in both.'],
    why: 'Both equations are already solved for ' + T('y') + ': substitute (set the two expressions equal).',
    work: ['2x-1=-x+8', '3x=9\\Rightarrow x=3', 'y=2(3)-1=5'], sol: '(3,\\ 5)', check: '-3+8=5' },
  e2a: { label: 'Example 2(a)', e: ['y=3x-2', '5x-2y=1'], path: ['q1', 'q2', 'q3', 'sub'],
    ans: ['<b>No</b>: we want an exact answer.', '<b>No</b>: Eq. 1 is not in ' + T('Ax+By=C') + ' form, and nothing matches.', '<b>Yes</b>: ' + T('y') + ' is already isolated in Eq. 1.'],
    why: T('y') + ' is already isolated: substitute it into Eq. 2.',
    work: ['5x-2(3x-2)=1', '-x+4=1\\Rightarrow x=3', 'y=3(3)-2=7'], sol: '(3,\\ 7)', check: '5(3)-2(7)=1' },
  e2b: { label: 'Example 2(b)', e: ['4x+3y=10', '4x-5y=-6'], path: ['q1', 'q2', 'elim'],
    ans: ['<b>No</b>: we want an exact answer.', '<b>Yes</b>: the ' + T('x') + '-coefficients match (' + T('4') + ' and ' + T('4') + ').'],
    why: 'The ' + T('x') + '-coefficients already match: subtract.',
    work: ['(4x+3y)-(4x-5y)=10-(-6)', '8y=16\\Rightarrow y=2', '4x+6=10\\Rightarrow x=1'], sol: '(1,\\ 2)', check: '4(1)-5(2)=-6' },
  e2c: { label: 'Example 2(c)', e: ['y=0.8x+1.2', 'y=-1.5x+6.95'], path: ['q1', 'q2', 'q3', 'sub'],
    ans: ['<b>No</b>: we want an exact answer, and decimals are hard to read off a hand-drawn graph.', '<b>No</b>: neither is in the form ' + T('Ax+By=C') + '.', '<b>Yes</b>: ' + T('y') + ' is already isolated in both.'],
    why: 'Both are already ' + T('y=\\ldots') + ': set the two expressions equal. The TI-30XIIS handles the decimals.',
    work: ['0.8x+1.2=-1.5x+6.95', '2.3x=5.75\\Rightarrow x=2.5', 'y=0.8(2.5)+1.2=3.2'], sol: '(2.5,\\ 3.2)', check: '-1.5(2.5)+6.95=3.2' },
  e3: { label: 'Example 3', e: ['5w+3r=21', '5w+r=17'], path: ['q1', 'q2', 'elim'],
    ans: ['<b>No</b>: we want an exact answer.', '<b>Yes</b>: the ' + T('w') + '-coefficients match (' + T('5') + ' and ' + T('5') + ').'],
    why: 'The ' + T('w') + '-coefficients already match: subtract.',
    work: ['(5w+3r)-(5w+r)=21-17', '2r=4\\Rightarrow r=2', '5w+2=17\\Rightarrow w=3'], sol: 'w=3,\\ r=2', check: '5(3)+3(2)=21' },
  one: { label: 'Coefficient 1', e: ['x-3y=4', '2x+5y=19'], path: ['q1', 'q2', 'q3', 'sub'],
    ans: ['<b>No</b>: we want an exact answer.', '<b>No</b>: ' + T('1') + ' and ' + T('2') + ', ' + T('-3') + ' and ' + T('5') + ' don’t match.', '<b>Yes</b>: ' + T('x') + ' has coefficient ' + T('1') + ' in Eq. 1.'],
    why: T('x') + ' has coefficient ' + T('1') + ': solve Eq. 1 for it, ' + T('x=4+3y') + ', and substitute.',
    work: ['2(4+3y)+5y=19', '8+11y=19\\Rightarrow y=1', 'x=4+3(1)=7'], sol: '(7,\\ 1)', check: '2(7)+5(1)=19' },
  scale: { label: 'Scale both', e: ['2x+3y=12', '5x-2y=11'], path: ['q1', 'q2', 'q3', 'scale', 'elim'],
    ans: ['<b>No</b>: we want an exact answer.', '<b>No</b>: ' + T('2') + ' and ' + T('5') + ', ' + T('3') + ' and ' + T('-2') + ' don’t match.', '<b>No</b>: no coefficient is ' + T('1') + ' or ' + T('-1') + '.', 'Easy multiples: ' + T('3y') + ' and ' + T('-2y') + ' both go to ' + T('6') + '. Eq. 1 ' + T('\\times2') + ', Eq. 2 ' + T('\\times3') + '.'],
    why: 'Scale both so the ' + T('y') + '-terms are ' + T('+6y') + ' and ' + T('-6y') + ', then add.',
    work: ['4x+6y=24,\\ \\ 15x-6y=33', '19x=57\\Rightarrow x=3', '2(3)+3y=12\\Rightarrow y=2'], sol: '(3,\\ 2)', check: '5(3)-2(2)=11' }
};
const NODE_NAME = { gr: 'graphing', sub: 'substitution', elim: 'elimination' };
const choose = {
  title: '★ Which method? A system travels the flowchart',
  height: 510,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SYS).map((k) => ({ v: k, label: SYS[k].label })),
  intro: (v) => `The system ${T(cB(SYS[v].e[0]))}, ${T(cA(SYS[v].e[1]))} answers each question. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const S = SYS[v], FW = 650, PX = FW + 14, PW = ex.W - PX - 8;
    const F = new Flowchart(stage, {
      x: 4, y: 4, width: FW, height: 500,
      nodes: {
        start: { x: 285, y: 30, w: 270, h: 46, html: '<b>Look at the system</b>', cls: 'bk-round' },
        q1: { x: 285, y: 125, w: 284, h: 72, html: '<b>Just a picture or an estimate?</b>exact only for integer solutions', cls: 'bk-diamond' },
        q2: { x: 285, y: 235, w: 284, h: 72, html: `<b>Matching or opposite coefficients?</b>both in ${T('Ax+By=C')} form`, cls: 'bk-diamond' },
        q3: { x: 285, y: 345, w: 284, h: 72, html: `<b>Variable isolated?</b>or a coefficient of ${T('1')} or ${T('-1')}`, cls: 'bk-diamond' },
        scale: { x: 285, y: 455, w: 284, h: 56, html: '<b>Scale one or both</b>easy multiples, every term' },
        gr: { x: 540, y: 125, w: 170, h: 56, html: '<b>Graphing</b>by hand', color: TEAL },
        elim: { x: 540, y: 235, w: 170, h: 56, html: '<b>Elimination</b>add or subtract', color: TEAL },
        sub: { x: 540, y: 345, w: 170, h: 56, html: '<b>Substitution</b>replace and solve', color: TEAL }
      },
      edges: [
        { from: 'start', to: 'q1' }, { from: 'q1', to: 'gr', label: 'yes' }, { from: 'q1', to: 'q2', label: 'no' },
        { from: 'q2', to: 'elim', label: 'yes' }, { from: 'q2', to: 'q3', label: 'no' },
        { from: 'q3', to: 'sub', label: 'yes' }, { from: 'q3', to: 'scale', label: 'no' },
        { from: 'scale', to: 'elim', pts: [[430, 455], [640, 455], [640, 235], [628, 235]] }
      ]
    });
    F.el.classList.add('u8l6-flow');
    const tok = h('div', 'u8l6-token', `${T(cB(S.e[0]))}<br>${T(cA(S.e[1]))}`); F.html.appendChild(tok); tok.style.opacity = 0;
    const METH = ['gr', 'elim', 'sub'];
    const tpos = (id) => { const n = F.node(id).n; return METH.includes(id) ? [n.x, n.y - n.h / 2 - 25] : [n.x - n.w / 2 - 8 - 66, n.y]; };
    let tcur = null;
    const tokTo = async (c, id) => { const [x2, y2] = tpos(id); if (!tcur) { tcur = [x2, y2]; place(tok, x2, y2, 'c'); await pop(c, tok, 300); return; } const [xa, ya] = tcur; await tween(c, 560, (t) => place(tok, xa + (x2 - xa) * t, ya + (y2 - ya) * t, 'c')); tcur = [x2, y2]; };
    const goTo = async (c, a, b) => { await Promise.all([F.go(c, a, b), tokTo(c, b)]); await F.visit(c, b); };
    const Pn = panel(stage, PX, 6, PW, 498, 'The system');
    line(Pn, `${tag(1)}${T(cB(S.e[0]))}`); line(Pn, `${tag(2)}${T(cA(S.e[1]))}`);
    const QTXT = { q1: 'Only a picture or an estimate needed?', q2: 'Do one variable’s coefficients match or are they opposites?', q3: 'Is a variable isolated, or does one have coefficient 1 or −1?' };
    const steps = [{ cap: `Start with the system: ${T(cB(S.e[0]))} and ${T(cA(S.e[1]))}.`, run: async (c) => { await tokTo(c, 'start'); await F.visit(c, 'start'); } }];
    const full = ['start', ...S.path];
    S.path.forEach((id, i) => {
      const from = full[i];
      if (id.startsWith('q')) steps.push({ cap: `<b>${QTXT[id]}</b> ${S.ans[i]}`, run: async (c) => { await goTo(c, from, id); } });
      else if (id === 'scale') steps.push({ cap: `<b>Scale.</b> ${S.ans[i]}`, run: async (c) => { await goTo(c, from, id); } });
      else steps.push({ cap: `<b>Use ${NODE_NAME[id]}.</b> Reason: ${S.why}`,
        run: async (c) => { await goTo(c, from, id); await say(c, Pn, `<b>Method:</b> ${NODE_NAME[id]}<br><span class="u8l6-small">${S.why}</span>`); } });
    });
    steps.push({ cap: `Solve: ${S.work.map((w) => T(w)).join(', ')}. The solution is ${T(cP(S.sol))}.`,
      run: async (c) => { for (const w of S.work) await say(c, Pn, T(w), 'u8l6-small'); await say(c, Pn, `Solution: ${T(cP(S.sol))}`); } });
    steps.push({ cap: `Verify in the other equation too: ${T(S.check)} ✓. Whichever method you choose, check in <b>both</b>.`,
      run: async (c) => { await say(c, Pn, `<span class="u8l6-good">Check: ${T(S.check)} ✓</span>`); const st = stamp(Pn, NODE_NAME[S.path[S.path.length - 1]], { ok: true, size: 'sm' }); st.style.alignSelf = 'center'; await stampIn(c, st); } });
    return steps;
  }
};

/* =============================== explainer: Example 1, two tables =============================== */
const PRI = [[-3, -7], [-1, -3], [1, 1], [3, 5], [5, 9]], DEV = [[-2, 10], [0, 8], [2, 6], [4, 4], [6, 2]];
const tables = {
  title: 'Two tables, one crossing (Example 1)',
  height: 450,
  choices: [{ v: 'ex', label: 'Example 1 check' }, { v: 'gap', label: 'Where do the tables swap?' }],
  intro: (v) => (v === 'ex' ? 'From each table: slope, intercept, equation. Then the crossing. Press <b>Next</b>.' : 'No shared pair, but the lines still cross. Where? Press <b>Next</b>.'),
  make(stage, v, ex) {
    const tw = 54, th = 36;
    add(stage, h('div', 'u8l6-tcap b', 'Priya'), 50, 6); add(stage, h('div', 'u8l6-tcap a', 'Devon'), 232, 6);
    const TP = new ValueTable(stage, { x: 10, y: 34, rows: PRI, cellW: tw, cellH: th, tap: false, diffs: v === 'ex', diffSpace: 66 });
    const TD = new ValueTable(stage, { x: 200, y: 34, rows: DEV, cellW: tw, cellH: th, tap: false, diffs: v === 'ex', diffSpace: 66 });
    const G = new Graph(stage, { x: 384, y: 8, width: ex.W - 392, height: 430, xmin: -4, xmax: 7, ymin: -8, ymax: 11, fontSize: 15, xlabels: 1, ylabels: 2 });
    const Pn = panel(stage, 10, 300, 364, 140);
    const plotAll = async (c, T1, pts, color, ms = 160) => { for (let i = 0; i < pts.length; i++) { T1.highlight(i, true); await G.reveal(G.point(...pts[i], { color, r: 6.5 }), c, ms); T1.highlight(i, false); } };
    if (v === 'gap') {
      const gapSeg = async (c, x, yP, yD) => { const s = G.segment([x, yP], [x, yD], { color: RED, width: 3, dash: '5 4' }); await G.drawIn(s, 400, c); await fadeIn(c, G.label(x, (yP + yD) / 2, `${yD > yP ? 'Devon' : 'Priya'} +3`, { cls: 'u8l6-ptlab', pos: 'e', color: RED })); };
      return [
        { cap: `Plot both tables. Priya recorded odd ${T('x')}-values, Devon even ones, so no ordered pair is in both tables.`,
          run: async (c) => { await plotAll(c, TP, PRI, BLUE, 120); await plotAll(c, TD, DEV, AMB, 120); } },
        { cap: `At ${T('x=2')}: Devon is at ${T('6')}. Priya’s line is halfway between her ${T('(1,1)')} and ${T('(3,5)')}: ${T('y=3')}. Devon is <b>3 higher</b>.`,
          run: async (c) => { await G.reveal(G.point(2, 3, { color: BLUE, r: 5, open: true }), c); await gapSeg(c, 2, 3, 6); await say(c, Pn, `${T('x=2')}: Priya ${T(cB('3'))}, Devon ${T(cA('6'))}`); } },
        { cap: `At ${T('x=4')}: Priya is halfway between ${T('5')} and ${T('9')}: ${T('y=7')}. Devon is at ${T('4')}. Now Priya is <b>3 higher</b>: the lines swapped places.`,
          run: async (c) => { await G.reveal(G.point(4, 7, { color: BLUE, r: 5, open: true }), c); await gapSeg(c, 4, 7, 4); await say(c, Pn, `${T('x=4')}: Priya ${T(cB('7'))}, Devon ${T(cA('4'))}`); } },
        { cap: `So they crossed in between. The gap went from 3 one way to 3 the other, so they meet halfway: ${T('x=3')}, where both give ${T('y=5')}.`,
          run: async (c) => { await Promise.all([G.drawIn(G.line({ m: 2, b: -1 }, { color: BLUE, width: 3 }), 600, c), G.drawIn(G.line({ m: -1, b: 8 }, { color: AMB, width: 3 }), 600, c)]); await G.reveal(G.point(3, 5, { color: PUR, r: 8, label: T(cP('(3,\\ 5)')), pos: 'nw', gap: 8 }), c); await say(c, Pn, `${T('x=3')}: both ${T(cP('5'))} → ${T(cP('(3,\\ 5)'))}`); } },
        { cap: `Two tables can share no pair and still describe lines that cross. The crossing just falls <b>between</b> Devon’s rows. Algebra finds it exactly.`,
          run: async (c) => { await say(c, Pn, `<b>Between the rows</b>: solve to be sure.`, 'u8l6-small'); } }
      ];
    }
    let P1, D1;
    return [
      { cap: `Plot Priya’s five points in blue and Devon’s five in amber. Each set lies on a straight line.`,
        run: async (c) => { await plotAll(c, TP, PRI, BLUE); await plotAll(c, TD, DEV, AMB); } },
      { cap: `Slopes from the tables. Each row ${T('x')} goes up ${T('2')}. Priya’s ${T('y')} goes up ${T('4')}: ${T('m=\\frac{4}{2}=2')}. Devon’s goes down ${T('2')}: ${T('m=\\frac{-2}{2}=-1')}.`,
        run: async (c) => { await TP.diffs(c, { col: 1, color: BLUE }); await TD.diffs(c, { col: 1, color: AMB }); await say(c, Pn, `Priya ${T(cB('m=2'))} &nbsp; Devon ${T(cA('m=-1'))}`); } },
      { cap: `Intercepts. Priya, using ${T('(-3,-7)')}: ${T('-7=2(-3)+b')}, so ${T('b=-1')}. Devon’s table has ${T('(0,8)')}: ${T('b=8')}. So ${T(cB('y=2x-1'))} and ${T(cA('y=-x+8'))}.`,
        run: async (c) => {
          TD.highlight(1, true);
          P1 = G.line({ m: 2, b: -1 }, { color: BLUE, width: 3.5 }); D1 = G.line({ m: -1, b: 8 }, { color: AMB, width: 3.5 });
          await Promise.all([G.drawIn(P1, 700, c), G.drawIn(D1, 700, c)]);
          await say(c, Pn, `${T(cB('y=2x-1'))} &nbsp; ${T(cA('y=-x+8'))}`);
          TD.highlight(1, false);
        } },
      { cap: `Both are ${T('y=\\ldots')}, so set them equal: ${T(`${cB('2x-1')}=${cA('-x+8')}`)}, ${T('3x=9')}, ${T('x=3')}; then ${T('y=2(3)-1=5')}. The lines cross at ${T(cP('(3,\\ 5)'))}.`,
        run: async (c) => { await G.reveal(G.point(3, 5, { color: PUR, r: 8, label: T(cP('(3,\\ 5)')), pos: 'nw', gap: 8 }), c); await say(c, Pn, `${T('3x=9\\Rightarrow x=3,\\ y=5')}`, 'u8l6-small'); } },
      { cap: `${T('(3,\\ 5)')} is in Priya’s table but not Devon’s: he only recorded even ${T('x')}-values. Add ${T('x=3')} to his table: ${T('y=-3+8=5')} ✓`,
        run: async (c) => { TP.highlight(3, true); await TD.addRow([3, 5], c); TD.highlight(5, true); await sleep(c, 300); } },
      { cap: `At the crossing point, ${T('x+y=3+5=8')}.`,
        run: async (c) => { await say(c, Pn, `${T('x+y=3+5=' + cP('8'))}`); } }
    ];
  }
};

/* =============================== explainer: decimals? set the expressions equal =============================== */
const SQ = {
  e2c: { label: 'Example 2(c) check', f1: (x) => 0.8 * x + 1.2, f2: (x) => -1.5 * x + 6.95, t1: '0.8x+1.2', t2: '-1.5x+6.95', xs: 2.5, ys: 3.2,
    win: { xmin: -0.5, xmax: 5.5, ymin: -0.5, ymax: 7.5, xstep: 0.5, ystep: 0.5, xlabels: 1, ylabels: 1 }, labs: [[3.6, 'se'], [0.4, 'ne']],
    alg: ['2.3x=5.75', 'x=2.5'], back: 'y=0.8(2.5)+1.2=3.2', chk: cA('-1.5(2.5)+6.95=3.2'), sol: '(2.5,\\ 3.2)', near: 'near ' + T('(2.5,\\ 3)') },
  e4c: { label: 'Example 4(c) check', f1: (x) => 25 + 0.5 * x, f2: (x) => 18 + 0.9 * x, t1: '25+0.5x', t2: '18+0.9x', xs: 17.5, ys: 33.75,
    win: { xmin: 0, xmax: 30, ymin: 0, ymax: 50, xstep: 2.5, ystep: 5, xlabels: 5, ylabels: 10, origin: true }, labs: [[22, 'se'], [9, 'se']],
    alg: ['7=0.4x', 'x=17.5'], back: 'y=25+0.5(17.5)=33.75', chk: cA('18+0.9(17.5)=33.75'), sol: '(17.5,\\ 33.75)', near: 'somewhere near ' + T('(17,\\ 34)') }
};
const setEq = {
  title: 'Decimals? Set the two expressions equal',
  height: 450,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SQ).map((k) => ({ v: k, label: SQ[k].label })),
  intro: (v) => `${T(cB('y=' + SQ[v].t1))} and ${T(cA('y=' + SQ[v].t2))}: both already ${T('y=\\ldots')}, with decimal coefficients. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const D = SQ[v], st = { x: D.win.xmin < 0 ? 0 : D.win.xmin };
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 470, height: 420, fontSize: 15 }, D.win));
    const L1 = G.fn(D.f1, { color: BLUE, width: 4 }), L2 = G.fn(D.f2, { color: AMB, width: 4 });
    const lab1 = G.label(D.labs[0][0], D.f1(D.labs[0][0]), T(cB('y=' + D.t1)), { pos: D.labs[0][1], cls: 'bk-ptlab' });
    const lab2 = G.label(D.labs[1][0], D.f2(D.labs[1][0]), T(cA('y=' + D.t2)), { pos: D.labs[1][1], cls: 'bk-ptlab' });
    [L1, L2, lab1, lab2].forEach(hide);
    const sw = G.vline(st.x, { color: GRAY, width: 2.5 });
    const D1 = G.point(st.x, D.f1(st.x), { color: BLUE, r: 7 }), D2 = G.point(st.x, D.f2(st.x), { color: AMB, r: 7 });
    [sw, D1, D2].forEach(hide);
    const Pn = panel(stage, 508, 14, ex.W - 522, 420, 'At the crossing, same y');
    const xr = line(Pn, '', 'u8l6-sqx'), y1 = line(Pn, '', 'u8l6-sqy'), y2 = line(Pn, '', 'u8l6-sqy');
    y1.innerHTML = `${T(cB('y=' + D.t1))} = <b class="u8l6-sqn"></b>`; y2.innerHTML = `${T(cA('y=' + D.t2))} = <b class="u8l6-sqn"></b>`;
    const n1 = y1.querySelector('b'), n2 = y2.querySelector('b');
    [xr, y1, y2].forEach(hide);
    const fx = (x) => String(Math.round(x * 100) / 100), set = (x) => {
      st.x = x; sw.set(x); G.moveTo(D1, x, D.f1(x)); G.moveTo(D2, x, D.f2(x));
      xr.innerHTML = `<i>x</i> = <b>${fx(x)}</b>`; n1.textContent = fx(D.f1(x)); n2.textContent = fx(D.f2(x));
    };
    set(st.x);
    let ring, S;
    return [
      { cap: `Graphed by hand, the lines cross <b>between</b> grid lines, ${D.near}: only an estimate.`,
        run: async (c) => {
          for (const [Ln, lb] of [[L1, lab1], [L2, lab2]]) { Ln.style.opacity = 1; await G.drawIn(Ln, 600, c); await fadeIn(c, lb, 200); }
          const [px, py] = G.toPx(D.xs, D.ys); ring = svgEl('circle', { cx: px, cy: py, r: 30, fill: 'none', stroke: PUR, 'stroke-width': 3, 'stroke-dasharray': '7 6' }, G.layers.top); await pop(c, ring, 400);
        } },
      { cap: `Slide ${T('x')} along: the two ${T('y')}-values get closer, and they are <b>equal</b> exactly where the lines cross.`,
        run: async (c) => {
          for (const e of [sw, D1, D2, xr, y1, y2]) await fadeIn(c, e, 200);
          const a = st.x; await tween(c, 2200, (t) => set(a + (D.xs - a) * t)); set(D.xs);
          ring.remove(); S = G.point(D.xs, D.ys, { color: PUR, r: 8 }); await G.reveal(S, c);
        } },
      { cap: `So set the two expressions equal: ${T(cB(D.t1) + '=' + cA(D.t2))}.`, run: (c) => say(c, Pn, T(cB(D.t1) + '=' + cA(D.t2))) },
      { cap: `Solve (the TI-30XIIS handles the decimals): ${T(D.alg.join('\\ \\Rightarrow\\ '))}.`, run: async (c) => { for (const a of D.alg) await say(c, Pn, T(a), 'u8l6-small'); } },
      { cap: `Back-substitute: ${T(D.back)}. Check in the other equation: ${T(D.chk)} ✓. The solution is ${T(cP(D.sol))}.`,
        run: async (c) => {
          await say(c, Pn, T(D.back), 'u8l6-small'); await say(c, Pn, `<span class="u8l6-good">${T(D.chk)} ✓</span>`, 'u8l6-small');
          await fadeIn(c, G.label(D.xs, D.ys, T(cP(D.sol)), { pos: 'ne', cls: 'bk-ptlab' }), 300);
        } }
    ];
  }
};

/* =============================== explainer: Example 3, the trip =============================== */
const trip = {
  title: 'A trip out and a trip back (Example 3)',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'set', label: 'Set up the equations' }, { v: 'solve', label: 'Solve and race the clock' }],
  intro: (v) => (v === 'set' ? 'Draw both trips, organize distance, speed and time, write two equations. Press <b>Next</b>.' : 'Solve the system, then run both trips with a clock to check. Press <b>Next</b>.'),
  make(stage, v, ex) {
    const X0 = 150, KM = 112, Y1 = 58, Y2 = 160, w = 3, r = 2, X = (km) => X0 + km * KM;
    // tracks
    const track = (y, title) => {
      add(stage, h('div', 'u8l6-tlab', title), 10, y - 4);
      const t = add(stage, box(h('div', 'u8l6-track'), 5 * KM, null), X0, y); t.style.background = '#e9e5da';
      const hl = add(stage, h('div', 'u8l6-place', 'House'), X(0), y + 22), sl = add(stage, h('div', 'u8l6-place', 'School'), X(5), y + 22);
      return [t, hl, sl];
    };
    const leg = (y, a, b, kind, lab) => { const d = add(stage, box(h('div', 'u8l6-leg ' + kind), (b - a) * KM, null), X(a), y); const l = add(stage, h('div', 'u8l6-leglab ' + kind, lab), X((a + b) / 2), y - 30); return [d, l]; };
    const g1 = track(Y1, 'Going'), g2 = track(Y2, 'Coming<br>home');
    const goLegs = [...leg(Y1, 0, w, 'walk', `walk ${T('w')} at 6 km/h`), ...leg(Y1, w, w + r, 'run', `run ${T('r')} at 10 km/h`)];
    const hmLegs = [...leg(Y2, w - r, 5, 'run', `run ${T('2r')} at 10 km/h`), ...leg(Y2, 0, w - r, 'walk', `walk ${T('w-r')}`)];
    const clk1 = add(stage, h('div', 'u8l6-clock', '42 min'), X(5) + 30, Y1 - 6), clk2 = add(stage, h('div', 'u8l6-clock', '34 min'), X(5) + 30, Y2 - 6);
    // organizer
    const org = add(stage, box(h('div', 'u8l6-org'), 500, null), 10, 222);
    const cells = [['Leg', 'Distance', 'Speed', 'Time (h)', 'h'],
      ['Going: walk', T('w'), '6', T('\\dfrac{w}{6}'), 'r1'], ['Going: run', T('r'), '10', T('\\dfrac{r}{10}'), 'r1'],
      ['Home: run', T('2r'), '10', T('\\dfrac{2r}{10}'), 'r2'], ['Home: walk', T('w-r'), '6', T('\\dfrac{w-r}{6}'), 'r2']];
    const rows = cells.map((rw) => rw.slice(0, 4).map((t) => { const d = h('div', rw[4], t); org.appendChild(d); return d; }));
    const Pn = panel(stage, 520, 222, ex.W - 528, 238, 'Equations');
    if (v === 'set') {
      [...g1, ...g2, ...goLegs, ...hmLegs, clk1, clk2, ...rows.slice(1).flat()].forEach(hide);
      const showAll = (els, c, ms = 260) => Promise.all(els.map((e) => fadeIn(c, e, ms)));
      return [
        { cap: `<b>Step 1.</b> Let ${T('w')} = km walked and ${T('r')} = km run on the way <b>to</b> school. Then house to school is ${T('w+r')} km.`,
          run: async (c) => { await showAll(g1, c); await showAll(goLegs, c, 400); } },
        { cap: `Going: time = distance ÷ speed. Walking takes ${T('\\frac{w}{6}')} h and running ${T('\\frac{r}{10}')} h. Together: 42 min ${T('=\\frac{42}{60}=0.7')} h, <b>hours</b> to match km/h.`,
          run: async (c) => { await fadeIn(c, clk1); await showAll(rows[1].concat(rows[2]), c); await say(c, Pn, T(cB('\\dfrac{w}{6}+\\dfrac{r}{10}=\\dfrac{42}{60}'))); } },
        { cap: `Multiply every term by ${T('30')} (it clears the 6, the 10 and the 60): ${T('5w+3r=21')}. That is Eq. 1.`,
          run: async (c) => { await say(c, Pn, `${tag(1)}${T(cB('5w+3r=21'))}`); } },
        { cap: `Coming home he runs <b>twice</b> as far: ${T('2r')}. The trip is still ${T('w+r')} km, so he walks the remainder: ${T('(w+r)-2r=w-r')}.`,
          run: async (c) => { await showAll(g2, c); await showAll(hmLegs, c, 400); } },
        { cap: `Home times: running ${T('\\frac{2r}{10}')} h, walking ${T('\\frac{w-r}{6}')} h, total ${T('\\frac{34}{60}')} h.`,
          run: async (c) => { await fadeIn(c, clk2); await showAll(rows[3].concat(rows[4]), c); await say(c, Pn, T(cA('\\dfrac{w-r}{6}+\\dfrac{2r}{10}=\\dfrac{34}{60}'))); } },
        { cap: `Multiply by ${T('30')}: ${T('5(w-r)+6r=17')}, so ${T('5w+r=17')}. That is Eq. 2. Two equations, two unknowns.`,
          run: async (c) => { await say(c, Pn, `${T('5w-5r+6r=17')}`, 'u8l6-small'); await say(c, Pn, `${tag(2)}${T(cA('5w+r=17'))}`); } }
      ];
    }
    // solve
    line(Pn, `${tag(1)}${T(cB('5w+3r=21'))}`); line(Pn, `${tag(2)}${T(cA('5w+r=17'))}`);
    clk1.textContent = '0 min'; clk2.textContent = '0 min';
    const dot = add(stage, h('div', 'u8l6-dot'), X(0), Y1 + 9); hide(dot);
    const race = async (c, y, segs, clk) => {
      // segs: [[fromKm, toKm, speed]]
      dot.style.top = y + 9 + 'px'; let t0 = 0; dot.style.opacity = 1;
      for (const [a, b, sp] of segs) {
        const mins = Math.abs(b - a) / sp * 60, start = t0;
        await tween(c, mins * 55, (t) => { dot.style.left = X(a + (b - a) * t) + 'px'; clk.textContent = Math.round(start + mins * t) + ' min'; }, (t) => t);
        t0 += mins; clk.textContent = Math.round(t0) + ' min';
      }
    };
    return [
      { cap: `The ${T('w')}-coefficients <b>match</b> (${T('5')} and ${T('5')}): subtract. ${T('(5w+3r)-(5w+r)=21-17')}, so ${T('2r=4')} and ${T('r=2')}.`,
        run: async (c) => { await say(c, Pn, T('(5w+3r)-(5w+r)=21-17')); await say(c, Pn, T('2r=4\\Rightarrow ' + cP('r=2'))); } },
        { cap: `Back-substitute into Eq. 2: ${T('5w+2=17')}, so ${T('5w=15')} and ${T('w=3')}. He walks 3 km and runs 2 km going to school.`,
        run: async (c) => { await say(c, Pn, T('5w+2=17\\Rightarrow ' + cP('w=3'))); } },
      { cap: `Check against the words. Going: walk 3 km at 6 km/h is ${T('30')} min, run 2 km at 10 km/h is ${T('12')} min. Total ${T('42')} min ✓`,
        run: async (c) => { await race(c, Y1, [[0, 3, 6], [3, 5, 10]], clk1); clk1.style.borderColor = GRN; clk1.style.color = GRN; } },
      { cap: `Coming home: run ${T('2r=4')} km is ${T('24')} min, walk ${T('w-r=1')} km is ${T('10')} min. Total ${T('34')} min ✓`,
        run: async (c) => { await race(c, Y2, [[5, 1, 10], [1, 0, 6]], clk2); clk2.style.borderColor = GRN; clk2.style.color = GRN; } },
      { cap: `House to school is ${T('w+r=3+2=5')} km. <b>Answer: B.</b>`,
        run: async (c) => { await say(c, Pn, `${T('w+r=3+2=' + cP('5'))} km`); const s = stamp(stage, 'B: 5 km', { ok: true, x: ex.W - 70, y: 118, size: 'sm' }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: ★ Example 4, three plans =============================== */
const PLAN = [
  { n: 'Plan 1', f: (x) => 25 + 0.5 * x, tx: 'y=25+0.5x', color: BLUE, cls: 'u8l6-b' },
  { n: 'Plan 2', f: (x) => 18 + 0.9 * x, tx: 'y=18+0.9x', color: AMB, cls: 'u8l6-a' },
  { n: 'Plan 3', f: () => 70, tx: 'y=70', color: GRN, cls: 'u8l6-g' }
];
const BEST = [[0, 17.5, 1], [17.5, 90, 0], [90, 100, 2]]; // [from, to, plan index]
const bestAt = (x) => (x < 17.5 ? 1 : x <= 90 ? 0 : 2);
const plans = {
  title: '★ Three plans on one graph: the lowest line wins',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'lines', label: 'Example 4 (b)–(d) check' }, { v: 'sweep', label: 'Example 4 (e)–(f): sweep' }],
  intro: (v) => (v === 'lines' ? 'Three equations, three lines, and where they cross. Press <b>Next</b>.' : 'Slide across the graph: which line is lowest? Press <b>Next</b>.'),
  make(stage, v, ex) {
    const GW = Math.min(600, ex.W - 330); // the panel keeps ~300 px beside the sidebar
    const G = new Graph(stage, { x: 6, y: 8, width: GW, height: 450, xmin: 0, xmax: 100, ymin: 0, ymax: 80, xstep: 10, ystep: 10, fontSize: 15, xtitle: 'x\\text{ (GB)}', ytitle: 'y\\text{ (\\$)}' });
    const Pn = panel(stage, GW + 20, 8, ex.W - GW - 28, 450, v === 'lines' ? 'Equations' : 'Cost at this many GB');
    const Ls = PLAN.map((p) => G.fn(p.f, { color: p.color, width: 3.5, arrows: false }));
    const labs = [lineLab(G, 96, 73, T(cB('\\text{Plan 1}')), BLUE, 'n'), lineLab(G, 58, 70, T(cA('\\text{Plan 2}')), AMB, 'w'), lineLab(G, 30, 70, T(cG('\\text{Plan 3}')), GRN, 'n')];
    labs[1].gx = 36; labs[1].gy = 58; labs[1]._bkDraw();
    const X1 = { x: 17.5, y: 33.75 }, X2 = { x: 90, y: 70 };
    const crossPt = (P, pos) => G.point(P.x, P.y, { color: PUR, r: 8, label: T(cP(pairTex(P.x, P.y))), pos, gap: 8 });
    if (v === 'lines') {
      [...Ls, ...labs].forEach(hide);
      const showLine = async (c, i) => { Ls[i].style.opacity = 1; await G.drawIn(Ls[i], 800, c); await fadeIn(c, labs[i]); };
      return [
        { cap: `<b>Plan 1:</b> the $25 fee is the ${T('y')}-intercept and $0.50 per GB is the slope: ${T(cB('y=25+0.5x'))}.`,
          run: async (c) => { await showLine(c, 0); await say(c, Pn, `${tag(1, 'Plan 1')}${T(cB('y=25+0.5x'))}`); } },
        { cap: `<b>Plan 2:</b> ${T(cA('y=18+0.9x'))}. A lower start, but a steeper climb.`,
          run: async (c) => { await showLine(c, 1); await say(c, Pn, `${tag(2, 'Plan 2')}${T(cA('y=18+0.9x'))}`); } },
        { cap: `<b>Plan 3:</b> $70 whatever you use: ${T(cG('y=70'))}, a horizontal line.`,
          run: async (c) => { await showLine(c, 2); await say(c, Pn, `${tag(3, 'Plan 3')}${T(cG('y=70'))}`); } },
        { cap: `<b>(c)</b> Plans 1 and 2 cost the same where their lines cross: ${T('25+0.5x=18+0.9x')}, so ${T('7=0.4x')}, ${T('x=17.5')} GB, and ${T('y=25+0.5(17.5)=33.75')}.`,
          run: async (c) => { await G.reveal(crossPt(X1, 'se'), c); await say(c, Pn, `${T('7=0.4x\\Rightarrow x=17.5')}<br>${T('y=' + money(33.75))}`, 'u8l6-small'); } },
        { cap: `<b>(d)</b> $70 buys ${T('90')} GB on Plan 1 (${T('70=25+0.5x')}) and about ${T('57.8')} GB on Plan 2 (${T('70=18+0.9x')}): where each line meets the $70 line.`,
          run: async (c) => {
            await G.reveal(crossPt(X2, 'nw'), c);
            const q = G.point(52 / 0.9, 70, { color: AMB, r: 7, open: true, label: T(cA('57.8')), pos: 'n', gap: 8 }); await G.reveal(q, c);
            await say(c, Pn, `Plan 1: ${T('0.5x=45\\Rightarrow x=90')}<br>Plan 2: ${T('0.9x=52\\Rightarrow x\\approx57.8')}`, 'u8l6-small');
          } },
        { cap: `At 57.8 GB Plan 1 is already cheaper than both, so that crossing does not change the best plan. The two crossovers that matter: ${T(cP('(17.5,\\ 33.75)'))} and ${T(cP('(90,\\ 70)'))}.`,
          run: async (c) => { const q = [...G.layers.top.querySelectorAll('.bk-pt.bk-open')].pop(); if (q) { q.style.opacity = 0.35; if (q.label) q.label.style.opacity = 0.35; } await say(c, Pn, `<b>Crossovers:</b> ${T(cP('(17.5,\\ 33.75)'))}, ${T(cP('(90,\\ 70)'))}`, 'u8l6-small'); } }
      ];
    }
    // sweep
    crossPt(X1, 'se'); crossPt(X2, 'nw');
    const env = BEST.map(([a, b, i]) => { const p = svgEl('path', { fill: 'none', stroke: PLAN[i].color, 'stroke-width': 13, 'stroke-opacity': 0.28, 'stroke-linecap': 'round' }, G.layers.data); return { a, b, i, p }; });
    const band = BEST.map(([a, b, i]) => { const r = svgEl('rect', { fill: PLAN[i].color, 'fill-opacity': 0.75 }, G.layers.data); return { a, b, i, r }; });
    const sw = G.vline(0, { color: INK, width: 2.5 }); hide(sw);
    const rowsEl = PLAN.map((p) => { const d = h('div', 'u8l6-cost', `<span class="n ${p.cls}">${p.n}</span><span><span class="bar" style="background:${p.color};display:block;width:0"></span></span><span class="v ${p.cls}"></span>`); Pn.appendChild(d); return d; });
    const head = line(Pn, '', 'u8l6-big'); const best = line(Pn, '', 'u8l6-best');
    let cur = 0;
    const paint = (x) => {
      cur = x; sw.set(x); sw.style.opacity = 1;
      env.forEach((e) => { const b = Math.min(e.b, x); if (b <= e.a) { e.p.setAttribute('d', ''); return; } const f = PLAN[e.i].f, [p0, p1] = [G.toPx(e.a, f(e.a)), G.toPx(b, f(b))]; e.p.setAttribute('d', `M${p0[0]} ${p0[1]}L${p1[0]} ${p1[1]}`); });
      band.forEach((e) => { const b = Math.min(e.b, x); const [px0, py0] = G.toPx(e.a, 2.6), [px1, py1] = G.toPx(Math.max(e.a, b), 0); e.r.setAttribute('x', px0); e.r.setAttribute('y', py0); e.r.setAttribute('width', Math.max(0, px1 - px0)); e.r.setAttribute('height', py1 - py0); });
      const costs = PLAN.map((p) => p.f(x)), k = bestAt(x);
      rowsEl.forEach((d, i) => { d.querySelector('.bar').style.width = Math.min(100, costs[i] / 110 * 100) + '%'; d.querySelector('.v').textContent = '$' + costs[i].toFixed(2); d.classList.toggle('best', i === k); });
      head.innerHTML = `${T('x=' + texNum(x, 1))} GB`;
      best.innerHTML = `Cheapest: <span class="${PLAN[k].cls}">${PLAN[k].n}</span>` + (Math.abs(x - 17.5) < 1e-6 ? ' (ties Plan 2)' : Math.abs(x - 90) < 1e-6 ? ' (ties Plan 3)' : '');
    };
    paint(0); sw.style.opacity = 0;
    const go = (to, ms) => async (c) => { const a = cur; await tween(c, ms, (t) => paint(a + (to - a) * t)); paint(to); };
    const cost = (i, x) => money(PLAN[i].f(x));
    return [
      { cap: `The cheapest plan is the <b>lowest line</b>. Slide a vertical line across. At ${T('10')} GB: Plan 2 ${T(cost(1, 10))}, Plan 1 ${T(cost(0, 10))}, Plan 3 ${T(cost(2, 10))}. <b>Plan 2</b> is lowest.`, run: go(10, 1400) },
      { cap: `At ${T('17.5')} GB, Plans 1 and 2 tie at ${T(cost(0, 17.5))}: the first crossover. Past it, Plan 1’s cheaper rate per GB wins.`, run: go(17.5, 900) },
      { cap: `At ${T('50')} GB: Plan 1 ${T(cost(0, 50))}, Plan 2 ${T(cost(1, 50))}, Plan 3 ${T(cost(2, 50))}. <b>Plan 1</b> is lowest.`, run: go(50, 1400) },
      { cap: `At ${T('90')} GB, Plan 1 reaches ${T('\\$70')} and ties Plan 3: the second crossover.`, run: go(90, 1400) },
      { cap: `Beyond 90 GB the flat ${T('\\$70')} of Plan 3 is lowest. At ${T('100')} GB: Plan 1 ${T(cost(0, 100))}, Plan 2 ${T(cost(1, 100))}, Plan 3 ${T(cost(2, 100))}.`, run: go(100, 900) },
      { cap: `<b>Rule:</b> <span class="u8l6-a">Plan 2</span> for 0–17.5 GB, <span class="u8l6-b">Plan 1</span> for 17.5–90 GB, <span class="u8l6-g">Plan 3</span> for more than 90 GB. The best plan changes at the crossings.`,
        run: async (c) => {
          sw.style.opacity = 0;
          for (const [a, b, i] of BEST) { const l = G.label(i === 2 ? 93 : (a + b) / 2, i === 2 ? 12 : 2.6, PLAN[i].n, { cls: 'u8l6-ptlab', pos: i === 2 ? 'c' : 'n', color: PLAN[i].color, gap: 4 }); await fadeIn(c, l, 250); }
        } }
    ];
  }
};

/* =============================== static figures =============================== */
function mountStatic() {
  const mob = document.getElementById('u8l6-mobiles');
  if (mob) {
    const svg = svgEl('svg', { width: 960, height: 300, viewBox: '0 0 960 300' }, mob);
    drawMobile(svg, 'A', 146, 380, 40);
    svgEl('line', { x1: 378, y1: 40, x2: 378, y2: 280, stroke: '#cfd3db', 'stroke-width': 2, 'stroke-dasharray': '7 6' }, svg);
    drawMobile(svg, 'B', 730, 380, 40);
  }
  // how-many minis
  const MINI = {
    one: (G) => { G.line({ m: 0.7, b: 0 }, { color: BLUE, width: 3, arrows: false }); G.line({ m: -0.7, b: 0 }, { color: AMB, width: 3, arrows: false }); G.point(0, 0, { color: PUR, r: 5 }); },
    none: (G) => { G.line({ m: 0.7, b: -0.7 }, { color: BLUE, width: 3, arrows: false }); G.line({ m: 0.7, b: 0.8 }, { color: AMB, width: 3, arrows: false }); },
    inf: (G) => { G.line({ m: 0.7, b: 0 }, { color: BLUE, width: 4, arrows: false }); G.line({ m: 0.7, b: 0 }, { color: AMB, width: 3, dash: '9 7', arrows: false }); }
  };
  document.querySelectorAll('[data-u8l6-mini]').forEach((el) => { const G = new Graph(el, { width: 150, height: 96, xmin: -3, xmax: 3, ymin: -2, ymax: 2, numbers: false, xtitle: '', ytitle: '', arrows: false, pad: 4 }); MINI[el.dataset.u8l6Mini](G); });
  // Example 4(f): blank grid, and the answer graph
  const plansGraph = (host, w, hh, full) => {
    const G = new Graph(host, { width: w, height: hh, xmin: 0, xmax: 100, ymin: 0, ymax: 80, xstep: 10, ystep: 10, fontSize: 15, xtitle: 'x\\text{ (GB)}', ytitle: 'y\\text{ (\\$)}' });
    if (!full) return G;
    PLAN.forEach((p) => G.fn(p.f, { color: p.color, width: 3, arrows: false }));
    lineLab(G, 96, 73, T(cB('\\text{Plan 1}')), BLUE, 'n'); lineLab(G, 36, 58, T(cA('\\text{Plan 2}')), AMB, 'w'); lineLab(G, 30, 70, T(cG('\\text{Plan 3}')), GRN, 'n');
    G.point(17.5, 33.75, { color: PUR, r: 7, label: T(cP('(17.5,\\ 33.75)')), pos: 'se' }); G.point(90, 70, { color: PUR, r: 7, label: T(cP('(90,\\ 70)')), pos: 'sw' });
    return G;
  };
  const e4 = document.getElementById('u8l6-ex4grid'); if (e4) plansGraph(e4, 540, 430, false);
  const e4a = document.getElementById('u8l6-ex4ans'); if (e4a) plansGraph(e4a, 480, 380, true);
  // review question 15
  const q15 = (host, size, full) => {
    const G = new Graph(host, { width: size, height: size, xmin: -8, xmax: 8, ymin: -8, ymax: 8, xlabels: 2, ylabels: 2, fontSize: 15 });
    if (full) {
      G.line({ m: -1, b: 6 }, { color: BLUE, width: 3 }); G.line({ m: 2, b: -3 }, { color: AMB, width: 3 });
      lineLab(G, -1.5, 7.5, T(cB('x+y=6')), BLUE, 'w'); lineLab(G, 5.4, 7.2, T(cA('2x-y=3')), AMB, 'e');
      G.point(3, 3, { color: PUR, r: 7, label: T(cP('(3,\\ 3)')), pos: 'w', gap: 10 });
    }
    return G;
  };
  const g15 = document.getElementById('u8l6-q15grid'); if (g15) q15(g15, 410, false);
  const a15 = document.getElementById('u8l6-q15ans'); if (a15) q15(a15, 340, true);
}

/* =============================== mount =============================== */
mountStatic();
export const explainers = mountExplainers({ mobile, howMany, methods, choose, tables, setEq, trip, plans });
export const _test = { SYS, SQ, PLAN };
