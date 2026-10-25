/* Math 10C · Unit 1 · Lesson 7 — Entire and Mixed Radicals: the explainers and warm-up on this page. */
import { h, fmt, Explainer, factors, primeFactors } from '../explain.js';
import { tex } from '../tex.js';
import { standup } from '../standup.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

/* KaTeX, allowing \htmlClass / \htmlData (tappable blanks, and tokens that fly from one line to the next) */
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};

/* ---------- number helpers ---------- */
const tn = (n) => fmt(n).replace(/ /g, '\\,'); // 3 125 → 3\,125 in LaTeX
const R = (n) => `\\sqrt{${tn(n)}}`;
function sqPart(n) { let s = 1; for (let k = 2; k * k <= n; k++) if (n % (k * k) === 0) s = k; return { s, r: n / (s * s) }; }
const mixT = (s, r) => (r === 1 ? tn(s) : s === 1 ? R(r) : `${tn(s)}${R(r)}`);
const isSq = (n) => n >= 0 && Number.isInteger(Math.sqrt(n));
const dec = (x, d = 3) => { if (x < 0) return '−' + dec(-x, d); if (Math.abs(x - Math.round(x)) < 1e-9) return fmt(Math.round(x)); return x.toFixed(d) + '…'; };
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function Q(p, q = 1) { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return { p: p / g, q: q / g }; }
function parseCoef(s) { // '5', '-7', '2/3', '0.6'
  s = String(s); let r, isDec = false;
  if (s.includes('/')) { const [a, b] = s.split('/').map(Number); r = Q(a, b); }
  else if (s.includes('.')) { isDec = true; const d = s.split('.')[1].length; r = Q(Math.round(Number(s) * 10 ** d), 10 ** d); }
  else r = Q(Number(s), 1);
  return { p: r.p, q: r.q, dec: isDec, src: s, val: r.p / r.q };
}
const qT = (r) => { const neg = r.p < 0, p = Math.abs(r.p); return (neg ? '-' : '') + (r.q === 1 ? tn(p) : `\\tfrac{${p}}{${r.q}}`); };
const coefT = (c) => (c.val === 1 ? '' : c.val === -1 ? '-' : c.dec ? c.src : qT(c)); // LaTeX for a coefficient written in front of a root
const absCoefT = (c) => (c.dec ? c.src.replace('-', '') : qT({ p: Math.abs(c.p), q: c.q }));

/* ---------- drawing helpers ---------- */
function chain(stage, parts, x, y, o = {}) { // a row of LaTeX pieces that can be revealed one at a time without reflowing
  const row = add(stage, h('div', 'l6-chain' + (o.cls ? ' ' + o.cls : '')), x, y);
  if (o.fs) row.style.fontSize = o.fs + 'px';
  const els = parts.map((p) => { const e = h('span', 'l6-piece', K(p)); row.appendChild(e); return e; });
  return { row, els };
}
async function fly(c, stage, from, to, src, o = {}) { // a copy of `src` flies from one token to another
  if (!to) return;
  if (c.fast || !from) { to.style.opacity = 1; return; }
  c.check();
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const ax = (a.left + a.width / 2 - sr.left) / k, ay = (a.top + a.height / 2 - sr.top) / k;
  const bx = (b.left + b.width / 2 - sr.left) / k, by = (b.top + b.height / 2 - sr.top) / k;
  const g = add(stage, h('div', 'wk-fly c', K(src)), ax, ay); if (o.fs) g.style.fontSize = o.fs + 'px';
  g.style.opacity = 0;
  try {
    await c.anim(g, [{ opacity: 1, transform: 'translate(0,0) scale(1.15)' }, { opacity: 1, transform: `translate(${(bx - ax) / 2}px, ${(by - ay) / 2 - 18}px) scale(1.25)`, offset: 0.5 }, { opacity: 1, transform: `translate(${bx - ax}px, ${by - ay}px) scale(1)` }], o.ms || 800, { delay: o.delay || 0 });
  } finally { g.remove(); }
  to.style.opacity = 1;
}
function board(stage, o) { // written work: one LaTeX line per row, with a short note beside it
  const rows = [];
  return {
    rows,
    line(src, note) {
      const y = o.y + rows.length * o.lh;
      const el = add(stage, h('div', 'wk-line', K(src)), o.x, y); el.style.fontSize = o.fs + 'px'; el.style.height = (o.lh - 6) + 'px';
      let n = null;
      if (note != null) { n = add(stage, h('div', 'wk-note', `<div>${note}</div>`), o.nx, y); n.style.width = o.nw + 'px'; n.style.height = (o.lh - 6) + 'px'; }
      hide(el, n); const r = { el, n, q: (s) => el.querySelector(s) }; rows.push(r); return r;
    }
  };
}
async function showRow(c, stage, row, flights = [], fs) {
  flights.forEach((f) => { if (f[1]) f[1].style.opacity = 0; });
  const jobs = [c.anim(row.el, [{ opacity: 0 }, { opacity: 1 }], 380)];
  if (row.n) jobs.push(c.fadeIn(row.n, 380, { delay: 150, from: 'translateX(10px)' }));
  flights.forEach(([a, b, src], i) => jobs.push(fly(c, stage, a, b, src, { fs, delay: 150 + i * 120 })));
  await Promise.all(jobs);
}
function radSign(stage, x, y, w, ht, cls) { // a hand-drawn root sign whose bar spans w px
  const s = add(stage, svgEl('svg', { class: 'l6-rad ' + (cls || ''), width: w + 4, height: ht + 4 }), x, y);
  s.appendChild(svgEl('path', { d: `M2 ${ht * 0.6} L11 ${ht * 0.5} L24 ${ht} L40 3 L${w} 3` }));
  return s;
}

/* ============ 1. Splitting a root: every factor pair works ============ */
const split = {
  title: 'Splitting a root: which split is sensible?',
  height: 430,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 72, label: tex('\\sqrt{72}') }, { v: 48, label: tex('\\sqrt{48}') }, { v: 100, label: tex('\\sqrt{100}') }, { v: 30, label: tex('\\sqrt{30}') },
    { sep: 'Example 1 check:' }, { v: 63, label: tex('\\sqrt{63}') }, { v: 32, label: tex('\\sqrt{32}') }, { v: '17/9', label: tex('\\sqrt{\\tfrac{17}{9}}') }],
  custom: [4, 200],
  intro: (v) => (String(v).includes('/') ? `How can we split ${tex(`\\sqrt{\\tfrac{${v.split('/')[0]}}{${v.split('/')[1]}}}`)} into two square roots? It’s a <b>fraction</b>, so this is a job for the <b>quotient rule</b>.`
    : `Split ${tex(R(v))} into a <b>product of two square roots</b>. Every <b>factor pair</b> of ${v} gives one way to do it.`),
  make(stage, v, ex) {
    const W = ex.W, H = 430;
    if (String(v).includes('/')) return splitFrac(stage, v, W, H);
    const n = Number(v), pairs = factors(n).filter((d) => d * d <= n).map((d) => [d, n / d]);
    const P = pairs.length, rh = Math.min(48, 320 / P), fs = Math.min(28, rh * 0.6);
    add(stage, h('div', 'sp-head', K(`${R(n)}=\\;?`)), 36, 14);
    const useful = (a, b) => a > 1 && (isSq(a) || isSq(b));
    const rows = pairs.map(([a, b], i) => {
      const row = add(stage, h('div', 'sp-row', K(`=${R(a)}\\times${R(b)}`)), 70, 82 + i * rh); row.style.fontSize = fs + 'px'; row.style.height = rh + 'px';
      let note;
      if (a === 1) note = `<span class="muted">${tex('\\sqrt{1}=1')}: no help</span>`;
      else if (isSq(a) && isSq(b)) note = K(`=${Math.sqrt(a)}\\times${Math.sqrt(b)}=${Math.sqrt(n)}`);
      else if (isSq(b)) note = K(`=${mixT(Math.sqrt(b), a)}`);
      else if (isSq(a)) note = K(`=${mixT(Math.sqrt(a), b)}`);
      const ne = h('span', 'sp-note', note || ''); row.appendChild(ne); hide(row, ne);
      return { row, ne, a, b, good: useful(a, b) };
    });
    const box1 = add(stage, h('div', 'sp-box'), W * 0.56, 84); box1.style.width = (W * 0.44 - 30) + 'px';
    const box2 = add(stage, h('div', 'sp-box best'), W * 0.56, 250); box2.style.width = (W * 0.44 - 30) + 'px';
    hide(box1, box2);
    const goods = rows.filter((x) => x.good);
    const { s, r } = sqPart(n);
    const chk = rows.find((x) => x.a > 1 && !isSq(x.a) && !isSq(x.b)) || rows[Math.floor(P / 2)] || rows[0];
    const steps = [{
      cap: P > 1 ? `${n} has <b>${P} factor pairs</b>, so there are ${P} ways to split ${tex(R(n))}. <b>All of them are true</b>: that’s the product rule.`
        : `${n} is prime: its only factor pair is 1 × ${n}. ${tex(`${R(n)}=\\sqrt{1}\\times${R(n)}`)} is true, but it doesn’t help at all.`,
      run: (c) => Promise.all(rows.map((x, i) => c.fadeIn(x.row, 360, { delay: i * 140, from: 'translateX(-14px)' })))
    }, {
      cap: `Check one with a calculator: ${tex(`${R(chk.a)}\\times${R(chk.b)}`)} ≈ ${dec(Math.sqrt(chk.a))} × ${dec(Math.sqrt(chk.b))} ≈ ${dec(Math.sqrt(n))}. That’s ${tex(R(n))} ≈ ${dec(Math.sqrt(n))}, the same number.`,
      run: async (c) => {
        box1.innerHTML = `<div class="sp-box-h">Calculator check</div>${K(`${R(chk.a)}\\times${R(chk.b)}`)} ≈ ${dec(Math.sqrt(chk.a))} × ${dec(Math.sqrt(chk.b))}<br>≈ <b>${dec(Math.sqrt(n))}</b><br>${K(R(n))} ≈ <b>${dec(Math.sqrt(n))}</b> <b class="ok">✓</b>`;
        chk.row.classList.add('pick');
        await c.fadeIn(box1, 400);
      }
    }];
    if (P > 1) steps.push({
      cap: goods.length ? `The <b>sensible</b> splits use a <b>perfect square</b> (${goods.map((g) => (isSq(g.b) ? g.b : g.a)).join(', ')}). Its root comes out as a <b>whole number</b>, so the radical gets simpler.`
        : `None of these splits uses a perfect square bigger than 1, so ${tex(R(n))} <b>can’t be simplified</b>. It stays as it is.`,
      run: async (c) => {
        chk.row.classList.remove('pick');
        rows.forEach((x) => x.row.classList.add(x.good ? 'good' : 'dim'));
        await Promise.all(rows.map((x, i) => (x.good || x.a === 1 ? c.fadeIn(x.ne, 380, { delay: i * 120, from: 'translateX(-8px)' }) : Promise.resolve())));
      }
    });
    if (goods.length) steps.push({
      cap: r === 1 ? `${n} is itself a perfect square, so the best “split” is no split at all: ${tex(`${R(n)}=${s}`)}.`
        : `The <b>largest</b> perfect square, <b>${s * s}</b>, leaves the smallest number under the root: ${tex(`${R(n)}=${R(s * s)}\\times${R(r)}=${mixT(s, r)}`)}. That’s Section 3!`,
      run: async (c) => {
        const best = rows.find((x) => x.a === r && x.b === s * s) || rows.find((x) => x.b === r && x.a === s * s) || rows.find((x) => isSq(x.a) && isSq(x.b));
        rows.forEach((x) => x.row.classList.toggle('best', x === best));
        box2.innerHTML = `<div class="sp-box-h">Simplest</div>` + K(r === 1 ? `${R(n)}=${s}` : `${R(n)}=${mixT(s, r)}`);
        await Promise.all([best ? c.pop(best.row, 420) : null, c.pop(box2, 450)]);
      }
    });
    return steps;
  }
};
function splitFrac(stage, v, W, H) {
  const [a, b] = v.split('/').map(Number), kb = Math.sqrt(b), { s, r } = sqPart(a);
  const ch = chain(stage, [`\\sqrt{\\dfrac{${a}}{${b}}}`, '=', `\\dfrac{${R(a)}}{${R(b)}}`, '=', `\\dfrac{${mixT(s, r)}}{${kb}}`], W / 2, 70, { fs: 44 });
  ch.row.style.translate = '-50% 0';
  ch.els.slice(1).forEach((e) => hide(e));
  const n1 = add(stage, h('div', 'sp-tag', 'quotient rule'), 0, 0), n2 = add(stage, h('div', 'sp-tag', `${tex(R(b))} = ${kb}`), 0, 0);
  hide(n1, n2);
  const box = add(stage, h('div', 'sp-box'), W / 2, 300); box.style.width = '620px'; box.style.translate = '-50% 0'; hide(box);
  const place = (tag, el) => { const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, r0 = el.getBoundingClientRect(), rb = ch.els[2].getBoundingClientRect(); at(tag, (r0.left + r0.width / 2 - sr.left) / k, (Math.max(r0.bottom, rb.bottom) - sr.top) / k + 14); tag.style.translate = '-50% 0'; };
  return [{
    cap: `<b>Quotient rule:</b> the root of a fraction is the root of the top over the root of the bottom.`,
    run: async (c) => { place(n1, ch.els[2]); await Promise.all([c.fadeIn(ch.els[1], 250), c.fadeIn(ch.els[2], 450, { delay: 150 }), c.fadeIn(n1, 350, { delay: 350 })]); }
  }, {
    cap: `${b} is a perfect square, so ${tex(`${R(b)}=${kb}`)}. ${s > 1 ? `And ${tex(`${R(a)}=${mixT(s, r)}`)}.` : `${a} has no perfect-square factor, so ${tex(R(a))} stays.`}`,
    run: async (c) => { place(n2, ch.els[4]); await Promise.all([c.fadeIn(ch.els[3], 250), c.fadeIn(ch.els[4], 450, { delay: 150 }), c.fadeIn(n2, 350, { delay: 350 })]); }
  }, {
    cap: `Check with decimals: both sides are about <b>${dec(Math.sqrt(a / b))}</b>`,
    run: async (c) => {
      box.innerHTML = `<div class="sp-box-h">Calculator check</div>${K(`\\sqrt{\\tfrac{${a}}{${b}}}=\\sqrt{${dec(a / b).replace('…', '\\ldots')}}`)} ≈ <b>${dec(Math.sqrt(a / b))}</b><br>${K(`\\dfrac{${mixT(s, r)}}{${kb}}`)} ≈ ${dec(s * Math.sqrt(r))} ÷ ${kb} ≈ <b>${dec(Math.sqrt(a / b))}</b> <b class="ok">✓</b>`;
      await c.fadeIn(box, 400);
    }
  }];
}

