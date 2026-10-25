/* Math 10C · Unit 3 · Lesson 6 — Polynomial Operations: Comprehensive Review. The explainers, figures and widgets.
 * A review lesson: each explainer recaps one big picture from the unit (zero pairs, rows × columns, FOIL on the area
 * model, the (a + b)² square, whole − hole, the folded box, find-the-error) and carries "Example N check" chips that
 * replay the booklet's own numbers after the class has worked them by hand. All algebra is computed by the small
 * polynomial helpers below, so every caption matches the maths. */
import { h, Explainer } from '../explain.js';
import { tex } from '../tex.js';
import { standup } from '../standup.js';

const T = (s) => tex(s);
const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => (e.style.opacity = 0));
const box = (el, w, hh) => { el.style.width = w + 'px'; el.style.height = hh + 'px'; return el; };
const moveTo = (c, el, x, y, ms = 600, o = {}) => c.anim(el, [{ left: el.style.left, top: el.style.top }, { left: x + 'px', top: y + 'px' }], ms, o);
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const flash = (c, el) => c.anim(el, [{ opacity: 0.15 }, { opacity: 1 }], 320);
const show = (c, el, ms = 380, o = {}) => c.anim(el, [{ opacity: 0 }, { opacity: 1 }], ms, o);
const draw = (c, path, ms = 600, o = {}) => { const len = path.getTotalLength ? path.getTotalLength() || 400 : 400; path.style.strokeDasharray = len; return c.anim(path, [{ strokeDashoffset: len, opacity: 1 }, { strokeDashoffset: 0, opacity: 1 }], ms, o); };
const pulse = (c, el, s = 1.15) => c.anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], 420);
const stampIn = (c, el) => c.anim(el, [{ opacity: 0, transform: 'scale(1.8) rotate(-12deg)' }, { opacity: 1, transform: 'scale(1) rotate(-5deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' });
function spread(els, cx, gap) { const ws = els.map((e) => e.offsetWidth || 40); const tot = ws.reduce((a, b) => a + b, 0) + gap * (els.length - 1); let x = cx - tot / 2; return ws.map((w) => { const m = x + w / 2; x += w + gap; return m; }); }
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

/* ================= polynomial helpers ================= */
// a term is { c: coefficient, e: { x: 2, y: 1 } }; a polynomial is an array of terms (kept in written order until collected)
function parse(s) {
  s = String(s).replace(/\s+/g, '').replace(/−/g, '-');
  const out = []; let i = 0;
  while (i < s.length) {
    let sign = 1;
    if (s[i] === '+') i++; else if (s[i] === '-') { sign = -1; i++; }
    let num = ''; while (i < s.length && /[0-9.]/.test(s[i])) num += s[i++];
    const e = {};
    while (i < s.length && /[a-z]/.test(s[i])) {
      const v = s[i++]; let p = 1;
      if (s[i] === '^') {
        i++; let q = '';
        if (s[i] === '{') { i++; while (i < s.length && s[i] !== '}') q += s[i++]; i++; } else { if (s[i] === '-') q += s[i++]; while (i < s.length && /[0-9]/.test(s[i])) q += s[i++]; }
        p = Number(q);
      }
      e[v] = (e[v] || 0) + p;
    }
    out.push({ c: sign * (num === '' ? 1 : Number(num)), e });
  }
  return out;
}
const P = parse;
const ekey = (e) => Object.keys(e).filter((k) => e[k]).sort().map((k) => k + e[k]).join('');
const deg = (t) => Object.values(t.e).reduce((a, b) => a + b, 0);
function collect(p) { const m = new Map(); p.forEach((t) => { const k = ekey(t.e), o = m.get(k); if (o) o.c += t.c; else m.set(k, { c: t.c, e: { ...t.e } }); }); return [...m.values()].filter((t) => t.c !== 0); }
const sortP = (p, asc) => [...p].sort((a, b) => (asc ? deg(a) - deg(b) : deg(b) - deg(a)));
const mulT = (a, b) => { const e = { ...a.e }; for (const k in b.e) e[k] = (e[k] || 0) + b.e[k]; return { c: a.c * b.c, e }; };
const mul = (p, q) => collect(p.flatMap((a) => q.map((b) => mulT(a, b))));
const addP = (...ps) => collect(ps.flat());
const neg = (p) => p.map((t) => ({ c: -t.c, e: t.e }));
const sub = (p, q) => addP(p, neg(q));
const vstr = (e) => Object.keys(e).filter((k) => e[k]).sort().map((k) => k + (e[k] === 1 ? '' : `^{${e[k]}}`)).join('');
function termTex(t, first) { const v = vstr(t.e), a = Math.abs(t.c), co = v && a === 1 ? '' : String(a); return (t.c < 0 ? '-' : first ? '' : '+') + co + v; }
const rawTex = (p) => p.map((t, i) => termTex(t, i === 0)).join('');           // written order, not collected
const ptex = (p, asc) => { const q = sortP(collect(p), asc); return q.length ? rawTex(q) : '0'; };
const fac = (t) => (t.c < 0 ? `(${termTex(t, true)})` : termTex(t, true));       // a factor, bracketed if negative
const kc = (t) => 'k' + Math.min(3, Math.max(0, deg(t)));
const plus = (t, first) => (first ? '' : '{}') + termTex(t, first);             // '{}' gives a binary + or − its spacing

/* ================= algebra tiles ================= */
// shaded = positive, unshaded = negative; x²-tile X by X, x-tile 1 by X, unit 1 by 1
function tileList(p) { const out = []; sortP(collect(p)).forEach((t) => { for (let i = 0; i < Math.abs(t.c); i++) out.push({ k: deg(t), neg: t.c < 0 }); }); return out; }
function mkTile(host, k, ng, x, y, w, hh) { const e = add(host, h('div', `u6-tile t${k}${ng ? ' neg' : ''}`), x, y); box(e, w, hh); return e; }
const tileName = (k) => (k === 2 ? T('x^2') + '-tile' : k === 1 ? T('x') + '-tile' : 'unit tile');
function descTiles(list) {
  const g = []; list.forEach((t) => { const l = g[g.length - 1]; if (l && l.k === t.k && l.neg === t.neg) l.n++; else g.push({ k: t.k, neg: t.neg, n: 1 }); });
  return g.map((x) => `${NUM[x.n]} ${x.neg ? 'unshaded' : 'shaded'} ${tileName(x.k)}${x.n > 1 ? 's' : ''}`).join(' and ');
}

/* ============ 1. Classify and find the degree ============ */
const CLS = {
  t1: { s: '3a^2b^5-a^4+2', end: '' },
  e1a: { s: 'x-5', end: `Two terms make a binomial, so ${T('x-5')} is <b>not</b> a monomial: <b>Example 1(a): B</b>.` },
  e1b: { s: 'm^4n^2+5p^3', end: `<b>Example 1(b): 6.</b> Score each term on its own — don’t add 4 + 2 + 3.` },
  c2: { s: '4x^6-3x^8', end: `II has degree <b>8</b>, not 6. The highest term can be written last!` },
  c3: { s: '2x^3-5x^{-2}+6x^4' },
  c4: { s: '4x^2y^4', end: `IV ✓ — and I (${T('7x^2')}) is only degree 2. <b>Example 1(c): IV only, A.</b>` },
  e2: { s: '4x^3-15+6x^4', ex2: true }
};
const classify = {
  title: 'Name it, then find its degree',
  height: 340,
  value: 't1',
  choices: [{ v: 't1', label: T('3a^2b^5-a^4+2') }, { sep: 'Example 1 check:' }, { v: 'e1a', label: T('x-5') }, { v: 'e1b', label: T('m^4n^2+5p^3') }, { v: 'c2', label: 'II' }, { v: 'c3', label: 'III' }, { v: 'c4', label: 'IV' }, { sep: 'Example 2 check:' }, { v: 'e2', label: T('4x^3-15+6x^4') }],
  intro: (v) => `${T(CLS[v].s)}: how many <b>terms</b>, is it even a polynomial, and what is its <b>degree</b>?`,
  make(stage, v, ex) {
    const W = ex.W, d = CLS[v], terms = P(d.s), n = terms.length, Y = 146, YD = 220;
    const negI = terms.findIndex((t) => Object.values(t.e).some((p) => p < 0));
    const top = add(stage, h('div', 'u6-big c', T(d.s)), W / 2, 50);
    const chips = terms.map((t, i) => add(stage, h('div', 'u6-tchip c', T(termTex(t, i === 0))), W / 2, Y));
    const xs = spread(chips, W / 2, 44); chips.forEach((e, i) => { at(e, xs[i], Y); e.style.opacity = 0; });
    const labs = terms.map((t, i) => {
      const ps = Object.keys(t.e).filter((k) => t.e[k]).map((k) => t.e[k]);
      const body = i === negI ? `<small>exponent</small>${T(String(ps.find((p) => p < 0)))} ✗`
        : !ps.length ? `<small>constant</small>${T('0')}` : ps.length === 1 ? `<small>degree</small>${T(String(ps[0]))}` : `<small>degree</small>${T(ps.join('+') + '=' + deg(t))}`;
      const e = add(stage, h('div', 'u6-deg c' + (i === negI ? ' bad' : ''), body), xs[i], YD); e.style.opacity = 0; return e;
    });
    const badge = add(stage, h('div', 'u6-badge'), 18, 14); badge.style.opacity = 0;
    const verdict = add(stage, h('div', 'u6-line c u6-fin'), W / 2, 308); verdict.style.opacity = 0;
    const stamp = add(stage, h('div', 'u6-stamp no', 'NOT A POLYNOMIAL'), W / 2, 282); stamp.style.translate = '-50% -50%'; stamp.style.opacity = 0;
    const name = n === 1 ? 'monomial' : n === 2 ? 'binomial' : n === 3 ? 'trinomial' : 'polynomial';
    const steps = [{
      cap: negI < 0 ? `Terms are separated by <b>+</b> and <b>−</b> signs; each sign travels with the term after it. ${n === 1 ? 'One term' : NUM[n][0].toUpperCase() + NUM[n].slice(1) + ' terms'}: a <b>${name}</b>.`
        : `Split it into terms: ${NUM[n]} of them. But before naming it, check every <b>exponent</b>…`,
      run: async (c) => { badge.innerHTML = negI < 0 ? `${n} term${n > 1 ? 's' : ''} · ${name}` : `${n} terms · ?`; await Promise.all([...chips.map((e, i) => c.pop(e, 380, { delay: i * 140 })), show(c, badge, 300, { delay: n * 140 })]); }
    }];
    if (negI >= 0) {
      steps.push({
        cap: `${T(termTex(terms[negI], negI === 0))} has a <b>negative exponent</b> (${T('x^{-2}=\\tfrac{1}{x^2}')}). That isn’t allowed in a polynomial term, so this is <b>not a polynomial</b> at all. III is out of Example 1(c).`,
        run: async (c) => { chips[negI].classList.add('bad'); badge.innerHTML = `${n} terms · not a polynomial`; await Promise.all([c.fadeIn(labs[negI], 300), c.shake(chips[negI])]); await stampIn(c, stamp); }
      });
      return steps;
    }
    const D = Math.max(...terms.map(deg)), mi = terms.findIndex((t) => deg(t) === D);
    const hasConst = terms.some((t) => deg(t) === 0), multi = terms.some((t) => Object.keys(t.e).filter((k) => t.e[k]).length > 1);
    steps.push({
      cap: `Degree of each term = the <b>sum of the exponents</b> on its variables${multi ? ' — add <b>all</b> of them' : ''}${hasConst ? '. A constant has degree 0' : ''}.`,
      run: (c) => Promise.all(labs.map((e, i) => c.fadeIn(e, 350, { delay: i * 160 })))
    });
    steps.push({
      cap: `The degree of the ${n > 1 ? 'polynomial' : 'monomial'} is the <b>highest</b> term degree: <b>${D}</b>.${d.end ? ' ' + d.end : ''}`,
      run: async (c) => { chips[mi].classList.add('top'); verdict.innerHTML = T(`\\text{degree}=${D}`); await Promise.all([pulse(c, chips[mi]), c.fadeIn(verdict, 400)]); }
    });
    if (d.ex2) {
      const order = terms.map((t, i) => i).sort((a, b) => deg(terms[b]) - deg(terms[a]));
      const lead = terms[mi], ci = terms.findIndex((t) => deg(t) === 0), cst = terms[ci];
      const tagP = add(stage, h('div', 'u6-tag c', T(`P=${lead.c}`)), 0, 266), tagR = add(stage, h('div', 'u6-tag c', T(`R=${cst.c}`)), 0, 266); hide(tagP, tagR);
      steps.push({
        cap: `Rewrite it in <b>descending order</b>, highest degree first: ${T(ptex(terms))}.`,
        run: async (c) => {
          order.forEach((ti, k) => { chips[ti].innerHTML = T(termTex(terms[ti], k === 0)); });
          const nx = spread(order.map((ti) => chips[ti]), W / 2, 44);
          await Promise.all([...order.map((ti, k) => moveTo(c, chips[ti], nx[k], Y, 700)), ...order.map((ti, k) => moveTo(c, labs[ti], nx[k], YD, 700))]);
          top.innerHTML = T(ptex(terms)); await flash(c, top);
        }
      });
      steps.push({
        cap: `Leading coefficient <b>P = ${lead.c}</b> (the coefficient of the highest-degree term), degree <b>Q = ${D}</b>, constant term <b>R = ${cst.c}</b> — keep its sign!`,
        run: async (c) => { at(tagP, parseFloat(chips[mi].style.left), 266); at(tagR, parseFloat(chips[ci].style.left), 266); verdict.innerHTML = T(`Q=${D}`); await Promise.all([c.pop(tagP), c.pop(tagR, 380, { delay: 200 }), flash(c, verdict)]); }
      });
      steps.push({
        cap: `${T(`P-Q-R=${lead.c}-${D}-(${cst.c})=${lead.c}-${D}+${-cst.c}=${lead.c - D - cst.c}`)}. <b>Example 2: 17.</b>`,
        run: async (c) => { verdict.innerHTML = T(`P-Q-R=${lead.c - D - cst.c}`); await flash(c, verdict); }
      });
    }
    return steps;
  }
};

/* ============ 2. Zero pairs: adding and subtracting with tiles ============ */
const ZP = {
  a1: { A: '2x^2+3x-4', B: 'x^2-5x+1', op: 1 },
  s1: { A: '3x^2+2x-1', B: 'x^2-x+2', op: -1 },
  s2: { A: 'x^2-4x+3', B: '2x^2-x-2', op: -1 }
};
const ZX = 62, ZU = 20;
const zdim = (k) => (k === 2 ? [ZX, ZX] : k === 1 ? [ZU, ZX] : [ZU, ZU]);
const zeroPairs = {
  title: 'Zero pairs: adding and subtracting with tiles',
  height: 400,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar (the sum box sits at the right edge)
  choices: [{ v: 'a1', label: T('(2x^2+3x-4)+(x^2-5x+1)') }, { v: 's1', label: T('(3x^2+2x-1)-(x^2-x+2)') }, { v: 's2', label: T('(x^2-4x+3)-(2x^2-x-2)') }],
  intro: (v) => { const d = ZP[v]; return `${T(`(${d.A})${d.op > 0 ? '+' : '-'}(${d.B})`)} with tiles. <b>Shaded</b> tiles are positive, <b>unshaded</b> tiles are negative.`; },
  make(stage, v, ex) {
    const W = ex.W, d = ZP[v], A = P(d.A), B = P(d.B), half = W / 2, gw = half - 70, gx = [24, half + 46];
    const res = d.op > 0 ? addP(A, B) : sub(A, B);
    const grps = gx.map((x) => { const e = add(stage, h('div', 'u6-grp'), x, 64); box(e, gw, 100); e.style.opacity = 0; return e; });
    const labs = [d.A, d.B].map((s, i) => { const e = add(stage, h('div', 'u6-mid c', T(`(${s})`)), gx[i] + gw / 2, 36); e.style.opacity = 0; return e; });
    const op = add(stage, h('div', 'u6-op c', d.op > 0 ? '+' : '−'), half + 11, 114); op.style.opacity = 0;
    const lay = (list, x0) => { const ws = list.map((t) => zdim(t.k)[0]); const tot = ws.reduce((a, b) => a + b, 0) + 7 * (list.length - 1); let x = x0 + gw / 2 - tot / 2; return list.map((t) => { const [w, hh] = zdim(t.k); const r = [x, 152 - hh]; x += w + 7; return r; }); };
    const tiles = [A, B].map((p, g) => { const L = tileList(p), pos = lay(L, gx[g]); return L.map((t, i) => { t.g = g; t.el = mkTile(stage, t.k, t.neg, pos[i][0], pos[i][1], ...zdim(t.k)); t.el.style.opacity = 0; return t; }); });
    const rowTop = { 2: 192, 1: 272, 0: 356 }, rowC = { 2: 223, 1: 303, 0: 366 };
    const rowLab = [2, 1, 0].map((k) => { const e = add(stage, h('div', 'u6-rowlab c', T(k === 2 ? 'x^2' : k === 1 ? 'x' : '1')), 44, rowC[k]); e.style.opacity = 0; return { k, e }; });
    const rowRes = {}; [2, 1, 0].forEach((k) => { rowRes[k] = add(stage, h('div', 'u6-rowres'), 470, rowC[k]); rowRes[k].style.opacity = 0; });
    const fin = add(stage, h('div', 'u6-box ok'), W - 26, 290); fin.style.translate = '-100% -50%'; fin.style.opacity = 0;
    const slot = (k, i) => 84 + i * (zdim(k)[0] + 8);
    const rows = () => { const r = { 2: [], 1: [], 0: [] }; [...tiles[0], ...tiles[1]].forEach((t) => r[t.k].push(t)); [2, 1, 0].forEach((k) => r[k].sort((a, b) => a.neg - b.neg)); return r; };
    const steps = [{
      cap: `First bracket: ${T(d.A)}. Shaded tiles are <b>positive</b>, unshaded tiles are <b>negative</b>.`,
      run: (c) => Promise.all([show(c, grps[0]), c.fadeIn(labs[0]), ...tiles[0].map((t, i) => c.pop(t.el, 320, { delay: 150 + i * 60 }))])
    }, {
      cap: d.op > 0 ? `<b>Add</b> the second bracket: ${T(d.B)}.` : `<b>Subtract</b> the second bracket: ${T(d.B)}.`,
      run: (c) => Promise.all([show(c, grps[1]), c.fadeIn(labs[1]), c.pop(op), ...tiles[1].map((t, i) => c.pop(t.el, 320, { delay: 150 + i * 60 }))])
    }];
    if (d.op < 0) steps.push({
      cap: `Subtracting means <b>adding the opposite</b>: flip <b>every</b> tile in the second bracket, shaded ↔ unshaded. ${T(`-(${d.B})=${rawTex(neg(B))}`)}.`,
      run: async (c) => {
        op.textContent = '+'; labs[1].innerHTML = T(`(${rawTex(neg(B))})`);
        await Promise.all([pulse(c, op), flash(c, labs[1]), ...tiles[1].map(async (t, i) => {
          await c.anim(t.el, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], 170, { delay: i * 70 });
          t.neg = !t.neg; t.el.classList.toggle('neg', t.neg);
          await c.anim(t.el, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 170);
        })]);
      }
    });
    steps.push({
      cap: `Gather <b>like tiles</b> into rows: ${T('x^2')}-tiles together, ${T('x')}-tiles together, unit tiles together.`,
      run: async (c) => {
        const r = rows(), jobs = [];
        [2, 1, 0].forEach((k) => r[k].forEach((t, i) => jobs.push(moveTo(c, t.el, slot(k, i), rowTop[k], 750, { delay: i * 40 }))));
        jobs.push(...grps.map((g) => c.anim(g, [{ opacity: 1 }, { opacity: 0 }], 400)), c.anim(op, [{ opacity: 1 }, { opacity: 0 }], 400), ...rowLab.map((o) => show(c, o.e, 400, { delay: 300 })));
        await Promise.all(jobs);
      }
    });
    const zp = (() => { let n = 0; const r = { 2: [0, 0], 1: [0, 0], 0: [0, 0] }; [...tileList(A), ...tileList(d.op > 0 ? B : neg(B))].forEach((t) => r[t.k][t.neg ? 1 : 0]++); [2, 1, 0].forEach((k) => (n += Math.min(...r[k]))); return n; })();
    if (zp) steps.push({
      cap: `One shaded and one unshaded tile of the <b>same kind</b> make a <b>zero pair</b>: together they are worth 0. ${zp > 2 ? `Remove all ${NUM[zp] || zp} zero pairs` : zp === 2 ? 'Remove both zero pairs' : 'Remove the zero pair'}.`,
      run: async (c) => {
        const r = rows(), jobs = [];
        [2, 1, 0].forEach((k) => {
          const ps = r[k].filter((t) => !t.neg), ns = r[k].filter((t) => t.neg), m = Math.min(ps.length, ns.length);
          for (let j = 0; j < m; j++) {
            const a = ps[ps.length - 1 - j], b = ns[j], mx = (parseFloat(a.el.style.left) + parseFloat(b.el.style.left)) / 2;
            [a, b].forEach((t) => { t.dead = true; jobs.push(c.anim(t.el, [{ left: t.el.style.left, opacity: 1, transform: 'scale(1)' }, { left: mx + 'px', opacity: 1, transform: 'scale(1)', offset: 0.55 }, { left: mx + 'px', opacity: 0, transform: 'scale(.5)' }], 900, { delay: j * 160 })); });
          }
        });
        await Promise.all(jobs);
        const r2 = rows(), jobs2 = [];
        [2, 1, 0].forEach((k) => r2[k].filter((t) => !t.dead).forEach((t, i) => jobs2.push(moveTo(c, t.el, slot(k, i), rowTop[k], 450))));
        await Promise.all(jobs2);
      }
    });
    steps.push({
      cap: `Read what’s left, row by row: ${T(`(${d.A})${d.op > 0 ? '+' : '-'}(${d.B})=${ptex(res)}`)}.`,
      run: async (c) => {
        const r = rows(), jobs = [];
        [2, 1, 0].forEach((k) => { const live = r[k].filter((t) => !t.dead), cnt = live.filter((t) => !t.neg).length - live.filter((t) => t.neg).length; rowRes[k].innerHTML = cnt ? T(termTex({ c: cnt, e: k ? { x: k } : {} }, true)) : `${T('0')} <span class="u6-sm">all cancelled</span>`; jobs.push(c.fadeIn(rowRes[k], 350, { delay: (2 - k) * 150 })); });
        fin.innerHTML = `<small>${d.op > 0 ? 'sum' : 'difference'}</small>${T(ptex(res))}`; jobs.push(c.pop(fin, 420, { delay: 500 }));
        await Promise.all(jobs);
      }
    });
    return steps;
  }
};

