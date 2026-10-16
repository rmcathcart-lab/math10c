/* Math 10C · Unit 5 · Lesson 6 — Exploring Real-World Relations With a Graphing Calculator:
 * the explainers, the warm-up road animation and the example grids/answer graphs.
 * Graphing-calculator steps are drawn on TI-84-style screens (Graph theme 'calc') with TI keycaps; teaching graphs
 * (with numbers) use the normal Graph. Colours: the model is blue, the piece that makes sense in context teal,
 * nonsense regions red, domain shadow amber, range shadow purple. */
import { Graph, ValueTable, Flowchart, mountExplainers, h, tex, add, box, pop, fadeIn, sleep, tween, pairTex, texNum, svgEl, liveCtx, calcNum } from '../blocks.js';

const T = (s) => tex(s);
const KCLS = { 'Y=': 't', WINDOW: 't', ZOOM: 't', TRACE: 't', GRAPH: 't', '2ND': 's' };
const key = (k) => `<kbd class="u5l6-k${KCLS[k] ? ' ' + KCLS[k] : /^[0-9.]+$/.test(k) ? ' n' : ''}">${k}</kbd>`;
const keys = (s) => s.split(' ').map(key).join(' ');
const mono = (s) => `<code class="u5l6-m">${s}</code>`;
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u5l6-panel', title ? `<div class="u5l6-ph">${title}</div>` : ''), w, hh), x, y);
const pline = (p, html, cls = '') => { const d = h('div', 'u5l6-pl ' + cls, html); p.appendChild(d); return d; };
const show = (c, el, ms = 320) => fadeIn(c, el, ms);
/** TeX for a number: 4-digit numbers unspaced like the booklet (3000), 5+ digits with a thin space (10\,000) */
const tn = (v) => { const s = texNum(v); return /^-?\d{5,}/.test(s) ? s.replace(/^(-?\d+?)(\d{3})(?=(\.|$))/, '$1\\,$2') : s; };

/* a TI-84 text screen: lines of monospace text; line(i) gives the element */
function screen(stage, x, y, w, hh, head, lines) {
  const s = add(stage, box(h('div', 'u5l6-scr'), w, hh), x, y);
  if (head) s.appendChild(h('div', 'u5l6-scrh', head));
  s.lines = lines.map((t) => { const d = h('div', 'u5l6-sl', t); s.appendChild(d); return d; });
  return s;
}
/* a calculator cursor on y = f(x) with its prompt in the readout ("Left Bound?", "First curve?" …) */
function cursor(G, f, x, prompt) {
  const tr = G.traceMarker(f, x, { readout: false });
  const C = {
    tr, prompt,
    say(p) { C.prompt = p; G.readout(p, { x: tr.x, y: tr.y }); },
    async to(c, x2, p, ms = 900) { if (p != null) C.prompt = p; const a = tr.x; await tween(c, ms, (k) => { tr.set(a + (x2 - a) * k); G.readout(C.prompt, { x: tr.x, y: tr.y }); }); },
    remove() { tr.remove(); }
  };
  C.say(prompt); return C;
}
/* the little ▸ / ◂ bound markers the calculator draws at the top of the screen */
function boundMark(G, x, dir) {
  const p = svgEl('path', { fill: '#1c2230' }, G.layers.top);
  return G.track(p, () => { const [px] = G.toPx(x, 0), py = G.P.t + 3; p.setAttribute('d', dir === 'L' ? `M${px - 1} ${py}v16l11 -8z` : `M${px + 1} ${py}v16l-11 -8z`); });
}
/* a region of the plane (x from x0 to x1, full height) tinted, with a label at the top */
function badZone(G, x0, x1, html, o = {}) {
  const r = svgEl('rect', { fill: o.fill || '#c93a33', 'fill-opacity': 0.09 }, G.layers.bg);
  G.track(r, () => { const [a, t] = G.toPx(Math.max(x0, G.win.xmin), G.win.ymax), [b, bt] = G.toPx(Math.min(x1, G.win.xmax), G.win.ymin); r.setAttribute('x', a); r.setAttribute('y', t); r.setAttribute('width', Math.max(0, b - a)); r.setAttribute('height', bt - t); });
  const lab = G.label((Math.max(x0, G.win.xmin) + Math.min(x1, G.win.xmax)) / 2, o.y ?? G.win.ymax, html, { pos: 's', cls: 'u5l6-bad', gap: 10 });
  return { r, lab };
}

/* the models */
const KAYAK = (t) => 3000 - 200 * t;
const BLAZE = (t) => 8 + 10 * t - t * t;
const BRAKE = (v) => 0.006 * v * v;
const BATT = (t) => 100 - 8 * t;
const LAND = 5 + Math.sqrt(33), LAND0 = 5 - Math.sqrt(33); // 10.7446…, −0.7446…

/* ================= warm-up: double the speed ================= */
const braking = {
  title: 'Double the speed, four times the distance',
  height: 430,
  choices: [{ v: 50, label: '50 → 100 km/h (the big one)' }, { v: 30, label: '30 → 60 km/h' }, { v: 60, label: '60 → 120 km/h' }],
  intro: (v) => `Braking distance ${T('d=0.006v^2')}. What happens to ${T('d')} when the speed doubles from ${v} to ${2 * v} km/h? Press <b>Next</b>.`,
  make(stage, v1, ex) {
    const v2 = 2 * v1, d1 = BRAKE(v1), d2 = BRAKE(v2), dl = 2 * d1, vb = Math.sqrt(dl / 0.006);
    const G = new Graph(stage, { x: 14, y: 8, width: 600, height: 414, xmin: 0, xmax: 130, xstep: 10, xlabels: 20, ymin: 0, ymax: 100, ystep: 10, xtitle: 'v', ytitle: 'd', origin: true });
    const P = panel(stage, 634, 14, ex.W - 648, 400, 'Braking distance');
    return [
      { cap: `The graph of ${T('d=0.006v^2')} for speeds from 0 up: half a <b>parabola</b> starting at ${T('(0,\\ 0)')}. It <b>bends upward</b>.`,
        run: (c) => G.drawIn(G.fn(BRAKE, { from: 0, color: 'blue' }), 900, c) },
      { cap: `At ${v1} km/h: ${T(`d=0.006(${v1})^2=${tn(d1)}`)} m.`,
        run: async (c) => { G.drawIn(G.guides(v1, d1), 500, c); await G.reveal(G.point(v1, d1, { color: 'blue', coords: true, pos: 'nw' }), c); await show(c, pline(P, `${T(`v=${v1}`)}: &nbsp;${T(`d=${tn(d1)}`)} m`)); } },
      { cap: `<b>If</b> the graph were a straight line, doubling the speed would double the distance: ${T(tn(dl))} m. That’s the “double it” guess.`,
        run: async (c) => { await G.drawIn(G.segment([0, 0], [v2, dl], { color: 'gray', dash: true, width: 3 }), 700, c); await G.reveal(G.point(v2, dl, { color: 'gray', open: true, label: `guess: ${tn(dl)} m?`, pos: v2 > 100 ? 'sw' : 'se' }), c); await show(c, pline(P, `straight-line guess: ${T(tn(dl))} m`, 'dim')); } },
      { cap: `But the curve bends up: ${T(`d=0.006(${v2})^2=${tn(d2)}`)} m.`,
        run: async (c) => { G.drawIn(G.guides(v2, d2), 500, c); await G.reveal(G.point(v2, d2, { color: 'red', coords: true, pos: 'nw' }), c); await show(c, pline(P, `${T(`v=${v2}`)}: &nbsp;${T(`d=${tn(d2)}`)} m`)); } },
      { cap: `${T(`${tn(d2)}\\div${tn(d1)}=4`)}: <b>four times</b> as far. The speed is <b>squared</b>, and doubling it multiplies ${T('v^2')} by ${T('2^2=4')}.`,
        run: async (c) => { await G.drawIn(G.segment([4, d1], [4, d2], { color: 'red', width: 4, arrowB: true }), 600, c); await pop(c, G.label(4, (d1 + d2) / 2, '×4', { pos: 'e', cls: 'u5l6-x4', gap: 8 })); await show(c, pline(P, `double ${T('v')} → ${T('\\times4')} the distance`, 'ok')); } },
      { cap: `Backwards: what speed <b>doubles</b> the distance to ${T(tn(dl))} m? Set ${T(`Y_2=${tn(dl)}`)} and intersect: ${T(`v\\approx${vb.toFixed(1)}`)} km/h, far less than double the speed.`,
        run: async (c) => { await G.drawIn(G.fn(() => dl, { color: 'purple', dash: true, width: 2.5 }), 600, c); await G.reveal(G.point(vb, dl, { color: 'purple', label: T(`(${vb.toFixed(1)},\\ ${tn(dl)})`), pos: 'nw' }), c); await show(c, pline(P, `${T(`d=${tn(dl)}`)} at ${T(`v\\approx${vb.toFixed(1)}`)}`)); } }
    ];
  }
};

