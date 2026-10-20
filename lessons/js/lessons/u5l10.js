/* Math 10C · Unit 5 · Lesson 10 — Relations and Functions Review: Domain, Range, and Function Notation.
 * Static figures (warm-up suspects, rules-at-a-glance minis, Example 3/8/10 graphs) and the explainers.
 * Colour code (whole page): x-axis things (inputs, domain, x-intercepts) amber; y-axis things (outputs, range,
 * y-intercepts) purple. The recap explainers reuse the unit's big pictures: shadows, the sweep, the machine,
 * forwards/backwards paths on a graph. */
import {
  h, tex, add, box, Graph, NumberLine, MappingDiagram, stamp, stampIn, mountExplainers, pop, fadeIn, sleep,
  pairTex, texNum, svgEl, anim, pulse
} from '../blocks.js';

const T = (s) => tex(s);
const AMB = '#c27a0e', PUR = '#7b4fc4';
const tn = (v) => texNum(v);
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u5l10-panel', title ? `<div class="u5l10-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u5l10-line ' + cls, html); p.appendChild(d); return d; };
const say = async (c, p, html, cls) => { const d = line(p, html, cls); await fadeIn(c, d); return d; };
const tag = (stage, html, x, y, cls = '') => add(stage, h('div', 'u5l10-tag ' + cls, html), x, y);
/** every y where a polyline (graph coordinates) is above/below x — for the vertical line test */
const polyHits = (pts) => (x) => {
  const ys = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    if (x1 === x2) continue;
    if (x >= Math.min(x1, x2) - 1e-9 && x <= Math.max(x1, x2) + 1e-9) ys.push(y1 + (y2 - y1) * (x - x1) / (x2 - x1));
  }
  return ys;
};
/** relation P of Example 3: x = ½y² − 2, as a parametric polyline with arrows at both ends */
const P_PTS = []; for (let i = 0; i <= 66; i++) { const t = -3.3 + i * 0.1; P_PTS.push([0.5 * t * t - 2, t]); }
const drawP = (G, o = {}) => G.polyline(P_PTS, Object.assign({ ends: ['arrow', 'arrow'], color: 'ink', width: 3.5 }, o));
const P_HITS = (x) => (x < -2 ? [] : [Math.sqrt(2 * (x + 2)), -Math.sqrt(2 * (x + 2))]);
const drawQ = (G, o = {}) => G.fn((x) => 0.5 * x * x - 1, Object.assign({ from: -3.2, to: 3.2, ends: ['arrow', 'arrow'], color: 'ink', width: 3.5 }, o));

/* =============================== warm-up suspects =============================== */
const SUS = {
  A: { pts: [[-4, -2], [0, 2], [4, -2], [1, -2]], ran: [-2, 2], yi: 2, fn: false, broke: 1 },
  B: { pts: [[-4, -3], [-2, 0], [0, 2], [2, 0], [4, -3]], ran: [-3, 2], yi: 2, fn: true, broke: 3 },
  C: { pts: [[-4, -2], [0, 2], [4, -2]], ran: [-2, 2], yi: 2, fn: true, broke: 0 },
  D: { pts: [[-4, -2], [-2, 0], [-1, 2], [0, 1], [1, 2], [2, 0], [4, -2]], ran: [-2, 2], yi: 1, fn: true, broke: 5 }
};
const drawSuspect = (G, k, o = {}) => G.polyline(SUS[k].pts, Object.assign({ ends: ['closed', 'closed'], color: 'red', width: 4 }, o));

/* =============================== static figures =============================== */
function mountStatic() {
  document.querySelectorAll('[data-suspect]').forEach((el) => {
    const G = new Graph(el, { width: 318, height: 232, xmin: -5, xmax: 5, ymin: -4, ymax: 3, xlabels: 2, ylabels: 2, fontSize: 15 });
    drawSuspect(G, el.dataset.suspect, { width: 3.5 });
  });
  // rules at a glance
  const mini = (host, o) => new Graph(host, Object.assign({ width: 160, height: 120, numbers: false, xtitle: '', ytitle: '', fontSize: 13 }, o));
  const minis = {
    disc(host) {
      [['counted', true], ['measured', false]].forEach(([cap, dots]) => {
        const w = h('div', ''); host.appendChild(w);
        const G = mini(w, { width: 120, height: 100, xmin: -0.5, xmax: 5, ymin: -0.5, ymax: 5 });
        if (dots) [1, 2, 3, 4].forEach((x) => G.point(x, x - 0.2, { color: 'blue', r: 5 }));
        else G.segment([0.5, 0.6], [4.6, 4.4], { color: 'blue', width: 3.5 });
        w.appendChild(h('div', 'u5l10-minicap', cap));
      });
    },
    io(host) {
      const G = mini(host, { width: 170, xmin: -1, xmax: 6, ymin: -1, ymax: 5 });
      G.guides(4, 3); G.point(4, 0, { color: AMB, r: 5 }); G.point(0, 3, { color: PUR, r: 5 });
      G.point(4, 3, { color: 'ink', r: 5.5, label: T(`(\\textcolor{${AMB}}{4},\\ \\textcolor{${PUR}}{3})`), pos: 'n' });
    },
    dr(host) {
      const G = mini(host, { width: 170, xmin: -4, xmax: 4, ymin: -2, ymax: 3 });
      G.segment([-3, -1], [3, 2], { closedA: true, openB: true, color: 'teal', width: 3.5 });
      G.shadeX(-3, 3, { openB: true, width: 7 }); G.shadeY(-1, 2, { openB: true, width: 7 });
    },
    int(host) {
      const G = mini(host, { width: 170, xmin: -2, xmax: 5, ymin: -2, ymax: 4 });
      G.line([0, 2], [3, 0], { color: 'teal', width: 3 });
      G.point(3, 0, { color: AMB, r: 5.5 }); G.point(0, 2, { color: PUR, r: 5.5 });
      G.label(3, 0, T('y=0'), { pos: 'ne', color: AMB, cls: 'bk-ptlab' }); G.label(0, 2, T('x=0'), { pos: 'ne', color: PUR, cls: 'bk-ptlab' });
    },
    vlt(host) {
      const G = mini(host, { width: 150, xmin: -3, xmax: 3, ymin: -2.6, ymax: 2.6 });
      const circ = []; for (let i = 0; i <= 72; i++) { const a = i / 72 * 2 * Math.PI; circ.push([2 * Math.cos(a), 2 * Math.sin(a)]); }
      G.polyline(circ, { closed: true, color: 'ink', width: 3 });
      G.vline(1, { color: 'red', width: 3, dash: false });
      G.point(1, Math.sqrt(3), { color: 'red', r: 5.5 }); G.point(1, -Math.sqrt(3), { color: 'red', r: 5.5 });
    },
    fn(host) {
      const G = mini(host, { width: 170, xmin: -1, xmax: 5, ymin: -1, ymax: 4 });
      G.line({ m: 0.5, b: 1 }, { color: 'teal', width: 3 });
      G.polyline([[2, 0], [2, 2], [0, 2]], { color: 'blue', width: 2.5, dash: '6 5', ends: [null, 'arrow'] });
      G.label(2, 0, T('a'), { pos: 's', color: AMB }); G.label(0, 2, T('f(a)'), { pos: 'nw', color: PUR, cls: 'bk-ptlab' });
    }
  };
  document.querySelectorAll('[data-mini]').forEach((el) => minis[el.dataset.mini](el));
  // Example 3: relations P and Q
  const pq = (id) => new Graph(document.getElementById(id), { width: 300, height: 300, xmin: -5, xmax: 5, ymin: -5, ymax: 5, xlabels: 2, ylabels: 2, fontSize: 15 });
  drawP(pq('u5l10-figP'), { width: 3 }); drawQ(pq('u5l10-figQ'), { width: 3 });
  // Example 8: six dots
  const G8 = new Graph(document.getElementById('u5l10-fig8'), { width: 370, height: 370, xmin: -7, xmax: 7, ymin: -7, ymax: 7, xlabels: 2, ylabels: 2, fontSize: 15 });
  DOTS8.forEach(([x, y]) => G8.point(x, y, { color: 'ink', r: 6.5 }));
  // Example 10: four diagrams
  document.querySelectorAll('[data-ex10]').forEach((el) => { const G = new Graph(el, Object.assign({ width: 200, height: 180, fontSize: 14 }, E10WIN)); E10[el.dataset.ex10].draw(G, { width: 3 }); });
}

