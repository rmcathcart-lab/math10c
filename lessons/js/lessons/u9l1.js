/* Math 10C · Unit 9 · Lesson 1 — Right-Triangle Trigonometry: Sine, Cosine, and Tangent.
 * Warm-up (Shadow Height: the student's triangle grows ×7.5 into the flagpole's), static figures (Examples 1–5,
 * triangle XYZ), the "tap the side" game, and the explainers:
 *   why (two Example 1 triangles: same angles → similar → the scale factor cancels in the ratio),
 *   grow (the star: a right triangle grows through similar copies while opp/hyp, adj/hyp, opp/adj stay fixed; the
 *         angle changes and they move; then the reference angle jumps corners and opp/adj swap),
 *   name (the labelling routine: hyp, opp, adj; switching the reference angle; Example 2 checks),
 *   soh (building SOH CAH TOA from the coloured sides, and a "which ratio?" quiz),
 *   size (swing a leg onto the hypotenuse: sin, cos < 1; swing one leg onto the other: tan vs 1; Example 5 numbers),
 *   ratios (Examples 3 and 5 checks: label, write, simplify; the second reference angle; sin R = cos P),
 *   hypFirst (Example 4 check: Pythagoras for the missing hypotenuse, then the ratios as decimals).
 * Colours (whole unit): opposite purple, adjacent amber, hypotenuse blue, reference angle red. */
import {
  h, tex, add, box, Box, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween, pulse, shake, svgEl,
  liveCtx, anim, angleArc, rightMark, arrowHead, place, col, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const OPP = COLORS.purple, ADJ = COLORS.amber, HYP = COLORS.blue, REF = COLORS.red, INK = COLORS.ink, GRAY = '#b9bdc6';
const RC = { opp: OPP, adj: ADJ, hyp: HYP };
const LONG = { opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' };
const CLS = { opp: 'u9l1-co', adj: 'u9l1-ca', hyp: 'u9l1-ch' };
const RB = (r, txt) => `<b class="${CLS[r]}">${txt || r}</b>`;   // a coloured role word
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const nrm = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u9l1-panel', title ? `<div class="u9l1-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u9l1-line ' + cls, html); p.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const hide0 = (el) => { el.style.opacity = 0; return el; };
const fr = (a, b) => `\\dfrac{${a}}{${b}}`;
/** a/b written out and simplified: "\dfrac{9}{15}=\dfrac{3}{5}" */
const simpT = (a, b) => { const g = gcd(a, b); return g > 1 ? `${fr(a, b)}=${fr(a / g, b / g)}` : fr(a, b); };
const ctxt = (r) => `{\\color{${RC[r]}}\\text{${r}}}`;               // coloured "opp" inside TeX
const FN = { sin: ['opp', 'hyp'], cos: ['adj', 'hyp'], tan: ['opp', 'adj'] };
const MN = { sin: 'SOH', cos: 'CAH', tan: 'TOA' };
const NAMEF = { sin: 'sine', cos: 'cosine', tan: 'tangent' };

/* ======================================================================================
 * Tri: a right triangle from three vertex coordinates (any orientation), with vertex letters, side lengths,
 * a reference-angle arc and opp / adj / hyp colouring and tags.
 * ====================================================================================== */
class Tri extends Box {
  /** o: { x, y, width, height, P: { K: [0,0], … } (y up), right: 'K', pad (px or [t,r,b,l]), unit, rot (deg), flip,
   *       lens: { KL: '3' }, ref, refLab, arcR, vlab, sn: ['NM', …] (preferred side names) } */
  constructor(host, opts = {}) {
    const o = Object.assign({ width: 380, height: 280, pad: 44, lens: {}, vlab: true, sw: 3.5, fill: true, arcR: 30 }, opts);
    super(host, o, 'u9l1-trib', o.width, o.height);
    const names = Object.keys(o.P); this.names = names;
    let pts = names.map((n) => o.P[n].slice());
    if (o.flip) pts = pts.map(([x, y]) => [-x, y]);
    if (o.rot) { const a = (o.rot * Math.PI) / 180, cs = Math.cos(a), sn = Math.sin(a); pts = pts.map(([x, y]) => [x * cs - y * sn, x * sn + y * cs]); }
    const pad = Array.isArray(o.pad) ? o.pad : [o.pad, o.pad, o.pad, o.pad];
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const aw = o.width - pad[1] - pad[3], ah = o.height - pad[0] - pad[2];
    const u = o.unit || Math.min(aw / (x1 - x0 || 1), ah / (y1 - y0 || 1));
    const ox = pad[3] + (aw - (x1 - x0) * u) / 2, oy = pad[0] + (ah - (y1 - y0) * u) / 2;
    this.u = u; this.V = {};
    names.forEach((n, i) => { this.V[n] = [ox + (pts[i][0] - x0) * u, oy + (y1 - pts[i][1]) * u]; });
    const V = this.V, P3 = names.map((n) => V[n]);
    this.cen = [(P3[0][0] + P3[1][0] + P3[2][0]) / 3, (P3[0][1] + P3[1][1] + P3[2][1]) / 3];
    if (o.fill) this.poly = svgEl('polygon', { class: 'u9l1-tri-fill', points: P3.map((p) => p.join(',')).join(' ') }, this.svg);
    this.gS = svgEl('g', {}, this.svg); this.gX = svgEl('g', {}, this.svg);
    this.sides = {};
    for (const [i, j] of [[0, 1], [1, 2], [0, 2]]) {
      const a = names[i], b = names[j], k = a + b, A = V[a], B = V[b], C = V[names[3 - i - j]];
      const g = svgEl('g', { class: 'u9l1-side' }, this.gS); g.style.color = INK;
      g.line = svgEl('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: 'currentColor', 'stroke-width': o.sw, 'stroke-linecap': 'round' }, g);
      const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; let [nx, ny] = nrm(-(B[1] - A[1]), B[0] - A[0]);
      if (nx * (C[0] - mid[0]) + ny * (C[1] - mid[1]) > 0) { nx = -nx; ny = -ny; }
      Object.assign(g, { k, ends: [a, b], mid, out: [nx, ny], L: Math.hypot(B[0] - A[0], B[1] - A[1]) });
      this.sides[k] = g;
    }
    if (o.right) { const r = V[o.right], ot = names.filter((n) => n !== o.right).map((n) => V[n]); this.rmark = rightMark(this.svg, r, ot[0], ot[1], o.rm || 15, { color: INK }); }
    this.vLabs = {};
    if (o.vlab) for (const n of names) { const P = V[n], [nx, ny] = nrm(P[0] - this.cen[0], P[1] - this.cen[1]); this.vLabs[n] = this.hlabel(P[0] + nx * 21, P[1] + ny * 21, T(n), { cls: 'u9l1-v' }); }
    this.tags = {}; this.arcs = {};
    for (const k in o.lens) this.len(k, o.lens[k]);
    if (o.ref) this.arc(o.ref, o.refLab);
  }
  S(k) { return this.sides[k] || this.sides[k[1] + k[0]]; }
  /** the side's display name (preferred spelling from o.sn, else alphabetical) */
  nm(k) { const g = this.S(k), m = (this.o.sn || []).find((s) => this.S(s) === g); return m || g.k.split('').sort().join(''); }
  ext(d, out) { const w = (d.offsetWidth || d.textContent.length * 11 + 10) / 2, hh = (d.offsetHeight || 26) / 2; return Math.abs(out[0]) * w + Math.abs(out[1]) * hh; }
  len(k, html, o = {}) {
    const g = this.S(k); if (g.lenEl) g.lenEl.remove();
    const d = this.hlabel(0, 0, o.raw ? html : T(String(html)), { cls: 'u9l1-len' });
    if (o.color) d.style.color = o.color;
    const off = (o.gap ?? 7) + this.ext(d, g.out);
    place(d, g.mid[0] + g.out[0] * off, g.mid[1] + g.out[1] * off);
    g.lenEl = d; return d;
  }
  roles(ref) {
    const ks = Object.keys(this.sides), r = this.o.right;
    return { hyp: ks.find((k) => !k.includes(r)), opp: ks.find((k) => !k.includes(ref)), adj: ks.find((k) => k.includes(ref) && k.includes(r)) };
  }
  arc(v, label, o = {}) {
    this.unarc(v);
    const P = this.V[v], ot = this.names.filter((n) => n !== v).map((n) => this.V[n]);
    const g = svgEl('g', { class: 'u9l1-arc' }, this.gX); g.style.color = o.color || REF;
    const r = o.r || this.o.arcR;
    angleArc(g, P, ot[0], ot[1], r, { color: 'currentColor', width: 3 });
    const A = { g, lab: null };
    if (label) {
      const a = nrm(ot[0][0] - P[0], ot[0][1] - P[1]), b = nrm(ot[1][0] - P[0], ot[1][1] - P[1]), bis = nrm(a[0] + b[0], a[1] + b[1]);
      const half = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1]))) / 2;
      const d = this.hlabel(0, 0, T(label), { cls: 'u9l1-anglab' }); d.style.color = o.color || REF;
      const w = (d.offsetWidth || 34) / 2 + 2, dist = Math.min(o.max || 120, Math.max(r + 15, w / Math.sin(half) + 2));
      place(d, P[0] + bis[0] * dist, P[1] + bis[1] * dist); A.lab = d;
    }
    this.arcs[v] = A; if (!o.keep) this.ref = v; return A;
  }
  unarc(v) { const A = this.arcs[v]; if (A) { A.g.remove(); if (A.lab) A.lab.remove(); delete this.arcs[v]; } }
  tag(k, role, o = {}) {
    const g = this.S(k); if (this.tags[g.k]) this.tags[g.k].remove();
    const t = this.hlabel(0, 0, o.text || (o.long ? LONG[role] : role), { cls: 'u9l1-tag' }); t.style.color = RC[role];
    const base = g.lenEl ? 7 + this.ext(g.lenEl, g.out) * 2 + 6 : 8;
    const off = base + this.ext(t, g.out) + (o.extra || 0);
    const tw = (t.offsetWidth || 50) / 2 + 2, th = (t.offsetHeight || 24) / 2 + 2;
    place(t, Math.max(tw, Math.min(this.W - tw, g.mid[0] + g.out[0] * off)), Math.max(th, Math.min(this.H - th, g.mid[1] + g.out[1] * off)));
    this.tags[g.k] = t; return t;
  }
  paint(k, role, color) { const g = this.S(k), cc = color || RC[role]; g.style.color = cc; g.classList.toggle('u9l1-hl', !!role); if (g.lenEl) g.lenEl.style.color = role ? cc : ''; }
  unpaint() { for (const k in this.sides) this.paint(k, null, INK); for (const k in this.tags) this.tags[k].remove(); this.tags = {}; }
  /** colour and tag the sides for reference angle ref (animated with c) */
  async mark(c, ref, which = ['hyp', 'opp', 'adj'], o = {}) {
    const R = this.roles(ref);
    for (const role of which) {
      const k = R[role]; this.paint(k, role); const t = this.tag(k, role, o);
      if (c) { t.style.opacity = 0; await anim(c, this.S(k), [{ opacity: 0.3 }, { opacity: 1 }], 260); await pop(c, t, 320); await sleep(c, o.stagger ?? 180); }
    }
    return R;
  }
  /** a dashed pointer from vertex v to the middle of side k */
  pointer(v, k, color) {
    const P = this.V[v], g = this.S(k), [dx, dy] = nrm(g.mid[0] - P[0], g.mid[1] - P[1]), Lx = Math.hypot(g.mid[0] - P[0], g.mid[1] - P[1]);
    const gg = svgEl('g', { class: 'bk-curve' }, this.gX); gg.style.color = color;
    svgEl('path', { class: 'bk-stroke', d: `M${P[0] + dx * 12} ${P[1] + dy * 12}L${P[0] + dx * (Lx - 12)} ${P[1] + dy * (Lx - 12)}`, stroke: 'currentColor', 'stroke-width': 2.5, 'stroke-dasharray': '7 6', fill: 'none' }, gg);
    arrowHead(gg, P[0] + dx * (Lx - 6), P[1] + dy * (Lx - 6), dx, dy, { width: 2.5 });
    return gg;
  }
}

