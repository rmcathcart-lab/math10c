/* Math 10C · Unit 1 · Lesson 6 — Roots of Real Numbers: the explainers and widgets on this page. */
import { h, fmt, Explainer, primeFactors, factors } from '../explain.js';
import { tex } from '../tex.js';
import { standup } from '../standup.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
/* KaTeX with \htmlClass allowed (used to point at the parts of a radical) */
const K = (s, display) => { try { return window.katex.renderToString(String(s), { displayMode: !!display, throwOnError: false, output: 'html', trust: true, strict: false }); } catch (e) { return String(s); } };
const tn = (n) => fmt(n).replace(/ /g, '\\,'); // TeX number with a thin space, like the booklet: 6\,561
const mn = (n) => fmt(n).replace(/^-/, '−'); // HTML number with a real minus sign
const rad = (n, x) => (n === 2 ? `\\sqrt{${x}}` : `\\sqrt[${n}]{${x}}`);
const nthRoot = (x, n) => (x < 0 ? -Math.pow(-x, 1 / n) : Math.pow(x, 1 / n));
const r2 = (x) => (Math.round(x * 100) / 100).toFixed(2).replace(/^-/, '−');
const ORD = { 2: 'square', 3: 'cube', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth' };
const ord = (n) => ORD[n] || n + 'th';
const NUM = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight' };
const plural = (k, w) => (NUM[k] || k) + ' ' + w + (k === 1 ? '' : 's');
/* where an element sits inside the stage, in unscaled stage pixels (the lesson is scaled to fit the screen) */
function rectIn(el, stage) {
  const b = stage.getBoundingClientRect(), s = b.width / stage.offsetWidth || 1, a = el.getBoundingClientRect();
  return { x: (a.left - b.left) / s - stage.clientLeft, y: (a.top - b.top) / s - stage.clientTop, w: a.width / s, h: a.height / s };
}
const SVGNS = 'http://www.w3.org/2000/svg';
function svgLayer(stage, cls) { const s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('class', cls); stage.appendChild(s); return s; }
function arrow(svg, x1, y1, x2, y2, color) {
  const g = document.createElementNS(SVGNS, 'g'), ln = document.createElementNS(SVGNS, 'line'), hd = document.createElementNS(SVGNS, 'path');
  const a = Math.atan2(y2 - y1, x2 - x1), L = 13, sp = 0.45;
  ln.setAttribute('x1', x1); ln.setAttribute('y1', y1); ln.setAttribute('x2', x2 - Math.cos(a) * 6); ln.setAttribute('y2', y2 - Math.sin(a) * 6); ln.setAttribute('stroke', color);
  hd.setAttribute('d', `M ${x2} ${y2} L ${x2 - L * Math.cos(a - sp)} ${y2 - L * Math.sin(a - sp)} L ${x2 - L * Math.cos(a + sp)} ${y2 - L * Math.sin(a + sp)} Z`); hd.setAttribute('fill', color);
  g.append(ln, hd); svg.appendChild(g); return g;
}
const GEAR = '<svg viewBox="-16 -16 32 32"><g>' + [0, 45, 90, 135].map((a) => `<rect x="-3" y="-15.5" width="6" height="31" rx="1.5" transform="rotate(${a})"/>`).join('') + '<circle r="11"/></g><circle r="4" fill="rgba(0,0,0,.35)"/></svg>';
const spin = (c, el, ms = 900) => c.anim(el, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], ms, { easing: 'ease-in-out' });

/* ============ 2. The power machine and its undo button ============ */
const parseB = (s) => { const [p, q] = String(s).split('/').map(Number); return { p, q: q || 1 }; };
const fracTex = ({ p, q }) => (q === 1 ? tn(p) : (p < 0 ? '-' : '') + `\\tfrac{${Math.abs(p)}}{${q}}`);
const fpow = ({ p, q }, k) => ({ p: Math.pow(p, k), q: Math.pow(q, k) });
const machine = {
  title: 'The power machine and its undo button',
  height: 416,
  choices: [{ v: '2,5', label: K('2^5') }, { v: '3,4', label: K('3^4') }, { v: '4,3', label: K('4^3') }, { v: '2,7', label: K('2^7') }, { v: '-2,5', label: K('(-2)^5') },
    { sep: 'Example 1 check:' }, { v: '11,2', label: K('\\sqrt{121}') }, { v: '-5,3', label: K('\\sqrt[3]{-125}') }, { v: '9,4', label: K('\\sqrt[4]{6\\,561}') }, { v: '1/3,5', label: K('\\sqrt[5]{\\tfrac{1}{243}}') }],
  intro: () => 'Squaring has an undo button: the square root. Cubing has one too: the cube root. <b>Every</b> power has an undo button — a <b>root</b> with the same number as its <b>index</b>.',
  make(stage, v, ex) {
    const W = ex.W, [bs, ns] = String(v).split(','), b = parseB(bs), n = Number(ns), x = fpow(b, n);
    const neg = b.p < 0, bT = fracTex(b), xT = fracTex(x), fT = neg ? `(${bT})` : b.q > 1 ? `\\left(${bT}\\right)` : bT;
    const y1 = 72, y2 = 286, xl = 104, xr = W - 104, xm = W / 2;
    const belt = (a, z, y, dir) => { const e = add(stage, h('div', 'pm-belt'), a, y); e.style.width = (z - a) + 'px'; add(stage, h('div', 'pm-arrow', dir), (a + z) / 2, y - 16); };
    [[y1, '→'], [y2, '←']].forEach(([y, d]) => { belt(xl + 58, xm - 130, y, d); belt(xm + 130, xr - 58, y, d); });
    const box = (x0, y, cls) => add(stage, h('div', 'pm-box ' + (cls || ''), ''), x0, y);
    const inT = box(xl, y1), outT = box(xr, y1, 'out'), inB = box(xr, y2), outB = box(xl, y2, 'out');
    const mach = (y, cls, lab, op) => { const m = add(stage, h('div', 'pm-mach ' + cls, `<small>${lab}</small><div class="pm-op">${K(op)}</div>`), xm, y); const g = h('div', 'pm-gear', GEAR); m.appendChild(g); return [m, g]; };
    const [mT, gT] = mach(y1, '', 'POWER', `\\square^{${n}}`);
    const [mB, gB] = mach(y2, 'root off', 'ROOT', rad(n, '\\square'));
    add(stage, h('div', 'mut-lab', 'in'), xl - 12, y1 - 64); add(stage, h('div', 'mut-lab', 'out'), xr - 14, y1 - 64);
    // the factors, with the running product under each one
    const fac = add(stage, h('div', 'pm-fac'), xm, 140), fs = [], xs = [];
    for (let k = 1; k <= n; k++) {
      if (k > 1) { const s = h('div', 'pm-x', '×'); fac.appendChild(s); xs.push(s); }
      const f = h('div', 'pm-f', `<b>${K(fT)}</b><span>${k === 1 ? '&nbsp;' : K(fracTex(fpow(b, k)))}</span>`); fac.appendChild(f); fs.push(f);
    }
    const eq = h('div', 'pm-eq', '= ' + K(xT)); fac.appendChild(eq);
    const ban = add(stage, h('div', 'pm-ban', K(`${rad(n, xT)}=${bT}\\quad\\text{because}\\quad ${fT}^{${n}}=${xT}`)), xm, 374); ban.style.opacity = 0;
    const bH = K(bT), xH = K(xT), prod = K(Array(n).fill(fT).join('\\times'));
    return [
      {
        cap: `Put <b>${bH}</b> into the <b>power machine</b>. It’s set to the power <b>${n}</b>.`,
        run: (c) => { inT.innerHTML = K(bT); inT.classList.add('full'); return c.pop(inT, 400); }
      },
      {
        cap: `The machine uses ${bH} as a <b>factor ${n} times</b>: ${prod} = <b>${xH}</b>. So ${K(`${fT}^{${n}}=${xT}`)}.` + (neg ? ' An <b>odd</b> number of negative factors makes a negative.' : ''),
        run: async (c) => {
          await c.anim(inT, [{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${xm - xl - 40}px) scale(.5)`, opacity: 0 }], 500);
          const sp = spin(c, gT, 300 + n * 220);
          for (let k = 0; k < n; k++) { if (k) await c.fadeIn(xs[k - 1], 90); await c.pop(fs[k], 220); }
          await c.fadeIn(eq, 250); await sp;
          outT.innerHTML = K(xT); outT.classList.add('full'); await c.pop(outT, 420);
        }
      },
      {
        cap: `Now <b>undo</b> it. The undo button for “to the power ${n}” is the <b>${ord(n)} root</b>: ${K(rad(n, xT))} asks “what number, used as a factor <b>${n} times</b>, makes ${xH}?”`,
        run: async (c) => {
          mB.classList.remove('off'); inB.innerHTML = K(xT); inB.classList.add('full');
          await c.anim(inB, [{ opacity: 0, transform: `translateY(${y1 - y2}px)` }, { opacity: 1, transform: 'none' }], 650);
        }
      },
      {
        cap: `Out comes <b>${bH}</b>: ${K(`${rad(n, xT)}=${bT}`)}. The little <b>${n}</b> is the <b>index</b>: it counts the factors.` + (n % 2 === 0 && !neg ? ` (${K(`(-${bT})^{${n}}`)} is ${xH} too, but the radical sign means the <b>positive</b> root.)` : ''),
        run: async (c) => {
          await c.anim(inB, [{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${xm - xr + 40}px) scale(.5)`, opacity: 0 }], 600);
          await spin(c, gB, 800);
          outB.innerHTML = K(bT); outB.classList.add('full');
          await Promise.all([c.pop(outB, 420), c.fadeIn(ban, 450, { delay: 250 })]);
        }
      }
    ];
  }
};

