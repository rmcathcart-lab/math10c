/* Math 10C · Unit 4 · Lesson 8 — Unit 4 Review: Factoring (AN5). The explainers, figures and widgets.
 * A review lesson laid out like the unit test. Four compact recap explainers carry the whole unit:
 *   flow   — the Lesson 6 checklist as a flowchart that lights up the path for each expression, with the work beside it
 *   tiles  — a trinomial's tiles arranged into a rectangle (zero pairs added when needed); the sides are the factors
 *   box    — decomposition and the 2 × 2 area box for ax² + bx + c, and why the pair multiplies to ac
 *   bvals  — every middle term b that lets x² + bx + c factor (the factor-pair sums of c)
 * plus the Memory Match warm-up game, the toolbox deck, and the figures in the question cards. */
import { h, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const T = (s) => tex(s);
const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const box = (el, w, hh) => { el.style.width = w + 'px'; el.style.height = hh + 'px'; return el; };
const hide = (...els) => els.forEach((e) => (e.style.opacity = 0));
const show = (c, el, ms = 380, o = {}) => c.anim(el, [{ opacity: 0 }, { opacity: 1 }], ms, o);
const flash = (c, el) => c.anim(el, [{ opacity: 0.15 }, { opacity: 1 }], 320);
const pulse = (c, el, s = 1.12) => c.anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], 420);
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
// shrink a one-line element's font until it fits maxW (KaTeX scales with font-size)
function fit(el, maxW) { const w = el.offsetWidth; if (w > maxW) { const fs = parseFloat(getComputedStyle(el).fontSize); el.style.fontSize = Math.floor(fs * maxW / w) + 'px'; } return el; }
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/* ---------- small algebra formatters ---------- */
const sgn = (k) => (k < 0 ? `-${-k}` : `+${k}`);                                   // +3 / -3
const mono = (c, v, p) => { if (p === 0) return String(c); const s = v + (p > 1 ? `^${p}` : ''); return c === 1 ? s : c === -1 ? '-' + s : c + s; };
const smono = (c, v, p) => { const m = mono(c, v, p); return m[0] === '-' ? m : '+' + m; };
const tri = (a, b, c, v = 'x') => mono(a, v, 2) + (b ? smono(b, v, 1) : '') + (c ? sgn(c) : '');
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };

