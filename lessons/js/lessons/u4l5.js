/* Math 10C · Unit 4 · Lesson 5 — Factoring ax² + bx + c (where a ≠ 1).
 * Explainers: tiles into a rectangle, the area box, why the pair multiplies to ac, the box and decomposition side by side,
 * the systematic factor-pair hunt, and the full-range routine (GCF / −1 first). Plus the warm-up and the static figures. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';
import { standup } from '../standup.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const box = (el, w, hh) => { el.style.width = w + 'px'; el.style.height = hh + 'px'; return el; };
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
/* KaTeX allowing \htmlClass (pieces of a line that appear one at a time) */
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};
const T = (s) => tex(String(s));
const spans = (root, cls) => [...root.querySelectorAll('.' + cls)];
const showSpans = (c, els, ms = 340) => Promise.all(els.map((e) => c.anim(e, [{ opacity: 0 }, { opacity: 1 }], ms)));
const pulse = (c, el, s = 1.1, ms = 480) => c.anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], ms);
const fadeOut = (c, el, ms = 300) => c.anim(el, [{ opacity: el.style.opacity === '' ? 1 : +el.style.opacity }, { opacity: 0 }], ms);
const on = (c, el, delay = 0) => c.sleep(delay).then(() => el.classList.add('on'));

const TEAL = '#13807a', AMB = '#c27a0e', PUR = '#7b4fc4', BLU = '#2f6fd0', RED = '#c93a33', OK = '#12805a', MAG = '#c2417a';
const ROWC = [TEAL, PUR], COLC = MAG;
const tc = (col, s) => `\\textcolor{${col}}{${s}}`;

/* ============ algebra: monomials and trinomials as LaTeX ============ */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
/* c·v^i·w^j as LaTeX; first = no leading "+" */
function mono(c, v, i, w, j, first = true) {
  const pw = (s, e) => (e && s ? s + (e > 1 ? `^{${e}}` : '') : '');
  const vars = pw(v, i) + pw(w, j), a = Math.abs(c);
  const body = vars ? (a === 1 ? '' : String(a)) + vars : String(a);
  return (c < 0 ? '-' : first ? '' : '+') + body;
}
const paren = (n) => (String(n).startsWith('-') ? `(${n})` : String(n));
const lin = (p, q, v = 'x', w = '') => mono(p, v, 1, w, 0) + mono(q, v, 0, w, 1, false);
function findPair(P, b) { const A = Math.abs(P); for (let m = -A; m <= A; m++) if (m && P % m === 0 && m + P / m === b) return [m, P / m]; return null; }
/* Everything about one trinomial ax² + bxw + cw² split as ax² + m·xw + n·xw + cw² (m top-right, n bottom-left of the box).
 * Row 1's label is gcd(a, m)·x; the columns are what's left; row 2 is whatever makes both columns work. */
function solve(d) {
  const v = d.v || 'x', w = d.w || '', { a, b, c } = d;
  const [m, n] = d.pair || findPair(a * c, b);
  const g1 = gcd(a, m), r1 = g1, c1 = a / g1, c2 = m / g1, r2 = (n * g1) / a;
  const S = {
    v, w, a, b, c, ac: a * c, m, n, r1, r2, c1, c2,
    TL: mono(a, v, 2, w, 0), TR: mono(m, v, 1, w, 1), BL: mono(n, v, 1, w, 1), BR: mono(c, v, 0, w, 2),
    tri: mono(a, v, 2, w, 0) + mono(b, v, 1, w, 1, false) + mono(c, v, 0, w, 2, false), bx: mono(b, v, 1, w, 1),
    colB: lin(c1, c2, v, w), rowB: lin(r1, r2, v, w),
    r1T: mono(r1, v, 1, w, 0), r2T: mono(r2, v, 0, w, 1, false), r2P: mono(r2, v, 0, w, 1),
    c1T: mono(c1, v, 1, w, 0), c2T: mono(c2, v, 0, w, 1, false), c2P: mono(c2, v, 0, w, 1)
  };
  S.sgn = (k) => mono([a, m, n, c][k], v, [2, 1, 1, 0][k], w, [0, 1, 1, 2][k], false); // a cell written as a later term
  S.cells = [S.TL, S.TR, S.BL, S.BR];
  S.split = S.TL + S.sgn(1) + S.sgn(2) + S.sgn(3);
  S.foil = S.TL + S.sgn(2) + S.sgn(1) + S.sgn(3); // (colB)(rowB) expanded in FOIL order: First, Outside, Inside, Last
  S.sq = S.colB === S.rowB;
  return S;
}
/* the second group's factor, written the way the booklet does: +1(3x−2), −1(2x+7), −2y(3x−y) */
const grp2 = (S) => (Math.abs(S.r2) === 1 && !S.w ? (S.r2 < 0 ? '-1' : '+1') : S.r2T);
const signNote = (S) => (S.ac > 0 ? `${T('ac>0')}, so both numbers have the <b>same sign</b> as ${T('b')}${S.b < 0 ? ' (negative)' : ''}.` : `${T('ac<0')}, so the numbers have <b>opposite signs</b>; the bigger one takes the sign of ${T('b')}.`);

/* ============ an area box drawn in a stage ============ */
function drawBox(stage, S, bx, by, cw, ch, o = {}) {
  const pos = [[0, 0], [1, 0], [0, 1], [1, 1]], kinds = ['ka', 'kb', 'kb', 'kc'];
  const cells = pos.map(([i, j], k) => add(stage, box(h('div', 'u4l5-cell ' + kinds[k]), cw + 2, ch + 2), bx + i * cw, by + j * ch));
  const frame = add(stage, box(h('div', 'u4l5-cell'), 2 * cw + 2, 2 * ch + 2), bx, by); frame.style.background = 'transparent'; frame.style.borderWidth = '3px'; frame.style.zIndex = 2;
  const labs = pos.map(([i, j], k) => { const e = add(stage, h('div', 'u4l5-cl c' + (o.small ? ' sm' : ''), K(o.cellTex ? o.cellTex[k] : S.cells[k])), bx + i * cw + cw / 2 + 1, by + j * ch + ch / 2 + 1); hide(e); return e; });
  const rowL = [S.r1T, S.r2T].map((t, j) => { const e = add(stage, h('div', 'u4l5-lab r', K(o.rowTex ? o.rowTex[j] : t)), bx - 12, by + j * ch + ch / 2); e.style.color = ROWC[j]; hide(e); return e; });
  const colL = [S.c1T, S.c2T].map((t, i) => { const e = add(stage, h('div', 'u4l5-lab c', K(o.colTex ? o.colTex[i] : t)), bx + i * cw + cw / 2, by - 25); e.style.color = o.colCol ? o.colCol[i] : COLC; hide(e); return e; });
  const rowHi = [0, 1].map((j) => { const e = add(stage, box(h('div', 'u4l5-hi'), 2 * cw + 12, ch + 10), bx - 5, by + j * ch - 4); e.style.setProperty('--pc', ROWC[j]); hide(e); return e; });
  const colHi = [0, 1].map((i) => { const e = add(stage, box(h('div', 'u4l5-hi'), cw + 10, 2 * ch + 12), bx + i * cw - 4, by - 5); e.style.setProperty('--pc', COLC); hide(e); return e; });
  const fill = (c, k, delay = 0) => Promise.all([on(c, cells[k], delay), c.pop(labs[k], 380, { delay })]);
  const flashAll = async (c) => { for (let k = 0; k < 4; k++) await Promise.all([pulse(c, labs[k], 1.18, 340), pulse(c, rowL[pos[k][1]], 1.15, 340), pulse(c, colL[pos[k][0]], 1.15, 340)]); };
  return { cells, labs, rowL, colL, rowHi, colHi, fill, flashAll };
}
const wline = (stage, html, x, y, cls = '') => add(stage, h('div', 'u4l5-wl ' + cls, html), x, y);

