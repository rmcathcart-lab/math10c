/* Math 10C · Unit 6 · Lesson 5 — Characteristics of Linear Graphs.
 * Warm-up phones (tap-to-fill tables and a clock that drains both batteries) and the explainers:
 *   linTest (is a table linear? x-steps, changes in y, quotients, then plot), uneven (the uneven-steps trap as slope
 *   triangles), graphInts (a point rides the line to each axis; slope from the intercepts), tableInts (intercepts in a
 *   table, continuing it to the zero), domRange (squash the line onto each axis), story (water cooler / battery:
 *   intercepts, rate with units, restricted domain and range), lineLab (a line rotates and slides while live counters
 *   track its intercepts, slope sign, domain and range), countFlow (three questions that count the intercepts),
 *   sketch (Example 4: try a line, then fix it), match (Example 5: slope sign first, then intercepts).
 * Colours: run / x-steps / domain amber, rise / y-changes / range purple, lines brand blue, x-intercepts red,
 * y-intercepts blue. */
import {
  h, tex, add, box, place, Graph, ValueTable, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep,
  tween, pairTex, texNum, svgEl, liveCtx, pulse, arrowHead, drawIn, COLORS
} from '../blocks.js';

const T = (s) => tex(String(s));
const RED = COLORS.red, BLUE = COLORS.blue, AMB = COLORS.amber, PUR = COLORS.purple, GRN = COLORS.green, INK = COLORS.ink, GRAY = COLORS.gray;
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u6l5-panel ' + cls, title ? `<div class="u6l5-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u6l5-line ' + cls, html); p.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const sg = (v) => (v > 0 ? '+' : '') + texNum(v);            // signed TeX number
const pm = (v) => String(v).replace('-', '−');                 // plain text with a real minus
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
/** TeX for p/q in lowest terms (an integer when it divides) */
function frac(p, q, cmd = '\\tfrac') {
  if (q < 0) { p = -p; q = -q; }
  const g = gcd(Math.abs(p), q) || 1; p /= g; q /= g;
  return q === 1 ? String(p) : (p < 0 ? '-' : '') + `${cmd}{${Math.abs(p)}}{${q}}`;
}
const tc = (color, s) => `\\textcolor{${color}}{${s}}`;
const R = '\\mathbb{R}';
const ALLX = `\\{x\\mid x\\in${R}\\}`, ALLY = `\\{y\\mid y\\in${R}\\}`;

