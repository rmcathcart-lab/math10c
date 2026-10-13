/* Math 10C · Unit 2 · Lesson 6 — Exponent Laws in Review: the explainers and widgets on this page.
 * A review lesson, so each explainer is a quick "remember how…" refresher tied to one or two booklet examples,
 * with "Example N check" chips that replay the booklet's own numbers after the class has worked them by hand. */
import { h, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const T = (s) => tex(s);
const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => (e.style.opacity = 0));
const moveTo = (c, el, x, y, ms = 600, o = {}) => c.anim(el, [{ left: el.style.left, top: el.style.top }, { left: x + 'px', top: y + 'px' }], ms, o);
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const COL = { b: '#13807a', e: '#c27a0e', k: '#8a58c9', r: '#c93a33' };
const cB = (s) => `\\color{${COL.b}}{${s}}`, cE = (s) => `\\color{${COL.e}}{${s}}`, cK = (s) => `\\color{${COL.k}}{${s}}`;
const flash = (c, el) => c.anim(el, [{ opacity: 0.15 }, { opacity: 1 }], 320);
const draw = (c, path, ms = 600, o = {}) => { const len = path.getTotalLength ? path.getTotalLength() || 400 : 400; path.style.strokeDasharray = len; return c.anim(path, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], ms, o); };
const num = (x) => String(Math.round(x * 1e9) / 1e9); // 16.200000000000003 → "16.2"

/* ============ 2. Base, exponent, coefficient — and the −a⁰ trap ============ */
const ANAT = {
  p34: { start: '(-3)^{4}', steps: [
    { cap: `The <b>brackets</b> fence in the whole ${T('-3')}, so ${T('-3')} is the <b>base</b>: the factor that repeats.`, main: cB('(-3)') + '^{4}', chip: ['b', 'base', '-3'] },
    { cap: `The <b>exponent</b> 4 says how many times the base is used as a factor.`, main: cB('(-3)') + '^{' + cE('4') + '}', chip: ['e', 'exponent', '4'] },
    { cap: `Four factors of ${T('-3')}. An <b>even</b> number of negatives multiplies to a <b>positive</b>.`, line: '(-3)^{4}=(-3)(-3)(-3)(-3)=\\mathbf{81}' }] },
  n34: { start: '-3^{4}', steps: [
    { cap: `<b>No brackets!</b> The exponent only reaches the <b>3</b>, so the base is ${T('3')}, not ${T('-3')}.`, main: '-' + cB('3') + '^{4}', chip: ['b', 'base', '3'] },
    { cap: `The exponent is <b>4</b>. The minus sign sits <b>outside</b> the power, like a coefficient of ${T('-1')}.`, main: '-' + cB('3') + '^{' + cE('4') + '}', chip: ['e', 'exponent', '4'] },
    { cap: `Find ${T('3^4')} first, <b>then</b> make it negative. Same digits, different answer from ${T('(-3)^4=81')}.`, line: '-3^{4}=-(3\\times3\\times3\\times3)=\\mathbf{-81}' }] },
  p35: { start: '(-3)^{5}', steps: [
    { cap: `The brackets make the whole quantity ${T('-3')} the repeated factor: the <b>base</b> is ${T('-3')}.`, main: cB('(-3)') + '^{5}', chip: ['b', 'base', '-3'] },
    { cap: `The <b>exponent</b> is 5: the base is used as a factor five times.`, main: cB('(-3)') + '^{' + cE('5') + '}', chip: ['e', 'exponent', '5'] },
    { cap: `Five negatives: an <b>odd</b> number, so the product is negative. <b>Example 1(a):</b> base ${T('-3')}, exponent 5.`, line: '(-3)^{5}=(-3)(-3)(-3)(-3)(-3)=-243' }] },
  cf: { start: '-\\dfrac{4y^{6}}{9}', steps: [
    { cap: `The only power here is ${T('y^6')}: its <b>base</b> is ${T('y')}…`, main: '-\\dfrac{4' + cB('y') + '^{6}}{9}', chip: ['b', 'base', 'y'] },
    { cap: `…and its <b>exponent</b> is 6.`, main: '-\\dfrac{4' + cB('y') + '^{' + cE('6') + '}}{9}', chip: ['e', 'exponent', '6'] },
    { cap: `The <b>coefficient</b> is the whole number multiplying the power, sign and ÷ 9 included. <b>Example 1(b):</b> ${T('-\\tfrac{4}{9}')}, not ${T('-4')}.`, main: cK('-\\dfrac{4}{9}') + cB('y') + '^{' + cE('6') + '}', chip: ['k', 'coefficient', '-\\tfrac{4}{9}'], line: '-\\dfrac{4y^{6}}{9}=-\\dfrac{4}{9}\\,y^{6}' }] },
  na0: { start: '-a^{0}', steps: [
    { cap: `No brackets: the base is just ${T('a')}. The minus sign is <b>outside</b> the power.`, main: '-' + cB('a') + '^{0}', chip: ['b', 'base', 'a'] },
    { cap: `Exponent <b>0</b>: any nonzero base to the exponent 0 is <b>1</b>, so ${T('a^0=1')}.`, main: '-' + cB('a') + '^{' + cE('0') + '}', chip: ['e', 'exponent', '0'] },
    { cap: `Power first, then the minus sign. <b>Example 1(c):</b> ${T('-a^0=-1')}.`, line: '-a^{0}=-(a^{0})=-(1)=\\mathbf{-1}' }] },
  pa0: { start: '(-a)^{0}', steps: [
    { cap: `Now the brackets fence in ${T('-a')}: the <b>whole</b> ${T('-a')} is the base.`, main: cB('(-a)') + '^{0}', chip: ['b', 'base', '-a'] },
    { cap: `Exponent 0 again.`, main: cB('(-a)') + '^{' + cE('0') + '}', chip: ['e', 'exponent', '0'] },
    { cap: `Anything nonzero to the exponent 0 is 1. <b>Example 1(c):</b> ${T('(-a)^0=1')}. The brackets changed the answer!`, line: '(-a)^{0}=\\mathbf{1}' }] }
};
const anatomy = {
  title: 'Who is in the power? Base, exponent, coefficient',
  height: 330,
  choices: [{ v: 'p34', label: T('(-3)^4') }, { v: 'n34', label: T('-3^4') }, { sep: 'Example 1 check:' }, { v: 'p35', label: T('(-3)^5') }, { v: 'cf', label: T('-4y^6/9') }, { v: 'na0', label: T('-a^0') }, { v: 'pa0', label: T('(-a)^0') }],
  intro: (v) => `Find the <b>base</b> first: it’s whatever the exponent is touching. Brackets act like a <b>fence</b> — only what’s inside gets repeated.`,
  make(stage, v, ex) {
    const W = ex.W, d = ANAT[v];
    const main = add(stage, h('div', 'an-main c', T(d.start)), W / 2, 74);
    const chips = add(stage, h('div', 'an-chips c'), W / 2, 168);
    const line = add(stage, h('div', 'an-line c'), W / 2, 262);
    return d.steps.map((s) => ({
      cap: s.cap,
      run: async (c) => {
        const jobs = [];
        if (s.main) { main.innerHTML = T(s.main); jobs.push(flash(c, main)); }
        if (s.chip) { const [k, lab, t] = s.chip, e = h('span', 'an-chip ' + k, `<small>${lab}</small>${T(t)}`); chips.appendChild(e); jobs.push(c.pop(e, 380)); }
        if (s.line) { line.innerHTML = T(s.line); jobs.push(c.fadeIn(line, 450, { delay: s.main ? 250 : 0 })); }
        await Promise.all(jobs);
      }
    }));
  }
};