/* ============ 2. Multiplying with tiles: rows times columns ============ */
const TMU = {
  a: { top: '2x', side: 'x+1' },
  b: { top: 'x+2', side: 'x+1' },
  c: { top: 'x+2', side: 'x-1' },
  e3: { top: '3x', side: 'x-2', tag: true }
};
const MX = 106, MU = 31, MG = 3;
const prodTex = (a, b) => (P(a).length === 1 ? `${a}(${b})` : `(${a})(${b})`);
const tileMul = {
  title: 'Rows times columns: multiplying with tiles',
  height: 400,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'a', label: T('2x(x+1)') }, { v: 'b', label: T('(x+2)(x+1)') }, { v: 'c', label: T('(x+2)(x-1)') }, { sep: 'Example 3 check:' }, { v: 'e3', label: 'the tile array' }],
  intro: (v) => (TMU[v].tag ? `Example 3’s tile array: read the factors on the frame, then check the product inside.` : `Build ${T(prodTex(TMU[v].top, TMU[v].side))} with tiles: the first factor across the top, the second down the side.`),
  make(stage, v, ex) {
    const W = ex.W, d = TMU[v], top = P(d.top), side = P(d.side), tl = tileList(top), sl = tileList(side);
    const len = (k) => (k === 1 ? MX : MU), ox = 150, oy = 104;
    const colX = [], rowY = []; let x = ox; tl.forEach((t) => { colX.push(x); x += len(t.k) + MG; }); const RW = x - ox - MG;
    let y = oy; sl.forEach((t) => { rowY.push(y); y += len(t.k) + MG; }); const RH = y - oy - MG;
    const hl = add(stage, h('div', 'u6-frame-l'), ox - MU - 26, oy - 6); box(hl, RW + MU + 44, 4);
    const vl = add(stage, h('div', 'u6-frame-l'), ox - 6, oy - MU - 26); box(vl, 4, RH + MU + 44);
    const topEls = tl.map((t, j) => { const e = mkTile(stage, t.k, t.neg, colX[j], oy - 10 - MU, len(t.k), MU); e.style.opacity = 0; return e; });
    const sideEls = sl.map((t, i) => { const e = mkTile(stage, t.k, t.neg, ox - 10 - MU, rowY[i], MU, len(t.k)); e.style.opacity = 0; return e; });
    const cells = sl.map((s, i) => tl.map((t, j) => { const k = s.k + t.k, ng = s.neg !== t.neg; const e = mkTile(stage, k, ng, colX[j], rowY[i], len(t.k), len(s.k)); e.style.opacity = 0; return { k, neg: ng, el: e }; }));
    const rx = 568;
    const lt = add(stage, h('div', 'u6-mid l', `<span class="u6-sm">top:</span> ${T(d.top)}`), rx, 44), ls = add(stage, h('div', 'u6-mid l', `<span class="u6-sm">side:</span> ${T(d.side)}`), rx, 88); hide(lt, ls);
    const fin = add(stage, h('div', 'u6-box ok'), rx, 330); fin.style.translate = '0 -50%'; fin.style.opacity = 0;
    const steps = [
      { cap: `Across the top: ${T(d.top)} — ${descTiles(tl)}.`, run: (c) => Promise.all([c.fadeIn(lt), ...topEls.map((e, j) => c.pop(e, 340, { delay: j * 90 }))]) },
      { cap: `Down the side: ${T(d.side)} — ${descTiles(sl)}.`, run: (c) => Promise.all([c.fadeIn(ls), ...sideEls.map((e, i) => c.pop(e, 340, { delay: i * 90 }))]) }
    ];
    // one step per run of identical side tiles
    const groups = []; sl.forEach((s, i) => { const g = groups[groups.length - 1]; if (g && g.k === s.k && g.neg === s.neg) g.rows.push(i); else groups.push({ k: s.k, neg: s.neg, rows: [i] }); });
    let ly = 146;
    groups.forEach((g) => {
      const sT = { c: g.neg ? -1 : 1, e: g.k ? { x: 1 } : {} }, sTex = termTex(sT, true), rowP = mul([sT], top), m = g.rows.length, tot = rowP.map((t) => ({ c: t.c * m, e: t.e }));
      const anyNeg = g.rows.some((i) => cells[i].some((q) => q.neg)), allNeg = g.rows.every((i) => cells[i].every((q) => q.neg));
      const rule = allNeg ? ' Different shading → <b>unshaded</b> (negative).' : anyNeg ? ' Same shading → shaded (+); different → <b>unshaded</b> (−).' : ' Same shading → <b>shaded</b> (positive).';
      const lineY = ly; ly += 46;
      const line = add(stage, h('div', 'u6-mid l', `<span class="u6-sm">${m > 1 ? NUM[m] + ' rows' : 'row'} ${T(sTex)}:</span> ${T(ptex(tot))}`), rx, lineY); line.style.opacity = 0;
      steps.push({
        cap: m === 1 ? `Row ${T(sTex)}: ${T(sTex)} times each tile on top gives ${T(sTex + '\\cdot(' + d.top + ')=' + ptex(rowP))}.${rule}`
          : `The ${NUM[m]} ${g.neg ? 'unshaded' : 'shaded'} unit tiles: each row is ${T(sTex + '\\cdot(' + d.top + ')=' + ptex(rowP))}, so ${NUM[m]} rows make ${T(ptex(tot))}.${rule}`,
        run: (c) => Promise.all([c.fadeIn(line), ...g.rows.flatMap((i, a) => cells[i].map((q, j) => c.pop(q.el, 340, { delay: a * 260 + j * 90 })))])
      });
    });
    const flat = cells.flat(), kinds = [2, 1, 0].filter((k) => flat.some((q) => q.k === k && q.neg) && flat.some((q) => q.k === k && !q.neg));
    if (kinds.length) steps.push({
      cap: `Inside the frame, a shaded and an unshaded ${tileName(kinds[0])} make a <b>zero pair</b>. They cancel.`,
      run: (c) => {
        const jobs = [];
        kinds.forEach((k) => { const ps = flat.filter((q) => q.k === k && !q.neg), ns = flat.filter((q) => q.k === k && q.neg); for (let j = 0; j < Math.min(ps.length, ns.length); j++) [ps[j], ns[j]].forEach((q) => { q.el.classList.add('dead'); jobs.push(c.anim(q.el, [{ opacity: 1 }, { opacity: 0.18 }], 500, { delay: j * 150 })); }); });
        return Promise.all(jobs);
      }
    });
    const res = mul(top, side), expr = prodTex(d.top, d.side);
    steps.push({
      cap: d.tag ? `Inside: three shaded ${T('x^2')}-tiles and six unshaded ${T('x')}-tiles, ${T('3x^2-6x')}. That’s ${T('3x(x-2)')}: <b>Example 3: C</b>. (A and B would need ${T('x^2')}-tiles on the frame.)`
        : `Count the tiles inside: ${T(expr + '=' + ptex(res))}.`,
      run: (c) => { fin.innerHTML = T(expr + '=' + ptex(res)); return c.pop(fin, 420); }
    });
    return steps;
  }
};

