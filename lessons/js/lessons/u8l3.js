/* Math 10C · Unit 8 · Lesson 3 — Combining Equations: The Elimination Method.
 * Warm-up: Weigh the Pets (three vet scales, drawn pets).
 * Explainers:
 *   pets     the warm-up solved: Scale B − Scale C (the rabbit cancels), then + Scale A; and the big one (all six pets on one scale)
 *   balance  the star: two level balances added pan to pan onto one big balance; opposite blocks cancel; collect, divide,
 *            back-substitute (the idea, Example 1 add, Example 2 flip-then-add, Example 3 scale-then-add)
 *   signs    subtracting as "flip every sign, then add down the columns" (Example 2, Example 6 (a) constant, warm-up)
 *   pencil   the graph view: Eq. 1 + k × Eq. 2 turns about the crossing until it is vertical / horizontal
 *   scale    scaling = copying the whole balance (same line); forgetting the constant tips it (a different line)
 *   lcm      count up in multiples to the LCM; multipliers; same sign → subtract, opposite → add
 *   walk     the four steps, line by line, with checks in both equations (Examples 3–5; walk6: Example 6)
 *   prep     rearranging into Ax + By = C (terms hop over "=" and flip sign) and clearing fractions (× LCD)
 *   special  0 = 0 (same line) and 0 = 15 (parallel lines)
 *   choose   which method? a flowchart, then a quick solve by that method
 * Colours: Eq. 1 brand blue, Eq. 2 amber, the combined / one-variable equation green, the solution purple. */
import {
  h, tex, add, box, place, Graph, Flowchart, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep, tween, anim,
  pairTex, texNum, svgEl, pulse, COLORS
} from '../blocks.js';

const T = (s) => tex(String(s));
const B1 = COLORS.blue, A2 = COLORS.amber, SOL = COLORS.purple, RES = COLORS.green, RED = COLORS.red;
const tc = (col, s) => `\\textcolor{${col}}{${s}}`;
const k1 = (s) => tc(B1, s), k2 = (s) => tc(A2, s), kr = (s) => tc(RES, s), ks = (s) => tc(SOL, s);
const TAG1 = '<span class="u8l3-tg u8l3-t1">Eq. 1</span>', TAG2 = '<span class="u8l3-tg u8l3-t2">Eq. 2</span>';
const tag = (n, txt) => `<span class="u8l3-tg u8l3-t${n}">${txt}</span>`;
const pm = (v) => String(v).replace('-', '−');

/* ---------------- equations ax + by = c ---------------- */
const E = (a, b, c) => ({ a, b, c });
const scaleE = (e, m) => E(e.a * m, e.b * m, e.c * m);
/** TeX of the term k·v (v '' for a constant); first: no leading + */
function term(k, v, first) {
  if (!k) return '';
  const a = Math.abs(k), s = k < 0 ? '-' : first ? '' : '+';
  return s + (v && a === 1 ? '' : texNum(a)) + (v || '');
}
const lhs = (e) => (term(e.a, 'x', true) + term(e.b, 'y', !e.a)) || '0';
const eqT = (e) => lhs(e) + '=' + texNum(e.c);
/** a known value put in for a variable: 2(3), +4(-2), 7, -(3) … */
function known(k, v, first) {
  const vv = v < 0 ? `(${texNum(v)})` : texNum(v);
  if (k === 1) return (first ? '' : '+') + vv;
  if (k === -1) return `-(${texNum(v)})`;
  return (k < 0 ? '-' : first ? '' : '+') + Math.abs(k) + `(${texNum(v)})`;
}
const plusC = (c) => (c < 0 ? `+(${texNum(c)})` : '+' + texNum(c));
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

/* ---------------- geometry + motion helpers ---------------- */
/** an element's box in stage coordinates (works with the page's scaling) */
function rel(stage, el) {
  const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = (s.width / stage.offsetWidth) || 1;
  return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
}
/** FLIP: remember where els() are, mutate the DOM, then glide them from the old places to the new ones */
function flip(c, stage, els, mutate, ms = 420) {
  const before = new Map(els().map((e) => [e, rel(stage, e)]));
  mutate();
  const out = [];
  for (const e of els()) {
    const b = before.get(e); if (!b) continue;
    const a = rel(stage, e), dx = b.x - a.x, dy = b.y - a.y;
    if (Math.abs(dx) + Math.abs(dy) > 0.5) out.push(anim(c, e, [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], ms));
  }
  return Promise.all(out);
}
/** els are already in their new places; glide each in from its `from` box */
function flyIn(c, stage, list, ms = 760, stagger = 70) {
  return Promise.all(list.map(({ el, from }, i) => {
    const to = rel(stage, el), dx = from.x - to.x, dy = from.y - to.y;
    return anim(c, el, [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], ms, { delay: i * stagger });
  }));
}
/** append new elements to containers, sliding the old ones aside and flying the new ones in from `from` boxes */
async function moveInto(c, stage, list, ms) {
  const conts = [...new Set(list.map((d) => d.cont))], fresh = new Set(list.map((d) => d.el));
  const kids = () => conts.flatMap((ct) => [...ct.children]).filter((e) => !fresh.has(e));
  const p1 = flip(c, stage, kids, () => list.forEach((d) => d.cont.appendChild(d.el)));
  await Promise.all([p1, flyIn(c, stage, list, ms)]);
}
/** two opposite items slide together and vanish into a 0 */
async function cancelPair(c, stage, a, b, zeroHtml = T('0')) {
  const ra = rel(stage, a), rb = rel(stage, b);
  const mx = (ra.x + ra.w / 2 + rb.x + rb.w / 2) / 2, my = (ra.y + ra.h / 2 + rb.y + rb.h / 2) / 2;
  const tr = (r) => `translate(${mx - r.x - r.w / 2}px,${my - r.y - r.h / 2}px)`;
  await Promise.all([anim(c, a, [{ transform: 'none' }, { transform: tr(ra) }], 560), anim(c, b, [{ transform: 'none' }, { transform: tr(rb) }], 560)]);
  const z = place(add(stage, h('div', 'u8l3-zero', zeroHtml)), mx, my, 'c', 0);
  await Promise.all([
    anim(c, a, [{ transform: tr(ra), opacity: 1 }, { transform: tr(ra) + ' scale(.2)', opacity: 0 }], 380),
    anim(c, b, [{ transform: tr(rb), opacity: 1 }, { transform: tr(rb) + ' scale(.2)', opacity: 0 }], 380), pop(c, z, 380)]);
  const conts = [...new Set([a.parentNode, b.parentNode])];
  await sleep(c, 350);
  await flip(c, stage, () => conts.flatMap((ct) => [...ct.children]), () => { a.remove(); b.remove(); });
  await anim(c, z, [{ opacity: 1 }, { opacity: 0 }], 450);
  z.remove();
}
const lineEl = (host, html, cls = '') => { const d = h('div', 'u8l3-ln ' + cls, html); host.appendChild(d); return d; };
const show = (c, el) => fadeIn(c, el, 320);
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u8l3-panel ' + cls, title ? `<div class="u8l3-ph">${title}</div>` : ''), w, hh), x, y);
const solPill = (x, y) => `<span class="u8l3-sol">${T(ks(pairTex(x, y)))}</span>`;

/* =============================== blocks and balances =============================== */
/** a block: v 'x' | 'y' | '' (a number), k its coefficient, src 1 | 2 | 'r' (Eq. 1, Eq. 2, combined) */
function blk(v, k, src) { const el = h('div', ''); el.v = v; el.k = k; el.src = src; return drawBlk(el); }
function drawBlk(el) {
  const n = Math.min(Math.abs(el.k), 12);
  el.className = `u8l3-blk u8l3-b${el.v || 'c'} u8l3-s${el.src}` + (el.k < 0 ? ' u8l3-neg' : '');
  if (el.v) {
    el.style.width = (24 + 11 * n) + 'px';
    el.innerHTML = `<div class="u8l3-cells">${'<div class="u8l3-cell"></div>'.repeat(n)}</div><div class="u8l3-bl">${T(term(el.k, el.v, true))}</div>`;
  } else { el.style.width = ''; el.innerHTML = `<div class="u8l3-bl">${T(texNum(el.k))}</div>`; }
  return el;
}
const blocksOf = (e, src) => [[e.a ? blk('x', e.a, src) : null, e.b ? blk('y', e.b, src) : null].filter(Boolean), e.c ? [blk('', e.c, src)] : []];