/* ======================================================================================
 * Warm-up: Shadow Height
 * ====================================================================================== */
function mountWarm() {
  const host = document.getElementById('u9l1-wfig'); if (!host) return;
  const W = 960, H = 390, GY = 330, mP = 22, mS = 88;          // ground line; px per metre (flagpole panel, zoomed student panel)
  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, host);
  const txt = (x, y, s, cls, anchor = 'middle') => { const t = svgEl('text', { x, y, class: cls, 'text-anchor': anchor }, svg); t.textContent = s; return t; };
  const PX = 110, TIP = PX + 15 * mP, TOP = GY - 12 * mP;                 // pole foot x, shadow tip x, pole top y
  // ground
  svgEl('rect', { x: 0, y: GY, width: W, height: H - GY, fill: '#d8e8c8' }, svg);
  svgEl('line', { x1: 0, y1: GY, x2: W, y2: GY, stroke: '#1e2d46', 'stroke-width': 2 }, svg);
  // sun on the ray through the pole top
  const dir = nrm(PX - TIP, TOP - GY), SX = TIP + dir[0] * 440, SY = GY + dir[1] * 440;
  svgEl('circle', { cx: SX, cy: SY, r: 22, fill: '#ffd25e', stroke: '#e0a020', 'stroke-width': 3 }, svg);
  for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; svgEl('line', { x1: SX + 29 * Math.cos(a), y1: SY + 29 * Math.sin(a), x2: SX + 38 * Math.cos(a), y2: SY + 38 * Math.sin(a), stroke: '#e0a020', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg); }
  // flagpole, flag and shadow
  svgEl('rect', { x: PX, y: GY, width: TIP - PX, height: 9, fill: '#5a6274', opacity: 0.75 }, svg);
  svgEl('line', { x1: PX, y1: GY, x2: PX, y2: TOP, stroke: '#9aa0ab', 'stroke-width': 7 }, svg);
  svgEl('polygon', { points: `${PX},${TOP + 2} ${PX + 44},${TOP + 13} ${PX},${TOP + 24}`, fill: '#c93a33' }, svg);
  svgEl('circle', { cx: PX, cy: TOP, r: 4, fill: '#1e2d46' }, svg);
  svgEl('line', { x1: TIP, y1: GY, x2: SX + dir[0] * -60, y2: SY + dir[1] * -60, stroke: '#c93a33', 'stroke-width': 2.5, 'stroke-dasharray': '10 7' }, svg);
  txt(PX - 16, (GY + TOP) / 2, '? m', 'u9l1-wt-big', 'end');
  txt((PX + TIP) / 2, GY + 34, 'shadow 15 m', 'u9l1-wt');
  // the zoomed-in student
  const ZX = 560, FX = 640, STIP = FX + 2 * mS, HEAD = GY - 1.6 * mS;
  svgEl('rect', { x: ZX - 20, y: 120, width: 380, height: 258, rx: 12, fill: 'none', stroke: '#9aa0ab', 'stroke-width': 1.5, 'stroke-dasharray': '7 6' }, svg);
  txt(ZX + 350, 144, 'zoomed in', 'u9l1-wt-s', 'end');
  svgEl('rect', { x: FX, y: GY, width: STIP - FX, height: 9, fill: '#5a6274', opacity: 0.75 }, svg);
  const s = 1.6 * mS, pg = svgEl('g', {}, svg);
  svgEl('path', { d: `M${FX - 9} ${GY} L${FX - 4} ${GY - s * 0.47} L${FX + 4} ${GY - s * 0.47} L${FX + 9} ${GY} L${FX + 4} ${GY} L${FX} ${GY - s * 0.38} L${FX - 4} ${GY}Z`, fill: '#a3302a' }, pg);
  svgEl('rect', { x: FX - 12, y: GY - s * 0.8, width: 24, height: s * 0.36, rx: 4, fill: '#c93a33' }, pg);
  svgEl('path', { d: `M${FX - 11} ${GY - s * 0.77} L${FX - 19} ${GY - s * 0.5} M${FX + 11} ${GY - s * 0.77} L${FX + 19} ${GY - s * 0.5}`, stroke: '#c93a33', 'stroke-width': 5, 'stroke-linecap': 'round' }, pg);
  svgEl('circle', { cx: FX, cy: GY - s * 0.895, r: s * 0.1, fill: '#ffe7b0', stroke: '#1e2d46', 'stroke-width': 1.5 }, pg);
  const sd = nrm(FX - STIP, HEAD - GY);
  svgEl('line', { x1: STIP, y1: GY, x2: FX + sd[0] * 40, y2: HEAD + sd[1] * 40, stroke: '#c93a33', 'stroke-width': 2.5, 'stroke-dasharray': '10 7' }, svg);
  svgEl('line', { x1: FX - 40, y1: GY, x2: FX - 40, y2: HEAD, stroke: '#1e2d46', 'stroke-width': 2 }, svg);
  arrowHead(svg, FX - 40, HEAD, 0, -1, { color: '#1e2d46', width: 2 }); arrowHead(svg, FX - 40, GY, 0, 1, { color: '#1e2d46', width: 2 });
  txt(FX - 50, (GY + HEAD) / 2 + 7, '1.6 m', 'u9l1-wt', 'end');
  txt((FX + STIP) / 2, GY + 34, 'shadow 2 m', 'u9l1-wt');
  txt(430, 92, 'sun rays are parallel', 'u9l1-wt-s');
  // θ at both shadow tips
  const thArc = (x, x2, y2) => { angleArc(svg, [x, GY], [x - 100, GY], [x2, y2], 46, { color: '#c93a33', width: 2.5 }); };
  thArc(TIP, PX, TOP); thArc(STIP, FX, HEAD);
  const th1 = txt(TIP - 64, GY - 10, 'θ', 'u9l1-wt-r'), th2 = txt(STIP - 64, GY - 10, 'θ', 'u9l1-wt-r');
  // overlays (buttons)
  const ov = svgEl('g', {}, svg), grow = svgEl('g', {}, svg);
  const c = liveCtx();
  let busy = false;
  const tris = () => {
    ov.innerHTML = '';
    const T1 = [[PX, GY], [PX, TOP], [TIP, GY]], T2 = [[FX, GY], [FX, HEAD], [STIP, GY]];
    for (const [A, B, Cc] of [T1, T2]) {
      svgEl('polygon', { points: [A, B, Cc].map((p) => p.join(',')).join(' '), fill: '#1f5bd6', 'fill-opacity': 0.07 }, ov);
      svgEl('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: OPP, 'stroke-width': 5, 'stroke-linecap': 'round' }, ov);
      svgEl('line', { x1: A[0], y1: A[1] - 1, x2: Cc[0], y2: Cc[1] - 1, stroke: ADJ, 'stroke-width': 5, 'stroke-linecap': 'round' }, ov);
      svgEl('line', { x1: B[0], y1: B[1], x2: Cc[0], y2: Cc[1], stroke: HYP, 'stroke-width': 4, 'stroke-linecap': 'round' }, ov);
      rightMark(ov, A, B, Cc, 13, { color: INK });
    }
    const t1 = svgEl('text', { x: (PX + TIP) / 2 + 30, y: (GY + TOP) / 2 - 18, class: 'u9l1-wt', fill: HYP }, ov); t1.textContent = 'sun ray'; t1.style.fill = HYP;
    th1.style.opacity = th2.style.opacity = 1;
    appear(c, ov, 500);
  };
  document.getElementById('u9l1-wtri').onclick = () => { if (!busy) tris(); };
  document.getElementById('u9l1-wgrow').onclick = async () => {
    if (busy) return; busy = true; grow.innerHTML = '';
    const v1 = [-2 * mP, 0], v2 = [-2 * mP, -1.6 * mP];
    const poly = svgEl('polygon', { fill: '#7b4fc4', 'fill-opacity': 0.22, stroke: OPP, 'stroke-width': 3 }, grow);
    const lab = svgEl('text', { x: 300, y: 54, class: 'u9l1-wt', 'text-anchor': 'middle' }, grow);
    const set = (k) => {
      poly.setAttribute('points', [[TIP, GY], [TIP + v1[0] * k, GY], [TIP + v2[0] * k, GY + v2[1] * k]].map((p) => p.join(',')).join(' '));
      lab.textContent = `×${k.toFixed(2).replace(/\.?0+$/, '')}   shadow ${(2 * k).toFixed(1).replace(/\.0$/, '')} m   height ${(1.6 * k).toFixed(2).replace(/\.?0+$/, '')} m`;
    };
    set(1); await sleep(c, 500);
    await tween(c, 2600, (t) => set(1 + 6.5 * t));
    busy = false;
  };
  document.getElementById('u9l1-wreset').onclick = () => { if (busy) return; ov.innerHTML = ''; grow.innerHTML = ''; };
}