/* ============ 2. What a mixed radical means: cut the square ============ */
const area = {
  title: 'Cut the square into equal squares',
  height: 440,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 50, label: tex('\\sqrt{50}') }, { v: 18, label: tex('\\sqrt{18}') }, { v: 12, label: tex('\\sqrt{12}') }, { v: 36, label: tex('\\sqrt{36}') }, { v: 30, label: tex('\\sqrt{30}') },
    { sep: 'Notes:' }, { v: 180, label: tex('\\sqrt{180}') }, { sep: 'Example 2 check:' }, { v: 72, label: tex('\\sqrt{72}') }, { v: 63, label: tex('\\sqrt{63}') }, { v: 288, label: tex('\\sqrt{288}') }],
  custom: [2, 999],
  intro: (n) => `A square has area <b>${fmt(n)}</b>. How long is its side? And what does that side look like as a <b>mixed radical</b>?`,
  make(stage, n, ex) {
    const W = ex.W, L = 320, x0 = 110, y0 = 28, { s, r } = sqPart(n), S = s * s, cell = L / s;
    const sqd = add(stage, h('div', 'ar-sq'), x0, y0); sqd.style.width = sqd.style.height = L + 'px';
    const areaL = add(stage, h('div', 'ar-area c', `Area = <b>${fmt(n)}</b>`), x0 + L / 2, y0 + L / 2);
    const sideL = add(stage, h('div', 'ar-side', K(R(n))), x0 - 14, y0 + L / 2); sideL.style.translate = '-100% -50%'; hide(sideL);
    const svg = add(stage, svgEl('svg', { class: 'ar-grid', width: L, height: L }), x0, y0);
    const lines = [];
    for (let i = 1; i < s; i++) {
      lines.push(svg.appendChild(svgEl('line', { x1: i * cell, y1: 0, x2: i * cell, y2: L })));
      lines.push(svg.appendChild(svgEl('line', { x1: 0, y1: i * cell, x2: L, y2: i * cell })));
    }
    lines.forEach((l) => (l.style.opacity = 0));
    const nums = [];
    if (s > 1 && cell >= 40) for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) { const e = add(stage, h('div', 'ar-num c', fmt(r)), x0 + (j + 0.5) * cell, y0 + (i + 0.5) * cell); e.style.fontSize = Math.min(22, cell * 0.36) + 'px'; hide(e); nums.push(e); }
    const hc = add(stage, h('div', 'ar-cell'), x0, y0); hc.style.width = hc.style.height = cell + 'px'; hide(hc);
    const hcl = add(stage, h('div', 'ar-clab', K(r === 1 ? '1' : R(r))), x0 + cell / 2, y0 - 4); hcl.style.translate = '-50% -100%'; hide(hcl);
    const segs = [], segl = [];
    for (let i = 0; i < s; i++) {
      const g = add(stage, h('div', 'ar-seg' + (i % 2 ? ' b' : '')), x0 + i * cell + 1.5, y0 + L + 10); g.style.width = (cell - 3) + 'px'; hide(g); segs.push(g);
      if (cell >= 50 && s > 1) { const t = add(stage, h('div', 'ar-segl', K(r === 1 ? '1' : R(r))), x0 + (i + 0.5) * cell, y0 + L + 26); t.style.translate = '-50% 0'; hide(t); segl.push(t); }
    }
    const B = board(stage, { x: x0 + L + 70, y: 34, lh: 62, fs: 27 });
    const l1 = B.line(`\\text{side}=${R(n)}${isSq(n) ? '=' : '\\approx'}${dec(Math.sqrt(n)).replace('…', '\\ldots')}`);
    const steps = [{
      cap: `This square has area <b>${fmt(n)}</b>. Its side is the number that squares to ${fmt(n)}: <b>${tex(R(n))}</b> ${isSq(n) ? '=' : '≈'} ${dec(Math.sqrt(n))}.`,
      run: (c) => Promise.all([c.fadeIn(sideL, 400, { from: 'translateX(10px)' }), showRow(c, stage, l1)])
    }];
    if (s === 1) {
      const l2 = B.line(`${n}=${primeFactors(n).join('\\times')}`), l3 = B.line(`\\text{no perfect-square factor}`);
      steps.push({
        cap: `No perfect square bigger than 1 divides ${n} (${n} = ${primeFactors(n).join(' × ')}), so we can’t cut equal smaller squares with a whole number along each side. <b>${tex(R(n))} is already simplest.</b>`,
        run: async (c) => { await showRow(c, stage, l2); await showRow(c, stage, l3); }
      });
      return steps;
    }
    const l2 = B.line(r === 1 ? `${n}=${s}\\times${s}` : `${n}=${S}\\times${r}`);
    const l3 = B.line(r === 1 ? `\\text{small side}=1` : `\\text{small side}=${R(r)}`);
    const l4 = B.line(r === 1 ? `\\text{side}=${s}\\times1=${s}` : `\\text{side}=${s}\\times${R(r)}=${mixT(s, r)}`);
    const res = add(stage, h('div', 'ar-res', K(r === 1 ? `${R(n)}=${s}` : `${R(n)}=${mixT(s, r)}`)), x0 + L + 70, 300); hide(res);
    steps.push({
      cap: r === 1 ? `${n} = ${s} × ${s}. Cut the square into a ${s} by ${s} grid: <b>${n} small squares</b>, each with area <b>1</b>.`
        : `${fmt(n)} = ${S} × ${r}. Cut the square into a ${s} by ${s} grid: <b>${S} small squares</b>, each with area <b>${r}</b>.`,
      run: async (c) => {
        await Promise.all([c.anim(areaL, [{ opacity: 1 }, { opacity: 0 }], 300), showRow(c, stage, l2), ...lines.map((l, i) => c.anim(l, [{ opacity: 0 }, { opacity: 1 }], 300, { delay: 120 + i * 40 }))]);
        await Promise.all(nums.map((e, i) => c.pop(e, 260, { delay: Math.min(i * 18, 500) })));
      }
    }, {
      cap: r === 1 ? 'Each small square has area 1, so each small side is <b>1</b>.' : `Each small square has area ${r}, so its side is <b>${tex(R(r))}</b> ≈ ${dec(Math.sqrt(r))}.`,
      run: (c) => Promise.all([c.fadeIn(hc, 350), c.pop(hcl, 400, { delay: 200 }), showRow(c, stage, l3)])
    }, {
      cap: r === 1 ? `Along the bottom edge sit <b>${s}</b> small sides, so the side is exactly <b>${s}</b>.`
        : `Along the bottom edge sit <b>${s}</b> small sides: ${tex(R(r))} + ${tex(R(r))} + … So the side is <b>${tex(mixT(s, r))}</b>: “${s} copies of ${tex(R(r))}”.`,
      run: async (c) => {
        await Promise.all(segs.map((g, i) => c.pop(g, 300, { delay: i * Math.min(150, 1400 / s) })).concat(segl.map((t, i) => c.fadeIn(t, 280, { delay: 80 + i * Math.min(150, 1400 / s) }))));
        await showRow(c, stage, l4);
      }
    }, {
      cap: r === 1 ? `${tex(`${R(n)}=${s}`)}: ${n} is a perfect square, so its root is a whole number.`
        : `Same side, two names: <b>${tex(`${R(n)}=${mixT(s, r)}`)}</b>. The <b>entire radical</b> and the <b>mixed radical</b> are the same number: ${s}&nbsp;×&nbsp;${dec(Math.sqrt(r))} ≈ ${dec(Math.sqrt(n))}.`,
      run: (c) => c.pop(res, 480)
    });
    return steps;
  }
};

