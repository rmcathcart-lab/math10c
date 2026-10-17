/* Math 10C · Unit 7 · Lesson 6 — Slope in Context: Interpreting Rates of Change.
 * Warm-up growth tiles + same-units bar race, the example figures, and the explainers:
 *   sync (a story and its graph move together: a cyclist rides up a road / an oven thermometer climbs beside the vertical
 *   axis; slope triangle with units; one-unit steps; the rate sentence — Example 1), sentence (the four blanks of a rate
 *   sentence filled from the sign, the size and the two axis titles), van (the van drives along the D-axis while its tank
 *   drains beside the N-axis; slope, then b by driving back to D = 0; the equation's parts tied to the story; check;
 *   where it runs dry — Example 2), routes (substitute into y = mx + b vs slope–point form, side by side — Examples 2, 4c),
 *   parts (change the story: b slides the line, m tilts it — van, Maria, hair), trip (Example 3: the car drives up the
 *   road with a speedometer; each leg's slope triangle; the whole-trip secant; a ghost car at the average speed ties),
 *   secant (average rate of change on a curve: a car pulling away, tea cooling), pay (Example 4: Maria's pay stack —
 *   base + commission — beside the E-axis; slope = commission rate; slide back to S = 0 for the base; part d),
 *   machine (the equation as a machine, run forwards and backwards — Example 4d, van, oven).
 * Colours: run amber, rise purple, lines blue; slope m blue, vertical intercept b teal; moving "now" dot orange. */
import {
  h, tex, add, box, Graph, stamp, stampIn, mountExplainers, pop, fadeIn, appear, tween, linear,
  pairTex, texNum, svgEl, place, drawIn, pulse, fmt, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const RUN = COLORS.amber, RISE = COLORS.purple, LINE = COLORS.blue, BCOL = COLORS.teal, INK = COLORS.ink, GRAY = COLORS.gray,
  RED = COLORS.red, GRN = COLORS.green, NOW = COLORS.orange;
const cR = (s) => `\\textcolor{${RISE}}{${s}}`, cU = (s) => `\\textcolor{${RUN}}{${s}}`;
const cM = (s) => `\\textcolor{${LINE}}{${s}}`, cB = (s) => `\\textcolor{${BCOL}}{${s}}`;
/** TeX number with a thin space in numbers ≥ 1000 (like the booklet: 2\,800) */
const tn = (v, d = 3) => {
  let s = texNum(v, d); const neg = s[0] === '-'; if (neg) s = s.slice(1);
  const [i, f] = s.split('.');
  return (neg ? '-' : '') + (i.length >= 4 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : i) + (f ? '.' + f : '');
};
/** plain-text number: real minus, narrow no-break space thousands */
const n = (v, d = 3) => tn(v, d).replace(/\\,/g, '\u202f').replace('-', '−');
const r1 = (v) => Math.round(v * 10) / 10;
const show = (c, el) => fadeIn(c, el, 320);
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u7l6-panel ' + cls, title ? `<div class="u7l6-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u7l6-line ' + cls, html); p.appendChild(d); return d; };
const pill = (p, html, cls = '') => { const d = h('div', 'u7l6-pill ' + cls, html); p.appendChild(d); return d; };

/** thin-space axis numbers ≥ 1000 on a Graph (re-applied on every redraw) */
function thinAxes(G) {
  const fb = G.frameBase.bind(G);
  G.frameBase = () => { fb(); G.layers.axes.querySelectorAll('.bk-num').forEach((t) => { const v = +t.textContent.replace('−', '-'); if (Math.abs(v) >= 1000) t.textContent = n(v); }); };
  G.frame(); return G;
}

/* ---------------------------------------------------------------------------------------------------------------
 * Slope triangle on a Graph: run leg (amber) from (x, y) across, then rise leg (purple) to the line. Labels outside.
 * ------------------------------------------------------------------------------------------------------------- */
class SlopeTri {
  constructor(G, s, o = {}) {
    this.G = G; this.s = Object.assign({}, s); this.o = o;
    const L = o.layer || G.layers.data, w = o.w || 5;
    this.g = svgEl('g', { class: 'u7l6-tri' }, L);
    this.fill = svgEl('path', { fill: o.fill || LINE, 'fill-opacity': o.fillOp ?? 0.1, stroke: 'none' }, this.g);
    this.mark = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 1.6 }, this.g);
    this.runP = svgEl('path', { class: 'bk-stroke', stroke: RUN, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, this.g);
    this.riseP = svgEl('path', { class: 'bk-stroke', stroke: RISE, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, this.g);
    this.lRun = o.labels === false ? null : h('div', 'bk-lab u7l6-tlab u7l6-trun');
    this.lRise = o.labels === false ? null : h('div', 'bk-lab u7l6-tlab u7l6-trise');
    if (this.lRun) G.html.append(this.lRun, this.lRise);
    G.track(this.g, () => this.draw());
  }
  draw() {
    const G = this.G, { x, y, run, rise } = this.s;
    const P = G.toPx(x, y), C = G.toPx(x + run, y), Q = G.toPx(x + run, y + rise);
    const d = (a, b) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    this.fill.setAttribute('d', `M${P[0]} ${P[1]} L${C[0]} ${C[1]} L${Q[0]} ${Q[1]} Z`);
    this.runP.setAttribute('d', d(P, C)); this.riseP.setAttribute('d', d(C, Q));
    const sx = Math.sign(P[0] - C[0]), sy = Math.sign(Q[1] - C[1]), k = 10;
    this.mark.setAttribute('d', Math.abs(C[0] - P[0]) > 2 * k && Math.abs(Q[1] - C[1]) > 2 * k ? `M${C[0] + sx * k} ${C[1]} L${C[0] + sx * k} ${C[1] + sy * k} L${C[0]} ${C[1] + sy * k}` : '');
    if (!this.lRun) return;
    this.lRun.innerHTML = this.o.runText ? this.o.runText(run) : `<b>run</b> ${n(run)}`;
    this.lRise.innerHTML = this.o.riseText ? this.o.riseText(rise) : `<b>rise</b> ${n(rise)}`;
    const gap = this.o.gap ?? 6;
    place(this.lRun, (P[0] + C[0]) / 2, P[1], this.o.runSide || (rise >= 0 ? 's' : 'n'), gap);
    place(this.lRise, C[0], (C[1] + Q[1]) / 2, this.o.riseSide || (run >= 0 ? 'e' : 'w'), gap + 2);
  }
  async drawIn(c, ms = 500) {
    const [lr, ls] = [this.lRun, this.lRise]; this.fill.style.opacity = 0; hide(lr); hide(ls);
    await drawIn(this.runP, ms, c); if (lr) await fadeIn(c, lr, 220);
    await drawIn(this.riseP, ms, c); if (ls) await fadeIn(c, ls, 220);
    await appear(c, this.fill, 250);
  }
  ghost() { this.g.style.opacity = 0.25; if (this.lRun) { this.lRun.remove(); this.lRise.remove(); this.lRun = this.lRise = null; } }
}

/* ---------------------------------------------------------------------------------------------------------------
 * Story pieces drawn in sync with a graph.
 * ------------------------------------------------------------------------------------------------------------- */
const ICON = {
  // top-down vehicles for a vertical road (pointing up)
  bike: '<svg viewBox="0 0 30 46" width="30" height="46"><rect x="13" y="1" width="4" height="13" rx="2" fill="#1c2230"/><rect x="13" y="32" width="4" height="13" rx="2" fill="#1c2230"/><path d="M15 12 V34" stroke="#1f5bd6" stroke-width="3"/><path d="M6 12 H24" stroke="#1c2230" stroke-width="3" stroke-linecap="round"/><ellipse cx="15" cy="24" rx="8" ry="6" fill="#e8a01e" stroke="#1c2230" stroke-width="2"/><circle cx="15" cy="20" r="5" fill="#f3c9a0" stroke="#1c2230" stroke-width="2"/></svg>',
  car: '<svg viewBox="0 0 30 50" width="30" height="50"><rect x="1" y="9" width="4" height="10" rx="2" fill="#1c2230"/><rect x="25" y="9" width="4" height="10" rx="2" fill="#1c2230"/><rect x="1" y="33" width="4" height="10" rx="2" fill="#1c2230"/><rect x="25" y="33" width="4" height="10" rx="2" fill="#1c2230"/><rect x="3" y="2" width="24" height="46" rx="9" fill="#1f5bd6" stroke="#1c2230" stroke-width="2"/><path d="M7 14 Q15 9 23 14 L22 20 H8 Z" fill="#cfe0ff"/><rect x="8" y="33" width="14" height="7" rx="2" fill="#cfe0ff"/></svg>',
  ghost: '<svg viewBox="0 0 30 50" width="30" height="50"><rect x="3" y="2" width="24" height="46" rx="9" fill="#fff" fill-opacity=".6" stroke="#c93a33" stroke-width="2.5" stroke-dasharray="5 4"/><path d="M7 14 Q15 9 23 14 L22 20 H8 Z" fill="#f5c9c6"/></svg>',
  // side view for a horizontal road (pointing right)
  van: '<svg viewBox="0 0 64 34" width="64" height="34"><path d="M2 8 Q2 4 6 4 H40 L50 6 L60 16 Q62 18 62 21 V27 H2 Z" fill="#fff" stroke="#1c2230" stroke-width="2.5" stroke-linejoin="round"/><path d="M42 8 L49 9 L56 17 H42 Z" fill="#cfe0ff" stroke="#1c2230" stroke-width="1.5"/><rect x="6" y="11" width="30" height="7" rx="2" fill="#1f5bd6"/><circle cx="15" cy="27" r="6" fill="#1c2230"/><circle cx="15" cy="27" r="2.4" fill="#fff"/><circle cx="49" cy="27" r="6" fill="#1c2230"/><circle cx="49" cy="27" r="2.4" fill="#fff"/></svg>'
};

/** a vertical strip beside graph G sharing its vertical scale. kind: 'road' | 'thermo' | 'tank' | 'pay'.
 *  o: { read(v) → html, icon, ghost (second lane), base (pay), max } — set(v) moves the level; setGhost(v) the ghost car */