/* ================= 1. choosing a window ================= */
const WIN = {
  kayak: { f: KAYAK, y1: 'Y1=3000−200X', iv: 't', ov: 'V',
    std: 'The screen is <b>blank</b>! Every value is in the thousands, far above Ymax = 10.',
    fit: { xmin: -10, xmax: 10, ymin: 1000, ymax: 5000, xscl: 1, yscl: 500 },
    fitNote: 'Now the line shows, but <b>the left half is negative time</b>: before the kayak was bought.',
    ctx: { xmin: 0, xmax: 16, xscl: 2, ymin: 0, ymax: 3200, yscl: 500 },
    why: `${T('t')} is an age and ${T('V')} a value: neither is negative. The value starts at $3000 and reaches $0 at 15 years.`,
    marks: [[0, 3000], [15, 0]], end: 'Both intercepts are on screen: the <b>purchase price</b> and the <b>year the value reaches $0</b>.' },
  blaze: { f: BLAZE, y1: 'Y1=8+10X−X²', iv: 't', ov: 'h',
    std: 'Only two tiny pieces show: the flight goes far above Ymax = 10.',
    fit: { xmin: -10, xmax: 10, ymin: -192, ymax: 33, xscl: 1, yscl: 10 },
    fitNote: 'Now the top shows, but most of the screen is <b>negative time and negative height</b>, and the landing is cut off at X = 10.',
    ctx: { xmin: 0, xmax: 11, xscl: 1, ymin: 0, ymax: 35, yscl: 5 },
    why: 'Time and height are never negative; Blaze tops out at 33 m and lands before 11 s.',
    marks: [[0, 8], [5, 33], [LAND, 0]], end: '<b>Launch</b>, <b>top</b> and <b>landing</b> are all on screen.' },
  brake: { f: BRAKE, y1: 'Y1=0.006X²', iv: 'v', ov: 'd',
    std: 'It looks like a flat line along the x-axis: even at 10 km/h the distance is only 0.6 m.',
    fit: { xmin: -10, xmax: 10, ymin: 0, ymax: 0.6, xscl: 1, yscl: 0.1 },
    fitNote: 'ZoomFit stretches Y to 0.6, but X still stops at 10 km/h, and the left half is <b>negative speed</b>.',
    ctx: { xmin: 0, xmax: 120, xscl: 10, ymin: 0, ymax: 100, yscl: 10 },
    why: 'A speed can’t be negative, and highway speeds go up to about 120 km/h, where the distance is 86.4 m.',
    marks: [[0, 0], [50, 15], [100, 60]], end: 'The warm-up’s points (50, 15) and (100, 60) are both on screen.' }
};
const winLines = (w) => [`Xmin=${calcNum(w.xmin)}`, `Xmax=${calcNum(w.xmax)}`, `Xscl=${calcNum(w.xscl)}`, `Ymin=${calcNum(w.ymin)}`, `Ymax=${calcNum(w.ymax)}`, `Yscl=${calcNum(w.yscl)}`];
const winTex = (w) => `x{:}\\,[${tn(w.xmin)},\\,${tn(w.xmax)},\\,${tn(w.xscl)}],\\ y{:}\\,[${tn(w.ymin)},\\,${tn(w.ymax)},\\,${tn(w.yscl)}]`;
const window_ = {
  title: 'Finding a window that fits the situation',
  height: 450,
  choices: [{ sep: 'Example 1 check' }, { v: 'kayak', label: 'Kayak' }, { sep: 'Example 2 check' }, { v: 'blaze', label: 'Blaze' }, { sep: 'Warm-up' }, { v: 'brake', label: 'Braking' }],
  value: 'kayak',
  intro: 'Graph the model, then fix the window until the part that matters is on screen. Press <b>Next</b>.',
  make(stage, k, ex) {
    const M = WIN[k], std = { xmin: -10, xmax: 10, xscl: 1, ymin: -10, ymax: 10, yscl: 1 };
    const G = new Graph(stage, { x: 22, y: 24, width: 560, height: 390, theme: 'calc', ...std });
    const R = 612, RW = ex.W - R - 22;
    const Y = screen(stage, R, 24, RW, 44, '', [M.y1]); Y.style.opacity = 0;
    const Wn = screen(stage, R, 88, RW, 194, 'WINDOW', winLines(std)); Wn.style.opacity = 0;
    const K = panel(stage, R - 8, 302, RW + 16, 136, 'Keys pressed'); K.classList.add('u5l6-keys');
    const kadd = (html) => K.appendChild(h('span', '', (K.children.length > 1 ? ' → ' : '') + html));
    const setLines = (w, mark) => winLines(w).forEach((t, i) => { const el = Wn.lines[i]; const ch = el.textContent !== t; el.textContent = t; el.classList.toggle('new', !!mark && ch); });
    let curve;
    return [
      { cap: `Press ${keys('Y=')} and type the rule. The input is always ${mono('X')} (here ${T(M.iv)}) and the output ${mono('Y')} (here ${T(M.ov)}).`,
        run: async (c) => { await show(c, Y); kadd(keys('Y=') + ' type the rule'); } },
      { cap: `${keys('ZOOM 6')} gives the standard window ${T('x{:}\\,[-10,10,1]')}, ${T('y{:}\\,[-10,10,1]')}. ${M.std}`,
        run: async (c) => { setLines(std); await show(c, Wn); curve = G.fn(M.f); await G.drawIn(curve, 800, c); kadd(keys('ZOOM 6') + ' ZStandard'); } },
      { cap: `${keys('ZOOM 0')} (ZoomFit) keeps Xmin and Xmax and fits Y to the graph: ${mono('Ymin=' + calcNum(M.fit.ymin))}, ${mono('Ymax=' + calcNum(M.fit.ymax))}. ${M.fitNote}`,
        run: async (c) => { setLines({ ...std, ymin: M.fit.ymin, ymax: M.fit.ymax }, true); await G.setWindow(M.fit, c, 1000); kadd(keys('ZOOM 0') + ' ZoomFit'); } },
      { cap: `Nudge it with ${keys('WINDOW')} to fit the situation: ${M.why}`,
        run: async (c) => { setLines(M.ctx, true); await G.setWindow(M.ctx, c, 1100); kadd(keys('WINDOW') + ' type values, ' + keys('GRAPH')); } },
      { cap: `${M.end} Window: ${T(winTex(M.ctx))}.`,
        run: async (c) => { for (const [x, y] of M.marks) { await G.reveal(G.point(x, y, { color: 'red', r: 6 }), c); await sleep(c, 150); } } }
    ];
  }
};