/* curved arrows between neighbouring cells of one row of a horizontal ValueTable: above (side −1) or below (side 1) */
function arcs(tb, col, side, labs, color, from = 0) {
  const out = [], grid = tb.grid;
  for (let k = 0; k < labs.length; k++) {
    const a = tb.cell(from + k, col), b = tb.cell(from + k + 1, col);
    const x1 = a.offsetLeft + a.offsetWidth / 2 + 6, x2 = b.offsetLeft + b.offsetWidth / 2 - 6;
    const y = side < 0 ? grid.offsetTop - 3 : grid.offsetTop + grid.offsetHeight + 3, bulge = 22 * side;
    const pts = []; for (let j = 0; j <= 20; j++) { const t = j / 20; pts.push([x1 + (x2 - x1) * t, y + bulge * 4 * t * (1 - t)]); }
    const g = svgEl('g', { class: 'bk-curve u6l5-arc' }, tb.svg); g.style.color = color;
    svgEl('path', { class: 'bk-stroke', d: 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L'), fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    const p0 = pts[17], p1 = pts[20], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
    arrowHead(g, p1[0], p1[1], (p1[0] - p0[0]) / L, (p1[1] - p0[1]) / L, { width: 3, color, cls: 'bk-end bk-end1' });
    const lab = h('div', 'bk-lab u6l5-arclab', labs[k]); lab.style.color = color;
    tb.html.appendChild(place(lab, (x1 + x2) / 2, y + bulge + (side < 0 ? -1 : 1), side < 0 ? 'n' : 's', 0));
    out.push({ g, lab, x: (x1 + x2) / 2, y: y + bulge });
  }
  return out;
}
async function drawArcs(c, list, ms = 300) { for (const a of list) { a.lab.style.opacity = 0; await drawIn(a.g, ms, c); await pop(c, a.lab, 240); } }

/* a whole line through (st.x, st.y) at angle st.th (degrees), clipped to the window, arrows at the edges */
function pivotLine(G, st, o = {}) {
  return G.curve(() => {
    const r = st.th * Math.PI / 180, d = [Math.cos(r), Math.sin(r)], a = [st.x, st.y];
    const TT = G._clipT(a, d, -Infinity, Infinity); if (!TT) return { subs: [] };
    const p0 = G.toPx(a[0] + d[0] * TT[0], a[1] + d[1] * TT[0]), p1 = G.toPx(a[0] + d[0] * TT[1], a[1] + d[1] * TT[1]);
    const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); if (L < 2) return { subs: [] };
    const u = [(p1[0] - p0[0]) / L, (p1[1] - p0[1]) / L];
    return { subs: [[p0, p1]], ends: [{ p: p0, d: [-u[0], -u[1]], s: 'arrow', k: 0, si: 0, last: false }, { p: p1, d: u, s: 'arrow', k: 1, si: 0, last: true }] };
  }, Object.assign({ color: BLUE, width: 4 }, o), 'bk-line', G.layers.data);
}
const deg = (m) => Math.atan(m) * 180 / Math.PI;
/** a slope triangle from L to R (graph points): run (amber) then rise (purple), with labels */
function slopeTri(G, L, Rr, o = {}) {
  const C = [Rr[0], L[1]], run = Rr[0] - L[0], rise = Rr[1] - L[1];
  const hs = G.segment(L, C, { color: AMB, width: 5 }), vs = G.segment(C, Rr, { color: PUR, width: 5 });
  const hl = G.label((L[0] + C[0]) / 2, L[1], T(o.runTex || `\\text{run } ${texNum(run)}`), { pos: rise > 0 ? 's' : 'n', cls: 'bk-ptlab', color: AMB, gap: 6 });
  const vl = G.label(C[0], (C[1] + Rr[1]) / 2, T(o.riseTex || `\\text{rise } ${texNum(rise)}`), { pos: o.risePos || 'e', cls: 'bk-ptlab', color: PUR, gap: 7 });
  hl.style.opacity = 0; vl.style.opacity = 0;
  return { hs, vs, hl, vl, async play(c) { await G.drawIn(hs, 500, c); await fadeIn(c, hl); await G.drawIn(vs, 500, c); await fadeIn(c, vl); } };
}

/* =============================== warm-up: low battery =============================== */
function mountWarm() {
  const host = document.getElementById('u6l5-phones'); if (!host) return;
  const P = [{ name: 'Mia', act: 'gaming', b0: 90, r: 15 }, { name: 'Leo', act: 'texting', b0: 40, r: 5 }];
  const times = ['12:00', '1:00', '2:00', '3:00'];
  const sides = P.map((p) => {
    const wrap = h('div', 'u6l5-pside');
    const ph = h('div', 'u6l5-phone', `<div class="u6l5-pname">${p.name}</div><div class="u6l5-pbody"><div class="u6l5-pscreen">` +
      '<div class="u6l5-bat"><div class="u6l5-batfill"></div></div><div class="u6l5-pct"></div>' +
      `<div class="u6l5-act">${p.act}</div></div><div class="u6l5-pbtn"></div></div>`);
    const tb = new ValueTable(null, { headers: [{ html: 'Time' }, { html: 'Battery' }], rows: times.map((t, i) => [{ html: t }, { html: (p.b0 - p.r * i) + '%' }]), layout: 'v', cellW: 112, cellH: 50, hide: [[3, 1]], q: '?', cls: 'u6l5-wtab' });
    wrap.append(ph, tb.el);
    const fill = ph.querySelector('.u6l5-batfill'), pct = ph.querySelector('.u6l5-pct'), scr = ph.querySelector('.u6l5-pscreen');
    const set = (v) => {
      const b = Math.max(0, v);
      fill.style.width = b + '%'; fill.style.background = b > 50 ? '#3ca050' : b > 20 ? '#c8a014' : '#c93a33';
      pct.textContent = Math.round(b) + '%'; scr.classList.toggle('u6l5-dead', b <= 0);
    };
    set(p.b0);
    return { wrap, set, p };
  });
  const clock = h('div', 'u6l5-clock', '<div class="u6l5-ck-k">time</div><div class="u6l5-ck-v">12:00 pm</div><div class="u6l5-ck-s">noon</div>');
  host.append(sides[0].wrap, clock, sides[1].wrap);
  const cv = clock.querySelector('.u6l5-ck-v'), cs = clock.querySelector('.u6l5-ck-s'), msg = document.getElementById('u6l5-clockmsg');
  const fmtT = (t) => { const mins = Math.round(t * 60), hh = 12 + Math.floor(mins / 60), mm = mins % 60; return `${hh > 12 ? hh - 12 : hh}:${String(mm).padStart(2, '0')} pm`; };
  const setT = (t) => {
    cv.textContent = fmtT(t); cs.textContent = t === 0 ? 'noon' : `${(Math.round(t * 10) / 10).toFixed(1)} h after noon`;
    sides.forEach((s) => s.set(s.p.b0 - s.p.r * t));
    const dead = sides.filter((s) => s.p.b0 - s.p.r * t <= 1e-9).map((s) => `${s.p.name}’s phone died at ${fmtT(s.p.b0 / s.p.r)}.`);
    msg.textContent = dead.join(' ');
  };
  let gen = 0;
  document.getElementById('u6l5-run').addEventListener('click', async () => {
    const g = ++gen, c = liveCtx(); setT(0); await sleep(c, 200);
    await tween(c, 7000, (t) => { if (g !== gen) return false; setT(8 * t); }, (t) => t);
  });
  document.getElementById('u6l5-reset').addEventListener('click', () => { gen++; setT(0); });
}

/* =============================== explainer 1: is it linear? =============================== */
const LT = {
  mia: { label: 'Warm-up: Mia’s battery', hx: 't\\text{ (h)}', hy: 'B\\ (\\%)', xs: [0, 1, 2, 3], ys: [90, 75, 60, 45], seg: [[0, 90], [6, 0]],
    rate: 'The battery loses 15% every hour.', g: { xmin: -0.8, xmax: 7, ymin: -8, ymax: 100, ystep: 10, ylabels: 20, xtitle: 't', ytitle: 'B' } },
  bend: { label: 'A table that bends', xs: [0, 1, 2, 3, 4], ys: [20, 19, 16, 11, 4], f: (x) => 20 - x * x, g: { xmin: -1, xmax: 5, ymin: -2, ymax: 22, ystep: 2, ylabels: 4 } },
  a: { label: 'Example 1 (a) check', xs: [0, 1, 2, 3, 4], ys: [-3, -1, 1, 3, 5], g: { xmin: -2, xmax: 6, ymin: -5, ymax: 7 } },
  b: { label: 'Example 1 (b) check', xs: [0, 1, 2, 3, 4], ys: [1, 2, 5, 10, 17], f: (x) => x * x + 1, g: { xmin: -1, xmax: 5, ymin: -2, ymax: 18, ystep: 2, ylabels: 4 } },
  c: { label: 'Example 1 (c) check', xs: [-2, 0, 3, 7], ys: [11, 7, 1, -7], g: { xmin: -3, xmax: 8, ymin: -8, ymax: 12, ylabels: 2 } }
};
const linTest = {
  title: 'Is the table linear?',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'mia', label: LT.mia.label }, { v: 'bend', label: LT.bend.label }, { sep: 'Example 1 check' }, ...['a', 'b', 'c'].map((k) => ({ v: k, label: '(' + k + ')' }))],
  intro: (k) => (LT[k].hx ? `Mia’s battery, hour by hour. Check the ${T('t')}-row, then the changes in ${T('B')}. Press <b>Next</b>.`
    : `A table of values. Check the ${T('x')}-row, then the changes in ${T('y')}. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = LT[k], xs = d.xs, ys = d.ys, n = xs.length, yv = d.hy ? 'B' : 'y', xv = d.hx ? 't' : 'x';
    const dx = xs.slice(1).map((x, i) => x - xs[i]), dy = ys.slice(1).map((y, i) => y - ys[i]);
    const eqx = dx.every((v) => v === dx[0]), q = dy.map((v, i) => v / dx[i]), lin = q.every((v) => Math.abs(v - q[0]) < 1e-9);
    const m = lin ? frac(dy[0], dx[0]) : null, list = dy.map(sg).join(',\\ ');
    const GW = 400, G = new Graph(stage, Object.assign({ x: ex.W - GW - 14, y: 14, width: GW, height: 442 }, d.g));
    const tb = new ValueTable(stage, { x: 22, y: 92, headers: [d.hx || 'x', d.hy || 'y'], rows: xs.map((x, i) => [x, ys[i]]), layout: 'h', cellW: n > 4 ? 72 : d.hx ? 90 : 104, cellH: 54, headW: d.hx ? 92 : 62, tap: false });
    const P = panel(stage, 22, 318, ex.W - GW - 64, 140, 'Verdict', 'u6l5-verdict');
    const top = h('div', 'u6l5-vtop'), row = h('div', 'u6l5-vrow'); P.append(top, row);
    const capX = eqx ? `Check the ${T(xv)}-row first: it goes up in steps of <b>${dx[0]}</b> every time. <b>Equal steps.</b>`
      : `Check the ${T(xv)}-row first: the steps are ${T(dx.map(sg).join(',\\ '))}. <b>Not equal!</b>`;
    const capY = eqx ? `Equal steps, so compare the changes in ${T(yv)}: ${T(list)}. ${lin ? '<b>All the same.</b>' : '<b>Not the same.</b>'}`
      : `Changes in ${T(yv)}: ${T(list)}. They <b>look</b> unequal, but so were the ${T(xv)}-steps. Don’t decide yet!`;
    const capV = !eqx ? `Divide each change in ${T(yv)} by its change in ${T(xv)}: every quotient is ${T(m)}. <b>Linear</b>, slope ${T(m)}.`
      : lin ? `<b>Linear.</b> Slope ${T(`=\\dfrac{\\text{change in }${yv}}{\\text{change in }${xv}}=\\dfrac{${dy[0]}}{${dx[0]}}=${m}`)}.${d.rate ? ' ' + d.rate : ''}`
        : `<b>Not linear.</b> The changes in ${T(yv)} are different, so no single slope fits.`;
    const capG = lin ? `Plot the points: they line up on a <b>straight line</b>.` : `Plot the points: they bend into a <b>curve</b>.`;
    return [
      { cap: capX, run: async (c) => { tb.highlightCol(0, true); await drawArcs(c, arcs(tb, 0, -1, dx.map((v) => T(sg(v))), AMB)); tb.highlightCol(0, false);
        await show(c, line(top, eqx ? `✓ equal ${xv}-steps` : `✗ unequal ${xv}-steps`, eqx ? 'u6l5-good' : 'u6l5-bad')); } },
      { cap: capY, run: async (c) => { await drawArcs(c, arcs(tb, 1, 1, dy.map((v) => T(sg(v))), PUR)); } },
      { cap: capV, run: async (c) => {
        if (!eqx) {
          const grid = tb.grid, yq = grid.offsetTop + grid.offsetHeight + 56;
          for (let i = 0; i < dy.length; i++) {
            const a = tb.cell(i, 1), b = tb.cell(i + 1, 1), xm = (a.offsetLeft + a.offsetWidth / 2 + b.offsetLeft + b.offsetWidth / 2) / 2;
            const lab = h('div', 'bk-lab u6l5-quot', T(`\\tfrac{${tc(PUR, dy[i])}}{${tc(AMB, dx[i])}}=${texNum(q[i])}`));
            tb.html.appendChild(place(lab, xm, yq, 's', 0)); await pop(c, lab, 320);
          }
        }
        const s = stamp(row, lin ? 'linear' : 'not linear', { ok: lin }); await stampIn(c, s);
        if (lin) await show(c, line(row, `slope ${T('m=' + m)}`, 'u6l5-big'));
      } },
      { cap: capG, run: async (c) => {
        for (let i = 0; i < n; i++) await pop(c, G.point(xs[i], ys[i], { color: INK, r: 7 }), 220);
        const curve = d.seg ? G.segment(d.seg[0], d.seg[1], { color: BLUE, width: 4 }) : lin ? G.line([xs[0], ys[0]], [xs[1], ys[1]], { color: BLUE, width: 4 })
          : G.fn(d.f, { from: xs[0], to: xs[n - 1], color: RED, width: 4, arrows: false });
        await G.drawIn(curve, 900, c);
      } }
    ];
  }
};

/* =============================== explainer 2: the uneven-steps trap =============================== */
const UN = {
  c: { label: 'Example 1 (c) check', xs: [-2, 0, 3, 7], ys: [11, 7, 1, -7], g: { xmin: -3.5, xmax: 8.5, ymin: -8.5, ymax: 12.5, xlabels: 2, ylabels: 2 } },
  bend: { label: 'Equal changes, unequal steps', xs: [0, 1, 3, 4], ys: [1, 3, 5, 7], g: { xmin: -1.5, xmax: 6.5, ymin: -1.5, ymax: 9.5 } }
};
const uneven = {
  title: 'Every step hides a slope triangle',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'c', label: UN.c.label }, { v: 'bend', label: UN.bend.label }],
  intro: (k) => (k === 'c' ? `The ${T('x')}-steps are ${T('+2,\\ +3,\\ +4')} and the ${T('y')}-changes are ${T('-4,\\ -6,\\ -8')}. Linear or not? Press <b>Next</b>.`
    : `Here every change in ${T('y')} is ${T('+2')}. Does that make it linear? Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = UN[k], xs = d.xs, ys = d.ys, n = xs.length, pts = xs.map((x, i) => [x, ys[i]]);
    const dx = xs.slice(1).map((x, i) => x - xs[i]), dy = ys.slice(1).map((y, i) => y - ys[i]), q = dy.map((v, i) => v / dx[i]);
    const lin = q.every((v) => Math.abs(v - q[0]) < 1e-9);
    const G = new Graph(stage, Object.assign({ x: 14, y: 7, width: 456, height: 456 }, d.g));
    const P = panel(stage, 492, 14, ex.W - 506, 442, 'rise ÷ run');
    const tb = new ValueTable(P, { rows: pts, layout: 'h', cellW: 58, cellH: 46, headW: 46, tap: false, cls: 'u6l5-ptab' });
    void tb;
    const qs = h('div', 'u6l5-qs'); P.appendChild(qs);
    const dots = [];
    const steps = [{ cap: `Plot the table’s ${n} points.`, run: async (c) => { for (const p of pts) { const q0 = G.point(p[0], p[1], { color: INK, r: 7 }); dots.push(q0); await pop(c, q0, 220); } } }];
    for (let i = 0; i < n - 1; i++) {
      steps.push({ cap: `From ${T(pairTex(...pts[i]))} to ${T(pairTex(...pts[i + 1]))}: run ${T(tc(AMB, dx[i]))}, rise ${T(tc(PUR, dy[i]))}. Rise ÷ run ${T('=' + texNum(q[i]))}.`,
        run: async (c) => {
          tb.highlight(i, true); tb.highlight(i + 1, true);
          const t = slopeTri(G, pts[i], pts[i + 1], { runTex: tc(AMB, sg(dx[i])), riseTex: tc(PUR, sg(dy[i])) }); await t.play(c);
          await pop(c, add(qs, h('div', 'u6l5-qline', T(`\\dfrac{${tc(PUR, dy[i])}}{${tc(AMB, dx[i])}}=${texNum(q[i])}`))), 320);
          tb.highlight(i, false); tb.highlight(i + 1, false);
        } });
    }
    steps.push({ cap: lin ? `The triangles grow, but every one has rise ÷ run ${T('=' + texNum(q[0]))}: one straight line, <b>linear</b>, slope ${T(texNum(q[0]))}.`
      : `Every change in ${T('y')} was ${T('+2')}, but rise ÷ run is ${T(q.map(texNum).join(',\\ '))}. The points bend: <b>not linear</b>.`,
    run: async (c) => {
      if (lin) await G.drawIn(G.line(pts[0], pts[1], { color: BLUE, width: 4 }), 900, c);
      else { await G.drawIn(G.line(pts[0], pts[1], { color: GRAY, width: 3, dash: true }), 700, c); await G.drawIn(G.polyline(pts, { color: RED, width: 4 }), 800, c); }
      const s = stamp(P, lin ? 'linear' : 'not linear', { ok: lin }); s.style.alignSelf = 'center'; s.style.marginTop = '8px'; await stampIn(c, s);
    } });
    return steps;
  }
};