class Balance {
  constructor(stage, o) {
    const w = o.w, H = o.h, top = o.top ?? 40;
    this.stage = stage;
    const el = this.el = add(stage, box(h('div', 'u8l3-bal' + (o.cls ? ' ' + o.cls : '')), w, H), o.x, o.y);
    const svg = svgEl('svg', { width: w, height: H, viewBox: `0 0 ${w} ${H}`, class: 'u8l3-bsvg' }, el);
    const cx = this.cx = w / 2, ty = this.ty = H - 56, py = this.py = ty + 26;
    this.L = Math.round(w * 0.27); this.pw = Math.round(w * 0.45);
    svgEl('path', { d: `M${cx - 54} ${H - 3} H${cx + 54} L${cx + 11} ${py} H${cx - 11} Z`, class: 'u8l3-base' }, svg);
    this.rods = [svgEl('line', { class: 'u8l3-rod' }, svg), svgEl('line', { class: 'u8l3-rod' }, svg)];
    this.beam = svgEl('line', { class: 'u8l3-beam' }, svg);
    svgEl('circle', { cx, cy: py, r: 7, class: 'u8l3-piv' }, svg);
    this.lab = add(el, h('div', 'u8l3-balab', o.label || ''));
    this.pans = [-1, 1].map((s) => {
      const p = add(el, box(h('div', 'u8l3-pan'), this.pw, ty + 10 - top), cx + s * this.L - this.pw / 2, top);
      p.cont = h('div', 'u8l3-cont'); p.append(p.cont, h('div', 'u8l3-tray')); return p;
    });
    this.setTilt(0);
  }
  setTilt(th) {
    this.th = th;
    const { cx, py, L, ty } = this, co = Math.cos(th), si = Math.sin(th);
    const ends = [[cx - L * co, py + L * si], [cx + L * co, py - L * si]];
    this.beam.setAttribute('x1', ends[0][0]); this.beam.setAttribute('y1', ends[0][1]);
    this.beam.setAttribute('x2', ends[1][0]); this.beam.setAttribute('y2', ends[1][1]);
    ends.forEach((e, i) => {
      const dx = e[0] - (cx + (i ? 1 : -1) * L), dy = e[1] - py, r = this.rods[i];
      this.pans[i].style.transform = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px)`;
      r.setAttribute('x1', e[0]); r.setAttribute('y1', e[1]); r.setAttribute('x2', e[0]); r.setAttribute('y2', ty + 10 + dy);
    });
  }
  tilt(c, th, ms = 700) { const t0 = this.th; return tween(c, ms, (t) => this.setTilt(t0 + (th - t0) * t)); }
  items(i) { return [...this.pans[i].cont.children]; }
  all() { return [...this.items(0), ...this.items(1)]; }
  fill(e, src) { const [l, r] = blocksOf(e, src); this.pans[0].cont.append(...l); this.pans[1].cont.append(...r); }
  label(html) { this.lab.innerHTML = html; }
  /** a short tag (×2, ÷6) over pan i, in stage coordinates */
  badge(i, html) {
    const r = rel(this.stage, this.pans[i]);
    return place(add(this.stage, h('div', 'u8l3-badge', html)), r.x + r.w / 2, r.y - 4, 'n', 0);
  }
}
/** copies of every block in `blocks` fly into the matching pans of balance `to` */
function copyInto(c, stage, pairs) {
  const list = [];
  pairs.forEach(([from, cont]) => from.forEach((b) => list.push({ el: blk(b.v, b.k, b.src), from: rel(stage, b), cont })));
  return moveInto(c, stage, list, 820);
}
/** merge `others` into `keep`, which becomes coefficient k (combined colour) */
async function merge(c, stage, keep, others, k) {
  const rk = rel(stage, keep);
  await Promise.all(others.map((o) => { const r = rel(stage, o); return anim(c, o, [{ transform: 'none', opacity: 1 }, { transform: `translate(${rk.x - r.x}px,${rk.y - r.y}px)`, opacity: 0.25 }], 560); }));
  const cont = keep.parentNode;
  await flip(c, stage, () => [...cont.children], () => { others.forEach((o) => o.remove()); keep.k = k; keep.src = 'r'; drawBlk(keep); });
  await pop(c, keep, 380);
}
/** flip each block to its opposite (a quick card-turn) */
async function negate(c, els) {
  await Promise.all(els.map((e, i) => anim(c, e, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], 200, { delay: i * 90 })));
  els.forEach((e) => { e.k = -e.k; drawBlk(e); });
  await Promise.all(els.map((e) => anim(c, e, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 220)));
}

/* =============================== warm-up: pets and vet scales =============================== */
const FUR = { cat: '#f0963c', dog: '#96643c', rabbit: '#b4b4be' };
const NAME = { cat: 'cat', dog: 'dog', rabbit: 'rabbit' };
function petSVG(kind) {
  const o = 'stroke="#1e2d46" stroke-width="2"';
  if (kind === 'cat') {
    return `<svg viewBox="0 0 80 72" class="u8l3-psvg" aria-label="cat"><path d="M24 56 C8 54 6 36 14 31" fill="none" stroke="#c87628" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="40" cy="52" rx="19" ry="15" fill="${FUR.cat}" ${o}/><path d="M29 22 L26 5 L37 14 Z M51 22 L54 5 L43 14 Z" fill="${FUR.cat}" ${o} stroke-linejoin="round"/>
<circle cx="40" cy="26" r="13" fill="${FUR.cat}" ${o}/><circle cx="35" cy="24" r="2" fill="#1e2d46"/><circle cx="45" cy="24" r="2" fill="#1e2d46"/>
<circle cx="40" cy="29.5" r="1.8" fill="#d23c32"/><path d="M36 30 L25 28.5 M36 31.5 L25 33.5 M44 30 L55 28.5 M44 31.5 L55 33.5" stroke="#1e2d46" stroke-width="1"/>
<ellipse cx="32" cy="66" rx="6.5" ry="3.8" fill="#f7c08a" ${o}/><ellipse cx="48" cy="66" rx="6.5" ry="3.8" fill="#f7c08a" ${o}/></svg>`;
  }
  if (kind === 'dog') {
    return `<svg viewBox="0 0 80 72" class="u8l3-psvg" aria-label="dog"><path d="M62 44 L72 30" stroke="#6e4826" stroke-width="5" stroke-linecap="round"/>
<g fill="#7a5230" ${o}><rect x="28" y="52" width="7" height="17" rx="2"/><rect x="38" y="53" width="7" height="16" rx="2"/><rect x="52" y="53" width="7" height="16" rx="2"/><rect x="61" y="52" width="7" height="17" rx="2"/></g>
<ellipse cx="47" cy="47" rx="21" ry="12" fill="${FUR.dog}" ${o}/><circle cx="25" cy="30" r="13" fill="${FUR.dog}" ${o}/>
<ellipse cx="14" cy="35" rx="8" ry="5.5" fill="#d9b48c" ${o}/><circle cx="8" cy="33.5" r="2.6" fill="#1e2d46"/><circle cx="22" cy="26" r="2" fill="#1e2d46"/>
<ellipse cx="33" cy="32" rx="5.5" ry="11" fill="#5e3c1e" ${o}/></svg>`;
  }
  return `<svg viewBox="0 0 80 72" class="u8l3-psvg" aria-label="rabbit"><g ${o}><ellipse cx="34" cy="14" rx="5.5" ry="13" fill="${FUR.rabbit}"/><ellipse cx="47" cy="14" rx="5.5" ry="13" fill="${FUR.rabbit}"/></g>
<ellipse cx="34" cy="15" rx="2.4" ry="9" fill="#f2b8c6"/><ellipse cx="47" cy="15" rx="2.4" ry="9" fill="#f2b8c6"/>
<circle cx="60" cy="52" r="6" fill="#fff" ${o}/><ellipse cx="42" cy="52" rx="18" ry="14" fill="${FUR.rabbit}" ${o}/>
<circle cx="40" cy="32" r="12" fill="${FUR.rabbit}" ${o}/><circle cx="36" cy="31" r="2" fill="#1e2d46"/><circle cx="44" cy="31" r="2" fill="#1e2d46"/>
<path d="M38 36 L42 36 L40 38.5 Z" fill="#e58aa0"/><ellipse cx="33" cy="66" rx="7" ry="3.5" fill="#e4e4ea" ${o}/><ellipse cx="51" cy="66" rx="7" ry="3.5" fill="#e4e4ea" ${o}/></svg>`;
}
function petEl(kind, cls = '') { const d = h('div', `u8l3-pet u8l3-pet-${kind} ${cls}`, petSVG(kind)); d.kind = kind; return d; }
function vetScale(name, reading, kinds, cls = '') {
  const s = h('div', 'u8l3-vs ' + cls, `<div class="u8l3-vs-pets"></div><div class="u8l3-vs-plat"><div class="u8l3-vs-disp">${reading}</div></div><div class="u8l3-vs-name">${name}</div>`);
  s.row = s.querySelector('.u8l3-vs-pets'); s.disp = s.querySelector('.u8l3-vs-disp');
  kinds.forEach((k) => s.row.appendChild(petEl(k)));
  return s;
}
const SCALES = [['Scale A', '14 kg', ['cat', 'dog']], ['Scale B', '12 kg', ['rabbit', 'dog']], ['Scale C', '6 kg', ['cat', 'rabbit']]];
function mountWarm() {
  const host = document.getElementById('u8l3-pets'); if (!host) return;
  SCALES.forEach(([n, r, k]) => host.appendChild(vetScale(n, r, k)));
}

/* =============================== explainer: the pets, solved =============================== */
const pets = {
  title: 'The pets, solved by combining scales',
  height: 450,
  choices: [{ v: 'sub', label: 'Who is heavier? Scale B − Scale C' }, { v: 'big', label: 'The big one: all on one scale' }],
  intro: (k) => (k === 'sub' ? 'Scales B and C share the rabbit. What happens if we <b>subtract</b> one scale from the other? Press <b>Next</b>.'
    : 'Put every pet from all three scales onto one big scale. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const W = ex.W;
    if (k === 'big') return petsBig(stage, W);
    /* row grid: sign | name | pet | op | pet | = | value */
    const cols = (x0) => ({ s: [x0, 30], n: [x0 + 30, 100], p1: [x0 + 132, 76], o: [x0 + 210, 32], p2: [x0 + 244, 76], e: [x0 + 322, 30], v: [x0 + 354, 96] });
    const cell = (cc, y, key, html, cls = '') => add(stage, box(h('div', 'u8l3-rc ' + cls, html), cc[key][1], 76), cc[key][0], y);
    const L = cols(14), R = cols(W - 470);
    const rowB = { n: cell(L, 16, 'n', 'Scale B', 'u8l3-rn'), p1: cell(L, 16, 'p1', ''), o: cell(L, 16, 'o', '+', 'u8l3-ro'), p2: cell(L, 16, 'p2', ''), e: cell(L, 16, 'e', '=', 'u8l3-ro'), v: cell(L, 16, 'v', '12 kg', 'u8l3-rv') };
    rowB.p1.appendChild(petEl('dog')); rowB.p2.appendChild(petEl('rabbit'));
    const rowC = { s: cell(L, 104, 's', '−', 'u8l3-ro u8l3-rs'), n: cell(L, 104, 'n', 'Scale C', 'u8l3-rn'), p1: cell(L, 104, 'p1', ''), o: cell(L, 104, 'o', '+', 'u8l3-ro'), p2: cell(L, 104, 'p2', ''), e: cell(L, 104, 'e', '=', 'u8l3-ro'), v: cell(L, 104, 'v', '6 kg', 'u8l3-rv') };
    rowC.p1.appendChild(petEl('cat')); rowC.p2.appendChild(petEl('rabbit')); rowC.s.style.opacity = 0;
    const rule = add(stage, box(h('div', 'u8l3-rule'), 440, 4), 14, 190); rule.style.opacity = 0;
    const res = { n: cell(L, 202, 'n', 'B − C', 'u8l3-rn'), p1: cell(L, 202, 'p1', ''), o: cell(L, 202, 'o', '−', 'u8l3-ro'), p2: cell(L, 202, 'p2', ''), e: cell(L, 202, 'e', '=', 'u8l3-ro'), v: cell(L, 202, 'v', '6 kg', 'u8l3-rv u8l3-rg') };
    res.p1.appendChild(petEl('dog')); res.p2.appendChild(petEl('cat'));
    Object.values(res).forEach((e) => (e.style.opacity = 0));
    // right: + Scale A
    const r1 = { n: cell(R, 16, 'n', 'B − C', 'u8l3-rn'), p1: cell(R, 16, 'p1', ''), o: cell(R, 16, 'o', '−', 'u8l3-ro'), p2: cell(R, 16, 'p2', ''), e: cell(R, 16, 'e', '=', 'u8l3-ro'), v: cell(R, 16, 'v', '6 kg', 'u8l3-rv u8l3-rg') };
    r1.p1.appendChild(petEl('dog')); r1.p2.appendChild(petEl('cat'));
    const r2 = { s: cell(R, 104, 's', '+', 'u8l3-ro u8l3-rs'), n: cell(R, 104, 'n', 'Scale A', 'u8l3-rn'), p1: cell(R, 104, 'p1', ''), o: cell(R, 104, 'o', '+', 'u8l3-ro'), p2: cell(R, 104, 'p2', ''), e: cell(R, 104, 'e', '=', 'u8l3-ro'), v: cell(R, 104, 'v', '14 kg', 'u8l3-rv') };
    r2.p1.appendChild(petEl('dog')); r2.p2.appendChild(petEl('cat'));
    const rule2 = add(stage, box(h('div', 'u8l3-rule'), 440, 4), W - 470, 190);
    const r3 = { n: cell(R, 202, 'n', 'A + (B − C)', 'u8l3-rn u8l3-rn2'), p1: cell(R, 202, 'p1', ''), o: cell(R, 202, 'o', '+', 'u8l3-ro'), p2: cell(R, 202, 'p2', ''), e: cell(R, 202, 'e', '=', 'u8l3-ro'), v: cell(R, 202, 'v', '20 kg', 'u8l3-rv u8l3-rg') };
    r3.p1.appendChild(petEl('dog')); r3.p2.appendChild(petEl('dog'));
    const rightAll = [...Object.values(r1), ...Object.values(r2), rule2, ...Object.values(r3)];
    rightAll.forEach((e) => (e.style.opacity = 0));
    const fin = add(stage, box(h('div', 'u8l3-petfin'), W - 28, 136), 14, 300); fin.style.opacity = 0;
    fin.innerHTML = ['dog', 'cat', 'rabbit'].map((p) => `<div class="u8l3-pf">${petSVG(p)}<div><b>${{ dog: '10 kg', cat: '4 kg', rabbit: '2 kg' }[p]}</b><span>${{ dog: '20 ÷ 2', cat: '14 − 10 (Scale A)', rabbit: '6 − 4 (Scale C)' }[p]}</span></div></div>`).join('') +
      '<div class="u8l3-pfc">Check Scale B: <b>10 + 2 = 12</b> ✓</div>';
    const showRow = (c, row) => Promise.all(Object.values(row).map((e, i) => anim(c, e, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], 320, { delay: i * 60 })));
    return [
      { cap: 'Both scales have a rabbit. <b>Subtract</b>: Scale B minus Scale C, left side minus left side, reading minus reading.',
        run: async (c) => { await pop(c, rowC.s, 380); await anim(c, rule, [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'none' }], 450); } },
      { cap: 'Rabbit − rabbit <b>= 0</b>: the rabbits cancel. The rabbit has been <b>eliminated</b>!',
        run: (c) => cancelPair(c, stage, rowB.p2.firstChild, rowC.p2.firstChild, '<b class="u8l3-z0">0</b>') },
      { cap: 'What is left: dog − cat = 12 − 6 = <b>6 kg</b>. The dog is <b>6 kg heavier</b> than the cat.', run: (c) => showRow(c, res) },
      { cap: 'Now bring in Scale A, dog + cat = 14 kg. The cats have <b>opposite</b> signs (− and +), so this time <b>add</b>.',
        run: async (c) => { await showRow(c, r1); await showRow(c, r2); await anim(c, rule2, [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'none' }], 450); } },
      { cap: 'The cats cancel: <b>2 dogs = 6 + 14 = 20 kg</b>, so one dog is <b>10 kg</b>.',
        run: async (c) => { await cancelPair(c, stage, r1.p2.firstChild, r2.p2.firstChild, '<b class="u8l3-z0">0</b>'); await showRow(c, r3); } },
      { cap: 'Then the cat is 14 − 10 = <b>4 kg</b> and the rabbit is 6 − 4 = <b>2 kg</b>. Check with the scale we haven’t used, B: 10 + 2 = 12 ✓',
        run: (c) => show(c, fin) }
    ];
  }
};
function petsBig(stage, W) {
  const sw = Math.floor((W - 60) / 3);
  const smalls = SCALES.map(([n, r, k], i) => add(stage, box(vetScale(n, r, k, 'u8l3-vs-sm'), sw, null), 14 + i * (sw + 16), 6));
  const big = add(stage, box(vetScale('One big scale', '? kg', [], 'u8l3-vs-big'), 520, null), 14, 196);
  const P = panel(stage, 556, 196, W - 570, 244, '');
  const rows = [];
  return [
    { cap: 'Pile all six pets onto one big scale. It reads <b>14 + 12 + 6 = 32 kg</b>.',
      run: async (c) => {
        const list = []; smalls.forEach((s) => [...s.row.children].forEach((p) => list.push({ el: petEl(p.kind), from: rel(stage, p), cont: big.row })));
        smalls.forEach((s) => s.classList.add('u8l3-used'));
        await moveInto(c, stage, list, 900);
        big.disp.textContent = '32 kg'; await pulse(c, big.disp, 1.2);
        rows.push(lineEl(P, `${T('14+12+6=32')} kg`)); await show(c, rows[0]);
      } },
    { cap: 'Look who is on it: <b>2 cats, 2 dogs, 2 rabbits</b>. Every pet stood on a scale <b>twice</b>.',
      run: async (c) => {
        const ord = { cat: 0, dog: 1, rabbit: 2 };
        await flip(c, stage, () => [...big.row.children], () => [...big.row.children].sort((a, b) => ord[a.kind] - ord[b.kind]).forEach((e) => big.row.appendChild(e)), 600);
        await Promise.all([...big.row.children].map((e, i) => pulse(c, e, 1.12, 420 + i * 40)));
        const l = lineEl(P, '2 cats + 2 dogs + 2 rabbits'); await show(c, l);
      } },
    { cap: 'So <b>one of each</b> weighs half as much: 32 ÷ 2 = <b>16 kg</b>. That is answer <b>B</b>.',
      run: async (c) => {
        const kids = [...big.row.children], gone = kids.filter((_, i) => i % 2 === 1);
        await Promise.all(gone.map((e) => anim(c, e, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-30px)' }], 450)));
        await flip(c, stage, () => [...big.row.children], () => gone.forEach((e) => e.remove()));
        big.disp.textContent = '16 kg'; await pulse(c, big.disp, 1.2);
        const l = lineEl(P, `one of each: ${T('32\\div2=16')} kg`, 'u8l3-lnb'); await show(c, l);
      } },
    { cap: 'Take away Scale A (cat + dog = 14 kg). What is left on the big scale is the rabbit: 16 − 14 = <b>2 kg</b>.',
      run: async (c) => { smalls[0].classList.remove('u8l3-used'); smalls[0].classList.add('u8l3-hot'); await pulse(c, smalls[0], 1.05); const l = lineEl(P, `rabbit ${T('=16-14=2')} kg`); await show(c, l); } },
    { cap: 'In the same way, cat = 16 − 12 = <b>4 kg</b> (take away Scale B) and dog = 16 − 6 = <b>10 kg</b> (take away Scale C).',
      run: async (c) => {
        smalls[0].classList.remove('u8l3-hot');
        const l1 = lineEl(P, `cat ${T('=16-12=4')} kg`), l2 = lineEl(P, `dog ${T('=16-6=10')} kg`);
        await show(c, l1); await show(c, l2);
      } }
  ];
}

/* =============================== explainer: adding two balances (the star) =============================== */
const BAL = {
  idea: { label: 'The idea', e1: E(1, 1, 10), e2: E(1, -1, 4), op: 'add', el: 'y', back: 1, two: true },
  ex1: { label: '(add)', e1: E(4, 3, 18), e2: E(2, -3, 0), op: 'add', el: 'y', back: 2 },
  ex2: { label: '(subtract)', e1: E(3, 4, 7), e2: E(3, -2, 19), op: 'sub', el: 'x', back: 1 },
  ex3: { label: '(scale, then add)', e1: E(3, 2, 20), e2: E(5, -1, 29), m2: 2, op: 'add', el: 'y', back: 2 }
};
const balance = {
  title: 'Two balances, added pan to pan',
  height: 508,
  choices: [{ v: 'idea', label: 'The idea' }, { sep: 'Check' }, { v: 'ex1', label: 'Example 1 (add)' }, { v: 'ex2', label: 'Example 2 (subtract)' }, { v: 'ex3', label: 'Example 3 (scale, then add)' }],
  intro: (k) => (k === 'idea' ? 'Two level balances: each equation says <b>left side = right side</b>. Press <b>Next</b>.'
    : `${TAG1} ${T(k1(eqT(BAL[k].e1)))} and ${TAG2} ${T(k2(eqT(BAL[k].e2)))}, each a level balance. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = BAL[k], W = ex.W, { e1, e2 } = d;
    const e2s = d.m2 ? scaleE(e2, d.m2) : e2, e2u = d.op === 'sub' ? scaleE(e2s, -1) : e2s;
    const sum = E(e1.a + e2u.a, e1.b + e2u.b, e1.c + e2u.c), kv = d.el === 'y' ? 'x' : 'y', K = kv === 'x' ? sum.a : sum.b, val = sum.c / K;
    const eb = d.back === 1 ? e1 : e2, oth = kv === 'x' ? (eb.c - eb.a * val) / eb.b : (eb.c - eb.b * val) / eb.a;
    const sol = kv === 'x' ? [val, oth] : [oth, val];
    const subT = kv === 'x' ? `${known(eb.a, val, true)}${term(eb.b, 'y', false)}=${texNum(eb.c)}\\ \\Rightarrow\\ y=${texNum(oth)}`
      : `${term(eb.a, 'x', true)}${known(eb.b, val, false)}=${texNum(eb.c)}\\ \\Rightarrow\\ x=${texNum(oth)}`;
    const sumT = `${k1(`(${lhs(e1)})`)}+${k2(`(${lhs(e2u)})`)}=${k1(texNum(e1.c))}${k2(plusC(e2u.c))}`;
    const oneT = `${term(K, kv, true)}=${texNum(sum.c)}`;
    const bw = Math.floor((W - 36) / 2);
    const b1 = new Balance(stage, { x: 12, y: 6, w: bw, h: 222, label: `${TAG1} ${T(k1(eqT(e1)))}` });
    const b2 = new Balance(stage, { x: W - 12 - bw, y: 6, w: bw, h: 222, label: `${TAG2} ${T(k2(eqT(e2)))}` });
    b1.fill(e1, 1); b2.fill(e2, 2);
    const bb = new Balance(stage, { x: 12, y: 238, w: 560, h: 252, label: '<span class="u8l3-muted">one big balance</span>', cls: 'u8l3-big' });
    const P = panel(stage, 586, 242, W - 598, 260, 'On the board', 'u8l3-board');
    const steps = [];
    if (d.m2) {
      steps.push({ cap: `First scale Eq. 2: multiply <b>every</b> block on <b>both</b> pans by ${d.m2}. Now ${T(k2(eqT(e2s)))}. Still level.`,
        run: async (c) => {
          const bs = [b2.badge(0, '×' + d.m2), b2.badge(1, '×' + d.m2)]; await Promise.all(bs.map((b) => pop(c, b)));
          await flip(c, stage, () => b2.all(), () => b2.all().forEach((e) => { e.k *= d.m2; drawBlk(e); }));
          await Promise.all(b2.all().map((e) => pulse(c, e, 1.15)));
          b2.label(`${tag(2, 'Eq. 2 × ' + d.m2)} ${T(k2(eqT(e2s)))}`); bs.forEach((b) => b.remove());
          await show(c, lineEl(P, `${tag(2, '× ' + d.m2)} ${T(k2(eqT(e2s)))}`));
        } });
    }
    if (d.op === 'sub') {
      steps.push({ cap: `Subtracting Eq. 2 means adding its <b>opposite</b>. Flip <b>every</b> block of Eq. 2, on both pans, the 19 too: ${T(k2(eqT(e2u)))}. Still level.`,
        run: async (c) => { await negate(c, b2.all()); b2.label(`${tag(2, '−Eq. 2')} ${T(k2(eqT(e2u)))}`); await show(c, lineEl(P, `${tag(2, '−Eq. 2')} ${T(k2(eqT(e2u)))}`)); } });
    }
    const bigL = () => bb.label(T(sumT));
    if (d.two) {
      steps.push({ cap: 'Start one big balance with everything from Eq. 1. Level, of course.',
        run: (c) => copyInto(c, stage, [[b1.items(0), bb.pans[0].cont], [b1.items(1), bb.pans[1].cont]]) });
      steps.push({ cap: `Now pour Eq. 2’s <b>left</b> side onto the left pan only. ${T(lhs(e2))} is worth ${T(e2.c)}, so the balance <b>tips</b>!`,
        run: async (c) => { await copyInto(c, stage, [[b2.items(0), bb.pans[0].cont]]); await bb.tilt(c, 0.09 * Math.sign(e2.c)); } });
      steps.push({ cap: `Eq. 2’s <b>right</b> side is the same amount, ${T(e2.c)}. Add it to the right pan: equal + equal, <b>level again</b>.`,
        run: async (c) => { await copyInto(c, stage, [[b2.items(1), bb.pans[1].cont]]); await bb.tilt(c, 0); bigL(); await show(c, lineEl(P, T(sumT))); } });
    } else {
      steps.push({ cap: 'Put both balances on one big balance: <b>left pan to left pan, right pan to right pan</b>. Equal + equal: still level.',
        run: async (c) => {
          await copyInto(c, stage, [[b1.items(0), bb.pans[0].cont], [b1.items(1), bb.pans[1].cont], [b2.items(0), bb.pans[0].cont], [b2.items(1), bb.pans[1].cont]]);
          bigL(); await show(c, lineEl(P, T(sumT)));
        } });
    }
    const ka = d.el === 'x' ? e1.a : e1.b, kb = d.el === 'x' ? e2u.a : e2u.b;
    steps.push({ cap: `${T(term(ka, d.el, true))} and ${T(term(kb, d.el, true))} are <b>opposites</b>: together they make ${T('0')}. ${T(d.el)} is <b>eliminated</b>!`,
      run: async (c) => { const pr = bb.items(0).filter((e) => e.v === d.el); await cancelPair(c, stage, pr[0], pr[1]); } });
    const cs = [e1.c, e2u.c].filter((v) => v !== 0);
    steps.push({ cap: `Collect what is left: ${T(`${term(kv === 'x' ? e1.a : e1.b, kv, true)}${term(kv === 'x' ? e2u.a : e2u.b, kv, false)}=${term(K, kv, true)}`)}${cs.length > 1 ? ' and ' + T(`${texNum(e1.c)}${plusC(e2u.c)}=${texNum(sum.c)}`) : ''}. One equation, <b>one variable</b>: ${T(kr(oneT))}.`,
      run: async (c) => {
        const vs = bb.items(0).filter((e) => e.v === kv), ns = bb.items(1);
        await Promise.all([merge(c, stage, vs[0], vs.slice(1), K), merge(c, stage, ns[0], ns.slice(1), sum.c)]);
        bb.label(T(kr(oneT))); await show(c, lineEl(P, T(kr(oneT))));
      } });
    steps.push({ cap: `Divide <b>both</b> pans by ${T(K)}: ${T(kr(`${kv}=${texNum(val)}`))}.`,
      run: async (c) => {
        const bs = [bb.badge(0, '÷' + pm(K)), bb.badge(1, '÷' + pm(K))]; await Promise.all(bs.map((b) => pop(c, b)));
        const [L1] = bb.items(0), [R1] = bb.items(1);
        await flip(c, stage, () => bb.all(), () => { L1.k = 1; drawBlk(L1); R1.k = val; drawBlk(R1); });
        await Promise.all([pulse(c, L1, 1.2), pulse(c, R1, 1.2)]); bs.forEach((b) => b.remove());
        bb.label(T(kr(`${kv}=${texNum(val)}`))); await show(c, lineEl(P, T(kr(`${kv}=${texNum(val)}`))));
      } });
    steps.push({ cap: `Put ${T(`${kv}=${texNum(val)}`)} back into Eq. ${d.back}: ${T(subT)}. The solution is ${T(ks(pairTex(...sol)))}.`,
      run: async (c) => { await show(c, lineEl(P, `${tag(d.back, 'Eq. ' + d.back)} ${T(subT)}`)); const s = lineEl(P, `Solution ${solPill(...sol)}`, 'u8l3-lnsol'); await pop(c, s); } });
    return steps;
  }
};

/* =============================== explainer: subtracting flips every sign =============================== */
const SG = {
  ex2: { label: 'Example 2', vars: ['x', 'y'], r1: [3, 4, 7], r2: [3, -2, 19], n1: 'Eq. 1', n2: 'Eq. 2',
    slip: ['Watch out: flipping only the <b>first</b> sign gives', '4y-2y=2y', '2y=-12\\ \\Rightarrow\\ y=-6', 'Then Eq. 1 gives 3x-24=7: x is not even a whole number, and Eq. 2 fails.'] },
  ex6: { label: 'Example 6 (a): a negative constant', vars: ['x', 'y'], r1: [15, -6, 21], r2: [4, -6, -12], n1: 'Eq. 1 × 3', n2: 'Eq. 2 × 2',
    slip: ['Watch out: subtracting −12 <b>adds</b> 12.', '21-(-12)=21+12=33', '\\text{not } 21-12=9', 'With 9 you would get 11x = 9, and x is not 3.'] },
  pets: { label: 'Warm-up: Scale B − Scale C', vars: ['d', 'c', 'r'], r1: [1, 0, 1, 12], r2: [0, 1, 1, 6], n1: 'Scale B', n2: 'Scale C' }
};
const signs = {
  title: 'Subtract = flip every sign, then add',
  height: 430,
  choices: [{ sep: 'Check' }, ...Object.keys(SG).map((k) => ({ v: k, label: SG[k].label }))],
  value: 'ex2',
  intro: (k) => `${SG[k].n1} minus ${SG[k].n2}. Line the equations up in columns. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SG[k], vs = d.vars, n = vs.length, W = ex.W;
    const r1 = d.r1, r2 = d.r2, rn = r2.map((v) => -v), rs = r1.map((v, i) => v + rn[i]);
    const elimI = vs.findIndex((_, i) => r1[i] && r2[i] && rs[i] === 0);
    const leftK = vs.map((v, i) => [rs[i], v]).filter(([q], i) => q && i !== elimI);
    const resT = (leftK.map(([q, v], i) => term(q, v, i === 0)).join('') || '0') + '=' + texNum(rs[n]);
    const colW = n === 3 ? 96 : 118, x0 = 168, xs = vs.map((_, i) => x0 + 34 + i * colW), xe = x0 + 34 + n * colW, xc = xe + 40;
    const cell = (x, y, w, html, cls = '') => add(stage, box(h('div', 'u8l3-sc ' + cls, html), w, 52), x, y);
    const rowT = (r, i, col, first) => (r[i] ? T(tc(col, term(r[i], vs[i], first))) : '');
    const firstI = (r) => r.findIndex((v) => v);
    const name = (y, html) => add(stage, box(h('div', 'u8l3-sname', html), 156, 52), 6, y);
    const Y = [20, 86, 170, 262];
    name(Y[0], tag(1, d.n1)); name(Y[1], tag(2, d.n2));
    vs.forEach((_, i) => cell(xs[i], Y[0], colW, rowT(r1, i, B1, i === firstI(r1))));
    cell(xe, Y[0], 40, T('=')); cell(xc, Y[0], 110, T(k1(texNum(r1[n]))));
    const minus = cell(x0, Y[1], 34, T('-('), 'u8l3-sbr'), close = cell(xc + 110, Y[1], 30, T(')'), 'u8l3-sbr');
    minus.style.opacity = 0; close.style.opacity = 0;
    const r2c = vs.map((_, i) => cell(xs[i], Y[1], colW, rowT(r2, i, A2, i === firstI(r2))));
    cell(xe, Y[1], 40, T('=')); const r2k = cell(xc, Y[1], 110, T(k2(texNum(r2[n]))));
    const fl = name(Y[2], `<span class="u8l3-flipt">flip every sign</span>`); fl.style.opacity = 0;
    const flc = vs.map((_, i) => cell(xs[i], Y[2], colW, r2[i] ? T(tc(A2, (rn[i] > 0 ? '+' : '') + term(rn[i], vs[i], true))) : '', 'u8l3-flipc'));
    const fle = cell(xe, Y[2], 40, T('=')), flk = cell(xc, Y[2], 110, T(k2(texNum(rn[n]))), 'u8l3-flipc');
    [...flc, fle, flk].forEach((e) => (e.style.opacity = 0));
    const rule = add(stage, box(h('div', 'u8l3-rule'), xc + 110 - x0, 4), x0, Y[3] - 12); rule.style.opacity = 0;
    const sumc = vs.map((_, i) => cell(xs[i], Y[3], colW, (r1[i] || r2[i]) ? T(i === elimI ? '0' : kr(term(rs[i], vs[i], i === firstI(rs)))) : '', i === elimI ? 'u8l3-sz' : ''));
    const sume = cell(xe, Y[3], 40, T('=')), sumk = cell(xc, Y[3], 110, T(kr(texNum(rs[n]))));
    [...sumc, sume, sumk].forEach((e) => (e.style.opacity = 0));
    const P = panel(stage, W - 290, 14, 278, 400, 'Result');
    const val = leftK.length === 1 ? rs[n] / leftK[0][0] : null;
    const steps = [
      { cap: `Write the whole of ${d.n2} in brackets with a minus sign in front: ${T(`(${'\\cdots'})-(${'\\cdots'})`)}. The minus belongs to <b>every</b> term inside.`,
        run: async (c) => { await Promise.all([pop(c, minus), pop(c, close)]); } },
      { cap: `Taking away = adding the <b>opposite</b>. Flip the sign of <b>every</b> term in the bracket, the constant too.`,
        run: async (c) => {
          await fadeIn(c, fl);
          for (let i = 0; i < n; i++) { if (!r2[i]) continue; r2c[i].classList.add('u8l3-hl'); await pop(c, flc[i], 360); r2c[i].classList.remove('u8l3-hl'); }
          await appear(c, fle); r2k.classList.add('u8l3-hl'); await pop(c, flk, 360); r2k.classList.remove('u8l3-hl');
        } },
      { cap: `Now <b>add</b> down each column. ${elimI >= 0 ? `${T(term(r1[elimI], vs[elimI], true) + term(rn[elimI], vs[elimI], false))} ${T('=0')}: ${T(vs[elimI])} is eliminated.` : ''}`,
        run: async (c) => {
          await anim(c, rule, [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'none' }], 400);
          for (let i = 0; i < n; i++) { if (!(r1[i] || r2[i])) continue; await pop(c, sumc[i], 380); }
          await appear(c, sume); await pop(c, sumk, 380);
          if (elimI >= 0) { sumc[elimI].classList.add('u8l3-gone'); }
          await show(c, lineEl(P, T(kr(resT)), 'u8l3-lnb'));
        } }
    ];
    if (val != null && k !== 'pets') {
      const v = leftK[0][1];
      steps.push({ cap: `One variable left: ${T(kr(resT))}, so ${T(kr(`${v}=${texNum(val)}`))}.`, run: (c) => show(c, lineEl(P, T(kr(`${v}=${texNum(val)}`)), 'u8l3-lnb')) });
    }
    if (k === 'pets') {
      steps.push({ cap: `${T('d-c=6')}: the dog is 6 kg heavier than the cat, with no rabbit in sight.`, run: (c) => show(c, lineEl(P, 'The dog is <b>6 kg heavier</b>.')) });
    }
    if (d.slip) {
      steps.push({ cap: d.slip[0] + ' ' + T(d.slip[1]) + '. ' + d.slip[3],
        run: async (c) => {
          const box2 = h('div', 'u8l3-slip', `<div class="u8l3-sliph">Watch out</div><div>${T(d.slip[1])}</div><div>${T(d.slip[2])}</div>`);
          P.appendChild(box2); await show(c, box2); const s = stamp(box2, '✗', { ok: false, size: 'sm' }); await stampIn(c, s);
        } });
    }
    return steps;
  }
};

/* =============================== explainer: the graph view =============================== */
const PC = {
  ex1: { label: 'Example 1: add', e1: E(4, 3, 18), e2: E(2, -3, 0), p: 1, q: 1, win: { xmin: -2, xmax: 8, ymin: -3, ymax: 7 } },
  ex2: { label: 'Example 2: subtract', e1: E(3, 4, 7), e2: E(3, -2, 19), p: 1, q: -1, win: { xmin: -1, xmax: 9, ymin: -7, ymax: 3 } },
  ex3: { label: 'Example 3: Eq. 2 × 2, add', e1: E(3, 2, 20), e2: E(5, -1, 29), p: 1, q: 2, win: { xmin: 1, xmax: 11, ymin: -4, ymax: 6 } },
  ex5: { label: 'Example 5: × 2 and × 5', e1: E(4, 5, 1), e2: E(3, -2, 18), p: 2, q: 5, win: { xmin: -1, xmax: 9, ymin: -8, ymax: 2 } }
};
const lineOf = (G, e, o) => (e.b ? G.line({ m: -e.a / e.b, b: e.c / e.b }, o) : G.line({ x: e.c / e.a }, o));
const plain = (v) => pm((Math.round(v * 10) / 10).toFixed(1));
const pencil = {
  title: 'Adding equations turns a line about the crossing',
  height: 476,
  choices: [{ sep: 'Check' }, ...Object.keys(PC).map((k) => ({ v: k, label: PC[k].label }))],
  value: 'ex1',
  intro: (k) => `${TAG1} ${T(k1(eqT(PC[k].e1)))} and ${TAG2} ${T(k2(eqT(PC[k].e2)))}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = PC[k], { e1, e2, p, q } = d, W = ex.W;
    const det = e1.a * e2.b - e1.b * e2.a, S = [(e1.c * e2.b - e1.b * e2.c) / det, (e1.a * e2.c - e1.c * e2.a) / det];
    const fin = E(p * e1.a + q * e2.a, p * e1.b + q * e2.b, p * e1.c + q * e2.c);
    const vert = Math.abs(fin.b) < 1e-9, finT = vert ? `${texNum(fin.a)}x=${texNum(fin.c)}` : `${texNum(fin.b)}y=${texNum(fin.c)}`;
    const resT = vert ? `x=${texNum(S[0])}` : `y=${texNum(S[1])}`;
    const G = new Graph(stage, Object.assign({ x: 10, y: 6, width: 464, height: 464, xlabels: 2, ylabels: 2, fontSize: 16 }, d.win));
    const P = panel(stage, 492, 10, W - 504, 456, '');
    lineEl(P, `${TAG1} ${T(k1(eqT(e1)))}`); lineEl(P, `${TAG2} ${T(k2(eqT(e2)))}`);
    const kname = p === 1 ? 'Eq. 1' : `${p} × Eq. 1`, sgn = q > 0 ? '+' : '−';
    const ro = lineEl(P, '', 'u8l3-kro'); ro.style.opacity = 0;
    ro.innerHTML = `<div class="u8l3-rok">${kname} ${sgn} <b class="u8l3-kv">k</b> × Eq. 2</div><div class="u8l3-rokv">k = <b class="u8l3-kn">0</b></div><div class="u8l3-roeq"></div>`;
    const kn = ro.querySelector('.u8l3-kn'), req = ro.querySelector('.u8l3-roeq');
    const st = { t: 0, on: false };
    const coef = () => E(p * e1.a + st.t * q * e2.a, p * e1.b + st.t * q * e2.b, p * e1.c + st.t * q * e2.c);
    const comb = G.curve(() => {
      if (!st.on) return { subs: [] };
      const cc = coef(), dv = [cc.b, -cc.a], L = Math.hypot(dv[0], dv[1]) || 1, u = [dv[0] / L, dv[1] / L];
      const TT = G._clipT(S, u, -Infinity, Infinity); if (!TT) return { subs: [] };
      return { subs: [[G.toPx(S[0] + u[0] * TT[0], S[1] + u[1] * TT[0]), G.toPx(S[0] + u[0] * TT[1], S[1] + u[1] * TT[1])]] };
    }, { color: RES, width: 5 }, 'bk-line', G.layers.data);
    const upd = () => {
      const cc = coef(); comb._bkDraw(); kn.textContent = (Math.round(st.t * Math.abs(q) * 100) / 100).toFixed(2);
      req.textContent = `${plain(cc.a)}x ${cc.b < 0 ? '−' : '+'} ${plain(Math.abs(cc.b))}y = ${plain(cc.c)}`;
    };
    const steps = [
      { cap: `Eq. 1 (blue) and Eq. 2 (amber) cross at the solution ${T(ks(pairTex(...S)))}: the only point on <b>both</b> lines.`,
        run: async (c) => {
          await G.drawIn(lineOf(G, e1, { color: B1, width: 4 }), 600, c); await G.drawIn(lineOf(G, e2, { color: A2, width: 4 }), 600, c);
          await pop(c, G.point(S[0], S[1], { color: SOL, r: 8, label: T(pairTex(...S)), pos: 'ne', cls: 'bk-ptlab' }));
        } }
    ];
    if (p !== 1) {
      steps.push({ cap: `${p} × Eq. 1 is ${T(k1(eqT(scaleE(e1, p))))}: the <b>same</b> blue line, since every term was doubled.`,
        run: (c) => show(c, lineEl(P, `${tag(1, p + ' × Eq. 1')} ${T(k1(eqT(scaleE(e1, p))))}`)) });
    }
    steps.push({ cap: `Make a new equation, ${kname} ${sgn} ${T('k')} × Eq. 2, and let ${T('k')} grow from ${T('0')} to ${T(Math.abs(q))}. Every point on <b>both</b> lines fits it, so the green line always passes through the crossing. Watch it <b>turn</b>.`,
      run: async (c) => {
        st.on = true; st.t = 0; await show(c, ro); upd();
        await tween(c, 2600, (t) => { st.t = t; upd(); });
      } });
    steps.push({ cap: `At ${T('k=' + Math.abs(q))} the ${T(vert ? 'y' : 'x')}-terms cancel: ${T(kr(finT))}, a <b>${vert ? 'vertical' : 'horizontal'}</b> line through the crossing.`,
      run: async (c) => {
        st.t = 1; upd(); req.innerHTML = T(kr(eqT(fin)));
        const lab = vert ? G.label(S[0], d.win.ymax - 0.6, T(kr(resT)), { pos: 'e', cls: 'bk-pill', color: RES }) : G.label(d.win.xmax - 1.6, S[1], T(kr(resT)), { pos: 'n', cls: 'bk-pill', color: RES });
        await pop(c, lab);
      } });
    steps.push({ cap: `That is all elimination does: it finds the ${vert ? 'vertical' : 'horizontal'} line through the crossing, so ${T(kr(resT))}. The other coordinate comes from either original line.`,
      run: async (c) => {
        await G.drawIn(G.segment(S, vert ? [S[0], 0] : [0, S[1]], { color: SOL, width: 2.5, dash: true }), 500, c);
        const s = lineEl(P, `Solution ${solPill(...S)}`, 'u8l3-lnsol'); await pop(c, s);
      } });
    return steps;
  }
};

