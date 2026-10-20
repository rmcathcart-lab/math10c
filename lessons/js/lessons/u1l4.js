/* Math 10C · Unit 1 · Lesson 4 — Classifying the Real Number System: the explainers and widgets on this page. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const absTex = (s) => String(s).replace(/\|([^|]*)\|/g, '\\lvert $1 \\rvert');
const T = (s) => tex(absTex(s));
const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const SVGNS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs = {}, parent) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const svgLayer = (stage, cls = '') => { const s = sv('svg', { class: 'l4-svg ' + cls }); stage.appendChild(s); return s; };
const neg = (s) => String(s).replace(/^-/, '−');
const fmtS = (v) => (v < 0 ? '−' + fmt(-v) : fmt(v));
const tenth = (x) => neg((Math.round(x * 10) / 10).toFixed(1));
const dots = (x, d) => (x < 0 ? '−' : '') + (Math.floor(Math.abs(x) * 10 ** d) / 10 ** d).toFixed(d) + '…';
const hide = (...els) => els.forEach((e) => (e.style.opacity = 0));
const draw = (c, path, ms = 600, o = {}) => { // stroke-draw an svg path
  const len = (path.getTotalLength && path.getTotalLength()) || 600;
  path.style.strokeDasharray = len; path.style.strokeDashoffset = len; path.style.opacity = 1;
  return c.anim(path, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], ms, o).then(() => { path.style.strokeDasharray = ''; path.style.strokeDashoffset = ''; });
};
const showAll = (c, els, ms = 350) => Promise.all(els.map((e) => c.fadeIn(e, ms)));

/* A number line: ticks + labels. o = { x0, x1, y, lo, hi, ticks: [{ v, lab, cls, dy, small }] } */
function nline(stage, svg, o) {
  const { x0, x1, y, lo, hi } = o;
  const X = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
  const g = sv('g', { class: 'nl' + (o.cls ? ' ' + o.cls : '') }, svg);
  sv('line', { x1: x0 - 20, x2: x1 + 20, y1: y, y2: y, class: 'nl-ax' }, g);
  sv('path', { d: `M ${x1 + 30} ${y} l -12 -7 v 14 z`, class: 'nl-hd' }, g);
  sv('path', { d: `M ${x0 - 30} ${y} l 12 -7 v 14 z`, class: 'nl-hd' }, g);
  const labs = [];
  (o.ticks || []).forEach((t) => {
    const s = t.small ? 5 : 9;
    sv('line', { x1: X(t.v), x2: X(t.v), y1: y - s, y2: y + s, class: 'nl-tk' + (t.small ? ' sm' : '') }, g);
    if (t.lab != null) labs.push(add(stage, h('div', 'nl-lab c' + (t.cls ? ' ' + t.cls : ''), t.lab), X(t.v), y + (t.dy || 24)));
  });
  return { X, g, labs, els: [g, ...labs] };
}

/* ====================== the set diagram (shared by "build" and "sorter") ====================== */
const SETS = {
  N: { sym: 'N', name: 'Natural numbers', def: 'N = \\{1, 2, 3, \\ldots\\}' },
  W: { sym: 'W', name: 'Whole numbers', def: 'W = \\{0, 1, 2, 3, \\ldots\\}' },
  I: { sym: 'I', name: 'Integers', def: 'I = \\{\\ldots, -2, -1, 0, 1, 2, \\ldots\\}' },
  Q: { sym: 'Q', name: 'Rational numbers', def: 'Q = \\left\\{\\dfrac{a}{b},\\ a, b \\in I,\\ b \\neq 0\\right\\}' },
  Qb: { sym: '\\overline{Q}', name: 'Irrational numbers', def: null },
  R: { sym: 'R', name: 'Real numbers', def: 'R = \\{Q \\text{ and } \\overline{Q}\\}' }
};
const INNER = { Q: 'I', I: 'W', W: 'N', N: null };
function setGeom(x, y, w, hh) {
  const E = { Q: [0.37, 0.55, 0.34, 0.43], I: [0.37, 0.59, 0.265, 0.33], W: [0.37, 0.63, 0.19, 0.235], N: [0.37, 0.665, 0.11, 0.14] };
  const g = { x, y, w, h: hh, div: x + 0.75 * w };
  for (const k in E) { const [cx, cy, rx, ry] = E[k]; g[k] = { cx: x + cx * w, cy: y + cy * hh, rx: rx * w, ry: ry * hh }; }
  g.ring = (outer, deg) => { // a point halfway across the band between an ellipse and the one inside it
    const t = (deg * Math.PI) / 180, o = g[outer], i = INNER[outer] && g[INNER[outer]];
    const po = [o.cx + o.rx * Math.cos(t), o.cy + o.ry * Math.sin(t)];
    if (!i) return [o.cx + o.rx * 0.45 * Math.cos(t), o.cy + o.ry * 0.45 * Math.sin(t)];
    const pi = [i.cx + i.rx * Math.cos(t), i.cy + i.ry * Math.sin(t)];
    return [(po[0] + pi[0]) / 2, (po[1] + pi[1]) / 2];
  };
  g.inN = (dx, dy) => [g.N.cx + dx * g.N.rx, g.N.cy + dy * g.N.ry];
  g.inQb = (fy) => [g.div + (g.x + g.w - g.div) / 2, g.y + fy * g.h];
  return g;
}
function drawSets(stage, g) {
  const svg = svgLayer(stage), parts = {};
  parts.R = [sv('rect', { x: g.x, y: g.y, width: g.w, height: g.h, rx: 16, class: 'st-r' }, svg)];
  parts.R.push(add(stage, h('div', 'st-lab r', `${T('R')}<span class="nm">Real numbers</span>`), g.x + 14, g.y + 8));
  parts.Qb = [sv('line', { x1: g.div, x2: g.div, y1: g.y, y2: g.y + g.h, class: 'st-div' }, svg)];
  const [qx, qy] = g.inQb(0.1);
  parts.Qb.push(add(stage, h('div', 'st-lab qb c', `${T('\\overline{Q}')}<span class="nm">Irrational</span>`), qx, qy + 6));
  ['Q', 'I', 'W', 'N'].forEach((k) => {
    const e = g[k], el = sv('ellipse', { cx: e.cx, cy: e.cy, rx: e.rx, ry: e.ry, class: 'st-e ' + k.toLowerCase() }, svg);
    const [lx, ly] = k === 'N' ? [e.cx, e.cy - e.ry * 0.58] : g.ring(k, -90);
    parts[k] = [el, add(stage, h('div', 'st-lab c ' + k.toLowerCase(), T(k)), lx, ly)];
  });
  return { svg, parts };
}
const big = (t) => t.replace(/\\tfrac/g, '\\dfrac');
const chipAt = (stage, t, [x, y], cls = '') => add(stage, h('div', 'st-chip c ' + cls, T(big(t))), x, y);

/* ============ 1. Build the real number system ============ */
const BUILD = [
  { k: 'N', chips: [['1', 'n', -0.5, 0.12], ['2', 'n', 0, 0.12], ['3', 'n', 0.5, 0.12], ['47', 'n', 0, 0.6]],
    note: 'the <b>counting</b> numbers',
    cap: `<b>Natural numbers</b> ${T('N')}: the <b>counting</b> numbers 1, 2, 3, … They go right in the middle.` },
  { k: 'W', chips: [['0', 'W', -150]], note: 'the naturals <b>and 0</b>',
    cap: `<b>Whole numbers</b> ${T('W')}: the natural numbers <b>and 0</b>. W wraps around N, so every natural number is also a whole number.` },
  { k: 'I', chips: [['-1', 'I', -150], ['-5', 'I', 180], ['-12', 'I', -32]], note: 'whole numbers and their <b>opposites</b>',
    cap: `<b>Integers</b> ${T('I')}: the whole numbers and their <b>opposites</b> −1, −2, −3, … Every whole number is an integer.` },
  { k: 'Q', chips: [['\\tfrac{5}{9}', 'Q', -152], ['0.25', 'Q', 180], ['-\\tfrac{3}{4}', 'Q', -30], ['0.\\overline{3}', 'Q', 3]],
    note: 'fractions, and decimals that <b>terminate</b> or <b>repeat</b>',
    cap: `<b>Rational numbers</b> ${T('Q')}: any number that can be written as ${T('\\tfrac{a}{b}')} with integers <i>a</i> and <i>b</i> (b ≠ 0). Every integer is rational too: ${T('-5 = \\tfrac{-5}{1}')}.` },
  { k: 'Qb', chips: [['\\pi', 'qb', 0.32], ['\\sqrt{2}', 'qb', 0.47], ['\\sqrt{11}', 'qb', 0.62], ['1.0100100\\ldots', 'qb', 0.78]],
    note: 'decimals that <b>never terminate</b> and <b>never repeat</b>',
    cap: `<b>Irrational numbers</b> ${T('\\overline{Q}')}: decimals that <b>never terminate and never repeat</b>. They sit <b>beside</b> ${T('Q')}, not inside it — no number is both.` },
  { k: 'R', chips: [], note: 'every point on the <b>number line</b>',
    cap: `<b>Real numbers</b> ${T('R')}: the rationals and the irrationals <b>together</b>. Every number on the number line lives somewhere in this rectangle.` }
];
const build = {
  title: 'Build the real number system, one set at a time',
  height: 480,
  intro: `Start with the numbers we learned first, the counting numbers, and keep adding new kinds of numbers. Each new set <b>wraps around</b> the one before.`,
  make(stage, v, ex) {
    const W = ex.W, H = 480, dw = Math.min(650, W * 0.66), g = setGeom(16, 16, dw, H - 32), { parts } = drawSets(stage, g);
    Object.values(parts).forEach((p) => hide(...p));
    const px = g.x + g.w + 18, pw = W - px - 14;
    const panel = add(stage, h('div', 'set-card'), px, g.y); panel.style.width = pw + 'px'; panel.style.height = g.h + 'px'; hide(panel);
    const pos = (ch) => (ch[1] === 'n' ? g.inN(ch[2], ch[3]) : ch[1] === 'qb' ? g.inQb(ch[2]) : g.ring(ch[1], ch[2]));
    const fill = (b) => {
      const s = SETS[b.k], def = b.k === 'Qb' ? `${T('\\overline{Q}')} = { non-terminating, non-repeating decimals }` : T(s.def);
      panel.className = 'set-card k-' + b.k.toLowerCase();
      panel.innerHTML = `<div class="sc-sym">${T(s.sym)}</div><div class="sc-name">${s.name}</div><div class="sc-def">${def}</div><div class="sc-note">${b.note}</div>`;
    };
    const steps = BUILD.map((b) => ({
      cap: b.cap,
      run: async (c) => {
        fill(b);
        const chips = b.chips.map((ch) => { const e = chipAt(stage, ch[0], pos(ch), b.k.toLowerCase()); e.style.opacity = 0; return e; });
        const [shape, lab] = parts[b.k];
        const jobs = [c.fadeIn(panel, 300)];
        if (b.k === 'R') jobs.push(c.anim(shape, [{ opacity: 0 }, { opacity: 1 }], 500), c.fadeIn(lab, 400, { delay: 200 }), c.anim(shape, [{ strokeWidth: 3 }, { strokeWidth: 8 }, { strokeWidth: 3 }], 900, { delay: 300 }));
        else if (b.k === 'Qb') jobs.push(draw(c, shape, 600), c.fadeIn(lab, 400, { delay: 300 }));
        else jobs.push(c.anim(shape, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], 600), c.fadeIn(lab, 400, { delay: 250 }));
        chips.forEach((e, i) => jobs.push(c.pop(e, 380, { delay: 450 + i * 160 })));
        await Promise.all(jobs);
      }
    }));
    steps.push({
      cap: `Each set sits <b>inside</b> the next: ${T('N')} inside ${T('W')} inside ${T('I')} inside ${T('Q')} inside ${T('R')}. A natural number like 3 belongs to <b>five sets at once</b>. ${T('\\overline{Q}')} sits beside ${T('Q')}, and both are inside ${T('R')}.`,
      run: async (c) => {
        panel.className = 'set-card k-all';
        panel.innerHTML = `<div class="sc-name">Nested sets</div><div class="sc-chain">${['N', 'W', 'I', 'Q', 'R'].map((k) => `<span class="k-${k.toLowerCase()}">${T(k)}</span>`).join('<i>inside</i>')}</div><div class="sc-note">${T('\\overline{Q}')} is beside ${T('Q')}: <b>no overlap</b>.</div>`;
        await c.fadeIn(panel, 300);
        for (const k of ['N', 'W', 'I', 'Q']) {
          const el = parts[k][0];
          el.classList.add('glow');
          await c.anim(el, [{ strokeWidth: 2.5 }, { strokeWidth: 7 }, { strokeWidth: 2.5 }], 420);
        }
        await c.anim(parts.R[0], [{ strokeWidth: 3 }, { strokeWidth: 8 }, { strokeWidth: 3 }], 420);
      }
    });
    return steps;
  }
};

