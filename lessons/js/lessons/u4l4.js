/* Math 10C · Unit 4 · Lesson 4 — Difference of Squares: the explainers, the warm-up widgets and the small figures on this page.
 * Tile colours follow Unit 3 (x² teal, x amber, 1 slate); a negative tile is white with a coloured outline and a minus sign. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const box = (el, w, ht) => { el.style.width = w + 'px'; el.style.height = ht + 'px'; return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const K = (s, d) => tex(s, d);
const T = (s) => tex(s); // inline math in captions
const tn = (n) => fmt(n).replace(/ /g, '\\,'); // 3 596 → 3\,596 inside KaTeX
const cx1 = (k, v = 'x') => (k === 1 ? v : k + v); // 1x → x
const fadeOut = (c, el, ms = 300, o = {}) => c.anim(el, [{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], ms, o);
const appear = (c, el, ms = 350, o = {}) => c.anim(el, [{ opacity: 0 }, { opacity: 1 }], ms, o); // opacity only: safe on rotated / translated pieces
const moveTo = (c, el, x, y, ms = 650, o = {}) => c.anim(el, [{ left: el.style.left, top: el.style.top }, { left: x + 'px', top: y + 'px' }], ms, o);
const pulse = (c, el, s = 1.08, o = {}) => c.anim(el, [{ scale: '1' }, { scale: String(s) }, { scale: '1' }], 520, o); // `scale` never undoes a transform
const stampIn = (c, el) => c.anim(el, [{ opacity: 0, transform: 'scale(1.9) rotate(-12deg)' }, { opacity: 1, transform: 'scale(1) rotate(-4deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' });

/* dimension marks: a bar with end ticks and a KaTeX label */
function dimH(stage, x, y, w, label, below) {
  const bar = add(stage, box(h('div', 'u4l4-dbar h'), w, 12), x, y - 6);
  const lab = add(stage, h('div', 'u4l4-dim c', K(label)), x + w / 2, below ? y + 22 : y - 22);
  return [bar, lab];
}
function dimV(stage, x, y, ht, label, right) {
  const bar = add(stage, box(h('div', 'u4l4-dbar v'), 12, ht), x - 6, y);
  const lab = add(stage, h('div', 'u4l4-dim', K(label)), right ? x + 14 : x - 14, y + ht / 2);
  lab.style.translate = right ? '0 -50%' : '-100% -50%';
  return [bar, lab];
}
/* a row of math whose pieces can be animated one at a time. Pieces after the first that start with + − = get
 * proper binary/relation spacing (KaTeX treats "{}-7x" as a binary minus). */
function eqRow(pieces, cls = '') {
  const row = h('div', 'u4l4-eq ' + cls);
  row.parts = pieces.map((p, i) => { const s = h('span', 'u4l4-tk', K(p === '=' ? '{}={}' : i && /^[+\-=]/.test(p) ? '{}' + p : p)); row.appendChild(s); return s; });
  return row;
}
const strike = (c, els) => Promise.all(els.map((e) => { e.classList.add('u4l4-x'); return c.anim(e, [{ opacity: 1 }, { opacity: 0.35 }], 400); }));
const tileEl = (stage, kind, sgn, w, ht, x, y) => add(stage, box(h('div', `u4l4-tile ${kind} ${sgn > 0 ? 'pos' : 'neg'}`), w, ht), x, y);

/* ============ 1. The middle coefficient is 0: the sum–product search ============ */
const ZM = { n49: { v: 'x', k: 7 }, n25: { v: 'x', k: 5 }, n100: { v: 'x', k: 10 }, a: { v: 'w', k: 3 }, b: { v: 't', k: 11 }, d: { v: 'k', k: 6 } };
const zeroMiddle = {
  title: 'The middle coefficient is 0: find the pair',
  height: 440,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar (the expand check for x^2-100 is long)
  choices: [{ v: 'n49', label: tex('x^2-49') }, { v: 'n25', label: tex('x^2-25') }, { v: 'n100', label: tex('x^2-100') }, { sep: 'Example 1 check:' }, { v: 'a', label: '(a)' }, { v: 'b', label: '(b)' }, { v: 'd', label: '(d)' }],
  intro: (key) => { const { v, k } = ZM[key]; return `Factor ${T(`${v}^2-${k * k}`)} the Lesson 3 way: find two integers whose <b>product</b> is ${T('c')} and whose <b>sum</b> is ${T('b')}.`; },
  make(stage, key, ex) {
    const W = ex.W, { v, k } = ZM[key], c = k * k, e = `${v}^2-${c}`;
    const pairs = []; for (let p = 1; p <= k; p++) if (c % p === 0) { pairs.push([p, -c / p]); if (p !== c / p) pairs.push([-p, c / p]); }
    // left: the targets and the table of pairs
    const tgt = add(stage, h('div', 'u4l4-tgt', `<span>Need two integers:</span><b class="u4l4-tp">product ${K(String(-c))}</b><b class="u4l4-ts">sum ${K('0')}</b>`), 22, 18); hide(tgt);
    const th = add(stage, h('div', 'u4l4-trow u4l4-thead', '<span>pair</span><span>sum</span><span></span>'), 22, 74); hide(th);
    const rh = Math.min(34, 330 / pairs.length);
    const rows = pairs.map(([p, q], i) => {
      const s = p + q, r = add(stage, h('div', 'u4l4-trow' + (s === 0 ? ' win' : ''), `<span>${K(`${p},\\ ${q}`)}</span><span>${K(String(s))}</span><span class="u4l4-mk">${s === 0 ? '✓' : '✗'}</span>`), 22, 106 + i * rh);
      r.style.height = rh - 3 + 'px'; hide(r); return r;
    });
    // right: the algebra
    const px = 448;
    const L1 = add(stage, h('div', 'u4l4-eq big', K(`${e}=${v}^2+\\textcolor{#c27a0e}{0${v}}-${c}`)), px, 24); hide(L1);
    const L2 = add(stage, eqRow(['=', `${v}^2`, `+${k}${v}`, `-${k}${v}`, `-${c}`], 'big'), px + 4, 84); hide(L2);
    const zp = add(stage, h('div', 'u4l4-zp c', 'zero pair'), 0, 0); hide(zp);
    const L3 = add(stage, h('div', 'u4l4-eq big u4l4-boxed', K(`=(${v}+${k})(${v}-${k})`)), px, 160); hide(L3);
    const chk = add(stage, h('div', 'u4l4-chk'), px, 244); chk.style.width = (W - px - 18) + 'px'; hide(chk);
    chk.innerHTML = '<div class="u4l4-chk-h">Check: run it backwards (expand)</div>';
    const C1 = eqRow([`(${v}+${k})(${v}-${k})`, '=', `${v}^2`, `-${k}${v}`, `+${k}${v}`, `-${c}`]); chk.appendChild(C1);
    const C2 = h('div', 'u4l4-eq u4l4-ok', K(`=${v}^2-${c}`) + ' ✓'); chk.appendChild(C2); C2.style.opacity = 0;
    const rule = add(stage, h('div', 'u4l4-rule', `${K('x^2-k^2=(x-k)(x+k)')}<small>the pair is always ${K('k')} and ${K('-k')}</small>`), px, 356); hide(rule);
    const win = rows[pairs.findIndex(([p, q]) => p + q === 0)];
    return [{
      cap: `${T(e)} has no ${T(v)}-term: its <b>middle coefficient is 0</b>. Written as a trinomial, it is ${T(`${v}^2+0${v}-${c}`)}.`,
      run: (c2) => Promise.all([c2.fadeIn(L1, 400), c2.fadeIn(tgt, 400, { delay: 250 })])
    }, {
      cap: `List the factor pairs of ${T(String(-c))}: one number positive, one negative. Add each pair.`,
      run: (c2) => Promise.all([c2.fadeIn(th, 250), ...rows.map((r, i) => c2.fadeIn(r, 300, { delay: 120 + i * 110, from: 'translateX(-10px)' }))])
    }, {
      cap: `Only ${T(String(k))} and ${T(String(-k))} add to 0. They are <b>opposites</b>, and that happens because ${T(String(c))} is a perfect square: ${T(`${c}=${k}^2`)}.`,
      run: async (c2) => { win.classList.add('lit'); rows.forEach((r) => { if (r !== win) r.classList.add('dim'); }); await pulse(c2, win, 1.06); }
    }, {
      cap: `Split the middle term: ${T(`0${v}=+${cx1(k, v)}-${cx1(k, v)}`)}. Together they are a <b>zero pair</b>, so nothing has changed.`,
      run: async (c2) => {
        await c2.fadeIn(L2, 400);
        const a = L2.parts[2], b = L2.parts[3], x = (a.offsetLeft + b.offsetLeft + b.offsetWidth) / 2 + L2.offsetLeft;
        at(zp, x, 84 + L2.offsetHeight + 12); a.classList.add('u4l4-hl'); b.classList.add('u4l4-hl');
        await c2.pop(zp, 350);
      }
    }, {
      cap: `The pair ${T(String(k))} and ${T(String(-k))} gives the factors, just like Lesson 3: ${T(`${e}=(${v}+${k})(${v}-${k})`)}.`,
      run: (c2) => c2.pop(L3, 420)
    }, {
      cap: `Check by expanding, which is factoring run <b>backwards</b>. The middle terms ${T(`-${cx1(k, v)}`)} and ${T(`+${cx1(k, v)}`)} cancel, leaving ${T(`${v}^2-${c}`)} ✓`,
      run: async (c2) => {
        await c2.fadeIn(chk, 350);
        await strike(c2, [C1.parts[3], C1.parts[4]]);
        await c2.fadeIn(C2, 350);
      }
    }, {
      cap: `Every difference of squares works this way. If ${T('c=-k^2')}, the pair is always ${T('k')} and ${T('-k')}, so ${T('x^2-k^2=(x-k)(x+k)')}.`,
      run: (c2) => c2.pop(rule, 420)
    }];
  }
};

