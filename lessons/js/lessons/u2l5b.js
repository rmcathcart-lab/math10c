/* Math 10C · Unit 2 · Lesson 5B — Simplifying with Rational Exponents: the explainers and warm-up on this page. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};

/* ---------- colours (match site.css) ---------- */
const AM = '#c27a0e', TL = '#13807a', PU = '#8a58c9';
const col = (c, s) => `\\textcolor{${c}}{${s}}`;

/* ---------- fractions ---------- */
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
class F {
  constructor(n, d = 1) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; this.n = n / g; this.d = d / g; }
  add(o) { o = Fr(o); return new F(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Fr(o); return this.add(new F(-o.n, o.d)); }
  mul(o) { o = Fr(o); return new F(this.n * o.n, this.d * o.d); }
  get int() { return this.d === 1; }
  get v() { return this.n / this.d; }
}
const Fr = (x) => (x instanceof F ? x : typeof x === 'string' ? (x.includes('/') ? new F(...x.split('/').map(Number)) : new F(Number(x))) : new F(x));
const xp = (f) => (f.int ? String(f.n) : `${f.n}/${f.d}`); // exponent written with a slash, like the booklet
const fr = (f) => (f.int ? String(f.n) : `${f.n < 0 ? '-' : ''}\\frac{${Math.abs(f.n)}}{${f.d}}`);
const pw = (b, f) => (f.n === f.d ? b : `${b}^{${xp(f)}}`);
const big = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,'); // 531441 → 531\,441
const bigTxt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');

/* ---------- drawing helpers ---------- */
function line(stage, src, x, y, o = {}) {
  const el = add(stage, h('div', 'l5-line' + (o.cls ? ' ' + o.cls : ''), K(src)), x, y);
  if (o.fs) el.style.fontSize = o.fs + 'px';
  if (o.ht) el.style.height = o.ht + 'px';
  if (o.w) el.style.width = o.w + 'px';
  return el;
}
const show = (c, el, ms = 380, o = {}) => c.fadeIn(el, ms, Object.assign({ from: 'translateX(-10px)' }, o));
function arrow(svg, x1, y1, x2, y2, cls = '') {
  const g = svgEl('g', { class: 'l5-arr ' + cls });
  g.appendChild(svgEl('line', { x1, y1, x2: x2 - 8, y2 }));
  g.appendChild(svgEl('path', { d: `M${x2 - 12} ${y2 - 7} L${x2} ${y2} L${x2 - 12} ${y2 + 7} Z` }));
  svg.appendChild(g); return g;
}
const calcIcon = '<svg viewBox="0 0 24 24"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><rect x="8" y="5.5" width="8" height="4" rx="1"/></svg>';

/* ======================================================================
   1. Same law, now with fractions
   ====================================================================== */
