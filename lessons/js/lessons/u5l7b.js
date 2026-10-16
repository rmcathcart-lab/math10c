/* Math 10C · Unit 5 · Lesson 7B — Function Notation:
 * the phone-keypad warm-up, Example 1's figures and the explainers.
 * Colour code for the notation (whole lesson): the function's NAME purple, the INPUT blue, the OUTPUT amber. */
import {
  h, tex, add, box, Graph, ValueTable, MappingDiagram, stamp, stampIn, checkCard, mountExplainers,
  pop, fadeIn, pulse, sleep, pairTex, svgEl, arrowHead, liveCtx, drawIn
} from '../blocks.js';

const T = (s) => tex(s);
/* KaTeX with \htmlClass allowed (so parts of an expression can be coloured or highlighted) */
const K = (src, display) => {
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  try {
    return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' })
      .replace('<span class="katex"', '<span data-tex="' + esc(String(src)) + '" class="katex"');
  } catch (e) { return tex(src, display); }
};
const PUR = '#7b4fc4', BLU = '#1f5bd6', AMB = '#c27a0e', RED = '#c93a33', OK = '#12805a';
const NM = (s) => `\\htmlClass{u5l7b-cn}{${s}}`, IN = (s) => `\\htmlClass{u5l7b-ci}{${s}}`, OUT = (s) => `\\htmlClass{u5l7b-co}{${s}}`;
const X = '\\htmlClass{u5l7b-slot}{x}';            // an x in a rule: a slot for the input
const S = (v) => `\\htmlClass{u5l7b-sub}{(${v})}`;  // what went into the slot, in brackets
const KL = (src) => K(src.replace(/=\\htmlClass/g, '=\\;\\htmlClass')); // keep the space after = before a highlighted group