/* ============ 3. Expanding a power: only what's inside the fence repeats ============ */
const EXPD = {
  m5: { main: '(5m)^{3}', fence: true, group: ['5', 'm'], times: 3, inside: true, result: '(5m)^{3}=5\\times5\\times5\\times m\\times m\\times m=125m^{3}' },
  xy: { main: '2x^{3}y^{2}', coef: '2', parts: [['x', 3], ['y', 2]], result: '2x^{3}y^{2}=2\\times x\\times x\\times x\\times y\\times y' },
  s1: { main: '8p^{3}q^{5}', coef: '8', parts: [['p', 3], ['q', 5]], result: '8p^{3}q^{5}=8\\times p\\times p\\times p\\times q\\times q\\times q\\times q\\times q', claim: '8\\times p\\times p\\times p\\times q\\times q\\times q\\times q\\times q', ok: true, tag: 'Statement 1' },
  s2: { main: '4(mn)^{3}', coef: '4', fence: true, group: ['m', 'n'], times: 3, result: '4(mn)^{3}=4\\times m\\times m\\times m\\times n\\times n\\times n=4m^{3}n^{3}', claim: '4\\times4\\times4\\times m\\times m\\times m\\times n\\times n\\times n', ok: false, tag: 'Statement 2' }
};
const expand = {
  title: 'Expand it: what does the exponent repeat?',
  height: 400,
  choices: [{ v: 'm5', label: T('(5m)^3') }, { v: 'xy', label: T('2x^3y^2') }, { sep: 'Example 2 check:' }, { v: 's1', label: 'Statement 1' }, { v: 's2', label: 'Statement 2' }],
  intro: (v) => `Write ${T(EXPD[v].main)} as a <b>repeated multiplication</b>. Each exponent repeats only the thing it touches — a whole bracket, or a single letter.`,
  make(stage, v, ex) {
    const W = ex.W, d = EXPD[v], tw = 52, gap = 30;
    add(stage, h('div', 'xp-main c', T(d.main)), W / 2, 58);
    const seq = []; // tiles in written order: { t, kind, g }
    if (d.coef) seq.push({ t: d.coef, kind: 'coef' });
    if (d.fence) for (let i = 0; i < d.times; i++) d.group.forEach((t) => seq.push({ t, kind: /\d/.test(t) ? 'num' : 'var', g: i }));
    else d.parts.forEach(([t, n]) => { for (let i = 0; i < n; i++) seq.push({ t, kind: 'var' }); });
    const n = seq.length, x0 = (W - (n * tw + (n - 1) * gap)) / 2 + tw / 2, y = 160, sx = (i) => x0 + i * (tw + gap);
    seq.forEach((s, i) => { s.el = add(stage, h('div', 'xp-tile c ' + s.kind, T(s.t)), sx(i), y); s.el.style.opacity = 0; s.i = i; });
    const times = []; for (let i = 1; i < n; i++) { const e = add(stage, h('div', 'xp-x c', '×'), sx(i) - (tw + gap) / 2, y); e.style.opacity = 0; times.push(e); }
    const boxes = [];
    if (d.fence) for (let g = 0; g < d.times; g++) {
      const first = seq.findIndex((s) => s.g === g), k = d.group.length, x = sx(first) - tw / 2 - 5, w = k * tw + (k - 1) * gap + 10;
      const b = add(stage, h('div', 'xp-group', `<div class="xp-glab">${T('(' + d.group.join('') + ')')}</div>`), x, y - tw / 2 - 12); b.style.width = w + 'px'; b.style.opacity = 0; boxes.push(b);
    }
    const res = add(stage, h('div', 'xp-res c'), W / 2, 252); res.style.opacity = 0;
    const claim = add(stage, h('div', 'xp-claim'), 30, 314); claim.style.opacity = 0;
    const stamp = add(stage, h('div', 'stamp ' + (d.ok ? 'yes' : 'no')), W - 40, 300); stamp.style.opacity = 0; stamp.style.translate = '-100% 0';
    const showTile = (c, s, delay) => { const jobs = [c.pop(s.el, 340, { delay })]; if (s.i > 0) jobs.push(c.fadeIn(times[s.i - 1], 200, { delay })); return Promise.all(jobs); };
    const steps = [];
    if (d.coef) steps.push({
      cap: d.fence ? `The <b>${d.coef}</b> sits <b>outside</b> the fence. It’s a coefficient: written <b>once</b>, never repeated.` : `The <b>${d.coef}</b> is the coefficient. It multiplies <b>once</b> — the exponents belong to the letters.`,
      run: (c) => showTile(c, seq[0], 0)
    });
    const rest = seq.filter((s) => s.kind !== 'coef');
    steps.push({
      cap: d.fence ? (d.inside ? `This time the <b>5 is inside</b> the fence, so the base is the whole ${T('5m')}: it is used as a factor <b>${d.times}</b> times.` : `Inside the fence is ${T(d.group.join(''))}. The exponent repeats the <b>whole bracket</b> ${d.times} times.`)
        : `Each exponent belongs to its own letter: ${d.parts.map(([t, k]) => `${T(t)} ${k === 1 ? 'once' : k + ' times'}`).join(', ')}.`,
      run: async (c) => {
        const jobs = rest.map((s, j) => showTile(c, s, j * 110));
        boxes.forEach((b, g) => jobs.push(c.fadeIn(b, 300, { delay: g * d.group.length * 110 })));
        await Promise.all(jobs);
      }
    });
    if (d.fence) steps.push({
      cap: `Multiplication works in any order, so group the like factors together: ${T(d.result.split('=').pop())}.`,
      run: async (c) => {
        const order = [...seq].sort((a, b) => (a.kind === 'coef' ? -1 : b.kind === 'coef' ? 1 : a.t < b.t ? -1 : a.t > b.t ? 1 : a.i - b.i));
        await Promise.all([...boxes.map((b) => c.anim(b, [{ opacity: 1 }, { opacity: 0 }], 300)), ...order.map((s, j) => moveTo(c, s.el, sx(j), y, 650, { delay: 200 }))]);
        res.innerHTML = T(d.result); await c.fadeIn(res, 400);
      }
    });
    else steps.push({ cap: `Read it back: that’s the full expansion.`, run: async (c) => { res.innerHTML = T(d.result); await c.fadeIn(res, 400); } });
    if (d.claim) steps.push({
      cap: d.ok ? `<b>${d.tag} is true.</b> It shows the 8 once, ${T('p')} three times and ${T('q')} five times — exactly our expansion.`
        : `<b>${d.tag} is false.</b> It writes ${T('4\\times4\\times4')}, cubing the 4 that sits outside the fence. That would be ${T('(4mn)^3=64m^3n^3')}, not ${T('4m^3n^3')}.`,
      run: async (c) => {
        claim.innerHTML = `<span class="muted">${d.tag} says:</span> ${T(d.main + '=' + d.claim)}`;
        stamp.innerHTML = d.ok ? 'TRUE' : 'FALSE';
        await c.fadeIn(claim, 400);
        await c.anim(stamp, [{ opacity: 0, transform: 'scale(1.8) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' });
      }
    });
    return steps;
  }
};

/* ============ 5 + 7. Columns per base: products, quotients, and a power of a product ============ */
const COLS = {
  p1: { op: 'mul', expr: '2a^{3}b\\times5a^{2}b^{4}', A: { c: 2, v: { a: 3, b: 1 } }, B: { c: 5, v: { a: 2, b: 4 } } },
  q1: { op: 'div', expr: '\\dfrac{12x^{5}y^{2}}{3x^{2}y^{5}}', A: { c: 12, v: { x: 5, y: 2 } }, B: { c: 3, v: { x: 2, y: 5 } } },
  e4: { op: 'mul', expr: '6b^{4}\\times3b^{5}', A: { c: 6, v: { b: 4 } }, B: { c: 3, v: { b: 5 } }, tag: 'Example 4' },
  e5a: { op: 'div', expr: '\\dfrac{8x^{14}}{4x^{6}}', A: { c: 8, v: { x: 14 } }, B: { c: 4, v: { x: 6 } }, tag: 'Example 5(a)' },
  e5b: { op: 'div', expr: '\\dfrac{9y^{2}}{3y^{-5}}', A: { c: 9, v: { y: 2 } }, B: { c: 3, v: { y: -5 } }, tag: 'Example 5(b)' },
  d1: { op: 'pow', expr: '\\left(8a^{6}b^{-3}\\right)^{2/3}', A: { c: 8, v: { a: 6, b: -3 } }, p: 2, q: 3 },
  d2: { op: 'pow', expr: '\\left(25x^{4}y^{-6}\\right)^{1/2}', A: { c: 25, v: { x: 4, y: -6 } }, p: 1, q: 2 },
  d3: { op: 'pow', expr: '\\left(81m^{12}\\right)^{3/4}', A: { c: 81, v: { m: 12 } }, p: 3, q: 4 },
  e8: { op: 'pow', expr: '\\left(16x^{8}y^{-4}\\right)^{3/4}', A: { c: 16, v: { x: 8, y: -4 } }, p: 3, q: 4, tag: 'Example 8' }
};
const pw = (v, e) => (e === 1 ? v : `${v}^{${e}}`);
const par = (e) => (e < 0 ? `(${e})` : String(e));
function termTex(c, vs) { // coefficient + powers, as written
  const body = Object.keys(vs).filter((k) => vs[k] !== 0).map((k) => pw(k, vs[k])).join('');
  return (c === 1 && body ? '' : c === -1 && body ? '-' : String(c)) + body;
}
function positiveTex(c, vs) { // move negative exponents under the bar
  const up = {}, dn = {}; Object.keys(vs).forEach((k) => { if (vs[k] > 0) up[k] = vs[k]; else if (vs[k] < 0) dn[k] = -vs[k]; });
  if (!Object.keys(dn).length) return null;
  return `\\dfrac{${termTex(c, up)}}{${termTex(1, dn)}}`;
}
function colsDef(title, choices, intro) {
  return {
    title, height: 450, choices, intro,
    make(stage, v, ex) {
      const W = ex.W, d = COLS[v], vars = Object.keys(Object.assign({}, d.A.v, d.B ? d.B.v : {})).sort();
      const pq = d.op === 'pow' ? `\\frac{${d.p}}{${d.q}}` : '';
      add(stage, h('div', 'cl-main c', T(d.expr)), W / 2, 56);
      const n = vars.length + 1, cw = Math.min(250, (W - 40 - (n - 1) * 18) / n), x0 = (W - (n * cw + (n - 1) * 18)) / 2;
      const cols = [], lines = [];
      for (let i = 0; i < n; i++) {
        const col = add(stage, h('div', 'cl-col', `<div class="cl-h">${i === 0 ? 'numbers' : 'base ' + T(vars[i - 1])}</div>`), x0 + i * (cw + 18), 108);
        col.style.width = cw + 'px'; col.style.opacity = 0; cols.push(col);
        lines.push([0, 1, 2].map((j) => { const e = add(stage, h('div', 'cl-l c'), x0 + i * (cw + 18) + cw / 2, 178 + j * 54); e.style.opacity = 0; return e; }));
      }
      const fin = add(stage, h('div', 'cl-fin c'), W / 2, 404); fin.style.opacity = 0;
      const set = (i, j, t) => { lines[i][j].innerHTML = T(t); return lines[i][j]; };
      const show = (c, i, j, t, delay = 0) => c.fadeIn(set(i, j, t), 380, { delay });
      const out = {}; let coef;
      // first lines
      const first = [];
      if (d.op === 'mul') { first.push(`${d.A.c}\\times${d.B.c}`); vars.forEach((k) => first.push(`${pw(k, d.A.v[k] || 0)}\\times ${pw(k, d.B.v[k] || 0)}`)); }
      else if (d.op === 'div') { first.push(`\\dfrac{${d.A.c}}{${d.B.c}}`); vars.forEach((k) => first.push(`\\dfrac{${pw(k, d.A.v[k] || 0)}}{${pw(k, d.B.v[k] || 0)}}`)); }
      else { first.push(`${d.A.c}^{${pq}}`); vars.forEach((k) => first.push(`\\left(${pw(k, d.A.v[k])}\\right)^{${pq}}`)); }
      const has1 = d.op === 'mul' && vars.some((k) => d.A.v[k] === 1 || d.B.v[k] === 1);
      const steps = [{
        cap: d.op === 'pow' ? `<b>Power of a Product:</b> the outside exponent ${T(pq)} goes to <b>every</b> factor inside the bracket — one column each.`
          : `Sort the pieces into columns: one for the <b>numbers</b>, one for each <b>base</b>. Numbers and exponents are handled separately.${has1 ? ` (A letter on its own, like ${T('b')}, means ${T('b^1')}.)` : ''}`,
        run: (c) => Promise.all(cols.map((col, i) => Promise.all([c.fadeIn(col, 350, { delay: i * 120 }), show(c, i, 0, first[i], i * 120 + 150)])))
      }];
      // numbers
      if (d.op === 'mul') { coef = d.A.c * d.B.c; steps.push({ cap: `Numbers: <b>multiply</b> them. ${T(`${d.A.c}\\times${d.B.c}=${coef}`)}.`, run: (c) => show(c, 0, 1, `=${coef}`) }); }
      else if (d.op === 'div') { coef = d.A.c / d.B.c; steps.push({ cap: `Numbers: <b>divide</b> them. ${T(`${d.A.c}\\div${d.B.c}=${coef}`)}.`, run: (c) => show(c, 0, 1, `=${coef}`) }); }
      else {
        const r = Math.round(Math.pow(d.A.c, 1 / d.q)); coef = Math.pow(r, d.p);
        const rootT = d.q === 2 ? `\\sqrt{${d.A.c}}` : `\\sqrt[${d.q}]{${d.A.c}}`;
        steps.push({
          cap: `The number: denominator ${d.q} is the <b>root</b>, numerator ${d.p} is the <b>power</b>. Root first: ${T(`${rootT}=${r}`)}${d.p > 1 ? `, then ${T(`${r}^{${d.p}}=${coef}`)}` : ''}.`,
          run: async (c) => { await show(c, 0, 1, d.p > 1 ? `=\\left(${rootT}\\right)^{${d.p}}` : `=${rootT}`); await show(c, 0, 2, d.p > 1 ? `=${r}^{${d.p}}=${coef}` : `=${coef}`); }
        });
      }
      // each base
      vars.forEach((k, idx) => {
        const i = idx + 1, a = d.A.v[k] || 0, b = d.B ? d.B.v[k] || 0 : 0;
        if (d.op === 'mul') {
          const e = a + b; out[k] = e;
          steps.push({ cap: `Base ${T(k)}, <b>multiplied</b>: keep the base, <b>add</b> the exponents. ${T(`${a}+${b}=${e}`)}.`, run: async (c) => { await show(c, i, 1, `=${k}^{${a}+${b}}`); await show(c, i, 2, `=${pw(k, e)}`); } });
        } else if (d.op === 'div') {
          const e = a - b; out[k] = e;
          steps.push({
            cap: `Base ${T(k)}, <b>divided</b>: keep the base, <b>subtract</b> the exponents (top − bottom). ${T(`${a}-${par(b)}=${e}`)}.${b < 0 ? ' Subtracting a negative <b>adds</b>.' : ''}${e < 0 ? ' A negative exponent is fine for now.' : ''}`,
            run: async (c) => { await show(c, i, 1, `=${k}^{${a}-${par(b)}}`); await show(c, i, 2, `=${pw(k, e)}`); }
          });
        } else {
          const e = a * d.p / d.q; out[k] = e;
          steps.push({ cap: `Base ${T(k)}: <b>Power of a Power</b>, so <b>multiply</b> the exponents. ${T(`${a}\\times${pq}=${e}`)}.`, run: async (c) => { await show(c, i, 1, `=${k}^{${a}\\cdot${pq}}`); await show(c, i, 2, `=${pw(k, e)}`); } });
        }
      });
      const result = termTex(coef, out), pos = positiveTex(coef, out);
      steps.push({
        cap: `Put the columns back together: <b>${T(result)}</b>.${d.tag && !pos ? ` That’s <b>${d.tag}</b>.` : ''}`,
        run: async (c) => { fin.innerHTML = T(d.expr + '=' + result); await c.fadeIn(fin, 450); }
      });
      if (pos) steps.push({
        cap: `Answers use <b>positive exponents</b>: each negative-exponent factor crosses the fraction bar. ${T(result + '=' + pos.replace('\\dfrac', '\\tfrac'))}.${d.tag ? ` That’s <b>${d.tag}</b>.` : ''}`,
        run: async (c) => { fin.innerHTML = T(d.expr + '=' + result + '=' + pos); await flash(c, fin); }
      });
      return steps;
    }
  };
}
const columns = colsDef('Columns per base: coefficients and exponents separately',
  [{ v: 'p1', label: T('2a^3b\\times5a^2b^4') }, { v: 'q1', label: T('12x^5y^2\\div3x^2y^5') }, { sep: 'Example 4 check:' }, { v: 'e4', label: T('6b^4\\times3b^5') }, { sep: 'Example 5 check:' }, { v: 'e5a', label: T('8x^{14}\\div4x^6') }, { v: 'e5b', label: T('9y^2\\div3y^{-5}') }],
  (v) => `${T(COLS[v].expr)} — <b>multiply or divide</b> the coefficients, and <b>add or subtract</b> the exponents of each base.`);
const distribute = colsDef('A rational exponent on a whole bracket',
  [{ v: 'd1', label: T('(8a^6b^{-3})^{2/3}') }, { v: 'd2', label: T('(25x^4y^{-6})^{1/2}') }, { v: 'd3', label: T('(81m^{12})^{3/4}') }, { sep: 'Example 8 check:' }, { v: 'e8', label: T('(16x^8y^{-4})^{3/4}') }],
  (v) => `Simplify ${T(COLS[v].expr)}. Every factor inside the bracket gets the exponent ${T(`\\frac{${COLS[v].p}}{${COLS[v].q}}`)}.`);

/* ============ 6. Negative exponents cross the fraction bar ============ */
const FLIP = {
  two3: { start: '2^{-3}', num: [['2^{-3}', '2^{3}']], den: [], fin: '2^{-3}=\\dfrac{1}{2^{3}}=\\dfrac{1}{8}', end: `${T('\\tfrac18=0.125')}: a small <b>positive</b> number. A negative exponent <b>never</b> makes the value negative — it means <b>reciprocal</b>.` },
  fivex: { start: '\\dfrac{5}{x^{-2}}', num: [['5']], den: [['x^{-2}', 'x^{2}']], fin: '\\dfrac{5}{x^{-2}}=5x^{2}', end: `It works from the bottom up, too: ${T('x^{-2}')} in the denominator moves <b>up</b> as ${T('x^{2}')}. The 5 doesn’t move.` },
  mix: { start: '\\dfrac{3a^{-2}}{b^{-4}}', num: [['3'], ['a^{-2}', 'a^{2}']], den: [['b^{-4}', 'b^{4}']], fin: '\\dfrac{3a^{-2}}{b^{-4}}=\\dfrac{3b^{4}}{a^{2}}', end: `Each negative-exponent factor swaps sides; the 3 has no negative exponent, so it stays on top.` },
  e6a: { start: 'y^{-4}', num: [['y^{-4}', 'y^{4}']], den: [], fin: 'y^{-4}=\\dfrac{1}{y^{4}}', end: `<b>Example 6(a):</b> ${T('y^{-4}=\\dfrac{1}{y^{4}}')}. Nothing is left on top, so a <b>1</b> holds its place.` },
  e6b: { start: '7x^{-3}', num: [['7'], ['x^{-3}', 'x^{3}']], den: [], fin: '7x^{-3}=\\dfrac{7}{x^{3}}', end: `<b>Example 6(b):</b> ${T('7x^{-3}=\\dfrac{7}{x^{3}}')}. The exponent ${T('-3')} belongs to ${T('x')} only, so the 7 stays on top.`, trap: '\\dfrac{1}{7x^{3}}' }
};
const flip = {
  title: 'A negative exponent crosses the fraction bar',
  height: 400,
  choices: [{ v: 'two3', label: T('2^{-3}') }, { v: 'fivex', label: T('5/x^{-2}') }, { v: 'mix', label: T('3a^{-2}/b^{-4}') }, { sep: 'Example 6 check:' }, { v: 'e6a', label: T('y^{-4}') }, { v: 'e6b', label: T('7x^{-3}') }],
  intro: (v) => `Rewrite ${T(FLIP[v].start)} with positive exponents. A negative exponent means “<b>reciprocal</b>”: that factor moves to the <b>other side</b> of the fraction bar and its exponent turns positive.`,
  make(stage, v, ex) {
    const W = ex.W, d = FLIP[v], cx = W * 0.36, yN = 104, yD = 222, yB = 163;
    const mk = (t) => { const e = add(stage, h('div', 'fl-t c', T(t[0])), cx, yN); e._t = t; e._mv = t.length > 1; return e; };
    const top = d.num.map(mk), bot = d.den.map(mk);
    const bar = add(stage, h('div', 'fl-bar'), cx, yB); bar.style.opacity = 0;
    const one = { N: add(stage, h('div', 'fl-t one c', '1'), cx, yN), D: add(stage, h('div', 'fl-t one c', '1'), cx, yD) };
    hide(one.N, one.D);
    const fin = add(stage, h('div', 'fl-fin c'), W / 2, 340); fin.style.opacity = 0;
    const side = add(stage, h('div', 'fl-side'), W * 0.6, 92); side.style.width = (W * 0.37) + 'px'; side.style.opacity = 0;
    const rowX = (els) => { const ws = els.map((e) => e.offsetWidth || 50), g = 6, tot = ws.reduce((a, b) => a + b, 0) + g * (els.length - 1); let x = cx - tot / 2; return ws.map((w) => { const m = x + w / 2; x += w + g; return m; }); };
    const place = (els, y) => { const xs = rowX(els); els.forEach((e, i) => at(e, xs[i], y)); };
    const barW = (a, b) => Math.max(90, ...[a, b].map((els) => els.reduce((s, e) => s + (e.offsetWidth || 50) + 6, 0))) + 40;
    // starting picture: written the way the question is written
    const isFrac = d.den.length > 0;
    if (!isFrac) { const xs = rowX(top); top.forEach((e, i) => at(e, xs[i], yB)); }
    else { place(top, yN); place(bot, yD); bar.style.opacity = 1; bar.style.width = barW(top, bot) + 'px'; }
    let T0 = top.slice(), B0 = bot.slice();
    const steps = [];
    if (!isFrac) steps.push({
      cap: `Anything can be written over <b>1</b>, so make it a fraction: now there’s a top and a bottom.`,
      run: async (c) => {
        const xs = rowX(T0); bar.style.width = barW(T0, [one.D]) + 'px';
        await Promise.all([...T0.map((e, i) => moveTo(c, e, xs[i], yN, 450)), c.fadeIn(bar, 350), c.fadeIn(one.D, 350, { delay: 200 })]);
      }
    });
    const movers = [...top, ...bot].filter((e) => e._mv), stayers = [...top, ...bot].filter((e) => !e._mv);
    steps.push({
      cap: `Spot the <b>negative exponents</b>: ${movers.map((e) => T(e._t[0])).join(' and ')}. ${stayers.length ? `The ${stayers.map((e) => T(e._t[0])).join(', ')} ${stayers.length > 1 ? 'have' : 'has'} no negative exponent, so ${stayers.length > 1 ? 'they stay' : 'it stays'} put.` : ''}`,
      run: (c) => Promise.all([...movers.map((e) => { e.classList.add('neg'); return c.anim(e, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], 420); }), ...stayers.map((e) => { e.classList.add('stay'); return c.anim(e, [{ transform: 'scale(1)' }, { transform: 'scale(.92)' }, { transform: 'scale(1)' }], 420); })])
    });
    steps.push({
      cap: `<b>Cross the bar</b>: each one moves to the other side and its exponent becomes <b>positive</b>.`,
      run: async (c) => {
        const nt = T0.filter((e) => !e._mv), nb = B0.filter((e) => !e._mv);
        T0.filter((e) => e._mv).forEach((e) => nb.push(e)); B0.filter((e) => e._mv).forEach((e) => nt.push(e));
        const rowT = nt.length ? nt : [one.N], rowB = nb.length ? nb : [one.D];
        const xt = rowX(rowT), xb = rowX(rowB), jobs = [];
        rowT.forEach((e, i) => jobs.push(moveTo(c, e, xt[i], yN, 700)));
        rowB.forEach((e, i) => jobs.push(moveTo(c, e, xb[i], yD, 700)));
        if (!nt.length) jobs.push(c.fadeIn(one.N, 400, { delay: 300 }));
        if (nb.length && one.D.style.opacity !== '0') jobs.push(c.anim(one.D, [{ opacity: 1 }, { opacity: 0 }], 300));
        jobs.push(c.anim(bar, [{ width: bar.style.width }, { width: barW(rowT, rowB) + 'px' }], 600));
        await Promise.all(jobs);
        movers.forEach((e) => { e.innerHTML = T(e._t[1]); e.classList.remove('neg'); e.classList.add('pos'); });
        const xt2 = rowX(rowT), xb2 = rowX(rowB);
        await Promise.all([...movers.map((e) => c.pop(e, 380)), ...rowT.map((e, i) => moveTo(c, e, xt2[i], yN, 250)), ...rowB.map((e, i) => moveTo(c, e, xb2[i], yD, 250))]);
        T0 = nt; B0 = nb;
      }
    });
    steps.push({ cap: d.end, run: async (c) => { fin.innerHTML = T(d.fin); await c.fadeIn(fin, 450); } });
    if (d.trap) steps.push({
      cap: `<b>Watch out:</b> ${T('7x^{-3}')} is <b>not</b> ${T(d.trap)}. Only the base ${T('x')} has the negative exponent; the coefficient 7 never moves.`,
      run: async (c) => { side.innerHTML = `<div class="fl-wrong">${T('7x^{-3}\\neq' + d.trap)}</div><div class="muted">That would be ${T('7^{-1}x^{-3}')}.</div>`; await c.fadeIn(side, 400); }
    });
    return steps;
  }
};