const LAWS = {
  product: {
    name: 'Product Law', law: 'x^m\\cdot x^n=x^{m+n}',
    L: [['x^2\\cdot x^3=(x\\cdot x)(x\\cdot x\\cdot x)'], ['=x^{2+3}=x^5']],
    R: [['x^{1/2}\\cdot x^{1/3}=x^{\\frac12+\\frac13}'], ['=x^{\\frac36+\\frac26}', '\\tfrac12=\\tfrac36,\\ \\tfrac13=\\tfrac26'], ['=x^{5/6}=\\sqrt[6]{x^5}']],
    chk: 'x=64:\\quad 64^{1/2}\\cdot64^{1/3}=8\\cdot4=32\\qquad 64^{5/6}=\\left(\\sqrt[6]{64}\\right)^{5}=2^5=32\\ \\checkmark',
    caps: [
      `With whole-number exponents we can <b>count the factors</b>: two x’s and three more make <b>five</b>. Same base, multiplied: <b>add</b> the exponents.`,
      `With fractions we can’t count “half an x”, but the <b>law still works</b>: add the exponents, ${tex('\\tfrac12+\\tfrac13')}.`,
      `To add fractions, get a <b>common denominator</b>. The LCD of 2 and 3 is 6: ${tex('\\tfrac12=\\tfrac36')} and ${tex('\\tfrac13=\\tfrac26')}.`,
      `Add the tops: ${tex('\\tfrac36+\\tfrac26=\\tfrac56')}. In radical form the <b>denominator is the index</b>: ${tex('x^{5/6}=\\sqrt[6]{x^5}')}.`,
      `<b>Check</b> with ${tex('x=64')}: both sides give <b>32</b>. The Product Law holds with fractions.`
    ]
  },
  quotient: {
    name: 'Quotient Law', law: 'x^m\\div x^n=x^{m-n}',
    L: [['x^5\\div x^2=\\dfrac{x\\cdot x\\cdot x\\cdot x\\cdot x}{x\\cdot x}'], ['=x^{5-2}=x^3']],
    R: [['x^{3/4}\\div x^{1/2}=x^{\\frac34-\\frac12}'], ['=x^{\\frac34-\\frac24}', '\\tfrac12=\\tfrac24'], ['=x^{1/4}=\\sqrt[4]{x}']],
    chk: 'x=16:\\quad 16^{3/4}\\div16^{1/2}=8\\div4=2\\qquad 16^{1/4}=2\\ \\checkmark',
    caps: [
      `Two of the five x’s <b>cancel</b>, leaving <b>three</b>. Same base, divided: <b>subtract</b> the exponents.`,
      `With fractions: still <b>subtract</b>, ${tex('\\tfrac34-\\tfrac12')}.`,
      `Common denominator <b>4</b>: ${tex('\\tfrac12=\\tfrac24')}.`,
      `${tex('\\tfrac34-\\tfrac24=\\tfrac14')}, so the answer is ${tex('x^{1/4}=\\sqrt[4]{x}')}.`,
      `<b>Check</b> with ${tex('x=16')}: both sides give <b>2</b>.`
    ]
  },
  power: {
    name: 'Power of a Power Law', law: '(x^m)^n=x^{mn}',
    L: [['(x^2)^3=x^2\\cdot x^2\\cdot x^2'], ['=x^{2\\times3}=x^6']],
    R: [['\\left(x^{2/3}\\right)^{3/4}=x^{\\frac23\\times\\frac34}'], ['=x^{\\frac{2\\times3}{3\\times4}}=x^{\\frac{6}{12}}', '\\text{top}\\times\\text{top},\\ \\text{bottom}\\times\\text{bottom}'], ['=x^{1/2}=\\sqrt{x}']],
    chk: 'x=64:\\quad \\left(64^{2/3}\\right)^{3/4}=16^{3/4}=8\\qquad 64^{1/2}=8\\ \\checkmark',
    caps: [
      `Three copies of ${tex('x^2')} is ${tex('2+2+2=2\\times3')} x’s. A power of a power: <b>multiply</b> the exponents.`,
      `With fractions: still <b>multiply</b>, ${tex('\\tfrac23\\times\\tfrac34')}.`,
      `Multiplying fractions needs <b>no</b> common denominator: top × top, bottom × bottom gives ${tex('\\tfrac{6}{12}')}.`,
      `<b>Simplify</b> the exponent: ${tex('\\tfrac{6}{12}=\\tfrac12')}, so the answer is ${tex('x^{1/2}=\\sqrt{x}')}.`,
      `<b>Check</b> with ${tex('x=64')}: both sides give <b>8</b>.`
    ]
  },
  prod: {
    name: 'Power of a Product Law', law: '(xy)^m=x^my^m',
    L: [['(x^2y)^3=x^2y\\cdot x^2y\\cdot x^2y'], ['=x^{2\\times3}y^{1\\times3}=x^6y^3']],
    R: [['\\left(x^{1/2}y^{3}\\right)^{2/3}=x^{\\frac12\\times\\frac23}\\,y^{3\\times\\frac23}'], ['=x^{\\frac26}\\,y^{\\frac63}', '3=\\tfrac31'], ['=x^{1/3}y^{2}=y^2\\sqrt[3]{x}']],
    chk: 'x=64,\\ y=2:\\quad \\left(8\\cdot8\\right)^{2/3}=64^{2/3}=16\\qquad 64^{1/3}\\cdot2^2=4\\cdot4=16\\ \\checkmark',
    caps: [
      `The power goes to <b>every factor</b> inside the bracket: each exponent is multiplied by 3.`,
      `With fractions: <b>every</b> factor gets the power ${tex('\\tfrac23')}. Multiply each exponent by ${tex('\\tfrac23')}.`,
      `Multiply across. A whole number is a fraction over 1: ${tex('3\\times\\tfrac23=\\tfrac31\\times\\tfrac23=\\tfrac63')}.`,
      `Simplify each: ${tex('\\tfrac26=\\tfrac13')} and ${tex('\\tfrac63=2')}. So ${tex('x^{1/3}y^2=y^2\\sqrt[3]{x}')}.`,
      `<b>Check</b> with ${tex('x=64,\\ y=2')}: both sides give <b>16</b>.`
    ]
  },
  quot: {
    name: 'Power of a Quotient Law', law: '\\left(\\dfrac{x}{y}\\right)^m=\\dfrac{x^m}{y^m}',
    L: [['\\left(\\dfrac{x^3}{y}\\right)^2=\\dfrac{x^3}{y}\\cdot\\dfrac{x^3}{y}'], ['=\\dfrac{x^{3\\times2}}{y^{1\\times2}}=\\dfrac{x^6}{y^2}']],
    R: [['\\left(\\dfrac{x^3}{y^{1/2}}\\right)^{2/3}=\\dfrac{x^{3\\times\\frac23}}{y^{\\frac12\\times\\frac23}}'], ['=\\dfrac{x^{6/3}}{y^{2/6}}', '\\text{simplify both}'], ['=\\dfrac{x^2}{y^{1/3}}=\\dfrac{x^2}{\\sqrt[3]{y}}']],
    chk: 'x=4,\\ y=64:\\quad \\left(\\tfrac{64}{8}\\right)^{2/3}=8^{2/3}=4\\qquad \\tfrac{4^2}{\\sqrt[3]{64}}=\\tfrac{16}{4}=4\\ \\checkmark',
    caps: [
      `The power goes to the <b>top and the bottom</b>: multiply each exponent by 2.`,
      `With fractions: top and bottom both get the power ${tex('\\tfrac23')}.`,
      `Multiply across: ${tex('3\\times\\tfrac23=\\tfrac63')} and ${tex('\\tfrac12\\times\\tfrac23=\\tfrac26')}.`,
      `Simplify: ${tex('\\tfrac63=2')} and ${tex('\\tfrac26=\\tfrac13')}. The answer is ${tex('\\dfrac{x^2}{\\sqrt[3]{y}}')}.`,
      `<b>Check</b> with ${tex('x=4,\\ y=64')}: both sides give <b>4</b>.`
    ]
  },
  neg: {
    name: 'Negative Exponent Law', law: 'x^{-m}=\\dfrac{1}{x^m}',
    L: [['x^{-3}=\\dfrac{1}{x^3}'], ['x^{-3}\\cdot x^{3}=x^{0}=1']],
    R: [['x^{-1/2}=\\dfrac{1}{x^{1/2}}'], ['=\\dfrac{1}{\\sqrt{x}}', '\\text{then convert}'], ['x^{-1/2}\\cdot x^{1/2}=x^{0}=1']],
    chk: 'x=25:\\quad 25^{-1/2}=\\dfrac{1}{\\sqrt{25}}=\\dfrac15=0.2\\ \\checkmark',
    caps: [
      `A negative exponent means <b>reciprocal</b>: ${tex('x^{-3}')} is 1 over ${tex('x^3')}. Together they make ${tex('x^0=1')}.`,
      `Fraction or not, the negative sign just <b>flips</b> the power to the other side of the fraction bar.`,
      `Then convert: ${tex('x^{1/2}=\\sqrt{x}')}, so ${tex('x^{-1/2}=\\dfrac{1}{\\sqrt{x}}')}.`,
      `Same reason as before: ${tex('x^{-1/2}\\cdot x^{1/2}=x^{0}=1')}, so they are reciprocals.`,
      `<b>Check</b> with ${tex('x=25')}: ${tex('25^{-1/2}=\\tfrac15')}. <b>Negative exponent, positive answer.</b>`
    ]
  },
  w1: {
    name: 'Product Law', law: 'x^m\\cdot x^n=x^{m+n}',
    L: [['10^1\\cdot10^1=10^{1+1}'], ['=10^2=100\\ \\ \\text{(shaking)}']],
    R: [['10^{3/2}\\cdot10^{3/2}=10^{\\frac32+\\frac32}'], ['=10^{\\frac62}', '\\text{same denominator already}'], ['=10^{3}=1\\,000']],
    chk: '10^{3/2}\\approx31.62:\\quad 31.62\\times31.62\\approx1\\,000\\ \\checkmark',
    caps: [
      `Warm-up, Question 2: two steps of shaking is ${tex('10^1\\cdot10^1=10^2=100')}.`,
      `Two steps of <b>energy</b>: ${tex('10^{3/2}\\cdot10^{3/2}')}. Same base, so <b>add</b> the exponents.`,
      `The denominators already match: ${tex('\\tfrac32+\\tfrac32=\\tfrac62')}.`,
      `${tex('\\tfrac62=3')}, so ${tex('10^{3}=1\\,000')} times the energy.`,
      `<b>Check</b>: ${tex('10^{3/2}\\approx31.62')}, and ${tex('31.62\\times31.62\\approx1\\,000')}.`
    ]
  },
  w2: {
    name: 'Power of a Power Law', law: '(x^m)^n=x^{mn}',
    L: [['\\left(10^{1}\\right)^2=10^{1\\times2}'], ['=10^2=100\\ \\ \\text{(shaking)}']],
    R: [['\\left(10^{3/2}\\right)^{2}=10^{\\frac32\\times2}'], ['=10^{\\frac32\\times\\frac21}=10^{\\frac62}', '2=\\tfrac21'], ['=10^{3}=1\\,000']],
    chk: '10^{3/2}\\approx31.62:\\quad 31.62^2\\approx1\\,000\\ \\checkmark',
    caps: [
      `Two steps of shaking, as a power of a power: ${tex('\\left(10^1\\right)^2=10^2=100')}.`,
      `Two steps of <b>energy</b>: ${tex('10^{3/2}')} squared. A power of a power: <b>multiply</b> the exponents.`,
      `A whole number is a fraction over 1: ${tex('\\tfrac32\\times\\tfrac21=\\tfrac62')}.`,
      `${tex('\\tfrac62=3')}: the same ${tex('10^{3}=1\\,000')} as the Product Law gave. Two laws, one answer.`,
      `<b>Check</b>: ${tex('31.62^2\\approx1\\,000')}.`
    ]
  }
};
const laws = {
  title: 'Same law, now with fractions',
  height: 460,
  choices: [{ v: 'product', label: 'Product' }, { v: 'quotient', label: 'Quotient' }, { v: 'power', label: 'Power of a power' }, { v: 'prod', label: 'Power of a product' },
    { v: 'quot', label: 'Power of a quotient' }, { v: 'neg', label: 'Negative' }, { sep: 'Warm-up check:' }, { v: 'w1', label: tex('10^{3/2}\\cdot10^{3/2}') }, { v: 'w2', label: tex('\\left(10^{3/2}\\right)^{2}') }],
  intro: (v) => `<b>${LAWS[v].name}.</b> First with whole-number exponents, then the <b>same law</b> with fractions. Press <b>Next</b>.`,
  make(stage, v, ex) {
    const W = ex.W, L = LAWS[v];
    add(stage, h('div', 'lw-ban c', `<span class="lw-name">${L.name}</span>${K(L.law)}`), W / 2, 50);
    const pw2 = (W - 48) / 2, py = 102, ph = 262;
    const mk = (x, cls, head, rows) => {
      const p = add(stage, h('div', 'lw-panel ' + cls, `<div class="lw-h">${head}</div>`), x, py); p.style.width = pw2 + 'px'; p.style.height = ph + 'px';
      return rows.map(([src, help]) => {
        const r = h('div', 'lw-row', `<span class="lw-t">${K(src)}</span>${help ? `<span class="lw-help">${K(help)}</span>` : ''}`); p.appendChild(r); hide(r); return r;
      });
    };
    const lr = mk(16, 'int', 'Whole-number exponents', L.L), rr = mk(32 + pw2, 'frac', 'Fraction exponents', L.R);
    const chk = add(stage, h('div', 'lw-chk', `<span class="lw-chk-h">Check</span>${K(L.chk)}`), 16, py + ph + 14); chk.style.width = (W - 32) + 'px'; hide(chk);
    return [
      { cap: L.caps[0], run: async (c) => { await show(c, lr[0]); await show(c, lr[1], 380, { delay: 250 }); } },
      { cap: L.caps[1], run: (c) => show(c, rr[0]) },
      { cap: L.caps[2], run: (c) => show(c, rr[1], 450) },
      { cap: L.caps[3], run: async (c) => { await c.pop(rr[2], 450); rr[2].classList.add('lw-win'); } },
      { cap: L.caps[4], run: (c) => c.fadeIn(chk, 400) }
    ];
  }
};

/* ======================================================================
   2. The exponent-law stepper (Example 1, Example 3 d–e)
   ====================================================================== */