/* ===================== 1. The checklist as a flowchart ===================== */
const FN = {
  gcf: { x: 300, y: 40, w: 400, h: 58, html: `<b>1 · Common factor?</b><small>Take it out first. Negative lead? Take out a negative.</small>` },
  bin: { x: 90, y: 148, w: 164, h: 80, html: `<b>2 terms</b>${T('A^2-B^2')}<small>sum of squares: stop</small>` },
  tri: { x: 300, y: 148, w: 196, h: 80, html: `<b>3 terms</b>${T('ax^2+bx+c')}<small>degrees 4, 2, 0: ${T('x^2')} block</small>` },
  four: { x: 524, y: 148, w: 160, h: 80, html: `<b>4 terms</b>grouping<small>pair up the terms</small>` },
  insp: { x: 196, y: 254, w: 178, h: 60, html: `<b>${T('a=1')}: inspection</b><small>product ${T('c')}, sum ${T('b')}</small>` },
  dec: { x: 400, y: 254, w: 212, h: 60, html: `<b>${T('a\\neq1')}: decomposition</b><small>watch for perfect squares</small>` },
  again: { x: 300, y: 324, w: 540, h: 42, html: `<b>Can any factor be factored again?</b>`, dash: true },
  exp: { x: 300, y: 384, w: 250, h: 40, html: `<b>Check by expanding ✓</b>` }
};
const NONE = 'none', YES = 'yes!';
const FLOW = {
  e1: { s: '-2x^2+10x+28', steps: [
    { n: 'gcf', b: T('-2'), l: '=-2(x^2-5x-14)', cap: `<b>Common factor first.</b> Every term is even and the leading coefficient is negative, so take out ${T('-2')}. Dividing by ${T('-2')} flips every sign inside the bracket.` },
    { n: 'tri', cap: `Three terms are left in the bracket: ${T('x^2-5x-14')}, with ${T('a=1')}.` },
    { n: 'insp', b: T('-7,\\ 2'), l: '=-2(x-7)(x+2)', cap: `<b>Inspection:</b> two integers with product ${T('-14')} and sum ${T('-5')}: ${T('-7')} and ${T('2')}.` },
    { n: 'again', b: 'no', bc: 'ok', cap: `Can ${T('x-7')} or ${T('x+2')} be factored again? No — the factoring is <b>complete</b>. Keep the ${T('-2')} out front!` },
    { n: 'exp', chk: ['(x-7)(x+2)=x^2-5x-14', '-2(x^2-5x-14)', '=-2x^2+10x+28'], cap: `<b>Check by expanding:</b> the brackets give ${T('x^2-5x-14')}, and multiplying by ${T('-2')} gives back ${T('-2x^2+10x+28')} ✓` }
  ] },
  e2: { s: '6x^2+7x-3', steps: [
    { n: 'gcf', b: NONE, bc: 'none', cap: `${T('\\gcd(6,7,3)=1')} and the constant term has no ${T('x')}: <b>no common factor</b>. Move on.` },
    { n: 'tri', cap: `Three terms, and ${T('a=6\\neq1')}.` },
    { n: 'dec', b: T('9,\\ -2'), l: '=6x^2+9x-2x-3', cap: `<b>Decomposition:</b> ${T('ac=6(-3)=-18')}. Product ${T('-18')}, sum ${T('7')}: ${T('9')} and ${T('-2')}. Split the middle term: ${T('7x=9x-2x')}.` },
    { n: 'dec', l: '=3x(2x+3)-1(2x+3)', cap: `Group in pairs: ${T('3x(2x+3)')} and ${T('-1(2x+3)')}. The same bracket appears twice…` },
    { n: 'dec', l: '=(2x+3)(3x-1)', cap: `…so it comes out as a common factor: ${T('(2x+3)(3x-1)')}.` },
    { n: 'again', b: 'no', bc: 'ok', cap: `Both brackets are linear — nothing factors further. <b>Complete.</b>` },
    { n: 'exp', chk: ['(2x+3)(3x-1)', '=6x^2-2x+9x-3', '=6x^2+7x-3'], cap: `<b>Check by expanding:</b> ${T('6x^2-2x+9x-3=6x^2+7x-3')} ✓` }
  ] },
  e3: { s: '16x^2-24x+9', steps: [
    { n: 'gcf', b: NONE, bc: 'none', cap: `${T('\\gcd(16,24,9)=1')}: <b>no common factor</b>.` },
    { n: 'tri', cap: `Three terms with ${T('a=16')}. Before decomposing, look at the first and last terms…` },
    { n: 'dec', b: 'perfect square', l: '=(4x-3)^2', cap: `${T('16x^2=(4x)^2')} and ${T('9=3^2')}, and the middle term is ${T('2(4x)(3)=24x')}: a <b>perfect square trinomial</b>. The middle sign is minus, so ${T('(4x-3)^2')}.` },
    { n: 'again', b: 'no', bc: 'ok', cap: `${T('4x-3')} won’t factor: <b>complete</b>. (Decomposition gets there too: ${T('ac=144')}, pair ${T('-12,\\ -12')}.)` },
    { n: 'exp', chk: ['(4x-3)^2=16x^2-12x-12x+9', '=16x^2-24x+9'], cap: `<b>Check by expanding:</b> ${T('(4x-3)(4x-3)=16x^2-24x+9')} ✓` }
  ] },
  e4: { s: 'x^4-13x^2+36', steps: [
    { n: 'gcf', b: NONE, bc: 'none', cap: `No factor is shared by all three terms (${T('36')} has no ${T('x')}, and ${T('\\gcd(1,13,36)=1')}).` },
    { n: 'tri', b: 'degrees 4, 2, 0', l: '\\text{let }u=x^2:\\ u^2-13u+36', lc: 'sub', cap: `Three terms with degrees <b>4, 2, 0</b>: a trinomial in disguise. Treat ${T('x^2')} as one block — let ${T('u=x^2')}.` },
    { n: 'insp', b: T('-4,\\ -9'), l: '=(x^2-4)(x^2-9)', cap: `<b>Inspection:</b> product ${T('36')}, sum ${T('-13')}: ${T('-4')} and ${T('-9')}. So ${T('(u-4)(u-9)')}; put ${T('x^2')} back for ${T('u')}.` },
    { n: 'again', b: YES, cap: `Check every bracket: ${T('x^2-4')} and ${T('x^2-9')} are both <b>differences of squares</b>. Loop back!` },
    { n: 'bin', l: '=(x-2)(x+2)(x-3)(x+3)', cap: `${T('A^2-B^2=(A-B)(A+B)')} — twice.` },
    { n: 'again', b: 'no', bc: 'ok', cap: `Every factor is linear now: <b>complete</b>. Four factors from one trinomial!` },
    { n: 'exp', chk: ['(x-2)(x+2)=x^2-4', '(x-3)(x+3)=x^2-9', '(x^2-4)(x^2-9)', '=x^4-13x^2+36'], cap: `<b>Check by expanding:</b> the pairs give ${T('x^2-4')} and ${T('x^2-9')}, and ${T('(x^2-4)(x^2-9)=x^4-9x^2-4x^2+36')} ✓` }
  ] },
  e5: { s: 'x^3+2x^2-9x-18', steps: [
    { n: 'gcf', b: NONE, bc: 'none', cap: `No factor is shared by all four terms (${T('-18')} has no ${T('x')}, and ${T('\\gcd(1,2,9,18)=1')}).` },
    { n: 'four', l: '=x^2(x+2)-9(x+2)', cap: `<b>Four terms: grouping.</b> Pair them up: ${T('x^2(x+2)')} and ${T('-9(x+2)')} — take out ${T('-9')}, not ${T('9')}, so the brackets match.` },
    { n: 'four', l: '=(x+2)(x^2-9)', cap: `The common bracket ${T('x+2')} comes out.` },
    { n: 'again', b: YES, cap: `Check every bracket: ${T('x^2-9')} is a difference of squares. Loop back!` },
    { n: 'bin', l: '=(x+2)(x-3)(x+3)', cap: `${T('x^2-9=(x-3)(x+3)')}.` },
    { n: 'again', b: 'no', bc: 'ok', cap: `Every factor is linear now: <b>complete</b>.` },
    { n: 'exp', chk: ['(x-3)(x+3)=x^2-9', '(x+2)(x^2-9)', '=x^3+2x^2-9x-18'], cap: `<b>Check by expanding:</b> ${T('(x+2)(x^2-9)=x^3-9x+2x^2-18')} ✓` }
  ] },
  r1: { s: '81a^4-16', steps: [
    { n: 'gcf', b: NONE, bc: 'none', cap: `${T('\\gcd(81,16)=1')}: <b>no common factor</b>.` },
    { n: 'bin', l: '=(9a^2-4)(9a^2+4)', cap: `Two terms: ${T('81a^4=(9a^2)^2')} and ${T('16=4^2')}. A <b>difference of squares</b>.` },
    { n: 'again', b: YES, cap: `Not finished! ${T('9a^2-4=(3a)^2-2^2')} is a difference of squares again. ${T('9a^2+4')} is a <b>sum</b> of squares — it stops there.` },
    { n: 'bin', l: '=(3a-2)(3a+2)(9a^2+4)', cap: `Factor ${T('9a^2-4')} and keep ${T('9a^2+4')}.` },
    { n: 'again', b: 'no', bc: 'ok', cap: `Now nothing factors again: <b>complete</b>.` },
    { n: 'exp', chk: ['(3a-2)(3a+2)=9a^2-4', '(9a^2-4)(9a^2+4)', '=81a^4-16'], cap: `<b>Check by expanding</b> ✓ — that’s Question 18.` }
  ] },
  r2: { s: '8x^4-12x^3+4x^2', steps: [
    { n: 'gcf', b: T('4x^2'), l: '=4x^2(2x^2-3x+1)', cap: `${T('\\gcd(8,12,4)=4')}, and the lowest power of ${T('x')} is ${T('x^2')}: take out ${T('4x^2')}.` },
    { n: 'tri', cap: `The bracket is a trinomial with ${T('a=2\\neq1')}.` },
    { n: 'dec', b: T('-2,\\ -1'), l: '=4x^2(2x-1)(x-1)', cap: `${T('ac=2')}: pair ${T('-2')} and ${T('-1')} (sum ${T('-3')}). ${T('2x^2-2x-x+1=2x(x-1)-1(x-1)=(2x-1)(x-1)')}.` },
    { n: 'again', b: 'no', bc: 'ok', cap: `Nothing factors again: <b>complete</b>. Keep the ${T('4x^2')}!` },
    { n: 'exp', chk: ['(2x-1)(x-1)=2x^2-3x+1', '4x^2(2x^2-3x+1)', '=8x^4-12x^3+4x^2'], cap: `<b>Check by expanding</b> ✓ — that’s Question 13(a).` }
  ] },
  r3: { s: '-3x^2+12x+36', steps: [
    { n: 'gcf', b: T('-3'), l: '=-3(x^2-4x-12)', cap: `Negative leading coefficient: take out ${T('-3')}, and every sign inside flips.` },
    { n: 'tri', cap: `Three terms, ${T('a=1')}.` },
    { n: 'insp', b: T('-6,\\ 2'), l: '=-3(x-6)(x+2)', cap: `<b>Inspection:</b> product ${T('-12')}, sum ${T('-4')}: ${T('-6')} and ${T('2')}.` },
    { n: 'again', b: 'no', bc: 'ok', cap: `Nothing factors again: <b>complete</b>.` },
    { n: 'exp', chk: ['(x-6)(x+2)=x^2-4x-12', '-3(x^2-4x-12)', '=-3x^2+12x+36'], cap: `<b>Check by expanding</b> ✓ — that’s Question 13(c).` }
  ] }
};
const flow = {
  title: 'The checklist, one expression at a time',
  height: 414,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar (otherwise "the work" column is squeezed to unreadable)
  value: 'e1',
  choices: [{ v: 'e1', label: T('-2x^2+10x+28') }, { v: 'e2', label: T('6x^2+7x-3') }, { v: 'e3', label: T('16x^2-24x+9') }, { v: 'e4', label: T('x^4-13x^2+36') }, { v: 'e5', label: T('x^3+2x^2-9x-18') },
    { sep: 'Review check:' }, { v: 'r1', label: T('81a^4-16') }, { v: 'r2', label: T('8x^4-12x^3+4x^2') }, { v: 'r3', label: T('-3x^2+12x+36') }],
  intro: (v) => `Factor ${T(FLOW[v].s)} completely. Start at the top of the checklist and watch the path light up.`,
  make(stage, v, ex) {
    const W = ex.W, d = FLOW[v], OX = 34, WX = OX + 612, WW = W - WX - 12;
    const svg = add(stage, svgEl('svg', { class: 'u48-svg', width: W, height: 414 }), 0, 0);
    const defs = svgEl('defs');
    [['u48ah-g', '#c9cfdb'], ['u48ah-a', '#c88c14']].forEach(([id, col]) => { const m = svgEl('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 13, markerHeight: 13, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' }); m.appendChild(svgEl('path', { d: 'M0,0 L10,5 L0,10 z', fill: col })); defs.appendChild(m); });
    svg.appendChild(defs);
    const N = {};
    for (const k in FN) { const f = FN[k]; const e = add(stage, h('div', 'u48-fn' + (f.dash ? ' dash' : ''), f.html), OX + f.x - f.w / 2, f.y - f.h / 2); box(e, f.w, f.h); N[k] = { ...f, x: OX + f.x, el: e, top: f.y - f.h / 2, bot: f.y + f.h / 2, left: OX + f.x - f.w / 2, right: OX + f.x + f.w / 2 }; }
    const E = {};
    const edge = (key, dd, cls = '') => { const p = svgEl('path', { d: dd, class: 'u48-fe ' + cls, 'marker-end': 'url(#u48ah-g)' }); svg.appendChild(p); E[key] = p; };
    const down = (a, b) => edge(a + '-' + b, `M${N[a].x},${N[a].bot} L${N[b].x},${N[b].top - 2}`);
    ['bin', 'tri', 'four'].forEach((b) => down('gcf', b)); ['insp', 'dec'].forEach((b) => down('tri', b));
    ['bin', 'insp', 'dec', 'four'].forEach((a) => edge(a + '-again', `M${N[a].x},${N[a].bot} L${N[a].x},${N.again.top - 2}`));
    down('again', 'exp');
    edge('loop', `M${N.again.left},${N.again.y} L14,${N.again.y} L14,${N.gcf.y} L${N.gcf.left - 2},${N.gcf.y}`, 'loop');
    const loopLab = add(stage, h('div', 'u48-floop', 'factor again'), 14, (N.again.y + N.gcf.y) / 2 + 6);
    loopLab.style.background = '#fbfaf6'; loopLab.style.padding = '0 4px';
    // the work panel
    box(add(stage, h('div', 'u48-wb'), WX, 10), WW, 394);
    add(stage, h('div', 'u48-head', 'The work'), WX + 14, 20);
    const lines = [], LY = (i) => 74 + i * 46;
    const first = add(stage, h('div', 'u48-wl', T(d.s)), WX + 14, LY(0)); fit(first, WW - 28); lines.push(first);
    const badges = {};
    let cur = null, li = 1;
    const light = (key) => { const e = E[key]; if (e) { e.classList.add('lit'); e.setAttribute('marker-end', 'url(#u48ah-a)'); } };
    return d.steps.map((s) => {
      let lineEl = null, chkEl = null, bEl = null;
      if (s.l) { lineEl = add(stage, h('div', 'u48-wl' + (s.lc ? ' ' + s.lc : ''), T(s.l)), WX + 14, LY(li++)); fit(lineEl, WW - 28); lineEl.style.opacity = 0; }
      if (s.chk) {
        chkEl = add(stage, h('div', 'u48-ok', s.chk.map((t) => T(t)).join('<br>') + ' ✓'), WX + 10, 0); chkEl.style.whiteSpace = 'nowrap'; chkEl.style.lineHeight = '1.42'; chkEl.style.fontSize = '20px';
        fit(chkEl, WW - 20); at(chkEl, WX + 10, 396 - chkEl.offsetHeight); chkEl.style.opacity = 0;
      }
      if (s.b) {
        const nd = N[s.n]; bEl = add(stage, h('div', 'u48-fbadge' + (s.bc ? ' ' + s.bc : ''), s.b), nd.right + 4, nd.top); bEl.style.opacity = 0;
        if (s.n === 'gcf') { at(bEl, nd.right + 10, nd.y); bEl.style.translate = '0 -50%'; }
      }
      return {
        cap: s.cap,
        run: async (c) => {
          const ps = [];
          if (s.n !== cur) {
            if (cur) { N[cur].el.classList.remove('on'); N[cur].el.classList.add('done'); }
            if (cur === 'again' && s.n !== 'exp') { light('loop'); light('gcf-' + s.n); }
            else if (cur) light(cur + '-' + s.n);
            N[s.n].el.classList.add('on'); N[s.n].el.classList.remove('done');
            ps.push(pulse(c, N[s.n].el, 1.05));
            cur = s.n;
          }
          if (bEl) { const old = badges[s.n]; if (old && old !== bEl) old.remove(); badges[s.n] = bEl; ps.push(c.pop(bEl, 340, { delay: 150 })); }
          if (lineEl) ps.push(c.fadeIn(lineEl, 380, { delay: 250, from: 'translate(-10px, 0)' }));
          if (chkEl) ps.push(c.fadeIn(chkEl, 420, { delay: 250 }));
          await Promise.all(ps);
          if (s.n === 'exp') { const last = stage.querySelectorAll('.u48-wl'); const fin = last[last.length - 1]; if (fin && !fin.classList.contains('sub')) fin.classList.add('fin'); }
        }
      };
    });
  }
};

