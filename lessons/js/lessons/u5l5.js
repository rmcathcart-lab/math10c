/* Math 10C · Unit 5 · Lesson 5 — Graphing Calculator Techniques for Relations (TI-83/84).
 * Every explainer runs on a TI-84-style screen: a Graph with theme 'calc' (the Calc subclass hides an axis that is
 * outside the window, like the real screen), plus an LCD overlay for the text screens (Y=, WINDOW, TBLSET, TABLE,
 * the CALC / ZOOM / MATH menus, the home screen and ERR:INVALID). Keys pressed appear as keycaps under the screen.
 * The trace cursor, bound markers ▸ ◂ and the zero / intersect / maximum results are computed by the Graph block. */
import { Graph, h, tex, add, box, pop, fadeIn, sleep, tween, pulse, shake, svgEl, stamp, stampIn, mountExplainers, liveCtx, calcNum, texNum, intersect } from '../blocks.js';

const T = (s) => tex(s);
const TW = (s) => { // a long chain in a caption, in pieces that can wrap (before each ⇒, else before each later =)
  s = String(s); const ar = s.includes('\\Rightarrow'); let p = ar ? s.split(/(?=\\ \\Rightarrow)/) : s.split(/(?==)/);
  if (!ar && p.length > 2) p = [p[0] + p[1], ...p.slice(2)];
  return p.map((q) => T(q)).join(' ');
};
const STD = { xmin: -10, xmax: 10, ymin: -10, ymax: 10, xscl: 1, yscl: 1 };
const M = (s) => String(s).replace(/-/g, '−'); // calculator text: real minus signs

/* ============ the calculator screen ============ */
class Calc extends Graph {
  constructor(host, o = {}) { super(host, Object.assign({ theme: 'calc' }, o)); }
  // the real screen draws no axis when 0 is outside the window (the block would park it on the edge)
  frame() {
    super.frame();
    const w = this.win, ax = this.layers.axes, showX = w.ymin <= 0 && w.ymax >= 0, showY = w.xmin <= 0 && w.xmax >= 0;
    const ls = ax.querySelectorAll('.bk-axis');
    if (ls[0]) ls[0].style.display = showX ? '' : 'none';
    if (ls[1]) ls[1].style.display = showY ? '' : 'none';
    ax.querySelectorAll('.bk-tick').forEach((t) => { const vert = t.getAttribute('x1') === t.getAttribute('x2'); t.style.display = (vert ? showX : showY) ? '' : 'none'; });
  }
  get dx() { return (this.win.xmax - this.win.xmin) / 94; } // one pixel of the TI-84 screen (95 columns)
  get mid() { return (this.win.xmin + this.win.xmax) / 2; } // TRACE starts in the middle column
}

/* text screens (Y=, WINDOW, TABLE, menus, home screen) drawn over a screen element */
function lcd(host) {
  const d = h('div', 'u5l5-lcd'); d.style.display = 'none'; host.appendChild(d);
  const L = {
    el: d,
    show(lines, cls = '') {
      d.className = 'u5l5-lcd ' + cls;
      d.innerHTML = lines.map((l) => (typeof l === 'object' ? `<div class="u5l5-ln ${l.cls || ''}">${l.t}</div>` : `<div class="u5l5-ln">${l}</div>`)).join('');
      d.style.display = ''; return d;
    },
    html(s, cls = '') { d.className = 'u5l5-lcd ' + cls; d.innerHTML = s; d.style.display = ''; return d; },
    hide() { d.style.display = 'none'; },
    ln(i) { return d.children[i]; }
  };
  return L;
}
const inv = (s) => `<b class="u5l5-inv">${s}</b>`;
const CUR = '<b class="u5l5-cur"></b>';

/* equation (top left) and prompt / coordinates (bottom) on the graph screen */
function hud(G) {
  const tl = h('div', 'u5l5-eq'), bl = h('div', 'u5l5-bot');
  tl.style.display = bl.style.display = 'none'; G.el.append(tl, bl);
  return {
    eq(s) { tl.innerHTML = s ? M(s) : ''; tl.style.display = s ? '' : 'none'; },
    bot(title, xy, raw) {
      if (!title && !xy && !raw) { bl.style.display = 'none'; return; }
      const xs = xy && (xy.xs ?? calcNum(xy.x)), ys = xy && (xy.ys ?? calcNum(xy.y));
      bl.innerHTML = (title ? `<div class="u5l5-bt">${title}</div>` : '') + (xy ? `<div class="u5l5-bxy"><i>X=${M(xs)}</i><i>Y=${M(ys)}</i></div>` : '') + (raw ? `<div class="u5l5-bxy">${raw}</div>` : '');
      bl.style.display = '';
    },
    el: bl
  };
}

/* keycaps */
const KCLS = { '2nd': 'u5l5-k2', ALPHA: 'u5l5-ka' };
const kb = (k) => `<kbd${KCLS[k] ? ` class="${KCLS[k]}"` : ''}>${k}</kbd>`;
const kk = (...ks) => ks.map(kb).join(' ');
class Keys {
  constructor(stage, x, y, w) { this.el = add(stage, box(h('div', 'u5l5-keys'), w, 50), x, y); this.clear(); }
  clear() { this.el.innerHTML = '<b class="u5l5-kl">Keys</b>'; this.el.classList.remove('u5l5-many'); }
  add(k) { // a keycap; long sequences switch to smaller caps so they stay on one line
    const e = h('kbd', KCLS[k] || '', k); this.el.appendChild(e);
    if (this.el.scrollWidth > this.el.clientWidth + 1 || this.el.scrollHeight > this.el.clientHeight + 1) this.el.classList.add('u5l5-many');
    return e;
  }
  async set(c, ks, keep) {
    if (!keep) this.clear();
    for (const k of ks) { const e = this.add(k); await pop(c, e, 220); await sleep(c, 110); }
  }
}
/* side panel */
function panel(stage, x, y, w, hh, title) { return add(stage, box(h('div', 'u5l5-panel', title ? `<div class="u5l5-ph">${title}</div>` : ''), w, hh), x, y); }
async function line(c, P, html, cls = '') { const d = h('div', 'u5l5-pl ' + cls, html); P.appendChild(d); await fadeIn(c, d); return d; }

/* the standard explainer layout: screen left, keys under it, panel right */
function rig(stage, ex, win, o = {}) {
  const G = new Calc(stage, Object.assign({ x: 26, y: 26, width: 500, height: 330 }, win));
  const L = lcd(G.el), H = hud(G), K = new Keys(stage, 16, 380, 530);
  const P = panel(stage, o.px ?? 572, 14, ex.W - (o.px ?? 572) - 14, ex.def.height - 28, o.title ?? 'Check it algebraically');
  return { G, L, H, K, P };
}

/* menus */
const MENUS = {
  calc: { tabs: ['CALCULATE'], items: ['value', 'zero', 'minimum', 'maximum', 'intersect', 'dy/dx', '∫f(x)dx'] },
  zoom: { tabs: ['ZOOM', 'MEMORY'], items: ['ZBox', 'Zoom In', 'Zoom Out', 'ZDecimal', 'ZSquare', 'ZStandard', 'ZTrig', 'ZInteger', 'ZoomStat', 'ZoomFit'] },
  math: { tabs: ['MATH', 'NUM', 'CPX', 'PRB'], items: ['▸Frac', '▸Dec', '³', '³√(', 'ˣ√', 'fMin(', 'fMax(', 'nDeriv(', 'fnInt(', 'Solver…'] }
};
function menuLines(m, sel) {
  const n = m.items.length, first = Math.max(0, Math.min(sel - 6, n - 7)), rows = [m.tabs.map((t, i) => (i ? t : inv(t))).join('  ')];
  for (let i = first; i < Math.min(n, first + 7); i++) {
    const more = i === first + 6 && n > first + 7, lab = String((i + 1) % 10) + (more ? '↓' : ':');
    rows.push((i === sel ? inv(lab) : lab) + m.items[i]);
  }
  return rows;
}
async function pick(c, L, key, sel) {
  const m = MENUS[key]; L.show(menuLines(m, 0), 'u5l5-menu');
  for (let i = 1; i <= sel; i++) { await sleep(c, 150); L.show(menuLines(m, i), 'u5l5-menu'); }
  await sleep(c, 450);
}