const LAW = {
  P: ['Product Law', 'x^m\\cdot x^n=x^{m+n}', 'add'],
  Q: ['Quotient Law', 'x^m\\div x^n=x^{m-n}', 'subtract'],
  PP: ['Power of a Power', '(x^m)^n=x^{mn}', 'multiply'],
  PR: ['Power of a Product', '(xy)^m=x^my^m', 'multiply'],
  PQ: ['Power of a Quotient', '\\left(\\tfrac{x}{y}\\right)^m=\\tfrac{x^m}{y^m}', 'multiply'],
  N: ['Negative Exponent Law', 'x^{-m}=\\tfrac{1}{x^m}', 'flip'],
  NF: ['Negative exponent: flip', '\\left(\\tfrac{x}{y}\\right)^{-m}=\\left(\\tfrac{y}{x}\\right)^{m}', 'flip'],
  RP: ['Radical → power', '\\sqrt[n]{x^m}=x^{m/n}', 'convert']
};
const CASES = {
  t1: { q: 'a^{2/3}\\cdot a^{1/2}', s: [
    { cap: `Same base <b>a</b>, multiplied: <b>Product Law</b>. Add the exponents.`, law: 'P', line: '=a^{\\frac23+\\frac12}' },
    { cap: `Add the fractions with a <b>common denominator</b> of 6: ${tex('\\tfrac46+\\tfrac36=\\tfrac76')}.`, fw: ['\\tfrac23+\\tfrac12', '=\\tfrac46+\\tfrac36', '=\\tfrac76'], line: '=a^{7/6}' },
    { cap: `Positive exponent ✓. Radical form: the <b>denominator 6</b> is the index, the <b>numerator 7</b> is the power.`, line: `=\\sqrt[${col(TL, 6)}]{a^{${col(AM, 7)}}}`, final: true }] },
  t2: { q: 'k^{5/6}\\div k^{1/3}', s: [
    { cap: `Same base <b>k</b>, divided: <b>Quotient Law</b>. Subtract the exponents.`, law: 'Q', line: '=k^{\\frac56-\\frac13}' },
    { cap: `Common denominator 6: ${tex('\\tfrac13=\\tfrac26')}. Then ${tex('\\tfrac56-\\tfrac26=\\tfrac36')}, which <b>simplifies</b> to ${tex('\\tfrac12')}.`, fw: ['\\tfrac56-\\tfrac13', '=\\tfrac56-\\tfrac26', '=\\tfrac36=\\tfrac12'], line: '=k^{1/2}' },
    { cap: `A power of ${tex('\\tfrac12')} is a <b>square root</b> (index 2 is not written).`, line: '=\\sqrt{k}', final: true }] },
  a: { q: 'w^{5/4}\\times w', s: [
    { cap: `Same base <b>w</b>, multiplied: <b>Product Law</b>. A plain ${tex('w')} means ${tex('w^1')}.`, law: 'P', line: '=w^{5/4}\\times w^{1}' },
    { cap: `Add the exponents. Write 1 with the same denominator: ${tex('1=\\tfrac44')}, so ${tex('\\tfrac54+\\tfrac44=\\tfrac94')}.`, fw: ['\\tfrac54+1', '=\\tfrac54+\\tfrac44', '=\\tfrac94'], line: '=w^{\\frac54+1}=w^{9/4}' },
    { cap: `Positive exponent ✓. In radical form, the <b>denominator 4</b> is the index and the <b>numerator 9</b> is the power: ${tex('\\sqrt[4]{w^9}')}.`, line: `=\\sqrt[${col(TL, 4)}]{w^{${col(AM, 9)}}}`, final: true }] },
  b: { q: 't^{1/4}\\div t^{7/4}', s: [
    { cap: `Same base <b>t</b>, divided: <b>Quotient Law</b>. Subtract the exponents.`, law: 'Q', line: '=t^{\\frac14-\\frac74}' },
    { cap: `Same denominators already: ${tex('\\tfrac14-\\tfrac74=-\\tfrac64')}, which simplifies to ${tex('-\\tfrac32')}.`, fw: ['\\tfrac14-\\tfrac74', '=-\\tfrac64', '=-\\tfrac32'], line: '=t^{-6/4}=t^{-3/2}' },
    { cap: `A <b>negative</b> exponent isn’t finished. <b>Negative Exponent Law</b>: flip it below the fraction bar.`, law: 'N', line: '=\\dfrac{1}{t^{3/2}}' },
    { cap: `Radical form: index 2 (not written), power 3: ${tex('t^{3/2}=\\sqrt{t^3}')}.`, line: '=\\dfrac{1}{\\sqrt{t^3}}', final: true }] },
  c: { q: '\\left(b^{1/3}\\right)^{3/5}', s: [
    { cap: `A power of a power: <b>multiply</b> the exponents.`, law: 'PP', line: '=b^{\\frac13\\times\\frac35}' },
    { cap: `Top × top, bottom × bottom: ${tex('\\tfrac{3}{15}')}. Simplify: ${tex('\\tfrac{3}{15}=\\tfrac15')}.`, fw: ['\\tfrac13\\times\\tfrac35', '=\\tfrac{1\\times3}{3\\times5}', '=\\tfrac{3}{15}=\\tfrac15'], line: '=b^{3/15}=b^{1/5}' },
    { cap: `Numerator 1, denominator 5: a <b>fifth root</b> of ${tex('b')}.`, line: '=\\sqrt[5]{b}', final: true }] },
  d: { q: '\\left(\\dfrac{r^2}{s}\\right)^{-1/3}', s: [
    { cap: `Deal with the negative first: a negative power of a fraction <b>flips the fraction</b> and makes the exponent positive.`, law: 'NF', line: '=\\left(\\dfrac{s}{r^2}\\right)^{1/3}' },
    { cap: `<b>Power of a Quotient</b>: top and bottom each get ${tex('\\tfrac13')}. ${tex('s=s^1')}, and ${tex('2\\times\\tfrac13=\\tfrac23')}.`, law: 'PQ', fw: ['1\\times\\tfrac13=\\tfrac13', '2\\times\\tfrac13=\\tfrac23'], line: '=\\dfrac{s^{1/3}}{r^{2/3}}' },
    { cap: `Positive exponents ✓. Radical form: both are cube roots, ${tex('\\sqrt[3]{s}')} on top and ${tex('\\sqrt[3]{r^2}')} below.`, line: '=\\dfrac{\\sqrt[3]{s}}{\\sqrt[3]{r^2}}', final: true }] },
  e: { q: '6c^{5/6}\\times2c^{-1/3}', s: [
    { cap: `Numbers with numbers, ${tex('c')}’s with ${tex('c')}’s. Multiply the coefficients and <b>add</b> the exponents (Product Law).`, law: 'P', line: '=(6\\times2)\\,c^{\\frac56+\\left(-\\frac13\\right)}' },
    { cap: `${tex('6\\times2=12')}. Adding ${tex('-\\tfrac13')} is subtracting: ${tex('\\tfrac56-\\tfrac26=\\tfrac36=\\tfrac12')}.`, fw: ['\\tfrac56+\\left(-\\tfrac13\\right)', '=\\tfrac56-\\tfrac26', '=\\tfrac36=\\tfrac12'], line: '=12c^{1/2}' },
    { cap: `Only the ${tex('c')} goes under the root: ${tex('12c^{1/2}=12\\sqrt{c}')}.`, line: '=12\\sqrt{c}', final: true }] },
  f: { q: '\\dfrac{7d^{4/5}}{49d^{-3/5}}', s: [
    { cap: `Divide the coefficients and <b>subtract</b> the exponents (Quotient Law): top exponent minus bottom exponent.`, law: 'Q', line: '=\\dfrac{7}{49}\\,d^{\\frac45-\\left(-\\frac35\\right)}' },
    { cap: `${tex('\\tfrac{7}{49}=\\tfrac17')}. Subtracting a negative is <b>adding</b>: ${tex('\\tfrac45+\\tfrac35=\\tfrac75')}.`, fw: ['\\tfrac45-\\left(-\\tfrac35\\right)', '=\\tfrac45+\\tfrac35', '=\\tfrac75'], line: '=\\dfrac17\\,d^{7/5}=\\dfrac{d^{7/5}}{7}' },
    { cap: `Radical form: fifth root, power 7. The <b>7 below</b> is just a number: it stays outside the root.`, line: '=\\dfrac{\\sqrt[5]{d^7}}{7}', final: true }] },
  g: { q: '\\left(27e^{1/2}\\right)^{4/3}', s: [
    { cap: `<b>Power of a Product</b>: the ${tex('\\tfrac43')} goes to <b>both</b> factors, the 27 included.`, law: 'PR', line: '=27^{4/3}\\,e^{\\frac12\\times\\frac43}' },
    { cap: `The number: take the <b>root first</b>. ${tex('\\sqrt[3]{27}=3')}, then ${tex('3^4=81')}.`, fw: ['27^{4/3}=\\left(\\sqrt[3]{27}\\right)^4', '=3^4=81'], line: '=81\\,e^{\\frac12\\times\\frac43}' },
    { cap: `The variable: ${tex('\\tfrac12\\times\\tfrac43=\\tfrac46=\\tfrac23')}.`, fw: ['\\tfrac12\\times\\tfrac43=\\tfrac46=\\tfrac23'], line: '=81e^{2/3}' },
    { cap: `Radical form: only ${tex('e')} goes under the cube root: ${tex('81\\sqrt[3]{e^2}')}.`, line: '=81\\sqrt[3]{e^2}', final: true }] },
  e3d: { q: '\\left(\\sqrt[3]{x^7}\\right)\\left(\\sqrt[3]{x^2}\\right)', s: [
    { cap: `Write each radical as a power first: <b>exponent over index</b>.`, law: 'RP', line: '=x^{7/3}\\cdot x^{2/3}' },
    { cap: `Same base, multiplied: <b>add</b> the exponents. ${tex('\\tfrac73+\\tfrac23=\\tfrac93')}.`, law: 'P', fw: ['\\tfrac73+\\tfrac23', '=\\tfrac93=3'], line: '=x^{9/3}' },
    { cap: `${tex('\\tfrac93=3')}, a whole number. The answer is simply ${tex('x^3')}.`, line: '=x^{3}', final: true }] },
  e3e: { q: '3\\sqrt{x}\\times2\\sqrt[3]{x}', s: [
    { cap: `Radicals to powers: ${tex('\\sqrt{x}=x^{1/2}')} and ${tex('\\sqrt[3]{x}=x^{1/3}')}.`, law: 'RP', line: '=3x^{1/2}\\times2x^{1/3}' },
    { cap: `Multiply the coefficients and <b>add</b> the exponents.`, law: 'P', line: '=(3\\times2)\\,x^{\\frac12+\\frac13}' },
    { cap: `${tex('3\\times2=6')}, and with LCD 6: ${tex('\\tfrac36+\\tfrac26=\\tfrac56')}. That’s the form ${tex('ax^n')}.`, fw: ['\\tfrac12+\\tfrac13', '=\\tfrac36+\\tfrac26', '=\\tfrac56'], line: '=6x^{5/6}', final: true }] }
};
const stepper = {
  title: 'The exponent-law stepper',
  height: 470,
  choices: [{ v: 't1', label: tex(CASES.t1.q) }, { v: 't2', label: tex(CASES.t2.q) },
    { sep: 'Example 1:' }, ...'abcdefg'.split('').map((k) => ({ v: k, label: `(${k})` })),
    { sep: 'Example 3:' }, { v: 'e3d', label: '(d)' }, { v: 'e3e', label: '(e)' }],
  intro: (v) => `Simplify ${tex(CASES[v].q)}. Which law? Then do the <b>fraction arithmetic</b> on the exponents.`,
  make(stage, v, ex) {
    const W = ex.W, H = 470, C = CASES[v], lh = 80, fs = 30, x0 = 26, rx = Math.round(W * 0.57), rw = W - rx - 20;
    const q = line(stage, C.q, x0, 16, { fs: 34, ht: lh }); q.classList.add('st-q');
    let y = 16 + lh;
    const lawBox = add(stage, h('div', 'st-law'), rx, 16); lawBox.style.width = rw + 'px';
    lawBox.innerHTML = '<div class="st-law-h">Law</div><div class="st-law-b muted">Which law?</div>';
    const fwBox = add(stage, h('div', 'st-fw', '<div class="st-fw-h">Exponent work</div>'), rx, 134); fwBox.style.width = rw + 'px'; fwBox.style.height = (H - 150) + 'px';
    const fwList = h('div', 'st-fw-l'); fwBox.appendChild(fwList);
    const shownFw = [];
    return C.s.map((st) => {
      let el = null, fws = [];
      if (st.line) { el = line(stage, st.line, x0, y, { fs, ht: lh }); hide(el); y += lh; }
      if (st.fw) fws = st.fw.map((s) => { const r = h('div', 'st-fw-r', K(s)); fwList.appendChild(r); hide(r); return r; });
      return {
        cap: st.cap,
        run: async (c) => {
          if (st.law) {
            const [nm, f] = LAW[st.law];
            lawBox.innerHTML = `<div class="st-law-h">Law</div><div class="st-law-b"><b>${nm}</b>${K(f)}</div>`;
            await c.pop(lawBox.lastChild, 420);
          }
          if (fws.length) {
            shownFw.forEach((r) => r.classList.add('old'));
            for (const r of fws) { await c.fadeIn(r, 380, { from: 'translateY(8px)' }); shownFw.push(r); await c.sleep(260); }
          }
          if (el) {
            if (st.final) { await c.pop(el, 480); el.classList.add('st-final'); }
            else await show(c, el, 420);
          }
        }
      };
    });
  }
};

