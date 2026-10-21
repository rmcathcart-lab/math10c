/* Math 10C · Unit 9 · Lesson 6 — Multi-Step Trigonometry: Eye Level, Elevation and Depression.
 * Static figures: the warm-up lighthouse (with two toggles), Example 1, 2, 4, 5, 6 figures, the four bearings, and the
 * Example 4 / Example 6(a) answer figures. Explainers:
 *   twoCalcs (Example 1: rise from the eyepiece + eye height, then a new triangle from the base with the unrounded height),
 *   semicircle (a hidden right angle: C slides round a semicircle and angle ACB stays 90°; why, with isosceles triangles),
 *   eyeLevel (★ a person with a clinometer sights a tree: eye-level line, the right triangle above it, the eye height
 *   slid across and added back at the end; Example 3(b) check),
 *   twoEyes (Example 2: eye level at both ends; the building stacked from three pieces),
 *   clinometer (the protractor tilts, the string hangs straight down; elevation = |90° − reading|; flipped protractor),
 *   wobble (Example 3(c): 31°, 32°, 33° sight lines and a zoom on the pole top; the caretaker's 12.5 m),
 *   tangent (Extension, Example 4: tangent ⟂ radius, equal tangents, OC bisects, SOH),
 *   compass (★ Extension: a compass rose, the bearing sweeping clockwise from north, three digits, the reference angle and
 *   the d sin / d cos triangle; the booklet's four bearings),
 *   ferry (Extension, Example 5), twoLegs (Extension, Example 6: components at every turning point, add or subtract,
 *   Pythagoras and the bearing).
 * Colours (whole unit): opposite purple, adjacent amber, hypotenuse blue, reference angle pink-red, eye height green. */
import {
  h, tex, add, box, Box, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween, svgEl, arrowHead, rightMark,
  pulse, anim, drawIn
} from '../blocks.js';

const T = (s) => tex(s);
const OPP = '#7b4fc4', ADJ = '#c27a0e', ADJT = '#a86605', HYP = '#1f5bd6', ANG = '#d6336c', EYE = '#12805a', TEAL = '#13807a', INK = '#1c2230', SLATE = '#3a4254', GRAY = '#9aa0ab';
const RAD = Math.PI / 180;
const cO = (s) => `\\textcolor{${OPP}}{${s}}`, cA = (s) => `\\textcolor{${ADJT}}{${s}}`, cH = (s) => `\\textcolor{${HYP}}{${s}}`, cE = (s) => `\\textcolor{${EYE}}{${s}}`, cR = (s) => `\\textcolor{${ANG}}{${s}}`;
const f1 = (v) => v.toFixed(1), f2 = (v) => v.toFixed(2), f4 = (v) => String(+v.toFixed(4)), f6 = (v) => v.toFixed(6);
const deg = (v) => `${v}^\\circ`;
const brg = (b) => String(Math.round(b) % 360).padStart(3, '0') + '^\\circ';
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u9l6-panel', title ? `<div class="u9l6-ph">${title}</div>` : ''), w, hh), x, y);
const say = async (c, p, html, cls = '') => { const d = h('div', 'u9l6-line ' + cls, html); p.appendChild(d); await fadeIn(c, d, 300); return d; };
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const show = (c, el, ms = 320) => fadeIn(c, el, ms);

