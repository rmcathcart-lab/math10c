/* Math 10C · Unit 9 · Lesson 3 — Finding a Missing Side Length in a Right Triangle.
 * Warm-up: Kite Height (50 m of string at 90°, 0°, 30°, 40°).
 * Explainers:
 *   kite     the warm-up solved: the string swings to each angle, the table fills, sin 40° = h/50, the height-vs-angle curve
 *   pyth     two sides known → Pythagoras: squares on the legs fill the square on the hypotenuse (Example 1, a leg unknown)
 *   pick     name opp / adj / hyp from the angle, then the only ratio that holds the known side AND the unknown
 *            (the sides relabel themselves when the angle switches corners)
 *   solveTop the star: the chosen ratio's two sides light up, the equation goes on a balance, ×k on both pans
 *   ladder   Example 3: slide the ladder (h = 6.8 sin θ, d = 6.8 cos θ), (a)–(b) by trig, (c)–(d) the rounding trap
 *   solveBot the star, unknown on the bottom: ×x on both pans (cross-multiply), then ÷ sin θ
 *   cover    the SOH / CAH / TOA cover-up triangles: cover the unknown → side by side = multiply, stacked = divide
 *   letters  reading ∠JLK = 90°, ∠LJK = 34°, KL = 11.2 mm onto the triangle (middle letter = vertex; two letters = side)
 *   solve7   the star again for Examples 6 and 7, plus a Pythagoras / angle-sum check of Example 7
 *   tool     summary flowchart: which tool? where is the unknown?
 * Colours (every Unit 9 page): opposite purple, adjacent amber, hypotenuse blue, reference angle raspberry. */
import {
  h, tex, add, box, place, RightTriangle, Flowchart, NumberLine, Graph, stamp, stampIn, checkCard, mountExplainers,
  pop, fadeIn, appear, sleep, tween, anim, svgEl, pulse, COLORS, texNum
} from '../blocks.js';

