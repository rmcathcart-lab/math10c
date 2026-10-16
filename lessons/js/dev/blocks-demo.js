/* Demo + test bed for js/blocks.js (lessons/dev/blocks.html). Every block statically and inside explainers. */
import {
  h, tex, add, box, Graph, NumberLine, ValueTable, MappingDiagram, Flowchart, RightTriangle, stamp, stampIn, checkCard,
  mountExplainers, pop, fadeIn, sleep, pairTex, texNum, svgEl, liveCtx
} from '../blocks.js';

const T = (s) => tex(s);
const panel = (stage, x, y, w, hh, title) => { const p = add(stage, box(h('div', 'demo-panel', title ? `<div class="demo-ph">${title}</div>` : ''), w, hh), x, y); return p; };
const line = (p, html, cls = '') => { const d = h('div', 'demo-line ' + cls, html); p.appendChild(d); return d; };

/* ================= static figures ================= */
function mountStatic() {
  const host = document.getElementById('static-graphs'); if (!host) return;
  // 1. a segment with its domain and range shadows
  const G = new Graph(host, { width: 380, height: 380, xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
  G.segment([-4, -2], [3, 4], { closedA: true, openB: true, color: 'teal' });
  G.shadeX(-4, 3, { openB: true });
  G.shadeY(-2, 4, { openB: true });
  G.point(-4, -2, { coords: true, pos: 'sw', color: 'teal' });
  G.label(3, 4, T('(3,\\ 4)'), { pos: 'e', cls: 'bk-ptlab' });
  // 2. calculator look: two graphs, an intersection and its readout
  const C = new Graph(host, { width: 420, height: 280, theme: 'calc', xmin: -4, xmax: 6, ymin: -5, ymax: 8 });
  const f = (x) => x * x - 2 * x - 3, g = (x) => x + 1;
  C.fn(f); C.fn(g, { color: 'red' });
  const r = C.intersect(f, g, 4); C.point(r.x, r.y, { color: 'ink', r: 5 });
  C.readout('Intersection', r);
  // custom drawing on a layer: a shaded strip under y = x + 1 between the roots
  const [x0, y0] = C.toPx(-1, 0), [x1] = C.toPx(4, 0), [, yt] = C.toPx(0, 5);
  svgEl('rect', { x: x0, y: yt, width: x1 - x0, height: y0 - yt, fill: '#1f5bd6', 'fill-opacity': 0.06 }, C.layers.bg);

  const more = document.getElementById('static-more');
  const M = new MappingDiagram(more, { width: 300, height: 230, domain: [1, 2, 3], range: [4, 5], pairs: [[1, 4], [2, 5], [3, 5]] });
  void M;
  const tb = new ValueTable(more, { headers: ['x', 'y=x^2'], rows: [[-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4]], hide: 1, cellW: 92, cellH: 44 });
  void tb;
  const tri = new RightTriangle(more, { width: 280, height: 220, base: 4, rise: 3, sides: { a: '3', b: '4', c: '5' }, angles: { A: '\\theta' } });
  void tri;
  const sbox = h('div', '', ''); sbox.style.cssText = 'display:flex;flex-direction:column;gap:18px;align-items:flex-start;padding-top:10px';
  more.appendChild(sbox);
  stamp(sbox, 'Function', { ok: true }); stamp(sbox, 'Not a function', { ok: false, rotate: 4 }); stamp(sbox, 'Fully factored', { ok: null, size: 'sm' });
  checkCard(more, { at: 'x=2', left: { tex: '(2x+3)(x-1)', sub: '(7)(1)', f: ({ x }) => (2 * x + 3) * (x - 1) }, right: { tex: '2x^2+x-3', sub: '8+2-3', f: ({ x }) => 2 * x * x + x - 3 }, values: { x: 2 }, width: 330 });
}

/* ================= tap to plot ================= */
function mountInteractive() {
  const host = document.getElementById('ix-graph'); if (!host) return;
  const out = document.getElementById('ix-pts');
  const G = new Graph(host, { width: 400, height: 400, xmin: -5, xmax: 5, ymin: -5, ymax: 5, interactive: { snap: 1, coords: true, onChange: (pts) => { out.innerHTML = pts.length ? pts.map((p) => T(pairTex(p[0], p[1]))).join(', ') : 'No points yet.'; } } });
  document.getElementById('ix-clear').addEventListener('click', () => { G.clear(); out.textContent = 'No points yet.'; });
}

/* ================= explainer: domain and range ================= */
const DOM = {
  seg: { name: 'segment', draw: (G) => G.segment([-6, -2], [4, 5], { closedA: true, openB: true }), x: [-6, 4, false, true], y: [-2, 5, false, true],
    d: '\\{x\\mid -6\\le x<4,\\ x\\in\\mathbb{R}\\}', r: '\\{y\\mid -2\\le y<5,\\ y\\in\\mathbb{R}\\}', di: '[-6,\\ 4)', ri: '[-2,\\ 5)' },
  para: { name: 'parabola piece', draw: (G) => G.fn((x) => (x - 1) ** 2 - 4, { from: -2, to: 4, ends: ['closed', 'closed'], color: 'purple' }), x: [-2, 4], y: [-4, 5],
    d: '\\{x\\mid -2\\le x\\le 4,\\ x\\in\\mathbb{R}\\}', r: '\\{y\\mid -4\\le y\\le 5,\\ y\\in\\mathbb{R}\\}', di: '[-2,\\ 4]', ri: '[-4,\\ 5]', low: [1, -4] },
  ray: { name: 'ray', draw: (G) => G.ray([-3, 1], [0, 4]), x: [-3, Infinity], y: [1, Infinity],
    d: '\\{x\\mid x\\ge -3,\\ x\\in\\mathbb{R}\\}', r: '\\{y\\mid y\\ge 1,\\ y\\in\\mathbb{R}\\}', di: '[-3,\\ \\infty)', ri: '[1,\\ \\infty)' }
};
const domain = {
  title: 'Domain and range from a graph',
  height: 470,
  choices: Object.keys(DOM).map((k) => ({ v: k, label: DOM[k].name })),
  intro: (k) => `Find the <b>domain</b> and <b>range</b> of this ${DOM[k].name}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = DOM[k], G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -8, xmax: 8, ymin: -8, ymax: 8 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'Write it down');
    let curve;
    return [
      { cap: `Here is the graph. A <b>closed</b> dot is included; an <b>open</b> dot is not; an <b>arrow</b> keeps going.`, run: async (c) => { curve = d.draw(G); await G.drawIn(curve, 900, c); } },
      { cap: `<b>Domain:</b> squash the graph flat onto the ${T('x')}-axis. Its shadow runs from ${T(texNum(d.x[0]))} ${Number.isFinite(d.x[1]) ? 'to ' + T(texNum(d.x[1])) : 'forever to the right'}.`,
        run: async (c) => { const s = G.shadeX(d.x[0], d.x[1], { openA: d.x[2], openB: d.x[3], band: true }); await G.drawIn(s, 800, c); } },
      { cap: `Write the domain in set notation (or interval notation).`, run: async (c) => { const a = line(P, `<b>Domain</b> ${T(d.d)}`, 'dom'), b = line(P, `<span class="muted">or</span> ${T(d.di)}`, 'dom'); await fadeIn(c, a); await fadeIn(c, b); } },
      { cap: `<b>Range:</b> squash it flat onto the ${T('y')}-axis.` + (d.low ? ` The lowest point is the vertex ${T(pairTex(d.low[0], d.low[1]))}, so the range starts at ${T(texNum(d.low[1]))}.` : ''),
        run: async (c) => { if (d.low) await G.reveal(G.point(d.low[0], d.low[1], { coords: true, pos: 'se', color: 'purple' }), c); const s = G.shadeY(d.y[0], d.y[1], { openA: d.y[2], openB: d.y[3], band: true }); await G.drawIn(s, 800, c); } },
      { cap: `Write the range the same way. <b>Domain: x-values. Range: y-values.</b>`, run: async (c) => { const a = line(P, `<b>Range</b> ${T(d.r)}`, 'ran'), b = line(P, `<span class="muted">or</span> ${T(d.ri)}`, 'ran'); await fadeIn(c, a); await fadeIn(c, b); } }
    ];
  }
};

/* ================= explainer: vertical line test ================= */
const VL = {
  para: { name: T('y=\\tfrac12x^2-3'), draw: (G) => [G.fn((x) => x * x / 2 - 3)], hits: (x) => [x * x / 2 - 3] },
  circle: { name: T('x^2+y^2=25'), draw: (G) => [G.fn((x) => Math.sqrt(25 - x * x), { from: -5, to: 5, arrows: false }), G.fn((x) => -Math.sqrt(25 - x * x), { from: -5, to: 5, arrows: false })], hits: (x) => (x * x > 25 ? [] : [Math.sqrt(25 - x * x), -Math.sqrt(25 - x * x)]) },
  side: { name: T('x=y^2-4'), draw: (G) => [G.fn((x) => Math.sqrt(x + 4), { from: -4, color: 'red' }), G.fn((x) => -Math.sqrt(x + 4), { from: -4, color: 'red' })], hits: (x) => (x < -4 ? [] : [Math.sqrt(x + 4), -Math.sqrt(x + 4)]) },
  pts: { name: 'points', pts: [[-6, 1], [-3, 4], [-1, -2], [2, -5], [2, 3], [5, 0]], draw: (G) => VL.pts.pts.map((p) => G.point(p[0], p[1], { r: 7 })) }
};
const vlt = {
  title: 'The vertical line test',
  height: 470,
  choices: Object.keys(VL).map((k) => ({ v: k, label: VL[k].name })),
  intro: () => 'A graph is a <b>function</b> if <b>no vertical line</b> crosses it more than once. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = VL[k], G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -8, xmax: 8, ymin: -8, ymax: 8 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'Verdict');
    let res;
    return [
      { cap: `Draw the relation.`, run: async (c) => { const els = d.draw(G); await Promise.all(els.map((e) => G.reveal(e, c))); } },
      { cap: `Slide a <b>vertical line</b> across from left to right and watch how many times it crosses the graph…`,
        run: async (c) => { res = await G.vlineTest(c, d.pts ? { points: d.pts } : { hits: d.hits }); } },
      { cap: () => (res && res.fail ? `At ${T('x=' + texNum(res.fail.x))} the line crosses <b>${res.fail.ys.length} times</b>: one input, more than one output. <b>Not a function.</b>` : `The line never crosses more than once: every input has one output. <b>A function.</b>`),
        run: async (c) => {
          const bad = !!(res && res.fail);
          line(P, bad ? `One ${T('x')}, outputs ${res.fail.ys.map((y) => T(texNum(y))).join(' and ')}` : 'Every vertical line crosses <b>at most once</b>.');
          const s = stamp(P, bad ? 'Not a function' : 'Function', { ok: !bad, size: 'lg' }); s.style.alignSelf = 'center'; s.style.marginTop = '30px';
          await stampIn(c, s);
        } }
    ];
  }
};

/* ================= explainer: table → points → line ================= */
const TB = {
  lin: { name: T('y=2x+1'), f: (x) => 2 * x + 1, tex: 'y=2x+1', linear: true },
  dec: { name: T('y=-x+3'), f: (x) => -x + 3, tex: 'y=-x+3', linear: true },
  sq: { name: T('y=x^2-3'), f: (x) => x * x - 3, tex: 'y=x^2-3', linear: false }
};
const table = {
  title: 'Table of values → points → graph',
  height: 460,
  choices: Object.keys(TB).map((k) => ({ v: k, label: TB[k].name })),
  intro: (k) => `Make a table of values for ${T(TB[k].tex)}, plot the points, and join them. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = TB[k], xs = [-2, -1, 0, 1, 2];
    const tb = new ValueTable(stage, { x: 30, y: 60, headers: ['x', 'y'], rows: xs.map((x) => [x, d.f(x)]), hide: 1, tap: false, cellW: 86, cellH: 54, diffs: true, diffSpace: 100 });
    add(stage, h('div', 'bk-tag', T(d.tex)), 40, 18).style.fontSize = '24px';
    const G = new Graph(stage, { x: ex.W - 444, y: 10, width: 430, height: 440, xmin: -4, xmax: 4, ymin: -6, ymax: 8, ystep: 1 });
    const pts = [];
    const ys = xs.map(d.f), ds = ys.slice(1).map((y, i) => y - ys[i]);
    return [
      { cap: `Substitute each ${T('x')} into ${T(d.tex)} to fill the ${T('y')} column.`, run: (c) => tb.fill(c, { col: 1 }) },
      { cap: () => `Look at how ${T('y')} changes each time ${T('x')} goes up by 1: ` + (d.linear ? `always <b>${(ds[0] > 0 ? '+' : '−') + Math.abs(ds[0])}</b>.` : '<b>the steps change</b>.'),
        run: (c) => tb.diffs(c, { col: 1 }) },
      { cap: `Each row is a point ${T('(x,\\ y)')}. Plot them one at a time.`,
        run: async (c) => { for (let i = 0; i < xs.length; i++) { tb.highlight(i, true); const p = G.point(xs[i], d.f(xs[i]), { color: 'blue', r: 7 }); pts.push(p); await G.reveal(p, c, 300); await sleep(c, 120); tb.highlight(i, false); } } },
      { cap: d.linear ? `Equal steps in ${T('y')} mean the points lie on a <b>straight line</b>. Join them, with arrows: the pattern keeps going.` : `The steps change, so the points lie on a <b>curve</b>, not a line. Join them smoothly.`,
        run: async (c) => { const L = d.linear ? G.line([xs[0], d.f(xs[0])], [xs[4], d.f(xs[4])], { color: 'blue' }) : G.fn(d.f, { color: 'blue' }); await G.drawIn(L, 900, c); G.label(2.1, d.f(2) + (d.linear ? -0.4 : 0), T(d.tex), { pos: 'e', color: 'blue', cls: 'bk-ptlab' }); } }
    ];
  }
};

/* ================= explainer: graphing calculator ================= */
const calc = {
  title: 'Graphing calculator: trace, zero, intersect, minimum',
  height: 420,
  intro: `Graph ${T('Y_1=x^2-2x-3')} and ${T('Y_2=x+1')} in the standard window. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const f = (x) => x * x - 2 * x - 3, g = (x) => x + 1;
    const G = new Graph(stage, { x: 24, y: 24, width: 540, height: 360, theme: 'calc', xmin: -10, xmax: 10, ymin: -10, ymax: 10 });
    const P = panel(stage, 600, 14, ex.W - 614, 390, 'Calculator results');
    // captions are computed before their step runs, so work the numbers out here
    const z1 = G.zero(f, -4, 1), z2 = G.zero(f, 1, 6), it = G.intersect(f, g, 4), mn = G.extremum(f, -4, 6);
    let tr;
    return [
      { cap: `<b>Y=</b> then <b>GRAPH</b>: ${T('Y_1')} is a parabola.`, run: async (c) => { await G.drawIn(G.fn(f), 900, c); } },
      { cap: `${T('Y_2=x+1')} is a line.`, run: async (c) => { await G.drawIn(G.fn(g, { color: 'red' }), 700, c); } },
      { cap: `<b>ZOOM</b> in to a better window: ${T('-4\\le x\\le 6')}, ${T('-5\\le y\\le 8')}.`, run: (c) => G.setWindow({ xmin: -4, xmax: 6, ymin: -5, ymax: 8 }, c, 900) },
      { cap: `<b>TRACE</b> along ${T('Y_1')}: the cursor shows each point's coordinates.`, run: async (c) => { tr = G.traceMarker(f, -2, { title: 'Y1=X²−2X−3' }); await pop(c, tr.el); await tr.move(c, 3, 1400); } },
      { cap: () => `<b>2nd CALC zero</b>: ${T('Y_1')} crosses the ${T('x')}-axis at ${T('x=' + texNum(z1))} and ${T('x=' + texNum(z2))}.`,
        run: async (c) => { tr.remove(); for (const z of [z1, z2]) { await G.reveal(G.point(z, 0, { color: 'ink', r: 6 }), c); G.readout('Zero', { x: z, y: 0 }); await sleep(c, 500); } line(P, `Zeros: ${T('x=' + texNum(z1))}, ${T('x=' + texNum(z2))}`); } },
      { cap: () => `<b>2nd CALC intersect</b> (guess near ${T('x=4')}): the graphs meet at ${T(pairTex(it.x, it.y))}.`,
        run: async (c) => { await G.reveal(G.point(it.x, it.y, { color: 'red', r: 6 }), c); G.readout('Intersection', it); line(P, `Intersection: ${T(pairTex(it.x, it.y))}`); } },
      { cap: () => `<b>2nd CALC minimum</b>: the vertex is ${T(pairTex(mn.x, mn.y))}.`,
        run: async (c) => { await G.reveal(G.point(mn.x, mn.y, { color: 'purple', r: 6 }), c); G.readout('Minimum', mn); line(P, `Minimum: ${T(pairTex(mn.x, mn.y))}`); } }
    ];
  }
};