/* screens */
const MODE_ROWS = [['NORMAL', 'SCI', 'ENG'], ['FLOAT', '0123456789'], ['RADIAN', 'DEGREE'], ['FUNC', 'PAR', 'POL', 'SEQ'], ['CONNECTED', 'DOT'], ['SEQUENTIAL', 'SIMUL'], ['REAL', 'a+bi', 're^θi'], ['FULL', 'HORIZ', 'G-T']];
const modeLines = (sel = {}) => MODE_ROWS.map((r, i) => r.map((w, j) => ((sel[i] ?? 0) === j ? inv(w) : w)).join(' '));
const FORMAT = [['RectGC', 'PolarGC'], ['CoordOn', 'CoordOff'], ['GridOff', 'GridOn'], ['AxesOn', 'AxesOff'], ['LabelOff', 'LabelOn'], ['ExprOn', 'ExprOff']];
const yEditor = (ys, plot1) => [(plot1 ? inv('Plot1') : 'Plot1') + ' Plot2 Plot3', ...[1, 2, 3, 4, 5, 6, 7].map((i) => `Y${i}=${M(ys[i - 1] || '')}`)];
const winLines = (w, hl = []) => ['WINDOW', ...[['Xmin', w.xmin], ['Xmax', w.xmax], ['Xscl', w.xscl], ['Ymin', w.ymin], ['Ymax', w.ymax], ['Yscl', w.yscl], ['Xres', 1]].map(([k, v], i) => ({ t: `${k}=${M(v)}`, cls: hl.includes(i + 1) ? 'u5l5-hl' : '' }))];
const tblset = (start, step, ask) => ['TABLE SETUP', `TblStart=${M(start)}`, `ΔTbl=${M(step)}`, `Indpnt: ${ask ? 'Auto ' + inv('Ask') : inv('Auto') + ' Ask'}`, `Depend: ${inv('Auto')} Ask`];
/* the TABLE screen: rows [[x, y]…] (strings or numbers), hl = highlighted row, bottom line */
function tableHTML(rows, o = {}) {
  let s = `<div class="u5l5-tg"><div class="u5l5-th">X</div><div class="u5l5-th">Y1</div><div class="u5l5-th u5l5-tdim"></div>`;
  for (let i = 0; i < 7; i++) {
    const r = rows[i], hl = o.hl === i ? ' u5l5-thl' : '';
    s += `<div class="u5l5-td${hl}">${r ? M(typeof r[0] === 'number' ? calcNum(r[0]) : r[0]) : ''}</div><div class="u5l5-td${hl}">${r && r[1] !== '' ? M(typeof r[1] === 'number' ? calcNum(r[1]) : r[1]) : ''}</div><div class="u5l5-td u5l5-tdim"></div>`;
  }
  return s + `</div><div class="u5l5-tb">${M(o.bottom || '')}</div>`;
}
const homeHTML = (rows) => rows.map((r) => `<div class="u5l5-ln${r.r ? ' u5l5-right' : ''}">${M(r.t)}</div>`).join('');
const errLines = ['ERR:INVALID', inv('1:') + 'Quit', '', 'Xmin ≤ X ≤ Xmax only'];

/* a bound marker ▸ / ◂ at the top of the screen, like the TI's */
function bound(G, x, dir) {
  const g = svgEl('polygon', { class: 'u5l5-bound' }, G.layers.top);
  return G.track(g, () => {
    const [px] = G.toPx(x, 0), py = G.P.t + 4, s = 18, e = dir > 0 ? px + s * 0.75 : px - s * 0.75;
    g.setAttribute('points', `${px.toFixed(1)},${py} ${px.toFixed(1)},${py + s} ${e.toFixed(1)},${py + s / 2}`);
  });
}
/* trace cursor whose coordinates show at the bottom */
function cursor(G, H, f, x, title) {
  const tr = G.traceMarker(f, x, { readout: false });
  tr.title = title; tr.show = () => { if (!tr.quiet) H.bot(tr.title, { x: tr.x, y: tr.y }); }; tr.show();
  tr.glide = (c, x2, ms = 900) => { const a = tr.x; return tween(c, ms, (t) => { tr.set(a + (x2 - a) * t); tr.show(); }); };
  tr.steps = async (c, n, ms = 260) => { for (let i = 0; i < n; i++) { tr.set(tr.x + G.dx); tr.show(); await sleep(c, ms); } };
  return tr;
}
/* type text into one line of the LCD, one key at a time */
async function typeKeys(c, K, keys, onKey) { K.clear(); for (const k of keys) { const e = K.add(k); onKey(k); await pop(c, e, 200); await sleep(c, 150); } }
const snap = (G, x) => G.mid + Math.round((x - G.mid) / G.dx) * G.dx; // nearest pixel column the arrows can reach
const wTex = (w) => `x:[${w.xmin},\\ ${w.xmax},\\ ${w.xscl}],\\ \\ y:[${w.ymin},\\ ${w.ymax},\\ ${w.yscl}]`;

/* ============ relations used in the lesson ============ */
const REL = {
  run: { f: (x) => 0.75 * x - 9, y1: '0.75X-9', t: 'y=0.75x-9' },
  ex1: { f: (x) => 4 * x - 30, y1: '4X-30', t: 'y=4x-30', win: { xmin: -2, xmax: 11, xscl: 1, ymin: -35, ymax: 15, yscl: 5 } },
  ex2a: { f: (x) => (7 * x + 21) / 3, y1: '(7X+21)/3', t: 'y=\\frac{7x+21}{3}' },
  ex2b: { f: (x) => -x * x + 2 * x + 8, y1: '-X²+2X+8', t: 'y=-x^2+2x+8' },
  ex3: { f: (x) => (3 * x - 13) / 8, y1: '(3X-13)/8', t: 'y=\\frac{3x-13}{8}', win: { xmin: -3, xmax: 11, xscl: 1, ymin: -3, ymax: 3, yscl: 1 } },
  fr2: { f: (x) => (2 * x + 7) / 6, y1: '(2X+7)/6', t: 'y=\\frac{2x+7}{6}', win: { xmin: -5, xmax: 3, xscl: 1, ymin: -2, ymax: 3, yscl: 1 } },
  ex4: { f: (x) => -x * x + 7 * x + 12, y1: '-X²+7X+12', t: 'y=-x^2+7x+12', win: { xmin: -3, xmax: 10, xscl: 1, ymin: -10, ymax: 30, yscl: 5 } },
  mn: { f: (x) => x * x - 2 * x - 3, y1: 'X²-2X-3', t: 'y=x^2-2x-3' }
};
const WIDE = { xmin: -5, xmax: 20, xscl: 5, ymin: -15, ymax: 10, yscl: 5 };

/* ======================================================================
   1. setup — MODE, FORMAT and the stat plots
   ====================================================================== */
const setup = {
  title: 'Before you graph: MODE, FORMAT and the stat plots',
  height: 440,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Three quick checks on the TI-84 before graphing anything. Press <b>Next</b>.',
  make(stage, v, ex) {
    const { G, L, K, P } = rig(stage, ex, STD, { title: 'Checklist' });
    const f = (x) => 0.5 * x + 2;
    const items = ['<b>MODE:</b> Func', '<b>FORMAT:</b> RectGC, CoordOn, AxesOn, LabelOff', '<b>Y=:</b> Plot1, Plot2, Plot3 off'].map((s) => { const d = h('div', 'u5l5-chk', '<i class="u5l5-tick">✓</i><div>' + s + '</div>'); P.appendChild(d); return d; });
    const tick = (c, i) => { items[i].classList.add('on'); return pulse(c, items[i], 1.04); };
    const data = [[-7, 6], [-5, -4], [-2, 8], [1, -6], [3, 7], [6, -2], [8, 4], [-8, -8], [4, -8]];
    let marks = [];
    const plotMarks = () => data.map(([x, y]) => { const [px, py] = G.toPx(x, y); return svgEl('rect', { class: 'u5l5-stat', x: px - 6, y: py - 6, width: 12, height: 12 }, G.layers.top); });
    return [
      { cap: `${kk('MODE')}: the fourth line must have <b>FUNC</b> highlighted, so every relation is typed in solved for <b>y</b>.`,
        run: async (c) => { await K.set(c, ['MODE']); L.show(modeLines()); await pulse(c, L.ln(3).querySelector('.u5l5-inv'), 1.3); await tick(c, 0); } },
      { cap: `${kk('2nd', 'ZOOM')} opens FORMAT: <b>RectGC</b>, <b>CoordOn</b>, <b>AxesOn</b> and <b>LabelOff</b> highlighted.`,
        run: async (c) => { await K.set(c, ['2nd', 'ZOOM']); L.show(FORMAT.map((r) => inv(r[0]) + ' ' + r.slice(1).join(' '))); for (const i of [0, 1, 3, 4]) await pulse(c, L.ln(i).querySelector('.u5l5-inv'), 1.25); await tick(c, 1); } },
      { cap: `${kk('Y=')}: the relation is in Y1, but <b>Plot1</b> is highlighted: it is still on from an old statistics lesson.`,
        run: async (c) => { await K.set(c, ['Y=']); L.show(yEditor(['0.5X+2'], true)); await pulse(c, L.ln(0).querySelector('.u5l5-inv'), 1.3); } },
      { cap: `${kk('GRAPH')}: the old data points are plotted <b>on top of</b> the relation. Which marks belong to it?`,
        run: async (c) => { await K.set(c, ['GRAPH']); L.hide(); await G.drawIn(G.fn(f), 700, c); marks = plotMarks(); for (const m of marks) { await pop(c, m, 200); } } },
      { cap: `Fix it: ${kk('Y=')}, ${kk('▲')} up to <b>Plot1</b>, ${kk('ENTER')}. It is no longer highlighted.`,
        run: async (c) => { await K.set(c, ['Y=', '▲', 'ENTER']); L.show(yEditor(['0.5X+2'], true)); await sleep(c, 400); L.show(yEditor(['0.5X+2'], false)); await pulse(c, L.ln(0), 1.08); } },
      { cap: `${kk('GRAPH')}: just the relation. Ready to graph!`,
        run: async (c) => { await K.set(c, ['GRAPH']); L.hide(); marks.forEach((m) => m.remove()); await tick(c, 2); await stampIn(c, stamp(P, 'Ready', { ok: true, cls: 'u5l5-pstamp' })); } }
    ];
  }
};

/* ======================================================================
   2. window — the WINDOW editor beside the screen
   ====================================================================== */