/* ============ 2. Algebra tiles: arrange the pile into a rectangle ============ */
const TRD = {
  demo: { p: 2, r: 1, q: 1, s: 3, tries: [[3, 1]] },   // 2x² + 7x + 3
  sq: { p: 2, r: 2, q: 1, s: 3, tries: [] },           // 4x² + 8x + 3
  zero: { p: 2, r: 1, q: 3, s: -1, tries: [] },        // 2x² + x − 3
  e1: { p: 3, r: 1, q: 2, s: 2, tries: [[4, 1]] },     // 3x² + 8x + 4
  e2: { p: 4, r: 1, q: 1, s: 3, tries: [[3, 1]] }      // 4x² + 13x + 3
};
const trTri = (d) => { const a = d.p * d.r, b = d.r * d.q + d.p * d.s, c = d.q * d.s; return { a, b, c, t: mono(a, 'x', 2, '', 0) + mono(b, 'x', 1, '', 0, false) + mono(c, 'x', 0, '', 0, false) }; };
const tileRect = {
  title: 'Arrange the tiles into a rectangle',
  height: 470,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'demo', label: tex('2x^2+7x+3') }, { v: 'sq', label: tex('4x^2+8x+3') }, { v: 'zero', label: tex('2x^2+x-3') }, { sep: 'Example 1 check:' }, { v: 'e1', label: '(b)' }, { sep: 'Example 2 check:' }, { v: 'e2', label: tex('4x^2+13x+3') }],
  intro: (k) => `Factor ${T(trTri(TRD[k]).t)} with algebra tiles: build a <b>rectangle</b> with every tile and no gaps. Its sides are the factors.`,
  make(stage, key, ex) {
    const W = ex.W, d = TRD[key], { p, r, q, s } = d, { a, b, c, t: triT } = trTri(d);
    // the biggest tiles that fit every arrangement (tries included) on the left and the whole pile on the right
    const qMax = Math.max(Math.abs(q), ...d.tries.map((t) => Math.abs(t[0]))), sMax = Math.max(Math.abs(s), ...d.tries.map((t) => Math.abs(t[1])));
    const nX = Math.abs(r * q + p * s) + 2 * Math.min((q > 0 ? r * q : 0) + (s > 0 ? p * s : 0), (q < 0 ? -r * q : 0) + (s < 0 ? -p * s : 0));
    const pileH = (x) => { const u = Math.round(x / 3), per = Math.max(1, Math.floor(390 / (x + 12))); return 54 + Math.ceil(a / per) * (x + 12) + 8 + Math.ceil(nX / per) * (u + 12) + 8 + u; };
    let X = 112; while (X > 60 && (p * X + qMax * Math.round(X / 3) > 430 || r * X + sMax * Math.round(X / 3) > 300 || pileH(X) > 440)) X -= 2;
    const U = Math.round(X / 3), per = Math.max(1, Math.floor(390 / (X + 12))), ox = 104, oy = 100, px0 = 566;
    const head = add(stage, h('div', 'u4l5-wl', K(triT)), 24, 14); void head;
    const pt = add(stage, h('div', 'u4l5-ptag', 'the tiles'), px0, 26); void pt;
    // tiles
    const mk = (kind, sgn, w, hh) => { const el = add(stage, box(h('div', `u4l5-t u4l5-${kind} ${sgn > 0 ? 'pos' : 'neg'}`, `<i style="font-size:${minusFs(w, hh)}px">−</i>`), w, hh), 0, 0); hide(el); return { el, kind, sgn, w, hh, st: null }; };
    const needPos = (q > 0 ? r * q : 0) + (s > 0 ? p * s : 0), needNeg = (q < 0 ? -r * q : 0) + (s < 0 ? -p * s : 0);
    const z = Math.min(needPos, needNeg);
    const T2 = Array.from({ length: a }, () => mk('k2', 1, X, X));
    const T1 = Array.from({ length: Math.abs(b) }, () => mk('k1', Math.sign(b), X, U));
    const extra = []; for (let k = 0; k < z; k++) extra.push(mk('k1', 1, X, U), mk('k1', -1, X, U));
    const T1all = T1.concat(extra);
    const T0 = Array.from({ length: Math.abs(c) }, () => mk('k0', Math.sign(c), U, U));
    const xRows = Math.ceil(T1all.length / per), y1 = 54 + Math.ceil(a / per) * (X + 12) + 8, y0 = y1 + xRows * (U + 12) + 8;
    const kf = (t, st) => ({ left: (st.cx - t.w / 2) + 'px', top: (st.cy - t.hh / 2) + 'px', transform: `rotate(${st.rot}deg)` });
    const place = (t, st) => { t.st = st; Object.assign(t.el.style, kf(t, st)); };
    T2.forEach((t, i) => place(t, { cx: px0 + (i % per) * (X + 12) + X / 2, cy: 54 + Math.floor(i / per) * (X + 12) + X / 2, rot: 0 }));
    T1all.forEach((t, i) => place(t, { cx: px0 + (i % per) * (X + 12) + X / 2, cy: y1 + Math.floor(i / per) * (U + 12) + U / 2, rot: 0 }));
    T0.forEach((t, i) => place(t, { cx: px0 + i * (U + 12) + U / 2, cy: y0 + U / 2, rot: 0 }));
    const pile = new Map([...T2, ...T1all, ...T0].map((t) => [t, t.st]));
    const move = (cc, t, st, delay = 0) => { const from = t.st; t.st = st; t.el.firstChild.style.transform = `rotate(${-st.rot}deg)`; return cc.anim(t.el, [kf(t, from), kf(t, st)], 650, { delay }); };
    const arrange = (qq, ss) => {
      const tg = new Map();
      T2.forEach((t, k) => tg.set(t, { cx: ox + (k % p) * X + X / 2, cy: oy + Math.floor(k / p) * X + X / 2, rot: 0 }));
      const pool = [...T1all], take = (sg) => { const k = pool.findIndex((t) => t.sgn === sg); return k < 0 ? null : pool.splice(k, 1)[0]; };
      let used = 0;
      for (let j = 0; j < r; j++) for (let k = 0; k < Math.abs(qq); k++) { const t = take(Math.sign(qq)); if (t) { used++; tg.set(t, { cx: ox + p * X + k * U + U / 2, cy: oy + j * X + X / 2, rot: 90 }); } }
      for (let k = 0; k < Math.abs(ss); k++) for (let i = 0; i < p; i++) { const t = take(Math.sign(ss)); if (t) { used++; tg.set(t, { cx: ox + i * X + X / 2, cy: oy + r * X + k * U + U / 2, rot: 0 }); } }
      let u = 0; for (let l = 0; l < Math.abs(ss); l++) for (let k = 0; k < Math.abs(qq); k++) { const t = T0[u++]; if (t) tg.set(t, { cx: ox + p * X + k * U + U / 2, cy: oy + r * X + l * U + U / 2, rot: 0 }); }
      return { tg, left: pool, used, Wd: p * X + Math.abs(qq) * U, Hd: r * X + Math.abs(ss) * U };
    };
    const runArr = (cc, A) => { let i = 0; const ps = []; A.tg.forEach((st, t) => { if (t.kind !== 'k2') ps.push(move(cc, t, st, 60 * i++)); }); A.left.forEach((t) => { if (t.st !== pile.get(t)) ps.push(move(cc, t, pile.get(t))); }); return Promise.all(ps); };
    // the rectangle's outline, labels and the four regions of the area box
    const rout = add(stage, box(h('div', 'u4l5-rout'), p * X, r * X), ox, oy); hide(rout);
    const sizeOut = (cc, A) => cc.anim(rout, [{ width: rout.style.width, height: rout.style.height, opacity: 1 }, { width: A.Wd + 'px', height: A.Hd + 'px', opacity: 1 }], 500);
    const fin = arrange(q, s), Wl = lin(p, q), Hl = lin(r, s);
    const topL = add(stage, h('div', 'u4l5-lab c', K(Wl)), ox + fin.Wd / 2, oy - 28); topL.style.color = COLC; hide(topL);
    const sideL = add(stage, h('div', 'u4l5-lab r', K(Hl)), ox - 14, oy + fin.Hd / 2); sideL.style.color = ROWC[0]; hide(sideL);
    const badge = add(stage, h('div', 'u4l5-badge no'), px0 + 120, 14); hide(badge);
    const regs = [[0, 0, p * X, r * X, TEAL, mono(a, 'x', 2, '', 0)], [p * X, 0, Math.abs(q) * U, r * X, AMB, mono(r * q, 'x', 1, '', 0)], [0, r * X, p * X, Math.abs(s) * U, AMB, mono(p * s, 'x', 1, '', 0)], [p * X, r * X, Math.abs(q) * U, Math.abs(s) * U, BLU, mono(c, 'x', 0, '', 0)]].map(([x, y, w, hh, col, lab]) => {
      const e = add(stage, box(h('div', 'u4l5-region'), w, hh), ox + x, oy + y); e.style.setProperty('--pc', col); hide(e);
      const l = add(stage, h('div', 'u4l5-rlab c', K(lab)), ox + x + w / 2, oy + y + hh / 2); l.style.setProperty('--pc', col); hide(l);
      return { e, l };
    });
    const exp4 = mono(p * r, 'x', 2, '', 0) + mono(p * s, 'x', 1, '', 0, false) + mono(q * r, 'x', 1, '', 0, false) + mono(q * s, 'x', 0, '', 0, false);
    const ex0 = Math.max(ox + p * X + Math.abs(q) * U + 60, 520);
    const E1 = wline(stage, K(`${triT}=(${Wl})(${Hl})`), ex0, 150, 'u4l5-ans'); hide(E1);
    const E2 = wline(stage, K(`\\text{Check: }(${Wl})(${Hl})`), ex0, 214, 'sm'); hide(E2);
    const E3 = wline(stage, K(`=${exp4}=${triT}\\ \\checkmark`), ex0, 254, 'sm'); hide(E3);
    const xw = (n) => `${n} ${T('x')}-tile${n === 1 ? '' : 's'}`, uw = (n) => `${n} unit tile${n === 1 ? '' : 's'}`;
    const steps = [{
      cap: `Lay out the tiles for ${T(triT)}: ${a} ${T('x^2')}-tiles, ${xw(Math.abs(b))} and ${uw(Math.abs(c))}.` + (b < 0 || c < 0 ? ' A <b>white tile with a minus sign</b> is negative.' : ''),
      run: (cc) => Promise.all([...T2, ...T1, ...T0].map((t, i) => cc.pop(t.el, 320, { delay: i * 40 })))
    }, {
      cap: r === 1 ? `Put the ${a} ${T('x^2')}-tiles together in the <b>corner</b>, side by side.` : `Put the ${a} ${T('x^2')}-tiles together in the <b>corner</b>. They don’t have to be in a row: here they make a ${p} × ${r} square.`,
      run: (cc) => Promise.all([...T2.map((t, k) => move(cc, t, fin.tg.get(t), k * 90)), cc.fadeIn(rout, 300, { delay: 300 })])
    }];
    if (z) {
      steps.push({
        cap: `This rectangle needs ${needPos} positive ${T('x')}-tiles (standing up) and ${needNeg} negative ones (lying down), but the pile has just ${xw(Math.abs(b))}. Add <b>${z} zero pair${z > 1 ? 's' : ''}</b>: ${T('(+x)+(-x)=0')}, so the polynomial doesn’t change.`,
        run: async (cc) => {
          const zs = [];
          for (let k = 0; k < z; k++) {
            const [t1, t2] = [extra[2 * k], extra[2 * k + 1]];
            const zz = add(stage, h('div', 'u4l5-zero c', '0'), (t1.st.cx + t2.st.cx) / 2, Math.max(t1.st.cy, t2.st.cy) + 6); hide(zz); zs.push(zz);
            await Promise.all([cc.pop(t1.el, 320), cc.pop(t2.el, 320, { delay: 120 }), cc.pop(zz, 320, { delay: 240 })]);
          }
          await cc.sleep(500); await Promise.all(zs.map((e) => fadeOut(cc, e, 400)));
        }
      });
    }
    d.tries.forEach(([qq, ss]) => {
      const A = arrange(qq, ss), lft = A.left.length;
      steps.push({
        cap: `Try the ${uw(Math.abs(c))} as a <b>${qq} × ${ss}</b> block in the corner. Then ${xw(r * qq)} stand up on the right and ${p * ss} lie along the bottom: that uses ${A.used} ${T('x')}-tiles, but we have ${Math.abs(b)}. <b>${lft} left over</b> ✗`,
        run: async (cc) => {
          await Promise.all([runArr(cc, A), sizeOut(cc, A)]);
          A.left.forEach((t) => t.el.classList.add('left')); badge.textContent = `${lft} left over ✗`;
          await Promise.all([cc.pop(badge, 350), ...A.left.map((t) => cc.shake(t.el))]);
        }
      });
    });
    const nUp = r * Math.abs(q), nDn = p * Math.abs(s);
    steps.push({
      cap: (d.tries.length ? 'Rearrange: the ' : 'The ') + `unit tiles make a <b>${Math.abs(q)} × ${Math.abs(s)}</b> block. Now ${xw(nUp)} stand${nUp === 1 ? 's' : ''} up and ${nDn} lie along the bottom` + (z ? `: ${nUp} positive and ${nDn} negative, ${T(`${nUp}-${nDn}=${b}`)}.` : `: ${T(`${nUp}+${nDn}=${b}`)}.`) + ' <b>Every tile is used and there are no gaps</b> ✓',
      run: async (cc) => {
        [...T1all].forEach((t) => t.el.classList.remove('left'));
        await Promise.all([runArr(cc, fin), sizeOut(cc, fin), badge.style.opacity === '1' ? fadeOut(cc, badge) : null]);
      }
    });
    steps.push({
      cap: `Read the sides of the rectangle. Width: ${T(Wl)}. Height: ${T(Hl)}.` + (s < 0 ? ` (A <b>bookkeeping</b> rectangle: the row of negative tiles stands for ${T(String(s))}.)` : ''),
      run: (cc) => Promise.all([cc.pop(topL, 380), cc.pop(sideL, 380, { delay: 150 })])
    }, {
      cap: `Area = width × height, so ${T(`${triT}=(${Wl})(${Hl})`)}. <b>Check by expanding</b>: ${T(`(${Wl})(${Hl})=${exp4}`)} ✓`,
      run: (cc) => Promise.all([cc.fadeIn(E1, 400), cc.fadeIn(E2, 400, { delay: 300 }), cc.fadeIn(E3, 400, { delay: 500 })])
    }, {
      cap: `Group the tiles into <b>four blocks</b>: ${regs.map((x, k) => T([mono(a, 'x', 2, '', 0), mono(r * q, 'x', 1, '', 0), mono(p * s, 'x', 1, '', 0), String(c)][k])).join(', ')}. That’s an <b>area box</b> (Section 4). The two middle blocks multiply to ${T(`(${mono(r * q, 'x', 1, '', 0)})(${mono(p * s, 'x', 1, '', 0)})=${mono(a * c, 'x', 2, '', 0)}`)}, the same as the corners ${T(`(${mono(a, 'x', 2, '', 0)})(${c})`)}.`,
      run: (cc) => Promise.all(regs.map((g, k) => Promise.all([cc.fadeIn(g.e, 350, { delay: k * 150, from: 'none' }), cc.pop(g.l, 350, { delay: 150 + k * 150 })])))
    });
    void W;
    return steps;
  }
};