/* ======================================================================================
 * Static figures
 * ====================================================================================== */
function ex1Fig() {
  const host = document.getElementById('u9l1-ex1fig'); if (!host) return;
  const W = 560, H = 384, u = 40, OX = 30, OY = 318;
  const B = new Box(host, {}, 'u9l1-ex1b', W, H);
  const P = (x, y) => [OX + x * u, OY - y * u];
  const seg = (a, b, w) => svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: INK, 'stroke-width': w, 'stroke-linecap': 'round' }, B.svg);
  svgEl('polygon', { points: [P(0, 0), P(12, 0), P(12, 7.2)].map((p) => p.join(',')).join(' '), fill: '#f2f6fb' }, B.svg);
  seg(P(0, 0), P(12, 0), 3.2); seg(P(0, 0), P(12, 7.2), 3.2); seg(P(12, 0), P(12, 7.2), 3.2);
  for (let i = 1; i <= 3; i++) seg(P(3 * i, 0), P(3 * i, 1.8 * i), 2);
  rightMark(B.svg, P(12, 0), P(0, 0), P(12, 7.2), 13, { color: INK });
  angleArc(B.svg, P(0, 0), P(12, 0), P(12, 7.2), 30, { color: REF, width: 2.5 });
  const lab = (pt, html, cls = 'u9l1-len', pos = 'c') => B.hlabel(pt[0], pt[1], T(html), { cls, pos, gap: 4 });
  lab([OX + 64, OY - 15], '31^\\circ', 'u9l1-anglab');
  lab([OX, OY + 17], 'O', 'u9l1-v');
  for (let i = 1; i <= 4; i++) {
    lab([OX + 3 * i * u, OY + 17], `A_${i}`, 'u9l1-v');
    lab([OX + (3 * i - 1.5) * u, OY + 48], `OA_${i}=${3 * i}`);
    lab(P(3 * i + 0.12, 0.9 * i), String(+(1.8 * i).toFixed(1)), 'u9l1-len', 'e');
  }
  for (let i = 1; i <= 3; i++) lab(P(3 * i - 0.42, 1.8 * i + 0.32), `B_${i}`, 'u9l1-v');
  lab(P(12.42, 7.45), 'B_4', 'u9l1-v');
}

function mountFigs() {
  ex1Fig();
  const fig = (id, o) => { const el = document.getElementById(id); return el ? new Tri(el, o) : null; };
  const X = fig('u9l1-xyzfig', { width: 330, height: 230, pad: [38, 76, 38, 34], P: { X: [0, 0], Y: [4, 0], Z: [4, 2.6] }, right: 'Y', ref: 'X', refLab: 'x^\\circ', arcR: 34 });
  if (X) X.mark(null, 'X');
  fig('u9l1-ex2a', { width: 340, height: 250, pad: 44, P: { K: [0, 0], L: [0, 3], M: [4, 0] }, right: 'K', ref: 'M', refLab: 'x^\\circ', arcR: 34 });
  fig('u9l1-ex2b', { width: 340, height: 250, pad: 40, P: { S: [0, 0], T: [3.4, 0.85], U: [-0.68, 2.72] }, right: 'S', ref: 'T', refLab: 'x^\\circ', arcR: 34 });
  fig('u9l1-ex3fig', { width: 400, height: 320, pad: 48, P: { Q: [0, 0], R: [3.6, 0], P: [0, 2.7] }, right: 'Q', ref: 'R', arcR: 38, lens: { PQ: 9, QR: 12, PR: 15 } });
  fig('u9l1-ex4fig', { width: 400, height: 260, pad: 46, P: { N: [0, 0], M: [0, 2.8], L: [5.25, 0] }, right: 'N', ref: 'L', refLab: 'x^\\circ', arcR: 42, lens: { NM: 8, NL: 15 } });
  fig('u9l1-ex5a', { width: 440, height: 230, pad: 46, P: { C: [0, 0], A: [3.6, 0], B: [0, 1.5] }, right: 'C', ref: 'A', arcR: 46, lens: { CA: 12, CB: 5, AB: 13 } });
  fig('u9l1-ex5b', { width: 230, height: 330, pad: 46, P: { Y: [0, 0], Z: [1.05, 0], X: [0, 3.6] }, right: 'Y', ref: 'Z', arcR: 24, lens: { YZ: 7, XY: 24, XZ: 25 } });
}

/* ======================================================================================
 * Tap the side (a game for the board)
 * ====================================================================================== */
function mountGame() {
  const host = document.getElementById('u9l1-game'); if (!host) return;
  const figWrap = h('div'), side = h('div', 'u9l1-gside');
  host.append(figWrap, side);
  side.innerHTML = '<div class="u9l1-prompt"></div><div class="u9l1-fb"></div><div class="u9l1-gbtns"><button class="pill" type="button" data-g="new">New triangle</button><button class="pill" type="button" data-g="all">Show all three</button></div><div class="u9l1-score"></div>';
  const promptEl = side.querySelector('.u9l1-prompt'), fb = side.querySelector('.u9l1-fb'), score = side.querySelector('.u9l1-score');
  const c = liveCtx(), ORDER = ['hyp', 'opp', 'adj'], LET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let tri, R, ref, step = 0, done = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const say = (html, cls = '') => { fb.className = 'u9l1-fb ' + cls; fb.innerHTML = html; };
  const ask = () => { promptEl.innerHTML = step < 3 ? `Tap the ${RB(ORDER[step], LONG[ORDER[step]])}.` : 'All three! ✓'; score.textContent = done ? `Triangles finished: ${done}` : ''; };
  function newTri() {
    figWrap.innerHTML = ''; step = 0; say('');
    const L = LET.split('').sort(() => Math.random() - 0.5).slice(0, 3), [r, p, q] = L;
    let a = rnd(2, 5), b = rnd(1.6, 4.4); if (a / b > 2.6 || b / a > 2.6) b = a * rnd(0.5, 1.4);
    tri = new Tri(figWrap, { width: 560, height: 380, pad: 64, P: { [r]: [0, 0], [p]: [a, 0], [q]: [0, b] }, right: r, rot: rnd(0, 360), flip: Math.random() < 0.5, arcR: 34 });
    ref = Math.random() < 0.5 ? p : q; tri.arc(ref, 'x^\\circ');
    R = tri.roles(ref);
    for (const k in tri.sides) {
      const g = tri.sides[k], [A, B] = g.ends.map((n) => tri.V[n]);
      const hit = svgEl('line', { class: 'u9l1-hit', x1: A[0], y1: A[1], x2: B[0], y2: B[1], 'data-tap': '', role: 'button', 'aria-label': 'side ' + k }, tri.svg);
      hit.addEventListener('click', () => pick(k));
    }
    ask();
  }
  function pick(k) {
    if (step >= 3) return;
    const want = ORDER[step], got = Object.keys(R).find((x) => R[x] === k);
    if (got === want) {
      tri.paint(k, want); pop(c, tri.tag(k, want));
      say(`Yes: ${T(tri.nm(k))} is the ${RB(want, LONG[want])}.`, 'ok');
      step++; if (step === 3) done++; ask();
      return;
    }
    if (ORDER.indexOf(got) < step) { say(`${T(tri.nm(k))} is already labelled: it’s the ${RB(got)}.`, 'no'); shake(c, promptEl); return; }
    const hint = want === 'hyp' ? 'The hypotenuse is <b>across from the little square</b> (the right angle).'
      : want === 'opp' ? (got === 'adj' ? `That side <b>touches</b> ${T('x^\\circ')}. The opposite side does <b>not</b> touch it.` : 'Look across from the angle.')
        : 'The adjacent side touches the angle.';
    const g = tri.S(k); g.style.color = COLORS.red; setTimeout(() => { if (!g.classList.contains('u9l1-hl')) g.style.color = INK; }, 700);
    say(`Not that one. ${hint}`, 'no'); shake(c, promptEl);
  }
  side.querySelector('[data-g="new"]').onclick = newTri;
  side.querySelector('[data-g="all"]').onclick = () => { tri.unpaint(); tri.mark(null, ref); step = 3; say(`hyp ${T('=' + tri.nm(R.hyp))}, opp ${T('=' + tri.nm(R.opp))}, adj ${T('=' + tri.nm(R.adj))}`); ask(); };
  newTri();
}

/* ======================================================================================
 * Explainer: why (same angle → similar → the scale factor cancels)
 * ====================================================================================== */
