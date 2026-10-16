/* Math 10C · Unit 4 · Lesson 5 — Further Factoring. The explainers and the nesting-doll warm-up on this page.
 * Big idea of the unit: factoring is expanding run backwards. Every explainer ends with a check by expanding. */
import { h, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const box = (el, w, ht) => { el.style.width = w + 'px'; el.style.height = ht + 'px'; return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const K = (s, d) => tex(s, d);
const T = (s) => tex(s); // inline math in captions
const KN = (s) => `<span class="nw">${K(s)}</span>`;
const setStyles = (el, kf) => { for (const k in kf) if (k !== 'offset' && k !== 'easing') el.style[k] = kf[k]; };

/* where an element sits inside the stage, in stage pixels (the lesson may be scaled to fit the screen) */
function rel(stage, el) {
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, r = el.getBoundingClientRect();
  return { x: (r.left - sr.left) / k - stage.clientLeft, y: (r.top - sr.top) / k - stage.clientTop, w: r.width / k, h: r.height / k };
}
const widthOf = (el) => { const r = el.getBoundingClientRect(), p = el.offsetParent; const k = p ? p.getBoundingClientRect().width / (p.offsetWidth || 1) || 1 : 1; return r.width / k; };
function stampIn(c, el) { return c.anim(el, [{ opacity: 0, transform: 'scale(1.9) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); }
const pulse = (c, el, s = 1.08, o = {}) => c.anim(el, [{ scale: '1' }, { scale: String(s) }, { scale: '1' }], 520, o); // uses `scale`, so it never undoes a transform
const fadeOut = (c, el, ms = 300, o = {}) => c.anim(el, [{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], ms, o);
const moveTo = (c, el, x, y, ms = 650, o = {}) => c.anim(el, [{ left: el.style.left, top: el.style.top }, { left: x + 'px', top: y + 'px' }], ms, o);
const showIn = (c, el, ms = 350, o = {}) => c.anim(el, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], ms, o);

/* the factor ⇄ expand arrows, used wherever both forms sit side by side */
const ARR = '<span class="u4l5-arr"><span class="xp">expand ⟶</span><span class="fa">⟵ factor</span></span>';
const chkLine = (src, label = 'Check by expanding') => `<span class="u4l5-tag sol">${label}</span>${K(src)} <b class="ok">✓</b>`;

/* dimension marks: a bar with end ticks and a label */
function dimH(stage, x, y, w, label) {
  const bar = add(stage, box(h('div', 'u4l5-dbar h'), w, 12), x, y);
  const lab = add(stage, h('div', 'u4l5-dim c', K(label)), x + w / 2, y - 14);
  return [bar, lab];
}
function dimV(stage, x, y, ht, label) {
  const bar = add(stage, box(h('div', 'u4l5-dbar v'), 12, ht), x, y);
  const lab = add(stage, h('div', 'u4l5-dim', K(label)), x - 8, y + ht / 2);
  lab.style.translate = '-100% -50%';
  return [bar, lab];
}

/* an animation context for the warm-up (outside an explainer): same calls as an explainer step's `c` */
function freeCtx() {
  const anim = (el, kf, ms = 450, o = {}) => {
    const a = el.animate(kf, { duration: ms, delay: o.delay || 0, easing: o.easing || 'cubic-bezier(.25,.75,.3,1)', fill: 'both' });
    return a.finished.then(() => { setStyles(el, kf[kf.length - 1]); a.cancel(); }, () => {});
  };
  return {
    fast: false, anim,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    pop: (el, ms = 380, o = {}) => anim(el, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.12)', offset: 0.65 }, { opacity: 1, transform: 'scale(1)' }], ms, o),
    shake: (el) => anim(el, [{ translate: '0' }, { translate: '-7px 0' }, { translate: '7px 0' }, { translate: '-4px 0' }, { translate: '0' }], 380)
  };
}

/* the sum–product search: factor pairs of c (signs arranged toward b), stopping at the pair whose sum is b */
function pairSearch(b, c) {
  const out = [], n = Math.abs(c);
  for (let d = 1; d * d <= n; d++) {
    if (n % d) continue;
    let p = d, q = n / d;
    if (c > 0) { if (b < 0) { p = -p; q = -q; } } else if (b < 0) q = -q; else p = -p;
    out.push([p, q, p + q]);
    if (p + q === b) break;
  }
  return out;
}
const par = (n) => (n < 0 ? `(${n})` : String(n));
function spTable(stage, b, c, x, y, w, label = '') {
  const rows = pairSearch(b, c);
  const t = add(stage, h('div', 'u4l5-sp'), x, y); t.style.width = w + 'px';
  t.innerHTML = `<div class="u4l5-sph">${label}product ${K(String(c))} · sum ${K(String(b))}</div>`;
  const els = rows.map(([p, q, s]) => {
    const r = h('div', 'u4l5-spr ' + (s === b ? 'hit' : 'miss'), `<span>${K(`${par(p)}\\times${par(q)}`)}</span><span class="ar">→</span><span class="sm">${K(`${s}`)} ${s === b ? '✓' : ''}</span>`);
    t.appendChild(r); r.style.opacity = 0; return r;
  });
  hide(t);
  return { t, els, run: async (cx) => { await showIn(cx, t, 300); for (const r of els) await cx.anim(r, [{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], 260); if (els.length) await pulse(cx, els[els.length - 1], 1.06); } };
}

/* ======================================================================
   Nesting dolls (warm-up and Section 4). A doll is a factor; opening it factors it; a solid doll can't be factored.
   ====================================================================== */
const D = (t, how, ...kids) => ({ t, how, kids });
const S = (t, why) => ({ t, why });
const isMono = (t) => /^\d+[a-z]*$/.test(t);
function prodT(nodes) {
  if (nodes.length === 1) return nodes[0].t;
  if (nodes.every((n) => isMono(n.t))) return nodes.map((n) => n.t).join('\\times ');
  return nodes.map((n) => (isMono(n.t) ? n.t : `(${n.t})`)).join('');
}
const DOLL_SVG = `<svg viewBox="0 0 100 140" aria-hidden="true">
  <path class="bd" d="M50 46 C84 46 98 94 92 128 Q50 141 8 128 C2 94 16 46 50 46Z"/>
  <path class="sh" d="M15 113 Q50 101 85 113"/>
  <path class="sm" d="M11 81 Q50 87 89 81"/>
  <circle class="bd" cx="50" cy="31" r="25"/>
  <circle class="fc" cx="50" cy="33" r="16"/>
  <circle class="ey" cx="44.5" cy="31" r="2.1"/><circle class="ey" cx="55.5" cy="31" r="2.1"/>
  <circle class="ch" cx="40" cy="37.5" r="2.8"/><circle class="ch" cx="60" cy="37.5" r="2.8"/>
  <path class="ln" d="M46 38.5 Q50 42.5 54 38.5"/>
  <circle class="dot" cx="50" cy="125" r="6.5"/>
</svg>`;
const DSCALE = [1.32, 1.04, 0.86, 0.74];
function dollEl(node, depth, mult = 1) {
  const dd = Math.min(depth, 3), s = DSCALE[dd] * mult, w = Math.round(100 * s), ht = Math.round(140 * s);
  const e = h('div', `u4l5-doll d${dd}`);
  e.innerHTML = `<div class="dh dt">${DOLL_SVG}</div><div class="dh db">${DOLL_SVG}</div><div class="dlab">${K(node.t)}</div><div class="dwhy">${node.why || 'solid'}</div>`;
  box(e, w, ht); e.querySelector('.dlab').style.fontSize = Math.max(18, Math.round(23 * s)) + 'px';
  e._w = w; e._h = ht; return e;
}
class DollRow {
  constructor(stage, root, o) { Object.assign(this, { stage, W: o.W, base: o.base, x0: o.x0 || 0, gap: o.gap || 26, mult: o.mult || 1, tap: !!o.tap }); this.items = [this.make(root, 0)]; this.layout(); }
  make(n, d) { const el = dollEl(n, d, this.mult); if (this.tap) el.dataset.tap = ''; this.stage.appendChild(el); return { n, d, el }; }
  slot(it) { const lw = widthOf(it.el.querySelector('.dlab')), ww = it.n.kids ? 0 : widthOf(it.el.querySelector('.dwhy')); return Math.max(it.el._w, lw + 14, ww + 8); }
  xs() { const ws = this.items.map((it) => this.slot(it)), tot = ws.reduce((a, b) => a + b, 0) + this.gap * (ws.length - 1); let x = this.x0 + (this.W - tot) / 2; return ws.map((w) => { const cx = x + w / 2; x += w + this.gap; return cx; }); }
  layout() { this.xs().forEach((cx, i) => { const it = this.items[i]; at(it.el, cx - it.el._w / 2, this.base - it.el._h); }); }
  async open(c, idx) {
    const it = this.items[idx], p = it.el;
    const kids = it.n.kids.map((k) => this.make(k, it.d + 1));
    this.items.splice(idx, 1, ...kids);
    const xs = this.xs();
    const pcx = parseFloat(p.style.left) + p._w / 2, pcy = parseFloat(p.style.top) + p._h * 0.62;
    kids.forEach((k) => { at(k.el, pcx - k.el._w / 2, pcy - k.el._h / 2); k.el.style.opacity = 0; });
    const jobs = [
      c.anim(p.querySelector('.dt'), [{ transform: 'none', opacity: 1 }, { transform: 'translate(-6px, -46px) rotate(-16deg)', opacity: 0 }], 650),
      c.anim(p.querySelector('.db'), [{ opacity: 1 }, { opacity: 0 }], 450, { delay: 250 }),
      c.anim(p.querySelector('.dlab'), [{ opacity: 1 }, { opacity: 0 }], 250)
    ];
    this.items.forEach((k, i) => {
      const L = xs[i] - k.el._w / 2, Tp = this.base - k.el._h;
      if (kids.includes(k)) jobs.push(c.anim(k.el, [{ left: k.el.style.left, top: k.el.style.top, opacity: 0, transform: 'scale(.35)' }, { left: L + 'px', top: Tp + 'px', opacity: 1, transform: 'scale(1)' }], 720, { delay: 280 + kids.indexOf(k) * 90 }));
      else jobs.push(moveTo(c, k.el, L, Tp, 600));
    });
    await Promise.all(jobs);
    p.remove();
    return kids;
  }
  solid(c, it, o = {}) { it.el.classList.add('solid'); it.solid = true; return pulse(c, it.el, 1.1, o); }
  prod() { return prodT(this.items.map((it) => it.n)); }
}

/* ---------------- warm-up: the shelf of dolls ---------------- */
const SHELF = {
  board: D('3x^2-12', 'common factor 3', S('3', 'prime'), D('x^2-4', 'a difference of squares', S('x-2', 'can’t open'), S('x+2', 'can’t open'))),
  n36: D('36', '36 = 4 × 9', D('4', '4 = 2 × 2', S('2', 'prime'), S('2', 'prime')), D('9', '9 = 3 × 3', S('3', 'prime'), S('3', 'prime'))),
  q2: D('2x^2-50', 'common factor 2', S('2', 'prime'), D('x^2-25', 'a difference of squares', S('x-5', 'can’t open'), S('x+5', 'can’t open'))),
  q3: D('x^4-81', `a difference of squares: ${tex('(x^2)^2-9^2')}`, D('x^2-9', 'a difference of squares', S('x-3', 'can’t open'), S('x+3', 'can’t open')), S('x^2+9', 'sum of squares')),
  big: D('x^8-1', `a difference of squares: ${tex('(x^4)^2-1^2')}`, D('x^4-1', `a difference of squares: ${tex('(x^2)^2-1^2')}`, D('x^2-1', 'a difference of squares', S('x-1', 'can’t open'), S('x+1', 'can’t open')), S('x^2+1', 'sum of squares')), S('x^4+1', 'sum of squares'))
};
const WHY_LONG = { prime: 'a prime number: it can’t be split', 'can’t open': 'degree 1, no common factor: nothing opens it', 'sum of squares': 'a <b>sum</b> of squares never factors' };
function mountShelf() {
  const host = document.getElementById('shelf'); if (!host) return;
  host.innerHTML = `<div class="u4l5-shtop no-ink"><span class="u4l5-shl">Open a doll:</span>
      <button class="chip" type="button" data-k="board">${tex('3x^2-12')}</button>
      <button class="chip" type="button" data-k="n36">1. 36</button>
      <button class="chip" type="button" data-k="q2">2. ${tex('2x^2-50')}</button>
      <button class="chip" type="button" data-k="q3">3. ${tex('x^4-81')}</button>
      <button class="chip big1" type="button" data-k="big">The big one: ${tex('x^8-1')}</button>
      <span class="sp"></span><button class="pill small" type="button" data-all>Open all</button><button class="pill small" type="button" data-reset>Reset</button></div>
    <div class="u4l5-shstage"></div><div class="u4l5-shmsg"></div>`;
  const stage = host.querySelector('.u4l5-shstage'), msg = host.querySelector('.u4l5-shmsg'), chips = [...host.querySelectorAll('[data-k]')];
  const c = freeCtx();
  let row, ledger, count, key = 'board', busy = false, gen = 0;
  const setCount = () => { const n = row.items.filter((it) => it.solid).length; count.innerHTML = `<i class="gd"></i>solid dolls: ${n}`; };
  const done = () => row.items.every((it) => it.solid);
  const addLine = (src) => { const l = h('div', '', K(src)); ledger.appendChild(l); l.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], 350); };
  function build(k) {
    gen++; key = k; busy = false; stage.innerHTML = '';
    chips.forEach((b) => b.classList.toggle('on', b.dataset.k === k));
    const W = stage.clientWidth || 960, LW = 372;
    row = new DollRow(stage, SHELF[k], { W: W - LW - 20, base: 282, x0: 0, gap: 24, tap: true });
    ledger = add(stage, h('div', 'u4l5-ledger'), W - LW, 58); ledger.style.width = LW - 14 + 'px'; ledger.style.fontSize = '22px';
    count = add(stage, h('div', 'u4l5-count'), 0, 10); count.style.left = 'auto';
    addLine(SHELF[k].t); setCount();
    row.items.forEach(wire);
    msg.innerHTML = 'Tap a doll to open it. Tap a doll that won’t open to mark it <b class="sol">solid</b>.';
  }
  function wire(it) { it.el.classList.add('tap'); it.el.setAttribute('role', 'button'); it.el.addEventListener('click', () => tap(it)); }
  async function tap(it) {
    if (busy || it.solid || !row.items.includes(it)) return;
    const g = gen;
    if (it.n.kids && it.n.kids.length) {
      busy = true;
      const kids = await row.open(c, row.items.indexOf(it));
      if (g !== gen) return;
      kids.forEach(wire); addLine('=' + row.prod());
      msg.innerHTML = `${KN(it.n.t)} opens: ${it.n.how}.`;
      busy = false;
    } else {
      busy = true; await row.solid(c, it); if (g !== gen) return; busy = false; setCount();
      msg.innerHTML = done() ? `Every doll is <b class="sol">solid</b>: <b>${row.items.length} solid dolls</b>. ${KN(SHELF[key].t + '=' + row.prod())}`
        : `${KN(it.n.t)} is <b class="sol">solid</b>: ${WHY_LONG[it.n.why] || it.n.why}.`;
    }
  }
  async function openAll() {
    const g = gen;
    for (let guard = 0; guard < 30 && g === gen; guard++) {
      const it = row.items.find((x) => !x.solid && x.n.kids && x.n.kids.length) || row.items.find((x) => !x.solid);
      if (!it) break;
      await tap(it); await c.sleep(220);
    }
  }
  chips.forEach((b) => b.addEventListener('click', () => build(b.dataset.k)));
  host.querySelector('[data-reset]').addEventListener('click', () => build(key));
  host.querySelector('[data-all]').addEventListener('click', () => { if (!busy) openAll(); });
  build('board');
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (row.items.length === 1) build(key); });
}

/* ---------------- Section 4: keep opening until nothing splits ---------------- */
const DL = {
  mn: {
    root: D('m^4-81n^4', '', D('m^2-9n^2', '', S('m-3n', 'can’t open'), S('m+3n', 'can’t open')), S('m^2+9n^2', 'sum of squares')),
    caps: [`${T('m^4-81n^4=(m^2)^2-(9n^2)^2')}: a <b>difference of squares</b> with ${T('A=m^2')} and ${T('B=9n^2')}. Open it into ${T('(A-B)(A+B)')}.`,
      `Look inside the new dolls. ${T('m^2-9n^2=(m)^2-(3n)^2')} is <b>another</b> difference of squares, so it opens again.`],
    solid: `${T('m-3n')} and ${T('m+3n')} are degree 1 with no common factor: nothing opens them. ${T('m^2+9n^2')} is a <b>sum</b> of squares: it never factors. Every doll is <b>solid</b>.`,
    chk: ['m=4,\\ n=1', '4^4-81(1)^4=175', '(1)(7)(16+9)=175']
  },
  x8: {
    root: SHELF.big,
    caps: [`${T('x^8-1=(x^4)^2-1^2')}: a difference of squares. Open it: ${T('(x^4-1)(x^4+1)')}.`,
      `${T('x^4-1=(x^2)^2-1^2')} is a difference of squares too. Open it.`,
      `And ${T('x^2-1')} opens once more: ${T('(x-1)(x+1)')}. Notice that only the <b>minus</b> doll opens each time.`],
    solid: `${T('x-1')} and ${T('x+1')} can’t open. ${T('x^2+1')} and ${T('x^4+1')} are <b>sums</b> of squares: they stay shut. <b>4 solid dolls</b> (answer C).`,
    chk: ['x=2', '2^8-1=255', '(1)(3)(5)(17)=255']
  },
  w4: {
    root: D('w^4-16', '', D('w^2-4', '', S('w-2', 'can’t open'), S('w+2', 'can’t open')), S('w^2+4', 'sum of squares')),
    caps: [`${T('w^4-16=(w^2)^2-4^2')}: a difference of squares with ${T('A=w^2')}, ${T('B=4')}. Open it: ${T('(w^2-4)(w^2+4)')}.`,
      `${T('w^2-4=w^2-2^2')} is <b>again</b> a difference of squares. Keep opening!`],
    solid: `${T('w-2')} and ${T('w+2')} can’t open. ${T('w^2+4')} is a <b>sum</b> of squares, so it does not factor. Every doll is solid: ${T('w^4-16=(w-2)(w+2)(w^2+4)')}.`,
    chk: ['w=3', '3^4-16=65', '(1)(5)(9+4)=65']
  },
  e6b: {
    root: D('162-2x^4', '', S('2', 'common factor'), D('81-x^4', '', D('9-x^2', '', S('3-x', 'can’t open'), S('3+x', 'can’t open')), S('9+x^2', 'sum of squares'))),
    caps: [`<b>Common factor first.</b> Neither 162 nor ${T('2x^4')} is a perfect square, but both are even: ${T('162-2x^4=2(81-x^4)')}.`,
      `Now ${T('81-x^4=9^2-(x^2)^2')} is a difference of squares. Open it: ${T('(9-x^2)(9+x^2)')}.`,
      `${T('9-x^2=3^2-x^2')} opens again: ${T('(3-x)(3+x)')}.`],
    solid: `2 is the common factor, ${T('3-x')} and ${T('3+x')} can’t open, and ${T('9+x^2')} is a sum of squares. Every doll is solid: ${T('2(3-x)(3+x)(9+x^2)')}.`,
    chk: ['x=2', '162-2(2)^4=130', '2(1)(5)(13)=130']
  },
  e6c: {
    root: D('3p^5q^4-48pt^4', '', S('3p', 'common factor'), D('p^4q^4-16t^4', '', D('p^2q^2-4t^2', '', S('pq-2t', 'can’t open'), S('pq+2t', 'can’t open')), S('p^2q^2+4t^2', 'sum of squares'))),
    caps: [`<b>GCF first:</b> both terms share ${T('3p')}. ${T('3p^5q^4-48pt^4=3p(p^4q^4-16t^4)')}.`,
      `${T('p^4q^4-16t^4=(p^2q^2)^2-(4t^2)^2')}: a difference of squares. Open it.`,
      `${T('p^2q^2-4t^2=(pq)^2-(2t)^2')} opens again: ${T('(pq-2t)(pq+2t)')}.`],
    solid: `${T('3p')} is the common factor, ${T('pq\\pm2t')} can’t open, and ${T('p^2q^2+4t^2')} is a sum of squares. Done: ${T('3p(pq-2t)(pq+2t)(p^2q^2+4t^2)')}.`,
    chk: ['p=1,\\ q=3,\\ t=1', '3(1)(3)^4-48(1)(1)^4=195', '3(1)(1)(5)(13)=195']
  }
};
const dolls = {
  title: 'Factor completely: keep opening until every doll is solid',
  height: 500,
  choices: [{ v: 'mn', label: tex('m^4-81n^4') }, { v: 'x8', label: 'Warm-up: ' + tex('x^8-1') }, { sep: 'Example 6 check:' }, { v: 'w4', label: '(a)' }, { v: 'e6b', label: '(b)' }, { v: 'e6c', label: '(c)' }],
  intro: (k) => `Here is ${T(DL[k].root.t)} as a doll. Factoring a doll <b>opens</b> it. We keep opening until <b>every</b> doll is solid: that is what “factor completely” means.`,
  make(stage, k, ex) {
    const W = ex.W, d = DL[k];
    const row = new DollRow(stage, d.root, { W, base: 282, gap: 30, mult: 1.25 });
    const ledger = add(stage, h('div', 'u4l5-ledger'), 24, 326); ledger.style.fontSize = '24px';
    const L0 = h('div', '', K(d.root.t)); ledger.appendChild(L0);
    const tag = add(stage, h('div', 'u4l5-count'), 0, 14); tag.style.left = 'auto'; hide(tag);
    const chk = add(stage, h('div', 'u4l5-chk'), 18, 14);
    chk.innerHTML = `<span class="u4l5-tag sol">Check at ${K(d.chk[0])}</span>${K(d.chk[1])} <span class="muted">and</span> ${K(d.chk[2])} <b class="ok">✓</b>`; hide(chk);
    const internal = []; const walk = (n) => { if (n.kids && n.kids.length) { internal.push(n); n.kids.forEach(walk); } }; walk(d.root);
    const steps = internal.map((n, i) => ({
      cap: d.caps[i],
      run: async (c) => {
        const idx = row.items.findIndex((it) => it.n === n);
        await row.open(c, idx);
        const l = h('div', '', K('=' + row.prod())); ledger.appendChild(l);
        while (ledger.children.length > 4) ledger.children[1].remove();
        await showIn(c, l, 350);
      }
    }));
    steps.push({
      cap: d.solid,
      run: async (c) => {
        await Promise.all(row.items.map((it, i) => row.solid(c, it, { delay: i * 160 })));
        tag.innerHTML = `<i class="gd"></i>${row.items.length} solid dolls`;
        ledger.lastChild.classList.add('u4l5-boxed');
        await c.pop(tag, 380);
      }
    });
    steps.push({
      cap: `Check by substituting: ${T(d.chk[0])} into both forms gives the same number. (Choose values that don’t make a factor 0, or the check is too easy to pass.)`,
      run: (c) => showIn(c, chk, 400)
    });
    return steps;
  }
};

/* ======================================================================
   Section 1. Perfect square trinomials
   ====================================================================== */

/* ---------------- can these tiles make a square? ---------------- */
const SQT = {
  a: { L: 'x', s: 1, nx: 6, nu: 9 }, b: { L: 'x', s: 1, nx: 8, nu: 16 }, c: { L: 'x', s: 1, nx: -6, nu: 9 }, d: { L: 'x', s: 1, nx: 6, nu: 5 },
  e1a: { L: 'b', s: 1, nx: 6, nu: 9 }, e1b: { L: 'x', s: 1, nx: -11, nu: 8 }, e1c: { L: 'x', s: 3, nx: -42, nu: 49 }, e1d: { L: 'y', s: 1, nx: 6, nu: -9 }
};
const coefT = (n, v, first) => { const a = Math.abs(n), b = a === 1 && v ? '' : String(a); return (n < 0 ? '-' : first ? '' : '+') + b + v; };
const sqtQ = (d) => coefT(d.s * d.s, d.L + '^2', true) + coefT(d.nx, d.L) + coefT(d.nu, '');
function tileEl(kind, sign, w, ht, lab) {
  const e = h('div', `u4l5-t u4l5-k${kind} ${sign < 0 ? 'neg' : 'pos'}${lab ? ' k2l' : ''}`, lab || '');
  box(e, w, ht); e.style.setProperty('--ms', Math.max(10, Math.min(w, ht) * 0.95) + 'px'); return e;
}
const squareTiles = {
  title: 'The square picture, run backwards: can the tiles make a square?',
  height: 490,
  choices: [{ v: 'a', label: tex('x^2+6x+9') }, { v: 'b', label: tex('x^2+8x+16') }, { v: 'c', label: tex('x^2-6x+9') }, { v: 'd', label: tex('x^2+6x+5') },
    { sep: 'Example 1 check:' }, { v: 'e1a', label: '(a)' }, { v: 'e1b', label: '(b)' }, { v: 'e1c', label: '(c)' }, { v: 'e1d', label: '(d)' }],
  intro: (k) => `Build ${T(sqtQ(SQT[k]))} with algebra tiles. A <b>perfect square trinomial</b> is exactly a set of tiles that makes a <b>square</b>. Let’s try.`,
  make(stage, key, ex) {
    const W = ex.W, d = SQT[key], { s, L } = d, q = sqtQ(d), nX = Math.abs(d.nx), sx = Math.sign(d.nx), nU = Math.abs(d.nu), su = Math.sign(d.nu);
    const X = s === 1 ? 150 : 76, U = s === 1 ? 30 : 16, x0 = 74, y0 = 64;
    const split = nX % (2 * s) === 0, k = split ? nX / (2 * s) : 0, kR = split ? k : Math.floor(nX / 2), kB = split ? k : nX - kR;
    const A = s === 1 ? L : s + L, sg = sx < 0 ? '-' : '+';
    // header
    const hd = add(stage, h('div', 'u4l5-eq big', K(q)), W - 24, 10); hd.style.translate = '-100% 0';
    // the tray of tiles, scaled to fit
    const TX = 474, TY = 118, TW = W - TX - 18, TH = 300;
    const tray = add(stage, box(h('div', 'u4l5-tray'), TW, TH + 30), TX - 10, TY - 30);
    add(tray, h('div', 'u4l5-tray-l', 'the tiles'), 12, 4).style.position = 'absolute';
    let f = 1, lay;
    const layout = (f) => {
      const g = 6 * f + 2, pos = { x2: [], x: [], u: [] }; let y = TY;
      const row = (n, w, ht, arr) => { const per = Math.max(1, Math.floor((TW - 20 + g) / (w + g))); for (let i = 0; i < n; i++) arr.push([TX + (i % per) * (w + g), y + Math.floor(i / per) * (ht + g)]); y += Math.ceil(n / per) * (ht + g) + 10; };
      row(s * s, X * f, X * f, pos.x2); row(nX, U * f, X * f, pos.x); row(nU, U * f, U * f, pos.u);
      return { pos, hgt: y - TY };
    };
    for (; f > 0.3; f -= 0.05) { lay = layout(f); if (lay.hgt <= TH) break; }
    const mk = (kind, sign, w, ht, p, lab) => add(stage, tileEl(kind, sign, w, ht, lab), p[0], p[1]);
    const x2s = lay.pos.x2.map((p) => mk(2, 1, X * f, X * f, p, K(L + '^2')));
    x2s.forEach((e) => (e.style.setProperty('--ls', Math.round(X * f * 0.24) + 'px')));
    const xs = lay.pos.x.map((p) => mk(1, sx, U * f, X * f, p));
    const us = lay.pos.u.map((p) => mk(0, su, U * f, U * f, p));
    // destinations
    const grow = (e, l, t, w, ht, ms = 750, delay = 0) => (c) => c.anim(e, [{ left: e.style.left, top: e.style.top, width: e.style.width, height: e.style.height }, { left: l + 'px', top: t + 'px', width: w + 'px', height: ht + 'px' }], ms, { delay });
    const x2Jobs = x2s.map((e, i) => (c) => { e.style.setProperty('--ls', Math.round(X * 0.24) + 'px'); return grow(e, x0 + (i % s) * X, y0 + Math.floor(i / s) * X, X, X, 750, i * 40)(c); });
    const right = [], bottom = [];
    for (let cI = 0; cI < kR; cI++) for (let r = 0; r < s; r++) right.push([x0 + s * X + cI * U, y0 + r * X, U, X]);
    for (let cI = 0; cI < kB; cI++) for (let r = 0; r < s; r++) bottom.push([x0 + r * X, y0 + s * X + cI * U, X, U]);
    const xDest = [...right, ...bottom];
    const xJobs = xs.map((e, i) => grow(e, ...xDest[i], 800, Math.min(i * 22, 600)));
    const cornerCells = []; for (let r = 0; r < k; r++) for (let cI = 0; cI < k; cI++) cornerCells.push([x0 + s * X + cI * U, y0 + s * X + r * U]);
    const uJobs = us.map((e, i) => (cornerCells[i] ? grow(e, ...cornerCells[i], U, U, 750, Math.min(i * 18, 600)) : null)).filter(Boolean);
    const holes = cornerCells.slice(nU).map(([l, t]) => { const e = add(stage, box(h('div', 'u4l5-hole'), U, U), l, t); hide(e); return e; });
    const side = s * X + k * U;
    const flash = add(stage, box(h('div', 'u4l5-flash'), (split ? k : kR) * U + 8, (split ? k : kB) * U + 8), x0 + s * X - 4, y0 + s * X - 4); hide(flash);
    // dimensions, side, equations
    const dims = split ? [...dimH(stage, x0, y0 - 18, s * X, A), ...dimH(stage, x0 + s * X, y0 - 18, k * U, (sx < 0 ? '-' : '') + k),
      ...dimV(stage, x0 - 18, y0, s * X, A), ...dimV(stage, x0 - 18, y0 + s * X, k * U, (sx < 0 ? '-' : '') + k)] : [];
    hide(...dims);
    const sideT = `${A}${sg}${k}`, res = `${q}=(${sideT})^2`;
    const sideTag = add(stage, h('div', 'u4l5-tag c', `side ${K(sideT)}`), x0 + side / 2, y0 + side + 26); hide(sideTag); sideTag.style.fontSize = '17px'; sideTag.style.textTransform = 'none';
    const PX = 470;
    const eqRes = add(stage, h('div', 'u4l5-eq u4l5-boxed', K(res)), PX, 150); hide(eqRes);
    const eqChk = add(stage, h('div', 'u4l5-chk', `${ARR}${K(`(${sideT})^2=${coefT(s * s, L + '^2', true)}${sg}2(${A})(${k})+${k * k}=${q}`)} <b class="ok">✓</b>`), PX, 236); hide(eqChk);
    eqChk.style.width = (W - PX - 18) + 'px'; eqChk.style.whiteSpace = 'normal';
    const stamp = add(stage, h('div', 'u4l5-stamp no', 'NOT A SQUARE'), PX + 40, 200); hide(stamp);
    const xName = `${T(L)}-tile`, x2Name = `${T(L + '^2')}-tile`;
    const steps = [{
      cap: `The tiles for ${T(q)}: ${s * s === 1 ? 'one ' + x2Name : `nine ${x2Name}s`}, ${nX} ${sx < 0 ? '<b>negative</b> ' : ''}${xName}s${sx < 0 ? ' (white, with a minus sign)' : ''} and ${nU} ${su < 0 ? '<b>negative</b> ' : ''}unit tiles${su < 0 ? ' (white, with a minus sign)' : ''}.`,
      run: (c) => Promise.all([...x2s.map((e, i) => pulse(c, e, 1.12, { delay: i * 50 })), ...xs.map((e, i) => pulse(c, e, 1.2, { delay: 350 + i * 18 })), ...us.map((e, i) => pulse(c, e, 1.3, { delay: 700 + i * 10 }))])
    }, {
      cap: s === 1 ? `Start the square with the ${x2Name} in the top-left corner. Its sides are ${T(L)} by ${T(L)}.`
        : `Nine ${x2Name}s make a 3 by 3 block: a square with side ${T(A)}. ${T(`9${L}^2=(3${L})^2`)}, so the <b>first term is a perfect square</b>.`,
      run: (c) => Promise.all(x2Jobs.map((j) => j(c)))
    }];
    if (!split) {
      steps.push({
        cap: `Share the ${nX} ${xName}s equally between the right side and the bottom? ${nX} is <b>odd</b>: ${kR} on one side, ${kB} on the other. The two sides <b>don’t match</b>, so there’s no square.`,
        run: async (c) => { await Promise.all(xJobs.map((j) => j(c))); await showIn(c, flash, 300); }
      });
      steps.push({
        cap: `${T(q)} is <b>not</b> a perfect square trinomial. (The last term fails the test too: ${nU} is not a perfect square.)`,
        run: (c) => Promise.all([fadeOut(c, tray, 300), stampIn(c, stamp)])
      });
      return steps;
    }
    steps.push({
      cap: `Share the ${nX} ${xName}s equally: ${s * k} along the right side and ${s * k} along the bottom.${sx < 0 ? ` They are <b>negative</b>, so each side is ${T(A)} <b>minus</b> ${k}.` : ''}`,
      run: (c) => Promise.all(xJobs.map((j) => j(c)))
    });
    if (su < 0) {
      steps.push({
        cap: `The corner is a ${k} by ${k} square: ${sx < 0 ? T(`(-${k})(-${k})`) : T(`(${k})(${k})`)} ${T('=+' + k * k)}, so it needs <b>positive</b> tiles. These ${nU} unit tiles are <b>negative</b>: ${T(`-${nU}`)}. A square’s corner can never be negative.`,
        run: async (c) => { await Promise.all(uJobs.map((j) => j(c))); await showIn(c, flash, 300); }
      });
      steps.push({ cap: `${T(q)} is <b>not</b> a perfect square trinomial: the last term must be a perfect square <b>and positive</b>.`, run: (c) => Promise.all([fadeOut(c, tray, 300), stampIn(c, stamp)]) });
      return steps;
    }
    if (nU !== k * k) {
      steps.push({
        cap: `The corner is a ${k} by ${k} square: it needs ${T(`${k}^2=${k * k}`)} unit tiles. There are only ${nU}: <b>${k * k - nU} holes</b>!`,
        run: async (c) => { await Promise.all(uJobs.map((j) => j(c))); await Promise.all(holes.map((e, i) => c.pop(e, 300, { delay: i * 80 }))); }
      });
      steps.push({ cap: `${T(q)} is <b>not</b> a perfect square trinomial: ${nU} isn’t ${k * k}. (These tiles do make a <b>rectangle</b>, though: ${KN('x^2+6x+5=(x+1)(x+5)')}, from Lesson 2.)`, run: (c) => Promise.all([fadeOut(c, tray, 300), stampIn(c, stamp)]) });
      return steps;
    }
    steps.push({
      cap: `The corner is a ${k} by ${k} square: it needs ${T(`${k}^2=${k * k}`)} unit tiles${sx < 0 ? ` (negative × negative, so they’re <b>positive</b>, shaded)` : ''}. There are exactly ${nU}. Every tile is used!`,
      run: (c) => Promise.all([...uJobs.map((j) => j(c)), fadeOut(c, tray, 400, { delay: 500 })])
    });
    steps.push({
      cap: `The tiles make a square with side ${T(sideT)}. So ${T(res)}: a <b>perfect square trinomial</b>.`,
      run: (c) => Promise.all([...dims.map((e) => c.anim(e, [{ opacity: 0 }, { opacity: 1 }], 350)), c.pop(sideTag, 380, { delay: 200 }), c.pop(eqRes, 420, { delay: 300 })])
    });
    steps.push({
      cap: `Check by expanding: square the first, double the product, square the last. ${T(`(${sideT})^2=${q}`)} ✓. Expanding <b>builds</b> the square; factoring <b>reads its sides</b>.`,
      run: (c) => showIn(c, eqChk, 400)
    });
    return steps;
  }
};

/* ---------------- the three-part test ---------------- */
const PS = {
  m14: { t: ['m^2', '+14m', '+49'], r: [['\\sqrt{m^2}=m', 1], ['\\sqrt{49}=7', 1], ['2(m)(7)=14m', 1]], ans: '(m+7)^2', chk: '(m+7)^2=m^2+14m+49' },
  x10: { t: ['x^2', '+10x', '+16'], r: [['\\sqrt{x^2}=x', 1], ['\\sqrt{16}=4', 1], ['2(x)(4)=8x\\neq10x', 0]],
    fail: `Twice the product is ${T('2(x)(4)=8x')}, but the middle term is ${T('10x')}. The third test <b>fails</b>.`,
    more: ` It still factors, just not as a square: ${T('(x+2)(x+8)')}.` },
  e1a: { t: ['b^2', '+6b', '+9'], r: [['\\sqrt{b^2}=b', 1], ['\\sqrt{9}=3', 1], ['2(b)(3)=6b', 1]], ans: '(b+3)^2', chk: '(b+3)^2=b^2+6b+9' },
  e1b: { t: ['x^2', '-11x', '+8'], r: [['\\sqrt{x^2}=x', 1], ['8\\text{ is not a perfect square}', 0], ['', 0]],
    fail: `${T('8')} is <b>not</b> a perfect square (${T('2^2=4')}, ${T('3^2=9')}). The second test fails, so we can stop right here.` },
  e1c: { t: ['9x^2', '-42x', '+49'], r: [['\\sqrt{9x^2}=3x', 1], ['\\sqrt{49}=7', 1], ['2(3x)(7)=42x', 1]], ans: '(3x-7)^2', chk: '(3x-7)^2=9x^2-42x+49' },
  e1d: { t: ['y^2', '+6y', '-9'], r: [['\\sqrt{y^2}=y', 1], ['-9\\text{ is negative}', 0], ['', 0]],
    fail: `The last term is ${T('-9')}. A square is never negative: ${T('3^2=9')} and ${T('(-3)^2=9')}. The second test fails.` },
  e3a: { t: ['81x^2', '-18x', '+1'], r: [['\\sqrt{81x^2}=9x', 1], ['\\sqrt{1}=1', 1], ['2(9x)(1)=18x', 1]], ans: '(9x-1)^2', chk: '(9x-1)^2=81x^2-18x+1' },
  e3b: { t: ['9', '+24x', '+16x^2'], ord: ['16x^2', '+24x', '+9'], r: [['\\sqrt{16x^2}=4x', 1], ['\\sqrt{9}=3', 1], ['2(4x)(3)=24x', 1]], ans: '(4x+3)^2', chk: '(4x+3)^2=16x^2+24x+9' },
  e3c: { t: ['\\tfrac{1}{4}a^2', '-3ab', '+9b^2'], r: [['\\sqrt{\\tfrac{1}{4}a^2}=\\tfrac{1}{2}a', 1], ['\\sqrt{9b^2}=3b', 1], ['2\\left(\\tfrac{1}{2}a\\right)(3b)=3ab', 1]], ans: '\\left(\\tfrac{1}{2}a-3b\\right)^2', chk: '\\left(\\tfrac{1}{2}a-3b\\right)^2=\\tfrac{1}{4}a^2-3ab+9b^2' }
};
const psQ = (t) => t.join('');
const psCheck = {
  title: 'The three-part test: is it a perfect square trinomial?',
  height: 400,
  choices: [{ v: 'm14', label: tex('m^2+14m+49') }, { v: 'x10', label: tex('x^2+10x+16') }, { sep: 'Example 1 check:' }, { v: 'e1a', label: '(a)' }, { v: 'e1b', label: '(b)' }, { v: 'e1c', label: '(c)' }, { v: 'e1d', label: '(d)' },
    { sep: 'Example 3 check:' }, { v: 'e3a', label: '(a)' }, { v: 'e3b', label: '(b)' }, { v: 'e3c', label: '(c)' }],
  intro: (k) => `Is ${T(psQ(PS[k].t))} a perfect square trinomial? Run the <b>three tests</b>, in order. All three must pass.`,
  make(stage, key, ex) {
    const W = ex.W, d = PS[key], cls = ['aa', 'ab', 'bb'], rcls = ['aa', 'bb', 'ab'], BX = [0, 2, 1]; // rows test first, last, middle
    const row = add(stage, h('div', 'u4l5-terms'), 24, 20);
    const boxes = d.t.map((t, i) => { const b = h('span', 'u4l5-term ' + cls[i], K(t)); row.appendChild(b); return b; });
    const Q = ['Is the <b>first</b> term a perfect square?', 'Is the <b>last</b> term a perfect square (and +)?', 'Is the <b>middle</b> twice the product?'];
    const rows = Q.map((q, i) => {
      const r = add(stage, h('div', 'u4l5-crow ' + rcls[i], `<span class="u4l5-lamp"></span><span class="cq"><b class="n">${i + 1}</b>${q}</span><span class="r"></span>`), 24, 106 + i * 62);
      return r;
    });
    const t = d.ord || d.t, q = psQ(t), q0 = psQ(d.t);
    const failAt = d.r.findIndex((r) => !r[1]);
    const stamp = add(stage, h('div', 'u4l5-stamp ' + (failAt < 0 ? 'yes' : 'no'), failAt < 0 ? `PERFECT SQUARE<small>${K(d.ans)}</small>` : 'NOT A PERFECT<br>SQUARE TRINOMIAL'), W - 30, failAt < 0 ? 116 : 296);
    stamp.style.translate = '-100% 0'; hide(stamp);
    const ans = failAt < 0 ? add(stage, h('div', 'u4l5-eq u4l5-boxed', K(`${q0}=${d.ans}`)), 24, 300) : null;
    const chk = failAt < 0 ? add(stage, h('div', 'u4l5-chk', `${ARR}${K(d.chk)} <b class="ok">✓</b>`), 24, 300) : null;
    if (ans) { hide(ans, chk); chk.style.left = 'auto'; chk.style.right = '22px'; chk.style.top = '304px'; }
    const steps = [];
    if (d.ord) steps.push({
      cap: `Write the terms in <b>descending order</b> first: ${T(q)}. Now the first and last terms are the squared ones.`,
      run: async (c) => { await Promise.all(boxes.map((b) => fadeOut(c, b, 250))); boxes.forEach((b, i) => { b.innerHTML = K(t[i]); }); await Promise.all(boxes.map((b, i) => c.pop(b, 380, { delay: i * 100 }))); }
    });
    const light = async (c, i, ok) => {
      const r = rows[i], lamp = r.querySelector('.u4l5-lamp');
      r.querySelector('.r').innerHTML = K(d.r[i][0]);
      boxes.forEach((b, j) => b.classList.toggle('hot', j === BX[i]));
      lamp.classList.add(ok ? 'ok' : 'no'); lamp.textContent = ok ? '✓' : '✗';
      await Promise.all([c.pop(lamp, 380), showIn(c, r.querySelector('.r'), 350, { delay: 100 })]);
      if (!ok) await c.shake(boxes[BX[i]]);
    };
    const caps = [
      () => `<b>Test 1.</b> The first term is ${T(t[0])}: a perfect square, because ${T(d.r[0][0])}.`,
      () => `<b>Test 2.</b> The last term is ${T(t[2].replace(/^\+/, ''))}: a perfect square, because ${T(d.r[1][0])}. And it’s positive.`,
      () => `<b>Test 3.</b> Twice the product of the square roots: ${T(d.r[2][0])}. That matches the middle term${t[1][0] === '-' ? `, and its <b>minus</b> sign goes into the bracket` : ''}.`
    ];
    for (let i = 0; i < 3; i++) {
      if (failAt >= 0 && i > failAt) break;
      const ok = i !== failAt;
      steps.push({ cap: ok ? caps[i]() : d.fail, run: (c) => light(c, i, ok) });
    }
    if (failAt >= 0) {
      steps.push({
        cap: `One failed test is enough: ${T(q0)} is <b>not</b> a perfect square trinomial.${d.more || ''}`,
        run: async (c) => { rows.slice(failAt + 1).forEach((r) => r.classList.add('skip')); boxes.forEach((b) => b.classList.remove('hot')); await stampIn(c, stamp); }
      });
      return steps;
    }
    steps.push({
      cap: `All three tests pass, so it is a perfect square trinomial: ${T(`${q0}=${d.ans}`)}. The bracket holds the two square roots, joined by the middle term’s sign.`,
      run: async (c) => { boxes.forEach((b) => b.classList.remove('hot')); await Promise.all([stampIn(c, stamp), c.pop(ans, 420, { delay: 250 })]); }
    });
    steps.push({ cap: `Check by expanding: ${T(d.chk)} ✓. Factoring and expanding are the same equation, read in opposite directions.`, run: (c) => showIn(c, chk, 400) });
    return steps;
  }
};

/* ---------------- fill the gap: the square picture backwards ---------------- */
const GF = {
  d1: { pre: 'x^2+', post: '+36', A: 'x', B: '6', AA: 'x^2', BB: '36', AB: '6x', mid: '12x', fill: '12x', kind: 'mid', fin: 'x^2+12x+36=(x+6)^2' },
  d2: { pre: '4x^2+12x+', post: '', A: '2x', B: '3', AA: '4x^2', BB: '9', AB: '6x', mid: '12x', fill: '9', kind: 'last', fin: '4x^2+12x+9=(2x+3)^2' },
  a: { pre: 'x^2+', post: '+121', A: 'x', B: '11', AA: 'x^2', BB: '121', AB: '11x', mid: '22x', fill: '22x', kind: 'mid', fin: 'x^2+22x+121=(x+11)^2' },
  b: { pre: 'x^2-', post: '+169', A: 'x', B: '-13', AA: 'x^2', BB: '169', AB: '-13x', mid: '-26x', fill: '26x', kind: 'mid', fin: 'x^2-26x+169=(x-13)^2' },
  c: { pre: '16x^2+', post: '+81', A: '4x', B: '9', AA: '16x^2', BB: '81', AB: '36x', mid: '72x', fill: '72x', kind: 'mid', fin: '16x^2+72x+81=(4x+9)^2' },
  d: { pre: '25m^2+40m+', post: '', A: '5m', B: '4', AA: '25m^2', BB: '16', AB: '20m', mid: '40m', fill: '16', kind: 'last', fin: '25m^2+40m+16=(5m+4)^2' }
};
const gapFill = {
  title: 'Fill the gap: the square picture, read backwards',
  height: 440,
  choices: [{ v: 'd1', label: tex('x^2+\\_\\_+36') }, { v: 'd2', label: tex('4x^2+12x+\\_\\_') }, { sep: 'Example 2 check:' }, { v: 'a', label: '(a)' }, { v: 'b', label: '(b)' }, { v: 'c', label: '(c)' }, { v: 'd', label: '(d)' }],
  intro: (k) => { const d = GF[k]; return `What goes in the blank so that ${T(d.pre + '\\_\\_' + d.post)} is a perfect square trinomial? Picture the square it must be.`; },
  make(stage, key, ex) {
    const W = ex.W, d = GF[key], S2 = 256, pa = Math.round(S2 * 0.64), pb = S2 - pa, x0 = 100, y0 = 142;
    const ql = add(stage, h('div', 'u4l5-qline'), 24, 18);
    ql.innerHTML = `<span>${K(d.pre)}</span><span class="u4l5-blank">&nbsp;</span><span>${K(d.post || '\\phantom{0}')}</span>`;
    const blank = ql.querySelector('.u4l5-blank');
    const cell = (x, y, w, ht, cls, src) => { const e = add(stage, box(h('div', 'u4l5-cell ' + cls, src ? K(src) : '?'), w, ht), x, y); return e; };
    const TL = cell(x0, y0, pa, pa, 'unk'), TR = cell(x0 + pa, y0, pb, pa, 'unk'), BL = cell(x0, y0 + pa, pa, pb, 'unk'), BR = cell(x0 + pa, y0 + pa, pb, pb, 'unk');
    const fillCell = (c, e, cls, src) => { e.className = 'u4l5-cell ' + cls; e.innerHTML = K(src); return c.anim(e, [{ transform: 'scale(.9)', opacity: 0.4 }, { transform: 'scale(1)', opacity: 1 }], 420); };
    const dA = [...dimH(stage, x0, y0 - 18, pa, d.A), ...dimV(stage, x0 - 18, y0, pa, d.A)];
    const dB = [...dimH(stage, x0 + pa, y0 - 18, pb, d.B), ...dimV(stage, x0 - 18, y0 + pa, pb, d.B)];
    hide(...dA, ...dB);
    const PX = x0 + S2 + 70, L = (y, src, cls = '') => { const e = add(stage, h('div', 'u4l5-eq ' + cls, src), PX, y); hide(e); return e; };
    const neg = d.B[0] === '-', absB = neg ? d.B.slice(1) : d.B;
    const l1 = L(136, `${K(`\\sqrt{${d.AA}}=${d.A}`)}${d.kind === 'mid' ? ` &nbsp; ${K(`\\sqrt{${d.BB}}=${absB}`)}` : ''}`, 'mid');
    const l2 = L(192, d.kind === 'mid' ? K(`2(${d.A})(${d.B})=${d.mid}`) : K(`${d.mid}\\div2=${d.AB}`), 'mid');
    const l3 = d.kind === 'last' ? L(248, K(`${d.A}\\times${d.B}=${d.AB}\\ \\Rightarrow\\ ${d.B}^2=${d.BB}`), 'mid') : null;
    const fin = L(306, K(d.fin), 'u4l5-boxed');
    const chk = add(stage, h('div', 'u4l5-chk', chkLine(d.fin.split('=').reverse().join('='))), PX, 372); hide(chk); chk.style.fontSize = '19px';
    const fillBlank = async (c) => { blank.textContent = ''; blank.innerHTML = K(d.fill); blank.classList.add('filled'); await c.pop(blank, 420); };
    if (d.kind === 'mid') return [{
      cap: `A perfect square trinomial <b>is</b> the area of a square. Its first and last terms are the two corner squares: ${T(d.AA)} and ${T(d.BB)}.`,
      run: (c) => Promise.all([fillCell(c, TL, 'aa', d.AA), fillCell(c, BR, 'bb', d.BB)])
    }, {
      cap: `The sides are the square roots: ${T(`\\sqrt{${d.AA}}=${d.A}`)} and ${T(`\\sqrt{${d.BB}}=${absB}`)}.${neg ? ` The blank comes after a <b>minus</b> sign, so the square is ${T(`(${d.A}-${absB})^2`)}: the side is ${T(d.A)} and ${T(d.B)}.` : ''}`,
      run: (c) => Promise.all([...dA, ...dB].map((e) => c.anim(e, [{ opacity: 0 }, { opacity: 1 }], 350)).concat([showIn(c, l1, 350)]))
    }, {
      cap: `The two other pieces are each ${T(d.A)} by ${T(d.B)}: area ${T(d.AB)} each.`,
      run: (c) => Promise.all([fillCell(c, TR, 'ab', d.AB), fillCell(c, BL, 'ab', d.AB)])
    }, {
      cap: `The middle term is <b>both</b> rectangles: ${T(`2(${d.A})(${d.B})=${d.mid}`)}.${neg ? ` The minus sign is already printed, so the blank is <b>${T(d.fill)}</b>.` : ` The blank is <b>${T(d.fill)}</b>.`}`,
      run: (c) => Promise.all([showIn(c, l2, 350), pulse(c, TR, 1.05), pulse(c, BL, 1.05), fillBlank(c)])
    }, {
      cap: `${T(d.fin)}. Check by expanding the square: you get the trinomial back ✓.`,
      run: (c) => Promise.all([c.pop(fin, 420), showIn(c, chk, 400, { delay: 300 })])
    }];
    return [{
      cap: `The first term is the top-left square: ${T(d.AA)}. So each side starts with ${T(`\\sqrt{${d.AA}}=${d.A}`)}.`,
      run: (c) => Promise.all([fillCell(c, TL, 'aa', d.AA), ...dA.map((e) => c.anim(e, [{ opacity: 0 }, { opacity: 1 }], 350)), showIn(c, l1, 350)])
    }, {
      cap: `The middle term ${T(d.mid)} is the <b>two</b> equal rectangles together, so each one is half: ${T(`${d.mid}\\div2=${d.AB}`)}.`,
      run: (c) => Promise.all([fillCell(c, TR, 'ab', d.AB), fillCell(c, BL, 'ab', d.AB), showIn(c, l2, 350)])
    }, {
      cap: `Each rectangle is ${T(d.A)} by something, with area ${T(d.AB)}: ${T(`${d.A}\\times${d.B}=${d.AB}`)}. So the other side is ${T(d.B)}.`,
      run: (c) => Promise.all(dB.map((e) => c.anim(e, [{ opacity: 0 }, { opacity: 1 }], 350)).concat([showIn(c, l3, 350)]))
    }, {
      cap: `The last term is the small corner square: ${T(`${d.B}^2=${d.BB}`)}. The blank is <b>${T(d.fill)}</b>.`,
      run: (c) => Promise.all([fillCell(c, BR, 'bb', d.BB), fillBlank(c)])
    }, {
      cap: `${T(d.fin)}. Check by expanding the square: you get the trinomial back ✓.`,
      run: (c) => Promise.all([c.pop(fin, 420), showIn(c, chk, 400, { delay: 300 })])
    }];
  }
};

/* ======================================================================
   Sections 2, 3 and 5. The disguise: let u = the block
   ====================================================================== */
const MASK_SVG = '<svg viewBox="0 0 40 18" aria-hidden="true"><path d="M2 6 Q20 0 38 6 Q39 15 30 16 Q24 16 20 11 Q16 16 10 16 Q1 15 2 6Z" fill="#3b2470"/><ellipse cx="11" cy="8.5" rx="4.2" ry="2.8" fill="#fff"/><ellipse cx="29" cy="8.5" rx="4.2" ry="2.8" fill="#fff"/></svg>';
/* a line of segments: strings are LaTeX, { b } is a block that can wear the u-mask */
function segLine(segs, real) {
  const e = h('div', 'u4l5-eq'), blks = [];
  segs.forEach((s) => {
    if (s === 'B') { const b = h('span', 'u4l5-blk', `<span class="real">${K(real)}</span><span class="mask">${MASK_SVG}${K('u')}</span>`); e.appendChild(b); blks.push(b); }
    else e.appendChild(h('span', 'u4l5-seg', K(/^[+-]/.test(s) ? '{}' + s : s))); // {} keeps binary spacing on a leading sign
  });
  e._blks = blks; return e;
}
async function maskOn(c, blks) {
  await Promise.all(blks.map((b, i) => { b.classList.add('on'); return c.anim(b.querySelector('.mask'), [{ opacity: 0, transform: 'translateY(-34px) scale(1.4)' }, { opacity: 1, transform: 'none' }], 520, { delay: i * 160 }); }));
}
async function maskOff(c, blks) {
  await Promise.all(blks.map((b, i) => c.anim(b.querySelector('.mask'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-30px) rotate(-12deg)' }], 420, { delay: i * 160 })));
  blks.forEach((b) => b.classList.remove('on'));
  await Promise.all(blks.map((b) => { b.classList.add('hl'); return pulse(c, b, 1.15); }));
}
const DG = {
  m: { q: 'm^4+7m^2+12', terms: [['m^4', 'degree 4', 'd4'], ['+7m^2', 'degree 2', 'd2'], ['+12', 'degree 0', 'd0']], blk: 'm^2', r1: '(m^2)', r2: 'm^2',
    L1: ['=', 'B', '{}^2+7', 'B', '+12'], b: 7, c: 12, uq: 'u^2+7u+12', L2: ['=(', 'B', '+3)(', 'B', '+4)'], uf: '(u+3)(u+4)', fin: '(m^2+3)(m^2+4)',
    find: `Look at the exponents: <b>4, 2, 0</b>. The first is <b>double</b> the middle one, so the whole expression is built from one block, ${T('m^2')}: ${T('m^4=(m^2)^2')}.`,
    done: `Can either bracket open? ${T('m^2+3')} and ${T('m^2+4')} are both <b>sums</b>, and a sum never splits into two integer brackets. No common factor either, so we’re done.`,
    chk: '(m^2+3)(m^2+4)=m^4+4m^2+3m^2+12=m^4+7m^2+12' },
  br: { q: '(x+1)^2+5(x+1)+6', terms: [['(x+1)^2', 'block²', 'd4'], ['+5(x+1)', '5 × block', 'd2'], ['+6', 'number', 'd0']], blk: 'x+1', r1: '(x+1)', r2: 'x+1',
    L1: ['=', 'B', '{}^2+5', 'B', '+6'], b: 5, c: 6, uq: 'u^2+5u+6', L2: ['=(', 'B', '+2)(', 'B', '+3)'], uf: '(u+2)(u+3)', fin: '(x+1+2)(x+1+3)',
    more: '=(x+3)(x+4)', moreCap: `Simplify inside each bracket: ${T('x+1+2=x+3')} and ${T('x+1+3=x+4')}. Neither ${T('x+3')} nor ${T('x+4')} can open.`,
    rew: `It’s already written with the block showing. Highlight both copies of ${T('(x+1)')}.`,
    find: `The same bracket, ${T('(x+1)')}, appears twice: once <b>squared</b> and once times 5. The block can be a <b>whole bracket</b>: let ${T('u=x+1')}.`,
    chk: '(x+1)^2+5(x+1)+6=x^2+2x+1+5x+5+6=x^2+7x+12=(x+3)(x+4)',
    chkCap: `Check by expanding <b>both</b> forms: ${T('(x+1)^2+5(x+1)+6')} and ${T('(x+3)(x+4)')} each expand to ${T('x^2+7x+12')} ✓.` },
  e4a: { q: 'b^4-3b^2-40', terms: [['b^4', 'degree 4', 'd4'], ['-3b^2', 'degree 2', 'd2'], ['-40', 'degree 0', 'd0']], blk: 'b^2', r1: '(b^2)', r2: 'b^2',
    L1: ['=', 'B', '{}^2-3', 'B', '-40'], b: -3, c: -40, uq: 'u^2-3u-40', L2: ['=(', 'B', '-8)(', 'B', '+5)'], uf: '(u-8)(u+5)', fin: '(b^2-8)(b^2+5)',
    find: `Exponents <b>4, 2, 0</b>: the block is ${T('b^2')}, because ${T('b^4=(b^2)^2')}.`,
    done: `${T('b^2-8')}: 8 isn’t a perfect square, so it isn’t a difference of squares. ${T('b^2+5')} is a sum. No common factor. Complete!`,
    chk: '(b^2-8)(b^2+5)=b^4+5b^2-8b^2-40=b^4-3b^2-40' },
  e4b: { q: 'y^4+3y^2-4', terms: [['y^4', 'degree 4', 'd4'], ['+3y^2', 'degree 2', 'd2'], ['-4', 'degree 0', 'd0']], blk: 'y^2', r1: '(y^2)', r2: 'y^2',
    L1: ['=', 'B', '{}^2+3', 'B', '-4'], b: 3, c: -4, uq: 'u^2+3u-4', L2: ['=(', 'B', '+4)(', 'B', '-1)'], uf: '(u+4)(u-1)', fin: '(y^2+4)(y^2-1)',
    more: '=(y^2+4)(y-1)(y+1)', moreCap: `Not done yet! ${T('y^2-1=y^2-1^2')} is a <b>difference of squares</b>: it opens into ${T('(y-1)(y+1)')}. ${T('y^2+4')} is a sum and stays shut.`,
    find: `Exponents <b>4, 2, 0</b>: the block is ${T('y^2')}, because ${T('y^4=(y^2)^2')}.`,
    chk: '(y^2+4)(y-1)(y+1)=(y^2+4)(y^2-1)=y^4+3y^2-4' },
  x6: { q: 'x^6+5x^3+6', terms: [['x^6', 'degree 6', 'd4'], ['+5x^3', 'degree 3', 'd2'], ['+6', 'degree 0', 'd0']], blk: 'x^3', r1: '(x^3)', r2: 'x^3',
    L1: ['=', 'B', '{}^2+5', 'B', '+6'], b: 5, c: 6, uq: 'u^2+5u+6', L2: ['=(', 'B', '+2)(', 'B', '+3)'], uf: '(u+2)(u+3)', fin: '(x^3+2)(x^3+3)',
    find: `Exponents <b>6, 3, 0</b>: the first is double the middle, so the block is ${T('x^3')}, because ${T('x^6=(x^3)^2')}.`,
    done: `Neither ${T('x^3+2')} nor ${T('x^3+3')} is a difference of <b>squares</b> (${T('x^3')} isn’t a square), so we’re done.`,
    chk: '(x^3+2)(x^3+3)=x^6+3x^3+2x^3+6=x^6+5x^3+6' },
  e7a: { q: 'x^6-7x^3-18', terms: [['x^6', 'degree 6', 'd4'], ['-7x^3', 'degree 3', 'd2'], ['-18', 'degree 0', 'd0']], blk: 'x^3', r1: '(x^3)', r2: 'x^3',
    L1: ['=', 'B', '{}^2-7', 'B', '-18'], b: -7, c: -18, uq: 'u^2-7u-18', L2: ['=(', 'B', '-9)(', 'B', '+2)'], uf: '(u-9)(u+2)', fin: '(x^3-9)(x^3+2)',
    find: `Exponents <b>6, 3, 0</b>: the block is ${T('x^3')}, because ${T('x^6=(x^3)^2')}.`,
    done: `${T('x^3-9')} looks tempting, but ${T('x^3')} is <b>not</b> a square, so it isn’t a difference of squares. ${T('x^3+2')} doesn’t open either. Complete!`,
    chk: '(x^3-9)(x^3+2)=x^6+2x^3-9x^3-18=x^6-7x^3-18' },
  e7b: { q: 'z^{10}-3z^5-10', terms: [['z^{10}', 'degree 10', 'd4'], ['-3z^5', 'degree 5', 'd2'], ['-10', 'degree 0', 'd0']], blk: 'z^5', r1: '(z^5)', r2: 'z^5',
    L1: ['=', 'B', '{}^2-3', 'B', '-10'], b: -3, c: -10, uq: 'u^2-3u-10', L2: ['=(', 'B', '-5)(', 'B', '+2)'], uf: '(u-5)(u+2)', fin: '(z^5-5)(z^5+2)',
    find: `Exponents <b>10, 5, 0</b>: the block is ${T('z^5')}, because ${T('z^{10}=(z^5)^2')}.`,
    done: `${T('z^5')} isn’t a square, so neither bracket is a difference of squares. Complete!`,
    chk: '(z^5-5)(z^5+2)=z^{10}+2z^5-5z^5-10=z^{10}-3z^5-10' }
};
function makeDisguise(title, choices) {
  return {
    title, height: 440, choices,
    intro: (k) => `${T(DG[k].q)} doesn’t look like a trinomial we know. But it’s one in <b>disguise</b>: find the block, call it ${T('u')}, factor, then take the disguise off.`,
    make(stage, key, ex) {
      const W = ex.W, d = DG[key], RX = W - 304;
      const L0 = add(stage, h('div', 'u4l5-eq big'), 24, 16);
      const tEls = d.terms.map(([t]) => {
        const sg = /^[+-]/.test(t) ? t[0] : '', body = sg ? t.slice(1) : t;
        if (sg) L0.appendChild(h('span', 'u4l5-seg u4l5-sgn', K(sg)));
        const s = h('span', 'u4l5-seg', K(body)); L0.appendChild(s); return s;
      });
      const badges = d.terms.map(([, lab, cls], i) => { const r = rel(stage, tEls[i]); const b = add(stage, h('div', 'u4l5-badge ' + cls, lab), r.x + r.w / 2, 70); hide(b); return b; });
      const L1 = add(stage, segLine(d.L1, d.r1), 24, 112); hide(L1);
      const L2 = add(stage, segLine(d.L2, d.r2), 24, 178); hide(L2);
      L2._blks.forEach((b) => b.classList.add('on'));
      const L3 = d.more ? add(stage, h('div', 'u4l5-eq', K(d.more)), 24, 242) : null; if (L3) hide(L3);
      const okT = add(stage, h('div', 'u4l5-tag sol'), 24, d.more ? 300 : 246); okT.textContent = 'factored completely'; hide(okT);
      const ulet = add(stage, h('div', 'u4l5-ulet', `${MASK_SVG}${K(`\\text{let } u=${d.blk}`)}`), RX, 18); hide(ulet);
      const sp = spTable(stage, d.b, d.c, RX, 84, 282);
      const chk = add(stage, h('div', 'u4l5-chk', `${ARR}${K(d.chk)} <b class="ok">✓</b>`), 24, 350); hide(chk);
      return [{
        cap: d.find,
        run: (c) => Promise.all(badges.map((b, i) => c.pop(b, 360, { delay: i * 160 })))
      }, {
        cap: d.rew || `Rewrite it with the block showing: ${T(`${d.q}=${d.L1.map((s) => (s === 'B' ? d.r1 : s)).join('').slice(1).replace('{}', '')}`)}.`,
        run: async (c) => { L1._blks.forEach((b) => b.classList.add('hl')); await showIn(c, L1, 400); await Promise.all(L1._blks.map((b) => pulse(c, b, 1.12))); }
      }, {
        cap: `Put on the <b>disguise</b>: let ${T(`u=${d.blk}`)}. Every ${T(d.r1)} becomes ${T('u')}, and it’s a trinomial we know: ${T(d.uq)}.`,
        run: (c) => Promise.all([c.pop(ulet, 400), maskOn(c, L1._blks)])
      }, {
        cap: `Factor ${T(d.uq)} the usual way: two numbers with product ${T(String(d.c))} and sum ${T(String(d.b))}.`,
        run: (c) => sp.run(c)
      }, {
        cap: `So ${T(`${d.uq}=${d.uf}`)}. But there’s no ${T('u')} in the question! An answer written in ${T('u')} isn’t finished yet.`,
        run: (c) => showIn(c, L2, 400)
      }, {
        cap: `Take off the disguise: replace ${T('u')} with ${T(d.blk)} again. ${T(`${d.q}=${d.fin}`)}.`,
        run: (c) => maskOff(c, L2._blks)
      }, d.more ? {
        cap: d.moreCap,
        run: (c) => Promise.all([showIn(c, L3, 400), c.pop(okT, 360, { delay: 300 })])
      } : {
        cap: d.done,
        run: (c) => c.pop(okT, 360)
      }, {
        cap: d.chkCap || `Check by expanding: ${T(d.chk.split('=')[0])} multiplies back to ${T(d.q)} ✓. Expanding takes the disguise off in one go.`,
        run: (c) => showIn(c, chk, 400)
      }];
    }
  };
}
const disguise = makeDisguise('The disguise: let u be the block', [{ v: 'm', label: tex('m^4+7m^2+12') }, { v: 'br', label: 'A bracket block: ' + tex('(x+1)^2+5(x+1)+6') }, { sep: 'Example 4 check:' }, { v: 'e4a', label: '(a)' }, { v: 'e4b', label: '(b)' }]);
const disguiseExt = makeDisguise('Extension: bigger blocks', [{ v: 'x6', label: tex('x^6+5x^3+6') }, { sep: 'Example 7 check:' }, { v: 'e7a', label: '(a)' }, { v: 'e7b', label: '(b)' }]);

/* ---------------- decomposition in disguise: two methods side by side ---------------- */
const DC = {
  n: { q: '6m^4-7m^2-3', blk: 'm^2', a: 6, b: -7, c: -3, U: ['6u^2-7u-3', '6u^2-9u+2u-3', '3u(2u-3)+1(2u-3)', '(2u-3)(3u+1)'], M: ['6m^4-7m^2-3', '6m^4-9m^2+2m^2-3', '3m^2(2m^2-3)+1(2m^2-3)', '(2m^2-3)(3m^2+1)'],
    split: '-7u=-9u+2u', com: '(2u-3)', fin: '(2m^2-3)(3m^2+1)', find: `Exponents 4, 2, 0: the block is ${T('m^2')}.`,
    done: `Neither bracket opens: in ${T('2m^2-3')}, 2 and 3 aren’t perfect squares, so it isn’t a difference of squares, and ${T('3m^2+1')} is a sum.`, chk: '(2m^2-3)(3m^2+1)=6m^4+2m^2-9m^2-3=6m^4-7m^2-3' },
  e5a: { q: '10x^4-3x^2-4', blk: 'x^2', a: 10, b: -3, c: -4, U: ['10u^2-3u-4', '10u^2-8u+5u-4', '2u(5u-4)+1(5u-4)', '(5u-4)(2u+1)'], M: ['10x^4-3x^2-4', '10x^4-8x^2+5x^2-4', '2x^2(5x^2-4)+1(5x^2-4)', '(5x^2-4)(2x^2+1)'],
    split: '-3u=-8u+5u', com: '(5u-4)', fin: '(5x^2-4)(2x^2+1)', find: `Exponents 4, 2, 0: the block is ${T('x^2')}.`,
    done: `${T('5x^2-4')} is <b>not</b> a difference of squares (5 isn’t a perfect square), and ${T('2x^2+1')} is a sum. Complete.`, chk: '(5x^2-4)(2x^2+1)=10x^4+5x^2-8x^2-4=10x^4-3x^2-4' },
  e5b: { q: '3p^2q^2-20pq+12', blk: 'pq', a: 3, b: -20, c: 12, U: ['3u^2-20u+12', '3u^2-18u-2u+12', '3u(u-6)-2(u-6)', '(u-6)(3u-2)'], M: ['3p^2q^2-20pq+12', '3p^2q^2-18pq-2pq+12', '3pq(pq-6)-2(pq-6)', '(pq-6)(3pq-2)'],
    split: '-20u=-18u-2u', com: '(u-6)', fin: '(pq-6)(3pq-2)', find: `Here the block is a <b>product</b>: ${T('p^2q^2=(pq)^2')}, so let ${T('u=pq')}.`,
    done: 'No common factor, and neither bracket is a difference of squares. Complete.', chk: '(pq-6)(3pq-2)=3p^2q^2-2pq-18pq+12=3p^2q^2-20pq+12' },
  e5c: { q: '12x^4+8x^2-15', blk: 'x^2', a: 12, b: 8, c: -15, U: ['12u^2+8u-15', '12u^2+18u-10u-15', '6u(2u+3)-5(2u+3)', '(2u+3)(6u-5)'], M: ['12x^4+8x^2-15', '12x^4+18x^2-10x^2-15', '6x^2(2x^2+3)-5(2x^2+3)', '(2x^2+3)(6x^2-5)'],
    split: '8u=18u-10u', com: '(2u+3)', fin: '(2x^2+3)(6x^2-5)', find: `Exponents 4, 2, 0: the block is ${T('x^2')}.`,
    done: `${T('6x^2-5')}: 6 and 5 aren’t perfect squares. ${T('2x^2+3')} is a sum. Complete.`, chk: '(2x^2+3)(6x^2-5)=12x^4-10x^2+18x^2-15=12x^4+8x^2-15' }
};
const decomp = {
  title: 'Decomposition in disguise: substitute, or split directly',
  height: 470,
  choices: [{ v: 'n', label: tex('6m^4-7m^2-3') }, { sep: 'Example 5 check:' }, { v: 'e5a', label: '(a)' }, { v: 'e5b', label: '(b)' }, { v: 'e5c', label: '(c)' }],
  intro: (k) => `Factor ${T(DC[k].q)} two ways at once: <b>Method 1</b> wears the disguise ${T('u=' + DC[k].blk)}; <b>Method 2</b> splits the middle term directly. Watch the two columns stay in step.`,
  make(stage, key, ex) {
    const W = ex.W, d = DC[key], ac = d.a * d.c, TX = W - 282, C1 = 24, C2 = 352;
    add(stage, h('div', 'u4l5-eq big', K(d.q)), 24, 12);
    const ulet = add(stage, h('div', 'u4l5-ulet', `${MASK_SVG}${K(`\\text{let } u=${d.blk}`)}`), TX, 14); hide(ulet);
    const h1 = add(stage, h('div', 'u4l5-colh m1', `Method 1: ${K('u=' + d.blk)}`), C1, 80); h1.style.width = '300px';
    const h2 = add(stage, h('div', 'u4l5-colh m2', 'Method 2: split directly'), C2, 80); h2.style.width = '320px';
    hide(h1, h2);
    const ys = [118, 166, 214, 262, 316];
    const u = d.U.map((t, i) => { const e = add(stage, h('div', 'u4l5-dl', K((i ? '=' : '') + t)), C1, ys[i]); hide(e); return e; });
    const m = d.M.map((t, i) => { const e = add(stage, h('div', 'u4l5-dl', K((i ? '=' : '') + t)), C2, ys[i]); hide(e); return e; });
    const u5 = add(stage, h('div', 'u4l5-dl', `${K('=' + d.fin)}`), C1, ys[4]); hide(u5);
    const same = add(stage, h('div', 'u4l5-same', 'same answer ✓'), C2, ys[4] + 4); hide(same);
    const sp = spTable(stage, d.b, ac, TX, 74, 262);
    const chk = add(stage, h('div', 'u4l5-chk', `${ARR}${K(d.chk)} <b class="ok">✓</b>`), 24, 384); hide(chk);
    const both = (c, i) => Promise.all([showIn(c, u[i], 380), showIn(c, m[i], 380, { delay: 150 })]);
    return [{
      cap: `${d.find} In ${T('u')} the expression is ${T(d.U[0])}: ${T(`a=${d.a}`)}, ${T(`b=${d.b}`)}, ${T(`c=${d.c}`)}.`,
      run: (c) => Promise.all([c.pop(ulet, 380), showIn(c, h1, 300), showIn(c, h2, 300), both(c, 0)])
    }, {
      cap: `Decomposition: find two numbers with product ${T(`ac=${d.a}(${d.c})=${ac}`)} and sum ${T(`b=${d.b}`)}.`,
      run: (c) => sp.run(c)
    }, {
      cap: `Split the middle term with them: ${T(d.split)}. Method 2 splits it the same way, with ${T(d.blk)} in place of ${T('u')}.`,
      run: (c) => both(c, 1)
    }, {
      cap: `Group the terms in pairs and take out each pair’s GCF: ${T(d.U[2])}.`,
      run: (c) => both(c, 2)
    }, {
      cap: `The bracket ${T(d.com)} is common to both groups. Factor it out.`,
      run: (c) => both(c, 3)
    }, {
      cap: `Method 1 is still in disguise: replace ${T('u')} with ${T(d.blk)}. Both methods give ${T(d.fin)}.`,
      run: (c) => Promise.all([showIn(c, u5, 400), c.pop(same, 380, { delay: 300 })])
    }, {
      cap: `${d.done} Check by expanding ✓.`,
      run: (c) => showIn(c, chk, 400)
    }];
  }
};

/* ============ wiring ============ */
function mountReveals() {
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}
function mountExplainers() {
  const defs = { squareTiles, psCheck, gapFill, disguise, decomp, dolls, disguiseExt };
  const all = [...document.querySelectorAll('[data-explainer]')].map((el) => new Explainer(el, defs[el.dataset.explainer]));
  // pieces are laid out by measuring KaTeX widths: once the math fonts arrive, redraw any explainer still at its start
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => all.forEach((x) => { if (x.steps && x.k === 0 && !x.running) x.build(0); }));
}

mountShelf(); mountReveals(); mountExplainers();