/* ============ 4. The area box ============ */
const AB = {
  demo: { a: 6, b: -1, c: -2, pair: [-4, 3] },
  s1: { a: 6, b: 19, c: 10, pair: [4, 15] },
  a3: { a: 3, b: 10, c: -8, pair: [12, -2] },
  b3: { a: 2, b: -7, c: 6, pair: [-4, -3] }
};
function pairList(P, b) {
  const out = [], A = Math.abs(P);
  for (let d = 1; d * d <= A; d++) if (A % d === 0) {
    const e = A / d;
    if (P > 0) { const sg = b < 0 ? -1 : 1; out.push([sg * d, sg * e]); }
    else { out.push([d, -e]); if (d !== e) out.push([-d, e]); }
  }
  return out.map(([m, n]) => ({ m, n, ok: m + n === b }));
}
const areaBox = {
  title: 'Fill the box, read the sides',
  height: 450,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'demo', label: tex('6x^2-x-2') }, { v: 's1', label: tex('6x^2+19x+10') }, { sep: 'Example 3 check:' }, { v: 'a3', label: '(a)' }, { v: 'b3', label: '(b)' }],
  intro: (k) => `Factor ${T(solve(AB[k]).tri)} with an <b>area box</b>.`,
  make(stage, key, ex) {
    const W = ex.W, S = solve(AB[key]), bx = 118, by = 100, cw = 166, ch = 100;
    const B = drawBox(stage, S, bx, by, cw, ch);
    add(stage, h('div', 'u4l5-wl c', K(S.tri)), bx + cw, by + 2 * ch + 46);
    const px = 506, pw = W - px - 16, acx = mono(S.ac, S.v, 2, '', 0);
    const tgt = add(stage, h('div', 'u4l5-card', `The empty cells: <b>product</b> ${K(`(${S.TL})(${S.BR})=${acx}`)}, <b>sum</b> ${K(S.bx)}`), px, 22); tgt.style.width = pw + 'px'; hide(tgt);
    const pl = pairList(S.ac, S.b);
    const grid = add(stage, h('div', 'u4l5-chips'), px, 108); grid.style.width = pw + 'px';
    const chips = pl.map((pp) => { const e = h('div', 'u4l5-pc', `${K(`${pp.m}\\times${paren(pp.n)}`)}<small>sum ${K(String(pp.m + pp.n))}${pp.ok ? ' ✓' : ''}</small>`); grid.appendChild(e); hide(e); return e; });
    const found = wline(stage, `Pair: ${K(S.TR)} and ${K(S.BL)}`, px, 110, 'sm'); hide(found);
    const R1 = wline(stage, `<b style="color:${TEAL}">Row 1:</b> ${K(S.TL)} and ${K(S.TR)} share ${K(S.r1T)}`, px, 168, 'sm'); hide(R1);
    const R2 = wline(stage, `<b style="color:${COLC}">Columns:</b> ${K(`${S.TL}\\div ${S.r1T}=${S.c1T}`)}, ${K(`${S.TR}\\div ${S.r1T}=${S.c2P}`)}`, px, 212, 'sm'); hide(R2);
    const R3 = wline(stage, `<b style="color:${PUR}">Row 2:</b> ${K(`${S.BL}\\div ${S.c1T}=${S.r2P}`)}, ${K(`${S.BR}\\div ${paren(S.c2P)}=${S.r2P}`)} ✓`, px, 256, 'sm'); hide(R3);
    const R4 = wline(stage, K(`${S.tri}=(${tc(TEAL, S.r1T)}${tc(PUR, S.r2T)})(${tc(COLC, S.colB)})`), px, 316, 'u4l5-ans'); hide(R4);
    const R5 = wline(stage, K(`\\text{Check: }(${S.rowB})(${S.colB})=${S.split}=${S.tri}\\ \\checkmark`), 30, 398, 'sm'); hide(R5);
    return [{
      cap: `Draw a ${T('2\\times2')} box. Put ${T(S.TL)} in the <b>top-left</b> cell and ${T(S.BR)} in the <b>bottom-right</b> cell.`,
      run: (c) => Promise.all([B.fill(c, 0), B.fill(c, 3, 200)])
    }, {
      cap: `The two empty cells share the middle term ${T(S.bx)}. Like the warm-up’s diagonals, they must <b>multiply</b> to ${T(`(${S.TL})(${S.BR})=${acx}`)} and <b>add</b> to ${T(S.bx)}.`,
      run: (c) => c.fadeIn(tgt, 400)
    }, {
      cap: `Hunt for the pair. ${signNote(S)} Check each pair’s sum: only ${T(S.m)} and ${T(S.n)} add to ${T(S.b)}.`,
      run: async (c) => { await Promise.all(chips.map((e, i) => c.fadeIn(e, 280, { delay: i * 110 }))); pl.forEach((pp, i) => chips[i].classList.add(pp.ok ? 'ok' : 'dim')); await pulse(c, chips[pl.findIndex((pp) => pp.ok)], 1.08); }
    }, {
      cap: `Put ${T(S.TR)} and ${T(S.BL)} in the two empty cells. (Either order works: swapping them just swaps the rows and columns.)`,
      run: (c) => Promise.all([fadeOut(c, grid, 300), c.fadeIn(found, 350, { delay: 250 }), B.fill(c, 1, 250), B.fill(c, 2, 400)])
    }, {
      cap: `<b>Row 1:</b> ${T(S.TL)} and ${T(S.TR)} have the common factor ${T(S.r1T)}. Write it beside the row. Divide it out of each cell: what’s left, ${T(S.c1T)} and ${T(S.c2P)}, are the <b>column</b> labels.`,
      run: (c) => Promise.all([c.fadeIn(B.rowHi[0], 300), c.pop(B.rowL[0], 380, { delay: 150 }), c.fadeIn(R1, 350, { delay: 200 }), ...B.colL.map((e, i) => c.pop(e, 380, { delay: 450 + i * 150 })), c.fadeIn(R2, 350, { delay: 550 })])
    }, {
      cap: `<b>Row 2</b> must fit the <b>same columns</b>: ${T(`${S.BL}\\div ${S.c1T}=${S.r2P}`)}` + (S.r2 < 0 ? `, a <b>negative</b> label.` : '.') + ` It works for the last cell too: ${T(`${S.r2P}\\times${paren(S.c2P)}=${S.BR}`)} ✓`,
      run: (c) => Promise.all([fadeOut(c, B.rowHi[0], 250), c.fadeIn(B.rowHi[1], 300), c.pop(B.rowL[1], 380, { delay: 150 }), c.fadeIn(R3, 350, { delay: 200 })])
    }, {
      cap: `The side labels make one factor and the top labels the other: ${T(`${S.tri}=(${S.rowB})(${S.colB})`)}. <b>Check:</b> every cell is side × top, and the cells add back to the trinomial ✓`,
      run: async (c) => { await Promise.all([fadeOut(c, B.rowHi[1], 250), c.fadeIn(R4, 400)]); await B.flashAll(c); await c.fadeIn(R5, 350); }
    }];
  }
};

