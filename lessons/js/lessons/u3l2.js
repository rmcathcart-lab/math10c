/* Math 10C · Unit 3 · Lesson 2 — Multiplying Monomials and Binomials: the explainers, the garden warm-up and the figures. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const box = (el, w, hh) => { el.style.width = w + 'px'; el.style.height = hh + 'px'; return el; };

/* KaTeX allowing \htmlClass (pieces of an expression that light up one at a time) */
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};
const T = (s) => tex(s); // inline math in captions

/* colours. Area-model cells use the FOIL colours: F (first·first) teal, O amber, I purple, L blue. */
const TEAL = '#13807a', AMB = '#c27a0e', PUR = '#7b4fc4', BLU = '#2f6fd0', RED = '#c93a33', OK = '#12805a', INK = '#1c2230';
const CELL = [[TEAL, PUR], [AMB, BLU]]; // CELL[row][col] with the first factor across the top: F r0c0, I r0c1, O r1c0, L r1c1
const PCOL = [TEAL, AMB, PUR, BLU];
const LIKE = ['#c2417a', '#2f6fd0', '#c27a0e', '#7b4fc4'];
const tc = (col, s) => `\\textcolor{${col}}{${s}}`;

/* ============ polynomial helpers: a term is { c: coefficient, v: { x: 2, y: 1 } } ============ */
function parseTerm(s) {
  const m = String(s).replace(/\s+/g, '').match(/^([+-]?)(\d*)((?:[a-z](?:\^\d+)?)*)$/);
  if (!m) throw new Error('bad term ' + s);
  const v = {};
  (m[3].match(/[a-z](?:\^\d+)?/g) || []).forEach((p) => { const k = p[0], e = p.length > 1 ? parseInt(p.slice(2), 10) : 1; v[k] = (v[k] || 0) + e; });
  return { c: (m[1] === '-' ? -1 : 1) * (m[2] === '' ? 1 : parseInt(m[2], 10)), v };
}
const parsePoly = (s) => String(s).replace(/\s+/g, '').match(/[+-]?[^+-]+/g).map(parseTerm);
const isConst = (t) => !Object.keys(t.v).length;
const mulT = (a, b) => { const v = { ...a.v }; for (const k in b.v) v[k] = (v[k] || 0) + b.v[k]; return { c: a.c * b.c, v }; };
const keyT = (t) => Object.keys(t.v).sort().map((k) => k + t.v[k]).join('');
const degT = (t) => Object.values(t.v).reduce((s, e) => s + e, 0);
const numT = (n) => fmt(n).replace(/\u202f/g, '\\,'); // 2 173 → 2\,173 (thin space, like the booklet)
function bodyT(t) { // the term without its sign
  const a = Math.abs(t.c), vs = Object.keys(t.v).sort().map((k) => (t.v[k] === 1 ? k : `${k}^{${t.v[k]}}`)).join('');
  return vs ? (a === 1 ? '' : numT(a)) + vs : numT(a);
}
const termT = (t, first) => (t.c < 0 ? '-' : first ? '' : '+') + bodyT(t);
const polyT = (list) => (list.length ? list.map((t, i) => termT(t, i === 0)).join('') : '0');
const ctT = (t, first, col) => (first ? tc(col, termT(t, true)) : (t.c < 0 ? '-' : '+') + tc(col, bodyT(t))); // a coloured term
const fT = (t) => (t.c < 0 ? `(${termT(t, true)})` : termT(t, true)); // a factor written for multiplying: (−3), 2x
function collect(list) { // combine like terms; highest degree first, ties in order of appearance
  const m = new Map();
  list.forEach((t) => { const k = keyT(t); if (m.has(k)) m.get(k).c += t.c; else m.set(k, { c: t.c, v: { ...t.v } }); });
  return [...m.values()].map((t, i) => ({ t, i })).filter((o) => o.t.c !== 0).sort((a, b) => degT(b.t) - degT(a.t) || a.i - b.i).map((o) => o.t);
}
function likeGroups(list) { // indices of terms that share a key, for groups of 2 or more
  const m = new Map(); list.forEach((t, i) => { const k = keyT(t); if (!m.has(k)) m.set(k, []); m.get(k).push(i); });
  return [...m.values()].filter((g) => g.length > 1);
}
const mulP = (P, Q) => P.flatMap((p) => Q.map((q) => mulT(p, q)));
const negP = (P) => P.map((t) => ({ c: -t.c, v: { ...t.v } }));
function expNote(a, b) { // "x^3·x^2 = x^{3+2} = x^5" when two factors share a letter and an exponent is bigger than 1
  const ks = Object.keys(a.v).filter((k) => b.v[k]);
  const big = ks.filter((k) => a.v[k] > 1 || b.v[k] > 1);
  if (!big.length) return '';
  return ' Exponents add: ' + big.map((k) => T(`${k}^{${a.v[k]}}\\cdot ${k}^{${b.v[k]}}=${k}^{${a.v[k]}+${b.v[k]}}=${k}^{${a.v[k] + b.v[k]}}`)).join(', ') + '.';
}
function signNote(a, b) {
  if (a.c < 0 && b.c < 0) return ' Negative × negative is <b>positive</b>.';
  if (a.c < 0 || b.c < 0) return ' Negative × positive is <b>negative</b>.';
  return '';
}
const prodCap = (a, b) => T(`${fT(a)}\\cdot ${fT(b)}=${termT(mulT(a, b), true)}`);