/* ================= explainer: mapping diagram ================= */
const MP = {
  f: { name: T('\\{(1,4),(2,5),(3,5),(4,7)\\}'), d: [1, 2, 3, 4], r: [4, 5, 7], p: [[1, 4], [2, 5], [3, 5], [4, 7]] },
  n: { name: T('\\{(1,4),(1,6),(2,5),(3,7)\\}'), d: [1, 2, 3], r: [4, 5, 6, 7], p: [[1, 4], [1, 6], [2, 5], [3, 7]] }
};
const mapping = {
  title: 'Ordered pairs → mapping diagram',
  height: 360,
  choices: Object.keys(MP).map((k) => ({ v: k, label: MP[k].name })),
  intro: 'Draw a mapping diagram, then check: does any input have more than one arrow? Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = MP[k], M = new MappingDiagram(stage, { x: 20, y: 14, width: 460, height: 330, domain: d.d, range: d.r, pairs: d.p, arrows: false });
    const P = panel(stage, 510, 14, ex.W - 524, 330, 'Ordered pairs');
    const chips = d.p.map((q) => line(P, T(pairTex(q[0], q[1]))));
    chips.forEach((e) => (e.style.opacity = 0.35));
    const cnt = {}; d.p.forEach((q) => (cnt[q[0]] = (cnt[q[0]] || 0) + 1));
    const bad = Object.keys(cnt).filter((x) => cnt[x] > 1);
    return [
      { cap: `Inputs (first numbers) go in the <b>domain</b> oval, outputs in the <b>range</b> oval. Each pair becomes an arrow.`,
        run: async (c) => { for (let i = 0; i < d.p.length; i++) { chips[i].style.opacity = 1; await M.drawArrow(c, i); await sleep(c, 100); } } },
      { cap: () => (bad && bad.length ? `Input ${T(bad[0])} has <b>two arrows</b>: one input, two outputs.` : `Every input has exactly <b>one</b> arrow. (Two inputs sharing an output is fine.)`),
        run: async (c) => { await M.oneToMany(c); if (!bad.length) d.p.forEach((q) => M.highlight('d', q[0])); } },
      { cap: () => (bad.length ? '<b>Not a function.</b>' : '<b>A function.</b>'), run: async (c) => { const s = stamp(P, bad.length ? 'Not a function' : 'Function', { ok: !bad.length, size: 'lg' }); s.style.alignSelf = 'center'; s.style.marginTop = '20px'; await stampIn(c, s); } }
    ];
  }
};

