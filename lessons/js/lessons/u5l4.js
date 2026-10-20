/* Math 10C · Unit 5 · Lesson 4 — Determining the Domain and Range of a Relation:
 * the explainers, the Ride Restrictions warm-up and the example figures.
 * Colours: domain (x-shadow) amber, range (y-shadow) purple, everywhere on the page. */
import {
  h, tex, add, box, fmt, Graph, NumberLine, ValueTable, MappingDiagram, Flowchart, mountExplainers,
  pop, fadeIn, appear, pulse, sleep, tween, linear, pairTex, texNum, svgEl, liveCtx, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
/* KaTeX that allows \htmlClass, so pieces of one expression can be lit one at a time */
const K = (src) => {
  try {
    const clean = String(src).replace(/\\htmlClass\{[^}]*\}/g, '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    return window.katex.renderToString(String(src), { throwOnError: false, strict: 'ignore', trust: true, output: 'html' }).replace('<span class="katex"', '<span data-tex="' + clean + '" class="katex"');
  } catch (e) { return tex(src); }
};
const AMB = COLORS.amber, PUR = COLORS.purple;
const RR = '\\mathbb{R}';
const nT = (n) => fmt(n).replace(/ /g, '\\,');           // TeX number, thin space from 1000 up
const listT = (a) => '\\{' + a.map((v) => (typeof v === 'number' ? nT(v) : v)).join(',\\ ') + '\\}';
const uniq = (a) => [...new Set(a)].sort((p, q) => p - q);
/** the inequality part of set-builder notation for [lo, hi] with open ends */
function cond(v, lo, hi, oLo, oHi) {
  const fl = Number.isFinite(lo), fh = Number.isFinite(hi);
  if (fl && fh) return `${nT(lo)}${oLo ? '<' : '\\le '}${v}${oHi ? '<' : '\\le '}${nT(hi)}`;
  if (fl) return `${v}${oLo ? '>' : '\\ge '}${nT(lo)}`;
  if (fh) return `${v}${oHi ? '<' : '\\le '}${nT(hi)}`;
  return '';
}
const setB = (v, c, S = RR) => `\\{${v}\\mid ${c ? c + ',\\ ' : ''}${v}\\in ${S}\\}`;
const ivT = (v, I, S) => setB(v, cond(v, I[0], I[1], I[2], I[3]), S);
const INF = Infinity;
const times = (n) => ['', 'once', 'twice', 'three times', 'four times', 'five times'][n] || n + ' times';
const ptT = (p) => T(pairTex(p[0], p[1]));

/* a write-it-down panel on a stage */
function panel(stage, x, y, w, hh, title) { return add(stage, box(h('div', 'u5l4-panel', title ? `<div class="u5l4-ph">${title}</div>` : ''), w, hh), x, y); }
function pline(P, html, cls = '') { const d = h('div', 'u5l4-pl ' + cls, html); P.appendChild(d); return d; }
/** a row of value tokens; repeats (after the first) are marked .dup so a later step can strike them */
function tokenRow(P, label, vals, cls) {
  const d = pline(P, `<span class="u5l4-tl">${label}</span>`, 'u5l4-toks ' + cls);
  const seen = new Set();
  const els = vals.map((v, i) => { const s = h('span', 'u5l4-tok', T(nT(v)) + (i < vals.length - 1 ? '<i class="u5l4-cm">,</i>' : '')); s.dup = seen.has(v); seen.add(v); s.style.opacity = 0; d.appendChild(s); return s; });
  return { row: d, els };
}
const strike = (c, els) => Promise.all(els.filter((s) => s.dup).map((s) => { s.classList.add('u5l4-dup'); return pulse(c, s, 1.2); }));
/** "−1 appears twice" for the repeated values of a list (or '') */
function repeats(vals) {
  const cnt = new Map(); vals.forEach((v) => cnt.set(v, (cnt.get(v) || 0) + 1));
  const r = [...cnt].filter(([, n]) => n > 1).map(([v, n]) => `${T(nT(v))} appears ${times(n)}`);
  return r.length ? r.join(' and ') : '';
}

/* a Graph whose axis numbers of 1000 or more get a thin space (redrawn on every zoom) */
class TGraph extends Graph {
  frame() {
    super.frame();
    if (!this.layers) return;
    this.layers.axes.querySelectorAll('text.bk-num').forEach((t) => { const v = Number(t.textContent.replace('−', '-')); if (Math.abs(v) >= 1000) t.textContent = fmt(v).replace('-', '−'); });
  }
}

/* points where a polyline meets the line (axis 0: x = v, axis 1: y = v); returns the other coordinates */
function hitsAt(poly, ax, v) {
  const out = [];
  for (let i = 0; i < poly.length - 1; i++) {
    const p = poly[i], q = poly[i + 1], a = p[ax] - v, b = q[ax] - v;
    if (a === 0 && b === 0) { out.push(p[1 - ax], q[1 - ax]); continue; }
    if (a * b <= 0 && p[ax] !== q[ax]) { const t = (v - p[ax]) / (q[ax] - p[ax]); out.push(p[1 - ax] + t * (q[1 - ax] - p[1 - ax])); }
  }
  return out;
}
/* a flashlight pointing down (rotated for the side light) */
const LAMP = '<svg viewBox="0 0 36 40" width="36" height="40"><rect x="12" y="1" width="12" height="16" rx="3" fill="#3a4254"/><path d="M8 17H28L33 28H3Z" fill="#f5c542" stroke="#c27a0e" stroke-width="2" stroke-linejoin="round"/><path d="M6 33L2 38M18 32V39M30 33L34 38" stroke="#e8a01e" stroke-width="2.6" stroke-linecap="round"/></svg>';
/** sweep a beam of light across G (axis 'x': top-down beam moving right; 'y': side beam moving down) and grow the shadow */
async function sweep(G, c, axis, poly, color, ms = 2600) {
  const X = axis === 'x', w = G.win, from = X ? w.xmin : w.ymax, to = X ? w.xmax : w.ymin;
  const st = { v: from, lo: null, hi: null };
  const beam = G.curve(() => ({ subs: [X ? [G.toPx(st.v, w.ymax), G.toPx(st.v, w.ymin)] : [G.toPx(w.xmin, st.v), G.toPx(w.xmax, st.v)]] }),
    { color: '#f5c542', width: 18, opacity: 0.42, cap: 'butt' }, 'u5l4-beam', G.layers.data);
  const bar = G.curve(() => { if (st.lo == null) return { subs: [] }; const P = (v) => (X ? G.toPx(v, G.axisY()) : G.toPx(G.axisX(), v)); return { subs: [[P(st.lo), P(st.hi)]] }; },
    { color, width: 9, opacity: 0.6, cap: 'butt' }, 'u5l4-grow', G.layers.data);
  const dots = svgEl('g', { class: 'u5l4-hits' }, G.layers.top);
  const lamp = h('div', 'u5l4-lamp' + (X ? '' : ' side'), LAMP); G.html.appendChild(lamp);
  const paint = () => {
    beam._bkDraw(); bar._bkDraw(); dots.innerHTML = '';
    hitsAt(poly, X ? 0 : 1, st.v).forEach((u) => { const [px, py] = X ? G.toPx(st.v, u) : G.toPx(u, st.v); svgEl('circle', { cx: px, cy: py, r: 7, class: 'u5l4-hit' }, dots); });
    const [lx, ly] = X ? G.toPx(st.v, w.ymax) : G.toPx(w.xmax, st.v); lamp.style.left = lx + 'px'; lamp.style.top = ly + 'px';
  };
  try {
    await tween(c, ms, (t) => {
      st.v = from + (to - from) * t;
      if (hitsAt(poly, X ? 0 : 1, st.v).length) { st.lo = st.lo == null ? st.v : Math.min(st.lo, st.v); st.hi = st.hi == null ? st.v : Math.max(st.hi, st.v); }
      paint();
    }, linear);
  } finally { G.remove(beam, bar); dots.remove(); lamp.remove(); }
}

/* ======================= Section 1: the same two questions, any form ======================= */
const C1 = [[3, 2], [-1, 4], [0, 2], [5, -2], [-1, 0]];
const COLL = {
  pairs: { form: 'pairs', pts: C1, name: 'a set of ordered pairs' },
  table: { form: 'table', pts: C1, name: 'a table of values' },
  map: { form: 'map', pts: C1, name: 'an arrow diagram' },
  e1a: { form: 'pairs', pts: [[2, 3], [0, 7], [4, 10], [6, 11], [-2, 3]], name: 'Example 1(a)', ex: true },
  e1b: { form: 'pairs', pts: [[5, 5], [0, 5], [-5, 5], [3, 11], [-9, 5]], name: 'Example 1(b)', ex: true },
  e4c: { form: 'map', pts: [[5, 1], [7, 3], [9, 1]], name: 'Example 4(c)', ex: true }
};
const collect = {
  title: 'Domain and range from pairs, a table or an arrow diagram',
  height: 380,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'pairs', label: 'Ordered pairs' }, { v: 'table', label: 'Table' }, { v: 'map', label: 'Arrow diagram' }, { sep: 'Check:' },
    { v: 'e1a', label: 'Example 1(a)' }, { v: 'e1b', label: 'Example 1(b)' }, { v: 'e4c', label: 'Example 4(c)' }],
  intro: (k) => (COLL[k].ex ? `${COLL[k].name}: check the class’s lists. Press <b>Next</b>.` : `One relation, shown as ${COLL[k].name}. The same relation is behind all three forms. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = COLL[k], pts = d.pts, xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), D = uniq(xs), R = uniq(ys);
    const LW = 540, P = panel(stage, LW + 20, 14, ex.W - LW - 34, 352, 'Domain and range');
    let hiX, hiY, xTok, yTok;
    if (d.form === 'pairs') {
      const box1 = add(stage, h('div', 'u5l4-pairs'), 24, 40); box1.style.width = (LW - 30) + 'px';
      const els = pts.map((p, i) => { const e = h('div', 'u5l4-pair', K(`(\\htmlClass{u5l4-px}{${nT(p[0])}},\\ \\htmlClass{u5l4-py}{${nT(p[1])}})`) + (i < pts.length - 1 ? ',' : '')); box1.appendChild(e); return e; });
      hiX = (i) => els[i].querySelector('.u5l4-px').classList.add('on');
      hiY = (i) => els[i].querySelector('.u5l4-py').classList.add('on');
      add(stage, h('div', 'u5l4-formtag', 'ordered pairs (x, y)'), 24, 6);
    } else if (d.form === 'table') {
      const tb = new ValueTable(stage, { x: 30, y: 90, headers: ['x', 'y'], rows: pts.map((p) => [p[0], p[1]]), layout: 'h', cellW: 80, cellH: 64, cls: 'u5l4-vt' });
      hiX = (i) => { tb.cell(i, 0).classList.add('bk-hl'); tb.heads[0].classList.add('bk-hl'); };
      hiY = (i) => { tb.cell(i, 1).classList.add('u5l4-hlr'); tb.heads[1].classList.add('u5l4-hlr'); };
      add(stage, h('div', 'u5l4-formtag', 'table of values'), 30, 40);
    } else {
      const M = new MappingDiagram(stage, { x: 40, y: 10, width: 440, height: 350, domain: D, range: R, pairs: pts, titles: ['Inputs', 'Outputs'] });
      hiX = (i) => { M.highlight('d', pts[i][0], true); const a = M.arrow(i); if (a) a.classList.add('u5l4-arA'); };
      hiY = (i) => { M.highlight('r', pts[i][1], true, 'u5l4-hotr'); const a = M.arrow(i); if (a) { a.classList.remove('u5l4-arA'); a.classList.add('u5l4-arR'); } };
    }
    const where = { pairs: 'the <b>first</b> coordinate of every pair', table: 'the <b>top row</b>, the x-row', map: 'where each <b>arrow starts</b> (the left oval)' }[d.form];
    const whereY = { pairs: 'the <b>second</b> coordinates', table: 'the <b>bottom row</b>', map: 'where each arrow <b>lands</b> (the right oval)' }[d.form];
    const rx = repeats(xs), ry = repeats(ys);
    return [
      { cap: `<b>Inputs</b> first: read ${where}.`,
        run: async (c) => { xTok = tokenRow(P, 'inputs', xs, 'dom'); for (let i = 0; i < pts.length; i++) { hiX(i); await pop(c, xTok.els[i], 300); await sleep(c, 140); } } },
      { cap: `Write each value <b>once</b>, in <b>increasing order</b>.` + (rx ? ` Here ${rx}.` : ' No value repeats here.'),
        run: async (c) => { await strike(c, xTok.els); const a = pline(P, `<b>Domain</b> ${T('D=' + listT(D))}`, 'dom u5l4-ans'); await fadeIn(c, a); } },
      { cap: `<b>Outputs</b>: read ${whereY}.`,
        run: async (c) => { yTok = tokenRow(P, 'outputs', ys, 'ran'); for (let i = 0; i < pts.length; i++) { hiY(i); await pop(c, yTok.els[i], 300); await sleep(c, 140); } } },
      { cap: `Once each, increasing.` + (ry ? ` Here ${ry}, so it is written once.` : ' No value repeats here.') + ` ${D.length} input${D.length > 1 ? 's' : ''}, ${R.length} output${R.length > 1 ? 's' : ''}.`,
        run: async (c) => { await strike(c, yTok.els); const a = pline(P, `<b>Range</b> ${T('R=' + listT(R))}`, 'ran u5l4-ans'); await fadeIn(c, a); } }
    ];
  }
};

/* ======================= Section 1: reading set notation ======================= */
const SR = {
  ge: { kind: 'R', v: 'y', I: [-3, INF, false, false], min: -6, max: 6, name: T('y\\ge -3') },
  lt: { kind: 'R', v: 'x', I: [-2, 5, false, true], min: -6, max: 6, name: T('-2\\le x<5') },
  list: { kind: 'list', vals: [2, 5, 9], min: 0, max: 10, name: 'a list' },
  W: { kind: 'W', v: 'n', I: [-INF, 4, false, false], min: -6, max: 6, name: T('n\\in W') },
  I: { kind: 'I', v: 'n', I: [-INF, 4, false, false], min: -6, max: 6, name: T('n\\in I') }
};
const setRead = {
  title: 'Reading a set out loud',
  height: 380,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SR).map((k) => ({ v: k, label: SR[k].name })),
  intro: (k) => (SR[k].kind === 'list' ? 'A set written as a <b>list</b>. Press <b>Next</b>.' : 'Read the set one piece at a time, and draw it on the number line. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = SR[k], W = ex.W, v = d.v;
    const N = new NumberLine(stage, { x: 30, y: 250, width: W - 60, height: 116, min: d.min, max: d.max });
    const read = add(stage, h('div', 'u5l4-read'), 0, 140); read.style.width = W + 'px';
    const say = (html) => { const s = h('span', 'u5l4-say', html); read.appendChild(s); return s; };
    if (d.kind === 'list') {
      const e = add(stage, h('div', 'u5l4-expr', K(`D=\\htmlClass{u5l4-q1}{\\{}\\htmlClass{u5l4-q2}{2,\\ 5,\\ 9}\\htmlClass{u5l4-q1}{\\}}`)), 0, 30); e.style.width = W + 'px';
      const lit = (q) => { e.querySelectorAll('.on').forEach((x) => x.classList.remove('on')); e.querySelectorAll('.u5l4-' + q).forEach((x) => x.classList.add('on')); };
      return [
        { cap: 'Braces with values inside: a <b>list</b>. The set holds exactly these values and nothing else.', run: async (c) => { lit('q1'); await fadeIn(c, say('“the set containing <b>2, 5 and 9</b>”')); } },
        { cap: 'Each value is one <b>dot</b> on the number line.', run: async (c) => { lit('q2'); for (const x of d.vals) { await pop(c, N.point(x, { color: 'amber' }), 320); await sleep(c, 120); } } },
        { cap: `Nothing in between: ${T('3')}, ${T('4')} and ${T('6.5')} are <b>not</b> in the set. That is why a list is right for separate values.`,
          run: async (c) => { for (const x of [3, 4, 6.5]) { const m = N.mark(x, '✗', { cls: 'u5l4-nox' }); await pop(c, m, 260); } } },
        { cap: 'Write each value <b>once</b>, in <b>increasing order</b>: tidy, and easy to check.', run: async (c) => { lit('none'); await fadeIn(c, say('each value once, smallest first')); } }
      ];
    }
    const S = { R: RR, W: 'W', I: 'I' }[d.kind], cnd = cond(v, d.I[0], d.I[1], d.I[2], d.I[3]);
    const e = add(stage, h('div', 'u5l4-expr', K(`\\htmlClass{u5l4-q1}{\\{${v}}\\htmlClass{u5l4-q2}{\\mid}\\htmlClass{u5l4-q3}{${cnd}},\\ \\htmlClass{u5l4-q4}{${v}\\in ${S}}\\htmlClass{u5l4-q1}{\\}}`)), 0, 30); e.style.width = W + 'px';
    const lit = (q) => { e.querySelectorAll('.on').forEach((x) => x.classList.remove('on')); e.querySelectorAll('.u5l4-' + q).forEach((x) => x.classList.add('on')); };
    const condSay = { ge: `${v} is greater than or equal to −3`, lt: `${v} is from −2 up to, but not including, 5`, W: `${v} is less than or equal to 4`, I: `${v} is less than or equal to 4` }[k];
    const condCap = {
      ge: `Then the <b>condition</b>: ${T('y\\ge -3')}, so ${T('-3')} and everything above it. ${T('\\ge')} means ${T('-3')} itself is <b>included</b> (solid dot).`,
      lt: `Then the <b>condition</b>: from ${T('-2')} (${T('\\le')}: included, solid dot) up to ${T('5')} (${T('<')}: not included, hollow dot).`,
      W: `Then the <b>condition</b>: ${T('n\\le 4')}, so 4 and everything below it.`,
      I: `Then the <b>condition</b>: ${T('n\\le 4')}, so 4 and everything below it.`
    }[k];
    const setCap = {
      R: `“and ${v} is a <b>real number</b>”: <b>every</b> point counts, decimals and fractions too, so the set is a solid bar.`,
      W: `“and n is a <b>whole number</b>”: 0, 1, 2, … so only <b>dots</b>: the set is just ${T('\\{0,1,2,3,4\\}')}.`,
      I: `“and n is an <b>integer</b>”: the dots run left <b>forever</b>, −1, −2, … For a count, use ${T('W')} or add a bound like ${T('n\\ge 0')}.`
    }[d.kind];
    let guide;
    return [
      { cap: `Braces mean “the set of”. The variable comes first: “the set of all <b>${v}</b> …”`, run: async (c) => { lit('q1'); await fadeIn(c, say(`“the set of all <b>${v}</b>`)); } },
      { cap: `The bar ${T('\\mid')} is read “<b>such that</b>”.`, run: async (c) => { lit('q2'); await fadeIn(c, say('<b>such that</b>')); } },
      { cap: condCap,
        run: async (c) => {
          lit('q3'); await fadeIn(c, say(condSay));
          guide = N.interval(d.I[0], d.I[1], { openA: d.I[2], openB: d.I[3], color: 'gray', width: 4, lift: 26 });
          await N.drawIn(guide, 700, c);
        } },
      { cap: setCap,
        run: async (c) => {
          lit('q4'); await fadeIn(c, say({ R: `and ${v} is a <b>real number</b>”`, W: 'and n is a <b>whole number</b>”', I: 'and n is an <b>integer</b>”' }[d.kind]));
          if (d.kind === 'R') await N.drawIn(N.interval(d.I[0], d.I[1], { openA: d.I[2], openB: d.I[3], color: 'amber' }), 800, c);
          else {
            const lo = d.kind === 'W' ? 0 : d.min;
            for (let x = lo; x <= d.I[1]; x++) { await pop(c, N.point(x, { color: d.kind === 'W' ? 'amber' : 'red' }), 220); await sleep(c, 60); }
            if (d.kind === 'I') await pop(c, N.mark(d.min - 0.5, '…', { cls: 'u5l4-dots3', lift: 4 }), 300);
          }
        } }
    ];
  }
};

/* ======================= Section 2: the shadow ======================= */
const SH = {
  zig: { poly: [[-5, 1], [-2, 4], [1, -2], [4, 2]], D: [-5, 4], R: [-2, 4], low: [1, -2], high: [-2, 4],
    rCap: `It runs from the <b>lowest</b> point, ${T('-2')}, to the <b>highest</b>, ${T('4')}. Neither one is an endpoint!` },
  e2b: { poly: [[-4, -1], [0, 3], [4, -1]], D: [-4, 4], R: [-1, 3], low: [4, -1], high: [0, 3], ex: true,
    rCap: `It runs from the lowest points, ${T('y=-1')} (the two endpoints), up to the peak, ${T('y=3')}.` }
};
const shadow = {
  title: 'Domain and range are shadows',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'zig', label: 'A zigzag' }, { sep: 'Check:' }, { v: 'e2b', label: 'Example 2(b)' }],
  intro: (k) => (SH[k].ex ? 'Example 2(b): the tent. Press <b>Next</b>.' : 'A graph with two <b>solid</b> endpoints. Where does its shadow fall? Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = SH[k], G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'Write it down');
    const a = d.poly[0], b = d.poly[d.poly.length - 1];
    let curve;
    return [
      { cap: `The graph: from the solid point ${ptT(a)} to the solid point ${ptT(b)}.`,
        run: async (c) => { curve = G.polyline(d.poly, { ends: ['closed', 'closed'] }); await G.drawIn(curve, 900, c); } },
      { cap: `Shine a light <b>straight down</b>. Wherever the light hits the graph, a <b>shadow</b> falls on the ${T('x')}-axis.`,
        run: (c) => sweep(G, c, 'x', d.poly, AMB) },
      { cap: `The shadow runs from ${T(nT(d.D[0]))} to ${T(nT(d.D[1]))}. Solid ends are included, so ${T('\\le')}. That shadow is the <b>domain</b>.`,
        run: async (c) => { await G.drawIn(G.shadeX(d.D[0], d.D[1], { band: true }), 600, c); await fadeIn(c, pline(P, `<b>Domain</b> ${T('D=' + ivT('x', [d.D[0], d.D[1]]))}`, 'dom u5l4-ans')); } },
      { cap: `Now shine the light <b>straight across</b>. The shadow on the ${T('y')}-axis is the <b>range</b>.`,
        run: (c) => sweep(G, c, 'y', d.poly, PUR) },
      { cap: d.rCap,
        run: async (c) => {
          for (const p of [d.low, d.high]) { const g = G.segment(p, [0, p[1]], { color: 'purple', width: 2, dash: '5 5' }); await G.drawIn(g, 300, c); }
          await G.reveal(G.point(d.low[0], d.low[1], { label: 'lowest', pos: 's', color: 'purple' }), c);
          await G.reveal(G.point(d.high[0], d.high[1], { label: 'highest', pos: 'n', color: 'purple' }), c);
          await G.drawIn(G.shadeY(d.R[0], d.R[1], { band: true }), 600, c);
          await fadeIn(c, pline(P, `<b>Range</b> ${T('R=' + ivT('y', [d.R[0], d.R[1]]))}`, 'ran u5l4-ans'));
        } }
    ];
  }
};

/* ======================= Section 2: isolated points ======================= */
const DT = {
  pts: { pts: [[-4, 1], [-2, 3], [0, -2], [2, 3], [2, -4]] },
  e2a: { pts: [[-4, -3], [-2, -1], [-1, 1], [0, 2], [2, 1]], ex: true }
};
const dots = {
  title: 'Separate points cast separate shadows',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'pts', label: 'Five points' }, { sep: 'Check:' }, { v: 'e2a', label: 'Example 2(a)' }],
  intro: (k) => (DT[k].ex ? 'Example 2(a): five isolated points. Press <b>Next</b>.' : 'Five <b>isolated</b> points: no line joins them. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = DT[k], pts = d.pts, xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'Write it down');
    const dupOf = (a) => a.filter((v, i) => a.indexOf(v) !== i)[0];
    const dx = dupOf(xs), dy = dupOf(ys);
    let xT, yT;
    return [
      { cap: 'Plot the points. Each one is on its own: nothing in between.',
        run: async (c) => { for (const p of pts) { await G.reveal(G.point(p[0], p[1], { coords: true, pos: p[1] >= 0 ? 'ne' : 'se' }), c); await sleep(c, 100); } } },
      { cap: `Light from above: each point drops its <b>own</b> shadow dot on the ${T('x')}-axis.` + (dx != null ? ` Two land on the <b>same</b> spot, ${T('x=' + nT(dx))}.` : ''),
        run: async (c) => {
          for (const p of pts) { await G.drawIn(G.segment(p, [p[0], 0], { color: 'amber', width: 2, dash: '5 5' }), 260, c); const s = G.point(p[0], 0, { color: 'amber', r: 7.5 }); await pop(c, s, 260); }
          xT = tokenRow(P, 'x-values', xs, 'dom'); await Promise.all(xT.els.map((e) => appear(c, e, 300)));
        } },
      { cap: `Separate shadow dots, so the domain is a <b>list</b>, each value once.`,
        run: async (c) => { await strike(c, xT.els); await fadeIn(c, pline(P, `<b>Domain</b> ${T('D=' + listT(uniq(xs)))}`, 'dom u5l4-ans')); } },
      { cap: `Light from the side: each point drops a shadow dot on the ${T('y')}-axis.` + (dy != null ? ` Two share the spot ${T('y=' + nT(dy))}.` : ''),
        run: async (c) => {
          for (const p of pts) { await G.drawIn(G.segment(p, [0, p[1]], { color: 'purple', width: 2, dash: '5 5' }), 260, c); const s = G.point(0, p[1], { color: 'purple', r: 7.5 }); await pop(c, s, 260); }
          yT = tokenRow(P, 'y-values', ys, 'ran'); await Promise.all(yT.els.map((e) => appear(c, e, 300)));
        } },
      { cap: `The range is a list too: ${uniq(ys).length} different ${T('y')}-values.`,
        run: async (c) => { await strike(c, yT.els); await fadeIn(c, pline(P, `<b>Range</b> ${T('R=' + listT(uniq(ys)))}`, 'ran u5l4-ans')); } }
    ];
  }
};

/* ======================= Section 2: arrows ======================= */
const AR = {
  ray: { draw: (G) => G.ray([-3, -1], [-1, 3]), key: [-3, -1], D: [-3, INF, false, false], R: [-1, INF, false, false], win: [-6, 6, -6, 6],
    c1: `A ray: it starts at the solid point ${ptT([-3, -1])}, and the <b>arrow</b> says it keeps going forever.`,
    cD: `The domain shadow starts at ${T('-3')} (solid: included) and runs right <b>forever</b>.`,
    cR: `The range shadow starts at ${T('-1')} and runs up <b>forever</b>.` },
  e2c: { draw: (G) => G.fn('3-abs(x)'), key: [0, 3], D: [-INF, INF], R: [-INF, 3, false, false], win: [-6, 6, -6, 6], ex: true,
    c1: `Example 2(c): two rays leave the vertex ${ptT([0, 3])}. Both arrows mean they go on forever.`,
    cD: `The domain shadow covers the <b>whole</b> ${T('x')}-axis: every ${T('x')} is used.`,
    cR: `The range shadow starts at the top, ${T('y=3')}, and runs down <b>forever</b>.` },
  e3b: { draw: (G) => G.ray([1, -2], [0, -1], { start: 'open' }), key: [1, -2], D: [-INF, 1, false, true], R: [-2, INF, true, false], win: [-6, 6, -6, 6], ex: true,
    c1: `Example 3(b): a ray from the <b>hollow</b> point ${ptT([1, -2])}, going up to the left forever.`,
    cD: `The domain shadow runs left forever and stops just short of ${T('1')} (hollow: ${T('<')}).`,
    cR: `The range shadow starts just above ${T('-2')} (hollow: ${T('>')}) and runs up forever.` },
  e4a: { draw: (G) => G.fn('0.5*x^2-3'), key: [0, -3], D: [-INF, INF], R: [-3, INF, false, false], win: [-6, 6, -5, 7], ex: true,
    c1: `Example 4(a): a curve with its lowest point at ${ptT([0, -3])}, and arrows on both ends.`,
    cD: `The curve spreads out forever both ways, so the domain shadow covers the <b>whole</b> ${T('x')}-axis.`,
    cR: `The range shadow starts at the lowest point, ${T('y=-3')}, and runs up forever.` }
};
const arrows = {
  title: 'Arrows mean “forever”',
  height: 470,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ray', label: 'A ray' }, { sep: 'Check:' }, { v: 'e2c', label: 'Example 2(c)' }, { v: 'e3b', label: 'Example 3(b)' }, { v: 'e4a', label: 'Example 4(a)' }],
  intro: (k) => (AR[k].ex ? 'Check an example with arrows. Press <b>Next</b>.' : 'What does an arrow do to the shadow? Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = AR[k], [x0, x1, y0, y1] = d.win;
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: x0, xmax: x1, ymin: y0, ymax: y1 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'Write it down');
    const big = { xmin: x0 * 4, xmax: x1 * 4, ymin: y0 * 4, ymax: y1 * 4, xstep: 4, ystep: 4 };
    return [
      { cap: d.c1,
        run: async (c) => { await G.drawIn(d.draw(G), 900, c); await G.reveal(G.point(d.key[0], d.key[1], { coords: true, pos: d.key[1] > 0 ? 'ne' : 'se', open: k === 'e3b', color: 'teal' }), c); } },
      { cap: `<b>Zoom out.</b> The graph is still going. However far out we look, it never stops.`,
        run: (c) => G.setWindow(big, c, 1500) },
      { cap: d.cD + ` ${T('D=' + ivT('x', d.D))}`,
        run: async (c) => { await G.drawIn(G.shadeX(d.D[0], d.D[1], { openA: d.D[2], openB: d.D[3], band: true }), 700, c); await fadeIn(c, pline(P, `<b>Domain</b> ${T('D=' + ivT('x', d.D))}`, 'dom u5l4-ans')); } },
      { cap: d.cR + ` ${T('R=' + ivT('y', d.R))}`,
        run: async (c) => { await G.drawIn(G.shadeY(d.R[0], d.R[1], { openA: d.R[2], openB: d.R[3], band: true }), 700, c); await fadeIn(c, pline(P, `<b>Range</b> ${T('R=' + ivT('y', d.R))}`, 'ran u5l4-ans')); } },
      { cap: `Back to the first view. An arrow on a shadow means the same as on the graph: <b>no end</b> on that side, so no number on that side of the inequality.`,
        run: (c) => G.setWindow({ xmin: x0, xmax: x1, ymin: y0, ymax: y1, xstep: 1, ystep: 1 }, c, 1300) }
    ];
  }
};

/* ======================= Section 2: solid and hollow endpoints ======================= */
const EN = {
  seg: { a: [-4, -2], b: [3, 2], zoom: [2.5, 3.3, 1.6, 2.4], walk: [2.9, 2.99, 2.999] },
  e3a: { a: [-3, 1], b: [4, 5], zoom: [3.5, 4.3, 4.6, 5.4], walk: [3.9, 3.99, 3.999], ex: true }
};
const ends = {
  title: 'Solid and hollow endpoints',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'seg', label: 'A segment' }, { sep: 'Check:' }, { v: 'e3a', label: 'Example 3(a)' }],
  intro: (k) => (EN[k].ex ? 'Example 3(a): a solid end and a hollow end. Press <b>Next</b>.' : 'One end solid, one end hollow. What changes? Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = EN[k], a = d.a, b = d.b, yAt = (x) => a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'Write it down');
    const D = [a[0], b[0], false, true], R = [a[1], b[1], false, true];
    const walkT = T('x=' + d.walk.map((x) => nT(x)).join(',\\ ') + ',\\ \\dots');
    let walker;
    return [
      { cap: `A segment: <b>solid</b> dot at ${ptT(a)}, <b>hollow</b> dot at ${ptT(b)}.`,
        run: async (c) => { await G.drawIn(G.segment(a, b, { closedA: true, openB: true }), 900, c); const la = G.label(a[0], a[1], T(pairTex(a[0], a[1])), { pos: 'se', cls: 'bk-ptlab' }), lb = G.label(b[0], b[1], T(pairTex(b[0], b[1])), { pos: 'nw', cls: 'bk-ptlab' }); await Promise.all([appear(c, la), appear(c, lb)]); } },
      { cap: `Solid dot: the point ${ptT(a)} <b>is on</b> the graph. ${T('x=' + nT(a[0]))} is used and ${T('y=' + nT(a[1]))} is produced: <b>included</b>, ${T('\\le')}.`,
        run: async (c) => { const r = G.point(a[0], a[1], { color: 'green', r: 13, cls: 'u5l4-ring' }); await pop(c, r, 400); } },
      { cap: `Hollow dot: the point ${ptT(b)} is <b>not</b> on the graph. Zoom in on it…`,
        run: async (c) => { await G.setWindow({ xmin: d.zoom[0], xmax: d.zoom[1], ymin: d.zoom[2], ymax: d.zoom[3] }, c, 1500); G.win.xstep = 0.1; G.win.ystep = 0.1; G.redraw(); } },
      { cap: `Walk toward the hole: ${walkT} As close to ${T(nT(b[0]))} as we like, but <b>never</b> ${T(nT(b[0]))}. There is no “last” ${T('x')}, so we write ${T('x<' + nT(b[0]))}.`,
        run: async (c) => {
          walker = G.point(d.zoom[0] + 0.05, yAt(d.zoom[0] + 0.05), { color: 'red', r: 7, label: T('x=' + nT(d.zoom[0] + 0.05)), pos: 'se' });
          await pop(c, walker, 300);
          for (const x of d.walk) { await G.move(c, walker, x, yAt(x), 700); walker.label.innerHTML = T('x=' + nT(x)); await sleep(c, 450); }
        } },
      { cap: `Zoom back out. Domain shadow: solid at ${T(nT(a[0]))}, hollow at ${T(nT(b[0]))}.`,
        run: async (c) => {
          G.remove(walker); G.win.xstep = 1; G.win.ystep = 1;
          await G.setWindow({ xmin: -6, xmax: 6, ymin: -6, ymax: 6 }, c, 1300);
          await G.drawIn(G.shadeX(D[0], D[1], { openB: true, band: true }), 700, c);
          await fadeIn(c, pline(P, `<b>Domain</b> ${T('D=' + ivT('x', D))}`, 'dom u5l4-ans'));
        } },
      { cap: `Range shadow: solid at ${T(nT(a[1]))}, hollow at ${T(nT(b[1]))}. The hollow end gets ${T('<')}, the solid end ${T('\\le')}.`,
        run: async (c) => { await G.drawIn(G.shadeY(R[0], R[1], { openB: true, band: true }), 700, c); await fadeIn(c, pline(P, `<b>Range</b> ${T('R=' + ivT('y', R))}`, 'ran u5l4-ans')); } }
    ];
  }
};

/* ======================= Section 2: circles and ellipses ======================= */
const CI = {
  cir: { hc: -1, kc: 2, rx: 3, ry: 3, win: [-7, 5, -4, 8], v: ['x', 'y'] },
  e4b: { hc: 0, kc: 0, rx: 3, ry: 2, win: [-5, 5, -5, 5], v: ['u', 'v'], ellipse: true, ex: true },
  e4d: { hc: 3, kc: -2, rx: 6, ry: 6, win: [-5, 11, -10, 6], v: ['x', 'y'], ex: true }
};
const pm = (a, s, r) => `${nT(a)}${s}${nT(r)}=${nT(s === '-' ? a - r : a + r)}`;
const circle = {
  title: 'Circles and ellipses: centre, then reach',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'cir', label: 'A circle' }, { sep: 'Check:' }, { v: 'e4b', label: 'Example 4(b)' }, { v: 'e4d', label: 'Example 4(d)' }],
  intro: (k) => (k === 'e4d' ? 'Example 4(d): no picture given, so draw one. Press <b>Next</b>.' : k === 'e4b' ? 'Example 4(b): the ellipse. Press <b>Next</b>.' : 'A circle: find its shadows from the centre and radius. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = CI[k], [x0, x1, y0, y1] = d.win, [u, v] = d.v, hc = d.hc, kc = d.kc;
    const G = new Graph(stage, { x: 14, y: 14, width: 440, height: 440, xmin: x0, xmax: x1, ymin: y0, ymax: y1, xtitle: u, ytitle: v });
    const P = panel(stage, 474, 14, ex.W - 488, 440, 'Write it down');
    const L = hc - d.rx, Rt = hc + d.rx, Lo = kc - d.ry, Hi = kc + d.ry;
    const ring = []; for (let i = 0; i <= 160; i++) { const t = (i / 160) * 2 * Math.PI; ring.push([hc + d.rx * Math.cos(t), kc + d.ry * Math.sin(t)]); }
    const c1 = d.ellipse ? `An ellipse centred at the origin. It reaches ${T('3')} units left and right, and ${T('2')} units down and up.`
      : `${k === 'e4d' ? 'Example 4(d): a' : 'A'} circle with centre ${T('(h,k)=' + pairTex(hc, kc))} and radius ${T(nT(d.rx))}. Start at the centre.`;
    const cx = d.ellipse ? `Leftmost ${T(u + '=' + nT(L))}, rightmost ${T(u + '=' + nT(Rt))}.` : `Go the radius left and right: ${T(pm(hc, '-', d.rx))} and ${T(pm(hc, '+', d.rx))}.`;
    const cy = d.ellipse ? `Lowest ${T(v + '=' + nT(Lo))}, highest ${T(v + '=' + nT(Hi))}.` : `Go the radius down and up: ${T(pm(kc, '-', d.ry))} and ${T(pm(kc, '+', d.ry))}.`;
    const labX = (s) => T(nT(s === '-' ? L : Rt)), labY = (s) => T(nT(s === '-' ? Lo : Hi));
    const calc = (word, s, val, cls) => pline(P, `<span class="u5l4-tl">${word}</span> ${d.ellipse ? T((cls === 'dom' ? u : v) + '=' + nT(val)) : T(pm(cls === 'dom' ? hc : kc, s, cls === 'dom' ? d.rx : d.ry))}`, cls + ' u5l4-calc');
    return [
      { cap: c1, run: (c) => G.reveal(G.point(hc, kc, { color: 'ink', label: 'centre', pos: 'sw' }), c) },
      { cap: cx,
        run: async (c) => {
          await G.drawIn(G.segment([hc, kc], [L, kc], { color: 'amber', width: 3 }), 400, c); await G.reveal(G.point(L, kc, { color: 'amber', label: labX('-'), pos: 'w' }), c); await fadeIn(c, calc('leftmost', '-', L, 'dom'));
          await G.drawIn(G.segment([hc, kc], [Rt, kc], { color: 'amber', width: 3 }), 400, c); await G.reveal(G.point(Rt, kc, { color: 'amber', label: labX('+'), pos: 'e' }), c); await fadeIn(c, calc('rightmost', '+', Rt, 'dom'));
        } },
      { cap: cy,
        run: async (c) => {
          await G.drawIn(G.segment([hc, kc], [hc, Lo], { color: 'purple', width: 3 }), 400, c); await G.reveal(G.point(hc, Lo, { color: 'purple', label: labY('-'), pos: 's' }), c); await fadeIn(c, calc('lowest', '-', Lo, 'ran'));
          await G.drawIn(G.segment([hc, kc], [hc, Hi], { color: 'purple', width: 3 }), 400, c); await G.reveal(G.point(hc, Hi, { color: 'purple', label: labY('+'), pos: 'n' }), c); await fadeIn(c, calc('highest', '+', Hi, 'ran'));
        } },
      { cap: `The ${d.ellipse ? 'ellipse' : 'circle'} passes through all four points: they are its <b>extreme</b> points. It is one closed loop, so every end is <b>included</b>.`,
        run: (c) => G.drawIn(G.polyline(ring, { closed: true }), 1100, c) },
      { cap: `Domain shadow: from ${T(nT(L))} to ${T(nT(Rt))}, ends included.`,
        run: async (c) => { await G.drawIn(G.shadeX(L, Rt, { band: true }), 600, c); await fadeIn(c, pline(P, `<b>Domain</b> ${T('D=' + ivT(u, [L, Rt]))}`, 'dom u5l4-ans')); } },
      { cap: `Range shadow: from ${T(nT(Lo))} to ${T(nT(Hi))}, ends included.`,
        run: async (c) => { await G.drawIn(G.shadeY(Lo, Hi, { band: true }), 600, c); await fadeIn(c, pline(P, `<b>Range</b> ${T('R=' + ivT(v, [Lo, Hi]))}`, 'ran u5l4-ans')); } }
    ];
  }
};

/* ======================= Section 3: counted or measured ======================= */
const RW = {
  bath: { v: ['t', 'V'], f: (t) => 20 + 8 * t, xs: [0, 3, 6, 9, 12, 15], eq: 'V=20+8t', win: [0, 16.5, 0, 165], steps: [1, 20], zoom: [5, 7, 56, 80], zs: [0.25, 2],
    lo: 0, hi: 15, discrete: false },
  e5: { v: ['n', 'C'], f: (n) => 350 + 25 * n, xs: [50, 100, 150, 200, 250, 300], eq: 'C=350+25n', win: [0, 330, 0, 8500], steps: [50, 1000], zoom: [48, 61, 1575, 1900], zs: [1, 25],
    lo: 50, hi: 300, discrete: true, ex: true }
};
const realWorld = {
  title: 'Counted or measured?',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'bath', label: 'Filling a bath' }, { sep: 'Check:' }, { v: 'e5', label: 'Example 5' }],
  intro: (k) => (k === 'e5' ? `Example 5: ${T('C=350+25n')} for ${T('n')} guests, from 50 to 300. Press <b>Next</b>.`
    : `A bath already has 20 L in it and fills at 8 L per minute for 15 minutes: ${T('V=20+8t')}. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = RW[k], [u, v] = d.v, ys = d.xs.map(d.f), W = ex.W;
    const tb = new ValueTable(stage, { x: 12, y: 40, headers: [u, v], rows: d.xs.map((x, i) => [x, nT(ys[i])]), hide: 1, tap: false, cellW: 70, cellH: 50 });
    add(stage, h('div', 'u5l4-formtag', T(d.eq)), 14, 8);
    const G = new TGraph(stage, { x: 178, y: 14, width: 380, height: 440, xmin: d.win[0], xmax: d.win[1], ymin: d.win[2], ymax: d.win[3], xstep: d.steps[0], ystep: d.steps[1], xtitle: u, ytitle: v });
    const P = panel(stage, 572, 14, W - 586, 440, 'Write it down');
    const yLo = d.f(d.lo), yHi = d.f(d.hi);
    const all = svgEl('g', { class: 'u5l4-all' }, G.layers.data); G.layers.all = all;
    const zoomWin = { xmin: d.zoom[0], xmax: d.zoom[1], ymin: d.zoom[2], ymax: d.zoom[3] };
    const back = { xmin: d.win[0], xmax: d.win[1], ymin: d.win[2], ymax: d.win[3], xstep: d.steps[0], ystep: d.steps[1] };
    const capFill = k === 'e5' ? `Complete the table: ${T('350+25(50)=' + nT(ys[0]))}, and so on, up to ${T('350+25(300)=' + nT(ys[5]))}.`
      : `Complete the table: ${T('20+8(0)=20')}, ${T('20+8(3)=44')}, … up to ${T('20+8(15)=140')}.`;
    let seg;
    return [
      { cap: capFill, run: (c) => tb.fill(c, { col: 1, stagger: 150 }) },
      { cap: 'Plot the six ordered pairs.',
        run: async (c) => { for (let i = 0; i < d.xs.length; i++) { tb.highlight(i, true); await G.reveal(G.point(d.xs[i], ys[i], { color: 'teal', r: 6.5 }), c, 260); tb.highlight(i, false); } } },
      { cap: d.discrete ? `Now picture <b>every</b> possible booking: ${T('n=50,\\ 51,\\ 52,\\ \\dots,\\ 300')}. That is 251 dots, and from here they look like a line…`
        : `Now <b>every</b> time from 0 to 15 minutes: ${T('t=2.5')}, ${T('t=7.25')}, any value at all. The points fill in a <b>solid segment</b>.`,
        run: async (c) => {
          if (d.discrete) { for (let n = d.lo; n <= d.hi; n++) G.point(n, d.f(n), { color: 'teal', r: 3, layer: 'all', cls: 'u5l4-mini' }); await appear(c, all, 900); }
          else { seg = G.segment([d.lo, yLo], [d.hi, yHi], { closedA: true, closedB: true }); await G.drawIn(seg, 1000, c); }
        } },
      { cap: d.discrete ? `…but <b>zoom in</b>: they are <b>separate dots</b>, one per whole guest, $25 apart. Nobody books 50.5 guests: the guests are <b>counted</b>.`
        : `<b>Zoom in</b>: still solid, <b>no gaps</b>. Time is <b>measured</b>, so every real value between counts.`,
        run: async (c) => { await G.setWindow(zoomWin, c, 1500); G.win.xstep = d.zs[0]; G.win.ystep = d.zs[1]; G.redraw(); } },
      { cap: d.discrete ? `Domain: whole numbers from 50 to 300. ${T('D=' + ivT('n', [50, 300], 'W'))}`
        : `Domain: every real time from 0 to 15 minutes. ${T('D=' + ivT('t', [0, 15]))}`,
        run: async (c) => {
          await G.setWindow(back, c, 1300);
          if (d.discrete) { await G.reveal(G.point(d.lo, yLo, { color: 'amber', r: 7, label: T(pairTex(d.lo, nT(yLo))), pos: 'se' }), c); await G.reveal(G.point(d.hi, yHi, { color: 'amber', r: 7, label: T(pairTex(d.hi, nT(yHi))), pos: 'w' }), c); }
          else await G.drawIn(G.shadeX(d.lo, d.hi), 600, c);
          await fadeIn(c, pline(P, `<b>Domain</b><br>${T('D=' + ivT(u, [d.lo, d.hi], d.discrete ? 'W' : RR))}`, 'dom u5l4-ans u5l4-sm'));
        } },
      { cap: d.discrete ? `Range: ${T('C')} climbs in steps of 25, from ${T(nT(yLo))} to ${T(nT(yHi))}. List it with “…”.`
        : `Range: every volume from ${T(nT(yLo))} to ${T(nT(yHi))} litres.`,
        run: async (c) => {
          if (!d.discrete) await G.drawIn(G.shadeY(yLo, yHi), 600, c);
          const r = d.discrete ? T(`R=\\{${nT(yLo)},\\ ${nT(yLo + 25)},`) + ' ' + T(`${nT(yLo + 50)},\\ \\dots,\\ ${nT(yHi)}\\}`) : T('R=' + ivT(v, [yLo, yHi]));
          await fadeIn(c, pline(P, `<b>Range</b><br>${r}`, 'ran u5l4-ans u5l4-sm'));
        } }
    ];
  }
};