/* ================= 1. intercepts ================= */
const ICPT = {
  bat: { f: BATT, iv: 't', ov: 'B', a: 100, b: 8, end: 12.5, rule: 'B=100-8t',
    story: `A phone battery: ${T('B=100-8t')} is the charge (%) ${T('t')} hours after unplugging.`,
    win: { xmin: 0, xmax: 14, xstep: 1, xlabels: 2, ymin: 0, ymax: 110, ystep: 10, ylabels: 20 },
    start: 'a <b>full charge</b>, 100%, at the moment it’s unplugged', endM: 'the battery is <b>dead</b> after 12.5 hours' },
  kayak: { f: KAYAK, iv: 't', ov: 'V', a: 3000, b: 200, end: 15, rule: 'V=3000-200t',
    story: `The kayak: ${T('V=3000-200t')}, its value in dollars at age ${T('t')} years.`,
    win: { xmin: 0, xmax: 16, xstep: 1, xlabels: 2, ymin: 0, ymax: 3500, ystep: 250, ylabels: 500 },
    start: 'the value when new: the <b>$3000 purchase price</b>', endM: 'after <b>15 years</b> the model says it’s worth $0' }
};
const intercepts = {
  title: 'Where the graph meets the axes',
  height: 440,
  choices: [{ sep: 'Demo' }, { v: 'bat', label: 'Phone battery' }, { sep: 'Example 1 check' }, { v: 'kayak', label: 'Kayak (b), (c)' }],
  value: 'bat',
  intro: (k) => `${ICPT[k].story} Press <b>Next</b>.`,
  make(stage, k, ex) {
    const M = ICPT[k], iv = M.iv, ov = M.ov;
    const G = new Graph(stage, { x: 14, y: 8, width: 490, height: 424, ...M.win, xtitle: iv, ytitle: ov, origin: true });
    const R = 530, RW = ex.W - R - 14;
    const C1 = panel(stage, R, 14, RW, 198, `${T(ov)}-intercept: set ${T(iv + '=0')}`), C2 = panel(stage, R, 226, RW, 198, `${T(iv)}-intercept: set ${T(ov + '=0')}`);
    C1.style.opacity = 0; C2.style.opacity = 0;
    const band = (a, b) => G.segment(a, b, { color: 'teal', width: 12, opacity: 0.3, cap: 'butt' });
    return [
      { cap: `${M.story} Its graph is a <b>line</b>. Where does it meet each axis?`,
        run: (c) => G.drawIn(G.fn(M.f, { from: 0, to: M.end, color: 'blue' }), 900, c) },
      { cap: `Every point on the ${T(ov)}-axis has ${T(iv + '=0')}. So substitute ${T(iv + '=0')}.`,
        run: async (c) => { await G.drawIn(band([0, 0], [0, M.win.ymax]), 500, c); await show(c, C1); await show(c, pline(C1, T(`${ov}=${M.a}-${M.b}(0)`))); } },
      { cap: `${T(ov)}-intercept ${T(`(0,\\ ${M.a})`)}: ${M.start}. The <b>start</b> of the story.`,
        run: async (c) => { await show(c, pline(C1, T(`${ov}=${M.a}`))); await G.reveal(G.point(0, M.a, { color: 'teal', coords: true, pos: 'ne', r: 7 }), c); await show(c, pline(C1, `start: ${M.start}`, 'ok')); } },
      { cap: `Every point on the ${T(iv)}-axis has ${T(ov + '=0')}. Substitute ${T(ov + '=0')} and solve.`,
        run: async (c) => { await G.drawIn(band([0, 0], [M.win.xmax, 0]), 500, c); await show(c, C2); await show(c, pline(C2, T(`0=${M.a}-${M.b}${iv}`))); await show(c, pline(C2, T(`${M.b}${iv}=${M.a}`))); } },
      { cap: `${T(iv)}-intercept ${T(`(${tn(M.end)},\\ 0)`)}: ${M.endM}. The <b>end</b> of the story. In context the intercepts are named after the variables, not “x” and “y”.`,
        run: async (c) => { await show(c, pline(C2, T(`${iv}=${tn(M.end)}`))); await G.reveal(G.point(M.end, 0, { color: 'amber', coords: true, pos: 'ne', r: 7 }), c); await show(c, pline(C2, `end: ${M.endM}`, 'ok')); } }
    ];
  }
};