const WHY = {
  t13: { label: 'Example 1: triangles 1 and 3', i: 1, j: 3 },
  t24: { label: 'Example 1: triangles 2 and 4', i: 2, j: 4 }
};
const why = {
  title: 'Same angle, similar triangles, same ratio',
  height: 400,
  choices: Object.keys(WHY).map((k) => ({ v: k, label: WHY[k].label })),
  intro: 'Two triangles from Example 1. Why must their ratios agree? Press <b>Next</b>.',
  make(stage, key, ex) {
    const { i, j } = WHY[key], k = j / i, aS = 3 * i, oS = +(1.8 * i).toFixed(1), aB = 3 * j, oB = +(1.8 * j).toFixed(1);
    const u = 320 / aB, OY = 316, sX = 36, bX = 262, pad = [40, 70, 60, 40];
    const mk = (x, a, o, n) => new Tri(stage, { x: x - pad[3], y: OY - o * u - pad[0], width: a * u + pad[1] + pad[3], height: o * u + pad[0] + pad[2], pad, unit: u, fill: true,
      P: { O: [0, 0], A: [a, 0], B: [a, o] }, right: 'A', vlab: false, lens: { OA: a, AB: o }, ref: 'O', refLab: '31^\\circ', arcR: 28 });
    const sm = mk(sX, aS, oS, i), bg = mk(bX, aB, oB, j);
    const vl = (t, n) => { t.oLab = t.hlabel(t.V.O[0] - 4, t.V.O[1] + 20, T('O'), { cls: 'u9l1-v' }); t.hlabel(t.V.A[0] + 6, t.V.A[1] + 20, T(`A_${n}`), { cls: 'u9l1-v' }); t.hlabel(t.V.B[0] - 6, t.V.B[1] - 18, T(`B_${n}`), { cls: 'u9l1-v' }); };
    vl(sm, i); vl(bg, j); bg.len('OA', aB, { gap: 34 });
    const P = panel(stage, 650, 10, ex.W - 660, 380, 'Why the ratio is fixed');
    const dx = bX - sX;
    return [
      { cap: `Two right triangles from Example 1, ${T(`\\triangle OA_${i}B_${i}`)} and ${T(`\\triangle OA_${j}B_${j}`)}. Each has a right angle and a ${T('31^\\circ')} angle.`,
        run: async (c) => { await Promise.all([pulse(c, sm.arcs.O.lab, 1.3), pulse(c, bg.arcs.O.lab, 1.3)]); } },
      { cap: `The third angle must be ${T('180^\\circ-90^\\circ-31^\\circ=59^\\circ')} in both. Same three angles: the triangles are <b>similar</b>, the same shape in two sizes.`,
        run: async (c) => {
          const a1 = sm.arc('B', '59^\\circ', { keep: true, color: COLORS.teal, r: 24 }), a2 = bg.arc('B', '59^\\circ', { keep: true, color: COLORS.teal, r: 24 });
          await Promise.all([pop(c, a1.lab), pop(c, a2.lab)]);
          await show(c, line(P, T('90^\\circ,\\ 31^\\circ,\\ 59^\\circ') + ' in both'));
        } },
      { cap: `Slide the small one into the corner of the big one. It fits exactly: its slanted side lies along the big one’s.`,
        run: async (c) => {
          const extra = [sm.S('OA').lenEl, sm.arcs.O.g, sm.arcs.O.lab, sm.oLab];
          await Promise.all(extra.map((e) => anim(c, e, [{ opacity: 1 }, { opacity: 0 }], 300)));
          await anim(c, sm.el, [{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], 1300);
        } },
      { cap: `Scale factor: ${T(`${aB}\\div${aS}=${k}`)}. <b>Every</b> side of the big triangle is ${k} times as long: ${T(`${oS}\\times${k}=${oB}`)} and ${T(`${aS}\\times${k}=${aB}`)}.`,
        run: async (c) => { await show(c, line(P, `scale factor ${T(`k=\\frac{${aB}}{${aS}}=${k}`)}`)); await show(c, line(P, T(`${oB}=${k}\\times${oS},\\ \\ ${aB}=${k}\\times${aS}`), 'u9l1-sm')); } },
      { cap: `So in the big triangle, ${T(`\\dfrac{${oB}}{${aB}}=\\dfrac{${k}\\times${oS}}{${k}\\times${aS}}`)}. The ${k}s <b>cancel</b>, leaving the small triangle’s ratio, ${T(`\\dfrac{${oS}}{${aS}}=0.6`)}.`,
        run: async (c) => { await show(c, line(P, T(`\\dfrac{${oB}}{${aB}}=\\dfrac{\\cancel{${k}}\\times${oS}}{\\cancel{${k}}\\times${aS}}`))); await show(c, line(P, T(`=\\dfrac{${oS}}{${aS}}=0.6`))); } },
      { cap: `Any scale factor ${T('k')} cancels the same way: ${T('\\dfrac{k\\cdot\\text{opp}}{k\\cdot\\text{adj}}=\\dfrac{\\text{opp}}{\\text{adj}}')}. The ratio depends <b>only on the angle</b>.`,
        run: async (c) => {
          await show(c, line(P, T(`\\dfrac{k\\cdot${ctxt('opp')}}{k\\cdot${ctxt('adj')}}=\\dfrac{${ctxt('opp')}}{${ctxt('adj')}}`), 'u9l1-big'));
          const s = stamp(P, 'size doesn’t matter', { ok: true, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = 'auto'; await stampIn(c, s);
        } }
    ];
  }
};

/* ======================================================================================
 * Explainer: grow (the star)
 * ====================================================================================== */
const GROW = {
  ex1: { label: 'Example 1 check: 31°', adj: 3, opp: 1.8, a: '31^\\circ', b: '59^\\circ', ks: [2, 3, 4], th2: 46, ex1: true },
  d345: { label: 'Demo: a 3-4-5 triangle', adj: 4, opp: 3, a: '\\theta', b: '\\beta', ks: [2, 3, 4], th2: 52 },
  d815: { label: 'Demo: a steep 8-15-17', adj: 8, opp: 15, a: '\\theta', b: '\\beta', ks: [2, 3], th2: 45 }
};
const fmtL = (v) => (Math.abs(v * 100 - Math.round(v * 100)) < 1e-6 ? String(+v.toFixed(2)) : v.toFixed(2));
const grow = {
  title: 'Grow the triangle: the ratios stay put',
  height: 520,
  choices: Object.keys(GROW).map((k) => ({ v: k, label: GROW[k].label })),
  intro: 'One right triangle, three ratios of its sides. What happens to them when the triangle grows? Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = GROW[key], th0 = Math.atan(d.opp / d.adj), th2 = (d.th2 * Math.PI) / 180, kmax = Math.max(...d.ks);
    const deg0 = ((th0 * 180) / Math.PI).toFixed(1), hyp0 = Math.hypot(d.opp, d.adj);
    const OX = 60, OY = 446, u = Math.min((440 - OX) / (d.adj * kmax), (OY - 60) / (d.opp * kmax));
    const st = { k: 1, ang: th0, ref: 'O' };
    const svg = svgEl('svg', { width: 545, height: 520, class: 'bk-svg' }, stage);
    const gGh = svgEl('g', {}, svg), poly = svgEl('polygon', { class: 'u9l1-tri-fill' }, svg);
    const ln = { base: null, vert: null, hyp: null };
    for (const k in ln) ln[k] = svgEl('line', { stroke: INK, 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
    const rm = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 2 }, svg), gArc = svgEl('g', {}, svg);
    const L = (cls, html) => { const e = h('div', cls, html); stage.appendChild(e); return e; };
    const vO = L('u9l1-v', T('O')), vA = L('u9l1-v', T('A')), vB = L('u9l1-v', T('B'));
    const angLab = L('u9l1-anglab', T(d.a)), gl = { base: L('u9l1-gl', ''), vert: L('u9l1-gl', ''), hyp: L('u9l1-gl', '') };
    const geo = () => { const a = d.adj * st.k, o = a * Math.tan(st.ang), hy = a / Math.cos(st.ang); return { a, o, hy, O: [OX, OY], A: [OX + a * u, OY], B: [OX + a * u, OY - o * u] }; };
    const roleOf = () => (st.ref === 'O' ? { base: 'adj', vert: 'opp', hyp: 'hyp' } : { base: 'opp', vert: 'adj', hyp: 'hyp' });
    // readout panel
    const P = panel(stage, 548, 10, ex.W - 558, 500, '');
    const head = h('div', 'u9l1-rhead', `<div>angle at ${T('O')}: <b class="u9l1-hang">${T(d.ex1 ? '31^\\circ' : `\\theta\\approx${deg0}^\\circ`)}</b></div><div>size <b class="u9l1-k">×1</b></div>`); P.appendChild(head);
    const kEl = head.querySelector('.u9l1-k'), angEl = head.querySelector('.u9l1-hang');
    const ROWS = [['opp', 'hyp', 'sin'], ['adj', 'hyp', 'cos'], ['opp', 'adj', 'tan']];
    const rows = ROWS.map(([n, m]) => {
      const r = h('div', 'u9l1-rrow', `<div class="u9l1-rname"></div><div class="u9l1-rlab">${RB(n)} ÷ ${RB(m)}</div><div class="u9l1-fr"><div class="u9l1-nu"></div><div class="u9l1-de"></div></div><div class="u9l1-rval"></div>`);
      P.appendChild(hide0(r)); return r;
    });
    const note = h('div', 'u9l1-note', ''); P.appendChild(note);
    const draw = () => {
      const g = geo(), R = roleOf(), len = { base: g.a, vert: g.o, hyp: g.hy };
      poly.setAttribute('points', [g.O, g.A, g.B].map((p) => p.join(',')).join(' '));
      const seg = { base: [g.O, g.A], vert: [g.A, g.B], hyp: [g.O, g.B] };
      for (const k in ln) { const [p, q] = seg[k]; ln[k].setAttribute('x1', p[0]); ln[k].setAttribute('y1', p[1]); ln[k].setAttribute('x2', q[0]); ln[k].setAttribute('y2', q[1]); ln[k].setAttribute('stroke', RC[R[k]]); }
      rm.setAttribute('d', `M${g.A[0] - 14} ${g.A[1]}L${g.A[0] - 14} ${g.A[1] - 14}L${g.A[0]} ${g.A[1] - 14}`);
      gArc.innerHTML = '';
      const V = st.ref === 'O' ? g.O : g.B, p1 = st.ref === 'O' ? g.A : g.A, p2 = st.ref === 'O' ? g.B : g.O;
      const r = Math.min(34, 0.42 * Math.min(g.a, g.o) * u + 8);
      angleArc(gArc, V, p1, p2, r, { color: REF, width: 3 });
      const a1 = nrm(p1[0] - V[0], p1[1] - V[1]), a2 = nrm(p2[0] - V[0], p2[1] - V[1]), bis = nrm(a1[0] + a2[0], a1[1] + a2[1]);
      const half = Math.acos(a1[0] * a2[0] + a1[1] * a2[1]) / 2, w = (angLab.offsetWidth || 40) / 2 + 2, dist = Math.min(110, Math.max(r + 16, w / Math.sin(half) + 2));
      place(angLab, V[0] + bis[0] * dist, V[1] + bis[1] * dist);
      place(vO, g.O[0] - 14, g.O[1] + 16); place(vA, g.A[0] + 14, g.A[1] + 16); place(vB, g.B[0] + 6, g.B[1] - 18);
      for (const k in gl) gl[k].innerHTML = `<b style="color:${RC[R[k]]}">${R[k]}</b> <span class="u9l1-gv" style="color:${RC[R[k]]}">${k === 'hyp' && !(Math.abs(g.hy * 100 - Math.round(g.hy * 100)) < 1e-6) ? '≈' : ''}${fmtL(len[k])}</span>`;
      place(gl.base, (g.O[0] + g.A[0]) / 2, OY + 44);
      place(gl.vert, g.A[0] + 12, (g.A[1] + g.B[1]) / 2, 'e', 0);
      const hn = nrm(-(g.B[1] - g.O[1]), g.B[0] - g.O[0]); // up-left normal of OB
      const hm = [(g.O[0] + g.B[0]) / 2, (g.O[1] + g.B[1]) / 2], hw = (gl.hyp.offsetWidth || 90) / 2, hh = (gl.hyp.offsetHeight || 26) / 2;
      const off = 10 + Math.abs(hn[0]) * hw + Math.abs(hn[1]) * hh;
      place(gl.hyp, Math.max(hw + 2, hm[0] + hn[0] * off), Math.max(hh + 2, hm[1] + hn[1] * off));
      // readouts
      const sideOf = { opp: R.base === 'opp' ? g.a : g.o, adj: R.base === 'adj' ? g.a : g.o, hyp: g.hy };
      ROWS.forEach(([n, m], i) => {
        rows[i].querySelector('.u9l1-nu').textContent = fmtL(sideOf[n]); rows[i].querySelector('.u9l1-de').textContent = fmtL(sideOf[m]);
        rows[i].querySelector('.u9l1-nu').style.color = RC[n]; rows[i].querySelector('.u9l1-de').style.color = RC[m];
        rows[i].querySelector('.u9l1-rval').textContent = '= ' + (sideOf[n] / sideOf[m]).toFixed(3);
      });
      kEl.textContent = '×' + (+st.k.toFixed(2));
    };
    const ghost = () => { const g = geo(); svgEl('polygon', { points: [g.O, g.A, g.B].map((p) => p.join(',')).join(' '), fill: 'none', stroke: '#9aa0ab', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, gGh); };
    const mood = (cls) => rows.forEach((r) => { r.classList.remove('u9l1-same', 'u9l1-diff'); if (cls) r.classList.add(cls); });
    const toK = async (c, k, ms = 1500) => { const k0 = st.k; await tween(c, ms, (t) => { st.k = k0 + (k - k0) * t; draw(); }); st.k = k; draw(); };
    const toAng = async (c, a, ms = 1500) => { const a0 = st.ang; await tween(c, ms, (t) => { st.ang = a0 + (a - a0) * t; draw(); }); st.ang = a; draw(); };
    const vis = [svg, vO, vA, vB, angLab, gl.base, gl.vert, gl.hyp];
    vis.forEach(hide0); draw();
    const r3 = (v) => v.toFixed(3), sinv = d.opp / hyp0, cosv = d.adj / hyp0, tanv = d.opp / d.adj;
    const growStep = (k) => ({
      cap: `Grow it to <b>${k} times</b> the size. Every side is multiplied by ${k}${d.ex1 ? `: opp ÷ adj ${T(`=\\frac{${fmtL(d.opp * k)}}{${fmtL(d.adj * k)}}=0.6`)}` : ''}. The three ratios <b>don’t change</b>.`,
      run: async (c) => { mood(null); note.textContent = ''; await toK(c, k); ghost(); mood('u9l1-same'); note.textContent = 'every ratio unchanged ✓'; await pop(c, note); }
    });
    return [
      { cap: `A right triangle with a ${T(d.a)} angle at ${T('O')}${d.ex1 ? '' : ` (${T(`\\theta\\approx${deg0}^\\circ`)})`}. From that angle: the side across from it is the ${RB('opp', 'opposite')}, the side beside it is the ${RB('adj', 'adjacent')}, and the longest side is the ${RB('hyp', 'hypotenuse')}.`,
        run: async (c) => { await appear(c, svg, 500); for (const e of [vO, vA, vB, angLab]) appear(c, e, 300); for (const e of [gl.vert, gl.base, gl.hyp]) await pop(c, e, 320); } },
      { cap: `Compare the sides by <b>dividing</b> one by another: opp ÷ hyp, adj ÷ hyp and opp ÷ adj.`,
        run: async (c) => { for (const r of rows) await show(c, r); } },
      ...d.ks.map(growStep),
      { cap: `Shrink it to <b>half</b> the original size. Still exactly the same three ratios.`,
        run: async (c) => { mood(null); note.textContent = ''; await toK(c, 0.5, 1700); mood('u9l1-same'); note.textContent = 'every ratio unchanged ✓'; await pop(c, note); } },
      { cap: `Now keep the size and change the <b>angle</b> to ${T(d.th2 + '^\\circ')}. This time every ratio <b>changes</b>.`,
        run: async (c) => {
          mood(null); note.textContent = ''; await toK(c, 2, 900); await appear(c, gGh, 1); await anim(c, gGh, [{ opacity: 1 }, { opacity: 0 }], 300);
          angLab.innerHTML = T(d.th2 + '^\\circ'); angEl.innerHTML = T(d.th2 + '^\\circ'); await toAng(c, th2, 1600); mood('u9l1-diff'); note.textContent = 'new angle, new ratios'; note.style.color = COLORS.red; await pop(c, note);
        } },
      { cap: `Back to ${T(d.a)}: the ratios come back. Each ratio depends <b>only on the angle</b>, never on the size.`,
        run: async (c) => {
          mood(null); note.textContent = ''; note.style.color = ''; await toAng(c, th0, 1400); angLab.innerHTML = T(d.a); angEl.innerHTML = T(d.ex1 ? '31^\\circ' : `\\theta\\approx${deg0}^\\circ`);
          await anim(c, gGh, [{ opacity: 0 }, { opacity: 1 }], 400); mood('u9l1-same'); note.textContent = 'same angle, same ratios ✓'; await pop(c, note);
        } },
      { cap: d.ex1 ? `Because they depend only on the angle, the ratios get names: the <b>sine</b>, <b>cosine</b> and <b>tangent</b> of ${T('31^\\circ')}. Example 1’s ratio, opp ÷ adj ${T('=0.6')}, is ${T('\\tan31^\\circ')}, and the calculator gives ${T('\\tan31^\\circ\\approx0.601')}.`
        : `Because they depend only on the angle, the ratios get names: ${T('\\sin\\theta')}, ${T('\\cos\\theta')} and ${T('\\tan\\theta')}, the <b>sine</b>, <b>cosine</b> and <b>tangent</b> of the angle.`,
        run: async (c) => {
          mood(null);
          for (let i = 0; i < 3; i++) { const n = rows[i].querySelector('.u9l1-rname'); n.textContent = ROWS[i][2]; await pop(c, n, 300); }
          note.textContent = '';
          if (d.ex1) { const s = stamp(P, 'tan 31° ≈ 0.601', { ok: true, size: 'sm' }); s.style.alignSelf = 'center'; await stampIn(c, s); }
        } },
      { cap: `Now make the <b>other</b> acute angle, at ${T('B')}, the reference angle. The ${RB('hyp')} stays put, but ${RB('opp')} and ${RB('adj')} <b>swap</b> sides.`,
        run: async (c) => {
          await anim(c, gArc, [{ opacity: 1 }, { opacity: 0 }], 250); await anim(c, angLab, [{ opacity: 1 }, { opacity: 0 }], 200);
          st.ref = 'B'; angLab.innerHTML = T(d.b); angEl.parentElement.innerHTML = `angle at ${T('B')}: <b class="u9l1-hang">${T(d.ex1 ? '59^\\circ' : `\\beta\\approx${(90 - deg0).toFixed(1)}^\\circ`)}</b>`; draw();
          await appear(c, gArc, 300); await pop(c, angLab);
          await Promise.all([pop(c, gl.base), pop(c, gl.vert)]); mood('u9l1-diff');
        } },
      { cap: `From ${T('B')}: opp ÷ hyp ${T(`\\approx${r3(cosv)}`)} (it was adj ÷ hyp), adj ÷ hyp ${T(`\\approx${r3(sinv)}`)}, and opp ÷ adj ${T(`\\approx${r3(1 / tanv)}`)}, the old ${T(`${r3(tanv)}`)} turned upside down. Opposite and adjacent always depend on the angle you use.`,
        run: async (c) => { for (const r of rows) await pulse(c, r, 1.04, 380); note.style.color = ''; note.textContent = 'sin and cos traded values; tan flipped'; await pop(c, note); } }
    ];
  }
};

/* ======================================================================================
 * Explainer: name (the labelling routine)
 * ====================================================================================== */
const NAMES = {
  xyz: { label: 'Notes: triangle XYZ', P: { X: [0, 0], Y: [4, 0], Z: [4, 2.6] }, right: 'Y', ref: 'X', alt: 'Z' },
  ex2a: { label: 'Example 2(a) check', P: { K: [0, 0], L: [0, 3], M: [4, 0] }, right: 'K', ref: 'M', ex: '2(a)' },
  ex2b: { label: 'Example 2(b) check', P: { S: [0, 0], T: [3.4, 0.85], U: [-0.68, 2.72] }, right: 'S', ref: 'T', ex: '2(b)' }
};
const name = {
  title: 'The labelling routine: hyp, then opp, then adj',
  height: 430,
  choices: Object.keys(NAMES).map((k) => ({ v: k, label: NAMES[k].label })),
  intro: 'Three steps, in the same order every time. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = NAMES[key];
    const t = new Tri(stage, { x: 10, y: 8, width: 520, height: 414, pad: 70, P: d.P, right: d.right, ref: d.ref, refLab: 'x^\\circ', arcR: 40 });
    const R = t.roles(d.ref), nm = (k) => T(t.nm(k));
    const P = panel(stage, 545, 10, ex.W - 555, 410, 'Labelling routine');
    const steps = ['<b>1.</b> hyp: across from the right angle', '<b>2.</b> opp: does <b>not</b> touch the angle', '<b>3.</b> adj: <b>touches</b> the angle'].map((s) => { const e = h('div', 'u9l1-step', s); P.appendChild(e); return e; });
    const res = h('div', ''); P.appendChild(res); res.style.marginTop = '8px';
    const resL = {};
    const on = (i) => steps.forEach((e, j) => { e.classList.toggle('on', j === i); if (j < i) e.classList.add('done'); });
    let ptr = null;
    const out = [
      { cap: `<b>1.</b> Find the right angle, at ${T(d.right)}. The side <b>across</b> from it is the ${RB('hyp', 'hypotenuse')}: ${nm(R.hyp)}. It is always the longest side.`,
        run: async (c) => {
          on(0); t.rmark.setAttribute('stroke', HYP); t.rmark.setAttribute('stroke-width', 3.5);
          ptr = t.pointer(d.right, R.hyp, HYP); await t.drawIn(ptr, 600, c);
          await t.mark(c, d.ref, ['hyp']); resL.hyp = line(res, `${RB('hyp')} ${T('=')} ${nm(R.hyp)}`, 'u9l1-big'); await show(c, resL.hyp);
        } },
      { cap: `<b>2.</b> The ${RB('opp', 'opposite')} side does <b>not touch</b> the reference angle ${T('x^\\circ')}: ${nm(R.opp)}.`,
        run: async (c) => {
          on(1); ptr.remove(); t.rmark.setAttribute('stroke', INK); t.rmark.setAttribute('stroke-width', 2);
          ptr = t.pointer(d.ref, R.opp, OPP); await t.drawIn(ptr, 600, c);
          await t.mark(c, d.ref, ['opp']); resL.opp = line(res, `${RB('opp')} ${T('=')} ${nm(R.opp)}`, 'u9l1-big'); await show(c, resL.opp);
        } },
      { cap: `<b>3.</b> The ${RB('adj', 'adjacent')} side <b>touches</b> ${T('x^\\circ')} and is not the hypotenuse: ${nm(R.adj)}.`,
        run: async (c) => {
          on(2); ptr.remove(); ptr = null;
          await pulse(c, t.arcs[d.ref].lab, 1.35);
          await t.mark(c, d.ref, ['adj']); resL.adj = line(res, `${RB('adj')} ${T('=')} ${nm(R.adj)}`, 'u9l1-big'); await show(c, resL.adj);
          on(3);
        } }
    ];
    if (d.alt) {
      const R2 = t.roles(d.alt);
      out.push(
        { cap: `Switch the reference angle to ${T('\\angle XZY')}. The hypotenuse doesn’t move, but ${RB('opp')} and ${RB('adj')} <b>swap</b>: now opp ${T('=' + t.nm(R2.opp))} and adj ${T('=' + t.nm(R2.adj))}.`,
          run: async (c) => {
            t.unarc(d.ref); t.unpaint(); t.paint(R2.hyp, 'hyp'); t.tag(R2.hyp, 'hyp');
            const A = t.arc(d.alt, null, { r: 40 }); await appear(c, A.g, 400);
            await t.mark(c, d.alt, ['opp', 'adj']);
            resL.opp.innerHTML = `${RB('opp')} ${T('=')} ${nm(R2.opp)}`; resL.adj.innerHTML = `${RB('adj')} ${T('=')} ${nm(R2.adj)}`;
            await Promise.all([pulse(c, resL.opp, 1.12), pulse(c, resL.adj, 1.12)]);
          } },
        { cap: `Opposite and adjacent are always named <b>relative to</b> the angle being used. The hypotenuse is the same side from either acute angle.`,
          run: async (c) => { const s = stamp(P, 'hyp never moves', { ok: true, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = 'auto'; await stampIn(c, s); } });
    } else {
      out.push({ cap: `Example ${d.ex}: hyp ${T('=' + t.nm(R.hyp))}, opp ${T('=' + t.nm(R.opp))}, adj ${T('=' + t.nm(R.adj))}.`,
        run: async (c) => { const s = stamp(P, '✓ Example ' + d.ex, { ok: true, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = 'auto'; await stampIn(c, s); } });
    }
    return out;
  }
};

/* ======================================================================================
 * Explainer: soh (SOH CAH TOA)
 * ====================================================================================== */
/** fly a copy of `from` (anything on the page) to the centre of `to` (inside stage), then show `to` */
async function fly(c, stage, from, to) {
  if (c.fast) { to.style.opacity = 1; return; }
  const sr = stage.getBoundingClientRect(), sc = sr.width / stage.offsetWidth || 1;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const f = h('div', 'u9l1-fly', from.innerHTML); f.style.color = getComputedStyle(from).color;
  stage.appendChild(f); place(f, (a.left + a.width / 2 - sr.left) / sc, (a.top + a.height / 2 - sr.top) / sc);
  const dx = (b.left + b.width / 2 - a.left - a.width / 2) / sc, dy = (b.top + b.height / 2 - a.top - a.height / 2) / sc;
  try { await anim(c, f, [{ transform: 'translate(0,0)' }, { transform: `translate(${dx}px,${dy}px)` }], 750); } finally { f.remove(); }
}
const SOH = { learn: { label: 'Build SOH CAH TOA' }, quiz: { label: 'Which ratio? (quiz)' } };
const QUIZ = [{ ref: 'X', fn: 'cos' }, { ref: 'Z', fn: 'sin' }, { ref: 'X', fn: 'tan' }];
const soh = {
  title: 'SOH CAH TOA',
  height: 450,
  choices: Object.keys(SOH).map((k) => ({ v: k, label: SOH[k].label })),
  intro: (k) => (k === 'quiz' ? 'Two sides are highlighted. Which ratio uses them? Press <b>Next</b>.' : 'Three ratios, three pairs of sides. Press <b>Next</b>.'),
  make(stage, key, ex) {
    const t = new Tri(stage, { x: 6, y: 4, width: 470, height: 330, pad: [56, 100, 60, 56], P: { X: [0, 0], Y: [4, 0], Z: [4, 2.6] }, right: 'Y', ref: 'X', refLab: 'x^\\circ', arcR: 40, vlab: key === 'quiz' });
    const banner = add(stage, h('div', 'u9l1-banner'), 0, 350); banner.style.width = '480px';
    const L = {};
    for (const w of ['SOH', 'CAH', 'TOA']) { const e = h('div', 'u9l1-word'); w.split('').forEach((ch, i) => e.appendChild(h('div', i === 0 ? 'u9l1-l1' : '', ch))); banner.appendChild(e); L[w] = e; }
    const P = panel(stage, 500, 10, ex.W - 510, 430, key === 'quiz' ? 'Which ratio?' : 'The three primary ratios');
    const rowOf = (fn, ang = 'x^\\circ') => { const [n, m] = FN[fn], r = h('div', 'u9l1-frow', T(`\\${fn} ${ang}=\\dfrac{${ctxt(n)}}{${ctxt(m)}}`)); P.appendChild(hide0(r)); return r; };
    const lightW = (fn, on = true) => [...L[MN[fn]].children].forEach((e) => e.classList.toggle('on', on));
    const focus = (pair) => { for (const k in t.sides) { const role = Object.keys(t.roles(t.ref)).find((r) => t.roles(t.ref)[r] === k); t.S(k).style.opacity = pair.includes(role) ? 1 : 0.22; if (t.tags[k]) t.tags[k].style.opacity = pair.includes(role) ? 1 : 0.25; } };
    const unfocus = () => { for (const k in t.sides) { t.S(k).style.opacity = 1; if (t.tags[k]) t.tags[k].style.opacity = 1; } };
    if (key === 'learn') {
      t.mark(null, 'X', ['hyp', 'opp', 'adj'], { long: true });
      const R = t.roles('X');
      const build = (fn) => ({
        cap: `<b>${NAMEF[fn][0].toUpperCase() + NAMEF[fn].slice(1)}</b> is ${RB(FN[fn][0], LONG[FN[fn][0]])} over ${RB(FN[fn][1], LONG[FN[fn][1]])}: ${T(`\\${fn} x^\\circ=\\dfrac{${ctxt(FN[fn][0])}}{${ctxt(FN[fn][1])}}`)}. That is <b>${MN[fn]}</b>.`,
        run: async (c) => {
          focus(FN[fn]); const r = rowOf(fn);
          await Promise.all(FN[fn].map((role) => fly(c, stage, t.tags[t.S(R[role]).k], r)));
          await show(c, r); lightW(fn); await pulse(c, L[MN[fn]], 1.15);
        }
      });
      return [build('sin'), build('cos'), build('tan'),
        { cap: `All together: <b>SOH CAH TOA</b>. The constant ratio in Example 1, ${T('\\dfrac{\\text{opp}}{\\text{adj}}')}, was the <b>tangent</b>.`,
          run: async (c) => { unfocus(); await pulse(c, banner, 1.12, 600); const s = stamp(P, 'SOH CAH TOA', { ok: true, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = 'auto'; await stampIn(c, s); } }];
    }
    const qEl = h('div', 'u9l1-quiz', ''); P.appendChild(qEl);
    const out = [];
    QUIZ.forEach((q, i) => {
      const pair = FN[q.fn], ang = q.ref === 'X' ? 'x^\\circ' : 'Z';
      out.push({ cap: `Round ${i + 1}. The reference angle is ${q.ref === 'X' ? T('x^\\circ') + ' at ' + T('X') : 'at ' + T('Z')}. The two known sides are highlighted. Which ratio uses <b>these two</b>?`,
        run: async (c) => {
          t.unpaint(); if (t.ref !== q.ref) { t.unarc(t.ref); const A = t.arc(q.ref, q.ref === 'X' ? 'x^\\circ' : null); await appear(c, A.g, 300); if (A.lab) await pop(c, A.lab); }
          const R = t.roles(q.ref);
          for (const role of pair) { t.paint(R[role], role); await pop(c, t.tag(R[role], role)); }
          const other = ['hyp', 'opp', 'adj'].find((r) => !pair.includes(r)); t.S(R[other]).style.opacity = 0.22;
          qEl.innerHTML = `${RB(pair[0])} and ${RB(pair[1])} → ?`; await pop(c, qEl);
        } });
      out.push({ cap: `${RB(pair[0])} over ${RB(pair[1])} is <b>${MN[q.fn]}</b>: the <b>${NAMEF[q.fn]}</b>, ${T(`\\${q.fn} ${ang}=\\dfrac{${ctxt(pair[0])}}{${ctxt(pair[1])}}`)}.`,
        run: async (c) => {
          const r = rowOf(q.fn, ang); qEl.innerHTML = ''; await show(c, r); lightW(q.fn); await pulse(c, L[MN[q.fn]], 1.15);
          for (const k in t.sides) t.S(k).style.opacity = 1;
        } });
    });
    return out;
  }
};

/* ======================================================================================
 * Explainer: size (sin, cos < 1; tan any positive number)
 * ====================================================================================== */
const SIZE = {
  a: { label: 'Example 5: angle A', P: { C: [0, 0], A: [12, 0], B: [0, 5] }, right: 'C', ref: 'A', lens: { CA: 12, CB: 5, AB: 13 }, sn: ['CB', 'CA', 'AB'], n: { opp: 5, adj: 12, hyp: 13 } },
  z: { label: 'Example 5: angle Z', P: { Y: [0, 0], Z: [7, 0], X: [0, 24] }, right: 'Y', ref: 'Z', lens: { YZ: 7, XY: 24, XZ: 25 }, sn: ['XY', 'YZ', 'XZ'], n: { opp: 24, adj: 7, hyp: 25 } }
};
const size = {
  title: 'Size check: swing one side onto another',
  height: 440,
  choices: Object.keys(SIZE).map((k) => ({ v: k, label: SIZE[k].label })),
  intro: 'Why can’t a sine or a cosine reach 1? Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = SIZE[key], n = d.n;
    const t = new Tri(stage, { x: 10, y: 6, width: 520, height: 428, pad: key === 'a' ? [60, 50, 90, 96] : [40, 160, 50, 160], P: d.P, right: d.right, ref: d.ref, arcR: key === 'a' ? 54 : 28, lens: d.lens, sn: d.sn });
    const R = t.roles(d.ref);
    const P = panel(stage, 545, 10, ex.W - 555, 420, `From angle ${d.ref}`);
    const common = (k1, k2) => t.S(k1).k.split('').find((ch) => t.S(k2).k.includes(ch));
    const other = (k, v) => t.S(k).k.replace(v, '');
    const swing = async (c, kFrom, kOnto, color, num) => {
      const pv = common(kFrom, kOnto), Pv = t.V[pv], F = t.V[other(kFrom, pv)], To = t.V[other(kOnto, pv)], Lp = Math.hypot(F[0] - Pv[0], F[1] - Pv[1]);
      const a0 = Math.atan2(F[1] - Pv[1], F[0] - Pv[0]); let dl = Math.atan2(To[1] - Pv[1], To[0] - Pv[0]) - a0;
      while (dl <= -Math.PI) dl += 2 * Math.PI; while (dl > Math.PI) dl -= 2 * Math.PI;
      const g = svgEl('g', {}, t.gX), ln = svgEl('line', { stroke: color, 'stroke-width': 10, 'stroke-linecap': 'round', opacity: 0.75 }, g);
      const set = (s) => { const a = a0 + dl * s; ln.setAttribute('x1', Pv[0]); ln.setAttribute('y1', Pv[1]); ln.setAttribute('x2', Pv[0] + Lp * Math.cos(a)); ln.setAttribute('y2', Pv[1] + Lp * Math.sin(a)); };
      set(0); await tween(c, 1300, set);
      const a = a0 + dl, E = [Pv[0] + Lp * Math.cos(a), Pv[1] + Lp * Math.sin(a)], nx = -Math.sin(a), ny = Math.cos(a);
      svgEl('line', { x1: E[0] - nx * 14, y1: E[1] - ny * 14, x2: E[0] + nx * 14, y2: E[1] + ny * 14, stroke: INK, 'stroke-width': 3 }, g);
      return g;
    };
    const clear = [];
    const done = (g) => { clear.push(g); };
    const fade = async (c) => { for (const g of clear.splice(0)) await anim(c, g, [{ opacity: 1 }, { opacity: 0 }], 250); };
    const tz = key === 'z';
    return [
      { cap: `Label the sides from ${T('\\angle ' + d.ref)}: ${RB('opp')} ${T(`=${t.nm(R.opp)}=${n.opp}`)}, ${RB('adj')} ${T(`=${t.nm(R.adj)}=${n.adj}`)}, ${RB('hyp')} ${T(`=${t.nm(R.hyp)}=${n.hyp}`)}.`,
        run: async (c) => { await t.mark(c, d.ref); } },
      { cap: `Swing the ${RB('opp')} (${n.opp}) round onto the ${RB('hyp')} (${n.hyp}). It falls short: the hypotenuse is the longest side. So ${T(`\\sin ${d.ref}=\\dfrac{${n.opp}}{${n.hyp}}`)} is <b>less than 1</b>.`,
        run: async (c) => { done(await swing(c, R.opp, R.hyp, OPP)); await show(c, line(P, T(`\\sin ${d.ref}=\\dfrac{${n.opp}}{${n.hyp}}<1`), 'u9l1-big')); } },
      { cap: `Swing the ${RB('adj')} (${n.adj}) onto the ${RB('hyp')}: short again. ${T(`\\cos ${d.ref}=\\dfrac{${n.adj}}{${n.hyp}}`)} is <b>less than 1</b>. A sine or cosine can never reach 1.`,
        run: async (c) => { await fade(c); done(await swing(c, R.adj, R.hyp, ADJ)); await show(c, line(P, T(`\\cos ${d.ref}=\\dfrac{${n.adj}}{${n.hyp}}<1`), 'u9l1-big')); } },
      { cap: tz ? `The tangent compares the two <b>legs</b>. Swing the ${RB('adj')} (7) onto the ${RB('opp')} (24): the opposite is much <b>longer</b>, so ${T('\\tan Z=\\dfrac{24}{7}')} is <b>greater than 1</b>.`
        : `The tangent compares the two <b>legs</b>. Swing the ${RB('opp')} (5) onto the ${RB('adj')} (12): the opposite is <b>shorter</b>, so ${T('\\tan A=\\dfrac{5}{12}')} is <b>less than 1</b>.`,
        run: async (c) => { await fade(c); done(tz ? await swing(c, R.adj, R.opp, ADJ) : await swing(c, R.opp, R.adj, OPP)); await show(c, line(P, T(tz ? '\\tan Z=\\dfrac{24}{7}>1' : '\\tan A=\\dfrac{5}{12}<1'), 'u9l1-big')); } },
      { cap: tz ? `So sine and cosine stay below 1, but a tangent can be <b>any positive number</b>: bigger than 1 whenever opp ${T('>')} adj.`
        : `So sine and cosine stay below 1. The tangent is less than 1 here because opp ${T('<')} adj; on a steeper triangle it can be more than 1 (try ${T('\\angle Z')}).`,
        run: async (c) => { await fade(c); const s = stamp(P, tz ? 'tan can exceed 1' : 'sin, cos < 1', { ok: true, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = 'auto'; await stampIn(c, s); } }
    ];
  }
};

/* ======================================================================================
 * Explainer: ratios (Examples 3 and 5)
 * ====================================================================================== */
const RAT = {
  ex3: { label: 'Example 3 check', P: { Q: [0, 0], R: [12, 0], P: [0, 9] }, right: 'Q', refs: ['R', 'P'], lens: { QR: 12, PQ: 9, PR: 15 }, sn: ['PQ', 'QR', 'PR'], L: { PQ: 9, QR: 12, PR: 15 } },
  ex5a: { label: 'Example 5 check: (i)–(iii)', P: { C: [0, 0], A: [12, 0], B: [0, 5] }, right: 'C', refs: ['A'], lens: { CA: 12, CB: 5, AB: 13 }, sn: ['CB', 'CA', 'AB'], L: { CB: 5, CA: 12, AB: 13 } },
  ex5z: { label: 'Example 5 check: (iv)–(vi)', P: { Y: [0, 0], Z: [7, 0], X: [0, 24] }, right: 'Y', refs: ['Z'], lens: { YZ: 7, XY: 24, XZ: 25 }, sn: ['XY', 'YZ', 'XZ'], L: { XY: 24, YZ: 7, XZ: 25 } }
};
const ratios = {
  title: 'Label, write, simplify',
  height: 470,
  choices: Object.keys(RAT).map((k) => ({ v: k, label: RAT[k].label })),
  intro: 'Label the sides first, then SOH CAH TOA does the rest. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = RAT[key], tall = key === 'ex5z';
    const t = new Tri(stage, { x: 10, y: 6, width: 450, height: 458, pad: tall ? [40, 150, 50, 150] : [70, 50, 90, 96], P: d.P, right: d.right, ref: d.refs[0], arcR: tall ? 28 : 46, lens: d.lens, sn: d.sn });
    const two = d.refs.length > 1, PW = ex.W - 480;
    const P = panel(stage, 470, 10, PW, 450, '');
    const grid = h('div', ''); grid.style.cssText = `display:grid;grid-template-columns:${two ? '1fr 1fr' : '1fr'};gap:6px 14px`; P.appendChild(grid);
    const lenOf = (k) => d.L[t.nm(k)];
    const cols = d.refs.map((r) => { const cc = h('div', ''); cc.style.cssText = 'display:flex;flex-direction:column;gap:8px'; grid.appendChild(cc); return cc; });
    const vals = {};
    const steps = [];
    d.refs.forEach((ref, ri) => {
      const R = t.roles(ref), n = { opp: lenOf(R.opp), adj: lenOf(R.adj), hyp: lenOf(R.hyp) };
      const rowT = (fn) => `\\${fn} ${ref}=${simpT(n[FN[fn][0]], n[FN[fn][1]])}`;
      const g = (fn) => gcd(n[FN[fn][0]], n[FN[fn][1]]);
      vals[ref] = n;
      const lab = `${RB('opp')} ${T(`=${t.nm(R.opp)}=${n.opp}`)}, ${RB('adj')} ${T(`=${t.nm(R.adj)}=${n.adj}`)}, ${RB('hyp')} ${T(`=${t.nm(R.hyp)}=${n.hyp}`)}`;
      if (ri === 0) {
        steps.push({ cap: `From ${T('\\angle ' + ref)}: ${lab}.`,
          run: async (c) => { await t.mark(c, ref); await show(c, line(cols[0], `<b>From ${T('\\angle ' + ref)}</b>`)); } });
        for (const fn of ['sin', 'cos', 'tan']) {
          steps.push({ cap: `${MN[fn]}: ${T(`\\${fn} ${ref}=\\dfrac{\\text{${FN[fn][0]}}}{\\text{${FN[fn][1]}}}=${fr(n[FN[fn][0]], n[FN[fn][1]])}`)}. ${g(fn) > 1 ? `Divide top and bottom by ${g(fn)}: ${T(simpT(n[FN[fn][0]], n[FN[fn][1]]).split('=').pop())}.` : 'Already in simplest form.'}`,
            run: async (c) => { await show(c, line(cols[0], T(rowT(fn)))); } });
        }
      } else {
        steps.push({ cap: `Now from ${T('\\angle ' + ref)}. The ${RB('hyp')} is still ${T(t.nm(R.hyp) + '=' + n.hyp)}, but the legs trade places: ${RB('opp')} ${T(`=${t.nm(R.opp)}=${n.opp}`)}, ${RB('adj')} ${T(`=${t.nm(R.adj)}=${n.adj}`)}.`,
          run: async (c) => {
            t.unarc(d.refs[0]); t.unpaint(); const A = t.arc(ref, null, { r: 40 }); await appear(c, A.g, 300);
            await t.mark(c, ref); await show(c, line(cols[1], `<b>From ${T('\\angle ' + ref)}</b>`));
          } });
        steps.push({ cap: `${T(rowT('sin'))}, ${T(rowT('cos'))}, ${T(rowT('tan'))}.`,
          run: async (c) => { for (const fn of ['sin', 'cos', 'tan']) await show(c, line(cols[1], T(rowT(fn)))); } });
      }
    });
    if (two) {
      const [r1, r2] = d.refs;
      steps.push({ cap: `Compare: ${T(`\\sin ${r1}=\\cos ${r2}`)} and ${T(`\\cos ${r1}=\\sin ${r2}`)}, and ${T(`\\tan ${r2}`)} is ${T(`\\tan ${r1}`)} flipped over. The two acute angles add to ${T('90^\\circ')}: the sine of one is the cosine of the other.`,
        run: async (c) => {
          const rows1 = [...cols[0].children].slice(1), rows2 = [...cols[1].children].slice(1);
          const hl = (e, cc) => { e.style.background = cc; e.style.borderRadius = '8px'; };
          hl(rows1[0], '#efe9fb'); hl(rows2[1], '#efe9fb'); hl(rows1[1], '#fff4dd'); hl(rows2[0], '#fff4dd');
          await Promise.all([pulse(c, rows1[0]), pulse(c, rows2[1])]); await Promise.all([pulse(c, rows1[1]), pulse(c, rows2[0])]);
          await show(c, line(P, T(`\\angle ${r1}+\\angle ${r2}=90^\\circ`), 'u9l1-big'));
        } });
    } else {
      const ref = d.refs[0], n = vals[ref], big = n.opp > n.adj;
      steps.push({ cap: big ? `Check: ${T(`\\sin ${ref}`)} and ${T(`\\cos ${ref}`)} are less than 1 ✓. ${T(`\\tan ${ref}=\\frac{${n.opp}}{${n.adj}}`)} is greater than 1, which is allowed: opp ${T('>')} adj.`
        : `Check: ${T(`\\sin ${ref}`)} and ${T(`\\cos ${ref}`)} are less than 1 ✓, and ${T(`\\tan ${ref}<1`)} because opp ${T('<')} adj ✓.`,
        run: async (c) => { const s = stamp(P, 'size check ✓', { ok: true, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = 'auto'; await stampIn(c, s); } });
    }
    return steps;
  }
};

/* ======================================================================================
 * Explainer: hypFirst (Example 4)
 * ====================================================================================== */
const HF = {
  ex4: { label: 'Example 4 check', P: { N: [0, 0], L: [15, 0], M: [0, 8] }, right: 'N', ref: 'L', a: ['NM', 8], b: ['NL', 15], hyp: 'LM', sn: ['NM', 'NL', 'LM'] },
  d33: { label: 'Demo: legs 33 and 56', P: { E: [0, 0], F: [56, 0], D: [0, 33] }, right: 'E', ref: 'F', a: ['DE', 33], b: ['EF', 56], hyp: 'DF', sn: ['DE', 'EF', 'DF'] }
};
const hypFirst = {
  title: 'Missing hypotenuse: Pythagoras, then SOH CAH TOA',
  height: 470,
  choices: Object.keys(HF).map((k) => ({ v: k, label: HF[k].label })),
  intro: 'Two legs given, no hypotenuse. Sine and cosine need it. Press <b>Next</b>.',
  make(stage, key, ex) {
    const d = HF[key], [an, a] = d.a, [bn, b] = d.b, c2 = a * a + b * b, hy = Math.round(Math.sqrt(c2));
    const t = new Tri(stage, { x: 10, y: 10, width: 470, height: 360, pad: [60, 50, 80, 96], P: d.P, right: d.right, ref: d.ref, refLab: 'x^\\circ', arcR: 50, lens: { [an]: a, [bn]: b, [d.hyp]: '?' }, sn: d.sn });
    t.paint(d.hyp, 'hyp');
    const P = panel(stage, 495, 10, ex.W - 505, 450, '');
    const R = t.roles(d.ref), n = { opp: t.nm(R.opp) === an ? a : b, adj: t.nm(R.adj) === an ? a : b, hyp: hy };
    const dec = (p, q) => (p / q).toFixed(3);
    return [
      { cap: `Two legs are given: ${T(`${an}=${a}`)} and ${T(`${bn}=${b}`)}. The hypotenuse ${T(d.hyp)}, across from the right angle at ${T(d.right)}, is missing.`,
        run: async (c) => { await pulse(c, t.S(d.hyp).lenEl, 1.5, 600); } },
      { cap: `Pythagoras: ${T(`${d.hyp}^2=${an}^2+${bn}^2=${a}^2+${b}^2=${a * a}+${b * b}=${c2}`)}.`,
        run: async (c) => { for (const s of [`${d.hyp}^2=${an}^2+${bn}^2`, `${d.hyp}^2=${a}^2+${b}^2`, `${d.hyp}^2=${a * a}+${b * b}=${c2}`]) await show(c, line(P, T(s))); } },
      { cap: `${T(`${d.hyp}=\\sqrt{${c2}}=${hy}`)}. It is longer than both legs, as a hypotenuse must be ✓.`,
        run: async (c) => { await show(c, line(P, T(`${d.hyp}=\\sqrt{${c2}}=${hy}`), 'u9l1-big u9l1-ch')); t.len(d.hyp, hy); t.paint(d.hyp, 'hyp'); await pop(c, t.S(d.hyp).lenEl); } },
      { cap: `From ${T('x^\\circ')} at ${T(d.ref)}: ${RB('opp')} ${T(`=${t.nm(R.opp)}=${n.opp}`)}, ${RB('adj')} ${T(`=${t.nm(R.adj)}=${n.adj}`)}, ${RB('hyp')} ${T(`=${d.hyp}=${hy}`)}.`,
        run: async (c) => { await t.mark(c, d.ref); } },
      { cap: `${T(`\\sin x^\\circ=${simpT(n.opp, hy)}\\approx${dec(n.opp, hy)}`)}, ${T(`\\cos x^\\circ=${simpT(n.adj, hy)}\\approx${dec(n.adj, hy)}`)}, ${T(`\\tan x^\\circ=${simpT(n.opp, n.adj)}\\approx${dec(n.opp, n.adj)}`)} (to the nearest thousandth).`,
        run: async (c) => {
          for (const [fn, p, q] of [['sin', n.opp, hy], ['cos', n.adj, hy], ['tan', n.opp, n.adj]]) await show(c, line(P, T(`\\${fn} x^\\circ=${simpT(p, q)}\\approx${dec(p, q)}`)));
        } },
      { cap: `Check: sine and cosine are less than 1 ✓, and ${T('\\tan x^\\circ<1')} because opp ${T('<')} adj ✓.`,
        run: async (c) => { const s = stamp(P, 'size check ✓', { ok: true, size: 'sm' }); s.style.alignSelf = 'center'; s.style.marginTop = 'auto'; await stampIn(c, s); } }
    ];
  }
};

/* ======================================================================================
 * boot
 * ====================================================================================== */
mountWarm();
mountFigs();
mountGame();
export const explainers = mountExplainers({ why, grow, name, soh, size, ratios, hypFirst });