/* ============ 7. Rational exponents: power ↔ radical, then evaluate root first ============ */
const RAD = {
  e8: { base: '64', rad: '64', m: 2, n: 3, r: '4', p: '16', v: 16 },
  e16: { base: '16', rad: '16', m: 3, n: 4, r: '2', p: '8', v: 8 },
  x27: { base: 'x', rad: 'x', m: 2, n: 7, sym: true, end: `<b>Example 7(a):</b> ${T('x^{2/7}=\\sqrt[7]{x^{2}}')}. The same value can be written ${T('\\left(\\sqrt[7]{x}\\right)^{2}')} — power inside or outside, either order works.` },
  e9: { base: '9', rad: '9', m: 3, n: 2, r: '3', p: '27', v: 27, end: `${T('p^{3/2}=9^{3/2}=27')} is the first piece of <b>Example 7(b)</b>. Try ${T('q=-27')} next.` },
  m27: { base: '(-27)', rad: '-27', m: 2, n: 3, neg: true, r: '-3', p: '9', recip: '\\dfrac{1}{9}', end: `<b>Example 7(b):</b> ${T('p^{3/2}-q^{-2/3}=27-\\tfrac19=26.888\\ldots\\approx\\mathbf{26.89}')}.` }
};
const radical = {
  title: 'Power ↔ radical: the denominator is the root',
  height: 430,
  choices: [{ v: 'e8', label: T('64^{2/3}') }, { v: 'e16', label: T('16^{3/4}') }, { sep: 'Example 7 check:' }, { v: 'x27', label: T('x^{2/7}') }, { v: 'e9', label: T('9^{3/2}') }, { v: 'm27', label: T('(-27)^{-2/3}') }],
  intro: (v) => { const d = RAD[v]; return `${T(`${d.base}^{${d.neg ? '-' : ''}${d.m}/${d.n}}`)}: a rational exponent is a <b>root</b> and a <b>power</b> in one. “<b>Power over root</b>” — the numerator is the power, the denominator is the root.`; },
  make(stage, v, ex) {
    const W = ex.W, d = RAD[v], px = W * 0.2, py = 132;
    const svg = add(stage, svgEl('svg', { class: 'rd-svg' }), 0, 0);
    // power form: base, then a stacked fraction exponent
    const base = add(stage, h('div', 'rd-base c', T(d.base)), px, py);
    const bw = base.offsetWidth || 60, ex0 = px + bw / 2 + 24;
    const mT = add(stage, h('div', 'rd-ex c m', String(d.m)), ex0, py - 58);
    const nT = add(stage, h('div', 'rd-ex c n', String(d.n)), ex0, py - 18);
    const sBar = add(stage, h('div', 'rd-sbar c'), ex0, py - 38);
    const minus = d.neg ? add(stage, h('div', 'rd-ex c neg', '−'), ex0 - 24, py - 58) : null;
    add(stage, h('div', 'rd-eq c', '='), W * 0.38, py);
    // radical form: ( ⁿ√ radicand )^m  or  ⁿ√( radicand^m ) for a symbolic base
    const rx = W * 0.46, top = py - (d.sym ? 64 : 42), bot = py + 36;
    const rad = add(stage, h('div', 'rd-rad c', T(d.rad)), 0, py); const rw = rad.offsetWidth || 60;
    const lp = add(stage, h('div', 'rd-par c', '('), rx, py + 2);
    const sx = rx + 22, rcx = sx + 42 + rw / 2;
    at(rad, rcx, py);
    const pIn = d.sym ? add(stage, h('div', 'rd-ex c m', String(d.m)), rcx + rw / 2 + 14, py - 30) : null;
    const lineEnd = rcx + rw / 2 + (d.sym ? 36 : 10);
    const rp = add(stage, h('div', 'rd-par c', ')'), lineEnd + 16, py + 2);
    const pOut = add(stage, h('div', 'rd-ex c m', String(d.m)), lineEnd + 42, py - 52);
    const idx = add(stage, h('div', 'rd-ex c n idx', String(d.n)), sx + 10, top - 6);
    const sign = svg.appendChild(svgEl('path', { class: 'rd-sign', d: `M ${sx - 4} ${py + 4} L ${sx + 6} ${py - 2} L ${sx + 20} ${bot} L ${sx + 36} ${top} L ${lineEnd} ${top}` }));
    sign.style.opacity = 0;
    const parts = [rad, lp, rp, pOut, idx]; if (pIn) parts.push(pIn); hide(...parts);
    const lines = [0, 1, 2].map((j) => { const e = add(stage, h('div', 'rd-line c'), W / 2, 248 + j * 58); e.style.opacity = 0; return e; });
    const badge = add(stage, h('div', 'rd-badge'), W - 20, 24); badge.style.translate = '-100% 0'; badge.style.opacity = 0;
    const fly = (c, el, to, ms = 700) => { const g = add(stage, h('div', el.className, el.innerHTML), parseFloat(el.style.left), parseFloat(el.style.top)); return moveTo(c, g, parseFloat(to.style.left), parseFloat(to.style.top), ms).then(() => { g.remove(); to.style.opacity = 1; }); };
    const steps = [];
    if (d.neg) steps.push({
      cap: `The exponent is <b>negative</b>, and that just means <b>reciprocal</b>. Set the minus sign aside: find ${T(`${d.base}^{${d.m}/${d.n}}`)} first, then flip it at the end.`,
      run: async (c) => { badge.innerHTML = `${T('-')} → reciprocal at the end`; await Promise.all([c.anim(minus, [{ opacity: 1 }, { opacity: 0.18 }], 500), c.fadeIn(badge, 400, { delay: 200 })]); }
    });
    steps.push({
      cap: d.n === 2 ? `The <b>denominator 2</b> is the index of the root: a <b>square root</b>. (Index 2 is usually not written.)` : `The <b>denominator ${d.n}</b> becomes the <b>index</b> of the root: a ${d.n === 3 ? 'cube' : d.n + 'th'} root of ${T(d.rad)}.`,
      run: async (c) => {
        nT.classList.add('lit');
        await Promise.all([fly(c, nT, idx), draw(c, sign, 700, { delay: 250 }), c.anim(sign, [{ opacity: 1 }, { opacity: 1 }], 10), c.fadeIn(rad, 400, { delay: 450 }), d.sym ? Promise.resolve() : Promise.all([c.fadeIn(lp, 300, { delay: 500 }), c.fadeIn(rp, 300, { delay: 500 })])]);
        if (d.n === 2) await c.anim(idx, [{ opacity: 1 }, { opacity: 0.3 }], 400);
      }
    });
    steps.push({
      cap: d.sym ? `The <b>numerator ${d.m}</b> is the <b>power</b>. With a variable base, write it inside: ${T(`\\sqrt[${d.n}]{${d.rad}^{${d.m}}}`)}.` : `The <b>numerator ${d.m}</b> is the <b>power</b>. Put it outside the root so we can take the root first.`,
      run: async (c) => { mT.classList.add('lit'); await fly(c, mT, d.sym ? pIn : pOut); }
    });
    if (d.sym) steps.push({ cap: d.end, run: async (c) => { lines[0].innerHTML = T(`x^{2/7}=\\sqrt[7]{x^{2}}=\\left(\\sqrt[7]{x}\\right)^{2}`); await c.fadeIn(lines[0], 450); } });
    else {
      const rootT = d.n === 2 ? `\\sqrt{${d.rad}}` : `\\sqrt[${d.n}]{${d.rad}}`, rP = d.r.startsWith('-') ? `(${d.r})` : d.r;
      steps.push({
        cap: `<b>Root first</b> — it makes the number smaller and easier: ${T(`${rootT}=${d.r}`)}${d.rad.startsWith('-') ? ` (an odd root of a negative is negative: ${T('(-3)^3=-27')})` : ''}.`,
        run: async (c) => { lines[0].innerHTML = T(`${d.base}^{${d.m}/${d.n}}=\\left(${rootT}\\right)^{${d.m}}=${rP}^{${d.m}}`); await c.fadeIn(lines[0], 450); }
      });
      steps.push({
        cap: `<b>Then the power</b>: ${T(`${rP}^{${d.m}}=${d.p}`)}.${d.neg ? ' Not done yet — remember the minus sign.' : d.end ? ' ' + d.end : ''}`,
        run: async (c) => { lines[1].innerHTML = T(`=${d.p}`); await c.fadeIn(lines[1], 400); }
      });
      if (d.neg) steps.push({
        cap: `Now the <b>reciprocal</b>: ${T(`${d.base}^{-${d.m}/${d.n}}=\\dfrac{1}{${d.p}}`)}. Positive — a negative exponent never makes a number negative.`,
        run: async (c) => { lines[2].innerHTML = T(`${d.base}^{-${d.m}/${d.n}}=\\dfrac{1}{${d.base}^{${d.m}/${d.n}}}=${d.recip}`); await Promise.all([c.fadeIn(lines[2], 400), c.anim(minus, [{ opacity: 0.18 }, { opacity: 1 }], 400)]); }
      });
      if (d.neg && d.end) steps.push({ cap: d.end, run: async (c) => { badge.innerHTML = T('27-\\tfrac19\\approx26.89'); await flash(c, badge); } });
    }
    return steps;
  }
};