class Column {
  constructor(stage, G, x, y, kind, o = {}) {
    const w = 130, H = G.H; this.G = G; this.kind = kind; this.o = o; this.cx = 96;
    this.el = add(stage, box(h('div', 'u7l6-col'), w, H), x, y);
    const s = this.svg = svgEl('svg', { width: w, height: H, viewBox: `0 0 ${w} ${H}` }, this.el);
    const py = this.py = (v) => G.toPx(0, v)[1];
    const top = py(G.win.ymax), bot = py(G.win.ymin), cx = this.cx;
    this.top = top; this.bot = bot;
    const ticks = (x1, x2) => { const st = G.o.ylabels || G.win.ystep; for (let v = G.win.ymin + st; v <= G.win.ymax + 1e-9; v += st) svgEl('line', { x1, x2, y1: py(v), y2: py(v), stroke: '#c9c3b4', 'stroke-width': 1.5 }, s); };
    if (kind === 'road') {
      const two = !!o.ghost, rw = two ? 64 : 44;
      svgEl('rect', { x: cx - rw / 2, y: top - 8, width: rw, height: bot - top + 8, rx: 6, fill: '#5d6472' }, s);
      if (two) svgEl('line', { x1: cx, x2: cx, y1: top, y2: bot, stroke: '#fff', 'stroke-width': 2.5, 'stroke-dasharray': '10 9' }, s);
      else svgEl('line', { x1: cx, x2: cx, y1: top, y2: bot, stroke: '#ffd166', 'stroke-width': 2.5, 'stroke-dasharray': '10 9' }, s);
      const st = G.o.ylabels || G.win.ystep;
      for (let v = G.win.ymin; v <= G.win.ymax + 1e-9; v += st) svgEl('line', { x1: cx - rw / 2 - 7, x2: cx - rw / 2, y1: py(v), y2: py(v), stroke: '#5d6472', 'stroke-width': 2 }, s);
      svgEl('rect', { x: cx - rw / 2, y: bot - 3, width: rw, height: 6, fill: '#fff' }, s);
      this.lane = two ? cx - 15 : cx;
      this.icon = h('div', 'u7l6-icon', ICON[o.icon || 'car']); this.el.appendChild(this.icon);
      if (two) { this.gIcon = h('div', 'u7l6-icon', ICON.ghost); this.el.appendChild(this.gIcon); this.gIcon.style.display = 'none'; }
    } else if (kind === 'thermo') {
      ticks(cx - 26, cx - 14);
      svgEl('rect', { x: cx - 11, y: top - 10, width: 22, height: bot - top + 16, rx: 11, fill: '#fff', stroke: INK, 'stroke-width': 3 }, s);
      svgEl('circle', { cx, cy: bot + 15, r: 15, fill: RED, stroke: INK, 'stroke-width': 3 }, s);
      this.merc = svgEl('rect', { x: cx - 5.5, width: 11, rx: 3, fill: RED }, s);
      svgEl('circle', { cx, cy: bot + 15, r: 12, fill: RED }, s);
    } else if (kind === 'tank') {
      ticks(cx - 40, cx - 30);
      svgEl('rect', { x: cx - 27, y: top, width: 54, height: bot - top, rx: 8, fill: '#fff', stroke: INK, 'stroke-width': 3 }, s);
      this.fuel = svgEl('rect', { x: cx - 24, width: 48, rx: 4, fill: '#e8a01e' }, s);
      const lab = h('div', 'u7l6-tanklab', 'FUEL'); this.el.appendChild(lab); place(lab, cx, top + 4, 's', 2);
    } else if (kind === 'pay') {
      ticks(cx - 40, cx - 30);
      svgEl('rect', { x: cx - 27, y: top, width: 54, height: bot - top, rx: 4, fill: '#fff', stroke: '#d9d4c7', 'stroke-width': 2 }, s);
      this.baseR = svgEl('rect', { x: cx - 25, width: 50, fill: BCOL }, s);
      this.comR = svgEl('rect', { x: cx - 25, width: 50, fill: RISE, 'fill-opacity': 0.85 }, s);
      this.lBase = h('div', 'u7l6-stacklab', 'base'); this.lCom = h('div', 'u7l6-stacklab', 'comm.');
      this.el.append(this.lBase, this.lCom);
    }
    this.read = h('div', 'u7l6-colread'); this.el.appendChild(this.read);
    this.set(o.start ?? G.win.ymin);
  }
  set(v) {
    const py = this.py(v), cx = this.cx; this.v = v;
    if (this.kind === 'road') place(this.icon, this.lane, py, 'c');
    else if (this.kind === 'thermo') { this.merc.setAttribute('y', py); this.merc.setAttribute('height', Math.max(0, this.bot + 6 - py)); }
    else if (this.kind === 'tank') {
      const yy = Math.min(py, this.bot - 3); this.fuel.setAttribute('y', yy); this.fuel.setAttribute('height', Math.max(0, this.bot - 3 - yy));
      this.fuel.setAttribute('fill', v > 0.25 * (this.o.max || 100) ? '#e8a01e' : RED);
    } else if (this.kind === 'pay') {
      const b = this.o.base, pb = this.py(Math.min(b, v));
      this.baseR.setAttribute('y', pb); this.baseR.setAttribute('height', Math.max(0, this.bot - pb));
      this.comR.setAttribute('y', py); this.comR.setAttribute('height', Math.max(0, pb - py));
      place(this.lBase, cx, (pb + this.bot) / 2, 'c'); this.lBase.style.visibility = this.bot - pb > 26 ? '' : 'hidden';
      place(this.lCom, cx, (py + pb) / 2, 'c'); this.lCom.style.visibility = pb - py > 26 ? '' : 'hidden';
    }
    this.read.innerHTML = this.o.read ? this.o.read(v) : n(r1(v));
    place(this.read, this.kind === 'road' ? cx - (this.o.ghost ? 40 : 30) : cx - 32, py, 'w', 0);
  }
  setGhost(v) { if (!this.gIcon) return; this.gIcon.style.display = ''; place(this.gIcon, this.cx + 15, this.py(v), 'c'); }
}

/** a horizontal road above graph G sharing its horizontal scale, with a vehicle and a distance tag */
class HRoad {
  constructor(stage, G, x, y, o = {}) {
    const H = 52; this.G = G; this.o = o;
    this.el = add(stage, box(h('div', 'u7l6-hroad'), G.W, H), x, y);
    const s = svgEl('svg', { width: G.W, height: H, viewBox: `0 0 ${G.W} ${H}` }, this.el);
    const x0 = G.toPx(G.win.xmin, 0)[0], x1 = G.toPx(G.win.xmax, 0)[0];
    svgEl('rect', { x: x0 - 8, y: 36, width: x1 - x0 + 16, height: 14, rx: 4, fill: '#5d6472' }, s);
    svgEl('line', { x1: x0, x2: x1, y1: 43, y2: 43, stroke: '#ffd166', 'stroke-width': 2, 'stroke-dasharray': '10 8' }, s);
    this.icon = h('div', 'u7l6-icon', ICON[o.icon || 'van']); this.el.appendChild(this.icon);
    this.tag = h('div', 'u7l6-dtag'); this.el.appendChild(this.tag);
    this.set(o.start ?? 0);
  }
  set(v) {
    const px = this.G.toPx(v, 0)[0]; this.v = v;
    this.icon.style.left = (px - 50) + 'px'; this.icon.style.top = '10px';
    this.tag.innerHTML = this.o.read ? this.o.read(v) : n(Math.round(v)); place(this.tag, px - 54, 26, 'w', 0);
  }
}

/** a point that runs along y = f(x) on G, leaving a trail from `from`, with dashed guides to the vertical axis
 *  (and down from the top when vguide). onMove(x, y) keeps the story in sync. */
function tracer(G, f, o = {}) {
  const st = { a: o.from, x: o.from };
  const samp = () => {
    const N = o.N || 60, xs = [];
    for (let i = 0; i <= N; i++) xs.push(st.a + (st.x - st.a) * i / N);
    (o.knots || []).forEach((k) => { if ((k - st.a) * (k - st.x) < 0) xs.push(k); });
    const dir = Math.sign(st.x - st.a) || 1; xs.sort((p, q) => (p - q) * dir);
    return xs.map((x) => G.toPx(x, f(x)));
  };
  const trail = G.curve(() => ({ subs: Math.abs(st.x - st.a) < 1e-9 ? [] : [samp()] }), { color: o.color || LINE, width: o.width || 4.5 }, 'u7l6-trail', G.layers.data);
  const guide = G.curve(() => ({ subs: o.guide === false ? [] : [[G.toPx(G.win.xmin, f(st.x)), G.toPx(st.x, f(st.x))]] }), { color: GRAY, width: 2, dash: '6 6' }, 'u7l6-guide', G.layers.data);
  const vg = G.curve(() => ({ subs: o.vguide ? [[G.toPx(st.x, G.win.ymax), G.toPx(st.x, f(st.x))]] : [] }), { color: GRAY, width: 2, dash: '6 6' }, 'u7l6-guide', G.layers.data);
  const dot = G.point(o.from, f(o.from), { color: o.dotColor || NOW, r: 8.5 });
  const api = {
    st, trail, dot,
    set(x) { st.x = x; trail._bkDraw(); guide._bkDraw(); vg._bkDraw(); G.moveTo(dot, x, f(x)); if (o.onMove) o.onMove(x, f(x)); },
    go(c, x, ms = 2000) { const x0 = st.x; return tween(c, ms, (t) => api.set(x0 + (x - x0) * t), linear); },
    guides(on) { guide.style.display = vg.style.display = on ? '' : 'none'; },
    hideDot() { dot.style.visibility = 'hidden'; }, showDot() { dot.style.visibility = ''; }
  };
  api.set(o.from);
  return api;
}

/** a speedometer 0..max km/h; set(v) */
function speedo(host, max = 120) {
  const W = 250, H = 150, d = h('div', 'u7l6-speedo'); box(d, W, H); host.appendChild(d);
  const s = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, d);
  const cx = W / 2, cy = 110, R = 100, ang = (v) => Math.PI * (1 - v / max);
  const P = (v, r) => [cx + r * Math.cos(ang(v)), cy - r * Math.sin(ang(v))];
  svgEl('path', { d: `M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`, fill: 'none', stroke: '#e3dfd4', 'stroke-width': 14 }, s);
  for (let v = 0; v <= max; v += 20) {
    const [a, b] = [P(v, R - 12), P(v, R + 6)]; svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: INK, 'stroke-width': 2.5 }, s);
    const [lx, ly] = P(v, R - 30); const t = svgEl('text', { x: lx, y: ly + 5, 'text-anchor': 'middle', class: 'u7l6-sptxt' }, s); t.textContent = v;
  }
  const nd = svgEl('line', { x1: cx, y1: cy, stroke: RED, 'stroke-width': 4, 'stroke-linecap': 'round' }, s);
  svgEl('circle', { cx, cy, r: 7, fill: INK }, s);
  const rd = h('div', 'u7l6-spread'); d.appendChild(rd);
  return { el: d, v: 0, set(v) { this.v = v; const [x, y] = P(Math.max(0, Math.min(max, v)), R - 20); nd.setAttribute('x2', x); nd.setAttribute('y2', y); rd.textContent = `${Math.round(v)} km/h`; } };
}

