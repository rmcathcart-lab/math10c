/* Math 10C · Unit 1 · Lesson 8 — Entire and Mixed Radicals: Index 3 and Higher. The explainers and widgets on this page.
 *
 * Most explainers share one picture, the "radical board": a big radical sign with an outside zone (the coefficient)
 * and an inside zone (the radicand), filled with factor chips. Chips are sorted into groups the size of the index,
 * full groups come out as one chip, coefficients go back in as n copies. Every move is animated with FLIP (chips that
 * stay slide to their new place) and ghosts (chips that merge or split fly to their new chip).
 */
import { h, fmt, Explainer, primeFactors, decimal } from '../explain.js';
import { tex } from '../tex.js';
import { standup } from '../standup.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const SVGNS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen'];
const word = (k) => WORDS[k] || String(k);
const POWER = { 2: 'square', 3: 'cube', 4: 'fourth power', 5: 'fifth power', 6: 'sixth power' };
const GREEN = '#12805a', INK = '#1c2230';

/* ---------------- LaTeX helpers ---------------- */
const tn = (n) => { const s = String(Math.abs(n)), g = s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : s; return (n < 0 ? '-' : '') + g; };
const rt = (n, inner) => (n === 2 ? `\\sqrt{${inner}}` : `\\sqrt[${n}]{${inner}}`);
const pw = (b, e) => (e === 1 ? String(b) : `${b}^{${e}}`);
const varsTex = (vars) => vars.filter(([, e]) => e > 0).map(([s, e]) => pw(s, e)).join('');
const green = (t) => `\\color{${GREEN}}{${t}}`;
function termTex(c, vars = []) { const v = varsTex(vars); if (!v) return tn(c); if (c === 1) return v; if (c === -1) return '-' + v; return tn(c) + v; }

/* fractions, for coefficients like 3/4 */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const Q = (p, q = 1) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q); return { p: p / g, q: q / g }; };
const qmul = (a, b) => Q(a.p * b.p, a.q * b.q);
const qpow = (a, n) => Q(a.p ** n, a.q ** n);
const qTex = (a, st = 't') => (a.q === 1 ? tn(a.p) : `${a.p < 0 ? '-' : ''}\\${st}frac{${tn(Math.abs(a.p))}}{${tn(a.q)}}`);
const qTerm = (a, vars, st = 't') => { const v = varsTex(vars); if (!v) return qTex(a, st); if (a.p === a.q) return v; if (a.p === -a.q) return '-' + v; return qTex(a, st) + v; };
const nroot = (v, n) => (v < 0 ? -Math.pow(-v, 1 / n) : Math.pow(v, 1 / n));
const dec4 = (v) => (Math.round(v * 10000) / 10000).toFixed(4).replace('-', '−');

/* ---------------- chips ---------------- */
const PRIME_C = { 2: '#3b78d8', 3: '#e0841a', 5: '#8a58c9', 7: '#d0477a', 11: '#13807a', 13: '#6b7a2a' };
const VAR_C = { x: '#12805a', a: '#12805a', b: '#12805a', t: '#12805a', p: '#12805a', y: '#b0306a', q: '#b0306a', z: '#0e7490', r: '#0e7490' };
const numAtom = (p) => ({ k: 'n' + p, v: p, html: String(p), color: PRIME_C[p] || '#5a6372' });
const varAtom = (s) => ({ k: 'v' + s, s, html: tex(s), color: VAR_C[s] || '#12805a' });
const MINUS = { k: 'neg', html: '−', color: '#c93a33' };
const plainOrTex = (t) => (/^-?\d+$/.test(t) ? t.replace('-', '−') : tex(t));
const bigAtom = (t, color = INK) => ({ k: 'big', html: plainOrTex(t), color });

