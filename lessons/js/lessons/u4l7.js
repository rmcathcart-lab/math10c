/* Math 10C · Unit 4 · Lesson 7 — Extension: Solving Polynomial Equations by Factoring.
 * The explainers (product machine, x sweep, why 0, the four-step solve, the trough, the story check),
 * the "When Does It Land?" warm-up and the Example 5 figures. */
import { h, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const box = (el, w, hh) => { el.style.width = w + 'px'; if (hh != null) el.style.height = hh + 'px'; return el; };
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

/* KaTeX allowing \htmlClass (factors that light up) */
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};
const T = (s) => tex(s);
const strip = (s) => s.replace(/\\htmlClass\{[^}]*\}\{/g, '{');

const TEAL = '#13807a', AMB = '#c27a0e', RED = '#c93a33', INK = '#1c2230';

/* an element's box in stage coordinates (the lesson may be scaled to fit the screen) */
function stagePos(stage, el) {
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2 - sr.left) / k, y: (r.top + r.height / 2 - sr.top) / k, l: (r.left - sr.left) / k, t: (r.top - sr.top) / k, r: (r.right - sr.left) / k, b: (r.bottom - sr.top) / k };
}
function layer(stage) { const s = svgEl('svg', { class: 'u4l7-svg' }); stage.appendChild(s); return s; }
/* a straight arrow that draws itself */
function sArrow(svg, x1, y1, x2, y2, col) {
  const ang = Math.atan2(y2 - y1, x2 - x1), L = 14, wd = 0.45;
  const p = svgEl('path', { d: `M${x1} ${y1} L${x2 - 6 * Math.cos(ang)} ${y2 - 6 * Math.sin(ang)}`, stroke: col, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round' });
  const hd = svgEl('polygon', { points: [[x2, y2], [x2 - L * Math.cos(ang - wd), y2 - L * Math.sin(ang - wd)], [x2 - L * Math.cos(ang + wd), y2 - L * Math.sin(ang + wd)]].map((q) => q.join(',')).join(' '), fill: col });
  svg.append(p, hd);
  const len = Math.hypot(x2 - x1, y2 - y1);
  p.style.strokeDasharray = len; p.style.strokeDashoffset = len; hd.style.opacity = 0;
  return { async draw(c, ms = 420) { await c.anim(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], ms); await c.anim(hd, [{ opacity: 0 }, { opacity: 1 }], 120); } };
}
const pulse = (c, el, s = 1.14) => c.anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], 460);
function stampIn(c, el) { return c.anim(el, [{ opacity: 0, transform: 'scale(1.9) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' }); }

/* ============ 1. The product machine ============ */
const machine = {
  title: 'The product machine: what makes a product 0?',
  height: 400,
  intro: 'Two numbers go in, their <b>product</b> comes out. Which inputs give a product of exactly <b>0</b>?',
  make(stage, v, ex) {
    const W = ex.W, cx = W / 2, my = 126;
    add(stage, box(h('div', 'u4l7-mbody'), 740, 176), cx - 370, 30);
    add(stage, h('div', 'u4l7-mlab c', 'Product machine'), cx, 30);
    const slot = (x, w, cls) => add(stage, box(h('div', 'u4l7-mslot c ' + cls), w, 104), x, my);
    const A = slot(cx - 245, 150, 'a'), B = slot(cx - 35, 150, 'b'), P = slot(cx + 215, 190, 'p');
    add(stage, h('div', 'u4l7-mop c', K('\\times')), cx - 140, my);
    add(stage, h('div', 'u4l7-mop c', K('=')), cx + 76, my);
    [['A', cx - 245], ['B', cx - 35], ['product', cx + 215]].forEach(([t, x]) => add(stage, h('div', 'u4l7-mtag c', t), x, my + 66));
    const back = add(stage, h('div', 'u4l7-mback c', '◀ run it backwards'), cx + 215, 58); hide(back);
    const log = add(stage, h('div', 'u4l7-mlog'), 30, 226); box(log, W - 60);
    const law = add(stage, h('div', 'u4l7-mlaw c', `<b>Product is 0</b> &nbsp;⟹&nbsp; ${K('A=0')} &nbsp;or&nbsp; ${K('B=0')} &nbsp;<i>(or both)</i>`), cx, 340); hide(law);
    A.innerHTML = '<span></span>'; B.innerHTML = '<span></span>'; P.innerHTML = '<span></span>';
    const put = (el, src) => { el.innerHTML = `<span>${K(src)}</span>`; return el.firstChild; };
    const feed = async (c, a, b, p, zero) => {
      [A, B, P].forEach((e) => e.classList.remove('zero'));
      const ea = put(A, a), eb = put(B, b); P.innerHTML = '<span></span>';
      await Promise.all([c.pop(ea, 320), c.pop(eb, 320, { delay: 120 })]);
      const ep = put(P, p);
      if (zero) { P.classList.add('zero'); if (a === '0') A.classList.add('zero'); if (b === '0') B.classList.add('zero'); }
      const chip = h('span', 'u4l7-lchip' + (zero ? ' z' : ''), K(`${/^-/.test(a) ? '(' + a + ')' : a}\\times${/^-/.test(b) ? '(' + b + ')' : b}=${p}`));
      log.appendChild(chip);
      await Promise.all([c.pop(ep, 420, { delay: 150 }), c.fadeIn(chip, 300, { delay: 250 })]);
    };
    return [
      { cap: `Feed in ${T('3')} and ${T('4')}: the product is ${T('12')}. <b>Not</b> zero.`, run: (c) => feed(c, '3', '4', '12') },
      { cap: `A negative factor: ${T('(-2)\\times5=-10')}. Negatives change the <b>sign</b> of the product, but it still isn’t ${T('0')}.`, run: (c) => feed(c, '-2', '5', '-10') },
      { cap: `Tiny factors: ${T('0.5\\times0.1=0.05')}. Close to zero, but <b>not</b> zero. Two nonzero numbers <b>never</b> multiply to ${T('0')}.`, run: (c) => feed(c, '0.5', '0.1', '0.05') },
      { cap: `Now make ${T('A=0')}: ${T('0\\times7=0')}. A <b>zero factor</b> makes the whole product zero.`, run: (c) => feed(c, '0', '7', '0', true) },
      {
        cap: `${T('0')} times <b>anything</b> is ${T('0')}. Spin ${T('B')}: ${T('-3')}, ${T('250')}, ${T('0.4')}… the product stays ${T('0')}.`,
        run: async (c) => {
          for (const b of ['-3', '250', '0.4']) {
            const eb = put(B, b); await c.pop(eb, 260);
            await pulse(c, P.firstChild, 1.18);
          }
          const chip = h('span', 'u4l7-lchip z', K('0\\times\\text{anything}=0')); log.appendChild(chip); await c.fadeIn(chip, 300);
        }
      },
      {
        cap: 'Run the machine <b>backwards</b>. The product is 0: what went in? The only way to make 0 is a <b>zero factor</b>. That is the <b>Zero Product Law</b>.',
        run: async (c) => {
          [A, B].forEach((e) => e.classList.remove('zero'));
          const qa = put(A, '?'), qb = put(B, '?'), q0 = put(P, '0'); P.classList.add('zero');
          [A, B].forEach((e) => e.classList.add('ask'));
          await Promise.all([c.pop(q0, 300), c.fadeIn(back, 300), c.pop(qa, 320, { delay: 200 }), c.pop(qb, 320, { delay: 300 })]);
          await c.fadeIn(law, 450);
        }
      }
    ];
  }
};

/* ============ 1. Sweep x: when is the product 0? ============ */
const SW = {
  a: { k: null, f: [{ t: 'x-6', r: 6 }, { t: 'x+2', r: -2 }], lo: -4, hi: 8, tries: [3, -4] },
  b: { k: 3, f: [{ t: 'x-6', r: 6 }, { t: 'x+2', r: -2 }], lo: -4, hi: 8, tries: [3, -4] },
  c: { k: null, f: [{ t: 'x', r: 0 }, { t: 'x-5', r: 5 }], lo: -3, hi: 8, tries: [2, -2] }
};
const swExpr = (d) => (d.k ? d.k : '') + d.f.map((f) => (d.k || d.f.length > 1 ? (f.t === 'x' ? 'x' : `(${f.t})`) : f.t)).join('');
const sweep = {
  title: 'Slide x along: when is the product 0?',
  height: 420,
  choices: [{ v: 'a', label: tex('(x-6)(x+2)') }, { v: 'b', label: tex('3(x-6)(x+2)') }, { v: 'c', label: tex('x(x-5)') }],
  intro: (k) => `Try whole numbers for ${T('x')} in ${T(swExpr(SW[k]))}. Which values make the product <b>zero</b>?`,
  make(stage, key, ex) {
    const W = ex.W, cx = W / 2, d = SW[key];
    const val = (x) => (d.k || 1) * d.f.reduce((p, f) => p * (x - f.r), 1);
    // top row of boxes
    const row = add(stage, h('div', 'u4l7-swrow c'), cx, 70);
    const mk = (cls, e) => { const b = h('div', 'u4l7-swb ' + cls, `<div class="u4l7-swe">${e}</div><div class="u4l7-swv">&nbsp;</div>`); row.appendChild(b); return b; };
    const op = (s) => row.appendChild(h('div', 'u4l7-swop', K(s)));
    if (d.k) { const kb = mk('k', K(String(d.k))); kb.querySelector('.u4l7-swv').innerHTML = K('\\text{never }0'); op('\\times'); }
    const fb = d.f.map((f, i) => { const b = mk('f' + i, K(f.t)); if (i < d.f.length - 1) op('\\times'); return b; });
    op('=');
    const pb = mk('p', '<span class="u4l7-swpl">product</span>');
    // the strip of x values
    const n = d.hi - d.lo + 1, lw = 92, cw = Math.min(66, (W - lw - 40) / n), x0 = (W - lw - n * cw) / 2 + lw, y0 = 184;
    add(stage, h('div', 'u4l7-swl', K('x')), x0 - lw, y0 + 4);
    add(stage, h('div', 'u4l7-swl sm', 'product'), x0 - lw, y0 + 54);
    const cols = {};
    for (let x = d.lo; x <= d.hi; x++) {
      const col = add(stage, box(h('div', 'u4l7-swc', `<div class="u4l7-swx">${K(String(x))}</div><div class="u4l7-swp"></div>`), cw - 6), x0 + (x - d.lo) * cw + 3, y0);
      cols[x] = col;
    }
    const ptr = add(stage, h('div', 'u4l7-swptr c'), x0 + cw / 2, y0 - 16); hide(ptr);
    const concl = add(stage, h('div', 'u4l7-swcon'), 30, 300); box(concl, W - 60);
    let filled = new Set();
    const setX = (x) => {
      fb.forEach((b, i) => { const v = x - d.f[i].r; b.querySelector('.u4l7-swv').innerHTML = K('=' + v); b.classList.toggle('z', v === 0); });
      pb.querySelector('.u4l7-swv').innerHTML = K(String(val(x))); pb.classList.toggle('z', val(x) === 0);
      if (!fb.length) return;
    };
    const fill = (x) => { const p = cols[x].querySelector('.u4l7-swp'); p.innerHTML = K(String(val(x))); cols[x].classList.toggle('z', val(x) === 0); filled.add(x); return p; };
    const move = (c, x, ms = 300) => c.anim(ptr, [{ left: ptr.style.left, opacity: 1 }, { left: x0 + (x - d.lo) * cw + cw / 2 + 'px', opacity: 1 }], ms);
    const visit = async (c, x) => {
      await move(c, x);
      setX(x); const p = fill(x);
      await Promise.all([c.pop(p, 320), ...fb.map((b) => c.pop(b.querySelector('.u4l7-swv'), 280)), c.pop(pb.querySelector('.u4l7-swv'), 320)]);
    };
    const prodT = (x) => (d.k ? d.k : '') + d.f.map((f) => `(${x - f.r})`).join('');
    const roots = d.f.map((f) => f.r), sorted = [...roots].sort((a, b) => a - b);
    const steps = d.tries.map((x) => ({
      cap: `Try ${T('x=' + x)}: ${T(prodT(x) + '=' + val(x))}. Not zero.`,
      run: (c) => visit(c, x)
    }));
    steps.push({
      cap: `Fill in every whole number from ${T(String(d.lo))} to ${T(String(d.hi))}. Only <b>two</b> values make the product ${T('0')}: ${T('x=' + sorted[0])} and ${T('x=' + sorted[1])}.`,
      run: async (c) => {
        for (let x = d.lo; x <= d.hi; x++) {
          if (filled.has(x)) continue;
          await move(c, x, 120); setX(x); const p = fill(x);
          if (!c.fast) p.animate([{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 240);
          await c.sleep(val(x) === 0 ? 380 : 110);
        }
        await Promise.all(sorted.map((x) => pulse(c, cols[x], 1.12)));
      }
    });
    roots.forEach((r, i) => steps.push({
      cap: `At ${T('x=' + r)} the factor ${T(d.f[i].t)} is ${T('0')}, so the whole product is ${T('0')}, whatever the other factor is (here ${T(String(r - d.f[1 - i].r))}).`,
      run: async (c) => { await move(c, r); setX(r); await Promise.all([pulse(c, fb[i], 1.12), pulse(c, pb, 1.12)]); }
    }));
    steps.push({
      cap: `The solutions are exactly the values that make a <b>factor</b> zero: ${T('x=' + sorted[0] + ',\\ ' + sorted[1])}. Each factor gives one little equation.`
        + (d.k ? ` The constant ${T(String(d.k))} can never be ${T('0')}, so it adds <b>no</b> solutions.` : '')
        + (roots.includes(0) ? ` A lone ${T('x')} factor gives ${T('x=0')}: don’t lose it!` : ''),
      run: async (c) => {
        const parts = d.f.map((f, i) => `<span class="u4l7-swle f${i}">${f.t === 'x' ? K('x=0') : `${K(f.t + '=0')} <span class="u4l7-arr">→</span> ${K('x=' + f.r)}`}</span>`);
        if (d.k) parts.unshift(`<span class="u4l7-swle k">${K(d.k + '\\neq0')}</span>`);
        concl.innerHTML = parts.join('<span class="u4l7-or">or</span>');
        await c.fadeIn(concl, 450);
      }
    });
    return steps;
  }
};

/* ============ 2. Why the other side must be 0 ============ */
const whyZero = {
  title: 'Why the other side has to be 0',
  height: 460,
  intro: 'What do we learn about two factors from their product? Compare a product of <b>6</b> with a product of <b>0</b>.',
  make(stage, v, ex) {
    const W = ex.W, pw = (W - 48) / 2;
    const L = add(stage, box(h('div', 'u4l7-wzp'), pw, 196), 16, 14), R = add(stage, box(h('div', 'u4l7-wzp z'), pw, 196), 32 + pw, 14);
    L.innerHTML = `<div class="u4l7-wzh">${K('\\square\\times\\square=6')}</div><div class="u4l7-wzl"></div>`;
    R.innerHTML = `<div class="u4l7-wzh">${K('\\square\\times\\square=0')}</div><div class="u4l7-wzl"></div>`;
    const ll = L.querySelector('.u4l7-wzl'), rl = R.querySelector('.u4l7-wzl');
    const Z = '\\htmlClass{u4l7-z}{0}';
    const six = ['1\\times6', '2\\times3', '(-1)\\times(-6)', '(-2)\\times(-3)', '12\\times\\tfrac12', '1.5\\times4', '0.6\\times10', '\\tfrac13\\times18', '24\\times\\tfrac14', '\\dots'];
    const zero = [`${Z}\\times5`, `(-3)\\times${Z}`, `${Z}\\times${Z}`, `${Z}\\times\\tfrac12`, `1000\\times${Z}`, `${Z}\\times(-8)`, '\\dots'];
    const pour = async (c, list, host) => { for (let i = 0; i < list.length; i++) { const e = h('span', 'u4l7-wzc', K(list[i])); host.appendChild(e); await c.pop(e, 220); await c.sleep(60); } };
    // bottom: the trap and the right way
    const bw = (W - 48) / 2, by = 226;
    const trap = add(stage, box(h('div', 'u4l7-wzb bad'), bw, 220), 16, by), good = add(stage, box(h('div', 'u4l7-wzb good'), bw, 220), 32 + bw, by);
    trap.innerHTML = `<div class="u4l7-wzbh">The trap</div>`; good.innerHTML = `<div class="u4l7-wzbh">Rearrange first</div>`;
    hide(trap, good);
    const line = (host, src, cls = '') => { const e = h('div', 'u4l7-wzw ' + cls, src); host.appendChild(e); return e; };
    return [
      { cap: `Lots of pairs multiply to ${T('6')}: whole numbers, negatives, fractions, decimals… <b>infinitely many</b>. Knowing the product is ${T('6')} tells us <b>nothing</b> about either factor.`, run: (c) => pour(c, six, ll) },
      { cap: `Every pair that multiplies to ${T('0')} contains a <b>${T('0')}</b>. Knowing the product is ${T('0')} tells us a factor <b>is</b> ${T('0')}. That’s why one side must be ${T('0')}.`, run: (c) => pour(c, zero, rl) },
      {
        cap: `The trap: ${T('x(x+5)=6')}. It’s tempting to set each factor equal to ${T('6')}. But nothing says either factor <b>is</b> ${T('6')} (it could be ${T('2\\times3')}, ${T('12\\times\\tfrac12')}, …).`,
        run: async (c) => { line(trap, K('x(x+5)=6')); const w = line(trap, K('x=6\\ \\text{ or }\\ x+5=6\\ \\ ?'), 'red'); await c.fadeIn(trap, 300); await c.shake(w); }
      },
      {
        cap: `Test ${T('x=6')} in the original: ${T('6(6+5)=6(11)=66')}, not ${T('6')}. The method is broken (any right answer it gives is luck).`,
        run: async (c) => { const w = line(trap, `${K('6(6+5)=66\\neq6')} <b class="red">✗</b>`); await c.fadeIn(w, 300); const s = add(trap, h('div', 'u4l7-stamp no', 'NOT ALLOWED'), 0, 0); s.style.position = 'absolute'; s.style.right = '16px'; s.style.left = 'auto'; s.style.top = '12px'; await stampIn(c, s); }
      },
      {
        cap: `The right way: subtract ${T('6')} so one side is ${T('0')}, then factor: ${T('x^2+5x-6=0')} becomes ${T('(x+6)(x-1)=0')}, so ${T('x=-6')} or ${T('x=1')}.`,
        run: async (c) => { line(good, K('x^2+5x-6=0')); line(good, K('(x+6)(x-1)=0')); line(good, K('x=-6\\ \\text{ or }\\ x=1'), 'ok'); await c.fadeIn(good, 400); }
      },
      {
        cap: `Check both in the original ${T('x(x+5)=6')}: ${T('(-6)(-1)=6')} ✓ and ${T('1(6)=6')} ✓. <b>Rearrange to 0 first, every time.</b>`,
        run: async (c) => { const w = line(good, `${K('(-6)(-6+5)=6')} <b class="ok">✓</b> &nbsp; ${K('1(1+5)=6')} <b class="ok">✓</b>`); await c.fadeIn(w, 350); }
      }
    ];
  }
};

/* ============ 2. The four-step solve: one equation becomes two ============ */
const F0 = (s) => `\\htmlClass{u4l7-f0}{${s}}`, F1 = (s) => `\\htmlClass{u4l7-f1}{${s}}`, FK = (s) => `\\htmlClass{u4l7-fk}{${s}}`;
const pair = (p, s, a, b) => `Product ${T(p)}, sum ${T(s)}:<br>${T(a)} and ${T(b)}`;
const SOLVE = {
  n1: { eq: 'x^2-4x-12=0', how: [pair('-12', '-4', '-6', '2')], fac: F0('(x-6)') + F1('(x+2)') + '=0',
    br: [['x-6=0', 'x=6'], ['x+2=0', 'x=-2']], ck: [['x=6', '6^2-4(6)-12=36-24-12=0'], ['x=-2', '(-2)^2-4(-2)-12=4+8-12=0']], sol: 'x=-2,\\ 6' },
  n2: { eq: 'x^2+5x=6', re: ['Subtract 6 from both sides', 'x^2+5x-6=0'], how: [pair('-6', '5', '6', '-1')], fac: F0('(x+6)') + F1('(x-1)') + '=0',
    br: [['x+6=0', 'x=-6'], ['x-1=0', 'x=1']], ck: [['x=-6', '(-6)^2+5(-6)=36-30=6'], ['x=1', '1^2+5(1)=1+5=6']], sol: 'x=-6,\\ 1' },
  e1: { eq: 'x^2-5x-14=0', how: [pair('-14', '-5', '-7', '2')], fac: F0('(x-7)') + F1('(x+2)') + '=0',
    br: [['x-7=0', 'x=7'], ['x+2=0', 'x=-2']], ck: [['x=7', '7^2-5(7)-14=49-35-14=0'], ['x=-2', '(-2)^2-5(-2)-14=4+10-14=0']], sol: 'x=-2,\\ 7' },
  e2a: { eq: 'x^2-64=0', how: ['Difference of squares:<br>' + T('x^2-8^2')], fac: F0('(x-8)') + F1('(x+8)') + '=0',
    br: [['x-8=0', 'x=8'], ['x+8=0', 'x=-8']], ck: [['x=8', '8^2-64=64-64=0'], ['x=-8', '(-8)^2-64=64-64=0']], sol: 'x=\\pm 8' },
  e2b: { eq: '9x^2-25=0', how: ['Difference of squares:<br>' + T('(3x)^2-5^2')], fac: F0('(3x-5)') + F1('(3x+5)') + '=0',
    br: [['3x-5=0', '3x=5\\Rightarrow x=\\tfrac53'], ['3x+5=0', '3x=-5\\Rightarrow x=-\\tfrac53']],
    ck: [['x=\\tfrac53', '9\\left(\\tfrac53\\right)^2-25=25-25=0'], ['x=-\\tfrac53', '9\\left(-\\tfrac53\\right)^2-25=25-25=0']], sol: 'x=\\tfrac53,\\ -\\tfrac53' },
  e2c: { eq: '6x^2-42x=0', how: ['Common factor ' + T('6x') + ':<br>' + T('6x(x-7)')], fac: F0('6x') + F1('(x-7)') + '=0',
    br: [['6x=0', 'x=0'], ['x-7=0', 'x=7']], ck: [['x=0', '6(0)^2-42(0)=0-0=0'], ['x=7', '6(7)^2-42(7)=294-294=0']], sol: 'x=0,\\ 7' },
  e2d: { eq: '6x^2-54=0', k: '6', how: ['Common factor ' + T('6') + ':<br>' + T('6(x^2-9)'), 'Then a difference of squares:<br>' + T('6(x-3)(x+3)')], fac: FK('6') + F0('(x-3)') + F1('(x+3)') + '=0',
    br: [['x-3=0', 'x=3'], ['x+3=0', 'x=-3']], ck: [['x=3', '6(3)^2-54=54-54=0'], ['x=-3', '6(-3)^2-54=54-54=0']], sol: 'x=\\pm 3' },
  e3a: { eq: '4x^2-4x=15', re: ['Subtract 15 from both sides', '4x^2-4x-15=0'],
    how: ['Decomposition: ' + T('ac=-60') + '<br>pair ' + T('-10') + ' and ' + T('6'), T('4x^2-10x+6x-15') + '<br>' + T('=2x(2x-5)+3(2x-5)')], fac: F0('(2x-5)') + F1('(2x+3)') + '=0',
    br: [['2x-5=0', '2x=5\\Rightarrow x=\\tfrac52'], ['2x+3=0', '2x=-3\\Rightarrow x=-\\tfrac32']],
    ck: [['x=\\tfrac52', '4\\left(\\tfrac52\\right)^2-4\\left(\\tfrac52\\right)=25-10=15'], ['x=-\\tfrac32', '4\\left(-\\tfrac32\\right)^2-4\\left(-\\tfrac32\\right)=9+6=15']], sol: 'x=\\tfrac52,\\ -\\tfrac32' },
  e3b: { eq: '4x^2+24x=-32', re: ['Add 32 to both sides', '4x^2+24x+32=0'], k: '4',
    how: ['Common factor ' + T('4') + ':<br>' + T('4(x^2+6x+8)'), pair('8', '6', '2', '4')], fac: FK('4') + F0('(x+2)') + F1('(x+4)') + '=0',
    br: [['x+2=0', 'x=-2'], ['x+4=0', 'x=-4']], ck: [['x=-2', '4(-2)^2+24(-2)=16-48=-32'], ['x=-4', '4(-4)^2+24(-4)=64-96=-32']], sol: 'x=-2,\\ -4' }
};
const RECIPE = ['i) make one side 0', 'ii) factor completely', 'iii) each factor = 0, solve', 'iv) state all solutions', '✓ check in the original'];
const solve = {
  title: 'Solve by factoring: one equation becomes two',
  height: 530,
  choices: [{ v: 'n1', label: tex('x^2-4x-12=0') }, { v: 'n2', label: tex('x^2+5x=6') },
    { sep: 'Example 1 check:' }, { v: 'e1', label: '1' },
    { sep: 'Example 2 check:' }, { v: 'e2a', label: '(a)' }, { v: 'e2b', label: '(b)' }, { v: 'e2c', label: '(c)' }, { v: 'e2d', label: '(d)' },
    { sep: 'Example 3 check:' }, { v: 'e3a', label: '(a)' }, { v: 'e3b', label: '(b)' }],
  intro: (k) => `Solve ${T(SOLVE[k].eq)} with the four steps. Press <b>Next</b>.`,
  make(stage, key, ex) {
    const W = ex.W, d = SOLVE[key], pw = 270, Wm = W - pw - 24, cx = Wm / 2 + 8;
    const rhs = d.eq.split('=')[1];
    // the recipe panel
    const panel = add(stage, box(h('div', 'u4l7-spanel'), pw, 500), W - pw - 14, 14);
    panel.innerHTML = `<div class="u4l7-sph">The four steps</div>${RECIPE.map((r, i) => `<div class="u4l7-spr" data-i="${i}">${r}</div>`).join('')}<div class="u4l7-show"></div>`;
    const rows = [...panel.querySelectorAll('.u4l7-spr')], how = panel.querySelector('.u4l7-show');
    const lit = (i) => rows.forEach((r, j) => { r.classList.toggle('on', j === i); r.classList.toggle('done', j < i && j !== 4); });
    // the work
    const Y = { eq: 38, re: 96, fac: 156, br: 250, so: 296, sol: 346, ck: 382 };
    const l0 = add(stage, h('div', 'u4l7-sline c big', K(d.eq)), cx, Y.eq);
    const l1 = add(stage, h('div', 'u4l7-sline c', d.re ? K(d.re[1]) : '<span class="u4l7-muted">one side is already 0 ✓</span>'), cx, Y.re); hide(l1);
    const l2 = add(stage, h('div', 'u4l7-sline c fac', K(d.fac)), cx, Y.fac); hide(l2);
    const svg = layer(stage);
    const bx = [cx - Wm / 4, cx + Wm / 4];
    const bl = d.br.map((b, i) => { const e = add(stage, h('div', 'u4l7-sbr c f' + i, K(b[0])), bx[i], Y.br); hide(e); return e; });
    const bs = d.br.map((b, i) => { const e = add(stage, h('div', 'u4l7-ssol c', K(b[1])), bx[i], Y.so); hide(e); return e; });
    const kn = d.k ? add(stage, h('div', 'u4l7-knote c', `${K(d.k + '\\neq0')}<small>never zero</small>`), cx, Y.br) : null; hide(kn);
    const sol = add(stage, h('div', 'u4l7-sban c', `Solutions: ${K(d.sol)}`), cx, Y.sol); hide(sol);
    const cw = Wm - 24;
    const cks = d.ck.map((k, i) => {
      const e = add(stage, box(h('div', 'u4l7-sck f' + i), cw), 20, Y.ck + i * 54);
      e.innerHTML = `<span class="u4l7-sckh">${K(k[0])}:</span><span class="u4l7-sckw">${K(k[1])}</span><span class="u4l7-tick">✓</span>`;
      hide(e); return e;
    });
    const showHow = async (c, html) => { how.innerHTML = html; await c.fadeIn(how, 300); };
    const lastSol = (s) => s.split('\\Rightarrow').pop();
    return [
      {
        cap: d.re ? `<b>Step i)</b> The right side is ${T(rhs)}, not ${T('0')}. ${d.re[0]}: ${T(d.re[1])}.` : `<b>Step i)</b> One side is already ${T('0')}. Nothing to move.`,
        run: async (c) => { lit(0); if (d.re) await showHow(c, `<div class="u4l7-shh">Step i)</div>${d.re[0]}.`); else how.innerHTML = ''; await c.fadeIn(l1, 400); }
      },
      {
        cap: `<b>Step ii)</b> Factor the left side <b>completely</b>: ${T(strip(d.fac))}.`,
        run: async (c) => { lit(1); await showHow(c, `<div class="u4l7-shh">Step ii) how</div>${d.how.map((t) => `<div class="u4l7-shl">${t}</div>`).join('')}`); await c.fadeIn(l2, 400); }
      },
      {
        cap: `<b>Step iii)</b> The product is ${T('0')}, so <b>one of the factors is 0</b>. Each factor becomes its own little equation.` + (d.k ? ` The constant ${T(d.k)} can never be ${T('0')}, so it gives no solution.` : ''),
        run: async (c) => {
          lit(2); how.innerHTML = `<div class="u4l7-shh">Zero Product Law</div>${K('A\\cdot B=0')}<br>⟹ ${K('A=0')} or ${K('B=0')}`;
          stage.classList.add('u4l7-lit');
          const f0 = stage.querySelector('.u4l7-sline.fac .u4l7-f0'), f1 = stage.querySelector('.u4l7-sline.fac .u4l7-f1');
          const p0 = stagePos(stage, f0), p1 = stagePos(stage, f1);
          const a0 = sArrow(svg, p0.x, p0.b + 6, bx[0], Y.br - 24, TEAL), a1 = sArrow(svg, p1.x, p1.b + 6, bx[1], Y.br - 24, AMB);
          await Promise.all([a0.draw(c), a1.draw(c), c.fadeIn(how, 250)]);
          await Promise.all([c.pop(bl[0], 380), c.pop(bl[1], 380, { delay: 120 }), kn ? c.fadeIn(kn, 350, { delay: 200 }) : null]);
        }
      },
      {
        cap: `Solve each little equation: ${T(lastSol(d.br[0][1]))} <b>or</b> ${T(lastSol(d.br[1][1]))}.`,
        run: async (c) => { await Promise.all([c.fadeIn(bs[0], 350), c.fadeIn(bs[1], 350, { delay: 150 })]); }
      },
      {
        cap: `<b>Step iv)</b> State <b>all</b> the solutions: <b>${T(d.sol)}</b>.`,
        run: async (c) => { lit(3); how.innerHTML = ''; await c.pop(sol, 420); }
      },
      {
        cap: `<b>Check</b> each one in the <b>original</b> equation, ${T(d.eq)}. Both give ${T(rhs)} ✓, so both are solutions.`,
        run: async (c) => {
          lit(4); how.innerHTML = '<div class="u4l7-shh">Check</div>Substitute into the <b>original</b> equation, not the rearranged one.';
          for (const e of cks) { await c.fadeIn(e, 320); const t = e.querySelector('.u4l7-tick'); await c.pop(t, 360); }
        }
      }
    ];
  }
};

/* ============ geometry for the trough ============ */
function troughSVG(o) {
  // o: { s (px per cm), x (depth cm), ox, oy, top: dashed top?, labels: {...} }
  const { s, x, ox, oy } = o, xs = x * s, L = 40 * s;
  const P = { D: [ox, oy], F1: [ox + xs, oy], A: [ox + xs, oy + xs], B: [ox + L - xs, oy + xs], F2: [ox + L - xs, oy], C: [ox + L, oy] };
  return { P, xs, L };
}
const pts = (...ps) => ps.map((p) => p.join(',')).join(' ');
function arcPath(cx, cy, r, a0, a1) { // degrees, screen coordinates (y down)
  const p = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0} ${y0} A${r} ${r} 0 0 ${a1 > a0 ? 1 : 0} ${x1} ${y1}`;
}

/* ============ Example 5: why the area is x(40 − x) ============ */
const trough = {
  title: 'Why the area is x(40 − x): cut, turn and slide',
  height: 430,
  choices: [{ v: 10, label: 'depth 10' }, { v: 14, label: 'depth 14' }, { sep: 'Example 5 check:' }, { v: 6, label: '(b) area 204' }],
  intro: (x) => `A trough with top ${T('DC=40')} cm, depth ${T('x')} (shown here with ${T('x=' + x)} cm), and sides sloping at ${T('45^\\circ')}. Why is its area ${T('x(40-x)')}?`,
  make(stage, x, ex) {
    const W = ex.W, s = 18, L = 40 * s, ox = (W - L) / 2, oy = 76;
    const G = troughSVG({ s, x, ox, oy }), { P, xs } = G;
    const svg = layer(stage);
    const water = svgEl('polygon', { points: pts(P.F1, P.F2, P.B, P.A), class: 'u4l7-water' });
    const ghost = svgEl('polygon', { points: pts(P.D, P.F1, P.A), class: 'u4l7-ghost' }); ghost.style.opacity = 0;
    const tL = svgEl('polygon', { points: pts(P.D, P.F1, P.A), class: 'u4l7-tri l' });
    const tR = svgEl('polygon', { points: pts(P.F2, P.C, P.B), class: 'u4l7-tri r' });
    const top = svgEl('path', { d: `M${P.D} L${P.C}`, class: 'u4l7-dash' });
    const sideL = svgEl('path', { d: `M${P.D} L${P.A}`, class: 'u4l7-side' }), sides = svgEl('path', { d: `M${P.A} L${P.B} L${P.C}`, class: 'u4l7-side' });
    const v1 = svgEl('path', { d: `M${P.F1} L${P.A}`, class: 'u4l7-dash' }), v2 = svgEl('path', { d: `M${P.F2} L${P.B}`, class: 'u4l7-dash' });
    const r = 10, ra = svgEl('path', { d: `M${P.F1[0]} ${oy + r} L${P.F1[0] - r} ${oy + r} L${P.F1[0] - r} ${oy}`, class: 'u4l7-ra' }), rb = svgEl('path', { d: `M${P.F2[0]} ${oy + r} L${P.F2[0] + r} ${oy + r} L${P.F2[0] + r} ${oy}`, class: 'u4l7-ra' });
    const a1 = svgEl('path', { d: arcPath(P.D[0], oy, 36, 0, 45), class: 'u4l7-ang' }), a2 = svgEl('path', { d: arcPath(P.C[0], oy, 36, 180, 135), class: 'u4l7-ang' });
    const rect = svgEl('rect', { x: P.F1[0], y: oy, width: L - xs, height: xs, class: 'u4l7-rect' }); rect.style.opacity = 0;
    svg.append(water, ghost, tR, tL, top, v1, v2, sideL, sides, ra, rb, a1, a2, rect);
    tL.style.transformOrigin = `${P.F1[0]}px ${P.F1[1]}px`;
    const lab = (t, X, Y, cls = '') => add(stage, h('div', 'u4l7-tl c ' + cls, t), X, Y);
    lab(K('D'), P.D[0] - 18, oy); lab(K('C'), P.C[0] + 18, oy); lab(K('A'), P.A[0], P.A[1] + 20); lab(K('B'), P.B[0], P.B[1] + 20);
    const l40 = lab(K('40'), ox + L / 2, oy - 46);
    lab(K('x'), P.F1[0] + 14, oy + xs / 2, 'sm'); lab(K('x'), P.F2[0] - 14, oy + xs / 2, 'sm');
    lab(K('45^\\circ'), P.D[0] + 58, oy + 16, 'deg'); lab(K('45^\\circ'), P.C[0] - 58, oy + 16, 'deg');
    const hx1 = lab(K('x'), ox + xs / 2, oy - 16, 'tl'), hx2 = lab(K('x'), ox + L - xs / 2, oy - 16, 'ta');
    const mid = lab(K('40-2x'), ox + L / 2, oy - 16, 'mid'), ab = lab(K('AB=40-2x'), ox + L / 2, P.A[1] + 48, 'mid');
    const len = lab(K('40-x'), P.F1[0] + (L - xs) / 2, oy - 16, 'ok'), hgt = lab(K('x'), ox + L + 30, oy + xs / 2, 'ok');
    const area = add(stage, h('div', 'u4l7-tarea c', ''), W / 2, Math.min(oy + xs + 92, 392));
    hide(hx1, hx2, mid, ab, len, hgt, area);
    const A = x * (40 - x);
    const steps = [
      {
        cap: `Each dashed line makes a right triangle at the end. Its angles are ${T('90^\\circ')} and ${T('45^\\circ')}, so the third is ${T('180^\\circ-90^\\circ-45^\\circ=45^\\circ')}. Two equal angles: it’s <b>isosceles</b>, so its top leg is ${T('x')}, the same as its depth.`,
        run: async (c) => { tL.classList.add('lit'); tR.classList.add('lit'); await Promise.all([c.sleep(300), c.pop(hx1, 360, { delay: 300 }), c.pop(hx2, 360, { delay: 420 })]); }
      },
      {
        cap: `So the bottom is the top minus the two ends: ${T('AB=40-x-x=40-2x')}.`,
        run: async (c) => { await Promise.all([c.fadeIn(mid, 350), c.fadeIn(ab, 350, { delay: 200 })]); }
      },
      {
        cap: 'Cut the left triangle off, <b>turn</b> it a quarter turn and <b>slide</b> it to the right end. It fits exactly against the other triangle.',
        run: async (c) => {
          ghost.style.opacity = 1; l40.style.opacity = 0.35; sideL.style.opacity = 0.18; a1.style.opacity = 0.25;
          await c.anim(tL, [{ transform: 'translate(0px,0px) rotate(0deg)' }, { transform: `translate(${L - xs}px,${xs}px) rotate(90deg)` }], 1300, { easing: 'cubic-bezier(.45,0,.3,1)' });
        }
      },
      {
        cap: `The two triangles make an ${T('x')} by ${T('x')} square, so the whole trough is now one <b>rectangle</b>: length ${T('(40-2x)+x=40-x')} and height ${T('x')}.`,
        run: async (c) => { hx1.style.opacity = 0; mid.style.opacity = 0; await Promise.all([c.anim(rect, [{ opacity: 0 }, { opacity: 1 }], 400), c.pop(len, 380, { delay: 200 }), c.pop(hgt, 380, { delay: 320 })]); }
      },
      {
        cap: `Area of a rectangle = length × height, so the area is ${T('x(40-x)')} ✓. Here ${T('x=' + x)}: ${T(`${x}(40-${x})=${x}(${40 - x})=${A}`)} cm². The trapezoid formula agrees: ${T(`\\tfrac12(40+${40 - 2 * x})(${x})=${A}`)}.` + (A === 204 ? ' That’s the area in part (b), so <b>x = 6</b> fits ✓' : ''),
        run: async (c) => { ab.style.opacity = 0; area.innerHTML = `${K('\\text{Area}=x(40-x)')} &nbsp;<span class="u4l7-muted">→</span>&nbsp; ${K(`${x}(${40 - x})=${A}\\text{ cm}^2`)}`; await c.fadeIn(area, 420); }
      }
    ];
    return steps;
  }
};

/* ============ 3. Does the answer fit the story? ============ */
const STORY = {
  demo: { kind: 'rect', v: 'w', d: 2, A: 48, r: [-8, 6], ask: 'perimeter' },
  banner: { kind: 'rect', v: 'w', d: 3, A: 208, r: [-16, 13], ask: 'perimeter' },
  trough: { kind: 'trough', A: 204, r: [34, 6] },
  even: { kind: 'even', P: 168, r: [-14, 12] }
};
const story = {
  title: 'Two roots: does each one fit the story?',
  height: 470,
  choices: [{ v: 'demo', label: 'rectangle, area 48' }, { sep: 'Example 4 check:' }, { v: 'banner', label: 'banner' }, { sep: 'Example 5 check:' }, { v: 'trough', label: 'trough' }, { sep: 'Example 6 check:' }, { v: 'even', label: 'even integers' }],
  intro: (k) => ({
    demo: `A rectangle’s length is ${T('2')} cm more than its width, and its area is ${T('48\\text{ cm}^2')}. Find its perimeter.`,
    banner: `A banner’s length is ${T('3')} cm more than its width, and its area is ${T('208\\text{ cm}^2')}. Find its perimeter.`,
    trough: `The trough’s cross-section has area ${T('x(40-x)')}. If the area is ${T('204\\text{ cm}^2')}, find ${T('x')}.`,
    even: `Two consecutive <b>positive</b> even integers have a product of ${T('168')}. Find them.`
  })[k],
  make(stage, key, ex) {
    const W = ex.W, d = STORY[key], dw = Math.round(W * 0.55), wx = dw + 24, ww = W - wx - 16;
    add(stage, box(h('div', 'u4l7-stdiv'), 2, 440), dw + 6, 14);
    const work = add(stage, box(h('div', 'u4l7-stw'), ww), wx, 16);
    const wl = (src, cls = '') => { const e = h('div', 'u4l7-stl ' + cls, src); work.appendChild(e); return e; };
    const chips = add(stage, h('div', 'u4l7-stchips c'), dw / 2, 432); hide(chips);
    const svg = layer(stage);
    const stamp = add(stage, h('div', 'u4l7-stamp no c', ''), dw / 2, 200); hide(stamp);
    const ans = add(stage, box(h('div', 'u4l7-stans'), ww), wx, 384); hide(ans);
    const chipEls = d.r.map((r) => { const e = h('span', 'u4l7-rchip', K((d.v || (d.kind === 'even' ? 'n' : 'x')) + '=' + r)); chips.appendChild(e); return e; });
    const show = (els, c) => Promise.all(els.map((e, i) => c.fadeIn(e, 320, { delay: i * 160 })));
    const verdict = async (c, i, good, text) => {
      chipEls[i].classList.add(good ? 'good' : 'bad');
      chipEls[i].insertAdjacentHTML('beforeend', good ? ' <b>✓</b>' : ' <b>✗</b>');
      await pulse(c, chipEls[i], 1.15);
      if (!good) { stamp.innerHTML = text; await stampIn(c, stamp); }
    };
    if (d.kind === 'rect') {
      const v = d.v, len = `${v}+${d.d}`, [rn, rp] = d.r, L = rp + d.d, P = 2 * (rp + L), fac = `(${v}+${-rn})(${v}-${rp})`;
      const g = add(stage, box(h('div', 'u4l7-rect0'), 300, 190), dw / 2 - 150, 60);
      g.innerHTML = `<span class="u4l7-rl top">${K(len)}</span><span class="u4l7-rl side">${K(v)}</span><span class="u4l7-rl mid">${K(d.A + '\\text{ cm}^2')}</span>`;
      hide(g);
      const sc = Math.min(330 / L, 300 / rp), gw = L * sc, gh = rp * sc;
      const real = add(stage, box(h('div', 'u4l7-rect1'), gw, gh), dw / 2 - gw / 2, 70); hide(real);
      real.style.backgroundSize = `${sc}px ${sc}px`;
      real.innerHTML = `<span class="u4l7-rl top">${K(L + '\\text{ cm}')}</span><span class="u4l7-rl side">${K(rp + '\\text{ cm}')}</span><span class="u4l7-rl mid">${K(`${rp}\\times${L}=${d.A}`)}</span>`;
      const neg = add(stage, box(h('div', 'u4l7-rectn'), 300, 190), dw / 2 - 150, 60); hide(neg);
      neg.innerHTML = `<span class="u4l7-rl top red">${K(`\\text{width }${v}=${rn}\\text{ cm?}`)}</span>`;
      return [
        { cap: `<b>Step i)</b> Let ${T(v)} be the width in cm. The length is ${T(d.d)} cm more: ${T(len)}.`, run: async (c) => { const e = wl(`Let ${K(v)} = width (cm)<br>length = ${K(len)}`); await Promise.all([c.fadeIn(g, 400), c.fadeIn(e, 400)]); } },
        { cap: `<b>Step ii)</b> Area = length × width: ${T(`${v}(${len})=${d.A}`)}. Make one side 0: ${T(`${v}^2+${d.d}${v}-${d.A}=0`)}.`, run: async (c) => { await show([wl(K(`${v}(${len})=${d.A}`)), wl(K(`${v}^2+${d.d}${v}-${d.A}=0`))], c); } },
        { cap: `<b>Step iii)</b> Product ${T('-' + d.A)}, sum ${T(String(d.d))}: ${T(String(-rn))} and ${T(String(-rp))}. So ${T(fac + '=0')}: <b>two roots</b>, ${T(`${v}=${rn}`)} or ${T(`${v}=${rp}`)}.`, run: async (c) => { await show([wl(K(fac + '=0')), wl(K(`${v}=${rn}\\ \\text{ or }\\ ${v}=${rp}`))], c); await c.fadeIn(chips, 350); } },
        { cap: `<b>Step iv)</b> Test ${T(`${v}=${rn}`)}: a width of ${T(rn)} cm? You can’t draw that rectangle. A length can’t be negative, so <b>reject</b> it.`, run: async (c) => { g.style.opacity = 0; await c.fadeIn(neg, 300); await verdict(c, 0, false, `REJECT<small>a width can’t be negative</small>`); await c.fadeIn(wl(`${K(`${v}=${rn}`)} <b class="red">✗ negative width</b>`), 300); } },
        { cap: `Test ${T(`${v}=${rp}`)}: width ${T(rp)} cm, length ${T(rp + '+' + d.d + '=' + L)} cm. Drawn to scale, it is ${T(rp)} rows of ${T(L)} squares: ${T(`${rp}\\times${L}=${d.A}`)} ✓`, run: async (c) => { stamp.style.opacity = 0; neg.style.opacity = 0; await c.fadeIn(real, 450); await verdict(c, 1, true); await c.fadeIn(wl(`${K(`${v}=${rp}`)} <b class="ok">✓</b> length ${K(String(L))}`), 300); } },
        { cap: `Answer the question that was asked: the <b>perimeter</b> is ${T(`2(${rp}+${L})=${P}`)} cm.`, run: async (c) => { ans.innerHTML = `Perimeter ${K(`=2(${rp}+${L})=${P}`)} cm`; await c.pop(ans, 420); } }
      ];
    }
    if (d.kind === 'trough') {
      const s = 8, Lp = 40 * s, ox = dw / 2 - Lp / 2, oy = 70;
      const top = svgEl('path', { d: `M${ox} ${oy} L${ox + Lp} ${oy}`, class: 'u4l7-dash' }); svg.appendChild(top);
      const t40 = add(stage, h('div', 'u4l7-tl c', K('40')), ox + Lp / 2, oy - 22);
      const draw = (xx, cls) => {
        const xs = xx * s, g = svgEl('g', { class: cls });
        if (xx <= 20) {
          g.appendChild(svgEl('polygon', { points: pts([ox, oy], [ox + Lp, oy], [ox + Lp - xs, oy + xs], [ox + xs, oy + xs]), class: 'u4l7-water' }));
          g.appendChild(svgEl('path', { d: `M${ox} ${oy} L${ox + xs} ${oy + xs} L${ox + Lp - xs} ${oy + xs} L${ox + Lp} ${oy}`, class: 'u4l7-side' }));
        } else {
          g.appendChild(svgEl('path', { d: `M${ox} ${oy} L${ox + xs} ${oy + xs}`, class: 'u4l7-side bad' }));
          g.appendChild(svgEl('path', { d: `M${ox + Lp} ${oy} L${ox + Lp - xs} ${oy + xs}`, class: 'u4l7-side bad' }));
          g.appendChild(svgEl('path', { d: `M${ox + xs} ${oy + xs} L${ox + Lp - xs} ${oy + xs}`, class: 'u4l7-side bad dashb' }));
          g.appendChild(svgEl('circle', { cx: ox + Lp / 2, cy: oy + Lp / 2, r: 7, class: 'u4l7-cross' }));
        }
        g.style.opacity = 0; svg.appendChild(g); return g;
      };
      const gBad = draw(34, 'bad'), gGood = draw(6, 'good');
      const lb1 = add(stage, h('div', 'u4l7-tl c red sm', K('AB=40-2(34)=-28')), dw / 2, oy + 34 * s + 18); hide(lb1);
      const lb2 = add(stage, h('div', 'u4l7-tl c ok sm', `${K('x=6')}, &nbsp;${K('AB=40-2(6)=28')}`), dw / 2, oy + 6 * s + 26); hide(lb2);
      const generic = draw(12, 'gen');
      return [
        { cap: `<b>Step i)</b> The variable is already chosen: ${T('x')} is the depth, and part (a) showed the area is ${T('x(40-x)')}.`, run: async (c) => { await Promise.all([c.anim(generic, [{ opacity: 0 }, { opacity: 1 }], 400), c.fadeIn(wl(`${K('x')} = depth (cm)<br>area ${K('=x(40-x)')}`), 400)]); } },
        { cap: `<b>Step ii)</b> ${T('x(40-x)=204')}. Expand and make one side 0: ${T('40x-x^2=204')}, so ${T('x^2-40x+204=0')}.`, run: async (c) => { await show([wl(K('x(40-x)=204')), wl(K('x^2-40x+204=0'))], c); } },
        { cap: `<b>Step iii)</b> Product ${T('204')}, sum ${T('-40')}: ${T('-34')} and ${T('-6')}. ${T('(x-34)(x-6)=0')}, so ${T('x=34')} or ${T('x=6')}. <b>Both</b> are positive this time!`, run: async (c) => { await show([wl(K('(x-34)(x-6)=0')), wl(K('x=34\\ \\text{ or }\\ x=6'))], c); await c.fadeIn(chips, 350); } },
        { cap: `<b>Step iv)</b> Test ${T('x=34')}: each sloping side runs ${T('34')} cm across, but the top is only ${T('40')}. The sides cross before reaching the bottom: ${T('AB=40-2(34)=-28')}. <b>Reject</b> it.`, run: async (c) => { generic.style.opacity = 0; await c.anim(gBad, [{ opacity: 0 }, { opacity: 1 }], 500); await c.fadeIn(lb1, 300); await verdict(c, 0, false, 'REJECT<small>AB would be −28 cm</small>'); await c.fadeIn(wl(`${K('x=34')} <b class="red">✗ AB < 0</b>`), 300); } },
        { cap: `Test ${T('x=6')}: ${T('AB=40-12=28')} cm, a real trough (drawn to scale). ${T('6(40-6)=6(34)=204')} ✓`, run: async (c) => { [gBad, lb1, stamp].forEach((e) => (e.style.opacity = 0)); await c.anim(gGood, [{ opacity: 0 }, { opacity: 1 }], 500); await c.fadeIn(lb2, 300); await verdict(c, 1, true); await c.fadeIn(wl(`${K('x=6')} <b class="ok">✓</b>`), 300); } },
        { cap: `So ${T('x=6')} cm. The rule from part (b): the bottom ${T('40-2x')} must be positive, so ${T('x<20')}.`, run: async (c) => { ans.innerHTML = `${K('x=6')} cm`; await c.pop(ans, 420); void t40; } }
      ];
    }
    // consecutive even integers on a number line
    const lo = -16, hi = 16, nx = (hi - lo) / 2, sp = (dw - 60) / nx, x0 = 30, y = 170;
    const X = (n) => x0 + (n - lo) / 2 * sp;
    svg.appendChild(svgEl('path', { d: `M${x0 - 14} ${y} L${X(hi) + 14} ${y}`, class: 'u4l7-nl' }));
    for (let n = lo; n <= hi; n += 2) {
      svg.appendChild(svgEl('path', { d: `M${X(n)} ${y - 8} L${X(n)} ${y + 8}`, class: 'u4l7-nt' + (n === 0 ? ' z' : '') }));
      if (n % 8 === 0) add(stage, h('div', 'u4l7-nlab c' + (n === 0 ? ' z' : ''), K(String(n))), X(n), y + 26);
    }
    const posBand = svgEl('rect', { x: X(0) + 6, y: y - 64, width: X(hi) - X(0), height: 108, rx: 10, class: 'u4l7-band' }); svg.insertBefore(posBand, svg.firstChild); posBand.style.opacity = 0;
    const bandLab = add(stage, h('div', 'u4l7-tl c ok sm', 'positive'), (X(0) + X(hi)) / 2 + 8, y - 86); hide(bandLab);
    const dot = (n, cls) => { const e = add(stage, h('div', 'u4l7-ndot c ' + cls), X(n), y); e.innerHTML = `<span class="u4l7-ndl">${K(String(n))}</span>`; hide(e); return e; };
    const gen = [dot(4, 'gen'), dot(6, 'gen')];
    const genL = [add(stage, h('div', 'u4l7-tl c sm', K('n')), X(4) - 8, y - 62), add(stage, h('div', 'u4l7-tl c sm', K('n+2')), X(6) + 14, y - 62)]; hide(...genL);
    const bad = [dot(-14, 'bad'), dot(-12, 'bad')], good = [dot(12, 'good'), dot(14, 'good')];
    [bad[1], good[1]].forEach((e) => e.classList.add('dn'));
    const badL = add(stage, h('div', 'u4l7-tl c red sm', K('(-14)(-12)=168')), Math.max(X(-13), 110), y + 70); hide(badL);
    const goodL = add(stage, h('div', 'u4l7-tl c ok sm', K('12\\times14=168')), Math.min(X(13), dw - 90), y + 70); hide(goodL);
    stamp.style.top = '320px';
    return [
      { cap: `<b>Step i)</b> Let ${T('n')} be the smaller even integer. Consecutive even integers are ${T('2')} apart, so the other is ${T('n+2')}.`, run: async (c) => { await Promise.all([...gen.map((e) => c.pop(e, 320)), ...genL.map((e) => c.fadeIn(e, 320)), c.fadeIn(wl(`Let ${K('n')} = smaller even integer<br>the next one is ${K('n+2')}`), 400)]); } },
      { cap: `<b>Step ii)</b> Their product is ${T('168')}: ${T('n(n+2)=168')}, so ${T('n^2+2n-168=0')}.`, run: async (c) => { await show([wl(K('n(n+2)=168')), wl(K('n^2+2n-168=0'))], c); } },
      { cap: `<b>Step iii)</b> Product ${T('-168')}, sum ${T('2')}: ${T('14')} and ${T('-12')}. ${T('(n+14)(n-12)=0')}, so ${T('n=-14')} or ${T('n=12')}.`, run: async (c) => { await show([wl(K('(n+14)(n-12)=0')), wl(K('n=-14\\ \\text{ or }\\ n=12'))], c); await c.fadeIn(chips, 350); } },
      { cap: `<b>Step iv)</b> Test ${T('n=-14')}: the pair is ${T('-14')} and ${T('-12')}, and ${T('(-14)(-12)=168')}. The algebra works! But the question asked for <b>positive</b> integers, so <b>reject</b> it.`, run: async (c) => { [...gen, ...genL].forEach((e) => (e.style.opacity = 0)); await Promise.all([...bad.map((e) => c.pop(e, 320)), c.fadeIn(badL, 300)]); posBand.style.opacity = 1; await c.fadeIn(bandLab, 300); await verdict(c, 0, false, 'REJECT<small>not positive</small>'); await c.fadeIn(wl(`${K('n=-14')} <b class="red">✗ not positive</b>`), 300); } },
      { cap: `Test ${T('n=12')}: the pair is ${T('12')} and ${T('14')}, both positive, and ${T('12\\times14=168')} ✓`, run: async (c) => { stamp.style.opacity = 0; await Promise.all([...good.map((e) => c.pop(e, 320)), c.fadeIn(goodL, 300)]); await verdict(c, 1, true); await c.fadeIn(wl(`${K('n=12')} <b class="ok">✓</b>`), 300); } },
      { cap: 'The two integers are <b>12 and 14</b>. One root rejected, and we said why.', run: async (c) => { ans.innerHTML = `${K('12')} and ${K('14')}`; await c.pop(ans, 420); } }
    ];
  }
};

/* ============ static figures: the Example 5 trough ============ */
function troughFigure(el, withAns) {
  const Wd = withAns ? 360 : 470, s = withAns ? 7.4 : 10, x = 11, L = 40 * s, xs = x * s, ox = (Wd - L) / 2, oy = withAns ? 34 : 40, Hd = oy + xs + (withAns ? 52 : 36);
  const D = [ox, oy], F1 = [ox + xs, oy], A = [ox + xs, oy + xs], B = [ox + L - xs, oy + xs], F2 = [ox + L - xs, oy], C = [ox + L, oy];
  const r = 9, col = withAns ? RED : INK;
  const lab = (t, X, Y, anchor = 'middle', cls = '') => `<text x="${X}" y="${Y}" text-anchor="${anchor}" class="u4l7-ft ${cls}">${t}</text>`;
  const it = (t) => `<tspan font-style="italic">${t}</tspan>`;
  let g = `<svg class="u4l7-fsvg" viewBox="0 0 ${Wd} ${Hd}" width="${Wd}" height="${Hd}" style="color:${col}">`;
  g += `<path d="M${D} L${C}" class="u4l7-fdash"/>`;
  g += `<path d="M${F1} L${A}" class="u4l7-fdash"/><path d="M${F2} L${B}" class="u4l7-fdash"/>`;
  g += `<path d="M${D} L${A} L${B} L${C}" class="u4l7-fside"/>`;
  g += `<path d="M${F1[0]} ${oy + r} L${F1[0] - r} ${oy + r} L${F1[0] - r} ${oy}" class="u4l7-fthin"/><path d="M${F2[0]} ${oy + r} L${F2[0] + r} ${oy + r} L${F2[0] + r} ${oy}" class="u4l7-fthin"/>`;
  g += lab(it('D'), D[0] - 8, oy + 6, 'end') + lab(it('C'), C[0] + 8, oy + 6, 'start') + lab(it('A'), A[0], A[1] + 22) + lab(it('B'), B[0], B[1] + 22);
  g += lab(it('x'), F1[0] + 8, oy + xs / 2 + 6, 'start') + lab(it('x'), F2[0] - 8, oy + xs / 2 + 6, 'end');
  if (!withAns) {
    g += `<path d="${arcPath(D[0], oy, 30, 0, 45)}" class="u4l7-fthin"/><path d="${arcPath(C[0], oy, 30, 180, 135)}" class="u4l7-fthin"/>`;
    g += lab('45°', D[0] + 34, oy + 26, 'start', 'sm') + lab('45°', C[0] - 34, oy + 26, 'end', 'sm');
    g += lab('40', ox + L / 2, oy - 10);
  } else {
    g += lab(it('x'), ox + xs / 2, oy - 8) + lab(it('x'), ox + L - xs / 2, oy - 8);
    g += lab(`40 − 2${it('x')}`, ox + L / 2, oy - 8);
    g += lab(`${it('AB')} = 40 − 2${it('x')}`, ox + L / 2, A[1] + 44);
  }
  el.innerHTML = g + '</svg>';
}

/* ============ warm-up: When Does It Land? ============ */
function mountWarmup() {
  const scene = document.getElementById('wu-scene'), table = document.getElementById('wu-table'), launch = document.getElementById('wu-launch');
  if (!scene) return;
  const Ws = 440, Hs = 500, G = 462, S = 15.2, bx = 262, R = 14;
  const yOf = (hm) => G - R - hm * S;
  let svg = `<svg viewBox="0 0 ${Ws} ${Hs}" class="u4l7-wsvg">`;
  svg += `<rect x="0" y="0" width="${Ws}" height="${Hs}" rx="14" class="u4l7-sky"/><rect x="0" y="${G}" width="${Ws}" height="${Hs - G}" class="u4l7-grass"/>`;
  svg += `<path d="M70 ${G} L70 ${G - 25 * S}" class="u4l7-rul"/>`;
  for (let m = 0; m <= 25; m += 5) svg += `<path d="M62 ${G - m * S} L78 ${G - m * S}" class="u4l7-rul"/><text x="56" y="${G - m * S + 7}" text-anchor="end" class="u4l7-rt">${m}</text>`;
  svg += `<text x="18" y="${G - 25 * S - 22}" class="u4l7-rt sm">height (m)</text>`;
  svg += `<path d="M${bx - 12} ${G} L${bx - 22} ${G - 30} L${bx + 22} ${G - 30} L${bx + 12} ${G} Z" class="u4l7-launcher"/><rect x="${bx - 17}" y="${G - 37}" width="34" height="7" class="u4l7-launcher2"/>`;
  svg += `<g class="u4l7-deco"><path d="M${bx + 52} ${G - 150} L${bx + 52} ${G - 250}" /><path d="M${bx + 44} ${G - 238} L${bx + 52} ${G - 252} L${bx + 60} ${G - 238}"/><text x="${bx + 52}" y="${G - 262}" text-anchor="middle">up…</text>`;
  svg += `<path d="M${bx + 112} ${G - 250} L${bx + 112} ${G - 90}" class="dsh"/><path d="M${bx + 104} ${G - 102} L${bx + 112} ${G - 88} L${bx + 120} ${G - 102}"/><text x="${bx + 112}" y="${G - 66}" text-anchor="middle">down?</text></g>`;
  svg += `<g class="u4l7-ghosts"></g><g class="u4l7-trail"></g>`;
  svg += `<circle cx="${bx}" cy="${yOf(0) - 23}" r="${R}" class="u4l7-ball"/>`;
  svg += `<text x="${Ws - 16}" y="34" text-anchor="end" class="u4l7-clock"></text><text x="${Ws - 16}" y="62" text-anchor="end" class="u4l7-clock2"></text></svg>`;
  scene.innerHTML = svg;
  const ball = scene.querySelector('.u4l7-ball'), ghosts = scene.querySelector('.u4l7-ghosts'), trail = scene.querySelector('.u4l7-trail');
  const clock = scene.querySelector('.u4l7-clock'), clock2 = scene.querySelector('.u4l7-clock2');
  const hAt = (t) => -5 * t * t + 20 * t;
  const restY = yOf(0) - 23; // sitting on the launcher
  const placeBall = (t) => { const hm = hAt(t); ball.setAttribute('cy', t <= 0 ? restY : Math.min(restY, yOf(hm))); clock.textContent = `t = ${t.toFixed(1)} s`; clock2.textContent = `h = ${Math.max(0, hm).toFixed(1)} m`; };
  placeBall(0); clock.textContent = ''; clock2.textContent = '';
  // the table
  const cols = [0, 1, 2, 3, 4];
  table.innerHTML = `<div class="u4l7-trow"><div class="u4l7-th">${K('t')} (s)</div>${cols.map((t) => `<div class="u4l7-tc${t === 4 ? ' four' : ''}">${t}</div>`).join('')}</div>
    <div class="u4l7-trow"><div class="u4l7-th">${K('h')} (m)</div>${cols.map((t) => (t === 0 ? '<div class="u4l7-tc">0</div>' : `<div class="u4l7-tc${t === 4 ? ' four' : ''}"><button type="button" class="u4l7-tq" data-t="${t}">?</button></div>`)).join('')}</div>`;
  const ghost = (t) => {
    if (ghosts.querySelector(`[data-t="${t}"]`)) return;
    const twin = { 1: 3, 3: 1 }[t], tw = twin && ghosts.querySelector(`[data-t="${twin}"]`);
    if (tw) { // same height on the way up and on the way down: one label for both
      tw.querySelector('text').textContent = `t=1 and t=3: ${hAt(t)} m`; tw.setAttribute('data-t2', t);
      ghosts.insertAdjacentHTML('beforeend', `<g data-t="${t}"></g>`); return;
    }
    const y = t === 4 ? restY : yOf(hAt(t)), gx = bx - 70 + (t === 4 ? 0 : 0);
    ghosts.insertAdjacentHTML('beforeend', `<g data-t="${t}"><circle cx="${bx}" cy="${y}" r="${R}" class="u4l7-gball"/><path d="M${bx - R - 4} ${y} L${gx + 34} ${y}" class="u4l7-gline"/><text x="${gx + 28}" y="${y + 6}" text-anchor="end" class="u4l7-gt">t=${t}: ${t === 4 ? 'lands' : hAt(t) + ' m'}</text></g>`);
  };
  table.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
    const t = Number(b.dataset.t);
    b.textContent = String(hAt(t)); b.classList.add('shown'); if (hAt(t) === 0) b.classList.add('zero');
    ghost(t); placeBall(t);
  }));
  const showFour = () => table.classList.add('show4');
  let busy = false;
  launch.addEventListener('click', () => {
    if (busy) return; busy = true; trail.innerHTML = ''; launch.disabled = true;
    const t0 = performance.now(), dur = 4000; let lastDot = -1;
    const tick = (now) => {
      const t = Math.min(4, (now - t0) / dur * 4);
      placeBall(t);
      const k = Math.floor(t * 4);
      if (k !== lastDot && t < 4) { lastDot = k; trail.insertAdjacentHTML('beforeend', `<circle cx="${bx + (k % 2 ? 9 : -9)}" cy="${Math.min(restY, yOf(hAt(k / 4)))}" r="4" class="u4l7-dot"/>`); }
      if (t < 4) requestAnimationFrame(tick);
      else { clock.textContent = 'Landed! t = 4 s'; clock2.textContent = 'h = 0 m'; showFour(); const q = table.querySelector('[data-t="4"]'); if (q && !q.classList.contains('shown')) q.click(); placeBall(4); clock.textContent = 'Landed! t = 4.0 s'; busy = false; launch.disabled = false; }
    };
    requestAnimationFrame(tick);
  });
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.u4l7-wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => { const p = b.closest('.poll'); p.classList.toggle('revealed'); if (p.classList.contains('revealed')) showFour(); }));
}

/* ============ wiring ============ */
function mountFigures() {
  const f = document.getElementById('trough-fig'); if (f) troughFigure(f, false);
  const a = document.getElementById('trough-ans'); if (a) troughFigure(a, true);
}
function mountExplainers() {
  const defs = { machine, sweep, whyZero, solve, trough, story };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountFigures(); mountWarmup(); mountExplainers();