/* ============ 2. Roots from prime factors: groups the size of the index ============ */
const gLabel = (n, x) => K(rad(n, tn(x)));
const groups = {
  title: 'Find a root with prime factors: groups the size of the index',
  height: 380,
  choices: [[4, 1296], [3, 1728], [2, 324], [4, 2000], { sep: 'Example 1 check:' }, [2, 121], [3, -125], [4, 6561], { sep: 'Example 2 check:' }, [5, 243], [7, -128], [4, 10000]]
    .map((c) => (Array.isArray(c) ? { v: c.join(','), label: gLabel(c[0], c[1]) } : c)),
  intro: (v) => { const [n, x] = String(v).split(',').map(Number); return `What is ${K(rad(n, tn(x)))}? The index is <b>${n}</b>, so we need a number that, used as a factor <b>${n} times</b>, makes <b>${mn(x)}</b>.`; },
  make(stage, v, ex) {
    const W = ex.W, [n, x] = String(v).split(',').map(Number), neg = x < 0, m = Math.abs(x), P = primeFactors(m);
    const counts = new Map(); P.forEach((p) => counts.set(p, (counts.get(p) || 0) + 1));
    const grp = [], left = [];
    counts.forEach((k, p) => { for (let i = 0; i + n <= k; i += n) grp.push(Array(n).fill(p)); for (let i = 0; i < k % n; i++) left.push(p); });
    const perfect = !left.length, root = grp.map((g) => g[0]).reduce((a, q) => a * q, 1), ans = neg ? -root : root;
    // chip slots: flat row first, then grouped
    const segs = grp.map((g) => g.slice()); if (left.length) segs.push(left.slice());
    let s = 54, gap = 8, gg = 36;
    const wOf = () => segs.reduce((a, g) => a + g.length * s + (g.length - 1) * gap, 0) + (segs.length - 1) * gg;
    while (wOf() > W - 60 && s > 36) { s -= 2; gg = Math.max(18, gg - 2); }
    const yC = 178, flatW = P.length * s + (P.length - 1) * gap, fx0 = (W - flatW) / 2 + s / 2;
    const chips = P.map((p, i) => { const e = add(stage, h('div', 'gp-chip', p), fx0 + i * (s + gap), yC); e.style.width = e.style.height = s + 'px'; e.style.opacity = 0; return { p, e, used: false }; });
    let x0 = (W - wOf()) / 2; const boxes = [];
    segs.forEach((g, gi) => {
      const lo = gi === grp.length, xs = x0;
      g.forEach((p, k) => { const ch = chips.find((q) => q.p === p && !q.used); ch.used = true; ch.tx = x0 + s / 2 + k * (s + gap); ch.left = lo; });
      x0 += g.length * s + (g.length - 1) * gap;
      const bx = add(stage, h('div', 'gp-box ' + (lo ? 'lo' : 'g' + (gi % 4)), `<span class="gp-blab">${lo ? 'left over' : 'group ' + (gi + 1)}</span>`), xs - 11, yC - s / 2 - 13);
      bx.style.width = (x0 - xs + 22) + 'px'; bx.style.height = (s + 26) + 'px'; bx.style.opacity = 0; boxes.push(bx);
      x0 += gg;
    });
    const head = add(stage, h('div', 'st-q', K(rad(n, tn(x)) + '=\\ ?')), 24, 16);
    const note = add(stage, h('div', 'gp-note', K(`${rad(n, tn(x))}=-${rad(n, tn(m))}`) + ' <span class="muted">odd index: the − comes out</span>'), 24, 84); note.style.opacity = 0;
    const out = add(stage, h('div', 'gp-out'), W / 2, 312);
    const steps = [];
    if (neg) steps.push({
      cap: `The index ${n} is <b>odd</b>, so a negative radicand is fine: the root will be <b>negative</b>. Find ${K(rad(n, tn(m)))}, then put the <b>−</b> back at the end.`,
      run: (c) => c.fadeIn(note, 400)
    });
    steps.push({
      cap: `Break <b>${mn(m)}</b> into primes: ${mn(m)} = ${P.join(' × ')}.`,
      run: (c) => Promise.all(chips.map((ch, i) => c.pop(ch.e, 320, { delay: i * 70 })))
    });
    steps.push({
      cap: perfect ? `The index is <b>${n}</b>, so make <b>groups of ${n}</b> matching primes. That makes <b>${plural(grp.length, 'group')}</b>, with nothing left over.`
        : `Make <b>groups of ${n}</b> matching primes. ${grp.length ? `That makes ${plural(grp.length, 'group')}, but ` : ''}<b class="red">${left.join(' × ')}</b> can’t fill a group of ${n}: it’s <b class="red">left over</b>.`,
      run: (c) => Promise.all([...chips.map((ch) => { if (ch.left) ch.e.classList.add('left'); return c.anim(ch.e, [{ left: ch.e.style.left }, { left: ch.tx + 'px' }], 600); }), ...boxes.map((bx, i) => c.fadeIn(bx, 350, { delay: 450 + i * 120 }))])
    });
    if (perfect) {
      const picks = grp.map((g) => g[0]);
      steps.push({
        cap: grp.length > 1 ? `Each group gives <b>one</b> prime to the root. Take one from each group: ${picks.join(' × ')} = <b>${root}</b>.` : `There’s one group, so <b>one</b> ${picks[0]} comes out: the root is <b>${root}</b>.`,
        run: async (c) => {
          out.innerHTML = (neg ? '<span class="gp-neg">−</span>' : '') + picks.map((p) => `<span class="gp-chip">${p}</span>`).join('<span>×</span>') + `<span class="pm-eq" style="opacity:1">= ${neg ? '−' : ''}${root}</span>`;
          const oc = [...out.querySelectorAll('.gp-chip')]; oc.forEach((e) => { e.style.width = e.style.height = s + 'px'; });
          await c.fadeIn(out, 200);
          await Promise.all(oc.map((e, i) => c.anim(e, [{ opacity: 0, transform: `translateY(${yC - 312}px)` }, { opacity: 1, transform: 'none' }], 520, { delay: i * 160 })));
        }
      });
      const base = neg ? `(-${root})` : String(root);
      steps.push({
        cap: `${K(`${rad(n, tn(x))}=${ans}`)}. Check by undoing it: ${K(`${base}^{${n}}=${tn(x)}`)} ✓`,
        run: async (c) => { head.innerHTML = K(`${rad(n, tn(x))}=${ans}`) + `<span class="chk">check: ${K(`${base}^{${n}}=${tn(x)}`)} ✓</span>`; await c.pop(head, 420); }
      });
    } else {
      steps.push({
        cap: `${left.join(' × ')} is left over, so ${mn(m)} is <b>not</b> a perfect ${ord(n)} power: ${K(rad(n, tn(x)))} is not a whole number. The calculator gives ${K(rad(n, tn(x)))} ≈ <b>${r2(nthRoot(x, n))}</b>.`,
        run: async (c) => {
          await Promise.all(chips.filter((ch) => ch.left).map((ch) => c.shake(ch.e)));
          head.innerHTML = K(`${rad(n, tn(x))}\\approx ${r2(nthRoot(x, n)).replace('−', '-')}`) + '<span class="chk">not a perfect power</span>'; await c.pop(head, 420);
        }
      });
    }
    return steps;
  }
};

