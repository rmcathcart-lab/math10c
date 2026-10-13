/* Math 10C · Unit 2 · Lesson 3 — Negative Exponents: the warm-up and the explainers on this page. */
import { h, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

/* KaTeX, allowing \htmlClass (tokens that fly from one place to another) */
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};

/* ---------- number helpers ---------- */
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function Q(p, q = 1) { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return [p / g, q / g]; }
const qMul = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
const qPow = (b, e) => (e >= 0 ? Q(b[0] ** e, b[1] ** e) : Q(b[1] ** -e, b[0] ** -e));
const tn = (n) => (Math.abs(n) >= 1000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : String(n)); // 1000 → 1\,000
const qT = ([p, q], d = '\\dfrac') => (q === 1 ? tn(p) : (p < 0 ? '-' : '') + `${d}{${tn(Math.abs(p))}}{${tn(q)}}`);
const WORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

/* width/height of some HTML at a font size, measured off-screen inside the stage */
function measure(stage, html, fs) {
  const e = h('div', 'n3-meas', html); e.style.fontSize = fs + 'px'; stage.appendChild(e);
  const r = [e.offsetWidth, e.offsetHeight]; e.remove(); return r;
}
/* a copy of `src` flies from one element to another (both inside the stage) */
async function fly(c, stage, from, to, src, o = {}) {
  if (c.fast || !from || !to) { if (to) to.style.opacity = 1; return; }
  c.check();
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const ax = (a.left + a.width / 2 - sr.left) / k, ay = (a.top + a.height / 2 - sr.top) / k;
  const bx = (b.left + b.width / 2 - sr.left) / k, by = (b.top + b.height / 2 - sr.top) / k;
  const g = add(stage, h('div', 'n3-fly c ' + (o.cls || ''), K(src)), ax, ay); if (o.fs) g.style.fontSize = o.fs + 'px';
  g.style.opacity = 0;
  try {
    await c.anim(g, [{ opacity: 1, transform: 'translate(0,0) scale(1.1)' }, { opacity: 1, transform: `translate(${(bx - ax) / 2}px, ${(by - ay) / 2 - 30}px) scale(1.25)`, offset: 0.5 }, { opacity: 1, transform: `translate(${bx - ax}px, ${by - ay}px) scale(1)` }], o.ms || 750, { delay: o.delay || 0 });
  } finally { g.remove(); }
  to.style.opacity = 1;
}
const pulse = (c, el, ms = 420) => c.anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], ms);

/* =====================================================================
 * Warm-up: the bouncing ball
 * ===================================================================== */