const windowEx = {
  title: 'The WINDOW screen sets what part of the plane you see',
  height: 450,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  intro: `Left: the ${kk('WINDOW')} editor. Right: the graph screen it controls. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const ed = add(stage, box(h('div', 'u5l5-scr'), 310, 300), 26, 40), E = lcd(ed);
    const W0 = { ...STD }, W1 = { ...WIDE };
    E.show(winLines(W0));
    const gx = 520, gw = Math.min(400, ex.W - gx - 30);
    const G = new Calc(stage, { x: gx, y: 50, width: gw, height: 280, ...STD });
    const call = (html, x, y, cls = '') => add(stage, h('div', 'u5l5-call ' + cls, html), x, y);
    const cXmin = call('', gx - 4, 352, 'u5l5-cl'), cXmax = call('', gx + gw + 4, 352, 'u5l5-cr');
    const cYmax = call('', gx - 26, 40, 'u5l5-cy'), cYmin = call('', gx - 26, 316, 'u5l5-cy');
    [cXmin, cXmax, cYmax, cYmin].forEach((e) => (e.style.opacity = 0));
    const setCalls = (w) => { cXmin.innerHTML = `↑ Xmin = ${M(w.xmin)}`; cXmax.innerHTML = `Xmax = ${M(w.xmax)} ↑`; cYmax.innerHTML = `Ymax = ${M(w.ymax)} →`; cYmin.innerHTML = `Ymin = ${M(w.ymin)} →`; };
    setCalls(W0);
    const note = add(stage, box(h('div', 'u5l5-note', ''), ex.W - 60, 50), 30, 392);
    const tickDots = (axis) => {
      const g = svgEl('g', { class: 'u5l5-tdots' }, G.layers.top), w = G.win, s = axis === 'x' ? w.xstep : w.ystep, lo = axis === 'x' ? w.xmin : w.ymin, hi = axis === 'x' ? w.xmax : w.ymax;
      for (let v2 = Math.ceil(lo / s) * s; v2 <= hi + 1e-9; v2 += s) { if (Math.abs(v2) < 1e-9) continue; const [px, py] = axis === 'x' ? G.toPx(v2, 0) : G.toPx(0, v2); svgEl('circle', { cx: px, cy: py, r: 5 }, g); }
      return g;
    };
    let dots;
    return [
      { cap: `<b>Xmin = −10</b> is the <b>left edge</b> of the screen and <b>Xmax = 10</b> the <b>right edge</b>.`,
        run: async (c) => { E.show(winLines(W0, [1, 2])); await Promise.all([fadeIn(c, cXmin), fadeIn(c, cXmax)]); } },
      { cap: `<b>Xscl = 1</b>: a tick mark on the x-axis every <b>1</b> unit (scale, not a size).`,
        run: async (c) => { E.show(winLines(W0, [3])); dots = tickDots('x'); await fadeIn(c, dots, 500); } },
      { cap: `<b>Ymin</b> and <b>Ymax</b> are the bottom and top edges; <b>Yscl = 1</b> spaces the y-axis ticks.`,
        run: async (c) => { dots.remove(); E.show(winLines(W0, [4, 5, 6])); dots = tickDots('y'); await Promise.all([fadeIn(c, cYmax), fadeIn(c, cYmin), fadeIn(c, dots, 500)]); } },
      { cap: `<b>Xres = 1</b> is the screen resolution: leave it alone.`, run: async (c) => { dots.remove(); E.show(winLines(W0, [7])); await pulse(c, E.ln(7), 1.06); } },
      { cap: `Short form: <b>[min, max, scale]</b> for each axis. The standard window is ${T('x:[-10,\\ 10,\\ 1]')}, ${T('y:[-10,\\ 10,\\ 1]')}.`,
        run: async (c) => { E.show(winLines(W0)); note.innerHTML = T(wTex(W0)); await fadeIn(c, note); } },
      { cap: `Type a new window, ${T('x:[-5,\\ 20,\\ 5]')}, ${T('y:[-15,\\ 10,\\ 5]')}, and press ${kk('GRAPH')}: the screen moves and stretches.`,
        run: async (c) => {
          const w = { ...W0 };
          for (const k of ['xmin', 'xmax', 'xscl', 'ymin', 'ymax', 'yscl']) { w[k] = W1[k]; E.show(winLines(w, [['xmin', 'xmax', 'xscl', 'ymin', 'ymax', 'yscl'].indexOf(k) + 1])); await sleep(c, 260); }
          E.show(winLines(W1)); setCalls(W1); note.innerHTML = T(wTex(W1)); await G.setWindow(W1, c, 1300);
        } },
      { cap: `Now x runs from −5 to 20 and y from −15 to 10, with a tick every <b>5</b>. Same plane, a different view of it.`,
        run: async (c) => { dots = tickDots('x'); const d2 = tickDots('y'); await Promise.all([fadeIn(c, dots, 500), fadeIn(c, d2, 500)]); } }
    ];
  }
};

/* ======================================================================
   3. graphIt — Y= then GRAPH, and the cut-off intercept
   ====================================================================== */
const graphIt = {
  title: 'Enter y = 0.75x − 9 and graph it',
  height: 440,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  intro: `The running example: ${T('y=0.75x-9')}, already solved for ${T('y')}. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const { G, L, K, P } = rig(stage, ex, STD), f = REL.run.f;
    let typed = '';
    return [
      { cap: `${kk('Y=')} opens the equation editor. The relation must be <b>solved for y</b>; this one is, so its right side goes into <b>Y1</b>.`,
        run: async (c) => { await K.set(c, ['Y=']); L.show(yEditor([])); L.ln(1).innerHTML = 'Y1=' + CUR; } },
      { cap: `Type ${kk('0', '.', '7', '5', 'X,T,θ,n', '−', '9')}. The ${kk('X,T,θ,n')} key types the <b>X</b>.`,
        run: async (c) => {
          const map = { 'X,T,θ,n': 'X', '−': '−' };
          await typeKeys(c, K, ['0', '.', '7', '5', 'X,T,θ,n', '−', '9'], (k) => { typed += map[k] || k; L.ln(1).innerHTML = 'Y1=' + typed + CUR; });
          L.ln(1).innerHTML = 'Y1=0.75X−9';
        } },
      { cap: `${kk('ZOOM', '6')} (ZStandard) graphs it in the standard window ${T('x:[-10,\\ 10,\\ 1]')}, ${T('y:[-10,\\ 10,\\ 1]')}.`,
        run: async (c) => { await K.set(c, ['ZOOM', '6']); L.hide(); await G.drawIn(G.fn(f), 900, c); } },
      { cap: `The <b>y-intercept</b>, ${T('(0,\\ -9)')}, is just inside the bottom edge.`,
        run: async (c) => { await G.reveal(G.point(0, -9, { color: 'ink', label: T('(0,\\ -9)'), pos: 'e' }), c); await line(c, P, `${T('x=0:\\ y=0.75(0)-9=-9')}`); } },
      { cap: `The <b>x-intercept</b>: ${T('0.75x-9=0')} gives ${T('x=12')}, past ${T('X_{\\max}=10')}. It is <b>cut off</b>.`,
        run: async (c) => {
          await line(c, P, T('0.75x-9=0')); await line(c, P, T('0.75x=9')); await line(c, P, T('x=12'), 'u5l5-big');
          const off = G.label(10, 0, 'x = 12 is out here →', { pos: 'nw', cls: 'u5l5-off', gap: 6 }); await fadeIn(c, off);
        } },
      { cap: `<b>The default window rarely shows every feature worth seeing.</b> Next: change the window.`,
        run: async (c) => { await stampIn(c, stamp(G.html, 'Cut off!', { ok: false, x: 250, y: 120 })); } }
    ];
  }
};

/* ======================================================================
   4. adjust — custom window, Zoom Out, ZoomFit
   ====================================================================== */
const adjust = {
  title: 'Three ways to change the window for y = 0.75x − 9',
  height: 440,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'custom', label: 'Custom window' }, { v: 'out', label: 'Zoom Out' }, { v: 'fit', label: 'ZoomFit' }],
  intro: (k) => ({ custom: 'Type the window you want.', out: 'Let the calculator zoom out.', fit: 'Let the calculator fit the curve.' }[k] + ' The x-intercept is cut off in the standard window. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const { G, L, K, P } = rig(stage, ex, STD, { title: 'The window' }), f = REL.run.f;
    G.fn(f); G.point(0, -9, { color: 'ink' });
    const wl = h('div', 'u5l5-pl u5l5-win', T(wTex(STD))); P.appendChild(wl);
    const setW = (w) => { wl.innerHTML = T(wTex(w)); };
    const both = async (c) => { await G.reveal(G.point(12, 0, { color: 'ink', label: T('(12,\\ 0)'), pos: 'n' }), c); };
    if (k === 'custom') return [
      { cap: `${kk('WINDOW')}: type ${T('X_{\\min}=-5')}, ${T('X_{\\max}=20')}, ${T('X_{scl}=5')}, ${T('Y_{\\min}=-15')}, ${T('Y_{\\max}=10')}, ${T('Y_{scl}=5')}.`,
        run: async (c) => {
          await K.set(c, ['WINDOW']); const w = { ...STD };
          L.show(winLines(w));
          for (const [i, key] of ['xmin', 'xmax', 'xscl', 'ymin', 'ymax', 'yscl'].entries()) { w[key] = WIDE[key]; L.show(winLines(w, [i + 1])); await sleep(c, 300); }
          L.show(winLines(WIDE)); setW(WIDE);
        } },
      { cap: `${kk('GRAPH')}: the view slides right and stretches to the new window.`, run: async (c) => { await K.set(c, ['GRAPH']); L.hide(); await G.setWindow(WIDE, c, 1300); } },
      { cap: `Both intercepts, ${T('(12,\\ 0)')} and ${T('(0,\\ -9)')}, are on screen with room around them. <b>You choose: usually the best.</b>`,
        run: async (c) => { await both(c); await stampIn(c, stamp(P, 'Best', { ok: true, cls: 'u5l5-pstamp' })); } }
    ];
    if (k === 'out') {
      const W4 = { xmin: -40, xmax: 40, ymin: -40, ymax: 40, xscl: 1, yscl: 1 };
      return [
        { cap: `${kk('ZOOM')} and choose <b>3:Zoom Out</b>, then ${kk('ENTER')} to zoom out from the centre.`, run: async (c) => { await K.set(c, ['ZOOM', '3', 'ENTER']); await pick(c, L, 'zoom', 2); } },
        { cap: `Each axis becomes <b>4 times</b> longer: ${T('x:[-40,\\ 40,\\ 1]')}, ${T('y:[-40,\\ 40,\\ 1]')}.`, run: async (c) => { L.hide(); setW(W4); await G.setWindow(W4, c, 1300); } },
        { cap: `${T('x=12')} is on screen now, but the line is squeezed into the middle and Xscl = 1 makes the axes look like rulers. <b>Fast, but rarely ideal.</b>`,
          run: async (c) => { await both(c); await stampIn(c, stamp(P, 'Rough', { ok: null, cls: 'u5l5-pstamp' })); } }
      ];
    }
    const lo = f(-10), hi = f(10), WF = { ...STD, ymin: lo, ymax: hi };
    return [
      { cap: `${kk('ZOOM', '0')}: <b>0:ZoomFit</b> is at the bottom of the ZOOM menu.`, run: async (c) => { await K.set(c, ['ZOOM', '0']); await pick(c, L, 'zoom', 9); } },
      { cap: `ZoomFit keeps x from −10 to 10 and fits y to the line: from ${T('0.75(-10)-9=' + lo)} to ${T('0.75(10)-9=' + hi)}.`,
        run: async (c) => { L.hide(); setW(WF); await G.setWindow(WF, c, 1300); } },
      { cap: `Now ${T('y=0')} is above ${T('Y_{\\max}')}, so the x-axis is <b>gone</b>, and ${T('x=12')} is still off to the right. ZoomFit fits <b>y only</b>.`,
        run: async (c) => { await stampIn(c, stamp(P, 'Not here', { ok: false, cls: 'u5l5-pstamp' })); } }
    ];
  }
};