/* ======================================================================
   3 & 5. Root machines: a root of a root is one root
   ====================================================================== */
const MC = {
  n64: { q: '\\sqrt{\\sqrt[3]{64}}', inp: '64', mid: '4', out: '2', m1: ['\\sqrt[3]{\\square}', '1/3', 'cube root'], m2: ['\\sqrt{\\square}', '1/2', 'square root'],
    w1: '\\sqrt[3]{64}=4', w2: '\\sqrt{4}=2', mul: '\\tfrac13\\times\\tfrac12=\\tfrac16', mg: ['\\sqrt[6]{\\square}', '1/6'], res: '\\sqrt{\\sqrt[3]{64}}=64^{1/6}=2', chk: `Check: ${tex('2^6=64')} ✓` },
  n512: { q: '\\sqrt[3]{\\sqrt[3]{512}}', inp: '512', mid: '8', out: '2', m1: ['\\sqrt[3]{\\square}', '1/3', 'cube root'], m2: ['\\sqrt[3]{\\square}', '1/3', 'cube root'],
    w1: '\\sqrt[3]{512}=8', w2: '\\sqrt[3]{8}=2', mul: '\\tfrac13\\times\\tfrac13=\\tfrac19', mg: ['\\sqrt[9]{\\square}', '1/9'], res: '\\sqrt[3]{\\sqrt[3]{512}}=512^{1/9}=2', chk: `Check: ${tex('2^9=512')} ✓` },
  n125: { q: '\\dfrac{1}{\\sqrt[3]{125}}', inp: '125', mid: '5', out: '\\tfrac15', m1: ['\\sqrt[3]{\\square}', '1/3', 'cube root'], m2: ['\\dfrac{1}{\\square}', '-1', '“1 over”'],
    w1: '\\sqrt[3]{125}=5', w2: '\\tfrac{1}{5}', mul: '\\tfrac13\\times(-1)=-\\tfrac13', mg: ['\\dfrac{1}{\\sqrt[3]{\\square}}', '-1/3'], res: '\\dfrac{1}{\\sqrt[3]{125}}=125^{-1/3}=\\dfrac15', chk: `A root in the denominator became a <b>negative exponent</b>.` },
  e2a: { q: '\\sqrt{\\sqrt{2401}}', inp: '2401', mid: '49', out: '7', m1: ['\\sqrt{\\square}', '1/2', 'square root'], m2: ['\\sqrt{\\square}', '1/2', 'square root'],
    w1: '\\sqrt{2401}=49', w2: '\\sqrt{49}=7', mul: '\\tfrac12\\times\\tfrac12=\\tfrac14', mg: ['\\sqrt[4]{\\square}', '1/4'], res: '\\sqrt{\\sqrt{2401}}=2401^{1/4}=7', chk: `Check: ${tex('7^2=49')} and ${tex('49^2=2401')}, so ${tex('7^4=2401')} ✓` },
  e2b: { q: '\\dfrac{1}{\\sqrt{361}}', inp: '361', mid: '19', out: '\\tfrac{1}{19}', m1: ['\\sqrt{\\square}', '1/2', 'square root'], m2: ['\\dfrac{1}{\\square}', '-1', '“1 over”'],
    w1: '\\sqrt{361}=19', w2: '\\tfrac{1}{19}', mul: '\\tfrac12\\times(-1)=-\\tfrac12', mg: ['\\dfrac{1}{\\sqrt{\\square}}', '-1/2'], res: '\\dfrac{1}{\\sqrt{361}}=361^{-1/2}=\\dfrac{1}{19}', chk: `Check: ${tex('19^2=361')} ✓ A root underneath became a <b>negative exponent</b>.` },
  e2c: { q: '\\sqrt[3]{\\sqrt{729}}', inp: '729', mid: '27', out: '3', m1: ['\\sqrt{\\square}', '1/2', 'square root'], m2: ['\\sqrt[3]{\\square}', '1/3', 'cube root'],
    w1: '\\sqrt{729}=27', w2: '\\sqrt[3]{27}=3', mul: '\\tfrac12\\times\\tfrac13=\\tfrac16', mg: ['\\sqrt[6]{\\square}', '1/6'], res: '\\sqrt[3]{\\sqrt{729}}=729^{1/6}=3', chk: `Check: ${tex('3^6=\\left(3^3\\right)^2=27^2=729')} ✓` },
  v3: { q: '\\sqrt{\\sqrt{x^3}}', inp: 'x^3', mid: 'x^{3/2}', out: 'x^{3/4}', m1: ['\\sqrt{\\square}', '1/2', 'square root'], m2: ['\\sqrt{\\square}', '1/2', 'square root'],
    w1: '\\sqrt{x^3}=x^{3/2}', w2: '\\sqrt{x^{3/2}}=x^{\\frac32\\times\\frac12}=x^{3/4}', mul: '\\tfrac12\\times\\tfrac12=\\tfrac14', mg: ['\\sqrt[4]{\\square}', '1/4'], res: '\\sqrt{\\sqrt{x^3}}=\\left(x^3\\right)^{1/4}=x^{3/4}', chk: `Both ways give ${tex('x^{3/4}')}.` },
  v64: { q: '\\sqrt{\\sqrt[3]{64x^{12}}}', inp: '64x^{12}', mid: '4x^{4}', out: '2x^{2}', m1: ['\\sqrt[3]{\\square}', '1/3', 'cube root'], m2: ['\\sqrt{\\square}', '1/2', 'square root'],
    w1: '\\sqrt[3]{64x^{12}}=4x^{12/3}=4x^4', w2: '\\sqrt{4x^4}=2x^{4/2}=2x^2', mul: '\\tfrac13\\times\\tfrac12=\\tfrac16', mg: ['\\sqrt[6]{\\square}', '1/6'], res: '\\left(64x^{12}\\right)^{1/6}=64^{1/6}x^{12/6}=2x^{2}', chk: `${tex('2^6=64')} and ${tex('\\tfrac{12}{6}=2')}. Both ways give ${tex('2x^2')}.` },
  e4a: { q: '\\sqrt{\\sqrt{k^5}}', inp: 'k^5', mid: 'k^{5/2}', out: 'k^{5/4}', m1: ['\\sqrt{\\square}', '1/2', 'square root'], m2: ['\\sqrt{\\square}', '1/2', 'square root'],
    w1: '\\sqrt{k^5}=k^{5/2}', w2: '\\sqrt{k^{5/2}}=k^{\\frac52\\times\\frac12}=k^{5/4}', mul: '\\tfrac12\\times\\tfrac12=\\tfrac14', mg: ['\\sqrt[4]{\\square}', '1/4'], res: '\\sqrt{\\sqrt{k^5}}=\\left(k^5\\right)^{1/4}=k^{5/4}', chk: `Indices multiply, ${tex('2\\times2=4')}. Both ways give ${tex('k^{5/4}')}.` },
  e4b: { q: '\\sqrt{\\sqrt[3]{729w^9}}', inp: '729w^9', mid: '9w^{3}', out: '3w^{3/2}', m1: ['\\sqrt[3]{\\square}', '1/3', 'cube root'], m2: ['\\sqrt{\\square}', '1/2', 'square root'],
    w1: '\\sqrt[3]{729w^9}=9w^{9/3}=9w^3', w2: '\\sqrt{9w^3}=3w^{3/2}', mul: '\\tfrac13\\times\\tfrac12=\\tfrac16', mg: ['\\sqrt[6]{\\square}', '1/6'], res: '\\left(729w^9\\right)^{1/6}=729^{1/6}w^{9/6}=3w^{3/2}', chk: `${tex('3^6=729')} and ${tex('\\tfrac96=\\tfrac32')}. Both ways give ${tex('3w^{3/2}')}.` },
  e4c: { q: '\\left(\\sqrt[4]{k^6y^{10}}\\right)^{3/2}', inp: 'k^6y^{10}', mid: 'k^{3/2}y^{5/2}', out: 'k^{9/4}y^{15/4}', m1: ['\\sqrt[4]{\\square}', '1/4', 'fourth root'], m2: ['(\\square)^{3/2}', '3/2', 'power of 3/2'], cap3: `Each operation is a <b>power</b>: the fourth root is the power ${tex('\\tfrac14')}, and the outside power is ${tex('\\tfrac32')}.`,
    w1: '\\sqrt[4]{k^6y^{10}}=k^{6/4}y^{10/4}=k^{3/2}y^{5/2}', w2: 'k^{\\frac32\\times\\frac32}y^{\\frac52\\times\\frac32}=k^{9/4}y^{15/4}', mul: '\\tfrac14\\times\\tfrac32=\\tfrac38', mg: ['(\\square)^{3/8}', '3/8'], res: '\\left(k^6y^{10}\\right)^{3/8}=k^{18/8}y^{30/8}=k^{9/4}y^{15/4}', chk: `Both ways give ${tex('k^{9/4}y^{15/4}')}. Inside out keeps the fractions smaller.` }
};
function machinesDef(title, choices) {
  return {
    title, height: 460, choices,
    intro: (v) => `${tex(MC[v].q)}: two operations in a row. Watch what each one does, then <b>merge</b> them into one power.`,
    make(stage, v, ex) {
      const W = ex.W, D = MC[v], y1 = 152, y2 = 336;
      add(stage, h('div', 'mc-q c', K(D.q)), W / 2, 50);
      const xs = [0.085, 0.285, 0.5, 0.715, 0.915].map((f) => Math.round(W * f));
      const svg = add(stage, svgEl('svg', { class: 'mc-svg', width: W, height: 460 }), 0, 0);
      const mach = (x, y, d, cls = '') => {
        const m = add(stage, h('div', 'mc c ' + cls, `<div class="mc-op">${K(d[0])}</div><div class="mc-pw">${K('(\\;)^{' + d[1] + '}')}</div>`), x, y);
        return { m, pw: m.querySelector('.mc-pw') };
      };
      const tok = (src, x, y, cls = '') => add(stage, h('div', 'mc-tk c ' + cls, K(src)), x, y);
      const a = [[xs[0] + 50, xs[1] - 80], [xs[1] + 80, xs[2] - 62], [xs[2] + 62, xs[3] - 80], [xs[3] + 80, xs[4] - 54]].map(([p, r]) => arrow(svg, p, y1, r, y1));
      const M1 = mach(xs[1], y1, D.m1), M2 = mach(xs[3], y1, D.m2);
      hide(M1.pw, M2.pw);
      const tIn = tok(D.inp, xs[0], y1), tMid = tok(D.mid, xs[2], y1), tOut = tok(D.out, xs[4], y1, 'out');
      hide(tMid, tOut); a.slice(1).forEach((g) => g.classList.add('dim'));
      add(stage, h('div', 'mc-lab c', 'inner'), xs[1], y1 + 72); add(stage, h('div', 'mc-lab c', 'outer'), xs[3], y1 + 72);
      // merged row
      const row2 = [arrow(svg, xs[1] + 52, y2, xs[2] - 96, y2), arrow(svg, xs[2] + 96, y2, xs[3] - 52, y2)];
      const r2lab = add(stage, h('div', 'mc-r2 c', 'One power'), xs[0], y2);
      const tIn2 = tok(D.inp, xs[1], y2), MG = mach(xs[2], y2, D.mg, 'merged'), tOut2 = tok(D.out, xs[3], y2, 'out');
      const mul = add(stage, h('div', 'mc-mul c', K(D.mul)), xs[2], y1 + 98);
      const res = add(stage, h('div', 'mc-res c', K(D.res)), W / 2, 424);
      hide(r2lab, tIn2, MG.m, tOut2, mul, res); row2.forEach((g) => (g.style.opacity = 0));
      const feed = async (c, from, M, outTok, arrs) => {
        const g = tok(from.dataset.src || '', 0, 0); g.innerHTML = from.innerHTML; at(g, parseFloat(from.style.left), parseFloat(from.style.top)); g.classList.add('ghost');
        const dx = parseFloat(M.m.style.left) - parseFloat(from.style.left);
        arrs[0].classList.remove('dim');
        try { await c.anim(g, [{ transform: 'translateX(0) scale(1)', opacity: 1 }, { transform: `translateX(${dx}px) scale(.5)`, opacity: 0 }], 650); } finally { g.remove(); }
        await c.anim(M.m, [{ transform: 'scale(1)' }, { transform: 'scale(1.08) rotate(-1.5deg)' }, { transform: 'scale(1.04) rotate(1.5deg)' }, { transform: 'scale(1)' }], 420);
        arrs[1].classList.remove('dim');
        await c.pop(outTok, 420);
      };
      return [
        { cap: `Work from the <b>inside out</b>. The inner ${D.m1[2]} acts first: ${tex(D.w1)}.`, run: (c) => feed(c, tIn, M1, tMid, [a[0], a[1]]) },
        { cap: `Then the outer ${D.m2[2]}: ${tex(D.w2)}.`, run: (c) => feed(c, tMid, M2, tOut, [a[2], a[3]]) },
        { cap: D.cap3 || `Each operation is a <b>power</b>: the ${D.m1[2]} is the power ${tex(D.m1[1].replace(/^(-?)(\d+)\/(\d+)$/, '$1\\tfrac{$2}{$3}'))} and the ${D.m2[2]} is the power ${tex(D.m2[1].replace(/^(-?)(\d+)\/(\d+)$/, '$1\\tfrac{$2}{$3}'))}.`,
          run: (c) => Promise.all([c.pop(M1.pw, 400), c.pop(M2.pw, 400, { delay: 200 })]) },
        { cap: `Two powers in a row is a <b>power of a power</b>, so <b>multiply</b>: ${tex(D.mul)}. <b>One</b> machine does both jobs.`,
          run: async (c) => {
            await c.pop(mul, 420);
            await Promise.all([c.fadeIn(r2lab, 300), c.fadeIn(tIn2, 300), c.anim(row2[0], [{ opacity: 0 }, { opacity: 1 }], 300), c.pop(MG.m, 480, { delay: 200 })]);
            await c.anim(row2[1], [{ opacity: 0 }, { opacity: 1 }], 250);
            await c.pop(tOut2, 420);
          } },
        { cap: `As a single power: ${tex(D.res)}. ${D.chk}`, run: (c) => c.pop(res, 480) }
      ];
    }
  };
}
const machinesNum = machinesDef('Root machines: a root of a root is one root', [{ v: 'n64', label: tex(MC.n64.q) }, { v: 'n512', label: tex(MC.n512.q) }, { v: 'n125', label: tex('\\tfrac{1}{\\sqrt[3]{125}}') },
  { sep: 'Example 2 check:' }, { v: 'e2a', label: '(a)' }, { v: 'e2b', label: '(b)' }, { v: 'e2c', label: '(c)' }]);