/* ============ 5. Why ac: the diagonals of the box ============ */
const WA = { gen: null, s1: { p: 3, q: 2, r: 2, s: 5 }, s1b: { p: 4, q: -1, r: 3, s: 2 } };
const whyAC = {
  title: 'Why the middle pieces multiply to ac',
  height: 420,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'gen', label: tex('(px+q)(rx+s)') }, { v: 's1', label: tex('(3x+2)(2x+5)') }, { v: 's1b', label: tex('(4x-1)(3x+2)') }],
  intro: (k) => (k === 'gen' ? `Expand ${T('(px+q)(rx+s)')} in an area box, and <b>don’t</b> collect the middle terms.` : `Expand ${T(k === 's1' ? '(3x+2)(2x+5)' : '(4x-1)(3x+2)')} in an area box, and <b>don’t</b> collect the middle terms.`),
  make(stage, key, ex) {
    const W = ex.W, n = WA[key], gen = !n, bx = 100, by = 92, cw = 152, ch = 104;
    const cP = '#13807a', cQ = '#c27a0e', cR = '#7b4fc4', cS = '#2f6fd0';
    const L = gen ? { p: tc(cP, 'p'), q: tc(cQ, 'q'), r: tc(cR, 'r'), s: tc(cS, 's') } : { p: tc(cP, n.p), q: tc(cQ, paren(n.q)), r: tc(cR, n.r), s: tc(cS, paren(n.s)) };
    const qs = gen ? '+' + L.q : n.q < 0 ? tc(cQ, String(n.q)) : '+' + tc(cQ, n.q), ss = gen ? '+' + L.s : n.s < 0 ? tc(cS, String(n.s)) : '+' + tc(cS, n.s);
    const rowTex = [`${L.p}x`, qs], colTex = [`${L.r}x`, ss];
    let cellTex, fac, line1, a, b, c, mP, nP;
    if (gen) {
      cellTex = [`${L.p}${L.r}x^2`, `${L.p}${L.s}x`, `${L.q}${L.r}x`, `${L.q}${L.s}`];
      fac = `(${L.p}x+${L.q})(${L.r}x+${L.s})`;
      line1 = `${fac}=${cellTex[0]}+${cellTex[1]}+${cellTex[2]}+${cellTex[3]}`;
    } else {
      a = n.p * n.r; mP = n.p * n.s; nP = n.q * n.r; c = n.q * n.s; b = mP + nP;
      cellTex = [mono(a, 'x', 2, '', 0), mono(mP, 'x', 1, '', 0), mono(nP, 'x', 1, '', 0), String(c)];
      fac = `(${lin(n.p, n.q)})(${lin(n.r, n.s)})`;
      line1 = `${fac}=${cellTex[0]}${mono(mP, 'x', 1, '', 0, false)}${mono(nP, 'x', 1, '', 0, false)}${mono(c, 'x', 0, '', 0, false)}`;
    }
    const S0 = { r1T: '', r2T: '', c1T: '', c2T: '', cells: cellTex };
    const B = drawBox(stage, S0, bx, by, cw, ch, { cellTex, rowTex, colTex, colCol: ['#1c2230', '#1c2230'] });
    B.rowL.forEach((e) => (e.style.color = '#1c2230')); B.labs.forEach((e) => e.classList.add('bg'));
    if (!gen) {
      const subs = [[L.p, L.r], [L.p, L.s], [L.q, L.r], [L.q, L.s]];
      B.labs.forEach((e, k) => { e.innerHTML = K(cellTex[k]) + `<div style="font-size:16px;font-weight:600;text-align:center">${K(`${subs[k][0]}\\cdot ${subs[k][1]}`)}</div>`; });
    }
    // diagonals
    const svg = svgEl('svg', { class: 'u4l5-diag' }); stage.appendChild(svg);
    const diag = (x1, y1, x2, y2, col) => { const l = svgEl('line', { x1, y1, x2, y2, stroke: col, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.75 }); svg.appendChild(l); const len = Math.hypot(x2 - x1, y2 - y1); l.style.strokeDasharray = len; l.style.strokeDashoffset = len; return { l, len }; };
    const m = 30, D1 = diag(bx + m, by + m, bx + 2 * cw - m, by + 2 * ch - m, RED), D2 = diag(bx + 2 * cw - m, by + m, bx + m, by + 2 * ch - m, BLU);
    const draw = (c, D) => c.anim(D.l, [{ strokeDashoffset: D.len }, { strokeDashoffset: 0 }], 600);
    const lx = 446, lh = 56, pqrs = `${L.p}${L.q}${L.r}${L.s}`;
    const l1 = wline(stage, K(line1), lx, 40, gen ? 'sm' : ''); hide(l1);
    const l2 = wline(stage, K(gen ? `a=${L.p}${L.r},\\quad b=${L.p}${L.s}+${L.q}${L.r},\\quad c=${L.q}${L.s}` : `a=${a},\\quad b=${mP}${mono(nP, '', 0, '', 0, false)}=${b},\\quad c=${c}`), lx, 40 + lh); hide(l2);
    const l3 = wline(stage, K(gen ? `${tc(RED, 'ac')}=(${L.p}${L.r})(${L.q}${L.s})=${pqrs}` : `${tc(RED, 'ac')}=${a}(${c})=${a * c}=(${L.p}\\cdot ${L.r})(${L.q}\\cdot ${L.s})`), lx, 40 + 2 * lh); hide(l3);
    const l4 = wline(stage, K(gen ? `(${L.p}${L.s})(${L.q}${L.r})=${pqrs}` : `${tc(BLU, `${mP}(${nP})`)}=${mP * nP}=(${L.p}\\cdot ${L.s})(${L.q}\\cdot ${L.r})`), lx, 40 + 3 * lh); hide(l4);
    const l5 = add(stage, h('div', 'u4l5-card', `The two middle pieces always <b>multiply to ${K('ac')}</b> and <b>add to ${K('b')}</b>.<br>That’s the pair decomposition hunts for.`), lx, 40 + 4 * lh + 8); l5.style.width = (W - lx - 16) + 'px'; hide(l5);
    const prs = gen ? T('ps') + ' and ' + T('qr') : T(mP) + ' and ' + T(nP);
    return [{
      cap: gen ? `Multiply two <b>general</b> binomials, ${T('(px+q)(rx+s)')}: one down the side of an area box, the other across the top.` : `Put ${T(fac.replace(/\\textcolor\{[^}]*\}\{([^}]*)\}/g, '$1'))} in an area box: one factor down the side, the other across the top.`,
      run: (c) => Promise.all([...B.rowL.map((e, i) => c.pop(e, 380, { delay: i * 120 })), ...B.colL.map((e, i) => c.pop(e, 380, { delay: 240 + i * 120 }))])
    }, {
      cap: `Fill each cell: <b>side × top</b>. Write out all four pieces and <b>don’t collect</b> the middle two yet.`,
      run: (c) => Promise.all([...[0, 1, 2, 3].map((k) => B.fill(c, k, k * 180)), c.fadeIn(l1, 400, { delay: 600 })])
    }, {
      cap: gen ? `Match it to ${T('ax^2+bx+c')}: ${T('a=pr')} is the top-left cell, ${T('c=qs')} the bottom-right, and the two middle pieces <b>add</b> to ${T('b=ps+qr')}.` : `Match it to ${T('ax^2+bx+c')}: ${T(`a=${a}`)}, ${T(`c=${c}`)}, and the middle pieces ${prs} <b>add</b> to ${T(`b=${b}`)}.`,
      run: (c) => c.fadeIn(l2, 400)
    }, {
      cap: gen ? `Multiply the <b>corners</b> (one diagonal): ${T('ac=(pr)(qs)')}. That product uses all four letters ${T('p,q,r,s')} once each.` : `Multiply the <b>corners</b> (one diagonal): ${T(`ac=${a}(${c})=${a * c}`)}. Track where the numbers came from: ${T(`(${n.p}\\cdot${n.r})(${paren(n.q)}\\cdot${paren(n.s)})`)}, all four numbers from the sides.`,
      run: (c) => Promise.all([draw(c, D1), c.fadeIn(l3, 400, { delay: 300 })])
    }, {
      cap: gen ? `Now multiply the two <b>middle pieces</b> (the other diagonal): ${T('(ps)(qr)')}. The <b>same four letters</b>! So ${T('(ps)(qr)=(pr)(qs)=ac')}.` : `Now multiply the two <b>middle pieces</b> (the other diagonal): ${T(`${mP}(${nP})=${mP * nP}`)}. The <b>same four numbers</b> from the sides, so the same product: ${T(`${mP}(${nP})=ac`)}.`,
      run: (c) => Promise.all([draw(c, D2), c.fadeIn(l4, 400, { delay: 300 })])
    }, {
      cap: `That’s why decomposition hunts for two integers with <b>product ${T('ac')}</b> and <b>sum ${T('b')}</b>: they are always the box’s two middle cells. When ${T('a=1')}, ${T('ac=c')}: exactly the Lesson 3 rule.`,
      run: (c) => Promise.all([c.pop(l5, 400), pulse(c, B.labs[1], 1.15), pulse(c, B.labs[2], 1.15)])
    }];
  }
};