/* =============================== Scene: a world-coordinate drawing on a Box =============================== */
class Scene extends Box {
  /** o: { x, y, width, height, win: [xmin, xmax, ymin, ymax] (world units, y up), pad: px or [t, r, b, l] } */
  constructor(host, o) {
    o = Object.assign({ width: 600, height: 360, pad: 24 }, o);
    super(host, o, 'u9l6-scene', o.width, o.height);
    const [x0, x1, y0, y1] = o.win, p = Array.isArray(o.pad) ? o.pad : [o.pad, o.pad, o.pad, o.pad];
    const aw = o.width - p[1] - p[3], ah = o.height - p[0] - p[2];
    const s = this.s = Math.min(aw / (x1 - x0), ah / (y1 - y0));
    this.ox = p[3] + (aw - s * (x1 - x0)) / 2 - s * x0;
    this.oy = p[0] + (ah - s * (y1 - y0)) / 2 + s * y1;
    this.bg = svgEl('g', {}, this.svg); this.mid = svgEl('g', {}, this.svg); this.fg = svgEl('g', {}, this.svg);
  }
  P(x, y) { return [this.ox + this.s * x, this.oy - this.s * y]; }
  /** a stroke through world points (drawIn-able). o: { color, width, dash: 'dot' | '10 6', arrow, layer, cap } */
  path(pts, o = {}) {
    const g = svgEl('g', { class: 'bk-curve' }, o.layer || this.mid), color = o.color || INK, w = o.width || 3;
    const d = 'M' + pts.map((q) => this.P(q[0], q[1]).map((v) => v.toFixed(1)).join(' ')).join('L');
    const at = { class: 'bk-stroke', d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    if (o.dash === 'dot') at['stroke-dasharray'] = `0.1 ${(w * 2.6).toFixed(1)}`; else if (o.dash) { at['stroke-dasharray'] = o.dash; at['stroke-linecap'] = 'butt'; }
    g.style.color = color; g.p = svgEl('path', at, g);
    if (o.arrow) { const n = pts.length, a = this.P(...pts[n - 2]), b = this.P(...pts[n - 1]); arrowHead(g, b[0], b[1], b[0] - a[0], b[1] - a[1], { color, width: w }); }
    return g;
  }
  line(a, b, o) { return this.path([a, b], o); }
  /** move an existing 2-point line */
  setLine(g, a, b) { const p = this.P(...a), q = this.P(...b); g.p.setAttribute('d', `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`); }
  poly(pts, o = {}) {
    return svgEl('polygon', { points: pts.map((q) => this.P(q[0], q[1]).map((v) => v.toFixed(1)).join(',')).join(' '), fill: o.fill || OPP, 'fill-opacity': o.opacity ?? 0.1, stroke: o.stroke || 'none', 'stroke-width': o.sw || 0 }, o.layer || this.bg);
  }
  /** arc at world V from world angle a1 to a2 (degrees, counter-clockwise from +x), radius r px. o: { color, width, label, lr, arrow } */
  arc(V, a1, a2, r, o = {}) {
    const [vx, vy] = this.P(V[0], V[1]), color = o.color || ANG;
    const pt = (a) => [vx + r * Math.cos(a * RAD), vy - r * Math.sin(a * RAD)];
    const s = pt(a1), e = pt(a2), large = Math.abs(a2 - a1) > 180 ? 1 : 0, sweep = a2 > a1 ? 0 : 1;
    const g = svgEl('g', { class: 'bk-curve' }, o.layer || this.mid); g.style.color = color;
    svgEl('path', { class: 'bk-stroke', d: `M${s[0].toFixed(1)} ${s[1].toFixed(1)}A${r} ${r} 0 ${large} ${sweep} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`, fill: 'none', stroke: color, 'stroke-width': o.width || 3 }, g);
    if (o.arrow) { const sg = a2 > a1 ? 1 : -1, t = [-Math.sin(a2 * RAD) * sg, -Math.cos(a2 * RAD) * sg]; arrowHead(g, e[0], e[1], t[0], t[1], { color, width: 2.5 }); }
    if (o.label != null) { const m = o.la ?? (a1 + a2) / 2, R = r + (o.lr ?? 24); g.label = this.hlabel(vx + R * Math.cos(m * RAD), vy - R * Math.sin(m * RAD), o.label, { cls: 'u9l6-alab', color }); }
    return g;
  }
  /** right-angle mark at world V between world directions d1, d2 (degrees) */
  rmark(V, d1, d2, size = 13, color = INK) {
    const v = this.P(V[0], V[1]), p = [v[0] + Math.cos(d1 * RAD), v[1] - Math.sin(d1 * RAD)], q = [v[0] + Math.cos(d2 * RAD), v[1] - Math.sin(d2 * RAD)];
    return rightMark(this.mid, v, p, q, size, { color, width: 2 });
  }
  lab(x, y, html, o = {}) { return this.hlabel(...this.P(x, y), html, { pos: o.pos || 'c', cls: o.cls || 'u9l6-lab', color: o.color, gap: o.gap }); }
  dot(q, o = {}) { const [x, y] = this.P(q[0], q[1]); return svgEl('circle', { cx: x, cy: y, r: o.r || 5, fill: o.color || INK, stroke: '#fff', 'stroke-width': 1.5 }, o.layer || this.fg); }
  /** dimension line with arrowheads and end bars; vertical at world x (px offset dx) or horizontal at world y (px offset dy) */
  dim(a, b, html, o = {}) {
    const vert = Math.abs(a[0] - b[0]) < 1e-9, off = o.off || 0, color = o.color || SLATE;
    let p = this.P(...a), q = this.P(...b);
    if (vert) { p[0] += off; q[0] += off; } else { p[1] += off; q[1] += off; }
    const g = svgEl('g', { class: 'bk-curve' }, o.layer || this.mid); g.style.color = color;
    svgEl('path', { class: 'bk-stroke', d: `M${p[0]} ${p[1]}L${q[0]} ${q[1]}`, stroke: color, 'stroke-width': o.width || 2, fill: 'none' }, g);
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (L > 22) { arrowHead(g, p[0], p[1], p[0] - q[0], p[1] - q[1], { color, width: 1.6 }); arrowHead(g, q[0], q[1], q[0] - p[0], q[1] - p[1], { color, width: 1.6 }); }
    const bar = (z) => svgEl('path', { d: vert ? `M${z[0] - 7} ${z[1]}L${z[0] + 7} ${z[1]}` : `M${z[0]} ${z[1] - 7}L${z[0]} ${z[1] + 7}`, stroke: color, 'stroke-width': 2 }, g);
    bar(p); bar(q);
    if (html != null) g.label = this.hlabel((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, html, { cls: o.cls || 'u9l6-lab', pos: o.pos || (vert ? (off < 0 ? 'w' : 'e') : (off < 0 ? 'n' : 's')), color: o.lcolor || color, gap: 6 });
    return g;
  }
  /* ---------- pictures (world feet at y = 0) ---------- */
  ground(x0, x1, o = {}) {
    const [a, y] = this.P(x0, 0), [b] = this.P(x1, 0);
    svgEl('rect', { x: a, y, width: b - a, height: o.depth || 14, fill: o.fill || '#e6e0cf' }, this.bg);
    svgEl('path', { d: `M${a} ${y}L${b} ${y}`, stroke: o.stroke || '#8a7d5c', 'stroke-width': 2.5 }, this.bg);
  }
  person(x, eye, o = {}) {
    const [fx, fy] = this.P(x, 0), [, ey] = this.P(x, eye), Hh = (fy - ey) / 0.93, dir = o.dir || 1, top = fy - Hh;
    const g = svgEl('g', { class: 'u9l6-person' }, o.layer || this.mid), w = Math.max(2.5, Hh * 0.055), col = o.color || SLATE;
    const L = (d) => svgEl('path', { d, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }, g);
    const hip = top + 0.55 * Hh, neck = top + 0.16 * Hh, sh = top + 0.22 * Hh;
    L(`M${fx} ${neck}L${fx} ${hip}`); L(`M${fx - 0.09 * Hh} ${fy}L${fx} ${hip}L${fx + 0.09 * Hh} ${fy}`);
    const hx = fx + dir * 0.16 * Hh, hy = ey + 0.02 * Hh;
    L(`M${fx} ${sh}L${hx} ${hy}`);
    svgEl('circle', { cx: fx, cy: top + 0.075 * Hh, r: 0.075 * Hh, fill: '#fff', stroke: col, 'stroke-width': w * 0.8 }, g);
    if (o.clino !== false) { const r = Math.max(5, 0.06 * Hh); svgEl('path', { d: `M${hx - r} ${hy}A${r} ${r} 0 0 0 ${hx + r} ${hy}Z`, fill: '#fbe7a8', stroke: ADJ, 'stroke-width': 1.5 }, g); }
    return g;
  }
  transit(x, eye) {
    const [fx, fy] = this.P(x, 0), [, ey] = this.P(x, eye), g = svgEl('g', {}, this.mid), hh = fy - ey;
    const L = (d, w = 2.5) => svgEl('path', { d, stroke: SLATE, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none' }, g);
    L(`M${fx} ${ey + 4}L${fx - hh * 0.45} ${fy}M${fx} ${ey + 4}L${fx + hh * 0.45} ${fy}M${fx} ${ey + 4}L${fx} ${fy}`);
    svgEl('rect', { x: fx - 9, y: ey - 5, width: 18, height: 9, rx: 2, fill: '#fbe7a8', stroke: SLATE, 'stroke-width': 1.8 }, g);
    return g;
  }
  tree(x, H) {
    const [bx, by] = this.P(x, 0), [, ty] = this.P(x, H), hh = by - ty, g = svgEl('g', {}, this.bg), w = Math.max(8, hh * 0.06);
    svgEl('rect', { x: bx - w / 2, y: ty + hh * 0.45, width: w, height: hh * 0.55, fill: '#9a6b3f', stroke: '#6d4a2a', 'stroke-width': 1.5 }, g);
    const R = hh * 0.3;
    [[0, 0.3, 1], [-0.55, 0.52, 0.8], [0.55, 0.52, 0.8], [0, 0.6, 0.85]].forEach(([dx, dy, k]) => svgEl('circle', { cx: bx + dx * R, cy: ty + dy * hh, r: R * k, fill: '#8fc47a', stroke: '#4f8a3c', 'stroke-width': 2 }, g));
    svgEl('circle', { cx: bx, cy: ty + R, r: R * 0.98, fill: '#8fc47a' }, g);
    return g;
  }
  flagpole(x, H) {
    const [bx, by] = this.P(x, 0), [, ty] = this.P(x, H), g = svgEl('g', {}, this.bg);
    svgEl('path', { d: `M${bx} ${by}L${bx} ${ty}`, stroke: '#7d8794', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    svgEl('path', { d: `M${bx + 2} ${ty + 10}L${bx + 44} ${ty + 22}L${bx + 2} ${ty + 36}Z`, fill: '#e04848', stroke: '#a33', 'stroke-width': 1.2 }, g);
    return g;
  }
  pole(x, H) { const [bx, by] = this.P(x, 0), [, ty] = this.P(x, H); return svgEl('path', { d: `M${bx} ${by}L${bx} ${ty}`, stroke: '#6b5a48', 'stroke-width': 6, 'stroke-linecap': 'butt' }, this.bg); }
  building(x0, x1, H, o = {}) {
    const [a, by] = this.P(x0, 0), [b, ty] = this.P(x1, H), g = svgEl('g', {}, this.bg);
    svgEl('rect', { x: a, y: ty, width: b - a, height: by - ty, fill: '#efe9df', stroke: SLATE, 'stroke-width': 2.5 }, g);
    const rows = Math.max(3, Math.round((by - ty) / 34)), cols = 2;
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const wx = a + (b - a) * (0.2 + 0.38 * j), wy = ty + 10 + i * ((by - ty - 20) / rows);
      if (o.skip && Math.abs(wy - o.skip) < 22 && j === 0) continue;
      svgEl('rect', { x: wx, y: wy, width: (b - a) * 0.22, height: 14, fill: '#cfe0f2', stroke: '#9fb3c8', 'stroke-width': 1 }, g);
    }
    return g;
  }
}

/* small helpers for explainers */
const tagAt = (S, x, y, txt, color, pos = 'c') => { const t = S.lab(x, y, txt, { cls: 'u9l6-tag', color, pos }); return t; };

/* =============================== warm-up: Lighthouse Lookout =============================== */
function mountWarm() {
  const host = document.getElementById('u9l6-wfig'); if (!host) return;
  const W = Math.max(700, host.clientWidth || 1000), H = parseFloat(getComputedStyle(host).getPropertyValue('--scene-h')) || 330;   // one-screen CSS can make it shorter
  const S = new Scene(host, { width: W, height: H, win: [-16, 160, -6, 50], pad: [14, 20, 6, 34] });
  const [sx0, sy0] = S.P(-16, 0), [sx1] = S.P(160, 0);
  svgEl('rect', { x: sx0, y: sy0, width: sx1 - sx0, height: 60, fill: '#d6e7f6' }, S.bg);
  svgEl('path', { d: `M${sx0} ${sy0}L${sx1} ${sy0}`, stroke: '#5f8fbf', 'stroke-width': 2.5 }, S.bg);
  // rock + lighthouse
  S.poly([[-12, 0], [-8, 3], [6, 3.2], [10, 0]], { fill: '#8c8278', opacity: 1, stroke: INK, sw: 1.5 });
  S.poly([[-4, 2.5], [-2.6, 40.5], [2.6, 40.5], [4, 2.5]], { fill: '#fff', opacity: 1, stroke: INK, sw: 2 });
  [[10, 16], [24, 30]].forEach(([a, b]) => { const k = (y) => 4 - 1.4 * (y - 2.5) / 38; S.poly([[-k(a), a], [-k(b), b], [k(b), b], [k(a), a]], { fill: '#d23c32', opacity: 0.9 }); });
  S.poly([[-3, 40.5], [-3, 45], [3, 45], [3, 40.5]], { fill: '#fbe7a8', opacity: 1, stroke: INK, sw: 1.5 });
  S.poly([[-3.8, 45], [0, 49], [3.8, 45]], { fill: '#d23c32', opacity: 1, stroke: INK, sw: 1.5 });
  S.dot([0, 40], { color: ADJ, r: 5 });
  S.dim([-6, 0], [-6, 40], '<b>40 m</b>', { off: -10, pos: 'w' });
  S.line([0, 40], [158, 40], { color: SLATE, dash: '9 7', width: 2 });
  S.lab(157, 40, 'horizontal', { pos: 'nw', cls: 'u9l6-lab u9l6-muted' });
  const boats = [[40, 45, 'A', 150], [85.78, 25, 'B', 230], [149.28, 15, 'C', 330]], rk = Math.min(1, S.s / 5.26);   // arc radii shrink with a narrower scene
  boats.forEach(([x, a, n, r]) => {
    S.line([0, 40], [x, 0], { color: ANG, width: 2.5 });
    const [bx, by] = S.P(x, 0);
    svgEl('path', { d: `M${bx - 16} ${by - 2}L${bx + 16} ${by - 2}L${bx + 21} ${by - 10}L${bx - 21} ${by - 10}Z`, fill: '#fbe7a8', stroke: INK, 'stroke-width': 1.5 }, S.fg);
    svgEl('path', { d: `M${bx + 2} ${by - 10}L${bx + 2} ${by - 32}L${bx + 15} ${by - 13}Z`, fill: '#fff', stroke: INK, 'stroke-width': 1.3 }, S.fg);
    S.hlabel(bx + (rk < 1 ? 32 : 0), by - (rk < 1 ? 28 : 46), n, { cls: 'u9l6-boatn' });   // narrow scene: letter beside the sail, clear of the angle labels
    S.arc([0, 40], 0, -a, r * rk, { color: ANG, width: 2.5, label: T(deg(a)), la: -a - (a === 45 ? 14 : 7), lr: 4 });
  });
  // toggles: alternate angle at C, and C's triangle
  const zg = svgEl('g', { class: 'u9l6-tog' }, S.fg), tg = svgEl('g', { class: 'u9l6-tog' }, S.bg);
  S.line([118, 0], [158, 0], { color: SLATE, width: 2, layer: zg, dash: '9 7' });
  const za = S.arc([149.28, 0], 180, 165, 120 * rk, { color: ANG, width: 3.5, label: T(deg(15)), layer: zg, lr: 26 });
  S.line([0, 40], [149.28, 0], { color: ANG, width: 4.5, layer: zg });
  S.line([0, 40], [158, 40], { color: SLATE, width: 3.5, layer: zg });
  const zl = za.label; zl.classList.add('u9l6-tog');
  S.poly([[0, 0], [0, 40], [149.28, 0]], { fill: OPP, opacity: 0.1, layer: tg });
  S.line([0, 0], [0, 40], { color: OPP, width: 5, layer: tg }); S.line([0, 0], [149.28, 0], { color: ADJ, width: 5, layer: tg });
  const tl = [S.lab(3, 9, `${T('40')} m <span class="u9l6-tagi" style="color:${OPP}">opp</span>`, { pos: 'e', cls: 'u9l6-lab u9l6-halo' }),
    S.lab(105, 0, `${T('d=?')} <span class="u9l6-tagi" style="color:${ADJT}">adj</span>`, { pos: 's', cls: 'u9l6-lab u9l6-halo' })];
  tl.forEach((e) => e.classList.add('u9l6-tog'));
  const tog = (btn, els) => { if (!btn) return; btn.onclick = () => { const on = btn.classList.toggle('on'); els.forEach((e) => e.classList.toggle('on', on)); }; };
  tog(document.getElementById('u9l6-wz'), [zg, zl]);
  tog(document.getElementById('u9l6-wtri'), [tg, ...tl]);
}

/* =============================== static figures =============================== */
function figEx1(host, W = 860) {
  const S = new Scene(host, { width: W, height: 250, win: [-7, 49, -5, 14.6], pad: [10, 10, 10, 10] });
  S.ground(-3, 48); S.transit(0, 1.6); S.pole(45, 13.6577);
  S.line([0, 1.6], [47, 1.6], { color: SLATE, dash: 'dot', width: 2.5 });
  S.line([0, 1.6], [45, 13.6577], { color: INK, width: 2.5 });
  S.line([0, 0], [45, 13.6577], { color: INK, width: 2, dash: '9 6' });
  S.rmark([45, 0], 180, 90, 12);
  S.dim([0, 0], [0, 1.6], T('1.6') + ' m', { off: -26 });
  S.dim([0, 0], [45, 0], T('45') + ' m', { off: 36 });
  S.lab(0, 0, 'transit', { pos: 's', gap: 4, cls: 'u9l6-lab sm' });
  S.arc([0, 1.6], 0, 15, 70, { color: INK, width: 2, label: T(deg(15)) });
  S.lab(45, 7, 'pole', { pos: 'e', gap: 10, cls: 'u9l6-lab sm' });
}
function figEx2(host) {
  const d = 18, fe = 5.5 + 18 * Math.tan(55 * RAD), H = fe + 4.3;
  const S = new Scene(host, { width: 380, height: 470, win: [-8, 28, -3, 38], pad: [12, 10, 12, 10] });
  S.ground(-4, 28); S.building(d, d + 7, H); S.person(0, 5.5);
  S.line([0, 5.5], [d + 3, 5.5], { color: SLATE, dash: 'dot', width: 2.5 });
  S.line([0, 5.5], [d, fe], { color: INK, width: 2.5 });
  S.dot([0, 5.5], { r: 4 }); S.dot([d, fe], { r: 4 });
  S.rmark([d, 0], 180, 90, 12);
  S.arc([0, 5.5], 0, 55, 46, { color: INK, width: 2, label: T(deg(55)), lr: 20 });
  S.dim([0, 0], [0, 5.5], T('5.5') + ' ft', { off: -22 });
  S.dim([d + 7, fe], [d + 7, H], T('4.3') + ' ft', { off: 16 });
  S.dim([0, 0], [d, 0], T('18') + ' ft', { off: 26 });
  S.lab(0, 0, 'Malik', { pos: 'sw', gap: 2, cls: 'u9l6-lab sm' });
  S.lab(d, fe, 'friend', { pos: 'nw', gap: 6, cls: 'u9l6-lab sm' });
}
function tanFig(host, o = {}) {
  const a = o.a || 64, r = o.r || 15, OC = r / Math.sin(a / 2 * RAD), C = [OC * Math.cos(a / 2 * RAD), OC * Math.sin(a / 2 * RAD)], L = C[0] + 1.1 * r;
  const P = [L * Math.cos(a * RAD), L * Math.sin(a * RAD)], Q = [L, 0];
  const S = new Scene(host, Object.assign({ width: 400, height: 330, win: [-4, L + 4, -4, P[1] + 3], pad: 18 }, o.box || {}));
  S.line([0, 0], Q, { width: 2.5 }); S.line([0, 0], P, { width: 2.5 });
  const [cx, cy] = S.P(...C); svgEl('circle', { cx, cy, r: r * S.s, fill: '#e8f0fb', stroke: INK, 'stroke-width': 2.5 }, S.mid);
  S.dot(C, { r: 4 });
  S.arc([0, 0], 0, a, 40, { color: INK, width: 2, label: T(deg(a)), lr: 22 });
  S.lab(...C, T('C'), { pos: 'e', gap: 8 }); S.lab(0, 0, T('O'), { pos: 'sw', gap: 4 }); S.lab(...Q, T('Q'), { pos: 'se', gap: 4 }); S.lab(...P, T('P'), { pos: 'n', gap: 4 });
  return { S, C, OC, r, a };
}
function figBearing(host, b, o = {}) {
  const S = new Scene(host, { width: o.w || 190, height: o.h || 200, win: [-1.7, 1.7, -1.7, 1.95], pad: 8 });
  S.line([0, 0], [0, 1.6], { width: 2.5 }); S.lab(0, 1.6, T('\\text{N}'), { pos: 'n', gap: 2 });
  S.arc([0, 0], 90, 90 - b, 0.62 * S.s, { color: ANG, width: 2.5, arrow: true });
  S.line([0, 0], [1.45 * Math.sin(b * RAD), 1.45 * Math.cos(b * RAD)], { color: HYP, width: 4.5 });
  S.dot([0, 0], { r: 4.5 });
  S.lab(0, -1.62, T(brg(b)), { pos: 'c', cls: 'u9l6-lab u9l6-bl' });
  return S;
}
function ferryFig(host) {
  const S = new Scene(host, { width: 300, height: 330, win: [-2.6, 8.4, -6.8, 4.6], pad: 14 });
  const M = [8 * Math.sin(130 * RAD), 8 * Math.cos(130 * RAD)];
  S.line([0, 0], [0, 3.4], { width: 2.5, arrow: true }); S.lab(0, 3.4, T('N'), { pos: 'n', gap: 4 });
  S.line([0, 0], M, { width: 2.8 });
  S.arc([0, 0], 90, -40, 0.9 * S.s, { color: INK, width: 2, label: T(deg(130)), lr: 22 });
  S.lab(0, 0, T('D'), { pos: 'w', gap: 8 }); S.lab(...M, T('M'), { pos: 'se', gap: 4 });
  S.lab(M[0] / 2, M[1] / 2, T('8') + ' km', { pos: 'sw', gap: 6, cls: 'u9l6-lab sm' });
}
function legsFig(host, ans) {
  const R = [14 * Math.sin(38 * RAD), 14 * Math.cos(38 * RAD)], L = [R[0] + 9 * Math.sin(97 * RAD), R[1] + 9 * Math.cos(97 * RAD)];
  const S = new Scene(host, { width: ans ? 340 : 400, height: ans ? 290 : 340, win: [-2.5, 20.5, -2, 17], pad: 14 });
  S.line([0, 0], [0, 5.2], { width: 2.5, arrow: true }); S.lab(0, 5.2, T('N'), { pos: 'n', gap: 3 });
  S.line(R, [R[0], R[1] + 4.2], { width: 2.5, arrow: true }); S.lab(R[0], R[1] + 4.2, T('M'), { pos: 'n', gap: 3 });
  S.line([0, 0], R, { width: 2.8, color: ans ? HYP : INK }); S.line(R, L, { width: 2.8, color: ans ? HYP : INK });
  S.lab(0, 0, T('T'), { pos: 's', gap: 6 }); S.lab(...R, T('R'), { pos: 'w', gap: 8 }); S.lab(...L, T('L'), { pos: 'e', gap: 8 });
  S.lab(R[0] / 2, R[1] / 2, T('14') + ' km', { pos: 'se', gap: 8, cls: 'u9l6-lab sm' });
  S.lab((R[0] + L[0]) / 2, (R[1] + L[1]) / 2, T('9') + ' km', { pos: ans ? 's' : 'n', gap: 8, cls: 'u9l6-lab sm' });
  if (ans) {
    S.arc([0, 0], 90, 52, 46, { color: ANG, width: 2.5, label: T(deg(38)), lr: 20 });
    S.arc(R, 90, -7, 40, { color: ANG, width: 2.5, label: T(deg(97)), lr: 20 });
  }
}
function mountFigs() {
  const g = (id) => document.getElementById(id);
  if (g('u9l6-ex1fig')) figEx1(g('u9l6-ex1fig'));
  if (g('u9l6-ex2fig')) figEx2(g('u9l6-ex2fig'));
  if (g('u9l6-ex4fig')) tanFig(g('u9l6-ex4fig'));
  if (g('u9l6-ex4ans')) {
    const { S, C } = tanFig(g('u9l6-ex4ans'), { box: { width: 330, height: 270 } });
    S.line([0, 0], C, { color: HYP, width: 3, dash: '9 6' }); S.line(C, [C[0], 0], { color: OPP, width: 3, dash: '9 6' });
    S.rmark([C[0], 0], 180, 90, 11);
    S.lab(C[0], 7.5, T('15'), { pos: 'e', gap: 6, color: OPP, cls: 'u9l6-lab sm' });
    S.arc([0, 0], 0, 32, 112, { color: ANG, width: 2.5, label: T(deg(32)), lr: 18 });
  }
  const four = g('u9l6-four'); if (four) [72, 155, 210, 318].forEach((b) => figBearing(four, b));
  if (g('u9l6-ex5fig')) ferryFig(g('u9l6-ex5fig'));
  if (g('u9l6-ex6fig')) legsFig(g('u9l6-ex6fig'), false);
  if (g('u9l6-ex6ans')) legsFig(g('u9l6-ex6ans'), true);
}

/* ======================================================================================
 * Explainer 1: two calculations in one triangle (Example 1)
 * ====================================================================================== */
const TC = {
  demo: { label: 'Demo: 40 m, 20°, eye 1.5 m', d: 40, a: 20, eye: 1.5 },
  ex1: { label: 'Example 1 check', d: 45, a: 15, eye: 1.6 }
};
const twoCalcs = {
  title: 'Two calculations, one picture: from the eyepiece, then from the ground',
  height: 450,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(TC).map((k) => ({ v: k, label: TC[k].label })),
  intro: 'A transit sights the top of a pole. Part (a) and part (b) use <b>different triangles</b>. Press <b>Next</b>.',
  make(stage, key, ex) {
    const q = TC[key], { d, a, eye } = q, tA = Math.tan(a * RAD), rise = d * tA, Ht = eye + rise, ratio = Number(f4(Ht)) / d, th = Math.atan(ratio) / RAD;
    const S = new Scene(stage, { x: 0, y: 0, width: ex.W, height: 300, win: [-7, d + 7, -4.2, Ht + 1.2], pad: [14, 30, 6, 30] });
    S.ground(-4, d + 5); S.transit(0, eye); S.pole(d, Ht);
    S.dim([0, 0], [0, eye], T(String(eye)) + ' m', { off: -24, color: EYE });
    S.dim([0, 0], [d, 0], T(String(d)) + ' m', { off: 30 });
    S.lab(d, Ht * 0.55, 'pole', { pos: 'e', gap: 12, cls: 'u9l6-lab sm' });
    S.rmark([d, 0], 180, 90, 12);
    const pw = (ex.W - 50) / 2, pA = panel(stage, 16, 306, pw, 136, '(a) from the eyepiece'), pB = panel(stage, 34 + pw, 306, pw, 136, '(b) from the base of the transit');
    const g1 = [];
    return [
      { cap: `(a) The ${T(deg(a))} is measured at the <b>eyepiece</b>, ${T(String(eye))} m up. Draw the <b>eye-level</b> line across to the pole.`,
        run: async (c) => {
          const el = S.line([0, eye], [d, eye], { color: SLATE, dash: 'dot', width: 3 }); g1.push(el); await drawIn(el, 600, c);
          const ar = S.arc([0, eye], 0, a, 66, { label: T(deg(a)) }); g1.push(ar, ar.label); await drawIn(ar, 400, c); await show(c, ar.label);
        } },
      { cap: `Sight the top: a right triangle <b>above eye level</b>. From ${T(deg(a))}: the rise is <b class="u9l6-co">opposite</b>, ${T(String(d))} m is <b class="u9l6-ca">adjacent</b> → <b>TOA</b>.`,
        run: async (c) => {
          const tri = S.poly([[0, eye], [d, eye], [d, Ht]], { fill: OPP, opacity: 0.09 }); g1.push(tri); await appear(c, tri, 300);
          const sl = S.line([0, eye], [d, Ht], { color: HYP, width: 3.5 }); g1.push(sl); await drawIn(sl, 600, c);
          const ad = S.line([0, eye], [d, eye], { color: ADJ, width: 4.5 }), op = S.line([d, eye], [d, Ht], { color: OPP, width: 6 }); g1.push(ad, op);
          const rm = S.rmark([d, eye], 180, 90, 12); g1.push(rm);
          await Promise.all([drawIn(ad, 500, c), drawIn(op, 500, c)]);
          const t1 = tagAt(S, d, eye + rise / 2, 'rise', OPP, 'w'), t2 = tagAt(S, d * 0.62, eye, 'adj', ADJT, 'n'); g1.push(t1, t2);
          await Promise.all([pop(c, t1), pop(c, t2)]);
        } },
      { cap: `${T(`\\text{rise}=${d}\\tan${deg(a)}=${d}(${f6(tA)})=${f4(rise)}`)} m. Keep all the digits.`,
        run: (c) => say(c, pA, T(`\\text{rise}=${d}\\tan${deg(a)}=${cO(f4(rise))}`)) },
      { cap: `That is only the part above eye level. <b class="u9l6-ce">Add the eye height back:</b> ${T(`${eye}+${f4(rise)}=${f4(Ht)}`)}, so the pole is ${T(`\\approx\\boldsymbol{${f1(Ht)}}`)} <b>m</b>.`,
        run: async (c) => {
          const eb = S.line([d, 0], [d, eye], { color: EYE, width: 7 }); await drawIn(eb, 400, c);
          const t = tagAt(S, d, eye / 2, '+' + eye, EYE, 'e'); await pop(c, t);
          await say(c, pA, T(`\\text{pole}=${cE(eye)}+${cO(f4(rise))}=${f4(Ht)}\\approx\\boldsymbol{${f1(Ht)}\\text{ m}}`));
        } },
      { cap: `(b) Now look up from the <b>base</b> of the transit, on the ground. A <b>new triangle</b>: the <b>whole pole</b> is <b class="u9l6-co">opposite</b>, the ground is <b class="u9l6-ca">adjacent</b>.`,
        run: async (c) => {
          await Promise.all(g1.map((e) => anim(c, e, [{ opacity: 1 }, { opacity: 0.18 }], 400)));
          const tri = S.poly([[0, 0], [d, 0], [d, Ht]], { fill: HYP, opacity: 0.07 }); await appear(c, tri, 300);
          const sl = S.line([0, 0], [d, Ht], { color: HYP, width: 3.5, dash: '12 7' }); await drawIn(sl, 600, c);
          const op = S.line([d, 0], [d, Ht], { color: OPP, width: 6 }), ad = S.line([0, 0], [d, 0], { color: ADJ, width: 5 });
          await Promise.all([drawIn(op, 500, c), drawIn(ad, 500, c)]);
          const t = tagAt(S, d, Ht * 0.3, f4(Ht), OPP, 'e'); await pop(c, t);
        } },
      { cap: `Use the <b>unrounded</b> height from (a): ${T(`\\tan\\theta=\\dfrac{${f4(Ht)}}{${d}}=${f6(ratio)}`)}, so ${T(`\\theta=\\tan^{-1}(${f6(ratio)})=${f2(th)}^\\circ\\approx\\boldsymbol{${Math.round(th)}^\\circ}`)}.`,
        run: async (c) => {
          const ar = S.arc([0, 0], 0, th, 120, { color: ANG, label: T('\\theta'), lr: 22 }); await drawIn(ar, 400, c); await show(c, ar.label);
          await say(c, pB, T(`\\tan\\theta=\\dfrac{${cO(f4(Ht))}}{${cA(d)}}=${f6(ratio)}`));
          await say(c, pB, T(`\\theta=\\tan^{-1}(${f6(ratio)})=${f2(th)}^\\circ\\approx\\boldsymbol{${Math.round(th)}^\\circ}`));
        } },
      { cap: `Check: from lower down you must look up <b>more steeply</b>, so ${T(`${Math.round(th)}^\\circ>${deg(a)}`)} makes sense.`,
        run: async (c) => { const s = stamp(pB, `${Math.round(th)}° > ${a}° ✓`, { ok: true, x: pw - 80, y: 46, size: 'sm' }); await stampIn(c, s); } }
    ];
  }
};

/* ======================================================================================
 * Explainer 2: hidden right angle in a semicircle
 * ====================================================================================== */
const semicircle = {
  title: 'A hidden right angle: the angle in a semicircle',
  height: 420,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  intro: 'No right angle is marked. Is there one anyway? Press <b>Next</b>.',
  make(stage, v, ex) {
    const S = new Scene(stage, { x: 10, y: 0, width: 600, height: 420, win: [-1.25, 1.25, -0.35, 1.2], pad: [20, 10, 20, 10] });
    const A = [-1, 0], B = [1, 0], [cx, cy] = S.P(0, 0);
    svgEl('circle', { cx, cy, r: S.s, fill: '#f4f7fc', stroke: INK, 'stroke-width': 2.5 }, S.bg);
    const ab = S.line(A, B, { width: 3 });
    S.dot([0, 0], { r: 4 }); S.lab(0, 0, T('O'), { pos: 's', gap: 6 });
    S.lab(...A, T('A'), { pos: 'w', gap: 8 }); S.lab(...B, T('B'), { pos: 'e', gap: 8 });
    const pR = panel(stage, 640, 20, ex.W - 660, 380, 'Angle ACB');
    const read = h('div', 'u9l6-big', ''); pR.appendChild(read); hide(read);
    let phi = 115, C = [Math.cos(phi * RAD), Math.sin(phi * RAD)], ac, cb, cl, cd, rm;
    const place = (p) => {
      phi = p; C = [Math.cos(p * RAD), Math.sin(p * RAD)];
      if (ac) { S.setLine(ac, A, C); S.setLine(cb, C, B); }
      if (cd) { const [x, y] = S.P(...C); cd.setAttribute('cx', x); cd.setAttribute('cy', y); }
      if (cl) place2(cl, C);
      if (rm) { rm.remove(); rm = mark(); }
      const u = [A[0] - C[0], A[1] - C[1]], w = [B[0] - C[0], B[1] - C[1]], ang = Math.acos((u[0] * w[0] + u[1] * w[1]) / Math.hypot(...u) / Math.hypot(...w)) / RAD;
      read.innerHTML = T(`\\angle ACB=${ang.toFixed(1)}^\\circ`);
    };
    const place2 = (el, q) => { const [x, y] = S.P(...q); el.style.left = x + 'px'; el.style.top = y + 'px'; };
    const mark = () => { const da = Math.atan2(A[1] - C[1], A[0] - C[0]) / RAD, db = Math.atan2(B[1] - C[1], B[0] - C[0]) / RAD; return S.rmark(C, da, db, 16, ANG); };
    const slide = (c, to, ms) => { const from = phi; return tween(c, ms, (t) => { place(from + (to - from) * t); }); };
    return [
      { cap: `${T('AB')} is a <b>diameter</b>. Put ${T('C')} anywhere on the circle and join it to ${T('A')} and ${T('B')}.`,
        run: async (c) => {
          ac = S.line(A, C, { width: 3 }); cb = S.line(C, B, { width: 3 }); cd = S.dot(C, { r: 6, color: ANG });
          cl = S.lab(...C, T('C'), { pos: 'n', gap: 10 });
          await pop(c, cd); await Promise.all([drawIn(ac, 500, c), drawIn(cb, 500, c)]); await show(c, cl);
        } },
      { cap: `Measure angle ${T('ACB')}: <b>${T('90^\\circ')}</b>.`,
        run: async (c) => { place(phi); await pop(c, rm = mark()); await show(c, read); } },
      { cap: `Slide ${T('C')} around the circle…`, run: (c) => slide(c, 45, 1600) },
      { cap: `…all the way over. Still ${T('90^\\circ')}, wherever ${T('C')} is.`, run: (c) => slide(c, 158, 2200) },
      { cap: `Why? ${T('OA')}, ${T('OB')} and ${T('OC')} are all <b>radii</b>, so triangles ${T('AOC')} and ${T('BOC')} are <b>isosceles</b>: equal base angles ${T('a')} and ${T('b')}.`,
        run: async (c) => {
          await slide(c, 112, 900);
          const oc = S.line([0, 0], C, { color: SLATE, width: 2.5, dash: '9 6' }); await drawIn(oc, 400, c);
          const angAt = (V, P, Q, r, lab, col) => { const a1 = Math.atan2(P[1] - V[1], P[0] - V[0]) / RAD, a2 = Math.atan2(Q[1] - V[1], Q[0] - V[0]) / RAD; let x = a1, y = a2; if (Math.abs(y - x) > 180) { if (y < x) y += 360; else x += 360; } return S.arc(V, x, y, r, { color: col, width: 2.5, label: T(lab), lr: 16 }); };
          const arcs = [angAt(A, B, C, 44, 'a', OPP), angAt(C, A, [0, 0], 40, 'a', OPP), angAt(B, C, A, 44, 'b', ADJ), angAt(C, [0, 0], B, 58, 'b', ADJ)];
          for (const g of arcs) { await drawIn(g, 250, c); await show(c, g.label, 200); }
        } },
      { cap: `The angles of triangle ${T('ABC')} add to ${T('180^\\circ')}: ${T('a+b+(a+b)=180^\\circ')}, so ${T('a+b=90^\\circ')}. Angle ${T('ACB')} is always a right angle.`,
        run: async (c) => { await say(c, pR, T('a+b+(a+b)=180^\\circ')); await say(c, pR, T('2(a+b)=180^\\circ')); await say(c, pR, T('a+b=\\boldsymbol{90^\\circ}')); } },
      { cap: `So a triangle drawn in a semicircle is a <b>right triangle</b>, and the <b>diameter is its hypotenuse</b>: SOH CAH TOA works.`,
        run: async (c) => {
          const hy = S.line(A, B, { color: HYP, width: 5 }); await drawIn(hy, 500, c);
          const t = tagAt(S, 0.5, 0, 'hypotenuse', HYP, 's'); await pop(c, t);
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 3 (★): eye level — a person with a clinometer sights a tree
 * ====================================================================================== */
const EL = {
  tree: { label: 'Demo: a tree', obj: 'tree', name: 'tree', eye: 1.7, d: 24, a: 35 },
  ex3: { label: 'Example 3(b) check', obj: 'flag', name: 'flagpole', eye: 1.55, d: 18, a: 32, read: 58, dl: '18.0' }
};
const eyeLevel = {
  title: 'Measured from eye level: the triangle sits on top of the eye height',
  height: 450,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(EL).map((k) => ({ v: k, label: EL[k].label })),
  intro: 'How tall is it? You can’t climb it, but you can measure an angle. Press <b>Next</b>.',
  make(stage, key, ex) {
    const q = EL[key], { d, a, eye } = q, tA = Math.tan(a * RAD), rise = d * tA, H = eye + rise, dl = q.dl || String(d);
    const S = new Scene(stage, { x: 0, y: 0, width: 600, height: 450, win: [-3.5, d + 5.5, -1.6, H + 1.2], pad: [12, 10, 10, 10] });
    S.ground(-3, d + 5);
    if (q.obj === 'tree') S.tree(d, H); else S.flagpole(d, H);
    S.person(0, eye, { color: SLATE });
    S.dim([0, 0], [d, 0], T(dl) + ' m', { off: 22 });
    const pR = panel(stage, 620, 16, ex.W - 636, 418, q.obj === 'tree' ? 'Height of the tree' : 'Example 3(b)');
    const angCap = q.read ? `The string reads ${T(deg(q.read))}, so the angle of elevation is ${T(`90^\\circ-${q.read}^\\circ=${deg(a)}`)}. It is measured from <b>eye level</b>: the horizontal through the eyes.` : `The ${T(deg(a))} is measured from <b>eye level</b>: the horizontal line through the eyes, across to the ${q.name}.`;
    let barT;
    return [
      { cap: `Sight the top of the ${q.name} through the clinometer.`,
        run: async (c) => { const sl = S.line([0, eye], [d, H], { color: HYP, width: 3.5 }); await drawIn(sl, 700, c); await pop(c, S.dot([d, H], { color: HYP })); } },
      { cap: angCap,
        run: async (c) => {
          const el = S.line([0, eye], [d, eye], { color: SLATE, dash: 'dot', width: 3.5 }); await drawIn(el, 600, c);
          const ar = S.arc([0, eye], 0, a, 64, { label: T(deg(a)) }); await drawIn(ar, 400, c); await show(c, ar.label);
        } },
      { cap: `Above eye level is a <b>right triangle</b>: ${T(dl)} m is <b class="u9l6-ca">adjacent</b> to ${T(deg(a))}, and the rise is <b class="u9l6-co">opposite</b>.`,
        run: async (c) => {
          const tri = S.poly([[0, eye], [d, eye], [d, H]], { fill: OPP, opacity: 0.1 }); await appear(c, tri, 300);
          S.rmark([d, eye], 180, 90, 12);
          const ad = S.line([0, eye], [d, eye], { color: ADJ, width: 5 }), op = S.line([d, eye], [d, H], { color: OPP, width: 6 });
          await Promise.all([drawIn(ad, 500, c), drawIn(op, 500, c)]);
          const t1 = tagAt(S, d, eye + rise / 2, 'rise (opp)', OPP, 'w'), t2 = tagAt(S, d * 0.5, eye, `${dl} m (adj)`, ADJT, 'n');
          await Promise.all([pop(c, t1), pop(c, t2)]);
        } },
      { cap: `TOA: ${T(`\\tan${deg(a)}=\\dfrac{\\text{rise}}{${dl}}`)}, so ${T(`\\text{rise}=${dl}\\tan${deg(a)}=${f4(rise)}`)} m. Keep the digits.`,
        run: async (c) => {
          await say(c, pR, T(`\\tan${deg(a)}=\\dfrac{${cO('\\text{rise}')}}{${cA(dl)}}`));
          await say(c, pR, T(`${cO('\\text{rise}')}=${dl}\\tan${deg(a)}`));
          await say(c, pR, T(`=${cO(f4(rise))}\\text{ m}`));
        } },
      { cap: `The triangle stops at eye level. Below it is the <b class="u9l6-ce">eye height</b>, ${T(String(eye))} m: the same at the person and at the ${q.name}.`,
        run: async (c) => {
          const b0 = S.line([-1.2, 0], [-1.2, eye], { color: EYE, width: 7 }); await drawIn(b0, 400, c);
          barT = S.line([d, 0], [d, eye], { color: EYE, width: 8 });
          const dx = S.P(d, 0)[0] - S.P(-1.2, 0)[0];
          await anim(c, barT, [{ transform: `translateX(${-dx}px)`, opacity: 0.4 }, { transform: 'translateX(0)', opacity: 1 }], 1100);
          const t = tagAt(S, d, eye / 2, '+' + eye, EYE, 'w'); await pop(c, t);
        } },
      { cap: `Add it back at the end: height ${T(`=${eye}+${f4(rise)}=${f4(H)}\\approx\\boldsymbol{${f1(H)}}`)} <b>m</b>.`,
        run: async (c) => {
          const dm = S.dim([d, 0], [d, H], null, { off: 46, color: INK, width: 2.5 }); await drawIn(dm, 500, c);
          const t = S.lab(d, H / 2, `<b>${f1(H)} m</b>`, { pos: 'e', gap: 54, cls: 'u9l6-lab u9l6-halo' }); await pop(c, t);
          await say(c, pR, T(`\\text{height}=${cE(eye)}+${cO(f4(rise))}`));
          await say(c, pR, T(`=${f4(H)}\\approx\\boldsymbol{${f1(H)}\\text{ m}}`));
        } },
      { cap: `Forget the eye height and you get ${T(f1(rise))} m: the height <b>above your eyes</b> only, ${T(String(eye))} m short.`,
        run: async (c) => {
          const box2 = h('div', 'u9l6-stamps'); pR.appendChild(box2);
          const s1 = stamp(box2, `✗ ${f1(rise)} m`, { ok: false, size: 'sm' }), s2 = stamp(box2, `✓ ${f1(H)} m`, { ok: true, size: 'sm' });
          await stampIn(c, s1); await stampIn(c, s2);
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 4: eye level at both ends (Example 2)
 * ====================================================================================== */
const TE = {
  ex2: { label: 'Example 2 check', d: 18, a: 55, e1: 5.5, e2: 4.3 },
  demo: { label: 'Demo: 25 ft, 40°', d: 25, a: 40, e1: 5.2, e2: 3.8 }
};
const twoEyes = {
  title: 'Eye level at both ends: stack the building from three pieces',
  height: 460,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(TE).map((k) => ({ v: k, label: TE[k].label })),
  intro: 'Malik looks up at his friend in a window. Press <b>Next</b>.',
  make(stage, key, ex) {
    const q = TE[key], { d, a, e1, e2 } = q, tA = Math.tan(a * RAD), rise = d * tA, fe = e1 + rise, H = fe + e2, bw = 7;
    const S = new Scene(stage, { x: 0, y: 0, width: 560, height: 460, win: [-6, d + bw + 9, -4.2, H + 1.5], pad: [10, 10, 8, 10] });
    S.ground(-4, d + bw + 8); S.building(d, d + bw, H); S.person(0, e1, { clino: false });
    const [fx, fy] = S.P(d - 0.6, fe); svgEl('circle', { cx: fx, cy: fy, r: 9, fill: '#fff', stroke: SLATE, 'stroke-width': 2.5 }, S.mid);
    S.dim([0, 0], [d, 0], T(String(d)) + ' ft', { off: 20 });
    S.lab(0, 0, 'Malik', { pos: 'sw', gap: 2, cls: 'u9l6-lab sm' }); S.lab(d - 0.6, fe, 'friend', { pos: 'nw', gap: 8, cls: 'u9l6-lab sm' });
    const pR = panel(stage, 580, 16, ex.W - 596, 428, 'Height of the building'), xb = d + bw + 2.2;
    const piece = async (c, y0, y1, col, txt) => { const b = S.line([xb, y0], [xb, y1], { color: col, width: 12, layer: S.fg }); b.p.setAttribute('stroke-linecap', 'butt'); await drawIn(b, 500, c); const t = S.lab(xb, (y0 + y1) / 2, txt, { pos: 'e', gap: 12, cls: 'u9l6-lab u9l6-halo', color: col }); await pop(c, t); };
    return [
      { cap: `Malik’s eyes are ${T(String(e1))} ft up. The ${T(deg(a))} is measured from <b>his eye level</b>.`,
        run: async (c) => {
          const b0 = S.dim([0, 0], [0, e1], null, { off: -16, color: EYE }); await drawIn(b0, 300, c);
          const el = S.line([0, e1], [d, e1], { color: SLATE, dash: 'dot', width: 3.5 }); await drawIn(el, 600, c);
          const ar = S.arc([0, e1], 0, a, 44, { label: T(deg(a)), lr: 18 }); await drawIn(ar, 400, c); await show(c, ar.label);
        } },
      { cap: `His line of sight ends at his <b>friend’s eyes</b>, which are ${T(String(e2))} ft below the top: not at the top of the building.`,
        run: async (c) => { const sl = S.line([0, e1], [d, fe], { color: HYP, width: 3.5 }); await drawIn(sl, 700, c); await pop(c, S.dot([d, fe], { color: HYP })); } },
      { cap: `A right triangle above Malik’s eye level: ${T(String(d))} ft <b class="u9l6-ca">adjacent</b>, rise <b class="u9l6-co">opposite</b>. ${T(`\\text{rise}=${d}\\tan${deg(a)}=${f4(rise)}`)} ft.`,
        run: async (c) => {
          const tri = S.poly([[0, e1], [d, e1], [d, fe]], { fill: OPP, opacity: 0.1 }); await appear(c, tri, 300);
          S.rmark([d, e1], 180, 90, 11);
          const ad = S.line([0, e1], [d, e1], { color: ADJ, width: 5 }), op = S.line([d, e1], [d, fe], { color: OPP, width: 6 });
          await Promise.all([drawIn(ad, 500, c), drawIn(op, 500, c)]);
          await say(c, pR, T(`${cO('\\text{rise}')}=${d}\\tan${deg(a)}=${cO(f4(rise))}`));
        } },
      { cap: `Stack the building. First, the piece <b class="u9l6-ce">below Malik’s eye level</b>: ${T(String(e1))} ft.`,
        run: (c) => piece(c, 0, e1, EYE, T(String(e1))) },
      { cap: `Then the <b class="u9l6-co">rise</b>: ${T(`${e1}+${f4(rise)}=${f4(fe)}`)} ft gets you to his friend’s eyes.`,
        run: async (c) => { await piece(c, e1, fe, OPP, T(f4(rise))); await say(c, pR, `friend’s eyes:<br>${T(`${cE(e1)}+${cO(f4(rise))}=${f4(fe)}`)}`); } },
      { cap: `Then the ${T(String(e2))} ft <b class="u9l6-ct">above his friend’s eyes</b>, up to the very top.`,
        run: (c) => piece(c, fe, H, TEAL, T(String(e2))) },
      { cap: `Height ${T(`=${e1}+${f4(rise)}+${e2}=${f4(H)}\\approx\\boldsymbol{${f1(H)}}`)} <b>ft</b>.`,
        run: async (c) => {
          const dm = S.dim([xb, 0], [xb, H], null, { off: -26, color: INK, width: 2.5 }); await drawIn(dm, 500, c);
          await say(c, pR, T(`\\text{height}=${f4(fe)}+\\textcolor{${TEAL}}{${e2}}`));
          await say(c, pR, T(`=${f4(H)}\\approx\\boldsymbol{${f1(H)}\\text{ ft}}`));
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 5: reading a clinometer
 * ====================================================================================== */
const CL = {
  ex3: { label: 'Example 3: string at 58°', th: 32, flip: false },
  flip: { label: 'Held the other way: 122°', th: 32, flip: true },
  steep: { label: 'Steep: string at 20°', th: 70, flip: false }
};
const clinometer = {
  title: 'Reading a clinometer: the string always hangs straight down',
  height: 450,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(CL).map((k) => ({ v: k, label: CL[k].label })),
  intro: 'A protractor, a straw, a string and a washer. Press <b>Next</b>.',
  make(stage, key, ex) {
    const q = CL[key], TH = q.th, read = q.flip ? 90 + TH : 90 - TH, R = 165, cx = 330, cy = 205;
    const svg = svgEl('svg', { width: 640, height: 450, viewBox: '0 0 640 450', class: 'u9l6-csvg' }, stage); svg.style.left = '0px'; svg.style.top = '0px';
    const html = add(stage, box(h('div', 'u9l6-chtml'), 640, 450), 0, 0);
    svgEl('path', { d: `M${cx - 250} ${cy}L${cx + 250} ${cy}`, stroke: GRAY, 'stroke-width': 2, 'stroke-dasharray': '8 7' }, svg);
    const hz = h('div', 'u9l6-lab sm u9l6-muted', 'horizontal'); html.appendChild(hz); hz.style.left = (cx + 190) + 'px'; hz.style.top = (cy + 4) + 'px';
    const prot = svgEl('g', {}, svg), str = svgEl('g', {}, svg), over = svgEl('g', {}, svg);
    const pt = (ang, r) => [cx + r * Math.cos(ang * RAD), cy - r * Math.sin(ang * RAD)];
    let th = 0;
    const rd = h('div', 'u9l6-rd', ''); html.appendChild(rd);
    const draw = (t) => {
      th = t; prot.innerHTML = '';
      const back = t + 180, fwd = t; // the arc runs from the eye end (back) through straight-below-the-straw to the forward end
      const a0 = pt(back, R), a1 = pt(fwd, R);
      svgEl('path', { d: `M${a0[0]} ${a0[1]}A${R} ${R} 0 0 0 ${a1[0]} ${a1[1]}Z`, fill: '#fdf3d3', stroke: ADJ, 'stroke-width': 2.5 }, prot);
      for (let n = 0; n <= 180; n += 5) {
        const ang = back + n, len = n % 10 ? 8 : 15, p = pt(ang, R), p2 = pt(ang, R - len);
        svgEl('path', { d: `M${p[0]} ${p[1]}L${p2[0]} ${p2[1]}`, stroke: '#8a6a22', 'stroke-width': n % 30 ? 1.2 : 2 }, prot);
        if (n % 30 === 0) { const lp = pt(ang, R - 34), tx = svgEl('text', { x: lp[0], y: lp[1] + 6, 'text-anchor': 'middle', class: 'u9l6-pt' }, prot); tx.textContent = q.flip ? 180 - n : n; }
      }
      const s0 = pt(back, R + 38), s1 = pt(fwd, R + 38);
      svgEl('path', { d: `M${s0[0]} ${s0[1]}L${s1[0]} ${s1[1]}`, stroke: '#7fb3e6', 'stroke-width': 12, 'stroke-linecap': 'round', opacity: 0.85 }, prot);
      const e = pt(back, R + 58); svgEl('circle', { cx: e[0], cy: e[1], r: 10, fill: '#fff', stroke: SLATE, 'stroke-width': 2.5 }, prot); svgEl('circle', { cx: e[0], cy: e[1], r: 4, fill: SLATE }, prot);
      str.innerHTML = '';
      svgEl('path', { d: `M${cx} ${cy}L${cx} ${cy + R + 30}`, stroke: INK, 'stroke-width': 2 }, str);
      svgEl('circle', { cx, cy: cy + R + 38, r: 9, fill: '#c9ccd3', stroke: INK, 'stroke-width': 2 }, str);
      svgEl('circle', { cx, cy, r: 4, fill: INK }, str);
      const r = q.flip ? 90 + t : 90 - t; rd.innerHTML = `<b>${Math.round(r)}</b>`; rd.style.left = (cx + 14) + 'px'; rd.style.top = (cy + R + 4) + 'px';
    };
    draw(0);
    const pR = panel(stage, 660, 16, ex.W - 676, 418, 'Clinometer');
    const r1 = h('div', 'u9l6-line', `string reading: <b>90°</b>`); pR.appendChild(r1);
    return [
      { cap: `Held <b>level</b>, the string hangs across the <b>90°</b> mark: the angle of elevation is ${T('0^\\circ')}.`,
        run: async (c) => { await pulse(c, rd, 1.3); } },
      { cap: `Tilt the straw up to sight the top. The protractor turns with it, but the string still hangs <b>straight down</b>.`,
        run: (c) => tween(c, 1600, (t) => { draw(TH * t); r1.innerHTML = `string reading: <b>${Math.round(q.flip ? 90 + TH * t : 90 - TH * t)}°</b>`; }) },
      { cap: `Read where the string crosses the scale: <b>${read}°</b>.`,
        run: async (c) => { rd.classList.add('u9l6-rd-on'); await pulse(c, rd, 1.35); } },
      { cap: `The ${T('90^\\circ')} mark (straight below the straw) turned away from the string by <b>exactly</b> the tilt of the straw: ${T(deg(TH))}.`,
        run: async (c) => {
          const arc = (r, a1, a2, lab) => { const p = pt(a1, r), e = pt(a2, r); const g = svgEl('g', { class: 'bk-curve' }, over); g.style.color = ANG; svgEl('path', { class: 'bk-stroke', d: `M${p[0]} ${p[1]}A${r} ${r} 0 0 0 ${e[0]} ${e[1]}`, fill: 'none', stroke: ANG, 'stroke-width': 4 }, g); const m = pt((a1 + a2) / 2, r + 22), l = h('div', 'u9l6-alab', T(lab)); l.style.color = ANG; html.appendChild(l); l.style.left = m[0] + 'px'; l.style.top = m[1] + 'px'; l.style.translate = '-50% -50%'; return [g, l]; };
          const m90 = pt(th - 90, R - 15), ln = svgEl('path', { d: `M${cx} ${cy}L${m90[0]} ${m90[1]}`, stroke: ANG, 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }, over);
          await appear(c, ln, 300);
          const [g1, l1] = arc(70, 0, TH, deg(TH)); await drawIn(g1, 400, c); await show(c, l1);
          const [g2, l2] = arc(110, -90, -90 + TH, deg(TH)); await drawIn(g2, 400, c); await show(c, l2);
        } },
      { cap: q.flip ? `Angle of elevation ${T(`=|90^\\circ-${read}^\\circ|=|-${TH}^\\circ|=\\boldsymbol{${TH}^\\circ}`)}. The bars take care of a protractor held the other way round.`
        : `Angle of elevation ${T(`=|90^\\circ-${read}^\\circ|=\\boldsymbol{${TH}^\\circ}`)}.`,
        run: async (c) => {
          await say(c, pR, T(`\\text{elevation}=|90^\\circ-\\text{reading}|`));
          await say(c, pR, T(`=|90^\\circ-${read}^\\circ|`));
          await say(c, pR, T(`=\\boldsymbol{${cR(TH + '^\\circ')}}`));
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 6: Example 3(c) — one degree of error
 * ====================================================================================== */
const wobble = {
  title: 'Example 3(c): what one degree of misreading does to the height',
  height: 450,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Ana measured 12.8 m. The caretaker says 12.5 m. Press <b>Next</b>.',
  make(stage, v, ex) {
    const eye = 1.55, d = 18, hs = [31, 32, 33].map((a) => eye + d * Math.tan(a * RAD)), cols = ['#8fa8e8', HYP, '#8fa8e8'];
    const S = new Scene(stage, { x: 0, y: 0, width: 470, height: 450, win: [-2.5, 21, -1.4, 14.6], pad: [10, 10, 8, 10] });
    S.ground(-2, 21); S.flagpole(d, 13.6); S.person(0, eye);
    S.dim([0, 0], [d, 0], T('18.0') + ' m', { off: 20 });
    S.line([0, eye], [d, eye], { color: SLATE, dash: 'dot', width: 2.5 });
    const zx0 = 16.9, zx1 = 18.7, zy0 = 12.05, zy1 = 13.55;
    S.poly([[zx0, zy0], [zx1, zy0], [zx1, zy1], [zx0, zy1]], { fill: '#fff', opacity: 0, stroke: SLATE, sw: 1.5 });
    const Z = new Scene(stage, { x: 490, y: 8, width: ex.W - 506, height: 290, win: [zx0, zx1, zy0, zy1], pad: [6, 150, 6, 10] });
    const [zl, zt] = Z.P(zx0, zy1), [zr, zb] = Z.P(zx1, zy0);
    svgEl('rect', { x: zl, y: zt, width: zr - zl, height: zb - zt, fill: '#f7f9fc', stroke: SLATE, 'stroke-width': 1.5 }, Z.bg);
    Z.hlabel(zl + 6, zt + 4, 'zoom on the top of the pole', { pos: 'se', cls: 'u9l6-lab sm u9l6-muted', gap: 0 });
    Z.line([d, zy0], [d, zy1], { color: '#7d8794', width: 9 });
    for (let y = 12.2; y < 13.55; y += 0.2) { const [px, py] = Z.P(d, y); svgEl('path', { d: `M${px - 8} ${py}L${px + 8} ${py}`, stroke: '#fff', 'stroke-width': 1 }, Z.mid); }
    const tl = (k, c) => {
      const a = [31, 32, 33][k], m = Math.tan(a * RAD), xs = Math.max(zx0, (zy0 - eye) / m);
      const g1 = S.line([0, eye], [d, hs[k]], { color: cols[k], width: k === 1 ? 3 : 2.2 }), g2 = Z.line([xs, eye + xs * m], [d, hs[k]], { color: cols[k], width: k === 1 ? 4 : 3 });
      const dt = Z.dot([d, hs[k]], { color: k === 1 ? HYP : '#5d7bd0', r: 6 });
      const lb = Z.lab(d, hs[k], `<b>${a}°</b>: ${T(f2(hs[k]))} m`, { pos: 'e', gap: 16, cls: 'u9l6-lab u9l6-halo' });
      return Promise.all([drawIn(g1, 500, c), drawIn(g2, 500, c)]).then(() => Promise.all([pop(c, dt), show(c, lb)]));
    };
    return [
      { cap: `Ana’s reading gives ${T('32^\\circ')}: the line of sight hits the pole at ${T(`1.55+18\\tan32^\\circ=${f2(hs[1])}`)} m.`, run: (c) => tl(1, c) },
      { cap: `Misread by just ${T('1^\\circ')} low, ${T('31^\\circ')}: ${T(`1.55+18\\tan31^\\circ=${f2(hs[0])}`)} m.`, run: (c) => tl(0, c) },
      { cap: `${T('1^\\circ')} high, ${T('33^\\circ')}: ${T(`1.55+18\\tan33^\\circ=${f2(hs[2])}`)} m.`, run: (c) => tl(2, c) },
      { cap: `A ${T('1^\\circ')} error moves the answer about ${T('0.4')} m either way: anywhere from <b>${f1(hs[0])} m</b> to <b>${f1(hs[2])} m</b>. The caretaker’s <b>12.5 m</b> is inside that band.`,
        run: async (c) => {
          const [x0, y0] = Z.P(d - 0.35, hs[2]), [x1, y1] = Z.P(d + 0.35, hs[0]);
          const band = svgEl('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: ADJ, 'fill-opacity': 0.18, stroke: ADJ, 'stroke-dasharray': '6 4' }, Z.bg); await appear(c, band, 400);
          const cm = Z.line([d - 0.5, 12.5], [d + 0.06, 12.5], { color: EYE, width: 4, arrow: true }); await drawIn(cm, 400, c);
          const cl = Z.lab(d - 0.5, 12.5, 'caretaker<br>12.5 m', { pos: 'w', gap: 6, cls: 'u9l6-lab sm u9l6-halo', color: EYE }); await show(c, cl);
        } },
      { cap: `Other reasons: the string <b>swinging</b>, the ground <b>not level</b>, the distance not measured to the point <b>directly below the top</b>, the eye height <b>changing</b> (tilting the head).`,
        run: async (c) => {
          const p = add(stage, box(h('div', 'u9l6-panel u9l6-reasons', '<div class="u9l6-ph">Sources of error</div><ul><li>a 1° misreading</li><li>the string swinging</li><li>ground not level</li><li>distance not to the point below the top</li><li>eye height changes (head tilted)</li></ul>'), ex.W - 506, 136), 490, 304);
          await fadeIn(c, p, 400);
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 7 (Extension): tangent lines — Example 4
 * ====================================================================================== */
const TG = { ex4: { label: 'Example 4 check', a: 64, r: 15 }, demo: { label: 'Demo: 50°, radius 20 mm', a: 50, r: 20 } };
const tangent = {
  title: 'Extension: a circle tangent to both arms of an angle',
  height: 450,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(TG).map((k) => ({ v: k, label: TG[k].label })),
  intro: 'No right angle is drawn. Two circle facts build one. Press <b>Next</b>.',
  make(stage, key, ex) {
    const q = TG[key], { a, r } = q, hb = a / 2, sH = Math.sin(hb * RAD), OC = r / sH, C = [OC * Math.cos(hb * RAD), OC * Math.sin(hb * RAD)];
    const Lr = C[0] + 1.15 * r, P = [Lr * Math.cos(a * RAD), Lr * Math.sin(a * RAD)], Q = [Lr, 0], Tt = [C[0], 0], OT = C[0], Sg = [OT * Math.cos(a * RAD), OT * Math.sin(a * RAD)];
    const S = new Scene(stage, { x: 0, y: 0, width: 580, height: 450, win: [-0.12 * Lr, Lr * 1.06, -0.1 * Lr, P[1] + 0.06 * Lr], pad: [16, 16, 10, 16] });
    S.line([0, 0], Q, { width: 3 }); S.line([0, 0], P, { width: 3 });
    const [cx, cy] = S.P(...C); svgEl('circle', { cx, cy, r: r * S.s, fill: '#e8f0fb', stroke: INK, 'stroke-width': 2.5 }, S.bg);
    S.dot(C, { r: 5 }); S.lab(...C, T('C'), { pos: 'ne', gap: 4 });
    S.lab(0, 0, T('O'), { pos: 'sw', gap: 4 }); S.lab(...Q, T('Q'), { pos: 'se', gap: 4 }); S.lab(...P, T('P'), { pos: 'n', gap: 4 });
    const a0 = S.arc([0, 0], 0, a, 44, { color: INK, width: 2, label: T(deg(a)), lr: 20 });
    const pR = panel(stage, 600, 16, ex.W - 616, 418, `Find ${T('OC')}`);
    const fade = [];
    return [
      { cap: `The circle touches each arm at exactly <b>one point</b>, ${T('T')} and ${T('S')}: both arms are <b>tangent</b> to the circle.`,
        run: async (c) => { const d1 = S.dot(Tt, { color: ANG, r: 6 }), d2 = S.dot(Sg, { color: ANG, r: 6 }); await Promise.all([pop(c, d1), pop(c, d2)]); const l1 = S.lab(...Tt, T('T'), { pos: 's', gap: 8 }), l2 = S.lab(...Sg, T('S'), { pos: 'nw', gap: 6 }); await Promise.all([show(c, l1), show(c, l2)]); } },
      { cap: `A tangent meets the radius at a <b>right angle</b>: ${T('CT\\perp OQ')} and ${T('CS\\perp OP')}.`,
        run: async (c) => {
          const r1 = S.line(C, Tt, { color: SLATE, width: 2.5, dash: '8 6' }), r2 = S.line(C, Sg, { color: SLATE, width: 2.5, dash: '8 6' }); fade.push(r2);
          await Promise.all([drawIn(r1, 400, c), drawIn(r2, 400, c)]);
          const m1 = S.rmark(Tt, 180, 90, 13), m2 = S.rmark(Sg, a + 180, a - 90, 13); fade.push(m2); await Promise.all([pop(c, m1), pop(c, m2)]);
        } },
      { cap: `Tangent segments from the same point are <b>equal</b>: ${T('OT=OS')}.`,
        run: async (c) => {
          const t1 = S.line([0, 0], Tt, { color: ADJ, width: 5 }), t2 = S.line([0, 0], Sg, { color: ADJ, width: 5 }); fade.push(t2);
          await Promise.all([drawIn(t1, 500, c), drawIn(t2, 500, c)]);
          const tk = (V, ang) => { const [x, y] = S.P(...V), u = [Math.cos(ang * RAD), -Math.sin(ang * RAD)], nn = [-u[1], u[0]]; return svgEl('path', { d: `M${x - nn[0] * 9} ${y - nn[1] * 9}L${x + nn[0] * 9} ${y + nn[1] * 9}`, stroke: ADJ, 'stroke-width': 3 }, S.fg); };
          const k1 = tk([OT / 2, 0], 0), k2 = tk([Sg[0] / 2, Sg[1] / 2], a); fade.push(k2); await Promise.all([pop(c, k1), pop(c, k2)]);
        } },
      { cap: `So ${T('OC')} <b>bisects</b> angle ${T('POQ')}: ${T(`${a}^\\circ\\div2=${deg(hb)}`)} on each side.`,
        run: async (c) => {
          await anim(c, a0, [{ opacity: 1 }, { opacity: 0.2 }], 300); if (a0.label) a0.label.style.opacity = 0;
          const oc = S.line([0, 0], C, { color: HYP, width: 3.5 }); await drawIn(oc, 500, c);
          const b1 = S.arc([0, 0], 0, hb, 90, { label: T(deg(hb)), lr: 22 }), b2 = S.arc([0, 0], hb, a, 74, { label: T(deg(hb)), lr: 20 }); fade.push(b2, b2.label);
          await drawIn(b1, 300, c); await show(c, b1.label); await drawIn(b2, 300, c); await show(c, b2.label);
        } },
      { cap: `Right triangle ${T('OTC')}. From the ${T(deg(hb))} at ${T('O')}: the radius ${T(String(r))} is <b class="u9l6-co">opposite</b>, ${T('OC')} is the <b class="u9l6-ch">hypotenuse</b> → <b>SOH</b>.`,
        run: async (c) => {
          await Promise.all(fade.map((e) => anim(c, e, [{ opacity: 1 }, { opacity: 0.15 }], 300)));
          const tri = S.poly([[0, 0], Tt, C], { fill: HYP, opacity: 0.1 }); await appear(c, tri, 300);
          const op = S.line(Tt, C, { color: OPP, width: 6 }); await drawIn(op, 400, c);
          const t1 = tagAt(S, C[0], C[1] / 2, `${r} (opp)`, OPP, 'e'), t2 = tagAt(S, C[0] / 2, C[1] / 2, 'hyp', HYP, 'nw'); await Promise.all([pop(c, t1), pop(c, t2)]);
        } },
      { cap: `${T(`\\sin${deg(hb)}=\\dfrac{${r}}{OC}`)}. The unknown is on the bottom, so divide: ${T(`OC=\\dfrac{${r}}{\\sin${deg(hb)}}=${f2(OC)}\\approx\\boldsymbol{${Math.round(OC)}}`)} <b>mm</b>.`,
        run: async (c) => {
          await say(c, pR, T(`\\sin${deg(hb)}=\\dfrac{${cO(r)}}{${cH('OC')}}`));
          await say(c, pR, T(`${cH('OC')}=\\dfrac{${r}}{\\sin${deg(hb)}}=\\dfrac{${r}}{${f6(sH)}}`));
          await say(c, pR, T(`=${f2(OC)}\\approx\\boldsymbol{${Math.round(OC)}\\text{ mm}}`));
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 8 (★ Extension): the compass rose — bearings clockwise from north
 * ====================================================================================== */
const refOf = (b) => (b <= 90 ? { r: b, from: 'north', to: 'east', how: `${b}^\\circ`, col: 0 } : b <= 180 ? { r: 180 - b, from: 'south', to: 'east', how: `180^\\circ-${b}^\\circ`, col: 1 }
  : b <= 270 ? { r: b - 180, from: 'south', to: 'west', how: `${b}^\\circ-180^\\circ`, col: 2 } : { r: 360 - b, from: 'north', to: 'west', how: `360^\\circ-${b}^\\circ`, col: 3 });
const compass = {
  title: 'Extension: bearings turn clockwise from north',
  height: 460,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [72, 155, 210, 318].map((b) => ({ v: b, label: String(b).padStart(3, '0') + '°' })),
  intro: 'Stand facing north. Turn clockwise until you face the direction. Press <b>Next</b>.',
  make(stage, b, ex) {
    const rf = refOf(b), bs = String(b).padStart(3, '0');
    const S = new Scene(stage, { x: 0, y: 0, width: 470, height: 460, win: [-1.3, 1.3, -1.3, 1.3], pad: 20 });
    const [cx, cy] = S.P(0, 0), R = S.s;
    svgEl('circle', { cx, cy, r: R, fill: '#f6f8fc', stroke: SLATE, 'stroke-width': 2 }, S.bg);
    for (let t = 0; t < 360; t += 10) { const k = t % 90 === 0 ? 0.84 : t % 30 === 0 ? 0.9 : 0.94, s = Math.sin(t * RAD), cs = Math.cos(t * RAD); svgEl('path', { d: `M${cx + R * s} ${cy - R * cs}L${cx + R * k * s} ${cy - R * k * cs}`, stroke: SLATE, 'stroke-width': t % 90 ? 1.3 : 2.5 }, S.bg); }
    [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([n, t]) => S.lab(1.13 * Math.sin(t * RAD), 1.13 * Math.cos(t * RAD), `<b>${n}</b>`, { cls: 'u9l6-lab u9l6-cmp' }));
    S.line([0, -1], [0, 1], { color: GRAY, width: 2, dash: '8 6' }); S.line([-1, 0], [1, 0], { color: GRAY, width: 1.5, dash: '4 6' });
    const tip = [0.92 * Math.sin(b * RAD), 0.92 * Math.cos(b * RAD)];
    const ray = S.line([0, 0], [0, 0.92], { color: HYP, width: 5 }); hide(ray);
    S.dot([0, 0], { r: 6 });
    const sweep = svgEl('path', { fill: 'none', stroke: ANG, 'stroke-width': 3.5 }, S.mid);
    const pR = panel(stage, 490, 16, ex.W - 506, 428, 'Bearing');
    const rd = h('div', 'u9l6-bigb', T('000^\\circ')); pR.appendChild(rd); hide(rd);
    const tb = h('div', 'u9l6-mini', ['000°–090°<br>from N', '090°–180°<br>from S', '180°–270°<br>from S', '270°–360°<br>from N'].map((s) => `<div>${s}</div>`).join('')); pR.appendChild(tb); hide(tb);
    const setB = (x) => {
      const t = [0.92 * Math.sin(x * RAD), 0.92 * Math.cos(x * RAD)]; S.setLine(ray, [0, 0], t);
      const r = 0.36 * R, e = [cx + r * Math.sin(x * RAD), cy - r * Math.cos(x * RAD)];
      sweep.setAttribute('d', x < 0.5 ? '' : `M${cx} ${cy - r}A${r} ${r} 0 ${x > 180 ? 1 : 0} 1 ${e[0]} ${e[1]}`);
      rd.innerHTML = T(String(Math.round(x)).padStart(3, '0') + '^\\circ');
    };
    let head;
    return [
      { cap: `Every bearing starts at <b>north</b>.`, run: async (c) => { await appear(c, ray, 400); await show(c, rd); } },
      { cap: `Turn <b>clockwise</b> from north until you face the direction…`,
        run: async (c) => {
          await tween(c, 600 + b * 8, (t) => setB(b * t));
          const r = 0.36 * R, e = [cx + r * Math.sin(b * RAD), cy - r * Math.cos(b * RAD)];
          head = arrowHead(S.mid, e[0], e[1], Math.cos(b * RAD), Math.sin(b * RAD), { color: ANG, width: 3 }); await pop(c, head);
        } },
      { cap: `…and write the angle with <b>three digits</b>: ${T(bs + '^\\circ')}${b < 100 ? `, not ${T(b + '^\\circ')}` : ''}.`,
        run: (c) => pulse(c, rd, 1.2) },
      { cap: `For a right triangle, use the <b>reference angle</b>: the acute angle to the <b>north–south line</b>. ${T(bs + '^\\circ')} is in the ${['first', 'second', 'third', 'fourth'][rf.col]} column, so it is ${rf.col ? T(`${rf.how}=${rf.r}^\\circ`) : T(deg(rf.r)) + ' (the bearing itself)'} from <b>${rf.from}</b>, toward ${rf.to}.`,
        run: async (c) => {
          await show(c, tb); tb.children[rf.col].classList.add('on');
          const base = rf.from === 'north' ? 90 : 270, wa = 90 - b; let a1 = base, a2 = wa; while (a2 - a1 > 180) a2 -= 360; while (a1 - a2 > 180) a2 += 360;
          const ar = S.arc([0, 0], a1, a2, 0.42 * R, { color: ANG, width: 4, label: T(deg(rf.r)), lr: 16, la: a1 + (a2 - a1) * 0.3 }); await drawIn(ar, 400, c); await show(c, ar.label);
          const ns = S.line([0, 0], [0, rf.from === 'north' ? 1 : -1], { color: ADJ, width: 2.5, dash: '8 6' }); await drawIn(ns, 300, c);
        } },
      { cap: `Drop a line from the tip to the north–south line. The leg ${T('d')} is the <b class="u9l6-ch">hypotenuse</b>; the east–west part is <b class="u9l6-co">opposite</b> ${T(deg(rf.r))}, the north–south part is <b class="u9l6-ca">adjacent</b>.`,
        run: async (c) => {
          const F = [0, tip[1]], ns = S.line([0, 0], F, { color: ADJ, width: 6 }), ew = S.line(F, tip, { color: OPP, width: 6 });
          await drawIn(ns, 400, c); await drawIn(ew, 400, c);
          await pop(c, S.rmark(F, tip[0] > 0 ? 0 : 180, tip[1] > 0 ? 270 : 90, 12));
          const l1 = S.lab(tip[0] / 2, tip[1], T(`d\\sin${deg(rf.r)}`), { pos: tip[1] > 0 ? 'n' : 's', gap: 8, cls: 'u9l6-lab u9l6-halo', color: OPP });
          const l2 = S.lab(0, tip[1] / 2, T(`d\\cos${deg(rf.r)}`), { pos: tip[0] > 0 ? 'w' : 'e', gap: 10, cls: 'u9l6-lab u9l6-halo', color: ADJT });
          const l3 = S.lab(tip[0] / 2, tip[1] / 2, T('d'), { pos: tip[0] * tip[1] > 0 ? 'se' : 'ne', gap: 4, cls: 'u9l6-lab u9l6-halo', color: HYP });
          await Promise.all([show(c, l1), show(c, l2), show(c, l3)]);
        } },
      { cap: `The picture gives the directions: this leg goes <b>${tip[1] > 0 ? 'north' : 'south'}</b> ${T(`d\\cos${deg(rf.r)}`)} and <b>${tip[0] > 0 ? 'east' : 'west'}</b> ${T(`d\\sin${deg(rf.r)}`)}.`,
        run: async (c) => {
          await say(c, pR, `<b class="u9l6-ca">${tip[1] > 0 ? 'north' : 'south'}</b> ${T(`d\\cos${deg(rf.r)}`)}`);
          await say(c, pR, `<b class="u9l6-co">${tip[0] > 0 ? 'east' : 'west'}</b> ${T(`d\\sin${deg(rf.r)}`)}`);
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer 9 (Extension): the ferry — Example 5
 * ====================================================================================== */
const FY = { ex5: { label: 'Example 5 check', d1: 8, b1: 130, ex: 10, v: 12 }, demo: { label: 'Demo: 10 km on 120°, then 6 km', d1: 10, b1: 120, ex: 6, v: 15 } };
const ferry = {
  title: 'Extension: follow the ferry, one right triangle at a time',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(FY).map((k) => ({ v: k, label: FY[k].label })),
  intro: 'A ferry leaves the dock on a bearing. Press <b>Next</b>.',
  make(stage, key, ex) {
    const q = FY[key], { d1, b1, v } = q, ref = 180 - b1, e = d1 * Math.sin(ref * RAD), s = d1 * Math.cos(ref * RAD), W2 = q.ex;
    const th = Math.atan(e / W2) / RAD, tot = d1 + s + W2, t = tot / v;
    const D = [0, 0], M = [e, -s], N = [e, 0], Wp = [e, W2], Pn = [0, W2];
    const S = new Scene(stage, { x: 0, y: 0, width: 420, height: 470, win: [-2.6, e + 3, -s - 1.4, W2 + 1.6], pad: [14, 14, 10, 14] });
    S.line(D, [0, Math.min(3.2, W2 * 0.5)], { width: 2.5, arrow: true }); S.lab(0, Math.min(3.2, W2 * 0.5), 'N', { pos: 'n', gap: 2, cls: 'u9l6-lab sm' });
    S.dot(D, { r: 5 }); S.lab(...D, T('D'), { pos: 'w', gap: 10 });
    const pR = panel(stage, 440, 16, ex.W - 456, 438, key === 'ex5' ? 'Example 5' : 'Demo');
    return [
      { cap: `From ${T('D')}, start at north and turn <b>clockwise</b> ${T(deg(b1))}. Sail ${T(String(d1))} km to ${T('M')}.`,
        run: async (c) => {
          const ar = S.arc(D, 90, 90 - b1, 40, { color: ANG, width: 2.5, arrow: true, label: T(deg(b1)), lr: 16 }); await drawIn(ar, 500, c); await show(c, ar.label);
          const lg = S.line(D, M, { color: HYP, width: 4 }); await drawIn(lg, 600, c); await pop(c, S.dot(M, { r: 5 })); await show(c, S.lab(...M, T('M'), { pos: 'se', gap: 6 }));
          await show(c, S.lab(e / 2, -s / 2, T(String(d1)) + ' km', { pos: 'ne', gap: 4, cls: 'u9l6-lab sm u9l6-halo', color: HYP }));
        } },
      { cap: `${T(deg(b1))} is between ${T('090^\\circ')} and ${T('180^\\circ')}: reference angle ${T(`180^\\circ-${b1}^\\circ=${deg(ref)}`)}, measured from <b>south</b>.`,
        run: async (c) => {
          const sl = S.line(D, [0, -s], { color: SLATE, width: 2.5, dash: '8 6' }); await drawIn(sl, 400, c);
          const ar = S.arc(D, 270, 270 + ref, 64, { color: ANG, width: 3.5, label: T(deg(ref)), lr: 18 }); await drawIn(ar, 400, c); await show(c, ar.label);
        } },
      { cap: `Right triangle, hypotenuse ${T(String(d1))}: east part (<b class="u9l6-co">opposite</b>) ${T(`=${d1}\\sin${deg(ref)}=${f4(e)}`)} km; south part (<b class="u9l6-ca">adjacent</b>) ${T(`=${d1}\\cos${deg(ref)}=${f4(s)}`)} km.`,
        run: async (c) => {
          const so = S.line(D, [0, -s], { color: ADJ, width: 5 }), ea = S.line([0, -s], M, { color: OPP, width: 5 }); await drawIn(so, 400, c); await drawIn(ea, 400, c);
          await pop(c, S.rmark([0, -s], 0, 90, 11));
          await say(c, pR, `east ${T(`=${d1}\\sin${deg(ref)}=${cO(f4(e))}`)}`); await say(c, pR, `south ${T(`=${d1}\\cos${deg(ref)}=${cA(f4(s))}`)}`);
        } },
      { cap: `(a) Sail <b>due north</b> from ${T('M')}: the east position doesn’t change. At ${T('N')}, level with ${T('D')}, the ferry is ${T(`${f4(e)}\\approx\\boldsymbol{${f1(e)}}`)} <b>km</b> east of ${T('D')}.`,
        run: async (c) => {
          const mn = S.line(M, N, { color: HYP, width: 4, arrow: true }); await drawIn(mn, 500, c); await pop(c, S.dot(N, { r: 5 })); await show(c, S.lab(...N, T('N'), { pos: 'e', gap: 8 }));
          const dn = S.line(D, N, { color: OPP, width: 3, dash: '9 6' }); await drawIn(dn, 400, c);
          await say(c, pR, `(a) ${T(`DN=${f4(e)}\\approx\\boldsymbol{${f1(e)}\\text{ km}}`)}`);
        } },
      { cap: `(b) ${T(String(W2))} km further north to ${T('W')}. Now ${T('W')} is ${T(String(W2))} km <b>north</b> and ${T(f4(e))} km <b>east</b> of ${T('D')}.`,
        run: async (c) => {
          const nw = S.line(N, Wp, { color: HYP, width: 4, arrow: true }); await drawIn(nw, 600, c); await pop(c, S.dot(Wp, { r: 5 })); await show(c, S.lab(...Wp, T('W'), { pos: 'e', gap: 8 }));
          const nl = S.line(D, Pn, { color: ADJ, width: 4 }), pw = S.line(Pn, Wp, { color: OPP, width: 4 }); await drawIn(nl, 400, c); await drawIn(pw, 400, c);
          await pop(c, S.rmark(Pn, 0, 270, 11));
        } },
      { cap: `From north at ${T('D')}: ${T(`\\tan\\theta=\\dfrac{${f4(e)}}{${W2}}`)}, ${T(`\\theta=${f2(th)}^\\circ`)}. Bearing of ${T('W')} from ${T('D')}: ${T(`\\boldsymbol{${brg(th)}}`)}.`,
        run: async (c) => {
          const dw = S.line(D, Wp, { color: HYP, width: 3, dash: '10 6' }); await drawIn(dw, 500, c);
          const ar = S.arc(D, 90, 90 - th, 70, { color: ANG, width: 3.5, label: T('\\theta'), lr: 16 }); await drawIn(ar, 400, c); await show(c, ar.label);
          await say(c, pR, `(b) ${T(`\\theta=\\tan^{-1}\\!\\left(\\dfrac{${cO(f4(e))}}{${cA(W2)}}\\right)=${f2(th)}^\\circ`)}`); await say(c, pR, `bearing ${T(`\\boldsymbol{${brg(th)}}`)}`);
        } },
      { cap: `(c) Distance sailed ${T(`=${d1}+${f4(s)}+${W2}=${f4(tot)}`)} km. At ${T(String(v))} km/h, time ${T(`=\\dfrac{${f4(tot)}}{${v}}=${f4(t)}\\approx\\boldsymbol{${f1(t)}}`)} <b>h</b>.`,
        run: async (c) => { await say(c, pR, `(c) ${T(`${f4(tot)}\\div${v}=${f4(t)}\\approx\\boldsymbol{${f1(t)}\\text{ h}}`)}`); } }
    ];
  }
};

/* ======================================================================================
 * Explainer 10 (Extension): two legs — Example 6
 * ====================================================================================== */
const TL = {
  ex6: { label: 'Example 6 check', d1: 14, b1: 38, d2: 9, b2: 97, n: ['T', 'R', 'L', 'N', 'M'] },
  demo: { label: 'Demo: 10 km on 025°, 6 km on 120°', d1: 10, b1: 25, d2: 6, b2: 120, n: ['T', 'R', 'L', 'N', 'M'] }
};
const twoLegs = {
  title: 'Extension: two legs, split into east–west and north–south parts',
  height: 480,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(TL).map((k) => ({ v: k, label: TL[k].label })),
  intro: 'Two legs on different bearings. Where does she end up? Press <b>Next</b>.',
  make(stage, key, ex) {
    const q = TL[key], { d1, b1, d2, b2 } = q, r1 = refOf(b1), r2 = refOf(b2);
    const e1 = d1 * Math.sin(b1 * RAD), n1 = d1 * Math.cos(b1 * RAD), e2 = d2 * Math.sin(b2 * RAD), n2 = d2 * Math.cos(b2 * RAD);
    const E = e1 + e2, N = n1 + n2, rnd = (v) => Number(f4(v)), Ed = rnd(e1) + rnd(e2), Nd = rnd(n1) + rnd(n2), dist = Math.hypot(Ed, Nd), bb = ((Math.atan2(Ed, Nd) / RAD) + 360) % 360, rb = refOf(bb);
    const Tp = [0, 0], R = [e1, n1], L = [E, N], na = d1 * 0.32;
    const xs = [0, e1, E], ys = [0, n1, N, n1 + na];
    const S = new Scene(stage, { x: 0, y: 0, width: 560, height: 480, win: [Math.min(...xs) - 2.2, Math.max(...xs) + 3.6, Math.min(...ys) - 2.8, Math.max(...ys) + 1.4], pad: [14, 12, 8, 12] });
    S.dot(Tp, { r: 5 }); S.lab(...Tp, T('T'), { pos: 'sw', gap: 4 });
    const pR = panel(stage, 576, 14, ex.W - 590, 452, key === 'ex6' ? 'Example 6' : 'Demo');
    const sgn = (v, p, m) => (v >= 0 ? p : m);
    const comp = (d, rf, ew, nsv) => `east–west ${T(`${d}\\sin${deg(rf.r)}=${f4(Math.abs(ew))}`)} <b>${sgn(ew, 'E', 'W')}</b>; north–south ${T(`${d}\\cos${deg(rf.r)}=${f4(Math.abs(nsv))}`)} <b>${sgn(nsv, 'N', 'S')}</b>`;
    const sameE = Math.sign(e1) === Math.sign(e2), sameN = Math.sign(n1) === Math.sign(n2);
    const ys0 = Math.min(0, n1, N) - 1.6, xr = Math.max(0, e1, E) + 1.8;
    return [
      { cap: `(a) Draw a north line at <b>every</b> turning point. Bearings turn clockwise from north at that point: ${T(`\\angle ${q.n[3]}${q.n[0]}${q.n[1]}=${deg(b1)}`)} and ${T(`\\angle ${q.n[4]}${q.n[1]}${q.n[2]}=${deg(b2)}`)}.`,
        run: async (c) => {
          const n0 = S.line(Tp, [0, na], { width: 2.5, arrow: true }), nR = S.line(R, [R[0], R[1] + na], { width: 2.5, arrow: true });
          await Promise.all([drawIn(n0, 300, c), drawIn(nR, 300, c)]);
          await Promise.all([show(c, S.lab(0, na, T(q.n[3]), { pos: 'n', gap: 2 })), show(c, S.lab(R[0], R[1] + na, T(q.n[4]), { pos: 'n', gap: 2 }))]);
          const l1 = S.line(Tp, R, { color: HYP, width: 4 }); await drawIn(l1, 500, c); await pop(c, S.dot(R, { r: 5 })); await show(c, S.lab(...R, T(q.n[1]), { pos: 'w', gap: 10 }));
          const l2 = S.line(R, L, { color: HYP, width: 4 }); await drawIn(l2, 500, c); await pop(c, S.dot(L, { r: 5 })); await show(c, S.lab(...L, T(q.n[2]), { pos: 'e', gap: 10 }));
          const a1 = S.arc(Tp, 90, 90 - b1, 46, { color: ANG, width: 3, arrow: true, label: T(deg(b1)), lr: 16 }), a2 = S.arc(R, 90, 90 - b2, 40, { color: ANG, width: 3, arrow: true, label: T(deg(b2)), lr: 16 });
          await drawIn(a1, 400, c); await show(c, a1.label); await drawIn(a2, 400, c); await show(c, a2.label);
          await show(c, S.lab(e1 / 2, n1 / 2, T(String(d1)), { pos: 'se', gap: 6, cls: 'u9l6-lab sm u9l6-halo', color: HYP }));
          await show(c, S.lab((e1 + E) / 2, (n1 + N) / 2, T(String(d2)), { pos: 'n', gap: 8, cls: 'u9l6-lab sm u9l6-halo', color: HYP }));
        } },
      { cap: `Leg 1, ${T(brg(b1))}: ${T(deg(r1.r))} from <b>${r1.from}</b>. East–west part ${T(`${d1}\\sin${deg(r1.r)}=${f4(Math.abs(e1))}`)}, north–south part ${T(`${d1}\\cos${deg(r1.r)}=${f4(Math.abs(n1))}`)}.`,
        run: async (c) => {
          const v = S.line(Tp, [0, n1], { color: ADJ, width: 5 }), w = S.line([0, n1], R, { color: OPP, width: 5 }); await drawIn(v, 400, c); await drawIn(w, 400, c);
          await say(c, pR, `<b>Leg 1</b> ${comp(d1, r1, e1, n1)}`, 'sm');
        } },
      { cap: `Leg 2, ${T(brg(b2))}: reference angle ${T(`${r2.how}=${deg(r2.r)}`)} from <b>${r2.from}</b>. East–west ${T(`${d2}\\sin${deg(r2.r)}=${f4(Math.abs(e2))}`)}, north–south ${T(`${d2}\\cos${deg(r2.r)}=${f4(Math.abs(n2))}`)}.`,
        run: async (c) => {
          const sl = S.line(R, [R[0], N], { color: ADJ, width: 5 }), w = S.line([R[0], N], L, { color: OPP, width: 5 }); await drawIn(sl, 400, c); await drawIn(w, 400, c);
          const base = r2.from === 'north' ? 90 : 270, wa = 90 - b2; let a2 = wa; while (a2 - base > 180) a2 -= 360; while (base - a2 > 180) a2 += 360;
          const ar = S.arc(R, base, a2, 30, { color: ANG, width: 3.5, label: T(deg(r2.r)), lr: 14 }); await drawIn(ar, 300, c); await show(c, ar.label);
          await say(c, pR, `<b>Leg 2</b> ${comp(d2, r2, e2, n2)}`, 'sm');
        } },
      { cap: `(b) ${sameE ? 'Both legs go the same way east–west: <b>add</b>' : 'The legs go opposite ways east–west: <b>subtract</b>'}. ${T(`${f4(Math.abs(e1))}${sameE ? '+' : '-'}${f4(Math.abs(e2))}=${f4(Math.abs(Ed))}\\approx\\boldsymbol{${f1(Math.abs(Ed))}}`)} <b>km ${sgn(E, 'east', 'west')}</b>.`,
        run: async (c) => {
          const dm = S.dim([0, ys0], [E, ys0], `<b>${f1(Math.abs(Ed))} km ${sgn(E, 'E', 'W')}</b>`, { color: OPP, width: 2.5, pos: 's' }); await drawIn(dm, 500, c); await show(c, dm.label);
          await say(c, pR, `(b) ${T(`${f4(Math.abs(e1))}${sameE ? '+' : '-'}${f4(Math.abs(e2))}=${cO(f4(Math.abs(Ed)))}`)}`);
        } },
      { cap: `(c) ${sameN ? 'Both legs go the same way north–south: <b>add</b>' : `Leg 1 goes ${sgn(n1, 'north', 'south')}, leg 2 goes <b>${sgn(n2, 'north', 'south')}</b>: <b>subtract</b>`}. ${T(`${f4(Math.abs(n1))}${sameN ? '+' : '-'}${f4(Math.abs(n2))}=${f4(Math.abs(Nd))}\\approx\\boldsymbol{${f1(Math.abs(Nd))}}`)} <b>km ${sgn(N, 'north', 'south')}</b>.`,
        run: async (c) => {
          const dm = S.dim([xr, 0], [xr, N], `<b>${f1(Math.abs(Nd))} km ${sgn(N, 'N', 'S')}</b>`, { color: ADJT, width: 2.5, pos: 'e' }); await drawIn(dm, 500, c); await show(c, dm.label);
          await say(c, pR, `(c) ${T(`${f4(Math.abs(n1))}${sameN ? '+' : '-'}${f4(Math.abs(n2))}=${cA(f4(Math.abs(Nd)))}`)}`);
        } },
      { cap: `(d) Pythagoras on the <b>unrounded</b> parts: ${T(`${q.n[0]}${q.n[2]}=\\sqrt{${f4(Math.abs(Ed))}^2+${f4(Math.abs(Nd))}^2}=${f2(dist)}\\approx\\boldsymbol{${f1(dist)}}`)} <b>km</b>.`,
        run: async (c) => {
          const tl = S.line(Tp, L, { color: HYP, width: 3.5, dash: '12 7' }); await drawIn(tl, 600, c);
          await say(c, pR, `(d) ${T(`\\sqrt{${f4(Math.abs(Ed))}^2+${f4(Math.abs(Nd))}^2}`)}`); await say(c, pR, T(`=${cH(f2(dist))}\\approx\\boldsymbol{${f1(dist)}\\text{ km}}`));
        } },
      { cap: `(e) ${T(q.n[2])} is ${sgn(N, 'north', 'south')} and ${sgn(E, 'east', 'west')} of ${T(q.n[0])}. Angle from ${rb.from}: ${T(`\\tan\\theta=\\dfrac{${f4(Math.abs(Ed))}}{${f4(Math.abs(Nd))}}`)}, ${T(`\\theta=${f2(rb.r)}^\\circ`)}. Bearing ${T(`\\boldsymbol{${brg(bb)}}`)}.`,
        run: async (c) => {
          const ar = S.arc(Tp, 90, 90 - bb, 80, { color: ANG, width: 3.5, label: T('\\theta'), lr: 14 }); await drawIn(ar, 400, c); await show(c, ar.label);
          await say(c, pR, `(e) ${T(`\\theta=\\tan^{-1}\\!\\left(\\dfrac{${f4(Math.abs(Ed))}}{${f4(Math.abs(Nd))}}\\right)=${f2(rb.r)}^\\circ`)}`);
          await say(c, pR, `bearing ${T(`\\boldsymbol{${brg(bb)}}`)}`);
        } }
    ];
  }
};

/* =============================== mount =============================== */
mountWarm();
mountFigs();
export const explainers = mountExplainers({ twoCalcs, semicircle, eyeLevel, twoEyes, clinometer, wobble, tangent, compass, ferry, twoLegs });
export const _test = { TC, EL, TE, CL, TG, FY, TL, refOf };

/* =============================== Math History: measuring Everest (u9l6-hist) =============================== */
(function everestSurvey() {
  const svg = document.getElementById('u9l6-hist'); if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k])); (parent || svg).appendChild(e); return e; };
  const txt = (s, attrs, parent) => { const e = mk('text', attrs, parent); e.textContent = s; return e; };
  const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const op = (el, v) => { el.style.opacity = v; };
  const GY = 246, E = { x: 64, y: 232 }, S = { x: 500, y: 64 };
  const A = Math.atan2(E.y - S.y, S.x - E.x), L = Math.hypot(S.x - E.x, E.y - S.y);
  // the plains and the Himalaya
  mk('rect', { x: 0, y: GY, width: 600, height: 300 - GY, class: 'u9l6h-plain' });
  mk('polygon', { points: '350,246 392,196 412,206 446,150 470,112 500,64 528,116 548,100 574,150 600,176 600,246', class: 'u9l6h-mtn' });
  mk('polygon', { points: '486,90 500,64 516,94 507,88 500,96 493,88', class: 'u9l6h-snow' });
  mk('line', { x1: 0, x2: 600, y1: GY, y2: GY, class: 'u9l6h-ground' });
  txt('Peak XV', { x: 512, y: 62, class: 'u9l6h-peak' });
  // the six stations (one is ours, the others sight the summit later)
  const STNS = [{ x: 34, h: '28 991' }, { x: 49, h: '29 005' }, { x: E.x, h: '29 001' }, { x: 79, h: '28 998' }, { x: 94, h: '29 026' }, { x: 109, h: '28 990' }]; // Washburn's table of the 1849–50 sightings
  const sights = STNS.map((s, i) => {
    const ln = mk('line', { x1: s.x, y1: GY - 4, x2: S.x, y2: S.y, class: 'u9l6h-six' });
    if (s.x !== E.x) mk('polygon', { points: `${s.x - 4},${GY} ${s.x + 4},${GY} ${s.x},${GY - 9}`, class: 'u9l6h-stn' });
    const row = txt('', { x: 24, y: 64 + 17 * i, class: 'u9l6h-row' });
    mk('tspan', {}, row).textContent = 'station ' + (i + 1) + ':  ';
    mk('tspan', { class: 'u9l6h-rowh' }, row).textContent = s.h + ' ft';
    return { ln, row };
  });
  const avg = txt('average: 29 002 ft', { x: 24, y: 172, class: 'u9l6h-avg' });
  // the triangle pieces
  const eye = mk('line', { x1: E.x, y1: E.y, x2: S.x, y2: E.y, class: 'u9l6h-eye' });
  const rise = mk('line', { x1: S.x, y1: S.y + 2, x2: S.x, y2: E.y, class: 'u9l6h-rise' });
  const riseT = txt('rise', { x: S.x + 8, y: 186, class: 'u9l6h-lab u9l6h-gold' });
  const distG = mk('g', {});
  mk('line', { x1: E.x, x2: S.x, y1: 262, y2: 262, class: 'u9l6h-dim' }, distG);
  mk('line', { x1: E.x, x2: E.x, y1: 256, y2: 268, class: 'u9l6h-dim' }, distG); mk('line', { x1: S.x, x2: S.x, y1: 256, y2: 268, class: 'u9l6h-dim' }, distG);
  txt('distance: 174 to 190 km', { x: (E.x + S.x) / 2, y: 284, 'text-anchor': 'middle', class: 'u9l6h-lab' }, distG);
  txt('not to scale', { x: 592, y: 292, 'text-anchor': 'end', class: 'u9l6h-small' });
  const formula = txt('height = station + distance × tan θ', { x: 22, y: 32, class: 'u9l6h-formula' });
  // the theodolite: a tripod and a telescope that swings up
  mk('line', { x1: E.x, y1: E.y, x2: E.x - 10, y2: GY, class: 'u9l6h-leg' }); mk('line', { x1: E.x, y1: E.y, x2: E.x + 10, y2: GY, class: 'u9l6h-leg' }); mk('line', { x1: E.x, y1: E.y, x2: E.x, y2: GY, class: 'u9l6h-leg' });
  const sight = mk('line', { x1: E.x, y1: E.y, x2: E.x + L, y2: E.y, class: 'u9l6h-sight' });
  const arc = mk('path', { d: '', class: 'u9l6h-arc' });
  const thT = txt('θ', { x: E.x + 64, y: E.y - 8, class: 'u9l6h-theta' });
  const scope = mk('g', {});
  mk('rect', { x: E.x - 6, y: E.y - 3.5, width: 28, height: 7, rx: 2, class: 'u9l6h-scope' }, scope);
  mk('circle', { cx: E.x, cy: E.y, r: 4.5, class: 'u9l6h-head' });
  const burst = mk('circle', { cx: S.x, cy: S.y, r: 34, class: 'u9l6h-burst' });
  const y1856 = txt('1856: 29 002 ft = 8840 m', { x: 592, y: 22, 'text-anchor': 'end', class: 'u9l6h-res' });
  const y2020 = txt('today: 8848.86 m', { x: 592, y: 42, 'text-anchor': 'end', class: 'u9l6h-res2' });
  const T = 12600, SIX0 = 5800, SIXD = 600;
  function draw(t) {
    const a = A * ease(seg(t, 600, 3400)), deg = (a * 180) / Math.PI;
    sight.setAttribute('x2', (E.x + L * Math.cos(a)).toFixed(1)); sight.setAttribute('y2', (E.y - L * Math.sin(a)).toFixed(1));
    scope.setAttribute('transform', `rotate(${(-deg).toFixed(2)} ${E.x} ${E.y})`);
    const R = 54; arc.setAttribute('d', a > 0.001 ? `M${E.x + R},${E.y} A${R},${R} 0 0 0 ${(E.x + R * Math.cos(a)).toFixed(1)},${(E.y - R * Math.sin(a)).toFixed(1)}` : '');
    op(thT, seg(t, 3000, 3400));
    const tri = seg(t, 3400, 4600); op(eye, tri); op(rise, tri); op(riseT, tri); op(distG, tri);
    op(formula, seg(t, 4600, 5300));
    sights.forEach((s, i) => { const p = seg(t, SIX0 + SIXD * i, SIX0 + SIXD * i + 300); op(s.ln, p); op(s.row, p); });
    op(avg, seg(t, 9500, 9900)); burst.classList.toggle('on', t >= 9500);
    op(y1856, seg(t, 10400, 10800)); op(y2020, seg(t, 11400, 11800));
  }
  let t0 = 0, raf = 0;
  function frame(now) { if (!t0) t0 = now; const t = Math.min(T, now - t0); draw(t); if (t < T) raf = requestAnimationFrame(frame); }
  function play() {
    cancelAnimationFrame(raf); t0 = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(T); return; }
    draw(0); raf = requestAnimationFrame(frame);
  }
  draw(0);
  svg.addEventListener('click', play);
  const btn = svg.closest('.hist-anim') && svg.closest('.hist-anim').querySelector('.hist-play'); if (btn) btn.addEventListener('click', play);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.5 });
    io.observe(svg);
  } else play();
})();