/* ============ 1. Why fractions end or repeat: the remainders ============ */
function longDiv(a, b) {
  const q0 = Math.floor(a / b); let r = a % b;
  const steps = [{ kind: 'int', q: q0, r }], seen = { [r]: 0 }, digits = [];
  let rep = -1;
  while (r !== 0) {
    const num = r * 10, d = Math.floor(num / b), r2 = num % b;
    digits.push(d);
    const again = r2 !== 0 && r2 in seen;
    steps.push({ kind: 'dig', num, d, r: r2, again });
    if (again) { rep = seen[r2]; break; }
    seen[r2] = digits.length; r = r2;
  }
  return { q0, digits, steps, rep };
}
const decTex = (q0, digits, rep) => q0 + '.' + (rep < 0 ? digits.join('') : digits.slice(0, rep).join('') + '\\overline{' + digits.slice(rep).join('') + '}');
const remainders = {
  title: 'Why a fraction’s decimal must end or repeat',
  height: 440,
  choices: ['3/8', '5/9', '22/7', '2/11', '1/6'].map((f) => ({ v: f, label: T('\\dfrac{' + f.replace('/', '}{') + '}') })),
  intro: (v) => `Divide <b>${v.replace('/', ' ÷ ')}</b> by long division, one digit at a time. Keep an eye on the <b>remainder</b> left after each step.`,
  make(stage, v, ex) {
    const W = ex.W, [a, b] = v.split('/').map(Number), L = longDiv(a, b);
    const top = add(stage, h('div', 'rm-dec'), 28, 22);
    top.innerHTML = `<span class="rm-q">${a} ÷ ${b} =</span>`;
    const digs = h('span', 'rm-digs'); top.appendChild(digs);
    add(stage, h('div', 'rm-lab', 'Remainders that can happen when you divide by ' + b + ':'), 28, 96);
    const bw = Math.min(70, (W - 60) / b - 8), row = add(stage, h('div', 'rm-row'), 28, 128);
    const boxes = []; for (let r = 0; r < b; r++) { const e = h('div', 'rm-box' + (r === 0 ? ' zero' : ''), `<span>${r}</span><i></i>`); e.style.width = bw + 'px'; row.appendChild(e); boxes.push(e); }
    const work = add(stage, h('div', 'rm-work'), 28, 214);
    const foot = add(stage, h('div', 'rm-foot'), 28, 300); foot.style.width = (W - 56) + 'px'; hide(foot);
    let order = 0;
    const hit = async (c, r, again) => {
      const bx = boxes[r]; order++;
      if (!again) { bx.classList.add('hit'); bx.querySelector('i').textContent = order; }
      else bx.classList.add('again');
      await c.anim(bx, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], 380);
    };
    const digitEls = [];
    const steps = L.steps.map((s) => {
      if (s.kind === 'int') return {
        cap: `${a} ÷ ${b} = <b>${s.q}</b> remainder <b>${s.r}</b>. Write ${s.q} and a decimal point.`,
        run: async (c) => {
          const e = h('span', 'rm-d', s.q + '.'); digs.appendChild(e); work.innerHTML = `${a} ÷ ${b} = <b>${s.q}</b> <span class="rm-r">R ${s.r}</span>`;
          await Promise.all([c.pop(e, 380), c.fadeIn(work, 300), hit(c, s.r)]);
        }
      };
      return {
        cap: `Bring down a 0: <b>${s.num} ÷ ${b} = ${s.d}</b> remainder <b>${s.r}</b>.` + (s.r === 0 ? ' Remainder <b>0</b> — nothing left to divide!' : s.again ? ` Remainder <b>${s.r}</b> <b class="red">again</b> — we’ve been here before!` : ''),
        run: async (c) => {
          const e = h('span', 'rm-d', s.d); digs.appendChild(e); digitEls.push(e);
          work.innerHTML = `${s.num} ÷ ${b} = <b>${s.d}</b> <span class="rm-r">R ${s.r}</span>`;
          await Promise.all([c.pop(e, 380), c.fadeIn(work, 300), hit(c, s.r, s.again)]);
        }
      };
    });
    const dt = decTex(L.q0, L.digits, L.rep), repBlock = L.rep >= 0 ? L.digits.slice(L.rep).join('') : '';
    steps.push({
      cap: L.rep < 0 ? `The remainder reached <b>0</b>, so the division stops: ${T(`\\tfrac{${a}}{${b}} = ${dt}`)}. The decimal <b>terminates</b>.`
        : `Same remainder, same steps — the digits <b>${repBlock}</b> come round again and again forever: ${T(`\\tfrac{${a}}{${b}} = ${dt}`)}. The decimal <b>repeats</b>.`,
      run: async (c) => {
        if (L.rep >= 0) { digitEls.slice(L.rep).forEach((e) => e.classList.add('rep')); const more = h('span', 'rm-d ell', '…'); digs.appendChild(more); await c.fadeIn(more, 300); }
        work.innerHTML = `${T(`\\dfrac{${a}}{${b}} = ${dt}`)} <span class="rm-tag ${L.rep < 0 ? 'end' : 'rep'}">${L.rep < 0 ? 'terminates' : 'repeats'}</span>`;
        await c.fadeIn(work, 400);
      }
    });
    steps.push({
      cap: `Dividing by ${b}, the only possible remainders are <b>0 to ${b - 1}</b>. So within ${b} steps the division either <b>ends</b> (remainder 0) or a remainder <b>repeats</b>. That’s why every fraction is a terminating or repeating decimal: <b>rational</b>.`,
      run: async (c) => { row.classList.add('all'); await Promise.all(boxes.map((bx, i) => c.anim(bx, [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], 360, { delay: i * 50 }))); }
    });
    steps.push({
      cap: `Irrational numbers like ${T('\\sqrt{2}')} and ${T('\\pi')} can’t be written as a fraction, so no remainder machine makes them. Their digits <b>never end and never repeat</b>.`,
      run: async (c) => {
        foot.innerHTML = `<div>${T('\\sqrt{2} = 1.414\\,213\\,562\\,373\\,095\\,048\\,801\\,688\\ldots')}</div><div>${T('\\pi = 3.141\\,592\\,653\\,589\\,793\\,238\\,462\\,643\\ldots')}</div><span class="rm-tag irr">never end, never repeat</span>`;
        await c.fadeIn(foot, 450);
      }
    });
    return steps;
  }
};

/* ============ 1. The sorting machine ============ */
const SORT = {
  '-4': { t: '-4', v: -4 },
  '0': { t: '0', v: 0 },
  '7': { t: '7', v: 7 },
  '2/3': { t: '\\tfrac{2}{3}', v: 2 / 3, why: `${T('\\tfrac{2}{3}')} is already a ratio of two integers (it’s ${T('0.\\overline{6}')}, a repeating decimal).`, between: 'between 0 and 1' },
  '0.5r': { t: '0.\\overline{5}', v: 5 / 9, why: `${T('0.\\overline{5}')} <b>repeats</b>, so it’s a fraction in disguise: ${T('0.\\overline{5} = \\tfrac{5}{9}')}.`, between: 'between 0 and 1' },
  'r9': { t: '\\sqrt{9}', v: 3, simp: '\\sqrt{9} = 3', simpWhy: `${T('\\sqrt{9} = 3')} because 3 × 3 = 9.` },
  'r10': { t: '\\sqrt{10}', irr: `10 isn’t a perfect square (9 < 10 < 16), so ${T('\\sqrt{10} = 3.162\\,277\\,66\\ldots')} never ends and never repeats.` },
  'pi': { t: '\\pi', irr: `${T('\\pi = 3.141\\,592\\,65\\ldots')} never ends and never repeats.` },
  '-r16': { t: '-\\sqrt{16}', v: -4, simp: '-\\sqrt{16} = -4', simpWhy: `${T('\\sqrt{16} = 4')}, so ${T('-\\sqrt{16} = -4')}.` },
  'c-8': { t: '\\sqrt[3]{-8}', v: -2, simp: '\\sqrt[3]{-8} = -2', simpWhy: `${T('\\sqrt[3]{-8} = -2')} because (−2)(−2)(−2) = −8.` },
  '12': { t: '12', v: 12 },
  '5/9': { t: '\\tfrac{5}{9}', v: 5 / 9, why: `${T('\\tfrac{5}{9}')} is already a ratio of two integers.`, between: 'between 0 and 1' },
  'r11': { t: '\\sqrt{11}', irr: `11 isn’t a perfect square (9 < 11 < 16), so ${T('\\sqrt{11} = 3.316\\,624\\,79\\ldots')} never ends and never repeats.` },
  '-8': { t: '-8', v: -8 },
  '-12': { t: '-12', v: -12 }
};
const sorter = {
  title: 'The sorting machine: which sets is it in?',
  height: 480,
  choices: [...['-4', '0', '7', '2/3', '0.5r', 'r9', 'r10', 'pi', '-r16', 'c-8'].map((k) => ({ v: k, label: T(big(SORT[k].t)) })), { sep: 'Example 1 check:' }, ...['12', '5/9', 'r11', '-8', '-12'].map((k) => ({ v: k, label: T(big(SORT[k].t)) }))],
  intro: (k) => `Where does ${T(SORT[k].t)} belong? Test it from the <b>outside in</b>: real, rational, integer, whole, natural. It drops into the <b>innermost</b> set it belongs to.`,
  make(stage, k, ex) {
    const W = ex.W, H = 480, s = SORT[k], dw = Math.min(620, W * 0.63), g = setGeom(16, 16, dw, H - 32), { parts } = drawSets(stage, g);
    const rat = !s.irr, isInt = rat && Number.isInteger(s.v), whole = isInt && s.v >= 0, nat = whole && s.v > 0;
    const px = g.x + g.w + 18, pw = W - px - 14;
    const panel = add(stage, h('div', 'sort-card'), px, g.y); panel.style.width = pw + 'px'; panel.style.height = g.h + 'px';
    const hop = h('div', 'sort-hop', `<div class="sh-n">${T(big(s.t))}</div><div class="sh-s">${s.simp ? '&nbsp;' : ''}</div>`); panel.appendChild(hop);
    const ROWS = [['R', 'Real?'], ['Q', 'Rational?'], ['Qb', 'Irrational?'], ['I', 'Integer?'], ['W', 'Whole?'], ['N', 'Natural?']];
    const marks = {};
    ROWS.forEach(([key, q]) => { const r = h('div', 'sort-row k-' + key.toLowerCase(), `<span class="sr-k">${T(SETS[key].sym)}</span><span class="sr-q">${q}</span><span class="sr-m"></span>`); panel.appendChild(r); marks[key] = r; });
    const out = h('div', 'sort-out'); panel.appendChild(out);
    const chip = add(stage, h('div', 'st-chip big c', T(big(s.t))), px + pw / 2, g.y + 40); hide(chip);
    const posOf = { R: [g.x + 0.6 * g.w, g.y + 0.07 * g.h], Q: g.ring('Q', -60), I: g.ring('I', -60), W: g.ring('W', -60), N: g.inN(0, 0.2), Qb: g.inQb(0.5) };
    const move = (c, key) => c.anim(chip, [{ left: chip.style.left, top: chip.style.top }, { left: posOf[key][0] + 'px', top: posOf[key][1] + 'px' }], 650, { easing: 'cubic-bezier(.3,.1,.3,1.25)' });
    const mark = (c, key, ok) => { const r = marks[key], m = r.querySelector('.sr-m'); r.classList.add(ok ? 'yes' : 'no'); m.textContent = ok ? '✓' : '✗'; return c.pop(m, 320); };
    const flash = (c, key, ok) => { const el = parts[key][0]; el.classList.add(ok ? 'lit' : 'nope'); return c.anim(el, [{ strokeWidth: 2.5 }, { strokeWidth: 7 }, { strokeWidth: 2.5 }], 480); };
    const list = ['R'].concat(rat ? ['Q'] : ['Qb'], isInt ? ['I'] : [], whole ? ['W'] : [], nat ? ['N'] : []);
    const steps = [];
    if (s.simp) steps.push({
      cap: `<b>Simplify first.</b> ${s.simpWhy} A root sign doesn’t make a number irrational!`,
      run: async (c) => { hop.querySelector('.sh-s').innerHTML = T('= ' + String(s.v)); await c.pop(hop.querySelector('.sh-s'), 380); }
    });
    steps.push({
      cap: `Every number here has a place on the number line, so ${T(s.t)} is <b>real</b>: it’s somewhere inside ${T('R')}.`,
      run: async (c) => { chip.style.opacity = 1; await Promise.all([move(c, 'R'), mark(c, 'R', true), flash(c, 'R', true)]); }
    });
    const ratCap = s.irr ? `${s.irr} So it’s <b>irrational</b>: ${T('\\overline{Q}')}. An irrational number can’t be in ${T('Q')}, ${T('I')}, ${T('W')} or ${T('N')} — they’re all on the rational side.`
      : s.why ? `${s.why} So it’s <b>rational</b>: into ${T('Q')}.`
        : `${T(String(s.v) + ' = \\tfrac{' + s.v + '}{1}')}, a ratio of integers, so it’s <b>rational</b>: into ${T('Q')}.`;
    steps.push({
      cap: ratCap,
      run: async (c) => {
        if (s.irr) { await Promise.all([move(c, 'Qb'), mark(c, 'Q', false), mark(c, 'Qb', true)]); await Promise.all(['I', 'W', 'N'].map((q) => mark(c, q, false))); }
        else await Promise.all([move(c, 'Q'), mark(c, 'Q', true), mark(c, 'Qb', false), flash(c, 'Q', true)]);
      }
    });
    if (rat) steps.push({
      cap: isInt ? `No fraction or decimal part left over: ${T(String(s.v))} is an <b>integer</b>. Into ${T('I')}.`
        : `${T(s.t)} is ${s.between}, not a whole step on the number line: <b>not an integer</b>. So it can’t be whole or natural either — those sets are inside ${T('I')}.`,
      run: async (c) => {
        if (isInt) await Promise.all([move(c, 'I'), mark(c, 'I', true), flash(c, 'I', true)]);
        else await Promise.all([mark(c, 'I', false), c.shake(chip), flash(c, 'I', false), mark(c, 'W', false), mark(c, 'N', false)]);
      }
    });
    if (isInt) steps.push({
      cap: whole ? `It isn’t negative, so it’s a <b>whole number</b>. Into ${T('W')}.` : `${T(String(s.v))} is <b>negative</b>, so it’s <b>not a whole number</b> — and not natural either.`,
      run: async (c) => {
        if (whole) await Promise.all([move(c, 'W'), mark(c, 'W', true), flash(c, 'W', true)]);
        else await Promise.all([mark(c, 'W', false), c.shake(chip), flash(c, 'W', false), mark(c, 'N', false)]);
      }
    });
    if (whole) steps.push({
      cap: nat ? `It isn’t 0, so it’s a counting number: <b>natural</b>. Into ${T('N')}, the very middle.` : `It’s <b>0</b>, and we don’t start counting at 0: <b>not natural</b>.`,
      run: async (c) => {
        if (nat) await Promise.all([move(c, 'N'), mark(c, 'N', true), flash(c, 'N', true)]);
        else await Promise.all([mark(c, 'N', false), c.shake(chip), flash(c, 'N', false)]);
      }
    });
    const listTex = list.map((q) => SETS[q].sym).join(',\\ ');
    steps.push({
      cap: `${T(s.t)} belongs to <b>${list.length} set${list.length > 1 ? 's' : ''}</b>. Largest to smallest: <b>${T(listTex)}</b>.`,
      run: async (c) => { out.innerHTML = `<div class="so-h">Sets, largest to smallest</div>${T(listTex)}`; chip.classList.add('done'); await Promise.all([c.fadeIn(out, 400), c.pop(chip, 420)]); }
    });
    return steps;
  }
};