/* ============ 8. Extension: scientific notation ============ */
const SCI = {
  a: { op: 'mul', A: ['2', 3], B: ['4', 5] },
  b: { op: 'mul', A: ['7.5', 4], B: ['6.0', -9] },
  e9: { op: 'mul', A: ['5.4', -2], B: ['3.0', 6], tag: 'Example 9' },
  e10: { op: 'div', A: ['1.6', 0], B: ['6.4', -5], tag: 'Example 10', std: '25\\,000' }
};
const sciT = (a, n) => `${a}\\times10^{${n}}`;
const sci = {
  title: 'Scientific notation: coefficients, then powers of 10',
  height: 450,
  choices: [{ v: 'a', label: T('(2\\times10^3)(4\\times10^5)') }, { v: 'b', label: T('(7.5\\times10^4)(6.0\\times10^{-9})') }, { sep: 'Example 9 check:' }, { v: 'e9', label: T('(5.4\\times10^{-2})(3.0\\times10^{6})') }, { sep: 'Example 10:' }, { v: 'e10', label: T('1.6\\div(6.4\\times10^{-5})') }],
  intro: (v) => `Group the <b>coefficients</b> together and the <b>powers of 10</b> together — the Product and Quotient Laws do the rest. Then check the coefficient is between 1 and 10.`,
  make(stage, v, ex) {
    const W = ex.W, d = SCI[v], mul = d.op === 'mul';
    const expr = mul ? `(${sciT(...d.A)})\\times(${sciT(...d.B)})` : `\\dfrac{${d.A[0]}}{${sciT(...d.B)}}`;
    add(stage, h('div', 'sn-main c', T(expr)), W / 2, 58);
    const cx = [W * 0.28, W * 0.72], heads = ['coefficients', 'powers of 10'];
    const cols = heads.map((t, i) => { const e = add(stage, h('div', 'sn-col', `<div class="cl-h">${t}</div>`), cx[i] - W * 0.2, 110); e.style.width = W * 0.4 + 'px'; e.style.opacity = 0; return e; });
    const L = [0, 1].map((i) => [0, 1].map((j) => { const e = add(stage, h('div', 'cl-l c'), cx[i], 172 + j * 54); e.style.opacity = 0; return e; }));
    const coefV = mul ? Number(d.A[0]) * Number(d.B[0]) : Number(d.A[0]) / Number(d.B[0]);
    const eV = mul ? d.A[1] + d.B[1] : d.A[1] - d.B[1];
    const cs = num(coefV);
    // the "decimal hop" line: digits in fixed slots, a movable point, then × 10^e
    const big = add(stage, h('div', 'sn-big'), 0, 300);
    const digits = cs.replace('.', ''), p0 = cs.includes('.') ? cs.indexOf('.') : cs.length;
    const dw = 30, pw = 16, nd = digits.length, boxW = nd * dw + pw;
    const dBox = h('div', 'sn-digits'); dBox.style.width = boxW + 'px'; big.appendChild(dBox);
    const dX = (i, p, skip = 0) => ((i - skip) * dw + (i >= p ? pw : 0)) + 'px'; // the point gets its own narrow slot
    const dEls = digits.split('').map((ch, i) => { const e = h('span', 'sn-d', ch); e.style.left = dX(i, p0); dBox.appendChild(e); return e; });
    const pt = h('span', 'sn-pt', '.'); dBox.appendChild(pt);
    const ptX = (k, skip = 0) => ((k - skip) * dw) + 'px'; pt.style.left = ptX(p0); if (p0 >= nd) pt.style.opacity = 0;
    const tail = h('span', 'sn-tail', `${T('\\times10')}<sup class="sn-e">${eV}</sup>`); big.appendChild(tail);
    const bigW = boxW + 110; at(big, W / 2 - bigW / 2, 312); big.style.opacity = 0;
    const eEl = tail.querySelector('.sn-e');
    const verdict = add(stage, h('div', 'sn-check'), W / 2 + bigW / 2 + 26, 344); verdict.style.translate = '0 -50%'; verdict.style.opacity = 0;
    const fin = add(stage, h('div', 'sn-fin c'), W / 2, 412); fin.style.opacity = 0;
    const lead = Math.floor(Math.log10(Math.abs(coefV)) + 1e-12); // how far to hop: 16.2 → 1, 0.25 → −1
    const a2 = num(coefV / Math.pow(10, lead)), e2 = eV + lead;
    const steps = [{
      cap: mul ? `Multiplication can be regrouped: put the <b>coefficients</b> in one column and the <b>powers of 10</b> in the other.`
        : `Write ${T(d.A[0])} as ${T(sciT(d.A[0], 0))} so both parts have a power of 10, then split the fraction into two columns.`,
      run: (c) => {
        const l0 = mul ? `${d.A[0]}\\times${d.B[0]}` : `\\dfrac{${d.A[0]}}{${d.B[0]}}`, l1 = mul ? `10^{${d.A[1]}}\\times10^{${d.B[1]}}` : `\\dfrac{10^{${d.A[1]}}}{10^{${d.B[1]}}}`;
        L[0][0].innerHTML = T(l0); L[1][0].innerHTML = T(l1);
        return Promise.all([c.fadeIn(cols[0], 300), c.fadeIn(cols[1], 300, { delay: 120 }), c.fadeIn(L[0][0], 380, { delay: 200 }), c.fadeIn(L[1][0], 380, { delay: 320 })]);
      }
    }, {
      cap: `Coefficients: ${T(mul ? `${d.A[0]}\\times${d.B[0]}=${cs}` : `${d.A[0]}\\div${d.B[0]}=${cs}`)}.`,
      run: (c) => { L[0][1].innerHTML = T('=' + cs); return c.fadeIn(L[0][1], 380); }
    }, {
      cap: mul ? `Powers of 10: <b>Product Law</b>, add the exponents. ${T(`${d.A[1]}+${par(d.B[1])}=${eV}`)}.` : `Powers of 10: <b>Quotient Law</b>, subtract the exponents. ${T(`${d.A[1]}-${par(d.B[1])}=${eV}`)}.`,
      run: (c) => { L[1][1].innerHTML = T(mul ? `=10^{${d.A[1]}+${par(d.B[1])}}=10^{${eV}}` : `=10^{${d.A[1]}-${par(d.B[1])}}=10^{${eV}}`); return c.fadeIn(L[1][1], 380); }
    }, {
      cap: lead === 0 ? `Together: ${T(sciT(cs, eV))}. Is the coefficient between 1 and 10? <b>Yes</b> — this is already proper scientific notation.`
        : `Together: ${T(sciT(cs, eV))}. But ${T(cs)} is ${lead > 0 ? '<b>10 or more</b>' : '<b>less than 1</b>'}, so this is <b>not</b> proper scientific notation yet.`,
      run: async (c) => {
        verdict.innerHTML = lead === 0 ? `${T('1\\le ' + cs + '<10')} ✓` : `${T(lead > 0 ? cs + '\\ge10' : cs + '<1')} ✗`;
        verdict.className = 'sn-check ' + (lead === 0 ? 'ok' : 'red');
        await c.fadeIn(big, 400); await c.fadeIn(verdict, 350);
      }
    }];
    if (lead !== 0) steps.push({
      cap: lead > 0 ? `Hop the decimal point <b>left</b> ${lead === 1 ? 'one place' : lead + ' places'}: ${T(`${cs}=${a2}\\times10^{${lead}}`)}. That extra factor of 10 goes into the exponent: ${T(`${eV}+${lead}=${e2}`)}.`
        : `Hop the decimal point <b>right</b> one place: ${T(`${cs}=${a2}\\times10^{-1}`)}. So the exponent goes <b>down</b> one: ${T(`${eV}-1=${e2}`)}.`,
      run: async (c) => {
        const p1 = p0 - lead, drop = lead < 0 && digits[0] === '0' ? 1 : 0;
        await Promise.all([c.anim(pt, [{ left: pt.style.left, opacity: Number(pt.style.opacity || 1) }, { left: ptX(p1), opacity: 1 }], 600),
          ...dEls.map((e, i) => c.anim(e, [{ left: e.style.left }, { left: dX(i, p1) }], 600))]);
        if (drop) { // drop the leading zero and close the gap
          await c.anim(dEls[0], [{ opacity: 1 }, { opacity: 0 }], 250);
          await Promise.all([...dEls.slice(1).map((e, i) => c.anim(e, [{ left: e.style.left }, { left: dX(i + 1, p1, 1) }], 300)), c.anim(pt, [{ left: pt.style.left }, { left: ptX(p1, 1) }], 300), c.anim(dBox, [{ width: dBox.style.width }, { width: (boxW - dw) + 'px' }], 300)]);
        }
        eEl.textContent = e2; await c.pop(eEl, 380);
        verdict.innerHTML = `${T('1\\le ' + a2 + '<10')} ✓`; verdict.className = 'sn-check ok'; await flash(c, verdict);
      }
    });
    const ans = sciT(lead === 0 ? cs : a2, lead === 0 ? eV : e2);
    steps.push({
      cap: d.std ? `<b>${d.tag}:</b> ${T(ans + '=' + d.std)}. About <b>25 000 sheets</b> — see the stack below.` : `${d.tag ? '<b>' + d.tag + ':</b> ' : ''}${T(expr + '=' + ans)}.`,
      run: async (c) => { fin.innerHTML = T((d.std ? '\\dfrac{1.6}{6.4\\times10^{-5}}' : expr) + '=' + ans + (d.std ? '=' + d.std : '')); await c.fadeIn(fin, 450); }
    });
    return steps;
  }
};