/* ===================== 2. Tiles into a rectangle ===================== */
// p = number of unit columns to the right of the x²-tile (top side x + p), q = number of unit rows below it (side x + q).
const TL = {
  t1: { b: 5, c: 6, p: 3, q: 2 },
  t2: { b: 2, c: -8, p: 4, q: -2 },
  t3: { b: 0, c: -9, p: 3, q: -3 },
  t14: { b: 7, c: 10, p: 2, q: 5, q14: true }
};
const tilesEx = {
  title: 'Arrange the tiles into a rectangle',
  height: 350,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  value: 't1',
  choices: [{ v: 't1', label: T('x^2+5x+6') }, { v: 't2', label: T('x^2+2x-8') }, { v: 't3', label: T('x^2-9') }, { sep: 'Review check:' }, { v: 't14', label: T('x^2+7x+10') }],
  intro: (v) => { const d = TL[v]; return `The tiles for ${T(tri(1, d.b, d.c))}. Can they make one rectangle? Its side lengths will be the factors.`; },
  make(stage, v, ex) {
    const W = ex.W, d = TL[v], X = 100, U = 26, { b, c, p, q } = d, nP = Math.abs(p), nQ = Math.abs(q), nb = Math.abs(b), nc = Math.abs(c);
    const RX = W - 300, RY = 54, expr = tri(1, b, c), fact = `(x${sgn(p)})(x${sgn(q)})`;
    const mk = (k, neg, x, y, w, hh, hidden) => { const e = add(stage, h('div', `u48-t k${k}${neg ? ' neg' : ''}`), x, y); box(e, w, hh); if (hidden) e.style.opacity = 0; return e; };
    // the loose pile
    const xx = mk(2, false, 30, 54, X, X);
    const given = []; for (let i = 0; i < nb; i++) given.push({ neg: b < 0, el: mk(1, b < 0, 30 + X + 22 + i * (U + 8), 54, U, X) });
    const ux0 = 30 + X + 22 + nb * (U + 8) + (nb ? 14 : 0);
    const units = []; for (let i = 0; i < nc; i++) units.push(mk(0, c < 0, ux0 + (i % 4) * (U + 6), 54 + Math.floor(i / 4) * (U + 6), U, U));
    // zero pairs: needed when the rectangle uses more x-tiles than we were given
    const needPos = (p > 0 ? nP : 0) + (q > 0 ? nQ : 0), needNeg = (p < 0 ? nP : 0) + (q < 0 ? nQ : 0);
    const haveP = b > 0 ? nb : 0, haveN = b < 0 ? nb : 0, zp = Math.max(needPos - haveP, needNeg - haveN, 0);
    const zps = [];
    for (let k = 0; k < zp; k++) {
      const x0 = 30 + k * (2 * U + 30);
      zps.push({ neg: false, el: mk(1, false, x0, 184, U, X, true), zp: true }); zps.push({ neg: true, el: mk(1, true, x0 + U + 6, 184, U, X, true), zp: true });
    }
    const zpLab = add(stage, h('div', 'u48-zplab', `zero pairs: ${T('(+x)+(-x)=0')}`), 30, 296); zpLab.style.opacity = 0;
    // destinations
    const allX = given.concat(zps), pos = allX.filter((t) => !t.neg), negs = allX.filter((t) => t.neg);
    const colT = (p > 0 ? pos : negs).slice(0, nP), rowT = (q > 0 ? pos : negs).filter((t) => !colT.includes(t)).slice(0, nQ);
    // dimension labels
    const dl = (s, x, y) => { const e = add(stage, h('div', 'u48-dimt', T(s)), x, y); e.style.opacity = 0; return e; };
    const dims = [dl('x', RX + X / 2, RY - 20), dl(sgn(p), RX + X + nP * U / 2, RY - 20), dl('x', RX - 22, RY + X / 2), dl(sgn(q), RX - 24, RY + X + nQ * U / 2)];
    const outline = add(stage, h('div'), RX - 3, RY - 3); box(outline, X + nP * U + 6, X + nQ * U + 6); outline.style.border = '3px solid var(--ink)'; outline.style.borderRadius = '4px'; outline.style.opacity = 0;
    const eq = add(stage, h('div', 'u48-line c', T(`${expr}=${fact}`)), RX + (X + nP * U) / 2, 320); eq.style.opacity = 0; fit(eq, 2 * (W - 20 - (RX + (X + nP * U) / 2)));
    const chk = add(stage, h('div', 'u48-ok', `<small class="u48-head">check by expanding</small><br>` + T(`${fact}=x^2${smono(q, 'x', 1)}${smono(p, 'x', 1)}${sgn(p * q)}=${expr}`) + ' ✓'), 24, 222); chk.style.translate = '0 -50%'; chk.style.opacity = 0;
    const moveTo = (cc, el, x, y, w, hh, ms = 650, o = {}) => cc.anim(el, [{ left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height }, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' }], ms, o);
    const tname = (n, neg, what) => `${NUM[n] || n} ${neg ? 'negative ' : ''}${what}${n === 1 ? '' : 's'}`;
    const desc = [`one ${T('x^2')}-tile`, nb ? tname(nb, b < 0, `${T('x')}-tile`) : `<b>no</b> ${T('x')}-tiles`, tname(nc, c < 0, 'unit tile')].join(', ');
    const side = (n, s) => `${NUM[n]} ${s > 0 ? 'positive' : 'negative'}`;
    const steps = [{
      cap: `The tiles for ${T(expr)}: ${desc}. Goal: arrange <b>all</b> of them into one <b>rectangle</b>.`,
      run: (cc) => Promise.all([pulse(cc, xx, 1.06), ...given.map((t, i) => pulse(cc, t.el, 1.1)), ...units.map((e, i) => pulse(cc, e, 1.15))])
    }, {
      cap: `The ${T('x^2')}-tile goes in one corner; the unit tiles fill the opposite corner as a rectangle, ${T(`${nc}=${nP}\\times${nQ}`)}.` + (c < 0 ? ' The units are <b>negative</b>, so the two sides will get <b>opposite signs</b>.' : ''),
      run: (cc) => Promise.all([moveTo(cc, xx, RX, RY, X, X), ...units.map((e, i) => moveTo(cc, e, RX + X + (i % nP) * U, RY + X + Math.floor(i / nP) * U, U, U, 650, { delay: 100 + i * 35 }))])
    }];
    if (zp) steps.push({
      cap: `The ${T('x')}-tiles must fill both gaps: ${nP} beside the ${T('x^2')}-tile and ${nQ} below it. ${nb ? `We have only ${NUM[nb]}` : 'We have none'}, so add <b>${NUM[zp]} zero pair${zp > 1 ? 's' : ''}</b>: a ${T('+x')} and a ${T('-x')} together are worth 0, so the expression doesn’t change.`,
      run: (cc) => Promise.all([...zps.map((t, i) => cc.pop(t.el, 340, { delay: i * 120 })), cc.fadeIn(zpLab, 350, { delay: 200 })])
    });
    steps.push({
      cap: `The ${T('x')}-tiles fill the gaps: ${side(nP, p)} down the right side, ${side(nQ, q)} along the bottom. Inside, ${T(`${mono(p, 'x', 1)}${smono(q, 'x', 1)}=${b ? mono(b, 'x', 1) : '0'}`)} ✓`,
      run: (cc) => Promise.all([
        ...colT.map((t, i) => moveTo(cc, t.el, RX + X + i * U, RY, U, X, 650, { delay: i * 70 })),
        ...rowT.map((t, i) => moveTo(cc, t.el, RX, RY + X + i * U, X, U, 650, { delay: 200 + i * 70 })),
        ...(zp ? [cc.anim(zpLab, [{ opacity: 1 }, { opacity: 0.35 }], 400)] : [])
      ])
    }, {
      cap: `It’s a rectangle! Read the side lengths: across the top ${T(`x${sgn(p)}`)}, down the side ${T(`x${sgn(q)}`)}. <b>The sides are the factors:</b> ${T(`${expr}=${fact}`)}.` + (d.q14 ? ' That’s Question 14.' : ''),
      run: (cc) => Promise.all([show(cc, outline), ...dims.map((e, i) => cc.pop(e, 340, { delay: 120 + i * 120 })), cc.fadeIn(eq, 400, { delay: 500 })])
    }, {
      cap: `Factoring is expanding backwards: ${T(`${fact}=x^2${smono(q, 'x', 1)}${smono(p, 'x', 1)}${sgn(p * q)}`)}, the same tiles. ✓`,
      run: (cc) => cc.fadeIn(chk, 400)
    });
    return steps;
  }
};

/* ===================== 3. Decomposition and the area box ===================== */
const BX = {
  b1: { a: 6, b: -1, c: -2, m: -4, n: 3, v: 'x' },
  b2: { a: 2, b: 11, c: 12, m: 8, n: 3, v: 'x' },
  b3: { a: 12, b: -17, c: 6, m: -8, n: -9, v: 'x' },
  r1: { a: 10, b: -1, c: -3, m: -6, n: 5, v: 'x', q: '13(b)' },
  r2: { a: 8, b: -2, c: -1, m: -4, n: 2, v: 'y', q: '10' },
  r3: { a: 3, b: -5, c: -2, m: -6, n: 1, v: 't', q: '11' }
};
function pairList(ac, b) {
  const A = Math.abs(ac), out = [];
  for (let i = 1; i * i <= A; i++) if (A % i === 0) {
    const j = A / i;
    if (ac > 0) out.push(b >= 0 ? [i, j] : [-i, -j]);
    else { out.push([i, -j]); if (i !== j) out.push([-i, j]); else out.push([-i, j]); }
  }
  // drop duplicate pairs (e.g. [i,-i] twice when i = j)
  return out.filter((pr, k) => out.findIndex((o) => o[0] === pr[0] && o[1] === pr[1]) === k);
}
const boxEx = {
  title: 'Decomposition and the area box',
  height: 352,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  value: 'b1',
  choices: [{ v: 'b1', label: T('6x^2-x-2') }, { v: 'b2', label: T('2x^2+11x+12') }, { v: 'b3', label: T('12x^2-17x+6') }, { sep: 'Review check:' }, { v: 'r1', label: T('10x^2-x-3') }, { v: 'r2', label: T('8y^2-2y-1') }, { v: 'r3', label: T('3t^2-5t-2') }],
  intro: (v) => { const d = BX[v]; return `Factor ${T(tri(d.a, d.b, d.c, d.v))}. With ${T(`a=${d.a}`)}, inspection isn’t enough — decompose the middle term.`; },
  make(stage, v, ex) {
    const W = ex.W, d = BX[v], { a, b, c, m, n } = d, x = d.v, ac = a * c, expr = tri(a, b, c, x);
    const g = gcd(a, m), A = a / g, M = m / g, r2 = n / A;                  // row 1 = g·x, columns A·x and M, row 2 = r2
    const r1s = mono(g, x, 1), c1s = mono(A, x, 1), c2s = String(M), r2s = String(r2);
    const fact = `(${r1s}${sgn(r2)})(${c1s}${sgn(M)})`;
    const top = add(stage, h('div', 'u48-big', T(expr)), 24, 42); top.style.translate = '0 -50%';
    const acl = add(stage, h('div', 'u48-mid', `${T(`ac=${a}(${c})=${ac}`)} &nbsp;·&nbsp; ${T(`b=${b}`)}`), 24, 96); acl.style.translate = '0 -50%'; acl.style.opacity = 0;
    const prs = pairList(ac, b), chips = prs.map(([i, j], k) => {
      const e = add(stage, h('div', 'u48-pc', `${T(`${i}\\times${j < 0 ? `(${j})` : j}`)}<small>sum ${String(i + j).replace('-', '−')}</small>`), 24 + (k % 4) * 140, 132 + Math.floor(k / 4) * 62); e.style.minWidth = '128px'; e.style.opacity = 0; return e;
    });
    const hitK = prs.findIndex(([i, j]) => i + j === b);
    const cw = 124, ch = 68, x0 = W - 2 * cw - 34, y0 = 66;
    const cells = [[mono(a, x, 2), 'sq'], [mono(m, x, 1), 'lin'], [mono(n, x, 1), 'lin'], [String(c), 'con']].map(([s, cls], k) => {
      const e = add(stage, h('div', 'u48-cell ' + cls, T(s)), x0 + (k % 2) * cw, y0 + Math.floor(k / 2) * ch); box(e, cw, ch); e.style.opacity = 0; return e;
    });
    const svg = add(stage, svgEl('svg', { class: 'u48-svg', width: W, height: 352 }), 0, 0);
    const dg1 = svgEl('line', { x1: x0 + 18, y1: y0 + 14, x2: x0 + 2 * cw - 18, y2: y0 + 2 * ch - 14, class: 'u48-diag' }), dg2 = svgEl('line', { x1: x0 + 2 * cw - 18, y1: y0 + 14, x2: x0 + 18, y2: y0 + 2 * ch - 14, class: 'u48-diag' });
    svg.append(dg1, dg2); hide(dg1, dg2);
    const diagN = add(stage, h('div', 'u48-note', `${T(`(${mono(a, x, 2)})(${c})=${mono(ac, x, 2)}`)} &nbsp;=&nbsp; ${T(`(${mono(m, x, 1)})(${mono(n, x, 1)})`)}`), W - 18, y0 + 2 * ch + 34); diagN.style.translate = '-100% -50%'; diagN.style.opacity = 0;
    const hd = (s, xx, yy, right) => { const e = add(stage, h('div', 'u48-hd', T(s)), xx, yy); e.style.translate = right ? '-100% -50%' : '-50% -50%'; e.style.opacity = 0; return e; };
    const heads = [hd(r1s, x0 - 12, y0 + ch / 2, true), hd(c1s, x0 + cw / 2, y0 - 22), hd(c2s[0] === '-' ? c2s : '+' + c2s, x0 + cw * 1.5, y0 - 22), hd(r2s[0] === '-' ? r2s : '+' + r2s, x0 - 12, y0 + ch * 1.5, true)];
    const grp = add(stage, h('div', 'u48-line', T(`${expr}=${mono(a, x, 2)}${smono(m, x, 1)}${smono(n, x, 1)}${sgn(c)}=${r1s}(${c1s}${sgn(M)})${sgn(r2)}(${c1s}${sgn(M)})`)), 24, 278); grp.style.translate = '0 -50%'; grp.style.fontSize = '24px'; grp.style.opacity = 0; fit(grp, W - 48);
    const fin = add(stage, h('div', 'u48-ok', `${T(`${expr}=${fact}`)}`), 24, 322); fin.style.translate = '0 -50%'; fin.style.fontSize = '24px'; fin.style.opacity = 0;
    const signNote = ac < 0 ? ' — one positive, one negative, since ' + T('ac<0') : b < 0 ? ' — both negative, since ' + T('ac>0') + ' and ' + T('b<0') : ' — both positive';
    return [{
      cap: `<b>Decomposition:</b> find two integers with <b>product</b> ${T(`ac=${ac}`)} and <b>sum</b> ${T(`b=${b}`)}.`,
      run: (cc) => cc.fadeIn(acl)
    }, {
      cap: `List the factor pairs of ${T(String(ac))}${signNote}. Add each pair: ${T(`${m}+${n < 0 ? `(${n})` : n}=${b}`)} is the one.`,
      run: async (cc) => { await Promise.all(chips.map((e, i) => cc.pop(e, 300, { delay: i * 90 }))); chips.forEach((e, i) => { if (i === hitK) e.classList.add('hit'); else cc.anim(e, [{ opacity: 1 }, { opacity: 0.38 }], 300); }); if (chips[hitK]) await pulse(cc, chips[hitK]); }
    }, {
      cap: `Split the middle term, ${T(`${mono(b, x, 1)}=${mono(m, x, 1)}${smono(n, x, 1)}`)}, and fill a 2 × 2 box: ${T(mono(a, x, 2))} and ${T(String(c))} on one diagonal, ${T(mono(m, x, 1))} and ${T(mono(n, x, 1))} on the other.`,
      run: (cc) => Promise.all(cells.map((e, i) => cc.pop(e, 340, { delay: i * 130 })))
    }, {
      cap: `<b>Why ${T('ac')}?</b> In any box, the two diagonals have the same product: ${T(`(${mono(a, x, 2)})(${c})=(${mono(m, x, 1)})(${mono(n, x, 1)})=${mono(ac, x, 2)}`)}. So the pair must multiply to ${T('ac')}.`,
      run: (cc) => Promise.all([show(cc, dg1), show(cc, dg2, 380, { delay: 150 }), cc.fadeIn(diagN, 380, { delay: 300 })])
    }, {
      cap: `Read the edges. The top row’s GCF is ${T(r1s)}; dividing it out gives the columns ${T(c1s)} and ${T(c2s)}. Then the bottom row’s factor is ${T(`${mono(n, x, 1)}\\div ${c1s}=${r2}`)}.`,
      run: (cc) => Promise.all([cc.anim(dg1, [{ opacity: 1 }, { opacity: 0.25 }], 300), cc.anim(dg2, [{ opacity: 1 }, { opacity: 0.25 }], 300), ...heads.map((e, i) => cc.pop(e, 340, { delay: i * 180 }))])
    }, {
      cap: `The edges are the factors: ${T(`${expr}=${fact}`)}. Grouping gives the same bracket twice — and expanding the box gives back all four cells ✓` + (d.q ? ` That’s Question ${d.q}.` : ''),
      run: (cc) => Promise.all([cc.fadeIn(grp, 380), cc.fadeIn(fin, 380, { delay: 300 })])
    }];
  }
};

/* ===================== 4. Which middle terms work? ===================== */
const BV = { c12: { c: 12 }, cm12: { c: -12 }, r15: { c: 24, q: 15 }, r16: { c: 55, q: 16 }, r21: { c: 20, q: 21 } };
const bvals = {
  title: 'Every middle term that works',
  height: 312,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar (four factor-pair columns, the long note for Q21)
  value: 'c12',
  choices: [{ v: 'c12', label: T('x^2+bx+12') }, { v: 'cm12', label: T('x^2+bx-12') }, { sep: 'Review check:' }, { v: 'r15', label: T('x^2+px+24') }, { v: 'r16', label: T('x^2-wx+55') }, { v: 'r21', label: T('x^2+bx+20') }],
  intro: (v) => { const c = BV[v].c; return `For which integers ${T('b')} does ${T(`x^2+bx${sgn(c)}`)} factor over the integers? We need two integers with product ${T(String(c))} — and their sum is ${T('b')}.`; },
  make(stage, v, ex) {
    const W = ex.W, d = BV[v], c = d.c, C = Math.abs(c), base = [];
    for (let i = 1; i * i <= C; i++) if (C % i === 0) base.push([i, C / i]);
    const rows = c > 0 ? [base.map(([i, j]) => [i, j]), base.map(([i, j]) => [-i, -j])] : [base.map(([i, j]) => [i, -j]), base.map(([i, j]) => [-i, j])];
    const heads = c > 0 ? ['both +', 'both −'] : ['+ and −', '− and +'];
    const RY = [62, 140], X0 = 150, DX = 152;
    const rh = heads.map((s, r) => { const e = add(stage, h('div', 'u48-rowh', s), 24, RY[r]); e.style.opacity = 0; return e; });
    const cards = rows.map((row, r) => row.map(([i, j], k) => {
      const e = add(stage, h('div', 'u48-pr', `${T(`(${i})(${j})`)}<small>sum ${T(String(i + j))}</small>`), X0 + k * DX, RY[r] - 30); e.style.opacity = 0;
      e.querySelector('small').style.visibility = 'hidden'; return e;
    }));
    const sums = [...new Set(rows.flat().map(([i, j]) => i + j))].sort((p, q) => q - p);
    const lab = add(stage, h('div', 'u48-rowh', `${T('b')} can be`), 24, 224); lab.style.opacity = 0; lab.style.textTransform = 'none'; lab.style.fontSize = '17px';
    const bvs = sums.map((s, k) => { const e = add(stage, h('div', 'u48-bv', T(String(s))), X0 + k * 80, 224); e.style.translate = '0 -50%'; e.style.opacity = 0; return e; });
    const steps = [{
      cap: `List the factor pairs of ${T(String(C))}: ${base.map(([i, j]) => T(`${i}\\times${j}`)).join(', ')}.`,
      run: (cc) => Promise.all([cc.fadeIn(rh[0]), ...cards[0].map((e, i) => cc.pop(e, 320, { delay: i * 110 }))])
    }, {
      cap: c > 0 ? `${T(String(c))} is <b>positive</b>, so the two integers have the <b>same sign</b>: both positive, or both negative.` : `${T(String(c))} is <b>negative</b>, so the two integers have <b>opposite signs</b> — and either one can be the negative one.`,
      run: (cc) => Promise.all([cc.fadeIn(rh[1]), ...cards[1].map((e, i) => cc.pop(e, 320, { delay: i * 110 }))])
    }, {
      cap: `Add each pair. These sums are the <b>only</b> middle terms that work: ${T('b\\in\\{') + sums.map((x) => T(String(x))).join(', ') + T('\\}')}.`, // pieces, so the list can wrap in the sidebar
      run: async (cc) => {
        const all = cards.flat(); all.forEach((e) => { e.classList.add('sum'); e.querySelector('small').style.visibility = 'visible'; });
        await Promise.all(all.map((e, i) => flash(cc, e.querySelector('small'), i)));
        await Promise.all([cc.fadeIn(lab), ...bvs.map((e, i) => cc.pop(e, 300, { delay: i * 80 }))]);
      }
    }];
    if (!d.q) {
      const no = 5, nt = add(stage, h('div', 'u48-note', `${T(`x^2+${no}x${sgn(c)}`)}: is ${no} on the list? No → it can’t be factored over the integers.`), 24, 276); nt.style.translate = '0 -50%'; nt.style.opacity = 0;
      steps.push({ cap: `So ${T(`x^2+bx${sgn(c)}`)} factors for exactly these ${NUM[sums.length]} values of ${T('b')} — and <b>no others</b>. ${T(`x^2+5x${sgn(c)}`)}, for example, cannot be factored.`, run: (cc) => cc.fadeIn(nt) });
    } else if (d.q === 15) {
      const opts = [['A', -10], ['B', -14], ['C', 11], ['D', 16]].map(([L, val], k) => { const ok = sums.includes(val); const e = add(stage, h('div', 'u48-bv ' + (ok ? 'yes' : 'no'), `${L}&nbsp; ${T(`p=${val}`)} ${ok ? '✓' : '✗'}`), X0 - 126 + k * 186, 276); e.style.translate = '0 -50%'; e.style.opacity = 0; return e; });
      steps.push({ cap: `Check the four choices against the list: ${T('-10')}, ${T('-14')} and ${T('11')} are pair sums; <b>16 is not</b>, so ${T('x^2+16x+24')} cannot be factored. That’s Question 15: <b>D</b>.`, run: (cc) => Promise.all(opts.map((e, i) => cc.pop(e, 320, { delay: i * 160 }))) });
    } else if (d.q === 16) {
      const nt = add(stage, h('div', 'u48-note', `${T('-wx=bx')}, so ${T('w=-b')}: &nbsp;${T(`w\\in\\{${sums.map((s) => -s).sort((p, q) => q - p).join(',')}\\}`)} &nbsp;→ largest ${T('w=56')}`), 24, 276); nt.style.translate = '0 -50%'; nt.style.opacity = 0;
      steps.push({ cap: `Careful: the middle term is ${T('-wx')}, so ${T('w=-b')}. The largest ${T('w')} is <b>56</b>: ${T('x^2-56x+55=(x-1)(x-55)')}. That’s Question 16.`, run: (cc) => cc.fadeIn(nt) });
    } else {
      const nt = add(stage, h('div', 'u48-note', `${NUM[sums.length]} values of ${T('b')} → <b>${sums.length} polynomials</b> &nbsp;·&nbsp; ${T('x^2+3x+20')}: 3 isn’t on the list, so it can’t be factored`), 24, 276); nt.style.translate = '0 -50%'; nt.style.opacity = 0;
      steps.push({ cap: `Six values of ${T('b')}, so <b>6</b> polynomials can be factored. Any other ${T('b')} — like ${T('x^2+3x+20')} — cannot. That’s Question 21.`, run: (cc) => cc.fadeIn(nt) });
    }
    return steps;
  }
};

/* ===================== static figures in the question cards ===================== */
function tileAt(host, k, neg, x, y, w, hh) { const e = add(host, h('div', `u48-t k${k}${neg ? ' neg' : ''}`), x, y); box(e, w, hh); return e; }
function figQ7(host) {   // −x² − 5x + 24, a loose pile like the booklet
  const X = 84, U = 21, G = 6;
  tileAt(host, 2, true, 0, 0, X, X);
  for (let i = 0; i < 5; i++) tileAt(host, 1, true, X + 18 + i * (U + G), 0, U, X);
  const ux = X + 18 + 5 * (U + G) + 14;
  for (let i = 0; i < 24; i++) tileAt(host, 0, false, ux + (i % 4) * (U + 5), Math.floor(i / 4) * (U + 5), U, U);
  box(host, ux + 4 * (U + 5), 6 * (U + 5));
}
function figQ14(host) {  // (x + 2)(x + 5): 2 columns right of the x²-tile, 5 rows below it
  const X = 110, U = 26, ox = 40, oy = 34, p = 2, q = 5;
  tileAt(host, 2, false, ox, oy, X, X);
  for (let j = 0; j < p; j++) tileAt(host, 1, false, ox + X + j * U, oy, U, X);
  for (let i = 0; i < q; i++) { tileAt(host, 1, false, ox, oy + X + i * U, X, U); for (let j = 0; j < p; j++) tileAt(host, 0, false, ox + X + j * U, oy + X + i * U, U, U); }
  const ol = add(host, h('div'), ox - 2, oy - 2); box(ol, X + p * U + 4, X + q * U + 4); ol.style.border = '3px solid var(--ink)'; ol.style.borderRadius = '3px';
  const l1 = add(host, h('div', 'u48-lab', '?'), ox + (X + p * U) / 2, oy - 18); l1.style.translate = '-50% -50%';
  const l2 = add(host, h('div', 'u48-lab', '?'), ox - 20, oy + (X + q * U) / 2); l2.style.translate = '-50% -50%';
  box(host, ox + X + p * U + 20, oy + X + q * U + 10);
}
function figQ19(host) {  // rectangle ABCD in four regions (not to scale, like the booklet)
  const s = 62, x0 = 40, y0 = 30, w = 5 * s, hh = 3.4 * s, vx = x0 + 3 * s, hy = y0 + hh - s;
  box(host, 400, hh + 70);
  const svg = add(host, svgEl('svg', { width: 400, height: hh + 70 }), 0, 0);
  svg.appendChild(svgEl('rect', { x: x0, y: y0, width: w, height: hh, fill: '#fffdf8', stroke: '#1c2230', 'stroke-width': 2.5 }));
  svg.appendChild(svgEl('line', { x1: vx, y1: y0, x2: vx, y2: y0 + hh, stroke: '#1c2230', 'stroke-width': 2 }));
  svg.appendChild(svgEl('line', { x1: x0, y1: hy, x2: x0 + w, y2: hy, stroke: '#1c2230', 'stroke-width': 2 }));
  [['A', x0 - 18, y0], ['B', x0 + w + 18, y0], ['C', x0 + w + 18, y0 + hh], ['D', x0 - 18, y0 + hh]].forEach(([t, x, y]) => { const e = add(host, h('div', 'u48-lab', T(t)), x, y); e.style.translate = '-50% -50%'; });
  [['b^2', (x0 + vx) / 2, (y0 + hy) / 2], ['81', (vx + x0 + w) / 2, (hy + y0 + hh) / 2]].forEach(([t, x, y]) => { const e = add(host, h('div', 'u48-lab', T(t)), x, y); e.style.translate = '-50% -50%'; e.style.fontSize = '26px'; });
}

/* ===================== warm-up: Memory Match ===================== */
const MM_PAIRS = [[1, 10, 'perfect square', 'x^2-6x+9=(x-3)^2'], [2, 11, 'inspection', 'x^2-x-6=(x-3)(x+2)'], [3, 12, 'GCF', '3x^2+9x=3x(x+3)'], [4, 9, 'perfect square', 'x^2+6x+9=(x+3)^2'],
  [5, 14, 'diff. of squares', 'x^2-9=(x-3)(x+3)'], [6, 15, 'GCF, keep going', '2x^2-18=2(x-3)(x+3)'], [8, 13, 'decomposition', '2x^2+5x-3=(2x-1)(x+3)']];
const MM_VAL = { 1: 1, 2: -4, 3: 30, 4: 25, 5: -5, 6: -10, 7: 0, 8: 15, 9: 25, 10: 1, 11: -4, 12: 30, 13: 15, 14: -5, 15: -10 };   // value of each card at x = 2
const MM_COL = [['#d6ece9', '#0f5f5a'], ['#ffe9bf', '#9a5c08'], ['#dbe5f5', '#2c4a82'], ['#efe4fa', '#6e46a0'], ['#fbe0e6', '#a33a55'], ['#e2f2dc', '#3b7a2a'], ['#ece8df', '#5b5446']];
const mn = (v) => String(v).replace('-', '−');
function mountMatch() {
  const mm = document.getElementById('mm'); if (!mm) return;
  const cards = {}; mm.querySelectorAll('.u48-card').forEach((b) => { cards[b.dataset.n] = b; b.querySelector('em').textContent = mn(MM_VAL[b.dataset.n]); });
  const msg = document.getElementById('mm-msg'), count = document.getElementById('mm-count'), msg0 = msg.innerHTML;
  const partner = (a) => MM_PAIRS.find((p) => p[0] === a || p[1] === a);
  let sel = null, found = 0;
  const say = (html, cls = '') => { msg.className = 'u48-mm-msg' + (cls ? ' ' + cls : ''); msg.innerHTML = html; };
  const setCount = () => { count.innerHTML = `Pairs found: <b>${found}</b> / 7`; };
  const match = (pr) => {
    const col = MM_COL[found % MM_COL.length]; found++;
    [pr[0], pr[1]].forEach((k) => { const b = cards[k]; b.classList.remove('sel', 'bad'); b.classList.add('m'); b.style.setProperty('--pc', col[0]); b.style.setProperty('--pcd', col[1]); b.querySelector('small').textContent = pr[2]; });
    setCount();
    if (found === 7) lonely();
  };
  const lonely = () => { const b = cards[7]; b.classList.add('lonely'); b.querySelector('small').textContent = 'no partner'; say(`All 7 pairs found! Card 7, ${T('x^2+x-6')}, has <b>no partner</b> — it needs ${T('(x+3)(x-2)')}.`, 'ok'); };
  mm.addEventListener('click', (ev) => {
    const b = ev.target.closest('.u48-card'); if (!b) return;
    const k = Number(b.dataset.n);
    if (b.classList.contains('m') || b.classList.contains('lonely')) { const pr = partner(k); if (pr) say(`Cards ${pr[0]} and ${pr[1]}: ${T(pr[3])} · <b>${pr[2]}</b>`, 'ok'); return; }
    if (sel === null) { sel = k; b.classList.add('sel'); return; }
    if (sel === k) { sel = null; b.classList.remove('sel'); return; }
    const a = sel; sel = null; cards[a].classList.remove('sel');
    const pr = partner(a);
    if (pr && (pr[0] === k || pr[1] === k)) { match(pr); if (found < 7) say(`✓ Cards ${pr[0]} and ${pr[1]}: ${T(pr[3])} · <b>${pr[2]}</b>`, 'ok'); return; }
    [cards[a], b].forEach((e) => { e.classList.remove('bad'); void e.offsetWidth; e.classList.add('bad'); setTimeout(() => e.classList.remove('bad'), 650); });
    say(`✗ Cards ${a} and ${k} don’t match — at ${T('x=2')} they give ${mn(MM_VAL[a])} and ${mn(MM_VAL[k])}. Expand to check!`, 'no');
  });
  document.querySelectorAll('[data-mm]').forEach((btn) => btn.addEventListener('click', () => {
    const act = btn.dataset.mm;
    if (act === 'x2') { const on = mm.classList.toggle('x2'); btn.textContent = on ? 'Hide x = 2' : 'Put x = 2'; say(on ? `Each card’s value at ${T('x=2')}: partners give the <b>same</b> number. Card 7 gives 0 — nobody else does.` : msg0); }
    if (act === 'all') { if (sel !== null) { cards[sel].classList.remove('sel'); sel = null; } MM_PAIRS.filter((pr) => !cards[pr[0]].classList.contains('m')).forEach((pr, i) => setTimeout(() => match(pr), i * 220)); if (found === 7) lonely(); }
    if (act === 'reset') { sel = null; found = 0; setCount(); Object.values(cards).forEach((b) => { b.className = 'u48-card'; b.querySelector('small').textContent = ''; b.style.removeProperty('--pc'); b.style.removeProperty('--pcd'); }); mm.classList.remove('x2', 'tools'); document.querySelector('[data-mm=x2]').textContent = 'Put x = 2'; say(msg0); }
    if (act === 'tools') { const on = mm.classList.toggle('tools'); document.getElementById('wq-tools').classList.toggle('on', on); }
  }));
}

/* ===================== wiring ===================== */
const explainers = [];
function mountExplainers() {
  const defs = { flow, tiles: tilesEx, box: boxEx, bvals };
  document.querySelectorAll('[data-explainer]').forEach((el) => explainers.push(new Explainer(el, defs[el.dataset.explainer])));
  // KaTeX fonts arrive after the first build; redraw untouched explainers so measured widths are right.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => explainers.forEach((e) => { if (!e.running && e.k === 0) e.build(0); }));
}
function mountFigures() {
  const f7 = document.getElementById('fig-q7'); if (f7) figQ7(f7);
  const f14 = document.getElementById('fig-q14'); if (f14) figQ14(f14);
  const f19 = document.getElementById('fig-q19'); if (f19) figQ19(f19);
}
function mountNR() {
  document.querySelectorAll('.nr-b[data-nr]').forEach((el) => { const s = el.dataset.nr; for (let i = 0; i < 4; i++) el.appendChild(h('i', null, s[i] ? `<span>${s[i]}</span>` : '')); });
}
function mountDeck() {
  const deck = document.querySelector('.u48-deck'); if (!deck) return;
  const cards = [...deck.querySelectorAll('.u48-tool')];
  cards.forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
  const all = document.querySelector('[data-deckall]');
  if (all) all.addEventListener('click', () => { const on = !cards.every((b) => b.classList.contains('on')); cards.forEach((b, i) => setTimeout(() => b.classList.toggle('on', on), on ? i * 80 : 0)); all.textContent = on ? 'Show all rules' : 'Show all examples'; });
}
function mountReveals() {
  document.querySelectorAll('[data-rv]').forEach((b) => b.addEventListener('click', () => { const t = document.getElementById(b.dataset.rv); if (t) t.classList.toggle('on'); }));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

mountExplainers(); mountFigures(); mountNR(); mountMatch(); mountDeck(); mountReveals();