/* ============ 2. Square roots: tiles and a number line ============ */
function tileSteps(stage, n, ex) {
  const W = ex.W, a = Math.floor(Math.sqrt(n)), perfect = a * a === n, A = perfect ? a : a + 1, e = n - a * a;
  const ts = Math.min(26, 236 / A), ox = 46, oy = 34, sz = ts * 0.86;
  const tiles = [];
  const cols0 = Math.ceil(Math.sqrt(n)), s0 = Math.min(22, 250 / cols0);
  for (let i = 0; i < n; i++) {
    const t = h('div', 'tile'), r = Math.round((Math.sin(i * 12.9898) * 43758.5453 % 1) * 24 - 12);
    const x = ox + (i % cols0) * s0 * 1.08 + (i * 7 % 5) - 2, y = oy + Math.floor(i / cols0) * s0 * 1.08 + (i * 3 % 5) - 2;
    t.style.width = t.style.height = s0 * 0.86 + 'px'; t._t = `translate(${x}px, ${y}px) rotate(${r}deg)`; t.style.transform = t._t;
    stage.appendChild(t); tiles.push(t);
  }
  const target = (i) => { if (i < a * a) return [i % a, Math.floor(i / a)]; const j = i - a * a; return j < a ? [a, j] : [j - a, a]; };
  const svg = svgLayer(stage);
  const out = add(stage, h('div', 'tl-out'), ox - 3, oy - 3); out.style.width = out.style.height = A * ts + 3 + 'px'; hide(out);
  const dimT = add(stage, h('div', 'tl-dim c', a), ox + (a * ts) / 2, oy - 16), dimL = add(stage, h('div', 'tl-dim c', a), ox - 18, oy + (a * ts) / 2); hide(dimT, dimL);
  const dimO = add(stage, h('div', 'tl-dim amber c', A), ox + A * ts + 16, oy + (A * ts) / 2); hide(dimO);
  const info = add(stage, h('div', 'tl-info'), 370, 14); info.style.width = (W - 390) + 'px';
  const line = (t, cls = '') => { const e = h('div', 'tl-line ' + cls, T(t)); info.appendChild(e); return e; };
  // number line 1 (roots below, squares above)
  const lo = Math.max(0, a - 3), hi = Math.max(lo + 7, a + 2), y1 = 322, y2 = 404, X0 = 120;
  const ticks = []; for (let v = lo; v <= hi; v++) { ticks.push({ v, lab: String(v) }); }
  const NL1 = nline(stage, svg, { x0: X0, x1: W - 60, y: y1, lo, hi, ticks });
  const sqLabs = []; for (let v = lo; v <= hi; v++) sqLabs.push(add(stage, h('div', 'nl-lab sq c' + (v === a || (!perfect && v === a + 1) ? ' key' : ''), fmt(v * v)), NL1.X(v), y1 - 24));
  const sqTag = add(stage, h('div', 'nl-tag', 'squares'), 14, y1 - 34), rtTag = add(stage, h('div', 'nl-tag', 'roots'), 14, y1 + 14);
  const zTag = add(stage, h('div', 'nl-tag', 'zoom in'), 14, y2 - 30); hide(zTag);
  hide(...NL1.els, ...sqLabs, sqTag, rtTag);
  const est = a + e / (2 * a + 1), root = Math.sqrt(n), near = e <= 2 * a + 1 - e ? a : a + 1;
  const mk = add(stage, h('div', 'nl-mark c', `<b>${n}</b>`), NL1.X(est), y1 - 58); hide(mk);
  const mkLine = sv('line', { x1: NL1.X(est), x2: NL1.X(est), y1: y1 - 44, y2: y1, class: 'nl-mk' }, svg); hide(mkLine);
  // zoom line 2
  const zt = []; for (let i = 0; i <= 10; i++) zt.push({ v: a + i / 10, lab: i % 10 === 0 ? String(a + i / 10) : (a + i / 10).toFixed(1), small: i % 10 !== 0, cls: i % 10 ? 'sm' : '' });
  const NL2 = nline(stage, svg, { x0: X0, x1: W - 60, y: y2, lo: a, hi: a + 1, ticks: zt, cls: 'zoom' });
  const zl = sv('path', { d: `M ${NL1.X(a)} ${y1 + 36} L ${X0} ${y2 - 14} M ${NL1.X(a + 1)} ${y1 + 36} L ${W - 60} ${y2 - 14}`, class: 'nl-zoom' }, svg);
  hide(...NL2.els, zl);
  const estR = Math.round(est * 10) / 10;
  const eMk = add(stage, h('div', 'nl-est c', '≈ ' + estR.toFixed(1)), NL2.X(est), y2 - 34), eTri = add(stage, h('div', 'nl-tri c'), NL2.X(est), y2 - 12);
  const cDot = add(stage, h('div', 'nl-dot c'), NL2.X(root), y2), cLab = add(stage, h('div', 'nl-calc c', `${T('\\sqrt{' + n + '}')} = ${dots(root, 4)}`), Math.min(W - 110, Math.max(170, NL2.X(root))), y2 + 46);
  hide(eMk, eTri, cDot, cLab);
  async function arrange(c) {
    await Promise.all(tiles.map((t, i) => {
      const [cx, cy] = target(i), x = ox + cx * ts, y = oy + cy * ts, to = `translate(${x}px, ${y}px) rotate(0deg)`, from = t._t; t._t = to;
      if (i >= a * a) t.classList.add('xtra'); else t.classList.add('good');
      return c.anim(t, [{ transform: from, width: t.style.width, height: t.style.height }, { transform: to, width: sz + 'px', height: sz + 'px' }], 700, { delay: Math.min(i * 5, 300) });
    }));
  }
  const steps = [];
  if (perfect) {
    steps.push({
      cap: `<b>${n}</b> tiles make a perfect <b>${a} × ${a}</b> square, with nothing left over. The side is ${a}.`,
      run: async (c) => { const l1 = line(`${a}^2 = ${n}`); await Promise.all([arrange(c), c.fadeIn(dimT, 300, { delay: 600 }), c.fadeIn(dimL, 300, { delay: 600 }), c.fadeIn(l1, 300, { delay: 500 })]); }
    });
    steps.push({
      cap: `So ${T('\\sqrt{' + n + '} = ' + a)} <b>exactly</b>. ${n} is a <b>perfect square</b>, so its square root is <b>rational</b>.`,
      run: async (c) => { const l = line(`\\sqrt{${n}} = ${a}`, 'ok'); const k = NL1.labs[a - lo]; k.classList.add('hit'); await Promise.all([...NL1.els, ...sqLabs, sqTag, rtTag].map((x) => c.fadeIn(x, 400)).concat([c.fadeIn(l, 300), c.pop(k, 400, { delay: 400 })])); }
    });
    steps.push({
      cap: `(−${a}) × (−${a}) = ${n} too, so ${n} has <b>two</b> square roots, ${a} and −${a}. But the symbol ${T('\\sqrt{' + n + '}')} means only the <b>principal</b> (positive) one: ${a}.`,
      run: async (c) => { const l = line(`(-${a})^2 = ${n} \\text{ too, but } \\sqrt{${n}} = ${a}`, 'muted'); await c.fadeIn(l, 400); }
    });
    return steps;
  }
  steps.push({
    cap: `Arrange the <b>${n}</b> tiles into the biggest square you can: <b>${a} × ${a} = ${a * a}</b>, with <b>${e}</b> left over. So ${T('\\sqrt{' + n + '}')} is a bit more than ${a}.`,
    run: async (c) => { const l1 = line(`${a}^2 = ${a * a}`); await Promise.all([arrange(c), c.fadeIn(dimT, 300, { delay: 600 }), c.fadeIn(dimL, 300, { delay: 600 }), c.fadeIn(l1, 300, { delay: 500 })]); }
  });
  steps.push({
    cap: `A <b>${A} × ${A}</b> square needs <b>${A * A}</b> tiles — ${A * A - n} more than we have. So ${T('\\sqrt{' + n + '}')} is less than ${A}.`,
    run: async (c) => { const l = line(`${A}^2 = ${A * A}`, 'amber'); await Promise.all([c.fadeIn(out, 400), c.fadeIn(dimO, 400), c.fadeIn(l, 300)]); }
  });
  steps.push({
    cap: `${T('\\sqrt{' + n + '}')} is <b>between ${a} and ${A}</b>. ${n} is ${e} above ${a * a} but ${A * A - n} below ${A * A} — closer to <b>${near === a ? a * a : A * A}</b>.`,
    run: async (c) => {
      const l = line(`${a * a} \\lt ${n} \\lt ${A * A} \\;\\Rightarrow\\; ${a} \\lt \\sqrt{${n}} \\lt ${A}`);
      await Promise.all([...NL1.els, ...sqLabs, sqTag, rtTag].map((x) => c.fadeIn(x, 400)).concat([c.fadeIn(l, 300), c.fadeIn(mk, 400, { delay: 400 }), c.anim(mkLine, [{ opacity: 0 }, { opacity: 1 }], 400, { delay: 400 })]));
    }
  });
  steps.push({
    cap: `To the nearest whole number, ${T('\\sqrt{' + n + '}')} ≈ <b>${near}</b>.`,
    run: async (c) => { const l = line(`\\sqrt{${n}} \\approx ${near}`, 'big'); const k = NL1.labs[near - lo]; k.classList.add('hit'); await Promise.all([c.fadeIn(l, 300), c.pop(k, 400)]); }
  });
  steps.push({
    cap: `Zoom in between ${a} and ${A}. ${n} is <b>${e} of the ${2 * a + 1}</b> steps from ${a * a} to ${A * A}, about ${(e / (2 * a + 1)).toFixed(1)} of the way. So ${T('\\sqrt{' + n + '}')} ≈ <b>${estR.toFixed(1)}</b>.`,
    run: async (c) => {
      const l = line(`\\sqrt{${n}} \\approx ${a} + \\tfrac{${e}}{${2 * a + 1}} \\approx ${estR.toFixed(1)}`);
      await Promise.all([c.anim(zl, [{ opacity: 0 }, { opacity: 1 }], 400), c.fadeIn(zTag, 300), ...NL2.els.map((x) => c.fadeIn(x, 400, { delay: 200 })), c.fadeIn(l, 300), c.pop(eMk, 400, { delay: 500 }), c.pop(eTri, 400, { delay: 500 })]);
    }
  });
  const close = Math.abs(estR - Math.round(root * 10) / 10) < 0.01 ? 'Spot on' : 'Very close';
  steps.push({
    cap: `Calculator: ${T('\\sqrt{' + n + '} = ' + dots(root, 4).replace('…', '\\ldots'))} ≈ <b>${tenth(root)}</b>. ${close} — the estimate was reasonable. (${n} isn’t a perfect square, so this decimal never ends or repeats: ${T('\\sqrt{' + n + '}')} is <b>irrational</b>.)`,
    run: async (c) => { const l = line(`\\sqrt{${n}} = ${dots(root, 4).replace('…', '\\ldots')} \\approx ${tenth(root)}`, 'ok'); await Promise.all([c.fadeIn(l, 300), c.pop(cDot, 400), c.fadeIn(cLab, 400, { delay: 200 })]); }
  });
  return steps;
}
const tiles = {
  title: 'Square roots: tiles, then a number line',
  height: 480,
  choices: [{ v: 30, label: T('\\sqrt{30}') }, { v: 90, label: T('\\sqrt{90}') }, { v: 144, label: T('\\sqrt{144}') }, { sep: 'Example 2 check:' }, { v: 53, label: T('\\sqrt{53}') }, { v: 20, label: T('\\sqrt{20}') }, { v: 41, label: T('\\sqrt{41}') }, { v: 7, label: T('\\sqrt{7}') }, { v: 150, label: T('\\sqrt{150}') }],
  custom: [2, 225],
  intro: (n) => `Here are <b>${n}</b> square tiles. If they made a perfect square, how long would its side be? That side length is ${T('\\sqrt{' + n + '}')}.`,
  make: (stage, n, ex) => tileSteps(stage, n, ex)
};

