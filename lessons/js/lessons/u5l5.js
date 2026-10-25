/* Math 10C · Unit 5 · Lesson 5 — What Is a Function? (RF2). The explainers, figures and the warm-up class.
 *   birthday    — person → birthday is a function; flip the arrows and Jul 14 has two outputs (arrows + graph)
 *   twoRel      — build relation (i) "is a multiple of" and (ii) "is the cube of" by asking the question for each input
 *   nested      — sort relations into the Relations / Functions ovals
 *   threeViews  — Example 1 check: the same verdict from the arrow diagram, the ordered pairs and the graph
 *   whyVertical — a vertical line is one input; a horizontal line is one output (allowed to repeat)
 *   vlt         — Example 2 check: vertical sweep (rows 1 and 3) and horizontal sweep (row 2) on graphs A–D
 *   sixWays     — one relation in six forms (words, table, pairs, arrows, graph, equation): y = x² vs x = y²
 *   sixForms    — Example 3 check: the right test for each of the six parts
 * plus the static figures (data-fig) and the warm-up birthday simulation. */
import {
  h, tex, add, box, Graph, MappingDiagram, ValueTable, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pulse, anim, linear, pairTex, texNum, svgEl, COLORS
} from '../blocks.js';
import { standup } from '../standup.js';

const T = (s) => tex(String(s));
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u5l5-panel ' + cls, title ? `<div class="u5l5-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u5l5-line ' + cls, html); p.appendChild(d); return d; };
const hidden = (...els) => els.forEach((e) => (e.style.opacity = 0));
const fadeOut = (c, el, ms = 350) => anim(c, el, [{ opacity: 1 }, { opacity: 0 }], ms);
const chip = (html, cls = '') => h('span', 'u5l5-pr ' + cls, html);

/* a graph with named (categorical) positions 1, 2, 3 … on each axis, like the booklet's "domain / range" plots */
function catGraph(host, o) {
  const G = new Graph(host, { x: o.x, y: o.y, width: o.width, height: o.height, xmin: 0, xmax: o.xs.length + 0.7, ymin: 0, ymax: o.ys.length + 0.7,
    numbers: false, ticks: true, grid: o.grid ?? true, xtitle: o.xtitle || '', ytitle: o.ytitle || '', pad: o.pad || [24, 22, 40, 74], fontSize: o.fontSize || 17 });
  o.xs.forEach((t, i) => G.label(i + 1, 0, t, { pos: 's', cls: 'u5l5-axl', clip: false, gap: 7 }));
  o.ys.forEach((t, i) => G.label(0, i + 1, t, { pos: 'w', cls: 'u5l5-axl', clip: false, gap: 9 }));
  return G;
}

/* a horizontal sweep (the "row 2" test): like Graph.vlineTest, but along y, from the top down */
async function hlineTest(G, c, o) {
  const w = G.win, from = o.from ?? w.ymax, to = o.to ?? w.ymin, N = 600;
  const xsAt = (y) => [...new Set((o.hitsY(y) || []).filter((x) => Number.isFinite(x) && x >= w.xmin && x <= w.xmax).map((x) => parseFloat(x.toFixed(9))))];
  const gap = (o.minGap ?? 36) / G.ux, apart = (xs) => xs.length > 1 && Math.max(...xs) - Math.min(...xs) >= gap;
  let stop = to, fail = null;
  for (let i = 0; i <= N; i++) { const y = from + (to - from) * i / N, xs = xsAt(y); if (apart(xs)) { stop = y; fail = { y, xs }; break; } }
  const sn = o.snap ?? 0.5;
  if (fail && sn) for (let y = Math.floor(fail.y / sn + 1e-9) * sn, k = 0; y >= to && k < 4; y -= sn, k++) { const xs = xsAt(y); if (apart(xs)) { stop = y; fail = { y, xs }; break; } }
  const ln = G.hline(from, { color: 'purple', width: 3.5, dash: false, cls: 'u5l5-hlt' });
  const dots = svgEl('g', { class: 'bk-vlt-dots u5l5-hdots' }, G.layers.top);
  const paint = (y, xs) => { ln.set(y); dots.innerHTML = ''; (xs || xsAt(y)).forEach((x) => { const [px, py] = G.toPx(x, y); svgEl('circle', { class: 'bk-vlt-dot', cx: px, cy: py, r: 8 }, dots); }); };
  await tween(c, o.ms ?? 2600 * Math.abs(stop - from) / (Math.abs(to - from) || 1), (t) => paint(from + (stop - from) * t), linear);
  if (fail) { paint(fail.y, fail.xs); ln.classList.add('u5l5-twice'); dots.classList.add('u5l5-twice'); if (c) await Promise.all([...dots.children].map((d) => pop(c, d, 360))); }
  else ln.classList.add('bk-pass');
  return { line: ln, dots, fail };
}

/* ======================= shared data ======================= */
const D = [1, 8, 27, 64], R = [1, 2, 3, 4];
const REL = {
  mult: { name: '(i) “is a multiple of”', test: (d, r) => d % r === 0,
    ask: (d) => `Is ${T(d)} a multiple of…`,
    row: (d, r) => { const q = d / r, s = Number.isInteger(q * 100) ? '=' + texNum(q) : '\\approx' + q.toFixed(2); return T(`${d}\\div${r}${s}`); } },
  cube: { name: '(ii) “is the cube of”', test: (d, r) => r ** 3 === d,
    ask: (d) => `Is ${T(d)} the cube of…`,
    row: (d, r) => T(`${r}^3=${r ** 3}`) }
};
const relPairs = (k) => { const out = []; D.forEach((d) => R.forEach((r) => { if (REL[k].test(d, r)) out.push([d, r]); })); return out; };
const PEOPLE = ['Ava', 'Ben', 'Cleo', 'Dev', 'Eli'], DATES = ['Mar 3', 'Jul 14', 'Oct 31', 'Dec 25'], BDAY = [0, 1, 1, 2, 3];

/* closed smooth curve through points (TikZ "smooth cycle": cubic Béziers; pgf's default plot tension 0.5 → 0.5 × 0.2775 = 0.13875,
   so the curve matches the booklet's figure and x = 0 crosses it near y ≈ 1.39 and y ≈ −1.68) */
function smoothCycle(P, n = 60) {
  const k = 0.13875, m = P.length, out = [];
  for (let i = 0; i < m; i++) {
    const p0 = P[(i - 1 + m) % m], p1 = P[i], p2 = P[(i + 1) % m], p3 = P[(i + 2) % m];
    const c1 = [p1[0] + k * (p2[0] - p0[0]), p1[1] + k * (p2[1] - p0[1])], c2 = [p2[0] - k * (p3[0] - p1[0]), p2[1] - k * (p3[1] - p1[1])];
    for (let j = 0; j < n; j++) { const t = j / n, u = 1 - t; out.push([0, 1].map((d) => u * u * u * p1[d] + 3 * u * u * t * c1[d] + 3 * u * t * t * c2[d] + t * t * t * p2[d])); }
  }
  return out;
}
/* every y where the closed polyline crosses the vertical line at x */
const crossX = (pts, x) => { const ys = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[0] - x) * (b[0] - x) < 0 || (a[0] === x && b[0] !== x)) ys.push(a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])); } return ys; };
const BLOB = smoothCycle([[-2.2, -1], [-1.2, 1.6], [0.3, 1.2], [1.6, -0.3], [0.8, -1.9], [-0.8, -1.3]]);
const circlePts = (r, n = 160) => Array.from({ length: n }, (_, i) => [r * Math.cos(2 * Math.PI * i / n), r * Math.sin(2 * Math.PI * i / n)]);
const sideways = () => Array.from({ length: 81 }, (_, i) => { const y = -2.85 + 5.7 * i / 80; return [0.4 * y * y, y]; });

/* Example 2's four graphs: how to draw them and where vertical / horizontal lines meet them */
const EX2 = {
  A: { name: 'Graph A', draw: (G, o = {}) => G.fn((x) => -0.5 * x * x + 3, { from: -2.4, to: 2.4, arrows: false, ...o }),
    hits: (x) => (Math.abs(x) <= 2.4 ? [-0.5 * x * x + 3] : []),
    hitsY: (y) => { if (y > 3 || y < 0.12) return []; const x = Math.sqrt(2 * (3 - y)); return x < 1e-9 ? [0] : [-x, x]; } },
  B: { name: 'Graph B', draw: (G, o = {}) => G.fn((x) => 2 * x / 3, { from: -3.2, to: 3.2, arrows: false, ...o }),
    hits: (x) => (Math.abs(x) <= 3.2 ? [2 * x / 3] : []), hitsY: (y) => (Math.abs(y) <= 2.1334 ? [1.5 * y] : []) },
  C: { name: 'Graph C', draw: (G, o = {}) => G.polyline(circlePts(3), { closed: true, ...o }),
    hits: (x) => (Math.abs(x) <= 3 ? [Math.sqrt(9 - x * x), -Math.sqrt(9 - x * x)] : []), hitsY: (y) => (Math.abs(y) <= 3 ? [Math.sqrt(9 - y * y), -Math.sqrt(9 - y * y)] : []) },
  D: { name: 'Graph D', draw: (G, o = {}) => G.polyline(sideways(), o),
    hits: (x) => (x >= 0 && x <= 0.4 * 2.85 * 2.85 ? [Math.sqrt(x / 0.4), -Math.sqrt(x / 0.4)] : []), hitsY: (y) => (Math.abs(y) <= 2.85 ? [0.4 * y * y] : []) }
};
const ex2Graph = (host, size, o = {}) => new Graph(host, { width: size, height: size, xmin: -4, xmax: 4, ymin: -4, ymax: 4, ...o });