/* ======================================================================
   5. table — TBLSET and TABLE, Ask mode, and the G-T split screen
   ====================================================================== */
const table = {
  title: 'The table of values for y = 0.75x − 9',
  height: 440,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'tbl', label: 'TBLSET & TABLE' }, { v: 'ask', label: 'Ask mode: x = 500' }, { v: 'gt', label: 'G-T split screen' }],
  intro: (k) => ({ tbl: 'Set up the table, then read it.', ask: 'One far-away input, typed straight in.', gt: 'The graph and the table side by side.' }[k] + ' Press <b>Next</b>.'),
  make(stage, k, ex) {
    const f = REL.run.f, rowsFrom = (a, n = 7) => Array.from({ length: n }, (_, i) => [a + i, f(a + i)]);
    if (k === 'gt') return gtSteps(stage, ex, f, rowsFrom);
    const { G, L, K, P } = rig(stage, ex, STD, { px: 610 });
    G.fn(f);
    if (k === 'tbl') {
      const diffs = [];
      const rowY = (i) => 26 + 8 + 38 + 36 * i; // top of row i on the stage (see .u5l5-tg)
      return [
        { cap: `${kk('2nd', 'WINDOW')} opens TBLSET. <b>TblStart = −3</b> is the first x; <b>ΔTbl = 1</b> is the step from one x to the next.`,
          run: async (c) => { await K.set(c, ['2nd', 'WINDOW']); L.show(tblset(-3, 1)); await pulse(c, L.ln(1), 1.06); await pulse(c, L.ln(2), 1.06); } },
        { cap: `${kk('2nd', 'GRAPH')} shows the TABLE: each x from −3 up, with its output y.`,
          run: async (c) => { await K.set(c, ['2nd', 'GRAPH']); const rows = rowsFrom(-3); for (let i = 0; i <= 7; i++) { L.html(tableHTML(rows.map((r, j) => (j < i ? r : [r[0], ''])), { bottom: 'X=-3', hl: 0 }), 'u5l5-tbl'); await sleep(c, 170); } } },
        { cap: `Each step of <b>+1</b> in x adds <b>+0.75</b> to y: the line rises 0.75 for every unit across.`,
          run: async (c) => { for (let i = 0; i < 6; i++) { const d = add(stage, h('div', 'u5l5-diff', '+0.75'), 540, rowY(i + 1) - 13); diffs.push(d); await pop(c, d, 200); } } },
        { cap: `${kk('▼')} scrolls down: the next row is x = 4, y = −6.`,
          run: async (c) => { await K.set(c, ['▼', '▼', '▼', '▼', '▼', '▼', '▼']); diffs.forEach((d) => d.remove()); L.html(tableHTML(rowsFrom(-2), { bottom: 'X=4', hl: 6 }), 'u5l5-tbl'); } },
        { cap: `Check that row: ${TW('y=0.75(4)-9=3-9=-6')} ✓`,
          run: async (c) => { await line(c, P, T('y=0.75(4)-9')); await line(c, P, T('=3-9')); await line(c, P, T('=-6') + ' ✓', 'u5l5-big'); } }
      ];
    }
    // Ask mode
    return [
      { cap: `In TBLSET (${kk('2nd', 'WINDOW')}), go down to <b>Indpnt</b> and choose <b>Ask</b>, ${kk('ENTER')}.`,
        run: async (c) => { await K.set(c, ['2nd', 'WINDOW', '▼', '▼', '▼', '▶', 'ENTER']); L.show(tblset(-3, 1, false)); await sleep(c, 450); L.show(tblset(-3, 1, true)); await pulse(c, L.ln(3).querySelector('.u5l5-inv'), 1.3); } },
      { cap: `${kk('2nd', 'GRAPH')}: the table starts <b>empty</b>, waiting for an x.`,
        run: async (c) => { await K.set(c, ['2nd', 'GRAPH']); L.html(tableHTML([], { bottom: 'X=' }), 'u5l5-tbl'); } },
      { cap: `Type ${kk('5', '0', '0')} ${kk('ENTER')}: y = <b>366</b>. Any x works, inside the window or not.`,
        run: async (c) => {
          let s = ''; await typeKeys(c, K, ['5', '0', '0'], (k2) => { s += k2; L.html(tableHTML([], { bottom: 'X=' + s }), 'u5l5-tbl'); });
          await K.set(c, ['ENTER'], true); L.html(tableHTML([[500, f(500)]], { bottom: 'Y1=366', hl: 0 }), 'u5l5-tbl');
        } },
      { cap: `Check: ${TW('y=0.75(500)-9=375-9=366')} ✓`,
        run: async (c) => { await line(c, P, T('y=0.75(500)-9')); await line(c, P, T('=375-9')); await line(c, P, T('=366') + ' ✓', 'u5l5-big'); } },
      { cap: `Type more inputs, in any order: ${T('x=-200')} gives ${T('y=-159')}.`,
        run: async (c) => { let s = ''; await typeKeys(c, K, ['(−)', '2', '0', '0', 'ENTER'], (k2) => { if (k2 !== 'ENTER') { s += k2 === '(−)' ? '−' : k2; L.html(tableHTML([[500, f(500)]], { bottom: 'X=' + s }), 'u5l5-tbl'); } }); L.html(tableHTML([[500, f(500)], [-200, f(-200)]], { bottom: 'Y1=-159', hl: 1 }), 'u5l5-tbl'); } }
    ];
  }
};
function gtSteps(stage, ex, f, rowsFrom) {
  const wrap = add(stage, box(h('div', 'u5l5-split'), 520, 330), 26, 26);
  const G = new Calc(wrap, { x: 0, y: 0, width: 314, height: 330, ...STD, cls: 'u5l5-flat' });
  const tb = add(wrap, box(h('div', 'u5l5-lcd u5l5-tbl u5l5-side'), 206, 330), 314, 0);
  const L = lcd(wrap), H = hud(G), K = new Keys(stage, 16, 380, 530), P = panel(stage, 572, 14, ex.W - 586, ex.def.height - 28, 'What you see');
  tb.style.display = 'none';
  let tr, start = -3;
  const showT = (hlX) => { tb.innerHTML = tableHTML(rowsFrom(start), { hl: hlX - start, bottom: 'X=' + calcNum(hlX) }); };
  return [
    { cap: `${kk('MODE')}, ${kk('▼')} to the last line, choose <b>G-T</b> (graph–table), ${kk('ENTER')}.`,
      run: async (c) => { await K.set(c, ['MODE', '▼', '▶', '▶', 'ENTER']); L.show(modeLines()); await sleep(c, 400); L.show(modeLines({ 7: 2 })); await pulse(c, L.ln(7).querySelector('.u5l5-inv'), 1.3); } },
    { cap: `${kk('GRAPH')}: the screen splits. Graph on the left, table on the right (TblStart = −3, ΔTbl = 1).`,
      run: async (c) => { await K.set(c, ['GRAPH']); L.hide(); tb.style.display = ''; tb.innerHTML = tableHTML(rowsFrom(-3), {}); await G.drawIn(G.fn(f), 800, c); await line(c, P, 'Graph and table of the <b>same</b> relation, at the same time.'); } },
    { cap: `${kk('TRACE')}: the cursor sits on the line at x = 0, and the table highlights the <b>same</b> point.`,
      run: async (c) => { await K.set(c, ['TRACE']); H.eq('Y1=0.75X-9'); tr = cursor(G, H, f, 0, ''); tr.quiet = true; H.bot(null); showT(0); await pop(c, tr.el); await line(c, P, T('x=0\\ \\rightarrow\\ y=-9')); } },
    { cap: `${kk('▶')} ${kk('▶')} ${kk('▶')}: the cursor walks along the line and the table follows, to x = 3, y = −6.75.`,
      run: async (c) => { await K.set(c, ['▶', '▶', '▶']); for (let x = 1; x <= 3; x++) { await tr.glide(c, x, 380); H.bot(null); showT(x); await sleep(c, 200); } await line(c, P, T('x=3\\ \\rightarrow\\ y=-6.75')); } },
    { cap: `${kk('▶')} once more: the table <b>scrolls</b> to keep up: x = 4, y = −6.`,
      run: async (c) => { await K.set(c, ['▶']); await tr.glide(c, 4, 380); H.bot(null); start = -2; showT(4); await line(c, P, T('x=4\\ \\rightarrow\\ y=-6')); } }
  ];
}