/* ================= explainer: flowchart ================= */
const FN = {
  start: { x: 340, y: 40, w: 320, h: 54, html: '<b>Is the relation a function?</b>', cls: 'bk-round' },
  graph: { x: 115, y: 150, w: 190, h: 62, html: '<b>Graph</b>vertical line test', color: '#1f5bd6' },
  pairs: { x: 340, y: 150, w: 200, h: 62, html: '<b>Pairs / table</b>an <i>x</i> repeated?', color: '#c27a0e' },
  eqn: { x: 565, y: 150, w: 200, h: 62, html: '<b>Equation</b>one <i>y</i> for each <i>x</i>?', color: '#7b4fc4' },
  g1: { x: 60, y: 282, w: 104, h: 46, html: '<b>✓ yes</b>', color: '#12805a', cls: 'bk-round' }, g2: { x: 172, y: 282, w: 104, h: 46, html: '<b>✗ no</b>', color: '#c93a33', cls: 'bk-round' },
  p1: { x: 285, y: 282, w: 104, h: 46, html: '<b>✓ yes</b>', color: '#12805a', cls: 'bk-round' }, p2: { x: 397, y: 282, w: 104, h: 46, html: '<b>✗ no</b>', color: '#c93a33', cls: 'bk-round' },
  e1: { x: 510, y: 282, w: 104, h: 46, html: '<b>✓ yes</b>', color: '#12805a', cls: 'bk-round' }, e2: { x: 622, y: 282, w: 104, h: 46, html: '<b>✗ no</b>', color: '#c93a33', cls: 'bk-round' }
};
const FE = [
  { from: 'start', to: 'graph', label: 'graph' }, { from: 'start', to: 'pairs', label: 'pairs' }, { from: 'start', to: 'eqn', label: 'equation' },
  { from: 'graph', to: 'g1', label: 'once', route: 'vhv' }, { from: 'graph', to: 'g2', label: 'twice', route: 'vhv' },
  { from: 'pairs', to: 'p1', label: 'no', route: 'vhv' }, { from: 'pairs', to: 'p2', label: 'yes', route: 'vhv' },
  { from: 'eqn', to: 'e1', label: 'yes', route: 'vhv' }, { from: 'eqn', to: 'e2', label: 'no', route: 'vhv' }
];
const FP = {
  circle: { name: T('x^2+y^2=9') + ' (graph)', path: ['start', 'graph', 'g2'], caps: ['Start at the top.', 'It is given as a graph: use the <b>vertical line test</b>.', 'A vertical line crosses the circle <b>twice</b>: <b>not a function</b>.'] },
  pairs: { name: T('\\{(2,1),(3,1),(5,4)\\}'), path: ['start', 'pairs', 'p1'], caps: ['Start at the top.', 'Ordered pairs: is any <b>x</b> repeated with a different <b>y</b>?', 'No: 2, 3 and 5 are all different (a repeated <b>y</b> is fine). <b>Function.</b>'] },
  eqn: { name: T('y=x^2'), path: ['start', 'eqn', 'e1'], caps: ['Start at the top.', 'An equation: does each <b>x</b> give exactly one <b>y</b>?', `Yes: squaring gives one answer. ${T('y=x^2')} is a <b>function</b>.`] }
};
const flow = {
  title: 'Decision flowchart: is it a function?',
  height: 340,
  choices: Object.keys(FP).map((k) => ({ v: k, label: FP[k].name })),
  intro: (k) => `Follow the chart for ${FP[k].name}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = FP[k], F = new Flowchart(stage, { x: Math.max(0, (ex.W - 680) / 2), y: 4, width: 680, height: 330, nodes: FN, edges: FE });
    return d.path.map((id, i) => ({ cap: d.caps[i], run: async (c) => { if (i) await F.go(c, d.path[i - 1], id); await F.visit(c, id); } }));
  }
};

/* ================= explainer: number line hops ================= */
const HP = { a: { name: T('-3+5-4'), start: -3, moves: [5, -4] }, b: { name: T('2-6+3'), start: 2, moves: [-6, 3] } };
const hops = {
  title: 'Number line: hops and intervals',
  height: 300,
  choices: Object.keys(HP).map((k) => ({ v: k, label: HP[k].name })),
  intro: (k) => `Work out ${HP[k].name} with hops on a number line. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = HP[k], N = new NumberLine(stage, { x: 20, y: 10, width: ex.W - 40, height: 150, min: -8, max: 8 });
    const N2 = new NumberLine(stage, { x: 20, y: 170, width: ex.W - 40, height: 110, min: -8, max: 8, axisY: 56 });
    let pos = d.start;
    const steps = [{ cap: `Start at ${T(texNum(d.start))}.`, run: (c) => pop(c, N.point(d.start, { color: 'blue', label: 'start' })) }];
    d.moves.forEach((m) => steps.push({
      cap: `${m > 0 ? 'Add' : 'Subtract'} ${T(texNum(Math.abs(m)))}: hop ${Math.abs(m)} to the ${m > 0 ? 'right' : 'left'}.`,
      run: async (c) => { const a = pos; pos += m; await N.hop(c, a, pos, { label: (m > 0 ? '+' : '−') + Math.abs(m), below: m < 0 }); await pop(c, N.point(pos, { color: 'amber', r: 6 })); }
    }));
    steps.push({ cap: () => `The answer is ${T(texNum(pos))}.`, run: async (c) => { await pop(c, N.point(pos, { color: 'red', label: '<b>' + texNum(pos).replace('-', '−') + '</b>' })); } });
    steps.push({ cap: `Intervals use the same line: ${T('x\\ge -2')} (closed dot, arrow to the right)…`, run: (c) => N2.drawIn(N2.interval(-2, Infinity, { color: 'teal' }), 700, c) });
    steps.push({ cap: `…and ${T('x<-4')} (open dot, arrow to the left).`, run: (c) => N2.drawIn(N2.interval(-Infinity, -4, { color: 'purple', openB: true }), 700, c) });
    return steps;
  }
};

