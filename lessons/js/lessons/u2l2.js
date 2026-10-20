/* Math 10C · Unit 2 · Lesson 2 — Simplifying Expressions with Several Exponent Laws: the explainers and warm-up on this page. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

/* KaTeX allowing \htmlClass (tokens that fly from the expression into a column) */
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};
const T = (s) => tex(s); // inline math in captions

/* colours: numbers amber, then one colour per letter */
const NUM = '#c27a0e', VC = ['#13807a', '#7b4fc4', '#2f6fd0'];
const colOf = (k) => (k === 0 ? NUM : VC[(k - 1) % VC.length]);
const tc = (col, s) => `\\textcolor{${col}}{${s}}`;
const tn = (n) => fmt(n).replace(/ /g, '\\,'); // 7 077 888 → 7\,077\,888

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function frac(p, q) { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return { p: p / g, q: q / g }; }
const fracT = (r, small = true) => { const neg = r.p < 0, p = Math.abs(r.p); return (neg ? '-' : '') + (r.q === 1 ? String(p) : `\\${small ? 't' : 'd'}frac{${p}}{${r.q}}`); };
const coefT = (r) => (r.q === 1 && r.p === 1 ? '' : r.q === 1 && r.p === -1 ? '-' : fracT(r)); // a coefficient written in front of letters
const powT = (v, e) => (e === 1 ? v : `${v}^{${e}}`);

