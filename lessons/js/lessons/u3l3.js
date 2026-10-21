/* Math 10C · Unit 3 · Lesson 3 — Multiplying Polynomials I: Special Products. The explainers and warm-up on this page. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const box = (el, w, ht) => { el.style.width = w + 'px'; el.style.height = ht + 'px'; return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const K = (s, d) => tex(s, d);
const T = (s) => tex(s); // inline math in captions
const tn = (n) => fmt(n).replace(/ /g, '\\,'); // 2 500 → 2\,500 inside KaTeX
const sgn = (n) => (n < 0 ? '-' : '+');

/* the unit's colours: x²/a² teal, x/ab amber, 1/b² slate */
const TEAL = '#0f6f69', AMB = '#a8650a', SLATE = '#3d5f8f';
const cA = (s) => `\\textcolor{${TEAL}}{${s}}`, cB = (s) => `\\textcolor{${AMB}}{${s}}`;

/* where an element sits inside the stage, in stage pixels (the lesson may be scaled to fit the screen) */
function rel(stage, el) {
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, r = el.getBoundingClientRect();
  return { x: (r.left - sr.left) / k - stage.clientLeft, y: (r.top - sr.top) / k - stage.clientTop, w: r.width / k, h: r.height / k };
}
function stampIn(c, el) { return c.anim(el, [{ opacity: 0, transform: 'scale(1.9) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); }
const pulse = (c, el, s = 1.06, o = {}) => c.anim(el, [{ scale: '1' }, { scale: String(s) }, { scale: '1' }], 520, o); // uses `scale`, so it never undoes a transform
const KN = (s) => `<span class="nw">${K(s)}</span>`;
const fadeOut = (c, el, ms = 300, o = {}) => c.anim(el, [{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], ms, o);
const moveTo = (c, el, x, y, ms = 650, o = {}) => c.anim(el, [{ left: el.style.left, top: el.style.top }, { left: x + 'px', top: y + 'px' }], ms, o);

/* dimension marks: a bar with end ticks and a label */
function dimH(stage, x, y, w, label, o = {}) {
  const bar = add(stage, box(h('div', 'sp-dbar h'), w, 12), x, y);
  const lab = add(stage, h('div', 'sp-dim c', K(label)), x + w / 2, y + (o.below ? 28 : -14));
  return [bar, lab];
}
function dimV(stage, x, y, ht, label, o = {}) {
  const bar = add(stage, box(h('div', 'sp-dbar v'), 12, ht), x, y);
  const lab = add(stage, h('div', 'sp-dim', K(label)), o.right ? x + 22 : x - 10, y + ht / 2);
  lab.style.translate = o.right ? '0 -50%' : '-100% -50%';
  return [bar, lab];
}

/* ============ 1. One square, four pieces: (a + b)² ============ */
const SQ = {
  ab: { A: 'a', B: 'b', head: '(a+b)^2', p: ['a^2', 'ab', 'ab', 'b^2'], dbl: '2(a)(b)=2ab', comb: 'a^2+2ab+b^2', fin: '(a+b)^2=a^2+2ab+b^2', ra: 0.62 },
  x3: { A: 'x', B: '3', head: '(x+3)^2', p: ['x^2', '3x', '3x', '9'], dbl: '2(x)(3)=6x', comb: 'x^2+6x+9', fin: '(x+3)^2=x^2+6x+9', ra: 0.66 },
  n35: { A: '30', B: '5', head: '35^2=(30+5)^2', p: ['900', '150', '150', '25'], dbl: '2(30)(5)=300', comb: '900+300+25=1\\,225', fin: '35^2=1\\,225', ra: 0.76, num: true },
  ex1a: { A: 'x', B: '9', head: '(x+9)^2', p: ['x^2', '9x', '9x', '81'], dbl: '2(x)(9)=18x', comb: 'x^2+18x+81', fin: '(x+9)^2=x^2+18x+81', ra: 0.6 }
};
const squareSplit = {
  title: 'One square, four pieces',
  height: 430,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ab', label: tex('(a+b)^2') }, { v: 'x3', label: tex('(x+3)^2') }, { v: 'n35', label: 'Warm-up: ' + tex('35^2') }, { sep: 'Example 1 check:' }, { v: 'ex1a', label: '(a) ' + tex('(x+9)^2') }],
  intro: (k) => { const d = SQ[k]; return `Here is a square with side ${T(`${d.A}+${d.B}`)}. Its area is ${T(d.num ? '35^2' : d.head)}. Let’s find that area <b>another way</b>, piece by piece.`; },
  make(stage, key, ex) {
    const W = ex.W, d = SQ[key], { A, B, p } = d, x0 = 86, y0 = 58, S = 304, pa = Math.round(S * d.ra), pb = S - pa;
    add(stage, box(h('div', 'sp-sqo'), S, S), x0, y0);
    const rects = [[x0, y0, pa, pa, 'aa'], [x0 + pa, y0, pb, pa, 'ab'], [x0, y0 + pa, pa, pb, 'ab'], [x0 + pa, y0 + pa, pb, pb, 'bb']];
    const pcs = rects.map(([x, y, w, ht, cls], i) => { const e = add(stage, box(h('div', 'sp-pc ' + cls, `<span>${K(p[i])}</span>`), w, ht), x, y); hide(e); return e; });
    const cutV = add(stage, box(h('div', 'sp-cut'), 3, S), x0 + pa - 1.5, y0), cutH = add(stage, box(h('div', 'sp-cut'), S, 3), x0, y0 + pa - 1.5);
    hide(cutV, cutH);
    const fullT = dimH(stage, x0, y0 - 18, S, `${A}+${B}`), fullL = dimV(stage, x0 - 18, y0, S, `${A}+${B}`);
    const splitT = [...dimH(stage, x0, y0 - 18, pa, A), ...dimH(stage, x0 + pa, y0 - 18, pb, B)];
    const splitL = [...dimV(stage, x0 - 18, y0, pa, A), ...dimV(stage, x0 - 18, y0 + pa, pb, B)];
    hide(...splitT, ...splitL);
    const px = x0 + S + 50, pw = W - px - 16;
    add(stage, h('div', 'sp-eq big', `${d.num ? '' : 'Area '}${K((d.num ? '' : '=') + d.head)}`), px, 44);
    const row = add(stage, h('div', 'sp-eq sp-row1'), px, 116);
    const eq1 = h('span', 'sp-eqs', K('=')); row.appendChild(eq1); hide(eq1);
    const cls = ['aa', 'ab', 'ab', 'bb'];
    const toks = p.map((t, i) => { const s = h('span', 'sp-tok ' + cls[i], K((i ? '+' : '') + t)); row.appendChild(s); hide(s); return s; });
    const comb = add(stage, h('div', 'sp-eq sp-comb', K('=' + d.comb)), px, 184); hide(comb);
    const rule = add(stage, h('div', 'sp-rule3'), px, 268); rule.style.width = pw + 'px';
    rule.innerHTML = [['square the first', p[0], 'aa'], ['double the product', d.dbl, 'ab'], ['square the last', p[3], 'bb']].map(([t, m, c]) => `<div class="sp-r3 ${c}"><b>${t}</b>${K(m)}</div>`).join('');
    const r3 = [...rule.children]; hide(...r3);
    const pop = (c, i) => Promise.all([c.anim(pcs[i], [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'scale(1)' }], 420), c.pop(toks[i], 380, { delay: 200 }), i ? null : c.fadeIn(eq1, 300)]);
    const by = (u, v) => `${T(u)} by ${T(v)}`;
    return [{
      cap: `Cut each side into two parts, ${T(A)} and ${T(B)}. The big square now has <b>four pieces</b>.`,
      run: (c) => Promise.all([c.anim(cutV, [{ opacity: 0, transform: 'scaleY(0)' }, { opacity: 1, transform: 'scaleY(1)' }], 500), c.anim(cutH, [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], 500, { delay: 150 }),
        ...[...fullT, ...fullL].map((e) => fadeOut(c, e, 250)), ...[...splitT, ...splitL].map((e) => c.fadeIn(e, 350, { delay: 250 }))])
    }, {
      cap: `Top left: ${by(A, A)}, a square. Its area is <b>${T(p[0])}</b>.`, run: (c) => pop(c, 0)
    }, {
      cap: `Top right: ${by(A, B)}, a rectangle. Its area is <b>${T(p[1])}</b>.`, run: (c) => pop(c, 1)
    }, {
      cap: `Bottom left: ${by(B, A)}. It’s the <b>same rectangle</b>, turned on its side: another <b>${T(p[2])}</b>.`, run: (c) => pop(c, 2)
    }, {
      cap: `Bottom right: ${by(B, B)}, a small square: <b>${T(p[3])}</b>.`, run: (c) => pop(c, 3)
    }, {
      cap: `Add the four pieces. The two equal rectangles combine: ${T(d.dbl)}. So ${T(d.fin)}.`,
      run: (c) => Promise.all([pulse(c, pcs[1], 1.05), pulse(c, pcs[2], 1.05), pulse(c, toks[1], 1.2), pulse(c, toks[2], 1.2), c.fadeIn(comb, 450, { delay: 300 })])
    }, {
      cap: d.num ? `The pattern: <b>square the first</b> (900), <b>double the product</b> (300), <b>square the last</b> (25). That’s the squaring trick: 900 + 300 = 1\u202f200 = 3 × 4 × 100, and the corner is the 25.`
        : `The shortcut: <b>square the first</b>, <b>double the product</b>, <b>square the last</b>. ${T(d.fin)}: three terms, every time.`,
      run: (c) => Promise.all(r3.map((e, i) => c.pop(e, 380, { delay: i * 220 })))
    }];
  }
};

/* ============ 1. The classic mistake: (a + b)² ≠ a² + b² ============ */
const classicError = {
  title: 'Where did the middle go?',
  height: 420,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: '3,4', label: tex('(3+4)^2') }, { v: '2,5', label: tex('(2+5)^2') }, { v: '6,3', label: tex('(6+3)^2') }],
  intro: (k) => { const [a, b] = k.split(',').map(Number); return `Is ${T(`(${a}+${b})^2`)} the same as ${T(`${a}^2+${b}^2`)}? Count the small squares and see.`; },
  make(stage, key, ex) {
    const W = ex.W, H = 420, [a, b] = key.split(',').map(Number), n = a + b, cell = Math.min(42, 320 / n), x0 = 78, gy = Math.round((H - n * cell) / 2) + 10;
    const reg = (i, j) => (i < a ? (j < a ? 'aa' : 'ab') : (j < a ? 'ba' : 'bb'));
    const cells = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const e = add(stage, box(h('div', 'sp-cell'), cell - 3, cell - 3), x0 + j * cell, gy + i * cell); e.dataset.r = reg(i, j); cells.push(e);
    }
    const ctr = (r0, c0, rr, cc) => [x0 + (c0 + cc / 2) * cell - 1.5, gy + (r0 + rr / 2) * cell - 1.5];
    const labs = { aa: [ctr(0, 0, a, a), a * a], ab: [ctr(0, a, a, b), a * b], ba: [ctr(a, 0, b, a), a * b], bb: [ctr(a, a, b, b), b * b] };
    const lab = {}; for (const k in labs) { const [[x, y], v] = labs[k]; lab[k] = add(stage, h('div', 'sp-clab c ' + k, String(v)), x, y); hide(lab[k]); }
    const dims = [...dimH(stage, x0, gy - 18, a * cell - 3, String(a)), ...dimH(stage, x0 + a * cell, gy - 18, b * cell - 3, String(b)),
      ...dimV(stage, x0 - 18, gy, a * cell - 3, String(a)), ...dimV(stage, x0 - 18, gy + a * cell, b * cell - 3, String(b))];
    const px = x0 + n * cell + 64;
    const L = (y, s, cls = '') => { const e = add(stage, h('div', 'sp-eq ' + cls, s), px, y); hide(e); return e; };
    const s2 = a * a + b * b;
    const L1 = L(48, K(`(${a}+${b})^2=${n}^2=${n * n}`) + ' <span class="sp-tag">the whole square</span>', 'big');
    const L2 = L(118, K(`${a}^2+${b}^2=${a * a}+${b * b}=${s2}`), 'bad');
    const st = add(stage, h('div', 'sp-stamp no', `≠ ${n * n}`), Math.min(px + (rel(stage, L2).w || 330) + 16, ex.W - 120), 112); hide(st);
    const L3 = L(188, K(`2\\times${a}\\times${b}=${2 * a * b}`) + ' <span class="sp-tag amb">missing</span>', 'amb');
    const L4 = L(258, K(`${a * a}+${2 * a * b}+${b * b}=${n * n}`) + ' <b class="ok">✓</b>', 'good');
    const L5 = L(330, K('(a+b)^2=a^2+\\boldsymbol{2ab}+b^2'), 'sp-boxed');
    const by = (r) => cells.filter((e) => e.dataset.r === r);
    return [{
      cap: `${T(`(${a}+${b})^2=${n}^2`)}: a ${n} by ${n} square holds <b>${n * n}</b> small squares.`,
      run: (c) => Promise.all([...cells.map((e, i) => c.anim(e, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], 300, { delay: i * Math.min(10, 600 / cells.length) })), c.fadeIn(L1, 400, { delay: 300 })])
    }, {
      cap: `The tempting shortcut: square each part and add, ${T(`${a}^2+${b}^2=${a * a}+${b * b}=${s2}`)}. That counts only the <b>two corner squares</b>, and ${s2} ≠ ${n * n}!`,
      run: async (c) => {
        by('aa').forEach((e) => e.classList.add('aa')); by('bb').forEach((e) => e.classList.add('bb')); [...by('ab'), ...by('ba')].forEach((e) => e.classList.add('ghost'));
        await Promise.all([c.pop(lab.aa, 380), c.pop(lab.bb, 380, { delay: 150 }), c.fadeIn(L2, 400, { delay: 200 })]);
        await stampIn(c, st);
      }
    }, {
      cap: `What got left out? Two ${a} by ${b} rectangles: ${T(`2\\times${a}\\times${b}=${2 * a * b}`)} small squares. They are the two ${T('ab')} pieces.`,
      run: async (c) => {
        const rs = [...by('ab'), ...by('ba')]; rs.forEach((e) => { e.classList.remove('ghost'); e.classList.add('ab'); });
        await Promise.all([...rs.map((e, i) => c.anim(e, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], 380, { delay: i * 10 })), c.pop(lab.ab, 380, { delay: 250 }), c.pop(lab.ba, 380, { delay: 400 }), c.fadeIn(L3, 400, { delay: 300 })]);
      }
    }, {
      cap: `Put them back: ${T(`${a * a}+${2 * a * b}+${b * b}=${n * n}`)} ✓. The <b>middle term</b> ${T('2ab')} is the two rectangles, and it never disappears: ${T('(a+b)^2=a^2+2ab+b^2')}.`,
      run: (c) => Promise.all([c.fadeIn(L4, 400), c.pop(L5, 450, { delay: 350 })])
    }];
  }
};

