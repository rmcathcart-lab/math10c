/* Math 10C · Unit 2 · Lesson 1 — Understanding Powers and the Exponent Laws: the explainers and warm-up on this page. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

/* KaTeX, allowing \htmlClass / \htmlData (parts of an expression we can find, measure and point at) */
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};
const T = (n) => (n < 0 ? '-' : '') + fmt(Math.abs(n)).replace(/ /g, '\\,'); // number → LaTeX (1 296 → 1\,296)
const N = (n) => (n < 0 ? '−' : '') + fmt(Math.abs(n)); // number → text, with a real minus sign

/* where an element sits inside a stage, in stage pixels (the lesson may be scaled to fit the screen) */
function rel(stage, el) {
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, r = el.getBoundingClientRect();
  return { x: (r.left - sr.left) / k - stage.clientLeft, y: (r.top - sr.top) / k - stage.clientTop, w: r.width / k, h: r.height / k };
}
/* KaTeX's wrapper spans don't always cover tall pieces (big brackets, fractions): measure every visible descendant */
function relDeep(stage, el) {
  const rs = [el, ...el.querySelectorAll('*')].filter((e) => !(e instanceof SVGElement) || e.tagName === 'svg').map((e) => rel(stage, e)).filter((r) => r.w > 0.5 && r.h > 0.5);
  return rs.length ? unionR(rs) : rel(stage, el);
}
function frameAt(stage, r, cls, pad = 6) {
  const f = add(stage, h('div', 'p1-frame ' + (cls || '')), r.x - pad, r.y - pad);
  f.style.width = (r.w + 2 * pad) + 'px'; f.style.height = (r.h + 2 * pad) + 'px'; return f;
}
const unionR = (rs) => { const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y)); return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y }; };
/* a centred row of LaTeX tokens; each token is its own span so it can fly in on its own */
function mkRow(stage, toks, cx, y, fs, cls) {
  const row = add(stage, h('div', 'p1-row' + (cls ? ' ' + cls : '')), cx, y); row.style.fontSize = fs + 'px'; row.style.translate = '-50% 0';
  const els = toks.map((t) => { const e = h('span', 'p1-tok ' + (t.k || 'x') + (t.cp != null ? ' c' + (t.cp % 3) : ''), K(t.t)); row.appendChild(e); return e; });
  return { row, els };
}
/* a token flies in from a point (stage coords) to its place in a row */
function flyIn(c, stage, el, from, ms = 700, delay = 0) {
  if (!from || c.fast) return c.anim(el, [{ opacity: 0 }, { opacity: 1 }], 300, { delay });
  const me = rel(stage, el), dx = from.x - (me.x + me.w / 2), dy = from.y - (me.y + me.h / 2);
  return c.anim(el, [{ opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(1.5)` }, { opacity: 1, transform: `translate(${dx * 0.3}px, ${dy * 0.3 - 16}px) scale(1.2)`, offset: 0.55 }, { opacity: 1, transform: 'none' }], ms, { delay });
}
const ctr = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/* ================= 1. Anatomy of a power ================= */
const AN = {
  '6^4': { base: '6', exp: '4', n: 4 },
  'p^5': { base: 'p', exp: '5', n: 5 },
  '9m^4': { coef: '9', base: 'm', exp: '4', n: 4 },
  '9^4': { base: '9', exp: '4', n: 4 },
  't^12': { base: 't', exp: '12', n: 12 },
  '5^y': { base: '5', exp: 'y', n: 0 },
  '(-w)^7': { base: '\\left(-w\\right)', bname: '-w', fac: '(-w)', exp: '7', n: 7, bnote: 'The brackets put <b>−w</b> inside the fence, so the whole −w is the base.' },
  '(2/5)^8': { base: '\\left(\\dfrac{2}{5}\\right)', bname: '\\tfrac{2}{5}', fac: '\\tfrac{2}{5}', exp: '8', n: 8, bnote: 'The brackets make the <b>whole fraction</b> the base.', small: true },
  '6x^5': { coef: '6', base: 'x', exp: '5', n: 5 },
  '-4z^3': { coef: '-4', base: 'z', exp: '3', n: 3, cnote: 'The minus sign belongs to the coefficient: the exponent 3 reaches only the z.' },
  '3y^9/7': { coef: '\\dfrac{3}{7}', cname: '\\tfrac{3}{7}', base: 'y', exp: '9', n: 9, pre: '\\dfrac{3y^{9}}{7}', small: true }
};
const anLabel = (v) => { const s = AN[v]; return tex(s.pre ? '\\tfrac{3y^{9}}{7}' : (s.coef || '') + `${s.base.replace(/\\dfrac/g, '\\tfrac')}^{${s.exp}}`); };
const anatomy = {
  title: 'Anatomy of a power',
  height: 400,
  choices: [{ v: '6^4', label: anLabel('6^4') }, { v: 'p^5', label: anLabel('p^5') }, { v: '9m^4', label: anLabel('9m^4') },
    { sep: 'Example 1 check:' }, ...['9^4', 't^12', '5^y', '(-w)^7', '(2/5)^8', '6x^5', '-4z^3', '3y^9/7'].map((v) => ({ v, label: anLabel(v) }))],
  intro: (v) => `Every power has the same parts. Let’s name each part of ${anLabel(v)}.`,
  make(stage, v, ex) {
    const s = AN[v], W = ex.W, bn = s.bname || s.base, fac = s.fac || s.base, cn = s.cname || s.coef;
    const powShow = s.bname ? `\\left(${bn}\\right)^{${s.exp}}` : `${s.base}^{${s.exp}}`;
    const mainT = `${s.coef ? `\\htmlClass{an-c}{${s.coef}}` : '\\htmlClass{an-c an-g}{1}'}\\mkern4mu\\htmlClass{an-p}{\\htmlClass{an-b}{${s.base}}^{\\htmlClass{an-e}{${s.exp}}}}`;
    const e0 = add(stage, h('div', 'an-expr' + (s.small ? ' small' : ''), K(s.pre || mainT)), W / 2, s.small ? 34 : 46); e0.style.translate = '-50% 0';
    const q = (sel) => e0.querySelector(sel);
    // the written-out row
    const n = s.n, fs = n >= 9 ? 30 : n >= 7 ? (fac.includes('(') ? 28 : 34) : 40, toks = [{ t: '=', k: 'x' }];
    if (s.coef) toks.push({ t: cn, k: 'cf' }, { t: '\\times', k: 'x' });
    if (n) for (let i = 0; i < n; i++) { if (i) toks.push({ t: '\\times', k: 'x' }); toks.push({ t: fac, k: 'f' }); }
    else toks.push({ t: fac, k: 'f' }, { t: '\\times', k: 'x' }, { t: fac, k: 'f' }, { t: '\\times', k: 'x' }, { t: '\\cdots', k: 'x' }, { t: '\\times', k: 'x' }, { t: fac, k: 'f' });
    const rowY = 262, R = mkRow(stage, toks, W / 2, rowY, fs); hide(...R.els);
    const counts = [];
    const steps = [];
    if (s.pre) steps.push({
      cap: `Rewrite it first. Dividing by 7 is the same as multiplying by ${tex('\\tfrac{1}{7}')}, so ${tex('\\dfrac{3y^{9}}{7}=\\dfrac{3}{7}y^{9}')}.`,
      run: (c) => { e0.innerHTML = K(mainT); return c.fadeIn(e0, 450); }
    });
    steps.push({
      cap: `The <b>base</b> is the factor that gets repeated: ${tex(bn)}. ${s.bnote || ''}`,
      run: (c) => {
        const r = relDeep(stage, q('.an-b')), f = frameAt(stage, r, 'teal', 4);
        const lb = add(stage, h('div', 'p1-tag teal', 'base'), r.x + r.w / 2, r.y + r.h + 24); lb.style.translate = '-50% 0';
        return Promise.all([c.pop(f, 380), c.fadeIn(lb, 350, { delay: 150 })]);
      }
    }, {
      cap: s.exp === 'y' ? `The <b>exponent</b> tells how many times the base is used as a factor. It can be a letter: ${tex('5^{y}')} means <b>y factors</b> of 5.`
        : `The <b>exponent</b>, ${tex(s.exp)}, tells how many times the base is used as a factor.`,
      run: (c) => {
        const r = relDeep(stage, q('.an-e')), f = frameAt(stage, r, 'amber', 3);
        const lb = add(stage, h('div', 'p1-tag amber', '← exponent'), r.x + r.w + 16, r.y + r.h / 2); lb.style.translate = '0 -50%';
        return Promise.all([c.pop(f, 380), c.fadeIn(lb, 350, { delay: 150, from: 'translateX(-8px)' })]);
      }
    }, {
      cap: s.coef ? `The <b>coefficient</b> ${tex(cn)} is the number multiplying the power. It is used <b>once</b>, not repeated. ${s.cnote || ''}`
        : `No number is written in front, so the <b>coefficient</b> is understood to be <b>1</b>: ${tex(`1\\times ${powShow}=${powShow}`)}.`,
      run: (c) => {
        const g = q('.an-c'), r = relDeep(stage, g), f = frameAt(stage, r, 'purple' + (s.coef ? '' : ' faint'), 4);
        const lb = add(stage, h('div', 'p1-tag purple', s.coef ? 'coefficient →' : 'coefficient (understood) →'), r.x - 16, r.y + r.h / 2); lb.style.translate = '-100% -50%';
        const jobs = [c.pop(f, 380), c.fadeIn(lb, 350, { delay: 150, from: 'translateX(8px)' })];
        if (!s.coef) jobs.push(c.anim(g, [{ opacity: 0 }, { opacity: 0.45 }], 400));
        return Promise.all(jobs);
      }
    }, {
      cap: n ? `Written out: <b>${n} factors</b> of ${tex(bn)}${s.coef ? `, and the coefficient ${tex(cn)} just once` : ''}.`
        : `Written out: ${tex('5\\times5\\times\\cdots\\times5')}, with <b>y</b> factors of 5 (however many y turns out to be).`,
      run: async (c) => {
        const fr = relDeep(stage, q('.an-b')), from = ctr(fr), cr = relDeep(stage, q('.an-c')), fromC = ctr(cr);
        let k = 0;
        const jobs = R.els.map((el, j) => {
          const t = toks[j];
          if (t.k === 'f') return flyIn(c, stage, el, from, 650, 80 + (k++) * Math.min(110, 900 / Math.max(n, 3)));
          if (t.k === 'cf') return flyIn(c, stage, el, fromC, 650, 0);
          return c.anim(el, [{ opacity: 0 }, { opacity: 1 }], 300, { delay: 200 + j * 25 });
        });
        await Promise.all(jobs);
        // number the factors (or brace them when the exponent is a letter)
        const fEls = R.els.filter((_, j) => toks[j].k === 'f');
        if (n) fEls.forEach((el, i) => { const r = rel(stage, el); const t = add(stage, h('div', 'an-count', String(i + 1)), r.x + r.w / 2, r.y + r.h + 6); t.style.translate = '-50% 0'; counts.push(t); });
        else {
          const r = unionR(fEls.map((el) => rel(stage, el)).concat(R.els.slice(-7).map((el) => rel(stage, el))));
          const br = add(stage, h('div', 'an-brace'), r.x, r.y + r.h + 4); br.style.width = r.w + 'px';
          const t = add(stage, h('div', 'an-count wide', `${tex('y')} factors of 5`), r.x + r.w / 2, r.y + r.h + 22); t.style.translate = '-50% 0'; counts.push(br, t);
        }
        await Promise.all(counts.map((t, i) => c.fadeIn(t, 260, { delay: i * 40 })));
      }
    }, {
      cap: `The <b>power</b> is the whole ${tex(powShow)}: base and exponent together, not just the little ${tex(s.exp)}.`,
      run: (c) => {
        const r = relDeep(stage, q('.an-p')), f = frameAt(stage, r, 'red', 14);
        const lb = add(stage, h('div', 'p1-tag red', 'power'), r.x - 16, Math.max(r.y - 16, 30)); lb.style.translate = (r.y - 16 < 30 ? '-100%' : '0') + ' -100%';
        return Promise.all([c.anim(f, [{ opacity: 0, transform: 'scale(1.15)' }, { opacity: 1, transform: 'none' }], 450), c.fadeIn(lb, 350, { delay: 200 })]);
      }
    });
    return steps;
  }
};

/* ================= 2–4. Where the fence sits ================= */
const O = (t) => ({ o: t });
const NEG = { neg: true };
const E = (b, e, p = false) => ({ b: [].concat(b), e, p });
function fenceTex(terms, marks) {
  return terms.map((t) => {
    if (t.neg) return marks ? '\\htmlClass{f-o}{-}' : '-';
    if (t.o) return marks ? `\\htmlClass{f-o}{${t.o}}` : t.o;
    const inner = (t.p ? '(' : '') + t.b.join('') + (t.p ? ')' : '');
    return marks ? `\\htmlClass{f-i}{${inner}}^{\\htmlClass{f-e}{${t.e}}}` : `${inner}^{${t.e}}`;
  }).join(marks ? '\\mkern1.5mu ' : '');
}
const X = { t: '\\times', k: 'x' }, P = (ch) => ({ t: ch, k: 'x' });
function fenceRows(terms) {
  const r1 = [], r2 = [], multi = terms.some((t) => t.p && t.b.length > 1);
  let neg = false, oi = 0;
  terms.forEach((t) => {
    if (t.neg) { r1.push({ t: '-', k: 'o', src: oi }); r2.push({ t: '-', k: 'o', src: oi }); oi++; neg = true; return; }
    const g1 = [], g2 = [];
    if (t.o) { g1.push({ t: t.o, k: 'o', src: oi }); g2.push({ t: t.o, k: 'o', src: oi }); oi++; }
    else if (t.e === 0) { g1.push({ t: '1', k: 'i one' }); g2.push({ t: '1', k: 'i one' }); }
    else for (let c = 0; c < t.e; c++) {
      if (c) { g1.push(X); g2.push(X); }
      const whole = t.p ? `(${t.b.join('')})` : t.b[0];
      g1.push({ t: whole, k: 'i', cp: c });
      if (t.p && t.b.length > 1) t.b.forEach((a, j) => { if (j) g2.push(X); g2.push({ t: a, k: 'i', cp: c }); });
      else g2.push({ t: whole, k: 'i', cp: c });
    }
    if (r1.length && !neg) { r1.push(X); r2.push(X); }
    if (neg) { r1.push(P('('), ...g1, P(')')); r2.push(P('('), ...g2, P(')')); } else { r1.push(...g1); r2.push(...g2); }
    neg = false;
  });
  return multi ? [r1, r2] : [r1];
}
function fenceDef(title, list, sepAt, sepLabel) {
  const map = {}; list.forEach((s) => { map[s.v] = s; });
  const choices = [];
  list.forEach((s, i) => { if (i === sepAt) choices.push({ sep: sepLabel }); choices.push({ v: s.v, label: tex(fenceTex(s.terms, false)) }); });
  return {
    title, height: 424, choices,
    intro: (v) => `Where does the fence sit in ${tex(fenceTex(map[v].terms, false))}? The exponent repeats only what is <b>inside</b> it.`,
    make(stage, v, ex) {
      const s = map[v], W = ex.W, ins = s.terms.find((t) => t.b), e = ins.e;
      const e0 = add(stage, h('div', 'fz-expr', K(fenceTex(s.terms, true))), W / 2, 52); e0.style.translate = '-50% 0';
      const rows = fenceRows(s.terms).map((toks, i) => { const r = mkRow(stage, [P('='), ...toks], W / 2, 210 + i * 70, 34); r.toks = [P('='), ...toks]; hide(...r.els); return r; });
      const res = add(stage, h('div', 'fz-res', K(s.res)), W / 2, 210 + rows.length * 70 + 4); res.style.translate = '-50% 0'; hide(res);
      const hasOut = s.terms.some((t) => t.o || t.neg);
      let fenceR = null, outR = [];
      const measure = () => { fenceR = relDeep(stage, e0.querySelector('.f-i')); outR = [...e0.querySelectorAll('.f-o')].map((el) => relDeep(stage, el)); };
      const steps = [{
        cap: s.fc,
        run: (c) => {
          measure();
          const f = frameAt(stage, fenceR, 'fence', 7), er = relDeep(stage, e0.querySelector('.f-e')), fe = frameAt(stage, er, 'amber round', 4);
          const lb = add(stage, h('div', 'p1-tag amber', e === 0 ? 'inside · used 0 times' : `inside · used ${e} times`), fenceR.x + fenceR.w / 2, fenceR.y + fenceR.h + 14); lb.style.translate = '-50% 0';
          const jobs = [c.pop(f, 400), c.pop(fe, 380, { delay: 120 }), c.fadeIn(lb, 350, { delay: 250 })];
          outR.forEach((r, i) => {
            const o = frameAt(stage, r, 'out', 5), t = add(stage, h('div', 'p1-tag gray', 'once'), r.x + r.w / 2, r.y - 14); t.style.translate = '-50% -100%';
            jobs.push(c.fadeIn(o, 300, { delay: 350 + i * 120 }), c.fadeIn(t, 300, { delay: 400 + i * 120 }));
          });
          return Promise.all(jobs);
        }
      }, {
        cap: s.c1 || (e === 0 ? `The exponent is <b>0</b>: the inside of the fence is used <b>zero times</b>, which leaves <b>1</b>.${hasOut ? ' Whatever is outside stays.' : ''}`
          : `Write what’s inside the fence <b>${e} times</b>.${hasOut ? ' Anything outside is written <b>once</b>.' : ''}`),
        run: (c) => {
          if (!fenceR) measure();
          const R1 = rows[0], fc = ctr(fenceR);
          let k = 0;
          return Promise.all(R1.els.map((el, j) => {
            const t = R1.toks[j];
            if (t.k.startsWith('i')) return flyIn(c, stage, el, fc, 700, 120 + (k++) * 150);
            if (t.k === 'o') return flyIn(c, stage, el, ctr(outR[t.src]), 650, 60);
            return c.anim(el, [{ opacity: 0 }, { opacity: 1 }], 300, { delay: 250 + j * 30 });
          }));
        }
      }];
      if (rows[1]) steps.push({
        cap: `Drop the brackets: the same factors, written one at a time.`,
        run: (c) => Promise.all(rows[1].els.map((el, j) => c.anim(el, [{ opacity: 0, transform: 'translateY(-34px)' }, { opacity: 1, transform: 'none' }], 450, { delay: j * 35 })))
      });
      steps.push({ cap: s.rc, run: (c) => c.pop(res, 450) });
      return steps;
    }
  };
}
const fence = fenceDef('Where the fence sits', [
  { v: 'a1', terms: [O('5'), E('m', 3)], fc: 'No brackets, so the exponent <b>3</b> reaches only the <b>m</b>. The 5 sits outside the fence: it is a coefficient.', res: '=5m^{3}', rc: `Only m is repeated. The 5 appears <b>once</b>: ${tex('5m^{3}=5\\times m\\times m\\times m')}.` },
  { v: 'a2', terms: [E(['5', 'm'], 3, true)], fc: 'The brackets put <b>5m</b> inside the fence, so the exponent 3 reaches the 5 <b>and</b> the m.', res: '=(5\\times5\\times5)(m\\times m\\times m)=125m^{3}', rc: `Group the like factors: three 5s make 125 and three m’s make ${tex('m^{3}')}. So ${tex('(5m)^{3}=125m^{3}')}, not ${tex('5m^{3}')}!` },
  { v: 'a3', terms: [O('3'), E('x', 2)], fc: 'No brackets: the exponent <b>2</b> reaches only the <b>x</b>. The 3 is outside.', res: '=3x^{2}', rc: `${tex('3x^{2}=3\\times x\\times x')}: one 3, two x’s.` },
  { v: 'a4', terms: [E(['3', 'x'], 2, true)], fc: 'The brackets put <b>3x</b> inside the fence: both the 3 and the x get squared.', res: '=(3\\times3)(x\\times x)=9x^{2}', rc: `${tex('(3x)^{2}=9x^{2}')}. Compare ${tex('3x^{2}')}: the fence makes all the difference.` },
  { v: 'b1', terms: [O('5'), E('m', 3), O('n')], fc: 'No brackets: the exponent 3 reaches only the <b>m</b>. The 5 and the n are both outside the fence.', res: '=5m^{3}n', rc: `${tex('5m^{3}n=5\\times m\\times m\\times m\\times n')}. Only the m is cubed.` },
  { v: 'b2', terms: [O('5'), O('m'), E('n', 3)], fc: 'This time the exponent sits on the <b>n</b>, so only n is inside the fence.', res: '=5mn^{3}', rc: `${tex('5mn^{3}=5\\times m\\times n\\times n\\times n')}. Only the n is cubed.` },
  { v: 'b3', terms: [O('5'), E(['m', 'n'], 3, true)], fc: 'The fence holds <b>mn</b>. The 5 is still outside.', res: '=5m^{3}n^{3}', rc: `Three m’s and three n’s, but just <b>one</b> 5: ${tex('5(mn)^{3}=5m^{3}n^{3}')}.` },
  { v: 'b4', terms: [E(['5', 'm', 'n'], 3, true)], fc: 'Now the fence holds <b>5mn</b>: the 5 is inside too, so it gets repeated.', res: '=(5\\times5\\times5)m^{3}n^{3}=125m^{3}n^{3}', rc: `Three 5s, three m’s, three n’s: ${tex('(5mn)^{3}=125m^{3}n^{3}')}.` }
], 4, 'Example 2 check:');
const fenceNeg = fenceDef('The fence and a negative sign', [
  { v: 'n1', terms: [NEG, E('2', 4)], fc: 'No brackets: the exponent <b>4</b> reaches only the <b>2</b>. The minus sign sits <b>outside</b> the fence.', c1: 'Multiply out what’s inside the fence. The minus sign waits outside, in front of everything.', res: '=-16', rc: `${tex('-2^{4}=-(2\\times2\\times2\\times2)=-16')}. The answer is negative.` },
  { v: 'n2', terms: [E('-2', 4, true)], fc: 'The brackets put <b>−2</b> inside the fence: −2 is the base.', res: '=16', rc: `Four negative factors pair up into positives: ${tex('(-2)^{4}=16')}.` },
  { v: 'n3', terms: [NEG, E('7', 2)], fc: 'No brackets, so the fence holds only the <b>7</b>. The minus sign is outside.', c1: 'Square what’s inside the fence. The minus sign waits outside.', res: '=-49', rc: `${tex('-7^{2}=-(7\\times7)=-49')}.` },
  { v: 'n4', terms: [E('-7', 2, true)], fc: 'The fence holds <b>−7</b> itself, so −7 is the base.', res: '=49', rc: `${tex('(-7)\\times(-7)=49')}: two negatives multiply to a <b>positive</b>.` },
  { v: 'n5', terms: [NEG, E('7', 3)], fc: 'No brackets: the exponent 3 reaches only the <b>7</b>.', c1: 'Cube what’s inside the fence. The minus sign waits outside.', res: '=-343', rc: `${tex('-7^{3}=-(7\\times7\\times7)=-343')}.` },
  { v: 'n6', terms: [E('-7', 3, true)], fc: 'The fence holds <b>−7</b>, so three factors of −7.', res: '=-343', rc: `${tex('(-7)(-7)(-7)=-343')}: an <b>odd</b> number of negatives is negative. Same answer as ${tex('-7^{3}')}!` }
], 2, 'Example 3 check:');
const fenceZero = fenceDef('Zero exponents and the fence', [
  { v: 'z1', terms: [O('2'), E('x', 0)], fc: 'No brackets: the exponent <b>0</b> reaches only the <b>x</b>. The 2 is outside the fence.', res: '=2\\times1=2', rc: `${tex('x^{0}=1')}, so ${tex('2x^{0}=2\\times1=2')} (for ${tex('x\\neq0')}).` },
  { v: 'z2', terms: [E(['2', 'x'], 0, true)], fc: 'The brackets put <b>2x</b> inside the fence: the exponent 0 reaches all of it.', res: '=1', rc: `Any nonzero base to the power 0 is 1, even a whole bracket: ${tex('(2x)^{0}=1')}.` },
  { v: 'z3', terms: [E('-5', 0, true)], fc: 'The fence holds <b>−5</b>: the base is −5.', res: '=1', rc: `${tex('(-5)^{0}=1')}: the base −5 is not 0, so the answer is 1.` },
  { v: 'z4', terms: [NEG, E('5', 0)], fc: 'No brackets: the exponent 0 reaches only the <b>5</b>. The minus sign is outside the fence.', res: '=-1', rc: `${tex('-5^{0}=-(5^{0})=-(1)=-1')}.` },
  { v: 'z5', terms: [E('11', 0)], fc: 'The base is <b>11</b> and the exponent is 0.', res: '=1', rc: `${tex('11^{0}=1')}.` },
  { v: 'z6', terms: [E('-8', 0, true)], fc: 'The brackets put <b>−8</b> inside the fence.', res: '=1', rc: `${tex('(-8)^{0}=1')}: the whole base −8 is raised to the power 0.` },
  { v: 'z7', terms: [NEG, E('8', 0)], fc: 'No brackets: the exponent 0 reaches only the <b>8</b>. The minus sign is outside.', res: '=-1', rc: `${tex('-8^{0}=-(8^{0})=-1')}. Compare ${tex('(-8)^{0}=1')}.` },
  { v: 'z8', terms: [O('3'), E('5^{2}', 0, true)], fc: 'The fence holds <b>5²</b> (that’s 25), and the exponent 0 reaches all of it. The 3 is outside.', res: '=3\\times1=3', rc: `${tex('\\left(5^{2}\\right)^{0}=1')} because 25 ≠ 0, so ${tex('3\\left(5^{2}\\right)^{0}=3\\times1=3')}.` }
], 4, 'Example 4 check:');

/* ================= 3. The sign pattern for negative bases ================= */
const SIGN_N = { 2: 6, 3: 5, 1: 6, 10: 6, 7: 4 };
const signs = {
  title: 'Negative bases: watch the sign flip',
  height: 450,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 2, label: tex('-2') }, { v: 3, label: tex('-3') }, { v: 1, label: tex('-1') }, { v: 10, label: tex('-10') }, { sep: 'Example 3 check:' }, { v: 7, label: tex('-7') }],
  intro: (b) => `Compare ${tex(`(-${b})^{n}`)} and ${tex(`-${b}^{n}`)} as the exponent n grows. Each step adds one more factor.`,
  make(stage, b, ex) {
    const W = ex.W, Nn = SIGN_N[b] || 5, CX = 196, VW = 170, VX = W - VW - 20;
    const slot = Math.min(100, (VX - 54 - CX) / Nn), fs = b >= 10 ? 22 : 25;
    const yA = 34, yB = 122, lab = (s, y) => { const e = add(stage, h('div', 'sg-lab', K(s)), 24, y); return e; };
    lab(`(-${b})^{n}`, yA + 2); lab(`-${b}^{n}`, yB + 2);
    const cx = (i) => CX + slot / 2 + i * slot;
    const chipsA = [], chipsB = [], xsA = [], xsB = [];
    for (let i = 0; i < Nn; i++) {
      const a = add(stage, h('div', 'sg-chip neg', K(`(-${b})`)), cx(i), yA + 28); a.style.fontSize = fs + 'px';
      const bb = add(stage, h('div', 'sg-chip', K(String(b))), cx(i), yB + 28); bb.style.fontSize = fs + 'px';
      chipsA.push(a); chipsB.push(bb); hide(a, bb);
      if (i) { const xa = add(stage, h('div', 'sg-x', ''), cx(i) - slot / 2, yA + 28), xb = add(stage, h('div', 'sg-x', '×'), cx(i) - slot / 2, yB + 28); xsA.push(xa); xsB.push(xb); hide(xa, xb); }
    }
    const minus = add(stage, h('div', 'sg-par', '−('), CX - 4, yB + 28); minus.style.translate = '-100% -50%'; hide(minus);
    const close = add(stage, h('div', 'sg-par', ')'), cx(0) + slot / 2 - 2, yB + 28); close.style.translate = '0 -50%'; hide(close);
    const valA = add(stage, h('div', 'sg-val'), VX, yA), valB = add(stage, h('div', 'sg-val'), VX, yB);
    [valA, valB].forEach((e) => { e.style.width = VW + 'px'; }); hide(valA, valB);
    // results table
    const ty = 236, tx = 210, cw = (W - tx - 24) / Nn;
    add(stage, h('div', 'sg-th n', 'n'), 24, ty); add(stage, h('div', 'sg-th', K(`(-${b})^{n}`)), 24, ty + 36); add(stage, h('div', 'sg-th', K(`-${b}^{n}`)), 24, ty + 84);
    const rule = add(stage, h('div', 'sg-rule'), 20, ty + 36); rule.style.width = (W - 40) + 'px';
    const cols = [];
    for (let i = 0; i < Nn; i++) {
      const n = i + 1, va = Math.pow(-b, n), vb = -Math.pow(b, n), same = va === vb;
      const col = add(stage, h('div', 'sg-col', `<div class="sg-n">${n}</div><div class="sg-v ${va > 0 ? 'pos' : 'neg'}">${N(va)}</div><div class="sg-v neg">${N(vb)}</div><div class="sg-same ${same ? 'yes' : 'no'}">${same ? 'same' : 'different'}</div>`), tx + i * cw, ty);
      col.style.width = cw + 'px'; hide(col); cols.push(col);
    }
    const sum = add(stage, h('div', 'sg-sum'), W / 2, 410); sum.style.translate = '-50% 0'; hide(sum);
    sum.innerHTML = `<b>even n:</b> ${K(`(-${b})^{n}`)} positive, ${K(`-${b}^{n}`)} negative &nbsp;·&nbsp; <b>odd n:</b> both negative`;
    const setVal = (el, v) => { el.innerHTML = `=&nbsp;<b>${N(v)}</b>`; el.classList.toggle('pos', v > 0); el.classList.toggle('neg', v < 0); };
    const steps = [];
    for (let i = 0; i < Nn; i++) {
      const n = i + 1, va = Math.pow(-b, n), vb = -Math.pow(b, n), even = n % 2 === 0;
      let cap;
      if (n === 1) cap = `One factor: ${tex(`(-${b})^{1}=-${b}`)} and ${tex(`-${b}^{1}=-${b}`)}. The same, so far.`;
      else if (n === 2) cap = `${tex(`(-${b})^{2}=(-${b})(-${b})=${T(va)}`)}: two negatives make a <b>positive</b>. But in ${tex(`-${b}^{2}`)} the exponent reaches only the ${b}: ${tex(`-(${b}\\times${b})=${T(vb)}`)}. <b>Different!</b>`;
      else if (n === 3) cap = `A third factor of ${tex(`-${b}`)} flips the sign back: ${tex(`(-${b})^{3}=${T(va)}`)}. And ${tex(`-${b}^{3}=${T(vb)}`)}. Odd exponent: <b>the same</b>.`;
      else cap = `${n} negative factors ${even ? 'pair up exactly' : 'leave one without a partner'}: ${tex(`(-${b})^{${n}}=${T(va)}`)} is <b>${even ? 'positive' : 'negative'}</b>. ${tex(`-${b}^{${n}}=${T(vb)}`)} is negative as always: <b>${va === vb ? 'same' : 'different'}</b>.`;
      steps.push({
        cap,
        run: async (c) => {
          const jobs = [c.pop(chipsA[i], 380), c.pop(chipsB[i], 380, { delay: 120 })];
          if (i) jobs.push(c.fadeIn(xsA[i - 1], 250), c.fadeIn(xsB[i - 1], 250));
          if (!i) jobs.push(c.fadeIn(minus, 300), c.fadeIn(close, 300));
          else jobs.push(c.anim(close, [{ left: close.style.left }, { left: (cx(i) + slot / 2 - 2) + 'px' }], 380));
          setVal(valA, va); setVal(valB, vb);
          jobs.push(c.anim(valA, [{ opacity: 0.2, transform: 'scale(.85)' }, { opacity: 1, transform: 'none' }], 380, { delay: 250 }), c.anim(valB, [{ opacity: 0.2, transform: 'scale(.85)' }, { opacity: 1, transform: 'none' }], 380, { delay: 350 }));
          jobs.push(c.fadeIn(cols[i], 400, { delay: 450 }));
          await Promise.all(jobs);
        }
      });
    }
    steps.push({
      cap: b === 1 ? `${tex('(-1)^{n}')} just flips between −1 and 1: <b>even</b> n gives 1, <b>odd</b> n gives −1. But ${tex('-1^{n}')} is <b>always −1</b>: its minus sign is outside the fence.`
        : `<b>Even</b> exponent: ${tex(`(-${b})^{n}`)} is positive. <b>Odd</b>: negative. ${tex(`-${b}^{n}`)} is <b>always</b> negative, because its minus sign sits outside the fence. They agree only when n is odd.`,
      run: (c) => Promise.all([c.fadeIn(sum, 400), ...cols.map((col, i) => c.anim(col.querySelector('.sg-same'), [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], 350, { delay: i * 90 }))])
    });
    return steps;
  }
};

/* ================= 4. The zero exponent staircase ================= */
const zero = {
  title: 'Count down the exponent',
  height: 430,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [6, 2, 3, 10],
  custom: [2, 20],
  intro: (b) => `Start at ${tex(`${b}^{4}`)} and lower the exponent one step at a time. What happens to the value each time?`,
  make(stage, b, ex) {
    const W = ex.W, top = 4, rowH = 62, y0 = 16, fs = b >= 10 ? 26 : 30;
    const vRight = W - 250, rows = [];
    for (let e = top; e >= 0; e--) {
      const i = top - e, y = y0 + i * rowH;
      const pw = add(stage, h('div', 'zr-pow', K(`${b}^{${e}}`)), 34, y);
      const toks = [];
      if (e) for (let k = 0; k < e; k++) { if (k) toks.push(X); toks.push({ t: String(b), k: 'f' }); }
      const fr = add(stage, h('div', 'zr-facs'), 150, y); fr.style.fontSize = fs + 'px';
      fr.innerHTML = `<span class="zr-eq">${K('=')}</span>` + (e ? toks.map((t) => `<span class="p1-tok ${t.k}">${K(t.t)}</span>`).join('') : '<span class="zr-none">no factors of ' + b + ' left</span>');
      const val = add(stage, h('div', 'zr-val', `=&nbsp;<b>${e ? fmt(Math.pow(b, e)) : '?'}</b>`), vRight, y); val.style.translate = '-100% 0';
      const arrow = i ? add(stage, h('div', 'zr-arrow', `<svg width="44" height="${rowH}"><path d="M6 6 C 40 12, 40 ${rowH - 12}, 8 ${rowH - 4}"/><path d="M8 ${rowH - 4} l9 -2 M8 ${rowH - 4} l5 -8"/></svg><span>÷ ${b}</span>`), vRight + 14, y - rowH / 2 + 4) : null;
      hide(pw, fr, val, arrow);
      rows.push({ e, pw, fr, val, arrow, y });
    }
    const law = add(stage, h('div', 'zr-law', `${K('a^{0}=1')}<em class="zr-note">for any base ${K('a\\neq0')}</em>`), W / 2, y0 + 5 * rowH + 18); law.style.translate = '-50% 0'; hide(law);
    const v = (e) => fmt(Math.pow(b, e));
    const showRow = (c, r) => Promise.all([c.fadeIn(r.pw, 350), c.anim(r.fr, [{ opacity: 0, transform: `translateY(-${rowH * 0.6}px)` }, { opacity: 1, transform: 'none' }], 500, { delay: 100 }), r.arrow ? c.fadeIn(r.arrow, 350, { delay: 300 }) : null, c.pop(r.val, 380, { delay: r.arrow ? 500 : 250 })]);
    return [
      { cap: `Start with ${tex(`${b}^{4}`)}: four factors of ${b} make <b>${v(4)}</b>.`, run: (c) => showRow(c, rows[0]) },
      { cap: `Lower the exponent by 1: one <b>fewer</b> factor of ${b}, so the value is <b>divided by ${b}</b>: ${v(4)} ÷ ${b} = ${v(3)}.`, run: (c) => showRow(c, rows[1]) },
      { cap: `Again: ${tex(`${b}^{2}`)} has two factors. ${v(3)} ÷ ${b} = ${v(2)}.`, run: (c) => showRow(c, rows[2]) },
      { cap: `${tex(`${b}^{1}`)} is a single factor of ${b}: ${v(2)} ÷ ${b} = <b>${b}</b>. Any number to the power 1 is itself.`, run: (c) => showRow(c, rows[3]) },
      { cap: `${tex(`${b}^{0}`)}: <b>no</b> factors of ${b} left at all. What should it equal? Keep the pattern going: divide by ${b} once more.`, run: (c) => showRow(c, rows[4]) },
      {
        cap: `${b} ÷ ${b} = <b>1</b>. So ${tex(`${b}^{0}=1`)}, not 0!${b === 10 ? ' (Warm-up link: a 0-digit PIN has exactly <b>one</b> code — enter nothing.)' : ''}`,
        run: async (c) => { const r = rows[4]; await c.anim(r.val, [{ opacity: 1 }, { opacity: 0 }], 200); r.val.innerHTML = '=&nbsp;<b class="ok">1</b>'; await c.pop(r.val, 420); }
      },
      { cap: `Every nonzero base follows the same pattern: <b>${tex('a^{0}=1')}</b>. Not for a base of 0, though: we would have to divide by 0, so ${tex('0^{0}')} is undefined.`, run: (c) => c.pop(law, 450) }
    ];
  }
};

/* ================= 5. The five laws, rebuilt from repeated multiplication ================= */
const SLOT = 84;
const xsAt = (n, cx, slot = SLOT) => Array.from({ length: n }, (_, i) => cx + (i - (n - 1) / 2) * slot);
function tile(stage, label, cls, x, y) { return add(stage, h('div', 'lw-t ' + (cls || ''), K(label)), x, y); }
const mv = (c, el, x, y, ms = 650, delay = 0) => c.anim(el, [{ left: el.style.left, top: el.style.top }, { left: x + 'px', top: y + 'px' }], ms, { delay });
function lwLine(stage, src, W, y, cls) { const e = add(stage, h('div', 'lw-line ' + (cls || ''), src), W / 2, y); e.style.translate = '-50% 0'; hide(e); return e; }
function badges(stage, tiles) { return tiles.map((t, i) => { const b = add(stage, h('div', 'lw-badge', String(i + 1)), 0, 0); hide(b); b._t = t; return b; }); }
const placeBadges = (bs) => bs.forEach((b) => at(b, parseFloat(b._t.style.left) + 22, parseFloat(b._t.style.top) - 24));
const LAWS = [
  { v: 'prod', name: 'Product Law', head: '6^{3}\\times6^{2}', res: '6^{3}\\times6^{2}=6^{3+2}=6^{5}', vr: 'c^{3}\\times c^{2}=c^{3+2}=c^{5}', law: 'a^{m}\\cdot a^{n}=a^{m+n}' },
  { v: 'quot', name: 'Quotient Law', head: '6^{5}\\div6^{2}', res: '6^{5}\\div6^{2}=6^{5-2}=6^{3}', vr: 'c^{5}\\div c^{2}=c^{5-2}=c^{3}', law: 'a^{m}\\div a^{n}=a^{m-n},\\ a\\neq0' },
  { v: 'pprod', name: 'Power of a Product Law', head: '(6\\cdot5)^{3}', res: '(6\\cdot5)^{3}=6^{3}\\cdot5^{3}', vr: '(cd)^{3}=c^{3}d^{3}', law: '(ab)^{m}=a^{m}b^{m}' },
  { v: 'pquot', name: 'Power of a Quotient Law', head: '\\left(\\frac{6}{5}\\right)^{3}', res: '\\left(\\frac{6}{5}\\right)^{3}=\\frac{6^{3}}{5^{3}}', vr: '\\left(\\frac{c}{d}\\right)^{3}=\\frac{c^{3}}{d^{3}}', law: '\\left(\\frac{a}{b}\\right)^{n}=\\frac{a^{n}}{b^{n}},\\ b\\neq0' },
  { v: 'ppow', name: 'Power of a Power Law', head: '\\left(6^{3}\\right)^{2}', res: '\\left(6^{3}\\right)^{2}=6^{3\\times2}=6^{6}', vr: '\\left(c^{3}\\right)^{2}=c^{3\\times2}=c^{6}', law: '\\left(a^{m}\\right)^{n}=a^{mn}' }
];
const laws = {
  title: 'Every law is just counting factors',
  height: 496,
  choices: [{ v: 'prod', label: 'Product' }, { v: 'quot', label: 'Quotient' }, { v: 'pprod', label: 'Power of a Product' }, { v: 'pquot', label: 'Power of a Quotient' }, { v: 'ppow', label: 'Power of a Power' }],
  intro: (v) => { const L = LAWS.find((l) => l.v === v); return `<b>${L.name}.</b> Write ${tex(L.head)} out as repeated multiplication, then count.`; },
  make(stage, v, ex) {
    const W = ex.W, L = LAWS.find((l) => l.v === v);
    const head = add(stage, h('div', 'lw-head', K(L.head)), W / 2, 12); head.style.translate = '-50% 0';
    const pq = v === 'pquot', big = (t) => (pq ? t.replace(/\\frac/g, '\\dfrac') : t);
    const res = lwLine(stage, K(big(L.res)), W, pq ? 266 : 292, 'res'), vr = lwLine(stage, K(big(L.vr)), W, pq ? 348 : 354), law = lwLine(stage, `<b>${L.name}</b> ${K(L.law)}`, W, pq ? 428 : 418, 'law');
    const lines = [
      (c) => c.fadeIn(res, 400),
      (c) => c.fadeIn(vr, 400),
      (c) => c.pop(law, 450)
    ];
    const S = { prod: lawProduct, quot: lawQuotient, pprod: lawPowProduct, pquot: lawPowQuotient, ppow: lawPowPower }[v](stage, W);
    const caps = S.caps;
    return [
      { cap: caps[0], run: S.s1 },
      { cap: caps[1], run: S.s2 },
      { cap: caps[2], run: (c) => Promise.all([S.s3(c), lines[0](c)]) },
      { cap: caps[3], run: lines[1] },
      { cap: caps[4], run: lines[2] }
    ];
  }
};
function groupBox(stage, xs, y, label, cls) {
  const x0 = xs[0] - SLOT / 2 + 4, w = xs.length * SLOT - 8;
  const b = add(stage, h('div', 'lw-box ' + (cls || '')), x0, y - 42); b.style.width = w + 'px'; b.style.height = '84px';
  const l = add(stage, h('div', 'lw-blab ' + (cls || ''), K(label)), x0 + w / 2, y - 48); l.style.translate = '-50% -100%';
  hide(b, l); return [b, l];
}
function timesSigns(stage, xs, y) { return xs.slice(1).map((x) => { const e = add(stage, h('div', 'lw-x', '×'), x - SLOT / 2, y); hide(e); return e; }); }
function lawProduct(stage, W) {
  const y = 176, A = xsAt(3, W / 2 - 200), B = xsAt(2, W / 2 + 180);
  const ta = A.map((x) => tile(stage, '6', 'a', x, y)), tb = B.map((x) => tile(stage, '6', 'b', x, y)), all = [...ta, ...tb];
  hide(...all);
  const ba = groupBox(stage, A, y, '6^{3}', 'a'), bb = groupBox(stage, B, y, '6^{2}', 'b');
  const mid = add(stage, h('div', 'lw-x big', '×'), (A[2] + B[0]) / 2, y); hide(mid);
  const F = xsAt(5, W / 2), xs = timesSigns(stage, F, y), bs = badges(stage, all);
  return {
    caps: [`${tex('6^{3}')} is three 6s multiplied; ${tex('6^{2}')} is two 6s.`,
      'Multiplying the two powers just puts <b>all</b> the factors in one long row.',
      `Count them: 3 + 2 = <b>5</b> factors of 6. So ${tex('6^{3}\\times6^{2}=6^{5}')}.`,
      `The base doesn’t matter. With a variable: ${tex('c^{3}\\times c^{2}=c^{5}')}.`,
      '<b>Product Law:</b> multiplying powers with the <b>same base</b>? Keep the base and <b>add</b> the exponents.'],
    s1: (c) => Promise.all([...ba, ...bb].map((e) => c.fadeIn(e, 350)).concat(all.map((t, i) => c.pop(t, 320, { delay: 150 + i * 90 })), [c.fadeIn(mid, 300)])),
    s2: (c) => Promise.all([...ba, ...bb, mid].map((e) => c.anim(e, [{ opacity: 1 }, { opacity: 0 }], 300)).concat(all.map((t, i) => mv(c, t, F[i], y, 700, 150 + i * 60)), xs.map((e, i) => c.fadeIn(e, 300, { delay: 800 + i * 50 })))),
    s3: async (c) => { placeBadges(bs); for (const b of bs) await c.pop(b, 220); }
  };
}
function lawQuotient(stage, W) {
  const yT = 126, yB = 210, top = xsAt(5, W / 2), bot = [top[3], top[4]];
  const tt = top.map((x) => tile(stage, '6', 'a', x, yT)), tb = bot.map((x) => tile(stage, '6', 'b', x, yB));
  const bar = add(stage, h('div', 'lw-bar'), top[0] - SLOT / 2, (yT + yB) / 2 - 2); bar.style.width = 5 * SLOT + 'px';
  const lt = add(stage, h('div', 'lw-side', K('6^{5}')), top[0] - SLOT / 2 - 18, yT), lb = add(stage, h('div', 'lw-side', K('6^{2}')), top[0] - SLOT / 2 - 18, yB);
  [lt, lb].forEach((e) => { e.style.translate = '-100% -50%'; });
  hide(...tt, ...tb, bar, lt, lb);
  return {
    caps: [`${tex('6^{5}\\div6^{2}')} as a fraction: five 6s on top, two 6s on the bottom.`,
      `Each 6 on the bottom cancels a 6 on top, because ${tex('6\\div6=1')}.`,
      `Three 6s are left: 5 − 2 = <b>3</b>. So ${tex('6^{5}\\div6^{2}=6^{3}')}.`,
      `Same with a variable: ${tex('c^{5}\\div c^{2}=c^{3}')}.`,
      '<b>Quotient Law:</b> dividing powers with the <b>same base</b>? Keep the base and <b>subtract</b> the exponents. (The base can’t be 0.)'],
    s1: (c) => Promise.all([c.fadeIn(bar, 300), c.fadeIn(lt, 300), c.fadeIn(lb, 300), ...tt.map((t, i) => c.pop(t, 300, { delay: i * 80 })), ...tb.map((t, i) => c.pop(t, 300, { delay: 450 + i * 80 }))]),
    s2: async (c) => {
      for (let i = 0; i < 2; i++) {
        const a = tt[3 + i], b = tb[i];
        a.classList.add('gone'); b.classList.add('gone');
        await Promise.all([c.anim(a, [{ opacity: 1 }, { opacity: 0.32 }], 450), c.anim(b, [{ opacity: 1 }, { opacity: 0.32 }], 450)]);
      }
    },
    s3: (c) => Promise.all(tt.slice(0, 3).map((t, i) => { t.classList.add('keep'); return c.anim(t, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], 380, { delay: i * 120 }); }))
  };
}
function lawPowProduct(stage, W) {
  const y = 176, gw = 2 * SLOT + 40, gx = [-1, 0, 1].map((k) => W / 2 + k * (gw + 26));
  const six = [], five = [], par = [], dots = [];
  gx.forEach((x, k) => {
    const p = add(stage, h('div', 'lw-par'), x - gw / 2, y - 42); p.style.width = gw + 'px'; p.style.height = '84px'; par.push(p);
    six.push(tile(stage, '6', 'a', x - SLOT / 2, y)); five.push(tile(stage, '5', 'b', x + SLOT / 2, y));
    if (k) { const d = add(stage, h('div', 'lw-x', '·'), x - gw / 2 - 13, y); dots.push(d); }
  });
  const inner = gx.map((x) => { const d = add(stage, h('div', 'lw-x', '·'), x, y); return d; });
  hide(...six, ...five, ...par, ...dots, ...inner);
  const S6 = xsAt(3, W / 2 - 150), S5 = xsAt(3, W / 2 + 150), xs6 = timesSigns(stage, S6, y), xs5 = timesSigns(stage, S5, y);
  const mid = add(stage, h('div', 'lw-x big', '·'), W / 2, y); hide(mid);
  const l6 = add(stage, h('div', 'lw-under a', K('6^{3}')), W / 2 - 150, y + 52), l5 = add(stage, h('div', 'lw-under b', K('5^{3}')), W / 2 + 150, y + 52);
  [l6, l5].forEach((e) => { e.style.translate = '-50% 0'; }); hide(l6, l5);
  return {
    caps: [`${tex('(6\\cdot5)^{3}')} means <b>three copies</b> of ${tex('(6\\cdot5)')} multiplied together.`,
      'Multiplying can be done in <b>any order</b>, so gather the 6s together and the 5s together.',
      `Three 6s and three 5s: ${tex('(6\\cdot5)^{3}=6^{3}\\cdot5^{3}')}. The exponent reached <b>every</b> factor inside the brackets.`,
      `With variables: ${tex('(cd)^{3}=c^{3}d^{3}')}.`,
      '<b>Power of a Product Law:</b> give the exponent to <b>each factor</b> inside the brackets.'],
    s1: (c) => Promise.all([...par.map((p, i) => c.fadeIn(p, 300, { delay: i * 200 })), ...dots.map((d, i) => c.fadeIn(d, 300, { delay: 200 + i * 200 })), ...inner.map((d, i) => c.fadeIn(d, 300, { delay: 100 + i * 200 })), ...six.map((t, i) => c.pop(t, 300, { delay: i * 200 })), ...five.map((t, i) => c.pop(t, 300, { delay: 80 + i * 200 }))]),
    s2: (c) => Promise.all([...par, ...dots, ...inner].map((e) => c.anim(e, [{ opacity: 1 }, { opacity: 0 }], 300)).concat(six.map((t, i) => mv(c, t, S6[i], y, 750, 150 + i * 80)), five.map((t, i) => mv(c, t, S5[i], y, 750, 200 + i * 80)), [...xs6, ...xs5].map((e) => c.fadeIn(e, 300, { delay: 950 })), [c.fadeIn(mid, 300, { delay: 950 })])),
    s3: (c) => Promise.all([c.fadeIn(l6, 350), c.fadeIn(l5, 350, { delay: 150 })])
  };
}
function lawPowQuotient(stage, W) {
  const yT = 116, yB = 200, yM = (yT + yB) / 2, gx = [-1, 0, 1].map((k) => W / 2 + k * 150);
  const tops = [], bots = [], bars = [], dots = [];
  gx.forEach((x, k) => {
    tops.push(tile(stage, '6', 'a', x, yT)); bots.push(tile(stage, '5', 'b', x, yB));
    const b = add(stage, h('div', 'lw-bar'), x - 34, yM - 2); b.style.width = '68px'; bars.push(b);
    if (k) dots.push(add(stage, h('div', 'lw-x', '·'), x - 75, yM));
  });
  hide(...tops, ...bots, ...bars, ...dots);
  const F = xsAt(3, W / 2), xT = timesSigns(stage, F, yT), xB = timesSigns(stage, F, yB);
  const big = add(stage, h('div', 'lw-bar'), F[0] - SLOT / 2, yM - 2); big.style.width = 3 * SLOT + 'px'; hide(big);
  const l6 = add(stage, h('div', 'lw-side a', K('6^{3}')), F[2] + SLOT / 2 + 20, yT), l5 = add(stage, h('div', 'lw-side b', K('5^{3}')), F[2] + SLOT / 2 + 20, yB);
  [l6, l5].forEach((e) => { e.style.translate = '0 -50%'; }); hide(l6, l5);
  return {
    caps: [`${tex('\\left(\\frac{6}{5}\\right)^{3}')} means three copies of ${tex('\\frac{6}{5}')} multiplied together.`,
      'To multiply fractions, multiply the tops together and the bottoms together.',
      `Three 6s on top, three 5s on the bottom: ${tex('\\left(\\frac{6}{5}\\right)^{3}=\\frac{6^{3}}{5^{3}}')}.`,
      `With variables: ${tex('\\left(\\frac{c}{d}\\right)^{3}=\\frac{c^{3}}{d^{3}}')}.`,
      '<b>Power of a Quotient Law:</b> the exponent goes to the top <b>and</b> the bottom. (The bottom can’t be 0.)'],
    s1: (c) => Promise.all([...bars.map((b, i) => c.fadeIn(b, 300, { delay: i * 200 })), ...dots.map((d, i) => c.fadeIn(d, 300, { delay: 200 + i * 200 })), ...tops.map((t, i) => c.pop(t, 300, { delay: i * 200 })), ...bots.map((t, i) => c.pop(t, 300, { delay: 80 + i * 200 }))]),
    s2: (c) => Promise.all([...bars, ...dots].map((e) => c.anim(e, [{ opacity: 1 }, { opacity: 0 }], 300)).concat(tops.map((t, i) => mv(c, t, F[i], yT, 700, 150 + i * 80)), bots.map((t, i) => mv(c, t, F[i], yB, 700, 200 + i * 80)), [c.anim(big, [{ opacity: 0, transform: 'scaleX(.2)' }, { opacity: 1, transform: 'none' }], 400, { delay: 800 })], [...xT, ...xB].map((e) => c.fadeIn(e, 300, { delay: 900 })))),
    s3: (c) => Promise.all([c.fadeIn(l6, 350, { from: 'translateX(-8px)' }), c.fadeIn(l5, 350, { delay: 150, from: 'translateX(-8px)' })])
  };
}
function lawPowPower(stage, W) {
  const y = 176, A = xsAt(3, W / 2 - 160), B = xsAt(3, W / 2 + 160);
  const ta = A.map((x) => tile(stage, '6', 'a', x, y)), tb = B.map((x) => tile(stage, '6', 'b', x, y)), all = [...ta, ...tb];
  hide(...all);
  const ba = groupBox(stage, A, y, '6^{3}', 'a'), bb = groupBox(stage, B, y, '6^{3}', 'b');
  const G = xsAt(3, W / 2), r1 = 140, r2 = 226;
  const bs = badges(stage, all);
  const rl1 = add(stage, h('div', 'lw-side a', 'copy 1'), G[0] - SLOT / 2 - 22, r1), rl2 = add(stage, h('div', 'lw-side b', 'copy 2'), G[0] - SLOT / 2 - 22, r2);
  [rl1, rl2].forEach((e) => { e.style.translate = '-100% -50%'; }); hide(rl1, rl2);
  return {
    caps: [`${tex('\\left(6^{3}\\right)^{2}')} means two copies of ${tex('6^{3}')}: ${tex('\\left(6^{3}\\right)\\left(6^{3}\\right)')}.`,
      'Stack the copies: <b>2 groups</b> of <b>3 factors</b> each.',
      `2 × 3 = <b>6</b> factors of 6. So ${tex('\\left(6^{3}\\right)^{2}=6^{6}')}.`,
      `With a variable: ${tex('\\left(c^{3}\\right)^{2}=c^{6}')}.`,
      '<b>Power of a Power Law:</b> <b>multiply</b> the exponents. (The Product Law <b>adds</b> them. Don’t mix them up!)'],
    s1: (c) => Promise.all([...ba, ...bb].map((e) => c.fadeIn(e, 350)).concat(all.map((t, i) => c.pop(t, 320, { delay: 150 + i * 80 })))),
    s2: (c) => {
      const jobs = [...ba, ...bb].filter((_, i) => i % 2 === 1).map((e) => c.anim(e, [{ opacity: 1 }, { opacity: 0 }], 250));
      const moveBox = (b, yy) => { const x0 = G[0] - SLOT / 2 + 4; return mv(c, b, x0, yy - 42, 700, 100); };
      jobs.push(moveBox(ba[0], r1), moveBox(bb[0], r2));
      ta.forEach((t, i) => jobs.push(mv(c, t, G[i], r1, 700, 100)));
      tb.forEach((t, i) => jobs.push(mv(c, t, G[i], r2, 700, 160)));
      jobs.push(c.fadeIn(rl1, 300, { delay: 800 }), c.fadeIn(rl2, 300, { delay: 850 }));
      return Promise.all(jobs);
    },
    s3: async (c) => { placeBadges(bs); for (const b of bs) await c.pop(b, 200); }
  };
}

/* ================= 5. Which law? ================= */
const LAWCARDS = [['Product', 'a^{m}\\cdot a^{n}=a^{m+n}'], ['Quotient', '\\frac{a^{m}}{a^{n}}=a^{m-n}'], ['Power of a Product', '(ab)^{m}=a^{m}b^{m}'], ['Power of a Quotient', '\\left(\\frac{a}{b}\\right)^{n}=\\frac{a^{n}}{b^{n}}'], ['Power of a Power', '\\left(a^{m}\\right)^{n}=a^{mn}']];
const WHICH = [
  { v: 'w1', ex: '2^{3}\\cdot2^{4}', law: 0, clue: 'same base · multiplied', cap: 'Same base (2), <b>multiplied</b>: the <b>Product Law</b>. Add the exponents.', lines: [['=2^{3+4}', 'Keep the base 2 and add the exponents: 3 + 4.'], ['=2^{7}', '3 + 4 = 7.'], ['=128', `Evaluate: ${tex('2^{7}=128')}.`]] },
  { v: 'w2', ex: '\\left(x^{5}\\right)^{2}', law: 4, clue: 'a power, raised to a power', cap: 'A power in brackets, raised to another power: the <b>Power of a Power Law</b>. Multiply the exponents.', lines: [['=x^{5\\times2}', 'Keep the base x and multiply: 5 × 2.'], ['=x^{10}', 'Two groups of five x’s make ten.']] },
  { v: 'w3', ex: '(3y)^{2}', law: 2, clue: 'a product in brackets', cap: 'A <b>product</b> (3 times y) in brackets, raised to a power: the <b>Power of a Product Law</b>.', lines: [['=3^{2}y^{2}', 'Both the 3 and the y are inside the fence, so each gets the exponent 2.'], ['=9y^{2}', `${tex('3^{2}=9')}.`]] },
  { v: 'e5a', ex: '4^{3}\\cdot4^{2}', law: 0, clue: 'same base · multiplied', cap: 'Same base (4), <b>multiplied</b>: the <b>Product Law</b>.', lines: [['=4^{3+2}', 'Keep the base 4 and add the exponents.'], ['=4^{5}', '3 + 2 = 5.'], ['=1024', `Evaluate: ${tex('4^{5}=1024')}.`]] },
  { v: 'e5b', ex: '\\dfrac{(-3)^{6}}{(-3)^{2}}', law: 1, clue: 'same base · divided', cap: 'Same base, <b>−3</b>, <b>divided</b>: the <b>Quotient Law</b>. The brackets are part of the base.', lines: [['=(-3)^{6-2}', 'Keep the base −3 (brackets and all) and subtract: 6 − 2.'], ['=(-3)^{4}', '6 − 2 = 4.'], ['=81', `Four negative factors: positive. ${tex('(-3)^{4}=81')}.`]] },
  { v: 'e5c', ex: '\\left(7^{2}\\right)^{2}', law: 4, clue: 'a power, raised to a power', cap: 'A power raised to a power: the <b>Power of a Power Law</b>. Multiply the exponents.', lines: [['=7^{2\\times2}', 'Keep the base 7 and multiply: 2 × 2.'], ['=7^{4}', '2 × 2 = 4.'], ['=2401', `Evaluate: ${tex('7^{4}=2401')}.`]] },
  { v: 'e6a', ex: 'k^{5}\\cdot k^{3}', law: 0, clue: 'same base · multiplied', cap: 'Same base, k, <b>multiplied</b>: the <b>Product Law</b>.', lines: [['=k^{5+3}', 'Add the exponents.'], ['=k^{8}', '5 + 3 = 8.']] },
  { v: 'e6b', ex: 'm^{2}\\cdot m^{0}\\cdot m^{6}', law: 0, clue: 'same base · multiplied (×3)', cap: 'Three powers of m, <b>multiplied</b>: the <b>Product Law</b> works for any number of factors.', lines: [['=m^{2+0+6}', `Add all three exponents. ${tex('m^{0}=1')}, so it adds 0.`], ['=m^{8}', '2 + 0 + 6 = 8.']] },
  { v: 'e6c', ex: '\\dfrac{n^{9}}{n^{4}}', law: 1, clue: 'same base · divided', cap: 'Same base, n, <b>divided</b>: the <b>Quotient Law</b>.', lines: [['=n^{9-4}', 'Subtract: top exponent minus bottom exponent.'], ['=n^{5}', 'Four n’s cancel, five are left.']] },
  { v: 'e6d', ex: '\\left(p^{4}\\right)^{3}', law: 4, clue: 'a power, raised to a power', cap: 'A power raised to a power: the <b>Power of a Power Law</b>.', lines: [['=p^{4\\times3}', 'Multiply the exponents.'], ['=p^{12}', 'Three groups of four p’s make twelve.']] },
  { v: 'e6e', ex: '(2r)^{4}', law: 2, clue: 'a product in brackets', cap: 'A product, 2 times r, in brackets: the <b>Power of a Product Law</b>.', lines: [['=2^{4}r^{4}', 'The 2 and the r are both inside the fence.'], ['=16r^{4}', `${tex('2^{4}=16')}.`]] },
  { v: 'e6f', ex: '\\left(\\dfrac{s}{t}\\right)^{5}', law: 3, clue: 'a quotient in brackets', cap: 'A quotient in brackets: the <b>Power of a Quotient Law</b>.', lines: [['=\\dfrac{s^{5}}{t^{5}}', 'The top and the bottom each get the exponent 5.']] },
  { v: 'e6g', ex: '(-5uv)^{3}', law: 2, clue: 'a product in brackets', cap: 'A product, −5 times u times v, in brackets: the <b>Power of a Product Law</b>.', lines: [['=(-5)^{3}u^{3}v^{3}', 'Every factor gets the exponent, the −5 included.'], ['=-125u^{3}v^{3}', `${tex('(-5)^{3}=-125')}: odd exponent, negative answer.`]] },
  { v: 'e6h', ex: '\\left(\\dfrac{w}{4}\\right)^{2}', law: 3, clue: 'a quotient in brackets', cap: 'A quotient in brackets: the <b>Power of a Quotient Law</b>.', lines: [['=\\dfrac{w^{2}}{4^{2}}', 'Top and bottom each get the exponent 2.'], ['=\\dfrac{w^{2}}{16}', `${tex('4^{2}=16')}.`]] }
];
const wLabel = (s) => tex(s.ex.replace(/\\dfrac/g, '\\tfrac'));
const which = {
  title: 'Spot the clue, then use the law',
  height: 420,
  choices: WHICH.flatMap((s) => (s.v === 'e5a' ? [{ sep: 'Example 5 check:' }] : s.v === 'e6a' ? [{ sep: 'Example 6 check:' }] : []).concat([{ v: s.v, label: wLabel(s) }])),
  intro: (v) => `Which exponent law fits ${wLabel(WHICH.find((s) => s.v === v))}? Look at how the powers are put together.`,
  make(stage, v, ex) {
    const W = ex.W, s = WHICH.find((x) => x.v === v), CW = 316, cx0 = W - CW - 18, tall = /dfrac/.test(s.ex);
    const cards = LAWCARDS.map(([n, f], i) => { const e = add(stage, h('div', 'wl-card', `<div class="wl-n">${n}</div><div class="wl-f">${K(f)}</div>`), cx0, 14 + i * 79); e.style.width = CW + 'px'; return e; });
    const e0 = add(stage, h('div', 'wl-expr', K(s.ex)), 36, tall ? 14 : 26);
    const clue = add(stage, h('div', 'p1-tag amber wl-clue', s.clue), 0, 0); clue.style.translate = '0 -50%'; hide(clue);
    const fl = s.lines.some((l) => /dfrac/.test(l[0])), lh = fl ? 96 : 70, ly = tall ? 150 : 120;
    const rows = s.lines.map(([src], i) => { const e = add(stage, h('div', 'wl-line' + (fl ? ' tall' : ''), K(src)), 36, ly + i * lh); hide(e); return e; });
    return [{
      cap: s.cap,
      run: (c) => { const r = rel(stage, e0); at(clue, r.x + r.w + 26, r.y + r.h / 2); cards.forEach((e, i) => e.classList.toggle(i === s.law ? 'on' : 'off', true)); return Promise.all([c.fadeIn(clue, 350), c.anim(cards[s.law], [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], 450)]); }
    }].concat(s.lines.map(([, cap], i) => ({ cap, run: (c) => c.fadeIn(rows[i], 400, { from: 'translateX(-12px)' }) })));
  }
};

/* ================= figures: 4¹, 4², 4³ ================= */
function mountFigures() {
  const host = document.getElementById('fig-row'); if (!host) return;
  const s = 30;
  const fig = (svg, capT, say) => { const d = h('div', 'fig'); d.appendChild(svg); d.appendChild(h('div', 'fig-cap', `${K(capT)}<em class="fig-say">${say}</em>`)); host.appendChild(d); };
  // 4¹: a line of four
  const w1 = svgEl('svg', { width: 4 * s + 30, height: 4 * s + 20, viewBox: `-15 -10 ${4 * s + 30} ${4 * s + 20}` });
  for (let i = 0; i < 4; i++) w1.appendChild(svgEl('rect', { x: i * s, y: 1.5 * s, width: s, height: s, class: 'fg-sq' }));
  fig(w1, '4^{1}=4', 'four to the first');
  // 4²: a square
  const w2 = svgEl('svg', { width: 4 * s + 30, height: 4 * s + 20, viewBox: `-15 -10 ${4 * s + 30} ${4 * s + 20}` });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) w2.appendChild(svgEl('rect', { x: i * s, y: j * s, width: s, height: s, class: 'fg-sq' }));
  fig(w2, '4\\times4=4^{2}=16', 'four <b>squared</b>');
  // 4³: a cube
  const dx = 0.5 * s, dy = 0.35 * s, CW = 4 * s + 4 * dx, CH = 4 * s + 4 * dy;
  const w3 = svgEl('svg', { width: CW + 30, height: CH + 20, viewBox: `-15 ${-10 - 4 * dy} ${CW + 30} ${CH + 20}` });
  const ln = (x1, y1, x2, y2) => w3.appendChild(svgEl('line', { x1, y1, x2, y2, class: 'fg-l' }));
  const Y = (y) => 4 * s - y; // y up
  w3.appendChild(svgEl('polygon', { points: `0,${Y(0)} ${4 * s},${Y(0)} ${4 * s},${Y(4 * s)} 0,${Y(4 * s)}`, class: 'fg-f1' }));
  w3.appendChild(svgEl('polygon', { points: `0,${Y(4 * s)} ${4 * dx},${Y(4 * s + 4 * dy)} ${4 * s + 4 * dx},${Y(4 * s + 4 * dy)} ${4 * s},${Y(4 * s)}`, class: 'fg-f2' }));
  w3.appendChild(svgEl('polygon', { points: `${4 * s},${Y(0)} ${4 * s + 4 * dx},${Y(4 * dy)} ${4 * s + 4 * dx},${Y(4 * s + 4 * dy)} ${4 * s},${Y(4 * s)}`, class: 'fg-f3' }));
  for (let i = 0; i <= 4; i++) {
    ln(i * s, Y(0), i * s, Y(4 * s)); ln(0, Y(i * s), 4 * s, Y(i * s)); // front grid
    ln(i * s, Y(4 * s), i * s + 4 * dx, Y(4 * s + 4 * dy)); ln(i * dx, Y(4 * s + i * dy), 4 * s + i * dx, Y(4 * s + i * dy)); // top
    ln(4 * s, Y(i * s), 4 * s + 4 * dx, Y(i * s + 4 * dy)); ln(4 * s + i * dx, Y(i * dy), 4 * s + i * dx, Y(4 * s + i * dy)); // side
  }
  fig(w3, '4\\times4\\times4=4^{3}=64', 'four <b>cubed</b>');
}

/* ================= warm-up: how long to crack it? ================= */
const PH = {
  pin4: { kind: 'pin', n: 4, per: 10, title: 'Enter PIN', val: 1e4, time: '≈ 2.8 hours' },
  pin6: { kind: 'pin', n: 6, per: 10, title: 'Enter PIN', val: 1e6, time: '≈ 11.6 days' },
  pw: { kind: 'pw', n: 6, per: 26, title: 'Password', val: Math.pow(26, 6), time: '≈ 9.8 years' }
};
function mountPhones() {
  const host = document.getElementById('phones'); if (!host) return;
  host.querySelectorAll('[data-ph]').forEach((btn) => {
    const P0 = PH[btn.dataset.ph], col = btn.closest('.ph-col'), res = col.querySelector('.ph-res');
    let inner = `<span class="ph-notch"></span><span class="ph-screen"><span class="ph-title">${P0.title}</span>`;
    if (P0.kind === 'pin') {
      inner += `<span class="ph-slots">${'<i></i>'.repeat(P0.n)}</span><span class="ph-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => `<u>${k}</u>`).join('')}<u class="z">0</u></span>`;
    } else {
      inner += `<span class="ph-field"><span class="ph-slots pw">${'<i></i>'.repeat(P0.n)}</span></span><span class="ph-kb">${['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map((r) => `<span>${r.split('').map((l) => `<u>${l}</u>`).join('')}</span>`).join('')}<span><u class="sp">space</u></span></span>`;
    }
    btn.innerHTML = inner + '</span><span class="ph-home"></span>';
    const slots = [...btn.querySelectorAll('.ph-slots i')];
    let gen = 0, on = false;
    const reset = () => { gen++; on = false; btn.classList.remove('on'); slots.forEach((s) => { s.textContent = ''; s.classList.remove('lit'); }); res.classList.remove('show'); res.innerHTML = ''; };
    const run = async () => {
      const g = ++gen; on = true; btn.classList.add('on');
      for (const s of slots) { if (g !== gen) return; s.textContent = P0.per; s.classList.add('lit'); s.animate([{ transform: 'scale(1.6)' }, { transform: 'scale(1)' }], 300); await new Promise((r) => setTimeout(r, 260)); }
      if (g !== gen) return;
      const prod = Array(P0.n).fill(P0.per).join('\\times');
      res.innerHTML = `<div class="ph-prod">${K(prod)}</div><div class="ph-pow">${K(`=${P0.per}^{${P0.n}}=${T(P0.val)}`)}</div><div class="ph-time"><b>${P0.time}</b> to try them all<br>at 1 guess per second</div>`;
      res.classList.add('show');
    };
    btn.addEventListener('click', () => (on ? reset() : run()));
    btn._go = () => { if (!on) run(); };
  });
}
function mountCrackPoll() {
  const bars = document.getElementById('crack-bars'); if (!bars) return;
  const data = [['A', '10^{8}', 1e8, '≈ 3.2 years'], ['B', '26^{6}', Math.pow(26, 6), '≈ 9.8 years'], ['C', '62^{4}', Math.pow(62, 4), '≈ 171 days']], max = Math.pow(26, 6);
  bars.innerHTML = data.map(([l, p, v, t]) => `<div class="cb-row${l === 'B' ? ' win' : ''}"><div class="cb-l"><b>${l}</b> ${K(p)}</div><div class="cb-track"><div class="cb-bar" data-w="${(100 * v / max).toFixed(1)}"></div></div><div class="cb-v">${fmt(v)}<small>${t}</small></div></div>`).join('');
  const poll = document.getElementById('crack-poll');
  poll.querySelector('[data-poll]').addEventListener('click', () => {
    const on = poll.classList.toggle('revealed');
    bars.querySelectorAll('.cb-bar').forEach((b, i) => {
      if (!on) { b.style.width = '0'; return; }
      b.animate([{ width: '0%' }, { width: b.dataset.w + '%' }], { duration: 900, delay: 200 + i * 250, easing: 'cubic-bezier(.25,.75,.3,1)', fill: 'backwards' });
      b.style.width = b.dataset.w + '%';
    });
  });
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => {
    const on = b.closest('.wq').classList.toggle('shown');
    const ph = b.dataset.phGo && document.querySelector(`[data-ph="${b.dataset.phGo}"]`);
    if (on && ph && ph._go) ph._go();
  }));
}