/* ============ 1. Algebra tiles: the rectangle needs a zero pair ============ */
const TR = { n4: 2, n9: 3, n1: 1, n16: 4 };
const tileRect = {
  title: 'Build the rectangle: add a zero pair',
  height: 470,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n9', label: tex('x^2-9') }, { v: 'n4', label: tex('x^2-4') }, { v: 'n1', label: tex('x^2-1') }, { v: 'n16', label: tex('x^2-16') }],
  intro: (key) => `Model ${T(`x^2-${TR[key] ** 2}`)} with algebra tiles, then try to arrange the tiles into a <b>rectangle</b>. The side lengths will be the factors.`,
  make(stage, key, ex) {
    const W = ex.W, k = TR[key], n = k * k, X = 140, U = 34, G = 3, ox = 118, oy = 96, side = X + G + k * (U + G);
    const kx = cx1(k);
    // pile on the right
    const px = 560;
    const xx = tileEl(stage, 'k2', 1, X, X, px, 40);
    const units = []; for (let i = 0; i < n; i++) units.push(tileEl(stage, 'k0', -1, U, U, px + 170 + (i % 4) * (U + 9), 40 + Math.floor(i / 4) * (U + 9)));
    hide(xx, ...units);
    const pileLab = add(stage, h('div', 'u4l4-plab', K(`x^2-${n}`)), px, 200); hide(pileLab);
    // gaps
    const gapT = add(stage, box(h('div', 'u4l4-gap'), k * (U + G) - G, X), ox + X + G, oy);
    const gapS = add(stage, box(h('div', 'u4l4-gap'), X, k * (U + G) - G), ox, oy + X + G);
    gapT.innerHTML = gapS.innerHTML = '<span>?</span>'; hide(gapT, gapS);
    // zero pairs (start in the tray on the right)
    const posX = [], negX = [];
    for (let i = 0; i < k; i++) { posX.push(tileEl(stage, 'k1', 1, U, X, px + i * (U + 8), 40)); negX.push(tileEl(stage, 'k1', -1, X, U, px + k * (U + 8) + 24, 40 + i * (U + 8))); }
    hide(...posX, ...negX);
    const zlab = add(stage, h('div', 'u4l4-zp', `zero pair${k > 1 ? 's' : ''}: ${K(`+${kx}-${kx}=0`)}`), px, 214); hide(zlab);
    const frame = add(stage, box(h('div', 'u4l4-frame'), side + 6, side + 6), ox - 3, oy - 3); hide(frame);
    const dT = dimH(stage, ox, oy - 26, side, `x+${k}`), dS = dimV(stage, ox - 26, oy, side, `x-${k}`);
    hide(...dT, ...dS);
    const E1 = add(stage, eqRow([`x^2-${n}`, '=', 'x^2', `+${kx}`, `-${kx}`, `-${n}`]), px, 262); hide(E1);
    const E2 = add(stage, h('div', 'u4l4-eq big u4l4-boxed', K(`x^2-${n}=(x+${k})(x-${k})`)), px, 322); hide(E2);
    const E3 = add(stage, h('div', 'u4l4-note', `Expanding: ${K(`(x+${k})(x-${k})=x^2\\textcolor{#c27a0e}{+${kx}-${kx}}-${n}`)}`), px - 40, 394); E3.style.whiteSpace = 'nowrap'; hide(E3);
    const unitPos = (i) => [ox + X + G + (i % k) * (U + G), oy + X + G + Math.floor(i / k) * (U + G)];
    return [{
      cap: `${T(`x^2-${n}`)} is one ${T('x^2')}-tile and ${n} <b>negative</b> unit ${n > 1 ? 'tiles' : 'tile'} (white, with a minus sign). Can they make a rectangle?`,
      run: (c) => Promise.all([c.pop(xx, 380), ...units.map((u, i) => c.pop(u, 300, { delay: 150 + i * 40 })), c.fadeIn(pileLab, 300, { delay: 200 })])
    }, {
      cap: `The ${T('x^2')}-tile goes in one corner and the unit tiles fill the opposite corner, a ${k}-by-${k} square. The two gaps need ${T('x')}-tiles, and there are <b>none</b>.`,
      run: async (c) => {
        await Promise.all([moveTo(c, xx, ox, oy, 600), fadeOut(c, pileLab, 250), ...units.map((u, i) => { const [x, y] = unitPos(i); return moveTo(c, u, x, y, 600, { delay: 60 + i * 12 }); })]);
        await Promise.all([c.fadeIn(gapT, 300), c.fadeIn(gapS, 300)]);
        await Promise.all([c.shake(gapT), c.shake(gapS)]);
      }
    }, {
      cap: `Add <b>zero pairs</b>: ${k} positive and ${k} negative ${T('x')}-${k > 1 ? 'tiles' : 'tile'}. ${T(`+${kx}-${kx}=0`)}, so the expression doesn’t change: ${T(`x^2-${n}=x^2+${kx}-${kx}-${n}`)}.`,
      run: async (c) => {
        await Promise.all([...posX.map((t, i) => c.pop(t, 320, { delay: i * 160 })), ...negX.map((t, i) => c.pop(t, 320, { delay: 80 + i * 160 }))]);
        await Promise.all([c.fadeIn(zlab, 300), c.fadeIn(E1, 350, { delay: 150 })]);
      }
    }, {
      cap: `Positive ${T('x')}-tiles go along the top, negative ones down the side. Check the corner: positive × negative gives <b>negative</b> unit tiles ✓, exactly what we have.`,
      run: async (c) => {
        await Promise.all([fadeOut(c, zlab, 250), fadeOut(c, gapT, 300), fadeOut(c, gapS, 300),
          ...posX.map((t, i) => moveTo(c, t, ox + X + G + i * (U + G), oy, 600, { delay: i * 60 })),
          ...negX.map((t, i) => moveTo(c, t, ox, oy + X + G + i * (U + G), 600, { delay: 150 + i * 60 }))]);
        await c.fadeIn(frame, 350);
      }
    }, {
      cap: `Read the sides. Top: ${T(`x+${k}`)}. Side: ${T(`x-${k}`)}. So ${T(`x^2-${n}=(x+${k})(x-${k})`)}.`,
      run: (c) => Promise.all([...dT, ...dS].map((e) => c.fadeIn(e, 350)).concat([c.pop(E2, 420, { delay: 250 })]))
    }, {
      cap: `Run it backwards: expanding ${T(`(x+${k})(x-${k})`)} gives ${T(`x^2+${kx}-${kx}-${n}`)}. The zero pair we added <b>is</b> the pair of middle terms that cancel.`,
      run: async (c) => {
        await Promise.all([c.fadeIn(E3, 350), ...[...posX, ...negX].map((t, i) => pulse(c, t, 1.12, { delay: i * 50 }))]);
        await strike(c, [E1.parts[3], E1.parts[4]]);
      }
    }];
  }
};

/* ============ 1. Why it works: cut and move ============ */
const CM = {
  ab: { A: 'A', B: 'B', AmB: 'A-B', ApB: 'A+B', AA: 'A^2', BB: 'B^2', b: 0.4 },
  n64: { A: '6', B: '4', AmB: '2', ApB: '10', AA: '6^2', BB: '4^2', g: [6, 4], nums: '36-16=20', prod2: '2\\times10=20' },
  n103: { A: '10', B: '3', AmB: '7', ApB: '13', AA: '10^2', BB: '3^2', g: [10, 3], nums: '100-9=91', prod2: '7\\times13=91' },
  a: { A: 'w', B: '3', AmB: 'w-3', ApB: 'w+3', AA: 'w^2', BB: '9', b: 0.36 },
  c: { A: 'm', B: 'n', AmB: 'm-n', ApB: 'm+n', AA: 'm^2', BB: 'n^2', b: 0.42 }
};
const cutMove = {
  title: 'Cut the L-shape and move a piece',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'ab', label: tex('A^2-B^2') }, { v: 'n64', label: tex('6^2-4^2') }, { v: 'n103', label: tex('10^2-3^2') }, { sep: 'Example 1 check:' }, { v: 'a', label: '(a)' }, { v: 'c', label: '(c)' }],
  intro: (key) => { const d = CM[key]; return `Show ${T(`${d.AA}-${d.BB}=(${d.A}-${d.B})(${d.A}+${d.B})`)} with a picture: same pieces, same area.`; },
  make(stage, key, ex) {
    const W = ex.W, d = CM[key], S = 270, X0 = 136, Y0 = 78;
    const u = d.g ? S / d.g[0] : 0, bs = d.g ? u * d.g[1] : Math.round(S * d.b), r = S - bs;
    const grid = (el) => { if (u) { el.classList.add('u4l4-grid'); el.style.backgroundSize = `${u}px ${u}px, ${u}px ${u}px, auto`; } return el; };
    const hole = add(stage, box(h('div', 'u4l4-hole'), bs, bs), X0, Y0); hide(hole);
    const corner = add(stage, grid(box(h('div', 'u4l4-pc whole'), bs, bs)), X0, Y0);
    const grey = add(stage, grid(box(h('div', 'u4l4-pc whole'), r, bs)), X0 + bs, Y0);
    const striped = add(stage, grid(box(h('div', 'u4l4-pc whole'), S, r)), X0, Y0 + bs);
    const outline = add(stage, box(h('div', 'u4l4-sqo'), S, S), X0, Y0);
    hide(corner, grey, striped, outline);
    const cut = add(stage, box(h('div', 'u4l4-cut'), r, 0), X0 + bs, Y0 + bs); hide(cut);
    const areaL = add(stage, h('div', 'u4l4-alab u4l4-sm c', K(d.AA)), X0 + S / 2, Y0 + S / 2); hide(areaL);
    // dimensions, before
    const dL = dimV(stage, X0 - 20, Y0, S, d.A), dB = dimH(stage, X0, Y0 + S + 16, S, d.A, true);
    const dTb = dimH(stage, X0, Y0 - 20, bs, d.B), dTa = dimH(stage, X0 + bs, Y0 - 20, r, d.AmB);
    const dRb = dimV(stage, X0 + S + 20, Y0, bs, d.B, true), dRa = dimV(stage, X0 + S + 20, Y0 + bs, r, d.AmB, true);
    // dimensions, after
    const fT = dimH(stage, X0, Y0 + bs - 20, S + bs, d.ApB), fB = dimH(stage, X0 + S, Y0 + S + 16, bs, d.B, true), fL = dimV(stage, X0 - 20, Y0 + bs, r, d.AmB);
    const all = [dL, dB, dTb, dTa, dRb, dRa, fT, fB, fL];
    all.forEach((p) => hide(...p));
    const show = (c, ps) => Promise.all(ps.flat().map((e) => c.fadeIn(e, 320)));
    const gone = (c, ps) => Promise.all(ps.flat().map((e) => fadeOut(c, e, 250)));
    // notes on the right
    const px = Math.max(X0 + S + bs, X0 + S + 90) + 44, pw = W - px - 16;
    const P1 = add(stage, h('div', 'u4l4-note', `<b>Before:</b> a square with a corner removed. Area ${K(`${d.AA}-${d.BB}`)}${d.nums ? ` ${K(`=${d.nums}`)}` : ''}.`), px, 120);
    const P2 = add(stage, h('div', 'u4l4-note', `<b>After:</b> one rectangle, ${K(d.ApB)} long and ${K(d.AmB)} tall. Area ${K(`(${d.A}-${d.B})(${d.A}+${d.B})`)}${d.prod2 ? ` ${K(`=${d.prod2}`)}` : ''}.`), px, 214);
    const P3 = add(stage, h('div', 'u4l4-eq u4l4-boxed u4l4-sm', K(`${d.AA}-${d.BB}=(${d.A}-${d.B})(${d.A}+${d.B})`)), px, 336);
    [P1, P2].forEach((p) => (p.style.width = pw + 'px')); hide(P1, P2, P3);
    const amb = d.g ? `${d.AmB}` : d.AmB, nb = d.g ? ` (that’s ${T(`${d.A}-${d.B}`)})` : '';
    return [{
      cap: `Start with a square, ${T(d.A)} by ${T(d.A)}. Its area is ${T(d.AA)}${d.g ? ` = ${d.g[0] ** 2} tiles` : ''}.`,
      run: (c) => Promise.all([c.fadeIn(outline, 300), appear(c, corner, 350), appear(c, grey, 350), appear(c, striped, 350), c.fadeIn(areaL, 350), show(c, [dL, dB])])
    }, {
      cap: `Remove a ${T(d.B)}-by-${T(d.B)} square from the corner. The L-shape left over has area <b>${T(`${d.AA}-${d.BB}`)}</b>${d.nums ? `, ${T(d.nums)} tiles` : ''}.`,
      run: async (c) => {
        await c.fadeIn(hole, 200);
        await c.anim(corner, [{ transform: 'none', opacity: 1 }, { transform: 'translate(-34px, -46px) rotate(-8deg)', opacity: 0 }], 650);
        areaL.innerHTML = K(`${d.AA}-${d.BB}`); at(areaL, X0 + S / 2, Y0 + bs + r / 2);
        await Promise.all([fadeOut(c, outline, 250), show(c, [dTb]), pulse(c, areaL, 1.15), c.fadeIn(P1, 400, { delay: 200 })]);
      }
    }, {
      cap: `Cut along the dashed line: a <b>striped</b> piece, ${T(d.A)} by ${T(amb)}${nb}, and a <b>grey</b> piece, ${T(amb)} by ${T(d.B)}.`,
      run: async (c) => {
        await c.anim(cut, [{ width: '0px', opacity: 1 }, { width: r + 'px', opacity: 1 }], 500);
        grey.classList.replace('whole', 'grey'); striped.classList.replace('whole', 'striped');
        await Promise.all([fadeOut(c, areaL, 250), show(c, [dTa, dRb, dRa]), pulse(c, grey, 1.05), pulse(c, striped, 1.03, { delay: 150 })]);
      }
    }, {
      cap: `Turn the grey piece a quarter turn and slide it onto the end of the striped piece.`,
      run: async (c) => {
        await Promise.all([gone(c, [dL, dTb, dTa, dRb, dRa]), fadeOut(c, cut, 200), fadeOut(c, hole, 300)]);
        const fx = X0 + bs + r / 2, fy = Y0 + bs / 2, tx = X0 + S + bs / 2, ty = Y0 + bs + r / 2;
        await c.anim(grey, [{ transform: 'none' }, { transform: `translate(${(tx - fx) * 0.5}px, ${(ty - fy) * 0.15 - 30}px) rotate(45deg)`, offset: 0.5 }, { transform: `translate(${tx - fx}px, ${ty - fy}px) rotate(90deg)` }], 1100);
      }
    }, {
      cap: `Now it’s <b>one rectangle</b>: ${T(d.ApB)} long and ${T(d.AmB)} tall. Its area is ${T(`(${d.A}-${d.B})(${d.A}+${d.B})`)}${d.prod2 ? ` = ${T(d.prod2)}` : ''}.`,
      run: async (c) => {
        areaL.innerHTML = K(`(${d.A}-${d.B})(${d.A}+${d.B})`); at(areaL, X0 + (S + bs) / 2, Y0 + bs + r / 2);
        await Promise.all([show(c, [fT, fB, fL]), c.fadeIn(areaL, 350), c.fadeIn(P2, 400, { delay: 200 })]);
      }
    }, {
      cap: `Same pieces, same area: ${T(`${d.AA}-${d.BB}=(${d.A}-${d.B})(${d.A}+${d.B})`)}.${d.g ? ` With numbers: ${T(`${d.nums.split('=')[0]}=${d.prod2}`)} ✓` : ' The difference of the squares is the difference times the sum.'}`,
      run: (c) => Promise.all([c.pop(P3, 450), pulse(c, striped, 1.03), pulse(c, grey, 1.05)])
    }];
  }
};

/* ============ 1. Why a sum of squares never factors ============ */
const SN = {
  n16: { e: 'x^2+16', A: 'x', B: '4', AA: 'x^2', BB: '16', mid: '8x', c: 16 },
  n9: { e: 'x^2+9', A: 'x', B: '3', AA: 'x^2', BB: '9', mid: '6x', c: 9 },
  e: { e: '9x^2+16', A: '3x', B: '4', AA: '9x^2', BB: '16', mid: '24x' }
};
const sumNever = {
  title: 'Can a sum of squares factor?',
  height: 450,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n16', label: tex('x^2+16') }, { v: 'n9', label: tex('x^2+9') }, { sep: 'Example 2 check:' }, { v: 'e', label: '(e)' }],
  intro: (key) => `${T(SN[key].e)} is a <b>sum</b> of two squares. Try every way the difference of squares pattern could fit, then ask the sum–product question.`,
  make(stage, key, ex) {
    const W = ex.W, d = SN[key], { A, B } = d;
    const top = add(stage, h('div', 'u4l4-eq big', K(`${d.e}=(${A})^2\\textcolor{#c93a33}{+}(${B})^2`)), 24, 18); hide(top);
    const tries = [
      [`(${A}+${B})(${A}+${B})`, `${d.AA}+${d.mid}+${d.BB}`, 'a middle term'],
      [`(${A}-${B})(${A}-${B})`, `${d.AA}-${d.mid}+${d.BB}`, 'a middle term'],
      [`(${A}-${B})(${A}+${B})`, `${d.AA}-${d.BB}`, 'minus, not plus']
    ].map(([f, x, why], i) => {
      const row = add(stage, h('div', 'u4l4-try', `<span class="u4l4-try-f">${K(`${f}=${x}`)}</span><span class="u4l4-try-v">✗ ${why}</span>`), 24, 96 + i * 66); hide(row); return row;
    });
    const px = Math.max(580, W - 380), pw = W - px - 18;
    const need = add(stage, h('div', 'u4l4-need', `Sum–product: need a <b>positive</b> product${d.c ? ` (${K(`+${d.c}`)})` : ''} and a sum of <b>0</b>.`), px, 92); need.style.width = pw + 'px'; hide(need);
    const signs = add(stage, h('div', 'u4l4-signs', `<div><span class="u4l4-sg">${K('(+)(+)')}</span>product +, sum <b>positive</b></div><div><span class="u4l4-sg">${K('(-)(-)')}</span>product +, sum <b>negative</b></div><div class="neg"><span class="u4l4-sg">${K('(+)(-)')}</span>product <b>negative</b></div>`), px, 170);
    signs.style.width = pw + 'px'; hide(signs);
    let pt = null;
    if (d.c) {
      const ps = []; for (let p = 1; p * p <= d.c; p++) if (d.c % p === 0) ps.push([p, d.c / p]);
      pt = add(stage, h('div', 'u4l4-ptab', [...ps, ...ps.map(([p, q]) => [-p, -q])].map(([p, q]) => `<span>${K(`${p},${q}`)}<i>sum ${K(String(p + q))}</i></span>`).join('')), px, 330);
      pt.style.width = pw + 'px'; hide(pt);
    }
    const stamp = add(stage, h('div', 'u4l4-stamp no', 'Does not factor'), 120, 330); hide(stamp);
    const sub = add(stage, h('div', 'u4l4-stamp-sub', 'over the integers'), 142, 392); hide(sub);
    return [{
      cap: `${T(d.e)} is a square plus a square: ${T(`(${A})^2+(${B})^2`)}. The pattern ${T('A^2-B^2')} needs a <b>minus</b>. Could some brackets still work?`,
      run: (c) => c.fadeIn(top, 400)
    }, {
      cap: `Try ${T(`(${A}+${B})(${A}+${B})`)}: it expands to ${T(`${d.AA}+${d.mid}+${d.BB}`)}. That has a <b>middle term</b>.`,
      run: (c) => c.fadeIn(tries[0], 400, { from: 'translateX(-12px)' })
    }, {
      cap: `Try ${T(`(${A}-${B})(${A}-${B})`)}: ${T(`${d.AA}-${d.mid}+${d.BB}`)}. A middle term again.`,
      run: (c) => c.fadeIn(tries[1], 400, { from: 'translateX(-12px)' })
    }, {
      cap: `Try ${T(`(${A}-${B})(${A}+${B})`)}: the middle terms cancel, but it gives ${T(`${d.AA}-${d.BB}`)}, a <b>minus</b>. We need ${T(`+${d.BB}`)}.`,
      run: (c) => c.fadeIn(tries[2], 400, { from: 'translateX(-12px)' })
    }, {
      cap: `The sum–product reason: a <b>positive product</b> means the two numbers have the <b>same sign</b>, so their sum is positive or negative, <b>never 0</b>.${d.c ? ` Every pair for ${T(String(d.c))} misses.` : ''}`,
      run: (c) => Promise.all([c.fadeIn(need, 350), c.fadeIn(signs, 400, { delay: 200 }), pt ? c.fadeIn(pt, 400, { delay: 450 }) : null])
    }, {
      cap: `So ${T(d.e)} <b>does not factor</b> over the integers. A sum of squares never does. (A GCF can still come out: ${T('3x^2+12=3(x^2+4)')}, and the bracket stops there.)`,
      run: async (c) => { await stampIn(c, stamp); await c.fadeIn(sub, 300); }
    }];
  }
};

/* ============ 2. The perfect-square detector ============ */
function parsePoly(s) { // '25x^2-64' → [{ s: 1, c: 25, v: [['x', 2]] }, { s: -1, c: 64, v: [] }]
  return s.match(/[+-]?[^+-]+/g).map((t) => {
    const m = t.match(/^([+-]?)(\d*)(.*)$/), v = [];
    (m[3].match(/[a-z](?:\^\d+)?/g) || []).forEach((p) => v.push([p[0], p.length > 1 ? parseInt(p.slice(2), 10) : 1]));
    return { s: m[1] === '-' ? -1 : 1, c: m[2] === '' ? 1 : parseInt(m[2], 10), v };
  });
}
const varT = (v) => v.map(([x, e]) => (e === 1 ? x : `${x}^{${e}}`)).join('');
const bodyT = (t) => (t.c === 1 && t.v.length ? '' : String(t.c)) + varT(t.v);
const isq = (n) => { const r = Math.round(Math.sqrt(n)); return r * r === n ? r : null; };
function scanTerm(t) { // the checks the detector shows for one term, and its square root (or null)
  const items = []; let ok = true;
  const showC = t.c !== 1 || !t.v.length, rc = isq(t.c);
  if (showC) { if (rc != null) items.push([true, `${K(String(t.c))} = ${K(`${rc}^2`)}`]); else { ok = false; items.push([false, `${K(String(t.c))} is not a perfect square`]); } }
  t.v.forEach(([x, e]) => { if (e % 2 === 0) items.push([true, `${K(e === 2 ? `${x}^2` : `${x}^{${e}}`)} = ${K(`(${varT([[x, e / 2]])})^2`)}: even exponent`]); else { ok = false; items.push([false, `${K(e === 1 ? x : `${x}^{${e}}`)}: <b>odd</b> exponent`]); } });
  const root = ok ? ((rc === 1 && t.v.length ? '' : String(rc)) + varT(t.v.map(([x, e]) => [x, e / 2]))) : null;
  return { items, ok, root };
}
const DT = {
  x6: 'x^6-25y^4', x12: 'x^2-12', a3: 'a^3-49', g18: '18x^2-8',
  a: '25x^2-64', b: '49a^2-1', c: '121-y^2', d: '16p^2-9q^2', e: '9x^2+16'
};
const detector = {
  title: 'The perfect-square detector',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'x6', label: tex(DT.x6) }, { v: 'x12', label: tex(DT.x12) }, { v: 'a3', label: tex(DT.a3) }, { v: 'g18', label: tex(DT.g18) }, { sep: 'Example 2 check:' }, ...['a', 'b', 'c', 'd', 'e'].map((k) => ({ v: k, label: `(${k})` }))],
  intro: (key) => `Is ${T(DT[key])} a difference of squares? Check <b>each term</b>, then the <b>sign</b> between them.`,
  make(stage, key, ex) {
    const W = ex.W, src = DT[key], [t1, t2] = parsePoly(src), s1 = scanTerm(t1), s2 = scanTerm(t2), minus = t2.s < 0;
    const cols = [W * 0.22, W * 0.5, W * 0.78];
    // the expression, first written compactly, then spread into columns
    const e1 = add(stage, h('div', 'u4l4-dt-t c', K(bodyT(t1))), 0, 52), e2 = add(stage, h('div', 'u4l4-dt-t c', K(bodyT(t2))), 0, 52), es = add(stage, h('div', 'u4l4-dt-t c u4l4-dt-sg', minus ? '−' : '+'), 0, 52);
    const w1 = e1.offsetWidth, w2 = e2.offsetWidth, ws = 40, tot = w1 + ws + w2, x0 = W / 2 - tot / 2;
    at(e1, x0 + w1 / 2, 52); at(es, x0 + w1 + ws / 2, 52); at(e2, x0 + w1 + ws + w2 / 2, 52);
    const mkCol = (s, cx) => {
      const lines = s.items.map(([ok, html], i) => { const e = add(stage, h('div', 'u4l4-dt-i c ' + (ok ? 'ok' : 'no'), `<b>${ok ? '✓' : '✗'}</b> ${html}`), cx, 130 + i * 44); hide(e); return e; });
      const r = add(stage, h('div', 'u4l4-dt-r c ' + (s.ok ? 'ok' : 'no'), s.ok ? `square root: ${K(s.root)}` : 'not a perfect square'), cx, 130 + s.items.length * 44 + 8); hide(r);
      return { lines, r };
    };
    const c1 = mkCol(s1, cols[0]), c2 = mkCol(s2, cols[2]);
    const sg = add(stage, h('div', 'u4l4-dt-i c ' + (minus ? 'ok' : 'no'), minus ? '<b>✓</b> minus: a <b>difference</b>' : '<b>✗</b> plus: a <b>sum</b>'), cols[1], 130); hide(sg);
    const good = s1.ok && s2.ok && minus;
    const fac = good ? `(${s1.root}-${s2.root})(${s1.root}+${s2.root})` : '';
    const stamp = add(stage, h('div', 'u4l4-stamp ' + (good ? 'yes' : 'no'), good ? 'Difference of squares' : !minus && s1.ok && s2.ok ? 'Sum of squares' : 'Not a difference of squares'), W / 2, 312); stamp.classList.add('c'); hide(stamp);
    const res = add(stage, h('div', 'u4l4-eq c ' + (good ? 'u4l4-ok' : 'u4l4-bad'), good ? K(`A=${s1.root},\\ B=${s2.root}:\\quad ${src}=${fac}`) : !minus && s1.ok && s2.ok ? 'never factors over the integers' : `${[t1, t2].filter((t, i) => !(i ? s2 : s1).ok).map((t) => K(bodyT(t))).join(' and ')} ${!s1.ok && !s2.ok ? 'are' : 'is'} not a perfect square`), W / 2, 372); hide(res);
    const steps = [{
      cap: `Pull the expression apart: the first term ${T(bodyT(t1))}, the sign, and the second term ${T(bodyT(t2))}.`,
      run: (c) => Promise.all([moveTo(c, e1, cols[0], 52, 600), moveTo(c, es, cols[1], 52, 600), moveTo(c, e2, cols[2], 52, 600)])
    }, {
      cap: `Scan the first term. A perfect square needs a perfect-square coefficient and <b>even</b> exponents. ${s1.ok ? `${T(bodyT(t1))} passes: it is ${T(`(${s1.root})^2`)}.` : `${T(bodyT(t1))} fails.`}`,
      run: async (c) => { for (const l of c1.lines) await c.fadeIn(l, 300); await c.pop(c1.r, 350); }
    }, {
      cap: `Scan the second term. ${s2.ok ? `${T(bodyT(t2))} passes: it is ${T(`(${s2.root})^2`)}.` : `${T(bodyT(t2))} fails.`}`,
      run: async (c) => { for (const l of c2.lines) await c.fadeIn(l, 300); await c.pop(c2.r, 350); }
    }, {
      cap: minus ? 'Check the sign: a <b>minus</b> between them, so it is a <b>difference</b>.' : 'Check the sign: a <b>plus</b>. That makes it a <b>sum</b>, not a difference.',
      run: (c) => c.pop(sg, 350)
    }, {
      cap: good ? `All three checks pass. With ${T(`A=${s1.root}`)} and ${T(`B=${s2.root}`)}: ${T(`${src}=${fac}`)}.`
        : !minus && s1.ok && s2.ok ? `Both terms are squares, but it is a <b>sum</b> of squares: it does <b>not</b> factor over the integers.`
          : `At least one check fails, so ${T(src)} is <b>not</b> a difference of squares as written.`,
      run: async (c) => { await stampIn(c, stamp); await c.fadeIn(res, 350); }
    }];
    if (key === 'g18') steps.push({
      cap: `But look for a <b>GCF first</b> (Section 3)! ${T('18x^2-8=2(9x^2-4)')}, and ${T('9x^2-4=(3x)^2-2^2')} passes every check: ${T('18x^2-8=2(3x-2)(3x+2)')}.`,
      run: async (c) => { res.innerHTML = K('18x^2-8=2(9x^2-4)=2(3x-2)(3x+2)'); res.className = 'u4l4-eq c u4l4-ok'; stamp.textContent = 'GCF first, then it is!'; stamp.className = 'u4l4-stamp yes c'; await Promise.all([stampIn(c, stamp), c.fadeIn(res, 400)]); }
    });
    return steps;
  }
};