/* =============================== explainer 3: intercepts from a graph =============================== */
const GI = {
  ex2: { label: 'Example 2 (a) check', m: 2 / 3, b: 2, xi: -3, yi: 2, from: -5.2, mt: '\\tfrac23' },
  ex4: { label: 'Example 4 (a) check', m: 2 / 3, b: -2, xi: 3, yi: -2, from: -4.6, mt: '\\tfrac23' },
  demo: { label: 'A falling line', m: -2, b: -4, xi: -2, yi: -4, from: -4.6, mt: '-2' }
};
const graphInts = {
  title: 'Where the line crosses the axes',
  height: 470,
  choices: [{ v: 'demo', label: GI.demo.label }, { sep: 'Check' }, { v: 'ex2', label: GI.ex2.label }, { v: 'ex4', label: GI.ex4.label }],
  intro: 'A point is about to ride along the line. Watch its coordinates. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = GI[k], f = (x) => d.m * x + d.b;
    const G = new Graph(stage, { x: 14, y: 14, width: 442, height: 442, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5 });
    const P = panel(stage, 480, 14, ex.W - 494, 442, 'The moving point');
    const ro = h('div', 'u6l5-ro', '<div class="u6l5-ro-r u6l5-rx"><i>x</i><span class="u6l5-ro-eq">=</span><b class="u6l5-ro-v"></b></div><div class="u6l5-ro-r u6l5-ry"><i>y</i><span class="u6l5-ro-eq">=</span><b class="u6l5-ro-v"></b></div>');
    P.appendChild(ro);
    const rx = ro.querySelector('.u6l5-rx'), ry = ro.querySelector('.u6l5-ry'), vx = rx.querySelector('b'), vy = ry.querySelector('b');
    const res = h('div', 'u6l5-res'); P.appendChild(res);
    const L = G.line({ m: d.m, b: d.b }, { color: BLUE, width: 4 });
    const pt = G.point(d.from, f(d.from), { color: GRN, r: 9 }); pt.style.opacity = 0;
    const r1 = (v) => { const r = Math.round(v * 10) / 10; return pm(Object.is(r, -0) ? 0 : r); };
    const setRO = (x) => { vx.textContent = r1(x); vy.textContent = r1(f(x)); rx.classList.toggle('u6l5-hoty', Math.abs(x) < 1e-6); ry.classList.toggle('u6l5-hotx', Math.abs(f(x)) < 1e-6); };
    setRO(d.from);
    const stops = [{ x: d.xi, kind: 'x' }, { x: 0, kind: 'y' }].sort((a, b) => a.x - b.x);
    let cur = d.from;
    const ride = (c, x1) => { const x0 = cur; cur = x1; return tween(c, 1500 * Math.abs(x1 - x0) / 4, (t) => { const x = x0 + (x1 - x0) * t; G.moveTo(pt, x, f(x)); setRO(x); }); };
    const stopCap = (s) => (s.kind === 'x'
      ? `It reaches the ${T('x')}-axis, where ${T('y=0')}: <b>${T('x')}-intercept ${T(d.xi)}</b>, the point ${T(pairTex(d.xi, 0))}.`
      : `It reaches the ${T('y')}-axis, where ${T('x=0')}: <b>${T('y')}-intercept ${T(d.yi)}</b>, the point ${T(pairTex(0, d.yi))}.`);
    const labs = [];
    const stopRun = (s) => async (c) => {
      await ride(c, s.x);
      const q = s.kind === 'x' ? G.point(d.xi, 0, { color: RED, r: 9, label: T(pairTex(d.xi, 0)), pos: d.m > 0 ? 'nw' : 'ne', labelColor: RED })
        : G.point(0, d.yi, { color: BLUE, r: 9, label: T(pairTex(0, d.yi)), pos: d.m > 0 ? 'se' : 'sw', labelColor: BLUE });
      labs.push(q.label); await G.reveal(q, c);
      await show(c, line(res, s.kind === 'x' ? `${T('x')}-intercept <b>${T(d.xi)}</b> &nbsp;·&nbsp; ${T(pairTex(d.xi, 0))}` : `${T('y')}-intercept <b>${T(d.yi)}</b> &nbsp;·&nbsp; ${T(pairTex(0, d.yi))}`, s.kind === 'x' ? 'u6l5-cx' : 'u6l5-cy'));
    };
    const pA = stops[0].kind === 'x' ? [d.xi, 0] : [0, d.yi], pB = stops[1].kind === 'x' ? [d.xi, 0] : [0, d.yi];
    const run = pB[0] - pA[0], rise = pB[1] - pA[1], mTex = `m=\\dfrac{${rise}}{${run}}` + (rise % run === 0 ? '=' + d.mt : '');
    return [
      { cap: `The line, and a point riding along it. Its readout shows its coordinates.`, run: async (c) => { await G.drawIn(L, 700, c); await pop(c, pt); } },
      { cap: stopCap(stops[0]), run: stopRun(stops[0]) },
      { cap: stopCap(stops[1]), run: stopRun(stops[1]) },
      { cap: `Slope from the two intercepts: run ${T(tc(AMB, run))}, rise ${T(tc(PUR, rise))}, so ${T(mTex)}.`,
        run: async (c) => {
          pt.style.opacity = 0; labs.forEach((l) => { l.style.visibility = 'hidden'; l.style.opacity = 0; });
          await slopeTri(G, pA, pB, { runTex: tc(AMB, `\\text{run } ${run}`), riseTex: tc(PUR, `\\text{rise } ${rise}`), risePos: pB[0] === 0 ? 'e' : 'e' }).play(c);
          await show(c, line(res, `slope ${T(mTex)}`, 'u6l5-cm'));
        } }
    ];
  }
};

