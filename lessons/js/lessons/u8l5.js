/* Math 10C · Unit 8 · Lesson 5 — Mixture and Motion: More Applications of Linear Systems.
 * Warm-up river/sky scene (paddle buttons) and the explainers:
 *   roundTrip (warm-up big one: calm vs windy round trip, the times don't cancel), mixPour (two hoppers pour into a mix
 *   while the amount × rate = value organizer fills; the Amount and Value columns give the equations), mixSolve
 *   (Examples 1–2: clear decimals, substitution with the expression lifting across, graph, check both), mixLever (the
 *   mixture rate is the balance point of the amounts), dstTri (cover the quantity you want in the d-s-t triangle),
 *   trip (Example 3: take the stops out of the timeline, fill the motion organizer, solve, drive it), current (a boat or
 *   plane with the current or wind arrow adding to or subtracting from its speed; each trip's d/t gives an equation),
 *   speedSolve (Examples 4–5: the still-water speed is halfway between the two ground speeds; add to eliminate, graph,
 *   check both trips).
 * Colours: Eq. 1 / amount / time / with the current = brand blue; Eq. 2 / value / distance / against = amber;
 * solution = purple; the current or wind = water blue. */
import {
  h, tex, add, box, place, Graph, NumberLine, ValueTable, checkCard, stamp, stampIn, mountExplainers, pop, fadeIn, anim,
  sleep, tween, svgEl, liveCtx, pulse, arrowHead, linear, COLORS
} from '../blocks.js';

const T = (s) => tex(String(s));
const BLUE = COLORS.blue, AMB = COLORS.amber, PUR = COLORS.purple, INK = COLORS.ink, GRAY = COLORS.gray, RED = COLORS.red, GRN = COLORS.green, TEAL = COLORS.teal;
const WATER = '#3d8fd6';
const S = svgEl;
const tc = (color, s) => `\\textcolor{${color}}{${s}}`;
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u8l5-panel ' + cls, title ? `<div class="u8l5-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => add(p, h('div', 'u8l5-line ' + cls, html));
const show = (c, el, ms = 320) => fadeIn(c, el, ms);
const hide0 = (el) => { el.style.opacity = 0; return el; };
const thin = (n) => (Math.abs(n) >= 1000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : String(n));
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
let UID = 0; const uid = (p) => `u8l5${p}${++UID}`;
/** offset of el inside an ancestor (through the offsetParent chain) */
function offIn(el, anc) { let x = 0, y = 0; while (el && el !== anc) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return [x, y]; }
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (a) => '#' + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mixHex = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
const saltCol = (p) => mixHex('#e6f2fb', '#12509a', p);
/** hours as "1 h 40 min" */
function fmtHM(hrs) { const m = Math.round(hrs * 60), hh = Math.floor(m / 60), mm = m % 60; return mm ? (hh ? `${hh} h ${mm} min` : `${mm} min`) : `${hh} h`; }
/** p/q as TeX: an integer, a short decimal, or a mixed number */
function qTex(p, q) {
  const v = p / q; if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  const d = String(parseFloat(v.toFixed(6))); if (d.length <= 5) return d;
  let P = Math.round(p * 1000), Q = Math.round(q * 1000); const g = gcd(P, Q); P /= g; Q /= g;
  const w = Math.floor(P / Q), r = P - w * Q; return (w || '') + `\\tfrac{${r}}{${Q}}`;
}
/** the amount × rate = value / distance = speed × time organizer: a ValueTable with its own column widths */
class Org extends ValueTable {
  _tmpl() { const o = this.o; this.grid.style.gridTemplateColumns = o.colW.map((w) => w + 'px').join(' '); this.grid.style.gridAutoRows = o.cellH + 'px'; }
}
const th = (top, unit) => ({ html: `<div class="u8l5-thw">${top}</div>` + (unit ? `<div class="u8l5-thu">${unit}</div>` : '') });
const OP = (s) => `<b class="u8l5-op">${s}</b>`;
function clearHl(tb) { ['u8l5-hb', 'u8l5-ha', 'u8l5-hx', 'bk-hl'].forEach((k) => { tb.cells.forEach((r) => r.forEach((e) => e.classList.remove(k))); tb.heads.forEach((e) => e.classList.remove(k)); }); }
/** lift a copy of `fromEl` and fly it onto `toEl` (both inside stage) */
async function fly(c, stage, fromEl, toEl, html) {
  const [x0, y0] = offIn(fromEl, stage), [x1, y1] = offIn(toEl, stage);
  const chip = add(stage, h('div', 'u8l5-fly', html), x0 - 6, y0 - 4);
  await anim(c, chip, [{ transform: 'translate(0px, 0px) scale(1)' }, { transform: `translate(${(x1 - x0) / 2}px, ${(y1 - y0) / 2 - 30}px) scale(1.15)` }, { transform: `translate(${x1 - x0}px, ${y1 - y0}px) scale(1)` }], 900);
  chip.remove();
}
/** a plain arrow (line + head) in an svg */
function arrow(parent, x1, y1, x2, y2, color, width = 6, cls = '') {
  const g = S('g', { class: 'u8l5-arr ' + cls }, parent), L = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / L, uy = (y2 - y1) / L, back = Math.min(L, 10 + width * 1.6);
  S('line', { x1, y1, x2: x2 - ux * back * 0.6, y2: y2 - uy * back * 0.6, stroke: color, 'stroke-width': width, 'stroke-linecap': 'round' }, g);
  arrowHead(g, x2, y2, ux, uy, { width: Math.min(width, 5), color });
  return g;
}
/** a two-headed dimension arrow */
function dim(parent, x1, x2, y, color) {
  const g = S('g', { class: 'u8l5-dim' }, parent);
  S('line', { x1: x1 + 4, y1: y, x2: x2 - 4, y2: y, stroke: color, 'stroke-width': 3 }, g);
  arrowHead(g, x2, y, 1, 0, { width: 3, color }); arrowHead(g, x1, y, -1, 0, { width: 3, color });
  return g;
}

/* =============================== vehicles =============================== */
function drawVehicle(parent, kind) {
  const g = S('g', { class: 'u8l5-veh' }, parent), inner = S('g', {}, g);
  if (kind === 'kayak') {
    S('path', { d: 'M-48 0 C-30 13 30 13 48 0 C30 -5 -30 -5 -48 0 Z', fill: '#d2453a', stroke: INK, 'stroke-width': 2 }, inner);
    S('rect', { x: -7, y: -26, width: 14, height: 22, rx: 5, fill: '#e8a01e', stroke: INK, 'stroke-width': 1.6 }, inner);
    S('circle', { cx: 0, cy: -33, r: 8, fill: '#ffe1b8', stroke: INK, 'stroke-width': 1.6 }, inner);
    S('line', { x1: -26, y1: 4, x2: 28, y2: -36, stroke: INK, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, inner);
    S('ellipse', { cx: 30, cy: -38, rx: 9, ry: 4, fill: '#e8a01e', stroke: INK, 'stroke-width': 1.2, transform: 'rotate(-36 30 -38)' }, inner);
  } else if (kind === 'ferry') {
    S('path', { d: 'M-62 -6 L62 -6 L50 14 L-56 14 Z', fill: '#f4f1ea', stroke: INK, 'stroke-width': 2.2 }, inner);
    S('rect', { x: -56, y: 6, width: 106, height: 6, fill: '#c93a33' }, inner);
    S('rect', { x: -34, y: -26, width: 58, height: 20, rx: 3, fill: '#fff', stroke: INK, 'stroke-width': 2 }, inner);
    for (let i = 0; i < 4; i++) S('rect', { x: -28 + i * 13, y: -21, width: 8, height: 8, rx: 1.5, fill: '#8fc3ea' }, inner);
    S('rect', { x: 8, y: -40, width: 9, height: 14, fill: '#c93a33', stroke: INK, 'stroke-width': 1.6 }, inner);
  } else {
    S('path', { d: 'M-52 -4 C-40 -12 30 -12 46 -6 C58 -3 58 5 46 7 C30 10 -40 10 -52 4 Z', fill: '#fff', stroke: INK, 'stroke-width': 2.2 }, inner);
    S('path', { d: 'M-6 -4 L-24 -36 L-12 -36 L14 -4 Z', fill: '#d2453a', stroke: INK, 'stroke-width': 1.8 }, inner);
    S('path', { d: 'M-6 6 L-20 30 L-9 30 L14 6 Z', fill: '#d2453a', stroke: INK, 'stroke-width': 1.8 }, inner);
    S('path', { d: 'M-50 -3 L-60 -22 L-50 -22 L-38 -6 Z', fill: '#d2453a', stroke: INK, 'stroke-width': 1.6 }, inner);
    for (let i = 0; i < 4; i++) S('circle', { cx: 14 + i * 8, cy: -2, r: 2.4, fill: '#5d9fd8' }, inner);
  }
  g.inner = inner; g.flip = (left) => inner.setAttribute('transform', left ? 'scale(-1 1)' : '');
  g.at = (x, y) => { g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); g.px = x; g.py = y; };
  return g;
}
/** a group of current/wind streaks drifting in direction dir (+1 right, −1 left) */
function streaks(parent, x0, x1, ys, dir, color, cls = '') {
  const g = S('g', { class: 'u8l5-streaks ' + cls }, parent);
  const n = Math.max(3, Math.round((x1 - x0) / 150));
  ys.forEach((y, j) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + (i + (j % 2) * 0.5 + 0.25) * (x1 - x0) / n, s = S('g', { class: 'u8l5-streak ' + (dir > 0 ? 'u8l5-dr' : 'u8l5-dl') }, g);
      s.style.animationDelay = (-((i * 0.37 + j * 0.53) % 1.6)).toFixed(2) + 's';
      arrow(s, x - dir * 24, y, x + dir * 24, y, color, 3.5);
    }
  });
  return g;
}