/* ============ 3. GCF first, then the pattern ============ */
// each step: [caption, line (TeX) or null, note, checklist item to tick (0 GCF, 1 pattern, 2 brackets, 3 check) or -1]
const GF = {
  n7: [['Is it a difference of squares as written? 7 and 28 are <b>not</b> perfect squares, so not yet.', '7x^2-28', '7, 28: not squares', -1],
    ['Find the GCF: 7 divides both 7 and 28, and only one term has an x. Pull <b>7</b> out front: divide each term by 7.', '=7(x^2-4)', 'GCF = 7', 0],
    [`Now the bracket ${T('x^2-4=x^2-2^2')} <b>is</b> a difference of squares.`, '=7(x^2-2^2)', 'A = x, B = 2', 1],
    ['Factor the bracket. Neither new bracket factors again.', '=7(x-2)(x+2)', 'no more factoring', 2],
    [`Check by expanding: ${T('7(x-2)(x+2)=7(x^2-4)=7x^2-28')} ✓`, null, '', 3]],
  nx: [['Is it a difference of squares as written? The exponent 3 is <b>odd</b>, so no.', 'x^3-25x', 'x³: odd exponent', -1],
    [`Find the GCF: both terms have an ${T('x')}. Pull ${T('x')} out front.`, '=x(x^2-25)', 'GCF = x', 0],
    [`The bracket is a difference of squares: ${T('x^2-5^2')}.`, '=x(x^2-5^2)', 'A = x, B = 5', 1],
    ['Factor the bracket. Neither new bracket factors again.', '=x(x-5)(x+5)', 'no more factoring', 2],
    [`Check by expanding: ${T('x(x-5)(x+5)=x(x^2-25)=x^3-25x')} ✓`, null, '', 3]],
  n16: [[`The GCF of ${T('x^4')} and 16 is 1, and ${T('x^4-16=(x^2)^2-4^2')} is already a difference of squares.`, 'x^4-16', 'GCF = 1', 0],
    [`Factor it with ${T('A=x^2')} and ${T('B=4')}.`, '=(x^2-4)(x^2+4)', 'A = x², B = 4', 1],
    [`Check <b>every</b> new bracket: ${T('x^2-4')} is a difference of squares again! ${T('x^2+4')} is a sum, so it stops.`, '=(x-2)(x+2)(x^2+4)', 'factor again', 2],
    [`Check by expanding: ${T('(x-2)(x+2)=x^2-4')}, and ${T('(x^2-4)(x^2+4)=x^4-16')} ✓`, null, '', 3]],
  a: [['As written? 3 and 75 are <b>not</b> perfect squares, so not yet.', '3a^2-75', '3, 75: not squares', -1],
    ['GCF = 3. Divide each term by 3.', '=3(a^2-25)', 'GCF = 3', 0],
    [`The bracket is ${T('a^2-5^2')}: a difference of squares.`, '=3(a^2-5^2)', 'A = a, B = 5', 1],
    ['Factor the bracket. The new brackets don’t factor again.', '=3(a-5)(a+5)', 'no more factoring', 2],
    [`Check: ${T('3(a-5)(a+5)=3(a^2-25)=3a^2-75')} ✓`, null, '', 3]],
  b: [['As written? 5 and 20 are <b>not</b> perfect squares, so not yet.', '5x^2-20y^2', '5, 20: not squares', -1],
    ['GCF = 5 (no variable is in both terms). Divide each term by 5.', '=5(x^2-4y^2)', 'GCF = 5', 0],
    [`The bracket is ${T('x^2-(2y)^2')}: a difference of squares.`, '=5\\big[x^2-(2y)^2\\big]', 'A = x, B = 2y', 1],
    ['Factor the bracket.', '=5(x-2y)(x+2y)', 'no more factoring', 2],
    [`Check: ${T('5(x-2y)(x+2y)=5(x^2-4y^2)=5x^2-20y^2')} ✓`, null, '', 3]],
  c: [['As written? 98 and 2 are <b>not</b> perfect squares, so not yet.', '98p^2q^2-2', '98, 2: not squares', -1],
    [`GCF = 2, since ${T('98=2\\times49')}. Divide each term by 2.`, '=2(49p^2q^2-1)', 'GCF = 2', 0],
    [`The bracket is ${T('(7pq)^2-1^2')}: a difference of squares.`, '=2\\big[(7pq)^2-1^2\\big]', 'A = 7pq, B = 1', 1],
    ['Factor the bracket.', '=2(7pq-1)(7pq+1)', 'no more factoring', 2],
    [`Check: ${T('2(7pq-1)(7pq+1)=2(49p^2q^2-1)=98p^2q^2-2')} ✓`, null, '', 3]],
  d: [['As written? 2 is not a perfect square and the exponent 3 is odd, so not yet.', '2x^3-32x', 'not squares', -1],
    [`GCF = ${T('2x')}: the variable comes out too. Divide each term by ${T('2x')}.`, '=2x(x^2-16)', 'GCF = 2x', 0],
    [`The bracket is ${T('x^2-4^2')}: a difference of squares.`, '=2x(x^2-4^2)', 'A = x, B = 4', 1],
    ['Factor the bracket.', '=2x(x-4)(x+4)', 'no more factoring', 2],
    [`Check: ${T('2x(x-4)(x+4)=2x(x^2-16)=2x^3-32x')} ✓`, null, '', 3]]
};
const GF_ITEMS = ['GCF out front', 'Difference of squares?', 'Every bracket checked', 'Check by expanding'];
const gcfFirst = {
  title: 'GCF first, then the pattern, then check every bracket',
  height: 440,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'n7', label: tex('7x^2-28') }, { v: 'nx', label: tex('x^3-25x') }, { v: 'n16', label: tex('x^4-16') }, { sep: 'Example 3 check:' }, ...['a', 'b', 'c', 'd'].map((k) => ({ v: k, label: `(${k})` }))],
  intro: (key) => `Factor ${T(GF[key][0][1])} completely.`,
  make(stage, key, ex) {
    const W = ex.W, S = GF[key], pw = 264, px = W - pw - 16;
    const list = add(stage, h('div', 'u4l4-cl'), px, 24); list.style.width = pw + 'px';
    list.innerHTML = '<div class="u4l4-cl-h">Checklist</div>';
    const items = GF_ITEMS.map((t) => { const e = h('div', 'u4l4-cl-i', `<i></i>${t}`); list.appendChild(e); return e; });
    let y = 26;
    const rows = S.map(([, line, note]) => {
      if (!line) return null;
      const e = add(stage, h('div', 'u4l4-gl', `<span class="u4l4-gl-m">${K(line)}</span><span class="u4l4-gl-n">${note}</span>`), 30, y); hide(e); y += 64; return e;
    });
    const chk = add(stage, h('div', 'u4l4-gchk'), 30, y + 8); chk.style.width = (px - 50) + 'px'; hide(chk);
    const tick = async (c, i) => { if (i < 0) return; items[i].classList.add('on'); await c.pop(items[i].querySelector('i'), 320); };
    return S.map(([cap, line, , ti], i) => ({
      cap,
      run: async (c) => {
        if (i > 0 && rows[i - 1]) rows[i - 1].classList.add('past');
        if (rows[i]) await c.fadeIn(rows[i], 380, { from: 'translateX(-12px)' });
        else { chk.innerHTML = cap.replace(/^Check( by expanding)?:\s*/, 'Check: '); await c.fadeIn(chk, 380); }
        await tick(c, ti);
        if (i === S.length - 1) rows.forEach((r) => r && r.classList.remove('past'));
      }
    }));
  }
};