/* ============ 1. Squaring a difference: (a − b)² ============ */
const MS = {
  ab: { A: 'a', B: 'b', AA: 'a^2', AB: 'ab', BB: 'b^2', R: '(a-b)^2', side: 'a-b', comb: 'a^2-2ab+b^2', rb: 0.3 },
  n: { A: '10', B: '3', AA: '100', AB: '30', BB: '9', R: '7^2=49', side: '7', comb: '100-60+9=49', rb: 0.3, num: true },
  ex1b: { A: '4x', B: '1', AA: '16x^2', AB: '4x', BB: '1', R: '(4x-1)^2', side: '4x-1', comb: '16x^2-8x+1', rb: 0.22 },
  ex1c: { A: '3m', B: '2n', AA: '9m^2', AB: '6mn', BB: '4n^2', R: '(3m-2n)^2', side: '3m-2n', comb: '9m^2-12mn+4n^2', rb: 0.32 }
};
const minusSquare = {
  title: 'Cut two strips, put the corner back',
  height: 440,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ab', label: tex('(a-b)^2') }, { v: 'n', label: tex('(10-3)^2') }, { sep: 'Example 1 check:' }, { v: 'ex1b', label: '(b) ' + tex('(4x-1)^2') }, { v: 'ex1c', label: '(c) ' + tex('(3m-2n)^2') }],
  intro: (k) => { const d = MS[k]; return `We want ${T(`(${d.A}-${d.B})^2`)}. Start with a bigger square of side ${T(d.A)}: its area is ${T(d.AA)}. Then cut away what we don’t want.`; },
  make(stage, key, ex) {
    const W = ex.W, d = MS[key], x0 = 100, y0 = 82, S = 270, bw = Math.round(S * d.rb), r = S - bw, dx = bw + 26, dy = 48;
    const head = `(${d.A}-${d.B})^2`;
    add(stage, box(h('div', 'sp-sqo dash'), S, S), x0, y0);
    const rem = add(stage, box(h('div', 'sp-pc aa'), r, r), x0, y0 + bw);
    const s1 = add(stage, box(h('div', 'sp-pc aa'), bw, S), x0 + r, y0);
    const s2 = add(stage, box(h('div', 'sp-strip'), S, bw), x0, y0);
    const s2m = h('div', 'sp-pc aa'); box(s2m, r, bw); s2.appendChild(at(s2m, 0, 0));
    const s2g = h('div', 'sp-ghost'); box(s2g, bw, bw); s2.appendChild(at(s2g, r, 0)); hide(s2g);
    const s1lab = add(s1, h('div', 'sp-plab c', K(d.AB)), bw / 2, S / 2 + bw / 2); hide(s1lab);
    const s2lab = add(s2, h('div', 'sp-plab c', K(d.AB)), r / 2, bw / 2); hide(s2lab);
    const hot1 = add(s1, box(h('div', 'sp-hot c', K(d.BB)), bw - 6, bw - 6), bw / 2, bw / 2), hot2 = add(s2, box(h('div', 'sp-hot c', K(d.BB)), bw - 6, bw - 6), r + bw / 2, bw / 2);
    hide(hot1, hot2);
    const big = add(stage, h('div', 'sp-plab big c', K(d.AA)), x0 + S / 2, y0 + S / 2);
    const dimA = dimV(stage, x0 - 18, y0, S, d.A), botA = dimH(stage, x0, y0 + S + 6, S, d.A, { below: true });
    const botS = [...dimH(stage, x0, y0 + S + 6, r, d.side, { below: true }), ...dimH(stage, x0 + r, y0 + S + 6, bw, d.B, { below: true })]; hide(...botS);
    const leftS = [...dimV(stage, x0 - 18, y0, bw, d.B), ...dimV(stage, x0 - 18, y0 + bw, r, d.side)]; hide(...leftS);
    const px = x0 + S + dx + bw + 34;
    add(stage, h('div', 'sp-eq big', K(head)), px, 54);
    const row = add(stage, h('div', 'sp-eq sp-row1'), px, 124);
    const eq1 = h('span', 'sp-eqs', K('=')); row.appendChild(eq1); hide(eq1);
    const tk = [[d.AA, 'aa'], ['-' + d.AB, 'ab'], ['-' + d.AB, 'ab'], ['+' + d.BB, 'bb']].map(([t, c]) => { const s = h('span', 'sp-tok ' + c, K(t)); row.appendChild(s); hide(s); return s; });
    const comb = add(stage, h('div', 'sp-eq sp-comb', K('=' + d.comb)), px, 192); hide(comb);
    const note = add(stage, h('div', 'sp-note', `The two strips together took away ${K(d.BB)} <b>twice</b>, so one ${K(d.BB)} goes back.`), px, 272); note.style.width = (W - px - 18) + 'px'; hide(note);
    return [{
      cap: `Cut a strip ${T(d.B)} wide off the <b>right side</b>. It is ${T(d.A)} by ${T(d.B)}, so we take away <b>${T(d.AB)}</b>.`,
      run: async (c) => {
        s1.classList.replace('aa', 'ab');
        await Promise.all([c.fadeIn(eq1, 300), c.pop(tk[0], 300), c.fadeIn(s1lab, 300), moveTo(c, big, x0 + r / 2, y0 + bw + r / 2, 600)]);
        await Promise.all([moveTo(c, s1, x0 + r + dx, y0, 600), c.pop(tk[1], 380, { delay: 250 })]);
      }
    }, {
      cap: `Cut a strip off the <b>top</b>: another ${T(d.A)} by ${T(d.B)}, so take away <b>${T(d.AB)}</b> again. But its right end is already gone!`,
      run: async (c) => {
        s2m.classList.replace('aa', 'ab');
        await Promise.all([c.fadeIn(s2lab, 300), c.fadeIn(s2g, 300)]);
        await Promise.all([moveTo(c, s2, x0, y0 - dy, 600), c.pop(tk[2], 380, { delay: 250 })]);
      }
    }, {
      cap: `Look at the corner: it belongs to <b>both</b> strips. Taking away ${T(d.AB)} twice took that ${T(d.B)}-by-${T(d.B)} corner away <b>twice</b>.`,
      run: (c) => Promise.all([c.pop(hot1, 380), c.pop(hot2, 380, { delay: 200 }), c.fadeIn(note, 400, { delay: 300 })])
    }, {
      cap: `It was only there <b>once</b>, so <b>add it back once</b>: ${T('+' + d.BB)}.`,
      run: async (c) => { s2g.classList.add('back'); hot2.classList.add('back'); await Promise.all([pulse(c, hot2, 1.15), c.pop(tk[3], 380, { delay: 200 })]); }
    }, {
      cap: d.num ? `What’s left is a 7 by 7 square: ${T('100-30-30+9=49=7^2')} ✓. ${T('(a-b)^2=a^2-2ab+b^2')}: the middle term is <b>minus</b>, the last is <b>plus</b>.`
        : `What’s left is a square of side ${T(d.side)}: ${T(`${head}=${d.comb}`)}. Square the first, double the product (<b>subtract</b> it), square the last (<b>add</b> it).`,
      run: async (c) => {
        big.innerHTML = K(d.R); rem.classList.add('lit');
        await Promise.all([c.pop(big, 420), ...[...botA, ...dimA].map((e) => fadeOut(c, e, 250)), ...[...botS, ...leftS].map((e) => c.fadeIn(e, 350, { delay: 200 })), c.fadeIn(comb, 400, { delay: 300 })]);
      }
    }];
  }
};