const T = (s) => tex(String(s));
const OPP = COLORS.purple, ADJ = COLORS.amber, HYP = COLORS.blue, ANG = '#d6336c', GOOD = COLORS.green, BAD = COLORS.red, INK = COLORS.ink;
const RC = { opp: OPP, adj: ADJ, hyp: HYP };
const tc = (c, s) => `\\textcolor{${c}}{${s}}`;
const rc = (role, s) => tc(RC[role], s);
const dg = (d) => `${d}^\\circ`;
const RAD = Math.PI / 180;
const TRIG = { sin: (d) => Math.sin(d * RAD), cos: (d) => Math.cos(d * RAD), tan: (d) => Math.tan(d * RAD) };
const RAT = { sin: ['opp', 'hyp'], cos: ['adj', 'hyp'], tan: ['opp', 'adj'] };
const MN = { sin: 'SOH', cos: 'CAH', tan: 'TOA' };
const WORD = { sin: 'sine', cos: 'cosine', tan: 'tangent' };
const LONG = { opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' };
const RT = { opp: '\\text{opp}', adj: '\\text{adj}', hyp: '\\text{hyp}' };
const ratioT = (fn, ang = '\\theta') => `\\${fn}${ang}=\\dfrac{${rc(RAT[fn][0], RT[RAT[fn][0]])}}{${rc(RAT[fn][1], RT[RAT[fn][1]])}}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/** calculator-style display, cut (not rounded) after n decimals: 13.90798… */
const trunc = (v, n = 5) => (Math.floor(v * 10 ** n + 1e-7) / 10 ** n).toFixed(n);
const KEYLAB = { '=': 'ENTER', sin: 'SIN', cos: 'COS', tan: 'TAN', '√': '2nd x²', 'x²': 'x²' };
const kbd = (keys) => '<span class="keys">' + keys.split(' ').map((t) => `<kbd>${KEYLAB[t] || t}</kbd>`).join('') + '</span>';

/* ---------------- panels ---------------- */
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u9l3-panel ' + cls, title ? `<div class="u9l3-ph">${title}</div>` : ''), w, hh), x, y);
const lineEl = (host, html, cls = '') => { const d = h('div', 'u9l3-ln ' + cls, html); host.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const say = (c, P, html, cls) => show(c, lineEl(P, html, cls));

/* =============================== triangles =============================== */
/* Booklet figures. pos labels: bot = horizontal leg, vert = vertical leg, hyp. ang: which non-right vertex has the angle. */
const TRI = {
  sec1: { base: 3.2, rise: 2.3, right: 'br', lab: { bot: 'a', vert: 'b', hyp: 'c' } },
  e1a: { base: 3.36, rise: 2.52, right: 'bl', lab: { bot: '8.4\\text{ cm}', vert: '6.3\\text{ cm}', hyp: 'r' } },
  e1b: { base: 4.2, rise: 1.75, right: 'br', lab: { bot: '12.0\\text{ mm}', vert: '5.0\\text{ mm}', hyp: 's' } },
  idea: { base: Math.sqrt(3), rise: 1, right: 'bl', ang: 'base', deg: 30, lab: {} },
  sw: { base: 4, rise: 3, right: 'bl', ang: 'base', deg: '\\theta', lab: {} },
  e2: { base: 2.61, rise: 4.17, right: 'bl', ang: 'base', deg: 58, lab: { vert: 'x', hyp: '16.4\\text{ cm}' } },
  e3: { base: 1.40, rise: 3.47, right: 'bl', ang: 'base', deg: 68, lab: { vert: 'h', bot: 'd', hyp: '6.8\\text{ m}' } },
  e4: { base: 3.74, rise: 2.82, right: 'bl', ang: 'base', deg: 37, lab: { vert: '9.4\\text{ cm}', hyp: 'c' } },
  e5: { base: 2.46, rise: 3.65, right: 'bl', ang: 'top', deg: 34, names: { right: 'L', base: 'K', top: 'J' }, show: true, lab: { bot: '11.2\\text{ mm}' } },
  e6: { base: 3.57, rise: 1.9, right: 'br', ang: 'base', deg: 28, names: { right: 'C', base: 'A', top: 'B' }, show: true, padK: 1.35, lab: { vert: '9.5\\text{ cm}', bot: 'AC' } },
  e7: { base: 1.562, rise: 3.203, right: 'br', ang: 'base', deg: 64, names: { right: 'E', base: 'F', top: 'D' }, show: true, lab: { bot: '71\\text{ m}', vert: 'DE', hyp: 'DF' } },
  pqr: { base: Math.cos(40 * RAD), rise: Math.sin(40 * RAD), right: 'bl', ang: 'base', deg: 40, names: { right: 'Q', base: 'P', top: 'R' }, show: true, lab: {} }
};
const lc = (s) => s.toLowerCase();
const keyOf = (N, pos) => lc(pos === 'hyp' ? N.right : pos === 'vert' ? N.base : N.top);
const posOf = (d, role) => (role === 'hyp' ? 'hyp' : (d.ang === 'base') === (role === 'opp') ? 'vert' : 'bot');
/** end points of side k and its outward unit normal */
function sideGeo(t, k) {
  const v = Object.keys(t.V).find((x) => lc(x) === k), [P, Q] = t.opp[v], O = t.V[v];
  let n = [-(Q[1] - P[1]), Q[0] - P[0]]; const L = Math.hypot(n[0], n[1]) || 1; n = [n[0] / L, n[1] / L];
  const m = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
  if ((m[0] - O[0]) * n[0] + (m[1] - O[1]) * n[1] < 0) n = [-n[0], -n[1]];
  return { P, Q, m, n };
}
/** a side label just outside side k (pushed out by its own size so it never sits on the line) */
function sideLabel(t, k, html, cls = '') {
  if (t.sideLabs[k]) t.sideLabs[k].remove();
  const { m, n } = sideGeo(t, k), el = t.hlabel(m[0], m[1], html, { cls: 'bk-tri-lab ' + cls });
  const w = el.offsetWidth, hh = el.offsetHeight, off = 6 + Math.abs(n[0]) * w / 2 + Math.abs(n[1]) * hh / 2;
  const x = m[0] + n[0] * off, y = m[1] + n[1] * off;
  el.cx = clamp(x, w / 2, t.W - w / 2); el.cy = clamp(y, hh / 2, t.H - hh / 2); el.clampBy = Math.hypot(el.cx - x, el.cy - y);
  place(el, el.cx, el.cy);
  el.ext = 6 + Math.abs(n[0]) * w + Math.abs(n[1]) * hh;
  t.sideLabs[k] = el; return el;
}
/** a booklet triangle; if a side label would be squeezed against the edge, it is redrawn smaller (more padding) */
function mkTri(host, key, o = {}) {
  let pad = (o.pad || 58) * (TRI[key].padK || 1);
  for (let i = 0; ; i++) {
    const t = mkTri1(host, key, o, pad), over = Math.max(0, ...Object.values(t.sideLabs).map((e) => e.clampBy || 0));
    if (over < 1 || i === 3) return t;
    const cap = 0.3 * Math.min(o.w || 320, o.h || 280);
    if (pad >= cap) return t;
    t.el.remove(); pad = Math.min(cap, pad + over + 4);
  }
}
function mkTri1(host, key, o, pad) {
  const d = Object.assign({}, TRI[key]), N = d.names || { right: 'P', base: 'Q', top: 'R' };
  const t = new RightTriangle(host, { x: o.x, y: o.y, width: o.w || 320, height: o.h || 280, pad, base: d.base, rise: d.rise, right: d.right, names: N, tex: true });
  t.d = d; t.N = N; t.tags = {};
  if (!d.show) Object.values(t.vLabs).forEach((e) => e.remove());
  t.av = () => (t.d.ang === 'base' ? N.base : N.top);
  t.roleKey = (role) => keyOf(N, posOf(t.d, role));
  const lab = Object.assign({}, d.lab, o.lab || {});
  for (const p in lab) if (lab[p] != null) sideLabel(t, keyOf(N, p), T(lab[p]));
  if (d.ang && o.angle !== false) t.angle(t.av(), dg(d.deg), { color: ANG, r: o.r || 30 });
  return t;
}
/** colour the sides opp / adj / hyp from the reference angle and tag them (animated with c) */
async function tagRoles(c, t, o = {}) {
  for (const role of o.roles || ['opp', 'adj', 'hyp']) {
    const k = t.roleKey(role), g = t.sideEls[k], col = RC[role], { m, n } = sideGeo(t, k), lab = t.sideLabs[k];
    g.style.color = col; g.classList.add('bk-hl');
    if (t.tags[role]) t.tags[role].remove();
    const tg = t.hlabel(m[0], m[1], o.long ? LONG[role] : role, { cls: 'bk-tri-tag' }); tg.style.color = col;
    t.tags[role] = tg; placeTag(t, role);
    if (c) { tg.style.opacity = 0; await anim(c, g, [{ opacity: 0.3 }, { opacity: 1 }], 260); await pop(c, tg, 300); await sleep(c, o.stagger ?? 140); }
  }
}
/** a role tag beyond its side label; when there is no room out there, beside the label along the side */
function placeTag(t, role) {
  const tg = t.tags[role]; if (!tg) return;
  const k = t.roleKey(role), { m, n } = sideGeo(t, k), lab = t.sideLabs[k];
  const tw = tg.offsetWidth / 2 + 2, th = tg.offsetHeight / 2 + 2;
  const off = (lab ? lab.ext + 6 : 8) + Math.abs(n[0]) * tw + Math.abs(n[1]) * th;
  const x = m[0] + n[0] * off, y = m[1] + n[1] * off, cx = clamp(x, tw, t.W - tw), cy = clamp(y, th, t.H - th);
  if (!lab || Math.hypot(cx - x, cy - y) < 3) { place(tg, cx, cy); return; }
  const d = [n[1], -n[0]], along = Math.abs(d[0]) * (lab.offsetWidth / 2 + tw) + Math.abs(d[1]) * (lab.offsetHeight / 2 + th) + 4;
  const A = t.d.ang ? t.V[t.av()] : null;
  const opts = [1, -1].map((s) => { const px = lab.cx + d[0] * along * s, py = lab.cy + d[1] * along * s, q = [clamp(px, tw, t.W - tw), clamp(py, th, t.H - th)];
    return { q, err: Math.hypot(q[0] - px, q[1] - py) - (A ? Math.hypot(q[0] - A[0], q[1] - A[1]) * 0.01 : 0) }; });
  opts.sort((a, b) => a.err - b.err); place(tg, ...opts[0].q);
}
function clearRoles(t) {
  Object.values(t.sideEls).forEach((g) => { g.style.color = INK; g.classList.remove('bk-hl'); g.style.opacity = ''; });
  Object.values(t.tags).forEach((e) => e.remove()); t.tags = {};
}
const roleEls = (t, role) => { const k = t.roleKey(role); return [t.sideEls[k], t.sideLabs[k], t.tags[role]].filter(Boolean); };
const dimRole = (c, t, role, to = 0.18) => Promise.all(roleEls(t, role).map((e) => anim(c, e, [{ opacity: 1 }, { opacity: to }], 380)));
function glowRole(c, t, role) {
  const { P, Q } = sideGeo(t, t.roleKey(role));
  const p = svgEl('path', { d: `M${P[0]} ${P[1]}L${Q[0]} ${Q[1]}`, stroke: RC[role], 'stroke-width': 20, 'stroke-opacity': 0.22, 'stroke-linecap': 'round', fill: 'none', class: 'u9l3-glow' });
  t.svg.insertBefore(p, t.svg.querySelector('.bk-tri-side'));
  return appear(c, p, 420);
}
/** mark a side label as the known side (soft box) or the unknown (dashed raspberry box) */
async function markLab(c, t, role, kind) {
  const el = t.sideLabs[t.roleKey(role)]; if (!el) return;
  el.classList.add(kind === 'find' ? 'u9l3-find' : 'u9l3-known');
  await pulse(c, el, 1.25);
}

/* =============================== static figures on the cards =============================== */
function figures() {
  const F = (id, key, o) => { const host = document.getElementById(id); if (host) mkTri(host, key, o); };
  F('u9l3-fsec1', 'sec1', { w: 250, h: 200, pad: 40 });
  F('u9l3-f1a', 'e1a', { w: 330, h: 240, pad: 50 });
  F('u9l3-f1b', 'e1b', { w: 420, h: 200, pad: 46 });
  F('u9l3-f2', 'e2', { w: 280, h: 300, pad: 50 });
  F('u9l3-f3', 'e3', { w: 250, h: 310, pad: 46, r: 24 });
  F('u9l3-f4', 'e4', { w: 330, h: 260, pad: 50 });
  F('u9l3-f5', 'e5', { w: 270, h: 320, pad: 50, r: 40 });
  F('u9l3-f6', 'e6', { w: 380, h: 230, pad: 52 });
  F('u9l3-f7', 'e7', { w: 270, h: 330, pad: 52, r: 26 });
}

/* =============================== the kite (warm-up) =============================== */
function kiteScene(host, o) {
  const W = o.w, H = o.h, el = box(h('div', 'u9l3-scene'), W, H);
  if (o.x != null) add(host, el, o.x, o.y); else host.appendChild(el);
  const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, el);
  const lay = h('div', 'u9l3-shtml'); el.appendChild(lay);
  const gy = H - 30, hx = 92, hy = gy - 48, L = o.L;
  svgEl('rect', { x: 0, y: 0, width: W, height: gy, fill: '#e4eff9' }, svg);
  svgEl('rect', { x: 0, y: gy, width: W, height: H - gy, fill: '#d3e6c4' }, svg);
  svgEl('line', { x1: 0, x2: W, y1: gy, y2: gy, stroke: '#5b7a47', 'stroke-width': 2.5 }, svg);
  // person, hand at (hx, hy)
  svgEl('path', { d: `M${hx - 34} ${gy} L${hx - 30} ${hy + 14} M${hx - 22} ${gy} L${hx - 25} ${hy + 14}`, stroke: '#9b2f29', 'stroke-width': 7, 'stroke-linecap': 'round' }, svg);
  svgEl('rect', { x: hx - 38, y: hy - 18, width: 22, height: 36, rx: 6, fill: '#c93a33' }, svg);
  svgEl('line', { x1: hx - 20, y1: hy - 10, x2: hx - 2, y2: hy, stroke: '#c93a33', 'stroke-width': 7, 'stroke-linecap': 'round' }, svg);
  svgEl('circle', { cx: hx - 27, cy: hy - 30, r: 11, fill: '#ffe6b0', stroke: INK, 'stroke-width': 1.5 }, svg);
  const level = svgEl('line', { x1: hx, y1: hy, x2: W - 10, y2: hy, stroke: '#8a92a0', 'stroke-width': 2.2, 'stroke-dasharray': '8 6' }, svg);
  if (o.ghost) {
    const ex = hx + L * Math.cos(30 * RAD), ey = hy - L * Math.sin(30 * RAD);
    svgEl('line', { x1: hx, y1: hy, x2: ex, y2: ey, stroke: '#aab0bb', 'stroke-width': 2.2, 'stroke-dasharray': '7 5' }, svg);
    const gk = svgEl('g', { transform: `translate(${ex},${ey}) rotate(-18)`, opacity: 0.35 }, svg);
    svgEl('polygon', { points: '0,-36 18,-12 0,8 -18,-12', fill: '#9aa0ab' }, gk);
    const gl = add(lay, h('div', 'u9l3-slab u9l3-sghost', T(dg(30)))); place(gl, hx + 150 * Math.cos(15 * RAD) + 18, hy - 150 * Math.sin(15 * RAD) + 4);
  }
  const hLine = svgEl('line', { stroke: OPP, 'stroke-width': 4, 'stroke-dasharray': '9 6' }, svg);
  const rm = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 2 }, svg);
  const arc = svgEl('path', { fill: 'none', stroke: ANG, 'stroke-width': 3.2 }, svg);
  const str = svgEl('line', { stroke: INK, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, svg);
  const kite = svgEl('g', {}, svg);
  svgEl('polygon', { points: '0,-38 20,-13 0,8 -20,-13', fill: '#c93a33', stroke: INK, 'stroke-width': 1.5 }, kite);
  svgEl('path', { d: 'M0 -38 L0 8 M-20 -13 L20 -13', stroke: INK, 'stroke-width': 1, fill: 'none' }, kite);
  svgEl('path', { d: 'M0 8 C10 20 -10 28 3 42', stroke: '#9b2f29', 'stroke-width': 2, fill: 'none' }, kite);
  const angLab = add(lay, h('div', 'u9l3-slab u9l3-sang')), strLab = add(lay, h('div', 'u9l3-slab u9l3-sstr', '50 m')), hLab = add(lay, h('div', 'u9l3-slab u9l3-sh'));
  const S = {
    el, svg, lay, str, hLine, level, th: 0, hx, hy, L, hTxt: '',
    set(th, hTxt) {
      this.th = th; if (hTxt != null) this.hTxt = hTxt;
      const c = Math.cos(th * RAD), s = Math.sin(th * RAD), ex = hx + L * c, ey = hy - L * s;
      str.setAttribute('x1', hx); str.setAttribute('y1', hy); str.setAttribute('x2', ex); str.setAttribute('y2', ey);
      kite.setAttribute('transform', `translate(${ex},${ey}) rotate(${-18 + th * 0.1})`);
      hLine.setAttribute('x1', ex); hLine.setAttribute('x2', ex); hLine.setAttribute('y1', ey + 2); hLine.setAttribute('y2', hy);
      hLine.style.display = th > 2 ? '' : 'none';
      rm.setAttribute('d', th > 6 && th < 86 ? `M${ex - 13} ${hy} L${ex - 13} ${hy - 13} L${ex} ${hy - 13}` : '');
      const r = 46;
      arc.setAttribute('d', th > 1 ? `M${hx + r} ${hy} A${r} ${r} 0 0 0 ${hx + r * Math.cos(th * RAD)} ${hy - r * Math.sin(th * RAD)}` : '');
      angLab.innerHTML = T(dg(Math.round(th)));
      if (th > 12) place(angLab, hx + 74 * Math.cos(th / 2 * RAD), hy - 74 * Math.sin(th / 2 * RAD)); else place(angLab, hx + 74, hy - 18);
      place(strLab, hx + L / 2 * c - 26 * s, hy - L / 2 * s - 26 * c);
      hLab.innerHTML = this.hTxt; hLab.style.display = th > 4 && this.hTxt ? '' : 'none';
      place(hLab, ex + 10, (ey + hy) / 2, 'e', 0);
    }
  };
  S.set(o.th ?? 0, o.hTxt);
  return S;
}
function kiteTable(host, x, y, w, rows) {
  const el = add(host, box(h('div', 'u9l3-ktab'), w, null), x, y);
  el.innerHTML = '<div class="u9l3-kth">String angle</div><div class="u9l3-kth">Kite height</div>';
  const cells = rows.map((a) => { el.appendChild(h('div', 'u9l3-ktd', T(dg(a)))); const v = h('div', 'u9l3-ktd u9l3-ktv', '?'); el.appendChild(v); return v; });
  return { el, cells };
}
function mountWarm() {
  const host = document.getElementById('u9l3-wfig'); if (!host) return;
  kiteScene(host, { w: 620, h: 360, L: 250, th: 40, ghost: true, hTxt: '? m' });
  const tb = h('div', 'u9l3-wtab'); host.appendChild(tb); kiteTable(tb, null, null, 330, [90, 0, 30, 40]);
}
const kite = {
  title: 'Kite height: 50 m of string',
  height: 470,
  intro: '<b>50 m</b> of string. The angle with the level ground changes. How high is the kite above your hand? Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, S = kiteScene(stage, { x: 0, y: 0, w: 590, h: 470, L: 280, th: 60, hTxt: '' });
    const tb = kiteTable(stage, 606, 8, W - 616, [90, 0, 30, 40]);
    const P = panel(stage, 318, 10, 266, 150, '', 'u9l3-kpanel'); P.style.opacity = 0;
    const go = (c, th, txt) => { const a0 = S.th; return tween(c, 900, (t) => S.set(a0 + (th - a0) * t, t > 0.98 ? txt : '')); };
    const fill = async (c, i, html) => { tb.cells[i].innerHTML = html; await pop(c, tb.cells[i]); };
    const h40 = 50 * Math.sin(40 * RAD), x40 = 40 / Math.sin(40 * RAD);
    let G;
    return [
      { cap: '<b>90°</b>: the string goes straight up. All 50 m of it is height: <b>50 m</b>.', run: async (c) => { await go(c, 90, T('50\\text{ m}')); await fill(c, 0, T('50\\text{ m}')); } },
      { cap: '<b>0°</b>: the string lies flat along the level line. Height <b>0 m</b>.', run: async (c) => { await go(c, 0, ''); await fill(c, 1, T('0\\text{ m}')); } },
      { cap: '<b>30°</b>: the height is exactly <b>half</b> the string: <b>25 m</b>.', run: async (c) => { await go(c, 30, T('25\\text{ m}')); await fill(c, 2, T('25\\text{ m}')); } },
      { cap: '<b>40°</b>: guess first! About <b>22</b>, <b>29</b>, <b>32</b> or <b>38</b> m?', run: async (c) => { await go(c, 40, T('h')); tb.cells[3].classList.add('u9l3-ktq'); await pulse(c, tb.cells[3], 1.2); } },
      { cap: `The string is the <b class="u9l3-ch">hypotenuse</b>, the height is <b class="u9l3-co">opposite</b> the ${T(dg(40))} angle. SOH: ${T(`\\sin40^\\circ=\\dfrac{${rc('opp', 'h')}}{${rc('hyp', '50')}}`)}.`,
        run: async (c) => {
          await anim(c, S.str, [{ stroke: INK }, { stroke: HYP }], 300); S.str.setAttribute('stroke', HYP); S.str.style.strokeWidth = 5;
          await anim(c, S.level, [{ stroke: '#8a92a0' }, { stroke: ADJ }], 300); S.level.setAttribute('stroke', ADJ);
          P.style.opacity = 1; await say(c, P, T(`\\sin40^\\circ=\\dfrac{${rc('opp', 'h')}}{${rc('hyp', '50')}}`), 'u9l3-lnbig');
        } },
      { cap: `The unknown is on <b>top</b>, so <b>multiply</b>: ${T('h=50\\sin40^\\circ')} ${kbd('50 × sin 40 ) =')} ${T(`=${trunc(h40)}\\ldots\\approx 32.1`)} m. Answer <b>C</b>.`,
        run: async (c) => { await say(c, P, T(`h=50\\sin40^\\circ\\approx\\mathbf{32.1}\\text{ m}`)); S.set(40, T('32.1\\text{ m}')); await fill(c, 3, T('32.1\\text{ m}')); tb.cells[3].classList.remove('u9l3-ktq'); } },
      { cap: 'Height against angle is <b>not</b> a straight line: it climbs fast at low angles and levels off near 90°. Guess B (29 m) assumed a straight line from 30° to 90°.',
        run: async (c) => {
          G = new Graph(stage, { x: 606, y: 232, width: W - 616, height: 232, xmin: 0, xmax: 90, ymin: 0, ymax: 50, xstep: 10, ystep: 10, xlabels: 30, ylabels: 25, xtitle: '\\theta', ytitle: 'h', fontSize: 15 });
          await G.drawIn(G.segment([30, 25], [90, 50], { color: 'gray', dash: true, width: 2.5 }), 400, c);
          await G.drawIn(G.fn((x) => 50 * Math.sin(x * RAD), { from: 0, to: 90, color: OPP, width: 3.5, arrows: false }), 800, c);
          for (const [a, hv] of [[0, 0], [30, 25], [40, h40], [90, 50]]) await pop(c, G.point(a, hv, { color: OPP, r: 5.5 }), 200);
          await pop(c, G.point(40, 25 + 25 * 10 / 60, { color: 'gray', open: true, r: 5.5 }), 200);
        } },
      { cap: `Follow-up: at 40°, how much string puts the kite <b>40 m</b> up? ${T(`\\sin40^\\circ=\\dfrac{40}{x}`)}: the unknown is on the <b>bottom</b>, so <b>divide</b>: ${T(`x=40\\div\\sin40^\\circ\\approx${x40.toFixed(1)}`)} m.`,
        run: (c) => say(c, P, T(`x=40\\div\\sin40^\\circ\\approx${x40.toFixed(1)}\\text{ m}`)) }
    ];
  }
};

/* =============================== Pythagoras: squares on the sides =============================== */
const PY = {
  a: { a: 8.4, b: 6.3, sx: 1, la: '8.4', lb: '6.3', lc: 'r', unit: 'cm', unk: 'c', note: 'A 3–4–5 triangle scaled by 2.1: 6.3, 8.4, 10.5.' },
  b: { a: 12, b: 5, sx: -1, la: '12.0', lb: '5.0', lc: 's', unit: 'mm', unk: 'c', note: 'A 5–12–13 triangle: worth remembering.' },
  leg: { a: 6, b: 8, sx: 1, la: '6', lb: 'x', lc: '10', unit: '', unk: 'b', note: 'A 6–8–10 triangle: 3–4–5 doubled.' }
};
const sq2 = (v) => texNum(v * v, 4);
const pyth = {
  title: 'Two sides known: the Pythagorean theorem',
  height: 450,
  choices: [{ sep: 'Check' }, { v: 'a', label: 'Example 1(a)' }, { v: 'b', label: 'Example 1(b)' }, { sep: 'Idea' }, { v: 'leg', label: 'A leg unknown: subtract' }],
  intro: (k) => (k === 'leg' ? 'Hypotenuse <b>10</b>, one leg <b>6</b>. Find the other leg <b>x</b>. Press <b>Next</b>.' : 'Two legs are known, no angle is given. Find the hypotenuse. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = PY[k], W = ex.W, fw = 520, fh = 440;
    // math coords (y up): right angle C at 0, A along x, B along y
    const C = [0, 0], A = [d.sx * d.a, 0], B = [0, d.b], cc = Math.hypot(d.a, d.b);
    const sqA = [C, A, [A[0], -d.a], [0, -d.a]], sqB = [C, B, [-d.sx * d.b, d.b], [-d.sx * d.b, 0]];
    const n = [d.sx * d.b, d.a], sqC = [A, B, [B[0] + n[0], B[1] + n[1]], [A[0] + n[0], A[1] + n[1]]];
    const all = [...sqA, ...sqB, ...sqC], xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = Math.min((fw - 40) / (x1 - x0), (fh - 30) / (y1 - y0)), ox = (fw - s * (x1 - x0)) / 2 - s * x0, oy = (fh - s * (y1 - y0)) / 2 + s * y1;
    const px = (p) => [ox + s * p[0], oy - s * p[1]], pts = (q) => q.map((p) => px(p).join(',')).join(' ');
    const el = add(stage, box(h('div', 'u9l3-sqfig'), fw, fh), 0, 0);
    const svg = svgEl('svg', { width: fw, height: fh, viewBox: `0 0 ${fw} ${fh}` }, el), lay = h('div', 'u9l3-shtml'); el.appendChild(lay);
    const mk = (q, col) => { const p = svgEl('polygon', { points: pts(q), fill: col, 'fill-opacity': 0.16, stroke: col, 'stroke-width': 2.5 }, svg); p.style.opacity = 0; return p; };
    const pA = mk(sqA, ADJ), pB = mk(sqB, OPP), pC = mk(sqC, HYP);
    svgEl('polygon', { points: pts([A, B, C]), fill: '#f2f8f7', stroke: INK, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, svg);
    const Cp = px(C), Ap = px(A), Bp = px(B), m = 15;
    svgEl('path', { d: `M${Cp[0] + d.sx * m} ${Cp[1]} L${Cp[0] + d.sx * m} ${Cp[1] - m} L${Cp[0]} ${Cp[1] - m}`, fill: 'none', stroke: INK, 'stroke-width': 2 }, svg);
    const lab = (p, html, cls = '') => { const e = add(lay, h('div', 'u9l3-slab ' + cls, html)); place(e, p[0], p[1]); return e; };
    const cen = (q) => px([q.reduce((a, p) => a + p[0], 0) / 4, q.reduce((a, p) => a + p[1], 0) / 4]);
    const u = d.unit ? `\\text{ ${d.unit}}` : '';
    // side labels just outside the triangle (they sit where the squares will appear)
    const sa = lab([(Cp[0] + Ap[0]) / 2, Cp[1] + 18], T(d.la + u)), sb = lab([Cp[0] - d.sx * 30, (Cp[1] + Bp[1]) / 2], T(d.lb + u));
    const hm = [(Ap[0] + Bp[0]) / 2, (Ap[1] + Bp[1]) / 2], hn = [n[0] / cc, -n[1] / cc];
    const sc = lab([hm[0] + hn[0] * 26, hm[1] + hn[1] * 26], T(d.lc + (k === 'leg' ? '' : '')), 'u9l3-slabc');
    if (k === 'leg') sb.classList.add('u9l3-find'); else sc.classList.add('u9l3-find');
    const area = (q, html, col) => { const e = lab(cen(q), html, 'u9l3-area'); e.style.color = col; e.style.opacity = 0; return e; };
    const a2 = d.a * d.a, b2 = d.b * d.b, c2 = a2 + b2;
    const P = panel(stage, fw + 16, 14, W - fw - 26, 420, 'On the board');
    const steps = [];
    const unkName = k === 'leg' ? 'x' : d.lc;
    steps.push({ cap: 'Two sides are known and <b>no angle</b> is given: this is the <b>Pythagorean theorem</b>, not a trig ratio.',
      run: async (c) => { await say(c, P, T('c^2=a^2+b^2'), 'u9l3-lnbig'); const st = stamp(P, 'No trig needed', { ok: null, size: 'sm', rotate: -4 }); st.classList.add('u9l3-pst'); await stampIn(c, st); } });
    if (k !== 'leg') {
      steps.push({ cap: `Build a square on each leg: ${T(`${d.lb}^2=${sq2(d.b)}`)} and ${T(`${d.la}^2=${sq2(d.a)}`)}.`,
        run: async (c) => {
          const eA = area(sqA, T(`${d.la}^2`) + '<br>' + T(`=${sq2(d.a)}`), ADJ), eB = area(sqB, T(`${d.lb}^2`) + '<br>' + T(`=${sq2(d.b)}`), OPP);
          sa.style.opacity = 0; sb.style.opacity = 0;
          await appear(c, pB, 400); await fadeIn(c, eB); await appear(c, pA, 400); await fadeIn(c, eA);
        } });
      steps.push({ cap: `The square on the hypotenuse holds <b>both</b>: ${T(`${unkName}^2=${sq2(d.b)}+${sq2(d.a)}=${texNum(c2, 4)}`)}.`,
        run: async (c) => { const eC = area(sqC, T(`${unkName}^2`) + '<br>' + T(`=${texNum(c2, 4)}`), HYP); await appear(c, pC, 500); await fadeIn(c, eC); await say(c, P, T(`${unkName}^2=${d.lb}^2+${d.la}^2=${texNum(c2, 4)}`)); } });
      steps.push({ cap: `Undo the square with a square root: ${T(`${unkName}=\\sqrt{${texNum(c2, 4)}}=${cc.toFixed(1)}`)} ${d.unit}.`,
        run: async (c) => { sc.innerHTML = T(`${unkName}=${cc.toFixed(1)}${u}`); sc.classList.remove('u9l3-find'); sc.classList.add('u9l3-known'); await pop(c, sc); await say(c, P, T(`${unkName}=\\sqrt{${texNum(c2, 4)}}=\\mathbf{${cc.toFixed(1)}}${u}`)); await say(c, P, kbd(`√ ${d.lb} x² + ${d.la} x² ) =`), 'u9l3-lnsm'); } });
    } else {
      steps.push({ cap: `This time the <b>hypotenuse</b> is known. Its square is the whole: ${T('10^2=100')}. The known leg's square: ${T('6^2=36')}.`,
        run: async (c) => {
          const eC = area(sqC, T('10^2') + '<br>' + T('=100'), HYP), eA = area(sqA, T('6^2') + '<br>' + T('=36'), ADJ);
          sa.style.opacity = 0; await appear(c, pC, 450); await fadeIn(c, eC); await appear(c, pA, 400); await fadeIn(c, eA);
        } });
      steps.push({ cap: `The missing square is what is left: <b>subtract first</b>. ${T('x^2=100-36=64')}.`,
        run: async (c) => { const eB = area(sqB, T('x^2') + '<br>' + T('=64'), OPP); await appear(c, pB, 450); await fadeIn(c, eB); await say(c, P, T('x^2=10^2-6^2=100-36=64')); } });
      steps.push({ cap: `Square root: ${T('x=\\sqrt{64}=8')}. Adding instead (${T('\\sqrt{136}\\approx11.7')}) would make a leg longer than the hypotenuse.`,
        run: async (c) => { sb.innerHTML = T('x=8'); sb.style.opacity = 1; sb.classList.remove('u9l3-find'); sb.classList.add('u9l3-known'); await pop(c, sb); await say(c, P, T('x=\\sqrt{64}=\\mathbf{8}')); await say(c, P, kbd('√ 10 x² − 6 x² ) ='), 'u9l3-lnsm'); } });
    }
    steps.push({ cap: d.note + ' Sense check: the hypotenuse is the <b>longest</b> side ✓',
      run: async (c) => { const st = stamp(P, 'Longest side: hyp ✓', { ok: true, size: 'sm', rotate: 3 }); st.classList.add('u9l3-pst'); await stampIn(c, st); } });
    return steps;
  }
};