/* ============ 4. Areas: length and width from a difference of squares ============ */
const RK = {
  g: { name: 'garden', area: '4a^2-9b^2', sq: '(2a)^2-(3b)^2', L: '2a+3b', Wd: '2a-3b', B: '3b', p: 'a', q: 'b', P: 40, sum: '4a', per: '8a', pv: 5,
    cond: 'the length is 4 times the width', ceq: '2a+3b=4(2a-3b)', c2: '2a+3b=8a-12b', c3: '15b=6a', c4: 'b=0.4a', qv: 2, Ln: 16, Wn: 4, ratio: '16=4\\times4' },
  ex4: { name: 'rink', area: '25m^2-4n^2', sq: '(5m)^2-(2n)^2', L: '5m+2n', Wd: '5m-2n', B: '2n', p: 'm', q: 'n', P: 120, sum: '10m', per: '20m', pv: 6,
    cond: 'the length is 50% greater than the width', ceq: '5m+2n=1.5(5m-2n)', c2: '5m+2n=7.5m-3n', c3: '5n=2.5m', c4: 'n=0.5m', qv: 3, Ln: 36, Wn: 24, ratio: '36=1.5\\times24' }
};
const rink = {
  title: 'Side lengths from a factored area',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'g', label: 'a garden' }, { sep: 'Example 4 check:' }, { v: 'ex4', label: 'the rink' }],
  intro: (key) => { const d = RK[key]; return `A rectangular ${d.name} has area ${T(d.area)} m² and perimeter ${d.P} m. Find its length and width if ${d.cond}.`; },
  make(stage, key, ex) {
    const W = ex.W, d = RK[key], RX = 170, RY = 80, rw0 = 270, rh0 = 170;
    const rect = add(stage, box(h('div', 'u4l4-rect'), rw0, rh0), RX, RY); hide(rect);
    const aL = add(stage, h('div', 'u4l4-alab u4l4-sm c', K(d.area)), RX + rw0 / 2, RY + rh0 / 2); hide(aL);
    const lT = add(stage, h('div', 'u4l4-dim c', K(`L=${d.L}`)), RX + rw0 / 2, RY - 24); hide(lT);
    const lS = add(stage, h('div', 'u4l4-dim', K(`W=${d.Wd}`)), RX - 14, RY + rh0 / 2); lS.style.translate = '-100% -50%'; hide(lS);
    const px = 486, lines = [
      `${d.area}=(${d.Wd})(${d.L})`,
      `P=2\\big[(${d.L})+(${d.Wd})\\big]=${d.per}`,
      `${d.per}=${d.P}\\ \\Rightarrow\\ ${d.p}=${d.pv}`,
      d.ceq,
      `${d.c2}\\ \\Rightarrow\\ ${d.c3}`,
      `${d.c4}=${d.qv}`,
      `L=${d.Ln}\\text{ m},\\ \\ W=${d.Wn}\\text{ m}`
    ].map((s, i) => { const e = add(stage, h('div', 'u4l4-eq u4l4-sm' + (i === 6 ? ' u4l4-boxed' : ''), K(s)), px, 16 + i * 56); hide(e); return e; });
    const zp = add(stage, h('div', 'u4l4-zp', `${K(`+${d.B}`)} and ${K(`-${d.B}`)} cancel`), px + 60, 16 + 56 + 42); hide(zp);
    const chk = add(stage, h('div', 'u4l4-note', `Check: ${K(d.ratio)} ✓ &nbsp; ${K(`2(${d.Ln}+${d.Wn})=${d.P}`)} ✓`), 40, 404); hide(chk);
    // true proportions for the last step
    const sc = Math.min(270 / d.Ln, 220 / d.Wn), rw1 = d.Ln * sc, rh1 = d.Wn * sc;
    const sub = (e) => e.replace(d.p, `(${d.pv})`).replace(d.q, `(${d.qv})`);
    return [{
      cap: `Factor the area: ${T(`${d.area}=${d.sq}=(${d.Wd})(${d.L})`)}. Area is length × width, so the two factors are the <b>side lengths</b>.`,
      run: (c) => Promise.all([c.fadeIn(rect, 350), c.fadeIn(aL, 350), c.fadeIn(lines[0], 400, { delay: 200 })])
    }, {
      cap: `The larger factor is the length: ${T(`L=${d.L}`)} and ${T(`W=${d.Wd}`)}.`,
      run: (c) => Promise.all([c.fadeIn(lT, 350), c.fadeIn(lS, 350, { delay: 150 })])
    }, {
      cap: `Perimeter: ${T('2(L+W)')}. Adding the length and width, ${T(`+${d.B}`)} and ${T(`-${d.B}`)} are a <b>zero pair</b>: ${T(`P=2(${d.sum})=${d.per}`)}.`,
      run: async (c) => { await c.fadeIn(lines[1], 400); await c.pop(zp, 350); }
    }, {
      cap: `Set it equal to the perimeter: ${T(`${d.per}=${d.P}`)}, so ${T(`${d.p}=${d.pv}`)}.`,
      run: (c) => Promise.all([fadeOut(c, zp, 250), c.fadeIn(lines[2], 400)])
    }, {
      cap: `${d.cond[0].toUpperCase() + d.cond.slice(1)}: ${T(d.ceq)}. Collect like terms: ${T(d.c3)}, so ${T(d.c4)}. With ${T(`${d.p}=${d.pv}`)}, ${T(`${d.q}=${d.qv}`)}.`,
      run: (c) => Promise.all([c.fadeIn(lines[3], 350), c.fadeIn(lines[4], 350, { delay: 300 }), c.fadeIn(lines[5], 350, { delay: 600 })])
    }, {
      cap: `Substitute: ${T(`L=${sub(d.L)}=${d.Ln}`)} m and ${T(`W=${sub(d.Wd)}=${d.Wn}`)} m. Here is the ${d.name} drawn to scale.`,
      run: async (c) => {
        lT.innerHTML = K(`L=${d.Ln}\\text{ m}`); lS.innerHTML = K(`W=${d.Wn}\\text{ m}`); aL.innerHTML = K(`${tn(d.Ln * d.Wn)}\\text{ m}^2`);
        await Promise.all([c.anim(rect, [{ width: rw0 + 'px', height: rh0 + 'px' }, { width: rw1 + 'px', height: rh1 + 'px' }], 700),
          moveTo(c, lT, RX + rw1 / 2, RY - 24, 700), moveTo(c, lS, RX - 14, RY + rh1 / 2, 700), moveTo(c, aL, RX + rw1 / 2, RY + rh1 / 2, 700), c.pop(lines[6], 420)]);
        await c.fadeIn(chk, 350);
      }
    }];
  }
};