const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u5l7b-panel', title ? `<div class="u5l7b-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u5l7b-pl ' + cls, html); p.appendChild(d); return d; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const keysHTML = (s) => `<span class="keys">${s.split(' ').map((k) => `<kbd>${k === '=' ? 'ENTER' : k}</kbd>`).join('')}</span>`;
/* an element's box in stage coordinates (the lesson page may be scaled) */
function rel(stage, el) {
  const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / (stage.offsetWidth || s.width) || 1;
  return { x: (r.left - s.left) / k - stage.clientLeft, y: (r.top - s.top) / k - stage.clientTop, w: r.width / k, h: r.height / k };
}
/* an arrow drawn in an SVG: a group that drawIn() can animate */
function arrowLine(svg, pts, color, w = 3.5) {
  const g = svgEl('g', { class: 'bk-curve' }, svg); g.style.color = color;
  svgEl('path', { class: 'bk-stroke', d: 'M' + pts.map((p) => p.join(' ')).join('L'), fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round' }, g);
  const a = pts[pts.length - 2], b = pts[pts.length - 1];
  arrowHead(g, b[0], b[1], b[0] - a[0], b[1] - a[1], { width: w, color, cls: 'bk-end bk-end1' });
  return g;
}

/* ======================= explainer 1: the function machine ======================= */
const MC = {
  f: {
    label: T('f(x)=3x+1'), name: 'f', rule: 'f(x)=3x+1', v: 'x', graph: { xmin: -4, xmax: 6, ymin: -8, ymax: 16, ystep: 2 }, curve: (x) => 3 * x + 1,
    ins: [
      { a: '4', o: '13', x: 4, y: 13, pos: 'w', win: '<div>' + K('3(4)+1') + '</div><div>' + K('=13') + '</div>', say: `Inside, every ${T('x')} is replaced by ${T('4')}: ${T('3(4)+1=13')}.`, read: '“<b>f of 4 is 13</b>”' },
      { a: '0', o: '1', x: 0, y: 1, pos: 'e', win: '<div>' + K('3(0)+1') + '</div><div>' + K('=1') + '</div>' },
      { a: '-2', o: '-5', x: -2, y: -5, pos: 'e', win: '<div>' + K('3(-2)+1') + '</div><div>' + K('=-5') + '</div>' }
    ],
    end: `Each input with its output is a point ${T('(x,\\ f(x))')}. All of them lie on the line ${T('y=3x+1')}: the graph of ${T('f')}.`
  },
  K: {
    label: 'the keypad ' + T('K'), name: 'K', rule: 'K(\\text{letter})=\\text{its key}', v: '\\text{letter}',
    ins: [
      { a: '\\text{M}', o: '6', win: 'M is on the <b>MNO</b> key', say: 'M is printed on the MNO key, which is key 6.', read: '“<b>K of M is 6</b>”' },
      { a: '\\text{H}', o: '4', win: 'H is on the <b>GHI</b> key' },
      { a: '\\text{Z}', o: '9', win: 'Z is on the <b>WXYZ</b> key' }
    ],
    end: `Every letter goes in and exactly <b>one</b> key comes out, so ${T('K')} is a function. (Going <b>backwards</b> from a key can give several letters.)`
  },
  P: {
    label: T('P(t)=t^2'), name: 'P', rule: 'P(t)=t^2', v: 't', graph: { xmin: -5, xmax: 5, ymin: -2, ymax: 12 }, curve: (x) => x * x,
    ins: [
      { a: '3', o: '9', x: 3, y: 9, pos: 'e', win: '<div>' + K('(3)^2') + '</div><div>' + K('=9') + '</div>', say: `Inside, the ${T('t')} is replaced by ${T('3')}: ${T('(3)^2=9')}.`, read: '“<b>P of 3 is 9</b>”' },
      { a: '-3', o: '9', x: -3, y: 9, pos: 'w', win: '<div>' + K('(-3)^2') + '</div><div>' + K('=9') + '</div>' },
      { a: '0', o: '0', x: 0, y: 0, pos: 'se', win: '<div>' + K('(0)^2') + '</div><div>' + K('=0') + '</div>' }
    ],
    end: `Two inputs, ${T('3')} and ${T('-3')}, give the same output ${T('9')}. That is allowed: each input still has <b>one</b> output. Any letter can name a function, and the input can be any letter too.`
  }
};
const machine = {
  title: 'The function machine',
  height: 356,
  choices: Object.keys(MC).map((k) => ({ v: k, label: MC[k].label })),
  intro: 'An <b>input</b> goes in, the rule acts on it, and exactly <b>one output</b> comes out. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = MC[k], W = ex.W, MX = 186, MW = 280, MY = 18, MH = 222, BY = MY + MH / 2 - 36;
    const mach = add(stage, box(h('div', 'u5l7b-mach', `<div class="u5l7b-mname">${K(NM(d.name))}</div><div class="u5l7b-mrule">${K(d.rule)}</div><div class="u5l7b-mwin"></div>`), MW, MH), MX, MY);
    const win = mach.querySelector('.u5l7b-mwin');
    add(stage, h('div', 'u5l7b-mouth in'), MX - 18, BY + 4); add(stage, h('div', 'u5l7b-mouth out'), MX + MW - 4, BY + 4);
    add(stage, box(h('div', 'u5l7b-io', 'input'), 100, 24), 20, BY + 84); add(stage, box(h('div', 'u5l7b-io', 'output'), 100, 24), MX + MW + 18, BY + 84);
    const note = add(stage, box(h('div', 'u5l7b-note', ''), 560, 96), MX + MW / 2 - 280, 256);
    let G = null, log = null;
    if (d.graph) G = new Graph(stage, Object.assign({ x: W - 324, y: 8, width: 314, height: 338, ytitle: 'y' }, d.graph));
    else log = panel(stage, W - 324, 8, 314, 338, 'Letter → key');
    const pts = [];
    const notation = (r) => K(`${NM(d.name)}(${IN(r.a)})=${OUT(r.o)}`);
    const drop = async (c, i, q) => {
      stage.querySelectorAll('.u5l7b-ball').forEach((b) => b.remove()); win.innerHTML = '';
      const b = add(stage, h('div', 'u5l7b-ball in', K(d.ins[i].a)), 24, BY);
      await c.anim(b, [{ opacity: 0, transform: 'translateX(-30px)' }, { opacity: 1, transform: 'translateX(0)' }], q ? 200 : 320);
      await c.anim(b, [{ opacity: 1, transform: 'translateX(0) scale(1)' }, { opacity: 0, transform: 'translateX(150px) scale(.4)' }], q ? 380 : 650);
    };
    const work = async (c, i, q) => { win.innerHTML = d.ins[i].win; await Promise.all([fadeIn(c, win, q ? 220 : 380), pulse(c, mach, 1.03, q ? 300 : 460)]); };
    const out = async (c, i, q) => {
      const r = d.ins[i], b = add(stage, h('div', 'u5l7b-ball out', K(r.o)), MX + MW + 22, BY);
      await c.anim(b, [{ opacity: 0, transform: 'translateX(-70px) scale(.4)' }, { opacity: 1, transform: 'translateX(0) scale(1)' }], q ? 360 : 600);
      note.innerHTML = `<div class="u5l7b-nbig">${notation(r)}</div>` + (r.read ? `<div class="u5l7b-nread">read ${r.read}</div>` : '');
      await pop(c, note.firstChild, 380);
      if (G) { const p = G.point(r.x, r.y, { color: 'blue', coords: true, pos: r.pos, r: 7 }); pts.push(p); await G.reveal(p, c); }
      else { const l = line(log, notation(r), 'u5l7b-bigl'); await fadeIn(c, l); }
    };
    const r0 = d.ins[0];
    return [
      { cap: `This machine is called ${T(d.name)}. Its rule: ${T(d.rule)}.`, run: (c) => pulse(c, mach.firstChild, 1.25) },
      { cap: `Drop in the input ${T(r0.a)}.`, run: (c) => drop(c, 0) },
      { cap: r0.say, run: (c) => work(c, 0) },
      { cap: `Out comes ${T(r0.o)}. We write ${T(`${d.name}(${r0.a})=${r0.o}`)}, read ${r0.read}.`, run: (c) => out(c, 0) },
      { cap: `Two more inputs: ${T(`${d.name}(${d.ins[1].a})=${d.ins[1].o}`)} and ${T(`${d.name}(${d.ins[2].a})=${d.ins[2].o}`)}.`,
        run: async (c) => { for (const i of [1, 2]) { await drop(c, i, true); await work(c, i, true); await out(c, i, true); await sleep(c, 200); } } },
      { cap: d.end,
        run: async (c) => {
          if (G) { const L = G.fn(d.curve, { color: 'gray', width: 2.5, dash: true }); await G.drawIn(L, 900, c); }
          else { const s = stamp(log, 'Function', { ok: true }); s.style.alignSelf = 'center'; s.style.marginTop = '16px'; await stampIn(c, s); }
        } }
    ];
  }
};

/* ======================= explainer 2: reading the notation ======================= */
const AN = {
  f: {
    label: T('f(4)=13'), parts: ['f', '(4)', '13'],
    labs: ['the <b>name</b> of the function', 'the <b>input</b>: an <i>x</i>-value', 'the <b>output</b>: a <i>y</i>-value'], not: 'f\\times4',
    caps: [`${T('f')} is the <b>name</b> of the function. Other common names: ${T('g,\\ h,\\ P')}…`,
      `The brackets hold the <b>input</b>. ${T('f(4)')} does <b>not</b> mean ${T('f')} times 4.`,
      `After the equals sign comes the <b>output</b>: the value of the function.`],
    read: `Say it: “<b>f of 4 is 13</b>”. Or: the <b>image</b> of 4 under ${T('f')} is 13. On the graph: the point ${T('(4,\\ 13)')}.`
  },
  K: {
    label: T('K(\\text{M})=6'), parts: ['K', '(\\text{M})', '6'], labs: ['the <b>name</b>: the keypad rule', 'the <b>input</b>: a letter', 'the <b>output</b>: a key'],
    caps: [`${T('K')} is the name of the keypad rule from the warm-up.`, 'The brackets hold the <b>input</b>: the letter M.', 'The <b>output</b> is the key that M is printed on.'],
    read: 'Say it: “<b>K of M is 6</b>”. Put in the letter M, get out the key 6.'
  },
  P: {
    label: T('P(t)=t^2'), parts: ['P', '(t)', 't^2'], labs: ['the <b>name</b>', 'the <b>input variable</b>', 'the <b>rule</b> for the output'], not: 'P\\times t',
    caps: [`The function is named ${T('P')}.`, `Its input variable is ${T('t')} (it doesn’t have to be ${T('x')}). Again, not ${T('P')} times ${T('t')}.`, `Here the right side is a <b>formula</b> for the output.`],
    read: `${T('P(t)')} does double duty: a <b>formula</b>, and a <b>value</b> once you put in a number: ${T('P(3)=3^2=9')}.`
  }
};
const anatomy = {
  title: 'Reading function notation',
  height: 334,
  choices: Object.keys(AN).map((k) => ({ v: k, label: AN[k].label })),
  intro: 'Every piece of the notation has a job. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = AN[k], W = ex.W, cls = ['u5l7b-pn', 'u5l7b-pi', 'u5l7b-po'], colors = [PUR, BLU, AMB];
    const big = add(stage, box(h('div', 'u5l7b-big', K(`\\htmlClass{${cls[0]}}{${d.parts[0]}}\\htmlClass{${cls[1]}}{${d.parts[1]}}=\\htmlClass{${cls[2]}}{${d.parts[2]}}`)), W, 110), 0, 22);
    const svg = add(stage, svgEl('svg', { width: W, height: 330, class: 'u5l7b-ov' }), 0, 0);
    const readEl = add(stage, box(h('div', 'u5l7b-read', d.read), W - 60, 60), 30, 262); hide(readEl);
    const show = async (c, i) => {
      const part = big.querySelector('.' + cls[i]); part.classList.add('on');
      const r = rel(stage, part), cx = r.x + r.w / 2, lw = 270, lx = Math.round(W * (i + 0.5) / 3 - lw / 2);
      const html = d.labs[i] + (i === 1 && d.not ? `<div class="u5l7b-not">not ${K(d.not)} ✗</div>` : '');
      const lab = add(stage, box(h('div', 'u5l7b-alab', html), lw, 0), lx, 176); lab.style.height = 'auto'; lab.style.borderColor = colors[i]; lab.style.color = colors[i];
      const g = arrowLine(svg, [[cx, r.y + r.h + 4], [lx + lw / 2, 170]], colors[i], 3);
      await drawIn(g, 380, c); await fadeIn(c, lab, 320);
    };
    return [
      { cap: d.caps[0], run: (c) => show(c, 0) },
      { cap: d.caps[1], run: (c) => show(c, 1) },
      { cap: d.caps[2], run: (c) => show(c, 2) },
      { cap: d.read, run: (c) => fadeIn(c, readEl, 400) }
    ];
  }
};