/* ============ 3. FOIL on the area model ============ */
const FO = { a: ['x+3', 'x+5'], b: ['2x-1', 'x+4'], e4: ['2x-5', '2x+5'], e5: ['5-b', '9-b'] };
const FCOL = { F: '#8a58c9', O: '#c27a0e', I: '#3b78d8', L: '#13807a' };
const FNAME = { F: 'First', O: 'Outer', I: 'Inner', L: 'Last' };
const foil = {
  title: 'FOIL is the area model in disguise',
  height: 410,
  choices: [{ v: 'a', label: T('(x+3)(x+5)') }, { v: 'b', label: T('(2x-1)(x+4)') }, { sep: 'Example 4(a) check:' }, { v: 'e4', label: T('(2x-5)(2x+5)') }, { sep: 'Example 5 check:' }, { v: 'e5', label: T('(5-b)(9-b)') }],
  intro: (v) => `Expand ${T(`(${FO[v][0]})(${FO[v][1]})`)}: every term in the first bracket multiplies every term in the second.`,
  make(stage, v, ex) {
    const W = ex.W, [sa, sb] = FO[v], A = P(sa), B = P(sb), asc = v === 'e5', cx = W * 0.25, ey = 150;
    const mk = (cls, html) => add(stage, h('div', cls + ' c', html), 0, ey);
    const parts = [mk('u6-par', '('), mk('u6-ft', T(plus(A[0], true))), mk('u6-ft', T(plus(A[1], false))), mk('u6-par', ')'), mk('u6-par', '('), mk('u6-ft', T(plus(B[0], true))), mk('u6-ft', T(plus(B[1], false))), mk('u6-par', ')')];
    const xs = spread(parts, cx, 3); parts.forEach((e, i) => at(e, xs[i], ey));
    const tx = { a0: xs[1], a1: xs[2], b0: xs[5], b1: xs[6] };
    const svg = add(stage, svgEl('svg', { class: 'u6-svg' }), 0, 0);
    const arc = (x1, x2, up, hh, col, L) => {
      const y = up ? ey - 28 : ey + 28, my = up ? y - hh : y + hh;
      const p = svgEl('path', { d: `M ${x1} ${y} Q ${(x1 + x2) / 2} ${my} ${x2} ${y}`, class: 'u6-arc', stroke: col }); svg.appendChild(p); p.style.opacity = 0;
      const dot = add(stage, h('div', 'u6-dot c', L), (x1 + x2) / 2, (y + my) / 2); dot.style.background = col; dot.style.opacity = 0;
      return { p, dot };
    };
    const prods = { F: mulT(A[0], B[0]), O: mulT(A[0], B[1]), I: mulT(A[1], B[0]), L: mulT(A[1], B[1]) };
    const pair = { F: [A[0], B[0]], O: [A[0], B[1]], I: [A[1], B[0]], L: [A[1], B[1]] };
    const arcs = { F: arc(tx.a0, tx.b0, true, 50, FCOL.F, 'F'), O: arc(tx.a0, tx.b1, true, 100, FCOL.O, 'O'), I: arc(tx.a1, tx.b0, false, 50, FCOL.I, 'I'), L: arc(tx.a1, tx.b1, false, 100, FCOL.L, 'L') };
    // area model
    const gx = W * 0.57, gy = 96, cw = [150, 124], rh = [92, 76];
    const cell = { F: [0, 0], O: [0, 1], I: [1, 0], L: [1, 1] }, cells = {};
    const ccx = (j) => gx + (j ? cw[0] : 0), ccy = (i) => gy + (i ? rh[0] : 0);
    for (const k in cell) { const [i, j] = cell[k]; const e = add(stage, h('div', 'u6-cell'), ccx(j), ccy(i)); box(e, cw[j] + 2, rh[i] + 2); e.style.opacity = 0; cells[k] = e; }
    const glab = [[B[0], gx + cw[0] / 2, gy - 22, true], [B[1], gx + cw[0] + cw[1] / 2, gy - 22, false], [A[0], gx - 34, gy + rh[0] / 2, true], [A[1], gx - 34, gy + rh[0] + rh[1] / 2, false]].map(([t, x, yy, f]) => { const e = add(stage, h('div', 'u6-glab c', T(termTex(t, f))), x, yy); e.style.opacity = 0; return e; });
    const head = add(stage, h('div', 'u6-head c', 'area model'), gx + (cw[0] + cw[1]) / 2, gy + rh[0] + rh[1] + 26); head.style.opacity = 0;
    const L1 = add(stage, h('div', 'u6-line c'), cx, 300), L2 = add(stage, h('div', 'u6-line c u6-fin'), cx, 356); hide(L1, L2);
    const done = [];
    const steps = [{
      cap: `Two terms × two terms = <b>4 partial products</b>. The area model gives each one its own box: rows ${T(sa)}, columns ${T(sb)}.`,
      run: (c) => Promise.all([...Object.values(cells).map((e, i) => show(c, e, 300, { delay: i * 60 })), ...glab.map((e) => c.fadeIn(e, 350, { delay: 250 })), show(c, head, 300)])
    }];
    ['F', 'O', 'I', 'L'].forEach((k) => {
      const [p, q] = pair[k], r = prods[k], sg = p.c < 0 && q.c < 0 ? ' (− × − = +)' : p.c < 0 ? ' (− × + = −)' : q.c < 0 ? ' (+ × − = −)' : '';
      steps.push({
        cap: `<b>${FNAME[k]}</b>: ${T(fac(p) + '\\cdot ' + fac(q) + '=' + termTex(r, true))}${sg}.`,
        run: async (c) => {
          done.push(r); const e = cells[k]; e.innerHTML = T(termTex(r, true)); e.classList.add('f' + k);
          L1.innerHTML = T('=' + rawTex(done));
          await Promise.all([draw(c, arcs[k].p, 550), c.pop(arcs[k].dot, 360, { delay: 300 }), c.pop(e, 380, { delay: 250 }), show(c, L1, 250)]);
        }
      });
    });
    const s = prods.O.c + prods.I.c, res = mul(A, B), resT = ptex(res, asc);
    const tag = v === 'e4' ? ' <b>Example 4(a): 2 terms.</b>' : v === 'e5' ? ` <b>Example 5: D.</b> (A forgets the outer and inner products.)` : '';
    steps.push({
      cap: s === 0 ? `The outer and inner products are <b>opposites</b>, ${T(termTex(prods.O, true) + termTex(prods.I, false) + '=0')}: they cancel! Only ${T(resT)} is left — a <b>difference of squares</b>.${tag}`
        : `<b>O</b> and <b>I</b> are like terms: ${T(termTex(prods.O, true) + termTex(prods.I, false) + '=' + termTex({ c: s, e: prods.O.e }, true))}. So ${T(`(${sa})(${sb})=${resT}`)}.${tag}`,
      run: async (c) => {
        L2.innerHTML = T('=' + resT);
        await Promise.all([pulse(c, cells.O, 1.08), pulse(c, cells.I, 1.08), c.fadeIn(L2, 450, { delay: 200 })]);
        if (s === 0) { cells.O.classList.add('gone'); cells.I.classList.add('gone'); await Promise.all([cells.O, cells.I].map((e) => c.anim(e, [{ opacity: 1 }, { opacity: 0.35 }], 400))); }
      }
    });
    return steps;
  }
};

/* ============ 3. Audit an expansion, partial product by partial product ============ */
const AUD = {
  w1: { m: '-2x', b: '5x-3', claim: '-10x^2-6x' },
  w2: { m: '4x^3', b: '2x^2-1', claim: '8x^5-4x^3' },
  A: { m: '-4x^2', b: '2x^3+3', claim: '-8x^6-12x^2', L: 'A' },
  B: { m: '-6x', b: '3-2x', claim: '-18x-12x^2', L: 'B' },
  C: { m: '-3x^3', b: '5+x', claim: '-15x^3-3x^3', L: 'C' },
  D: { m: '-8x^2', b: '1-x', claim: '-8x^2+8x^3', L: 'D' }
};
const audit = {
  title: 'Find the error: audit each partial product',
  height: 380,
  choices: [{ v: 'w1', label: T('-2x(5x-3)') }, { v: 'w2', label: T('4x^3(2x^2-1)') }, { sep: 'Example 4(b) check:' }, { v: 'A', label: 'A' }, { v: 'B', label: 'B' }, { v: 'C', label: 'C' }, { v: 'D', label: 'D' }],
  intro: (v) => `${AUD[v].L ? 'Option <b>' + AUD[v].L + '</b> claims' : 'A student claims'} ${T(`${AUD[v].m}(${AUD[v].b})=${AUD[v].claim}`)}. Is it right?`,
  make(stage, v, ex) {
    const W = ex.W, d = AUD[v], M = P(d.m)[0], Bt = P(d.b), C = P(d.claim), y0 = 60;
    const row = [add(stage, h('div', 'u6-cl c', T(`${d.m}(${d.b})`)), 0, y0), add(stage, h('div', 'u6-cl c', T('=')), 0, y0)];
    const cl = C.map((t, i) => add(stage, h('div', 'u6-cl c', T(plus(t, i === 0))), 0, y0));
    row.push(...cl); const xs = spread(row, W / 2, 6); row.forEach((e, i) => at(e, xs[i], y0));
    if (d.L) { const tg = add(stage, h('div', 'u6-tag'), 18, 14, 0); tg.textContent = 'Option ' + d.L; }
    const wy = [150, 218], prods = Bt.map((t) => mulT(M, t));
    const work = Bt.map((t, i) => { const e1 = M.e.x || 0, e2 = t.e.x || 0, p = prods[i];
      const mid = e2 ? `(${M.c})(${t.c})\\,x^{${e1}+${e2}}` : `(${M.c})(${t.c})\\,${vstr(M.e)}`;
      const e = add(stage, h('div', 'u6-line l', T(`${fac(M)}\\cdot ${fac(t)}=${mid}=${termTex(p, true)}`)), 40, wy[i]); e.style.opacity = 0; return e; });
    const ok = prods.map((p, i) => p.c === C[i].c && ekey(p.e) === ekey(C[i].e));
    const marks = prods.map((p, i) => { const e = add(stage, h('div', 'u6-mark ' + (ok[i] ? 'ok' : 'no'), ok[i] ? `✓ matches ${T(termTex(C[i], true))}` : `✗ claimed ${T(termTex(C[i], true))}`), W * 0.68, wy[i]); e.style.translate = '0 -50%'; e.style.opacity = 0; return e; });
    const fin = add(stage, h('div', 'u6-line l u6-fin'), 40, 310); fin.style.opacity = 0;
    const allOk = ok.every(Boolean);
    const stamp = add(stage, h('div', 'u6-stamp ' + (allOk ? 'yes' : 'no'), allOk ? 'CORRECT' : 'ERROR'), W - 30, 310); stamp.style.translate = '-100% -50%'; stamp.style.opacity = 0;
    const why = (p, q) => (ekey(p.e) !== ekey(q.e) ? `exponents <b>add</b>, so the power is ${T(vstr(p.e))}, not ${T(vstr(q.e) || '1')}`
      : Math.sign(p.c) !== Math.sign(q.c) ? `signs <b>multiply</b>: ${p.c > 0 ? 'negative × negative = <b>positive</b>' : 'positive × negative = <b>negative</b>'}` : `the coefficients multiply to ${p.c}, not ${q.c}`);
    const steps = prods.map((p, i) => ({
      cap: `${i ? 'Second' : 'First'} partial product: ${T(fac(M) + '\\cdot ' + fac(Bt[i]) + '=' + termTex(p, true))}. ${ok[i] ? `The claim says ${T(termTex(C[i], true))} ✓` : `The claim says ${T(termTex(C[i], true))} ✗ — ${why(p, C[i])}.`}`,
      run: async (c) => { cl[i].classList.add(ok[i] ? 'good' : 'bad'); await c.fadeIn(work[i], 400); await Promise.all([c.fadeIn(marks[i], 350, { from: 'translateX(-10px)' }), pulse(c, cl[i], 1.1)]); }
    }));
    steps.push({
      cap: allOk ? `Both partial products check out: this expansion is <b>correct</b>.${d.L ? ' <b>Example 4(b): D</b> is the one correct expansion.' : ''}`
        : `One wrong partial product spoils the whole expansion.${d.L ? ` Option <b>${d.L}</b> is out.` : ''} Correct: ${T(`${d.m}(${d.b})=${rawTex(prods)}`)}.`,
      run: async (c) => { fin.innerHTML = T(`${d.m}(${d.b})=${rawTex(prods)}`); await c.fadeIn(fin, 350); await stampIn(c, stamp); }
    });
    return steps;
  }
};