/* ======================================================================
   6. trace — an output from an input
   ====================================================================== */
const traceEx = {
  title: 'TRACE: type the x, read the y',
  height: 440,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'run', label: T('y=0.75x-9,\\ x=4') }, { v: 'ex1', label: 'Example 1 check: ' + T('x=4.2') }],
  intro: (k) => (k === 'run' ? `Find ${T('y')} when ${T('x=4')} for ${T('y=0.75x-9')}.` : `Example 1(b): ${T('y')} when ${T('x=4.2')} for ${T('y=4x-30')}.`) + ' Press <b>Next</b>.',
  make(stage, k, ex) {
    const R = k === 'run' ? REL.run : REL.ex1, win = R.win || STD, x0 = k === 'run' ? 4 : 4.2, y0 = R.f(x0);
    const { G, L, H, K, P } = rig(stage, ex, win);
    const span = win.xmax - win.xmin, mid = (win.xmin + win.xmax) / 2, ys = calcNum(y0);
    let tr;
    const sub = k === 'run' ? ['y=0.75(4)-9', '=3-9', '=-6'] : ['y=4(4.2)-30', '=16.8-30', '=-13.2'];
    return [
      { cap: `Graph ${T(R.t)} in the window ${T(wTex(win))}.`, run: async (c) => { await G.drawIn(G.fn(R.f), 800, c); } },
      { cap: `${kk('TRACE')}: a cursor appears on the graph in the <b>middle</b> of the screen, x = ${M(calcNum(mid))}, with its coordinates at the bottom.`,
        run: async (c) => { await K.set(c, ['TRACE']); H.eq('Y1=' + R.y1); tr = cursor(G, H, R.f, mid, ''); await pop(c, tr.el); } },
      { cap: `${kk('▶')} moves one <b>pixel</b>: x jumps by ${T(span + '\\div 94\\approx' + (span / 94).toFixed(3))}. The arrows never land exactly on ${T('x=' + x0)}.`,
        run: async (c) => { await K.set(c, ['▶', '▶', '▶']); await tr.steps(c, 3, 420); } },
      { cap: `Instead, just <b>type</b> the input: ${kk(...String(x0).split(''))}. The bottom line shows X=${x0}.`,
        run: async (c) => { let s = ''; await typeKeys(c, K, String(x0).split(''), (ch) => { s += ch; H.bot('', null, `<i>X=${s}</i>`); }); } },
      { cap: `${kk('ENTER')}: the cursor jumps to x = ${x0}. Read the output: <b>Y = ${M(ys)}</b>.`,
        run: async (c) => { await K.set(c, ['ENTER']); H.bot(null); await tr.glide(c, x0, 700); tr.show(); await pulse(c, H.el, 1.12); } },
      { cap: `Check algebraically: ${TW(sub.join(''))} ✓`,
        run: async (c) => { for (const s of sub) await line(c, P, T(s), s === sub[2] ? 'u5l5-big' : ''); await stampIn(c, stamp(P, '✓ Matches', { ok: true, cls: 'u5l5-pstamp' })); } }
    ];
  }
};

/* ======================================================================
   7. intersect — an input from an output
   ====================================================================== */
const intersectEx = {
  title: '5:intersect: set Y2 to the output, find the input',
  height: 440,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'run', label: T('y=0.75x-9,\\ y=-3') }, { v: 'ex1', label: 'Example 1 check: ' + T('y=-5.4') }],
  intro: (k) => (k === 'run' ? `Find ${T('x')} when ${T('y=-3')} for ${T('y=0.75x-9')}.` : `Example 1(d): ${T('x')} when ${T('y=-5.4')} for ${T('y=4x-30')}.`) + ' Press <b>Next</b>.',
  make(stage, k, ex) {
    const R = k === 'run' ? REL.run : REL.ex1, win = R.win || STD, yT = k === 'run' ? -3 : -5.4, g = () => yT;
    const { G, L, H, K, P } = rig(stage, ex, win), mid = G.mid;
    const it = G.intersect(R.f, g, mid), xg = snap(G, it.x + 3 * G.dx);
    const alg = k === 'run' ? ['-3=0.75x-9', '6=0.75x', 'x=8'] : ['-5.4=4x-30', '24.6=4x', 'x=6.15'];
    let tr;
    const y2 = M(String(yT));
    return [
      { cap: `${kk('Y=')}: the relation in <b>Y1</b>, the given output in <b>Y2 = ${y2}</b>.`,
        run: async (c) => { await K.set(c, ['Y=']); L.show(yEditor([R.y1, String(yT)])); await pulse(c, L.ln(2), 1.08); } },
      { cap: `${kk('GRAPH')}: the relation, and Y2 as a horizontal line at ${T('y=' + yT)}.`,
        run: async (c) => { await K.set(c, ['GRAPH']); L.hide(); await G.drawIn(G.fn(R.f), 700, c); await G.drawIn(G.fn(g, { color: 'red' }), 600, c); } },
      { cap: `${kk('2nd', 'TRACE')} opens CALC; choose <b>5:intersect</b>.`, run: async (c) => { await K.set(c, ['2nd', 'TRACE', '5']); await pick(c, L, 'calc', 4); L.hide(); } },
      { cap: `<b>First curve?</b> The cursor is on Y1: ${kk('ENTER')}.`,
        run: async (c) => { await K.set(c, ['ENTER']); H.eq('Y1=' + R.y1); tr = cursor(G, H, R.f, mid, 'First curve?'); await pop(c, tr.el); } },
      { cap: `<b>Second curve?</b> It jumps to Y2: ${kk('ENTER')}.`,
        run: async (c) => { await K.set(c, ['ENTER']); tr.remove(); H.eq('Y2=' + yT); tr = cursor(G, H, g, mid, 'Second curve?'); await pop(c, tr.el); } },
      { cap: `<b>Guess?</b> Move close to the crossing (${kk('▶')}), then ${kk('ENTER')}.`,
        run: async (c) => { await K.set(c, ['▶', '▶', '▶', 'ENTER']); tr.title = 'Guess?'; await tr.glide(c, xg, 1000); } },
      { cap: `<b>Intersection</b> X = ${M(calcNum(it.x))}, Y = ${y2}. So ${T('x=' + texNum(it.x))} when ${T('y=' + yT)}.`,
        run: async (c) => { tr.remove(); await G.reveal(G.point(it.x, it.y, { color: 'ink', r: 7, label: T(`(${texNum(it.x)},\\ ${yT})`), pos: 'se' }), c); H.bot('Intersection', it); await pulse(c, H.el, 1.12); } },
      { cap: `Check algebraically: ${TW(alg.join('\\ \\Rightarrow\\ '))} ✓`,
        run: async (c) => { for (const s of alg) await line(c, P, T(s), s === alg[2] ? 'u5l5-big' : ''); await stampIn(c, stamp(P, '✓ Matches', { ok: true, cls: 'u5l5-pstamp' })); } }
    ];
  }
};

/* ======================================================================
   8. inside — stay inside the window
   ====================================================================== */