/* ============ drawing helpers ============ */
function stagePos(stage, el) { // an element's box in stage coordinates (the lesson may be scaled to fit the screen)
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2 - sr.left) / k, y: (r.top + r.height / 2 - sr.top) / k, l: (r.left - sr.left) / k, t: (r.top - sr.top) / k, r: (r.right - sr.left) / k, b: (r.bottom - sr.top) / k };
}
function arcLayer(stage) { const s = svgEl('svg', { class: 'u3l2-arcs' }); stage.appendChild(s); return s; }
/* an arrow that draws itself from (x1,y1) to (x2,y2), bulging up (lift > 0) or down (lift < 0) */
function arrow(svg, x1, y1, x2, y2, lift, col, label) {
  const cx = (x1 + x2) / 2, cy = (lift > 0 ? Math.min(y1, y2) : Math.max(y1, y2)) - lift;
  const p = svgEl('path', { d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, fill: 'none', stroke: col, 'stroke-width': 3.4, 'stroke-linecap': 'round' });
  const ang = Math.atan2(y2 - cy, x2 - cx), L = 13, wd = 0.46;
  const pts = [[x2, y2], [x2 - L * Math.cos(ang - wd), y2 - L * Math.sin(ang - wd)], [x2 - L * Math.cos(ang + wd), y2 - L * Math.sin(ang + wd)]];
  const hd = svgEl('polygon', { points: pts.map((q) => q.join(',')).join(' '), fill: col });
  svg.append(p, hd);
  const len = p.getTotalLength() || 1;
  p.style.strokeDasharray = len; p.style.strokeDashoffset = len; hd.style.opacity = 0;
  let lab = null;
  if (label) {
    const py = (y1 + 2 * cy + y2) / 4;
    lab = svgEl('text', { x: cx, y: lift > 0 ? py - 8 : py + 22, 'text-anchor': 'middle', class: 'u3l2-arclab', fill: col }); lab.textContent = label; lab.style.opacity = 0; svg.appendChild(lab);
  }
  return {
    p, hd, lab,
    async draw(c, ms = 520) { await c.anim(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], ms); await Promise.all([c.anim(hd, [{ opacity: 0 }, { opacity: 1 }], 140), lab ? c.anim(lab, [{ opacity: 0 }, { opacity: 1 }], 200) : null]); },
    dim(c) { return Promise.all([p, hd, lab].filter(Boolean).map((e) => c.anim(e, [{ opacity: e.style.opacity || 1 }, { opacity: 0.22 }], 250))); }
  };
}
const fillOn = (c, el, delay = 0) => c.sleep(delay).then(() => el.classList.add('on'));
const pulse = (c, el, s = 1.12) => c.anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], 460);
const showSpans = (c, els, ms = 320) => Promise.all(els.map((e) => c.anim(e, [{ opacity: 0 }, { opacity: 1 }], ms)));
const spans = (root, cls) => [...root.querySelectorAll('.' + cls)];
function stampIn(c, el) { return c.anim(el, [{ opacity: 0, transform: 'scale(1.9) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); }

/* a line of written work in a stage */
function wline(stage, src, x, y, cls = '') { const e = add(stage, h('div', 'u3l2-wl ' + cls, K(src)), x, y); return e; }

/* lengths for a (roughly) to-scale area model: letter terms long, number terms short */
function lenOf(t) {
  const a = Math.abs(t.c);
  if (!isConst(t)) return Math.min(280, 200 + 30 * (a - 1));
  return Math.max(70, Math.min(150, 36 + 20 * a));
}

/* ============ 1. Area model: monomial × binomial ============ */
const AMD = {
  demo: { m: '5', p: 'x+2' },
  a: { m: '4', p: 'x+3' }, b: { m: 'x', p: 'x+5' }, c: { m: '-2', p: 'x-4' }, d: { m: '3x', p: 'x-1' }, e: { m: '2x', p: 'x-3', right: true }
};
const areaMono = {
  title: 'Split the rectangle, add the pieces',
  height: 340,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'demo', label: tex('5(x+2)') }, { sep: 'Example 1 check:' }, ...'abcde'.split('').map((k) => ({ v: k, label: '(' + k + ')' }))],
  intro: (k) => { const d = AMD[k]; return `Find ${T(d.right ? `(${d.p})(${d.m})` : `${d.m}(${d.p})`)} with an <b>area model</b>: a rectangle whose sides are the two factors.`; },
  make(stage, key, ex) {
    const W = ex.W, d = AMD[key], m = parseTerm(d.m), P = parsePoly(d.p), prods = P.map((t) => mulT(m, t));
    const mT = termT(m, true), pT = polyT(P), orig = d.right ? `(${pT})(${mT})` : `${mT}(${pT})`, res = polyT(prods);
    let ws = P.map(lenOf), hh = Math.max(84, Math.min(210, Math.round(lenOf(m) * 0.8)));
    const sc = Math.min(1.35, 420 / (ws[0] + ws[1]), 230 / hh); ws = ws.map((w) => Math.round(w * sc)); hh = Math.round(hh * sc);
    const Wt = ws[0] + ws[1], rx = 120, ry = Math.round(60 + (236 - hh) / 2), offs = [0, ws[0]];
    const fills = P.map((t, k) => { const f = add(stage, box(h('div', 'u3l2-fill' + (prods[k].c < 0 ? ' neg' : '')), ws[k], hh), rx + offs[k], ry); f.style.setProperty('--pc', PCOL[k]); hide(f); return f; });
    const rect = add(stage, box(h('div', 'u3l2-rect'), Wt, hh), rx, ry); hide(rect);
    const divl = add(stage, box(h('div', 'u3l2-divl'), 0, hh), rx + ws[0], ry); hide(divl);
    const side = add(stage, h('div', 'u3l2-lab c', K(mT)), rx - 34, ry + hh / 2); hide(side);
    const dimAll = add(stage, box(h('div', 'u3l2-dim'), Wt, 0), rx, ry - 12); hide(dimAll);
    const topAll = add(stage, h('div', 'u3l2-lab c', K(pT)), rx + Wt / 2, ry - 36); hide(topAll);
    const dims = P.map((t, k) => { const e = add(stage, box(h('div', 'u3l2-dim'), ws[k] - 6, 0), rx + offs[k] + 3, ry - 12); hide(e); return e; });
    const tops = P.map((t, k) => { const e = add(stage, h('div', 'u3l2-lab c', K(termT(t, true))), rx + offs[k] + ws[k] / 2, ry - 36); e.style.color = PCOL[k]; hide(e); return e; });
    const ctr = add(stage, h('div', 'u3l2-ctr c', K(`\\text{area}=${mT}(${pT})`)), rx + Wt / 2, ry + hh / 2); hide(ctr);
    const plabs = prods.map((p, k) => { const e = add(stage, h('div', 'u3l2-plab c', K(termT(p, true))), rx + offs[k] + ws[k] / 2, ry + hh / 2); e.style.color = p.c < 0 ? RED : PCOL[k]; hide(e); return e; });
    // the written work, on the right
    const px = rx + Wt + 64, lh = 56; let ly = 52;
    const L0 = wline(stage, orig, px, ly); ly += lh;
    let Lr = null; if (d.right) { Lr = wline(stage, `=${mT}(${pT})`, px, ly); hide(Lr); ly += lh; }
    const half = (k) => `${fT(m)}\\cdot ${fT(P[k])}`;
    const Lp = wline(stage, `\\htmlClass{u3l2-h0}{=${half(0)}}\\mathbin{\\htmlClass{u3l2-h1}{+}}\\htmlClass{u3l2-h1}{${half(1)}}`, px, ly); ly += lh;
    const h0 = spans(Lp, 'u3l2-h0'), h1 = spans(Lp, 'u3l2-h1'); hide(...h0, ...h1);
    const Lf = wline(stage, `=${prods.map((p, k) => ctT(p, k === 0, p.c < 0 ? RED : PCOL[k])).join('')}`, px, ly, 'u3l2-ans'); hide(Lf);
    void L0;
    const negs = [m, ...P].filter((t) => t.c < 0).map((t) => T(termT(t, true)));
    const steps = [];
    if (d.right) steps.push({ cap: `The monomial is written <b>second</b>. Multiplying works in either order, so put it first: ${T(`${orig}=${mT}(${pT})`)}.`, run: (c) => c.fadeIn(Lr, 400) });
    steps.push({
      cap: `A rectangle ${T(mT)} tall and ${T(pT)} wide has area ${T(`${mT}(${pT})`)}.` + (negs.length ? ` It’s a <b>bookkeeping</b> area model: ${negs.join(' and ')} ${negs.length > 1 ? 'are signed entries' : 'is a signed entry'}, not ${negs.length > 1 ? 'real lengths' : 'a real length'}.` : ''),
      run: (c) => Promise.all([c.fadeIn(rect, 400), c.pop(side, 380, { delay: 200 }), c.fadeIn(dimAll, 300, { delay: 300 }), c.fadeIn(topAll, 350, { delay: 350 }), c.fadeIn(ctr, 400, { delay: 500 })])
    });
    steps.push({
      cap: `Split the width into its two terms, ${T(termT(P[0], true))} and ${T(termT(P[1], true))}. Now there are <b>two</b> smaller rectangles.`,
      run: (c) => Promise.all([c.anim(divl, [{ opacity: 1, transform: 'scaleY(0)' }, { opacity: 1, transform: 'scaleY(1)' }], 450), c.anim(ctr, [{ opacity: 1 }, { opacity: 0 }], 250), c.anim(topAll, [{ opacity: 1 }, { opacity: 0 }], 250), c.anim(dimAll, [{ opacity: 1 }, { opacity: 0 }], 250), ...tops.map((e, k) => c.pop(e, 380, { delay: 250 + k * 120 })), ...dims.map((e, k) => c.fadeIn(e, 300, { delay: 250 + k * 120 }))])
    });
    P.forEach((t, k) => {
      const p = prods[k];
      steps.push({
        cap: `${k ? 'Right' : 'Left'} piece: ${T(mT)} by ${T(termT(t, true))}. Its area is ${prodCap(m, t)}.` + expNote(m, t) + (p.c < 0 ? ' A negative entry gives a <b>negative area</b>.' : m.c < 0 && t.c < 0 ? ' Two negative entries give a <b>positive</b> area.' : ''),
        run: async (c) => {
          await Promise.all([c.anim(fills[k], [{ opacity: 0 }, { opacity: 1 }], 400), c.pop(plabs[k], 420, { delay: 150 }), showSpans(c, k ? h1 : h0, 350)]);
        }
      });
    });
    steps.push({
      cap: `Both describe the same rectangle, so ${T(`${orig}=${res}`)}.`,
      run: (c) => Promise.all([c.fadeIn(Lf, 400), ...plabs.map((e) => pulse(c, e, 1.15))])
    });
    return steps;
  }
};

/* ============ 2–3. The distributive property: arrows from the monomial to every term ============ */
const DS = {
  n1: { g: [{ m: '2x', p: '3x-4' }] },
  n2: { g: [{ m: '-5', p: '2x^2-x+3' }] },
  a2: { g: [{ m: '5', p: '4x+2' }] }, b2: { g: [{ m: '-3', p: '3x^2+x-5' }] }, c2: { g: [{ m: 'x^2', p: 'x^3-3', right: true }] }, d2: { g: [{ m: '-4x', p: '5x-3y+z' }] },
  n3: { g: [{ m: '2', p: 'x+5' }, { m: '-4', p: 'x-1' }] },
  a3: { g: [{ t: '8' }, { m: '-3', p: '5x+2' }] }, b3: { g: [{ m: '3', p: '4x-2' }, { m: '-3', p: 'x-5' }] }, c3: { g: [{ m: '4x', p: '2x^2-5x+3' }, { m: '-1', p: '6x+2x^2' }] }
};
function dsExprT(groups) { // the question, with every monomial and bracket term tagged so arrows can find them
  let s = '';
  groups.forEach((g, gi) => {
    if (g.t) { const t = parseTerm(g.t); s += (gi ? (t.c < 0 ? '-' : '+') : t.c < 0 ? '-' : '') + `\\htmlClass{u3l2-g${gi}c}{${bodyT(t)}}`; return; }
    const m = parseTerm(g.m), P = parsePoly(g.p), unit = Math.abs(m.c) === 1 && isConst(m);
    const inner = P.map((t, k) => (k === 0 ? `\\htmlClass{u3l2-g${gi}t${k}}{${termT(t, true)}}` : `${t.c < 0 ? '-' : '+'}\\htmlClass{u3l2-g${gi}t${k}}{${bodyT(t)}}`)).join('');
    if (g.right) { s += (gi ? '+' : '') + `(${inner})\\htmlClass{u3l2-g${gi}m}{${bodyT(m)}}`; return; }
    const sg = m.c < 0 ? '-' : '+';
    if (gi === 0) s += unit ? (m.c < 0 ? `\\htmlClass{u3l2-g${gi}m}{-}` : '') : `\\htmlClass{u3l2-g${gi}m}{${termT(m, true)}}`;
    else s += unit ? `\\mathbin{\\htmlClass{u3l2-g${gi}m}{${sg}}}` : `\\mathbin{\\htmlClass{u3l2-g${gi}m}{${sg}}}\\htmlClass{u3l2-g${gi}m}{${bodyT(m)}}`;
    s += `(${inner})`;
  });
  return s;
}
function makeDist(title, choices, first) {
  return {
    title, height: 360, choices, value: first,
    intro: (k) => `Expand ${T(dsExprT(DS[k].g).replace(/\\htmlClass\{[^}]*\}/g, ''))}: the monomial in front of a bracket multiplies <b>every</b> term inside it.`,
    make(stage, key, ex) {
      const W = ex.W, groups = DS[key].g;
      const svg = arcLayer(stage);
      const row0 = add(stage, h('div', 'u3l2-ds0', K(dsExprT(groups))), 44, 96);
      // the products, in order, and where each one came from
      const chunks = [];
      groups.forEach((g, gi) => {
        if (g.t) { chunks.push({ t: parseTerm(g.t), gi, k: -1 }); return; }
        const m = parseTerm(g.m);
        parsePoly(g.p).forEach((t, k) => chunks.push({ t: g.right ? mulT(t, m) : mulT(m, t), gi, k, a: m, b: t, right: g.right }));
      });
      const r1T = `\\htmlClass{u3l2-req}{=}` + chunks.map((ch, i) => (i === 0 ? `\\htmlClass{u3l2-r${i}}{${termT(ch.t, true)}}` : `\\mathbin{\\htmlClass{u3l2-r${i}}{${ch.t.c < 0 ? '-' : '+'}}}\\htmlClass{u3l2-r${i}}{${bodyT(ch.t)}}`)).join('');
      const row1 = add(stage, h('div', 'u3l2-ds1', K(r1T)), 44, 196);
      const rEls = chunks.map((ch, i) => spans(row1, 'u3l2-r' + i)), req = spans(row1, 'u3l2-req');
      hide(...req, ...rEls.flat());
      const fin = collect(chunks.map((ch) => ch.t)), likes = likeGroups(chunks.map((ch) => ch.t));
      const row2 = add(stage, h('div', 'u3l2-ds1 u3l2-ans', K('=' + polyT(fin))), 44, 276); hide(row2);
      const steps = [];
      const cst = chunks.filter((ch) => ch.k === -1);
      if (cst.length) {
        steps.push({
          cap: `The ${T(termT(cst[0].t, true))} isn’t attached to a bracket, so it comes down <b>as it is</b>.`,
          run: (c) => { const i = chunks.indexOf(cst[0]); spans(row0, `u3l2-g${cst[0].gi}c`).forEach((e) => e.classList.add('u3l2-hot')); return showSpans(c, [...req, ...rEls[i]]); }
        });
      }
      const arrs = [];
      groups.forEach((g, gi) => {
        if (g.t) return;
        const m = parseTerm(g.m), P = parsePoly(g.p), unit = Math.abs(m.c) === 1 && isConst(m);
        P.forEach((t, k) => {
          const i = chunks.findIndex((ch) => ch.gi === gi && ch.k === k), col = PCOL[k % PCOL.length], prod = chunks[i].t;
          let cap = '';
          if (k === 0) cap += unit && m.c < 0 ? `A bare minus means ${T('-1')}: distribute the ${T('-1')} to <b>every</b> term. ` : `Distribute the ${T(termT(m, true))} to <b>every</b> term in the bracket. `;
          cap += (g.right ? T(`${fT(t)}\\cdot ${fT(m)}=${termT(prod, true)}`) : prodCap(m, t)) + '.';
          cap += (g.right ? expNote(t, m) : expNote(m, t)) || '';
          if (!(unit && m.c < 0)) cap += signNote(m, t); else cap += t.c < 0 ? ' The sign flips to <b>+</b>.' : ' The sign flips to <b>−</b>.';
          steps.push({
            cap,
            run: async (c) => {
              if (k === 0) { await Promise.all(arrs.map((a) => a.dim(c))); spans(row0, `u3l2-g${gi}m`).forEach((e) => e.classList.add('u3l2-hot')); }
              const mEl = spans(row0, `u3l2-g${gi}m`).pop(), tEl = spans(row0, `u3l2-g${gi}t${k}`)[0];
              const a = stagePos(stage, mEl), b = stagePos(stage, tEl), dx = Math.abs(b.x - a.x);
              const ar = arrow(svg, a.x, a.t - 2, b.x, b.t - 2, Math.min(118, 46 + dx * 0.28), col); arrs.push(ar);
              tEl.style.color = col;
              if (!req[0].style.opacity || req[0].style.opacity === '0') showSpans(c, req);
              await ar.draw(c, 480);
              rEls[i].forEach((e) => (e.style.color = col));
              await showSpans(c, rEls[i], 350);
            }
          });
        });
      });
      if (likes.length) {
        const parts = likes.map((g) => T(`${g.map((i, j) => termT(chunks[i].t, j === 0)).join('')}=${termT(collect(g.map((i) => chunks[i].t))[0] || { c: 0, v: {} }, true)}`));
        const alone = chunks.map((ch, i) => i).filter((i) => !likes.some((g) => g.includes(i)));
        steps.push({
          cap: `<b>Collect like terms</b> (same colour): ${parts.join(' and ')}.` + (alone.length ? ` ${alone.map((i) => T(termT(chunks[i].t, true))).join(' and ')} ${alone.length > 1 ? 'have' : 'has'} no partner. ` : ' ') + `Answer: ${T(polyT(fin))}.`,
          run: async (c) => {
            await Promise.all(arrs.map((a) => a.dim(c)));
            chunks.forEach((ch, i) => { const g = likes.findIndex((gg) => gg.includes(i)); rEls[i].forEach((e) => { e.style.color = g < 0 ? '#9aa0ab' : LIKE[g]; }); if (g >= 0) rEls[i][rEls[i].length - 1].classList.add('u3l2-likeu'); });
            await c.fadeIn(row2, 420, { delay: 150 });
          }
        });
      } else {
        steps.push({
          cap: `No like terms to collect, so that’s the answer: ${T(dsExprT(groups).replace(/\\htmlClass\{[^}]*\}/g, '') + '=' + polyT(fin))}.`,
          run: async (c) => { await Promise.all(arrs.map((a) => a.dim(c))); row1.classList.add('u3l2-ans'); await pulse(c, row1, 1.05); }
        });
      }
      void W;
      return steps;
    }
  };
}
const distA = makeDist('Every term gets multiplied', [{ v: 'n1', label: tex('2x(3x-4)') }, { v: 'n2', label: tex('-5(2x^2-x+3)') }, { sep: 'Example 2 check:' }, { v: 'a2', label: '(a)' }, { v: 'b2', label: '(b)' }, { v: 'c2', label: '(c)' }, { v: 'd2', label: '(d)' }], 'n1');
const distB = makeDist('Expand every bracket, then collect', [{ v: 'n3', label: tex('2(x+5)-4(x-1)') }, { sep: 'Example 3 check:' }, { v: 'a3', label: '(a)' }, { v: 'b3', label: '(b)' }, { v: 'c3', label: '(c)' }], 'n3');

/* ============ 4. Composite shapes: add two rectangles, or subtract a corner ============ */
const SHAPES = { demo: { W1: '3x+5', H1: '2x', H2: '4x', W2: 'x+6' }, ex4: { W1: '5x+4', H1: '3x', H2: '6x', W2: '2x+7' } };
function shapeDraw(host, sh, u, ox, oyB, o = {}) { // the L-shaped figure: full width on top, a missing bottom-left corner
  const X = (a) => ox + a * u, Y = (b) => oyB - b * u;
  const svg = svgEl('svg', { class: 'u3l2-shsvg' });
  svg.appendChild(svgEl('path', { d: `M${X(0)} ${Y(6)}L${X(0)} ${Y(3)}L${X(2)} ${Y(3)}L${X(2)} ${Y(0)}L${X(6)} ${Y(0)}L${X(6)} ${Y(6)}Z`, class: 'u3l2-shp' }));
  host.appendChild(svg);
  const lab = (src, x, y, cls) => { const e = h('div', 'u3l2-shl c ' + (cls || ''), K(src)); at(e, x, y); host.appendChild(e); return e; };
  const labs = { W1: lab(sh.W1, X(3), Y(6) - (o.gap || 22)), H1: lab(sh.H1, X(0) - (o.side || 30), Y(4.5)), H2: lab(sh.H2, X(6) + (o.side || 30), Y(3)), W2: lab(sh.W2, X(4), Y(0) + (o.gap || 22)) };
  return { svg, X, Y, labs };
}
const COMP = { demoA: ['demo', 'add'], demoS: ['demo', 'sub'], i: ['ex4', 'add'], ii: ['ex4', 'sub'] };
const composite = {
  title: 'One shape, two ways',
  height: 420,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'demoA', label: 'add two rectangles' }, { v: 'demoS', label: 'big minus corner' }, { sep: 'Example 4 check:' }, { v: 'i', label: '(i) add' }, { v: 'ii', label: '(ii) subtract' }],
  intro: (k) => COMP[k][1] === 'add' ? 'Find the area by cutting the shape into <b>two rectangles</b> and adding them.' : 'Find the area by filling in the missing corner to make <b>one big rectangle</b>, then subtracting the corner.',
  make(stage, key, ex) {
    const W = ex.W, [sk, how] = COMP[key], sh = SHAPES[sk], u = 50, ox = 92, oyB = 372;
    const W1 = parsePoly(sh.W1), W2 = parsePoly(sh.W2), H1 = parsePoly(sh.H1), H2 = parsePoly(sh.H2);
    const Hb = collect([...H2, ...negP(H1)]), Wc = collect([...W1, ...negP(W2)]);
    const S = shapeDraw(stage, sh, u, ox, oyB), { X, Y } = S;
    const rectAt = (x0, y0, x1, y1, cls, col) => { const e = add(stage, box(h('div', 'u3l2-shr ' + cls), (x1 - x0) * u, (y1 - y0) * u), X(x0), Y(y1)); e.style.setProperty('--pc', col); hide(e); return e; };
    const px = 470, pw = W - px - 16, lh = how === 'add' ? 54 : 52;
    const line = (i, html) => { const e = add(stage, h('div', 'u3l2-cl', html), px, 26 + i * lh); e.style.width = pw + 'px'; hide(e); return e; };
    const tag = (s, col) => `<span class="u3l2-ctag" style="--pc:${col}">${s}</span>`;
    const area = (A, B) => collect(mulP(A, B));
    if (how === 'add') {
      const top = rectAt(0, 3, 6, 6, '', TEAL), bot = rectAt(2, 0, 6, 3, '', AMB);
      const cut = add(stage, box(h('div', 'u3l2-cut'), 4 * u, 0), X(2), Y(3)); hide(cut);
      const hb = add(stage, h('div', 'u3l2-shl c u3l2-red', K(polyT(Hb))), X(2) + 34, Y(1.5)); hide(hb);
      const aT = area(W1, H1), aB = area(W2, Hb), tot = collect([...aT, ...aB]);
      const l1 = line(0, `${tag('Top', TEAL)} ${K(`(${sh.W1})(${sh.H1})=${polyT(aT)}`)}`);
      const l2 = line(1, `${tag('Bottom', AMB)} ${K(`(${sh.W2})(${polyT(Hb)})=${polyT(aB)}`)}`);
      const l3 = line(2, K(`A=(${polyT(aT)})+(${polyT(aB)})`));
      const l4 = line(3, K(`\\phantom{A}=\\boldsymbol{${polyT(tot)}}`)); l4.classList.add('u3l2-ans');
      return [{
        cap: 'Cut straight across at the step. The shape becomes <b>two rectangles</b>: a wide one on top and a narrower one below.',
        run: (c) => c.anim(cut, [{ opacity: 1, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], 500)
      }, {
        cap: `<b>Top rectangle:</b> the whole top, ${T(sh.W1)}, by ${T(sh.H1)}. Area: ${T(`(${sh.W1})(${sh.H1})=${polyT(aT)}`)}.`,
        run: (c) => Promise.all([c.fadeIn(top, 400), c.fadeIn(l1, 400, { delay: 200 }), pulse(c, S.labs.W1), pulse(c, S.labs.H1)])
      }, {
        cap: `<b>Bottom rectangle:</b> ${T(sh.W2)} wide. Its height isn’t labelled: it’s the right side minus the top part, ${T(`${sh.H2}-${sh.H1}=${polyT(Hb)}`)}. Area: ${T(`(${sh.W2})(${polyT(Hb)})=${polyT(aB)}`)}.`,
        run: (c) => Promise.all([c.fadeIn(bot, 400), c.pop(hb, 400, { delay: 200 }), c.fadeIn(l2, 400, { delay: 350 })])
      }, {
        cap: `<b>Add</b> the two areas and collect like terms: ${T(`A=${polyT(tot)}`)}.`,
        run: (c) => Promise.all([c.fadeIn(l3, 400), c.fadeIn(l4, 400, { delay: 300 })])
      }];
    }
    const big = rectAt(0, 0, 6, 6, '', TEAL), cor = rectAt(0, 0, 2, 3, 'u3l2-corner', RED);
    const cw = add(stage, h('div', 'u3l2-shl c u3l2-red', K(polyT(Wc))), X(1), Y(0) + 22); hide(cw);
    const ch = add(stage, h('div', 'u3l2-shl c u3l2-red', K(polyT(Hb))), X(1), Y(1.5)); hide(ch);
    const aBig = area(W1, H2), aC = area(Wc, Hb), tot = collect([...aBig, ...negP(aC)]);
    const l1 = line(0, `${tag('Big', TEAL)} ${K(`(${sh.W1})(${sh.H2})=${polyT(aBig)}`)}`);
    const l2 = line(1, `${tag('Corner', RED)} ${K(`(${sh.W1})-(${sh.W2})=${polyT(Wc)}`)}`);
    const l2b = line(2, `<span class="u3l2-ctag ghost">Corner</span> ${K(`${sh.H2}-${sh.H1}=${polyT(Hb)}`)}`);
    const l3 = line(3, `<span class="u3l2-ctag ghost">Corner</span> ${K(`(${polyT(Wc)})(${polyT(Hb)})=${polyT(aC)}`)}`);
    const l4 = line(4, K(`A=(${polyT(aBig)})-(${polyT(aC)})`));
    const l5 = line(5, K(`\\phantom{A}=\\boldsymbol{${polyT(tot)}}`)); l5.classList.add('u3l2-ans');
    return [{
      cap: `Fill in the missing corner: now it’s one <b>big rectangle</b>, ${T(sh.W1)} by ${T(sh.H2)}. Area: ${T(`(${sh.W1})(${sh.H2})=${polyT(aBig)}`)}.`,
      run: (c) => Promise.all([c.fadeIn(big, 400), c.fadeIn(cor, 400, { delay: 150 }), c.fadeIn(l1, 400, { delay: 300 })])
    }, {
      cap: `The corner’s sides aren’t labelled. Width: the whole top minus the bottom, ${T(`(${sh.W1})-(${sh.W2})=${polyT(Wc)}`)}. Height: ${T(`${sh.H2}-${sh.H1}=${polyT(Hb)}`)}.`,
      run: (c) => Promise.all([c.pop(cw, 400), c.pop(ch, 400, { delay: 150 }), c.fadeIn(l2, 400, { delay: 250 }), c.fadeIn(l2b, 400, { delay: 400 })])
    }, {
      cap: `The corner’s area: ${T(`(${polyT(Wc)})(${polyT(Hb)})=${polyT(aC)}`)}. Cut it out.`,
      run: async (c) => {
        await c.fadeIn(l3, 400);
        await Promise.all([c.anim(cor, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate(-40px, 40px) rotate(-8deg)' }], 700), c.anim(cw, [{ opacity: 1 }, { opacity: 0 }], 600), c.anim(ch, [{ opacity: 1 }, { opacity: 0 }], 600), c.anim(big, [{ opacity: 1 }, { opacity: 0 }], 500)]);
        const top = rectAt(0, 3, 6, 6, 'flat', TEAL), bot = rectAt(2, 0, 6, 3, 'flat', TEAL); top.style.opacity = bot.style.opacity = 1;
      }
    }, {
      cap: `<b>Subtract</b> the whole corner, in brackets: the minus flips both of its signs. ${T(`A=${polyT(aBig)}${polyT(negP(aC)).replace(/^(?=[^-])/, '+')}=${polyT(tot)}`)}` + (sk === 'ex4' ? ', the same as method (i) ✓' : ', the same as adding two rectangles ✓') + '.',
      run: (c) => Promise.all([c.fadeIn(l4, 400), c.fadeIn(l5, 400, { delay: 300 })])
    }];
  }
};

/* ============ 5. Binomial × binomial: the area model grows a second strip ============ */
const GROW = {
  bk: { top: 'x+4', side: 'x+1' }, n2: { top: 'x+2', side: 'x+3' },
  a6: { top: 'x+5', side: 'x+2' }, b6: { top: 'a^2-3', side: 'a^2-7' }, c6: { top: '2p+3q', side: 'p+8q' }, e10: { top: '3a+2', side: 'a+5' }
};
const areaGrow = {
  title: 'From one strip to four pieces',
  height: 470,
  minW: 890, // drawn this wide and scaled to fit beside the sidebar (the four-cell grid sits at W - 312)
  choices: [{ v: 'bk', label: tex('(x+4)(x+1)') }, { v: 'n2', label: tex('(x+2)(x+3)') }, { sep: 'Example 6 check:' }, { v: 'a6', label: '(a)' }, { v: 'b6', label: '(b)' }, { v: 'c6', label: '(c)' }, { sep: 'Example 10 check:' }, { v: 'e10', label: '(i)' }],
  intro: (k) => `Think of ${T(`(${GROW[k].top})(${GROW[k].side})`)} as the area of a rectangle, ${T(GROW[k].top)} by ${T(GROW[k].side)}.`,
  make(stage, key, ex) {
    const W = ex.W, d = GROW[key], A = parsePoly(d.top), B = parsePoly(d.side);
    const cell = (r, cI) => mulT(B[r], A[cI]); // side term × top term, written like the booklet: x·4 = 4x
    let ws = A.map(lenOf), hs = B.map(lenOf);
    const s = Math.min(1, 440 / (ws[0] + ws[1]), 268 / (hs[0] + hs[1]));
    ws = ws.map((w) => Math.round(w * s)); hs = hs.map((v) => Math.round(v * s));
    const rx = 112, ry = 76, xo = [0, ws[0]], yo = [0, hs[0]];
    // rectangle cells
    const cells = [0, 1].map((r) => [0, 1].map((cI) => {
      const p = cell(r, cI), e = add(stage, box(h('div', 'u3l2-gc' + (p.c < 0 ? ' neg' : '')), ws[cI], hs[r]), rx + xo[cI], ry + yo[r]);
      e.style.setProperty('--pc', CELL[r][cI]); e.innerHTML = `<span class="u3l2-gcl">${K(termT(p, true))}</span>`;
      const l = e.firstChild; if (ws[cI] < 100 || hs[r] < 50) l.style.fontSize = '20px'; hide(e); l.style.opacity = 0; return { e, l, p };
    }));
    const tops = A.map((t, k) => { const e = add(stage, h('div', 'u3l2-lab c', K(termT(t, true))), rx + xo[k] + ws[k] / 2, ry - 34); hide(e); return e; });
    const tdim = A.map((t, k) => { const e = add(stage, box(h('div', 'u3l2-dim'), ws[k] - 6, 0), rx + xo[k] + 3, ry - 12); hide(e); return e; });
    const sides = B.map((t, r) => { const e = add(stage, h('div', 'u3l2-lab c', K(termT(t, true))), rx - 46, ry + yo[r] + hs[r] / 2); hide(e); return e; });
    const sdim = B.map((t, r) => { const e = add(stage, box(h('div', 'u3l2-vdim'), 0, hs[r] - 6), rx - 14, ry + yo[r] + 3); hide(e); return e; });
    // the four-cell grid, on the right
    const gx = W - 312, gy = 70, hw = 70, cw = 116, chh = 76, hhh = 50;
    const gbox = (x, y, w, hh, cls, html) => { const e = add(stage, box(h('div', 'u3l2-gg ' + cls, html), w, hh), x, y); hide(e); return e; };
    const gTitle = add(stage, h('div', 'u3l2-gt c', 'four-cell grid'), gx + (hw + 2 * cw) / 2, gy - 24); hide(gTitle);
    const gHead = [gbox(gx, gy, hw, hhh, 'hd x', K('\\times')), ...A.map((t, k) => gbox(gx + hw + k * cw, gy, cw, hhh, 'hd', K(termT(t, true))))];
    const gSide = B.map((t, r) => gbox(gx, gy + hhh + r * chh, hw, chh, 'hd', K(termT(t, true))));
    const gCell = [0, 1].map((r) => [0, 1].map((cI) => { const p = cells[r][cI].p, e = gbox(gx + hw + cI * cw, gy + hhh + r * chh, cw, chh, 'in' + (p.c < 0 ? ' neg' : ''), `<span>${K(termT(p, true))}</span>`); e.style.setProperty('--pc', CELL[r][cI]); e.firstChild.style.opacity = 0; return e; }));
    // the written line below
    const order = [[0, 0], [0, 1], [1, 0], [1, 1]], terms = order.map(([r, cI]) => cells[r][cI].p);
    const L1 = add(stage, h('div', 'u3l2-wl u3l2-gl', K(`(${d.top})(${d.side})\\htmlClass{u3l2-q0}{=}` + order.map(([r, cI], i) => `\\htmlClass{u3l2-q${i}}{${ctT(cells[r][cI].p, i === 0, CELL[r][cI])}}`).join(''))), 40, 368);
    const qs = order.map((o, i) => spans(L1, 'u3l2-q' + i)); hide(...qs.flat());
    const fin = collect(terms), likes = likeGroups(terms);
    const L2 = add(stage, h('div', 'u3l2-wl u3l2-gl u3l2-ans', K(`\\phantom{(${d.top})(${d.side})}=${polyT(fin)}`)), 40, 414); hide(L2);
    const fillCell = (c, r, cI, delay = 0) => Promise.all([c.anim(cells[r][cI].l, [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], 380, { delay }), fillOn(c, cells[r][cI].e, delay), c.anim(gCell[r][cI].firstChild, [{ opacity: 0 }, { opacity: 1 }], 380, { delay: delay + 120 }), fillOn(c, gCell[r][cI], delay + 120), showSpans(c, qs[order.findIndex(([a, b]) => a === r && b === cI)], 300)]);
    const s0 = termT(B[0], true), s1 = termT(B[1], true), row0 = [cell(0, 0), cell(0, 1)];
    const steps = [{
      cap: `Start with <b>one strip</b>: ${T(s0)} tall and ${T(d.top)} wide. That’s ${T(`${fT(B[0])}(${d.top})=${polyT(row0)}`)}, a monomial times a binomial, just like Section 1.`,
      run: async (c) => {
        await Promise.all([...cells[0].map((x) => c.fadeIn(x.e, 350)), ...tops.map((e, k) => c.pop(e, 350, { delay: k * 100 })), ...tdim.map((e) => c.fadeIn(e, 300)), c.pop(sides[0], 350, { delay: 150 }), c.fadeIn(sdim[0], 300), c.fadeIn(gTitle, 300), ...gHead.map((e) => c.fadeIn(e, 300)), c.fadeIn(gSide[0], 300), ...gCell[0].map((e) => c.fadeIn(e, 300)), showSpans(c, qs[0])]);
        await Promise.all([fillCell(c, 0, 0), fillCell(c, 0, 1, 250)]);
      }
    }, {
      cap: `Now the side grows by ${T(s1)}${B[1].c < 0 ? ' (a signed entry: a <b>bookkeeping</b> strip with negative area)' : ''}. The rectangle gets a whole <b>new strip</b> along the bottom: two more pieces to fill.`,
      run: (c) => Promise.all([...cells[1].map((x) => c.anim(x.e, [{ opacity: 1, height: '0px' }, { opacity: 1, height: hs[1] + 'px' }], 550)), c.pop(sides[1], 380, { delay: 300 }), c.fadeIn(sdim[1], 300, { delay: 300 }), c.fadeIn(gSide[1], 350, { delay: 200 }), ...gCell[1].map((e) => c.fadeIn(e, 350, { delay: 250 }))])
    }];
    [0, 1].forEach((cI) => steps.push({
      cap: `${cI ? 'Bottom-right' : 'Bottom-left'} piece: ${T(s1)} by ${T(termT(A[cI], true))}. Its area is ${prodCap(B[1], A[cI])}.` + expNote(B[1], A[cI]) + signNote(B[1], A[cI]),
      run: (c) => fillCell(c, 1, cI)
    }));
    const likeTxt = likes.map((g) => T(`${g.map((i, j) => termT(terms[i], j === 0)).join('')}=${termT(collect(g.map((i) => terms[i]))[0] || { c: 0, v: {} }, true)}`)).join(' and ');
    steps.push({
      cap: (likes.length ? `The two middle pieces are <b>like terms</b>, sitting on a diagonal of the grid: ${likeTxt}. ` : 'No like terms to collect. ') + `So ${T(`(${d.top})(${d.side})=${polyT(fin)}`)}.`,
      run: async (c) => {
        const cl = likes.flat().map((i) => order[i]);
        await Promise.all([...cl.map(([r, cI]) => pulse(c, cells[r][cI].e, 1.06)), ...cl.map(([r, cI]) => pulse(c, gCell[r][cI], 1.1))]);
        cl.forEach(([r, cI]) => { cells[r][cI].e.classList.add('like'); gCell[r][cI].classList.add('like'); });
        await c.fadeIn(L2, 420);
      }
    });
    return steps;
  }
};

/* ============ 5. Algebra tiles ============ */
const TCOL = { k2: ['#3a9a90', '#0f5f5a'], k1: ['#e0a33a', '#a8650a'], k0: ['#6f8fc4', '#34507d'] }; // shaded fill, outline
const tileKind = (a, b) => 'k' + ((a.x ? 1 : 0) + (b.x ? 1 : 0));
const parseTiles = (s) => s.split(',').map((t) => ({ x: t.replace('-', '') === 'x', s: t.startsWith('-') ? -1 : 1 }));
const tilesT = (list) => { const xs = list.filter((t) => t.x).reduce((a, t) => a + t.s, 0), us = list.filter((t) => !t.x).reduce((a, t) => a + t.s, 0); return polyT(collect([{ c: xs, v: { x: 1 } }, { c: us, v: {} }].filter((t) => t.c))); };
function tileGeom(top, side, X, U, G) { // positions of factor tiles and product tiles, relative to the frame corner
  const cw = top.map((t) => (t.x ? X : U)), rh = side.map((t) => (t.x ? X : U));
  const cx = []; let p = G; cw.forEach((w) => { cx.push(p); p += w + G; }); const TW = p;
  const ry = []; p = G; rh.forEach((v) => { ry.push(p); p += v + G; }); const TH = p;
  return { cw, rh, cx, ry, TW, TH };
}
/* a static frame (Example 5): factor tiles in place, product rectangle dashed (or filled in for the answer) */
function frameSVG(topS, sideS, fill, X, U, labW = 0) {
  const top = parseTiles(topS), side = parseTiles(sideS), G = Math.max(3, Math.round(U / 7)), g = tileGeom(top, side, X, U, G);
  const ox = U + 26 + labW, oy = U + 26 + (labW ? 30 : 0), Wd = ox + g.TW + 26, Hd = oy + g.TH + 22;
  const rect = (x, y, w, hh, kind, sgn) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="2" fill="${sgn > 0 ? TCOL[kind][0] : '#fff'}" stroke="${TCOL[kind][1]}" stroke-width="${sgn > 0 ? 1.6 : 2.4}"/>`;
  let s = `<svg viewBox="0 0 ${Wd} ${Hd}" width="${Wd}" height="${Hd}" class="u3l2-fsvg">`;
  s += `<path d="M${ox - U - 18} ${oy}H${ox + g.TW + 18}M${ox} ${oy - U - 18}V${oy + g.TH + 16}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  top.forEach((t, i) => (s += rect(ox + g.cx[i], oy - G - U, g.cw[i], U, t.x ? 'k1' : 'k0', t.s)));
  side.forEach((t, j) => (s += rect(ox - G - U, oy + g.ry[j], U, g.rh[j], t.x ? 'k1' : 'k0', t.s)));
  if (fill) side.forEach((b, j) => top.forEach((a, i) => (s += rect(ox + g.cx[i], oy + g.ry[j], g.cw[i], g.rh[j], tileKind(a, b), a.s * b.s))));
  else s += `<rect x="${ox}" y="${oy}" width="${g.TW}" height="${g.TH}" fill="none" stroke="#8b909b" stroke-width="1.6" stroke-dasharray="6 5"/>`;
  return { html: s + '</svg>', top: [ox + g.TW / 2, oy - G - U - 18], side: [ox - G - U - 10, oy + g.TH / 2] };
}
const TL = {
  demo: { top: 'x,1,1', side: 'x,1,1,1' }, n2: { top: 'x,1', side: 'x,-1,-1,-1' },
  a: { top: 'x,1,1', side: 'x,-1' }, b: { top: 'x,-1,-1', side: 'x,-1' }
};
const tileName = (t) => (t.x ? T('x') + '-tile' : 'unit tile');
const tiles = {
  title: 'Fill the frame with the shading rule',
  height: 460,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'demo', label: tex('(x+2)(x+3)') }, { v: 'n2', label: tex('(x+1)(x-3)') }, { sep: 'Example 5 check:' }, { v: 'a', label: '(a)' }, { v: 'b', label: '(b)' }],
  intro: (k) => { const d = TL[k]; return `Multiply ${T(`(${tilesT(parseTiles(d.top))})(${tilesT(parseTiles(d.side))})`)} with algebra tiles: one factor across the top of the frame, the other down the side.`; },
  make(stage, key, ex) {
    const W = ex.W, d = TL[key], top = parseTiles(d.top), side = parseTiles(d.side), X = 150, U = 38, G = 5, g = tileGeom(top, side, X, U, G);
    const topT = tilesT(top), sideT = tilesT(side), ox = 178, oy = 102;
    const tile = (x, y, w, hh, kind, sgn) => { const e = add(stage, box(h('div', `u3l2-tile ${kind} ${sgn > 0 ? 'pos' : 'neg'}`), w, hh), x, y); hide(e); return e; };
    const fh = add(stage, box(h('div', 'u3l2-fline'), g.TW + U + 44, 0), ox - U - 24, oy), fv = add(stage, box(h('div', 'u3l2-fline v'), 0, g.TH + U + 42), ox, oy - U - 24);
    const dash = add(stage, box(h('div', 'u3l2-fdash'), g.TW, g.TH), ox, oy); hide(dash);
    const tT = top.map((t, i) => tile(ox + g.cx[i], oy - G - U, g.cw[i], U, t.x ? 'k1' : 'k0', t.s));
    const sT = side.map((t, j) => tile(ox - G - U, oy + g.ry[j], U, g.rh[j], t.x ? 'k1' : 'k0', t.s));
    const topL = add(stage, h('div', 'u3l2-lab c', K(topT)), ox + g.TW / 2, oy - U - 40); hide(topL);
    const sideL = add(stage, h('div', 'u3l2-lab c', K(sideT)), ox - U - 62, oy + g.TH / 2); hide(sideL);
    const P = side.map((b, j) => top.map((a, i) => ({ a, b, i, j, kind: tileKind(a, b), s: a.s * b.s, el: tile(ox + g.cx[i], oy + g.ry[j], g.cw[i], g.rh[j], tileKind(a, b), a.s * b.s) })));
    // right-hand panel: legend, shading rule, zero-pair tray, tally
    const px = 568, pw = W - px - 18;
    const panel = add(stage, box(h('div', 'u3l2-tp'), pw, 0), px, 16); panel.style.height = 'auto';
    panel.innerHTML = `<div class="u3l2-tleg"><span class="u3l2-mt k0 pos"></span> shaded <b>+</b> &nbsp;&nbsp; <span class="u3l2-mt k0 neg"></span> unshaded <b>−</b></div>
      <div class="u3l2-trule"><b>Shading rule:</b> <span>same shading → <b>shaded</b> (+)</span><span>different shading → <b>unshaded</b> (−)</span></div>`;
    const tray = add(stage, box(h('div', 'u3l2-tray'), pw, 104), px, 166); tray.innerHTML = '<div class="u3l2-trh">zero pairs</div>'; hide(tray);
    const tal = add(stage, h('div', 'u3l2-tal'), px, 282); tal.style.width = pw + 'px'; hide(tal);
    const all = P.flat(), cnt = { k2: 0, k1: 0, k0: 0 }; all.forEach((t) => (cnt[t.kind] += t.s));
    const pos = (k) => all.filter((t) => t.kind === k && t.s > 0), neg = (k) => all.filter((t) => t.kind === k && t.s < 0);
    const pairs = []; ['k1', 'k0'].forEach((k) => { const a = pos(k), b = neg(k); for (let i = 0; i < Math.min(a.length, b.length); i++) pairs.push([a[i], b[i], k]); });
    const prodTerms = collect([{ c: cnt.k2, v: { x: 2 } }, { c: cnt.k1, v: { x: 1 } }, { c: cnt.k0, v: {} }].filter((t) => t.c));
    const ansT = polyT(prodTerms);
    const rawL = []; [['k2', { x: 2 }], ['k1', { x: 1 }], ['k0', {}]].forEach(([k, v]) => { const p = pos(k).length, n = neg(k).length; if (p) rawL.push({ c: p, v }); if (n) rawL.push({ c: -n, v }); });
    const rawT = polyT(rawL);
    const flash = (c, els) => Promise.all(els.map((e) => c.anim(e, [{ transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(201,58,51,0)' }, { transform: 'scale(1.08)', boxShadow: '0 0 0 5px rgba(201,58,51,.35)' }, { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(201,58,51,0)' }], 520)));
    const fillT = async (c, t, delay = 0) => { await c.sleep(delay); await Promise.all([flash(c, [tT[t.i], sT[t.j]]), c.pop(t.el, 380, { delay: 120 })]); };
    const steps = [{
      cap: `Top: ${T(topT)}, side: ${T(sideT)}. Each ${T('x')}-tile is ${T('x')} long and 1 wide; a unit tile is 1 by 1. ${[...top, ...side].some((t) => t.s < 0) ? 'The <b>unshaded</b> tiles are negative.' : 'All the factor tiles are <b>shaded</b>: positive.'}`,
      run: (c) => Promise.all([...tT.map((e, i) => c.pop(e, 340, { delay: i * 90 })), ...sT.map((e, j) => c.pop(e, 340, { delay: 200 + j * 90 })), c.fadeIn(topL, 300, { delay: 300 }), c.fadeIn(sideL, 300, { delay: 400 }), c.fadeIn(dash, 400, { delay: 450 })])
    }, {
      cap: `Fill the frame one tile at a time. Above and beside the corner are two ${T('x')}-tiles: ${T('x\\cdot x=x^2')}, the <b>big square</b>. Same shading, so it’s <b>shaded</b>.`,
      run: (c) => fillT(c, P[0][0])
    }];
    const rest0 = P[0].slice(1);
    steps.push({
      cap: `Rest of the first row: the side ${T('x')}-tile times each unit tile on top. ${T('x\\cdot1=x')}, so each one is an ${T('x')}-tile standing up. ${rest0.some((t) => t.s < 0) ? 'Different shading, so they’re <b>unshaded</b> (negative).' : 'Same shading, so they’re <b>shaded</b>.'}`,
      run: async (c) => { for (let k = 0; k < rest0.length; k++) await fillT(c, rest0[k]); }
    });
    // later rows, grouped by matching side tiles
    let j = 1;
    while (j < side.length) {
      let j2 = j; while (j2 + 1 < side.length && side[j2 + 1].x === side[j].x && side[j2 + 1].s === side[j].s) j2++;
      const rows = P.slice(j, j2 + 1), b = side[j], n = j2 - j + 1;
      const kinds = top.map((a) => (a.s * b.s > 0 ? 'shaded' : 'unshaded'));
      const same = kinds.every((k) => k === kinds[0]);
      const ruleTxt = b.s < 0 ? (top.some((a) => a.s < 0) ? `Watch the shading: unshaded × shaded → <b>unshaded</b>, but unshaded × unshaded → <b>shaded</b>, just like ${T('(-1)(-1)=+1')}.` : 'Different shading → <b>unshaded</b> (negative).') : (same ? (kinds[0] === 'shaded' ? 'Same shading → <b>shaded</b>.' : 'Different shading → <b>unshaded</b>.') : 'Check each pair’s shading.');
      steps.push({
        cap: `${n > 1 ? `The next ${n} rows` : 'The next row'}: the ${b.s > 0 ? 'shaded' : 'unshaded'} unit ${n > 1 ? 'tiles' : 'tile'} on the side times each top tile. ${T('x\\cdot1=x')} makes a flat ${T('x')}-tile and ${T('1\\cdot1=1')} a unit tile. ${ruleTxt}`,
        run: async (c) => { for (const row of rows) { await Promise.all(row.map((t, k) => fillT(c, t, k * 140))); } }
      });
      j = j2 + 1;
    }
    if (pairs.length) {
      steps.push({
        cap: `<b>Zero pairs:</b> a shaded and an unshaded tile of the same kind add to 0. ${pairs.length > 1 ? `Remove all ${pairs.length} pairs.` : 'Remove the pair.'}`,
        run: async (c) => {
          await c.fadeIn(tray, 300);
          const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, tb = tray.getBoundingClientRect();
          for (let q = 0; q < pairs.length; q++) {
            const [p1, p2] = pairs[q], cxT = (tb.left - sr.left) / k + 40 + q * 110, cyT = (tb.top - sr.top) / k + 60;
            const clones = [p1, p2].map((t, m) => { const e = t.el.cloneNode(true); e.classList.add('u3l2-clone'); stage.appendChild(e); return { e, t, m }; });
            p1.el.classList.add('ghost'); p2.el.classList.add('ghost');
            await Promise.all(clones.map(({ e, t, m }) => {
              const w = parseFloat(e.style.width), hh = parseFloat(e.style.height), flat = w > hh, sc = Math.min(1, 66 / Math.max(w, hh));
              const tx = cxT + m * (flat ? 0 : 14) - (parseFloat(e.style.left) + w / 2), ty = cyT + (flat ? (m ? 10 : -10) : 0) - (parseFloat(e.style.top) + hh / 2);
              return c.anim(e, [{ transform: 'none', opacity: 1 }, { transform: `translate(${tx}px, ${ty}px) scale(${sc})`, opacity: 1 }], 700);
            }));
            await Promise.all(clones.map(({ e }) => c.anim(e, [{ opacity: 1 }, { opacity: 0 }], 420, { delay: 120 })));
            clones.forEach(({ e }) => e.remove());
            const z = h('div', 'u3l2-zero', '0'); tray.appendChild(z); z.style.left = (28 + q * 110) + 'px';
            await c.pop(z, 300);
          }
        }
      });
    }
    const left = { k2: cnt.k2, k1: cnt.k1, k0: cnt.k0 };
    const line = (k, label) => { const n = left[k]; if (!n && !all.some((t) => t.kind === k)) return ''; const tt = { c: n, v: k === 'k2' ? { x: 2 } : k === 'k1' ? { x: 1 } : {} }; return `<div><span class="u3l2-mt ${k} ${n >= 0 ? 'pos' : 'neg'}"></span> ${label}: <b>${n === 0 ? '0' : (Math.abs(n) + ' ' + (n > 0 ? 'shaded' : 'unshaded'))}</b> → ${K(n === 0 ? '0' : termT(tt, true))}</div>`; };
    tal.innerHTML = line('k2', T('x^2') + '-tiles') + line('k1', T('x') + '-tiles') + line('k0', 'unit tiles') + `<div class="u3l2-tans">${K(`(${topT})(${sideT})=${ansT}`)}</div>`;
    steps.push({
      cap: (pairs.length ? `Count the tiles: ${T(rawT)}. With the zero ${pairs.length > 1 ? 'pairs' : 'pair'} gone, that’s ${T(ansT)}. ` : `Count the tiles inside the frame. `) + `So ${T(`(${topT})(${sideT})=${ansT}`)}.`,
      run: (c) => c.fadeIn(tal, 450)
    });
    return steps;
  }
};

/* ============ 5. Two-digit numbers: 41 × 53 = (40 + 1)(50 + 3) ============ */
const DG = { n: [41, 53], n2: [23, 17], a7: [32, 45], b7: [67, 84] };
const digits = {
  title: 'Two-digit multiplication is a binomial product',
  height: 400,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n', label: '41 × 53' }, { v: 'n2', label: '23 × 17' }, { sep: 'Example 7 check:' }, { v: 'a7', label: '(a)' }, { v: 'b7', label: '(b)' }],
  intro: (k) => `Multiply ${DG[k][0]} × ${DG[k][1]} with no calculator, using an area model.`,
  make(stage, key, ex) {
    const W = ex.W, [a, b] = DG[key], A = [a - (a % 10), a % 10], B = [b - (b % 10), b % 10], At = A[0] / 10, Bt = B[0] / 10;
    const k = Math.min(330 / A[0], 232 / B[0]), ws = [Math.round(A[0] * k), Math.max(60, Math.round(A[1] * k))], hs = [Math.round(B[0] * k), Math.max(60, Math.round(B[1] * k))];
    const rx = 96, ry = 78, xo = [0, ws[0]], yo = [0, hs[0]];
    const prod = (r, c) => B[r] * A[c], tTerm = (r, c) => mulT(r ? { c: B[1], v: {} } : { c: Bt, v: { t: 1 } }, c ? { c: A[1], v: {} } : { c: At, v: { t: 1 } });
    const cells = [0, 1].map((r) => [0, 1].map((cI) => {
      const e = add(stage, box(h('div', 'u3l2-gc'), ws[cI], hs[r]), rx + xo[cI], ry + yo[r]); e.style.setProperty('--pc', CELL[r][cI]);
      e.innerHTML = `<span class="u3l2-gcl n">${K(numT(prod(r, cI)))}</span><span class="u3l2-gcl tt">${K(termT(tTerm(r, cI), true))}</span>`;
      const [n, t] = e.children; n.style.opacity = 0; t.style.opacity = 0; hide(e); return { e, n, t };
    }));
    const lab = (x, y, n, tt) => { const e = add(stage, h('div', 'u3l2-lab c u3l2-dl', `<span class="n">${K(String(n))}</span><span class="tt">${K(tt)}</span>`), x, y); e.children[1].style.opacity = 0; hide(e); return e; };
    const tA = termT({ c: At, v: { t: 1 } }, true), tB = termT({ c: Bt, v: { t: 1 } }, true);
    const tops = [lab(rx + ws[0] / 2, ry - 30, A[0], tA), lab(rx + ws[0] + ws[1] / 2, ry - 30, A[1], String(A[1]))];
    const sides = [lab(rx - 40, ry + hs[0] / 2, B[0], tB), lab(rx - 40, ry + hs[0] + hs[1] / 2, B[1], String(B[1]))];
    const wholeT = add(stage, h('div', 'u3l2-lab c', K(String(a))), rx + (ws[0] + ws[1]) / 2, ry - 30), wholeS = add(stage, h('div', 'u3l2-lab c', K(String(b))), rx - 40, ry + (hs[0] + hs[1]) / 2);
    const outline = add(stage, box(h('div', 'u3l2-rect'), ws[0] + ws[1], hs[0] + hs[1]), rx, ry);
    // written work
    const px = rx + ws[0] + ws[1] + 56, lh = 46;
    const ps = [prod(0, 0), prod(0, 1), prod(1, 0), prod(1, 1)], tot = a * b;
    const tt = [tTerm(0, 0), tTerm(0, 1), tTerm(1, 0), tTerm(1, 1)], tFin = collect(tt);
    const cols = [CELL[0][0], CELL[0][1], CELL[1][0], CELL[1][1]];
    const L0 = wline(stage, `${a}\\times${b}=(${A[0]}+${A[1]})(${B[0]}+${B[1]})`, px, 30); hide(L0);
    const L1 = wline(stage, '\\htmlClass{u3l2-p0}{=}' + ps.map((p, i) => `\\htmlClass{u3l2-p${i}}{${i ? '+' : ''}${tc(cols[i], numT(p))}}`).join(''), px, 30 + lh);
    const pEls = ps.map((p, i) => spans(L1, 'u3l2-p' + i)); hide(...pEls.flat());
    const L2 = wline(stage, `=\\boldsymbol{${numT(tot)}}`, px, 30 + 2 * lh, 'u3l2-ans'); hide(L2);
    const L3 = wline(stage, `t=10:\\ \\ (${tA}+${A[1]})(${tB}+${B[1]})`, px, 30 + 3 * lh + 14, 'u3l2-tl'); hide(L3);
    const L4 = wline(stage, `=${tt.map((x, i) => ctT(x, i === 0, cols[i])).join('')}`, px, 30 + 4 * lh + 14, 'u3l2-tl'); hide(L4);
    const L4b = wline(stage, `=${polyT(tFin)}`, px, 30 + 5 * lh + 14, 'u3l2-tl'); hide(L4b);
    const tf = tFin.map((x) => x.c * 10 ** degT(x));
    const L5 = wline(stage, `=${tf.map(numT).join('+')}=\\boldsymbol{${numT(tot)}}`, px, 30 + 6 * lh + 14, 'u3l2-tl u3l2-ans'); hide(L5);
    hide(outline);
    const fill = (c, r, cI, delay = 0) => Promise.all([fillOn(c, cells[r][cI].e, delay), c.anim(cells[r][cI].n, [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], 380, { delay }), showSpans(c, pEls[r * 2 + cI])]);
    const swap = (c, el) => Promise.all([c.anim(el.children[0], [{ opacity: 1 }, { opacity: 0 }], 350), c.anim(el.children[1], [{ opacity: 0 }, { opacity: 1 }], 350, { delay: 200 })]);
    return [{
      cap: `Split each number into <b>tens and ones</b>: ${T(`${a}=${A[0]}+${A[1]}`)} and ${T(`${b}=${B[0]}+${B[1]}`)}. That cuts the rectangle into <b>four</b> pieces.`,
      run: async (c) => {
        wholeT.style.opacity = 1; wholeS.style.opacity = 1;
        await Promise.all([c.fadeIn(outline, 300), c.fadeIn(L0, 400)]);
        await Promise.all([c.anim(wholeT, [{ opacity: 1 }, { opacity: 0 }], 250), c.anim(wholeS, [{ opacity: 1 }, { opacity: 0 }], 250), ...cells.flat().map((x) => c.fadeIn(x.e, 300, { delay: 150 })), ...tops.map((e, i) => c.pop(e, 350, { delay: 250 + i * 100 })), ...sides.map((e, i) => c.pop(e, 350, { delay: 350 + i * 100 }))]);
      }
    }, {
      cap: `Top row: ${T(`${B[0]}\\times${A[0]}=${numT(ps[0])}`)} and ${T(`${B[0]}\\times${A[1]}=${numT(ps[1])}`)}.`,
      run: (c) => Promise.all([fill(c, 0, 0), fill(c, 0, 1, 220)])
    }, {
      cap: `Bottom row: ${T(`${B[1]}\\times${A[0]}=${numT(ps[2])}`)} and ${T(`${B[1]}\\times${A[1]}=${numT(ps[3])}`)}.`,
      run: (c) => Promise.all([fill(c, 1, 0), fill(c, 1, 1, 220)])
    }, {
      cap: `Add the four partial products: ${T(`${ps.map(numT).join('+')}=${numT(tot)}`)}.`,
      run: (c) => c.pop(L2, 420)
    }, {
      cap: `<b>Why it works:</b> let ${T('t=10')}. Then ${T(`${a}=${tA}+${A[1]}`)} and ${T(`${b}=${tB}+${B[1]}`)}: two <b>binomials</b>. The pieces become ${tt.map((x) => T(termT(x, true))).join(', ')}.`,
      run: (c) => Promise.all([...tops.map((e, i) => (i ? null : swap(c, e))), swap(c, sides[0]), ...cells.flat().map((x) => Promise.all([c.anim(x.n, [{ opacity: 1 }, { opacity: 0 }], 350), c.anim(x.t, [{ opacity: 0 }, { opacity: 1 }], 350, { delay: 200 })])), c.fadeIn(L3, 400, { delay: 300 }), c.fadeIn(L4, 400, { delay: 600 })])
    }, {
      cap: `Collect like terms: ${T(`(${tA}+${A[1]})(${tB}+${B[1]})=${polyT(tFin)}`)}. Put ${T('t=10')} back in: ${T(`${tf.map(numT).join('+')}=${numT(tot)}`)}. Multiplying two-digit numbers <b>is</b> multiplying two binomials.`,
      run: (c) => Promise.all([c.fadeIn(L4b, 400), c.fadeIn(L5, 400, { delay: 350 })])
    }];
  }
};

/* ============ 6. FOIL (and distributing a binomial): four arrows, four cells ============ */
const FO = {
  gen: { f1: 'a+b', f2: 'c+d', mode: 'foil' }, genD: { f1: 'a+b', f2: 'c+d', mode: 'dist' },
  a8: { f1: 'x+5', f2: 'x+3', mode: 'dist' }, b8: { f1: 'a-6', f2: '3a-2', mode: 'dist' }, c8: { f1: 'm-9', f2: 'n-9', mode: 'dist' }, d8: { f1: 'x+3y', f2: 'x-8y', mode: 'dist' },
  a9: { f1: 'x+7', f2: 'x+2', mode: 'foil' }, b9: { f1: 'y-4', f2: 'y+6', mode: 'foil' }, c9: { f1: '2x+3', f2: 'x-5', mode: 'foil' }, d9: { f1: '4a-3b', f2: '4a-3b', mode: 'foil', sq: true },
  e10: { f1: '3a+2', f2: 'a+5', mode: 'foil' }
};
const FOIL = [['F', 'First', 0, 0, 1], ['O', 'Outside', 0, 1, 1], ['I', 'Inside', 1, 0, -1], ['L', 'Last', 1, 1, -1]]; // letter, word, term of f1, term of f2, above/below
const foilCol = (L) => ({ F: CELL[0][0], O: CELL[1][0], I: CELL[0][1], L: CELL[1][1] })[L];
const foil = {
  title: 'Four arrows, four cells',
  height: 420,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'gen', label: 'FOIL' }, { v: 'genD', label: 'Distribute' }, { sep: 'Example 8 check:' }, ...'abcd'.split('').map((k) => ({ v: k + '8', label: '(' + k + ')' })), { sep: 'Example 9 check:' }, ...'abcd'.split('').map((k) => ({ v: k + '9', label: '(' + k + ')' })), { sep: 'Example 10 check:' }, { v: 'e10', label: '(iii)' }],
  intro: (k) => { const d = FO[k]; return d.mode === 'foil' ? `Use <b>FOIL</b> on ${T(d.sq ? `(${d.f1})^2` : `(${d.f1})(${d.f2})`)}: First, Outside, Inside, Last.` : `Use the <b>distributive property</b> on ${T(`(${d.f1})(${d.f2})`)}: distribute each term of the first binomial.`; },
  make(stage, key, ex) {
    const W = ex.W, d = FO[key], A = parsePoly(d.f1), B = parsePoly(d.f2), foilM = d.mode === 'foil';
    const fac = (P, n) => P.map((t, k) => (k === 0 ? `\\htmlClass{u3l2-f${n}${k}}{${termT(t, true)}}` : `${t.c < 0 ? '-' : '+'}\\htmlClass{u3l2-f${n}${k}}{${bodyT(t)}}`)).join('');
    const svg = arcLayer(stage);
    const head = add(stage, h('div', 'u3l2-fo0 c' + (d.sq ? ' sq' : ''), K((d.sq ? `(${d.f1})^{2}=` : '') + `(${fac(A, 'a')})(${fac(B, 'b')})`)), d.sq ? 316 : 300, 150);
    const tEl = (n, k) => spans(head, `u3l2-f${n}${k}`)[0];
    // grid: first factor across the top, second down the side (so F r0c0, O r1c0, I r0c1, L r1c1)
    const gx = W - 316, gy = 64, hw = 74, cw = 118, chh = 78, hhh = 52;
    const gbox = (x, y, w, hh, cls, html) => add(stage, box(h('div', 'u3l2-gg ' + cls, html), w, hh), x, y);
    gbox(gx, gy, hw, hhh, 'hd x', K('\\times')); A.forEach((t, k) => gbox(gx + hw + k * cw, gy, cw, hhh, 'hd', K(termT(t, true)))); B.forEach((t, r) => gbox(gx, gy + hhh + r * chh, hw, chh, 'hd', K(termT(t, true))));
    const gc = [0, 1].map((r) => [0, 1].map((cI) => { const p = mulT(A[cI], B[r]), e = gbox(gx + hw + cI * cw, gy + hhh + r * chh, cw, chh, 'in' + (p.c < 0 ? ' neg' : ''), `<span>${K(termT(p, true))}</span><i></i>`); e.style.setProperty('--pc', CELL[r][cI]); e.firstChild.style.opacity = 0; return e; }));
    const gT = add(stage, h('div', 'u3l2-gt c', 'the area model'), gx + hw + cw, gy - 22);
    void gT;
    // written lines
    const prods = FOIL.map(([L, , i, j]) => mulT(A[i], B[j]));
    let y = 286;
    let Ld = null;
    if (!foilM) { Ld = wline(stage, `=\\htmlClass{u3l2-da}{${fT(A[0])}(${d.f2})}\\htmlClass{u3l2-db}{${A[1].c < 0 ? '-' : '+'}${bodyT(A[1])}(${d.f2})}`, 40, 262); hide(Ld); y = 316; }
    const L1 = wline(stage, '\\htmlClass{u3l2-k0}{=}' + prods.map((p, i) => `\\htmlClass{u3l2-k${i}}{${ctT(p, i === 0, foilCol(FOIL[i][0]))}}`).join(''), 40, y);
    const kEls = prods.map((p, i) => spans(L1, 'u3l2-k' + i)); hide(...kEls.flat());
    const fin = collect(prods), likes = likeGroups(prods);
    const L2 = wline(stage, `=${polyT(fin)}`, 40, y + 50, 'u3l2-ans'); hide(L2);
    const arrs = {};
    const go = async (c, n) => {
      const [L, , i, j, up] = FOIL[n], col = foilCol(L);
      if (!arrs[L]) {
        const a = stagePos(stage, tEl('a', i)), b = stagePos(stage, tEl('b', j)), dx = Math.abs(b.x - a.x);
        arrs[L] = up > 0 ? arrow(svg, a.x, a.t - 2, b.x, b.t - 2, 34 + dx * 0.32, col, foilM ? L : '') : arrow(svg, a.x, a.b + 2, b.x, b.b + 2, -(30 + dx * 0.3), col, foilM ? L : '');
      }
      const r = j, cI = i;
      await arrs[L].draw(c, 460);
      await Promise.all([fillOn(c, gc[r][cI]), c.anim(gc[r][cI].firstChild, [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], 360), showSpans(c, kEls[n]), foilM ? (gc[r][cI].lastChild.textContent = L, c.pop(gc[r][cI].lastChild, 300)) : null]);
    };
    const pc = (n) => { const [, , i, j] = FOIL[n]; return prodCap(A[i], B[j]); };
    const steps = [];
    if (d.sq) steps.push({ cap: `A square means <b>two copies</b>: ${T(`(${d.f1})^2=(${d.f1})(${d.f2})`)}. Now it’s an ordinary binomial times binomial.`, run: (c) => pulse(c, head, 1.05) });
    if (foilM) {
      FOIL.forEach(([L, word], n) => steps.push({
        cap: `<b>${L}</b>${word.slice(1)}: the ${word.toLowerCase()} terms, ${pc(n)}.` + (n === 1 ? ' Outside = the two ends.' : n === 2 ? ' Inside = the two middle terms.' : '') + expNote(A[FOIL[n][2]], B[FOIL[n][3]]),
        run: (c) => go(c, n)
      }));
    } else {
      steps.push({ cap: `Treat ${T(`(${d.f2})`)} as one thing and distribute: ${T(`(${d.f1})(${d.f2})=${fT(A[0])}(${d.f2})${A[1].c < 0 ? '-' : '+'}${bodyT(A[1])}(${d.f2})`)}.`, run: (c) => c.fadeIn(Ld, 400) });
      steps.push({ cap: `Distribute the ${T(termT(A[0], true))}: ${pc(0)} and ${pc(1)}.`, run: async (c) => { spans(Ld, 'u3l2-da')[0].classList.add('u3l2-hot'); await go(c, 0); await go(c, 1); } });
      steps.push({ cap: `Distribute the ${T(termT(A[1], true))}: ${pc(2)} and ${pc(3)}.` + signNote(A[1], B[0]).replace('Negative × positive is <b>negative</b>.', ''), run: async (c) => { spans(Ld, 'u3l2-db')[0].classList.add('u3l2-hot'); await go(c, 2); await go(c, 3); } });
    }
    const likeTxt = likes.map((g) => T(`${g.map((i, j) => termT(prods[i], j === 0)).join('')}=${termT(collect(g.map((i) => prods[i]))[0] || { c: 0, v: {} }, true)}`)).join(' and ');
    steps.push({
      cap: (likes.length ? `The O and I products are <b>like terms</b> (a diagonal of the grid): ${likeTxt}. ` : `No like terms: no two products have the same variable part. `) + `So ${T(`${d.sq ? `(${d.f1})^2` : `(${d.f1})(${d.f2})`}=${polyT(fin)}`)}.` + (foilM ? '' : ' The same four arrows FOIL draws.'),
      run: async (c) => {
        if (likes.length) { const cl = likes.flat().map((n) => [FOIL[n][3], FOIL[n][2]]); await Promise.all(cl.map(([r, cI]) => pulse(c, gc[r][cI], 1.1))); cl.forEach(([r, cI]) => gc[r][cI].classList.add('like')); }
        if (likes.length) await c.fadeIn(L2, 420); else { L1.classList.add('u3l2-ans'); await pulse(c, L1, 1.04); }
      }
    });
    return steps;
  }
};

