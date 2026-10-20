/* Math 10C · Unit 2 · Lesson 5A — Rational Exponents and Radicals: the explainers and the piano warm-up on this page. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

/* KaTeX, allowing \htmlClass (tokens that fly from one line to the next) */
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};

const AM = '#c27a0e', TL = '#13807a', RD = '#c93a33';
const cA = (s) => `\\textcolor{${AM}}{${s}}`, cT = (s) => `\\textcolor{${TL}}{${s}}`, cR = (s) => `\\textcolor{${RD}}{${s}}`;
const cA0 = cA, cT0 = cT, cR0 = cR;

/* ---------- number helpers ---------- */
const tn = (n) => (n < 0 ? '-' : '') + fmt(Math.abs(n)).replace(/\u202f/g, '\\,'); // 1 000 → 1\,000 in LaTeX
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function Q(p, q = 1) { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return { p: p / g, q: q / g }; }
function parseQ(s) { s = String(s); if (s.includes('/')) { const [a, b] = s.split('/').map(Number); return Q(a, b); } return Q(Number(s), 1); }
function iroot(x, n) { // exact integer n-th root of x (odd roots of negatives too), or null
  if (x < 0) { if (n % 2 === 0) return null; const r = iroot(-x, n); return r == null ? null : -r; }
  const r = Math.round(Math.pow(x, 1 / n)); return r ** n === x ? r : null;
}
const qroot = (r, n) => { const a = iroot(r.p, n), b = iroot(r.q, n); return a == null || b == null ? null : Q(a, b); };
const qpow = (r, m) => Q(r.p ** m, r.q ** m);
const qT = (r, small) => (r.q === 1 ? tn(r.p) : `${r.p < 0 ? '-' : ''}\\${small ? 't' : 'd'}frac{${tn(Math.abs(r.p))}}{${tn(r.q)}}`);
const qP = (r) => (r.q === 1 && r.p >= 0 ? tn(r.p) : `\\left(${qT(r)}\\right)`); // a value used as a base
const rootT = (n, x) => (n === 2 ? `\\sqrt{${x}}` : `\\sqrt[${n}]{${x}}`);
const ord = (n) => (n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th');
const sgnT = (x) => (x < 0 ? `(${tn(x)})` : tn(x));

/* ---------- drawing helpers ---------- */
function stagePos(stage, el) { // element centre and box in stage coordinates (the lesson may be scaled)
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2 - sr.left) / k, y: (r.top + r.height / 2 - sr.top) / k, l: (r.left - sr.left) / k, t: (r.top - sr.top) / k, r: (r.right - sr.left) / k, b: (r.bottom - sr.top) / k };
}
async function fly(c, stage, from, to, src, o = {}) { // a copy of `src` flies from one token to another
  if (!to) return;
  if (c.fast || !from) { to.style.opacity = 1; return; }
  c.check();
  const a = stagePos(stage, from), b = stagePos(stage, to);
  const g = add(stage, h('div', 'r5-fly c', K(src)), a.x, a.y); if (o.fs) g.style.fontSize = o.fs + 'px';
  if (o.color) g.style.color = o.color;
  g.style.opacity = 0;
  try {
    await c.anim(g, [{ opacity: 1, transform: 'translate(0,0) scale(1.1)' }, { opacity: 1, transform: `translate(${(b.x - a.x) / 2}px, ${(b.y - a.y) / 2 - 26}px) scale(1.3)`, offset: 0.5 }, { opacity: 1, transform: `translate(${b.x - a.x}px, ${b.y - a.y}px) scale(1)` }], o.ms || 850, { delay: o.delay || 0 });
  } finally { g.remove(); }
  to.style.opacity = 1;
}
function board(stage, o) { // written work: one LaTeX line per row
  const rows = [];
  return {
    rows,
    line(src, p = {}) {
      const y = p.y != null ? p.y : o.y + rows.length * o.lh;
      const el = add(stage, h('div', 'r5-line' + (p.cls ? ' ' + p.cls : ''), K(src)), p.x != null ? p.x : o.x, y); el.style.fontSize = (p.fs || o.fs) + 'px';
      hide(el); const r = { el, q: (s) => el.querySelector(s), qa: (s) => [...el.querySelectorAll(s)] }; rows.push(r); return r;
    }
  };
}
async function showRow(c, stage, row, flights = [], fs) {
  flights.forEach((f) => { if (f && f[1]) f[1].style.opacity = 0; });
  const jobs = [c.anim(row.el, [{ opacity: 0 }, { opacity: 1 }], 380)];
  flights.forEach((f, i) => { if (f) jobs.push(fly(c, stage, f[0], f[1], f[2], { fs, color: f[3], delay: 150 + i * 160 })); });
  await Promise.all(jobs);
}
function chain(stage, parts, x, y, fs) { // a row of LaTeX pieces revealed one at a time without reflowing
  const row = add(stage, h('div', 'r5-chain'), x, y); row.style.fontSize = fs + 'px';
  const els = parts.map((p) => { const e = h('span', 'r5-piece', K(p)); row.appendChild(e); hide(e); return e; });
  return { row, els };
}
const showPieces = (c, els, ms = 320) => Promise.all(els.map((e, i) => c.fadeIn(e, ms, { delay: i * 160 })));
const stampIn = (c, el) => c.anim(el, [{ opacity: 0, transform: 'scale(1.6) rotate(-10deg)' }, { opacity: 1, transform: 'scale(1) rotate(-4deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' });

/* ============ 1. Why a^(1/n) must be the n-th root ============ */
const whyRoot = {
  title: `Why must ${tex('a^{1/n}')} be a root?`,
  height: 430,
  choices: [['7', 2], ['2', 3], ['9', 2], ['8', 3], ['16', 4], { sep: 'The piano:' }, ['2', 12]].map((c) => (c.sep ? c : { v: c.join('|'), label: tex(`${c[0]}^{1/${c[1]}}`) })),
  intro: (v) => { const [a, n] = v.split('|'); return `Suppose the exponent laws still work for fractions. Then what number is ${tex(`${a}^{1/${n}}`)}? <b>Multiply it by itself</b> and see.`; },
  make(stage, v, ex) {
    const W = ex.W, [as, ns] = v.split('|'), a = Number(as), n = Number(ns), many = n > 4;
    const pw = `${a}^{1/${n}}`, rt = rootT(n, a), exact = iroot(a, n), val = Math.pow(a, 1 / n);
    const B = board(stage, { x: 34, y: 18, lh: many ? 84 : 76, fs: many ? 27 : 31 });
    const eTok = (i) => `${a}^{\\htmlClass{e${i}}{${cA(`1/${n}`)}}}`, sTok = (i) => `\\htmlClass{s${i}}{${cA(`\\frac{1}{${n}}`)}}`;
    const k = many ? 3 : n;
    const facs = many ? `\\underbrace{${eTok(0)}\\times${eTok(1)}\\times\\cdots\\times${eTok(2)}}_{${n}\\text{ equal factors}}` : Array.from({ length: n }, (_, i) => eTok(i)).join('\\times');
    const sums = many ? `${sTok(0)}+${sTok(1)}+\\cdots+${sTok(2)}` : Array.from({ length: n }, (_, i) => sTok(i)).join('+');
    const r1 = B.line(facs), r2 = B.line(`=${a}^{${sums}}`), r3 = B.line(`=${a}^{${n}/${n}}=${a}^{1}=\\mathbf{${a}}`);
    const rts = many ? `\\underbrace{${rt}\\times${rt}\\times\\cdots\\times${rt}}_{${n}\\text{ equal factors}}` : Array.from({ length: n }, () => rt).join('\\times');
    const r4 = B.line(`${rts}=\\mathbf{${a}}`, { cls: 'teal-l' });
    const res = add(stage, h('div', 'r5-res', K(`${pw}=${rt}${exact != null ? '=' + exact : '\\approx' + val.toFixed(4)}`)), 34, many ? 352 : 330); hide(res);
    // the picture: a square of area a (n = 2) or a cube of volume a (n = 3)
    let side = null, side2 = null;
    if (n === 2 || n === 3) {
      const px = W - 330, L = n === 2 ? 220 : 170;
      if (n === 2) {
        const sq = add(stage, h('div', 'wr-sq'), px + 40, 40); sq.style.width = sq.style.height = L + 'px';
        add(stage, h('div', 'wr-in c', `Area = <b>${a}</b>`), px + 40 + L / 2, 40 + L / 2);
        side = add(stage, h('div', 'wr-side c', K(pw)), px + 40 + L / 2, 40 + L + 30);
        side2 = add(stage, h('div', 'wr-side c', K(`${rt}=${pw}`)), px + 40 + L / 2, 40 + L + 30);
      } else {
        const svg = add(stage, svgEl('svg', { class: 'wr-cube', width: 300, height: 290 }), px, 20);
        const s = L, dx = 0.55 * s, dy = 0.42 * s, x0 = 40, y0 = 30 + dy;
        const P = (pts) => pts.map((p) => p.join(',')).join(' ');
        svg.appendChild(svgEl('polygon', { points: P([[x0, y0], [x0 + dx, y0 - dy], [x0 + s + dx, y0 - dy], [x0 + s, y0]]), class: 'f-top' }));
        svg.appendChild(svgEl('polygon', { points: P([[x0 + s, y0], [x0 + s + dx, y0 - dy], [x0 + s + dx, y0 - dy + s], [x0 + s, y0 + s]]), class: 'f-side' }));
        svg.appendChild(svgEl('rect', { x: x0, y: y0, width: s, height: s, class: 'f-front' }));
        svg.appendChild(svgEl('line', { x1: x0, y1: y0 + s, x2: x0 + s, y2: y0 + s, class: 'edge' }));
        add(stage, h('div', 'wr-in c', `Volume<br>= <b>${a}</b>`), px + x0 + s / 2, 20 + y0 + s / 2);
        side = add(stage, h('div', 'wr-side c', K(pw)), px + x0 + s / 2, 20 + y0 + s + 30);
        side2 = add(stage, h('div', 'wr-side c', K(`${rt}=${pw}`)), px + x0 + s / 2, 20 + y0 + s + 30);
      }
      side.classList.add('q'); side.innerHTML = '?'; hide(side2);
    }
    let chk = null;
    if (!side) {
      chk = add(stage, h('div', 'wr-chk', `<div class="wr-chk-h">Check it</div>${K(exact != null ? `${Array(n).fill(exact).join('\\times')}=${a}` : `${val.toFixed(6)}^{${n}}\\approx${Math.pow(Number(val.toFixed(6)), n).toFixed(3)}`)}${n === 12 ? '<div class="wr-chk-n">twelve piano steps double the pitch</div>' : ''}`), W - 330, 150);
      chk.style.width = '300px'; hide(chk);
    }
    const sumWord = n === 2 ? tex('\\tfrac12+\\tfrac12') : n === 3 ? tex('\\tfrac13+\\tfrac13+\\tfrac13') : `${n} copies of ${tex(`\\tfrac{1}{${n}}`)}`;
    return [{
      cap: `Multiply <b>${n}</b> equal factors of ${tex(pw)}.` + (n === 2 ? ` That’s the side of a square with area ${a}: side × side = area.` : n === 3 ? ` That’s the edge of a cube with volume ${a}: edge × edge × edge = volume.` : ''),
      run: async (c) => {
        const jobs = [showRow(c, stage, r1)];
        if (side) { side.innerHTML = K(pw); side.classList.remove('q'); jobs.push(c.pop(side, 420, { delay: 200 })); }
        await Promise.all(jobs);
      }
    }, {
      cap: `<b>Product law:</b> the bases are the same, so <b>add the exponents</b>: ${sumWord}.`,
      run: (c) => showRow(c, stage, r2, Array.from({ length: k }, (_, i) => [r1.q('.e' + i), r2.q('.s' + i), `\\frac{1}{${n}}`, AM]), many ? 27 : 31)
    }, {
      cap: `${sumWord} ${tex(`=\\tfrac{${n}}{${n}}=1`)}. So the product is ${tex(`${a}^1`)}, which is just <b>${a}</b>.`,
      run: (c) => showRow(c, stage, r3)
    }, {
      cap: `Now look at ${tex(rt)}. By definition it’s the number that gives <b>${a}</b> when ${n} copies of it are multiplied.`,
      run: (c) => showRow(c, stage, r4)
    }, {
      cap: `Both numbers do the <b>same job</b>, so they are the <b>same number</b>: ${tex(`${pw}=${rt}`)}` + (exact != null ? ` = ${exact}. Check: ${Array(n).fill(exact).join(' × ')} = ${a} ✓` : ` ≈ ${val.toFixed(4)}.`) + (n === 12 ? ' That’s <b>r</b>, the step between piano keys!' : ''),
      run: async (c) => {
        const jobs = [c.pop(res, 480)];
        if (side2) { jobs.push(c.anim(side, [{ opacity: 1 }, { opacity: 0 }], 250), c.pop(side2, 420, { delay: 200 })); }
        if (chk) jobs.push(c.fadeIn(chk, 400, { delay: 250 }));
        await Promise.all(jobs);
      }
    }];
  }
};

/* ============ 2. Root first or power first ============ */
const routes = {
  title: 'Root first or power first?',
  height: 456,
  choices: [[27, 2, 3], [8, 2, 3], [27, 4, 3], [16, 3, 4], [32, 3, 5], { sep: 'Example 1 check:' }, [16, 3, 2], [1000, 2, 3]].map((c) => (c.sep ? c : { v: c.join('|'), label: tex(`${tn(c[0])}^{${c[1]}/${c[2]}}`) })),
  intro: (v) => { const [a, m, n] = v.split('|').map(Number); return `${tex(`${tn(a)}^{${cA(m)}/${cT(n)}}`)}: the <b>denominator ${n}</b> means a ${ord(n)} root, the <b>numerator ${m}</b> means a power of ${m}. Which should we do first?`; },
  make(stage, v, ex) {
    const W = ex.W, [a, m, n] = v.split('|').map(Number), r = iroot(a, n), res = r ** m, big = a ** m;
    const lw = (W - 90) / 2, xA = 30, xB = 60 + lw, top = 76;
    const head = add(stage, h('div', 'rt-head', K(`${tn(a)}^{${cA(m)}/${cT(n)}}`)), W / 2, 8); head.style.translate = '-50% 0';
    const lane = (x, cls, title) => { const l = add(stage, h('div', 'rt-lane ' + cls, `<div class="rt-lt">${title}</div>`), x, top); l.style.width = lw + 'px'; return l; };
    lane(xA, 'a', `Root first, then power`); lane(xB, 'b', `Power first, then root`);
    const fs = 30, ln = (x, y, src) => { const e = add(stage, h('div', 'r5-line', K(src)), x + 22, y); e.style.fontSize = fs + 'px'; hide(e); return e; };
    const nt = (x, y, html) => { const e = add(stage, h('div', 'rt-note', html), x + 22, y); e.style.width = (lw - 40) + 'px'; hide(e); return e; };
    const A1 = ln(xA, top + 46, `=\\left(${rootT(n, tn(a))}\\right)^{${m}}`), B1 = ln(xB, top + 46, `=${rootT(n, `${tn(a)}^{${m}}`)}`);
    const A2 = ln(xA, top + 106, `=${r}^{${m}}`), A2n = nt(xA, top + 150, `${tex(`${rootT(n, tn(a))}=${r}`)} because ${tex(`${r}^{${n}}=${tn(a)}`)}`);
    const A3 = ln(xA, top + 184, `=\\mathbf{${tn(res)}}`), A3n = nt(xA, top + 228, `${tex(`${r}^{${m}}=${tn(res)}`)} <b class="ok">✓ easy</b>`);
    const B2 = ln(xB, top + 106, `=${rootT(n, tn(big))}`), B2n = nt(xB, top + 150, `${tex(`${tn(a)}^{${m}}=${tn(big)}`)}`);
    const B3 = ln(xB, top + 184, `=\\mathbf{${tn(res)}}`), B3n = nt(xB, top + 228, `${tex(`${tn(res)}^{${n}}=${tn(big)}`)} <b class="red">hard to spot!</b>`);
    const maxA = Math.max(a, res), by = top + 274, bx = 196, maxW = W - bx - 150;
    const bh = add(stage, h('div', 'rt-bh', 'Biggest number on the way'), 30, by); hide(bh);
    const bar = (y, cls, lab, val) => {
      const l = add(stage, h('div', 'rt-bl ' + cls, lab), 30, y); const b = add(stage, h('div', 'rt-bar ' + cls), bx, y + 4);
      const w = Math.max(6, (maxW * val) / big); b.style.width = w + 'px';
      const t = add(stage, h('div', 'rt-bv ' + cls, fmt(val)), bx + w + 10, y); hide(l, b, t); return [l, b, t];
    };
    const bA = bar(by + 30, 'a', 'Root first', maxA), bB = bar(by + 70, 'b', 'Power first', big);
    return [{
      cap: `Both orders are allowed: ${tex(`\\left(${rootT(n, tn(a))}\\right)^{${m}}`)} takes the <b>root first</b>, ${tex(rootT(n, `${tn(a)}^{${m}}`))} raises to the <b>power first</b>.`,
      run: (c) => Promise.all([c.fadeIn(A1, 400), c.fadeIn(B1, 400, { delay: 250 })])
    }, {
      cap: `<b>Root first:</b> ${tex(`${rootT(n, tn(a))}=${r}`)}, because ${tex(`${Array(n).fill(sgnT(r)).join('\\times')}=${tn(a)}`)}. A small, friendly number.`,
      run: (c) => Promise.all([c.fadeIn(A2, 400), c.fadeIn(A2n, 350, { delay: 200 })])
    }, {
      cap: `Then the power: ${tex(`${r}^{${m}}=${tn(res)}`)}. Done!`,
      run: (c) => Promise.all([c.fadeIn(A3, 400), c.fadeIn(A3n, 350, { delay: 200 })])
    }, {
      cap: `<b>Power first:</b> ${tex(`${tn(a)}^{${m}}=${tn(big)}`)}. That number is already big.`,
      run: (c) => Promise.all([c.fadeIn(B2, 400), c.fadeIn(B2n, 350, { delay: 200 })])
    }, {
      cap: `Now we need ${tex(rootT(n, tn(big)))}: which number, used ${n} times as a factor, gives ${fmt(big)}? It’s ${fmt(res)}, but that’s hard to see without a calculator.`,
      run: (c) => Promise.all([c.fadeIn(B3, 400), c.fadeIn(B3n, 350, { delay: 200 })])
    }, {
      cap: `Same answer both ways: <b>${tex(`${tn(a)}^{${m}/${n}}=${tn(res)}`)}</b>. Root first, the biggest number was ${fmt(maxA)}; power first, ${fmt(big)}. <b>Take the root first.</b>`,
      run: async (c) => {
        await c.fadeIn(bh, 300);
        await Promise.all([...bA, ...bB].map((e, i) => (e.classList.contains('rt-bar') ? c.anim(e, [{ opacity: 1, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], 700, { delay: i > 2 ? 250 : 0 }) : c.fadeIn(e, 300, { delay: i > 2 ? 400 : 150 }))));
      }
    }];
  }
};

/* ============ 3. Flip, root, power ============ */
const baseT = (b, small) => (b.q === 1 ? (b.p < 0 ? `(${tn(b.p)})` : tn(b.p)) : `\\left(${qT(b, small)}\\right)`);
const machine = {
  title: 'Flip, root, power: one job at a time',
  height: 450,
  choices: ['27|-2/3', '16|-3/4', '1/9|-1/2', { sep: 'Example 1 check:' }, '16|3/2', '1000|2/3', '8|-4/3', { sep: 'Example 3 check:' }, '16/25|3/2', '16/25|-3/2']
    .map((v) => (v.sep ? v : { v, label: tex(mExp(v, false, false, true)) })),
  intro: (v) => `${tex(mExp(v, true, false, true))}: the <b class="red">sign</b> of the exponent says whether to flip, the <b class="teal">denominator</b> says which root, the <b class="amb">numerator</b> says which power.`,
  make(stage, v, ex) {
    const W = ex.W, [bs, es] = v.split('|'), b = parseQ(bs), mm = Number(es.split('/')[0]), n = Number(es.split('/')[1]), neg = mm < 0, m = Math.abs(mm);
    const f = neg ? Q(b.q, b.p) : b, r = qroot(f, n), res = qpow(r, m);
    const head = add(stage, h('div', 'mc-head' + (b.q > 1 ? ' fr' : ''), K(mExp(v, true, true))), W / 2, b.q > 1 ? 2 : 8); head.style.translate = '-50% 0';
    const gap = 46, bw = (W - 60 - 2 * gap) / 3, y0 = 92, bhgt = 150;
    const st = [
      { t: '1 · Sign', s: neg ? 'negative: <b>flip</b> the base' : 'positive: nothing to flip', cls: 'sg', out: qT(f) },
      { t: `2 · Denominator ${n}`, s: `take the <b>${ord(n)} root</b>`, cls: 'rt', out: qT(r) },
      { t: `3 · Numerator ${m}`, s: m === 1 ? 'power 1: no change' : `raise to the <b>power ${m}</b>`, cls: 'pw', out: qT(res) }
    ].map((o, i) => {
      const x = 30 + i * (bw + gap), box = add(stage, h('div', 'mc-st ' + o.cls, `<div class="mc-t">${o.t}</div><div class="mc-s">${o.s}</div>`), x, y0);
      box.style.width = bw + 'px'; box.style.height = bhgt + 'px';
      const out = add(stage, h('div', 'mc-out c', K(o.out)), x + bw / 2, y0 + 104); hide(out);
      if (i < 2) add(stage, h('div', 'mc-arr c', '→'), x + bw + gap / 2, y0 + bhgt / 2);
      return Object.assign(o, { box, out });
    });
    const parts = [mExp(v, false)];
    if (neg) parts.push('=', `${baseT(f)}^{${m}/${n}}`);
    if (m > 1) parts.push('=', `${qP(r)}^{${m}}`);
    parts.push('=', `\\mathbf{${qT(res)}}`);
    const ch = chain(stage, parts, 40, 272, 32);
    ch.els[0].style.opacity = 1;
    const iF = neg ? [1, 2] : [], iP = m > 1 ? [parts.length - 4, parts.length - 3] : [], iR = [parts.length - 2, parts.length - 1];
    const val = Math.pow(b.p / b.q, mm / n);
    const chk = add(stage, h('div', 'mc-chk', `<b>Calculator check:</b> ${tex(mExp(v, false, false, true))} ≈ ${val.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')}${res.q > 1 ? ` and ${tex(qT(res, true))} ≈ ${(res.p / res.q).toFixed(6).replace(/0+$/, '')}` : ''} <b class="ok">✓</b>`), 40, 378); hide(chk);
    const rootWhy = f.q === 1 ? `${tex(`${rootT(n, tn(f.p))}=${r.p}`)}, because ${tex(`${r.p}^{${n}}=${tn(f.p)}`)}.`
      : `Root the top and the bottom separately: ${tex(`${rootT(n, tn(f.p))}=${r.p}`)} and ${tex(`${rootT(n, tn(f.q))}=${r.q}`)}, so the root is ${tex(qT(r))}.`;
    const lit = (i) => st.forEach((s, j) => s.box.classList.toggle('on', j === i));
    return [{
      cap: neg ? `The exponent is <b>negative</b>, so <b>flip</b> the base: ${tex(qT(b))} becomes ${tex(qT(f))}. Now the exponent is positive, ${tex(`${m}/${n}`)}.`
        : `The exponent is <b>positive</b>, so there’s nothing to flip. The base stays ${tex(qT(b))}.`,
      run: async (c) => {
        lit(0); if (!neg) st[0].box.classList.add('skip');
        await Promise.all([fly(c, stage, head.querySelector('.mc-b'), st[0].out, qT(b), { fs: 30 }), showPieces(c, iF.map((i) => ch.els[i]))]);
        if (neg) await c.pop(st[0].out, 300);
      }
    }, {
      cap: `Denominator <b>${n}</b>: take the ${ord(n)} root. ${rootWhy}`,
      run: async (c) => {
        lit(1); st[1].out.innerHTML = K(qT(f)); st[1].out.style.opacity = 0;
        await fly(c, stage, st[0].out, st[1].out, qT(f), { fs: 30 });
        st[1].out.innerHTML = K(qT(r)); await c.pop(st[1].out, 350);
      }
    }, {
      cap: m === 1 ? `Numerator <b>1</b>: a power of 1 changes nothing, so the answer is ${tex(qT(r))}.` : `Numerator <b>${m}</b>: ${tex(`${qP(r)}^{${m}}=${qT(res)}`)}${r.q > 1 ? `: the power acts on the top and the bottom (${tex(`${r.p}^{${m}}=${tn(res.p)}`)}, ${tex(`${r.q}^{${m}}=${tn(res.q)}`)})` : ''}.`,
      run: async (c) => {
        lit(2); st[2].out.innerHTML = K(qT(r)); st[2].out.style.opacity = 0;
        await Promise.all([fly(c, stage, st[1].out, st[2].out, qT(r), { fs: 30 }), showPieces(c, iP.map((i) => ch.els[i]))]);
        st[2].out.innerHTML = K(qT(res)); await c.pop(st[2].out, 350);
      }
    }, {
      cap: `So <b>${tex(`${mExp(v, false, false, true)}=${qT(res, true)}`)}</b>.` + (neg ? ' The negative exponent made a <b>reciprocal</b>, not a negative number.' : ' Root first kept every number small.'),
      run: async (c) => { lit(-1); await showPieces(c, iR.map((i) => ch.els[i])); await c.fadeIn(chk, 380); }
    }];
  }
};
function mExp(v, color, cls, small) { // LaTeX for 'base|±m/n', coloured parts on request
  const [bs, es] = v.split('|'), b = parseQ(bs), [ms, n] = es.split('/'), mm = Number(ms), m = Math.abs(mm);
  const sg = mm < 0 ? (color ? cR('-') : '-') : '';
  const B = cls ? `\\htmlClass{mc-b}{${baseT(b, small)}}` : baseT(b, small);
  return `${B}^{${sg}${color ? cA(m) : m}/${color ? cT(n) : n}}`;
}

/* ============ 4. Negative bases: where is the minus sign? ============ */
const MINUS = ['in|8|1|3', 'out|8|1|3', 'in|16|1|4', 'out|16|1|4', 'in|8|2|6', { sep: 'Example 2 check:' }, 'in|27|2|3', 'outb|27|2|3', 'in|16|3|2'];
function minusExp(kind, a, m, n, cls) {
  const b = cls ? (x) => `\\htmlClass{mn-b}{${x}}` : (x) => x, o = cls ? (x) => `\\htmlClass{mn-o}{${x}}` : (x) => x;
  const e = `^{${m}/${n}}`;
  return kind === 'in' ? `${b(`(-${a})`)}${e}` : kind === 'out' ? `${o('-')}${b(String(a))}${e}` : `${o('-')}\\left(${b(String(a))}${e}\\right)`;
}
const minus = {
  title: 'Negative bases: where is the minus sign?',
  height: 456,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: MINUS.map((v) => (v.sep ? v : { v, label: tex(minusExp(v.split('|')[0], ...v.split('|').slice(1).map(Number))) })),
  intro: (v) => { const [k, a, m, n] = v.split('|'); return `Evaluate ${tex(minusExp(k, a, m, n))}. First question: <b>what is the base?</b>`; },
  make(stage, v, ex) {
    const W = ex.W, [kind, as, ms, ns] = v.split('|'), a = Number(as), m0 = Number(ms), n0 = Number(ns), g = gcd(m0, n0), m = m0 / g, n = n0 / g, red = g > 1;
    const inside = kind === 'in', s = inside ? -a : a, rv = iroot(s, n), real = rv != null, pv = real ? rv ** m : null, fin = real ? (inside ? pv : -pv) : null;
    // the expression (with the reduction, if any)
    const ex0 = chain(stage, red ? [minusExp(kind, a, m0, n0, true), '=', minusExp(kind, a, m, n, true)] : [minusExp(kind, a, m, n, true)], 40, 20, 46);
    ex0.els[0].style.opacity = 1;
    const tag = add(stage, h('div', 'mn-tag', inside ? `Base: ${tex(`-${a}`)} &nbsp;·&nbsp; the minus goes <b>into</b> the root` : `Base: ${tex(String(a))} &nbsp;·&nbsp; the <b class="red">minus waits outside</b>`), 40, 116); hide(tag);
    // which roots exist?
    const card = add(stage, h('div', 'mn-card', `<div class="mn-ch">Which roots of a negative exist?</div><div class="mn-r odd"><span>odd index</span><span>3, 5, 7, …</span><b class="ok">yes ✓</b></div><div class="mn-r even"><span>even index</span><span>2, 4, 6, …</span><b class="red">no ✗</b></div>`), W - 350, 20);
    card.style.width = '320px';
    // the root search
    const q = add(stage, h('div', 'mn-q', `Which number, used <b>${n}</b> times as a factor, gives <b>${tn(s).replace('-', '−')}</b>?`), 40, 160); hide(q);
    const k0 = iroot(a, n), cands = real ? [[rv, true]] : [[k0, false], [-k0, false]];
    const cEls = cands.map(([cv, ok], i) => {
      const e = add(stage, h('div', 'mn-cand ' + (ok ? 'ok' : 'no'), `${K(`${sgnT(cv)}^{${n}}=${tn(cv ** n)}`)} <b>${ok ? '✓' : `✗ not ${tn(s).replace('-', '−')}`}</b>`), 60 + i * 300, 200); hide(e); return e;
    });
    // the work
    const RT = (x) => rootT(n, x);
    const parts = [minusExp(kind, a, m, n)];
    if (inside) { parts.push('=', m > 1 ? `\\left(${RT(`-${a}`)}\\right)^{${m}}` : RT(`-${a}`)); if (real) { if (m > 1) parts.push('=', `(${tn(rv)})^{${m}}`); parts.push('=', `\\mathbf{${tn(fin)}}`); } }
    else { parts.push('=', m > 1 ? `-\\left(${RT(a)}\\right)^{${m}}` : `-${RT(a)}`); if (m > 1) parts.push('=', `-\\left(${tn(rv)}\\right)^{${m}}`); parts.push('=', `\\mathbf{${tn(fin)}}`); }
    const ch = chain(stage, parts, 40, 268, 36); ch.els[0].style.opacity = 1;
    const stamp = add(stage, h('div', 'mn-stamp', `NOT A REAL NUMBER<small>no real number to an even power is negative</small>`), W - 380, 262); hide(stamp);
    const fact = add(stage, h('div', 'mn-fact'), 40, 370); fact.style.width = (W - 80) + 'px'; hide(fact);
    const steps = [];
    if (red) steps.push({
      cap: `<b>Reduce the exponent first:</b> ${tex(`\\tfrac{${m0}}{${n0}}=\\tfrac{${m}}{${n}}`)}. (Squaring first, ${tex(`\\sqrt[6]{(-8)^2}=\\sqrt[6]{64}=2`)}, would give the wrong sign.)`,
      run: (c) => showPieces(c, ex0.els.slice(1))
    });
    steps.push({
      cap: inside ? `The <b>brackets</b> make ${tex(`-${a}`)} the base. The minus sign goes into the root with it.`
        : `No brackets around ${tex(`-${a}`)}, so the exponent belongs to <b>${a} only</b>. The minus sign waits outside: it’s ${tex(`-1\\times${a}^{${m}/${n}}`)}.`,
      run: async (c) => { stage.querySelectorAll('.mn-b').forEach((e) => e.classList.add('lit')); stage.querySelectorAll('.mn-o').forEach((e) => e.classList.add('lit')); await c.fadeIn(tag, 380); }
    }, {
      cap: n % 2 ? `The denominator, <b>${n}</b>, is the index of the root. ${n} is <b>odd</b>: ${inside ? 'a negative base is fine.' : 'any base is fine.'}`
        : inside ? `The denominator, <b>${n}</b>, is the index of the root. ${n} is <b>even</b>, and the base is <b>negative</b>. Uh-oh…`
          : `The denominator, <b>${n}</b>, is the index. ${n} is even, but the base, ${a}, is <b>positive</b>, so the root exists.`,
      run: async (c) => { const row = card.querySelector(n % 2 ? '.odd' : '.even'); row.classList.add('lit'); if (!(n % 2) && inside) card.classList.add('bad'); await c.anim(row, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], 450); }
    }, {
      cap: real ? `${tex(`${sgnT(rv)}^{${n}}=${tn(s)}`)}, so ${tex(`${RT(tn(s))}=${tn(rv)}`)}.` + (inside && n % 2 ? ' An odd number of negatives multiply to a negative.' : '')
        : `Try ${k0}: ${tex(`${k0}^{${n}}=${a}`)}. Try ${tex(String(-k0))}: ${tex(`(-${k0})^{${n}}=${a}`)} too. An <b>even</b> number of factors is never negative, so <b>no real number</b> works.`,
      run: async (c) => { await c.fadeIn(q, 300); for (const e of cEls) await c.fadeIn(e, 350, { from: 'translateX(-10px)' }); await showPieces(c, ch.els.slice(1, 3)); }
    });
    if (!real) {
      steps.push({
        cap: `${tex(minusExp(kind, a, m, n))} needs ${tex(RT(-a))}, an <b>even</b> root of a negative number. It has <b>no meaning</b> as a real number. (Your calculator says ERROR.)`,
        run: (c) => stampIn(c, stamp)
      });
      return steps;
    }
    const rest = ch.els.slice(3);
    steps.push({
      cap: inside ? (m > 1 ? `Numerator <b>${m}</b>: ${tex(`(${tn(rv)})^{${m}}=${tn(pv)}`)}. So ${tex(`${minusExp(kind, a, m, n)}=${tn(fin)}`)}.` : `So ${tex(`${minusExp(kind, a, m0, n0)}=${tn(fin)}`)}.`)
        : (m > 1 ? `Numerator <b>${m}</b>: ${tex(`${tn(rv)}^{${m}}=${tn(pv)}`)}. ` : '') + `Last, the minus sign that was waiting outside: ${tex(`-(${tn(pv)})=${tn(fin)}`)}.`,
      run: async (c) => {
        await showPieces(c, rest);
        const outV = -(iroot(a, n) ** m), inV = n % 2 ? iroot(-a, n) ** m : null;
        fact.innerHTML = inside ? (m % 2 === 0 ? `An <b>even</b> power of a negative is positive: ${tex(`(${tn(rv)})^{${m}}=${tn(pv)}`)}.` : `An <b>odd</b> root of a negative is negative.`)
            + ` Compare, without brackets: ${tex(`-${a}^{${m}/${n}}=${tn(outV)}`)}${outV === fin ? ' (the same value here, because the root and the power are both odd, but it means something different)' : ''}.`
          : `Compare, with brackets: ${tex(`(-${a})^{${m}/${n}}`)}${inV != null ? ` ${tex('=' + tn(inV))}${inV === fin ? ' (the same value here, because the root and the power are both odd)' : ''}` : ' is <b>not a real number</b>'}. Where the minus sign sits matters.`;
        await c.fadeIn(fact, 380);
      }
    });
    return steps;
  }
};

/* ============ 5–6. Converting between powers and radicals ============ */
/* power spec 'coef|base|m|n|tidy' (m < 0 for a negative exponent); radical spec 'R|recip|base|m|n' */
function powT(sp, cls, plain) {
  const [co, b, ms, n] = sp.split('|'), mm = Number(ms), m = Math.abs(mm);
  const cA = plain ? (x) => x : cA0, cT = plain ? (x) => x : cT0, cR = plain ? (x) => x : cR0;
  const C = (x) => (cls ? `\\htmlClass{${x[0]}}{${x[1]}}` : x[1]);
  const coef = co ? C(['tk-c', co === '-' ? cR('-') : plain ? co : `\\textcolor{#6a3fb0}{${co}}`]) : '';
  return `${coef}${C(['tk-b', b])}^{${mm < 0 ? C(['tk-s', cR('-')]) : ''}${C(['tk-m', cA(m)])}/${C(['tk-n', cT(n)])}}`;
}
function radT(sp, cls, plain) {
  const [, rc, b, ms, n] = sp.split('|'), m = Number(ms);
  const cA = plain ? (x) => x : cA0, cT = plain ? (x) => x : cT0;
  const C = (x, y) => (cls ? `\\htmlClass{${x}}{${y}}` : y);
  const inner = `${b}${m === 1 ? '' : `^{${C('tk-m', cA(m))}}`}`, rad = Number(n) === 2 ? `\\sqrt{${inner}}` : `\\sqrt[${C('tk-n', cT(n))}]{${inner}}`;
  return rc ? `\\dfrac{1}{${rad}}` : rad;
}
const convLabel = (sp) => tex(sp[0] === 'R' ? radT(sp, false, true) : powT(sp, false, true));
function convDef(title, list) {
  return {
    title,
    height: 430,
    choices: list.map((v) => (v.sep ? v : { v, label: convLabel(v) })),
    intro: (sp) => (sp[0] === 'R' ? `Write ${convLabel(sp)} as a <b>power</b>: the <b class="teal">index</b> becomes the denominator, the <b class="amb">power inside</b> becomes the numerator.`
      : `Write ${convLabel(sp)} as a <b>radical</b>: the <b class="teal">denominator</b> becomes the index, the <b class="amb">numerator</b> stays a power.`),
    make(stage, sp, ex) { return sp[0] === 'R' ? toPowSteps(stage, sp, ex.W) : toRadSteps(stage, sp, ex.W); }
  };
}
function legend(stage, W, rows) {
  const lg = add(stage, h('div', 'cv-lg', rows.map(([cls, k, val]) => `<div class="cv-r ${cls}"><span class="cv-k">${k}</span><span class="cv-v">${val}</span></div>`).join('')), W * 0.58, 16);
  lg.style.width = (W * 0.42 - 30) + 'px';
  return lg;
}
function toRadSteps(stage, sp, W) {
  const [co, b, ms, ns, tidy] = sp.split('|'), mm = Number(ms), m = Math.abs(mm), n = Number(ns), neg = mm < 0;
  const B = board(stage, { x: 36, y: 18, lh: 100, fs: 34 });
  const L0 = B.line(powT(sp, true), { fs: 50 }); L0.el.style.opacity = 1;
  const isNum = co && co !== '-', bracket = b[0] === '(';
  const rows = [];
  if (co) rows.push(['c', co === '-' ? 'minus sign' : 'coefficient', co === '-' ? 'stays <b>outside</b> the radical' : `${tex(co)} stays <b>in front</b>`]);
  rows.push(['b', 'base', `${tex(b)}${bracket ? ': the brackets make it the base' : ''}`]);
  if (neg) rows.push(['s', 'negative sign', '<b>flip</b>: one over…']);
  rows.push(['m', 'numerator', `${tex(cA(m))}: the <b>power</b>`], ['n', 'denominator', `${tex(cT(n))}: the <b>index</b>`]);
  const lg = legend(stage, W, rows); const lrows = [...lg.children]; hide(...lrows);
  const pre = co === '-' ? '-' : co || '';
  const idx = n === 2 ? '' : `[\\htmlClass{tk-i}{${cT(n)}}]`;
  const inner = (x) => `${b}${m === 1 ? '' : `^{\\htmlClass{tk-p}{${cA(m)}}}`}`.replace(b, x || b);
  const radi = `\\sqrt${idx}{${inner()}}`;
  const wrap = (rad) => (neg ? (isNum ? `\\dfrac{${co}}{${rad}}` : `${co === '-' ? '-' : ''}\\dfrac{1}{${rad}}`) : `${pre}${rad}`);
  const L1 = neg ? B.line(`=${isNum ? `\\dfrac{${co}}{${b}^{${m}/${n}}}` : `${co === '-' ? '-' : ''}\\dfrac{1}{${b}^{${m}/${n}}}`}`) : null;
  const L2 = B.line(`=${wrap(radi)}`);
  const L3 = tidy ? B.line(`=\\boldsymbol{${wrap(`\\sqrt${n === 2 ? '' : `[${n}]`}{${tidy}}`)}}`) : null;
  const finalT = wrap(`\\sqrt${n === 2 ? '' : `[${n}]`}{${tidy || `${b}${m === 1 ? '' : `^{${m}}`}`}}`);
  const altT = m > 1 ? wrap(`\\left(\\sqrt${n === 2 ? '' : `[${n}]`}{${b}}\\right)^{${m}}`) : null;
  const res = add(stage, h('div', 'cv-res', `${K(`${powT(sp)}=${finalT}`)}${altT ? `<div class="cv-alt">also correct: ${K(altT)}</div>` : ''}`), W * 0.58, 214); hide(res);
  res.style.width = (W * 0.42 - 30) + 'px';
  const capRead = (co === '-' ? `The exponent sits on ${tex(b)} only, so the <b>minus sign</b> isn’t part of the base: it stays outside. ` : isNum ? `The exponent sits on ${tex(b)} only, so the <b>${co}</b> isn’t part of the base: it stays in front. ` : bracket ? `The <b>brackets</b> make ${tex(b)} the whole base, so everything inside goes under the root. ` : '')
    + `<b class="amb">Numerator ${m}</b> is the power; <b class="teal">denominator ${n}</b> is the index.`;
  const steps = [{
    cap: capRead,
    run: async (c) => {
      ['c', 'b', 's', 'm', 'n'].forEach((k) => L0.qa('.tk-' + k).forEach((e) => e.classList.add('lit-' + k)));
      await Promise.all(lrows.map((r, i) => c.fadeIn(r, 300, { delay: i * 150, from: 'translateX(10px)' })));
    }
  }];
  if (neg) steps.push({
    cap: `The exponent is <b>negative</b>: take the reciprocal. ${tex(`${b}^{-${m}/${n}}=\\dfrac{1}{${b}^{${m}/${n}}}`)}` + (co === '-' ? ', and the minus sign still waits outside.' : isNum ? `, with the ${co} on top.` : '.'),
    run: (c) => showRow(c, stage, L1)
  });
  steps.push({
    cap: `<b class="teal">Denominator ${n}</b> → the index of the root${n === 2 ? ' (index 2 is the plain square root, so it isn’t written)' : ''}. <b class="amb">Numerator ${m}</b> → the power inside${m === 1 ? ' (a power of 1 isn’t written)' : ''}.`,
    run: (c) => showRow(c, stage, L2, [n === 2 ? null : [L0.q('.tk-n'), L2.q('.tk-i'), cT(n), TL], m === 1 ? null : [L0.q('.tk-m'), L2.q('.tk-p'), cA(m), AM]], 34)
  });
  if (tidy) steps.push({
    cap: `Tidy the inside: ${tex(`${b}^{${m}}=${tidy}`)}. The power acts on <b>every factor</b> in the brackets.`,
    run: (c) => showRow(c, stage, L3)
  });
  steps.push({
    cap: `So <b>${tex(`${powT(sp)}=${finalT}`)}</b>.` + (altT ? ` Taking the root first, ${tex(altT)}, is the same thing.` : ''),
    run: (c) => c.pop(res, 450)
  });
  return steps;
}
function toPowSteps(stage, sp, W) {
  const [, rc, b, ms, ns] = sp.split('|'), m = Number(ms), n = Number(ns);
  const B = board(stage, { x: 36, y: rc ? 8 : 18, lh: 110, fs: 40 });
  const L0 = B.line(radT(sp, true), { fs: rc ? 38 : 50 }); L0.el.style.opacity = 1;
  const rows = [['n', 'index', n === 2 ? `${tex('\\sqrt{\\ }')} means index ${tex(cT(2))}` : `${tex(cT(n))} → the <b>denominator</b>`],
    ['m', 'power inside', m === 1 ? `none written: it’s ${tex(cA(1))}` : `${tex(cA(m))} → the <b>numerator</b>`]];
  if (rc) rows.push(['s', 'one over', 'a <b>negative</b> exponent']);
  const lg = legend(stage, W, rows); const lrows = [...lg.children]; hide(...lrows);
  const pT = `${b}^{\\htmlClass{tk-p}{${cA(m)}}/\\htmlClass{tk-d}{${cT(n)}}}`;
  const L1 = B.line(`=${rc ? `\\dfrac{1}{${pT}}` : pT}`, { y: rc ? 150 : 128 });
  const L2 = rc ? B.line(`=\\boldsymbol{${b}^{${cR('-')}${m}/${n}}}`, { y: 266 }) : null;
  const fin = `${b}^{${rc ? '-' : ''}${m}/${n}}`;
  const res = add(stage, h('div', 'cv-res', K(`${radT(sp)}=${fin}`)), W * 0.58, 214); hide(res); res.style.width = (W * 0.42 - 30) + 'px';
  const steps = [{
    cap: (n === 2 ? `A plain square root has index <b class="teal">2</b>, even though it isn’t written. ` : `The <b class="teal">index ${n}</b> becomes the denominator. `) + (m === 1 ? `There’s no power written inside, so the numerator is <b class="amb">1</b>.` : `The <b class="amb">power ${m}</b> inside becomes the numerator.`),
    run: async (c) => { L0.qa('.tk-n').forEach((e) => e.classList.add('lit-n')); L0.qa('.tk-m').forEach((e) => e.classList.add('lit-m')); await Promise.all(lrows.map((r, i) => c.fadeIn(r, 300, { delay: i * 150, from: 'translateX(10px)' }))); }
  }, {
    cap: `${tex(`\\sqrt[n]{x^m}=x^{m/n}`)}: index on the bottom, power on top. ${tex(`${rootT(n, `${b}${m === 1 ? '' : `^{${m}}`}`)}=${b}^{${m}/${n}}`)}.`,
    run: (c) => showRow(c, stage, L1, [[L0.q('.tk-n') || L0.el, L1.q('.tk-d'), cT(n), TL], [L0.q('.tk-m') || L0.el, L1.q('.tk-p'), cA(m), AM]], 40)
  }];
  if (rc) steps.push({
    cap: `A power in the <b>denominator</b> moves up with a <b>negative</b> exponent: ${tex(`\\dfrac{1}{${b}^{${m}/${n}}}=${b}^{-${m}/${n}}`)}.`,
    run: (c) => showRow(c, stage, L2)
  });
  steps.push({ cap: `So <b>${tex(`${radT(sp)}=${fin}`)}</b>.`, run: (c) => c.pop(res, 450) });
  return steps;
}
const conv1 = convDef('Power → radical', ['|a|2|3', '|b|-3|4', { sep: 'Example 5(b) check:' }, '|x|1|5', '|y|3|8', '|z|-1|4', '|w|-5|6']);
const conv2 = convDef('What’s outside stays outside', ['-|a|2|3', '|(-a)|2|3', '5|a|2|3', '|(5a)|2|3|25a^2', { sep: 'Example 6 check:' }, '|m|1|5', '-|n|3|7', '|(-p)|5|3', '|(-p)|-5|3', '4|s|2|3', '|(4s)|2|3|16s^2']);
conv2.minW = 780; // drawn this wide and scaled to fit beside the sidebar
const toPow = convDef('Radical → power', ['R||a|2|5', 'R||a|3|2', 'R|1|a|1|4', { sep: 'Example 7 check:' }, 'R||k|3|4', 'R||k|5|6', 'R||k|7|2', 'R|1|k|5|3']);

/* ============ 4. A cube of known volume ============ */
const cube = {
  title: 'A cube of known volume',
  height: 440,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [8, 64, 2, 1000, { sep: 'Example 4 check:' }, 100].map((v) => (v.sep ? v : { v, label: `V = ${fmt(v)}` })),
  intro: (V) => `A cube holds <b>${fmt(V)} cm³</b>. How long is each edge, and what is its surface area?`,
  make(stage, V, ex) {
    const W = ex.W, e = Math.cbrt(V), ex3 = iroot(V, 3), face = e * e, SA = 6 * face;
    const S = 150, sc = add(stage, h('div', 'cb-scene'), 40, 40), cb = h('div', 'cb'); sc.appendChild(cb);
    cb.style.width = cb.style.height = S + 'px';
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'].map((nm) => { const f = h('div', 'cb-f ' + nm); f.style.width = f.style.height = S + 'px'; cb.appendChild(f); return f; });
    const T0 = 'rotateX(-24deg) rotateY(-34deg)'; cb.style.transform = T0;
    const vlab = add(stage, h('div', 'cb-v c', `V = <b>${fmt(V)}</b> cm³`), 190, 332);
    const elab = add(stage, h('div', 'cb-e c', K(`e=${tn(V)}^{1/3}`)), 124, 286); hide(elab);
    // the net: six faces laid flat
    const u = 70, nx = 44, ny = 60, cells = [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]];
    const net = cells.map(([i, j]) => { const d = add(stage, h('div', 'cb-n', K(`${tn(V)}^{2/3}`)), nx + i * u, ny + j * u); d.style.width = d.style.height = u + 'px'; hide(d); return d; });
    const fz = 25, Bd = board(stage, { x: 380, y: 20, lh: 68, fs: fz });
    const vT = tn(V), d2 = (x) => (Math.abs(x - Math.round(x)) < 1e-9 ? tn(Math.round(x)) : x.toFixed(2));
    const L1 = Bd.line(`V=e^3=${vT}\\text{ cm}^3`);
    const L2 = Bd.line(`e=${vT}^{1/3}=\\sqrt[3]{${vT}}${ex3 != null ? '=' : '\\approx'}\\mathbf{${d2(e)}}\\text{ cm}`);
    const L3 = Bd.line(`\\text{face}=e^2=\\left(${vT}^{1/3}\\right)^2=${vT}^{2/3}${ex3 != null ? '=' : '\\approx'}${d2(face)}\\text{ cm}^2`);
    const L4 = Bd.line(`SA=6\\left(${vT}^{2/3}\\right)${ex3 != null ? '=' : '\\approx'}\\mathbf{${ex3 != null ? tn(SA) : SA.toFixed(1)}}\\text{ cm}^2`);
    const er = Math.round(e * 10) / 10, warn = add(stage, h('div', 'cb-warn', `<b>Don’t round early!</b> ${tex(`6(${er})^2=${(6 * er * er).toFixed(2)}`)} <span class="red">✗</span> &nbsp;vs&nbsp; ${tex(`6\\left(${vT}^{2/3}\\right)\\approx${SA.toFixed(1)}`)} <span class="ok">✓</span>`), 380, 322);
    warn.style.width = (W - 410) + 'px'; hide(warn);
    const spin = (c, from, to, ms) => c.anim(cb, [{ transform: from }, { transform: to }], ms, { easing: 'ease-in-out' });
    const steps = [{
      cap: `A cube’s volume is edge × edge × edge: ${tex(`V=e^3`)}. This one holds <b>${fmt(V)} cm³</b>.`,
      run: (c) => Promise.all([spin(c, 'rotateX(-24deg) rotateY(-124deg)', T0, 900), showRow(c, stage, L1)])
    }, {
      cap: `The edge is the number that <b>cubes</b> to ${fmt(V)}: ${tex(`e=${vT}^{1/3}=\\sqrt[3]{${vT}}`)}` + (ex3 != null ? ` = <b>${ex3}</b> cm, because ${tex(`${ex3}^3=${vT}`)}.` : ` ≈ <b>${e.toFixed(4)}</b> cm. (${tex(`${Math.floor(e)}^3=${Math.floor(e) ** 3}`)} and ${tex(`${Math.floor(e) + 1}^3=${(Math.floor(e) + 1) ** 3}`)}, so it’s between ${Math.floor(e)} and ${Math.floor(e) + 1}.)`),
      run: async (c) => { faces[0].classList.add('edge'); await Promise.all([c.pop(elab, 400), showRow(c, stage, L2)]); }
    }, {
      cap: `One face is a square: ${tex(`e^2=\\left(${vT}^{1/3}\\right)^2=${vT}^{2/3}`)}` + (ex3 != null ? ` = ${d2(face)} cm².` : ` ≈ ${face.toFixed(2)} cm². The <b>denominator 3</b> is the cube root; the <b>numerator 2</b> squares it.`),
      run: async (c) => { faces[0].classList.add('lit'); await showRow(c, stage, L3); }
    }, {
      cap: `A cube has <b>6</b> faces, so ${tex(`SA=6\\left(${vT}^{2/3}\\right)`)}` + (ex3 != null ? ` = <b>${fmt(SA)} cm²</b>.` : ` ≈ <b>${SA.toFixed(1)} cm²</b> (to the nearest tenth).`),
      run: async (c) => {
        faces.forEach((f) => f.classList.add('lit'));
        await spin(c, T0, 'rotateX(-24deg) rotateY(326deg)', 800);
        await Promise.all([c.anim(sc, [{ opacity: 1 }, { opacity: 0 }], 300), c.anim(vlab, [{ opacity: 1 }, { opacity: 0 }], 300), c.anim(elab, [{ opacity: 1 }, { opacity: 0 }], 300),
          ...net.map((d, i) => c.pop(d, 300, { delay: 150 + i * 90 })), showRow(c, stage, L4)]);
      }
    }];
    if (ex3 == null) steps.push({
      cap: `<b>Watch out:</b> round the edge to ${er} first and you get ${tex(`6(${er})^2\\approx${(6 * er * er).toFixed(1)}`)}, which is wrong. Keep all the digits and round <b>once</b>, at the end.`,
      run: (c) => c.fadeIn(warn, 400)
    });
    return steps;
  }
};