/* ================= 1. trace forwards, intersect backwards ================= */
const TRI = {
  bat: { f: BATT, y1: 'Y1=100−8X', iv: 't', ov: 'B', tx: 3, target: 20, rule: 'B=100-8t', given: 'after 3 hours', asked: 'when the charge is down to 20%',
    win: { xmin: 0, xmax: 14, xscl: 1, ymin: 0, ymax: 110, yscl: 10 }, check: (x) => `100-8(${tn(x)})` },
  kayak: { f: KAYAK, y1: 'Y1=3000−200X', iv: 't', ov: 'V', tx: 4, target: 1500, rule: 'V=3000-200t', given: 'after 4 years', asked: 'when it’s worth half, $1500',
    win: { xmin: 0, xmax: 16, xscl: 2, ymin: 0, ymax: 3200, yscl: 500 }, check: (x) => `3000-200(${tn(x)})` }
};
const traceInt = {
  title: 'Trace goes forwards, intersect goes backwards',
  height: 440,
  choices: [{ sep: 'Demo' }, { v: 'bat', label: 'Phone battery' }, { sep: 'Example 1 check' }, { v: 'kayak', label: 'Kayak (d), (e)' }],
  value: 'bat',
  intro: (k) => `${T(TRI[k].rule)}: the output ${TRI[k].given}, then the input for a given output. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const M = TRI[k], ty = M.f(M.tx), mid = (M.win.xmin + M.win.xmax) / 2;
    const G = new Graph(stage, { x: 22, y: 24, width: 550, height: 390, theme: 'calc', ...M.win });
    const it = G.intersect(M.f, () => M.target, mid);
    const P = panel(stage, 600, 14, ex.W - 614, 410, '');
    const fw = h('div', 'u5l6-ph', 'Forwards: input → output'), bw = h('div', 'u5l6-ph', 'Backwards: output → input');
    let cur;
    return [
      { cap: `${T(M.rule)} on the graphing calculator, ${T(winTex(M.win))}.`,
        run: (c) => G.drawIn(G.fn(M.f), 900, c) },
      { cap: `<b>Given an input</b> (${M.given}): ${keys('TRACE')}, type ${keys(String(M.tx))}, ${keys('ENTER')}. The cursor jumps to ${mono('X=' + M.tx)} and reads ${mono('Y=' + calcNum(ty))}.`,
        run: async (c) => {
          const tr = G.traceMarker(M.f, mid, { title: M.y1 }); await pop(c, tr.el); await sleep(c, 300); await tr.move(c, M.tx, 700);
          await G.drawIn(G.segment([M.tx, 0], [M.tx, ty], { color: 'orange', width: 3, dash: true, arrowB: true }), 450, c);
          await G.drawIn(G.segment([M.tx, ty], [0, ty], { color: 'orange', width: 3, dash: true, arrowB: true }), 450, c);
          P.appendChild(fw); await show(c, fw); await show(c, pline(P, `${keys('TRACE')} ${keys(String(M.tx))} ${keys('ENTER')}`));
          await show(c, pline(P, `${T(`${M.iv}=${M.tx}`)} → ${T(`${M.ov}=${tn(ty)}`)}`, 'ok'));
          cur = tr;
        } },
      { cap: `<b>Given an output</b> (${M.asked}): put the target in ${keys('Y=')} as ${T(`Y_2=${tn(M.target)}`)}, a flat line.`,
        run: async (c) => { cur.remove(); await G.drawIn(G.fn(() => M.target, { color: 'red' }), 700, c); P.appendChild(bw); await show(c, bw); await show(c, pline(P, `${keys('Y=')} ${T(`Y_2=${tn(M.target)}`)}`)); } },
      { cap: `${keys('2ND TRACE')} ${mono('5:intersect')}: ${mono('First curve?')} ${keys('ENTER')}, ${mono('Second curve?')} ${keys('ENTER')}, ${mono('Guess?')} ${keys('ENTER')}. They cross at ${mono('X=' + calcNum(it.x))}.`,
        run: async (c) => {
          const c1 = cursor(G, M.f, mid, 'First curve?'); await pop(c, c1.tr.el); await sleep(c, 600); c1.remove();
          const c2 = cursor(G, () => M.target, mid, 'Second curve?'); await pop(c, c2.tr.el); await sleep(c, 600);
          await c2.to(c, it.x + (M.win.xmax - M.win.xmin) * 0.06, 'Guess?', 600); await sleep(c, 300); c2.remove();
          await G.reveal(G.point(it.x, it.y, { color: 'purple', r: 7 }), c); G.readout('Intersection', it);
          await G.drawIn(G.segment([0, M.target], [it.x, M.target], { color: 'purple', width: 3, dash: true, arrowB: true }), 450, c);
          await G.drawIn(G.segment([it.x, M.target], [it.x, 0], { color: 'purple', width: 3, dash: true, arrowB: true }), 450, c);
          await show(c, pline(P, `${keys('2ND TRACE')} ${mono('5:intersect')}`));
          await show(c, pline(P, `${T(`${M.ov}=${tn(M.target)}`)} → ${T(`${M.iv}=${tn(it.x)}`)}`, 'ok'));
        } },
      { cap: `Trace reads <b>forwards</b> (input → output); intersect works <b>backwards</b> (output → input). Check by substituting: ${T(`${M.check(it.x)}=${tn(M.target)}`)} ✓`,
        run: async (c) => { await show(c, pline(P, `check: ${T(`${M.check(it.x)}=${tn(M.target)}`)} ✓`)); } }
    ];
  }
};

/* ================= 1 & 2. the math answer vs the answer that makes sense ================= */
const R_ = '\\mathbb{R}';
const CTX = {
  bat: { f: BATT, iv: 't', ov: 'B', a: 0, b: 12.5, lo: 0, hi: 100,
    win: { xmin: -4, xmax: 18, xstep: 1, xlabels: 2, ymin: -40, ymax: 130, ystep: 10, ylabels: 20 },
    left: `${T('t<0')}: over 100%?`, right: `${T('B<0')}: below empty?`,
    c1: `The battery equation ${T('B=100-8t')} doesn’t know it’s a battery: its graph is a whole line, going on forever both ways.`,
    c2: `Left of ${T('t=0')}: the charge would be <b>over 100%</b>. Impossible.`,
    c3: `Right of ${T('t=12.5')}: a <b>negative</b> charge. Impossible.`,
    mD: `\\{t\\mid t\\in${R_}\\}`, mR: `\\{B\\mid B\\in${R_}\\}`,
    D: `\\{t\\mid 0\\le t\\le12.5,\\ t\\in${R_}\\}`, R: `\\{B\\mid 0\\le B\\le100,\\ B\\in${R_}\\}`, c6: '' },
  kayak: { f: KAYAK, iv: 't', ov: 'V', a: 0, b: 15, lo: 0, hi: 3000,
    win: { xmin: -6, xmax: 22, xstep: 1, xlabels: 4, ymin: -1500, ymax: 4500, ystep: 250, ylabels: 1000 },
    left: `${T('t<0')}: not bought yet`, right: `${T('V<0')}: a negative value?`,
    c1: `The equation ${T('V=3000-200t')} doesn’t know it’s a kayak: its graph is a whole line, going on forever both ways.`,
    c2: `Left of ${T('t=0')}: a <b>negative age</b>, before the kayak was bought. Doesn’t make sense.`,
    c3: `Right of ${T('t=15')}: a <b>negative value</b>. A kayak can’t be worth less than $0.`,
    mD: `\\{t\\mid t\\in${R_}\\}`, mR: `\\{V\\mid V\\in${R_}\\}`,
    D: `\\{t\\mid 0\\le t\\le15,\\ t\\in${R_}\\}`, R: `\\{V\\mid 0\\le V\\le3000,\\ V\\in${R_}\\}`, c6: '' },
  blaze: { f: BLAZE, iv: 't', ov: 'h', a: 0, b: LAND, lo: 0, hi: 33,
    win: { xmin: -3, xmax: 13, xstep: 1, xlabels: 2, ymin: -25, ymax: 45, ystep: 5, ylabels: 10 },
    left: `${T('t<0')}: before launch`, right: `${T('h<0')}: underground?`,
    c1: `The equation ${T('h=8+10t-t^2')} doesn’t know about Blaze: its graph is a whole parabola, both arms going down forever.`,
    c2: `Left of ${T('t=0')}: <b>before launch</b>. The math even has a zero at ${T('t\\approx-0.74')}, but Blaze was standing on the platform then.`,
    c3: `Right of ${T('t\\approx10.74')}: a <b>negative height</b>, below the ground. Blaze has already landed.`,
    mD: `\\{t\\mid t\\in${R_}\\}`, mR: `\\{h\\mid h\\le33,\\ h\\in${R_}\\}`,
    D: `\\{t\\mid 0\\le t\\le10.74,\\ t\\in${R_}\\}`, R: `\\{h\\mid 0\\le h\\le33,\\ h\\in${R_}\\}`,
    c6: ' From the airbag (0) up to the top (33), <b>not</b> from 8: Blaze falls below the platform before landing.' },
  brake: { f: BRAKE, iv: 'v', ov: 'd', a: 0, b: 120, lo: 0, hi: 86.4,
    win: { xmin: -130, xmax: 140, xstep: 10, xlabels: 50, ymin: -15, ymax: 125, ystep: 5, ylabels: 20 },
    left: `${T('v<0')}: negative speed?`, right: `past 120 km/h:<br>not modelled`,
    c1: `The equation ${T('d=0.006v^2')} is a whole parabola, with a left arm for <b>negative speeds</b>.`,
    c2: `Left of ${T('v=0')}: a <b>negative speed</b>. Doesn’t make sense.`,
    c3: `Past 120 km/h: faster than highway speeds. We choose to model speeds <b>up to 120 km/h</b>.`,
    mD: `\\{v\\mid v\\in${R_}\\}`, mR: `\\{d\\mid d\\ge0,\\ d\\in${R_}\\}`,
    D: `\\{v\\mid 0\\le v\\le120,\\ v\\in${R_}\\}`, R: `\\{d\\mid 0\\le d\\le86.4,\\ d\\in${R_}\\}`, c6: '' }
};
const context = {
  title: 'The math answer vs the answer that makes sense',
  height: 470,
  choices: [{ sep: 'Demo' }, { v: 'bat', label: 'Battery' }, { sep: 'Example checks' }, { v: 'kayak', label: 'Ex 1 (f) kayak' }, { v: 'blaze', label: 'Ex 2 (f) Blaze' }, { sep: 'Warm-up' }, { v: 'brake', label: 'Braking' }],
  value: 'bat',
  intro: 'Start with everything the equation allows, then keep only what fits the story. Press <b>Next</b>.',
  make(stage, k, ex) {
    const M = CTX[k], w = M.win;
    const G = new Graph(stage, { x: 14, y: 8, width: 600, height: 454, ...w, xtitle: M.iv, ytitle: M.ov });
    const P = panel(stage, 636, 14, ex.W - 650, 440, '');
    const hd = (t, cls) => { const d = h('div', 'u5l6-ph', t); d.style.color = cls; d.style.marginTop = '8px'; return d; };
    const bz = []; let full;
    return [
      { cap: `${M.c1} The <b>math answer</b>: the domain is all real numbers.`,
        run: async (c) => { full = G.fn(M.f, { color: 'blue' }); await G.drawIn(full, 1000, c); P.appendChild(hd('Math answer', '#c93a33')); await show(c, pline(P, `${T('D=' + M.mD)}`)); await show(c, pline(P, `${T('R=' + M.mR)}`)); } },
      { cap: M.c2,
        run: async (c) => { const z = badZone(G, w.xmin, M.a, M.left); bz.push(z); await Promise.all([fadeIn(c, z.r, 400), fadeIn(c, z.lab, 400)]); } },
      { cap: M.c3,
        run: async (c) => { const z = badZone(G, M.b, w.xmax, M.right); bz.push(z); await Promise.all([fadeIn(c, z.r, 400), fadeIn(c, z.lab, 400)]); } },
      { cap: `What’s left is a piece from the <b>start</b> to the <b>end</b> of the story, with <b>closed dots</b>: both ends really happen.`,
        run: async (c) => { await c.anim(full, [{ opacity: 1 }, { opacity: 0.28 }], 400); await G.drawIn(G.fn(M.f, { from: M.a, to: M.b, ends: ['closed', 'closed'], color: 'teal', width: 5.5 }), 900, c); } },
      { cap: `<b>Domain</b>: the piece’s shadow on the ${T(M.iv)}-axis. ${T('D=' + M.D)}`,
        run: async (c) => { await G.drawIn(G.shadeX(M.a, M.b), 700, c); P.appendChild(hd('Makes sense', '#12805a')); await show(c, pline(P, T('D=' + M.D), 'ok')); } },
      { cap: `<b>Range</b>: its shadow on the ${T(M.ov)}-axis, lowest to highest output. ${T('R=' + M.R)}${M.c6}`,
        run: async (c) => { await G.drawIn(G.shadeY(M.lo, M.hi), 700, c); await show(c, pline(P, T('R=' + M.R), 'ok')); } }
    ];
  }
};

/* ================= 2. vertex and symmetry ================= */
const PAIRC = ['#1f5bd6', '#13807a', '#c27a0e', '#e8a01e', '#c93a33'];
const symmetry = {
  title: 'Vertex and axis of symmetry',
  height: 460,
  choices: [{ sep: 'Example 2 check' }, { v: 24, label: '(e) h = 24' }, { sep: 'Same height' }, { v: 29, label: 'h = 29' }, { v: 8, label: 'h = 8' }],
  value: 24,
  intro: `Blaze’s height, ${T('h=8+10t-t^2')}. Look for a pattern in the table. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const rows = Array.from({ length: 11 }, (_, t) => [t, BLAZE(t)]);
    const G = new Graph(stage, { x: 10, y: 8, width: 520, height: 444, xmin: 0, xmax: 11, xstep: 1, ymin: 0, ymax: 36, ystep: 2, ylabels: 4, xtitle: 't', ytitle: 'h', origin: true });
    const tb = new ValueTable(stage, { x: 548, y: 14, headers: ['t', 'h'], rows, hide: 1, tap: false, cellW: 64, cellH: 33 });
    const P = panel(stage, 698, 14, ex.W - 712, 432, 'What we see');
    const dist = Math.sqrt(33 - k), t1 = 5 - dist, t2 = 5 + dist;
    const pts = [];
    return [
      { cap: `A table of values for ${T('h=8+10t-t^2')} from ${T('t=0')} to ${T('t=10')}, and the points.`,
        run: async (c) => { for (let r = 0; r < 11; r++) { await tb.reveal(r, 1, c); const p = G.point(r, BLAZE(r), { color: 'slate', r: 6 }); pts.push(p); await pop(c, p, 200); await sleep(c, 60); } } },
      { cap: `The heights climb, peak, then fall, and <b>repeat in reverse</b>: 8, 17, 24, 29, 32, <b>33</b>, 32, 29, 24, 17, 8.`,
        run: async (c) => {
          for (let i = 0; i < 5; i++) {
            [i, 10 - i].forEach((r) => { tb.cell(r, 1).style.background = PAIRC[i] + '2a'; tb.cell(r, 1).style.color = PAIRC[i]; pts[r].firstChild.setAttribute('fill', PAIRC[i]); });
            await Promise.all([pop(c, pts[i], 260), pop(c, pts[10 - i], 260)]); await sleep(c, 120);
          }
          tb.cell(5, 1).style.background = '#7b4fc42a'; tb.cell(5, 1).style.color = '#7b4fc4'; pts[5].firstChild.setAttribute('fill', '#7b4fc4');
          await show(c, pline(P, 'Same heights in reverse order: <b>8, 17, 24, 29, 32</b> on both sides of 33.'));
        } },
      { cap: `Join the dots: a <b>parabola</b>. Its turning point, the <b>vertex</b> ${T('(5,\\ 33)')}, is the highest point: a <b>maximum</b>.`,
        run: async (c) => { await G.drawIn(G.fn(BLAZE, { from: 0, to: LAND, color: 'blue', width: 3 }), 900, c); await G.reveal(G.point(5, 33, { color: 'purple', r: 8, coords: true, pos: 'e' }), c); await show(c, pline(P, `Vertex ${T('(5,\\ 33)')}: the <b>maximum</b>.`)); } },
      { cap: `Fold the graph along the vertical line ${T('t=5')}, the <b>axis of symmetry</b>: the left half lands exactly on the right half.`,
        run: async (c) => {
          await G.drawIn(G.vline(5, { color: 'purple', width: 3 }), 500, c);
          const st = { s: 0 };
          const mir = G.curve(() => { const s = []; for (let i = 0; i <= 60; i++) { const t = 5 * i / 60; s.push(G.toPx(5 + (t - 5) * (1 - 2 * st.s), BLAZE(t))); } return { subs: [s] }; }, { color: 'orange', width: 7, opacity: 0.55 }, '', G.layers.data);
          await tween(c, 1400, (q) => { st.s = q; mir._bkDraw(); });
          await show(c, pline(P, `Axis of symmetry: ${T('t=5')}.`));
        } },
      { cap: `At ${T('h=' + k)}: ${T('t=' + tn(t1))} and ${T('t=' + tn(t2))}. Both are ${T(tn(dist))} s from the vertex: ${T(`5-${tn(dist)}`)} and ${T(`5+${tn(dist)}`)}.` + (k === 8 ? ' Blaze passes the <b>platform height</b> again at 10 s, just before landing.' : ''),
        run: async (c) => {
          await G.drawIn(G.fn(() => k, { color: 'red', dash: true, width: 2.5 }), 600, c);
          const up = k < 26, yy = up ? k + 2.2 : k - 2.4;
          await Promise.all([G.drawIn(G.segment([5, yy], [t1, yy], { color: 'purple', width: 3, arrowB: true }), 500, c), G.drawIn(G.segment([5, yy], [t2, yy], { color: 'purple', width: 3, arrowB: true }), 500, c)]);
          G.label((5 + t1) / 2, yy, `${tn(dist)} s`, { pos: up ? 'n' : 's', cls: 'u5l6-dist', gap: 4 }); G.label((5 + t2) / 2, yy, `${tn(dist)} s`, { pos: up ? 'n' : 's', cls: 'u5l6-dist', gap: 4 });
          await Promise.all([G.reveal(G.point(t1, k, { color: 'red', r: 8 }), c), G.reveal(G.point(t2, k, { color: 'red', r: 8 }), c)]);
          tb.highlight(t1, true); tb.highlight(t2, true);
          await show(c, pline(P, `${T('h=' + k)} at ${T('t=' + tn(t1))} and ${T('t=' + tn(t2))}: ${T(`5\\pm${tn(dist)}`)}.`, 'ok'));
        } }
    ];
  }
};