/* ================= explainer: right triangle ================= */
const trig = {
  title: 'Opposite, adjacent, hypotenuse',
  height: 340,
  intro: 'The names of the sides depend on <b>which angle</b> you stand at. Press <b>Next</b>.',
  make(stage, v, ex) {
    const R = new RightTriangle(stage, { x: 10, y: 0, width: 480, height: 340, pad: 92, base: 4, rise: 3, sides: { a: '3', b: '4', c: '5' } });
    const P = panel(stage, 500, 20, ex.W - 514, 300, 'From the angle');
    return [
      { cap: `A right triangle: the right angle is at ${T('C')}.`, run: (c) => pop(c, R.svg.querySelector('.bk-rmark'), 400) },
      { cap: `Stand at angle ${T('A')}.`, run: async (c) => { await fadeIn(c, R.angle('A', '\\theta')); } },
      { cap: `From ${T('A')}: the side <b>across</b> is <b>opposite</b>, the leg <b>touching</b> ${T('A')} is <b>adjacent</b>, the longest side is the <b>hypotenuse</b>.`,
        run: async (c) => { await R.highlight(c, 'A', { long: true }); line(P, `${T('\\sin A=\\frac{3}{5}')}`); } },
      { cap: `Now stand at ${T('B')}: opposite and adjacent <b>swap</b>. The hypotenuse never changes.`,
        run: async (c) => { R.arcs.A.remove(); R.arcs.A.label.remove(); await fadeIn(c, R.angle('B', '\\alpha', { color: 'blue' })); await R.highlight(c, 'B', { long: true }); line(P, `${T('\\sin B=\\frac{4}{5}')}`); } }
    ];
  }
};