/* ============ 2. Negative radicands: odd or even index ============ */
const signs = {
  title: 'Negative radicands: why the index matters',
  height: 440,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [[4, -16], [3, -8], [5, -32], [2, -9], [6, -64], { sep: 'Example 1 check:' }, [4, -81], [3, -125]]
    .map((c) => (Array.isArray(c) ? { v: c.join(','), label: gLabel(c[0], c[1]) } : c)),
  intro: (v) => { const [n, x] = String(v).split(',').map(Number); return `Can ${K(rad(n, tn(x)))} be worked out? Look for a number that, used as a factor <b>${n} times</b>, makes <b>${mn(x)}</b>.`; },
  make(stage, v, ex) {
    const W = ex.W, [n, x] = String(v).split(',').map(Number), r = Math.round(nthRoot(-x, n)), even = n % 2 === 0, pw = Math.pow(r, n);
    add(stage, h('div', 'st-q', K(rad(n, tn(x)) + '=\\ ?')), 24, 14);
    const row = (y, lab) => { const e = add(stage, h('div', 'sg-row', `<span class="mut-lab">${lab}</span>`), 24, y); e.style.opacity = 0; return e; };
    const fill = (rw, txt, cls, eqHTML) => { const fsx = []; for (let k = 0; k < n; k++) { if (k) rw.appendChild(h('span', 'sg-x', '×')); const f = h('span', 'sg-f ' + cls, txt); rw.appendChild(f); fsx.push(f); } const q = h('span', 'sg-eq', eqHTML); rw.appendChild(q); return [fsx, q]; };
    const r0 = row(98, 'We need'), rP = row(168, 'Try +' + r), rN = row(240, 'Try −' + r);
    fill(r0, '?', 'blank', '= ' + mn(x));
    const [fP, eP] = fill(rP, String(r), 'pos', `= ${mn(pw)} <b class="red">✗</b>`);
    const [fN, eN] = fill(rN, '(−' + r + ')', 'neg', even ? `= ${mn(pw)} <b class="red">✗</b>` : `= ${mn(x)} <b class="ok">✓</b>`);
    [...fP, eP, ...fN, eN].forEach((e) => (e.style.opacity = 0));
    const stamp = add(stage, h('div', 'pd-stamp sg-stamp ' + (even ? 'nope' : 'yes'), even ? `NOT REAL<small>even powers are never negative</small>` : `${K(`${rad(n, tn(x))}=-${r}`)}<small>${K(`(-${r})^{${n}}=${tn(x)}`)}</small>`), W - 26, 14);
    stamp.style.translate = '-100% 0'; stamp.style.opacity = 0;
    const rule = add(stage, h('div', 'sg-rule', `<div class="${even ? 'hit' : 'dim'}"><b>Even index</b>: the negatives all pair up, so the power is never negative → <b>not a real number</b>.</div><div class="${even ? 'dim' : 'hit'}"><b>Odd index</b>: one negative is left over → a <b>negative root</b>.</div>`), 24, 350);
    rule.style.width = (W - 48) + 'px'; rule.style.opacity = 0;
    const pairEls = [];
    const pairs = Math.floor(n / 2);
    return [
      {
        cap: `${K(rad(n, tn(x)))} asks: what number, used as a factor <b>${n} times</b>, makes <b>${mn(x)}</b>?`,
        run: (c) => c.fadeIn(r0, 350)
      },
      {
        cap: `Try a <b>positive</b>: ${K(Array(n).fill(r).join('\\times'))} = ${mn(pw)}. A positive number to any power is <b>positive</b> — not ${mn(x)}.`,
        run: async (c) => { rP.style.opacity = 1; for (const f of fP) await c.pop(f, 220); await c.fadeIn(eP, 300); }
      },
      {
        cap: even ? `Try a <b>negative</b>. Pair the factors up: each pair of negatives makes a <b>positive</b>, ${K(`(-${r})(-${r})=${r * r}`)}. With ${n} factors, <b>every</b> negative has a partner, so the answer is ${mn(pw)} again.`
          : `Try a <b>negative</b>. Pair the factors up: each pair makes a positive, ${K(`(-${r})(-${r})=${r * r}`)}. With ${n} factors, <b>one negative is left over</b>, so the product is negative: ${K(`(-${r})^{${n}}=${tn(x)}`)} ✓`,
        run: async (c) => {
          rN.style.opacity = 1; for (const f of fN) await c.pop(f, 200);
          const rx = rN.offsetLeft, ry = rN.offsetTop + rN.offsetHeight;
          for (let k = 0; k < pairs; k++) {
            c.check(); const a = fN[2 * k], b = fN[2 * k + 1], x1 = rx + a.offsetLeft + 6, x2 = rx + b.offsetLeft + b.offsetWidth - 6;
            const br = add(stage, h('div', 'sg-pair'), x1, ry + 2); br.style.width = (x2 - x1) + 'px';
            const pl = add(stage, h('div', 'sg-pl', '+' + r * r), (x1 + x2) / 2, ry + 22);
            pairEls.push(br, pl);
            await Promise.all([c.fadeIn(br, 260), c.pop(pl, 300, { delay: 120 })]);
          }
          c.check(); if (!even) { const lst = fN[n - 1], lo = add(stage, h('div', 'sg-lone', 'left over'), rx + lst.offsetLeft + lst.offsetWidth / 2, ry + 8); await c.pop(lo, 300); }
          await c.fadeIn(eN, 300);
        }
      },
      {
        cap: even ? `No real number works: an <b>even</b> power is never negative. So ${K(rad(n, tn(x)))} is <b>not a real number</b> — the booklet says “not possible”.`
          : `${K(`${rad(n, tn(x))}=-${r}`)}. An <b>odd</b> index keeps the sign: a negative radicand gives a negative root.`,
        run: (c) => c.anim(stamp, [{ opacity: 0, transform: 'scale(1.8) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-5deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' })
      },
      {
        cap: '<b>The rule.</b> Even index + negative radicand → <b>not a real number</b>. Odd index + negative radicand → a <b>negative</b> root.',
        run: (c) => c.fadeIn(rule, 400)
      }
    ];
  }
};

/* ============ 3. The x-th root key, then rounding ============ */
const CK = {
  demo: { t: '\\sqrt[5]{161\\,051}', n: 5, x: 161051, g: [['index', ['5']], ['root', ['2nd', '^']], ['rad', ['1', '6', '1', '0', '5', '1']], ['enter', ['ENTER']]] },
  a1: { t: '\\sqrt[5]{243}', n: 5, x: 243, g: [['index', ['5']], ['root', ['2nd', '^']], ['rad', ['2', '4', '3']], ['enter', ['ENTER']]] },
  a2: { t: '\\sqrt[7]{-128}', n: 7, x: -128, g: [['index', ['7']], ['root', ['2nd', '^']], ['radneg', ['(−)', '1', '2', '8']], ['enter', ['ENTER']]] },
  a3: { t: '-2\\sqrt[4]{10\\,000}', n: 4, x: 10000, co: -2, g: [['coef', ['(−)', '2', '×']], ['index', ['4']], ['root', ['2nd', '^']], ['rad', ['1', '0', '0', '0', '0']], ['enter', ['ENTER']]] },
  a4: { t: '\\sqrt[3]{\\dfrac{64}{27}}', n: 3, x: 64 / 27, frac: [4, 3], g: [['index', ['3']], ['root', ['2nd', '^']], ['radfrac', ['(', '6', '4', '÷', '2', '7', ')']], ['enter', ['ENTER']], ['fd', ['2nd', 'F◂▸D']]] },
  b1: { t: '\\sqrt[5]{200}', n: 5, x: 200, round: true, g: [['index', ['5']], ['root', ['2nd', '^']], ['rad', ['2', '0', '0']], ['enter', ['ENTER']]] },
  b2: { t: '\\sqrt[6]{0.7}', n: 6, x: 0.7, round: true, g: [['index', ['6']], ['root', ['2nd', '^']], ['rad', ['0', '.', '7']], ['enter', ['ENTER']]] },
  b3: { t: '\\dfrac{3}{4}\\sqrt[4]{500}', n: 4, x: 500, co: 0.75, round: true, g: [['coef', ['3', '÷', '4', '×']], ['index', ['4']], ['root', ['2nd', '^']], ['rad', ['5', '0', '0']], ['enter', ['ENTER']]] }
};
const tiDisp = (x) => { let s = Number(x.toPrecision(10)).toString(); if (Number.isInteger(x)) s += '.'; return s.replace(/^-/, '−'); };
const ENTRY = { '2nd': '', '^': 'ˣ√', '(−)': '⁻', '×': '*', '÷': '/', ENTER: '', 'F◂▸D': '' };
const calckeys = {
  title: 'On the TI-30XIIS: key it in, then round',
  height: 400,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'demo', label: K(CK.demo.t) }, { sep: 'Example 2 check:' }, ...['a1', 'a2', 'a3', 'a4', 'b1', 'b2', 'b3'].map((k) => ({ v: k, label: `(${k[0]})(${['i', 'ii', 'iii', 'iv'][Number(k[1]) - 1]})` }))],
  intro: (v) => `Let’s evaluate ${K(CK[v].t)}${CK[v].round ? ' to the nearest hundredth' : ' exactly'}. Watch the order of the keys.`,
  make(stage, v, ex) {
    const W = ex.W, S = CK[v], root = nthRoot(S.x, S.n), val = (S.co || 1) * root, rv = S.frac ? S.frac[0] / S.frac[1] : val;
    const exact = !S.round, isInt = Math.abs(val - Math.round(val)) < 1e-9, valR = isInt ? Math.round(val) : val;
    const ti = add(stage, h('div', 'ck-ti', '<div class="ck-lcd"><span class="ck-entry"><span class="cur"></span></span><span class="ck-res"></span></div>'), 20, 14);
    const lcd = ti.querySelector('.ck-lcd'); lcd.style.position = 'relative'; const ind = h('span', 'ck-2nd', '2nd'); lcd.appendChild(ind);
    const entryEl = ti.querySelector('.ck-entry'), resEl = ti.querySelector('.ck-res');
    let entry = '';
    const setEntry = (done) => { entryEl.innerHTML = entry + (done ? '' : '<span class="cur"></span>'); };
    const keys = add(stage, h('div', 'ck-keys'), 20, 204); keys.style.width = (W - 40) + 'px';
    const kEls = S.g.map(([, ks], gi) => {
      if (gi) keys.appendChild(h('span', 'ck-gap'));
      return ks.map((k) => { const e = h('span', 'ck-k' + (k === '2nd' ? ' sec' : k === 'ENTER' ? ' ent' : ''), k + (k === '^' ? '<sup class="alt">ˣ√</sup>' : '')); keys.appendChild(e); return e; });
    });
    add(stage, h('div', 'st-q', K(S.t) + (exact ? '' : ' <span class="muted small">nearest hundredth</span>')), 460, 22);
    const rd = add(stage, h('div', 'ck-rd'), 460, 104); rd.style.opacity = 0;
    const out = add(stage, h('div', 'ck-out'), 20, 286); out.style.opacity = 0;
    const chk = add(stage, h('div', 'ck-chk'), 20, 346); chk.style.opacity = 0;
    const kH = (ks) => ks.map((k) => `<kbd>${k}</kbd>`).join('');
    const press = async (c, gi) => {
      for (const [ki, k] of S.g[gi][1].entries()) {
        const e = kEls[gi][ki]; e.classList.add('on');
        if (k === '2nd') ind.classList.add('on'); else ind.classList.remove('on');
        if (k === 'ENTER') { setEntry(true); resEl.textContent = tiDisp(valR); if (!c.fast) resEl.animate([{ opacity: 0 }, { opacity: 1 }], 300); }
        else if (k === 'F◂▸D') { resEl.textContent = S.frac.join('┘'); if (!c.fast) resEl.animate([{ opacity: 0 }, { opacity: 1 }], 300); }
        else { entry += ENTRY[k] != null ? ENTRY[k] : k; setEntry(false); }
        await c.sleep(300); e.classList.remove('on'); e.classList.add('done'); await c.sleep(60);
      }
    };
    const tS = S.t.replace(/dfrac/g, 'tfrac');
    const valT = S.frac ? `\\tfrac{${S.frac[0]}}{${S.frac[1]}}` : String(valR);
    const capOf = (kind, ks) => {
      if (kind === 'index') return `Key the <b>index</b> first: ${kH(ks)}.`;
      if (kind === 'root') return `Then ${kH(ks)} for the ${K('\\sqrt[x]{\\phantom{0}}')} key (the 2nd function of ^).`;
      if (kind === 'rad') return `Then the <b>radicand</b>: ${kH(ks)}.`;
      if (kind === 'radneg') return `Then the radicand. It’s negative, so use the <b>(−)</b> key, not subtract: ${kH(ks)}.`;
      if (kind === 'radfrac') return `The radicand is a fraction, so put it in <b>brackets</b>: ${kH(ks)}.`;
      if (kind === 'coef') return `The <b>coefficient</b> ${K(S.co === -2 ? '-2' : '\\tfrac{3}{4}')} goes first, then ×: ${kH(ks)}.`;
      if (kind === 'fd') return `Press ${kH(ks)} to switch to a fraction: <b>4┘3</b> means ${K('\\tfrac{4}{3}')}. So ${K(tS + '=\\tfrac{4}{3}')} exactly.`;
      // enter
      if (S.frac) return `${kH(ks)}: <b>1.333333333</b>. A repeating decimal, so the exact answer is a fraction.`;
      if (S.co === -2) return `${kH(ks)}: <b>−20.</b> The calculator does the root first (${K('\\sqrt[4]{10\\,000}=10')}), then multiplies: ${K('-2\\times10=-20')}.`;
      if (S.co) return `${kH(ks)}: <b>${tiDisp(val)}</b>. The calculator does the root first (${K('\\sqrt[4]{500}')} = ${tiDisp(root)}…), then multiplies by ${K('\\tfrac34')}.`;
      if (isInt) return `${kH(ks)}: <b>${tiDisp(valR)}</b> A whole number, so ${K(S.t + '=' + valR)} exactly.`;
      return `${kH(ks)}: <b>${tiDisp(val)}</b>. It doesn’t stop, so we round.`;
    };
    const steps = S.g.map(([kind, ks], gi) => ({ cap: capOf(kind, ks), run: (c) => press(c, gi) }));
    if (S.round) {
      const str = tiDisp(val), dot = str.indexOf('.'), hi = dot + 2, ti3 = dot + 3, up = Number(str[ti3]) >= 5, rounded = r2(val);
      rd.innerHTML = str.split('').map((ch, i) => `<span${i === hi ? ' class="h"' : ''}>${ch}</span>`).join('');
      steps.push({
        cap: `Round to the <b>nearest hundredth</b>. The hundredths digit is <b>${str[hi]}</b>; look at the digit after it, <b>${str[ti3]}</b>. ${up ? 'It’s 5 or more, so round <b>up</b>' : 'It’s less than 5, so <b>keep</b> the ' + str[hi]}: ${K(tS)} ≈ <b>${rounded}</b>.`,
        run: async (c) => {
          await c.fadeIn(rd, 300); c.check();
          const sp = [...rd.children]; sp[ti3].classList.add('t');
          const hx = rd.offsetLeft + sp[hi].offsetLeft + sp[hi].offsetWidth / 2, tx = rd.offsetLeft + sp[ti3].offsetLeft + sp[ti3].offsetWidth / 2;
          const th = add(stage, h('div', 'ck-tag h', 'hundredths'), hx, 166), tt = add(stage, h('div', 'ck-tag t', up ? '5 or more → up' : 'less than 5 → keep'), tx, 166);
          th.style.translate = '-100% 0'; tt.style.translate = '0 0'; th.style.marginLeft = '8px'; tt.style.marginLeft = '-8px';
          await Promise.all([c.fadeIn(th, 300), c.fadeIn(tt, 300, { delay: 200 })]);
          sp.forEach((e, i) => { if (i > hi) e.classList.add('gone'); });
          out.innerHTML = K(`${tS}\\approx ${rounded}`); await c.fadeIn(out, 400);
        }
      });
    } else {
      steps.push({
        cap: S.co ? `So ${K(`${tS}=${valT}`)}. A coefficient in front multiplies the root.` : `So ${K(`${tS}=${valT}`)}.`,
        run: async (c) => { out.innerHTML = K(`${tS}=${valT}`); await c.fadeIn(out, 400); }
      });
    }
    if (!S.co) {
      const base = S.frac ? '\\left(\\tfrac{4}{3}\\right)' : S.round ? tiDisp(root) : valR < 0 ? `(${valR})` : String(valR);
      const xT = S.frac ? '\\tfrac{64}{27}' : tn(S.x);
      steps.push({
        cap: S.round ? `Check by undoing the root: ${K(`${base}^{${S.n}}`)} gives back ${K(xT)} ✓ — check with the <b>unrounded</b> number.` : `Check by undoing the root with a power: ${K(`${base}^{${S.n}}=${xT}`)} ✓`,
        run: async (c) => { chk.innerHTML = '<b>Check:</b> ' + K(`${base}^{${S.n}}${S.round ? '\\to' : '='}${xT}`) + ' ✓'; await c.fadeIn(chk, 400); }
      });
    }
    return steps;
  }
};