/* a copy of `src` flies from one element to another inside the stage */
async function fly(c, stage, from, to, src, o = {}) {
  if (c.fast || !from || !to) return;
  c.check();
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const ax = (a.left + a.width / 2 - sr.left) / k, ay = (a.top + a.height / 2 - sr.top) / k;
  const bx = (b.left + b.width / 2 - sr.left) / k, by = (b.top + b.height / 2 - sr.top) / k;
  const g = add(stage, h('div', 'fly c', K(src)), ax, ay); if (o.fs) g.style.fontSize = o.fs + 'px';
  g.style.opacity = 0;
  try {
    await c.anim(g, [{ opacity: 1, transform: 'translate(0,0) scale(1.1)' }, { opacity: 1, transform: `translate(${(bx - ax) / 2}px, ${(by - ay) / 2 - 24}px) scale(1.2)`, offset: 0.5 }, { opacity: 0.9, transform: `translate(${bx - ax}px, ${by - ay}px) scale(1)` }], o.ms || 750, { delay: o.delay || 0 });
  } finally { g.remove(); }
}
/* a stamp (✓ or ✗) that thumps onto a card */
function stampIn(c, el) { return c.anim(el, [{ opacity: 0, transform: 'scale(1.9) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); }

/* ============ 1. Expand, regroup, count (multiplying) ============ */
const EXPAND = {
  n1: { a: 3, m: 2, b: 2, n: 4, v: 'x' },
  n2: { a: 2, m: 3, b: 4, n: 3, v: 'y' },
  ex1: { a: 5, m: 2, b: 4, n: 4, v: 'x', students: true }
};
const expand = {
  title: 'Expand, regroup, count',
  height: 424,
  choices: [{ v: 'n1', label: tex('3x^2\\times2x^4') }, { v: 'n2', label: tex('2y^3\\times4y^3') }, { sep: 'Example 1 check:' }, { v: 'ex1', label: tex('5x^2\\times4x^4') }],
  intro: (k) => { const d = EXPAND[k]; return `Simplify ${T(`${d.a}${d.v}^${d.m}\\times${d.b}${d.v}^${d.n}`)} by writing out <b>every factor</b>.${d.students ? ' Then we’ll check Devon’s, Farah’s and Priya’s answers.' : ''}`; },
  make(stage, key, ex) {
    const W = ex.W, d = EXPAND[key], { a, m, b, n, v } = d, ab = a * b, mn = m + n;
    const TS = 58, G = 10, X = 52, ty = 120;
    const head = add(stage, h('div', 'xp-head c', K(`${a}${v}^{${m}}\\times${b}${v}^{${n}}`)), W / 2, 38);
    // tiles: [a] v×m  ×  [b] v×n
    const mk = (txt, cls) => { const e = add(stage, h('div', 'xt ' + cls, K(txt)), 0, ty); hide(e); return e; };
    const ta = mk(String(a), 'co'), tb = mk(String(b), 'co');
    const va = Array.from({ length: m }, () => mk(v, 'va')), vb = Array.from({ length: n }, () => mk(v, 'va'));
    const w1 = (1 + m) * (TS + G) - G, w2 = (1 + n) * (TS + G) - G, x0 = (W - (w1 + X + w2)) / 2;
    const pos1 = new Map();
    [ta, ...va].forEach((e, i) => pos1.set(e, x0 + i * (TS + G)));
    [tb, ...vb].forEach((e, i) => pos1.set(e, x0 + w1 + X + i * (TS + G)));
    pos1.forEach((x, e) => (e.style.left = x + 'px'));
    const times = add(stage, h('div', 'xp-times c', '×'), x0 + w1 + X / 2, ty + TS / 2); hide(times);
    const lab1 = add(stage, h('div', 'xp-lab c', K(`${a}${v}^{${m}}=${a}${`\\cdot ${v}`.repeat(m)}`)), x0 + w1 / 2, ty + TS + 30);
    const lab2 = add(stage, h('div', 'xp-lab c', K(`${b}${v}^{${n}}=${b}${`\\cdot ${v}`.repeat(n)}`)), x0 + w1 + X + w2 / 2, ty + TS + 30);
    hide(lab1, lab2);
    // regrouped: [a][b]  v × (m+n)
    const wc = 2 * (TS + G) - G, wv = mn * (TS + G) - G, xr = (W - (wc + X + wv)) / 2;
    const pos2 = new Map([[ta, xr], [tb, xr + TS + G]]);
    [...va, ...vb].forEach((e, i) => pos2.set(e, xr + wc + X + i * (TS + G)));
    const regroup = add(stage, h('div', 'xp-lab c', K(`(${a}\\times${b})\\cdot(${Array(mn).fill(v).join('\\cdot ')})`)), W / 2, ty + TS + 30); hide(regroup);
    const brace = add(stage, h('div', 'xp-brace'), xr + wc + X, ty - 15); brace.style.width = wv + 'px'; hide(brace);
    const braceL = add(stage, h('div', 'xp-bl c', `${mn} factors of ${T(v)}`), xr + wc + X + wv / 2, ty - 30); hide(braceL);
    const res = add(stage, h('div', 'xp-res c', K(`${a}${v}^{${m}}\\times${b}${v}^{${n}}=\\boldsymbol{${ab}${v}^{${mn}}}`)), W / 2, d.students ? 266 : 274); hide(res);
    const law = add(stage, h('div', 'xp-law c', `<b>Product Law:</b> ${K(`${v}^{${m}}\\cdot ${v}^{${n}}=${v}^{${m}+${n}}=${v}^{${mn}}`)}`), W / 2, 350); hide(law);
    const counts = [...va, ...vb].map((e) => { const k = h('span', 'xt-n'); e.appendChild(k); hide(k); return k; });
    const move = (c, map, ms = 700) => Promise.all([...map].map(([e, x], i) => c.anim(e, [{ left: e.style.left }, { left: x + 'px' }], ms, { delay: i * 25 })));
    const steps = [{
      cap: `<b>Expand</b> each term into its factors: ${T(`${a}${v}^${m}=${a}${`\\cdot ${v}`.repeat(m)}`)} and ${T(`${b}${v}^${n}=${b}${`\\cdot ${v}`.repeat(n)}`)}.`,
      run: (c) => Promise.all([ta, ...va, tb, ...vb].map((e, i) => c.pop(e, 360, { delay: i * 70 })).concat([c.fadeIn(times, 300), c.fadeIn(lab1, 350, { delay: 300 }), c.fadeIn(lab2, 350, { delay: 500 })]))
    }, {
      cap: `It’s all one big multiplication, and multiplying works in <b>any order</b>. So <b>regroup</b>: the numbers together, the ${T(v)}’s together.`,
      run: (c) => Promise.all([move(c, pos2), c.anim(times, [{ opacity: 1 }, { opacity: 0 }], 250), c.anim(lab1, [{ opacity: 1 }, { opacity: 0 }], 250), c.anim(lab2, [{ opacity: 1 }, { opacity: 0 }], 250), c.fadeIn(regroup, 400, { delay: 500 })])
    }, {
      cap: `<b>Multiply the numbers</b> like ordinary numbers: ${T(`${a}\\times${b}=${ab}`)}.`,
      run: async (c) => {
        await c.anim(tb, [{ left: tb.style.left }, { left: (xr + TS / 2) + 'px' }], 450);
        tb.style.opacity = 0; ta.innerHTML = K(String(ab)); ta.classList.add('big2');
        await c.pop(ta, 380);
      }
    }, {
      cap: `<b>Count the ${T(v)}’s:</b> ${T(`${m}+${n}=${mn}`)} factors of ${T(v)}, which is ${T(`${v}^{${mn}}`)}. The exponents <b>add</b>: that’s the Product Law. So ${T(`${a}${v}^${m}\\times${b}${v}^${n}=${ab}${v}^{${mn}}`)}.`,
      run: async (c) => {
        for (let i = 0; i < counts.length; i++) { counts[i].textContent = i + 1; await c.pop(counts[i], 220); }
        await Promise.all([c.fadeIn(brace, 300), c.fadeIn(braceL, 300), c.fadeIn(res, 450, { delay: 150 }), d.students ? null : c.fadeIn(law, 400, { delay: 350 })]);
      }
    }];
    if (d.students) {
      const cards = [['Devon', `20${v}^8`, false, `multiplied ${T('2\\times4=8')}`], ['Farah', `9${v}^6`, false, `added ${T('5+4=9')}`], ['Priya', `20${v}^6`, true, 'correct']].map(([name, ans, ok, why], i) => {
        const cw = (W - 80) / 3, el = add(stage, h('div', 'xp-stu', `<div class="xp-sn">${name}</div><div class="xp-sa">${K(ans)}</div><div class="xp-sw">${why}</div>`), 20 + i * (cw + 20), 316);
        el.style.width = cw + 'px';
        const st = add(stage, h('div', 'xp-stamp ' + (ok ? 'ok' : 'no'), ok ? '✓' : '✗'), 20 + i * (cw + 20) + cw - 62, 324); hide(st);
        return { el, st, why: el.querySelector('.xp-sw') };
      });
      hide(...cards.map((x) => x.why));
      steps.push({
        cap: `<b>Devon</b> wrote ${T('20x^8')}: he <b>multiplied</b> the exponents, ${T('2\\times4=8')}. But count the tiles: there are only <b>6</b> factors of ${T('x')}, not 8.`,
        run: (c) => Promise.all([stampIn(c, cards[0].st), c.fadeIn(cards[0].why, 300), (cards[0].el.classList.add('no'), null)])
      }, {
        cap: `<b>Farah</b> wrote ${T('9x^6')}: she <b>added</b> the numbers, ${T('5+4=9')}. But the 5 and the 4 are <b>multiplied</b> together, so they make 20.`,
        run: (c) => Promise.all([stampIn(c, cards[1].st), c.fadeIn(cards[1].why, 300), (cards[1].el.classList.add('no'), null)])
      }, {
        cap: `<b>Priya is correct:</b> ${T('5x^2\\times4x^4=20x^6')}. Numbers <b>multiply</b>, exponents <b>add</b>.`,
        run: (c) => Promise.all([stampIn(c, cards[2].st), c.fadeIn(cards[2].why, 300), (cards[2].el.classList.add('ok'), null)])
      });
    }
    head.style.opacity = 1;
    return steps;
  }
};

/* ============ 1. Cancelling in pairs (dividing) ============ */
const CANCEL = {
  n1: { a: 12, m: 5, b: 3, n: 2, v: 'a' },
  n2: { a: 15, m: 6, b: 5, n: 4, v: 'b' },
  ex2: { a: 10, m: 8, b: 5, n: 3, v: 'a' }
};
const cancel = {
  title: 'Cancel the factors in pairs',
  height: 360,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n1', label: tex('12a^5\\div3a^2') }, { v: 'n2', label: tex('15b^6\\div5b^4') }, { sep: 'Example 2 check:' }, { v: 'ex2', label: tex('10a^8\\div5a^3') }],
  intro: (k) => { const d = CANCEL[k]; return `Write ${T(`\\dfrac{${d.a}${d.v}^{${d.m}}}{${d.b}${d.v}^{${d.n}}}`)} in <b>expanded factor form</b>, top and bottom.`; },
  make(stage, key, ex) {
    const W = ex.W, d = CANCEL[key], { a, m, b, n, v } = d, q = a / b, left = m - n;
    const TS = 58, G = 8, x0 = 36, yT = 52, yB = 150, barY = yT + TS + 20;
    const panelX = Math.max(x0 + (m + 1) * (TS + G) + 40, W - 330), pw = W - panelX - 20;
    const mk = (txt, cls, x, y) => { const e = add(stage, h('div', 'xt ' + cls, K(txt)), x, y); hide(e); return e; };
    const ca = mk(String(a), 'co', x0, yT), cb = mk(String(b), 'co', x0, yB);
    const top = Array.from({ length: m }, (_, i) => mk(v, 'va', x0 + (i + 1) * (TS + G), yT));
    const bot = Array.from({ length: n }, (_, i) => mk(v, 'va', x0 + (i + 1) * (TS + G), yB));
    const bar = add(stage, h('div', 'cn-bar'), x0 - 8, barY); bar.style.width = ((m + 1) * (TS + G) + 8) + 'px'; hide(bar);
    const qv = add(stage, h('div', 'cn-q c', K(String(q))), x0 + TS / 2, barY + 2); hide(qv);
    const ones = bot.map((_, i) => { const e = add(stage, h('div', 'cn-one c', '1'), x0 + (i + 1) * (TS + G) + TS / 2, barY + 2); hide(e); return e; });
    const slashes = [...top.slice(0, n), ...bot].map((t) => { const s = h('i', 'cn-slash'); t.appendChild(s); hide(s); return s; });
    const panel = add(stage, h('div', 'cn-panel'), panelX, 24); panel.style.width = pw + 'px';
    panel.innerHTML = `<div class="cn-expr">${K(`\\dfrac{${a}${v}^{${m}}}{${b}${v}^{${n}}}`)}</div>`;
    const row = (html) => { const e = h('div', 'cn-row', html); panel.appendChild(e); hide(e); return e; };
    const r1 = row(`<span class="cn-k">numbers</span> ${K(`${a}\\div${b}=${q}`)}`);
    const r2 = row(`<span class="cn-k">${T(v)}’s left</span> ${K(`${m}-${n}=${left}`)}`);
    const r3 = row(K(`=\\boldsymbol{${q === 1 ? '' : q}${powT(v, left)}}`)); r3.classList.add('cn-res');
    const law = add(stage, h('div', 'xp-law', `<b>Quotient Law:</b> ${K(`\\dfrac{${v}^{${m}}}{${v}^{${n}}}=${v}^{${m}-${n}}=${powT(v, left)}`)}`), x0, 270); hide(law);
    const counts = top.slice(n).map((e) => { const k = h('span', 'xt-n'); e.appendChild(k); hide(k); return k; });
    return [{
      cap: `<b>Expand:</b> the top has ${T(String(a))} and <b>${m}</b> factors of ${T(v)}; the bottom has ${T(String(b))} and <b>${n}</b> factors of ${T(v)}.`,
      run: (c) => Promise.all([c.fadeIn(bar, 300), ...[ca, ...top].map((e, i) => c.pop(e, 340, { delay: i * 60 })), ...[cb, ...bot].map((e, i) => c.pop(e, 340, { delay: 250 + i * 60 }))])
    }, {
      cap: `<b>The numbers</b> divide like ordinary numbers: ${T(`${a}\\div${b}=${q}`)}.`,
      run: async (c) => {
        ca.classList.add('out'); cb.classList.add('out');
        await Promise.all([c.pop(qv, 420, { delay: 200 }), c.fadeIn(r1, 350, { delay: 300 })]);
      }
    }, {
      cap: `Each ${T(v)} on the bottom <b>cancels</b> one ${T(v)} on the top, because ${T(`\\dfrac{${v}}{${v}}=1`)}. That’s <b>${n} pairs</b>.`,
      run: async (c) => {
        for (let i = 0; i < n; i++) {
          const s1 = slashes[i], s2 = slashes[n + i];
          await Promise.all([c.anim(s1, [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], 260), c.anim(s2, [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], 260), c.pop(ones[i], 300, { delay: 120 })]);
          top[i].classList.add('out'); bot[i].classList.add('out');
        }
      }
    }, {
      cap: `<b>${left}</b> factors of ${T(v)} are left on top: ${T(`${m}-${n}=${left}`)}. So ${T(`${a}${v}^{${m}}\\div${b}${v}^{${n}}=${q === 1 ? '' : q}${powT(v, left)}`)}${key === 'ex2' ? ', just as the quotient law predicts' : ''}.`,
      run: async (c) => {
        for (let i = 0; i < counts.length; i++) { counts[i].textContent = i + 1; top[n + i].classList.add('lit'); await c.pop(counts[i], 220); }
        await Promise.all([c.fadeIn(r2, 350), c.fadeIn(r3, 400, { delay: 250 }), c.fadeIn(law, 400, { delay: 400 })]);
      }
    }];
  }
};

/* ============ 2. One base at a time (colour-coded columns) ============ */
// term: { c: coefficient or null (nothing written = 1), v: { letter: exponent } }
const OB = {
  n1: { e: (P) => `(${P(0, '3')}${P(1, 'a^2')}${P(2, 'b^5')})(${P(0, '4')}${P(1, 'a^3')}${P(2, 'b')})`, vars: ['a', 'b'], top: [{ c: 3, v: { a: 2, b: 5 } }, { c: 4, v: { a: 3, b: 1 } }], bot: [] },
  n2: { e: (P) => `\\dfrac{${P(0, '18')}${P(1, 'm^7')}${P(2, 'n^4')}}{${P(0, '12')}${P(1, 'm^2')}${P(2, 'n')}}`, vars: ['m', 'n'], top: [{ c: 18, v: { m: 7, n: 4 } }], bot: [{ c: 12, v: { m: 2, n: 1 } }] },
  a: { e: (P) => `${P(0, '6')}${P(1, 'x^4')}\\times${P(0, '3')}${P(1, 'x^5')}`, vars: ['x'], top: [{ c: 6, v: { x: 4 } }, { c: 3, v: { x: 5 } }], bot: [] },
  b: { e: (P) => `(${P(0, '-8')}${P(1, 'a^6')})(${P(0, '5')}${P(1, 'a^9')})`, vars: ['a'], top: [{ c: -8, v: { a: 6 } }, { c: 5, v: { a: 9 } }], bot: [] },
  c: { e: (P) => `\\dfrac{${P(0, '24')}${P(1, 'y^{18}')}}{${P(0, '8')}${P(1, 'y^6')}}`, vars: ['y'], top: [{ c: 24, v: { y: 18 } }], bot: [{ c: 8, v: { y: 6 } }] },
  d: { e: (P) => `\\dfrac{${P(0, '40')}${P(1, 'b^{15}')}}{${P(0, '48')}${P(1, 'b^9')}}`, vars: ['b'], top: [{ c: 40, v: { b: 15 } }], bot: [{ c: 48, v: { b: 9 } }] },
  e: { e: (P) => `(${P(0, '2')}${P(1, 'a^5')})(${P(1, 'a^6')})(${P(0, '4')}${P(1, 'a^2')})`, vars: ['a'], top: [{ c: 2, v: { a: 5 } }, { c: null, v: { a: 6 } }, { c: 4, v: { a: 2 } }], bot: [] },
  f: { e: (P) => `(${P(0, '-20')}${P(1, 'n^7')})\\div(${P(0, '-4')}${P(1, 'n')})`, vars: ['n'], top: [{ c: -20, v: { n: 7 } }], bot: [{ c: -4, v: { n: 1 } }] },
  g: { e: (P) => `${P(1, 'a^6')}${P(2, 'b^9')}\\times ${P(1, 'a^2')}${P(2, 'b^3')}`, vars: ['a', 'b'], top: [{ c: null, v: { a: 6, b: 9 } }, { c: null, v: { a: 2, b: 3 } }], bot: [] },
  h: { e: (P) => `\\dfrac{${P(1, 'x^7')}${P(2, 'y^5')}}{${P(1, 'x^3')}${P(2, 'y^2')}}`, vars: ['x', 'y'], top: [{ c: null, v: { x: 7, y: 5 } }], bot: [{ c: null, v: { x: 3, y: 2 } }] }
};
function obModel(d) {
  const hasNum = [...d.top, ...d.bot].some((t) => t.c != null);
  const cv = (t) => (t.c == null ? 1 : t.c);
  const numT = (list) => (list.length > 1 && list.some((t) => cv(t) < 0) ? list.map((t) => `(${cv(t)})`).join('') : list.map(cv).join('\\times'));
  const pTop = d.top.reduce((p, t) => p * cv(t), 1), pBot = d.bot.reduce((p, t) => p * cv(t), 1), r = frac(pTop, pBot);
  const cols = [];
  if (hasNum) {
    const A = d.bot.length ? `\\dfrac{${numT(d.top)}}{${numT(d.bot)}}` : numT(d.top);
    const g = gcd(pTop, pBot), exact = pTop % pBot === 0;
    const B = d.bot.length && !exact ? `=\\dfrac{${pTop}\\div${g}}{${pBot}\\div${g}}` : `=${fracT(r)}`;
    let cap;
    if (!d.bot.length) cap = `<b>Numbers:</b> ${T(numT(d.top) + '=' + fracT(r))}.` + (d.top.some((t) => t.c == null) ? ` A term with no number in front has coefficient <b>1</b>.` : '') + (d.top.some((t) => cv(t) < 0) ? ` A negative times a positive is <b>negative</b>.` : '');
    else if (exact) cap = `<b>Numbers:</b> ${T(`${pTop}\\div${pBot < 0 ? `(${pBot})` : pBot}=${fracT(r)}`)}.` + (pTop < 0 && pBot < 0 ? ' A negative divided by a negative is <b>positive</b>.' : '');
    else cap = `<b>Numbers:</b> ${pTop} ÷ ${pBot} isn’t a whole number, so <b>reduce the fraction</b>: divide the top and bottom by ${g} to get ${T(fracT(r))}.`;
    cols.push({ k: 0, head: 'Numbers', A, B, C: fracT(r), cap, law: d.bot.length ? 'divide' : 'multiply' });
  }
  d.vars.forEach((v, i) => {
    const ups = d.top.filter((t) => t.v[v] != null).map((t) => t.v[v]), dns = d.bot.filter((t) => t.v[v] != null).map((t) => t.v[v]);
    const e = ups.reduce((s, x) => s + x, 0) - dns.reduce((s, x) => s + x, 0);
    const prodT = (l) => l.map((x) => powT(v, x)).join('\\cdot ');
    const A = dns.length ? `\\dfrac{${prodT(ups)}}{${prodT(dns)}}` : prodT(ups);
    const expr = ups.join('+') + dns.map((x) => '-' + x).join('');
    const B = `=${v}^{${expr}}`;
    const C = e === 0 ? `${v}^0=1` : powT(v, e);
    const one = [...ups, ...dns].includes(1) ? ` (${T(v)} by itself means ${T(v + '^1')}.)` : '';
    let law, cap;
    if (!dns.length) { law = 'Product Law: add'; cap = `<b>${T(v)}:</b> Product Law, <b>add</b> the exponents: ${T(ups.join('+') + '=' + e)}.${one}`; }
    else if (ups.length === 1 && dns.length === 1) { law = 'Quotient Law: subtract'; cap = `<b>${T(v)}:</b> Quotient Law, <b>subtract</b> the exponents: ${T(`${ups[0]}-${dns[0]}=${e}`)}.${one}`; }
    else { law = 'add top, subtract bottom'; cap = `<b>${T(v)}:</b> add the exponents on top, subtract the ones on the bottom: ${T(`${expr}=${e}`)}.${one}`; }
    cols.push({ k: i + 1, head: v, A, B, C, cap, law, e, v });
  });
  const ansT = (hasNum ? coefT(r) : '') + cols.filter((c) => c.k > 0 && c.e !== 0).map((c) => powT(c.v, c.e)).join('');
  return { cols, ansT, hasNum };
}
const oneBase = {
  title: 'Sort into columns, then one law per column',
  height: 494,
  choices: [{ v: 'n1', label: tex('(3a^2b^5)(4a^3b)') }, { v: 'n2', label: tex('\\frac{18m^7n^4}{12m^2n}') }, { sep: 'Example 3 check:' }, ...'abcdefgh'.split('').map((k) => ({ v: k, label: '(' + k + ')' }))],
  intro: (k) => `Simplify ${T(OB[k].e((i, s) => s))} by sorting the pieces into <b>columns</b>, one for the numbers and one for each letter.`,
  make(stage, key, ex) {
    const W = ex.W, d = OB[key], M = obModel(d);
    const P = (k, s) => `\\htmlClass{obp obk${M.hasNum ? k : k - 1}}{${tc(colOf(k), s)}}`;
    const head = add(stage, h('div', 'ob-head c', K(d.e(P))), W / 2, 50);
    const N = M.cols.length, gap = 16, cw = Math.min(300, (W - 40 - gap * (N - 1)) / N), x0 = (W - (cw * N + gap * (N - 1))) / 2, cy = 108, chh = 292;
    const cols = M.cols.map((col, i) => {
      const box = add(stage, h('div', 'ob-col'), x0 + i * (cw + gap), cy); box.style.width = cw + 'px'; box.style.height = chh + 'px'; box.style.setProperty('--cc', colOf(col.k));
      box.innerHTML = `<div class="ob-h">${col.k ? K(col.head) : col.head}</div><div class="ob-law">${col.law}</div>`;
      const mkR = (src, cls, y) => { const e = h('div', 'ob-r ' + cls, K(src)); e.style.top = y + 'px'; box.appendChild(e); hide(e); return e; };
      const rA = mkR(tc(colOf(col.k), col.A), 'ra', 58), rB = mkR(col.B, 'rb', 134), rC = mkR(col.C.replace(/\\tfrac/g, '\\dfrac'), 'rc', 210);
      hide(box);
      return { col, box, rA, rB, rC, law: box.querySelector('.ob-law') };
    });
    cols.forEach((x) => hide(x.law));
    const ans = add(stage, h('div', 'ob-ans c', K(`=${(M.ansT || '1').replace(/\\tfrac/g, '\\dfrac')}`)), W / 2, 446); hide(ans);
    const steps = [{
      cap: `Sort every piece into its column: ${M.hasNum ? '<b>numbers</b> in one, ' : 'no numbers are written, so just '}${d.vars.map((v) => T(v)).join(' and ')} ${d.vars.length > 1 ? 'each in their own' : 'in its own'}. The colours match.`,
      run: async (c) => {
        await Promise.all(cols.map((x, i) => c.fadeIn(x.box, 300, { delay: i * 100 })));
        const jobs = [];
        cols.forEach((x, i) => {
          const pieces = [...head.querySelectorAll('.obk' + i)];
          pieces.forEach((p, j) => jobs.push(fly(c, stage, p, x.rA, tc(colOf(x.col.k), p.textContent.replace(/−/g, '-')), { fs: 28, delay: j * 140 + i * 90 })));
        });
        await Promise.all(jobs);
        await Promise.all(cols.map((x) => c.fadeIn(x.rA, 300)));
      }
    }];
    cols.forEach((x) => steps.push({
      cap: x.col.cap,
      run: async (c) => {
        cols.forEach((y) => y.box.classList.toggle('on', y === x));
        await Promise.all([c.fadeIn(x.law, 250), c.fadeIn(x.rB, 350, { delay: 100 }), c.pop(x.rC, 420, { delay: 450 })]);
      }
    }));
    steps.push({
      cap: `Put the columns back together: ${T(d.e((i, s) => s) + '=' + (M.ansT || '1'))}.`,
      run: async (c) => {
        cols.forEach((y) => y.box.classList.remove('on'));
        await Promise.all([...cols.map((x, i) => fly(c, stage, x.rC, ans, x.col.C.replace(/\\tfrac/g, '\\dfrac'), { fs: 30, delay: i * 120 })), c.pop(ans, 450, { delay: 500 })]);
      }
    });
    return steps;
  }
};

/* ============ 2. Multi-law chains: which law did the work? ============ */
const LAWS = [
  ['pprod', 'Power of a Product', '(ab)^m=a^mb^m'],
  ['pquot', 'Power of a Quotient', '(a\\div b)^n=a^n\\div b^n'],
  ['ppow', 'Power of a Power', '(a^m)^n=a^{mn}'],
  ['prod', 'Product', 'a^m\\cdot a^n=a^{m+n}'],
  ['quot', 'Quotient', 'a^m\\div a^n=a^{m-n}'],
  ['zero', 'Zero Exponent', 'a^0=1']
];
const CHAINS = {
  copy: {
    t: '(2^3s)^2', intro: `The warm-up’s Copy 3 has side ${T('2^3s')}. Its area is ${T('(2^3s)^2')}. Simplify it, one law at a time.`, lines: [
      ['=(2^3)^2\\,s^2', ['pprod'], 'Step 1: square <b>every</b> factor inside', `<b>Power of a Product:</b> the bracket holds two factors, ${T('2^3')} and ${T('s')}. <b>Both</b> get squared.`],
      ['=2^{3\\times2}\\,s^2', ['ppow'], 'multiply the exponents', `<b>Power of a Power:</b> ${T('(2^3)^2=2^{3\\times2}')}. A power of a power <b>multiplies</b> the exponents.`],
      ['=64s^2', [], `${T('2^6=64')}`, `${T('2^6=64')}. Copy 3 has <b>64 times</b> the area of the original, just like the warm-up.`]]
  },
  a: {
    t: '(2x^3)^4', lines: [
      ['=2^4\\,(x^3)^4', ['pprod'], 'Step 1: the 2 <b>and</b> the ' + T('x^3') + ' get the 4th power', `<b>Power of a Product:</b> two factors are inside the bracket, ${T('2')} and ${T('x^3')}. <b>Each one</b> is raised to the 4th, the 2 too.`],
      ['=16\\,x^{3\\times4}', ['ppow'], `${T('2^4=16')}; multiply the exponents`, `${T('2^4=2\\times2\\times2\\times2=16')}. <b>Power of a Power:</b> ${T('(x^3)^4=x^{3\\times4}')}.`],
      ['=16x^{12}', [], 'simplest form', `So ${T('(2x^3)^4=16x^{12}')}.`]]
  },
  b: {
    t: '(-3a^2b^4)^3', lines: [
      ['=(-3)^3(a^2)^3(b^4)^3', ['pprod'], 'Step 1: <b>every</b> factor, the ' + T('-3') + ' too', `<b>Power of a Product:</b> three factors are inside: ${T('-3')}, ${T('a^2')} and ${T('b^4')}. All three get cubed. Keep the ${T('-3')} in brackets.`],
      ['=-27\\,a^{2\\times3}\\,b^{4\\times3}', ['ppow'], `${T('(-3)^3=-27')}: odd power, negative`, `${T('(-3)^3=(-3)(-3)(-3)=-27')}: an <b>odd</b> power of a negative is negative. <b>Power of a Power</b> on ${T('a')} and ${T('b')}.`],
      ['=-27a^6b^{12}', [], 'simplest form', `So ${T('(-3a^2b^4)^3=-27a^6b^{12}')}.`]]
  },
  c: {
    t: '\\dfrac{x^4\\cdot x^6}{x^3\\cdot x^2}', lines: [
      ['=\\dfrac{x^{4+6}}{x^{3+2}}=\\dfrac{x^{10}}{x^5}', ['prod'], 'top and bottom <b>separately</b> first', `<b>Product Law</b> on the top and on the bottom, separately: ${T('x^4\\cdot x^6=x^{10}')} and ${T('x^3\\cdot x^2=x^5')}.`],
      ['=x^{10-5}', ['quot'], 'then subtract', `<b>Quotient Law:</b> subtract the bottom exponent from the top one.`],
      ['=x^5', [], 'simplest form', `So the answer is ${T('x^5')}.`]]
  },
  d: {
    t: '\\left(-\\dfrac{3a}{b^2}\\right)^3', lines: [
      ['=\\left(\\dfrac{-3a}{b^2}\\right)^3', [], 'the ' + T('-') + ' goes with the top', `First, put the negative sign with the <b>top</b>: ${T('-\\dfrac{3a}{b^2}')} is the same as ${T('\\dfrac{-3a}{b^2}')}.`],
      ['=\\dfrac{(-3a)^3}{(b^2)^3}', ['pquot'], 'Step 1: top and bottom both get the 3rd power', `<b>Power of a Quotient:</b> the top and the bottom are <b>each</b> raised to the 3rd power.`],
      ['=\\dfrac{(-3)^3a^3}{b^{2\\times3}}', ['pprod', 'ppow'], 'every factor on top; multiply on the bottom', `On top, <b>Power of a Product</b>: ${T('(-3a)^3=(-3)^3a^3')}. On the bottom, <b>Power of a Power</b>: ${T('(b^2)^3=b^{2\\times3}')}.`],
      ['=-\\dfrac{27a^3}{b^6}', [], `${T('(-3)^3=-27')} (odd)`, `${T('(-3)^3=-27')}, an odd power of a negative. So ${T('\\left(-\\dfrac{3a}{b^2}\\right)^3=-\\dfrac{27a^3}{b^6}')}.`]]
  },
  e: {
    t: '\\left(\\dfrac{6a^3\\times2a^5}{4a^2}\\right)^3', lines: [
      ['=\\left(\\dfrac{12a^8}{4a^2}\\right)^3', ['prod'], 'Step 4: <b>inside</b> the bracket first', `<b>Step 4:</b> everything sits inside an outer bracket, so simplify <b>inside first</b>. Product Law on top: ${T('6\\times2=12')} and ${T('a^{3+5}=a^8')}.`],
      ['=(3a^6)^3', ['quot'], `${T('12\\div4=3')}, ${T('a^{8-2}')}`, `Still inside: <b>Quotient Law</b>. ${T('12\\div4=3')} and ${T('a^{8-2}=a^6')}.`],
      ['=3^3a^{6\\times3}', ['pprod', 'ppow'], 'now the outer power, <b>last</b>', `Now the outer power, <b>last</b>. Power of a Product: the 3 <b>and</b> the ${T('a^6')} get cubed. Power of a Power: ${T('a^{6\\times3}')}.`],
      ['=27a^{18}', [], `${T('3^3=27')}`, `${T('3^3=27')}, so the answer is ${T('27a^{18}')}.`]]
  },
  f: {
    t: '\\dfrac{54(a^3b^4)^2}{(3a^2)^3}', lines: [
      ['=\\dfrac{54\\,a^{3\\times2}b^{4\\times2}}{3^3a^{2\\times3}}', ['pprod', 'ppow'], 'Step 1: each bracket to its power', `<b>Step 1:</b> raise each bracket to its power. Every factor inside gets it (Power of a Product), and exponents <b>multiply</b> (Power of a Power). The 54 is outside the bracket, so it is <b>not</b> squared.`],
      ['=\\dfrac{54a^6b^8}{27a^6}', [], `${T('3^3=27')}; ${T('3\\times2=6')}, …`, `Work out each piece: ${T('3\\times2=6')}, ${T('4\\times2=8')}, ${T('2\\times3=6')}, and ${T('3^3=27')}.`],
      ['=2a^{6-6}b^8=2a^0b^8', ['quot'], `${T('54\\div27=2')}; one base at a time`, `<b>Steps 2 and 3:</b> ${T('54\\div27=2')}, then the Quotient Law one base at a time: ${T('a^{6-6}=a^0')}. There’s no ${T('b')} on the bottom, so ${T('b^8')} stays.`],
      ['=2b^8', ['zero'], T('a^0=1'), `<b>Zero Exponent Law:</b> ${T('a^0=1')}. The ${T('a')}’s cancelled completely. Answer: ${T('2b^8')}.`]]
  },
  g: {
    t: '(3a^4b)^2(2a^3b^5)', lines: [
      ['=9a^8b^2\\cdot2a^3b^5', ['pprod', 'ppow'], `Step 1: ${T('3^2=9')}, ${T('a^{4\\times2}')}, ${T('b^{1\\times2}')}`, `<b>Step 1:</b> square every factor in the first bracket: ${T('3^2=9')}, ${T('(a^4)^2=a^8')}, and ${T('b^2')} (${T('b')} means ${T('b^1')}).`],
      ['=18\\,a^{8+3}\\,b^{2+5}', ['prod'], `${T('9\\times2=18')}; add, one base at a time`, `<b>Product Law,</b> one base at a time: ${T('9\\times2=18')}, ${T('a^{8+3}')}, ${T('b^{2+5}')}.`],
      ['=18a^{11}b^7', [], 'simplest form', `So ${T('(3a^4b)^2(2a^3b^5)=18a^{11}b^7')}.`]]
  },
  d5: {
    t: '\\dfrac{100x^6y^9(-z^2)^3}{5(2x^2y)^3z^2y^2}', lines: [
      ['=\\dfrac{100x^6y^9(-z^6)}{5(8x^6y^3)z^2y^2}', ['pprod', 'ppow'], `Step 1: ${T('(-z^2)^3=-z^6')}, ${T('(2x^2y)^3=8x^6y^3')}`, `<b>Step 1, brackets first.</b> ${T('(-z^2)^3=-z^6')}: an odd power keeps the negative. ${T('(2x^2y)^3=2^3x^6y^3=8x^6y^3')}.`],
      ['=\\dfrac{-100x^6y^9z^6}{40x^6y^5z^2}', ['prod'], `bottom: ${T('5\\times8=40')}, ${T('y^{3+2}')}`, `Tidy each line. Top: the negative moves out front. Bottom, <b>Product Law</b>: ${T('5\\times8=40')} and ${T('y^3\\cdot y^2=y^5')}.`],
      ['=-\\tfrac{100}{40}\\,x^{6-6}y^{9-5}z^{6-2}', ['quot'], 'one base at a time', `<b>Quotient Law,</b> one base at a time: ${T('x^{6-6}')}, ${T('y^{9-5}')}, ${T('z^{6-2}')}.`],
      ['=-\\tfrac{5}{2}x^0y^4z^4=-\\dfrac{5}{2}y^4z^4', ['zero'], `${T('\\tfrac{100}{40}=\\tfrac{5}{2}')}; ${T('x^0=1')}`, `Reduce ${T('\\tfrac{100}{40}=\\tfrac{5}{2}')}, and ${T('x^0=1')} (<b>Zero Exponent</b>). Answer: ${T('-\\dfrac{5}{2}y^4z^4')}.`]]
  }
};
const chain = {
  title: 'Which law did the work?',
  height: 534,
  choices: [{ v: 'copy', label: tex('(2^3s)^2') }, { sep: 'Example 4 check:' }, ...'abcdefg'.split('').map((k) => ({ v: k, label: '(' + k + ')' })), { sep: 'Example 5 check:' }, { v: 'd5', label: '(d)' }],
  intro: (k) => CHAINS[k].intro || `Simplify ${T(CHAINS[k].t)}, one law at a time. Press <b>Next</b> for each line.`,
  make(stage, key, ex) {
    const W = ex.W, d = CHAINS[key], two = W < 900, per = two ? 3 : 6, bw = (W - 24 - (per - 1) * 8) / per; // narrow stage (beside the sidebar): the laws in two rows of 3
    const badges = {};
    LAWS.forEach(([k, name, f], i) => { const b = add(stage, h('div', 'ch-law ch-' + k, `<b>${name}</b><span>${K(f)}</span>`), 12 + (i % per) * (bw + 8), 12 + Math.floor(i / per) * 58); b.style.width = bw + 'px'; if (two) b.style.height = '52px'; badges[k] = b; });
    const lx = 26, ly = two ? 136 : 104, lh = two ? 79 : 84, nx = Math.round(W * 0.56), nw = W - nx - 16;
    const all = [[d.t, [], 'the question', '']].concat(d.lines);
    const rows = all.map(([t, , note], i) => {
      const el = add(stage, h('div', 'ch-line', K(t)), lx, ly + i * lh); el.style.height = (lh - 8) + 'px';
      const n = add(stage, h('div', 'ch-note', `<div>${note}</div>`), nx, ly + i * lh); n.style.width = nw + 'px'; n.style.height = (lh - 14) + 'px';
      if (i) hide(el, n); else n.classList.add('start');
      return { el, n };
    });
    const light = (c, ks) => Promise.all(LAWS.map(([k]) => { const on = ks.includes(k), b = badges[k], was = b.classList.contains('on'); b.classList.toggle('on', on); return on && !was ? c.anim(b, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], 380) : null; }));
    return d.lines.map(([, laws, , cap], j) => ({
      cap,
      run: async (c) => {
        const r = rows[j + 1], last = j === d.lines.length - 1;
        rows.forEach((x) => x.el.classList.remove('now'));
        r.el.classList.add('now'); if (last) r.el.classList.add('final');
        await Promise.all([light(c, laws), c.fadeIn(r.el, 420, { from: 'translateY(-10px)' }), c.fadeIn(r.n, 380, { delay: 200, from: 'translateX(10px)' })]);
      }
    }));
  }
};

/* ============ 2. Check by substituting a number ============ */
const CHECKS = {
  ex1: { x: 'x', o: '5x^2\\times4x^4', oS: '5(2)^2\\times4(2)^4', oM: '5(4)\\times4(16)=20\\times64', f: (x) => 5 * x ** 2 * 4 * x ** 4,
    a: '20x^6', aS: '20(2)^6', aM: '20\\times64', g: (x) => 20 * x ** 6,
    who: 'Devon', why: 'he multiplied the exponents', w: '20x^8', wS: '20(2)^8', wM: '20\\times256', wf: (x) => 20 * x ** 8, one: true },
  a: { x: 'x', o: '(2x^3)^4', oS: '(2(2)^3)^4', oM: '(2\\times8)^4=16^4', f: (x) => (2 * x ** 3) ** 4,
    a: '16x^{12}', aS: '16(2)^{12}', aM: '16\\times4\\,096', g: (x) => 16 * x ** 12,
    who: 'Kai', why: 'he forgot to raise the 2 to the 4th', w: '2x^{12}', wS: '2(2)^{12}', wM: '2\\times4\\,096', wf: (x) => 2 * x ** 12 },
  e: { x: 'a', o: '\\left(\\dfrac{6a^3\\times2a^5}{4a^2}\\right)^3', oS: '\\left(\\dfrac{6(2)^3\\times2(2)^5}{4(2)^2}\\right)^3', oM: '\\left(\\dfrac{48\\times64}{16}\\right)^3=192^3', f: (a) => ((6 * a ** 3 * 2 * a ** 5) / (4 * a ** 2)) ** 3,
    a: '27a^{18}', aS: '27(2)^{18}', aM: '27\\times262\\,144', g: (a) => 27 * a ** 18,
    who: 'Leo', why: 'he forgot to cube the 3', w: '3a^{18}', wS: '3(2)^{18}', wM: '3\\times262\\,144', wf: (a) => 3 * a ** 18 }
};
const check = {
  title: 'Check it with a number',
  height: 430,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  value: 'ex1',
  choices: [{ sep: 'Example 1:' }, { v: 'ex1', label: tex('5x^2\\times4x^4') }, { sep: 'Example 4:' }, { v: 'a', label: tex('(2x^3)^4') }, { v: 'e', label: '(e)' }],
  intro: (k) => { const d = CHECKS[k]; return `We simplified ${T(d.o)} to ${T(d.a)}. ${d.who} got ${T(d.w)}. Substitute a number to see which one is really <b>equal</b> to the original.`; },
  make(stage, key, ex) {
    const W = ex.W, d = CHECKS[key], cw = (W - 60) / 3, cy = 70;
    const pick = add(stage, h('div', 'ck-pick', `Test value: ${K(d.x + '=2')}`), 20, 14); hide(pick);
    const card = (i, head, e, cls) => {
      const el = add(stage, h('div', 'ck-card ' + cls, `<div class="ck-h">${head}</div><div class="ck-e">${K(e)}</div><div class="ck-s"></div><div class="ck-v"></div>`), 20 + i * (cw + 10), cy);
      el.style.width = cw + 'px'; return { el, s: el.querySelector('.ck-s'), v: el.querySelector('.ck-v') };
    };
    const C0 = card(0, 'Original', d.o, ''), C1 = card(1, 'Our answer', d.a, ''), C2 = card(2, d.who + '’s answer', d.w, '');
    const V0 = d.f(2), V1 = d.g(2), V2 = d.wf(2);
    const fill = (C, S, M, V) => { C.s.innerHTML = K(`=${S}`) + '<br>' + K(`=${M}`); C.v.innerHTML = K(`=\\boldsymbol{${tn(V)}}`); hide(C.s, C.v); };
    fill(C0, d.oS, d.oM, V0); fill(C1, d.aS, d.aM, V1); fill(C2, d.wS, d.wM, V2);
    const sy = cy + (W < 960 ? 36 : 6); // narrower cards: the stamps sit below the card heading, not on it
    const st1 = add(stage, h('div', 'xp-stamp ok', '✓'), 20 + 2 * cw + 10 - 64, sy), st2 = add(stage, h('div', 'xp-stamp no', '✗'), 20 + 3 * cw + 20 - 64, sy); hide(st1, st2);
    const strip = add(stage, h('div', 'ck-strip'), 20, 370); strip.style.width = (W - 40) + 'px'; hide(strip);
    const steps = [{
      cap: `Pick a test value: ${T(d.x + '=2')}. <b>Not 0 or 1</b>: ${T('1')} to any power is ${T('1')}, so those can hide a wrong exponent.`,
      run: (c) => c.pop(pick, 380)
    }, {
      cap: `Substitute into the <b>original</b>, using the order of operations: ${T(d.o)} becomes <b>${fmt(V0)}</b>.`,
      run: (c) => Promise.all([c.fadeIn(C0.s, 380), c.pop(C0.v, 400, { delay: 300 })])
    }, {
      cap: `Now our answer: ${T(d.a)} also gives <b>${fmt(V1)}</b>. The values <b>match</b> ✓, so the simplification checks out.`,
      run: async (c) => { await Promise.all([c.fadeIn(C1.s, 380), c.pop(C1.v, 400, { delay: 300 })]); C0.el.classList.add('good'); C1.el.classList.add('good'); await stampIn(c, st1); }
    }, {
      cap: `${d.who}’s answer gives <b>${fmt(V2)}</b>, not ${fmt(V0)}. If two expressions are equal, they’re equal for <b>every</b> value. These aren’t, so ${T(d.w)} is <b>wrong</b> (${d.why}).`,
      run: async (c) => { await Promise.all([c.fadeIn(C2.s, 380), c.pop(C2.v, 400, { delay: 300 })]); C2.el.classList.add('bad'); await stampIn(c, st2); }
    }];
    if (d.one) steps.push({
      cap: `Why not test with ${T('x=1')}? Try it: the original gives ${T('5(1)^2\\times4(1)^4=20')}, and Devon’s ${T('20(1)^8=20')} too. <b>Both 20!</b> ${T('x=1')} can’t catch an exponent mistake.`,
      run: (c) => { strip.innerHTML = `<b>Test with ${K('x=1')}:</b> &nbsp;original ${K('=5(1)^2\\times4(1)^4=20')} &nbsp;&nbsp; Devon ${K('=20(1)^8=20')} &nbsp;<b class="red">fooled!</b>`; return c.fadeIn(strip, 400); }
    });
    return steps;
  }
};

/* ============ 3. Negative bases: track the sign ============ */
const SIGNS = {
  p4: { kind: 'p', n: 4 }, p5: { kind: 'p', n: 5 }, m4: { kind: 'm', n: 4 }, m5: { kind: 'm', n: 5 },
  qa: { kind: 'q', top: ['p', 8], bot: ['p', 5], t: '(-a)^8\\div(-a)^5' },
  qb: { kind: 'q', top: ['m', 8], bot: ['p', 5], t: '-a^8\\div(-a)^5' },
  qc: { kind: 'q', top: ['m', 9], bot: ['p', 4], t: '-a^9\\div(-a)^4' }
};
const sgT = (k, n) => (k === 'p' ? `(-a)^{${n}}` : `-a^{${n}}`);
const signs = {
  title: 'Where does the negative sign go?',
  height: 420,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'p4', label: tex('(-a)^4') }, { v: 'p5', label: tex('(-a)^5') }, { v: 'm4', label: tex('-a^4') }, { v: 'm5', label: tex('-a^5') },
    { sep: 'Example 5 check:' }, { v: 'qa', label: '(a)' }, { v: 'qb', label: '(b)' }, { v: 'qc', label: '(c)' }],
  intro: (k) => { const d = SIGNS[k]; return d.kind === 'q' ? `Simplify ${T(d.t)}. Rewrite the top and the bottom with their sign <b>out front</b>, then count the negatives.` : `What does ${T(sgT(d.kind, d.n))} mean? Is it positive or negative?`; },
  make(stage, key, ex) {
    const d = SIGNS[key];
    return d.kind === 'q' ? signQuot(stage, d, ex.W) : signPow(stage, d, ex.W);
  }
};
function signPow(stage, d, W) {
  const { kind, n } = d, neg = kind === 'p', even = n % 2 === 0;
  add(stage, h('div', 'sg-big', K(sgT(kind, n))), 30, 18);
  const TW = neg ? 92 : 62, G = 12, ty = 120;
  const xs0 = (W - (n * (TW + G) - G + (neg ? 0 : 90))) / 2 + (neg ? 0 : 90);
  const tiles = Array.from({ length: n }, (_, i) => { const e = add(stage, h('div', 'xt sg-t' + (neg ? ' pn' : ' va'), neg ? K('(\\textcolor{#c93a33}{-}a)') : K('a')), xs0 + i * (TW + G), ty); e.style.width = TW + 'px'; hide(e); return e; });
  const minus = neg ? null : add(stage, h('div', 'sg-minus', '−'), xs0 - 86, ty + 2);
  const minusL = neg ? null : add(stage, h('div', 'sg-ml c', 'applied<br>last'), xs0 - 58, ty + 92);
  if (minus) hide(minus, minusL);
  const lab = add(stage, h('div', 'xp-bl c', neg ? `${n} factors of ${T('(-a)')}` : `${n} factors of ${T('a')}: the exponent touches only ${T('a')}`), xs0 + (n * (TW + G) - G) / 2, ty - 26); hide(lab);
  const svg = add(stage, svgEl('svg', { class: 'sg-svg', width: W, height: 120 }), 0, ty + 62);
  const plus = [], arcs = [];
  if (neg) for (let i = 0; i + 1 < n; i += 2) {
    const x1 = xs0 + i * (TW + G) + TW / 2, x2 = xs0 + (i + 1) * (TW + G) + TW / 2, mid = (x1 + x2) / 2;
    const p = svg.appendChild(svgEl('path', { d: `M ${x1} 6 Q ${mid} 58 ${x2} 6`, class: 'sg-arc' })); arcs.push(p); p.style.opacity = 0;
    const pl = add(stage, h('div', 'sg-plus c', '+'), mid, ty + 62 + 46); hide(pl); plus.push(pl);
  }
  const lone = neg && !even ? add(stage, h('div', 'sg-lone c', '1 left over'), xs0 + (n - 1) * (TW + G) + TW / 2, ty + 62 + 46) : null;
  if (lone) hide(lone);
  const res = add(stage, h('div', 'sg-res c', K(neg ? (even ? `(-a)^{${n}}=a^{${n}}` : `(-a)^{${n}}=-a^{${n}}`) : `-a^{${n}}=-(a^{${n}})`)), W * 0.3, 300); hide(res);
  const sign = add(stage, h('div', 'sg-verdict c ' + (neg && even ? 'pos' : 'neg'), neg && even ? 'positive' : 'negative'), W * 0.3, 352); hide(sign);
  const v2 = 2 ** n, num = add(stage, h('div', 'sg-num', neg ? K(`(-2)^{${n}}=${'(-2)'.repeat(n)}=${even ? v2 : -v2}`) : K(`-2^{${n}}=-(${'2\\cdot'.repeat(n - 1)}2)=-${v2}`) + '<br>' + `<span class="muted">but</span> ${K(`(-2)^{${n}}=${even ? v2 : -v2}`)}`), W * 0.54, 278); hide(num);
  num.style.width = (W * 0.44) + 'px';
  if (neg) return [{
    cap: `The bracket puts the negative sign <b>inside the base</b>. ${T(`(-a)^${n}`)} means <b>${n} factors</b> of ${T('(-a)')}, and every one of them carries a negative.`,
    run: (c) => Promise.all([c.fadeIn(lab, 300), ...tiles.map((t, i) => c.pop(t, 340, { delay: i * 90 }))])
  }, {
    cap: `Pair up the negatives. Each pair multiplies to a <b>positive</b>: ${T('(-)(-)=(+)')}.${even ? ` All ${n} negatives find a partner.` : ` With ${n} of them, <b>one is left over</b>.`}`,
    run: async (c) => {
      for (let i = 0; i < arcs.length; i++) {
        const p = arcs[i], len = p.getTotalLength ? p.getTotalLength() || 200 : 200; p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.style.opacity = 1;
        await Promise.all([c.anim(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], 380), c.pop(plus[i], 320, { delay: 200 })]);
      }
      if (lone) { tiles[n - 1].classList.add('lone'); await c.pop(lone, 380); }
    }
  }, {
    cap: even ? `No negatives left over, so the result is <b>positive</b>: ${T(`(-a)^{${n}}=a^{${n}}`)}. An <b>even</b> power of a negative base is positive.`
      : `One negative is left over, so the result is <b>negative</b>: ${T(`(-a)^{${n}}=-a^{${n}}`)}. An <b>odd</b> power of a negative base is negative.`,
    run: (c) => Promise.all([c.fadeIn(res, 420), c.pop(sign, 380, { delay: 300 })])
  }, {
    cap: `Check with ${T('a=2')}: ${T(`(-2)^{${n}}=${even ? v2 : -v2}`)}.`,
    run: (c) => c.fadeIn(num, 420)
  }];
  return [{
    cap: `No bracket: the base is just ${T('a')}. The exponent ${n} touches <b>only</b> the ${T('a')}; the negative sign sits outside and waits.`,
    run: (c) => Promise.all([c.fadeIn(lab, 300), c.anim(minus, [{ opacity: 0 }, { opacity: 0.45 }], 400), c.fadeIn(minusL, 300), ...tiles.map((t, i) => c.pop(t, 340, { delay: i * 90 }))])
  }, {
    cap: `${T(`a^{${n}}=${Array(n).fill('a').join('\\cdot ')}`)}. There are <b>no negatives</b> in here at all, whether ${n} is even or odd.`,
    run: (c) => Promise.all(tiles.map((t, i) => c.anim(t, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], 300, { delay: i * 80 })))
  }, {
    cap: `<b>Then</b> apply the negative sign: ${T(`-a^{${n}}=-(a^{${n}})`)}. It’s the <b>opposite</b> of ${T(`a^{${n}}`)}, so (for ${T('a>0')}) it’s negative.`,
    run: async (c) => { await c.anim(minus, [{ opacity: 0.45, transform: 'scale(1)' }, { opacity: 1, transform: 'scale(1.3)' }, { opacity: 1, transform: 'scale(1)' }], 420); await Promise.all([c.fadeIn(res, 420), c.pop(sign, 380, { delay: 300 })]); }
  }, {
    cap: `Check with ${T('a=2')}: ${T(`-2^{${n}}=-${v2}`)}, but ${T(`(-2)^{${n}}=${even ? v2 : -v2}`)}. ${even ? 'The bracket changes the answer!' : 'Same value here, but for different reasons.'}`,
    run: (c) => c.fadeIn(num, 420)
  }];
}
function signQuot(stage, d, W) {
  const fx = W * 0.2, [tk, tn_] = d.top, [bk, bn] = d.bot;
  const sOf = (k, n) => (k === 'm' ? -1 : n % 2 ? -1 : 1);
  const rw = (k, n) => (sOf(k, n) < 0 ? '-' : '+') + `a^{${n}}`;
  const why = (k, n) => (k === 'm' ? `no bracket: ${T(`-(a^{${n}})`)}` : n % 2 ? `odd power: negative` : `even power: positive`);
  const top = add(stage, h('div', 'sg-q c', K(sgT(tk, tn_))), fx, 70), bot = add(stage, h('div', 'sg-q c', K(sgT(bk, bn))), fx, 168);
  const bar = add(stage, h('div', 'sg-qbar'), fx - 110, 118); bar.style.width = '220px';
  const ar1 = add(stage, h('div', 'sg-arrow'), fx + 120, 56), ar2 = add(stage, h('div', 'sg-arrow'), fx + 120, 154);
  ar1.textContent = ar2.textContent = '→';
  const r1 = add(stage, h('div', 'sg-rw', `${K(rw(tk, tn_))}<small>${why(tk, tn_)}</small>`), fx + 170, 46), r2 = add(stage, h('div', 'sg-rw', `${K(rw(bk, bn))}<small>${why(bk, bn)}</small>`), fx + 170, 144);
  hide(ar1, ar2, r1, r2);
  [r1, r2].forEach((r, i) => r.classList.add(sOf(...(i ? d.bot : d.top)) < 0 ? 'neg' : 'pos'));
  const negs = [sOf(tk, tn_), sOf(bk, bn)].filter((s) => s < 0).length, sgn = negs % 2 ? -1 : 1, e = tn_ - bn;
  const tally = add(stage, h('div', 'sg-tally'), W * 0.66, 50); tally.style.width = (W * 0.32) + 'px'; hide(tally);
  tally.innerHTML = `<div class="ck-h">Negative signs</div><div class="sg-dots">${negs ? Array(negs).fill('<span class="sg-dot">−</span>').join('') : '<span class="muted">none</span>'}</div><div class="sg-tv ${sgn < 0 ? 'neg' : 'pos'}">${negs === 2 ? 'two cancel: <b>positive</b>' : negs === 1 ? 'one: <b>negative</b>' : '<b>positive</b>'}</div>`;
  const res = add(stage, h('div', 'sg-res c', K(`${d.t}=${sgn < 0 ? '-' : ''}a^{${tn_}-${bn}}=\\boldsymbol{${sgn < 0 ? '-' : ''}a^{${e}}}`)), W / 2, 300); hide(res);
  const alt = d.top[0] === 'p' && d.bot[0] === 'p' ? add(stage, h('div', 'sg-alt c', `Or keep ${K('(-a)')} as the base: ${K(`(-a)^{8-5}=(-a)^3=-a^3`)}`), W / 2, 366) : null;
  if (alt) hide(alt);
  const capTop = tk === 'm' ? `The top, ${T(sgT(tk, tn_))}, has <b>no bracket</b>: it means ${T(`-(a^{${tn_}})`)}, negative.` : `The top, ${T(sgT(tk, tn_))}: the base is ${T('-a')} and ${tn_} is <b>${tn_ % 2 ? 'odd' : 'even'}</b>, so it equals ${T(rw(tk, tn_).replace('+', ''))}.`;
  const capBot = `The bottom, ${T(sgT(bk, bn))}: base ${T('-a')}, and ${bn} is <b>${bn % 2 ? 'odd' : 'even'}</b>, so it equals ${T(rw(bk, bn).replace('+', ''))}.`;
  return [{
    cap: capTop + ' Write the sign out front.',
    run: (c) => Promise.all([c.fadeIn(ar1, 250), c.fadeIn(r1, 400, { delay: 150, from: 'translateX(-10px)' })])
  }, {
    cap: capBot,
    run: (c) => Promise.all([c.fadeIn(ar2, 250), c.fadeIn(r2, 400, { delay: 150, from: 'translateX(-10px)' })])
  }, {
    cap: negs === 2 ? `Count the negative signs: <b>two</b>. A negative divided by a negative is <b>positive</b>, so they cancel.` : negs === 1 ? `Count the negative signs: just <b>one</b>, so the answer is <b>negative</b>.` : `No negative signs at all, so the answer is <b>positive</b>.`,
    run: (c) => c.fadeIn(tally, 400)
  }, {
    cap: `Now the <b>Quotient Law</b> on ${T('a')}: ${T(`a^{${tn_}-${bn}}=a^{${e}}`)}. So ${T(`${d.t}=${sgn < 0 ? '-' : ''}a^{${e}}`)}.${alt ? ' (Or, with the same base ' + T('(-a)') + ' top and bottom, go straight to ' + T('(-a)^3') + '.)' : ''}`,
    run: (c) => Promise.all([c.pop(res, 450), alt ? c.fadeIn(alt, 400, { delay: 400 }) : null])
  }];
}

