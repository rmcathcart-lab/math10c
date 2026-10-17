/* Math 10C · Unit 9 · Lesson 8 — Right Triangle Trigonometry: A Cumulative Review.
 * Static figures: the warm-up pyramid, and every booklet figure (examples and review questions) redrawn from the
 * booklet's TikZ coordinates with the same vertex letters, side labels, angle marks and measures.
 * Explainers:
 *   pyramid (warm-up: halve the base, TOA, tan⁻¹; why A, B, C are wrong), whichTool (★ a triangle travels the which-tool
 *   flowchart; Ex 2a, 3a, 3b, 3c, 5 checks), names (opp/adj/hyp, the legs swap names when the angle switches corners;
 *   Ex 1 check), cofunction (an angle dial: sin rises, cos falls; sin(90−x) = cos x), solveSide (a balance: unknown on
 *   top → multiply, on the bottom → divide; Ex 2 checks), solveAngle (the ratio machine run backwards; Ex 3 and Ex 1(c)
 *   checks), elevation (cliff and boat: parallel horizontals and the Z; eye level; Ex 4 check), split (★ an oblique
 *   triangle splits along its altitude; Ex 5 check), iso (area → height → congruent halves → sides → apex; Ex 6 check),
 *   bearings (Extension: clockwise from north, the right triangle on the north–south line).
 * Colours (whole unit): opposite purple, adjacent amber, hypotenuse blue, reference angle red. */
import {
  h, tex, add, box, Box, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween, anim, pulse,
  svgEl, place, rightMark, drawIn, COLORS, col
} from '../blocks.js';

const T = (s) => tex(s);
const OPP = COLORS.purple, ADJ = COLORS.amber, HYP = COLORS.blue, REF = COLORS.red, INK = COLORS.ink, GRN = COLORS.green, TEAL = COLORS.teal, GRAY = '#9aa0ab';
const RAD = Math.PI / 180;
const f = (v, d) => v.toFixed(d);
const deg = (v) => `${v}^\\circ`;
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const fr = (n, d) => { const g = gcd(n, d); return d / g === 1 ? String(n / g) : `\\frac{${n / g}}{${d / g}}`; };
const frEq = (n, d) => { const r = fr(n, d); return r === `\\frac{${n}}{${d}}` ? r : `\\frac{${n}}{${d}}=${r}`; };
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u9l8-panel', title ? `<div class="u9l8-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u9l8-line ' + cls, html); p.appendChild(d); return d; };
const say = async (c, p, html, cls) => { const d = line(p, html, cls); await fadeIn(c, d, 300); return d; };
const B = (name, cls) => `<b class="u9l8-${cls}">${name}</b>`;
const OPPw = B('opposite', 'o'), ADJw = B('adjacent', 'a'), HYPw = B('hypotenuse', 'h');