/* ============ 4. The square of a binomial ============ */
const SQ = {
  a: { a: 'x', b: '3', aL: 176, bL: 84 },
  b: { a: 'x', b: '-4', aL: 176, bL: 96 },
  e6: { a: '2x', b: '6', aL: 186, bL: 104, tri: true }
};
const square = {
  title: 'The square of a binomial: four pieces, not two',
  height: 420,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'a', label: T('(x+3)^2') }, { v: 'b', label: T('(x-4)^2') }, { sep: 'Example 6 check:' }, { v: 'e6', label: 'the triangle' }],
  intro: (v) => (SQ[v].tri ? `Example 6: the triangle’s legs are both ${T('2x+6')}. Start with the square ${T('(2x+6)^2')}.` : `What is ${T(`(${SQ[v].a}${SQ[v].b.startsWith('-') ? '' : '+'}${SQ[v].b})^2`)}? Draw it as a square.`),
  make(stage, v, ex) {
    const W = ex.W, d = SQ[v], a = P(d.a)[0], b = P(d.b)[0], aL = d.aL, bL = d.bL, S = aL + bL, sx = 100, sy = 62;
    const bin = d.a + termTex(b, false), sq = `(${bin})^2`;
    const aa = mulT(a, a), ab = mulT(a, b), bb = mulT(b, b), full = mul([a, b], [a, b]);
    const pc = (x, y, w, hh, cls, t) => { const e = add(stage, h('div', 'u6-pc ' + cls, T(termTex(t, true))), x, y); box(e, w, hh); e.style.opacity = 0; return e; };
    const P2 = pc(sx, sy, aL, aL, 'p2', aa), Pa = pc(sx + aL, sy, bL, aL, ab.c < 0 ? 'pn' : 'p1', ab), Pb = pc(sx, sy + aL, aL, bL, ab.c < 0 ? 'pn' : 'p1', ab), P0 = pc(sx + aL, sy + aL, bL, bL, 'p0', bb);
    const out = add(stage, h('div', 'u6-sqo'), sx - 1, sy - 1); box(out, S + 2, S + 2); out.style.opacity = 0;
    const labs = [[d.a, sx + aL / 2, sy - 22], [termTex(b, false), sx + aL + bL / 2, sy - 22], [d.a, sx - 28, sy + aL / 2], [termTex(b, false), sx - 28, sy + aL + bL / 2]].map(([t, x, y]) => { const e = add(stage, h('div', 'u6-lab c', T(t)), x, y); e.style.opacity = 0; return e; });
    const svg = add(stage, svgEl('svg', { class: 'u6-svg' }), 0, 0);
    const triP = svgEl('polygon', { points: `${sx},${sy} ${sx},${sy + S} ${sx + S},${sy + S}`, fill: 'rgba(201,58,51,.10)', stroke: '#c93a33', 'stroke-width': 4, 'stroke-linejoin': 'round' }); svg.appendChild(triP); triP.style.opacity = 0;
    const vlab = d.tri ? [['P', sx - 16, sy - 12], ['Q', sx - 16, sy + S + 14], ['R', sx + S + 16, sy + S + 14]].map(([t, x, y]) => { const e = add(stage, h('div', 'u6-lab c u6-red', T(t)), x, y); e.style.opacity = 0; return e; }) : [];
    const rx = 480, L = [0, 1, 2].map((j) => { const e = add(stage, h('div', 'u6-line l' + (j === 2 ? ' u6-fin' : '')), rx, 84 + j * 62); e.style.opacity = 0; return e; });
    const trap = add(stage, h('div', 'u6-box bad'), rx, 300); trap.style.translate = '0 -50%'; trap.style.opacity = 0;
    const half = full.map((t) => ({ c: t.c / 2, e: t.e }));
    const sum = [aa, ab, ab, bb];
    const steps = [{
      cap: `${T(sq)} means ${T(`(${bin})(${bin})`)}: the area of a <b>square</b> with side ${T(bin)}.${b.c < 0 ? ' (With a negative term, read the picture as a box-method grid.)' : ''}`,
      run: (c) => { L[0].innerHTML = T(`${sq}=(${bin})(${bin})`); return Promise.all([show(c, out, 400), ...labs.map((e, i) => c.fadeIn(e, 300, { delay: i * 80 })), c.fadeIn(L[0], 400, { delay: 200 })]); }
    }, {
      cap: `${T(fac(a) + '\\cdot ' + fac(a) + '=' + termTex(aa, true))}: the big square.`,
      run: (c) => { L[1].innerHTML = T('=' + rawTex(sum.slice(0, 1))); return Promise.all([c.pop(P2, 420), c.fadeIn(L[1], 300)]); }
    }, {
      cap: `${T(fac(a) + '\\cdot ' + fac(b) + '=' + termTex(ab, true))} — and there are <b>two</b> of these rectangles, one on each side.${ab.c < 0 ? ' Both are negative.' : ''}`,
      run: (c) => { L[1].innerHTML = T('=' + rawTex(sum.slice(0, 3))); return Promise.all([c.pop(Pa, 420), c.pop(Pb, 420, { delay: 200 }), flash(c, L[1])]); }
    }, {
      cap: `${T(fac(b) + '\\cdot ' + fac(b) + '=' + termTex(bb, true))}${b.c < 0 ? ' (negative × negative = positive)' : ''}: the small square.`,
      run: (c) => { L[1].innerHTML = T('=' + rawTex(sum)); return Promise.all([c.pop(P0, 420), flash(c, L[1])]); }
    }, {
      cap: `Collect the two middle rectangles: ${T(sq + '=' + ptex(full))}. The middle term is <b>2 × first × last</b>.`,
      run: (c) => { L[2].innerHTML = T('=' + ptex(full)); return Promise.all([pulse(c, Pa, 1.06), pulse(c, Pb, 1.06), c.fadeIn(L[2], 400)]); }
    }, {
      cap: `<b>The classic error</b> writes ${T(sq + '=' + termTex(aa, true) + termTex(bb, false))} — only the two squares. Both ${T(termTex(ab, true))} rectangles go <b>missing</b>.`,
      run: async (c) => { Pa.classList.add('miss'); Pb.classList.add('miss'); trap.innerHTML = `${T(sq + '\\neq ' + termTex(aa, true) + termTex(bb, false))} ✗`; await Promise.all([c.shake(Pa), c.shake(Pb), c.pop(trap, 400)]); }
    }];
    if (d.tri) {
      steps.push({
        cap: `Back to Example 6. Right-angled at ${T('Q')} with both legs ${T(bin)}: the triangle is exactly <b>half</b> of the square, cut along a diagonal.`,
        run: async (c) => { Pa.classList.remove('miss'); Pb.classList.remove('miss'); [[P2, '10px 14px'], [P0, '4px 8px']].forEach(([e, pd]) => { e.style.placeItems = 'start end'; e.style.padding = pd; }); await Promise.all([c.anim(trap, [{ opacity: 1 }, { opacity: 0 }], 300), show(c, triP, 500), ...vlab.map((e) => c.pop(e, 340, { delay: 300 }))]); }
      });
      steps.push({
        cap: `Area ${T('=\\tfrac12(4x^2+24x+36)=' + ptex(half))}, so ${T('b=12')}: <b>Example 6: B</b>. (24 is the trap — that’s the whole square.)`,
        run: async (c) => { trap.className = 'u6-box ok'; trap.innerHTML = T(`\\tfrac12(${ptex(full)})=${ptex(half)}`); await c.pop(trap, 420); }
      });
    }
    return steps;
  }
};

/* ============ 4. Whole minus hole ============ */
const FRM = { a: { L: '2x+3', Wd: 'x+4', S: 'x' }, e7: { L: '3x+5', Wd: '2x+6', S: 'x+2', tag: true } };
const frame = {
  title: 'Shaded area = whole − hole',
  height: 420,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'a', label: `an ${T('x')}-by-${T('x')} hole` }, { sep: 'Example 7 check:' }, { v: 'e7', label: 'the cut-out square' }],
  intro: (v) => `A ${T(FRM[v].L)} by ${T(FRM[v].Wd)} rectangle with a square hole of side ${T(FRM[v].S)}. What area is left?`,
  make(stage, v, ex) {
    const W = ex.W, d = FRM[v], Lp = P(d.L), Wp = P(d.Wd), Sp = P(d.S), big = mul(Lp, Wp), hole = mul(Sp, Sp), res = sub(big, hole);
    const x0 = 74, y0 = 76, RW = 330, RH = 222, hs = 108;
    const rect = add(stage, h('div', 'u6-frm'), x0, y0); box(rect, RW, RH);
    const hl = add(stage, h('div', 'u6-hole', T(d.S)), x0 + RW / 2 - hs / 2 + 34, y0 + RH / 2 - hs / 2); box(hl, hs, hs);
    const lt = add(stage, h('div', 'u6-mid c', T('\\text{length}=' + d.L)), x0 + RW / 2, y0 - 24);
    const lw = add(stage, h('div', 'u6-mid c', T('\\text{width}=' + d.Wd)), x0 - 26, y0 + RH / 2); lw.style.rotate = '-90deg';
    const ls = add(stage, h('div', 'u6-sm c', `side of square ${T('=' + d.S)}`), x0 + RW / 2 + 34, y0 + RH + 26);
    hide(rect, hl, lt, lw, ls);
    const fo = Lp.flatMap((s) => Wp.map((t) => mulT(s, t)));
    const rx = 466, L = [0, 1, 2, 3, 4].map((j) => { const e = add(stage, h('div', 'u6-mid l'), rx, 52 + j * 54); e.style.opacity = 0; return e; });
    const fin = add(stage, h('div', 'u6-box ok'), rx, 362); fin.style.translate = '0 -50%'; fin.style.opacity = 0;
    const holeLine = Sp.length > 1 ? `(${d.S})^2=${ptex(hole)}` : `${d.S}\\cdot ${d.S}=${ptex(hole)}`;
    return [{
      cap: `Shaded area = <b>whole rectangle − square hole</b>.`,
      run: (c) => { L[0].innerHTML = T('\\text{shaded}=\\text{rectangle}-\\text{square}'); return Promise.all([show(c, rect), show(c, hl, 400, { delay: 200 }), c.fadeIn(lt), c.fadeIn(lw), c.fadeIn(ls), c.fadeIn(L[0], 350, { delay: 300 })]); }
    }, {
      cap: `Whole rectangle, length × width: ${T(`(${d.L})(${d.Wd})=${ptex(big)}`)}.`,
      run: (c) => { rect.classList.add('glow'); L[1].innerHTML = T(`(${d.L})(${d.Wd})=${rawTex(fo)}`); L[2].innerHTML = T(`\\phantom{(${d.L})(${d.Wd})}=${ptex(big)}`); return Promise.all([c.fadeIn(L[1]), c.fadeIn(L[2], 350, { delay: 300 })]); }
    }, {
      cap: Sp.length > 1 ? `Square hole: ${T(`(${d.S})^2=${ptex(hole)}`)} — don’t lose the middle term ${T(termTex(sortP(hole)[1], true))}.` : `Square hole: ${T(holeLine)}.`,
      run: (c) => { rect.classList.remove('glow'); hl.classList.add('glow'); L[3].innerHTML = T(holeLine); return c.fadeIn(L[3]); }
    }, {
      cap: `Subtract the <b>whole</b> hole, in brackets, so the minus reaches every term: ${T(`-(${ptex(hole)})=${ptex(neg(hole))}`)}.`,
      run: (c) => { hl.classList.remove('glow'); L[4].innerHTML = T(`(${ptex(big)})-(${ptex(hole)})`); return c.fadeIn(L[4]); }
    }, {
      cap: `Collect: the shaded area is ${T(ptex(res))}.${d.tag ? ` <b>Example 7: C.</b> (A subtracts only the ${T('x^2')}; B and D slip a sign on ${T('4x')} or ${T('4')}.)` : ''}`,
      run: (c) => { fin.innerHTML = T('=' + ptex(res)); return c.pop(fin, 420); }
    }];
  }
};