/* ======================= Section 3: which notation? ======================= */
const WH = {
  e1a: { label: 'Example 1(a)', what: `Example 1(a): five ordered pairs.`, path: ['q1', 'list'],
    caps: ['Five ordered pairs: yes, the values can be listed one by one.', 'A <b>list</b> in braces: each value once, in increasing order.'],
    ans: [`D=${listT([-2, 0, 2, 4, 6])}`, `R=${listT([3, 7, 10, 11])}`] },
  e3a: { label: 'Example 3(a)', what: `Example 3(a): a segment, solid at ${T('(-3,1)')}, hollow at ${T('(4,5)')}.`, path: ['q1', 'sb', 'signs', 'nset'],
    caps: ['A segment: unbroken, so infinitely many values. They can’t be listed.', '<b>Set-builder notation</b>.', 'The solid end gets ' + T('\\le') + ', the hollow end gets ' + T('<') + '.', 'Points on a graph can have any real coordinates: ' + T('\\in\\mathbb{R}') + '.'],
    ans: [`D=${ivT('x', [-3, 4, false, true])}`, `R=${ivT('y', [1, 5, false, true])}`] },
  e5: { label: 'Example 5 guests', what: `Example 5: from 50 to 300 guests.`, path: ['q1', 'sb', 'signs', 'nset'],
    caps: ['The guest counts 50, 51, …, 300 are separate, but there are 251 of them: too many to write out.', '<b>Set-builder notation</b>.', '“At least 50” and “at most 300” both include the end: ' + T('\\le') + '.', 'Guests are <b>counted</b>: ' + T('\\in W') + '.'],
    ans: [`D=${ivT('n', [50, 300], 'W')}`] },
  wu: { label: 'Warm-up heights', what: 'Warm-up: rider heights on The Cyclone.', path: ['q1', 'sb', 'signs', 'nset'],
    caps: ['Any height from 120 to 195 cm is allowed, like 150.5 cm: infinitely many. They can’t be listed.', '<b>Set-builder notation</b>.', '“At least 120” and “no taller than 195” both include the end: ' + T('\\le') + '.', 'Height is <b>measured</b>: ' + T('\\in\\mathbb{R}') + '.'],
    ans: [`${ivT('h', [120, 195])}`] }
};
const which = {
  title: 'List or set-builder? Which signs? Which numbers?',
  height: 400,
  minW: 920, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(WH).map((k) => ({ v: k, label: WH[k].label })),
  intro: (k) => WH[k].what + ' Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = WH[k], W = ex.W, mid = W / 2;
    const F = new Flowchart(stage, { x: 0, y: 0, width: W, height: 400,
      nodes: {
        q1: { x: mid, y: 44, w: 470, h: 66, html: '<b>Can the values be listed one by one?</b>separate points, a table, an arrow diagram', cls: 'bk-round' },
        list: { x: 190, y: 172, w: 330, h: 86, html: '<b>Yes: a list</b>in braces, each value once, in increasing order', color: 'amber' },
        sb: { x: W - 250, y: 172, w: 400, h: 86, html: '<b>No: set-builder notation</b>an unbroken graph, or far too many values', color: 'purple' },
        signs: { x: W - 385, y: 320, w: 280, h: 100, html: '<b>Which signs?</b>solid end: ≤ ≥<br>hollow end: &lt; &gt;<br>arrow: no bound', color: 'blue' },
        nset: { x: W - 115, y: 320, w: 210, h: 100, html: '<b>Which numbers?</b>counted: <i>W</i><br>measured: ℝ', color: 'green' }
      },
      edges: [{ from: 'q1', to: 'list', label: 'yes', route: 'vhv' }, { from: 'q1', to: 'sb', label: 'no', route: 'vhv' }, { from: 'sb', to: 'signs', route: 'vhv' }, { from: 'signs', to: 'nset' }] });
    void F;
    const card = add(stage, box(h('div', 'u5l4-acard', `<div class="u5l4-ph">${d.label}</div>`), 372, 124), 10, 262);
    const steps = d.path.map((id, i) => ({ cap: d.caps[i], run: (c) => (i ? F.go(c, d.path[i - 1], id).then(() => F.visit(c, id)) : F.visit(c, id)) }));
    steps.push({ cap: 'So the answer is written like this.', run: async (c) => { for (const a of d.ans) await fadeIn(c, pline(card, T(a), 'u5l4-ans')); } });
    return steps;
  }
};