/* ============ 4. Mental math ============ */
const MM = { p58: [58, 62], p47: [47, 53], p95: [95, 105], d49: [49, 51, 'd'], d76: [76, 24, 'd'] };
const mental = {
  title: 'Mental math with a difference of squares',
  height: 420,
  choices: [{ v: 'p58', label: '58 × 62' }, { v: 'p47', label: '47 × 53' }, { v: 'p95', label: '95 × 105' }, { v: 'd49', label: tex('49^2-51^2') }, { v: 'd76', label: tex('76^2-24^2') }],
  intro: (key) => { const [a, b, t] = MM[key]; return t ? `Work out ${T(`${a}^2-${b}^2`)} with no calculator. Squaring both is slow. Factor instead!` : `Work out ${T(`${a}\\times${b}`)} with no calculator.`; },
  make(stage, key, ex) {
    const W = ex.W, [a, b, t] = MM[key], lo = Math.min(a, b), hi = Math.max(a, b), m = (a + b) / 2, d = (hi - lo) / 2;
    // number line
    const pad = Math.max(3, Math.round((hi - lo) * 0.12)), n0 = lo - pad, n1 = hi + pad, L = 60, R = W - 60, Y = 128;
    const X = (v) => L + (v - n0) / (n1 - n0) * (R - L);
    const svg = add(stage, svgEl('svg', { class: 'u4l4-nl' }), 0, 0); svg.setAttribute('width', W); svg.setAttribute('height', 230);
    svg.appendChild(svgEl('line', { x1: L - 20, y1: Y, x2: R + 20, y2: Y, class: 'u4l4-nl-ax' }));
    const step = n1 - n0 > 40 ? 10 : n1 - n0 > 16 ? 5 : 1;
    for (let v = Math.ceil(n0); v <= n1; v++) {
      const big = v % step === 0;
      svg.appendChild(svgEl('line', { x1: X(v), y1: Y - (big ? 9 : 5), x2: X(v), y2: Y + (big ? 9 : 5), class: 'u4l4-nl-tk' }));
      if (big) { const tx = svgEl('text', { x: X(v), y: Y + 32, class: 'u4l4-nl-n' }); tx.textContent = v; svg.appendChild(tx); }
    }
    const dot = (v, cls) => { const e = add(stage, h('div', 'u4l4-nl-dot c ' + cls), X(v), Y); hide(e); return e; };
    const lab = (v, html, cls, y = Y - 40) => { const e = add(stage, h('div', 'u4l4-nl-lab c ' + cls, html), X(v), y); hide(e); return e; };
    const da = dot(a, 'a'), db = dot(b, 'b'), la = lab(a, String(a), 'a'), lb = lab(b, String(b), 'b');
    const dm = dot(m, 'm'), lm = lab(m, `${m}<small>friendly</small>`, 'm', Y + 64);
    const arrL = add(stage, box(h('div', 'u4l4-nl-arr'), X(m) - X(lo), 0), X(lo), Y - 18), arrR = add(stage, box(h('div', 'u4l4-nl-arr'), X(hi) - X(m), 0), X(m), Y - 18);
    const dl = add(stage, h('div', 'u4l4-nl-d c', String(d)), (X(lo) + X(m)) / 2, Y - 34), dr = add(stage, h('div', 'u4l4-nl-d c', String(d)), (X(m) + X(hi)) / 2, Y - 34);
    hide(dm, lm, arrL, arrR, dl, dr);
    const ex1 = 270, rows = (t ? [
      `${a}^2-${b}^2=(${a}-${b})(${a}+${b})`,
      `=(${a - b})(${a + b})`,
      `=\\boldsymbol{${tn((a - b) * (a + b))}}`
    ] : [
      `${a}\\times${b}=(${m}-${d})(${m}+${d})`,
      `=${m}^2-${d}^2`,
      `=${tn(m * m)}-${d * d}=\\boldsymbol{${tn(a * b)}}`
    ]).map((s, i) => { const e = add(stage, h('div', 'u4l4-eq big', K(s)), 70 + (i ? 40 : 0), ex1 + i * 50); hide(e); return e; });
    const stamp = add(stage, h('div', 'u4l4-stamp yes', 'No calculator!'), W - 380, 300); hide(stamp);
    const gapLab = add(stage, h('div', 'u4l4-nl-d c', K(`${a}-${b}=${a - b}`)), (X(lo) + X(hi)) / 2, Y - 34), sumLab = add(stage, h('div', 'u4l4-nl-sum c', K(`${a}+${b}=${a + b}`)), (X(lo) + X(hi)) / 2, Y + 66);
    const gapArr = add(stage, box(h('div', 'u4l4-nl-arr'), X(hi) - X(lo), 0), X(lo), Y - 18); hide(gapLab, sumLab, gapArr);
    if (t) return [{
      cap: `${T(`${a}^2-${b}^2`)} is a difference of squares, so factor it: ${T(`(${a}-${b})(${a}+${b})`)}.`,
      run: (c) => Promise.all([c.pop(da, 300), c.pop(db, 300, { delay: 120 }), c.fadeIn(la, 300), c.fadeIn(lb, 300), c.fadeIn(rows[0], 400, { delay: 200 })])
    }, {
      cap: `The first bracket is the <b>gap</b>, ${T(`${a}-${b}=${a - b}`)}. The second is the <b>sum</b>, ${T(`${a}+${b}=${a + b}`)}: a friendly number.`,
      run: (c) => Promise.all([c.fadeIn(gapArr, 300), c.fadeIn(gapLab, 300), c.fadeIn(sumLab, 300, { delay: 200 }), c.fadeIn(rows[1], 400, { delay: 300 })])
    }, {
      cap: `Multiply: ${T(`(${a - b})(${a + b})=${tn((a - b) * (a + b))}`)}.${a < b ? ` Negative makes sense: ${T(`${a}^2`)} is smaller than ${T(`${b}^2`)}.` : ''} No squaring needed.`,
      run: async (c) => { await c.fadeIn(rows[2], 400); await stampIn(c, stamp); }
    }];
    return [{
      cap: `Mark ${a} and ${b} on a number line.`,
      run: (c) => Promise.all([c.pop(da, 300), c.pop(db, 300, { delay: 120 }), c.fadeIn(la, 300), c.fadeIn(lb, 300)])
    }, {
      cap: `Halfway between them is <b>${m}</b>, a friendly number. Both are ${d} away: ${T(`${a}=${m}-${d}`)} and ${T(`${b}=${m}+${d}`)}.`,
      run: (c) => Promise.all([c.pop(dm, 320), c.fadeIn(lm, 300), c.fadeIn(arrL, 300, { delay: 150 }), c.fadeIn(arrR, 300, { delay: 150 }), c.fadeIn(dl, 300, { delay: 250 }), c.fadeIn(dr, 300, { delay: 250 })])
    }, {
      cap: `So ${T(`${a}\\times${b}=(${m}-${d})(${m}+${d})`)}: a difference times a sum.`,
      run: (c) => c.fadeIn(rows[0], 400)
    }, {
      cap: `That’s a difference of squares, run backwards: ${T(`${m}^2-${d}^2`)}.`,
      run: (c) => c.fadeIn(rows[1], 400)
    }, {
      cap: `${T(`${m}^2=${tn(m * m)}`)} and ${T(`${d}^2=${d * d}`)}, so ${T(`${a}\\times${b}=${tn(a * b)}`)}.`,
      run: async (c) => { await c.fadeIn(rows[2], 400); await stampIn(c, stamp); }
    }];
  }
};