/* ============ 2 & 3. Estimate a whole expression, then check ============ */
const sq = (t) => ({ t, kind: 'squares' }), cu = (t) => ({ t, kind: 'cubes' });
const EXPR = {
  d1: { e: '2\\sqrt{10} + \\sqrt{26}', steps: [
    { tex: '\\sqrt{10} \\approx 3', note: sq('9 \\lt 10 \\lt 16'), cap: `${T('\\sqrt{10}')}: 10 is between the perfect squares 9 and 16, much closer to <b>9</b>. So ${T('\\sqrt{10}')} ≈ <b>3</b>.` },
    { tex: '\\sqrt{26} \\approx 5', note: sq('25 \\lt 26 \\lt 36'), cap: `${T('\\sqrt{26}')}: 26 is just past <b>25</b>, so ${T('\\sqrt{26}')} ≈ <b>5</b>.` },
    { tex: '2(3) + 5 = 11', est: 1, cap: 'Put the estimates in and do the arithmetic: 2(3) + 5 = <b>11</b>.' },
    { tex: '6.324\\ldots + 5.099\\ldots \\approx 11.4', calc: 1, cap: `Calculator: ${T('2\\sqrt{10} + \\sqrt{26} = 11.42\\ldots')} ≈ <b>11.4</b>.` },
    { verdict: 'REASONABLE', sub: '11 vs 11.4', cap: 'The estimate of 11 is <b>reasonable</b>.' }] },
  d2: { e: '\\sqrt{\\sqrt{80}}', steps: [
    { tex: '\\sqrt{80} \\approx 9', note: sq('64 \\lt 80 \\lt 81'), cap: `Work from the <b>inside out</b>. ${T('\\sqrt{80}')}: 80 is just below <b>81</b>, so ${T('\\sqrt{80}')} ≈ <b>9</b>.` },
    { tex: '\\sqrt{\\sqrt{80}} \\approx \\sqrt{9} = 3', est: 1, cap: `Now the outer root: ${T('\\sqrt{9} = 3')}. Estimate: <b>3</b>.` },
    { tex: '\\sqrt{8.944\\ldots} = 2.990\\ldots \\approx 3.0', calc: 1, cap: `Calculator: ${T('\\sqrt{80} = 8.944\\ldots')}, then ${T('\\sqrt{8.944\\ldots} = 2.990\\ldots')} ≈ <b>3.0</b>.` },
    { verdict: 'SPOT ON', sub: '3 vs 3.0', cap: 'The estimate of 3 is <b>excellent</b>.' }] },
  '2b': { e: '3\\sqrt{20} + 4\\sqrt{41}', steps: [
    { tex: '\\sqrt{20} \\approx 4', note: sq('16 \\lt 20 \\lt 25'), cap: `${T('\\sqrt{20}')}: 20 is between 16 and 25, nearer <b>16</b>. So ${T('\\sqrt{20}')} ≈ <b>4</b>.` },
    { tex: '\\sqrt{41} \\approx 6', note: sq('36 \\lt 41 \\lt 49'), cap: `${T('\\sqrt{41}')}: 41 is between 36 and 49, nearer <b>36</b>. So ${T('\\sqrt{41}')} ≈ <b>6</b>.` },
    { tex: '3(4) + 4(6) = 12 + 24 = 36', est: 1, cap: 'Estimate: 3(4) + 4(6) = 12 + 24 = <b>36</b>.' },
    { tex: '13.416\\ldots + 25.612\\ldots \\approx 39.0', calc: 1, cap: `Calculator: 3(4.4721) + 4(6.4031) = 13.42 + 25.61 ≈ <b>39.0</b>.` },
    { verdict: 'REASONABLE', sub: '36 vs 39.0', cap: 'The estimate is a little low, but the <b>right size</b>. Both roots were rounded down, so the estimate came out low.' }] },
  '2c': { e: '-\\sqrt{7}', steps: [
    { tex: '\\sqrt{7} \\approx 3', note: sq('4 \\lt 7 \\lt 9'), cap: `${T('\\sqrt{7}')}: 7 is between 4 and 9, nearer <b>9</b>. So ${T('\\sqrt{7}')} ≈ <b>3</b>.` },
    { tex: '-\\sqrt{7} \\approx -3', est: 1, cap: `The negative sign is <b>outside</b> the root, so it just comes along: ${T('-\\sqrt{7}')} ≈ <b>−3</b>.` },
    { tex: '-\\sqrt{7} = -2.6457\\ldots \\approx -2.6', calc: 1, cap: `Calculator: ${T('\\sqrt{7} = 2.6457\\ldots')}, so ${T('-\\sqrt{7}')} ≈ <b>−2.6</b>.` },
    { verdict: 'REASONABLE', sub: '−3 vs −2.6', cap: 'The estimate of −3 is <b>reasonably close</b>.' }] },
  '2d': { e: '\\sqrt{\\sqrt{150}}', steps: [
    { tex: '\\sqrt{150} \\approx 12', note: sq('144 \\lt 150 \\lt 169'), cap: `Work from the <b>inside out</b>. ${T('\\sqrt{150}')}: 150 is just past <b>144</b>, so ${T('\\sqrt{150}')} ≈ <b>12</b>.` },
    { tex: '\\sqrt{12} \\approx 3', note: sq('9 \\lt 12 \\lt 16'), cap: `Outer root: ${T('\\sqrt{12}')}. 12 is between 9 and 16, nearer <b>9</b>, so about <b>3</b>.` },
    { tex: '\\sqrt{\\sqrt{150}} \\approx 3', est: 1, cap: `Estimate: ${T('\\sqrt{\\sqrt{150}}')} ≈ <b>3</b>.` },
    { tex: '\\sqrt{12.247\\ldots} = 3.4996\\ldots \\approx 3.5', calc: 1, cap: `Calculator: ${T('\\sqrt{150} = 12.247\\ldots')}, then ${T('\\sqrt{12.247\\ldots} = 3.4996\\ldots')} ≈ <b>3.5</b>.` },
    { verdict: 'REASONABLE', sub: '3 vs 3.5', cap: 'The estimate of 3 is <b>reasonable</b> — the true value is right on the edge between 3 and 4!' }] },
  d3: { e: '2\\sqrt[3]{100} - \\sqrt{10}', steps: [
    { tex: '\\sqrt[3]{100} \\approx 5', note: cu('64 \\lt 100 \\lt 125'), cap: `${T('\\sqrt[3]{100}')}: use the <b>cubes</b>. 100 is between 64 and 125, nearer <b>125</b> (25 away, not 36). So ${T('\\sqrt[3]{100}')} ≈ <b>5</b>.` },
    { tex: '\\sqrt{10} \\approx 3', note: sq('9 \\lt 10 \\lt 16'), cap: `${T('\\sqrt{10}')}: use the <b>squares</b>. 10 is just past 9, so ${T('\\sqrt{10}')} ≈ <b>3</b>.` },
    { tex: '2(5) - 3 = 7', est: 1, cap: 'Estimate: 2(5) − 3 = <b>7</b>.' },
    { tex: '9.283\\ldots - 3.162\\ldots \\approx 6.1', calc: 1, cap: `Calculator: ${T('2\\sqrt[3]{100} - \\sqrt{10} = 6.12\\ldots')} ≈ <b>6.1</b>.` },
    { verdict: 'REASONABLE', sub: '7 vs 6.1', cap: 'The estimate is a bit high, but the <b>right size</b>.' }] },
  '4c': { e: '5\\sqrt{50} - 5\\sqrt[3]{50}', steps: [
    { tex: '\\sqrt{50} \\approx 7', note: sq('49 \\lt 50 \\lt 64'), cap: `${T('\\sqrt{50}')}: use the <b>squares</b>. 50 is just past <b>49</b>, so ${T('\\sqrt{50}')} ≈ <b>7</b>.` },
    { tex: '\\sqrt[3]{50} \\approx 4', note: cu('27 \\lt 50 \\lt 64'), cap: `${T('\\sqrt[3]{50}')}: use the <b>cubes</b>. 50 is between 27 and 64, nearer <b>64</b> (14 away, not 23). So ${T('\\sqrt[3]{50}')} ≈ <b>4</b>.` },
    { tex: '5(7) - 5(4) = 35 - 20 = 15', est: 1, cap: 'Estimate: 5(7) − 5(4) = 35 − 20 = <b>15</b>.' },
    { tex: '35.355\\ldots - 18.420\\ldots \\approx 16.9', calc: 1, cap: `Calculator: 5(7.0711) − 5(3.6840) = 35.355 − 18.420 ≈ <b>16.9</b>.` },
    { verdict: 'REASONABLE', sub: '15 vs 16.9', cap: 'The estimate of 15 is <b>in the right range</b>.' }] }
};
function exprExplainer(title, keys, sepAt, sepLabel) {
  const choices = [];
  keys.forEach((k, i) => { if (i === sepAt) choices.push({ sep: sepLabel }); choices.push({ v: k, label: T(EXPR[k].e) }); });
  return {
    title, height: 400, choices,
    intro: (k) => `Estimate ${T(EXPR[k].e)} in your head first: replace each root with the nearest whole number. Then check with the calculator.`,
    make(stage, k, ex) {
      const W = ex.W, P = EXPR[k];
      add(stage, h('div', 'xp-head', T(P.e)), 30, 18);
      const nx = Math.round(W * 0.6);
      let y = 92;
      return P.steps.map((s) => {
        if (s.verdict) return {
          cap: s.cap,
          run: async (c) => {
            const st = add(stage, h('div', 'xp-stamp', `${s.verdict}<small>${s.sub}</small>`), W - 40, 290); st.style.translate = '-100% 0';
            await c.anim(st, [{ opacity: 0, transform: 'scale(1.8) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' });
          }
        };
        const yy = y; y += 62;
        return {
          cap: s.cap,
          run: async (c) => {
            const cls = s.calc ? ' xcalc' : s.est ? ' est' : '';
            const ln = add(stage, h('div', 'xp-line' + cls, (s.calc ? '<span class="xp-ic">calculator</span>' : s.est ? '<span class="xp-ic">estimate</span>' : '') + T(s.tex)), 30, yy);
            const jobs = [c.fadeIn(ln, 380, { from: 'translateX(-12px)' })];
            if (s.note) { const nt = add(stage, h('div', 'xp-note ' + s.note.kind, `<span class="kd">${s.note.kind}</span>${T(s.note.t)}`), nx, yy + 4); jobs.push(c.fadeIn(nt, 380, { delay: 200 })); }
            await Promise.all(jobs);
          }
        };
      });
    }
  };
}
const exprSq = exprExplainer('Estimate the whole expression, then check', ['d1', 'd2', '2b', '2c', '2d'], 2, 'Example 2 check:');
const exprCb = exprExplainer('Estimate with squares and cubes, then check', ['d3', '4c'], 1, 'Example 4 check:');

/* ============ 2. One significant digit: pairs of digits ============ */
function pairInfo(str) {
  const [ip, fp = ''] = str.split('.');
  const intGroups = []; for (let i = ip.length; i > 0; i -= 2) intGroups.unshift(ip.slice(Math.max(0, i - 2), i));
  const fpad = fp.length % 2 ? fp + '0' : fp, padded = fp.length % 2 === 1;
  const fracGroups = []; for (let i = 0; i < fpad.length; i += 2) fracGroups.push(fpad.slice(i, i + 2));
  const groups = intGroups.map((d) => ({ d, int: true })).concat(fracGroups.map((d) => ({ d, int: false })));
  const L = groups.findIndex((g) => Number(g.d) !== 0);
  const nInt = intGroups.length, p = L < nInt ? nInt - 1 - L : -(L - nInt + 1);
  const x = Number(str), root = Math.sqrt(x), d = Math.round(root / 10 ** p);
  const estimate = d * 10 ** p;
  return { groups, nInt, padded, L, p, d, root, estimate, lead: Number(groups[L].d) };
}
const estStr = (x, p) => (p >= 0 ? fmt(Math.round(x)) : x.toFixed(-p));
const pairs = {
  title: 'One significant digit: pair up the digits',
  height: 400,
  choices: [{ v: '2900', label: T('\\sqrt{2\\,900}') }, { v: '812000', label: T('\\sqrt{812\\,000}') }, { v: '0.36', label: T('\\sqrt{0.36}') }, { sep: 'Example 3 check:' },
    { v: '7340', label: T('\\sqrt{7\\,340}') }, { v: '51234.6', label: T('\\sqrt{51\\,234.6}') }, { v: '0.00512', label: T('\\sqrt{0.005\\,12}') }, { v: '0.0512', label: T('\\sqrt{0.051\\,2}') }],
  intro: (s) => `Estimate ${T('\\sqrt{' + s + '}')} to <b>one significant digit</b>. Start at the decimal point.`,
  make(stage, s, ex) {
    const W = ex.W, P = pairInfo(s), cw = 46, gap = 18, pw = 22;
    const head = add(stage, h('div', 'pr-head', `${T('\\sqrt{' + fmtNum(s) + '}')} ≈ <span class="pr-q">?</span>`), 28, 16);
    // layout: groups of digits with a gap, decimal point between int and frac groups
    const widths = P.groups.map((g) => g.d.length * cw);
    const total = widths.reduce((a, b) => a + b, 0) + gap * (P.groups.length - 1) + (P.groups.length > P.nInt ? pw + gap : 0);
    let x = (W - total) / 2; const yN = 196, yR = 104;
    const gx = [];
    P.groups.forEach((g, i) => {
      if (i === P.nInt) { add(stage, h('div', 'pr-pt c', '.'), x + pw / 2, yN); add(stage, h('div', 'pr-pt rpt c', '.'), x + pw / 2, yR); x += pw + gap; }
      const lastFrac = !g.int && i === P.groups.length - 1;
      [...g.d].forEach((ch, j) => { const e = add(stage, h('div', 'pr-dg c' + (lastFrac && P.padded && j === 1 ? ' pad' : ''), ch), x + j * cw + cw / 2, yN); if (lastFrac && P.padded && j === 1) hide(e); });
      gx.push(x + (g.d.length * cw) / 2); x += widths[i] + gap;
    });
    const rootPts = [...stage.querySelectorAll('.pr-pt.rpt')]; hide(...rootPts);
    const tagR = add(stage, h('div', 'nl-tag', 'root'), 28, yR - 8), tagN = add(stage, h('div', 'nl-tag', 'number'), 28, yN - 8); hide(tagR); void tagN;
    const svg = svgLayer(stage);
    const brs = P.groups.map((g, i) => { const w = g.d.length * cw - 8, x0 = gx[i] - w / 2; const p = sv('path', { d: `M ${x0} ${yN + 32} q 0 12 12 12 L ${x0 + w - 12} ${yN + 44} q 12 0 12 -12`, class: 'pr-br' + (i === P.L ? ' lead' : '') }, svg); hide(p); return p; });
    const slots = P.groups.map((g, i) => { const e = add(stage, h('div', 'pr-slot c', ''), gx[i], yR); hide(e); return e; });
    const arrows = P.groups.map((g, i) => { const p = sv('path', { d: `M ${gx[i]} ${yN - 34} L ${gx[i]} ${yR + 34}`, class: 'pr-ar' }, svg); hide(p); return p; });
    const info = add(stage, h('div', 'pr-info'), 28, 276); info.style.width = (W - 56) + 'px';
    const a = Math.floor(Math.sqrt(P.lead)), perfect = a * a === P.lead, nearSq = perfect ? a : (P.lead - a * a <= (a + 1) ** 2 - P.lead ? a : a + 1);
    const nInt = P.nInt, digitsBefore = Math.max(0, P.p + 1);
    const steps = [];
    steps.push({
      cap: `Start at the <b>decimal point</b> and mark off <b>pairs</b> of digits, going both ways.` + (P.padded ? ' Add a <b>0</b> on the end to finish the last pair.' : '') + (P.groups[0].int && P.groups[0].d.length === 1 && Number(s) >= 1 ? ` The leftmost group can be a single digit.` : ''),
      run: async (c) => { const pad = stage.querySelector('.pr-dg.pad'); const jobs = brs.map((p, i) => draw(c, p, 380, { delay: i * 180 })); if (pad) jobs.push(c.pop(pad, 380)); await Promise.all(jobs); }
    });
    steps.push({
      cap: `Each pair gives <b>one digit</b> of the square root, and the root’s decimal point lines up with this one.` + (Number(s) >= 1 ? ` ${nInt} group${nInt > 1 ? 's' : ''} before the point → <b>${nInt} digit${nInt > 1 ? 's' : ''}</b> before the point in the root.` : ''),
      run: async (c) => { await Promise.all([c.fadeIn(tagR, 300), ...slots.map((e, i) => c.pop(e, 360, { delay: i * 120 })), ...arrows.map((p, i) => c.anim(p, [{ opacity: 0 }, { opacity: 1 }], 300, { delay: i * 120 })), ...rootPts.map((e) => c.fadeIn(e, 300))]); }
    });
    steps.push({
      cap: `The first group that isn’t zero is <b>${P.groups[P.L].d}</b>. ` + (perfect ? `${T('\\sqrt{' + P.lead + '} = ' + a)} exactly, so that digit is <b>${P.d}</b>.` : `It’s between the perfect squares ${a * a} and ${(a + 1) ** 2}, closer to <b>${nearSq * nearSq}</b>, so that digit is about <b>${P.d}</b>.`),
      run: async (c) => {
        const sl = slots[P.L]; sl.textContent = P.d; sl.classList.add('lead');
        info.innerHTML = '<div>' + (perfect ? T(`\\sqrt{${P.lead}} = ${a}`) : T(`${a * a} \\lt ${P.lead} \\lt ${(a + 1) ** 2}`) + ` &nbsp;→&nbsp; ` + T(`\\sqrt{${P.lead}} \\approx ${P.d}`)) + '</div>';
        brs[P.L].classList.add('on');
        await Promise.all([c.pop(sl, 420), c.fadeIn(info, 350)]);
      }
    });
    const est = estStr(P.estimate, P.p);
    steps.push({
      cap: P.p >= 0 ? `Every pair after it just holds a place: write <b>0</b>. To one significant digit, ${T('\\sqrt{' + fmtNum(s) + '}')} ≈ <b>${est}</b>.`
        : `Pairs before it are zeros, so the root has zeros there too. Pairs after it aren’t needed for one significant digit. ${T('\\sqrt{' + fmtNum(s) + '}')} ≈ <b>${est}</b>.`,
      run: async (c) => {
        const jobs = [];
        slots.forEach((sl, i) => { if (i === P.L) return; if (i < P.L || (P.p >= 0 && i < nInt)) { sl.textContent = '0'; sl.classList.add('zero'); jobs.push(c.pop(sl, 300, { delay: Math.abs(i - P.L) * 120 })); } else { sl.classList.add('skip'); jobs.push(c.anim(sl, [{ opacity: 1 }, { opacity: 0.25 }], 300)); } });
        const q = head.querySelector('.pr-q'); q.innerHTML = `<b>${est}</b>`; jobs.push(c.pop(q, 420, { delay: 300 }));
        await Promise.all(jobs);
      }
    });
    void digitsBefore;
    steps.push({
      cap: `Check: ${T('\\sqrt{' + fmtNum(s) + '}')} = ${dots(P.root, P.root < 1 ? 4 : 2)}, which rounds to <b>${est}</b> (one significant digit). ✓`,
      run: async (c) => { const l = h('div', 'pr-check', `calculator: ${T('\\sqrt{' + fmtNum(s) + '} = ' + dots(P.root, P.root < 1 ? 4 : 2).replace('…', '\\ldots'))} &nbsp;→&nbsp; <b>${est}</b> ✓`); info.appendChild(l); await c.fadeIn(l, 400); }
    });
    return steps;
  }
};
function fmtNum(s) { // 51234.6 -> 51\,234.6 ; 0.00512 -> 0.005\,12 (thin spaces like the booklet)
  const [ip, fp] = s.split('.');
  const i2 = ip.length > 3 ? ip.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : ip;
  const f2 = fp && fp.length > 3 ? fp.replace(/(\d{3})(?=\d)/g, '$1\\,') : fp;
  return fp != null ? i2 + '.' + f2 : i2;
}

/* ============ 3. Cube roots: stacks of cubes ============ */
function isoCube(svg, P, L, k, cls) {
  const cs = Math.cos(Math.PI / 6), Rv = [cs * L, -0.5 * L], Lv = [-cs * L, -0.5 * L], U = [0, -L];
  const pt = (...vs) => vs.reduce((a, v) => [a[0] + v[0], a[1] + v[1]], P);
  const sc = (v, f) => [v[0] * f, v[1] * f];
  const g = sv('g', { class: 'iso ' + cls }, svg);
  const poly = (pts, c) => sv('polygon', { points: pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' '), class: c }, g);
  const ln = (p, q) => sv('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: 'gl' }, g);
  poly([pt(), pt(Lv), pt(Lv, U), pt(U)], 'fl'); poly([pt(), pt(Rv), pt(Rv, U), pt(U)], 'fr'); poly([pt(U), pt(U, Lv), pt(U, Lv, Rv), pt(U, Rv)], 'ft');
  for (let i = 1; i < k; i++) {
    const f = i / k;
    ln(pt(sc(Lv, f)), pt(sc(Lv, f), U)); ln(pt(sc(U, f)), pt(Lv, sc(U, f)));
    ln(pt(sc(Rv, f)), pt(sc(Rv, f), U)); ln(pt(sc(U, f)), pt(Rv, sc(U, f)));
    ln(pt(U, sc(Lv, f)), pt(U, sc(Lv, f), Rv)); ln(pt(U, sc(Rv, f)), pt(U, sc(Rv, f), Lv));
  }
  return g;
}
const cubes = {
  title: 'Cube roots: stacks of cubes',
  height: 480,
  choices: [{ v: 64, label: T('\\sqrt[3]{64}') }, { v: 20, label: T('\\sqrt[3]{20}') }, { v: -64, label: T('\\sqrt[3]{-64}') }, { v: -20, label: T('\\sqrt[3]{-20}') }, { sep: 'Example 4 check:' }, { v: 30, label: T('\\sqrt[3]{30}') }, { v: 150, label: T('\\sqrt[3]{150}') }, { v: 50, label: T('\\sqrt[3]{50}') }],
  custom: [1, 1000],
  intro: (n) => `${T('\\sqrt[3]{' + n + '}')} is the edge of a cube built from ${n < 0 ? '' : 'exactly '}<b>${fmtS(Math.abs(n))}</b> small cubes${n < 0 ? ' — with a negative sign to deal with' : ''}. Which perfect cubes is it between?`,
  make(stage, n, ex) {
    const W = ex.W, m = Math.abs(n), sg = n < 0 ? -1 : 1, a = Math.floor(Math.cbrt(m) + 1e-9), perfect = a ** 3 === m, A = perfect ? a : a + 1, e = m - a ** 3;
    const root = Math.cbrt(n), svg = svgLayer(stage), Lb = 110, P = [150, 250];
    const big = perfect ? null : isoCube(svg, P, Lb, A, 'ghost'), small = isoCube(svg, P, (Lb * a) / A, a, sg < 0 ? 'neg' : 'pos');
    if (big) hide(big); hide(small);
    const dims = add(stage, h('div', 'cb-dim c', `${a} × ${a} × ${a}`), P[0], P[1] + 18); hide(dims);
    const bigLab = add(stage, h('div', 'cb-dim amber c', `${A} × ${A} × ${A} = ${fmt(A ** 3)}`), P[0], 14); hide(bigLab);
    const left = []; const u = Math.min(16, (Lb / A) * 0.9);
    if (e > 0 && e <= 12) for (let i = 0; i < e; i++) { const col = i % 3, row = Math.floor(i / 3); const g = isoCube(svg, [282 + col * u * 1.8 + (row % 2) * u * 0.9, 250 - row * u * 1.05], u, 1, 'pos one'); left.push(g); }
    hide(...left);
    const leftLab = add(stage, h('div', 'cb-dim c', e > 12 ? `+ ${e} more` : `+ ${e}`), 300, 270); hide(leftLab);
    const info = add(stage, h('div', 'tl-info'), 370, 18); info.style.width = (W - 390) + 'px';
    const line = (t, cls = '') => { const el = h('div', 'tl-line ' + cls, T(t)); info.appendChild(el); return el; };
    const y1 = 324, y2 = 404, X0 = 120;
    const lo = sg > 0 ? Math.max(0, a - 2) : -(a + 3), hi = sg > 0 ? a + 3 : Math.min(0, -a + 2);
    const ticks = []; for (let v = lo; v <= hi; v++) ticks.push({ v, lab: fmtS(v) });
    const NL1 = nline(stage, svg, { x0: X0, x1: W - 60, y: y1, lo, hi, ticks });
    const cbLabs = []; for (let v = lo; v <= hi; v++) cbLabs.push(add(stage, h('div', 'nl-lab sq c' + (Math.abs(v) === a || Math.abs(v) === A ? ' key' : ''), fmtS(v ** 3)), NL1.X(v), y1 - 24));
    const t1 = add(stage, h('div', 'nl-tag', 'cubes'), 14, y1 - 34), t2 = add(stage, h('div', 'nl-tag', 'roots'), 14, y1 + 14);
    hide(...NL1.els, ...cbLabs, t1, t2);
    const near = Math.round(Math.cbrt(m)), nearS = sg * near; // nearest whole number (closer cube isn't always the same)
    const lin = sg * (a + e / (A ** 3 - a ** 3));
    const mk = add(stage, h('div', 'nl-mark c', `<b>${fmtS(n)}</b>`), NL1.X(perfect ? sg * a : lin), y1 - 58); hide(mk);
    const mkLine = sv('line', { x1: NL1.X(perfect ? sg * a : lin), x2: NL1.X(perfect ? sg * a : lin), y1: y1 - 44, y2: y1, class: 'nl-mk' }, svg); hide(mkLine);
    const zlo = sg > 0 ? a : -A, zhi = zlo + 1;
    const zt = []; for (let i = 0; i <= 10; i++) { const v = zlo + i / 10; zt.push({ v, lab: i % 10 === 0 ? fmtS(Math.round(v)) : neg(v.toFixed(1)), small: i % 10 !== 0, cls: i % 10 ? 'sm' : '' }); }
    const NL2 = nline(stage, svg, { x0: X0, x1: W - 60, y: y2, lo: zlo, hi: zhi, ticks: zt, cls: 'zoom' });
    const zl = sv('path', { d: `M ${NL1.X(zlo)} ${y1 + 36} L ${X0} ${y2 - 14} M ${NL1.X(zhi)} ${y1 + 36} L ${W - 60} ${y2 - 14}`, class: 'nl-zoom' }, svg);
    hide(...NL2.els, zl);
    const cDot = add(stage, h('div', 'nl-dot c'), NL2.X(root), y2), cLab = add(stage, h('div', 'nl-calc c', `${T('\\sqrt[3]{' + n + '}')} = ${dots(root, 3)}`), Math.min(W - 110, Math.max(170, NL2.X(root))), y2 + 46);
    hide(cDot, cLab);
    const showNL = (c) => Promise.all([...NL1.els, ...cbLabs, t1, t2].map((x) => c.fadeIn(x, 400)).concat(perfect ? [c.pop(NL1.labs[sg * a - lo], 400, { delay: 400 })] : [c.fadeIn(mk, 400, { delay: 400 }), c.anim(mkLine, [{ opacity: 0 }, { opacity: 1 }], 400, { delay: 400 })]));
    const showCube = (c) => Promise.all([c.anim(small, [{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'none' }], 600), c.fadeIn(dims, 300, { delay: 300 })]);
    const steps = [];
    const cb = (x) => `\\sqrt[3]{${x}}`;
    if (perfect) {
      steps.push({
        cap: sg > 0 ? `<b>${fmt(m)}</b> small cubes make a perfect <b>${a} × ${a} × ${a}</b> cube — nothing left over.` : `Start with the size: <b>${a} × ${a} × ${a} = ${fmt(m)}</b>. ${fmt(m)} small cubes make a perfect cube with edge ${a}.`,
        run: async (c) => { const l = line(`${a}^3 = ${a} \\times ${a} \\times ${a} = ${m}`); await Promise.all([showCube(c), c.fadeIn(l, 300, { delay: 300 })]); }
      });
      if (sg < 0) steps.push({
        cap: `Now the sign. A negative times a negative is positive; times a negative <b>again</b> is negative: <b>(−${a})(−${a})(−${a}) = −${fmt(m)}</b>.`,
        run: async (c) => { const l1 = line(`(-${a}) \\times (-${a}) = ${a * a}`), l2 = line(`${a * a} \\times (-${a}) = -${m}`, 'amber'); await Promise.all([c.fadeIn(l1, 300), c.fadeIn(l2, 300, { delay: 400 })]); }
      });
      steps.push({
        cap: sg > 0 ? `So ${T(cb(n) + ' = ' + a)} <b>exactly</b>. ${fmt(m)} is a <b>perfect cube</b>, so its cube root is <b>rational</b>.`
          : `So ${T(cb(n) + ' = -' + a)}. Unlike a square root, a negative number <b>has</b> a cube root — and there’s only <b>one</b>.`,
        run: async (c) => { const l = line(`${cb(n)} = ${sg * a}`, 'ok big'); NL1.labs[sg * a - lo].classList.add('hit'); await Promise.all([c.fadeIn(l, 300), showNL(c)]); }
      });
      return steps;
    }
    const stepsTo = A ** 3 - m;
    steps.push({
      cap: (sg < 0 ? `Ignore the sign for now and look at ${T(cb(m))}. ` : '') + `The biggest cube we can build from <b>${fmt(m)}</b> small cubes is <b>${a} × ${a} × ${a} = ${a ** 3}</b>, with <b>${e}</b> left over.`,
      run: async (c) => { const l = line(`${a}^3 = ${a ** 3}`); await Promise.all([showCube(c), c.fadeIn(l, 300, { delay: 300 }), ...left.map((g, i) => c.anim(g, [{ opacity: 0 }, { opacity: 1 }], 250, { delay: 600 + i * 70 })), c.fadeIn(leftLab, 300, { delay: 700 })]); }
    });
    steps.push({
      cap: `A <b>${A} × ${A} × ${A}</b> cube needs <b>${fmt(A ** 3)}</b> — ${stepsTo} more than we have. So ${T(cb(m))} is between <b>${a} and ${A}</b> (${fmt(m)} is ${e} above ${a ** 3} and ${stepsTo} below ${fmt(A ** 3)}).`,
      run: async (c) => { const l = line(`${a ** 3} \\lt ${m} \\lt ${A ** 3}`, 'amber'); await Promise.all([c.anim(big, [{ opacity: 0 }, { opacity: 1 }], 500), c.fadeIn(bigLab, 400), c.fadeIn(l, 300)]); }
    });
    if (sg < 0) steps.push({
      cap: `Bring back the sign: (−${a})³ = −${a ** 3} and (−${A})³ = −${fmt(A ** 3)}. So ${T(cb(n))} is between <b>−${A} and −${a}</b>, nearest <b>−${near}</b>.`,
      run: async (c) => { const l = line(`-${A} \\lt ${cb(n)} \\lt -${a} \\;\\Rightarrow\\; ${cb(n)} \\approx -${near}`, 'big'); const k = NL1.labs[nearS - lo]; k.classList.add('hit'); await Promise.all([c.fadeIn(l, 300), showNL(c), c.pop(k, 400, { delay: 500 })]); }
    });
    else steps.push({
      cap: `To the nearest whole number, ${T(cb(n))} ≈ <b>${near}</b>.`,
      run: async (c) => { const l = line(`${a} \\lt ${cb(n)} \\lt ${A} \\;\\Rightarrow\\; ${cb(n)} \\approx ${near}`, 'big'); const k = NL1.labs[nearS - lo]; k.classList.add('hit'); await Promise.all([c.fadeIn(l, 300), showNL(c), c.pop(k, 400, { delay: 500 })]); }
    });
    const verdict = Math.abs(Math.round(root) - nearS) === 0 ? (Math.abs(root - nearS) < 0.15 ? 'An excellent estimate.' : 'A good estimate.') : 'Close — the estimate was reasonable.';
    steps.push({
      cap: `Zoom in and check on the calculator: ${T(cb(n) + ' = ' + dots(root, 3).replace('…', '\\ldots').replace('−', '-'))} ≈ <b>${tenth(root)}</b>. ${verdict}`,
      run: async (c) => { const l = line(`${cb(n)} = ${dots(root, 3).replace('…', '\\ldots').replace('−', '-')} \\approx ${tenth(root).replace('−', '-')}`, 'ok'); await Promise.all([c.anim(zl, [{ opacity: 0 }, { opacity: 1 }], 400), ...NL2.els.map((x) => c.fadeIn(x, 400, { delay: 200 })), c.fadeIn(l, 300), c.pop(cDot, 400, { delay: 500 }), c.fadeIn(cLab, 400, { delay: 600 })]); }
    });
    return steps;
  }
};

/* ============ 4. Absolute value is distance ============ */
const ABS = {
  five: { label: '|-5|,\\ |5|', steps: [
    { cap: `−5 is <b>5 units</b> from 0, so ${T('|-5| = 5')}.`, ops: [{ expr: '|-5| = 5' }, { dot: -5 }, { arc: [0, -5], lab: '5 units' }] },
    { cap: `5 is also 5 units from 0: ${T('|5| = 5')}. A distance is <b>never negative</b>.`, ops: [{ expr: '|-5| = |5| = 5' }, { dot: 5 }, { arc: [0, 5], lab: '5 units' }] },
    { cap: `The booklet’s way gives the same answer: square it, then take the principal square root. ${T('\\sqrt{(-5)^2} = \\sqrt{25} = 5')}.`, ops: [{ expr: '|-5| = \\sqrt{(-5)^2} = \\sqrt{25} = 5' }] }] },
  a: { label: '|-9| + |9|', steps: [
    { cap: `−9 is <b>9 units</b> from 0: ${T('|-9| = 9')}.`, ops: [{ expr: '|-9| + |9| = 9 + \\ ?' }, { dot: -9 }, { arc: [0, -9], lab: '9 units' }] },
    { cap: `9 is also <b>9 units</b> from 0: ${T('|9| = 9')}.`, ops: [{ expr: '|-9| + |9| = 9 + 9' }, { dot: 9 }, { arc: [0, 9], lab: '9 units' }] },
    { cap: `Add the two distances: 9 + 9 = <b>18</b>.`, ops: [{ expr: '|-9| + |9| = 9 + 9 = 18' }, { arc: [-9, 9], lab: '18 units in all', below: 1, cls: 'tot' }] }] },
  b: { label: '|2 - 9|', steps: [
    { cap: `Work <b>inside the bars first</b>: start at 2 and move 9 to the left. ${T('2 - 9 = -7')}.`, ops: [{ expr: '|2 - 9| = |-7|' }, { dot: 2, cls: 'start' }, { arc: [2, -7], lab: '− 9', below: 1, cls: 'move' }, { dot: -7 }] },
    { cap: `−7 is <b>7 units</b> from 0, so ${T('|2 - 9| = 7')}.`, ops: [{ expr: '|2 - 9| = |-7| = 7' }, { arc: [0, -7], lab: '7 units' }] },
    { cap: `Bonus: ${T('|2 - 9|')} is also the <b>distance between 2 and 9</b> on the number line.`, ops: [{ dot: 9, cls: 'start' }, { arc: [2, 9], lab: '7 apart', cls: 'alt' }] }] },
  c: { label: '-|-\\sqrt{100}|', steps: [
    { cap: `Inside the bars first: ${T('\\sqrt{100} = 10')}, so ${T('-\\sqrt{100} = -10')}.`, ops: [{ expr: '-|-\\sqrt{100}| = -|-10|' }, { dot: -10 }] },
    { cap: `${T('|-10|')} is the distance from 0 to −10: <b>10</b>.`, ops: [{ expr: '-|-\\sqrt{100}| = -|-10| = -(10)' }, { arc: [0, -10], lab: '10 units' }] },
    { cap: `The minus sign <b>outside</b> the bars still applies: ${T('-(10) = -10')}. So ${T('-|-\\sqrt{100}| = -10')} — the answer is negative!`, ops: [{ expr: '-|-\\sqrt{100}| = -|-10| = -(10) = -10' }, { ring: -10 }] }] }
};
const absval = {
  title: 'Absolute value is a distance',
  height: 340,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'five', label: T(ABS.five.label) }, { sep: 'Example 5 check:' }, { v: 'a', label: '(a) ' + T(ABS.a.label) }, { v: 'b', label: '(b) ' + T(ABS.b.label) }, { v: 'c', label: '(c) ' + T(ABS.c.label) }],
  intro: (k) => `How far from 0? Absolute value measures <b>distance</b>, so it doesn’t care which side of 0 a number is on. Evaluate ${T(ABS[k].label)}.`,
  make(stage, k, ex) {
    const W = ex.W, Y = 196, svg = svgLayer(stage);
    const defs = sv('defs', {}, svg);
    ['ah', 'ahm', 'aht', 'aha'].forEach((id) => { const m = sv('marker', { id: 'l4' + id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerUnits: 'userSpaceOnUse', markerWidth: 15, markerHeight: 15, orient: 'auto-start-reverse' }, defs); sv('path', { d: 'M0 0 L10 5 L0 10 z', class: 'mk-' + id }, m); });
    const ticks = []; for (let v = -12; v <= 12; v++) ticks.push({ v, lab: fmtS(v), cls: v === 0 ? 'zero' : '' });
    const NL = nline(stage, svg, { x0: 56, x1: W - 56, y: Y, lo: -12, hi: 12, ticks });
    const X = NL.X, unit = X(1) - X(0);
    const expr = add(stage, h('div', 'av-expr c', T(ABS[k].label)), W / 2, 40);
    const dotsAt = {};
    const op = async (c, o) => {
      if (o.expr) { expr.innerHTML = T(o.expr); await c.fadeIn(expr, 300); }
      if (o.dot != null) {
        const d = add(stage, h('div', 'av-dot c ' + (o.cls || '')), X(o.dot), Y); dotsAt[o.dot] = d;
        await c.pop(d, 360);
      }
      if (o.ring != null) { const d = dotsAt[o.ring]; d.classList.add('final'); await c.anim(d, [{ transform: 'scale(1)' }, { transform: 'scale(1.6)' }, { transform: 'scale(1)' }], 520); }
      if (o.arc) {
        const [p, q] = o.arc, x0 = X(p), x1 = X(q), span = Math.abs(q - p), hgt = Math.min(92, 22 + span * 6.2) * (o.below ? 1 : -1), yb = Y + (o.below ? 12 : -12);
        const path = sv('path', { d: `M ${x0} ${yb} Q ${(x0 + x1) / 2} ${yb + hgt * 1.9} ${x1} ${yb}`, class: 'av-arc ' + (o.cls || '') }, svg);
        const mkId = `url(#l4${o.cls === 'move' ? 'ahm' : o.cls === 'tot' ? 'aht' : o.cls === 'alt' ? 'aha' : 'ah'})`;
        const lab = add(stage, h('div', 'av-lab c ' + (o.cls || ''), o.lab), (x0 + x1) / 2, yb + hgt * 0.95 + (o.below ? 16 : -16)); hide(lab);
        await Promise.all([draw(c, path, 650).then(() => path.setAttribute('marker-end', mkId)), c.fadeIn(lab, 300, { delay: 400 })]);
      }
    };
    void unit;
    return ABS[k].steps.map((s) => ({ cap: s.cap, run: async (c) => { for (const o of s.ops) await op(c, o); } }));
  }
};