/* ============ 5 & 7. The box and decomposition, side by side ============ */
const BD = {
  s1: { a: 6, b: 19, c: 10, pair: [4, 15] },
  s1b: { a: 12, b: 5, c: -2, pair: [8, -3] },
  a4: { a: 3, b: 8, c: 4, pair: [2, 6] },
  b4: { a: 4, b: 13, c: 3, pair: [1, 12] },
  e5: { a: 18, b: 3, c: -10, pair: [15, -12] },
  gcf: { pre: { src: '12x^2+42x+18', g: 6 }, a: 2, b: 7, c: 3, pair: [1, 6] },
  neg: { pre: { src: '-6x^2+x+2', g: -1 }, a: 6, b: -1, c: -2, pair: [-4, 3] },
  a6: { a: 6, b: 19, c: -7, pair: [21, -2] },
  b6: { v: 'n', a: 4, b: -5, c: -6, pair: [-8, 3] },
  c6: { a: 9, b: -12, c: 4, pair: [-6, -6] },
  d6: { v: 'y', pre: { src: '20-3y-2y^2', order: '-2y^2-3y+20', g: -1 }, a: 2, b: 3, c: -20, pair: [8, -5], alt: '(y+4)(5-2y)' },
  e6: { w: 'y', a: 3, b: -7, c: 2, pair: [-1, -6] }
};
function makeBD(title, choices, first) {
  return {
    title, height: 500, choices, value: first,
    intro: (k) => { const d = BD[k]; return `Factor ${T(d.pre ? d.pre.src : solve(d).tri)}: the <b>area box</b> on the left and <b>decomposition</b> on the right, one step at a time.`; },
    make(stage, key, ex) {
      const W = ex.W, d = BD[key], S = solve(d), H = 500, pre = d.pre, g = pre ? pre.g : 1;
      const bx = 112, by = 92, cw = 148, ch = 84, rx = 470;
      add(stage, h('div', 'u4l5-ptag', 'Area box'), 24, 16);
      add(stage, h('div', 'u4l5-ptag', 'Decomposition'), rx, 16);
      add(stage, box(h('div', 'u4l5-vsep'), 0, H - 96), 446, 16);
      const B = drawBox(stage, S, bx, by, cw, ch, { small: !!S.w });
      const lac = wline(stage, K(`ac=${S.a}(${S.c})=${S.ac}`), 30, by + 2 * ch + 30, 'sm'); hide(lac);
      const lpair = wline(stage, `Pair: ${K(String(S.m))} and ${K(String(S.n))}`, 30, by + 2 * ch + 72, 'sm'); hide(lpair);
      const lpair2 = wline(stage, `<small style="margin:0">${K(`${S.m}\\times${paren(S.n)}=${S.ac}`)} ✓ &nbsp; ${K(`${S.m}+${paren(S.n)}=${S.b}`)} ✓</small>`, 30, by + 2 * ch + 110, 'sm'); hide(lpair2);
      // the written work on the right
      const gp = g === -1 ? '-' : g === 1 ? '' : String(g);
      const L = [];
      if (pre && pre.order) L.push(['P0', K(`${pre.src}=${pre.order}`)]);
      if (pre) L.push(['P1', K(`${pre.order ? '' : pre.src}=${gp}(${S.tri})`)]);
      L.push(['T', `${K(S.tri)}<small>${K(`a=${S.a},\\ b=${S.b},\\ c=${S.c}`)}</small>`]);
      L.push(['S', K(`=${S.TL}${tc(AMB, S.sgn(1))}${tc(AMB, S.sgn(2))}${S.sgn(3)}`)]);
      L.push(['G', K(`=\\htmlClass{u4l5-g1}{${tc(TEAL, S.r1T)}(${tc(COLC, S.colB)})}\\htmlClass{u4l5-g2}{${tc(PUR, grp2(S))}(${tc(COLC, S.colB)})}`)]);
      L.push(['F', K(S.sq ? `=(${S.colB})(${S.colB})=\\boldsymbol{(${S.colB})^2}` : `=(${tc(COLC, S.colB)})(${tc(TEAL, S.r1T)}${tc(PUR, S.r2T)})`)]);
      if (pre) L.push(['FIN', K(`${pre.src}=${gp}${S.sq ? `(${S.colB})^2` : `(${S.colB})(${S.rowB})`}`)]);
      if (pre && d.alt) L.push(['ALT', K(`\\phantom{${pre.src}}=${d.alt}`)]);
      const lh = Math.min(50, Math.floor((H - 132) / L.length)), E = {};
      L.forEach(([k, html], i) => { E[k] = wline(stage, html, rx, 50 + i * lh, (k === 'F' && !pre) || k === 'FIN' || k === 'ALT' ? 'u4l5-ans' : ''); hide(E[k]); });
      const g1 = spans(E.G, 'u4l5-g1'), g2 = spans(E.G, 'u4l5-g2'); hide(...g1, ...g2);
      const prod = S.sq ? `(${S.colB})^2` : `(${S.colB})(${S.rowB})`;
      const chk = wline(stage, K(pre ? `\\text{Check: }${gp === '-' ? '{-}' : gp}${prod}=${gp}(${S.foil})=${pre.order || pre.src}\\ \\checkmark` : `\\text{Check: }${prod}=${S.foil}=${S.tri}\\ \\checkmark`), 24, H - 54, 'sm'); hide(chk);
      const steps = [];
      if (pre && pre.order) steps.push({ cap: `Write it in <b>descending order</b> first: ${T(`${pre.src}=${pre.order}`)}. Each term keeps its sign when it moves.`, run: (c) => c.fadeIn(E.P0, 400) });
      if (pre) {
        steps.push(g === -1
          ? { cap: `The leading coefficient is <b>negative</b>. Take out ${T('-1')} so the bracket starts with a positive term: <b>every</b> sign inside flips. Now factor ${T(S.tri)}.`, run: (c) => c.fadeIn(E.P1, 400) }
          : { cap: `<b>Common factor first:</b> every term is a multiple of ${g}, so ${T(`${pre.src}=${g}(${S.tri})`)}. Now ${T('ac')} is just ${S.ac} instead of ${fmt(S.ac * g * g)}.`, run: (c) => c.fadeIn(E.P1, 400) });
      }
      steps.push({
        cap: `<b>Step 1:</b> ${T(`a=${S.a}`)} and ${T(`c=${S.c}`)}, so ${T(`ac=${S.a}(${S.c})=${S.ac}`)}. In the box, ${T(S.TL)} and ${T(S.BR)} are the two <b>corners</b>.`,
        run: (c) => Promise.all([c.fadeIn(E.T, 400), B.fill(c, 0, 150), B.fill(c, 3, 300), c.fadeIn(lac, 400, { delay: 400 })])
      }, {
        cap: `<b>Step 2:</b> find two integers with product ${T(S.ac)} and sum ${T(S.b)}. ${signNote(S)} The pair is ${T(S.m)} and ${T(S.n)}.`,
        run: (c) => Promise.all([c.pop(lpair, 380), c.fadeIn(lpair2, 400, { delay: 200 })])
      }, {
        cap: `<b>Step 3: split</b> the middle term: ${T(`${S.bx}=${S.TR}${S.sgn(2)}`)}. In the box, these are the two empty cells.`,
        run: (c) => Promise.all([B.fill(c, 1), B.fill(c, 2, 150), c.fadeIn(E.S, 400, { delay: 200 })])
      }, {
        cap: `<b>Step 4: group.</b> The first two terms share ${T(S.r1T)}: ${T(`${S.TL}${S.sgn(1)}=${S.r1T}(${S.colB})`)}. That’s <b>row 1</b> of the box: its label is ${T(S.r1T)}, and what’s left gives the <b>column</b> labels.`,
        run: (c) => Promise.all([c.fadeIn(B.rowHi[0], 300), c.pop(B.rowL[0], 380, { delay: 150 }), ...B.colL.map((e, i) => c.pop(e, 380, { delay: 400 + i * 140 })), c.fadeIn(E.G, 10), showSpans(c, g1, 400)])
      }, {
        cap: `The last two terms must leave the <b>same bracket</b>, ${T(`(${S.colB})`)}, so take out ${T(S.r2P)}${S.r2 < 0 ? ', a <b>negative</b>' : ''}: ${T(`${S.BL}${S.sgn(3)}=${grp2(S).replace(/^\+/, '')}(${S.colB})`)}. That’s <b>row 2</b>.`,
        run: (c) => Promise.all([fadeOut(c, B.rowHi[0], 250), c.fadeIn(B.rowHi[1], 300), c.pop(B.rowL[1], 380, { delay: 150 }), showSpans(c, g2, 400)])
      }, {
        cap: `Take out the common bracket ${T(`(${S.colB})`)} (the <b>column</b> labels). The <b>row</b> labels make the other factor: ${T(`${S.tri}=(${S.colB})(${S.rowB})`)}.` + (S.sq ? ` Both brackets are the same: a <b>perfect square</b>, ${T(`(${S.colB})^2`)}.` : ''),
        run: (c) => Promise.all([fadeOut(c, B.rowHi[1], 250), ...B.colHi.map((e) => c.fadeIn(e, 300)), c.fadeIn(E.F, 400, { delay: 250 })])
      });
      if (pre) {
        steps.push({
          cap: g === -1 ? `Put the ${T('-1')} back in front: ${T(`${pre.src}=-(${S.colB})(${S.rowB})`)}.` + (d.alt ? ` Or multiply the ${T('-1')} into the second bracket: ${T(d.alt)}.` : '') : `Put the common factor back in front: ${T(`${pre.src}=${g}(${S.colB})(${S.rowB})`)}. No bracket factors any further, so it’s <b>finished</b>.`,
          run: (c) => Promise.all([...B.colHi.map((e) => fadeOut(c, e, 250)), c.fadeIn(E.FIN, 400), E.ALT ? c.fadeIn(E.ALT, 400, { delay: 350 }) : null])
        });
      }
      steps.push({
        cap: `<b>Step 5: check by expanding.</b> Expanding runs the box forwards: every cell is side × top. ${T(`${gp}${prod}=${pre ? pre.order || pre.src : S.tri}`)} ✓`,
        run: async (c) => { await Promise.all(B.colHi.map((e) => (e.style.opacity === '1' ? fadeOut(c, e, 250) : null))); await Promise.all([c.fadeIn(chk, 400), B.flashAll(c)]); }
      });
      void W;
      return steps;
    }
  };
}
const boxDecomp = makeBD('The box and decomposition, side by side', [{ v: 's1', label: tex('6x^2+19x+10') }, { v: 's1b', label: tex('12x^2+5x-2') }, { sep: 'Example 4 check:' }, { v: 'a4', label: '(a)' }, { v: 'b4', label: '(b)' }, { sep: 'Example 5 check:' }, { v: 'e5', label: tex('18x^2+3x-10') }], 's1');
boxDecomp.minW = 860; // drawn this wide and scaled to fit beside the sidebar
const fullRange = makeBD('The whole routine: tidy up first, then decompose', [{ v: 'gcf', label: tex('12x^2+42x+18') }, { v: 'neg', label: tex('-6x^2+x+2') }, { sep: 'Example 6 check:' }, ...'abcde'.split('').map((k) => ({ v: k + '6', label: '(' + k + ')' }))], 'gcf');
fullRange.minW = 940; // drawn this wide and scaled to fit beside the sidebar