/* =============================== warm-up scene =============================== */
function mountWarm() {
  const host = document.getElementById('u8l5-scene'); if (!host) return;
  const svg = S('svg', { viewBox: '0 0 1000 290', class: 'u8l5-wsvg' }, host);
  // river
  S('rect', { x: 0, y: 0, width: 490, height: 290, rx: 16, fill: '#8cc26c' }, svg);
  S('path', { d: 'M0 70 C120 58 300 82 490 66 L490 230 C320 242 140 218 0 232 Z', fill: '#79b6e6' }, svg);
  streaks(svg, 10, 480, [104, 200], 1, '#fff', 'u8l5-on');
  const kay = drawVehicle(svg, 'kayak'); kay.at(245, 158);
  const pill = (x, y, txt, cls = '') => { const t = S('text', { x, y, class: 'u8l5-wt ' + cls, 'text-anchor': 'middle' }, svg); t.textContent = txt; return t; };
  pill(245, 36, 'paddles 6 km/h in still water');
  pill(245, 270, 'current 2 km/h →');
  pill(48, 165, '← up', 'u8l5-wt-sm'); pill(446, 165, 'down →', 'u8l5-wt-sm');
  // sky
  const sky = S('g', {}, svg);
  S('rect', { x: 510, y: 0, width: 490, height: 290, rx: 16, fill: '#e3effb' }, sky);
  S('rect', { x: 510, y: 222, width: 490, height: 68, fill: '#b9d79e' }, sky);
  S('rect', { x: 510, y: 270, width: 490, height: 20, fill: '#b9d79e' }, sky);
  [[600, 60], [880, 92], [760, 40]].forEach(([x, y]) => { S('ellipse', { cx: x, cy: y, rx: 40, ry: 13, fill: '#fff' }, sky); S('ellipse', { cx: x + 22, cy: y - 8, rx: 24, ry: 12, fill: '#fff' }, sky); });
  streaks(sky, 540, 980, [130, 180], 1, '#7d8ea3', 'u8l5-on');
  S('line', { x1: 570, y1: 222, x2: 930, y2: 222, stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '10 8' }, sky);
  S('circle', { cx: 570, cy: 222, r: 9, fill: INK }, sky); S('circle', { cx: 930, cy: 222, r: 9, fill: INK }, sky);
  pill(575, 254, 'Home', 'u8l5-wt-sm'); pill(925, 254, 'Lake Town', 'u8l5-wt-sm'); pill(755, 254, '600 km', 'u8l5-wt-sm');
  const pl = drawVehicle(sky, 'plane'); pl.at(755, 140);
  pill(755, 36, 'wind 60 km/h →');
  pill(755, 210, '300 km/h in still air', 'u8l5-wt-sm');
  const msg = document.getElementById('u8l5-scenemsg');
  let gen = 0;
  const go = async (dir) => {
    const g = ++gen, c = liveCtx(), spd = dir > 0 ? 8 : 4, x0 = dir > 0 ? 60 : 430, x1 = dir > 0 ? 430 : 60;
    msg.textContent = ''; kay.flip(dir < 0); kay.at(x0, 158);
    await tween(c, 16000 / spd, (t) => { if (g !== gen) return false; kay.at(x0 + (x1 - x0) * t, 158 + Math.sin(t * 18) * 2); }, linear);
    if (g === gen) msg.textContent = dir > 0 ? 'Downstream: 6 + 2 = 8 km/h' : 'Upstream: 6 − 2 = 4 km/h (twice as long)';
  };
  document.getElementById('u8l5-down').addEventListener('click', () => go(1));
  document.getElementById('u8l5-up').addEventListener('click', () => go(-1));
}