/* =============================== explainer: scaling copies the whole balance =============================== */
const SC = {
  ex3: { label: 'Example 3: Eq. 2 × 2', e: E(5, -1, 29), o: E(3, 2, 20), n: 2, m: 2, win: { xmin: 2, xmax: 10, ymin: -3, ymax: 7 } },
  bad: { label: 'Forget the constant', e: E(5, -1, 29), o: E(3, 2, 20), n: 2, m: 2, forget: true, win: { xmin: 2, xmax: 10, ymin: -3, ymax: 7 } },
  ex5: { label: 'Example 5 (a): Eq. 1 × 2', e: E(4, 5, 1), o: E(3, -2, 18), n: 1, m: 2, win: { xmin: -1, xmax: 9, ymin: -8, ymax: 2 } }
};
const scale = {
  title: 'Scaling an equation copies the whole balance',
  height: 470,
  choices: Object.keys(SC).map((k) => ({ v: k, label: SC[k].label })),
  intro: (k) => `${tag(SC[k].n, 'Eq. ' + SC[k].n)} ${T(tc(SC[k].n === 1 ? B1 : A2, eqT(SC[k].e)))} as a level balance. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SC[k], { e, o, m } = d, col = d.n === 1 ? B1 : A2, W = ex.W;
    const sE = scaleE(e, m), bad = E(e.a * m, e.b * m, e.c);
    const e1 = d.n === 1 ? e : o, e2 = d.n === 1 ? o : e;
    const det = e1.a * e2.b - e1.b * e2.a, S = [(e1.c * e2.b - e1.b * e2.c) / det, (e1.a * e2.c - e1.c * e2.a) / det];
    const bal = new Balance(stage, { x: 10, y: 6, w: 520, h: 300, top: 104, label: `${tag(d.n, 'Eq. ' + d.n)} ${T(tc(col, eqT(e)))}` });
    bal.fill(e, d.n);
    const G = new Graph(stage, Object.assign({ x: W - 440, y: 6, width: 430, height: 458, xlabels: 2, ylabels: 2, fontSize: 16 }, d.win));
    const V = add(stage, box(h('div', 'u8l3-verd'), 520, 140), 10, 320);
    const steps = [
      { cap: `${tag(d.n, 'Eq. ' + d.n)} ${T(tc(col, eqT(e)))} is a level balance. On the graph it is the ${d.n === 1 ? 'blue' : 'amber'} line through the solution ${T(ks(pairTex(...S)))}.`,
        run: async (c) => {
          await G.drawIn(lineOf(G, o, { color: d.n === 1 ? A2 : B1, width: 3, opacity: 0.45 }), 400, c);
          await G.drawIn(lineOf(G, e, { color: col, width: 4 }), 600, c);
          await pop(c, G.point(S[0], S[1], { color: SOL, r: 8, label: T(pairTex(...S)), pos: 'ne', cls: 'bk-ptlab' }));
        } }
    ];
    const ghosts = [];
    const makeGhosts = async (c, pans) => {
      const list = pans.flatMap((i) => bal.items(i));
      for (const b of list) {
        const r = rel(stage, b), gh = add(stage, drawBlk(Object.assign(h('div', ''), { v: b.v, k: b.k, src: b.src })), r.x, r.y - r.h - 10);
        gh.classList.add('u8l3-ghost'); gh.target = b; ghosts.push(gh);
      }
      await Promise.all(ghosts.map((g, i) => anim(c, g, [{ opacity: 0, transform: 'translateY(-24px)' }, { opacity: 1, transform: 'none' }], 420, { delay: i * 80 })));
    };
    const mergeGhosts = async (c) => {
      await Promise.all(ghosts.map((g) => { const r = rel(stage, g), t = rel(stage, g.target); return anim(c, g, [{ transform: 'none', opacity: 1 }, { transform: `translate(${t.x - r.x}px,${t.y - r.y}px)`, opacity: 0.2 }], 520); }));
      const conts = bal.pans.map((p) => p.cont);
      await flip(c, stage, () => conts.flatMap((ct) => [...ct.children]), () => ghosts.forEach((g) => { g.target.k *= m; drawBlk(g.target); g.remove(); }));
      await Promise.all(ghosts.map((g) => pulse(c, g.target, 1.15)));
    };
    if (!d.forget) {
      steps.push({ cap: `Multiplying by ${m} = a second copy of the <b>whole</b> balance: every block on <b>both</b> pans.`,
        run: async (c) => { const b = bal.badge(0, '×' + m), b2 = bal.badge(1, '×' + m); await Promise.all([pop(c, b), pop(c, b2)]); await makeGhosts(c, [0, 1]); } });
      steps.push({ cap: `Merge the copies: ${T(tc(col, eqT(sE)))}. Equal + equal: still <b>level</b>.`,
        run: async (c) => {
          await mergeGhosts(c); bal.label(`${tag(d.n, `Eq. ${d.n} × ${m}`)} ${T(tc(col, eqT(sE)))}`);
          V.innerHTML = `<div class="u8l3-vline">${T(`${m}(${eqT(e).replace('=', ')=' + m + '(')})`)}</div><div class="u8l3-vline">${T(tc(col, eqT(sE)))}</div>`;
          await show(c, V); await stampIn(c, stamp(V, 'level', { ok: true, size: 'sm' }));
        } });
      steps.push({ cap: `Graph ${T(tc(col, eqT(sE)))}: it lands <b>exactly</b> on the ${d.n === 1 ? 'blue' : 'amber'} line. Same line, same solutions: ${T(ks(pairTex(...S)))} has not moved.`,
        run: async (c) => {
          await G.drawIn(lineOf(G, sE, { color: RES, width: 6, dash: true }), 900, c);
          const lab = G.label(S[0], S[1], T(kr(eqT(sE))), { pos: 'sw', cls: 'bk-pill', color: RES }); await pop(c, lab);
        } });
    } else {
      steps.push({ cap: `What if we copy only the <b>left</b> pan, and forget the ${T(e.c)} on the right?`,
        run: async (c) => { const b = bal.badge(0, '×' + m); await pop(c, b); await makeGhosts(c, [0]); } });
      steps.push({ cap: `Now the left side is ${T(lhs(bad))}, worth ${T(m * e.c)}, but the right pan still holds ${T(e.c)}. The balance <b>tips</b>: not equal any more!`,
        run: async (c) => {
          await mergeGhosts(c); bal.label(`${T(tc(RED, `${lhs(bad)}\\neq${texNum(e.c)}`))}`); await bal.tilt(c, 0.1);
          V.innerHTML = `<div class="u8l3-vline">${T(`${lhs(bad)}=${texNum(e.c)}`)}</div><div class="u8l3-vline u8l3-muted">the 29 was never doubled</div>`;
          await show(c, V); await stampIn(c, stamp(V, 'not level', { ok: false, size: 'sm' }));
        } });
      steps.push({ cap: `On the graph, ${T(tc(RED, eqT(bad)))} is a <b>different</b> line (parallel to the amber one). It misses ${T(ks(pairTex(...S)))}, so the “solution” would come out wrong.`,
        run: async (c) => {
          await G.drawIn(lineOf(G, bad, { color: RED, width: 4, dash: true }), 900, c);
          const lab = G.label(4, 5.5, T(tc(RED, eqT(bad))), { pos: 'e', cls: 'bk-pill', color: RED }); await pop(c, lab);
        } });
    }
    return steps;
  }
};

/* =============================== explainer: the LCM picks the multipliers =============================== */
const LC = {
  ex3: { label: 'Example 3: eliminate y', e1: E(3, 2, 20), e2: E(5, -1, 29), v: 'y' },
  ex4: { label: 'Example 4: eliminate x', e1: E(3, 2, 20), e2: E(5, -1, 29), v: 'x' },
  ex5a: { label: 'Example 5 (a): y', e1: E(4, 5, 1), e2: E(3, -2, 18), v: 'y' },
  ex5c: { label: 'Example 5 (c): x', e1: E(4, 5, 1), e2: E(3, -2, 18), v: 'x' }
};
/** TeX of e with the v-term highlighted */
function eqHL(e, v, col) {
  const parts = [[e.a, 'x'], [e.b, 'y']].map(([q, vv], i) => {
    if (!q) return '';
    const t = term(q, vv, i === 0), sgn = t[0] === '-' || t[0] === '+' ? t[0] : '', body = sgn ? t.slice(1) : t;
    return vv === v ? `${tc(col, sgn)}\\colorbox{#ffe08a}{$${tc(col, body)}$}` : tc(col, t);
  });
  return parts.join('') + tc(col, '=' + texNum(e.c));
}
const lcm = {
  title: 'Which multipliers? Count up to the LCM',
  height: 460,
  choices: Object.keys(LC).map((k) => ({ v: k, label: LC[k].label })),
  intro: (k) => `To eliminate ${T(LC[k].v)}, its two coefficients must become equal (or opposite). Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = LC[k], { e1, e2, v } = d, W = ex.W;
    const a = v === 'x' ? e1.a : e1.b, b = v === 'x' ? e2.a : e2.b, A = Math.abs(a), Bq = Math.abs(b);
    const L = A * Bq / gcd(A, Bq), m1 = L / A, m2 = L / Bq, same = Math.sign(a) === Math.sign(b);
    const s1 = scaleE(e1, m1), s2 = scaleE(e2, m2), res = same ? E(s1.a - s2.a, s1.b - s2.b, s1.c - s2.c) : E(s1.a + s2.a, s1.b + s2.b, s1.c + s2.c);
    const kv = v === 'x' ? 'y' : 'x', resT = `${term(kv === 'x' ? res.a : res.b, kv, true)}=${texNum(res.c)}`;
    const oneOK = L === A || L === Bq;
    add(stage, box(h('div', 'u8l3-lceq', `${TAG1} ${T(eqHL(e1, v, B1))}`), 440, 50), 14, 10);
    add(stage, box(h('div', 'u8l3-lceq', `${TAG2} ${T(eqHL(e2, v, A2))}`), 440, 50), 14 + 452, 10);
    const lad = (y, n, col, lab) => {
      add(stage, box(h('div', 'u8l3-ladl', lab), 170, 58), 14, y);
      const cells = []; for (let i = 1; i <= L / n; i++) { const ce = add(stage, box(h('div', 'u8l3-lad', `<b>${n * i}</b><span>×${i}</span>`), 70, 58), 190 + (i - 1) * 80, y); ce.style.color = col; ce.style.opacity = 0; ce.val = n * i; cells.push(ce); }
      return cells;
    };
    const c1 = lad(92, A, B1, `multiples of <b>${A}</b>`), c2 = lad(176, Bq, A2, `multiples of <b>${Bq}</b>`);
    const P = panel(stage, 14, 256, W - 28, 196, '');
    const order = [...c1, ...c2].sort((p, q) => p.val - q.val || (c1.includes(p) ? -1 : 1));
    const pl = (x) => (x === 1 ? 'stays as it is (× 1)' : '× ' + x);
    return [
      { cap: `The ${T(v)}-coefficients are ${T(texNum(a))} and ${T(texNum(b))}; ignore the signs for now: ${A} and ${Bq}. ${oneOK ? `${Math.max(A, Bq)} <b>is</b> a multiple of ${Math.min(A, Bq)}, so scaling <b>one</b> equation is enough.` : `Neither is a whole-number multiple of the other, so <b>both</b> equations need scaling.`}`,
        run: async (c) => { await Promise.all([...stage.querySelectorAll('.u8l3-lceq')].map((e) => pulse(c, e, 1.05))); } },
      { cap: `Count up in ${A}s and in ${Bq}s until the two lists meet.`,
        run: async (c) => { for (const ce of order) await pop(c, ce, 300); } },
      { cap: `They first meet at <b>${L}</b>, the <b>least common multiple</b>. So Eq. 1 ${pl(m1)} and Eq. 2 ${pl(m2)}.`,
        run: async (c) => {
          const t1 = c1[c1.length - 1], t2 = c2[c2.length - 1]; t1.classList.add('u8l3-meet'); t2.classList.add('u8l3-meet');
          await Promise.all([pulse(c, t1, 1.15), pulse(c, t2, 1.15)]);
          await show(c, lineEl(P, `LCM <b>${L}</b>: &nbsp;${tag(1, 'Eq. 1 ' + pl(m1))} &nbsp;${tag(2, 'Eq. 2 ' + pl(m2))}`));
        } },
      { cap: `Multiply <b>every</b> term: ${T(k1(eqT(s1)))} and ${T(k2(eqT(s2)))}.`,
        run: async (c) => { const l = lineEl(P, `${T(eqHL(s1, v, B1))} &nbsp;&nbsp;&nbsp; ${T(eqHL(s2, v, A2))}`, 'u8l3-lnbig'); await show(c, l); } },
      { cap: same ? `Both ${T(v)}-terms have the <b>same</b> sign, so <b>subtract</b>: ${T(kr(resT))}.` : `The ${T(v)}-terms have <b>opposite</b> signs, so <b>add</b>: ${T(kr(resT))}.`,
        run: async (c) => {
          const l = lineEl(P, `${same ? '<b>Same</b> signs → subtract' : '<b>Opposite</b> signs → add'}: &nbsp;${T(`${k1(`(${lhs(s1)})`)}${same ? '-' : '+'}${k2(`(${lhs(s2)})`)}=${k1(texNum(s1.c))}${same ? '-' + (s2.c < 0 ? `(${texNum(s2.c)})` : texNum(s2.c)) : plusC(s2.c)}`)} &nbsp;→&nbsp; ${T(kr(resT))}`);
          await show(c, l);
        } }
    ];
  }
};

/* =============================== explainer: the four steps, line by line =============================== */
const WK = {
  ex3: { label: 'Example 3', sol: [6, 1], checks: [['Eq. 1', '3(6)+2(1)=18+2=20'], ['Eq. 2', '5(6)-1=30-1=29']], steps: [
    { s: 1, cap: 'Step 1: the <i>y</i>-coefficients are 2 and −1. Multiply <b>every</b> term of Eq. 2 by 2.', lines: [[tag(2, 'Eq. 2 × 2'), k2('10x-2y=58')]] },
    { s: 2, cap: 'Step 2: +2y and −2y are opposites, so <b>add</b>.', lines: [`${k1('(3x+2y)')}+${k2('(10x-2y)')}=${k1('20')}+${k2('58')}`, kr('13x=78')] },
    { s: 3, cap: 'Step 3: solve.', lines: [kr('x=6')] },
    { s: 4, cap: 'Step 4: substitute into Eq. 2, then verify in <b>both</b> equations.', lines: ['5(6)-y=29\\ \\Rightarrow\\ 30-y=29\\ \\Rightarrow\\ y=1'] }] },
  ex4: { label: 'Example 4', sol: [6, 1], checks: [['Eq. 1', '3(6)+2(1)=18+2=20'], ['Eq. 2', '5(6)-1=30-1=29']], steps: [
    { s: 1, cap: 'Step 1: the <i>x</i>-coefficients are 3 and 5, LCM 15. Eq. 1 × 5 and Eq. 2 × 3.', lines: [[tag(1, 'Eq. 1 × 5'), k1('15x+10y=100')], [tag(2, 'Eq. 2 × 3'), k2('15x-3y=87')]] },
    { s: 2, cap: 'Step 2: 15x and 15x match, so <b>subtract</b> (every sign of the second flips).', lines: [`${k1('(15x+10y)')}-${k2('(15x-3y)')}=${k1('100')}-${k2('87')}`, kr('13y=13')] },
    { s: 3, cap: 'Step 3: solve. It matches Example 3 (c).', lines: [kr('y=1')] },
    { s: 4, cap: 'Step 4: into Eq. 1 for <i>x</i>, then verify in both.', lines: ['3x+2(1)=20\\ \\Rightarrow\\ 3x=18\\ \\Rightarrow\\ x=6'] }] },
  ex5b: { label: 'Example 5 (a)(b)', sol: [4, -3], checks: [['Eq. 1', '4(4)+5(-3)=16-15=1'], ['Eq. 2', '3(4)-2(-3)=12+6=18']], steps: [
    { s: 1, cap: 'Step 1: the <i>y</i>-coefficients are 5 and −2, LCM 10. Eq. 1 × 2 and Eq. 2 × 5.', lines: [[tag(1, 'Eq. 1 × 2'), k1('8x+10y=2')], [tag(2, 'Eq. 2 × 5'), k2('15x-10y=90')]] },
    { s: 2, cap: 'Step 2: +10y and −10y are opposites, so <b>add</b>.', lines: [`${k1('(8x+10y)')}+${k2('(15x-10y)')}=${k1('2')}+${k2('90')}`, kr('23x=92')] },
    { s: 3, cap: 'Step 3: solve.', lines: [kr('x=4')] },
    { s: 4, cap: 'Step 4: into 4x + 5y = 1, then verify in both.', lines: ['4(4)+5y=1\\ \\Rightarrow\\ 16+5y=1\\ \\Rightarrow\\ 5y=-15\\ \\Rightarrow\\ y=-3'] }] },
  ex5d: { label: 'Example 5 (c)(d)', sol: [4, -3], checks: [['Eq. 1', '4(4)+5(-3)=16-15=1'], ['Eq. 2', '3(4)-2(-3)=12+6=18']], steps: [
    { s: 1, cap: 'Step 1: the <i>x</i>-coefficients are 4 and 3, LCM 12. Eq. 1 × 3 and Eq. 2 × 4.', lines: [[tag(1, 'Eq. 1 × 3'), k1('12x+15y=3')], [tag(2, 'Eq. 2 × 4'), k2('12x-8y=72')]] },
    { s: 2, cap: 'Step 2: 12x and 12x match, so <b>subtract</b>: −8y becomes +8y.', lines: [`${k1('(12x+15y)')}-${k2('(12x-8y)')}=${k1('3')}-${k2('72')}`, `15y+8y=-69\\ \\Rightarrow\\ ${kr('23y=-69')}`] },
    { s: 3, cap: 'Step 3: solve. It matches part (b).', lines: [kr('y=-3')] },
    { s: 4, cap: 'Step 4: <i>x</i> from either equation, then verify in both.', lines: ['4x+5(-3)=1\\ \\Rightarrow\\ 4x=16\\ \\Rightarrow\\ x=4'] }] },
  ex6a: { label: 'Example 6 (a)', sol: [3, 4], prep: true, checks: [['Eq. 1', '5(3)-2(4)-7=15-8-7=0'], ['Eq. 2', '2(3)=6,\\quad 3(4)-6=6']], steps: [
    { s: 0, cap: 'Prepare: write both equations in the form <i>Ax</i> + <i>By</i> = <i>C</i>.', lines: [[tag(1, 'Eq. 1'), `${k1('5x-2y-7=0')}\\ \\Rightarrow\\ ${k1('5x-2y=7')}`], [tag(2, 'Eq. 2'), `${k2('2x=3y-6')}\\ \\Rightarrow\\ ${k2('2x-3y=-6')}`]] },
    { s: 1, cap: 'Step 1: to eliminate <i>y</i> (−2 and −3, LCM 6): Eq. 1 × 3 and Eq. 2 × 2.', lines: [[tag(1, 'Eq. 1 × 3'), k1('15x-6y=21')], [tag(2, 'Eq. 2 × 2'), k2('4x-6y=-12')]] },
    { s: 2, cap: 'Step 2: −6y matches −6y, so <b>subtract</b>, and subtract the constant too: 21 − (−12) = 33.', lines: [`${k1('(15x-6y)')}-${k2('(4x-6y)')}=${k1('21')}-${k2('(-12)')}`, kr('11x=33')] },
    { s: 3, cap: 'Step 3: solve.', lines: [kr('x=3')] },
    { s: 4, cap: 'Step 4: into 2x − 3y = −6, then verify in both <b>original</b> equations.', lines: ['2(3)-3y=-6\\ \\Rightarrow\\ 6-3y=-6\\ \\Rightarrow\\ -3y=-12\\ \\Rightarrow\\ y=4'] }] },
  ex6b: { label: 'Example 6 (b)', sol: [4, 2], prep: true, checks: [['Eq. 1', '\\dfrac{3(4)-5(2)}{4}=\\dfrac{2}{4}=\\dfrac12'], ['Eq. 2', '\\dfrac43+\\dfrac22=\\dfrac43+1=\\dfrac73']], steps: [
    { s: 0, cap: 'Prepare: clear the fractions. Eq. 1 × 4 and Eq. 2 × 6 (the LCDs).', lines: [[tag(1, 'Eq. 1 × 4'), k1('3x-5y=2')], [tag(2, 'Eq. 2 × 6'), k2('2x+3y=14')]] },
    { s: 1, cap: 'Step 1: to eliminate <i>y</i> (−5 and 3, LCM 15): × 3 and × 5.', lines: [[tag(1, '× 3'), k1('9x-15y=6')], [tag(2, '× 5'), k2('10x+15y=70')]] },
    { s: 2, cap: 'Step 2: −15y and +15y are opposites, so <b>add</b>.', lines: [`${k1('(9x-15y)')}+${k2('(10x+15y)')}=${k1('6')}+${k2('70')}`, kr('19x=76')] },
    { s: 3, cap: 'Step 3: solve.', lines: [kr('x=4')] },
    { s: 4, cap: 'Step 4: into 2x + 3y = 14, then verify in both <b>original</b> equations.', lines: ['2(4)+3y=14\\ \\Rightarrow\\ 8+3y=14\\ \\Rightarrow\\ 3y=6\\ \\Rightarrow\\ y=2'] }] }
};
const STEPN = ['Prepare', 'Step 1 · Scale', 'Step 2 · Add or subtract', 'Step 3 · Solve', 'Step 4 · Substitute, verify'];
function walkDef(keys, title) {
  return {
    title,
    height: 520,
    choices: [{ sep: 'Check' }, ...keys.map((k) => ({ v: k, label: WK[k].label }))],
    value: keys[0],
    intro: (k) => (WK[k].prep ? 'First get the system ready, then the four steps. Press <b>Next</b>.' : 'The four steps of elimination, one at a time. Press <b>Next</b>.'),
    make(stage, k, ex) {
      const d = WK[k], W = ex.W;
      const trk = add(stage, box(h('div', 'u8l3-trk'), 214, 380), 12, 12);
      const tb = STEPN.map((s, i) => { const b = h('div', 'u8l3-trs', s); if (i === 0 && !d.prep) b.style.display = 'none'; trk.appendChild(b); return b; });
      const solBox = add(stage, box(h('div', 'u8l3-solbox', `<div class="u8l3-ph">Solution</div>${solPill(...d.sol)}`), 214, 100), 12, 408); solBox.style.opacity = 0;
      const lines = add(stage, box(h('div', 'u8l3-wl'), W - 252, 360), 240, 12);
      const chk = add(stage, box(h('div', 'u8l3-chks'), W - 252, 122), 240, 386);
      const cks = d.checks.map(([lab, t], i) => { const q = h('div', 'u8l3-chk', `<div class="u8l3-chkh">${tag(i + 1, 'Check in ' + lab)}</div><div>${T(t)} ✓</div>`); q.style.opacity = 0; chk.appendChild(q); return q; });
      const on = (i) => tb.forEach((b, j) => { b.classList.toggle('on', j === i); if (j < i) b.classList.add('done'); });
      const steps = d.steps.map((st) => ({ cap: st.cap,
        run: async (c) => {
          on(st.s);
          for (const L of st.lines) {
            const html = Array.isArray(L) ? `<span class="u8l3-wlab">${L[0]}</span>${T(L[1])}` : T(L);
            const l = h('div', 'u8l3-wline u8l3-ws' + st.s, html); lines.appendChild(l); await show(c, l);
          }
        } }));
      steps.push({ cap: `Verify in <b>both</b> equations. The solution is ${T(ks(pairTex(...d.sol)))}.`,
        run: async (c) => { on(4); for (const q of cks) await show(c, q); await pop(c, solBox); } });
      return steps;
    }
  };
}
const walk = walkDef(['ex3', 'ex4', 'ex5b', 'ex5d'], 'The four steps, line by line');
const walk6 = walkDef(['ex6a', 'ex6b'], 'Prepare, then the four steps');

/* =============================== explainer: getting the system ready =============================== */
const PR = {
  a1: { label: '6 (a) Eq. 1', n: 1, done: [5, -2, 7], rows: [
    { lab: 'given', toks: [['a', '5x'], ['b', '-2y'], ['c', '-7'], ['eq', '='], ['z', '0']] },
    { lab: 'move', toks: [['a', '5x'], ['b', '-2y'], ['eq', '='], ['c', '7']], move: 'c', cap: 'Move the constant to the right side: <b>−7 becomes +7</b> (add 7 to both sides). The 0 is no longer needed.' }] },
  a2: { label: '6 (a) Eq. 2', n: 2, done: [2, -3, -6], rows: [
    { lab: 'given', toks: [['a', '2x'], ['eq', '='], ['b', '3y'], ['c', '-6']] },
    { lab: 'move', toks: [['a', '2x'], ['b', '-3y'], ['eq', '='], ['c', '-6']], move: 'b', cap: 'Move the <i>y</i>-term to the left side: <b>+3y becomes −3y</b> (subtract 3y from both sides).' }] },
  b1: { label: '6 (b) Eq. 1', n: 1, done: [3, -5, 2], rows: [
    { lab: 'given', toks: [['l', '\\dfrac{3x-5y}{4}'], ['eq', '='], ['r', '\\dfrac{1}{2}']] },
    { lab: '× LCD', toks: [['m1', '4\\times'], ['l', '\\dfrac{3x-5y}{4}'], ['eq', '='], ['m2', '4\\times'], ['r', '\\dfrac{1}{2}']], cap: 'The denominators are 4 and 2, so the LCD is 4. Multiply <b>every</b> term by 4.' },
    { lab: 'simplify', toks: [['l', '3x-5y'], ['eq', '='], ['r', '2']], cap: 'Simplify: 4 × (3x − 5y)/4 = 3x − 5y, and 4 × 1/2 = 2.' }] },
  b2: { label: '6 (b) Eq. 2', n: 2, done: [2, 3, 14], rows: [
    { lab: 'given', toks: [['p', '\\dfrac{x}{3}'], ['o', '+'], ['q', '\\dfrac{y}{2}'], ['eq', '='], ['r', '\\dfrac{7}{3}']] },
    { lab: '× LCD', toks: [['m1', '6\\times'], ['p', '\\dfrac{x}{3}'], ['o', '+'], ['m2', '6\\times'], ['q', '\\dfrac{y}{2}'], ['eq', '='], ['m3', '6\\times'], ['r', '\\dfrac{7}{3}']], cap: 'The denominators are 3, 2 and 3, so the LCD is 6. Multiply <b>every</b> term by 6.' },
    { lab: 'simplify', toks: [['p', '2x'], ['o', '+'], ['q', '3y'], ['eq', '='], ['r', '14']], cap: 'Simplify: 6 × x/3 = 2x, 6 × y/2 = 3y and 6 × 7/3 = 14.' }] }
};
const prep = {
  title: 'Getting each equation ready: Ax + By = C',
  height: 420,
  choices: Object.keys(PR).map((k) => ({ v: k, label: PR[k].label })),
  intro: (k) => `${tag(PR[k].n, 'Eq. ' + PR[k].n)} is not in the form ${T('Ax+By=C')} yet. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = PR[k], col = d.n === 1 ? B1 : A2, W = ex.W, XEQ = Math.round(W * 0.48), RH = 96;
    const mkRow = (r, i) => {
      add(stage, box(h('div', 'u8l3-plab', r.lab), 120, RH - 10), 14, 14 + i * RH);
      const row = add(stage, h('div', 'u8l3-prow'), 0, 14 + i * RH); row.style.height = (RH - 10) + 'px';
      const toks = {};
      r.toks.forEach(([id, t]) => {
        const isM = /^m/.test(id), el = h('div', 'u8l3-tok' + (isM ? ' u8l3-tokm' : '') + (id === 'eq' ? ' u8l3-tokeq' : ''), T(isM || id === 'eq' || id === 'o' ? t : tc(col, t)));
        el.id_ = id; row.appendChild(el); toks[id] = el;
      });
      const eq = toks.eq; row.style.left = (XEQ - eq.offsetLeft - eq.offsetWidth / 2) + 'px';
      return { row, toks };
    };
    const rows = d.rows.map(mkRow);
    rows.slice(1).forEach((r) => Object.values(r.toks).forEach((e) => (e.style.opacity = 0)));
    const fin = add(stage, box(h('div', 'u8l3-pfin'), W - 28, 70), 14, 14 + d.rows.length * RH + 6); fin.style.opacity = 0;
    fin.innerHTML = `<span>Ready: ${T('Ax+By=C')} with</span> ${T(`A=${d.done[0]},\\ B=${d.done[1]},\\ C=${d.done[2]}`)}`;
    const steps = d.rows.slice(1).map((r, j) => ({ cap: r.cap,
      run: async (c) => {
        const A = rows[j], B = rows[j + 1];
        Object.values(A.toks).forEach((e) => e.classList.add('u8l3-old'));
        const moves = [];
        for (const [id, el] of Object.entries(B.toks)) {
          const src = A.toks[id];
          if (!src) { moves.push(anim(c, el, [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'none' }], 380, { delay: 500 })); continue; }
          const from = rel(stage, src), to = rel(stage, el), dx = from.x - to.x, dy = from.y - to.y, hop = id === r.move;
          el.style.opacity = 1;
          if (hop) el.classList.add('u8l3-hop');
          moves.push(tween(c, hop ? 1100 : 750, (t) => { const lift = hop ? -46 * Math.sin(Math.PI * t) : 0; el.style.transform = `translate(${dx * (1 - t)}px,${dy * (1 - t) + lift}px)`; }));
        }
        await Promise.all(moves);
        Object.values(B.toks).forEach((e) => { e.style.transform = ''; e.style.opacity = 1; });
        if (r.move) { const m = B.toks[r.move]; await pulse(c, m, 1.2); }
      } }));
    steps.push({ cap: `Ready to eliminate: ${T(tc(col, `${term(d.done[0], 'x', true)}${term(d.done[1], 'y', false)}=${d.done[2]}`))}.`,
      run: async (c) => { await show(c, fin); await stampIn(c, stamp(fin, 'Ax + By = C', { ok: true, size: 'sm' })); } });
    return steps;
  }
};