/* ============ 6. FOIL is only the 2 × 2 case ============ */
const foilLimit = {
  title: 'What FOIL misses',
  height: 450,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  intro: `Compare a binomial × binomial with a binomial × <b>trinomial</b>. Each cell of an area model is one product.`,
  make(stage, key, ex) {
    const W = ex.W, hw = 64, ch = 66, hh = 46;
    const mkGrid = (x, y, rows, colsT, cw) => {
      const R = rows.map(parseTerm), C = colsT.map(parseTerm), els = [];
      add(stage, box(h('div', 'u3l2-gg hd x'), hw, hh), x, y).innerHTML = K('\\times');
      C.forEach((t, k) => (add(stage, box(h('div', 'u3l2-gg hd'), cw, hh), x + hw + k * cw, y).innerHTML = K(termT(t, true))));
      R.forEach((t, r) => {
        add(stage, box(h('div', 'u3l2-gg hd'), hw, ch), x, y + hh + r * ch).innerHTML = K(termT(t, true));
        els.push(C.map((u, k) => { const p = mulT(t, u), e = add(stage, box(h('div', 'u3l2-gg in'), cw, ch), x + hw + k * cw, y + hh + r * ch); e.innerHTML = `<span>${K(termT(p, true))}</span><i></i>`; e.firstChild.style.opacity = 0; return { e, p }; }));
      });
      return els;
    };
    const lx = 26, rx = 372, gy = 104;
    const t1 = add(stage, h('div', 'u3l2-flt', `${K('(x+2)(x+3)')}<small>binomial × binomial: ${K('2\\times2=4')} products</small>`), lx, 18);
    const g1 = mkGrid(lx, gy, ['x', '2'], ['x', '3'], 100);
    const t2 = add(stage, h('div', 'u3l2-flt', `${K('(x+2)(x^2+3x+1)')}<small>binomial × trinomial: ${K('2\\times3=6')} products</small>`), rx, 18); hide(t2);
    const g2 = mkGrid(rx, gy, ['x', '2'], ['x^2', '3x', '1'], 104);
    const g2els = [...stage.querySelectorAll('.u3l2-gg')].slice(9); hide(...g2els);
    const b1 = add(stage, h('div', 'u3l2-badge ok c', 'FOIL: 4 of 4 ✓'), lx + hw + 100, gy + hh + 2 * ch + 30); hide(b1);
    const b2 = add(stage, h('div', 'u3l2-badge no c', 'FOIL: 4 of 6 ✗'), rx + hw + 156, gy + hh + 2 * ch + 30); hide(b2);
    const b3 = add(stage, h('div', 'u3l2-badge ok c', 'every term × every term: 6 of 6 ✓'), rx + hw + 156, gy + hh + 2 * ch + 30); hide(b3);
    const all6 = [g2[0][0].p, g2[0][1].p, g2[0][2].p, g2[1][0].p, g2[1][1].p, g2[1][2].p];
    const L = wline(stage, `(x+2)(x^2+3x+1)=${polyT(all6)}`, 26, 352); hide(L);
    const L2 = wline(stage, `\\phantom{(x+2)(x^2+3x+1)}=${polyT(collect(all6))}`, 26, 396, 'u3l2-ans'); hide(L2);
    const letters = (grid, cells) => cells.map(([r, cI, Lt]) => ({ e: grid[r][cI].e, Lt }));
    const light = (c, x, delay) => { x.e.style.setProperty('--pc', foilCol(x.Lt)); x.e.lastChild.textContent = x.Lt; return Promise.all([fillOn(c, x.e, delay), c.anim(x.e.firstChild, [{ opacity: 0 }, { opacity: 1 }], 340, { delay }), c.pop(x.e.lastChild, 300, { delay })]); };
    const f1 = letters(g1, [[0, 0, 'F'], [0, 1, 'O'], [1, 0, 'I'], [1, 1, 'L']]);
    const f2 = letters(g2, [[0, 0, 'F'], [0, 2, 'O'], [1, 0, 'I'], [1, 2, 'L']]);
    const miss = [g2[0][1], g2[1][1]];
    return [{
      cap: `Binomial × binomial: 2 rows × 2 columns = <b>4 cells</b>. F, O, I and L land in all four. FOIL works here: ${T('(x+2)(x+3)=x^2+5x+6')}.`,
      run: async (c) => { await Promise.all(f1.map((x, i) => light(c, x, i * 260))); await c.pop(b1, 380); }
    }, {
      cap: `Now a binomial × a <b>trinomial</b>: 2 rows × 3 columns = <b>6 cells</b>, so there are six products to find.`,
      run: (c) => Promise.all([c.fadeIn(t2, 350), ...g2els.map((e, i) => c.fadeIn(e, 300, { delay: i * 30 }))])
    }, {
      cap: `Try FOIL anyway. <b>F</b>irst ${T('x\\cdot x^2')}, <b>O</b>utside ${T('x\\cdot1')}, <b>I</b>nside ${T('2\\cdot x^2')}, <b>L</b>ast ${T('2\\cdot1')}. Those are only the four <b>corners</b>.`,
      run: (c) => Promise.all(f2.map((x, i) => light(c, x, i * 260)))
    }, {
      cap: `Two cells are still empty: ${T('x\\cdot3x')} and ${T('2\\cdot3x')}. FOIL never touches the middle term, so it <b>misses two products</b>.`,
      run: async (c) => { miss.forEach((m) => m.e.classList.add('miss')); await Promise.all([...miss.map((m) => c.shake(m.e)), c.pop(b2, 380)]); }
    }, {
      cap: `The distributive property, <b>every term × every term</b>, fills all six: ${T(`(x+2)(x^2+3x+1)=${polyT(collect(all6))}`)}. FOIL is just a name for the 2 × 2 case.`,
      run: async (c) => {
        miss.forEach((m) => { m.e.classList.remove('miss'); m.e.style.setProperty('--pc', OK); });
        await Promise.all([...miss.map((m, i) => Promise.all([fillOn(c, m.e, i * 200), c.anim(m.e.firstChild, [{ opacity: 0 }, { opacity: 1 }], 340, { delay: i * 200 })])), c.anim(b2, [{ opacity: 1 }, { opacity: 0 }], 250)]);
        await Promise.all([c.pop(b3, 380), c.fadeIn(L, 420, { delay: 200 }), c.fadeIn(L2, 420, { delay: 500 })]);
      }
    }];
  }
};