/* ============ 3. Find the largest perfect square ============ */
const finder = {
  title: 'Find the largest perfect square',
  height: 470,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 200, label: tex('\\sqrt{200}') }, { v: 48, label: tex('\\sqrt{48}') }, { v: 180, label: tex('\\sqrt{180}') }, { v: 70, label: tex('\\sqrt{70}') },
    { sep: 'Examples 2–3 check:' }, { v: 72, label: tex('\\sqrt{72}') }, { v: 63, label: tex('\\sqrt{63}') }, { v: 288, label: tex('\\sqrt{288}') }, { v: 128, label: tex('\\sqrt{128}') }, { v: 252, label: tex('\\sqrt{252}') }],
  custom: [4, 999],
  intro: (n) => `Which perfect squares divide <b>${fmt(n)}</b>? The <b>biggest</b> one is the one we want.`,
  make(stage, n, ex) {
    const W = ex.W, { s, r } = sqPart(n), S = s * s;
    const ks = []; for (let k = 2; k * k <= n / 2; k++) ks.push(k);
    if (isSq(n) && n >= 4 && !ks.includes(Math.sqrt(n))) ks.push(Math.sqrt(n));
    add(stage, h('div', 'fs-head', `${K(R(n))} &nbsp;Which perfect squares divide ${fmt(n)}?`), 24, 12);
    const per = 11, tw = 74, gap = 10, rows = Math.max(1, Math.ceil(ks.length / per));
    const tiles = ks.map((k, i) => {
      const row = Math.floor(i / per), inRow = Math.min(per, ks.length - row * per), x = (W - (inRow * (tw + gap) - gap)) / 2 + (i % per) * (tw + gap), y = 72 + row * 92;
      const t = add(stage, h('div', 'fs-tile', `<b>${fmt(k * k)}</b><small>${k}<sup>2</sup></small>`), x, y); t.style.width = tw + 'px';
      const ok = n % (k * k) === 0, lab = add(stage, h('div', 'fs-res ' + (ok ? 'ok' : 'red'), ok ? '× ' + fmt(n / (k * k)) : '✗'), x + tw / 2, y + 64); lab.style.translate = '-50% 0';
      hide(t, lab); return { k, sq: k * k, t, lab, ok };
    });
    const works = tiles.filter((t) => t.ok), cy = 72 + rows * 92 + 10;
    const steps = [{
      cap: ks.length ? `List the perfect squares: ${ks.slice(0, 4).map((k) => k * k).join(', ')}, … A square bigger than <b>half of ${fmt(n)}</b> can’t divide it${isSq(n) ? `, except ${fmt(n)} itself` : ''}, so these are all we need.`
        : `There are no perfect squares (other than 1) small enough to divide ${n}.`,
      run: (c) => Promise.all(tiles.map((t, i) => c.pop(t.t, 320, { delay: i * 60 })))
    }];
    if (!ks.length) return steps;
    steps.push({
      cap: works.length ? `Test each one: does it divide ${fmt(n)} evenly? ${works.map((w) => `<b>${fmt(w.sq)}</b> ✓`).join(', ')}. Under each ✓ is its partner: ${fmt(n)} = ${fmt(works[0].sq)} × ${fmt(n / works[0].sq)}.`
        : `Test each one: <b>none</b> of them divide ${fmt(n)} evenly.`,
      run: async (c) => {
        for (const t of tiles) { t.t.classList.add(t.ok ? 'yes' : 'no'); await Promise.all([c.pop(t.lab, 220), c.anim(t.t, [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], 220)]); await c.sleep(40); }
      }
    });
    if (!works.length) {
      const stamp = add(stage, h('div', 'fs-stamp', `ALREADY SIMPLEST<small>${K(R(n))} has no perfect-square factor</small>`), W / 2, cy + 40); stamp.style.translate = '-50% 0'; hide(stamp);
      steps.push({
        cap: `No perfect square divides ${fmt(n)}${n < 1000 ? ` (${fmt(n)} = ${primeFactors(n).join(' × ')})` : ''}, so ${tex(R(n))} is <b>already in simplest form</b>.`,
        run: (c) => c.anim(stamp, [{ opacity: 0, transform: 'scale(1.6) rotate(-10deg)' }, { opacity: 1, transform: 'scale(1) rotate(-3deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' })
      });
      return steps;
    }
    const best = works[works.length - 1];
    steps.push({
      cap: `The <b>largest</b> perfect square that divides ${fmt(n)} is <b>${fmt(S)}</b> = ${s}<sup>2</sup>. Use that one.`,
      run: async (c) => { works.forEach((w) => w !== best && w.t.classList.add('meh')); best.t.classList.add('best'); await c.anim(best.t, [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1.12)' }], 500); }
    });
    const parts = r === 1 ? [R(n), '=', `\\mathbf{${s}}`] : [R(n), '=', `\\sqrt{${tn(S)}\\times${tn(r)}}`, '=', `${R(S)}\\times${R(r)}`, '=', `\\mathbf{${mixT(s, r)}}`];
    const ch = chain(stage, parts, 40, cy, { fs: 32 }); ch.els.forEach((e) => hide(e));
    steps.push({
      cap: r === 1 ? `${fmt(n)} is itself a perfect square: ${tex(`${R(n)}=${s}`)} exactly.` : `Split off ${fmt(S)}: ${tex(`${R(n)}=\\sqrt{${tn(S)}\\times${tn(r)}}=${R(S)}\\times${R(r)}`)}, and ${tex(`${R(S)}=${s}`)} comes out in front: <b>${tex(mixT(s, r))}</b>.`,
      run: async (c) => { for (const e of ch.els) await c.fadeIn(e, 300); }
    });
    if (works.length > 1) {
      const w = works[0], k = w.k, m = n / w.sq, s2 = s / k;
      const warn = add(stage, h('div', 'fs-warn'), 40, cy + 70); warn.style.width = (W - 80) + 'px';
      warn.innerHTML = `<div class="fs-warn-h">What if you used a smaller square, like ${fmt(w.sq)}?</div>
        <div class="fs-warn-b"><span>${K(`${R(n)}=${R(w.sq)}\\times${R(m)}=${k}${R(m)}`)}</span><span class="red">but ${fmt(m)} = ${fmt(s2 * s2)} × ${r} still has a square inside!</span></div>
        <div class="fs-warn-b"><span>Go again: ${K(`${k}${R(m)}=${k}\\times${mixT(s2, r)}=${mixT(s, r)}`)}</span><span class="muted">same answer, more work</span></div>`;
      hide(warn);
      steps.push({
        cap: `<b>Watch out:</b> start with a smaller square like ${fmt(w.sq)} and you get ${tex(`${k}${R(m)}`)}, but ${fmt(m)} still contains ${fmt(s2 * s2)}. You must <b>go again</b>. Use the <b>largest</b> square and it’s one step.`,
        run: (c) => c.fadeIn(warn, 450)
      });
    }
    return steps;
  }
};

/* ============ 3. Pair up the primes ============ */
const PAIRC = ['#e0574b', '#3b78d8', '#2f9e6a', '#8a58c9', '#e8932a', '#d0477a'];
const pairs = {
  title: 'Prime factors: each pair comes out as one number',
  height: 450,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 72, label: tex('\\sqrt{72}') }, { v: 180, label: tex('\\sqrt{180}') }, { v: 200, label: tex('\\sqrt{200}') }, { v: 540, label: tex('\\sqrt{540}') },
    { sep: 'Examples 2–3 check:' }, { v: 63, label: tex('\\sqrt{63}') }, { v: 288, label: tex('\\sqrt{288}') }, { v: 128, label: tex('\\sqrt{128}') }, { v: 252, label: tex('\\sqrt{252}') }],
  custom: [4, 9999],
  intro: (n) => `Write <b>${fmt(n)}</b> as a product of primes. Every <b>pair</b> of matching primes is a perfect square, so it can leave the root.`,
  make(stage, n, ex) {
    const W = ex.W, ps = primeFactors(n), pr = [], left = [];
    for (let i = 0; i < ps.length;) { if (ps[i] === ps[i + 1]) { pr.push([i, i + 1]); i += 2; } else { left.push(i); i++; } }
    const cw = (p) => Math.max(50, 22 + String(p).length * 15), sepW = 30, ch = 50;
    const { s, r } = sqPart(n);
    // row 1: √n = √(p × p × …)
    const y1 = 46, lab1 = add(stage, h('div', 'pp-lab', K(`${R(n)}=`)), 0, y1 + 4);
    const innerW = ps.reduce((a, p) => a + cw(p), 0) + (ps.length - 1) * sepW;
    const tot = lab1.offsetWidth + 10 + 48 + innerW + 14, x1 = (W - tot) / 2; at(lab1, x1, y1 + 4);
    const rx1 = x1 + lab1.offsetWidth + 10; radSign(stage, rx1, y1 - 12, 48 + innerW + 14, ch + 18);
    let cx = rx1 + 48;
    const chips = ps.map((p, i) => {
      const e = add(stage, h('div', 'pp-chip', fmt(p)), cx, y1); e.style.width = cw(p) + 'px'; e._x = cx; cx += cw(p);
      if (i < ps.length - 1) { add(stage, h('div', 'pp-x', '×'), cx, y1); cx += sepW; }
      hide(e); return e;
    });
    const seps1 = [...stage.querySelectorAll('.pp-x')]; hide(...seps1);
    const brs = pr.map(([i, j], k) => {
      const b = add(stage, h('div', 'pp-br'), chips[i]._x + 4, y1 + ch + 4); b.style.width = (chips[j]._x + cw(ps[j]) - chips[i]._x - 8) + 'px'; b.style.borderColor = PAIRC[k % PAIRC.length];
      const t = add(stage, h('div', 'pp-brl', K(`${ps[i]}\\times${ps[i]}=${ps[i] * ps[i]}`)), chips[i]._x + (chips[j]._x + cw(ps[j]) - chips[i]._x) / 2, y1 + ch + 22); t.style.translate = '-50% 0'; t.style.color = PAIRC[k % PAIRC.length];
      hide(b, t); return { b, t };
    });
    // row 2: = outside × outside √(leftovers)
    const y2 = 214, outs = pr.map(([i]) => ps[i]), lefts = left.map((i) => ps[i]);
    const outW = outs.reduce((a, p) => a + cw(p), 0) + Math.max(0, outs.length - 1) * sepW;
    const inW = lefts.reduce((a, p) => a + cw(p), 0) + Math.max(0, lefts.length - 1) * sepW;
    const eq2 = add(stage, h('div', 'pp-lab', K('=')), 0, y2 + 4);
    const tot2 = 36 + outW + (lefts.length ? 12 + 48 + inW + 14 : 0); let x2 = (W - tot2) / 2; at(eq2, x2, y2 + 4); x2 += 36;
    const outEls = outs.map((p, k) => {
      const e = add(stage, h('div', 'pp-chip out', fmt(p)), x2, y2); e.style.width = cw(p) + 'px'; e.style.borderColor = e.style.color = PAIRC[k % PAIRC.length]; x2 += cw(p);
      let xs = null; if (k < outs.length - 1) { xs = add(stage, h('div', 'pp-x', '×'), x2, y2); x2 += sepW; }
      hide(e, xs); return { e, xs };
    });
    let rad2 = null; const leftEls = [];
    if (lefts.length) {
      x2 += 12; rad2 = radSign(stage, x2, y2 - 12, 48 + inW + 14, ch + 18); hide(rad2); x2 += 48;
      lefts.forEach((p, k) => { const e = add(stage, h('div', 'pp-chip', fmt(p)), x2, y2); e.style.width = cw(p) + 'px'; x2 += cw(p); let xs = null; if (k < lefts.length - 1) { xs = add(stage, h('div', 'pp-x', '×'), x2, y2); x2 += sepW; } hide(e, xs); leftEls.push({ e, xs }); });
    }
    hide(eq2);
    const res = add(stage, h('div', 'pp-res', K(`${R(n)}=${r === 1 ? s : mixT(s, r)}`)), W / 2, 330); res.style.translate = '-50% 0'; hide(res);
    const pT = ps.join(' × ');
    const steps = [{
      cap: `Write ${fmt(n)} as a product of primes (ladder or tree, like Lesson 1): ${fmt(n)} = ${pT}.`,
      run: async (c) => { await Promise.all([...chips.map((e, i) => c.pop(e, 320, { delay: i * 90 })), ...seps1.map((e, i) => c.fadeIn(e, 200, { delay: 60 + i * 90 }))]); }
    }];
    if (!pr.length) {
      steps.push({ cap: `No prime appears <b>twice</b>, so there are no pairs and nothing can come out. ${tex(R(n))} is <b>already simplest</b>.`, run: (c) => Promise.all(chips.map((e) => c.shake(e))) });
      return steps;
    }
    steps.push({
      cap: `<b>Pair up</b> matching primes. Each pair is a perfect square: ${pr.map(([i]) => `${ps[i]} × ${ps[i]} = ${ps[i] * ps[i]}`).join(', ')}.${lefts.length ? ` ${lefts.join(' × ')} ${lefts.length > 1 ? 'have' : 'has'} no partner.` : ''}`,
      run: async (c) => {
        pr.forEach(([i, j], k) => { [chips[i], chips[j]].forEach((e) => { e.style.borderColor = PAIRC[k % PAIRC.length]; e.style.background = PAIRC[k % PAIRC.length] + '1f'; }); });
        left.forEach((i) => chips[i].classList.add('lone'));
        await Promise.all(brs.flatMap(({ b, t }, k) => [c.fadeIn(b, 300, { delay: k * 220 }), c.fadeIn(t, 300, { delay: 100 + k * 220 })]));
      }
    }, {
      cap: `Each pair leaves the root as <b>one</b> number, because ${tex(`\\sqrt{${ps[pr[0][0]]}\\times${ps[pr[0][0]]}}=${ps[pr[0][0]]}`)}. ${lefts.length ? 'Primes without a partner stay inside.' : 'Nothing is left inside.'}`,
      run: async (c) => {
        const jobs = [c.fadeIn(eq2, 300)];
        pr.forEach(([i, j], k) => {
          const to = outEls[k].e, from = chips[i], dx = parseFloat(from.style.left) - parseFloat(to.style.left), dy = y1 - y2;
          jobs.push(c.anim(to, [{ opacity: 1, transform: `translate(${dx}px, ${dy}px)` }, { opacity: 1, transform: 'none' }], 750, { delay: k * 250 }));
          jobs.push(c.anim(chips[j], [{ opacity: 1 }, { opacity: 0.25 }], 400, { delay: k * 250 }), c.anim(from, [{ opacity: 1 }, { opacity: 0.25 }], 400, { delay: k * 250 }));
          if (outEls[k].xs) jobs.push(c.fadeIn(outEls[k].xs, 300, { delay: 600 + k * 250 }));
        });
        if (rad2) jobs.push(c.fadeIn(rad2, 400, { delay: 300 }));
        left.forEach((i, k) => {
          const to = leftEls[k].e, from = chips[i], dx = parseFloat(from.style.left) - parseFloat(to.style.left), dy = y1 - y2;
          jobs.push(c.anim(to, [{ opacity: 1, transform: `translate(${dx}px, ${dy}px)` }, { opacity: 1, transform: 'none' }], 750, { delay: 400 + k * 150 }));
          jobs.push(c.anim(from, [{ opacity: 1 }, { opacity: 0.25 }], 400, { delay: 400 }));
          if (leftEls[k].xs) jobs.push(c.fadeIn(leftEls[k].xs, 300, { delay: 900 }));
        });
        brs.forEach(({ b, t }) => jobs.push(c.anim(b, [{ opacity: 1 }, { opacity: 0.25 }], 400), c.anim(t, [{ opacity: 1 }, { opacity: 0.35 }], 400)));
        await Promise.all(jobs);
      }
    }, {
      cap: `Multiply what’s outside${lefts.length ? ', and multiply what’s left inside' : ''}: ${outs.length > 1 ? `${outs.join(' × ')} = ${s}` : s} outside${lefts.length ? `, ${lefts.length > 1 ? `${lefts.join(' × ')} = ${r}` : r} inside` : ''}. So <b>${tex(`${R(n)}=${r === 1 ? s : mixT(s, r)}`)}</b>.`,
      run: (c) => c.pop(res, 480)
    });
    return steps;
  }
};