/* ================= 2. maximum, zero and intersect on the calculator ================= */
const CALC_ITEMS = ['1:value', '2:zero', '3:minimum', '4:maximum', '5:intersect', '6:dy/dx', '7:∫f(x)dx'];
const calcMax = {
  title: 'CALC on the graphing calculator: maximum, zero, intersect',
  height: 440,
  choices: [{ sep: 'Example 2 check' }, { v: 'max', label: '(c) maximum' }, { v: 'zero', label: '(d) landing: zero' }, { v: 'int', label: '(e) intersect' }],
  value: 'max',
  intro: (k) => `${T('Y_1=8+10X-X^2')}, window ${T('x{:}\\,[0,11,1]')}, ${T('y{:}\\,[0,35,5]')}. ${k === 'max' ? 'Find the top.' : k === 'zero' ? 'Find the landing time.' : 'When is Blaze at 24 m?'} Press <b>Next</b>.`,
  make(stage, k, ex) {
    const win = { xmin: 0, xmax: 11, xscl: 1, ymin: 0, ymax: 35, yscl: 5 };
    const G = new Graph(stage, { x: 22, y: 24, width: 550, height: 390, theme: 'calc', ...win });
    const R = 604, RW = ex.W - R - 22;
    const S = screen(stage, R, 24, RW, 218, 'CALC', CALC_ITEMS); S.style.opacity = 0;
    const K = panel(stage, R - 8, 266, RW + 16, 162, 'Keys and answers'); K.classList.add('u5l6-keys');
    const mx = G.extremum(BLAZE, 0, 11, { max: true }), z = G.zero(BLAZE, 9, 11);
    const menu = async (c, n) => { await show(c, S); for (let i = 0; i < n; i++) { S.lines.forEach((l, j) => l.classList.toggle('sel', j === i)); await sleep(c, 220); } pline(K, `${keys('2ND TRACE')} ${mono(CALC_ITEMS[n - 1])}`); };
    const steps = [{ cap: `Graph ${T('Y_1=8+10X-X^2')} in the window ${T('x{:}\\,[0,11,1]')}, ${T('y{:}\\,[0,35,5]')}.`, run: (c) => G.drawIn(G.fn(BLAZE), 900, c) }];
    let cu;
    if (k === 'max' || k === 'zero') {
      const isMax = k === 'max', n = isMax ? 4 : 2, L = isMax ? 3 : 9.5, Rb = isMax ? 7 : 11, Gs = isMax ? 5.4 : 10.6;
      steps.push(
        { cap: `${keys('2ND TRACE')} opens the ${mono('CALC')} menu. Choose ${mono(CALC_ITEMS[n - 1])}.`, run: (c) => menu(c, n) },
        { cap: `${mono('Left Bound?')} Move the cursor to the <b>left</b> of the ${isMax ? 'top' : 'right-hand crossing'}, then ${keys('ENTER')}.`,
          run: async (c) => { S.style.opacity = 0.35; cu = cursor(G, BLAZE, 5.5, 'Left Bound?'); await pop(c, cu.tr.el); await cu.to(c, L, null, 900); await fadeIn(c, boundMark(G, L, 'L'), 250, { from: 'none' }); } },
        { cap: `${mono('Right Bound?')} Move to the <b>right</b> of it, ${keys('ENTER')}.`,
          run: async (c) => { await cu.to(c, Rb, 'Right Bound?', 900); await fadeIn(c, boundMark(G, Rb, 'R'), 250, { from: 'none' }); } },
        { cap: `${mono('Guess?')} Move close to it, ${keys('ENTER')}.`,
          run: async (c) => { await cu.to(c, Gs, 'Guess?', 700); } }
      );
      if (isMax) steps.push({ cap: `${mono('Maximum')} ${mono('X=5')} ${mono('Y=33')}: the highest point is <b>33 m</b>, reached <b>5 s</b> after launch. (X may show as 4.99999…: round it.)`,
        run: async (c) => { cu.remove(); await G.reveal(G.point(mx.x, mx.y, { color: 'purple', r: 7 }), c); G.readout('Maximum', mx); await show(c, pline(K, `vertex ${T('(5,\\ 33)')}: <b>33 m at 5 s</b>`, 'ok')); } });
      else steps.push(
        { cap: `${mono('Zero')} ${mono('X=' + calcNum(z))} ${mono('Y=0')}: Blaze lands after about <b>10.74 s</b>.`,
          run: async (c) => { cu.remove(); await G.reveal(G.point(z, 0, { color: 'red', r: 7 }), c); G.readout('Zero', { x: z, y: 0 }); await show(c, pline(K, `landing: ${T('t\\approx10.74')} s`, 'ok')); } },
        { cap: `Widen the window to ${mono('Xmin=−2')}: the equation has a <b>second zero</b>, ${T('t\\approx-0.74')}. That’s <b>before launch</b>, a math answer that doesn’t make sense: reject it.`,
          run: async (c) => { G.readout(null); await G.setWindow({ xmin: -2, ymin: -6 }, c, 900); await G.reveal(G.point(LAND0, 0, { color: 'gray', r: 7 }), c); await fadeIn(c, G.label(LAND0, 0, `✗ ${T('t\\approx-0.74')}<br>before launch`, { pos: 'ne', cls: 'u5l6-bad', gap: 10 })); await show(c, pline(K, `${T('t\\approx-0.74')}: rejected`, 'bad')); } }
      );
    } else {
      const i1 = G.intersect(BLAZE, () => 24, 2.5), i2 = G.intersect(BLAZE, () => 24, 7.5);
      steps.push(
        { cap: `Put the height from part (e) into ${keys('Y=')} as ${T('Y_2=24')}.`,
          run: async (c) => { await G.drawIn(G.fn(() => 24, { color: 'red' }), 700, c); pline(K, `${keys('Y=')} ${T('Y_2=24')}`); } },
        { cap: `${keys('2ND TRACE')} ${mono('5:intersect')}. ${mono('First curve?')} ${keys('ENTER')} (on ${T('Y_1')}), ${mono('Second curve?')} ${keys('ENTER')} (on ${T('Y_2')}).`,
          run: async (c) => { await menu(c, 5); S.style.opacity = 0.35; const a = cursor(G, BLAZE, 5.5, 'First curve?'); await pop(c, a.tr.el); await sleep(c, 600); a.remove(); cu = cursor(G, () => 24, 5.5, 'Second curve?'); await pop(c, cu.tr.el); await sleep(c, 400); } },
        { cap: `${mono('Guess?')} Move near the <b>left</b> crossing, ${keys('ENTER')}: ${mono('Intersection X=2 Y=24')}.`,
          run: async (c) => { await cu.to(c, 2.6, 'Guess?', 800); cu.remove(); await G.reveal(G.point(i1.x, i1.y, { color: 'purple', r: 7 }), c); G.readout('Intersection', i1); await show(c, pline(K, `${T('(2,\\ 24)')}`, 'ok')); } },
        { cap: `Run intersect again with the guess near the <b>right</b> crossing: ${mono('X=8 Y=24')}. Same height at two times, 3 s either side of the vertex.`,
          run: async (c) => { await G.reveal(G.point(i2.x, i2.y, { color: 'purple', r: 7 }), c); G.readout('Intersection', i2); await show(c, pline(K, `${T('(8,\\ 24)')}: back at 24 m at <b>8 s</b>`, 'ok')); } }
      );
    }
    return steps;
  }
};