/* ============ 1. Sum times difference: the middle cancels, and cut-and-move ============ */
const SD = {
  ab: { head: '(a+b)(a-b)', A: 'a', B: 'b', F: 'a^2', O: '-ab', I: '+ab', L: '-b^2', res: 'a^2-b^2', AA: 'a^2', ds: 'a^2-b^2' },
  n: { head: '(10+3)(10-3)', A: '10', B: '3', F: '100', O: '-30', I: '+30', L: '-9', res: '100-9=91', AA: '10^2', ds: '10^2-3^2', num: true },
  ex1d: { head: '(6-5x)(6+5x)', A: '6', B: '5x', F: '36', O: '+30x', I: '-30x', L: '-25x^2', res: '36-25x^2', AA: '6^2', ds: '6^2-(5x)^2' },
  ex1e: { head: '(4a+7b)(4a-7b)', A: '4a', B: '7b', F: '16a^2', O: '-28ab', I: '+28ab', L: '-49b^2', res: '16a^2-49b^2', AA: '(4a)^2', ds: '(4a)^2-(7b)^2' }
};
const sumDiff = {
  title: 'Sum times difference: cancel, then cut and move',
  height: 450,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ab', label: tex('(a+b)(a-b)') }, { v: 'n', label: tex('13\\times7') }, { sep: 'Example 1 check:' }, { v: 'ex1d', label: '(d)' }, { v: 'ex1e', label: '(e)' }],
  intro: (k) => { const d = SD[k]; return `Expand ${T(d.head)} with FOIL${d.num ? ` (that’s ${T('13\\times7')})` : ''}, then look at it as an area.`; },
  make(stage, key, ex) {
    const W = ex.W, d = SD[key], { A, B } = d;
    const hd = add(stage, h('div', 'sp-eq big', K(d.head + '=')), 24, 26);
    const hw = rel(stage, hd).w || 220;
    const chipsX = 24 + hw + 14;
    const parts = [[d.F, 'F', 'aa'], [d.O, 'O', 'ab'], [d.I, 'I', 'ab'], [d.L, 'L', 'bb']];
    const chips = []; let cx = chipsX;
    parts.forEach(([t, f, cls]) => {
      const e = add(stage, h('div', 'sp-chip ' + cls, K(t) + `<small>${f}</small>`), cx, 22); const w = rel(stage, e).w || 90; e._x = cx; cx += w + 12; chips.push(e); hide(e);
    });
    const zp = add(stage, h('div', 'sp-zp c', 'zero pair'), (chips[1]._x + chips[2]._x + rel(stage, chips[2]).w) / 2, 106); hide(zp);
    const resE = add(stage, h('div', 'sp-eq sp-res', K(d.res)), chipsX, 26); hide(resE);
    // the picture
    const X0 = 112, Y0 = 186, S = 214, bw = Math.round(S * 0.35), r = S - bw;
    const sqo = add(stage, box(h('div', 'sp-sqo'), S, S), X0, Y0); hide(sqo);
    const top = add(stage, box(h('div', 'sp-pc aa'), S, r), X0, Y0);
    const bot = add(stage, box(h('div', 'sp-pc aa'), r, bw), X0, Y0 + r);
    const cor = add(stage, box(h('div', 'sp-pc bb'), bw, bw), X0 + r, Y0 + r);
    const lab = add(stage, h('div', 'sp-plab big c', K(d.AA)), X0 + S / 2, Y0 + (S - bw) / 2);
    hide(top, bot, cor, lab);
    const cut = add(stage, box(h('div', 'sp-cutd'), r, 0), X0, Y0 + r); hide(cut);
    const dT = dimH(stage, X0, Y0 - 18, S, A), dL = dimV(stage, X0 - 18, Y0, S, A);
    const dC = [...dimH(stage, X0 + r, Y0 + S + 6, bw, B, { below: true }), ...dimV(stage, X0 + S + 6, Y0 + r, bw, B, { right: true })];
    hide(...dT, ...dL, ...dC);
    const fT = dimH(stage, X0, Y0 - 18, S + bw, `${A}+${B}`), fL = dimV(stage, X0 - 18, Y0, r, `${A}-${B}`);
    hide(...fT, ...fL);
    const px = Math.min(500, W - 386), pw = W - px - 20; // narrower stages (beside the sidebar): the notes move left and stack by height
    const P1 = add(stage, h('div', 'sp-note', `<b>Before:</b> a square with a corner cut out. Area ${KN(d.ds)}.`), px, px < 500 ? 160 : 196); P1.style.width = pw + 'px';
    const P2 = add(stage, h('div', 'sp-note', `<b>After:</b> one rectangle, ${KN(`${A}+${B}`)} long and ${KN(`${A}-${B}`)} tall. Area ${KN(d.head)}.`), px, 270); P2.style.width = pw + 'px';
    const P3 = add(stage, h('div', 'sp-eq sp-boxed', K(`${d.head}=${d.ds}`)), px, 352);
    if (px < 500) {
      P2.style.top = Math.max(270, P1.offsetTop + P1.offsetHeight + 10) + 'px'; P3.style.top = Math.max(352, P2.offsetTop + P2.offsetHeight + 12) + 'px';
      if (P3.offsetWidth > pw) P3.style.fontSize = Math.floor(26 * (pw - 40) / (P3.offsetWidth - 40)) + 'px';
    }
    hide(P1, P2, P3);
    return [{
      cap: `FOIL gives four products: <b>F</b> ${T(d.F)}, <b>O</b> ${T(d.O)}, <b>I</b> ${T(d.I)}, <b>L</b> ${T(d.L)}.`,
      run: (c) => Promise.all(chips.map((e, i) => c.pop(e, 360, { delay: i * 160 })))
    }, {
      cap: `The middle terms ${T(d.O)} and ${T(d.I)} are <b>opposites</b>: a zero pair. They cancel, leaving ${T(d.res)}, a <b>difference of squares</b>.`,
      run: async (c) => {
        const m = (chips[1]._x + chips[2]._x) / 2;
        await Promise.all([c.fadeIn(zp, 300), moveTo(c, chips[1], m - 10, 22, 500), moveTo(c, chips[2], m + 10, 22, 500)]);
        await Promise.all([fadeOut(c, chips[1], 350), fadeOut(c, chips[2], 350), fadeOut(c, zp, 350), fadeOut(c, chips[0], 300, { delay: 200 }), fadeOut(c, chips[3], 300, { delay: 200 })]);
        await c.fadeIn(resE, 400);
      }
    }, {
      cap: `Now picture it. A square of side ${T(A)} has area ${T(d.AA)}. Cut a ${T(B)}-by-${T(B)} square out of the corner: what’s left has area <b>${T(d.ds)}</b>.`,
      run: async (c) => {
        await Promise.all([c.fadeIn(sqo, 200), c.fadeIn(top, 350), c.fadeIn(bot, 350), c.fadeIn(cor, 350), c.fadeIn(lab, 350), ...[...dT, ...dL, ...dC].map((e) => c.fadeIn(e, 350))]);
        cor.classList.add('gone'); lab.innerHTML = K(d.ds);
        await Promise.all([c.anim(cor, [{ opacity: 1 }, { opacity: 0.85 }], 400), pulse(c, lab, 1.12), c.fadeIn(P1, 400)]);
      }
    }, {
      cap: `Cut the L-shape along the dashed line into <b>two rectangles</b>: a long one, ${T(A)} by ${T(`${A}-${B}`)}, and a short one, ${T(`${A}-${B}`)} by ${T(B)}.`,
      run: async (c) => {
        await c.fadeIn(cut, 300);
        await Promise.all([moveTo(c, bot, X0, Y0 + r + 18, 450), fadeOut(c, lab, 250), fadeOut(c, cor, 300), fadeOut(c, sqo, 300), ...[...dT, ...dL, ...dC].map((e) => fadeOut(c, e, 250))]);
      }
    }, {
      cap: `Turn the short piece and slide it onto the right end. Now it’s <b>one rectangle</b>, ${T(`${A}+${B}`)} long and ${T(`${A}-${B}`)} tall.`,
      run: async (c) => {
        const cx0 = X0 + r / 2, cy0 = Y0 + r + 18 + bw / 2, cx1 = X0 + S + bw / 2, cy1 = Y0 + r / 2;
        await c.anim(bot, [{ transform: 'none' }, { transform: `translate(${cx1 - cx0}px, ${cy1 - cy0}px) rotate(90deg)` }], 900);
        await Promise.all([fadeOut(c, cut, 200), ...[...fT, ...fL].map((e) => c.fadeIn(e, 350)), c.fadeIn(P2, 400, { delay: 150 })]);
      }
    }, {
      cap: `Same pieces, same area: ${T(`${d.head}=${d.ds}`)}${d.num ? `. With numbers: ${T('13\\times7=91=100-9')} ✓` : ''}. The sum times the difference is the <b>difference of the squares</b>.`,
      run: (c) => Promise.all([c.pop(P3, 450), pulse(c, top, 1.03), pulse(c, bot, 1.03)])
    }];
  }
};