const machinesVar = machinesDef('Nested roots with variables: inside out, or one power', [{ v: 'v3', label: tex(MC.v3.q) }, { v: 'v64', label: tex(MC.v64.q) },
  { sep: 'Example 4 check:' }, { v: 'e4a', label: '(a)' }, { v: 'e4b', label: '(b)' }, { v: 'e4c', label: '(c)' }]);

/* ======================================================================
   4. Writing a radical in the form ax^n
   ====================================================================== */
const SPL = { t1: [2, 25, 3], t2: [3, 8, 5], t3: [4, 81, 2], a: [3, 64, 8], b: [4, 16, 6], c: [2, 400, 1] }; // [index, number, exponent of x]
const radT = (n, inner) => (n === 2 ? `\\sqrt{${inner}}` : `\\sqrt[${n}]{${inner}}`);
const xPow = (e) => (e === 1 ? 'x' : `x^{${e}}`);
const NTH = { 2: 'squared', 3: 'cubed', 4: 'to the 4th power', 5: 'to the 5th power' };
const split = {
  title: 'Split off the number, keep the variable',
  height: 470,
  choices: [{ v: 't1', label: tex('\\sqrt{25x^3}') }, { v: 't2', label: tex('\\sqrt[3]{8x^5}') }, { v: 't3', label: tex('\\sqrt[4]{81x^2}') },
    { sep: 'Example 3 check:' }, { v: 'a', label: '(a)' }, { v: 'b', label: '(b)' }, { v: 'c', label: '(c)' }],
  intro: (v) => { const [n, c, e] = SPL[v]; return `Write ${tex(radT(n, c + xPow(e)))} in the form ${tex('ax^n')}: a whole-number coefficient times a power of ${tex('x')}.`; },
  make(stage, v, ex) {
    const W = ex.W, [n, c, e] = SPL[v], a = Math.round(Math.pow(c, 1 / n)), E = new F(e, n), Eraw = `${e}/${n}`;
    const cN = (s) => col(AM, s), cX = (s) => col(TL, s);
    const x0 = 28, lh = 78, fs = 34;
    line(stage, radT(n, cN(c) + cX(xPow(e))), x0, 18, { fs: 40, ht: lh });
    const L1 = line(stage, `=${cN(`${c}^{1/${n}}`)}\\cdot ${cX(`x^{${Eraw}}`)}`, x0, 18 + lh, { fs, ht: lh });
    const L2 = line(stage, `=${cN(a)}\\cdot ${cX(E.int ? xPow(E.n) : `x^{${xp(E)}}`)}`, x0, 18 + 2 * lh, { fs, ht: lh });
    const fin = E.int ? `${a}${xPow(E.n)}` : `${a}x^{${xp(E)}}`;
    const L3 = line(stage, `=${fin}`, x0, 18 + 3 * lh, { fs: 40, ht: lh, cls: 'sp-fin' });
    const tags = add(stage, h('div', 'sp-tags', `<span class="sp-tag"><b class="am">a = ${a}</b> ${tex('\\in I')}</span><span class="sp-tag"><b class="tl">n = ${E.int ? E.n : E.n + '/' + E.d}</b> ${tex('\\in Q')}</span>`), x0 + 8, 18 + 4 * lh + 4);
    hide(L1, L2, L3, tags);
    const rx = Math.round(W * 0.52), rw = W - rx - 20;
    const nb = add(stage, h('div', 'sp-box nb', `<div class="sp-h am">Number part</div><div class="sp-q">Which number ${NTH[n]} is ${c}?</div>`), rx, 18); nb.style.width = rw + 'px';
    const tl = h('div', 'sp-tiles'); nb.appendChild(tl);
    const ks = []; for (let k = Math.max(1, a - 3); k <= a + 1; k++) ks.push(k);
    const tiles = ks.map((k) => { const t = h('div', 'sp-tile' + (k === a ? ' hit' : ''), K(`${k}^{${n}}=${fmt(Math.pow(k, n))}`)); tl.appendChild(t); hide(t); return t; });
    const vb = add(stage, h('div', 'sp-box vb', `<div class="sp-h tl">Variable part</div>`), rx, 196); vb.style.width = rw + 'px';
    const vl = h('div', 'sp-v', K(e === 1 ? `x=x^{1}\\ \\Rightarrow\\ x^{1/${n}}` : `\\dfrac{\\text{exponent}}{\\text{index}}=\\dfrac{${e}}{${n}}${E.d !== n || E.int ? '=' + (E.int ? E.n : `\\dfrac{${E.n}}{${E.d}}`) : ''}`)); vb.appendChild(vl); hide(vl);
    const xv = 2, lhs = Math.pow(c * Math.pow(xv, e), 1 / n), rhs = a * Math.pow(xv, E.v);
    const d5 = (z) => (Math.abs(z - Math.round(z)) < 1e-9 ? String(Math.round(z)) : z.toFixed(5).replace(/0+$/, '') + '…');
    const chk = add(stage, h('div', 'sp-chk', `<span class="sp-h">${calcIcon} Check</span><span class="sp-sub">with ${tex('x=2')}</span><br>${K(`${radT(n, `${c}\\cdot${e === 1 ? '2' : `2^{${e}}`}`)}\\approx${d5(lhs)}`)}<br>${K(`${fin.replace(/x/g, '\\cdot 2')}\\approx${d5(rhs)}\\ \\checkmark`)}`), rx, 330); chk.style.width = rw + 'px';
    hide(chk);
    const simp = !E.int && E.d !== n;
    return [
      { cap: `The ${n === 2 ? 'square' : n === 3 ? 'cube' : n === 4 ? 'fourth' : n + 'th'} root is the power ${tex(`\\tfrac{1}{${n}}`)}, and it applies to <b>both</b> factors: the <b class="am">number</b> and the <b class="tl">variable</b>.`, run: (c) => show(c, L1, 420) },
      { cap: `<b class="am">Number part:</b> which number ${NTH[n]} gives ${c}? ${tex(`${a}^{${n}}=${fmt(c)}`)}, so ${tex(`${c}^{1/${n}}=${a}`)}.`,
        run: async (c) => { for (const t of tiles) await c.fadeIn(t, 260, { from: 'translateY(6px)' }); await c.sleep(150); await c.pop(tiles[ks.indexOf(a)], 380); } },
      { cap: e === 1 ? `<b class="tl">Variable part:</b> ${tex('x')} means ${tex('x^1')}, so it becomes ${tex(`x^{1/${n}}`)}.`
        : `<b class="tl">Variable part:</b> exponent over index, ${tex(`\\tfrac{${e}}{${n}}`)}. ${simp ? `It <b>simplifies</b> to ${tex(E.int ? String(E.n) : `\\tfrac{${E.n}}{${E.d}}`)}.` : E.int ? `That’s a whole number, ${E.n}.` : 'It doesn’t simplify, and an improper fraction is fine.'}`,
        run: async (c) => { await c.fadeIn(vl, 400); await show(c, L2, 420); } },
      { cap: `So ${tex(radT(n, c + xPow(e)) + '=' + fin)}: <b>a = ${a}</b> is an integer and <b>n = ${E.int ? E.n : E.n + '/' + E.d}</b> is rational.`,
        run: async (c) => { await c.pop(L3, 460); await c.fadeIn(tags, 380); } },
      { cap: `<b>Check</b> by substituting ${tex('x=2')} into both forms: both give about <b>${d5(lhs)}</b>`, run: (c) => c.fadeIn(chk, 420) }
    ];
  }
};