/* ================= 2. which tool? ================= */
const QS = {
  '1b': { q: `Kayak (b): the ${T('t')}-intercept`, br: 'zero', why: `On the ${T('t')}-axis the output is <b>zero</b>: ${T('V=0')}.`, tool: 'zr', ans: '(15, 0): $0 after 15 years', res: `${mono('2:zero')} gives ${mono('X=15')}: the kayak is worth $0 after <b>15 years</b>.` },
  '1d': { q: 'Kayak (d): the value after 4 years', br: 'in', why: `${T('t=4')} is an <b>input</b>; the question wants the output.`, tool: 'trace', ans: '$2200', res: `${keys('TRACE')} ${keys('4')} ${keys('ENTER')} gives ${mono('Y=2200')}: <b>$2200</b>.` },
  '1e': { q: 'Kayak (e): when is it worth half, $1500?', br: 'out', why: `${T('V=1500')} is an <b>output</b>; the question wants the input (“when”).`, tool: 'int', ans: '7.5 years', res: `${T('Y_2=1500')}, ${mono('5:intersect')} gives ${mono('X=7.5')}: <b>7.5 years</b>.` },
  '2b': { q: 'Blaze (b): the height of the platform', br: 'in', why: `The platform is where Blaze starts: ${T('t=0')}, an <b>input</b>.`, tool: 'trace', ans: '8 m', res: `${keys('TRACE')} ${keys('0')} ${keys('ENTER')} gives ${mono('Y=8')}: <b>8 m</b> (the ${T('h')}-intercept).` },
  '2c': { q: 'Blaze (c): the maximum height', br: 'ext', why: '“Maximum” asks for the <b>highest</b> point.', tool: 'mx', ans: '33 m at 5 s', res: `${mono('4:maximum')} gives ${mono('X=5 Y=33')}: <b>33 m</b>, at <b>5 s</b>.` },
  '2d': { q: 'Blaze (d): how long until Blaze lands?', br: 'zero', why: `Landing means the height is <b>zero</b>: ${T('h=0')}.`, tool: 'zr', ans: '10.74 s', res: `${mono('2:zero')} (right-hand crossing) gives ${mono('X=10.74456')}: <b>10.74 s</b>.` }
};
const dot = (q) => (/[?.]$/.test(q) ? q : q + '.');
const whichTool = {
  title: 'Which tool answers the question?',
  height: 430,
  choices: [{ sep: 'Example 1 check' }, { v: '1b', label: '(b)' }, { v: '1d', label: '(d)' }, { v: '1e', label: '(e)' }, { sep: 'Example 2 check' }, { v: '2b', label: '(b)' }, { v: '2c', label: '(c)' }, { v: '2d', label: '(d)' }],
  value: '1d',
  intro: (k) => `${dot(QS[k].q)} Press <b>Next</b>.`,
  make(stage, k, ex) {
    const Q = QS[k], W = ex.W - 28, cx = (i) => W * (0.125 + 0.25 * i), bw = Math.min(222, W * 0.235);
    const F = new Flowchart(stage, { x: 14, y: 6, width: W, height: 416, nodes: {
      q: { x: W / 2, y: 40, w: 560, h: 60, html: `<b>${Q.q}</b>`, cls: 'bk-round' },
      in: { x: cx(0), y: 168, w: bw, h: 70, html: '<b>Gives an input</b>wants the output', color: 'orange' },
      out: { x: cx(1), y: 168, w: bw, h: 70, html: '<b>Gives an output</b>wants the input', color: 'purple' },
      zero: { x: cx(2), y: 168, w: bw, h: 70, html: '<b>Output is 0</b>intercept, lands, $0', color: 'red' },
      ext: { x: cx(3), y: 168, w: bw, h: 70, html: '<b>Greatest or least</b>top or bottom', color: 'blue' },
      trace: { x: cx(0), y: 296, w: bw, h: 74, html: `<b>Trace / value</b>${keys('TRACE')} or ${mono('1:value')}`, color: 'orange' },
      int: { x: cx(1), y: 296, w: bw, h: 74, html: `<b>Intersect</b>${T('Y_2=')} target, ${mono('5:intersect')}`, color: 'purple' },
      zr: { x: cx(2), y: 296, w: bw, h: 74, html: `<b>Zero</b>${mono('2:zero')}`, color: 'red' },
      mx: { x: cx(3), y: 296, w: bw, h: 74, html: `<b>Max / min</b>${mono('4:maximum')}`, color: 'blue' }
    }, edges: [
      { from: 'q', to: 'in', route: 'vhv' }, { from: 'q', to: 'out', route: 'vhv' }, { from: 'q', to: 'zero', route: 'vhv' }, { from: 'q', to: 'ext', route: 'vhv' },
      { from: 'in', to: 'trace' }, { from: 'out', to: 'int' }, { from: 'zero', to: 'zr' }, { from: 'ext', to: 'mx' }
    ] });
    const ti = ['trace', 'int', 'zr', 'mx'].indexOf(Q.tool);
    const A = add(stage, h('div', 'u5l6-ans', Q.ans), 0, 0); A.style.opacity = 0;
    return [
      { cap: `${dot(Q.q)} What does the question <b>give</b>, and what does it <b>ask for</b>?`, run: (c) => F.visit(c, 'q') },
      { cap: Q.why, run: async (c) => { await F.go(c, 'q', Q.br); await F.visit(c, Q.br); } },
      { cap: Q.res,
        run: async (c) => { await F.go(c, Q.br, Q.tool); await F.visit(c, Q.tool); A.style.left = (14 + cx(ti) - A.offsetWidth / 2) + 'px'; A.style.top = '384px'; await pop(c, A); } }
    ];
  }
};