/* ============ 6. The systematic factor-pair hunt ============ */
const PH = {
  e5: { a: 18, b: 3, c: -10, pair: [15, -12] },
  pos: { a: 12, b: -25, c: 12, pair: [-9, -16] },
  neg: { a: 10, b: -1, c: -21, pair: [-15, 14] }
};
const pairHunt = {
  title: 'List the factor pairs, stop at the square root',
  height: 480,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'pos', label: tex('12x^2-25x+12') }, { v: 'neg', label: tex('10x^2-x-21') }, { sep: 'Example 5 check:' }, { v: 'e5', label: tex('18x^2+3x-10') }],
  value: 'pos',
  intro: (k) => `Factor ${T(solve(PH[k]).tri)}. ${T('ac')} is large, so list the factor pairs in order.`,
  make(stage, key, ex) {
    const W = ex.W, S = solve(PH[key]), A = Math.abs(S.ac), neg = S.ac < 0, target = Math.abs(S.b);
    add(stage, h('div', 'u4l5-wl', K(`${S.tri}:\\quad ac=${S.a}(${S.c})=${S.ac}`)), 24, 14);
    const tx = 24, ty = 70;
    add(stage, h('div', 'u4l5-th', `<span>pairs of ${fmt(A)}</span><span>${neg ? 'difference' : 'sum'}</span><span></span>`), tx + 4, ty);
    const rows = [];
    for (let d = 1; d * d <= A; d++) if (A % d === 0) {
      const e = A / d, v = neg ? e - d : e + d, ok = v === target;
      const el = add(stage, h('div', 'u4l5-row', `<span>${K(`${d}\\times${e}`)}</span><span>${K(neg ? `${e}-${d}=${v}` : `${d}+${e}=${v}`)}</span><span class="mk">${ok ? '✓' : ''}</span>`), tx, ty + 26 + rows.length * 34);
      el.style.width = '414px'; hide(el); rows.push({ el, d, e, ok });
    }
    const okRow = rows.find((x) => x.ok), sq = Math.sqrt(A);
    const stop = add(stage, h('div', 'u4l5-stop', `${K(`\\sqrt{${A}}${Number.isInteger(sq) ? '=' : '\\approx'}${Number.isInteger(sq) ? sq : sq.toFixed(1)}`)}: stop. Later pairs only repeat these.`), tx, ty + 30 + rows.length * 34); stop.style.width = '414px'; hide(stop);
    const px = 470, pw = W - px - 16;
    const rule = add(stage, h('div', 'u4l5-rule', neg ? `<div class="rh">${T('ac<0')}: opposite signs</div>Look for a <b>difference</b> of ${T(`|b|=${target}`)}. The bigger number gets the sign of ${T('b')} (${S.b > 0 ? 'positive' : 'negative'}).` : `<div class="rh">${T('ac>0')}: same signs</div>Both numbers have the sign of ${T('b')} (${S.b > 0 ? 'positive' : 'negative'}). Look for a <b>sum</b> of ${T(`|b|=${target}`)}.`), px, 70); rule.style.width = pw + 'px'; hide(rule);
    const big = okRow ? okRow.e : 0, small = okRow ? okRow.d : 0;
    const L1 = wline(stage, `Pair: ${K(String(S.m))} and ${K(String(S.n))}`, px, 196, 'sm'); hide(L1);
    const L2 = wline(stage, K(`${S.tri}=${S.split}`), px, 240, 'sm'); hide(L2);
    const L3 = wline(stage, K(`=${S.r1T}(${S.colB})${grp2(S)}(${S.colB})`), px, 282, 'sm'); hide(L3);
    const L4 = wline(stage, K(`=(${S.colB})(${S.rowB})`), px, 326, 'u4l5-ans'); hide(L4);
    const x0 = 2, valT = S.a * 4 + S.b * 2 + S.c, f1 = S.c1 * 2 + S.c2, f2 = S.r1 * 2 + S.r2;
    const L5 = wline(stage, `Check, ${K('x=2')}: ${K(`${S.a}(4)${mono(S.b * 2, '', 0, '', 0, false)}${mono(S.c, '', 0, '', 0, false)}=${valT}`)}`, px, 384, 'sm'); hide(L5);
    const L6 = wline(stage, `factored: ${K(`(${f1})(${f2})=${f1 * f2}`)} ✓`, px, 422, 'sm'); hide(L6);
    void x0;
    return [{
      cap: `${T(`ac=${S.a}(${S.c})=${S.ac}`)}. ${neg ? `It’s negative, so the two numbers have <b>opposite signs</b>: look for a <b>difference</b> of ${target}.` : `It’s positive, so the two numbers have the <b>same sign</b> as ${T('b')}: look for a <b>sum</b> of ${target}.`}`,
      run: (c) => c.fadeIn(rule, 400)
    }, {
      cap: `List the factor pairs of ${fmt(A)} in order: ${T(`1\\times${A}`)}, then try 2, 3, 4, … Skip any number that doesn’t divide evenly. Work out each ${neg ? 'difference' : 'sum'} as you go.`,
      run: (c) => Promise.all(rows.map((x, i) => c.fadeIn(x.el, 260, { delay: i * 160, from: 'translateX(-10px)' })))
    }, {
      cap: `Stop at the square root: ${T(`\\sqrt{${A}}${Number.isInteger(sq) ? '=' : '\\approx'}${Number.isInteger(sq) ? sq : sq.toFixed(1)}`)}. Past it, every pair is one we already have, written backwards.`,
      run: (c) => c.fadeIn(stop, 400)
    }, {
      cap: `Only <b>${T(`${small}\\times${big}`)}</b> has ${neg ? 'a difference' : 'a sum'} of ${target}. ${neg ? `Give the bigger number the sign of ${T('b')}` : `Both take the sign of ${T('b')}`}: the pair is ${T(S.m)} and ${T(S.n)}.`,
      run: async (c) => { rows.forEach((x) => x.el.classList.add(x.ok ? 'ok' : 'dim')); await Promise.all([pulse(c, okRow.el, 1.05), c.pop(L1, 380, { delay: 200 })]); }
    }, {
      cap: `Split the middle term and group: ${T(`${S.split}=${S.r1T}(${S.colB})${grp2(S)}(${S.colB})=(${S.colB})(${S.rowB})`)}.`,
      run: (c) => Promise.all([c.fadeIn(L2, 400), c.fadeIn(L3, 400, { delay: 300 }), c.fadeIn(L4, 400, { delay: 600 })])
    }, {
      cap: `<b>Check by substitution:</b> put ${T('x=2')} into both forms. The trinomial gives ${valT}, and the factored form gives ${T(`(${f1})(${f2})=${f1 * f2}`)}. Same value ✓`,
      run: (c) => Promise.all([c.fadeIn(L5, 400), c.fadeIn(L6, 400, { delay: 300 })])
    }];
  }
};