/* ======================================================================
   6. Root first keeps the numbers small
   ====================================================================== */
const RF = { t1: [16, '3/4'], t2: [125, '2/3'], t3: [32, '-3/5'], g: [27, '4/3'], e5: [8, '2/3'] };
const rootFirst = {
  title: 'Evaluating a number power: root first',
  height: 430,
  choices: [{ v: 't1', label: tex('16^{3/4}') }, { v: 't2', label: tex('125^{2/3}') }, { v: 't3', label: tex('32^{-3/5}') },
    { sep: 'Example 1(g) check:' }, { v: 'g', label: tex('27^{4/3}') }, { sep: 'Example 5(a) check:' }, { v: 'e5', label: tex('8^{2/3}') }],
  intro: (v) => `How do we evaluate ${tex(`${RF[v][0]}^{${RF[v][1]}}`)} without a calculator? There are two orders. Which is easier?`,
  make(stage, v, ex) {
    const W = ex.W, [b, ps] = RF[v], p = Fr(ps), m = Math.abs(p.n), q = p.d, neg = p.n < 0, r = Math.round(Math.pow(b, 1 / q));
    const rm = Math.pow(r, m), bm = BigInt(b) ** BigInt(m), rt = q === 2 ? '\\sqrt' : `\\sqrt[${q}]`;
    const P = `${b}^{${neg ? '-' : ''}${m}/${q}}`, Pm = `${b}^{${m}/${q}}`;
    add(stage, h('div', 'rf-q c', K(P)), 110, 52);
    const eq = add(stage, h('div', 'rf-eq', K(`${neg ? `=\\dfrac{1}{${Pm}}\\quad` : ''}${Pm}=\\left(${b}^{1/${q}}\\right)^{${m}}=\\left(${b}^{${m}}\\right)^{1/${q}}`)), 210, 28); hide(eq);
    const cw = (W - 60) / 2, cy = 112;
    const colL = add(stage, h('div', 'rf-col good', `<div class="rf-h">Root first</div>`), 20, cy), colR = add(stage, h('div', 'rf-col bad', `<div class="rf-h">Power first</div>`), 40 + cw, cy);
    [colL, colR].forEach((e) => { e.style.width = cw + 'px'; });
    const row = (col, src) => { const e = h('div', 'rf-row', K(src)); col.appendChild(e); hide(e); return e; };
    const l1 = row(colL, `${rt}{${b}}=${r}`), l2 = row(colL, `${r}^{${m}}=${big(rm)}`);
    const r1 = row(colR, `${b}^{${m}}=${big(bm)}`), r2 = row(colR, `${rt}{${big(bm)}}=${big(rm)}`);
    const meter = (col, n, cls) => {
      const w = Math.max(10, Math.min(100, (Math.log10(Number(n)) / Math.log10(Number(bm))) * 100));
      const e = h('div', 'rf-meter ' + cls, `<div class="rf-m-l">biggest number: <b>${bigTxt(n)}</b></div><div class="rf-bar"><i style="width:${w}%"></i></div>`); col.appendChild(e); hide(e); return e;
    };
    const mL = meter(colL, Math.max(b, rm), 'good'), mR = meter(colR, bm, 'bad');
    const fin = add(stage, h('div', 'rf-fin c', K(neg ? `${P}=\\dfrac{1}{${Pm}}=\\dfrac{1}{${rm}}` : `${P}=${rm}`)), W / 2, 392); hide(fin);
    return [
      { cap: `${neg ? `First the negative: ${tex(`${P}=\\dfrac{1}{${Pm}}`)}. ` : ''}${tex(`\\tfrac{${m}}{${q}}=\\tfrac{1}{${q}}\\times${m}=${m}\\times\\tfrac{1}{${q}}`)}: a power of a power works in <b>either order</b>. Root then power, or power then root.`, run: (c) => c.fadeIn(eq, 420) },
      { cap: `<b>Root first:</b> ${tex(`${rt}{${b}}=${r}`)}, then ${tex(`${r}^{${m}}=${big(rm)}`)}. Small numbers: you can do it in your head.`, run: async (c) => { await show(c, l1); await show(c, l2, 380, { delay: 150 }); } },
      { cap: `<b>Power first:</b> ${tex(`${b}^{${m}}=${big(bm)}`)}, then ${tex(`${rt}{${big(bm)}}`)}… Same answer, ${tex(big(rm))}, but the numbers got much bigger on the way.`, run: async (c) => { await show(c, r1); await show(c, r2, 380, { delay: 150 }); } },
      { cap: `The biggest number each way: <b>${bigTxt(Math.max(b, rm))}</b> versus <b>${bigTxt(bm)}</b>. <b>Take the root first</b> and the numbers stay small.`, run: (c) => Promise.all([c.fadeIn(mL, 400), c.fadeIn(mR, 400, { delay: 150 })]) },
      { cap: neg ? `The negative exponent just puts it under 1: ${tex(`${P}=\\dfrac{1}{${rm}}`)}. Negative exponent, <b>positive</b> answer.` : `So ${tex(`${P}=${rm}`)}.`, run: (c) => c.pop(fin, 460) }
    ];
  }
};

/* ======================================================================
   6. Multi-law chains: one base at a time, colour-coded lanes
   ====================================================================== */