/* =============================== explainer 4: intercepts in a table =============================== */
const TI = {
  ex2: { label: 'Example 2 (b) check', xs: [-4, -2, 0, 2, 4], ys: [9, 6, 3, 0, -3], g: { xmin: -5.5, xmax: 5.5, ymin: -4.5, ymax: 10.5, xlabels: 2, ylabels: 2 } },
  mia: { label: 'Warm-up: Mia’s phone', who: 'Mia', xs: [0, 1, 2, 3], ys: [90, 75, 60, 45], ext: 3, g: { xmin: -0.7, xmax: 9, ymin: -8, ymax: 100, ystep: 10, ylabels: 20, xtitle: 't', ytitle: 'B' } },
  leo: { label: 'Warm-up: Leo’s phone', who: 'Leo', xs: [0, 1, 2, 3], ys: [40, 35, 30, 25], ext: 5, g: { xmin: -0.7, xmax: 9, ymin: -4, ymax: 50, ystep: 5, ylabels: 10, xtitle: 't', ytitle: 'B' } }
};
const tableInts = {
  title: 'Intercepts in a table of values',
  height: 470,
  choices: [{ v: 'ex2', label: TI.ex2.label }, { sep: 'Warm-up' }, { v: 'mia', label: 'Mia’s phone' }, { v: 'leo', label: 'Leo’s phone' }],
  intro: (k) => (k === 'ex2' ? 'Is it linear? Then where are the zeros? Press <b>Next</b>.' : `${TI[k].who}’s battery: ${T('t')} hours after noon, ${T('B')} percent. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = TI[k], bat = !!d.who, xv = bat ? 't' : 'x', yv = bat ? 'B' : 'y';
    const xs = d.xs.slice(), ys = d.ys.slice(), dx = xs[1] - xs[0], dy = ys[1] - ys[0];
    const GW = 372, G = new Graph(stage, Object.assign({ x: ex.W - GW - 14, y: 14, width: GW, height: 442 }, d.g));
    const tb = new ValueTable(stage, { x: 20, y: 78, headers: bat ? ['t', 'B'] : ['x', 'y'], rows: xs.map((x, i) => [x, ys[i]]), layout: 'h', cellW: bat ? 54 : 70, cellH: 52, headW: 56, tap: false });
    const P = panel(stage, 20, 262, ex.W - GW - 54, 194, bat ? `${T('t')} = hours after noon, ${T('B')} = battery %` : 'Intercepts');
    const i0 = xs.indexOf(0);
    const steps = [
      { cap: `Linear? ${T(xv)} steps by ${T(dx)} and ${T(yv)} changes by ${T(dy)} every time: <b>linear</b>${bat ? '' : ` (slope ${T(frac(dy, dx))})`}.`,
        run: async (c) => { await drawArcs(c, arcs(tb, 0, -1, xs.slice(1).map(() => T(sg(dx))), AMB)); await drawArcs(c, arcs(tb, 1, 1, ys.slice(1).map(() => T(sg(dy))), PUR)); } },
      { cap: bat ? `<b>Vertical intercept:</b> the entry with ${T('t=0')} has ${T('B=' + ys[i0])}: the charge at noon, the <b>starting value</b>.`
        : `<b>${T('y')}-intercept:</b> find the entry with ${T('x=0')}. There ${T('y=' + ys[i0])}: the point ${T(pairTex(0, ys[i0]))}.`,
      run: async (c) => {
        tb.highlight(i0, true, 'u6l5-hly');
        await G.reveal(G.point(0, ys[i0], { color: BLUE, r: 9, label: T(pairTex(0, ys[i0])), pos: 'e', labelColor: BLUE }), c);
        await show(c, line(P, `${bat ? 'vertical ' : T('y') + '-'}intercept <b>${T(ys[i0])}</b>${bat ? ': ' + ys[i0] + '% at noon' : ''}`, 'u6l5-cy'));
      } }
    ];
    if (!bat) {
      const iz = ys.indexOf(0);
      steps.push({ cap: `<b>${T('x')}-intercept:</b> find the entry with ${T('y=0')}. There ${T('x=' + xs[iz])}: the point ${T(pairTex(xs[iz], 0))}.`,
        run: async (c) => {
          tb.highlight(iz, true, 'u6l5-hlx');
          await G.reveal(G.point(xs[iz], 0, { color: RED, r: 9, label: T(pairTex(xs[iz], 0)), pos: 'ne', labelColor: RED }), c);
          await show(c, line(P, `${T('x')}-intercept <b>${T(xs[iz])}</b>`, 'u6l5-cx'));
        } });
      steps.push({ cap: `Plot the other entries: all five points lie on one line through both intercepts.`,
        run: async (c) => { for (let i = 0; i < xs.length; i++) if (xs[i] !== 0 && ys[i] !== 0) await pop(c, G.point(xs[i], ys[i], { color: INK, r: 7 }), 220); await G.drawIn(G.line([xs[0], ys[0]], [xs[1], ys[1]], { color: BLUE, width: 4, layer: 'data' }), 800, c); } });
    } else {
      const t0 = -ys[0] / dy;  // when B reaches 0
      steps.push({ cap: `No entry has ${T('B=0')}. Keep the pattern going, ${T(dy)} every hour… until ${T('B=0')} at ${T('t=' + t0)}: <b>horizontal intercept ${t0}</b>. The phone dies at <b>${t0}:00 pm</b>.`,
        run: async (c) => {
          for (let j = 0; j < d.ext; j++) {
            const x = xs[xs.length - 1] + dx, y = ys[ys.length - 1] + dy; xs.push(x); ys.push(y);
            await tb.addRow([x, y], c);
            await drawArcs(c, arcs(tb, 1, 1, [T(sg(dy))], PUR, xs.length - 2), 200);
          }
          tb.highlight(xs.length - 1, true, 'u6l5-hlx');
          await G.reveal(G.point(t0, 0, { color: RED, r: 9, label: T(pairTex(t0, 0)), pos: 'n', labelColor: RED }), c);
          await show(c, line(P, `horizontal intercept <b>${T(t0)}</b>: dead at ${t0}:00 pm`, 'u6l5-cx'));
        } });
      steps.push({ cap: `On the graph the line runs from ${T(pairTex(0, ys[0]))} on the ${T('B')}-axis down to ${T(pairTex(t0, 0))} on the ${T('t')}-axis.`,
        run: async (c) => { for (let i = 1; i < 4; i++) await pop(c, G.point(i, d.ys[i], { color: INK, r: 7 }), 200); await G.drawIn(G.segment([0, ys[0]], [t0, 0], { color: BLUE, width: 4 }), 800, c); } });
    }
    return steps;
  }
};

/* =============================== explainer 5: domain and range of a line =============================== */
const DR = {
  slant: { label: 'Slanted line', a: [-2, 0], b: [2, 2], name: 'slanted line', dom: ALLX, rng: ALLY },
  hor: { label: 'Horizontal ' + T('y=3'), a: [0, 3], b: [1, 3], name: T('y=3'), dom: ALLX, rng: '\\{3\\}', single: { y: 3 } },
  ver: { label: 'Vertical ' + T('x=-2'), a: [-2, 0], b: [-2, 1], name: T('x=-2'), dom: '\\{-2\\}', rng: ALLY, single: { x: -2 } },
  seg: { label: 'Segment', a: [0, 1], b: [6, 4], seg: true, name: 'segment', dom: '\\{x\\mid 0\\le x\\le 6,\\ x\\in\\mathbb{R}\\}', rng: '\\{y\\mid 1\\le y\\le 4,\\ y\\in\\mathbb{R}\\}',
    win: { xmin: -1.5, xmax: 7.5, ymin: -1.5, ymax: 7.5 } },
  a: { label: '(a)', a: [0, 0], b: [2, 3], name: 'Example 3 (a)', dom: ALLX, rng: ALLY },
  b: { label: '(b)', a: [0, -2], b: [1, -2], name: 'Example 3 (b)', dom: ALLX, rng: '\\{-2\\}', single: { y: -2 } },
  c: { label: '(c)', a: [3, 0], b: [3, 1], name: 'Example 3 (c)', dom: '\\{3\\}', rng: ALLY, single: { x: 3 } }
};
const domRange = {
  title: 'Squash the graph onto each axis',
  height: 470,
  choices: [...['slant', 'hor', 'ver', 'seg'].map((k) => ({ v: k, label: DR[k].label })), { sep: 'Example 3 check' }, ...['a', 'b', 'c'].map((k) => ({ v: k, label: DR[k].label }))],
  intro: `<b>Domain:</b> which ${T('x')}-values does the graph use? <b>Range:</b> which ${T('y')}-values? Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = DR[k], G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 442, height: 442, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5 }, d.win || {}));
    const P = panel(stage, 480, 14, ex.W - 494, 442, d.name);
    const Dbox = h('div', 'u6l5-drbox u6l5-drD', '<div class="u6l5-drk">Domain</div><div class="u6l5-drv"></div>'), Rbox = h('div', 'u6l5-drbox u6l5-drR', '<div class="u6l5-drk">Range</div><div class="u6l5-drv"></div>');
    P.append(Dbox, Rbox);
    const note = h('div', 'u6l5-line u6l5-drnote'); P.appendChild(note);
    const dir = [d.b[0] - d.a[0], d.b[1] - d.a[1]];
    const ends = d.seg ? [d.a, d.b] : (() => { const TT = G._clipT(d.a, dir, -Infinity, Infinity); return TT.map((t) => [d.a[0] + dir[0] * t, d.a[1] + dir[1] * t]); })();
    const L = d.seg ? G.segment(d.a, d.b, { color: BLUE, width: 4, closedA: true, closedB: true }) : G.line(d.a, d.b, { color: BLUE, width: 4 });
    L.style.opacity = 0;
    const ghost = (ax) => {
      const st = { t: 0 };
      const g = G.curve(() => ({ subs: [ends.map(([x, y]) => (ax === 'x' ? G.toPx(x, y * (1 - st.t)) : G.toPx(x * (1 - st.t), y)))] }), { color: ax === 'x' ? AMB : PUR, width: 5, opacity: 0.6 }, 'u6l5-ghost', G.layers.data);
      return { g, go: (c) => tween(c, 1100, (t) => { st.t = t; g._bkDraw(); }) };
    };
    const squash = async (c, ax) => {
      const gh = ghost(ax); await gh.go(c); G.remove(gh.g);
      const one = d.single && d.single[ax];
      if (one != null) {
        const p = ax === 'x' ? G.point(one, 0, { color: AMB, r: 10, label: T(`x=${one}`), pos: 'ne', labelColor: AMB, labelCls: 'bk-pill' }) : G.point(0, one, { color: PUR, r: 10, label: T(`y=${one}`), pos: 'ne', labelColor: PUR, labelCls: 'bk-pill' });
        await G.reveal(p, c);
      } else {
        const lo = d.seg ? (ax === 'x' ? d.a[0] : Math.min(d.a[1], d.b[1])) : -Infinity, hi = d.seg ? (ax === 'x' ? d.b[0] : Math.max(d.a[1], d.b[1])) : Infinity;
        await G.drawIn(ax === 'x' ? G.shadeX(lo, hi) : G.shadeY(lo, hi), 600, c);
      }
    };
    const startCap = d.seg ? `A <b>segment</b> stops at its endpoints ${T('(0,\\ 1)')} and ${T('(6,\\ 4)')}.`
      : d.single && d.single.y != null ? `A <b>horizontal</b> line: every point has ${T('y=' + d.single.y)}, and the arrows say it goes on forever.`
        : d.single ? `A <b>vertical</b> line: every point has ${T('x=' + d.single.x)}, and the arrows say it goes on forever.`
          : `A slanted line. The arrows mean it keeps going <b>forever</b> in both directions.`;
    const domCap = `<b>Domain:</b> flatten the graph straight down onto the ${T('x')}-axis. ` + (d.single && d.single.x != null ? `It all lands on <b>one point</b>: ${T(d.dom)}.` : d.seg ? `It covers ${T('0\\le x\\le 6')}: ${T(d.dom)}.` : `It covers the <b>whole</b> axis: ${T(d.dom)}.`);
    const rngCap = `<b>Range:</b> flatten it sideways onto the ${T('y')}-axis. ` + (d.single && d.single.y != null ? `It all lands on <b>one point</b>: ${T(d.rng)}.` : d.seg ? `It covers ${T('1\\le y\\le 4')}: ${T(d.rng)}.` : `It covers the <b>whole</b> axis: ${T(d.rng)}.`);
    return [
      { cap: startCap, run: async (c) => { L.style.opacity = 1; await G.drawIn(L, 800, c); } },
      { cap: domCap, run: async (c) => { await squash(c, 'x'); const v = Dbox.querySelector('.u6l5-drv'); v.innerHTML = T(d.dom); await pop(c, v); } },
      { cap: rngCap, run: async (c) => {
        await squash(c, 'y'); const v = Rbox.querySelector('.u6l5-drv'); v.innerHTML = T(d.rng); await pop(c, v);
        note.innerHTML = d.single ? 'A single value goes in braces by itself.' : d.seg ? 'Endpoints included (closed dots): use ≤.' : `Read ${T(ALLX)} as “all ${T('x')} such that ${T('x')} is a real number”.`;
        await show(c, note);
      } }
    ];
  }
};