/* ================= tap-to-fill blanks in LaTeX ================= */
function replaceBlanks(src, fn) {
  let out = '', i = 0;
  while (i < src.length) {
    const j = src.indexOf('\\blank{', i); if (j < 0) { out += src.slice(i); break; }
    out += src.slice(i, j); let d = 1, k = j + 7;
    for (; k < src.length && d; k++) { if (src[k] === '{') d++; else if (src[k] === '}') d--; }
    out += fn(src.slice(j + 7, k - 1)); i = k;
  }
  return out;
}
function mountTexBlanks() {
  document.querySelectorAll('[data-tfill]').forEach((el) => {
    const src = el.dataset.tfill, n = (src.match(/\\blank\{/g) || []).length, state = Array(n).fill(false);
    const render = () => {
      let i = 0;
      el.innerHTML = K(replaceBlanks(src, (a) => { const k = i++; return `\\htmlData{tap=1,b=${k}}{\\,${state[k] ? `\\textcolor{#c93a33}{\\mathbf{${a}}}` : `\\phantom{\\mathbf{${a}}}`}\\,}`; }), true);
      el.querySelectorAll('[data-b]').forEach((b) => { b.setAttribute('role', 'button'); b.classList.toggle('filled', state[+b.dataset.b]); });
    };
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-b]'); if (!b) return; state[+b.dataset.b] = !state[+b.dataset.b]; render(); });
    el._fill = () => { state.fill(true); render(); };
    render();
  });
  document.querySelectorAll('[data-fillall]').forEach((btn) => btn.addEventListener('click', () => {
    const scope = btn.closest('[data-fillscope]') || btn.closest('.card');
    scope.querySelectorAll('[data-tfill]').forEach((t) => t._fill && t._fill());
  }));
}

/* ================= laws table: tap to reveal ================= */
function mountLawTable() {
  const tbl = document.getElementById('laws-tbl'); if (!tbl) return;
  tbl.querySelectorAll('.lt-law').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
  const all = document.querySelector('[data-lawall]');
  if (all) all.addEventListener('click', () => tbl.querySelectorAll('.lt-law').forEach((b, i) => setTimeout(() => b.classList.add('on'), i * 150)));
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { anatomy, fence, fenceNeg, fenceZero, signs, zero, laws, which };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountFigures(); mountPhones(); mountCrackPoll(); mountTexBlanks(); mountLawTable(); mountExplainers();