/* ============ 6. Check by substitution ============ */
const SC = {
  a: { v: 'x=2', o: '(x+7)(x+2)', oS: '(2+7)(2+2)', oM: '9\\times4', ov: 36, a: 'x^2+9x+14', aS: '2^2+9(2)+14', aM: '4+18+14', av: 36, who: 'Jordan', w: 'x^2+14', wS: '2^2+14', wM: '4+14', wv: 18, why: 'did only F and L, and skipped O and I' },
  b: { v: 'y=2', o: '(y-4)(y+6)', oS: '(2-4)(2+6)', oM: '(-2)(8)', ov: -16, a: 'y^2+2y-24', aS: '2^2+2(2)-24', aM: '4+4-24', av: -16, who: 'Riley', w: 'y^2-2y-24', wS: '2^2-2(2)-24', wM: '4-4-24', wv: -24, why: 'mixed up the signs of O and I' },
  c: { v: 'x=2', o: '(2x+3)(x-5)', oS: '(2(2)+3)(2-5)', oM: '(7)(-3)', ov: -21, a: '2x^2-7x-15', aS: '2(2)^2-7(2)-15', aM: '8-14-15', av: -21, who: 'Avery', w: '2x^2-7x+15', wS: '2(2)^2-7(2)+15', wM: '8-14+15', wv: 9, why: `got L’s sign wrong: ${T('3(-5)=-15')}` },
  d: { v: 'a=3,\\ b=2', o: '(4a-3b)^2', oS: '(4(3)-3(2))^2', oM: '(12-6)^2=6^2', ov: 36, a: '16a^2-24ab+9b^2', aS: '16(3)^2-24(3)(2)+9(2)^2', aM: '144-144+36', av: 36, who: 'Mateo', w: '16a^2+9b^2', wS: '16(3)^2+9(2)^2', wM: '144+36', wv: 180, why: 'squared each term and lost O and I' }
};
const subCheck = {
  title: 'Substitute a number into both forms',
  height: 346,
  choices: [{ sep: 'Example 9 check:' }, ...'abcd'.split('').map((k) => ({ v: k, label: '(' + k + ')' }))],
  value: 'a',
  intro: (k) => { const d = SC[k]; return `We expanded ${T(d.o)} to ${T(d.a)}. ${d.who} got ${T(d.w)}. Substitute numbers to see which one really equals the product.`; },
  make(stage, key, ex) {
    const W = ex.W, d = SC[key], cw = (W - 60) / 3, cy = 76;
    const pick = add(stage, h('div', 'u3l2-pick', `Test value: ${K(d.v)}`), 20, 14); hide(pick);
    const card = (i, head, e) => {
      const el = add(stage, h('div', 'u3l2-ck', `<div class="u3l2-ckh">${head}</div><div class="u3l2-cke">${K(e)}</div><div class="u3l2-cks"></div><div class="u3l2-ckv"></div>`), 20 + i * (cw + 10), cy);
      el.style.width = cw + 'px'; return { el, s: el.querySelector('.u3l2-cks'), v: el.querySelector('.u3l2-ckv') };
    };
    const C0 = card(0, 'The product', d.o), C1 = card(1, 'Our expansion', d.a), C2 = card(2, d.who + '’s expansion', d.w);
    const fill = (C, S, M, V) => { C.s.innerHTML = K(`=${S}`) + '<br>' + K(`=${M}`); C.v.innerHTML = K(`=\\boldsymbol{${V}}`); hide(C.s, C.v); };
    fill(C0, d.oS, d.oM, d.ov); fill(C1, d.aS, d.aM, d.av); fill(C2, d.wS, d.wM, d.wv);
    const st1 = add(stage, h('div', 'u3l2-stamp ok', '✓'), 20 + 2 * cw + 10 - 40, cy - 16), st2 = add(stage, h('div', 'u3l2-stamp no', '✗'), 20 + 3 * cw + 20 - 40, cy - 16); hide(st1, st2);
    return [{
      cap: `Pick a test value: ${T(d.v)}. Small, easy numbers. <b>2 or 3 beats 0 or 1</b>: those can hide a mistake.`,
      run: (c) => c.pop(pick, 380)
    }, {
      cap: `Substitute into the <b>product</b> (brackets first): ${T(d.o)} becomes <b>${d.ov}</b>.`,
      run: (c) => Promise.all([c.fadeIn(C0.s, 400), c.pop(C0.v, 400, { delay: 350 })])
    }, {
      cap: `Substitute into <b>our expansion</b>: it also gives <b>${d.av}</b>. The same value ✓, so the expansion checks out.`,
      run: async (c) => { await Promise.all([c.fadeIn(C1.s, 400), c.pop(C1.v, 400, { delay: 350 })]); C1.el.classList.add('good'); C0.el.classList.add('good'); await stampIn(c, st1); }
    }, {
      cap: `${d.who}’s expansion gives <b>${d.wv}</b>, not ${d.ov} ✗. ${d.who} ${d.why}. One substitution caught it.`,
      run: async (c) => { await Promise.all([c.fadeIn(C2.s, 400), c.pop(C2.v, 400, { delay: 350 })]); C2.el.classList.add('bad'); await stampIn(c, st2); }
    }];
  }
};

