/* Math 10C · Unit 3 · Lesson 4 — Multiplying Polynomials II (binomial × trinomial, three binomials):
 * the painted-cube warm-up and the explainers on this page. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const SVGNS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};
const T = (s) => tex(s);

/* ---------------- polynomial helpers (one variable) ----------------
 * a term is [coefficient, exponent]; a polynomial is a list of terms in WRITTEN order. */
const DEG = ['#2f5fa8', '#b86e00', '#0f7a74', '#7b4fc4', '#b5367a', '#8a5a2b']; // 1 slate-blue · x amber · x² teal (the tile colours) · x³ purple · …
const degCol = (e) => DEG[Math.min(e, DEG.length - 1)];
const DEGBG = ['#e6eefa', '#fff1d6', '#dff2ef', '#eee6fa', '#fae4ef', '#f3e9de'];
const degBg = (e) => DEGBG[Math.min(e, DEGBG.length - 1)];
function body(c, e, v) { const a = Math.abs(c); return (e === 0 ? String(a) : a === 1 ? '' : String(a)) + (e === 0 ? '' : e === 1 ? v : `${v}^{${e}}`); }
function termT([c, e], v, first, o = {}) {
  const s = c < 0 ? '-' : first ? '' : '+', b = body(c, e, v);
  return o.col ? `${s}\\textcolor{${degCol(e)}}{${b}}` : s + b;
}
const polyT = (ts, v, o = {}) => (ts.length ? ts.map((t, i) => termT(t, v, i === 0, o)).join('') : '0');
const par = (ts, v, o) => (ts.length > 1 ? `(${polyT(ts, v, o)})` : polyT(ts, v, o));
const mulT = (a, b) => [a[0] * b[0], a[1] + b[1]];
function collect(ts) {
  const m = new Map(); ts.forEach(([c, e]) => m.set(e, (m.get(e) || 0) + c));
  return [...m].filter(([, c]) => c !== 0).sort((x, y) => y[0] - x[0]).map(([e, c]) => [c, e]);
}
const partials = (A, B) => A.flatMap((a) => B.map((b) => mulT(a, b)));
const polyMul = (A, B) => collect(partials(A, B));
const evalP = (ts, x) => ts.reduce((s, [c, e]) => s + c * x ** e, 0);
/* one factor in a product: wrap a negative monomial in brackets, (−4)(3p) */
const facT = (t, v) => (t[0] < 0 ? `(${termT(t, v, true)})` : termT(t, v, true));
const prodT = (a, b, v) => `${facT(a, v)}${a[0] < 0 || b[0] < 0 ? '' : '\\cdot '}${facT(b, v)}`;
/* group like terms (by degree, highest first): 3x^3+(9x^2+4x^2)+(6x+12x)+8 */
function groupedT(ts, v, o = {}) {
  const degs = [...new Set(ts.map((t) => t[1]))].sort((a, b) => b - a);
  return degs.map((d, i) => {
    const g = ts.filter((t) => t[1] === d);
    if (g.length === 1) return termT(g[0], v, i === 0, o);
    return (i ? '+' : '') + '(' + polyT(g, v, o) + ')';
  }).join('');
}
/* a sentence listing the collections that actually combine: 9x^2+4x^2=13x^2 and 6x+12x=18x */
function collectSentence(ts, v) {
  const degs = [...new Set(ts.map((t) => t[1]))].sort((a, b) => b - a);
  const parts = degs.map((d) => { const g = ts.filter((t) => t[1] === d); if (g.length < 2) return null; const s = g.reduce((x, t) => x + t[0], 0); return T(`${polyT(g, v)}=${s === 0 ? '0' : termT([s, d], v, true)}`); }).filter(Boolean);
  return parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts[0] || '';
}
function stampIn(c, el) { return c.anim(el, [{ opacity: 0, transform: 'scale(1.9) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); }
function drawLine(c, ln, ms = 420, o = {}) {
  const len = Math.hypot(ln.x2.baseVal.value - ln.x1.baseVal.value, ln.y2.baseVal.value - ln.y1.baseVal.value) + 2;
  ln.style.strokeDasharray = len; ln.style.strokeDashoffset = len; ln.style.opacity = 1;
  return c.anim(ln, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], ms, o);
}

/* a line of maths that is wider than its space (a narrow stage beside the sidebar) is set just small enough to fit */
function shrinkToFit(el, max) {
  const w = el.scrollWidth; if (!max || w <= max) return;
  el.style.fontSize = Math.floor(parseFloat(getComputedStyle(el).fontSize) * max / w * 10) / 10 + 'px';
}

/* =====================================================================
   Painted cubes: an isometric stack of unit cubes, each tagged by how many painted faces it has
   ===================================================================== */
const ISO = 0.8660254;
function cubeStack(host, dims, box, o = {}) {
  const [A, B, C] = dims;
  const s = Math.min(box.w / ((A + B) * ISO), box.h / ((A + B) * 0.5 + C)) * (o.fill || 0.94);
  const w = (A + B) * ISO * s, hh = ((A + B) * 0.5 + C) * s;
  const ox = (box.w - w) / 2 + B * ISO * s, oy = (box.h - hh) / 2 + C * s;
  const P = (x, y, z) => `${(ox + (x - y) * ISO * s).toFixed(1)},${(oy + (x + y) * 0.5 * s - z * s).toFixed(1)}`;
  const svg = svgEl('svg', { class: 'pc-svg', width: box.w, height: box.h, viewBox: `0 0 ${box.w} ${box.h}` });
  const cubes = [];
  for (let i = 0; i < A; i++) for (let j = 0; j < B; j++) for (let k = 0; k < C; k++) cubes.push([i, j, k]);
  cubes.sort((p, q) => p[0] + p[1] + p[2] - (q[0] + q[1] + q[2]));
  const counts = [0, 0, 0, 0];
  const groups = cubes.map(([i, j, k]) => {
    const cat = (i === 0) + (i === A - 1) + (j === 0) + (j === B - 1) + (k === 0) + (k === C - 1);
    counts[cat]++;
    const g = svgEl('g', { class: 'cb k' + cat + ((i === 0 || i === A - 1 || j === 0 || j === B - 1 || k === 0 || k === C - 1) ? ' shell' : ' core') });
    const face = (pts, cls) => g.appendChild(svgEl('polygon', { points: pts.join(' '), class: cls }));
    face([P(i, j, k + 1), P(i + 1, j, k + 1), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1)], 'ft ' + (k === C - 1 ? 'pnt' : 'wd'));
    face([P(i + 1, j, k), P(i + 1, j + 1, k), P(i + 1, j + 1, k + 1), P(i + 1, j, k + 1)], 'fr ' + (i === A - 1 ? 'pnt' : 'wd'));
    face([P(i, j + 1, k), P(i + 1, j + 1, k), P(i + 1, j + 1, k + 1), P(i, j + 1, k + 1)], 'fl ' + (j === B - 1 ? 'pnt' : 'wd'));
    svg.appendChild(g);
    return { g, i, j, k, cat };
  });
  if (A * B * C > 200) svg.classList.add('many');
  host.appendChild(svg);
  return { svg, groups, counts, s, P };
}
/* one small cube for the legend: n visible faces painted (right, left, top in that order like the booklet) */
function cubeIcon(n, size = 54) {
  const s = size / 2.1, ox = size / 2, oy = s * 1.05 + 2;
  const P = (x, y, z) => `${(ox + (x - y) * ISO * s).toFixed(1)},${(oy + (x + y) * 0.5 * s - z * s).toFixed(1)}`;
  const top = n >= 1, left = n >= 2, right = n >= 3;
  return `<svg class="pc-ico" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><g class="cb">
    <polygon class="fr ${right ? 'pnt' : 'wd'}" points="${[P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)].join(' ')}"/>
    <polygon class="fl ${left ? 'pnt' : 'wd'}" points="${[P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)].join(' ')}"/>
    <polygon class="ft ${top ? 'pnt' : 'wd'}" points="${[P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)].join(' ')}"/></g></svg>`;
}

/* ============ warm-up: the painted cube ============ */
const CATS = [
  { k: 3, name: '3 painted faces', where: 'the <b>corners</b>' },
  { k: 2, name: '2 painted faces', where: 'along the <b>edges</b>' },
  { k: 1, name: '1 painted face', where: 'the <b>middle of each face</b>' },
  { k: 0, name: 'no paint', where: '<b>hidden inside</b>' }
];
const SIZES = [{ d: [2, 2, 2], l: '2 × 2 × 2' }, { d: [3, 3, 3], l: '3 × 3 × 3' }, { d: [4, 4, 4], l: '4 × 4 × 4' }, { d: [5, 5, 5], l: '5 × 5 × 5' }, { d: [10, 10, 10], l: '10 × 10 × 10' }, { d: [3, 4, 5], l: '3 × 4 × 5 box' }];
let paintAPI = null;
function mountPaint() {
  const box = document.getElementById('paint'); if (!box) return;
  box.innerHTML = `<div class="pcw-left"><div class="pcw-stage"></div><div class="pcw-dim"></div></div>
    <div class="pcw-right no-ink">
      <div class="pcw-sizes"></div>
      <div class="pcw-cats"></div>
      <div class="pcw-sum" aria-live="polite"></div>
    </div>`;
  const stage = box.querySelector('.pcw-stage'), sizes = box.querySelector('.pcw-sizes'), cats = box.querySelector('.pcw-cats'), sum = box.querySelector('.pcw-sum'), dimEl = box.querySelector('.pcw-dim');
  let cur = SIZES[1], stack = null, sel = null, shown = new Set();
  const sizeBtns = SIZES.map((sz) => { const b = h('button', 'chip', sz.l); b.type = 'button'; b.onclick = () => setSize(sz); sizes.appendChild(b); return b; });
  const catBtns = CATS.map((ct) => {
    const b = h('button', 'pcw-cat k' + ct.k, `${cubeIcon(ct.k)}<span class="pcw-cn"><b>${ct.name}</b><span class="pcw-where"></span></span><span class="pcw-num">?</span>`);
    b.type = 'button'; b.onclick = () => pick(ct.k); cats.appendChild(b); return b;
  });
  function setSize(sz) {
    cur = sz; sel = null; shown = new Set();
    stage.innerHTML = ''; stack = cubeStack(stage, sz.d, { w: stage.clientWidth || 440, h: stage.clientHeight || 384 }); // size from the CSS
    sizeBtns.forEach((b, i) => b.classList.toggle('on', SIZES[i] === sz));
    const [A, B, C] = sz.d;
    dimEl.innerHTML = `${A} × ${B} × ${C} = <b>${fmt(A * B * C)}</b> small cubes`;
    render();
  }
  function pick(k) { sel = sel === k ? null : k; shown.add(k); render(); }
  function render() {
    stack.svg.setAttribute('class', 'pc-svg' + (stack.svg.classList.contains('many') ? ' many' : '') + (sel == null ? '' : ' sel sel-' + sel));
    catBtns.forEach((b, i) => {
      const k = CATS[i].k, on = shown.has(k), n = stack.counts[k];
      b.classList.toggle('on', sel === k); b.classList.toggle('done', on);
      b.querySelector('.pcw-num').innerHTML = on ? `<b>${fmt(n)}</b> <small>${n === 1 ? 'cube' : 'cubes'}</small>` : '?';
      b.querySelector('.pcw-where').innerHTML = on ? (n ? CATS[i].where : 'none!') : '';
    });
    const [A, B, C] = cur.d, all = shown.size === 4, c = stack.counts;
    sum.innerHTML = all ? `<b>Check:</b> ${fmt(c[3])} + ${fmt(c[2])} + ${fmt(c[1])} + ${fmt(c[0])} = <b>${fmt(A * B * C)}</b> ✓`
      : '<span class="muted">Tap each kind of cube to find them and count them.</span>';
  }
  setSize(cur);
  paintAPI = { show(dims, k) { const sz = SIZES.find((x) => x.d.join() === dims.join()); if (sz) setSize(sz); if (k != null) pick(k); box.scrollIntoView({ behavior: 'smooth', block: 'center' }); } };
}

/* =====================================================================
   1. Shake hands: every term × every term
   ===================================================================== */
const HS = {
  n22: { A: [[1, 1], [2, 0]], B: [[1, 1], [5, 0]], v: 'x' },
  n23: { A: [[2, 1], [1, 0]], B: [[1, 2], [4, 1], [3, 0]], v: 'x' },
  n33: { A: [[1, 2], [1, 1], [1, 0]], B: [[1, 2], [-1, 1], [2, 0]], v: 'x' },
  foil: { A: [[1, 1], [3, 0]], B: [[1, 2], [2, 1], [4, 0]], v: 'x', foil: true },
  ex1: { A: [[3, 1], [4, 0]], B: [[1, 2], [3, 1], [2, 0]], v: 'x' }
};
const HANDS = ['#c93a33', '#2f5fa8', '#12805a'];
const NAMES = { 1: 'monomial', 2: 'binomial', 3: 'trinomial' };
const handshake = {
  title: 'Every term shakes hands with every term',
  height: 432,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  value: 'n23',
  choices: [{ v: 'n22', label: '2 × 2' }, { v: 'n23', label: '2 × 3' }, { v: 'n33', label: '3 × 3' }, { v: 'foil', label: 'Why FOIL fails' }, { sep: 'Example 1 check:' }, { v: 'ex1', label: tex('(3x+4)(x^2+3x+2)') }],
  intro: (k) => { const d = HS[k]; return d.foil ? `Try FOIL on ${T(`${par(d.A, d.v)}${par(d.B, d.v)}`)}: First, Outer, Inner, Last. Does it catch every product?` : `${T(`${par(d.A, d.v)}${par(d.B, d.v)}`)}: a ${NAMES[d.A.length]} times a ${NAMES[d.B.length]}. Every term on the left must shake hands with <b>every</b> term on the right.`; },
  make(stage, key, ex) {
    const W = ex.W, H = 432, d = HS[key], { A, B, v } = d, m = A.length, n = B.length;
    const xL = 104, xR = 360, bw = 104, yc = 222, gap = 88;
    const yOf = (i, k) => yc + (i - (k - 1) / 2) * gap;
    add(stage, h('div', 'hs-head c', K(`${par(A, v)}${par(B, v)}`)), W / 2, 34);
    add(stage, h('div', 'hs-colh c', `${m} terms`), xL, yOf(0, Math.max(m, n)) - 52 + (Math.max(m, n) - m) * gap / 2);
    add(stage, h('div', 'hs-colh c', `${n} terms`), xR, yOf(0, Math.max(m, n)) - 52 + (Math.max(m, n) - n) * gap / 2);
    const svg = svgEl('svg', { width: W, height: H, class: 'hs-svg' }); at(svg, 0, 0); stage.appendChild(svg);
    const Lb = A.map((t, i) => { const e = add(stage, h('div', 'hs-p c', K(termT(t, v, true))), xL, yOf(i, m)); e.style.borderColor = HANDS[i]; e.style.width = bw + 'px'; return e; });
    const Rb = B.map((t, j) => { const e = add(stage, h('div', 'hs-p c', K(termT(t, v, true))), xR, yOf(j, n)); e.style.width = bw + 'px'; return e; });
    const lines = A.map((_, i) => B.map((_, j) => {
      const ln = svgEl('line', { x1: xL + bw / 2, y1: yOf(i, m), x2: xR - bw / 2, y2: yOf(j, n), stroke: HANDS[i], 'stroke-width': 4, 'stroke-linecap': 'round' });
      ln.style.opacity = 0; svg.appendChild(ln); return ln;
    }));
    // partial products: one column per left-hand term
    const px = 440, pw = W - px - 10, colW = pw / m;
    add(stage, h('div', 'hs-ph', 'Partial products'), px, 64);
    const chips = A.map((a, i) => B.map((b, j) => {
      const p = mulT(a, b);
      const e = add(stage, h('div', 'hs-chip', `<i style="background:${HANDS[i]}">${i * n + j + 1}</i>${K(`${prodT(a, b, v)}=\\textcolor{${degCol(p[1])}}{${termT(p, v, true)}}`)}`), px + i * colW, 100 + j * 50);
      e.style.width = (colW - 6) + 'px'; if (m > 2) e.classList.add('sm'); hide(e); return e;
    }));
    const all = partials(A, B), res = collect(all), mn = m * n;
    const count = add(stage, h('div', 'hs-count', `${m} × ${n} = <b>${mn}</b> partial products`), px, 100 + n * 50 + 6); hide(count);
    const fin = add(stage, h('div', 'hs-fin c', K(`=${polyT(all, v, { col: true })}=\\boldsymbol{${polyT(res, v)}}`)), W / 2, H - 34); hide(fin);
    const showProducts = (c, i, js, o = {}) => Promise.all(js.map((j, q) => Promise.all([drawLine(c, lines[i][j], 380, { delay: q * 330 }), c.fadeIn(chips[i][j], 320, { delay: q * 330 + 250 })])));
    const steps = [];
    if (d.foil) {
      const FO = [[0, 0, 'F', 0.45], [0, n - 1, 'O', 0.8], [1, 0, 'I', 0.8], [1, n - 1, 'L', 0.45]];
      const tags = FO.map(([i, j, t, f]) => { const x1 = xL + bw / 2, y1 = yOf(i, m), x2 = xR - bw / 2, y2 = yOf(j, n); const e = add(stage, h('div', 'hs-tag c', t), x1 + (x2 - x1) * f, y1 + (y2 - y1) * f); e.style.color = HANDS[i]; hide(e); return e; });
      steps.push({
        cap: `<b>FOIL</b>: First ${T(prodT(A[0], B[0], v))}, Outer ${T(prodT(A[0], B[n - 1], v))}, Inner ${T(prodT(A[1], B[0], v))}, Last ${T(prodT(A[1], B[n - 1], v))}. That’s only <b>4</b> products.`,
        run: (c) => Promise.all(FO.map(([i, j], q) => Promise.all([drawLine(c, lines[i][j], 380, { delay: q * 380 }), c.fadeIn(chips[i][j], 300, { delay: q * 380 + 250 }), c.pop(tags[q], 300, { delay: q * 380 + 200 })])))
      }, {
        cap: `Nobody shook hands with ${T(termT(B[1], v, true))}! FOIL was made for <b>2 × 2</b>. A binomial times a trinomial needs ${T('2\\times3=6')} products, so FOIL <b>misses two</b>.`,
        run: async (c) => { Rb[1].classList.add('lonely'); await c.shake(Rb[1]); }
      }, {
        cap: `Add the two missing handshakes: ${T(`${prodT(A[0], B[1], v)}=${termT(mulT(A[0], B[1]), v, true)}`)} and ${T(`${prodT(A[1], B[1], v)}=${termT(mulT(A[1], B[1]), v, true)}`)}. Now <b>every</b> term has met <b>every</b> term.`,
        run: async (c) => { Rb[1].classList.remove('lonely'); await Promise.all([0, 1].map((i, q) => Promise.all([drawLine(c, lines[i][1], 380, { delay: q * 380 }), c.fadeIn(chips[i][1], 300, { delay: q * 380 + 250 })]))); }
      });
    } else {
      A.forEach((a, i) => steps.push({
        cap: `${T(termT(a, v, true))} shakes hands with <b>every</b> term: ${B.map((b) => T(`${prodT(a, b, v)}=${termT(mulT(a, b), v, true)}`)).join(', ')}.`,
        run: (c) => { Lb[i].classList.add('on'); return showProducts(c, i, B.map((_, j) => j)); }
      }));
    }
    steps.push({
      cap: mn === 4 ? `${T('2\\times2=4')} partial products: <b>F</b>irst, <b>O</b>uter, <b>I</b>nner, <b>L</b>ast. That’s <b>FOIL</b>, the ${T('2\\times2')} case of the rule.`
        : `A ${m}-term times a ${n}-term polynomial: ${T(`${m}\\times${n}=${mn}`)} partial products <b>before</b> any like terms are collected.`,
      run: (c) => c.pop(count, 400)
    }, {
      cap: `Add all ${mn} and <b>collect like terms</b> (same colour)${collectSentence(all, v) ? ': ' + collectSentence(all, v) : ''}.${res.length < collect(all.map((t) => [1, t[1]])).length ? ' Some like terms <b>cancel</b> completely.' : ''}`,
      run: (c) => c.fadeIn(fin, 450)
    });
    return steps;
  }
};

/* =====================================================================
   1b. The grid: rows × columns, then like terms along the diagonals
   ===================================================================== */
const GRID = {
  n1: { A: [[1, 1], [5, 0]], B: [[1, 2], [2, 1], [3, 0]], v: 'x' },
  n2: { A: [[2, 1], [-3, 0]], B: [[1, 2], [-4, 1], [1, 0]], v: 'x' },
  ex1: { A: [[3, 1], [4, 0]], B: [[1, 2], [3, 1], [2, 0]], v: 'x' },
  e2a: { A: [[1, 2], [-9, 0]], B: [[3, 3], [2, 1], [-7, 0]], v: 'x' },
  e2b: { A: [[3, 2], [-2, 1], [-5, 0]], B: [[1, 1], [-4, 0]], v: 'y' },
  e2c: { A: [[1, 1], [-5, 0]], B: [[1, 2], [-2, 1], [-4, 0]], v: 'b', tail: ` That’s the first piece of Example 2(c). Next: multiply it by ${T('3')}, then subtract ${T('(5b-3)(5b+3)')}.` }
};
const grid = {
  title: 'The grid: six cells, then collect along the diagonals',
  height: 484,
  minW: 880, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n1', label: tex('(x+5)(x^2+2x+3)') }, { v: 'n2', label: tex('(2x-3)(x^2-4x+1)') }, { sep: 'Example 1 check:' }, { v: 'ex1', label: '(i)' }, { sep: 'Example 2 check:' }, { v: 'e2a', label: '(a)' }, { v: 'e2b', label: '(b)' }, { v: 'e2c', label: '(c), first part' }],
  intro: (k) => { const d = GRID[k]; return `Expand ${T(`${par(d.A, d.v)}${par(d.B, d.v)}`)} with a grid: one factor labels the <b>rows</b>, the other the <b>columns</b>. Each cell = row × column.`; },
  make(stage, key, ex) {
    const W = ex.W, d = GRID[key], { A, B, v } = d, m = A.length, n = B.length;
    const lw = 110, cw = n === 3 ? 148 : 170, rh = m === 3 ? 82 : 108, hh = 62, x0 = 26, y0 = 74;
    const gw = lw + n * cw, gh = hh + m * rh;
    add(stage, h('div', 'gr-head', K(`${par(A, v)}${par(B, v)}`)), x0, 16);
    const frame = add(stage, h('div', 'gr-frame'), x0, y0); frame.style.width = gw + 'px'; frame.style.height = gh + 'px';
    const corner = add(stage, h('div', 'gr-x c', '×'), x0 + lw / 2, y0 + hh / 2); void corner;
    const cx = (j) => x0 + lw + j * cw + cw / 2, cy = (i) => y0 + hh + i * rh + rh / 2;
    const colL = B.map((b, j) => add(stage, h('div', 'gr-lab c', K(termT(b, v, true))), cx(j), y0 + hh / 2));
    const rowL = A.map((a, i) => add(stage, h('div', 'gr-lab c', K(termT(a, v, true))), x0 + lw / 2, cy(i)));
    const cells = A.map((a, i) => B.map((b, j) => {
      const p = mulT(a, b);
      const bg = add(stage, h('div', 'gr-cell'), x0 + lw + j * cw + 4, y0 + hh + i * rh + 4); bg.style.width = (cw - 8) + 'px'; bg.style.height = (rh - 8) + 'px';
      return { p, i, j, bg };
    }));
    // diagonal strips (under the cell text)
    const svg = svgEl('svg', { width: W, height: 484, class: 'gr-svg' }); at(svg, 0, 0); stage.appendChild(svg);
    cells.flat().forEach((cl) => { cl.t = add(stage, h('div', 'gr-t c', K(termT(cl.p, v, true))), cx(cl.j), cy(cl.i)); hide(cl.t); });
    const flat = cells.flat(), degs = [...new Set(flat.map((cl) => cl.p[1]))].sort((a, b) => b - a);
    const groups = degs.map((e) => ({ e, cl: flat.filter((cl) => cl.p[1] === e) }));
    const strips = groups.filter((g) => g.cl.length > 1).map((g) => {
      const pts = g.cl.map((cl) => [cx(cl.j), cy(cl.i)]).sort((p, q) => p[0] - q[0]);
      const ln = svgEl('polyline', { points: pts.map((p) => p.join(',')).join(' '), stroke: degCol(g.e), 'stroke-width': 44, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none', 'stroke-opacity': 0.22 });
      ln.style.opacity = 0; svg.appendChild(ln); return ln;
    });
    const diag = groups.filter((g) => g.cl.length > 1).every((g) => new Set(g.cl.map((cl) => cl.i + cl.j)).size === 1);
    // collecting panel
    const pxx = x0 + gw + 34, pw = W - pxx - 16;
    const panel = add(stage, h('div', 'gr-panel'), pxx, y0); panel.style.width = pw + 'px';
    panel.innerHTML = '<div class="gr-ph">Add each colour</div>';
    const rows = groups.map((g) => {
      const sumC = g.cl.reduce((s, cl) => s + cl.p[0], 0);
      const src = g.cl.length > 1 ? `${polyT(g.cl.map((cl) => cl.p), v)}=${sumC === 0 ? '0' : termT([sumC, g.e], v, true)}` : termT(g.cl[0].p, v, true);
      const r = h('div', 'gr-row', K(`\\textcolor{${degCol(g.e)}}{${src}}`)); panel.appendChild(r); hide(r); shrinkToFit(r, r.clientWidth); return r;
    });
    const res = polyMul(A, B);
    const fin = add(stage, h('div', 'gr-fin c', K(`${par(A, v)}${par(B, v)}=\\boldsymbol{${polyT(res, v)}}`)), W / 2, 448); hide(fin);
    const steps = A.map((a, i) => ({
      cap: `<b>Row ${i + 1}:</b> ${T(termT(a, v, true))} times each column. ${B.map((b) => T(`${prodT(a, b, v)}=${termT(mulT(a, b), v, true)}`)).join(', &nbsp;')}${a[0] < 0 || B.some((b) => b[0] < 0) ? '. Watch the <b>signs</b>.' : '.'}`,
      run: async (c) => {
        rowL.forEach((r, q) => r.classList.toggle('hl', q === i));
        for (let j = 0; j < n; j++) {
          colL.forEach((cL, q) => cL.classList.toggle('hl', q === j));
          await c.pop(cells[i][j].t, 340);
          await c.sleep(120);
        }
        colL.forEach((cL) => cL.classList.remove('hl'));
      }
    }));
    steps.push({
      cap: `${m} × ${n} = <b>${m * n}</b> cells. Now colour the <b>like terms</b> (same power of ${T(v)}).${strips.length ? (diag ? ' Like terms line up along the <b>diagonals</b>.' : '') : ' Here no two cells are alike.'}`,
      run: async (c) => {
        rowL.forEach((r) => r.classList.remove('hl'));
        flat.forEach((cl) => { cl.t.style.color = degCol(cl.p[1]); cl.bg.style.background = degBg(cl.p[1]); });
        await Promise.all(strips.map((s, q) => c.anim(s, [{ opacity: 0 }, { opacity: 1 }], 450, { delay: q * 200 })));
      }
    }, {
      cap: `Add each colour: ${collectSentence(flat.map((cl) => cl.p), v) || 'nothing combines'}. So ${T(`${par(A, v)}${par(B, v)}=${polyT(res, v)}`)}.${d.tail || ''}`,
      run: async (c) => { for (let q = 0; q < rows.length; q++) await c.fadeIn(rows[q], 300, { from: 'translateX(-8px)' }); await c.pop(fin, 420); }
    });
    return steps;
  }
};

/* =====================================================================
   1c. Distribution, line by line (and Example 2(c))
   ===================================================================== */
function distLines(A, B, v) {
  const mul = A.map((a, i) => termT(a, v, i === 0) + par(B, v)).join('');
  const all = partials(A, B), res = collect(all), m = A.length, n = B.length;
  const neg = A.some((a, i) => i && a[0] < 0);
  const first = `${par(A, v)}${par(B, v)}`;
  return {
    t: first,
    lines: [
      [`=${mul}`, `each term of ${T(par(A, v))} multiplies the whole bracket`, `<b>Distribute:</b> each term of the first factor multiplies the <b>whole</b> second factor${neg ? ', and it keeps its sign' : ''}.`],
      [`=${polyT(all, v, { col: true })}`, `${T(`${m}\\times${n}=${m * n}`)} partial products`, `Multiply it out: <b>${m * n} partial products</b>, each coloured by its power of ${T(v)}. ${A.find((a) => a[0] < 0) ? `Signs: ${T(`${prodT(A.find((a) => a[0] < 0), B.find((b) => b[0] < 0) || B[0], v)}=${termT(mulT(A.find((a) => a[0] < 0), B.find((b) => b[0] < 0) || B[0]), v, true)}`)}.` : ''}`],
      [`=${groupedT(all, v, { col: true })}`, 'group the like terms', `<b>Group the like terms</b>: same colour, same power of ${T(v)}.`],
      [`=\\boldsymbol{${polyT(res, v)}}`, 'collect: simplest form', `Collect${collectSentence(all, v) ? ': ' + collectSentence(all, v) : ''}. Done: ${T(`${first}=${polyT(res, v)}`)}.`]
    ]
  };
}
const DIST = {
  n1: distLines([[2, 1], [-3, 0]], [[1, 2], [-4, 1], [1, 0]], 'x'),
  ex1: distLines([[3, 1], [4, 0]], [[1, 2], [3, 1], [2, 0]], 'x'),
  e2a: distLines([[1, 2], [-9, 0]], [[3, 3], [2, 1], [-7, 0]], 'x'),
  e2b: distLines([[3, 2], [-2, 1], [-5, 0]], [[1, 1], [-4, 0]], 'y'),
  e2c: {
    t: '3(b-5)(b^2-2b-4)-(5b-3)(5b+3)', lines: [
      ['(b-5)(b^2-2b-4)=b^3-2b^2-4b-5b^2+10b+20', 'six partial products', `Take it one piece at a time. <b>Binomial × trinomial</b> first: six partial products.`],
      ['=b^3-7b^2+6b+20', 'collect', `Collect: ${T('-2b^2-5b^2=-7b^2')} and ${T('-4b+10b=6b')}.`],
      ['3(b^3-7b^2+6b+20)=3b^3-21b^2+18b+60', 'now the 3', `Now the ${T('3')} in front multiplies <b>every</b> term.`],
      ['(5b-3)(5b+3)=25b^2-9', 'sum × difference (Lesson 3)', `The second product is a <b>sum times a difference</b> (Lesson 3): ${T('(5b)^2-3^2=25b^2-9')}.`],
      ['3b^3-21b^2+18b+60\\textcolor{#c93a33}{-}(25b^2-9)', 'subtract the WHOLE product', `<b>Subtract the whole product</b>: keep it in brackets. The minus sign will hit <b>both</b> of its terms.`],
      ['=3b^3-21b^2+18b+60-25b^2\\textcolor{#c93a33}{+9}', 'the minus flips every sign', `The minus flips <b>every</b> sign inside: ${T('-(25b^2-9)=-25b^2+9')}. The ${T('-9')} becomes ${T('+9')}.`],
      ['=\\boldsymbol{3b^3-46b^2+18b+69}', 'collect', `Collect: ${T('-21b^2-25b^2=-46b^2')} and ${T('60+9=69')}. Done.`]]
  }
};
const distribute = {
  title: 'Distribution, one line at a time',
  height: 500,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n1', label: tex('(2x-3)(x^2-4x+1)') }, { sep: 'Example 1 check:' }, { v: 'ex1', label: '(ii)' }, { sep: 'Example 2 check:' }, { v: 'e2a', label: '(a)' }, { v: 'e2b', label: '(b)' }, { v: 'e2c', label: '(c)' }],
  intro: (k) => `Expand ${T(DIST[k].t)} with the <b>distributive property</b>. Press <b>Next</b> for each line.`,
  make(stage, key, ex) {
    const W = ex.W, d = DIST[key], all = [[d.t, 'the question', '']].concat(d.lines), N = all.length;
    const lx = 26, ly = 18, lh = Math.min(84, (500 - 26) / N), nw = 252, nx = W - nw - 16;
    const rows = all.map(([t, note], i) => {
      const el = add(stage, h('div', 'ds-line' + (N > 6 ? ' tight' : ''), K(t)), lx, ly + i * lh); el.style.height = (lh - 8) + 'px'; el.style.maxWidth = (nx - lx - 12) + 'px'; shrinkToFit(el, nx - lx - 12);
      const n = add(stage, h('div', 'ds-note', `<div>${note}</div>`), nx, ly + i * lh); n.style.width = nw + 'px'; n.style.height = (lh - 14) + 'px';
      if (i) hide(el, n); else n.classList.add('start');
      return { el, n };
    });
    return d.lines.map(([, , cap], j) => ({
      cap,
      run: async (c) => {
        const r = rows[j + 1];
        rows.forEach((x) => x.el.classList.remove('now'));
        r.el.classList.add('now'); if (j === d.lines.length - 1) r.el.classList.add('final');
        await Promise.all([c.fadeIn(r.el, 420, { from: 'translateY(-10px)' }), c.fadeIn(r.n, 380, { delay: 200, from: 'translateX(10px)' })]);
      }
    }));
  }
};

/* =====================================================================
   2. The painted cube, revisited: (n − 2)(n − 2)(n − 2)
   ===================================================================== */
const core = {
  title: 'The painted cube in algebra',
  height: 452,
  minW: 880, // drawn this wide and scaled to fit beside the sidebar
  choices: [3, 4, 5, { v: 10, label: '10 (the big one)' }].map((n) => (typeof n === 'object' ? n : { v: n, label: `n = ${n}` })),
  intro: (n) => `An ${T('n\\times n\\times n')} cube, here ${T(`n=${n}`)}, is painted and cut up. How many small cubes have <b>no paint</b>? Find a formula.`,
  make(stage, n, ex) {
    const W = ex.W, cw = 400;
    const host = add(stage, h('div', 'co-host'), 14, 30);
    const st = cubeStack(host, [n, n, n], { w: cw, h: 370 });
    const nl = add(stage, h('div', 'co-n c', K(`n=${n}`)), 14 + cw / 2, 418);
    const px = cw + 50, pw = W - px - 16;
    const panel = add(stage, h('div', 'co-panel'), px, 20); panel.style.width = pw + 'px';
    const rows = [
      [`\\text{core}=(n-2)\\times(n-2)\\times(n-2)`, n > 2 ? `\\text{here: }${n - 2}\\times${n - 2}\\times${n - 2}=${fmt((n - 2) ** 3).replace(/ /g, '\\,')}` : ''],
      ['(n-2)(n-2)=n^2-4n+4', '\\text{a perfect square (Lesson 3)}'],
      ['(n-2)(n^2-4n+4)', '=n^3-4n^2+4n-2n^2+8n-8'],
      ['\\text{core}=\\boldsymbol{n^3-6n^2+12n-8}', ''],
      [`${n}^3-6(${n})^2+12(${n})-8`, `=${fmt(n ** 3).replace(/ /g, '\\,')}-${fmt(6 * n * n).replace(/ /g, '\\,')}+${12 * n}-8=\\boldsymbol{${fmt((n - 2) ** 3).replace(/ /g, '\\,')}}\\ \\checkmark`]
    ].map(([a, b], i) => { const r = h('div', 'co-row' + (i === 3 ? ' key' : ''), `<div>${K(a)}</div>${b ? `<div class="co-sub">${K(b)}</div>` : ''}`); panel.appendChild(r); hide(r); return r; });
    const cv = (n - 2) ** 3;
    return [{
      cap: `Every small cube on the <b>outside</b> touched paint. Peel one layer off <b>every</b> side: ${T(`${n}-2=${n - 2}`)} cube${n - 2 === 1 ? ' is' : 's are'} left each way${n > 2 ? `, so ${T(`${n - 2}\\times${n - 2}\\times${n - 2}=${fmt(cv).replace(/ /g, '\\,')}`)} ${cv === 1 ? 'has' : 'have'} no paint` : ''}.`,
      run: async (c) => { st.svg.classList.add('peel'); await c.sleep(c.fast ? 0 : 500); await c.fadeIn(rows[0], 400); }
    }, {
      cap: `With ${T('n')}: the core is ${T('(n-2)(n-2)(n-2)')}, <b>three binomials</b>. Step 1: multiply a pair. ${T('(n-2)^2=n^2-4n+4')}, a Lesson 3 perfect square.`,
      run: (c) => c.fadeIn(rows[1], 400)
    }, {
      cap: `Step 2: multiply that by the third ${T('(n-2)')}. It’s a <b>binomial × trinomial</b>: ${T('2\\times3=6')} partial products.`,
      run: (c) => c.fadeIn(rows[2], 400)
    }, {
      cap: `Collect: ${T('-4n^2-2n^2=-6n^2')} and ${T('4n+8n=12n')}. The unpainted core has ${T('n^3-6n^2+12n-8')} cubes.`,
      run: (c) => c.pop(rows[3], 420)
    }, {
      cap: `Check with ${T(`n=${n}`)}: the formula gives <b>${fmt(cv)}</b>, the same as counting the core. ✓${n === 10 ? ' That’s the big one: <b>512</b> of the 1000 cubes have no paint.' : ''}`,
      run: async (c) => { nl.classList.add('on'); await c.fadeIn(rows[4], 400); }
    }];
  }
};

/* =====================================================================
   2b. The box: volume built in two steps, then eight blocks
   ===================================================================== */
const BOX = { n1: [2, 3, 5], ex3: [3, 4, 6] }; // (x+p)(x+q)(x+r): length, width (depth), height
const KX = 0.55, KY = 0.36, XV = 6;
const box = {
  title: 'Volume = length × width × height, in two steps',
  height: 520,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n1', label: tex('(x+2)(x+3)(x+5)') }, { sep: 'Example 3 check:' }, { v: 'ex3', label: tex('(x+3)(x+4)(x+6)') }],
  intro: (k) => { const [p, q, r] = BOX[k]; return `A box is ${T(`(x+${p})`)} long, ${T(`(x+${q})`)} wide and ${T(`(x+${r})`)} high. Its volume is ${T(`V=(x+${p})(x+${q})(x+${r})`)}. Build it in <b>two steps</b>.`; },
  make(stage, key, ex) {
    const W = ex.W, [p, q, r] = BOX[key], L = XV + p, D = XV + q, Hh = XV + r, lift = 64;
    const areaW = 470, areaH = 500;
    const s = Math.min((areaW - 196) / (L + D * KX), (areaH - 120 - lift) / (Hh + D * KY));
    const ox = 104, oy = 30 + lift + (Hh + D * KY) * s;
    const P = (a, b, c) => [ox + (a + b * KX) * s, oy - (c + b * KY) * s];
    const pts = (arr) => arr.map((t) => P(...t).map((n) => n.toFixed(1)).join(',')).join(' ');
    const svg = svgEl('svg', { width: areaW, height: areaH, class: 'bx-svg' }); at(svg, 0, 0); stage.appendChild(svg);
    const block = (a0, a1, b0, b1, c0, c1, cls) => {
      const g = svgEl('g', { class: 'bx-b ' + (cls || '') });
      g.appendChild(svgEl('polygon', { class: 'bx-fr', points: pts([[a0, b0, c0], [a1, b0, c0], [a1, b0, c1], [a0, b0, c1]]) }));
      g.appendChild(svgEl('polygon', { class: 'bx-tp', points: pts([[a0, b0, c1], [a1, b0, c1], [a1, b1, c1], [a0, b1, c1]]) }));
      g.appendChild(svgEl('polygon', { class: 'bx-rt', points: pts([[a1, b0, c0], [a1, b1, c0], [a1, b1, c1], [a1, b0, c1]]) }));
      return g;
    };
    const lower = block(0, L, 0, D, 0, XV, 'lo'), upper = block(0, L, 0, D, XV, Hh, 'up');
    svg.append(lower, upper);
    // the 2 × 2 split of the top face (the base area), drawn on the upper slab
    const cellDef = [[0, XV, 0, XV, 2, 'x^2'], [XV, L, 0, XV, 1, `${p}x`], [0, XV, XV, D, 1, `${q}x`], [XV, L, XV, D, 0, String(p * q)]];
    const cells = cellDef.map(([a0, a1, b0, b1, e]) => { const pg = svgEl('polygon', { class: 'bx-cell', points: pts([[a0, b0, Hh], [a1, b0, Hh], [a1, b1, Hh], [a0, b1, Hh]]), fill: degBg(e), stroke: degCol(e) }); pg.style.opacity = 0; upper.appendChild(pg); return pg; });
    const cellsLo = cellDef.map(([a0, a1, b0, b1, e]) => { const pg = svgEl('polygon', { class: 'bx-cell', points: pts([[a0, b0, XV], [a1, b0, XV], [a1, b1, XV], [a0, b1, XV]]), fill: degBg(e), stroke: degCol(e) }); pg.style.opacity = 0; lower.appendChild(pg); return pg; });
    const outline = svgEl('path', { class: 'bx-out', d: `M${pts([[0, 0, 0], [L, 0, 0], [L, D, 0], [L, D, Hh], [0, D, Hh], [0, 0, Hh]]).replace(/ /g, ' L')} Z M${pts([[0, 0, Hh], [L, 0, Hh], [L, D, Hh]]).replace(/ /g, ' L')} M${pts([[L, 0, Hh], [L, 0, 0]]).replace(/ /g, ' L')}` });
    svg.appendChild(outline);
    // HTML labels; the upper layer moves with the upper slab
    const upLayer = add(stage, h('div', 'bx-layer'), 0, 0), loLayer = add(stage, h('div', 'bx-layer'), 0, 0);
    const lab = (layer, src, [x, y], cls = '') => { const e = h('div', 'bx-lab c ' + cls, K(src)); at(e, x, y); layer.appendChild(e); return e; };
    const mid = (a, b, c) => P(a, b, c);
    const cellLabs = cellDef.map(([a0, a1, b0, b1, e, t]) => { const [x, y] = mid((a0 + a1) / 2, (b0 + b1) / 2, Hh); const el = lab(upLayer, `\\textcolor{${degCol(e)}}{${t}}`, [x, y], 'cell'); hide(el); return el; });
    // edge labels: the piece sizes sit close to each edge, the whole binomial further out
    const nD = [KY, KX].map((t) => t / Math.hypot(KX, KY)); // outward normal of the depth edge (screen down-right)
    const along = (a, b, c, d) => { const [x, y] = mid(a, b, c); return [x + nD[0] * d, y + nD[1] * d]; };
    const [fx, fy] = mid(L / 2, 0, 0);
    const eL = lab(stage, `(x+${p})`, [fx, fy + 50], 'edge');
    const eD = lab(stage, `(x+${q})`, along(L, D / 2, 0, 62), 'edge');
    const [hx, hy] = mid(0, 0, Hh / 2); const eH = lab(stage, `(x+${r})`, [hx - 66, hy], 'edge');
    const subL = [lab(stage, 'x', [mid(XV / 2, 0, 0)[0], fy + 18], 'sub'), lab(stage, String(p), [mid(XV + p / 2, 0, 0)[0], fy + 18], 'sub')];
    const subD = [lab(stage, 'x', along(L, XV / 2, 0, 20), 'sub'), lab(stage, String(q), along(L, XV + q / 2, 0, 20), 'sub')];
    const subH = [lab(stage, 'x', [hx - 18, mid(0, 0, XV / 2)[1]], 'sub'), lab(upLayer, String(r), [hx - 18, mid(0, 0, XV + r / 2)[1]], 'sub')];
    hide(...subL, ...subD, ...subH);
    const ticks = svgEl('g', { class: 'bx-ticks' });
    [[[XV, 0, 0], [XV, 0, -0.6]], [[L, XV, 0], [L + 0.5, XV, -0.4]], [[0, 0, XV], [-0.6, 0, XV]]].forEach(([a, b]) => ticks.appendChild(svgEl('line', { x1: P(...a)[0], y1: P(...a)[1], x2: P(...b)[0], y2: P(...b)[1] })));
    ticks.style.opacity = 0; svg.appendChild(ticks);
    const base = `x^2+${p + q}x+${p * q}`;
    const lo = polyMul([[1, 2], [p + q, 1], [p * q, 0]], [[1, 1]]), hi = polyMul([[1, 2], [p + q, 1], [p * q, 0]], [[r, 0]]);
    const vol = collect(lo.concat(hi));
    const [lfx, lfy] = mid(L / 2, 0, XV / 2), [ufx, ufy] = mid(L / 2, 0, XV + r / 2);
    const slabLo = lab(loLayer, `x(${base})`, [lfx, lfy], 'slab'), slabHi = lab(upLayer, `${r}(${base})`, [ufx, ufy], 'slab');
    hide(slabLo, slabHi);
    // algebra panel
    const px = areaW + 14, pw = W - px - 14;
    const panel = add(stage, h('div', 'bx-panel'), px, 14); panel.style.width = pw + 'px';
    const row = (src, note, cls = '') => { const e = h('div', 'bx-row ' + cls, `<span class="bx-k">${note}</span>${K(src)}`); panel.appendChild(e); hide(e); return e; };
    const R1 = row(`(x+${p})(x+${q})=x^2+${q}x+${p}x+${p * q}=${base}`, 'Step 1 · base');
    const R2 = row(`V=(${base})(x+${r})`, 'Step 2 · × height');
    const R3 = row(`=x(${base})+${r}(${base})`, 'two layers');
    const R4 = row(`=${polyT(lo, 'x', { col: true })}+${polyT(hi, 'x', { col: true })}`, 'six products');
    const R5 = row(`V=\\boldsymbol{${polyT(vol, 'x')}}`, 'collect', 'key');
    // eight blocks
    const s2 = 8.6;
    const bsvg = svgEl('svg', { width: areaW, height: areaH, class: 'bx-svg8' }); at(bsvg, 0, 0); stage.appendChild(bsvg); bsvg.style.opacity = 0;
    const labs8 = [];
    const dimsA = [['x', XV], [String(p), p]], dimsB = [['x', XV], [String(q), q]], dimsC = [['x', XV], [String(r), r]];
    const order = [];
    dimsC.forEach((cc, ci) => dimsB.forEach((bb, bi) => dimsA.forEach((aa, ai) => order.push({ aa, bb, cc, ai, bi, ci }))));
    const prods8 = order.map(({ ai, bi, ci }) => { const e = (ai ? 0 : 1) + (bi ? 0 : 1) + (ci ? 0 : 1), cf = (ai ? p : 1) * (bi ? q : 1) * (ci ? r : 1); return [cf, e]; });
    const blocks8 = order.map((o, i) => {
      const slot = i % 4, rowI = Math.floor(i / 4), cx0 = 26 + slot * 112, cy0 = 182 + rowI * 214;
      const a = o.aa[1], b = o.bb[1], cc = o.cc[1];
      const Q = (x, y, z) => [cx0 + (x + y * KX) * s2, cy0 - (z + y * KY) * s2];
      const pp = (arr) => arr.map((t) => Q(...t).map((n) => n.toFixed(1)).join(',')).join(' ');
      const g = svgEl('g', { class: 'bx-b8' });
      g.appendChild(svgEl('polygon', { class: 'bx-fr', points: pp([[0, 0, 0], [a, 0, 0], [a, 0, cc], [0, 0, cc]]) }));
      g.appendChild(svgEl('polygon', { class: 'bx-tp', points: pp([[0, 0, cc], [a, 0, cc], [a, b, cc], [0, b, cc]]) }));
      g.appendChild(svgEl('polygon', { class: 'bx-rt', points: pp([[a, 0, 0], [a, b, 0], [a, b, cc], [a, 0, cc]]) }));
      const pr = prods8[i];
      g.querySelectorAll('polygon').forEach((pg) => pg.style.setProperty('--bc', degCol(pr[1])));
      g.style.opacity = 0; bsvg.appendChild(g);
      const lb = add(stage, h('div', 'bx-l8', `<span class="bx-dims">${K(`${o.aa[0]}\\cdot ${o.bb[0]}\\cdot ${o.cc[0]}`)}</span>${K(`\\textcolor{${degCol(pr[1])}}{${termT(pr, 'x', true)}}`)}`), cx0 + 42, cy0 + 14);
      lb.style.translate = '-50% 0'; hide(lb); labs8.push(lb);
      return g;
    });
    const h8a = add(stage, h('div', 'bx-h8', `bottom layer: height ${K('x')}`), 18, 40), h8b = add(stage, h('div', 'bx-h8', `top layer: height ${K(String(r))}`), 18, 254); hide(h8a, h8b);
    const R6 = row(`=${polyT(prods8, 'x', { col: true })}`, '8 blocks', 'b8');
    const moveUp = (c) => Promise.all([c.anim(upper, [{ transform: 'translateY(0)' }, { transform: `translateY(${-lift}px)` }], 650), c.anim(upLayer, [{ transform: 'translateY(0)' }, { transform: `translateY(${-lift}px)` }], 650)]);
    return [{
      cap: `<b>Step 1: the base.</b> Multiply two of the edges, ${T(`(x+${p})(x+${q})`)}: four rectangles, ${T(`x^2+${q}x+${p}x+${p * q}=${base}`)}. That’s the area of the top (and bottom).`,
      run: async (c) => {
        await Promise.all([c.anim(ticks, [{ opacity: 0 }, { opacity: 1 }], 300), ...subL.concat(subD).map((e, i) => c.fadeIn(e, 300, { delay: i * 80 }))]);
        await Promise.all(cells.map((pg, i) => Promise.all([c.anim(pg, [{ opacity: 0 }, { opacity: 1 }], 350, { delay: i * 160 }), c.pop(cellLabs[i], 320, { delay: i * 160 + 100 })])));
        await c.fadeIn(R1, 380);
      }
    }, {
      cap: `<b>Step 2: times the height.</b> The height ${T(`(x+${r})`)} cuts the box into two layers: one ${T('x')} high and one ${T(String(r))} high. Each layer is the base area times its height.`,
      run: async (c) => {
        svg.classList.add('split');
        await Promise.all([c.anim(outline, [{ opacity: 1 }, { opacity: 0 }], 300), c.anim(eH, [{ opacity: 1 }, { opacity: 0 }], 300), ...subH.map((e) => c.fadeIn(e, 300))]);
        await Promise.all([moveUp(c), ...cellsLo.map((pg) => c.anim(pg, [{ opacity: 0 }, { opacity: 1 }], 400, { delay: 250 })), c.fadeIn(R2, 380, { delay: 200 })]);
        await Promise.all([c.fadeIn(slabLo, 350), c.fadeIn(slabHi, 350), c.fadeIn(R3, 380, { delay: 150 })]);
      }
    }, {
      cap: `Distribute each layer: ${T(`x(${base})=${polyT(lo, 'x')}`)} and ${T(`${r}(${base})=${polyT(hi, 'x')}`)}. That’s a binomial × trinomial: <b>6</b> partial products.`,
      run: async (c) => {
        await Promise.all([c.anim(slabLo, [{ opacity: 1 }, { opacity: 0 }], 200), c.anim(slabHi, [{ opacity: 1 }, { opacity: 0 }], 200)]);
        slabLo.innerHTML = K(polyT(lo, 'x', { col: true })); slabHi.innerHTML = K(polyT(hi, 'x', { col: true }));
        await Promise.all([c.fadeIn(slabLo, 300), c.fadeIn(slabHi, 300), c.fadeIn(R4, 380, { delay: 150 })]);
      }
    }, {
      cap: `<b>Collect like terms</b>: ${collectSentence(lo.concat(hi), 'x')}. So ${T(`V=${polyT(vol, 'x')}`)}${key === 'ex3' ? ' cm³' : ''}.`,
      run: (c) => c.pop(R5, 420)
    }, {
      cap: `Cut the box along <b>every</b> line and it falls into ${T('2\\times2\\times2=8')} blocks, one for each way to pick a piece of each edge. Add the 8 blocks: the <b>same</b> volume.`,
      run: async (c) => {
        await Promise.all([c.anim(svg, [{ opacity: 1 }, { opacity: 0 }], 350), c.anim(upLayer, [{ opacity: 1 }, { opacity: 0 }], 350), c.anim(loLayer, [{ opacity: 1 }, { opacity: 0 }], 350),
          ...[eL, eD, ...subL, ...subD, subH[0]].map((e) => c.anim(e, [{ opacity: 1 }, { opacity: 0 }], 350))]);
        bsvg.style.opacity = 1;
        await Promise.all([c.fadeIn(h8a, 300), c.fadeIn(h8b, 300), ...blocks8.map((g, i) => Promise.all([c.anim(g, [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], 380, { delay: i * 140 }), c.fadeIn(labs8[i], 300, { delay: i * 140 + 120 })]))]);
        await c.fadeIn(R6, 380);
      }
    }];
  }
};

/* =====================================================================
   2c. Any pair first: three routes to the same product
   ===================================================================== */
const PAIRS = {
  easy: { F: [[[1, 1], [3, 0]], [[2, 1], [-5, 0]], [[2, 1], [5, 0]]], v: 'x', easy: 2 },
  ex4: { F: [[[1, 1], [-2, 0]], [[1, 1], [5, 0]], [[3, 1], [-1, 0]]], v: 'x' },
  ex3: { F: [[[1, 1], [3, 0]], [[1, 1], [4, 0]], [[1, 1], [6, 0]]], v: 'x' }
};
const ROUTES = [[[0, 1], 2], [[2, 0], 1], [[1, 2], 0]];
const pairs = {
  title: 'Which pair first? It doesn’t matter',
  height: 452,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'easy', label: tex('(x+3)(2x-5)(2x+5)') }, { sep: 'Example 3 check:' }, { v: 'ex3', label: tex('(x+3)(x+4)(x+6)') }, { sep: 'Example 4 check:' }, { v: 'ex4', label: tex('(x-2)(x+5)(3x-1)') }],
  intro: (k) => { const d = PAIRS[k]; return `Three binomials, ${T(d.F.map((f) => par(f, d.v)).join(''))}, can be paired up <b>three</b> different ways. Let’s try all three.`; },
  make(stage, key, ex) {
    const W = ex.W, d = PAIRS[key], { F, v } = d, gap = 14, cw = (W - 28 - 2 * gap) / 3;
    const cols = ROUTES.map(([[i, j], k], ci) => {
      const x = 14 + ci * (cw + gap);
      const el = add(stage, h('div', 'pr-col'), x, 14); el.style.width = cw + 'px';
      const P = polyMul(F[i], F[j]), allp = partials(P, F[k]), res = collect(allp);
      const easy = d.easy != null && ((i === 1 && j === 2) || (i === 2 && j === 1));
      el.innerHTML = `<div class="pr-h">Route ${ci + 1}${easy ? ' <span class="pr-star">easy pair</span>' : ''}</div><div class="pr-q">${K(`\\underbrace{${par(F[i], v)}${par(F[j], v)}}_{\\text{first}}${par(F[k], v)}`)}</div>`;
      const line = (src, cls = '') => { const e = h('div', 'pr-l ' + cls, K(src)); el.appendChild(e); hide(e); return e; };
      const l1 = line(`${par(F[i], v)}${par(F[j], v)}`, 'pair'); const l1b = line(`=${polyT(P, v)}`, 'pair2'); l1.appendChild(l1b); l1b.style.opacity = '';
      const l2 = line(`(${polyT(P, v)})${par(F[k], v)}`);
      const half = Math.ceil(allp.length / 2);
      const l3 = line(`=${polyT(allp.slice(0, half), v, { col: true })}`, 'small');
      const l3b = h('div', 'pr-cont', K(allp.slice(half).map((t) => termT(t, v, false, { col: true })).join(''))); l3.appendChild(l3b);
      const l4 = line(`=\\boldsymbol{${polyT(res, v)}}`, 'res');
      const st = h('div', 'xp-stamp ok', '✓'); el.appendChild(st); hide(st);
      return { el, l1, l2, l3, l4, st, P, allp, res, i, j, k, easy };
    });
    const R = cols[0].res;
    const fin = add(stage, h('div', 'pr-fin c', `All three routes: ${K(`\\boldsymbol{${polyT(R, v)}}`)}`), W / 2, 424); hide(fin);
    const pairCap = (cl) => `${T(`${par(F[cl.i], v)}${par(F[cl.j], v)}=${polyT(cl.P, v)}`)}${cl.easy ? ', a <b>sum times a difference</b> with only 2 terms' : ''}`;
    return [{
      cap: `<b>Route 1:</b> multiply the first two: ${pairCap(cols[0])}.`,
      run: (c) => { cols[0].el.classList.add('on'); return c.fadeIn(cols[0].l1, 380); }
    }, {
      cap: `Then multiply by the third factor: ${T(`${cols[0].P.length}\\times2=${cols[0].P.length * 2}`)} partial products. Collect: ${T(polyT(R, v))}.`,
      run: async (c) => { await c.fadeIn(cols[0].l2, 350); await c.fadeIn(cols[0].l3, 350); await c.pop(cols[0].l4, 400); }
    }, ...[1, 2].map((q) => ({
      cap: `<b>Route ${q + 1}:</b> pair a <b>different</b> two first: ${pairCap(cols[q])}. Then × ${T(par(F[cols[q].k], v))}${cols[q].P.length === 2 ? `: just ${T('2\\times2=4')} partial products` : ''}.`,
      run: async (c) => { cols.forEach((x, w) => x.el.classList.toggle('on', w === q)); for (const e of [cols[q].l1, cols[q].l2, cols[q].l3]) await c.fadeIn(e, 330); await c.pop(cols[q].l4, 400); }
    })), {
      cap: `All three routes give ${T(polyT(R, v))}. Multiplication is <b>commutative</b> and <b>associative</b>: pair the factors any way you like${d.easy != null ? ', so pick the <b>easiest</b> pair (here, the sum × difference)' : ', so pick whichever pair is easiest'}.`,
      run: async (c) => { cols.forEach((x) => { x.el.classList.remove('on'); x.el.classList.add('good'); }); await Promise.all(cols.map((x) => stampIn(c, x.st))); await c.fadeIn(fin, 400); }
    }];
  }
};

/* =====================================================================
   3. Check an expansion by substituting a number
   ===================================================================== */
const CHECKS = {
  ex1: { x: 2, v: 'x', o: '(3x+4)(x^2+3x+2)', oS: '(3(2)+4)((2)^2+3(2)+2)', oM: '(10)(12)', f: (x) => (3 * x + 4) * (x * x + 3 * x + 2),
    a: '3x^3+13x^2+18x+8', aS: '3(2)^3+13(2)^2+18(2)+8', aM: '24+52+36+8', g: (x) => 3 * x ** 3 + 13 * x * x + 18 * x + 8,
    who: 'FOIL only', w: '3x^3+4x^2+6x+8', wS: '3(2)^3+4(2)^2+6(2)+8', wM: '24+16+12+8', wf: (x) => 3 * x ** 3 + 4 * x * x + 6 * x + 8,
    why: 'FOIL found only 4 of the 6 partial products' },
  e2c: { x: 2, v: 'b', o: '3(b-5)(b^2-2b-4)-(5b-3)(5b+3)', oS: '3(-3)(4-4-4)-(7)(13)', oM: '36-91', f: (b) => 3 * (b - 5) * (b * b - 2 * b - 4) - (5 * b - 3) * (5 * b + 3),
    a: '3b^3-46b^2+18b+69', aS: '3(2)^3-46(2)^2+18(2)+69', aM: '24-184+36+69', g: (b) => 3 * b ** 3 - 46 * b * b + 18 * b + 69,
    who: 'Forgot to flip', w: '3b^3-46b^2+18b+51', wS: '3(2)^3-46(2)^2+18(2)+51', wM: '24-184+36+51', wf: (b) => 3 * b ** 3 - 46 * b * b + 18 * b + 51,
    why: `subtracting ${T('(25b^2-9)')} turns the ${T('-9')} into ${T('+9')}` },
  ex3: { x: 2, v: 'x', o: '(x+3)(x+4)(x+6)', oS: '(2+3)(2+4)(2+6)', oM: '(5)(6)(8)', f: (x) => (x + 3) * (x + 4) * (x + 6),
    a: 'x^3+13x^2+54x+72', aS: '(2)^3+13(2)^2+54(2)+72', aM: '8+52+108+72', g: (x) => x ** 3 + 13 * x * x + 54 * x + 72,
    who: 'Firsts and lasts only', w: 'x^3+72', wS: '(2)^3+72', wM: '8+72', wf: (x) => x ** 3 + 72,
    why: 'only 2 of the 8 blocks of the box were counted' },
  ex4: { x: 3, v: 'x', o: '(x-2)(x+5)(3x-1)', oS: '(3-2)(3+5)(9-1)', oM: '(1)(8)(8)', f: (x) => (x - 2) * (x + 5) * (3 * x - 1),
    a: '3x^3+8x^2-33x+10', aS: '3(3)^3+8(3)^2-33(3)+10', aM: '81+72-99+10', g: (x) => 3 * x ** 3 + 8 * x * x - 33 * x + 10,
    who: 'A sign slip', w: '3x^3+8x^2-33x-10', wS: '3(3)^3+8(3)^2-33(3)-10', wM: '81+72-99-10', wf: (x) => 3 * x ** 3 + 8 * x * x - 33 * x - 10,
    why: `the last product ${T('(-10)(-1)')} is ${T('+10')}, not ${T('-10')}`, note: `We test ${T('x=3')}: ${T('x=2')} makes ${T('x-2=0')}, so both sides would be 0. That still matches, but it tests less.` }
};
const fmtS = (n) => (n < 0 ? '−' : '') + fmt(Math.abs(n));
const tn = (n) => (n < 0 ? '-' : '') + fmt(Math.abs(n)).replace(/ /g, '\\,');
const check = {
  title: 'Check it with a number',
  value: 'ex1',
  height: 384,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ sep: 'Example 1:' }, { v: 'ex1', label: tex('(3x+4)(x^2+3x+2)') }, { sep: 'Example 2:' }, { v: 'e2c', label: '(c)' }, { sep: 'Example 3:' }, { v: 'ex3', label: '(b)' }, { sep: 'Example 4:' }, { v: 'ex4', label: '(a)' }],
  intro: (k) => { const d = CHECKS[k]; return `Is ${T(d.a)} really equal to ${T(d.o)}? Equal expressions give the <b>same number</b> for <b>every</b> value of ${T(d.v)}. Substitute one and see.`; },
  make(stage, key, ex) {
    const W = ex.W, d = CHECKS[key], cw = (W - 60) / 3, cy = 66;
    const pick = add(stage, h('div', 'ck-pick', `Test value: ${K(`${d.v}=${d.x}`)}`), 20, 12); hide(pick);
    const card = (i, head, e) => {
      const el = add(stage, h('div', 'ck-card', `<div class="ck-h">${head}</div><div class="ck-e">${K(e)}</div><div class="ck-s"></div><div class="ck-v"></div>`), 20 + i * (cw + 10), cy);
      el.style.width = cw + 'px'; return { el, s: el.querySelector('.ck-s'), v: el.querySelector('.ck-v') };
    };
    const C0 = card(0, 'Original', d.o), C1 = card(1, 'Expanded', d.a), C2 = card(2, d.who, d.w);
    const V0 = d.f(d.x), V1 = d.g(d.x), V2 = d.wf(d.x);
    const fill = (C, S, M, V) => { C.s.innerHTML = K(`=${S}`) + '<br>' + K(`=${M}`); C.v.innerHTML = K(`=\\boldsymbol{${tn(V)}}`); hide(C.s, C.v); };
    fill(C0, d.oS, d.oM, V0); fill(C1, d.aS, d.aM, V1); fill(C2, d.wS, d.wM, V2);
    const st1 = add(stage, h('div', 'xp-stamp ok', '✓'), 20 + 2 * cw + 10 - 60, cy + 8), st2 = add(stage, h('div', 'xp-stamp no', '✗'), 20 + 3 * cw + 20 - 60, cy + 8); hide(st1, st2);
    return [{
      cap: `Pick a test value: ${T(`${d.v}=${d.x}`)}. <b>2 or 3 beats 0 or 1</b>: those make powers collapse and can hide mistakes. ${d.note || ''}`,
      run: (c) => c.pop(pick, 380)
    }, {
      cap: `Substitute into the <b>original</b> (brackets first): ${T(d.o)} becomes <b>${fmtS(V0)}</b>.`,
      run: (c) => Promise.all([c.fadeIn(C0.s, 380), c.pop(C0.v, 400, { delay: 300 })])
    }, {
      cap: `Now the expansion: ${T(d.a)} also gives <b>${fmtS(V1)}</b>. The numbers <b>match</b> ✓, so the expansion checks out.`,
      run: async (c) => { await Promise.all([c.fadeIn(C1.s, 380), c.pop(C1.v, 400, { delay: 300 })]); C0.el.classList.add('good'); C1.el.classList.add('good'); await stampIn(c, st1); }
    }, {
      cap: `A wrong expansion, ${T(d.w)}, gives <b>${fmtS(V2)}</b>, not ${fmtS(V0)}. It <b>can’t</b> be equal to the original: ${d.why}.`,
      run: async (c) => { await Promise.all([c.fadeIn(C2.s, 380), c.pop(C2.v, 400, { delay: 300 })]); C2.el.classList.add('bad'); await stampIn(c, st2); }
    }];
  }
};