/* ================= static figures: blank grids to sketch on, and the answer graphs ================= */
/* axis names with units, outside the grid (right of the horizontal axis, above the vertical one) */
function axisNames(G, xt, yt) {
  G.label(G.win.xmax, 0, xt, { tex: true, pos: 'e', clip: false, gap: 10 });
  G.label(0, G.win.ymax, yt, { tex: true, pos: 'n', clip: false, gap: 8 });
  const [x1, y1] = G.toPx(G.win.xmax, 0), [x0, y0] = G.toPx(0, G.win.ymax);
  svgEl('path', { d: `M${x1} ${y1}h8M${x0} ${y0}v-8`, stroke: '#1c2230', 'stroke-width': 2.4 }, G.layers.axes);
}
function mountFigures() {
  const g1 = document.getElementById('ex1-grid');
  if (g1) axisNames(new Graph(g1, { width: 560, height: 350, xmin: 0, xmax: 24, xstep: 2, xlabels: 4, ymin: 0, ymax: 3500, ystep: 500, ylabels: 500, xtitle: '', ytitle: '', origin: true, pad: [40, 104, 34, 58] }), 't\\text{ (years)}', 'V\\text{ (dollars)}');
  const g2 = document.getElementById('ex2-grid');
  if (g2) axisNames(new Graph(g2, { width: 560, height: 350, xmin: 0, xmax: 12, xstep: 1, xlabels: 1, ymin: 0, ymax: 35, ystep: 5, ylabels: 5, xtitle: '', ytitle: '', origin: true, pad: [40, 122, 34, 44] }), 't\\text{ (seconds)}', 'h\\text{ (metres)}');
  const a1 = document.getElementById('ex1a-fig');
  if (a1) {
    const G = new Graph(a1, { width: 430, height: 290, xmin: 0, xmax: 16, xstep: 1, xlabels: 5, ymin: 0, ymax: 3200, ystep: 250, ylabels: 1000, xtitle: 't', ytitle: 'V', fontSize: 16 });
    G.segment([0, 3000], [15, 0], { color: 'blue', width: 3.5 });
    [[0, 3000, 'e'], [4, 2200, 'ne'], [7.5, 1500, 'ne'], [15, 0, 'n']].forEach(([x, y, pos]) => G.point(x, y, { color: 'red', r: 5, coords: true, pos }));
  }
  const a2 = document.getElementById('ex2a-fig');
  if (a2) {
    const G = new Graph(a2, { width: 430, height: 290, xmin: 0, xmax: 11, xstep: 1, xlabels: 2, ymin: 0, ymax: 36, ystep: 2, ylabels: 10, xtitle: 't', ytitle: 'h', fontSize: 16 });
    G.fn(BLAZE, { from: 0, to: LAND, color: 'blue', width: 3.5 });
    G.point(0, 8, { color: 'red', r: 5, coords: true, pos: 'e' }); G.point(2, 24, { color: 'red', r: 5, coords: true, pos: 'w' });
    G.point(5, 33, { color: 'red', r: 5, coords: true, pos: 's' }); G.point(8, 24, { color: 'red', r: 5, coords: true, pos: 'e' });
    G.point(LAND, 0, { color: 'red', r: 5, label: T('(10.74,\\ 0)'), pos: 'nw' });
  }
}

/* ================= warm-up: the orange car skids when the answer is revealed ================= */
function mountRoad() {
  const btn = document.getElementById('u5l6-pollbtn'), car = document.getElementById('u5l6-carB'), skid = document.getElementById('u5l6-skidB'), q = document.getElementById('u5l6-q');
  if (!btn || !car) return;
  btn.addEventListener('click', () => {
    car.style.transform = 'translateX(756px)';
    skid.style.transition = 'opacity 1.6s'; skid.style.opacity = 1;
    setTimeout(() => { q.textContent = '60'; }, 1500);
  });
}

mountFigures();
mountRoad();
void liveCtx;
export const explainers = mountExplainers({ braking, window: window_, intercepts, traceInt, context, symmetry, calcMax, whichTool });