/* ======================= explainer 3: one function, several representations ======================= */
const RP = {
  f: { label: 'Example 1(b) check', name: 'f', rule: 'f(x)=3x-2', fx: (x) => 3 * x - 2, dom: [-2, -1, 0, 1, 2], eg: 'f(-2)=3(-2)-2=-8',
    graph: { xmin: -3, xmax: 3, ymin: -9, ymax: 5 },
    end: `The domain is just five numbers, so the graph is <b>five separate dots</b>. Don’t join them: ${T('x=0.5')} is not in the domain.` },
  g: { label: 'Example 1(a) check', name: 'g', rule: 'g(x)=\\sqrt[3]{x}', fx: (x) => Math.round(Math.cbrt(x)), dom: [1, 8, 27, 64], eg: 'g(8)=\\sqrt[3]{8}=2',
    graph: { xmin: 0, xmax: 70, ymin: 0, ymax: 5, xstep: 10 },
    end: `Four inputs, four outputs, four dots. Each input has exactly one cube root, so ${T('g')} is a function.` },
  h: { label: T('h(x)=x^2') + ' demo', name: 'h', rule: 'h(x)=x^2', fx: (x) => x * x, dom: [-2, -1, 0, 1, 2], eg: 'h(-2)=(-2)^2=4',
    graph: { xmin: -3, xmax: 3, ymin: -1, ymax: 5 },
    end: `${T('h(-2)=h(2)=4')}: two inputs share an output, and ${T('h')} is <b>still a function</b>. Only <b>one input with two outputs</b> breaks the rule.` }
};
const represent = {
  title: 'One function, several representations',
  height: 470,
  choices: Object.keys(RP).map((k) => ({ v: k, label: RP[k].label })),
  intro: (k) => `${T(RP[k].rule)} with domain ${T('\\{' + RP[k].dom.join(',\\ ') + '\\}')}: a table, a range, an arrow diagram, ordered pairs and a graph. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = RP[k], W = ex.W, n = d.name, ys = d.dom.map(d.fx), rng = [...new Set(ys)].sort((a, b) => a - b);
    const rngTex = '\\{' + rng.join(',\\ ') + '\\}';
    add(stage, h('div', 'u5l7b-tag', K(d.rule)), 16, 4);
    const tb = new ValueTable(stage, { x: 16, y: 52, headers: ['x', n + '(x)'], rows: d.dom.map((x, i) => [x, ys[i]]), hide: 1, tap: false, cellW: 80, cellH: 50 });
    const rl = add(stage, box(h('div', 'u5l7b-rl', `range<br>${T(rngTex)}`), 176, 70), 12, 52 + 50 * (d.dom.length + 1) + 12); hide(rl);
    const M = new MappingDiagram(stage, { x: 196, y: 40, width: 250, height: 360, domain: d.dom, range: rng, pairs: d.dom.map((x, i) => [x, ys[i]]), arrows: false, titles: ['domain', 'range'], color: '#1f5bd6' });
    M.itemEls[1].forEach((e) => (e.style.opacity = 0));
    const P = panel(stage, 462, 40, 170, 300, 'Ordered pairs');
    const pl = d.dom.map((x, i) => { const e = line(P, T(pairTex(x, ys[i])), 'u5l7b-bigl'); e.style.opacity = 0; return e; });
    const G = new Graph(stage, Object.assign({ x: W - 318, y: 6, width: 308, height: 456, ytitle: n + '(x)' }, d.graph));
    return [
      { cap: `Evaluate ${T(n + '(x)')} at every number in the domain. For example, ${T(d.eg)}.`, run: (c) => tb.fill(c, { col: 1, stagger: 140 }) },
      { cap: `The outputs make up the <b>range</b>: ${T(rngTex)}.`, run: async (c) => { await Promise.all(M.itemEls[1].map((e, i) => pop(c, e, 360, { delay: i * 80 }))); await fadeIn(c, rl); } },
      { cap: '<b>Arrow diagram</b>: draw an arrow from each input to its output. Every input gets exactly <b>one</b> arrow.', run: (c) => M.drawArrows(c, { stagger: 80, ms: 420 }) },
      { cap: `<b>Ordered pairs</b> ${T('(x,\\ ' + n + '(x))')}: one for each row of the table.`,
        run: async (c) => { for (let i = 0; i < pl.length; i++) { tb.highlight(i, true); await fadeIn(c, pl[i], 260); await sleep(c, 80); tb.highlight(i, false); } } },
      { cap: '<b>Graph</b>: each ordered pair is a point.',
        run: async (c) => { for (let i = 0; i < d.dom.length; i++) { pl[i].classList.add('u5l7b-on'); await G.reveal(G.point(d.dom[i], ys[i], { color: 'blue', r: 7 }), c, 300); await sleep(c, 60); pl[i].classList.remove('u5l7b-on'); } } },
      { cap: d.end, run: async (c) => { const s = stamp(stage, k === 'h' ? 'Function ✓' : 'dots, not a line', { ok: k === 'h' ? true : null, x: W - (k === 'g' ? 200 : 236), y: k === 'h' ? 290 : 62, size: 'sm' }); await stampIn(c, s); } }
    ];
  }
};

/* ======================= explainer 4: forwards and backwards through the machine ======================= */
const FB = {
  f: { label: T('f(x)=3x+1'), rule: 'f(x)=3x+1', ops: ['\\times3', '+1'], undo: ['\\div3', '-1'],
    what: `${T('f(x)=3x+1')} does two things to ${T('x')}, in order: <b>multiply by 3</b>, then <b>add 1</b>.`,
    fq: 'f(4)', fwd: ['4', '12', '13'], bq: 'f(x)=-5', bwd: ['-5', '-6', '-2'],
    alg1: ['f(4)=3(4)+1', '=13'], alg2: ['3x+1=-5', '3x=-6', 'x=-2'], back: `So ${T('x=-2')}.`, check: 'f(-2)=3(-2)+1=-5' },
  g: { label: 'Example 4(d) check', rule: 'g(x)=5x-2', ops: ['\\times5', '-2'], undo: ['\\div5', '+2'],
    what: `${T('g(x)=5x-2')} does two things to ${T('x')}, in order: <b>multiply by 5</b>, then <b>subtract 2</b>.`,
    fq: 'g(2)', fwd: ['2', '10', '8'], bq: 'g(x)=18', bwd: ['18', '20', '4'],
    alg1: ['g(2)=5(2)-2', '=8'], alg2: ['5x-2=18', '5x=20', 'x=4'], back: `So ${T('x=4')}.`, check: 'g(4)=5(4)-2=18' },
  s: { label: 'Example 5 check', rule: 'f(x)=x^2-7', ops: ['\\square^2', '-7'], undo: ['\\pm\\sqrt{\\square}', '+7'],
    what: `${T('f(x)=x^2-7')} does two things to ${T('x')}, in order: <b>square it</b>, then <b>subtract 7</b>.`,
    fq: 'f(5)', fwd: ['5', '25', '18'], bq: 'f(x)=29', bwd: ['29', '36', '\\pm6'],
    alg1: ['f(5)=(5)^2-7', '=18'], alg2: ['x^2-7=29', 'x^2=36', 'x=\\pm6'], back: `Undoing a square gives <b>two</b> answers: ${T('6^2')} and ${T('(-6)^2')} are both 36. So ${T('x=\\pm6')}.`, check: 'f(\\pm6)=36-7=29' }
};
const machineFB = {
  title: 'Evaluate = forwards. Solve = backwards.',
  height: 400,
  choices: Object.keys(FB).map((k) => ({ v: k, label: FB[k].label })),
  intro: (k) => `To <b>evaluate</b>, push an input forwards through the machine. To <b>solve</b>, start from the output and run it backwards. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = FB[k], W = ex.W, R1 = 66, R2 = 262, BH = 74;
    const XS = { in: 18, o1: 176, o2: 376, out: 566 }, SW = 100, OW = 120;
    const svg = add(stage, svgEl('svg', { width: 690, height: 400, class: 'u5l7b-ov' }), 0, 0);
    const head1 = add(stage, h('div', 'u5l7b-rowh', `<b>Forwards</b>: evaluate ${T(d.fq)}`), 18, R1 - 46);
    const head2 = add(stage, h('div', 'u5l7b-rowh back', `<b>Backwards</b>: solve ${T(d.bq)}`), 18, R2 - 46); hide(head2);
    const slot = (x, y, cls) => add(stage, box(h('div', 'u5l7b-slotb ' + cls, ''), SW, BH), x, y);
    const op = (x, y, html, cls) => add(stage, box(h('div', 'u5l7b-op ' + cls, html), OW, BH), x, y);
    const fIn = slot(XS.in, R1, 'in'), fO1 = op(XS.o1, R1, K(d.ops[0]), ''), fO2 = op(XS.o2, R1, K(d.ops[1]), ''), fOut = slot(XS.out, R1, 'out');
    add(stage, h('div', 'u5l7b-mlab', K(d.rule)), XS.o1, R1 + BH + 6);
    const mid1 = add(stage, box(h('div', 'u5l7b-mid', K(d.fwd[1])), 80, 34), (XS.o1 + OW + XS.o2) / 2 - 40, R1 - 38); hide(mid1);
    const bIn = slot(XS.in, R2, 'in back'), bO1 = op(XS.o1, R2, K(d.undo[0]), 'back'), bO2 = op(XS.o2, R2, K(d.undo[1]), 'back'), bOut = slot(XS.out, R2, 'out back');
    const mid2 = add(stage, box(h('div', 'u5l7b-mid back', K(d.bwd[1])), 80, 34), (XS.o1 + OW + XS.o2) / 2 - 40, R2 - 38); hide(mid2);
    [bIn, bO1, bO2, bOut].forEach((e) => hide(e));
    const P = panel(stage, 706, 8, W - 718, 384, 'The algebra');
    const cy1 = R1 + BH / 2, cy2 = R2 + BH / 2;
    const fArrows = [[XS.in + SW + 4, XS.o1 - 6], [XS.o1 + OW + 4, XS.o2 - 6], [XS.o2 + OW + 4, XS.out - 6]];
    const fwd = async (c) => {
      fIn.innerHTML = K(d.fwd[0]); await pop(c, fIn.firstChild);
      for (let i = 0; i < 3; i++) {
        const a = arrowLine(svg, [[fArrows[i][0], cy1], [fArrows[i][1], cy1]], BLU); await drawIn(a, 300, c);
        if (i === 0) await pulse(c, fO1, 1.08); if (i === 0) await pop(c, mid1);
        if (i === 1) await pulse(c, fO2, 1.08);
        if (i === 2) { fOut.innerHTML = K(d.fwd[2]); await pop(c, fOut.firstChild, 420); }
      }
      for (const s of d.alg1) await fadeIn(c, line(P, K(s), 'u5l7b-fw'), 260);
    };
    const bwd = async (c) => {
      bOut.innerHTML = K(d.bwd[0]); await pop(c, bOut.firstChild);
      const segs = [[XS.out - 6, XS.o2 + OW + 4], [XS.o2 - 6, XS.o1 + OW + 4], [XS.o1 - 6, XS.in + SW + 4]];
      for (let i = 0; i < 3; i++) {
        const a = arrowLine(svg, [[segs[i][0], cy2], [segs[i][1], cy2]], AMB); await drawIn(a, 300, c);
        if (i === 0) { await pulse(c, bO2, 1.08); await pop(c, mid2); }
        if (i === 1) await pulse(c, bO1, 1.08);
        if (i === 2) { bIn.innerHTML = K(d.bwd[2]); bIn.classList.toggle('two', k === 's'); await pop(c, bIn.firstChild, 420); }
      }
      for (const s of d.alg2) await fadeIn(c, line(P, K(s), 'u5l7b-bw'), 260);
    };
    return [
      { cap: d.what, run: async (c) => { await pulse(c, fO1, 1.08); await pulse(c, fO2, 1.08); } },
      { cap: `<b>Evaluate</b> ${T(d.fq)}: go <b>forwards</b>. ${T(d.fwd[0])} → ${T(d.fwd[1])} → ${T(d.fwd[2])}, so ${T(d.fq + '=' + d.fwd[2])}.`, run: fwd },
      { cap: `<b>Solve</b> ${T(d.bq)}: now the <b>output</b> is known. Go <b>backwards</b>, undoing each step in <b>reverse</b> order: ${T(d.undo[1])} first, then ${T(d.undo[0])}.`,
        run: async (c) => { await fadeIn(c, head2); await Promise.all([bOut, bO2, bO1, bIn].map((e, i) => fadeIn(c, e, 300, { delay: i * 90 }))); } },
      { cap: `${T(d.bwd[0])} → ${T(d.bwd[1])} → ${T(d.bwd[2])}. ${d.back}`, run: bwd },
      { cap: `Check by going forwards: ${T(d.check)} ✓`, run: async (c) => { const l = line(P, K(d.check) + ' ✓', 'u5l7b-ck'); await fadeIn(c, l); const s = stamp(stage, 'checks out', { ok: true, x: 340, y: 372, size: 'sm' }); await stampIn(c, s); } }
    ];
  }
};