/* ============ 4. Graphing absolute value inequalities ============ */
const INEQ = {
  a3: { v: 'a', op: '<', k: 3 }, x4: { v: 'x', op: '≥', k: 4 }, d: { v: 'x', op: '≤', k: 5, ex: '5(d)' }, e: { v: 'x', op: '>', k: 6, ex: '5(e)' }
};
const OPT = { '<': '\\lt', '≤': '\\le', '>': '\\gt', '≥': '\\ge' };
const ineqTex = (q) => `|${q.v}| ${OPT[q.op]} ${q.k}`;
const ineq = {
  title: 'Graph an absolute value inequality',
  height: 330,
  choices: [{ v: 'a3', label: T(ineqTex(INEQ.a3)) }, { v: 'x4', label: T(ineqTex(INEQ.x4)) }, { sep: 'Example 5 check:' }, { v: 'd', label: '(d) ' + T(ineqTex(INEQ.d)) }, { v: 'e', label: '(e) ' + T(ineqTex(INEQ.e)) }],
  intro: (key) => `Graph ${T(ineqTex(INEQ[key]) + ',\\ ' + INEQ[key].v + ' \\in R')}. Think <b>distance from 0</b>.`,
  make(stage, key, ex) {
    const W = ex.W, q = INEQ[key], k = q.k, Y = 190, svg = svgLayer(stage);
    const lessT = q.op === '<' || q.op === '≤', incl = q.op === '≤' || q.op === '≥';
    const defs = sv('defs', {}, svg);
    const m = sv('marker', { id: 'l4iq', viewBox: '0 0 10 10', refX: 8, refY: 5, markerUnits: 'userSpaceOnUse', markerWidth: 17, markerHeight: 17, orient: 'auto-start-reverse' }, defs); sv('path', { d: 'M0 0 L10 5 L0 10 z', class: 'mk-ah' }, m);
    const mr = sv('marker', { id: 'l4iqr', viewBox: '0 0 10 10', refX: 6, refY: 5, markerUnits: 'userSpaceOnUse', markerWidth: 22, markerHeight: 22, orient: 'auto-start-reverse' }, defs); sv('path', { d: 'M0 0 L10 5 L0 10 z', class: 'mk-r' }, mr);
    const ticks = []; for (let v = -9; v <= 9; v++) ticks.push({ v, lab: fmtS(v), cls: Math.abs(v) === k ? 'kk' : v === 0 ? 'zero' : '' });
    const NL = nline(stage, svg, { x0: 70, x1: W - 70, y: Y, lo: -9.6, hi: 9.6, ticks });
    const X = NL.X;
    const head = add(stage, h('div', 'av-expr c', T(ineqTex(q))), W / 2, 36);
    const phrase = { '<': `less than ${k} units`, '≤': `at most ${k} units`, '>': `more than ${k} units`, '≥': `at least ${k} units` }[q.op];
    const arcs = [-k, k].map((s) => { const x0 = X(0), x1 = X(s); const p = sv('path', { d: `M ${x0} ${Y - 12} Q ${(x0 + x1) / 2} ${Y - 92} ${x1} ${Y - 12}`, class: 'av-arc' }, svg); hide(p); const l = add(stage, h('div', 'av-lab c', `${k} units`), (x0 + x1) / 2, Y - 70); hide(l); return [p, l]; });
    const shade = sv('g', { class: 'iq-shade' }, svg);
    if (lessT) sv('line', { x1: X(-k), x2: X(k), y1: Y, y2: Y }, shade);
    else { sv('line', { x1: X(-k), x2: 40, y1: Y, y2: Y, 'marker-end': 'url(#l4iqr)' }, shade); sv('line', { x1: X(k), x2: W - 40, y1: Y, y2: Y, 'marker-end': 'url(#l4iqr)' }, shade); }
    hide(shade);
    const pts = [-k, k].map((s) => { const e = add(stage, h('div', 'iq-pt c' + (incl ? ' closed' : ' open')), X(s), Y); hide(e); return e; });
    const sat = (v) => ({ '<': Math.abs(v) < k, '≤': Math.abs(v) <= k, '>': Math.abs(v) > k, '≥': Math.abs(v) >= k }[q.op]);
    const tests = [1, -(k + 2)].map((v) => { const ok = sat(v); const e = add(stage, h('div', 'iq-test c ' + (ok ? 'ok' : 'no'), `${q.v} = ${fmtS(v)}<br>${T(`|${v}| = ${Math.abs(v)}`)} ${ok ? '✓' : '✗'}`), X(v), Y + 76); const d = add(stage, h('div', 'iq-tdot c ' + (ok ? 'ok' : 'no')), X(v), Y); hide(e, d); return [e, d, v, ok]; });
    const steps = [
      { cap: `${T(ineqTex(q))} means ${T(q.v)} is <b>${phrase}</b> from 0 — on <b>either side</b>.`, run: (c) => Promise.all(arcs.flatMap(([p, l], i) => [draw(c, p, 600, { delay: i * 200 }).then(() => p.setAttribute('marker-end', 'url(#l4iq)')), c.fadeIn(l, 300, { delay: 500 })])) },
      { cap: `The boundary points are <b>−${k} and ${k}</b>, exactly ${k} units from 0.` + (incl ? ` “Or equal to” means they’re <b>included</b>: draw <b>solid dots</b>.` : ` They’re <b>not</b> included (|${k}| = ${k} is not ${q.op === '<' ? 'less' : 'more'} than ${k}): draw <b>open circles</b>.`),
        run: (c) => Promise.all(pts.map((e, i) => c.pop(e, 380, { delay: i * 150 }))) },
      { cap: lessT ? `${phrase[0].toUpperCase() + phrase.slice(1)} from 0 → every point <b>between</b> −${k} and ${k}. Shade the segment.` : `${phrase[0].toUpperCase() + phrase.slice(1)} from 0 → every point <b>outside</b> −${k} and ${k}, going on forever both ways. Shade two rays with arrows.`,
        run: async (c) => { await c.anim(shade, [{ opacity: 0 }, { opacity: 1 }], 500); arcs.forEach(([p, l]) => { p.style.opacity = 0.3; l.style.opacity = 0.3; }); } },
      { cap: `Test a point on each side. ${tests.map(([, , v, ok]) => `${T(q.v + ' = ' + v)}: ${T('|' + v + '| = ' + Math.abs(v))}, ${ok ? '<b class="ok">works ✓</b>' : '<b class="red">doesn’t ✗</b>'}`).join(' &nbsp; ')}`,
        run: (c) => Promise.all(tests.flatMap(([e, d], i) => [c.pop(d, 320, { delay: i * 250 }), c.fadeIn(e, 300, { delay: i * 250 + 100 })])) }
    ];
    if (q.ex) steps.push({ cap: `So the graph in Example ${q.ex} — ${incl ? 'solid dots' : 'open circles'} at ±${k}, shaded ${lessT ? 'between' : 'outside'} — is <b>${T(ineqTex(q))}</b>.`, run: async (c) => { head.classList.add('done'); await c.pop(head, 420); } });
    return steps;
  }
};