/* ======================= 0. warm-up bridge: person → birthday ======================= */
const birthday = {
  title: 'Person → birthday, then flip the arrows',
  height: 450,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Each person has one birthday. Is <b>person → birthday</b> a function? What about <b>birthday → person</b>? Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, mw = 380, gx = mw + 26, gw = W - gx - 10;
    const p1 = PEOPLE.map((p, i) => [p, DATES[BDAY[i]]]), p2 = p1.map((q) => [q[1], q[0]]);
    const M1 = new MappingDiagram(stage, { x: 8, y: 8, width: mw, height: 434, domain: PEOPLE, range: DATES, pairs: p1, titles: ['Person', 'Birthday'], tex: false, arrows: false, color: COLORS.red });
    const M2 = new MappingDiagram(stage, { x: 8, y: 8, width: mw, height: 434, domain: DATES, range: PEOPLE, pairs: p2, titles: ['Birthday', 'Person'], tex: false, arrows: false, color: COLORS.red });
    const G1 = catGraph(stage, { x: gx, y: 8, width: gw, height: 434, xs: PEOPLE, ys: DATES, xtitle: '\\text{person}', ytitle: '\\text{birthday}' });
    const G2 = catGraph(stage, { x: gx, y: 8, width: gw, height: 434, xs: DATES, ys: PEOPLE, xtitle: '\\text{birthday}', ytitle: '\\text{person}' });
    hidden(M2.el, G2.el);
    const pts1 = PEOPLE.map((p, i) => [i + 1, BDAY[i] + 1]), pts2 = pts1.map((q) => [q[1], q[0]]);
    return [
      { cap: 'Draw an arrow from each person to their birthday.', run: (c) => M1.drawArrows(c, { stagger: 80 }) },
      { cap: 'Count the arrows <b>leaving</b> each person: exactly <b>one</b> each. Two arrows <b>arrive</b> at Jul 14 (Ben and Cleo). That’s allowed.',
        run: async (c) => { for (const p of PEOPLE) { M1.highlight('d', p, true, 'u5l5-good'); await sleep(c, 140); } M1.highlight('r', 'Jul 14'); await pulse(c, M1.item('r', 'Jul 14'), 1.15); } },
      { cap: 'Plot each pair (person, birthday). Slide a vertical line across: every person’s column has <b>one</b> dot.',
        run: async (c) => { for (const q of pts1) { await G1.reveal(G1.point(q[0], q[1], { color: 'red', r: 8 }), c, 260); } await G1.vlineTest(c, { points: pts1, ms: 2000 }); } },
      { cap: '<b>Person → birthday is a function.</b> One input, one output, every time.',
        run: (c) => stampIn(c, stamp(G1.el, 'Function', { ok: true, x: gw - 120, y: 46, size: 'lg' })) },
      { cap: 'Now <b>flip the arrows</b>: the birthday is the input and the person is the output.',
        run: async (c) => { await Promise.all([fadeOut(c, M1.el), fadeOut(c, G1.el)]); await Promise.all([appear(c, M2.el), appear(c, G2.el)]); await M2.drawArrows(c, { stagger: 80 }); } },
      { cap: 'Jul 14 now has <b>two</b> arrows leaving it, to Ben and Cleo. One input, two outputs.', run: (c) => M2.oneToMany(c) },
      { cap: 'On the graph, the Jul 14 column holds <b>two</b> dots, so a vertical line hits it twice. <b>Birthday → person is not a function.</b>',
        run: async (c) => {
          for (const q of pts2) await G2.reveal(G2.point(q[0], q[1], { color: 'red', r: 8 }), c, 220);
          await G2.vlineTest(c, { points: pts2, ms: 1400 });
          await stampIn(c, stamp(G2.el, 'Not a function', { ok: false, x: gw - 205, y: 46, size: 'lg' }));
        } }
    ];
  }
};