/* ============ warm-up: the area box mystery ============ */
const WB = {
  wbA: { top: ['3x', '+1'], side: ['2x', '+3'], cells: ['6x^2', '2x', '9x', '3'], hid: ['c0', 'c1', 'c2', 'c3'] },
  wbB: { top: ['x', '+3'], side: ['4x', '+1'], cells: ['4x^2', '12x', 'x', '3'], hid: ['t0', 't1', 's0', 's1'] },
  wbC: { top: ['3x', '+2'], side: ['2x', '+3'], cells: ['6x^2', '4x', '9x', '6'], hid: ['c1', 'c2', 't0', 't1', 's0', 's1'] }
};
function mountWarm() {
  const Lw = 54, Tp = 40, w1 = 150, w2 = 86, h1 = 112, h2 = 70;
  Object.keys(WB).forEach((id) => {
    const host = document.getElementById(id); if (!host) return;
    const d = WB[id]; host.style.width = (Lw + w1 + w2 + 6) + 'px'; host.style.height = (Tp + h1 + h2 + 6) + 'px';
    const item = (key, src) => (d.hid.includes(key) ? `<button class="u4l5-qm" type="button" data-a="${src}">?</button>` : K(src));
    const cell = (k, x, y, w, hh, cls) => `<div class="u4l5-wc ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${hh}px">${item('c' + k, d.cells[k])}</div>`;
    const lab = (key, src, x, y) => `<div class="u4l5-wl2" style="left:${x}px;top:${y}px;translate:-50% -50%">${item(key, src)}</div>`;
    host.innerHTML = cell(0, Lw, Tp, w1, h1, 'p') + cell(1, Lw + w1, Tp, w2, h1, 's') + cell(2, Lw, Tp + h1, w1, h2, 's') + cell(3, Lw + w1, Tp + h1, w2, h2, 'a') +
      `<div class="u4l5-wline" style="left:${Lw + w1 - 1}px;top:${Tp}px;width:2px;height:${h1 + h2}px"></div><div class="u4l5-wline" style="left:${Lw}px;top:${Tp + h1 - 1}px;width:${w1 + w2}px;height:2px"></div>` +
      `<div class="u4l5-wframe" style="left:${Lw - 1}px;top:${Tp - 1}px;width:${w1 + w2 + 2}px;height:${h1 + h2 + 2}px"></div>` +
      lab('t0', d.top[0], Lw + w1 / 2, Tp / 2) + lab('t1', d.top[1], Lw + w1 + w2 / 2, Tp / 2) + lab('s0', d.side[0], Lw / 2 - 2, Tp + h1 / 2) + lab('s1', d.side[1], Lw / 2 - 2, Tp + h1 + h2 / 2);
    if (id === 'wbA') {
      const c0 = [Lw + w1 / 2, Tp + h1 / 2], c1 = [Lw + w1 + w2 / 2, Tp + h1 / 2], c2 = [Lw + w1 / 2, Tp + h1 + h2 / 2], c3 = [Lw + w1 + w2 / 2, Tp + h1 + h2 / 2];
      const sh = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
      const [a1, a2] = [sh(c0, c3, 0.24), sh(c0, c3, 0.8)], [b1, b2] = [sh(c1, c2, 0.22), sh(c1, c2, 0.76)];
      host.insertAdjacentHTML('beforeend', `<svg class="u4l5-wsvg" width="${Lw + w1 + w2 + 6}" height="${Tp + h1 + h2 + 6}"><line x1="${a1[0]}" y1="${a1[1]}" x2="${a2[0]}" y2="${a2[1]}" stroke="${RED}"/><line x1="${b1[0]}" y1="${b1[1]}" x2="${b2[0]}" y2="${b2[1]}" stroke="${BLU}"/></svg>`);
    }
  });
  const open = (b) => { if (b.classList.contains('open')) return; b.classList.add('open'); b.innerHTML = K(b.dataset.a); b.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], 320); };
  document.querySelectorAll('.u4l5-qm').forEach((b) => b.addEventListener('click', () => open(b)));
  const openAll = (id, keys) => document.querySelectorAll(`#${id} .u4l5-qm`).forEach((b) => { if (!keys || keys.includes(b.dataset.a)) open(b); });
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => {
    const q = b.closest('.u4l5-wq'), show = !q.classList.contains('shown'); q.classList.toggle('shown');
    if (!show) { if (b.dataset.wq === 'D') document.getElementById('wbA').classList.remove('diag'); return; }
    const k = b.dataset.wq;
    if (k === 'A') { openAll('wbA'); const t = document.querySelector('.u4l5-wtot .u4l5-qm'); if (t) open(t); }
    if (k === 'B') openAll('wbB');
    if (k === 'C') openAll('wbC');
    if (k === 'D') { openAll('wbA'); document.getElementById('wbA').classList.add('diag'); }
  }));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
  // the big one: test an option
  const out = document.querySelector('.u4l5-tout');
  const RES = { 19: [['x', '18x'], '(6x+1)(x+3)'], 11: [['2x', '9x'], '(2x+3)(3x+1)'], 9: [['3x', '6x'], '3(2x+1)(x+1)'] };
  document.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('[data-t]').forEach((x) => x.classList.toggle('on', x === b));
    const t = +b.dataset.t, pairs = [[1, 18], [2, 9], [3, 6]];
    const chips = pairs.map(([p, q]) => `<span class="u4l5-tp${p + q === t ? ' ok' : ''}">${K(`${p}\\cdot${q}`)} → sum ${p + q}${p + q === t ? ' ✓' : ''}</span>`).join('');
    const r = RES[t];
    out.innerHTML = `<div class="u4l5-tpairs">${chips}</div>` + (r
      ? `<div class="u4l5-tmsg ok">The blanks are <b>${K(r[0][0])} and ${K(r[0][1])}</b>: they multiply to ${K('18x^2')} and add to ${K(t + 'x')}. So ${K(`6x^2+${t}x+3=${r[1]}`)}.</div>`
      : `<div class="u4l5-tmsg no">No pair of 18 adds to 10, so ${K('6x^2+10x+3')} <b>can’t be factored</b> with whole numbers ✗</div>`);
    out.animate([{ opacity: 0 }, { opacity: 1 }], 300);
  }));
}