/* ============ 3. With a coefficient, or a fraction underneath ============ */
const cLabel = (v) => { const [c, n] = v.split('|'), cf = parseCoef(c); return tex(coefT(cf) + (n.includes('/') ? `\\sqrt{\\tfrac{${n.split('/')[0]}}{${n.split('/')[1]}}}` : R(Number(n)))); };
const COEF = ['3|50', '-2|45', '1/2|48', '1|8/25', 'sep', '5|128', '2/3|252', '1|11/16'];
const coef = {
  title: 'Simplify the root first, then multiply',
  height: 400,
  choices: COEF.map((v) => (v === 'sep' ? { sep: 'Example 3 check:' } : { v, label: cLabel(v) })),
  intro: (v) => (v.split('|')[1].includes('/') ? `A <b>fraction</b> under the root: ${cLabel(v)}. Split it with the quotient rule.` : `A <b>number in front</b>: ${cLabel(v)}. The ${tex(coefT(parseCoef(v.split('|')[0])))} just waits while we simplify the root.`),
  make(stage, v, ex) {
    const W = ex.W, [cs, ns] = v.split('|'), c0 = parseCoef(cs), frac = ns.includes('/'), fs = frac ? 30 : 32;
    const B = board(stage, { x: 40, y: 18, lh: 92, fs, nx: W * 0.56, nw: W * 0.44 - 30 });
    const chk = add(stage, h('div', 'wk-check'), W * 0.56, 18); chk.style.width = (W * 0.44 - 30) + 'px'; chk.style.height = '86px'; hide(chk);
    const steps = [];
    if (ns.includes('/')) {
      const [a, b] = ns.split('/').map(Number), kb = Math.sqrt(b), { s, r } = sqPart(a), fq = Q(s, kb);
      const r0 = B.line(`\\sqrt{\\dfrac{${a}}{${b}}}`); r0.el.style.opacity = 1;
      const r1 = B.line(`=\\dfrac{\\htmlClass{tk-t}{${R(a)}}}{\\htmlClass{tk-b}{${R(b)}}}`, 'Quotient rule: the root of the top over the root of the bottom.');
      const r2 = B.line(`=\\dfrac{\\htmlClass{tk-t}{${mixT(s, r)}}}{\\htmlClass{tk-b}{${kb}}}`, s > 1 ? `${tex(`${R(b)}=${kb}`)}, and the top simplifies too: ${tex(`${R(a)}=${R(s * s)}\\times${R(r)}=${mixT(s, r)}`)}.` : `${b} is a perfect square: ${tex(`${R(b)}=${kb}`)}. ${a} has no square factor, so ${tex(R(a))} stays.`);
      const r3 = B.line(`=${qT(fq)}${R(r)}`, `The same number with a fraction in front.`);
      steps.push({ cap: `<b>Quotient rule:</b> take the root of the top and the root of the bottom separately.`, run: (cx) => showRow(cx, stage, r1, [], fs) },
        { cap: `${b} is a perfect square, so the bottom becomes <b>${kb}</b>. ${s > 1 ? `The top has a square factor too: ${tex(`${R(a)}=${mixT(s, r)}`)}.` : `${a} has no perfect-square factor, so the top stays ${tex(R(a))}.`}`, run: (cx) => showRow(cx, stage, r2, [[r1.q('.tk-b'), r2.q('.tk-b'), String(kb)], s > 1 ? [r1.q('.tk-t'), r2.q('.tk-t'), mixT(s, r)] : [null, null]], fs) },
        { cap: `Either form is fine: ${tex(`\\dfrac{${mixT(s, r)}}{${kb}}=${qT(fq)}${R(r)}`)}. The radicand ${r} has no perfect-square factor left, so we’re done.`, run: (cx) => showRow(cx, stage, r3, [], fs) },
        { cap: `Check with a calculator: both give ${dec(Math.sqrt(a / b))}.`, run: (cx) => { chk.innerHTML = `<div class="sp-box-h">Calculator check</div>${K(`\\sqrt{\\tfrac{${a}}{${b}}}`)} ≈ ${dec(Math.sqrt(a / b))}<br>${K(`${qT(fq)}${R(r)}`)} ≈ ${dec(Math.sqrt(a / b))} <b class="ok">✓</b>`; return cx.fadeIn(chk, 400); } });
      return steps;
    }
    const n = Number(ns), { s, r } = sqPart(n), S = s * s, ct = coefT(c0), prod = Q(c0.p * s, c0.q);
    const resT = prod.p === prod.q ? R(r) : prod.p === -prod.q ? '-' + R(r) : qT(prod) + (r === 1 ? '' : R(r));
    const cTok = `\\htmlClass{tk-c}{${ct}}`;
    const r0 = B.line(`${cTok}${R(n)}`); r0.el.style.opacity = 1;
    const r1 = B.line(`=${cTok}\\times\\sqrt{\\htmlClass{tk-S}{${tn(S)}}\\times${tn(r)}}`, `Leave the ${tex(ct)} alone for now. The largest perfect square in ${n} is <b>${S}</b>.`);
    const r2 = B.line(`=${cTok}\\times\\htmlClass{tk-s}{${s}}${R(r)}`, `${tex(`${R(S)}=${s}`)} comes out of the root.`);
    const r3 = B.line(`=\\htmlClass{tk-p}{${prod.p === prod.q ? '' : prod.p === -prod.q ? '-' : qT(prod)}}${r === 1 ? '' : R(r)}`, `Multiply the numbers in front: ${tex(`${ct}\\times${s}=${qT(prod)}`)}.`);
    const val = c0.val * Math.sqrt(n);
    steps.push({
      cap: `<b>Simplify the radical first</b>; the ${tex(ct)} in front just waits. The largest perfect square in ${n} is <b>${S}</b>: ${n} = ${S} × ${r}.`,
      run: (cx) => showRow(cx, stage, r1, [[r0.q('.tk-c'), r1.q('.tk-c'), ct]], fs)
    }, {
      cap: `${tex(`${R(S)}=${s}`)}, so a <b>${s}</b> comes out of the root. Now there are two numbers in front.`,
      run: (cx) => showRow(cx, stage, r2, [[r1.q('.tk-c'), r2.q('.tk-c'), ct], [r1.q('.tk-S'), r2.q('.tk-s'), String(s)]], fs)
    }, {
      cap: `Multiply the numbers in front: ${tex(`${ct}\\times${s}=${qT(prod)}`)}. So <b>${tex(`${ct}${R(n)}=${resT}`)}</b>.`,
      run: (cx) => showRow(cx, stage, r3, [[r2.q('.tk-c'), r3.q('.tk-p'), ct], [r2.q('.tk-s'), r3.q('.tk-p'), String(s)]], fs)
    }, {
      cap: `Check with a calculator: both give ${dec(val)}.`,
      run: (cx) => { chk.innerHTML = `<div class="sp-box-h">Calculator check</div>${K(`${ct}${R(n)}`)} ≈ ${dec(val)}<br>${K(resT)} ≈ ${dec(val)} <b class="ok">✓</b>`; return cx.fadeIn(chk, 400); }
    });
    return steps;
  }
};