const LCOL = { n: AM, x: TL, y: PU, a: TL, b: PU };
const LN = {
  e5a: { vars: ['x', 'y'], q: () => `\\left(${col(AM, 8)}${col(TL, 'x^{6}')}${col(PU, 'y^{-3}')}\\right)^{2/3}\\cdot ${col(TL, 'x^{-1/2}')}`,
    terms: [{ c: 8, e: { x: 6, y: -3 }, p: '2/3', side: 1 }, { c: 1, e: { x: '-1/2' }, p: '1', side: 1 }] },
  e5b: { vars: ['a', 'b'], q: () => `\\dfrac{\\left(${col(AM, 81)}${col(TL, 'a^{-8}')}${col(PU, 'b^{2}')}\\right)^{1/4}}{${col(AM, 3)}${col(TL, 'a^{-1/2}')}}`,
    terms: [{ c: 81, e: { a: -8, b: 2 }, p: '1/4', side: 1 }, { c: 3, e: { a: '-1/2' }, p: '1', side: -1 }] },
  t1: { vars: ['x', 'y'], q: () => `\\left(${col(AM, 16)}${col(TL, 'x^{4}')}${col(PU, 'y^{-8}')}\\right)^{3/4}\\cdot ${col(PU, 'y^{1/2}')}`,
    terms: [{ c: 16, e: { x: 4, y: -8 }, p: '3/4', side: 1 }, { c: 1, e: { y: '1/2' }, p: '1', side: 1 }] },
  t2: { vars: ['a', 'b'], q: () => `\\left(${col(AM, 125)}${col(TL, 'a^{-3}')}${col(PU, 'b^{6}')}\\right)^{2/3}\\div ${col(AM, 5)}${col(TL, 'a^{1/2}')}`,
    terms: [{ c: 125, e: { a: -3, b: 6 }, p: '2/3', side: 1 }, { c: 5, e: { a: '1/2' }, p: '1', side: -1 }] }
};
function coefPow(c, p) { // c^p with c a perfect power → { val: F, tex }
  if (p.n === p.d) return { val: new F(c), tex: String(c) };
  const m = Math.abs(p.n), q = p.d, r = Math.round(Math.pow(c, 1 / q)), rm = Math.pow(r, m), rt = q === 1 ? '' : q === 2 ? `\\sqrt{${c}}` : `\\sqrt[${q}]{${c}}`;
  let s = q === 1 ? `${c}^{${m}}` : m === 1 ? rt : `\\left(${rt}\\right)^{${m}}`;
  s += m === 1 || q === 1 ? `=${rm}` : `=${r}^{${m}}=${rm}`;
  if (p.n < 0) s = `${c}^{${xp(p)}}=\\dfrac{1}{${c}^{${xp(new F(m, q))}}}=\\dfrac{1}{${rm}}`;
  return { val: p.n < 0 ? new F(1, rm) : new F(rm), tex: s };
}
const ftex = (f) => (f.int ? String(f.n) : `\\tfrac{${f.n}}{${f.d}}`);
function lanesPlan(D) {
  const T = D.terms.map((t) => ({ c: t.c, e: Object.fromEntries(Object.entries(t.e).map(([k, v]) => [k, Fr(v)])), p: Fr(t.p), side: t.side }));
  const br = T.filter((t) => t.p.n !== t.p.d), loose = T.filter((t) => t.p.n === t.p.d);
  const p = br[0].p;
  // after the bracket
  const after = T.map((t) => ({ side: t.side, cv: coefPow(t.c, t.p), e: Object.fromEntries(Object.entries(t.e).map(([k, v]) => [k, v.mul(t.p)])) }));
  // combine
  let coef = new F(1); after.forEach((t) => { coef = t.side > 0 ? coef.mul(t.cv.val) : coef.mul(new F(t.cv.val.d, t.cv.val.n)); });
  const res = {};
  const comb = {};
  D.vars.forEach((v) => {
    const parts = after.filter((t) => t.e[v]).map((t) => ({ f: t.e[v], side: t.side }));
    let tot = new F(0); parts.forEach((x) => { tot = x.side > 0 ? tot.add(x.f) : tot.sub(x.f); });
    res[v] = tot;
    if (parts.length < 2) { comb[v] = { lines: [pw(v, tot)], note: '' }; return; }
    const neat = (f, i, side) => { const s = fr(f); if (i === 0) return s; if (side > 0) return f.n < 0 ? `+\\left(${s}\\right)` : `+${s}`; return f.n < 0 ? `-\\left(${s}\\right)` : `-${s}`; };
    const l1 = `${v}^{${parts.map((x, i) => neat(x.f, i, x.side)).join('')}}`;
    const signed = parts.map((x) => (x.side > 0 ? x.f : new F(-x.f.n, x.f.d)));
    const L = signed.reduce((acc, f) => (acc * f.d) / gcd(acc, f.d), 1);
    const lcd = signed.map((f, i) => { const k = (f.n * L) / f.d; const s = `\\frac{${Math.abs(k)}}{${L}}`; return (k < 0 ? '-' : i ? '+' : '') + s; }).join('');
    const sameD = signed.every((f) => f.d === L);
    const lines = [l1, `=${sameD ? '' : `${v}^{${lcd}}=`}${pw(v, tot)}`];
    comb[v] = { lines, parts };
  });
  return { T, br, loose, p, after, coef, res, comb };
}
function lanesFinal(D, P) {
  const top = [], bot = [];
  if (P.coef.n !== 1) top.push(String(P.coef.n));
  if (P.coef.d !== 1) bot.push(String(P.coef.d));
  D.vars.forEach((v) => { const e = P.res[v]; if (e.n > 0) top.push(pw(v, e)); else if (e.n < 0) bot.push(pw(v, new F(-e.n, e.d))); });
  const t = top.join('') || '1';
  return bot.length ? `\\dfrac{${t}}{${bot.join('')}}` : t;
}
const lanes = {
  title: 'Multi-law chains: one base at a time',
  height: 470,
  choices: [{ v: 't1', label: tex('\\left(16x^4y^{-8}\\right)^{3/4}\\cdot y^{1/2}') }, { v: 't2', label: tex('\\left(125a^{-3}b^{6}\\right)^{2/3}\\div5a^{1/2}') },
    { sep: 'Example 5 check:' }, { v: 'e5a', label: '(a)' }, { v: 'e5b', label: '(b)' }],
  intro: (v) => `Simplify ${tex(LN[v].q())}. Each base gets its <b>own lane</b>: the <b class="am">number</b>, then each variable.`,
  make(stage, v, exd) {
    const W = exd.W, D = LN[v], P = lanesPlan(D), nv = D.vars.length;
    add(stage, h('div', 'ln-q', K(D.q())), 22, 14);
    const finTex = lanesFinal(D, P);
    const fin = add(stage, h('div', 'ln-fin', `<span class="ln-fin-h">Answer</span>${K('=' + finTex)}`), W - 22, 16); fin.style.translate = '-100% 0'; hide(fin);
    const gx = 18, gy = 112, labW = 170, numW = 200, varW = Math.floor((W - 2 * gx - labW - numW) / nv), rh = [72, 72, 84, 72];
    const colX = [gx + labW, gx + labW + numW, ...D.vars.slice(1).map((_, i) => gx + labW + numW + (i + 1) * varW)];
    const colW = [numW, ...D.vars.map(() => varW)];
    const lanesKeys = ['n', ...D.vars];
    lanesKeys.forEach((k, i) => {
      const hd = add(stage, h('div', 'ln-hd', k === 'n' ? 'number' : K(k)), colX[i], gy); hd.style.width = (colW[i] - 8) + 'px'; hd.style.setProperty('--lc', LCOL[k]);
      const bg = add(stage, h('div', 'ln-bg'), colX[i], gy + 36); bg.style.width = (colW[i] - 8) + 'px'; bg.style.height = rh.reduce((a, b) => a + b, 0) + 'px'; bg.style.setProperty('--lc', LCOL[k]);
    });
    const rowY = []; let yy = gy + 36; rh.forEach((r) => { rowY.push(yy); yy += r; });
    const mkRow = (ri, label, cells) => {
      const lab = add(stage, h('div', 'ln-lab', `<div>${label}</div>`), gx, rowY[ri]); lab.style.height = rh[ri] + 'px'; lab.style.width = (labW - 10) + 'px';
      const els = cells.map((src, i) => { if (src == null) return null; const e = add(stage, h('div', 'ln-cell', Array.isArray(src) ? src.map((s) => `<div>${K(s)}</div>`).join('') : K(src)), colX[i], rowY[ri]); e.style.width = (colW[i] - 8) + 'px'; e.style.height = rh[ri] + 'px'; e.style.color = LCOL[lanesKeys[i]]; return e; });
      hide(lab, ...els); return { lab, els: els.filter(Boolean) };
    };
    const brT = P.br[0], brI = P.T.indexOf(brT), brA = P.after[brI], pT = fr(P.p);
    // row 1: raise the bracket
    const r1 = mkRow(0, `Bracket: every exponent ${K('\\times' + pT)}`, [`${brT.c}^{${xp(P.p)}}`, ...D.vars.map((k) => (brT.e[k] ? `${k}^{${fr(brT.e[k])}\\cdot${pT}}` : null))]);
    // row 2: evaluate
    const r2 = mkRow(1, 'Evaluate', [brA.cv.tex, ...D.vars.map((k) => (brA.e[k] ? pw(k, brA.e[k]) : null))]);
    // row 3: combine
    const others = P.T.filter((t) => t !== brT), oA = P.after.filter((_, i) => P.T[i] !== brT);
    const otherTex = others.map((t) => `${t.c !== 1 ? t.c : ''}${D.vars.filter((k) => t.e[k]).map((k) => pw(k, t.e[k])).join('')}`).join(', ');
    const sideWord = others.every((t) => t.side < 0) ? 'Divide by' : 'Multiply by';
    const brC = brA.cv.val;
    const numCell = (() => {
      const nums = oA.map((t) => t.cv.val.n);
      if (nums.every((n) => n === 1)) return ftex(brC);
      const top = [brC.n, ...oA.filter((t) => t.side > 0).map((t) => t.cv.val.n)].filter((n) => n !== 1), bot = [brC.d, ...oA.filter((t) => t.side < 0).map((t) => t.cv.val.n)].filter((n) => n !== 1);
      const tt = top.join('\\cdot') || '1';
      return bot.length ? `\\dfrac{${tt}}{${bot.join('\\cdot')}}=${ftex(P.coef)}` : `${tt}=${ftex(P.coef)}`;
    })();
    const r3 = mkRow(2, `${sideWord} ${K(otherTex)}: combine`, [numCell, ...D.vars.map((k) => P.comb[k].lines)]);
    // row 4: positive exponents
    const r4 = mkRow(3, 'Positive exponents', [ftex(P.coef), ...D.vars.map((k) => { const e = P.res[k]; return e.n < 0 ? `${pw(k, e)}=\\dfrac{1}{${pw(k, new F(-e.n, e.d))}}` : e.n === 0 ? `${k}^0=1` : pw(k, e); })]);
    const reveal = async (c, R) => { await c.fadeIn(R.lab, 300, { from: 'translateX(-8px)' }); for (const e of R.els) await c.fadeIn(e, 340, { from: 'translateY(6px)' }); };
    // captions
    const evalBits = D.vars.filter((k) => brT.e[k]).map((k) => tex(`${fr(brT.e[k])}\\times${pT}=${fr(brA.e[k])}`)).join(', ');
    const combVars = D.vars.filter((k) => P.comb[k].parts);
    const negs = D.vars.filter((k) => P.res[k].n < 0);
    return [
      { cap: `<b>Step 1.</b> Raise the bracket to the power ${tex(pT)}: <b>every</b> factor gets it, the ${brT.c} included. Each exponent is multiplied by ${tex(pT)}.`, run: (c) => reveal(c, r1) },
      { cap: `<b>Step 2.</b> Evaluate. The number: <b>root first</b>, ${tex(brA.cv.tex)}. The exponents: ${evalBits}.`, run: (c) => reveal(c, r2) },
      { cap: `<b>Step 3.</b> ${sideWord} ${tex(otherTex)}. Work lane by lane: ${sideWord === 'Divide by' ? '<b>subtract</b>' : '<b>add</b>'} the exponents of ${combVars.map((k) => tex(k)).join(' and ')}${combVars.length < nv ? `; ${D.vars.filter((k) => !P.comb[k].parts).map((k) => tex(k)).join(', ')} has nothing to combine` : ''}.`, run: (c) => reveal(c, r3) },
      { cap: `<b>Step 4.</b> Positive exponents. ${negs.length ? negs.map((k) => tex(pw(k, P.res[k]))).join(' and ') + ' move' + (negs.length === 1 ? 's' : '') + ' below the fraction bar.' : 'All exponents are already positive.'} The coefficient stays put.`, run: (c) => reveal(c, r4) },
      { cap: `Put the lanes back together: ${tex(`${D.q().replace(/\\textcolor\{[^}]*\}/g, '')}=${finTex}`)}.`, run: (c) => c.pop(fin, 480) }
    ];
  }
};