/* ============ warm-up: grow the garden ============ */
function mountGarden() {
  const host = document.getElementById('garden'); if (!host) return;
  const u = 34, L = 66, Tp = 14, X = (a) => L + a * u, Y = (b) => Tp + (8 - b) * u;
  let grid = '';
  for (let i = 0; i <= 12; i++) grid += `<path d="M${X(i)} ${Y(0)}V${Y(8)}"/>`;
  for (let j = 0; j <= 8; j++) grid += `<path d="M${X(0)} ${Y(j)}H${X(12)}"/>`;
  let flowers = '';
  [[1.5, 1.5, '#c93a33'], [3.5, 4.5, '#fff'], [5.5, 1.5, '#ffecb3'], [7.5, 4.5, '#c93a33'], [8.5, 2.5, '#fff'], [1.5, 3.5, '#ffecb3'], [7.5, 1.5, '#fff'], [3.5, 0.5, '#c93a33'], [5.5, 4.5, '#fff'], [8.5, 5.5, '#ffecb3'], [2.5, 5.5, '#c93a33'], [6.5, 0.5, '#fff']].forEach(([a, b, col]) => {
    for (let k = 0; k < 5; k++) { const an = (k * 72 * Math.PI) / 180; flowers += `<circle cx="${X(a) + 6 * Math.cos(an)}" cy="${Y(b) - 6 * Math.sin(an)}" r="4.6" fill="${col}" stroke="#3c823c" stroke-width=".6"/>`; }
    flowers += `<circle cx="${X(a)}" cy="${Y(b)}" r="3.2" fill="#c88c14"/>`;
  });
  const reg = (cls, a0, b0, a1, b1) => `<rect class="u3l2-gr ${cls}" x="${X(a0)}" y="${Y(b1)}" width="${(a1 - a0) * u}" height="${(b1 - b0) * u}"/>`;
  host.innerHTML = `<svg viewBox="0 0 ${X(12) + 70} ${Y(0) + 40}" class="u3l2-gsvg">
      <rect x="${X(0)}" y="${Y(8)}" width="${12 * u}" height="${8 * u}" fill="#fff6dc"/>
      ${reg('rs', 10, 0, 12, 6)}${reg('ts', 0, 6, 10, 8)}${reg('cn', 10, 6, 12, 8)}
      <g class="u3l2-ggrid">${grid}</g>
      <rect x="${X(0)}" y="${Y(6)}" width="${10 * u}" height="${6 * u}" fill="#aad796" opacity=".92"/>
      <g stroke="#3c823c" stroke-width=".8" opacity=".6">${Array.from({ length: 11 }, (_, i) => `<path d="M${X(i)} ${Y(0)}V${Y(6)}"/>`).join('')}${Array.from({ length: 7 }, (_, j) => `<path d="M${X(0)} ${Y(j)}H${X(10)}"/>`).join('')}</g>
      ${flowers}
      <rect x="${X(0)}" y="${Y(6)}" width="${10 * u}" height="${6 * u}" fill="none" stroke="#2e6b2e" stroke-width="3"/>
      <rect class="u3l2-gout" x="${X(0)}" y="${Y(8)}" width="${12 * u}" height="${8 * u}" fill="none"/>
      <text x="${X(5)}" y="${Y(0) + 28}" class="u3l2-gtx">10 m</text><text x="${X(11)}" y="${Y(0) + 28}" class="u3l2-gtx red">+2 m</text>
      <text x="${X(0) - 10}" y="${Y(3) + 7}" class="u3l2-gtx end">6 m</text><text x="${X(0) - 10}" y="${Y(7) + 7}" class="u3l2-gtx red end">+2 m</text>
      <text x="${X(5)}" y="${Y(3) + 8}" class="u3l2-gtx old">old garden 60 m²</text>
      <text x="${X(11)}" y="${Y(3) + 8}" class="u3l2-gtx lab rs">12</text><text x="${X(5)}" y="${Y(7) + 8}" class="u3l2-gtx lab ts">10 × 2 = 20</text><text x="${X(11)}" y="${Y(7) + 8}" class="u3l2-gtx lab cn">4</text>
      <text x="${X(11)}" y="${Y(3) + 30}" class="u3l2-gtx lab rs sm">2 × 6</text>
    </svg>
    <div class="u3l2-gctl no-ink"><button class="pill" type="button" data-g="r">+2 m longer</button><button class="pill" type="button" data-g="t">+2 m wider</button>
      <button class="exb" type="button" data-g="x" title="Start over" aria-label="Start over"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/></svg></button></div>
    <div class="u3l2-gread" aria-live="polite"></div>`;
  const svg = host.querySelector('svg'), read = host.querySelector('.u3l2-gread'), st = { r: false, t: false };
  const render = () => {
    svg.classList.toggle('r', st.r); svg.classList.toggle('t', st.t); svg.classList.toggle('both', st.r && st.t);
    host.querySelectorAll('[data-g=r],[data-g=t]').forEach((b) => b.classList.toggle('on', st[b.dataset.g]));
    const parts = []; if (st.t) parts.push('<b class="ts">20</b>'); if (st.r) parts.push('<b class="rs">12</b>'); if (st.r && st.t) parts.push('<b class="cn">4</b>');
    const tot = (st.t ? 20 : 0) + (st.r ? 12 : 0) + (st.r && st.t ? 4 : 0);
    read.innerHTML = parts.length ? `New garden: ${st.r ? 12 : 10} m × ${st.t ? 8 : 6} m. Added: ${parts.join(' + ')}${parts.length > 1 ? ' = <b>' + tot + '</b>' : ''} m²${st.r && st.t ? ' <span class="cn">(don’t forget the corner!)</span>' : ''}` : 'Old garden: 10 m × 6 m = <b>60</b> m². Grow a side.';
  };
  host.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => {
    const g = b.dataset.g; if (g === 'x') { st.r = st.t = false; } else st[g] = !st[g];
    render();
    if (st.r && st.t && g !== 'x') { const cn = svg.querySelector('.u3l2-gr.cn'); cn.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }], 900); }
  }));
  render();
}