/* ======================= warm-up: Ride Restrictions ======================= */
const KIDS = [{ n: 'Ava', cm: 118, c: '#5a96d2', ok: false, why: '2 cm short' }, { n: 'Ben', cm: 120, c: '#3ca05a', ok: true, why: 'exactly 120 counts' },
  { n: 'Cleo', cm: 163, c: '#965ab4', ok: true, why: 'well inside' }, { n: 'Dev', cm: 196, c: '#e6822a', ok: false, why: '1 cm too tall' }];
function mountWarm() {
  const host = document.getElementById('u5l4-kids'); if (!host) return;
  const s = 1.2, base = 300, Wd = 440, X = (i) => 135 + i * 88, Y = (cm) => base - cm * s;
  let svg = `<svg viewBox="0 0 ${Wd} 360" width="${Wd}" height="360" class="u5l4-kidsvg" aria-label="Four friends beside a height post with lines at 120 cm and 195 cm">`;
  svg += `<rect x="52" y="${Y(215)}" width="20" height="${215 * s}" fill="#ffecb3" stroke="#c88c14" stroke-width="1.5"/>`;
  for (let cm = 0; cm <= 210; cm += 10) svg += `<line x1="72" x2="${cm % 50 ? 64 : 58}" y1="${Y(cm)}" y2="${Y(cm)}" stroke="#c88c14" stroke-width="1.2"/>`;
  [[120, 'MIN 120'], [195, 'MAX 195']].forEach(([cm, t]) => { svg += `<line x1="52" x2="${Wd - 8}" y1="${Y(cm)}" y2="${Y(cm)}" stroke="#d23c32" stroke-width="3"/><text x="46" y="${Y(cm) + 6}" text-anchor="end" class="u5l4-kt">${t.split(' ')[0]}</text><text x="46" y="${Y(cm) + 24}" text-anchor="end" class="u5l4-kt">${t.split(' ')[1]}</text>`; });
  svg += `<line x1="40" x2="${Wd - 4}" y1="${base}" y2="${base}" stroke="#1e2d46" stroke-width="2.5"/>`;
  KIDS.forEach((k, i) => {
    const x = X(i), kh = k.cm * s, r = 0.09 * kh;
    svg += `<g class="u5l4-kid" data-tap role="button" tabindex="0" data-i="${i}">`
      + `<rect x="${x - 26}" y="${base - kh - 4}" width="52" height="${kh + 60}" fill="transparent"/>`
      + `<rect x="${x - 10}" y="${base - 0.47 * kh}" width="8" height="${0.47 * kh}" rx="2" fill="${k.c}" filter="brightness(.8)"/><rect x="${x + 2}" y="${base - 0.47 * kh}" width="8" height="${0.47 * kh}" rx="2" fill="${k.c}"/>`
      + `<rect x="${x - 16}" y="${base - (kh - 2 * r - 1)}" width="32" height="${kh - 2 * r - 1 - 0.44 * kh}" rx="6" fill="${k.c}"/>`
      + `<circle cx="${x}" cy="${base - kh + r}" r="${r}" fill="${k.c}" opacity=".55"/>`
      + `<text x="${x}" y="${base + 24}" text-anchor="middle" class="u5l4-kn">${k.n}</text><text x="${x}" y="${base + 46}" text-anchor="middle" class="u5l4-kc">${k.cm} cm</text>`
      + `<g class="u5l4-verdict ${k.ok ? 'ok' : 'no'}"><circle cx="${x}" cy="${base - kh - 26}" r="17"/><text x="${x}" y="${base - kh - 19}" text-anchor="middle">${k.ok ? '✓' : '✗'}</text></g></g>`;
  });
  host.innerHTML = svg + '</svg>';
  const why = h('div', 'u5l4-why', '&nbsp;'); host.appendChild(why);
  host.querySelectorAll('.u5l4-kid').forEach((g) => g.addEventListener('click', () => { const k = KIDS[g.dataset.i]; g.classList.add('shown'); why.innerHTML = `<b>${k.n}</b>, ${k.cm} cm: ${k.ok ? '<span class="u5l4-okt">may ride</span>' : '<span class="u5l4-not">may not ride</span>'} (${k.why}).`; }));

  // the track
  const tr = document.getElementById('u5l4-track'); if (!tr) return;
  const TW = Math.min(500, tr.clientWidth || 500); // CSS sets the track width (smaller on one-screen pages)
  const G = new Graph(tr, { width: TW, height: Math.round(TW * 330 / 500), xmin: 0, xmax: 800, ymin: -14, ymax: 46, xstep: 100, ystep: 10, xlabels: 200, ylabels: 10, xtitle: 'd', ytitle: 'h', fontSize: 17 });
  const [ux0, uy0] = G.toPx(0, 0), [ux1, uy1] = G.toPx(800, -14);
  svgEl('rect', { x: ux0, y: uy0, width: ux1 - ux0, height: uy1 - uy0, fill: '#966e46', 'fill-opacity': 0.18 }, G.layers.bg);
  G.label(660, -8, '<i>underground</i>', { cls: 'u5l4-under' });
  const bz = (p0, p1, p2, p3, n = 30) => { const o = []; for (let i = 1; i <= n; i++) { const t = i / n, m = 1 - t; o.push([0, 1].map((j) => m * m * m * p0[j] + 3 * m * m * t * p1[j] + 3 * m * t * t * p2[j] + t * t * t * p3[j])); } return o; };
  const trk = [[0, 5], [60, 5]];
  [[[60, 5], [105, 5], [105, 40], [150, 40]], [[150, 40], [205, 40], [205, -6], [260, -6]], [[260, -6], [320, -6], [320, 25], [380, 25]], [[380, 25], [425, 25], [425, 8], [470, 8]],
    [[470, 8], [515, 8], [515, 18], [560, 18]], [[560, 18], [620, 18], [620, 5], [680, 5]]].forEach((q) => trk.push(...bz(...q)));
  trk.push([800, 5]);
  G.polyline(trk, { color: 'red', width: 4.5 });
  [0, 1, 2].forEach((i) => { const [a, b] = G.toPx(8 + i * 16, 10.5), [c2, d2] = G.toPx(22 + i * 16, 6.2); svgEl('rect', { x: a, y: b, width: c2 - a, height: d2 - b, rx: 2, fill: '#5a96d2' }, G.layers.top); });
  const done = {};
  const act = async (k) => {
    if (done[k]) return; done[k] = true; const c = liveCtx();
    if (k === 'ext') { await G.reveal(G.point(150, 40, { color: 'purple', label: 'highest 40 m', pos: 'e' }), c); await G.reveal(G.point(260, -6, { color: 'purple', label: 'lowest −6 m', pos: 'sw' }), c); }
    if (k === 'x') { await G.drawIn(G.shadeX(0, 800, { band: true }), 900, c); G.label(330, -14, '<b>0 to 800 m</b>', { pos: 'n', cls: 'bk-ptlab u5l4-dlab' }); }
    if (k === 'y') { if (!done.ext) await act('ext'); await G.drawIn(G.shadeY(-6, 40, { band: true }), 900, c); }
  };
  document.querySelectorAll('[data-track]').forEach((b) => b.addEventListener('click', () => act(b.dataset.track)));
  document.querySelectorAll('[data-wu]').forEach((b) => b.addEventListener('click', () => {
    const n = b.dataset.wu;
    if (n === '1') host.querySelectorAll('.u5l4-kid').forEach((g) => g.classList.add('shown'));
    if (n === '2') act('ext');
    if (n === '3') { act('x'); act('y'); }
  }));
}