/* ============ 4. Mixed → entire: the coefficient goes back in as its square ============ */
const ENT = ['4|11', 'sep', '3|8', '5|6', '9|5', '5/2|8', '0.6|75', '-7|5'];
const entire = {
  title: 'Mixed → entire: the number outside goes in as its square',
  height: 400,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: ENT.map((v) => (v === 'sep' ? { sep: 'Example 4 check:' } : { v, label: cLabel(v) })),
  intro: (v) => `Run Section 3 backwards. Push the coefficient of ${cLabel(v)} back <b>under</b> the root sign.`,
  make(stage, v, ex) {
    const W = ex.W, [cs, ns] = v.split('|'), c0 = parseCoef(cs), n = Number(ns), fs = 32, neg = c0.p < 0;
    const aT = absCoefT(c0), a = { p: Math.abs(c0.p), q: c0.q }, a2 = Q(a.p * a.p, a.q * a.q);
    const a2T = c0.dec ? String(+((a.p / a.q) ** 2).toFixed(6)) : qT(a2);
    const sqT = a.q === 1 || c0.dec ? `${aT}^2` : `\\left(${aT}\\right)^2`;
    const Rv = (a.p * a.p * n) / (a.q * a.q), m = neg ? '-' : '';
    const B = board(stage, { x: 40, y: 22, lh: 92, fs, nx: W * 0.6, nw: W * 0.4 - 30 });
    const r0 = B.line(`${neg ? '\\htmlClass{tk-m}{-}' : ''}\\htmlClass{tk-c}{${aT}}${R(n)}`); r0.el.style.opacity = 1;
    const r1 = B.line(`=${neg ? '\\htmlClass{tk-m}{-}' : ''}\\sqrt{\\htmlClass{tk-c}{${sqT}}}\\times${R(n)}=${m}\\sqrt{\\htmlClass{tk-a}{${a2T}}}\\times${R(n)}`,
      neg ? `The <b>−</b> stays out front. Only the ${aT} goes in: ${tex(`${aT}=\\sqrt{${sqT}}=\\sqrt{${a2T}}`)}.` : `Any positive number is the root of its square: ${tex(`${aT}=\\sqrt{${sqT}}=\\sqrt{${a2T}}`)}.`);
    const r2 = B.line(`=${m}\\sqrt{\\htmlClass{tk-a}{${a2T}}\\times${n}}`, 'Product rule backwards: two roots join into one.');
    const r3 = B.line(`=${m}\\htmlClass{tk-R}{${R(Rv)}}`, `${tex(`${a2T}\\times${n}=${tn(Rv)}`)}`);
    const chk = add(stage, h('div', 'wk-check'), W * 0.6, 22); chk.style.width = (W * 0.4 - 30) + 'px'; chk.style.height = '86px'; hide(chk);
    const val = c0.val * Math.sqrt(n);
    return [{
      cap: neg ? `The <b>−</b> is not part of the coefficient that moves: a square root is never negative, so the − <b>stays outside</b>. The ${tex(aT)} goes in as ${tex(`\\sqrt{${a2T}}`)}.`
        : `Every positive number is the square root of its square: ${tex(`${aT}=\\sqrt{${sqT}}=\\sqrt{${a2T}}`)}. So the ${tex(aT)} can go under a root sign.`,
      run: (c) => showRow(c, stage, r1, [[r0.q('.tk-c'), r1.q('.tk-c'), aT], neg ? [r0.q('.tk-m'), r1.q('.tk-m'), '-'] : [null, null]], fs)
    }, {
      cap: `Run the product rule backwards: ${tex(`\\sqrt{${a2T}}\\times${R(n)}=\\sqrt{${a2T}\\times${n}}`)}.`,
      run: (c) => showRow(c, stage, r2, [[r1.q('.tk-a'), r2.q('.tk-a'), a2T]], fs)
    }, {
      cap: `Multiply: ${tex(`${a2T}\\times${n}=${tn(Rv)}`)}. So <b>${tex(`${coefT(c0)}${R(n)}=${m}${R(Rv)}`)}</b>.`,
      run: (c) => showRow(c, stage, r3, [[r2.q('.tk-a'), r3.q('.tk-R'), R(Rv)]], fs)
    }, {
      cap: `Check with a calculator: both give ${dec(val)}.${neg ? ' (Both negative, because the − stayed outside.)' : ''}`,
      run: (c) => { chk.innerHTML = `<div class="sp-box-h">Calculator check</div>${K(`${coefT(c0)}${R(n)}`)} ≈ ${dec(val)}<br>${K(`${m}${R(Rv)}`)} ≈ ${dec(val)} <b class="ok">✓</b>`; return c.fadeIn(chk, 400); }
    }];
  }
};