const inside = {
  title: 'Stay inside the window',
  height: 440,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'tr', label: 'TRACE ' + T('x=15') }, { v: 'val', label: '1:value ' + T('x=500') }, { v: 'int', label: 'intersect ' + T('y=3') }],
  intro: (k) => ({ tr: `${T('y=0.75x-9')} in the standard window. Find ${T('y')} when ${T('x=15')}.`, val: `Find ${T('y')} when ${T('x=500')} with 1:value.`, int: `Find ${T('x')} when ${T('y=3')}.` }[k] + ' Press <b>Next</b>.'),
  make(stage, k, ex) {
    const { G, L, H, K, P } = rig(stage, ex, STD), f = REL.run.f;
    G.fn(f);
    const err = async (c) => { L.show(errLines, 'u5l5-err'); await shake(c, L.el); await line(c, P, '<b class="red">ERR:INVALID</b>: x is outside the window.'); };
    let tr;
    if (k === 'tr') return [
      { cap: `${kk('TRACE')}, then type ${kk('1', '5')}. But ${T('X_{\\max}=10')}…`,
        run: async (c) => { H.eq('Y1=0.75X-9'); tr = cursor(G, H, f, 0, ''); let s = ''; await typeKeys(c, K, ['TRACE', '1', '5'], (ch) => { if (ch !== 'TRACE') { s += ch; H.bot('', null, `<i>X=${s}</i>`); } }); } },
      { cap: `${kk('ENTER')}: <b>ERR:INVALID</b>. ${T('x=15')} is outside the window, so trace refuses it.`, run: async (c) => { await K.set(c, ['ENTER']); await err(c); } },
      { cap: `Fix: <b>widen the window</b>. ${kk('WINDOW')}: ${T('x:[-5,\\ 20,\\ 5]')}, ${T('y:[-15,\\ 10,\\ 5]')}, then ${kk('GRAPH')}.`,
        run: async (c) => { await K.set(c, ['ENTER', 'WINDOW', 'GRAPH']); L.show(winLines(WIDE)); await sleep(c, 500); L.hide(); tr.remove(); H.eq(null); H.bot(null); await G.setWindow(WIDE, c, 1200); } },
      { cap: `${kk('TRACE')} ${kk('1', '5')} ${kk('ENTER')} works now: <b>Y = 2.25</b>.`,
        run: async (c) => { await K.set(c, ['TRACE', '1', '5', 'ENTER']); H.eq('Y1=0.75X-9'); tr = cursor(G, H, f, G.mid, ''); await tr.glide(c, 15, 800); await pulse(c, H.el, 1.12); } },
      { cap: `Check: ${TW('y=0.75(15)-9=11.25-9=2.25')} ✓`,
        run: async (c) => { await line(c, P, T('y=0.75(15)-9')); await line(c, P, T('=11.25-9=2.25') + ' ✓', 'u5l5-big'); } }
    ];
    if (k === 'val') return [
      { cap: `${kk('2nd', 'TRACE')}, <b>1:value</b>, then type ${kk('5', '0', '0')}.`,
        run: async (c) => { await K.set(c, ['2nd', 'TRACE', '1']); await pick(c, L, 'calc', 0); L.hide(); H.eq('Y1=0.75X-9'); let s = ''; await typeKeys(c, K, ['5', '0', '0'], (ch) => { s += ch; H.bot('', null, `<i>X=${s}</i>`); }); } },
      { cap: `${kk('ENTER')}: <b>ERR:INVALID</b>. And a window wide enough to reach 500 would squash the whole graph.`, run: async (c) => { await K.set(c, ['ENTER']); H.bot(null); H.eq(null); await err(c); } },
      { cap: `Better: the <b>table in Ask mode</b>. ${kk('2nd', 'GRAPH')}, type ${kk('5', '0', '0')} ${kk('ENTER')}: <b>y = 366</b>.`,
        run: async (c) => { await K.set(c, ['2nd', 'GRAPH', '5', '0', '0', 'ENTER']); L.html(tableHTML([[500, f(500)]], { bottom: 'Y1=366', hl: 0 }), 'u5l5-tbl'); await line(c, P, 'The table works for <b>any</b> input.'); } },
      { cap: `Check: ${TW('y=0.75(500)-9=375-9=366')} ✓`, run: async (c) => { await line(c, P, T('0.75(500)-9=366') + ' ✓', 'u5l5-big'); } }
    ];
    const g = () => 3, it = intersect(f, g, 10); let off;
    return [
      { cap: `${kk('Y=')}: Y2 = 3. ${kk('GRAPH')}: the horizontal line at ${T('y=3')}.`,
        run: async (c) => { await K.set(c, ['Y=', '3', 'GRAPH']); await G.drawIn(G.fn(g, { color: 'red' }), 600, c); } },
      { cap: `They don’t meet on screen: ${T('3=0.75x-9')} gives ${T('x=16')}, past ${T('X_{\\max}=10')}. The cursor <b>stops at the edge</b>, so intersect can’t reach it.`,
        run: async (c) => {
          await K.set(c, ['2nd', 'TRACE', '5', '▶', '▶', '▶']); H.eq('Y2=3'); tr = cursor(G, H, g, 0, 'Guess?'); await tr.glide(c, 10, 1000); await shake(c, H.el);
          off = G.label(10, 3, 'they meet out here →', { pos: 'nw', cls: 'u5l5-off', gap: 8 }); await fadeIn(c, off);
        } },
      { cap: `Widen the window to ${T('x:[-5,\\ 20,\\ 5]')}, ${T('y:[-15,\\ 10,\\ 5]')}: now the crossing is visible.`,
        run: async (c) => { await K.set(c, ['WINDOW', 'GRAPH']); tr.remove(); if (off) off.remove(); H.eq(null); H.bot(null); await G.setWindow(WIDE, c, 1200); } },
      { cap: `<b>5:intersect</b> (First curve?, Second curve?, Guess?) finds <b>(16, 3)</b>: ${T('x=16')} when ${T('y=3')}.`,
        run: async (c) => { await K.set(c, ['2nd', 'TRACE', '5', 'ENTER', 'ENTER', 'ENTER']); await G.reveal(G.point(it.x, it.y, { color: 'ink', r: 7, label: T('(16,\\ 3)'), pos: 'nw' }), c); H.bot('Intersection', it); } },
      { cap: `Check: ${TW('3=0.75x-9\\ \\Rightarrow\\ 12=0.75x\\ \\Rightarrow\\ x=16')} ✓`,
        run: async (c) => { await line(c, P, T('3=0.75x-9')); await line(c, P, T('12=0.75x')); await line(c, P, T('x=16') + ' ✓', 'u5l5-big'); } }
    ];
  }
};

/* ======================================================================
   9. zero — x-intercepts
   ====================================================================== */
const ZERO = {
  run: { R: REL.run, win: WIDE, alg: ['0.75x-9=0', '0.75x=9', 'x=12'] },
  ex2a: { R: REL.ex2a, win: STD, alg: ['\\tfrac{7x+21}{3}=0', '7x+21=0', 'x=-3'] },
  ex2b: { R: REL.ex2b, win: STD, alg: ['-x^2+2x+8=0', 'x^2-2x-8=0', '(x-4)(x+2)=0', 'x=4\\ \\text{or}\\ x=-2'] }
};
const zeroEx = {
  title: '2:zero finds the x-intercepts',
  height: 450,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'run', label: T('y=0.75x-9') }, { v: 'ex2a', label: 'Example 2(a) check' }, { v: 'ex2b', label: 'Example 2(b) check' }],
  intro: (k) => `Find the x-intercept${k === 'ex2b' ? 's' : ''} of ${T(ZERO[k].R.t)}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const Z = ZERO[k], R = Z.R, { G, L, H, K, P } = rig(stage, ex, Z.win);
    const span = Z.win.xmax - Z.win.xmin, d = snap(G, G.mid + (k === 'ex2b' ? 0.05 : 0.1) * span) - G.mid;
    const zs = k === 'ex2b' ? [G.zero(R.f, -5, 1), G.zero(R.f, 1, 7)] : [G.zero(R.f, Z.win.xmin, Z.win.xmax)];
    let tr; const bl = [];
    const steps = [
      { cap: `Graph ${T(R.t)} in ${T(wTex(Z.win))}.`, run: async (c) => { await G.drawIn(G.fn(R.f), 800, c); } },
      { cap: `${kk('2nd', 'TRACE')} opens CALC; choose <b>2:zero</b>.`, run: async (c) => { await K.set(c, ['2nd', 'TRACE', '2']); await pick(c, L, 'calc', 1); L.hide(); } }
    ];
    zs.forEach((z, i) => {
      const lb = snap(G, z - d), rb = snap(G, z + d), gs = snap(G, z + G.dx * 2);
      const pre = i ? 'The other crossing: <b>2:zero</b> again. ' : '';
      if (!i) {
        steps.push(
          { cap: `<b>Left Bound?</b> Move the cursor to the <b>left</b> of the crossing, ${kk('ENTER')}. A ▸ marks the bound.`,
            run: async (c) => { await K.set(c, ['◀', '◀', 'ENTER']); H.eq('Y1=' + R.y1); tr = cursor(G, H, R.f, G.mid, 'Left Bound?'); await pop(c, tr.el); await tr.glide(c, lb, 900); bl.push(bound(G, lb, 1)); await pop(c, bl[bl.length - 1]); } },
          { cap: `<b>Right Bound?</b> Move to the <b>right</b> of the crossing, ${kk('ENTER')}: ◂.`,
            run: async (c) => { await K.set(c, ['▶', '▶', 'ENTER']); tr.title = 'Right Bound?'; await tr.glide(c, rb, 900); bl.push(bound(G, rb, -1)); await pop(c, bl[bl.length - 1]); } },
          { cap: `<b>Guess?</b> Close to the crossing, ${kk('ENTER')}.`,
            run: async (c) => { await K.set(c, ['◀', 'ENTER']); tr.title = 'Guess?'; await tr.glide(c, gs, 700); } });
      } else {
        steps.push({ cap: `${pre}<b>Left Bound?</b> and <b>Right Bound?</b> on either side of it, then <b>Guess?</b>`,
          run: async (c) => {
            await K.set(c, ['2nd', 'TRACE', '2', 'ENTER', 'ENTER', 'ENTER']); bl.forEach((b) => b.remove());
            tr = cursor(G, H, R.f, zs[0], 'Left Bound?'); await tr.glide(c, lb, 700); bl.push(bound(G, lb, 1)); await pop(c, bl[bl.length - 1]);
            tr.title = 'Right Bound?'; await tr.glide(c, rb, 700); bl.push(bound(G, rb, -1)); await pop(c, bl[bl.length - 1]);
            tr.title = 'Guess?'; await tr.glide(c, gs, 500);
          } });
      }
      steps.push({ cap: `<b>Zero</b> X = ${M(calcNum(z))}, Y = 0: the x-intercept ${T(`(${texNum(z)},\\ 0)`)}.`,
        run: async (c) => { tr.remove(); await G.reveal(G.point(z, 0, { color: 'ink', r: 7, label: T(`(${texNum(z)},\\ 0)`), pos: z < G.mid ? 'nw' : 'ne' }), c); H.bot('Zero', { x: z, y: 0 }); await pulse(c, H.el, 1.12); } });
    });
    steps.push({ cap: `Check algebraically: set ${T('y=0')}. ${TW(Z.alg.join('\\ \\Rightarrow\\ '))} ✓`,
      run: async (c) => { for (const s of Z.alg) await line(c, P, T(s), s === Z.alg[Z.alg.length - 1] ? 'u5l5-big' : ''); } });
    steps.push({ cap: `Or: set <b>Y2 = 0</b> (that is the x-axis) and use <b>5:intersect</b>. It lands on the same point${zs.length > 1 ? 's' : ''}.`,
      run: async (c) => { bl.forEach((b) => b.remove()); H.bot(null); H.eq('Y2=0'); await G.drawIn(G.fn(() => 0, { color: 'red', width: 4 }), 800, c); await stampIn(c, stamp(P, '✓ Same answer', { ok: true, cls: 'u5l5-pstamp' })); } });
    return steps;
  }
};

/* ======================================================================
   10. yint — the y-intercept three ways
   ====================================================================== */
const YI = { run: REL.run, ex2a: REL.ex2a, ex2b: REL.ex2b };
const yintEx = {
  title: 'The y-intercept: the output when x = 0',
  height: 440,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'run', label: T('y=0.75x-9') }, { v: 'ex2a', label: 'Example 2(a) check' }, { v: 'ex2b', label: 'Example 2(b) check' }],
  intro: (k) => `Three ways to read the y-intercept of ${T(YI[k].t)}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const R = YI[k], { G, L, H, K, P } = rig(stage, ex, STD, { title: 'Three ways, one answer' }), b = R.f(0), bs = texNum(b);
    const tiles = ['Trace', 'Value', 'Table'].map((t) => { const d = h('div', 'u5l5-way', `<b>${t}</b><i class="u5l5-wv">?</i>`); P.appendChild(d); return d; });
    const fill = async (c, i) => { tiles[i].querySelector('.u5l5-wv').innerHTML = T(`(0,\\ ${bs})`); tiles[i].classList.add('on'); await pulse(c, tiles[i], 1.05); };
    let tr;
    const sub = k === 'run' ? '0.75(0)-9=-9' : k === 'ex2a' ? '\\tfrac{7(0)+21}{3}=\\tfrac{21}{3}=7' : '-(0)^2+2(0)+8=8';
    return [
      { cap: `Graph ${T(R.t)} in the standard window.`, run: async (c) => { await G.drawIn(G.fn(R.f), 800, c); } },
      { cap: `<b>Trace:</b> ${kk('TRACE', '0', 'ENTER')}: X = 0, Y = ${M(bs)}.`,
        run: async (c) => { await K.set(c, ['TRACE', '0', 'ENTER']); H.eq('Y1=' + R.y1); tr = cursor(G, H, R.f, 0, ''); await pop(c, tr.el); await fill(c, 0); } },
      { cap: `<b>Value:</b> ${kk('2nd', 'TRACE')}, <b>1:value</b>, type ${kk('0')}, ${kk('ENTER')}: the same point.`,
        run: async (c) => {
          await K.set(c, ['2nd', 'TRACE', '1']); tr.remove(); H.bot(null); await pick(c, L, 'calc', 0); L.hide(); H.bot('', null, '<i>X=0</i>');
          await K.set(c, ['0', 'ENTER'], true); tr = cursor(G, H, R.f, 0, ''); await pop(c, tr.el); await fill(c, 1);
        } },
      { cap: `<b>Table:</b> TblStart = 0. The first row is x = 0, y = ${M(bs)}.`,
        run: async (c) => { await K.set(c, ['2nd', 'GRAPH']); L.html(tableHTML(Array.from({ length: 7 }, (_, i) => [i, R.f(i)]), { bottom: 'X=0', hl: 0 }), 'u5l5-tbl'); await fill(c, 2); } },
      { cap: `Three ways, one answer: the y-intercept is ${T(`(0,\\ ${bs})`)}. Check: ${TW(sub)} ✓`,
        run: async (c) => { L.hide(); tr.remove(); H.bot(null); H.eq(null); await G.reveal(G.point(0, b, { color: 'ink', r: 7, label: T(`(0,\\ ${bs})`), pos: 'e' }), c); await line(c, P, T(sub) + ' ✓', 'u5l5-big'); } }
    ];
  }
};

