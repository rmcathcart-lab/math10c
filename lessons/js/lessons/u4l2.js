/* Math 10C · Unit 4 · Lesson 2 — Common Factors: Binomial Common Factors and Grouping.
 * The explainers, the combo-receipt warm-up and its menu board.
 *
 * Most explainers here run on a small "morph" engine: an expression is a row of tokens (each its own KaTeX piece, with a
 * key). Setting a new row of tokens moves every token that keeps its key to its new place, flies tokens down from the
 * row above (their "from" keys), and fades the rest in or out. A bracket treated as ONE thing is a teal "block" token. */
import { h, Explainer } from '../explain.js';
import { tex } from '../tex.js';
import { standup } from '../standup.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const box = (el, w, hh) => { el.style.width = w + 'px'; el.style.height = hh + 'px'; return el; };
const T = (s) => tex(s);
const TEAL = '#13807a', AMB = '#c27a0e', BLU = '#2f6fd0', RED = '#c93a33', OK = '#12805a';

/* A context that applies every animation instantly (used to draw a starting picture inside make()). */
const NOW = {
  fast: true,
  anim(el, kf) { const f = kf[kf.length - 1]; for (const k in f) if (k !== 'offset' && k !== 'easing') el.style[k] = f[k]; return Promise.resolve(); },
  sleep() { return Promise.resolve(); }
};

/* ============ tokens ============
 * A row is written as a string of tokens separated by spaces: key=tex#class<fromKeys
 *   "a=5x B1=(x+2)#blk m=- b=3"   B=(x+2)#blk<B1,B2 flies from B1 (and a ghost copy from B2) in the source row. */
const OPS = new Set(['+', '-', '=', '\\cdot', '\\times']);
function P(str) {
  return str.trim().split(/\s+/).map((s) => {
    const i = s.indexOf('='), k = s.slice(0, i); let rest = s.slice(i + 1), from = null, cls = '';
    const j = rest.lastIndexOf('<'); if (j > 0) { from = rest.slice(j + 1); rest = rest.slice(0, j); }
    const m = rest.lastIndexOf('#'); if (m > 0) { cls = rest.slice(m + 1); rest = rest.slice(0, m); }
    if (OPS.has(rest)) cls = (cls + ' op').trim();
    return { k, t: rest, cls, from };
  });
}
/* the plain LaTeX of a row (for captions), without the leading = */
const join = (spec) => P(spec).filter((t) => !t.k.startsWith('eq')).map((t) => t.t).join(' ');

class Row {
  constructor(stage, x, y, size = 38) { Object.assign(this, { stage, x, y, size }); this.els = new Map(); this.pos = new Map(); this.boxes = new Map(); this.W = 0; }
  mk(t) { const e = h('span', ('u4l2-tk ' + t.cls).trim(), tex(t.t)); e.style.fontSize = this.size + 'px'; e._t = t.t; e._c = t.cls; return e; }
  measure(toks) {
    const row = h('div', 'u4l2-mrow'); row.style.fontSize = this.size + 'px';
    toks.forEach((t) => row.appendChild(h('span', ('u4l2-tk ' + t.cls).trim(), tex(t.t))));
    this.stage.appendChild(row);
    const r = [...row.children].map((e) => ({ l: e.offsetLeft, t: e.offsetTop }));
    this.W = row.offsetWidth; row.remove();
    return r;
  }
  async set(c, spec, o = {}) {
    const toks = typeof spec === 'string' ? P(spec) : spec, src = o.src || this, ms = o.ms || 720, quiet = o.quiet || [];
    const r = this.measure(toks), tgt = {}, jobs = [], keep = new Set();
    toks.forEach((t, i) => { tgt[t.k] = { L: this.x + r[i].l, T: this.y + r[i].t }; });
    toks.forEach((t) => {
      const { L, T: Tp } = tgt[t.k]; keep.add(t.k); this.pos.set(t.k, tgt[t.k]);
      let e = this.els.get(t.k);
      if (e) {
        if (e._c !== t.cls) { (e._c || '').split(' ').forEach((x) => x && e.classList.remove(x)); t.cls.split(' ').forEach((x) => x && e.classList.add(x)); e._c = t.cls; }
        if (e._t !== t.t) { e.innerHTML = tex(t.t); e._t = t.t; if (!quiet.includes(t.k)) jobs.push(flashTok(c, e)); }
        const fl = parseFloat(e.style.left), ft = parseFloat(e.style.top);
        if (Math.abs(fl - L) > 0.5 || Math.abs(ft - Tp) > 0.5) {
          const kf = [{ left: fl + 'px', top: ft + 'px' }];
          if (o.hop && Math.abs(fl - L) > 2) kf.push({ left: (fl + L) / 2 + 'px', top: (Math.min(ft, Tp) + (L > fl ? o.hop : -o.hop)) + 'px', offset: 0.5 });
          kf.push({ left: L + 'px', top: Tp + 'px' });
          jobs.push(c.anim(e, kf, ms));
        }
        return;
      }
      e = this.mk(t); at(e, L, Tp); this.stage.appendChild(e); this.els.set(t.k, e);
      const fk = t.from ? t.from.split(',') : src !== this ? [t.k] : [];
      const srcs = fk.map((k) => src.els.get(k)).filter(Boolean);
      if (srcs.length) {
        const s0 = srcs[0];
        jobs.push(c.anim(e, [{ left: s0.style.left, top: s0.style.top }, { left: L + 'px', top: Tp + 'px' }], ms, { delay: o.delay || 0 }));
        if (!c.fast) srcs.slice(1).forEach((s) => {
          const g = this.mk(t); g.classList.add('u4l2-ghostfly'); at(g, parseFloat(s.style.left), parseFloat(s.style.top)); this.stage.appendChild(g);
          jobs.push(c.anim(g, [{ left: s.style.left, top: s.style.top, opacity: 1 }, { left: L + 'px', top: Tp + 'px', opacity: 0.15 }], ms, { delay: o.delay || 0 }).then(() => g.remove(), (er) => { g.remove(); throw er; }));
        });
      } else jobs.push(c.anim(e, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], 420, { delay: o.fresh != null ? o.fresh : ms * 0.55 }));
    });
    for (const [k, e] of [...this.els]) {
      if (keep.has(k)) continue;
      this.els.delete(k); this.pos.delete(k);
      const into = o.into && o.into[k] && tgt[o.into[k]];
      const kf = into ? [{ left: e.style.left, top: e.style.top, opacity: 1 }, { left: into.L + 'px', top: into.T + 'px', opacity: 0 }] : [{ opacity: 1 }, { opacity: 0 }];
      jobs.push(c.anim(e, kf, into ? ms : 300).then(() => e.remove()));
    }
    await Promise.all(jobs);
  }
  el(k) { return this.els.get(k); }
  keys() { return [...this.els.keys()]; }
  flag(keys, cls, on = true) { keys.forEach((k) => { const e = this.els.get(k); if (e) e.classList.toggle(cls, on); }); }
  ctr(k) { const e = this.els.get(k), p = this.pos.get(k); return { x: p.L + e.offsetWidth / 2, t: p.T, b: p.T + e.offsetHeight, l: p.L, r: p.L + e.offsetWidth, y: p.T + e.offsetHeight / 2 }; }
  right() { let r = this.x; for (const k of this.els.keys()) r = Math.max(r, this.ctr(k).r); return r; }
  bbox(keys) {
    let l = 1e9, t = 1e9, r = -1e9, b = -1e9;
    keys.forEach((k) => { if (!this.els.has(k)) return; const q = this.ctr(k); l = Math.min(l, q.l); t = Math.min(t, q.t); r = Math.max(r, q.r); b = Math.max(b, q.b); });
    return { l, t, r, b };
  }
  async box(c, id, keys, cls, label, pad = 9) {
    const bb = this.bbox(keys), e = h('div', 'u4l2-pair ' + cls, label ? `<span class="u4l2-plab">${label}</span>` : '');
    const px = 5; this.stage.appendChild(box(at(e, bb.l - px, bb.t - pad + 4), bb.r - bb.l + 2 * px, bb.b - bb.t + 2 * pad - 6)); this.boxes.set(id, e);
    await c.anim(e, [{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }], 380);
  }
  async mark(c, id, cls, label) {
    const e = this.boxes.get(id); if (!e) return;
    e.className = 'u4l2-pair ' + cls; if (label != null) e.querySelector('.u4l2-plab').innerHTML = label;
    await c.anim(e, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }], 380);
  }
  async unbox(c, ...ids) {
    await Promise.all(ids.map((id) => { const e = this.boxes.get(id); if (!e) return null; this.boxes.delete(id); return c.anim(e, [{ opacity: 1 }, { opacity: 0 }], 300).then(() => e.remove()); }));
  }
}