/* ======================= static figures ======================= */
const small = (host, o = {}) => new Graph(host, Object.assign({ width: 290, height: 290, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, xlabels: 2, ylabels: 2, fontSize: 16 }, o));
const SHC = 'u5l4-sh';   // shadows that appear with the answer
function mountFigures() {
  const F = {};
  document.querySelectorAll('[data-fig]').forEach((el) => (F[el.dataset.fig] = el));
  if (F.e2a) {
    const G = small(F.e2a), P = [[-4, -3], [-2, -1], [-1, 1], [0, 2], [2, 1]];
    P.forEach((p) => G.point(p[0], p[1], { color: 'ink', r: 5.5 }));
    P.forEach((p) => { G.point(p[0], 0, { color: 'amber', r: 6, cls: SHC }); G.point(0, p[1], { color: 'purple', r: 6, cls: SHC }); });
  }
  if (F.e2b) {
    const G = small(F.e2b);
    G.shadeX(-4, 4, { width: 7 }); G.shadeY(-1, 3, { width: 7 });
    G.polyline([[-4, -1], [0, 3], [4, -1]], { color: 'ink', width: 3, ends: ['closed', 'closed'] });
    G.label(2.6, -3.3, 'domain shadow', { cls: 'u5l4-shlab', color: AMB }); G.label(0.3, 4.5, 'range shadow', { pos: 'e', cls: 'u5l4-shlab', color: PUR });
  }
  if (F.e2c) {
    const G = small(F.e2c);
    G.fn('3-abs(x)', { color: 'ink', width: 3 });
    G.shadeX(-INF, INF, { cls: SHC }); G.shadeY(-INF, 3, { cls: SHC });
  }
  if (F.e3a) {
    const G = small(F.e3a, { width: 330, height: 330 });
    G.segment([-3, 1], [4, 5], { closedA: true, openB: true, color: 'ink', width: 3 });
    G.shadeX(-3, 4, { openB: true, cls: SHC }); G.shadeY(1, 5, { openB: true, cls: SHC });
  }
  if (F.e3b) {
    const G = small(F.e3b, { width: 330, height: 330 });
    G.ray([1, -2], [0, -1], { start: 'open', color: 'ink', width: 3 });
    G.shadeX(-INF, 1, { openB: true, cls: SHC }); G.shadeY(-2, INF, { openA: true, cls: SHC });
  }
  if (F.e4a) {
    const G = small(F.e4a, { width: 330, height: 360, ymin: -4.6, ymax: 6.9, xlabels: 1, ylabels: 1 });
    G.fn('0.5*x^2-3', { color: 'ink', width: 3 });
    G.shadeX(-INF, INF, { cls: SHC }); G.shadeY(-3, INF, { cls: SHC });
  }
  if (F.e4b) {
    const G = small(F.e4b, { width: 360, height: 280, xmin: -4.6, xmax: 4.6, ymin: -3.6, ymax: 3.6, xlabels: 1, ylabels: 1, xtitle: 'u', ytitle: 'v' });
    const ring = []; for (let i = 0; i <= 120; i++) { const t = (i / 120) * 2 * Math.PI; ring.push([3 * Math.cos(t), 2 * Math.sin(t)]); }
    G.polyline(ring, { closed: true, color: 'ink', width: 3 });
    G.shadeX(-3, 3, { cls: SHC }); G.shadeY(-2, 2, { cls: SHC });
  }
  if (F.e4c) new MappingDiagram(F.e4c, { width: 300, height: 230, domain: [5, 7, 9], range: [1, 3], pairs: [[5, 1], [7, 3], [9, 1]], titles: null, color: COLORS.ink });
  if (F.e4d) {
    const G = small(F.e4d, { width: 220, height: 220, xmin: -5, xmax: 11, ymin: -10, ymax: 6, xlabels: 4, ylabels: 4, fontSize: 15 });
    const ring = []; for (let i = 0; i <= 120; i++) { const t = (i / 120) * 2 * Math.PI; ring.push([3 + 6 * Math.cos(t), -2 + 6 * Math.sin(t)]); }
    G.polyline(ring, { closed: true, color: 'ink', width: 3 }); G.point(3, -2, { color: 'ink', r: 4.5 });
    G.shadeX(-3, 9); G.shadeY(-8, 4);
  }
  if (F.e5t) {
    const xs = [50, 100, 150, 200, 250, 300];
    new ValueTable(F.e5t, { headers: ['n\\ \\text{(guests)}', 'C\\ \\text{(dollars)}'], headW: 170, rows: xs.map((n) => [n, { html: `<span data-reveal>${T(nT(350 + 25 * n))}</span>` }]), layout: 'h', cellW: 108, cellH: 54 });
  }
  if (F.e5g) {
    const G = new TGraph(F.e5g, { width: 440, height: 400, xmin: 0, xmax: 330, ymin: 0, ymax: 8500, xstep: 50, ystep: 1000, xtitle: 'n', ytitle: 'C', fontSize: 16 });
    [50, 100, 150, 200, 250, 300].forEach((n) => G.point(n, 350 + 25 * n, { color: 'red', r: 6, cls: SHC, label: nT(350 + 25 * n), tex: true, pos: 'w', labelCls: SHC }));
  }
  // the three "features" icons
  document.querySelectorAll('[data-feat]').forEach((el) => {
    const G = new Graph(el, { width: 110, height: 96, xmin: -3, xmax: 3, ymin: -2.4, ymax: 2.6, numbers: false, xtitle: '', ytitle: '', arrows: false, pad: 6 });
    const f = el.dataset.feat;
    if (f === 'dots') [[-2, 1], [-1, -1], [1, 2], [2, 0.5]].forEach((p) => G.point(p[0], p[1], { color: 'ink', r: 4.5 }));
    if (f === 'arrow') G.ray([-2, -1.5], [0, 0.5], { color: 'ink', width: 3 });
    if (f === 'ends') G.segment([-2, -1], [2, 1.6], { closedA: true, openB: true, color: 'ink', width: 3 });
  });
}

mountFigures();
mountWarm();
mountExplainers({ collect, setRead, shadow, dots, arrows, ends, circle, realWorld, which });