/* ============ 4. Ring area ============ */
const RG = { r1: [6.5, 3.5], r2: [10.5, 9.5], r3: [5, 3] };
const ring = {
  title: 'The area of a ring',
  height: 450,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar (the step labels need the full width)
  choices: [{ v: 'r1', label: tex('R=6.5,\\ r=3.5') }, { v: 'r2', label: tex('R=10.5,\\ r=9.5') }, { v: 'r3', label: tex('R=5,\\ r=3') }],
  intro: (key) => { const [R, r] = RG[key]; return `A circle of radius ${T(`R=${R}`)} has a circle of radius ${T(`r=${r}`)} cut out. Find the area of the ring that is left, as a multiple of ${T('\\pi')}, with no calculator.`; },
  make(stage, key, ex) {
    const W = ex.W, [R, r] = RG[key], cx = 210, cy = 222, Rp = 180, rp = Rp * r / R, off = Math.min(Rp - rp - 14, 60);
    const svg = add(stage, svgEl('svg', { class: 'u4l4-ring' }), 0, 0); svg.setAttribute('width', 440); svg.setAttribute('height', 450);
    const big = svgEl('circle', { cx, cy, r: Rp, class: 'u4l4-rg-big' }), hole = svgEl('circle', { cx, cy, r: rp, class: 'u4l4-rg-hole' });
    const rR = svgEl('line', { x1: cx, y1: cy, x2: cx - Rp * 0.707, y2: cy - Rp * 0.707, class: 'u4l4-rg-rad' }), rr = svgEl('line', { x1: cx, y1: cy, x2: cx + rp, y2: cy, class: 'u4l4-rg-rad s' });
    svg.append(big, hole, rR, rr);
    [big, hole, rR, rr].forEach((e) => (e.style.opacity = 0));
    const lR = add(stage, h('div', 'u4l4-rg-l c', K('R')), cx - Rp * 0.36 - 16, cy - Rp * 0.36 + 12); hide(lR);
    const lr = add(stage, h('div', 'u4l4-rg-l c s', K('r')), cx + rp / 2, cy - 16); hide(lr);
    const trap = add(stage, svgEl('svg', { class: 'u4l4-trap' }), 20, 60); trap.setAttribute('width', 420); trap.setAttribute('height', 330); hide(trap);
    const tb = 380, tt = 380 * r / R, th = 170 * (R - r) / R + 50, ty0 = 60, tx = (tw) => 20 + (380 - tw) / 2;
    trap.innerHTML = `<polygon points="${tx(tt)},${ty0} ${tx(tt) + tt},${ty0} ${tx(tb) + tb},${ty0 + th} ${tx(tb)},${ty0 + th}" class="u4l4-tr-p"/>`
      + `<text x="210" y="${ty0 - 14}" class="u4l4-tr-t">2πr (inside edge)</text><text x="210" y="${ty0 + th + 30}" class="u4l4-tr-t">2πR (outside edge)</text>`
      + `<text x="${(tx(tb) + tb + tx(tt) + tt) / 2 + 14}" y="${ty0 + th / 2 + 6}" class="u4l4-tr-t" text-anchor="start">R − r</text>`;
    const px = 470, lines = [
      'A=\\pi R^2-\\pi r^2',
      '=\\pi(R^2-r^2)',
      '=\\pi(R-r)(R+r)',
      `=\\pi(${R}-${r})(${R}+${r})`,
      `=\\pi(${R - r})(${R + r})=\\boldsymbol{${(R - r) * (R + r)}\\pi}`
    ].map((s, i) => { const e = add(stage, h('div', 'u4l4-eq big' + (i === 4 ? ' u4l4-boxed' : ''), K(s)), px + (i ? 22 : 0), 24 + i * 64); hide(e); return e; });
    const notes = ['', 'GCF first', 'difference of squares', '', ''].map((t, i) => { if (!t) return null; const e = add(stage, h('div', 'u4l4-gl-n u4l4-rg-n', t), W - 16, 24 + i * 64 + 14); e.style.translate = '-100% 0'; hide(e); return e; });
    const val = (R - r) * (R + r), approx = (val * Math.PI).toFixed(1);
    const bonus = add(stage, h('div', 'u4l4-note', `Trapezoid: ${K('\\tfrac12(2\\pi r+2\\pi R)(R-r)')}<br>${K('=\\pi(R+r)(R-r)')} ✓ the same!`), px, 360); bonus.style.width = (W - px - 16) + 'px'; hide(bonus);
    return [{
      cap: `The big circle has area ${T('\\pi R^2')}.`,
      run: (c) => Promise.all([c.anim(big, [{ opacity: 0 }, { opacity: 1 }], 400), c.anim(rR, [{ opacity: 0 }, { opacity: 1 }], 400, { delay: 200 }), c.fadeIn(lR, 300, { delay: 200 })])
    }, {
      cap: `Cut out the small circle, area ${T('\\pi r^2')}. The ring has area ${T('\\pi R^2-\\pi r^2')}. The hole doesn’t have to be in the middle: the area is the same anywhere.`,
      run: async (c) => {
        await Promise.all([c.anim(hole, [{ opacity: 0 }, { opacity: 1 }], 400), c.anim(rr, [{ opacity: 0 }, { opacity: 1 }], 400, { delay: 150 }), c.fadeIn(lr, 300, { delay: 150 }), c.fadeIn(lines[0], 400, { delay: 250 })]);
        await Promise.all([hole, rr, lr].map((e) => c.anim(e, [{ transform: 'translate(0px, 0px)' }, { transform: `translate(${off * 0.7}px, ${off * 0.55}px)` }], 700)));
      }
    }, {
      cap: `<b>GCF first:</b> both terms contain ${T('\\pi')}. ${T('A=\\pi(R^2-r^2)')}.`,
      run: (c) => Promise.all([c.fadeIn(lines[1], 400), notes[1] && c.fadeIn(notes[1], 300)])
    }, {
      cap: `The bracket is a difference of squares: ${T('A=\\pi(R-r)(R+r)')}.`,
      run: (c) => Promise.all([c.fadeIn(lines[2], 400), notes[2] && c.fadeIn(notes[2], 300)])
    }, {
      cap: `Substitute: ${T(`R-r=${R - r}`)} and ${T(`R+r=${R + r}`)}. So ${T(`A=\\pi(${R - r})(${R + r})=${val}\\pi`)}, about ${approx}.${R % 1 || r % 1 ? ' No decimals squared!' : ' No squaring needed.'}`,
      run: async (c) => { await c.fadeIn(lines[3], 400); await c.pop(lines[4], 420); }
    }, {
      cap: `Why the factored form makes sense: cut the ring and straighten it out. It is close to a trapezoid, ${T('R-r')} tall, with parallel sides ${T('2\\pi r')} and ${T('2\\pi R')}.`,
      run: async (c) => {
        await Promise.all([big, hole, rR, rr].map((e) => c.anim(e, [{ opacity: 1 }, { opacity: 0 }], 400)).concat([fadeOut(c, lR, 300), fadeOut(c, lr, 300)]));
        await Promise.all([c.anim(trap, [{ opacity: 0, transform: 'scaleX(.4)' }, { opacity: 1, transform: 'none' }], 700), c.fadeIn(bonus, 400, { delay: 400 })]);
      }
    }];
  }
};