/* =============================== explainer 6: a real situation =============================== */
const ST = {
  cooler: { label: 'Example 3 (d) check', kind: 'jug', x1: 6, y0: 18, g: { xmin: 0, xmax: 7.6, ymin: 0, ymax: 22.5, ystep: 3, ylabels: 3, origin: true, xtitle: '\\text{Day}', ytitle: '\\text{Water (L)}' },
    caps: [`Day 0: the jug is full, 18 L. On the graph that’s ${T('(0,\\ 18)')}: the <b>vertical intercept 18</b>, the starting amount.`,
      `The staff drink at a steady rate. Watch the jug and the graph together.`,
      `Day 6: the jug is empty. The graph meets the horizontal axis at ${T('(6,\\ 0)')}: <b>horizontal intercept 6</b>, empty after 6 days.`,
      `Slope: rise ${T('-18')} L over run ${T('6')} days, so ${T('m=\\dfrac{-18\\text{ L}}{6\\text{ days}}=-3')} <b>L per day</b>: the staff drink 3 L each day.`,
      `The graph only runs from day 0 to day 6, and from 18 L down to 0 L: a <b>restricted</b> domain and range. Write ${T('d')} for the day and ${T('V')} for the litres of water left.`],
    res: ['vertical intercept <b>18</b>: full at the start', 'horizontal intercept <b>6</b>: empty after 6 days', `slope ${T('-3')} L per day`,
      `D: ${T('\\{d\\mid 0\\le d\\le 6,\\ d\\in\\mathbb{R}\\}')}`, `R: ${T('\\{V\\mid 0\\le V\\le 18,\\ V\\in\\mathbb{R}\\}')}`],
    run: '\\text{run } 6\\text{ days}', rise: '\\text{rise } -18\\text{ L}', read: (x, y) => `Day ${x.toFixed(1)} · ${y.toFixed(1)} L` },
  phone: { label: 'Warm-up: Mia’s phone', kind: 'battery', x1: 6, y0: 90, g: { xmin: 0, xmax: 7.6, ymin: 0, ymax: 105, ystep: 10, ylabels: 10, origin: true, xtitle: 't\\text{ (h)}', ytitle: 'B\\ (\\%)' },
    caps: [`Noon, ${T('t=0')}: Mia’s phone shows 90%. The point ${T('(0,\\ 90)')}: the <b>vertical intercept 90</b>, the starting charge.`,
      `It drains steadily. Watch the phone and the graph together.`,
      `${T('t=6')}: the battery is dead. ${T('(6,\\ 0)')} is the <b>horizontal intercept 6</b>: dead 6 h after noon, at 6:00 pm.`,
      `Slope: ${T('m=\\dfrac{-90\\,\\%}{6\\text{ h}}=-15')} <b>percent per hour</b>: the phone loses 15% every hour.`,
      `The story only runs from ${T('t=0')} to ${T('t=6')}, and from 90% down to 0%: a <b>restricted</b> domain and range.`],
    res: ['vertical intercept <b>90</b>: 90% at noon', 'horizontal intercept <b>6</b>: dead at 6:00 pm', `slope ${T('-15')} % per hour`,
      `D: ${T('\\{t\\mid 0\\le t\\le 6,\\ t\\in\\mathbb{R}\\}')}`, `R: ${T('\\{B\\mid 0\\le B\\le 90,\\ B\\in\\mathbb{R}\\}')}`],
    run: '\\text{run } 6\\text{ h}', rise: '\\text{rise } -90\\,\\%', read: (x, y) => `${x.toFixed(1)} h · ${Math.round(y)}%` }
};
function gauge(stage, kind, x, y) {
  const W = 280, H = 214, el = add(stage, box(h('div', 'u6l5-gauge'), W, H), x, y);
  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, el);
  const id = 'u6l5clip' + Math.random().toString(36).slice(2, 8), cp = svgEl('clipPath', { id }, svgEl('defs', {}, svg));
  let body, top, bot, fill;
  if (kind === 'jug') {
    const d = 'M118 20 h44 v22 q0 10 14 16 q30 12 30 40 v86 q0 16 -16 16 h-108 q-16 0 -16 -16 v-86 q0 -28 30 -40 q14 -6 14 -16 z';
    svgEl('path', { d }, cp); top = 58; bot = 200;
    fill = svgEl('rect', { x: 0, width: W, fill: '#7cc0ec', 'clip-path': `url(#${id})` }, svg);
    body = svgEl('path', { d, fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, svg);
    for (let v = 3; v < 18; v += 3) { const py = bot - (top + 30 > 0 ? (v / 18) * (bot - top - 30) : 0); svgEl('line', { x1: 74, x2: 86, y1: py, y2: py, stroke: INK, 'stroke-width': 2 }, svg); }
  } else {
    svgEl('rect', { x: 92, y: 30, width: 96, height: 172, rx: 14 }, cp); top = 30; bot = 202;
    svgEl('rect', { x: 120, y: 14, width: 40, height: 16, rx: 4, fill: INK }, svg);
    fill = svgEl('rect', { x: 0, width: W, fill: '#3ca050', 'clip-path': `url(#${id})` }, svg);
    body = svgEl('rect', { x: 92, y: 30, width: 96, height: 172, rx: 14, fill: 'none', stroke: INK, 'stroke-width': 4 }, svg);
  }
  void body;
  const lab = h('div', 'u6l5-glab'), cap = h('div', 'u6l5-gcap'); el.append(lab, cap);
  const span = kind === 'jug' ? bot - top - 30 : bot - top;
  return {
    el,
    set(frac01, text, sub) {
      const hh = Math.max(0, frac01) * span; fill.setAttribute('y', bot - hh); fill.setAttribute('height', hh);
      if (kind !== 'jug') fill.setAttribute('fill', frac01 > 0.5 ? '#3ca050' : frac01 > 0.2 ? '#c8a014' : '#c93a33');
      lab.textContent = text; cap.textContent = sub;
    }
  };
}
const story = {
  title: 'Intercepts, rate, domain and range in a story',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'cooler', label: ST.cooler.label }, { v: 'phone', label: ST.phone.label }],
  intro: (k) => (k === 'cooler' ? 'An 18 L water-cooler jug, emptied at a steady rate. Press <b>Next</b>.' : 'Mia’s phone from the warm-up, 90% at noon. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = ST[k], f = (x) => d.y0 * (1 - x / d.x1);
    const G = new Graph(stage, Object.assign({ x: 316, y: 10, width: ex.W - 330, height: 450 }, d.g));
    const gg = gauge(stage, d.kind, 14, 4);
    const P = panel(stage, 14, 228, 288, 230, '', 'u6l5-spanel');
    const sayAt = (x) => gg.set(f(x) / d.y0, d.kind === 'jug' ? `${+f(x).toFixed(1)} L` : `${Math.round(f(x))}%`, d.read(x, f(x)).split(' · ')[0]);
    sayAt(0);
    const st = { x: 0 };
    const trail = G.curve(() => ({ subs: [[G.toPx(0, d.y0), G.toPx(st.x, f(st.x))]] }), { color: BLUE, width: 4 }, 'u6l5-trail', G.layers.data);
    trail.style.display = 'none';
    const mover = G.point(0, d.y0, { color: GRN, r: 8 }); mover.style.display = 'none';
    return [
      { cap: d.caps[0], run: async (c) => { await G.reveal(G.point(0, d.y0, { color: BLUE, r: 9, label: T(pairTex(0, d.y0)), pos: 'e', labelColor: BLUE }), c); await show(c, line(P, d.res[0], 'u6l5-cy')); } },
      { cap: d.caps[1], run: async (c) => {
        trail.style.display = ''; mover.style.display = '';
        await tween(c, 3200, (t) => { st.x = d.x1 * t; trail._bkDraw(); G.moveTo(mover, st.x, f(st.x)); sayAt(st.x); }, (t) => t);
        mover.style.display = 'none';
      } },
      { cap: d.caps[2], run: async (c) => { await G.reveal(G.point(d.x1, 0, { color: RED, r: 9, label: T(pairTex(d.x1, 0)), pos: 'ne', labelColor: RED }), c); await show(c, line(P, d.res[1], 'u6l5-cx')); } },
      { cap: d.caps[3], run: async (c) => { await slopeTri(G, [0, d.y0], [d.x1, 0], { runTex: tc(AMB, d.run), riseTex: tc(PUR, d.rise) }).play(c); await show(c, line(P, d.res[2], 'u6l5-cm')); } },
      { cap: d.caps[4], run: async (c) => {
        await G.drawIn(G.shadeX(0, d.x1, { offset: 0 }), 600, c); await G.drawIn(G.shadeY(0, d.y0), 600, c);
        await show(c, line(P, d.res[3], 'u6l5-cd')); await show(c, line(P, d.res[4], 'u6l5-cr'));
      } }
    ];
  }
};