/* ============ small animation helpers ============ */
function flashTok(c, e) { return c.anim(e, [{ transform: 'scale(1)', color: RED }, { transform: 'scale(1.35)', color: RED, offset: 0.4 }, { transform: 'scale(1)' }], 620); }
const pulse = (c, el, s = 1.12) => c.anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], 480);
async function lit(c, row, keys) { row.flag(keys, 'lit'); await Promise.all(keys.map((k, i) => c.sleep(i * 160).then(() => pulse(c, row.el(k), 1.14)))); }
function stampIn(c, el) { return c.anim(el, [{ opacity: 0, transform: 'scale(1.9) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); }
function stamp(stage, x, y, ok = true) { const e = add(stage, h('div', 'u4l2-stamp c ' + (ok ? 'ok' : 'no'), ok ? '✓' : '✗'), x, y); hide(e); return e; }
async function flip(c, row, k, spec) { // a block turns over (and changes) while the rest of the row updates
  const e = row.el(k);
  await c.anim(e, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(90deg)' }], 240);
  const p = row.set(c, spec, { quiet: [k] });
  await c.anim(e, [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], 260);
  await p;
}
function arcLayer(stage) { const s = svgEl('svg', { class: 'u4l2-arcs' }); stage.appendChild(s); return s; }
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
  return { async draw(c, ms = 420) { await c.anim(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], ms); await c.anim(hd, [{ opacity: 0 }, { opacity: 1 }], 120); } };
}
/* "factor ↓ / ↑ expand": the two directions of the same equation */
function twoWay(stage, x, y1, y2) {
  const H = y2 - y1, e = add(stage, h('div', 'u4l2-tw'), x, y1);
  e.innerHTML = `<svg width="150" height="${H}" viewBox="0 0 150 ${H}">
    <path d="M44 6V${H - 14}" stroke="${TEAL}" stroke-width="4" stroke-linecap="round"/><path d="M34 ${H - 22}L44 ${H - 6}L54 ${H - 22}" fill="none" stroke="${TEAL}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M106 ${H - 6}V14" stroke="${AMB}" stroke-width="4" stroke-linecap="round"/><path d="M96 22L106 6L116 22" fill="none" stroke="${AMB}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="44" y="${H / 2}" transform="rotate(-90 44 ${H / 2})" dy="-10" text-anchor="middle" class="u4l2-twt" fill="${TEAL}">factor</text>
    <text x="106" y="${H / 2}" transform="rotate(90 106 ${H / 2})" dy="-10" text-anchor="middle" class="u4l2-twt" fill="${AMB}">expand</text></svg>`;
  hide(e); return e;
}
/* "Check at x = 2": the question and the answer give the same number */
function subPanel(stage, x, y, w, s) {
  const e = add(stage, h('div', 'u4l2-chk', `<div class="h">Check at<br>${T(s[0])}</div><div><small>the question</small>${T(s[1])}</div><div><small>the answer</small>${T(s[2])} ✓</div>`), x, y);
  e.style.width = w + 'px'; hide(e); return e;
}
const subCap = (s, v) => `<b>Check by substituting</b> ${T(s[0])} into both forms. They give the same number, ${T(String(v))} ✓ (Use a number like 2 or 3: 0 and 1 can hide a mistake.)`;

/* ============ Section 1: the bracket is one block ============ */
const BO = {
  n: { r0: 'eq0==#ghost a=5x B1=(x+2)#blk m=- b=3 B2=(x+2)#blk', blk: 'x+2', k: ['a', 'm', 'b'],
    mcap: `${T('5x')} multiplies the first block and ${T('-3')} multiplies the second. <b>The minus sign belongs to the 3</b>, so the second multiplier is ${T('-3')}, not ${T('3')}.`,
    r1: 'eq== B=(x+2)#blk<B1,B2 lp=( a=5x m=- b=3 rp=)', left: '5x-3', r2: 'eq== a=5x B1=(x+2)#blk<B m=- b=3 B2=(x+2)#blk<B' },
  a: { r0: 'eq0==#ghost a=(5x) B1=(x+8)#blk m=- b=(2) B2=(x+8)#blk', blk: 'x+8', k: ['a', 'm', 'b'],
    mcap: `${T('5x')} multiplies the first block and ${T('-2')} multiplies the second (the minus sign goes with the 2). The brackets around ${T('5x')} and ${T('2')} are just for show.`,
    r1: 'eq== B=(x+8)#blk<B1,B2 lp=( a=5x m=- b=2 rp=)', left: '5x-2', r2: 'eq== a=5x B1=(x+8)#blk<B m=- b=2 B2=(x+8)#blk<B' },
  b: { r0: 'eq0==#ghost a=5 B1=(2-3y)#blk m=+ b=4y B2=(2-3y)#blk', blk: '2-3y', k: ['a', 'm', 'b'],
    mcap: `${T('5')} multiplies the first block and ${T('+4y')} multiplies the second. The minus <b>inside</b> the block stays inside it.`,
    r1: 'eq== B=(2-3y)#blk<B1,B2 lp=( a=5 m=+ b=4y rp=)', left: '5+4y', r2: 'eq== a=5 B1=(2-3y)#blk<B m=+ b=4y B2=(2-3y)#blk<B' },
  c: { r0: 'eq0==#ghost a=8a B1=(3a+1)#blk m=+ B2=(3a+1)#blk', blk: '3a+1', k: ['a', 'm', 'b'],
    one: 'eq0==#ghost a=8a B1=(3a+1)#blk m=+ b=1#one B2=(3a+1)#blk',
    mcap: `${T('8a')} multiplies the first block and ${T('1')} multiplies the second.`,
    r1: 'eq== B=(3a+1)#blk<B1,B2 lp=( a=8a m=+ b=1#one rp=)', left: '8a+1', r2: 'eq== a=8a B1=(3a+1)#blk<B m=+ b=1#one B2=(3a+1)#blk<B' }
};
const blockOut = {
  title: 'The bracket is one block',
  height: 340,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n', label: tex('5x(x+2)-3(x+2)') }, { sep: 'Example 1 check:' }, { v: 'a', label: '(a)' }, { v: 'b', label: '(b)' }, { v: 'c', label: '(c)' }],
  intro: (k) => `Factor ${T(join(BO[k].r0))}. Look for what <b>both</b> terms have in common.`,
  make(stage, key) {
    const d = BO[key], svg = arcLayer(stage);
    const R0 = new Row(stage, 50, 26, 40), R1 = new Row(stage, 50, 128, 40), R2 = new Row(stage, 50, 238, 40);
    R0.set(NOW, d.r0);
    const steps = [{
      cap: `Both terms contain the bracket ${T('(' + d.blk + ')')}. Treat the whole bracket as <b>one block</b>, the way ${T('3x')} was one common factor in ${T('3x\\cdot2x+3x\\cdot3')}.`,
      run: (c) => lit(c, R0, ['B1', 'B2'])
    }];
    if (d.one) steps.push({
      cap: `The second term is the block on its own: that’s <b>one lot</b> of the block, ${T('1\\cdot(' + d.blk + ')')}. Write the 1 in so it can’t get lost.`,
      run: async (c) => { await R0.set(c, d.one); await pulse(c, R0.el('b'), 1.3); }
    });
    steps.push({
      cap: `What multiplies each block? ${d.mcap}`,
      run: async (c) => { R0.flag(d.k, 'hot'); await Promise.all(d.k.map((k) => pulse(c, R0.el(k)))); }
    }, {
      cap: `Pull the block out front, <b>once</b>. The multipliers stay behind, together in a new bracket: ${T(join(d.r1))}.`,
      run: async (c) => { await R1.set(c, d.r1, { src: R0 }); R1.flag(['B'], 'lit'); }
    }, {
      cap: `<b>Check by expanding:</b> multiply the block back into ${T('(' + d.left + ')')}. That gives ${T(join(d.r2))}, the expression we started with ✓ <b>Factoring is expanding run backwards.</b>`,
      run: async (c) => {
        R1.flag(['lp', 'a', 'm', 'b', 'rp'], 'fin');
        const B = R1.ctr('B'), A = R1.ctr('a'), Bb = R1.ctr('b');
        const a1 = arrow(svg, B.x, B.b + 2, A.x, A.b + 2, -26, TEAL), a2 = arrow(svg, B.x + 8, B.b + 2, Bb.x, Bb.b + 2, -40, TEAL);
        await a1.draw(c, 360); await a2.draw(c, 360);
        await R2.set(c, d.r2, { src: R1 });
        const xr = Math.max(R0.right(), R1.right(), R2.right());
        const tw = twoWay(stage, xr + 70, 34, 300), st = stamp(stage, R2.right() + 34, R2.ctr('a').y);
        await Promise.all([c.anim(tw, [{ opacity: 0 }, { opacity: 1 }], 400), stampIn(c, st)]);
      }
    });
    return steps;
  }
};

/* ============ Section 1: then check the leftover bracket ============ */
const LO = {
  n: { r0: 'eq0==#ghost a=4x B1=(x+3)#blk m=+ b=8 B2=(x+3)#blk', blk: 'x+3', r1: 'eq== B=(x+3)#blk<B1,B2 lp=( a=4x m=+ b=8 rp=)', hot: ['a', 'b'], gcf: '4',
    look: `Don’t stop yet! Look <b>inside</b> the leftover bracket: ${T('4x')} and ${T('8')} still share a factor of <b>4</b>.`,
    r2: 'eq== g=4<a B=(x+3)#blk lp=( a=x m=+ b=2 rp=)',
    fin: `Pull the 4 all the way to the front: ${T('4(x+3)(x+2)')}. Nothing is common inside ${T('(x+2)')} now, so this is the <b>simplest factored form</b>.`,
    sub: ['x=2', '4(2)(5)+8(5)=80', '4(5)(4)=80'], val: 80 },
  a: { r0: 'eq0==#ghost B1=(4y+3)#blk p1=(6y+1) m=+ B2=(4y+3)#blk p2=(2y)', blk: '4y+3', big: true,
    r1: 'eq== B=(4y+3)#blk<B1,B2 lb=\\big[ p1=(6y+1) m=+ p2=2y rb=\\big]', hot: ['p1', 'p2'],
    look: `The block was at the <b>front</b> of each term this time; it still comes out the same way. Inside the big bracket, collect like terms: ${T('6y+2y=8y')}.`,
    r2: 'eq== B=(4y+3)#blk lp=(<lb y8=8y<p1,p2 pl=+<p1 one=1<p1 rp=)<rb',
    fin: `${T('(4y+3)(8y+1)')}. Is anything common to ${T('8y')} and ${T('1')}? No, so this is the <b>simplest factored form</b>.`,
    sub: ['y=2', '(11)(13)+(11)(4)=187', '(11)(17)=187'], val: 187 },
  b: { r0: 'eq0==#ghost a=5a B1=(a-4)#blk m=- b=15 B2=(a-4)#blk', blk: 'a-4', r1: 'eq== B=(a-4)#blk<B1,B2 lp=( a=5a m=- b=15 rp=)', hot: ['a', 'b'], gcf: '5',
    look: `Look <b>inside</b> the leftover bracket: ${T('5a')} and ${T('15')} still share a factor of <b>5</b>.`,
    r2: 'eq== g=5<a B=(a-4)#blk lp=( a=a m=- b=3 rp=)',
    fin: `Pull the 5 to the front: ${T('5(a-4)(a-3)')}. Now no bracket has a common factor left: <b>simplest factored form</b>.`,
    sub: ['a=2', '5(2)(-2)-15(-2)=10', '5(-2)(-1)=10'], val: 10 }
};
const leftover = {
  title: 'Is the leftover bracket finished?',
  height: 400,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n', label: tex('4x(x+3)+8(x+3)') }, { sep: 'Example 2 check:' }, { v: 'a', label: '(a)' }, { v: 'b', label: '(b)' }],
  intro: (k) => `Factor ${T(join(LO[k].r0))} into <b>simplest factored form</b>.`,
  make(stage, key, ex) {
    const d = LO[key], W = ex.W;
    const R0 = new Row(stage, 50, 22, 40), R1 = new Row(stage, 50, 116, 40), R2 = new Row(stage, 50, 210, 40);
    R0.set(NOW, d.r0);
    const chk = subPanel(stage, 50, 304, Math.min(820, W - 100), d.sub);
    let chip = null;
    return [{
      cap: `Both terms contain the block ${T('(' + d.blk + ')')}. Pull it out front; what’s left goes in ${d.big ? 'a big bracket' : 'a new bracket'}: ${T(join(d.r1))}.`,
      run: async (c) => { await lit(c, R0, ['B1', 'B2']); await R1.set(c, d.r1, { src: R0 }); R1.flag(['B'], 'lit'); }
    }, {
      cap: d.look,
      run: async (c) => {
        R1.flag(d.hot, 'hot');
        if (d.gcf) { chip = add(stage, h('div', 'u4l2-gcf', 'common factor ' + d.gcf), R1.right() + 26, R1.y + 12); hide(chip); }
        await Promise.all([...d.hot.map((k) => pulse(c, R1.el(k))), chip ? c.anim(chip, [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], 380, { delay: 250 }) : null]);
      }
    }, {
      cap: d.fin,
      run: async (c) => { await R2.set(c, d.r2, { src: R1 }); R2.flag(R2.keys().filter((k) => k !== 'eq'), 'fin'); R2.flag(['B'], 'lit'); }
    }, {
      cap: subCap(d.sub, d.val),
      run: (c) => c.anim(chk, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], 420)
    }];
  }
};

/* ============ Section 1: opposite brackets flip with a minus sign ============ */
const FB = {
  n: { r0: 'eq0==#ghost a=4x B1=(x-3)#blk m=+ b=5 B2=(3-x)#blk2', A: 'x-3', Bx: '3-x',
    pre: 'eq== a=4x B1=(x-3)#blk m=+ b=5 B2=(3-x)#blk2', r1: 'eq== a=4x B1=(x-3)#blk m=-#redsign b=5 B2=(x-3)#blk',
    r2: 'eq== B=(x-3)#blk<B1,B2 lp=( a=4x m=- b=5 rp=)', ans: '(x-3)(4x-5)', flipT: '5(3-x)=5\\cdot(-1)(x-3)=-5(x-3)',
    xs: [5, 10, 0], sub: ['x=2', '4(2)(-1)+5(1)=-3', '(-1)(3)=-3'], val: -3 },
  c: { r0: 'eq0==#ghost a=3x B1=(x-7)#blk m=+ b=7 B2=(7-x)#blk2', A: 'x-7', Bx: '7-x',
    pre: 'eq== a=3x B1=(x-7)#blk m=+ b=7 B2=(7-x)#blk2', r1: 'eq== a=3x B1=(x-7)#blk m=-#redsign b=7 B2=(x-7)#blk',
    r2: 'eq== B=(x-7)#blk<B1,B2 lp=( a=3x m=- b=7 rp=)', ans: '(x-7)(3x-7)', flipT: '7(7-x)=7\\cdot(-1)(x-7)=-7(x-7)',
    xs: [10, 2, 0], sub: ['x=2', '3(2)(-5)+7(5)=5', '(-5)(-1)=5'], val: 5 }
};
const flipBlock = {
  title: 'Opposite blocks: flip one over',
  height: 400,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar (the table of values needs the room)
  choices: [{ v: 'n', label: tex('4x(x-3)+5(3-x)') }, { sep: 'Example 2 check:' }, { v: 'c', label: '(c)' }],
  intro: (k) => `Factor ${T(join(FB[k].r0))}. Do the two brackets match?`,
  make(stage, key, ex) {
    const d = FB[key], W = ex.W;
    const R0 = new Row(stage, 50, 22, 40), R1 = new Row(stage, 50, 116, 40), R2 = new Row(stage, 50, 210, 40);
    R0.set(NOW, d.r0);
    const val = (expr, x) => (expr[0] === 'x' ? x - Number(expr.slice(2)) : Number(expr.split('-')[0]) - x);
    const nt = add(stage, h('div', 'u4l2-nt'), W - 318, 14); nt.style.width = '296px';
    nt.innerHTML = `<table><tr><th>${T('x')}</th><th class="a">${T(d.A)}</th><th class="b">${T(d.Bx)}</th></tr>${d.xs.map((x) => `<tr class="r"><td>${x}</td><td class="a">${String(val(d.A, x)).replace('-', '−')}</td><td class="b">${String(val(d.Bx, x)).replace('-', '−')}</td></tr>`).join('')}</table><div class="foot">always opposites:<br><b>${T(d.Bx + '=-(' + d.A + ')')}</b></div>`;
    hide(nt);
    const chk = subPanel(stage, 50, 304, Math.min(820, W - 100), d.sub);
    return [{
      cap: `Do the blocks match? ${T('(' + d.A + ')')} and ${T('(' + d.Bx + ')')} have the same pieces in the <b>opposite order</b>. Different colours: they are <b>not</b> the same block (yet).`,
      run: (c) => lit(c, R0, ['B1', 'B2'])
    }, {
      cap: `Test a few numbers. Whatever ${T('x')} is, ${T('(' + d.Bx + ')')} is always the <b>opposite</b> of ${T('(' + d.A + ')')}: same size, other sign. So ${T(d.Bx + '=-(' + d.A + ')')}.`,
      run: async (c) => {
        await c.anim(nt, [{ opacity: 0 }, { opacity: 1 }], 300);
        const rows = [...nt.querySelectorAll('tr.r')];
        for (let i = 0; i < rows.length; i++) await c.anim(rows[i], [{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'none' }], 320, { delay: 120 });
        await c.anim(nt.querySelector('.foot'), [{ opacity: 0 }, { opacity: 1 }], 350);
      }
    }, {
      cap: `Flip the purple block over: ${T(d.flipT)}. Flipping a block <b>costs a minus sign</b>, so the ${T('+')} in front of the ${T(d.r1.match(/b=(\d+)/)[1])} becomes ${T('-')}.`,
      run: async (c) => { await R1.set(c, d.pre, { src: R0 }); await flip(c, R1, 'B2', d.r1); }
    }, {
      cap: `Now both blocks match. Pull ${T('(' + d.A + ')')} out front: ${T(d.ans)}.`,
      run: async (c) => { await lit(c, R1, ['B1', 'B2']); await R2.set(c, d.r2, { src: R1 }); R2.flag(['lp', 'a', 'm', 'b', 'rp'], 'fin'); }
    }, {
      cap: subCap(d.sub, d.val),
      run: (c) => c.anim(chk, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], 420)
    }];
  }
};

/* ============ Section 2: grouping with algebra tiles — two rectangles share a side ============ */
const TG = { n: { b: 3, d: 4 }, n2: { b: 5, d: 2 }, a: { b: 4, d: 5 } };
const tileGroup = {
  title: 'Two rectangles, one shared side',
  height: 500,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n', label: tex('x^2+3x+4x+12') }, { v: 'n2', label: tex('x^2+5x+2x+10') }, { sep: 'Example 3 check:' }, { v: 'a', label: '(a)' }],
  intro: (k) => { const { b, d } = TG[k]; return `Algebra tiles for ${T(`x^2+${b}x+${d}x+${b * d}`)}: one ${T('x^2')}-tile, ${b + d} ${T('x')}-tiles and ${b * d} unit tiles. Can they make <b>one</b> rectangle?`; },
  make(stage, key, ex) {
    const { b, d } = TG[key], W = ex.W, X = 104, U = 26, n = b * d;
    const start = `x^2+${b}x+${d}x+${n}`, blk = `x+${b}`, ans = `(x+${b})(x+${d})`;
    const tl = (kind, w, hh, x, y) => add(stage, box(h('div', `u4l2-tile ${kind} pos`), w, hh), x, y);
    // the loose pile, in four groups (one per term)
    const py = 20; let px = 34; const gx = [];
    const tray = add(stage, h('div', 'u4l2-tray', '<span>the tiles</span>'), 14, 6);
    const G1 = [tl('k2', X, X, px, py)]; gx.push([px, px + X]); px += X + 34;
    let s0 = px; const G2 = []; for (let i = 0; i < b; i++) { G2.push(tl('k1', U, X, px, py)); px += U + 7; } gx.push([s0, px - 7]); px += 27;
    s0 = px; const G3 = []; for (let i = 0; i < d; i++) { G3.push(tl('k1', U, X, px, py)); px += U + 7; } gx.push([s0, px - 7]); px += 27;
    s0 = px; const G4 = []; for (let i = 0; i < n; i++) G4.push(tl('k0', U, U, px + Math.floor(i / 3) * (U + 5), py + (i % 3) * (U + 5)));
    gx.push([s0, s0 + Math.ceil(n / 3) * (U + 5) - 5]);
    box(tray, gx[3][1] + 30 - 14, 202); stage.insertBefore(tray, stage.firstChild);
    const plabs = ['x^2', `${b}x`, `${d}x`, `${n}`].map((t, i) => { const e = add(stage, h('div', 'u4l2-tlab', T(t)), (gx[i][0] + gx[i][1]) / 2, py + X + 6); e.style.translate = '-50% 0'; return e; });
    const pbox = (i, j, cls, lab) => { const e = add(stage, h('div', `u4l2-pair ${cls} below`, `<span class="u4l2-plab">${lab}</span>`), gx[i][0] - 10, py - 10); box(e, gx[j][1] - gx[i][0] + 20, X + 56); hide(e); return e; };
    const B1 = pbox(0, 1, 'p1', 'pair 1'), B2 = pbox(2, 3, 'p2', 'pair 2');
    // where the rectangles go
    const ox = 150, oy = 240, RW = X + b * U, ox2 = ox + RW + 70;
    const topLab = (x) => { const e = add(stage, h('span', 'u4l2-tk blk c', T(blk)), x, oy - 24); e.style.fontSize = '24px'; hide(e); return e; };
    const sideLab = (t, x, y) => { const e = add(stage, h('div', 'u4l2-side c', T(t)), x, y); hide(e); return e; };
    const T1 = topLab(ox + RW / 2), S1 = sideLab('x', ox - 22, oy + X / 2), T2 = topLab(ox2 + RW / 2), S2 = sideLab(String(d), ox2 - 22, oy + d * U / 2);
    const E1 = add(stage, box(h('div', 'u4l2-edge'), RW, 6), ox, oy - 3), E2 = add(stage, box(h('div', 'u4l2-edge'), RW, 6), ox2, oy - 3); hide(E1, E2);
    const vbr = add(stage, box(h('div', 'u4l2-vbr'), 14, X + d * U), ox - 46, oy); hide(vbr);
    const vlab = add(stage, h('div', 'u4l2-side', T(`x+${d}`)), ox - 56, oy + (X + d * U) / 2); vlab.style.translate = '-100% -50%'; hide(vlab);
    // the algebra, on the right
    const pxR = W - 300, line = (y, html, cls = '') => add(stage, h('div', 'u4l2-tpl ' + cls, html), pxR, y);
    const L0 = line(236, T(start)); L0.style.opacity = 1;
    const L1 = line(292, `<span>${T(`=x(${blk})`)}</span><span class="p2">${T(`{}+${d}(${blk})`)}</span>`); L1.style.opacity = 1;
    const [L1a, L1b] = L1.children; hide(L1a, L1b);
    const L2 = line(348, T('=' + ans), 'fin');
    const L3 = line(404, `<div class="u4l2-tpl-s">expand it back:</div>${T(`(x+${b})(x+${d})`)}<br>${T(`=${start}`)} ✓`); L3.style.fontSize = '23px';
    const rl = (t, x, y) => { const e = add(stage, h('div', 'u4l2-rlab c', T(t)), x, y); hide(e); return e; };
    const RL = [rl('x^2', ox + X / 2, oy + X / 2), rl(`${b}x`, ox + X + b * U / 2, oy + X / 2), rl(`${d}x`, ox + X / 2, oy + X + d * U / 2), rl(`${n}`, ox + X + b * U / 2, oy + X + d * U / 2)];
    const st = stamp(stage, ox + RW + 40, oy + (X + d * U) / 2);
    const move = (c, e, x, y, w, hh, delay = 0) => c.anim(e, [{ left: e.style.left, top: e.style.top, width: e.style.width, height: e.style.height }, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' }], 720, { delay });
    const fadeOut = (c, ...els) => Promise.all(els.map((e) => c.anim(e, [{ opacity: e.style.opacity === '' ? 1 : Number(e.style.opacity) }, { opacity: 0 }], 300)));
    const fadeIn = (c, e, delay = 0) => c.anim(e, [{ opacity: 0 }, { opacity: 1 }], 380, { delay });
    return [{
      cap: `No factor is common to <b>all four</b> terms. <b>Pair them up</b>: ${T(`x^2+${b}x`)} and ${T(`${d}x+${n}`)}.`,
      run: (c) => Promise.all([fadeIn(c, B1), fadeIn(c, B2, 200)])
    }, {
      cap: `<b>Pair 1:</b> the ${T('x^2')}-tile and ${b} ${T('x')}-tiles make a rectangle ${T('x')} tall and ${T(blk)} wide. So ${T(`x^2+${b}x=x(${blk})`)}.`,
      run: async (c) => {
        await fadeOut(c, B1, plabs[0], plabs[1]);
        await Promise.all([move(c, G1[0], ox, oy, X, X), ...G2.map((e, i) => move(c, e, ox + X + i * U, oy, U, X, 80 + i * 60))]);
        await Promise.all([fadeIn(c, T1), fadeIn(c, S1), fadeIn(c, L1a, 150)]);
      }
    }, {
      cap: `<b>Pair 2:</b> ${d} ${T('x')}-tiles lying flat and ${n} unit tiles in ${d} rows of ${b} make a rectangle ${d} tall and ${T(blk)} wide. So ${T(`${d}x+${n}=${d}(${blk})`)}.`,
      run: async (c) => {
        await fadeOut(c, B2, plabs[2], plabs[3]);
        await Promise.all([...G3.map((e, j) => move(c, e, ox2, oy + j * U, X, U, j * 70)), ...G4.map((e, i) => move(c, e, ox2 + X + (i % b) * U, oy + Math.floor(i / b) * U, U, U, 150 + i * 22))]);
        await Promise.all([fadeIn(c, T2), fadeIn(c, S2), fadeIn(c, L1b, 150)]);
      }
    }, {
      cap: `Both rectangles are ${T(blk)} wide: the <b>same side</b>, the same block. That shared side is the <b>common binomial factor</b>.`,
      run: async (c) => {
        T1.classList.add('lit'); T2.classList.add('lit');
        await Promise.all([fadeIn(c, E1), fadeIn(c, E2), pulse(c, T1, 1.15), pulse(c, T2, 1.15)]);
      }
    }, {
      cap: `Slide rectangle 2 under rectangle 1 so the ${T(blk)} sides line up. Together they make <b>one</b> rectangle, ${T(blk)} wide and ${T(`x+${d}`)} tall: ${T(start + '=' + ans)}.`,
      run: async (c) => {
        await fadeOut(c, E1, E2);
        const dx = ox - ox2, dy = X;
        await Promise.all([
          ...[...G3, ...G4].map((e) => move(c, e, parseFloat(e.style.left) + dx, parseFloat(e.style.top) + dy, parseFloat(e.style.width), parseFloat(e.style.height))),
          c.anim(T2, [{ left: T2.style.left, opacity: 1 }, { left: T1.style.left, opacity: 0 }], 720),
          c.anim(S2, [{ left: S2.style.left, top: S2.style.top }, { left: (ox - 22) + 'px', top: (oy + X + d * U / 2) + 'px' }], 720)
        ]);
        await Promise.all([fadeIn(c, vbr), fadeIn(c, vlab, 120), fadeIn(c, L2, 250)]);
      }
    }, {
      cap: `<b>Check by expanding:</b> the four pieces of the big rectangle are ${T('x^2')}, ${T(b + 'x')}, ${T(d + 'x')} and ${T(String(n))}, the same four terms ✓ Expanding and factoring are the <b>same picture</b>, read in opposite directions.`,
      run: async (c) => { await Promise.all(RL.map((e, i) => fadeIn(c, e, i * 160))); await Promise.all([fadeIn(c, L3), stampIn(c, st)]); }
    }];
  }
};

/* ============ Section 2: pair up, pull out, pull out again ============ */
const GR = {
  n: { r0: 't1=x^2 s2=+ t2=3x s3=+ t3=4x s4=+ t4=12', p2: ['t3', 's4', 't4'],
    c1: `${T('x^2')} and ${T('3x')} share ${T('x')}. Pull it out: ${T('x^2+3x=x(x+3)')}.`, r1a: 'g1=x<t1 B1=(x+3)#blk<t1,t2',
    c2: `${T('4x')} and ${T('12')} share ${T('4')}. Pull it out: ${T('4x+12=4(x+3)')}.`, r1: 'g1=x B1=(x+3)#blk s3=+ g2=4<t3 B2=(x+3)#blk<t3,t4',
    blk: 'x+3', g: ['x', '4'], r2: 'B=(x+3)#blk<B1,B2 lp=( g1=x s3=+ g2=4 rp=)', ans: '(x+3)(x+4)',
    r3: 't1=x^2<g1 s2=+<B t2=3x<B s3=+<s3 t3=4x<g2 s4=+<B t4=12<g2', start: 'x^2+3x+4x+12' },
  rc: { r0: 't1=37\\cdot6 s2=+ t2=37\\cdot3 s3=+ t3=63\\cdot6 s4=+ t4=63\\cdot3', p2: ['t3', 's4', 't4'],
    c0: `The combo receipt from the warm-up: 37 burgers at $6, 37 fries at $3, 63 burgers, 63 fries. <b>Pair up the lines</b>: first two, last two.`,
    c1: `Both lines have <b>37</b>: ${T('37\\cdot6+37\\cdot3=37(6+3)')}. That’s 37 combos.`, r1a: 'g1=37<t1 B1=(6+3)#blk<t1,t2',
    c2: `Both lines have <b>63</b>: ${T('63\\cdot6+63\\cdot3=63(6+3)')}. That’s 63 combos.`, r1: 'g1=37 B1=(6+3)#blk s3=+ g2=63<t3 B2=(6+3)#blk<t3,t4',
    blk: '6+3', g: ['37', '63'], r2: 'B=(6+3)#blk<B1,B2 lp=( g1=37 s3=+ g2=63 rp=)', ans: '(6+3)(37+63)',
    r3: 'n9=9<B tm=\\times n100=100<lp,g1,g2 e2== tot=\\$900',
    chk: `${T('(6+3)(37+63)=9\\times100=900')}: <b>$900</b>, the warm-up answer, with one addition and one multiplication. The block ${T('(6+3)')} is the price of <b>one combo</b>!` },
  a: { r0: 't1=x^2 s2=+ t2=4x s3=+ t3=5x s4=+ t4=20', p2: ['t3', 's4', 't4'],
    c1: `${T('x^2')} and ${T('4x')} share ${T('x')}: ${T('x^2+4x=x(x+4)')}.`, r1a: 'g1=x<t1 B1=(x+4)#blk<t1,t2',
    c2: `${T('5x')} and ${T('20')} share ${T('5')}: ${T('5x+20=5(x+4)')}.`, r1: 'g1=x B1=(x+4)#blk s3=+ g2=5<t3 B2=(x+4)#blk<t3,t4',
    blk: 'x+4', g: ['x', '5'], r2: 'B=(x+4)#blk<B1,B2 lp=( g1=x s3=+ g2=5 rp=)', ans: '(x+4)(x+5)',
    r3: 't1=x^2<g1 s2=+<B t2=4x<B s3=+<s3 t3=5x<g2 s4=+<B t4=20<g2', start: 'x^2+4x+5x+20' },
  b: { r0: 't1=6x^2 s2=- t2=3x s3=+ t3=8x s4=- t4=4', p2: ['t3', 's4', 't4'],
    c1: `${T('6x^2')} and ${T('-3x')} share ${T('3x')}: ${T('6x^2-3x=3x(2x-1)')}.`, r1a: 'g1=3x<t1 B1=(2x-1)#blk<t1,t2',
    c2: `${T('8x')} and ${T('-4')} share ${T('4')}: ${T('8x-4=4(2x-1)')}. Check the sign: ${T('4\\cdot(-1)=-4')} ✓`, r1: 'g1=3x B1=(2x-1)#blk s3=+ g2=4<t3 B2=(2x-1)#blk<t3,t4',
    blk: '2x-1', g: ['3x', '4'], r2: 'B=(2x-1)#blk<B1,B2 lp=( g1=3x s3=+ g2=4 rp=)', ans: '(2x-1)(3x+4)',
    r3: 't1=6x^2<g1 s2=-<B t2=3x<B s3=+<s3 t3=8x<g2 s4=-<B t4=4<g2', start: '6x^2-3x+8x-4' },
  c: { r0: 't1=10a^2 s2=- t2=15a s3=- t3=4a s4=+ t4=6', p2: ['s3', 't3', 's4', 't4'],
    c1: `${T('10a^2')} and ${T('-15a')} share ${T('5a')}: ${T('10a^2-15a=5a(2a-3)')}.`, r1a: 'g1=5a<t1 B1=(2a-3)#blk<t1,t2',
    c2: `Pair 2 <b>starts with a minus</b>, so pull out ${T('-2')}, not ${T('2')}: ${T('-4a+6=-2(2a-3)')}. Every sign inside flips, and now the bracket matches pair 1.`,
    note: ['Pull out −2. Check inside:', `${T('-2\\cdot2a=-4a')} ✓`, `${T('-2\\cdot(-3)=+6')} ✓`, `<span class="no">Pull out +2? ${T('2(-2a+3)')} ✗</span>`],
    r1: 'g1=5a B1=(2a-3)#blk s3=- g2=2<t3 B2=(2a-3)#blk<t3,t4',
    blk: '2a-3', g: ['5a', '-2'], r2: 'B=(2a-3)#blk<B1,B2 lp=( g1=5a s3=- g2=2 rp=)', ans: '(2a-3)(5a-2)',
    r3: 't1=10a^2<g1 s2=-<B t2=15a<B s3=-<s3 t3=4a<g2 s4=+<B t4=6<g2', start: '10a^2-15a-4a+6' },
  d: { r0: 't1=mn s2=+ t2=mp s3=- t3=qn s4=- t4=qp', p2: ['s3', 't3', 's4', 't4'],
    c1: `${T('mn')} and ${T('mp')} share ${T('m')}: ${T('mn+mp=m(n+p)')}.`, r1a: 'g1=m<t1 B1=(n+p)#blk<t1,t2',
    c2: `Pair 2 <b>starts with a minus</b>: pull out ${T('-q')}. ${T('-qn-qp=-q(n+p)')}: both signs inside flip to ${T('+')}.`,
    note: ['Pull out −q. Check inside:', `${T('-q\\cdot n=-qn')} ✓`, `${T('-q\\cdot p=-qp')} ✓`],
    r1: 'g1=m B1=(n+p)#blk s3=- g2=q<t3 B2=(n+p)#blk<t3,t4',
    blk: 'n+p', g: ['m', '-q'], r2: 'B=(n+p)#blk<B1,B2 lp=( g1=m s3=- g2=q rp=)', ans: '(n+p)(m-q)',
    r3: 't1=mn<g1 s2=+<B t2=mp<B s3=-<s3 t3=qn<g2 s4=-<B t4=qp<g2', start: 'mn+mp-qn-qp' }
};
const grouping = {
  title: 'Grouping, one move at a time',
  height: 400,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n', label: tex('x^2+3x+4x+12') }, { v: 'rc', label: 'the combo receipt' }, { sep: 'Example 3 check:' }, { v: 'a', label: '(a)' }, { v: 'b', label: '(b)' }, { v: 'c', label: '(c)' }, { v: 'd', label: '(d)' }],
  intro: (k) => `Factor ${T(join(GR[k].r0))} by grouping.`,
  make(stage, key, ex) {
    const d = GR[key], W = ex.W, svg = arcLayer(stage), pre = (s) => 'eq0==#ghost ' + s, eq = (s) => 'eq== ' + s;
    const R0 = new Row(stage, 50, 44, 36), R1 = new Row(stage, 50, 134, 36), R2 = new Row(stage, 50, 224, 36), R3 = new Row(stage, 50, 316, 36);
    R0.set(NOW, pre(d.r0));
    let note = null;
    if (d.note) { note = add(stage, h('div', 'u4l2-note', `<div class="h">${d.note[0]}</div>${d.note.slice(1).map((x) => `<div>${x}</div>`).join('')}`), W - 330, 118); note.style.width = '308px'; hide(note); }
    const st = stamp(stage, 0, 0);
    return [{
      cap: d.c0 || `Four terms, and no factor is common to <b>all four</b>. So <b>pair them up</b>: the first two terms, and the last two.`,
      run: async (c) => { await R0.box(c, 'p1', ['t1', 's2', 't2'], 'p1', 'pair 1'); await R0.box(c, 'p2', d.p2, 'p2', 'pair 2'); }
    }, {
      cap: `<b>Pair 1:</b> ${d.c1}`,
      run: (c) => R1.set(c, eq(d.r1a), { src: R0 })
    }, {
      cap: `<b>Pair 2:</b> ${d.c2}`,
      run: async (c) => { await R1.set(c, eq(d.r1), { src: R0 }); if (note) await c.anim(note, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], 400); }
    }, {
      cap: `Both pairs left the <b>same block</b>, ${T('(' + d.blk + ')')}. That shared bracket is the common binomial factor.`,
      run: (c) => lit(c, R1, ['B1', 'B2'])
    }, {
      cap: `Pull the block out front, <b>once</b>. What multiplied it, ${T(d.g[0])} and ${T(d.g[1])}, goes in the second bracket: ${T(d.ans)}.`,
      run: async (c) => { await R2.set(c, eq(d.r2), { src: R1 }); R2.flag(['lp', 'g1', 's3', 'g2', 'rp'], 'fin'); R2.flag(['B'], 'lit'); }
    }, {
      cap: d.chk || `<b>Check by expanding:</b> multiply the block by ${T(d.g[0])} and by ${T(d.g[1])}. That gives back ${T(d.start)}, the four terms we started with ✓`,
      run: async (c) => {
        if (!d.chk) {
          const B = R2.ctr('B'), A = R2.ctr('g1'), C2 = R2.ctr('g2');
          const a1 = arrow(svg, B.x, B.b + 1, A.x, A.b + 1, -22, TEAL), a2 = arrow(svg, B.x + 8, B.b + 1, C2.x, C2.b + 1, -32, TEAL);
          await a1.draw(c, 340); await a2.draw(c, 340);
        }
        await R3.set(c, eq(d.r3), { src: R2 });
        if (d.chk) R3.flag(['tot'], 'fin');
        at(st, R3.right() + 34, R3.y + 26);
        await stampIn(c, st);
      }
    }];
  }
};

/* ============ Section 2: no match? rearrange and try again ============ */
const RA = {
  n1: { r0: 't1=ab s2=+ t2=12 s3=+ t3=3a s4=+ t4=4b', bad: [['t1', 's2', 't2'], ['t3', 's4', 't4']], badL: ['nothing in common', 'nothing in common'],
    badCap: `${T('ab')} and ${T('12')} have no common factor (other than 1), and neither do ${T('3a')} and ${T('4b')}. <b>No common bracket appears</b> ✗`,
    why: `<b>Rearrange</b> so terms that share a factor sit together: ${T('ab')} and ${T('3a')} both have ${T('a')}; ${T('4b')} and ${T('12')} both have ${T('4')}. Each term takes its <b>own sign</b> with it.`,
    r0b: 't1=ab s3=+ t3=3a s4=+ t4=4b s2=+ t2=12', p: [['t1', 's3', 't3'], ['t4', 's2', 't2']],
    pairCap: `Now pair up and pull out: ${T('ab+3a=a(b+3)')} and ${T('4b+12=4(b+3)')}. Matching blocks!`,
    r1: 'g1=a<t1 B1=(b+3)#blk<t1,t3 s4=+ g2=4<t4 B2=(b+3)#blk<t4,t2', blk: 'b+3',
    r2: 'B=(b+3)#blk<B1,B2 lp=( g1=a s4=+ g2=4 rp=)', ans: '(b+3)(a+4)', okL: ['a(b+3)', '4(b+3)'],
    sub: ['a=2,\\ b=5', '10+12+6+20=48', '(5+3)(2+4)=48'], val: 48 },
  n2: { r0: 't1=ab s2=+ t2=12 s3=+ t3=3a s4=+ t4=4b', bad: [['t1', 's2', 't2'], ['t3', 's4', 't4']], badL: ['nothing in common', 'nothing in common'],
    badCap: `Same start: ${T('ab+12')} and ${T('3a+4b')} have no common factors. <b>No common bracket</b> ✗`,
    why: `A different rearrangement: ${T('ab')} and ${T('4b')} both have ${T('b')}; ${T('3a')} and ${T('12')} both have ${T('3')}. Each term keeps its own sign.`,
    r0b: 't1=ab s4=+ t4=4b s3=+ t3=3a s2=+ t2=12', p: [['t1', 's4', 't4'], ['t3', 's2', 't2']],
    pairCap: `Pair up and pull out: ${T('ab+4b=b(a+4)')} and ${T('3a+12=3(a+4)')}. Matching blocks again!`,
    r1: 'g1=b<t1 B1=(a+4)#blk<t1,t4 s3=+ g2=3<t3 B2=(a+4)#blk<t3,t2', blk: 'a+4',
    r2: 'B=(a+4)#blk<B1,B2 lp=( g1=b s3=+ g2=3 rp=)', ans: '(a+4)(b+3)', okL: ['b(a+4)', '3(a+4)'], same: true,
    sub: ['a=2,\\ b=5', '10+12+6+20=48', '(2+4)(5+3)=48'], val: 48 },
  e: { r0: 't1=3x^2 s2=+ t2=10y^2 s3=- t3=6xy^2 s4=- t4=5x', bad: [['t1', 's2', 't2'], ['s3', 't3', 's4', 't4']], badL: ['nothing in common', T('-x(6y^2+5)')],
    badCap: `${T('3x^2')} and ${T('10y^2')} share nothing, and the second pair gives ${T('-x(6y^2+5)')}. <b>No matching bracket</b> ✗`,
    why: `<b>Rearrange:</b> the ${T('x')}-only terms together (${T('3x^2')} and ${T('-5x')}), the ${T('y^2')} terms together (${T('10y^2')} and ${T('-6xy^2')}). Each term takes its <b>own sign</b> with it.`,
    r0b: 't1=3x^2 s4=- t4=5x s2=+ t2=10y^2 s3=- t3=6xy^2', p: [['t1', 's4', 't4'], ['s2', 't2', 's3', 't3']],
    pairCap: `Pair 1: ${T('3x^2-5x=x(3x-5)')}. Pair 2: pulling out ${T('2y^2')} gives ${T('10y^2-6xy^2=2y^2(5-3x)')}: the <b>opposite</b> block (purple)!`,
    r1: 'g1=x<t1 B1=(3x-5)#blk<t1,t4 s2=+ g2=2y^2<t2 B2=(5-3x)#blk2<t2,t3',
    flipCap: `Pull out ${T('-2y^2')} instead: ${T('10y^2-6xy^2=-2y^2(3x-5)')}. The block flips and the ${T('+')} becomes ${T('-')}. Now the blocks match.`,
    r1f: 'g1=x B1=(3x-5)#blk s2=-#redsign g2=2y^2 B2=(3x-5)#blk', blk: '3x-5',
    r2: 'B=(3x-5)#blk<B1,B2 lp=( g1=x s2=- g2=2y^2 rp=)', ans: '(3x-5)(x-2y^2)', okL: ['x(3x-5)', '-2y^2(3x-5)'],
    sub: ['x=3,\\ y=2', '27+40-72-15=-20', '(9-5)(3-8)=-20'], val: -20 }
};
const rearrange = {
  title: 'No match? Rearrange and try again',
  height: 420,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n1', label: tex('ab+12+3a+4b') }, { v: 'n2', label: 'another way' }, { sep: 'Example 3 check:' }, { v: 'e', label: '(e)' }],
  intro: (k) => `Factor ${T(join(RA[k].r0))} by grouping.`,
  make(stage, key, ex) {
    const d = RA[key], W = ex.W, pre = (s) => 'eq0==#ghost ' + s, eq = (s) => 'eq== ' + s;
    const R0 = new Row(stage, 50, 58, 36), R1 = new Row(stage, 50, 156, 36), R2 = new Row(stage, 50, 248, 36);
    R0.set(NOW, pre(d.r0));
    const chk = subPanel(stage, 50, 330, Math.min(820, W - 100), d.sub);
    const xs = stamp(stage, 0, 0, false);
    const steps = [{
      cap: `Pair the terms <b>in the order given</b>: the first two terms, and the last two.`,
      run: async (c) => { await R0.box(c, 'p1', d.bad[0], 'p1', 'pair 1'); await R0.box(c, 'p2', d.bad[1], 'p2', 'pair 2'); }
    }, {
      cap: d.badCap,
      run: async (c) => {
        await Promise.all([R0.mark(c, 'p1', 'bad', d.badL[0]), R0.mark(c, 'p2', 'bad', d.badL[1])]);
        at(xs, R0.right() + 40, R0.y + 26); await stampIn(c, xs);
      }
    }, {
      cap: d.why,
      run: async (c) => {
        await Promise.all([R0.unbox(c, 'p1', 'p2'), c.anim(xs, [{ opacity: 1 }, { opacity: 0 }], 250)]);
        await R0.set(c, pre(d.r0b), { hop: 46, ms: 900 });
      }
    }, {
      cap: d.pairCap,
      run: async (c) => {
        await R0.box(c, 'q1', d.p[0], 'p1', 'pair 1'); await R0.box(c, 'q2', d.p[1], 'p2', 'pair 2');
        await R1.set(c, eq(d.r1), { src: R0 });
        if (!d.flipCap) await lit(c, R1, ['B1', 'B2']); else R1.flag(['B1', 'B2'], 'lit');
      }
    }];
    if (d.flipCap) steps.push({
      cap: d.flipCap,
      run: async (c) => { await flip(c, R1, 'B2', eq(d.r1f)); await pulse(c, R1.el('B2'), 1.14); }
    });
    steps.push({
      cap: `Pull the matching block ${T('(' + d.blk + ')')} out front: ${T(d.ans)}.` + (d.same ? ' The <b>same answer</b> as the first rearrangement, with the brackets in the other order.' : ''),
      run: async (c) => { await R2.set(c, eq(d.r2), { src: R1 }); R2.flag(R2.keys().filter((k) => k !== 'eq' && k !== 'B'), 'fin'); R2.flag(['B'], 'lit'); }
    }, {
      cap: subCap(d.sub, d.val),
      run: (c) => c.anim(chk, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], 420)
    });
    return steps;
  }
};

/* ============ warm-up: the combo receipt ============ */
const INK = '#1e2d46';
function burger(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-42 2 A42 34 0 0 1 42 2 Z" fill="#e2a650" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="-18" cy="-14" rx="4" ry="2.2" fill="#fff"/><ellipse cx="0" cy="-21" rx="4" ry="2.2" fill="#fff"/><ellipse cx="18" cy="-14" rx="4" ry="2.2" fill="#fff"/>
    <path d="M-46 2 Q-40 11 -32 3 Q-24 11 -16 3 Q-8 11 0 3 Q8 11 16 3 Q24 11 32 3 Q40 11 46 2 L46 9 L-46 9 Z" fill="#6eb446" stroke="${INK}" stroke-width="1.5"/>
    <rect x="-44" y="8" width="88" height="15" rx="6" fill="#6e3c23" stroke="${INK}" stroke-width="1.5"/>
    <rect x="-42" y="23" width="84" height="15" rx="6" fill="#e2a650" stroke="${INK}" stroke-width="2"/></g>`;
}
function fries(x, y, s) {
  const sticks = [[-22, 40], [-13, 50], [-4, 42], [5, 54], [14, 45], [22, 38]].map(([sx, hh]) => `<rect x="${sx - 4}" y="${-hh}" width="8" height="${hh + 10}" rx="2" fill="#facd3c" stroke="#c88c14" stroke-width="1.2"/>`).join('');
  return `<g transform="translate(${x} ${y}) scale(${s})">${sticks}<path d="M-32 -6 L32 -6 L25 42 L-25 42 Z" fill="#d23c32" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><text x="0" y="27" text-anchor="middle" fill="#fff" style="font: 900 22px var(--round)">F</text></g>`;
}
function menuSVG() {
  return `<svg viewBox="0 0 560 330" role="img" aria-label="Menu: burger $6 plus fries $3 equals a combo for $9. Team A buys 7 combos, Team B buys 5 combos.">
    <rect x="3" y="3" width="554" height="324" rx="18" fill="${INK}"/><rect x="13" y="13" width="534" height="304" rx="12" fill="#e8f0fc"/>
    <text x="280" y="52" class="u4l2-mt big">MENU</text>
    ${burger(92, 136, 1.15)}<text x="92" y="214" class="u4l2-mt">Burger $6</text>
    <text x="176" y="150" class="u4l2-mt op">+</text>
    ${fries(256, 140, 1.15)}<text x="256" y="214" class="u4l2-mt">Fries $3</text>
    <text x="338" y="150" class="u4l2-mt op">=</text>
    <rect x="376" y="72" width="164" height="164" rx="14" fill="#fff" stroke="#c93a33" stroke-width="3.5"/>
    ${burger(422, 134, 0.78)}${fries(500, 128, 0.78)}<text x="458" y="214" class="u4l2-mt red">COMBO $9</text>
    <text x="150" y="284" class="u4l2-mt team">Team A: <tspan font-weight="900">7</tspan> combos</text><text x="410" y="284" class="u4l2-mt team">Team B: <tspan font-weight="900">5</tspan> combos</text></svg>`;
}
function mountWarm() {
  const menu = document.getElementById('wu-menu'); if (menu) menu.innerHTML = menuSVG();
  const rc = document.getElementById('receipt'); if (!rc) return;
  const lines = [...rc.querySelectorAll('.u4l2-rl')], total = document.getElementById('rc-total'), work = document.getElementById('rc-work');
  const btns = [...document.querySelectorAll('[data-rc]')];
  let gen = 0;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reset = () => { gen++; lines.forEach((l) => l.classList.remove('on', 'done')); rc.classList.remove('combos'); total.textContent = '?'; work.innerHTML = '&nbsp;'; btns.forEach((b) => b.classList.remove('on')); };
  async function byLines(g) {
    const subs = [222, 111, 378, 189]; let run = 0;
    for (let i = 0; i < lines.length; i++) {
      lines[i].classList.add('on'); await wait(450); if (g !== gen) return;
      lines[i].classList.remove('on'); lines[i].classList.add('done'); run += subs[i];
      work.innerHTML = `Running total: ${T(subs.slice(0, i + 1).join('+') + '=' + run)}`;
      await wait(450); if (g !== gen) return;
    }
    total.textContent = '$900';
    work.innerHTML = `${T('222+111+378+189=900')}<br><span class="muted">4 multiplications and 3 additions</span>`;
  }
  async function byCombos(g) {
    rc.classList.add('combos'); await wait(700); if (g !== gen) return;
    work.innerHTML = `Each burger line pairs with a fries line: ${T('37+63=100')} combos`; await wait(900); if (g !== gen) return;
    total.textContent = '$900';
    work.innerHTML = `${T('37+63=100')} combos, and ${T('100\\times\\$9=\\$900')}<br><span class="muted">1 addition and 1 multiplication</span>`;
  }
  btns.forEach((b) => b.addEventListener('click', () => {
    const m = b.dataset.rc; reset(); if (m === 'reset') return;
    b.classList.add('on'); const g = gen;
    (m === 'lines' ? byLines : byCombos)(g);
  }));
}

function mountReveals() {
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

/* ============ wiring ============ */
/* The tokens are measured, so build the pictures again once KaTeX’s fonts have arrived (a first build may use a fallback font). */
function fontsReady() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  const loads = ['40px KaTeX_Main', 'italic 40px KaTeX_Math', 'bold 40px KaTeX_Main', '40px KaTeX_Size1'].map((f) => document.fonts.load(f).catch(() => null));
  return Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 3000))]);
}
function mountExplainers() {
  const defs = { blockOut, leftover, flipBlock, tileGroup, grouping, rearrange };
  const exs = [...document.querySelectorAll('[data-explainer]')].map((el) => new Explainer(el, defs[el.dataset.explainer]));
  fontsReady().then(() => exs.forEach((x) => { if (x.lastW && !x.running && !x.auto) x.build(x.k); }));
}

mountWarm(); mountReveals(); mountExplainers();

/* ============ Stand Up Break! — remove a common binomial factor at the whiteboards ============ */
{
  /* a term is [coefficient, { letter: exponent }]; a polynomial is a list of terms */
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const VS = (v) => Object.keys(v || {}).sort().filter((k) => v[k]).map((k) => (v[k] === 1 ? k : k + '^{' + v[k] + '}')).join('');
  const TM = (c, v, first) => { const s = VS(v), a = Math.abs(c); return c === 0 ? '' : (c < 0 ? '-' : first ? '' : '+') + (a === 1 && s ? '' : a) + s; };
  const P = (ts) => { let o = ''; ts.forEach(([c, v]) => { if (c) o += TM(c, v, o === ''); }); return o || '0'; };
  const B = (ts) => '(' + P(ts) + ')';
  const V = (s, e = 1) => ({ [s]: e });
  const X = (a, b) => { const v = { ...a[1] }; for (const k in b[1]) v[k] = (v[k] || 0) + b[1][k]; return [a[0] * b[0], v]; };
  const MUL = (A, Bs) => { const m = new Map(); A.forEach((a) => Bs.forEach((b) => { const t = X(a, b), k = VS(t[1]); if (m.has(k)) m.get(k)[0] += t[0]; else m.set(k, t); })); return [...m.values()].filter((t) => t[0]); };
  const par = (n) => (n < 0 ? '(' + n + ')' : String(n));
  const sumProd = (b, c, p, q) => '\\text{product } {' + c + '},\\ \\text{sum } {' + b + '}:\\quad {' + p + '} \\text{ and } {' + q + '}';
  const LET = ['x', 'x', 'a', 'y', 'm', 'n', 'k'];
  /* an outer factor in front of a bracket: 5x, −2, and a lone bracket's +( ) or −( ) */
  const OF = (t, first) => (VS(t[1]) || Math.abs(t[0]) !== 1 ? TM(t[0], t[1], first) : (t[0] < 0 ? '-' : first ? '' : '+'));
  function bin(r, v) { // αv + β (or β − αv) with nothing common
    for (;;) {
      const al = r.pick([1, 1, 1, 2, 3, 4, 5]), be = r.int(1, 9);
      if (gcd(al, be) !== 1) continue;
      return r.chance(0.25) ? [[be, {}], [-al, V(v)]] : [[al, V(v)], [be * r.sign(), {}]];
    }
  }
  const two = (o1, Bn, o2, Bn2) => OF(o1, true) + B(Bn) + OF(o2) + B(Bn2 || Bn);
  standup('u4l2', {
    intro: 'Factor out the common bracket, then check the leftover bracket: can anything else come out?',
    levels: {
      BEG: (r) => { // 5x(x + 8) − 2(x + 8) = (x + 8)(5x − 2)
        const v = r.pick(LET), Bn = bin(r, v);
        let c1, c2; do { c1 = r.int(2, 9); c2 = r.int(2, 9) * r.sign(); } while (gcd(c1, c2) !== 1);
        const [o1, o2] = r.chance(0.3) ? [[Math.abs(c2), {}], [c1 * r.sign(), V(v)]] : [[c1, V(v)], [c2, {}]];
        const Q = two(o1, Bn, o2);
        return { q: Q, a: ['\\text{common factor } ' + B(Bn), Q + '=' + B(Bn) + B([o1, o2])] };
      },
      PRG: (r) => {
        const v = r.pick(LET), Bn = bin(r, v), kind = r.int(0, 2);
        if (kind === 0) { // a lone bracket is 1·( )
          const c1 = r.int(2, 9), s = r.sign(), o1 = [c1, V(v)], o2 = [s, {}], Q = two(o1, Bn, o2);
          return { q: Q, a: ['\\text{the lone bracket is } ' + (s < 0 ? '-' : '+') + '1\\cdot' + B(Bn), Q + '=' + B(Bn) + B([o1, o2])] };
        }
        if (kind === 1) { // 5a(a − 4) − 15(a − 4) = (a − 4)(5a − 15) = 5(a − 4)(a − 3)
          const k = r.int(2, 6); let c1, c2; do { c1 = r.int(1, 4); c2 = r.int(1, 7) * r.sign(); } while (gcd(c1, c2) !== 1);
          const o1 = [k * c1, V(v)], o2 = [k * c2, {}], Q = two(o1, Bn, o2);
          return { q: Q, a: [Q + '=' + B(Bn) + B([o1, o2]), '\\text{the leftover bracket has a common factor } ' + k, Q + '=' + k + B(Bn) + B([[c1, V(v)], [c2, {}]])] };
        }
        // (4y + 3)(6y + 1) + (4y + 3)(2y) = (4y + 3)(8y + 1)
        for (;;) {
          const m = r.int(1, 7), n = r.int(1, 9) * r.sign(), d = r.int(1, 6), s = r.sign(), e = m + s * d;
          if (e <= 0 || gcd(e, n) !== 1 || gcd(m, n) !== 1) continue;
          const C = [[m, V(v)], [n, {}]];
          if (P(C) === P(Bn)) continue;
          const Q = B(Bn) + B(C) + (s < 0 ? '-' : '+') + B(Bn) + '(' + TM(d, V(v), true) + ')';
          return { q: Q, a: [Q + '=' + B(Bn) + '\\big[' + B(C) + (s < 0 ? '-' : '+') + TM(d, V(v), true) + '\\big]', Q + '=' + B(Bn) + B([[e, V(v)], [n, {}]])] };
        }
      },
      MAS: (r) => { // opposite brackets: 3x(x − 7) + 7(7 − x) = (x − 7)(3x − 7), sometimes with a common factor left over
        const v = r.pick(LET); let al, be; do { al = r.pick([1, 1, 2, 3, 4, 5]); be = r.int(1, 9); } while (gcd(al, be) !== 1);
        const Bn = [[al, V(v)], [-be, {}]], Op = [[be, {}], [-al, V(v)]];
        const k = r.chance(0.4) ? r.int(2, 5) : 1, s = r.sign();
        let c1, c2; do { c1 = r.int(1, 7); c2 = r.int(1, 9); } while (gcd(c1, c2) !== 1);
        const oV = [k * c1, V(v)], oC = [s * k * c2, {}], flip = [-s * k * c2, {}];
        const Q = r.chance(0.35) ? OF(oC, true) + B(Op) + OF(oV) + B(Bn) : OF(oV, true) + B(Bn) + OF(oC) + B(Op);
        const a = [OF(oC, true) + B(Op) + '=' + OF(flip, true) + B(Bn) + '\\quad\\text{(flip the bracket)}', Q + '=' + B(Bn) + B([oV, flip])];
        if (k > 1) a.push('=' + k + B(Bn) + B([[c1, V(v)], [-s * c2, {}]]));
        return { q: Q, a };
      }
    }
  });
}