/* ============ warm-up: the 6 × 6 tile picture ============ */
function mountWarmTiles() {
  const st = document.getElementById('wu-tiles'); if (!st) return;
  const C = 40, S = 36, ox = 50, oy = 40;
  const pos = (i, j) => [ox + i * C, oy + j * C];
  const tiles = [];
  for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
    const t = h('div', 'u4l4-wt'); const [x, y] = pos(i, j); at(t, x, y); st.appendChild(t);
    tiles.push({ el: t, i, j, lifted: i < 4 && j < 4, strip: i >= 4 && j < 4 });
  }
  const hole = h('div', 'u4l4-wt-hole', '4 × 4<br>lifted out'); at(hole, ox, oy); box(hole, 4 * C - 4, 4 * C - 4); st.appendChild(hole);
  const dimT = h('div', 'u4l4-wt-dim t', '6'); at(dimT, ox, oy - 30); box(dimT, 6 * C - 4, 22); st.appendChild(dimT);
  const dimL = h('div', 'u4l4-wt-dim l', '6'); at(dimL, ox - 32, oy); box(dimL, 22, 6 * C - 4); st.appendChild(dimL);
  const cnt = h('div', 'u4l4-wt-cnt'); at(cnt, ox, oy + 6 * C + 14); st.appendChild(cnt);
  let lifted = false, moved = false;
  const setLift = (on) => {
    lifted = on; st.classList.toggle('lifted', on);
    tiles.forEach((t) => { if (t.lifted) t.el.classList.toggle('gone', on); });
    cnt.innerHTML = on ? K('6^2-4^2=36-16=20') + ' tiles left' : '';
  };
  const setMove = (on) => {
    if (on && !lifted) setLift(true);
    moved = on; st.classList.toggle('moved', on);
    tiles.filter((t) => t.strip).forEach((t, k) => {
      const [x, y] = on ? pos(6 + t.j, 4 + (t.i - 4)) : pos(t.i, t.j);
      t.el.style.transitionDelay = (k * 50) + 'ms'; at(t.el, x, y); t.el.classList.toggle('mv', on);
    });
    dimT.textContent = on ? '10' : '6'; box(dimT, (on ? 10 : 6) * C - 4, 22); at(dimT, ox, on ? oy + 4 * C - 30 : oy - 30);
    dimL.textContent = on ? '2' : '6'; box(dimL, 22, (on ? 2 : 6) * C - 4); at(dimL, ox - 32, on ? oy + 4 * C : oy);
    cnt.innerHTML = on ? K('(6-4)(6+4)=2\\times10=20') + ' ✓ same tiles' : lifted ? K('6^2-4^2=36-16=20') + ' tiles left' : '';
  };
  document.getElementById('wu-lift').addEventListener('click', () => { if (moved) setMove(false); setLift(!lifted); });
  document.getElementById('wu-move').addEventListener('click', () => setMove(!moved));
  document.getElementById('wu-reset').addEventListener('click', () => { setMove(false); setLift(false); });
}