/* ============ static figures ============ */
const minusFs = (w, hh) => Math.min(44, Math.round(Math.min(w, hh) * 0.95));
const tileDiv = (kind, sgn, w, hh, style = '') => `<div class="u4l5-t u4l5-${kind} ${sgn > 0 ? 'pos' : 'neg'}" style="width:${w}px;height:${hh}px;${style}"><i style="font-size:${minusFs(w, hh)}px">−</i></div>`;
function mountFigures() {
  // the tile legend
  const lg = document.getElementById('u4l5-legend');
  if (lg) {
    const it = (kind, sgn, w, hh, lab) => `<div>${tileDiv(kind, sgn, w, hh)}<span>${K(lab)}</span></div>`;
    lg.innerHTML = `<div class="u4l5-lh">Positive<br><span>shaded</span></div>${it('k2', 1, 66, 66, 'x^2')}${it('k1', 1, 22, 66, 'x')}${it('k0', 1, 22, 22, '1')}<div class="u4l5-lsep"></div>
      <div class="u4l5-lh">Negative<br><span>white, minus sign</span></div>${it('k2', -1, 66, 66, '-x^2')}${it('k1', -1, 22, 66, '-x')}${it('k0', -1, 22, 22, '-1')}
      <div class="u4l5-lsep"></div><p class="u4l5-lnote">The ${K('x')}-tile is ${K('x')} long and 1 wide, so it fits exactly along the side of an ${K('x^2')}-tile. A unit tile is 1 by 1.</p>`;
  }
  // Example 1: a loose pile of tiles
  document.querySelectorAll('[data-pile]').forEach((el) => {
    const [a, b, c] = el.dataset.pile.split(',').map(Number), X = 70, U = 23;
    const g = (n, cols, kind, w, hh) => `<div class="u4l5-pg" style="grid-template-columns:repeat(${cols}, ${w}px)">${Array.from({ length: n }, () => tileDiv(kind, 1, w, hh)).join('')}</div>`;
    el.innerHTML = g(a, a, 'k2', X, X) + g(b, Math.ceil(b / 2), 'k1', X, U) + g(c, Math.ceil(c / 2), 'k0', U, U);
  });
  // tile rectangles (answers)
  document.querySelectorAll('[data-rect]').forEach((el) => {
    const [p, r, q, s] = el.dataset.rect.split(',').map(Number), X = 62, U = 21, ox = 64, oy = 30;
    let html = '';
    for (let j = 0; j < r; j++) for (let i = 0; i < p; i++) html += tileDiv('k2', 1, X, X, `left:${ox + i * X}px;top:${oy + j * X}px`);
    for (let j = 0; j < r; j++) for (let k = 0; k < q; k++) html += tileDiv('k1', 1, U, X, `left:${ox + p * X + k * U}px;top:${oy + j * X}px`);
    for (let k = 0; k < s; k++) for (let i = 0; i < p; i++) html += tileDiv('k1', 1, X, U, `left:${ox + i * X}px;top:${oy + r * X + k * U}px`);
    for (let l = 0; l < s; l++) for (let k = 0; k < q; k++) html += tileDiv('k0', 1, U, U, `left:${ox + p * X + k * U}px;top:${oy + r * X + l * U}px`);
    const Wd = p * X + q * U, Hd = r * X + s * U;
    html += `<div class="u4l5-fl c" style="left:${ox + Wd / 2}px;top:${oy - 14}px">${K(lin(p, q))}</div><div class="u4l5-fl r" style="left:${ox - 10}px;top:${oy + Hd / 2}px">${K(lin(r, s))}</div>`;
    el.style.width = (ox + Wd + 10) + 'px'; el.style.height = (oy + Hd + 8) + 'px'; el.innerHTML = html;
  });
  // Example 2: the frame (four x²-tiles in a row, the rest to find)
  document.querySelectorAll('[data-frame2]').forEach((el) => {
    const X = 84, ox = 30, oy = 20, rw = 46, bh = 92;
    let html = '';
    for (let i = 0; i < 4; i++) html += tileDiv('k2', 1, X, X, `left:${ox + i * X}px;top:${oy}px`);
    html += `<svg style="left:0;top:0" width="${ox + 4 * X + rw + 20}" height="${oy + X + bh + 20}"><path d="M${ox + 4 * X} ${oy}H${ox + 4 * X + rw}V${oy + X + bh}H${ox}V${oy + X}" fill="none" stroke="#8b909b" stroke-width="2.5" stroke-dasharray="7 6"/></svg>`;
    html += `<div class="u4l5-q" style="left:${ox + 4 * X + rw / 2}px;top:${oy + X / 2}px">?</div><div class="u4l5-q" style="left:${ox + 2 * X}px;top:${oy + X + bh / 2}px">?</div><div class="u4l5-q" style="left:${ox + 4 * X + rw / 2}px;top:${oy + X + bh / 2}px">?</div>`;
    el.style.width = (ox + 4 * X + rw + 20) + 'px'; el.style.height = (oy + X + bh + 20) + 'px'; el.innerHTML = html;
  });
  // area boxes: blank ones in the work space, filled ones in the answers
  const sbox = (cells, cols, rows, cls) => {
    const v = (s) => (s ? K(s) : '');
    const lab = (s) => (s ? K(s) : '<span class="blank"></span>');
    return `<div class="u4l5-sbox ${cls}"><span></span><span class="sb-t">${lab(cols[0])}</span><span class="sb-t">${lab(cols[1])}</span>
      <span class="sb-s">${lab(rows[0])}</span><span class="sb-c">${v(cells[0])}</span><span class="sb-c${cells[1] && cls === 'ansbox' ? ' fill' : ''}">${v(cells[1])}</span>
      <span class="sb-s">${lab(rows[1])}</span><span class="sb-c r2${cells[2] && cls === 'ansbox' ? ' fill' : ''}">${v(cells[2])}</span><span class="sb-c r2">${v(cells[3])}</span></div>`;
  };
  document.querySelectorAll('[data-box]').forEach((el) => { el.innerHTML = sbox(el.dataset.box.split(','), ['', ''], ['', ''], 'workbox'); });
  document.querySelectorAll('[data-ansbox]').forEach((el) => { const [c, t, s] = el.dataset.ansbox.split('|').map((x) => x.split(',')); el.innerHTML = sbox(c, t, s, 'ansbox'); });
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { tileRect, areaBox, whyAC, boxDecomp, pairHunt, fullRange };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountFigures(); mountWarm(); mountExplainers();

/* ============ Stand Up Break! — factor ax² + bx + c by decomposition at the whiteboards ============ */
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
  const LET = ['x', 'x', 'x', 'n', 'y', 'm', 't'];
  /* (pv + q)(Rv + S), nothing common in either bracket, a = pR > 1, b ≠ 0 */
  function pick(r, o) {
    for (;;) {
      const p = r.int(o.p[0], o.p[1]), R = r.int(o.R[0], o.R[1]), q = r.int(1, o.n) * (o.neg ? r.sign() : 1), S = r.int(1, o.n) * (o.neg ? r.sign() : 1);
      const a = p * R, b = p * S + q * R, c = q * S;
      if (a < 2 || b === 0 || gcd(p, q) !== 1 || gcd(R, S) !== 1 || Math.abs(a * c) > o.ac) continue;
      if (o.neg && q > 0 && S > 0) continue;
      if (o.one && p !== 1 && R !== 1) continue;
      return { p, q, R, S, a, b, c };
    }
  }
  /* the worked answer: ac, the pair, the four terms grouped, the factors */
  function decomp(t, v) {
    const { p, q, R, S, a, b, c } = t, m = p * S, n = q * R, x = V(v), x2 = V(v, 2);
    const tri = P([[a, x2], [b, x], [c, {}]]), sec = B([[R, x], [S, {}]]);
    return [
      'ac=' + a + '(' + c + ')=' + a * c + ';\\ \\text{pair } ' + m + ',\\ ' + n,
      tri + '=' + P([[a, x2], [m, x], [n, x], [c, {}]]),
      '=' + TM(p, x, true) + sec + (q < 0 ? '-' : '+') + Math.abs(q) + sec + '=' + sec + B([[p, x], [q, {}]])
    ];
  }
  const tri = (t, v, k = 1) => P([[k * t.a, V(v, 2)], [k * t.b, V(v)], [k * t.c, {}]]);
  standup('u4l5', {
    intro: 'Factor by decomposition: find two integers with product ac and sum b, split the middle term, then group. Check by expanding.',
    levels: {
      BEG: (r) => { // 3x² + 8x + 4 = (3x + 2)(x + 2): all positive, one bracket starts with x
        const v = r.pick(LET), t = pick(r, { p: [1, 5], R: [1, 5], n: 6, ac: 60, one: true });
        return { q: tri(t, v), a: decomp(t, v) };
      },
      PRG: (r) => { // 3x² + 10x − 8 = (3x − 2)(x + 4): a negative b or c
        const v = r.pick(LET), t = pick(r, { p: [1, 4], R: [2, 5], n: 6, ac: 72, neg: true });
        return { q: tri(t, v), a: decomp(t, v) };
      },
      MAS: (r) => {
        const v = r.pick(LET);
        if (r.chance(0.35)) { // a common factor first: 6x² + 14x + 4 = 2(3x² + 7x + 2) = 2(3x + 1)(x + 2)
          const k = r.int(2, 5), t = pick(r, { p: [1, 3], R: [2, 4], n: 5, ac: 40, neg: r.chance(0.6) }), Q = tri(t, v, k), [l1, l2, l3] = decomp(t, v);
          return { q: Q, a: ['\\text{GCF } ' + k + ':\\quad ' + Q + '=' + k + '(' + tri(t, v) + ')', l1, l2, l3, Q + '=' + k + B([[t.R, V(v)], [t.S, {}]]) + B([[t.p, V(v)], [t.q, {}]])] };
        }
        // both leading coefficients bigger than 1, mixed signs: 6x² + 19x − 7 = (2x + 7)(3x − 1)
        const t = pick(r, { p: [2, 5], R: [2, 5], n: 7, ac: 90, neg: true });
        return { q: tri(t, v), a: decomp(t, v) };
      }
    }
  });
}