/* ============ 4. Variable exponents: the arithmetic happens up in the exponent ============ */
// an exponent is a linear expression { letter: coefficient, '': constant }
const VX = {
  n1: { base: 'n', vars: ['k'], top: [{ k: 3, '': 4 }, { k: 1, '': -1 }], bot: [], t: 'n^{3k+4}\\cdot n^{k-1}' },
  n2: { base: 'y', vars: ['p'], top: [{ p: 6, '': 1 }], bot: [{ p: 2, '': -5 }], t: '\\dfrac{y^{6p+1}}{y^{2p-5}}' },
  a: { base: 'b', vars: ['x', 'y'], top: [{ x: 5, y: 2 }], bot: [{ x: 1, y: -3 }], t: '\\dfrac{b^{5x+2y}}{b^{x-3y}}' },
  b: { base: 'x', vars: ['a', 'b'], top: [{ a: 4, b: 9 }, { a: 2, b: 1 }], bot: [{ a: 1 }, { a: 3, b: -4 }], t: '\\dfrac{x^{4a+9b}\\cdot x^{2a+b}}{x^a\\cdot x^{3a-4b}}' },
  c: { base: 'm', vars: ['x'], top: [{ x: 2, '': 5 }], bot: [{ '': 6 }], t: '\\dfrac{m^{2x+5}}{m^6}' }
};
const vxCol = (d, v) => (v === '' ? NUM : VC[d.vars.indexOf(v) % VC.length]);
function termT(d, v, k, first, o = {}) { // one signed term, coloured by letter
  const sgn = k < 0 ? '-' : first ? '' : '+', a = Math.abs(k), body = v === '' ? String(a) : (a === 1 ? '' : a) + v;
  const s = tc(vxCol(d, v), body);
  return o.flip ? (sgn ? `\\textcolor{#c93a33}{${sgn}}` : '') + `\\htmlClass{vx-flip}{${s}}` : sgn + s;
}
function linT(d, e, o = {}) { // 5x+2y, coloured; o.flip marks every term as flipped
  const keys = [...d.vars, ''].filter((v) => e[v]);
  if (!keys.length) return '0';
  return keys.map((v, i) => termT(d, v, e[v], i === 0, o)).join('');
}
const linAdd = (a, b, s = 1) => { const r = { ...a }; for (const k in b) r[k] = (r[k] || 0) + s * b[k]; for (const k in r) if (!r[k]) delete r[k]; return r; };
const linPlain = (d, e) => { const keys = [...d.vars, ''].filter((v) => e[v]); return keys.length ? keys.map((v, i) => { const k = e[v], a = Math.abs(k); return (k < 0 ? '-' : i ? '+' : '') + (v === '' ? a : (a === 1 ? '' : a) + v); }).join('') : '0'; };
const linVal = (e, vals) => Object.keys(e).reduce((s, k) => s + e[k] * (k === '' ? 1 : vals[k]), 0);
const varExp = {
  title: 'All the work happens up in the exponent',
  height: 486,
  choices: [{ v: 'n1', label: tex('n^{3k+4}\\cdot n^{k-1}') }, { v: 'n2', label: tex('\\frac{y^{6p+1}}{y^{2p-5}}') }, { sep: 'Example 6 check:' }, { v: 'a', label: '(a)' }, { v: 'b', label: '(b)' }, { v: 'c', label: '(c)' }],
  intro: (k) => `Simplify ${T(VX[k].t)}. Every power has the <b>same base</b> ${T(VX[k].base)}, so the exponent laws still work: we just add and subtract <b>expressions</b>.`,
  make(stage, key, ex) {
    const W = ex.W, d = VX[key], B = d.base;
    const sumT = linAdd(d.top.reduce((s, e) => linAdd(s, e), {}), {}), sumB = d.bot.reduce((s, e) => linAdd(s, e), {});
    const R = linAdd(sumT, sumB, -1), RT = linPlain(d, R);
    const head = add(stage, h('div', 'vx-head', K(d.t)), 30, 8);
    const fin = add(stage, h('div', 'vx-head vx-fin', K(`=${B}^{${RT}}`)), 30 + head.offsetWidth + 14, 8); hide(fin);
    const panel = add(stage, h('div', 'vx-panel'), 20, 124); panel.style.width = (W - 40) + 'px'; panel.style.height = '290px';
    panel.innerHTML = `<div class="vx-ph">Up in the exponent <span class="muted">· base ${T(B)} stays the same</span></div>`;
    const lines = [], lh = 48;
    const line = (src, note) => {
      const y = 40 + lines.length * lh;
      const el = h('div', 'vx-line', K(src)); el.style.top = y + 'px'; panel.appendChild(el);
      const n = h('div', 'vx-note', note || ''); n.style.top = y + 'px'; panel.appendChild(n);
      hide(el, n); lines.push({ el, n }); return { el, n };
    };
    const show = (c, r) => Promise.all([c.fadeIn(r.el, 400, { from: 'translateX(-10px)' }), c.fadeIn(r.n, 350, { delay: 200 })]);
    const single = (e) => Object.keys(e).filter((k) => e[k]).length === 1 && Object.values(e).find((x) => x) > 0;
    const br = (e, o) => (single(e) ? linT(d, e, o) : `(${linT(d, e, o)})`);
    const steps = [];
    const multiTop = d.top.length > 1 && d.bot.length, multiBot = d.bot.length > 1;
    let T0 = d.top, Bt = d.bot;
    if (multiTop) {
      const r = line(`${d.top.map((e) => br(e)).join('+')}=${linT(d, sumT)}`, 'top: Product Law, add');
      steps.push({ cap: `Top first: ${T(`${B}^{\\cdots}\\cdot ${B}^{\\cdots}`)} is the <b>Product Law</b>, so <b>add</b> the exponents and collect like terms: ${T(linPlain(d, sumT))}.`, run: (c) => show(c, r) });
      T0 = [sumT];
    }
    if (multiBot) {
      const r = line(`${d.bot.map((e) => br(e)).join('+')}=${linT(d, sumB)}`, 'bottom: Product Law, add');
      steps.push({ cap: `Then the bottom, the same way: <b>add</b> its exponents to get ${T(linPlain(d, sumB))}.`, run: (c) => show(c, r) });
      Bt = [sumB];
    }
    const terms = []; // [{v,k,flip}]
    T0.forEach((e) => [...d.vars, ''].forEach((v) => { if (e[v]) terms.push({ v, k: e[v], flip: false }); }));
    Bt.forEach((e) => [...d.vars, ''].forEach((v) => { if (e[v]) terms.push({ v, k: -e[v], flip: true }); }));
    const combT = (d.bot.length ? `${br(T0[0])}-${br(Bt[0])}` : T0.map((e) => br(e)).join('+'));
    const r1 = line(combT, d.bot.length ? 'Quotient Law: subtract' : 'Product Law: add');
    steps.push({
      cap: d.bot.length ? `Same base ${T(B)} top and bottom, so the <b>Quotient Law</b>: subtract the exponents. Subtract the <b>whole</b> bottom exponent, so it goes in <b>brackets</b>.`
        : `Same base ${T(B)}, multiplied: the <b>Product Law</b>. Add the exponents, each one in brackets for now.`,
      run: (c) => show(c, r1)
    });
    const flatT = terms.map((t, i) => termT(d, t.v, t.k, i === 0, { flip: t.flip && !single(Bt[0] || {}) })).join('');
    const anyFlip = d.bot.length > 0 && !single(Bt[0]);
    const r2 = line(`=${flatT}`, anyFlip ? 'the minus flips <b>every</b> sign in its bracket' : d.bot.length ? 'remove the brackets' : 'a plus sign changes nothing');
    const subB = Bt[0];
    steps.push({
      cap: anyFlip ? `Remove the brackets. The minus sign in front of ${T(br(subB).replace(/\\textcolor\{[^}]*\}/g, ''))} <b>flips every sign inside</b>: ${T('-' + `(${linPlain(d, subB)})`)} becomes ${T(linPlain(d, linAdd({}, subB, -1)))}.`
        : d.bot.length ? `Remove the brackets. Only one term is being subtracted, so it’s just ${T('-' + linPlain(d, subB))}.` : `Remove the brackets. With a <b>plus</b> sign in front, nothing changes.`,
      run: async (c) => { await show(c, r2); if (anyFlip) { const fl = [...r2.el.querySelectorAll('.vx-flip')]; await Promise.all(fl.map((e, i) => c.anim(e, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], 420, { delay: i * 150 }))); } }
    });
    const groups = [...d.vars, ''].filter((v) => terms.some((t) => t.v === v));
    const grpT = groups.map((v, gi) => { const ts = terms.filter((t) => t.v === v); const inner = ts.map((t, i) => termT(d, v, t.k, i === 0)).join(''); return (gi ? '+' : '') + (ts.length > 1 ? `(${inner})` : inner); }).join('');
    const r3 = line(`=${grpT}=${linT(d, R)}`, 'collect like terms');
    const collectTxt = groups.map((v) => { const ts = terms.filter((t) => t.v === v); const sum = ts.reduce((s, t) => s + t.k, 0); return ts.length > 1 ? T(`${ts.map((t, i) => (t.k < 0 ? '-' : i ? '+' : '') + (v === '' ? Math.abs(t.k) : (Math.abs(t.k) === 1 ? '' : Math.abs(t.k)) + v)).join('')}=${linPlain(d, { [v]: sum })}`) : null; }).filter(Boolean);
    steps.push({
      cap: `<b>Collect like terms</b>, one letter at a time${collectTxt.length ? ': ' + collectTxt.join(' and ') : ''}. So the exponent is ${T(RT)}, and the answer is ${T(`${B}^{${RT}}`)}.`,
      run: async (c) => { await show(c, r3); await c.pop(fin, 450); }
    });
    // numerical check
    const vals = {}; d.vars.forEach((v, i) => (vals[v] = i ? 1 : 2));
    const valTxt = d.vars.map((v) => `${v}=${vals[v]}`).join(',\\ ');
    const ups = d.top.map((e) => linVal(e, vals)), dns = d.bot.map((e) => linVal(e, vals));
    const tot = ups.reduce((s, x) => s + x, 0) - dns.reduce((s, x) => s + x, 0), rv = linVal(R, vals);
    const sumTxt = ups.map((x, i) => (i && x >= 0 ? '+' : '') + x).join('') + dns.map((x) => (x < 0 ? `-(${x})` : '-' + x)).join('');
    const chk = add(stage, h('div', 'vx-check', `<b>Check</b> with ${K(valTxt)}: &nbsp;original ${K(`${sumTxt}=${tot}`)} &nbsp;·&nbsp; answer ${K(`${linPlain(d, R).replace(/([a-z])/g, (m) => `(${vals[m]})`)}=${rv}`)} <b class="ok">✓</b>`), 20, 426);
    chk.style.width = (W - 40) + 'px'; hide(chk);
    steps.push({
      cap: `<b>Check</b> by picking numbers for the letters, ${T(valTxt)}: the original exponents combine to <b>${tot}</b>, and ${T(RT)} also gives <b>${rv}</b> ✓.`,
      run: (c) => c.fadeIn(chk, 400)
    });
    void head;
    return steps;
  }
};