/* =============================== pick the ratio =============================== */
const PB = {
  itop: { tri: 'idea', lab: { vert: 'x', hyp: '10' }, fn: 'sin', giv: 'hyp', unk: 'opp', k: 10, u: 'x', unit: '', dp: 0 },
  ibot: { tri: 'idea', lab: { vert: '5', hyp: 'x' }, fn: 'sin', giv: 'opp', unk: 'hyp', k: 5, u: 'x', unit: '', dp: 0 },
  e2: { tri: 'e2', fn: 'sin', giv: 'hyp', unk: 'opp', k: 16.4, u: 'x', unit: 'cm', dp: 1 },
  e3a: { tri: 'e3', fn: 'sin', giv: 'hyp', unk: 'opp', k: 6.8, u: 'h', unit: 'm', dp: 1 },
  e3b: { tri: 'e3', fn: 'cos', giv: 'hyp', unk: 'adj', k: 6.8, u: 'd', unit: 'm', dp: 1 },
  e4: { tri: 'e4', fn: 'sin', giv: 'opp', unk: 'hyp', k: 9.4, u: 'c', unit: 'cm', dp: 1 },
  e5: { tri: 'e5', lab: { hyp: 'JK' }, fn: 'sin', giv: 'opp', unk: 'hyp', k: 11.2, u: 'JK', unit: 'mm', dp: 1 },
  e6: { tri: 'e6', fn: 'tan', giv: 'opp', unk: 'adj', k: 9.5, u: 'AC', unit: 'cm', dp: 1 },
  e7a: { tri: 'e7', fn: 'tan', giv: 'adj', unk: 'opp', k: 71, u: 'DE', unit: 'm', dp: 0 },
  e7b: { tri: 'e7', fn: 'cos', giv: 'adj', unk: 'hyp', k: 71, u: 'DF', unit: 'm', dp: 0 }
};
/** everything a problem needs, worked out before any step runs */
function info(p) {
  const d = TRI[p.tri], deg = d.deg, top = RAT[p.fn][0] === p.unk, f = TRIG[p.fn](deg);
  const val = top ? p.k * f : p.k / f, wrong = top ? p.k / f : p.k * f;
  const kt = texNum(p.k), fnT = `\\${p.fn}${dg(deg)}`, uT = rc(p.unk, p.u), kT = rc(p.giv, kt);
  const frac = top ? `\\dfrac{${uT}}{${kT}}` : `\\dfrac{${kT}}{${uT}}`;
  const ans = val.toFixed(p.dp), exact = Math.abs(val - Number(ans)) < 1e-9, unit = p.unit ? `\\text{ ${p.unit}}` : '';
  const keys = `${kt} ${top ? '×' : '÷'} ${p.fn} ${deg} ) =`;
  const expr = top ? `${kt}\\${p.fn}${dg(deg)}` : `\\dfrac{${kt}}{${fnT}}`;
  const valT = exact ? `${ans}` : `${trunc(val)}\\ldots\\approx\\mathbf{${ans}}`;
  // sense check
  let chk, bad = null;
  if (p.unk === 'hyp') { chk = `The hypotenuse is the <b>longest</b> side: ${T(`${ans}>${kt}`)} ✓`; bad = `Multiplying instead gives ${T(`${kt}\\${p.fn}${dg(deg)}\\approx${wrong.toFixed(2)}`)}: shorter than a leg. Impossible for the hypotenuse.`; }
  else if (p.giv === 'hyp') chk = `A leg is <b>shorter</b> than the hypotenuse: ${T(`${ans}<${kt}`)} ✓`;
  else {
    const oppLonger = deg > 45, unkLonger = (p.unk === 'opp') === oppLonger;
    chk = `${T(dg(deg) + (oppLonger ? '>' : '<') + '45^\\circ')}, so the <b>${oppLonger ? 'opposite' : 'adjacent'}</b> leg is the longer leg: ${T(`${ans}${unkLonger ? '>' : '<'}${kt}`)} ✓`;
    bad = `${top ? 'Dividing' : 'Multiplying'} instead gives ${T(`${top ? `\\dfrac{${kt}}{${fnT}}` : `${kt}\\${p.fn}${dg(deg)}`}\\approx${wrong.toFixed(2)}`)}: the wrong leg would be longer.`;
  }
  return { d, deg, top, val, wrong, kt, fnT, uT, kT, frac, ans, exact, unit, keys, expr, valT, chk, bad, num: RAT[p.fn][0], den: RAT[p.fn][1] };
}
function ratioCards(stage, x, y, w, fns = ['sin', 'cos', 'tan']) {
  const cw = (w - 2 * 12) / 3;
  return fns.map((fn, i) => {
    const el = add(stage, box(h('div', 'u9l3-rcd', `<div class="u9l3-rcdh">${MN[fn].split('').map((ch, j) => `<span class="u9l3-mn${j}">${ch}</span>`).join('')}</div><div class="u9l3-rcdm">${T(ratioT(fn))}</div>`), cw, 132), x + i * (cw + 12), y);
    el.fn = fn; return el;
  });
}
const SW = { tri: 'sw' };
const pick = {
  title: 'Which ratio? Name the sides, then look for both',
  height: 400,
  choices: [{ sep: 'Idea' }, { v: 'sw', label: 'The angle switches corners' }, { sep: 'Check' }, { v: 'e3a', label: 'Example 3(a)' }, { v: 'e3b', label: 'Example 3(b)' }, { v: 'e6', label: 'Example 6' }, { v: 'e7a', label: 'Example 7(a)' }, { v: 'e7b', label: 'Example 7(b)' }],
  intro: (k) => (k === 'sw' ? 'The names <b>opposite</b> and <b>adjacent</b> depend on which angle you stand at. Press <b>Next</b>.' : 'Name each side from the given angle, then find the ratio that holds the known side <b>and</b> the unknown. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const W = ex.W;
    if (k === 'sw') {
      const t = mkTri(stage, 'sw', { x: 0, y: 10, w: 400, h: 370, pad: 70, r: 36 });
      const P = panel(stage, 420, 20, W - 430, 360, 'From the angle');
      return [
        { cap: `Stand at the marked angle ${T('\\theta')}. The side <b>across</b> from it is opposite, the leg <b>touching</b> it is adjacent, the side across from the right angle is the hypotenuse.`,
          run: async (c) => { await tagRoles(c, t, { long: true }); await say(c, P, T(`\\sin\\theta=\\dfrac{${rc('opp', '3')}}{${rc('hyp', '5')}}`), 'u9l3-lnbig'); } },
        { cap: `Now move the angle to the <b>other</b> corner. The sides <b>relabel themselves</b>.`,
          run: async (c) => {
            const a = t.arcs[t.av()]; await anim(c, a, [{ opacity: 1 }, { opacity: 0 }], 300); a.remove(); if (a.label) a.label.remove();
            clearRoles(t); t.d.ang = 'top'; const g = t.angle(t.av(), '\\theta', { color: ANG, r: 36 }); await fadeIn(c, g); if (g.label) await fadeIn(c, g.label);
            await tagRoles(c, t, { long: true });
          } },
        { cap: `Opposite and adjacent <b>swapped</b>. The hypotenuse never moves: it is always across from the right angle. Now ${T(`\\sin\\theta=\\dfrac{${rc('opp', '4')}}{${rc('hyp', '5')}}`)}.`,
          run: (c) => say(c, P, T(`\\sin\\theta=\\dfrac{${rc('opp', '4')}}{${rc('hyp', '5')}}`), 'u9l3-lnbig') }
      ];
    }
    const p = PB[k], I = info(p);
    const t = mkTri(stage, p.tri, { x: 0, y: 6, w: 360, h: 380, pad: 66, lab: p.lab, r: 28 });
    const cards = ratioCards(stage, 380, 14, W - 390);
    const P = panel(stage, 380, 162, W - 390, 226, '');
    const miss = (fn) => [p.giv, p.unk].filter((r) => !RAT[fn].includes(r));
    return [
      { cap: `From the ${T(dg(I.deg))} angle, name every side.`, run: (c) => tagRoles(c, t) },
      { cap: `Known: ${T(I.kT)}, the <b>${LONG[p.giv]}</b>. Unknown: ${T(I.uT)}, the <b>${LONG[p.unk]}</b>.`,
        run: async (c) => { await markLab(c, t, p.giv, 'known'); await markLab(c, t, p.unk, 'find'); await dimRole(c, t, ['opp', 'adj', 'hyp'].find((r) => r !== p.giv && r !== p.unk)); } },
      { cap: `Which ratio holds <b>both</b> the ${LONG[p.giv]} and the ${LONG[p.unk]}? Only <b>${MN[p.fn]}</b>: the <b>${WORD[p.fn]}</b> ratio.`,
        run: async (c) => {
          for (const cd of cards) {
            if (cd.fn === p.fn) { cd.classList.add('u9l3-rcd-on'); await pulse(c, cd, 1.06); continue; }
            cd.classList.add('u9l3-rcd-off'); const x = add(cd, h('div', 'u9l3-rcdx', `✗ no ${miss(cd.fn)[0]}`)); await pop(c, x, 300);
          }
        } },
      { cap: `Fill it in: ${T(`${I.fnT}=${I.frac}`)}. The unknown is ${I.top ? 'on <b>top</b>: multiply' : 'on the <b>bottom</b>: divide'}.`,
        run: async (c) => { await say(c, P, T(`${I.fnT}=${I.frac}`), 'u9l3-lnhuge'); await say(c, P, rulePill(I.top)); } }
    ];
  }
};
const rulePill = (top) => `<span class="u9l3-rule ${top ? 'u9l3-rtop' : 'u9l3-rbot'}">unknown ${top ? 'on top → <b>multiply</b>' : 'on the bottom → <b>divide</b>'}</span>`;