/* ======================= explainer 5: substituting a number ======================= */
const F2 = [`f(x)=${X}^2+3`, `g(x)=5-${X}`], F3 = [`f(x)=4${X}^3-3${X}`];
const SB = {
  demo: { label: 'Demo: ' + T('h(-2)'), funcs: [`h(x)=2${X}^2-${X}`], use: [0], ask: 'h(-2)', ans: '10',
    lines: [[`h(-2)=2${S('-2')}^2-${S('-2')}`, `Replace <b>every</b> ${T('x')} with ${T('(-2)')}, <b>in brackets</b>.`],
      ['=2(4)+2', `Powers first: ${T('(-2)^2=4')}. Subtracting ${T('-2')} is adding 2.`], ['=8+2', 'Multiply.'], ['=10', 'Add.']],
    keys: '2 × ( (−) 2 ) x² − ( (−) 2 ) =' },
  a2: { sep: 'Example 2', label: '(a)', funcs: F2, use: [0], ask: 'f(4)', ans: '19',
    lines: [[`f(4)=${S('4')}^2+3`, `Put ${T('4')} into the slot of ${T('f')}.`], ['=16+3', `${T('4^2=16')}.`], ['=19', 'Add.']], keys: '4 x² + 3 =' },
  b2: { label: '(b)', funcs: F2, use: [1], ask: 'g(2)', ans: '3',
    lines: [[`g(2)=5-${S('2')}`, `This time the rule is ${T('g')}: put ${T('2')} into its slot.`], ['=3', 'Subtract.']], keys: '5 − 2 =' },
  c2: { label: '(c)', funcs: F2, use: [0], ask: 'f(-3)', ans: '12',
    lines: [[`f(-3)=${S('-3')}^2+3`, `The brackets keep the negative <b>inside</b> the square.`], ['=9+3', `${T('(-3)^2=9')}, not ${T('-9')}.`], ['=12', 'Add.']], keys: '( (−) 3 ) x² + 3 =' },
  d2: { label: '(d)', funcs: F2, use: [1], ask: 'g(-1)', ans: '6',
    lines: [[`g(-1)=5-${S('-1')}`, `Put ${T('-1')} into the slot of ${T('g')}, in brackets.`], ['=5+1', 'Subtracting a negative is adding.'], ['=6', 'Add.']], keys: '5 − (−) 1 =' },
  e2: { label: '(e)', funcs: F2, use: [0, 1], ask: 'f(0)-g(0)', ans: '-2',
    lines: [[`f(0)=${S('0')}^2+3=3`, 'Two different functions: find each value <b>first</b>.'], [`g(0)=5-${S('0')}=5`, `Now ${T('g(0)')}.`], ['f(0)-g(0)=3-5', 'Then subtract the values.'], ['=-2', '']],
    keys: '0 x² + 3 − ( 5 − 0 ) =' },
  a3: { sep: 'Example 3', label: '(a)', funcs: F3, use: [0], ask: 'f(-2)', ans: '-26',
    lines: [[`f(-2)=4${S('-2')}^3-3${S('-2')}`, `Both ${T('x')}’s get ${T('(-2)')}.`], ['=4(-8)+6', `${T('(-2)^3=-8')} and ${T('-3(-2)=+6')}.`], ['=-32+6', 'Multiply.'], ['=-26', 'Add.']],
    keys: '4 × ( (−) 2 ) x³ − 3 × ( (−) 2 ) =' },
  b3: { label: '(b)', funcs: F3, use: [0], ask: 'f(3)', ans: '99', read: `“The value of ${T('f')} when ${T('x=3')}” means ${T('f(3)')}.`,
    lines: [[`f(3)=4${S('3')}^3-3${S('3')}`, 'Put 3 into both slots.'], ['=4(27)-9', `${T('3^3=27')}.`], ['=108-9', 'Multiply.'], ['=99', 'Subtract.']], keys: '4 × 3 x³ − 3 × 3 =' },
  c3: { label: '(c)', funcs: F3, use: [0], ask: 'f(5)', ans: '485', read: `“The image of 5 under ${T('f')}” means ${T('f(5)')}.`,
    lines: [[`f(5)=4${S('5')}^3-3${S('5')}`, 'Put 5 into both slots.'], ['=4(125)-15', `${T('5^3=125')}.`], ['=500-15', 'Multiply.'], ['=485', 'Subtract.']], keys: '4 × 5 x³ − 3 × 5 =' }
};
const SBchoices = []; Object.keys(SB).forEach((k) => { if (SB[k].sep) SBchoices.push({ sep: SB[k].sep }); SBchoices.push({ v: k, label: SB[k].label }); });
const substitute = {
  title: 'Evaluate: every x gets the input, in brackets',
  height: 380,
  choices: SBchoices,
  intro: (k) => `Find ${T(SB[k].ask)}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SB[k], W = ex.W, LH = 54;
    const fl = d.funcs.map((f, i) => add(stage, h('div', 'u5l7b-fx', K(f)), 26, 14 + i * 50));
    const y0 = 14 + d.funcs.length * 50 + 18;
    const ls = d.lines.map((l, i) => { const e = add(stage, h('div', 'u5l7b-ln', KL(l[0])), 26 + (l[0][0] === '=' ? 40 : 0), y0 + i * LH); hide(e); return e; });
    const P = panel(stage, W - 300, 10, 288, 360, 'Find');
    line(P, K(d.ask), 'u5l7b-ask'); if (d.read) line(P, d.read, 'u5l7b-small');
    const kk = h('div', 'u5l7b-keys', `<div class="u5l7b-ph">TI-30XIIS</div>${keysHTML(d.keys)}`); P.appendChild(kk); hide(kk);
    const slots = d.use.flatMap((i) => [...fl[i].querySelectorAll('.u5l7b-slot')]);
    const steps = [{ cap: (d.read ? d.read + ' ' : '') + `Every ${T('x')} in the rule is a <b>slot</b> for the input.`, run: async (c) => { slots.forEach((s) => s.classList.add('on')); await Promise.all(slots.map((s) => pulse(c, s, 1.3))); } }];
    d.lines.forEach((l, i) => {
      const last = i === d.lines.length - 1;
      steps.push({ cap: (l[1] || 'So') + (last ? ` <b>${T(d.ask + '=' + d.ans)}</b>` : ''),
        run: async (c) => {
          await fadeIn(c, ls[i], 380);
          if (i === 0) { const subs = [...ls[0].querySelectorAll('.u5l7b-sub')]; await Promise.all(subs.map((s) => pulse(c, s, 1.15))); }
          if (last) { ls[i].classList.add('ansline'); await pop(c, ls[i], 360); await fadeIn(c, kk, 400); }
        } });
    });
    return steps;
  }
};

/* ======================= explainer 6: an expression as the input (linear) ======================= */
const LE = {
  a: { label: 'Example 4(a)', ask: 'g(a)', inp: 'a',
    lines: [[`g(a)=5${S('a')}-2`, `Replace ${T('x')} with ${T('a')}.`], ['=5a-2', `Tidy up: ${T('5(a)')} is ${T('5a')}.`]],
    ck: { at: 'a=3', L: ['g(a)', 'g(3)', '5(3)-2', '13'], R: ['5a-2', '5(3)-2', '15-2', '13'], ok: true }, ckCap: `Check with ${T('a=3')}: ${T('g(3)')} and ${T('5a-2')} must agree.` },
  b: { label: 'Example 4(b)', ask: 'g(3t)', inp: '3t',
    lines: [[`g(3t)=5${S('3t')}-2`, `The input is an <b>expression</b>, ${T('3t')}. It goes into the slot, in brackets.`], ['=15t-2', `${T('5(3t)=15t')}.`]],
    ck: { at: 't=2', L: ['g(3t)', 'g(6)', '5(6)-2', '28'], R: ['15t-2', '15(2)-2', '30-2', '28'], ok: true }, ckCap: `Check with ${T('t=2')}: then ${T('3t=6')}, so the left side is ${T('g(6)')}.` },
  c: { label: 'Example 4(c)', ask: 'g(a+1)', inp: 'a+1',
    lines: [[`g(a+1)=5${S('a+1')}-2`, `The <b>whole</b> input ${T('a+1')} goes into the slot, in brackets.`], ['=5a+5-2', 'Distribute: the 5 multiplies <b>both</b> terms.'], ['=5a+3', 'Collect like terms.']],
    ck: { at: 'a=2', L: ['g(a+1)', 'g(3)', '5(3)-2', '13'], R: ['5a+3', '5(2)+3', '10+3', '13'], ok: true }, ckCap: `Check with ${T('a=2')}: then ${T('a+1=3')}, so the left side is ${T('g(3)')}.` },
  oops: { label: 'Missing brackets?', ask: 'g(a+1)', inp: 'a+1', bad: true,
    lines: [['g(a+1)=5a+1-2', `A classic slip: no brackets, so the 5 only multiplies the ${T('a')}.`], ['=5a-1', 'Collect like terms…']],
    ck: { at: 'a=2', L: ['g(a+1)', 'g(3)', '5(3)-2', '13'], R: ['5a-1', '5(2)-1', '10-1', '9'], ok: false },
    ckCap: `…and the check with ${T('a=2')} fails: 13 is not 9. With brackets, ${T('5(a+1)-2=5a+3')}.` }
};
const linearExpr = {
  title: 'An expression as the input',
  height: 330,
  choices: Object.keys(LE).map((k) => ({ v: k, label: LE[k].label })),
  intro: (k) => `For ${T('g(x)=5x-2')}, find an expression for ${T(LE[k].ask)}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = LE[k], W = ex.W, LH = 58;
    const fx = add(stage, h('div', 'u5l7b-fx', K(`g(x)=5${X}-2`)), 26, 16);
    const tag = add(stage, h('div', 'u5l7b-intag', 'input: ' + K(d.inp)), 300, 20); hide(tag);
    const ls = d.lines.map((l, i) => { const e = add(stage, h('div', 'u5l7b-ln' + (d.bad && i === 0 ? ' u5l7b-bad' : ''), KL(l[0])), 26 + (i ? 58 : 0), 86 + i * LH); hide(e); return e; });
    const card = checkCard(stage, { at: d.ck.at, left: d.ck.L, right: d.ck.R, ok: d.ck.ok, x: W - 404, y: 14, width: 392, hidden: true });
    const steps = [{ cap: `The rule has one slot for the input. Here the input is ${T(d.inp)}.`, run: async (c) => { fx.querySelector('.u5l7b-slot').classList.add('on'); await pop(c, tag); } }];
    d.lines.forEach((l, i) => steps.push({ cap: l[1], run: async (c) => { await fadeIn(c, ls[i]); if (i === d.lines.length - 1 && !d.bad) ls[i].classList.add('ansline'); } }));
    steps.push({ cap: d.ckCap, run: (c) => card.play(c) });
    return steps;
  }
};