/* ============ 5. Comparing radicals on a number line ============ */
const SETS = { more: [[3, 5], [2, 10], [4, 3], [1, 42], [5, 2]], ex5: [[6, 3], [4, 5], [1, 40], [3, 6], [2, 11]] };
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v'];
const numline = {
  title: 'Convert to entire radicals, then line them up',
  height: 480,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'more', label: 'Warm-up set' }, { sep: 'Example 5 check:' }, { v: 'ex5', label: 'Example 5' }],
  intro: (v) => `Order ${SETS[v].map(([a, r]) => tex(mixT(a, r))).join(', ')} from <b>greatest to least</b>, without a calculator.`,
  make(stage, v, ex) {
    const W = ex.W, items = SETS[v].map(([a, r], i) => ({ a, r, R: a * a * r, val: Math.sqrt(a * a * r), lab: ROMAN[i] }));
    const cw = (W - 40 - 4 * 12) / 5;
    items.forEach((it, i) => {
      const x = 20 + i * (cw + 12), card = add(stage, h('div', 'nl-card'), x, 14); card.style.width = cw + 'px';
      card.innerHTML = `<div class="nl-lab">${it.lab})</div><div class="nl-m">${K(mixT(it.a, it.r))}</div><div class="nl-s">${it.a === 1 ? '<span class="muted">already entire</span>' : K(`=\\sqrt{${it.a * it.a}\\times${it.r}}`)}</div><div class="nl-e">${K('=' + R(it.R))}</div><div class="nl-rank"></div>`;
      it.card = card; it.s = card.querySelector('.nl-s'); it.e = card.querySelector('.nl-e'); it.rk = card.querySelector('.nl-rank'); hide(it.s, it.e, it.rk);
    });
    const lo = Math.floor(Math.min(...items.map((t) => t.val))), hi = Math.ceil(Math.max(...items.map((t) => t.val))), xL = 60, xR = W - 60, ly = 330;
    const X = (u) => xL + ((u - lo) / (hi - lo)) * (xR - xL);
    const axis = add(stage, h('div', 'nl-axis'), xL - 20, ly); axis.style.width = (xR - xL + 40) + 'px';
    for (let k = lo; k <= hi; k++) {
      add(stage, h('div', 'nl-tick'), X(k) - 1.5, ly - 9);
      const t = add(stage, h('div', 'nl-tl', `<b>${k}</b>${K(`\\sqrt{${k * k}}`)}`), X(k), ly + 14); t.style.translate = '-50% 0';
    }
    const sorted = [...items].sort((p, q) => p.val - q.val);
    sorted.forEach((it, i) => {
      const dot = add(stage, h('div', 'nl-dot c'), X(it.val), ly + 1.5);
      const up = i % 2 ? 92 : 46, mk = add(stage, h('div', 'nl-mk', `<small>${it.lab})</small>${K(R(it.R))}`), X(it.val), ly - up - 18); mk.style.translate = '-50% -50%';
      const st = add(stage, h('div', 'nl-stem'), X(it.val) - 1, ly - up); st.style.height = (up - 8) + 'px';
      it.dot = dot; it.mk = mk; it.st = st; hide(dot, mk, st);
    });
    const desc = [...sorted].reverse();
    const ord = add(stage, h('div', 'nl-ord', K(desc.map((t) => mixT(t.a, t.r)).join('\\;>\\;'))), W / 2, 428); ord.style.translate = '-50% 0'; hide(ord);
    return [{
      cap: `Hard to compare as they are: is ${tex(mixT(items[0].a, items[0].r))} bigger than ${tex(mixT(items[1].a, items[1].r))}? Turn every one into an <b>entire radical</b>: the coefficient goes in as its <b>square</b>.`,
      run: async (c) => { for (const it of items) { await c.fadeIn(it.s, 260); await c.fadeIn(it.e, 260); } }
    }, {
      cap: `Now compare the numbers under the roots: <b>bigger radicand, bigger value</b>. ${sorted.map((t) => t.R).join(' &lt; ')}, all between ${lo * lo} and ${hi * hi}.`,
      run: (c) => Promise.all(sorted.flatMap((it, i) => [c.anim(it.dot, [{ opacity: 0, transform: 'translateY(-40px)' }, { opacity: 1, transform: 'none' }], 450, { delay: i * 220 }), c.fadeIn(it.st, 300, { delay: 200 + i * 220 }), c.pop(it.mk, 380, { delay: 250 + i * 220 })]))
    }, {
      cap: `Read the number line from <b>right to left</b> for greatest to least: <b>${desc.map((t) => tex(mixT(t.a, t.r))).join(' &gt; ')}</b>.`,
      run: async (c) => { desc.forEach((t, i) => { t.rk.textContent = i + 1; }); await Promise.all([c.fadeIn(ord, 450), ...desc.map((t, i) => c.pop(t.rk, 320, { delay: i * 120 }))]); }
    }];
  }
};

/* ============ 6. Pythagorean theorem with exact answers ============ */
const pyth = {
  title: 'Squares on the sides: keep the answer exact',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: '1|1', label: 'legs 1 and 1' }, { v: '2|4', label: 'legs 2 and 4' }, { v: '3|6', label: 'legs 3 and 6' }, { v: '5|5', label: 'legs 5 and 5' }, { sep: 'Example 6 check:' }, { v: 'ex6', label: 'Example 6' }],
  intro: (v) => (v === 'ex6' ? 'Example 6: find the exact length of <b>AB</b>. Two right triangles share the altitude <b>AD</b>.' : `A right triangle has legs <b>${v.split('|')[0]}</b> and <b>${v.split('|')[1]}</b>. How long is the hypotenuse, <b>exactly</b>?`),
  make(stage, v, ex) { return v === 'ex6' ? pythEx6(stage, ex.W) : pythLegs(stage, v, ex.W); }
};
function pythLegs(stage, v, W) {
  const [l1, l2] = v.split('|').map(Number), RW = W * 0.54, RH = 440;
  // choose which leg is vertical (p) so the picture is as big as possible
  const fit = (p, q) => Math.min(110, (RW - 40) / (q + 2 * p), (RH - 20) / (2 * q + p));
  const [p, q] = fit(l1, l2) >= fit(l2, l1) ? [l1, l2] : [l2, l1], sc = fit(p, q);
  const ox = 20 + p * sc + (RW - 40 - (q + 2 * p) * sc) / 2, oy = 14 + (q + p) * sc + (RH - 20 - (2 * q + p) * sc) / 2;
  const P = (x, y) => `${ox + x * sc},${oy - y * sc}`;
  const svg = add(stage, svgEl('svg', { class: 'py-svg', width: RW, height: 470 }), 0, 0);
  const poly = (pts, cls) => svg.appendChild(svgEl('polygon', { points: pts.map((t) => P(...t)).join(' '), class: cls }));
  const grid = (x0, y0, nx, ny, cls) => { const g = svg.appendChild(svgEl('g', { class: cls })); for (let i = 1; i < nx; i++) g.appendChild(svgEl('line', { x1: ox + (x0 + i) * sc, y1: oy - y0 * sc, x2: ox + (x0 + i) * sc, y2: oy - (y0 + ny) * sc })); for (let j = 1; j < ny; j++) g.appendChild(svgEl('line', { x1: ox + x0 * sc, y1: oy - (y0 + j) * sc, x2: ox + (x0 + nx) * sc, y2: oy - (y0 + j) * sc })); return g; };
  const sqA = poly([[0, 0], [q, 0], [q, -q], [0, -q]], 'py-sq a'), gA = grid(0, -q, q, q, 'py-gr');
  const sqB = poly([[0, 0], [0, p], [-p, p], [-p, 0]], 'py-sq b'), gB = grid(-p, 0, p, p, 'py-gr');
  const sqC = poly([[0, p], [q, 0], [q + p, q], [p, p + q]], 'py-sq hc');
  poly([[0, 0], [q, 0], [0, p]], 'py-tri');
  const m = Math.min(16, sc * 0.3); svg.appendChild(svgEl('path', { d: `M${ox + m} ${oy} L${ox + m} ${oy - m} L${ox} ${oy - m}`, class: 'py-ra' }));
  [sqA, gA, sqB, gB, sqC].forEach((e) => (e.style.opacity = 0));
  const sum = p * p + q * q, { s, r } = sqPart(sum), lab = (html, x, y, cls) => { const e = add(stage, h('div', 'py-lab c ' + (cls || ''), html), ox + x * sc, oy - y * sc); return e; };
  lab(String(q), q / 2, 0, 'leg'); lab(String(p), 0, p / 2, 'leg');
  const aA = lab(`${q}<sup>2</sup> = ${q * q}`, q / 2, -q / 2, 'area'), aB = lab(`${p}<sup>2</sup> = ${p * p}`, -p / 2, p / 2, 'area');
  const aC = lab(`${p * p} + ${q * q} = <b>${sum}</b>`, (q + p) / 2 + (0.18 * p), (p + q) / 2 + (0.18 * q), 'area big');
  const cc = Math.sqrt(sum), off = 30 / sc, hx = q / 2 + (off * p) / cc, hy = p / 2 + (off * q) / cc; // just outside the hypotenuse, inside its square
  const cL = lab('?', hx, hy, 'hyp'); const cL2 = lab(K(R(sum)), hx, hy, 'hyp'); const cL3 = lab(K(mixT(s, r)), hx, hy, 'hyp');
  hide(aA, aB, aC, cL2, cL3);
  const B = board(stage, { x: RW + 20, y: 30, lh: 66, fs: 28 });
  const L = [B.line('c^2=a^2+b^2'), B.line(`c^2=${p}^2+${q}^2=${p * p}+${q * q}=${sum}`), B.line(`c=${R(sum)}`),
    B.line(r === 1 ? `c=${s}` : s === 1 ? `${R(sum)}\\ \\text{is simplest}` : `c=\\sqrt{${s * s}\\times${r}}=\\mathbf{${mixT(s, r)}}`), B.line(`c\\approx${Math.sqrt(sum).toFixed(2)}`)];
  const swap = (c, a, b) => Promise.all([c.anim(a, [{ opacity: 1 }, { opacity: 0 }], 250), c.pop(b, 420, { delay: 150 })]);
  return [{
    cap: `Build a square on each <b>leg</b>. Count the unit squares: ${p}<sup>2</sup> = ${p * p} and ${q}<sup>2</sup> = ${q * q}.`,
    run: (c) => Promise.all([c.fadeIn(sqA, 400), c.fadeIn(gA, 400), c.fadeIn(sqB, 400, { delay: 200 }), c.fadeIn(gB, 400, { delay: 200 }), c.pop(aA, 350, { delay: 300 }), c.pop(aB, 350, { delay: 450 }), showRow(c, stage, L[0])])
  }, {
    cap: `<b>Pythagorean theorem:</b> the square on the <b>hypotenuse</b> has the same area as the other two together: ${p * p} + ${q * q} = <b>${sum}</b>.`,
    run: (c) => Promise.all([c.anim(sqC, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], 500), c.pop(aC, 400, { delay: 300 }), showRow(c, stage, L[1])])
  }, {
    cap: `The hypotenuse is the side of a square with area ${sum}, so <b>${tex(`c=${R(sum)}`)}</b>. That is the <b>exact</b> length.`,
    run: (c) => Promise.all([swap(c, cL, cL2), showRow(c, stage, L[2])])
  }, {
    cap: r === 1 ? `${sum} is a perfect square, so c = <b>${s}</b> exactly.` : s === 1 ? `${sum} has no perfect-square factor, so ${tex(R(sum))} is already simplest.${sum === 2 ? ' It’s the √2 spoke from the snail spiral!' : ''}`
      : `Simplify: ${sum} = ${s * s} × ${r}, so <b>${tex(`c=${R(sum)}=${mixT(s, r)}`)}</b>. Leave it like this unless a decimal is asked for.`,
    run: (c) => Promise.all([s > 1 && r > 1 ? swap(c, cL2, cL3) : null, showRow(c, stage, L[3])])
  }, {
    cap: `Only round when asked: ${tex(mixT(s, r))} ≈ ${Math.sqrt(sum).toFixed(2)}. The exact answer never loses accuracy; the decimal always does.`,
    run: (c) => showRow(c, stage, L[4])
  }];
}
function pythEx6(stage, W) {
  const sc = 32, ox = 70, oy = 430, P = (x, y) => `${ox + x * sc},${oy - y * sc}`;
  const svg = add(stage, svgEl('svg', { class: 'py-svg', width: 400, height: 470 }), 0, 0);
  const tC = svg.appendChild(svgEl('polygon', { points: [P(4, 0), P(9, 0), P(4, 12)].join(' '), class: 'py-sq b' }));
  const tB = svg.appendChild(svgEl('polygon', { points: [P(0, 0), P(4, 0), P(4, 12)].join(' '), class: 'py-sq a' }));
  hide(tC, tB);
  svg.appendChild(svgEl('path', { d: `M${P(0, 0)} L${P(9, 0)} L${P(4, 12)} Z M${P(4, 12)} L${P(4, 0)}`, class: 'py-tri', fill: 'none' }));
  svg.appendChild(svgEl('path', { d: `M${ox + 4 * sc - 13} ${oy} L${ox + 4 * sc - 13} ${oy - 13} L${ox + 4 * sc} ${oy - 13}`, class: 'py-ra' }));
  const lab = (html, x, y, cls) => add(stage, h('div', 'py-lab c ' + (cls || ''), html), ox + x * sc, oy - y * sc);
  lab('A', 4, 12.7, 'pt'); lab('B', -0.6, 0, 'pt'); lab('C', 9.6, 0, 'pt'); lab('D', 4, -0.75, 'pt');
  lab('4', 2, -0.75, 'leg'); lab('5', 6.5, -0.75, 'leg'); lab('13', 7.3, 6.3, 'leg');
  const ad = lab('?', 4.5, 5, 'hyp'), ad2 = lab('12', 4.5, 5, 'hyp'), ab = lab('?', 1.3, 6.3, 'hyp'), ab2 = lab(K('4\\sqrt{10}'), 0.9, 6.3, 'hyp');
  hide(ad2, ab2);
  const B = board(stage, { x: 430, y: 34, lh: 70, fs: 27 });
  const L = [B.line('\\triangle ADC:\\ AD^2+5^2=13^2'), B.line('AD^2=169-25=144,\\ AD=12'), B.line('\\triangle ADB:\\ AB^2=12^2+4^2=160'),
    B.line('AB=\\sqrt{160}=\\sqrt{16\\times10}=\\mathbf{4\\sqrt{10}}'), B.line('AB=4\\times3.162\\ldots\\approx\\mathbf{12.65}')];
  const swap = (c, a, b) => Promise.all([c.anim(a, [{ opacity: 1 }, { opacity: 0 }], 250), c.pop(b, 420, { delay: 150 })]);
  return [{
    cap: `Start with <b>△ADC</b>: we know two of its sides. AC = 13 is its hypotenuse (across from the right angle at D).`,
    run: (c) => Promise.all([c.fadeIn(tC, 400), showRow(c, stage, L[0])])
  }, {
    cap: `${tex('AD^2=169-25=144')}, so <b>AD = 12</b>. (144 is a perfect square, so this one is a whole number.)`,
    run: (c) => Promise.all([swap(c, ad, ad2), showRow(c, stage, L[1])])
  }, {
    cap: `Now <b>△ADB</b>: its legs are AD = 12 and BD = 4, and AB is the hypotenuse. ${tex('AB^2=144+16=160')}.`,
    run: (c) => Promise.all([c.anim(tC, [{ opacity: 1 }, { opacity: 0.25 }], 400), c.fadeIn(tB, 400), showRow(c, stage, L[2])])
  }, {
    cap: `(a) ${tex('AB=\\sqrt{160}')}. The largest perfect square in 160 is 16: <b>${tex('AB=\\sqrt{16\\times10}=4\\sqrt{10}')}</b>.`,
    run: (c) => Promise.all([swap(c, ab, ab2), showRow(c, stage, L[3])])
  }, {
    cap: `(b) Only now use decimals: ${tex('4\\sqrt{10}=4\\times3.162\\ldots=12.649\\ldots')}, so <b>AB ≈ 12.65</b>.`,
    run: (c) => showRow(c, stage, L[4])
  }];
}