/* =============================== explainer: special cases =============================== */
const SP = {
  same: { label: 'Same line: 0 = 0', e1: E(1, 2, 4), e2: E(3, 6, 12), m: 3 },
  par: { label: 'Parallel lines: 0 = 15', e1: E(1, 2, 4), e2: E(2, 4, -7), m: 2 }
};
const special = {
  title: 'When both variables disappear',
  height: 470,
  choices: Object.keys(SP).map((k) => ({ v: k, label: SP[k].label })),
  intro: (k) => `${TAG1} ${T(k1(eqT(SP[k].e1)))} and ${TAG2} ${T(k2(eqT(SP[k].e2)))}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SP[k], { e1, e2, m } = d, W = ex.W, s1 = scaleE(e1, m), z = s1.c - e2.c, same = z === 0;
    const G = new Graph(stage, { x: 10, y: 6, width: 456, height: 456, xmin: -6, xmax: 6, ymin: -6, ymax: 6, xlabels: 2, ylabels: 2, fontSize: 16 });
    const P = panel(stage, 486, 10, W - 498, 452, '');
    lineEl(P, `${TAG1} ${T(k1(eqT(e1)))}`); lineEl(P, `${TAG2} ${T(k2(eqT(e2)))}`);
    return [
      { cap: same ? 'Graph them. The amber line lands exactly on top of the blue one.' : 'Graph them: two lines with the <b>same slope</b> and different intercepts.',
        run: async (c) => {
          await G.drawIn(lineOf(G, e1, { color: B1, width: same ? 8 : 4, opacity: same ? 0.55 : 1 }), 600, c);
          await G.drawIn(lineOf(G, e2, { color: A2, width: 4, dash: same }), 700, c);
        } },
      { cap: `Eq. 1 × ${m}: ${T(k1(eqT(s1)))}. Now the ${T('x')}-coefficients match, so subtract.`,
        run: (c) => show(c, lineEl(P, `${tag(1, 'Eq. 1 × ' + m)} ${T(k1(eqT(s1)))}`)) },
      { cap: `Subtract: ${T(`${k1(`(${lhs(s1)})`)}-${k2(`(${lhs(e2)})`)}=${k1(texNum(s1.c))}-${k2(e2.c < 0 ? `(${texNum(e2.c)})` : texNum(e2.c))}`)}. <b>Both</b> variables are gone: ${T(kr(`0=${z}`))}.`,
        run: async (c) => {
          await show(c, lineEl(P, T(`${k1(`(${lhs(s1)})`)}-${k2(`(${lhs(e2)})`)}=${k1(texNum(s1.c))}-${k2(e2.c < 0 ? `(${texNum(e2.c)})` : texNum(e2.c))}`)));
          await show(c, lineEl(P, T(kr(`0=${z}`)), 'u8l3-lnbig'));
        } },
      { cap: same ? `${T('0=0')} is <b>always true</b>: every point on the line works. <b>Infinitely many solutions</b>; the two equations are the same line.`
        : `${T('0=' + z)} is <b>never true</b>: no point works. <b>No solution</b>; the lines are parallel and never meet.`,
        run: async (c) => {
          const v = lineEl(P, same ? '<b>true</b> → infinitely many solutions' : '<b>false</b> → no solution', same ? 'u8l3-good' : 'u8l3-bad'); await show(c, v);
          await stampIn(c, stamp(P, same ? 'same line' : 'parallel', { ok: same, size: 'sm' }));
        } }
    ];
  }
};

/* =============================== explainer: choosing a method =============================== */
const CH = {
  g: { label: 'y = 2x − 1, y = −x + 5', s1: 'y=2x-1', s2: 'y=-x+5', path: ['start', 'q0', 'graph'], sol: [2, 3],
    why: 'Both are in <b>slope–intercept form</b>, quick to graph, and you want a picture. Graph by hand: exact here because the crossing has integer coordinates.' },
  s: { label: 'y = 3x − 2, 5x − 2y = 1', s1: 'y=3x-2', s2: '5x-2y=1', path: ['start', 'q0', 'q1', 'sub'], sol: [3, 7],
    why: '<i>y</i> is already <b>isolated</b>: replace <i>y</i> with 3x − 2.', lines: ['5x-2(3x-2)=1', '5x-6x+4=1', '-x=-3\\ \\Rightarrow\\ x=3', 'y=3(3)-2=7'] },
  e: { label: '4x + 3y = 10, 4x − 5y = −6', s1: '4x+3y=10', s2: '4x-5y=-6', path: ['start', 'q0', 'q1', 'elim'], sol: [1, 2],
    why: 'No variable is isolated, but the <i>x</i>-coefficients already <b>match</b> (4 and 4): subtract.', lines: ['(4x+3y)-(4x-5y)=10-(-6)', '8y=16\\ \\Rightarrow\\ y=2', '4x+3(2)=10\\ \\Rightarrow\\ x=1'] },
  ex3: { label: 'Example 3’s system', s1: '3x+2y=20', s2: '5x-y=29', path: ['start', 'q0', 'q1', 'sub'], sol: [6, 1],
    why: 'In 5x − y = 29, <i>y</i> has coefficient −1, so substitution is easy too: y = 5x − 29. (Elimination, as in Example 3, works just as well.)', lines: ['3x+2(5x-29)=20', '13x-58=20', '13x=78\\ \\Rightarrow\\ x=6', 'y=5(6)-29=1'] }
};
const choose = {
  title: 'Which method?',
  height: 480,
  choices: Object.keys(CH).map((k) => ({ v: k, label: CH[k].label })),
  intro: 'Ask the questions from the top. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CH[k], W = ex.W;
    const F = new Flowchart(stage, { x: 6, y: 4, width: 560, height: 470,
      nodes: {
        start: { x: 360, y: 34, w: 300, h: 50, html: '<b>Look at the system</b>', cls: 'bk-round' },
        q0: { x: 360, y: 134, w: 320, h: 78, html: '<b>Need a picture or an estimate?</b>(or a graphing calculator is allowed)' },
        graph: { x: 84, y: 134, w: 150, h: 60, html: '<b>Graphing</b>', color: 'teal' },
        q1: { x: 360, y: 262, w: 320, h: 86, html: '<b>Is a variable isolated?</b>or does one have coefficient 1 or −1?' },
        sub: { x: 84, y: 262, w: 150, h: 60, html: '<b>Substitution</b>', color: 'purple' },
        elim: { x: 360, y: 398, w: 320, h: 86, html: '<b>Elimination</b>coefficients match, are opposites, or scale to match', color: 'blue' }
      },
      edges: [{ from: 'start', to: 'q0' }, { from: 'q0', to: 'graph', label: 'yes' }, { from: 'q0', to: 'q1', label: 'no' }, { from: 'q1', to: 'sub', label: 'yes' }, { from: 'q1', to: 'elim', label: 'no' }] });
    const P = panel(stage, 584, 8, W - 594, 464, '');
    lineEl(P, `${T(k1(d.s1))} &nbsp; ${T(k2(d.s2))}`, 'u8l3-lnbig');
    const meth = { graph: 'Graphing', sub: 'Substitution', elim: 'Elimination' }[d.path[d.path.length - 1]];
    const steps = [
      { cap: 'Follow the questions from the top.', run: (c) => F.light(c, d.path) },
      { cap: `<b>${meth}.</b> ${d.why}`, run: (c) => show(c, lineEl(P, `<b>${meth}</b>: ${d.why}`, 'u8l3-lnsm')) }
    ];
    if (k === 'g') {
      steps.push({ cap: `Graph both lines: they cross at ${T(ks('(2,\\ 3)'))}.`,
        run: async (c) => {
          const G = new Graph(stage, { x: 600, y: 212, width: 254, height: 254, xmin: -1, xmax: 6, ymin: -1, ymax: 6, fontSize: 14 });
          await G.drawIn(G.line({ m: 2, b: -1 }, { color: B1, width: 3.5 }), 500, c); await G.drawIn(G.line({ m: -1, b: 5 }, { color: A2, width: 3.5 }), 500, c);
          await pop(c, G.point(2, 3, { color: SOL, r: 7, label: T('(2,\\ 3)'), pos: 'e', cls: 'bk-ptlab' }));
        } });
    } else {
      steps.push({ cap: `Solve: ${d.lines.map((l) => T(l)).join(', ')}.`,
        run: async (c) => { for (const l of d.lines) await show(c, lineEl(P, T(l))); } });
    }
    steps.push({ cap: `Solution ${T(ks(pairTex(...d.sol)))}. Whichever method you choose, <b>verify</b> in <b>both</b> equations.`,
      run: async (c) => { const s = lineEl(P, `Solution ${solPill(...d.sol)} <span class="u8l3-muted">verify in both</span>`, 'u8l3-lnsol'); await pop(c, s); } });
    return steps;
  }
};

mountWarm();
export const explainers = mountExplainers({ pets, balance, signs, pencil, scale, lcm, walk, walk6, prep, special, choose });
