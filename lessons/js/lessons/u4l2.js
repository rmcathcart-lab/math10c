/* Math 10C · Unit 4 · Lesson 2 — Factoring Trinomials of the Form x² + bx + c:
 * the explainers, the census-taker warm-up, and the algebra-tile figures.
 * Tile key (whole unit): x² teal, x amber, 1 slate blue. A positive tile is shaded; a NEGATIVE tile is white
 * with a coloured outline and a minus sign, like the booklet. Tiles are drawn to scale: x² is x by x, an x-tile is
 * 1 by x, a unit tile is 1 by 1. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const box = (el, w, hh) => { el.style.width = w + 'px'; el.style.height = hh + 'px'; return el; };
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

/* KaTeX allowing \htmlClass, so parts of a line can be revealed one at a time */
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};
const T = (s) => tex(s);
const spans = (root, cls) => [...root.querySelectorAll('.' + cls)];
const showSpans = (c, els, ms = 320, delay = 0) => Promise.all(els.map((e) => c.anim(e, [{ opacity: 0 }, { opacity: 1 }], ms, { delay })));
const pulse = (c, el, s = 1.1) => c.anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], 460);
function stampIn(c, el) { return c.anim(el, [{ opacity: 0, transform: 'scale(1.9) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); }

const TEAL = '#13807a', AMB = '#c27a0e', PUR = '#7b4fc4', BLU = '#2f6fd0', RED = '#c93a33', OK = '#12805a';
const FOILC = [TEAL, AMB, PUR, BLU];
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
const mulT = (a, b) => { const v = { ...a.v }; for (const k in b.v) v[k] = (v[k] || 0) + b.v[k]; return { c: a.c * b.c, v }; };
const keyT = (t) => Object.keys(t.v).sort().map((k) => k + t.v[k]).join('');
const degT = (t) => Object.values(t.v).reduce((s, e) => s + e, 0);
const numT = (n) => fmt(n).replace(/ /g, '\\,');
function bodyT(t) {
  const a = Math.abs(t.c), vs = Object.keys(t.v).sort().map((k) => (t.v[k] === 1 ? k : `${k}^{${t.v[k]}}`)).join('');
  return vs ? (a === 1 ? '' : numT(a)) + vs : numT(a);
}
const termT = (t, first) => (t.c < 0 ? '-' : first ? '' : '+') + bodyT(t);
const polyT = (list) => (list.length ? list.map((t, i) => termT(t, i === 0)).join('') : '0');
function collect(list) {
  const m = new Map();
  list.forEach((t) => { const k = keyT(t); if (m.has(k)) m.get(k).c += t.c; else m.set(k, { c: t.c, v: { ...t.v } }); });
  return [...m.values()].map((t, i) => ({ t, i })).filter((o) => o.t.c !== 0).sort((a, b) => degT(b.t) - degT(a.t) || a.i - b.i).map((o) => o.t);
}
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function gcfT(terms) {
  let g = 0; terms.forEach((t) => (g = gcd(g, Math.abs(t.c))));
  const v = {}; Object.keys(terms[0].v).forEach((k) => { if (terms.every((t) => t.v[k])) v[k] = Math.min(...terms.map((t) => t.v[k])); });
  return { c: g, v };
}
function divT(t, g) { const v = { ...t.v }; for (const k in g.v) { v[k] -= g.v[k]; if (!v[k]) delete v[k]; } return { c: t.c / g.c, v }; }
const evalT = (list, val) => list.reduce((s, t) => s + t.c * Math.pow(val, degT(t)), 0);
const par = (n) => (n < 0 ? `(${n})` : String(n)); // a number written for adding or multiplying: (−3)
const sgn = (n) => (n < 0 ? String(n) : '+' + n);
/* x + 5, x − 3, x + 4y, x − y */
const binT = (v, n, w = '') => (n === 0 ? v : `${v}${n < 0 ? '-' : '+'}${Math.abs(n) === 1 && w ? '' : Math.abs(n)}${w}`);
/* x² + bx + c (or x² + bxy + cy²) */
const triT = (b, c, v = 'x', w = '') => polyT([{ c: 1, v: { [v]: 2 } }, { c: b, v: w ? { [v]: 1, [w]: 1 } : { [v]: 1 } }, { c, v: w ? { [w]: 2 } : {} }].filter((t) => t.c));
/* the booklet writes the pair smaller-first when c > 0 and bigger-first (the one with b's sign) when c < 0 */
const ordered = (m, n, c) => (c < 0 ? [n, m] : [m, n]);

/* every factor pair of |c|, signed by the signs table, with its sum. m is the one nearer 0. */
function searchRows(b, c) {
  const A = Math.abs(c), out = [], sb = b < 0 ? -1 : 1;
  for (let s = 1; s * s <= A; s++) if (A % s === 0) {
    const l = A / s, m = c > 0 ? sb * s : -sb * s, n = sb * l;
    out.push({ s, l, m, n, sum: m + n, ok: m + n === b });
  }
  return out;
}
const sumT = (r) => `${r.m}+${par(r.n)}=${r.sum}`;

/* ============ shared explainer pieces ============ */
/* the factor-pair search: one row per factor pair, lighting up the pair whose sum matches */
function searchPanel(stage, x, y, w, b, c, o) {
  const rows = searchRows(b, c);
  const wrap = add(stage, box(h('div', 'u4l2-sp'), w, 0), x, y); wrap.style.height = 'auto';
  wrap.innerHTML = `<div class="u4l2-sph">${o.title}</div>`;
  const els = rows.map((r) => { const e = h('div', 'u4l2-sr' + (o.cls ? ' ' + o.cls : ''), o.row(r) + `<span class="u4l2-srm">${r.ok ? '✓' : '✗'}</span>`); wrap.appendChild(e); hide(e); return e; });
  hide(wrap);
  return {
    rows, els, wrap, hit: rows.find((r) => r.ok) || null,
    async run(c) {
      if (wrap.style.opacity !== '1') await c.fadeIn(wrap, 260);
      for (let i = 0; i < rows.length; i++) {
        await c.fadeIn(els[i], 280, { from: 'translateX(-12px)' });
        els[i].classList.add(rows[i].ok ? 'hit' : 'miss');
        if (rows[i].ok) await c.pop(els[i].lastChild, 380); else await c.sleep(170);
      }
    }
  };
}
const rowPlain = (r) => `<span class="u4l2-srp">${K(`${r.s}\\times${numT(r.l)}`)}</span><span class="u4l2-sri">${K(`${r.m},\\ ${r.n}`)}</span><span class="u4l2-srs">${K(sumT(r))}</span>`;

/* the signs table, small, with the cell for this trinomial lighting up */
function signsMini(stage, x, y) {
  const e = add(stage, h('div', 'u4l2-sg'), x, y);
  e.innerHTML = `<div class="u4l2-sgc hd"></div><div class="u4l2-sgc hd">${K('b>0')}</div><div class="u4l2-sgc hd">${K('b<0')}</div>
    <div class="u4l2-sgc hd">${K('c>0')}</div><div class="u4l2-sgc" data-k="pp"><span>both <b>+</b></span></div><div class="u4l2-sgc" data-k="pn"><span>both <b>−</b></span></div>
    <div class="u4l2-sgc hd">${K('c<0')}</div><div class="u4l2-sgc" data-k="np"><span>one of each;<br>further from 0 is <b>+</b></span></div><div class="u4l2-sgc" data-k="nn"><span>one of each;<br>further from 0 is <b>−</b></span></div>`;
  hide(e);
  return {
    el: e,
    async light(c, b, cc) {
      await c.fadeIn(e, 260);
      const cell = e.querySelector(`[data-k=${(cc > 0 ? 'p' : 'n') + (b >= 0 ? 'p' : 'n')}]`);
      cell.classList.add('on'); e.classList.add('lit');
      await pulse(c, cell, 1.08);
    }
  };
}
function signsCap(b, c, sp) {
  const C = sp ? `The product ${T(String(c))}` : T(`c=${c}`), B = sp ? `the sum ${T(String(b))}` : T(`b=${b}`);
  if (c > 0 && b > 0) return `${C} is <b>positive</b>, so the two integers have the <b>same sign</b>. ${sp ? 'And ' + B : B} is positive, so <b>both are positive</b>.`;
  if (c > 0) return `${C} is <b>positive</b>, so the two integers have the <b>same sign</b>. But ${B} is negative, so <b>both are negative</b>.`;
  return `${C} is <b>negative</b>, so it’s <b>one positive and one negative</b>. ${sp ? 'And ' + B : B} is ${b > 0 ? 'positive' : 'negative'}, so the one further from 0 is <b>${b > 0 ? 'positive' : 'negative'}</b>.`;
}

/* ============ algebra tiles (DOM, for the explainers) ============ */
function mkTile(stage, kind, s, w, hh) {
  const e = add(stage, box(h('div', `u4l2-t u4l2-${kind} ${s > 0 ? 'pos' : 'neg'}`), w, hh), 0, 0);
  if (s < 0) e.innerHTML = '<i></i>';
  return { e, w, h: hh, kind, s, cx: 0, cy: 0, rot: 0 };
}
const poseTf = (t, cx, cy, rot) => `translate(${cx - t.w / 2}px, ${cy - t.h / 2}px) rotate(${rot}deg)`;
function place(t, cx, cy, rot = 0) {
  t.cx = cx; t.cy = cy; t.rot = rot; t.e.style.transform = poseTf(t, cx, cy, rot);
  if (t.e.firstChild) t.e.firstChild.style.transform = `rotate(${-rot}deg)`;
}
function moveTile(c, t, cx, cy, rot = 0, ms = 650, delay = 0) {
  const from = poseTf(t, t.cx, t.cy, t.rot), to = poseTf(t, cx, cy, rot), r0 = t.rot;
  t.cx = cx; t.cy = cy; t.rot = rot;
  const jobs = [c.anim(t.e, [{ transform: from }, { transform: to }], ms, { delay })];
  if (t.e.firstChild) jobs.push(c.anim(t.e.firstChild, [{ transform: `rotate(${-r0}deg)` }, { transform: `rotate(${-rot}deg)` }], ms, { delay }));
  if (c.fast) return Promise.all(jobs);
  t.e.classList.add('lift'); // picked up: carried over the other tiles
  return Promise.all(jobs).then(() => t.e.classList.remove('lift'));
}

/* ============ 1 & 4. A pile of tiles becomes a rectangle ============ */
const TD = {
  s1: { b: 7, c: 10 }, n6: { b: 5, c: 6 }, sq: { b: 6, c: 9 }, no: { b: 4, c: 5 },
  e1: { b: 9, c: 8 }, e2: { b: 8, c: 15 },
  s4: { b: 1, c: -6 }, m6: { b: -1, c: -6 }, p3: { b: -4, c: 3 }, e8a: { b: -5, c: 6 }, e8c: { b: 2, c: -8 }
};
function makeTiles(title, choices) {
  return {
    title, height: 480, choices,
    intro: (k) => { const d = TD[k]; return `These tiles model ${T(triT(d.b, d.c))}. Can <b>all</b> of them be arranged into <b>one rectangle</b>, with no gaps and no overlaps?`; },
    make(stage, key, ex) {
      const W = ex.W, d = TD[key], b = d.b, c = d.c, P = triT(b, c);
      const X = 110, U = 28, G = 6, py = 24, A = Math.abs(c), sc = Math.sign(c), nb = Math.abs(b), sb = b < 0 ? -1 : 1;
      const rows = searchRows(b, c), hit = rows.find((r) => r.ok) || null;
      /* no pair: still try the closest block, so the class can see the gaps */
      const att = hit ? null : (b > 0 && c > 0 ? rows.slice().sort((p1, p2) => Math.abs(p1.sum - b) - Math.abs(p2.sum - b))[0] : null);
      const shp = hit || att;
      const r = shp ? shp.m : 0, k = shp ? shp.n : 0; // rows down the side (nearer 0), columns across the top
      const needPos = (r > 0 ? r : 0) + (k > 0 ? k : 0), needNeg = (r < 0 ? -r : 0) + (k < 0 ? -k : 0);
      const zp = hit ? (b >= 0 ? needNeg : needPos) : 0;
      const negWord = (s) => (s < 0 ? '<b>negative</b> ' : '');

      /* the pile */
      let x = 24;
      const big = mkTile(stage, 'k2', 1, X, X); place(big, x + X / 2, py + X / 2); x += X + 22;
      const xs0 = x, xt = [];
      for (let i = 0; i < nb; i++) { const t = mkTile(stage, 'k1', sb, U, X); place(t, x + U / 2, py + X / 2); xt.push(t); x += U + G; }
      const xs1 = x - G;
      const zps = [];
      if (zp) x += 8;
      for (let i = 0; i < zp; i++) {
        const br = add(stage, box(h('div', 'u4l2-zb', '<span>0</span>'), 2 * U + 4 + 12, X + 12), x - 6, py - 6); hide(br);
        const pair = [1, -1].map((s, j) => { const t = mkTile(stage, 'k1', s, U, X); place(t, x + j * (U + 4) + U / 2, py + X / 2); t.e.style.opacity = 0; return t; });
        zps.push({ br, pair }); x += 2 * U + 4 + 18;
      }
      x += 14;
      const ux0 = x, ut = [];
      for (let i = 0; i < A; i++) { const t = mkTile(stage, 'k0', sc, U, U); place(t, ux0 + (i % 4) * (U + 6) + U / 2, py + Math.floor(i / 4) * (U + 6) + U / 2); ut.push(t); }
      const ly = py + Math.max(X, Math.ceil(A / 4) * (U + 6) - 6) + 22;
      const pl = [[24 + X / 2, `1 ${T('x^2')}-tile`], [(xs0 + xs1) / 2, `${nb} ${b < 0 ? 'negative ' : ''}${T('x')}-tile${nb === 1 ? '' : 's'}`], [ux0 + (Math.min(A, 4) * (U + 6) - 6) / 2, `${A} ${c < 0 ? 'negative ' : ''}unit tile${A === 1 ? '' : 's'}`]]
        .map(([cx, html]) => { const e = add(stage, h('div', 'u4l2-plab c', html), cx, ly); hide(e); return e; });

      /* the rectangle's place */
      const wid = X + Math.abs(k) * U, hei = X + Math.abs(r) * U;
      const ox = Math.max(156, Math.round((610 - wid) / 2) + 40), oy = 266;
      const frame = add(stage, box(h('div', 'u4l2-rframe'), wid, hei), ox, oy); hide(frame);
      const dims = [];
      if (hit) {
        const dimH = (x0, w, lab) => { const l = add(stage, box(h('div', 'u4l2-dim'), w - 6, 0), x0 + 3, oy - 12), t = add(stage, h('div', 'u4l2-dlab c', K(lab)), x0 + w / 2, oy - 30); hide(l, t); dims.push(l, t); };
        const dimV = (y0, hh, lab) => { const l = add(stage, box(h('div', 'u4l2-vdim'), 0, hh - 6), ox - 12, y0 + 3), t = add(stage, h('div', 'u4l2-dlab c', K(lab)), ox - 32, y0 + hh / 2); hide(l, t); dims.push(l, t); };
        dimH(ox, X, 'x'); dimH(ox + X, Math.abs(k) * U, String(k)); dimV(oy, X, 'x'); dimV(oy + X, Math.abs(r) * U, String(r));
      }
      const topL = add(stage, h('div', 'u4l2-blab c', K(binT('x', k))), ox + wid / 2, oy - 64);
      const sideL = add(stage, h('div', 'u4l2-blab c', K(binT('x', r))), ox - 100, oy + hei / 2); hide(topL, sideL);

      /* the panel on the right */
      const px = 630, pw = W - px - 14;
      const card = add(stage, box(h('div', 'u4l2-tpc'), pw, 0), px, 14); card.style.height = 'auto'; hide(card);
      card.innerHTML = `<div class="u4l2-tph">The tiles</div><div class="u4l2-tpp">${K(P)}</div>`;
      const sp = searchPanel(stage, px, 104, pw, b, c, {
        title: `Corner block → ${T('x')}-tiles`, cls: 'tl',
        row: (q) => `<span class="u4l2-srp">${K(`${q.s}\\times${q.l}`)}</span><span class="u4l2-srs">${K(sumT(q))}</span>`
      });
      const [f1, f2] = ordered(r, k, c), facs = `(${binT('x', f1)})(${binT('x', f2)})`;
      const prods = [{ c: 1, v: { x: 2 } }, { c: f2, v: { x: 1 } }, { c: f1, v: { x: 1 } }, { c: f1 * f2, v: {} }];
      const ry = 104 + 40 + rows.length * 42 + 14;
      const res = add(stage, box(h('div', 'u4l2-tres'), pw, 0), px, ry); res.style.height = 'auto'; hide(res);
      res.innerHTML = hit ? `<div class="u4l2-tph">Area = length × width</div><div class="u4l2-teq">${K(`${P}`)}</div><div class="u4l2-teq u4l2-good">${K(`=${facs}`)}</div><div class="u4l2-tck"><b>Check:</b> ${K(`${facs}`)}<br>${K(`=${polyT(prods)}`)}<br>${K(`=${P}`)} <span class="ok">✓</span></div>`
        : `<div class="u4l2-nostamp">no rectangle</div>`;

      const steps = [];
      steps.push({
        cap: `Count the tiles: one ${T('x^2')}-tile, ${nb} ${negWord(b)}${T('x')}-tile${nb === 1 ? '' : 's'} and ${A} ${negWord(c)}unit tile${A === 1 ? '' : 's'}. Together they are ${T(P)}.`,
        run: (c2) => Promise.all([...pl.map((e, i) => c2.fadeIn(e, 300, { delay: i * 150 })), c2.fadeIn(card, 350, { delay: 300 })])
      });
      steps.push({
        cap: `Build the rectangle around the big square: the ${T('x^2')}-tile goes in the <b>top-left corner</b>. Its sides are ${T('x')} and ${T('x')}.`,
        run: (c2) => Promise.all([...pl.map((e) => c2.anim(e, [{ opacity: 1 }, { opacity: 0 }], 250)), moveTile(c2, big, ox + X / 2, oy + X / 2, 0, 700)])
      });
      let scap;
      if (c > 0 && b > 0) scap = `The ${A} unit tiles fill the <b>bottom-right corner</b>, so they must make a block: <b>rows × columns = ${A}</b>. Then one ${T('x')}-tile lies beside each row and one stands above each column: <b>rows + columns</b> ${T('x')}-tiles. We have <b>${b}</b>.`;
      else if (c > 0) scap = `The corner tiles are <b>positive</b> but every ${T('x')}-tile is negative. That works, because ${T('(-1)(-1)=+1')}: <b>both</b> sides get negative ${T('x')}-tiles. Find a block, <b>rows × columns = ${A}</b>, whose ${T('x')}-tiles add to <b>${b}</b>.`;
      else scap = `The corner tiles are <b>negative</b>, and each corner tile is (its row’s tile) × (its column’s tile). So one side gets <b>positive</b> ${T('x')}-tiles and the other <b>negative</b> ones. Find a block, <b>rows × columns = ${A}</b>, whose ${T('x')}-tiles add to <b>${b}</b>.`;
      steps.push({ cap: scap, run: (c2) => sp.run(c2) });
      if (!hit) {
        if (att) {
          const need = att.s + att.l, side = Math.min(att.s, nb), top = Math.min(att.l, nb - side), ghosts = [];
          for (let i = top; i < att.l; i++) { const g = add(stage, box(h('div', 'u4l2-ghost', '?'), U, X), ox + X + i * U, oy); hide(g); ghosts.push(g); }
          for (let j = side; j < att.s; j++) { const g = add(stage, box(h('div', 'u4l2-ghost', '?'), X, U), ox, oy + X + j * U); hide(g); ghosts.push(g); }
          const extra = xt.slice(side + top);
          steps.push({
            cap: `Try the closest block anyway: ${T(`${att.s}\\times${att.l}`)} needs ${T(`${att.s}+${att.l}=${need}`)} ${T('x')}-tiles, and we have ${nb}. ` + (need > nb ? `That leaves <b>${need - nb} gap${need - nb > 1 ? 's' : ''}</b>: the shape is not a rectangle.` : `That leaves <b>${nb - need} ${T('x')}-tile${nb - need > 1 ? 's' : ''} over</b>, with nowhere to go.`),
            run: async (c2) => {
              await Promise.all([...pl.map((e) => c2.anim(e, [{ opacity: 1 }, { opacity: 0 }], 200)), ...xt.slice(side, side + top).map((t, i) => moveTile(c2, t, ox + X + i * U + U / 2, oy + X / 2, 0, 650, i * 90))]);
              await Promise.all(xt.slice(0, side).map((t, j) => moveTile(c2, t, ox + X / 2, oy + X + j * U + U / 2, 90, 700, j * 100)));
              await Promise.all(ut.map((t, i) => moveTile(c2, t, ox + X + (i % att.l) * U + U / 2, oy + X + Math.floor(i / att.l) * U + U / 2, 0, 650, Math.min(i * 45, 500))));
              extra.forEach((t) => t.e.classList.add('u4l2-extra'));
              await Promise.all(ghosts.map((g, i) => c2.pop(g, 380, { delay: i * 140 })));
            }
          });
        }
        steps.push({
          cap: `No block works: no two integers multiply to ${c} and add to ${b}. These tiles <b>can’t make a rectangle</b>, so ${T(P)} <b>cannot be factored</b> over the integers.`,
          run: async (c2) => { await c2.fadeIn(res, 200); await stampIn(c2, res.firstChild); }
        });
        return steps;
      }
      if (zp) {
        const have = `${nb} ${b > 0 ? 'positive' : 'negative'}`;
        steps.push({
          cap: `The ${T(`${Math.abs(r)}\\times${Math.abs(k)}`)} block (${T(`${r}+${par(k)}=${b}`)} ✓) needs <b>${needPos} positive</b> and <b>${needNeg} negative</b> ${T('x')}-tiles, but the pile has only ${have}. Add ${zp} <b>zero pair${zp > 1 ? 's' : ''}</b>: ${T('+x')} and ${T('-x')} add to 0, so the polynomial doesn’t change.`,
          run: async (c2) => {
            for (const z of zps) {
              await Promise.all([c2.fadeIn(z.br, 300), ...z.pair.map((t, j) => c2.anim(t.e, [{ opacity: 0, transform: poseTf(t, t.cx, t.cy - 30, 0) }, { opacity: 1, transform: poseTf(t, t.cx, t.cy, 0) }], 420, { delay: j * 160 }))]);
              await pulse(c2, z.br.firstChild, 1.3);
            }
          }
        });
      }
      /* which x-tiles go where */
      const pool = { 1: xt.filter((t) => t.s > 0).concat(zps.map((z) => z.pair[0])), '-1': xt.filter((t) => t.s < 0).concat(zps.map((z) => z.pair[1])) };
      const topT = [], sideT = [];
      for (let i = 0; i < Math.abs(k); i++) topT.push(pool[Math.sign(k)].shift());
      for (let j = 0; j < Math.abs(r); j++) sideT.push(pool[Math.sign(r)].shift());
      const kw = (n) => `${Math.abs(n)} ${n < 0 ? '<b>negative</b> ' : ''}${T('x')}-tile${Math.abs(n) === 1 ? '' : 's'}`;
      steps.push({
        cap: `Stand ${kw(k)} along the <b>top</b> and lay ${kw(r)} down the <b>side</b>. Every ${T('x')}-tile is ${T('x')} long, so it lines up with the big square exactly.`,
        run: async (c2) => {
          await Promise.all([...zps.map((z) => c2.anim(z.br, [{ opacity: 1 }, { opacity: 0 }], 250)),
            ...topT.map((t, i) => moveTile(c2, t, ox + X + i * U + U / 2, oy + X / 2, 0, 650, i * 90))]);
          await Promise.all(sideT.map((t, j) => moveTile(c2, t, ox + X / 2, oy + X + j * U + U / 2, 90, 750, j * 120)));
        }
      });
      const unitWhy = c < 0 ? ` (positive × negative is <b>negative</b>)` : r < 0 ? ` (negative × negative is <b>positive</b>)` : '';
      steps.push({
        cap: `The ${A} ${negWord(c)}unit tiles fill the ${Math.abs(r)} by ${Math.abs(k)} corner exactly${unitWhy}. No gaps, no overlaps: <b>a rectangle!</b>`,
        run: async (c2) => {
          await Promise.all(ut.map((t, i) => moveTile(c2, t, ox + X + (i % Math.abs(k)) * U + U / 2, oy + X + Math.floor(i / Math.abs(k)) * U + U / 2, 0, 650, Math.min(i * 45, 500))));
          await c2.fadeIn(frame, 300, { from: 'scale(1.03)' });
        }
      });
      const sq = r === k ? ` The rectangle is a <b>square</b>: ${T(`${facs}=(${binT('x', r)})^2`)}.` : '';
      steps.push({
        cap: `Read the sides. Across the top: ${T('x')} (the big square) and ${T(String(k))} (${Math.abs(k)} tile widths${k < 0 ? ', negative' : ''}), so ${T(binT('x', k))}. Down the side: ${T(binT('x', r))}.${sq}`,
        run: (c2) => Promise.all([...dims.map((e, i) => c2.fadeIn(e, 280, { delay: i * 60 })), c2.pop(topL, 400, { delay: 350 }), c2.pop(sideL, 400, { delay: 500 })])
      });
      steps.push({
        cap: `The rectangle’s area is the polynomial, and area = length × width: ${T(`${P}=${facs}`)}. <b>Check by expanding:</b> ${T(`${facs}=${polyT(prods)}=${P}`)} ✓`,
        run: (c2) => c2.fadeIn(res, 420)
      });
      return steps;
    }
  };
}
const tileRect = makeTiles('From a pile of tiles to a rectangle', [
  { v: 's1', label: tex('x^2+7x+10') }, { v: 'n6', label: tex('x^2+5x+6') }, { v: 'sq', label: tex('x^2+6x+9') }, { v: 'no', label: tex('x^2+4x+5') },
  { sep: 'Example 1 check:' }, { v: 'e1', label: tex('x^2+9x+8') }, { sep: 'Example 2 check:' }, { v: 'e2', label: tex('x^2+8x+15') }]);
const tileNeg = makeTiles('Negative tiles, and zero pairs to finish the rectangle', [
  { v: 's4', label: tex('x^2+x-6') }, { v: 'm6', label: tex('x^2-x-6') }, { v: 'p3', label: tex('x^2-4x+3') },
  { sep: 'Example 8 check:' }, { v: 'e8a', label: '(a)' }, { v: 'e8c', label: '(c)' }]);

/* ============ 2. Expand (x + p)(x + q), then read it backwards ============ */
const EG = { gen: null, a1: [3, 4], a2: [1, 9], a3: [6, 6], a4: [7, 3], a5: [-4, -3], a6: [9, -5], y9: [4, 6, 'y'], yb: [-3, 5, 'y'] };
function makeExpand(title, choices, value) {
  return {
    title, height: 450, choices, value,
    intro: (k) => { const d = EG[k]; return d ? `Expand ${T(`(${binT('x', d[0], d[2])})(${binT('x', d[1], d[2])})`)}, then look at where each number in the answer came from.` : `What happens when we expand ${T('(x+p)(x+q)')} for <b>any</b> two integers ${T('p')} and ${T('q')}?`; },
    make(stage, key, ex) {
      const W = ex.W, d = EG[key], gen = !d;
      const p = gen ? 'p' : d[0], q = gen ? 'q' : d[1], w = gen ? '' : (d[2] || '');
      const xw = w ? 'x' + w : 'x', w2 = w ? w + '^2' : '';
      const facP = gen ? 'x+p' : binT('x', p, w), facQ = gen ? 'x+q' : binT('x', q, w), prodT = `(${facP})(${facQ})`;
      let F = 'x^2', O, I, L, Ls, L2, fin, sumS, prodS, bS, cS;
      if (gen) { O = 'qx'; I = 'px'; L = 'pq'; L2 = '=x^2+(p+q)x+pq'; fin = 'x^2+(p+q)x+pq'; sumS = 'p+q'; prodS = 'pq'; bS = 'p+q'; cS = 'pq'; }
      else {
        const tO = { c: q, v: w ? { x: 1, [w]: 1 } : { x: 1 } }, tI = { c: p, v: w ? { x: 1, [w]: 1 } : { x: 1 } }, tL = { c: p * q, v: w ? { [w]: 2 } : {} };
        O = termT(tO, true); I = termT(tI, true); L = termT(tL, true);
        L2 = `=x^2+(${p}+${par(q)})${xw}+` + (w2 ? `(${p}\\cdot${par(q)})${w2}` : `${par(p)}\\cdot${par(q)}`);
        fin = polyT(collect([{ c: 1, v: { x: 2 } }, tO, tI, tL])); sumS = `${p}+${par(q)}=${p + q}`; prodS = `${par(p)}\\times${par(q)}=${p * q}`; bS = String(p + q); cS = String(p * q);
      }
      const cells = [[F, O], [I, L]], cols = [[TEAL, AMB], [PUR, BLU]], neg = (s) => /^-/.test(s);
      /* the grid */
      const gx = 30, gy = 64, hw = 76, cw = 150, hh = 54, rh = 96;
      const gb = (x, y, wd, ht, cls, html) => { const e = add(stage, box(h('div', 'u4l2-gg ' + cls, html), wd, ht), x, y); hide(e); return e; };
      const gt = add(stage, h('div', 'u4l2-gt c', 'four-cell grid'), gx + (hw + 2 * cw) / 2, gy - 22); hide(gt);
      const heads = [gb(gx, gy, hw, hh, 'hd x', K('\\times')), gb(gx + hw, gy, cw, hh, 'hd', K('x')), gb(gx + hw + cw, gy, cw, hh, 'hd', K(gen ? '+q' : (q < 0 ? '' : '+') + termT({ c: q, v: w ? { [w]: 1 } : {} }, true))),
        gb(gx, gy + hh, hw, rh, 'hd', K('x')), gb(gx, gy + hh + rh, hw, rh, 'hd', K(gen ? '+p' : (p < 0 ? '' : '+') + termT({ c: p, v: w ? { [w]: 1 } : {} }, true)))];
      const cellEls = [0, 1].map((ri) => [0, 1].map((ci) => { const s = cells[ri][ci], e = gb(gx + hw + ci * cw, gy + hh + ri * rh, cw, rh, 'in' + (!gen && neg(s) ? ' neg' : ''), `<span>${K(s)}</span>`); e.style.setProperty('--pc', cols[ri][ci]); e.firstChild.style.opacity = 0; return e; }));
      const tags = ['F', 'O', 'I', 'L'].map((t, i) => { const [ri, ci] = [[0, 0], [0, 1], [1, 0], [1, 1]][i]; const e = add(stage, h('div', 'u4l2-ftag', t), gx + hw + ci * cw + 8, gy + hh + ri * rh + 6); e.style.color = FOILC[i]; hide(e); return e; });
      /* the written lines */
      const lx = 428, sz = w ? 'u4l2-el xs' : 'u4l2-el s';
      const L1 = add(stage, h('div', sz, K(`${prodT}\\htmlClass{u4l2-e0}{=${tc(TEAL, F)}}\\htmlClass{u4l2-e1}{${tc(AMB, (neg(O) ? '' : '+') + O)}}\\htmlClass{u4l2-e2}{${tc(PUR, (neg(I) ? '' : '+') + I)}}\\htmlClass{u4l2-e3}{${tc(BLU, (neg(L) ? '' : '+') + L)}}`)), lx, 70);
      const es = [0, 1, 2, 3].map((i) => spans(L1, 'u4l2-e' + i)); hide(...es.flat());
      const L2e = add(stage, h('div', sz, K(`\\phantom{${prodT}}${L2}`)), lx, 124); hide(L2e);
      const L3e = gen ? null : add(stage, h('div', sz + ' u4l2-good', K(`\\phantom{${prodT}}=${fin}`)), lx, 176); hide(L3e);
      const bx = add(stage, h('div', 'u4l2-sbox sum', `<div class="u4l2-sbh">sum → ${T('b')}</div>${K(sumS)}`), lx, 238), cx = add(stage, h('div', 'u4l2-sbox prod', `<div class="u4l2-sbh">product → ${T('c')}</div>${K(prodS)}`), lx + 250, 238); hide(bx, cx);
      /* backwards */
      const mid = W / 2, by = 386;
      const bl = add(stage, h('div', 'u4l2-bk r', K(prodT)), mid - 110, by), br2 = add(stage, h('div', 'u4l2-bk l', K(fin)), mid + 110, by); hide(bl, br2);
      const svg = add(stage, svgEl('svg', { class: 'u4l2-arw', width: 220, height: 90, viewBox: '0 0 220 90' }), mid - 110, by - 45); hide(svg);
      svg.innerHTML = `<path d="M20 30 H196" stroke="${TEAL}" stroke-width="3.5" stroke-linecap="round"/><path d="M186 21 L200 30 L186 39" fill="none" stroke="${TEAL}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M200 62 H24" stroke="${AMB}" stroke-width="3.5" stroke-linecap="round"/><path d="M34 53 L20 62 L34 71" fill="none" stroke="${AMB}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="110" y="20" text-anchor="middle" class="u4l2-arwt" fill="${TEAL}">expanding</text><text x="110" y="88" text-anchor="middle" class="u4l2-arwt" fill="${AMB}">factoring</text>`;
      const fillCell = (c, ri, ci, delay = 0) => { const e = cellEls[ri][ci]; return Promise.all([c.sleep(delay).then(() => e.classList.add('on')), c.anim(e.firstChild, [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], 380, { delay }), c.fadeIn(tags[ri * 2 + ci], 260, { delay })]); };
      const qT = gen ? 'q' : termT({ c: q, v: w ? { [w]: 1 } : {} }, true), pT = gen ? 'p' : termT({ c: p, v: w ? { [w]: 1 } : {} }, true);
      const steps = [{
        cap: gen ? `Expand ${T(prodT)} for <b>any</b> integers ${T('p')} and ${T('q')}. One bracket goes down the side of a four-cell grid, the other across the top.`
          : `Expand ${T(prodT)} with a four-cell grid: ${T(facP)} down the side, ${T(facQ)} across the top. Each cell is (row) × (column).`,
        run: (c) => Promise.all([c.fadeIn(gt, 300), ...heads.map((e, i) => c.fadeIn(e, 300, { delay: i * 70 })), ...cellEls.flat().map((e) => c.fadeIn(e, 300, { delay: 300 }))])
      }, {
        cap: `<b>F</b>irst: ${T('x\\cdot x=x^2')}.`,
        run: (c) => Promise.all([fillCell(c, 0, 0), showSpans(c, es[0], 320, 150)])
      }, {
        cap: `<b>O</b>utside and <b>I</b>nside: ${T(`x\\cdot ${par(qT)}=${O}`)} and ${T(`${par(pT)}\\cdot x=${I}`)}. Both are ${T(xw)}-terms, so they are <b>like terms</b>.`,
        run: (c) => Promise.all([fillCell(c, 0, 1), fillCell(c, 1, 0, 250), showSpans(c, es[1], 320, 150), showSpans(c, es[2], 320, 400)])
      }, {
        cap: `<b>L</b>ast: ${T(`${par(pT)}\\cdot ${par(qT)}=${L}`)}, the only term ${w || gen ? `with no ${T('x')}` : 'with no letter'}.${w ? ` ${T(`${w}\\cdot ${w}=${w}^2`)}: the ${T(w)} rides along.` : ''}`,
        run: (c) => Promise.all([fillCell(c, 1, 1), showSpans(c, es[3], 320, 150)])
      }, {
        cap: gen ? `Collect the two middle terms: ${T('qx+px=(p+q)x')}. So ${T(`${prodT}=x^2+(p+q)x+pq`)}, for every ${T('p')} and ${T('q')}.`
          : `Collect the two middle terms: ${T(`${O}${neg(I) ? '' : '+'}${I}=${termT({ c: p + q, v: w ? { x: 1, [w]: 1 } : { x: 1 } }, true)}`)}. So ${T(`${prodT}=${fin}`)}.`,
        run: async (c) => {
          await Promise.all([pulse(c, cellEls[0][1], 1.06), pulse(c, cellEls[1][0], 1.06)]);
          cellEls[0][1].classList.add('like'); cellEls[1][0].classList.add('like');
          await c.fadeIn(L2e, 380); if (L3e) await c.fadeIn(L3e, 380, { delay: 150 });
        }
      }, {
        cap: gen ? `Look where the numbers come from. The coefficient of ${T('x')} is the <b>sum</b> ${T('p+q')}; the constant term is the <b>product</b> ${T('pq')}.`
          : `Look where the numbers come from. ${T(`b=${bS}`)} is the <b>sum</b> ${T(`${p}+${par(q)}`)}, and ${T(`c=${cS}`)} is the <b>product</b> ${T(`${par(p)}\\times${par(q)}`)}.`,
        run: (c) => Promise.all([c.pop(bx, 420), c.pop(cx, 420, { delay: 200 })])
      }, {
        cap: gen ? `Now run it <b>backwards</b>. To factor ${T('x^2+bx+c')}, find two integers whose <b>product is</b> ${T('c')} and whose <b>sum is</b> ${T('b')}. Factoring is expanding run backwards.`
          : `Now run it <b>backwards</b>: to factor ${T(fin)}, find two integers with <b>product</b> ${T(cS)} and <b>sum</b> ${T(bS)}. They are ${T(String(p))} and ${T(String(q))}, so ${T(`${fin}=${prodT}`)}.${w ? ` Same pair as ${T(`${triT(p + q, p * q)}=(${binT('x', p)})(${binT('x', q)})`)}.` : ''}`,
        run: (c) => Promise.all([c.fadeIn(bl, 350), c.fadeIn(br2, 350, { delay: 150 }), c.anim(svg, [{ opacity: 0 }, { opacity: 1 }], 400, { delay: 300 })])
      }];
      return steps;
    }
  };
}
const expandGrid = makeExpand('Expand, then read it backwards', [{ v: 'gen', label: tex('(x+p)(x+q)') }, { sep: 'Example 3 check:' },
  { v: 'a1', label: tex('(x+3)(x+4)') }, { v: 'a2', label: tex('(x+1)(x+9)') }, { v: 'a3', label: tex('(x+6)(x+6)') }, { v: 'a4', label: tex('(x+7)(x+3)') }, { v: 'a5', label: tex('(x-4)(x-3)') }, { v: 'a6', label: tex('(x+9)(x-5)') }]);
const twoVar = makeExpand('Why the second variable tags along', [{ sep: 'Example 9 check:' }, { v: 'y9', label: tex('(x+4y)(x+6y)') }, { sep: 'Another:' }, { v: 'yb', label: tex('(x-3y)(x+5y)') }], 'y9');

/* ============ 2. The sum–product search (Example 4's tables) ============ */
const PT = { d: [7, 12], a2: [13, 40], a3: [9, 18], a4: [6, 9], b1: [-10, 21], b2: [-13, 12], b3: [1, -12], b4: [-22, 40] };
const pairTable = {
  title: 'The sum–product search',
  height: 360,
  choices: [{ v: 'd', label: 'sum 7, product 12' }, { sep: 'Example 4 check (sum, product):' }, ...['a2', 'a3', 'a4', 'b1', 'b2', 'b3', 'b4'].map((k) => ({ v: k, label: tex(`${PT[k][0]},\\ ${PT[k][1]}`) }))],
  intro: (k) => `Find two integers with <b>sum</b> ${T(String(PT[k][0]))} and <b>product</b> ${T(String(PT[k][1]))}. Guessing works for small numbers; a <b>list</b> never misses.`,
  make(stage, key, ex) {
    const W = ex.W, [s, p] = PT[key];
    const tgt = add(stage, h('div', 'u4l2-tgt'), 24, 18);
    tgt.innerHTML = `<div><small>sum ${T('b')}</small>${K(String(s))}</div><div><small>product ${T('c')}</small>${K(String(p))}</div>`;
    const sg = signsMini(stage, 24, 136);
    const sp = searchPanel(stage, 356, 18, W - 356 - 18, s, p, { title: `Factor pairs of ${Math.abs(p)} → signed → sum`, row: rowPlain });
    const hit = sp.hit, ry = 18 + 40 + sp.rows.length * 42 + 14;
    const res = add(stage, h('div', 'u4l2-pres'), 356, ry); hide(res);
    const [f1, f2] = ordered(hit.m, hit.n, p);
    res.innerHTML = `<div class="u4l2-pbig">The integers: ${K(`${hit.m},\\ ${hit.n}`)}</div><div class="u4l2-pso">So ${K(`${triT(s, p)}=(${binT('x', f1)})(${binT('x', f2)})`)}</div>`;
    return [{
      cap: signsCap(s, p, true),
      run: (c) => sg.light(c, s, p)
    }, {
      cap: `List the factor pairs of ${Math.abs(p)} in order, give them the right signs, and add. Only one pair has sum ${T(String(s))}.`,
      run: (c) => sp.run(c)
    }, {
      cap: `The integers are <b>${T(`${hit.m}`)} and ${T(`${hit.n}`)}</b>: product ${T(`${par(hit.m)}\\times${par(hit.n)}=${p}`)}, sum ${T(sumT(hit))}. That pair factors ${T(triT(s, p))}.`,
      run: (c) => c.fadeIn(res, 400)
    }];
  }
};

/* ============ 3 & 5. Factoring by inspection: common factor, signs, pair, check ============ */
const IN = {
  d1: 'x^2+11x+24', n15: 'x^2-2x-15',
  a5: 'x^2+9x+14', c5: 'x^2-15x+14', d5: 'm^2-13m+12', g5: '3x^2-30x+48', h5: '2x^3+24x^2+40x',
  a6: 'x^2-x-20', b6: 'x^2+5x-24', c6: 'a^2-9a-10',
  a7: 'a^2+8a-33', b7: '3t^2-24t+45', c7: 'x^2-5x-9', d7: '3x^4-12x^3-36x^2',
  n10: 'x^2-xy-12y^2', a10: 'x^2+14xy+45y^2', b10: 'x^2+55xy-56y^2', c10: '2a^2-10ab-168b^2'
};
function analyse(e) {
  const terms = parsePoly(e), g = gcfT(terms), hasG = g.c !== 1 || Object.keys(g.v).length > 0, q = terms.map((t) => divT(t, g));
  const v = Object.keys(q[0].v).find((k) => q[0].v[k] === 2), w = Object.keys(q[2].v).find((k) => k !== v) || '';
  return { terms, g, hasG, q, v, w, b: q[1].c, c: q[2].c, gT: hasG ? bodyT(g) : '' };
}
function makeInspect(title, choices) {
  return {
    title, height: 520, choices,
    intro: (k) => `Factor ${T(IN[k])} completely: common factor first, then the sum–product pair, then check.`,
    make(stage, key, ex) {
      const W = ex.W, A = analyse(IN[key]), { terms, g, hasG, q, v, w, b, c, gT } = A;
      const rows = searchRows(b, c), hit = rows.find((r) => r.ok) || null;
      const inner = polyT(q), full = polyT(terms);
      const fac = (n) => `(${binT(v, n, w)})`;
      let ansT = '', prods = [], f1 = 0, f2 = 0;
      if (hit) {
        [f1, f2] = ordered(hit.m, hit.n, c);
        ansT = gT + fac(f1) + fac(f2);
        const one = { c: 1, v: { [v]: 1 } }, k1 = { c: f1, v: w ? { [w]: 1 } : {} }, k2 = { c: f2, v: w ? { [w]: 1 } : {} };
        prods = [mulT(one, one), mulT(one, k2), mulT(k1, one), mulT(k1, k2)];
      }
      /* row A: the question, with the answer waiting */
      add(stage, h('div', 'u4l2-iq', 'Factor completely'), 24, 12);
      const qa = add(stage, h('div', 'u4l2-ie', K(`${full}\\htmlClass{u4l2-ia}{{}=${hit ? ansT : '\\ ?'}}`)), 24, 36);
      const qaS = spans(qa, 'u4l2-ia'); hide(...qaS);
      /* row B: the common factor */
      const gEls = [];
      let gLine = null, gNote = null;
      if (hasG) {
        terms.forEach((t, i) => { const e = add(stage, h('div', 'u4l2-gc', `<div>${K(termT(t, true))}</div><div class="dv">${K(`\\div ${gT}`)}</div><div class="qt">${K(termT(q[i], true))}</div>`), 24 + i * 150, 96); hide(e); gEls.push(e); });
        gLine = add(stage, h('div', 'u4l2-gl', K(`=${gT}(${inner})`)), 490, 118); hide(gLine);
      } else {
        gNote = add(stage, h('div', 'u4l2-gn', `Common factor? ${terms.map((t) => T(termT(t, true))).join(', ')} share no factor except 1, so there is <b>nothing to take out</b>.`), 24, 110); hide(gNote);
      }
      /* row C: target, signs, search */
      const tgt = add(stage, h('div', 'u4l2-need', `Need: product ${K(String(c))} &nbsp; sum ${K(String(b))}`), 24, 192); hide(tgt);
      const sg = signsMini(stage, 24, 252);
      const sp = searchPanel(stage, 352, 192, W - 352 - 18, b, c, { title: `Factor pairs of ${fmt(Math.abs(c))} → signed → sum`, row: rowPlain, cls: rows.length > 4 ? 'xs' : 'sm' });
      /* row D: check */
      const ck1 = hit ? add(stage, h('div', 'u4l2-ck', `<b>Check:</b> ${K(`${fac(f1)}${fac(f2)}=${polyT(prods)}=${polyT(collect(prods))}`)}${hasG ? '' : ' <span class="ok">✓</span>'}`), 24, 440) : null;
      const ck2 = hit && hasG ? add(stage, h('div', 'u4l2-ck', `${K(`${gT}(${polyT(collect(prods))})=${full}`)} <span class="ok">✓</span>`), 106, 478) : null;
      hide(ck1, ck2);
      const stamp = hit ? null : add(stage, h('div', 'u4l2-stamp', 'cannot be factored<small>over the integers</small>'), 40, 412);
      if (stamp) hide(stamp);

      const tri = triT(b, c, v, w), xw = w ? v + w : v;
      const steps = [{
        cap: hasG ? `<b>Common factor first.</b> Every term is divisible by ${T(gT)}: divide each one and write ${T(gT)} out front. ${T(`${full}=${gT}(${inner})`)}.`
          : `<b>Common factor first?</b> ${terms.map((t) => T(termT(t, true))).join(', ')} have no common factor except 1, so go straight to the pair.`,
        run: (c2) => hasG ? Promise.all([...gEls.map((e, i) => c2.fadeIn(e, 320, { delay: i * 160 })), c2.fadeIn(gLine, 380, { delay: 600 })]) : c2.fadeIn(gNote, 350)
      }, {
        cap: `${hasG ? `Inside the bracket: ${T(tri)}. ` : ''}We need two integers with <b>product</b> ${T(String(c))} and <b>sum</b> ${T(String(b))}. ` + signsCap(b, c, v === 'b' || w === 'b'),
        run: (c2) => Promise.all([c2.fadeIn(tgt, 300), sg.light(c2, b, c)])
      }, {
        cap: hit ? `List the factor pairs of ${fmt(Math.abs(c))}, sign them, add: ${T(sumT(hit))} ✓.${w ? ` The second variable, ${T(w)}, doesn’t change the search: the numbers are the same as for ${T(triT(b, c, v))}.` : ''}`
          : `List the factor pairs of ${fmt(Math.abs(c))}, sign them, add. None of the sums is ${T(String(b))}.`,
        run: (c2) => sp.run(c2)
      }];
      if (!hit) {
        steps.push({
          cap: `No pair works, so ${T(full)} <b>cannot be factored over the integers</b>. That’s a complete answer, not a mistake.`,
          run: async (c2) => { await Promise.all([showSpans(c2, qaS, 300)]); await stampIn(c2, stamp); }
        });
        return steps;
      }
      steps.push({
        cap: `${T(`${hit.m}`)} and ${T(`${hit.n}`)} go into the brackets${w ? `, each with a ${T(w)}` : ''}: ${T(`${tri}=${fac(f1)}${fac(f2)}`)}.${hasG ? ` Keep the common factor in front: ${T(`${full}=${ansT}`)}.` : ''}`,
        run: (c2) => showSpans(c2, qaS, 420)
      });
      steps.push({
        cap: `<b>Check by expanding.</b> ${T(`${fac(f1)}${fac(f2)}=${polyT(collect(prods))}`)}${hasG ? `, and ${T(`${gT}(${polyT(collect(prods))})=${full}`)}` : ''} ✓ Factoring is expanding run backwards.`,
        run: (c2) => Promise.all([c2.fadeIn(ck1, 380), ck2 ? c2.fadeIn(ck2, 380, { delay: 250 }) : null])
      });
      return steps;
    }
  };
}
const inspectA = makeInspect('Factoring by inspection', [{ v: 'd1', label: tex(IN.d1) }, { sep: 'Example 5 check:' }, ...['a5', 'c5', 'd5', 'g5', 'h5'].map((k) => ({ v: k, label: '(' + k[0] + ')' }))]);
const inspectB = makeInspect('Negative c, and every case at once', [{ v: 'n15', label: tex(IN.n15) }, { sep: 'Example 6 check:' }, ...['a6', 'b6', 'c6'].map((k) => ({ v: k, label: '(' + k[0] + ')' })), { sep: 'Example 7 check:' }, ...['a7', 'b7', 'c7', 'd7'].map((k) => ({ v: k, label: '(' + k[0] + ')' }))]);
const inspectC = makeInspect('Two variables, by inspection', [{ v: 'n10', label: tex(IN.n10) }, { sep: 'Example 10 check:' }, ...['a10', 'b10', 'c10'].map((k) => ({ v: k, label: '(' + k[0] + ')' }))]);

/* ============ 3. Check by expanding: catch the error ============ */
const EC = {
  ok: { o: 'x^2-2x-15', f: [-5, 3], why: `Every term matches, and both sides give the same number at ${T('x=2')}. This factoring is <b>correct</b>.` },
  e1: { o: 'x^2-2x-15', f: [5, -3], fix: '(x-5)(x+3)', why: `<b>Right product, wrong sum:</b> ${T('(5)(-3)=-15')} ✓, but ${T('5+(-3)=+2')}, not ${T('-2')}. The number further from 0 must carry the sign of ${T('b')}. Fix: ${T('(x-5)(x+3)')}.` },
  e2: { o: 'x^2+11x+24', f: [24, 1], fix: '(x+3)(x+8)', why: `<b>Right product, wrong sum:</b> ${T('24\\times1=24')} ✓, but ${T('24+1=25')}, not 11. Keep listing factor pairs of 24: ${T('3+8=11')}. Fix: ${T('(x+3)(x+8)')}.` },
  e3: { o: '3x^2+15x+18', f: [2, 3], fix: '3(x+2)(x+3)', why: `<b>The common factor was dropped.</b> ${T('(x+2)(x+3)')} is only ${T('x^2+5x+6')}, a third of the trinomial. Take out the 3 first. Fix: ${T('3(x+2)(x+3)')}.` }
};
const errorCheck = {
  title: 'Check by expanding: catch the error',
  height: 456,
  choices: [{ v: 'ok', label: tex('(x-5)(x+3)') }, { sep: 'Find the error:' }, { v: 'e1', label: tex('(x+5)(x-3)') }, { v: 'e2', label: tex('(x+24)(x+1)') }, { v: 'e3', label: tex('(x+2)(x+3)') }],
  intro: (k) => { const d = EC[k]; return `Someone wrote ${T(`${d.o}=${'(' + binT('x', d.f[0]) + ')(' + binT('x', d.f[1]) + ')'}`)}. Is it right? Don’t trust it: <b>expand it and compare</b>.`; },
  make(stage, key, ex) {
    const W = ex.W, d = EC[key], O = parsePoly(d.o), [m, n] = d.f, claim = `(${binT('x', m)})(${binT('x', n)})`;
    const one = { c: 1, v: { x: 1 } }, km = { c: m, v: {} }, kn = { c: n, v: {} };
    const prods = [mulT(one, one), mulT(one, kn), mulT(km, one), mulT(km, kn)], col = collect(prods);
    add(stage, h('div', 'u4l2-iq', 'Claim'), 24, 12);
    add(stage, h('div', 'u4l2-ie', K(`${d.o}\\overset{?}{=}${claim}`)), 24, 34);
    const l1 = add(stage, h('div', 'u4l2-el', K(`${claim}=` + prods.map((t, i) => `\\htmlClass{u4l2-c${i}}{${tc(FOILC[i], termT(t, i === 0))}}`).join(''))), 24, 100);
    const cs = [0, 1, 2, 3].map((i) => spans(l1, 'u4l2-c' + i)); hide(...cs.flat());
    const l2 = add(stage, h('div', 'u4l2-el', K(`\\phantom{${claim}}=${polyT(col)}`)), 24, 150); hide(l2);
    /* term-by-term comparison */
    const cmp = add(stage, h('div', 'u4l2-cmp'), 24, 212); hide(cmp);
    const deg = (t) => degT(t), byDeg = (list, dd) => list.find((t) => deg(t) === dd);
    const marks = [];
    cmp.innerHTML = `<div class="u4l2-cmh">original</div>${[2, 1, 0].map((dd) => `<div class="u4l2-cmt">${K(byDeg(O, dd) ? termT(byDeg(O, dd), dd === 2) : '0')}</div>`).join('')}
      <div class="u4l2-cmh">expanded</div>${[2, 1, 0].map((dd) => `<div class="u4l2-cmt">${K(byDeg(col, dd) ? termT(byDeg(col, dd), dd === 2) : '0')}</div>`).join('')}
      <div></div>${[2, 1, 0].map((dd) => { const a = byDeg(O, dd), b2 = byDeg(col, dd), ok = (a ? a.c : 0) === (b2 ? b2.c : 0); return `<div class="u4l2-cmm ${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'}</div>`; }).join('')}`;
    cmp.querySelectorAll('.u4l2-cmm').forEach((e) => { hide(e); marks.push(e); });
    const same = marks.every((e) => e.classList.contains('ok'));
    const stamp = add(stage, h('div', 'u4l2-vst ' + (same ? 'ok' : 'no'), same ? 'equal ✓' : 'not equal ✗'), 600, 236); hide(stamp);
    /* x = 2 */
    const v1 = evalT(O, 2), v2 = (2 + m) * (2 + n);
    const sub = add(stage, h('div', 'u4l2-sub', `<b>At ${T('x=2')}:</b> ${K(`${d.o.replace(/x/g, '(2)')}=${v1}`)} &nbsp;&nbsp; ${K(`(2${sgn(m)})(2${sgn(n)})=${v2}`)} <span class="${v1 === v2 ? 'ok' : 'red'}">${v1 === v2 ? '✓ same' : '✗ different'}</span>`), 24, 342); hide(sub);
    const why = add(stage, h('div', 'u4l2-why ' + (same ? 'ok' : ''), d.fix ? `Fix: ${K(`${d.o}=${d.fix}`)}` : `${K(`${d.o}=${claim}`)} ✓`), 24, 392); hide(why);
    return [{
      cap: `Expand the right side with FOIL: ${T(`x\\cdot x`)}, ${T(`x\\cdot${par(n)}`)}, ${T(`${par(m)}\\cdot x`)}, ${T(`${par(m)}\\cdot${par(n)}`)}.`,
      run: (c) => Promise.all(cs.map((s, i) => showSpans(c, s, 300, i * 260)))
    }, {
      cap: `Collect the like terms: ${T(`${claim}=${polyT(col)}`)}.`,
      run: (c) => c.fadeIn(l2, 380)
    }, {
      cap: same ? `Compare term by term with ${T(d.o)}: every term matches. The two sides are <b>equal</b>.` : `Compare term by term with ${T(d.o)}. ${marks.filter((e) => e.classList.contains('no')).length === 3 ? 'No term matches' : 'They don’t match'}: the factoring is <b>wrong</b>.`,
      run: async (c) => { await c.fadeIn(cmp, 300); for (const e of marks) await c.pop(e, 300); await stampIn(c, stamp); }
    }, {
      cap: `A quick second check: put ${T('x=2')} into both sides. ${v1 === v2 ? `Both give ${v1}.` : `${v1} and ${v2} are different numbers, so the two sides can’t be equal.`}`,
      run: (c) => c.fadeIn(sub, 380)
    }, {
      cap: d.why,
      run: (c) => c.fadeIn(why, 380)
    }];
  }
};

/* ============ static figures: the tile key, tile piles and tile rectangles ============ */
const TC = { k2: ['#3a9a90', '#0f5f5a'], k1: ['#e0a33a', '#a8650a'], k0: ['#6f8fc4', '#34507d'] };
function svgTile(x, y, w, hh, kind, s) {
  const [f, o] = TC[kind];
  let r = `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="2" fill="${s > 0 ? f : '#fff'}" stroke="${o}" stroke-width="${s > 0 ? 1.5 : 2}"/>`;
  if (s < 0) { const L = kind === 'k2' ? Math.min(w, hh) * 0.28 : Math.min(w, hh) * 0.5, cx = x + w / 2, cy = y + hh / 2; r += `<path d="M${cx - L / 2} ${cy}H${cx + L / 2}" stroke="${o}" stroke-width="${kind === 'k2' ? 3 : 2.2}" stroke-linecap="round"/>`; }
  return r;
}
function pileSVG(a, b, c, X, U) {
  const g1 = Math.round(U * 0.35), out = [];
  let x = 2; const y = 2;
  for (let i = 0; i < Math.abs(a); i++) { out.push(svgTile(x, y, X, X, 'k2', Math.sign(a))); x += X + g1 * 2; }
  x += g1;
  for (let i = 0; i < Math.abs(b); i++) { out.push(svgTile(x, y, U, X, 'k1', Math.sign(b))); x += U + g1; }
  x += g1 * 2;
  for (let i = 0; i < Math.abs(c); i++) out.push(svgTile(x + (i % 4) * (U + g1), y + Math.floor(i / 4) * (U + g1), U, U, 'k0', Math.sign(c)));
  const Wd = x + Math.min(4, Math.abs(c)) * (U + g1) + 2, Hd = Math.max(X, Math.ceil(Math.abs(c) / 4) * (U + g1)) + 4;
  return `<svg viewBox="0 0 ${Wd} ${Hd}" width="${Wd}" height="${Hd}" class="u4l2-fsvg">${out.join('')}</svg>`;
}
function rectSVG(r, k, X, U) {
  const out = [], sc = Math.sign(r * k), ox = 2, oy = 2;
  out.push(svgTile(ox, oy, X, X, 'k2', 1));
  for (let i = 0; i < Math.abs(k); i++) out.push(svgTile(ox + X + i * U, oy, U, X, 'k1', Math.sign(k)));
  for (let j = 0; j < Math.abs(r); j++) out.push(svgTile(ox, oy + X + j * U, X, U, 'k1', Math.sign(r)));
  for (let i = 0; i < Math.abs(k); i++) for (let j = 0; j < Math.abs(r); j++) out.push(svgTile(ox + X + i * U, oy + X + j * U, U, U, 'k0', sc));
  const wd = X + Math.abs(k) * U, ht = X + Math.abs(r) * U;
  out.push(`<rect x="${ox}" y="${oy}" width="${wd}" height="${ht}" fill="none" stroke="#1c2230" stroke-width="2.6"/>`);
  return { html: `<svg viewBox="0 0 ${wd + 4} ${ht + 4}" width="${wd + 4}" height="${ht + 4}" class="u4l2-fsvg">${out.join('')}</svg>`, wd, ht };
}
function mountFigures() {
  document.querySelectorAll('[data-pile]').forEach((el) => {
    const [a, b, c] = el.dataset.pile.split(',').map(Number), s = Number(el.dataset.s || 1);
    el.innerHTML = pileSVG(a, b, c, Math.round(76 * s), Math.round(19 * s));
  });
  document.querySelectorAll('[data-rect]').forEach((el) => {
    const [r, k] = el.dataset.rect.split(',').map(Number), s = Number(el.dataset.s || 1), X = Math.round(76 * s), U = Math.round(19 * s);
    const R = rectSVG(r, k, X, U), lab = el.dataset.lab;
    const top = lab === '?' ? '?' : K(binT('x', k)), side = lab === '?' ? '?' : K(binT('x', r));
    el.classList.add('u4l2-rfig');
    el.innerHTML = `<div class="u4l2-rtop" style="width:${R.wd + 4}px">${top}</div><div class="u4l2-rrow"><div class="u4l2-rside">${side}</div>${R.html}</div>`;
  });
  document.querySelectorAll('.u4l2-key').forEach((el) => {
    const t = (kind, s, w, hh) => `<svg width="${w + 4}" height="${hh + 4}" viewBox="0 0 ${w + 4} ${hh + 4}">${svgTile(2, 2, w, hh, kind, s)}</svg>`;
    const item = (kind, s, w, hh, lab) => `<div class="u4l2-ki">${t(kind, s, w, hh)}<span>${K(lab)}</span></div>`;
    el.innerHTML = `<div class="u4l2-kh">Tile key <span class="muted">(every tile picture in this unit)</span></div><div class="u4l2-krow">
      ${item('k2', 1, 64, 64, 'x^2')}${item('k1', 1, 16, 64, 'x')}${item('k0', 1, 16, 16, '1')}<div class="u4l2-ksep"></div>
      ${item('k2', -1, 64, 64, '-x^2')}${item('k1', -1, 16, 64, '-x')}${item('k0', -1, 16, 16, '-1')}
      <div class="u4l2-kdim"><b>Sizes:</b> ${K('x^2')} is ${K('x')} by ${K('x')}; an ${K('x')}-tile is 1 by ${K('x')}; a unit tile is 1 by 1.<br><b>Negative</b> tiles are white with a minus sign.</div></div>`;
  });
}

/* ============ warm-up: the census taker's riddle ============ */
function mountWarm() {
  const host = document.getElementById('wu');
  if (!host) return;
  const cards = [...host.querySelectorAll('.u4l2-pc')];
  const setPc = (b, st) => { b.dataset.st = Math.max(Number(b.dataset.st || 0), st); };
  cards.forEach((b) => b.addEventListener('click', () => setPc(b, Math.min(2, Number(b.dataset.st || 0) + 1))));
  host.querySelectorAll('[data-wq]').forEach((btn) => btn.addEventListener('click', () => {
    const wq = btn.closest('.wq'), on = !wq.classList.contains('shown');
    wq.classList.toggle('shown', on);
    const k = btn.dataset.wq;
    if (!on) return;
    if (k === 'q1') cards.forEach((b) => setPc(b, 1));
    if (k === 'q2') { cards.forEach((b) => setPc(b, 2)); cards.find((b) => b.dataset.a === '6').classList.add('best'); }
    if (k === 'q3') { cards.forEach((b) => setPc(b, 2)); cards.find((b) => b.dataset.a === '4').classList.add('hit'); }
  }));
  const trios = [...host.querySelectorAll('.u4l2-tr')], grid = host.querySelector('.u4l2-trios'), plate = host.querySelector('#wu-plate');
  trios.forEach((b) => b.addEventListener('click', () => b.classList.add('open')));
  const act = (k) => {
    if (k === 'all') trios.forEach((b) => b.classList.add('open'));
    if (k === 'sums') { trios.forEach((b) => b.classList.add('open')); grid.classList.add('sums'); if (plate) plate.textContent = '13'; host.classList.add('plate13'); }
    if (k === 'clue') { trios.forEach((b) => b.classList.add('open')); grid.classList.add('sums', 'clue'); if (plate) plate.textContent = '13'; host.classList.add('plate13'); }
  };
  host.querySelectorAll('[data-tr]').forEach((b) => b.addEventListener('click', () => act(b.dataset.tr)));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
  document.querySelectorAll('[data-wqx]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { tileRect, tileNeg, expandGrid, twoVar, pairTable, inspectA, inspectB, inspectC, errorCheck };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountFigures(); mountWarm(); mountExplainers();