/* ============ 1. Which pattern is this? ============ */
const RZ = {
  n1: { e: '(x+7)(x-7)', ec: `(${cA('x')}+${cB('7')})(${cA('x')}-${cB('7')})`, t: `First terms ${T('x')} and ${T('x')}; second terms ${T('7')} and ${T('7')}.`, same: true, kind: 'sd', lines: ['=x^2-7^2'], ans: 'x^2-49' },
  n2: { e: '(2y+3)^2', ec: `(${cA('2y')}+${cB('3')})(${cA('2y')}+${cB('3')})`, rw: true, t: `A square is the bracket <b>times itself</b>. First terms ${T('2y')} and ${T('2y')}; second terms ${T('3')} and ${T('3')}.`, same: true, kind: 'sq', lines: ['=(2y)^2+2(2y)(3)+3^2'], ans: '4y^2+12y+9' },
  n3: { e: '(x+2)(x+6)', ec: `(${cA('x')}+${cB('2')})(${cA('x')}+${cB('6')})`, t: `First terms ${T('x')} and ${T('x')}; second terms ${T('2')} and ${T('6')}.`, same: false, diff: `${T('2')} and ${T('6')}`, kind: 'no', lines: ['=x^2+6x+2x+12'], ans: 'x^2+8x+12' },
  n4: { e: '(5+n)(n-5)', ec: `(${cA('n')}+${cB('5')})(${cA('n')}-${cB('5')})`, rw: true, t: `Reorder first: ${T('5+n=n+5')}. First terms ${T('n')} and ${T('n')}; second terms ${T('5')} and ${T('5')}.`, same: true, kind: 'sd', lines: ['=n^2-5^2'], ans: 'n^2-25' },
  a: { e: '(x+9)^2', ec: `(${cA('x')}+${cB('9')})(${cA('x')}+${cB('9')})`, rw: true, t: `The bracket times itself. First terms ${T('x')}; second terms ${T('9')}.`, same: true, kind: 'sq', lines: ['=x^2+2(x)(9)+9^2'], ans: 'x^2+18x+81' },
  b: { e: '(4x-1)^2', ec: `(${cA('4x')}-${cB('1')})(${cA('4x')}-${cB('1')})`, rw: true, t: `The bracket times itself. First terms ${T('4x')}; second terms ${T('1')}.`, same: true, kind: 'sq', lines: ['=(4x)^2-2(4x)(1)+1^2'], ans: '16x^2-8x+1' },
  c: { e: '(3m-2n)^2', ec: `(${cA('3m')}-${cB('2n')})(${cA('3m')}-${cB('2n')})`, rw: true, t: `The bracket times itself. First terms ${T('3m')}; second terms ${T('2n')}.`, same: true, kind: 'sq', lines: ['=(3m)^2-2(3m)(2n)+(2n)^2'], ans: '9m^2-12mn+4n^2' },
  d: { e: '(6-5x)(6+5x)', ec: `(${cA('6')}-${cB('5x')})(${cA('6')}+${cB('5x')})`, t: `First terms ${T('6')} and ${T('6')}; second terms ${T('5x')} and ${T('5x')}.`, same: true, kind: 'sd', lines: ['=6^2-(5x)^2'], ans: '36-25x^2' },
  e: { e: '(4a+7b)(4a-7b)', ec: `(${cA('4a')}+${cB('7b')})(${cA('4a')}-${cB('7b')})`, t: `First terms ${T('4a')} and ${T('4a')}; second terms ${T('7b')} and ${T('7b')}.`, same: true, kind: 'sd', lines: ['=(4a)^2-(7b)^2'], ans: '16a^2-49b^2' },
  f: { e: '(3p-8q)(3p-8q)', ec: `(${cA('3p')}-${cB('8q')})(${cA('3p')}-${cB('8q')})`, t: `First terms ${T('3p')} and ${T('3p')}; second terms ${T('8q')} and ${T('8q')}.`, same: true, kind: 'sq', lines: ['=(3p)^2-2(3p)(8q)+(8q)^2'], ans: '9p^2-48pq+64q^2' },
  g: { e: '(x+3)(x-5)', ec: `(${cA('x')}+${cB('3')})(${cA('x')}-${cB('5')})`, t: `First terms ${T('x')} and ${T('x')}; second terms ${T('3')} and ${T('5')}.`, same: false, diff: `${T('3')} and ${T('5')}`, kind: 'no', lines: ['=x^2-5x+3x-15'], ans: 'x^2-2x-15' },
  h: { e: '(-2x+5)^2', ec: `(${cA('5')}-${cB('2x')})(${cA('5')}-${cB('2x')})`, rw: true, pre: '(5-2x)^2', t: `Rewrite first: ${T('-2x+5=5-2x')}. Then it’s ${T('(5-2x)^2')}: first terms ${T('5')}, second terms ${T('2x')}.`, same: true, kind: 'sq', lines: ['=5^2-2(5)(2x)+(2x)^2', '=25-20x+4x^2'], ans: '4x^2-20x+25' }
};
const BINS = [['sq', 'Square of a binomial', '(a\\pm b)^2=a^2\\pm2ab+b^2'], ['sd', 'Sum times difference', '(a+b)(a-b)=a^2-b^2'], ['no', 'Neither: use FOIL', '\\text{all four products}']];
const recognizer = {
  title: 'Which pattern is this?',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n1', label: tex('(x+7)(x-7)') }, { v: 'n2', label: tex('(2y+3)^2') }, { v: 'n3', label: tex('(x+2)(x+6)') }, { v: 'n4', label: tex('(5+n)(n-5)') },
    { sep: 'Example 1 check:' }, ...'abcdefgh'.split('').map((k) => ({ v: k, label: `(${k})` }))],
  intro: (k) => `Which pattern fits ${T(RZ[k].e)}? Check the <b>terms</b> first, then the <b>signs</b>.`,
  make(stage, key, ex) {
    const W = ex.W, d = RZ[key];
    const ex0 = add(stage, h('div', 'sp-rz-e c', K(d.e)), W / 2, 44);
    const q1 = add(stage, h('div', 'sp-rz-q', '<span class="sp-qn">1</span> Same two terms in both brackets? <b class="sp-qa"></b>'), 24, 96);
    const q2 = add(stage, h('div', 'sp-rz-q', '<span class="sp-qn">2</span> Signs: the same, or opposite? <b class="sp-qa"></b>'), 24, 140);
    const bw = (W - 48 - 28) / 3;
    const bins = BINS.map(([k, t, f], i) => { const e = add(stage, box(h('div', 'sp-bin ' + k, `<b>${t}</b>${K(f)}`), bw, 78), 24 + i * (bw + 14), 190); e.dataset.k = k; return e; });
    const lines = add(stage, h('div', 'sp-rz-lines'), 24, 290); lines.style.width = (W - 48) + 'px';
    const ls = d.lines.map((s) => { const e = h('div', 'sp-rz-l', K(s)); lines.appendChild(e); hide(e); return e; });
    const ans = h('div', 'sp-rz-ans', K(`${d.e}=\\boldsymbol{${d.ans}}`)); lines.appendChild(ans); hide(ans);
    const a1 = q1.querySelector('.sp-qa'), a2 = q2.querySelector('.sp-qa');
    const bin = bins.find((b) => b.dataset.k === d.kind);
    const wrt = d.rw ? `${d.e}=${d.pre ? d.pre + '=' : ''}${d.ec}` : d.ec;
    return [{
      cap: d.t,
      run: async (c) => { ex0.innerHTML = K(wrt); await c.fadeIn(ex0, 350); }
    }, {
      cap: d.same ? 'The <b>same two terms</b> appear in both brackets ✓, so one of the patterns might fit.' : `The second terms are <b>different</b> (${d.diff}) ✗. Neither pattern can fit.`,
      run: async (c) => { a1.textContent = d.same ? '✓ yes' : '✗ no'; a1.className = 'sp-qa ' + (d.same ? 'ok' : 'red'); await c.pop(a1, 360); }
    }, {
      cap: d.kind === 'sq' ? 'The signs are the <b>same</b>: it’s one binomial times itself. That’s the <b>square of a binomial</b>.'
        : d.kind === 'sd' ? 'The signs are <b>opposite</b>, one + and one −. That’s a <b>sum times a difference</b>.' : 'Not a pattern, so expand the long way: <b>FOIL</b>, then collect like terms.',
      run: async (c) => {
        if (d.kind !== 'no') { a2.textContent = d.kind === 'sq' ? 'the same' : 'opposite'; a2.className = 'sp-qa ok'; } else { a2.textContent = '(no need)'; a2.className = 'sp-qa muted'; }
        bins.forEach((b) => b.classList.toggle('dim', b !== bin)); bin.classList.add('on');
        await Promise.all([c.pop(a2, 300), pulse(c, bin, 1.06)]);
      }
    }, {
      cap: d.kind === 'sq' ? '<b>Square the first, double the product, square the last.</b> Brackets keep each whole term together.'
        : d.kind === 'sd' ? '<b>First squared minus last squared.</b> There’s no middle term.' : '<b>First, Outer, Inner, Last</b>: all four products.',
      run: (c) => Promise.all(ls.map((e, i) => c.fadeIn(e, 380, { delay: i * 300 })))
    }, {
      cap: `${T(`${d.e}=${d.ans}`)}.${d.kind === 'sq' ? ' Three terms.' : d.kind === 'sd' ? ' Two terms: a difference of squares.' : ' The middle terms combined, so this one has three terms but no pattern.'}`,
      run: (c) => c.pop(ans, 420)
    }];
  }
};