/* ============ 8. Extension: the stack of thin sheets ============ */
const STACK = {
  e10: { what: 'aluminum foil', t: ['6.4', -5], dec: '0.000\\,064', H: 1.6, ratio: '0.25', e: 5, sn: '2.5\\times10^{4}', N: 25000, tag: 'Example 10' },
  paper: { what: 'printer paper', t: ['1.0', -4], dec: '0.000\\,1', H: 1.2, ratio: '1.2', e: 4, sn: '1.2\\times10^{4}', N: 12000 },
  card: { what: 'plastic cards', t: ['7.6', -4], dec: '0.000\\,76', H: 1.52, ratio: '0.2', e: 4, sn: '2.0\\times10^{3}', N: 2000 }
};
const nfmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
const stack = {
  title: 'How many thin sheets make a stack?',
  height: 440,
  choices: [{ v: 'paper', label: 'paper' }, { v: 'card', label: 'plastic cards' }, { sep: 'Example 10 check:' }, { v: 'e10', label: 'aluminum foil' }],
  intro: (v) => { const d = STACK[v]; return `One sheet of ${d.what} is ${T(sciT(...d.t) + '\\text{ m}')} thick. How many sheets make a stack ${T(d.H + '\\text{ m}')} high?`; },
  make(stage, v, ex) {
    const W = ex.W, d = STACK[v], y0 = 404, ppm = 170, sx = 96, sw = 120; // 0 m at y0, 170 px per metre
    const svg = add(stage, svgEl('svg', { class: 'st-svg' }), 0, 0);
    svg.appendChild(svgEl('line', { x1: 60, y1: y0, x2: 60, y2: y0 - 2 * ppm, class: 'st-axis' }));
    for (let m = 0; m <= 2; m += 0.5) {
      svg.appendChild(svgEl('line', { x1: 52, y1: y0 - m * ppm, x2: 68, y2: y0 - m * ppm, class: 'st-axis' }));
      const t = svgEl('text', { x: 44, y: y0 - m * ppm + 6, class: 'st-lab' }); t.textContent = m + ' m'; svg.appendChild(t);
    }
    svg.appendChild(svgEl('line', { x1: 60, y1: y0, x2: sx + sw + 50, y2: y0, class: 'st-floor' }));
    const target = svg.appendChild(svgEl('line', { x1: 60, y1: y0 - d.H * ppm, x2: sx + sw + 40, y2: y0 - d.H * ppm, class: 'st-target' }));
    target.style.opacity = 0;
    const tlab = add(stage, h('div', 'st-tlab', T(d.H + '\\text{ m}')), sx + sw + 44, y0 - d.H * ppm - 14); tlab.style.opacity = 0;
    const pile = add(stage, h('div', 'st-pile'), sx, y0); pile.style.width = sw + 'px'; pile.style.height = '0px';
    const count = add(stage, h('div', 'st-count c', '0 sheets'), sx + sw / 2, y0 - 22); count.style.opacity = 0;
    // zoom bubble: one sheet, hugely magnified
    const zx = W * 0.36;
    const zoom = add(stage, h('div', 'st-zoom', `<div class="st-zh">one sheet, magnified</div><div class="st-sheet"></div><div class="st-dim">${T(sciT(...d.t) + '\\text{ m}=' + d.dec + '\\text{ m}')}</div>`), zx, 22);
    zoom.style.width = (W - zx - 24) + 'px'; zoom.style.opacity = 0;
    const lines = [0, 1, 2].map((j) => { const e = add(stage, h('div', 'st-line'), zx + 10, 196 + j * 66); e.style.opacity = 0; return e; });
    return [{
      cap: `One sheet is ${T(sciT(...d.t) + '\\text{ m}')} ${T('=' + d.dec + '\\text{ m}')} thick — ${(() => { const mm = d.t[0] * Math.pow(10, d.t[1] + 3); return mm < 0.08 ? 'far thinner than a millimetre' : mm < 0.2 ? 'about a tenth of a millimetre' : 'less than a millimetre (' + (Math.round(mm * 100) / 100) + ' mm)'; })()}.`,
      run: (c) => c.fadeIn(zoom, 450)
    }, {
      cap: `The stack has to reach ${T(d.H + '\\text{ m}')}.`,
      run: (c) => Promise.all([c.anim(target, [{ opacity: 0 }, { opacity: 1 }], 400), c.fadeIn(tlab, 400)])
    }, {
      cap: `Each sheet adds the same thickness, so <b>number of sheets = total height ÷ one sheet’s thickness</b>.`,
      run: (c) => { lines[0].innerHTML = T(`\\text{sheets}=\\dfrac{${d.H}}{${sciT(...d.t)}}`); return c.fadeIn(lines[0], 400); }
    }, {
      cap: `Write ${T(String(d.H))} as ${T(sciT(d.H, 0))}. Divide the coefficients and <b>subtract</b> the exponents: ${T(`0-(${d.t[1]})=${d.e}`)}.`,
      run: (c) => { lines[1].innerHTML = T(`=\\dfrac{${d.H}}{${d.t[0]}}\\times10^{0-(${d.t[1]})}=${d.ratio}\\times10^{${d.e}}`); return c.fadeIn(lines[1], 400); }
    }, {
      cap: `${d.tag ? '<b>' + d.tag + ':</b> ' : ''}${T(`${d.ratio}\\times10^{${d.e}}${d.ratio === d.sn.split('\\times')[0] ? '' : '=' + d.sn}=${nfmt(d.N).replace(/\u202f/g, '\\,')}`)}. About <b>${nfmt(d.N)} sheets</b>.`,
      run: async (c) => {
        lines[2].innerHTML = T(`=${d.sn}=${nfmt(d.N).replace(/\u202f/g, '\\,')}\\text{ sheets}`);
        const hgt = d.H * ppm;
        if (c.fast) { pile.style.height = hgt + 'px'; pile.style.top = (y0 - hgt) + 'px'; count.textContent = nfmt(d.N) + ' sheets'; at(count, sx + sw / 2, y0 - hgt - 22); count.style.opacity = 1; lines[2].style.opacity = 1; return; }
        count.style.opacity = 1;
        const t0 = performance.now(), ms = 1800;
        const tick = (now) => { const t = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 2); count.textContent = nfmt(Math.round(d.N * e)) + ' sheets'; at(count, sx + sw / 2, y0 - hgt * e - 22); if (t < 1 && count.isConnected) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
        await Promise.all([c.anim(pile, [{ height: '0px', top: y0 + 'px' }, { height: hgt + 'px', top: (y0 - hgt) + 'px' }], ms, { easing: 'cubic-bezier(.3,.6,.5,1)' }), c.fadeIn(lines[2], 400, { delay: ms - 300 })]);
      }
    }];
  }
};