/* ============ 4. The parts of a radical ============ */
const AN = { a: '5|17', b: '5|32', c: '2|19', d: '3|54', e: '6|2000000', f: '7|200', g: '2|85', h: '5|-1/9|4' };
const anParse = (v) => {
  const [ns, rs, co] = AN[v].split('|'), n = Number(ns);
  const fr = rs.includes('/'), [pp, qq] = rs.split('/').map(Number), rv = fr ? pp / qq : pp;
  const rT = fr ? `${pp < 0 ? '-' : ''}\\dfrac{${Math.abs(pp)}}{${qq}}` : tn(pp);
  return { n, rv, rT, co: co || '', rH: fr ? K(`${pp < 0 ? '-' : ''}\\tfrac{${Math.abs(pp)}}{${qq}}`) : mn(pp) };
};
const anTex = (p, cls, small) => { const rT = small ? p.rT.replace('dfrac', 'tfrac') : p.rT; return (p.co ? (cls ? `\\htmlClass{an-co}{${p.co}}` : p.co) : '') + (cls ? `\\sqrt[\\htmlClass{${p.n === 2 ? 'an-ixg' : 'an-ix'}}{${p.n}}]{\\htmlClass{an-rd}{${rT}}}` : rad(p.n, rT)); };
const anatomy = {
  title: 'The parts of a radical',
  height: 440,
  choices: [...'abcde'].map((k) => ({ v: k, label: K(anTex(anParse(k), false, true)) })).concat([{ sep: 'Example 3 check:' }], [...'fgh'].map((k) => ({ v: k, label: K(anTex(anParse(k), false, true)) }))),
  intro: (v) => `Every radical has the same parts. Let’s label ${K(anTex(anParse(v), false, true))}.`,
  make(stage, v, ex) {
    const W = ex.W, p = anParse(v), fs = p.rT.length > 6 ? 84 : 112;
    const ex0 = add(stage, h('div', 'an-expr', K(anTex(p, true))), W * 0.5, 160); ex0.style.fontSize = fs + 'px';
    const svg = svgLayer(stage, 'an-svg');
    const lab = (cls, t, sub) => { const e = add(stage, h('div', 'an-lab ' + cls, t + (sub ? `<small>${sub}</small>` : '')), 0, 0); e.style.opacity = 0; return e; };
    const L = { ix: lab('ix', 'Index', p.n === 2 ? 'not written: it’s 2' : 'how many factors'), sg: lab('sg', 'Radical sign'), rd: lab('rd', 'Radicand', 'the number under the sign'), co: p.co ? lab('co', 'Coefficient', 'multiplies — not the index') : null };
    const root = nthRoot(p.rv, p.n), rr = Math.round(root), perfect = Math.abs(Math.pow(rr, p.n) - p.rv) < 1e-9;
    const mean = add(stage, h('div', 'an-mean'), W / 2, 344); mean.style.opacity = 0;
    const R = (sel) => rectIn(ex0.querySelector(sel), stage);
    const show = async (c, key, cls, place, target) => {
      ex0.classList.add(cls);
      const e = L[key], [lx, ly] = place(); at(e, lx, ly);
      await c.fadeIn(e, 300); c.check();
      const lr = { x: e.offsetLeft, y: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight }, [tx, ty, sx, sy] = target(lr);
      const a = arrow(svg, sx, sy, tx, ty, getComputedStyle(e).color);
      await c.anim(a, [{ opacity: 0 }, { opacity: 1 }], 300);
    };
    const rTc = p.rT.replace('dfrac', 'tfrac'), rT = rad(p.n, p.rT), rTs = rad(p.n, rTc);
    const steps = [{
      cap: p.n === 2 ? 'No index is written, so the <b>index is 2</b>: it’s a <b>square</b> root. (You could write the 2, but nobody does.)' : `The <b>index</b> is <b>${p.n}</b>, tucked into the notch. It tells how many times the root is used as a <b>factor</b>.`,
      run: (c) => show(c, 'ix', 'ix-on', () => [24, 18], (lr) => { const r = R(p.n === 2 ? '.an-ixg' : '.an-ix'); return [r.x - 4, r.y + r.h / 2, lr.x + lr.w, lr.y + lr.h * 0.6]; })
    }, {
      cap: `The ${K('\\sqrt{\\phantom{x}}')} symbol is the <b>radical sign</b>. The bar on top stretches over the whole radicand.`,
      run: (c) => show(c, 'sg', 'sg-on', () => [24, 236], (lr) => { const sv = rectIn(ex0.querySelector('.sqrt svg'), stage); return [sv.x + fs * 0.24, sv.y + sv.h - fs * 0.12, lr.x + lr.w, lr.y + lr.h * 0.4]; })
    }, {
      cap: `The <b>radicand</b> is the number under the radical sign: <b>${p.rH}</b>.` + (p.rv < 0 ? ' The negative sign is part of the radicand.' : ''),
      run: (c) => show(c, 'rd', 'rd-on', () => { const r = R('.an-rd'); return [W - 290, Math.max(236, r.y + r.h + 22)]; }, (lr) => { const r = R('.an-rd'); return [r.x + r.w * 0.55, r.y + r.h + 4, lr.x + 30, lr.y + 2]; })
    }];
    if (p.co) steps.push({
      cap: `The <b>${p.co}</b> in front is a <b>coefficient</b>: it multiplies, ${K(`${p.co}\\times${rTs}`)}. It is <b>not</b> the index and <b>not</b> part of the radicand.`,
      run: (c) => show(c, 'co', 'co-on', () => [24, 126], (lr) => { const r = R('.an-co'); return [r.x - 4, r.y + r.h / 2, lr.x + lr.w, lr.y + lr.h / 2]; })
    });
    const sum = `\\text{Index}=${p.n},\\quad\\text{Radicand}=${rTc}`;
    steps.push({
      cap: perfect ? `${K(`${rT}=${rr}`)} because ${K(Array(p.n).fill(rr).join('\\times') + '=' + tn(p.rv))}: <b>${plural(p.n, 'factor')}</b> of ${rr}. That’s what the index ${p.n} means.`
        : `${K(rTs)} isn’t a whole number, but the index means the same thing: used as a factor <b>${p.n} times</b>, it makes ${p.rH}. On a calculator, ${K(rTs)} ≈ ${r2(root)}.`,
      run: async (c) => {
        mean.innerHTML = K(sum) + '<br>' + (perfect ? K(`${rT}=${rr}\\ \\text{ because }\\ ${Array(p.n).fill(rr).join('\\times')}=${tn(p.rv)}`) : K(`\\left(${rTs}\\right)^{${p.n}}=${rTc},\\qquad ${rTs}\\approx ${r2(root).replace('−', '-')}`));
        await c.fadeIn(mean, 400);
      }
    });
    return steps;
  }
};