/* =============================== warm-up explainer: the round trip =============================== */
const RT = {
  big: { label: 'The big one: 60 km/h wind', b: 300, w: 60, d: 600, A: 'Home', B: 'Lake Town', calm: 'Still air', med: 'wind', veh: 'plane' },
  strong: { label: 'A 150 km/h wind', b: 300, w: 150, d: 600, A: 'Home', B: 'Lake Town', calm: 'Still air', med: 'wind', veh: 'plane' },
  kayak: { label: 'The kayak: 12 km each way', b: 6, w: 2, d: 12, A: 'Dock', B: 'Bridge', calm: 'Still water', med: 'current', veh: 'kayak' }
};
const roundTrip = {
  title: 'There and back: does the wind cancel out?',
  height: 410,
  choices: [{ v: 'big', label: RT.big.label }, { v: 'strong', label: RT.strong.label }, { v: 'kayak', label: RT.kayak.label }],
  intro: (k) => `Two trips, ${RT[k].d} km each way: one in ${RT[k].calm.toLowerCase()}, one with a ${RT[k].w} km/h ${RT[k].med} that helps out and fights back. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = RT[k], W = ex.W, calm = d.d / d.b, out = d.d / (d.b + d.w), back = d.d / (d.b - d.w), tot = out + back;
    const tmax = Math.ceil(tot + 0.4), RW = 500, R0 = 110, BX = RW + 60, BW = W - BX - 30, hx = (t) => BX + t / tmax * BW;
    const svg = S('svg', { width: W, height: 410, viewBox: `0 0 ${W} 410`, class: 'u8l5-rtsvg' }); add(stage, svg, 0, 0);
    const ov = add(stage, box(h('div', 'u8l5-ov'), W, 410), 0, 0);
    const lab = (x, y, html, pos = 'c', cls = '') => ov.appendChild(place(h('div', 'u8l5-lab ' + cls, html), x, y, pos, 4));
    const lanes = [0, 1].map((i) => {
      const y0 = 12 + i * 168, ry = y0 + 108;
      S('rect', { x: 10, y: y0, width: W - 20, height: 150, rx: 14, fill: i ? '#eef5fd' : '#f6f4ee', stroke: '#ddd6c6' }, svg);
      lab(24, y0 + 8, i ? `<b>With a ${d.w} km/h ${d.med}</b> <span class="u8l5-muted">(helps out, fights back)</span>` : `<b>${d.calm}</b>`, 'se', 'u8l5-lanelab');
      if (i) streaks(svg, R0, RW, [y0 + 70], 1, '#8aa4c0', 'u8l5-on');
      S('line', { x1: R0, y1: ry, x2: RW, y2: ry, stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '9 7' }, svg);
      S('circle', { cx: R0, cy: ry, r: 7, fill: INK }, svg); S('circle', { cx: RW, cy: ry, r: 7, fill: INK }, svg);
      lab(R0, ry + 8, d.A, 's', 'u8l5-town'); lab(RW, ry + 8, d.B, 's', 'u8l5-town');
      const vy = ry - (d.veh === 'kayak' ? 24 : 34), v = drawVehicle(svg, d.veh); v.at(R0, vy);
      // time axis
      const by = y0 + 52;
      S('line', { x1: BX, y1: by + 44, x2: BX + BW, y2: by + 44, stroke: '#8a8f99', 'stroke-width': 2 }, svg);
      for (let t = 0; t <= tmax; t++) { S('line', { x1: hx(t), y1: by + 38, x2: hx(t), y2: by + 50, stroke: '#8a8f99', 'stroke-width': 2 }, svg); lab(hx(t), by + 52, `${t}`, 's', 'u8l5-tick'); }
      lab(BX + BW, by + 74, 'hours', 'w', 'u8l5-tick');
      const clk = lab(BX, y0 + 10, '0 h', 'se', 'u8l5-clock');
      return { y0, ry, v, by, clk, vy };
    });
    const seg = (L, t0, t1, color, text) => {
      const r = S('rect', { x: hx(t0), y: L.by, width: Math.max(0, hx(t1) - hx(t0)), height: 36, rx: 6, fill: color }, svg);
      const tl = lab((hx(t0) + hx(t1)) / 2, L.by + 18, text, 'c', 'u8l5-seglab'); tl.style.opacity = 0;
      return { r, tl, set(t) { r.setAttribute('width', Math.max(0, hx(t0 + (t1 - t0) * t) - hx(t0))); } };
    };
    const fly1 = async (c, L, t0, dur, dir, sg) => {
      L.v.flip(dir < 0);
      const xa = dir > 0 ? R0 : RW, xb = dir > 0 ? RW : R0;
      sg.set(0);
      await tween(c, 900 + dur * 650, (t) => { L.v.at(xa + (xb - xa) * t, L.vy); sg.set(t); L.clk.textContent = fmtHM(t0 + dur * t); }, linear);
      await pop(c, sg.tl, 260);
    };
    const sA1 = seg(lanes[0], 0, calm, '#7fb7b2', fmtHM(calm)), sA2 = seg(lanes[0], calm, 2 * calm, '#4f948e', fmtHM(calm));
    const sB1 = seg(lanes[1], 0, out, BLUE, fmtHM(out)), sB2 = seg(lanes[1], out, tot, AMB, fmtHM(back));
    [sA1, sA2, sB1, sB2].forEach((s) => s.set(0));
    const res = hide0(lab(W / 2 - 60, 372, '', 'c', 'u8l5-rtres'));
    return [
      { cap: `${d.calm}: ${T(`${d.d}\\div${d.b}=${qTex(d.d, d.b)}`)} h each way, so <b>${fmtHM(2 * calm)}</b> there and back.`,
        run: async (c) => { await fly1(c, lanes[0], 0, calm, 1, sA1); await fly1(c, lanes[0], calm, calm, -1, sA2); } },
      { cap: `Out <b>with</b> the ${d.med}: ${T(`${d.b}+${d.w}=${d.b + d.w}`)} km/h, so ${T(`${d.d}\\div${d.b + d.w}=${qTex(d.d, d.b + d.w)}`)} h <b>= ${fmtHM(out)}</b>.`,
        run: (c) => fly1(c, lanes[1], 0, out, 1, sB1) },
      { cap: `Back <b>into</b> the ${d.med}: ${T(`${d.b}-${d.w}=${d.b - d.w}`)} km/h, so ${T(`${d.d}\\div${d.b - d.w}=${qTex(d.d, d.b - d.w)}`)} h <b>= ${fmtHM(back)}</b>.`,
        run: (c) => fly1(c, lanes[1], out, back, -1, sB2) },
      { cap: `Total <b>${fmtHM(tot)}</b>. The ${d.med} saved <b>${fmtHM(calm - out)}</b> going out but cost <b>${fmtHM(back - calm)}</b> coming back.`,
        run: async (c) => {
          const L = lanes[1], x = hx(2 * calm);
          const m = S('line', { x1: x, y1: L.by - 14, x2: x, y2: L.by + 50, stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '6 5' }, svg);
          const ml = lab(x, L.by - 14, `calm: ${fmtHM(2 * calm)}`, 'n', 'u8l5-calmlab');
          await show(c, m); await show(c, ml);
          res.innerHTML = `<span class="u8l5-good">saved ${fmtHM(calm - out)}</span> on the fast leg &nbsp;·&nbsp; <span class="u8l5-bad">lost ${fmtHM(back - calm)}</span> on the slow leg`;
          await show(c, res);
        } },
      { cap: `The <b>speeds</b> cancel, but the <b>times</b> don’t: the slow leg lasts longer, so the ${d.med} gets more time to hurt than to help. <b>C</b>: more than ${fmtHM(2 * calm)}.`,
        run: async (c) => { const s = stamp(ov, 'Answer C', { ok: true, x: W - 120, y: 372 }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: two containers pour into a mix =============================== */
const MX = {
  trail: { label: 'Trail mix', unit: 'kg', rateU: '$/kg', valU: '$', mixName: 'Trail mix',
    A: { name: 'Nuts', v: 'n', tag: '$15/kg', rate: '15', val: '15n', col: '#b5793b', amt: 4 },
    B: { name: 'Raisins', v: 'r', tag: '$6/kg', rate: '6', val: '6r', col: '#5b2a4a', amt: 5 },
    tot: 9, mtag: '$10/kg', mrate: '10', mval: '10(9)=90', eq1: 'n+r=9', eq2: '15n+6r=90', rsum: '15+6=21\\ne10' },
  ex1: { label: 'Example 1 check: coffee', unit: 'kg', rateU: '$/kg', valU: '$', mixName: 'Blend',
    A: { name: 'Premium beans', v: 'p', tag: '$24/kg', rate: '24', val: '24p', col: '#4a2a17', amt: 18 },
    B: { name: 'Standard beans', v: 's', tag: '$14/kg', rate: '14', val: '14s', col: '#c08a52', amt: 42 },
    tot: 60, mtag: '$17/kg', mrate: '17', mval: '17(60)=1\\,020', eq1: 'p+s=60', eq2: '24p+14s=1\\,020', rsum: '24+14=38\\ne17' },
  ex2: { label: 'Example 2 check: saline', unit: 'mL', rateU: 'salt', valU: 'mL salt', mixName: 'Mixture',
    A: { name: '30% stock', v: 'x', tag: '30% salt', rate: '0.30', val: '0.30x', col: saltCol(0.3), amt: 150 },
    B: { name: '80% stock', v: 'y', tag: '80% salt', rate: '0.80', val: '0.80y', col: saltCol(0.8), amt: 100 },
    cap1: `Two stock solutions: <b>30%</b> salt and <b>80%</b> salt. We don’t know how much of each: call them ${T('x')} and ${T('y')} mL.`,
    tot: 250, mtag: '50% salt', mrate: '0.50', mval: '0.50(250)=125', eq1: 'x+y=250', eq2: '0.30x+0.80y=125', rsum: '30\\%+80\\%\\ne50\\%', pct: 0.5 }
};
class Mixer {
  constructor(stage, x, y, w, hh, d) {
    const el = this.el = add(stage, box(h('div', 'u8l5-mixer'), w, hh), x, y);
    const svg = this.svg = S('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, el);
    this.ov = add(el, box(h('div', 'u8l5-ov'), w, hh));
    const cM = d.pct != null ? saltCol(d.pct) : mixHex(d.A.col, d.B.col, d.B.amt / d.tot);
    const bw = 128, bh = 96, top = 58, tip = top + bh + 50, xa = w * 0.23, xb = w * 0.77, mx = w / 2, mTop = tip + 62, mW = 190, mBot = hh - 14;
    this.A = this.hopper(xa, top, bw, bh, tip, d.A.col); this.B = this.hopper(xb, top, bw, bh, tip, d.B.col);
    this.M = this.tank(mx, mTop, mW, mBot, cM);
    const strm = (x0, x1, color) => {
      const p = S('path', { d: `M${x0} ${tip} C${x0} ${tip + 34} ${x1} ${mTop - 40} ${x1} ${mTop + 14}`, fill: 'none', stroke: color, 'stroke-width': 10, 'stroke-linecap': 'round', class: 'u8l5-stream' }, svg);
      const L = p.getTotalLength ? p.getTotalLength() : 200; p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = L; p.L = L; return p;
    };
    this.sA = strm(xa, mx - 34, d.A.col); this.sB = strm(xb, mx + 34, d.B.col);
    svg.appendChild(this.M.outline);
    const lab = (x, yy, html, pos, cls) => this.ov.appendChild(place(h('div', cls, html), x, yy, pos, 0));
    lab(xa, top - 8, d.A.name, 'n', 'u8l5-mname'); lab(xb, top - 8, d.B.name, 'n', 'u8l5-mname');
    lab(xa, top + 28, d.A.tag, 'c', 'u8l5-mtag'); lab(xb, top + 28, d.B.tag, 'c', 'u8l5-mtag');
    this.aA = hide0(lab(xa, top + 68, `${T(d.A.v)} ${d.unit}`, 'c', 'u8l5-mamt')); this.aB = hide0(lab(xb, top + 68, `${T(d.B.v)} ${d.unit}`, 'c', 'u8l5-mamt'));
    this.mLab = hide0(lab(mx, (mTop + mBot) / 2 + 14, `<b>${d.tot} ${d.unit}</b><br>${d.mtag}`, 'c', 'u8l5-mtag u8l5-mmix'));
    this.mName = hide0(lab(mx, mTop - 4, d.mixName, 'n', 'u8l5-mname'));
    this.lvA = 0.88; this.lvB = 0.88; this.A.set(0.88); this.B.set(0.88); this.M.set(0);
    this.d = d;
  }
  hopper(xc, top, bw, bh, tip, color) {
    const d = `M${xc - bw / 2} ${top} L${xc + bw / 2} ${top} L${xc + bw / 2} ${top + bh} L${xc + 9} ${tip} L${xc - 9} ${tip} L${xc - bw / 2} ${top + bh} Z`, id = uid('c');
    S('path', { d }, S('clipPath', { id }, this.svg));
    const r = S('rect', { x: xc - bw / 2, width: bw, fill: color, 'clip-path': `url(#${id})` }, this.svg);
    S('path', { d, fill: 'none', stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, this.svg);
    return { set: (lv) => { const yy = tip - lv * (tip - top); r.setAttribute('y', yy); r.setAttribute('height', Math.max(0, tip - yy)); } };
  }
  tank(xc, top, w, bot, color) {
    const xl = xc - w / 2, xr = xc + w / 2, rr = 18, id = uid('c');
    const d = `M${xl} ${top} L${xl} ${bot - rr} Q${xl} ${bot} ${xl + rr} ${bot} L${xr - rr} ${bot} Q${xr} ${bot} ${xr} ${bot - rr} L${xr} ${top}`;
    S('path', { d: d + ' Z' }, S('clipPath', { id }, this.svg));
    S('path', { d: d + ' Z', fill: '#fff' }, this.svg);
    const r = S('rect', { x: xl, width: w, fill: color, 'clip-path': `url(#${id})` }, this.svg);
    const outline = S('path', { d, fill: 'none', stroke: INK, 'stroke-width': 3.5, 'stroke-linejoin': 'round' });
    return { outline, set: (lv) => { const yy = bot - lv * (bot - top); r.setAttribute('y', yy); r.setAttribute('height', Math.max(0, bot - yy)); } };
  }
  async pour(c) {
    const d = this.d, dA = 0.62 * d.A.amt / d.tot, dB = 0.62 * d.B.amt / d.tot;
    await Promise.all([anim(c, this.sA, [{ strokeDashoffset: this.sA.L }, { strokeDashoffset: 0 }], 450), anim(c, this.sB, [{ strokeDashoffset: this.sB.L }, { strokeDashoffset: 0 }], 450)]);
    await tween(c, 1800, (t) => { this.A.set(this.lvA - dA * t); this.B.set(this.lvB - dB * t); this.M.set(0.8 * t); });
    await Promise.all([anim(c, this.sA, [{ opacity: 1 }, { opacity: 0 }], 300), anim(c, this.sB, [{ opacity: 1 }, { opacity: 0 }], 300)]);
    await show(c, this.mName); await pop(c, this.mLab);
  }
}
const mixPour = {
  title: 'Two ingredients, one mixture',
  height: 490,
  choices: [{ v: 'trail', label: MX.trail.label }, { sep: 'Check' }, { v: 'ex1', label: MX.ex1.label }, { v: 'ex2', label: MX.ex2.label }],
  intro: (k) => `${MX[k].A.name} and ${MX[k].B.name.toLowerCase()} are about to be mixed. Watch the organizer fill as they pour. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = MX[k], MW = 390, M = new Mixer(stage, 0, 0, MW, 490, d);
    const OX = MW + 16, avail = ex.W - OX - 12;
    const colW = [142, 104, 112, avail - 142 - 104 - 112 - 6];
    const tb = new Org(stage, { x: OX, y: 12, colW, cellH: 58, tap: false, q: '', cls: 'u8l5-orgx',
      headers: [{ html: '' }, th('Amount', `(${d.unit})`), th(`${OP('×')} Rate`, `(${d.rateU})`), th(`${OP('=')} Value`, `(${d.valU})`)],
      rows: [[{ html: d.A.name }, d.A.v, d.A.rate, d.A.val], [{ html: d.B.name }, d.B.v, d.B.rate, d.B.val], [{ html: d.mixName }, d.tot, d.mrate, d.mval]],
      hide: (r, c) => c > 0 });
    const P = panel(stage, OX, 270, avail, 206, 'Two equations');
    const n1 = line(P, `<span class="u8l5-tag u8l5-tb">Amount</span> ${T(tc(BLUE, d.eq1))}`, 'u8l5-big'), n2 = line(P, `<span class="u8l5-tag u8l5-ta">Value</span> ${T(tc(AMB, d.eq2))}`, 'u8l5-big');
    const n3 = line(P, `<span class="u8l5-tag u8l5-tx">Rate</span> ${T(d.rsum)} <span class="u8l5-muted">never add rates</span>`);
    [n1, n2, n3].forEach(hide0);
    return [
      { cap: d.cap1 || `${d.A.name} at <b>${d.A.tag}</b>, ${d.B.name.toLowerCase()} at <b>${d.B.tag}</b>. We don’t know how much of each: call them ${T(d.A.v)} and ${T(d.B.v)} ${d.unit}.`,
        run: async (c) => { await Promise.all([pop(c, M.aA), pop(c, M.aB)]); for (const r of [0, 1]) { await tb.reveal(r, 1, c); await tb.reveal(r, 2, c); } } },
      { cap: `Pour them together: <b>${d.tot} ${d.unit}</b> of ${d.mixName.toLowerCase()} at <b>${d.mtag}</b>.`,
        run: async (c) => { await M.pour(c); await tb.reveal(2, 1, c); await tb.reveal(2, 2, c); } },
      { cap: `<b>Amount × Rate = Value</b> in every row.`,
        run: async (c) => { for (const r of [0, 1, 2]) { tb.highlight(r, true); await tb.reveal(r, 3, c); await sleep(c, 250); tb.highlight(r, false); } } },
      { cap: `<b>Amount column:</b> the two amounts add to the total amount. ${T(tc(BLUE, d.eq1))}`,
        run: async (c) => { clearHl(tb); tb.highlightCol(1, true, 'u8l5-hb'); await show(c, n1); } },
      { cap: `<b>Value column:</b> the two values add to the total value. ${T(tc(AMB, d.eq2))}`,
        run: async (c) => { clearHl(tb); tb.highlightCol(3, true, 'u8l5-ha'); await show(c, n2); } },
      { cap: `<b>Rates are never added:</b> ${T(d.rsum)}. The mixture’s rate lands <b>between</b> the two rates.`,
        run: async (c) => { clearHl(tb); tb.highlightCol(2, true, 'u8l5-hx'); await show(c, n3); const s = stamp(n3, '✗', { ok: false, size: 'sm' }); s.classList.add('u8l5-inl'); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: solve, graph, check (Examples 1–2) =============================== */
const MS = {
  ex1: { label: 'Example 1 check', eq1: 'p+s=60', eq2: '24p+14s=1\\,020', tag1: 'amount', tag2: 'value', vs: ['p', 's'],
    iso: ['s=', '60-p'], sub: ['24p+14', '(60-p)', '=1\\,020'], work: ['24p+840-14p=1\\,020', '10p=180'], sol1: 'p=18', back: 's=60-18=42', pt: [18, 42],
    g: { xmin: 0, xmax: 65, ymin: 0, ymax: 80, xstep: 5, ystep: 5, xlabels: 10, ylabels: 10, xtitle: 'p', ytitle: 's' },
    f1: (x) => 60 - x, f2: (x) => (1020 - 24 * x) / 14, words: '18 kg of premium beans and 42 kg of standard beans',
    checks: [{ title: 'Mass', left: ['18+42', '60'], right: ['60', '60'] }, { title: 'Value', left: ['24(18)+14(42)', '1\\,020'], right: ['1\\,020', '1\\,020'] }] },
  ex2: { label: 'Example 2 check', eq1: 'x+y=250', eq2: '0.30x+0.80y=125', tag1: 'volume', tag2: 'salt', vs: ['x', 'y'], clear: '3x+8y=1\\,250',
    iso: ['y=', '250-x'], sub: ['3x+8', '(250-x)', '=1\\,250'], work: ['3x+2\\,000-8x=1\\,250', '-5x=-750'], sol1: 'x=150', back: 'y=250-150=100', pt: [150, 100],
    g: { xmin: 0, xmax: 300, ymin: 0, ymax: 275, xstep: 25, ystep: 25, xlabels: 50, ylabels: 50, xtitle: 'x', ytitle: 'y' },
    f1: (x) => 250 - x, f2: (x) => (125 - 0.3 * x) / 0.8, words: '150 mL of the 30% solution and 100 mL of the 80% solution',
    checks: [{ title: 'Volume', left: ['150+100', '250'], right: ['250', '250'] }, { title: 'Salt', left: ['0.30(150)+0.80(100)', '125'], right: ['125', '125'] }] }
};
const mixSolve = {
  title: 'Substitute, graph, check both',
  height: 490,
  choices: [{ v: 'ex1', label: MS.ex1.label }, { v: 'ex2', label: MS.ex2.label }],
  intro: (k) => `The system from Example ${k === 'ex1' ? 1 : 2} (a). One variable has coefficient 1, so substitution is quick. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = MS[k], GW = 450, [a, b] = d.vs, pt = d.pt;
    const G = new Graph(stage, Object.assign({ x: ex.W - GW - 10, y: 12, width: GW, height: 466, fontSize: 16 }, d.g));
    const P = panel(stage, 12, 12, ex.W - GW - 34, 466, 'Solve by substitution');
    const work = add(P, h('div', 'u8l5-work')), checks = add(P, h('div', 'u8l5-checks'));
    const L = (html, cls = '') => hide0(line(work, html, cls));
    const l1 = L(`<span class="u8l5-tag u8l5-tb">${d.tag1}</span> ${T(tc(BLUE, d.eq1))}`), l2 = L(`<span class="u8l5-tag u8l5-ta">${d.tag2}</span> ${T(tc(AMB, d.eq2))}`);
    const lc = d.clear ? L(`<span class="u8l5-tag u8l5-ta">×10</span> ${T(tc(AMB, d.clear))}`) : null;
    const li = L(`<span class="u8l5-tag u8l5-tb">isolate</span> ${T(d.iso[0])}<span class="u8l5-pc u8l5-src">${T(tc(BLUE, d.iso[1]))}</span>`);
    const ls = L(`<span class="u8l5-tag">substitute</span> <span class="u8l5-pc">${T(d.sub[0])}</span><span class="u8l5-pc u8l5-dst">${T(tc(BLUE, d.sub[1]))}</span><span class="u8l5-pc">${T(d.sub[2])}</span>`);
    const dst = ls.querySelector('.u8l5-dst'); dst.style.opacity = 0;
    const lw = d.work.map((s) => L(`<span class="u8l5-tag"></span> ${T(s)}`)), l5 = L(`<span class="u8l5-tag"></span> ${T(tc(PUR, d.sol1))}`);
    const l6 = L(`<span class="u8l5-tag u8l5-tb">back</span> ${T(d.back)}`), l7 = L(`<span class="u8l5-tag u8l5-tp">solution</span> ${T(tc(PUR, `(${a},\\ ${b})=(${pt[0]},\\ ${pt[1]})`))}`, 'u8l5-big');
    const steps = [
      { cap: `The system: the <b>${d.tag1}</b> equation and the <b>${d.tag2}</b> equation.`, run: async (c) => { await show(c, l1); await show(c, l2); } }
    ];
    if (d.clear) steps.push({ cap: `<b>Clear the decimals:</b> multiply <b>every term</b> of the salt equation by 10. ${T('0.30x+0.80y=125')} becomes ${T(d.clear)}.`,
      run: async (c) => { await show(c, lc); await pulse(c, lc, 1.04); } });
    steps.push(
      { cap: `${T(b)} has coefficient 1 in the ${d.tag1} equation: ${T(d.iso[0] + d.iso[1])}.`, run: (c) => show(c, li) },
      { cap: `<b>Replace ${T(b)} with what it equals</b> in the ${d.tag2} equation.`,
        run: async (c) => { ls.style.opacity = 1; await fly(c, stage, li.querySelector('.u8l5-src'), dst, T(tc(BLUE, d.sub[1]))); dst.style.opacity = 1; await pulse(c, dst, 1.12); } },
      { cap: `Expand and collect: ${T(d.work[1])}, so ${T(tc(PUR, d.sol1))}.`, run: async (c) => { for (const e of lw) await show(c, e); await show(c, l5); } },
      { cap: `Back into ${T(d.iso[0] + d.iso[1])}: ${T(d.back)}. The solution is ${T(`(${pt[0]},\\ ${pt[1]})`)}.`, run: async (c) => { await show(c, l6); await pop(c, l7); } },
      { cap: `On a graph, the two lines cross at ${T(`(${pt[0]},\\ ${pt[1]})`)}: the only point on <b>both</b>.`,
        run: async (c) => {
          await G.drawIn(G.fn(d.f1, { color: BLUE, width: 4 }), 700, c); await G.drawIn(G.fn(d.f2, { color: AMB, width: 4 }), 700, c);
          await G.reveal(G.point(pt[0], pt[1], { color: PUR, r: 8, label: T(`(${pt[0]},\\ ${pt[1]})`), pos: 'ne' }), c);
        } },
      { cap: `<b>Check in BOTH equations.</b> ${d.words[0].toUpperCase() + d.words.slice(1)}.`,
        run: async (c) => {
          await anim(c, work, [{ opacity: 1 }, { opacity: 0 }], 300); work.style.display = 'none';
          line(checks, `${T(tc(PUR, `${a}=${pt[0]},\\ ${b}=${pt[1]}`))}`, 'u8l5-big');
          for (const ck of d.checks) { const k2 = checkCard(checks, { title: ck.title, left: ck.left, right: ck.right, ok: true, hidden: true }); await k2.play(c); }
        } }
    );
    return steps;
  }
};