/* ======================= 1. building relations (i) and (ii) ======================= */
const twoRel = {
  title: 'Ask the question for every input',
  height: 462,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'mult', label: '(i) is a multiple of' }, { v: 'cube', label: '(ii) is the cube of' }],
  intro: (k) => `${T('D=\\{1,8,27,64\\}')}, ${T('R=\\{1,2,3,4\\}')}. Relation ${REL[k].name}: for each domain element ask the question, and draw an arrow for every <b>yes</b>. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const W = ex.W, rel = REL[k], pairs = relPairs(k);
    const M = new MappingDiagram(stage, { x: 8, y: 8, width: 400, height: 434, domain: D, range: R, pairs, arrows: false });
    const Q = panel(stage, 428, 8, W - 438, 218, 'The question');
    const P = panel(stage, 428, 236, W - 438, 140, 'Ordered pairs');
    const pl = h('div', 'u5l5-prs'); P.appendChild(pl);
    const steps = D.map((d) => {
      const yes = R.filter((r) => rel.test(d, r)), n = yes.length;
      const list = yes.map((r) => T(r)), said = list.length > 1 ? list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1] : list[0];
      return {
        cap: k === 'mult'
          ? `Is ${T(d)} a multiple of 1? of 2? of 3? of 4? Yes for ${said}: <b>${n === 1 ? 'one arrow</b> leaves' : n + ' arrows</b> leave'} ${T(d)}.`
          : `Which of 1, 2, 3, 4 cubes to ${T(d)}? Only ${said}: <b>one arrow</b> leaves ${T(d)}.`,
        run: async (c) => {
          [...Q.querySelectorAll('.u5l5-q, .u5l5-qrows')].forEach((e) => e.remove());
          D.forEach((x) => M.highlight('d', x, x === d));
          const qq = h('div', 'u5l5-q', rel.ask(d)); Q.appendChild(qq);
          const rows = h('div', 'u5l5-qrows'); Q.appendChild(rows);
          for (const r of R) {
            const ok = rel.test(d, r), el = h('div', 'u5l5-qrow ' + (ok ? 'yes' : 'no'), `<span>${rel.row(d, r)}</span><b>${ok ? '✓ yes' : '✗ no'}</b>`);
            rows.appendChild(el); await fadeIn(c, el, 260); await sleep(c, 90);
          }
          for (const r of yes) { await M.drawArrow(c, pairs.findIndex((p) => p[0] === d && p[1] === r), 380); const ch = chip(T(pairTex(d, r))); pl.appendChild(ch); await pop(c, ch, 260); }
        }
      };
    });
    const bad = k === 'mult';
    steps.push({
      cap: bad ? `${T('8')}, ${T('27')} and ${T('64')} each have <b>more than one</b> arrow leaving them. One input, several outputs: <b>not a function</b>.`
        : 'Every domain element has <b>exactly one</b> arrow leaving it. <b>A function.</b>',
      run: async (c) => {
        D.forEach((x) => M.highlight('d', x, false));
        if (bad) { await M.oneToMany(c); pl.querySelectorAll('.u5l5-pr').forEach((e, i) => { if (pairs.filter((p) => p[0] === pairs[i][0]).length > 1) e.classList.add('bad'); }); }
        else D.forEach((x) => M.highlight('d', x, true, 'u5l5-good'));
        await stampIn(c, stamp(stage, bad ? 'Not a function' : 'Function', { ok: !bad, x: 428 + (W - 438) / 2, y: 410, size: 'lg', rotate: -2 }));
      }
    });
    return steps;
  }
};

/* ======================= 1. relations and functions: the nested ovals ======================= */
const NEST = [
  { t: '(i) “is a multiple of”', f: false, why: `${T('8')} is paired with ${T('1')}, ${T('2')} and ${T('4')}` },
  { t: '(ii) “is the cube of”', f: true, why: 'each domain element is the cube of exactly one number' },
  { t: 'person → birthday', f: true, why: 'everyone has exactly one birthday' },
  { t: 'birthday → person', f: false, why: 'Jul 14 goes to Ben <b>and</b> Cleo' },
  { t: 'student → student ID', f: true, why: 'each student has one ID number' },
  { t: 'the circle, graph C', f: false, why: 'a vertical line can cross a circle twice' }
];
const nested = {
  title: 'Which relations are functions?',
  height: 440,
  intro: 'Every relation goes in the big oval. Only the functions go in the inner one. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, cx = W / 2, svg = svgEl('svg', { class: 'u5l5-nestsvg', width: W, height: 440, viewBox: `0 0 ${W} 440` }, stage);
    const icx = cx + 150, icy = 220;
    const outer = svgEl('ellipse', { cx, cy: 205, rx: cx - 14, ry: 192, fill: '#f1f0ec', stroke: COLORS.slate, 'stroke-width': 3 }, svg);
    const inner = svgEl('ellipse', { cx: icx, cy: icy, rx: 268, ry: 152, fill: '#e3ecfb', stroke: COLORS.blue, 'stroke-width': 3 }, svg);
    const lo = add(stage, h('div', 'u5l5-ovlab', 'Relations'), 90, 52), li = add(stage, h('div', 'u5l5-ovlab blue', 'Functions'), icx - 70, 82);
    hidden(outer, inner, lo, li);
    const slots = { true: [[icx, 152], [icx, 222], [icx, 292]], false: [[205, 150], [205, 220], [205, 290]] }, used = { true: 0, false: 0 };
    const cards = NEST.map((n) => { const s = slots[n.f][used[n.f]++], el = add(stage, h('div', 'u5l5-ncard ' + (n.f ? 'fn' : 'rel'), n.t), s[0] - 125, s[1] - 24); el.style.opacity = 0; return el; });
    const banner = add(stage, h('div', 'u5l5-banner', 'Every function is a relation, but not every relation is a function.'), 0, 404);
    banner.style.width = W + 'px'; banner.style.opacity = 0;
    return [
      { cap: 'The big oval holds <b>every relation</b>: any pairing of inputs with outputs.', run: async (c) => { await appear(c, outer, 400); await fadeIn(c, lo); } },
      { cap: 'Inside it, a smaller oval for the <b>functions</b>: the relations where every input has exactly one output.', run: async (c) => { await appear(c, inner, 400); await fadeIn(c, li); } },
      ...NEST.map((n, i) => ({
        cap: `<b>${n.t}</b>: ${n.why}, so it ${n.f ? '<b>is a function</b> and goes inside the inner oval' : 'is a relation but <b>not a function</b>: outside the inner oval'}.`,
        run: (c) => anim(c, cards[i], [{ opacity: 0, transform: 'translateY(-36px) scale(1.12)' }, { opacity: 1, transform: 'none' }], 520)
      })),
      { cap: 'The inner oval sits <b>inside</b> the outer one: every function is a relation. The cards on the left show that <b>not every relation is a function</b>.', run: (c) => fadeIn(c, banner) }
    ];
  }
};

/* ======================= Example 1 check: three pictures, one verdict ======================= */
const threeViews = {
  title: 'Example 1 check: arrow diagram, ordered pairs, graph',
  height: 500,
  value: 'mult',
  choices: [{ sep: 'Example 1 check:' }, { v: 'mult', label: '(i) is a multiple of' }, { v: 'cube', label: '(ii) is the cube of' }],
  intro: (k) => `Relation ${REL[k].name}, drawn three ways. Apply the function test to each picture. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const W = ex.W, pw = Math.floor((W - 28) / 3), pairs = relPairs(k), bad = k === 'mult';
    const X = [0, 1, 2].map((i) => 6 + i * (pw + 8));
    const Pa = panel(stage, X[0], 6, pw, 420, '(a) Arrow diagram'), Pb = panel(stage, X[1], 6, pw, 420, '(b) Ordered pairs'), Pc = panel(stage, X[2], 6, pw, 420, '(c) Graph');
    void Pa; void Pc;
    const M = new MappingDiagram(stage, { x: X[0] + 4, y: 40, width: pw - 8, height: 320, domain: D, range: R, pairs, titles: null });
    const lst = h('div', 'u5l5-plist cols'); Pb.appendChild(lst);
    const chips = pairs.map((p) => { const e = chip(T(pairTex(p[0], p[1]))); lst.appendChild(e); return e; });
    const G = catGraph(stage, { x: X[2] + 4, y: 40, width: pw - 8, height: 320, xs: D.map(String), ys: R.map(String), xtitle: '\\text{domain}', ytitle: '\\text{range}', pad: [26, 24, 40, 36], grid: false });
    const pts = pairs.map((p) => [D.indexOf(p[0]) + 1, p[1]]);
    pts.forEach((q) => G.point(q[0], q[1], { color: 'ink', r: 7 }));
    const verdict = (P, html, ok) => { const d = h('div', 'u5l5-verd ' + (ok ? 'ok' : 'no'), html); P.appendChild(d); return d; };
    const rep = (x) => pairs.filter((p) => p[0] === x).length > 1;
    return [
      { cap: bad ? '(a) Look at the arrows <b>leaving</b> each domain element. ' + T('8') + ' has <b>three</b> (to 1, 2 and 4). So do 27 and 64… more than one each.'
        : '(a) Look at the arrows <b>leaving</b> each domain element: exactly <b>one</b> each.',
        run: async (c) => { if (bad) await M.oneToMany(c); else for (const d of D) { M.highlight('d', d, true, 'u5l5-good'); await sleep(c, 150); } await fadeIn(c, verdict(Pa, bad ? `${T('8')} has 3 arrows ✗` : 'one arrow each ✓', !bad)); } },
      { cap: bad ? '(b) Look at the <b>first coordinates</b>. ' + T('(8,1),\\ (8,2),\\ (8,4)') + ' all start with ' + T('8') + ': one input, three outputs.'
        : '(b) Look at the <b>first coordinates</b>: 1, 8, 27, 64. No first coordinate repeats.',
        run: async (c) => { for (let i = 0; i < pairs.length; i++) { const e = chips[i]; if (rep(pairs[i][0])) { e.classList.add(pairs[i][0] === 8 ? 'bad' : 'bad2'); await pop(c, e, 240); } else if (!bad) { e.classList.add('good'); await pop(c, e, 200); } } await fadeIn(c, verdict(Pb, bad ? `${T('8')} repeats ✗` : 'no repeats ✓', !bad)); } },
      { cap: bad ? '(c) Slide a vertical line across. The line through ' + T('8') + ' passes through <b>three</b> plotted points.'
        : '(c) Slide a vertical line across. Every line through a domain value meets <b>exactly one</b> point.',
        run: async (c) => { await G.vlineTest(c, { points: pts, ms: 2000 }); await fadeIn(c, verdict(Pc, bad ? '3 dots above 8 ✗' : 'one dot per line ✓', !bad)); } },
      { cap: bad ? 'All three pictures agree: relation (i) is <b>not a function</b>.' : 'All three pictures agree: relation (ii) <b>is a function</b>.',
        run: (c) => stampIn(c, stamp(stage, bad ? 'Not a function' : 'Function', { ok: !bad, x: W / 2, y: 460, size: 'lg', rotate: -2 })) }
    ];
  }
};