/* ============ 1. Mental math ============ */
const MM = {
  s51: { q: '51^2', A: 50, B: 1, s: 1 }, s49: { q: '49^2', A: 50, B: 1, s: -1 }, s35: { q: '35^2', A: 30, B: 5, s: 1 },
  p4951: { q: '49\\times51', m: 50, dd: 1 }, p98: { q: '98\\times102', m: 100, dd: 2 }, p4149: { q: '41\\times49', m: 45, dd: 4 }
};
const mental = {
  title: 'Mental math with the patterns',
  height: 392,
  choices: [{ v: 's51', label: tex('51^2') }, { v: 's49', label: tex('49^2') }, { v: 'p4951', label: tex('49\\times51') }, { v: 'p98', label: tex('98\\times102') }, { sep: 'Warm-up:' }, { v: 's35', label: tex('35^2') }, { v: 'p4149', label: tex('41\\times49') }],
  intro: (k) => `Work out ${T(MM[k].q)} in your head. First find a <b>friendly number</b> close by.`,
  make(stage, key, ex) {
    const W = ex.W, d = MM[key];
    const q = add(stage, h('div', 'sp-mm-q', K(d.q + '=\\ ?')), 24, 18);
    if (d.A) {
      const { A, B, s } = d, n = A + s * B, sg = s > 0 ? '+' : '-';
      const split = add(stage, h('div', 'sp-eq big', K(`${d.q}=(${A}${sg}${B})^2`)), 24, 104); hide(split);
      const cw = (W - 48 - 28) / 3;
      const cards = [['square the first', `${A}^2=${tn(A * A)}`, 'aa'], ['double the product', `2(${A})(${B})=${tn(2 * A * B)}`, 'ab'], ['square the last', `${B}^2=${B * B}`, 'bb']]
        .map(([t, m, cls], i) => { const e = add(stage, box(h('div', 'sp-mm-card ' + cls, `<b>${t}</b>${K(m)}`), cw, 92), 24 + i * (cw + 14), 176); hide(e); return e; });
      const sum = add(stage, h('div', 'sp-eq big', K(`${d.q}=${tn(A * A)}${sg}${tn(2 * A * B)}+${B * B}=\\boldsymbol{${tn(n * n)}}`)), 24, 300); hide(sum);
      return [{
        cap: `${n} is ${B} ${s > 0 ? 'more' : 'less'} than ${A}, so ${T(`${d.q}=(${A}${sg}${B})^2`)}: the ${s > 0 ? 'square of a sum' : 'square of a difference'}.`,
        run: (c) => c.fadeIn(split, 400)
      }, {
        cap: `<b>Square the first:</b> ${T(`${A}^2=${tn(A * A)}`)}. Friendly numbers make this easy.`, run: (c) => c.pop(cards[0], 400)
      }, {
        cap: `<b>Double the product:</b> ${T(`2(${A})(${B})=${tn(2 * A * B)}`)}. It gets ${s > 0 ? '<b>added</b>' : '<b>subtracted</b>'}, because the bracket has a ${s > 0 ? '+' : '−'}.`, run: (c) => c.pop(cards[1], 400)
      }, {
        cap: `<b>Square the last:</b> ${T(`${B}^2=${B * B}`)}. It’s always <b>added</b>.`, run: (c) => c.pop(cards[2], 400)
      }, {
        cap: `${T(`${tn(A * A)}${sg}${tn(2 * A * B)}+${B * B}=${tn(n * n)}`)}. So ${T(`${d.q}=${tn(n * n)}`)}.${key === 's35' ? ' Same as the squaring trick!' : ''}`,
        run: async (c) => { q.innerHTML = K(`${d.q}=\\boldsymbol{${tn(n * n)}}`); await Promise.all([c.fadeIn(sum, 400), c.pop(q, 400, { delay: 200 })]); }
      }];
    }
    const { m, dd } = d, lo = m - dd, hi = m + dd, pad = Math.max(2, dd + 1), from = m - dd - pad, to = m + dd + pad;
    const nlx0 = 60, nlx1 = W - 60, ny = 160, X = (v) => nlx0 + (v - from) / (to - from) * (nlx1 - nlx0);
    const nl = add(stage, box(h('div', 'sp-nl'), nlx1 - nlx0, 3), nlx0, ny); hide(nl);
    const ticks = [];
    for (let v = from; v <= to; v++) { const t = add(stage, h('div', 'sp-tick c' + (v === m ? ' mid' : v === lo || v === hi ? ' fac' : ''), `<span>${v}</span>`), X(v), ny + 1); ticks.push(t); }
    hide(...ticks);
    const svg = add(stage, svgEl('svg', { class: 'sp-arcs' }), 0, 0); box(svg, W, 392);
    const arc = (a, b) => { const p = svgEl('path', { d: `M ${X(a)} ${ny - 8} Q ${(X(a) + X(b)) / 2} ${ny - 70} ${X(b)} ${ny - 8}`, class: 'sp-arc' }); svg.appendChild(p); return p; };
    const arcs = [arc(m, lo), arc(m, hi)];
    const al = [add(stage, h('div', 'sp-arcl c', '−' + dd), (X(m) + X(lo)) / 2, ny - 54), add(stage, h('div', 'sp-arcl c', '+' + dd), (X(m) + X(hi)) / 2, ny - 54)];
    hide(...arcs, ...al);
    const l2 = add(stage, h('div', 'sp-eq big', K(`${d.q}=(${m}-${dd})(${m}+${dd})`)), 24, 222);
    const l3 = add(stage, h('div', 'sp-eq big', K(`=${m}^2-${dd}^2=${tn(m * m)}-${dd * dd}`)), 24, 280);
    const l4 = add(stage, h('div', 'sp-eq big', K(`=\\boldsymbol{${tn(m * m - dd * dd)}}`)), 24, 336);
    hide(l2, l3, l4);
    return [{
      cap: `${lo} and ${hi} are the <b>same distance</b> from ${m}: ${dd} below and ${dd} above. ${m} is right in the middle.`,
      run: async (c) => {
        await Promise.all([c.fadeIn(nl, 300), ...ticks.map((t, i) => c.fadeIn(t, 250, { delay: i * 30 }))]);
        await Promise.all(arcs.map((p, i) => { const L = p.getTotalLength ? p.getTotalLength() || 200 : 200; p.style.strokeDasharray = L; return c.anim(p, [{ opacity: 1, strokeDashoffset: L }, { opacity: 1, strokeDashoffset: 0 }], 600, { delay: i * 200 }); }).concat(al.map((e, i) => c.pop(e, 300, { delay: 400 + i * 200 }))));
      }
    }, {
      cap: `So ${T(`${d.q}=(${m}-${dd})(${m}+${dd})`)}: a <b>sum times a difference</b> of the same two numbers.`, run: (c) => c.fadeIn(l2, 400)
    }, {
      cap: `The middle terms cancel, so it’s the <b>difference of squares</b>: ${T(`${m}^2-${dd}^2=${tn(m * m)}-${dd * dd}`)}.`, run: (c) => c.fadeIn(l3, 400)
    }, {
      cap: `${T(`${d.q}=${tn(m * m - dd * dd)}`)}.${key === 'p4149' ? ' Same answer as the warm-up’s bent trick: 20, then 09.' : ' No long multiplication needed.'}`,
      run: async (c) => { q.innerHTML = K(`${d.q}=\\boldsymbol{${tn(m * m - dd * dd)}}`); await Promise.all([c.fadeIn(l4, 400), c.pop(q, 400, { delay: 200 })]); }
    }];
  }
};

/* ============ 2. Expand first, then distribute ============ */
const OUT = {
  a: { k: '3', prod: '(4x-5)(x-2)', pexp: '4x^2-8x-5x+10', inner: ['4x^2', '-13x', '+10'], out: ['12x^2', '-39x', '+30'], v: 'x=3', chkO: '3(4(3)-5)(3-2)=3(7)(1)=21', chkA: '12(9)-39(3)+30=21', val: 21 },
  b: { k: '-6', prod: '(5p+2)^2', pexp: '(5p)^2+2(5p)(2)+2^2', inner: ['25p^2', '+20p', '+4'], out: ['-150p^2', '-120p', '-24'], v: 'p=1', chkO: '-6(5(1)+2)^2=-6(49)=-294', chkA: '-150-120-24=-294', val: -294,
    trap: { t: '(-30p-12)^2', at: '(-30-12)^2=(-42)^2=1\\,764', v: '1\\,764', why: 'the 6 got squared too, and the negative disappeared' } },
  n1: { k: '2', prod: '(x+3)^2', pexp: 'x^2+2(x)(3)+3^2', inner: ['x^2', '+6x', '+9'], out: ['2x^2', '+12x', '+18'], v: 'x=1', chkO: '2(1+3)^2=2(16)=32', chkA: '2+12+18=32', val: 32,
    trap: { t: '(2x+6)^2', at: '(2+6)^2=64', v: '64', why: 'the 2 got squared too' } },
  n2: { k: '-', kw: '-1', prod: '(x-4)(x+4)', pexp: 'x^2-4^2', inner: ['x^2', '-16'], out: ['-x^2', '+16'], v: 'x=1', chkO: '-(1-4)(1+4)=-(-3)(5)=15', chkA: '-1+16=15', val: 15 }
};
const outside = {
  title: 'Expand first, then distribute',
  height: 446,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n1', label: tex('2(x+3)^2') }, { v: 'n2', label: tex('-(x-4)(x+4)') }, { sep: 'Example 2 check:' }, { v: 'a', label: '(a) ' + tex('3(4x-5)(x-2)') }, { v: 'b', label: '(b) ' + tex('-6(5p+2)^2') }],
  intro: (key) => { const d = OUT[key]; return `Expand ${T(d.k + d.prod)}. The ${d.kw ? 'negative sign' : T(d.k)} out front is a <b>factor</b> of the whole product.`; },
  make(stage, key, ex) {
    const W = ex.W, d = OUT[key], kw = d.kw || d.k;
    const r0 = add(stage, h('div', 'sp-eq big sp-r0'), 24, 18);
    const k0 = h('span', 'sp-k', K(d.k)); r0.append(k0, h('span', '', K(d.prod)));
    const r1 = add(stage, h('div', 'sp-step'), 24, 92); r1.innerHTML = `<span class="sp-stl">Step 1 · expand the product</span>${K(`${d.prod}=${d.pexp}${d.pexp.replace(/\s/g, '') === d.inner.join('') ? '' : '=' + d.inner.join('')}`)}`; hide(r1);
    const r2 = add(stage, h('div', 'sp-step'), 24, 186); r2.innerHTML = '<span class="sp-stl">Step 2 · distribute to every term</span>';
    const r2row = h('div', 'sp-eq sp-r2'); r2.appendChild(r2row);
    const k2 = h('span', 'sp-k', K(kw)); r2row.append(k2, h('span', 'sp-br', K('(')));
    const ins = d.inner.map((t, i) => { const s = h('span', 'sp-in', K(i ? t : t)); r2row.appendChild(s); return s; });
    r2row.append(h('span', 'sp-br', K(')')));
    hide(r2);
    const r3 = add(stage, h('div', 'sp-eq big sp-row3'), 24, 290); r3.innerHTML = K('=') + ' ';
    const outs = d.out.map((t) => { const s = h('span', 'sp-tok', K(t)); r3.appendChild(s); hide(s); return s; });
    const svg = add(stage, svgEl('svg', { class: 'sp-arcs' }), 0, 0); box(svg, W, 446);
    const chk = add(stage, h('div', 'sp-chk', `<b>Check at ${K(d.v)}:</b> original ${K(d.chkO)} &nbsp;·&nbsp; answer ${K(d.chkA)} <b class="ok">✓</b>`), 24, 350); chk.style.width = (W - 48) + 'px'; hide(chk);
    let trapE = null;
    if (d.trap) { trapE = add(stage, h('div', 'sp-chk bad', `<b>Trap:</b> ${K(`${d.k}${d.prod}\\neq${d.trap.t}`)} &nbsp; at ${K(d.v)}: ${K(d.trap.at)}, not ${K(String(d.val))} <b class="red">✗</b>`), 24, 398); trapE.style.width = (W - 48) + 'px'; hide(trapE); }
    const steps = [{
      cap: `The ${d.kw ? 'negative sign (a factor of −1)' : T(d.k)} out front <b>waits</b>. First expand the product: ${T(`${d.prod}=${d.inner.join('')}`)}.`,
      run: async (c) => { k0.classList.add('wait'); await Promise.all([pulse(c, k0, 1.2), c.fadeIn(r1, 400, { delay: 200 })]); }
    }, {
      cap: `Now multiply <b>every</b> term by ${T(kw)}: ${d.inner.map((t, i) => T(`${kw}(${t.replace(/^\+/, '')})=${d.out[i]}`)).join(', ')}.`,
      run: async (c) => {
        await c.fadeIn(r2, 300);
        const kp = rel(stage, k2);
        for (let i = 0; i < ins.length; i++) {
          const tp = rel(stage, ins[i]), x1 = kp.x + kp.w / 2, x2 = tp.x + tp.w / 2, y = kp.y + 4;
          const p = svgEl('path', { d: `M ${x1} ${y} Q ${(x1 + x2) / 2} ${y - 30 - i * 9} ${x2} ${tp.y + 2}`, class: 'sp-arc red' }); svg.appendChild(p);
          const L = p.getTotalLength ? p.getTotalLength() || 300 : 300; p.style.strokeDasharray = L;
          await Promise.all([c.anim(p, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], 420), c.pop(outs[i], 360, { delay: 260 })]);
        }
      }
    }, {
      cap: `Check by substituting ${T(d.v)}: the original gives ${T(String(d.val))} and so does the answer ✓. So ${T(`${d.k}${d.prod}=${d.out.join('')}`)}.`,
      run: (c) => c.fadeIn(chk, 400)
    }];
    if (d.trap) steps.push({
      cap: `Why not put ${T(d.k)} inside the bracket first? ${T(d.trap.t)} gives ${T(d.trap.v)} at ${T(d.v)}, not ${T(String(d.val))}: ${d.trap.why}. The square belongs to the bracket <b>only</b>.`,
      run: (c) => c.fadeIn(trapE, 400)
    });
    return steps;
  }
};