/** fly an HTML token from src into the blank `slot` (inline) */
async function fly(c, stage, src, slot, html) {
  slot.innerHTML = ''; const tok = h('span', 'u7l6-tok', html); slot.appendChild(tok); slot.classList.add('u7l6-sb-on');
  if (!c || c.fast) return;
  const sc = stage.getBoundingClientRect().width / stage.offsetWidth || 1;
  const a = src.getBoundingClientRect(), b = tok.getBoundingClientRect();
  const dx = ((a.left + a.width / 2) - (b.left + b.width / 2)) / sc, dy = ((a.top + a.height / 2) - (b.top + b.height / 2)) / sc;
  await c.anim(tok, [{ transform: `translate(${dx}px, ${dy}px) scale(1.25)`, opacity: 0.4 }, { transform: 'none', opacity: 1 }], 750);
}

/* =============================== warm-up: growth tiles and the same-units bars =============================== */
const GROW = [
  { k: 'nail', name: 'Fingernail', rate: 'about <b>3 mm</b> per month', svg: '<svg viewBox="0 0 140 110" width="140" height="110"><path d="M45 108 V40 Q45 12 70 12 Q95 12 95 40 V108" fill="#f0c8a5" stroke="#1c2230" stroke-width="3"/><rect x="53" y="22" width="34" height="46" rx="13" fill="#fff6dc" stroke="#1c2230" stroke-width="2.5"/><line x1="53" y1="31" x2="87" y2="31" stroke="#1c2230" stroke-width="2"/><path d="M104 22 V31" stroke="#c93a33" stroke-width="3"/><path d="M100 26 l4 -5 l4 5 M100 27 l4 5 l4 -5" fill="none" stroke="#c93a33" stroke-width="2"/><text x="111" y="31" class="u7l6-gtx">new</text></svg>' },
  { k: 'hair', name: 'Hair', rate: 'about <b>1 cm</b> per month', svg: '<svg viewBox="0 0 140 110" width="140" height="110"><path d="M38 52 Q30 98 44 106 H96 Q110 98 102 52 Q98 8 70 8 Q42 8 38 52 Z" fill="#7a4b28" stroke="#1c2230" stroke-width="2.5"/><ellipse cx="70" cy="56" rx="24" ry="29" fill="#f0c8a5" stroke="#1c2230" stroke-width="2.5"/><path d="M46 46 Q70 22 94 46 Q70 34 46 46" fill="#7a4b28"/><circle cx="61" cy="55" r="2.6" fill="#1c2230"/><circle cx="79" cy="55" r="2.6" fill="#1c2230"/><path d="M62 70 Q70 75 78 70" fill="none" stroke="#1c2230" stroke-width="2.4"/></svg>' },
  { k: 'lawn', name: 'Summer lawn', rate: 'about <b>5 cm</b> per week', svg: '<svg viewBox="0 0 140 110" width="140" height="110"><rect x="6" y="94" width="128" height="12" fill="#6b4a2a"/>' + Array.from({ length: 15 }, (_, i) => { const x = 10 + i * 8, hh = 50 + 14 * Math.sin(i * 1.7); return `<path d="M${x - 3} 95 L${x + 1} ${95 - hh} L${x + 4} 95 Z" fill="#5aa046" stroke="#3c7a2e" stroke-width="1"/>`; }).join('') + '<rect x="122" y="14" width="12" height="82" fill="#ffecb3" stroke="#1c2230" stroke-width="2"/>' + Array.from({ length: 8 }, (_, i) => `<line x1="122" x2="128" y1="${22 + i * 10}" y2="${22 + i * 10}" stroke="#1c2230" stroke-width="1.5"/>`).join('') + '</svg>' },
  { k: 'sea', name: 'The Atlantic', rate: 'is getting <b>wider</b> every year', svg: '<svg viewBox="0 0 140 110" width="140" height="110"><rect x="4" y="6" width="132" height="98" rx="6" fill="#78afe1" stroke="#1c2230" stroke-width="2.5"/><path d="M4 6 H42 Q50 30 42 50 Q36 74 46 104 H4 Z" fill="#96be64" stroke="#1c2230" stroke-width="2"/><path d="M136 6 H100 Q94 28 102 46 Q108 70 96 104 H136 Z" fill="#96be64" stroke="#1c2230" stroke-width="2"/><path d="M56 82 H84" stroke="#c93a33" stroke-width="3.5"/><path d="M60 77 L54 82 L60 87 M80 77 L86 82 L80 87" fill="none" stroke="#c93a33" stroke-width="3"/><text x="70" y="62" text-anchor="middle" class="u7l6-gq">?</text></svg>' }
];
const BARS = [
  { k: 'Atlantic', v: 2.5 / 12, lab: '≈ 0.2', note: '2.5 cm per year ÷ 12' },
  { k: 'Fingernail', v: 0.3, lab: '≈ 0.3', note: '3 mm = 0.3 cm' },
  { k: 'Hair', v: 1, lab: '≈ 1', note: '' },
  { k: 'Lawn', v: 20, lab: '≈ 20', note: '5 cm × 4 weeks' }
];
function mountWarm() {
  const g = document.getElementById('u7l6-grow');
  if (g) GROW.forEach((t) => g.appendChild(h('div', 'u7l6-gtile', `<div class="u7l6-gname">${t.name}</div>${t.svg}<div class="u7l6-grate">${t.rate}</div>`)));
  const host = document.getElementById('u7l6-bars'); if (!host) return;
  host.innerHTML = '<div class="u7l6-bhead">cm per month</div>';
  const rows = BARS.map((b) => {
    const r = h('div', 'u7l6-brow', `<div class="u7l6-bk">${b.k}</div><div class="u7l6-btrack"><div class="u7l6-bbar u7l6-bb-${b.k.toLowerCase()}"></div><div class="u7l6-bval"></div></div>`);
    host.appendChild(r); return { b, bar: r.querySelector('.u7l6-bbar'), val: r.querySelector('.u7l6-bval'), track: r.querySelector('.u7l6-btrack') };
  });
  const note = h('div', 'u7l6-bnote', 'Guess first, then press a button.'); host.appendChild(note);
  const draw = (max) => rows.forEach(({ b, bar, val }) => {
    const f = Math.min(1, b.v / max), over = b.v > max;
    bar.style.width = (f * 100) + '%'; bar.classList.toggle('u7l6-over', over);
    val.innerHTML = `${b.lab}${over ? ' →' : ''}`; const inside = f > 0.7; val.classList.toggle('u7l6-bin', inside);
    val.style.left = inside ? 'auto' : `calc(${f * 100}% + 8px)`; val.style.right = inside ? `calc(${100 - f * 100}% + 8px)` : 'auto';
  });
  rows.forEach(({ val }) => (val.innerHTML = ''));
  const bm = document.getElementById('u7l6-bmonth'), bz = document.getElementById('u7l6-bzoom');
  if (bm) bm.onclick = () => { host.classList.add('on'); draw(20); note.innerHTML = 'Same units: the lawn wins by far. Nail and Atlantic are both tiny.'; };
  if (bz) bz.onclick = () => { host.classList.add('on'); draw(1.2); note.innerHTML = 'Zoomed in: the Atlantic (≈ 0.2 cm/month) is closest to a <b>fingernail</b> (≈ 0.3).'; };
}

/* =============================== example figures =============================== */
const FIG = {
  ex1a: { width: 420, height: 320, xmin: 0, xmax: 6.5, ymin: 0, ymax: 132, xstep: 1, ystep: 20, xtitle: '\\text{Time (h)}', ytitle: '\\text{Distance (km)}', origin: true },
  ex1b: { width: 420, height: 320, xmin: 0, xmax: 8.6, ymin: 0, ymax: 445, xstep: 1, ystep: 50, xtitle: '\\text{Time (min)}', ytitle: '\\text{Temperature }(^\\circ\\text{F})', origin: true },
  ex2: { width: 430, height: 340, xmin: 0, xmax: 272, ymin: 0, ymax: 112, xstep: 25, ystep: 10, xlabels: 50, ylabels: 20, xtitle: '\\text{Distance, }D\\text{ (km)}', ytitle: '\\text{Fuel, }N\\text{ (L)}', origin: true },
  ex3: { width: 400, height: 360, xmin: 0, xmax: 8.6, ymin: 0, ymax: 375, xstep: 1, ystep: 50, xtitle: '\\text{Time (h)}', ytitle: '\\text{Distance (km)}', origin: true },
  ex4: { width: 440, height: 370, xmin: 0, xmax: 5400, ymin: 0, ymax: 870, xstep: 500, ystep: 100, xlabels: 1000, ylabels: 100, xtitle: '\\text{Sales, }S\\ (\\$)', ytitle: '\\text{Earnings, }E\\ (\\$)', origin: true }
};
const TRIP = { ts: [0, 2, 5, 7], ds: [0, 80, 260, 320], names: ['O', 'P', 'Q', 'R'] };
const tripF = (t) => { const { ts, ds } = TRIP; if (t <= 0) return 0; for (let i = 1; i < ts.length; i++) if (t <= ts[i]) return ds[i - 1] + (ds[i] - ds[i - 1]) * (t - ts[i - 1]) / (ts[i] - ts[i - 1]); return ds[ds.length - 1]; };
function mountFigures() {
  const a = document.getElementById('u7l6-ex1a');
  if (a) { const G = new Graph(a, FIG.ex1a); G.segment([0, 0], [4.8, 120], { color: INK, width: 3.5 }); G.point(2, 50, { color: INK, r: 6, coords: true, pos: 'se' }); G.point(4, 100, { color: INK, r: 6, coords: true, pos: 'nw' }); }
  const b = document.getElementById('u7l6-ex1b');
  if (b) { const G = new Graph(b, FIG.ex1b); G.segment([0, 65], [6, 395], { color: INK, width: 3.5 }); G.point(0, 65, { color: INK, r: 6, coords: true, pos: 'se' }); G.point(5, 340, { color: INK, r: 6, coords: true, pos: 'nw' }); }
  const e2 = document.getElementById('u7l6-ex2fig');
  if (e2) { const G = new Graph(e2, FIG.ex2); G.segment([0, 92], [230, 0], { color: INK, width: 3.5 }); G.point(30, 80, { color: INK, r: 6, coords: true, pos: 'ne' }); G.point(150, 32, { color: INK, r: 6, coords: true, pos: 'ne' }); }
  const e3 = document.getElementById('u7l6-ex3fig');
  if (e3) {
    const G = new Graph(e3, FIG.ex3); G.polyline(TRIP.ts.map((t, i) => [t, TRIP.ds[i]]), { color: INK, width: 3.5 });
    TRIP.ts.forEach((t, i) => G.point(t, TRIP.ds[i], { color: INK, r: 6, label: T(`${TRIP.names[i]}${pairTex(t, TRIP.ds[i])}`), pos: ['nw', 'se', 'nw', 'nw'][i] }));
  }
  const e4 = document.getElementById('u7l6-ex4fig'), rd = document.getElementById('u7l6-ex4read');
  if (e4) {
    let join = null;
    const G = thinAxes(new Graph(e4, Object.assign({}, FIG.ex4, {
      interactive: { snap: 20, max: 2, color: 'blue', onChange: () => {
        (G.userPts || []).forEach((p) => { const sx = Math.round(p.gx / 100) * 100; if (sx !== p.gx) G.moveTo(p, sx, p.gy); });
        const pts = G.points(); if (join) join._bkDraw();
        if (rd) rd.innerHTML = pts.length ? 'Plotted: ' + pts.map((p) => T(pairTex(tn(p[0]), tn(p[1])))).join(', ') : '';
      } }
    })));
    join = G.curve(() => { const p = G.points(); return { subs: p.length === 2 ? [p.map((q) => G.toPx(q[0], q[1]))] : [] }; }, { color: LINE, width: 3 }, 'u7l6-join', G.layers.data);
  }
  const e4a = document.getElementById('u7l6-ex4ans');
  if (e4a) {
    const G = thinAxes(new Graph(e4a, Object.assign({}, FIG.ex4, { width: 380, height: 320, fontSize: 15 })));
    G.segment([0, 280], [5000, 780], { color: RED, width: 2.5, dash: '7 6' });
    G.segment([2800, 560], [4600, 740], { color: RED, width: 4 });
    G.point(2800, 560, { color: RED, r: 6, label: T(pairTex(tn(2800), 560)), pos: 'se', labelCls: 'u7l6-small' });
    G.point(4600, 740, { color: RED, r: 6, label: T(pairTex(tn(4600), 740)), pos: 'nw', labelCls: 'u7l6-small' });
    G.label(300, 760, T('E=0.10S+280'), { pos: 'e', cls: 'bk-ptlab u7l6-small', color: RED });
  }
}