/* ======================= explainer 7: forwards and backwards on the graph ======================= */
const GF = {
  lin: { label: 'Line: Example 4(d) check', n: 'g', f: (x) => 5 * x - 2, tex: 'g(x)=5x-2', win: { xmin: -3, xmax: 6, ymin: -4, ymax: 20, ystep: 2 },
    shape: 'line', a: 2, b: 18, xs: [4], lab: [3.9, 13], lpos: 'e', back: `${T('x=4')}: one answer.` },
  par: { label: 'Parabola: Example 5 check', n: 'f', f: (x) => x * x - 7, tex: 'f(x)=x^2-7', win: { xmin: -8, xmax: 8, ymin: -10, ymax: 42, ystep: 5 },
    shape: 'parabola', a: 5, b: 29, xs: [-6, 6], lab: [-0.4, 11], lpos: 'w', back: `${T('x=-6')} <b>or</b> ${T('x=6')}: the line meets the graph <b>twice</b>.`, extra: 38 }
};
const graphFB = {
  title: 'Forwards and backwards on the graph',
  height: 470,
  choices: Object.keys(GF).map((k) => ({ v: k, label: GF[k].label })),
  intro: (k) => `The graph of ${T(GF[k].tex)}. Inputs on the <b>horizontal</b> axis, outputs on the <b>vertical</b> axis. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = GF[k], W = ex.W, n = d.n, fa = d.f(d.a);
    const G = new Graph(stage, Object.assign({ x: 10, y: 8, width: 470, height: 454, ytitle: 'y' }, d.win));
    const P = panel(stage, 500, 8, W - 512, 454, 'Read from the graph');
    const r = d.extra ? Math.sqrt(d.extra + 7) : 0;
    const steps = [
      { cap: `Draw the graph: a <b>${d.shape}</b>.`, run: async (c) => { const L = G.fn(d.f, { color: 'teal' }); await G.drawIn(L, 900, c); G.label(d.lab[0], d.lab[1], T(d.tex), { pos: d.lpos, color: 'teal', cls: 'bk-ptlab' }); } },
      { cap: `<b>Forwards</b>: evaluate ${T(n + '(' + d.a + ')')}. Start at ${T('x=' + d.a)} and go <b>up</b> to the graph…`,
        run: async (c) => { await G.reveal(G.point(d.a, 0, { color: 'blue', r: 6 }), c); await G.drawIn(G.segment([d.a, 0], [d.a, fa], { color: 'blue', arrowB: true, width: 3.5 }), 600, c); await G.reveal(G.point(d.a, fa, { color: 'blue', r: 7 }), c); } },
      { cap: `…then <b>across</b> to the vertical axis: ${T(n + '(' + d.a + ')=' + fa)}.`,
        run: async (c) => { await G.drawIn(G.segment([d.a, fa], [0, fa], { color: 'blue', arrowB: true, width: 3.5 }), 600, c); G.label(0, fa, T(String(fa)), { pos: d.a > 0 ? 'w' : 'e', color: 'blue', cls: 'bk-pill' }); await fadeIn(c, line(P, `<b>Forwards</b><br>${T(n + '(' + d.a + ')=' + fa)}`, 'u5l7b-fw')); } },
      { cap: `<b>Backwards</b>: solve ${T(n + '(x)=' + d.b)}. Start at ${T(String(d.b))} on the vertical axis and go <b>across</b> to the graph…`,
        run: async (c) => {
          await G.reveal(G.point(0, d.b, { color: 'amber', r: 6 }), c);
          await Promise.all(d.xs.map((x) => G.drawIn(G.segment([0, d.b], [x, d.b], { color: 'amber', arrowB: true, width: 3.5 }), 600, c)));
          await Promise.all(d.xs.map((x) => G.reveal(G.point(x, d.b, { color: 'amber', r: 7 }), c)));
        } },
      { cap: `…then <b>down</b> to the horizontal axis: ${d.back}`,
        run: async (c) => {
          await Promise.all(d.xs.map((x) => G.drawIn(G.segment([x, d.b], [x, 0], { color: 'amber', arrowB: true, width: 3.5 }), 700, c)));
          d.xs.forEach((x) => G.label(x, 0, T(String(x)), { pos: 's', color: 'amber', cls: 'bk-pill' }));
          await fadeIn(c, line(P, `<b>Backwards</b><br>${T(n + '(x)=' + d.b)}<br>${T('x=' + (d.xs.length > 1 ? '\\pm' + Math.abs(d.xs[0]) : d.xs[0]))}`, 'u5l7b-bw'));
        } }
    ];
    if (d.extra) steps.push({
      cap: `Example 5(c): ${T('f(t)=38')} with ${T('t>0')}. Across at 38 meets the graph at ${T('t=\\pm\\sqrt{45}=\\pm3\\sqrt5\\approx\\pm6.71')}, but only the positive one counts: ${T('t=3\\sqrt5')}.`,
      run: async (c) => {
        await Promise.all([-r, r].map((x) => G.drawIn(G.segment([0, d.extra], [x, d.extra], { color: 'purple', width: 3, dash: true }), 500, c)));
        await Promise.all([-r, r].map((x) => G.reveal(G.point(x, d.extra, { color: x < 0 ? 'gray' : 'purple', r: 7 }), c)));
        const no = G.label(-r, d.extra, '✗', { pos: 'se', color: 'red', cls: 'u5l7b-x' }); await pop(c, no);
        await G.drawIn(G.segment([r, d.extra], [r, 0], { color: 'purple', arrowB: true, width: 3 }), 600, c);
        G.label(r, 0, T('3\\sqrt5'), { pos: 'se', color: 'purple', cls: 'bk-pill' });
        await fadeIn(c, line(P, `<b>Example 5(c)</b><br>${T('t^2=45')}<br>${T('t=3\\sqrt5')} ${T('(t>0)')}`, 'u5l7b-exl'));
      }
    });
    return steps;
  }
};

/* ======================= explainer 8 (Extension): mapping notation ======================= */
const MN = {
  f: { label: T('f: x\\to 3x+1'), rows: [['f: x\\to 3x+1', 'f(x)=3x+1', 'y=3x+1'], ['f: 4\\to 13', 'f(4)=13', 'y=13']], r1: '“f maps x to 3x + 1”', r2: '“f maps 4 to 13”', a: '4', pt: '(4,\\ 13)' },
  e5: { label: T('f: x\\to x^2-7'), rows: [['f: x\\to x^2-7', 'f(x)=x^2-7', 'y=x^2-7'], ['f: 5\\to 18', 'f(5)=18', 'y=18']], r1: '“f maps x to x² − 7”', r2: '“f maps 5 to 18”', a: '5', pt: '(5,\\ 18)' }
};
const mapNote = {
  title: 'Extension: three ways to write the same rule',
  height: 300,
  choices: Object.keys(MN).map((k) => ({ v: k, label: MN[k].label })),
  intro: 'Mapping notation, function notation and the equation of the graph all say the same thing. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = MN[k], W = ex.W, cw = Math.floor((W - 60) / 3), heads = ['mapping notation', 'function notation', 'equation of the graph'];
    const cell = (r, ci, html, cls = '') => { const e = add(stage, box(h('div', 'u5l7b-mn ' + cls, html), cw - 16, 64), 22 + ci * cw, 66 + r * 84); hide(e); return e; };
    const H = heads.map((t, ci) => cell(-0.7, ci, t, 'hd'));
    const C = d.rows.map((row, r) => row.map((t, ci) => cell(r, ci, K(t), ci === 0 ? 'map' : '')));
    const note = add(stage, box(h('div', 'u5l7b-read', `All three put the point ${T(d.pt)} on the graph.`), W - 60, 40), 30, 250); hide(note);
    return [
      { cap: `<b>Mapping notation</b>: ${T(d.rows[0][0])} is read ${d.r1}.`, run: async (c) => { await fadeIn(c, H[0]); await fadeIn(c, C[0][0]); } },
      { cap: 'The same rule in function notation, and as the equation of the graph.', run: async (c) => { for (const ci of [1, 2]) { await fadeIn(c, H[ci], 260); await fadeIn(c, C[0][ci], 320); } } },
      { cap: `${T(d.rows[1][0])} is read ${d.r2}: the input ${d.a} is sent to the output.`, run: (c) => fadeIn(c, C[1][0]) },
      { cap: `It says exactly what ${T(d.rows[1][1])} says: the point ${T(d.pt)} is on the graph.`, run: async (c) => { await fadeIn(c, C[1][1], 320); await fadeIn(c, C[1][2], 320); await fadeIn(c, note); } }
    ];
  }
};

/* ======================= explainer 9 (Extension): expressions into non-linear functions ======================= */
const NL = {
  demo: { label: 'Demo: ' + T('f(x+2)') + ' for ' + T('f(x)=x^2'), f: `f(x)=${X}^2`, inp: 'x+2',
    lines: [[`f(x+2)=${S('x+2')}^2`, `Replace ${T('x')} with the <b>whole</b> expression, in brackets.`], ['=(x+2)(x+2)', 'Squaring means multiplying it by itself.'],
      ['=x^2+2x+2x+4', 'Expand.'], ['=x^2+4x+4', 'Collect like terms.']],
    ck: { at: 'x=1', L: ['f(x+2)', 'f(3)', '3^2', '9'], R: ['x^2+4x+4', '1^2+4(1)+4', '1+4+4', '9'] }, warn: `Not ${T('x^2+4')}: at ${T('x=1')} that gives 5, not 9.` },
  a6: { label: 'Example 6(a)', f: `f(x)=4${X}^3-3${X}`, inp: 'a',
    lines: [[`f(a)=4${S('a')}^3-3${S('a')}`, `Replace every ${T('x')} with ${T('a')}.`], ['=4a^3-3a', 'Nothing to expand: just tidy up.']],
    ck: { at: 'a=2', L: ['f(a)', 'f(2)', '4(8)-3(2)', '26'], R: ['4a^3-3a', '4(2)^3-3(2)', '32-6', '26'] } },
  b6: { label: 'Example 6(b)', f: `f(x)=4${X}^3-3${X}`, inp: '3x',
    lines: [[`f(3x)=4${S('3x')}^3-3${S('3x')}`, `Replace every ${T('x')} with ${T('(3x)')}.`], ['=4(27x^3)-9x', `The cube applies to the 3 <b>and</b> the ${T('x')}: ${T('(3x)^3=27x^3')}.`], ['=108x^3-9x', 'Multiply.']],
    ck: { at: 'x=1', L: ['f(3x)', 'f(3)', '4(27)-9', '99'], R: ['108x^3-9x', '108(1)^3-9(1)', '108-9', '99'] }, warn: `Without brackets, ${T('4\\cdot3x^3=12x^3')} would give ${T('12-9=3')}, not 99.` },
  e7: { label: 'Example 7', f: `P(x)=3${X}^2-5${X}+2`, inp: 'x+2',
    lines: [[`P(x+2)=3${S('x+2')}^2-5${S('x+2')}+2`, `Replace every ${T('x')} with ${T('(x+2)')}.`], ['=3(x^2+4x+4)-5(x+2)+2', `${T('(x+2)^2=x^2+4x+4')}.`],
      ['=3x^2+12x+12-5x-10+2', 'Distribute the 3 and the −5.'], ['=3x^2+7x+4', 'Collect like terms.']],
    ck: { at: 'x=1', L: ['P(x+2)', 'P(3)', '27-15+2', '14'], R: ['3x^2+7x+4', '3(1)+7(1)+4', '3+7+4', '14'] } }
};
const nonlinearSub = {
  title: 'Extension: an expression into a non-linear function',
  height: 400,
  choices: Object.keys(NL).map((k) => ({ v: k, label: NL[k].label })),
  intro: (k) => `For ${T(NL[k].f.replace(/\\htmlClass\{u5l7b-slot\}\{x\}/g, 'x'))}, put in ${T(NL[k].inp)}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = NL[k], W = ex.W, LH = 56;
    const fx = add(stage, h('div', 'u5l7b-fx', K(d.f)), 22, 14);
    const ls = d.lines.map((l, i) => { const e = add(stage, h('div', 'u5l7b-ln sm', KL(l[0])), 22 + (i ? 40 : 0), 84 + i * LH); hide(e); return e; });
    const card = checkCard(stage, { at: d.ck.at, left: d.ck.L, right: d.ck.R, ok: true, x: W - 392, y: 14, width: 380, hidden: true });
    const warn = d.warn ? add(stage, box(h('div', 'u5l7b-warn', '✗ ' + d.warn), 380, 0), W - 392, 300) : null;
    if (warn) { warn.style.height = 'auto'; hide(warn); }
    const steps = [{ cap: `Every ${T('x')} is a slot. The input this time is ${T(d.inp)}.`, run: async (c) => { const s = [...fx.querySelectorAll('.u5l7b-slot')]; s.forEach((e) => e.classList.add('on')); await Promise.all(s.map((e) => pulse(c, e, 1.3))); } }];
    d.lines.forEach((l, i) => steps.push({ cap: l[1], run: async (c) => { await fadeIn(c, ls[i]); if (i === d.lines.length - 1) ls[i].classList.add('ansline'); } }));
    steps.push({ cap: `Check with ${T(d.ck.at)}: both sides must give the same number.` + (d.warn ? ' ' + d.warn : ''), run: async (c) => { await card.play(c); if (warn) await fadeIn(c, warn); } });
    return steps;
  }
};

