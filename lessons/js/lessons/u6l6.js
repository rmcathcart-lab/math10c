/* Math 10C · Unit 6 · Lesson 6 — Slope, Linear Graphs, Distance and Midpoint: A Coordinate Geometry Review.
 * Static figures (warm-up park map, tools-at-a-glance minis, Example 5 plotting grid, Example 7 triangle, review Q1 grid)
 * and the explainers:
 *   hunt (warm-up: one tool per clue — midpoint, distance, slope; hunter B's mistake), distance (count vs subtract; the
 *   right triangle hiding in a slanted segment), midpoint (half the run and half the rise; backwards: the same step
 *   again), stair (the slope triangle slides and scales; a steepness dial; Ex 3a), parPerp (parallel = copies of the
 *   slope triangle; perpendicular = the triangle turned 90°; Ex 3b, 3c), linear (Ex 4 table → graph → intercepts →
 *   domain/range; Ex 4d; how many intercepts), whichTool (★ a quadrilateral travels a which-tool flowchart while each
 *   side's slope and length appear on the grid), collinear (Ex 6; when the fixed point is the odd one), triangle (Ex 7:
 *   side lengths, then a right angle two ways).
 * Colours (whole unit): run amber, rise purple, segments blue. */
import {
  h, tex, add, box, Graph, ValueTable, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween,
  pairTex, texNum, svgEl, place, pulse, rightMark, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const AMB = COLORS.amber, PUR = COLORS.purple, BLUE = COLORS.blue, RED = COLORS.red, GRN = COLORS.green, TEAL = COLORS.teal, INK = COLORS.ink, GRAY = '#8b909b';
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
/** a reduced fraction n/d as TeX ('undefined' when d = 0) */
function fr(n, d, f = '\\frac') {
  if (d === 0) return '\\text{undefined}';
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(Math.abs(n), d) || 1; n /= g; d /= g;
  return d === 1 ? String(n) : (n < 0 ? '-' : '') + `${f}{${Math.abs(n)}}{${d}}`;
}
/** "\frac{n}{d}=reduced", or just the fraction when it is already reduced with a positive bottom */
const frEq = (n, d) => { const r = fr(n, d); return r === `\\frac{${n}}{${d}}` ? r : `\\frac{${n}}{${d}}=${r}`; };
/** √n simplified, as TeX */
function rad(n) {
  for (let k = Math.floor(Math.sqrt(n)); k > 1; k--) if (n % (k * k) === 0) { const r = n / (k * k); return r === 1 ? String(k) : `${k}\\sqrt{${r}}`; }
  return n === 1 ? '1' : `\\sqrt{${n}}`;
}
/** √n, then its simplified form when that is different */
const lenTex = (n) => (rad(n) === `\\sqrt{${n}}` ? rad(n) : `\\sqrt{${n}}=${rad(n)}`);
const pn = (v) => (v < 0 ? `(${v})` : String(v));            // bracket a negative number in TeX
const PT = (name, x, y) => T(`${name}${pairTex(x, y)}`);
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u6l6-panel', title ? `<div class="u6l6-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u6l6-line ' + cls, html); p.appendChild(d); return d; };
const say = async (c, p, html, cls) => { const d = line(p, html, cls); await fadeIn(c, d, 300); return d; };
const hide = (el) => { if (el) el.style.opacity = 0; return el; };