/* ============ wiring: explainers ============ */
const explainers = [];
function mountExplainers() {
  const defs = { anatomy, expand, columns, flip, radical, distribute, sci, stack };
  document.querySelectorAll('[data-explainer]').forEach((el) => explainers.push(new Explainer(el, defs[el.dataset.explainer])));
  // KaTeX fonts arrive after the first build; redraw untouched explainers so measured widths are right.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => explainers.forEach((e) => { if (!e.running && e.k === 0) e.build(0); }));
}

/* ============ warm-up: Power Rankings bracket ============ */
const P = { a: '2^{100}', b: '10^{30}', c: '8^{33}', d: '16^{24}', e: '4^{50}', f: '5^{40}', g: '3^{60}', h: '2^{90}' };
const MATCHES = {
  m1: { p: ['a', 'b'], rw: ['=1024^{10}', '=1000^{10}'], win: 0, to: ['s1', 0], note: `${T('2^{100}=(2^{10})^{10}=1024^{10}')} and ${T('10^{30}=(10^{3})^{10}=1000^{10}')}. <b>Same exponent</b>, so the bigger base wins: ${T('2^{100}')}.` },
  m2: { p: ['c', 'd'], rw: ['=2^{99}', '=2^{96}'], win: 0, to: ['s1', 1], note: `${T('8^{33}=(2^{3})^{33}=2^{99}')} and ${T('16^{24}=(2^{4})^{24}=2^{96}')}. <b>Same base</b>, so the bigger exponent wins: ${T('8^{33}')}.` },
  m3: { p: ['e', 'f'], rw: ['=1024^{10}', '=625^{10}'], win: 0, to: ['s2', 0], note: `${T('4^{50}=(4^{5})^{10}=1024^{10}')} and ${T('5^{40}=(5^{4})^{10}=625^{10}')}. Same exponent: ${T('4^{50}')} wins.` },
  m4: { p: ['g', 'h'], rw: ['=9^{30}', '=8^{30}'], win: 0, to: ['s2', 1], note: `${T('3^{60}=(3^{2})^{30}=9^{30}')} and ${T('2^{90}=(2^{3})^{30}=8^{30}')}. Same exponent: ${T('3^{60}')} wins.` },
  s1: { rw: ['=2\\times2^{99}', '=2^{99}'], win: 0, to: ['f', 0], note: `${T('8^{33}=2^{99}')}, and ${T('2^{100}=2\\times2^{99}')} is <b>twice as big</b>. ${T('2^{100}')} goes to the final.` },
  s2: { rw: ['=1024^{10}', '=729^{10}'], win: 0, to: ['f', 1], note: `${T('4^{50}=1024^{10}')} and ${T('3^{60}=(3^{6})^{10}=729^{10}')}. ${T('4^{50}')} goes to the final.` },
  f: { rw: ['', '=(2^{2})^{50}=2^{100}'], win: -1, note: `<b>It’s a tie!</b> ${T('4^{50}=(2^{2})^{50}=2^{100}')} — the <b>same number</b>, about ${T('1.27\\times10^{30}')}. The big one is <b>D</b>.` }
};
function mountBracket() {
  const host = document.getElementById('bracket'); if (!host) return;
  const stage = host.querySelector('.pr-stage'), note = host.querySelector('.pr-note');
  const W = stage.clientWidth || 968, H = 410, bw = 132, bh = 66, mid = W / 2;
  const svg = stage.appendChild(svgEl('svg', { class: 'pr-svg', viewBox: `0 0 ${W} ${H}` }));
  const line = (pts, cls = '') => svg.appendChild(svgEl('polyline', { points: pts.map((p) => p.join(',')).join(' '), class: 'pr-line ' + cls }));
  const X = { r1: 72, sf: 252, jr1: 163, jsf: 346 }, Y = { r1: [60, 148, 256, 344], sf: [104, 300] };
  const mirror = (x) => W - x;
  const box = (x, y, cls) => { const b = h('div', 'pr-box ' + cls, '<div class="pr-p"></div><div class="pr-rw"></div>'); at(b, x - bw / 2, y - bh / 2); b.style.width = bw + 'px'; b.style.height = bh + 'px'; stage.appendChild(b); return b; };
  const slots = {};
  // round 1 players
  const r1 = { m1: [[X.r1, Y.r1[0]], [X.r1, Y.r1[1]]], m2: [[X.r1, Y.r1[2]], [X.r1, Y.r1[3]]], m3: [[mirror(X.r1), Y.r1[0]], [mirror(X.r1), Y.r1[1]]], m4: [[mirror(X.r1), Y.r1[2]], [mirror(X.r1), Y.r1[3]]] };
  const sf = { s1: [[X.sf, Y.sf[0]], [X.sf, Y.sf[1]]], s2: [[mirror(X.sf), Y.sf[0]], [mirror(X.sf), Y.sf[1]]] };
  const fin = { f: [[mid, 160], [mid, 304]] };
  const all = Object.assign({}, r1, sf, fin);
  for (const m in all) slots[m] = all[m].map(([x, y]) => box(x, y, m[0] === 'm' ? 'player' : 'empty' + (m === 'f' ? ' final' : '')));
  // bracket lines
  const side = (fx) => {
    [[0, 1, 104], [2, 3, 300]].forEach(([a, b, ym]) => {
      line([[fx(X.r1 + bw / 2), Y.r1[a]], [fx(X.jr1), Y.r1[a]], [fx(X.jr1), Y.r1[b]], [fx(X.r1 + bw / 2), Y.r1[b]]]);
      line([[fx(X.jr1), ym], [fx(X.sf - bw / 2), ym]]);
    });
    line([[fx(X.sf + bw / 2), Y.sf[0]], [fx(X.jsf), Y.sf[0]], [fx(X.jsf), Y.sf[1]], [fx(X.sf + bw / 2), Y.sf[1]]]);
  };
  side((x) => x); side(mirror);
  line([[X.jsf, 202], [X.jsf + 36, 202], [X.jsf + 36, 160], [mid - bw / 2, 160]]);
  line([[mirror(X.jsf), 202], [mirror(X.jsf) - 36, 202], [mirror(X.jsf) - 36, 304], [mid + bw / 2, 304]]);
  // trophy + labels
  const tro = h('div', 'pr-trophy');
  tro.innerHTML = '<svg viewBox="0 0 120 100"><path class="h" d="M30 18 C6 18 8 48 34 46"/><path class="h" d="M90 18 C114 18 112 48 86 46"/><path class="cup" d="M26 8 H94 L86 44 C80 58 66 62 64 66 V78 H56 V66 C54 62 40 58 34 44 Z"/><rect class="cup" x="44" y="78" width="32" height="8"/><rect class="foot" x="36" y="86" width="48" height="10" rx="2"/><text x="60" y="38">★</text></svg>';
  at(tro, mid - 46, 18); stage.appendChild(tro);
  [['Round 1', X.r1], ['Semis', X.sf], ['Round 1', mirror(X.r1)], ['Semis', mirror(X.sf)]].forEach(([t, x]) => { const e = h('div', 'pr-round c', t); at(e, x, 14); stage.appendChild(e); });
  const handy = h('div', 'pr-handy c', `Handy: ${T('2^{10}=1024')}`); at(handy, mid, 384); stage.appendChild(handy);
  // match buttons
  const btnAt = { m1: [X.jr1, 104], m2: [X.jr1, 300], m3: [mirror(X.jr1), 104], m4: [mirror(X.jr1), 300], s1: [X.jsf, 202], s2: [mirror(X.jsf), 202], f: [mid, 232] };
  const btns = {};
  for (const m in btnAt) { const b = h('button', 'pr-vs c', m === 'f' ? 'final' : 'vs'); b.type = 'button'; at(b, ...btnAt[m]); stage.appendChild(b); btns[m] = b; b.onclick = () => play(m); }
  const filled = {};
  const setP = (b, key) => { b.querySelector('.pr-p').innerHTML = T(P[key]); b.dataset.k = key; };
  function reset() {
    for (const m in slots) slots[m].forEach((b) => { b.className = 'pr-box ' + (m[0] === 'm' ? 'player' : 'empty' + (m === 'f' ? ' final' : '')); b.querySelector('.pr-p').innerHTML = m[0] === 'm' ? '' : '?'; b.querySelector('.pr-rw').innerHTML = ''; delete b.dataset.k; });
    for (const m in r1) MATCHES[m].p.forEach((k, i) => setP(slots[m][i], k));
    for (const m in btns) { btns[m].classList.remove('done'); btns[m].disabled = m[0] !== 'm'; }
    for (const m in slots) filled[m] = m[0] === 'm' ? 2 : 0;
    note.innerHTML = '<span class="muted">Tap a <b>vs</b> button to play a match. Rewrite both powers so they share a base or an exponent — then compare.</span>';
    tro.classList.remove('won');
  }
  function play(m) {
    const M = MATCHES[m], bs = slots[m];
    if (btns[m].classList.contains('done') || filled[m] < 2) return;
    btns[m].classList.add('done'); btns[m].disabled = true;
    bs.forEach((b, i) => { const rw = b.querySelector('.pr-rw'); rw.innerHTML = M.rw[i] ? T(M.rw[i]) : '&nbsp;'; rw.animate([{ opacity: 0 }, { opacity: 1 }], 400); });
    if (M.win < 0) { bs.forEach((b) => b.classList.add('win', 'tie')); tro.classList.add('won'); }
    else bs.forEach((b, i) => b.classList.add(i === M.win ? 'win' : 'lose'));
    note.innerHTML = '<div>' + M.note + '</div>'; note.animate([{ opacity: 0.2 }, { opacity: 1 }], 300);
    if (M.to) {
      const [nm, i] = M.to, nb = slots[nm][i];
      setTimeout(() => { setP(nb, bs[M.win].dataset.k); nb.classList.remove('empty'); nb.classList.add('player'); nb.animate([{ transform: 'scale(.5)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)' }], 420); filled[nm]++; if (filled[nm] === 2) btns[nm].disabled = false; }, 450);
    }
  }
  host.querySelector('[data-pr=reset]').onclick = reset;
  host.querySelector('[data-pr=all]').onclick = () => { const order = ['m1', 'm2', 'm3', 'm4', 's1', 's2', 'f']; let t = 0; order.forEach((m) => { if (!btns[m].classList.contains('done')) { setTimeout(() => play(m), t); t += 900; } }); };
  reset();
}