/* ============ warm-up: the snail spiral ============ */
function mountSpiral() {
  const host = document.getElementById('spiral'); if (!host) return;
  const N = 16, P = [null, [1, 0]];
  for (let k = 1; k < N; k++) { const [x, y] = P[k], r = Math.hypot(x, y); P.push([x - y / r, y + x / r]); }
  const Rt = P.map((p) => p && [-p[1], p[0]]); // turn it so the first spoke points up, like the board
  const labPt = (k, d = 0.5) => { const [x, y] = Rt[k], r = Math.hypot(x, y), f = (r + d) / r; return [x * f, y * f]; };
  const xs = [0], ys = [0];
  for (let k = 1; k <= N; k++) { const l = labPt(k, 0.62); xs.push(Rt[k][0], l[0]); ys.push(Rt[k][1], l[1]); }
  const BW = host.clientWidth || 470, BH = (host.clientHeight || 500) - 40, minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
  const sc = Math.min(BW / (maxx - minx), BH / (maxy - miny)), offx = (BW - (maxx - minx) * sc) / 2, offy = (BH - (maxy - miny) * sc) / 2;
  const X = (x) => offx + (x - minx) * sc, Y = (y) => offy + (maxy - y) * sc, pt = (p) => `${X(p[0])},${Y(p[1])}`;
  const svg = svgEl('svg', { class: 'sp-svg', viewBox: `0 0 ${BW} ${BH}`, width: BW, height: BH }); host.appendChild(svg);
  for (let k = 1; k < N; k++) svg.appendChild(svgEl('polygon', { points: [pt([0, 0]), pt(Rt[k]), pt(Rt[k + 1])].join(' '), class: 'sp-tri' + (k % 2 ? '' : ' b') }));
  for (let k = 1; k < N; k++) { // right-angle marks
    const [x, y] = Rt[k], r = Math.hypot(x, y), u = [x / r, y / r], e = [Rt[k + 1][0] - x, Rt[k + 1][1] - y], d = 0.16;
    svg.appendChild(svgEl('path', { d: `M${pt([x - u[0] * d, y - u[1] * d])} L${pt([x - u[0] * d + e[0] * d, y - u[1] * d + e[1] * d])} L${pt([x + e[0] * d, y + e[1] * d])}`, class: 'sp-ra' }));
  }
  svg.appendChild(svgEl('path', { d: 'M' + Rt.slice(1).map(pt).join(' L'), class: 'sp-edge' }));
  const spokes = [];
  for (let k = 1; k <= N; k++) spokes[k] = svg.appendChild(svgEl('line', { x1: X(0), y1: Y(0), x2: X(Rt[k][0]), y2: Y(Rt[k][1]), class: 'sp-spoke' + (k === 3 ? ' red' : '') }));
  svg.appendChild(svgEl('circle', { cx: X(0), cy: Y(0), r: 4.5, class: 'sp-o' }));
  const mx = (Rt[1][0] + Rt[2][0]) / 2, my = (Rt[1][1] + Rt[2][1]) / 2, mr = Math.hypot(mx, my), f1 = (mr + 0.3) / mr; // just outside the first outer edge
  const one = svgEl('text', { x: X(mx * f1), y: Y(my * f1) + 7, class: 'sp-one', 'text-anchor': 'middle' }); one.textContent = '1'; svg.appendChild(one);
  const btns = [];
  for (let k = 1; k <= N; k++) {
    const [lx, ly] = labPt(k, 0.42), b = h('button', 'sp-lab' + (k === 3 ? ' red' : ''), tex(`\\sqrt{${k}}`)); b.type = 'button';
    b.style.left = X(lx) + 'px'; b.style.top = Y(ly) + 'px'; b.onclick = () => select([k]); host.appendChild(b); btns[k] = b;
  }
  const read = h('div', 'sp-read', '<span class="muted">Tap a label</span>'); host.appendChild(read);
  function select(ks) {
    spokes.forEach((s, k) => s && s.classList.toggle('hl', ks.includes(k)));
    btns.forEach((b, k) => b && b.classList.toggle('on', ks.includes(k)));
    read.innerHTML = ks.map((k) => (isSq(k) ? tex(`\\sqrt{${k}}=${Math.sqrt(k)}`) : tex(`\\sqrt{${k}}\\approx${Math.sqrt(k).toFixed(2)}`))).join('&nbsp;&nbsp;&nbsp;');
    read.animate([{ opacity: 0.3 }, { opacity: 1 }], 250);
  }
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => {
    const wq = b.closest('.wq'), on = wq.classList.toggle('shown');
    if (on) select(b.dataset.wq.split(',').map(Number)); else select([]);
  }));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
  mountStrip();
}
function mountStrip() {
  const host = document.getElementById('strip'); if (!host) return;
  const u = 112, x0 = 150, two = 2 * Math.sqrt(3) * u;
  const lab = (t, y) => { const e = h('div', 'st-l', t); e.style.top = y + 'px'; host.appendChild(e); };
  lab('Paper strip', 24); lab('Spoke', 88);
  const r1 = h('div', 'st-bar red'); r1.style.left = x0 + 'px'; r1.style.top = '20px'; r1.style.width = (two / 2 - 2) + 'px'; r1.innerHTML = tex('\\sqrt{3}');
  const r2 = h('div', 'st-bar red'); r2.style.left = (x0 + two / 2 + 2) + 'px'; r2.style.top = '20px'; r2.style.width = (two / 2 - 2) + 'px'; r2.innerHTML = tex('\\sqrt{3}');
  host.append(r1, r2);
  const mark = h('div', 'st-mark'); mark.style.left = (x0 + two) + 'px'; host.appendChild(mark);
  const bar = h('div', 'st-bar cmp'); bar.style.left = x0 + 'px'; bar.style.top = '84px'; bar.style.width = '0px'; host.appendChild(bar);
  const verdict = h('div', 'st-v'); host.appendChild(verdict);
  const opts = h('div', 'st-opts no-ink'); host.appendChild(opts);
  [5, 6, 9, 12].forEach((k, i) => {
    const b = h('button', 'chip', `<b>${'ABCD'[i]}</b>&nbsp;${tex(`\\sqrt{${k}}`)}`); b.type = 'button'; opts.appendChild(b);
    b.onclick = () => {
      opts.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === b));
      const w = Math.sqrt(k) * u, ok = k === 12;
      bar.innerHTML = tex(`\\sqrt{${k}}`); bar.classList.toggle('match', ok);
      bar.animate([{ width: bar.style.width }, { width: w + 'px' }], { duration: 600, easing: 'cubic-bezier(.25,.75,.3,1)' }); bar.style.width = w + 'px';
      verdict.innerHTML = ok ? `<b class="ok">A perfect match!</b> ${tex('2\\sqrt{3}=\\sqrt{12}\\approx3.46')}` : `<b class="red">Too short.</b> ${tex(`\\sqrt{${k}}${isSq(k) ? '=' + Math.sqrt(k) : '\\approx' + Math.sqrt(k).toFixed(2)}`)}, but the strip is ${tex('\\approx3.46')}`;
      verdict.animate([{ opacity: 0 }, { opacity: 1 }], 400);
    };
  });
}