/* ======================= 2. why a vertical line? ======================= */
const WV = {
  s1: { label: 'Set 1', pts: [[-4, -1], [-2, 3], [1, -2], [1, 4], [3, 4], [5, 1]] },
  s2: { label: 'Set 2', pts: [[-4, -1], [-2, 3], [1, 4], [3, 4], [5, 1]] }
};
const whyVertical = {
  title: 'Why a vertical line?',
  height: 460,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(WV).map((k) => ({ v: k, label: WV[k].label + ': ' + WV[k].pts.map((p) => T(pairTex(p[0], p[1]).replace(/\\ /g, ''))).join(', ') })), // one pair per piece: the chip can wrap
  intro: 'A vertical line is every point with the <b>same input</b>. Watch which ordered pairs it catches. Press <b>Next</b>.',
  make(stage, k, ex) {
    const W = ex.W, d = WV[k], pts = d.pts, two = pts.filter((p) => p[0] === 1).length > 1;
    const G = new Graph(stage, { x: 10, y: 10, width: 440, height: 440, xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
    const P = panel(stage, 470, 10, W - 480, 440, 'Ordered pairs');
    const lst = h('div', 'u5l5-plist two'); P.appendChild(lst);
    const chips = pts.map((p) => { const e = chip(T(pairTex(p[0], p[1]))); e.style.opacity = 0.3; lst.appendChild(e); return e; });
    const note = h('div', 'u5l5-note', ''); P.appendChild(note);
    const dots = [];
    let tr;
    const on1 = pts.map((p, i) => (p[0] === 1 ? i : -1)).filter((i) => i >= 0), on4 = pts.map((p, i) => (p[1] === 4 ? i : -1)).filter((i) => i >= 0);
    const L = (ps) => ps.map((i) => T(pairTex(pts[i][0], pts[i][1]))).join(' and ');
    return [
      { cap: 'Plot the ordered pairs.', run: async (c) => { for (let i = 0; i < pts.length; i++) { chips[i].style.opacity = 1; const p = G.point(pts[i][0], pts[i][1], { color: 'teal', r: 7.5 }); dots.push(p); await G.reveal(p, c, 240); } } },
      { cap: `Here is the vertical line ${T('x=1')}. Every point on it has first coordinate ${T('1')}: the whole line is the <b>input 1</b>.`,
        run: async (c) => {
          const vl = G.vline(1, { color: 'blue', dash: false, width: 3 }); await G.drawIn(vl, 600, c);
          G.label(1, 5.4, T('x=1'), { pos: 'e', cls: 'bk-pill', color: 'blue' });
          tr = G.point(1, -5, { color: 'blue', r: 6, label: T(pairTex(1, -5)), pos: 'e' });
          let last = -5;
          await tween(c, 1600, (t) => { const y = -5 + 10 * t, yi = Math.round(y); G.moveTo(tr, 1, y); if (yi !== last) { last = yi; tr.label.innerHTML = T(pairTex(1, yi)); } });
          G.remove(tr);
        } },
      { cap: two ? `It passes through ${L(on1)}: the input ${T('1')} has <b>two outputs</b>.` : `It passes through only ${L(on1)}: the input ${T('1')} has <b>one output</b>.`,
        run: async (c) => { for (const i of on1) { chips[i].classList.add(two ? 'bad' : 'good'); dots[i].querySelector('circle').setAttribute('fill', two ? COLORS.red : COLORS.green); await pop(c, dots[i], 320); } note.innerHTML = two ? `Same first coordinate, different second coordinates.` : 'One pair starts with 1.'; await fadeIn(c, note); } },
      { cap: `A <b>horizontal</b> line is every point with the same <b>output</b>. ${T('y=4')} passes through ${L(on4)}: two inputs share the output 4. That is <b>allowed</b>.`,
        run: async (c) => { const hl = G.hline(4, { color: 'amber', dash: true, width: 3 }); await G.drawIn(hl, 600, c); G.label(-5.6, 4, T('y=4'), { pos: 'n', cls: 'bk-pill', color: 'amber' }); for (const i of on4) if (!(two && pts[i][0] === 1)) chips[i].classList.add('fine'); } },
      { cap: 'So only vertical lines matter. Sweep one across the whole graph…',
        run: async (c) => { await G.vlineTest(c, { points: pts, ms: 2400 }); } },
      { cap: two ? `…it catches two dots at ${T('x=1')}. <b>Not a function.</b>` : '…it never catches more than one dot. <b>A function</b>, even though two dots share a row.',
        run: (c) => stampIn(c, stamp(P, two ? 'Not a function' : 'Function', { ok: !two, x: (W - 480) / 2, y: 392, size: 'lg', rotate: -4 })) }
    ];
  }
};

/* ======================= Example 2 check: vertical and horizontal sweeps ======================= */
const ROWS = ['For each input value there is only one output', 'For each output value there is only one input', 'The relation is a function'];
const ANS2 = { A: 'TFT', B: 'TTT', C: 'FFF', D: 'FTF' };
const vlt = {
  title: 'Example 2 check: sweep a vertical line, then a horizontal line',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  value: 'A',
  choices: [{ sep: 'Example 2 check:' }, ...'ABCD'.split('').map((k) => ({ v: k, label: EX2[k].name }))],
  intro: (k) => `${EX2[k].name}. Fill in its column of the table. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const W = ex.W, g = EX2[k], ans = ANS2[k];
    const G = ex2Graph(stage, 448, { x: 8, y: 10 });
    const P = panel(stage, 470, 10, W - 480, 448, 'Example 2(a)');
    const tb = h('table', 'u5l5-tf small'); P.appendChild(tb);
    tb.innerHTML = '<tr><th></th>' + 'ABCD'.split('').map((x) => `<th class="${x === k ? 'cur' : ''}">${x}</th>`).join('') + '</tr>' + ROWS.map((r) => `<tr><td>${r}</td>` + 'ABCD'.split('').map((x) => `<td class="${x === k ? 'cur' : ''}"></td>`).join('') + '</tr>').join('');
    const cell = (r) => tb.rows[r + 1].cells['ABCD'.indexOf(k) + 1];
    const fill = async (c, r) => { const v = ans[r], s = h('b', v === 'T' ? 't' : 'f', v); cell(r).appendChild(s); await pop(c, s, 320); };
    const note = h('div', 'u5l5-note', ''); P.appendChild(note);
    let res, hres;
    const steps = [
      { cap: `${g.name}.`, run: (c) => G.reveal(g.draw(G, { color: 'teal' }), c, 900) },
      { cap: 'Rows 1 and 3: slide a <b>vertical</b> line across. Does it ever cross the graph twice?', run: async (c) => { res = await G.vlineTest(c, { hits: g.hits, ms: 2400 }); } },
      { cap: () => (res && res.fail ? 'It crosses <b>twice</b>: one input, two outputs. Row 1 is <b>F</b>, so the relation is <b>not a function</b>: row 3 is <b>F</b>.'
        : 'Every vertical line crosses <b>at most once</b>: each input has one output. Row 1 is <b>T</b>, so it <b>is a function</b>: row 3 is <b>T</b>.'),
      run: async (c) => { await fill(c, 0); await fill(c, 2); } }
    ];
    if (k === 'C' || k === 'D') {
      const x0 = k === 'C' ? 0 : 1.6, ys = k === 'C' ? [3, -3] : [2, -2];
      steps.push({
        cap: k === 'C' ? `Example 2(b): move the line to ${T('x=0')}. It meets C at ${T('(0,3)')} and ${T('(0,-3)')}: same first coordinate, different second coordinates.`
          : `Example 2(c): move the line to ${T('x=1.6')}. It meets D at ${T('(1.6,2)')} and ${T('(1.6,-2)')}, since ${T('0.4(2)^2=1.6')} and ${T('0.4(-2)^2=1.6')}.`,
        run: async (c) => {
          res.dots.innerHTML = ''; const x1 = res.line.gx;
          await tween(c, 900, (t) => { res.line.set(x1 + (x0 - x1) * t); });
          for (const y of ys) { const p = G.point(x0, y, { color: 'red', r: 8, coords: true, pos: y > 0 ? 'ne' : 'se' }); await G.reveal(p, c, 320); }
          note.innerHTML = `Proof: ${T(pairTex(x0, ys[0]))} and ${T(pairTex(x0, ys[1]))}`; await fadeIn(c, note);
        }
      });
    }
    steps.push(
      { cap: 'Row 2: slide a <b>horizontal</b> line down. Does any output come from <b>two</b> inputs?', run: async (c) => { hres = await hlineTest(G, c, { hitsY: g.hitsY, ms: 2400 }); } },
      { cap: () => (hres && hres.fail
        ? `It crosses twice${k === 'A' ? ` at ${T('y=2.5')} (${T('x=-1')} and ${T('x=1')})` : ''}: two inputs share an output. Row 2 is <b>F</b>.` + (ans[2] === 'T' ? ' That doesn’t stop it being a function.' : '')
        : 'Every horizontal line crosses <b>at most once</b>: each output comes from one input. Row 2 is <b>T</b>.' + (ans[2] === 'F' ? ' But row 2 doesn’t decide it: still <b>not a function</b>.' : '')),
      run: async (c) => { await fill(c, 1); await stampIn(c, stamp(P, ans[2] === 'T' ? 'Function' : 'Not a function', { ok: ans[2] === 'T', x: (W - 480) / 2, y: 390, size: 'lg', rotate: -3 })); } }
    );
    return steps;
  }
};

/* ======================= 3. one relation, six forms ======================= */
const SIX = {
  sq: { label: T('y=x^2') + ' (squares)', words: 'Pair each number with its <b>square</b>.', eq: 'y=x^2',
    pairs: [[-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]], dom: [-2, -1, 0, 1, 2], ran: [0, 1, 4], win: { xmin: -3, xmax: 3, ymin: -1, ymax: 5 },
    eqLines: [`Pick ${T('x=2')}: ${T('y=2^2=4')}.`, 'Squaring gives <b>one</b> answer.'] },
  rt: { label: T('x=y^2') + ' (square roots)', words: 'Pair each number with its <b>square roots</b>.', eq: 'x=y^2',
    pairs: [[0, 0], [1, 1], [1, -1], [4, 2], [4, -2]], dom: [0, 1, 4], ran: [-2, -1, 0, 1, 2], win: { xmin: -1, xmax: 5, ymin: -3, ymax: 3 },
    eqLines: [`Pick ${T('x=4')}: ${T('y^2=4')},`, `so ${T('y=2')} <b>or</b> ${T('y=-2')}.`] }
};
const sixWays = {
  title: 'One relation, six forms',
  height: 486,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SIX).map((k) => ({ v: k, label: SIX[k].label })),
  intro: (k) => `${SIX[k].words} Build it in six forms, then apply the function test to every one. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const W = ex.W, d = SIX[k], pw = Math.floor((W - 28) / 3), ph = 234, X = [0, 1, 2].map((i) => 6 + i * (pw + 8)), Y = [6, 6 + ph + 8];
    const reps = d.pairs.map((p) => d.pairs.filter((q) => q[0] === p[0]).length > 1), bad = reps.some(Boolean);
    const P = ['1 · Words', '2 · Table', '3 · Ordered pairs', '4 · Arrow diagram', '5 · Graph', '6 · Equation'].map((t, i) => panel(stage, X[i % 3], Y[Math.floor(i / 3)], pw, ph, t));
    P.forEach((p) => (p.style.opacity = 0));
    const words = h('div', 'u5l5-words', d.words); P[0].appendChild(words);
    const tb = new ValueTable(stage, { x: X[1] + (pw - 6 * 44) / 2, y: Y[0] + 62, headers: ['x', 'y'], rows: d.pairs, layout: 'h', cellW: 44, cellH: 46, tap: false });
    const plist = h('div', 'u5l5-prs'); P[2].appendChild(plist);
    const pchips = d.pairs.map((p) => { const e = chip(T(pairTex(p[0], p[1]))); plist.appendChild(e); return e; });
    const M = new MappingDiagram(stage, { x: X[0] + 6, y: Y[1] + 30, width: pw - 12, height: ph - 36, domain: d.dom, range: d.ran, pairs: d.pairs, titles: null, arrows: false, cls: 'u5l5-smallmap' });
    const G = new Graph(stage, { x: X[1] + 6, y: Y[1] + 30, width: pw - 12, height: ph - 36, ...d.win, fontSize: 15 });
    const eq = h('div', 'u5l5-eqbox', `<div class="u5l5-eqbig">${T(d.eq)}</div>` + d.eqLines.map((s) => `<div>${s}</div>`).join('')); P[5].appendChild(eq);
    [tb.el, M.el, G.el].forEach((e) => (e.style.opacity = 0));
    const show = async (c, i, ...els) => { await appear(c, P[i], 300); for (const e of els) await appear(c, e, 300); };
    return [
      { cap: `<b>Words:</b> ${d.words}`, run: (c) => show(c, 0) },
      { cap: '<b>Table:</b> inputs in the top row, outputs underneath.', run: (c) => show(c, 1, tb.el) },
      { cap: '<b>Ordered pairs:</b> each column of the table is one pair (input, output).', run: (c) => show(c, 2) },
      { cap: '<b>Arrow diagram:</b> one arrow for each pair, from the domain to the range.', run: async (c) => { await show(c, 3, M.el); await M.drawArrows(c, { ms: 320, stagger: 60 }); } },
      { cap: '<b>Graph:</b> each pair is a point.', run: async (c) => { await show(c, 4, G.el); for (const p of d.pairs) await G.reveal(G.point(p[0], p[1], { color: 'teal', r: 6.5 }), c, 200); } },
      { cap: `<b>Equation:</b> ${T(d.eq)}. ` + d.eqLines.join(' '), run: (c) => show(c, 5) },
      { cap: bad ? `Now the test, in every form. Inputs ${T('1')} and ${T('4')} each have <b>two outputs</b>: repeated in the table and the pairs, two arrows each, two dots on one vertical line, ${T('\\pm')} in the equation.`
        : `Now the test, in every form. Every input has <b>one</b> output. The output ${T('4')} comes from ${T('-2')} <b>and</b> ${T('2')}, and that is fine.`,
        run: async (c) => {
          d.pairs.forEach((p, i) => { if (reps[i]) { tb.highlight(i, true, 'u5l5-hbad'); pchips[i].classList.add('bad'); } else if (!bad) pchips[i].classList.add(p[1] === 4 ? 'fine' : 'good'); });
          if (bad) { await M.oneToMany(c); for (const x of [1, 4]) await G.drawIn(G.vline(x, { color: 'red', width: 2.5 }), 400, c); }
          else { d.dom.forEach((x) => M.highlight('d', x, true, 'u5l5-good')); M.highlight('r', 4); await G.vlineTest(c, { points: d.pairs, ms: 1500 }); }
          eq.classList.add(bad ? 'bad' : 'good'); await pulse(c, eq, 1.05);
        } },
      { cap: bad ? `Same verdict in all six forms: ${T('x=y^2')} is <b>not a function</b>.` : `Same verdict in all six forms: ${T('y=x^2')} <b>is a function</b>.`,
        run: (c) => stampIn(c, stamp(stage, bad ? 'Not a function' : 'Function', { ok: !bad, x: X[0] + pw / 2, y: Y[0] + ph - 50, rotate: -4, cls: 'u5l5-midstamp' })) }
    ];
  }
};

/* ======================= Example 3 check ======================= */
const E3 = {
  a: [[7, 3], [5, 7], [-2, 9], [0, 3], [5, 4]],
  b: [[4, 4], [1, 3], [6, 9], [-5, 4]]
};
const CAR = '<svg class="u5l5-car" viewBox="0 0 64 32"><path d="M4 22v-6l8-2 8-8h20l10 8 9 2v6z" fill="#e05a4c" stroke="#1e2d46" stroke-width="2" stroke-linejoin="round"/><path d="M22 8h8v7H15zM34 8h5l7 7H34z" fill="#e8f0fc" stroke="#1e2d46" stroke-width="1.5"/><circle cx="17" cy="23" r="5" fill="#1e2d46"/><circle cx="48" cy="23" r="5" fill="#1e2d46"/></svg>';
const CARS = ['red', 'blue', 'green'], PLATES = ['CXK 4471', 'BTR 2096', 'DMW 5813'];
const carItem = (i) => `<span class="u5l5-cari" data-c="${i}">${CAR.replace('#e05a4c', ['#e05a4c', '#3b78d8', '#2e9b64'][i])}</span>`;
const plateItem = (i) => `<span class="u5l5-plate">${PLATES[i]}</span>`;
const sixForms = {
  title: 'Example 3 check: one test, six forms',
  height: 440,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  value: 'a',
  choices: [{ sep: 'Example 3 check:' }, ...['a', 'b', 'c', 'd', 'e', 'f'].map((k) => ({ v: k, label: `(${k})` }))],
  intro: (k) => ({ a: 'Part (a): a list of ordered pairs.', b: 'Part (b): a list of ordered pairs.', c: 'Part (c): an arrow diagram.', d: 'Part (d): a graph of points.', e: 'Part (e): a description in words.', f: 'Part (f): a closed curve.' }[k]) + ' Press <b>Next</b>.',
  make(stage, k, ex) {
    const W = ex.W, lw = 520, P = panel(stage, lw + 20, 8, W - lw - 30, 424, 'The test'), pw = W - lw - 30;
    const verdict = (ok) => (c) => stampIn(c, stamp(P, ok ? 'Function' : 'Not a function', { ok, x: pw / 2, y: 376, size: 'lg', rotate: -4 }));
    if (k === 'a' || k === 'b') {
      const pairs = E3[k], sorted = pairs.map((p, i) => [p, i]).sort((u, v) => u[0][0] - v[0][0]);
      const top = add(stage, h('div', 'u5l5-rowlab', 'As given'), 14, 20), bot = add(stage, h('div', 'u5l5-rowlab', 'Sorted by first coordinate'), 14, 170);
      void top; bot.style.opacity = 0;
      const cw = 100, X0 = 14;
      pairs.forEach((p, i) => add(stage, chip(T(pairTex(p[0], p[1]))), X0 + i * cw, 56));
      const moved = sorted.map(([p], j) => { const e = add(stage, chip(T(pairTex(p[0], p[1]))), X0 + j * cw, 206); e.style.opacity = 0; return e; });
      const xs = pairs.map((p) => p[0]), rep = (x) => xs.filter((v) => v === x).length > 1, bad = xs.some(rep);
      const outs = pairs.map((p) => p[1]), repOut = (y) => outs.filter((v) => v === y).length > 1;
      const L1 = line(P, `Inputs: ${xs.map((x) => T(x)).join(', ')}`); L1.style.opacity = 0;
      const badX = xs.find(rep), dupY = outs.find(repOut);
      const steps = [
        { cap: 'The inputs are the <b>first coordinates</b>. List them.', run: (c) => fadeIn(c, L1) },
        { cap: 'Sort the pairs by first coordinate, so a repeated input sits side by side.', run: async (c) => { await fadeIn(c, bot); for (let j = 0; j < sorted.length; j++) { const i = sorted[j][1], dx = (i - j) * cw; await anim(c, moved[j], [{ opacity: 0, transform: `translate(${dx}px, -150px)` }, { opacity: 1, transform: 'none' }], 420); } } },
        { cap: bad ? `${T(badX)} appears <b>twice</b>, with outputs ${T(pairs.filter((p) => p[0] === badX).map((p) => p[1]).join('\\text{ and }'))}. One input, two outputs. (The output ${T(dupY)} repeating is fine.)`
          : `The inputs ${xs.map((x) => T(x)).join(', ')} are <b>all different</b>. The output ${T(dupY)} repeats, and that doesn’t matter.`,
          run: async (c) => {
            sorted.forEach(([p], j) => moved[j].classList.add(rep(p[0]) ? 'bad' : repOut(p[1]) ? 'fine' : 'good'));
            await Promise.all(moved.map((e) => pop(c, e, 300)));
            await fadeIn(c, line(P, bad ? `${T(badX)} has two outputs ✗` : 'every input once ✓', bad ? 'no' : 'ok'));
            await fadeIn(c, line(P, `repeated output ${T(dupY)}: fine`, 'fine'));
          } },
        { cap: bad ? 'Part (a) is <b>not a function</b>.' : 'Part (b) <b>is a function</b>.', run: verdict(!bad) }
      ];
      return steps;
    }
    if (k === 'c') {
      const M = new MappingDiagram(stage, { x: 20, y: 10, width: 480, height: 410, domain: ['D', 'E', 'F'], range: ['X', 'Y'], pairs: [['D', 'X'], ['E', 'Y'], ['F', 'Y']], tex: false });
      return [
        { cap: 'Count the arrows <b>leaving</b> each domain element: ' + T('D') + ', ' + T('E') + ', ' + T('F') + ' have one each.',
          run: async (c) => { for (const v of ['D', 'E', 'F']) { M.highlight('d', v, true, 'u5l5-good'); await sleep(c, 200); } await fadeIn(c, line(P, 'one arrow leaves each of D, E, F ✓', 'ok')); } },
        { cap: T('Y') + ' <b>receives</b> two arrows. That’s two inputs sharing an output: allowed.', run: async (c) => { M.highlight('r', 'Y'); await pulse(c, M.item('r', 'Y'), 1.2); await fadeIn(c, line(P, 'Y receives two: fine', 'fine')); } },
        { cap: 'Part (c) <b>is a function</b>.', run: verdict(true) }
      ];
    }
    if (k === 'd') {
      const pts = [[1, 3], [2, 1], [4, 4], [5, 2]];
      const G = new Graph(stage, { x: 30, y: 12, width: 470, height: 410, xmin: 0, xmax: 6, ymin: 0, ymax: 5 });
      pts.forEach((p) => G.point(p[0], p[1], { color: 'ink', r: 7 }));
      return [
        { cap: 'Read the points as ordered pairs.', run: async (c) => { for (const p of pts) await fadeIn(c, line(P, T(pairTex(p[0], p[1])))); } },
        { cap: 'Slide a vertical line across: it meets <b>at most one</b> point at a time (the ' + T('x') + '-coordinates 1, 2, 4, 5 are all different).', run: (c) => G.vlineTest(c, { points: pts, ms: 2400 }) },
        { cap: 'Part (d) <b>is a function</b>.', run: verdict(true) }
      ];
    }
    if (k === 'e') {
      const M = new MappingDiagram(stage, { x: 10, y: 10, width: 500, height: 410, domain: [0, 1, 2].map(carItem), range: [0, 1, 2].map(plateItem), pairs: [0, 1, 2].map((i) => [carItem(i), plateItem(i)]), titles: ['Vehicle', 'Plate number'], tex: false, arrows: false });
      return [
        { cap: 'The domain is every vehicle registered in Alberta; the range is the licence plate numbers.', run: async (c) => { await fadeIn(c, line(P, '<b>Input:</b> a vehicle')); await fadeIn(c, line(P, '<b>Output:</b> its plate number')); } },
        { cap: 'Each vehicle is issued <b>exactly one</b> licence plate number: one arrow leaves each vehicle.', run: async (c) => { await M.drawArrows(c, { stagger: 100 }); await fadeIn(c, line(P, 'one plate per vehicle ✓', 'ok')); } },
        { cap: 'Part (e) <b>is a function</b>.', run: verdict(true) }
      ];
    }
    // (f): the closed curve
    const G = new Graph(stage, { x: 20, y: 12, width: 490, height: 410, xmin: -4, xmax: 4, ymin: -3, ymax: 3 });
    G.polyline(BLOB, { closed: true, color: 'ink' });
    const ys = crossX(BLOB, 0).sort((u, v) => v - u);
    let res;
    return [
      { cap: 'A graph: slide a vertical line across.', run: async (c) => { res = await G.vlineTest(c, { hits: (x) => crossX(BLOB, x), ms: 1800 }); await fadeIn(c, line(P, 'a vertical line crosses twice ✗', 'no')); } },
      { cap: `Example 3(f): the line ${T('x=0')} crosses the closed curve twice, near ${T('y\\approx1.4')} and ${T('y\\approx-1.7')}.`,
        run: async (c) => {
          res.dots.innerHTML = ''; const x1 = res.line.gx; await tween(c, 800, (t) => { res.line.set(x1 * (1 - t)); });
          for (const y of ys) await G.reveal(G.point(0, y, { color: 'red', r: 8, label: T(y > 0 ? 'y\\approx1.4' : 'y\\approx-1.7'), pos: y > 0 ? 'ne' : 'se' }), c, 300);
          await fadeIn(c, line(P, `the input ${T('0')} has two outputs`, 'no'));
        } },
      { cap: 'Part (f) is <b>not a function</b>.', run: verdict(false) }
    ];
  }
};

/* ======================= static figures ======================= */
function mountFigures() {
  const F = {
    mapI: (el) => new MappingDiagram(el, { width: 330, height: 230, domain: D, range: R, pairs: relPairs('mult') }),
    mapII: (el) => new MappingDiagram(el, { width: 330, height: 230, domain: D, range: R, pairs: relPairs('cube') }),
    grI: (el) => { const G = catGraph(el, { width: 300, height: 230, xs: D.map(String), ys: R.map(String), xtitle: '\\text{domain}', ytitle: '\\text{range}', pad: [24, 24, 38, 34], grid: false }); relPairs('mult').forEach((p) => G.point(D.indexOf(p[0]) + 1, p[1], { color: 'ink', r: 6 })); },
    grII: (el) => { const G = catGraph(el, { width: 300, height: 230, xs: D.map(String), ys: R.map(String), xtitle: '\\text{domain}', ytitle: '\\text{range}', pad: [24, 24, 38, 34], grid: false }); relPairs('cube').forEach((p) => G.point(D.indexOf(p[0]) + 1, p[1], { color: 'ink', r: 6 })); },
    A: (el) => EX2.A.draw(ex2Graph(el, 226, { fontSize: 15 }), { color: 'ink' }),
    B: (el) => EX2.B.draw(ex2Graph(el, 226, { fontSize: 15 }), { color: 'ink' }),
    C: (el) => EX2.C.draw(ex2Graph(el, 226, { fontSize: 15 }), { color: 'ink' }),
    D: (el) => EX2.D.draw(ex2Graph(el, 226, { fontSize: 15 }), { color: 'ink' }),
    Cans: (el) => { const G = ex2Graph(el, 200, { fontSize: 14 }); EX2.C.draw(G, { color: 'ink', width: 3 }); G.vline(0, { color: 'red' }); [3, -3].forEach((y) => G.point(0, y, { color: 'red', r: 6 })); },
    Dans: (el) => { const G = ex2Graph(el, 200, { fontSize: 14 }); EX2.D.draw(G, { color: 'ink', width: 3 }); G.vline(1.6, { color: 'red' }); [2, -2].forEach((y) => G.point(1.6, y, { color: 'red', r: 6 })); },
    Aans: (el) => { const G = ex2Graph(el, 190, { fontSize: 14 }); EX2.A.draw(G, { color: 'ink', width: 3 }); [1, -1, 2].forEach((x) => G.vline(x, { color: 'red', width: 2 })); },
    Bans: (el) => { const G = ex2Graph(el, 190, { fontSize: 14 }); EX2.B.draw(G, { color: 'ink', width: 3 }); [1.5, -2].forEach((x) => G.vline(x, { color: 'red', width: 2 })); },
    map3c: (el) => new MappingDiagram(el, { width: 300, height: 190, domain: ['D', 'E', 'F'], range: ['X', 'Y'], pairs: [['D', 'X'], ['E', 'Y'], ['F', 'Y']], tex: false, titles: null, color: COLORS.ink }),
    gr3d: (el) => { const G = new Graph(el, { width: 300, height: 230, xmin: 0, xmax: 6, ymin: 0, ymax: 5, fontSize: 15 }); [[1, 3], [2, 1], [4, 4], [5, 2]].forEach((p) => G.point(p[0], p[1], { color: 'ink', r: 6 })); },
    gr3f: (el) => { const G = new Graph(el, { width: 300, height: 230, xmin: -4, xmax: 4, ymin: -3, ymax: 3, fontSize: 15 }); G.polyline(BLOB, { closed: true, color: 'ink', width: 3 }); },
    gr3fans: (el) => { const G = new Graph(el, { width: 220, height: 170, xmin: -4, xmax: 4, ymin: -3, ymax: 3, fontSize: 13, numbers: false }); G.polyline(BLOB, { closed: true, color: 'ink', width: 3 }); G.vline(0, { color: 'red' }); crossX(BLOB, 0).forEach((y) => G.point(0, y, { color: 'red', r: 6 })); }
  };
  document.querySelectorAll('[data-fig]').forEach((el) => { const f = F[el.dataset.fig]; if (f && !el.dataset.done) { el.dataset.done = '1'; f(el); } });
}

/* ======================= warm-up: the class of 30 ======================= */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const dayName = (n) => { let m = 0; while (n >= MDAYS[m]) { n -= MDAYS[m]; m++; } return MONTHS[m] + ' ' + (n + 1); };
function mountWarmup() {
  const map = document.getElementById('wu-map');
  const mw = map ? Math.min(400, (map.clientWidth || 408) - 8) : 400; // CSS sets the box width (smaller on one-screen pages)
  if (map) new MappingDiagram(map, { width: mw, height: Math.round(mw * 330 / 400), domain: PEOPLE, range: DATES, pairs: PEOPLE.map((p, i) => [p, DATES[BDAY[i]]]), titles: ['Person', 'Birthday'], tex: false, color: COLORS.red });
  const svg = document.getElementById('wu-faces'), out = document.getElementById('wu-out'); if (!svg || !out) return;
  const HATS = ['#5a96d2', '#3ca05a', '#965ab4', '#e68228'], faces = [];
  for (let r = 0; r < 3; r++) for (let cI = 0; cI < 10; cI++) {
    const i = r * 10 + cI, x = 26 + cI * 52, y = 56 + r * 80, g = svgEl('g', { class: 'u5l5-face' }, svg);
    svgEl('circle', { cx: x, cy: y, r: 23, class: 'u5l5-ring', fill: 'none' }, g);
    svgEl('circle', { cx: x, cy: y, r: 17, fill: '#ffecb3', stroke: '#1e2d46', 'stroke-width': 1.6 }, g);
    svgEl('path', { d: `M${x - 12} ${y - 12}L${x + 12} ${y - 12}L${x + 1} ${y - 42}Z`, fill: HATS[(i + r) % 4], stroke: '#1e2d46', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g);
    svgEl('circle', { cx: x + 1, cy: y - 43, r: 3.6, fill: '#d23c32' }, g);
    svgEl('circle', { cx: x - 6, cy: y - 2, r: 2, fill: '#1e2d46' }, g); svgEl('circle', { cx: x + 6, cy: y - 2, r: 2, fill: '#1e2d46' }, g);
    svgEl('path', { d: `M${x - 7} ${y + 5}Q${x} ${y + 11} ${x + 7} ${y + 5}`, fill: 'none', stroke: '#1e2d46', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
    const tag = svgEl('text', { x, y: y + 33, 'text-anchor': 'middle', class: 'u5l5-ftag' }, g);
    faces.push({ g, tag });
  }
  let tries = 0, hits = 0;
  const deal = () => { const b = Array.from({ length: 30 }, () => Math.floor(Math.random() * 365)); const seen = {}; b.forEach((d, i) => (seen[d] = (seen[d] || []).concat(i))); return { b, groups: Object.entries(seen).filter(([, v]) => v.length > 1) }; };
  const tally = () => (tries ? `<span class="u5l5-tally">Classes tried: <b>${tries}</b> · with a match: <b>${hits}</b> (${Math.round(100 * hits / tries)}%)</span>` : '');
  const clear = () => faces.forEach((f) => { f.g.classList.remove('hit'); f.tag.textContent = ''; });
  document.querySelectorAll('[data-wu]').forEach((btn) => btn.addEventListener('click', () => {
    const k = btn.dataset.wu; clear();
    if (k === 'reset') { tries = hits = 0; out.innerHTML = 'Deal random birthdays to the class. Does anyone match?'; return; }
    if (k === 'many') { for (let n = 0; n < 100; n++) { tries++; if (deal().groups.length) hits++; } out.innerHTML = tally(); return; }
    const { groups } = deal(); tries++; if (groups.length) hits++;
    groups.forEach(([d, idx], gi) => idx.forEach((i) => { faces[i].g.classList.add('hit'); faces[i].tag.textContent = String.fromCharCode(65 + gi); }));
    out.innerHTML = (groups.length ? `<b>Match!</b> ${groups.map(([d, idx], gi) => `${String.fromCharCode(65 + gi)}: ${dayName(+d)} (${idx.length} people)`).join(' · ')}` : '<b>No match</b> this time.') + '<br>' + tally();
  }));
}

/* ======================= mount ======================= */
mountFigures();
mountWarmup();
export const explainers = mountExplainers({ birthday, twoRel, nested, threeViews, whyVertical, vlt, sixWays, sixForms });

/* ============ Stand Up Break! — function or not? (lessons/js/standup.js) ============ */
/* ---- Stand Up Break figures: a coordinate grid drawn from the generated numbers (big labels for the projector) ---- */
const SU_INK = '#1c2230', SU_GRID = '#d3d8df', SU_C = '#1f5aa8';
const suF = (v) => +v.toFixed(1);
const suNum = (v) => String(v).replace('-', '−');
function suPlane(o, draw, label) { // o: { x0, x1, y0, y1, lab: label every lab units, xl, yl }; draw(X, Y, u) → SVG
  const u = o.u || Math.max(18, Math.min(32, Math.floor(340 / Math.max(o.x1 - o.x0, o.y1 - o.y0)))), p = 16, lab = o.lab || 2;
  const W = (o.x1 - o.x0) * u + 2 * p, H = (o.y1 - o.y0) * u + 2 * p;
  const X = (x) => suF(p + (x - o.x0) * u), Y = (y) => suF(p + (o.y1 - y) * u);
  const ax = Math.min(Math.max(0, o.y0), o.y1), ay = Math.min(Math.max(0, o.x0), o.x1); // where the axes sit
  let s = `<rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="#fff"/>`;
  for (let x = Math.ceil(o.x0); x <= o.x1; x++) s += `<line x1="${X(x)}" y1="${Y(o.y0)}" x2="${X(x)}" y2="${Y(o.y1)}" stroke="${SU_GRID}" stroke-width="1"/>`;
  for (let y = Math.ceil(o.y0); y <= o.y1; y++) s += `<line x1="${X(o.x0)}" y1="${Y(y)}" x2="${X(o.x1)}" y2="${Y(y)}" stroke="${SU_GRID}" stroke-width="1"/>`;
  s += `<g stroke="${SU_INK}" stroke-width="2" fill="${SU_INK}"><line x1="${X(o.x0)}" y1="${Y(ax)}" x2="${X(o.x1)}" y2="${Y(ax)}"/><line x1="${X(ay)}" y1="${Y(o.y0)}" x2="${X(ay)}" y2="${Y(o.y1)}"/>` +
    `<path d="M${X(o.x1)} ${Y(ax)}l-9 -5v10z M${X(ay)} ${Y(o.y1)}l-5 9h10z" stroke="none"/></g>`;
  const halo = 'paint-order="stroke" stroke="#fff" stroke-width="4" stroke-linejoin="round"';
  for (let x = Math.ceil(o.x0 / lab) * lab; x < o.x1; x += lab) if (x !== ay && x > o.x0) s += `<text x="${X(x)}" y="${Y(ax) + 23}" text-anchor="middle" ${halo}>${suNum(x)}</text>`;
  for (let y = Math.ceil(o.y0 / lab) * lab; y < o.y1; y += lab) if (y !== ax && y > o.y0) s += `<text x="${X(ay) - 7}" y="${Y(y) + 7}" text-anchor="end" ${halo}>${suNum(y)}</text>`;
  s += `<text x="${X(o.x1) - 4}" y="${Y(ax) - 9}" text-anchor="end" font-style="italic" font-size="22" ${halo}>${o.xl || 'x'}</text>` +
    `<text x="${X(ay) + 9}" y="${Y(o.y1) + 15}" font-style="italic" font-size="22" ${halo}>${o.yl || 'y'}</text>`;
  s += draw(X, Y, u);
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="${label || 'graph'}" font-family="KaTeX_Main, 'Times New Roman', serif" font-size="21" fill="${SU_INK}">${s}</svg>`;
}
const suDot = (X, Y, x, y, hollow) => `<circle cx="${X(x)}" cy="${Y(y)}" r="5.5" fill="${hollow ? '#fff' : SU_C}" stroke="${SU_C}" stroke-width="2.6"/>`;
function suArrowHead(X, Y, x, y, dx, dy) { // a filled arrowhead at (x, y) pointing along (dx, dy) (graph units)
  const px = dx * (X(1) - X(0)), py = dy * (Y(1) - Y(0)), L = Math.hypot(px, py) || 1, ux = px / L, uy = py / L, tx = X(x), ty = Y(y);
  const bx = tx - 14 * ux, by = ty - 14 * uy;
  return `<path d="M${suF(tx)} ${suF(ty)}L${suF(bx - 6.5 * uy)} ${suF(by + 6.5 * ux)}L${suF(bx + 6.5 * uy)} ${suF(by - 6.5 * ux)}Z" fill="${SU_C}"/>`;
}
const suPath = (X, Y, pts) => `<polyline points="${pts.map(([x, y]) => X(x) + ',' + Y(y)).join(' ')}" fill="none" stroke="${SU_C}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>`;
function suArrowFig(L, R, links, nl, nr, back) { // arrow diagram: values L (left oval), R (right oval); links [i, j]; back: arrows point right → left
  const n = Math.max(L.length, R.length), gap = 46, H = 70 + gap * n, cy = 46 + gap * n / 2, xl = 95, xr = 315, ink = '#1c2230', c = '#1f5aa8';
  const yAt = (k, m) => cy + (k - (m - 1) / 2) * gap;
  let s = `<rect x="0" y="0" width="410" height="${H}" rx="10" fill="#fff"/>`;
  [[xl, L, nl], [xr, R, nr]].forEach(([x, vals, nm]) => {
    s += `<ellipse cx="${x}" cy="${cy}" rx="58" ry="${gap * n / 2 + 16}" fill="#f3efe7" stroke="${ink}" stroke-width="2"/>`;
    s += `<text x="${x}" y="24" text-anchor="middle" font-style="italic" font-size="24">${nm}</text>`;
    vals.forEach((v, k) => { s += `<text x="${x}" y="${yAt(k, vals.length) + 8}" text-anchor="middle" font-size="23">${String(v).replace('-', '−')}</text>`; });
  });
  links.forEach(([i, j]) => {
    let x1 = xl + 30, y1 = yAt(i, L.length), x2 = xr - 30, y2 = yAt(j, R.length);
    if (back) [x1, y1, x2, y2] = [x2, y2, x1, y1];
    const L2 = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L2, uy = (y2 - y1) / L2, bx = x2 - 13 * ux, by = y2 - 13 * uy;
    s += `<line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" stroke="${c}" stroke-width="2.6"/><path d="M${x2} ${y2}L${(bx - 6 * uy).toFixed(1)} ${(by + 6 * ux).toFixed(1)}L${(bx + 6 * uy).toFixed(1)} ${(by - 6 * ux).toFixed(1)}Z" fill="${c}"/>`;
  });
  return `<svg viewBox="0 0 410 ${H}" width="410" role="img" aria-label="arrow diagram" font-family="KaTeX_Main, 'Times New Roman', serif" fill="${ink}">${s}</svg>`;
}
function suCurve(X, Y, pts, arrows) { // a sampled curve; arrowheads at both ends when it runs off the grid
  let s = suPath(X, Y, pts);
  if (arrows) {
    const n = pts.length - 1, a = pts[0], b = pts[3], c = pts[n], d = pts[n - 3];
    s += suArrowHead(X, Y, a[0], a[1], a[0] - b[0], a[1] - b[1]) + suArrowHead(X, Y, c[0], c[1], c[0] - d[0], c[1] - d[1]);
  }
  return s;
}
function suSample(f, t0, t1, keep) { // points f(t) for t in [t0, t1], the first unbroken run that stays on the grid
  const out = []; let started = false;
  for (let t = t0; t <= t1 + 1e-9; t += 0.05) { const p = f(t); if (keep(p)) { out.push(p); started = true; } else if (started) break; }
  return out;
}
const suIn = (p) => Math.abs(p[0]) <= 5.6 && Math.abs(p[1]) <= 5.6;
const suP = (x, y) => `(${x},\\ ${y})`;
standup('u5l5', {
  intro: 'Decide at your whiteboard station: is the relation a function? Justify it: name an input with two outputs, or explain why there isn’t one.',
  levels: {
    BEG: (r) => { // a list of ordered pairs
      const n = r.int(5, 6), xs = r.shuffle([...Array(16)].map((_, i) => i - 6)).slice(0, n), ys = xs.map(() => r.int(-5, 12)), isF = r.chance(0.5);
      let pairs = xs.map((x, i) => [x, ys[i]]), j = -1, y2 = 0;
      if (isF) { if (r.chance(0.6)) pairs[r.int(1, n - 1)][1] = pairs[0][1]; } // a repeated output is fine
      else { j = r.int(0, n - 1); do { y2 = r.int(-5, 12); } while (y2 === pairs[j][1]); pairs.splice(r.int(0, n), 0, [xs[j], y2]); pairs = pairs.slice(); }
      const outs = pairs.map((p) => p[1]), rep = outs.find((y, i) => outs.indexOf(y) !== i);
      return { text: 'Is this relation a function? Justify your answer.', q: pairs.map((p) => suP(p[0], p[1])).join(',\\ '),
        a: isF ? [`\\text{No input repeats: each has one output}`, rep != null ? `\\text{(the output ${rep} repeats: that is allowed)}` : '', `\\textbf{Function}`]
          : [`\\text{The input } {${xs[j]}} \\text{ has two outputs: } ${suP(xs[j], ys[j])},\\ ${suP(xs[j], y2)}`, `\\textbf{Not a function}`] };
    },
    PRG: (r) => {
      const isF = r.chance(0.5);
      if (r.chance(0.5)) { // an arrow diagram
        const nl = r.int(3, 4), nr = r.int(2, nl), pool = r.shuffle([...Array(24)].map((_, i) => i - 4)), Lv = pool.slice(0, nl).sort((a, b) => a - b), Rv = pool.slice(nl, nl + nr).sort((a, b) => a - b);
        let links, j = -1;
        do { links = Lv.map((_, i) => [i, r.int(0, nr - 1)]); if (!isF) { j = r.int(0, nl - 1); links.push([j, (links[j][1] + r.int(1, nr - 1)) % nr]); } }
        while (Rv.some((_, k) => !links.some((l) => l[1] === k)));
        const two = links.filter((l) => l[0] === j).map((l) => Rv[l[1]]).sort((a, b) => a - b);
        return { q: '', text: 'Is this relation a function? Justify your answer.', fig: suArrowFig(Lv, Rv, links, 'x', 'y', false),
          a: isF ? [`\\text{Each input has exactly one arrow leaving it}`, `\\textbf{Function}`] : [`${Lv[j]} \\text{ has two arrows: to } {${two[0]}} \\text{ and } {${two[1]}}`, `\\textbf{Not a function}`] };
      }
      // separate points on a grid
      const n = r.int(5, 6), xs = r.shuffle([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]).slice(0, n), pts = xs.map((x) => [x, r.int(-5, 5)]);
      let j = -1, y2 = 0;
      if (!isF) { j = r.int(0, n - 1); do { y2 = r.int(-5, 5); } while (Math.abs(y2 - pts[j][1]) < 2); pts.push([xs[j], y2]); }
      return { q: '', text: 'Is the relation graphed below a function? Justify your answer.',
        fig: suPlane({ x0: -6, x1: 6, y0: -6, y1: 6 }, (X, Y) => pts.map((p) => suDot(X, Y, p[0], p[1])).join(''), 'separate points'),
        a: isF ? [`\\text{Every vertical line meets at most one point}`, `\\textbf{Function}`] : [`\\text{The line } x=${xs[j]} \\text{ meets } ${suP(xs[j], Math.max(y2, pts[j][1]))} \\text{ and } ${suP(xs[j], Math.min(y2, pts[j][1]))}`, `\\textbf{Not a function}`] };
    },
    MAS: (r) => { // a curve: if it isn't a function, write two ordered pairs that prove it
      const kind = r.pick(['circle', 'circle', 'side', 'side', 'sideV', 'para', 'para', 'vee', 'semi']), h = r.int(-2, 2), k = r.int(-2, 2);
      const text = 'Is the relation graphed below a function? If it is not, write two ordered pairs from the graph that prove it.';
      const grid = (draw) => suPlane({ x0: -6, x1: 6, y0: -6, y1: 6 }, draw, 'graph of a relation');
      const yes = [`\\text{Every vertical line crosses at most once}`, `\\textbf{Function}`];
      if (kind === 'circle' || kind === 'semi') {
        const rr = r.int(2, 3), up = r.chance(0.5), pts = [];
        for (let t = 0; t <= (kind === 'semi' ? Math.PI : 2 * Math.PI) + 1e-9; t += Math.PI / 60) pts.push([h + rr * Math.cos(t), k + (up ? 1 : -1) * rr * Math.sin(t)]);
        if (kind === 'semi') return { q: '', text, fig: grid((X, Y) => suPath(X, Y, pts) + suDot(X, Y, h - rr, k) + suDot(X, Y, h + rr, k)), a: yes };
        return { q: '', text, fig: grid((X, Y) => suPath(X, Y, pts)), a: [`\\text{The line } x=${h} \\text{ crosses twice: } ${suP(h, k + rr)},\\ ${suP(h, k - rr)}`, `\\textbf{Not a function}`] };
      }
      if (kind === 'side' || kind === 'sideV') { // opens left or right: x = ±(y − k)² + h, or x = ±|y − k| + h
        const a = r.sign(), f = kind === 'side' ? (t) => [h + a * (t - k) ** 2, t] : (t) => [h + a * 1.5 * Math.abs(t - k), t];
        const d = kind === 'side' ? 1 : 2, xd = kind === 'side' ? h + a : h + a * 3;
        const pts = suSample(f, k - 6, k + 6, suIn);
        return { q: '', text, fig: grid((X, Y) => suCurve(X, Y, pts, true)), a: [`\\text{The line } x=${xd} \\text{ crosses twice: } ${suP(xd, k + d)},\\ ${suP(xd, k - d)}`, `\\textbf{Not a function}`] };
      }
      const a = r.pick([1, -1, 0.5, -0.5]), m = r.pick([-2, -1, -0.5, 0.5, 1, 2]);
      const f = kind === 'para' ? (t) => [t, k + a * (t - h) ** 2] : kind === 'vee' ? (t) => [t, k + 2 * a * Math.abs(t - h)] : (t) => [t, k + m * (t - h)];
      const pts = suSample(f, -6, 6, suIn);
      return { q: '', text, fig: grid((X, Y) => suCurve(X, Y, pts, true)), a: yes };
    }
  }
});