/* ============ 1. Laws at a glance: the card deck ============ */
function mountDeck() {
  const deck = document.querySelector('.law-deck'); if (!deck) return;
  const cards = [...deck.querySelectorAll('.law')];
  cards.forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
  const all = document.querySelector('[data-deckall]');
  if (all) all.addEventListener('click', () => { const on = !cards.every((b) => b.classList.contains('on')); cards.forEach((b, i) => setTimeout(() => b.classList.toggle('on', on), on ? i * 90 : 0)); all.textContent = on ? 'Hide all reasons' : 'Show all reasons'; });
}

/* ============ 4. Which law applies? The sorter ============ */
const SORT = [
  { lab: 'I', t: 'b^{5}\\times b^{3}', ok: 1, why: `Multiplying: <b>add</b> the exponents. ${T('b^{5+3}=b^{8}')}` },
  { lab: 'II', t: 'b^{10}-b^{2}', ok: 0, why: `<b>Subtraction</b> — no exponent law applies. Unlike terms can’t be combined at all.` },
  { lab: 'III', t: 'b^{10}\\div b^{2}', ok: 1, why: `Dividing: <b>subtract</b> the exponents. ${T('b^{10-2}=b^{8}')}` },
  { lab: 'IV', t: 'b^{4}+b^{4}', ok: 0, why: `<b>Adding</b> like terms adds the coefficients: ${T('2b^{4}')}, not ${T('b^{8}')}.` },
  { lab: '★', t: '(b^{4})^{2}', ok: 1, why: `Power of a Power: <b>multiply</b> the exponents. ${T('b^{4\\times2}=b^{8}')}` },
  { lab: '★', t: 'b^{4}\\times b^{4}', ok: 1, why: `${T('b^{4+4}=b^{8}')}. Compare with IV: <b>×</b> combines, <b>+</b> doesn’t.` },
  { lab: '★', t: 'b^{16}\\div b^{2}', ok: 0, why: `${T('b^{16-2}=b^{14}')}. Subtract the exponents — don’t divide them.` },
  { lab: '★', t: 'b^{2}\\times b^{4}', ok: 0, why: `${T('b^{2+4}=b^{6}')}. Add the exponents — don’t multiply them.` }
];
function mountSorter() {
  const host = document.getElementById('sorter'); if (!host) return;
  const stage = host.querySelector('.so-stage'), tally = host.querySelector('.so-tally');
  const W = stage.clientWidth || 968, cw = 108, chh = 80, gap = (W - SORT.length * cw) / (SORT.length - 1);
  const binW = (W - 16) / 2, binY = 116, slotH = 77;
  const bins = [0, 1].map((k) => { const b = h('div', 'so-bin ' + (k ? 'no' : 'yes'), `<div class="so-bh">${k ? `does <b>not</b> simplify to ${T('b^8')} ✗` : `simplifies to ${T('b^8')} ✓`}</div>`); at(b, k ? binW + 16 : 0, binY); b.style.width = binW + 'px'; stage.appendChild(b); return b; });
  const used = [0, 0];
  const items = SORT.map((s, i) => {
    const home = [i * (cw + gap), 4];
    const card = h('button', 'so-card' + (s.lab === '★' ? ' extra' : ''), `<span class="so-lab">${s.lab}</span>${T(s.t)}`); card.type = 'button';
    card.style.width = cw + 'px'; card.style.height = chh + 'px'; at(card, ...home); stage.appendChild(card);
    const why = h('div', 'so-why', '<div>' + s.why + '</div>'); stage.appendChild(why);
    const it = { s, card, why, home, placed: false };
    card.onclick = () => place(it);
    return it;
  });
  function place(it, quick) {
    if (it.placed) return;
    const k = it.s.ok ? 0 : 1, j = used[k]++, x = (k ? binW + 16 : 0) + 10, y = binY + 50 + j * slotH;
    it.placed = true; it.card.classList.add('placed', k ? 'no' : 'yes'); it.card.style.height = (chh - 10) + 'px';
    const from = { left: it.card.style.left, top: it.card.style.top };
    at(it.card, x, y);
    at(it.why, x + cw + 14, y); it.why.style.width = (binW - cw - 44) + 'px'; it.why.style.height = (chh - 10) + 'px';
    if (!quick) { it.card.animate([from, { left: x + 'px', top: y + 'px' }], { duration: 650, easing: 'cubic-bezier(.25,.75,.3,1)' }); it.why.animate([{ opacity: 0 }, { opacity: 0 }, { opacity: 1 }], 900); }
    it.why.classList.add('on');
    const ex3 = items.slice(0, 4);
    if (ex3.every((t) => t.placed)) { tally.classList.add('on'); }
  }
  host.querySelector('[data-so=all]').onclick = () => items.forEach((it, i) => setTimeout(() => place(it), i * 260));
  host.querySelector('[data-so=reset]').onclick = () => { used[0] = used[1] = 0; items.forEach((it) => { it.placed = false; it.card.className = 'so-card' + (it.s.lab === '★' ? ' extra' : ''); it.card.style.height = chh + 'px'; at(it.card, ...it.home); it.why.classList.remove('on'); }); tally.classList.remove('on'); };
}

/* ============ small reveals: warm-up questions, polls, think cards ============ */
function mountReveals() {
  document.querySelectorAll('[data-rv]').forEach((b) => b.addEventListener('click', () => { const t = document.getElementById(b.dataset.rv); if (t) t.classList.toggle('on'); }));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
  document.querySelectorAll('.tie-chip').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
}

mountExplainers(); mountBracket(); mountDeck(); mountSorter(); mountReveals();