/* =============================== explainer 1: a story and its graph, in sync =============================== */
const SY = {
  ex1a: { label: 'Example 1(a) check: cyclist', kind: 'road', icon: 'bike', g: FIG.ex1a, f: (t) => 25 * t, x1: 4.8, A: [2, 50], B: [4, 100],
    xu: 'h', xw: 'hour', yu: 'km', yuT: '\\text{km}', perT: '\\text{km/h}', per: 'km/h', qty: 'distance', who: 'the cyclist ride', steps: 4,
    read: (v) => `${Math.round(v)} km`, clock: (t) => `${t.toFixed(1)} h` },
  ex1b: { label: 'Example 1(b) check: oven', kind: 'thermo', g: FIG.ex1b, f: (t) => 65 + 55 * t, x1: 6, A: [0, 65], B: [5, 340],
    xu: 'min', xw: 'minute', yu: '°F', yuT: '^\\circ\\text{F}', perT: '^\\circ\\text{F/min}', per: '°F per minute', qty: 'temperature', who: 'the oven heat up', steps: 5,
    read: (v) => `${Math.round(v)} °F`, clock: (t) => `${t.toFixed(1)} min` }
};
const sync = {
  title: 'A story and its graph, in sync',
  height: 470,
  choices: Object.keys(SY).map((k) => ({ v: k, label: SY[k].label })),
  intro: (k) => `Time runs along the horizontal axis; the ${SY[k].qty} is shown beside the vertical axis, on the same scale. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SY[k], f = d.f, [A, B] = [d.A, d.B], run = B[0] - A[0], rise = B[1] - A[1], m = rise / run;
    const G = new Graph(stage, Object.assign({}, d.g, { x: 146, y: 14, width: 450, height: 440 }));
    const col = new Column(stage, G, 14, 14, d.kind, { icon: d.icon, read: d.read, start: f(0) });
    const P = panel(stage, 610, 14, ex.W - 624, 440, 'Rate of change');
    const clk = pill(P, `time: ${d.clock(0)}`, 'u7l6-clock');
    const tr = tracer(G, f, { from: 0, onMove: (x, y) => { col.set(y); clk.innerHTML = `time: <b>${d.clock(x)}</b>`; } });
    let Tr = null;
    return [
      { cap: `Watch ${d.who} while the point traces the graph. The ${d.qty} beside the vertical axis is the height of the point.`,
        run: async (c) => { await tr.go(c, d.x1, 3200); } },
      { cap: `Choose two points on the line that sit exactly on grid corners: ${T(pairTex(...A))} and ${T(pairTex(...B))}.`,
        run: async (c) => { tr.hideDot(); tr.guides(false); for (const [p, pos] of [[A, 'se'], [B, 'nw']]) await G.reveal(G.point(p[0], p[1], { color: INK, r: 7, coords: true, pos }), c); } },
      { cap: `From ${T(pairTex(...A))} to ${T(pairTex(...B))}: the run is ${T(cU(run + '\\text{ ' + d.xu + '}'))} and the rise is ${T(cR(rise + '\\ ' + d.yuT))}. The units come from the axes.`,
        run: async (c) => {
          const t2 = tracer(G, f, { from: A[0], onMove: (x, y) => { col.set(y); clk.innerHTML = `time: <b>${d.clock(x)}</b>`; } });
          await t2.go(c, B[0], 1300); t2.hideDot(); t2.guides(false);
          Tr = new SlopeTri(G, { x: A[0], y: A[1], run, rise }, { runText: (v) => `<b>run</b> ${n(v)} ${d.xu}`, riseText: (v) => `<b>rise</b> ${n(v)} ${d.yu}` }); await Tr.drawIn(c, 500);
        } },
      { cap: `${T(`m=\\dfrac{${cR(rise + '\\ ' + d.yuT)}}{${cU(run + '\\text{ ' + d.xu + '}')}}=${m}\\ ${d.perT}`)}: ${d.yu} <b>per</b> ${d.xw}.`,
        run: async (c) => { const b = h('div', 'u7l6-scale', T(`m=\\dfrac{${cR(rise + '\\ ' + d.yuT)}}{${cU(run + '\\text{ ' + d.xu + '}')}}=\\boldsymbol{${m}\\ ${d.perT}}`)); P.appendChild(b); await pop(c, b); } },
      { cap: `So every ${T('1')} ${d.xw}, the ${d.qty} goes up ${T(String(m))} ${d.yu}: the same in every ${d.xw}. That is what “rate of change” means.`,
        run: async (c) => {
          Tr.ghost(); tr.hideDot(); tr.guides(false);
          for (let i = 0; i < d.steps; i++) {
            const x = i, y = f(i);
            const s = new SlopeTri(G, { x, y, run: 1, rise: m }, { labels: false, fillOp: 0.18, w: 4 }); await s.drawIn(c, 200);
            const l = G.label(x + 1, y + m / 2, `+${m}`, { pos: 'e', cls: 'u7l6-bub', gap: 5 }); await pop(c, l, 200);
            col.set(f(i + 1));
          }
          await show(c, line(P, `each ${d.xw}: <b class="u7l6-c-rise">+${m} ${d.yu}</b>`, 'u7l6-line'));
        } },
      { cap: `The slope is positive, so the ${d.qty} is <b>increasing</b>. Say it with units: “The ${d.qty} is increasing at the rate of ${m} ${d.per}.”`,
        run: async (c) => {
          const s = line(P, `The ${d.qty} is <b>increasing</b> at the rate of <b>${m} ${d.per}</b>.`, 'u7l6-sent'); await show(c, s);
          const st = stamp(P, 'with units', { ok: true }); st.classList.add('u7l6-stampb'); await stampIn(c, st);
        } }
    ];
  }
};

/* =============================== explainer 2: say it as a sentence =============================== */
const SE = {
  ex1a: { label: 'Example 1(a) check', g: FIG.ex1a, seg: [[0, 0], [4.8, 120]], A: [2, 50], B: [4, 100], posA: 'nw', qty: 'distance', yu: 'km', xw: 'hour', note: '25 km per hour is 25 km/h.' },
  ex1b: { label: 'Example 1(b) check', g: FIG.ex1b, seg: [[0, 65], [6, 395]], A: [0, 65], B: [5, 340], posA: 'se', qty: 'temperature', yu: '°F', xw: 'minute', note: '' },
  ex2a: { label: 'Example 2(a) check', g: FIG.ex2, seg: [[0, 92], [230, 0]], A: [30, 80], B: [150, 32], posA: 'sw', qty: 'amount of fuel in the tank', yu: 'L', xw: 'km', note: '0.4 L per km is 0.4 L/km.' }
};
const sentence = {
  title: 'A rate is a sentence with units',
  height: 450,
  choices: Object.keys(SE).map((k) => ({ v: k, label: SE[k].label })),
  intro: 'Four blanks: direction, number, the vertical unit and the horizontal unit. The graph fills them all. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = SE[k], [A, B] = [d.A, d.B], run = B[0] - A[0], rise = B[1] - A[1], m = rise / run, up = m > 0;
    const G = new Graph(stage, Object.assign({}, d.g, { x: 14, y: 14, width: 470, height: 420 }));
    G.segment(d.seg[0], d.seg[1], { color: LINE, width: 4 });
    G.point(A[0], A[1], { color: INK, r: 6.5, coords: true, pos: d.posA }); G.point(B[0], B[1], { color: INK, r: 6.5, coords: true, pos: up ? 'nw' : 'ne' });
    const P = panel(stage, 500, 14, ex.W - 514, 420, 'The rate sentence');
    const mBox = h('div', 'u7l6-scale', '&nbsp;'); P.appendChild(mBox); hide(mBox);
    const sent = h('div', 'u7l6-template', `The ${d.qty} is <span class="u7l6-sb"></span> at the rate of <span class="u7l6-sb u7l6-sbs"></span> <span class="u7l6-sb u7l6-sbs"></span> per <span class="u7l6-sb u7l6-sbs"></span>.`);
    P.appendChild(sent);
    const slots = [...sent.querySelectorAll('.u7l6-sb')];
    const why = h('div', 'u7l6-why'); P.appendChild(why);
    const axt = [...G.axesHtml.querySelectorAll('.bk-axt')];   // [x title, y title]
    const mT = `m=\\dfrac{${tn(B[1])}-${tn(A[1])}}{${tn(B[0])}-${tn(A[0])}}=\\dfrac{${rise}}{${run}}=${texNum(m)}`;
    return [
      { cap: `First the slope from the two points: ${T(mT)}.`,
        run: async (c) => { const s = new SlopeTri(G, { x: A[0], y: A[1], run, rise }, { runSide: up ? 's' : 'n' }); await s.drawIn(c, 450); mBox.innerHTML = T(mT); await show(c, mBox); } },
      { cap: `The <b>sign</b>: ${T(texNum(m))} is ${up ? 'positive' : 'negative'}, and the line ${up ? 'climbs' : 'falls'} from left to right. So the ${d.qty} is <b>${up ? 'increasing' : 'decreasing'}</b>.`,
        run: async (c) => { await fly(c, stage, mBox, slots[0], `<b>${up ? 'increasing' : 'decreasing'}</b>`); why.innerHTML = up ? 'positive slope → increasing' : 'negative slope → decreasing'; await show(c, why); } },
      { cap: `The <b>size</b>: ${T(texNum(Math.abs(m)))} goes in the number blank${up ? '' : `. The minus sign is already in the word “decreasing”, so write ${T(texNum(-m))}, not ${T(texNum(m))}`}.`,
        run: async (c) => { await fly(c, stage, mBox, slots[1], `<b>${n(Math.abs(m))}</b>`); } },
      { cap: `The vertical axis measures the ${d.qty} in <b>${d.yu}</b>: that is what changes.`,
        run: async (c) => { if (axt[1]) { axt[1].classList.add('u7l6-axon'); await pulse(c, axt[1], 1.15); } await fly(c, stage, axt[1] || mBox, slots[2], `<b>${d.yu}</b>`); } },
      { cap: `…per one <b>${d.xw}</b>: the unit on the horizontal axis.`,
        run: async (c) => { if (axt[0]) { axt[0].classList.add('u7l6-axon'); await pulse(c, axt[0], 1.15); } await fly(c, stage, axt[0] || mBox, slots[3], `<b>${d.xw}</b>`); } },
      { cap: `“The ${d.qty} is ${up ? 'increasing' : 'decreasing'} at the rate of ${n(Math.abs(m))} ${d.yu} per ${d.xw}.” ${d.note} Not just “${n(m)}”.`,
        run: async (c) => {
          const bad = line(P, `not just <s>${n(m)}</s>`, 'u7l6-bad'); await show(c, bad);
          const st = stamp(P, 'complete', { ok: true }); st.classList.add('u7l6-stampb'); await stampIn(c, st);
        } }
    ];
  }
};

/* =============================== explainer 3: the van, its tank and its graph =============================== */
const vanF = (D) => 92 - 0.4 * D;
const van = {
  title: 'The van, its fuel gauge and its graph',
  height: 470,
  choices: [{ v: 'ex2', label: 'Example 2 check' }],
  intro: 'The van drives along the distance axis; its tank sits beside the fuel axis, on the same scale. Press <b>Next</b>.',
  make(stage, k, ex) {
    const G = new Graph(stage, Object.assign({}, FIG.ex2, { x: 146, y: 60, width: 450, height: 404, xmax: 262, ymax: 106, pad: [30, 18, 34, 42] }));
    const col = new Column(stage, G, 14, 60, 'tank', { read: (v) => `${Math.round(v)} L`, start: 80, max: 92 });
    const road = new HRoad(stage, G, 146, 2, { read: (v) => `${Math.round(v)} km`, start: 30 });
    const P = panel(stage, 610, 14, ex.W - 624, 450, 'Equation from the graph');
    const sync = (x, y) => { col.set(y); road.set(x); };
    const tr = tracer(G, vanF, { from: 30, vguide: true, onMove: sync });
    let tr2 = null, Tr = null;
    return [
      { cap: `At ${T('D=30')} km the gauge reads ${T('80')} L. Drive on to ${T('D=150')} km: the tank is down to ${T('32')} L. Watch the van, the tank and the graph together.`,
        run: async (c) => {
          await G.reveal(G.point(30, 80, { color: INK, r: 7, coords: true, pos: 'sw' }), c);
          await tr.go(c, 150, 2600);
          await G.reveal(G.point(150, 32, { color: INK, r: 7, coords: true, pos: 'ne' }), c);
        } },
      { cap: `From ${T('(30,\\ 80)')} to ${T('(150,\\ 32)')}: the run is ${T(cU('120\\text{ km}'))} and the rise is ${T(cR('-48\\text{ L}'))}: the tank lost 48 L.`,
        run: async (c) => { tr.guides(false); Tr = new SlopeTri(G, { x: 30, y: 80, run: 120, rise: -48 }, { runSide: 'n', runText: () => '<b>run</b> 120 km', riseText: () => '<b>rise</b> −48 L' }); await Tr.drawIn(c, 550); } },
      { cap: `${T(`m=\\dfrac{${cR('-48\\text{ L}')}}{${cU('120\\text{ km}')}}=-0.4\\text{ L/km}`)}. Negative: the fuel is <b>decreasing</b> at ${T('0.4')} L per km.`,
        run: async (c) => { await show(c, line(P, T(`m=\\dfrac{-48}{120}=${cM('-0.4')}\\ \\text{L/km}`), 'u7l6-mline')); } },
      { cap: `Now ${T('N=-0.4D+b')}. ${T('b')} is the fuel at ${T('D=0')}. Drive <b>backward</b> from ${T('(30,\\ 80)')} to the start: ${T('30\\times0.4=12')} L more, so ${T('b=92')}.`,
        run: async (c) => {
          Tr.ghost(); tr.hideDot();
          tr2 = tracer(G, vanF, { from: 30, vguide: true, onMove: sync }); await tr2.go(c, 0, 1800);
          tr2.guides(false); tr2.hideDot();
          await G.reveal(G.point(0, 92, { color: BCOL, r: 9 }), c);
          await show(c, line(P, T('80=-0.4(30)+b'), 'u7l6-mline'));
          await show(c, line(P, T(`80=-12+b\\ \\Rightarrow\\ ${cB('b=92')}`), 'u7l6-mline'));
        } },
      { cap: `${T(`N=${cM('-0.4')}D+${cB('92')}`)}: ${T(cM('-0.4'))} is the <b>rate</b> (0.4 L used per km); ${T(cB('92'))} is the <b>starting value</b>: the van set out with 92 L in the tank.`,
        run: async (c) => {
          const e = h('div', 'u7l6-bigeq', T(`N=${cM('-0.4')}D+${cB('92')}`)); P.appendChild(e); await pop(c, e);
          const lb = G.label(7, 92, `<b>b = 92</b>: 92 L at the start`, { pos: 'e', cls: 'u7l6-call u7l6-call-b' }); await pop(c, lb);
          const lm = G.label(112, 44, `<b>m = −0.4</b>: 0.4 L used per km`, { pos: 'sw', cls: 'u7l6-call u7l6-call-m' }); await pop(c, lm);
        } },
      { cap: `Check with the other point, ${T('(150,\\ 32)')}: ${T('-0.4(150)+92=-60+92=32')} ✓.`,
        run: async (c) => { await show(c, line(P, `check: ${T('-0.4(150)+92=32')} ✓`, 'u7l6-line u7l6-ok')); } },
      { cap: `The graph also says when the tank runs dry: ${T('N=0')} when ${T('D=92\\div0.4=230')} km. That is the horizontal intercept.`,
        run: async (c) => {
          tr.showDot(); tr.guides(true); tr.set(150); await tr.go(c, 230, 1600); tr.guides(false);
          await G.reveal(G.point(230, 0, { color: RED, r: 8 }), c);
          await show(c, line(P, `empty after <b>230 km</b>`, 'u7l6-line u7l6-soft'));
        } }
    ];
  }
};

/* =============================== explainer 4: two roads to the equation =============================== */
const RT = {
  ex2: { label: 'Example 2 check', m: -0.4, P: [30, 80], X: 'D', Y: 'N', g: { xmin: 0, xmax: 262, ymin: 0, ymax: 105, xstep: 50, ystep: 20, xlabels: 100, xtitle: 'D', ytitle: 'N' } },
  ex4c: { label: 'Example 4(c) check', m: 0.1, P: [2800, 560], X: 'S', Y: 'E', g: { xmin: 0, xmax: 5250, ymin: 0, ymax: 800, xstep: 1000, ystep: 200, xlabels: 2000, xtitle: 'S', ytitle: 'E' } }
};
const routes = {
  title: 'Two roads to the same equation',
  height: 414,
  choices: Object.keys(RT).map((k) => ({ v: k, label: RT[k].label })),
  intro: 'Same slope, same point, two methods. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = RT[k], m = d.m, [x1, y1] = d.P, mx = Math.round(m * x1 * 1000) / 1000, b = Math.round((y1 - mx) * 1000) / 1000;
    const mT = texNum(m), X = d.X, Y = d.Y, sg = (v) => (v < 0 ? `-${tn(-v)}` : `+${tn(v)}`);
    const cw = 290, pw = (ex.W - cw - 48) / 2;
    const L = panel(stage, 12, 14, pw, 386, 'Road 1: substitute the point', 'u7l6-road1 u7l6-big');
    const G = new Graph(stage, Object.assign({ x: 24 + pw, y: 20, width: cw, height: 260, fontSize: 15, origin: true }, d.g));
    if (k === 'ex4c') thinAxes(G);
    const R = panel(stage, 36 + pw + cw, 14, pw, 386, 'Road 2: slope–point form', 'u7l6-road2 u7l6-big');
    const res = add(stage, box(h('div', 'u7l6-routeres'), cw, 116), 24 + pw, 290);
    const f = (x) => m * x + b;
    const fin = `${Y}=${cM(mT)}${X}+${cB(tn(b))}`;
    return [
      { cap: `Given: the rate ${T(`m=${mT}`)} and the point ${T(pairTex(tn(x1), tn(y1)))}. Both roads start here.`,
        run: async (c) => {
          await G.reveal(G.point(x1, y1, { color: INK, r: 6.5 }), c);
          await G.drawIn(G.line({ m, b }, { color: LINE, width: 3.5 }), 700, c);
          await show(c, line(res, T(`m=${mT},\\ ${pairTex(tn(x1), tn(y1))}`), 'u7l6-mline'));
        } },
      { cap: `Road 1: write ${T(`${Y}=${mT}${X}+b`)}, then substitute the point: ${T(`${X}=${tn(x1)}`)}, ${T(`${Y}=${tn(y1)}`)}.`,
        run: async (c) => { await show(c, line(L, T(`${Y}=${mT}${X}+b`), 'u7l6-mline')); await show(c, line(L, T(`${tn(y1)}=${mT}(${tn(x1)})+b`), 'u7l6-mline')); } },
      { cap: `Multiply, then solve for ${T('b')}: ${T(`${tn(y1)}=${tn(mx)}+b`)}, so ${T(`b=${tn(b)}`)}.`,
        run: async (c) => { await show(c, line(L, T(`${tn(y1)}=${tn(mx)}+b`), 'u7l6-mline')); await show(c, line(L, T(`${cB('b=' + tn(b))}`), 'u7l6-mline')); await show(c, line(L, T(fin), 'u7l6-mline u7l6-boxed')); } },
      { cap: `Road 2: slope–point form with ${T(`(x_1,\\ y_1)=${pairTex(tn(x1), tn(y1))}`)}: ${T(`${Y}-${tn(y1)}=${mT}(${X}-${tn(x1)})`)}.`,
        run: async (c) => { await show(c, line(R, T(`${Y}-${tn(y1)}=${mT}(${X}-${tn(x1)})`), 'u7l6-mline')); } },
      { cap: `Expand the bracket: ${T(`${mT}\\times(-${tn(x1)})=${tn(-mx)}`)}, so ${T(`${Y}-${tn(y1)}=${mT}${X}${sg(-mx)}`)}.`,
        run: async (c) => { await show(c, line(R, T(`${Y}-${tn(y1)}=${mT}${X}${sg(-mx)}`), 'u7l6-mline')); } },
      { cap: `Add ${T(tn(y1))} to both sides: ${T(`${tn(-mx)}+${tn(y1)}=${tn(b)}`)}, so ${T(`${Y}=${mT}${X}+${tn(b)}`)}.`,
        run: async (c) => { await show(c, line(R, T(`${Y}=${mT}${X}${sg(-mx)}+${tn(y1)}`), 'u7l6-mline')); await show(c, line(R, T(fin), 'u7l6-mline u7l6-boxed')); } },
      { cap: `Both roads arrive at ${T(`${Y}=${mT}${X}+${tn(b)}`)}: the line through ${T(pairTex(tn(x1), tn(y1)))} with slope ${T(mT)} meets the vertical axis at ${T(tn(b))}.`,
        run: async (c) => {
          await G.reveal(G.point(0, b, { color: BCOL, r: 7.5, label: T(cB(tn(b))), pos: 'e' }), c);
          const s = stamp(res, 'same line', { ok: true }); s.classList.add('u7l6-stampb'); await stampIn(c, s);
          for (const bx of stage.querySelectorAll('.u7l6-boxed')) await pulse(c, bx, 1.06);
        } }
    ];
  }
};

/* =============================== explainer 5: every part tells the story =============================== */
const PT = {
  van: { label: 'Example 2’s van', X: 'D', Y: 'N', m: -0.4, b: 92, root: true, xu: 'km',
    g: { xmin: 0, xmax: 450, ymin: 0, ymax: 112, xstep: 50, ystep: 10, xlabels: 100, ylabels: 20, xtitle: 'D\\text{ (km)}', ytitle: 'N\\text{ (L)}', origin: true },
    rate: (m) => `uses <b>${n(-m)} L per km</b>`, start: (b) => `starts with <b>${n(b)} L</b>`, end: (m, b) => `runs dry at <b>${n(r1(-b / m))} km</b>`,
    start0: `The van: ${T('N=-0.4D+92')}. It uses 0.4 L per km, starts with 92 L, and runs dry at 230 km.`,
    ch: [
      { b: 60, note: '60 L start → dry at 150 km', cap: `A van that starts with only <b>60 L</b>: ${T('b=60')}. Only ${T('b')} changes, so the line <b>slides down</b>: same slope, <b>parallel</b>. It runs dry at ${T('60\\div0.4=150')} km.` },
      { m: -0.5, b: 92, note: '0.5 L/km → dry at 184 km', cap: `A <b>thirstier</b> van, 0.5 L per km: ${T('m=-0.5')}. The line <b>tilts</b> about the start ${T('(0,\\ 92)')}: steeper, so it runs dry sooner, at ${T('92\\div0.5=184')} km.` },
      { m: -0.25, b: 92, note: '0.25 L/km → dry at 368 km', cap: `A more <b>efficient</b> van, 0.25 L per km: ${T('m=-0.25')}. Flatter: it runs dry much later, at ${T('92\\div0.25=368')} km.` }
    ] },
  pay: { label: 'Example 4’s pay', X: 'S', Y: 'E', m: 0.1, b: 280, thin: true,
    g: { xmin: 0, xmax: 5000, ymin: 0, ymax: 1100, xstep: 500, ystep: 100, xlabels: 1000, ylabels: 200, xtitle: 'S\\ (\\$)', ytitle: 'E\\ (\\$)', origin: true },
    rate: (m) => `commission <b>${n(m * 100)}%</b>`, start: (b) => `base pay <b>$${n(b)}</b>`,
    start0: `Maria: ${T('E=0.10S+280')}. Commission 10% of sales, base pay $280.`,
    ch: [
      { b: 400, note: '$400 base → $120 more everywhere', cap: `A job with a <b>$400</b> base and the same 10% commission: ${T('b=400')}. The line <b>slides up</b> by 120: parallel, $120 more at every sales level.` },
      { m: 0.05, b: 280, note: '5% → flatter', cap: `The same $280 base but only <b>5%</b> commission: ${T('m=0.05')}. The line <b>tilts down</b> about ${T('(0,\\ 280)')}: sales add less.` },
      { m: 0.15, b: 280, note: '15% → steeper', cap: `A <b>15%</b> commission: ${T('m=0.15')}. Steeper: every $1\u202f000 of sales now adds $150. At ${T('S=5\\,000')} she earns ${T('0.15(5\\,000)+280=1\\,030')}.` }
    ] },
  hair: { label: 'Warm-up: hair', X: 't', Y: 'L', m: 1, b: 20, xu: 'months',
    g: { xmin: 0, xmax: 12.5, ymin: 0, ymax: 36, xstep: 1, ystep: 2, xlabels: 2, ylabels: 4, xtitle: 't\\text{ (months)}', ytitle: 'L\\text{ (cm)}', origin: true },
    rate: (m) => `grows <b>${n(m)} cm per month</b>`, start: (b) => `starts at <b>${n(b)} cm</b>`,
    start0: `A 20 cm ponytail growing 1 cm per month: ${T('L=1t+20')}.`,
    ch: [
      { b: 5, note: '5 cm start → parallel', cap: `After a short haircut, start at <b>5 cm</b>: ${T('b=5')}. The line slides down; it still grows 1 cm per month, so it is <b>parallel</b>.` },
      { m: 0.3, b: 1, note: 'fingernail: lower and flatter', cap: `A fingernail cut to 1 cm: ${T('L=0.3t+1')}. Lower start <b>and</b> a flatter line: 0.3 cm per month is slower than 1 cm per month.` },
      { m: 1, b: 20, note: 'back to the ponytail', cap: `Back to the ponytail. The <b>rate</b> sets the tilt and the <b>starting value</b> sets where the line meets the vertical axis.` }
    ] }
};
const parts = {
  title: 'Change the story, change the graph',
  height: 470,
  choices: Object.keys(PT).map((k) => ({ v: k, label: PT[k].label })),
  intro: 'The grey dashed line is the original. Each step changes one part of the story. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = PT[k], st = { m: d.m, b: d.b };
    const G = new Graph(stage, Object.assign({}, d.g, { x: 14, y: 14, width: 560, height: 440 }));
    if (d.thin) thinAxes(G);
    const P = panel(stage, 590, 14, ex.W - 604, 440, 'The equation and the story');
    const f = (x) => st.m * x + st.b;
    const ghost = G.line({ m: d.m, b: d.b }, { color: GRAY, width: 3, dash: '8 7', arrows: false }); ghost.style.display = 'none';
    const ln = G.curve(() => {
      const w = G.win; let a = w.xmin, b = w.xmax;
      if (d.root && st.m < 0) b = Math.min(b, -st.b / st.m);
      const pts = [[a, f(a)], [b, f(b)]].map((p) => [p[0], Math.max(w.ymin, Math.min(w.ymax, p[1]))]);
      return { subs: [pts.map((p) => G.toPx(p[0], p[1]))] };
    }, { color: LINE, width: 4.5 }, 'u7l6-pline', G.layers.data);
    const bpt = G.point(0, st.b, { color: BCOL, r: 9 });
    const rpt = d.root ? G.point(-st.b / st.m, 0, { color: RED, r: 7.5 }) : null;
    const eq = h('div', 'u7l6-bigeq'); P.appendChild(eq);
    const lm = line(P, '', 'u7l6-line u7l6-lm'), lb = line(P, '', 'u7l6-line u7l6-lb'), le = d.end ? line(P, '', 'u7l6-line u7l6-soft') : null;
    const hist = h('div', 'u7l6-hist', '<div class="u7l6-ph">What changed</div>'); P.appendChild(hist); hide(hist);
    const paint = () => {
      ln._bkDraw(); G.moveTo(bpt, 0, st.b); if (rpt) G.moveTo(rpt, -st.b / st.m, 0);
      eq.innerHTML = T(`${d.Y}=${cM(texNum(st.m))}${d.X}+${cB(tn(st.b))}`);
      lm.innerHTML = `${T(cM('m'))}: ${d.rate(st.m)}`; lb.innerHTML = `${T(cB('b'))}: ${d.start(st.b)}`;
      if (le) le.innerHTML = d.end(st.m, st.b);
    };
    paint();
    const to = (c, tgt) => { const a = { ...st }, z = { m: tgt.m ?? d.m, b: tgt.b ?? d.b }; return tween(c, 1100, (t) => { st.m = a.m + (z.m - a.m) * t; st.b = a.b + (z.b - a.b) * t; if (t >= 1) { st.m = z.m; st.b = z.b; } paint(); }); };
    const steps = [{ cap: d.start0, run: async (c) => { await drawIn(ln, 700, c); await pulse(c, bpt, 1.4); } }];
    d.ch.forEach((ch) => steps.push({ cap: ch.cap, run: async (c) => { ghost.style.display = ''; hist.style.opacity = 1; await to(c, ch); await show(c, line(hist, ch.note, 'u7l6-line')); } }));
    return steps;
  }
};

/* =============================== explainer 6: the trip, leg by leg =============================== */
const LEGS = [
  { k: '(a)', a: 0, b: 1, cls: 'u7l6-leg' }, { k: '(b)', a: 1, b: 2 }, { k: '(c)', a: 2, b: 3 }, { k: '(d)', a: 0, b: 3, whole: true }
].map((L) => { const { ts, ds, names } = TRIP; const run = ts[L.b] - ts[L.a], rise = ds[L.b] - ds[L.a]; return Object.assign(L, { run, rise, v: rise / run, name: names[L.a] + names[L.b], A: [ts[L.a], ds[L.a]] }); });
const legSpeed = (t) => { const { ts, ds } = TRIP; for (let i = 1; i < ts.length; i++) if (t < ts[i] + 1e-9) return (ds[i] - ds[i - 1]) / (ts[i] - ts[i - 1]); return 0; };
const trip = {
  title: 'Average speed on each leg of a trip',
  height: 470,
  choices: [{ v: 'ex3', label: 'Example 3 check' }],
  intro: 'The car drives up the road beside the distance axis. Watch the speedometer. Press <b>Next</b>.',
  make(stage, k, ex) {
    const G = new Graph(stage, Object.assign({}, FIG.ex3, { x: 146, y: 14, width: 450, height: 440, xmax: 8.4, ymax: 360 }));
    const col = new Column(stage, G, 14, 14, 'road', { icon: 'car', ghost: true, read: (v) => `${Math.round(v)} km`, start: 0 });
    const P = panel(stage, 610, 14, ex.W - 624, 440, 'Average speed');
    const sp = speedo(P); sp.set(0);
    const tb = h('table', 'u7l6-legtab', `<thead><tr><th>leg</th><th>rise ÷ run</th><th>km/h</th></tr></thead><tbody>${LEGS.map((L) => `<tr><td>${L.k} ${T(L.name.split('').join('\\to '))}</td><td></td><td></td></tr>`).join('')}</tbody>`);
    P.appendChild(tb);
    const rows = [...tb.querySelectorAll('tbody tr')];
    const tr = tracer(G, tripF, { from: 0, knots: TRIP.ts, onMove: (x, y) => { col.set(y); sp.set(x >= 7 - 1e-9 ? 0 : legSpeed(x)); } });
    const pts = TRIP.ts.map((t, i) => { const p = G.point(t, TRIP.ds[i], { color: INK, r: 6.5, label: T(TRIP.names[i]), pos: 'nw' }); p.style.display = 'none'; if (p.label) p.label.style.display = 'none'; return p; });
    const showPts = () => pts.forEach((p) => { p.style.display = ''; if (p.label) p.label.style.display = ''; });
    let last = null;
    const fill = async (c, i) => {
      const L = LEGS[i], r = rows[i];
      r.children[1].innerHTML = T(`\\tfrac{${L.rise}}{${L.run}}`); r.children[2].innerHTML = `<b>${L.whole ? '≈ ' + r1(L.v) : L.v}</b>`;
      await pop(c, r.children[2]);
    };
    const legStep = (i) => {
      const L = LEGS[i], vT = L.whole ? '\\approx45.7' : String(L.v);
      return {
        cap: `${L.k} ${T(L.name[0])} to ${T(L.name[1])}: rise ${T(cR(L.rise + '\\text{ km}'))} over run ${T(cU(L.run + '\\text{ h}'))}: ${T(`\\dfrac{${L.rise}}{${L.run}}=${vT}`)} km/h.${L.whole ? ` The segment joining ${T('O')} and ${T('R')} is dashed: it is not the road the car drove.` : ''}`,
        run: async (c) => {
          tr.hideDot(); tr.guides(false); if (last) last.ghost();
          if (L.whole) await G.drawIn(G.segment([0, 0], [7, 320], { color: RED, width: 3.5, dash: '9 7' }), 800, c);
          last = new SlopeTri(G, { x: L.A[0], y: L.A[1], run: L.run, rise: L.rise }, { runText: (v) => `<b>run</b> ${n(v)} h`, riseText: (v) => `<b>rise</b> ${n(v)} km`, fillOp: L.whole ? 0.05 : 0.12, w: L.whole ? 4 : 5 });
          await last.drawIn(c, 450); await fill(c, i);
        }
      };
    };
    return [
      { cap: `The trip: the car drives up the road while the point traces the graph. The speed changes at ${T('P')} and at ${T('Q')}: three legs, three steady speeds.`,
        run: async (c) => { await tr.go(c, 7, 5200); showPts(); for (const p of pts) await pop(c, p, 160); } },
      legStep(0), legStep(1), legStep(2), legStep(3),
      { cap: `What “average” means: a ghost car at a <b>steady</b> 45.7 km/h covers the same 320 km in the same 7 h. Graph: the dashed segment. They arrive together.`,
        run: async (c) => {
          if (last) last.ghost();
          const v = 320 / 7, gd = G.point(0, 0, { color: RED, r: 7.5, open: true });
          tr.showDot();
          await tween(c, 5200, (t) => { const x = 7 * t; tr.set(x); col.setGhost(v * x); G.moveTo(gd, x, v * x); sp.set(x >= 7 - 1e-9 ? 0 : legSpeed(x)); }, linear);
        } },
      { cap: `Fastest leg: ${T('P\\to Q')} at 60 km/h (the steepest piece). Slowest: ${T('Q\\to R')} at 30 km/h (the flattest). The whole-trip average, about 45.7 km/h, lies between them.`,
        run: async (c) => { rows[1].classList.add('u7l6-hi'); rows[2].classList.add('u7l6-lo'); await pulse(c, rows[1], 1.04); await pulse(c, rows[2], 1.04); } }
    ];
  }
};

/* =============================== explainer 7: average rate of change on a curve =============================== */
const SC = {
  car: { label: 'A car pulling away', kind: 'road', icon: 'car', f: (t) => 2 * t * t, x1: 10,
    g: { xmin: 0, xmax: 10.6, ymin: 0, ymax: 215, xstep: 1, ystep: 20, xlabels: 2, ylabels: 40, xtitle: '\\text{Time (s)}', ytitle: '\\text{Distance (m)}', origin: true },
    pairs: [[0, 4], [4, 8], [0, 10]], xu: 's', yu: 'm', per: 'm/s', read: (v) => `${Math.round(v)} m`,
    start: 'A car pulls away from a red light. The graph <b>curves</b> upward: the car keeps speeding up, so no single slope fits.',
    end: 'Different pairs of points give different average speeds. The second 4 s averaged <b>3 times</b> the speed of the first 4 s.' },
  tea: { label: 'Tea cooling', kind: 'thermo', f: (t) => 20 + 80 * Math.pow(0.5, t / 10), x1: 30,
    g: { xmin: 0, xmax: 32, ymin: 0, ymax: 110, xstep: 2, ystep: 10, xlabels: 10, ylabels: 20, xtitle: '\\text{Time (min)}', ytitle: '\\text{Temperature }(^\\circ\\text{C})', origin: true },
    pairs: [[0, 10], [10, 20], [20, 30], [0, 30]], xu: 'min', yu: '°C', per: '°C/min', read: (v) => `${Math.round(v)} °C`,
    start: 'Tea from the kettle cools fast at first, then more and more slowly: the graph <b>curves</b>.',
    end: 'Each 10 min the average rate halves: −4, −2, −1 °C/min. The 30-min average, about −2.3 °C/min, hides all of that.' }
};
const secant = {
  title: 'Average rate of change on a curve',
  height: 470,
  choices: Object.keys(SC).map((k) => ({ v: k, label: SC[k].label })),
  intro: 'Two points on a curve, joined by a straight segment (a secant). Its slope is the average rate between them. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = SC[k], f = d.f;
    const G = new Graph(stage, Object.assign({}, d.g, { x: 146, y: 14, width: 450, height: 440 }));
    const col = new Column(stage, G, 14, 14, d.kind, { icon: d.icon, read: d.read, start: f(0) });
    const P = panel(stage, 610, 14, ex.W - 624, 440, 'Average rates');
    const tr = tracer(G, f, { from: 0, N: 120, onMove: (x, y) => col.set(y) });
    let last = null, lastSeg = null;
    const steps = [{ cap: d.start, run: async (c) => { await tr.go(c, d.x1, 3200); tr.hideDot(); tr.guides(false); } }];
    d.pairs.forEach(([a, b]) => {
      const ya = f(a), yb = f(b), rise = yb - ya, run = b - a, v = rise / run, exact = Math.abs(v - Math.round(v)) < 1e-9;
      const vS = exact ? n(v) : '≈ ' + n(r1(v)), vT = exact ? `=${texNum(v)}` : `\\approx${texNum(r1(v))}`;
      steps.push({
        cap: `From ${T(`t=${a}`)} to ${T(`t=${b}`)} ${d.xu}: ${T(`\\dfrac{${cR(tn(r1(yb)) + '-' + tn(r1(ya)))}}{${cU(b + '-' + a)}}=\\dfrac{${texNum(r1(rise))}}{${run}}${vT}`)} ${d.per}.`,
        run: async (c) => {
          if (last) { last.ghost(); lastSeg.style.opacity = 0.35; }
          const pa = G.point(a, ya, { color: NOW, r: 7 }), pb = G.point(b, yb, { color: NOW, r: 7 });
          await pop(c, pa, 200); await pop(c, pb, 200);
          lastSeg = G.segment([a, ya], [b, yb], { color: RED, width: 3.5 }); await G.drawIn(lastSeg, 500, c);
          last = new SlopeTri(G, { x: a, y: ya, run, rise }, { runSide: rise >= 0 ? 's' : 'n', riseSide: b >= d.x1 ? 'w' : 'e', runText: (q) => `<b>run</b> ${n(q)} ${d.xu}`, riseText: (q) => `<b>rise</b> ${n(r1(q))} ${d.yu}`, fillOp: 0.08 });
          await last.drawIn(c, 400);
          await tween(c, 900, (t) => col.set(f(a + (b - a) * t)));
          await show(c, line(P, `${T(`${a}\\to${b}`)} ${d.xu}: <b>${vS} ${d.per}</b>`, 'u7l6-line u7l6-l21'));
        }
      });
    });
    steps.push({ cap: d.end, run: async (c) => { const s = line(P, 'steeper secant = faster average change', 'u7l6-line u7l6-soft'); await show(c, s); } });
    return steps;
  }
};

/* =============================== explainer 8: Maria's pay =============================== */
const payF = (S) => 0.1 * S + 280;
const pay = {
  title: 'Base pay plus commission',
  height: 470,
  choices: [{ v: 'ex4', label: 'Example 4 check' }],
  intro: 'Maria’s weekly pay is a stack: a fixed <b class="u7l6-c-b">base</b> plus a <b class="u7l6-c-rise">commission</b> that grows with sales. Press <b>Next</b>.',
  make(stage, k, ex) {
    const G = thinAxes(new Graph(stage, Object.assign({}, FIG.ex4, { x: 146, y: 14, width: 450, height: 440, xmax: 5200, ymax: 850 })));
    const col = new Column(stage, G, 14, 14, 'pay', { base: 280, read: (v) => `$${Math.round(v)}`, start: 0 });
    const P = panel(stage, 610, 14, ex.W - 624, 440, 'Maria’s pay');
    const sales = pill(P, 'sales: —', 'u7l6-clock');
    const setS = (S) => { sales.innerHTML = `sales: <b>$${n(Math.round(S))}</b>`; };
    let Tr = null;
    return [
      { cap: `(a) Week 1: sales $2${'\u202f'}800, earnings $560. Week 2: sales $4${'\u202f'}600, earnings $740. Plot both points and join them.`,
        run: async (c) => {
          setS(2800); col.set(560); await G.reveal(G.point(2800, 560, { color: INK, r: 7, label: T(pairTex(tn(2800), 560)), pos: 'nw' }), c);
          setS(4600); col.set(740); await G.reveal(G.point(4600, 740, { color: INK, r: 7, label: T(pairTex(tn(4600), 740)), pos: 'nw' }), c);
          await G.drawIn(G.segment([2800, 560], [4600, 740], { color: LINE, width: 4.5 }), 600, c);
        } },
      { cap: `(b) The run is ${T(cU('\\$1\\,800'))} more sales; the rise is ${T(cR('\\$180'))} more earnings.`,
        run: async (c) => { Tr = new SlopeTri(G, { x: 2800, y: 560, run: 1800, rise: 180 }, { riseSide: 'w', runText: () => '<b>run</b> $1\u202f800', riseText: () => '<b>rise</b> $180' }); await Tr.drawIn(c, 500); } },
      { cap: `${T(`m=\\dfrac{${cR('180')}}{${cU('1\\,800')}}=0.1`)}: Maria earns <b>$0.10 for every $1</b> she sells. That is her <b>commission rate</b>.`,
        run: async (c) => { await show(c, line(P, T(`m=\\dfrac{180}{1\\,800}=${cM('0.1')}`), 'u7l6-mline')); } },
      { cap: `(c) As a percent: ${T('0.1=10\\%')}. Ten cents of every sales dollar.`,
        run: async (c) => { await show(c, line(P, `${T('0.1=10\\%')} commission`, 'u7l6-line')); } },
      { cap: `Her base salary is her pay on ${T('\\$0')} of sales. Slide back along the line to ${T('S=0')}: the commission shrinks to nothing and ${T(cB('\\$280'))} is left.`,
        run: async (c) => {
          Tr.ghost();
          const tr = tracer(G, payF, { from: 2800, onMove: (x, y) => { col.set(y); setS(x); } }); await tr.go(c, 0, 2200); tr.hideDot(); tr.guides(false);
          await G.reveal(G.point(0, 280, { color: BCOL, r: 9, label: T(cB('(0,\\ 280)')), pos: 'ne' }), c);
          await show(c, line(P, T(`560=0.1(2\\,800)+b`), 'u7l6-mline'));
          await show(c, line(P, T(`560=280+b\\Rightarrow ${cB('b=280')}`), 'u7l6-mline'));
        } },
      { cap: `${T(`E=${cM('0.10')}S+${cB('280')}`)}: the slope is the commission rate; the intercept is the base pay.`,
        run: async (c) => {
          await G.drawIn(G.segment([4600, 740], [5200, 800], { color: LINE, width: 4.5 }), 400, c);
          const e = h('div', 'u7l6-bigeq', T(`E=${cM('0.10')}S+${cB('280')}`)); P.appendChild(e); await pop(c, e);
          const lb = G.label(150, 200, '<b>b = 280</b>: base pay', { pos: 'e', cls: 'u7l6-call u7l6-call-b' }); await pop(c, lb);
        } },
      { cap: `Check with week 2: ${T('0.1(4\\,600)+280=460+280=740')} ✓.`,
        run: async (c) => { setS(4600); col.set(740); await show(c, line(P, `check: ${T('0.1(4\\,600)+280=740')} ✓`, 'u7l6-line u7l6-ok')); } },
      { cap: `(d) Earned $410: go across from 410 to the line, then down: ${T('S=1\\,300')}. Algebra: ${T('410=0.1S+280')}, ${T('130=0.1S')}, ${T('S=1\\,300')}.`,
        run: async (c) => {
          const hl = G.segment([0, 410], [1300, 410], { color: NOW, width: 3, dash: '8 6' }); await G.drawIn(hl, 600, c);
          const vl = G.segment([1300, 410], [1300, 0], { color: NOW, width: 3, dash: '8 6' }); await G.drawIn(vl, 500, c);
          await G.reveal(G.point(1300, 410, { color: NOW, r: 8, label: T(pairTex(tn(1300), 410)), pos: 'se' }), c);
          setS(1300); col.set(410);
          await show(c, line(P, `(d) ${T('130=0.1S\\Rightarrow S=1\\,300')}`, 'u7l6-mline'));
        } }
    ];
  }
};

/* =============================== explainer 9: forwards and backwards =============================== */
const MC = {
  ex4d: { label: 'Example 4(d) check', eq: 'E=0.1S+280', inV: 'S', outV: 'E', ops: [{ f: '\\times0.1', b: '\\div0.1', fn: (x) => 0.1 * x, inv: (y) => y / 0.1 }, { f: '+280', b: '-280', fn: (x) => x + 280, inv: (y) => y - 280 }],
    fwd: 2800, back: 410, unitIn: '$', unitOut: '$', fwdCap: 'Week 1: sales $2\u202f800 in.', backCap: 'Three weeks ago she <b>earned $410</b>. What were her sales?', ansCap: (v) => `Her sales were <b>$${n(v)}</b>.` },
  van: { label: 'Van: when is 50 L left?', eq: 'N=-0.4D+92', inV: 'D', outV: 'N', ops: [{ f: '\\times(-0.4)', b: '\\div(-0.4)', fn: (x) => -0.4 * x, inv: (y) => y / -0.4 }, { f: '+92', b: '-92', fn: (x) => x + 92, inv: (y) => y - 92 }],
    fwd: 150, back: 50, unitIn: '', unitOut: '', fwdCap: 'Forwards: 150 km driven.', backCap: 'Backwards: the gauge reads <b>50 L</b>. How far has the van driven?', ansCap: (v) => `The van has driven <b>${n(v)} km</b>.` },
  oven: { label: 'Oven: when is it 350 °F?', eq: 'T=55t+65', inV: 't', outV: 'T', ops: [{ f: '\\times55', b: '\\div55', fn: (x) => 55 * x, inv: (y) => y / 55 }, { f: '+65', b: '-65', fn: (x) => x + 65, inv: (y) => y - 65 }],
    fwd: 5, back: 350, unitIn: '', unitOut: '', fwdCap: 'Forwards: 5 min after switching on.', backCap: 'Backwards: when does the oven reach <b>350 °F</b>?', ansCap: (v) => `After about <b>${n(r1(v))} min</b> (${n(Math.round(v * 1000) / 1000)}…).` }
};
const machine = {
  title: 'The equation as a machine: forwards and backwards',
  height: 440,
  choices: Object.keys(MC).map((k) => ({ v: k, label: MC[k].label })),
  intro: (k) => `${T(MC[k].eq)}: multiply, then add. Backwards, undo the last step first. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = MC[k], W = ex.W, xs = [0.11, 0.37, 0.63, 0.89].map((f) => f * W), y = 120, bw = 160, bh = 66;
    const svg = add(stage, svgEl('svg', { width: W, height: 230, viewBox: `0 0 ${W} 230` }), 0, 0);
    const node = (i, html, cls) => add(stage, box(h('div', 'u7l6-mnode ' + cls, html), bw, bh), xs[i] - bw / 2, y - bh / 2);
    node(0, T(d.inV), 'u7l6-mio'); node(1, T(d.ops[0].f), 'u7l6-mop'); node(2, T(d.ops[1].f), 'u7l6-mop'); node(3, T(d.outV), 'u7l6-mio');
    const arrow = (x1, x2, yy, color) => { const g = svgEl('g', {}, svg); svgEl('line', { x1, x2, y1: yy, y2: yy, stroke: color, 'stroke-width': 4, class: 'bk-stroke' }, g); const s = Math.sign(x2 - x1); svgEl('polygon', { points: `${x2},${yy} ${x2 - s * 14},${yy - 8} ${x2 - s * 14},${yy + 8}`, fill: color }, g); return g; };
    const fa = [0, 1, 2].map((i) => arrow(xs[i] + bw / 2 + 4, xs[i + 1] - bw / 2 - 4, y - 14, LINE));
    const ba = [0, 1, 2].map((i) => { const g = arrow(xs[i + 1] - bw / 2 - 4, xs[i] + bw / 2 + 4, y + 18, NOW); g.style.display = 'none'; return g; });
    const binv = [1, 2].map((i) => { const e = add(stage, h('div', 'u7l6-minv', T(d.ops[i - 1].b)), xs[i], y + bh / 2 + 6); e.style.translate = '-50% 0'; e.style.display = 'none'; return e; });
    const val = (i, v, row) => { const e = add(stage, h('div', 'u7l6-mval u7l6-mval-' + row, T(tn(r1(v) === v ? v : Math.round(v * 1000) / 1000))), xs[i], row === 'f' ? y - bh / 2 - 44 : y + bh / 2 + 52); e.style.translate = '-50% 0'; return e; };
    const A = add(stage, box(h('div', 'u7l6-malg u7l6-big'), W - 28, 186), 14, 240);
    const f1 = d.ops[0].fn(d.fwd), f2 = d.ops[1].fn(f1), b1 = d.ops[1].inv(d.back), b2 = d.ops[0].inv(b1);
    const [o0, o1] = d.ops;
    return [
      { cap: `${T(d.eq)} as a machine: ${T(d.inV)} goes in, is multiplied (${T(o0.f)}), then has a number added (${T(o1.f)}), and ${T(d.outV)} comes out.`,
        run: async (c) => { for (const a of fa) await drawIn(a.firstChild, 300, c); } },
      { cap: `${d.fwdCap} ${T(`${tn(d.fwd)}${o0.f.replace('\\times', '\\times ')}=${tn(f1)}`)}, then ${T(`${tn(f1)}${o1.f}=${tn(f2)}`)}.`,
        run: async (c) => {
          for (const [i, v] of [[0, d.fwd], [1, f1], [3, f2]]) await pop(c, val(i, v, 'f'), 260);
          await show(c, line(A, `forwards: ${T(`${d.outV}=${d.eq.split('=')[1].replace(d.inV, `(${tn(d.fwd)})`)}=${tn(f2)}`)}`, 'u7l6-mline'));
        } },
      { cap: `${d.backCap} Run the machine <b>in reverse</b>: undo the last step first (${T(o1.b)}), then the first (${T(o0.b)}).`,
        run: async (c) => { for (const a of ba) { a.style.display = ''; await drawIn(a.firstChild, 260, c); } for (const e of binv) { e.style.display = ''; await pop(c, e, 240); } await pop(c, val(3, d.back, 'b'), 260); } },
      { cap: `Undo ${T(o1.f)}: ${T(`${tn(d.back)}${o1.b}=${tn(b1)}`)}.`,
        run: async (c) => { await pop(c, val(1, b1, 'b'), 260); await show(c, line(A, `backwards: ${T(`${tn(d.back)}=${d.eq.split('=')[1]}`)} → ${T(`${tn(b1)}=${d.eq.split('=')[1].split(/[+-](?=\d+$)/)[0]}`)}`, 'u7l6-mline')); } },
      { cap: `Undo ${T(o0.f)}: ${T(`${tn(b1)}${o0.b}${b2 === Math.round(b2) ? '=' : '\\approx'}${tn(b2 === Math.round(b2) ? b2 : r1(b2))}`)}. ${d.ansCap(b2)}`,
        run: async (c) => {
          await pop(c, val(0, b2 === Math.round(b2) ? b2 : r1(b2), 'b'), 260);
          await show(c, line(A, T(`${d.inV}${b2 === Math.round(b2) ? '=' : '\\approx'}${tn(b2 === Math.round(b2) ? b2 : r1(b2))}`), 'u7l6-mline'));
          const s = stamp(A, 'undone', { ok: true }); s.classList.add('u7l6-mstamp'); await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== mount =============================== */
mountWarm();
mountFigures();
export const explainers = mountExplainers({ sync, sentence, van, routes, parts, trip, secant, pay, machine });
export const _test = { SY, SE, RT, PT, LEGS, SC, MC, tripF, vanF, payF };