/* ====================== warm-up: Guess Who? ====================== */
const SKIN = { A: '#fad7b4', B: '#cd966e', C: '#8c5f41' }, HAIR = { A: '#3c2819', B: '#e1aa3c', C: '#be5028', D: '#232328' };
const GW = [
  { t: '\\sqrt{16}', v: '= 4', s: 'A', hr: 'A', st: 0, gl: 0, rat: 1, int: 1, val: 4, ends: 1 },
  { t: '-\\sqrt{9}', v: '= -3', s: 'B', hr: 'B', st: 1, gl: 0, rat: 1, int: 1, val: -3, ends: 1 },
  { t: '\\dfrac{12}{3}', v: '= 4', s: 'C', hr: 'D', st: 2, gl: 1, rat: 1, int: 1, val: 4, ends: 1 },
  { t: '0', v: '= 0', s: 'A', hr: 'C', st: 1, gl: 1, rat: 1, int: 1, val: 0, ends: 1 },
  { t: '\\dfrac{22}{7}', v: '= 3.\\overline{142857}', s: 'B', hr: 'D', st: 3, gl: 0, rat: 1, int: 0, val: 22 / 7, ends: 0 },
  { t: '\\pi', v: '= 3.141\\,59\\ldots', s: 'C', hr: 'A', st: 0, gl: 1, rat: 0, int: 0, val: Math.PI, ends: 0 },
  { t: '\\sqrt{2}', v: '= 1.414\\,21\\ldots', s: 'C', hr: 'C', st: 2, gl: 0, rat: 0, int: 0, val: Math.SQRT2, ends: 0 },
  { t: '0.25', v: '= \\tfrac{1}{4}', s: 'A', hr: 'D', st: 0, gl: 1, rat: 1, int: 0, val: 0.25, ends: 1 },
  { t: '-7', v: '= -7', s: 'B', hr: 'A', st: 1, gl: 0, rat: 1, int: 1, val: -7, ends: 1 },
  { t: '1.010\\,010\\,001\\ldots', v: '\\text{no repeating block}', s: 'A', hr: 'B', st: 3, gl: 1, rat: 0, int: 0, val: 1.01, ends: 0, long: 1 },
  { t: '0.\\overline{3}', v: '= \\tfrac{1}{3}', s: 'C', hr: 'B', st: 1, gl: 0, rat: 1, int: 0, val: 1 / 3, ends: 0 },
  { t: '\\sqrt{\\dfrac{1}{4}}', v: '= \\tfrac{1}{2} = 0.5', s: 'B', hr: 'C', st: 2, gl: 1, rat: 1, int: 0, val: 0.5, ends: 1 }
];
function face(skin, hair, st, gl) {
  const ink = '#1e2d46';
  return `<svg viewBox="0 0 100 84" class="gw-face" aria-hidden="true">
    ${st === 1 ? `<ellipse cx="50" cy="40" rx="27" ry="28" fill="${hair}"/><rect x="23" y="40" width="54" height="30" fill="${hair}"/>` : ''}
    <rect x="22" y="66" width="56" height="26" rx="12" fill="#9a6574"/>
    <circle cx="50" cy="42" r="21" fill="${skin}" stroke="${ink}" stroke-width="1.8"/>
    ${st === 0 ? `<path d="M29 40 A21 21 0 0 1 71 40 Q50 30 29 40Z" fill="${hair}"/>` : ''}
    ${st === 1 ? `<path d="M29 38 A21 21 0 0 1 71 38 Q58 28 29 38Z" fill="${hair}"/>` : ''}
    ${st === 2 ? `<rect x="24" y="22" width="52" height="5" rx="1" fill="${hair}" stroke="${ink}" stroke-width="1.4"/><rect x="33" y="7" width="34" height="16" rx="2" fill="${hair}" stroke="${ink}" stroke-width="1.4"/>` : ''}
    <circle cx="42" cy="43" r="2.5" fill="${ink}"/><circle cx="58" cy="43" r="2.5" fill="${ink}"/>
    <path d="M42 52 Q50 58 58 52" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>
    ${gl ? `<circle cx="42" cy="43" r="6.3" fill="none" stroke="${ink}" stroke-width="1.8"/><circle cx="58" cy="43" r="6.3" fill="none" stroke="${ink}" stroke-width="1.8"/><path d="M48.3 43 H51.7" stroke="${ink}" stroke-width="1.8"/>` : ''}
  </svg>`;
}
function mountWarmup() {
  const board = document.getElementById('gw'); if (!board) return;
  const cards = GW.map((g, i) => {
    const b = h('button', 'gw-card' + (g.long ? ' long' : ''), `<div class="gw-in">${face(SKIN[g.s], HAIR[g.hr], g.st, g.gl)}<div class="gw-plate">${T(g.t)}</div><div class="gw-val">${T(g.v)}</div></div>`);
    b.type = 'button'; b.dataset.i = i; b.setAttribute('aria-label', 'Face ' + (i + 1));
    b.addEventListener('click', () => b.classList.toggle('down'));
    board.appendChild(b); return b;
  });
  const FILTERS = { rat: (g) => g.rat, int: (g) => !g.int, gt: (g) => g.val > 0.3, ends: (g) => g.ends };
  const used = new Set(), res = document.getElementById('gw-result');
  const apply = () => {
    cards.forEach((b, i) => b.classList.toggle('down', [...used].some((f) => !FILTERS[f](GW[i]))));
    const up = cards.filter((b) => !b.classList.contains('down'));
    if (used.size === 4 && up.length === 1) { res.innerHTML = `Only one face is left standing: ${T('\\sqrt{\\tfrac14} = \\tfrac12 = 0.5')}. Rational, not an integer, more than 0.3, and its decimal ends. <span class="muted">(${T('\\tfrac{22}{7}')} and ${T('0.\\overline{3}')} repeat; 0.25 is too small.)</span>`; res.classList.add('show'); up[0].classList.add('hl-win'); }
    else { res.classList.remove('show'); cards.forEach((b) => b.classList.remove('hl-win')); }
  };
  document.querySelectorAll('.gw-q').forEach((b) => b.addEventListener('click', () => { const f = b.dataset.q; if (used.has(f)) used.delete(f); else used.add(f); b.classList.toggle('on', used.has(f)); apply(); }));
  const hl = (cls, idx, on) => cards.forEach((b, i) => b.classList.toggle(cls, on && idx.includes(i)));
  const tog = (btn, cls, idx, ansId) => btn.addEventListener('click', () => { const on = !btn.classList.contains('on'); btn.classList.toggle('on', on); btn.textContent = on ? 'Hide' : 'Show'; hl(cls, idx, on); document.getElementById(ansId).classList.toggle('show', on); });
  tog(document.querySelector('[data-gw=neg]'), 'hl-neg', [1, 8], 'gw-a-neg');
  tog(document.querySelector('[data-gw=same]'), 'hl-same', [0, 2], 'gw-a-same');
  const vals = document.querySelector('[data-gw=values]');
  vals.addEventListener('click', () => { const on = board.classList.toggle('show-vals'); vals.textContent = on ? 'Hide what each face equals' : 'Show what each face equals'; });
  document.querySelector('[data-gw=reset]').addEventListener('click', () => { used.clear(); document.querySelectorAll('.gw-q').forEach((b) => b.classList.remove('on')); cards.forEach((b) => b.classList.remove('down', 'hl-win')); res.classList.remove('show'); });
  const poll = document.getElementById('gw-poll');
  poll.querySelector('[data-poll]').addEventListener('click', () => { const on = poll.classList.toggle('revealed'); hl('hl-int', [0, 1, 2, 3, 8], on); });
}