/* ============ 5. Why √a × √b = √(ab): an area picture ============ */
const area = {
  title: 'Why the product rule works: blocks of tiles',
  height: 440,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [[4, 9], [9, 4], [16, 9], [4, 25]].map(([a, b]) => ({ v: a + ',' + b, label: K(`\\sqrt{${a}}\\times\\sqrt{${b}}`) })),
  intro: (v) => { const [a, b] = String(v).split(',').map(Number); return `Is ${K(`\\sqrt{${a}}\\times\\sqrt{${b}}`)} the same as ${K(`\\sqrt{${a}\\times${b}}`)}? Build it out of square tiles and measure the side.`; },
  make(stage, v, ex) {
    const W = ex.W, [a, b] = String(v).split(',').map(Number), p = Math.round(Math.sqrt(a)), q = Math.round(Math.sqrt(b)), ab = a * b, pq = p * q, G = 9;
    const t = Math.min(40, (330 - (p - 1) * G) / pq), L = pq * t + (p - 1) * G, x0 = 40, y0 = 24;
    const blocks = [];
    for (let bi = 0; bi < p; bi++) for (let bj = 0; bj < p; bj++) {
      const tl = [];
      for (let ti = 0; ti < q; ti++) for (let tj = 0; tj < q; tj++) {
        const e = add(stage, h('div', 'ar-t' + (bi + bj ? '' : ' b0')), x0 + bj * (q * t + G) + tj * t, y0 + bi * (q * t + G) + ti * t);
        e.style.width = e.style.height = (t - 2) + 'px'; e.style.opacity = 0.13; tl.push(e);
      }
      blocks.push(tl);
    }
    const brace = (cls, x, y, w, hh) => { const e = add(stage, h('div', 'ar-br ' + cls), x, y); if (w) e.style.width = w + 'px'; if (hh) e.style.height = hh + 'px'; e.style.opacity = 0; return e; };
    const blab = (html, x, y, cls) => { const e = add(stage, h('div', 'ar-bl ' + (cls || ''), html), x, y); e.style.opacity = 0; return e; };
    const bot = [], botL = [];
    for (let j = 0; j < p; j++) { const bx = x0 + j * (q * t + G); bot.push(brace('hz amber', bx, y0 + L + 6, q * t - 2)); const l = blab(String(q), bx + q * t / 2, y0 + L + 26, 'amber'); l.style.translate = '-50% 0'; botL.push(l); }
    const vb = brace('v', x0 + L + 6, y0, null, L - 2), vl = blab(K(`\\sqrt{${ab}}=${pq}`), x0 + L + 30, y0 + L / 2); vl.style.translate = '0 -50%';
    const px = Math.min(x0 + L + 150, W - 420), panel = add(stage, h('div', 'ar-panel'), px, 30); panel.style.width = (W - px - 12) + 'px';
    const line = (tx, note, cls) => { const e = h('div', 'ar-line ' + (cls || ''), K(tx) + (note ? `<small>${note}</small>` : '')); panel.appendChild(e); return e; };
    const l1 = line(`\\sqrt{${b}}=${q}`, 'one block'), l2 = line(`\\sqrt{${a}}=${p}`, 'blocks per side'), l3 = line(`\\sqrt{${a}\\times${b}}=\\sqrt{${ab}}=${pq}`, 'big side');
    const l4 = line(`\\sqrt{${a}}\\times\\sqrt{${b}}=${p}\\times${q}=${pq}`, `${p} blocks of ${q}`), l5 = line(`\\sqrt{${a}}\\times\\sqrt{${b}}=\\sqrt{${a}\\times${b}}`, '', 'boxed');
    const l6 = line(`\\dfrac{\\sqrt{${ab}}}{\\sqrt{${b}}}=\\dfrac{${pq}}{${q}}=${p}=\\sqrt{\\dfrac{${ab}}{${b}}}`, '');
    const popTiles = async (c, tl, ms) => { for (const e of tl) { c.pop(e, 260); await c.sleep(ms); } await c.sleep(200); };
    return [
      {
        cap: `One <b>block</b> is ${b} tiles, arranged in a ${q} × ${q} square. Its side is <b>${K(`\\sqrt{${b}}=${q}`)}</b>.`,
        run: async (c) => { await popTiles(c, blocks[0], 40); await Promise.all([c.fadeIn(bot[0], 300), c.fadeIn(botL[0], 300), c.fadeIn(l1, 350)]); }
      },
      {
        cap: `Make <b>${a} blocks</b> and arrange them in a square: ${p} blocks along each side, because ${K(`\\sqrt{${a}}=${p}`)}.`,
        run: async (c) => { await Promise.all(blocks.slice(1).map((tl, i) => c.sleep(i * 120).then(() => Promise.all(tl.map((e) => c.pop(e, 320)))))); await c.fadeIn(l2, 350); }
      },
      {
        cap: `Altogether there are ${a} × ${b} = <b>${ab} tiles</b> in one big square. Its side is ${K(`\\sqrt{${a}\\times${b}}=\\sqrt{${ab}}=${pq}`)}.`,
        run: (c) => Promise.all([c.fadeIn(vb, 350), c.fadeIn(vl, 350, { delay: 150 }), c.fadeIn(l3, 350, { delay: 250 })])
      },
      {
        cap: `Now measure the same side by blocks: <b>${p} blocks of ${q}</b>, so the side is ${K(`\\sqrt{${a}}\\times\\sqrt{${b}}=${p}\\times${q}=${pq}`)}. <b>Same side!</b>`,
        run: (c) => Promise.all([...bot.slice(1).map((e, i) => c.fadeIn(e, 300, { delay: i * 120 })), ...botL.slice(1).map((e, i) => c.fadeIn(e, 300, { delay: i * 120 })), ...bot.map((e) => c.anim(e, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.4)' }, { transform: 'scaleY(1)' }], 400, { delay: 400 })), c.fadeIn(l4, 350, { delay: 300 })])
      },
      {
        cap: `So ${K(`\\sqrt{${a}}\\times\\sqrt{${b}}=\\sqrt{${a}\\times${b}}`)} — the <b>product rule</b>. Division undoes multiplication, so the <b>quotient rule</b> works too: ${K(`\\sqrt{${ab}}\\div\\sqrt{${b}}=\\sqrt{${ab}\\div${b}}=${p}`)}.`,
        run: (c) => Promise.all([c.pop(l5, 420), c.fadeIn(l6, 400, { delay: 300 })])
      }
    ];
  }
};

/* ============ 5. The trap: √(a + b) is not √a + √b ============ */
const trap = {
  title: 'The trap: the root of a sum is not the sum of the roots',
  height: 440,
  choices: [{ v: '16,9', label: K('\\sqrt{16+9}') }, { v: '36,64', label: K('\\sqrt{36+64}') }, { sep: 'Example 4 check:' }, { v: '25,16', label: '(c) ' + K('\\sqrt{25+16}') }],
  intro: (v) => { const [a, b] = String(v).split(',').map(Number); return `Is ${K(`\\sqrt{${a}}+\\sqrt{${b}}`)} the same as ${K(`\\sqrt{${a}+${b}}`)}? Use tiles again: ${a} blue tiles and ${b} orange tiles.`; },
  make(stage, v, ex) {
    const W = ex.W, H = 440, [a, b] = String(v).split(',').map(Number), p = Math.round(Math.sqrt(a)), q = Math.round(Math.sqrt(b)), s = a + b, m = Math.floor(Math.sqrt(s)), extra = s - m * m;
    const xR = Math.round(W * 0.58), base = H - 92;
    const t = Math.min(44, (xR - 110) / (p + q), (H - 170) / Math.max(p, q, m + (extra ? 0 : 0)), (W - xR - 30) / (m + (extra ? 1 : 0)));
    const xA = 34, xB = xA + p * t + 2;
    const tiles = [];
    const sq = (x0, k, cls) => { for (let i = 0; i < k * k; i++) { const e = add(stage, h('div', 'tr-t ' + cls), x0 + (i % k) * t, base - (Math.floor(i / k) + 1) * t); e.style.width = e.style.height = (t - 2) + 'px'; e.style.opacity = 0.15; tiles.push(e); } };
    sq(xA, p, 'a'); sq(xB, q, 'b');
    const la = add(stage, h('div', 'tr-lab a', K(`\\sqrt{${a}}=${p}`)), xA + p * t / 2, base - p * t - 36), lb = add(stage, h('div', 'tr-lab b', K(`\\sqrt{${b}}=${q}`)), xB + q * t / 2, base - q * t - 36);
    [la, lb].forEach((e) => (e.style.opacity = 0));
    const bL = add(stage, h('div', 'ar-br hz'), xA, base + 8); bL.style.width = (xB + q * t - xA - 2) + 'px'; bL.style.opacity = 0;
    const bLl = add(stage, h('div', 'tr-lab', K(`${p}+${q}=${p + q}`)), (xA + xB + q * t) / 2, base + 30); bLl.style.opacity = 0;
    const side = Math.sqrt(s), sideT = extra ? `\\sqrt{${s}}\\approx ${side.toFixed(2)}` : `\\sqrt{${s}}=${m}`;
    const bR = add(stage, h('div', 'ar-br hz amber'), xR, base + 8); bR.style.width = (m * t - 2) + 'px'; bR.style.opacity = 0;
    const bRl = add(stage, h('div', 'tr-lab', K(sideT)), xR + m * t / 2, base + 30); bRl.style.opacity = 0;
    const eqL = add(stage, h('div', 'tr-eq', K(`\\sqrt{${a}}+\\sqrt{${b}}=${p}+${q}=${p + q}`)), 24, 14), eqR = add(stage, h('div', 'tr-eq', K(`\\sqrt{${a}+${b}}=${extra ? `\\sqrt{${s}}\\approx ${side.toFixed(2)}` : `\\sqrt{${s}}=${m}`}`)), xR - 10, 14);
    [eqL, eqR].forEach((e) => (e.style.opacity = 0));
    const ne = add(stage, h('div', 'tr-ne', '≠'), 0, 42); ne.style.opacity = 0;
    const clones = [];
    return [
      {
        cap: `${a} tiles make a ${p} × ${p} square: side ${K(`\\sqrt{${a}}=${p}`)}. ${b} tiles make a ${q} × ${q} square: side ${K(`\\sqrt{${b}}=${q}`)}.`,
        run: async (c) => { await Promise.all(tiles.map((e, i) => c.pop(e, 280, { delay: Math.min(i * 12, 500) }))); await Promise.all([c.fadeIn(la, 300), c.fadeIn(lb, 300)]); }
      },
      {
        cap: `${K(`\\sqrt{${a}}+\\sqrt{${b}}`)} adds the <b>sides</b>: put them end to end, ${p} + ${q} = <b>${p + q}</b>.`,
        run: (c) => Promise.all([c.fadeIn(bL, 300), c.fadeIn(bLl, 300, { delay: 150 }), c.fadeIn(eqL, 350, { delay: 250 })])
      },
      {
        cap: extra ? `${K(`\\sqrt{${a}+${b}}`)} adds the <b>tiles</b> first: ${a} + ${b} = <b>${s}</b>. Try to build one square: ${m} × ${m} uses ${m * m}, and <b class="red">${extra} are left over</b> — ${s} isn’t a perfect square.`
          : `${K(`\\sqrt{${a}+${b}}`)} adds the <b>tiles</b> first: ${a} + ${b} = <b>${s}</b> tiles. Rebuild them into <b>one</b> square: ${m} × ${m}.`,
        run: async (c) => {
          tiles.forEach((e) => (e.style.opacity = 0.28));
          tiles.forEach((e, k) => {
            const cl = e.cloneNode(); cl.style.opacity = 1; stage.appendChild(cl); clones.push(cl);
            let tx, ty; if (k < m * m) { tx = xR + (k % m) * t; ty = base - (Math.floor(k / m) + 1) * t; } else { const j = k - m * m; tx = xR + m * t + 6; ty = base - (j + 1) * t; cl.classList.add('extra'); }
            cl._to = [tx, ty];
          });
          await Promise.all(clones.map((cl, k) => c.anim(cl, [{ left: cl.style.left, top: cl.style.top }, { left: cl._to[0] + 'px', top: cl._to[1] + 'px' }], 700, { delay: Math.min(k * 14, 700) })));
          await Promise.all([c.fadeIn(bR, 300), c.fadeIn(bRl, 300, { delay: 150 })]);
        }
      },
      {
        cap: extra ? `Its side is ${K(`\\sqrt{${s}}\\approx${side.toFixed(2)}`)} — <b>not</b> ${p + q}. So ${K(`\\sqrt{${a}+${b}}\\ne\\sqrt{${a}}+\\sqrt{${b}}`)}: that’s why <b>Example 4(c) is false</b>.`
          : `Its side is ${K(`\\sqrt{${s}}=${m}`)} — <b>not</b> ${p + q}. So ${K(`\\sqrt{${a}+${b}}\\ne\\sqrt{${a}}+\\sqrt{${b}}`)}. Subtraction fails too: ${K(`\\sqrt{${Math.max(a, b)}}-\\sqrt{${Math.min(a, b)}}=${Math.abs(p - q)}`)}, but ${K(`\\sqrt{${Math.max(a, b)}-${Math.min(a, b)}}\\approx${Math.sqrt(Math.abs(a - b)).toFixed(2)}`)}.`,
        run: async (c) => {
          await c.fadeIn(eqR, 350);
          const x1 = eqL.offsetLeft + eqL.offsetWidth, x2 = eqR.offsetLeft; at(ne, (x1 + x2) / 2, 42);
          await c.anim(ne, [{ opacity: 0, transform: 'scale(2)' }, { opacity: 1, transform: 'scale(1)' }], 380, { easing: 'cubic-bezier(.2,1.4,.4,1)' });
        }
      }
    ];
  }
};

/* ============ 5. True or false: check both sides ============ */
const TF = {
  x1: { L: '\\sqrt{2}\\times\\sqrt{18}', R: '6', Ls: [['=\\sqrt{2\\times18}', 'product rule'], ['=\\sqrt{36}=6']], Rs: [], l: 6, r: 6, lc: 'the product rule joins them: ' + K('\\sqrt{2\\times18}=\\sqrt{36}=6') + '.', rc: 'it’s just 6.', why: 'Both sides are 6, so the statement is <b>true</b>.' },
  x2: { L: '\\sqrt{100-36}', R: '\\sqrt{100}-\\sqrt{36}', Ls: [['=\\sqrt{64}', 'subtract inside first'], ['=8']], Rs: [['=10-6'], ['=4']], l: 8, r: 4, lc: 'subtract <b>inside first</b>: ' + K('\\sqrt{64}=8') + '.', rc: K('10-6=4') + '.', why: '8 ≠ 4. The root of a difference is <b>not</b> the difference of the roots: <b>false</b>.' },
  x3: { L: '\\sqrt{50}\\div\\sqrt{2}', R: '5', Ls: [['=\\sqrt{50\\div2}', 'quotient rule'], ['=\\sqrt{25}=5']], Rs: [], l: 5, r: 5, lc: 'the quotient rule joins them: ' + K('\\sqrt{50\\div2}=\\sqrt{25}=5') + '.', rc: 'it’s just 5.', why: 'Both sides are 5: <b>true</b>.' },
  a: { L: '\\sqrt{4}\\times\\sqrt{11}', R: '\\sqrt{44}', Ls: [['=\\sqrt{4\\times11}', 'product rule'], ['=\\sqrt{44}']], Rs: [], l: Math.sqrt(44), r: Math.sqrt(44), lc: 'the product rule joins them: ' + K('\\sqrt{4\\times11}=\\sqrt{44}') + '.', rc: K('\\sqrt{44}') + ' as it is.', why: 'Both sides are ' + K('\\sqrt{44}') + ' (≈ 6.63): <b>true</b>.' },
  b: { L: '\\dfrac{\\sqrt{63}}{\\sqrt{7}}', R: '\\sqrt{8}', Ls: [['=\\sqrt{\\dfrac{63}{7}}', 'quotient rule'], ['=\\sqrt{9}=3']], Rs: [], l: 3, r: Math.sqrt(8), lc: 'the quotient rule: ' + K('\\sqrt{\\tfrac{63}{7}}=\\sqrt{9}=3') + '.', rc: K('\\sqrt{8}') + ' isn’t a whole number: ≈ 2.83.', why: '63 ÷ 7 is 9, not 8. ' + K('3\\ne2.83') + ': <b>false</b>.' },
  c: { L: '\\sqrt{25+16}', R: '\\sqrt{25}+\\sqrt{16}', Ls: [['=\\sqrt{41}', 'add inside first']], Rs: [['=5+4'], ['=9']], l: Math.sqrt(41), r: 9, lc: 'add <b>inside first</b>: ' + K('\\sqrt{41}') + ' ≈ 6.40.', rc: K('5+4=9') + '.', why: K('6.40\\ne9') + '. The root of a sum is <b>not</b> the sum of the roots: <b>false</b>.' }
};
const tf = {
  title: 'True or false? Work out each side',
  height: 420,
  choices: [{ v: 'x1', label: K('\\sqrt{2}\\times\\sqrt{18}=6') }, { v: 'x2', label: K('\\sqrt{100-36}=\\sqrt{100}-\\sqrt{36}') }, { v: 'x3', label: K('\\sqrt{50}\\div\\sqrt{2}=5') }, { sep: 'Example 4 check:' }, { v: 'a', label: '(a)' }, { v: 'b', label: '(b)' }, { v: 'c', label: '(c)' }],
  intro: (v) => `True or false: ${K(TF[v].L + '=' + TF[v].R)}? Don’t guess — work out the <b>left side</b> and the <b>right side</b> separately.`,
  make(stage, v, ex) {
    const W = ex.W, S = TF[v], ok = Math.abs(S.l - S.r) < 1e-9;
    const st = add(stage, h('div', 'tf-s', K(`\\htmlClass{tf-l}{${S.L}}=\\htmlClass{tf-r}{${S.R}}`)), 24, 18); st.style.translate = '0 0';
    const panel = (cls, x, title, first, lines, val) => {
      const p = add(stage, h('div', 'tf-p ' + cls, `<div class="tf-ph">${title}</div>`), x, 128); p.style.width = (W / 2 - 34) + 'px';
      const els = [h('div', 'tf-ln', K(first))].concat(lines.map(([t, n]) => h('div', 'tf-ln', K(t) + (n ? `<small>${n}</small>` : ''))));
      const vv = h('div', 'tf-v', Number.isInteger(Math.round(val * 1e9) / 1e9) ? '= ' + mn(Math.round(val)) : '≈ ' + r2(val));
      els.concat(vv).forEach((e) => { p.appendChild(e); e.style.opacity = 0; }); p.style.opacity = 0; return [p, els.concat(vv)];
    };
    const [pL, eL] = panel('l', 24, 'Left side', S.L, S.Ls, S.l), [pR, eR] = panel('r', W / 2 + 10, 'Right side', S.R, S.Rs, S.r);
    const stamp = add(stage, h('div', 'pd-stamp ' + (ok ? 'yes' : 'nope'), ok ? 'TRUE' : 'FALSE'), W - 30, 12); stamp.style.translate = '-100% 0'; stamp.style.opacity = 0;
    const reveal = async (c, p, els) => { p.style.opacity = 1; for (const e of els) await c.fadeIn(e, 300, { from: 'translateX(-10px)' }); };
    return [
      { cap: '<b>Left side:</b> ' + S.lc, run: async (c) => { st.classList.add('l-on'); await reveal(c, pL, eL); } },
      { cap: '<b>Right side:</b> ' + S.rc, run: async (c) => { st.classList.remove('l-on'); st.classList.add('r-on'); await reveal(c, pR, eR); } },
      { cap: S.why, run: (c) => { st.classList.remove('r-on'); return c.anim(stamp, [{ opacity: 0, transform: 'scale(1.8) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-5deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); } }
    ];
  }
};

/* ============ 5. Join into one radical, or split into two ============ */
const JS = {
  p: { s: '\\sqrt{2}\\times\\sqrt{8}', L: [['=\\sqrt{2\\times8}', 'product rule: one radical sign', 'The <b>product rule</b> puts both radicands under <b>one</b> radical sign. The × moves inside.'], ['=\\sqrt{16}', 'multiply inside', 'Multiply inside: 2 × 8 = 16. That’s the single radical: ' + K('\\sqrt{16}') + '.', 1], ['=4', 'bonus: 16 is a perfect square', 'Bonus: 16 is a perfect square, so ' + K('\\sqrt{16}=4') + '.', 2]] },
  q: { s: '\\dfrac{\\sqrt{20}}{\\sqrt{5}}', L: [['=\\sqrt{\\dfrac{20}{5}}', 'quotient rule: one radical sign', 'The <b>quotient rule</b> puts the whole fraction under <b>one</b> radical sign.'], ['=\\sqrt{4}', 'divide inside', 'Divide inside: 20 ÷ 5 = 4, so the single radical is ' + K('\\sqrt{4}') + '.', 1], ['=2', 'bonus: 4 is a perfect square', 'Bonus: ' + K('\\sqrt{4}=2') + '.', 2]] },
  e5a: { s: '\\sqrt{12}\\times\\sqrt{3}', L: [['=\\sqrt{12\\times3}', 'product rule', 'The <b>product rule</b>: one radical sign, with the × inside.'], ['=\\sqrt{36}', 'multiply inside', 'Multiply inside: 12 × 3 = 36. In the form ' + K('\\sqrt{x}') + ': <b>' + K('\\sqrt{36}') + '</b>.', 1], ['=6', 'which equals 6', 'And since 36 is a perfect square, ' + K('\\sqrt{36}=6') + '.', 2]] },
  e5b: { s: '\\sqrt{11}\\times\\sqrt{5}', L: [['=\\sqrt{11\\times5}', 'product rule', 'The <b>product rule</b>: one radical sign, with the × inside.'], ['=\\sqrt{55}', 'multiply inside', 'Multiply inside: 11 × 5 = 55, so the answer is <b>' + K('\\sqrt{55}') + '</b>. 55 isn’t a perfect square, so that’s as far as it goes.', 1]] },
  e5c: { s: '\\dfrac{\\sqrt{72}}{\\sqrt{8}}', L: [['=\\sqrt{\\dfrac{72}{8}}', 'quotient rule', 'The <b>quotient rule</b>: one radical sign over the whole fraction.'], ['=\\sqrt{9}', 'divide inside', 'Divide inside: 72 ÷ 8 = 9. In the form ' + K('\\sqrt{x}') + ': <b>' + K('\\sqrt{9}') + '</b>.', 1], ['=3', 'which equals 3', 'And ' + K('\\sqrt{9}=3') + '.', 2]] },
  e5d: { s: '\\dfrac{\\sqrt{\\sqrt{256}}}{\\sqrt{2}}', L: [['=\\dfrac{\\sqrt{16}}{\\sqrt{2}}', 'inside first: √256 = 16', 'Work from the <b>inside</b> out: ' + K('\\sqrt{256}=16') + ', so the top is ' + K('\\sqrt{16}') + '.'], ['=\\sqrt{\\dfrac{16}{2}}', 'quotient rule', 'Now the <b>quotient rule</b>: one radical sign over the fraction.'], ['=\\sqrt{8}', 'divide inside', 'Divide inside: 16 ÷ 2 = 8. The single radical is <b>' + K('\\sqrt{8}') + '</b>.', 1], ['=2\\sqrt{2}', 'Lesson 7 preview', 'Lesson 7 preview: ' + K('\\sqrt{8}') + ' can also be written ' + K('2\\sqrt{2}') + '.', 2]] },
  s50: { n: 50 }, e6a: { n: 85 }, e6b: { n: 98 }, e6c: { n: 32 }
};
const isSq = (k) => k > 1 && Number.isInteger(Math.sqrt(k));
const joinsplit = {
  title: 'Join into one radical, or split into two',
  height: 390,
  choices: [{ v: 'p', label: K(JS.p.s) }, { v: 'q', label: K('\\sqrt{20}\\div\\sqrt{5}') }, { v: 's50', label: K('\\sqrt{50}') }, { sep: 'Example 5 check:' }, ...['a', 'b', 'c', 'd'].map((k) => ({ v: 'e5' + k, label: `(${k})` })), { sep: 'Example 6 check:' }, ...['a', 'b', 'c'].map((k) => ({ v: 'e6' + k, label: `(${k})` }))],
  intro: (v) => (JS[v].n ? `Split ${K(`\\sqrt{${JS[v].n}}`)} into a <b>product of two radicals</b>: find a factor pair of ${JS[v].n}.` : `Write ${K(JS[v].s)} as a <b>single radical</b>.`),
  make(stage, v, ex) {
    const W = ex.W, S = JS[v];
    if (!S.n) { // join: a chain of equal expressions, left to right
      const chain = add(stage, h('div', 'js-chain'), 24, 96);
      const cell = (t, note, cls) => { const e = h('div', 'js-cell ' + (cls || ''), `<div class="js-ex">${K(t)}</div>` + (note ? `<div class="js-note">${note}</div>` : '')); chain.appendChild(e); return e; };
      cell(S.s, '');
      const ls = S.L.map(([t, note, , kind]) => { const e = cell(t, note, kind === 1 ? 'js-ans' : kind === 2 ? 'bonus' : ''); e.style.opacity = 0; return e; });
      const fit = () => { chain.style.transform = ''; const w = chain.offsetWidth; if (w > W - 40) { chain.style.transformOrigin = 'left top'; chain.style.transform = `scale(${((W - 40) / w).toFixed(3)})`; } };
      fit();
      return S.L.map(([, , cap, kind], i) => ({ cap, run: async (c) => { if (i === 0) fit(); await (kind === 1 ? c.pop(ls[i], 420) : c.fadeIn(ls[i], 400, { from: 'translateX(-14px)' })); } }));
    }
    // split
    const n = S.n, F = factors(n), pairs = []; for (const d of F) { if (d * d > n) break; pairs.push([d, n / d]); }
    const sqs = pairs.filter(([a, b]) => isSq(a) || isSq(b)), best = sqs.length ? sqs.reduce((m, pr) => (Math.max(...pr.filter(isSq)) > Math.max(...m.filter(isSq)) ? pr : m)) : pairs[pairs.length > 1 ? 1 : 0];
    const sq = best.find(isSq), other = sq ? n / sq : null, ord2 = sq ? [sq, other] : best;
    add(stage, h('div', 'st-q', K(`\\sqrt{${n}}`)), 30, 18);
    const lab = add(stage, h('div', 'mut-lab', `factor pairs of ${n}`), 30, 102); lab.style.opacity = 0;
    const row = add(stage, h('div', 'js-pairs'), 30, 128);
    const pe = pairs.map(([a, b]) => { const e = h('div', 'js-pair' + (a === 1 ? ' one' : ''), [a, b].map((k) => (isSq(k) ? `<span class="sq">${k}</span>` : k)).join(' × ')); row.appendChild(e); e.style.opacity = 0; return e; });
    const l1 = add(stage, h('div', 'js-l', `<span class="box">${K(`\\sqrt{${n}}=\\sqrt{${ord2[0]}}\\times\\sqrt{${ord2[1]}}`)}</span><span class="note">${sq ? 'perfect square first' : 'a product of two radicals'}</span>`), 30, 214); l1.style.opacity = 0;
    const l2 = sq ? add(stage, h('div', 'js-l bonus', `${K(`=${Math.sqrt(sq)}\\sqrt{${other}}`)}<span class="note">Lesson 7 preview</span>`), 30, 300) : null; if (l2) l2.style.opacity = 0;
    const others = pairs.filter((pr) => pr[0] !== 1 && pr !== best);
    const steps = [
      {
        cap: `List the factor pairs of ${n}: ${pairs.map(([a, b]) => `${a} × ${b}`).join(', ')}. ${sqs.length ? `Perfect squares are <u>underlined</u>.` : 'None of them has a perfect square (other than 1).'}`,
        run: async (c) => { await c.fadeIn(lab, 250); for (const e of pe) await c.pop(e, 300); }
      },
      {
        cap: sq ? `Any pair except 1 × ${n} works, but the <b>most useful</b> one has the biggest perfect square: <b>${best[0]} × ${best[1]}</b>.`
          : `Skip 1 × ${n} (that doesn’t split anything). Use <b>${best[0]} × ${best[1]}</b>.`,
        run: async (c) => { pe.forEach((e, i) => e.classList.add(pairs[i] === best ? 'pick' : 'dim')); await c.pop(pe[pairs.indexOf(best)], 380); }
      },
      {
        cap: `One radical for each factor: ${K(`\\sqrt{${n}}=\\sqrt{${ord2[0]}}\\times\\sqrt{${ord2[1]}}`)}.` + (others.length ? ` (${others.map(([a, b]) => K(`\\sqrt{${a}}\\times\\sqrt{${b}}`)).join(' and ')} ${others.length > 1 ? 'are' : 'is'} also correct.)` : ''),
        run: (c) => c.pop(l1, 420)
      }
    ];
    if (sq) steps.push({ cap: `Bonus: ${K(`\\sqrt{${sq}}=${Math.sqrt(sq)}`)}, so ${K(`\\sqrt{${n}}=${Math.sqrt(sq)}\\sqrt{${other}}`)}. Writing radicals like this is <b>Lesson 7</b>.`, run: (c) => c.fadeIn(l2, 400, { from: 'translateX(-14px)' }) });
    return steps;
  }
};

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { machine, groups, signs, calckeys, anatomy, area, trap, tf, joinsplit };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

function mountWarmup() {
  const row = document.getElementById('wc-row'); if (!row) return;
  const calcs = [...row.querySelectorAll('.wcalc')], labs = row.querySelectorAll('.wc-lab'), note = document.getElementById('wc-note');
  let CW = 140, sorted = false;
  const place = () => {
    const W = row.clientWidth; if (!W) return;
    CW = calcs[0].offsetWidth || 140; // the one-screen layout draws smaller calculators
    if (!sorted) { const g = 16, x0 = (W - (6 * CW + 5 * g)) / 2; calcs.forEach((c, i) => (c.style.transform = `translateX(${x0 + i * (CW + g)}px)`)); }
    const g = 12, mid = 64, gw = 3 * CW + 2 * g, x0 = (W - (2 * gw + mid)) / 2;
    labs[0].style.left = (x0 + gw / 2) + 'px'; labs[1].style.left = (x0 + gw + mid + gw / 2) + 'px';
    if (sorted) {
      calcs.filter((c) => c.dataset.even).forEach((c, i) => (c.style.transform = `translateX(${x0 + i * (CW + g)}px)`));
      calcs.filter((c) => !c.dataset.even).forEach((c, i) => (c.style.transform = `translateX(${x0 + gw + mid + i * (CW + g)}px)`));
    }
  };
  place(); new ResizeObserver(place).observe(row);
  const show = (c, on) => {
    c.classList.toggle('shown', on); const res = c.querySelector('.wc-res'), r = c.dataset.res;
    c.classList.toggle('err', on && r === 'ERROR');
    res.innerHTML = !on ? '= ?' : r === 'ERROR' ? 'ERROR' : c.dataset.texres ? tex(r) : r;
    if (on && r === 'ERROR') c.querySelector('.wc-lcd').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], 360);
  };
  calcs.forEach((c) => c.addEventListener('click', () => show(c, !c.classList.contains('shown'))));
  const ctl = document.querySelector('.wc-ctl');
  ctl.querySelector('[data-wc=all]').addEventListener('click', () => calcs.forEach((c, i) => setTimeout(() => show(c, true), i * 220)));
  ctl.querySelector('[data-wc=sort]').addEventListener('click', (e) => { sorted = !sorted; row.classList.toggle('sorted', sorted); note.classList.toggle('on', sorted); e.target.textContent = sorted ? 'Unsort' : 'Sort by index'; place(); });
  ctl.querySelector('[data-wc=reset]').addEventListener('click', () => { calcs.forEach((c) => show(c, false)); if (sorted) ctl.querySelector('[data-wc=sort]').click(); });
  requestAnimationFrame(() => requestAnimationFrame(() => row.classList.add('ready')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('on')));
}

function mountBlanks() {
  const blanks = [...document.querySelectorAll('.deg-grid .blank')];
  const set = (b, on) => { b.classList.toggle('filled', on); b.innerHTML = on ? (b.dataset.tex ? tex(b.dataset.tex) : b.dataset.a) : ''; };
  blanks.forEach((b) => b.addEventListener('click', () => set(b, !b.classList.contains('filled'))));
  const all = document.querySelector('.deg-grid [data-fillall]');
  if (all) all.addEventListener('click', () => blanks.forEach((b, i) => setTimeout(() => { set(b, true); b.animate([{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 300); }, i * 160)));
}

function mountPowers() {
  const g = document.getElementById('pw'); if (!g) return;
  const rows = [[2, 15], [3, 10], [4, 6], [5, 4], [6, 3], [7, 2]];
  let html = '<div class="ph">n</div>' + Array.from({ length: 15 }, (_, i) => `<div class="ph">${i + 1}</div>`).join('');
  rows.forEach(([e, k]) => {
    html += `<div class="pr">${tex('n^' + e)}</div>`;
    for (let i = 1; i <= 15; i++) html += i <= k ? `<button class="${i === 1 ? '' : 'hl'}" title="${i} to the power ${e}">${fmt(Math.pow(i, e))}</button>` : '<div></div>';
  });
  g.innerHTML = html;
  g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
  document.querySelectorAll('[data-pw]').forEach((b) => b.addEventListener('click', () => g.querySelectorAll('button').forEach((x, i) => { const on = b.dataset.pw === 'all'; if (on) setTimeout(() => x.classList.add('on'), i * 15); else x.classList.remove('on'); })));
}

function mountChecks() {
  document.querySelectorAll('.pq').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
}

mountExplainers(); mountWarmup(); mountBlanks(); mountPowers(); mountChecks();

/* ---------- Math History (the brown box): YBC 7289, a Babylonian school tablet (c. 1800–1600 BCE) ----------
 * The round tablet is drawn: a square, its diagonals, 30 by a side, and in cuneiform along the diagonal 1; 24, 51, 10
 * (base 60) with 42; 25, 35 under it. Then the base-60 digits are added up, 1 + 24/60 + 51/60² + 10/60³ = 1.41421296…,
 * and compared with √2 = 1.41421356…: the same to 5 decimal places. Plays once when the box is half in view; a tap or
 * Replay plays it again; reduced motion shows the finished picture. */
(function babylonRoot2() {
  const svg = document.getElementById('u1l6-hist'); if (!svg) return;
  const SVGNS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(SVGNS, tag); Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k])); (parent || svg).appendChild(e); return e; };
  const txt = (s, attrs, parent, tag) => { const e = mk(tag || 'text', attrs, parent); e.textContent = s; return e; };
  const tsp = (s, attrs, parent) => txt(s, attrs, parent, 'tspan');
  const steps = [], when = (el, ms) => { steps.push({ el, t: ms }); return el; };
  const GCOL = ['#4a2c14', '#0f8a8a', '#8a58c9', '#d0477a'];
  // ---- the tablet ----
  const defs = mk('defs');
  const rg = mk('radialGradient', { id: 'u1l5h-clayg', cx: '42%', cy: '38%', r: '70%' }, defs);
  mk('stop', { offset: '0%', 'stop-color': '#e6cfa6' }, rg); mk('stop', { offset: '100%', 'stop-color': '#c9a678' }, rg);
  const CX = 150, CY = 152, H = 104; // the square is turned 45°: its diagonals are horizontal and vertical, H = half a diagonal
  mk('ellipse', { cx: CX, cy: CY, rx: 132, ry: 128, fill: 'url(#u1l5h-clayg)', class: 'u1l5h-clay' });
  const P = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  when(mk('path', { d: `M${P(CX - H, CY)} L${P(CX, CY - H)} L${P(CX + H, CY)} L${P(CX, CY + H)} Z`, pathLength: 1, class: 'u1l5h-line' }), 200);
  when(mk('path', { d: `M${P(CX - H, CY)} L${P(CX + H, CY)}`, pathLength: 1, class: 'u1l5h-line' }), 1300);
  when(mk('path', { d: `M${P(CX, CY - H)} L${P(CX, CY + H)}`, pathLength: 1, class: 'u1l5h-line' }), 1300);
  // cuneiform: a vertical wedge is 1, a corner wedge (chevron) is 10
  const one = (g, x, y, s) => { const w = mk('g', { class: 'u1l5h-wedge', transform: `translate(${x} ${y}) scale(${s})` }, g); mk('path', { d: 'M-3.6 -8 L3.6 -8 L0 -3.2 Z' }, w); mk('line', { x1: 0, y1: -4, x2: 0, y2: 8 }, w); };
  const ten = (g, x, y, s) => { const w = mk('g', { class: 'u1l5h-wedge', transform: `translate(${x} ${y}) scale(${s})` }, g); mk('path', { d: 'M5 -7 L-5 0 L5 7 L1.5 0 Z' }, w); };
  // draw the number n (0–59) with its left edge at x, size S; returns its width. Chevrons (tens) first, then the
  // vertical wedges (ones); more than 2 of a kind sit in two rows, like a scribe stacks them.
  function cune(g, n, x, y, S) {
    let cx = x;
    [[Math.floor(n / 10), ten, 10], [n % 10, one, 7.5]].forEach(([k, f, dx]) => {
      if (!k) return;
      const rows = k <= 3 ? [k] : k === 4 ? [2, 2] : [Math.ceil(k / 2), Math.floor(k / 2)];
      const two = rows.length > 1, s = S * (two ? 0.62 : 1), step = dx * s;
      rows.forEach((m, r) => { for (let i = 0; i < m; i++) f(g, cx + step / 2 + i * step, y + (two ? (r ? 5.5 : -5.5) * S : 0), s); });
      cx += Math.max(...rows) * step + 2 * S;
    });
    return cx - x;
  }
  // 30 by the upper-left side (turned to follow the side)
  const side = when(mk('g', { class: 'u1l5h-g', transform: `translate(${CX - H / 2 - 17} ${CY - H / 2 - 17}) rotate(-45)` }), 2200);
  cune(side, 30, -24, 0, 1.5);
  // 1; 24, 51, 10 above the horizontal diagonal, 42; 25, 35 below it
  const groups = [];
  let x = CX - 78;
  [1, 24, 51, 10].forEach((n, i) => {
    const g = when(mk('g', { class: 'u1l5h-g' }), 2600 + i * 450);
    const glow = mk('rect', { x: x - 3, y: CY - 44, width: 10, height: 34, rx: 7, fill: GCOL[i], class: 'u1l5h-glow' }, g);
    const w = cune(g, n, x, CY - 27, 1.35); glow.setAttribute('width', w + 2);
    groups.push(glow); x += w + 8;
    if (i === 1) x = Math.max(x, CX + 7); // keep the vertical diagonal between 24 and 51
  });
  const lower = when(mk('g', { class: 'u1l5h-g u1l5h-faint' }), 4500);
  x = CX - 52; [42, 25, 35].forEach((n, i) => { x += cune(lower, n, x, CY + 26, 1.1) + 7; if (!i) x = CX + 7; });
  txt('YBC 7289', { x: CX, y: 296, 'text-anchor': 'middle', class: 'u1l5h-cap' });
  // ---- the arithmetic ----
  const XR = 318;
  const head = when(mk('g', { class: 'u1l5h-g' }), 4900);
  txt('base 60', { x: XR, y: 22, class: 'u1l5h-cap' }, head);
  const b = txt('', { x: XR, y: 50, class: 'u1l5h-b60' }, head);
  ['1', '; ', '24', ', ', '51', ', ', '10'].forEach((s, i) => tsp(s, i % 2 ? { fill: '#9a7a58' } : { fill: GCOL[i / 2] }, b));
  const TERMS = [['1', '= 1'], ['+ 24 ÷ 60', '= 1.4'], ['+ 51 ÷ 60²', '= 1.414 166…'], ['+ 10 ÷ 60³', '= 1.414 212 96…']];
  TERMS.forEach(([term, sum], i) => {
    const t = 5600 + i * 1150, y = 88 + i * 31;
    const g = when(mk('g', { class: 'u1l5h-g' }), t);
    txt(term, { x: XR, y, class: 'u1l5h-term', fill: GCOL[i] }, g);
    txt(sum.replace(/ (?=\d)/g, ' '), { x: 424, y, class: 'u1l5h-sum' }, g);
    when(groups[i], t);
  });
  when(mk('line', { x1: XR, x2: 586, y1: 204, y2: 204, class: 'u1l5h-rule u1l5h-g' }), 9900);
  const cmp = (label, digits, y, t) => {
    const g = when(mk('g', { class: 'u1l5h-g' }), t);
    txt(label, { x: XR, y, class: 'u1l5h-lab' }, g);
    const e = txt('', { x: 392, y, class: 'u1l5h-cmp' }, g);
    when(tsp('1.414 21', { class: 'u1l5h-hit' }, e), 11000); tsp(digits, {}, e);
  };
  cmp('tablet', '2 96…', 232, 9900);
  cmp('√2', '3 56…', 260, 10400);
  when(txt('the same to 5 decimal places!', { x: XR, y: 288, class: 'u1l5h-final u1l5h-g' }), 11400);
  const END = 12200;
  let t0 = 0, raf = 0;
  const draw = (ms) => steps.forEach((s) => s.el.classList.toggle('on', s.t <= ms));
  function frame(now) { if (!t0) t0 = now; const ms = now - t0; draw(ms); if (ms < END) raf = requestAnimationFrame(frame); }
  function play() {
    cancelAnimationFrame(raf); t0 = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(END); return; }
    draw(-1); raf = requestAnimationFrame(frame);
  }
  draw(-1);
  svg.addEventListener('click', play);
  const btn = svg.closest('.hist-anim') && svg.closest('.hist-anim').querySelector('.hist-play'); if (btn) btn.addEventListener('click', play);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.5 });
    io.observe(svg);
  } else play();
})();