/* ============ tap-to-fill blanks ============ */
function replaceBlanks(src, fn) { // \blank{...} with nested braces → fn(content)
  let out = '', i = 0;
  while (i < src.length) {
    const j = src.indexOf('\\blank{', i); if (j < 0) { out += src.slice(i); break; }
    out += src.slice(i, j); let d = 1, k = j + 7;
    for (; k < src.length && d; k++) { if (src[k] === '{') d++; else if (src[k] === '}') d--; }
    out += fn(src.slice(j + 7, k - 1)); i = k;
  }
  return out;
}
function mountTexBlanks() {
  document.querySelectorAll('[data-tfill]').forEach((el) => {
    const src = el.dataset.tfill, n = (src.match(/\\blank\{/g) || []).length, state = Array(n).fill(false);
    const render = () => {
      let i = 0;
      el.innerHTML = K(replaceBlanks(src, (a) => { const k = i++; return `\\htmlData{tap=1,b=${k}}{\\underline{\\;${state[k] ? `\\textcolor{#c93a33}{\\mathbf{${a}}}` : `\\phantom{\\mathbf{${a}}}`}\\;}}`; }), true);
      el.querySelectorAll('[data-b]').forEach((b) => { b.setAttribute('role', 'button'); b.classList.toggle('filled', state[+b.dataset.b]); });
    };
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-b]'); if (!b) return; state[+b.dataset.b] = !state[+b.dataset.b]; render(); });
    el._fill = () => { state.fill(true); render(); };
    render();
  });
}
function mountBlanks() {
  const grid = document.getElementById('sq-grid');
  if (grid) for (let k = 1; k <= 15; k++) grid.insertAdjacentHTML('beforeend', `<div class="sq-c"><div class="sq-k">${tex(k + '^2')}</div><button class="blank sq" data-a="${k * k}"></button></div>`);
  document.querySelectorAll('.blank[data-a]').forEach((b) => b.addEventListener('click', () => { b.classList.toggle('filled'); b.textContent = b.classList.contains('filled') ? b.dataset.a : ''; }));
  document.querySelectorAll('[data-fillall]').forEach((btn) => btn.addEventListener('click', () => {
    const scope = btn.closest('[data-fillscope]') || btn.closest('.card');
    scope.querySelectorAll('[data-tfill]').forEach((t) => t._fill && t._fill());
    scope.querySelectorAll('.blank[data-a]').forEach((b, i) => setTimeout(() => { b.classList.add('filled'); b.textContent = b.dataset.a; b.animate([{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 300); }, i * 90));
  }));
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { split, area, finder, pairs, coef, entire, numline, pyth };
  const tidy = (t) => String(t).replace(/…(\s*<\/b>)?\./g, '…$1'); // "7.071…." → "7.071…"
  Object.values(defs).forEach((d) => {
    const make = d.make;
    d.make = function (...a) { const steps = make.apply(this, a); steps.forEach((s) => { const c0 = s.cap; s.cap = typeof c0 === 'function' ? () => tidy(c0()) : tidy(c0); }); return steps; };
  });
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountTexBlanks(); mountBlanks(); mountSpiral(); mountExplainers();

/* ============ Stand Up Break! — entire radicals to mixed radicals at the whiteboards (lessons/js/standup.js) ============ */
const suN = (n) => { const s = String(n); return s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : s; };
const suLab = (i) => '\\text{(' + 'abcdef'[i] + ')}\\ ';
const suGrid = (items) => '\\def\\arraystretch{1.8}\\begin{array}{ll}' + items.map((x, j) => (j ? '\\hspace{2.5em}' : '') + suLab(j) + '{' + x + '}').join(' & ') + '\\end{array}';
function suPF(n) { const f = []; for (let p = 2; p * p <= n; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) f.push([p, e]); } if (n > 1) f.push([n, 1]); return f; }
const suPow = (f) => f.map(([p, e]) => (e > 1 ? p + '^{' + e + '}' : String(p))).join('\\times ');
const suCo = (p, q = 1) => { const g = gcd(p, q); p /= g; q /= g; return q === 1 ? (p === 1 ? '' : p === -1 ? '-' : String(p)) : (p < 0 ? '-' : '') + `\\dfrac{${Math.abs(p)}}{${q}}`; }; // a coefficient in front of a root
const suM = (k, m) => `${k === 1 ? '' : k === -1 ? '-' : k}\\sqrt{${m}}`;
function suKM(r, ks, ms, lo, hi) { for (;;) { const k = r.pick(ks), m = r.pick(ms), n = k * k * m; if (n >= lo && n <= hi) return [k, m, n]; } }
const suSplit = (k, m, n) => `\\sqrt{${suN(n)}}=\\sqrt{${k * k}\\times${m}}=${suM(k, m)}`;
function suTwo(r, gen, text) { let A, B; do { A = gen[0](r); B = gen[1](r); } while (A.t === B.t); return { text, q: suGrid([A.t, B.t]), a: [A, B].map((x, i) => suLab(i) + x.w) }; }
const suPlain = (ks, ms, lo, hi) => (r) => { const [k, m, n] = suKM(r, ks, ms, lo, hi); return { t: `\\sqrt{${suN(n)}}`, w: suSplit(k, m, n) }; };
const suCoef = (r) => { const c = r.pick([2, 3, 4, 5, -2, -3]), [k, m, n] = suKM(r, [2, 3, 4, 5, 6, 7, 8], [2, 3, 5, 6, 7], 8, 300);
  return { t: `${c}\\sqrt{${n}}`, w: `{${c}\\sqrt{${n}}}=${c}\\times${suM(k, m)}=${suM(c * k, m)}` }; };
const suFracCo = (ks) => (r) => { // Example 3(b): a fraction in front
  for (;;) { const q = r.int(2, 6), p = r.int(1, q + 3) * (r.chance(0.3) ? -1 : 1), [k, m, n] = suKM(r, ks, [2, 3, 5, 6, 7], 8, 2000);
    if (gcd(Math.abs(p), q) !== 1 || (k % q && r.chance(0.6))) continue;
    return { t: `${suCo(p, q)}\\sqrt{${suN(n)}}`, w: `{${suCo(p, q)}\\sqrt{${suN(n)}}}=${suCo(p, q)}\\times${suM(k, m)}=${suCo(p * k, q)}\\sqrt{${m}}` }; } };
const suQuot = (ks) => (r) => { // Example 3(c): a fraction underneath
  for (;;) { const d = r.int(2, 9), [k, m, n] = suKM(r, ks, [2, 3, 5, 6, 7, 10, 11, 13], 2, 1000), g = gcd(k, d);
    if (n % (d * d) === 0) continue; // it would simplify to a whole number
    const res = d / g === 1 ? suM(k / g, m) : `\\dfrac{${k / g === 1 ? '' : k / g}\\sqrt{${m}}}{${d / g}}`;
    return { t: `\\sqrt{\\dfrac{${suN(n)}}{${d * d}}}`, w: `\\sqrt{\\dfrac{${suN(n)}}{${d * d}}}=\\dfrac{\\sqrt{${suN(n)}}}{\\sqrt{${d * d}}}=\\dfrac{${k === 1 ? '' : k}\\sqrt{${m}}}{${d}}` + (g > 1 ? '=' + res : '') }; } };
standup('u1l7', {
  intro: 'Pull the largest perfect square out of the radicand. Check that nothing under the root still has a perfect-square factor.',
  levels: {
    BEG: (r) => suTwo(r, [suPlain([2, 3, 4, 5, 6], [2, 3, 5, 6, 7, 10, 11], 8, 300), suPlain([2, 3, 4, 5, 6, 7, 8, 9, 10], [2, 3, 5, 6, 7], 8, 300)], 'Convert each radical to a mixed radical in simplest form.'),   // Example 2
    PRG: (r) => suTwo(r, [suCoef, r.chance(0.5) ? suFracCo([2, 3, 4, 5, 6, 8]) : suQuot([1, 1, 2, 3])], 'Convert each radical to a mixed radical in simplest form.'),                                     // Example 3
    MAS: (r) => { // big radicands where the largest square is hard to spot, and fractions that simplify
      const big = (r) => { const [k, m, n] = suKM(r, [11, 12, 13, 14, 15, 16, 18, 20, 24], [2, 3, 5, 6, 7], 300, 2500); return { t: `\\sqrt{${suN(n)}}`, w: `${suN(n)}=${suPow(suPF(n))}:\\ \\sqrt{${suN(n)}}=\\sqrt{${suN(k * k)}\\times${m}}=${suM(k, m)}` }; };
      return suTwo(r, [big, r.chance(0.5) ? suFracCo([4, 6, 8, 9, 10, 12]) : suQuot([2, 3, 4, 5, 6])], 'Convert each radical to a mixed radical in simplest form.');
    }
  }
});