/* ======================================================================
   11. frac — decimal intercept to an exact fraction
   ====================================================================== */
const FR = {
  ex3: { R: REL.ex3, zs: '4.3333333', xf: '13/3', yv: -1.625, ys: '-1.625', yf: '-13/8', xt: '\\tfrac{13}{3}', yt: '-\\tfrac{13}{8}', back: ['13/3', '4.333333333'], backT: '\\tfrac{13}{3}=4.333333333', backK: ['1', '3', '÷', '3', 'ENTER'] },
  fr2: { R: REL.fr2, zs: '-3.5', xf: '-7/2', yv: 7 / 6, ys: '1.1666667', yf: '7/6', xt: '-\\tfrac{7}{2}', yt: '\\tfrac{7}{6}', back: ['-7/2', '-3.5'], backT: '-\\tfrac{7}{2}=-3.5', backK: ['(−)', '7', '÷', '2', 'ENTER'] }
};
const fracEx = {
  title: 'Exact intercepts: ▸Frac on the home screen',
  height: 450,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ex3', label: 'Example 3 check' }, { v: 'fr2', label: T('y=\\frac{2x+7}{6}') }],
  intro: (k) => `Exact intercepts of ${T(FR[k].R.t)}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const F = FR[k], R = F.R, { G, L, H, K, P } = rig(stage, ex, R.win, { title: 'Exact values' });
    const z = G.zero(R.f, R.win.xmin, R.win.xmax), home = [];
    const showHome = () => L.html(homeHTML(home), 'u5l5-home');
    return [
      { cap: `Graph ${T(R.t)} in ${T(wTex(R.win))}.`, run: async (c) => { await G.drawIn(G.fn(R.f), 800, c); } },
      { cap: `<b>2:zero</b> (Left Bound?, Right Bound?, Guess?) gives <b>X = ${M(F.zs)}</b>${k === 'ex3' ? ': a repeating decimal' : ''}.`,
        run: async (c) => { await K.set(c, ['2nd', 'TRACE', '2', 'ENTER', 'ENTER', 'ENTER']); H.eq('Y1=' + R.y1); await G.reveal(G.point(z, 0, { color: 'ink', r: 7 }), c); H.bot('Zero', { xs: F.zs, ys: '0' }); } },
      { cap: `${kk('2nd', 'QUIT')} (QUIT is above ${kk('MODE')}) goes to the <b>home screen</b>.`, run: async (c) => { await K.set(c, ['2nd', 'QUIT']); home.length = 0; showHome(); L.el.innerHTML += CUR; } },
      { cap: `${kk('X,T,θ,n')} types <b>X</b>, the last x the cursor sat on. ${kk('MATH')} ${kk('ENTER')} picks <b>1:▸Frac</b>.`,
        run: async (c) => { await K.set(c, ['X,T,θ,n', 'MATH']); home.push({ t: 'X' }); showHome(); await sleep(c, 300); await pick(c, L, 'math', 0); await K.set(c, ['ENTER'], true); home[0] = { t: 'X▸Frac' }; showHome(); } },
      { cap: `${kk('ENTER')}: <b>${M(F.xf)}</b>, exactly.`,
        run: async (c) => { await K.set(c, ['ENTER']); home.push({ t: F.xf, r: true }); showHome(); await pulse(c, L.ln(1), 1.15); await line(c, P, `x-intercept: ${T(`\\left(${F.xt},\\ 0\\right)`)}`, 'u5l5-big'); } },
      { cap: `Check the conversion: divide it back out, ${T(F.backT)}${k === 'ex3' ? ', the same repeating decimal' : ''} ✓`,
        run: async (c) => { await K.set(c, F.backK); home.push({ t: F.back[0] }, { t: F.back[1], r: true }); showHome(); } },
      { cap: `y-intercept: <b>1:value</b> at x = 0 gives <b>Y = ${M(F.ys)}</b>.`,
        run: async (c) => { await K.set(c, ['GRAPH', '2nd', 'TRACE', '1', '0', 'ENTER']); L.hide(); await G.reveal(G.point(0, F.yv, { color: 'ink', r: 7 }), c); H.bot('', { xs: '0', ys: F.ys }); } },
      { cap: `${kk('2nd', 'QUIT')}, then ${kk('ALPHA', '1')} types <b>Y</b>; ${kk('MATH', 'ENTER', 'ENTER')}: <b>${M(F.yf)}</b>.`,
        run: async (c) => { await K.set(c, ['2nd', 'QUIT', 'ALPHA', '1', 'MATH', 'ENTER', 'ENTER']); home.push({ t: 'Y▸Frac' }, { t: F.yf, r: true }); showHome(); await pulse(c, L.ln(home.length - 1), 1.15); await line(c, P, `y-intercept: ${T(`\\left(0,\\ ${F.yt}\\right)`)}`, 'u5l5-big'); } }
    ];
  }
};

/* ======================================================================
   12. maxmin — the vertex
   ====================================================================== */
const MX = {
  ex4: { R: REL.ex4, max: true, xs: '3.4999986', xr: 3.5, sub: ['-(3.5)^2+7(3.5)+12', '=-12.25+24.5+12', '=24.25'], near: 'x=3.4\\ \\text{and}\\ x=3.6\\ \\text{give}\\ 24.24' },
  mn: { R: REL.mn, max: false, xs: '0.9999986', xr: 1, sub: ['(1)^2-2(1)-3', '=1-2-3', '=-4'], near: 'x=0.9\\ \\text{and}\\ x=1.1\\ \\text{give}\\ -3.99' }
};
const maxminEx = {
  title: 'The vertex with 4:maximum or 3:minimum',
  height: 450,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ex4', label: 'Example 4 check: maximum' }, { v: 'mn', label: '3:minimum ' + T('y=x^2-2x-3') }],
  intro: (k) => `Find the ${MX[k].max ? 'maximum' : 'minimum'} point of ${T(MX[k].R.t)}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const X = MX[k], R = X.R, win = R.win || STD, { G, L, H, K, P } = rig(stage, ex, win);
    const v = G.extremum(R.f, win.xmin, win.xmax, { max: X.max }), word = X.max ? 'maximum' : 'minimum', top = X.max ? 'top' : 'bottom';
    const span = win.xmax - win.xmin, d = snap(G, G.mid + 0.13 * span) - G.mid, lb = snap(G, v.x - d), rb = snap(G, v.x + d), gs = snap(G, v.x - 2 * G.dx);
    const ys = calcNum(R.f(X.xr)); let tr; const bl = [];
    const steps = [
      { cap: `Graph ${T(R.t)} in ${T(wTex(win))}. It opens <b>${X.max ? 'down' : 'up'}</b>, so its vertex is a <b>${word}</b>.`, run: async (c) => { await G.drawIn(G.fn(R.f), 900, c); } },
      { cap: `${kk('2nd', 'TRACE')} opens CALC; choose <b>${X.max ? '4:maximum' : '3:minimum'}</b>.`, run: async (c) => { await K.set(c, ['2nd', 'TRACE', X.max ? '4' : '3']); await pick(c, L, 'calc', X.max ? 3 : 2); L.hide(); } },
      { cap: `<b>Left Bound?</b> Left of the ${top}, ${kk('ENTER')}.`,
        run: async (c) => { await K.set(c, ['◀', '◀', 'ENTER']); H.eq('Y1=' + R.y1); tr = cursor(G, H, R.f, G.mid, 'Left Bound?'); await pop(c, tr.el); await tr.glide(c, lb, 900); bl.push(bound(G, lb, 1)); await pop(c, bl[0]); } },
      { cap: `<b>Right Bound?</b> Right of the ${top}, ${kk('ENTER')}.`,
        run: async (c) => { await K.set(c, ['▶', '▶', 'ENTER']); tr.title = 'Right Bound?'; await tr.glide(c, rb, 1000); bl.push(bound(G, rb, -1)); await pop(c, bl[1]); } },
      { cap: `<b>Guess?</b> Near the ${top}, ${kk('ENTER')}.`, run: async (c) => { await K.set(c, ['◀', 'ENTER']); tr.title = 'Guess?'; await tr.glide(c, gs, 800); } },
      { cap: `<b>${X.max ? 'Maximum' : 'Minimum'}</b> X = ${X.xs}, Y = ${M(ys)}. The x is a hair off: the calculator <b>searches</b> for the ${top}, it doesn’t solve exactly.`,
        run: async (c) => { tr.remove(); await G.reveal(G.point(v.x, v.y, { color: 'ink', r: 7 }), c); H.bot(X.max ? 'Maximum' : 'Minimum', { xs: X.xs, ys }); await pulse(c, H.el, 1.12); } },
      { cap: `Round to ${T('x=' + X.xr)} and <b>check by substituting</b>: ${T('y=' + X.sub.join(''))} ✓ Nearby inputs give ${X.max ? 'less' : 'more'}: ${T(X.near)}.`,
        run: async (c) => { await line(c, P, T('x\\approx' + X.xs + '\\ \\rightarrow\\ x=' + X.xr)); for (const s of X.sub) await line(c, P, T((s[0] === '=' ? '' : 'y=') + s)); await line(c, P, T(X.near), 'u5l5-small'); } }
    ];
    if (X.max) steps.push({ cap: `Exact values: on the home screen, <b>3.5 ▸Frac</b> gives <b>7/2</b> and <b>24.25 ▸Frac</b> gives <b>97/4</b>. Maximum point ${T('\\left(\\tfrac{7}{2},\\ \\tfrac{97}{4}\\right)')}.`,
      run: async (c) => { await K.set(c, ['2nd', 'QUIT', '3', '.', '5', 'MATH', 'ENTER', 'ENTER']); L.html(homeHTML([{ t: '3.5▸Frac' }, { t: '7/2', r: true }, { t: '24.25▸Frac' }, { t: '97/4', r: true }]), 'u5l5-home'); await line(c, P, T('\\left(\\tfrac{7}{2},\\ \\tfrac{97}{4}\\right)'), 'u5l5-big'); } });
    else steps.push({ cap: `Whole numbers already: the minimum point is ${T('(1,\\ -4)')}.`,
      run: async (c) => { bl.forEach((b) => b.remove()); await G.reveal(G.label(1, -4, T('(1,\\ -4)'), { pos: 'e', cls: 'bk-ptlab', gap: 12 }), c); await line(c, P, T('(1,\\ -4)'), 'u5l5-big'); } });
    return steps;
  }
};

