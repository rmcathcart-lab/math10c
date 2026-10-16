/* Math 10C · Unit 4 · Lesson 1A — Common Factors: the GCF of Monomials and Polynomials.
 * The explainers, the "Tile the Floor" warm-up and the static figures on this page. */
import { h, Explainer, primeFactors } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const box = (el, w, hh) => { el.style.width = w + 'px'; el.style.height = hh + 'px'; return el; };

/* KaTeX allowing \htmlClass (pieces of an expression that light up or fly one at a time) */
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};
const T = (s) => tex(s); // inline math in captions

const TEAL = '#13807a', AMB = '#c27a0e', PUR = '#7b4fc4', BLU = '#2f6fd0', RED = '#c93a33', OK = '#12805a';
const PCOL = [TEAL, AMB, PUR, BLU];
const tc = (col, s) => `\\textcolor{${col}}{${s}}`;

/* ============ terms with fraction coefficients: { n, d, v: { a: 2, b: 1 } } (d > 0, variables in written order) ============ */
const gcdI = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
function norm(t) {
  const g = gcdI(t.n, t.d) || 1, v = {};
  Object.keys(t.v).forEach((k) => { if (t.v[k]) v[k] = t.v[k]; });
  return { n: t.n / g, d: t.d / g, v };
}
function parseTerm(s) {
  const m = String(s).replace(/\s+/g, '').match(/^([+-]?)(\d+(?:\/\d+)?)?((?:(?:pi|[a-z])(?:\^\d+)?)*)$/);
  if (!m) throw new Error('bad term ' + s);
  let n = 1, d = 1;
  if (m[2]) { const [p, q] = m[2].split('/'); n = +p; d = q ? +q : 1; }
  if (m[1] === '-') n = -n;
  const v = {};
  (m[3].match(/(?:pi|[a-z])(?:\^\d+)?/g) || []).forEach((p) => { const k = p.startsWith('pi') ? 'pi' : p[0], e = p.includes('^') ? +p.split('^')[1] : 1; v[k] = (v[k] || 0) + e; });
  return norm({ n, d, v });
}
const parsePoly = (s) => String(s).replace(/\s+/g, '').match(/[+-]?[^+-]+/g).map(parseTerm);
const varT = (v) => Object.keys(v).map((k) => (k === 'pi' ? '\\pi ' : k) + (v[k] > 1 ? `^{${v[k]}}` : '')).join('').trim();
function bodyT(t, big) { // the term without its sign; big: \dfrac instead of \tfrac
  const vs = varT(t.v), an = Math.abs(t.n);
  const cf = t.d > 1 ? `${big ? '\\dfrac' : '\\tfrac'}{${an}}{${t.d}}` : an === 1 && vs ? '' : String(an);
  return cf + vs;
}
const termT = (t, first, big) => (t.n < 0 ? '-' : first ? '' : '+') + bodyT(t, big);
const polyT = (list, big) => list.map((t, i) => termT(t, i === 0, big)).join('');
const fT = (t, big) => (t.n < 0 ? `(${termT(t, true, big)})` : termT(t, true, big)); // a factor written for multiplying: (−3), 2x
function mulT(a, b) { const v = { ...a.v }; for (const k in b.v) v[k] = (v[k] || 0) + b.v[k]; return norm({ n: a.n * b.n, d: a.d * b.d, v }); }
function divT(a, g) {
  let n = a.n * g.d, d = a.d * g.n; if (d < 0) { n = -n; d = -d; }
  const v = { ...a.v }; for (const k in g.v) v[k] = (v[k] || 0) - g.v[k];
  return norm({ n, d, v });
}
const keyT = (t) => Object.keys(t.v).sort().map((k) => k + t.v[k]).join('');
const degT = (t) => Object.values(t.v).reduce((s, e) => s + e, 0);
function collect(list) { // combine like terms; highest degree first, ties in order of appearance
  const m = new Map();
  list.forEach((t) => { const k = keyT(t); if (m.has(k)) { const o = m.get(k); o.n = o.n * t.d + t.n * o.d; o.d *= t.d; } else m.set(k, { n: t.n, d: t.d, v: { ...t.v } }); });
  return [...m.values()].map((t, i) => ({ t: norm(t), i })).filter((o) => o.t.n !== 0).sort((a, b) => degT(b.t) - degT(a.t) || a.i - b.i).map((o) => o.t);
}
/* GCF of whole-number monomials. mode 'set': negative only if every monomial is negative (Section 2);
 * mode 'poly': negative when the leading coefficient is negative (Section 3). Variables keep the first term's order. */
function gcfOf(list, mode = 'poly') {
  const g = list.reduce((a, t) => gcdI(a, t.n), 0) || 1;
  const v = {};
  Object.keys(list[0].v).forEach((k) => { const e = Math.min(...list.map((t) => t.v[k] || 0)); if (e) v[k] = e; });
  const neg = mode === 'set' ? list.every((t) => t.n < 0) : list[0].n < 0;
  return { n: neg ? -g : g, d: 1, v };
}
const isOne = (t) => t.n === 1 && t.d === 1 && !Object.keys(t.v).length;