/* ======================= warm-up: the phone keypad ======================= */
const PAD = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ' };
function mountWarm() {
  const host = document.getElementById('wu'); if (!host) return;
  const keys = [...host.querySelectorAll('.u5l7b-key')], scr = host.querySelector('.u5l7b-scr'), out = host.querySelector('.u5l7b-kout');
  const keyOf = (L) => Object.keys(PAD).find((k) => PAD[k].includes(L));
  const clear = () => keys.forEach((b) => b.classList.remove('on', 'hot'));
  keys.forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.k, on = !b.classList.contains('on'); clear(); if (!on) { out.innerHTML = 'Tap a key to go <b>backwards</b>: which letters give that key?'; return; }
    b.classList.add('on');
    const L = PAD[k];
    out.innerHTML = L ? `Backwards from key ${k}: ${L.split('').map((x) => K(`K(\\text{${x}})`)).join(', ')} all equal ${K(k)}. <b>${L.length} letters.</b>` : `Key ${k} has <b>no</b> letters.`;
  }));
  let busy = false;
  host.querySelector('[data-dial]').addEventListener('click', async () => {
    if (busy) return; busy = true; const c = liveCtx(), word = 'TACO';
    clear(); scr.innerHTML = '555-<span>TACO</span>';
    let digits = '';
    for (const L of word) {
      const k = keyOf(L), b = keys.find((x) => x.dataset.k === k); b.classList.add('hot');
      digits += k; scr.innerHTML = `555-${digits}<span>${word.slice(digits.length)}</span>`;
      out.innerHTML = `${K(`K(\\text{${L}})=${k}`)}`;
      await pulse(c, b, 1.12); await c.sleep(420); b.classList.remove('hot');
    }
    out.innerHTML = `Dial <b>555-8226</b>: ${K('K(\\text{T})=8,\\ K(\\text{A})=2,\\ K(\\text{C})=2,\\ K(\\text{O})=6')}`;
    busy = false;
  });
  host.querySelector('[data-undial]').addEventListener('click', () => { clear(); scr.innerHTML = '555-<span>TACO</span>'; out.innerHTML = 'Tap a key to go <b>backwards</b>: which letters give that key?'; });
}