/* ============ warm-up: Zoom and Enhance ============ */
function mountWarm() {
  const q = (s) => document.querySelector(s);
  const A = q('[data-wu="A"]'), B = q('[data-wu="B"]'), Cf = q('[data-wu="C"]'); if (!A || !B || !Cf) return;
  const cw = parseFloat(getComputedStyle(A).getPropertyValue('--calc-w')) || 290; // CSS can shrink the screens (one-screen pages)
  const sq = (x) => x * x, p2 = (x) => 2 ** x, size = { width: cw, height: Math.round(cw * 196 / 290) };
  new Calc(A, { ...size, ...STD }).fn(sq);
  new Calc(B, { ...size, xmin: 0.95, xmax: 1.05, ymin: 0.88, ymax: 1.12 }).fn(sq);
  const C = new Calc(Cf, { ...size, ...STD });
  C.fn(sq); C.fn(p2, { color: 'red' });
  const winEl = q('.u5l5-wwin'), fig = Cf.closest('figure');
  const setWin = (w) => { winEl.innerHTML = `${T(`x:[${w.xmin},\\ ${w.xmax}]`)}, ${T(`y:[${w.ymin},\\ ${w.ymax}]`)}`; fig.classList.toggle('u5l5-zo', w.xmax > 20); };
  let marks = null;
  const W = { out: { xmin: -40, xmax: 40, ymin: -40, ymax: 40 }, custom: { xmin: -5, xmax: 5, ymin: -5, ymax: 20, xscl: 1, yscl: 5 }, std: { ...STD } };
  document.querySelectorAll('[data-wz]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.wz;
    if (k === 'mark') {
      if (marks) return;
      marks = [[-1, 'nw'], [2, 'se'], [4, 'w']].map(([g, pos]) => { const r = intersect(sq, p2, g); return C.point(r.x, r.y, { color: 'ink', r: 5, label: T(`(${texNum(r.x, 2)},\\ ${texNum(r.y, 2)})`), pos }); });
      const c = liveCtx(); marks.forEach((m) => C.reveal(m, c)); return;
    }
    const w = Object.assign({ xscl: 1, yscl: 1 }, W[k]); setWin(w); C.setWindow(w, liveCtx(), 900);
  }));
}

/* ============ static figures in the examples ============ */
function mountFigures() {
  const fig = (k) => document.querySelector(`[data-fig="${k}"]`);
  const pt = (G, x, y, lab, pos) => G.point(x, y, { color: 'red', label: T(lab), pos });
  let G;
  if (fig('ex1')) { G = new Graph(fig('ex1'), { width: 270, height: 290, xmin: -2, xmax: 11, ymin: -35, ymax: 15, ystep: 5, xlabels: 2, ylabels: 10, fontSize: 15 }); G.fn(REL.ex1.f, { color: 'ink' }); pt(G, 7.5, 0, '(7.5,\\ 0)', 'nw'); pt(G, 0, -30, '(0,\\ -30)', 'se'); }
  if (fig('ex2a')) { G = new Graph(fig('ex2a'), { width: 230, height: 270, xmin: -7, xmax: 4, ymin: -8, ymax: 16, ystep: 2, xlabels: 2, ylabels: 4, fontSize: 15 }); G.fn(REL.ex2a.f, { color: 'ink' }); pt(G, -3, 0, '(-3,\\ 0)', 'se'); pt(G, 0, 7, '(0,\\ 7)', 'se'); }
  if (fig('ex2b')) { G = new Graph(fig('ex2b'), { width: 230, height: 270, xmin: -5, xmax: 7, ymin: -12, ymax: 12, ystep: 2, xlabels: 2, ylabels: 4, fontSize: 15 }); G.fn(REL.ex2b.f, { color: 'ink' }); pt(G, -2, 0, '(-2,\\ 0)', 'nw'); pt(G, 4, 0, '(4,\\ 0)', 'ne'); pt(G, 0, 8, '(0,\\ 8)', 'nw'); }
  if (fig('ex3')) { G = new Graph(fig('ex3'), { width: 560, height: 240, xmin: -3, xmax: 11, ymin: -3, ymax: 3, fontSize: 15 }); G.fn(REL.ex3.f, { color: 'ink' }); pt(G, 13 / 3, 0, '\\left(\\tfrac{13}{3},\\ 0\\right)', 'se'); pt(G, 0, -13 / 8, '\\left(0,\\ -\\tfrac{13}{8}\\right)', 'se'); }
  if (fig('ex4')) { G = new Graph(fig('ex4'), { width: 420, height: 300, xmin: -3, xmax: 10, ymin: -10, ymax: 30, ystep: 5, ylabels: 10, fontSize: 15 }); G.fn(REL.ex4.f, { color: 'ink' }); pt(G, 3.5, 24.25, '\\left(\\tfrac{7}{2},\\ \\tfrac{97}{4}\\right)', 'e'); }
  document.querySelectorAll('[data-blank]').forEach((el) => new Graph(el, { width: 230, height: 230, xmin: -6, xmax: 6, ymin: -6, ymax: 6, grid: false, numbers: false }));
}

mountWarm(); mountFigures();
mountExplainers({ setup, window: windowEx, graphIt, adjust, table, trace: traceEx, intersect: intersectEx, inside, zero: zeroEx, yint: yintEx, frac: fracEx, maxmin: maxminEx });