/* ============ warm-up: which numbers are a difference of two squares? ============ */
function mountWarmCards() {
  const host = document.getElementById('wu-cards'); if (!host) return;
  const way = (n) => (n % 2 ? [(n + 1) / 2, (n - 1) / 2] : n % 4 === 0 ? [n / 4 + 1, n / 4 - 1] : null);
  const cards = [];
  for (let n = 1; n <= 16; n++) {
    const w = way(n), b = h('button', 'u4l4-card' + (n % 2 ? ' odd' : ' even'), `<b>${n}</b><small></small>`); b.type = 'button';
    const show = (on) => { b.classList.toggle('shown', on); b.classList.toggle(w ? 'yes' : 'no', on); b.querySelector('small').innerHTML = on ? (w ? K(`${w[0]}^2-${w[1]}^2`) : '✗ no way?') : ''; };
    if ([3, 7, 8].includes(n)) { show(true); b.classList.add('given'); }
    b.addEventListener('click', () => { if (!b.classList.contains('given')) show(!b.classList.contains('shown')); });
    host.appendChild(b); cards.push({ b, show, given: [3, 7, 8].includes(n) });
  }
  const note = document.getElementById('wu-cards-note');
  document.getElementById('wu-cards-all').addEventListener('click', () => {
    const allOn = cards.every((c) => c.b.classList.contains('shown'));
    cards.forEach((c, i) => { if (!c.given) setTimeout(() => c.show(!allOn), allOn ? 0 : i * 60); });
  });
  document.getElementById('wu-cards-odd').addEventListener('click', () => {
    const on = host.classList.toggle('split');
    note.innerHTML = on ? '<b>Odds</b> all work (neighbours!). <b>Evens</b> only work when they are multiples of 4: <b>2, 6, 10, 14</b> leave remainder 2 when divided by 4.' : '';
  });
}

/* ============ small static pieces ============ */
function mountKey() {
  const k = document.getElementById('tile-key'); if (!k) return;
  const t = (kind, sgn, w, ht, lab) => `<span class="u4l4-ki"><span class="u4l4-tile u4l4-kt ${kind} ${sgn > 0 ? 'pos' : 'neg'}" style="width:${w}px;height:${ht}px"></span>${K(lab)}</span>`;
  k.innerHTML = `<span class="u4l4-kh">Tiles:</span>${t('k2', 1, 40, 40, '=x^2')}${t('k1', 1, 12, 40, '=x')}${t('k0', 1, 12, 12, '=1')}<span class="u4l4-ksep"></span><span class="u4l4-kh">negative:</span>${t('k2', -1, 40, 40, '=-x^2')}${t('k1', -1, 12, 40, '=-x')}${t('k0', -1, 12, 12, '=-1')}`;
}
function mountSquares() {
  const r = document.getElementById('sq-ref'); if (!r) return;
  for (let k = 1; k <= 15; k++) {
    const b = h('button', 'u4l4-sqc', `<b>${k * k}</b><small>${K(`${k}^2`)}</small>`); b.type = 'button';
    b.addEventListener('click', () => b.classList.toggle('shown')); r.appendChild(b);
  }
  const all = h('button', 'pill small', 'Show roots'); all.type = 'button';
  all.addEventListener('click', () => { const on = !r.querySelector('.u4l4-sqc:not(.shown)'); r.querySelectorAll('.u4l4-sqc').forEach((b) => b.classList.toggle('shown', !on)); });
  r.appendChild(all);
}
function mountReveals() {
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { zeroMiddle, tileRect, cutMove, sumNever, detector, gcfFirst, rink, mental, ring };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountExplainers(); mountWarmTiles(); mountWarmCards(); mountKey(); mountSquares(); mountReveals();

/* ---------- Math History (the brown box): Fermat's method on 5959 ----------
 * √5959 ≈ 77.2, so try a = 78, 79, 80 in turn: a² − 5959 is 125 (between 11² and 12²), 282 (between 16² and 17²), then
 * 441 = 21². Pause on the square, then 5959 = 80² − 21² = (80 − 21)(80 + 21) = 59 × 101 builds along the bottom. */
(function fermatHunt() {
  const svg = document.getElementById('fermat-anim'); if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k])); (parent || svg).appendChild(e); return e; };
  const txt = (s, attrs, parent) => { const e = mk('text', attrs, parent); e.textContent = s; return e; };
  const N = 5959, A0 = Math.ceil(Math.sqrt(N));
  const isq = (n) => Math.round(Math.sqrt(n)) ** 2 === n;
  const rows = []; for (let a = A0; ; a++) { rows.push(a); if (isq(a * a - N)) break; }
  const COL = [44, 128, 236, 300], RY = (i) => 140 + i * 38;
  const head = txt(`N = ${N}`, { x: 24, y: 42, class: 'u4l3h-n' });
  const root = txt(`√${N} ≈ ${Math.sqrt(N).toFixed(1)}, so start at a = ${A0}`, { x: 172, y: 40, class: 'u4l3h-root' });
  const hdr = mk('g', { class: 'u4l3h-fade' });
  [['a', COL[0], 'middle'], ['a²', COL[1], 'middle'], [`a² − ${N}`, COL[2], 'middle'], ['a perfect square?', COL[3], 'start']].forEach(([s, x, an]) => txt(s, { x, y: 96, 'text-anchor': an, class: 'u4l3h-th' }, hdr));
  mk('line', { x1: 16, x2: 584, y1: 106, y2: 106, class: 'u4l3h-rule' }, hdr);
  const R = rows.map((a, i) => {
    const d = a * a - N, r = Math.sqrt(d), lo = Math.floor(r), win = isq(d), y = RY(i);
    const band = mk('rect', { x: 16, y: y - 26, width: 568, height: 36, rx: 8, class: 'u4l3h-band' });
    const cells = [
      txt(String(a), { x: COL[0], y, 'text-anchor': 'middle', class: 'u4l3h-td u4l3h-a' }),
      txt(String(a * a), { x: COL[1], y, 'text-anchor': 'middle', class: 'u4l3h-td' }),
      txt(String(d), { x: COL[2], y, 'text-anchor': 'middle', class: 'u4l3h-td u4l3h-d' }),
      txt(win ? `${d} = ${r}²  ✓` : `between ${lo}² = ${lo * lo} and ${lo + 1}² = ${(lo + 1) ** 2}  ✗`, { x: COL[3], y, class: 'u4l3h-v' + (win ? ' u4l3h-yes' : ' u4l3h-no') }),
    ];
    return { band, cells, win };
  });
  const a = rows[rows.length - 1], b = Math.sqrt(a * a - N);
  const fin = txt('', { x: 24, y: 274, class: 'u4l3h-fin' });
  const F = [`${N} = ${a}² − ${b}²`, ` = (${a} − ${b})(${a} + ${b})`, ` = ${a - b} × ${a + b}`].map((s, i) => { const t = mk('tspan', { class: 'u4l3h-ft' + (i === 2 ? ' u4l3h-gold' : '') }, fin); t.textContent = s; return t; });
  const on = (el, b) => el.classList.toggle('on', !!b);
  const R0 = 2200, RS = 2100, FT = R0 + rows.length * RS + 900, END = FT + 3200;
  function draw(ms) {
    on(head, true); on(root, ms >= 500); on(hdr, ms >= 1300);
    R.forEach((r, i) => {
      const t = ms - (R0 + i * RS);
      r.cells.forEach((c, j) => on(c, t >= j * 380 + (j === 3 ? 250 : 0)));
      on(r.band, r.win && t >= 1400);
    });
    F.forEach((f, i) => on(f, ms >= FT + i * 1100));
  }
  let t0 = 0, raf = 0;
  function frame(now) { if (!t0) t0 = now; const ms = now - t0; draw(ms); if (ms < END) raf = requestAnimationFrame(frame); }
  function play() {
    cancelAnimationFrame(raf); t0 = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(END); return; }
    raf = requestAnimationFrame(frame);
  }
  draw(0);
  svg.addEventListener('click', play);
  const btn = svg.closest('.hist-anim') && svg.closest('.hist-anim').querySelector('.hist-play'); if (btn) btn.addEventListener('click', play);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.5 });
    io.observe(svg);
  } else play();
})();