/* ============ warm-up: the photocopier ============ */
function mountCopier() {
  const box = document.getElementById('copier'); if (!box) return;
  // sizes can come from the box's CSS (--pc-s, --pc-base, --pc-x0, --pc-gap) so the one-screen layout can shrink it
  const cs = getComputedStyle(box), cv = (n) => parseFloat(cs.getPropertyValue(n));
  const S = cv('--pc-s') || 36, base = cv('--pc-base') || 330, gap = cv('--pc-gap'), x0 = cv('--pc-x0') || 262;
  const xs = gap ? [0, 1, 2, 3].map((i) => x0 + S * (2 ** i - 1) + gap * i) : [262, 346, 474, 672], names = ['Original', 'Copy 1', 'Copy 2', 'Copy 3'];
  box.innerHTML = `
    <svg class="pc-mach" viewBox="0 0 150 172" width="150" height="172" aria-hidden="true">
      <rect x="10" y="66" width="130" height="96" rx="6" fill="#c8cdd4" stroke="#1e2d46" stroke-width="2"/>
      <path d="M22 96h106M22 126h106" stroke="#7d8796" stroke-width="2"/>
      <rect x="62" y="80" width="26" height="6" fill="#7d8796"/><rect x="62" y="110" width="26" height="6" fill="#7d8796"/><rect x="62" y="140" width="26" height="6" fill="#7d8796"/>
      <circle cx="26" cy="166" r="5" fill="#1e2d46"/><circle cx="124" cy="166" r="5" fill="#1e2d46"/>
      <rect x="2" y="22" width="146" height="44" rx="5" fill="#e3e6ea" stroke="#1e2d46" stroke-width="2"/>
      <rect x="2" y="10" width="146" height="12" rx="3" fill="#4b5668" stroke="#1e2d46" stroke-width="2"/>
      <rect x="12" y="30" width="70" height="28" rx="3" fill="#1e4628"/>
      <text x="47" y="51" text-anchor="middle" fill="#7be08a" font-size="18" font-weight="800" font-family="ui-rounded, system-ui, sans-serif">200%</text>
      <circle class="pc-go" cx="104" cy="44" r="9" fill="#c93a33"/><circle class="pc-go2" cx="128" cy="44" r="9" fill="#12805a"/>
    </svg>
    <div class="pc-read" aria-live="polite"></div>
    <div class="pc-ctl no-ink"><button class="pill pc-press" type="button">Press COPY</button><button class="exb" type="button" title="Start over" aria-label="Start over"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/></svg></button></div>`;
  const read = box.querySelector('.pc-read'), press = box.querySelector('.pc-press'), restart = box.querySelector('.exb');
  const face = '<svg viewBox="0 0 1 1" class="pc-face" preserveAspectRatio="none"><circle cx=".5" cy=".5" r=".36" fill="#ffecb3" stroke="#c88c14" stroke-width=".03"/><circle cx=".37" cy=".43" r=".045" fill="#1e2d46"/><circle cx=".63" cy=".43" r=".045" fill="#1e2d46"/><path d="M.33 .57 A .18 .18 0 0 0 .67 .57" fill="none" stroke="#1e2d46" stroke-width=".035"/></svg>';
  const sheets = names.map((nm, i) => {
    const k = 2 ** i, w = S * k;
    const ph = h('div', 'pc-ph'); at(ph, xs[i], base - w); ph.style.width = ph.style.height = w + 'px'; ph.innerHTML = '<span>?</span>'; if (i === 0) ph.style.display = 'none'; box.appendChild(ph);
    const el = h('button', 'pc-sheet'); el.type = 'button'; el.title = 'Tap to see how many originals fit';
    at(el, xs[i], base - w); el.style.width = el.style.height = w + 'px';
    let grid = '';
    for (let j = 1; j < k; j++) grid += `<path d="M${j / k} 0V1M0 ${j / k}H1"/>`;
    el.innerHTML = face + `<svg viewBox="0 0 1 1" class="pc-grid" preserveAspectRatio="none">${grid}<rect x="0" y="0" width="1" height="1"/></svg>` + `<span class="pc-badge">${k * k === 1 ? '1 original' : k * k + ' originals'}</span>`;
    box.appendChild(el);
    const lab = h('div', 'pc-lab', `<b>${nm}</b><br>${3 * k} cm wide`); at(lab, xs[i] + w / 2, base + 8); box.appendChild(lab);
    const arrow = i ? h('div', 'pc-arrow', '<span>200%</span>→') : null;
    if (arrow) { at(arrow, xs[i - 1] + S * 2 ** (i - 1) + 4, base - 34); arrow.style.width = (xs[i] - xs[i - 1] - S * 2 ** (i - 1) - 8) + 'px'; box.appendChild(arrow); }
    el.addEventListener('click', () => { el.classList.toggle('tiled'); say(i); });
    return { el, ph, lab, arrow, k };
  });
  let made = 0;
  const pw = ['1', '4=2^2', '16=4^2=(2^2)^2', '64=4^3=(2^2)^3=2^6'];
  function say(i) { const s = sheets[i]; read.innerHTML = `<b>${names[i]}:</b> ${3 * s.k} cm wide<br>area = ${tex(pw[i])} × original`; }
  function render() {
    sheets.forEach((s, i) => { const on = i <= made; s.el.style.visibility = on ? 'visible' : 'hidden'; s.lab.style.visibility = on ? 'visible' : 'hidden'; if (s.arrow) s.arrow.style.visibility = on ? 'visible' : 'hidden'; s.ph.style.visibility = on ? 'hidden' : 'visible'; });
    press.disabled = made >= 3; press.textContent = made >= 3 ? 'Out of paper!' : 'Press COPY';
  }
  press.addEventListener('click', () => {
    if (made >= 3) return;
    made++; render();
    const s = sheets[made], prev = sheets[made - 1];
    const dx = (parseFloat(prev.el.style.left) - parseFloat(s.el.style.left)), sc = 0.5;
    s.el.animate([{ transform: `translate(${dx}px, ${S * s.k - S * prev.k}px) scale(${sc})`, opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 650, easing: 'cubic-bezier(.25,.75,.3,1)' });
    if (s.arrow) s.arrow.animate([{ opacity: 0 }, { opacity: 1 }], 400);
    box.querySelector('.pc-go2').animate([{ fill: '#12805a' }, { fill: '#7be08a' }, { fill: '#12805a' }], 500);
    say(made);
  });
  restart.addEventListener('click', () => { made = 0; sheets.forEach((s) => s.el.classList.remove('tiled')); render(); read.innerHTML = 'The original is <b>3 cm</b> wide. Press <b>COPY</b>.'; });
  render(); read.innerHTML = 'The original is <b>3 cm</b> wide. Press <b>COPY</b>.';
}

function mountReveals() {
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
  document.querySelectorAll('[data-trap]').forEach((b) => b.addEventListener('click', () => b.closest('.trap').classList.toggle('shown')));
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { expand, cancel, oneBase, chain, check, signs, varExp };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountCopier(); mountReveals(); mountExplainers();
