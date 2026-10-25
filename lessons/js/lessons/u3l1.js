/* Math 10C · Unit 3 · Lesson 1 — Polynomials: Review and Preview. The explainers, the tile mat and the warm-up on this page.
 *
 * Algebra tiles follow the booklet's legend: SHADED = positive, UNSHADED (outline only) = negative.
 * Sizes stay in proportion: the x²-tile is x by x, the x-tile x by 1, the unit tile 1 by 1 (x = 3.5 units, as in the booklet).
 * Colours (every Unit 3 page): x² teal, x amber, 1 slate blue; a negative tile is white with a coloured outline. */
import { h, Explainer } from '../explain.js';
import { tex } from '../tex.js';
import { standup } from '../standup.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};
const T = (s) => tex(s);
const tc = (col, s) => `\\textcolor{${col}}{${s}}`;
const px = (e, p) => parseFloat(e.style[p]) || 0;
const plural = (n, w, ws) => n + ' ' + (n === 1 ? w : ws || w + 's');
const WORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const word = (n) => WORD[n] || String(n);

/* a stamp that thumps onto the stage */
function stampIn(c, el) { return c.anim(el, [{ opacity: 0, transform: 'scale(1.8) rotate(-12deg)' }, { opacity: 1, transform: 'scale(1) rotate(-5deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); }

/* a copy of `html` flies from one element to another inside the stage */
async function fly(c, stage, from, to, html, o = {}) {
  if (c.fast || !from || !to) return;
  c.check();
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const ax = (a.left + a.width / 2 - sr.left) / k, ay = (a.top + a.height / 2 - sr.top) / k;
  const bx = (b.left + b.width / 2 - sr.left) / k, by = (b.top + b.height / 2 - sr.top) / k;
  const g = add(stage, h('div', 'u3-fly c', html), ax, ay); if (o.fs) g.style.fontSize = o.fs + 'px';
  g.style.opacity = 0;
  try {
    await c.anim(g, [{ opacity: 1, transform: 'translate(0,0) scale(1.05)' }, { opacity: 1, transform: `translate(${(bx - ax) / 2}px, ${(by - ay) / 2 - 30}px) scale(1.15)`, offset: 0.5 }, { opacity: 0.85, transform: `translate(${bx - ax}px, ${by - ay}px) scale(.9)` }], o.ms || 700, { delay: o.delay || 0 });
  } finally { g.remove(); }
}

/* ======================================================================
 * Algebra tiles
 * ====================================================================== */
const TX = 70, TU = 20, TG = 6;
const KINDS = ['x2', 'x', '1'];
const KCOL = { x2: '#0d6a64', x: '#a3610a', 1: '#3558a0' };      // text colours, matching the tile fills
const KT = { x2: 'x^2', x: 'x', 1: '1' };
const KSHAPE = { x2: 'big square', x: 'long rectangle', 1: 'small square' };
const KNAMES = (k, n) => (k === '1' ? (n === 1 ? 'unit tile' : 'unit tiles') : T(KT[k]) + (n === 1 ? '-tile' : '-tiles'));

function tdim(k, s = 1) { return k === 'x2' ? [TX * s, TX * s] : k === 'x' ? [TU * s, TX * s] : [TU * s, TU * s]; }
function tileLabel(k) { return k === 'x2' ? '<i>x</i><sup>2</sup>' : k === 'x' ? '<i>x</i>' : '1'; }
function tile(k, sg, s = 1, lab = true, tag = 'div') {
  const e = h(tag, `u3t u3t-${k === '1' ? 'u' : k} ${sg > 0 ? 'pos' : 'neg'}`);
  const [w, ht] = tdim(k, s); e.style.width = w + 'px'; e.style.height = ht + 'px';
  e.style.fontSize = (k === 'x2' ? 25 : k === 'x' ? 18 : 12) * Math.max(s, 0.75) + 'px';
  if (lab) e.innerHTML = '<span class="u3t-l">' + tileLabel(k) + '</span>';
  e._k = k; e._s = sg; return e;
}
function flipTile(e) { e._s = -e._s; e.classList.toggle('pos', e._s > 0); e.classList.toggle('neg', e._s < 0); }

/* polynomials in x as { x2, x, 1 } coefficient maps */
function termT(c, k, first, col) {
  const a = Math.abs(c); let body = k === '1' ? String(a) : (a === 1 ? '' : a) + KT[k];
  if (col) body = tc(KCOL[k], body);
  return (c < 0 ? '-' : first ? '' : '+') + body;
}
function polyT(P, col) {
  const out = []; KINDS.forEach((k) => { const c = P[k] || 0; if (c) out.push(termT(c, k, !out.length, col)); });
  return out.length ? out.join('') : '0';
}
const negP = (P) => { const r = {}; for (const k in P) r[k] = -P[k]; return r; };
const sumP = (A, B) => { const r = {}; KINDS.forEach((k) => { const v = (A[k] || 0) + (B[k] || 0); if (v) r[k] = v; }); return r; };

/* The mat: one zone per kind of tile. Shaded tiles sit ABOVE the middle line, unshaded BELOW it,
 * column by column, so every zero pair lines up vertically. */
function matLayout(counts, W, o = {}) {
  const kinds = o.kinds || KINDS.filter((k) => counts[k] && counts[k].p + counts[k].n > 0);
  const pad = 14, ZG = 22, margin = o.margin == null ? 30 : o.margin;
  const colsOf = (k) => Math.max(o.minCols || 1, counts[k] ? Math.max(counts[k].p, counts[k].n) : 0);
  const width = (s) => kinds.reduce((t, k) => { const n = colsOf(k); return t + n * tdim(k, s)[0] + (n - 1) * TG * s + 2 * pad; }, 0) + ZG * (kinds.length - 1);
  let s = o.s || 1;
  for (let i = 0; i < 6; i++) { const w = width(s); if (w > W - margin) s *= (W - margin) / w; }
  let x = (W - width(s)) / 2; const zones = {};
  kinds.forEach((k) => { const n = colsOf(k), tw = tdim(k, s)[0], w = n * tw + (n - 1) * TG * s; zones[k] = { k, x, w: w + 2 * pad, x0: x + pad, step: tw + TG * s }; x += w + 2 * pad + ZG; });
  const gap = o.gap || 22, my = o.my;
  return {
    s, kinds, zones, my, gap, top: my - gap / 2 - TX * s, bot: my + gap / 2 + TX * s,
    pos(k, sg, i) { const z = zones[k], th = tdim(k, s)[1]; return { x: z.x0 + i * z.step, y: sg > 0 ? my - gap / 2 - th : my + gap / 2 }; }
  };
}
function zoneFrame(stage, L, k) {
  const z = L.zones[k], y = L.top - 38;
  const e = add(stage, h('div', 'u3-zone', `<div class="u3-zh">${K(tc(KCOL[k], KT[k]))}-tiles</div><i class="u3-zm"></i><b class="u3-zp">+</b><b class="u3-zn">−</b>`), z.x, y);
  e.style.width = z.w + 'px'; e.style.height = (L.bot - L.top + 50) + 'px';
  e.querySelector('.u3-zm').style.top = (L.my - y) + 'px';
  e.style.setProperty('--zc', KCOL[k]);
  return e;
}

/* zero pairs: each shaded tile i meets the unshaded tile i under it; both vanish; the leftovers slide back into line */
async function cancelPairs(c, stage, L, P, N, k) {
  const m = Math.min(P.length, N.length), [tw, th] = tdim(k, L.s), cy = L.my - th / 2;
  const zs = [];
  for (let i = 0; i < m; i++) { const z = add(stage, h('div', 'u3-zero c', '0'), px(P[i], 'left') + tw / 2, L.my); hide(z); zs.push(z); }
  await Promise.all(Array.from({ length: m }, async (_, i) => {
    const a = P[i], b = N[i];
    await c.sleep(i * 170);
    await Promise.all([c.anim(a, [{ top: a.style.top }, { top: cy + 'px' }], 420), c.anim(b, [{ top: b.style.top }, { top: cy + 'px' }], 420)]);
    const gone = [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.25)' }];
    await Promise.all([c.anim(a, gone, 380), c.anim(b, gone, 380), c.anim(zs[i], [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.25)', offset: 0.45 }, { opacity: 0, transform: 'scale(1)' }], 760)]);
  }));
  for (let i = 0; i < m; i++) { P[i].style.display = N[i].style.display = 'none'; zs[i].remove(); }
  const rest = P.length > m ? P.slice(m) : N.slice(m), sg = P.length > m ? 1 : -1;
  await Promise.all(rest.map((e, j) => c.anim(e, [{ left: e.style.left }, { left: L.pos(k, sg, j).x + 'px' }], 420, { delay: 80 })));
}

/* lay out a polynomial's tiles in a row of groups (term order); returns [{k, n, els, x, w}] */
function tileRow(stage, groups, x0, base, s, o = {}) {
  const GG = o.gg || 30, out = []; let x = x0;
  groups.forEach(([k, n]) => {
    const [tw, th] = tdim(k, s), els = [], gx = x;
    for (let i = 0; i < Math.abs(n); i++) { const e = add(stage, tile(k, Math.sign(n), s, o.lab !== false), x, base - th); els.push(e); x += tw + TG * s; }
    x += GG - TG * s; out.push({ k, n, els, x: gx, w: x - GG - gx });
  });
  return out;
}
const rowWidth = (groups, s, GG = 30) => groups.reduce((t, [k, n], i) => t + (i ? GG : 0) + Math.abs(n) * (tdim(k, s)[0] + TG * s) - TG * s, 0);
const groupsOf = (P) => KINDS.filter((k) => P[k]).map((k) => [k, P[k]]);

/* ============ 4. Build a polynomial from tiles ============ */
const BUILD = { b1: { x2: 2, x: -3, 1: 4 }, b2: { x2: -1, x: 5, 1: -2 }, b3: { x2: 1, 1: -4 }, b4: { x2: -3, x: 2 } };
const build = {
  title: 'Build a polynomial with tiles',
  height: 380,
  choices: Object.keys(BUILD).map((k) => ({ v: k, label: tex(polyT(BUILD[k])) })),
  intro: (k) => `Model ${T(polyT(BUILD[k]))} with algebra tiles. One term at a time: the <b>shape</b> says which power of ${T('x')}, the <b>shading</b> says the sign.`,
  make(stage, key, ex) {
    const W = ex.W, P = BUILD[key], groups = groupsOf(P), first = groups[0][0];
    const head = add(stage, h('div', 'u3-head c', K(groups.map(([k, n]) => `\\htmlClass{u3-bt}{${termT(n, k, k === first, true)}}`).join(''))), W / 2, 40);
    const spans = [...head.querySelectorAll('.u3-bt')];
    const s = Math.min(1, (W - 80) / rowWidth(groups, 1, 54)), base = 240;
    const row = tileRow(stage, groups, (W - rowWidth(groups, s, 54)) / 2, base, s, { gg: 54 });
    const labs = row.map((g) => { const e = add(stage, h('div', 'u3-glab c', `${K(termT(g.n, g.k, false, true))}<small>${Math.abs(g.n)} ${g.n > 0 ? 'shaded' : 'unshaded'}</small>`), g.x + g.w / 2, base + 46); hide(e); return e; });
    row.forEach((g) => hide(...g.els));
    const steps = row.map((g, i) => {
      const a = Math.abs(g.n), sh = g.n > 0;
      return {
        cap: `${T(termT(g.n, g.k, true))}: ${word(a)} ${KNAMES(g.k, a)} (${a === 1 ? 'a ' : ''}${KSHAPE[g.k]}${a === 1 ? '' : 's'}), <b>${sh ? 'shaded' : 'unshaded'}</b> because the term is <b>${sh ? 'positive' : 'negative'}</b>.`,
        run: async (c) => {
          spans.forEach((sp, j) => sp.classList.toggle('on', j === i));
          await Promise.all([...g.els.map((e, j) => c.pop(e, 340, { delay: j * 90 })), c.fadeIn(labs[i], 350, { delay: 200 })]);
        }
      };
    });
    steps.push({
      cap: `That’s ${T(polyT(P))} in tiles. To <b>read</b> a tile picture, go the other way: count each shape, and shaded means ${T('+')}, unshaded means ${T('-')}.`,
      run: async (c) => {
        spans.forEach((sp) => sp.classList.remove('on'));
        await Promise.all(row.flatMap((g) => g.els).map((e, j) => c.anim(e, [{ transform: 'translateY(0)' }, { transform: 'translateY(-12px)' }, { transform: 'translateY(0)' }], 360, { delay: j * 40 })));
      }
    });
    return steps;
  }
};

/* ============ 4. Read a tile picture ============ */
const READ = {
  e5a: [['x', 3], ['1', -1]],
  e5b: [['x2', 1], ['x', -2], ['1', 3]],
  r1: [['x2', -2], ['x', 1], ['1', 4]],
  r2: [['x', 4], ['x', -1], ['1', 2], ['1', -2]]
};
const read = {
  title: 'Read a tile picture',
  height: 390,
  value: 'r1',
  choices: [{ v: 'r1', label: 'Picture 1' }, { v: 'r2', label: 'Picture 2 (zero pairs!)' }, { sep: 'Example 5 check:' }, { v: 'e5a', label: '(a)' }, { v: 'e5b', label: '(b)' }],
  intro: () => 'What polynomial do these tiles show? Read one group at a time: the <b>shape</b> tells the power of ' + T('x') + ', the <b>shading</b> tells the sign.',
  make(stage, key, ex) {
    const W = ex.W, groups = READ[key], base = 190, GG = 62;
    stage.classList.add('u3-nolab');
    const s = Math.min(1, (W - 80) / rowWidth(groups, 1, GG));
    const row = tileRow(stage, groups, (W - rowWidth(groups, s, GG)) / 2, base, s, { gg: GG });
    const q = add(stage, h('div', 'u3-q c', 'What polynomial is this?'), W / 2, 34);
    const parts = row.map((g, i) => {
      const brk = add(stage, h('div', 'u3-brk'), g.x - 4, base + 10); brk.style.width = (g.w + 8) + 'px';
      const lab = add(stage, h('div', 'u3-glab c', `${K(termT(g.n, g.k, i === 0, true))}<small>${Math.abs(g.n)} ${g.n > 0 ? 'shaded' : 'unshaded'}</small>`), g.x + g.w / 2, base + 52);
      hide(brk, lab); return { brk, lab };
    });
    const R = {}; groups.forEach(([k, n]) => (R[k] = (R[k] || 0) + n));
    const res = add(stage, h('div', 'u3-res c', K('=' + polyT(R, true))), W / 2, 336); hide(res);
    const pairKinds = KINDS.filter((k) => groups.some(([kk, n]) => kk === k && n > 0) && groups.some(([kk, n]) => kk === k && n < 0));
    const steps = row.map((g, i) => {
      const a = Math.abs(g.n), sh = g.n > 0;
      return {
        cap: `<b>${word(a)[0].toUpperCase() + word(a).slice(1)} ${sh ? 'shaded' : 'unshaded'} ${KSHAPE[g.k]}${a === 1 ? '' : 's'}</b>: ${a === 1 ? 'a' : word(a)} ${sh ? 'positive' : 'negative'} ${KNAMES(g.k, a)}, so ${T(termT(g.n, g.k, true))}.`,
        run: async (c) => {
          q.style.opacity = 0;
          g.els.forEach((e) => e.classList.add('lab-on'));
          await Promise.all([c.fadeIn(parts[i].brk, 250), c.pop(parts[i].lab, 380, { delay: 150 }), ...g.els.map((e, j) => c.anim(e, [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], 300, { delay: j * 60 }))]);
        }
      };
    });
    if (pairKinds.length) {
      const said = pairKinds.map((k) => { const p = groups.filter(([kk, n]) => kk === k && n > 0).reduce((t, [, n]) => t + n, 0), n = groups.filter(([kk, n2]) => kk === k && n2 < 0).reduce((t, [, n2]) => t + n2, 0); return T(`${termT(p, k, true)}+(${termT(n, k, true)})=${R[k] ? termT(R[k], k, true) : '0'}`); });
      steps.push({
        cap: `Some tiles are <b>zero pairs</b>: one shaded and one unshaded of the same shape add to 0. Cancel them: ${said.join(' and ')}.`,
        run: async (c) => {
          await Promise.all(pairKinds.map(async (k) => {
            const P = row.filter((g) => g.k === k && g.n > 0).flatMap((g) => g.els), N = row.filter((g) => g.k === k && g.n < 0).flatMap((g) => g.els);
            const m = Math.min(P.length, N.length);
            for (let i = 0; i < m; i++) {
              const a = P[P.length - 1 - i], b = N[i];
              await c.anim(b, [{ left: b.style.left, top: b.style.top }, { left: a.style.left, top: a.style.top }], 450);
              await Promise.all([a, b].map((e) => c.anim(e, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0.12, transform: 'scale(.9)' }], 320)));
            }
          }));
        }
      });
    }
    steps.push({
      cap: `Put the terms together: the tiles show ${T(polyT(R))}.`,
      run: (c) => c.pop(res, 450)
    });
    return steps;
  }
};

/* ============ 5. Add with tiles / subtract by flipping (shared engine) ============ */
const COMB = {
  a1: { A: { x2: 2, x: 3, 1: -1 }, B: { x2: 1, x: -5, 1: 4 }, op: 1 },
  a2: { A: { x2: 1, 1: -2 }, B: { x2: -1, x: 4, 1: 2 }, op: 1 },
  e6a: { A: { x2: 3, 1: -4 }, B: { x2: 1, x: 5, 1: -2 }, op: 1 },
  s1: { A: { x: 5, 1: 2 }, B: { x: 3, 1: -7 }, op: -1 },
  s2: { A: { x2: 1, x: 3, 1: -2 }, B: { x2: 2, x: 1, 1: -5 }, op: -1 },
  e6b: { A: { x2: -2, x: 5, 1: -3 }, B: { x2: 3, x: -2, 1: -4 }, op: -1 },
  e7b: { A: { x2: 6, x: -5, 1: 4 }, B: { x2: 3, x: -8, 1: -2 }, op: -1 }
};
const qT = (d, col) => `(${polyT(d.A, col)})${d.op < 0 ? '-' : '+'}(${polyT(d.B, col)})`;
function combineMake(stage, d, W) {
  const sub = d.op < 0, A = d.A, B = d.B, Bf = sub ? negP(B) : B, R = sumP(A, Bf);
  const kinds = KINDS.filter((k) => A[k] || B[k]);
  const counts = {}; kinds.forEach((k) => { counts[k] = { p: 0, n: 0 }; [A[k] || 0, Bf[k] || 0].forEach((v) => { if (v > 0) counts[k].p += v; else counts[k].n -= v; }); });
  const LX = 236, GG = 24, top0 = 106, bandGap = 50;
  let s = Math.min(1, (W - LX - 24) / rowWidth(groupsOf(A), 1, GG), (W - LX - 24) / rowWidth(groupsOf(B), 1, GG));
  const geo = (s) => { const yA = top0 + TX * s, yB = yA + bandGap + TX * s; return { yA, yB, my: (top0 + yB) / 2 }; };
  let G = geo(s), L = matLayout(counts, W, { my: G.my, s, kinds });
  if (L.s < s) { s = L.s; G = geo(s); L = matLayout(counts, W, { my: G.my, s, kinds }); }
  const head = add(stage, h('div', 'u3-head c', K(qT(d, true))), W / 2, 38);
  const frames = {}; kinds.forEach((k) => { frames[k] = zoneFrame(stage, L, k); hide(frames[k]); });
  const labA = add(stage, h('div', 'u3-blab', K(polyT(A, true))), 22, G.yA - TX * s / 2);
  const labB = add(stage, h('div', 'u3-blab', K(`${sub ? '-' : '+'}(${polyT(B, true)})`)), 22, G.yB - TX * s / 2);
  const rowA = tileRow(stage, groupsOf(A), LX, G.yA, s, { gg: GG }), rowB = tileRow(stage, groupsOf(B), LX, G.yB, s, { gg: GG });
  const tA = rowA.flatMap((g) => g.els), tB = rowB.flatMap((g) => g.els), all = [...tA, ...tB];
  hide(...all);
  const tallies = {}; kinds.forEach((k) => { const z = L.zones[k]; tallies[k] = add(stage, h('div', 'u3-tally c', K(R[k] ? termT(R[k], k, true, true) : '0')), z.x + z.w / 2, L.bot + 34); hide(tallies[k]); });
  const res = add(stage, h('div', 'u3-res c', K(`=${polyT(R, true)}`)), W / 2, L.bot + 90); hide(res);
  const P = {}, N = {};
  const assign = () => {
    kinds.forEach((k) => { P[k] = []; N[k] = []; });
    all.forEach((e) => { (e._s > 0 ? P : N)[e._k].push(e); });
  };
  const steps = [{
    cap: `Model each polynomial: ${T(polyT(A))} on top, ${T(polyT(B))} below. <b>Shaded</b> tiles are positive; <b>unshaded</b> tiles are negative.`,
    run: (c) => Promise.all(all.map((e, i) => c.pop(e, 320, { delay: i * 35 })))
  }];
  if (sub) steps.push({
    cap: `Subtracting is <b>adding the opposite</b>, so <b>flip every tile</b> of the second polynomial: shaded ↔ unshaded. ${T(`-(${polyT(B)})`)} becomes ${T(`+(${polyT(Bf)})`)}.`,
    run: async (c) => {
      await Promise.all(tB.map(async (e, i) => {
        await c.anim(e, [{ transform: 'perspective(400px) rotateY(0deg)' }, { transform: 'perspective(400px) rotateY(90deg)' }], 230, { delay: i * 55, easing: 'ease-in' });
        flipTile(e);
        await c.anim(e, [{ transform: 'perspective(400px) rotateY(-90deg)' }, { transform: 'perspective(400px) rotateY(0deg)' }], 230, { easing: 'ease-out' });
      }));
      labB.innerHTML = K(`+(${polyT(Bf, true)})`);
      await c.anim(labB, [{ transform: 'translateY(-50%) scale(1)' }, { transform: 'translateY(-50%) scale(1.15)' }, { transform: 'translateY(-50%) scale(1)' }], 380);
    }
  });
  steps.push({
    cap: `<b>Gather like tiles</b>: same shape, same group. Shaded tiles go <b>above</b> the line and unshaded tiles <b>below</b> it, so any zero pairs line up.`,
    run: async (c) => {
      assign();
      const moves = [];
      kinds.forEach((k) => { P[k].forEach((e, i) => moves.push([e, L.pos(k, 1, i)])); N[k].forEach((e, i) => moves.push([e, L.pos(k, -1, i)])); });
      await Promise.all([c.anim(labA, [{ opacity: 1 }, { opacity: 0 }], 300), c.anim(labB, [{ opacity: 1 }, { opacity: 0 }], 300),
        ...kinds.map((k) => c.fadeIn(frames[k], 400, { from: 'none' })),
        ...moves.map(([e, p], i) => c.anim(e, [{ left: e.style.left, top: e.style.top }, { left: p.x + 'px', top: p.y + 'px' }], 800, { delay: 200 + i * 22 }))]);
    }
  });
  const pairK = kinds.filter((k) => counts[k].p && counts[k].n);
  if (!pairK.length) steps.push({
    cap: `Look for <b>zero pairs</b>: a shaded and an unshaded tile of the <b>same shape</b>. There are none here: each group is all shaded or all unshaded, so nothing cancels.`,
    run: (c) => Promise.all(kinds.map((k) => c.anim(frames[k], [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], 400)))
  });
  pairK.forEach((k) => {
    const m = Math.min(counts[k].p, counts[k].n), kt = KT[k];
    steps.push({
      cap: `<b>${m === 1 ? 'One zero pair' : word(m)[0].toUpperCase() + word(m).slice(1) + ' zero pairs'}</b> in the ${KNAMES(k, 2)}: each shaded tile cancels the unshaded tile below it, because ${T(`${kt}+(-${kt})=0`)}. Remove them.`,
      run: (c) => { assign(); return cancelPairs(c, stage, L, P[k], N[k], k); }
    });
  });
  const leftTxt = kinds.map((k) => { const v = R[k] || 0, a = Math.abs(v); return v ? `${word(a)} ${v > 0 ? 'shaded' : 'unshaded'} ${KNAMES(k, a)} → ${T(termT(v, k, true))}` : `no ${KNAMES(k, 2)} → ${T('0')}`; });
  steps.push({
    cap: `<b>Count what’s left:</b> ${leftTxt.join('; ')}. So ${T(qT(d) + '=' + polyT(R))}.`,
    run: async (c) => { await Promise.all(kinds.map((k, i) => c.pop(tallies[k], 380, { delay: i * 160 }))); await c.pop(res, 450); }
  });
  return steps;
}
const addTiles = {
  title: 'Add with tiles: gather, cancel, count',
  height: 418,
  choices: [{ v: 'a1', label: tex(qT(COMB.a1)) }, { v: 'a2', label: tex(qT(COMB.a2)) }, { sep: 'Example 6 check:' }, { v: 'e6a', label: '(a)' }],
  intro: (k) => `Add ${T(qT(COMB[k]))} with algebra tiles.`,
  make(stage, key, ex) { return combineMake(stage, COMB[key], ex.W); }
};
const subTiles = {
  title: 'Subtract by flipping: add the opposite',
  height: 418,
  choices: [{ v: 's1', label: tex(qT(COMB.s1)) }, { v: 's2', label: tex(qT(COMB.s2)) }, { sep: 'Example 6 check:' }, { v: 'e6b', label: '(b)' }, { sep: 'Example 7 check:' }, { v: 'e7b', label: '(b)' }],
  intro: (k) => `Subtract ${T(qT(COMB[k]))}. The minus sign in front of the bracket applies to <b>every</b> term inside it.`,
  make(stage, key, ex) { return combineMake(stage, COMB[key], ex.W); }
};

/* ============ 5. Collect like terms: one family at a time ============ */
const FT = { x2: 'x^2', x: 'x', 1: '', xy: 'xy', p: 'p', q: 'q', r: 'r', y2: 'y^2', y: 'y', m3n: 'm^3n', m2n: 'm^2n', mn2: 'mn^2' };
const FCOL = ['#0d6a64', '#a3610a', '#3558a0', '#7b4fc4'];
const LT = {
  sock: { name: 'the warm-up socks', groups: [{ s: 1, t: [[3, 'x'], [-2, 'x2'], [5, '1'], [1, 'x'], [7, 'x2'], [-4, '1'], [1, 'xy'], [-6, 'x'], [1, 'x2'], [-3, '1']] }], fams: ['x2', 'xy', 'x', '1'] },
  e7a: { groups: [{ s: 1, br: true, t: [[5, 'p'], [-3, 'q'], [4, 'r']] }, { s: 1, br: true, t: [[2, 'q'], [-5, 'p'], [-7, 'r']] }], fams: ['p', 'q', 'r'] },
  e7b: { groups: [{ s: 1, br: true, t: [[6, 'x2'], [-5, 'x'], [4, '1']] }, { s: -1, br: true, t: [[3, 'x2'], [-8, 'x'], [-2, '1']] }], fams: ['x2', 'x', '1'] },
  e8a: { groups: [{ s: 1, t: [[7, 'y'], [-3, 'y2'], [4, '1'], [-5, 'y2'], [9, '1'], [-2, 'y']] }], fams: ['y2', 'y', '1'] },
  e8b: { groups: [{ s: 1, t: [[1, 'm2n'], [-1, 'mn2'], [5, 'm3n'], [-6, 'mn2'], [4, 'm2n']] }], fams: ['m3n', 'm2n', 'mn2'] }
};
const ftT = (c, f, first, col) => { const a = Math.abs(c); let b = f === '1' ? String(a) : (a === 1 ? '' : a) + FT[f]; if (col) b = tc(col, b); return (c < 0 ? '-' : first ? '' : '+') + b; };
const ltQ = (d) => d.groups.map((g, gi) => (gi ? (g.s < 0 ? '-' : '+') : '') + (g.br ? '(' : '') + g.t.map(([c, f], i) => ftT(c, f, i === 0 && (gi === 0 || g.br))).join('') + (g.br ? ')' : '')).join('');
const ltSum = (d) => { const S = {}; d.groups.forEach((g) => g.t.forEach(([c, f]) => (S[f] = (S[f] || 0) + g.s * c))); return S; };
const ltRes = (d) => { const S = ltSum(d), out = []; d.fams.forEach((f) => { if (S[f]) out.push(ftT(S[f], f, !out.length)); }); return out.length ? out.join('') : '0'; };
const likeTerms = {
  title: 'Collect like terms: one family at a time',
  height: 446,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'sock', label: 'Warm-up socks' }, { sep: 'Example 7 check:' }, { v: 'e7a', label: '(a)' }, { v: 'e7b', label: '(b)' }, { sep: 'Example 8 check:' }, { v: 'e8a', label: '(a)' }, { v: 'e8b', label: '(b)' }],
  intro: (k) => `Simplify ${T(ltQ(LT[k]))}. <b>Like terms</b> have the same variable(s) with the same exponent(s): sort the terms into families.`,
  make(stage, key, ex) {
    const W = ex.W, d = LT[key], S = ltSum(d), FIX = { x2: KCOL.x2, y2: KCOL.x2, x: KCOL.x, y: KCOL.x, 1: KCOL[1], xy: '#7b4fc4' }, colOf = (f) => FIX[f] || FCOL[d.fams.indexOf(f) % FCOL.length];
    const row = add(stage, h('div', 'u3-ltrow c'), W / 2, 46);
    const terms = [], ops = [];
    const span = (html, cls) => { const e = h('span', cls, html); row.appendChild(e); return e; };
    d.groups.forEach((g, gi) => {
      if (gi) ops.push(span(K(g.s < 0 ? '{}-{}' : '{}+{}'), 'u3-ltop'));
      if (g.br) ops.push(span(K('('), 'u3-ltop'));
      g.t.forEach(([c, f], i) => { const first = i === 0 && (gi === 0 || g.br); terms.push({ el: span(K((first ? '' : '{}') + ftT(c, f, first)), 'u3-ltt'), c, f, g, first, gi }); });
      if (g.br) ops.push(span(K(')'), 'u3-ltop'));
    });
    if (row.offsetWidth > W - 16) row.style.fontSize = Math.floor(32 * (W - 16) / row.offsetWidth) + 'px'; // the 10 warm-up socks: shrink the row to fit
    const NF = d.fams.length, gap = 16, bw = Math.min(250, (W - 40 - gap * (NF - 1)) / NF), bx = (W - (bw * NF + gap * (NF - 1))) / 2;
    const bins = d.fams.map((f, i) => {
      const terms_ = terms.filter((t) => t.f === f);
      const b = add(stage, h('div', 'u3-bin'), bx + i * (bw + gap), 112); b.style.width = bw + 'px'; b.style.setProperty('--fc', colOf(f));
      b.innerHTML = `<div class="u3-bin-h">${f === '1' ? 'numbers' : K(FT[f])}</div><div class="u3-bin-l"></div><div class="u3-bin-s"></div>`;
      hide(b); return { f, b, terms: terms_, l: b.querySelector('.u3-bin-l'), s: b.querySelector('.u3-bin-s') };
    });
    const res = add(stage, h('div', 'u3-res c', K('=' + ltRes(d))), W / 2, 394); hide(res);
    const k = () => { const sr = stage.getBoundingClientRect(); return sr.width / stage.offsetWidth || 1; };
    const steps = [];
    const brs = d.groups.some((g) => g.br), minus = d.groups.some((g) => g.s < 0);
    if (brs) steps.push({
      cap: minus ? `Remove the brackets. A <b>minus</b> in front of a bracket <b>changes the sign of every term inside</b>: ${T(`-(${d.groups.find((g) => g.s < 0).t.map(([c, f], i) => ftT(c, f, i === 0)).join('')})`)} becomes ${T(d.groups.find((g) => g.s < 0).t.map(([c, f]) => ftT(-c, f, false)).join(''))}.`
        : `Remove the brackets. A <b>plus</b> in front of a bracket changes nothing.`,
      run: async (c) => {
        const kk = k(), before = terms.map((t) => t.el.getBoundingClientRect().left);
        ops.forEach((o) => (o.style.display = 'none'));
        const flipped = [];
        terms.forEach((t) => {
          if (t.g.s < 0) { t.c = -t.c; flipped.push(t); }
          const first = t.gi === 0 && t.first;
          t.el.innerHTML = K((first ? '' : '{}') + ftT(t.c, t.f, first)); t.first = first;
        });
        const after = terms.map((t) => t.el.getBoundingClientRect().left);
        await Promise.all([...terms.map((t, i) => c.anim(t.el, [{ transform: `translateX(${(before[i] - after[i]) / kk}px)` }, { transform: 'none' }], 520)),
          ...flipped.map((t, i) => { t.el.classList.add('flip'); return c.anim(t.el, [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 420, { delay: 520 + i * 120 }); })]);
      }
    });
    steps.push({
      cap: `Colour each term by its <b>family</b>: ${d.fams.map((f) => (f === '1' ? 'numbers' : T(FT[f]))).join(', ')}. ${key === 'sock' ? `The ${T('xy')} sock is the only one in its family.` : key === 'e8b' ? `Look closely: ${T('m^2n')} and ${T('mn^2')} have the same letters but <b>different exponents</b>, so they are <b>not</b> like terms.` : 'Same letters, same exponents.'}`,
      run: async (c) => {
        terms.forEach((t) => { t.el.classList.add('fam'); t.el.style.setProperty('--fc', colOf(t.f)); });
        await Promise.all([...terms.map((t, i) => c.anim(t.el, [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], 320, { delay: i * 60 })), ...bins.map((b, i) => c.fadeIn(b.b, 350, { delay: 200 + i * 90 }))]);
      }
    });
    bins.forEach((b) => {
      const sum = S[b.f] || 0, list = b.terms.map((t, i) => ftT(t.g.s * t.c, t.f, i === 0)).join(''); // signs after the brackets come off
      const one = b.terms.length === 1;
      steps.push({
        cap: one ? `${b.f === '1' ? 'Numbers' : T(FT[b.f])}: only one term, ${T(list)}, so it stays as it is.`
          : sum ? `${b.f === '1' ? '<b>Numbers:</b>' : `<b>${T(FT[b.f])}-terms:</b>`} add the coefficients, ${T(`${list}=${ftT(sum, b.f, true)}`)}. The ${b.f === '1' ? 'answer is a number' : 'variable part stays ' + T(FT[b.f])}.`
            : `${b.f === '1' ? '<b>Numbers:</b>' : `<b>${T(FT[b.f])}-terms:</b>`} ${T(`${list}=0`)}. They <b>cancel</b> completely, so there’s no ${b.f === '1' ? 'constant' : T(FT[b.f])} term in the answer.`,
        run: async (c) => {
          bins.forEach((x) => x.b.classList.toggle('on', x === b));
          b.l.innerHTML = K(b.terms.map((t, i) => ftT(t.c, t.f, i === 0, colOf(t.f))).join(''));
          const lw = b.l.firstElementChild ? b.l.firstElementChild.offsetWidth : 0; if (lw > bw - 14) b.l.style.fontSize = Math.floor(25 * (bw - 14) / lw) + 'px';
          hide(b.l, b.s);
          await Promise.all(b.terms.map((t, i) => fly(c, stage, t.el, b.l, K(ftT(t.c, t.f, false, colOf(t.f))), { fs: 30, delay: i * 140 })));
          b.terms.forEach((t) => t.el.classList.add('used'));
          b.s.innerHTML = K('=' + (sum ? ftT(sum, b.f, true) : '0')); if (!sum) b.b.classList.add('zero');
          await c.fadeIn(b.l, 250); await c.pop(b.s, 400);
        }
      });
    });
    steps.push({
      cap: `Put the families back together${d.fams.some((f) => !S[f]) ? ' (a family that cancelled to 0 disappears)' : ''}: ${T(ltRes(d))}.${key === 'sock' ? ' Ten socks squash down to <b>four</b>.' : ''}`,
      run: async (c) => { bins.forEach((x) => x.b.classList.remove('on')); await Promise.all([...bins.filter((b) => S[b.f]).map((b, i) => fly(c, stage, b.s, res, b.s.innerHTML, { fs: 30, delay: i * 120 })), c.pop(res, 450, { delay: 450 })]); }
    });
    return steps;
  }
};

/* ============ 1. Polynomial or not? (check every exponent) ============ */
const PC = {
  s1: { terms: [{ t: 'y^2', ex: [['y', '2', 1]] }, { t: '-6y', ex: [['y', '1', 1, 1]] }, { t: '-11', ex: [] }] },
  s2: { terms: [{ t: '\\dfrac{3}{x}', rw: '3x^{-1}', ex: [['x', '-1', 0]] }, { t: '-2', ex: [] }] },
  s3: { terms: [{ t: '0.75m^3', ex: [['m', '3', 1]], co: '0.75' }, { t: '+xyz', ex: [['x', '1', 1, 1], ['y', '1', 1, 1], ['z', '1', 1, 1]] }] },
  a: { terms: [{ t: '\\dfrac{2}{5}mn^3', ex: [['m', '1', 1, 1], ['n', '3', 1]], co: '\\tfrac25' }, { t: '+7', ex: [] }] },
  b: { terms: [{ t: '5x^{2/3}y', ex: [['x', '\\tfrac23', 0], ['y', '1', 1, 1]] }] },
  c: { terms: [{ t: '\\sqrt{3}\\,x^5', ex: [['x', '5', 1]], co: '\\sqrt3' }, { t: '-2x^2', ex: [['x', '2', 1]] }, { t: '+6', ex: [] }] },
  d: { terms: [{ t: '4y^3', ex: [['y', '3', 1]] }, { t: '-7y', ex: [['y', '1', 1, 1]] }, { t: '+2y^{0.5}', ex: [['y', '0.5', 0]] }] },
  e: { terms: [{ t: '\\dfrac{9}{b^2}', rw: '9b^{-2}', ex: [['b', '-2', 0]] }] }
};
const NAMES = ['', 'monomial', 'binomial', 'trinomial'];
const nameOf = (n) => NAMES[n] || 'polynomial';
const pcQ = (k) => PC[k].terms.map((t) => t.t).join('');
const polyCheck = {
  title: 'Polynomial or not? Check every exponent',
  height: 410,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 's1', label: tex('y^2-6y-11') }, { v: 's2', label: tex('\\frac{3}{x}-2') }, { v: 's3', label: tex('0.75m^3+xyz') }, { sep: 'Example 1 check:' }, ...'abcde'.split('').map((k) => ({ v: k, label: '(' + k + ')' }))],
  intro: (k) => `Is ${T(pcQ(k))} a polynomial? Every exponent on a <b>variable</b> must be a <b>positive integer</b> (1, 2, 3, …), and no variable may be in a denominator.`,
  make(stage, key, ex) {
    const W = ex.W, d = PC[key], n = d.terms.length, cw = Math.min(300, (W - 40) / n), x0 = (W - cw * n) / 2;
    const ok = d.terms.every((t) => t.ex.every((e) => e[2]));
    const cols = d.terms.map((t, i) => {
      const cx = x0 + cw * (i + 0.5);
      const box = add(stage, h('div', 'u3-pcbox c', K(i ? '{}' + t.t : t.t)), cx, 62); box._cx = cx;
      const rw = t.rw ? add(stage, h('div', 'u3-pcrw c', K('=' + t.rw)), cx, 142) : null;
      const list = add(stage, h('div', 'u3-pclist'), cx - cw / 2 + 10, t.rw ? 176 : 118); list.style.width = (cw - 20) + 'px';
      const items = [];
      if (t.co) items.push(['ok', `coefficient ${K(t.co)} is just a number`]);
      t.ex.forEach(([v, e, good, hid]) => items.push([good ? 'ok' : 'no', `${K(v)}: exponent ${K(e)}${hid ? ' <span class="muted">(hidden 1)</span>' : ''} ${good ? '✓' : '✗'}`]));
      if (!t.ex.length) items.push(['ok', 'a number: no variable ✓']);
      const els = items.map(([cls, html]) => { const e = h('div', 'u3-pcit ' + cls, html); list.appendChild(e); return e; });
      hide(rw, ...els);
      return { box, rw, els, t };
    });
    { const ws = cols.map((x) => x.box.offsetWidth - 28), tot = ws.reduce((a, b) => a + b, 0); let x = (W - tot) / 2; cols.forEach((col, i) => { col.box.style.left = (x + ws[i] / 2) + 'px'; x += ws[i]; }); }
    const stamp = add(stage, h('div', 'u3-stamp ' + (ok ? 'yes' : 'no'), ok ? `POLYNOMIAL<small>${n} term${n > 1 ? 's' : ''}: a ${nameOf(n)}</small>` : 'NOT A POLYNOMIAL<small>an exponent on a variable isn’t a positive integer</small>'), W / 2, 330);
    stamp.style.translate = '-50% -50%'; hide(stamp);
    const steps = [{
      cap: n > 1 ? `Split it into <b>terms</b> at the ${T('+')} and ${T('-')} signs: ${plural(n, 'term')}. Each sign stays with the term after it.` : `There are no ${T('+')} or ${T('-')} signs between pieces, so this is just <b>one term</b>.`,
      run: (c) => Promise.all(cols.map((x, i) => { x.box.classList.add('on'); x.box.innerHTML = K(x.t.t); return c.anim(x.box, [{ left: x.box.style.left }, { left: x.box._cx + 'px' }], 600, { delay: i * 60 }); }))
    }];
    cols.forEach((x) => {
      const bad = x.t.ex.find((e) => !e[2]);
      steps.push({
        cap: (x.t.rw ? `${T(x.t.t)} has a variable in the <b>denominator</b>. Rewrite it with a negative exponent: ${T(x.t.t + '=' + x.t.rw)}. ` : '')
          + (bad ? `The exponent on ${T(bad[0])} is ${T(bad[1])}: <b>not a positive integer</b>.`
            : !x.t.ex.length ? `${T(x.t.t.replace(/^\+/, ''))} is just a number (a <b>constant term</b>). That’s allowed.`
              : `${x.t.co ? `${T(x.t.co)} is only the coefficient (any number is fine there). ` : ''}Every exponent on a variable is a positive integer${x.t.ex.some((e) => e[3]) ? `; a letter with no exponent has exponent ${T('1')}` : ''}. ✓`),
        run: async (c) => {
          if (x.rw) await c.fadeIn(x.rw, 350);
          for (const e of x.els) await c.fadeIn(e, 260, { from: 'translateX(-8px)' });
          x.box.classList.add(x.t.ex.every((e) => e[2]) ? 'good' : 'bad');
        }
      });
    });
    steps.push({
      cap: ok ? `Every term passes, so ${T(pcQ(key))} <b>is a polynomial</b>. It has ${plural(n, 'term')}, so it’s a <b>${nameOf(n)}</b>.`
        : `One bad exponent is enough: ${T(pcQ(key))} is <b>not a polynomial</b>${n > 1 ? ', so we don’t name it by its terms' : ''}.`,
      run: (c) => stampIn(c, stamp)
    });
    return steps;
  }
};

/* ============ 1. The naming machine (count the terms) ============ */
const NM = {
  set1: [
    { t: ['5y'], v: ['y'] }, { t: ['y', '-6'], v: ['y'] }, { t: ['y^2', '+y', '-6'], v: ['y'] },
    { t: ['xyz'], v: ['x', 'y', 'z'], note: `${T('xyz')} is <b>one</b> term: a product, with no ${T('+')} or ${T('-')} inside.` },
    { t: ['-\\tfrac{1}{3}pq'], v: ['p', 'q'], note: `The ${T('-')} in front belongs to the term (there’s nothing before it to cut from).` },
    { t: ['x^3', '-2x^2', '+x', '-5'], v: ['x'], note: 'Four or more terms: we just call it a <b>polynomial</b>.' }
  ],
  ex2: [
    { t: ['7a', '+5bc'], v: ['a', 'b', 'c'], note: `${T('5bc')} brings <b>two</b> variables, so there are three in all.` },
    { t: ['3p', '-5q', '+8r'], v: ['p', 'q', 'r'] },
    { t: ['y^2', '-4y', '-9'], v: ['y'], note: `${T('y^2')} and ${T('4y')} use the <b>same</b> variable: count it once.` },
    { t: ['\\sqrt{5}\\,m'], v: ['m'], note: `${T('\\sqrt5')} is just a number, the coefficient.` },
    { t: ['5m^3', '+2m^2n', '+4n^2', '-7'], v: ['m', 'n'] }
  ]
};
const nameMachine = {
  title: 'The naming machine: cut at every + and −',
  height: 470,
  value: 'set1',
  choices: [{ v: 'set1', label: 'Six polynomials' }, { sep: 'Example 2 check:' }, { v: 'ex2', label: 'the table' }],
  intro: (k) => k === 'ex2' ? 'Feed in the five polynomials from Example 2. The machine counts the <b>variables</b> and the <b>terms</b>, then names each one.' : 'Each polynomial goes through the machine: it is <b>cut at every + or − sign</b> between terms, the pieces are counted, and it drops into the right bin.',
  make(stage, key, ex) {
    const W = ex.W, list = NM[key];
    const belt = add(stage, h('div', 'u3-belt'), 20, 34); belt.style.width = (W - 40) + 'px';
    const vline = add(stage, h('div', 'u3-vars c'), W / 2, 158); hide(vline);
    const BN = 4, gap = 14, bw = (W - 40 - gap * (BN - 1)) / BN, by = 196;
    const bins = ['Monomial', 'Binomial', 'Trinomial', 'Polynomial'].map((nm, i) => {
      const b = add(stage, h('div', 'u3-nbin', `<div class="u3-nbin-h"><b>${nm}</b><i>${i < 3 ? plural(i + 1, 'term') : '4 or more terms'}</i></div><div class="u3-nbin-c"></div>`), 20 + i * (bw + gap), by);
      b.style.width = bw + 'px'; return { b, c: b.querySelector('.u3-nbin-c') };
    });
    let cur = [];
    return list.map((it, idx) => {
      const n = it.t.length, bi = Math.min(n, 4) - 1;
      return {
        cap: `${T(it.t.join(''))}: ${n > 1 ? `cut at ${plural(n - 1, 'sign')} → <b>${plural(n, 'term')}</b>` : '<b>no cuts</b> → <b>1 term</b>'}, so it’s a <b>${nameOf(n)}</b>. Variables: ${it.v.map((v) => T(v)).join(', ')} (${it.v.length}). ${it.note || ''}`,
        run: async (c) => {
          cur.forEach((e) => e.remove()); cur = [];
          const pieces = it.t.map((t) => { const e = add(stage, h('div', 'u3-piece c', K(t)), 0, 92); hide(e); cur.push(e); return e; });
          const ws = pieces.map((e) => e.offsetWidth), tot = ws.reduce((a, b) => a + b, 0);
          let x = (W - tot) / 2; pieces.forEach((e, i) => { e.style.left = (x + ws[i] / 2) + 'px'; x += ws[i]; });
          vline.innerHTML = `variables: ${it.v.map((v) => K(v)).join(', ')} <b>(${it.v.length})</b>`; hide(vline);
          await Promise.all(pieces.map((e) => c.anim(e, [{ opacity: 0, transform: 'translateX(-60px)' }, { opacity: 1, transform: 'none' }], 450)));
          // cut at each sign between pieces, then spread apart
          if (n > 1) {
            const cuts = pieces.slice(1).map((e) => { const cut = add(stage, h('div', 'u3-cut', '<span>✂</span>'), px(e, 'left') - e.offsetWidth / 2 - 2, 52); hide(cut); cur.push(cut); return cut; });
            await Promise.all(cuts.map((e, i) => c.anim(e, [{ opacity: 0, transform: 'translateY(-20px)' }, { opacity: 1, transform: 'none' }], 300, { delay: i * 160 })));
            const spread = 38, mid = (n - 1) / 2;
            await Promise.all([...pieces.map((e, i) => c.anim(e, [{ left: e.style.left }, { left: (px(e, 'left') + (i - mid) * spread) + 'px' }], 420)),
              ...cuts.map((e, i) => c.anim(e, [{ left: e.style.left }, { left: (px(e, 'left') + (i + 0.5 - mid) * spread) + 'px' }], 420))]);
          }
          const nums = pieces.map((e, i) => { const b = add(stage, h('div', 'u3-cnt c', String(i + 1)), px(e, 'left'), 50); hide(b); cur.push(b); return b; });
          for (const b of nums) await c.pop(b, 260);
          await c.fadeIn(vline, 300);
          const chip = h('div', 'u3-nchip', `${K(it.t.join(''))}<small>${plural(it.v.length, 'variable')}</small>`);
          bins[bi].c.appendChild(chip); hide(chip);
          { const maxW = bins[bi].b.clientWidth - 14; if (chip.offsetWidth > maxW) chip.style.fontSize = Math.floor(21 * maxW / chip.offsetWidth) + 'px'; }
          bins.forEach((b, i) => b.b.classList.toggle('on', i === bi));
          await fly(c, stage, pieces[Math.floor((n - 1) / 2)], chip, K(it.t.join('')), { fs: 28, ms: 650 });
          await c.pop(chip, 360);
          void idx;
        }
      };
    });
  }
};

/* ============ 2. The degree detector ============ */
const DG = {
  m1: [{ t: '3x^4', v: [['x', 4]] }],
  m2: [{ t: '-\\tfrac{5}{6}ab^2c^3', v: [['a', 1], ['b', 2], ['c', 3]] }],
  p1: [{ t: '2x^2y^3', v: [['x', 2], ['y', 3]] }, { t: '-4x^5', v: [['x', 5]] }, { t: '+xy^4', v: [['x', 1], ['y', 4]] }, { t: '-8', v: [] }],
  p2: [{ t: '5a^2b', v: [['a', 2], ['b', 1]] }, { t: '-3ab^3', v: [['a', 1], ['b', 3]] }, { t: '+a^4b^2', v: [['a', 4], ['b', 2]] }, { t: '-9', v: [] }],
  e3a: [{ t: 'y^3', v: [['y', 3]] }, { t: '-5', v: [] }],
  e3b: [{ t: 'm^2', v: [['m', 2]] }, { t: '+mn', v: [['m', 1], ['n', 1]] }, { t: '-8', v: [] }],
  e3c: [{ t: '7x^5', v: [['x', 5]], co: '7' }],
  e3d: [{ t: 'x^7y^3', v: [['x', 7], ['y', 3]] }, { t: '+xy', v: [['x', 1], ['y', 1]] }]
};
const dgQ = (k) => DG[k].map((t) => t.t).join('');
const DGNOTE = {
  e3a: `Check the order: 2 terms, degree 3, one variable ✓`,
  e3b: `Check the order: 3 terms, two variables, and a constant term ✓`,
  e3c: `Check the order: one term, degree 5, coefficient 7 ✓`,
  e3d: `Check the order: 2 terms, degree 10, and <b>each</b> term contains two variables ✓`
};
const degree = {
  title: 'The degree detector',
  height: 430,
  value: 'p1',
  choices: [{ v: 'm1', label: tex('3x^4') }, { v: 'm2', label: tex('-\\frac56ab^2c^3') }, { v: 'p1', label: tex('2x^2y^3-4x^5+xy^4-8') }, { v: 'p2', label: tex('5a^2b-3ab^3+a^4b^2-9') },
    { sep: 'Example 3 check:' }, { v: 'e3a', label: '(a)' }, { v: 'e3b', label: '(b)' }, { v: 'e3c', label: '(c)' }, { v: 'e3d', label: '(d)' }],
  intro: (k) => `Find the degree of ${T(dgQ(k))}. A term’s degree is the <b>sum of the exponents on its variables</b>; the polynomial’s degree is the <b>highest</b> term degree.`,
  make(stage, key, ex) {
    const W = ex.W, d = DG[key], n = d.length, cw = Math.min(250, (W - 40) / n), x0 = (W - cw * n) / 2;
    const degs = d.map((t) => t.v.reduce((s, [, e]) => s + e, 0)), top = Math.max(...degs);
    const cols = d.map((t, i) => {
      const cx = x0 + cw * (i + 0.5);
      const box = add(stage, h('div', 'u3-dgbox c', K(t.t)), cx, 50);
      const list = add(stage, h('div', 'u3-dglist c'), cx, 124);
      list.innerHTML = t.v.length ? t.v.map(([v, e]) => `<div>${K(v)}<i class="ar">→</i><b>${e}</b>${e === 1 && !new RegExp(v + '\\^').test(t.t) ? '<em>hidden 1</em>' : ''}</div>`).join('') : '<div class="muted">no variable</div>';
      const sum = add(stage, h('div', 'u3-dgsum c', t.v.length > 1 ? K(t.v.map(([, e]) => e).join('+')) : '&nbsp;'), cx, 196);
      const badge = add(stage, h('div', 'u3-dgb c', String(degs[i])), cx, 238);
      hide(list, sum, badge); return { box, list, sum, badge };
    });
    const vars = [...new Set(d.flatMap((t) => t.v.map(([v]) => v)))], cst = d.find((t) => !t.v.length);
    const spec = add(stage, h('div', 'u3-spec'), 30, 300); spec.style.width = (W - 60) + 'px';
    spec.innerHTML = [
      ['Terms', `${n} → <b>${nameOf(n)}</b>`],
      ['Variables', `${vars.map((v) => K(v)).join(', ')} <span class="muted">(${vars.length})</span>`],
      ['Degree', `<b>${top}</b>`],
      n === 1 ? ['Coefficient', K(d[0].co || d[0].t.match(/^-?\\tfrac\{\d\}\{\d\}|^-?\d+/)?.[0] || '1')] : ['Constant term', cst ? K(cst.t.replace(/^\+/, '')) : 'none']
    ].map(([a, b]) => `<div><i class="k">${a}</i>${b}</div>`).join('');
    hide(spec);
    const steps = d.map((t, i) => ({
      cap: !t.v.length ? `${T(t.t.replace(/^\+/, ''))} has no variable, so its degree is <b>0</b> (it’s the <b>constant term</b>).`
        : t.v.length === 1 ? `${T(t.t.replace(/^\+/, ''))}: one variable, exponent ${t.v[0][1]}. Degree <b>${degs[i]}</b>.${t.v[0][1] === 1 ? ` (${T(t.v[0][0])} means ${T(t.v[0][0] + '^1')}.)` : ''}`
          : `${T(t.t.replace(/^\+/, ''))}: add the exponents, ${T(t.v.map(([, e]) => e).join('+') + '=' + degs[i])}.${t.v.some(([v, e]) => e === 1 && !new RegExp(v + '\\^').test(t.t)) ? ' A letter with no exponent counts <b>1</b>.' : ''} Degree <b>${degs[i]}</b>.`,
      run: async (c) => {
        cols[i].box.classList.add('on');
        await c.fadeIn(cols[i].list, 320);
        await c.fadeIn(cols[i].sum, 260);
        await c.pop(cols[i].badge, 380);
      }
    }));
    const tops = degs.filter((g) => g === top).length;
    steps.push({
      cap: n === 1 ? `A monomial’s degree is just its own: <b>degree ${top}</b>.${DGNOTE[key] ? ' ' + DGNOTE[key] + '.' : ''}`
        : `${DGNOTE[key] ? DGNOTE[key] + '. ' : ''}The <b>highest</b> term degree is <b>${top}</b>${tops > 1 ? ` (${tops === n - (cst ? 1 : 0) ? 'every variable term ties!' : 'a tie: that’s fine'})` : ''}, so the polynomial has <b>degree ${top}</b>. Don’t add all the exponents together.${cst ? ` Its constant term is ${T(cst.t.replace(/^\+/, ''))}.` : ''}`,
      run: async (c) => {
        cols.forEach((x, i) => x.badge.classList.toggle(degs[i] === top ? 'top' : 'low', true));
        await Promise.all([...cols.filter((x, i) => degs[i] === top).map((x) => c.anim(x.badge, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], 450)), c.fadeIn(spec, 400, { delay: 300 })]);
      }
    });
    return steps;
  }
};

/* ============ 3. Line up by power: descending, ascending, leading coefficient ============ */
const ORD = {
  ex4: { v: 'x', terms: [{ s: 1, b: '3x', p: 1, c: '3' }, { s: -1, b: '5x^3', p: 3, c: '-5' }, { s: 1, b: '9', p: 0, c: '9' }, { s: 1, b: '\\tfrac{2x^2}{3}', alt: '\\tfrac{2}{3}x^2', p: 2, c: '\\tfrac{2}{3}' }] },
  o1: { v: 'x', terms: [{ s: 1, b: '4', p: 0, c: '4' }, { s: -1, b: 'x^2', p: 2, c: '-1' }, { s: 1, b: '7x', p: 1, c: '7' }] },
  o2: { v: 't', terms: [{ s: 1, b: 't^2', p: 2, c: '1' }, { s: -1, b: '8', p: 0, c: '-8' }, { s: 1, b: '2t^5', p: 5, c: '2' }, { s: -1, b: 't', p: 1, c: '-1' }] }
};
const D = (t) => t.replace(/\\tfrac/g, '\\dfrac');
const lineT = (ts, alt) => ts.map((t, i) => (t.s < 0 ? '-' : i ? '+' : '') + (alt && t.alt ? t.alt : t.b)).join('');
const order = {
  title: 'Line up the terms by power',
  height: 446,
  value: 'o1',
  choices: [{ v: 'o1', label: tex(lineT(ORD.o1.terms)) }, { v: 'o2', label: tex(lineT(ORD.o2.terms)) }, { sep: 'Example 4 check:' }, { v: 'ex4', label: tex(lineT(ORD.ex4.terms)) }],
  intro: (k) => `Rearrange ${T(lineT(ORD[k].terms))}. Each term is a card that carries its <b>own sign</b> with it.`,
  make(stage, key, ex) {
    const W = ex.W, d = ORD[key], v = d.v, ts = d.terms, maxP = Math.max(...ts.map((t) => t.p));
    const LW = 104, n = ts.length, cg = 18, cw = Math.min(170, (W - LW - 30 - cg * (n - 1)) / n), ch = 64;
    const step = Math.min(56, 190 / maxP), base = 232;
    const slotX = (i) => LW + 10 + i * (cw + cg);
    for (let p = 0; p <= maxP; p++) {
      const g = add(stage, h('div', 'u3-ogrid', `<span class="gl">${K(p ? (p === 1 ? v : v + '^' + p) : v + '^0')}</span>`), 14, base - p * step + ch / 2); g.style.width = (W - 28) + 'px'; g._p = p;
    }
    const cards = ts.map((t, i) => {
      const e = add(stage, h('div', 'u3-ocard', `<div class="u3-ot">${K((t.s < 0 ? '-' : '+') + t.b)}</div><div class="u3-op">power ${t.p}</div>`), slotX(i), base); e.style.width = cw + 'px'; e.style.height = ch + 'px'; e._t = t; return e;
    });
    cards.forEach((e) => hide(e.querySelector('.u3-op')));
    stage.querySelectorAll('.u3-ogrid').forEach((g) => hide(g));
    const line = add(stage, h('div', 'u3-oline c'), W / 2, 338); hide(line);
    const tags = add(stage, h('div', 'u3-otags c'), W / 2, 400); hide(tags);
    const desc = ts.map((t, i) => [t, i]).sort((a, b) => b[0].p - a[0].p), asc = [...desc].reverse();
    const moveTo = (c, ord) => Promise.all(ord.map(([t, i], j) => { const e = cards[i]; return c.anim(e, [{ left: e.style.left, top: e.style.top }, { left: slotX(j) + 'px', top: (base - t.p * step) + 'px' }], 700, { delay: j * 70 }); }));
    const lead = desc[0][0], cst = ts.find((t) => t.p === 0), x2 = ts.find((t) => t.alt);
    const steps = [{
      cap: `Find the <b>power of ${T(v)}</b> in each term. A number on its own has power ${T('0')}${cst ? `: ${T(cst.b + '=' + cst.b + v + '^0')}, since ${T(v + '^0=1')}` : ''}. Lift each card to its height.`,
      run: async (c) => {
        await Promise.all([...[...stage.querySelectorAll('.u3-ogrid')].filter((g) => g._p <= maxP).map((g, i) => c.fadeIn(g, 300, { delay: i * 50, from: 'none' })), ...cards.map((e, i) => c.fadeIn(e.querySelector('.u3-op'), 300, { delay: i * 80 }))]);
        await Promise.all(cards.map((e, i) => c.anim(e, [{ top: e.style.top }, { top: (base - e._t.p * step) + 'px' }], 600, { delay: i * 80 })));
      }
    }, {
      cap: `<b>Descending order</b>: highest power first, like walking down the stairs. ${T(lineT(desc.map(([t]) => t), true))}${x2 ? ` (${T(x2.b + '=' + x2.alt)})` : ''}.`,
      run: async (c) => { line.innerHTML = K(lineT(desc.map(([t]) => t), true)); await Promise.all([moveTo(c, desc), c.fadeIn(line, 400, { delay: 500 })]); }
    }, {
      cap: `<b>Ascending order</b>: lowest power first, walking up. ${T(lineT(asc.map(([t]) => t), true))}. Same polynomial, just written the other way.`,
      run: async (c) => { line.innerHTML = K(lineT(asc.map(([t]) => t), true)); await Promise.all([moveTo(c, asc), c.fadeIn(line, 400, { delay: 500 })]); }
    }, {
      cap: `The <b>leading coefficient</b> is the coefficient of the <b>highest power</b>: ${T(lead.c)} (from ${T((lead.s < 0 ? '-' : '') + lead.b)}), even though it’s written last here. ${cst ? `The <b>constant term</b> is ${T((cst.s < 0 ? '-' : '') + cst.b)}.` : 'There is no constant term.'}`,
      run: async (c) => {
        const li = ts.indexOf(lead), ci = ts.indexOf(cst);
        cards[li].classList.add('lead'); if (cst) cards[ci].classList.add('cst');
        tags.innerHTML = `<b class="lead">leading coefficient ${K(lead.c)}</b>${cst ? `<b class="cst">constant term ${K((cst.s < 0 ? '-' : '') + cst.b)}</b>` : ''}`;
        await Promise.all([c.pop(cards[li], 380), cst ? c.pop(cards[ci], 380, { delay: 150 }) : null, c.fadeIn(tags, 350, { delay: 250 })]);
      }
    }];
    if (x2) steps.push({
      cap: `The ${T(v + '^2')} term is ${T(D(x2.b))}. Dividing by 3 is multiplying by ${T('\\dfrac13')}, so ${T(D(x2.b + '=' + x2.alt))}: its numerical coefficient is ${T(D(x2.c))}.`,
      run: async (c) => { const e = cards[ts.indexOf(x2)]; e.querySelector('.u3-ot').innerHTML = K('+' + x2.alt); e.classList.add('alt'); await c.pop(e, 380); }
    });
    return steps;
  }
};

/* ======================================================================
 * Static tile figures (Example 5, Example 6(a)) and the legend
 * ====================================================================== */
function renderFigures() {
  document.querySelectorAll('[data-tiles]').forEach((host) => {
    const s = Number(host.dataset.s || 0.8);
    host.classList.add('u3-fig');
    host.dataset.tiles.split(/\s+/).forEach((g) => {
      const [k, n] = g.split(':'), grp = h('div', 'u3-fg');
      for (let i = 0; i < Math.abs(Number(n)); i++) grp.appendChild(tile(k, Math.sign(Number(n)), s, false));
      host.appendChild(grp);
    });
  });
  const leg = document.getElementById('legend'); if (!leg) return;
  const items = [['x2', 'x^2', 'x', 'x'], ['x', 'x', 'x', '1'], ['1', '1', '1', '1']];
  leg.innerHTML = items.map(([k, v, hgt, wid]) => {
    const pos = tile(k, 1, 1, true).outerHTML, neg = tile(k, -1, 1, true).outerHTML;
    return `<div class="u3-lg"><div class="u3-lg-h">${K(tc(KCOL[k], k === '1' ? '1' : KT[k]))}${k === '1' ? '-tile (unit tile)' : '-tile'}</div>
      <div class="u3-lg-row"><div class="u3-lg-t"><div class="u3-dim"><span class="dw">${K(wid)}</span><span class="dh">${K(hgt)}</span>${pos}</div><div class="u3-lg-v">${K('=' + v)}</div><small>shaded</small></div>
      <div class="u3-lg-t"><div class="u3-dim">${neg}</div><div class="u3-lg-v">${K('=-' + v)}</div><small>unshaded</small></div></div>
      <div class="u3-lg-why">${k === 'x2' ? `${K('x')} by ${K('x')}: area ${K('x^2')}` : k === 'x' ? `${K('x')} by ${K('1')}: area ${K('x')}` : `${K('1')} by ${K('1')}: area ${K('1')}`}</div></div>`;
  }).join('');
}

/* ======================================================================
 * The tile mat (try it): add tiles, tap one to remove it, cancel zero pairs, flip
 * ====================================================================== */
function mountMat() {
  const box = document.getElementById('tilemat'); if (!box) return;
  const btns = [['x2', 1], ['x', 1], ['1', 1], ['x2', -1], ['x', -1], ['1', -1]];
  box.innerHTML = `<div class="u3m-ctl no-ink">
      <div class="u3m-add">${btns.map(([k, s]) => `<button class="u3m-b ${s > 0 ? 'pos' : 'neg'}" type="button" data-k="${k}" data-s="${s}" title="Add ${s > 0 ? 'a shaded' : 'an unshaded'} ${k === '1' ? 'unit' : k === 'x2' ? 'x²' : 'x'}-tile"><span class="u3m-ic">${tile(k, s, 0.34, false).outerHTML}</span>${K((s > 0 ? '+' : '-') + KT[k])}</button>`).join('')}</div>
      <div class="u3m-acts"><button class="pill small" type="button" data-a="pairs">Cancel zero pairs</button><button class="pill small" type="button" data-a="flip">Flip all</button><button class="pill small" type="button" data-a="sample">Example 6(a)</button><button class="exb" type="button" data-a="clear" title="Clear the mat" aria-label="Clear the mat"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/></svg></button></div>
    </div>
    <div class="u3m-mat"></div>
    <div class="u3m-read" aria-live="polite"></div>`;
  const mat = box.querySelector('.u3m-mat'), read = box.querySelector('.u3m-read');
  const MAX = 9;
  let tiles = []; // { el, k, s }
  let busy = false;
  const W = () => mat.clientWidth || 900, H = 300;
  let frames = {};
  function layout(animate = true) {
    const counts = {}; KINDS.forEach((k) => (counts[k] = { p: tiles.filter((t) => t.k === k && t.s > 0).length, n: tiles.filter((t) => t.k === k && t.s < 0).length }));
    const L = matLayout(counts, W(), { my: 168, kinds: KINDS, minCols: 3, margin: 24 });
    if (!frames.x2 || frames._s !== L.s || frames._w !== JSON.stringify(KINDS.map((k) => L.zones[k].w))) {
      Object.values(frames).forEach((f) => f && f.remove && f.remove());
      frames = {}; KINDS.forEach((k) => { frames[k] = zoneFrame(mat, L, k); mat.prepend(frames[k]); });
      frames._s = L.s; frames._w = JSON.stringify(KINDS.map((k) => L.zones[k].w));
    }
    KINDS.forEach((k) => {
      [1, -1].forEach((sg) => tiles.filter((t) => t.k === k && t.s === sg).forEach((t, i) => {
        const p = L.pos(k, sg, i), [w, ht] = tdim(k, L.s);
        t.el.style.transition = animate ? 'left .35s, top .35s, width .35s, height .35s' : 'none';
        t.el.style.width = w + 'px'; t.el.style.height = ht + 'px'; t.el.style.fontSize = (k === 'x2' ? 25 : k === 'x' ? 18 : 12) * Math.max(L.s, 0.75) + 'px';
        at(t.el, p.x, p.y);
      }));
    });
    const P = {}; KINDS.forEach((k) => (P[k] = counts[k].p - counts[k].n));
    const pairs = KINDS.reduce((s, k) => s + Math.min(counts[k].p, counts[k].n), 0);
    read.innerHTML = tiles.length ? `On the mat: ${K(polyT(P, true))}${pairs ? ` <span class="u3m-pairs">${plural(pairs, 'zero pair')} still on the mat (worth 0)</span>` : ''}` : '<span class="muted">The mat is empty. Add tiles with the buttons; tap a tile to take it away.</span>';
    box.querySelector('[data-a=pairs]').disabled = !pairs;
    return L;
  }
  function addTile(k, s, animate = true) {
    if (tiles.filter((t) => t.k === k && t.s === s).length >= MAX) return;
    const el = tile(k, s, 1, true, 'button'); el.type = 'button'; el.title = 'Tap to remove';
    const t = { el, k, s }; tiles.push(t); mat.appendChild(el);
    el.addEventListener('click', () => { if (busy) return; tiles = tiles.filter((x) => x !== t); el.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.3)' }], 220).onfinish = () => el.remove(); layout(); });
    layout(animate);
    if (animate) el.animate([{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1)' }], 260);
  }
  box.querySelectorAll('.u3m-b').forEach((b) => b.addEventListener('click', () => { if (!busy) addTile(b.dataset.k, Number(b.dataset.s)); }));
  box.querySelector('[data-a=clear]').addEventListener('click', () => { if (busy) return; tiles.forEach((t) => t.el.remove()); tiles = []; layout(); });
  box.querySelector('[data-a=sample]').addEventListener('click', () => {
    if (busy) return; tiles.forEach((t) => t.el.remove()); tiles = [];
    [['x2', 1, 3], ['1', -1, 4], ['x2', 1, 1], ['x', 1, 5], ['1', -1, 2]].forEach(([k, s, n]) => { for (let i = 0; i < n; i++) addTile(k, s, false); });
    layout(false);
  });
  box.querySelector('[data-a=flip]').addEventListener('click', () => {
    if (busy || !tiles.length) return; busy = true;
    tiles.forEach((t, i) => {
      const a = t.el.animate([{ transform: 'perspective(400px) rotateY(0)' }, { transform: 'perspective(400px) rotateY(90deg)' }], { duration: 200, delay: i * 25, fill: 'forwards' });
      a.onfinish = () => { t.s = -t.s; t.el.classList.toggle('pos', t.s > 0); t.el.classList.toggle('neg', t.s < 0); t.el.animate([{ transform: 'perspective(400px) rotateY(-90deg)' }, { transform: 'perspective(400px) rotateY(0)' }], 200); a.cancel(); };
    });
    setTimeout(() => { layout(); busy = false; }, 260 + tiles.length * 25);
  });
  box.querySelector('[data-a=pairs]').addEventListener('click', async () => {
    if (busy) return; busy = true;
    const L = layout(false);
    const jobs = [];
    KINDS.forEach((k) => {
      const P = tiles.filter((t) => t.k === k && t.s > 0), N = tiles.filter((t) => t.k === k && t.s < 0), m = Math.min(P.length, N.length), th = tdim(k, L.s)[1];
      for (let i = 0; i < m; i++) {
        const a = P[i], b = N[i];
        jobs.push(new Promise((r) => setTimeout(r, i * 140)).then(() => {
          const cy = L.my - th / 2;
          [a, b].forEach((t) => { t.el.style.transition = 'top .35s'; t.el.style.top = cy + 'px'; });
          return new Promise((r) => setTimeout(r, 380)).then(() => Promise.all([a, b].map((t) => t.el.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.25)' }], 320).finished))).then(() => { [a, b].forEach((t) => { t.el.remove(); }); tiles = tiles.filter((t) => t !== a && t !== b); });
        }));
      }
    });
    await Promise.all(jobs); busy = false; layout();
  });
  new ResizeObserver(() => layout(false)).observe(mat);
  void H;
  layout(false);
}

/* ======================================================================
 * Warm-up: Sort the Socks
 * ====================================================================== */
const SOCKS = [['3x', 'x', 3, 'b'], ['-2x^2', 'x2', -2, 'p'], ['5', '1', 5, 'y'], ['x', 'x', 1, 'g'], ['7x^2', 'x2', 7, 'b'], ['-4', '1', -4, 'y'], ['xy', 'xy', 1, 'p'], ['-6x', 'x', -6, 'g'], ['x^2', 'x2', 1, 'y'], ['-3', '1', -3, 'b']];
const PILES = ['x2', 'xy', 'x', '1'], PILE_NAME = { x2: `${'x²'}-socks`, xy: 'odd sock', x: 'x-socks', 1: 'number socks' };
const SOCK_FILL = { b: '#bed4f5', p: '#fad2d7', y: '#ffecb3', g: '#c8ebc8' };
const sockSVG = (fill) => `<svg viewBox="0 0 86 120" class="u3s-svg" aria-hidden="true"><path d="M4 4h60v80h12a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H12a8 8 0 0 1-8-8z" fill="${fill}" stroke="#1e2d46" stroke-width="2.2" stroke-linejoin="round"/><rect x="4" y="4" width="60" height="16" fill="#fff" stroke="#1e2d46" stroke-width="2.2"/><path d="M14 7v10M24 7v10M34 7v10M44 7v10M54 7v10" stroke="#9aa6b8" stroke-width="2"/></svg>`;
function mountSocks() {
  const box = document.getElementById('socks'); if (!box) return;
  // sizes follow the box width (the one-screen layout gives it ~650 px): sk scales the socks, the rows stack under them
  const W = box.clientWidth || 966, N = SOCKS.length, sk = Math.min(1, (W - 20) / (N * 86 + (N - 1) * 4)), mg = sk < 1 ? 10 : 20, sw = 86 * sk, shh = 120 * sk, gap = (W - 2 * mg - N * sw) / (N - 1), lineY = 30 * sk;
  box.style.setProperty('--sk', sk);
  box.innerHTML = `<svg class="u3s-rope" width="${W}" height="60" aria-hidden="true"><path d="M8 ${lineY + 4} Q ${W / 2} ${lineY + 18} ${W - 8} ${lineY + 4}" fill="none" stroke="#6b7487" stroke-width="2.5"/></svg>
    <div class="u3s-ctl no-ink"><button class="pill small" type="button" data-a="sort">Sort them all</button><button class="pill small" type="button" data-a="squash" disabled>Squash each pile</button><button class="exb" type="button" data-a="reset" title="Start over" aria-label="Start over"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/></svg></button></div>
    <div class="u3s-read" aria-live="polite"></div><div class="u3s-hint">The piles go here.</div>`;
  const read = box.querySelector('.u3s-read'), hint = box.querySelector('.u3s-hint');
  const ctlY = lineY + 16 + shh + 6, PW = Math.min(214, (W - 2 * mg - 3 * 10) / PILES.length), PG = (W - 2 * mg - PILES.length * PW) / (PILES.length - 1), pileY = ctlY + 60 * sk;
  const psc = Math.min(1, 0.7 / sk), qsc = Math.min(1.1, 0.86 / sk), pileH = sk < 1 ? 26 + shh * Math.max(psc, qsc) + 10 : 168;
  box.querySelector('.u3s-ctl').style.top = ctlY + 'px'; read.style.top = ctlY + 6 + 'px'; hint.style.top = pileY + pileH / 2 - 16 + 'px';
  if (sk < 1) box.style.height = pileY + pileH + 14 + 'px';
  const piles = PILES.map((f, i) => {
    const el = h('div', 'u3s-pile', `<div class="u3s-ph">${f === 'x2' ? K('x^2') + '-socks' : f === 'x' ? K('x') + '-socks' : PILE_NAME[f]}</div>`); at(el, mg + i * (PW + PG), pileY); el.style.width = PW + 'px'; el.style.height = pileH + 'px';
    box.appendChild(el); return { f, el, x: mg + i * (PW + PG), socks: [] };
  });
  const socks = SOCKS.map(([t, f, c, col], i) => {
    const el = h('button', 'u3s-sock', `${sockSVG(SOCK_FILL[col])}<span class="u3s-t">${K(t)}</span><i class="u3s-peg"></i>`); el.type = 'button'; el.title = 'Tap to sort this sock';
    const x = mg + i * (sw + gap), y = lineY + 4 + Math.sin((i + 0.5) / N * Math.PI) * 12;
    at(el, x, y); el._home = [x, y]; box.appendChild(el);
    const s = { el, t, f, c, sorted: false }; el.addEventListener('click', () => sortOne(s)); return s;
  });
  let squashed = false;
  const placeIn = (p) => p.socks.forEach((s, j) => {
    const n = p.socks.length, sc = psc, w = sw * sc, gx = Math.min(w + 8, (PW - 16 - w) / Math.max(1, n - 1));
    const x0 = p.x + (PW - (w + (n - 1) * gx)) / 2;
    s.el.style.transition = 'left .5s cubic-bezier(.25,.75,.3,1), top .5s cubic-bezier(.25,.75,.3,1), transform .5s';
    at(s.el, x0 + j * gx - sw * (1 - sc) / 2, pileY + (sk < 1 ? 28 : 40) - shh * (1 - sc) / 2); s.el.style.transform = `scale(${sc})`;
  });
  function status() {
    const left = socks.filter((s) => !s.sorted).length;
    piles.forEach((p) => p.el.classList.toggle('on', p.socks.length > 0));
    hint.style.opacity = left === N ? 1 : 0;
    box.querySelector('[data-a=squash]').disabled = left > 0 || squashed;
    box.querySelector('[data-a=sort]').disabled = left === 0;
    if (squashed) read.innerHTML = `Left: ${K('6x^2+xy-2x-2')}, <b>4 socks</b>`;
    else read.innerHTML = left ? `<b>${left}</b> sock${left > 1 ? 's' : ''} on the line${left < N ? ` · ${piles.filter((p) => p.socks.length).length} pile${piles.filter((p) => p.socks.length).length > 1 ? 's' : ''} so far` : ''}` : `All sorted: <b>4 piles</b>. Now squash each pile into one sock.`;
  }
  function sortOne(s) {
    if (s.sorted || squashed) return;
    s.sorted = true; s.el.classList.add('sorted');
    const p = piles.find((q) => q.f === s.f); p.socks.push(s); placeIn(p); status();
  }
  box.querySelector('[data-a=sort]').addEventListener('click', () => socks.filter((s) => !s.sorted).forEach((s, i) => setTimeout(() => sortOne(s), i * 160)));
  box.querySelector('[data-a=squash]').addEventListener('click', () => {
    if (squashed) return; squashed = true;
    piles.forEach((p) => {
      const sum = p.socks.reduce((t, s) => t + s.c, 0), keep = p.socks[0], sc = qsc;
      const x = p.x + (PW - sw) / 2, y = pileY + (sk < 1 ? 26 : 34);
      p.socks.forEach((s) => { at(s.el, x, y); s.el.style.transform = `scale(${sc})`; });
      setTimeout(() => {
        p.socks.slice(1).forEach((s) => { s.el.style.opacity = 0; });
        const lab = p.f === '1' ? String(sum) : (sum === 1 ? '' : sum === -1 ? '-' : sum) + (p.f === 'x2' ? 'x^2' : p.f);
        keep.el.querySelector('.u3s-t').innerHTML = K(lab); keep.el.classList.add('sq');
        keep.el.animate([{ transform: `scale(${sc})` }, { transform: `scale(${sc * 1.18})` }, { transform: `scale(${sc})` }], 380);
      }, 560);
    });
    status();
  });
  box.querySelector('[data-a=reset]').addEventListener('click', () => {
    squashed = false; piles.forEach((p) => (p.socks = []));
    socks.forEach((s) => { s.sorted = false; s.el.classList.remove('sorted', 'sq'); s.el.style.opacity = 1; s.el.style.transform = ''; at(s.el, ...s.el._home); s.el.querySelector('.u3s-t').innerHTML = K(s.t); });
    status();
  });
  status();
}

function mountReveals() {
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { polyCheck, nameMachine, degree, order, build, read, addTiles, subTiles, likeTerms };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

renderFigures(); mountSocks(); mountMat(); mountReveals(); mountExplainers();

/* ============ Stand Up Break! (lessons/js/standup.js) — a tiny polynomial kit for the whiteboard questions ============
 * A polynomial is { key: coefficient }, the key naming the variables and their exponents ('x2y1'; '' for a constant).
 * A written expression keeps its terms in a list of one-term polynomials, so the answer can show the partial products. */
const suKey = (e) => Object.keys(e).filter((v) => e[v]).sort().map((v) => v + e[v]).join('');
const suExp = (k) => { const e = {}; k.replace(/([a-z])(\d+)/g, (_, v, n) => { e[v] = +n; }); return e; };
const suM = (c, v, n = 1) => (c ? { [suKey(typeof v === 'object' ? v : v ? { [v]: n } : {})]: c } : {}); // c·vⁿ, or c·(exponents)
const suAdd = (...ps) => { const o = {}; ps.forEach((p) => { for (const k in p) { o[k] = (o[k] || 0) + p[k]; if (!o[k]) delete o[k]; } }); return o; };
const suMul = (...ps) => ps.reduce((a, b) => {
  const o = {};
  for (const i in a) for (const j in b) { const e = suExp(i), f = suExp(j); for (const v in f) e[v] = (e[v] || 0) + f[v]; const k = suKey(e); o[k] = (o[k] || 0) + a[i] * b[j]; if (!o[k]) delete o[k]; }
  return o;
}, { '': 1 });
const suDeg = (k) => Object.values(suExp(k)).reduce((s, n) => s + n, 0);
const suOrd = (a, b) => { const d = suDeg(b) - suDeg(a); if (d) return d; const ea = suExp(a), eb = suExp(b); for (const v of [...new Set(Object.keys(ea).concat(Object.keys(eb)))].sort()) { const x = (eb[v] || 0) - (ea[v] || 0); if (x) return x; } return 0; };
const suKeys = (p) => Object.keys(p).sort(suOrd);
const suMono = (k) => Object.entries(suExp(k)).map(([v, n]) => v + (n > 1 ? '^{' + n + '}' : '')).join('');
const suTerm = (c, k, first) => { const m = suMono(k), a = Math.abs(c); return (c < 0 ? '-' : first ? '' : '+') + (a === 1 && m ? '' : a) + m; };
const suTex = (p) => suKeys(p).map((k, i) => suTerm(p[k], k, i === 0)).join('') || '0';
const suOne = (p) => { const k = Object.keys(p)[0]; return [p[k], k]; };
const suSeq = (list, cont) => list.filter((p) => Object.keys(p).length).map((p, i) => { const [c, k] = suOne(p); return suTerm(c, k, i === 0 && !cont); }).join('') || '0';
const suPar = (list) => '(' + suSeq(list) + ')';
const suP = (list) => suAdd(...list);
const suTermsOf = (p) => suKeys(p).map((k) => ({ [k]: p[k] }));
const suParts = (A, B) => A.flatMap((a) => B.map((b) => suMul(a, b)));
const suL = (v, a, b) => [suM(a, v), suM(b)]; // a·v + b as a written list
const suDist = (A, B) => A.map((t, i) => { const [c, k] = suOne(t); return suTerm(c, k, i === 0) + suPar(B); }).join(''); // a(…)+b(…)
const suK = (k) => (k === -1 ? '-' : k === 1 ? '' : String(k)); // a factor written in front of brackets
const SU_NAMES = ['', 'monomial', 'binomial', 'trinomial'];
const suName = (n) => SU_NAMES[n] || 'polynomial';
const suIt = (s) => s.split('').map((v) => '<i>' + v + '</i>').join(', '); // variable letters for the answer words
const suRange = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const suGcd = (a, b) => (b ? suGcd(b, a % b) : Math.abs(a));
/* a coefficient num/den on vⁿ: written in the question (\dfrac{2x^2}{3} or \tfrac{2}{3}x^2) and in the answer (\tfrac{2}{3}x^2) */
function suFr(t, first, style) {
  const m = t.n ? t.v + (t.n > 1 ? '^{' + t.n + '}' : '') : '', a = Math.abs(t.num), s = t.num < 0 ? '-' : first ? '' : '+';
  if (t.den === 1) return s + (a === 1 && m ? '' : a) + m;
  if (style === 'd') return s + '\\dfrac{' + (a === 1 ? '' : a) + m + '}{' + t.den + '}';
  return s + '\\tfrac{' + a + '}{' + t.den + '}' + m;
}
const suCoef = (t) => (t.den === 1 ? String(t.num) : (t.num < 0 ? '-' : '') + '\\tfrac{' + Math.abs(t.num) + '}{' + t.den + '}');
const suNz = (r, lo, hi) => { let v = 0; while (!v) v = r.int(lo, hi); return v; };

standup('u3l1', {
  intro: 'Answer every part for the polynomial at your whiteboard station. Look at each term’s exponents and keep each term’s sign.',
  levels: {
    /* name it by its terms; degree, leading coefficient and constant term (already in descending order) */
    BEG: (r) => {
      const v = r.pick(['x', 'x', 'y', 'm', 'n', 't']), n = r.pick([1, 2, 2, 3, 3, 3, 4, 4]);
      const d = r.int(Math.max(n - 1, 2), 6);
      const ex = [d].concat(r.shuffle(suRange(0, d - 1)).slice(0, n - 1)).sort((a, b) => b - a);
      const ts = ex.map((e, i) => suM(i === 0 ? r.int(1, 9) * (r.chance(0.3) ? -1 : 1) : suNz(r, -9, 9), v, e));
      const lc = suOne(ts[0])[0], ct = ex[ex.length - 1] === 0 ? suOne(ts[ts.length - 1])[0] : 0;
      return {
        text: 'Name this polynomial by its number of terms. Then state its <b>degree</b>, its <b>leading coefficient</b> and its <b>constant term</b>.',
        q: suSeq(ts),
        atext: n + (n === 1 ? ' term' : ' terms') + ': <b>' + suName(n) + '</b>' + (ct === 0 ? ' · no term without ' + suIt(v) + ', so the constant term is 0' : ''),
        a: ['\\text{degree } ' + d, '\\text{leading coefficient } ' + lc, '\\text{constant term } ' + ct]
      };
    },
    /* out of order (and maybe a fraction coefficient): descending order, then leading coefficient, constant term, degree */
    PRG: (r) => {
      const v = r.pick(['x', 'x', 'y', 'm', 'p', 'w']), n = r.pick([3, 3, 4]), d = r.int(n === 3 ? 2 : 3, 5);
      const mid = r.shuffle(suRange(1, d - 1));
      let ex = [d].concat(mid.slice(0, n - 2));
      ex.push(r.chance(0.8) || mid.length < n - 1 ? 0 : mid[n - 2]);
      ex = ex.sort((a, b) => b - a);
      const ts = ex.map((e, i) => ({ v, n: e, num: i === 0 ? r.int(1, 9) * (r.chance(0.4) ? -1 : 1) : suNz(r, -9, 9), den: 1 }));
      if (r.chance(0.6)) { // one term gets a fraction coefficient
        const t = r.pick(ts.filter((x) => x.n > 0)), den = r.pick([2, 3, 4, 5]);
        let num; do { num = r.int(1, 2 * den); } while (suGcd(num, den) !== 1 || num % den === 0);
        t.den = den; t.num = num * (r.chance(0.4) ? -1 : 1);
      }
      let w; do { w = r.shuffle(ts); } while (w[0].n === d);
      const style = r.pick(['d', 't']), last = ts[ts.length - 1];
      return {
        text: 'Write the polynomial in <b>descending</b> order of ' + suIt(v) + '. Then state its leading coefficient, its constant term and its degree.',
        q: w.map((t, i) => suFr(t, i === 0, style)).join(''),
        a: ['\\text{descending: }\\ ' + ts.map((t, i) => suFr(t, i === 0, 't')).join(''),
          '\\text{leading coefficient } ' + suCoef(ts[0]), '\\text{constant term } ' + (last.n === 0 ? suCoef(last) : '0'), '\\text{degree } ' + d]
      };
    },
    /* several variables: count variables and terms, name it, degree of each term and of the polynomial */
    MAS: (r) => {
      const V = r.pick([['x', 'y'], ['x', 'y'], ['m', 'n'], ['a', 'b'], ['p', 'q', 'r'], ['x', 'y', 'z']]), n = r.pick([3, 3, 4]);
      for (;;) {
        const ts = [], keys = new Set();
        while (ts.length < n) {
          const e = {}; V.forEach((v) => { e[v] = r.chance(V.length === 3 ? 0.45 : 0.3) ? 0 : r.int(1, 5); });
          if (ts.length === n - 1 && r.chance(0.35)) V.forEach((v) => { e[v] = 0; }); // sometimes a constant term
          const p = suM(suNz(r, -9, 9), e), k = Object.keys(p)[0];
          if (keys.has(k) || (k === '' && ts.length < n - 1)) continue;
          if (k !== '' && r.chance(0.2)) p[k] = p[k] < 0 ? -1 : 1; // a hidden coefficient of 1
          keys.add(k); ts.push(p);
        }
        const degs = ts.map((p) => suDeg(suOne(p)[1])), top = Math.max(...degs);
        const used = V.filter((v) => ts.some((p) => suExp(suOne(p)[1])[v]));
        if (degs.filter((x) => x === top).length !== 1 || degs[0] === top || used.length < 2 || top > 9) continue;
        const items = ts.map((p, i) => {
          const [c, k] = suOne(p), e = suExp(k), parts = Object.keys(e).sort().map((v) => e[v]);
          return suTerm(c, k, true) + ':\\ ' + (parts.length > 1 ? parts.join('+') + '=' : '') + degs[i];
        });
        const lines = []; for (let i = 0; i < items.length; i += 2) lines.push(items.slice(i, i + 2).join(',\\qquad '));
        return {
          text: 'State the number of <b>variables</b> and the number of <b>terms</b>, and name the polynomial. Then find the <b>degree of each term</b> and the <b>degree of the polynomial</b>.',
          q: suSeq(ts),
          atext: used.length + ' variables (' + suIt(used.join('')) + ') · ' + n + ' terms: <b>' + suName(n) + '</b>',
          a: lines.concat(['\\text{degree of the polynomial: the highest, } ' + top])
        };
      }
    }
  }
});