/* ============ 5. Expand each group, then collect ============ */
const GRP = {
  w1: { g: [{ m: '2', p: 'x-1' }, { m: '1', p: '3x+4' }, { m: '1', p: 'x+1' }], end: `That’s the warm-up’s <b>magic sum</b>.` },
  w2: { g: [{ m: '1', p: '6x+3' }, { m: '-2', p: 'x-1' }, { m: '-1', p: '2x+1' }], end: `That’s the red corner: the big one is <b>B</b>.` },
  e8: { g: [{ m: '5x', p: '3-2x' }, { m: '-4x', p: 'x-3' }, { m: '-1', p: '7x+5' }], abc: true },
  e9b: { g: [{ m: '1', p: '4x^2+2x-3' }, { m: '1', p: '2x^2+4x-5' }, { m: '-1', prod: ['3x-2', '2x+3'] }], pqr: true }
};
const isOne = (m, s) => m.c === s && !Object.keys(m.e).length;
function gTex(g, first) {
  const m = P(g.m)[0], body = g.prod ? `(${g.prod[0]})(${g.prod[1]})` : `(${g.p})`;
  if (isOne(m, 1)) return (first ? '' : '+') + body;
  if (isOne(m, -1)) return '-' + body;
  return termTex(m, first) + body;
}
function gTerms(g) { const m = P(g.m)[0]; const inner = g.prod ? mul(P(g.prod[0]), P(g.prod[1])) : P(g.p); return inner.map((t) => mulT(m, t)); }
const groups = {
  title: 'Expand each group first, then collect like terms',
  height: 470,
  choices: [{ sep: 'Warm-up check:' }, { v: 'w1', label: 'magic sum' }, { v: 'w2', label: 'red corner' }, { sep: 'Example 8 check:' }, { v: 'e8', label: T('5x(3-2x)-4x(x-3)-(7x+5)') }, { sep: 'Example 9(b) check:' }, { v: 'e9b', label: 'sum − product' }],
  value: 'w1',
  intro: (v) => `Simplify ${T(GRP[v].g.map((g, i) => gTex(g, i === 0)).join(''))}. Colours mark <b>like terms</b>: ${T('x^2')} teal, ${T('x')} amber, numbers blue.`,
  make(stage, v, ex) {
    const W = ex.W, d = GRP[v], G = d.g, expr = G.map((g, i) => gTex(g, i === 0)).join('');
    const head = add(stage, h('div', 'u6-line c', T(expr)), W / 2, 34);
    const gy = [102, 156, 210], cx0 = 380;
    const rows = G.map((g, i) => {
      const lab = add(stage, h('div', 'u6-gl', T(gTex(g, i === 0))), 26, gy[i]); lab.style.opacity = 0;
      const arr = add(stage, h('div', 'u6-arrow', '→'), cx0 - 34, gy[i]); arr.style.opacity = 0;
      const terms = gTerms(g); let x = cx0;
      const chips = terms.map((t, j) => { const e = add(stage, h('div', 'u6-chip ' + kc(t), T(termTex(t, j === 0 && i === 0))), x, gy[i]); x += (e.offsetWidth || 60) + 10; e.style.opacity = 0; return e; });
      return { lab, arr, terms, chips };
    });
    const all = rows.flatMap((r) => r.terms.map((t, j) => ({ t, src: r.chips[j] })));
    const kinds = [...new Set(all.map((o) => deg(o.t)))].sort((a, b) => b - a);
    const bw = (W - 40 - 16 * (kinds.length - 1)) / kinds.length, by = 252;
    const buckets = kinds.map((k, i) => {
      const e = add(stage, h('div', 'u6-bucket', `<div class="u6-bh">${k === 0 ? 'numbers' : k === 1 ? T('x') + ' terms' : T('x^' + k) + ' terms'}</div>`), 20 + i * (bw + 16), by); box(e, bw, 128); e.style.opacity = 0;
      const items = all.filter((o) => deg(o.t) === k), sumT = items.reduce((s, o) => s + o.t.c, 0), sumTerm = { c: sumT, e: items[0].t.e };
      const sumLine = add(stage, h('div', 'u6-bsum c', T(items.length > 1 ? rawTex(items.map((o) => o.t)) + '=' + (sumT ? termTex(sumTerm, true) : '0') : termTex(sumTerm, true))), 20 + i * (bw + 16) + bw / 2, by + 98); sumLine.style.opacity = 0;
      return { k, e, x: 20 + i * (bw + 16), items, sumLine };
    });
    const res = addP(...rows.map((r) => r.terms)), resT = ptex(res);
    const fin = add(stage, h('div', 'u6-line c u6-fin'), W / 2, 432); fin.style.opacity = 0;
    const steps = rows.map((r, i) => {
      const g = G[i], m = P(g.m)[0];
      let cap;
      if (g.prod) cap = `Expand the product <b>first</b>, keeping it in brackets: ${T(`(${g.prod[0]})(${g.prod[1]})=${ptex(mul(P(g.prod[0]), P(g.prod[1])))}`)}. Then the minus flips <b>every</b> sign: ${T(rawTex(r.terms))}.`;
      else if (isOne(m, 1)) cap = `${i ? 'A <b>+</b> in front' : 'Nothing in front'}: the brackets just drop. ${T(rawTex(r.terms))}.`;
      else if (isOne(m, -1)) cap = `A <b>minus</b> in front means multiply by ${T('-1')}: <b>every</b> sign inside flips. ${T(`-(${g.p})=${rawTex(r.terms)}`)}, not ${T(rawTex([r.terms[0], { c: -r.terms[1].c, e: r.terms[1].e }]))}.`;
      else cap = `Distribute ${T(termTex(m, true))} to each term inside: ${P(g.p).map((t, j) => T(`${fac(m)}\\cdot ${fac(t)}=${termTex(r.terms[j], true)}`)).join(', ')}.${m.c < 0 && P(g.p).some((t) => t.c < 0) ? ' Negative × negative = positive.' : ''}`;
      return { cap, run: (c) => Promise.all([c.fadeIn(r.lab, 300), show(c, r.arr, 300), ...r.chips.map((e, j) => c.pop(e, 340, { delay: 200 + j * 120 }))]) };
    });
    steps.push({
      cap: `Now collect <b>like terms</b> — same colour, same bucket — and add each bucket.`,
      run: async (c) => {
        const jobs = [];
        buckets.forEach((b, bi) => {
          jobs.push(show(c, b.e, 300));
          const clones = b.items.map((o, j) => { const e = add(stage, h('div', 'u6-chip ' + kc(o.t), T(termTex(o.t, j === 0))), parseFloat(o.src.style.left), parseFloat(o.src.style.top)); return e; });
          const ws = clones.map((e) => e.offsetWidth || 60), tot = ws.reduce((s, w) => s + w, 0) + 8 * (clones.length - 1); let x = b.x + bw / 2 - tot / 2;
          clones.forEach((e, j) => { jobs.push(moveTo(c, e, x, by + 56, 750, { delay: 150 + bi * 120 + j * 90 })); x += ws[j] + 8; });
          jobs.push(c.fadeIn(b.sumLine, 350, { delay: 900 + bi * 120 }));
        });
        rows.forEach((r) => r.chips.forEach((e) => jobs.push(c.anim(e, [{ opacity: 1 }, { opacity: 0.35 }], 400))));
        await Promise.all(jobs);
      }
    });
    let endCap;
    if (d.abc) { const [A, B, C] = sortP(res).map((t) => t.c); endCap = `${T('=' + resT)}: ${T(`a=${A},\\ b=${B},\\ c=${C}`)}, so ${T(`abc=(${A})(${B})(${C})=${A * B * C}`)}. <b>Example 8: 1400.</b>`; }
    else if (d.pqr) endCap = `${T('=0x^2+x-2')}: ${T('p=0,\\ q=1,\\ r=-2')}. Exactly <b>one</b> parameter is zero: <b>Example 9(b): B</b>.`;
    else endCap = `${T(expr + '=' + resT)}. ${d.end}`;
    steps.push({
      cap: endCap,
      run: (c) => { fin.innerHTML = T('=' + (d.pqr ? '0x^2+x-2' : resT)); return c.pop(fin, 420); }
    });
    head.style.opacity = 1;
    return steps;
  }
};

/* ============ 6 + 7. Grids: binomial × trinomial, and three binomials two at a time ============ */
const GRD = {
  g1: { f: ['x+2', 'x^2+3x+1'] },
  e9a: { f: ['5t-2', '3t^2-4t-2'], end: '<b>Example 9(a): A.</b>' },
  t1: { f: ['x+1', 'x+2', 'x+3'] },
  e10: { f: ['a+2', 'a-5', '3a+1'], end: '<b>Example 10: A.</b>' }
};
function buildGrid(stage, rowsP, colsP, gx, gy, cw, rh) {
  const g = { cells: [], labs: [], rowsP, colsP, gx, gy, cw, rh };
  colsP.forEach((t, j) => { const e = add(stage, h('div', 'u6-glab c', T(termTex(t, j === 0))), gx + j * cw + cw / 2, gy - 24); e.style.opacity = 0; g.labs.push(e); });
  rowsP.forEach((t, i) => { const e = add(stage, h('div', 'u6-glab c', T(termTex(t, i === 0))), gx - 38, gy + i * rh + rh / 2); e.style.opacity = 0; g.labs.push(e); });
  rowsP.forEach((r, i) => g.cells.push(colsP.map((q, j) => { const e = add(stage, h('div', 'u6-cell'), gx + j * cw, gy + i * rh); box(e, cw + 2, rh + 2); e.style.opacity = 0; e._p = mulT(r, q); return e; })));
  g.svg = add(stage, svgEl('svg', { class: 'u6-svg' }), 0, 0);
  g.frame = (c) => Promise.all([...g.cells.flat().map((e, k) => show(c, e, 250, { delay: k * 40 })), ...g.labs.map((e) => c.fadeIn(e, 300, { delay: 150 }))]);
  g.fillRow = (c, i, d0 = 0) => Promise.all(g.cells[i].map((e, j) => { e.innerHTML = T(termTex(e._p, true)); e.classList.add(kc(e._p)); return c.pop(e, 360, { delay: d0 + j * 140 }); }));
  g.diag = (c) => {
    const byDeg = {}; g.cells.forEach((row, i) => row.forEach((e, j) => { (byDeg[deg(e._p)] = byDeg[deg(e._p)] || []).push([i, j]); }));
    const jobs = [];
    Object.keys(byDeg).forEach((k) => {
      const pts = byDeg[k]; if (pts.length < 2) return;
      const col = ['#5b7fb9', '#c27a0e', '#13807a', '#8a58c9'][Math.min(3, Number(k))];
      const ln = svgEl('polyline', { points: pts.map(([i, j]) => `${gx + j * cw + cw / 2},${gy + i * rh + rh / 2}`).join(' '), fill: 'none', stroke: col, 'stroke-width': 26, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.18 });
      g.svg.appendChild(ln); jobs.push(c.anim(ln, [{ opacity: 0 }, { opacity: 0.22 }], 500));
    });
    return Promise.all(jobs);
  };
  g.collectLines = () => { const byDeg = {}; g.cells.flat().forEach((e) => (byDeg[deg(e._p)] = byDeg[deg(e._p)] || []).push(e._p)); return Object.keys(byDeg).map(Number).sort((a, b) => b - a).map((k) => { const ts = byDeg[k], s = ts.reduce((a, t) => a + t.c, 0); return ts.length > 1 ? `${rawTex(ts)}=${s ? termTex({ c: s, e: ts[0].e }, true) : '0'}` : termTex(ts[0], true); }); };
  g.hide = (c) => Promise.all([...g.cells.flat(), ...g.labs, g.svg].map((e) => c.anim(e, [{ opacity: 1 }, { opacity: 0 }], 350)));
  return g;
}
function gridDef(title, choices, value) {
  return {
    title, height: 440, choices, value,
    intro: (v) => { const f = GRD[v].f; return f.length === 2 ? `Expand ${T(f.map((s) => `(${s})`).join(''))} on a grid: one factor across the top, the other down the side.` : `Expand ${T(f.map((s) => `(${s})`).join(''))}: <b>two at a time</b>, with two small grids.`; },
    make(stage, v, ex) {
      const W = ex.W, d = GRD[v], F = d.f.map(P), expr = d.f.map((s) => `(${s})`).join('');
      add(stage, h('div', 'u6-line c', T(expr)), W * 0.3, 30);
      const gx = 130, gy = 116, cw = 128, rh = 74, rx = 600;
      const L = [0, 1, 2, 3].map((j) => { const e = add(stage, h('div', 'u6-mid l'), rx, 92 + j * 46); e.style.opacity = 0; return e; });
      const note = add(stage, h('div', 'u6-sm'), rx, 40); note.style.opacity = 0;
      const fin = add(stage, h('div', 'u6-line c u6-fin'), W / 2, 400); fin.style.opacity = 0;
      const setLines = (c, ls, d0 = 0) => Promise.all(L.map((e, j) => { e.innerHTML = ls[j] ? T(ls[j]) : ''; return ls[j] ? c.fadeIn(e, 300, { delay: d0 + j * 150 }) : c.anim(e, [{ opacity: 0 }, { opacity: 0 }], 1); }));
      const steps = [];
      const twoStage = F.length === 3;
      let tri = F[1];
      if (twoStage) {
        const g1 = buildGrid(stage, F[0], F[1], gx, gy, cw, rh), first = mul(F[0], F[1]);
        tri = sortP(first);
        steps.push({ cap: `Two at a time. Start with ${T(`(${d.f[0]})(${d.f[1]})`)}: a 2 × 2 grid, four partial products.`, run: (c) => { note.innerHTML = '<b>Step 1:</b> the first two factors'; return Promise.all([g1.frame(c), c.fadeIn(note)]); } });
        steps.push({ cap: `Fill the grid: each row term times each column term.`, run: (c) => Promise.all([g1.fillRow(c, 0), g1.fillRow(c, 1, 300)]) });
        steps.push({ cap: `Collect along the diagonal: ${T(`(${d.f[0]})(${d.f[1]})=${ptex(first)}`)}.`, run: (c) => Promise.all([g1.diag(c), setLines(c, [...g1.collectLines(), '=' + ptex(first)])]) });
        const g2 = buildGrid(stage, F[2], tri, gx, gy, cw, rh);
        steps.push({
          cap: `Now multiply that trinomial by the third factor, ${T(`(${d.f[2]})`)}: a 2 × 3 grid, <b>six</b> partial products.`,
          run: async (c) => { note.innerHTML = `<b>Step 2:</b> ${T('(' + ptex(first) + ')(' + d.f[2] + ')')}`; await Promise.all([g1.hide(c), setLines(c, [])]); await g2.frame(c); }
        });
        F.splice(0, 2, tri); // the rest of the steps run on grid 2: rows = third factor, columns = trinomial
        rowsSteps(g2, F[1], tri);
      } else {
        const g = buildGrid(stage, F[0], F[1], gx, gy, cw, rh);
        steps.push({ cap: `${F[0].length} terms × ${F[1].length} terms = <b>${F[0].length * F[1].length} partial products</b>: one box each.`, run: (c) => g.frame(c) });
        rowsSteps(g, F[0], F[1]);
      }
      function rowsSteps(g, rowsP, colsP) {
        rowsP.forEach((r, i) => steps.push({
          cap: `Row ${T(termTex(r, true))}: times each column term gives ${g.cells[i].map((e) => T(termTex(e._p, true))).join(', ')}.${r.c < 0 ? ' A negative row flips every sign.' : ''}`,
          run: (c) => g.fillRow(c, i)
        }));
        const res = mul(rowsP, colsP);
        steps.push({ cap: `Like terms sit on the <b>diagonals</b> — same colour. Add along each one.`, run: (c) => Promise.all([g.diag(c), setLines(c, g.collectLines())]) });
        steps.push({ cap: `${T(expr + '=' + ptex(res))}.${d.end ? ' ' + d.end : ''}`, run: (c) => { fin.innerHTML = T(expr + '=' + ptex(res)); return c.pop(fin, 420); } });
      }
      return steps;
    }
  };
}
const grid = gridDef('Six partial products on a grid', [{ v: 'g1', label: T('(x+2)(x^2+3x+1)') }, { sep: 'Example 9(a) check:' }, { v: 'e9a', label: T('(5t-2)(3t^2-4t-2)') }], 'g1');
grid.minW = 820; // drawn this wide and scaled to fit beside the sidebar
const three = gridDef('Three binomials: two at a time', [{ v: 't1', label: T('(x+1)(x+2)(x+3)') }, { sep: 'Example 10 check:' }, { v: 'e10', label: T('(a+2)(a-5)(3a+1)') }], 't1');
three.minW = 860; // drawn this wide and scaled to fit beside the sidebar