/* ======================================================================
   warm-up: the earthquake scale
   ====================================================================== */
function mountQuake() {
  const host = document.getElementById('quake'); if (!host) return;
  const W = 968, H = 318, svg = svgEl('svg', { class: 'qk-svg', viewBox: `0 0 ${W} ${H}`, width: W, height: H });
  host.appendChild(svg);
  svg.appendChild(svgEl('rect', { x: 6, y: 6, width: W - 12, height: 118, rx: 8, class: 'qk-paper' }));
  for (let y = 22; y < 120; y += 16) svg.appendChild(svgEl('line', { x1: 14, y1: y, x2: W - 14, y2: y, class: 'qk-grid' }));
  const cx = [0, 1, 2, 3].map((i) => W / 8 + (i * W) / 4), amp = [0.12, 0.33, 0.7, 1.25], cy = 214, mid = 65;
  const traces = cx.map((x0, i) => {
    let d = '';
    for (let k = 0; k <= 200; k++) {
      const x = x0 - 110 + k * 1.1, g = Math.exp(-((x - x0) ** 2) / (2 * 34 ** 2)), y = mid + amp[i] * 42 * Math.sin(((x - x0) * 2 * Math.PI) / 15) * g;
      d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return svg.appendChild(svgEl('path', { d, class: 'qk-tr' }));
  });
  for (let i = 0; i < 3; i++) {
    const a = cx[i] + 34, b = cx[i + 1] - 34;
    svg.appendChild(svgEl('path', { d: `M${a} ${cy - 22} Q ${(a + b) / 2} ${cy - 70} ${b} ${cy - 22}`, class: 'qk-arc en' }));
    svg.appendChild(svgEl('path', { d: `M${b - 12} ${cy - 32} L${b} ${cy - 22} L${b - 14} ${cy - 18}`, class: 'qk-arc en' }));
    svg.appendChild(svgEl('path', { d: `M${a} ${cy + 22} Q ${(a + b) / 2} ${cy + 70} ${b} ${cy + 22}`, class: 'qk-arc sh' }));
    svg.appendChild(svgEl('path', { d: `M${b - 12} ${cy + 32} L${b} ${cy + 22} L${b - 14} ${cy + 18}`, class: 'qk-arc sh' }));
    const t1 = h('div', 'qk-l en', '×32 energy'); t1.style.left = (a + b) / 2 + 'px'; t1.style.top = (cy - 84) + 'px'; host.appendChild(t1);
    const t2 = h('div', 'qk-l sh', '×10 shaking'); t2.style.left = (a + b) / 2 + 'px'; t2.style.top = (cy + 56) + 'px'; host.appendChild(t2);
  }
  cx.forEach((x, i) => {
    const b = h('button', 'qk-m', 'M' + (i + 4)); b.type = 'button'; b.style.left = x + 'px'; b.style.top = cy + 'px'; host.appendChild(b);
    b.onclick = () => { // replay that quake's trace
      const tr = traces[i], len = tr.getTotalLength();
      tr.style.strokeDasharray = len; tr.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 900, easing: 'ease-out' });
      b.animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.12)' }, { transform: 'translate(-50%,-50%) scale(1)' }], 400);
    };
  });
  const tip = h('div', 'qk-tip muted', 'Tap a magnitude to replay its seismograph trace'); host.appendChild(tip);

  // question 3: fill the exponent
  const q3 = document.getElementById('q3fill');
  if (q3) {
    q3.innerHTML = `${tex('10^{3/2}\\times10^{3/2}=10')}<button type="button" class="q3b">?</button>`;
    const bq = q3.querySelector('.q3b');
    const set = (on) => { bq.classList.toggle('filled', on); bq.textContent = on ? '3' : '?'; };
    bq.onclick = () => set(!bq.classList.contains('filled'));
    document.querySelector('[data-q3]')?.addEventListener('click', () => set(true));
  }
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
  mountCompare();
}
function mountCompare() {
  const host = document.getElementById('qc'); if (!host) return;
  const lows = [4, 5, 6], highs = [5, 5.5, 6, 7, 8, 9];
  let lo = null, hi = null;
  const rowEl = (lab, vals, set) => {
    const r = h('div', 'qc-row no-ink', `<span class="qc-l">${lab}</span>`);
    vals.forEach((m) => { const b = h('button', 'chip', 'M' + m); b.type = 'button'; b.dataset.m = m; b.onclick = () => { set(m); r.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === b)); draw(); }; r.appendChild(b); });
    host.appendChild(r); return r;
  };
  rowEl('Weaker quake', lows, (m) => (lo = m)); rowEl('Stronger quake', highs, (m) => (hi = m));
  const out = h('div', 'qc-out'); host.appendChild(out);
  const approx = (x) => (x < 100 ? x.toFixed(2) : bigTxt(Math.round(x)));
  function draw() {
    if (lo == null || hi == null) { out.innerHTML = '<span class="muted">Pick a weaker and a stronger quake.</span>'; return; }
    if (hi <= lo) { out.innerHTML = `<span class="muted">M${hi} isn’t stronger than M${lo}. Pick a bigger magnitude.</span>`; return; }
    const d = new F(Math.round((hi - lo) * 2), 2), E = d.mul(new F(3, 2));
    const dT = fr(d), shake = Math.pow(10, d.v), en = Math.pow(10, E.v);
    const shakeT = d.int ? `10^{${d.n}}=${big(Math.round(shake))}` : `10^{${xp(d)}}\\approx${approx(shake)}`;
    const enT = `\\left(10^{3/2}\\right)^{${d.int ? d.n : xp(d)}}=10^{\\frac32\\times${dT}}=10^{${xp(E)}}${E.int ? '=' + big(Math.round(en)) : '\\approx' + approx(en).replace(/\u202f/g, '\\,')}`;
    out.innerHTML = `<div><b>${fmt(hi - lo)}</b> step${hi - lo === 1 ? '' : 's'} up the scale</div>
      <div class="qc-sh">Shaking: ${tex(shakeT)} times</div>
      <div class="qc-en">Energy: ${tex(enT)} times</div>`;
    out.animate([{ opacity: 0.3 }, { opacity: 1 }], 300);
  }
  draw();
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { laws, stepper, machinesNum, machinesVar, split, rootFirst, lanes };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}
mountQuake(); mountExplainers();