/* =============================== explainer: wanted (warm-up) =============================== */
const CLUES = [
  'is a function',
  `domain ${T('\\{x\\mid -4\\le x\\le 4,\\ x\\in\\mathbb{R}\\}')}`,
  `range ${T('\\{y\\mid -2\\le y\\le 2,\\ y\\in\\mathbb{R}\\}')}`,
  `${T('x')}-intercepts ${T('-2')} and ${T('2')}`,
  `${T('y')}-intercept ${T('2')}`
];
const WHY = {
  A: 'it is <b>not a function</b>',
  B: `its range is ${T('-3\\le y\\le 2')}`,
  D: `its ${T('y')}-intercept is ${T('1')}`
};
const wanted = {
  title: 'Wanted: check every clue',
  height: 440,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: ['A', 'B', 'C', 'D'].map((k) => ({ v: k, label: 'Suspect ' + k })),
  intro: (k) => `Test suspect ${k} against the five clues on the poster, one at a time. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SUS[k];
    const G = new Graph(stage, { x: 8, y: 10, width: 540, height: 420, xmin: -5, xmax: 5, ymin: -4, ymax: 3 });
    const P = panel(stage, 566, 10, ex.W - 576, 420, 'Wanted poster');
    const rows = CLUES.map((cl) => { const r = h('div', 'u5l10-crow', `<i class="u5l10-mk">?</i><div>${cl}</div><div class="u5l10-got"></div>`); P.appendChild(r); return r; });
    const mark = async (c, i, ok, got) => { const r = rows[i]; r.classList.add(ok ? 'ok' : 'no'); r.querySelector('.u5l10-mk').textContent = ok ? '✓' : '✗'; r.querySelector('.u5l10-got').innerHTML = got; await pop(c, r.querySelector('.u5l10-mk')); };
    let vl;
    return [
      { cap: `Suspect ${k}. The closed dots are where the graph <b>stops</b>.`, run: (c) => G.drawIn(drawSuspect(G, k), 900, c) },
      { cap: `<b>Clue 1.</b> Sweep a vertical line across. Does it ever hit the graph <b>twice</b>?`,
        run: async (c) => {
          vl = await G.vlineTest(c, { hits: polyHits(d.pts), snap: k === 'A' ? 3 : 1 });
          await mark(c, 0, !vl.fail, vl.fail ? `twice at ${T('x=' + tn(vl.fail.x))}: ${vl.fail.ys.map((y) => T(pairTex(vl.fail.x, y))).join(' and ')}` : 'never twice: a function');
        } },
      { cap: `<b>Clue 2.</b> Domain: the shadow on the ${T('x')}-axis runs from ${T('-4')} to ${T('4')}.`,
        run: async (c) => { G.remove(vl.line, vl.dots); await G.drawIn(G.shadeX(-4, 4), 700, c); await mark(c, 1, true, `${T('-4\\le x\\le 4')}`); } },
      { cap: `<b>Clue 3.</b> Range: the shadow on the ${T('y')}-axis runs from ${T(tn(d.ran[0]))} to ${T(tn(d.ran[1]))}.` + (d.ran[0] !== -2 ? ` The ends sit at ${T('y=-3')}: one unit too low.` : ''),
        run: async (c) => { await G.drawIn(G.shadeY(d.ran[0], d.ran[1]), 700, c); await mark(c, 2, d.ran[0] === -2, `${T(`${tn(d.ran[0])}\\le y\\le ${tn(d.ran[1])}`)}`); } },
      { cap: `<b>Clue 4.</b> Where does it meet the ${T('x')}-axis? At ${T('x=-2')} and ${T('x=2')}.`,
        run: async (c) => { for (const x of [-2, 2]) await G.reveal(G.point(x, 0, { color: AMB, r: 8 }), c); await mark(c, 3, true, `${T('-2')} and ${T('2')}`); } },
      { cap: `<b>Clue 5.</b> Where does it meet the ${T('y')}-axis? At ${T('y=' + d.yi)}.`,
        run: async (c) => { await G.reveal(G.point(0, d.yi, { color: PUR, r: 8 }), c); await mark(c, 4, d.yi === 2, T(String(d.yi))); } },
      { cap: d.broke ? `Suspect ${k} breaks <b>clue ${d.broke}</b>: ${WHY[k]}. Every other clue matches, so you have to check them <b>all</b>.` : `<b>Every clue matches.</b> Suspect C is the graph on the poster.`,
        run: async (c) => { const s = stamp(stage, d.broke ? 'Not our graph' : 'Match!', { ok: !d.broke, x: 290, y: 382, size: 'lg' }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: discrete or continuous =============================== */
const DC = {
  a: { label: 'Ex 1(a) students', name: 'The number of students in a classroom', disc: true, min: 18, max: 30, probe: 23.4, unit: 'students', gap: [23, 24] },
  b: { label: '1(b) swim time', name: 'The time taken to swim 100 metres', disc: false, min: 58, max: 66, probe: 61.34, unit: 's', zoom: [61.33, 61.36, 0.005, 0.01], next: 61.35, mid: 61.345, how: 'a stopwatch can read that' },
  c: { label: '1(c) water volume', name: 'The volume of water in a tank', disc: false, min: 10, max: 20, probe: 14.7, unit: 'L', zoom: [14.65, 14.85, 0.025, 0.05], next: 14.8, mid: 14.75, how: 'water can fill to that level' },
  d: { label: '1(d) pages', name: 'The number of pages in a book', disc: true, min: 200, max: 212, probe: 205.5, unit: 'pages', gap: [205, 206] }
};
const discCont = {
  title: 'Discrete or continuous? Counted or measured?',
  height: 380,
  choices: Object.keys(DC).map((k) => ({ v: k, label: DC[k].label })),
  intro: (k) => `${DC[k].name}. Can it take <b>any</b> value, or only separate ones? Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = DC[k], W = ex.W;
    const name = add(stage, h('div', 'u5l10-var', d.name), 24, 12);
    const q = add(stage, h('div', 'u5l10-q', 'Counted or measured?'), 24, 54);
    const N = new NumberLine(stage, { x: 20, y: 96, width: W - 40, height: 110, min: d.min, max: d.max, step: 1 });
    const nx = (v) => 20 + N.toPx(v);
    const sv = svgEl('svg', { width: W, height: 380, style: 'position:absolute;left:0;top:0;pointer-events:none;overflow:visible' }, stage);
    void name;
    const probeLab = `${tn(d.probe)} ${d.unit}?`;
    return [
      { cap: `<b>${d.name}.</b> Is it <b>${d.disc ? 'counted' : 'measured'}</b>?`,
        run: async (c) => { const a = h('b', '', d.disc ? ' Counted.' : ' Measured.'); a.style.color = d.disc ? 'var(--brand2)' : 'var(--amber)'; q.appendChild(a); await fadeIn(c, a); } },
      d.disc
        ? { cap: `Counted: only <b>whole numbers</b> are possible. Each one is a separate <b>dot</b>.`,
          run: async (c) => { for (let v = d.min; v <= d.max; v++) { const p = N.point(v, { color: 'blue' }); await pop(c, p, 200); } } }
        : { cap: `Measured: <b>every</b> value along the line is possible, so the whole line fills in.`,
          run: (c) => N.drawIn(N.interval(-Infinity, Infinity, { color: 'blue' }), 900, c) },
      { cap: d.disc ? `Could it be ${T(tn(d.probe))}? <b>No</b>: there is no such thing as ${tn(d.probe)} ${d.unit}.` : `Could it be ${T(tn(d.probe))} ${d.unit}? <b>Yes</b>: ${d.how}.`,
        run: async (c) => {
          const p = N.point(d.probe, d.disc ? { open: true, color: 'red' } : { color: 'green', r: 9 }); await pop(c, p);
          const l = add(stage, h('div', 'u5l10-probe ' + (d.disc ? 'no' : 'yes'), `${probeLab} ${d.disc ? '✗' : '✓'}`), nx(d.probe), 104); await fadeIn(c, l);
        } },
      d.disc
        ? { cap: `From ${T(tn(d.gap[0]))} you <b>jump</b> straight to ${T(tn(d.gap[1]))}: there is nothing in between. Separate values: <b>discrete</b>.`,
          run: async (c) => { await N.hop(c, d.gap[0], d.gap[1], { label: 'jump', below: true, color: 'gray', height: 34 }); const g = add(stage, h('div', 'u5l10-gapnote', 'nothing in between'), nx((d.gap[0] + d.gap[1]) / 2), 226); await fadeIn(c, g); } }
        : { cap: `Zoom in: between ${T(tn(d.probe))} and ${T(tn(d.next))} sits ${T(tn(d.mid))}, and between any two values there is always another. They never run out: <b>continuous</b>.`,
          run: async (c) => {
            const Z = new NumberLine(stage, { x: 140, y: 240, width: W - 280, height: 110, min: d.zoom[0], max: d.zoom[1], step: d.zoom[2], labelStep: d.zoom[3], arrows: false });
            const zx = (v) => 140 + Z.toPx(v), ay = 96 + N.ay, zy = 240 + Z.ay;
            const poly = svgEl('path', { d: `M${nx(d.probe) - 14} ${ay + 10} L${nx(d.probe) + 14} ${ay + 10} L${zx(d.zoom[1])} ${zy - 14} L${zx(d.zoom[0])} ${zy - 14} Z`, fill: '#1f5bd6', 'fill-opacity': 0.07, stroke: '#1f5bd6', 'stroke-opacity': 0.35, 'stroke-dasharray': '5 5' }, sv);
            await anim(c, poly, [{ opacity: 0 }, { opacity: 1 }], 400);
            await Z.drawIn(Z.interval(d.zoom[0], d.zoom[1], { color: 'blue' }), 700, c);
            await pop(c, Z.point(d.probe, { color: 'green', label: T(tn(d.probe)) }));
            await pop(c, Z.point(d.next, { color: 'green', label: T(tn(d.next)) }));
            await pop(c, Z.point(d.mid, { color: 'red', label: T(tn(d.mid)) }));
          } },
      { cap: d.disc ? `<b>Discrete.</b> On a graph: separate dots, never joined.` : `<b>Continuous.</b> On a graph: an unbroken line or curve.`,
        run: async (c) => { const s = stamp(stage, d.disc ? 'Discrete' : 'Continuous', { ok: null, x: W - 210, y: 66, size: 'lg' }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: how the answer is written =============================== */
const anatomy = (host, pieces) => {
  const row = h('div', 'u5l10-anat'); host.appendChild(row);
  return pieces.map(([m, l]) => { const p = h('div', 'u5l10-ap', `<div class="u5l10-apm">${T(m)}</div><div class="u5l10-apl">${l}</div>`); p.style.opacity = 0; row.appendChild(p); return p; });
};
const NOT = {
  list: { label: 'a list: four points', win: { xmin: -2, xmax: 8, ymin: -4, ymax: 7 } },
  curve: { label: 'set-builder: a curve', win: { xmin: -5, xmax: 5, ymin: -5, ymax: 7 } },
  count: { label: 'a count: whole numbers', win: { xmin: 0, xmax: 9, ymin: 0, ymax: 18, ystep: 2, ylabels: 4, xtitle: 'n', ytitle: 'C' } }
};
const notation = {
  title: 'How the answer is written: a list or set-builder notation',
  height: 420,
  choices: Object.keys(NOT).map((k) => ({ v: k, label: NOT[k].label })),
  intro: 'Finitely many values: a <b>list</b>. Infinitely many: <b>set-builder notation</b>. Press <b>Next</b>.',
  make(stage, k, ex) {
    const G = new Graph(stage, Object.assign({ x: 8, y: 10, width: 420, height: 400 }, NOT[k].win));
    const P = panel(stage, 444, 10, ex.W - 454, 400, 'Write it down');
    if (k === 'list') {
      const pts = [[6, 4], [1, 4], [3, -2], [3, 5]];
      return [
        { cap: `Four ordered pairs: ${T('(6,4),\\ (1,4),\\ (3,-2),\\ (3,5)')}. Plot them.`,
          run: async (c) => { for (const [x, y] of pts) await G.reveal(G.point(x, y, { color: 'teal', coords: true, pos: y === 4 && x === 1 ? 'nw' : 'ne' }), c); } },
        { cap: `Domain: the <b>first</b> coordinates, ${T('6,\\ 1,\\ 3,\\ 3')}. Each one drops onto the ${T('x')}-axis.`,
          run: async (c) => { for (const x of [6, 1, 3]) await pop(c, G.point(x, 0, { color: AMB, r: 8 })); await say(c, P, `inputs: ${T('6,\\ 1,\\ 3,\\ 3')}`, 'sm'); } },
        { cap: `Write each value <b>once</b>, in <b>increasing order</b>.`, run: (c) => say(c, P, T('D=\\{1,\\ 3,\\ 6\\}'), 'dom big') },
        { cap: `Range: the <b>second</b> coordinates, ${T('4,\\ 4,\\ -2,\\ 5')}, slide onto the ${T('y')}-axis.`,
          run: async (c) => { for (const y of [4, -2, 5]) await pop(c, G.point(0, y, { color: PUR, r: 8 })); await say(c, P, `outputs: ${T('4,\\ 4,\\ -2,\\ 5')}`, 'sm'); } },
        { cap: `Once each, in order. (A repeated value is still written only once.)`, run: (c) => say(c, P, T('R=\\{-2,\\ 4,\\ 5\\}'), 'ran big') }
      ];
    }
    if (k === 'curve') {
      let parts;
      return [
        { cap: `${T('y=x^2-3')} keeps going: infinitely many points. A list can’t hold them all.`, run: (c) => G.drawIn(G.fn((x) => x * x - 3, { color: 'teal' }), 900, c) },
        { cap: `Range: the shadow on the ${T('y')}-axis starts at the vertex, ${T('y=-3')}, and goes up forever.`,
          run: async (c) => { await G.reveal(G.point(0, -3, { color: PUR, coords: true, pos: 'se' }), c); await G.drawIn(G.shadeY(-3, Infinity, { band: true }), 800, c); } },
        { cap: `Set-builder notation, piece by piece.`,
          run: async (c) => {
            parts = anatomy(P, [['R=', 'the range is'], ['\\{\\,y', 'the set of all <i>y</i>'], ['\\mid', 'such that'], ['y\\ge-3', 'the condition'], [',\\ y\\in\\mathbb{R}', '<i>y</i> is a real number'], ['\\}', '']]);
            for (const p of parts) { await fadeIn(c, p, 300); await sleep(c, 120); }
          } },
        { cap: `Domain: the shadow covers the <b>whole</b> ${T('x')}-axis, unbounded both ways. No condition is needed.`,
          run: async (c) => { await G.drawIn(G.shadeX(-Infinity, Infinity), 800, c); await say(c, P, T('D=\\{x\\mid x\\in\\mathbb{R}\\}'), 'dom big'); } }
      ];
    }
    const ns = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    return [
      { cap: `The cost of ${T('n')} snacks at ${T('\\$2')} each: ${T('C=2n')}. ${T('n')} counts snacks: ${T('0,\\ 1,\\ 2,\\ 3,\\ \\ldots')}`,
        run: async (c) => { for (const n of ns) await pop(c, G.point(n, 2 * n, { color: 'blue', r: 6 }), 180); } },
      { cap: `Discrete, but with <b>no largest value</b>: infinitely many, so set-builder notation.`,
        run: async (c) => { for (const n of ns) G.point(n, 0, { color: AMB, r: 6 }); await say(c, P, `${T('n')} can be ${T('0,\\ 1,\\ 2,\\ 3,\\ \\ldots')}`, 'sm'); } },
      { cap: `The values are whole numbers, so write ${T('W')} in place of ${T('\\mathbb{R}')}.`, run: (c) => say(c, P, T('D=\\{n\\mid n\\ge0,\\ n\\in W\\}'), 'dom big') },
      { cap: `Or use the integers ${T('I')} with the lower bound ${T('n\\ge0')}.`, run: (c) => say(c, P, `or ${T('D=\\{n\\mid n\\ge0,\\ n\\in I\\}')}`, 'dom') },
      { cap: `${T('W')}: whole numbers ${T('0,1,2,\\ldots')}  ${T('I')}: integers ${T('\\ldots,-1,0,1,\\ldots')}  ${T('\\mathbb{R}')}: all real numbers.`,
        run: async (c) => { await say(c, P, `${T('W')}: ${T('0,\\ 1,\\ 2,\\ 3,\\ \\ldots')}`, 'sm'); await say(c, P, `${T('I')}: ${T('\\ldots,\\ -2,\\ -1,\\ 0,\\ 1,\\ 2,\\ \\ldots')}`, 'sm'); await say(c, P, `${T('\\mathbb{R}')}: every number on the number line`, 'sm'); } }
    ];
  }
};

/* =============================== explainer: inputs across, outputs up =============================== */
const IO = { a: { label: T('(3,\\ 5)'), p: [3, 5] }, b: { label: T('(-2,\\ 4)'), p: [-2, 4] }, ex2: { label: 'Example 2 check' } };
const STM = [
  { t: '(a) The domain of a relation is the set of values taken by the independent variable.', ok: true, cap: 'domain = the inputs = the independent variable. <b>True.</b>' },
  { t: '(b) The independent variable is represented by the second coordinate of each ordered pair.', ok: false, cap: 'the independent variable (the input) is the <b>first</b> coordinate, not the second. <b>False.</b>', fix: 'Fix: the independent variable is the <u>first</u> coordinate.' },
  { t: '(c) On a Cartesian plane, the outputs of a relation are graphed on the vertical axis.', ok: true, cap: 'outputs go <b>up</b>, on the vertical axis. <b>True.</b>' },
  { t: '(d) The range of a relation is the set of values taken by the dependent variable.', ok: true, cap: 'range = the outputs = the dependent variable. <b>True.</b>' }
];
const ioAxes = {
  title: 'Inputs across, outputs up',
  height: 400,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(IO).map((k) => ({ v: k, label: IO[k].label })),
  intro: (k) => (k === 'ex2' ? 'Check each statement of Example 2 against the rule: <b>first</b> = input, <b>second</b> = output. Press <b>Next</b>.' : 'Where does each coordinate of an ordered pair go? Press <b>Next</b>.'),
  make(stage, k, ex) {
    if (k === 'ex2') {
      const ys = [8, 92, 200, 284], hs = [76, 100, 76, 76];
      return STM.map((s, i) => ({
        cap: `${s.t.slice(0, 3)}: ${s.cap}`,
        run: async (c) => {
          const r = add(stage, box(h('div', 'u5l10-stmt' + (s.ok ? '' : ' bad'), `<div>${s.t.slice(4)}</div>`), ex.W - 40, hs[i]), 20, ys[i]);
          r.firstChild.insertAdjacentHTML('afterbegin', `<b>${s.t.slice(0, 3)}</b> `);
          const st = stamp(r, s.ok ? 'True' : 'False', { ok: s.ok, size: 'sm' });
          if (s.fix) r.appendChild(h('div', 'u5l10-fix', s.fix));
          await fadeIn(c, r); await stampIn(c, st);
        }
      }));
    }
    const [a, b] = IO[k].p;
    const pair = add(stage, h('div', 'u5l10-pair', T(`(\\textcolor{${AMB}}{${tn(a)}},\\ \\textcolor{${PUR}}{${tn(b)}})`)), 40, 16);
    pair.style.opacity = 0;
    const role = (cls, y, l1, l2) => { const r = add(stage, box(h('div', 'u5l10-role ' + cls, `<b>${l1}</b><div>${l2}</div>`), ex.W - 470, 112), 20, y); r.style.opacity = 0; return r; };
    const rIn = role('in', 120, `first coordinate ${T(tn(a))} · the <b>input</b>`, 'independent variable · plotted <b>across</b> (horizontal axis) · all the inputs make the <b>domain</b>');
    const rOut = role('out', 246, `second coordinate ${T(tn(b))} · the <b>output</b>`, 'dependent variable · plotted <b>up</b> (vertical axis) · all the outputs make the <b>range</b>');
    const G = new Graph(stage, { x: ex.W - 440, y: 8, width: 430, height: 384, xmin: -4, xmax: 6, ymin: -2, ymax: 7 });
    return [
      { cap: `An ordered pair is an input and its output, always in that order: ${T('(\\text{input},\\ \\text{output})')}.`, run: (c) => pop(c, pair, 420) },
      { cap: `The <b>first</b> coordinate is the <b>input</b>, the independent variable. It goes <b>across</b>.`,
        run: async (c) => { await fadeIn(c, rIn); await G.reveal(G.point(a, 0, { color: AMB, r: 8, label: T(tn(a)), pos: 's' }), c); } },
      { cap: `The <b>second</b> coordinate is the <b>output</b>, the dependent variable. It goes <b>up</b>.`,
        run: async (c) => { await fadeIn(c, rOut); await G.reveal(G.point(0, b, { color: PUR, r: 8, label: T(tn(b)), pos: a < 0 ? 'e' : 'w' }), c); } },
      { cap: `Across ${T(tn(a))}, up ${T(tn(b))}: one point ${T(pairTex(a, b))}.`,
        run: async (c) => { await G.drawIn(G.guides(a, b), 600, c); await G.reveal(G.point(a, b, { color: 'ink', r: 8, coords: true, pos: a < 0 ? 'nw' : 'ne' }), c); } },
      { cap: `<b>Cause → effect.</b> The output <b>depends on</b> the input: “distance depends on time” makes time the input (across) and distance the output (up).`,
        run: async (c) => { await pulse(c, rIn, 1.04); await pulse(c, rOut, 1.04); } }
    ];
  }
};

/* =============================== explainer: domain and range are shadows =============================== */
const SH = {
  P: { label: 'Example 3 check: P', draw: (G) => drawP(G, { color: 'teal' }), x: [-2, Infinity], y: [-Infinity, Infinity], v: [-2, 0],
    look: 'Relation P opens to the right from its leftmost point, and the arrows carry it up and down forever.',
    dcap: `Its leftmost point is ${T('(-2,\\ 0)')}; the arrows carry it right forever.`, rcap: 'Up and down forever: the shadow covers the <b>whole</b> y-axis.',
    D: 'D=\\{x\\mid x\\ge-2,\\ x\\in\\mathbb{R}\\}', R: 'R=\\{y\\mid y\\in\\mathbb{R}\\}' },
  Q: { label: 'Example 3 check: Q', draw: (G) => drawQ(G, { color: 'teal' }), x: [-Infinity, Infinity], y: [-1, Infinity], v: [0, -1],
    look: 'Relation Q opens upward from its lowest point, and the arrows carry it left and right forever.',
    dcap: 'Left and right forever: the shadow covers the <b>whole</b> x-axis.', rcap: `Its lowest point is ${T('(0,\\ -1)')}; from there it goes up forever.`,
    D: 'D=\\{x\\mid x\\in\\mathbb{R}\\}', R: 'R=\\{y\\mid y\\ge-1,\\ y\\in\\mathbb{R}\\}' },
  seg: { label: 'a segment with an open end', draw: (G) => G.segment([-3, -1], [4, 3], { closedA: true, openB: true, color: 'teal' }), x: [-3, 4, false, true], y: [-1, 3, false, true],
    look: `A segment from ${T('(-3,\\ -1)')} (closed: included) to ${T('(4,\\ 3)')} (open: not included).`,
    dcap: `From ${T('-3')} (included) to ${T('4')} (not included).`, rcap: `From ${T('-1')} (included) to ${T('3')} (not included).`,
    D: 'D=\\{x\\mid -3\\le x<4,\\ x\\in\\mathbb{R}\\}', R: 'R=\\{y\\mid -1\\le y<3,\\ y\\in\\mathbb{R}\\}' }
};
const shadow = {
  title: 'Domain and range: the graph’s shadows',
  height: 460,
  choices: Object.keys(SH).map((k) => ({ v: k, label: SH[k].label })),
  intro: (k) => `${SH[k].look} Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SH[k], G = new Graph(stage, { x: 8, y: 10, width: 440, height: 440, xmin: -5, xmax: 5, ymin: -5, ymax: 5 });
    const P = panel(stage, 466, 10, ex.W - 476, 440, 'Write it down');
    let sx;
    const steps = [
      { cap: `${d.look}`, run: async (c) => { await G.drawIn(d.draw(G), 1000, c); if (d.v) await G.reveal(G.point(d.v[0], d.v[1], { color: 'teal', coords: true, pos: k === 'P' ? 'nw' : 'se' }), c); } },
      { cap: `<b>Domain:</b> squash the graph straight down onto the ${T('x')}-axis. ${d.dcap}`,
        run: async (c) => { sx = G.shadeX(d.x[0], d.x[1], { openA: d.x[2], openB: d.x[3], band: true }); await G.drawIn(sx, 800, c); } },
      { cap: `Write the domain.`, run: (c) => say(c, P, T(d.D), 'dom') },
      { cap: `<b>Range:</b> squash it sideways onto the ${T('y')}-axis. ${d.rcap}`,
        run: async (c) => { G.remove(sx); G.shadeX(d.x[0], d.x[1], { openA: d.x[2], openB: d.x[3] }); await G.drawIn(G.shadeY(d.y[0], d.y[1], { openA: d.y[2], openB: d.y[3], band: true }), 800, c); } },
      { cap: `Write the range. <b>Domain: x-values. Range: y-values.</b>`, run: (c) => say(c, P, T(d.R), 'ran') }
    ];
    if (k !== 'seg') {
      steps.push({ cap: `Compare: ${T('P')} has a restricted domain and all real ${T('y')}; ${T('Q')} has all real ${T('x')} and a restricted range. Domains <b>different</b>, ranges <b>different</b>.`,
        run: async (c) => {
          await say(c, P, '<b>Compare</b>', 'sm');
          await say(c, P, `${T('P')}: ${T('x\\ge-2')}, ${T('y\\in\\mathbb{R}')}`);
          await say(c, P, `${T('Q')}: ${T('x\\in\\mathbb{R}')}, ${T('y\\ge-1')}`);
          await say(c, P, 'domains different, ranges different', 'ok');
        } });
    }
    return steps;
  }
};

/* =============================== explainer: intercepts =============================== */
const INT = {
  demo: { label: T('2x+5y=10'), eq: '2x+5y=10', draw: (G) => G.line([0, 2], [5, 0], { color: 'teal' }), win: { xmin: -2, xmax: 7, ymin: -3, ymax: 5 },
    xl: ['2x+5(0)=10', '2x=10', 'x=5'], xs: [[5, '(5,\\ 0)']], yl: ['2(0)+5y=10', '5y=10', 'y=2'], ys: [[2, '(0,\\ 2)']],
    fin: `Intercepts ${T('5')} and ${T('2')}; intercept points ${T('(5,\\ 0)')} and ${T('(0,\\ 2)')}.` },
  ex4: { label: 'Example 4 check', eq: '3x+7y-10=0', draw: (G) => G.line([0, 10 / 7], [10 / 3, 0], { color: 'teal' }), win: { xmin: -2, xmax: 5, ymin: -3, ymax: 4 },
    xl: ['3x+7(0)-10=0', '3x=10', 'x=\\tfrac{10}{3}\\approx3.33'], xs: [[10 / 3, '(3.33,\\ 0)']], yl: ['3(0)+7y-10=0', '7y=10', 'y=\\tfrac{10}{7}\\approx1.43'], ys: [[10 / 7, '(0,\\ 1.43)']],
    fin: `Example 4 asks for the ${T('x')}-intercept: <b>3.33</b> to the nearest hundredth.` },
  ex5: { label: 'Example 5 check', eq: '5x^2-4y=20', draw: (G) => G.fn((x) => 1.25 * x * x - 5, { color: 'teal' }), win: { xmin: -5, xmax: 5, ymin: -7, ymax: 5 },
    xl: ['5x^2-4(0)=20', 'x^2=4', 'x=\\pm2'], xs: [[-2, '(-2,\\ 0)'], [2, '(2,\\ 0)']], yl: ['5(0)^2-4y=20', '-4y=20', 'y=-5'], ys: [[-5, '(0,\\ -5)']],
    fin: `${T('a,\\ b=2,\\ -2')} and ${T('c=-5')}: ${T('abc=(2)(-2)(-5)=20')}` },
  P: { label: 'Relation P', eq: 'x=\\tfrac12y^2-2', draw: (G) => drawP(G, { color: 'teal' }), win: { xmin: -5, xmax: 5, ymin: -5, ymax: 5 },
    xl: ['x=\\tfrac12(0)^2-2', 'x=-2'], xs: [[-2, '(-2,\\ 0)']], yl: ['0=\\tfrac12y^2-2', 'y^2=4', 'y=\\pm2'], ys: [[2, '(0,\\ 2)'], [-2, '(0,\\ -2)']],
    fin: `<b>Two</b> ${T('y')}-intercepts: the input ${T('x=0')} has two outputs, so ${T('P')} is <b>not a function</b>.` }
};
const listT = (arr) => arr.map((v) => T(tn(v))).join(' and ');
const intercepts = {
  title: 'Intercepts: where the graph meets the axes',
  height: 440,
  choices: Object.keys(INT).map((k) => ({ v: k, label: INT[k].label })),
  intro: (k) => `Find the intercepts of ${T(INT[k].eq)}: ${T('y=0')} for the ${T('x')}-intercepts, ${T('x=0')} for the ${T('y')}-intercepts. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = INT[k], G = new Graph(stage, Object.assign({ x: 8, y: 10, width: 430, height: 420 }, d.win));
    const P = panel(stage, 456, 10, ex.W - 466, 420, '');
    line(P, T(d.eq), 'big');
    const cols = h('div', 'u5l10-cols'); P.appendChild(cols);
    const colX = h('div', 'u5l10-col xi', `<div class="u5l10-colh">x-intercept · let y = 0</div>`), colY = h('div', 'u5l10-col yi', `<div class="u5l10-colh">y-intercept · let x = 0</div>`);
    cols.append(colX, colY); colX.style.opacity = 0; colY.style.opacity = 0;
    const lines = async (c, col, ls) => { await fadeIn(c, col, 250); for (const l of ls) { await say(c, col, T(l)); await sleep(c, 150); } };
    const xsV = d.xs.map((p) => p[0]), ysV = d.ys.map((p) => p[0]);
    return [
      { cap: `The graph of ${T(d.eq)}.`, run: (c) => G.drawIn(d.draw(G), 900, c) },
      { cap: `<b>${T('x')}-intercept:</b> every point on the ${T('x')}-axis has ${T('y=0')}. Substitute and solve.`, run: (c) => lines(c, colX, d.xl) },
      { cap: `The graph meets the ${T('x')}-axis at ${T('x=')} ${k === 'ex4' ? T('3.33') : listT(xsV)}.`,
        run: async (c) => { for (const [x, l] of d.xs) await G.reveal(G.point(x, 0, { color: AMB, r: 8, label: T(l), pos: x < 0 ? 'nw' : 'ne' }), c); } },
      { cap: `<b>${T('y')}-intercept:</b> every point on the ${T('y')}-axis has ${T('x=0')}.`, run: (c) => lines(c, colY, d.yl) },
      { cap: `The graph meets the ${T('y')}-axis at ${T('y=')} ${k === 'ex4' ? T('1.43') : listT(ysV)}.`,
        run: async (c) => { for (const [y, l] of d.ys) await G.reveal(G.point(0, y, { color: PUR, r: 8, label: T(l), pos: y < 0 ? 'se' : 'ne' }), c); } },
      { cap: d.fin, run: (c) => say(c, P, d.fin, k === 'P' ? 'bad' : 'ok') }
    ];
  }
};

/* =============================== explainer: the function machine =============================== */
const MC = {
  ex7: { label: 'Example 7 check', rule: 'f(x)=2x^2-5', dom: [-5, -3, 0, 1, 4], f: (x) => 2 * x * x - 5, sub: (x) => `f(${x})=2(${x})^2-5=${2 * x * x - 5}` },
  sq: { label: T('f(x)=x^2') + ' on 5 inputs', rule: 'f(x)=x^2', dom: [-2, -1, 0, 1, 2], f: (x) => x * x, sub: (x) => `f(${x})=(${x})^2=${x * x}` }
};
const machine = {
  title: 'A function is a machine: one input in, one output out',
  height: 400,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(MC).map((k) => ({ v: k, label: MC[k].label })),
  intro: (k) => `Feed each input of the domain into ${T(MC[k].rule)} and collect the outputs. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = MC[k], outs = d.dom.map(d.f), range = [...new Set(outs)].sort((p, q) => p - q);
    add(stage, box(h('div', 'u5l10-chute'), 160, 30), 20, 64); add(stage, box(h('div', 'u5l10-chute'), 140, 30), 396, 64);
    const M = add(stage, box(h('div', 'u5l10-mach', `<div><div class="u5l10-mlab">function machine</div>${T(d.rule)}</div>`), 230, 104), 176, 28);
    M.style.textAlign = 'center';
    const ev = add(stage, h('div', 'u5l10-evals'), 24, 156);
    const MD = new MappingDiagram(stage, { x: ex.W - 420, y: 6, width: 410, height: 388, domain: d.dom, range, pairs: d.dom.map((x, i) => [x, outs[i]]), arrows: false });
    let last = [];
    const steps = [{ cap: `${T(d.rule)} is read “${T('f')} of ${T('x')}”: the output ${T('f')} makes from the input ${T('x')}. It is <b>not</b> ${T('f')} times ${T('x')}.`, run: (c) => pulse(c, M, 1.06) }];
    d.dom.forEach((x, i) => steps.push({
      cap: `${T(`f(${x})`)}: replace every ${T('x')} with ${T(tn(x))}. ${T(d.sub(x))}`,
      run: async (c) => {
        last.forEach((e) => e.remove());
        const a = add(stage, h('div', 'u5l10-tok in', T(tn(x))), 40, 56), b = add(stage, h('div', 'u5l10-tok out', T(tn(outs[i]))), 330, 56);
        b.style.opacity = 0; last = [a, b];
        MD.highlight('d', x, true);
        await anim(c, a, [{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(170px)', opacity: 0 }], 650);
        await pulse(c, M, 1.05);
        await anim(c, b, [{ transform: 'translateX(0)', opacity: 0 }, { transform: 'translateX(110px)', opacity: 1 }], 600);
        await say(c, ev, T(d.sub(x)));
        await MD.drawArrow(c, i);
        MD.highlight('d', x, false);
      }
    }));
    steps.push(k === 'ex7'
      ? { cap: `Collect the outputs, each once, in increasing order: ${T('R=\\{-5,-3,13,27,45\\}')}.`, run: async (c) => { await say(c, ev, T('R=\\{-5,\\ -3,\\ 13,\\ 27,\\ 45\\}'), 'ran big'); } }
      : { cap: `${T('-2')} and ${T('2')} share the output ${T('4')}: that’s fine, each input still has <b>one</b> arrow. ${T('R=\\{0,1,4\\}')}, each value once.`,
        run: async (c) => { MD.highlight('r', 4, true); MD.highlight('r', 1, true); await say(c, ev, T('R=\\{0,\\ 1,\\ 4\\}'), 'ran big'); } });
    return steps;
  }
};

/* =============================== explainer: cost model (Example 6) =============================== */
const costModel = {
  title: 'A cost model: forwards, then domain and range',
  height: 420,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'a', label: 'Example 6(a): ' + T('n=685') }, { v: 'b', label: '6(b): domain and range' }],
  intro: `${T('C=150+0.08n')}: the cost in dollars of printing ${T('n')} newsletters. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 8, y: 10, width: 570, height: 400, xmin: 0, xmax: 1000, ymin: 0, ymax: 250, xstep: 100, ystep: 25, xlabels: 200, ylabels: 50, xtitle: 'n', ytitle: 'C', fontSize: 16 });
    const P = panel(stage, 596, 10, ex.W - 606, 400, 'Work');
    const C = (n) => 150 + 0.08 * n;
    const first = { cap: `A fixed ${T('\\$150')} plus ${T('\\$0.08')} per copy. Even ${T('0')} copies cost ${T('\\$150')}: the graph starts at ${T('(0,\\ 150)')}.`,
      run: async (c) => { await G.drawIn(G.ray([0, 150], [1000, C(1000)], { start: 'closed', color: 'teal' }), 900, c); G.label(0, 150, T('(0,\\ 150)'), { pos: 'se', cls: 'bk-ptlab', dy: 4 }); await say(c, P, T('C=150+0.08n'), 'big'); } };
    if (k === 'a') {
      return [first,
        { cap: `<b>Forwards:</b> start at ${T('n=685')} on the horizontal axis and go up to the line.`,
          run: (c) => G.drawIn(G.polyline([[685, 0], [685, C(685)]], { color: AMB, width: 3, dash: '7 6' }), 700, c) },
        { cap: `Then across to the ${T('C')}-axis: a little over ${T('200')}.`,
          run: async (c) => { await G.drawIn(G.polyline([[685, C(685)], [0, C(685)]], { color: PUR, width: 3, dash: '7 6', ends: [null, 'arrow'] }), 700, c); await G.reveal(G.point(685, C(685), { color: 'ink', r: 7 }), c); } },
        { cap: `Exactly: substitute ${T('n=685')}.`,
          run: async (c) => { await say(c, P, T('C=150+0.08(685)')); await say(c, P, T('=150+54.80')); await say(c, P, T('=204.80')); } },
        { cap: `It costs <b>$204.80</b> to publish 685 newsletters.`, run: async (c) => { await say(c, P, 'Cost: <b>$204.80</b>', 'ok big'); G.label(685, C(685), T('(685,\\ 204.80)'), { pos: 'nw', cls: 'bk-ptlab' }); } }
      ];
    }
    return [first,
      { cap: `<b>Domain:</b> copies can’t be negative. The shadow on the ${T('n')}-axis starts at ${T('0')} and runs right forever: ${T('n\\ge0')}, so ${T('a=0')}.`,
        run: async (c) => { await G.drawIn(G.shadeX(0, Infinity, { band: true }), 800, c); await say(c, P, `${T('n\\ge0')}, so ${T('a=0')}`, 'dom'); } },
      { cap: `<b>Range:</b> the cheapest order is ${T('n=0')}, costing ${T('C=150+0.08(0)=150')}. The shadow on the ${T('C')}-axis starts at ${T('150')} and goes up: ${T('C\\ge150')}, so ${T('b=150')}.`,
        run: async (c) => { await G.drawIn(G.shadeY(150, Infinity), 800, c); await say(c, P, `${T('C\\ge150')}, so ${T('b=150')}`, 'ran'); } },
      { cap: `Strictly, ${T('n')} counts copies (${T('n\\in W')}): the graph is dots so close together that they look like a line.`,
        run: (c) => say(c, P, `${T('n')} is a count: ${T('n\\in W')}`, 'sm') }
    ];
  }
};

/* =============================== explainer: reading a graph (Example 8) =============================== */
const DOTS8 = [[-3, 5], [-2, 3], [-1, 1], [0, -1], [1, -3], [2, -5]];
const readGraph = {
  title: 'Reading function values off a graph',
  height: 460,
  choices: [{ v: 'ex8', label: 'Example 8 check' }, { v: 'back', label: 'Backwards: ' + T('f(x)=1') }, { v: 'dr', label: 'Domain and range of the dots' }],
  intro: 'Forwards: across the bottom, up to the graph, over to the side. Backwards: the reverse. Press <b>Next</b>.',
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 8, y: 10, width: 440, height: 440, xmin: -7, xmax: 7, ymin: -7, ymax: 7 });
    const P = panel(stage, 466, 10, ex.W - 476, 440, 'Read it');
    const path = (c, pts, color) => G.drawIn(G.polyline(pts, { color, width: 3.5, dash: '7 6', ends: [null, 'arrow'] }), 900, c);
    const dots = { cap: `The function is defined at only <b>six</b> inputs, so its graph is six separate dots.`,
      run: async (c) => { for (const [x, y] of DOTS8) await pop(c, G.point(x, y, { color: 'ink', r: 7 }), 220); } };
    if (k === 'ex8') {
      return [dots,
        { cap: `${T('f(-2)')}: go to ${T('x=-2')}, <b>up</b> to the dot, across to the ${T('y')}-axis. ${T('f(-2)=3')}.`,
          run: async (c) => { await path(c, [[-2, 0], [-2, 3], [0, 3]], 'blue'); G.label(-2, 3, T('f(-2)=3'), { pos: 'nw', cls: 'bk-ptlab', color: 'blue' }); await say(c, P, T('f(-2)=3')); } },
        { cap: `${T('f(2)')}: go to ${T('x=2')}, <b>down</b> to the dot, across. ${T('f(2)=-5')}.`,
          run: async (c) => { await path(c, [[2, 0], [2, -5], [0, -5]], 'red'); G.label(2, -5, T('f(2)=-5'), { pos: 'se', cls: 'bk-ptlab', color: 'red' }); await say(c, P, T('f(2)=-5')); } },
        { cap: `Add the two outputs: ${T('f(-2)+f(2)=3+(-5)=-2')}.`, run: (c) => say(c, P, T('f(-2)+f(2)=3+(-5)=-2'), 'ok big') }
      ];
    }
    if (k === 'back') {
      return [dots,
        { cap: `${T('f(x)=1')} gives the <b>output</b>. Start at ${T('1')} on the ${T('y')}-axis and go across to a dot.`,
          run: async (c) => { await path(c, [[0, 1], [-1, 1]], PUR); } },
        { cap: `Then down to the ${T('x')}-axis: ${T('x=-1')}. So ${T('f(-1)=1')}.`,
          run: async (c) => { await path(c, [[-1, 1], [-1, 0]], AMB); await say(c, P, `${T('f(x)=1')} when ${T('x=-1')}`, 'ok'); } },
        { cap: `Try ${T('f(x)=4')}: going across at ${T('y=4')} meets <b>no dot</b>. No input gives 4, so 4 is not in the range.`,
          run: async (c) => { await G.drawIn(G.polyline([[0, 4], [-6.5, 4]], { color: 'gray', width: 3, dash: '7 6' }), 800, c); G.label(-5.6, 4, '✗ no dot', { pos: 'n', color: 'red', cls: 'bk-ptlab' }); await say(c, P, `${T('f(x)=4')}: no solution`, 'bad'); } }
      ];
    }
    return [dots,
      { cap: `<b>Domain:</b> drop each dot straight onto the ${T('x')}-axis. The shadow is six separate dots.`,
        run: async (c) => { for (const [x] of DOTS8) await pop(c, G.point(x, 0, { color: AMB, r: 7 }), 160); await say(c, P, T('D=\\{-3,-2,-1,0,1,2\\}'), 'dom'); } },
      { cap: `<b>Range:</b> slide each dot sideways onto the ${T('y')}-axis. Write them in increasing order.`,
        run: async (c) => { for (const [, y] of DOTS8) await pop(c, G.point(0, y, { color: PUR, r: 7 }), 160); await say(c, P, T('R=\\{-5,-3,-1,1,3,5\\}'), 'ran'); } },
      { cap: `Dots, not a line: finitely many values, so both answers are <b>lists</b>.`, run: (c) => say(c, P, 'finite: write lists', 'sm') }
    ];
  }
};