/* =============================== explainer: the balance point =============================== */
const ML = {
  ex1: { label: 'Example 1 check', lo: 14, hi: 24, aLo: 42, aHi: 18, mix: 17, min: 12, max: 26, step: 1, lab: 2, f: (v) => '$' + v, fd: (v) => '$' + v, unit: 'kg', nLo: 'standard', nHi: 'premium' },
  ex2: { label: 'Example 2 check', lo: 30, hi: 80, aLo: 150, aHi: 100, mix: 50, min: 25, max: 85, step: 5, lab: 10, f: (v) => v + '%', fd: (v) => v, unit: 'mL', nLo: '30% stock', nHi: '80% stock' },
  eq: { label: 'Equal amounts', lo: 14, hi: 24, aLo: 30, aHi: 30, mix: 19, min: 12, max: 26, step: 1, lab: 2, f: (v) => '$' + v, fd: (v) => '$' + v, unit: 'kg', nLo: 'standard', nHi: 'premium' }
};
const mixLever = {
  title: 'The mixture rate is the balance point',
  height: 430,
  choices: [{ v: 'ex1', label: ML.ex1.label }, { v: 'ex2', label: ML.ex2.label }, { sep: 'Compare' }, { v: 'eq', label: ML.eq.label }],
  intro: 'Each ingredient sits at its rate on a number line, weighed down by its amount. Where does the beam balance? Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = ML[k], W = ex.W, X0 = 80, X1 = W - 80, px = (v) => X0 + (v - d.min) / (d.max - d.min) * (X1 - X0);
    const svg = S('svg', { width: W, height: 430, viewBox: `0 0 ${W} 430` }); add(stage, svg, 0, 0);
    const ov = add(stage, box(h('div', 'u8l5-ov'), W, 430), 0, 0);
    const lab = (x, y, html, pos = 'c', cls = '') => ov.appendChild(place(h('div', 'u8l5-lab ' + cls, html), x, y, pos, 4));
    const AY = 360, BY = 244, GY = 322;
    S('line', { x1: X0 - 30, y1: AY, x2: X1 + 30, y2: AY, stroke: INK, 'stroke-width': 3 }, svg);
    for (let v = d.min; v <= d.max + 1e-9; v += d.step) {
      const big = Math.abs(v / d.lab - Math.round(v / d.lab)) < 1e-9;
      S('line', { x1: px(v), y1: AY - (big ? 9 : 5), x2: px(v), y2: AY + (big ? 9 : 5), stroke: INK, 'stroke-width': 2 }, svg);
      if (big) lab(px(v), AY + 12, d.f(v), 's', 'u8l5-tick');
    }
    S('rect', { x: X0 - 30, y: GY, width: X1 - X0 + 60, height: 6, rx: 3, fill: '#cfc8b8' }, svg);
    const mid = (d.lo + d.hi) / 2, amax = Math.max(d.aLo, d.aHi);
    const beam = S('g', {}, svg); beam.style.transformBox = 'view-box'; beam.style.transformOrigin = '0 0';
    S('rect', { x: px(d.lo) - 40, y: BY - 6, width: px(d.hi) - px(d.lo) + 80, height: 12, rx: 6, fill: '#6b5a44' }, beam);
    const wt = (v, a, name, color) => {
      const g = S('g', { class: 'u8l5-wt' }, beam), hh = 40 + 80 * a / amax;
      S('rect', { x: px(v) - 46, y: BY - 6 - hh, width: 92, height: hh, rx: 8, fill: color, stroke: INK, 'stroke-width': 2 }, g);
      const t = S('text', { x: px(v), y: BY - 6 - hh / 2 + 8, 'text-anchor': 'middle', class: 'u8l5-wtxt' }, g); t.textContent = `${a} ${d.unit}`;
      const n = S('text', { x: px(v), y: BY - 14 - hh, 'text-anchor': 'middle', class: 'u8l5-wname' }, g); n.textContent = name;
      g.style.opacity = 0; return g;
    };
    const wLo = wt(d.lo, d.aLo, d.nLo, '#e9c58c'), wHi = wt(d.hi, d.aHi, d.nHi, '#a8794a');
    const ful = S('g', {}, svg); ful.style.transformBox = 'view-box'; ful.style.transformOrigin = '0 0';
    S('path', { d: `M${px(mid)} ${BY + 6} L${px(mid) + 28} ${GY} L${px(mid) - 28} ${GY} Z`, fill: '#4a5262', stroke: INK, 'stroke-width': 2 }, ful);
    const dots = [d.lo, d.hi].map((v) => { const g = S('circle', { cx: px(v), cy: AY, r: 8, fill: v === d.lo ? '#d39a3a' : '#7a5530', stroke: '#fff', 'stroke-width': 2 }, svg); g.style.opacity = 0; return g; });
    const drops = [d.lo, d.hi].map((v) => { const l = S('line', { x1: px(v), y1: BY + 10, x2: px(v), y2: AY - 10, stroke: GRAY, 'stroke-width': 2, 'stroke-dasharray': '5 5' }, svg); l.style.opacity = 0; return l; });
    const set = (fv, th0) => { ful.setAttribute('transform', `translate(${px(fv) - px(mid)} 0)`); beam.setAttribute('transform', `rotate(${th0} ${px(fv)} ${BY + 6})`); };
    const th0 = d.aHi === d.aLo ? 0 : (d.aHi > d.aLo ? 6 : -6);
    set(mid, 0);
    const dLo = d.mix - d.lo, dHi = d.hi - d.mix, pr = thin(d.aLo * dLo);
    const top = hide0(lab(W / 2, 16, '', 's', 'u8l5-levtop'));
    const mixDot = S('circle', { cx: px(d.mix), cy: AY, r: 9, fill: PUR, stroke: '#fff', 'stroke-width': 2 }, svg); mixDot.style.opacity = 0;
    const mixLab = hide0(lab(px(d.mix), AY + 38, `mixture ${d.f(d.mix)}`, 's', 'u8l5-mixlab'));
    return [
      { cap: `Put the two rates on a number line: ${d.f(d.lo)} (${d.nLo}) and ${d.f(d.hi)} (${d.nHi}).`,
        run: async (c) => { for (let i = 0; i < 2; i++) { await pop(c, dots[i]); await show(c, drops[i]); } } },
      { cap: `Load each amount at its rate: <b>${d.aLo} ${d.unit}</b> at ${d.f(d.lo)} and <b>${d.aHi} ${d.unit}</b> at ${d.f(d.hi)}.${th0 ? ' Supported in the middle, the beam tips toward the bigger amount.' : ''}`,
        run: async (c) => {
          await Promise.all([wLo, wHi].map((g) => anim(c, g, [{ opacity: 0, transform: 'translateY(-50px)' }, { opacity: 1, transform: 'translateY(0)' }], 500)));
          await tween(c, 600, (t) => set(mid, th0 * t));
        } },
      { cap: th0 ? `Slide the support until the beam is level: it balances at <b>${d.f(d.mix)}</b>, the mixture rate.` : `Equal amounts balance <b>exactly halfway</b>: ${d.f(d.mix)}.`,
        run: async (c) => { await tween(c, 1400, (t) => set(mid + (d.mix - mid) * t, th0 * (1 - t))); await pop(c, mixDot); await show(c, mixLab); } },
      { cap: `Distances to the balance point: ${d.fd(dLo)} and ${d.fd(dHi)}. Amount × distance is the same on both sides: ${T(`${d.aLo}\\times${dLo}=${d.aHi}\\times${dHi}=${pr}`)}.`,
        run: async (c) => {
          const y = 286, g1 = dim(svg, px(d.lo), px(d.mix), y, AMB), g2 = dim(svg, px(d.mix), px(d.hi), y, AMB);
          await show(c, g1); const t1 = lab((px(d.lo) + px(d.mix)) / 2, y - 4, d.fd(dLo), 'n', 'u8l5-dimlab'); await pop(c, t1);
          await show(c, g2); const t2 = lab((px(d.mix) + px(d.hi)) / 2, y - 4, d.fd(dHi), 'n', 'u8l5-dimlab'); await pop(c, t2);
          top.innerHTML = `${T(`${d.aLo}\\times${dLo}=${pr}`)} &nbsp;and&nbsp; ${T(`${d.aHi}\\times${dHi}=${pr}`)}: <b>balanced</b>`; await show(c, top);
        } },
      { cap: `So the mixture rate is always <b>between</b> the two rates, <b>closer to the bigger amount</b>. ${th0 ? `${d.f(d.mix)} is closer to ${d.f(d.aLo > d.aHi ? d.lo : d.hi)}: more ${d.aLo > d.aHi ? d.nLo : d.nHi}.` : 'Same amounts, exactly halfway.'}`,
        run: async (c) => { const s = stamp(ov, 'makes sense', { ok: true, x: 150, y: 44 }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: cover the one you want =============================== */
const dstTri = {
  title: 'Cover the quantity you want',
  height: 420,
  intro: 'One relationship, three forms. Cover the letter you want; what is left shows how to build it. Press <b>Next</b>.',
  make(stage, _v, ex) {
    const svg = S('svg', { width: 400, height: 400, viewBox: '0 0 400 400', class: 'u8l5-dstsvg' }); add(stage, svg, 20, 10);
    const A = [200, 30], B = [390, 360], C = [10, 360], my = 210;
    S('path', { d: `M${A} L${B} L${C} Z`, fill: '#fff8e9', stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, svg);
    const bar = S('line', { x1: 98, y1: my, x2: 302, y2: my, stroke: INK, 'stroke-width': 4 }, svg);
    const vb = S('line', { x1: 200, y1: my, x2: 200, y2: 360, stroke: INK, 'stroke-width': 4 }, svg);
    const L = { d: [200, 150], s: [120, 296], t: [280, 296] }, cols = { d: '#c93a33', s: BLUE, t: GRN };
    for (const kk of ['d', 's', 't']) { const t = S('text', { x: L[kk][0], y: L[kk][1] + 22, 'text-anchor': 'middle', class: 'u8l5-dstl' }, svg); t.textContent = kk; t.style.fill = cols[kk]; }
    const tagDiv = S('text', { x: 312, y: my + 7, class: 'u8l5-dstn' }, svg); tagDiv.textContent = '÷'; tagDiv.style.opacity = 0;
    const tagMul = S('text', { x: 200, y: 395, 'text-anchor': 'middle', class: 'u8l5-dstn' }, svg); tagMul.textContent = '×'; tagMul.style.opacity = 0;
    const cover = S('g', { class: 'u8l5-cover' }, svg); cover.style.opacity = 0;
    S('rect', { x: -48, y: -44, width: 96, height: 88, rx: 14, fill: '#3a4254' }, cover);
    const ct = S('text', { x: 0, y: 12, 'text-anchor': 'middle', class: 'u8l5-covt' }, cover); ct.textContent = '?';
    const moveCover = async (c, kk) => {
      const [x, y] = L[kk]; ct.textContent = kk;
      if (cover.style.opacity === '0' || !cover.getAttribute('transform')) { cover.setAttribute('transform', `translate(${x} ${y + 6})`); await anim(c, cover, [{ opacity: 0 }, { opacity: 0.94 }], 300); return; }
      const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(cover.getAttribute('transform')), x0 = +m[1], y0 = +m[2];
      await tween(c, 600, (t) => cover.setAttribute('transform', `translate(${x0 + (x - x0) * t} ${y0 + (y + 6 - y0) * t})`));
    };
    void bar; void vb;
    const P = panel(stage, 450, 14, ex.W - 464, 392, 'Three forms');
    const row = (f, eg) => { const r = hide0(add(P, h('div', 'u8l5-dstrow', `<div class="u8l5-dstf">${T(f)}</div><div class="u8l5-dste">${eg}</div>`))); return r; };
    const r1 = row(`${tc('#c93a33', 'd')}=${tc(BLUE, 's')}\\times ${tc(GRN, 't')}`, `95 km/h for 6 h: ${T('95\\times6=570')} km`);
    const r2 = row(`${tc(BLUE, 's')}=\\dfrac{${tc('#c93a33', 'd')}}{${tc(GRN, 't')}}`, `96 km in 4 h: ${T('96\\div4=24')} km/h`);
    const r3 = row(`${tc(GRN, 't')}=\\dfrac{${tc('#c93a33', 'd')}}{${tc(BLUE, 's')}}`, `600 km at 240 km/h: ${T('600\\div240=2.5')} h`);
    const r4 = hide0(line(P, 'Units must match: <b>km</b>, <b>km/h</b> and <b>h</b>. A 30-minute break is <b>0.5 h</b>.', 'u8l5-unitln'));
    return [
      { cap: `${T('d')} on top; ${T('s')} and ${T('t')} side by side on the bottom. Side by side means <b>×</b>; over the bar means <b>÷</b>.`,
        run: async (c) => { await show(c, tagMul); await show(c, tagDiv); } },
      { cap: `Cover ${T('d')}: ${T('s')} sits beside ${T('t')}, so ${T('d=s\\times t')}.`, run: async (c) => { await moveCover(c, 'd'); await show(c, r1); } },
      { cap: `Cover ${T('s')}: ${T('d')} sits over ${T('t')}, so ${T('s=\\dfrac{d}{t}')}.`, run: async (c) => { await moveCover(c, 's'); await show(c, r2); } },
      { cap: `Cover ${T('t')}: ${T('d')} sits over ${T('s')}, so ${T('t=\\dfrac{d}{s}')}.`, run: async (c) => { await moveCover(c, 't'); await show(c, r3); } },
      { cap: `Keep the units together: km, km/h, hours. Change minutes to hours first.`, run: async (c) => { await anim(c, cover, [{ opacity: 0.94 }, { opacity: 0 }], 300); await show(c, r4); } }
    ];
  }
};

/* =============================== explainer: Example 3, the trip =============================== */
const TR = {
  ex3: { label: 'Example 3 check', from: 'Edmonton', to: 'Regina', D: 810, total: 11.5, veh: 'truck', stops: [{ at: 4, len: 1, name: 'fuel stop 1 h' }, { at: 8.5, len: 0.5, name: 'rest 0.5 h' }],
    s1: 95, s2: 60, n1: 'Highway', n2: 'Secondary roads', t1: 6, t2: 4, drive: 10, stopSum: '1+0.5=1.5',
    solve: ['r=10-h', '95h+60(10-h)=810', '95h+600-60h=810', '35h=210\\Rightarrow h=6', 'r=10-6=4'] },
  bus: { label: 'A bus trip', from: 'Home', to: 'Camp', D: 500, total: 7, veh: 'bus', stops: [{ at: 3, len: 1, name: 'lunch 1 h' }],
    s1: 100, s2: 50, n1: 'Highway', n2: 'Town roads', t1: 4, t2: 2, drive: 6, stopSum: '1',
    solve: ['r=6-h', '100h+50(6-h)=500', '100h+300-50h=500', '50h=200\\Rightarrow h=4', 'r=6-4=2'] }
};
const trip = {
  title: 'Stopped time is not driving time',
  height: 540,
  choices: [{ v: 'ex3', label: TR.ex3.label }, { sep: 'Another' }, { v: 'bus', label: TR.bus.label }],
  intro: (k) => (k === 'ex3' ? 'The trucker’s 11.5 hours, Edmonton to Regina. Press <b>Next</b>.' : `A bus drives ${TR.bus.D} km in ${TR.bus.total} h, including a 1-hour lunch stop, at ${TR.bus.s1} km/h on the highway and ${TR.bus.s2} km/h on town roads. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = TR[k], W = ex.W, RX0 = 70, RX1 = W - 70, RY = 70;
    const svg = S('svg', { width: W, height: 240, viewBox: `0 0 ${W} 240` }); add(stage, svg, 0, 0);
    const ov = add(stage, box(h('div', 'u8l5-ov'), W, 240), 0, 0);
    const lab = (x, y, html, pos = 'c', cls = '') => ov.appendChild(place(h('div', 'u8l5-lab ' + cls, html), x, y, pos, 4));
    // road
    S('line', { x1: RX0, y1: RY, x2: RX1, y2: RY, stroke: '#7d8594', 'stroke-width': 16, 'stroke-linecap': 'round' }, svg);
    S('line', { x1: RX0, y1: RY, x2: RX1, y2: RY, stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '12 10' }, svg);
    const road1 = S('line', { x1: RX0, y1: RY, x2: RX0, y2: RY, stroke: BLUE, 'stroke-width': 16, 'stroke-linecap': 'round', opacity: 0.85 }, svg);
    const road2 = S('line', { x1: RX0, y1: RY, x2: RX0, y2: RY, stroke: AMB, 'stroke-width': 16, 'stroke-linecap': 'round', opacity: 0.85 }, svg);
    S('circle', { cx: RX0, cy: RY, r: 11, fill: INK }, svg); S('circle', { cx: RX1, cy: RY, r: 11, fill: INK }, svg);
    lab(RX0, RY + 14, d.from, 's', 'u8l5-town'); lab(RX1, RY + 14, d.to, 's', 'u8l5-town'); lab((RX0 + RX1) / 2, RY + 14, `${d.D} km`, 's', 'u8l5-town');
    const truck = S('g', {}, svg);
    S('rect', { x: -34, y: -26, width: 44, height: 24, rx: 3, fill: '#e8a01e', stroke: INK, 'stroke-width': 2 }, truck);
    S('path', { d: 'M10 -20 L24 -20 L32 -10 L32 -2 L10 -2 Z', fill: '#d2453a', stroke: INK, 'stroke-width': 2 }, truck);
    S('circle', { cx: -22, cy: 0, r: 6, fill: INK }, truck); S('circle', { cx: 22, cy: 0, r: 6, fill: INK }, truck);
    const truckAt = (x) => truck.setAttribute('transform', `translate(${x} ${RY - 12})`); truckAt(RX0);
    const odo = hide0(lab(W / 2, 8, '', 's', 'u8l5-clock'));
    // timeline
    const TX = 60, TW = W - 140, TY = 150, sc = TW / d.total, tx = (t) => TX + t * sc;
    const tl = add(stage, box(h('div', 'u8l5-tl'), W, 90), 0, TY);
    const seg = (t0, t1, cls, txt = '') => { const e = add(tl, h('div', 'u8l5-tseg ' + cls, txt)); e.style.left = tx(t0) + 'px'; e.style.width = (t1 - t0) * sc + 'px'; return e; };
    for (let t = 0; t <= Math.floor(d.total); t++) { const e = add(tl, h('div', 'u8l5-ttick', String(t))); e.style.left = tx(t) + 'px'; }
    const tEnd = add(tl, h('div', 'u8l5-tend', `${d.total} h`)); tEnd.style.left = tx(d.total) + 'px';
    const pieces = [], stops = []; let t = 0, packed = 0;
    for (const s of d.stops) { pieces.push({ a: t, b: s.at, pa: packed, pb: packed + s.at - t }); packed += s.at - t; t = s.at + s.len; }
    pieces.push({ a: t, b: d.total, pa: packed, pb: packed + d.total - t });
    pieces.forEach((p) => { p.el = seg(p.a, p.b, 'u8l5-tdrive'); });
    d.stops.forEach((s) => { const e = seg(s.at, s.at + s.len, 'u8l5-tstop'); const l = add(tl, h('div', 'u8l5-tstoplab', s.name)); l.style.left = tx(s.at + s.len / 2) + 'px'; l.style.opacity = 0; stops.push({ e, l }); });
    const hw = hide0(seg(0, d.t1, 'u8l5-tshw', `${d.n1.toLowerCase()} ${d.t1} h`)), sr = hide0(seg(d.t1, d.drive, 'u8l5-tssr', `${d.t2} h`));
    // organizer + panel
    const OY = 262, colW = [176, 128, 140, 120];
    const tb = new Org(stage, { x: 12, y: OY, colW, cellH: 58, tap: false, q: '', cls: 'u8l5-orgx',
      headers: [{ html: '' }, th('Distance', '(km)'), th(`${OP('=')} Speed`, '(km/h)'), th(`${OP('×')} Time`, '(h)')],
      rows: [[{ html: d.n1 }, `${d.s1}h`, d.s1, 'h'], [{ html: d.n2 }, `${d.s2}r`, d.s2, 'r'], [{ html: 'Total' }, d.D, { html: '—' }, d.drive]], hide: (r, c) => c > 0 });
    const PX = 12 + colW.reduce((a, b) => a + b, 0) + 22, P = panel(stage, PX, OY, W - PX - 12, 266, 'System and solution');
    const e1 = hide0(line(P, `<span class="u8l5-tag u8l5-tb">time</span> ${T(tc(BLUE, `h+r=${d.drive}`))}`)), e2 = hide0(line(P, `<span class="u8l5-tag u8l5-ta">distance</span> ${T(tc(AMB, `${d.s1}h+${d.s2}r=${d.D}`))}`));
    const sl = d.solve.map((s, i) => hide0(line(P, `<span class="u8l5-tag"></span> ${T(i === 3 || i === 4 ? tc(PUR, s) : s)}`, 'u8l5-sm')));
    const d1 = d.s1 * d.t1, d2 = d.s2 * d.t2;
    return [
      { cap: `The clock ran for <b>${d.total} h</b>, but the ${d.veh} stood still for ${d.stops.map((s) => s.name).join(' and ')}.`,
        run: async (c) => { for (const s of stops) { await pulse(c, s.e, 1.15); await show(c, s.l); } } },
      { cap: `Stopped time is not driving time: ${T(`${d.total}-${d.stopSum.split('=').pop()}=${d.drive}`)} hours of <b>driving</b>.`,
        run: async (c) => {
          await Promise.all(stops.map((s) => anim(c, s.e, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(30px)' }], 500)));
          stops.forEach((s) => (s.l.style.opacity = 0));
          await Promise.all(pieces.map((p) => anim(c, p.el, [{ left: tx(p.a) + 'px' }, { left: tx(p.pa) + 'px' }], 700)));
          tEnd.innerHTML = `${d.drive} h driving`; await anim(c, tEnd, [{ left: tx(d.total) + 'px' }, { left: tx(d.drive) + 'px' }], 500);
        } },
      { cap: `Each road gets a row: <b>distance = speed × time</b>. The times are the unknowns: ${T('h')} and ${T('r')}.`,
        run: async (c) => { for (const r of [0, 1]) { tb.highlight(r, true); for (const col of [2, 3, 1]) await tb.reveal(r, col, c); tb.highlight(r, false); } } },
      { cap: `Total row: <b>times add</b> to ${d.drive} and <b>distances add</b> to ${d.D}. The speeds don’t add.`,
        run: async (c) => {
          await tb.reveal(2, 3, c); tb.highlightCol(3, true, 'u8l5-hb'); await show(c, e1);
          await tb.reveal(2, 1, c); await tb.reveal(2, 2, c); clearHl(tb); tb.highlightCol(1, true, 'u8l5-ha'); await show(c, e2);
        } },
      { cap: `Substitute ${T(d.solve[0])}: ${T(d.solve[3].replace('\\Rightarrow', ',\\ '))} and ${T(d.solve[4].split('=').slice(0, 1) + '=' + d.t2)}.`,
        run: async (c) => { clearHl(tb); for (const e of sl) await show(c, e, 260); } },
      { cap: `Drive it: ${d.t1} h at ${d.s1} km/h is <b>${d1} km</b>, then ${d.t2} h at ${d.s2} km/h is <b>${d2} km</b>. ${T(`${d1}+${d2}=${d.D}`)} ✓`,
        run: async (c) => {
          pieces.forEach((p) => (p.el.style.opacity = 0)); await show(c, hw); await show(c, sr); await show(c, odo);
          const xm = RX0 + (RX1 - RX0) * d1 / d.D;
          await tween(c, 1500, (t) => { const x = RX0 + (xm - RX0) * t; road1.setAttribute('x2', x); truckAt(x); odo.textContent = `${d.n1}: ${fmtHM(d.t1 * t)} · ${Math.round(d1 * t)} km`; }, linear);
          road2.setAttribute('x1', xm); road2.setAttribute('x2', xm);
          await tween(c, 1500, (t) => { const x = xm + (RX1 - xm) * t; road2.setAttribute('x2', x); truckAt(x); odo.textContent = `${d.n2}: ${fmtHM(d.t2 * t)} · ${Math.round(d1 + d2 * t)} km`; }, linear);
          odo.textContent = `${d.drive} h driving · ${d.D} km ✓`;
        } }
    ];
  }
};

/* =============================== explainer: with and against the current =============================== */
const CU = {
  kayak: { label: 'Warm-up: the kayak', kind: 'river', veh: 'kayak', b: 6, c: 2, vb: 'b', vc: 'c', known: true, ends: ['upstream', 'downstream'] },
  ex4: { label: 'Example 4 check: ferry', kind: 'river', veh: 'ferry', b: 20, c: 4, vb: 'b', vc: 'c', ends: ['upstream', 'downstream'],
    legs: [{ dir: 1, d: 96, t: 4, name: 'Downstream' }, { dir: -1, d: 96, t: 6, name: 'Upstream' }] },
  ex5: { label: 'Example 5 check: plane', kind: 'sky', veh: 'plane', b: 270, c: 30, vb: 'p', vc: 'w', ends: ['Calgary', 'Saskatoon'],
    legs: [{ dir: 1, d: 600, t: 2.5, name: 'Calgary to Saskatoon' }, { dir: -1, d: 600, t: 2, name: 'The return trip' }] }
};
const current = {
  title: 'The current adds or subtracts',
  height: 530,
  choices: [{ v: 'kayak', label: CU.kayak.label }, { sep: 'Check' }, { v: 'ex4', label: CU.ex4.label }, { v: 'ex5', label: CU.ex5.label }],
  intro: (k) => (k === 'kayak' ? 'The warm-up kayak: 6 km/h in still water, a 2 km/h current. Press <b>Next</b>.'
    : k === 'ex4' ? 'The ferry: 96 km downstream in 4 h, back upstream in 6 h. Press <b>Next</b>.' : 'The plane: 600 km into a headwind in 2.5 h, back with the wind in 2 h. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = CU[k], W = ex.W, SH = 220, river = d.kind === 'river', flow = river ? 1 : -1;
    const med = river ? 'current' : 'wind', still = river ? 'still water' : 'still air';
    const svg = S('svg', { width: W - 24, height: SH, viewBox: `0 0 ${W - 24} ${SH}` }); add(stage, svg, 12, 10);
    const ov = add(stage, box(h('div', 'u8l5-ov'), W - 24, SH), 12, 10);
    const lab = (x, y, html, pos = 'c', cls = '') => ov.appendChild(place(h('div', 'u8l5-lab ' + cls, html), x, y, pos, 4));
    const SW = W - 24, XA = 90, XB = SW - 90, VY = river ? 118 : 104;
    if (river) {
      S('rect', { x: 0, y: 0, width: SW, height: SH, rx: 14, fill: '#8cc26c' }, svg);
      S('path', { d: `M0 50 C${SW * 0.3} 40 ${SW * 0.6} 62 ${SW} 48 L${SW} 186 C${SW * 0.6} 196 ${SW * 0.3} 178 0 190 Z`, fill: '#79b6e6' }, svg);
      lab(14, 14, '← upstream', 'se', 'u8l5-endlab'); lab(SW - 14, 14, 'downstream →', 'sw', 'u8l5-endlab');
    } else {
      S('rect', { x: 0, y: 0, width: SW, height: SH, rx: 14, fill: '#e3effb' }, svg);
      S('rect', { x: 0, y: 170, width: SW, height: 50, fill: '#b9d79e' }, svg);
      [[SW * 0.2, 40], [SW * 0.55, 30], [SW * 0.82, 52]].forEach(([x, y]) => { S('ellipse', { cx: x, cy: y, rx: 40, ry: 12, fill: '#fff' }, svg); S('ellipse', { cx: x + 22, cy: y - 7, rx: 22, ry: 11, fill: '#fff' }, svg); });
      S('circle', { cx: XA, cy: 176, r: 8, fill: INK }, svg); S('circle', { cx: XB, cy: 176, r: 8, fill: INK }, svg);
      lab(XA, 186, d.ends[0], 's', 'u8l5-town'); lab(XB, 186, d.ends[1], 's', 'u8l5-town');
    }
    const st = streaks(svg, 20, SW - 20, river ? [76, 166] : [70, 142], flow, river ? '#fff' : '#7d8ea3');
    const stLab = lab(SW / 2, SH - 6, `${med} ${d.c} km/h ${flow > 0 ? '→' : '←'}`, 'n', 'u8l5-medlab');
    if (d.known) { st.style.opacity = 0; stLab.style.opacity = 0; } else st.classList.add('u8l5-on');
    const v = drawVehicle(svg, d.veh); v.at(XA, VY);
    const clk = hide0(lab(SW / 2, 8, '', 's', 'u8l5-clock'));
    // vector panel + equation panel
    const PY = 242, PH = 276, VW = 600;
    const VP = panel(stage, 12, PY, VW, PH, 'Ground speed');
    const vs = S('svg', { width: VW - 24, height: PH - 44, viewBox: `0 0 ${VW - 24} ${PH - 44}` }, VP);
    const vov = add(VP, box(h('div', 'u8l5-ov'), VW - 24, PH - 44)); vov.style.top = '38px'; vov.style.left = '12px';
    const vlab = (x, y, html, pos = 'c', cls = '') => vov.appendChild(place(h('div', 'u8l5-lab ' + cls, html), x, y, pos, 2));
    const OX = 172, sc = (VW - 24 - OX - 150) / (d.b + d.c);
    const rows = d.known ? [{ kind: 'still' }, { kind: 'with', dir: flow }, { kind: 'against', dir: -flow }] : d.legs.map((L) => Object.assign({ kind: L.dir === flow ? 'with' : 'against' }, L));
    const rowH = (PH - 44) / rows.length;
    rows.forEach((r, i) => {
      const y = rowH * i + rowH / 2 + (rows.length === 2 ? 4 : 0), g = S('g', {}, vs); g.style.opacity = 0; r.g = g;
      const name = r.kind === 'still' ? still : `${r.kind} the ${med}`;
      r.lab = hide0(vlab(4, y - 16, `<b>${name}</b>`, 'e', 'u8l5-rowlab'));
      const bx = OX + d.b * sc;
      r.bA = arrow(g, OX, y - 10, bx, y - 10, INK, 6);
      r.bL = hide0(vlab((OX + bx) / 2, y - 18, T(d.known ? `${d.vb}=${d.b}` : d.vb), 'n', 'u8l5-vlab'));
      if (r.kind !== 'still') {
        const sgn = r.kind === 'with' ? 1 : -1, cx = bx + sgn * d.c * sc;
        r.cA = arrow(vs, bx, y + (sgn > 0 ? -10 : 2), cx, y + (sgn > 0 ? -10 : 2), WATER, 6); r.cA.style.opacity = 0;
        r.cL = hide0(sgn > 0 ? vlab((bx + cx) / 2 + 6, y - 18, T(d.known ? `${d.vc}=${d.c}` : d.vc), 'n', 'u8l5-vlab u8l5-vlabc')
          : vlab(bx + 10, y - 4, T(d.known ? `${d.vc}=${d.c}` : d.vc), 'e', 'u8l5-vlab u8l5-vlabc'));
        const col = r.kind === 'with' ? BLUE : AMB, gs = d.b + sgn * d.c;
        r.res = S('rect', { x: OX, y: y + 18, width: gs * sc, height: 12, rx: 5, fill: col }, vs); r.res.style.opacity = 0;
        r.rL = hide0(vlab(OX + gs * sc + 8, y + 24, T(tc(col, `${d.vb}${sgn > 0 ? '+' : '-'}${d.vc}=${gs}`)), 'e', 'u8l5-vlab'));
      } else {
        r.res = S('rect', { x: OX, y: y + 18, width: d.b * sc, height: 12, rx: 5, fill: GRAY }, vs); r.res.style.opacity = 0;
        r.rL = hide0(vlab(OX + d.b * sc + 8, y + 24, T(`${d.b}`), 'e', 'u8l5-vlab'));
      }
    });
    const showRow = async (c, r) => {
      await show(c, r.lab); await show(c, r.g); await show(c, r.bL);
      if (r.cA) { await show(c, r.cA); await show(c, r.cL); }
      await show(c, r.res); await pop(c, r.rL);
    };
    const EX = 12 + VW + 14, EP = panel(stage, EX, PY, W - EX - 12, PH, d.known ? 'In general' : 'One equation per trip');
    const move = async (c, dir, ms, readout) => {
      v.flip(dir < 0); const xa = dir > 0 ? XA : XB, xb = dir > 0 ? XB : XA;
      await tween(c, ms, (t) => { v.at(xa + (xb - xa) * t, VY + Math.sin(t * 20) * 1.5); if (readout) clk.textContent = readout(t); }, linear);
    };
    if (d.known) {
      const g1 = hide0(line(EP, `With it: ${T(tc(BLUE, 'b+c'))}`, 'u8l5-big')), g2 = hide0(line(EP, `Against it: ${T(tc(AMB, 'b-c'))}`, 'u8l5-big'));
      const g3 = hide0(line(EP, `${T('b')} = speed in still water<br>${T('c')} = speed of the current`, 'u8l5-sm u8l5-blk'));
      return [
        { cap: `In still water the kayak paddles <b>6 km/h</b>: its own speed ${T('b')}.`,
          run: async (c) => { await show(c, clk); clk.textContent = '6 km/h'; await move(c, 1, 2400); await showRow(c, rows[0]); } },
        { cap: `Downstream, the current carries it along: ${T('6+2=8')} km/h.`,
          run: async (c) => { await show(c, st, 400); st.classList.add('u8l5-on'); await show(c, stLab); clk.textContent = '8 km/h'; await move(c, 1, 1800); await showRow(c, rows[1]); } },
        { cap: `Upstream, the current pushes back: ${T('6-2=4')} km/h. Half as fast.`,
          run: async (c) => { clk.textContent = '4 km/h'; await move(c, -1, 3600); await showRow(c, rows[2]); } },
        { cap: `In general: going <b>with</b> the current the ground speed is ${T('b+c')}; going <b>against</b> it, ${T('b-c')}.`,
          run: async (c) => { await show(c, g1); await show(c, g2); await show(c, g3); } }
      ];
    }
    const eqs = d.legs.map((L, i) => {
      const r = rows[i], col = r.kind === 'with' ? BLUE : AMB, s = L.d / L.t, sym = `${d.vb}${r.kind === 'with' ? '+' : '-'}${d.vc}`;
      return { r, L, s, sym, col, el: hide0(line(EP, `<span class="u8l5-tag u8l5-tagS ${col === BLUE ? 'u8l5-tb' : 'u8l5-ta'}">${r.kind}</span> ${T(tc(col, `${sym}=\\tfrac{${L.d}}{${L.t}}=${s}`))}`, 'u8l5-eqln')) };
    });
    const sys = hide0(line(EP, `Two trips, two speeds: a <b>system</b> in ${T(d.vb)} and ${T(d.vc)}.`, 'u8l5-sm'));
    const steps = [];
    eqs.forEach((e, i) => {
      steps.push({ cap: `${e.L.name}: <b>${e.L.d} km in ${e.L.t} h</b>${i ? ', the same distance' : ''}.`,
        run: async (c) => { await show(c, clk); await move(c, e.L.dir, 700 + e.L.t * 650, (t) => `${fmtHM(e.L.t * t)} · ${Math.round(e.L.d * t)} km`); clk.textContent = `${e.L.t} h · ${e.L.d} km`; } });
      steps.push({ cap: `Speed ${T(`=\\tfrac{${e.L.d}}{${e.L.t}}=${e.s}`)} km/h. The ${med} ${e.r.kind === 'with' ? '<b>helps</b>' : '<b>fights</b>'}, so that speed is ${T(tc(e.col, e.sym))}.`,
        run: async (c) => { await showRow(c, e.r); await show(c, e.el); } });
    });
    steps.push({ cap: `Two trips, two equations. The ${T('+' + d.vc)} and ${T('-' + d.vc)} are opposites: <b>add</b> them (below).`,
      run: async (c) => { await show(c, sys); await pulse(c, EP, 1.02); } });
    return steps;
  }
};

/* =============================== explainer: halfway, add, graph, check =============================== */
const SS = {
  kayak: { label: 'Warm-up Q3', vb: 'b', vc: 'c', with: 10, ag: 6, b: 8, c: 2, order: ['with', 'against'], nl: { min: 4, max: 12, step: 1 },
    g: { xmin: 0, xmax: 12, ymin: 0, ymax: 12, xtitle: 'b', ytitle: 'c', xlabels: 2, ylabels: 2 }, words: 'The current is 2 km/h; the kayak does 8 km/h in still water.', chk: 'Check in both equations.',
    checks: [{ title: 'With the current', left: ['8+2', '10'], right: ['10', '10'] }, { title: 'Against the current', left: ['8-2', '6'], right: ['6', '6'] }] },
  ex4: { label: 'Example 4 check', vb: 'b', vc: 'c', with: 24, ag: 16, b: 20, c: 4, order: ['with', 'against'], nl: { min: 12, max: 28, step: 1, labelStep: 2 },
    g: { xmin: 0, xmax: 28, ymin: 0, ymax: 28, xstep: 2, ystep: 2, xtitle: 'b', ytitle: 'c', xlabels: 4, ylabels: 4 }, words: 'The current runs at 4 km/h; the ferry makes 20 km/h in still water.',
    checks: [{ title: 'Downstream', left: ['(20+4)(4)', '96'], right: ['96', '96'] }, { title: 'Upstream', left: ['(20-4)(6)', '96'], right: ['96', '96'] }] },
  ex5: { label: 'Example 5 check', vb: 'p', vc: 'w', with: 300, ag: 240, b: 270, c: 30, order: ['against', 'with'], nl: { min: 225, max: 315, step: 5, labelStep: 15 },
    g: { xmin: 220, xmax: 320, ymin: 0, ymax: 80, xstep: 10, ystep: 10, xtitle: 'p', ytitle: 'w', xlabels: 20, ylabels: 20 }, words: 'The wind blows at 30 km/h; the plane flies 270 km/h in still air.',
    checks: [{ title: 'Outbound', left: ['(270-30)(2.5)', '600'], right: ['600', '600'] }, { title: 'Return', left: ['(270+30)(2)', '600'], right: ['600', '600'] }] }
};
const speedSolve = {
  title: 'Halfway between: add the equations',
  height: 530,
  choices: [{ v: 'kayak', label: SS.kayak.label }, { sep: 'Check' }, { v: 'ex4', label: SS.ex4.label }, { v: 'ex5', label: SS.ex5.label }],
  intro: 'Two ground speeds: one with the current or wind, one against it. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = SS[k], W = ex.W, b = d.vb, cc = d.vc;
    const N = new NumberLine(stage, Object.assign({ x: 12, y: 8, width: W - 24, height: 140, axisY: 96, fontSize: 18 }, d.nl));
    const GW = 336, G = new Graph(stage, Object.assign({ x: W - GW - 12, y: 158, width: GW, height: 364, fontSize: 15 }, d.g));
    const P = panel(stage, 12, 158, W - GW - 36, 364, 'Add the equations');
    const work = add(P, h('div', 'u8l5-work')), checks = add(P, h('div', 'u8l5-checks u8l5-checks2'));
    const eq = { with: { sym: '+', v: d.with, col: BLUE }, against: { sym: '-', v: d.ag, col: AMB } };
    const grid = hide0(add(work, h('div', 'u8l5-addgrid')));
    const cell = (html, cls = '') => add(grid, h('div', 'u8l5-ag ' + cls, html));
    const cTerms = [];
    d.order.forEach((key, i) => {
      const e = eq[key];
      cell(i ? T('+') : '', 'u8l5-agop'); cell(T(tc(e.col, b))); cTerms.push(cell(T(tc(e.col, e.sym + cc)), 'u8l5-agc')); cell(T('=')); cell(T(tc(e.col, e.v)));
    });
    const rule = add(grid, h('div', 'u8l5-agrule'));
    const sumCells = [cell(''), cell(T(`2${b}`)), cell(''), cell(T('=')), cell(T(d.with + d.ag))].map(hide0);
    const lb = hide0(line(work, `${T(`2${b}=${d.with + d.ag}`)} &nbsp;⟹&nbsp; ${T(tc(PUR, `${b}=${d.b}`))}`, 'u8l5-big'));
    const ls = hide0(line(work, `Into ${T(tc(BLUE, `${b}+${cc}=${d.with}`))}: ${T(`${d.b}+${cc}=${d.with}`)} &nbsp;⟹&nbsp; ${T(tc(PUR, `${cc}=${d.c}`))}`));
    const lsol = hide0(line(work, `<span class="u8l5-tag u8l5-tp">solution</span> ${T(tc(PUR, `(${b},\\ ${cc})=(${d.b},\\ ${d.c})`))}`, 'u8l5-big'));
    return [
      { cap: `Mark the two ground speeds: with it ${T(tc(BLUE, `${b}+${cc}=${d.with}`))}, against it ${T(tc(AMB, `${b}-${cc}=${d.ag}`))}.`,
        run: async (c) => {
          await N.reveal(N.point(d.with, { color: BLUE, label: T(tc(BLUE, `${b}+${cc}`)) }), c);
          await N.reveal(N.point(d.ag, { color: AMB, label: T(tc(AMB, `${b}-${cc}`)) }), c);
          await show(c, grid);
        } },
      { cap: `Both are ${T(cc)} away from ${T(b)}: one ${T('+' + cc)}, one ${T('-' + cc)}. So ${T(b)} is exactly <b>halfway</b>, and the gap ${T(`${d.with}-${d.ag}=${d.with - d.ag}`)} is <b>two</b> ${med(d)}s.`,
        run: async (c) => {
          const p = N.point(d.b, { color: PUR, label: T(tc(PUR, b)), r: 9 }); await N.reveal(p, c);
          await N.hop(c, d.b, d.with, { label: T('+' + cc), color: BLUE, height: 22 });
          await N.hop(c, d.b, d.ag, { label: T('-' + cc), color: AMB, height: 22 });
        } },
      { cap: `<b>Add</b> the equations: ${T('+' + cc)} and ${T('-' + cc)} cancel, leaving ${T(`2${b}=${d.with + d.ag}`)}, so ${T(tc(PUR, `${b}=${d.b}`))}.`,
        run: async (c) => {
          for (const e of cTerms) e.classList.add('u8l5-strike');
          await pulse(c, cTerms[0], 1.2); await pulse(c, cTerms[1], 1.2);
          await show(c, rule); for (const e of sumCells) await show(c, e, 200); await show(c, lb);
        } },
      { cap: `Substitute into ${T(`${b}+${cc}=${d.with}`)}: ${T(`${d.b}+${cc}=${d.with}`)}, so ${T(tc(PUR, `${cc}=${d.c}`))}.`,
        run: async (c) => { await show(c, ls); await pop(c, lsol); } },
      { cap: `On a graph, the lines ${T(`${b}+${cc}=${d.with}`)} and ${T(`${b}-${cc}=${d.ag}`)} cross at ${T(`(${d.b},\\ ${d.c})`)}.`,
        run: async (c) => {
          await G.drawIn(G.fn((x) => d.with - x, { color: BLUE, width: 4 }), 700, c); await G.drawIn(G.fn((x) => x - d.ag, { color: AMB, width: 4 }), 700, c);
          await G.reveal(G.point(d.b, d.c, { color: PUR, r: 8, label: T(`(${d.b},\\ ${d.c})`), pos: 'n' }), c);
        } },
      { cap: `<b>${d.chk || 'Check against both trips.'}</b> ${d.words}`,
        run: async (c) => {
          await anim(c, work, [{ opacity: 1 }, { opacity: 0 }], 300); work.style.display = 'none';
          line(checks, T(tc(PUR, `${b}=${d.b},\\ ${cc}=${d.c}`)), 'u8l5-big u8l5-span2');
          for (const ck of d.checks) { const k2 = checkCard(checks, { title: ck.title, left: ck.left, right: ck.right, ok: true, hidden: true }); await k2.play(c); }
        } }
    ];
  }
};
function med(d) { return d.vc === 'w' ? 'wind' : 'current'; }

/* =============================== mount =============================== */
mountWarm();
export const explainers = mountExplainers({ roundTrip, mixPour, mixSolve, mixLever, dstTri, trip, current, speedSolve });
export const _test = { RT, MX, MS, ML, TR, CU, SS };