/* =============================== explainer 7 (star): the line lab =============================== */
/** characteristics of the line through (st.x, st.y) at angle st.th */
function chars(st) {
  const r = st.th * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r), E = 1e-9;
  const horiz = Math.abs(sn) < E, vert = Math.abs(cs) < E;
  const xi = horiz ? (Math.abs(st.y) < E ? 'all' : 'none') : st.x - st.y * cs / sn;
  const yi = vert ? (Math.abs(st.x) < E ? 'all' : 'none') : st.y - st.x * sn / cs;
  const m = vert ? null : horiz ? 0 : sn / cs;
  let count, why;
  if (xi === 'all') { count = '∞'; why = 'it is the x-axis'; } else if (yi === 'all') { count = '∞'; why = 'it is the y-axis'; }
  else if (xi === 'none') { count = '1'; why = 'misses the x-axis'; } else if (yi === 'none') { count = '1'; why = 'misses the y-axis'; }
  else if (Math.abs(xi) < 1e-6 && Math.abs(yi) < 1e-6) { count = '1'; why = 'both at (0, 0)'; } else { count = '2'; why = 'one on each axis'; }
  const rd = (v) => { const q = Math.round(v * 10) / 10; return Object.is(q, -0) ? 0 : q; };
  return { xi, yi, m, count, why, horiz, vert, dom: vert ? `\\{${texNum(rd(st.x))}\\}` : ALLX, rng: horiz ? `\\{${texNum(rd(st.y))}\\}` : ALLY, rd };
}
const LL = {
  spin: { label: 'Rotate about (0, 2)', start: { x: 0, y: 2, th: 45 }, pivot: true,
    first: `The line through ${T('(0,\\ 2)')}, rising. It crosses both axes: <b>two intercepts</b>, positive slope, domain and range all real numbers.`,
    moves: [{ to: { th: 0 }, cap: `Rotate it clockwise. The slope shrinks and the ${T('x')}-intercept races off to the left… until the line is <b>horizontal</b>: slope 0, <b>no ${T('x')}-intercept</b>, range ${T('\\{2\\}')}.` },
      { to: { th: -45 }, cap: `Keep turning: now the slope is <b>negative</b>, and the ${T('x')}-intercept comes back in from the right. Two intercepts again.` },
      { to: { th: -90 }, cap: `Turn until it is <b>vertical</b>. Through ${T('(0,\\ 2)')} that is the ${T('y')}-axis itself: every point is a ${T('y')}-intercept. <b>Infinitely many</b>; domain ${T('\\{0\\}')}.` }] },
  slide: { label: 'Slide a slanted line', start: { x: 0, y: 4, th: 180 + deg(-2) },
    first: `A falling line with ${T('x')}-intercept 2 and ${T('y')}-intercept 4: <b>two intercepts</b>.`,
    moves: [{ to: { y: 0 }, cap: `Slide it down. Both intercepts shrink toward the origin… and <b>meet</b> there. Both are 0, at one point ${T('(0,\\ 0)')}: <b>one intercept</b>.` },
      { to: { y: -3 }, cap: `Keep sliding: the intercepts split apart again, now both negative. Two intercepts.` }] },
  flat: { label: 'Slide a horizontal line', start: { x: 0, y: 3, th: 0 },
    first: `The horizontal line ${T('y=3')}: slope 0, a ${T('y')}-intercept only, range ${T('\\{3\\}')}.`,
    moves: [{ to: { y: 0 }, cap: `Slide it down onto the ${T('x')}-axis. Now <b>every</b> point is an ${T('x')}-intercept: <b>infinitely many</b>. Range ${T('\\{0\\}')}.` },
      { to: { y: -2 }, cap: `Below the axis it is back to one intercept, ${T('y')}-intercept ${T('-2')}, range ${T('\\{-2\\}')}.` }] },
  vert: { label: 'Slide a vertical line', start: { x: 4, y: 0, th: 90 },
    first: `The vertical line ${T('x=4')}: undefined slope, an ${T('x')}-intercept only, domain ${T('\\{4\\}')}.`,
    moves: [{ to: { x: 0 }, cap: `Slide it left onto the ${T('y')}-axis: <b>infinitely many</b> intercepts. Domain ${T('\\{0\\}')}.` },
      { to: { x: -3 }, cap: `Past the axis: one intercept again, ${T('x')}-intercept ${T('-3')}, domain ${T('\\{-3\\}')}.` }] },
  origin: { label: 'Spin about the origin', start: { x: 0, y: 0, th: 60 }, pivot: true,
    first: `A line through the origin: both intercepts are 0, at the single point ${T('(0,\\ 0)')}. <b>One intercept.</b>`,
    moves: [{ to: { th: 0 }, cap: `Rotate it: still one intercept at the origin… until it lands <b>on</b> the ${T('x')}-axis: infinitely many.` },
      { to: { th: -60 }, cap: `Keep going: negative slope, still through the origin. One intercept.` },
      { to: { th: -90 }, cap: `Vertical through the origin is the ${T('y')}-axis: infinitely many again.` }] },
  free: { label: 'Free play', start: { x: 1, y: -1, th: 30 }, free: true }
};
const lineLab = {
  title: 'The line lab: rotate it, slide it, watch the counters',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(LL).map((k) => ({ v: k, label: LL[k].label })),
  intro: (k) => (LL[k].free ? 'Your turn: rotate and slide the line with the buttons. Press <b>Next</b> to start.' : 'Watch the counters on the right while the line moves. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = LL[k], st = Object.assign({}, d.start);
    const G = new Graph(stage, { x: 14, y: 14, width: 442, height: 442, xmin: -6.5, xmax: 6.5, ymin: -6.5, ymax: 6.5, xlabels: 2, ylabels: 2 });
    const axX = G.curve(() => ({ subs: [[G.toPx(G.win.xmin, 0), G.toPx(G.win.xmax, 0)]] }), { color: RED, width: 11, opacity: 0.35 }, 'u6l5-axhl', G.layers.data);
    const axY = G.curve(() => ({ subs: [[G.toPx(0, G.win.ymin), G.toPx(0, G.win.ymax)]] }), { color: BLUE, width: 11, opacity: 0.35 }, 'u6l5-axhl', G.layers.data);
    const L = pivotLine(G, st);
    const XI = G.point(0, 0, { color: RED, r: 9 }), YI = G.point(0, 0, { color: BLUE, r: 9 });
    const PV = d.pivot ? G.point(st.x, st.y, { color: GRAY, r: 6, open: true }) : null;
    const W2 = ex.W - 488, P = add(stage, box(h('div', 'u6l5-lab'), W2, 442), 474, 14);
    const tile = (cls, key) => { const t = h('div', 'u6l5-tile ' + cls, `<div class="u6l5-tk">${key}</div><div class="u6l5-tv"></div><div class="u6l5-ts"></div>`); P.appendChild(t); return { t, v: t.querySelector('.u6l5-tv'), s: t.querySelector('.u6l5-ts') }; };
    const tX = tile('u6l5-tX', `${T('x')}-intercept`), tY = tile('u6l5-tY', `${T('y')}-intercept`), tM = tile('u6l5-tM', 'slope'), tN = tile('u6l5-tN', 'intercepts'),
      tD = tile('u6l5-tD', 'domain'), tR = tile('u6l5-tR', 'range');
    const foot = h('div', 'u6l5-labfoot'); P.appendChild(foot);
    const put = (el, html) => { if (el._h !== html) { el._h = html; el.innerHTML = html; } };
    const off = (v) => (Math.abs(v) > 6.5 ? ' <span class="u6l5-off">(off the grid)</span>' : '');
    const upd = () => {
      const q = chars(st);
      L._bkDraw(); if (PV) G.moveTo(PV, st.x, st.y);
      const num = (v) => pm(q.rd(v));
      // x-intercept
      if (q.xi === 'all') { put(tX.v, 'every <i>x</i>'); put(tX.s, 'the whole x-axis'); } else if (q.xi === 'none') { put(tX.v, 'none'); put(tX.s, 'never meets the x-axis'); }
      else { put(tX.v, num(q.xi)); put(tX.s, `point (${num(q.xi)}, 0)` + off(q.xi)); }
      if (q.yi === 'all') { put(tY.v, 'every <i>y</i>'); put(tY.s, 'the whole y-axis'); } else if (q.yi === 'none') { put(tY.v, 'none'); put(tY.s, 'never meets the y-axis'); }
      else { put(tY.v, num(q.yi)); put(tY.s, `point (0, ${num(q.yi)})` + off(q.yi)); }
      tX.t.classList.toggle('u6l5-none', q.xi === 'none'); tY.t.classList.toggle('u6l5-none', q.yi === 'none');
      const sk = q.m == null ? 'undef' : Math.abs(q.m) < 1e-9 ? 'zero' : q.m > 0 ? 'pos' : 'neg';
      put(tM.v, { undef: 'undefined', zero: '0', pos: 'positive', neg: 'negative' }[sk]);
      put(tM.s, { undef: 'vertical line', zero: 'horizontal line', pos: `rising, m ≈ ${pm(Math.round(q.m * 100) / 100)}`, neg: `falling, m ≈ ${pm(Math.round(q.m * 100) / 100)}` }[sk]);
      ['undef', 'zero', 'pos', 'neg'].forEach((s) => tM.t.classList.toggle('u6l5-' + s, s === sk));
      put(tN.v, q.count === '∞' ? T('\\infty') : q.count); put(tN.s, q.why); tN.t.classList.toggle('u6l5-inf', q.count === '∞');
      put(tD.v, T(q.dom)); put(tR.v, T(q.rng));
      put(tD.s, q.vert ? 'one x-value' : 'every x'); put(tR.s, q.horiz ? 'one y-value' : 'every y');
      // marks on the graph
      axX.style.display = q.xi === 'all' ? '' : 'none'; axY.style.display = q.yi === 'all' ? '' : 'none';
      if (typeof q.xi === 'number') { G.moveTo(XI, q.xi, 0); } else XI.style.display = 'none';
      if (typeof q.yi === 'number') { G.moveTo(YI, 0, q.yi); } else YI.style.display = 'none';
    };
    upd();
    const move = (c, to, ms = 2400) => { const s0 = Object.assign({}, st); return tween(c, ms, (t) => { for (const key in to) st[key] = s0[key] + (to[key] - s0[key]) * t; upd(); }); };
    if (d.free) {
      const ctl = h('div', 'u6l5-ctl');
      const B = (html, title, to) => { const b = h('button', 'pill u6l5-cb', html); b.type = 'button'; b.title = title; b.onclick = () => { const s = to(); move(liveCtx(), s, 420); }; ctl.appendChild(b); return b; };
      const rot = (a) => () => { let th = st.th + a; return { th }; };
      B('↺ 15°', 'Rotate anticlockwise', rot(15)); B('↻ 15°', 'Rotate clockwise', rot(-15));
      B('←', 'Slide left', () => ({ x: st.x - 1 })); B('→', 'Slide right', () => ({ x: st.x + 1 }));
      B('↑', 'Slide up', () => ({ y: st.y + 1 })); B('↓', 'Slide down', () => ({ y: st.y - 1 }));
      foot.appendChild(ctl);
      return [{ cap: `Your turn. Can you make a line with <b>one</b> intercept? With <b>infinitely many</b>? With <b>none</b>?`, run: async (c) => { await G.drawIn(L, 600, c); await pulse(c, ctl, 1.04); } }];
    }
    foot.innerHTML = `<span>${d.pivot ? `turning about ${T(pairTex(st.x, st.y))}` : 'sliding'}</span>`;
    return [
      { cap: d.first, run: async (c) => { await G.drawIn(L, 700, c); } },
      ...d.moves.map((mv) => ({ cap: mv.cap, run: (c) => move(c, mv.to) }))
    ];
  }
};