/* ============ 8. Extension: completing the square ============ */
const CSQ = { a: { b: -10, c: 29 }, e11b: { b: -16, c: 70, tag: '<b>Example 11(b): p = 8, q = 6.</b>' }, e11a: { match: true } };
const complete = {
  title: 'Completing the square: half, square, adjust',
  height: 380,
  choices: [{ v: 'a', label: T('x^2-10x+29') }, { sep: 'Example 11 check:' }, { v: 'e11a', label: '(a)' }, { v: 'e11b', label: '(b)' }],
  intro: (v) => (CSQ[v].match ? `Example 11(a): ${T('(x-a)^2+a=x^2-10x+c')}. Expand, then <b>match coefficients</b>.` : `Write ${T(`x^2${CSQ[v].b}x+${CSQ[v].c}`)} in the form ${T('(x-p)^2+q')}.`),
  make(stage, v, ex) {
    const W = ex.W, d = CSQ[v];
    const L = [0, 1, 2, 3, 4].map((j) => { const e = add(stage, h('div', j ? 'u6-line c' : 'u6-big c'), W / 2, 50 + j * 66); if (j) e.style.opacity = 0; return e; });
    const put = (c, j, s, cls) => { L[j].innerHTML = T(s); if (cls) L[j].classList.add(cls); return c.fadeIn(L[j], 400); };
    if (d.match) {
      L[0].innerHTML = T('(x-a)^2+a=x^2-10x+c');
      return [
        { cap: `Expand the left side: ${T('(x-a)^2=x^2-2ax+a^2')}, then add ${T('a')}.`, run: (c) => put(c, 1, 'x^2-2ax+a^2+a=x^2-10x+c') },
        { cap: `Match the ${T('x')}-terms: ${T('-2a=-10')}, so ${T('a=5')}.`, run: (c) => put(c, 2, '-2a=-10\\ \\Rightarrow\\ a=5') },
        { cap: `Match the constants: ${T('c=a^2+a=25+5=30')}. <b>Example 11(a): 30.</b>`, run: (c) => put(c, 3, 'c=a^2+a=25+5=30', 'u6-fin') },
        { cap: `Check: ${T('(x-5)^2+5=x^2-10x+25+5=x^2-10x+30')} ✓`, run: (c) => put(c, 4, '(x-5)^2+5=x^2-10x+30\\ \\checkmark') }
      ];
    }
    const p = -d.b / 2, q = d.c - p * p, tri = `x^2${d.b}x+${d.c}`;
    L[0].innerHTML = T(tri);
    return [
      { cap: `Half the ${T('x')}-coefficient: ${T(`\\tfrac12(${d.b})=${d.b / 2}`)}. Flip its sign: ${T(`p=${p}`)}.`, run: (c) => put(c, 1, `p=-\\tfrac12(${d.b})=${p}`) },
      { cap: `Square the binomial: ${T(`(x-${p})^2=x^2${d.b}x+${p * p}`)}. The ${T('x^2')} and ${T('x')} terms already match!`, run: (c) => put(c, 2, `(x-${p})^2=x^2${d.b}x+${p * p}`) },
      { cap: `Only the constant is off: we need ${d.c} but have ${p * p}, so add ${T(`q=${d.c}-${p * p}=${q}`)}.`, run: (c) => put(c, 3, `${tri}=(x^2${d.b}x+${p * p})+${q}`) },
      { cap: `${T(`${tri}=(x-${p})^2+${q}`)}.${d.tag ? ' ' + d.tag : ''}`, run: (c) => put(c, 4, `${tri}=(x-${p})^2+${q}`, 'u6-fin') }
    ];
  }
};

/* ============ 9. The folded box ============ */
// the net: a sheet with x-by-x squares cut from every corner (solid cuts), fold lines dashed; used by the explainer and the Example 12 figure
function drawNet(svg, nx, ny, NW, NH, xs) {
  const sheet = svgEl('rect', { x: nx, y: ny, width: NW, height: NH, class: 'u6-net-sheet' });
  const net = svgEl('path', { class: 'u6-net-sheet', d: `M ${nx + xs} ${ny} H ${nx + NW - xs} V ${ny + xs} H ${nx + NW} V ${ny + NH - xs} H ${nx + NW - xs} V ${ny + NH} H ${nx + xs} V ${ny + NH - xs} H ${nx} V ${ny + xs} H ${nx + xs} Z` });
  const fold = svgEl('rect', { x: nx + xs, y: ny + xs, width: NW - 2 * xs, height: NH - 2 * xs, class: 'u6-net-fold' });
  const cuts = [[nx, ny], [nx + NW - xs, ny], [nx, ny + NH - xs], [nx + NW - xs, ny + NH - xs]].map(([x, y]) => svgEl('rect', { x, y, width: xs, height: xs, class: 'u6-net-cut' }));
  svg.append(sheet, net, fold, ...cuts);
  return { sheet, net, fold, cuts };
}
function dimLine(svg, x1, y1, x2, y2, cls = 'u6-dim') {
  const g = svgEl('g', { class: cls }); const vert = x1 === x2, t = 6;
  g.appendChild(svgEl('line', { x1, y1, x2, y2 }));
  g.appendChild(svgEl('line', vert ? { x1: x1 - t, y1, x2: x1 + t, y2: y1 } : { x1, y1: y1 - t, x2: x1, y2: y1 + t }));
  g.appendChild(svgEl('line', vert ? { x1: x2 - t, y1: y2, x2: x2 + t, y2 } : { x1: x2, y1: y2 - t, x2, y2: y2 + t }));
  svg.appendChild(g); return g;
}
const BOXD = { s12: { L: 12, Wd: 8 }, e12: { L: 15, Wd: 9, tag: true } };
const boxEx = {
  title: 'Cut the corners, fold up the sides',
  height: 470,
  choices: [{ v: 's12', label: '12 cm by 8 cm sheet' }, { sep: 'Example 12 check:' }, { v: 'e12', label: '15 cm by 9 cm sheet' }],
  intro: (v) => `A ${BOXD[v].L} cm by ${BOXD[v].Wd} cm sheet. Cut a square of side ${T('x')} from each corner and fold up the sides. What is the box’s volume?`,
  make(stage, v, ex) {
    const W = ex.W, d = BOXD[v], sc = 22, X = 2, xs = X * sc, NW = d.L * sc, NH = d.Wd * sc, nx = 70, ny = 60;
    const svg = add(stage, svgEl('svg', { class: 'u6-svg' }), 0, 0);
    const net = drawNet(svg, nx, ny, NW, NH, xs);
    net.net.style.opacity = 0; net.fold.style.opacity = 0; net.cuts.forEach((e) => (e.style.opacity = 0));
    const dimB = dimLine(svg, nx, ny + NH + 40, nx + NW, ny + NH + 40), dimL = dimLine(svg, nx - 40, ny, nx - 40, ny + NH);
    const lab = (html, x, y, cls = '') => { const e = add(stage, h('div', 'u6-blab c ' + cls, html), x, y); e.style.opacity = 0; return e; };
    const lL = lab(`${d.L} cm`, nx + NW / 2, ny + NH + 40), lW = lab(`${d.Wd} cm`, nx - 40, ny + NH / 2);
    lL.style.background = lW.style.background = '#fbfaf6';
    lL.style.opacity = lW.style.opacity = 1;
    const xl = [lab(T('x'), nx + xs / 2, ny + NH + 12, 'x'), lab(T('x'), nx - 12, ny + NH - xs / 2, 'x')];
    xl.forEach((e) => (e.style.fontSize = '19px'));
    // inner dimensions along the top and right
    const dimT = [dimLine(svg, nx, ny - 18, nx + xs, ny - 18), dimLine(svg, nx + xs, ny - 18, nx + NW - xs, ny - 18), dimLine(svg, nx + NW - xs, ny - 18, nx + NW, ny - 18)];
    const dimR = dimLine(svg, nx + NW + 22, ny + xs, nx + NW + 22, ny + NH - xs);
    [dimB, dimL, ...dimT, dimR].forEach((e) => (e.style.opacity = 0));
    const tl = [lab(T('x'), nx + xs / 2, ny - 34, 'x'), lab(T(`${d.L}-2x`), nx + NW / 2, ny - 36, 'b'), lab(T('x'), nx + NW - xs / 2, ny - 34, 'x')];
    const wl = lab(T(`${d.Wd}-2x`), nx + NW + 66, ny + NH / 2, 'b');
    // the folded box (oblique view, same scale)
    const bl = (d.L - 2 * X) * sc, bd = (d.Wd - 2 * X) * sc, bh = xs, dx = bd * 0.45, dy = bd * 0.3, bx = W - bl - dx - 60, by = 230;
    const g3 = svgEl('g', { class: 'u6-box3' }); g3.style.opacity = 0; svg.appendChild(g3);
    const pth = (pts, cls) => g3.appendChild(svgEl('path', { d: 'M ' + pts.map((p) => p.join(' ')).join(' L ') + ' Z', class: cls }));
    pth([[bx, by - bh], [bx + bl, by - bh], [bx + bl + dx, by - bh - dy], [bx + dx, by - bh - dy]], 'inside');
    pth([[bx + dx, by - bh - dy], [bx + dx, by - bh], [bx, by - bh]], 'back');
    pth([[bx + bl, by], [bx + bl + dx, by - dy], [bx + bl + dx, by - dy - bh], [bx + bl, by - bh]], 'side');
    pth([[bx, by], [bx + bl, by], [bx + bl, by - bh], [bx, by - bh]], 'front');
    const bL = lab(T(`${d.L}-2x`), bx + bl / 2, by + 20, 'b'), bW = lab(T(`${d.Wd}-2x`), bx + bl + dx / 2 + 44, by - dy / 2 + 6, 'b'), bH = lab(T('x'), bx - 16, by - bh / 2, 'x');
    const bt = lab('<span class="u6-head">the open box</span>', bx + (bl + dx) / 2, by - bh - dy - 22);
    const lw = mul(P(`${d.L}-2x`), P(`${d.Wd}-2x`)), V = mul(P('x'), lw), fo = P(`${d.L}-2x`).flatMap((s) => P(`${d.Wd}-2x`).map((t) => mulT(s, t)));
    const rx = 40, L = [0, 1, 2, 3].map((j) => { const e = add(stage, h('div', 'u6-mid l' + (j === 2 ? ' u6-fin' : '')), rx, 340 + j * 37); e.style.opacity = 0; return e; });
    const [a, b, c3] = sortP(V).map((t) => t.c), val = (d.L - 2 * X) * (d.Wd - 2 * X) * X;
    dimB.style.opacity = dimL.style.opacity = 1;
    return [{
      cap: `Cut an ${T('x')}-by-${T('x')} square from <b>each</b> corner (shaded). The solid lines are the cuts.`,
      run: (c) => Promise.all([...net.cuts.map((e, i) => c.anim(e, [{ opacity: 0 }, { opacity: 1 }], 300, { delay: i * 120 })), ...xl.map((e) => c.fadeIn(e, 300, { delay: 400 }))])
    }, {
      cap: `Remove the four squares. What’s left folds up along the <b>dashed</b> lines.`,
      run: async (c) => {
        await Promise.all([c.anim(net.sheet, [{ opacity: 1 }, { opacity: 0 }], 400), show(c, net.net, 400)]);
        net.cuts.forEach((e) => e.classList.add('gone'));
        await Promise.all([...net.cuts.map((e) => c.anim(e, [{ opacity: 1 }, { opacity: 0.8 }], 300)), show(c, net.fold, 500)]);
      }
    }, {
      cap: `Each long side loses ${T('x')} at <b>both</b> ends: length ${T(`${d.L}-2x`)}. Each short side: width ${T(`${d.Wd}-2x`)}.${d.tag ? ' <b>Example 12(a): B.</b>' : ''}`,
      run: (c) => Promise.all([...dimT.map((e) => show(c, e, 300)), show(c, dimR, 300), ...tl.map((e, i) => c.fadeIn(e, 300, { delay: 200 + i * 120 })), c.fadeIn(wl, 300, { delay: 600 })])
    }, {
      cap: `Fold the flaps up. They are ${T('x')} tall, so the box’s <b>height is ${T('x')}</b>.`,
      run: (c) => Promise.all([show(c, g3, 500), c.fadeIn(bL, 300, { delay: 300 }), c.fadeIn(bW, 300, { delay: 400 }), c.fadeIn(bH, 300, { delay: 500 }), c.fadeIn(bt, 300)])
    }, {
      cap: `${T(`V=lwh=x(${d.L}-2x)(${d.Wd}-2x)`)}. Multiply two factors first: ${T(`(${d.L}-2x)(${d.Wd}-2x)=${ptex(lw)}`)}.`,
      run: (c) => { L[0].innerHTML = T(`V=x(${d.L}-2x)(${d.Wd}-2x)`); L[1].innerHTML = T(`(${d.L}-2x)(${d.Wd}-2x)=${rawTex(fo)}=${ptex(lw)}`); return Promise.all([c.fadeIn(L[0]), c.fadeIn(L[1], 350, { delay: 300 })]); }
    }, {
      cap: `Then times ${T('x')}: ${T('V=' + ptex(V))}.${d.tag ? ` So ${T(`a=${a},\\ c=${c3}`)}: <b>Example 12(b): a + c = ${a + c3}</b>.` : ''}`,
      run: (c) => { L[2].innerHTML = T(`V=x(${ptex(lw)})=${ptex(V)}`); return c.fadeIn(L[2]); }
    }, {
      cap: `Check at ${T('x=2')}: the box is ${T(`${d.L - 4}\\times${d.Wd - 4}\\times2=${val}`)} cm³, and ${T(`${a}(8)${b < 0 ? '' : '+'}${b}(4)+${c3}(2)=${val}`)} ✓ Same number.`,
      run: (c) => { L[3].innerHTML = T(`x=2:\\ ${d.L - 4}\\times${d.Wd - 4}\\times2=${val}=${a}(8)${b}(4)+${c3}(2)\\ \\checkmark`); return c.fadeIn(L[3]); }
    }];
  }
};