/* ================= explainer: substitution check ================= */
const CK = {
  good: { name: 'correct expansion', right: { tex: '2x^2+x-3', sub: '8+2-3', f: ({ x }) => 2 * x * x + x - 3 } },
  bad: { name: 'a classic error', right: { tex: '2x^2-3', sub: '8-3', f: ({ x }) => 2 * x * x - 3 } }
};
const check = {
  title: 'Check an expansion by substituting',
  height: 300,
  choices: Object.keys(CK).map((k) => ({ v: k, label: CK[k].name })),
  intro: 'Substitute the same number into both sides. Equal values: the expansion is probably right. Press <b>Next</b>.',
  make(stage, k, ex) {
    const card = checkCard(stage, { at: 'x=2', left: { tex: '(2x+3)(x-1)', sub: '(7)(1)', f: ({ x }) => (2 * x + 3) * (x - 1) }, right: CK[k].right, values: { x: 2 }, x: 30, y: 16, width: 520, hidden: true });
    let s;
    return [
      { cap: `Left side with ${T('x=2')}, then right side.`, run: (c) => card.play(c) },
      { cap: () => (card.ok ? 'Both sides give <b>7</b>.' : 'The sides <b>disagree</b>: the expansion has an error (the middle term is missing).'),
        run: async (c) => { s = stamp(stage, card.ok ? '✓ checks out' : '✗ fix it', { ok: card.ok, x: 720, y: 140, size: 'lg' }); await stampIn(c, s); } }
    ];
  }
};

/* ================= mount ================= */
mountStatic();
mountInteractive();
export const explainers = mountExplainers({ domain, vlt, table, calc, mapping, flow, hops, trig, check });
export const _test = { liveCtx, DOM, VL };