/* ============ 3. Expand every product, flip, collect ============ */
// polynomials in x: arrays of coefficients, index = degree
const pmul = (p, q) => { const r = Array(p.length + q.length - 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; })); return r; };
const pscale = (p, k) => p.map((a) => a * k);
const xp = (dg) => (dg === 0 ? '' : dg === 1 ? 'x' : `x^{${dg}}`);
const termT = (c, dg, first) => { const a = Math.abs(c), co = dg && a === 1 ? '' : String(a); return (c < 0 ? '-' : first ? '' : '+') + co + xp(dg); };
const polyT = (p) => { const out = []; for (let dg = p.length - 1; dg >= 0; dg--) if (p[dg]) out.push(termT(p[dg], dg, !out.length)); return out.join('') || '0'; };
const CB = {
  a: { e: '(x+6)(x-6)-(x+3)(x+9)', parts: [{ s: 1, k: 1, f: [[6, 1], [-6, 1]], t: '(x+6)(x-6)' }, { s: -1, k: 1, f: [[3, 1], [9, 1]], t: '(x+3)(x+9)' }] },
  b: { e: '4x(2x^2-5x+3)-(2x^2+3x)(4x-7)', parts: [{ s: 1, k: 1, f: [[0, 4], [3, -5, 2]], t: '4x(2x^2-5x+3)' }, { s: -1, k: 1, f: [[0, 3, 2], [-7, 4]], t: '(2x^2+3x)(4x-7)' }] },
  c: { e: '3(3x-4)(2x+3)-5(x-2)(4x-3)', parts: [{ s: 1, k: 3, f: [[-4, 3], [3, 2]], t: '3(3x-4)(2x+3)', pt: '(3x-4)(2x+3)' }, { s: -1, k: 5, f: [[-2, 1], [-3, 4]], t: '5(x-2)(4x-3)', pt: '(x-2)(4x-3)' }] },
  n1: { e: '(x+5)^2-(x-5)^2', parts: [{ s: 1, k: 1, f: [[5, 1], [5, 1]], t: '(x+5)^2' }, { s: -1, k: 1, f: [[-5, 1], [-5, 1]], t: '(x-5)^2' }] },
  n2: { e: '(x+1)(x+2)+(x-3)^2', parts: [{ s: 1, k: 1, f: [[1, 1], [2, 1]], t: '(x+1)(x+2)' }, { s: 1, k: 1, f: [[-3, 1], [-3, 1]], t: '(x-3)^2' }] }
};
const DEGN = ['numbers', 'x terms', 'x² terms', 'x³ terms'];
const combine = {
  title: 'Expand every product, flip the signs, then collect',
  height: 478,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n1', label: tex('(x+5)^2-(x-5)^2') }, { v: 'n2', label: tex('(x+1)(x+2)+(x-3)^2') }, { sep: 'Example 3 check:' }, { v: 'a', label: '(a)' }, { v: 'b', label: '(b)' }, { v: 'c', label: '(c)' }],
  intro: (k) => `Simplify ${T(CB[k].e)}. Expand each product <b>completely</b> before collecting anything.`,
  make(stage, key, ex) {
    const W = ex.W, d = CB[key];
    add(stage, h('div', 'sp-eq big c', K(d.e)), W / 2, 36);
    const P = d.parts.map((pt) => { const raw = pt.f.reduce(pmul); return { ...pt, raw, P: pscale(raw, pt.k) }; });
    const rowsY = [86, 152], LX = 330;
    const rows = P.map((pt, ri) => {
      const y = rowsY[ri];
      const lab = add(stage, h('div', 'sp-cb-lab', K((ri ? (pt.s < 0 ? '-' : '+') : '') + pt.t) + ' ' + K('\\to')), LX, y); lab.style.translate = '-100% 0';
      const terms = []; for (let dg = pt.P.length - 1; dg >= 0; dg--) if (pt.P[dg]) terms.push({ c: pt.P[dg], dg });
      let x = LX + 16;
      const br = [];
      if (pt.s < 0) { const m = add(stage, h('div', 'sp-cb-br neg', K('-(')), x, y); br.push(m); x += (rel(stage, m).w || 30) + 4; }
      const chips = terms.map((t, i) => { const e = add(stage, h('div', 'sp-tc', K(termT(t.c, t.dg, i === 0))), x, y); e.dataset.dg = t.dg; e._c = t.c; e._first = i === 0; x += (rel(stage, e).w || 70) + 8; hide(e); return e; });
      if (pt.s < 0) br.push(add(stage, h('div', 'sp-cb-br neg', K(')')), x, y));
      hide(lab, ...br);
      return { pt, lab, chips, br, y };
    });
    // collecting columns
    const degs = [...new Set(P.flatMap((pt) => pt.P.map((c, dg) => (c ? dg : -1)).filter((dg) => dg >= 0)))].sort((a, b) => b - a);
    const cw = Math.min(200, (W - 80) / degs.length), cx0 = W / 2 - (cw * degs.length) / 2;
    const colX = (dg) => cx0 + cw * degs.indexOf(dg) + cw / 2;
    const heads = degs.map((dg) => add(stage, h('div', 'sp-cb-h c', DEGN[dg] || `x^${dg}`), colX(dg), 236));
    const line = add(stage, box(h('div', 'sp-cb-line'), cw * degs.length - 20, 3), cx0 + 10, 350);
    const total = degs.map(() => 0); P.forEach((pt) => pt.P.forEach((c, dg) => { if (c) total[degs.indexOf(dg)] += pt.s * c; }));
    const sums = degs.map((dg, i) => add(stage, h('div', 'sp-cb-sum c' + (total[i] ? '' : ' zero'), total[i] ? K(termT(total[i], dg, true)) : K('0')), colX(dg), 380));
    const resP = []; degs.forEach((dg, i) => { resP[dg] = total[i]; }); for (let i = 0; i < resP.length; i++) resP[i] = resP[i] || 0;
    const res = polyT(resP);
    const fin = add(stage, h('div', 'sp-eq sp-boxed c', K(`${d.e}=\\boldsymbol{${res}}`)), W / 2, 440);
    hide(...heads, line, ...sums, fin);
    const expCap = (pt, which) => {
      const what = `${which} product`;
      if (pt.k !== 1) return `Expand the ${what}: ${T(`${pt.pt}=${polyT(pt.raw)}`)}, then times ${pt.k}: ${T(polyT(pt.P))}.`;
      return `Expand the ${what}: ${T(`${pt.t}=${polyT(pt.P)}`)}.`;
    };
    const neg = rows.find((r) => r.pt.s < 0), zeroDs = degs.filter((dg, i) => !total[i]);
    const steps = [{
      cap: expCap(P[0], 'first'), run: (c) => Promise.all([c.fadeIn(rows[0].lab, 300), ...rows[0].chips.map((e, i) => c.pop(e, 340, { delay: 200 + i * 120 }))])
    }, {
      cap: expCap(P[1], 'second') + (P[1].s < 0 ? ' Keep it in brackets: the minus sign in front is still waiting.' : ''),
      run: (c) => Promise.all([c.fadeIn(rows[1].lab, 300), ...rows[1].br.map((e) => c.fadeIn(e, 300)), ...rows[1].chips.map((e, i) => c.pop(e, 340, { delay: 200 + i * 120 }))])
    }, neg ? {
      cap: `The minus sign flips <b>every</b> term of the second product: ${T(`-(${polyT(neg.pt.P)})=${polyT(pscale(neg.pt.P, -1))}`)}.`,
      run: async (c) => {
        await Promise.all(neg.chips.map((e, i) => c.anim(e, [{ transform: 'rotateX(0)' }, { transform: 'rotateX(90deg)' }], 220, { delay: i * 140 })));
        neg.chips.forEach((e) => { e._c = -e._c; e.innerHTML = K(termT(e._c, +e.dataset.dg, false)); e.classList.add('flip'); });
        await Promise.all([...neg.chips.map((e, i) => c.anim(e, [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0)' }], 260, { delay: i * 140 })), ...neg.br.map((e) => fadeOut(c, e, 300))]);
      }
    } : {
      cap: 'A <b>plus</b> sign in front changes nothing: every term keeps its sign. Just drop the brackets.',
      run: (c) => Promise.all(rows[1].chips.map((e, i) => pulse(c, e, 1.12, { delay: i * 100 })))
    }, {
      cap: '<b>Collect like terms:</b> sort every term into a column by its degree.',
      run: async (c) => {
        await Promise.all(heads.map((e) => c.fadeIn(e, 300)));
        const ys = {}; const jobs = [];
        rows.forEach((r) => r.chips.forEach((e) => {
          const dg = +e.dataset.dg, k = ys[dg] = (ys[dg] || 0) + 1;
          if (e._first) { e.innerHTML = K(termT(e._c, dg, false)); }
          const w = rel(stage, e).w || 70;
          jobs.push(moveTo(c, e, colX(dg) - w / 2, 262 + (k - 1) * 42, 700, { delay: jobs.length * 60 }));
        }));
        await Promise.all([...jobs, ...rows.map((r) => fadeOut(c, r.lab, 300))]);
      }
    }, {
      cap: `Add down each column.${zeroDs.length ? ` ${zeroDs.map((dg) => (dg ? `The ${T(xp(dg))} terms` : 'The numbers')).join(' and ').replace(' and The', ' and the')} cancel: ${zeroDs.length > 1 ? '<b>zero pairs</b>' : 'a <b>zero pair</b>'}.` : ''} So ${T(`${d.e}=${res}`)}.`,
      run: async (c) => {
        await c.fadeIn(line, 250);
        const jobs = [];
        degs.forEach((dg, i) => {
          if (!total[i]) { // a zero pair: the two chips slide together, then both fade
            const zs = rows.flatMap((r) => r.chips.filter((e) => +e.dataset.dg === dg));
            const mid = zs.reduce((t, e) => t + parseFloat(e.style.top), 0) / zs.length;
            zs.forEach((e) => jobs.push(c.anim(e, [{ top: e.style.top, opacity: 1 }, { top: mid + 'px', opacity: 1, offset: 0.6 }, { top: mid + 'px', opacity: 0.12 }], 900)));
          }
          jobs.push(c.pop(sums[i], 380, { delay: 200 + i * 150 }));
        });
        await Promise.all(jobs);
        await c.pop(fin, 420);
      }
    }];
    return steps;
  }
};

/* ============ 4. Extension: completing the square with algebra tiles ============ */
const CS = { ex4: { k: 16, c: 70 }, n1: { k: 6, c: 11 }, n2: { k: 4, c: 1 } };
const complete = {
  title: 'Extension: complete the square with tiles',
  height: 470,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n1', label: tex('x^2+6x+11') }, { v: 'n2', label: tex('x^2+4x+1') }, { sep: 'Example 4 check:' }, { v: 'ex4', label: tex('x^2+16x+70') }],
  intro: (key) => { const { k, c } = CS[key]; return `Build ${T(`x^2+${k}x+${c}`)} with algebra tiles, then rearrange the tiles into the biggest square we can.`; },
  make(stage, key, ex) {
    const W = ex.W, { k, c } = CS[key], a = k / 2, b = c - a * a, need = Math.max(0, a * a - c);
    const poly = `x^2+${k}x+${c}`, U = 22, X = 176, x0 = 30, y0 = 70;
    const hd = add(stage, h('div', 'sp-eq big', K(poly)), W - 24, 12); hd.style.translate = '-100% 0';
    const x2 = add(stage, box(h('div', 'sp-t x2', K('x^2')), X, X), x0, y0); hide(x2);
    const xs = [], us = [];
    const px0 = x0 + X + a * U + 46;
    for (let i = 0; i < k; i++) { const e = add(stage, box(h('div', 'sp-t x1'), U, X), px0 + i * (U + 5), y0); hide(e); xs.push(e); }
    const ucols = 12, uy0 = y0 + X + 26;
    for (let i = 0; i < c; i++) { const e = add(stage, box(h('div', 'sp-t u1'), U, U), px0 + (i % ucols) * (U + 4), uy0 + Math.floor(i / ucols) * (U + 4)); hide(e); us.push(e); }
    const zps = [];
    for (let i = 0; i < need; i++) {
      const xx = px0 + 80 + i * 2 * (U + 10), yy = uy0;
      const p = add(stage, box(h('div', 'sp-t u1'), U, U), xx, yy), n = add(stage, box(h('div', 'sp-t u1 neg'), U, U), xx + U + 4, yy);
      hide(p, n); zps.push([p, n]);
    }
    const zpLab = add(stage, h('div', 'sp-tag amb', need + ' zero pair' + (need > 1 ? 's' : '')), px0 + 80, uy0 + U + 10); hide(zpLab);
    const corner = add(stage, box(h('div', 'sp-ghost lg c', K(`${a * a}`)), a * U, a * U), x0 + X + a * U / 2, y0 + X + a * U / 2); hide(corner);
    const PX = Math.max(x0 + X + a * U + 70, 452), pw = W - PX - 18;
    const E = (y, s, cls = '') => { const e = add(stage, h('div', 'sp-eq ' + cls, s), PX, y); hide(e); return e; };
    const e1 = E(72, `${K(`2a=${k}`)}, so ${K(`a=${a}`)}`);
    const e2 = E(118, `corner needs ${K(`a^2=${a * a}`)}`);
    const e3 = E(166, K(`${poly}=(x+${a})^2${b < 0 ? '' : '+'}${b}`), 'big sp-boxed');
    if (e3.offsetWidth > W - PX - 12) e3.style.fontSize = Math.floor(32 * (W - PX - 12 - 42) / (e3.offsetWidth - 42)) + 'px'; // keep the boxed line inside the stage
    const bs = `${b < 0 ? '' : '+'}${b}`;
    const e4 = E(354, `<span class="sp-stl">Check</span>${KN(`(x+${a})^2${bs}`)} ${KN(`=x^2+${k}x+${a * a}${bs}`)} <span class="nw">${K(`=${poly}`)} <b class="ok">✓</b></span>`, 'sp-chkline');
    e4.style.width = pw + 'px';
    const leftY = 284, leftLab = add(stage, h('div', 'sp-tag ' + (b < 0 ? 'no' : 'amb'), `left over: ${b < 0 ? '−' : '+'}${Math.abs(b)}`), PX, leftY - 34); hide(leftLab);
    const dims = [...dimH(stage, x0, y0 - 18, X, 'x'), ...dimH(stage, x0 + X, y0 - 18, a * U, String(a)), ...dimV(stage, x0 + X + a * U + 6, y0, X, 'x', { right: true }), ...dimV(stage, x0 + X + a * U + 6, y0 + X, a * U, String(a), { right: true })];
    hide(...dims);
    const side = add(stage, h('div', 'sp-tag big c', `side ${K(`x+${a}`)}`), x0 + (X + a * U) / 2, y0 + X + a * U + 28); hide(side);
    const steps = [{
      cap: `Build ${T(poly)}: one ${T('x^2')}-tile, ${k} ${T('x')}-tiles and ${c} unit tile${c > 1 ? 's' : ''}. They’re all <b>shaded</b>, so they’re all positive.`,
      run: (c2) => Promise.all([c2.pop(x2, 380), ...xs.map((e, i) => c2.pop(e, 300, { delay: 150 + i * 30 })), ...us.map((e, i) => c2.pop(e, 260, { delay: 300 + i * 8 }))])
    }, {
      cap: `Split the ${T('x')}-tiles in half: ${a} along the right side of the ${T('x^2')}-tile and ${a} along the bottom. Each half is ${T('ax')}, so ${T(`2a=${k}`)} and ${T(`a=${a}`)}.`,
      run: (c2) => Promise.all([...xs.map((e, i) => {
        const r = i < a; const tx = r ? x0 + X + i * U : x0, ty = r ? y0 : y0 + X + (i - a) * U;
        return c2.anim(e, [{ left: e.style.left, top: e.style.top, width: U + 'px', height: X + 'px' }, { left: tx + 'px', top: ty + 'px', width: (r ? U : X) + 'px', height: (r ? X : U) + 'px' }], 750, { delay: i * 40 });
      }), c2.fadeIn(e1, 400, { delay: 400 })])
    }, {
      cap: `It’s almost a square of side ${T(`x+${a}`)}. The corner is missing ${a === 8 || a === 11 ? 'an' : 'a'} ${a} by ${a} square: it needs <b>${a * a}</b> unit tiles.`,
      run: (c2) => Promise.all([c2.pop(corner, 420), c2.fadeIn(e2, 400, { delay: 200 })])
    }, {
      cap: need ? `We have only ${c}. Add ${need} <b>zero pair${need > 1 ? 's' : ''}</b> (a shaded and an unshaded 1-tile together are worth 0). The shaded ones finish the corner; the ${need} unshaded (negative) tile${need > 1 ? 's are' : ' is'} left over.`
        : `Move ${a * a} unit tiles into the corner. ${b ? `${b} unit tile${b > 1 ? 's are' : ' is'} left over.` : 'None are left over.'}`,
      run: async (c2) => {
        if (need) { await Promise.all([...zps.flatMap(([p, n], i) => [c2.pop(p, 300, { delay: i * 120 }), c2.pop(n, 300, { delay: i * 120 + 60 })]), c2.fadeIn(zpLab, 300)]); await c2.sleep(250); }
        const fill = [...us, ...zps.map(([p]) => p)].slice(0, a * a), rest = need ? zps.map(([, n]) => n) : us.slice(a * a);
        const jobs = fill.map((e, i) => moveTo(c2, e, x0 + X + (i % a) * U, y0 + X + Math.floor(i / a) * U, 650, { delay: Math.min(i * 14, 700) }));
        rest.forEach((e, i) => jobs.push(moveTo(c2, e, PX + (i % 8) * (U + 5), leftY + Math.floor(i / 8) * (U + 5), 650, { delay: 300 + i * 40 })));
        jobs.push(fadeOut(c2, corner, 300), c2.fadeIn(leftLab, 300, { delay: 500 }));
        if (need) jobs.push(fadeOut(c2, zpLab, 300));
        await Promise.all(jobs);
      }
    }, {
      cap: `A complete square of side ${T(`x+${a}`)}, plus the leftovers: ${T(`${poly}=(x+${a})^2${b < 0 ? '' : '+'}${b}`)}. So ${T(`a=${a}`)} and ${T(`b=${b}`)}.`,
      run: (c2) => Promise.all([...dims.map((e) => c2.fadeIn(e, 300)), c2.fadeIn(side, 300), c2.pop(e3, 420, { delay: 200 })])
    }, {
      cap: `Check by expanding: ${T(`(x+${a})^2${b < 0 ? '' : '+'}${b}=x^2+${k}x+${a * a}${b < 0 ? '' : '+'}${b}`)}, which is ${T(poly)} ✓.`,
      run: (c2) => c2.fadeIn(e4, 400)
    }];
    return steps;
  }
};

/* ============ warm-up: the squaring trick ============ */
function mountTrick() {
  const host = document.getElementById('trick'); if (!host) return;
  const nums = [35, 15, 25, 45, 65, 85];
  host.innerHTML = `<div class="sp-tr-top no-ink"><span class="sp-tr-l">Try it:</span>${nums.map((n) => `<button class="chip" type="button" data-n="${n}">${n}²</button>`).join('')}</div>
    <div class="sp-tr-row">
      <div class="sp-tr-box b0"><div class="sp-tr-v"></div><div class="sp-tr-c">the number</div></div><div class="sp-tr-ar">→</div>
      <div class="sp-tr-box b1"><div class="sp-tr-v"></div><div class="sp-tr-c">tens digit × next number up</div></div><div class="sp-tr-ar">→</div>
      <div class="sp-tr-box b2"><div class="sp-tr-v"></div><div class="sp-tr-c">then write 25</div></div><div class="sp-tr-ar">→</div>
      <div class="sp-tr-box b3"><div class="sp-tr-v"></div><div class="sp-tr-c">done!</div></div>
    </div>`;
  const v = [...host.querySelectorAll('.sp-tr-v')], chips = [...host.querySelectorAll('[data-n]')];
  let gen = 0;
  const show = (n, animate) => {
    const g = ++gen, t = Math.floor(n / 10), p = t * (t + 1);
    chips.forEach((b) => b.classList.toggle('on', +b.dataset.n === n));
    const vals = [`${n}²`, `${t} × ${t + 1} = ${p}`, `${p}<span class="red">25</span>`, fmt(n * n)];
    v.forEach((e, i) => {
      if (!animate) { e.innerHTML = vals[i]; e.style.opacity = 1; return; }
      e.style.opacity = i ? 0 : 1; e.innerHTML = vals[i];
      if (i) setTimeout(() => { if (g !== gen) return; e.style.opacity = 1; e.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.1)', offset: 0.65 }, { opacity: 1, transform: 'scale(1)' }], 420); }, i * 650);
    });
  };
  chips.forEach((b) => b.addEventListener('click', () => show(+b.dataset.n, true)));
  show(35, false);
}

function mountSquare35() {
  const host = document.getElementById('sq35'); if (!host) return;
  const S = parseFloat(getComputedStyle(host).getPropertyValue('--sq')) || 300, pa = Math.round(S * 0.76), pb = S - pa; // the size comes from the CSS (--sq), so the one-screen layout can shrink it
  const pcs = [[0, 0, pa, pa, 'aa', '30 × 30', 900], [pa, 0, pb, pa, 'ab', '30 × 5', 150], [0, pa, pa, pb, 'ab', '5 × 30', 150], [pa, pa, pb, pb, 'bb', '5 × 5', 25]];
  host.innerHTML = `<div class="sp-sq-in" style="width:${S}px;height:${S}px">
      ${pcs.map(([x, y, w, ht, cls, m, v], i) => `<button type="button" class="sp-sqp ${cls}" data-i="${i}" style="left:${x}px;top:${y}px;width:${w}px;height:${ht}px"><span class="q">?</span><span class="v"><small>${m}</small>${v}</span></button>`).join('')}
      <div class="sp-sql t" style="left:${pa / 2}px">30</div><div class="sp-sql t" style="left:${pa + pb / 2}px">5</div>
      <div class="sp-sql l" style="top:${pa / 2}px">30</div><div class="sp-sql l" style="top:${pa + pb / 2}px">5</div>
    </div>
    <div class="sp-sq-sum"><span class="muted">Tap each piece</span></div>
    <button class="pill small sp-sq-all no-ink" type="button">Show all</button>`;
  const ps = [...host.querySelectorAll('.sp-sqp')], sum = host.querySelector('.sp-sq-sum');
  const upd = () => {
    const on = ps.filter((p) => p.classList.contains('open'));
    if (on.length === 4) sum.innerHTML = `${tex('900+150+150+25=1\\,225')}<span class="sp-sq-note">The corner makes the <b class="red">25</b>.</span>`;
    else sum.innerHTML = on.length ? `${on.length} of 4 pieces found` : '<span class="muted">Tap each piece</span>';
  };
  ps.forEach((p) => p.addEventListener('click', () => { p.classList.toggle('open'); if (p.classList.contains('open')) p.animate([{ transform: 'scale(.94)' }, { transform: 'scale(1)' }], 260); upd(); }));
  host.querySelector('.sp-sq-all').addEventListener('click', () => { const all = ps.every((p) => p.classList.contains('open')); ps.forEach((p) => p.classList.toggle('open', !all)); upd(); });
}

function mountReveals() {
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { squareSplit, classicError, minusSquare, sumDiff, recognizer, mental, outside, combine, complete };
  const all = [...document.querySelectorAll('[data-explainer]')].map((el) => new Explainer(el, defs[el.dataset.explainer]));
  // chips are laid out by measuring KaTeX widths: once the math fonts arrive, redraw any explainer still at its start
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => all.forEach((x) => { if (x.steps && x.k === 0 && !x.running) x.build(0); }));
}

mountTrick(); mountSquare35(); mountReveals(); mountExplainers();

/* ---------- Math History (the brown box): Euclid II.4 and al-Khwarizmi ----------
 * Part 1: a square of side a + b is cut into a², ab, ab, b², and the equation builds beside it. Part 2: the cut slides so
 * the same picture is x² + 5x + 5x = 39 (al-Khwarizmi's “a square and ten roots equal thirty-nine”); the empty 5 × 5 corner
 * fills in gold (+25), the whole square is 64 = 8², so x + 5 = 8 and x = 3. Colours match the lesson's square pictures. */
(function squareHistory() {
  const svg = document.getElementById('square-anim'); if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k])); (parent || svg).appendChild(e); return e; };
  const txt = (s, attrs, parent) => { const e = mk('text', attrs, parent); e.textContent = s; return e; };
  const X0 = 36, Y0 = 40, S = 240, U1 = 154, U2 = S * 3 / 8; // part 1: a = 150, b = 82; part 2: x : 5 = 3 : 5
  const P = {
    aa: mk('rect', { class: 'u3l3h-p u3l3h-aa' }), ab1: mk('rect', { class: 'u3l3h-p u3l3h-ab' }),
    ab2: mk('rect', { class: 'u3l3h-p u3l3h-ab' }), bb: mk('rect', { class: 'u3l3h-p u3l3h-bb' }),
  };
  const outline = mk('rect', { x: X0, y: Y0, width: S, height: S, class: 'u3l3h-out' });
  const L = { aa: txt('', { class: 'u3l3h-l u3l3h-laa', 'text-anchor': 'middle' }), ab1: txt('', { class: 'u3l3h-l u3l3h-lab', 'text-anchor': 'middle' }),
    ab2: txt('', { class: 'u3l3h-l u3l3h-lab', 'text-anchor': 'middle' }), bb: txt('', { class: 'u3l3h-l u3l3h-lbb', 'text-anchor': 'middle' }) };
  const side = { t1: txt('', { y: Y0 - 9, 'text-anchor': 'middle', class: 'u3l3h-side' }), t2: txt('', { y: Y0 - 9, 'text-anchor': 'middle', class: 'u3l3h-side' }),
    l1: txt('', { x: X0 - 10, 'text-anchor': 'end', class: 'u3l3h-side' }), l2: txt('', { x: X0 - 10, 'text-anchor': 'end', class: 'u3l3h-side' }) };
  const eight = txt('8', { x: X0 + S + 13, y: Y0 + S / 2 + 6, class: 'u3l3h-eight' });
  mk('line', { x1: X0 + S + 6, x2: X0 + S + 6, y1: Y0, y2: Y0 + S, class: 'u3l3h-brace' }, svg).classList.add('u3l3h-eightl');
  const eightL = svg.querySelector('.u3l3h-eightl');
  // the words on the right
  const head = txt('', { x: 324, y: 50, class: 'u3l3h-head' }), sub = txt('', { x: 324, y: 72, class: 'u3l3h-sub' });
  const lines = [0, 1, 2, 3].map((i) => txt('', { x: 324, y: 118 + i * 42, class: 'u3l3h-eq' }));
  const T1 = ['(a + b)²', '= a² + ab + ab + b²', '= a² + 2ab + b²', ''];
  const T2 = ['x² + 10x = 39', 'corner: 39 + 25 = 64', '(x + 5)² = 64 = 8²', 'x + 5 = 8, so x = 3'];

  const at = (u) => {
    const v = S - u;
    const set = (r, x, y, w, h) => { r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', w); r.setAttribute('height', h); };
    set(P.aa, X0, Y0, u, u); set(P.ab1, X0 + u, Y0, v, u); set(P.ab2, X0, Y0 + u, u, v); set(P.bb, X0 + u, Y0 + u, v, v);
    const c = (l, x, y) => { l.setAttribute('x', x); l.setAttribute('y', y + 7); };
    c(L.aa, X0 + u / 2, Y0 + u / 2); c(L.ab1, X0 + u + v / 2, Y0 + u / 2); c(L.ab2, X0 + u / 2, Y0 + u + v / 2); c(L.bb, X0 + u + v / 2, Y0 + u + v / 2);
    side.t1.setAttribute('x', X0 + u / 2); side.t2.setAttribute('x', X0 + u + v / 2);
    side.l1.setAttribute('y', Y0 + u / 2 + 6); side.l2.setAttribute('y', Y0 + u + v / 2 + 6);
  };
  const on = (el, b) => el.classList.toggle('on', !!b);
  const END = 12600;
  const ease = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  function draw(ms) {
    const part2 = ms >= 5600;
    const u = U1 + (U2 - U1) * ease((ms - 5000) / 1200);
    at(u);
    on(outline, true);
    // part 1: pieces fill one by one; part 2: x², the two 5x strips, then the gold corner
    on(P.aa, ms >= 900); on(P.ab1, ms >= 1500); on(P.ab2, ms >= 2100); on(P.bb, ms >= 2700 && (!part2 || ms >= 8000));
    P.bb.classList.toggle('u3l3h-gold', part2); P.bb.classList.toggle('u3l3h-empty', part2 && ms < 8000);
    if (part2 && ms < 8000) P.bb.classList.add('on');
    const fade = ms >= 4800 && ms < 6400; // labels hide while the cut slides
    L.aa.textContent = part2 ? 'x²' : 'a²'; L.ab1.textContent = L.ab2.textContent = part2 ? '5x' : 'ab'; L.bb.textContent = part2 ? (ms >= 8000 ? '25' : '?') : 'b²';
    on(L.aa, ms >= 900 && !fade); on(L.ab1, ms >= 1500 && !fade); on(L.ab2, ms >= 2100 && !fade); on(L.bb, ms >= 2700 && !fade);
    L.bb.classList.toggle('u3l3h-lgold', part2);
    side.t1.textContent = side.l1.textContent = part2 ? 'x' : 'a'; side.t2.textContent = side.l2.textContent = part2 ? '5' : 'b';
    [side.t1, side.t2, side.l1, side.l2].forEach((e) => on(e, ms >= 300 && !fade));
    on(eight, ms >= 9500); on(eightL, ms >= 9500);
    head.textContent = part2 ? 'al-Khwarizmi, Baghdad' : 'Euclid, Elements II.4'; sub.textContent = part2 ? 'c. 820 · “a square and ten roots”' : 'c. 300 BCE · a line cut in two';
    on(head, !fade); on(sub, !fade);
    const T = part2 ? T2 : T1, when = part2 ? [6600, 8000, 9500, 11000] : [600, 1500, 3300, 99999];
    lines.forEach((l, i) => { l.textContent = T[i]; on(l, ms >= when[i] && !fade); l.classList.toggle('u3l3h-key', (part2 && i === 3) || (!part2 && i === 2)); });
  }
  let t0 = 0, raf = 0;
  function frame(now) { if (!t0) t0 = now; const ms = now - t0; draw(ms); if (ms < END) raf = requestAnimationFrame(frame); }
  function play() {
    cancelAnimationFrame(raf); t0 = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(END); return; }
    raf = requestAnimationFrame(frame);
  }
  draw(0);
  svg.addEventListener('click', play);
  const btn = svg.closest('.hist-anim') && svg.closest('.hist-anim').querySelector('.hist-play'); if (btn) btn.addEventListener('click', play);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.5 });
    io.observe(svg);
  } else play();
})();