/* ======================= Example 1 figures ======================= */
function mountFigures() {
  const dom = [-2, -1, 0, 1, 2], ys = dom.map((x) => 3 * x - 2);
  const el = (id) => document.getElementById(id);
  if (el('ex1-map')) new MappingDiagram(el('ex1-map'), { width: 250, height: 330, domain: dom, range: [], pairs: [], titles: ['domain', 'range'] });
  if (el('ex1-grid')) new Graph(el('ex1-grid'), { width: 270, height: 440, xmin: -3, xmax: 3, ymin: -9, ymax: 5, ytitle: 'f(x)' });
  if (el('ex1-map-a')) new MappingDiagram(el('ex1-map-a'), { width: 220, height: 280, domain: dom, range: ys, pairs: dom.map((x, i) => [x, ys[i]]), titles: ['domain', 'range'], color: RED });
  if (el('ex1-grid-a')) { const G = new Graph(el('ex1-grid-a'), { width: 230, height: 360, xmin: -3, xmax: 3, ymin: -9, ymax: 5, ytitle: 'f(x)' }); dom.forEach((x, i) => G.point(x, ys[i], { color: 'red', r: 6 })); }
}

mountFigures();
mountWarm();
export const explainers = mountExplainers({ machine, anatomy, represent, machineFB, substitute, linearExpr, graphFB, mapNote, nonlinearSub });
export const _test = { MC, RP, FB, SB, LE, GF, NL, OK };