/* =============================== explainer 8: counting intercepts with a flowchart =============================== */
const CF = {
  two: { label: 'Two intercepts', draw: (G) => G.line([-1.5, 0], [0, 2], { color: BLUE, width: 4 }), path: ['start', 'q1', 'q2', 'q3', 'two'], xp: [[-1.5, 0]], yp: [[0, 2]],
    caps: ['First question: is the line one of the axes?', '<b>No.</b> Is it horizontal or vertical?', '<b>No</b>, it is slanted. Does it pass through the origin?', `<b>No</b>: it crosses each axis at a different point. <b>Two intercepts</b>, ${T('x')}-intercept ${T('-1.5')} and ${T('y')}-intercept ${T('2')}.`] },
  hor: { label: 'Horizontal', draw: (G) => G.line({ m: 0, b: 1.5 }, { color: BLUE, width: 4 }), path: ['start', 'q1', 'q2', 'one1'], xp: [], yp: [[0, 1.5]],
    caps: ['First question: is the line one of the axes?', '<b>No.</b> Is it horizontal or vertical?', `<b>Yes</b>, horizontal: it runs beside the ${T('x')}-axis and never meets it. <b>One intercept</b>, the ${T('y')}-intercept ${T('1.5')}.`] },
  ver: { label: 'Vertical', draw: (G) => G.line({ x: -1.5 }, { color: BLUE, width: 4 }), path: ['start', 'q1', 'q2', 'one1'], xp: [[-1.5, 0]], yp: [],
    caps: ['First question: is the line one of the axes?', '<b>No.</b> Is it horizontal or vertical?', `<b>Yes</b>, vertical: it never meets the ${T('y')}-axis. <b>One intercept</b>, the ${T('x')}-intercept ${T('-1.5')}.`] },
  orig: { label: 'Through the origin', draw: (G) => G.line([0, 0], [1, 1.5], { color: BLUE, width: 4 }), path: ['start', 'q1', 'q2', 'q3', 'one2'], xp: [[0, 0]], yp: [],
    caps: ['First question: is the line one of the axes?', '<b>No.</b> Is it horizontal or vertical?', '<b>No</b>, it is slanted. Does it pass through the origin?', `<b>Yes</b>: both intercepts are 0, at the <b>same</b> point ${T('(0,\\ 0)')}. <b>One intercept.</b>`] },
  axis: { label: 'The x-axis', draw: (G) => G.line({ m: 0, b: 0 }, { color: RED, width: 9, opacity: 0.55 }), path: ['start', 'q1', 'inf'], xp: 'all', yp: [],
    caps: ['First question: is the line one of the axes?', `<b>Yes</b>: the line ${T('y=0')} <b>is</b> the ${T('x')}-axis. Every point on it is an ${T('x')}-intercept: <b>infinitely many</b>.`] }
};
const countFlow = {
  title: 'How many intercepts? Three questions',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(CF).map((k) => ({ v: k, label: CF[k].label })),
  intro: 'Answer the questions from the top. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CF[k], G = new Graph(stage, { x: 14, y: 70, width: 320, height: 320, xmin: -3.5, xmax: 3.5, ymin: -3.5, ymax: 3.5, xlabels: 1, ylabels: 1, fontSize: 15 });
    const FW = ex.W - 362, cx = 158, rx = FW - 128;
    const F = new Flowchart(stage, { x: 348, y: 6, width: FW, height: 458, nodes: {
      start: { x: cx, y: 32, w: 270, h: 48, html: '<b>How many intercepts?</b>', cls: 'bk-round' },
      q1: { x: cx, y: 122, w: 280, h: 56, html: '<b>Is the line an axis?</b>' },
      inf: { x: rx, y: 122, w: 236, h: 62, html: '<b>Infinitely many</b>every point is one', color: RED },
      q2: { x: cx, y: 212, w: 280, h: 56, html: '<b>Horizontal or vertical?</b>' },
      one1: { x: rx, y: 212, w: 236, h: 62, html: '<b>One intercept</b>it misses one axis', color: AMB },
      q3: { x: cx, y: 302, w: 280, h: 56, html: '<b>Through the origin?</b>' },
      one2: { x: rx, y: 302, w: 236, h: 62, html: '<b>One intercept</b>both are 0, at (0, 0)', color: AMB },
      two: { x: cx, y: 410, w: 280, h: 62, html: '<b>Two intercepts</b>one on each axis', color: GRN }
    }, edges: [{ from: 'start', to: 'q1' }, { from: 'q1', to: 'inf', label: 'yes' }, { from: 'q1', to: 'q2', label: 'no' }, { from: 'q2', to: 'one1', label: 'yes' },
      { from: 'q2', to: 'q3', label: 'no' }, { from: 'q3', to: 'one2', label: 'yes' }, { from: 'q3', to: 'two', label: 'no' }] });
    const Ln = d.draw(G); Ln.style.opacity = 0;
    const steps = [];
    for (let i = 0; i < d.path.length - 1; i++) {
      const a = d.path[i], b = d.path[i + 1], last = i === d.path.length - 2;
      steps.push({ cap: d.caps[i], run: async (c) => {
        if (i === 0) { Ln.style.opacity = 1; await G.drawIn(Ln, 700, c); await F.visit(c, 'start'); }
        await F.go(c, a, b); await F.visit(c, b);
        if (last) {
          if (d.xp === 'all') { for (let x = -3; x <= 3; x++) await pop(c, G.point(x, 0, { color: RED, r: 7 }), 160); }
          else for (const p of d.xp) await G.reveal(G.point(p[0], p[1], { color: p[0] === 0 && p[1] === 0 ? PUR : RED, r: 9 }), c);
          for (const p of d.yp) await G.reveal(G.point(p[0], p[1], { color: BLUE, r: 9 }), c);
        }
      } });
    }
    return steps;
  }
};

/* =============================== explainer 9: Example 4, try a line then fix it =============================== */
const SK = {
  a: { label: '(a)' }, b: { label: '(b)' }, c: { label: '(c)' }, d: { label: '(d)' }
};
const sketch = {
  title: 'Example 4 check',
  height: 470,
  choices: [{ sep: 'Example 4 check' }, ...Object.keys(SK).map((k) => ({ v: k, label: SK[k].label }))],
  value: 'a',
  intro: (k) => ({ a: `${T('x')}-intercept 3 and ${T('y')}-intercept ${T('-2')}. State its slope.`, b: `Exactly one intercept, at the point ${T('(0,\\ 4)')}.`,
    c: 'Exactly one intercept, and a negative slope.', d: 'Infinitely many intercepts.' }[k]) + ' Press <b>Next</b>.',
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 14, y: 14, width: 442, height: 442, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5 });
    const P = panel(stage, 480, 14, ex.W - 494, 442, `Example 4 (${k})`);
    const chk = (html) => { const r = h('div', 'u6l5-chk', `<span class="u6l5-box">☐</span><span>${html}</span>`); P.appendChild(r); return r; };
    const tick = async (c, r, ok) => { const b = r.querySelector('.u6l5-box'); b.textContent = ok ? '☑' : '☒'; b.className = 'u6l5-box ' + (ok ? 'u6l5-ok' : 'u6l5-no'); await pop(c, b, 300); };
    if (k === 'a') {
      const r1 = chk(`${T('x')}-intercept 3`), r2 = chk(`${T('y')}-intercept ${T('-2')}`);
      const L = G.line([3, 0], [0, -2], { color: BLUE, width: 4 }); L.style.opacity = 0;
      return [
        { cap: `Plot the two intercepts: ${T('(3,\\ 0)')} on the ${T('x')}-axis and ${T('(0,\\ -2)')} on the ${T('y')}-axis.`,
          run: async (c) => { await G.reveal(G.point(3, 0, { color: RED, r: 9, label: T('(3,\\ 0)'), pos: 'nw', labelColor: RED }), c); await tick(c, r1, true); await G.reveal(G.point(0, -2, { color: BLUE, r: 9, label: T('(0,\\ -2)'), pos: 'w', labelColor: BLUE }), c); await tick(c, r2, true); } },
        { cap: 'Draw the line through them, with arrows at both ends.', run: async (c) => { L.style.opacity = 1; await G.drawIn(L, 800, c); } },
        { cap: `From ${T('(0,\\ -2)')} to ${T('(3,\\ 0)')}: run ${T(tc(AMB, 3))}, rise ${T(tc(PUR, 2))}, slope ${T('m=\\tfrac23')}.`,
          run: async (c) => { await slopeTri(G, [0, -2], [3, 0]).play(c); await show(c, line(P, `slope ${T('m=\\dfrac{2}{3}')}`, 'u6l5-cm u6l5-big')); } }
      ];
    }
    if (k === 'b') {
      const r1 = chk(`goes through ${T('(0,\\ 4)')}`), r2 = chk('exactly one intercept');
      const st = { x: 0, y: 4, th: 45 }, L = pivotLine(G, st, { color: GRAY, width: 4, dash: true }); L.style.opacity = 0;
      let X;
      return [
        { cap: `Plot ${T('(0,\\ 4)')}. Try a slanted line through it.`, run: async (c) => { await G.reveal(G.point(0, 4, { color: BLUE, r: 9, label: T('(0,\\ 4)'), pos: 'se', labelColor: BLUE }), c); await tick(c, r1, true); L.style.opacity = 1; await G.drawIn(L, 700, c); } },
        { cap: `But a slanted line also crosses the ${T('x')}-axis, here at ${T('(-4,\\ 0)')}: <b>two</b> intercepts. ✗`,
          run: async (c) => { X = G.point(-4, 0, { color: RED, r: 9, label: '✗', pos: 'n', labelColor: RED }); await G.reveal(X, c); await tick(c, r2, false); } },
        { cap: `Rotate it until it can’t reach the ${T('x')}-axis: <b>horizontal</b>, ${T('y=4')} (slope 0). Only ${T('(0,\\ 4)')}. ✓`,
          run: async (c) => { G.remove(X); await tween(c, 1400, (t) => { st.th = 45 * (1 - t); L._bkDraw(); }); G.remove(L); await G.drawIn(G.line({ m: 0, b: 4 }, { color: BLUE, width: 4 }), 500, c); await tick(c, r2, true); } }
      ];
    }
    if (k === 'c') {
      const r1 = chk('negative slope'), r2 = chk('exactly one intercept');
      const st = { x: 0, y: 3, th: 180 + deg(-2) }, L = pivotLine(G, st, { color: BLUE, width: 4 }); L.style.opacity = 0;
      let A, B;
      return [
        { cap: `Try a falling line, say through ${T('(0,\\ 3)')} with slope ${T('-2')}. Negative slope ✓.`, run: async (c) => { L.style.opacity = 1; await G.drawIn(L, 700, c); await tick(c, r1, true); } },
        { cap: `But it crosses <b>both</b> axes, at ${T('(1.5,\\ 0)')} and ${T('(0,\\ 3)')}: two intercepts. ✗`,
          run: async (c) => { A = G.point(1.5, 0, { color: RED, r: 9 }); B = G.point(0, 3, { color: BLUE, r: 9 }); await G.reveal(A, c); await G.reveal(B, c); await tick(c, r2, false); } },
        { cap: `Slide it down until the two intercepts <b>merge at the origin</b>: the line through ${T('(0,\\ 0)')} and ${T('(1,\\ -2)')}. One intercept, negative slope. ✓`,
          run: async (c) => {
            await tween(c, 1400, (t) => { st.y = 3 * (1 - t); L._bkDraw(); G.moveTo(A, st.y / 2, 0); G.moveTo(B, 0, st.y); });
            G.remove(A, B); await G.reveal(G.point(0, 0, { color: PUR, r: 9, label: T('(0,\\ 0)'), pos: 'ne', labelColor: PUR }), c);
            await G.reveal(G.point(1, -2, { color: INK, r: 7, label: T('(1,\\ -2)'), pos: 'e' }), c); await tick(c, r2, true);
          } }
      ];
    }
    const r1 = chk('infinitely many intercepts');
    return [
      { cap: `Infinitely many intercepts means <b>every</b> point of the line is on an axis. So the line must <b>be</b> an axis.`, run: async (c) => { await show(c, line(P, 'The only lines made of intercepts are the two axes.', 'u6l5-sm')); } },
      { cap: `The ${T('y')}-axis (${T('x=0')}): every point on it is a ${T('y')}-intercept. ✓`,
        run: async (c) => { await G.drawIn(G.line({ x: 0 }, { color: RED, width: 8, opacity: 0.75 }), 800, c); for (let y = -4; y <= 4; y++) await pop(c, G.point(0, y, { color: BLUE, r: 6 }), 120); await tick(c, r1, true); } },
      { cap: `The ${T('x')}-axis (${T('y=0')}) works just as well: every point on it is an ${T('x')}-intercept.`,
        run: async (c) => { await G.drawIn(G.line({ m: 0, b: 0 }, { color: RED, width: 8, opacity: 0.4, dash: true }), 800, c); await show(c, line(P, `either axis: ${T('x=0')} or ${T('y=0')}`, 'u6l5-cx')); } }
    ];
  }
};