/* ============ 10. Three students, three errors ============ */
const RIGHT = ['6(3y-2)^2', '=6(9y^2-12y+4)', '=54y^2-72y+24'];
const STU = {
  priya: {
    name: 'Priya', lines: ['6(3y-2)^2', '=(18y-12)^2', '=324y^2-432y+144'], last: 'arrow',
    c2: `Line 2: Priya multiplied the 6 into the bracket <b>before squaring</b>. The exponent belongs to ${T('(3y-2)')} only: <b>square first</b>, then multiply by 6.`,
    n2: `${T('6(3y-2)^2')} is ${T('6\\times(3y-2)^2')}, not ${T('(6(3y-2))^2')}`,
    c3: `Her line 3 is correct algebra for ${T('(18y-12)^2')} — from the wrong start. Since ${T('(18y-12)^2=36(3y-2)^2')}, her answer is <b>6 times too big</b>.`,
    n3: `At ${T('y=-3')}: ${T('(18(-3)-12)^2=4\\,356')}, but ${T('6(3(-3)-2)^2=726')}. And ${T('4\\,356=6\\times726')}.`
  },
  marcus: {
    name: 'Marcus', lines: ['6(3y-2)^2', '=6(6y^2-12y+4)', '=36y^2-72y+24'], last: 'arrow',
    c2: `Line 2: the first term should be ${T('(3y)^2=9y^2')}. Marcus wrote ${T('6y^2')}: he <b>doubled</b> the 3 instead of <b>squaring</b> it. His ${T('-12y')} and ${T('+4')} are right.`,
    n2: `${T('(3y)^2=3y\\cdot3y=9y^2')} &nbsp;not&nbsp; ${T('2\\cdot3y^2=6y^2')}`,
    c3: `He distributed the 6 correctly, but the error rides along: ${T('6\\cdot6y^2=36y^2')} should be ${T('6\\cdot9y^2=54y^2')}.`,
    n3: `Only the ${T('y^2')} term is wrong: ${T('36y^2')} instead of ${T('54y^2')}.`
  },
  devon: {
    name: 'Devon', lines: ['6(3y-2)^2', '=6(9y^2-6y+4)', '=54y^2-36y+24'], last: 'arrow', grid: true,
    c2: `Line 2: the middle term should be ${T('2(3y)(-2)=-12y')}. Devon wrote ${T('-6y')}: he <b>forgot the factor 2</b>. One of the two ${T('-6y')} rectangles is missing.`,
    n2: `Middle term = 2 × first × last: ${T('2(3y)(-2)=-12y')}`,
    c3: `So ${T('6(-6y)=-36y')} should be ${T('6(-12y)=-72y')}. His ${T('54y^2')} and ${T('24')} are right.`,
    n3: `Only the middle term is wrong: ${T('-36y')} instead of ${T('-72y')}.`
  }
};
const students = {
  title: 'Find the error: Priya, Marcus and Devon',
  height: 430,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ sep: 'Example 13 check:' }, { v: 'priya', label: '(a) Priya' }, { v: 'marcus', label: '(b) Marcus' }, { v: 'devon', label: '(c) Devon' }, { v: 'fix', label: '(d)–(e) correct + check' }],
  value: 'priya',
  intro: (v) => (v === 'fix' ? `Example 13(d) and (e): expand ${T('6(3y-2)^2')} the right way, then <b>check</b> it by substituting ${T('y=-3')}.` : `${STU[v].name} expanded ${T('6(3y-2)^2')}. Exactly one step is wrong. Which one, and why?`),
  make(stage, v, ex) {
    const W = ex.W, cw = (W - 64) / 2, cx = [20, 44 + cw], ly = [92, 150, 208];
    const isFix = v === 'fix', d = STU[v];
    const heads = isFix ? ['Square first, then the 6', `Check: ${T('y=-3')}`] : [`${d.name}’s work`, 'Correct work'];
    const cards = cx.map((x, i) => { const e = add(stage, h('div', 'u6-nb' + (i || isFix ? '' : ' who'), `<div class="u6-nbh">${heads[i]}</div>`), x, 14); box(e, cw, 236); e.style.opacity = 0; return e; });
    const colL = isFix ? RIGHT : d.lines, colR = isFix ? ['\\text{LS}=6(3(-3)-2)^2', '=6(-11)^2=6(121)=726', '\\text{RS}=54(9)-72(-3)+24=726'] : RIGHT;
    const mkL = (s, x, y) => { const e = add(stage, h('div', 'u6-nl'), x, y); e.innerHTML = T(s); e.style.opacity = 0; return e; };
    const left = colL.map((s, i) => mkL(s, cx[0] + 18, ly[i])), right = colR.map((s, i) => mkL(s, cx[1] + 18, ly[i]));
    if (!isFix) { cards[0].style.opacity = 1; left.forEach((e) => (e.style.opacity = 1)); }
    const marks = ly.map((y) => { const e = add(stage, h('div', 'u6-nmark'), cx[0] + cw - 40, y); e.style.opacity = 0; return e; });
    const note = add(stage, h('div', 'u6-note'), 20, 272); note.style.width = (W - 40) + 'px'; note.style.opacity = 0;
    const mark = (c, i, kind) => { marks[i].className = 'u6-nmark ' + (kind === 'ok' ? 'ok' : 'no'); marks[i].textContent = kind === 'ok' ? '✓' : kind === 'arrow' ? '⚠' : '✗'; return c.pop(marks[i], 340); };
    if (isFix) {
      return [
        { cap: `<b>Square first</b>: ${T('(3y-2)^2=9y^2-12y+4')} — the middle term is ${T('2(3y)(-2)=-12y')}.`, run: (c) => Promise.all([show(c, cards[0]), c.fadeIn(left[0]), c.fadeIn(left[1], 350, { delay: 300 })]) },
        { cap: `Then distribute the 6: ${T('6(9y^2-12y+4)=54y^2-72y+24')}. <b>Example 13(d).</b>`, run: (c) => { left[2].classList.add('good'); return c.fadeIn(left[2]); } },
        { cap: `Check at ${T('y=-3')}. Left side, the original: ${T('6(3(-3)-2)^2=6(-11)^2=6(121)=726')}.`, run: (c) => Promise.all([show(c, cards[1]), c.fadeIn(right[0]), c.fadeIn(right[1], 350, { delay: 300 })]) },
        {
          cap: `Right side, the expansion: ${T('54(9)-72(-3)+24=486+216+24=726')}. Same number: the expansion is verified. <b>Example 13(e).</b>`,
          run: (c) => { right[2].classList.add('good'); note.className = 'u6-note ok'; note.innerHTML = `${T('\\text{LS}=\\text{RS}=726')} ✓ &nbsp; At ${T('y=-3')} the three students get 4 356, 564 and 618 — the check catches all three errors.`; return Promise.all([c.fadeIn(right[2]), c.fadeIn(note, 400, { delay: 300 })]); }
        }
      ];
    }
    // Devon's missing rectangle, drawn as a little box-method grid inside the note area
    const gEls = [];
    if (d.grid) {
      const gx = W - 300, gy = 266, a = 92, b = 50;
      [[gx, gy, a, a, 'p2', '9y^2'], [gx + a, gy, b + 40, a, 'pn', '-6y'], [gx, gy + a, a, b, 'miss', '-6y'], [gx + a, gy + a, b + 40, b, 'p0', '+4']].forEach(([x, y, w, hh, cls, t]) => {
        const e = add(stage, h('div', 'u6-pc ' + cls, T(t)), x, y); box(e, w, hh); e.style.fontSize = '21px'; e.style.opacity = 0; gEls.push(e);
      });
    }
    return [
      { cap: `Put a correct solution beside ${d.name}’s work and compare them <b>line by line</b>. Line 1 is just the question.`, run: (c) => Promise.all([show(c, cards[1]), c.fadeIn(right[0], 300, { delay: 200 }), mark(c, 0, 'ok')]) },
      {
        cap: d.c2,
        run: async (c) => {
          left[1].classList.add('bad'); note.innerHTML = d.n2; if (d.grid) note.style.width = (W - 350) + 'px';
          await c.fadeIn(right[1], 350);
          await Promise.all([mark(c, 1, 'no'), c.shake(left[1]), c.fadeIn(note, 350), ...gEls.map((e, i) => c.pop(e, 340, { delay: 200 + i * 120 }))]);
        }
      },
      {
        cap: d.c3,
        run: async (c) => { note.innerHTML = d.n3; await Promise.all([c.fadeIn(right[2], 350), flash(c, note)]); await mark(c, 2, d.last); }
      }
    ];
  }
};

/* ============ static figures in the example cards ============ */
function figTiles(host, top, side) {
  const X = 84, U = 25, G = 3, tl = tileList(P(top)), sl = tileList(P(side)), len = (k) => (k === 1 ? X : U), ox = 60, oy = 50;
  const colX = [], rowY = []; let x = ox; tl.forEach((t) => { colX.push(x); x += len(t.k) + G; }); const RW = x - ox - G;
  let y = oy; sl.forEach((t) => { rowY.push(y); y += len(t.k) + G; }); const RH = y - oy - G;
  box(host, ox + RW + 30, oy + RH + 20);
  box(add(host, h('div', 'u6-frame-l'), ox - U - 26, oy - 6), RW + U + 44, 4); box(add(host, h('div', 'u6-frame-l'), ox - 6, oy - U - 26), 4, RH + U + 44);
  tl.forEach((t, j) => mkTile(host, t.k, t.neg, colX[j], oy - 10 - U, len(t.k), U));
  sl.forEach((t, i) => mkTile(host, t.k, t.neg, ox - 10 - U, rowY[i], U, len(t.k)));
  sl.forEach((s, i) => tl.forEach((t, j) => mkTile(host, s.k + t.k, s.neg !== t.neg, colX[j], rowY[i], len(t.k), len(s.k))));
}
function figFrame(host) {
  const x0 = 140, y0 = 40, RW = 330, RH = 190, hs = 96;
  box(host, 620, 270);
  box(add(host, h('div', 'u6-frm'), x0, y0), RW, RH);
  box(add(host, h('div', 'u6-hole'), x0 + RW / 2 - hs / 2, y0 + RH / 2 - hs / 2), hs, hs);
  add(host, h('div', 'u6-mid c', `length ${T('=3x+5')}`), x0 + RW / 2, y0 - 20);
  const w = add(host, h('div', 'u6-mid c', `width ${T('=2x+6')}`), x0 - 26, y0 + RH / 2); w.style.rotate = '-90deg';
  add(host, h('div', 'u6-mid c', `side of square ${T('=x+2')}`), x0 + RW / 2, y0 + RH + 24);
}
function figNet(host) {
  const sc = 26, xs = 2 * sc, NW = 15 * sc, NH = 9 * sc, nx = 120, ny = 20;
  box(host, 720, NH + 90);
  const svg = add(host, svgEl('svg', { class: 'fig-svg', width: 720, height: NH + 90 }), 0, 0);
  drawNet(svg, nx, ny, NW, NH, xs).sheet.remove();
  dimLine(svg, nx, ny + NH + 34, nx + NW, ny + NH + 34); dimLine(svg, nx - 34, ny, nx - 34, ny + NH);
  const t = (s, x, y, cls) => { const e = svgEl('text', { x, y, class: 'u6-dimt' + (cls ? ' ' + cls : '') }); e.textContent = s; svg.appendChild(e); return e; };
  const bg = (x, y, w) => svg.insertBefore(svgEl('rect', { x: x - w / 2, y: y - 13, width: w, height: 26, fill: '#fff' }), svg.lastChild);
  t('15', nx + NW / 2, ny + NH + 34); bg(nx + NW / 2, ny + NH + 34, 34);
  t('9', nx - 34, ny + NH / 2); bg(nx - 34, ny + NH / 2, 22);
  t('x', nx + xs / 2, ny + NH + 14, 'x'); t('x', nx - 12, ny + NH - xs / 2, 'x');
  const lg = add(host, h('div', 'u6-sm', '<b>solid</b>: cut<br><b>dashed</b>: fold<br><span class="muted">shaded squares are removed</span>'), nx + NW + 26, ny + NH / 2 - 36); lg.style.lineHeight = '1.4';
}