/* ============ warm-up: the piano puzzle ============ */
const NOTES = ['A', 'A♯', 'B', 'C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A'];
let actx = null;
function tone(f, dur = 1.3, when = 0) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime + when, g = actx.createGain(); g.connect(actx.destination);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    [[1, 'triangle', 1], [2, 'sine', 0.35], [3, 'sine', 0.12]].forEach(([k, type, amp]) => {
      const o = actx.createOscillator(), og = actx.createGain(); o.type = type; o.frequency.value = f * k; og.gain.value = amp; o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + 0.05);
    });
  } catch (e) { /* no audio: the picture still works */ }
}
function mountPiano() {
  const host = document.getElementById('piano'); if (!host) return;
  const Wd = 968, w = Wd / 8, KY = 92, KH = 214, bw = 62, bh = 128, Hh = KY + KH + 58;
  const svg = svgEl('svg', { class: 'pn-svg', width: Wd, height: Hh, viewBox: `0 0 ${Wd} ${Hh}` }); host.appendChild(svg);
  const whites = [0, 2, 3, 5, 7, 8, 10, 12], blackAt = { 1: 1, 4: 3, 6: 4, 9: 6, 11: 7 }; // step → boundary
  const cx = []; whites.forEach((k, i) => { cx[k] = (i + 0.5) * w; }); for (const k in blackAt) cx[k] = blackAt[k] * w;
  const keys = [];
  const mk = (k, el) => { el.setAttribute('data-tap', ''); el.setAttribute('role', 'button'); el.setAttribute('aria-label', NOTES[k]); el.addEventListener('click', () => press(k)); keys[k] = el; svg.appendChild(el); };
  whites.forEach((k, i) => mk(k, svgEl('rect', { x: i * w + 1.5, y: KY, width: w - 3, height: KH, rx: 6, class: 'pn-w' + (k === 0 || k === 12 ? ' a' : '') })));
  whites.forEach((k, i) => { const t = svgEl('text', { x: (i + 0.5) * w, y: KY + KH - 18, class: 'pn-wl' }); t.textContent = NOTES[k]; svg.appendChild(t); });
  for (const k in blackAt) mk(Number(k), svgEl('rect', { x: blackAt[k] * w - bw / 2, y: KY, width: bw, height: bh, rx: 4, class: 'pn-b' + (Number(k) === 6 ? ' red' : '') }));
  const qm = svgEl('text', { x: cx[6], y: KY + 82, class: 'pn-q' }); qm.textContent = '?'; svg.appendChild(qm);
  // the ×r arrows over the twelve steps
  const arcs = [], nums = [];
  for (let k = 0; k < 12; k++) {
    const x1 = cx[k] + 8, x2 = cx[k + 1] - 8, y = KY - 8, mx = (x1 + x2) / 2;
    const p = svgEl('path', { d: `M${x1} ${y} Q${mx} ${y - 40} ${x2} ${y}`, class: 'pn-arc', 'marker-end': 'url(#pn-ah)' }); svg.appendChild(p); arcs.push(p);
    const t = svgEl('text', { x: mx, y: y - 30, class: 'pn-r' }); t.textContent = '×r'; svg.appendChild(t);
    const nb = svgEl('g', { class: 'pn-num' }); nb.appendChild(svgEl('circle', { cx: mx, cy: y - 64, r: 13 })); const nt = svgEl('text', { x: mx, y: y - 59 }); nt.textContent = k + 1; nb.appendChild(nt); svg.appendChild(nb); nums.push(nb);
  }
  const defs = svgEl('defs'); const mkr = svgEl('marker', { id: 'pn-ah', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' });
  mkr.appendChild(svgEl('path', { d: 'M0 0 L10 5 L0 10 z', class: 'pn-ahp' })); defs.appendChild(mkr); svg.prepend(defs);
  const lab = (x0, txt, cls, lw = 156) => { const x = Math.max(lw / 2 + 2, Math.min(Wd - lw / 2 - 2, x0)); const g = svgEl('g', { class: 'pn-lab ' + (cls || '') }); const r = svgEl('rect', { x: x - lw / 2, y: KY + KH + 12, width: lw, height: 38, rx: 8 }); const t = svgEl('text', { x, y: KY + KH + 38 }); t.textContent = txt; g.append(r, t); svg.appendChild(g); return g; };
  lab(cx[0], '440 Hz'); lab(cx[12], '880 Hz'); lab(cx[6], 'halfway: ? Hz', 'red', 230);
  const read = document.getElementById('pn-read');
  let revealed = false;
  const hz = (k) => 440 * 2 ** (k / 12);
  function readout(k) {
    const f = hz(k), head = `<b>${NOTES[k]}</b> <span class="muted">· ${k} step${k === 1 ? '' : 's'} up ·</span> `;
    if (k === 0 || k === 12) read.innerHTML = head + `<b>${k ? 880 : 440} Hz</b>`;
    else read.innerHTML = head + (revealed ? tex(`440\\times2^{${k}/12}\\approx${f.toFixed(1)}`) + ' Hz' : tex(`440\\times r^{${k}}`) + ' = <b>? Hz</b>');
  }
  function light(ks) { keys.forEach((el, k) => el && el.classList.toggle('on', ks.includes(k))); }
  function press(k) { tone(hz(k)); light([k]); readout(k); keys[k].animate([{ opacity: 0.6 }, { opacity: 1 }], 300); }
  let counting = 0;
  async function count() {
    const g = ++counting; nums.forEach((n) => n.classList.remove('on')); arcs.forEach((a) => a.classList.remove('on'));
    press(0);
    for (let k = 0; k < 12; k++) {
      await new Promise((r) => setTimeout(r, 420)); if (g !== counting) return;
      arcs[k].classList.add('on'); nums[k].classList.add('on'); press(k + 1);
    }
    read.innerHTML = `<b>12 steps</b> from A to A, so <span class="tex-i">${tex('r^{12}=2')}</span>`;
  }
  document.getElementById('pn-count').onclick = count;
  document.getElementById('pn-play').onclick = () => { tone(440, 1.2); tone(880, 1.2, 0.7); tone(440, 1.6, 1.5); tone(880, 1.6, 1.5); light([0, 12]); read.innerHTML = '<b>A 440 Hz</b> then <b>A 880 Hz</b>: one octave up <b>doubles</b> the frequency.'; };
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => {
    const wq = b.closest('.wq'), on = wq.classList.toggle('shown');
    if (!on) return;
    const v = b.dataset.wq;
    if (v === 'count') count();
    else { const ks = v.split(',').map(Number); light(ks); if (ks.length === 1) { tone(hz(ks[0])); readout(ks[0]); } }
  }));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => {
    const p = b.closest('.poll'), on = p.classList.toggle('revealed');
    revealed = on; qm.textContent = on ? '622' : '?'; qm.classList.toggle('done', on);
    svg.querySelector('.pn-lab.red text').textContent = on ? 'halfway: ≈ 622 Hz' : 'halfway: ? Hz';
    if (on) { light([6]); tone(hz(6)); readout(6); }
  }));
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { whyRoot, routes, machine, minus, conv1, conv2, toPow, cube };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountPiano(); mountExplainers();