/* ================= the radical board ================= */
class RadBoard {
  constructor(stage, W, o = {}) {
    this.stage = stage; this.W = W;
    const g = this.g = Object.assign({ top: 74, fh: 214, hx: 330, cs: 52, maxNotes: 4 }, o);
    stage.classList.add('rb-stage'); stage.style.setProperty('--cs', g.cs + 'px');
    this.top = add(stage, h('div', 'rb-top'), 24, 12);
    this.out = add(stage, h('div', 'rz rz-out'), 16, g.top);
    this.out.style.width = Math.max(0, g.hx - 32) + 'px'; this.out.style.height = g.fh + 'px';
    if (g.hx < 80) this.out.style.display = 'none';
    const fh = g.fh;
    this.hook = add(stage, svgEl('svg', { class: 'rb-hook', width: 80, height: fh, viewBox: `0 0 80 ${fh}` }), g.hx, g.top);
    this.hook.appendChild(svgEl('path', { d: `M4 ${fh * 0.6} L20 ${fh * 0.52} L44 ${fh - 5} L78 3` }));
    this.vinc = add(stage, h('div', 'rb-vinc'), g.hx + 76, g.top + 1);
    this.idx = add(stage, h('div', 'rb-idx'), g.hx + 18, g.top + fh * 0.5 - 6);
    const inX = g.hx + 90, inW = (g.inRight != null ? g.inRight : W - 22) - inX;
    this.inn = add(stage, h('div', 'rz rz-in'), inX, g.top + 14); this.inn.style.width = inW + 'px'; this.inn.style.height = (fh - 22) + 'px';
    const nb = g.notes || { x: 24, y: g.top + fh + 16, w: W - 48 };
    this.notes = add(stage, h('div', 'rb-notes'), nb.x, nb.y); this.notes.style.width = nb.w + 'px';
  }
  setIdx(n, show = n !== 2) { this.idx.innerHTML = n; this.idx.style.opacity = show ? 1 : 0; this.idx.classList.toggle('faint', n === 2); }
  frame() { const b = this.stage.getBoundingClientRect(); this._k = b.width / (this.stage.offsetWidth || 1) || 1; this._b = { left: b.left + this.stage.clientLeft * this._k, top: b.top + this.stage.clientTop * this._k }; }
  rel(el) { const r = el.getBoundingClientRect(), k = this._k; return { x: (r.left - this._b.left) / k, y: (r.top - this._b.top) / k, w: r.width / k, h: r.height / k }; }
  chip(a, cls = '') { const e = h('div', 'rc' + (cls ? ' ' + cls : ''), a.html); e.style.setProperty('--kc', a.color || INK); e._a = a; return e; }
  tray(els, full, color) { const t = h('div', 'rtray' + (full ? ' full' : '')); if (color) t.style.setProperty('--kc', color); els.forEach((e) => t.appendChild(e)); return t; }
  items() { return [...this.stage.querySelectorAll('.rz .rc, .rz .rtray')]; }
  ghost(e, r) {
    const g = e.classList.contains('rtray') ? e.cloneNode(false) : e.cloneNode(true);
    g.classList.add('rghost'); g.style.left = r.x + 'px'; g.style.top = r.y + 'px'; g.style.width = r.w + 'px'; g.style.height = r.h + 'px'; g.style.opacity = 1; g.style.transform = 'none';
    this.stage.appendChild(g); return g;
  }
  vincWidth() {
    const kids = [...this.inn.children]; if (!kids.length) return 0;
    let right = 0; kids.forEach((k) => { const r = this.rel(k); right = Math.max(right, r.x + r.w); });
    return Math.max(48, right - (this.g.hx + 76) + 18);
  }
  syncVinc() { this.frame(); const w = this.vincWidth(); this.vinc.style.width = w + 'px'; }
  /* Run a DOM change and animate it. mutate() rearranges chips/trays and may return [[fromEl, toEl], …]:
   * a ghost of fromEl flies to toEl (merges, splits, copies). Kept elements slide; removed ones fade; new ones pop. */
  async morph(c, mutate, o = {}) {
    const ms = o.ms || 650;
    if (c.fast) { mutate(); this.syncVinc(); return; }
    this.frame();
    const before = new Map(); this.items().forEach((e) => before.set(e, this.rel(e)));
    const fly = mutate() || [];
    const after = this.items(), afterSet = new Set(after), ar = new Map();
    after.forEach((e) => ar.set(e, this.rel(e)));
    const vw = this.vincWidth(), vw0 = parseFloat(this.vinc.style.width) || 0;
    const flyTo = new Map(); fly.forEach(([f, t]) => { if (!flyTo.has(f)) flyTo.set(f, []); flyTo.get(f).push(t); });
    const arrive = new Map(), jobs = [];
    const d = new Map();
    after.forEach((e) => { if (before.has(e)) { const a = before.get(e), b = ar.get(e); d.set(e, [a.x - b.x, a.y - b.y]); } });
    d.forEach(([dx, dy], e) => {
      const p = d.get(e.parentElement), x = dx - (p ? p[0] : 0), y = dy - (p ? p[1] : 0);
      if (Math.abs(x) + Math.abs(y) > 0.5) jobs.push(c.anim(e, [{ transform: `translate(${x}px, ${y}px)` }, { transform: 'none' }], ms));
    });
    let fi = 0;
    flyTo.forEach((ts, f) => {
      const r = before.get(f); if (!r) return;
      ts.forEach((t) => {
        const tr = ar.get(t); if (!tr) return;
        const g = this.ghost(f, r), delay = (fi++ % 14) * (o.flyStagger != null ? o.flyStagger : 35);
        const sc = Math.min(1.3, Math.max(0.5, tr.h / (r.h || 1)));
        const dx = tr.x + tr.w / 2 - (r.x + r.w / 2), dy = tr.y + tr.h / 2 - (r.y + r.h / 2);
        arrive.set(t, Math.max(arrive.get(t) || 0, delay + ms));
        jobs.push(c.anim(g, [{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(${sc})`, opacity: 0.85 }], ms, { delay }).then(() => g.remove()));
      });
    });
    before.forEach((r, e) => {
      if (afterSet.has(e) || flyTo.has(e)) return;
      const g = this.ghost(e, r);
      jobs.push(c.anim(g, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.55)' }], 380).then(() => g.remove()));
    });
    let pi = 0;
    after.forEach((e) => {
      if (before.has(e)) return;
      if (arrive.has(e)) jobs.push(c.anim(e, [{ opacity: 0 }, { opacity: 1 }], 200, { delay: arrive.get(e) - 130 }));
      else if (e.classList.contains('rtray')) jobs.push(c.anim(e, [{ opacity: 0 }, { opacity: 1 }], 420, { delay: 120 }));
      else jobs.push(c.pop(e, 420, { delay: (o.popDelay || 0) + (pi++) * (o.stagger || 0) }));
    });
    if (Math.abs(vw - vw0) > 1) jobs.push(c.anim(this.vinc, [{ width: vw0 + 'px' }, { width: vw + 'px' }], ms));
    await Promise.all(jobs);
  }
  async note(c, latex, cls = '', replaceLast = false) { return this.noteHTML(c, tex(latex), cls, replaceLast); }
  async noteHTML(c, html, cls = '', replaceLast = false) {
    if (replaceLast && this.notes.lastChild) this.notes.lastChild.remove();
    const e = h('div', 'rb-note' + (cls ? ' ' + cls : ''), html); this.notes.appendChild(e);
    while (this.notes.children.length > this.g.maxNotes) this.notes.firstChild.remove();
    return c.fadeIn(e, 380, { from: 'translateX(-12px)' });
  }
  async setTop(c, latex) { this.top.innerHTML = tex(latex); return c.fadeIn(this.top, 350); }
  async hideRadical(c) { return Promise.all([this.hook, this.vinc, this.idx].map((e) => c.anim(e, [{ opacity: getComputedStyle(e).opacity }, { opacity: 0 }], 450))); }
  async pulse(c, el) { return c.anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], 520); }
}

/* ================= entire → mixed (simplify) ================= */
function analyse({ n, c = 1, vars = [] }) {
  const neg = c < 0, A = Math.abs(c), keys = [], cnt = {}, atom = {};
  (A > 1 ? primeFactors(A) : []).forEach((p) => { const a = numAtom(p); if (!(a.k in cnt)) { keys.push(a.k); cnt[a.k] = 0; atom[a.k] = a; } cnt[a.k]++; });
  vars.forEach(([s, e]) => { const a = varAtom(s); keys.push(a.k); cnt[a.k] = e; atom[a.k] = a; });
  let outC = 1, inC = 1; const outV = [], inV = [];
  keys.forEach((k) => {
    const a = atom[k], q = Math.floor(cnt[k] / n), r = cnt[k] % n;
    if (a.v) { outC *= a.v ** q; inC *= a.v ** r; } else { outV.push([a.s, q]); inV.push([a.s, r]); }
  });
  const sg = neg ? -1 : 1, total = keys.reduce((s, k) => s + cnt[k], 0), groups = keys.reduce((s, k) => s + Math.floor(cnt[k] / n), 0);
  let coefT = termTex(sg * outC, outV); if (coefT === '1') coefT = ''; if (coefT === '-1') coefT = '-';
  const hasIn = inC > 1 || inV.some(([, e]) => e > 0), inT = termTex(inC, inV), posT = termTex(A, vars);
  const result = hasIn ? coefT + rt(n, inT) : termTex(sg * outC, outV);
  const op = vars.length ? '\\cdot ' : '\\times ';
  const aT = (k) => (atom[k].v ? String(atom[k].v) : atom[k].s);
  return { n, c, vars, neg, sg, A, keys, cnt, atom, outC, inC, outV, inV, coefT, hasIn, inT, posT, result, orig: rt(n, termTex(c, vars)), total, groups, op, aT };
}
function factorLine(S) {
  if (S.total <= 16) return `${S.posT} = ${S.keys.flatMap((k) => Array(S.cnt[k]).fill(S.aT(k))).join(S.op)}`;
  return `${S.posT} = ${S.keys.map((k) => pw(S.aT(k), S.cnt[k])).join(S.op)}`;
}
function groupLine(S) {
  const full = [], left = [];
  S.keys.forEach((k) => { const q = Math.floor(S.cnt[k] / S.n), r = S.cnt[k] % S.n; for (let i = 0; i < q; i++) full.push(pw(S.aT(k), S.n)); if (r) left.push(pw(S.aT(k), r)); });
  return `${S.posT} = ${full.concat(left).join(S.op)}`;
}
const outList = (S) => S.keys.flatMap((k) => Array(Math.floor(S.cnt[k] / S.n)).fill(S.aT(k)));
const inList = (S) => S.keys.flatMap((k) => Array(S.cnt[k] % S.n).fill(S.aT(k)));
function checkLine(S) {
  const n = S.n, K = S.sg * S.outC, base = !S.outV.some(([, e]) => e) && K > 0 ? pw(tn(K), n) : `\\left(${S.coefT === '-' ? '-1' : S.coefT}\\right)^{${n}}`;
  const kn = termTex(K ** n, S.outV.map(([s, e]) => [s, e * n]));
  const tail = S.hasIn ? S.op + S.inT : '';
  return `${base}${tail} = ${kn}${tail} = ${termTex(S.c, S.vars)}\\ \\checkmark`;
}

function simplifyMake(stage, spec, ex) {
  const S = analyse(spec), n = S.n;
  const B = new RadBoard(stage, ex.W, { cs: S.total > 16 ? 38 : S.total > 9 ? 44 : 50, fh: S.total > 16 ? 200 : S.total > 9 ? 186 : 170 });
  B.setIdx(n); B.top.innerHTML = tex(S.orig);
  let start = B.chip(bigAtom(termTex(S.c, S.vars)), 'big');
  B.inn.appendChild(start); B.syncVinc();
  let atomEls = [], trays = [];
  const steps = [];
  const fullDesc = () => {
    const parts = S.keys.filter((k) => S.cnt[k] >= n).map((k) => {
      const q = Math.floor(S.cnt[k] / n), g = n <= 3 ? Array(n).fill(S.aT(k)).join('\\cdot ') : pw(S.aT(k), n);
      return (q > 1 ? `${word(q)} groups of ` : '') + tex(g);
    });
    return parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts[0];
  };
  const leftL = inList(S);
  const leftDesc = leftL.length ? `${tex(leftL.join(S.op))} ${leftL.length > 1 ? 'are' : 'is'} left over` : 'nothing is left over';
  if (S.neg) steps.push({
    cap: `The index is <b>odd</b>, so the <b>negative sign can come out</b> in front: ${tex(S.orig + '=-' + rt(n, S.posT))}. An odd root of a negative number is negative.`,
    run: async (c) => {
      await B.morph(c, () => { const old = start; old.remove(); const ni = B.chip(bigAtom(S.posT), 'big'), m = B.chip(MINUS, 'minus'); B.inn.appendChild(ni); B.out.appendChild(m); start = ni; return [[old, ni], [old, m]]; });
      await B.note(c, `${S.orig} = -${rt(n, S.posT)}`);
    }
  });
  const oneVar = S.A === 1 && S.vars.length === 1;
  steps.push({
    cap: oneVar ? `${tex(pw(S.vars[0][0], S.vars[0][1]))} means <b>${word(S.vars[0][1])} ${tex(S.vars[0][0])}’s</b> multiplied together.`
      : !S.vars.length ? (S.total === 1 ? `<b>${fmt(S.A)}</b> is prime: it is its own only prime factor.` : `Break <b>${fmt(S.A)}</b> into <b>prime factors</b>: ${tex(factorLine(S))}.`)
        : `Break the number into <b>prime factors</b> and write each variable out as <b>single factors</b>.`,
    run: async (c) => {
      await B.morph(c, () => {
        const old = start; old.remove();
        atomEls = S.keys.flatMap((k) => Array.from({ length: S.cnt[k] }, () => B.chip(S.atom[k])));
        atomEls.forEach((e) => B.inn.appendChild(e));
        return atomEls.map((e) => [old, e]);
      }, { flyStagger: 22 });
      await B.note(c, factorLine(S));
    }
  });
  steps.push({
    cap: S.groups
      ? (oneVar ? `Index <b>${n}</b>, so make <b>groups of ${word(n)}</b>. ${S.vars[0][1]} ÷ ${n} = <b>${Math.floor(S.vars[0][1] / n)}</b> R <b>${S.vars[0][1] % n}</b>: ${word(Math.floor(S.vars[0][1] / n))} full group${Math.floor(S.vars[0][1] / n) > 1 ? 's' : ''}, and ${leftDesc}.`
        : `Index <b>${n}</b>, so sort the factors into <b>groups of ${word(n)}</b> identical factors: ${fullDesc()}. Then ${leftDesc}.`)
      : `Index <b>${n}</b> needs <b>groups of ${word(n)}</b> identical factors, and there aren’t any. Nothing can come out: ${tex(S.orig)} is already in <b>simplest form</b>.`,
    run: async (c) => {
      await B.morph(c, () => {
        const by = {}; atomEls.forEach((e) => (by[e._a.k] = by[e._a.k] || []).push(e));
        trays = []; const left = [];
        S.keys.forEach((k) => { const els = by[k], q = Math.floor(els.length / n); for (let i = 0; i < q; i++) trays.push(B.tray(els.slice(i * n, i * n + n), true, S.atom[k].color)); left.push(...els.slice(q * n)); });
        B.inn.replaceChildren(...trays, ...left);
      });
      if (S.groups) await B.note(c, groupLine(S), '', true);
      else { await B.note(c, `${S.orig}\\ \\text{is in simplest form}`, 'final'); }
    }
  });
  if (!S.groups) return steps;
  const outF = outList(S), ex0 = S.keys.find((k) => S.cnt[k] >= n);
  steps.push({
    cap: `Each full group of ${word(n)} comes out as <b>one</b> factor: ${tex(rt(n, n <= 3 ? Array(n).fill(S.aT(ex0)).join('\\cdot ') : pw(S.aT(ex0), n)) + '=' + S.aT(ex0))}. ${leftL.length ? 'Leftovers <b>stay inside</b>.' : ''}`,
    run: async (c) => {
      await B.morph(c, () => {
        const fly = [];
        trays.forEach((t) => { const kids = [...t.children], oc = B.chip(kids[0]._a); B.out.appendChild(oc); kids.forEach((k) => fly.push([k, oc])); t.remove(); });
        return fly;
      }, { flyStagger: 0 });
      await B.note(c, `${S.neg ? '-' : ''}${rt(n, S.posT)} = ${S.neg ? '-' : ''}${outF.join('\\cdot ')}${S.hasIn ? '\\cdot ' + rt(n, S.inT) : ''}`);
    }
  });
  const outProd = (S.neg ? '-' : '') + (outF.length > 1 ? outF.join(S.op) + '=' + S.coefT.replace(/^-/, '') : outF[0]);
  const inProd = leftL.length > 1 ? leftL.join(S.op) + '=' + S.inT : S.inT;
  steps.push({
    cap: `Multiply what came out: <b>${tex(S.neg ? outProd.replace(/^-/, '') : outProd)}</b>${S.neg ? ', with the − in front' : ''}. ${S.hasIn ? `Multiply what’s left inside: <b>${tex(inProd)}</b>.` : 'Nothing is left inside, so the radical is gone.'} So ${tex(S.orig + '=' + S.result)}.`,
    run: async (c) => {
      await B.morph(c, () => {
        const fly = [], outs = [...B.out.children], coef = B.chip(bigAtom(S.hasIn ? S.coefT : S.result), 'big coef');
        outs.forEach((e) => { e.remove(); fly.push([e, coef]); }); B.out.appendChild(coef);
        if (S.hasIn) { const ins = [...B.inn.children], r = B.chip(bigAtom(S.inT), 'big'); ins.forEach((e) => { e.remove(); fly.push([e, r]); }); B.inn.appendChild(r); }
        return fly;
      });
      const jobs = [B.setTop(c, S.orig + '=' + green(S.result)), B.note(c, `${S.orig} = ${S.result}`, 'final', true)];
      if (!S.hasIn) jobs.push(B.hideRadical(c));
      await Promise.all(jobs);
    }
  });
  steps.push({
    cap: `<b>Check:</b> put ${tex(S.coefT === '-' ? '-1' : S.coefT || '1')} back in as its <b>${POWER[n] || n + 'th power'}</b>. It should rebuild ${tex(termTex(S.c, S.vars))}. ✓`,
    run: async (c) => { await Promise.all([B.note(c, checkLine(S), 'check'), B.pulse(c, B.out.lastChild)]); }
  });
  return steps;
}

/* ================= mixed → entire ================= */
function analyseRev({ n, k, r }) {
  const neg = k.c.p < 0, evenNeg = neg && n % 2 === 0, kc = evenNeg ? Q(-k.c.p, k.c.q) : k.c, kv = k.vars || [], rv = r.vars || [];
  const kn = qpow(kc, n), knV = kv.map(([s, e]) => [s, e * n]);
  const fin = qmul(kn, r.c), finV = {};
  [...knV, ...rv].forEach(([s, e]) => (finV[s] = (finV[s] || 0) + e));
  const finVars = Object.keys(finV).sort().map((s) => [s, finV[s]]);
  const coefT = qTerm(k.c, kv), coefD = qTerm(k.c, kv, 'd'), inT = qTerm(r.c, rv), inD = qTerm(r.c, rv, 'd');
  const finT = qTerm(fin, finVars), finD = qTerm(fin, finVars, 'd');
  const kcT = qTerm(kc, kv), knT = qTerm(kn, knV);
  const base = !kv.length && kc.q === 1 && kc.p > 0 ? pw(tn(kc.p), n) : `\\left(${kcT}\\right)^{${n}}`;
  const op = kv.length || rv.length ? '\\cdot ' : '\\times ';
  return { n, k, r, kv, rv, neg, evenNeg, kc, kn, knV, fin, finVars, coefT, inT, finT, kcT, knT, base, op,
    orig: coefD + rt(n, inD), result: (evenNeg ? '-' : '') + rt(n, finD) };
}
function toEntireMake(stage, spec, ex) {
  const R = analyseRev(spec), n = R.n, numeric = !R.kv.length;
  const B = new RadBoard(stage, ex.W, { cs: 50, fh: R.kv.length ? 186 : 170 });
  B.setIdx(n); B.top.innerHTML = tex(R.orig);
  // outside: the coefficient. A number is one chip; a coefficient with variables is one chip per factor (b³ → b, b, b).
  let coefEls = [];
  if (numeric) coefEls = [B.chip(bigAtom(qTex(R.k.c)), 'num')];
  else {
    if (R.k.c.p !== R.k.c.q) coefEls.push(B.chip({ k: 'kc', html: plainOrTex(qTex(R.k.c)), color: '#5a6372' }));
    R.kv.forEach(([s, e]) => { for (let i = 0; i < e; i++) coefEls.push(B.chip(varAtom(s))); });
  }
  coefEls.forEach((e) => B.out.appendChild(e));
  const inEls = [];
  if (R.r.c.p !== R.r.c.q || !R.rv.length) inEls.push(B.chip({ k: 'rc', html: plainOrTex(qTex(R.r.c)), color: '#5a6372' }));
  R.rv.forEach(([s, e]) => inEls.push(B.chip({ k: 'r' + s, html: tex(pw(s, e)), color: VAR_C[s] })));
  inEls.forEach((e) => B.inn.appendChild(e)); B.syncVinc();
  const steps = [];
  let goers = coefEls, copies = [];
  if (R.evenNeg) steps.push({
    cap: `The index is <b>even</b>. ${tex(`(${tn(R.k.c.p)})^{${n}}=${tn(R.k.c.p ** n)}`)} is positive, so a negative can’t be made inside. The <b>− stays outside</b>; only ${tex(R.kcT)} goes in.`,
    run: async (c) => {
      await B.morph(c, () => { const old = coefEls[0]; old.remove(); const m = B.chip(MINUS, 'minus'), k2 = B.chip(bigAtom(R.kcT), 'num'); B.out.append(m, k2); goers = [k2]; return [[old, m], [old, k2]]; });
      await B.note(c, `${R.orig} = -\\left(${R.kcT}${rt(n, R.inT)}\\right)`);
    }
  });
  steps.push({
    cap: (R.neg && !R.evenNeg ? `The index is <b>odd</b>, so the − can go inside too. ` : '')
      + `Write the coefficient as a ${n === 2 ? 'square root' : n === 3 ? 'cube root' : 'root with index ' + n}: it goes in <b>${word(n)} times</b>, ${n >= 4 ? '<span style="font-size:.78em">' : '<span>'}${tex(R.kcT + '=' + rt(n, numeric ? Array(n).fill(R.kc.q === 1 && R.kc.p > 0 ? R.kcT : '\\left(' + R.kcT + '\\right)').join('\\cdot ') : R.base))}</span>.`, // smaller for index 4+, so the radical fits the sidebar
    run: async (c) => {
      await B.morph(c, () => {
        const fly = [];
        const ts = numeric ? [B.tray(Array.from({ length: n }, () => B.chip(goers[0]._a, 'num')), true, '#5a6372')]
          : Array.from({ length: n }, () => B.tray(goers.map((g) => B.chip(g._a)), true, '#5a6372'));
        copies = ts;
        if (numeric) [...ts[0].children].forEach((ch) => fly.push([goers[0], ch]));
        else ts.forEach((t) => [...t.children].forEach((ch, j) => fly.push([goers[j], ch])));
        goers.forEach((g) => g.remove());
        B.inn.prepend(...ts);
        return fly;
      }, { flyStagger: 60 });
      await B.note(c, R.evenNeg ? `${R.orig} = -\\left(${rt(n, R.base)}${R.op}${rt(n, R.inT)}\\right)` : `${R.orig} = ${rt(n, R.base)}${R.op}${rt(n, R.inT)}`);
    }
  });
  if (numeric) steps.push({
    cap: `Multiply the copies: ${tex(R.base + '=' + qTex(R.kn))}.${R.neg && !R.evenNeg ? ' An odd power of a negative is <b>negative</b>.' : ''}`,
    run: async (c) => {
      await B.morph(c, () => { const t = copies[0], kids = [...t.children], p = B.chip(bigAtom(qTex(R.kn)), 'num'); t.replaceWith(p); return kids.map((k) => [k, p]); });
      await B.note(c, `= ${R.evenNeg ? '-' : ''}${rt(n, qTex(R.kn) + R.op + R.inT)}`);
    }
  });
  else steps.push({
    cap: `Raise the coefficient to the power ${n}: ${tex(R.base + '=' + R.knT)}. Like factors group together: ${R.k.c.p !== R.k.c.q ? `${tex(Array(n).fill(qTex(R.kc)).join('\\cdot ') + '=' + qTex(R.kn))}, ` : ''}${R.kv.map(([s, e]) => tex(`${pw(s, e)}\\text{ ${word(n)} times}=${pw(s, e * n)}`)).join(', ')}.`,
    run: async (c) => {
      let groups = [];
      await B.morph(c, () => {
        const all = copies.flatMap((t) => [...t.children]), by = {}, order = [];
        all.forEach((e) => { const kk = e._a.k; if (!by[kk]) { by[kk] = []; order.push(kk); } by[kk].push(e); });
        groups = order.map((kk) => B.tray(by[kk], true, by[kk][0]._a.color));
        copies.forEach((t) => t.remove()); B.inn.prepend(...groups);
      });
      await c.sleep(250);
      await B.morph(c, () => {
        const fly = [];
        groups.forEach((t) => {
          const kids = [...t.children], a = kids[0]._a;
          const v = a.v != null ? null : a.s;
          const html = v ? tex(pw(v, kids.length)) : plainOrTex(qTex(R.kn));
          const p = B.chip({ k: a.k, html, color: a.color }); t.replaceWith(p); kids.forEach((k) => fly.push([k, p]));
        });
        return fly;
      });
      await B.note(c, `= ${rt(n, R.knT + R.op + R.inT)}`);
    }
  });
  steps.push({
    cap: `Multiply everything under <b>one root</b>${R.knV.some(([s]) => R.rv.some(([t]) => t === s)) ? ' (add the exponents of matching variables)' : ''}: ${tex(R.knT + R.op + R.inT + '=' + R.finT)}. So ${tex(R.orig + '=' + R.result)}.`,
    run: async (c) => {
      await B.morph(c, () => { const kids = [...B.inn.children], f = B.chip(bigAtom(R.finT), 'big'); kids.forEach((k) => k.remove()); B.inn.appendChild(f); return kids.map((k) => [k, f]); });
      await Promise.all([B.setTop(c, R.orig + '=' + green(R.result)), B.note(c, `${R.orig} = ${R.result}`, 'final', true)]);
    }
  });
  if (numeric && !R.rv.length) {
    const v1 = (R.k.c.p / R.k.c.q) * nroot(R.r.c.p / R.r.c.q, n), v2 = (R.evenNeg ? -1 : 1) * nroot(R.fin.p / R.fin.q, n);
    steps.push({
      cap: `<b>Check on the calculator:</b> ${tex(R.orig)} ≈ <b>${dec4(v1)}</b> and ${tex(R.result)} ≈ <b>${dec4(v2)}</b>. Same number ✓`,
      run: async (c) => { await B.noteHTML(c, `<span class="muted">Check:</span> ${tex(R.orig)} ≈ ${dec4(v1)}, &nbsp; ${tex(R.result)} ≈ ${dec4(v2)} ✓`, 'check'); }
    });
  }
  return steps;
}

/* ================= 1. What a mixed radical means: little cubes ================= */
function cubeFaces(g, x, y, s, pal) { // front-bottom-left corner at (x, y), edge s, oblique depth like the booklet
  const dx = s * 0.5, dy = s * 0.32;
  g.appendChild(svgEl('polygon', { points: `${x},${y - s} ${x + dx},${y - s - dy} ${x + s + dx},${y - s - dy} ${x + s},${y - s}`, fill: pal.top, stroke: pal.edge }));
  g.appendChild(svgEl('polygon', { points: `${x + s},${y} ${x + s + dx},${y - dy} ${x + s + dx},${y - s - dy} ${x + s},${y - s}`, fill: pal.side, stroke: pal.edge }));
  g.appendChild(svgEl('rect', { x, y: y - s, width: s, height: s, fill: pal.front, stroke: pal.edge }));
}
const SUGAR = { front: '#fafaf4', top: '#ffecb3', side: '#f2d68c', edge: '#c88c14' };
const BLUE = { front: '#eaf2fd', top: '#cfe0f7', side: '#a9c4ea', edge: '#3b78d8' };
function stackSVG(k, s, pal = SUGAR) { // a k×k×k stack, as an <svg> element
  const dx = s * 0.5, dy = s * 0.32, W = k * (s + dx) + 4, H = k * (s + dy) + 4;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'stack-svg' });
  for (let j = k - 1; j >= 0; j--) for (let z = 0; z < k; z++) for (let i = 0; i < k; i++) { const g = svgEl('g'); cubeFaces(g, 2 + i * s + j * dx, H - 2 - z * s - j * dy, s, pal); svg.appendChild(g); }
  return svg;
}

const CM = { m54: [3, 2], m16: [2, 2], m24: [2, 3], m81: [3, 3], m250: [5, 2] };
const cubeMeaning = {
  title: 'What does a mixed radical mean? Build it from little cubes',
  height: 440,
  choices: [{ v: 'm54', label: tex('\\sqrt[3]{54}') }, { v: 'm16', label: tex('\\sqrt[3]{16}') }, { v: 'm24', label: tex('\\sqrt[3]{24}') }, { v: 'm81', label: tex('\\sqrt[3]{81}') }, { v: 'm250', label: tex('\\sqrt[3]{250}') }],
  intro: (v) => { const [k, r] = CM[v]; return `Melt <b>${k ** 3 * r}</b> sugar cubes into one solid cube. How long is its edge? Let’s build it from little cubes that each hold <b>${r}</b>.`; },
  make(stage, v, ex) {
    const [k, r] = CM[v], N = k ** 3 * r, W = ex.W, H = 440;
    const s = Math.min(62, 340 / (1.5 * k), 300 / (1.32 * k)), dx = s * 0.5, dy = s * 0.32;
    const midL = 250, midR = W - 330, bw = k * (s + dx), bh = k * (s + dy);
    const ox = midL + (midR - midL - bw) / 2, oy = 40 + bh + (330 - bh) / 2;
    const svg = add(stage, svgEl('svg', { class: 'cm-svg', width: W, height: H, viewBox: `0 0 ${W} ${H}` }), 0, 0);
    // the little cube on the left
    const ls = 70, lx = 70, ly = 200;
    const little = svgEl('g'); cubeFaces(little, lx, ly, ls, BLUE); svg.appendChild(little); little.style.opacity = 0;
    const lt = svgEl('text', { x: lx + ls / 2, y: ly - ls / 2 + 9, class: 'cm-in' }); lt.textContent = r; little.appendChild(lt);
    const lab = add(stage, h('div', 'cm-lab', `little cube<br><b>volume ${r}</b><br>edge ${tex(`\\sqrt[3]{${r}}\\approx${(r ** (1 / 3)).toFixed(2)}`)}`), lx + ls * 0.75, ly + 22); lab.style.translate = '-50% 0'; lab.style.opacity = 0;
    // the big cube, drawn back to front so nearer cubes cover farther ones
    const cubes = [];
    for (let j = k - 1; j >= 0; j--) for (let z = 0; z < k; z++) for (let i = 0; i < k; i++) {
      const g = svgEl('g', { class: 'cm-c' }); cubeFaces(g, ox + i * s + j * dx, oy - z * s - j * dy, s, BLUE); svg.appendChild(g); g.style.opacity = 0; cubes.push({ g, i, j, z });
    }
    // edge brace under the front bottom edge
    const brace = svgEl('g', { class: 'cm-brace' }); brace.style.opacity = 0; svg.appendChild(brace);
    const by = oy + 14;
    brace.appendChild(svgEl('path', { d: `M${ox} ${by} v8 H${ox + k * s} v-8` }));
    for (let i = 1; i < k; i++) brace.appendChild(svgEl('path', { d: `M${ox + i * s} ${by} v8`, class: 'tick' }));
    const edgeLab = add(stage, h('div', 'cm-edge'), ox + k * s / 2, by + 16); edgeLab.style.translate = '-50% 0'; edgeLab.style.opacity = 0;
    const panel = add(stage, h('div', 'cm-panel'), W - 300, 30); panel.style.width = '280px';
    const line = (c, latex, cls = '') => { const e = h('div', 'cm-line ' + cls, tex(latex)); panel.appendChild(e); return c.fadeIn(e, 380); };
    const show = (c, list, gap) => Promise.all(list.map((q, t) => c.anim(q.g, [{ opacity: 0, transform: 'translateY(-26px)' }, { opacity: 1, transform: 'none' }], 420, { delay: t * gap })));
    const row = cubes.filter((q) => q.j === 0 && q.z === 0), layer = cubes.filter((q) => q.z === 0 && q.j > 0), rest = cubes.filter((q) => q.z > 0);
    rest.sort((a, b) => a.z - b.z || b.j - a.j || a.i - b.i);
    const L = k ** 2;
    return [
      { cap: `This little cube has <b>volume ${r}</b> (it holds ${r} sugar cubes’ worth). Its edge is ${tex(`\\sqrt[3]{${r}}\\approx${(r ** (1 / 3)).toFixed(2)}`)}, because ${(r ** (1 / 3)).toFixed(2)} × ${(r ** (1 / 3)).toFixed(2)} × ${(r ** (1 / 3)).toFixed(2)} ≈ ${r}.`,
        run: async (c) => { await Promise.all([c.anim(little, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], 450), c.fadeIn(lab, 400, { delay: 200 }), line(c, `\\text{little cube: }V=${r},\\ e=\\sqrt[3]{${r}}`)]); } },
      { cap: `Line up <b>${k}</b> little cubes in a row.`, run: (c) => show(c, row, 120) },
      { cap: `<b>${k} rows</b> make a layer: ${k} × ${k} = <b>${L}</b> little cubes.`, run: (c) => show(c, layer, 50) },
      { cap: `<b>${k} layers</b> make a big cube: ${k} × ${k} × ${k} = <b>${k ** 3}</b> little cubes. ${k ** 3} is a <b>perfect cube</b>.`,
        run: async (c) => { await show(c, rest, k > 3 ? 12 : 40); await line(c, `${k}\\times${k}\\times${k}=${k ** 3}\\text{ little cubes}`); } },
      { cap: `The big cube’s volume is ${k ** 3} × ${r} = <b>${N}</b>. A cube with volume ${N} has edge <b>${tex(`\\sqrt[3]{${N}}`)}</b>.`,
        run: async (c) => { edgeLab.innerHTML = 'edge = ' + tex(`\\sqrt[3]{${N}}`); await Promise.all([c.fadeIn(brace, 400), c.fadeIn(edgeLab, 400), line(c, `V=${k ** 3}\\times${r}=${N}`), line(c, `e=\\sqrt[3]{${N}}`)]); } },
      { cap: `But the edge is also <b>${k} little edges</b> laid end to end: ${k} × ${tex(`\\sqrt[3]{${r}}`)} = <b>${tex(`${k}\\sqrt[3]{${r}}`)}</b>. Same edge, two names: ${tex(`\\sqrt[3]{${N}}=${k}\\sqrt[3]{${r}}\\approx${(N ** (1 / 3)).toFixed(2)}`)}.`,
        run: async (c) => {
          edgeLab.innerHTML = 'edge = ' + tex(`\\sqrt[3]{${N}}=${green(`${k}\\sqrt[3]{${r}}`)}`);
          const ticks = [...brace.querySelectorAll('.tick')];
          await Promise.all([c.fadeIn(edgeLab, 300), ...ticks.map((t, i) => c.anim(t, [{ strokeWidth: 3 }, { strokeWidth: 7 }, { strokeWidth: 3 }], 500, { delay: i * 120 })), line(c, `\\sqrt[3]{${N}}=\\sqrt[3]{${k ** 3}\\times${r}}=${green(`${k}\\sqrt[3]{${r}}`)}`, 'final')]);
        } }
    ];
  }
};

/* ================= 1. Find the largest perfect power ================= */
const FS = { f250: [3, 250], f432: [3, 432], f162: [4, 162], f1080: [3, 1080], f3072: [5, 3072], fm135: [3, -135] };
const finder = {
  title: 'Find the largest perfect cube (or nth power) that divides',
  height: 500,
  choices: [{ v: 'f250', label: tex('\\sqrt[3]{250}') }, { v: 'f432', label: tex('\\sqrt[3]{432}') }, { v: 'f162', label: tex('\\sqrt[4]{162}') }, { sep: 'Example 1 check:' }, { v: 'f1080', label: tex('\\sqrt[3]{1\\,080}') }, { v: 'f3072', label: tex('\\sqrt[5]{3\\,072}') }, { v: 'fm135', label: tex('\\sqrt[3]{-135}') }],
  intro: (v) => { const [n, cv] = FS[v]; return `Simplify ${tex(rt(n, tn(cv)))}: test the perfect ${POWER[n]}s ${n === 3 ? '8, 27, 64, …' : n === 4 ? '16, 81, 256, …' : '32, 243, 1 024, …'} in order. Keep the <b>largest</b> one that divides evenly.`; },
  make(stage, v, ex) {
    const [n, cv] = FS[v], N = Math.abs(cv), neg = cv < 0, W = ex.W;
    const pows = []; for (let b = 2; ; b++) { pows.push({ b, p: b ** n }); if (b ** n > N) break; }
    add(stage, h('div', 'fd-q', `${tex(rt(n, tn(cv)))} <span>Which perfect ${POWER[n]}s divide <b>${fmt(N)}</b>?</span>`), 24, 14);
    const row = add(stage, h('div', 'fd-row'), 24, 82); row.style.width = (W - 48) + 'px';
    const chips = pows.map((q) => { const e = h('div', 'fd-chip', `<b>${fmt(q.p)}</b><small>${tex(pw(q.b, n))}</small>`); row.appendChild(e); return e; });
    const lines = add(stage, h('div', 'fd-lines'), 24, 186); lines.style.width = (W * 0.56) + 'px';
    const best = add(stage, h('div', 'fd-best', '<div class="fd-h">Largest so far</div><div class="fd-v muted">none yet</div>'), W * 0.62, 186); best.style.width = (W * 0.38 - 24) + 'px';
    const res = add(stage, h('div', 'fd-res'), 24, 412); res.style.width = (W - 48) + 'px';
    const steps = [];
    const addLine = (c, html, delay = 0) => { const e = h('div', 'fd-line', html); lines.appendChild(e); while (lines.children.length > 6) lines.firstChild.remove(); return c.fadeIn(e, 300, { delay, from: 'translateX(-10px)' }); };
    if (neg) steps.push({
      cap: `The index is <b>odd</b>, so the − can come out first: ${tex(`\\sqrt[3]{-${N}}=-\\sqrt[3]{${N}}`)}. Now look for perfect cubes in <b>${N}</b>.`,
      run: (c) => addLine(c, `${tex(`\\sqrt[3]{-${N}}=-\\sqrt[3]{${N}}`)}`)
    });
    // group the tests: each success is its own step; runs of failures share a step; the first power past N is "stop"
    const tests = pows.filter((q) => q.p <= N), stop = pows[pows.length - 1];
    let groups = [], run = [];
    tests.forEach((q) => { if (N % q.p === 0) { if (run.length) groups.push(run); run = []; groups.push([q]); } else run.push(q); });
    if (run.length) groups.push(run);
    let bestQ = null; const wins = [];
    groups.forEach((g, gi) => {
      const ok = N % g[0].p === 0, last = gi === groups.length - 1;
      if (ok) wins.push(g[0]);
      const capOk = () => `${fmt(N)} ÷ ${fmt(g[0].p)} = <b>${fmt(N / g[0].p)}</b>, a whole number, so <b>${fmt(g[0].p)}</b> divides ${fmt(N)}. ${bestQ && bestQ !== g[0] ? 'It’s bigger than the last one, so it’s our new largest.' : ''}`;
      const capNo = `${g.map((q) => fmt(q.p)).join(g.length > 2 ? ', ' : ' and ')} ${g.length > 1 ? 'don’t' : 'doesn’t'} divide evenly into ${fmt(N)}.`;
      const capStop = last ? ` Next is ${fmt(stop.p)}, which is bigger than ${fmt(N)}: <b>stop</b>.` : '';
      steps.push({
        cap: ok ? () => capOk() + capStop : capNo + capStop,
        run: async (c) => {
          const jobs = [];
          g.forEach((q, t) => {
            const e = chips[pows.indexOf(q)];
            e.classList.add(ok ? 'yes' : 'no');
            jobs.push(c.anim(e, [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], 380, { delay: t * 160 }));
            jobs.push(addLine(c, `${fmt(N)} ÷ ${fmt(q.p)} = <b class="${ok ? 'ok' : ''}">${ok ? fmt(N / q.p) : decimal(N / q.p)}</b> ${ok ? '<b class="ok">✓</b>' : '<b class="red">✗</b>'}`, t * 160));
          });
          if (ok) {
            chips.forEach((e) => e.classList.remove('best')); chips[pows.indexOf(g[0])].classList.add('best'); bestQ = g[0];
            best.innerHTML = `<div class="fd-h">Largest so far</div><div class="fd-v">${fmt(g[0].p)} = ${tex(pw(g[0].b, n))}</div><div class="muted">${fmt(N)} = ${fmt(g[0].p)} × ${fmt(N / g[0].p)}</div>`;
            jobs.push(c.fadeIn(best, 350));
          }
          if (last) { const e = chips[chips.length - 1]; e.classList.add('stop'); jobs.push(c.anim(e, [{ opacity: 1 }, { opacity: 0.35 }], 400, { delay: 300 })); }
          await Promise.all(jobs);
        }
      });
    });
    const bq = wins[wins.length - 1], sgn = neg ? '-' : '';
    if (bq) {
      const rest = N / bq.p, mixed = rest === 1 ? `${sgn}${bq.b}` : `${sgn}${bq.b}${rt(n, rest)}`;
      steps.push({
        cap: `The largest is <b>${fmt(bq.p)} = ${tex(pw(bq.b, n))}</b>. Split the root: ${tex(`${rt(n, tn(cv))}=${sgn}${rt(n, tn(bq.p) + '\\times' + rest)}=${sgn}${rt(n, tn(bq.p))}\\times${rt(n, rest)}=${mixed}`)}.`,
        run: async (c) => { res.innerHTML = tex(`${rt(n, tn(cv))}=${sgn}${rt(n, tn(bq.p) + '\\times ' + rest)}=${green(mixed)}`); await c.fadeIn(res, 450); }
      });
      if (wins.length > 1) {
        const w0 = wins[0], r0 = N / w0.p;
        steps.push({
          cap: `Careful: ${fmt(w0.p)} also divides ${fmt(N)}, but ${tex(`${sgn}${w0.b}${rt(n, tn(r0))}`)} is <b>not simplest form</b>: ${fmt(r0)} still has a perfect ${POWER[n]} inside. Always pull out the <b>largest</b>.`,
          run: async (c) => { const e = h('div', 'fd-warn', `${tex(`${sgn}${w0.b}${rt(n, tn(r0))}`)} <b class="red">✗ not simplest</b>`); res.appendChild(e); await c.fadeIn(e, 350); }
        });
      }
    } else steps.push({ cap: `No perfect ${POWER[n]} divides ${fmt(N)}, so ${tex(rt(n, tn(cv)))} is already in simplest form.`, run: async (c) => { res.innerHTML = tex(rt(n, tn(cv)) + '\\text{ is in simplest form}'); await c.fadeIn(res, 400); } });
    return steps;
  }
};

/* ================= 1. Prime factors in groups of three ================= */
const GS = { g54: { n: 3, c: 54 }, g250: { n: 3, c: 250 }, g432: { n: 3, c: 432 }, g1080: { n: 3, c: 1080 }, g3072: { n: 5, c: 3072 }, gm135: { n: 3, c: -135 } };
const groups = {
  title: 'Groups of three: simplify a cube root with prime factors',
  height: 470,
  choices: [{ v: 'g54', label: tex('\\sqrt[3]{54}') }, { v: 'g250', label: tex('\\sqrt[3]{250}') }, { v: 'g432', label: tex('\\sqrt[3]{432}') }, { sep: 'Example 1 check:' }, { v: 'g1080', label: tex('\\sqrt[3]{1\\,080}') }, { v: 'g3072', label: tex('\\sqrt[5]{3\\,072}') }, { v: 'gm135', label: tex('\\sqrt[3]{-135}') }],
  custom: [2, 99999],
  intro: (v) => { const s = typeof v === 'number' ? { n: 3, c: v } : GS[v]; return `Simplify ${tex(rt(s.n, tn(s.c)))}. The index is <b>${s.n}</b>, so we look for <b>groups of ${word(s.n)}</b> identical prime factors.`; },
  make(stage, v, ex) { return simplifyMake(stage, typeof v === 'number' ? { n: 3, c: v } : GS[v], ex); }
};

/* ================= 1. Same number, different index ================= */
const SN = { s256: { N: 256, idx: [2, 3, 4, 5] }, s64: { N: 64, idx: [2, 3, 4, 5, 6] }, s432: { N: 432, idx: [2, 3, 4, 5] }, s1296: { N: 1296, idx: [2, 3, 4, 5] } };
const sameNumber = {
  title: 'Same number, different index: the index is the group size',
  height: 360,
  choices: [{ v: 's256', label: '256' }, { v: 's64', label: '64' }, { v: 's432', label: '432' }, { v: 's1296', label: fmt(1296) }],
  intro: (v) => `Take roots of <b>${fmt(SN[v].N)}</b> with index ${SN[v].idx.join(', ')}. Watch how the <b>group size</b> changes what comes out.`,
  make(stage, v, ex) {
    const { N, idx } = SN[v], W = ex.W, ps = primeFactors(N);
    const B = new RadBoard(stage, W, { hx: 24, cs: 48, top: 66, fh: 190, inRight: W * 0.62, notes: { x: W * 0.645, y: 66, w: W * 0.355 - 20 }, maxNotes: 6 });
    B.notes.classList.add('side');
    B.setIdx(2, false); B.top.innerHTML = tex(`${tn(N)} = ${[...new Set(ps)].map((p) => pw(p, ps.filter((x) => x === p).length)).join('\\times ')}`);
    let start = B.chip(bigAtom(String(N)), 'big'); B.inn.appendChild(start); B.syncVinc();
    let atoms = [];
    const steps = [{
      cap: `Break ${fmt(N)} into prime factors: ${fmt(N)} = ${ps.join(' × ')}.`,
      run: async (c) => { await B.morph(c, () => { start.remove(); atoms = ps.map((p) => B.chip(numAtom(p))); B.inn.append(...atoms); return atoms.map((a) => [start, a]); }, { flyStagger: 30 }); }
    }];
    idx.forEach((n) => {
      const S = analyse({ n, c: N }), outF = outList(S), inF = inList(S);
      const outTxt = outF.length ? (outF.length > 1 ? `${outF.join(' × ')} = <b>${S.outC}</b>` : `<b>${outF[0]}</b>`) + ' comes out' : '<b>nothing</b> comes out';
      const inTxt = inF.length ? (inF.length > 1 ? `${inF.join(' × ')} = <b>${S.inC}</b>` : `<b>${inF[0]}</b>`) + ' stays inside' : '<b>nothing</b> is left inside';
      steps.push({
        cap: `<b>Index ${n}</b>${n === 2 ? ' (a square root: the little 2 is usually not written)' : ''}: groups of <b>${word(n)}</b>. ${S.groups ? `${word(S.groups)[0].toUpperCase() + word(S.groups).slice(1)} full group${S.groups > 1 ? 's' : ''}: ${outTxt}; ${inTxt}.` : 'No full group, so nothing comes out.'} ${tex(rt(n, tn(N)) + '=' + S.result)}`,
        run: async (c) => {
          B.setIdx(n, true);
          const jobs = [c.pop(B.idx, 380)];
          await Promise.all(jobs);
          await B.morph(c, () => {
            const by = {}; atoms.forEach((e) => (by[e._a.k] = by[e._a.k] || []).push(e));
            const trays = [], left = [];
            S.keys.forEach((k) => { const els = by[k], q = Math.floor(els.length / n); for (let i = 0; i < q; i++) trays.push(B.tray(els.slice(i * n, i * n + n), true, S.atom[k].color)); left.push(...els.slice(q * n)); });
            B.inn.replaceChildren(...trays, ...left);
          });
          await B.note(c, `${rt(n, tn(N))} = ${S.result}`, S.hasIn ? '' : 'whole');
        }
      });
    });
    steps.push({ cap: 'A bigger index needs <b>bigger groups</b>, so less comes out. When every factor fits into full groups, the root is a <b>whole number</b> (a perfect power).', run: async (c) => { await Promise.all([...B.notes.querySelectorAll('.whole')].map((e) => c.anim(e, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], 500))); } });
    return steps;
  }
};

/* ================= 2. Mixed → entire ================= */
const TE = {
  e32: { n: 3, k: { c: Q(3) }, r: { c: Q(2) } },
  e25: { n: 3, k: { c: Q(2) }, r: { c: Q(5) } },
  en24: { n: 4, k: { c: Q(-2) }, r: { c: Q(3) } },
  e2a: { n: 4, k: { c: Q(3) }, r: { c: Q(2) } },
  e2b: { n: 3, k: { c: Q(-3) }, r: { c: Q(11) } },
  e2c: { n: 3, k: { c: Q(3, 4) }, r: { c: Q(32) } },
  e2d: { n: 5, k: { c: Q(-2) }, r: { c: Q(5) } }
};
const revLabel = (s) => tex(qTerm(s.k.c, s.k.vars || []) + rt(s.n, qTerm(s.r.c, s.r.vars || [])));
const toEntire = {
  title: 'Mixed → entire: the coefficient goes back in',
  height: 470,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'e32', label: revLabel(TE.e32) }, { v: 'e25', label: revLabel(TE.e25) }, { v: 'en24', label: revLabel(TE.en24) }, { sep: 'Example 2 check:' }, { v: 'e2a', label: revLabel(TE.e2a) }, { v: 'e2b', label: revLabel(TE.e2b) }, { v: 'e2c', label: revLabel(TE.e2c) }, { v: 'e2d', label: revLabel(TE.e2d) }],
  intro: (v) => `Write ${revLabel(TE[v])} as an <b>entire radical</b>: everything under one root.`,
  make(stage, v, ex) { return toEntireMake(stage, TE[v], ex); }
};

/* ================= 2. Powers of a negative: the sign flip-flop ================= */
const signs = {
  title: 'Powers of a negative number flip-flop',
  height: 410,
  choices: [{ v: -2, label: '−2' }, { v: -3, label: '−3' }, { v: -5, label: '−5' }],
  intro: (b) => `Multiply <b>${String(b).replace('-', '−')}</b> by itself again and again. Where does each answer land: the <b>negative</b> side or the <b>positive</b> side?`,
  make(stage, b, ex) {
    const W = ex.W, bx = W * 0.47, bw = (W - bx - 40) / 2;
    const bins = ['neg', 'pos'].map((s, i) => { const e = add(stage, h('div', 'sg-bin ' + s, `<div class="sg-h">${s === 'neg' ? 'Negative' : 'Positive'}</div><div class="sg-list"></div>`), bx + i * (bw + 16), 20); e.style.width = bw + 'px'; e.style.height = '262px'; return e; });
    const rows = [], base = `(${tn(b)})`;
    for (let e = 1; e <= 5; e++) {
      const v = b ** e, r = add(stage, h('div', 'sg-row', `${tex(`${base}^{${e}}`)} <span class="sg-eq">${tex('=' + tn(v))}</span> <span class="sg-tag ${e % 2 ? 'odd' : 'even'}">${e % 2 ? 'odd' : 'even'}</span>`), 24, 18 + (e - 1) * 52);
      r.style.opacity = 0; rows.push({ r, v, e });
    }
    const concl = add(stage, h('div', 'sg-concl'), 24, 296); concl.style.width = (W - 48) + 'px';
    const steps = rows.map(({ r, v, e }) => ({
      cap: e === 1 ? `${tex(`${base}^{1}=${tn(v)}`)}: just the number itself. It’s <b>negative</b>.`
        : `Multiply by ${tn(b).replace('-', '−')} again: ${tex(`${pw(base, e)}=${tn(b ** (e - 1))}\\times(${tn(b)})=${tn(v)}`)}. ${v < 0 ? 'Negative' : 'Positive'} — the sign <b>flips</b> every time.`,
      run: async (c) => {
        await c.fadeIn(r, 350, { from: 'translateX(-14px)' });
        const chip = h('div', 'sg-chip ' + (v < 0 ? 'neg' : 'pos'), `${tex(`${base}^{${e}}`)} <b>${fmt(v).replace('-', '−')}</b>`);
        bins[v < 0 ? 0 : 1].querySelector('.sg-list').appendChild(chip);
        if (!c.fast) {
          const sb = stage.getBoundingClientRect(), k = sb.width / stage.offsetWidth, a = r.querySelector('.sg-eq').getBoundingClientRect(), z = chip.getBoundingClientRect();
          await c.anim(chip, [{ transform: `translate(${(a.left - z.left) / k}px, ${(a.top - z.top) / k}px)`, opacity: 0.3 }, { transform: 'none', opacity: 1 }], 600);
        }
      }
    }));
    const odd = (e) => rows.filter((q) => q.e % 2 === e);
    steps.push({
      cap: `<b>Odd</b> powers of a negative are <b>negative</b>. <b>Even</b> powers are <b>positive</b>.`,
      run: (c) => Promise.all([...odd(1).map((q) => q.r.classList.add('hl-odd')), ...odd(0).map((q) => q.r.classList.add('hl-even'))].concat(rows.map((q, i) => c.anim(q.r, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], 400, { delay: i * 90 }))))
    });
    const b3 = b ** 3, b4 = Math.abs(b) ** 4;
    steps.push({
      cap: `So an <b>odd</b> root of a negative works: ${tex(`\\sqrt[3]{${tn(b3)}}=${tn(b)}`)} because ${tex(`(${tn(b)})^3=${tn(b3)}`)}. With an odd index the − can move <b>in and out</b> freely.`,
      run: async (c) => { const e = h('div', 'sg-c ok', `${tex(`\\sqrt[3]{${tn(b3)}}=${tn(b)}`)} <span class="sg-lbl">✓ real</span>`); concl.appendChild(e); await c.fadeIn(e, 400); }
    });
    steps.push({
      cap: `But an even power is never negative: ${tex(`(${tn(b)})^4=${tn(b4)}`)} and ${tex(`${tn(-b)}^4=${tn(b4)}`)}. So ${tex(`\\sqrt[4]{${tn(-b4)}}`)} is <b>not a real number</b>, and with an even index a negative coefficient must <b>stay outside</b>.`,
      run: async (c) => { const e = h('div', 'sg-c no', `${tex(`\\sqrt[4]{${tn(-b4)}}=\\ ?`)} <span class="sg-stamp">NOT REAL</span>`); concl.appendChild(e); await c.fadeIn(e, 300); await c.anim(e.querySelector('.sg-stamp'), [{ opacity: 0, transform: 'scale(1.8) rotate(-12deg)' }, { opacity: 1, transform: 'rotate(-5deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); }
    });
    return steps;
  }
};

/* ================= 3. Variables: exponent ÷ index ================= */
const VG = { v7_3: { n: 3, vars: [['x', 7]] }, v7_2: { n: 2, vars: [['x', 7]] }, v10_4: { n: 4, vars: [['z', 10]] }, a9: { n: 2, vars: [['a', 9]] }, t11: { n: 2, vars: [['t', 11]] }, x8: { n: 3, vars: [['x', 8]] }, x10: { n: 3, vars: [['x', 10]] } };
const lab = (s) => tex(rt(s.n, termTex(s.c || 1, s.vars)));
const varGroups = {
  title: 'Variables: group the x’s by the index',
  height: 480,
  choices: [{ v: 'v7_3', label: lab(VG.v7_3) }, { v: 'v7_2', label: lab(VG.v7_2) }, { v: 'v10_4', label: lab(VG.v10_4) }, { sep: 'Example 3 check:' }, { v: 'a9', label: lab(VG.a9) }, { v: 't11', label: lab(VG.t11) }, { v: 'x8', label: lab(VG.x8) }, { v: 'x10', label: lab(VG.x10) }],
  intro: (v) => `Simplify ${lab(VG[v])}. Write the power out as single factors, then make <b>groups of ${word(VG[v].n)}</b>.`,
  make(stage, v, ex) { return simplifyMake(stage, VG[v], ex); }
};
const MG = { e: { n: 2, vars: [['x', 8], ['y', 7]] }, f: { n: 2, c: 50, vars: [['x', 5]] }, g: { n: 2, c: 48, vars: [['y', 5], ['z', 6]] }, h: { n: 3, c: 54, vars: [['x', 7], ['y', 10]] }, d: { n: 3, c: 16, vars: [['a', 4]] } };
const mixedGroups = {
  title: 'Numbers and variables: every factor gets grouped',
  height: 500,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'd', label: lab(MG.d) }, { sep: 'Example 3 check:' }, { v: 'e', label: lab(MG.e) }, { v: 'f', label: lab(MG.f) }, { v: 'g', label: lab(MG.g) }, { v: 'h', label: lab(MG.h) }],
  intro: (v) => `Simplify ${lab(MG[v])}. Prime factors and variables all go into <b>groups of ${word(MG[v].n)}</b>.`,
  make(stage, v, ex) { return simplifyMake(stage, MG[v], ex); }
};

/* ================= 3. Variable mixed → entire ================= */
const VE = {
  x2x: { n: 3, k: { c: Q(1), vars: [['x', 2]] }, r: { c: Q(1), vars: [['x', 1]] } },
  a: { n: 2, k: { c: Q(3) }, r: { c: Q(1), vars: [['x', 5]] } },
  b: { n: 2, k: { c: Q(1), vars: [['b', 3]] }, r: { c: Q(1), vars: [['b', 1]] } },
  c: { n: 2, k: { c: Q(1), vars: [['x', 4]] }, r: { c: Q(1), vars: [['x', 1], ['y', 1]] } },
  d: { n: 3, k: { c: Q(2), vars: [['p', 1], ['q', 2]] }, r: { c: Q(3), vars: [['r', 5]] } }
};
const varToEntire = {
  title: 'Variable mixed → entire: the coefficient goes in as its nth power',
  height: 460,
  choices: [{ v: 'x2x', label: revLabel(VE.x2x) }, { sep: 'Example 4 check:' }, { v: 'a', label: revLabel(VE.a) }, { v: 'b', label: revLabel(VE.b) }, { v: 'c', label: revLabel(VE.c) }, { v: 'd', label: revLabel(VE.d) }],
  intro: (v) => `Write ${revLabel(VE[v])} as an <b>entire radical</b>. The whole coefficient goes in, ${word(VE[v].n)} times.`,
  make(stage, v, ex) { return toEntireMake(stage, VE[v], ex); }
};

/* ================= wiring ================= */
function mountExplainers() {
  const defs = { cubeMeaning, finder, groups, sameNumber, toEntire, signs, varGroups, mixedGroups, varToEntire };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

function mountWarmup() {
  document.querySelectorAll('.stack[data-n]').forEach((b) => {
    const k = Number(b.dataset.n); b.querySelector('.st-pic').appendChild(stackSVG(k, Math.min(30, 96 / k)));
    if (k === 1) { b.classList.add('shown'); return; }
    b.addEventListener('click', () => { const on = b.classList.toggle('shown'); b.querySelector('.st-n').innerHTML = on ? `<b>${k ** 3}</b> cubes` : '? cubes'; if (on) b.querySelector('.st-n').animate([{ transform: 'scale(1.4)' }, { transform: 'scale(1)' }], 320); });
  });
  const one = document.querySelector('.build[data-b=one] .bd-pic'), two = document.querySelector('.build[data-b=two] .bd-pic');
  if (one) { one.append(stackSVG(3, 22), h('span', 'bd-op', '<b>27</b> &lt; 54 &lt; <b>64</b>'), stackSVG(4, 18)); }
  if (two) { two.append(stackSVG(3, 22), h('span', 'bd-op', '+'), stackSVG(3, 22), h('span', 'bd-op', '= 54')); }
  document.querySelectorAll('.build').forEach((b) => b.addEventListener('click', () => b.classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
  // boxes drawn to scale: 1 L (10 cm), 2 L (12.6 cm), and the 8 L trap (20 cm)
  const bx = document.getElementById('boxes');
  if (bx) [[10, '1 L', '10 cm', ''], [10 * 2 ** (1 / 3), '2 L', '≈ 12.6 cm', 'right'], [20, '8 L', '20 cm', 'trap']].forEach(([e, L, cm, cls]) => {
    const s = e * 6.4, d = h('div', 'box ' + cls); const W = s * 1.45 + 4, H = s * 1.3 + 4;
    const svg = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
    const g = svgEl('g'); cubeFaces(g, 2, H - 2, s, cls === 'trap' ? { front: '#f8f6f1', top: '#efebe2', side: '#e3ddd0', edge: '#b3aa98' } : { front: '#e8cfa6', top: '#f2dfbd', side: '#d3b07a', edge: '#8a6a3a' });
    const t = svgEl('text', { x: 2 + s / 2, y: H - 2 - s / 2 + 10, class: 'box-l' }); t.textContent = L; g.appendChild(t); svg.appendChild(g);
    d.append(svg, h('div', 'box-cap', `<b>${cm}</b>${cls === 'trap' ? '<br><span class="red">double every edge: 8 L!</span>' : ''}`)); bx.appendChild(d);
  });
}

function mountTable() {
  const host = document.getElementById('ptable'); if (!host) return;
  const ns = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const rows = [['n', 1], ['n^2', 2], ['n^3', 3], ['n^4', 4], ['n^5', 5]];
  rows.forEach(([l, e], i) => {
    const r = h(i ? 'button' : 'div', 'pt-row' + (i ? '' : ' head') + (e === 3 ? ' on' : '')); if (i) r.type = 'button';
    r.appendChild(h('span', 'pt-l', tex(l)));
    ns.forEach((n) => r.appendChild(h('span', 'pt-c', fmt(n ** e))));
    if (i) r.addEventListener('click', () => r.classList.toggle('on'));
    host.appendChild(r);
  });
}

function mountTapQ() {
  document.querySelectorAll('.tapq').forEach((b) => b.addEventListener('click', () => b.classList.toggle('shown')));
}

function mountMachine() {
  const host = document.getElementById('xm'); if (!host) return;
  let e = 7, n = 3;
  host.innerHTML = `<div class="xm-ctl">
      <div class="xm-k"><span>exponent</span><button type="button" data-d="e-">−</button><b data-v="e"></b><button type="button" data-d="e+">+</button></div>
      <div class="xm-k"><span>index</span><button type="button" data-d="n-">−</button><b data-v="n"></b><button type="button" data-d="n+">+</button></div>
    </div>
    <div class="xm-body"><div class="xm-chips"></div><div class="xm-eq"></div></div>`;
  const chips = host.querySelector('.xm-chips'), eq = host.querySelector('.xm-eq');
  const draw = () => {
    host.querySelector('[data-v=e]').textContent = e; host.querySelector('[data-v=n]').textContent = n;
    const q = Math.floor(e / n), r = e % n;
    chips.innerHTML = '';
    const x = () => { const c = h('span', 'xm-x', tex('x')); return c; };
    for (let i = 0; i < q; i++) { const t = h('span', 'xm-tray'); for (let j = 0; j < n; j++) t.appendChild(x()); chips.appendChild(t); }
    for (let j = 0; j < r; j++) chips.appendChild(x());
    const res = (q ? pw('x', q) : '') + (r ? rt(n, pw('x', r)) : '');
    eq.innerHTML = `<div>${tex(`${e}\\div${n}=${q}\\ \\text{R}\\ ${r}`)}</div><div class="xm-res">${tex(`${rt(n, pw('x', e))}=${q ? res : rt(n, pw('x', e))}`)}</div><div class="muted small">${q ? `${word(q)} full group${q > 1 ? 's' : ''} → ${tex(pw('x', q))} outside` : 'no full group yet'}${r ? `; ${tex(pw('x', r))} stays inside` : '; nothing left inside'}</div>`;
    chips.animate([{ opacity: 0.4 }, { opacity: 1 }], 250);
  };
  host.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => {
    const d = b.dataset.d;
    if (d === 'e-') e = Math.max(1, e - 1); if (d === 'e+') e = Math.min(24, e + 1);
    if (d === 'n-') n = Math.max(2, n - 1); if (d === 'n+') n = Math.min(6, n + 1);
    draw();
  }));
  draw();
}

/* The ˣ√ demo of a negative under an even index ends in DOMAIN ERROR. On the TI, CLEAR only dismisses an error and keeps
 * the old entry, so the next "Show me" demo would type onto it. Clear the error and the entry before any demo starts. */
function guardCalcDemos() {
  document.addEventListener('click', (e) => {
    if (!e.target.closest || !e.target.closest('[data-keys]')) return;
    try { const C = window.HW && window.HW.Calc && window.HW.Calc.get(); if (C && C.calc && C.calc.error) { C.calc.error = null; C.calc.clearEntry(); C.calc.resultShown = false; } } catch (err) { /* ignore */ }
  }, true);
}

mountExplainers(); mountWarmup(); mountTable(); mountTapQ(); mountMachine(); guardCalcDemos();

/* ============ Stand Up Break! — entire ↔ mixed radicals with index 3 and higher, at the whiteboards (lessons/js/standup.js) ============ */
const suN = (n) => { const s = String(Math.abs(n)); return (n < 0 ? '-' : '') + (s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : s); };
const suRt = (n, x) => (n === 2 ? `\\sqrt{${x}}` : `\\sqrt[${n}]{${x}}`);
const suLab = (i) => '\\text{(' + 'abcdef'[i] + ')}\\ ';
const suGrid = (items) => '\\def\\arraystretch{1.8}\\begin{array}{ll}' + items.map((x, j) => (j ? '\\hspace{2.5em}' : '') + suLab(j) + '{' + x + '}').join(' & ') + '\\end{array}';
function suPF(n) { const f = []; for (let p = 2; p * p <= n; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) f.push([p, e]); } if (n > 1) f.push([n, 1]); return f; }
const suPow = (f) => f.map(([p, e]) => (e > 1 ? p + '^{' + e + '}' : String(p))).join('\\times ');
const suFree = (m, n) => suPF(m).every(([, e]) => e < n);          // no perfect n-th power factor (other than 1)
const suPar = (c) => (c < 0 ? `(${c})` : String(c));
/* entire → mixed: index n, radicand s·kⁿ·m */
function suToMixed(r, n, ks, lo, hi, neg, primes) {
  for (;;) {
    const k = r.pick(ks), m = r.int(2, 12), s = neg && n % 2 ? -1 : 1, X = s * k ** n * m;
    if (!suFree(m, n) || Math.abs(X) < lo || Math.abs(X) > hi) continue;
    const t = suRt(n, suN(X)), out = (s < 0 ? '-' : '') + k + suRt(n, m);
    return { t, w: (primes ? `${suN(Math.abs(X))}=${suPow(suPF(Math.abs(X)))}:\\ ` : '') + `${t}=${suRt(n, suN(s * k ** n) + '\\times' + m)}=${out}` };
  }
}
/* mixed → entire: c·ⁿ√m */
function suToEntire(c, n, m) {
  const t = (c === -1 ? '-' : c) + suRt(n, m);
  if (c < 0 && n % 2 === 0) return { t, w: `{${t}}=-${suRt(n, Math.abs(c) + '^' + n + '\\times' + m)}=-${suRt(n, suN(Math.abs(c) ** n * m))}\\quad(\\text{even index: the } - \\text{ stays outside})` };
  return { t, w: `{${t}}=${suRt(n, suPar(c) + '^' + n + '\\times' + m)}=${suRt(n, suN(c ** n * m))}` };
}
function suFracEntire(r) { // Example 2(c): a fraction in front of a cube root
  for (;;) {
    const q = r.int(2, 5), p = r.int(1, 5) * (r.chance(0.3) ? -1 : 1), m = r.pick([2, 3, 4, 5, 6, 9, 10, 12, 16, 24, 32, 54]);
    if (gcd(p, q) !== 1 || Math.abs(p) === 1 && r.chance(0.5)) continue;
    let A = p ** 3 * m, B = q ** 3; const g = gcd(A, B); A /= g; B /= g;
    if (B === 1 && r.chance(0.5)) continue;
    const co = (p < 0 ? '-' : '') + `\\dfrac{${Math.abs(p)}}{${q}}`, t = co + suRt(3, m);
    const res = B === 1 ? suRt(3, suN(A)) : suRt(3, (A < 0 ? '-' : '') + `\\dfrac{${suN(Math.abs(A))}}{${suN(B)}}`);
    return { t, w: `{${t}}=${suRt(3, `\\left(${co}\\right)^3\\times${m}`)}=${suRt(3, `${p < 0 ? '-' : ''}\\tfrac{${Math.abs(p) ** 3}}{${q ** 3}}\\times${m}`)}=${res}` };
  }
}
const suTwo = (A, B, text) => ({ text, q: suGrid([A.t, B.t]), a: [A, B].map((x, i) => suLab(i) + x.w) });
standup('u1l8', {
  intro: 'The index is the group size: pull out the largest perfect power, or send the coefficient back in as that power. Watch the sign.',
  levels: {
    BEG: (r) => { let A, B; do { A = suToMixed(r, 3, [2, 3, 4, 5, 6], 16, 2200); B = suToMixed(r, 3, [2, 3, 4, 5], 16, 1000); } while (A.t === B.t); // Example 1(a)
      return suTwo(A, B, 'Convert each radical to a mixed radical in simplest form.'); },
    PRG: (r) => { // Example 1(b, c) and Example 2(a, b, d)
      const A = r.pick([() => suToMixed(r, 3, [2, 3, 4, 5], 16, 1500, true), () => suToMixed(r, 4, [2, 3], 32, 900), () => suToMixed(r, 5, [2, 3], 64, 1500, r.chance(0.5))])();
      const n = r.pick([3, 3, 4, 5]), B = suToEntire(r.pick(n === 5 ? [-2, 2] : n === 4 ? [-2, -3, 2, 3] : [-2, -3, -4, -5, 2, 3, 4, 5]), n, r.pick(n === 3 ? [2, 3, 4, 5, 6, 7, 9, 10, 11] : [2, 3, 5, 6, 7]));
      return { text: '<b>(a)</b> Convert to a mixed radical in simplest form. <b>(b)</b> Convert to an entire radical.', q: suGrid([A.t, B.t]), a: [A, B].map((x, i) => suLab(i) + x.w) };
    },
    MAS: (r) => { // big radicands (use prime factors), and a fraction or a negative coefficient going back in
      const A = r.pick([() => suToMixed(r, 3, [6, 7, 8, 9, 10], 400, 7000, r.chance(0.5), true), () => suToMixed(r, 4, [3, 4, 5], 160, 4000, false, true), () => suToMixed(r, 5, [2, 3, 4], 64, 3500, r.chance(0.5), true)])();
      const B = r.chance(0.6) ? suFracEntire(r) : (() => { const n = r.pick([4, 5]), c = r.pick([-2, -3]); return suToEntire(c, n, r.pick([2, 3, 5, 6])); })();
      return { text: '<b>(a)</b> Convert to a mixed radical in simplest form. <b>(b)</b> Convert to an entire radical.', q: suGrid([A.t, B.t]), a: [A, B].map((x, i) => suLab(i) + x.w) };
    }
  }
});