/* ====================== perfect squares / cubes fill-in ====================== */
function mountPowGrid(id, n, p, sym) {
  const el = document.getElementById(id); if (!el) return;
  el.style.gridTemplateColumns = `auto repeat(${n}, 1fr)`;
  let html = `<div class="pg-h">${T('n')}</div>`; for (let i = 1; i <= n; i++) html += `<div class="pg-n">${i}</div>`;
  html += `<div class="pg-h">${T('n^' + p)}</div>`; for (let i = 1; i <= n; i++) html += `<button class="blank pg-b" data-a="${fmt(i ** p)}" data-g="${sym}"></button>`;
  el.innerHTML = html;
  el.querySelectorAll('.pg-b').forEach((b) => b.addEventListener('click', () => { b.classList.toggle('filled'); b.textContent = b.classList.contains('filled') ? b.dataset.a : ''; }));
  const all = document.querySelector(`[data-fillall=${sym}]`);
  if (all) all.addEventListener('click', () => el.querySelectorAll('.pg-b').forEach((b, i) => setTimeout(() => { b.classList.add('filled'); b.textContent = b.dataset.a; b.animate([{ transform: 'scale(1.4)' }, { transform: 'scale(1)' }], 300); }, i * 120)));
}

/* ====================== Example 5 graphs ====================== */
function mountNumberLines() {
  document.querySelectorAll('.nl-fig[data-nl]').forEach((el) => {
    const [a, b, kind, region] = el.dataset.nl.split(','); const lo = Number(a), hi = Number(b);
    const X = (v) => 230 + v * 23.5, Y = 30;
    let s = `<svg viewBox="0 0 460 62" class="nlf"><defs><marker id="nlf-${hi}" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="13" markerHeight="13" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#1c2230"/></marker></defs>`;
    s += `<line x1="8" x2="452" y1="${Y}" y2="${Y}" stroke="#1c2230" stroke-width="1.6" marker-start="url(#nlf-${hi})" marker-end="url(#nlf-${hi})"/>`;
    for (let v = -8; v <= 8; v++) s += `<line x1="${X(v)}" x2="${X(v)}" y1="${Y - 5}" y2="${Y + 5}" stroke="#1c2230" stroke-width="1.3"/><text x="${X(v)}" y="${Y + 22}" text-anchor="middle" font-size="13" fill="#3a4254">${v < 0 ? '−' + -v : v}</text>`;
    if (region === 'between') s += `<line x1="${X(lo)}" x2="${X(hi)}" y1="${Y}" y2="${Y}" stroke="#1c2230" stroke-width="5"/>`;
    else s += `<line x1="${X(lo)}" x2="10" y1="${Y}" y2="${Y}" stroke="#1c2230" stroke-width="5" marker-end="url(#nlf-${hi})"/><line x1="${X(hi)}" x2="450" y1="${Y}" y2="${Y}" stroke="#1c2230" stroke-width="5" marker-end="url(#nlf-${hi})"/>`;
    [lo, hi].forEach((v) => { s += `<circle cx="${X(v)}" cy="${Y}" r="6" fill="${kind === 'closed' ? '#1c2230' : '#fff'}" stroke="#1c2230" stroke-width="2.4"/>`; });
    el.innerHTML = s + '</svg>';
  });
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { build, remainders, sorter, tiles, exprSq, exprCb, pairs, cubes, absval, ineq };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}
/* line up the Answer buttons (and the work areas) across a row of parts, whatever the answer lengths */
function equalizeParts() {
  document.querySelectorAll('.parts').forEach((row) => {
    ['.pl', '.ans'].forEach((sel) => {
      const els = [...row.querySelectorAll(':scope > .part > ' + sel + ', :scope > .part > .ansrow > ' + sel)];
      els.forEach((e) => (e.style.minHeight = ''));
      if (els.length < 2) return;
      const m = Math.max(...els.map((e) => e.offsetHeight));
      els.forEach((e) => (e.style.minHeight = m + 'px'));
    });
  });
}
addEventListener('load', () => setTimeout(equalizeParts, 60));
if (document.fonts) document.fonts.ready.then(() => setTimeout(equalizeParts, 60));

mountExplainers(); mountWarmup(); mountPowGrid('sq-grid', 15, 2, 'sq'); mountPowGrid('cb-grid', 10, 3, 'cb'); mountNumberLines();