/* ============ static figures: mini area models, grids, tile frames, the composite shape, the tile legend ============ */
function mountFigures() {
  document.querySelectorAll('.u3l2-mini').forEach((el) => { // Example 1 answers
    const m = parseTerm(el.dataset.side), P = el.dataset.top.split(',').map(parseTerm);
    el.innerHTML = `<div class="u3l2-mside">${K(termT(m, true))}</div><div class="u3l2-mbody"><div class="u3l2-mtop">${P.map((t, k) => `<span class="${isConst(t) ? 'k' : 'v'}">${K(termT(t, true))}</span>`).join('')}</div><div class="u3l2-mrow">${P.map((t) => { const p = mulT(m, t); return `<span class="${isConst(t) ? 'k' : 'v'}${p.c < 0 ? ' neg' : ''}">${K(termT(p, true))}</span>`; }).join('')}</div></div>`;
  });
  document.querySelectorAll('.u3l2-grid').forEach((el) => { // four-cell grid answers
    const A = el.dataset.top.split(',').map(parseTerm), B = el.dataset.side.split(',').map(parseTerm);
    el.innerHTML = `<table><tr><th>${K('\\times')}</th>${A.map((t) => `<th>${K(termT(t, true))}</th>`).join('')}</tr>${B.map((b) => `<tr><th>${K(termT(b, true))}</th>${A.map((a) => `<td>${K(termT(mulT(b, a), true))}</td>`).join('')}</tr>`).join('')}</table>`;
  });
  document.querySelectorAll('.u3l2-frame').forEach((el) => { // Example 5 frames
    const small = el.classList.contains('small'), F = frameSVG(el.dataset.top, el.dataset.side, !!el.dataset.fill, small ? 74 : 124, small ? 19 : 32, small ? 0 : 64);
    el.innerHTML = F.html;
    if (!small) {
      const top = tilesT(parseTiles(el.dataset.top)), side = tilesT(parseTiles(el.dataset.side));
      el.insertAdjacentHTML('beforeend', `<div class="u3l2-fl c" style="left:${F.top[0]}px;top:${F.top[1]}px">${K(top)}</div><div class="u3l2-fl r" style="left:${F.side[0]}px;top:${F.side[1]}px">${K(side)}</div>`);
    }
  });
  document.querySelectorAll('.u3l2-shape').forEach((el) => { // Example 4
    const sh = SHAPES[el.dataset.shape];
    el.style.width = '460px'; el.style.height = '330px';
    const S = shapeDraw(el, sh, 46, 110, 300, { gap: 20, side: 34 });
    S.svg.setAttribute('width', 460); S.svg.setAttribute('height', 330);
  });
  const lg = document.getElementById('tile-legend');
  if (lg) {
    const t = (cls, w, hh) => `<span class="u3l2-lt ${cls}" style="width:${w}px;height:${hh}px"></span>`;
    lg.innerHTML = `<div class="u3l2-lh">Tile legend <span class="muted">(shaded +, unshaded −)</span></div>
      <div class="u3l2-lrow"><div>${t('k2 pos', 66, 66)}<span>${K('x^2')}</span></div><div>${t('k1 pos', 17, 66)}<span>${K('x')}</span></div><div>${t('k0 pos', 17, 17)}<span>${K('1')}</span></div>
      <div class="u3l2-lsep"></div><div>${t('k2 neg', 66, 66)}<span>${K('-x^2')}</span></div><div>${t('k1 neg', 17, 66)}<span>${K('-x')}</span></div><div>${t('k0 neg', 17, 17)}<span>${K('-1')}</span></div></div>`;
  }
  const sr = document.getElementById('shade-rule');
  if (sr) {
    const m = (s) => `<span class="u3l2-lt k0 ${s}" style="width:22px;height:22px"></span>`;
    sr.innerHTML = `<div class="u3l2-lh">Shading rule</div>
      <div class="u3l2-sr">${m('pos')}×${m('pos')}→${m('pos')}<span>${K('(+)(+)=+')}</span></div>
      <div class="u3l2-sr">${m('neg')}×${m('neg')}→${m('pos')}<span>${K('(-)(-)=+')}</span></div>
      <div class="u3l2-sr">${m('pos')}×${m('neg')}→${m('neg')}<span>${K('(+)(-)=-')}</span></div>
      <div class="u3l2-srn"><b>Same</b> shading → shaded. <b>Different</b> → unshaded.</div>`;
  }
}

function mountReveals() {
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { areaMono, distA, distB, composite, areaGrow, tiles, digits, foil, foilLimit, subCheck };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountFigures(); mountGarden(); mountReveals(); mountExplainers();