/* =============================== explainer: forwards and backwards (Example 9) =============================== */
const FB = {
  a: { label: 'Example 9(a): ' + T('Q(4)'), dir: 'f', x: 4 },
  b: { label: '9(b): ' + T('Q(b)=2'), dir: 'b', y: 2, v: 'b', xT: '-\\tfrac{1}{2}', mid: -3, alg: ['6b+5=2', '6b=-3', 'b=-\\tfrac{3}{6}=-\\tfrac{1}{2}'] },
  c: { label: T('Q(x)=41'), dir: 'b', y: 41, v: 'x', xT: '6', mid: 36, alg: ['6x+5=41', '6x=36', 'x=6'] }
};
const fwdBack = {
  title: 'Forwards and backwards through a linear function',
  height: 420,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(FB).map((k) => ({ v: k, label: FB[k].label })),
  intro: (k) => (FB[k].dir === 'f' ? `Forwards: the input is known, so substitute. Press <b>Next</b>.` : `Backwards: the output is known, so undo the steps in reverse order. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = FB[k];
    const X = [8, 122, 216, 330, 424], cb = (cls, x, y) => add(stage, h('div', 'u5l10-cbox ' + cls, ''), x, y);
    const op = (txt, x, y, back) => add(stage, h('div', 'u5l10-cop' + (back ? ' back' : ''), txt), x, y + 4);
    const arr = (ch, x, y) => add(stage, h('div', 'u5l10-carr', ch), x, y + 10);
    const fwd = [], bk = [];
    add(stage, h('div', 'u5l10-crowlab', 'forwards: do'), 10, 12);
    fwd.push(cb('in', X[0], 36), arr('→', 96, 36), op('×6', X[1], 36), arr('→', 192, 36), cb('', X[2], 36), arr('→', 306, 36), op('+5', X[3], 36), arr('→', 400, 36), cb('out', X[4], 36));
    const [fIn, , , , fMid, , , , fOut] = fwd;
    const backRow = d.dir === 'b';
    if (backRow) {
      add(stage, h('div', 'u5l10-crowlab', 'backwards: undo'), 10, 120);
      bk.push(cb('in', X[0], 144), arr('←', 96, 144), op('÷6', X[1], 144, true), arr('←', 192, 144), cb('', X[2], 144), arr('←', 306, 144), op('−5', X[3], 144, true), arr('←', 400, 144), cb('out', X[4], 144));
    }
    const [bIn, , bOp1, , bMid, , bOp2, , bOut] = bk;
    [...fwd, ...bk].forEach((e) => (e.style.opacity = 0));
    const P = panel(stage, 10, 232, 520, 178, 'Algebra');
    const G = new Graph(stage, { x: ex.W - 410, y: 10, width: 400, height: 400, xmin: -2, xmax: 7, ymin: -10, ymax: 45, ystep: 5, ylabels: 10 });
    const setBox = async (c, el, t) => { el.innerHTML = T(t); await pop(c, el); };
    const first = { cap: `${T('Q(x)=6x+5')} as a machine: <b>multiply by 6</b>, then <b>add 5</b>.` + (backRow ? ' Backwards, undo each step in <b>reverse</b> order.' : ''),
      run: async (c) => { for (const e of fwd) await fadeIn(c, e, 160); for (const e of bk) await fadeIn(c, e, 160); await G.drawIn(G.line({ m: 6, b: 5 }, { color: 'teal' }), 700, c); } };
    if (d.dir === 'f') {
      return [first,
        { cap: `<b>Forwards:</b> the input is ${T('4')}.`, run: (c) => setBox(c, fIn, '4') },
        { cap: `Multiply by 6: ${T('4\\times6=24')}.`, run: async (c) => { await pulse(c, fwd[2], 1.15); await setBox(c, fMid, '24'); } },
        { cap: `Add 5: ${T('24+5=29')}. So ${T('Q(4)=29')}.`, run: async (c) => { await pulse(c, fwd[6], 1.15); await setBox(c, fOut, '29'); await say(c, P, T('Q(4)=6(4)+5=24+5=29'), 'big'); } },
        { cap: `On the graph: above ${T('x=4')} the line is at height ${T('29')}. The point ${T('(4,\\ 29)')}.`,
          run: async (c) => { await G.drawIn(G.polyline([[4, 0], [4, 29], [0, 29]], { color: 'blue', width: 3, dash: '7 6', ends: [null, 'arrow'] }), 900, c); await G.reveal(G.point(4, 29, { color: 'ink', coords: true, pos: 'se' }), c); } }
      ];
    }
    const yT = String(d.y), midT = tn(d.mid);
    return [first,
      { cap: `<b>Backwards:</b> this time the <b>output</b> is known, ${T(`Q(${d.v})=${yT}`)}. Start at the end.`, run: (c) => setBox(c, bOut, yT) },
      { cap: `Undo the <b>last</b> step first. Undo ${T('+5')} by subtracting 5: ${T(`${yT}-5=${midT}`)}.`, run: async (c) => { await pulse(c, bOp2, 1.15); await setBox(c, bMid, midT); } },
      { cap: `Undo ${T('\\times6')} by dividing by 6: ${T(`${midT}\\div6=${d.xT}`)}. So ${T(`${d.v}=${d.xT}`)}.`, run: async (c) => { await pulse(c, bOp1, 1.15); await setBox(c, bIn, d.xT); } },
      { cap: `The algebra does the same undoing: set ${T(`Q(${d.v})=${yT}`)} and solve.`, run: async (c) => { for (const l of d.alg) await say(c, P, T(l)); } },
      { cap: `On the graph: across from ${T(yT)} on the ${T('y')}-axis to the line, then down to ${T(`x=${d.xT}`)}.`,
        run: async (c) => { const x = (d.y - 5) / 6; await G.drawIn(G.polyline([[0, d.y], [x, d.y], [x, 0]], { color: PUR, width: 3, dash: '7 6', ends: [null, 'arrow'] }), 900, c); await G.reveal(G.point(x, d.y, { color: 'ink', label: T(`(${d.xT},\\ ${yT})`), pos: x < 0 ? 'nw' : 'sw' }), c); } }
    ];
  }
};

/* =============================== explainer: vertical line test (Example 10) =============================== */
const E10WIN = { xmin: -2.2, xmax: 2.2, ymin: -1.9, ymax: 2.1, xstep: 0.5, ystep: 0.5, grid: false, numbers: false };
const CIRC = []; for (let i = 0; i <= 80; i++) { const a = i / 80 * 2 * Math.PI; CIRC.push([1.1 * Math.cos(a), 0.1 + 1.1 * Math.sin(a)]); }
const E10 = {
  A: { name: 'A: a downward parabola', draw: (G, o = {}) => G.fn((x) => -0.7 * x * x + 1.3, Object.assign({ from: -1.5, to: 1.5, arrows: false, color: 'ink', width: 3.5 }, o)), hits: (x) => (Math.abs(x) <= 1.5 ? [-0.7 * x * x + 1.3] : []), fn: true },
  B: { name: 'B: a horizontal line segment', draw: (G, o = {}) => G.segment([-1.6, 0.7], [1.6, 0.7], Object.assign({ color: 'ink', width: 3.5 }, o)), hits: (x) => (Math.abs(x) <= 1.6 ? [0.7] : []), fn: true },
  C: { name: 'C: a circle', draw: (G, o = {}) => G.polyline(CIRC, Object.assign({ closed: true, color: 'ink', width: 3.5 }, o)), hits: (x) => (Math.abs(x) <= 1.1 ? [0.1 + Math.sqrt(1.21 - x * x), 0.1 - Math.sqrt(1.21 - x * x)] : []), fn: false },
  D: { name: 'D: a V shape', draw: (G, o = {}) => G.polyline([[-1.5, 1.6], [0, -0.2], [1.5, 1.6]], Object.assign({ color: 'ink', width: 3.5 }, o)), hits: (x) => (Math.abs(x) <= 1.5 ? [1.2 * Math.abs(x) - 0.2] : []), fn: true },
  P: { name: 'Relation P from Example 3', draw: (G) => drawP(G), hits: P_HITS, fn: false, grid: true }
};
const vlt = {
  title: 'The vertical line test',
  height: 420,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(E10).map((k) => ({ v: k, label: k === 'P' ? 'Relation P' : 'Example 10: ' + k })),
  intro: (k) => `${E10[k].name}. Is it a function? Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = E10[k];
    const G = new Graph(stage, d.grid ? { x: 8, y: 10, width: 440, height: 400, xmin: -5, xmax: 5, ymin: -5, ymax: 5 } : Object.assign({ x: 8, y: 10, width: 440, height: 400 }, E10WIN));
    const P = panel(stage, 466, 10, ex.W - 476, 400, 'Verdict');
    let res;
    return [
      { cap: `${d.name}.`, run: (c) => G.drawIn(d.draw(G), 1000, c) },
      { cap: `Slide a <b>vertical line</b> across, left to right, and count how many times it meets the graph…`,
        run: async (c) => { res = await G.vlineTest(c, { hits: d.hits, snap: k === 'P' ? 2 : 0.5 }); } },
      { cap: d.fn ? `Every vertical line meets the graph <b>at most once</b>: each input has one output. <b>A function.</b>`
        : `This vertical line meets the graph <b>twice</b>: one input, two outputs. <b>Not a function.</b>` + (k === 'P' ? ` (At ${T('x=0')}: the two ${T('y')}-intercepts ${T('2')} and ${T('-2')}.)` : ''),
        run: async (c) => {
          if (res && res.fail) line(P, k === 'P' ? `${T('x=0')} gives ${T('y=2')} and ${T('y=-2')}` : `one ${T('x')}, two points on the graph`, 'bad');
          else line(P, 'never more than one crossing', 'ok');
          const s = stamp(P, d.fn ? 'Function' : 'Not a function', { ok: d.fn, size: 'lg' }); s.style.alignSelf = 'center'; s.style.marginTop = '40px';
          await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== mount =============================== */
mountStatic();
export const explainers = mountExplainers({ wanted, discCont, notation, ioAxes, shadow, intercepts, machine, costModel, readGraph, fwdBack, vlt });