/* =============================== Geo: a geometry canvas in units =============================== */
class Geo extends Box {
  /** o: { x, y, w, h, k (px per unit), ox, oy (px position of the unit origin) } */
  constructor(host, o) {
    super(host, o, 'u9l8-geo', o.w, o.h);
    this.k = o.k; this.ox = o.ox; this.oy = o.oy;
    this.Lbg = this.layer('bg'); this.Lmid = this.layer('mid'); this.Ltop = this.layer('top');
  }
  P(p) { return [this.ox + p[0] * this.k, this.oy - p[1] * this.k]; }
  /** a side: g (colour via g.style.color) with one stroke */
  seg(a, b, o = {}) {
    const g = svgEl('g', { class: 'bk-curve u9l8-side' + (o.cls ? ' ' + o.cls : '') }, o.layer || this.Lmid); g.style.color = col(o.color, INK);
    const [x1, y1] = this.P(a), [x2, y2] = this.P(b);
    g.path = svgEl('path', { class: 'bk-stroke', d: `M${x1} ${y1}L${x2} ${y2}`, stroke: 'currentColor', 'stroke-width': o.width || 3.5, 'stroke-linecap': o.dash ? 'butt' : 'round', fill: 'none', 'stroke-dasharray': o.dash ? (o.dash === true ? '11 8' : o.dash) : null }, g);
    g.a = a; g.b = b; return g;
  }
  poly(pts, o = {}) { const g = svgEl('g', { class: 'bk-curve' }, o.layer || this.Lmid); g.style.color = col(o.color, INK); g.path = svgEl('path', { class: 'bk-stroke', d: 'M' + pts.map((p) => this.P(p).join(' ')).join('L') + (o.closed ? 'Z' : ''), stroke: 'currentColor', 'stroke-width': o.width || 3.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', fill: 'none', 'stroke-dasharray': o.dash ? '11 8' : null }, g); return g; }
  fill(pts, color, op = 1, layer) { return svgEl('polygon', { points: pts.map((p) => this.P(p).join(',')).join(' '), fill: color, 'fill-opacity': op }, layer || this.Lbg); }
  lab(p, html, o = {}) { const [x, y] = this.P(p); return this.hlabel(x + (o.dx || 0), y + (o.dy || 0), html, { pos: o.pos || 'c', cls: 'u9l8-lab ' + (o.cls || ''), color: o.color, gap: o.gap ?? 6 }); }
  /** move a label made by lab() to a new unit point */
  moveLab(d, p, o = {}) { const [x, y] = this.P(p); place(d, x + (o.dx || 0), y + (o.dy || 0), o.pos || 'c', o.gap ?? 6); }
  rm(V, A, B2, s = 15, color = INK) { return rightMark(this.Ltop, this.P(V), this.P(A), this.P(B2), s, { color, width: 2.4 }); }
  /** angle mark at V between rays to A and B2: a wedge plus an arc (both drawn in by drawIn) */
  arc(V, A, B2, r = 36, o = {}) {
    const g = svgEl('g', { class: 'bk-curve u9l8-arc' }, this.Ltop), c0 = col(o.color, REF);
    const [vx, vy] = this.P(V), [ax, ay] = this.P(A), [bx, by] = this.P(B2);
    const a1 = Math.atan2(ay - vy, ax - vx); let d = Math.atan2(by - vy, bx - vx) - a1;
    while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    const s = [vx + r * Math.cos(a1), vy + r * Math.sin(a1)], e = [vx + r * Math.cos(a1 + d), vy + r * Math.sin(a1 + d)], sw = d > 0 ? 1 : 0;
    if (o.wedge !== false) { const fg = svgEl('g', { class: 'bk-fillg' }, g); svgEl('path', { d: `M${vx} ${vy}L${s[0]} ${s[1]}A${r} ${r} 0 0 ${sw} ${e[0]} ${e[1]}Z`, fill: c0, 'fill-opacity': o.op ?? 0.16 }, fg); }
    svgEl('path', { class: 'bk-stroke', d: `M${s[0]} ${s[1]}A${r} ${r} 0 0 ${sw} ${e[0]} ${e[1]}`, fill: 'none', stroke: c0, 'stroke-width': o.width || 3 }, g);
    g.bis = [Math.cos(a1 + d / 2), Math.sin(a1 + d / 2)]; g.V = [vx, vy];
    if (o.label != null) { g.label = this.hlabel(vx + g.bis[0] * (r + (o.ld || 22)), vy + g.bis[1] * (r + (o.ld || 22)), o.label, { cls: 'u9l8-lab u9l8-anglab', color: o.lcolor || c0 }); }
    return g;
  }
  /** a pill tag beside side a–b, pushed away from the inside point */
  tag(a, b, text, color, inside, off = 26) {
    const [x1, y1] = this.P(a), [x2, y2] = this.P(b), [ix, iy] = this.P(inside), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    let nx = -(y2 - y1), ny = x2 - x1; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
    if (nx * (mx - ix) + ny * (my - iy) < 0) { nx = -nx; ny = -ny; }
    const d = this.hlabel(0, 0, text, { cls: 'u9l8-tag' }); d.style.color = color;
    const ow = d.offsetWidth / 2 || 30, oh = d.offsetHeight / 2 || 13;
    place(d, mx + nx * (off + Math.abs(nx) * ow), my + ny * (off + Math.abs(ny) * oh), 'c');
    return d;
  }
  draw(c, el, ms = 500) { return drawIn(el, ms, c); }
}
const colour = (g, color) => { if (g) g.style.color = color; };
const fade = (c, el, to = 0, ms = 250) => (el ? anim(c, el, [{ opacity: getComputedStyle(el).opacity }, { opacity: to }], ms) : Promise.resolve());

/* =============================== static booklet figures (from the TikZ) =============================== */
/* spec: k px per TikZ unit; l: polylines ([[x,y]…], 'z' closes; {p, dash, arrow}); a: TikZ arcs [x, y, a1, a2, r] ("(x,y) arc (a1:a2:r)");
 * t: labels [tex, x, y, pos ('s','w','ne'…; TikZ below/left/above right…), small]; dot: [x, y]; html labels start with '!' */
const FIG = {
  ex1: { k: 62, l: [[[0, 0], [3, 0], [0, 4], 'z'], [[0, .32], [.32, .32], [.32, 0]]], t: [['A', 0, -.05, 'sw'], ['B', 3, -.05, 'se'], ['C', -.05, 4, 'nw'], ['9', 1.5, -.08, 's'], ['12', 0, 2, 'w'], ['15', 1.5, 2.05, 'ne']] },
  ex2: { k: 110, l: [[[0, 0], [2.2, 0], [0, 1.98], 'z'], [[0, .24], [.24, .24], [.24, 0]]], a: [[1.60, 0, 180, 138, .60]], t: [['11\\text{ cm}', 1.1, -.08, 's'], ['42^\\circ', 1.22, .36, 'c', 1]] },
  ex3: { k: 84, l: [[[0, 0], [3.12, 0], [0, 2.12], 'z'], [[0, .28], [.28, .28], [.28, 0]]], a: [[2.52, 0, 180, 146, .60]], t: [['7.8\\text{ cm}', 1.56, -.08, 's'], ['5.3\\text{ cm}', 0, 1.06, 'w'], ['\\theta^\\circ', 2.22, .26, 'c', 1]] },
  ex4: { k: 62, l: [[[0, 0], [0, 4.18]], [[0, 0], [2.56, 0]], [[2.56, 0], [0, 4.18]], [[0, .30], [.30, .30], [.30, 0]]], a: [[1.81, 0, 180, 121.5, .75]], t: [['6.4\\text{ m}', 1.28, -.08, 's'], ['58.5^\\circ', 1.47, .61, 'c', 1]] },
  ex5: { k: 80, l: [[[0, 0], [5.243, 0]], [[0, 0], [1.981, 2.2]], [[1.981, 2.2], [1.981, 0]], [[1.981, 2.2], [5.243, 0]], [[1.701, 0], [1.701, .28], [1.981, .28]]], a: [[.62, 0, 0, 48, .62], [4.60, 0, 180, 146, .64]],
    t: [['A', 0, -.05, 'sw'], ['D', 1.981, -.22, 's'], ['C', 5.243, -.05, 'se'], ['B', 1.981, 2.2, 'n'], ['48^\\circ', .93, .41, 'c', 1], ['34^\\circ', 4.05, .37, 'c', 1], ['22\\text{ m}', 2.0, 1.1, 'e']] },
  ex6: { k: 72, l: [[[-2.25, 0], [2.25, 0], [0, 2.16], 'z'], { p: [[0, 2.16], [0, 0]], dash: true }, [[-1.20, 1.15], [-1.02, .97]], [[1.20, 1.15], [1.02, .97]]], dot: [[0, 0]],
    t: [['K', 0, 2.16, 'n'], ['L', -2.25, -.05, 'sw'], ['M', 2.25, -.05, 'se'], ['N', 0, 0, 'ne', 1], ['15\\text{ cm}', 0, -.08, 's']] },
  q1: { k: 70, l: [[[0, 0], [2.1, 0], [0, 2.8], 'z'], [[0, .30], [.30, .30], [.30, 0]]], t: [['D', 0, -.05, 'sw'], ['E', 2.1, -.05, 'se'], ['F', -.05, 2.8, 'nw'], ['6', 1.05, -.08, 's'], ['8', 0, 1.4, 'w'], ['10', 1.05, 1.45, 'ne']] },
  q2: { k: 70, l: [[[0, 0], [2.9, 0], [0, 2.107], 'z'], [[0, .28], [.28, .28], [.28, 0]]], a: [[2.20, 0, 180, 144, .70]], t: [['14.5\\text{ cm}', 1.45, -.08, 's'], ['36^\\circ', 1.81, .36, 'c', 1]] },
  q3: { k: 80, l: [[[0, 0], [2.673, 0], [0, 1.362], 'z'], [[0, .24], [.24, .24], [.24, 0]]], a: [[1.97, 0, 180, 153, .70]], t: [['20\\text{ m}', 1.30, .66, 'ne'], ['27^\\circ', 1.46, .29, 'c', 1]] },
  q4: { k: 64, l: [[[0, 0], [3.25, 0], [0, 2.25], 'z'], [[0, .30], [.30, .30], [.30, 0]]], a: [[2.60, 0, 180, 145, .65]], t: [['13', 1.63, -.08, 's'], ['9', 0, 1.13, 'w'], ['p^\\circ', 2.15, .32, 'c', 1]] },
  q5: { k: 64, l: [[[0, 0], [1.38, 0], [0, 2.37], 'z'], [[0, .26], [.26, .26], [.26, 0]]], a: [[.88, 0, 180, 120, .50]], t: [['4.6', .69, -.08, 's'], ['7.9', 0, 1.19, 'w'], ['q^\\circ', .58, .45, 'c', 1]] },
  q6: { k: 64, l: [[[0, 0], [0, 2.34]], [[0, 0], [1.695, 0]], { p: [[1.695, 0], [0, 2.34]], dash: true }, [[0, .26], [.26, .26], [.26, 0]]], a: [[1.145, 0, 180, 126, .55]], t: [['15.6\\text{ m}', 0, 1.17, 'w'], ['11.3\\text{ m}', .85, -.08, 's'], ['\\theta^\\circ', .89, .41, 'c', 1]] },
  q7: { k: 66, l: [[[0, 0], [0, 1.47]], [[0, 0], [4.269, 0]], [[0, 1.47], [4.269, 0]], [[0, .24], [.24, .24], [.24, 0]]], a: [[3.419, 0, 180, 161, .85]], t: [['42\\text{ m}', 0, .735, 'w'], ['19^\\circ', 2.49, .30, 'c', 1]] },
  q8: { k: 84, l: [[[0, 0], [3.9, 0]], [[.7, 2.4], [0, 0]], [[.7, 2.4], [.7, 0]], [[.7, 2.4], [3.9, 0]], [[.55, 0], [.55, .15], [.7, .15]]],
    t: [['A', .7, 2.4, 'n'], ['B', 0, -.05, 'sw'], ['D', .7, -.22, 's'], ['C', 3.9, -.05, 'se'], ['25', .25, 1.2, 'w'], ['7', .35, .08, 'n'], ['40', 2.3, 1.25, 'ne']] },
  q9: { k: 64, l: [[[-1.5, 0], [1.5, 0], [0, 3.6], 'z'], [[-.83, 1.83], [-.68, 1.63]], [[.83, 1.83], [.68, 1.63]]], t: [['Q', 0, 3.6, 'n'], ['P', -1.5, -.05, 'sw'], ['R', 1.5, -.05, 'se'], ['26\\text{ cm}', -.85, 1.9, 'w'], ['26\\text{ cm}', .85, 1.9, 'e'], ['20\\text{ cm}', 0, -.08, 's']] },
  q10: { k: 84, l: [[[0, 2.2], [0, 0], [1.8, 0], 'z'], [[1.8, 0], [4.4, 0], [4.4, 2.127], 'z'], [[0, .26], [.26, .26], [.26, 0]], [[4.14, 0], [4.14, .26], [4.4, .26]]], a: [[0, 1.6, 270, 309.3, .6], [2.4, 0, 0, 39.3, .6]],
    t: [['W', 0, 2.2, 'nw'], ['X', 0, -.05, 'sw'], ['Y', 1.8, -.15, 's'], ['Z', 4.4, -.05, 'se'], ['V', 4.4, 2.127, 'ne'], ['\\theta^\\circ', .32, 1.31, 'c', 1], ['\\theta^\\circ', 2.74, .30, 'c', 1], ['p', .92, 1.16, 'e'], ['q', 3.15, 1.25, 'w']] },
  q11: { k: 92, l: [[[0, 0], [2.302, 1.025], [3.9, 0], 'z']], a: [[.85, 0, 0, 24, .85]], t: [['X', 0, -.05, 'sw'], ['Z', 3.9, -.05, 'se'], ['Y', 2.302, 1.025, 'n'], ['42\\text{ cm}', 1.0, .5, 'nw'], ['65\\text{ cm}', 1.95, -.08, 's'], ['24^\\circ', 1.22, .26, 'c', 1]] },
  q12: { k: 92, l: [{ p: [[0, .9], [4.7, .9]], dash: true }, [[0, .9], [0, 0]], [[0, 0], [4.234, 0]], [[0, .9], [2.345, 0]], [[0, .9], [4.234, 0]], [[0, .16], [.16, .16], [.16, 0]]], a: [[.9, .9, 0, -21, .9], [1.9, .9, 0, -12, 1.9]],
    t: [['21^\\circ', 1.25 * Math.cos(15 * RAD), .9 - 1.25 * Math.sin(15 * RAD), 'c', 1], ['12^\\circ', 2.3 * Math.cos(5 * RAD), .9 - 2.3 * Math.sin(5 * RAD) + .06, 'c', 1], ['!near light', 2.345, -.03, 's', 1], ['!far light', 4.234, -.03, 's', 1], ['45.0\\text{ m}', 0, .45, 'w']] },
  q13: { k: 190, l: [[[0, 0], [2.118, 1.130], [2.72, 0], 'z'], [[1.36, .726], [2.72, 0]], { p: [[1.36, .726], [1.36, 0]], dash: true }, [[2.031, 1.084], [2.074, 1.002], [2.161, 1.048]], [[1.28, 0], [1.28, .08], [1.36, .08]]],
    t: [['P', 0, 0, 'sw'], ['R', 2.72, 0, 'se'], ['Q', 2.118, 1.130, 'ne'], ['T', 1.36, .726, 'nw'], ['S', 1.36, 0, 's'], ['30\\text{ m}', .95, .52, 'nw', 1], ['16\\text{ m}', 2.45, .58, 'ne', 1]] },
  q15a: { k: 64, l: [[[0, 0], [3.4, 0], [0, 2.656], 'z'], [[0, .30], [.30, .30], [.30, 0]]], a: [[2.70, 0, 180, 142, .70]], t: [['C', 0, -.05, 'sw'], ['A', 3.4, -.05, 'se'], ['B', -.05, 2.656, 'nw'], ['17\\text{ cm}', 1.7, -.08, 's'], ['38^\\circ', 2.12, .44, 'c', 1]] },
  q15b: { k: 64, l: [[[0, 0], [3.175, 0], [0, 2.35], 'z'], [[0, .30], [.30, .30], [.30, 0]]], t: [['E', 0, -.05, 'sw'], ['F', 3.175, -.05, 'se'], ['D', -.05, 2.35, 'nw'], ['12.7\\text{ m}', 1.59, -.08, 's'], ['9.4\\text{ m}', 0, 1.175, 'w']] },
  q17: { k: 78, l: [{ p: [[0, 0], [0, 2.4]], arrow: true }, [[0, 0], [3.090, 1.643]]], a: [[0, 1.5, 90, 28, 1.5]], t: [['\\text{N}', 0, 2.4, 'n'], ['062^\\circ', .92, 1.50, 'c', 1], ['H', 0, 0, 'w'], ['M', 3.090, 1.643, 'e'], ['14\\text{ km}', 1.60, .85, 'se']] },
  q18: { k: 64, l: [[[0, 0], [4.8, 0], [6.6, 1.6], [1.8, 1.6], 'z'], [[0, 0], [0, 3.2]], [[0, 3.2], [6.6, 1.6]], { p: [[0, 0], [6.6, 1.6]], dash: true }, [[0, .24], [.24, .24], [.24, 0]]],
    t: [['A', 0, -.05, 'sw'], ['B', 4.8, -.05, 'se'], ['C', 6.6, 1.6, 'e'], ['D', 1.85, 1.63, 'ne'], ['P', 0, 3.2, 'n'], ['12.0\\text{ m}', 2.4, -.08, 's'], ['5.0\\text{ m}', .85, .85, 'w'], ['8.0\\text{ m}', .05, 2.40, 'e']] }
};
function tikzFig(host, S) {
  const k = S.k, pad = 46, pts = [];
  const lines = (S.l || []).map((L) => (Array.isArray(L) ? { p: L.filter((q) => q !== 'z'), z: L.includes('z') } : L));
  lines.forEach((L) => pts.push(...L.p));
  (S.t || []).forEach((t) => pts.push([t[1], t[2]]));
  (S.a || []).forEach(([x, y, a1, a2, r]) => { const cx = x - r * Math.cos(a1 * RAD), cy = y - r * Math.sin(a1 * RAD); pts.push([cx + r * Math.cos(a2 * RAD), cy + r * Math.sin(a2 * RAD)]); });
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const W = Math.ceil((x1 - x0) * k + 2 * pad + 30), H = Math.ceil((y1 - y0) * k + 2 * pad);
  const G = new Geo(host, { w: W, h: H, k, ox: pad + 15 - x0 * k, oy: pad + y1 * k });
  G.el.classList.add('u9l8-tikz');
  lines.forEach((L) => {
    const g = G.poly(L.p, { closed: L.z, width: 2.6, dash: L.dash });
    if (L.arrow) { const a = G.P(L.p[L.p.length - 2]), b = G.P(L.p[L.p.length - 1]); const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy); svgEl('polygon', { points: `${b[0]},${b[1]} ${b[0] - 12 * dx / n + 6 * dy / n},${b[1] - 12 * dy / n - 6 * dx / n} ${b[0] - 12 * dx / n - 6 * dy / n},${b[1] - 12 * dy / n + 6 * dx / n}`, fill: INK }, G.Lmid); }
    void g;
  });
  (S.a || []).forEach(([x, y, a1, a2, r]) => {
    const cx = x - r * Math.cos(a1 * RAD), cy = y - r * Math.sin(a1 * RAD), [sx, sy] = G.P([x, y]), [ex, ey] = G.P([cx + r * Math.cos(a2 * RAD), cy + r * Math.sin(a2 * RAD)]);
    svgEl('path', { d: `M${sx} ${sy}A${r * k} ${r * k} 0 ${Math.abs(a2 - a1) > 180 ? 1 : 0} ${a2 > a1 ? 0 : 1} ${ex} ${ey}`, fill: 'none', stroke: INK, 'stroke-width': 2.2 }, G.Lmid);
  });
  (S.dot || []).forEach((p) => { const [px, py] = G.P(p); svgEl('circle', { cx: px, cy: py, r: 4, fill: INK }, G.Lmid); });
  (S.t || []).forEach(([s, x, y, pos, small]) => G.lab([x, y], s[0] === '!' ? s.slice(1) : T(s), { pos, gap: 3, cls: small ? 'u9l8-fsm' : 'u9l8-fn' }));
  return G;
}

/* the warm-up pyramid: cross-section, and one half slid out (same scale) */
function pyramidFig(host) {
  const k = 1.62, G = new Geo(host, { w: 900, h: 330, k, ox: 34, oy: 262 });
  G.fill([[-12, 0], [535, 0], [535, -14], [-12, -14]], '#ecd296', 0.6);
  G.seg([-12, 0], [535, 0], { color: '#8a6a1a', width: 2 });
  // sun
  const [sx, sy] = G.P([395, 150]); svgEl('circle', { cx: sx, cy: sy, r: 24, fill: '#f3c35c' }, G.Lbg);
  for (let t = 0; t < 360; t += 30) svgEl('line', { x1: sx + 30 * Math.cos(t * RAD), y1: sy + 30 * Math.sin(t * RAD), x2: sx + 40 * Math.cos(t * RAD), y2: sy + 40 * Math.sin(t * RAD), stroke: '#c8901a', 'stroke-width': 3, 'stroke-linecap': 'round' }, G.Lbg);
  const pyr = (dx, half) => {
    const pts = half ? [[dx + 115, 0], [dx + 115, 146], [dx + 230, 0]] : [[dx, 0], [dx + 115, 146], [dx + 230, 0]];
    G.fill(pts, '#d6b478');
    for (let yy = 12; yy < 146; yy += 12) { const w = 115 * (1 - yy / 146); G.seg([half ? dx + 115 : dx + 115 - w, yy], [dx + 115 + w, yy], { color: '#b48a3c', width: 1 }); }
    G.poly(pts, { closed: true, width: 3 });
    G.rm([dx + 115, 0], [dx + (half ? 230 : 0), 0], [dx + 115, 146], 13);
    G.arc([dx + 230, 0], [dx + 115, 146], [dx + 115, 0], 32, { label: half ? '?' : null });
  };
  pyr(0, false); G.seg([115, 146], [115, 0], { dash: true, width: 2.6 });
  G.lab([118, 62], '<b>146 m</b>', { pos: 'e' }); G.lab([115, 0], '<b>230 m</b>', { pos: 's', dy: 18 }); G.lab([115, 146], '<b>Great Pyramid</b>', { pos: 'n' });
  pyr(300, true);
  G.lab([418, 73], '<b>146 m</b>', { pos: 'e' }); G.lab([472, 0], '<b class="u9l8-r">? m</b>', { pos: 's', dy: 18 }); G.lab([472, 146], '<b>one half</b>', { pos: 'n' });
  const [ax, ay] = G.P([245, 75]), [bx] = G.P([300, 75]);
  svgEl('path', { d: `M${ax} ${ay}L${bx} ${ay}`, stroke: INK, 'stroke-width': 3, fill: 'none' }, G.Ltop);
  svgEl('polygon', { points: `${bx + 4},${ay} ${bx - 10},${ay - 7} ${bx - 10},${ay + 7}`, fill: INK }, G.Ltop);
  return G;
}

/* =============================== explainer: pyramid (warm-up) =============================== */
const pyramid = {
  title: 'The Great Pyramid: halve it, then TOA',
  height: 400,
  intro: 'Guess first in the poll above, then press <b>Next</b>.',
  make(stage, v, ex) {
    const k = 1.8, G = new Geo(stage, { x: 0, y: 0, w: 500, h: 400, k, ox: 40, oy: 335 });
    const L = [0, 0], C = [230, 0], F = [115, 0], Tp = [115, 146], Lt = [0, 146];
    const p = panel(stage, 512, 18, ex.W - 526, 364);
    const thA = Math.atan(146 / 115) / RAD, thWrong = Math.atan(146 / 230) / RAD, thTip = 90 - thA;
    let face, half, rm, sides = {}, tags = [], arcC, l146, l230, l115, ghostA = [], ghostC = [], arcT;
    return [
      { cap: `Cross-section: height <b>146 m</b>, base <b>230 m</b>. The tip sits right above the <b>middle</b> of the base.`,
        run: async (c) => {
          face = G.fill([L, Tp, C], '#e8d2a4'); half = G.fill([F, Tp, C], '#e8d2a4');
          sides.l = G.seg(L, Tp); sides.base = G.seg(L, F); sides.adj = G.seg(F, C); sides.hyp = G.seg(C, Tp);
          for (const s of [sides.base, sides.adj, sides.hyp, sides.l]) await G.draw(c, s, 300);
          sides.opp = G.seg(F, Tp, { dash: true, width: 3 }); await G.draw(c, sides.opp, 400);
          l146 = G.lab([115, 70], T('146\\text{ m}'), { pos: 'e', dx: 4 }); l230 = G.lab([115, 0], T('230\\text{ m}'), { pos: 's', dy: 6 });
          await Promise.all([fadeIn(c, l146), fadeIn(c, l230)]);
        } },
      { cap: `The height cuts it into two <b>right triangles</b>. Each half has base ${T('230\\div2=115')} m.`,
        run: async (c) => {
          rm = G.rm(F, C, Tp, 15); await appear(c, rm);
          face.setAttribute('fill', '#efe9dc'); colour(sides.l, GRAY); colour(sides.base, GRAY);
          await fade(c, l230); l115 = G.lab([172, 0], T('115\\text{ m}'), { pos: 's', dy: 6 }); await fadeIn(c, l115);
        } },
      { cap: `From the base angle ${T('\\theta')}: 146 is ${OPPw}, 115 is ${ADJw}. Opposite and adjacent: <b>TOA</b>.`,
        run: async (c) => {
          sides.opp.path.removeAttribute('stroke-dasharray'); colour(sides.opp, OPP); colour(sides.adj, ADJ); colour(sides.hyp, HYP);
          arcC = G.arc(C, Tp, F, 40, { label: T('\\theta') }); await G.draw(c, arcC, 400); await fadeIn(c, arcC.label);
          for (const [a, b, t, cl] of [[F, Tp, 'opp', OPP], [F, C, 'adj', ADJ], [C, Tp, 'hyp', HYP]]) { const d = G.tag(a, b, t, cl, [150, 50]); tags.push(d); await pop(c, d, 280); }
        } },
      { cap: `${T('\\tan\\theta=\\frac{146}{115}\\approx' + f(146 / 115, 3))}, so ${T(`\\theta=\\tan^{-1}\\!\\left(\\frac{146}{115}\\right)\\approx${f(thA, 1)}^\\circ`)}. Steeper than ${T('45^\\circ')}: <b>D</b>.`,
        run: async (c) => {
          await say(c, p, T('\\tan\\theta=\\dfrac{\\text{opp}}{\\text{adj}}=\\dfrac{146}{115}'));
          await say(c, p, T(`\\theta=\\tan^{-1}\\!\\left(\\dfrac{146}{115}\\right)\\approx${f(thA, 1)}^\\circ`));
          arcC.label.innerHTML = T(f(thA, 1) + '^\\circ');
          const s = stamp(stage, 'D ✓', { ok: true, x: 440, y: 60, size: 'sm' }); await stampIn(c, s);
        } },
      { cap: `<b>A</b> (${T('32^\\circ')}) used the <b>whole</b> base: ${T(`\\tan^{-1}\\!\\left(\\frac{146}{230}\\right)\\approx${f(thWrong, 1)}^\\circ`)}. That dashed line is far flatter than the real face.`,
        run: async (c) => {
          ghostA = [G.seg(C, Lt, { color: REF, dash: true, width: 3 }), G.seg(Lt, L, { color: REF, dash: true, width: 2.5 })];
          for (const g of ghostA) await G.draw(c, g, 450);
          const a = G.arc(C, Lt, L, 92, { color: REF, wedge: false, label: T(f(thWrong, 1) + '^\\circ'), ld: 26 }); ghostA.push(a, a.label); await G.draw(c, a, 300); await fadeIn(c, a.label);
          await say(c, p, `<span class="u9l8-x">A</span> ${T(`\\tan^{-1}\\!\\left(\\dfrac{146}{230}\\right)\\approx${f(thWrong, 1)}^\\circ`)}: forgot to halve`, 'sm');
        } },
      { cap: `<b>B</b> (${T('38^\\circ')}) flipped the ratio: ${T(`\\tan^{-1}\\!\\left(\\frac{115}{146}\\right)\\approx${f(thTip, 1)}^\\circ`)} is the angle at the <b>tip</b>. ${T(`${f(thA, 1)}^\\circ+${f(thTip, 1)}^\\circ=90^\\circ`)}.`,
        run: async (c) => {
          ghostA.forEach((g) => g.remove());
          arcT = G.arc(Tp, F, C, 34, { color: TEAL, label: T(f(thTip, 1) + '^\\circ'), ld: 30 }); await G.draw(c, arcT, 400); await fadeIn(c, arcT.label);
          await say(c, p, `<span class="u9l8-x">B</span> ${T(`\\tan^{-1}\\!\\left(\\dfrac{115}{146}\\right)\\approx${f(thTip, 1)}^\\circ`)}: the tip angle`, 'sm');
        } },
      { cap: `<b>C</b> (${T('45^\\circ')}) needs height = half-base. Here ${T('146>115')}, so ${T('\\tan\\theta>1')} and ${T('\\theta>45^\\circ')}. A climb, not a walk!`,
        run: async (c) => {
          ghostC = [G.seg(C, [115, 115], { color: GRAY, dash: true, width: 3 })]; await G.draw(c, ghostC[0], 450);
          const d = G.lab([140, 104], T('45^\\circ\\text{ line}'), { pos: 'nw', color: '#6b7280', cls: 'u9l8-fsm' }); await fadeIn(c, d);
          await say(c, p, `<span class="u9l8-x">C</span> ${T('45^\\circ')} only if height ${T('=')} half-base`, 'sm');
        } }
    ];
  }
};

/* =============================== explainer: whichTool ★ =============================== */
const t42 = Math.tan(42 * RAD), th3 = Math.atan(5.3 / 7.8) / RAD, ad5 = 22 / Math.tan(48 * RAD);
const WT = {
  ex2a: { label: 'Ex 2(a) check', kind: 'rt', P: { R: [0, 0], X: [11, 0], Y: [0, 11 * t42] }, ang: ['X', '42^\\circ'], sides: { RX: '11\\text{ cm}', RY: '?' }, want: 'side', know: 'soh',
    say: [`One angle (${T('42^\\circ')}) and the ${ADJw} side (11 cm) are known; the ${OPPw} side is wanted.`, 'a side <b>and</b> an angle', `From ${T('42^\\circ')}: 11 is ${ADJw}, the unknown is ${OPPw}: <b>TOA</b>.`],
    work: ['\\tan42^\\circ=\\dfrac{\\text{opp}}{11}', `\\text{opp}=11\\tan42^\\circ\\approx${f(11 * t42, 1)}\\text{ cm}`], res: `opp ≈ ${f(11 * t42, 1)} cm`, rs: { RY: f(11 * t42, 1) + '\\text{ cm}' }, col: { RY: OPP, RX: ADJ, XY: HYP } },
  ex3a: { label: 'Ex 3(a) check', kind: 'rt', P: { R: [0, 0], X: [7.8, 0], Y: [0, 5.3] }, ang: ['X', '\\theta^\\circ'], sides: { RX: '7.8\\text{ cm}', RY: '5.3\\text{ cm}' }, want: 'angle', know: 'inv',
    say: [`Two legs are known (5.3 cm and 7.8 cm); the angle ${T('\\theta^\\circ')} is wanted.`, '<b>two sides</b>', `From ${T('\\theta')}: 5.3 is ${OPPw}, 7.8 is ${ADJw}: <b>TOA backwards</b>, ${T('\\tan^{-1}')}.`],
    work: ['\\tan\\theta^\\circ=\\dfrac{5.3}{7.8}', `\\theta^\\circ=\\tan^{-1}\\!\\left(\\dfrac{5.3}{7.8}\\right)\\approx${f(th3, 1)}^\\circ`], res: `θ ≈ ${f(th3, 1)}°`, ra: f(th3, 1) + '^\\circ', col: { RY: OPP, RX: ADJ, XY: HYP } },
  ex3b: { label: 'Ex 3(b) check', kind: 'rt', P: { R: [0, 0], X: [7.8, 0], Y: [0, 5.3] }, ang: ['X', f(th3, 1) + '^\\circ'], ang2: ['Y', '?'], sides: {}, want: 'angle', know: 'comp',
    say: [`From (a), ${T('\\theta\\approx' + f(th3, 1) + '^\\circ')}. The <b>other</b> acute angle is wanted.`, 'the <b>other acute angle</b>', 'The acute angles of a right triangle add to <b>90°</b>: no calculator.'],
    work: [`90^\\circ-${f(th3, 1)}^\\circ=${f(90 - th3, 1)}^\\circ`], res: `${f(90 - th3, 1)}°`, ra2: f(90 - th3, 1) + '^\\circ', col: {} },
  ex3c: { label: 'Ex 3(c) check', kind: 'rt', P: { R: [0, 0], X: [7.8, 0], Y: [0, 5.3] }, ang: null, sides: { RX: '7.8\\text{ cm}', RY: '5.3\\text{ cm}', XY: '?' }, want: 'side', know: 'pyth',
    say: ['Two legs are known; the <b>hypotenuse</b> is wanted.', '<b>two sides</b>', 'Two sides give the third with <b>Pythagoras</b>: no angle needed.'],
    work: ['\\text{hyp}=\\sqrt{5.3^2+7.8^2}', `=\\sqrt{88.93}\\approx${f(Math.hypot(5.3, 7.8), 1)}\\text{ cm}`], res: `hyp ≈ ${f(Math.hypot(5.3, 7.8), 1)} cm`, rs: { XY: f(Math.hypot(5.3, 7.8), 1) + '\\text{ cm}' }, col: { XY: HYP } },
  ex5: { label: 'Ex 5(a) check', kind: 'ob', P: { A: [0, 0], C: [ad5 + 22 / Math.tan(34 * RAD), 0], B: [ad5, 22], D: [ad5, 0] }, want: 'side', know: 'soh',
    say: [`Triangle ${T('ABC')}: ${T('\\angle A=48^\\circ')}, ${T('\\angle C=34^\\circ')}, ${T('BD=22')} m. ${T('AD')} is wanted.`, `${T('BD')} <b>and</b> ${T('\\angle A')}`, `In ${T('\\triangle ABD')}, from ${T('48^\\circ')}: ${T('BD')} is ${OPPw}, ${T('AD')} is ${ADJw}: <b>TOA</b>.`],
    work: ['\\tan48^\\circ=\\dfrac{22}{AD}', `AD=\\dfrac{22}{\\tan48^\\circ}\\approx${f(ad5, 1)}\\text{ m}`], res: `AD ≈ ${f(ad5, 1)} m` }
};
const whichTool = {
  title: '★ Which tool? Follow the triangle',
  height: 470,
  choices: Object.keys(WT).map((k) => ({ v: k, label: WT[k].label })),
  intro: (v) => `${WT[v].label.replace(' check', '')}: the triangle travels through the chart, one question at a time. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const q = WT[v];
    // ---- the flowchart (right) ----
    const FW = ex.W - 352, sx = FW / 610, X = (x) => x * sx, fx = ex.W - FW - 6;
    const F = new Flowchart(stage, {
      x: fx, y: 6, width: FW, height: 458,
      nodes: {
        start: { x: X(225), y: 32, w: X(310), h: 50, html: '<b>Is there a right triangle?</b>', cls: 'bk-round' },
        split: { x: X(518), y: 128, w: X(170), h: 76, html: '<b>No: drop an altitude</b>two right triangles', color: OPP, cls: 'bk-dashed' },
        want: { x: X(225), y: 128, w: X(290), h: 56, html: '<b>Want a side or an angle?</b>', cls: 'bk-diamond' },
        sideQ: { x: X(130), y: 236, w: X(214), h: 62, html: '<b>Side.</b> What do you know?', cls: 'bk-diamond' },
        angQ: { x: X(440), y: 236, w: X(232), h: 62, html: '<b>Angle.</b> What do you know?', cls: 'bk-diamond' },
        soh: { x: X(72), y: 386, w: X(138), h: 118, html: `<b>SOH CAH TOA</b>name opp, adj, hyp; top: ×, bottom: ÷`, color: TEAL },
        pyth: { x: X(222), y: 386, w: X(138), h: 118, html: `<b>Pythagoras</b>${T('c^2=a^2+b^2')}`, color: TEAL },
        comp: { x: X(386), y: 386, w: X(138), h: 118, html: `<b>${T('90^\\circ')} minus</b>the other acute angle`, color: TEAL },
        inv: { x: X(538), y: 386, w: X(138), h: 118, html: `<b>Inverse ratio</b>${T('\\sin^{-1}\\ \\cos^{-1}\\ \\tan^{-1}')}`, color: TEAL }
      },
      edges: [
        { from: 'start', to: 'want', label: 'yes' }, { from: 'start', to: 'split', label: 'no', route: 'hv' }, { from: 'split', to: 'want', label: 'then' },
        { from: 'want', to: 'sideQ', label: 'side', route: 'vhv' }, { from: 'want', to: 'angQ', label: 'angle', route: 'vhv' },
        { from: 'sideQ', to: 'soh', label: 'side + angle', route: 'vhv' }, { from: 'sideQ', to: 'pyth', label: 'two sides', route: 'vhv' },
        { from: 'angQ', to: 'comp', label: 'other angle', route: 'vhv' }, { from: 'angQ', to: 'inv', label: 'two sides', route: 'vhv' }
      ]
    });
    F.el.classList.add('u9l8-flow');
    // ---- the travelling token ----
    const tok = h('div', 'u9l8-token'); const tsv = svgEl('svg', { width: 50, height: 42, viewBox: '0 0 50 42' }, tok);
    const tpoly = svgEl('polygon', { points: q.kind === 'ob' ? '3,39 47,39 19,4' : '4,39 46,39 4,6', fill: '#d9e4fb', stroke: HYP, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, tsv);
    const tmark = svgEl('path', { d: 'M4 31L12 31L12 39', fill: 'none', stroke: INK, 'stroke-width': 1.8 }, tsv); if (q.kind === 'ob') tmark.style.opacity = 0;
    const talt = svgEl('path', { d: 'M19 4L19 39', fill: 'none', stroke: OPP, 'stroke-width': 2.4, 'stroke-dasharray': '4 3' }, tsv); talt.style.opacity = 0;
    F.html.appendChild(tok); tok.style.opacity = 0;
    const LEAF = ['soh', 'pyth', 'comp', 'inv'];
    const tpos = (id) => { const n = F.node(id).n; return LEAF.includes(id) ? [n.x, n.y - n.h / 2 - 24] : id === 'split' ? [n.x, n.y + n.h / 2 + 26] : [Math.max(28, n.x - n.w / 2 - 30), n.y]; };
    let tcur = null;
    const tokTo = async (c, id) => { const [x2, y2] = tpos(id); if (!tcur) { tcur = [x2, y2]; place(tok, x2, y2, 'c'); await pop(c, tok, 300); return; } const [xa, ya] = tcur; await tween(c, 520, (t) => place(tok, xa + (x2 - xa) * t, ya + (y2 - ya) * t, 'c')); tcur = [x2, y2]; };
    const goTo = async (c, a, b) => { await Promise.all([F.go(c, a, b), tokTo(c, b)]); await F.visit(c, b); };
    // ---- the triangle (left) and the work panel ----
    const pts = Object.values(q.P), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys), k = Math.min(250 / bw, 170 / bh);
    const G = new Geo(stage, { x: 0, y: 0, w: 340, h: 250, k, ox: 170 - (Math.min(...xs) + bw / 2) * k, oy: 125 + (bh / 2) * k + 8 });
    const p = panel(stage, 10, 262, 326, 200);
    const S = {}, P = q.P;
    const tri = async (c) => {
      if (q.kind === 'rt') {
        S.RX = G.seg(P.R, P.X); S.RY = G.seg(P.R, P.Y); S.XY = G.seg(P.X, P.Y);
        for (const s of Object.values(S)) await G.draw(c, s, 260);
        S.rm = G.rm(P.R, P.X, P.Y, 14); await appear(c, S.rm, 200);
        const inside = [(P.R[0] + P.X[0] + P.Y[0]) / 3, (P.R[1] + P.X[1] + P.Y[1]) / 3];
        S.labs = {};
        for (const key in q.sides) { const [a, b] = [P[key[0]], P[key[1]]]; const d = G.tag(a, b, T(q.sides[key]), INK, inside, 10); d.classList.add('u9l8-plain'); S.labs[key] = d; await fadeIn(c, d, 200); }
        if (q.ang) { const V = P[q.ang[0]], O = Object.keys(P).filter((n) => n !== q.ang[0]).map((n) => P[n]); S.arc = G.arc(V, O[0], O[1], 34, { label: T(q.ang[1]) }); await G.draw(c, S.arc, 300); await fadeIn(c, S.arc.label); }
        if (q.ang2) { S.arc2 = G.arc(P.Y, P.R, P.X, 30, { color: TEAL, label: T(q.ang2[1]) }); await G.draw(c, S.arc2, 300); await fadeIn(c, S.arc2.label); }
      } else {
        S.AB = G.seg(P.A, P.B); S.BC = G.seg(P.B, P.C); S.AC = G.seg(P.A, P.C);
        for (const s of [S.AB, S.BC, S.AC]) await G.draw(c, s, 260);
        for (const [n, pos] of [['A', 'sw'], ['B', 'n'], ['C', 'se']]) await fadeIn(c, G.lab(P[n], T(n), { pos, cls: 'u9l8-v' }), 150);
        S.aA = G.arc(P.A, P.B, P.C, 30, { label: T('48^\\circ'), ld: 18 }); S.aC = G.arc(P.C, P.A, P.B, 34, { label: T('34^\\circ'), ld: 18 });
        await G.draw(c, S.aA, 260); await G.draw(c, S.aC, 260); await fadeIn(c, S.aA.label); await fadeIn(c, S.aC.label);
      }
    };
    const leaf = q.know, mid = q.want === 'side' ? 'sideQ' : 'angQ';
    const steps = [{ cap: q.say[0] + ' Start at the top of the chart.', run: async (c) => { await tri(c); await tokTo(c, 'start'); await F.visit(c, 'start'); } }];
    if (q.kind === 'ob') {
      steps.push({ cap: `Is there a right triangle? <b>No</b>: none of the angles of ${T('ABC')} is ${T('90^\\circ')}.`, run: (c) => goTo(c, 'start', 'split') });
      steps.push({ cap: `Drop the altitude from ${T('B')}: ${T('BD\\perp AC')}. Now ${T('\\triangle ABD')} has a right angle at ${T('D')} (the ★ split below shows both halves).`,
        run: async (c) => {
          S.BD = G.seg(P.B, P.D, { color: OPP, dash: true }); await G.draw(c, S.BD, 400); S.rm = G.rm(P.D, P.A, P.B, 12); await appear(c, S.rm, 200);
          await fadeIn(c, G.lab([P.D[0], 0], T('D'), { pos: 's', cls: 'u9l8-v' }), 150); await fadeIn(c, G.lab([P.D[0], 11], T('22'), { pos: 'e', color: OPP }), 150);
          await anim(c, talt, [{ opacity: 0 }, { opacity: 1 }], 300); await goTo(c, 'split', 'want');
        } });
    } else {
      steps.push({ cap: 'Is there a right triangle? <b>Yes</b>: the right angle is marked.', run: async (c) => { await pulse(c, S.rm.parentNode ? tok : tok, 1.15); await goTo(c, 'start', 'want'); } });
    }
    steps.push({ cap: `Want a side or an angle? ${q.want === 'side' ? 'A <b>side</b>' : 'An <b>angle</b>'}.`, run: (c) => goTo(c, 'want', mid) });
    steps.push({ cap: `What do we know? ${q.say[1]}. ${q.say[2]}`,
      run: async (c) => {
        await goTo(c, mid, leaf);
        if (q.col) for (const key in q.col) colour(S[key], q.col[key]);
        if (q.kind === 'ob') { colour(S.AB, HYP); colour(S.AC, ADJ); }
      } });
    steps.push({ cap: `${q.work.map((w) => T(w.replace(/\\dfrac/g, '\\frac'))).join(', ')}.`,
      run: async (c) => {
        for (const w of q.work) await say(c, p, T(w));
        if (q.rs) for (const key in q.rs) { S.labs[key].innerHTML = T(q.rs[key]); S.labs[key].style.color = q.col[key]; await pop(c, S.labs[key]); }
        if (q.ra) { S.arc.label.innerHTML = T(q.ra); await pop(c, S.arc.label); }
        if (q.ra2) { S.arc2.label.innerHTML = T(q.ra2); await pop(c, S.arc2.label); }
        const s = stamp(stage, q.res, { ok: true, x: 172, y: 432, size: 'sm', rotate: -4 }); await stampIn(c, s);
      } });
    return steps;
  }
};

/* =============================== explainer: names (Section 1) =============================== */
const NM = {
  ex1: { label: 'Example 1 check', R: 'A', V1: 'B', V2: 'C', base: 9, rise: 12, hyp: 15 },
  pqr: { label: 'Another triangle', R: 'R', V1: 'P', V2: 'Q', base: 15, rise: 8, hyp: 17 }
};
const names = {
  title: 'Stand at the angle, then name the sides',
  height: 410,
  choices: Object.keys(NM).map((k) => ({ v: k, label: NM[k].label })),
  intro: (v) => `${v === 'ex1' ? 'Example 1: ' : ''}${T(NM[v].V1 + NM[v].V2 + NM[v].R)}, right angle at ${T(NM[v].R)}. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const q = NM[v], { R, V1, V2, base, rise, hyp } = q;
    const k = Math.min(300 / base, 300 / rise), G = new Geo(stage, { x: 0, y: 0, w: 420, h: 410, k, ox: 210 - base * k / 2 - 10, oy: 205 + rise * k / 2 });
    const pR = [0, 0], p1 = [base, 0], p2 = [0, rise], ins = [base / 3, rise / 3];
    const s1 = R + V1, s2 = R + V2, sh = V1 + V2; // base leg, vertical leg, hypotenuse names
    const p = panel(stage, 432, 16, ex.W - 446, 378);
    const A1 = Math.atan(rise / base) / RAD, A2 = 90 - A1;
    let sb, sv, shy, arc1, arc2, tags = [];
    const swapTags = async (c, list) => { tags.forEach((t) => t.remove()); tags = []; for (const [a, b, t, cl] of list) { const d = G.tag(a, b, t, cl, ins, 34); tags.push(d); await pop(c, d, 260); } };
    return [
      { cap: `Right angle at ${T(R)}. The side across from it, ${T(sh + '=' + hyp)}, is the ${HYPw}: the longest side, from <b>either</b> acute angle.`,
        run: async (c) => {
          sb = G.seg(pR, p1); sv = G.seg(pR, p2); shy = G.seg(p1, p2);
          for (const s of [sb, sv, shy]) await G.draw(c, s, 300);
          await appear(c, G.rm(pR, p1, p2, 16), 200);
          for (const [n, pt, pos] of [[R, pR, 'sw'], [V1, p1, 'se'], [V2, p2, 'nw']]) await fadeIn(c, G.lab(pt, T(n), { pos, cls: 'u9l8-v' }), 150);
          for (const [a, b, t, pos] of [[pR, p1, base, 's'], [pR, p2, rise, 'w'], [p1, p2, hyp, 'ne']]) G.lab([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], T(String(t)), { pos, cls: 'u9l8-fn' });
          colour(shy, HYP); await swapTags(c, [[p1, p2, 'hyp', HYP]]);
        } },
      { cap: `Stand at ${T(V1)}. ${OPPw}: the leg that doesn’t touch ${T(V1)}, ${T(`${s2}=${rise}`)}. ${ADJw}: the leg that touches ${T(V1)}, ${T(`${s1}=${base}`)}.`,
        run: async (c) => {
          arc1 = G.arc(p1, p2, pR, 40, { label: T(V1) }); await G.draw(c, arc1, 400); await fadeIn(c, arc1.label);
          colour(sv, OPP); colour(sb, ADJ); await swapTags(c, [[p1, p2, 'hyp', HYP], [pR, p2, 'opp', OPP], [pR, p1, 'adj', ADJ]]);
        } },
      { cap: `${T(`\\sin ${V1}=\\frac{${rise}}{${hyp}}${fr(rise, hyp) === `\\frac{${rise}}{${hyp}}` ? '' : '=' + fr(rise, hyp)}`)}, ${T(`\\cos ${V1}=${frEq(base, hyp).replace(/\\frac/g, '\\frac')}`)}, ${T(`\\tan ${V1}=${frEq(rise, base)}`)}.`,
        run: async (c) => {
          await say(c, p, `<span class="u9l8-sk">SOH</span>${T(`\\sin ${V1}=\\dfrac{\\text{opp}}{\\text{hyp}}=${frEq(rise, hyp).replace(/\\frac/g, '\\dfrac')}`)}`);
          await say(c, p, `<span class="u9l8-sk">CAH</span>${T(`\\cos ${V1}=\\dfrac{\\text{adj}}{\\text{hyp}}=${frEq(base, hyp).replace(/\\frac/g, '\\dfrac')}`)}`);
          await say(c, p, `<span class="u9l8-sk">TOA</span>${T(`\\tan ${V1}=\\dfrac{\\text{opp}}{\\text{adj}}=${frEq(rise, base).replace(/\\frac/g, '\\dfrac')}`)}`);
        } },
      { cap: `Now stand at ${T(V2)}. The hypotenuse stays put, but the legs <b>swap names</b>: opposite ${T(V2)} is ${T(`${s1}=${base}`)}, adjacent is ${T(`${s2}=${rise}`)}.`,
        run: async (c) => {
          await fade(c, arc1, 0.15); arc1.label.style.opacity = 0.3;
          arc2 = G.arc(p2, pR, p1, 40, { label: T(V2) }); await G.draw(c, arc2, 400); await fadeIn(c, arc2.label);
          colour(sb, OPP); colour(sv, ADJ); await swapTags(c, [[p1, p2, 'hyp', HYP], [pR, p1, 'opp', OPP], [pR, p2, 'adj', ADJ]]);
        } },
      { cap: `${T(`\\sin ${V2}=${fr(base, hyp)}=\\cos ${V1}`)} and ${T(`\\cos ${V2}=${fr(rise, hyp)}=\\sin ${V1}`)}: the <b>cofunction relationship</b>. Same sides, new names.`,
        run: async (c) => {
          await say(c, p, T(`\\sin ${V2}=\\dfrac{${base}}{${hyp}}=${fr(base, hyp).replace(/\\frac/g, '\\dfrac')}=\\cos ${V1}`), 'cof');
          await say(c, p, T(`\\cos ${V2}=\\dfrac{${rise}}{${hyp}}=${fr(rise, hyp).replace(/\\frac/g, '\\dfrac')}=\\sin ${V1}`), 'cof');
        } },
      { cap: `${T(`${V1}=\\sin^{-1}\\!\\left(${fr(rise, hyp)}\\right)\\approx${f(A1, 2)}^\\circ`)}${v === 'ex1' ? ` ${T('\\approx' + Math.round(A1) + '^\\circ')}` : ''}, so ${T(`${V2}=90^\\circ-${f(A1, 2)}^\\circ=${f(A2, 2)}^\\circ`)}. The acute angles add to ${T('90^\\circ')}.`,
        run: async (c) => {
          arc1.label.innerHTML = T(f(A1, 2) + '^\\circ'); arc2.label.innerHTML = T(f(A2, 2) + '^\\circ'); arc1.label.style.opacity = 1; arc1.style.opacity = 1;
          await pop(c, arc1.label); await pop(c, arc2.label);
          const s = stamp(stage, T(`${f(A1, 2)}^\\circ+${f(A2, 2)}^\\circ=90^\\circ`), { ok: true, x: 640, y: 352, size: 'sm' }); await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== explainer: cofunction dial =============================== */
const cofunction = {
  title: 'An angle dial: sin x° = cos(90 − x)°',
  height: 400,
  choices: [20, 35, 60, 75].map((v) => ({ v, label: v + '°' })),
  intro: (v) => `The hypotenuse is <b>1</b> unit long, so each leg <b>is</b> a ratio. Angle ${T(v + '^\\circ')}. Press <b>Next</b>.`,
  make(stage, x, ex) {
    const k = 300, G = new Geo(stage, { x: 0, y: 0, w: 420, h: 400, k, ox: 50, oy: 360 });
    const sx = Math.sin(x * RAD), cx = Math.cos(x * RAD), y = 90 - x;
    const st = { a: x };
    const sv = G.seg([0, 0], [0, 0]), sb = G.seg([0, 0], [0, 0]), sh = G.seg([0, 0], [0, 0]);
    colour(sv, OPP); colour(sb, ADJ); colour(sh, HYP);
    const rmk = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 2.2 }, G.Ltop);
    const arcEl = svgEl('path', { fill: 'none', stroke: REF, 'stroke-width': 3.2 }, G.Ltop), wedge = svgEl('path', { fill: REF, 'fill-opacity': 0.16 }, G.Lbg);
    const arc2 = svgEl('path', { fill: 'none', stroke: TEAL, 'stroke-width': 3.2 }, G.Ltop); arc2.style.opacity = 0;
    const lab1 = G.lab([0, 0], '', { cls: 'u9l8-anglab' }); lab1.style.color = REF;
    const lab2 = G.lab([0, 0], '', { cls: 'u9l8-anglab' }); lab2.style.color = TEAL; lab2.style.opacity = 0;
    const hyl = G.lab([0, 0], T('1'), { color: HYP, cls: 'u9l8-fn' });
    // bars
    const BX = 450, BW = ex.W - BX - 30, bar = (yy, color) => { const wrap = add(stage, box(h('div', 'u9l8-bar'), BW, 34), BX, yy); const fill = h('div', 'u9l8-barf'); fill.style.background = color; wrap.appendChild(fill); return { wrap, fill }; };
    const barV = bar(110, OPP), barH = bar(250, ADJ);
    const bl1 = add(stage, h('div', 'u9l8-barl'), BX, 66), bl2 = add(stage, h('div', 'u9l8-barl'), BX, 206);
    const bv1 = add(stage, h('div', 'u9l8-barv'), BX, 150), bv2 = add(stage, h('div', 'u9l8-barv'), BX, 290);
    let swapped = false;
    const name1 = () => (swapped ? `${T(`\\cos ${90 - Math.round(st.a)}^\\circ`)} <span class="u9l8-muted">= adj/hyp from the top angle</span>` : `${T(`\\sin ${Math.round(st.a)}^\\circ`)} <span class="u9l8-muted">= opp/hyp</span>`);
    const name2 = () => (swapped ? `${T(`\\sin ${90 - Math.round(st.a)}^\\circ`)} <span class="u9l8-muted">= opp/hyp from the top angle</span>` : `${T(`\\cos ${Math.round(st.a)}^\\circ`)} <span class="u9l8-muted">= adj/hyp</span>`);
    const draw = () => {
      const a = st.a * RAD, R = [Math.cos(a), 0], W = [Math.cos(a), Math.sin(a)], P0 = G.P([0, 0]), PR = G.P(R), PW = G.P(W);
      sv.path.setAttribute('d', `M${PR[0]} ${PR[1]}L${PW[0]} ${PW[1]}`); sb.path.setAttribute('d', `M${P0[0]} ${P0[1]}L${PR[0]} ${PR[1]}`); sh.path.setAttribute('d', `M${P0[0]} ${P0[1]}L${PW[0]} ${PW[1]}`);
      const s = 14; rmk.setAttribute('d', st.a > 3 && st.a < 87 ? `M${PR[0] - s} ${PR[1]}L${PR[0] - s} ${PR[1] - s}L${PR[0]} ${PR[1] - s}` : '');
      const r = 56, e = [P0[0] + r * Math.cos(a), P0[1] - r * Math.sin(a)];
      arcEl.setAttribute('d', `M${P0[0] + r} ${P0[1]}A${r} ${r} 0 0 0 ${e[0]} ${e[1]}`); wedge.setAttribute('d', `M${P0[0]} ${P0[1]}L${P0[0] + r} ${P0[1]}A${r} ${r} 0 0 0 ${e[0]} ${e[1]}Z`);
      lab1.innerHTML = T(Math.round(st.a) + '^\\circ'); place(lab1, P0[0] + (r + 26) * Math.cos(a / 2), P0[1] - (r + 26) * Math.sin(a / 2), 'c');
      const r2 = 44, b1 = [PW[0], PW[1] + r2], b2 = [PW[0] - r2 * Math.cos(a), PW[1] + r2 * Math.sin(a)];
      arc2.setAttribute('d', `M${b1[0]} ${b1[1]}A${r2} ${r2} 0 0 1 ${b2[0]} ${b2[1]}`);
      const bisA = Math.PI / 2 + (Math.PI / 2 - a) / 2; lab2.innerHTML = T((90 - Math.round(st.a)) + '^\\circ'); place(lab2, PW[0] - (r2 + 24) * Math.cos(bisA), PW[1] + (r2 + 24) * Math.sin(bisA), 'c');
      place(hyl, (P0[0] + PW[0]) / 2 - 14 * Math.sin(a), (P0[1] + PW[1]) / 2 - 14 * Math.cos(a), 'c');
      barV.fill.style.width = (Math.sin(a) * BW) + 'px'; barH.fill.style.width = (Math.cos(a) * BW) + 'px';
      bl1.innerHTML = `<b>vertical leg</b>: ${name1()}`; bl2.innerHTML = `<b>horizontal leg</b>: ${name2()}`;
      bv1.innerHTML = T(f(Math.sin(a), 4)); bv2.innerHTML = T(f(Math.cos(a), 4));
    };
    draw();
    [sv, sb, sh, rmk, arcEl, wedge, lab1, hyl, barV.wrap, barH.wrap, bl1, bl2, bv1, bv2].forEach(hide);
    return [
      { cap: `At ${T(x + '^\\circ')}: the ${OPPw} leg is ${T(`\\sin${x}^\\circ\\approx${f(sx, 4)}`)} and the ${ADJw} leg is ${T(`\\cos${x}^\\circ\\approx${f(cx, 4)}`)} (hypotenuse 1).`,
        run: async (c) => { for (const e of [sb, sv, sh]) { e.style.opacity = 1; await G.draw(c, e, 300); } for (const e of [rmk, wedge, arcEl, lab1, hyl]) await appear(c, e, 150); for (const e of [bl1, barV.wrap, bv1, bl2, barH.wrap, bv2]) await appear(c, e, 160); } },
      { cap: 'Open the angle from 0° to 90°: <b>sine rises</b> from 0 to 1 while <b>cosine falls</b> from 1 to 0.',
        run: async (c) => { await tween(c, 1300, (t) => { st.a = x + (2 - x) * t; draw(); }); await tween(c, 2000, (t) => { st.a = 2 + 86 * t; draw(); }); await tween(c, 1300, (t) => { st.a = 88 + (x - 88) * t; draw(); }); st.a = x; draw(); } },
      { cap: `Stand at the <b>other</b> acute angle, ${T(`90^\\circ-${x}^\\circ=${y}^\\circ`)}. From up there the horizontal leg is ${OPPw} and the vertical leg is ${ADJw}.`,
        run: async (c) => { swapped = true; await appear(c, arc2, 300); await appear(c, lab2, 300); colour(sv, ADJ); colour(sb, OPP); barV.fill.style.background = ADJ; barH.fill.style.background = OPP; draw(); await pulse(c, bl1, 1.04); await pulse(c, bl2, 1.04); } },
      { cap: `Same legs, new names: ${T(`\\sin${y}^\\circ=\\cos${x}^\\circ\\approx${f(cx, 4)}`)} and ${T(`\\cos${y}^\\circ=\\sin${x}^\\circ\\approx${f(sx, 4)}`)}. That is the <b>cofunction relationship</b>.`,
        run: async (c) => { await pulse(c, bv2, 1.2); await pulse(c, bv1, 1.2); const s = stamp(stage, T(`\\sin${y}^\\circ=\\cos${x}^\\circ`), { ok: true, x: BX + BW / 2, y: 362, size: 'sm' }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: solveSide (Section 2) — the balance =============================== */
function balance(stage, cx, y) {
  const W = 470, beam = add(stage, box(h('div', 'u9l8-beam'), W, 10), cx - W / 2, y);
  const ful = add(stage, h('div', 'u9l8-fulcrum'), cx - 26, y + 10);
  const pan = (dx) => { const d = add(stage, box(h('div', 'u9l8-pan'), 210, 78), cx + dx - 105, y - 82); return d; };
  const L = pan(-130), R = pan(130), eq = add(stage, h('div', 'u9l8-eqsign', T('=')), cx - 14, y - 60);
  const all = [beam, ful, L, R, eq];
  return {
    L, R, all,
    set(l, r) { L.innerHTML = T(l); R.innerHTML = T(r); },
    async show(c) { for (const e of all) await appear(c, e, 200); },
    async op(c, text) {
      const a = add(stage, h('div', 'u9l8-op', text), cx - 130 - 34, y - 160), b = add(stage, h('div', 'u9l8-op', text), cx + 130 - 34, y - 160);
      await Promise.all([pop(c, a), pop(c, b)]);
      await Promise.all([anim(c, a, [{ transform: 'translateY(0)' }, { transform: 'translateY(52px)' }], 420), anim(c, b, [{ transform: 'translateY(0)' }, { transform: 'translateY(52px)' }], 420)]);
      await Promise.all([anim(c, [beam, L, R].length ? beam : beam, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(1.5deg)' }, { transform: 'rotate(-1.5deg)' }, { transform: 'rotate(0deg)' }], 420)]);
      a.remove(); b.remove();
    }
  };
}
const SS = {
  a: { label: 'Example 2(a) check', unk: 'opp' },
  b: { label: 'Example 2(b) check', unk: 'hyp' }
};
const solveSide = {
  title: 'Unknown on top: multiply. Unknown on the bottom: divide.',
  height: 420,
  choices: Object.keys(SS).map((k) => ({ v: k, label: SS[k].label })),
  intro: (v) => `Example 2${v === 'a' ? '(a)' : '(b)'}: the ${v === 'a' ? 'opposite side' : 'hypotenuse'} from ${T('42^\\circ')} and 11 cm adjacent. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const opp = 11 * t42, hyp = 11 / Math.cos(42 * RAD), k = 25;
    const G = new Geo(stage, { x: 0, y: 0, w: 380, h: 420, k, ox: 50, oy: 330 });
    const R = [0, 0], X = [11, 0], Y = [0, opp];
    const sRX = G.seg(R, X), sRY = G.seg(R, Y), sXY = G.seg(X, Y);
    G.rm(R, X, Y, 14);
    const arc = G.arc(X, Y, R, 44, { label: T('42^\\circ') });
    const l11 = G.lab([5.5, 0], T('11\\text{ cm}'), { pos: 's', dy: 4 });
    const lq = G.lab(v === 'a' ? [0, opp / 2] : [5.5, opp / 2], T('?'), { pos: v === 'a' ? 'w' : 'ne', dx: v === 'a' ? -4 : 6, cls: 'u9l8-q' });
    const BAL = balance(stage, 380 + (ex.W - 380) / 2, 200);
    BAL.all.forEach(hide);
    const res = add(stage, box(h('div', 'u9l8-res'), ex.W - 400, 90), 390, 300); hide(res);
    const tg = [];
    const nameStep = { cap: v === 'a' ? `From ${T('42^\\circ')}: 11 cm is ${ADJw}, the unknown is ${OPPw}. The hypotenuse isn’t involved.` : `From ${T('42^\\circ')}: 11 cm is ${ADJw}, the unknown is the ${HYPw}. The opposite side isn’t involved.`,
      run: async (c) => {
        colour(sRX, ADJ); if (v === 'a') { colour(sRY, OPP); colour(sXY, '#c9ccd3'); } else { colour(sXY, HYP); colour(sRY, '#c9ccd3'); }
        for (const [a, b, t, cl] of [[R, X, 'adj', ADJ], v === 'a' ? [R, Y, 'opp', OPP] : [X, Y, 'hyp', HYP]]) { const d = G.tag(a, b, t, cl, [3, 3], 44); tg.push(d); await pop(c, d, 260); }
      } };
    if (v === 'a') return [
      nameStep,
      { cap: `Opposite and adjacent: <b>TOA</b>. ${T('\\tan42^\\circ=\\dfrac{\\text{opp}}{11}')}. Think of the equation as a <b>balance</b>.`,
        run: async (c) => { BAL.set('\\tan42^\\circ', '\\dfrac{\\text{opp}}{11}'); await BAL.show(c); } },
      { cap: 'The unknown is <b>on top</b>, divided by 11. Undo it: <b>multiply</b> both sides by 11. Same to both pans, so the balance stays level.',
        run: async (c) => { await BAL.op(c, T('\\times11')); BAL.set('11\\tan42^\\circ', '\\text{opp}'); await Promise.all([pop(c, BAL.L), pop(c, BAL.R)]); } },
      { cap: `${T(`\\text{opp}=11\\tan42^\\circ=11(${f(t42, 4)}\\ldots)\\approx${f(opp, 3)}`)}, so the opposite side is about <b>${f(opp, 1)} cm</b>.`,
        run: async (c) => { res.innerHTML = T(`\\text{opp}=11\\tan42^\\circ\\approx${f(opp, 4)}\\approx\\boldsymbol{${f(opp, 1)}\\textbf{ cm}}`); await fadeIn(c, res); lq.innerHTML = T(f(opp, 1)); lq.style.color = OPP; await pop(c, lq); } },
      { cap: `Sense check: ${T('42^\\circ<45^\\circ')}, so the opposite side should be a little <b>shorter</b> than the adjacent side: ${T(`${f(opp, 1)}<11`)} ✓`,
        run: async (c) => { const s = stamp(stage, T(`${f(opp, 1)}<11`) + ' ✓', { ok: true, x: 260, y: 70, size: 'sm' }); await stampIn(c, s); } }
    ];
    return [
      nameStep,
      { cap: `Adjacent and hypotenuse: <b>CAH</b>. ${T('\\cos42^\\circ=\\dfrac{11}{\\text{hyp}}')}.`,
        run: async (c) => { BAL.set('\\cos42^\\circ', '\\dfrac{11}{\\text{hyp}}'); await BAL.show(c); } },
      { cap: 'This time the unknown is <b>on the bottom</b>. First multiply both sides by hyp to bring it up.',
        run: async (c) => { await BAL.op(c, T('\\times\\text{hyp}')); BAL.set('\\text{hyp}\\cdot\\cos42^\\circ', '11'); await Promise.all([pop(c, BAL.L), pop(c, BAL.R)]); } },
      { cap: `Now <b>divide</b> both sides by ${T('\\cos42^\\circ')}: ${T('\\text{hyp}=\\dfrac{11}{\\cos42^\\circ}')}. (Shortcut: the unknown and ${T('\\cos42^\\circ')} trade places.)`,
        run: async (c) => { await BAL.op(c, T('\\div\\cos42^\\circ')); BAL.set('\\text{hyp}', '\\dfrac{11}{\\cos42^\\circ}'); await Promise.all([pop(c, BAL.L), pop(c, BAL.R)]); } },
      { cap: `${T(`\\text{hyp}=\\dfrac{11}{${f(Math.cos(42 * RAD), 4)}\\ldots}\\approx${f(hyp, 3)}`)}, about <b>${f(hyp, 1)} cm</b>. The hypotenuse is the longest side: ${T(`${f(hyp, 1)}>11`)} ✓`,
        run: async (c) => { res.innerHTML = T(`\\text{hyp}=\\dfrac{11}{\\cos42^\\circ}\\approx${f(hyp, 4)}\\approx\\boldsymbol{${f(hyp, 1)}\\textbf{ cm}}`); await fadeIn(c, res); lq.innerHTML = T(f(hyp, 1)); lq.style.color = HYP; await pop(c, lq); const s = stamp(stage, T(`${f(hyp, 1)}>11`) + ' ✓', { ok: true, x: 260, y: 70, size: 'sm' }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: solveAngle (Section 3) — the ratio machine =============================== */
function machine(stage, x0, y, fn, W) {
  const bw = 150, gw = 120, gap = (W - 2 * bw - gw) / 2;
  const A = add(stage, box(h('div', 'u9l8-mbox'), bw, 64), x0, y), Gx = add(stage, box(h('div', 'u9l8-gear', T(fn)), gw, 64), x0 + bw + gap, y), R = add(stage, box(h('div', 'u9l8-mbox'), bw, 64), x0 + bw + 2 * gap + gw, y);
  const ar1 = add(stage, box(h('div', 'u9l8-marrow'), gap - 12, 4), x0 + bw + 6, y + 30), ar2 = add(stage, box(h('div', 'u9l8-marrow'), gap - 12, 4), x0 + bw + gap + gw + 6, y + 30);
  return { A, G: Gx, R, ar: [ar1, ar2], all: [A, Gx, R, ar1, ar2] };
}
const SA = {
  ex3: { label: 'Example 3 check' },
  ex1: { label: 'Example 1(c) check' }
};
const solveAngle = {
  title: 'Inverse ratio: run the calculator backwards',
  height: 430,
  choices: Object.keys(SA).map((k) => ({ v: k, label: SA[k].label })),
  intro: (v) => (v === 'ex3' ? `Example 3: legs 5.3 cm and 7.8 cm, angle ${T('\\theta^\\circ')} wanted.` : `Example 1(c): ${T('\\sin B=\\frac45')}, angle ${T('B')} wanted.`) + ' Press <b>Next</b>.',
  make(stage, v, ex) {
    const e3 = v === 'ex3';
    const base = e3 ? 7.8 : 9, rise = e3 ? 5.3 : 12, k = e3 ? 40 : 24;
    const G = new Geo(stage, { x: 0, y: 0, w: 390, h: 430, k, ox: 40, oy: e3 ? 300 : 360 });
    const R = [0, 0], X = [base, 0], Y = [0, rise];
    const sRX = G.seg(R, X), sRY = G.seg(R, Y), sXY = G.seg(X, Y); G.rm(R, X, Y, 14);
    if (!e3) [['A', R, 'sw'], ['B', X, 'se'], ['C', Y, 'nw']].forEach(([n, pt, pos]) => G.lab(pt, T(n), { pos, cls: 'u9l8-v' }));
    G.lab([base / 2, 0], T(e3 ? '7.8\\text{ cm}' : '9'), { pos: 's', dy: 4, cls: 'u9l8-fn' });
    G.lab([0, rise / 2], T(e3 ? '5.3\\text{ cm}' : '12'), { pos: 'w', dx: -4, cls: 'u9l8-fn' });
    if (!e3) G.lab([base / 2, rise / 2], T('15'), { pos: 'ne', dx: 6, cls: 'u9l8-fn' });
    const arc = G.arc(X, Y, R, 44, { label: T(e3 ? '\\theta' : 'B') });
    const th = Math.atan(rise / base) / RAD, fn = e3 ? '\\tan' : '\\sin', ratio = e3 ? 5.3 / 7.8 : 0.8;
    const MW = ex.W - 420, M1 = machine(stage, 400, 50, fn, MW), M2 = machine(stage, 400, 200, fn + '^{-1}', MW);
    const t1 = add(stage, h('div', 'u9l8-mt', '<b>Forwards</b>: angle → ratio'), 400, 18), t2 = add(stage, h('div', 'u9l8-mt', '<b>Backwards</b>: ratio → angle'), 400, 168);
    M2.ar.forEach((a) => a.classList.add('back'));
    [...M1.all, ...M2.all, t1, t2].forEach(hide);
    const p = panel(stage, 400, 290, MW, 124);
    const demo = e3 ? 30 : 30, demoV = e3 ? Math.tan(demo * RAD) : Math.sin(demo * RAD);
    const hy = Math.hypot(5.3, 7.8);
    const travel = async (c, M, from, to) => { const chip = add(stage, h('div', 'u9l8-chipv', from), parseFloat(M.A.style.left) + 30, parseFloat(M.A.style.top) + 14); await pop(c, chip); const x1 = parseFloat(M.R.style.left) + 30, x0 = parseFloat(chip.style.left); await tween(c, 900, (t) => { chip.style.left = (x0 + (x1 - x0) * t) + 'px'; }); chip.remove(); };
    const steps = [
      { cap: e3 ? `From ${T('\\theta')}: 5.3 cm is ${OPPw}, 7.8 cm is ${ADJw}: <b>TOA</b>. Two sides known, the <b>angle</b> is wanted.` : `From ${T('B')}: ${T('AC=12')} is ${OPPw}, ${T('BC=15')} is the ${HYPw}: <b>SOH</b>, ${T('\\sin B=\\frac{12}{15}=0.8')}.`,
        run: async (c) => { colour(sRY, OPP); if (e3) { colour(sRX, ADJ); colour(sXY, HYP); } else { colour(sXY, HYP); colour(sRX, ADJ); } await G.draw(c, arc, 300); } },
      { cap: `Forwards, ${T(fn)} turns an <b>angle</b> into a <b>ratio</b>: ${T(`${fn}${demo}^\\circ${e3 ? '\\approx' + f(demoV, 4) : '=' + f(demoV, 1)}`)}.`,
        run: async (c) => {
          for (const e of [t1, ...M1.all]) await appear(c, e, 150);
          M1.A.innerHTML = T(demo + '^\\circ'); await pop(c, M1.A); await travel(c, M1, T(demo + '^\\circ'), ''); M1.R.innerHTML = T(e3 ? f(demoV, 4) : f(demoV, 1)); await pop(c, M1.R);
        } },
      { cap: `We have the <b>ratio</b>, ${e3 ? T(`\\frac{5.3}{7.8}\\approx${f(ratio, 4)}`) : T('0.8')}. Run it <b>backwards</b> through ${T(fn + '^{-1}')}: ${T(`${e3 ? '\\theta' : 'B'}=${fn}^{-1}(${e3 ? f(ratio, 4) + '\\ldots' : '0.8'})\\approx${f(th, e3 ? 1 : 2)}^\\circ`)}${e3 ? '' : ` ${T('\\approx' + Math.round(th) + '^\\circ')}`}.`,
        run: async (c) => {
          for (const e of [t2, ...M2.all]) await appear(c, e, 150);
          M2.R.innerHTML = T(e3 ? f(ratio, 4) + '\\ldots' : '0.8'); await pop(c, M2.R);
          const chip = add(stage, h('div', 'u9l8-chipv', M2.R.innerHTML), parseFloat(M2.R.style.left) + 20, parseFloat(M2.R.style.top) + 14); await pop(c, chip);
          const x0 = parseFloat(chip.style.left), x1 = parseFloat(M2.A.style.left) + 20; await tween(c, 900, (t) => { chip.style.left = (x0 + (x1 - x0) * t) + 'px'; }); chip.remove();
          M2.A.innerHTML = T(f(th, e3 ? 1 : 2) + '^\\circ'); await pop(c, M2.A);
          arc.label.innerHTML = T(f(th, e3 ? 1 : 2) + '^\\circ'); await pop(c, arc.label);
          await say(c, p, T(`${e3 ? '\\theta' : 'B'}=${fn}^{-1}\\!\\left(${e3 ? '\\dfrac{5.3}{7.8}' : '0.8'}\\right)\\approx${f(th, e3 ? 1 : 2)}^\\circ`));
        } }
    ];
    if (e3) steps.push(
      { cap: `(b) The acute angles add to ${T('90^\\circ')}: the other angle is ${T(`90^\\circ-${f(th, 1)}^\\circ=${f(90 - th, 1)}^\\circ`)}.`,
        run: async (c) => { const a2 = G.arc(Y, R, X, 34, { color: TEAL, label: T(f(90 - th, 1) + '^\\circ'), ld: 26 }); await G.draw(c, a2, 300); await fadeIn(c, a2.label); await say(c, p, T(`90^\\circ-${f(th, 1)}^\\circ=${f(90 - th, 1)}^\\circ`)); } },
      { cap: `(c) Pythagoras: ${T(`\\sqrt{5.3^2+7.8^2}=\\sqrt{88.93}\\approx${f(hy, 2)}`)}, so about <b>${f(hy, 1)} cm</b>. Trig agrees: ${T(`\\frac{5.3}{\\sin${f(th, 3)}^\\circ}\\approx${f(5.3 / Math.sin(th * RAD), 2)}`)} ✓`,
        run: async (c) => { const d = G.lab([base / 2, rise / 2], T(f(hy, 1) + '\\text{ cm}'), { pos: 'ne', dx: 8, color: HYP, cls: 'u9l8-fn' }); await pop(c, d); await say(c, p, T(`\\text{hyp}=\\sqrt{88.93}\\approx${f(hy, 1)}\\text{ cm}`)); const s = stamp(stage, 'both ways ✓', { ok: true, x: 250, y: 60, size: 'sm' }); await stampIn(c, s); } });
    else steps.push(
      { cap: `Check with cosine: ${T('\\cos B=\\frac{9}{15}=0.6')} and ${T(`\\cos^{-1}(0.6)\\approx${f(th, 2)}^\\circ`)}. Same angle ✓`,
        run: async (c) => { await say(c, p, T(`\\cos^{-1}(0.6)\\approx${f(th, 2)}^\\circ`) + ' ✓'); const s = stamp(stage, T(`B\\approx${Math.round(th)}^\\circ`), { ok: true, x: 250, y: 60, size: 'sm' }); await stampIn(c, s); } });
    return steps;
  }
};

/* =============================== explainer: elevation (Section 4) =============================== */
function boat(G, x) { const [px, py] = G.P([x, 0]); const g = svgEl('g', {}, G.Ltop); svgEl('path', { d: `M${px - 22} ${py - 12}L${px + 22} ${py - 12}L${px + 14} ${py}L${px - 14} ${py}Z`, fill: '#8a5a2b' }, g); svgEl('path', { d: `M${px} ${py - 12}L${px} ${py - 40}L${px + 16} ${py - 16}Z`, fill: '#f4f1ea', stroke: INK, 'stroke-width': 1.5 }, g); return g; }
function person(G, x, eye) { const [px, py] = G.P([x, 0]), [, ey] = G.P([x, eye]); const g = svgEl('g', { stroke: INK, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, G.Ltop); svgEl('circle', { cx: px, cy: ey - 2, r: 8, fill: '#fff' }, g); svgEl('path', { d: `M${px} ${ey + 6}L${px} ${py - 24}M${px} ${py - 24}L${px - 9} ${py}M${px} ${py - 24}L${px + 9} ${py}M${px} ${ey + 16}L${px + 12} ${ey + 8}` }, g); return g; }
const EL = { cliff: { label: 'Elevation = depression' }, eye: { label: 'Eye level' }, ex4: { label: 'Example 4 check' } };
const elevation = {
  title: 'Elevation, depression, and the eye-level triangle',
  height: 420,
  choices: Object.keys(EL).map((k) => ({ v: k, label: EL[k].label })),
  intro: (v) => (v === 'cliff' ? 'A lookout on a cliff spots a boat.' : v === 'eye' ? 'A student measures a flagpole with a clinometer.' : 'Example 4: a guy cable on a tower.') + ' Press <b>Next</b>.',
  make(stage, v, ex) {
    const p = panel(stage, 640, 16, ex.W - 654, 388);
    if (v === 'cliff') {
      const hgt = 30, ang = 25, d = hgt / Math.tan(ang * RAD), k = 7.2;
      const G = new Geo(stage, { x: 0, y: 0, w: 640, h: 420, k, ox: 96, oy: 330 });
      G.fill([[-12, 0], [80, 0], [80, -12], [-12, -12]], '#cfe3f3'); G.fill([[-12, 0], [0, 0], [0, hgt], [-12, hgt]], '#d9cfb8');
      const top = [0, hgt], base = [0, 0], bt = [d, 0];
      const cliffS = G.seg(base, top, { width: 3.5 }), sea = G.seg([-12, 0], [78, 0], { color: '#4a86b8', width: 2.5 });
      boat(G, d); person(G, -3, hgt + 2.2);
      G.lab([0, hgt / 2], T('30\\text{ m}'), { pos: 'w', dx: -6 });
      const hor = G.seg(top, [78, hgt], { dash: true, color: GRAY, width: 2.5 }), sight = G.seg(top, bt, { color: HYP }), seaL = G.seg(base, bt, { width: 3.5 });
      [hor, sight, seaL].forEach(hide);
      let aTop, aBoat, Z;
      return [
        { cap: `A lookout stands on a cliff ${T('30')} m above the sea and spots a boat. How far out is it?`, run: async (c) => { await G.draw(c, cliffS, 300); } },
        { cap: `<b>Angle of depression</b>: from the <b>horizontal</b> at the lookout, <b>down</b> to the boat: ${T('25^\\circ')}.`,
          run: async (c) => { hor.style.opacity = 1; await G.draw(c, hor, 400); sight.style.opacity = 1; await G.draw(c, sight, 500); aTop = G.arc(top, [78, hgt], bt, 70, { label: T('25^\\circ'), ld: 22 }); await G.draw(c, aTop, 300); await fadeIn(c, aTop.label); await say(c, p, '<b>depression</b> ' + T('25^\\circ') + ' from the horizontal'); } },
        { cap: `The sea is horizontal too, and the two horizontals are <b>parallel</b>. The <b>Z</b> makes alternate angles equal: the angle of <b>elevation</b> from the boat is also ${T('25^\\circ')}.`,
          run: async (c) => { seaL.style.opacity = 1; Z = G.poly([[d, hgt], top, bt, base], { color: COLORS.orange, width: 9 }); Z.style.opacity = 0.45; Z.path.setAttribute('stroke-linejoin', 'round'); await G.draw(c, Z, 900); aBoat = G.arc(bt, base, top, 70, { label: T('25^\\circ'), ld: 22 }); await G.draw(c, aBoat, 300); await fadeIn(c, aBoat.label); await say(c, p, '<b>elevation</b> ' + T('25^\\circ') + ' from the boat'); } },
        { cap: `In the right triangle, ${T('25^\\circ')} sits at the boat: 30 m is ${OPPw}, the distance ${T('d')} is ${ADJw}. TOA: ${T('\\tan25^\\circ=\\dfrac{30}{d}')}.`,
          run: async (c) => { await fade(c, Z, 0.12); colour(cliffS, OPP); colour(seaL, ADJ); seaL.path.setAttribute('stroke-width', 5); await appear(c, G.rm(base, bt, top, 14), 200); const dl = G.lab([d / 2, 0], T('d'), { pos: 's', dy: 14, color: ADJ }); await pop(c, dl); await say(c, p, T('\\tan25^\\circ=\\dfrac{30}{d}')); } },
        { cap: `${T('d')} is on the bottom, so it trades places with ${T('\\tan25^\\circ')}: ${T(`d=\\dfrac{30}{\\tan25^\\circ}\\approx${f(d, 1)}`)} m.`,
          run: async (c) => { await say(c, p, T(`d=\\dfrac{30}{\\tan25^\\circ}\\approx${f(d, 1)}\\text{ m}`)); } },
        { cap: `Watch out: the angle at the <b>top</b> of the triangle (against the cliff) is ${T('90^\\circ-25^\\circ=65^\\circ')}, not the angle of depression.`,
          run: async (c) => { const a = G.arc(top, base, bt, 40, { color: GRAY, label: T('65^\\circ'), ld: 18 }); await G.draw(c, a, 300); await fadeIn(c, a.label); await say(c, p, `top angle ${T('65^\\circ')} (not ${T('25^\\circ')})`, 'sm'); } }
      ];
    }
    if (v === 'eye') {
      const eye = 1.6, dist = 20, ang = 35, x = dist * Math.tan(ang * RAD), k = 17;
      const G = new Geo(stage, { x: 0, y: 0, w: 640, h: 420, k, ox: 120, oy: 360 });
      G.fill([[-6, 0], [28, 0], [28, -3], [-6, -3]], '#d8e8c8');
      G.seg([-6, 0], [28, 0], { color: '#5d8a3a', width: 2.5 });
      const pole = G.seg([dist, 0], [dist, eye + x], { width: 4 });
      const [fx, fy] = G.P([dist, eye + x]); svgEl('path', { d: `M${fx} ${fy}L${fx + 36} ${fy + 10}L${fx} ${fy + 22}Z`, fill: REF, 'fill-opacity': .8 }, G.Ltop);
      person(G, 0, eye);
      const dl = G.lab([dist / 2, 0], T('20\\text{ m}'), { pos: 's', dy: 6 });
      const eyeL = G.seg([0, eye], [dist, eye], { dash: true, color: GRAY, width: 2.5 }), sight = G.seg([0, eye], [dist, eye + x], { color: HYP });
      const up = G.seg([dist, eye], [dist, eye + x], { color: OPP, width: 5 }), low = G.seg([dist, 0], [dist, eye], { color: TEAL, width: 5 });
      [eyeL, sight, up, low].forEach(hide); void dl;
      let a;
      return [
        { cap: `Eyes ${T('1.6')} m above the ground, ${T('20')} m from a flagpole. The clinometer reads ${T('35^\\circ')} to the top.`, run: async (c) => { await G.draw(c, pole, 400); } },
        { cap: 'The angle is measured from <b>eye level</b>, so the right triangle starts at the eyes: its bottom leg is the dashed eye-level line, not the ground.',
          run: async (c) => { eyeL.style.opacity = 1; await G.draw(c, eyeL, 400); sight.style.opacity = 1; await G.draw(c, sight, 500); a = G.arc([0, eye], [dist, eye], [dist, eye + x], 60, { label: T('35^\\circ') }); await G.draw(c, a, 300); await fadeIn(c, a.label); await appear(c, G.rm([dist, eye], [0, eye], [dist, eye + x], 13), 200); } },
        { cap: `TOA: ${T(`x=20\\tan35^\\circ\\approx${f(x, 2)}`)} m. That is only the height <b>above eye level</b> (purple).`,
          run: async (c) => { colour(eyeL, ADJ); eyeL.path.removeAttribute('stroke-dasharray'); up.style.opacity = 1; await G.draw(c, up, 400); await pop(c, G.lab([dist, eye + x / 2], T(`x\\approx${f(x, 2)}`), { pos: 'e', dx: 8, color: OPP })); await say(c, p, T('\\tan35^\\circ=\\dfrac{x}{20}')); await say(c, p, T(`x=20\\tan35^\\circ\\approx${f(x, 3)}`)); } },
        { cap: `Add the eye height back: ${T(`${f(x, 3)}+1.6\\approx${f(x + eye, 1)}`)} m. Forgetting the 1.6 m is the classic slip.`,
          run: async (c) => { low.style.opacity = 1; await G.draw(c, low, 300); await pop(c, G.lab([dist, eye / 2], T('1.6'), { pos: 'e', dx: 8, color: TEAL })); await say(c, p, T(`h\\approx${f(x, 3)}+1.6\\approx${f(x + eye, 1)}\\text{ m}`)); const s = stamp(stage, T(`\\approx${f(x + eye, 1)}\\text{ m}`), { ok: true, x: 500, y: 60, size: 'sm' }); await stampIn(c, s); } }
      ];
    }
    // Example 4
    const ht = 6.4 * Math.tan(58.5 * RAD), cab = 6.4 / Math.cos(58.5 * RAD), k = 27;
    const G = new Geo(stage, { x: 0, y: 0, w: 640, h: 420, k, ox: 200, oy: 370 });
    const Bs = [0, 0], Tp = [0, ht], S = [6.4, 0];
    G.seg([-5, 0], [12, 0], { color: '#5d8a3a', width: 2.5 });
    for (let yy = 0; yy < ht - 0.6; yy += 1.2) { G.seg([-0.35, yy], [0.35, yy + 1.2], { color: '#b8bcc6', width: 1.5 }); G.seg([0.35, yy], [-0.35, yy + 1.2], { color: '#b8bcc6', width: 1.5 }); }
    const tw = G.seg(Bs, Tp, { width: 4 }), gr = G.seg(Bs, S, { width: 4 }), cb = G.seg(S, Tp, { width: 3.5 });
    [tw, gr, cb].forEach(hide);
    let hl, cl;
    return [
      { cap: `A cable runs from the top of a tower to the ground: ${T('58.5^\\circ')} with the ground, anchor ${T('6.4')} m from the base.`,
        run: async (c) => { for (const e of [tw, gr, cb]) { e.style.opacity = 1; await G.draw(c, e, 350); } await appear(c, G.rm(Bs, S, Tp, 14), 200); const a = G.arc(S, Tp, Bs, 40, { label: T('58.5^\\circ'), ld: 26 }); await G.draw(c, a, 300); await fadeIn(c, a.label); await fadeIn(c, G.lab([3.2, 0], T('6.4\\text{ m}'), { pos: 's', dy: 4 })); } },
      { cap: `(a) From ${T('58.5^\\circ')}: the height ${T('h')} is ${OPPw}, 6.4 m is ${ADJw}: TOA. ${T(`h=6.4\\tan58.5^\\circ\\approx${f(ht, 3)}`)}, so <b>${f(ht, 1)} m</b>.`,
        run: async (c) => { colour(tw, OPP); colour(gr, ADJ); hl = G.lab([0, ht / 2], T('h'), { pos: 'w', dx: -10, color: OPP }); await pop(c, hl); await say(c, p, T('\\tan58.5^\\circ=\\dfrac{h}{6.4}')); await say(c, p, T(`h=6.4\\tan58.5^\\circ\\approx${f(ht, 4)}`)); hl.innerHTML = T(f(ht, 1) + '\\text{ m}'); await pop(c, hl); } },
      { cap: `(b) The cable is the ${HYPw}; with the adjacent side that is CAH. ${T(`\\text{cable}=\\dfrac{6.4}{\\cos58.5^\\circ}\\approx${f(cab, 3)}`)}, so <b>${f(cab, 1)} m</b>.`,
        run: async (c) => { colour(cb, HYP); colour(tw, '#c9ccd3'); cl = G.lab([3.2, ht / 2], T(f(cab, 1) + '\\text{ m}'), { pos: 'ne', dx: 8, color: HYP }); await pop(c, cl); await say(c, p, T('\\cos58.5^\\circ=\\dfrac{6.4}{\\text{cable}}')); await say(c, p, T(`\\text{cable}=\\dfrac{6.4}{\\cos58.5^\\circ}\\approx${f(cab, 4)}`)); } },
      { cap: `Check with Pythagoras, using the <b>unrounded</b> height: ${T(`\\sqrt{6.4^2+${f(ht, 3)}^2}\\approx${f(Math.hypot(6.4, ht), 3)}`)} ✓`,
        run: async (c) => { colour(tw, OPP); await say(c, p, T(`\\sqrt{6.4^2+${f(ht, 3)}^2}\\approx${f(Math.hypot(6.4, ht), 3)}`) + ' ✓', 'cof'); const s = stamp(stage, 'Pythagoras agrees ✓', { ok: true, x: 470, y: 60, size: 'sm' }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: split ★ (Section 5) =============================== */
const SP = { ex5: { label: 'Example 5 check', A: 48, C: 34, h: 22 }, other: { label: 'Another triangle', A: 40, C: 55, h: 15 } };
const split = {
  title: '★ No right angle? Split it along the altitude',
  height: 450,
  choices: Object.keys(SP).map((k) => ({ v: k, label: SP[k].label })),
  intro: (v) => `${v === 'ex5' ? 'Example 5: ' : ''}${T(`\\angle A=${SP[v].A}^\\circ`)}, ${T(`\\angle C=${SP[v].C}^\\circ`)}, altitude ${T(`BD=${SP[v].h}`)} m. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const q = SP[v], ad = q.h / Math.tan(q.A * RAD), dc = q.h / Math.tan(q.C * RAD), ac = ad + dc;
    const k = Math.min(680 / ac, 270 / q.h), ox = (ex.W - ac * k) / 2, oy = 330;
    const GL = new Geo(stage, { x: 0, y: 0, w: ex.W, h: 450, k, ox, oy }), GR = new Geo(stage, { x: 0, y: 0, w: ex.W, h: 450, k, ox, oy });
    const A = [0, 0], D = [ad, 0], C = [ac, 0], Bv = [ad, q.h];
    const L = { AB: GL.seg(A, Bv), AD: GL.seg(A, D), BD: GL.seg(Bv, D) }, R = { BC: GR.seg(Bv, C), DC: GR.seg(D, C), BD: GR.seg(Bv, D) };
    hide(L.BD); hide(R.BD);
    const aA = GL.arc(A, Bv, D, 46, { label: T(q.A + '^\\circ') }), aC = GR.arc(C, D, Bv, 52, { label: T(q.C + '^\\circ') });
    const vA = GL.lab(A, T('A'), { pos: 'sw', cls: 'u9l8-v' }), vC = GR.lab(C, T('C'), { pos: 'se', cls: 'u9l8-v' }), vB = GL.lab(Bv, T('B'), { pos: 'n', cls: 'u9l8-v' });
    const vD = GL.lab(D, T('D'), { pos: 's', dy: 2, cls: 'u9l8-v' });
    const rmL = GL.rm(D, A, Bv, 14), rmR = GR.rm(D, C, Bv, 14); [rmL, rmR, vD].forEach(hide);
    const hL = GL.lab([ad, q.h / 2], T(q.h + '\\text{ m}'), { pos: 'w', dx: -6, color: OPP }), hR = GR.lab([ad, q.h / 2], T(q.h + '\\text{ m}'), { pos: 'e', dx: 6, color: OPP }); [hL, hR].forEach(hide);
    const res = add(stage, box(h('div', 'u9l8-res u9l8-resc'), ex.W - 40, 64), 20, 378); hide(res);
    const slide = (c, dx) => Promise.all([anim(c, GL.el, [{ transform: `translateX(${GL.dx || 0}px)` }, { transform: `translateX(${-dx}px)` }], 650), anim(c, GR.el, [{ transform: `translateX(${GR.dx || 0}px)` }, { transform: `translateX(${dx}px)` }], 650)]).then(() => { GL.dx = -dx; GR.dx = dx; });
    let lAD, lDC;
    return [
      { cap: `Triangle ${T('ABC')} has <b>no right angle</b>, so SOH CAH TOA has nowhere to start. Known: ${T(`\\angle A=${q.A}^\\circ`)} and ${T(`\\angle C=${q.C}^\\circ`)}.`,
        run: async (c) => { for (const e of [L.AB, R.BC, L.AD, R.DC]) await GL.draw(c, e, 300); for (const e of [vA, vB, vC]) await fadeIn(c, e, 150); await GL.draw(c, aA, 300); await GR.draw(c, aC, 300); await fadeIn(c, aA.label); await fadeIn(c, aC.label); } },
      { cap: `Drop the <b>altitude</b> from ${T('B')} to ${T('AC')}, meeting it at ${T('D')}: ${T(`BD=${q.h}`)} m, at <b>right angles</b> to ${T('AC')}.`,
        run: async (c) => { L.BD.style.opacity = 1; R.BD.style.opacity = 1; colour(L.BD, OPP); colour(R.BD, OPP); await GL.draw(c, L.BD, 600); await appear(c, rmL, 200); await appear(c, rmR, 200); await fadeIn(c, vD); await fadeIn(c, hL); } },
      { cap: `Split along the altitude: two <b>right triangles</b>, ${T('\\triangle ABD')} and ${T('\\triangle BDC')}. They <b>share</b> the leg ${T('BD')}.`,
        run: async (c) => { await slide(c, 64); await fadeIn(c, hR); } },
      { cap: `${T('\\triangle ABD')}: from ${T(q.A + '^\\circ')}, ${T('BD')} is ${OPPw} and ${T('AD')} is ${ADJw}: TOA. ${T(`AD=\\dfrac{${q.h}}{\\tan${q.A}^\\circ}\\approx${f(ad, 3)}`)}`,
        run: async (c) => { colour(L.AD, ADJ); colour(L.AB, HYP); L.AD.path.setAttribute('stroke-width', 5); lAD = GL.lab([ad / 2, 0], T(`AD\\approx${f(ad, 1)}`), { pos: 's', dy: 26, color: ADJ }); await pop(c, lAD); } },
      { cap: `${T('\\triangle BDC')}: from ${T(q.C + '^\\circ')}, ${T('BD')} is ${OPPw} again and ${T('DC')} is ${ADJw}: ${T(`DC=\\dfrac{${q.h}}{\\tan${q.C}^\\circ}\\approx${f(dc, 3)}`)}`,
        run: async (c) => { colour(R.DC, ADJ); colour(R.BC, HYP); R.DC.path.setAttribute('stroke-width', 5); lDC = GR.lab([ad + dc / 2, 0], T(`DC\\approx${f(dc, 1)}`), { pos: 's', dy: 26, color: ADJ }); await pop(c, lDC); } },
      { cap: `Slide them back together: ${T(`AC=AD+DC\\approx${f(ad, 3)}+${f(dc, 3)}\\approx${f(ac, 1)}`)} m. Add the <b>unrounded</b> values.`,
        run: async (c) => { await slide(c, 0); hide(hR); res.innerHTML = T(`AC=AD+DC\\approx${f(ad, 4)}+${f(dc, 4)}=${f(ac, 4)}\\approx\\boldsymbol{${f(ac, 1)}\\textbf{ m}}`); await fadeIn(c, res); } },
      { cap: `At ${T('B')}: ${T(`\\angle ABD=90^\\circ-${q.A}^\\circ=${90 - q.A}^\\circ`)} and ${T(`\\angle DBC=90^\\circ-${q.C}^\\circ=${90 - q.C}^\\circ`)}, so ${T(`\\angle ABC=${180 - q.A - q.C}^\\circ`)}. Check: ${T(`${q.A}+${q.C}+${180 - q.A - q.C}=180`)} ✓`,
        run: async (c) => { const b1 = GL.arc(Bv, A, D, 40, { color: TEAL, label: T((90 - q.A) + '^\\circ'), ld: 18 }), b2 = GR.arc(Bv, D, C, 52, { color: GRN, label: T((90 - q.C) + '^\\circ'), ld: 18 }); await GL.draw(c, b1, 300); await fadeIn(c, b1.label); await GR.draw(c, b2, 300); await fadeIn(c, b2.label); const s = stamp(stage, T(`\\angle ABC=${180 - q.A - q.C}^\\circ`), { ok: true, x: ex.W - 130, y: 60, size: 'sm' }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer: iso (Section 6) =============================== */
const IS = { ex6: { label: 'Example 6 check', b: 15, A: 54 }, other: { label: 'Another triangle', b: 12, A: 48 } };
const iso = {
  title: 'Isosceles: area → height → two congruent halves',
  height: 430,
  choices: Object.keys(IS).map((k) => ({ v: k, label: IS[k].label })),
  intro: (v) => `${v === 'ex6' ? 'Example 6: ' : ''}isosceles ${T('KLM')}, base ${T(`LM=${IS[v].b}`)} cm, area ${T(`${IS[v].A}\\text{ cm}^2`)}. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const q = IS[v], hb = q.b / 2, ht = 2 * q.A / q.b, side = Math.hypot(hb, ht), half = Math.atan(hb / ht) / RAD;
    const k = Math.min(210 / hb, 250 / ht), ox = 240, oy = 320;
    const GL = new Geo(stage, { x: 0, y: 0, w: 480, h: 430, k, ox, oy }), GR = new Geo(stage, { x: 0, y: 0, w: 480, h: 430, k, ox, oy });
    const Lp = [-hb, 0], Mp = [hb, 0], N = [0, 0], K = [0, ht];
    const sKL = GL.seg(K, Lp), sLN = GL.seg(Lp, N), sKM = GR.seg(K, Mp), sNM = GR.seg(N, Mp);
    const tick = (G, a, b) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), n = [-dy / L * 0.35 * 15 / k, dx / L * 0.35 * 15 / k]; return G.seg([m[0] - n[0], m[1] - n[1]], [m[0] + n[0], m[1] + n[1]], { width: 2.5 }); };
    tick(GL, K, Lp); tick(GR, K, Mp);
    GL.lab(K, T('K'), { pos: 'n', cls: 'u9l8-v' }); GL.lab(Lp, T('L'), { pos: 'sw', cls: 'u9l8-v' }); GR.lab(Mp, T('M'), { pos: 'se', cls: 'u9l8-v' });
    const lb = GL.lab([0, 0], T(q.b + '\\text{ cm}'), { pos: 's', dy: 6 });
    const altL = GL.seg(K, N, { dash: true }), altR = GR.seg(K, N, { dash: true }); [altL, altR].forEach(hide);
    const rL = GL.rm(N, Lp, K, 13), rR = GR.rm(N, Mp, K, 13), vN = GL.lab(N, T('N'), { pos: 'ne', dx: 4, cls: 'u9l8-fsm' }); [rL, rR, vN].forEach(hide);
    const p = panel(stage, 490, 16, ex.W - 504, 398);
    let hl, h1, h2;
    return [
      { cap: `Isosceles ${T('\\triangle KLM')}: ${T('KL=KM')} (tick marks), base ${T(`LM=${q.b}`)} cm, area ${T(`${q.A}\\text{ cm}^2`)}.`,
        run: async (c) => { for (const e of [sLN, sNM, sKL, sKM]) await GL.draw(c, e, 260); await say(c, p, `${T(`A=${q.A}\\text{ cm}^2`)}, ${T(`\\text{base}=${q.b}`)}`); } },
      { cap: `Drop the altitude from the apex ${T('K')} to ${T('N')}, the midpoint of ${T('LM')}: it is <b>perpendicular</b> to the base and cuts it into ${T(`${f(hb, 1)}+${f(hb, 1)}`)}.`,
        run: async (c) => { altL.style.opacity = 1; altR.style.opacity = 1; await GL.draw(c, altL, 500); for (const e of [rL, rR, vN]) await appear(c, e, 150); await fade(c, lb); h1 = GL.lab([-hb / 2, 0], T(f(hb, 1)), { pos: 's', dy: 4, color: ADJ }); h2 = GR.lab([hb / 2, 0], T(f(hb, 1)), { pos: 's', dy: 4, color: ADJ }); await pop(c, h1); await pop(c, h2); } },
      { cap: `(a) The altitude is the <b>height</b>: ${T(`${q.A}=\\tfrac12(${q.b})h`)}, so ${T(`h=\\dfrac{2(${q.A})}{${q.b}}=${f(ht, 1)}`)} cm.`,
        run: async (c) => { await say(c, p, T(`${q.A}=\\tfrac12(${q.b})h`)); await say(c, p, T(`h=\\dfrac{2(${q.A})}{${q.b}}=${f(ht, 1)}\\text{ cm}`)); hl = GL.lab([0, ht / 2], T(f(ht, 1)), { pos: 'e', dx: 6, color: OPP }); await pop(c, hl); } },
      { cap: 'The two halves are <b>congruent</b> right triangles: fold one onto the other and they match exactly. So the altitude also <b>bisects</b> the apex angle.',
        run: async (c) => {
          GL.el.style.transformOrigin = `${ox}px 0px`; GL.html.style.opacity = 0;
          await anim(c, GL.el, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(-1)' }], 800); await sleep(c, 250);
          await anim(c, GL.el, [{ transform: 'scaleX(-1)' }, { transform: 'scaleX(1)' }], 800); GL.html.style.opacity = 1;
        } },
      { cap: `(b) One half has legs ${T(f(hb, 1))} and ${T(f(ht, 1))}. Pythagoras: ${T(`KL=\\sqrt{${f(hb, 1)}^2+${f(ht, 1)}^2}\\approx${f(side, 1)}`)} cm ${T('=KM')}.`,
        run: async (c) => { colour(sKL, HYP); colour(sKM, HYP); await say(c, p, T(`KL=\\sqrt{${f(hb, 1)}^2+${f(ht, 1)}^2}=\\sqrt{${f(hb * hb + ht * ht, 2)}}\\approx${f(side, 1)}`)); const d = GL.lab([-hb / 2, ht / 2], T(f(side, 1)), { pos: 'nw', dx: -6, color: HYP }); await pop(c, d); } },
      { cap: `(c) At ${T('K')}: ${T(f(hb, 1))} is ${OPPw}, ${T(f(ht, 1))} is ${ADJw}: ${T(`\\angle NKL=\\tan^{-1}\\!\\left(\\frac{${f(hb, 1)}}{${f(ht, 1)}}\\right)\\approx${f(half, 2)}^\\circ`)}. Double it: ${T(`\\angle LKM\\approx${f(2 * half, 2)}^\\circ\\approx${Math.round(2 * half)}^\\circ`)}.`,
        run: async (c) => {
          colour(sLN, OPP); colour(altL, ADJ); altL.path.removeAttribute('stroke-dasharray');
          const a1 = GL.arc(K, Lp, N, 50, { label: T(f(half, 1) + '^\\circ'), ld: 20 }), a2 = GR.arc(K, N, Mp, 58, { color: TEAL, label: T(f(half, 1) + '^\\circ'), ld: 20 });
          await GL.draw(c, a1, 300); await fadeIn(c, a1.label); await GR.draw(c, a2, 300); await fadeIn(c, a2.label);
          await say(c, p, T(`\\angle NKL=\\tan^{-1}\\!\\left(\\dfrac{${f(hb, 1)}}{${f(ht, 1)}}\\right)\\approx${f(half, 2)}^\\circ`));
          await say(c, p, T(`\\angle LKM=2(${f(half, 2)}^\\circ)\\approx${Math.round(2 * half)}^\\circ`), 'cof');
        } }
    ];
  }
};

/* =============================== explainer: bearings (Extension) =============================== */
const BR = { b40: { label: '040°, 10 km', b: 40, d: 10 }, b120: { label: '120°, 8 km', b: 120, d: 8 } };
const bearings = {
  title: 'Extension: bearings in a right triangle',
  height: 430,
  choices: Object.keys(BR).map((k) => ({ v: k, label: BR[k].label })),
  intro: (v) => `A boat leaves harbour ${T('H')} on a bearing of ${T(String(BR[v].b).padStart(3, '0') + '^\\circ')} and sails ${T(String(BR[v].d))} km. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const q = BR[v], br = q.b, d = q.d, k = 17, south = br > 90;
    const G = new Geo(stage, { x: 0, y: 0, w: 560, h: 430, k, ox: 230, oy: south ? 140 : 300 });
    const H = [0, 0], M = [d * Math.sin(br * RAD), d * Math.cos(br * RAD)], foot = [0, M[1]];
    const ref = south ? 180 - br : br, ns = Math.abs(M[1]), ew = M[0];
    const nsL = G.seg([0, south ? 7 : -5], [0, south ? -11 : 13], { color: GRAY, width: 2 });
    const [nx, ny] = G.P([0, south ? 7 : 13]); svgEl('polygon', { points: `${nx},${ny - 12} ${nx - 7},${ny + 2} ${nx + 7},${ny + 2}`, fill: INK }, G.Ltop);
    G.lab([0, south ? 7 : 13], '<b>N</b>', { pos: 'n', gap: 12 });
    const ewL = G.seg([-5, 0], [12, 0], { color: '#dde0e6', width: 1.5, layer: G.Lbg }); void ewL; void nsL;
    G.lab([12, 0], '<b class="u9l8-muted">E</b>', { pos: 'e' });
    if (south) G.lab([0, -11], '<b>S</b>', { pos: 's' });
    const hp = svgEl('circle', { cx: G.P(H)[0], cy: G.P(H)[1], r: 6, fill: INK }, G.Ltop); void hp;
    G.lab(H, T('H'), { pos: 'w', dx: -6, cls: 'u9l8-v' });
    // sweeping bearing arc
    const sw = svgEl('path', { fill: 'none', stroke: REF, 'stroke-width': 3.2 }, G.Ltop), swf = svgEl('path', { fill: REF, 'fill-opacity': 0.12 }, G.Lbg);
    const ray = svgEl('path', { stroke: REF, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', fill: 'none' }, G.Ltop);
    const swl = G.lab(H, '', { color: REF, cls: 'u9l8-anglab' });
    const [hx, hy] = G.P(H), r = 62;
    const setSweep = (a) => { const e = [hx + r * Math.sin(a * RAD), hy - r * Math.cos(a * RAD)], big = a > 180 ? 1 : 0; sw.setAttribute('d', a > 0.5 ? `M${hx} ${hy - r}A${r} ${r} 0 ${big} 1 ${e[0]} ${e[1]}` : ''); swf.setAttribute('d', a > 0.5 ? `M${hx} ${hy}L${hx} ${hy - r}A${r} ${r} 0 ${big} 1 ${e[0]} ${e[1]}Z` : ''); ray.setAttribute('d', `M${hx} ${hy}L${hx + (r + 40) * Math.sin(a * RAD)} ${hy - (r + 40) * Math.cos(a * RAD)}`); swl.innerHTML = T(String(Math.round(a)).padStart(3, '0') + '^\\circ'); place(swl, hx + (r + 30) * Math.sin(a * RAD / 2), hy - (r + 30) * Math.cos(a * RAD / 2), 'c'); };
    setSweep(0); [sw, swf, ray, swl].forEach(hide);
    const path = G.seg(H, M, { color: HYP }), drop = G.seg(M, foot, { color: OPP }), leg = G.seg(H, foot, { color: ADJ }); [path, drop, leg].forEach(hide);
    const p = panel(stage, 570, 16, ex.W - 584, 398);
    const bs = String(br).padStart(3, '0');
    return [
      { cap: `A bearing is an angle measured <b>clockwise from north</b>, written with <b>three digits</b>. Start at ${T('H')}, facing north.`, run: async (c) => { await say(c, p, `bearing ${T(bs + '^\\circ')}: clockwise from N`); } },
      { cap: `Turn ${T(br + '^\\circ')} clockwise from north${south ? `, past east (${T('090^\\circ')}): the boat heads <b>south of east</b>` : ''}. Then sail ${T(String(d))} km.`,
        run: async (c) => { [sw, swf, ray, swl].forEach((e) => (e.style.opacity = 1)); await tween(c, 1100, (t) => setSweep(br * t)); path.style.opacity = 1; await G.draw(c, path, 600); await fadeIn(c, G.lab(M, T('M'), { pos: south ? 'se' : 'ne', cls: 'u9l8-v' })); await fadeIn(c, G.lab([M[0] / 2, M[1] / 2], T(d + '\\text{ km}'), { pos: south ? 'sw' : 'nw', dx: south ? -4 : -4, color: HYP })); } },
      { cap: south ? `Use the north–south line. The acute angle at ${T('H')} is measured from <b>south</b>: ${T(`180^\\circ-${br}^\\circ=${ref}^\\circ`)}. Drop from ${T('M')} to that line: a right triangle.`
          : `Drop from ${T('M')} to the north line: a right triangle. The ${T(d)} km path is the ${HYPw}, and ${T(br + '^\\circ')} sits at ${T('H')} between north and the path.`,
        run: async (c) => {
          await fade(c, swf, 0.05); await fade(c, sw, 0.25); await fade(c, swl, 0.4); await fade(c, ray, 0);
          drop.style.opacity = 1; leg.style.opacity = 1; await G.draw(c, leg, 400); await G.draw(c, drop, 400); await appear(c, G.rm(foot, H, M, 13), 200);
          const a = G.arc(H, foot, M, 46, { label: T(ref + '^\\circ'), ld: 20 }); await G.draw(c, a, 300); await fadeIn(c, a.label);
          await say(c, p, `acute angle at ${T('H')}: ${T(ref + '^\\circ')}${south ? ' from S' : ' from N'}`);
        } },
      { cap: `${south ? 'South' : 'North'} part: ${ADJw} to ${T(ref + '^\\circ')}, ${T(`${d}\\cos${ref}^\\circ\\approx${f(ns, 2)}`)} km ${south ? 'south' : 'north'}. East part: ${OPPw}, ${T(`${d}\\sin${ref}^\\circ\\approx${f(ew, 2)}`)} km east.`,
        run: async (c) => {
          await pop(c, G.lab([0, M[1] / 2], T(f(ns, 2)), { pos: 'w', dx: -8, color: ADJ })); await pop(c, G.lab([M[0] / 2, M[1]], T(f(ew, 2)), { pos: south ? 's' : 'n', dy: south ? 4 : -4, color: OPP }));
          await say(c, p, `${south ? 'south' : 'north'} ${T(`=${d}\\cos${ref}^\\circ\\approx${f(ns, 2)}\\text{ km}`)}`); await say(c, p, `east ${T(`=${d}\\sin${ref}^\\circ\\approx${f(ew, 2)}\\text{ km}`)}`);
        } }
    ];
  }
};

/* =============================== mount =============================== */
function mountStatic() {
  const pyr = document.getElementById('u9l8-pyr'); if (pyr) pyramidFig(pyr);
  document.querySelectorAll('[data-u9l8-fig]').forEach((el) => { const S = FIG[el.dataset.u9l8Fig]; if (S) tikzFig(el, S); });
}
mountStatic();
export const explainers = mountExplainers({ pyramid, whichTool, names, cofunction, solveSide, solveAngle, elevation, split, iso, bearings });
export const _test = { FIG, WT };