/* =============================== explainer 10: Example 5, match one characteristic at a time =============================== */
const MG = {
  A: { m: 2, b: -2, xi: 1, yi: -2, sign: 'pos' }, B: { m: -1, b: 3, xi: 3, yi: 3, sign: 'neg' },
  C: { m: 0, b: -3, xi: null, yi: -3, sign: 'zero' }, D: { m: -0.5, b: 0, xi: 0, yi: 0, sign: 'neg' }
};
const MD = {
  1: { text: `Slope 0; ${T('y')}-intercept ${T('-3')}; no ${T('x')}-intercept.`, sign: 'zero', ans: 'C',
    slopeCap: `Slope first: slope 0 means a <b>flat</b> (horizontal) line. A, B and D are slanted: out.`,
    intCap: `Intercepts: C crosses the ${T('y')}-axis at ${T('-3')} and never meets the ${T('x')}-axis. ✓` },
  2: { text: 'Negative slope; both intercepts are 0.', sign: 'neg', ans: 'D',
    slopeCap: 'Slope first: negative means <b>falling</b>. A rises and C is flat: out. B and D are left.',
    intCap: `Intercepts: D passes through ${T('(0,\\ 0)')}, so both are 0 ✓. B crosses at ${T('(3,\\ 0)')} and ${T('(0,\\ 3)')} ✗.` },
  3: { text: `Positive slope; ${T('x')}-intercept 1; ${T('y')}-intercept ${T('-2')}.`, sign: 'pos', ans: 'A',
    slopeCap: 'Slope first: positive means <b>rising</b>. B and D fall, C is flat: out. Only A is left.',
    intCap: `Intercepts: A crosses at ${T('(1,\\ 0)')} and ${T('(0,\\ -2)')}. ✓` },
  4: { text: `Negative slope; ${T('x')}-intercept 3; ${T('y')}-intercept 3.`, sign: 'neg', ans: 'B',
    slopeCap: 'Slope first: negative means <b>falling</b>. A rises and C is flat: out. B and D are left.',
    intCap: `Intercepts: B crosses at ${T('(3,\\ 0)')} and ${T('(0,\\ 3)')} ✓. D’s intercepts are both 0 ✗.` }
};
const match = {
  title: 'Match: slope sign first, then intercepts',
  height: 470,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ sep: 'Example 5 check' }, ...Object.keys(MD).map((k) => ({ v: +k, label: 'Description ' + k }))],
  value: 1,
  intro: (k) => `Description ${k}: ${MD[k].text} Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = MD[k], gap = 14, gw = Math.min(222, (ex.W - 28 - 3 * gap) / 4);
    const x0 = (ex.W - (4 * gw + 3 * gap)) / 2;
    const cards = {};
    Object.keys(MG).forEach((name, i) => {
      const g = MG[name], wrap = add(stage, box(h('div', 'u6l5-mcard'), gw, 252), x0 + i * (gw + gap), 8);
      wrap.appendChild(h('div', 'u6l5-mname', 'Graph ' + name));
      const G = new Graph(wrap, { width: gw, height: gw, xmin: -4.5, xmax: 4.5, ymin: -4.5, ymax: 4.5, xlabels: 2, ylabels: 2, fontSize: 14 });
      G.line({ m: g.m, b: g.b }, { color: BLUE, width: 3.5 });
      cards[name] = { wrap, G, g };
    });
    const P = panel(stage, x0, 272, 4 * gw + 3 * gap, 186, '', 'u6l5-mpanel');
    const desc = line(P, `<b>Description ${k}.</b> ${d.text}`, 'u6l5-mdesc');
    void desc;
    const sw = { pos: 'rising', neg: 'falling', zero: 'flat', undef: 'vertical' };
    const out = (c, name, why) => { const cd = cards[name]; cd.wrap.classList.add('u6l5-out'); const s = stamp(cd.wrap, '✗', { ok: false, x: gw / 2, y: 140, size: 'lg' }); s.title = why; return stampIn(c, s); };
    const survivors = Object.keys(MG).filter((n) => MG[n].sign === d.sign);
    return [
      { cap: `Check one characteristic at a time: the <b>sign of the slope</b> first, then the <b>intercepts</b>.`, run: async (c) => { await pulse(c, P, 1.02); } },
      { cap: d.slopeCap, run: async (c) => {
        await show(c, line(P, `slope: ${sw[d.sign]} → ${survivors.map((n) => 'Graph ' + n).join(' or ')}`, 'u6l5-mrow'));
        for (const n of Object.keys(MG)) if (!survivors.includes(n)) await out(c, n, 'wrong slope sign');
        survivors.forEach((n) => cards[n].wrap.classList.add('u6l5-alive'));
      } },
      { cap: d.intCap, run: async (c) => {
        for (const n of survivors) {
          const { G, g } = cards[n];
          if (g.xi != null && !(g.xi === 0 && g.yi === 0)) await G.reveal(G.point(g.xi, 0, { color: RED, r: 7 }), c);
          await G.reveal(G.point(0, g.yi, { color: g.xi === 0 && g.yi === 0 ? PUR : BLUE, r: 7 }), c);
          if (n !== d.ans) { cards[n].wrap.classList.remove('u6l5-alive'); await out(c, n, 'wrong intercepts'); }
        }
        await show(c, line(P, 'intercepts: ' + (d.ans === 'C' ? `${T('y')}-intercept ${T('-3')}, no ${T('x')}-intercept` : d.ans === 'D' ? `both 0, at ${T('(0,\\ 0)')}` : d.ans === 'A' ? `${T('(1,\\ 0)')} and ${T('(0,\\ -2)')}` : `${T('(3,\\ 0)')} and ${T('(0,\\ 3)')}`) + ` → Graph ${d.ans}`, 'u6l5-mrow'));
      } },
      { cap: `Description ${k} matches <b>Graph ${d.ans}</b>.`, run: async (c) => {
        const cd = cards[d.ans]; cd.wrap.classList.add('u6l5-win');
        const s = stamp(P, `${k} → Graph ${d.ans}`, { ok: true }); s.style.alignSelf = 'flex-start'; await stampIn(c, s);
      } }
    ];
  }
};

/* =============================== mount =============================== */
mountWarm();
export const explainers = mountExplainers({ linTest, uneven, graphInts, tableInts, domRange, story, lineLab, countFlow, sketch, match });
export const _test = { LT, UN, GI, TI, DR, ST, LL, CF, MD, chars };