/* ============ wiring ============ */
const explainers = [];
function mountExplainers() {
  const defs = { classify, zeroPairs, tileMul, foil, audit, square, frame, groups, grid, three, complete, box: boxEx, students };
  document.querySelectorAll('[data-explainer]').forEach((el) => explainers.push(new Explainer(el, defs[el.dataset.explainer])));
  // KaTeX fonts arrive after the first build; redraw untouched explainers so measured widths are right.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => explainers.forEach((e) => { if (!e.running && e.k === 0) e.build(0); }));
}
function mountFigures() {
  const f3 = document.getElementById('fig-ex3'); if (f3) figTiles(f3, '3x', 'x-2');
  const f7 = document.getElementById('fig-ex7'); if (f7) figFrame(f7);
  const f12 = document.getElementById('fig-ex12'); if (f12) figNet(f12);
}
function mountNR() {
  document.querySelectorAll('.nr-b[data-nr]').forEach((el) => { const s = el.dataset.nr; for (let i = 0; i < 4; i++) el.appendChild(h('i', null, s[i] ? `<span>${s[i]}</span>` : '')); });
}
function mountWarmup() {
  const ms = document.getElementById('ms'); if (!ms) return;
  ms.querySelectorAll('button.ms-cell').forEach((b) => b.addEventListener('click', () => b.classList.toggle('open')));
  const fill = document.querySelector('[data-fill]');
  if (fill) fill.addEventListener('click', () => { ms.querySelectorAll('.num button.ms-cell').forEach((b, i) => setTimeout(() => b.classList.add('open'), i * 160)); document.getElementById('wq2').classList.add('on'); });
  const x2 = document.querySelector('[data-x2]'), note = document.getElementById('ms-note');
  if (x2) x2.addEventListener('click', () => {
    const on = ms.classList.toggle('x2'); x2.textContent = on ? 'Hide x = 2' : 'Put x = 2';
    note.innerHTML = on ? 'At <b>x = 2</b>: rows 2 + 10 + 3, 6 + 5 + 4, 7 + 0 + 8 — every line is <b>15</b>.' : '&nbsp;';
  });
}
function mountDeck() {
  const deck = document.querySelector('.rg-deck'); if (!deck) return;
  const cards = [...deck.querySelectorAll('.rg')];
  cards.forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
  const all = document.querySelector('[data-deckall]');
  if (all) all.addEventListener('click', () => { const on = !cards.every((b) => b.classList.contains('on')); cards.forEach((b, i) => setTimeout(() => b.classList.toggle('on', on), on ? i * 80 : 0)); all.textContent = on ? 'Show all rules' : 'Show all examples'; });
}
function mountReveals() {
  document.querySelectorAll('[data-rv]').forEach((b) => b.addEventListener('click', () => { const t = document.getElementById(b.dataset.rv); if (t) t.classList.toggle('on'); }));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

mountExplainers(); mountFigures(); mountNR(); mountWarmup(); mountDeck(); mountReveals();

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
const suNz = (r, lo, hi) => { let v = 0; while (!v) v = r.int(lo, hi); return v; };
const suH = (list) => suSeq(list).replace(/[+-]/g, (m) => (m === '-' ? ' − ' : ' + ')).replace(/[a-z]/g, (c) => '<i>' + c + '</i>'); // a written list as HTML words
const suLab = (x, y, s, anchor = 'middle', size = 21) => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-family="KaTeX_Main, 'Times New Roman', serif" fill="#1c2230">${String(s).replace(/[+-]/g, (m) => (m === '-' ? ' − ' : ' + ')).replace(/[a-z]/g, (c) => `<tspan font-style="italic">${c}</tspan>`)}</text>`;
function suHoleFig(W, H, S, R) { // a W by H rectangle with an S by R hole (S = R: a square) in its interior
  const x0 = 110, y0 = 26, w = 270, h = 180, hw = 104, hh = S === R ? 104 : 80, hx = x0 + 120, hy = y0 + (h - hh) / 2;
  return `<svg viewBox="0 0 470 250" width="470" height="250" role="img" aria-label="A ${W} by ${H} rectangle with a ${S} by ${R} piece cut out of its interior">
    <rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#cfe7e3" stroke="#0f5f5a" stroke-width="2.2"/>
    <rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" fill="#fff" stroke="#0f5f5a" stroke-width="2"/>
    ${suLab(x0 + w / 2, y0 + h + 30, W)}${suLab(x0 - 12, y0 + h / 2 + 7, H, 'end')}
    ${suLab(hx + hw / 2, hy + 28, S, 'middle', 19)}${S === R ? '' : suLab(hx + 8, hy + hh / 2 + 14, R, 'start', 19)}
  </svg>`;
}
function suTriFig(L) { // an isosceles right triangle PQR, right angle at Q
  const qx = 120, qy = 210, s = 170;
  return `<svg viewBox="0 0 420 260" width="420" height="260" role="img" aria-label="An isosceles right triangle PQR with legs PQ and QR of length ${L}">
    <path d="M${qx} ${qy - s}L${qx} ${qy}L${qx + s} ${qy}Z" fill="#cfe7e3" stroke="#0f5f5a" stroke-width="2.2"/>
    <path d="M${qx} ${qy - 18}h18v18" fill="none" stroke="#0f5f5a" stroke-width="1.6"/>
    ${suLab(qx - 12, qy - s / 2 + 7, L, 'end')}${suLab(qx + s / 2, qy + 30, L)}
    <text x="${qx - 6}" y="${qy - s - 8}" font-size="19" font-style="italic" font-family="KaTeX_Main, serif" fill="#1c2230">P</text>
    <text x="${qx - 22}" y="${qy + 20}" font-size="19" font-style="italic" font-family="KaTeX_Main, serif" fill="#1c2230">Q</text>
    <text x="${qx + s + 6}" y="${qy + 20}" font-size="19" font-style="italic" font-family="KaTeX_Main, serif" fill="#1c2230">R</text>
  </svg>`;
}
const suFull = (A, B) => { const parts = suParts(A, B); return suPar(A) + suPar(B) + '=' + suSeq(parts) + '=' + suTex(suP(parts)); };

standup('u3l6', {
  intro: 'Review at your whiteboard station: work it out fully, then check every sign and exponent before you call it done.',
  levels: {
    /* degree of a polynomial; expand (x ± a)(x ± b); a monomial times a binomial */
    BEG: (r) => {
      const kind = r.pick(['deg', 'two', 'two', 'mono']);
      if (kind === 'deg') {
        const [u, w] = r.pick([['m', 'n'], ['x', 'y'], ['a', 'b']]);
        for (;;) {
          const ts = [suM(suNz(r, -9, 9), { [u]: r.int(1, 5), [w]: r.int(1, 4) }), suM(suNz(r, -9, 9), r.pick([u, w, 'p']), r.int(2, 7))];
          if (r.chance(0.5)) ts.push(suM(suNz(r, -9, 9)));
          const degs = ts.map((t) => suDeg(suOne(t)[1])), top = Math.max(...degs);
          if (degs.filter((d) => d === top).length > 1) continue;
          const order = r.shuffle(ts.map((t, i) => i));
          return {
            text: 'Find the <b>degree</b> of the polynomial.',
            q: suSeq(order.map((i) => ts[i])),
            a: [order.map((i) => { const [c, k] = suOne(ts[i]), e = suExp(k), ps = Object.keys(e).sort().map((v) => e[v]); return suTerm(c, k, true) + ':\\ ' + (ps.length > 1 ? ps.join('+') + '=' : '') + degs[i]; }).join(',\\qquad '),
              '\\text{the highest: degree } ' + top]
          };
        }
      }
      const v = r.pick(['x', 'x', 'y', 'b', 'm']);
      if (kind === 'mono') { // −kxⁿ(axᵐ ± b)
        const k = r.int(2, 9) * (r.chance(0.7) ? -1 : 1), n = r.int(1, 3), A = [suM(k, v, n)], B = r.chance(0.5) ? [suM(r.int(1, 6), v, r.int(1, 3)), suM(suNz(r, -9, 9))] : [suM(r.int(1, 9)), suM(r.int(1, 6) * r.sign(), v)];
        const parts = suParts(A, B);
        return { text: 'Expand.', q: suTerm(k, suKey({ [v]: n }), true) + suPar(B), a: ['=' + B.map((t) => '(' + suTex(A[0]) + ')(' + suTex(t) + ')').join('+'), '=' + suSeq(parts)] };
      }
      for (;;) {
        const a = suNz(r, -9, 9), b = suNz(r, -9, 9); if (a + b === 0) continue;
        const A = suL(v, 1, a), B = suL(v, 1, b);
        return { text: 'Expand and simplify.', q: suPar(A) + suPar(B), a: [suPar(A) + suPar(B) + '=' + suSeq(suParts(A, B)), '=' + suTex(suP(suParts(A, B)))] };
      }
    },
    /* P − Q − R from a polynomial out of order; a rectangle with sides (a − x)(b − x); how many terms are left */
    PRG: (r) => {
      const kind = r.pick(['pqr', 'pqr', 'rect', 'count']), v = r.pick(['x', 'x', 'y', 'b', 'n']);
      if (kind === 'pqr') {
        const d = r.int(3, 6), e2 = r.int(1, d - 1), lc = suNz(r, -9, 9), mc = suNz(r, -9, 9), ct = suNz(r, -20, 20);
        const ts = [suM(lc, v, d), suM(mc, v, e2), suM(ct)], w = r.pick([[1, 2, 0], [2, 0, 1], [1, 0, 2], [2, 1, 0]]).map((i) => ts[i]);
        const W = (x) => (x < 0 ? '(' + x + ')' : String(x));
        const ex = r.pick([['P-Q-R', '<i>P</i> − <i>Q</i> − <i>R</i>', W(lc) + '-' + d + '-' + W(ct), lc - d - ct], ['P+Q+R', '<i>P</i> + <i>Q</i> + <i>R</i>', W(lc) + '+' + d + '+' + W(ct), lc + d + ct],
          ['PR-Q', '<i>PR</i> − <i>Q</i>', '(' + lc + ')(' + ct + ')-' + d, lc * ct - d], ['Q-P-R', '<i>Q</i> − <i>P</i> − <i>R</i>', d + '-' + W(lc) + '-' + W(ct), d - lc - ct]]);
        const sub = ex[2];
        return {
          text: `The polynomial has leading coefficient <i>P</i>, degree <i>Q</i> and constant term <i>R</i>. Find the value of ${ex[1]}.`,
          q: suSeq(w),
          a: ['\\text{descending: }\\ ' + suSeq(ts) + ',\\quad P=' + lc + ',\\ Q=' + d + ',\\ R=' + ct, ex[0] + '=' + sub + '=' + ex[3]]
        };
      }
      if (kind === 'rect') {
        for (;;) {
          const a = r.int(2, 12), b = r.int(2, 12); if (a === b) continue;
          const A = [suM(a), suM(-1, v)], B = [suM(b), suM(-1, v)], parts = suParts(A, B), res = suP(parts);
          const asc = suKeys(res).reverse().map((k, i) => suTerm(res[k], k, i === 0)).join('');
          return {
            text: `A rectangle has length (${suH(A)}) mm and width (${suH(B)}) mm. Write its area as a simplified polynomial.`,
            q: 'A=' + suPar(A) + suPar(B),
            a: ['=' + suSeq(parts), '=' + asc + '\\ \\text{mm}^2']
          };
        }
      }
      const m = r.int(2, 7), n = r.int(1, 9), k2 = r.pick(['sd', 'sd', 'sq', 'sq', 'gen']);
      const A = [suM(m, v), suM(-n)], B = k2 === 'sd' ? [suM(m, v), suM(n)] : k2 === 'sq' ? A : [suM(m, v), suM(n + r.int(1, 3))];
      const parts = suParts(A, B), res = suP(parts), nt = Object.keys(res).length;
      return {
        text: 'Expand and simplify. How many terms are left?',
        q: k2 === 'sq' ? suPar(A) + '^2' : r.chance(0.5) ? suPar(A) + suPar(B) : suPar(B) + suPar(A),
        a: ['=' + suSeq(parts) + '=' + suTex(res)],
        atext: '<b>' + nt + ' terms</b>' + (nt === 2 ? ' — the outer and inner products are opposites, so they cancel (a difference of squares).' : ' — the outer and inner products don’t cancel.')
      };
    },
    /* whole − hole with a figure; half of a square for an isosceles right triangle */
    MAS: (r) => {
      const v = r.pick(['x', 'x', 'x', 'n']);
      if (r.chance(0.35)) { // ½(mx + n)² with m, n even
        const m = r.pick([2, 2, 4]), n = 2 * r.int(1, 6), L = [suM(m, v), suM(n)], sq = suP(suParts(L, L)), res = suMul(sq, suM(0.5));
        const ask = r.pick(['a', 'b', 'c']), val = res[{ a: v + '2', b: v + '1', c: '' }[ask]];
        return {
          text: `Triangle <i>PQR</i> is isosceles and right-angled at <i>Q</i>, with legs <i>PQ</i> = <i>QR</i> = ${suH(L)} cm. Its area can be written as <i>a${v}</i>² + <i>b${v}</i> + <i>c</i> cm². Find the value of <i>${ask}</i>.`,
          q: 'PQ=QR=' + suSeq(L),
          fig: suTriFig(suSeq(L)),
          a: ['A=\\tfrac12' + suPar(L) + '^2=\\tfrac12(' + suTex(sq) + ')', '=' + suTex(res) + ',\\quad ' + ask + '=' + val]
        };
      }
      for (;;) {
        const sqHole = r.chance(0.6), a = r.int(2, 4), b = r.int(1, 8), c = r.int(2, 3), d = r.int(1, 8), e = r.int(1, 4), f = r.int(1, 4);
        const O1 = suL(v, a, b), O2 = suL(v, c, d), H1 = suL(v, 1, e), H2 = sqHole ? H1 : suL(v, 1, f);
        if ((!sqHole && e === f) || e >= b || e >= d || (!sqHole && (f >= b || f >= d))) continue; // the hole fits inside for every x > 0
        const outer = suP(suParts(O1, O2)), hole = suP(suParts(H1, H2)), res = suAdd(outer, suMul(suM(-1), hole));
        return {
          q: '', // the question is in the words and the figure
          text: sqHole ? `A (${suH(O1)}) mm by (${suH(O2)}) mm rectangle has a square of side (${suH(H1)}) mm cut out of its interior. Write the area of the shaded region in the form <i>a${v}</i>² + <i>b${v}</i> + <i>c</i>.`
            : `A (${suH(O1)}) mm by (${suH(O2)}) mm rectangle has a (${suH(H1)}) mm by (${suH(H2)}) mm rectangle cut out of its interior. Write the area of the shaded region in the form <i>a${v}</i>² + <i>b${v}</i> + <i>c</i>.`,
          fig: suHoleFig(suSeq(O1), suSeq(O2), suSeq(H1), suSeq(H2)),
          a: ['\\text{whole: } ' + suFull(O1, O2), '\\text{hole: } ' + (sqHole ? suPar(H1) + '^2=' + suTex(hole) : suFull(H1, H2)), '(' + suTex(outer) + ')-(' + suTex(hole) + ')=' + suTex(res) + '\\ \\text{mm}^2']
        };
      }
    }
  }
});