function mountBall() {
  const host = document.getElementById('bb-scene'); if (!host) return;
  const W = host.clientWidth || 966, H = 430, G = 360;
  const SX = (W - 70) / 15.3, X0 = 52, MY = 300 / 16;
  const px = (u) => X0 + u * SX, py = (m) => G - m * MY;
  const svg = svgEl('svg', { class: 'bb-svg', width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  const defs = svgEl('defs');
  const grad = svgEl('radialGradient', { id: 'bbBall', cx: '35%', cy: '35%', r: '65%' });
  grad.append(svgEl('stop', { offset: '0%', 'stop-color': '#ffb3a8' }), svgEl('stop', { offset: '55%', 'stop-color': '#d23c32' }), svgEl('stop', { offset: '100%', 'stop-color': '#8e1f19' }));
  const arr = svgEl('marker', { id: 'bbArr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
  arr.appendChild(svgEl('path', { d: 'M0 0 L10 5 L0 10 z', fill: '#1e2d46' }));
  defs.append(grad, arr); svg.appendChild(defs);
  svg.appendChild(svgEl('rect', { x: 0, y: G, width: W, height: H - G, class: 'bb-ground' }));
  svg.appendChild(svgEl('line', { x1: 0, y1: G, x2: W, y2: G, class: 'bb-gline' }));
  // the building (16 m)
  const bx = px(0), bw = 1.3 * SX, bt = py(16);
  svg.appendChild(svgEl('rect', { x: bx, y: bt, width: bw, height: G - bt, class: 'bb-bld' }));
  for (let m = 0.8; m < 15.2; m += 1.5) for (const f of [0.14, 0.58]) svg.appendChild(svgEl('rect', { x: bx + f * bw, y: py(m) - 0.8 * MY, width: 0.28 * bw, height: 0.8 * MY, class: 'bb-win' }));
  svg.appendChild(svgEl('rect', { x: bx - 4, y: bt - 6, width: bw + 8, height: 6, class: 'bb-roof' }));
  // height marker
  svg.appendChild(svgEl('line', { x1: bx - 24, y1: G - 2, x2: bx - 24, y2: bt + 2, class: 'bb-mark', 'marker-start': 'url(#bbArr)', 'marker-end': 'url(#bbArr)' }));
  const ht = svgEl('text', { x: bx - 24, y: (G + bt) / 2, class: 'bb-mtext', transform: `rotate(-90 ${bx - 24} ${(G + bt) / 2})`, 'text-anchor': 'middle', dy: '0.35em' }); ht.textContent = '16 m';
  svg.appendChild(svgEl('rect', { x: bx - 38, y: (G + bt) / 2 - 30, width: 28, height: 60, fill: '#fffdf6' }));
  svg.appendChild(ht);
  // the ball's path: a half parabola off the roof, then bounces whose widths shrink like the square root of the height
  const B = [[3.9, 3.394, 8], [7.294, 2.4, 4], [9.694, 1.697, 2], [11.391, 1.2, 1], [12.591, 0.849, 0.5], [13.44, 0.6, 0.25], [14.04, 0.424, 0.125]];
  let d = `M ${px(1.55)} ${py(16)} Q ${px(2.72)} ${py(16)} ${px(3.9)} ${py(0)}`;
  B.forEach(([a, w, hh]) => { d += ` Q ${px(a + w / 2)} ${py(2 * hh)} ${px(a + w)} ${py(0)}`; });
  const path = svgEl('path', { d, class: 'bb-path' }); svg.appendChild(path);
  const dots = svgEl('text', { x: px(14.75), y: G - 6, class: 'bb-dots' }); dots.textContent = '…'; svg.appendChild(dots);
  const R = 12, ball = svgEl('circle', { cx: px(1.55), cy: py(16) - R, r: R, fill: 'url(#bbBall)', class: 'bb-ball' }); svg.appendChild(ball);
  host.appendChild(svg);
  // labels (HTML so the powers are typeset with KaTeX)
  const lab = (html, x, y, cls) => { const e = h('div', 'bb-lab ' + (cls || ''), html); host.appendChild(at(e, x, y)); return e; };
  lab(K('2^{4}') + ' m', px(1.55) + 22, py(16) - 10, 'left');
  [[0, '2^{3}'], [1, '2^{2}'], [2, '2^{1}']].forEach(([i, t]) => lab(K(t) + ' m', px(B[i][0] + B[i][1] / 2), py(B[i][2]) - 40));
  const q4 = h('button', 'bb-q', '?'), q5 = h('button', 'bb-q', '?');
  q4.type = q5.type = 'button'; q4.dataset.ans = K('2^{0}') + ' m'; q5.dataset.ans = K('2^{-1}') + ' m';
  host.appendChild(at(q4, px(B[3][0] + B[3][1] / 2), py(1) - 46)); host.appendChild(at(q5, px(B[4][0] + B[4][1] / 2), py(0.5) - 20));
  const setQ = (q, on) => { q.classList.toggle('open', on); q.innerHTML = on ? q.dataset.ans : '?'; };
  q4.onclick = () => setQ(q4, !q4.classList.contains('open')); q5.onclick = () => setQ(q5, !q5.classList.contains('open'));
  // bounce numbers
  lab('Bounce', px(B[0][0] + B[0][1] / 2) - 46, G + 32, 'num right');
  const nums = B.slice(0, 5).map(([a, w], i) => lab(String(i + 1), px(a + w / 2), G + 32, 'num'));
  // drop the ball
  const L = path.getTotalLength(), peaks = [];
  B.slice(0, 5).forEach(([a, w]) => peaks.push(px(a + w / 2)));
  let run = 0;
  host.querySelector('.bb-drop').onclick = () => {
    const id = ++run, t0 = performance.now(), dur = 5200, hit = new Set();
    const tick = (now) => {
      if (id !== run) return;
      const t = Math.min(1, (now - t0) / dur), s = 1 - Math.pow(1 - t, 1.6), p = path.getPointAtLength(s * L);
      ball.setAttribute('cx', p.x); ball.setAttribute('cy', p.y - R);
      peaks.forEach((x, i) => { if (!hit.has(i) && p.x >= x) { hit.add(i); nums[i].animate([{ transform: 'scale(1)', color: '#1c2230' }, { transform: 'scale(1.6)', color: '#c93a33' }, { transform: 'scale(1)', color: '#1c2230' }], 500); } });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  // warm-up answer buttons also reveal the matching "?"
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => {
    const wq = b.closest('.wq'), on = wq.classList.toggle('shown');
    if (b.dataset.wq === '4') setQ(q4, on); if (b.dataset.wq === '5') setQ(q5, on);
  }));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

/* keep halving: a table of bounces 1–12 to fill in */
function mountHalve() {
  const host = document.getElementById('halve'); if (!host) return;
  const cm = ['800', '400', '200', '100', '50', '25', '12.5', '6.25', '≈ 3.1', '≈ 1.6', '≈ 0.8', '≈ 0.4'];
  host.appendChild(h('div', 'hv-labs', '<div>Bounce</div><div>Power of 2 (m)</div><div>Metres</div><div>Centimetres</div>'));
  const cols = [];
  for (let n = 1; n <= 12; n++) {
    const e = 4 - n, m = e >= 0 ? String(2 ** e) : `\\tfrac{1}{${2 ** -e}}`;
    const b = h('button', 'hv-col' + (n === 11 ? ' first' : ''), `<div class="hv-n">${n}</div><div class="hv-v">${K(`2^{${e}}`)}</div><div class="hv-v">${K(m)}</div><div class="hv-v cm">${cm[n - 1]}</div>`);
    b.type = 'button'; b.onclick = () => b.classList.toggle('on'); host.appendChild(b); cols.push(b);
  }
  const all = document.getElementById('halve-all');
  if (all) all.onclick = () => cols.forEach((b, i) => setTimeout(() => { b.classList.add('on'); b.animate([{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }], 260); }, i * 120));
}

/* the "where does the negative go?" tiles */
function mountSigns() {
  document.querySelectorAll('.sg').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
}

/* =====================================================================
 * 1. Walk down the stairs, right past zero
 * ===================================================================== */
const BASES = {
  2: { b: [2, 1], t: '2' }, 3: { b: [3, 1], t: '3' }, 6: { b: [6, 1], t: '6' }, 10: { b: [10, 1], t: '10' },
  h: { b: [1, 2], t: '\\left(\\tfrac12\\right)', half: true }
};
const stairs = {
  title: 'Walk down the stairs, right past zero',
  height: 440,
  choices: [{ v: 2, label: tex('2^n') }, { v: 3, label: tex('3^n') }, { v: 6, label: tex('6^n') }, { v: 10, label: tex('10^n') }, { v: 'h', label: tex('\\left(\\tfrac12\\right)^n') }],
  intro: (v) => { const B = BASES[v]; return `Start at the top step: ${tex(`${B.t}^{3}=${qT(qPow(B.b, 3), '\\tfrac')}`)}. Each step <b>down</b>, the exponent drops by <b>1</b>. What happens to the value?`; },
  make(stage, v, ex) {
    const W = ex.W, H = 440, B = BASES[v], E = [3, 2, 1, 0, -1, -2, -3], N = 7, colW = (W - 36) / N, x0 = 18;
    const sy = (i) => 206 + i * 28, bT = B.t;
    const pw = (e) => `${bT}^{${e}}`, val = (e, d) => qT(qPow(B.b, e), d);
    const svg = add(stage, svgEl('svg', { class: 'st-svg', width: W, height: H }), 0, 0);
    E.forEach((e, i) => {
      svg.appendChild(svgEl('rect', { x: x0 + i * colW, y: sy(i), width: colW + 0.5, height: H - sy(i), class: 'st-step ' + (e < 0 ? 'neg' : e === 0 ? 'zero' : 'pos') }));
      const t = svgEl('text', { x: x0 + (i + 0.5) * colW, y: sy(i) + 40, class: 'st-exp', 'text-anchor': 'middle' }); t.textContent = String(e).replace('-', '−'); svg.appendChild(t);
    });
    const lt = svgEl('text', { x: x0 + 8, y: H - 14, class: 'st-explab' }); lt.textContent = 'exponent'; svg.appendChild(lt);
    const cards = E.map((e, i) => {
      const cd = add(stage, h('div', 'st-card ' + (e < 0 ? 'neg' : e === 0 ? 'zero' : 'pos'), `<div class="st-pow">${K(pw(e))}</div><div class="st-val">${K('=' + val(e))}</div><div class="st-x"></div>`), x0 + i * colW + 6, sy(i) - 192);
      cd.style.width = (colW - 12) + 'px'; if (i) hide(cd); return cd;
    });
    const divs = E.slice(1).map((e, i) => { const d = add(stage, h('div', 'st-div c', `÷ ${B.half ? K('\\tfrac12') : B.t}`), x0 + (i + 1) * colW, sy(i + 1) + 24); hide(d); return d; });
    const prevT = (i) => val(E[i - 1], '\\tfrac'), divT = B.half ? '\\tfrac12' : bT;
    const steps = [];
    for (let i = 1; i < N; i++) {
      const e = E[i], now = `${pw(e)}=${val(e, '\\tfrac')}`, calc = tex(`${prevT(i)}\\div ${divT}=${val(e, '\\tfrac')}`);
      let cap;
      if (e > 0) cap = i === 1 ? `${calc}: one fewer factor of ${tex(bT)}, so the value is <b>divided by ${tex(divT)}</b>${B.half ? ' (dividing by ½ <b>doubles</b>)' : ''}. ${tex(now)}.` : `Down another step: divide by ${tex(divT)} again. ${calc}, so ${tex(now)}.`;
      else if (e === 0) cap = `${calc}, so <b>${tex(`${pw(0)}=1`)}</b>. That’s why any nonzero base to the power 0 is 1.`;
      else if (e === -1) cap = `Keep going <b>past zero</b>! ${calc}, so ${tex(now)}. ` + (B.half ? 'It got <b>bigger</b>: dividing by ½ doubles.' : 'Small, but <b>not negative</b>.');
      else cap = `${calc}, so ${tex(now)}.` + (e === -3 && v === 2 ? ' That’s bounce 7 from the warm-up: ⅛ m.' : e === -3 && v === 10 ? ' As a decimal that’s <b>0.001</b>: tiny numbers like this are Lesson 4.' : e === -2 && !B.half ? ' The value keeps shrinking, but it never reaches 0 and never goes negative.' : '');
      steps.push({ cap, run: (c) => Promise.all([c.pop(divs[i - 1], 360), c.fadeIn(cards[i], 450, { delay: 200, from: 'translateY(-14px)' })]) });
    }
    steps.push({
      cap: B.half ? `Compare the pairs: ${tex('\\left(\\tfrac12\\right)^{-3}=8=2^3')}. A negative exponent on a fraction <b>flips</b> it: ${tex('\\tfrac12')} becomes 2. More on that in Section 4.`
        : `Compare the pairs: ${tex(`${pw(-3)}=\\dfrac{1}{${bT}^{3}}`)}, one over ${tex(`${bT}^{3}`)}. A negative exponent means <b>one over</b> the positive power: ${tex('a^{-n}=\\dfrac{1}{a^n}')}.`,
      run: async (c) => {
        const jobs = [];
        [4, 5, 6].forEach((i) => { const x = cards[i].querySelector('.st-x'); x.innerHTML = K(B.half ? `=2^{${-E[i]}}` : `=\\dfrac{1}{${bT}^{${-E[i]}}}`); jobs.push(c.fadeIn(x, 400, { delay: (i - 4) * 150 })); });
        [[2, 4, 'p1'], [1, 5, 'p2'], [0, 6, 'p3']].forEach(([a, b, cl], k) => { cards[a].classList.add(cl); cards[b].classList.add(cl); jobs.push(pulse(c, cards[a]), c.anim(cards[b], [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], 420, { delay: 300 + k * 150 })); });
        await Promise.all(jobs);
      }
    });
    return steps;
  }
};

/* =====================================================================
 * 2. Where the law comes from: cancel the factors
 * ===================================================================== */
const CANCEL = { a: ['6', 3, 8], b: ['2', 2, 5], c: ['10', 1, 4], d: ['x', 3, 7], e: ['5', 4, 4] };
const cancel = {
  title: 'Expand, cancel, and compare with the quotient law',
  height: 410,
  choices: ['a', 'b', 'c', 'd', 'e'].map((k) => ({ v: k, label: tex(`${CANCEL[k][0]}^{${CANCEL[k][1]}}\\div ${CANCEL[k][0]}^{${CANCEL[k][2]}}`) })),
  intro: (k) => { const [b, m, n] = CANCEL[k]; return `Two ways to work out ${tex(`${b}^{${m}}\\div ${b}^{${n}}`)}: write out every factor and cancel, or use the quotient law. They must give the <b>same answer</b>.`; },
  make(stage, k, ex) {
    const W = ex.W, H = 410, [b, m, n] = CANCEL[k], d = n - m, cx = W * 0.29, TY = 132, BAR = 172, BY = 212;
    const bs = b === 'x' ? 'x' : b, plural = b === 'x' ? '<i>x</i>’s' : `${b}’s`;
    add(stage, h('div', 'cn-head', K(`${b}^{${m}}\\div ${b}^{${n}}`)), 24, 14);
    const row = (count, y) => {
      const els = [];
      for (let i = 0; i < count; i++) { if (i) els.push(h('div', 'cn-x', '×')); const f = h('div', 'cn-f', K(bs)); f._f = true; els.push(f); }
      els.forEach((e) => stage.appendChild(e));
      const ws = els.map((e) => e.offsetWidth), gap = 6, tot = ws.reduce((a, w) => a + w, 0) + gap * (els.length - 1);
      let x = cx - tot / 2; els.forEach((e, i) => { at(e, x, y - e.offsetHeight / 2); x += ws[i] + gap; });
      return { els, facs: els.filter((e) => e._f), tot };
    };
    const top = row(m, TY), bot = row(n, BY);
    const bar = add(stage, h('div', 'cn-bar'), cx, BAR); bar.style.width = (Math.max(top.tot, bot.tot) + 30) + 'px';
    const left = [...top.els, ...bot.els, bar]; hide(...left);
    const slashes = []; for (let i = 0; i < m; i++) [top.facs[i], bot.facs[i]].forEach((f) => { const s = add(stage, h('div', 'cn-slash c'), 0, 0); s._f = f; hide(s); slashes.push(s); });
    const one = add(stage, h('div', 'cn-one c', '1'), cx, TY - 50), one2 = add(stage, h('div', 'cn-one c', '1'), cx, BY + 52); hide(one, one2);
    const rest = bot.facs.slice(m);
    const brace = add(stage, svgEl('svg', { class: 'cn-brace', width: 10, height: 30 }), 0, 0); hide(brace);
    const braceL = add(stage, h('div', 'cn-bl c'), cx, BY + 72); hide(braceL);
    const RX = W * 0.6, RW = W - RX - 20;
    const box = (y, lab, src, cls) => { const e = add(stage, h('div', 'cn-r ' + (cls || ''), `<div class="cn-rl">${lab}</div>${K(src)}`), RX, y); e.style.width = RW + 'px'; hide(e); return e; };
    const lA = box(16, 'Cancelling gives', d ? `\\dfrac{1}{${b}^{${d}}}` : '\\dfrac{1}{1}=1');
    const lB = box(104, 'The quotient law gives', `${b}^{${m}-${n}}=${b}^{${m - n}}`);
    const lC = box(178, 'Same expression, so', d ? `${b}^{${-d}}=\\dfrac{1}{${b}^{${d}}}` : `${b}^{0}=1`, 'big');
    const lD = d ? box(290, 'Flipped around', `\\dfrac{1}{${b}^{${-d}}}=${b}^{${d}}`) : null;
    const pos = (s) => { const f = s._f; at(s, parseFloat(f.style.left) + f.offsetWidth / 2, parseFloat(f.style.top) + f.offsetHeight / 2); };
    const steps = [{
      cap: `Write out every factor. ${tex(`${b}^{${m}}`)} is ${m === 1 ? `just one ${bs === 'x' ? '<i>x</i>' : b}` : `${WORD[m]} ${plural} multiplied`}, and ${tex(`${b}^{${n}}`)} is ${WORD[n]} ${plural}. Dividing puts them in a fraction.`,
      run: (c) => Promise.all(left.map((e, i) => c.fadeIn(e, 350, { delay: Math.min(i * 40, 500) })))
    }, {
      cap: `Each ${tex(bs)} on top <b>cancels</b> with ${bs === 'x' ? 'an' : 'a'} ${tex(bs)} on the bottom, because ${tex(`${bs}\\div ${bs}=1`)}. ${m === n ? `All ${WORD[m]} pairs cancel.` : `${WORD[m][0].toUpperCase() + WORD[m].slice(1)} pair${m > 1 ? 's' : ''} cancel${m > 1 ? '' : 's'}.`}`,
      run: async (c) => {
        const jobs = [];
        slashes.forEach((s, i) => { pos(s); s._f.classList.add('gone'); jobs.push(c.anim(s, [{ opacity: 0, transform: 'rotate(-58deg) scaleX(0)' }, { opacity: 1, transform: 'rotate(-58deg) scaleX(1)' }], 320, { delay: Math.floor(i / 2) * 260 })); });
        await Promise.all(jobs);
      }
    }, {
      cap: d ? `What’s left: <b>1 on top</b> and <b>${WORD[d]} ${plural} on the bottom</b>, so ${tex(`${b}^{${m}}\\div ${b}^{${n}}=\\dfrac{1}{${b}^{${d}}}`)}.` : `Everything cancels: ${tex('\\dfrac{1}{1}=1')}.`,
      run: async (c) => {
        const jobs = [c.pop(one, 380), c.fadeIn(lA, 400, { delay: 250 })];
        if (!d) jobs.push(c.pop(one2, 380, { delay: 120 }));
        if (d) {
          const f0 = rest[0], f1 = rest[rest.length - 1], x1 = parseFloat(f0.style.left), x2 = parseFloat(f1.style.left) + f1.offsetWidth, w = x2 - x1;
          brace.setAttribute('width', w + 4); brace.innerHTML = ''; brace.appendChild(svgEl('path', { d: `M2 2 Q2 12 ${w / 4} 12 L${w / 2 - 6} 12 Q${w / 2} 12 ${w / 2} 22 Q${w / 2} 12 ${w / 2 + 6} 12 L${w * 3 / 4} 12 Q${w} 12 ${w} 2`, class: 'cn-bpath' }));
          at(brace, x1 - 2, BY + 30); at(braceL, x1 + w / 2, BY + 74);
          braceL.innerHTML = `${WORD[d]} ${plural} left = ${K(`${b}^{${d}}`)}`;
          rest.forEach((f) => f.classList.add('left'));
          jobs.push(c.fadeIn(brace, 350, { delay: 150 }), c.fadeIn(braceL, 350, { delay: 300 }));
        }
        await Promise.all(jobs);
      }
    }, {
      cap: `Now the <b>quotient law</b> instead: same base, so subtract the exponents. ${tex(`${m}-${n}=${m - n}`)}, giving ${tex(`${b}^{${m - n}}`)}.`,
      run: (c) => c.fadeIn(lB, 400)
    }, {
      cap: d ? `It’s the <b>same expression</b>, so the two answers are equal: <b>${tex(`${b}^{${-d}}=\\dfrac{1}{${b}^{${d}}}`)}</b>. The ${d} counts the ${plural} left on the bottom.` : `Same expression, so ${tex(`${b}^{0}=1`)}: the zero exponent law from Lesson 1, proved again!`,
      run: (c) => c.pop(lC, 480)
    }];
    if (d) steps.push({
      cap: `Flipped around: ${tex(`\\dfrac{1}{${b}^{${-d}}}=${b}^{${d}}`)}. Dividing by ${tex(`${b}^{${-d}}`)} is the same as multiplying by ${tex(`${b}^{${d}}`)}.`,
      run: (c) => c.fadeIn(lD, 400)
    });
    return steps;
  }
};

/* =====================================================================
 * 2. Exponent hops on a number line
 * ===================================================================== */
const HOPS = {
  t1: { b: 10, k: 'mul', e1: 4, e2: -6, label: '10^4\\times10^{-6}' },
  t2: { b: 2, k: 'div', e1: -3, e2: 2, label: '2^{-3}\\div2^{2}' },
  a: { b: 5, k: 'mul', e1: 6, e2: -4, label: '5^6\\times5^{-4}' },
  b: { b: 2, k: 'mul', e1: 3, e2: -7, label: '2^3\\times2^{-7}' },
  c: { b: 3, k: 'rec', e1: -4, label: '\\dfrac{1}{3^{-4}}', chip: '\\tfrac{1}{3^{-4}}' },
  d: { b: 8, k: 'div', e1: -6, e2: -8, label: '\\dfrac{8^{-6}}{8^{-8}}', chip: '\\tfrac{8^{-6}}{8^{-8}}' },
  e: { b: 5, k: 'pow', e1: 2, e2: -1, label: '(5^2)^{-1}' }
};
const par = (e) => (e < 0 ? `(${e})` : String(e));
const mn = (e) => String(e).replace('-', '−'); // a real minus sign for caption text
const hops = {
  title: 'Exponent hops: add, subtract, or flip the sign',
  height: 420,
  choices: [{ v: 't1', label: tex(HOPS.t1.label) }, { v: 't2', label: tex(HOPS.t2.label) }, { sep: 'Example 2 check:' },
    ...['a', 'b', 'c', 'd', 'e'].map((k) => ({ v: k, label: `(${k})` }))],
  intro: (k) => `Simplify ${tex(HOPS[k].label)}. The exponents live on a <b>number line</b>: watch where they land.`,
  make(stage, k, ex) {
    const it = HOPS[k], W = ex.W, H = 420, LY = 232, sp = (W - 100) / 18, X = (e) => W / 2 + e * sp, b = it.b;
    add(stage, h('div', 'hp-head', K(it.label)), 24, 16);
    const law = { mul: 'Product law: <b>add</b> the exponents', div: 'Quotient law: <b>subtract</b> the exponents', rec: 'Bottom → top: the exponent <b>changes sign</b>', pow: 'Power law: <b>multiply</b> the exponents' }[it.k];
    const lawT = add(stage, h('div', 'hp-law', law), W - 24, 22); lawT.style.translate = '-100% 0'; hide(lawT);
    const svg = add(stage, svgEl('svg', { class: 'hp-svg', width: W, height: H }), 0, 0);
    const defs = svgEl('defs'), mk = svgEl('marker', { id: 'hpArr', viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' });
    mk.appendChild(svgEl('path', { d: 'M0 0 L10 5 L0 10 z', class: 'hp-ah' })); defs.appendChild(mk); svg.appendChild(defs);
    svg.appendChild(svgEl('line', { x1: X(-9) - 22, y1: LY, x2: X(9) + 22, y2: LY, class: 'hp-axis' }));
    for (let e = -9; e <= 9; e++) {
      svg.appendChild(svgEl('line', { x1: X(e), y1: LY - (e ? 7 : 11), x2: X(e), y2: LY + (e ? 7 : 11), class: 'hp-tick' + (e ? '' : ' z') }));
      const t = svgEl('text', { x: X(e), y: LY + 32, class: 'hp-tl' + (e ? '' : ' z'), 'text-anchor': 'middle' }); t.textContent = String(e).replace('-', '−'); svg.appendChild(t);
    }
    const tl = svgEl('text', { x: X(-9) - 22, y: LY - 16, class: 'hp-axl' }); tl.textContent = 'exponent'; svg.appendChild(tl);
    const dot = add(stage, h('div', 'hp-dot c'), X(it.e1), LY), bub = add(stage, h('div', 'hp-bub c', K(`${b}^{${it.e1}}`)), X(it.e1), LY + 70);
    hide(dot, bub);
    const ghost = add(stage, h('div', 'hp-dot ghost c'), 0, LY), gbub = add(stage, h('div', 'hp-bub ghost c'), 0, LY + 70); hide(ghost, gbub);
    const hopL = add(stage, h('div', 'hp-hop c'), 0, 0), hopL2 = add(stage, h('div', 'hp-hop two c'), 0, 0); hide(hopL, hopL2);
    const arc = (a, z, cls, fixed) => {
      const hgt = fixed || 30 + Math.abs(z - a) * 9, xa = X(a), xz = X(z), cy = LY - 10 - 2 * hgt;
      const p = svgEl('path', { d: `M ${xa} ${LY - 10} Q ${(xa + xz) / 2} ${cy} ${xz} ${LY - 10}`, class: 'hp-arc ' + (cls || ''), 'marker-end': 'url(#hpArr)' });
      svg.appendChild(p); return { p, peak: [(xa + xz) / 2, LY - 10 - hgt], xa, xz, cy };
    };
    const drawArc = async (c, A, ms = 650) => { const len = A.p.getTotalLength ? A.p.getTotalLength() || 400 : 400; A.p.style.strokeDasharray = A.p.classList.contains('dash') ? '7 6' : len; if (!A.p.classList.contains('dash')) { A.p.style.strokeDashoffset = len; await c.anim(A.p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], ms); } else await c.anim(A.p, [{ opacity: 0 }, { opacity: 1 }], ms); };
    const travel = (c, el, A, dy = 0) => { // move an element along an arc
      const kf = []; for (let i = 0; i <= 12; i++) { const t = i / 12, x = (1 - t) * (1 - t) * A.xa + 2 * t * (1 - t) * (A.xa + A.xz) / 2 + t * t * A.xz, y = (1 - t) * (1 - t) * (LY - 10) + 2 * t * (1 - t) * A.cy + t * t * (LY - 10); kf.push({ left: x + 'px', top: (i === 0 || i === 12 ? LY + dy : y + dy + 10) + 'px' }); }
      return c.anim(el, kf, 750, { easing: 'ease-in-out' });
    };
    // the written chain underneath
    const chainEl = add(stage, h('div', 'hp-chain'), 24, 326);
    const piece = (src) => { const e = h('span', 'hp-piece', K(src)); chainEl.appendChild(e); hide(e); return e; };
    piece(it.label).style.opacity = 1;
    const r = it.k === 'mul' ? it.e1 + it.e2 : it.k === 'div' ? it.e1 - it.e2 : it.k === 'rec' ? -it.e1 : it.e1 * it.e2;
    const B = b ** Math.abs(r), Bt = tn(B);
    const steps = [];
    const start = (cap) => steps.push({ cap, run: (c) => Promise.all([c.fadeIn(lawT, 350), c.pop(dot, 380, { delay: 150 }), c.fadeIn(bub, 380, { delay: 250 })]) });
    const move = (cap, src, cls, hopTxt) => {
      const pc = piece(src);
      steps.push({
        cap, run: async (c) => {
          const A = arc(it.e1, r, cls); at(hopL, A.peak[0], A.peak[1] - 22); hopL.innerHTML = hopTxt;
          await Promise.all([drawArc(c, A), travel(c, dot, A), travel(c, bub, A, 70), c.fadeIn(hopL, 300, { delay: 250 })]);
          bub.innerHTML = K(`${b}^{${r}}`); dot.classList.add(r < 0 ? 'neg' : 'pos');
          await Promise.all([c.pop(bub, 350), c.fadeIn(pc, 350)]);
        }
      });
    };
    if (it.k === 'mul') {
      start(`Same base, <b>multiplying</b>, so <b>add</b> the exponents: ${tex(`${it.e1}+${par(it.e2)}`)}. Start at <b>${mn(it.e1)}</b>.`);
      move(it.e2 < 0 ? `Adding ${tex(String(it.e2))} means hop <b>${-it.e2} to the left</b>. We land on <b>${mn(r)}</b>: ${tex(`${it.e1}+${par(it.e2)}=${r}`)}.` : `Hop <b>${it.e2} to the right</b> and land on <b>${mn(r)}</b>.`,
        `=${b}^{${it.e1}+${par(it.e2)}}=${b}^{${r}}`, '', `+ ${par(it.e2).replace('-', '−')}`);
    } else if (it.k === 'div') {
      start(`Same base, <b>dividing</b>, so <b>subtract</b> the exponents: ${tex(`${it.e1}-${par(it.e2)}`)}. Start at <b>${mn(it.e1)}</b>.`);
      move(it.e2 < 0 ? `Subtracting a negative is the same as adding: ${tex(`-${par(it.e2)}=+${-it.e2}`)}. Hop <b>${-it.e2} to the right</b> and land on <b>${mn(r)}</b>.` : `Subtracting ${it.e2} means hop <b>${it.e2} to the left</b>. We land on <b>${mn(r)}</b>: ${tex(`${it.e1}-${it.e2}=${r}`)}.`,
        `=${b}^{${it.e1}-${par(it.e2)}}=${b}^{${r}}`, '', `− ${par(it.e2).replace('-', '−')}`);
    } else if (it.k === 'rec') {
      start(`${tex(`${b}^{${it.e1}}`)} is on the <b>bottom</b> of the fraction, with a negative exponent. Start at <b>${mn(it.e1)}</b>.`);
      move(`Move it across the fraction bar to the top, and its exponent <b>changes sign</b>: ${mn(it.e1)} becomes ${mn(r)}. On the line, that’s a <b>mirror</b> through 0.`, `=${b}^{${r}}`, 'dash', 'flip the sign');
    } else {
      start(`Power of a power, so <b>multiply</b> the exponents: ${tex(`${it.e1}\\times${par(it.e2)}`)}. Start at <b>${mn(it.e1)}</b>.`);
      move(`Multiplying by ${tex('-1')} just <b>changes the sign</b>: a mirror through 0. We land on <b>${mn(r)}</b>.`, `=${b}^{${it.e1}\\times${par(it.e2)}}=${b}^{${r}}`, 'dash', `× ${par(it.e2).replace('-', '−')}`);
    }
    if (r > 0) {
      const pc = piece(`=${Bt}`);
      steps.push({ cap: `The exponent is <b>positive</b>, so just evaluate: ${tex(`${b}^{${r}}=${Bt}`)}.`, run: (c) => Promise.all([c.pop(pc, 420), pulse(c, bub)]) });
    } else if (r < 0) {
      const p1 = piece(`=\\dfrac{1}{${b}^{${-r}}}`), p2 = piece(`=\\dfrac{1}{${Bt}}`);
      steps.push({
        cap: `${tex(`${b}^{${r}}`)} has a <b>negative</b> exponent. Rewrite it as <b>one over</b> the positive power: ${tex(`${b}^{${r}}=\\dfrac{1}{${b}^{${-r}}}`)}.`,
        run: async (c) => {
          const A = arc(r, -r, 'dash ghost', 30); at(hopL2, A.peak[0], A.peak[1] - 16); hopL2.innerHTML = 'one over';
          at(ghost, X(-r), LY); at(gbub, X(-r), LY + 70); gbub.innerHTML = K(`${b}^{${-r}}`);
          await Promise.all([drawArc(c, A, 450), c.fadeIn(hopL2, 300), c.pop(ghost, 380, { delay: 250 }), c.fadeIn(gbub, 380, { delay: 300 }), c.fadeIn(p1, 380, { delay: 300 })]);
        }
      });
      steps.push({ cap: `Evaluate: ${tex(`${b}^{${-r}}=${Bt}`)}, so the answer is <b>${tex(`\\dfrac{1}{${Bt}}`)}</b>. Small and positive.`, run: (c) => { gbub.innerHTML = K(`${b}^{${-r}}=${Bt}`); return Promise.all([c.pop(p2, 420), pulse(c, gbub)]); } });
    }
    return steps;
  }
};

/* =====================================================================
 * 2. Move it across the fraction bar
 * ===================================================================== */
const MV = {
  m1: { label: '4x^{-2}', t: [['c', '4'], ['x', 'x^{-2}']], b: [], steps: [
    { cap: `The exponent ${tex('-2')} is attached to ${tex('x')} <b>only</b>. The 4 has no exponent of its own (it’s ${tex('4^1')}), so it isn’t affected.`, hl: { neg: ['x'], keep: ['c'] } },
    { cap: `Move ${tex('x^{-2}')} across the fraction bar. Its exponent <b>flips sign</b>: ${tex('x^{-2}')} on top becomes ${tex('x^{2}')} on the bottom.`, st: { t: [['c', '4']], b: [['x', 'x^{2}']] } },
    { cap: `${tex('4x^{-2}=\\dfrac{4}{x^2}')}. The 4 stays on top, so it is <b>not</b> ${tex('\\dfrac{1}{4x^2}')}.`, res: '4x^{-2}=\\dfrac{4}{x^2}', bad: '\\dfrac{1}{4x^2}' }] },
  m2: { label: '(4x)^{-2}', t: [['b', '(4x)^{-2}']], b: [], steps: [
    { cap: `The brackets make ${tex('(4x)')} <b>one base</b>, so the exponent ${tex('-2')} touches the 4 <b>and</b> the ${tex('x')}.`, hl: { neg: ['b'] } },
    { cap: `The <b>whole bracket</b> moves across the bar, and ${tex('-2')} becomes ${tex('2')}.`, st: { t: [], b: [['b', '(4x)^{2}']] } },
    { cap: `Square <b>both</b> factors in the bracket: ${tex('(4x)^2=4^2x^2=16x^2')}.`, st: { t: [], b: [['b', '16x^{2}']] } },
    { cap: `${tex('(4x)^{-2}=\\dfrac{1}{16x^2}')}, but ${tex('4x^{-2}=\\dfrac{4}{x^2}')}. The brackets change everything!`, res: '(4x)^{-2}=\\dfrac{1}{16x^2}' }] },
  m3: { label: '3a^2b^{-4}', t: [['c', '3'], ['a', 'a^{2}'], ['b', 'b^{-4}']], b: [], steps: [
    { cap: `Only ${tex('b')} has a negative exponent. The 3 and ${tex('a^2')} have positive exponents, so they stay on top.`, hl: { neg: ['b'], keep: ['c', 'a'] } },
    { cap: `Move ${tex('b^{-4}')} to the bottom, where it becomes ${tex('b^{4}')}.`, st: { t: [['c', '3'], ['a', 'a^{2}']], b: [['b', 'b^{4}']] } },
    { cap: `${tex('3a^2b^{-4}=\\dfrac{3a^2}{b^4}')}. Everything with a positive exponent stayed where it was.`, res: '3a^2b^{-4}=\\dfrac{3a^2}{b^4}' }] },
  m4: { label: '\\dfrac{2}{5y^{-3}}', chip: '\\tfrac{2}{5y^{-3}}', t: [['c', '2']], b: [['d', '5'], ['y', 'y^{-3}']], steps: [
    { cap: `This time the negative exponent is on the <b>bottom</b>. Only ${tex('y^{-3}')} moves; the 5 stays on the bottom.`, hl: { neg: ['y'], keep: ['d'] } },
    { cap: `Move ${tex('y^{-3}')} up to the top. It becomes ${tex('y^{3}')}.`, st: { t: [['c', '2'], ['y', 'y^{3}']], b: [['d', '5']] } },
    { cap: `${tex('\\dfrac{2}{5y^{-3}}=\\dfrac{2y^3}{5}')}. A negative exponent on the bottom moves <b>up</b>.`, res: '\\dfrac{2}{5y^{-3}}=\\dfrac{2y^3}{5}' }] },
  ea: { label: '\\dfrac{7^5}{7^{-2}}', chip: '\\tfrac{7^5}{7^{-2}}=7^7', claim: '7^7', ok: true, t: [['p', '7^{5}']], b: [['q', '7^{-2}']], steps: [
    { cap: `${tex('7^{-2}')} is on the bottom with a negative exponent, so it can move up. ${tex('7^5')} stays.`, hl: { neg: ['q'], keep: ['p'] } },
    { cap: `Move it to the top: ${tex('7^{-2}')} on the bottom becomes ${tex('7^{2}')} on top.`, st: { t: [['p', '7^{5}'], ['q', '\\cdot7^{2}']], b: [] } },
    { cap: `Product law: ${tex('7^5\\cdot7^2=7^{5+2}=7^7')}.`, st: { t: [['p', '7^{7}']], b: [] } },
    { cap: `The statement says ${tex('7^7')}. <b>True!</b> The quotient law agrees: ${tex('7^{5-(-2)}=7^7')}.`, verdict: true }] },
  eb: { label: '\\dfrac{7^5}{7^{-2}}', chip: '\\tfrac{7^5}{7^{-2}}=7^3', claim: '7^3', t: [['p', '7^{5}']], b: [['q', '7^{-2}']], steps: [
    { cap: `Same left side: ${tex('7^{-2}')} is on the bottom with a negative exponent, so it can move up.`, hl: { neg: ['q'], keep: ['p'] } },
    { cap: `Move it to the top: it becomes ${tex('7^{2}')}.`, st: { t: [['p', '7^{5}'], ['q', '\\cdot7^{2}']], b: [] } },
    { cap: `Product law: ${tex('7^5\\cdot7^2=7^7')}.`, st: { t: [['p', '7^{7}']], b: [] } },
    { cap: `We got ${tex('7^7')}, not ${tex('7^3')}. <b>False.</b> ${tex('7^3')} comes from doing ${tex('5-2')} instead of ${tex('5-(-2)')}.`, verdict: false }] },
  ec: { label: 'x^{-4}', chip: 'x^{-4}=\\tfrac{1}{x^4}', claim: '\\dfrac{1}{x^4}', t: [['x', 'x^{-4}']], b: [], steps: [
    { cap: `Write ${tex('x^{-4}')} over 1. Its exponent is negative, so it moves.`, hl: { neg: ['x'] } },
    { cap: `Across the bar, ${tex('x^{-4}')} becomes ${tex('x^{4}')}. Only 1 is left on top.`, st: { t: [], b: [['x', 'x^{4}']] } },
    { cap: `${tex('x^{-4}=\\dfrac{1}{x^4}')}, exactly the statement. <b>True!</b>`, verdict: true }] },
  ed: { label: '5x^{-2}', chip: '5x^{-2}=\\tfrac{1}{5x^2}', claim: '\\dfrac{1}{5x^2}', t: [['c', '5'], ['x', 'x^{-2}']], b: [], steps: [
    { cap: `Only ${tex('x')} carries the ${tex('-2')}. The 5 stays on top.`, hl: { neg: ['x'], keep: ['c'] } },
    { cap: `Move ${tex('x^{-2}')} down. It becomes ${tex('x^{2}')}.`, st: { t: [['c', '5']], b: [['x', 'x^{2}']] } },
    { cap: `We got ${tex('\\dfrac{5}{x^2}')}, but the statement moved the 5 too. <b>False.</b>`, verdict: false }] }
};
const move = {
  title: 'Move it across the fraction bar, flip the sign',
  height: 400,
  choices: [...['m1', 'm2', 'm3', 'm4'].map((k) => ({ v: k, label: tex(MV[k].chip || MV[k].label) })), { sep: 'Example 3 check:' },
    ...['ea', 'eb', 'ec', 'ed'].map((k) => ({ v: k, label: `(${k[1]})` }))],
  intro: (k) => (MV[k].claim ? `True or false: ${tex(`${MV[k].label}=${MV[k].claim}`)}? Find what the negative exponent is <b>attached to</b>, and move only that.`
    : `Rewrite ${tex(MV[k].label)} with positive exponents. Anything can be written <b>over 1</b>, so picture a fraction bar. Which factors have a negative exponent?`),
  make(stage, k, ex) {
    const it = MV[k], W = ex.W, H = 400, cx = W * 0.32, TY = 128, BY = 268, BAR = 198, FS = 56;
    const els = {}, wOf = (src) => measure(stage, K(src), FS)[0];
    const bar = add(stage, h('div', 'mv-bar'), cx, BAR);
    const mk = (key, src) => { const e = add(stage, h('div', 'mv-f', K(src)), 0, 0); e.style.fontSize = FS + 'px'; els[key] = { el: e, src }; return els[key]; };
    function plan(st) {
      const rows = { t: st.t.length ? st.t : [['_1t', '1']], b: st.b.length ? st.b : [['_1b', '1']] }, pos = {};
      let maxW = 0;
      for (const r of ['t', 'b']) {
        const items = rows[r].map(([key, s]) => ({ key, s, w: wOf(s) })), gap = 4, tot = items.reduce((a, i) => a + i.w, 0) + gap * (items.length - 1);
        maxW = Math.max(maxW, tot); let x = cx - tot / 2;
        items.forEach((i) => { pos[i.key] = { x, y: r === 't' ? TY : BY, s: i.s, row: r }; x += i.w + gap; });
      }
      return { pos, barW: maxW + 40 };
    }
    { const { pos, barW } = plan(it); for (const key in pos) { const f = mk(key, pos[key].s); at(f.el, pos[key].x, pos[key].y); f.row = pos[key].row; } bar.style.width = barW + 'px'; }
    async function swap(c, f, src, delay) {
      f.src = src;
      if (!c.fast) await c.sleep(delay);
      f.el.innerHTML = K(src);
      if (!c.fast) await c.anim(f.el, [{ color: '#c93a33', transform: 'scale(1.2)' }, { color: '#12805a', transform: 'scale(1)' }], 380);
    }
    async function apply(c, st) {
      const { pos, barW } = plan(st), jobs = [];
      for (const key in els) if (!pos[key]) { const e = els[key].el; delete els[key]; jobs.push(c.anim(e, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.6)' }], 350).then(() => e.remove())); }
      for (const key in pos) {
        const p = pos[key];
        if (!els[key]) { const f = mk(key, p.s); at(f.el, p.x, p.y); f.row = p.row; jobs.push(c.fadeIn(f.el, 400, { delay: 350 })); continue; }
        const f = els[key], cross = f.row !== p.row, changed = f.src !== p.s;
        const fx = parseFloat(f.el.style.left), fy = parseFloat(f.el.style.top);
        const kf = cross ? [{ left: fx + 'px', top: fy + 'px' }, { left: Math.max(fx, p.x) + 90 + 'px', top: BAR + 'px' }, { left: p.x + 'px', top: p.y + 'px' }] : [{ left: fx + 'px', top: fy + 'px' }, { left: p.x + 'px', top: p.y + 'px' }];
        jobs.push(c.anim(f.el, kf, cross ? 950 : 550));
        if (changed) jobs.push(swap(c, f, p.s, cross ? 480 : 200));
        if (cross) { f.el.classList.remove('neg'); f.el.classList.add('moved'); }
        f.row = p.row;
      }
      jobs.push(c.anim(bar, [{ width: bar.style.width }, { width: barW + 'px' }], 500));
      await Promise.all(jobs);
    }
    // right-hand panel: the statement to test, or the result
    const RX = W * 0.62, RW = W - RX - 24;
    let claim = null, stamp = null, res = null;
    if (it.claim) {
      claim = add(stage, h('div', 'mv-claim', `<div class="mv-cl">Statement</div>${K(`${it.label}=${it.claim}`)}`), RX, 40); claim.style.width = RW + 'px';
      stamp = add(stage, h('div', 'mv-stamp ' + (it.steps[it.steps.length - 1].verdict ? 'yes' : 'no'), it.steps[it.steps.length - 1].verdict ? 'TRUE' : 'FALSE'), RX + RW / 2, 268); stamp.style.translate = '-50% -50%'; hide(stamp);
    } else {
      res = add(stage, h('div', 'mv-res'), RX, 96); res.style.width = RW + 'px'; hide(res);
    }
    return it.steps.map((s) => ({
      cap: s.cap,
      run: async (c) => {
        if (s.hl) {
          const jobs = [];
          (s.hl.neg || []).forEach((key) => { els[key].el.classList.add('neg'); jobs.push(pulse(c, els[key].el)); });
          (s.hl.keep || []).forEach((key) => els[key].el.classList.add('keep'));
          await Promise.all(jobs);
        }
        if (s.st) { Object.values(els).forEach((f) => f.el.classList.remove('keep')); await apply(c, s.st); }
        if (s.res) {
          res.innerHTML = `<div class="mv-cl">Positive exponents</div>${K(s.res)}` + (s.bad ? `<div class="mv-bad">${K(`\\neq${s.bad}`)}</div>` : '');
          await c.pop(res, 450);
        }
        if (s.verdict != null) await c.anim(stamp, [{ opacity: 0, transform: 'scale(1.8) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' });
      }
    }));
  }
};

/* =====================================================================
 * 3. Sort by variable: numbers together, each letter on its own
 * ===================================================================== */
// tokens: '4' (number), 'x2' / 'y-5' / 'y' (variable with exponent), or { n: LaTeX, v: [p, q] } for a special number
const SO = {
  t1: { orig: '(2x^3y^{-2})(5x^{-7}y)', pre: [{ cap: 'Multiplying: drop the brackets and line everything up.' }], top: ['2', 'x3', 'y-2', '5', 'x-7', 'y'], bot: [] },
  a: { orig: 'a^{-5}\\times a^{-2}', same: true, join: '\\times', top: ['a-5', 'a-2'], bot: [] },
  b: { orig: '8x^3\\div2x^9', pre: [{ cap: 'Write the division as a fraction.' }], top: ['8', 'x3'], bot: ['2', 'x9'] },
  c: { orig: '\\dfrac{y^4}{3y^{-6}}', chip: '\\tfrac{y^4}{3y^{-6}}', same: true, top: ['y4'], bot: ['3', 'y-6'] },
  d: { orig: '(-3x)^{-3}', pre: [{ cap: `Power of a product: the <b>exponent</b> ${tex('-3')} outside goes to <b>both</b> factors inside the bracket, ${tex('-3')} and ${tex('x')}.` }], top: [{ n: '(-3)^{-3}', v: [-1, 27] }, 'x-3'], bot: [],
    coef: '(-3)^{-3}=\\dfrac{1}{(-3)^3}=-\\dfrac{1}{27}', coefCap: `${tex('(-3)^{-3}=\\dfrac{1}{(-3)^3}=\\dfrac{1}{-27}')}: an odd power of a negative is <b>negative</b>.` },
  e: { orig: '\\dfrac{9a^{-4}}{3b^{-2}}', chip: '\\tfrac{9a^{-4}}{3b^{-2}}', same: true, top: ['9', 'a-4'], bot: ['3', 'b-2'] },
  f: { orig: '\\dfrac{(2p)^{-2}}{7q^3}', chip: '\\tfrac{(2p)^{-2}}{7q^3}', pre: [{ cap: `Power of a product first: ${tex('(2p)^{-2}=2^{-2}p^{-2}')}.` }], top: [{ n: '2^{-2}', v: [1, 4] }, 'p-2'], bot: ['7', 'q3'],
    coef: '\\dfrac{2^{-2}}{7}=\\dfrac{1}{2^2\\times7}=\\dfrac{1}{28}', coefCap: `${tex('2^{-2}=\\tfrac14')} on top and 7 on the bottom: ${tex('\\dfrac{1}{4\\times7}=\\dfrac{1}{28}')}.` },
  e5: { orig: '4x^2y^{-5}z^{-3}\\div\\dfrac{12x^7y^4z^{-2}}{x^4y^{-2}z^3}', chip: '\\text{Ex. 5}',
    pre: [{ tex: '4x^2y^{-5}z^{-3}\\times\\dfrac{x^4y^{-2}z^3}{12x^7y^4z^{-2}}', cap: 'Dividing by a fraction means multiplying by its <b>reciprocal</b>: flip the second fraction.' }, { cap: 'Put everything over <b>one</b> fraction bar.' }],
    top: ['4', 'x2', 'y-5', 'z-3', 'x4', 'y-2', 'z3'], bot: ['12', 'x7', 'y4', 'z-2'] }
};
const VCOL = ['v1', 'v2', 'v3'];
const sorter = {
  title: 'Sort it out: numbers together, each letter on its own',
  height: 430,
  choices: [{ v: 't1', label: tex(SO.t1.orig) }, { sep: 'Example 4 check:' }, ...['a', 'b', 'c', 'd', 'e', 'f'].map((k) => ({ v: k, label: `(${k})` })), { sep: 'Example 5 check:' }, { v: 'e5', label: 'Ex. 5' }],
  intro: (k) => `Simplify ${tex(SO[k].orig)} and write it with positive exponents. Plan: <b>numbers</b> together, then <b>each variable</b> on its own.`,
  make(stage, k, ex) {
    const it = SO[k], W = ex.W, H = 430;
    // parse tokens
    let id = 0;
    const parse = (t, row) => {
      if (typeof t === 'object') return { id: id++, num: true, n: t.n, v: t.v, row };
      const m = /^([a-z])(-?\d+)?$/.exec(t);
      if (m) return { id: id++, x: m[1], e: m[2] == null ? 1 : Number(m[2]), row };
      return { id: id++, num: true, n: t, v: [Number(t), 1], row };
    };
    const top = it.top.map((t) => parse(t, 't')), bot = it.bot.map((t) => parse(t, 'b')), all = [...top, ...bot];
    const vars = []; all.forEach((t) => { if (t.x && !vars.includes(t.x)) vars.push(t.x); });
    const col = (x) => VCOL[vars.indexOf(x)] || 'v1';
    const tokT = (t) => `\\htmlClass{so-tk tk${t.id} ${t.x ? col(t.x) : 'nm'}}{${t.x ? (t.e === 1 ? t.x : `${t.x}^{${t.e}}`) : t.n}}`;
    const rowT = (ts) => ts.map((t, i) => (i && it.join ? it.join + ' ' : i && t.num ? '\\cdot ' : '') + tokT(t)).join('');
    const work = bot.length ? `\\dfrac{${rowT(top) || '1'}}{${rowT(bot)}}` : rowT(top);
    // the lines: history (small, above) and the current line (big)
    const lines = it.same ? [] : [...(it.pre || [])];
    const hist = add(stage, h('div', 'so-hist'), 24, 8), cur = add(stage, h('div', 'so-cur', K(it.same ? work : it.orig)), 24, 58);
    // bins
    const nums = all.filter((t) => t.num), bins = [];
    const tops = nums.filter((t) => t.row === 't'), bots = nums.filter((t) => t.row === 'b');
    let coefV = [1, 1]; tops.forEach((t) => (coefV = qMul(coefV, t.v))); bots.forEach((t) => (coefV = qMul(coefV, [t.v[1], t.v[0]])));
    coefV = Q(coefV[0], coefV[1]);
    if (nums.length) {
      const left = bots.length ? `\\dfrac{${tops.map((t) => t.n).join('\\times') || 1}}{${bots.map((t) => t.n).join('\\times')}}` : tops.map((t) => t.n).join('\\times');
      const src = it.coef || (left === qT(coefV) ? left : `${left}=${qT(coefV)}`);
      bins.push({ kind: 'num', toks: nums, src });
    }
    vars.forEach((x) => {
      const ts = all.filter((t) => t.x === x).sort((a, b) => (a.row === b.row ? 0 : a.row === 't' ? -1 : 1));
      const s = ts.reduce((a, t) => a + (t.row === 't' ? t.e : -t.e), 0);
      const terms = ts.map((t, i) => (t.row === 't' ? (i === 0 ? String(t.e) : t.e < 0 ? `+(${t.e})` : `+${t.e}`) : (t.e < 0 ? `-(${t.e})` : `-${t.e}`)));
      bins.push({ kind: 'var', x, toks: ts, terms, s });
    });
    const nb = bins.length, gap = 14, bw = Math.min(300, (W - 48 - gap * (nb - 1)) / nb), bx0 = (W - nb * bw - gap * (nb - 1)) / 2, BYp = 150, BH = 150;
    bins.forEach((bn, i) => {
      const el = add(stage, h('div', 'so-bin ' + (bn.kind === 'num' ? 'nm' : col(bn.x))), bx0 + i * (bw + gap), BYp); el.style.width = bw + 'px'; el.style.height = BH + 'px';
      el.innerHTML = `<div class="so-bh">${bn.kind === 'num' ? 'Numbers' : K(bn.x)}</div>`;
      const body = h('div', 'so-bb'); el.appendChild(body);
      if (bn.kind === 'num') { bn.slot = h('div', 'so-coef', K(bn.src)); body.appendChild(bn.slot); hide(bn.slot); }
      else {
        const line = h('div', 'so-terms'); body.appendChild(line);
        bn.slots = bn.terms.map((t, i) => { const s = h('span', 'so-term', K((i ? '{}' : '') + t)); line.appendChild(s); hide(s); return s; });
        bn.eq = h('span', 'so-term eq', bn.toks.length > 1 || (bn.toks[0].row === 'b' && bn.toks[0].e < 0) ? K(`{}=${bn.s}`) : ''); line.appendChild(bn.eq); hide(bn.eq);
        bn.pow = h('div', 'so-pow', K(bn.s === 0 ? `${bn.x}^{0}=1` : `${bn.x}^{${bn.s}}`)); body.appendChild(bn.pow); hide(bn.pow);
      }
      if (nb >= 4) el.classList.add('tight');
      bn.el = el; hide(el);
    });
    // result
    const cT = coefV[0] === 1 && coefV[1] === 1 ? '' : coefV[0] === -1 && coefV[1] === 1 ? '-' : qT(coefV, '\\tfrac');
    const vT = (x, s) => `\\htmlClass{${col(x)}}{${Math.abs(s) === 1 ? (s === 1 ? x : `${x}^{-1}`) : `${x}^{${s}}`}}`;
    const mid = cT + bins.filter((bn) => bn.kind === 'var' && bn.s !== 0).map((bn) => vT(bn.x, bn.s)).join('') || '1';
    const pos = bins.filter((bn) => bn.kind === 'var' && bn.s > 0), negs = bins.filter((bn) => bn.kind === 'var' && bn.s < 0);
    const nP = Math.abs(coefV[0]), dP = coefV[1];
    const numS = ((nP !== 1 || !pos.length) ? tn(nP) : '') + pos.map((bn) => vT(bn.x, bn.s)).join('');
    const denS = (dP !== 1 ? tn(dP) : '') + negs.map((bn) => vT(bn.x, -bn.s)).join('');
    const fin = (coefV[0] < 0 ? '-' : '') + (denS ? `\\dfrac{${numS}}{${denS}}` : numS);
    const resEl = add(stage, h('div', 'so-res'), 24, 332);
    const r1 = h('span', 'so-rp', K('=' + mid)), r2 = h('span', 'so-rp fin', K('=' + fin)); resEl.append(r1, r2); hide(r1, r2);
    const steps = [];
    // rewriting lines
    lines.forEach((ln, i) => {
      const src = i === lines.length - 1 ? work : ln.tex;
      steps.push({
        cap: ln.cap, run: async (c) => {
          hist.innerHTML = cur.innerHTML; cur.innerHTML = K('=' + src);
          await Promise.all([c.fadeIn(hist, 350, { from: 'translateY(30px) scale(1.2)' }), c.fadeIn(cur, 450, { delay: 150 })]);
        }
      });
    });
    // one step per bin
    bins.forEach((bn) => {
      let cap;
      if (bn.kind === 'num') {
        const tp = tops.map((t) => t.n), bt = bots.map((t) => t.n);
        cap = `<b>Numbers:</b> ` + (it.coefCap || (bt.length ? `${tp.length ? tp.join(' × ') : '1'} on top, ${bt.join(' × ')} on the bottom: ${tex(bn.src)}.` : tp.length > 1 ? `multiply them: ${tex(bn.src)}.` : `just ${tex(bn.src)}.`));
      } else {
        const anyB = bn.toks.some((t) => t.row === 'b'), anyT = bn.toks.some((t) => t.row === 't');
        const lead = `${K(`\\htmlClass{${col(bn.x)}}{${bn.x}}`)}: `, t0 = bn.toks[0];
        if (bn.toks.length === 1) cap = lead + (anyB ? `it’s on the bottom, so its exponent <b>changes sign</b>: ${tex(String(t0.e))} becomes ${tex(String(bn.s))}.` : `there’s only one, so it keeps its exponent, ${tex(String(bn.s))}.`);
        else cap = lead + (anyB && anyT ? 'exponents on top <b>add</b>, exponents on the bottom <b>subtract</b>: ' : anyB ? 'all on the bottom, so <b>subtract</b> each one: ' : 'same base, multiplying, so <b>add</b>: ') + `${tex(`${bn.terms.join('')}=${bn.s}`)}.`;
      }
      steps.push({
        cap, run: async (c) => {
          const jobs = [c.fadeIn(bn.el, 300)];
          if (bn.kind === 'num') {
            bn.toks.forEach((t, i) => { const tk = cur.querySelector('.tk' + t.id); if (tk) tk.classList.add('used'); jobs.push(fly(c, stage, tk, bn.slot, t.n, { fs: 26, delay: i * 160, cls: 'nm' })); });
            await Promise.all(jobs); bn.slot.style.opacity = 0; await c.fadeIn(bn.slot, 350);
          } else {
            bn.toks.forEach((t, i) => { const tk = cur.querySelector('.tk' + t.id); if (tk) tk.classList.add('used'); jobs.push(fly(c, stage, tk, bn.slots[i], t.e === 1 ? t.x : `${t.x}^{${t.e}}`, { fs: 26, delay: i * 170, cls: col(t.x) })); });
            await Promise.all(jobs);
            await Promise.all([c.fadeIn(bn.eq, 300), c.pop(bn.pow, 380, { delay: 150 })]);
          }
        }
      });
    });
    steps.push({
      cap: `Put the pieces together: ${K(mid)}.` + (negs.length ? ' Not finished: there are <b>negative exponents</b> left.' : fin !== mid ? ' All the exponents are positive already.' : ' All exponents are positive, so that’s the answer.'),
      run: (c) => Promise.all([c.fadeIn(r1, 400), ...bins.map((bn) => pulse(c, bn.kind === 'num' ? bn.slot : bn.pow))])
    });
    if (fin !== mid) steps.push({
      cap: !negs.length ? `Tidy up: ${tex(qT(coefV, '\\tfrac'))} means <b>divide by ${dP}</b>, so the ${dP} goes on the bottom: <b>${K(fin)}</b>.` : `Last step, <b>positive exponents</b>: ${negs.map((bn) => K(vT(bn.x, bn.s))).join(', ')} move${negs.length === 1 ? 's' : ''} across the fraction bar to the bottom${dP !== 1 ? `, along with the ${dP} from ${tex(qT(coefV, '\\tfrac'))}` : ''}: <b>${K(fin)}</b>.`,
      run: (c) => c.pop(r2, 450)
    });
    return steps;
  }
};

/* =====================================================================
 * 4. Fractional base: flip it
 * ===================================================================== */
const FL = {
  n37: { a: 3, b: 7, n: 2 }, n12: { a: 1, b: 2, n: 3 }, n23: { a: 2, b: 3, n: 1 },
  ea: { a: 2, b: 5, n: 3 }, eb: { a: 5, b: 8, n: 1 }, ec: { a: 7, b: 2, n: 2 }, ed: { alg: true, a: '2x^{2}', b: '3y', n: 3 }
};
const flip = {
  title: 'A fraction to a negative power: flip it',
  height: 380,
  choices: [...['n37', 'n12', 'n23'].map((k) => ({ v: k, label: tex(`\\left(\\tfrac{${FL[k].a}}{${FL[k].b}}\\right)^{-${FL[k].n}}`) })), { sep: 'Example 6 check:' },
    ...['ea', 'eb', 'ec', 'ed'].map((k) => ({ v: k, label: `(${k[1]})` }))],
  intro: (k) => { const f = FL[k]; return f.alg ? `Simplify ${tex(`\\left(\\dfrac{${f.a}}{${f.b}}\\right)^{-${f.n}}`)}. The law works for algebraic fractions too.` : `Evaluate ${tex(`\\left(\\dfrac{${f.a}}{${f.b}}\\right)^{-${f.n}}`)}. First the long way, then the shortcut.`; },
  make(stage, k, ex) {
    const f = FL[k], W = ex.W, H = 380, n = f.n;
    const orig = `\\left(\\dfrac{${f.a}}{${f.b}}\\right)^{-${n}}`;
    // the long way: two rows of written work
    const row1 = add(stage, h('div', 'fl-row'), 24, 34), row2 = add(stage, h('div', 'fl-row'), 24, 196);
    row1.appendChild(h('span', 'fl-pc', K(orig)));
    const lines = [row1, row2, row2].map((r) => { const e = h('span', 'fl-pc'); r.appendChild(e); hide(e); return e; });
    // the shortcut panel
    const PX = W * 0.56, PW = W - PX - 18;
    add(stage, h('div', 'fl-panel', '<div class="fl-ph">The shortcut</div>'), PX, 12).style.cssText += `width:${PW}px;height:${H - 24}px;`;
    const cx = PX + PW / 2, cy = 168, FS = 46;
    const num = add(stage, h('div', 'fl-n c', K(String(f.a))), cx, cy - 42), den = add(stage, h('div', 'fl-n c', K(String(f.b))), cx, cy + 42);
    num.style.fontSize = den.style.fontSize = FS + 'px';
    const bw = Math.max(measure(stage, K(String(f.a)), FS)[0], measure(stage, K(String(f.b)), FS)[0]) + 30;
    const bar = add(stage, h('div', 'fl-bar c'), cx, cy); bar.style.width = bw + 'px';
    const parens = add(stage, svgEl('svg', { class: 'fl-par', width: bw + 80, height: 172 }), cx - bw / 2 - 40, cy - 86);
    parens.append(svgEl('path', { d: 'M24 6 Q4 86 24 166' }), svgEl('path', { d: `M${bw + 56} 6 Q${bw + 76} 86 ${bw + 56} 166` }));
    const expo = add(stage, h('div', 'fl-exp', K(`-${n}`)), cx + bw / 2 + 40, cy - 98);
    const tag = add(stage, h('div', 'fl-tag c', 'flip!'), cx + bw / 2 + 92, cy + 4); hide(tag);
    const valEl = add(stage, h('div', 'fl-val c'), cx, cy + 148); hide(valEl);
    const A = f.alg ? null : f.a ** n, B = f.alg ? null : f.b ** n;
    const frac = (p, q) => (q === 1 ? String(p) : `\\dfrac{${p}}{${q}}`);
    const flipRun = async (c) => {
      const kfN = [{ left: cx + 'px', top: cy - 42 + 'px' }, { left: cx + 96 + 'px', top: cy + 'px' }, { left: cx + 'px', top: cy + 42 + 'px' }];
      const kfD = [{ left: cx + 'px', top: cy + 42 + 'px' }, { left: cx - 96 + 'px', top: cy + 'px' }, { left: cx + 'px', top: cy - 42 + 'px' }];
      await Promise.all([c.anim(num, kfN, 900, { easing: 'ease-in-out' }), c.anim(den, kfD, 900, { easing: 'ease-in-out' }), c.fadeIn(tag, 300, { delay: 300 }),
        c.anim(expo, [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], 300, { delay: 450 })]);
      expo.innerHTML = K(String(n)); expo.classList.add('pos');
      await c.anim(expo, [{ transform: 'scale(1.5)', color: '#c93a33' }, { transform: 'scale(1)', color: '#12805a' }], 420);
    };
    const show = (i, src) => { lines[i].innerHTML = K(src); };
    const steps = [];
    if (f.alg) {
      steps.push({ cap: `Flip the fraction and make the exponent positive: ${tex(`${orig}=\\left(\\dfrac{${f.b}}{${f.a}}\\right)^{${n}}`)}.`, run: async (c) => { show(0, `=\\left(\\dfrac{${f.b}}{${f.a}}\\right)^{${n}}`); await Promise.all([flipRun(c), c.fadeIn(lines[0], 400, { delay: 500 })]); } });
      steps.push({ cap: `Power of a quotient: the 3 goes to <b>every</b> factor, top and bottom. For ${tex('x^2')} that’s a power of a power, so multiply: ${tex('2\\times3')}.`, run: (c) => { show(1, '=\\dfrac{3^{3}y^{3}}{2^{3}x^{2\\times3}}'); return c.fadeIn(lines[1], 400); } });
      steps.push({ cap: `Evaluate: ${tex('3^3=27')}, ${tex('2^3=8')}, and ${tex('x^{2\\times3}=x^6')}. Every exponent is positive, so we’re done: <b>${tex('\\dfrac{27y^3}{8x^6}')}</b>.`, run: (c) => { show(2, '=\\dfrac{27y^{3}}{8x^{6}}'); valEl.innerHTML = K('=\\dfrac{27y^{3}}{8x^{6}}'); return Promise.all([c.fadeIn(lines[2], 400), c.pop(valEl, 450, { delay: 200 })]); } });
      return steps;
    }
    const pq = `\\left(\\frac{${f.a}}{${f.b}}\\right)`;
    steps.push({ cap: `<b>The long way first.</b> Negative exponent law: a negative power is <b>one over</b> the positive power.`, run: (c) => { show(0, `=\\dfrac{1}{${pq}${n > 1 ? `^{${n}}` : ''}}`); return c.fadeIn(lines[0], 400); } });
    if (n > 1) steps.push({ cap: `Raise the top <b>and</b> the bottom to the power ${n}: ${tex(`\\left(\\tfrac{${f.a}}{${f.b}}\\right)^{${n}}=\\tfrac{${A}}{${B}}`)}.`, run: (c) => { show(1, `=\\dfrac{1}{\\frac{${A}}{${B}}}`); return c.fadeIn(lines[1], 400); } });
    steps.push({ cap: `1 divided by a fraction is that fraction <b>flipped</b> (its reciprocal): ${tex(`1\\div\\tfrac{${A}}{${B}}=${frac(B, A).replace('dfrac', 'tfrac')}`)}.`, run: (c) => { show(n > 1 ? 2 : 1, `=${frac(B, A)}`); return c.fadeIn(lines[n > 1 ? 2 : 1], 400); } });
    steps.push({
      cap: n > 1 ? `Now look: ${tex(frac(B, A))} is ${tex(`\\left(\\tfrac{${f.b}}{${f.a}}\\right)^{${n}}`)}. The negative exponent just <b>flipped the fraction</b>, and the exponent became positive!` : `${tex(frac(B, A))} is just ${tex(`\\tfrac{${f.a}}{${f.b}}`)} <b>flipped</b>. A power of ${tex('-1')} gives the reciprocal.`,
      run: flipRun
    });
    const valSrc = n > 1 ? `=\\left(\\dfrac{${f.b}}{${f.a}}\\right)^{${n}}=${f.a === 1 ? `${f.b}^{${n}}=` : ''}${frac(B, A)}` : `=${frac(f.b, f.a)}`;
    steps.push({
      cap: `<b>Shortcut:</b> flip the fraction, make the exponent positive, then evaluate: ${tex(valSrc.slice(1).replace(/dfrac/g, 'tfrac'))}. Same answer, in one step.` + (k === 'n12' ? ' (The bouncing ball in reverse: undo three halvings by doubling three times.)' : ''),
      run: (c) => { valEl.innerHTML = K(valSrc); return c.pop(valEl, 450); }
    });
    return steps;
  }
};

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { stairs, cancel, hops, move, sorter, flip };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountBall(); mountHalve(); mountSigns(); mountExplainers();