/* =============================== helpers on a Graph =============================== */
/** a slope triangle: run (amber) from (x, y) across, then rise (purple) up or down. st = { x, y, run, rise } can change: S.upd() */
function stair(G, st, o = {}) {
  const w = o.width ?? 4.5, P = (x, y) => G.toPx(x, y), L = o.layer || G.layers.data, rc = o.runColor || AMB, sc = o.riseColor || PUR;
  const runEl = G.curve(() => ({ subs: st.run ? [[P(st.x, st.y), P(st.x + st.run, st.y)]] : [] }), { color: rc, width: w }, 'u6l6-leg', L);
  const riseEl = G.curve(() => ({ subs: st.rise ? [[P(st.x + st.run, st.y), P(st.x + st.run, st.y + st.rise)]] : [] }), { color: sc, width: w }, 'u6l6-leg', L);
  const mk = svgEl('path', { class: 'u6l6-rmk', fill: 'none', stroke: INK, 'stroke-width': 1.6 }, L);
  G.track(mk, () => {
    if (!st.run || !st.rise || o.mark === false) { mk.setAttribute('d', ''); return; }
    const [cx, cy] = P(st.x + st.run, st.y), s = 10, dx = -Math.sign(st.run) * s, dy = Math.sign(st.rise) * s;
    mk.setAttribute('d', `M${cx + dx} ${cy}L${cx + dx} ${cy - dy}L${cx} ${cy - dy}`);
  });
  const txt = o.text || ((k, v) => `${k} ${T(texNum(v))}`);
  const mkLab = (color) => { const d = h('div', 'bk-lab u6l6-leglab'); d.style.color = color; G.html.appendChild(d); return d; };
  const rl = mkLab(rc), sl = mkLab(sc);
  G.track(rl, () => {
    if (!st.run || o.labels === false) { rl.style.display = 'none'; return; } rl.style.display = '';
    if (rl._v !== st.run) { rl._v = st.run; rl.innerHTML = txt('run', st.run); }
    const [px, py] = P(st.x + st.run / 2, st.y); place(rl, px, py, st.rise > 0 ? 's' : 'n', 5);
  });
  G.track(sl, () => {
    if (!st.rise || o.labels === false) { sl.style.display = 'none'; return; } sl.style.display = '';
    if (sl._v !== st.rise) { sl._v = st.rise; sl.innerHTML = txt('rise', st.rise); }
    const [px, py] = P(st.x + st.run, st.y + st.rise / 2); place(sl, px, py, st.run >= 0 ? 'e' : 'w', 6);
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
/** a pill label on a graph */
const pill = (G, x, y, html, o = {}) => G.label(x, y, html, Object.assign({ cls: 'u6l6-pill', pos: 'c' }, o));
/** a circle in graph units */
const circle = (G, cx, cy, r, o = {}) => G.curve(() => ({ subs: [Array.from({ length: 121 }, (_, i) => G.toPx(cx + r * Math.cos(i * Math.PI / 60), cy + r * Math.sin(i * Math.PI / 60)))], closed: true }), o, 'u6l6-circ', G.layers.data);
/** a named point (optionally with its coordinates) */
const npt = (G, name, x, y, o = {}) => G.point(x, y, Object.assign({ color: o.color || INK, r: 7, label: o.coords === false ? T(name) : PT(name, x, y), pos: o.pos || 'ne' }, o));
/** Catmull-Rom path through px points */
function cr(pts, move = true) {
  let d = (move ? 'M' : 'L') + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
/** tick marks across the middle of a segment (equal sides) */
function ticks(G, a, b, n, o = {}) {
  const g = svgEl('g', { class: 'u6l6-ticks' }, G.layers.top);
  const [x1, y1] = G.toPx(...a), [x2, y2] = G.toPx(...b), L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux;
  for (let k = 0; k < n; k++) {
    const off = (k - (n - 1) / 2) * 8, mx = (x1 + x2) / 2 + ux * off, my = (y1 + y2) / 2 + uy * off;
    svgEl('line', { x1: mx - nx * 9, y1: my - ny * 9, x2: mx + nx * 9, y2: my + ny * 9, stroke: o.color || INK, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  }
  return g;
}
/** a parallel-marks chevron at the middle of a segment */
function chev(G, a, b, color = INK) {
  const [x1, y1] = G.toPx(...a), [x2, y2] = G.toPx(...b), L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return svgEl('path', { d: `M${mx - ux * 7 + nx * 9} ${my - uy * 7 + ny * 9}L${mx + ux * 5} ${my + uy * 5}L${mx - ux * 7 - nx * 9} ${my - uy * 7 - ny * 9}`, fill: 'none', stroke: color, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, G.layers.top);
}
const rmark = (G, V, P, Q, o = {}) => rightMark(G.layers.top, G.toPx(...V), G.toPx(...P), G.toPx(...Q), o.s || 14, { color: o.color || INK, width: 2.4 });

/* =============================== the park (warm-up) =============================== */
const PARK = { win: { xmin: -7.4, xmax: 9.4, ymin: -5.4, ymax: 5.4 }, bridge: [-5, -3], tower: [3, 3], digs: { A: [2, -4], B: [8, 0], C: [3, -3], D: [-5, 3] } };
function parkGraph(host, o = {}) {
  const G = new Graph(host, Object.assign({ width: 620, height: 420, ...PARK.win, xlabels: 2, ylabels: 2, pad: 16, fontSize: 16, cls: 'u6l6-park' }, o));
  const bg = G.layers.bg, P = (x, y) => G.toPx(x, y), [x0, y0] = P(PARK.win.xmin, PARK.win.ymax), [x1, y1] = P(PARK.win.xmax, PARK.win.ymin), u = G.ux;
  svgEl('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: '#e6f2df' }, bg);
  const Lb = [[-6.5, -5.4], [-5.6, -3], [-6.4, 0], [-6.9, 2.5], [-6.6, 5.4]], Rb = [[-5.8, 5.4], [-6.1, 2.5], [-5.6, 0], [-4.4, -3], [-5.1, -5.4]];
  svgEl('path', { d: cr(Lb.map((p) => P(...p))) + cr(Rb.map((p) => P(...p)), false) + 'Z', fill: '#9cc9ea' }, bg);
  const deco = svgEl('g', { class: 'u6l6-deco' }); G.svg.insertBefore(deco, G.layers.axes);
  [[7.4, 3.4], [8.4, 2.2], [-2.4, 4.2], [1.2, 3.8], [5.6, -4.3], [-2.6, -2.3], [6.4, -2.2]].forEach((p) => svgEl('circle', { cx: P(...p)[0], cy: P(...p)[1], r: 0.38 * u, fill: '#6aa65a', stroke: '#3f7434', 'stroke-width': 1.5 }, deco));
  // bridge
  { const [bx0, by0] = P(-6.3, -2.65), [bx1, by1] = P(-3.7, -3.35);
    svgEl('rect', { x: bx0, y: by0, width: bx1 - bx0, height: by1 - by0, fill: '#8a5a2b', stroke: INK, 'stroke-width': 1.4 }, deco);
    for (let k = -6.0; k <= -4.0 + 1e-9; k += 0.5) { const [px] = P(k, 0); svgEl('line', { x1: px, x2: px, y1: by0, y2: by1, stroke: '#5a3a1a', 'stroke-width': 1 }, deco); } }
  // tower (legs, cabin, roof) standing on (3, 3)
  { const Q = (dx, dy) => P(3 + dx * 0.8, 3 + dy * 0.8).map((v) => v.toFixed(1)).join(' ');
    svgEl('path', { d: `M${Q(-0.35, 0)}L${Q(-0.18, 1.1)}M${Q(0.35, 0)}L${Q(0.18, 1.1)}M${Q(-0.3, 0.35)}L${Q(0.3, 0.35)}M${Q(-0.25, 0.7)}L${Q(0.25, 0.7)}`, stroke: '#7a4e22', 'stroke-width': 3.2, fill: 'none', 'stroke-linecap': 'round' }, deco);
    svgEl('path', { d: `M${Q(-0.34, 1.1)}L${Q(0.34, 1.1)}L${Q(0.34, 1.5)}L${Q(-0.34, 1.5)}Z`, fill: '#e8a01e', stroke: INK, 'stroke-width': 1.3 }, deco);
    svgEl('path', { d: `M${Q(-0.46, 1.5)}L${Q(0, 1.85)}L${Q(0.46, 1.5)}Z`, fill: '#d0503f', stroke: INK, 'stroke-width': 1.3 }, deco); }
  G.label(-5, -3.42, '<b>Bridge</b>', { pos: 's', cls: 'u6l6-plab', gap: 2 });
  G.label(3.55, 4.0, '<b>Tower</b>', { pos: 'e', cls: 'u6l6-plab', gap: 0 });
  [PARK.bridge, PARK.tower].forEach((p) => { const [px, py] = P(...p); svgEl('circle', { cx: px, cy: py, r: 4.5, fill: INK }, deco); });
  G.digs = {};
  for (const k in PARK.digs) {
    const [x, y] = PARK.digs[k], [px, py] = P(x, y), s = 0.28 * u, g = svgEl('g', { class: 'u6l6-dig' }, deco);
    svgEl('path', { d: `M${px - s} ${py - s}L${px + s} ${py + s}M${px - s} ${py + s}L${px + s} ${py - s}`, stroke: '#d23c32', 'stroke-width': 4.5, 'stroke-linecap': 'round' }, g);
    const lab = G.label(x + (k === 'B' ? 0 : 0.42), y + (k === 'B' ? 0.4 : 0.05), k, { pos: k === 'B' ? 'n' : 'e', cls: 'u6l6-digl', gap: 0 });
    G.digs[k] = { g, lab };
  }
  return G;
}

/* =============================== explainer: the geocache hunt =============================== */
const hunt = {
  title: 'Geocache Hunt: one tool per clue',
  height: 448,
  choices: [{ v: 'hunt', label: 'Follow the three clues' }, { v: 'B', label: 'Hunter B’s mistake' }],
  intro: (v) => (v === 'hunt' ? 'Three clues, three tools: <b>midpoint</b>, <b>distance</b>, <b>slope</b>. Press <b>Next</b>.' : 'Hunter B dug at (8, 0). Where did B go wrong? Press <b>Next</b>.'),
  make(stage, v, ex) {
    const G = parkGraph(stage, { x: 8, y: 14 }), Pn = panel(stage, 640, 14, ex.W - 652, 420, 'The clues');
    const [bx, by] = PARK.bridge, [tx, ty] = PARK.tower;
    const ends = async (c) => {
      const a = G.point(bx, by, { color: INK, r: 7, label: T('(-5,\\ -3)'), pos: 'n', gap: 18 }), b = G.point(tx, ty, { color: INK, r: 7, label: T('(3,\\ 3)'), pos: 'w', gap: 12 });
      await G.reveal(a, c); await G.reveal(b, c);
      await G.drawIn(G.segment(PARK.bridge, PARK.tower, { color: GRAY, width: 2.5, dash: '7 6' }), 600, c);
    };
    if (v === 'B') {
      return [
        { cap: `The Bridge is at ${T('(-5,\\ -3)')} and the Tower at ${T('(3,\\ 3)')}. Clue 1 asks for the point halfway between them.`, run: ends },
        { cap: `Hunter B <b>subtracted</b>: ${T('\\left(\\frac{3-(-5)}{2},\\ \\frac{3-(-3)}{2}\\right)=(4,\\ 3)')}. But ${T('(4,\\ 3)')} is not even between the Bridge and the Tower.`,
          run: async (c) => { const p = G.point(4, 3, { color: RED, r: 8, label: T('(4,\\ 3)'), pos: 's' }); await G.reveal(p, c); await say(c, Pn, `<b>B’s “midpoint”</b><br>${T('\\left(\\frac{3-(-5)}{2},\\ \\frac{3-(-3)}{2}\\right)=(4,\\ 3)')}`, 'u6l6-bad'); } },
        { cap: `From ${T('(4,\\ 3)')}, B followed Clues 2 and 3 perfectly: 4 right, 3 down, 5 units away. That lands on ${T('(8,\\ 0)')}, the wrong spot.`,
          run: async (c) => { const S = stair(G, { x: 4, y: 3, run: 4, rise: -3 }); await S.show(c); await G.drawIn(G.segment([4, 3], [8, 0], { color: RED, width: 3.5 }), 500, c); await say(c, Pn, `4 right, 3 down: ${T('(8,\\ 0)')} ✗`); } },
        { cap: `${T('(4,\\ 3)')} is half the <b>run</b> and half the <b>rise</b>: a <b>step</b>, not a place. Take that step from the Bridge: ${T('(-5+4,\\ -3+3)=(-1,\\ 0)')}. That is the average.`,
          run: async (c) => {
            const S = stair(G, { x: bx, y: by, run: 4, rise: 3 }, { width: 5 }); await S.show(c);
            const m = G.point(-1, 0, { color: TEAL, r: 8, label: T('(-1,\\ 0)'), pos: 'nw' }); await G.reveal(m, c);
            await say(c, Pn, `<b>Correct midpoint</b>: add, then halve<br>${T('\\left(\\frac{-5+3}{2},\\ \\frac{-3+3}{2}\\right)=(-1,\\ 0)')}`, 'u6l6-good');
          } }
      ];
    }
    let M;
    return [
      { cap: `The Bridge is at ${T('(-5,\\ -3)')} and the Tower at ${T('(3,\\ 3)')}. From one to the other: 8 right and 6 up.`,
        run: async (c) => { await ends(c); const S = stair(G, { x: bx, y: by, run: 8, rise: 6 }); await S.show(c); await say(c, Pn, `Bridge ${T('(-5,\\ -3)')} → Tower ${T('(3,\\ 3)')}: run 8, rise 6. Distance ${T('\\sqrt{8^2+6^2}=10')}`); } },
      { cap: `<b>Clue 1 (midpoint).</b> Halfway: walk half the run, ${T('8\\div2=4')}, and half the rise, ${T('6\\div2=3')}. Start at ${T('(-1,\\ 0)')}. Averaging the coordinates gives the same point.`,
        run: async (c) => {
          const S = stair(G, { x: bx, y: by, run: 4, rise: 3 }, { width: 6, labels: false }); await S.show(c);
          M = G.point(-1, 0, { color: TEAL, r: 8, label: T('(-1,\\ 0)'), pos: 'nw' }); await G.reveal(M, c);
          await say(c, Pn, `<b>1. Midpoint</b>: ${T('\\left(\\frac{-5+3}{2},\\ \\frac{-3+3}{2}\\right)=(-1,\\ 0)')}`);
        } },
      { cap: `<b>Clue 2 (distance).</b> Every point 5 units from ${T('(-1,\\ 0)')} sits on this circle. A, C and D are on it (each is 3 and 4, or 4 and 3, away: ${T('\\sqrt{3^2+4^2}=5')}). B is 9 away.`,
        run: async (c) => {
          await G.drawIn(circle(G, -1, 0, 5, { color: TEAL, width: 3, dash: '8 7' }), 900, c);
          for (const k of ['A', 'B', 'C', 'D']) { const ok = k !== 'B', d = G.digs[k]; const t = G.label(...PARK.digs[k], ok ? '5 ✓' : '9 ✗', { pos: k === 'A' || k === 'B' ? 's' : 'n', cls: 'u6l6-chk ' + (ok ? 'ok' : 'no'), gap: 12 }); await pop(c, t, 300); if (!ok) d.g.style.opacity = 0.35; }
          await say(c, Pn, `<b>2. Distance 5</b>: A, C, D ✓ &nbsp; B ✗ (9 away)`);
        } },
      { cap: `<b>Clue 3 (slope).</b> Slope ${T('-\\frac{3}{4}')} heading right means <b>4 right, 3 down</b>: from ${T('(-1,\\ 0)')} to ${T('(3,\\ -3)')}. That is dig spot C.`,
        run: async (c) => { const S = stair(G, { x: -1, y: 0, run: 4, rise: -3 }); await S.show(c); await G.drawIn(G.segment([-1, 0], [3, -3], { color: BLUE, width: 4 }), 500, c); await say(c, Pn, `<b>3. Slope</b> ${T('-\\frac34')}: 4 right, 3 down → ${T('(3,\\ -3)')} = C`); } },
      { cap: `The other two on the circle fail Clue 3. A has slope ${T('-\\frac{4}{3}')}: rise and run swapped. D has slope ${T('\\frac{3}{-4}=-\\frac34')}, but it is 4 <b>left</b>, 3 up.`,
        run: async (c) => {
          await G.drawIn(G.segment([-1, 0], PARK.digs.A, { color: RED, width: 2.5, dash: '6 5' }), 400, c);
          await G.drawIn(G.segment([-1, 0], PARK.digs.D, { color: RED, width: 2.5, dash: '6 5' }), 400, c);
          await say(c, Pn, `A: ${T('m=\\frac{-4}{3}')} ✗ &nbsp; D: ${T('m=\\frac{3}{-4}')}, heads left ✗`, 'u6l6-small');
        } },
      { cap: `Only <b>C</b> ${T('(3,\\ -3)')} fits all three clues. Each clue needed a different tool: <b>midpoint</b>, <b>distance</b>, <b>slope</b>.`,
        run: async (c) => { const [px, py] = G.toPx(3, -3); const s = stamp(G.html, 'Cache!', { ok: true, x: px + 70, y: py + 12, size: 'sm' }); await stampIn(c, s); await say(c, Pn, `<b>C found the cache.</b>`, 'u6l6-good'); } }
    ];
  }
};

/* =============================== explainer: lengths (Section 1) =============================== */
const distance = {
  title: 'Length: count, subtract, or find the hidden right triangle',
  height: 520,
  choices: [{ v: 'a', label: 'Example 1(a) check' }, { v: 'b', label: 'Example 1(b) check' }],
  intro: (v) => (v === 'a' ? 'Four horizontal and vertical segments. Press <b>Next</b>.' : 'A slanted segment. Press <b>Next</b>.'),
  make(stage, v, ex) {
    if (v === 'b') {
      const G = new Graph(stage, { x: 14, y: 10, width: 384, height: 500, xmin: -2, xmax: 10, ymin: -7, ymax: 9, xlabels: 2, ylabels: 2, fontSize: 15 });
      const Pn = panel(stage, 420, 10, ex.W - 434, 500, 'The distance formula');
      let S;
      return [
        { cap: `Plot ${T('P(2,\\ 7)')} and ${T('Q(7,\\ -5)')}. The segment is slanted, so no single subtraction gives its length.`,
          run: async (c) => { const a = npt(G, 'P', 2, 7, { pos: 'w' }), b = npt(G, 'Q', 7, -5, { pos: 'se' }); await G.reveal(a, c); await G.reveal(b, c); await G.drawIn(G.segment([2, 7], [7, -5], { color: BLUE, width: 4.5 }), 600, c); } },
        { cap: `Every slanted segment hides a <b>right triangle</b>. Run: ${T('7-2=5')}. Rise: ${T('-5-7=-12')}.`,
          run: async (c) => { S = stair(G, { x: 2, y: 7, run: 5, rise: -12 }); await S.show(c); await say(c, Pn, `run ${T('=x_2-x_1=7-2=5')}`); await say(c, Pn, `rise ${T('=y_2-y_1=-5-7=-12')}`); } },
        { cap: `Pythagorean theorem: ${T('d^2=\\text{run}^2+\\text{rise}^2')}. Squaring removes the negative sign of the rise.`,
          run: async (c) => { for (const s of ['d_{PQ}=\\sqrt{(7-2)^2+(-5-7)^2}', '=\\sqrt{5^2+(-12)^2}', '=\\sqrt{25+144}', '=\\sqrt{169}']) await say(c, Pn, T(s), 'u6l6-mline'); } },
        { cap: `${T('\\sqrt{169}=13')}: a perfect square, so the exact distance is the whole number <b>13</b>.`,
          run: async (c) => { await say(c, Pn, T('=\\boldsymbol{13}'), 'u6l6-mline u6l6-good'); const l = pill(G, 4.5, 1, T('13'), { color: BLUE, dx: 30 }); await pop(c, l); } }
      ];
    }
    const G = new Graph(stage, { x: 14, y: 10, width: 430, height: 500, xmin: -8, xmax: 10, ymin: -11, ymax: 14, xlabels: 2, ylabels: 2, fontSize: 15 });
    const Pn = panel(stage, 462, 10, ex.W - 476, 500, 'Length = positive difference');
    const SEG = [
      { n: 'JK', a: [3, 10], b: [9, 10], A: 'J', B: 'K', hz: true, col: AMB, work: '|9-3|=6', len: 6 },
      { n: 'LM', a: [5, 13], b: [5, 3], A: 'L', B: 'M', hz: false, col: PUR, work: '|13-3|=10', len: 10 },
      { n: 'NP', a: [-7, 2], b: [1, 2], A: 'N', B: 'P', hz: true, col: AMB, work: '|1-(-7)|=8', len: 8 },
      { n: 'QR', a: [-4, -3], b: [-4, -10], A: 'Q', B: 'R', hz: false, col: PUR, work: '|-3-(-10)|=7', len: 7 }
    ];
    const els = {};
    const count = async (c, s) => {
      const out = [], k = s.len, lo = s.hz ? Math.min(s.a[0], s.b[0]) : Math.min(s.a[1], s.b[1]);
      for (let i = 1; i <= k; i++) { const t = s.hz ? G.label(lo + i - 0.5, s.a[1], String(i), { pos: 'n', cls: 'u6l6-cnt', gap: 5 }) : G.label(s.a[0], lo + i - 0.5, String(i), { pos: 'e', cls: 'u6l6-cnt', gap: 7 }); out.push(t); if (c && !c.fast) await pop(c, t, 160); }
      await sleep(c, 350); G.remove(...out);
    };
    const doSeg = (s, extra) => async (c) => {
      els[s.n].style.color = s.col; els[s.n].path.setAttribute('stroke', s.col);
      await count(c, s);
      const mid = [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2];
      const l = pill(G, mid[0], mid[1], T(String(s.len)), { color: s.col, pos: s.hz ? (s.n === 'JK' ? 'n' : 's') : 'w', gap: 8 }); await pop(c, l);
      await say(c, Pn, `${T(s.n + '=' + s.work)}` + (extra || ''));
    };
    return [
      { cap: `Equal ${T('y')}-coordinates: <b>horizontal</b> (${T('JK')}, ${T('NP')}). Equal ${T('x')}-coordinates: <b>vertical</b> (${T('LM')}, ${T('QR')}).`,
        run: async (c) => {
          for (const s of SEG) {
            els[s.n] = G.segment(s.a, s.b, { color: BLUE, width: 4.5 }); await G.drawIn(els[s.n], 350, c);
            G.point(...s.a, { color: INK, r: 5 }); G.point(...s.b, { color: INK, r: 5 });
            const p1 = G.label(...s.a, T(s.A), { pos: s.hz ? 'w' : 'n', cls: 'bk-ptlab', gap: 8 }), p2 = G.label(...s.b, T(s.B), { pos: s.hz ? 'e' : 's', cls: 'bk-ptlab', gap: 8 });
            await fadeIn(c, p1, 200); await fadeIn(c, p2, 200);
          }
          await say(c, Pn, `${T('J(3,10)\\ K(9,10)')} &nbsp; ${T('L(5,13)\\ M(5,3)')}<br>${T('N(-7,2)\\ P(1,2)')} &nbsp; ${T('Q(-4,-3)\\ R(-4,-10)')}`, 'u6l6-small');
        } },
      { cap: `${T('JK')} is horizontal: subtract the ${T('x')}-coordinates, ${T('|9-3|=6')}. Counting the squares agrees.`, run: doSeg(SEG[0]) },
      { cap: `${T('LM')} is vertical: subtract the ${T('y')}-coordinates, ${T('|13-3|=10')}.`, run: doSeg(SEG[1]) },
      { cap: `${T('NP')}: ${T('1-(-7)=8')}. Subtracting the other way gives ${T('-7-1=-8')}, but a length is never negative: the <b>absolute value</b> takes the positive difference.`,
        run: doSeg(SEG[2], `<br><span class="u6l6-small">${T('-7-1=-8')}, so ${T('|-8|=8')}</span>`) },
      { cap: `${T('QR')}: ${T('|-3-(-10)|=|7|=7')}.`, run: doSeg(SEG[3]) },
      { cap: `The longest segment is ${T('LM')}, with length <b>10</b>.`,
        run: async (c) => { await pulse(c, els.LM, 1.03); await say(c, Pn, `Longest: ${T('\\boldsymbol{LM=10}')}`, 'u6l6-good'); const [px, py] = G.toPx(7.7, 6); const s = stamp(G.html, 'longest', { ok: true, x: px, y: py, size: 'sm' }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: midpoint (Section 2) =============================== */
const midpoint = {
  title: 'The midpoint: half the run, half the rise',
  height: 480,
  choices: [{ v: 'a', label: 'Example 2(a) check' }, { v: 'b', label: 'Example 2(b) check' }],
  intro: (v) => (v === 'a' ? 'Find the point halfway from C to D. Press <b>Next</b>.' : 'M is halfway from E to F. Where is F? Press <b>Next</b>.'),
  make(stage, v, ex) {
    if (v === 'b') {
      const G = new Graph(stage, { x: 14, y: 14, width: 470, height: 420, xmin: -5, xmax: 9, ymin: -1, ymax: 11, xlabels: 2, ylabels: 2, fontSize: 15 });
      const Pn = panel(stage, 500, 14, ex.W - 514, 450, 'Working backwards');
      return [
        { cap: `${T('E(-3,\\ 1)')} is one endpoint and ${T('M(2,\\ 5)')} is the midpoint. ${T('F')} is missing.`,
          run: async (c) => { await G.reveal(npt(G, 'E', -3, 1, { pos: 'w' }), c); await G.reveal(npt(G, 'M', 2, 5, { color: TEAL, pos: 'w' }), c); await G.drawIn(G.segment([-3, 1], [2, 5], { color: BLUE, width: 4.5 }), 500, c); } },
        { cap: `From ${T('E')} to ${T('M')}: run ${T('2-(-3)=5')}, rise ${T('5-1=4')}.`,
          run: async (c) => { await stair(G, { x: -3, y: 1, run: 5, rise: 4 }).show(c); await say(c, Pn, `${T('E\\to M')}: run 5, rise 4`); } },
        { cap: `The midpoint is <b>halfway</b>, so ${T('F')} is the <b>same step again</b>: ${T('(2+5,\\ 5+4)=(7,\\ 9)')}.`,
          run: async (c) => {
            await stair(G, { x: 2, y: 5, run: 5, rise: 4 }).show(c);
            await G.drawIn(G.segment([2, 5], [7, 9], { color: BLUE, width: 4.5 }), 500, c);
            await G.reveal(npt(G, 'F', 7, 9, { color: RED, pos: 'nw' }), c);
            await say(c, Pn, `${T('M\\to F')}: the same step, so ${T('F=(7,\\ 9)')}`);
          } },
        { cap: `The algebra agrees. Let ${T('F=(x,\\ y)')}. Each coordinate of ${T('M')} is an average, so each gives one equation.`,
          run: async (c) => {
            for (const s of ['\\frac{-3+x}{2}=2', '-3+x=4', 'x=7']) await say(c, Pn, T(s), 'u6l6-mline');
            for (const s of ['\\frac{1+y}{2}=5', '1+y=10', 'y=9']) await say(c, Pn, T(s), 'u6l6-mline');
            await say(c, Pn, `${T('F=\\boldsymbol{(7,\\ 9)}')}`, 'u6l6-mline u6l6-good');
          } }
      ];
    }
    const G = new Graph(stage, { x: 14, y: 10, width: 410, height: 460, xmin: -8, xmax: 6, ymin: -11, ymax: 5, xlabels: 2, ylabels: 2, fontSize: 15 });
    const Pn = panel(stage, 444, 10, ex.W - 458, 460, 'Two ways');
    let half1, half2, full;
    return [
      { cap: `Plot ${T('C(-6,\\ 3)')} and ${T('D(4,\\ -9)')}.`,
        run: async (c) => { await G.reveal(npt(G, 'C', -6, 3, { pos: 'n' }), c); await G.reveal(npt(G, 'D', 4, -9, { pos: 'w' }), c); await G.drawIn(G.segment([-6, 3], [4, -9], { color: BLUE, width: 4.5 }), 600, c); } },
      { cap: `From ${T('C')} to ${T('D')}: run ${T('4-(-6)=10')}, rise ${T('-9-3=-12')}.`,
        run: async (c) => { const S = full = stair(G, { x: -6, y: 3, run: 10, rise: -12 }); await S.show(c); S.dim(0.35); await say(c, Pn, `${T('C\\to D')}: run 10, rise ${T('-12')}`); } },
      { cap: `Walk <b>half</b> the run (${T('10\\div2=5')}) and <b>half</b> the rise (${T('-12\\div2=-6')}): ${T('(-6+5,\\ 3-6)=(-1,\\ -3)')}.`,
        run: async (c) => {
          full.els[3].style.opacity = 0; full.els[4].style.opacity = 0;
          await stair(G, { x: -6, y: 3, run: 5, rise: -6 }, { width: 6 }).show(c);
          await G.reveal(G.point(-1, -3, { color: TEAL, r: 8, label: T('M(-1,\\ -3)'), pos: 'w' }), c);
          await say(c, Pn, `<b>Half the step</b>: run 5, rise ${T('-6')} → ${T('(-1,\\ -3)')}`);
        } },
      { cap: `Same answer by the formula: <b>average</b> the ${T('x')}-coordinates, then average the ${T('y')}-coordinates.`,
        run: async (c) => { for (const s of ['M\\left(\\frac{-6+4}{2},\\ \\frac{3+(-9)}{2}\\right)', '=M\\left(\\frac{-2}{2},\\ \\frac{-6}{2}\\right)', '=\\boldsymbol{M(-1,\\ -3)}']) await say(c, Pn, T(s), 'u6l6-mline'); } },
      { cap: `Check: the two halves match. ${T('C\\to M')} and ${T('M\\to D')} are both run 5, rise ${T('-6')}.`,
        run: async (c) => {
          half1 = G.segment([-6, 3], [-1, -3], { color: TEAL, width: 8, opacity: 0.45 }); half2 = G.segment([-1, -3], [4, -9], { color: GRN, width: 8, opacity: 0.45 });
          await G.drawIn(half1, 500, c); await G.drawIn(half2, 500, c);
          await stair(G, { x: -1, y: -3, run: 5, rise: -6 }, { labels: true }).show(c);
          await say(c, Pn, `Both halves: run 5, rise ${T('-6')} ✓`, 'u6l6-good');
        } }
    ];
  }
};

/* =============================== explainer: the slope staircase (Section 3) =============================== */
const stairEx = {
  title: 'Slope: rise over run, the same everywhere',
  height: 480,
  choices: [{ v: 'same', label: 'Same everywhere' }, { v: 'dial', label: 'Steepness dial' }, { v: 'ex3a', label: 'Example 3(a) check' }],
  intro: (v) => ({ same: 'Slide and stretch a slope triangle along a line. Press <b>Next</b>.', dial: 'Turn a line from flat to vertical and watch its slope. Press <b>Next</b>.', ex3a: 'The slope from A to B. Press <b>Next</b>.' })[v],
  make(stage, v, ex) {
    if (v === 'dial') {
      const G = new Graph(stage, { x: 14, y: 14, width: 450, height: 450, xmin: -5, xmax: 5, ymin: -5, ymax: 5 });
      const Pn = panel(stage, 484, 14, ex.W - 498, 450, 'The slope');
      const big = h('div', 'u6l6-big', T('m=0')); Pn.appendChild(big);
      const note = h('div', 'u6l6-line', ''); Pn.appendChild(note);
      const st = { a: 0 }; // angle in degrees
      const ln = G.curve(() => {
        const r = st.a * Math.PI / 180, dx = Math.cos(r), dy = Math.sin(r), k = 20;
        return { subs: [[G.toPx(-k * dx, -k * dy), G.toPx(k * dx, k * dy)]] };
      }, { color: BLUE, width: 4.5 }, 'u6l6-dial', G.layers.data);
      const tri = stair(G, { x: 0, y: 0, run: 1, rise: 0 }, { text: (k, v2) => `${k} ${T(texNum(Math.round(v2 * 100) / 100))}` });
      const mOf = (a) => Math.tan(a * Math.PI / 180);
      const setA = (a) => { st.a = a; ln._bkDraw(); const m = mOf(a); const vert = Math.abs(a - 90) < 0.01; tri.st.rise = vert || Math.abs(m) > 4.4 ? 0 : m; tri.st.run = vert || Math.abs(m) > 4.4 ? 0 : 1; tri.upd();
        const t = vert ? 'm\\ \\text{undefined}' : `m=${texNum(Math.round(m * 100) / 100)}`; if (big._t !== t) { big._t = t; big.innerHTML = T(t); } };
      const turn = (to, ms = 1100) => async (c) => { const a0 = st.a; await tween(c, ms, (t) => setA(a0 + (to - a0) * t)); setA(to); };
      const deg = (m) => Math.atan(m) * 180 / Math.PI;
      const N = (html) => async (c) => { note.innerHTML = html; await fadeIn(c, note, 250); };
      return [
        { cap: `A <b>horizontal</b> line: 1 across, 0 up. ${T('m=\\frac{0}{1}=0')}.`, run: async (c) => { await G.drawIn(ln, 500, c); tri.showNow(); setA(0); await N(`flat: ${T('m=0')}`)(c); } },
        { cap: `Turn it a little: 1 across, ${T('\\frac12')} up. ${T('m=\\frac12')}.`, run: async (c) => { await turn(deg(0.5))(c); await N(`gentle: ${T('m=\\frac12')}`)(c); } },
        { cap: `Rise equals run: ${T('m=1')}, a 45° line.`, run: async (c) => { await turn(45)(c); await N(`${T('m=1')}`)(c); } },
        { cap: `Steeper: 1 across, 3 up. ${T('m=3')}. The <b>bigger</b> the size of the slope, the steeper the line.`, run: async (c) => { await turn(deg(3))(c); await N(`steep: ${T('m=3')}`)(c); } },
        { cap: `Straight up: the run is 0, and ${T('\\frac{\\text{rise}}{0}')} cannot be calculated. A vertical line has an <b>undefined</b> slope.`, run: async (c) => { await turn(90)(c); await N(`vertical: run ${T('=0')}, slope <b>undefined</b>`)(c); } },
        { cap: `Keep turning: now the line <b>falls</b> left to right. ${T('m=-3')} is just as steep as ${T('m=3')}: steepness is the size, ${T('|m|')}.`, run: async (c) => { await turn(180 + deg(-3))(c); setA(180 + deg(-3)); await N(`falling: ${T('m=-3')}, ${T('|m|=3')}`)(c); } }
      ];
    }
    if (v === 'ex3a') {
      const G = new Graph(stage, { x: 14, y: 10, width: 340, height: 460, xmin: -4, xmax: 6, ymin: -9, ymax: 7, xlabels: 2, ylabels: 2, fontSize: 15 });
      const Pn = panel(stage, 374, 10, ex.W - 388, 460, 'The slope formula');
      return [
        { cap: `Plot ${T('A(-2,\\ 5)')} and ${T('B(4,\\ -7)')}. Falling left to right, so expect a <b>negative</b> slope.`,
          run: async (c) => { await G.reveal(npt(G, 'A', -2, 5, { pos: 'nw' }), c); await G.reveal(npt(G, 'B', 4, -7, { pos: 'w' }), c); await G.drawIn(G.segment([-2, 5], [4, -7], { color: BLUE, width: 4.5 }), 600, c); } },
        { cap: `Run: ${T('4-(-2)=6')}. Rise: ${T('-7-5=-12')}. Same order top and bottom: ${T('B')} minus ${T('A')}.`,
          run: async (c) => { await stair(G, { x: -2, y: 5, run: 6, rise: -12 }).show(c); } },
        { cap: `${T('m=\\frac{\\text{rise}}{\\text{run}}=\\frac{-12}{6}=-2')}.`,
          run: async (c) => { for (const s of ['m=\\frac{y_2-y_1}{x_2-x_1}', '=\\frac{-7-5}{4-(-2)}', '=\\frac{-12}{6}', '=\\boldsymbol{-2}']) await say(c, Pn, T(s), 'u6l6-mline'); } },
        { cap: `The same ${T('-2')} everywhere along the segment: six steps of <b>1 right, 2 down</b>.`,
          run: async (c) => { for (let i = 0; i < 6; i++) { const S = stair(G, { x: -2 + i, y: 5 - 2 * i, run: 1, rise: -2 }, { width: 3.5, labels: false, mark: false }); await S.show(c, 140); } await say(c, Pn, `Each step: 1 across, 2 down`, 'u6l6-small'); } }
      ];
    }
    // same everywhere
    const G = new Graph(stage, { x: 14, y: 14, width: 450, height: 450, xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
    const Pn = panel(stage, 484, 14, ex.W - 498, 450, 'Slope = rise ÷ run');
    let S;
    return [
      { cap: `A line through ${T('(-4,\\ -3)')} and ${T('(4,\\ 3)')}.`, run: async (c) => { await G.drawIn(G.line([-4, -3], [4, 3], { color: BLUE, width: 4 }), 600, c); } },
      { cap: `A slope triangle: run 4, rise 3. ${T('m=\\frac{3}{4}')}.`,
        run: async (c) => { S = stair(G, { x: -4, y: -3, run: 4, rise: 3 }); await S.show(c); await say(c, Pn, T('m=\\frac{3}{4}'), 'u6l6-mline'); } },
      { cap: `Slide the triangle along the line: still run 4, rise 3. The slope is the <b>same everywhere</b> on a line.`,
        run: async (c) => { await tween(c, 1200, (t) => { S.st.x = -4 + 4 * t; S.st.y = -3 + 3 * t; S.upd(); }); await say(c, Pn, `slid along: ${T('\\frac{3}{4}')}`); } },
      { cap: `Stretch it: run 8, rise 6. ${T('\\frac{6}{8}=\\frac{3}{4}')}. Shrink it: run 2, rise 1.5. ${T('\\frac{1.5}{2}=\\frac34')}.`,
        run: async (c) => {
          S.st.x = -4; S.st.y = -3; S.upd();
          await tween(c, 900, (t) => { S.st.run = 4 + 4 * t; S.st.rise = 3 + 3 * t; S.upd(); }); S.st.run = 8; S.st.rise = 6; S.upd(); await say(c, Pn, `bigger: ${T('\\frac{6}{8}=\\frac34')}`); await sleep(c, 500);
          await tween(c, 900, (t) => { S.st.run = 8 - 6 * t; S.st.rise = 6 - 4.5 * t; S.upd(); }); S.st.run = 2; S.st.rise = 1.5; S.upd(); await say(c, Pn, `smaller: ${T('\\frac{1.5}{2}=\\frac34')}`);
        } },
      { cap: `A line that <b>falls</b> left to right: run 1, rise ${T('-2')}. ${T('m=\\frac{-2}{1}=-2')}: a <b>negative</b> slope.`,
        run: async (c) => { await G.drawIn(G.line([0, 4], [1, 2], { color: RED, width: 4 }), 600, c); await stair(G, { x: 1, y: 2, run: 1, rise: -2 }).show(c); await say(c, Pn, `falling: ${T('m=-2')}`, 'u6l6-bad'); } }
    ];
  }
};

/* =============================== explainer: parallel and perpendicular =============================== */
/** rotate a slope triangle 90° counterclockwise about its start O; returns steps */
function perpSteps(G, Pn, O, run, rise, opts = {}) {
  const st = { a: 0 }, R = (p) => { const r = st.a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [O[0] + p[0] * c - p[1] * s, O[1] + p[0] * s + p[1] * c]; };
  const P = (p) => G.toPx(...R(p));
  const nRun = -rise, nRise = run, m1 = fr(rise, run), m2 = fr(nRise, nRun);
  let leg1, leg2, hyp, ghost, l1, l2, S0;
  const mkLab = (color) => { const d = h('div', 'bk-lab u6l6-leglab'); d.style.color = color; G.html.appendChild(d); return d; };
  return [
    { cap: `A segment with run ${T(String(run))} and rise ${T(String(rise))}: ${T('m_1=' + m1)}.`,
      run: async (c) => {
        S0 = stair(G, { x: O[0], y: O[1], run, rise }); hyp = G.segment(O, [O[0] + run, O[1] + rise], { color: BLUE, width: 4.5 });
        await G.drawIn(hyp, 500, c); await S0.show(c); await say(c, Pn, T('m_1=' + m1), 'u6l6-mline');
      } },
    { cap: `Turn the whole slope triangle a <b>quarter turn</b> (90°) about its corner at ${T(pairTex(O[0], O[1]))}.`,
      run: async (c) => {
        S0.dim(0.25); ghost = hyp; ghost.style.opacity = 0.3;
        leg1 = G.curve(() => ({ subs: [[P([0, 0]), P([run, 0])]] }), { color: AMB, width: 4.5 }, 'u6l6-leg', G.layers.data);
        leg2 = G.curve(() => ({ subs: [[P([run, 0]), P([run, rise])]] }), { color: PUR, width: 4.5 }, 'u6l6-leg', G.layers.data);
        hyp = G.curve(() => ({ subs: [[P([0, 0]), P([run, rise])]] }), { color: GRN, width: 4.5 }, 'u6l6-leg', G.layers.data);
        await tween(c, 1500, (t) => { st.a = 90 * t; leg1._bkDraw(); leg2._bkDraw(); hyp._bkDraw(); });
        st.a = 90; leg1._bkDraw(); leg2._bkDraw(); hyp._bkDraw();
      } },
    { cap: `Rise and run <b>swap</b>, and one sign flips. The old run ${T(String(run))} is now the rise; the old rise ${T(String(rise))} is now the run, ${T(String(nRun))}. ${T('m_2=' + frEq(nRise, nRun))}.`,
      run: async (c) => {
        leg1.path.setAttribute('stroke', PUR); leg1.style.color = PUR; leg2.path.setAttribute('stroke', AMB); leg2.style.color = AMB;
        const e1 = R([run, 0]), e2 = R([run, rise]);
        l1 = mkLab(PUR); l1.innerHTML = `rise ${T(String(nRise))}`; place(l1, ...G.toPx(O[0], O[1] + nRise / 2), nRun > 0 ? 'w' : 'e', 8);
        l2 = mkLab(AMB); l2.innerHTML = `run ${T(String(nRun))}`; place(l2, ...G.toPx(e1[0] + nRun / 2, e1[1]), 'n', 6);
        await fadeIn(c, l1); await fadeIn(c, l2); void e2;
        await say(c, Pn, T(`m_2=${frEq(nRise, nRun)}`), 'u6l6-mline');
      } },
    { cap: `The two slopes are <b>negative reciprocals</b>: flip and change the sign. Their product is ${T('-1')}, and the segments meet at a right angle.`,
      run: async (c) => {
        await say(c, Pn, T(`m_1\\times m_2=\\left(${m1}\\right)\\left(${m2}\\right)=-1`), 'u6l6-mline u6l6-good');
        const mk = rmark(G, O, [O[0] + run, O[1] + rise], R([run, rise]), { s: 16, color: GRN }); await appear(c, mk, 300);
        if (opts.after) await opts.after(c);
      } }
  ];
}
const parPerp = {
  title: 'Parallel and perpendicular, with slope triangles',
  height: 470,
  choices: [{ v: 'par', label: 'Parallel: copies' }, { v: 'perp', label: 'Perpendicular: a quarter turn' }, { v: 'ex3b', label: 'Example 3(b) check' }, { v: 'ex3c', label: 'Example 3(c) check' }],
  intro: (v) => ({ par: 'Copy a slope triangle. Press <b>Next</b>.', perp: 'Turn a slope triangle 90°. Press <b>Next</b>.', ex3b: 'Parallel, perpendicular, or neither? Press <b>Next</b>.', ex3c: 'Perpendicular to a slope of −3/5. Press <b>Next</b>.' })[v],
  make(stage, v, ex) {
    if (v === 'ex3b') {
      const G = new Graph(stage, { x: 14, y: 6, width: 330, height: 458, xmin: -5, xmax: 7, ymin: -6, ymax: 12, xlabels: 2, ylabels: 2, fontSize: 15 });
      const Pn = panel(stage, 364, 6, ex.W - 378, 458, 'Compare the slopes');
      return [
        { cap: `${T('GH')}: ${T('G(1,\\ 2)')} to ${T('H(5,\\ 10)')}. ${T('JK')}: ${T('J(-3,\\ 4)')} to ${T('K(1,\\ -4)')}.`,
          run: async (c) => {
            for (const [n, x, y, p] of [['G', 1, 2, 'e'], ['H', 5, 10, 'w'], ['J', -3, 4, 'w'], ['K', 1, -4, 'e']]) await G.reveal(G.point(x, y, { color: INK, r: 6.5, label: T(n), pos: p }), c);
            await G.drawIn(G.segment([1, 2], [5, 10], { color: BLUE, width: 4.5 }), 500, c); await G.drawIn(G.segment([-3, 4], [1, -4], { color: RED, width: 4.5 }), 500, c);
          } },
        { cap: `${T('m_{GH}=\\frac{10-2}{5-1}=\\frac{8}{4}=2')}.`,
          run: async (c) => { await stair(G, { x: 1, y: 2, run: 4, rise: 8 }).show(c); await say(c, Pn, T('m_{GH}=\\frac{10-2}{5-1}=\\frac84=2'), 'u6l6-mline'); } },
        { cap: `${T('m_{JK}=\\frac{-4-4}{1-(-3)}=\\frac{-8}{4}=-2')}.`,
          run: async (c) => { await stair(G, { x: -3, y: 4, run: 4, rise: -8 }).show(c); await say(c, Pn, T('m_{JK}=\\frac{-4-4}{1-(-3)}=\\frac{-8}{4}=-2'), 'u6l6-mline'); } },
        { cap: `${T('2\\neq-2')}: not parallel. ${T('2\\times(-2)=-4\\neq-1')}: not perpendicular. ${T('GH')} and ${T('JK')} are <b>neither</b>.`,
          run: async (c) => { await say(c, Pn, `Equal? ${T('2\\neq-2')} ✗ not parallel`); await say(c, Pn, `Product? ${T('2\\times(-2)=-4\\neq-1')} ✗`); const s = stamp(Pn, 'Neither', { ok: false }); s.style.alignSelf = 'center'; s.style.marginTop = '14px'; await stampIn(c, s); } }
      ];
    }
    const G = new Graph(stage, { x: 14, y: 10, width: 450, height: 450, xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
    const Pn = panel(stage, 484, 10, ex.W - 498, 450, v === 'par' ? 'Parallel' : 'Perpendicular');
    if (v === 'ex3c') return perpSteps(G, Pn, [0, 0], 5, -3);
    if (v === 'perp') {
      return perpSteps(G, Pn, [0, 0], 3, 2, {
        after: async (c) => {
          await sleep(c, 300);
          await say(c, Pn, `<span class="u6l6-small">Horizontal ⊥ vertical too: slopes ${T('0')} and undefined can’t be multiplied, but they still meet at 90°.</span>`);
        }
      }).concat([{ cap: `One special pair: a <b>horizontal</b> line (${T('m=0')}) and a <b>vertical</b> line (undefined slope) are perpendicular too, even though their slopes cannot be multiplied.`,
        run: async (c) => { await G.drawIn(G.line({ m: 0, b: -4 }, { color: GRAY, width: 3.5 }), 500, c); await G.drawIn(G.line({ x: -4 }, { color: GRAY, width: 3.5 }), 500, c); const mk = rmark(G, [-4, -4], [-2, -4], [-4, -2], { s: 16 }); await appear(c, mk, 300); } }]);
    }
    return [
      { cap: `A segment from ${T('(-5,\\ -4)')} to ${T('(1,\\ 0)')}: run 6, rise 4, ${T('m=\\frac{4}{6}=\\frac23')}.`,
        run: async (c) => { await G.drawIn(G.segment([-5, -4], [1, 0], { color: BLUE, width: 4.5 }), 500, c); await stair(G, { x: -5, y: -4, run: 6, rise: 4 }).show(c); await say(c, Pn, T('m_1=\\frac46=\\frac23'), 'u6l6-mline'); } },
      { cap: `Slide a <b>copy</b> of the slope triangle anywhere. Same run, same rise, so the new segment points the same way.`,
        run: async (c) => {
          const S = stair(G, { x: -5, y: -4, run: 6, rise: 4 }); S.showNow(); S.upd();
          await tween(c, 1200, (t) => { S.st.x = -5 + 1 * t; S.st.y = -4 + 5 * t; S.upd(); });
          await G.drawIn(G.segment([-4, 1], [2, 5], { color: BLUE, width: 4.5 }), 500, c);
          await say(c, Pn, T('m_2=\\frac46=\\frac23'), 'u6l6-mline');
        } },
      { cap: `<b>Parallel</b> segments have <b>equal slopes</b>: ${T('m_1=m_2=\\frac23')}. They never meet.`,
        run: async (c) => { await say(c, Pn, `${T('m_1=m_2')} → <b>parallel</b>`, 'u6l6-good'); for (const [a, b] of [[[-5, -4], [1, 0]], [[-4, 1], [2, 5]]]) await appear(c, chev(G, a, b, GRN), 250); } }
    ];
  }
};

/* =============================== explainer: characteristics of a linear graph (Section 4) =============================== */
const linear = {
  title: 'Characteristics of a linear graph',
  height: 500,
  choices: [{ v: 'ex4', label: 'Example 4(a)–(c) check' }, { v: 'ex4d', label: 'Example 4(d) check' }, { v: 'count', label: 'How many intercepts?' }],
  intro: (v) => ({ ex4: 'Snow melting on a deck: table, slope, intercepts, domain and range. Press <b>Next</b>.', ex4d: 'The horizontal line through (5, −2). Press <b>Next</b>.', count: 'Slide and turn a line. Count its intercepts. Press <b>Next</b>.' })[v],
  make(stage, v, ex) {
    if (v === 'ex4') {
      const tb = new ValueTable(stage, { x: 14, y: 30, layout: 'h', headers: ['t\\text{ (h)}', 'd\\text{ (cm)}'], rows: [[0, 48], [2, 42], [4, 36], [6, 30]], cellW: 78, cellH: 50, headW: 104, tap: false, diffs: true, diffSpace: 70 });
      const Pn = panel(stage, 14, 210, 440, 280, '');
      const G = new Graph(stage, { x: 470, y: 10, width: ex.W - 484, height: 480, xmin: 0, xmax: 18, ymin: 0, ymax: 52, xstep: 1, ystep: 4, xlabels: 2, ylabels: 8, xtitle: 't', ytitle: 'd', fontSize: 15 });
      const tdiff = [];
      return [
        { cap: `Equal steps of ${T('2')} h, and ${T('d')} drops ${T('6')} cm every time: the change is constant, so the relation is <b>linear</b>.`,
          run: async (c) => {
            for (let i = 0; i < 3; i++) { const a = tb.cell(i, 0), b = tb.cell(i + 1, 0); const l = h('div', 'bk-lab u6l6-tdiff', '+2'); tb.html.appendChild(l); place(l, (a.offsetLeft + a.offsetWidth / 2 + b.offsetLeft + b.offsetWidth / 2) / 2, a.offsetTop - 2, 'n', 2); tdiff.push(l); await pop(c, l, 260); }
            await tb.diffs(c, { color: PUR });
          } },
        { cap: `Slope with units: ${T('\\frac{\\text{change in }d}{\\text{change in }t}=\\frac{-6\\text{ cm}}{2\\text{ h}}=-3')} <b>cm/h</b>. The snow melts 3 cm every hour.`,
          run: async (c) => { await say(c, Pn, T('m=\\frac{-6\\text{ cm}}{2\\text{ h}}=\\boldsymbol{-3}\\text{ cm/h}'), 'u6l6-mline'); } },
        { cap: `Plot the four rows. They line up.`,
          run: async (c) => { for (const [t, d] of [[0, 48], [2, 42], [4, 36], [6, 30]]) await G.reveal(G.point(t, d, { color: INK, r: 6 }), c); await G.drawIn(G.segment([0, 48], [6, 30], { color: BLUE, width: 4 }), 500, c); } },
        { cap: `${T('d')}-intercept ${T('48')}: 48 cm of snow when the warm spell begins. Keep losing 3 cm/h: ${T('48\\div3=16')}, so the ${T('t')}-intercept is ${T('16')}: the snow is gone after 16 hours.`,
          run: async (c) => {
            await G.drawIn(G.segment([6, 30], [16, 0], { color: BLUE, width: 4, dash: '9 7' }), 700, c);
            await G.reveal(G.point(0, 48, { color: PUR, r: 8, label: T('(0,\\ 48)'), pos: 'e' }), c);
            await G.reveal(G.point(16, 0, { color: AMB, r: 8, label: T('(16,\\ 0)'), pos: 'ne' }), c);
            await say(c, Pn, `${T('d')}-int ${T('48')} &nbsp; ${T('t')}-int ${T('48\\div3=16')}`);
          } },
        { cap: `The story runs from ${T('t=0')} until the snow is gone at ${T('t=16')}. Domain: the shadow on the ${T('t')}-axis. Range: the shadow on the ${T('d')}-axis.`,
          run: async (c) => {
            await G.drawIn(G.shadeX(0, 16, { color: AMB }), 600, c); await G.drawIn(G.shadeY(0, 48, { color: PUR }), 600, c);
            await say(c, Pn, `D: ${T('\\{t\\mid 0\\le t\\le16,\\ t\\in\\mathbb{R}\\}')}`, 'u6l6-am');
            await say(c, Pn, `R: ${T('\\{d\\mid 0\\le d\\le48,\\ d\\in\\mathbb{R}\\}')}`, 'u6l6-pu');
          } }
      ];
    }
    if (v === 'ex4d') {
      const G = new Graph(stage, { x: 14, y: 14, width: 470, height: 470, xmin: -7, xmax: 7, ymin: -7, ymax: 7 });
      const Pn = panel(stage, 504, 14, ex.W - 518, 470, 'Horizontal line');
      return [
        { cap: `The horizontal line through ${T('(5,\\ -2)')}: every point has ${T('y=-2')}. It extends forever both ways.`,
          run: async (c) => { await G.reveal(G.point(5, -2, { color: INK, r: 7, label: T('(5,\\ -2)'), pos: 'n' }), c); await G.drawIn(G.line({ m: 0, b: -2 }, { color: BLUE, width: 4.5 }), 700, c); } },
        { cap: `Any run, rise ${T('0')}: ${T('m=\\frac{0}{4}=0')}.`,
          run: async (c) => { const S = stair(G, { x: 1, y: -2, run: 4, rise: 0 }); await S.show(c); const l = pill(G, 3, -2, `rise ${T('0')}`, { color: PUR, pos: 's', gap: 12 }); await pop(c, l); await say(c, Pn, `Slope ${T('\\boldsymbol{0}')}`); } },
        { cap: `It crosses the ${T('y')}-axis at ${T('-2')}, but it is parallel to the ${T('x')}-axis, so it never meets it. <b>One</b> intercept: the ${T('y')}-intercept ${T('-2')}.`,
          run: async (c) => { await G.reveal(G.point(0, -2, { color: PUR, r: 8, label: T('(0,\\ -2)'), pos: 'nw' }), c); await say(c, Pn, `${T('y')}-int ${T('\\boldsymbol{-2}')}, no ${T('x')}-int`); } },
        { cap: `Domain: the line covers every ${T('x')}. Range: only ${T('-2')}.`,
          run: async (c) => {
            await G.drawIn(G.shadeX(-Infinity, Infinity, { color: AMB }), 600, c);
            const [px, py] = G.toPx(0, -2); const d = svgEl('circle', { cx: px, cy: py, r: 9, fill: PUR, 'fill-opacity': 0.6 }, G.layers.top); await pop(c, d);
            await say(c, Pn, `D: ${T('\\{x\\mid x\\in\\mathbb{R}\\}')}`, 'u6l6-am'); await say(c, Pn, `R: ${T('\\{-2\\}')}`, 'u6l6-pu');
          } }
      ];
    }
    // how many intercepts
    const G = new Graph(stage, { x: 14, y: 14, width: 470, height: 470, xmin: -6, xmax: 6, ymin: -6, ymax: 6 });
    const Pn = panel(stage, 504, 14, ex.W - 518, 470, 'Intercepts');
    const st = { m: -0.5, b: 2 };
    let L, vert, dots = [];
    const setDots = (pts) => { G.remove(...dots); dots = pts.map(([x, y, col]) => G.point(x, y, { color: col, r: 8, label: T(pairTex(x, y)), pos: x < 0 ? 'nw' : 'ne' })); };
    const tally = (html) => (c) => say(c, Pn, html);
    return [
      { cap: `A slanted line usually crosses <b>both</b> axes: <b>two</b> intercepts.`,
        run: async (c) => { L = G.fn((x) => st.m * x + st.b, { color: BLUE, width: 4.5 }); await G.drawIn(L, 600, c); setDots([[4, 0, AMB], [0, 2, PUR]]); for (const d of dots) await G.reveal(d, c); await tally(`slanted: <b>2</b>`)(c); } },
      { cap: `Slide it down until it passes through the <b>origin</b>: both intercepts become the same point. <b>One</b> intercept point.`,
        run: async (c) => { G.remove(...dots); dots = []; await tween(c, 1100, (t) => { st.b = 2 - 2 * t; L._bkDraw(); }); setDots([[0, 0, TEAL]]); await G.reveal(dots[0], c); await tally(`through the origin: <b>1</b>`)(c); } },
      { cap: `Turn it until it is <b>horizontal</b> and lift it: ${T('y=3')} meets only the ${T('y')}-axis. <b>One</b> intercept.`,
        run: async (c) => { G.remove(...dots); dots = []; await tween(c, 1300, (t) => { st.m = -0.5 + 0.5 * t; st.b = 3 * t; L._bkDraw(); }); setDots([[0, 3, PUR]]); await G.reveal(dots[0], c); await tally(`horizontal: <b>1</b>`)(c); } },
      { cap: `A <b>vertical</b> line such as ${T('x=-4')} meets only the ${T('x')}-axis. <b>One</b> intercept.`,
        run: async (c) => { G.remove(...dots); dots = []; L.style.opacity = 0.2; vert = G.line({ x: -4 }, { color: BLUE, width: 4.5 }); await G.drawIn(vert, 600, c); setDots([[-4, 0, AMB]]); await G.reveal(dots[0], c); await tally(`vertical: <b>1</b>`)(c); } },
      { cap: `Lower the horizontal line all the way onto the ${T('x')}-axis: <b>every</b> point is on an axis. <b>Infinitely many</b> intercepts.`,
        run: async (c) => {
          G.remove(...dots); dots = []; vert.style.opacity = 0.2; L.style.opacity = 1;
          await tween(c, 1200, (t) => { st.b = 3 - 3 * t; L._bkDraw(); }); st.b = 0; L._bkDraw();
          L.path.setAttribute('stroke', GRN); L.path.setAttribute('stroke-width', 7); await tally(`an axis: <b>infinitely many</b>`)(c);
          await say(c, Pn, `<span class="u6l6-small">A line can never have <b>zero</b> intercepts.</span>`);
        } }
    ];
  }
};

/* =============================== ★ explainer: which tool? classify a quadrilateral =============================== */
const QUADS = {
  ex5: { label: 'Example 5 check', N: ['W', 'X', 'Y', 'Z'], P: [[-5, -1], [-1, 3], [5, 1], [1, -3]], pos: ['w', 'n', 'e', 's'] },
  rect: { label: 'A rectangle', N: ['A', 'B', 'C', 'D'], P: [[-4, 1], [-2, 5], [4, 2], [2, -2]], pos: ['w', 'n', 'e', 's'] },
  rhom: { label: 'A rhombus', N: ['E', 'F', 'G', 'H'], P: [[-3, -2], [0, 2], [5, 2], [2, -2]], pos: ['sw', 'nw', 'ne', 'se'] },
  sq: { label: 'A square', N: ['K', 'L', 'M', 'N'], P: [[-3, -1], [-1, 3], [3, 1], [1, -3]], pos: ['w', 'n', 'e', 's'] },
  trap: { label: 'Not a parallelogram', N: ['P', 'Q', 'R', 'S'], P: [[-4, -2], [-2, 3], [3, 3], [5, -2]], pos: ['sw', 'nw', 'ne', 'se'] }
};
const RESULT = { para: 'parallelogram', rect: 'rectangle', rhom: 'rhombus', sq: 'square', no: 'not a parallelogram' };
function analyse(q) {
  const sides = q.P.map((a, i) => {
    const b = q.P[(i + 1) % 4], run = b[0] - a[0], rise = b[1] - a[1], name = q.N[i] + q.N[(i + 1) % 4];
    return { a, b, run, rise, name, len2: run * run + rise * rise, m: fr(rise, run), mv: run ? rise / run : Infinity };
  });
  const parl = (s, t) => s.rise * t.run === t.rise * s.run;
  const p1 = parl(sides[0], sides[2]), p2 = parl(sides[1], sides[3]), par = p1 && p2;
  const perp = sides[0].rise * sides[1].rise === -sides[0].run * sides[1].run;
  const eq = sides.every((s) => s.len2 === sides[0].len2);
  const res = !par ? 'no' : perp ? (eq ? 'sq' : 'rect') : (eq ? 'rhom' : 'para');
  return { sides, p1, p2, par, perp, eq, res };
}
const whichTool = {
  title: '★ Which tool? Classifying a quadrilateral',
  height: 470,
  choices: Object.keys(QUADS).map((k) => ({ v: k, label: QUADS[k].label })),
  intro: (v) => `Follow ${T(QUADS[v].N.join(''))} through the flowchart. Each side’s <b>slope</b> and <b>length</b> appear on the grid. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const q = QUADS[v], A = analyse(q), S = A.sides, quad = q.N.join('');
    const G = new Graph(stage, { x: 8, y: 30, width: 450, height: 400, xmin: -6, xmax: 6, ymin: -4, ymax: 6 });
    const FW = ex.W - 476, k = FW / 500, X = (x) => x * k, fx = ex.W - FW - 8;
    const F = new Flowchart(stage, {
      x: fx, y: 6, width: FW, height: 458,
      nodes: {
        start: { x: X(200), y: 30, w: X(340), h: 46, html: '<b>Slope and length of every side</b>', cls: 'bk-round' },
        par: { x: X(200), y: 118, w: X(330), h: 64, html: '<b>Opposite sides parallel?</b>both pairs: equal slopes', cls: 'bk-diamond' },
        no: { x: X(440), y: 118, w: X(116), h: 64, html: '<b>Not a parallelo&shy;gram</b>', cls: 'bk-dashed', color: GRAY },
        perp: { x: X(200), y: 214, w: X(360), h: 64, html: `<b>Adjacent sides perpendicular?</b>${T('m_1\\times m_2=-1')}`, cls: 'bk-diamond' },
        eqL: { x: X(108), y: 310, w: X(206), h: 60, html: '<b>All four sides equal?</b>lengths' },
        eqR: { x: X(352), y: 310, w: X(206), h: 60, html: '<b>All four sides equal?</b>lengths' },
        rhom: { x: X(50), y: 416, w: X(98), h: 48, html: '<b>Rhombus</b>', color: TEAL },
        para: { x: X(164), y: 416, w: X(124), h: 48, html: '<b>Parallelo&shy;gram</b>', color: TEAL },
        rect: { x: X(296), y: 416, w: X(116), h: 48, html: '<b>Rectangle</b>', color: TEAL },
        sq: { x: X(424), y: 416, w: X(98), h: 48, html: '<b>Square</b>', color: TEAL }
      },
      edges: [
        { from: 'start', to: 'par' }, { from: 'par', to: 'no', label: 'no' }, { from: 'par', to: 'perp', label: 'yes' },
        { from: 'perp', to: 'eqL', label: 'no', route: 'vhv' }, { from: 'perp', to: 'eqR', label: 'yes', route: 'vhv' },
        { from: 'eqL', to: 'rhom', label: 'yes', route: 'vhv' }, { from: 'eqL', to: 'para', label: 'no', route: 'vhv' },
        { from: 'eqR', to: 'rect', label: 'no', route: 'vhv' }, { from: 'eqR', to: 'sq', label: 'yes', route: 'vhv' }
      ]
    });
    F.el.classList.add('u6l6-flow');
    // the travelling shape: a thumbnail of the quadrilateral
    const xs = q.P.map((p) => p[0]), ys = q.P.map((p) => p[1]), x0 = Math.min(...xs), y1 = Math.max(...ys), sc = 40 / Math.max(Math.max(...xs) - x0, y1 - Math.min(...ys));
    const tok = h('div', 'u6l6-token'); const tsv = svgEl('svg', { width: 48, height: 48, viewBox: '-4 -4 48 48' }, tok);
    svgEl('polygon', { points: q.P.map((p) => `${((p[0] - x0) * sc).toFixed(1)},${((y1 - p[1]) * sc).toFixed(1)}`).join(' '), fill: '#cfe0fb', stroke: BLUE, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, tsv);
    F.html.appendChild(tok); tok.style.opacity = 0;
    const ENDS = ['no', 'rhom', 'para', 'rect', 'sq'];
    const tpos = (id) => { const n = F.node(id).n; return ENDS.includes(id) ? [Math.min(FW - 27, n.x + n.w / 2 - 10), n.y - n.h / 2 - 16] : [Math.max(27, n.x - n.w / 2 - 6), n.y]; };
    let tcur = null;
    const tokTo = async (c, id) => { const [x2, y2] = tpos(id); if (!tcur) { tcur = [x2, y2]; place(tok, x2, y2, 'c'); await pop(c, tok, 300); return; } const [xa, ya] = tcur; await tween(c, 520, (t) => place(tok, xa + (x2 - xa) * t, ya + (y2 - ya) * t, 'c')); tcur = [x2, y2]; };
    const goTo = async (c, a, b) => { await Promise.all([F.go(c, a, b), tokTo(c, b)]); await F.visit(c, b); };
    // side labels
    const cen = [xs.reduce((s, x) => s + x, 0) / 4, ys.reduce((s, y) => s + y, 0) / 4];
    const segs = [], pills = [], stairs = [];
    const sideStep = (i) => {
      const s = S[i], sq2 = `\\sqrt{${pn(s.run)}^2+${pn(s.rise)}^2}`;
      return {
        cap: `${T(s.name)}: run ${T(String(s.run))}, rise ${T(String(s.rise))}. ${T(`m_{${s.name}}=${frEq(s.rise, s.run)}`)}. Length ${T(`${s.name}=${sq2}=${lenTex(s.len2)}`)}.`,
        run: async (c) => {
          if (i) stairs[i - 1].dim(0.18);
          const st = stair(G, { x: s.a[0], y: s.a[1], run: s.run, rise: s.rise }, { width: 3.5, labels: false }); stairs.push(st); await st.show(c, 360);
          segs[i].path.setAttribute('stroke-width', 5);
          const mx = (s.a[0] + s.b[0]) / 2, my = (s.a[1] + s.b[1]) / 2, [pmx, pmy] = G.toPx(mx, my), [pcx, pcy] = G.toPx(...cen);
          let nx = -(s.b[1] - s.a[1]) * G.uy, ny = -(s.b[0] - s.a[0]) * G.ux; const L = Math.hypot(nx, ny); nx /= L; ny /= L;
          if (nx * (pmx - pcx) + ny * (pmy - pcy) < 0) { nx = -nx; ny = -ny; }
          const d = h('div', 'bk-lab u6l6-spill', `${T('m=' + s.m)}<br>${T(rad(s.len2))}`); G.html.appendChild(d);
          const off = 34 + Math.abs(nx) * 26; place(d, pmx + nx * off, pmy + ny * off, 'c'); pills.push(d); await pop(c, d, 300);
        }
      };
    };
    const steps = [
      { cap: `Plot ${T(q.N.map((n, i) => n + pairTex(...q.P[i])).join(',\\ '))}. First tool for every side: <b>slope</b> (and length).`,
        run: async (c) => {
          for (let i = 0; i < 4; i++) await G.reveal(G.point(...q.P[i], { color: INK, r: 6.5, label: T(q.N[i]), pos: q.pos[i] }), c, 200);
          for (let i = 0; i < 4; i++) { segs[i] = G.segment(S[i].a, S[i].b, { color: BLUE, width: 3.5 }); await G.drawIn(segs[i], 260, c); }
          await tokTo(c, 'start'); await F.visit(c, 'start');
        } },
      sideStep(0), sideStep(1), sideStep(2), sideStep(3)
    ];
    const colorPair = (i, j, col) => { [i, j].forEach((t) => { segs[t].path.setAttribute('stroke', col); segs[t].path.setAttribute('stroke-width', 6); pills[t].style.borderColor = col; pills[t].style.color = col; }); };
    const [s0, s1, s2, s3] = S;
    const pairT = (s, u, ok) => (ok ? `m_{${s.name}}=m_{${u.name}}=${s.m}` : `m_{${s.name}}=${s.m},\\ m_{${u.name}}=${u.m}`);
    const parCap = `Opposite sides: ${T(pairT(s0, s2, A.p1))} ${A.p1 ? '✓' : '✗'} and ${T(pairT(s1, s3, A.p2))} ${A.p2 ? '✓' : '✗'}. ` +
      (A.par ? 'Both pairs are parallel: <b>yes</b>.' : `${A.p1 || A.p2 ? 'Only one pair is' : 'Neither pair is'} parallel: <b>no</b>.`);
    steps.push({ cap: parCap, run: async (c) => { stairs[3].dim(0.18); await goTo(c, 'start', 'par'); colorPair(0, 2, A.p1 ? TEAL : RED); colorPair(1, 3, A.p2 ? GRN : RED); await sleep(c, 200); } });
    if (!A.par) {
      steps.push({ cap: `${T(quad)} has only one pair of parallel sides (a trapezoid), so it is <b>not a parallelogram</b>. The other tests don’t apply.`,
        run: async (c) => { await goTo(c, 'par', 'no'); const s = stamp(stage, 'not a parallelogram', { ok: false, x: 233, y: 446, size: 'sm', rotate: -4 }); await stampIn(c, s); } });
      return steps;
    }
    const prod = `m_{${s0.name}}\\times m_{${s1.name}}=\\left(${s0.m}\\right)\\left(${s1.m}\\right)=${fr(s0.rise * s1.rise, s0.run * s1.run)}`;
    steps.push({ cap: A.perp ? `Adjacent sides: ${T(prod)}. Perpendicular: <b>yes</b>, so every angle is a right angle.` : `Adjacent sides: ${T(prod + '\\neq-1')}. Not perpendicular: <b>no</b> right angles.`,
      run: async (c) => {
        await goTo(c, 'par', 'perp');
        if (A.perp) for (let i = 0; i < 4; i++) { const V = q.P[i], Pp = q.P[(i + 3) % 4], Qq = q.P[(i + 1) % 4]; await appear(c, rmark(G, V, Pp, Qq, { s: 13, color: RED }), 160); }
        else { const V = q.P[1], t = G.label(V[0] + (cen[0] - V[0]) * 0.32, V[1] + (cen[1] - V[1]) * 0.32, '≠ 90°', { cls: 'u6l6-chk no' }); await pop(c, t); }
      } });
    const L0 = rad(s0.len2), L1 = rad(s1.len2), eqNode = A.perp ? 'eqR' : 'eqL';
    steps.push({ cap: A.eq ? `Lengths: all four sides are ${T(L0)}. All equal: <b>yes</b>.` : `Lengths: ${T(`${s0.name}=${s2.name}=${L0}`)} but ${T(`${s1.name}=${s3.name}=${L1}`)}. Not all equal: <b>no</b>.`,
      run: async (c) => {
        await goTo(c, 'perp', eqNode);
        for (let i = 0; i < 4; i++) { const t = ticks(G, S[i].a, S[i].b, A.eq ? 1 : (i % 2 ? 2 : 1), { color: INK }); await appear(c, t, 160); }
      } });
    steps.push({ cap: `${T(quad)} is a <b>${RESULT[A.res]}</b>.` + (A.res === 'para' ? ' Parallel, equal opposite sides, but no right angles and unequal neighbours.' : A.res === 'sq' ? ' Every test passed: a rhombus with a right angle.' : A.res === 'rect' ? ' Right angles, but not all sides equal.' : ' Four equal sides, but no right angles.'),
      run: async (c) => { await goTo(c, eqNode, A.res); const s = stamp(stage, RESULT[A.res], { ok: true, x: 233, y: 446, size: 'sm', rotate: -4 }); await stampIn(c, s); } });
    return steps;
  }
};

/* =============================== explainer: collinear (Section 6) =============================== */
const COL = {
  ex6: { pts: { A: [-6, -4], B: [-2, 2], C: [0, 5], D: [4, -8] }, pos: { A: 'w', B: 'nw', C: 'nw', D: 'e' }, win: { xmin: -8, xmax: 6, ymin: -10, ymax: 7 }, size: [380, 460] },
  fixed: { pts: { P: [0, 4], Q: [-2, -1], R: [1, 2], S: [4, 5] }, pos: { P: 'nw', Q: 'w', R: 'se', S: 'nw' }, win: { xmin: -4, xmax: 6, ymin: -3, ymax: 7 }, size: [430, 430] }
};
const collinear = {
  title: 'Which point does not belong?',
  height: 470,
  choices: [{ v: 'ex6', label: 'Example 6 check' }, { v: 'fixed', label: 'When the fixed point is the odd one' }],
  intro: (v) => (v === 'ex6' ? 'Three points share a line. Find the slope from A to each of the others. Press <b>Next</b>.' : 'What if the point you fix is the odd one? Press <b>Next</b>.'),
  make(stage, v, ex) {
    const d = COL[v], G = new Graph(stage, Object.assign({ x: 14, y: 6, width: d.size[0], height: d.size[1], xlabels: 2, ylabels: 2, fontSize: 15 }, d.win));
    const Pn = panel(stage, d.size[0] + 34, 6, ex.W - d.size[0] - 48, 458, 'Slopes from one fixed point');
    const plot = async (c) => { for (const n in d.pts) await G.reveal(npt(G, n, ...d.pts[n], { pos: d.pos[n], coords: false }), c); };
    const pstamp = async (c, txt) => { const s = stamp(Pn, txt, { ok: false, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = '10px'; await stampIn(c, s); };
    const slopeTo = (f, n, col) => async (c) => {
      const a = d.pts[f], b = d.pts[n], run = b[0] - a[0], rise = b[1] - a[1];
      const sg = G.segment(a, b, { color: col, width: 3, dash: '7 6' }); await G.drawIn(sg, 450, c);
      const S = stair(G, { x: a[0], y: a[1], run, rise }, { width: 3.5 }); await S.show(c, 350);
      await say(c, Pn, T(`m_{${f}${n}}=\\frac{${b[1]}-${pn(a[1])}}{${b[0]}-${pn(a[0])}}=${frEq(rise, run)}`), 'u6l6-mline');
      S.dim(0.22); sg.style.opacity = 0.5;
    };
    if (v === 'ex6') {
      return [
        { cap: `${T('A(-6,\\ -4)')}, ${T('B(-2,\\ 2)')}, ${T('C(0,\\ 5)')}, ${T('D(4,\\ -8)')}. Strategy: fix ${T('A')} and find the slope from ${T('A')} to each of the other three.`, run: plot },
        { cap: `${T('m_{AB}=\\frac{2-(-4)}{-2-(-6)}=\\frac{6}{4}=\\frac32')}.`, run: slopeTo('A', 'B', BLUE) },
        { cap: `${T('m_{AC}=\\frac{5-(-4)}{0-(-6)}=\\frac{9}{6}=\\frac32')}. The same slope as ${T('m_{AB}')}.`, run: slopeTo('A', 'C', BLUE) },
        { cap: `${T('m_{AD}=\\frac{-8-(-4)}{4-(-6)}=\\frac{-4}{10}=-\\frac25')}. The odd one.`, run: slopeTo('A', 'D', RED) },
        { cap: `${T('m_{AB}=m_{AC}=\\frac32')}: ${T('A')}, ${T('B')} and ${T('C')} lie on one line through ${T('A')}. ${T('D')} is the point that does <b>not</b> belong.`,
          run: async (c) => { await G.drawIn(G.line([-6, -4], [0, 5], { color: GRN, width: 4 }), 700, c); await pstamp(c, 'D is off the line'); } }
      ];
    }
    return [
      { cap: `Four points: three share a line. Fix ${T('P(0,\\ 4)')} first.`, run: plot },
      { cap: `From ${T('P')}: ${T('m_{PQ}=\\frac52')}, ${T('m_{PR}=-2')}, ${T('m_{PS}=\\frac14')}. <b>All three differ</b>.`,
        run: async (c) => { await slopeTo('P', 'Q', RED)(c); await slopeTo('P', 'R', RED)(c); await slopeTo('P', 'S', RED)(c); } },
      { cap: `If ${T('P')} were on the line, two of these slopes would match. None match, so ${T('P')} itself is the odd one. Check by repeating from ${T('Q')}.`,
        run: async (c) => { await say(c, Pn, `All different → <b>${T('P')} is the odd one</b>`, 'u6l6-bad'); } },
      { cap: `From ${T('Q')}: ${T('m_{QR}=\\frac{3}{3}=1')} and ${T('m_{QS}=\\frac{6}{6}=1')}. Equal: ${T('Q')}, ${T('R')}, ${T('S')} are collinear.`,
        run: async (c) => { await slopeTo('Q', 'R', BLUE)(c); await slopeTo('Q', 'S', BLUE)(c); await G.drawIn(G.line([-2, -1], [4, 5], { color: GRN, width: 4 }), 700, c); await pstamp(c, 'P is off the line'); } }
    ];
  }
};

/* =============================== explainer: classify a triangle (Section 7) =============================== */
const TRI = {
  ex7: { N: ['D', 'E', 'F'], P: [[-4, 1], [2, -1], [4, 5]], pos: ['nw', 'se', 'ne'] },
  fail: { N: ['R', 'S', 'T'], P: [[-4, -2], [3, -1], [1, 4]], pos: ['sw', 'se', 'n'] }
};
const triangle = {
  title: 'Classify a triangle: lengths, then a right angle two ways',
  height: 486,
  choices: [{ v: 'ex7', label: 'Example 7 check' }, { v: 'fail', label: 'A triangle that fails both tests' }],
  intro: (v) => (v === 'ex7' ? 'Triangle DEF. Press <b>Next</b>.' : 'Triangle RST: is there a right angle? Press <b>Next</b>.'),
  make(stage, v, ex) {
    const t = TRI[v], G = new Graph(stage, { x: 10, y: 8, width: 440, height: 380, xmin: -6, xmax: 6, ymin: -3, ymax: 7 });
    const Pn = panel(stage, 466, 8, ex.W - 480, 470, 'Side lengths');
    const sides = [[0, 1], [1, 2], [0, 2]].map(([i, j]) => { const a = t.P[i], b = t.P[j], run = b[0] - a[0], rise = b[1] - a[1]; return { a, b, run, rise, name: t.N[i] + t.N[j], len2: run * run + rise * rise }; });
    const srt = sides.slice().sort((p, q) => p.len2 - q.len2), lng = srt[2], s1 = srt[0], s2 = srt[1];
    const eq = sides.filter((s, i) => sides.some((u, j) => j !== i && u.len2 === s.len2));
    const kind = eq.length === 3 ? 'equilateral' : eq.length === 2 ? 'isosceles' : 'scalene';
    const right = s1.len2 + s2.len2 === lng.len2;
    // the vertex shared by the two shorter sides
    const vIdx = [0, 1, 2].find((i) => !lng.name.includes(t.N[i])), V = t.N[vIdx];
    const bars = h('div', 'u6l6-bars');
    const steps = [
      { cap: `Plot ${T(t.N.map((n, i) => n + pairTex(...t.P[i])).join(',\\ '))} and join them.`,
        run: async (c) => { for (let i = 0; i < 3; i++) await G.reveal(npt(G, t.N[i], ...t.P[i], { coords: false, pos: t.pos[i] }), c); await G.drawIn(G.polyline([...t.P, t.P[0]], { color: BLUE, width: 4 }), 700, c); } }
    ];
    sides.forEach((s, i) => steps.push({
      cap: `${T(s.name)}: run ${T(String(s.run))}, rise ${T(String(s.rise))}. ${T(`${s.name}=\\sqrt{${pn(s.run)}^2+${pn(s.rise)}^2}=${lenTex(s.len2)}`)}.`,
      run: async (c) => {
        const st = stair(G, { x: s.a[0], y: s.a[1], run: s.run, rise: s.rise }, { width: 3.5 }); await st.show(c, 330);
        await say(c, Pn, T(`${s.name}=\\sqrt{${s.run * s.run}+${s.rise * s.rise}}=${rad(s.len2)}`), 'u6l6-mline');
        st.dim(i === 2 ? 0.25 : 0.2);
      }
    }));
    steps.push({ cap: kind === 'isosceles' ? `Exactly two sides are equal (${T(eq.map((s) => s.name).join('=') + '=' + rad(eq[0].len2))}): <b>isosceles</b>.` : `No two sides are equal: <b>${kind}</b>.`,
      run: async (c) => { for (const s of eq) await appear(c, ticks(G, s.a, s.b, 1), 200); const s = stamp(Pn, kind, { ok: null, size: 'sm' }); s.style.alignSelf = 'center'; await stampIn(c, s); } });
    steps.push({ cap: `<b>Way 1, converse of the Pythagorean theorem.</b> Longest side ${T(lng.name)}: ${T(`${s1.name}^2+${s2.name}^2=${s1.len2}+${s2.len2}=${s1.len2 + s2.len2}`)} and ${T(`${lng.name}^2=${lng.len2}`)}. ${right ? `Equal, so the angle opposite ${T(lng.name)}, at ${T(V)}, is ${T('90^\\circ')}.` : 'Not equal: <b>no</b> right angle.'}`,
      run: async (c) => {
        const sc = 300 / Math.max(lng.len2, s1.len2 + s2.len2);
        bars.innerHTML = `<div class="u6l6-barrow"><span class="u6l6-barlab">${T(`${s1.name}^2+${s2.name}^2`)}</span><i class="u6l6-bar am" style="width:${s1.len2 * sc}px">${s1.len2}</i><i class="u6l6-bar am2" style="width:${s2.len2 * sc}px">${s2.len2}</i></div><div class="u6l6-barrow"><span class="u6l6-barlab">${T(`${lng.name}^2`)}</span><i class="u6l6-bar bl" style="width:${lng.len2 * sc}px">${lng.len2}</i></div>`;
        Pn.appendChild(bars); await fadeIn(c, bars, 400);
        await say(c, Pn, right ? `${T(`${s1.len2 + s2.len2}=${lng.len2}`)} ✓ right angle at ${T(V)}` : `${T(`${s1.len2 + s2.len2}\\neq${lng.len2}`)} ✗`, right ? 'u6l6-good' : 'u6l6-bad');
      } });
    const m1 = fr(s1.rise, s1.run), m2 = fr(s2.rise, s2.run), prod = fr(s1.rise * s2.rise, s1.run * s2.run);
    steps.push({ cap: `<b>Way 2, slopes.</b> ${T(`m_{${s1.name}}=${m1}`)}, ${T(`m_{${s2.name}}=${m2}`)}. Product ${T(`${prod}`)}${right ? `: perpendicular, so the right angle is at ${T(V)}.` : `${T('\\neq-1')}. (No other pair multiplies to ${T('-1')} either.) The two tests agree: <b>no</b> right angle.`}`,
      run: async (c) => {
        await say(c, Pn, T(`m_{${s1.name}}\\times m_{${s2.name}}=\\left(${m1}\\right)\\left(${m2}\\right)=${prod}`), 'u6l6-mline');
        if (right) {
          const others = [0, 1, 2].filter((i) => i !== vIdx); await appear(c, rmark(G, t.P[vIdx], t.P[others[0]], t.P[others[1]], { s: 16, color: RED }), 300);
          const s = stamp(Pn, `right angle at ${V}`, { ok: true, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = '8px'; await stampIn(c, s);
        } else { const s = stamp(Pn, 'no right angle', { ok: false, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = '8px'; await stampIn(c, s); }
      } });
    return steps;
  }
};

/* =============================== static figures =============================== */
function mountStatic() {
  const park = document.getElementById('u6l6-park'); if (park) parkGraph(park);
  // tools at a glance
  const mini = (host, o) => new Graph(host, Object.assign({ width: 176, height: 132, numbers: false, xtitle: '', ytitle: '', arrows: false, xmin: -1, xmax: 7, ymin: -1, ymax: 5 }, o));
  const M = {
    len(G) { G.segment([1, 1], [5, 4], { color: BLUE, width: 3.5 }); stair(G, { x: 1, y: 1, run: 4, rise: 3 }, { width: 2.5, labels: false }).showNow(); G.label(2.6, 3, T('5'), { cls: 'u6l6-mlab', color: BLUE }); },
    mid(G) { G.segment([0.5, 0.5], [5.5, 4.5], { color: BLUE, width: 3.5 }); G.point(3, 2.5, { color: TEAL, r: 6 }); G.point(0.5, 0.5, { color: INK, r: 4 }); G.point(5.5, 4.5, { color: INK, r: 4 }); },
    slope(G) { G.segment([1, 4], [5, 1], { color: BLUE, width: 3.5 }); const S = stair(G, { x: 1, y: 4, run: 4, rise: -3 }, { width: 2.5, labels: false }); S.showNow(); },
    pp(G) { G.segment([0, 0.5], [4, 2.5], { color: BLUE, width: 3.5 }); G.segment([2, 3.2], [6, 5.2], { color: BLUE, width: 3.5 }); G.segment([5, 0], [3.6, 2.8], { color: RED, width: 3.5 }); },
    lin(G) { G.line([0, 4], [5, 0], { color: BLUE, width: 3 }); G.point(5, 0, { color: AMB, r: 5.5 }); G.point(0, 4, { color: PUR, r: 5.5 }); },
    dr(G) { G.segment([1, 1], [5, 4], { color: BLUE, width: 3.5, ends: ['closed', 'closed'] }); G.shadeX(1, 5, { width: 7 }); G.shadeY(1, 4, { width: 7 }); }
  };
  document.querySelectorAll('[data-u6l6-mini]').forEach((el) => { const k = el.dataset.u6l6Mini; const G = mini(el); M[k](G); });
  // Example 5: tap to plot
  const e5 = document.getElementById('u6l6-ex5grid');
  if (e5) new Graph(e5, { width: 400, height: 300, xmin: -6, xmax: 6, ymin: -4, ymax: 4, fontSize: 15, xlabels: 2, ylabels: 2, interactive: { snap: 1, coords: true, max: 4, color: 'blue' } });
  // Example 7 figure
  const e7 = document.getElementById('u6l6-ex7fig');
  if (e7) { const G = new Graph(e7, { width: 340, height: 290, xmin: -6, xmax: 6, ymin: -3, ymax: 7, fontSize: 15, xlabels: 2, ylabels: 2 }); G.polyline([[-4, 1], [2, -1], [4, 5], [-4, 1]], { color: INK, width: 3.5 }); [['D', -4, 1, 'nw'], ['E', 2, -1, 'se'], ['F', 4, 5, 'ne']].forEach(([n, x, y, p]) => G.point(x, y, { color: INK, r: 6, label: T(n), pos: p })); }
  // review question 1
  const q1 = document.getElementById('u6l6-q1fig');
  if (q1) {
    const G = new Graph(q1, { width: 390, height: 390, xmin: -7, xmax: 7, ymin: -7, ymax: 7, fontSize: 15, xlabels: 2, ylabels: 2 });
    [[[-3, -1], [1, 5]], [[-5, 3], [3, -3]], [[2, 4], [5, -4]]].forEach(([a, b]) => G.segment(a, b, { color: INK, width: 4 }));
    [['A', -3, -1, 'sw'], ['B', 1, 5, 'ne'], ['C', -5, 3, 'nw'], ['D', 3, -3, 'se'], ['E', 2, 4, 'ne'], ['F', 5, -4, 'se']].forEach(([n, x, y, p]) => G.point(x, y, { color: INK, r: 6, label: T(n), pos: p }));
  }
}

/* =============================== mount =============================== */
mountStatic();
export const explainers = mountExplainers({ hunt, distance, midpoint, stair: stairEx, parPerp, linear, whichTool, collinear, triangle });
export const _test = { analyse, QUADS, fr, rad };