/* ============ static figure: the Example 3 prism ============ */
function mountPrism() {
  const host = document.getElementById('prism'); if (!host) return;
  const s = 15, KXp = 0.55, KYp = 0.36, L = 9, D = 10, Hh = 12, ox = 74, oy = 20 + (Hh + D * KYp) * s;
  const P = (a, b, c) => [ox + (a + b * KXp) * s, oy - (c + b * KYp) * s];
  const pts = (arr) => arr.map((t) => P(...t).map((n) => n.toFixed(1)).join(',')).join(' ');
  const W = 300, H = oy + 46;
  host.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="prism-svg">
    <polygon class="bx-fr" points="${pts([[0, 0, 0], [L, 0, 0], [L, 0, Hh], [0, 0, Hh]])}"/>
    <polygon class="bx-tp" points="${pts([[0, 0, Hh], [L, 0, Hh], [L, D, Hh], [0, D, Hh]])}"/>
    <polygon class="bx-rt" points="${pts([[L, 0, 0], [L, D, 0], [L, D, Hh], [L, 0, Hh]])}"/>
    <polyline class="hid" points="${pts([[0, 0, 0], [0, D, 0], [L, D, 0]])}"/><polyline class="hid" points="${pts([[0, D, 0], [0, D, Hh]])}"/></svg>
    <div class="pz-l" style="left:${P(L / 2, 0, 0)[0]}px;top:${oy + 8}px;translate:-50% 0">${T('(x+3)')} cm</div>
    <div class="pz-l" style="left:${P(L, D / 2, 0)[0] + 10}px;top:${P(L, D / 2, 0)[1] - 6}px">${T('(x+4)')} cm</div>
    <div class="pz-l" style="left:${ox - 10}px;top:${P(0, 0, Hh / 2)[1]}px;translate:-100% -50%">${T('(x+6)')} cm</div>`;
  host.style.height = H + 'px';
}

function mountReveals() {
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
  document.querySelectorAll('[data-showcube]').forEach((b) => b.addEventListener('click', () => { const [d, k] = b.dataset.showcube.split('|'); if (paintAPI) paintAPI.show(d.split(',').map(Number), k === '' ? null : Number(k)); }));
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { handshake, grid, distribute, core, box, pairs, check };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountPaint(); mountPrism(); mountReveals(); mountExplainers();