/* ============ drawing helpers ============ */
function stagePos(stage, el) { // an element's box in stage coordinates (the lesson may be scaled to fit the screen)
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2 - sr.left) / k, y: (r.top + r.height / 2 - sr.top) / k, l: (r.left - sr.left) / k, t: (r.top - sr.top) / k, r: (r.right - sr.left) / k, b: (r.bottom - sr.top) / k };
}
function arcLayer(stage) { const s = svgEl('svg', { class: 'u4l1a-arcs' }); stage.appendChild(s); return s; }
/* an arrow that draws itself from (x1,y1) to (x2,y2), bulging up (lift > 0) or down (lift < 0) */
function arrow(svg, x1, y1, x2, y2, lift, col) {
  const cx = (x1 + x2) / 2, cy = (lift > 0 ? Math.min(y1, y2) : Math.max(y1, y2)) - lift;
  const p = svgEl('path', { d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, fill: 'none', stroke: col, 'stroke-width': 3.4, 'stroke-linecap': 'round' });
  const ang = Math.atan2(y2 - cy, x2 - cx), L = 13, wd = 0.46;
  const pts = [[x2, y2], [x2 - L * Math.cos(ang - wd), y2 - L * Math.sin(ang - wd)], [x2 - L * Math.cos(ang + wd), y2 - L * Math.sin(ang + wd)]];
  const hd = svgEl('polygon', { points: pts.map((q) => q.join(',')).join(' '), fill: col });
  svg.append(p, hd);
  const len = p.getTotalLength() || 1;
  p.style.strokeDasharray = len; p.style.strokeDashoffset = len; hd.style.opacity = 0;
  return {
    async draw(c, ms = 480) { await c.anim(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], ms); await c.anim(hd, [{ opacity: 0 }, { opacity: 1 }], 140); },
    dim(c) { return Promise.all([p, hd].map((e) => c.anim(e, [{ opacity: e.style.opacity || 1 }, { opacity: 0.22 }], 250))); }
  };
}
const pulse = (c, el, s = 1.12) => c.anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], 460);
const showSpans = (c, els, ms = 320, delay = 0) => Promise.all(els.map((e) => c.anim(e, [{ opacity: 0 }, { opacity: 1 }], ms, { delay })));
const spans = (root, cls) => [...root.querySelectorAll('.' + cls)];
function stampIn(c, el) { return c.anim(el, [{ opacity: 0, transform: 'scale(1.9) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); }
function fit(el, maxW) { const w = el.offsetWidth; if (w > maxW) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * maxW / w).toFixed(1) + 'px'; return el; }
/* fly a copy of `html` from one stage point to another, then remove it */
async function fly(c, stage, html, from, to, cls, ms = 650) {
  const e = add(stage, h('div', 'u4l1a-fly c ' + (cls || ''), html), from.x, from.y);
  if (c.fast) { e.remove(); return; }
  try { await c.anim(e, [{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(1.04)` }], ms); }
  finally { e.remove(); }
}
const listAnd = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);

/* ============ 1. Expanding and factoring: one rectangle, two directions ============ */
const TW = {
  m: { prod: '3x(x+4)', top: ['x', '4'], side: ['3x'], tag: 'Common factor · Lesson 1A', note: `Every piece contains ${T('3x')}: a <b>common factor</b>. Pulling it out is today’s tool.` },
  t1: { prod: '(x+2)(x+6)', top: ['x', '2'], side: ['x', '6'], tag: '\\(x^2+bx+c\\) · Lesson 2', note: 'Nothing is common to all three terms. Lesson 2 finds sides like these with a <b>sum and product</b> search.' },
  t2: { prod: '(3x+2)(x+5)', top: ['3x', '2'], side: ['x', '5'], tag: '\\(ax^2+bx+c\\) · Lesson 4', note: `The ${T('3')} in front of ${T('x^2')} makes it harder. Lesson 4 handles it by <b>decomposition</b>.` },
  d: { prod: '(x-7)(x+7)', top: ['x', '-7'], side: ['x', '7'], tag: 'Difference of squares · Lesson 3', note: `The middle pieces cancel, leaving one square minus another: Lesson 3, the <b>difference of squares</b>.` }
};
const twoWay = {
  title: 'Expanding and factoring: one rectangle, two directions',
  height: 420,
  choices: [{ v: 'm', label: tex('3x(x+4)') }, { v: 't1', label: tex('(x+2)(x+6)') }, { v: 't2', label: tex('(3x+2)(x+5)') }, { v: 'd', label: tex('(x-7)(x+7)') }],
  intro: (k) => `${T(TW[k].prod)} is a <b>product</b>: the area of a rectangle whose sides are the factors. Watch it expand, then run backwards.`,
  make(stage, key, ex) {
    const W = ex.W, d = TW[key], A = d.top.map(parseTerm), B = d.side.map(parseTerm);
    const cells = B.map((b) => A.map((a) => mulT(b, a))), flat = cells.flat(), res = collect(flat), resT = polyT(res);
    const likeKeys = new Set(flat.map(keyT).filter((k, i, arr) => arr.indexOf(k) !== i));
    // the two forms and the arrows between them
    const bw = 300, bh = 92;
    const form = (x, lab) => { const e = add(stage, box(h('div', 'u4l1a-form'), bw, bh), x, 18); e.innerHTML = `<div class="u4l1a-fh">${lab}</div><div class="u4l1a-fx"></div>`; return e; };
    const L = form(22, 'factored form · a product'), R = form(W - bw - 22, 'expanded form · a sum of terms');
    const Lx = L.lastChild, Rx = R.lastChild;
    Lx.innerHTML = K(d.prod); hide(L, R); Rx.innerHTML = K(resT);
    const svg = arcLayer(stage), ax0 = 22 + bw + 18, ax1 = W - bw - 22 - 18;
    const straight = (x1, x2, y, col) => {
      const p = svgEl('path', { d: `M${x1} ${y}L${x2} ${y}`, stroke: col, 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' });
      const s = Math.sign(x2 - x1), hd = svgEl('polygon', { points: `${x2},${y} ${x2 - s * 15},${y - 9} ${x2 - s * 15},${y + 9}`, fill: col });
      svg.append(p, hd); const len = Math.abs(x2 - x1); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; hd.style.opacity = 0;
      return { draw: async (c) => { await c.anim(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], 520); await c.anim(hd, [{ opacity: 0 }, { opacity: 1 }], 140); } };
    };
    const up = straight(ax0, ax1, 50, TEAL), dn = straight(ax1, ax0, 86, AMB);
    const upL = add(stage, h('div', 'u4l1a-arl c', 'expand'), (ax0 + ax1) / 2, 30), dnL = add(stage, h('div', 'u4l1a-arl c amb', 'factor'), (ax0 + ax1) / 2, 108);
    upL.style.color = TEAL; dnL.style.color = AMB; hide(upL, dnL);
    // the area model grid
    const hw = 78, cw = 136, hh0 = 50, ch = 76, GW = hw + cw * A.length, gx = Math.round((W - GW) / 2), gy = 170;
    const gt = add(stage, h('div', 'u4l1a-gt c', 'area model'), gx + GW / 2, gy - 18); hide(gt);
    const g = (x, y, w, hh, cls, html) => { const e = add(stage, box(h('div', 'u4l1a-gg ' + cls, html), w, hh), x, y); hide(e); return e; };
    const corner = g(gx, gy, hw, hh0, 'hd x', K('\\times'));
    const heads = A.map((t, k) => g(gx + hw + k * cw, gy, cw, hh0, 'hd', `<span>${K(termT(t, true))}</span>`));
    const sides = B.map((t, r) => g(gx, gy + hh0 + r * ch, hw, ch, 'hd', `<span>${K(termT(t, true))}</span>`));
    const gc = cells.map((row, r) => row.map((p, k) => { const e = g(gx + hw + k * cw, gy + hh0 + r * ch, cw, ch, 'in' + (p.n < 0 ? ' neg' : ''), `<span>${K(termT(p, true))}</span>`); e.style.setProperty('--pc', PCOL[(r * A.length + k) % 4]); e.firstChild.style.opacity = 0; return e; }));
    const hdrs = [...heads, ...sides], hdrHTML = hdrs.map((e) => e.innerHTML);
    const tag = add(stage, h('div', 'u4l1a-tbtag', `<span>factoring tool</span>${d.tag.replace(/\\\((.*?)\\\)/g, (m, s) => K(s)).replace(' · ', '<br>')}`), gx + GW + 30, gy + hh0 + 6); tag.style.maxWidth = (W - gx - GW - 46) + 'px'; hide(tag);
    const like = flat.length > 2 && likeKeys.size;
    const cellsOf = (pred) => gc.flat().filter((e, i) => pred(flat[i]));
    const steps = [{
      cap: `Start with the product ${T(d.prod)}. As an <b>area model</b>, ${B.length === 1 ? `it’s a rectangle ${T(termT(B[0], true))} tall and ${T(polyT(A))} wide` : `its sides are ${T(polyT(A))} and ${T(polyT(B))}`}.`,
      run: (c) => Promise.all([c.fadeIn(L, 400), c.fadeIn(gt, 300, { delay: 150 }), c.fadeIn(corner, 300, { delay: 150 }), ...hdrs.map((e, i) => c.pop(e, 360, { delay: 200 + i * 90 })), ...gc.flat().map((e) => c.fadeIn(e, 300, { delay: 300 }))])
    }, {
      cap: `<b>Expand:</b> multiply every term on the side by every term on top. Each piece of the rectangle is one product: ${listAnd(flat.map((p, i) => T(`${fT(B[Math.floor(i / A.length)])}\\cdot ${fT(A[i % A.length])}=${termT(p, true)}`)))}.`,
      run: (c) => Promise.all(gc.flat().map((e, i) => Promise.all([c.anim(e.firstChild, [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], 380, { delay: i * 220 }), c.sleep(i * 220).then(() => e.classList.add('on'))])))
    }, {
      cap: (like ? (key === 'd' ? `Collect like terms: ${T('7x-7x=0')}, the middle pieces <b>cancel</b>. ` : `Collect like terms: ${T(polyT(flat.filter((t) => likeKeys.has(keyT(t)))) + '=' + termT(res.find((t) => likeKeys.has(keyT(t))), true))}. `) : '') + `So ${T(`${d.prod}=${resT}`)}. Expanding turned a <b>product</b> into a <b>sum of terms</b>.`,
      run: async (c) => {
        if (like) { cellsOf((t) => likeKeys.has(keyT(t))).forEach((e) => e.classList.add('like')); await c.sleep(350); }
        await Promise.all([up.draw(c), c.fadeIn(upL, 300), c.fadeIn(R, 450, { delay: 350 })]);
      }
    }, {
      cap: `<b>Factoring runs it backwards.</b> Suppose you’re only given ${T(resT)}. The pieces are known, but the <b>sides are hidden</b>. What were they?`,
      run: async (c) => {
        Lx.innerHTML = '<span class="u4l1a-q">?</span>'; L.classList.add('blank');
        hdrs.forEach((e) => { e.innerHTML = '<span class="u4l1a-q">?</span>'; });
        await Promise.all([pulse(c, R, 1.05), ...hdrs.map((e) => c.pop(e, 320))]);
      }
    }, {
      cap: `Find the sides and you’ve factored: ${T(`${resT}=${d.prod}`)}. ${d.note} And any factoring can be <b>checked by expanding</b> it again.`,
      run: async (c) => {
        hdrs.forEach((e, i) => { e.innerHTML = hdrHTML[i]; e.classList.add('found'); });
        Lx.innerHTML = K(d.prod); L.classList.remove('blank'); L.classList.add('found');
        await Promise.all([dn.draw(c), c.fadeIn(dnL, 300), ...hdrs.map((e, i) => c.pop(e, 360, { delay: i * 90 })), c.pop(Lx, 420, { delay: 250 }), c.pop(tag, 420, { delay: 450 })]);
      }
    }];
    return steps;
  }
};

/* ============ 2. Line up the prime factors (why the GCF works) ============ */
const CO = { n1: ['60', '84'], n2: ['240', '180'], m1: ['12a^4', '18a^2b'], a: ['18x^3y', '24xy^3'], iv: ['-30a^3b', '-18a^2b^2', '-24a^2b'] };
function factorList(t) { // [{k:'-1'} , primes..., letters...]
  const out = []; if (t.n < 0) out.push('-1');
  if (Math.abs(t.n) > 1) primeFactors(Math.abs(t.n)).forEach((p) => out.push(String(p)));
  Object.keys(t.v).sort().forEach((k) => { for (let i = 0; i < t.v[k]; i++) out.push(k); });
  return out;
}
const chipT = (k) => (k === '-1' ? '-1' : /\d/.test(k) ? k : k); // letters are typeset in italics by KaTeX
const columns = {
  title: 'Line up the prime factors',
  height: 372,
  choices: [{ v: 'n1', label: '60 and 84' }, { v: 'n2', label: '240 and 180' }, { v: 'm1', label: tex('12a^4,\\ 18a^2b') }, { sep: 'Example 1 check:' }, { v: 'a', label: '(a)' }, { v: 'iv', label: '(b)(iv)' }],
  intro: (k) => `Find the GCF of ${listAnd(CO[k].map((s) => T(termT(parseTerm(s), true))))} by taking each one apart into <b>prime factors</b>.`,
  make(stage, key, ex) {
    const W = ex.W, terms = CO[key].map(parseTerm), lists = terms.map(factorList), nr = terms.length;
    // columns: −1, then primes (ascending), then letters (a–z), each as many times as the most any row needs
    const keys = [...new Set(lists.flat())].sort((p, q) => {
      const r = (s) => (s === '-1' ? 0 : /\d/.test(s) ? 1 : 2); return r(p) - r(q) || (r(p) === 1 ? +p - +q : p < q ? -1 : 1);
    });
    const cols = []; keys.forEach((k) => { const mx = Math.max(...lists.map((l) => l.filter((x) => x === k).length)); for (let j = 0; j < mx; j++) cols.push({ k, j }); });
    const x0 = 200, cw = Math.min(62, (W - x0 - 18) / cols.length), cs = Math.min(50, cw - 6), cx = (i) => x0 + cw * (i + 0.5);
    const rowY = (i) => 40 + i * 66, sepY = rowY(nr) - 22, gY = sepY + 48;
    const full = cols.map((col) => lists.every((l) => l.filter((x) => x === col.k).length > col.j));
    const bands = cols.map((col, i) => { if (!full[i]) return null; const b = add(stage, box(h('div', 'u4l1a-band'), cw - 2, gY + 30 - (rowY(0) - 30)), cx(i) - (cw - 2) / 2, rowY(0) - 30); hide(b); return b; });
    const labs = terms.map((t, i) => { const e = add(stage, h('div', 'u4l1a-clab', K(termT(t, true)) + `<span>${K('=')}</span>`), 22, rowY(i)); e.style.translate = '0 -50%'; e.style.width = (x0 - 30) + 'px'; return e; });
    const chip = (k, x, y, cls = '') => { const e = add(stage, box(h('div', 'u4l1a-fc c ' + cls + (k === '-1' ? ' sg' : /\d/.test(k) ? ' num' : ' var'), /\d/.test(k) && k !== '-1' ? k : K(chipT(k))), cs, cs), x, y); return e; };
    const placed = lists.map((l, r) => { const seen = {}; return l.map((k, j) => { const occ = seen[k] = (seen[k] || 0) + 1; const ci = cols.findIndex((c2) => c2.k === k && c2.j === occ - 1); const e = chip(k, cx(j), rowY(r)); hide(e); return { e, ci, j }; }); });
    const slots = []; lists.forEach((l, r) => cols.forEach((col, i) => { if (l.filter((x) => x === col.k).length <= col.j) { const s = add(stage, box(h('div', 'u4l1a-slot c'), cs, cs), cx(i), rowY(r)); hide(s); slots.push(s); } }));
    const sep = add(stage, box(h('div', 'u4l1a-sep'), W - 44, 0), 22, sepY); hide(sep);
    const gLab = add(stage, h('div', 'u4l1a-clab g', 'GCF'), 22, gY); gLab.style.translate = '0 -50%'; hide(gLab);
    const commonIdx = cols.map((c2, i) => i).filter((i) => full[i]);
    const gcf = gcfOf(terms, 'set'), gcfT = termT(gcf, true);
    const prodT = commonIdx.map((i) => (cols[i].k === '-1' ? '(-1)' : cols[i].k)).join('\\times ');
    const resEl = add(stage, h('div', 'u4l1a-cres', K(`\\text{GCF}=${prodT || '1'}=\\boldsymbol{${gcfT}}`)), 22, gY + 52); hide(resEl);
    const gChips = commonIdx.map((i) => { const e = chip(cols[i].k, cx(i), gY, 'common'); hide(e); return e; });
    const negAll = terms.every((t) => t.n < 0), negSome = terms.some((t) => t.n < 0);
    const written = terms.map((t, i) => T(`${termT(t, true)}=${lists[i].map((k) => (k === '-1' ? '(-1)' : k)).join('\\times ')}`));
    const steps = [{
      cap: nr === 2 && cols.length <= 12 ? `Write each as a product of <b>prime factors</b>: ${written.join(' and ')}.` : `Write each as a product of <b>prime factors</b>.${negSome ? ` A negative monomial also has a factor of ${T('-1')}.` : ''} Letters count as factors too: ${T('a^3=a\\times a\\times a')}.`,
      run: (c) => Promise.all(placed.flatMap((row, r) => row.map(({ e }, j) => c.pop(e, 320, { delay: r * 200 + j * 45 }))))
    }, {
      cap: `<b>Line them up:</b> matching factors go in the <b>same column</b>. An empty slot means that ${terms.some((t) => Object.keys(t.v).length) ? 'monomial' : 'number'} doesn’t have that factor.`,
      run: (c) => Promise.all([...placed.flatMap((row) => row.map(({ e, ci, j }) => c.anim(e, [{ transform: 'translateX(0)' }, { transform: `translateX(${cx(ci) - cx(j)}px)` }], 650, { delay: 40 }))), ...slots.map((s) => c.fadeIn(s, 300, { delay: 600 }))])
    }, {
      cap: `A column with a factor in <b>every</b> row is a <b>common factor</b>: ${listAnd(commonIdx.map((i) => T(cols[i].k)))}.` + (negAll ? ` Every monomial is negative, so ${T('-1')} is common too.` : negSome ? ` Not every monomial is negative, so ${T('-1')} is <b>not</b> common.` : ''),
      run: async (c) => {
        await Promise.all(bands.filter(Boolean).map((b, i) => c.fadeIn(b, 350, { delay: i * 60 })));
        placed.flat().forEach(({ e, ci }) => { if (full[ci]) e.classList.add('common'); });
        await Promise.all(placed.flat().filter(({ ci }) => !full[ci]).map(({ e }) => c.anim(e, [{ opacity: 1 }, { opacity: 0.32 }], 350)));
      }
    }, {
      cap: `Multiply the common factors: GCF ${T(`=${prodT}=${gcfT}`)}.` + (key === 'n2' ? ' That’s the <b>60 cm tile</b> from the warm-up!' : key === 'n1' ? ' Same routine for monomials: just more columns.' : ''),
      run: async (c) => {
        await Promise.all([c.fadeIn(sep, 300), c.fadeIn(gLab, 300)]);
        await Promise.all(commonIdx.map((i, q) => c.anim(gChips[q], [{ opacity: 0, transform: `translateY(${rowY(nr - 1) - gY}px)` }, { opacity: 1, transform: 'none' }], 600, { delay: q * 90 })));
        await c.fadeIn(resEl, 400);
      }
    }];
    void labs;
    return steps;
  }
};

/* ============ 2. The shortcut: lowest power of each variable ============ */
const LO = { d1: ['14p^2q^3', '21pq^4'], d2: ['12a^4', '18a^2b'], i: ['16ab', '20a^2b^3'], ii: ['27x^4y^2', '-36x^3y^5'], iii: ['a^2bc^3', '3abc'], iv: ['-30a^3b', '-18a^2b^2', '-24a^2b'] };
const lowest = {
  title: 'The shortcut: GCF of the numbers, lowest power of each letter',
  height: 400,
  choices: [{ v: 'd1', label: tex('14p^2q^3,\\ 21pq^4') }, { v: 'd2', label: tex('12a^4,\\ 18a^2b') }, { sep: 'Example 1 check:' }, { v: 'i', label: '(b)(i)' }, { v: 'ii', label: '(ii)' }, { v: 'iii', label: '(iii)' }, { v: 'iv', label: '(iv)' }],
  intro: (k) => `State the GCF of ${listAnd(LO[k].map((s) => T(s)))} by inspection, one piece at a time.`,
  make(stage, key, ex) {
    const W = ex.W, terms = LO[key].map(parseTerm), nr = terms.length;
    const vars = [...new Set(terms.flatMap((t) => Object.keys(t.v)))].sort();
    const negSome = terms.some((t) => t.n < 0), negAll = terms.every((t) => t.n < 0);
    const cw = 40, lw = 190;
    let x = lw;
    const blocks = [];
    if (negSome) { blocks.push({ kind: 'sign', x, w: 70 }); x += 82; }
    blocks.push({ kind: 'num', x, w: 104 }); x += 116;
    vars.forEach((k) => { const mx = Math.max(...terms.map((t) => t.v[k] || 0)); const w = Math.max(mx * cw, 64) + 22; blocks.push({ kind: 'var', k, x, w, mx }); x += w + 12; });
    const off = Math.max(0, (W - x - 20) / 2); blocks.forEach((b) => (b.x += off));
    const rowY = (i) => 86 + i * 56, lineY = rowY(nr) - 22, resY = lineY + 38;
    const head = (b, html) => { const e = add(stage, h('div', 'u4l1a-lh c', html), b.x + b.w / 2, 34); return e; };
    blocks.forEach((b) => { b.bg = add(stage, box(h('div', 'u4l1a-blk'), b.w, resY + 28 - 54), b.x, 54); head(b, b.kind === 'sign' ? 'sign' : b.kind === 'num' ? 'number' : K(b.k)); });
    terms.forEach((t, i) => { const e = add(stage, h('div', 'u4l1a-llab', K(termT(t, true))), 22 + off, rowY(i)); e.style.translate = '0 -50%'; });
    const cells = terms.map((t, i) => blocks.map((b) => {
      const y = rowY(i);
      if (b.kind === 'sign') return [add(stage, h('div', 'u4l1a-lv c' + (t.n < 0 ? ' red' : ''), t.n < 0 ? '−' : '+'), b.x + b.w / 2, y)];
      if (b.kind === 'num') return [add(stage, h('div', 'u4l1a-lv c', String(Math.abs(t.n))), b.x + b.w / 2, y)];
      const e = t.v[b.k] || 0;
      if (!e) return [add(stage, h('div', 'u4l1a-lnone c', 'none'), b.x + 11 + Math.max(64, b.mx * cw) / 2 + 4, y)];
      return Array.from({ length: e }, (_, j) => add(stage, box(h('div', 'u4l1a-lc c', K(b.k)), cw - 6, cw - 6), b.x + 11 + cw * (j + 0.5), y));
    }));
    cells.flat(2).forEach((e) => hide(e));
    const line = add(stage, box(h('div', 'u4l1a-sep'), x - lw + 4, 0), lw - 2 + off, lineY); hide(line);
    const gl = add(stage, h('div', 'u4l1a-llab g', 'GCF'), 22 + off, resY); gl.style.translate = '0 -50%'; hide(gl);
    const gcf = gcfOf(terms, 'set'), gcfT = termT(gcf, true), g = Math.abs(gcf.n);
    const res = blocks.map((b) => {
      let html;
      if (b.kind === 'sign') html = negAll ? '−' : '+';
      else if (b.kind === 'num') html = String(g);
      else { const m = Math.min(...terms.map((t) => t.v[b.k] || 0)); b.min = m; html = m ? K(m > 1 ? `${b.k}^{${m}}` : b.k) : '—'; }
      const e = add(stage, h('div', 'u4l1a-lres c' + ((b.kind === 'var' && !b.min) || (b.kind === 'num' && g === 1) ? ' none' : '') + (b.kind === 'sign' && negAll ? ' red' : ''), html), b.x + b.w / 2, resY); hide(e); return e;
    });
    const fin = add(stage, h('div', 'u4l1a-cres', K(`\\text{GCF}=\\boldsymbol{${gcfT}}`)), 22 + off, resY + 50); hide(fin);
    const bi = (kind) => blocks.findIndex((b) => b.kind === kind);
    const steps = [{
      cap: `One monomial per row. Sort each into its <b>number</b>${negSome ? ', its <b>sign</b>' : ''} and its <b>letters</b>, written out as repeated factors so the powers are easy to compare.`,
      run: (c) => Promise.all([c.fadeIn(line, 300), c.fadeIn(gl, 300), ...cells.flatMap((row, i) => row.flat().map((e, j) => c.pop(e, 300, { delay: i * 160 + j * 30 })))])
    }];
    const nums = terms.map((t) => Math.abs(t.n));
    steps.push({
      cap: `<b>The numbers:</b> GCF(${nums.join(', ')}) = ${g}.` + (g === 1 ? ' A GCF of 1 isn’t written in front.' : '') + (negSome ? ' (Signs come later.)' : ''),
      run: (c) => { blocks[bi('num')].bg.classList.add('on'); return c.pop(res[bi('num')], 380); }
    });
    blocks.forEach((b, bIdx) => {
      if (b.kind !== 'var') return;
      const es = terms.map((t) => t.v[b.k] || 0), m = Math.min(...es);
      const missing = terms.filter((t) => !t.v[b.k]);
      steps.push({
        cap: m ? `${T(b.k)}: the powers are ${listAnd(es.map((e) => T(e > 1 ? `${b.k}^{${e}}` : b.k)))}. Every term has at least ${T(m > 1 ? `${b.k}^{${m}}` : b.k)}: take the <b>lowest</b> power.`
          : `${T(b.k)} is <b>missing</b> from ${listAnd(missing.map((t) => T(termT(t, true))))}, so it isn’t common to every term. Leave ${T(b.k)} out of the GCF.`,
        run: async (c) => {
          b.bg.classList.add('on');
          const cut = add(stage, box(h('div', 'u4l1a-cut'), 0, rowY(nr - 1) + 26 - (rowY(0) - 26)), b.x + 11 + cw * m - (m ? 1 : 6), rowY(0) - 26);
          await c.anim(cut, [{ opacity: 0, transform: 'scaleY(0)' }, { opacity: 1, transform: 'scaleY(1)' }], 400);
          const ex = []; cells.forEach((row) => row[bIdx].forEach((e, j) => { if (j >= m && e.classList.contains('u4l1a-lc')) ex.push(e); }));
          await Promise.all([...ex.map((e) => c.anim(e, [{ opacity: 1 }, { opacity: 0.25 }], 350)), c.pop(res[bIdx], 380, { delay: 150 })]);
        }
      });
    });
    if (negSome) steps.push({
      cap: negAll ? `<b>Signs:</b> every monomial is negative, so the GCF is taken <b>negative</b>.` : `<b>Signs:</b> they’re mixed (not all negative), so the GCF stays <b>positive</b>.`,
      run: (c) => { blocks[bi('sign')].bg.classList.add('on'); return c.pop(res[bi('sign')], 380); }
    });
    steps.push({
      cap: `Put the pieces together: GCF ${T('=' + gcfT)}.`,
      run: (c) => Promise.all([c.fadeIn(fin, 400), ...res.map((e) => pulse(c, e, 1.15))])
    });
    return steps;
  }
};

/* ============ 3. Tiles into a rectangle: the tallest side is the GCF ============ */
const TR = { a: { a: 3, b: 12, q: true }, b: { a: 2, b: 6, q: true }, c: { a: 6, b: 9, q: true }, d: { a: 4, b: 8, q: false } };
const trPoly = (d) => (d.q ? `${d.a}x^2+${d.b}x` : `${d.a}x+${d.b}`);
const tileRect = {
  title: 'Factoring with tiles: arrange them into a rectangle',
  height: 450,
  choices: ['a', 'b', 'c', 'd'].map((k) => ({ v: k, label: tex(trPoly(TR[k])) })),
  intro: (k) => { const d = TR[k]; return `Here are the tiles for ${T(trPoly(d))}: ${d.a} ${T(d.q ? 'x^2' : 'x')}-tiles and ${d.b} ${d.q ? T('x') + '-tiles' : 'unit tiles'}. <b>Factoring</b> means arranging them into one <b>rectangle</b>: its side lengths are the factors.`; },
  make(stage, key, ex) {
    const W = ex.W, d = TR[key], X = d.q ? 64 : 100, U = d.q ? 17 : 26, G = 3;
    const bw = X, bh = d.q ? X : U, sw = U, sh = d.q ? X : U, rowH = d.q ? X : U;
    const bigK = d.q ? 'k2' : 'k1', smK = d.q ? 'k1' : 'k0';
    const pw = 236, ax = 24, aw = W - pw - 60, ay = 70, ah = 290;
    const panel = add(stage, h('div', 'u4l1a-rt', '<div class="u4l1a-rth">Rows tried</div>'), W - pw - 18, 16);
    box(panel, pw, 404 - 16); const list = h('div', 'u4l1a-rtl'); panel.appendChild(list); const sum = h('div', 'u4l1a-rts'); panel.appendChild(sum);
    const tiles = [];
    const mk = (big, i) => {
      const t = h('div', `u4l1a-tile ${big ? bigK : smK} pos`); box(t, big ? bw : sw, big ? bh : sh); t.big = big;
      const n = big ? d.a : d.b, rowW = n * ((big ? bw : sw) + (big ? 26 : 22));
      const x = ax + (aw - rowW) / 2 + i * ((big ? bw : sw) + (big ? 26 : 22)) + ((i * 7) % 5) - 2;
      const y = (big ? ay + 6 : ay + bh + 50) + ((i * 13) % 9) - 4, r = Math.round(Math.abs((Math.sin((i + (big ? 0 : 50)) * 12.9898) * 43758.5453) % 1) * 22 - 11);
      t._t = `translate(${x}px, ${y}px) rotate(${r}deg)`; t.style.transform = t._t; stage.appendChild(t); tiles.push(t);
    };
    for (let i = 0; i < d.a; i++) mk(true, i);
    for (let i = 0; i < d.b; i++) mk(false, i);
    const sideL = add(stage, h('div', 'u4l1a-tl'), 0, 0), topL = add(stage, h('div', 'u4l1a-tl c'), 0, 0), leftL = add(stage, h('div', 'u4l1a-tl red c'), 0, 0);
    const outline = add(stage, h('div', 'u4l1a-trect'), 0, 0);
    hide(sideL, topL, leftL, outline);
    const sideT = (r) => (r === 1 ? (d.q ? 'x' : '1') : d.q ? `${r}x` : String(r));
    const widT = (r) => polyT([{ n: d.a / r, d: 1, v: { x: 1 } }, { n: d.b / r, d: 1, v: {} }].map(norm));
    async function arrange(c, r) {
      const nb = Math.floor(d.a / r), ns = Math.floor(d.b / r), lb = d.a - nb * r, ls = d.b - ns * r;
      const rw = nb * (bw + G) + ns * (sw + G) - G, rh = r * (rowH + G) - G, extra = lb || ls ? 30 + Math.max(lb ? bw : 0, ls ? (Math.ceil(ls / Math.max(1, Math.floor(rh / (sh + G)))) * (sw + G)) : 0) : 0;
      const x0 = ax + (aw - rw - extra) / 2 + 30, y0 = ay + (ah - rh) / 2 + 16;
      let bi = 0, si = 0, lbi = 0, lsi = 0;
      const jobs = tiles.map((t, i) => {
        let x, y, left = false;
        if (t.big) { if (bi < nb * r) { const row = Math.floor(bi / nb), k = bi % nb; x = x0 + k * (bw + G); y = y0 + row * (rowH + G); } else { left = true; x = x0 + rw + 30; y = y0 + lbi * (bh + G); lbi++; } bi++; }
        else { if (si < ns * r) { const row = Math.floor(si / ns), k = si % ns; x = x0 + nb * (bw + G) + k * (sw + G); y = y0 + row * (rowH + G); } else { left = true; const per = Math.max(1, Math.floor((rh + G) / (sh + G))); x = x0 + rw + 30 + (lb ? bw + 12 : 0) + Math.floor(lsi / per) * (sw + G); y = y0 + (lsi % per) * (sh + G); lsi++; } si++; }
        const to = `translate(${x}px, ${y}px) rotate(0deg)`, from = t._t; t._t = to;
        t.classList.toggle('left', left);
        return c.anim(t, [{ transform: from }, { transform: to }], 620, { delay: Math.min(i * 14, 280) });
      });
      const ok = !lb && !ls;
      outline.classList.remove('final');
      at(box(outline, rw + 12, rh + 12), x0 - 6, y0 - 6);
      if (ok) {
        sideL.innerHTML = K(sideT(r)); at(sideL, x0 - 16, y0 + rh / 2); sideL.style.translate = '-100% -50%';
        topL.innerHTML = K(widT(r)); at(topL, x0 + rw / 2, y0 - 30);
      } else {
        const msg = []; if (lb) msg.push(`${lb} left`); if (ls) msg.push(`${ls} left`);
        leftL.innerHTML = 'left over'; at(leftL, x0 + rw + 30 + (extra - 30) / 2, y0 + rh + 22);
      }
      sideL.classList.remove('ok'); topL.classList.remove('ok');
      await Promise.all([...jobs,
        c.anim(sideL, [{ opacity: sideL.style.opacity || 0 }, { opacity: ok ? 1 : 0 }], 300, { delay: 420 }),
        c.anim(topL, [{ opacity: topL.style.opacity || 0 }, { opacity: ok ? 1 : 0 }], 300, { delay: 420 }),
        c.anim(outline, [{ opacity: outline.style.opacity || 0 }, { opacity: ok ? 1 : 0 }], 300, { delay: 480 }),
        c.anim(leftL, [{ opacity: leftL.style.opacity || 0 }, { opacity: ok ? 0 : 1 }], 300, { delay: 450 })]);
    }
    const g = gcdI(d.a, d.b), poly = trPoly(d), bigN = d.q ? T('x^2') + '-tiles' : T('x') + '-tiles', smN = d.q ? T('x') + '-tiles' : 'unit tiles';
    const steps = [];
    for (let r = 1; r <= g; r++) {
      const okA = d.a % r === 0, okB = d.b % r === 0, ok = okA && okB;
      const rr = r;
      steps.push({
        cap: r === 1 ? `<b>One long row:</b> a rectangle ${T(sideT(1))} tall and ${T(widT(1))} wide. So ${T(`${poly}=${sideT(1) === '1' ? '1' : 'x'}(${widT(1)})`)}. True, but can the tiles stack into <b>more equal rows</b>?`
          : ok ? `<b>${r} equal rows</b> of ${T(widT(r))} ✓. The rectangle is ${T(sideT(r))} tall: ${T(`${poly}=${sideT(r)}(${widT(r)})`)}.` + (r < g ? ' Keep going: can we make even more rows?' : '')
            : `<b>${r} equal rows?</b> ${listAnd([!okA ? `the ${d.a} ${bigN}` : '', !okB ? `the ${d.b} ${smN}` : ''].filter(Boolean)).replace(/^the/, 'The')} don’t split into ${r} equal rows: <b class="red">left over</b> ✗.`,
        run: async (c) => {
          const row = h('div', 'u4l1a-rtr ' + (ok ? 'ok' : 'no'), ok ? `${rr} ${rr > 1 ? 'rows' : 'row'} ${K(`${sideT(rr)}(${widT(rr)})`)} <span>✓</span>` : `${rr} rows <span>✗</span>`);
          list.appendChild(row);
          await Promise.all([arrange(c, rr), c.fadeIn(row, 300, { delay: 350 })]);
        }
      });
    }
    const gT = sideT(g), fact = `${gT}(${widT(g)})`;
    const fin = add(stage, h('div', 'u4l1a-tfin c', K(`${poly}=\\boldsymbol{${fact}}`)), ax + aw / 2 + 10, 412); hide(fin);
    steps.push({
      cap: `The number of equal rows must divide <b>both</b> ${d.a} and ${d.b}, so the most is GCF(${d.a}, ${d.b}) = ${g}. Each row is ${T(d.q ? 'x' : '1')} tall, so the tallest side is ${T(gT)}: the <b>GCF</b>. ${T(`${poly}=${fact}`)}.`,
      run: async (c) => {
        sum.innerHTML = `<div class="u4l1a-rth">Tallest side</div><div class="u4l1a-rtg">GCF ${K('=' + gT)}</div>`;
        outline.classList.add('final'); sideL.classList.add('ok');
        await Promise.all([c.fadeIn(sum, 400), pulse(c, sideL, 1.25), c.fadeIn(fin, 450, { delay: 200 })]);
      }
    });
    return steps;
  }
};

/* ============ 3. Pull it out front: divide every term by the GCF, then check by expanding ============ */
const PO = {
  d: '18a^3b+24a^2b^2', neg: '-4x^2+10x', a2: '15x+25y', b2: '8x^3+20x^2+4x', c2: '6a^2+30a', d2: '24p-16q', e2: '-5mn-15m^2', f2: '21x^2y^2-35xy+7x',
  d3: '-6x^3+9x^2-12x', a3: '18x-8', b3: '20x^4+5x^2', c3: '12a^3b^2+9ab^3+3ab^4', d3b: '14p^3-7p^2+21p', e3: '35xy^2z^3-28x^2y^4z^2+42x^3y^2z^5'
};
function makePull(title, choices, first) {
  return {
    title, height: 440, choices, value: first,
    intro: (k) => `Factor ${T(polyT(parsePoly(PO[k])))} by removing the <b>greatest common factor</b>.`,
    make(stage, key, ex) {
      const W = ex.W, P = parsePoly(PO[key]), n = P.length, g = gcfOf(P, 'poly'), gT = termT(g, true), Q = P.map((t) => divT(t, g));
      const pT = polyT(P), qT = polyT(Q), factT = `${gT}(${qT})`;
      const lx = 22, x0 = 182, colW = (W - x0 - 14) / n, cx = (i) => x0 + colW * (i + 0.5);
      const yA = 44, yB = 128, yC = 214, yD = 292;
      const lab = (y, t) => { const e = add(stage, h('div', 'u4l1a-plab', t), lx, y); e.style.translate = '0 -50%'; return e; };
      lab(yA, 'terms'); const lB = h('div'), lC = lab(yC, 'factored'), lD = lab(yD + 52, 'check'); hide(lC, lD);
      const tA = P.map((t, i) => add(stage, h('div', 'u4l1a-pt c', K(termT(t, i === 0))), cx(i), yA));
      const gBox = add(stage, h('div', 'u4l1a-gbox', `<div class="u4l1a-gbh">÷ GCF</div><div class="u4l1a-gbv">${K(gT)}</div>`), lx, yB + 8); gBox.style.translate = '0 -50%'; hide(gBox);
      const tB = P.map((t, i) => { const e = add(stage, h('div', 'u4l1a-pf c', K(`\\dfrac{${termT(t, true)}}{${gT}}\\htmlClass{u4l1a-qe}{=}\\htmlClass{u4l1a-qv}{${termT(Q[i], true)}}`)), cx(i), yB); fit(e, colW - 14); hide(e); return e; });
      const qe = tB.map((e) => [...spans(e, 'u4l1a-qe'), ...spans(e, 'u4l1a-qv')]); qe.flat().forEach((e) => hide(e));
      const cSrc = `\\htmlClass{u4l1a-ce}{=}\\,\\htmlClass{u4l1a-tg}{${gT}}\\htmlClass{u4l1a-cb}{(}` + Q.map((q, i) => (i === 0 ? `\\htmlClass{u4l1a-tq0}{${termT(q, true)}}` : `\\mathbin{\\htmlClass{u4l1a-tq${i}}{${q.n < 0 ? '-' : '+'}}}\\htmlClass{u4l1a-tq${i}}{${bodyT(q)}}`)).join('') + '\\htmlClass{u4l1a-cb}{)}';
      const rowC = add(stage, h('div', 'u4l1a-pc', K(cSrc)), x0 - 6, yC); rowC.style.translate = '0 -50%'; fit(rowC, W - x0 - 270);
      const cParts = { e: spans(rowC, 'u4l1a-ce'), g: spans(rowC, 'u4l1a-tg'), b: spans(rowC, 'u4l1a-cb'), q: Q.map((q, i) => spans(rowC, 'u4l1a-tq' + i)) };
      [...cParts.e, ...cParts.g, ...cParts.b, ...cParts.q.flat()].forEach((e) => hide(e));
      const stamp = add(stage, h('div', 'u4l1a-stamp ok', 'FACTORED<small>completely ✓</small>'), W - 22, yC - 40); stamp.style.translate = '-100% 0'; hide(stamp);
      // the check: a rectangle whose side is the GCF and whose pieces are the original terms
      const pw = Math.min(232, (W - x0 - 30) / n), rx = x0 + 36, ry = yD + 22, rh2 = 82;
      const side = add(stage, h('div', 'u4l1a-rsd', K(gT)), rx - 10, ry + rh2 / 2); side.style.translate = '-100% -50%'; hide(side);
      const pieces = P.map((t, i) => {
        const e = add(stage, box(h('div', 'u4l1a-rp' + (t.n < 0 ? ' neg' : ''), `<span>${K(termT(t, true))}</span>`), pw, rh2), rx + i * pw, ry); e.style.setProperty('--pc', PCOL[i % 4]);
        const w = add(stage, h('div', 'u4l1a-rw c', K(termT(Q[i], true))), rx + i * pw + pw / 2, ry - 16); w.style.color = PCOL[i % 4];
        hide(e, w); return { e, w };
      });
      pieces.forEach(({ e }) => fit(e.firstChild, pw - 14));
      const negG = g.n < 0, ones = Q.filter(isOne).length;
      const coefs = P.map((t) => Math.abs(t.n)), cg = Math.abs(g.n);
      const vlist = Object.keys(g.v).map((k) => T(g.v[k] > 1 ? `${k}^{${g.v[k]}}` : k));
      const steps = [{
        cap: `<b>Find the GCF.</b> Numbers: GCF(${coefs.join(', ')}) = ${cg}. ${vlist.length ? `Lowest power of each common letter: ${listAnd(vlist)}.` : 'No letter is in <b>every</b> term.'}` + (negG ? ` The leading coefficient is <b>negative</b>, so take out a negative GCF: ${T(gT)}.` : ` GCF ${T('=' + gT)}.`),
        run: (c) => Promise.all([c.pop(gBox, 420), ...tA.map((e) => pulse(c, e, 1.08))])
      }, {
        cap: `Divide <b>every</b> term by ${T(gT)}: ${listAnd(P.map((t, i) => T(`${termT(t, true)}\\div ${fT(g)}=${termT(Q[i], true)}`)))}.` + (negG ? ' Dividing by a negative <b>flips every sign</b>.' : ' Divide the numbers; subtract the exponents.'),
        run: async (c) => {
          await Promise.all([c.fadeIn(lB, 250), ...tB.map((e, i) => c.fadeIn(e, 350, { delay: i * 120 }))]);
          await Promise.all(qe.map((ss, i) => showSpans(c, ss, 320, 150 + i * 260)));
        }
      }, {
        cap: `Write the GCF <b>out front</b> and the quotients <b>in the bracket</b>: ${T(`${pT}=${factT}`)}.` + (ones ? ` The term that equalled the GCF leaves a <b>1</b>, not nothing.` : ''),
        run: async (c) => {
          await Promise.all([c.fadeIn(lC, 250), showSpans(c, [...cParts.e, ...cParts.b], 300)]);
          await fly(c, stage, K(gT), stagePos(stage, gBox.lastChild), stagePos(stage, cParts.g[0]), 'u4l1a-flyg', 600);
          cParts.g.forEach((e) => (e.style.opacity = 1));
          await Promise.all(Q.map(async (q, i) => {
            await c.sleep(i * 150);
            await fly(c, stage, K(termT(q, i === 0)), stagePos(stage, spans(tB[i], 'u4l1a-qv')[0]), stagePos(stage, cParts.q[i][cParts.q[i].length - 1]), 'u4l1a-flyq', 600);
            cParts.q[i].forEach((e) => (e.style.opacity = 1));
          }));
          cParts.q.flat().forEach((e) => (e.style.opacity = 1));
        }
      }, {
        cap: `<b>Check by expanding:</b> the GCF is the <b>side</b> of a rectangle and each bracket term is a <b>width</b>. ${listAnd(Q.map((q, i) => T(`${fT(g)}\\cdot ${fT(q)}=${termT(P[i], true)}`)))} ✓`,
        run: (c) => Promise.all([c.fadeIn(lD, 250), c.pop(side, 380), ...pieces.map(({ e, w }, i) => Promise.all([c.anim(e, [{ opacity: 0, transform: 'scaleX(.2)' }, { opacity: 1, transform: 'none' }], 420, { delay: 150 + i * 200 }), c.pop(w, 340, { delay: 300 + i * 200 })]))])
      }, {
        cap: `<b>Factored completely?</b> The terms left in the bracket, ${T(qT)}, have no common factor except 1, so nothing more comes out. ✓`,
        run: (c) => stampIn(c, stamp)
      }];
      return steps;
    }
  };
}
const pullA = makePull('Pull it out front: divide every term by the GCF',
  [{ v: 'd', label: tex('18a^3b+24a^2b^2') }, { v: 'neg', label: tex('-4x^2+10x') }, { sep: 'Example 2 check:' }, ...['a', 'b', 'c', 'd', 'e', 'f'].map((k) => ({ v: k + '2', label: `(${k})` }))], 'd');
const pullB = makePull('Factor completely, then check by expanding',
  [{ v: 'd3', label: tex('-6x^3+9x^2-12x') }, { sep: 'Example 3 check:' }, { v: 'a3', label: '(a)' }, { v: 'b3', label: '(b)' }, { v: 'c3', label: '(c)' }, { v: 'd3b', label: '(d)' }, { v: 'e3', label: '(e)' }], 'd3');

/* ============ 3. Find the error: expanding catches most mistakes ============ */
const FE = {
  A: { who: 'Ava', poly: '18x^3-12x^2', g: '6x', br: '3x^2-2x', fix: ['6x^2', '3x-2'], kind: 'nc' },
  B: { who: 'Ben', poly: '-10y^2-15y', g: '-5y', br: '2y-3', fix: ['-5y', '2y+3'], kind: 'sign' },
  C: { who: 'Cole', poly: '8ab+4a', g: '4a', br: '2b', fix: ['4a', '2b+1'], kind: 'one' },
  D: { who: 'Dina', poly: '15m^3-10m', g: '5m', br: '3m^3-2', fix: ['5m', '3m^2-2'], kind: 'exp' }
};
const findErr = {
  title: 'Find the error: check by expanding',
  height: 410,
  choices: Object.keys(FE).map((k) => ({ v: k, label: FE[k].who })),
  intro: (k) => { const d = FE[k]; return `${d.who} says ${T(`${polyT(parsePoly(d.poly))}=${d.g}(${polyT(parsePoly(d.br))})`)}. Is it right?`; },
  make(stage, key, ex) {
    const W = ex.W, d = FE[key], P = parsePoly(d.poly), g = parseTerm(d.g), Bq = parsePoly(d.br), prods = Bq.map((q) => mulT(g, q));
    const pT = polyT(P), gT = termT(g, true);
    const who = add(stage, h('div', 'u4l1a-who', `${d.who}’s factoring`), 30, 18);
    const claimSrc = `${pT}=\\htmlClass{u4l1a-fg}{${gT}}(` + Bq.map((q, i) => `\\htmlClass{u4l1a-fb${i}}{${termT(q, i === 0)}}`).join('') + ')';
    const claim = add(stage, h('div', 'u4l1a-claim', K(claimSrc)), 30, 112); claim.style.translate = '0 -50%';
    const svg = arcLayer(stage);
    const expL = add(stage, h('div', 'u4l1a-plab', 'expands to'), 30, 196); expL.style.translate = '0 -50%';
    const expSrc = '\\htmlClass{u4l1a-feq}{=}' + prods.map((p, i) => `\\htmlClass{u4l1a-fp${i}}{${tc(PCOL[i], termT(p, i === 0))}}`).join('');
    const exp = add(stage, h('div', 'u4l1a-claim sm', K(expSrc)), 170, 196); exp.style.translate = '0 -50%';
    const pSpans = prods.map((p, i) => spans(exp, 'u4l1a-fp' + i)), feq = spans(exp, 'u4l1a-feq'); hide(expL, ...feq, ...pSpans.flat());
    const same = polyT(collect(prods)) === polyT(collect(P));
    const verd = add(stage, h('div', 'u4l1a-verd ' + (same ? 'ok' : 'no'), same ? `✓ matches ${K(pT)}` : `✗ should be ${K(pT)}`), 170, 246); verd.style.translate = '0 -50%'; hide(verd);
    const STAMP = { nc: 'NOT THE GREATEST', sign: 'SIGN ERROR', one: 'MISSING 1', exp: 'EXPONENT ERROR' };
    const stamp = add(stage, h('div', 'u4l1a-stamp no', STAMP[d.kind] + '<small>' + (d.kind === 'nc' ? 'not factored completely' : 'doesn’t expand back') + '</small>'), W - 26, 168); stamp.style.translate = '-100% 0'; hide(stamp);
    const fg = parseTerm(d.fix[0]), fB = parsePoly(d.fix[1]), fixT = `${termT(fg, true)}(${polyT(fB)})`;
    const fixL = add(stage, h('div', 'u4l1a-plab ok', 'correct'), 30, 330); fixL.style.translate = '0 -50%';
    const fixE = add(stage, h('div', 'u4l1a-claim sm ok', K(`${pT}=\\boldsymbol{${fixT}}`)), 170, 330); fixE.style.translate = '0 -50%';
    const fixC = add(stage, h('div', 'u4l1a-fixc', 'check: ' + K(fB.map((q) => `${fT(fg)}\\cdot ${fT(q)}=${termT(mulT(fg, q), true)}`).join(',\\ \\ ')) + ' ✓'), 170, 376); fixC.style.translate = '0 -50%';
    hide(fixL, fixE, fixC);
    const why = {
      nc: `It expands back to ${T(pT)} ✓, so it isn’t <b>wrong</b>… but look in the bracket: ${T('3x^2')} and ${T('-2x')} still share an ${T('x')}. ${T('6x')} isn’t the <b>greatest</b> common factor, so it’s not factored completely.`,
      sign: `It expands to ${T(polyT(prods))}, not ${T(pT)} ✗. ${T('-15y\\div(-5y)=+3')}: dividing by a negative flips <b>every</b> sign, and ${d.who} only flipped the first one.`,
      one: `It expands to just ${T(polyT(prods))} ✗. Where did ${T('+4a')} go? ${T('4a\\div4a=1')}: when a term <b>is</b> the GCF, it leaves a <b>1</b> in the bracket.`,
      exp: `It expands to ${T(polyT(prods))}, not ${T(pT)} ✗. ${T('m^3\\div m=m^{3-1}=m^2')}: dividing <b>subtracts</b> exponents. ${d.who} forgot to divide the ${T('m^3')}.`
    }[d.kind];
    return [{
      cap: `<b>Check by expanding:</b> multiply the ${T(gT)} by ${Bq.length > 1 ? '<b>each</b> term' : 'the term'} in the bracket.`,
      run: async (c) => {
        const gEl = spans(claim, 'u4l1a-fg')[0], a = stagePos(stage, gEl);
        await Promise.all([c.fadeIn(expL, 250), showSpans(c, feq, 250)]);
        for (let i = 0; i < Bq.length; i++) {
          const b = stagePos(stage, spans(claim, 'u4l1a-fb' + i)[0]), dx = Math.abs(b.x - a.x);
          spans(claim, 'u4l1a-fb' + i).forEach((e) => (e.style.color = PCOL[i]));
          const ar = arrow(svg, a.x, a.t - 2, b.x, b.t - 2, Math.min(64, 30 + dx * 0.25), PCOL[i]);
          await ar.draw(c, 420);
          await showSpans(c, pSpans[i], 320);
        }
        await c.fadeIn(verd, 350);
      }
    }, {
      cap: why,
      run: async (c) => {
        if (d.kind === 'nc') Bq.forEach((q, i) => spans(claim, 'u4l1a-fb' + i).forEach((e) => e.classList.add('u4l1a-hl')));
        else pSpans.forEach((ss, i) => { if (termT(prods[i], true) !== termT(P[i], true)) ss.forEach((e) => e.classList.add('u4l1a-bad')); });
        const jobs = [stampIn(c, stamp)];
        if (d.kind === 'one') { // the term that vanished
          const gh = add(stage, h('div', 'u4l1a-ghost', K(termT(P[P.length - 1], false)) + ' ?'), 170 + exp.offsetWidth + 16, 196); gh.style.translate = '0 -50%';
          jobs.push(c.pop(gh, 380));
        }
        await Promise.all(jobs);
      }
    }, {
      cap: `Fixed: ${T(`${pT}=${fixT}`)}. It expands back to ${T(pT)}, and nothing common is left in ${T(polyT(fB))} ✓.`,
      run: (c) => Promise.all([c.fadeIn(fixL, 300), c.fadeIn(fixE, 400), c.fadeIn(fixC, 400, { delay: 300 })])
    }];
  }
};

/* ============ 4. Extension: a fraction out front ============ */
const FR = {
  d: { p: '1/4x^2-2x', g: '1/4x', why: `Both terms contain ${T('x')}, and the first is ${T('\\tfrac14x^2')}. Try ${T('\\tfrac14x')}.` },
  a5: { p: '1/2x^2+6x', g: '1/2x' }, b5: { p: '1/5a^2-5a', g: '1/5a' }, c5: { p: '8x+4/5', g: '4/5' }, d5: { p: '1/3a^2-2/5b^2', g: '1/15' },
  a6: { p: 'a-1/8a^2', g: '1/8a', why: `The bracket ${T('(8-a)')} starts with ${T('8')}, and ${T('8\\times\\ ?=a')}, so the factor is ${T('\\tfrac18a')}.` },
  b6: { p: '1/3pir^2-3pir', g: '1/3pir', why: `The bracket ${T('(r-9)')} starts with ${T('r')}, and ${T('r\\times\\ ?=\\tfrac13\\pi r^2')}, so the factor is ${T('\\tfrac13\\pi r')}.` },
  c6: { p: '6x^2+3x+3/7', g: '3/7', why: `The bracket starts with ${T('14x^2')}, and ${T('14x^2\\times\\ ?=6x^2')}, so the factor is ${T('\\tfrac{6}{14}=\\tfrac37')}.` }
};
const fracOut = {
  title: 'Extension: a fraction out front',
  height: 420,
  choices: [{ v: 'd', label: tex('\\tfrac14x^2-2x') }, { sep: 'Example 5 check:' }, ...['a', 'b', 'c', 'd'].map((k) => ({ v: k + '5', label: `(${k})` })), { sep: 'Example 6 check:' }, ...['a', 'b', 'c'].map((k) => ({ v: k + '6', label: `(${k})` }))],
  intro: (k) => `Factor ${T(polyT(parsePoly(FR[k].p)))} so the bracket has <b>whole-number</b> coefficients.`,
  make(stage, key, ex) {
    const W = ex.W, d = FR[key], P = parsePoly(d.p), n = P.length, g = parseTerm(d.g), Q = P.map((t) => divT(t, g));
    const gT = termT(g, true, true), gTs = termT(g, true), pT = polyT(P, true), qT = polyT(Q);
    const lx = 22, x0 = 182, colW = (W - x0 - 14) / n, cx = (i) => x0 + colW * (i + 0.5);
    const yA = 46, yB = 136, yC = 232, yD = 330;
    const lab = (y, t, cls = '') => { const e = add(stage, h('div', 'u4l1a-plab ' + cls, t), lx, y); e.style.translate = '0 -50%'; return e; };
    lab(yA, 'terms'); const lB = lab(yB, 'rebuild'), lC = lab(yC, 'factored'), lD = lab(yD, 'check', 'ok'); hide(lB, lC, lD);
    P.forEach((t, i) => add(stage, h('div', 'u4l1a-pt c', K(termT(t, i === 0, true))), cx(i), yA));
    const gBox = add(stage, h('div', 'u4l1a-gbox ext', `<div class="u4l1a-gbh">take out</div><div class="u4l1a-gbv">${K(gTs)}</div>`), W - 22, yC); gBox.style.translate = '-100% -50%'; hide(gBox);
    const qB = (i, q) => K(`${fT(g, true)}\\times\\boxed{${q}}=${termT(P[i], true, true)}`);
    const tB = P.map((t, i) => { const e = add(stage, h('div', 'u4l1a-pf c', qB(i, '\\,?\\,')), cx(i), yB); fit(e, colW - 12); hide(e); return e; });
    const rowC = add(stage, h('div', 'u4l1a-pc', K(`${pT}=${gT}(${qT})`)), x0 - 6, yC); rowC.style.translate = '0 -50%'; fit(rowC, W - x0 - 230); hide(rowC);
    const chk = add(stage, h('div', 'u4l1a-pc sm ok', K(Q.map((q, i) => `${fT(g, true)}\\cdot ${fT(q)}=${termT(P[i], true, true)}`).join(',\\quad ') + '\\ \\checkmark')), x0 - 6, yD); chk.style.translate = '0 -50%'; fit(chk, W - x0 - 20); hide(chk);
    return [{
      cap: (d.why || `The common factor ${T(gTs)} has already been chosen.`) + ' The goal: a bracket with <b>whole-number</b> coefficients.',
      run: (c) => c.pop(gBox, 420)
    }, {
      cap: `Ask: <b>what do I multiply ${T(gTs)} by</b> to rebuild each term? ${listAnd(Q.map((q, i) => T(`${fT(g)}\\times ${fT(q)}=${termT(P[i], true)}`)))}.`,
      run: async (c) => {
        await Promise.all([c.fadeIn(lB, 250), ...tB.map((e, i) => c.fadeIn(e, 300, { delay: i * 120 }))]);
        for (let i = 0; i < n; i++) { tB[i].innerHTML = qB(i, `\\textcolor{${PCOL[i]}}{${termT(Q[i], true)}}`); await c.pop(tB[i].querySelector('.fbox') || tB[i], 360); }
      }
    }, {
      cap: `So ${T(`${polyT(P)}=${gTs}(${qT})`)}. Every coefficient in the bracket is a <b>whole number</b>: an <b>integral</b> polynomial ✓.`,
      run: (c) => Promise.all([c.fadeIn(lC, 250), c.fadeIn(rowC, 450)])
    }, {
      cap: `<b>Check by expanding:</b> multiply ${T(gTs)} back into the bracket. Every term comes back ✓.`,
      run: (c) => Promise.all([c.fadeIn(lD, 250), c.fadeIn(chk, 450)])
    }];
  }
};

/* ============ warm-up: Tile the Floor ============ */
function mountFloor() {
  const host = document.getElementById('floor'); if (!host) return;
  const S = 2, FW = 240, FH = 180, L = 58, Tp = 14, X0 = L, Y0 = Tp, VW = L + FW * S + 22, VH = Tp + FH * S + 50;
  host.innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" class="u4l1a-fsvg">
      <defs><clipPath id="u4l1a-fclip"><rect x="${X0}" y="${Y0}" width="${FW * S}" height="${FH * S}"/></clipPath>
        <pattern id="u4l1a-cuth" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#fbe2df"/><rect width="4" height="9" fill="#f3b3ac"/></pattern></defs>
      <rect x="${X0}" y="${Y0}" width="${FW * S}" height="${FH * S}" fill="#dfc08e"/>
      <g stroke="#c9a46c" stroke-width="1">${Array.from({ length: 8 }, (_, j) => `<path d="M${X0} ${Y0 + (j + 1) * 40}H${X0 + FW * S}"/>`).join('')}</g>
      <g class="u4l1a-ftiles" clip-path="url(#u4l1a-fclip)"></g>
      <g class="u4l1a-fover"></g>
      <rect x="${X0}" y="${Y0}" width="${FW * S}" height="${FH * S}" fill="none" stroke="#1e2d46" stroke-width="4"/>
      <text x="${X0 + FW}" y="${Y0 + FH * S + 34}" class="u4l1a-ftx">240 cm</text>
      <text x="${X0 - 18}" y="${Y0 + FH}" class="u4l1a-ftx" transform="rotate(-90 ${X0 - 18} ${Y0 + FH})">180 cm</text>
      <path d="M${X0} ${Y0 + FH * S + 14}H${X0 + FW * S}M${X0} ${Y0 + FH * S + 7}V${Y0 + FH * S + 21}M${X0 + FW * S} ${Y0 + FH * S + 7}V${Y0 + FH * S + 21}" stroke="#1e2d46" stroke-width="2"/>
    </svg>
    <div class="u4l1a-fctl no-ink"><span class="u4l1a-fcl">Tile size:</span>${[20, 30, 40, 50, 60, 90, 120].map((s) => `<button class="chip" type="button" data-fs="${s}">${s} cm</button>`).join('')}
      <form class="ex-custom"><input type="text" inputmode="numeric" placeholder="other" aria-label="Choose your own tile size"><button class="chip go" type="submit">Go</button></form></div>
    <div class="u4l1a-fread" aria-live="polite"></div>`;
  const tg = host.querySelector('.u4l1a-ftiles'), over = host.querySelector('.u4l1a-fover'), read = host.querySelector('.u4l1a-fread');
  const rect = (x, y, w, hh, cls, delay) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${hh}" style="animation-delay:${delay}ms"/>`;
  const start = () => {
    let s = ''; const t = 20 * S;
    for (let i = 0; i < 5; i++) s += rect(X0 + i * t, Y0 + FH * S - t, t, t, 'u4l1a-ft', i * 60);
    for (let j = 1; j < 3; j++) s += rect(X0, Y0 + FH * S - (j + 1) * t, t, t, 'u4l1a-ft', 300 + j * 60);
    tg.innerHTML = s; over.innerHTML = `<g class="u4l1a-fnote"><rect x="${X0 + 170}" y="${Y0 + 120}" width="232" height="62" rx="8"/><text x="${X0 + 286}" y="${Y0 + 147}">Someone started with</text><text x="${X0 + 286}" y="${Y0 + 172}"><tspan font-weight="800">20 cm</tspan> tiles…</text></g>`;
    read.innerHTML = 'Tap a <b>tile size</b> to cover the whole floor. <span class="muted">No cutting allowed!</span>';
    host.querySelectorAll('[data-fs]').forEach((b) => b.classList.remove('on'));
  };
  const lay = (cm) => {
    const t = cm * S, nx = Math.ceil(FW / cm), ny = Math.ceil(FH / cm), okX = FW % cm === 0, okY = FH % cm === 0;
    let s = '', o = '';
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const cut = (i + 1) * cm > FW || (j + 1) * cm > FH, x = X0 + i * t, y = Y0 + FH * S - (j + 1) * t, dl = Math.min(900, (i + j) * (nx * ny > 200 ? 12 : 30));
      s += rect(x, y, t, t, 'u4l1a-ft' + (cut ? ' cut' : ''), dl);
      if (cut) o += rect(x, y, t, t, 'u4l1a-fghost', dl);
    }
    tg.innerHTML = s; over.innerHTML = o;
    const dx = okX ? `${FW} ÷ ${cm} = <b>${FW / cm}</b> ✓` : `${FW} ÷ ${cm} = ${+(FW / cm).toFixed(2)} <b class="red">✗</b>`;
    const dy = okY ? `${FH} ÷ ${cm} = <b>${FH / cm}</b> ✓` : `${FH} ÷ ${cm} = ${+(FH / cm).toFixed(2)} <b class="red">✗</b>`;
    read.innerHTML = `<b>${cm} cm tiles.</b> Across: ${dx}. Up: ${dy}.<br>` + (okX && okY ? `<b class="ok">${FW / cm} × ${FH / cm} = ${(FW / cm) * (FH / cm)} tiles</b>, no cutting.` : `<b class="red">Some tiles hang over the edge and would have to be cut.</b>`);
    host.querySelectorAll('[data-fs]').forEach((b) => b.classList.toggle('on', +b.dataset.fs === cm));
  };
  host.querySelectorAll('[data-fs]').forEach((b) => b.addEventListener('click', () => lay(+b.dataset.fs)));
  const f = host.querySelector('form');
  f.addEventListener('submit', (e) => { e.preventDefault(); const inp = f.querySelector('input'), v = parseInt(inp.value.replace(/\D/g, ''), 10); if (v >= 10 && v <= 240) { inp.blur(); inp.value = ''; lay(v); } else { inp.value = ''; inp.placeholder = '10–240'; } });
  start();
}

function mountReveals() {
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { twoWay, columns, lowest, tileRect, pullA, pullB, findErr, fracOut };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountFloor(); mountReveals(); mountExplainers();