/* ============ Stand Up Break! — evaluate radicals of any index at the whiteboards (lessons/js/standup.js) ============ */
const suN = (n) => { const s = String(Math.abs(n)); return (n < 0 ? '-' : '') + (s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : s); };
const suRt = (n, x) => (n === 2 ? `\\sqrt{${x}}` : `\\sqrt[${n}]{${x}}`);
const suLab = (i) => '\\text{(' + 'abcdef'[i] + ')}\\ ';
const suGrid = (items, cols) => { const rows = []; for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols).map((x, j) => (j ? '\\hspace{2.5em}' : '') + suLab(i + j) + '{' + x + '}').join(' & ')); return '\\def\\arraystretch{1.8}\\begin{array}{' + 'l'.repeat(cols) + '}' + rows.join('\\\\') + '\\end{array}'; };
function suPF(n) { const f = []; for (let p = 2; p * p <= n; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) f.push([p, e]); } if (n > 1) f.push([n, 1]); return f; }
const suPow = (f) => f.map(([p, e]) => (e > 1 ? p + '^{' + e + '}' : String(p))).join('\\times ');
const suP = (b, n) => (b < 0 ? `(${b})` : b) + '^' + n;                                   // (-5)^3
/* one radical { t, w: worked answer } — kinds for the levels below */
function suPerfect(n, k, sgn = 1) { const x = sgn * k ** n, v = sgn * k; return { t: suRt(n, suN(x)), w: `=${v}\\quad(${suP(v, n)}=${suN(x)})`, v }; }
const suK = {
  sq: (r) => suPerfect(2, r.int(6, 15)),
  cb: (r) => suPerfect(3, r.int(2, 6), r.chance(0.5) ? -1 : 1),
  q4: (r) => suPerfect(4, r.int(2, 4)),
  q5: (r) => suPerfect(5, r.int(2, 3), r.chance(0.5) ? -1 : 1),
  nr: (r) => { const n = r.pick([2, 4]), k = n === 2 ? r.int(3, 10) : r.int(2, 3); return { t: suRt(n, '-' + k ** n), w: ':\\ \\text{even index, negative radicand: not a real number}' }; },
  out: (r) => { const n = r.pick([2, 4]), k = n === 2 ? r.int(4, 12) : r.int(2, 3); return { t: '-' + suRt(n, k ** n), w: `=-${k}\\quad(\\text{the } - \\text{ is outside})`, v: -k }; },
  coef: (r) => { const n = r.pick([2, 3, 4]), k = n === 2 ? r.int(3, 12) : n === 3 ? r.int(2, 5) : r.pick([2, 3, 10]), s = n === 3 && r.chance(0.5) ? -1 : 1, c = r.pick([-2, -3, 2, 3, 4, 5]), v = c * s * k;
    return { t: c + suRt(n, suN(s * k ** n)), w: `=${c}\\times${s * k < 0 ? '(' + s * k + ')' : s * k}=${v}`, v }; },
  frac: (r) => { let a, b; const n = r.pick([2, 3, 5]); do { a = r.int(1, n === 5 ? 3 : n === 3 ? 5 : 9); b = r.int(2, n === 5 ? 3 : n === 3 ? 5 : 11); } while (a === b || suG(a, b) !== 1);
    const s = n > 2 && r.chance(0.4) ? '-' : ''; return { t: suRt(n, `${s}\\dfrac{${a ** n}}{${b ** n}}`), w: `=${s}\\dfrac{${a}}{${b}}\\quad(${suP(a, n)}=${a ** n},\\ ${suP(b, n)}=${b ** n})` }; },
  dec: (r) => r.pick([() => { const k = r.int(2, 9); return { t: `\\sqrt{${(k * k / 100).toFixed(2)}}`, w: `=${k / 10}\\quad(${k / 10}\\times${k / 10}=${(k * k / 100).toFixed(2)})` }; },
    () => { const k = r.int(1, 5), s = r.chance(0.5) ? '-' : ''; return { t: `\\sqrt[3]{${s}${(k ** 3 / 1000).toFixed(3)}}`, w: `=${s}${k / 10}\\quad(${s ? '(-' + k / 10 + ')' : k / 10}^3=${s}${(k ** 3 / 1000).toFixed(3)})` }; }])(),
  negodd: (r) => { const n = r.pick([3, 5]), k = n === 3 ? r.int(2, 6) : 2; return { t: '-' + suRt(n, '-' + k ** n), w: `=-(-${k})=${k}`, v: k }; }
};
function suG(a, b) { return b ? suG(b, a % b) : a; }
function suPickK(r, kinds, k, ok = () => true) { for (;;) { const ks = r.shuffle(kinds).slice(0, k), xs = ks.map((q) => suK[q](r)); if (new Set(xs.map((x) => x.t)).size === k && ok(ks)) return xs; } }
const suAsk = (xs, cols) => ({ text: 'Evaluate, where possible, using the real number system.', q: suGrid(xs.map((x) => x.t), cols), a: xs.map((x, i) => suLab(i) + '{' + x.t + '}' + x.w) });
standup('u1l6', {
  intro: 'Ask: what number, used as a factor that many times, makes the radicand? Watch the index and the signs.',
  levels: {
    BEG: (r) => suAsk(suPickK(r, ['sq', 'cb', 'q4', 'q5', 'nr', 'out'], 3), 3),          // Example 1
    PRG: (r) => suAsk(suPickK(r, ['coef', 'frac', 'dec', 'negodd', 'coef', 'cb'], 3, (ks) => ks.filter((q) => q === 'coef').length < 2 || r.chance(0.3)), 3), // Example 2(a)
    MAS: (r) => {
      // (a) a big radicand: find the root from its prime factors
      const n = r.pick([3, 4, 5, 6]), k = n === 3 ? r.pick([12, 14, 15, 18, 21, 24]) : n === 4 ? r.int(5, 9) : n === 5 ? r.int(4, 6) : r.int(2, 4), s = n % 2 && r.chance(0.5) ? -1 : 1, X = k ** n, f = suPF(X), g = f.map(([p, e]) => [p, e / n]);
      const A = { t: suRt(n, suN(s * X)), w: s < 0 ? `:\\ ${suN(X)}=${suPow(f)},\\ \\text{so the root is }-(${suPow(g)})=${-k}` : `:\\ ${suN(X)}=${suPow(f)},\\ \\text{so the root is }${suPow(g)}${g.length > 1 || g[0][1] > 1 ? '=' + k : ''}` };
      // (b) two radicals with different indices, combined
      let B; for (;;) {
        const a = suK[r.pick(['cb', 'q4', 'q5', 'sq'])](r), b = suK[r.pick(['cb', 'q4', 'q5'])](r), c1 = r.pick([2, 3, 4, -2]), c2 = r.pick([1, 2, 3]), minus = r.chance(0.5);
        if (a.t === b.t) continue;
        const v = c1 * a.v + (minus ? -1 : 1) * c2 * b.v, pv = (x) => (x < 0 ? '(' + x + ')' : x);
        B = { t: `${c1}${a.t}${minus ? '-' : '+'}${c2 === 1 ? '' : c2}${b.t}`, w: `:\\ ${a.t}=${a.v},\\ ${b.t}=${b.v};\\ \\ ${c1}(${a.v})${minus ? '-' : '+'}${c2 === 1 ? pv(b.v) : c2 + '(' + b.v + ')'}=${v}` };
        break;
      }
      return { text: 'Evaluate. For (a), use prime factors.', q: suGrid([A.t, B.t], 2), a: [A, B].map((x, i) => suLab(i) + '{' + x.t + '}' + x.w) };
    }
  }
});