/* =============================== the balance =============================== */
class Bal {
  constructor(stage, x, y, w, hh) {
    const el = this.el = add(stage, box(h('div', 'u9l3-bal'), w, hh), x, y);
    const svg = svgEl('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}`, class: 'u9l3-bsvg' }, el);
    const cx = this.cx = w / 2, ty = this.ty = hh - 52, py = this.py = ty + 22;
    this.L = Math.round(w * 0.27); this.pw = Math.round(w * 0.42);
    svgEl('path', { d: `M${cx - 48} ${hh - 2} H${cx + 48} L${cx + 10} ${py} H${cx - 10} Z`, class: 'u9l3-base' }, svg);
    this.rods = [svgEl('line', { class: 'u9l3-rod' }, svg), svgEl('line', { class: 'u9l3-rod' }, svg)];
    this.beam = svgEl('line', { class: 'u9l3-beam' }, svg);
    svgEl('circle', { cx, cy: py, r: 7, class: 'u9l3-piv' }, svg);
    this.eq = add(el, h('div', 'u9l3-beq', '=')); place(this.eq, cx, ty - 34);
    this.pans = [-1, 1].map((s) => {
      const p = add(el, box(h('div', 'u9l3-pan'), this.pw, ty + 10), cx + s * this.L - this.pw / 2, 0);
      p.cont = add(p, h('div', 'u9l3-cont')); add(p, h('div', 'u9l3-tray')); return p;
    });
    this.setTilt(0);
  }
  setTilt(th) {
    this.th = th;
    const { cx, py, L, ty } = this, co = Math.cos(th), si = Math.sin(th);
    const ends = [[cx - L * co, py + L * si], [cx + L * co, py - L * si]];
    this.beam.setAttribute('x1', ends[0][0]); this.beam.setAttribute('y1', ends[0][1]); this.beam.setAttribute('x2', ends[1][0]); this.beam.setAttribute('y2', ends[1][1]);
    ends.forEach((e, i) => {
      const dx = e[0] - (cx + (i ? 1 : -1) * L), dy = e[1] - py, r = this.rods[i];
      this.pans[i].style.transform = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px)`;
      r.setAttribute('x1', e[0]); r.setAttribute('y1', e[1]); r.setAttribute('x2', e[0]); r.setAttribute('y2', ty + 10 + dy);
    });
  }
  tilt(c, th, ms = 300) { const t0 = this.th; return tween(c, ms, (t) => this.setTilt(t0 + (th - t0) * t)); }
  async wobble(c) { await this.tilt(c, 0.05, 200); await this.tilt(c, -0.03, 200); await this.tilt(c, 0, 200); }
  set(i, tx) { this.pans[i].cont.innerHTML = T(tx); }
  async swap(c, i, tx) {
    const ct = this.pans[i].cont; await anim(c, ct, [{ opacity: 1 }, { opacity: 0 }], 180);
    ct.innerHTML = T(tx); await anim(c, ct, [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'none' }], 320);
  }
  async both(c, html, a, b) {
    const bs = [-1, 1].map((s) => { const e = add(this.el, h('div', 'u9l3-badge', html)); place(e, this.cx + s * this.L, 16); return e; });
    await Promise.all(bs.map((e) => pop(c, e, 320)));
    await Promise.all([this.swap(c, 0, a), this.swap(c, 1, b)]);
    await this.wobble(c); bs.forEach((e) => e.remove());
  }
}

/* =============================== the star: solve with the balance =============================== */
function solveSteps(stage, k, ex) {
  const W = ex.W, p = PB[k], I = info(p), RX = 356, RW = W - RX - 10;
  const t = mkTri(stage, p.tri, { x: 0, y: 0, w: 340, h: 330, pad: 62, lab: p.lab, r: 28 });
  const card = add(stage, box(h('div', 'u9l3-rcard'), RW, 74), RX, 8);
  const bal = new Bal(stage, RX, 92, RW, 214); bal.el.style.opacity = 0;
  const R = panel(stage, RX, 314, RW, 152, '', 'u9l3-res');
  const K = panel(stage, 8, 338, 334, 128, 'Sense check', 'u9l3-chk');
  const other = ['opp', 'adj', 'hyp'].find((r) => r !== p.giv && r !== p.unk);
  const fnT = I.fnT;
  const steps = [
    { cap: `Mark the angle, ${T(dg(I.deg))}. From it, name every side: <b class="u9l3-co">opposite</b>, <b class="u9l3-ca">adjacent</b>, <b class="u9l3-ch">hypotenuse</b>.`,
      run: (c) => tagRoles(c, t) },
    { cap: `Known: ${T(I.kT)} (${p.giv}). Unknown: ${T(I.uT)} (${p.unk}). The ratio that holds <b>both</b>: <b>${MN[p.fn]}</b>, the ${WORD[p.fn]}.`,
      run: async (c) => {
        await markLab(c, t, p.giv, 'known'); await markLab(c, t, p.unk, 'find');
        await Promise.all([dimRole(c, t, other), glowRole(c, t, p.giv), glowRole(c, t, p.unk)]);
        card.innerHTML = `<div class="u9l3-rcm">${T(ratioT(p.fn, dg(I.deg)))}</div>`; await fadeIn(c, card.firstChild);
      } },
    { cap: `Fill in the two sides: ${T(`${fnT}=${I.frac}`)}. The unknown is ${I.top ? 'on <b>top</b>' : 'on the <b>bottom</b>'}.`,
      run: async (c) => {
        card.innerHTML = `<div class="u9l3-rcm">${T(`${fnT}=${I.frac}`)}</div>`; await fadeIn(c, card.firstChild);
        const r = add(card, h('div', '', rulePill(I.top))); await pop(c, r);
      } },
    { cap: 'Put the equation on a balance: the two sides are <b>equal</b>, so it is level.',
      run: async (c) => { bal.set(0, fnT); bal.set(1, I.frac); await appear(c, bal.el, 400); } }
  ];
  if (I.top) {
    steps.push({ cap: `${T(I.uT)} is being divided by ${T(I.kT)}. Undo it: <b>multiply both pans</b> by ${T(I.kT)}. Still level.`,
      run: (c) => bal.both(c, '× ' + p.k, `${I.kT}${fnT}`, I.uT) });
  } else {
    steps.push({ cap: `${T(I.uT)} is stuck <b>underneath</b>. Multiply both pans by ${T(I.uT)} (cross-multiply): ${T(`${I.uT}${fnT}=${I.kT}`)}.`,
      run: (c) => bal.both(c, '× ' + p.u, `${I.uT}${fnT}`, I.kT) });
    steps.push({ cap: `Now <b>divide both pans</b> by ${T(fnT)}. One division frees ${T(I.uT)}.`,
      run: (c) => bal.both(c, '÷ ' + p.fn + ' ' + I.deg + '°', I.uT, `\\dfrac{${I.kT}}{${fnT}}`) });
  }
  steps.push({ cap: `${T(`${p.u}=${I.expr}`)}: ${kbd(I.keys)} ${T(`=${I.valT}`)}${p.unit ? ' ' + p.unit : ''}. Round only at the end.`,
    run: async (c) => {
      await say(c, R, T(`${I.uT}=${I.top ? `${I.kT}${fnT}` : `\\dfrac{${I.kT}}{${fnT}}`}`), 'u9l3-lnbig');
      await say(c, R, kbd(I.keys), 'u9l3-lnsm');
      await say(c, R, T(`${I.uT}=${I.valT}${I.unit}`), 'u9l3-lnbig');
      const L = sideLabel(t, t.roleKey(p.unk), T(`${p.u}\\approx${I.ans}${I.unit}`), 'u9l3-known'); placeTag(t, p.unk); await pop(c, L);
    } });
  steps.push({ cap: 'Sense check. ' + I.chk + (I.bad ? ' ' + I.bad : ''),
    run: async (c) => {
      await say(c, K, I.chk, 'u9l3-lnsm');
      const st = stamp(K, '✓', { ok: true, x: 296, y: 24 }); await stampIn(c, st);
    } });
  return steps;
}
const solveDef = (title, choices, intro) => ({ title, height: 470, choices, intro, make: solveSteps });
const solveTop = solveDef('Unknown on top → multiply', [{ sep: 'Idea' }, { v: 'itop', label: 'Unknown on top' }, { sep: 'Check' }, { v: 'e2', label: 'Example 2' }, { v: 'e3a', label: 'Example 3(a)' }, { v: 'e3b', label: 'Example 3(b)' }],
  (k) => (k === 'itop' ? 'Hypotenuse <b>10</b>, angle <b>30°</b>. Find <b>x</b>, the side opposite the angle. Press <b>Next</b>.' : 'Name the sides, pick the ratio, then free the unknown on a balance. Press <b>Next</b>.'));
const solveBot = solveDef('Unknown on the bottom → divide', [{ sep: 'Idea' }, { v: 'ibot', label: 'Unknown on the bottom' }, { sep: 'Check' }, { v: 'e4', label: 'Example 4' }, { v: 'e5', label: 'Example 5' }],
  (k) => (k === 'ibot' ? 'The same 30° triangle, but now the opposite leg is <b>5</b> and the hypotenuse <b>x</b> is unknown. Press <b>Next</b>.' : 'The unknown lands in the denominator. Press <b>Next</b>.'));

/* =============================== Example 7: two sides, and the check =============================== */
const solve7 = {
  title: 'More than one side: start each from the given side',
  height: 470,
  choices: [{ sep: 'Check' }, { v: 'e6', label: 'Example 6' }, { v: 'e7a', label: 'Example 7(a)' }, { v: 'e7b', label: 'Example 7(b)' }, { v: 'chk', label: 'Check Example 7' }],
  intro: (k) => (k === 'chk' ? 'Both answers to Example 7, checked without trig. Press <b>Next</b>.' : 'Set the ratio up from the <b>given</b> side and the <b>given</b> angle. Press <b>Next</b>.'),
  make(stage, k, ex) {
    if (k !== 'chk') return solveSteps(stage, k, ex);
    const W = ex.W, de = 71 * Math.tan(64 * RAD), df = 71 / Math.cos(64 * RAD);
    const t = mkTri(stage, 'e7', { x: 0, y: 0, w: 330, h: 440, pad: 66, r: 30, lab: { vert: 'DE', hyp: 'DF' } });
    const f4 = (v) => texNum(v, 1).replace(/^(\d+)(\d{3})/, '$1\\,$2');
    const k1 = checkCard(stage, { title: 'Pythagoras check', left: ['71^2+' + de.toFixed(4) + '^2', '5041+' + texNum(de * de, 1), f4(71 * 71 + de * de)], right: [df.toFixed(4) + '^2', f4(df * df)], ok: true, x: 350, y: 10, width: W - 360, hidden: true });
    const P = panel(stage, 350, 268, W - 360, 196, '');
    return [
      { cap: 'Keep the <b>unrounded</b> answers: the legs squared and added should give the hypotenuse squared.', run: (c) => k1.play(c) },
      { cap: `The angles: ${T('90^\\circ+64^\\circ+26^\\circ=180^\\circ')} ✓. The larger acute angle, ${T('64^\\circ')}, faces the longer leg: ${T('DE\\approx146>EF=71')} ✓`,
        run: async (c) => { const g = t.angle('D', '26^\\circ', { color: COLORS.slate, r: 34 }); await fadeIn(c, g); if (g.label) await fadeIn(c, g.label); await say(c, P, T('90^\\circ+64^\\circ+26^\\circ=180^\\circ') + ' ✓'); await say(c, P, T('64^\\circ>26^\\circ\\ \\Rightarrow\\ DE>EF') + ' ✓'); } },
      { cap: 'Both answers were built from the <b>given</b> 71 m and 64°, never from the rounded 146: a rounding slip can’t carry from (a) into (b).',
        run: async (c) => { await say(c, P, `<b>(a)</b> ${T('DE=71\\tan64^\\circ\\approx146')} m &nbsp; <b>(b)</b> ${T('DF=\\dfrac{71}{\\cos64^\\circ}\\approx162')} m`, 'u9l3-lnsm'); const st = stamp(P, 'From the given', { ok: true, size: 'sm', rotate: -4 }); st.classList.add('u9l3-pst'); await stampIn(c, st); } }
    ];
  }
};

/* =============================== Example 3: the ladder =============================== */
function ladderScene(stage, x, y, w, hh, k) {
  const el = add(stage, box(h('div', 'u9l3-scene'), w, hh), x, y);
  const svg = svgEl('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, el), lay = h('div', 'u9l3-shtml'); el.appendChild(lay);
  const wx = 100, gy = hh - 44, L = 6.8 * k;
  svgEl('rect', { x: 0, y: 0, width: w, height: gy, fill: '#eef3f8' }, svg);
  svgEl('rect', { x: 0, y: gy, width: w, height: hh - gy, fill: '#d9d2c3' }, svg);
  svgEl('rect', { x: 26, y: 14, width: wx - 26, height: gy - 14, fill: '#d8a48f' }, svg);
  for (let yy = gy - 22, r = 0; yy > 14; yy -= 22, r++) {
    svgEl('line', { x1: 26, x2: wx, y1: yy, y2: yy, stroke: '#f3e6df', 'stroke-width': 2 }, svg);
    for (let xx = 26 + (r % 2 ? 18 : 37); xx < wx; xx += 37) svgEl('line', { x1: xx, x2: xx, y1: yy, y2: yy + 22, stroke: '#f3e6df', 'stroke-width': 2 }, svg);
  }
  svgEl('line', { x1: 0, x2: w, y1: gy, y2: gy, stroke: '#6d6352', 'stroke-width': 3 }, svg);
  svgEl('path', { d: `M${wx + 14} ${gy} L${wx + 14} ${gy - 14} L${wx} ${gy - 14}`, fill: 'none', stroke: INK, 'stroke-width': 2 }, svg);
  const hBar = svgEl('line', { stroke: OPP, 'stroke-width': 7, 'stroke-linecap': 'round', x1: wx - 7, x2: wx - 7, y2: gy }, svg);
  const dBar = svgEl('line', { stroke: ADJ, 'stroke-width': 7, 'stroke-linecap': 'round', x1: wx, y1: gy + 9, y2: gy + 9 }, svg);
  const arc = svgEl('path', { fill: 'none', stroke: ANG, 'stroke-width': 3.2 }, svg);
  const rails = svgEl('path', { fill: 'none', stroke: '#8a5a2b', 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
  const rungs = svgEl('path', { fill: 'none', stroke: '#8a5a2b', 'stroke-width': 3 }, svg);
  const lab = (cls) => add(lay, h('div', 'u9l3-slab ' + cls));
  const hL = lab('u9l3-shl'), dL = lab('u9l3-sdl'), lL = lab('u9l3-sll'), aL = lab('u9l3-sang');
  const S = {
    el, lay, rails, th: 68, hTxt: 'h', dTxt: 'd',
    set(th) {
      this.th = th;
      const c = Math.cos(th * RAD), s = Math.sin(th * RAD), F = [wx + L * c, gy], Tp = [wx, gy - L * s], nx = s * 7, ny = c * 7;
      rails.setAttribute('d', `M${F[0] - nx} ${F[1] - ny} L${Tp[0] - nx} ${Tp[1] - ny} M${F[0] + nx} ${F[1] + ny} L${Tp[0] + nx} ${Tp[1] + ny}`);
      let d = ''; for (let i = 1; i < 18; i++) { const t = i / 18, px = F[0] + (Tp[0] - F[0]) * t, py = F[1] + (Tp[1] - F[1]) * t; d += `M${px - nx} ${py - ny} L${px + nx} ${py + ny}`; }
      rungs.setAttribute('d', d);
      hBar.setAttribute('y1', Tp[1]); dBar.setAttribute('x2', F[0]);
      const r = 40; arc.setAttribute('d', `M${F[0] - r} ${gy} A${r} ${r} 0 0 1 ${F[0] - r * c} ${gy - r * s}`);
      aL.innerHTML = T(dg(Math.round(th))); place(aL, F[0] - 64 * Math.cos(th / 2 * RAD), gy - 64 * Math.sin(th / 2 * RAD));
      hL.innerHTML = T(this.hTxt); place(hL, wx - 16, (gy + Tp[1]) / 2, 'w', 0);
      dL.innerHTML = T(this.dTxt); place(dL, (wx + F[0]) / 2, gy + 16, 's', 0);
      lL.innerHTML = T('6.8\\text{ m}'); place(lL, (F[0] + Tp[0]) / 2 + 22 * s, (F[1] + Tp[1]) / 2 + 4, 'e', 4);
    }
  };
  S.set(68); return S;
}
const ladder = {
  title: 'Example 3: the ladder',
  height: 450,
  choices: [{ sep: 'Idea' }, { v: 'slide', label: 'Slide the ladder' }, { sep: 'Check' }, { v: 'ab', label: 'Example 3(a)–(b)' }, { v: 'cd', label: 'Example 3(c)–(d)' }],
  intro: (k) => (k === 'slide' ? 'The ladder is always <b>6.8 m</b> long. Watch the height and the distance as the angle changes. Press <b>Next</b>.'
    : k === 'ab' ? 'A 6.8 m ladder at 68° to the ground. How high? How far out? Press <b>Next</b>.' : 'Why do (b) and (c) disagree? Press <b>Next</b>.'),
  make(stage, k, ex) {
    const W = ex.W, S = ladderScene(stage, 0, 0, 440, 450, 56);
    const P = panel(stage, 456, 10, W - 466, k === 'cd' ? 220 : 430, k === 'slide' ? 'Live' : 'On the board');
    const hT = 6.8 * Math.sin(68 * RAD), dT = 6.8 * Math.cos(68 * RAD), dC = Math.sqrt(6.8 ** 2 - 6.3 ** 2);
    if (k === 'slide') {
      const live = lineEl(P, '', 'u9l3-lnbig u9l3-live');
      const upd = () => { const th = S.th; live.innerHTML = `${T('\\theta')} = <b>${th.toFixed(0)}°</b><br><span class="u9l3-co">${T('h=6.8\\sin\\theta')}</span> = <b class="u9l3-co">${(6.8 * Math.sin(th * RAD)).toFixed(2)}</b> m<br><span class="u9l3-ca">${T('d=6.8\\cos\\theta')}</span> = <b class="u9l3-ca">${(6.8 * Math.cos(th * RAD)).toFixed(2)}</b> m`; };
      upd();
      const go = (c, th, ms = 1300) => { const a0 = S.th; return tween(c, ms, (t) => { S.set(a0 + (th - a0) * t); upd(); }); };
      return [
        { cap: 'Steeper: the ladder reaches <b>higher</b> and its foot comes <b>closer</b> to the wall. The ladder (the hypotenuse) never changes.', run: (c) => go(c, 82) },
        { cap: 'Flatter: lower on the wall, farther out. At 45° the height and the distance are <b>equal</b>.', run: (c) => go(c, 45, 1800) },
        { cap: `Back to the booklet’s ${T('68^\\circ')}: ${T('h\\approx6.30')} m and ${T('d\\approx2.55')} m. A steep angle gives a <b>long</b> opposite side.`, run: (c) => go(c, 68) }
      ];
    }
    if (k === 'ab') {
      const color = (c) => anim(c, S.rails, [{ stroke: '#8a5a2b' }, { stroke: HYP }], 400);
      return [
        { cap: `${T(rc('opp', 'h'))} is <b class="u9l3-co">opposite</b> ${T(dg(68))} and the ladder, ${T(rc('hyp', '6.8'))} m, is the <b class="u9l3-ch">hypotenuse</b>: sine, unknown on top.`,
          run: async (c) => { await color(c); await say(c, P, '<b>(a)</b> ' + T(`\\sin68^\\circ=\\dfrac{${rc('opp', 'h')}}{${rc('hyp', '6.8')}}`), 'u9l3-lnbig'); } },
        { cap: `Multiply: ${T('h=6.8\\sin68^\\circ')} ${kbd('6.8 × sin 68 ) =')} ${T(`=${trunc(hT)}\\ldots\\approx\\mathbf{6.3}`)} m.`,
          run: async (c) => { await say(c, P, T(`h=6.8\\sin68^\\circ=${trunc(hT)}\\ldots\\approx\\mathbf{6.3}\\text{ m}`)); S.hTxt = 'h\\approx6.3'; S.set(68); await pop(c, S.lay.querySelector('.u9l3-shl')); } },
        { cap: `${T(rc('adj', 'd'))} is <b class="u9l3-ca">adjacent</b> to ${T(dg(68))}, with the same hypotenuse: cosine, unknown on top.`,
          run: (c) => say(c, P, '<b>(b)</b> ' + T(`\\cos68^\\circ=\\dfrac{${rc('adj', 'd')}}{${rc('hyp', '6.8')}}`), 'u9l3-lnbig') },
        { cap: `Multiply: ${T('d=6.8\\cos68^\\circ')} ${kbd('6.8 × cos 68 ) =')} ${T(`=${trunc(dT)}\\ldots\\approx\\mathbf{2.5}`)} m.`,
          run: async (c) => { await say(c, P, T(`d=6.8\\cos68^\\circ=${trunc(dT)}\\ldots\\approx\\mathbf{2.5}\\text{ m}`)); S.dTxt = 'd\\approx2.5'; S.set(68); await pop(c, S.lay.querySelector('.u9l3-sdl')); } }
      ];
    }
    S.hTxt = 'h\\approx6.3'; S.dTxt = 'd'; S.set(68);
    const N = new NumberLine(stage, { x: 456, y: 238, width: W - 466, height: 130, min: 2.5, max: 2.6, step: 0.01, arrows: false, axisY: 84, labels: [{ v: 2.5, html: T('2.50') }, { v: 2.55, html: T('2.55') }, { v: 2.6, html: T('2.60') }] });
    N.el.style.opacity = 0;
    const R = panel(stage, 456, 374, W - 466, 70, '', 'u9l3-thin');
    return [
      { cap: `(c) Pythagoras with the <b>rounded</b> ${T('h=6.3')}: ${T('d=\\sqrt{6.8^2-6.3^2}=\\sqrt{6.55}')} ${T(`=${trunc(dC)}\\ldots\\approx\\mathbf{2.6}`)} m. But (b) said 2.5!`,
        run: async (c) => { await say(c, P, '<b>(c)</b> ' + T(`d=\\sqrt{6.8^2-6.3^2}=\\sqrt{6.55}=${trunc(dC)}\\ldots\\approx\\mathbf{2.6}`)); await say(c, P, kbd('√ 6.8 x² − 6.3 x² ) ='), 'u9l3-lnsm'); } },
      { cap: 'Zoom in between 2.50 and 2.60. Anything below <b>2.55</b> rounds to 2.5, anything above rounds to 2.6.',
        run: async (c) => {
          await appear(c, N.el, 400);
          const px = N.toPx(2.55), ln = svgEl('line', { x1: px, x2: px, y1: 14, y2: N.ay + 12, stroke: BAD, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, N.layers.top); await appear(c, ln, 300);
        } },
      { cap: `(b) used the <b>given</b> 6.8 m and 68°: ${T('2.5473')} sits just <b>below</b> the cut-off, so it rounds to 2.5.`,
        run: (c) => pop(c, N.point(dT, { color: GOOD, label: T('2.5473'), pos: 'nw' })) },
      { cap: `(c) used ${T('h')} <b>after</b> rounding: ${T('2.5593')} lands just <b>above</b>, so it rounds to 2.6. The small error in ${T('h')} was magnified by the subtraction under the root.`,
        run: (c) => pop(c, N.point(dC, { color: BAD, label: T('2.5593'), pos: 'ne' })) },
      { cap: `(d) Carry ${T(`h=${trunc(hT)}\\ldots`)} unrounded: ${T(`\\sqrt{6.8^2-${trunc(hT)}^2}=2.5473`)}, matching (b). <b>Round only at the very end.</b>`,
        run: async (c) => { await say(c, R, T(`\\sqrt{6.8^2-${trunc(hT)}^2}=${trunc(dT, 4)}`) + ' ✓ matches (b)'); } }
    ];
  }
};

/* =============================== cover-up triangles =============================== */
const CT = { sin: ['S', 'opp', 'hyp'], cos: ['C', 'adj', 'hyp'], tan: ['T', 'opp', 'adj'] };
const LET = { opp: 'O', adj: 'A', hyp: 'H' };
function coverTri(host, fn, x, y, w, hh) {
  const el = add(host, box(h('div', 'u9l3-ct'), w, hh), x, y);
  const svg = svgEl('svg', { width: w, height: hh, viewBox: `0 0 ${w} ${hh}` }, el), my = hh * 0.56;
  const xl = (yy) => w / 2 - (w / 2 - 4) * (yy - 4) / (hh - 8);
  svgEl('polygon', { points: `${w / 2},4 ${w - 4},${hh - 4} 4,${hh - 4}`, fill: '#fff', stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
  el.hbar = svgEl('line', { x1: xl(my), x2: w - xl(my), y1: my, y2: my, stroke: INK, 'stroke-width': 3 }, svg);
  el.vbar = svgEl('line', { x1: w / 2, x2: w / 2, y1: my, y2: hh - 4, stroke: INK, 'stroke-width': 3 }, svg);
  const lay = h('div', 'u9l3-shtml'); el.appendChild(lay);
  const [F, top, br] = CT[fn];
  const cell = (px, py, html, col) => { const e = add(lay, h('div', 'u9l3-ctc', html)); e.style.color = col; place(e, px, py); return e; };
  el.cells = { top: cell(w / 2, hh * 0.38, LET[top], RC[top]), bl: cell(w * 0.31, hh * 0.79, F, ANG), br: cell(w * 0.69, hh * 0.79, LET[br], RC[br]) };
  el.pos = { top: [w / 2, hh * 0.38], bl: [w * 0.31, hh * 0.79], br: [w * 0.69, hh * 0.79] };
  el.fn = fn; el.lay = lay; el.W = w; el.H = hh; return el;
}
const cover = {
  title: 'Cover-up triangles: SOH · CAH · TOA',
  height: 430,
  choices: [{ sep: 'Check' }, { v: 'e2', label: 'Example 2' }, { v: 'e3b', label: 'Example 3(b)' }, { v: 'e4', label: 'Example 4' }, { v: 'e6', label: 'Example 6' }, { v: 'e7a', label: 'Example 7(a)' }, { v: 'e7b', label: 'Example 7(b)' }],
  intro: 'Each letter group is a little triangle: the side on top, the ratio and the side on the bottom. Cover what you want to find. Press <b>Next</b>.',
  make(stage, k, ex) {
    const W = ex.W, p = PB[k], I = info(p);
    const t = mkTri(stage, p.tri, { x: 0, y: 30, w: 330, h: 380, pad: 62, lab: p.lab, r: 26 });
    const sw = 180, gap = (W - 340 - 3 * sw) / 3;
    const cts = ['sin', 'cos', 'tan'].map((fn, i) => coverTri(stage, fn, 340 + gap / 2 + i * (sw + gap), 8, sw, 150));
    const big = coverTri(stage, p.fn, 350, 182, 300, 236); big.style.opacity = 0;
    const P = panel(stage, 668, 190, W - 678, 228, '');
    const [, topR, brR] = CT[p.fn], where = p.unk === topR ? 'top' : 'br';
    return [
      { cap: `Name the sides from ${T(dg(I.deg))}. Known: the <b>${LONG[p.giv]}</b> ${T(I.kT)}. Unknown: the <b>${LONG[p.unk]}</b> ${T(I.uT)}.`,
        run: async (c) => { await tagRoles(c, t); await markLab(c, t, p.giv, 'known'); await markLab(c, t, p.unk, 'find'); } },
      { cap: `${LET[p.giv]} and ${LET[p.unk]} together live in <b>${MN[p.fn]}</b>.`,
        run: async (c) => { for (const ct of cts) { if (ct.fn === p.fn) { ct.classList.add('u9l3-ct-on'); await pulse(c, ct, 1.08); } else await anim(c, ct, [{ opacity: 1 }, { opacity: 0.25 }], 300); } } },
      { cap: `Fill in ${MN[p.fn]}: ${T(`${LET[topR]}=${p[topR === p.unk ? 'u' : 'k']}`)}, ${T(`${CT[p.fn][0]}=${I.fnT}`)}, ${T(`${LET[brR]}=${p[brR === p.unk ? 'u' : 'k']}`)}.`,
        run: async (c) => {
          await appear(c, big, 300);
          const v = { top: topR === p.unk ? I.uT : I.kT, bl: I.fnT, br: brR === p.unk ? I.uT : I.kT };
          for (const key of ['top', 'bl', 'br']) { big.cells[key].innerHTML = T(v[key]); big.cells[key].classList.add('u9l3-ctv'); await pop(c, big.cells[key], 260); }
        } },
      { cap: where === 'top' ? `<b>Cover</b> the unknown, ${T(I.uT)}, on top. What’s left sits <b>side by side</b>: multiply.` : `<b>Cover</b> the unknown, ${T(I.uT)}, on the bottom. What’s left is <b>one over the other</b>: divide.`,
        run: async (c) => {
          const [cx, cy] = big.pos[where], cv = add(big.lay, box(h('div', 'u9l3-cover', 'cover'), 112, 64));
          place(cv, cx, cy); await anim(c, cv, [{ transform: 'translate(0,-140px)', opacity: 0 }, { transform: 'none', opacity: 1 }], 520);
          if (where === 'top') { const x = add(big.lay, h('div', 'u9l3-ctop', '×')); place(x, big.W / 2, big.H * 0.79); await pop(c, x); await pulse(c, big.cells.bl, 1.15); }
          else { big.hbar.setAttribute('stroke', BAD); big.hbar.setAttribute('stroke-width', 6); const x = add(big.lay, h('div', 'u9l3-ctop u9l3-ctdiv', '÷')); place(x, big.W * 0.9, big.H * 0.56); await pop(c, x); }
          await say(c, P, rulePill(I.top));
        } },
      { cap: `${T(`${p.u}=${I.top ? `${I.kt}\\times${I.fnT}` : `${I.kt}\\div${I.fnT}`}`)} ${T(`=${I.valT}`)}${p.unit ? ' ' + p.unit : ''}.`,
        run: async (c) => { await say(c, P, T(`${I.uT}=${I.top ? `${I.kT}\\times${I.fnT}` : `\\dfrac{${I.kT}}{${I.fnT}}`}`), 'u9l3-lnbig'); await say(c, P, kbd(I.keys), 'u9l3-lnsm'); await say(c, P, T(`${I.uT}\\approx${I.ans}${I.unit}`), 'u9l3-lnbig'); } }
    ];
  }
};

/* =============================== reading vertex letters =============================== */
const RD = {
  read: { tri: 'pqr', parts: [{ a: 'PQR', val: 90, v: 'Q' }, { a: 'QPR', val: 40, v: 'P' }, { s: 'PR', val: '12\\text{ cm}' }], fin: 'pqr' },
  e5: { tri: 'e5', parts: [{ a: 'JLK', val: 90, v: 'L' }, { a: 'LJK', val: 34, v: 'J' }, { s: 'KL', val: '11.2\\text{ mm}' }, { f: 'JK' }], pb: 'e5' },
  e6: { tri: 'e6', parts: [{ a: 'C', val: 90, v: 'C' }, { a: 'A', val: 28, v: 'A' }, { s: 'BC', val: '9.5\\text{ cm}' }, { f: 'AC' }], pb: 'e6' },
  e7: { tri: 'e7', parts: [{ a: 'DEF', val: 90, v: 'E' }, { a: 'DFE', val: 64, v: 'F' }, { s: 'EF', val: '71\\text{ m}' }, { f: 'DE' }, { f: 'DF' }], pb: 'e7a' }
};
const angT = (a, hi) => (a.length === 3 ? `\\angle ${a[0]}${hi ? tc(ANG, a[1]) : a[1]}${a[2]}` : `\\angle ${hi ? tc(ANG, a) : a}`);
const letters = {
  title: 'Reading the letters',
  height: 450,
  choices: [{ sep: 'Idea' }, { v: 'read', label: 'How to read the letters' }, { sep: 'Check' }, { v: 'e5', label: 'Example 5' }, { v: 'e6', label: 'Example 6' }, { v: 'e7', label: 'Example 7' }],
  intro: 'Turn the words into a labelled triangle, one piece at a time. Press <b>Next</b>.',
  make(stage, k, ex) {
    const W = ex.W, d = RD[k];
    const bar = add(stage, box(h('div', 'u9l3-stmt'), W - 20, 58), 10, 8);
    const chunkT = (q, hi) => (q.a ? `${angT(q.a, hi)}=${dg(q.val)}` : q.s ? `${q.s}=${q.val}` : `${q.f}=\\,?`);
    const chunks = d.parts.map((q) => { const e = h('span', 'u9l3-chunk', T(chunkT(q))); bar.appendChild(e); return e; });
    const t = mkTri(stage, d.tri, { x: 0, y: 72, w: 380, h: 370, pad: 66, angle: false, lab: { bot: null, vert: null, hyp: null } });
    const rmk = t.svg.querySelector('.bk-rmark'); rmk.style.opacity = 0;
    const P = panel(stage, 396, 76, W - 406, 366, '');
    const steps = d.parts.map((q, i) => {
      if (q.a && q.val === 90) return { cap: q.a.length === 3 ? `${T(angT(q.a))}: the <b>middle letter</b> is the vertex. The right angle is at ${T(q.v)}.` : `${T(angT(q.a))}: the right angle is at ${T(q.v)}.`,
        run: async (c) => { chunks[i].innerHTML = T(chunkT(q, true)); chunks[i].classList.add('u9l3-chunk-on'); await pulse(c, t.vLabs[q.v], 1.5); await pop(c, rmk); await say(c, P, `${T(chunkT(q, true))} → right angle at ${T(q.v)}`); } };
      if (q.a) return { cap: `${T(angT(q.a))}: the angle is at ${q.a.length === 3 ? 'the middle letter, ' : ''}${T(q.v)}. Mark ${T(dg(q.val))} there.`,
        run: async (c) => { chunks[i].innerHTML = T(chunkT(q, true)); chunks[i].classList.add('u9l3-chunk-on'); const g = t.angle(q.v, dg(q.val), { color: ANG, r: 36 }); await fadeIn(c, g); if (g.label) await pop(c, g.label); await say(c, P, `${T(chunkT(q, true))} → ${T(dg(q.val))} at ${T(q.v)}`); } };
      const kk = lc(Object.keys(t.V).find((v) => !(q.s || q.f).includes(v)));
      if (q.s) return { cap: `${T(q.s)}: a side is named by its <b>two endpoints</b>, ${T(q.s[0])} and ${T(q.s[1])}. ${T(`${q.s}=${q.val}`)}.`,
        run: async (c) => { chunks[i].classList.add('u9l3-chunk-on'); const L = sideLabel(t, kk, T(q.val)); await pop(c, L); await pulse(c, t.sideEls[kk], 1.0); await say(c, P, `${T(q.s)} → the side from ${T(q.s[0])} to ${T(q.s[1])}`); } };
      const isH = lc(t.N.right) === kk;
      return { cap: `${T(q.f)} joins ${T(q.f[0])} and ${T(q.f[1])}${isH ? `: across from the right angle, the <b>hypotenuse</b>` : ''}. That is what we want.`,
        run: async (c) => { chunks[i].classList.add('u9l3-chunk-on'); const L = sideLabel(t, kk, T(q.f), 'u9l3-find'); await pop(c, L); await say(c, P, `${T(q.f)} → ${isH ? 'the hypotenuse' : 'a leg'}: unknown`); } };
    });
    if (d.pb) {
      const p = PB[d.pb], I = info(p);
      t.d.ang = TRI[d.tri].ang;
      steps.push({ cap: `From ${T(t.av())}: ${T(I.kT)} is <b>${LONG[p.giv]}</b>, ${T(I.uT)} is the <b>${LONG[p.unk]}</b>. ${MN[p.fn]}: ${T(`${I.fnT}=${I.frac}`)}.`,
        run: async (c) => { await tagRoles(c, t); await say(c, P, T(`${I.fnT}=${I.frac}`), 'u9l3-lnbig'); } });
      steps.push({ cap: `${I.top ? 'Unknown on top: multiply' : 'Unknown on the bottom: divide'}. ${T(`${p.u}=${I.expr}`)} ${T(`=${I.valT}`)} ${p.unit}.${k === 'e7' ? ' Example 7(b) is the same start, from the given 71 m.' : ''}`,
        run: async (c) => { await say(c, P, T(`${I.uT}=${I.top ? `${I.kT}\\${p.fn}${dg(I.deg)}` : `\\dfrac{${I.kT}}{${I.fnT}}`}\\approx\\mathbf{${I.ans}}${I.unit}`), 'u9l3-lnbig'); } });
    } else {
      t.d.ang = 'base';
      steps.push({ cap: `Now name the sides from ${T('P')}: ${T('QR')} is opposite, ${T('PQ')} is adjacent, ${T('PR')} is the hypotenuse.`,
        run: async (c) => { await tagRoles(c, t); await say(c, P, `From ${T('P')}: opp ${T(rc('opp', 'QR'))}, adj ${T(rc('adj', 'PQ'))}, hyp ${T(rc('hyp', 'PR'))}`); } });
    }
    return steps;
  }
};

/* =============================== summary flowchart =============================== */
const FL = {
  e1a: { path: ['start', 'pyth'], given: `Given: ${T('6.3')} cm and ${T('8.4')} cm (two legs), no angle.`, lines: [T('r=\\sqrt{6.3^2+8.4^2}'), T('r=\\mathbf{10.5}\\text{ cm}')] },
  e2: { path: ['start', 'trig', 'where', 'mult'], given: `Given: ${T('58^\\circ')} and the hyp ${T('16.4')} cm. Want: ${T('x')}, the opp.`, lines: [T('\\sin58^\\circ=\\dfrac{x}{16.4}'), T('x=16.4\\sin58^\\circ\\approx\\mathbf{13.9}\\text{ cm}')] },
  e4: { path: ['start', 'trig', 'where', 'div'], given: `Given: ${T('37^\\circ')} and the opp ${T('9.4')} cm. Want: ${T('c')}, the hyp.`, lines: [T('\\sin37^\\circ=\\dfrac{9.4}{c}'), T('c=\\dfrac{9.4}{\\sin37^\\circ}\\approx\\mathbf{15.6}\\text{ cm}')] },
  e6: { path: ['start', 'trig', 'where', 'div'], given: `Given: ${T('28^\\circ')} and the opp ${T('9.5')} cm. Want: ${T('AC')}, the adj.`, lines: [T('\\tan28^\\circ=\\dfrac{9.5}{AC}'), T('AC=\\dfrac{9.5}{\\tan28^\\circ}\\approx\\mathbf{17.9}\\text{ cm}')] },
  none: { path: ['start', 'none'], given: `Given: angles ${T('40^\\circ')}, ${T('50^\\circ')} and ${T('90^\\circ')}, but <b>no side</b>.`, lines: ['Nothing to multiply or divide: the triangle could be <b>any size</b>.'] }
};
const tool = {
  title: 'Which tool? Where is the unknown?',
  height: 460,
  choices: [{ sep: 'Check' }, { v: 'e1a', label: 'Example 1(a)' }, { v: 'e2', label: 'Example 2' }, { v: 'e4', label: 'Example 4' }, { v: 'e6', label: 'Example 6' }, { sep: 'Idea' }, { v: 'none', label: 'Only angles' }],
  intro: 'Start at the top: what does the question give you? Press <b>Next</b>.',
  make(stage, k, ex) {
    const W = ex.W, d = FL[k];
    const F = new Flowchart(stage, { x: 4, y: 4, width: 640, height: 450,
      nodes: {
        start: { x: 320, y: 36, w: 250, h: 52, html: '<b>What is known?</b>', cls: 'bk-round' },
        pyth: { x: 104, y: 160, w: 196, h: 92, html: `<b>Pythagoras</b>${T('c^2=a^2+b^2')}<br><small>subtract first for a leg</small>`, color: 'teal' },
        trig: { x: 320, y: 160, w: 206, h: 92, html: '<b>SOH CAH TOA</b>the ratio with the known side <i>and</i> the unknown', color: 'purple' },
        none: { x: 536, y: 160, w: 196, h: 92, html: '<b>Not enough</b>for these tools', color: 'gray', cls: 'bk-dashed' },
        where: { x: 320, y: 284, w: 250, h: 50, html: '<b>Where is the unknown?</b>', cls: 'bk-round' },
        mult: { x: 180, y: 398, w: 230, h: 76, html: `<b>On top: multiply</b>${T('x=k\\sin\\theta')}`, color: 'green' },
        div: { x: 460, y: 398, w: 230, h: 76, html: `<b>Underneath: divide</b>${T('x=k\\div\\sin\\theta')}`, color: 'red' }
      },
      edges: [{ from: 'start', to: 'pyth', label: 'two sides', route: 'vhv' }, { from: 'start', to: 'trig', label: 'an angle + a side' }, { from: 'start', to: 'none', label: 'only angles', route: 'vhv' },
        { from: 'trig', to: 'where' }, { from: 'where', to: 'mult', label: 'top', route: 'vhv' }, { from: 'where', to: 'div', label: 'bottom', route: 'vhv' }] });
    const P = panel(stage, 656, 10, W - 666, 440, '');
    const steps = [{ cap: d.given, run: async (c) => { await F.light(c, ['start']); await say(c, P, d.given, 'u9l3-lnsm'); } }];
    const pth = d.path;
    steps.push({ cap: { pyth: 'Two sides, no angle: <b>Pythagoras</b>. No trig needed.', trig: 'An angle and a side: <b>SOH CAH TOA</b>, the ratio holding the known side and the unknown.', none: 'Only angles: <b>not enough information</b> for these tools.' }[pth[1]],
      run: async (c) => { await F.go(c, 'start', pth[1]); await F.visit(c, pth[1]); if (pth.length === 2) for (const l of d.lines) await say(c, P, l, 'u9l3-lnbig'); else await say(c, P, d.lines[0], 'u9l3-lnbig'); } });
    if (pth.length > 2) {
      const top = pth[3] === 'mult';
      steps.push({ cap: top ? 'The unknown is on <b>top</b> of the ratio: <b>multiply</b>.' : 'The unknown is <b>underneath</b>: cross-multiply, then <b>divide</b>.',
        run: async (c) => { await F.go(c, 'trig', 'where'); await F.visit(c, 'where'); await F.go(c, 'where', pth[3]); await F.visit(c, pth[3]); await say(c, P, d.lines[1], 'u9l3-lnbig'); } });
    }
    if (k !== 'none') steps.push({ cap: 'Sense check every answer: the hypotenuse is the <b>longest</b> side, and the larger acute angle faces the longer leg.',
      run: async (c) => { const st = stamp(P, 'Sense check ✓', { ok: true, size: 'sm', rotate: -4 }); st.classList.add('u9l3-pst'); await stampIn(c, st); } });
    return steps;
  }
};

figures();
mountWarm();
export const explainers = mountExplainers({ kite, pyth, pick, solveTop, ladder, solveBot, cover, letters, solve7, tool });
