/* Math 10C · Unit 8 · Lesson 4 — Solving Word Problems with Systems of Equations.
 * Warm-up: Maya and Leo on a time slider (the age gap stays 8, the "times as old" shrinks).
 * Explainers:
 *   pipeline (star; also ex1chk … ex5chk): a word problem's phrases light up and fly into a "let" card and an
 *     organizing table; each table row becomes an equation; the system is solved; the answer is checked against the story.
 *   method (Step 3: which method? the booklet's three-row table as a flowchart with ✓ / ✗ / maybe stamps),
 *   step4 (check in BOTH equations with checkCards, then against the words: whole, positive, right question),
 *   translate (word tiles drop into algebra slots; "more than" / "less than" lines cross),
 *   rect (walk the fence, halve it, the length built from w-pieces, the half-fence strip, solve),
 *   swap (count vs value: start with all fives and swap five-for-twenty until the value is right),
 *   interest (percent → decimal, principal bar with a sliding split, interest meter, the 3¢-per-dollar argument),
 *   rates (time line and output line on a graph: a point on one line only, then the crossing).
 * Colours: Eq. 1 blue, Eq. 2 amber, solution purple, unknowns teal. */
import {
  h, tex, add, box, fit, Graph, Flowchart, stamp, stampIn, checkCard, mountExplainers, pop, fadeIn, appear, sleep,
  tween, pulse, svgEl, liveCtx, drawIn, COLORS, fmt
} from '../blocks.js';

const BLUE = COLORS.blue, AMB = COLORS.amber, PUR = COLORS.purple, TEAL = COLORS.teal, RED = COLORS.red, GRN = COLORS.green, INK = COLORS.ink;
/* \B{…} blue (Eq. 1), \A{…} amber (Eq. 2), \P{…} purple (solution) */
const colz = (s) => String(s).replace(/\\B\{/g, `\\textcolor{${BLUE}}{`).replace(/\\A\{/g, `\\textcolor{${AMB}}{`).replace(/\\P\{/g, `\\textcolor{${PUR}}{`);
const T = (s) => tex(colz(s));
const NB = ' ';
/* the booklet's spacing: a thin space only from 10 000 up (2340, 36 000) */
const f5 = (v) => (Math.abs(v) >= 10000 ? fmt(v) : String(v));
const money = (v) => '$' + f5(v);
const tnum = (v) => f5(v).replace(/\u202f/g, '\\,');
const show = (c, el, ms = 320) => fadeIn(c, el, ms);
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
function panel(stage, x, y, w, hh, title, cls = '') {
  const p = add(stage, box(h('div', 'u8l4-panel ' + cls), w, hh), x, y);
  if (title) p.appendChild(h('div', 'u8l4-ph', title));
  return p;
}
const live = (p) => { p.classList.remove('u8l4-idle'); p.classList.add('u8l4-live'); };
function rel(stage, el) {
  const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / (stage.offsetWidth || s.width) || 1;
  return { x: (r.left - s.left) / k - stage.clientLeft, y: (r.top - s.top) / k - stage.clientTop, w: r.width / k, h: r.height / k };
}
/** ghosts of the `froms` elements fly to `to` and fade there */
async function fly(c, stage, froms, to, o = {}) {
  if (c.fast || !to || !froms.length) return;
  const t = rel(stage, to), jobs = [];
  froms.forEach((f, i) => {
    const r = rel(stage, f);
    const g = add(stage, h('div', 'u8l4-ghost', o.html || f.innerHTML), r.x, r.y);
    if (o.color) g.style.setProperty('--gc', o.color);
    const gw = g.offsetWidth, gh = g.offsetHeight;
    const dx = t.x + t.w / 2 - gw / 2 - r.x, dy = t.y + t.h / 2 - gh / 2 - r.y;
    jobs.push(c.anim(g, [{ transform: 'translate(0px,0px)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 0.9, offset: 0.8 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }], o.ms || 800, { delay: i * 90 }).then(() => g.remove()));
  });
  await Promise.all(jobs);
}
const parseStory = (s) => s.replace(/\[\[([\w ]+)\|([^\]]+)\]\]/g, (m, k, t) => `<span class="u8l4-phr" data-k="${k}">${t}</span>`);
const spans = (root, k) => [...root.querySelectorAll(`[data-k~="${k}"]`)];
const HL = { q: 'u8l4-hq', u1: 'u8l4-hu', u2: 'u8l4-hu', f1: 'u8l4-h1', f2: 'u8l4-h2' };
const hl = (root, k) => { const l = spans(root, k); l.forEach((e) => e.classList.add(HL[k])); return l; };

/* =============================== warm-up: how old am I? =============================== */
function mountWarm() {
  const host = document.getElementById('u8l4-ages'); if (!host) return;
  const P = [{ name: 'Maya', age: 12, cls: 'u8l4-maya' }, { name: 'Leo', age: 4, cls: 'u8l4-leo' }];
  const TIMES = [{ t: -4, lab: '4 years ago' }, { t: 0, lab: 'Now' }, { t: 4, lab: 'In 4 years' }, { t: 12, lab: 'In 12 years' }];
  const btns = h('div', 'u8l4-tbtns');
  const scene = h('div', 'u8l4-scene');
  const read = h('div', 'u8l4-read');
  host.append(btns, scene, read);
  const hgt = (a) => 170 - 136 * Math.exp(-a / 7);
  const figs = P.map((p) => {
    const f = h('div', 'u8l4-fig ' + p.cls, `<div class="u8l4-badge"><b>${p.name}</b> <span class="u8l4-age"></span></div><div class="u8l4-body"><div class="u8l4-head"></div><div class="u8l4-torso"></div></div>`);
    scene.appendChild(f);
    return { f, p, age: f.querySelector('.u8l4-age'), body: f.querySelector('.u8l4-body') };
  });
  scene.appendChild(h('div', 'u8l4-ground'));
  const dif = h('div', 'u8l4-rd u8l4-rd1'), rat = h('div', 'u8l4-rd u8l4-rd2'), when = h('div', 'u8l4-when');
  read.append(when, dif, rat);
  const set = (t) => {
    const lab = TIMES.find((x) => x.t === t).lab;
    when.textContent = lab;
    figs.forEach((F) => {
      const a = F.p.age + t;
      F.age.textContent = a;
      F.body.style.height = hgt(a) + 'px'; F.body.style.width = hgt(a) * 0.36 + 'px';
      F.f.classList.toggle('u8l4-baby', a === 0);
    });
    const m = 12 + t, l = 4 + t;
    dif.innerHTML = `<span class="u8l4-rk">older by</span> <b>${m - l}</b> years`;
    rat.innerHTML = l === 0 ? '<span class="u8l4-rk">times as old</span> Leo was just born!' : `<span class="u8l4-rk">times as old</span> <b>${m / l === Math.round(m / l) ? m / l : (m / l).toFixed(1)}</b> ${tex(`\\left(${m}\\div${l}\\right)`)}`;
    btns.querySelectorAll('button').forEach((b) => b.classList.toggle('on', +b.dataset.t === t));
  };
  TIMES.forEach((x) => { const b = h('button', 'pill', x.lab); b.type = 'button'; b.dataset.t = x.t; b.onclick = () => set(x.t); btns.appendChild(b); });
  set(0);
}

/* =============================== the four-step pipeline (star) =============================== */
const PIPE = {
  snack: {
    label: 'Snack bar',
    story: 'The snack bar sells [[u1|hot dogs]] for [[f2|$3 each]] and [[u2|drinks]] for [[f2|$2 each]]. At lunch it sold [[f1|50 items]] and took in [[f2|$124]]. [[q|How many of each did it sell?]]',
    lets: [['h', 'the number of hot dogs sold'], ['d', 'the number of drinks sold']], letNote: 'Both are counts of items.',
    table: { mode: 'sum', cols: ['Hot dogs', 'Drinks'], rows: [['Items', 'h', 'd', '50'], ['Value ($)', '3h', '2d', '124']] },
    f1cap: 'First fact: <b>50 items</b> in all. This row <b>counts</b> items: hot dogs + drinks = 50.',
    f2cap: 'Second fact: the <b>money</b>. h hot dogs at $3 bring in 3h dollars, d drinks at $2 bring in 2d.',
    eqs: ['h+d=50', '3h+2d=124'],
    solve: [
      { cap: '<b>Step 3.</b> Eq. 1 has coefficients of 1, so use <b>substitution</b>: isolate d.', note: 'Substitution: coefficients of 1 in Eq. 1', lines: ['\\B{d=50-h}'] },
      { cap: 'Replace d in Eq. 2 with what it equals, then solve for h.', lines: ['3h+2(\\B{50-h})=124', '3h+100-2h=124\\ \\Rightarrow\\ h=24'] },
      { cap: 'Put h = 24 back into d = 50 − h.', lines: ['d=50-24=26'], sol: 'h=24,\\ d=26' }
    ],
    checks: [{ k: 'f1', w: '50 items', t: '24+26=50' }, { k: 'f2', w: '$124', t: '3(24)+2(26)=72+52=124' }],
    sense: 'Both counts are whole, positive numbers',
    answer: 'The snack bar sold <b>24 hot dogs</b> and <b>26 drinks</b>.'
  },
  sam: {
    label: 'Warm-up: Sam and his dad',
    story: '[[u1|Sam]]’s [[u2|dad]] says: “[[f1|Right now I’m 4 times your age]]. [[f2|In 20 years, I’ll be only twice your age]].” [[q|How old is Sam?]]',
    lets: [['s', 'Sam’s age now, in years'], ['d', 'Dad’s age now, in years']],
    table: { mode: 'facts', rows: [['Now: Dad is 4 times Sam', 'd=4s'], ['In 20 years: Dad is twice Sam', 'd+20=2(s+20)']] },
    f1cap: 'First fact: <b>right now</b>, Dad’s age is 4 times Sam’s age.',
    f2cap: 'Second fact: <b>in 20 years</b>. Careful: <b>both</b> of them get 20 years older.',
    eqcap: 'Here each row of the table is already an equation.',
    eqs: ['d=4s', 'd+20=2(s+20)'],
    solve: [
      { cap: '<b>Step 3.</b> Eq. 1 already says what d equals, so use <b>substitution</b>.', note: 'Substitution: d is isolated in Eq. 1', lines: ['\\B{4s}+20=2(s+20)'] },
      { cap: 'Expand the bracket and solve for s.', lines: ['4s+20=2s+40', '2s=20\\ \\Rightarrow\\ s=10'] },
      { cap: 'Back into Eq. 1: d = 4(10) = 40.', lines: ['d=4(10)=40'], sol: 's=10,\\ d=40' }
    ],
    checks: [{ k: 'f1', w: '4 times', t: '40=4(10)' }, { k: 'f2', w: 'in 20 years', t: '40+20=60=2(10+20)' }],
    sense: 'Ages are positive whole numbers',
    answer: '<b>Sam is 10</b> and his dad is 40.'
  },
  ex1: {
    label: 'Example 1',
    story: 'The [[f1|difference between]] [[u1 u2 f1|two numbers]] [[f1|is 11]]. The [[u1 f2|larger number]] [[f2|is 2 more than twice]] [[u2 f2|the smaller number]].',
    s1cap: '<b>Step 1.</b> The problem talks about a <b>larger</b> and a <b>smaller</b> number. Those are the unknowns.',
    lets: [['x', 'the larger number'], ['y', 'the smaller number']], letNote: 'Pure numbers: no units to attach.',
    table: { mode: 'facts', rows: [['The difference is 11', 'x-y=11'], ['The larger is 2 more than twice the smaller', 'x=2y+2']] },
    f1cap: 'First fact: the <b>difference</b> is 11. Difference means larger − smaller.',
    f2cap: 'Second fact: “2 more than twice the smaller” is 2y + 2. The 2 is added <b>after</b>.',
    eqcap: 'Each row is an equation. Move 2y across in Eq. 2 so the variables line up.',
    eqs: ['x-y=11', 'x=2y+2\\ \\Rightarrow\\ x-2y=2'],
    solve: [
      { cap: '<b>Step 3.</b> Both equations have the same x-coefficient, so <b>subtract</b> Eq. 2 from Eq. 1 to eliminate x.', note: 'Elimination: the x-coefficients match', lines: ['(\\B{x-y})-(\\A{x-2y})=11-2', '-y+2y=9\\ \\Rightarrow\\ y=9'] },
      { cap: 'Put y = 9 into Eq. 1: x − 9 = 11, so x = 20.', lines: ['x-9=11\\ \\Rightarrow\\ x=20'], sol: 'x=20,\\ y=9' }
    ],
    checks: [{ k: 'f1', w: 'difference 11', t: '20-9=11' }, { k: 'f2', w: '2 more than twice', t: '2(9)+2=20' }],
    sense: '20 really is the larger of the two',
    answer: 'The two numbers are <b>20</b> and <b>9</b>.'
  },
  ex2: {
    label: 'Example 2',
    story: 'A [[u1 u2|rectangular garden]] has a [[f1|perimeter of 54 metres]]. Its [[u1 f2|length]] [[f2|is 3 metres more than twice]] [[u2 f2|its width]]. [[q|Find the dimensions of the garden.]]',
    lets: [['l', 'the length of the garden, in metres'], ['w', 'the width of the garden, in metres']],
    table: { mode: 'facts', rows: [['Perimeter is 54 m', '2l+2w=54'], ['Length is 3 m more than twice the width', 'l=2w+3']] },
    f1cap: 'First fact: the <b>perimeter</b>. Two lengths and two widths make 54 m.',
    f2cap: 'Second fact: the <b>length–width relationship</b>, l = 2w + 3.',
    eqcap: 'Each row is an equation. Halve the perimeter: one length + one width = 27.',
    eqs: ['2(l+w)=54\\ \\Rightarrow\\ l+w=27', 'l=2w+3'],
    solve: [
      { cap: '<b>Step 3.</b> Eq. 2 already says what l equals: <b>substitute</b> it into Eq. 1.', note: 'Substitution: l is isolated in Eq. 2', lines: ['(\\A{2w+3})+w=27', '3w+3=27'] },
      { cap: 'Solve for w.', lines: ['3w=24\\ \\Rightarrow\\ w=8'] },
      { cap: 'Back into Eq. 2: l = 2(8) + 3 = 19.', lines: ['l=2(8)+3=19'], sol: 'l=19,\\ w=8' }
    ],
    checks: [{ k: 'f1', w: 'perimeter 54 m', t: '2(19+8)=2(27)=54' }, { k: 'f2', w: '3 m more than twice', t: '2(8)+3=19' }],
    sense: 'Both dimensions are positive',
    answer: 'The garden is <b>19 m long</b> and <b>8 m wide</b>.'
  },
  ex3: {
    label: 'Example 3',
    story: 'Maria has a [[f2|total of $310]] in [[u1 f2|five-dollar bills]] and [[u2 f2|twenty-dollar bills]]. If she has [[f1|23 bills in total]], [[q|how many of each denomination does she have?]]',
    lets: [['f', 'the number of five-dollar bills'], ['t', 'the number of twenty-dollar bills']], letNote: 'Both are counts of bills.',
    table: { mode: 'sum', cols: ['Fives', 'Twenties'], rows: [['Count (bills)', 'f', 't', '23'], ['Value ($)', '5f', '20t', '310']] },
    f1cap: 'First fact: <b>23 bills</b> in total. This row <b>counts</b> bills: each bill counts as 1.',
    f2cap: 'Second fact: <b>$310</b> in total. This row totals the <b>value</b>: f fives are worth 5f dollars, t twenties 20t.',
    eqs: ['f+t=23', '5f+20t=310'],
    solve: [
      { cap: '<b>Step 3.</b> Eq. 1 has coefficients of 1: <b>substitution</b>. From Eq. 1, f = 23 − t.', note: 'Substitution: coefficients of 1 in Eq. 1', lines: ['\\B{f=23-t}', '5(\\B{23-t})+20t=310'] },
      { cap: 'Expand and solve for t.', lines: ['115-5t+20t=310\\ \\Rightarrow\\ 115+15t=310', '15t=195\\ \\Rightarrow\\ t=13'] },
      { cap: 'Back into f = 23 − t: f = 23 − 13 = 10.', lines: ['f=23-13=10'], sol: 'f=10,\\ t=13' }
    ],
    checks: [{ k: 'f1', w: '23 bills', t: '10+13=23' }, { k: 'f2', w: '$310', t: '5(10)+20(13)=50+260=310' }],
    sense: 'Both counts are whole, positive numbers, as counts of bills must be',
    answer: 'Maria has <b>10</b> five-dollar bills and <b>13</b> twenty-dollar bills.'
  },
  ex4: {
    label: 'Example 4',
    story: `Devon invested his [[f1|savings of $36${NB}000]] in two accounts. [[u1 f2|One account earned 8% interest]] and [[u2 f2|the other earned 5% interest]]. If he earned a [[f2|total of $2340 in interest]] for the year, [[q|how much did he invest at each rate?]]`,
    lets: [['x', 'the amount invested at 8%, in dollars'], ['y', 'the amount invested at 5%, in dollars']],
    table: { mode: 'sum', cols: ['At 8%', 'At 5%'], rows: [['Principal ($)', 'x', 'y', '36\\,000'], ['Interest ($)', '0.08x', '0.05y', '2340']] },
    f1cap: `First fact: the <b>principal</b>. The two amounts add up to $36${NB}000.`,
    f2cap: 'Second fact: the <b>interest</b>. Change the rates to decimals first: 8% = 0.08 and 5% = 0.05.',
    eqs: ['x+y=36\\,000', '0.08x+0.05y=2340'],
    solve: [
      { cap: `<b>Step 3.</b> Eq. 1 has coefficients of 1: <b>substitution</b>. From Eq. 1, y = 36${NB}000 − x.`, note: 'Substitution: coefficients of 1 in Eq. 1', lines: ['\\B{y=36\\,000-x}', '0.08x+0.05(\\B{36\\,000-x})=2340'] },
      { cap: `Expand (0.05 × 36${NB}000 = 1800) and collect the x-terms.`, lines: ['0.08x+1800-0.05x=2340', '0.03x=540\\ \\Rightarrow\\ x=18\\,000'] },
      { cap: `Back into Eq. 1: y = 36${NB}000 − 18${NB}000 = 18${NB}000.`, lines: ['y=36\\,000-18\\,000=18\\,000'], sol: 'x=18\\,000,\\ y=18\\,000' }
    ],
    checks: [{ k: 'f1', w: `$36${NB}000`, t: '18\\,000+18\\,000=36\\,000' }, { k: 'f2', w: '$2340', t: '0.08(18\\,000)+0.05(18\\,000)=1440+900=2340' }],
    sense: `Overall rate 2340 ÷ 36${NB}000 = 6.5%: between 5% and 8%`,
    answer: `Devon invested <b>$18${NB}000 at 8%</b> and <b>$18${NB}000 at 5%</b>.`
  },
  ex5: {
    label: 'Example 5',
    story: 'A factory has an [[u1|older machine]] that [[f2|packs 25 boxes per hour]] and a [[u2|newer machine]] that [[f2|packs 35 boxes per hour]]. Yesterday the two machines ran for a [[f1|combined total of 18 hours]] and [[f2|packed 550 boxes]]. [[q|For how many hours did each machine run?]]',
    lets: [['o', 'the number of hours the older machine ran'], ['n', 'the number of hours the newer machine ran']],
    table: { mode: 'sum', cols: ['Older', 'Newer'], rows: [['Time (h)', 'o', 'n', '18'], ['Output (boxes)', '25o', '35n', '550']] },
    f1cap: 'First fact: <b>18 hours</b> in total. This row totals the <b>time</b>.',
    f2cap: 'Second fact: <b>550 boxes</b>. Output = rate × time: the older machine packs 25o boxes, the newer one 35n.',
    eqs: ['o+n=18', '25o+35n=550'],
    solve: [
      { cap: '<b>Step 3.</b> Eq. 1 has coefficients of 1: <b>substitution</b>. From Eq. 1, o = 18 − n.', note: 'Substitution: coefficients of 1 in Eq. 1', lines: ['\\B{o=18-n}', '25(\\B{18-n})+35n=550'] },
      { cap: 'Expand and solve for n.', lines: ['450-25n+35n=550\\ \\Rightarrow\\ 450+10n=550', '10n=100\\ \\Rightarrow\\ n=10'] },
      { cap: 'Back into o = 18 − n: o = 18 − 10 = 8.', lines: ['o=18-10=8'], sol: 'o=8,\\ n=10' }
    ],
    checks: [{ k: 'f1', w: '18 hours', t: '8+10=18' }, { k: 'f2', w: '550 boxes', t: '25(8)+35(10)=200+350=550' }],
    sense: 'Average 550 ÷ 18 ≈ 30.6 boxes per hour: between 25 and 35',
    answer: 'The older machine ran <b>8 hours</b> and the newer machine <b>10 hours</b>.'
  }
};

function pipeDef(keys, o = {}) {
  const ch = keys.map((k) => ({ v: k, label: PIPE[k].label }));
  return {
    title: o.title || 'Four steps: words → let → table → equations → solve → check',
    height: 528,
    value: keys[0],
    choices: o.sep ? [{ sep: o.sep }, ...ch] : ch,
    intro: (k) => `${PIPE[k].label}: read the problem first. Press <b>Next</b> to send it through the four steps.`,
    make(stage, k, ex) {
      const d = PIPE[k], W = ex.W, LW = Math.round(W * 0.465), RX = LW + 24, RW = W - RX - 12;
      /* left: the problem, the let card, the check */
      const sp = panel(stage, 12, 8, LW, 192, 'The problem', 'u8l4-storyp');
      const sb = h('div', 'u8l4-story', parseStory(d.story)); sp.appendChild(sb);
      const letP = panel(stage, 12, 208, LW, 86, 'Step 1 · Let' + (d.letNote ? ` <i class="u8l4-phn">${d.letNote}</i>` : ''), 'u8l4-idle');
      const lets = d.lets.map(([v, txt]) => { const e = h('div', 'u8l4-let', `Let ${T(v)} be ${txt}`); letP.appendChild(e); fit(e, LW - 26); return e; });
      const letNote = letP.querySelector('.u8l4-phn');
      hide(...lets, letNote);
      const ckP = panel(stage, 12, 302, LW, 218, 'Step 4 · Answer and check against the story', 'u8l4-idle');
      const ckRows = d.checks.map((q, i) => {
        const r = h('div', 'u8l4-ck', `<span class="u8l4-ckm u8l4-c${i + 1}">✓</span><div><div class="u8l4-ckw">${q.w}</div><div class="u8l4-ckt">${T(q.t)}</div></div>`);
        ckP.appendChild(r); fit(r.querySelector('.u8l4-ckt'), LW - 60); return r;
      });
      const senseR = h('div', 'u8l4-ck u8l4-sense', `<span class="u8l4-ckm">✓</span><div>${d.sense}</div>`); ckP.appendChild(senseR);
      const ansR = h('div', 'u8l4-answer', d.answer); ckP.appendChild(ansR);
      hide(...ckRows, senseR, ansR);
      /* right: table, equations, solve */
      const tabP = panel(stage, RX, 8, RW, 160, 'Step 2 · Organize the facts', 'u8l4-idle');
      const tb = h('div', 'u8l4-tab u8l4-' + d.table.mode); tabP.appendChild(tb);
      let head, rows, ops = [];
      if (d.table.mode === 'sum') {
        head = h('div', 'u8l4-tr u8l4-thead', `<div class="u8l4-tl"></div><div class="u8l4-tc">${d.table.cols[0]}</div><div class="u8l4-to"></div><div class="u8l4-tc">${d.table.cols[1]}</div><div class="u8l4-to"></div><div class="u8l4-tc">Total</div>`);
        tb.appendChild(head);
        rows = d.table.rows.map((r, i) => {
          const row = h('div', `u8l4-tr u8l4-r${i + 1}`, `<div class="u8l4-tl">${r[0]}</div><div class="u8l4-tc">${T(r[1])}</div><div class="u8l4-to">${T('+')}</div><div class="u8l4-tc">${T(r[2])}</div><div class="u8l4-to">${T('=')}</div><div class="u8l4-tc">${T(r[3])}</div>`);
          tb.appendChild(row); ops.push(...row.querySelectorAll('.u8l4-to')); return row;
        });
      } else {
        head = h('div', 'u8l4-tr u8l4-thead', '<div class="u8l4-tw">The words</div><div class="u8l4-ts">In symbols</div>');
        tb.appendChild(head);
        rows = d.table.rows.map((r, i) => { const row = h('div', `u8l4-tr u8l4-r${i + 1}`, `<div class="u8l4-tw">${r[0]}</div><div class="u8l4-ts">${T(r[1])}</div>`); tb.appendChild(row); return row; });
      }
      hide(head); rows.forEach((r) => hide(...r.children)); hide(...ops);
      const eqP = panel(stage, RX, 174, RW, 88, 'Step 2 · Two equations', 'u8l4-idle');
      const eqs = d.eqs.map((e, i) => { const r = h('div', 'u8l4-eq', `<span class="u8l4-tag u8l4-t${i + 1}">Eq. ${i + 1}</span>${T(`\\${i ? 'A' : 'B'}{${e}}`)}`); eqP.appendChild(r); fit(r, RW - 26); return r; });
      hide(...eqs);
      const svP = panel(stage, RX, 270, RW, 250, 'Step 3 · Solve', 'u8l4-idle');
      const groups = d.solve.map((s) => {
        const els = [];
        if (s.note) els.push(h('div', 'u8l4-snote', s.note));
        s.lines.forEach((L) => els.push(h('div', 'u8l4-sl', T(L))));
        if (s.sol) els.push(h('div', 'u8l4-sol', T(`\\P{${s.sol}}`)));
        els.forEach((e) => { svP.appendChild(e); fit(e, RW - 26); });
        hide(...els); return els;
      });
      const kU = ['u1', 'u2'];
      const steps = [
        { cap: d.s1cap || '<b>Step 1.</b> What does the question ask for? Those are the <b>unknowns</b>.', run: async (c) => {
          live(letP); hl(sb, 'q'); kU.forEach((u) => hl(sb, u)); await pulse(c, sb, 1.02);
        } },
        { cap: `Give each unknown a letter and say what it stands for${d.letNote ? '' : ', with units'}.`, run: async (c) => {
          for (let i = 0; i < 2; i++) { await fly(c, stage, spans(sb, kU[i]), lets[i], { color: TEAL }); await show(c, lets[i]); }
          if (letNote) await show(c, letNote);
        } },
        { cap: `<b>Step 2.</b> ${d.f1cap}`, run: async (c) => {
          live(tabP); await show(c, head, 250);
          const f = hl(sb, 'f1'); await fly(c, stage, f, rows[0], { color: BLUE });
          for (const e of rows[0].children) if (!e.classList.contains('u8l4-to')) await show(c, e, 200);
        } },
        { cap: d.f2cap, run: async (c) => {
          const f = hl(sb, 'f2'); await fly(c, stage, f, rows[1], { color: AMB });
          for (const e of rows[1].children) if (!e.classList.contains('u8l4-to')) await show(c, e, 200);
        } },
        { cap: d.eqcap || 'Each row of the table becomes an equation: <b>part + part = total</b>.', run: async (c) => {
          live(eqP);
          for (const o of ops) await pop(c, o, 200);
          for (let i = 0; i < 2; i++) { await fly(c, stage, [rows[i]], eqs[i], { html: T(d.table.mode === 'sum' ? d.eqs[i] : d.table.rows[i][1]), color: i ? AMB : BLUE }); await show(c, eqs[i]); }
        } }
      ];
      d.solve.forEach((s, i) => steps.push({ cap: s.cap, run: async (c) => { live(svP); for (const e of groups[i]) await (e.classList.contains('u8l4-sol') ? pop(c, e) : show(c, e, 280)); } }));
      steps.push({ cap: '<b>Step 4.</b> Check against the <b>story</b>, not just the equations: does each fact come true?', run: async (c) => {
        live(ckP);
        for (let i = 0; i < d.checks.length; i++) {
          const f = spans(sb, d.checks[i].k);
          f.forEach((e) => e.classList.add('u8l4-flash'));
          await Promise.all(f.map((e) => pulse(c, e, 1.08, 420)));
          await show(c, ckRows[i]);
        }
      } });
      steps.push({ cap: `Does it make sense? ${d.sense}. Then answer the question <b>in a sentence</b>.`, run: async (c) => {
        await show(c, senseR); await pop(c, ansR, 420);
      } });
      return steps;
    }
  };
}

/* =============================== Step 3: which method? =============================== */
const MT = {
  A: { label: 'y = 3x − 5', e1: 'y=3x-5', e2: '4x+2y=30',
    sub: [true, 'y is already <b>isolated</b> in Eq. 1.'], eli: [false, 'No coefficients match yet: Eq. 1 would have to be rearranged first.'],
    pick: 's', why: '<b>Substitution</b>: replace y in Eq. 2 with 3x − 5.',
    lines: ['4x+2(\\B{3x-5})=30', '10x-10=30\\ \\Rightarrow\\ x=4', 'y=3(4)-5=7'], sol: '(x,\\ y)=(4,\\ 7)' },
  B: { label: '3a + 2b = 16', e1: '3a+2b=16', e2: '5a-2b=0',
    sub: [false, 'No variable has coefficient 1 or −1, and none is isolated.'], eli: [true, 'The b-coefficients, 2 and −2, are <b>opposites</b>.'],
    pick: 'e', why: '<b>Elimination</b>: add the equations and b cancels.',
    lines: ['(\\B{3a+2b})+(\\A{5a-2b})=16+0', '8a=16\\ \\Rightarrow\\ a=2', '3(2)+2b=16\\ \\Rightarrow\\ b=5'], sol: '(a,\\ b)=(2,\\ 5)' },
  C: { label: '2p + 3q = 12', e1: '2p+3q=12', e2: '4p-q=10',
    sub: [true, 'q has coefficient −1 in Eq. 2, so q = 4p − 10.'], eli: [true, 'An easy multiple: 3 × Eq. 2 gives −3q, the opposite of 3q.'],
    pick: 's', why: 'Both work. <b>Substitution</b> needs no scaling: q = 4p − 10.',
    lines: ['2p+3(\\A{4p-10})=12', '14p-30=12\\ \\Rightarrow\\ p=3', 'q=4(3)-10=2'], sol: '(p,\\ q)=(3,\\ 2)' },
  D: { label: 'a + b = 9', e1: 'a+b=9', e2: 'a-b=3',
    sub: [true, 'Every coefficient is 1 or −1.'], eli: [true, 'The b-coefficients, 1 and −1, are <b>opposites</b>.'],
    pick: 'e', why: 'Both work. <b>Elimination</b> takes one line: add, and b cancels.',
    lines: ['(\\B{a+b})+(\\A{a-b})=9+3', '2a=12\\ \\Rightarrow\\ a=6', '6+b=9\\ \\Rightarrow\\ b=3'], sol: '(a,\\ b)=(6,\\ 3)' }
};
const method = {
  title: 'Which method? Test the system against each row of the table',
  height: 452,
  choices: Object.keys(MT).map((k) => ({ v: k, label: MT[k].label })),
  intro: (k) => `A system: ${T(MT[k].e1)} and ${T(MT[k].e2)}. Which method fits it best? Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = MT[k], W = ex.W, cx = W / 2, nw = Math.min(290, (W - 60) / 3), y2 = 192;
    const F = new Flowchart(stage, { x: 10, y: 6, width: W - 20, height: 262, nodes: {
      sys: { x: cx - 10, y: 52, w: 330, h: 88, html: `<div class="u8l4-fsys"><span class="u8l4-tag u8l4-t1">Eq. 1</span>${T(`\\B{${d.e1}}`)}</div><div class="u8l4-fsys"><span class="u8l4-tag u8l4-t2">Eq. 2</span>${T(`\\A{${d.e2}}`)}</div>`, cls: 'bk-round' },
      g: { x: (W - 20) / 6, y: y2, w: nw, h: 112, html: '<b>Graphing</b>a picture or estimate is enough, or a graphing calculator is allowed', color: 'slate' },
      s: { x: (W - 20) / 2, y: y2, w: nw, h: 112, html: '<b>Substitution</b>a variable is isolated, or has coefficient 1 or −1', color: 'blue' },
      e: { x: (W - 20) * 5 / 6, y: y2, w: nw, h: 112, html: '<b>Elimination</b>one variable’s coefficients match, are opposites, or are easy multiples', color: 'amber' } },
      edges: [{ from: 'sys', to: 'g' }, { from: 'sys', to: 's' }, { from: 'sys', to: 'e' }] });
    const P = panel(stage, 60, 284, W - 120, 160, 'First moves', 'u8l4-idle u8l4-mpan');
    const why = h('div', 'u8l4-mwhy', d.why); P.appendChild(why);
    const row = h('div', 'u8l4-mrow'); P.appendChild(row);
    const ls = d.lines.map((L) => { const e = h('div', 'u8l4-sl', T(L)); row.appendChild(e); return e; });
    const sol = h('div', 'u8l4-sol', T(`\\P{${d.sol}}`)); P.appendChild(sol);
    hide(why, ...ls, sol);
    const st = (id, ok, txt) => { const n = F.node(id); const s = stamp(n, txt || (ok ? '✓' : '✗'), { ok, x: n.offsetWidth - 22, y: 18, size: 'sm' }); return s; };
    const stamps = { s: st('s', d.sub[0]), e: st('e', d.eli[0]), g: st('g', null, 'maybe') };
    hide(...Object.values(stamps));
    return [
      { cap: `<b>Substitution?</b> ${d.sub[1]}`, run: async (c) => { await F.visit(c, 'sys'); await F.go(c, 'sys', 's'); await F.visit(c, 's'); await stampIn(c, stamps.s); } },
      { cap: `<b>Elimination?</b> ${d.eli[1]}`, run: async (c) => { await F.go(c, 'sys', 'e'); await F.visit(c, 'e'); await stampIn(c, stamps.e); } },
      { cap: '<b>Graphing?</b> It always works on a graphing calculator, but by hand only when the solution is a pair of <b>integers</b>, and you can’t know that before you solve.', run: async (c) => { await F.go(c, 'sys', 'g'); await F.visit(c, 'g'); await stampIn(c, stamps.g); } },
      { cap: d.why, run: async (c) => {
        Object.keys(stamps).forEach((id) => F.node(id).classList.add(id === d.pick ? 'u8l4-pick' : 'u8l4-nopick')); await pulse(c, F.node(d.pick), 1.06);
        live(P); await show(c, why); for (const e of ls.slice(0, 2)) await show(c, e);
      } },
      { cap: `Back-substitute to finish: ${T(`\\P{${d.sol}}`)}.`, run: async (c) => { await show(c, ls[2]); await pop(c, sol); } }
    ];
  }
};

/* =============================== Step 4: check against the words =============================== */
const S4 = {
  whole: { label: 'Whole numbers?', story: 'Vans carry 7 people and buses carry 12. A trip report says <b>9 vehicles</b> carried <b>80 people</b>. How many of each were there?',
    lets: 'Let $v$ = number of vans, $b$ = number of buses', e1: 'v+b=9', e2: '7v+12b=80', solTex: 'v=5.6,\\ b=3.4',
    ck1: { l: ['v+b', '5.6+3.4', '9'], r: ['9', null, '9'] }, ck2: { l: ['7v+12b', '39.2+40.8', '80'], r: ['80', null, '80'] },
    words: [['Totals add up', true], ['Counts are whole', false], ['Sizes positive', true], ['Answers the question', true]],
    bad: 'You can’t have <b>3.4 buses</b>: counts must be whole numbers.', verdict: 'Both equations check, but the <b>words</b> fail: the trip report must contain an error.' },
  pos: { label: 'Positive?', story: 'A rectangle has a perimeter of <b>20 cm</b>. Its length is <b>14 cm more</b> than its width. Find its dimensions.',
    lets: 'Let $l$ = length and $w$ = width, in cm', e1: 'l+w=10', e2: 'l=w+14', solTex: 'l=12,\\ w=-2',
    ck1: { l: ['l+w', '12+(-2)', '10'], r: ['10', null, '10'] }, ck2: { l: ['l', null, '12'], r: ['w+14', '-2+14', '12'] },
    words: [['Totals add up', true], ['Counts are whole', null], ['Sizes positive', false], ['Answers the question', true]],
    bad: 'A width of <b>−2 cm</b> is impossible: lengths must be positive.', verdict: 'The equations check, but <b>no such rectangle exists</b>: 14 cm more is too much for a 20 cm perimeter.' },
  q: { label: 'The right question?', story: 'A snack bar sold hot dogs at $3 and drinks at $2: <b>50 items</b> for <b>$124</b>. <b>How much money came from hot dogs?</b>',
    lets: 'Let $h$ = hot dogs sold, $d$ = drinks sold', e1: 'h+d=50', e2: '3h+2d=124', solTex: 'h=24,\\ d=26',
    ck1: { l: ['h+d', '24+26', '50'], r: ['50', null, '50'] }, ck2: { l: ['3h+2d', '72+52', '124'], r: ['124', null, '124'] },
    words: [['Totals add up', true], ['Counts are whole', true], ['Sizes positive', true], ['Answers the question', false]],
    bad: 'The question asks for <b>money</b>, not a count: 24 hot dogs × $3 = <b>$72</b>.', verdict: '“24” solves the system but answers the wrong question. The answer is <b>$72 from hot dogs</b>.' }
};
const step4 = {
  title: 'Solved correctly … but does it make sense?',
  height: 452,
  choices: Object.keys(S4).map((k) => ({ v: k, label: S4[k].label })),
  intro: (k) => `${S4[k].label} Read the problem, then press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = S4[k], W = ex.W, LW = 420, RX = LW + 26, RW = W - RX - 12, CW = (RW - 12) / 2;
    const sp = panel(stage, 12, 8, LW, 126, 'The problem'); sp.appendChild(h('div', 'u8l4-story u8l4-s4story', d.story));
    const eqp = panel(stage, 12, 142, LW, 156, 'Steps 1–3', 'u8l4-idle');
    const lt = h('div', 'u8l4-s4let', d.lets.replace(/\$(\w)\$/g, (m, v) => T(v)));
    const e1 = h('div', 'u8l4-eq', `<span class="u8l4-tag u8l4-t1">Eq. 1</span>${T(`\\B{${d.e1}}`)}`), e2 = h('div', 'u8l4-eq', `<span class="u8l4-tag u8l4-t2">Eq. 2</span>${T(`\\A{${d.e2}}`)}`);
    const so = h('div', 'u8l4-sol', T(`\\P{${d.solTex}}`));
    eqp.append(lt, e1, e2, so); hide(lt, e1, e2, so);
    const k1 = checkCard(stage, { title: 'Check Eq. 1', left: d.ck1.l, right: d.ck1.r, ok: true, x: RX, y: 8, width: CW, hidden: true, cls: 'u8l4-ckc u8l4-ckc1' });
    const k2 = checkCard(stage, { title: 'Check Eq. 2', left: d.ck2.l, right: d.ck2.r, ok: true, x: RX + CW + 12, y: 8, width: CW, hidden: true, cls: 'u8l4-ckc u8l4-ckc2' });
    [[k1, d.ck1], [k2, d.ck2]].forEach(([kc, q]) => kc.rows.forEach((r, i) => { if (q.l[i] == null) r[0].innerHTML = ''; if (q.r[i] == null) r[2].innerHTML = ''; })); // blank lines (the block prints null)
    const wp = panel(stage, 12, 306, W - 24, 140, 'Check against the words', 'u8l4-idle');
    const wrow = h('div', 'u8l4-wrow'); wp.appendChild(wrow);
    const ws = d.words.map(([t, ok]) => { const e = h('div', 'u8l4-wbox' + (ok === null ? ' u8l4-na' : ''), `<b>${t}</b><span>${ok === null ? 'does not apply' : ''}</span>`); wrow.appendChild(e); e.ok = ok; return e; });
    const bad = h('div', 'u8l4-bad', d.bad); wp.appendChild(bad); hide(bad, ...ws);
    return [
      { cap: `Steps 1–3 give ${T(`\\P{${d.solTex}}`)}.`, run: async (c) => { live(eqp); for (const e of [lt, e1, e2]) await show(c, e, 260); await pop(c, so); } },
      { cap: 'Check in <b>both</b> equations: both sides come out equal.', run: async (c) => { await k1.play(c, 260); await k2.play(c, 260); } },
      { cap: 'Now check against the <b>words</b>: totals, whole counts, positive sizes, and the question that was asked.', run: async (c) => {
        live(wp);
        for (const e of ws) {
          await show(c, e, 240);
          if (e.ok !== null) { const s = stamp(e, e.ok ? '✓' : '✗', { ok: e.ok, x: e.offsetWidth - 24, y: 22, size: 'sm' }); await stampIn(c, s); }
          if (e.ok === false) { e.classList.add('u8l4-fail'); await show(c, bad); }
        }
      } },
      { cap: d.verdict, run: async (c) => { const s = stamp(stage, k === 'q' ? 'wrong question' : 'makes no sense', { ok: false, x: RX + RW / 2, y: 254, rotate: -6 }); await stampIn(c, s); } }
    ];
  }
};

/* =============================== Section 2: words → algebra =============================== */
const TR = {
  sum: { label: 'Sum and difference', lets: 'Let $x$ be the larger number and $y$ the smaller number.',
    sents: [
      { tiles: ['The sum of', 'two numbers', 'is', '30'], slots: ['x', '+', 'y', '=', '30'], map: [[1], [0, 2], [3], [4]], eq: 1 },
      { tiles: ['Their difference', 'is', '4'], slots: ['x-y', '=', '4'], map: [[0], [1], [2]], eq: 2 }],
    caps: ['“Two numbers” are the unknowns: <b>x</b> and <b>y</b>. “The sum of” puts a <b>+</b> between them, and “is” means <b>=</b>.',
      '“Difference” means <b>larger − smaller</b>: x − y. That is Eq. 2.'],
    back: { cap: 'Read it back with x = 17 and y = 13: 17 + 13 = 30 ✓ and 17 − 13 = 4 ✓. The words come true.', lines: ['17+13=30\\ ✓', '17-13=4\\ ✓'] } },
  more: { label: '5 more than three times', lets: 'Let $x$ be the larger number and $y$ the smaller number.',
    sents: [{ tiles: ['The larger number', 'is', '5 more than', 'three times the smaller'], slots: ['x', '=', '3y', '+5'], map: [[0], [1], [3], [2]], eq: 2 }],
    caps: ['“The larger number is” gives <b>x =</b>. Now watch “5 more than”: it is said <b>first</b>, but the 5 is added <b>after</b>. The lines cross.'],
    trap: { wrong: 'x+5=3y', cap: 'Read it back: if the smaller is 4, the larger is 3(4) + 5 = <b>17</b>. The trap x + 5 = 3y would give 7, which is 5 <b>less</b> than 12.', lines: ['y=4:\\ x=3(4)+5=17\\ ✓'] } },
  less: { label: '2 less than four times', lets: 'Let $n$ be the number.',
    sents: [{ tiles: ['Two less than', 'four times a number', 'is', '18'], slots: ['4n', '-2', '=', '18'], map: [[1], [0], [2], [3]], eq: 1 }],
    caps: ['“Two less than four times a number”: start with <b>4n</b>, then take 2 away. Said first, written last.'],
    trap: { wrong: '2-4n=18', cap: 'Read it back: n = 5 gives 4(5) − 2 = 18 ✓. The trap 2 − 4n would be “four times less than two”: the order matters.', lines: ['n=5:\\ 4(5)-2=18\\ ✓'] } }
};
const translate = {
  title: 'From words to symbols',
  height: 440,
  choices: Object.keys(TR).map((k) => ({ v: k, label: TR[k].label })),
  intro: (k) => `${TR[k].lets.replace(/\$(\w)\$/g, (m, v) => T(v))} Press <b>Next</b> to translate.`,
  make(stage, k, ex) {
    const d = TR[k], W = ex.W;
    const svg = svgEl('svg', { class: 'u8l4-trsvg', width: W, height: 440, viewBox: `0 0 ${W} 440` }); stage.appendChild(svg);
    const L = add(stage, h('div', 'u8l4-trlet', d.lets.replace(/\$(\w)\$/g, (m, v) => T(v))), 16, 8);
    void L;
    const blocks = d.sents.map((s, si) => {
      const y0 = 50 + si * 170;
      const trow = add(stage, h('div', 'u8l4-trow'), 0, y0); trow.style.width = W + 'px';
      const tiles = s.tiles.map((t) => { const e = h('div', 'u8l4-tile', t); trow.appendChild(e); return e; });
      const srow = add(stage, h('div', 'u8l4-srow'), 0, y0 + 100); srow.style.width = W + 'px';
      const slots = s.slots.map((t) => { const e = h('div', 'u8l4-slot', T(t)); srow.appendChild(e); return e; });
      const tag = h('span', `u8l4-tag u8l4-t${s.eq}`, 'Eq. ' + s.eq); if (d.sents.length > 1) srow.prepend(tag); else tag.style.display = 'none';
      hide(tag, ...slots);
      return { s, tiles, slots, tag, color: s.eq === 1 ? BLUE : AMB };
    });
    const conn = (b, ti, si) => {
      const a = rel(stage, b.tiles[ti]), z = rel(stage, b.slots[si]);
      const x1 = a.x + a.w / 2, y1 = a.y + a.h + 2, x2 = z.x + z.w / 2, y2 = z.y - 4, my = (y1 + y2) / 2;
      const p = svgEl('path', { d: `M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}`, fill: 'none', stroke: b.color, 'stroke-width': 3, 'stroke-opacity': 0.55, class: 'bk-stroke', 'stroke-linecap': 'round' }, svg);
      return p;
    };
    const steps = [];
    blocks.forEach((b, bi) => {
      steps.push({ cap: d.caps[bi], run: async (c) => {
        for (let ti = 0; ti < b.s.map.length; ti++) {
          b.tiles[ti].classList.add(b.s.eq === 1 ? 'u8l4-t1on' : 'u8l4-t2on');
          for (const si of b.s.map[ti]) {
            const p = conn(b, ti, si); await drawIn(p, 380, c);
            await fly(c, stage, [b.tiles[ti]], b.slots[si], { color: b.color, ms: 520 });
            b.slots[si].classList.add(b.s.eq === 1 ? 'u8l4-s1' : 'u8l4-s2'); await pop(c, b.slots[si], 260);
          }
        }
        await show(c, b.tag);
      } });
    });
    const extra = d.back || d.trap;
    const bp = panel(stage, 16, d.sents.length > 1 ? 380 : 236, W - 32, d.sents.length > 1 ? 54 : 74, '', 'u8l4-trback');
    if (d.trap) {
      const wr = h('div', 'u8l4-wrong', `<span class="u8l4-wx">✗</span><span class="u8l4-wtex">${T(d.trap.wrong)}</span><span class="u8l4-wtxt">a common trap</span>`); bp.appendChild(wr); hide(wr);
      steps.push({ cap: 'A common trap: writing the words in the order they are <b>said</b>.', run: async (c) => { await show(c, wr); } });
    }
    const lines = extra.lines.map((t) => { const e = h('div', 'u8l4-backl', T(t)); bp.appendChild(e); return e; });
    hide(...lines);
    steps.push({ cap: extra.cap, run: async (c) => { for (const e of lines) await show(c, e); } });
    return steps;
  }
};

/* =============================== Section 3: rectangles =============================== */
const RC = {
  ex2: { label: 'Example 2 check', P: 54, a: 2, b: 3, u: 'm', cond: 'the length is 3 m more than twice the width' },
  twice: { label: 'Length twice the width, P = 36 m', P: 36, a: 2, b: 0, u: 'm', cond: 'the length is twice the width' },
  three: { label: 'P = 58 m, length 1 m more than 3 times', P: 58, a: 3, b: 1, u: 'm', cond: 'the length is 1 m more than three times the width' }
};
const rect = {
  title: 'Perimeter: walk the fence, then build the length from widths',
  height: 470,
  choices: [{ v: 'ex2', label: 'Example 2 check' }, { sep: 'More' }, { v: 'twice', label: RC.twice.label }, { v: 'three', label: RC.three.label }],
  intro: (k) => `Perimeter ${RC[k].P} ${RC[k].u}, and ${RC[k].cond}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = RC[k], W = ex.W, half = d.P / 2, w = (half - d.b) / (d.a + 1), l = d.a * w + d.b;
    const lTex = `${d.a === 1 ? '' : d.a}w${d.b ? '+' + d.b : ''}`;
    const s = Math.min(470 / l, 196 / w), RW = l * s, RH = w * s, X0 = 40, Y0 = 34;
    const svg = svgEl('svg', { class: 'u8l4-rsvg', width: W, height: 470, viewBox: `0 0 ${W} 470` }); stage.appendChild(svg);
    const P = [[X0, Y0], [X0 + RW, Y0], [X0 + RW, Y0 + RH], [X0, Y0 + RH]];
    svgEl('rect', { x: X0, y: Y0, width: RW, height: RH, fill: '#eaf5e4', stroke: 'none' }, svg);
    const side = (i, cls) => svgEl('path', { d: `M${P[i][0]} ${P[i][1]} L${P[(i + 1) % 4][0]} ${P[(i + 1) % 4][1]}`, class: 'bk-stroke ' + cls, stroke: '#5b6b4f', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, svg);
    const sides = [0, 1, 2, 3].map((i) => side(i, 'u8l4-side'));
    const lab = (x, y, t, pos = 'c') => { const e = add(stage, h('div', 'u8l4-rlab', T(t)), x, y); e.style.translate = pos === 'c' ? '-50% -50%' : pos; return e; };
    const labs = [lab(X0 + RW / 2, Y0 - 16, 'l'), lab(X0 + RW + 22, Y0 + RH / 2, 'w'), lab(X0 + RW / 2, Y0 + RH + 18, 'l'), lab(X0 - 20, Y0 + RH / 2, 'w')];
    hide(...labs); sides.forEach((p) => (p.style.opacity = 0));
    const walker = svgEl('circle', { cx: X0, cy: Y0, r: 9, fill: BLUE, opacity: 0 }, svg);
    /* the length cut into w-pieces (inside the top edge) */
    const pieces = []; let px = X0;
    for (let i = 0; i < d.a; i++) { pieces.push({ x: px, wd: w * s, t: 'w' }); px += w * s; }
    if (d.b) pieces.push({ x: px, wd: d.b * s, t: String(d.b) });
    const pg = svgEl('g', { opacity: 0 }, svg);
    pieces.forEach((p, i) => {
      svgEl('rect', { x: p.x + 1, y: Y0 + 4, width: p.wd - 2, height: 26, rx: 5, fill: '#fff4dd', stroke: AMB, 'stroke-width': 2 }, pg);
      const e = add(stage, h('div', 'u8l4-plab', T(p.t)), p.x + p.wd / 2, Y0 + 17); e.style.translate = '-50% -50%'; hide(e); p.lab = e; void i;
    });
    /* equations panel on the right */
    const EX = X0 + 470 + 60, EW = W - EX - 12;
    const ep = panel(stage, EX, 8, EW, 300, 'Equations', 'u8l4-idle');
    const L = (t, cls = 'u8l4-sl') => { const e = h('div', cls, T(t)); ep.appendChild(e); fit(e, EW - 26); hide(e); return e; };
    const walk = L('l+w+l+w=' + d.P);
    const e1a = L(`2l+2w=${d.P}`), e1 = L(`\\B{l+w=${half}}`), e2 = L(`\\A{l=${lTex}}`);
    const sub = L(`(\\A{${lTex}})+w=${half}\\ \\Rightarrow\\ ${d.a + 1}w${d.b ? '+' + d.b : ''}=${half}`);
    const wv = L(`${d.a + 1}w=${half - d.b}\\ \\Rightarrow\\ w=${w}`), lv = L(`l=${d.a === 1 ? '' : d.a}(${w})${d.b ? '+' + d.b : ''}=${l}`);
    const sol = h('div', 'u8l4-sol', T(`\\P{l=${l},\\ w=${w}}`)); ep.appendChild(sol); hide(sol);
    /* the half-fence strip */
    const SY = 330, S2 = (W - 100) / half, SX = 50;
    const strip = svgEl('g', { opacity: 0 }, svg);
    const segs = [...pieces.map((p) => ({ wd: (p.t === 'w' ? w : d.b) * S2, t: p.t, c: AMB, f: '#fff4dd' })), { wd: w * S2, t: 'w', c: BLUE, f: '#eef3fd' }];
    let sx = SX; const segLabs = [];
    segs.forEach((g) => {
      svgEl('rect', { x: sx + 1, y: SY, width: g.wd - 2, height: 44, rx: 7, fill: g.f, stroke: g.c, 'stroke-width': 2.5 }, strip);
      const e = add(stage, h('div', 'u8l4-slab', T(g.t)), sx + g.wd / 2, SY + 22); e.style.translate = '-50% -50%'; e.g = g; segLabs.push(e); sx += g.wd;
    });
    hide(...segLabs);
    svgEl('path', { d: `M${SX} ${SY + 54} v10 H${sx} v-10`, fill: 'none', stroke: BLUE, 'stroke-width': 2.5 }, strip);
    const brace = add(stage, h('div', 'u8l4-brace', `half the fence: ${T(`l+w=${half}`)}`), (SX + sx) / 2, SY + 82); brace.style.translate = '-50% -50%'; hide(brace);
    const lead = add(stage, h('div', 'u8l4-slead', `${T('l')} is ${T(lTex)}`), SX, SY - 30); hide(lead);
    const side2 = svgEl('path', { d: `M${P[0][0]} ${P[0][1]} L${P[1][0]} ${P[1][1]} L${P[2][0]} ${P[2][1]}`, fill: 'none', stroke: BLUE, 'stroke-width': 9, 'stroke-opacity': 0, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    const per = 2 * (RW + RH);
    const walkTo = (t) => { // t in [0,1] around the rectangle from top-left, clockwise
      let dd = t * per; const segsL = [RW, RH, RW, RH];
      for (let i = 0; i < 4; i++) { if (dd <= segsL[i] || i === 3) { const a = P[i], b = P[(i + 1) % 4], u = Math.min(1, dd / segsL[i]); walker.setAttribute('cx', a[0] + (b[0] - a[0]) * u); walker.setAttribute('cy', a[1] + (b[1] - a[1]) * u); return; } dd -= segsL[i]; }
    };
    return [
      { cap: 'A rectangle has <b>two lengths</b> and <b>two widths</b>.', run: async (c) => { for (const p of sides) { p.style.opacity = 1; await drawIn(p, 260, c); } for (const e of labs) await pop(c, e, 220); } },
      { cap: `Walk around the fence: ${T(`l+w+l+w=${d.P}`)}.`, run: async (c) => {
        live(ep); walker.setAttribute('opacity', 1);
        await tween(c, 1800, (t) => walkTo(t), (t) => t); walker.setAttribute('opacity', 0); await show(c, walk);
      } },
      { cap: `That is ${T(`2l+2w=${d.P}`)}. Halve it: <b>one length + one width</b> is half the fence, ${T(`\\B{l+w=${half}}`)} (Eq. 1).`, run: async (c) => {
        await show(c, e1a); await appear(c, side2, 10); side2.setAttribute('stroke-opacity', 0.45); await drawIn(side2, 600, c); await show(c, e1);
      } },
      { cap: `Eq. 2: ${d.cond}, ${T(`\\A{l=${lTex}}`)}. Cut the length into pieces.`, run: async (c) => {
        await appear(c, pg, 300); for (const p of pieces) await pop(c, p.lab, 220); await show(c, e2);
      } },
      { cap: `Substitute: half the fence is ${T(`(\\A{${lTex}})+w`)}, so ${T(`${d.a + 1}w${d.b ? '+' + d.b : ''}=${half}`)}.`, run: async (c) => {
        await appear(c, strip, 300); await show(c, lead); for (const e of segLabs) await pop(c, e, 200); await show(c, brace); await show(c, sub);
      } },
      { cap: `${T(`${d.a + 1}w=${half - d.b}`)}, so ${T(`w=${w}`)} and ${T(`l=${l}`)}.`, run: async (c) => {
        await show(c, wv); await show(c, lv); await pop(c, sol);
        segLabs.forEach((e) => { if (e.g.t === 'w') e.innerHTML = T(String(w)); });
        labs[0].innerHTML = labs[2].innerHTML = T(`${l}\\text{ ${d.u}}`); labs[1].innerHTML = labs[3].innerHTML = T(`${w}\\text{ ${d.u}}`);
        pieces.forEach((p) => { if (p.t === 'w') p.lab.innerHTML = T(String(w)); });
        for (const e of labs) await pulse(c, e, 1.15, 300);
      } },
      { cap: `Check: ${T(`2(${l})+2(${w})=${2 * l}+${2 * w}=${d.P}`)} ✓ and ${T(`${d.a === 1 ? '' : d.a}(${w})${d.b ? '+' + d.b : ''}=${l}`)} ✓. Both positive: <b>${l} ${d.u} by ${w} ${d.u}</b>.`, run: async (c) => {
        const st = stamp(stage, `✓ ${l} by ${w}`, { ok: true, x: X0 + RW / 2, y: Y0 + RH / 2 + 12 }); await stampIn(c, st);
      } }
    ];
  }
};

/* =============================== Section 4: count vs value (swap) =============================== */
const SW = {
  ex3: { label: 'Example 3 check', n: 23, lo: 5, hi: 20, total: 310, vl: 'f', vh: 't', kind: 'bill', nameLo: 'five', nameHi: 'twenty', plLo: 'fives', plHi: 'twenties' },
  coins: { label: 'Loonies and toonies: 12 coins, $19', n: 12, lo: 1, hi: 2, total: 19, vl: 'l', vh: 't', kind: 'coin', nameLo: 'loonie', nameHi: 'toonie', plLo: 'loonies', plHi: 'toonies' }
};
const swap = {
  title: 'One equation counts, the other totals value',
  height: 452,
  choices: [{ v: 'ex3', label: 'Example 3 check' }, { sep: 'More' }, { v: 'coins', label: SW.coins.label }],
  intro: (k) => (k === 'ex3' ? 'Maria: 23 bills, fives and twenties, worth $310. Press <b>Next</b>.' : '12 coins, loonies ($1) and toonies ($2), worth $19. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = SW[k], W = ex.W, all = d.n * d.lo, short = d.total - all, step = d.hi - d.lo, nh = short / step, nl = d.n - nh;
    const coin = d.kind === 'coin', per = coin ? 12 : 12, bw = coin ? 62 : 68, bh = coin ? 62 : 38, gap = coin ? 12 : 8;
    const rowsN = Math.ceil(d.n / per), totW = per * (bw + gap) - gap, x0 = (W - totW) / 2;
    const items = [];
    for (let i = 0; i < d.n; i++) {
      const r = Math.floor(i / per), cI = i % per;
      const e = add(stage, box(h('div', 'u8l4-money ' + (coin ? 'u8l4-coin' : 'u8l4-bill'), '?'), bw, bh), x0 + cI * (bw + gap), 14 + r * (bh + 14));
      e.style.opacity = 0; items.push(e);
    }
    const cy = 14 + rowsN * (bh + 14) + 8;
    const ctr = (x, label, cls) => { const e = add(stage, box(h('div', 'u8l4-ctr ' + cls, `<div class="u8l4-ck-l">${label}</div><div class="u8l4-ck-v">–</div>`), 250, 78), x, cy); return e; };
    const cx0 = (W - 3 * 250 - 2 * 20) / 2;
    const cCount = ctr(cx0, `Count (Eq. 1): ${d.kind}s`, 'u8l4-cc1'), cVal = ctr(cx0 + 270, 'Value (Eq. 2): dollars', 'u8l4-cc2'), cSw = ctr(cx0 + 540, `Swaps: ${d.nameLo} → ${d.nameHi}`, 'u8l4-cc3');
    const setV = (e, v) => { e.querySelector('.u8l4-ck-v').textContent = v; };
    hide(cCount, cVal, cSw);
    const ep = panel(stage, 30, cy + 92, W - 60, 452 - cy - 100, '', 'u8l4-swpan');
    const colL = h('div', 'u8l4-swcol'), colR = h('div', 'u8l4-swcol'); ep.append(colL, colR);
    const L = (col, t) => { const e = h('div', 'u8l4-sl', T(t)); col.appendChild(e); hide(e); return e; };
    const vl = d.vl, vh = d.vh, cf = (n) => (n === 1 ? '' : n);
    const l1 = L(colL, `\\B{${vl}+${vh}=${d.n}}`), l2 = L(colL, `\\A{${cf(d.lo)}${vl}+${cf(d.hi)}${vh}=${d.total}}`);
    const l3 = L(colR, `${cf(d.lo)}(${d.n}-${vh})+${cf(d.hi)}${vh}=${d.total}`);
    const l4 = L(colR, `\\underbrace{${all}}_{\\textstyle\\text{all ${d.plLo}}}+\\underbrace{${cf(step)}${vh}}_{\\textstyle\\text{swaps}}=${d.total}`);
    const l5 = L(colR, step === 1 ? `${vh}=${short},\\ \\ ${vl}=${d.n}-${nh}=${nl}` : `${step}${vh}=${short}\\ \\Rightarrow\\ ${vh}=${nh},\\ \\ ${vl}=${d.n}-${nh}=${nl}`);
    const face = (e, v) => { e.textContent = '$' + v; e.classList.toggle('u8l4-hi', v === d.hi); e.classList.toggle('u8l4-lo', v === d.lo); };
    return [
      { cap: `<b>Count</b> first: every ${d.kind} counts as <b>1</b>, whatever it is worth. ${d.n} ${d.kind}s: ${T(`\\B{${vl}+${vh}=${d.n}}`)}.`, run: async (c) => {
        await show(c, cCount, 200);
        for (let i = 0; i < d.n; i++) { setV(cCount, i + 1); await pop(c, items[i], c.fast ? 0 : 120); }
        await show(c, l1);
      } },
      { cap: `<b>Value</b> totals dollars instead: ${T(`\\A{${cf(d.lo)}${vl}+${cf(d.hi)}${vh}=${d.total}}`)}. Start with a guess: all ${d.n} are ${d.plLo}, worth ${T(`${d.n}\\times${d.lo}=${all}`)} dollars.`, run: async (c) => {
        await show(c, l2); await show(c, cVal, 200); items.forEach((e) => face(e, d.lo)); setV(cVal, '$' + all); await pulse(c, cVal, 1.06);
      } },
      { cap: `We need $${d.total}: short by $${short}. Swap one ${d.nameLo} for a ${d.nameHi}: still ${d.n} ${d.kind}s, but <b>$${step} more</b>.`, run: async (c) => {
        await show(c, cSw, 200); setV(cSw, 0);
        const e = items[d.n - 1]; await c.anim(e, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }], 200); face(e, d.hi); await c.anim(e, [{ transform: 'rotateY(90deg)' }, { transform: 'rotateY(0deg)' }], 200);
        setV(cSw, 1); setV(cVal, '$' + (all + step));
      } },
      { cap: `Each swap adds $${step}, so we need ${T(`${short}\\div${step}=${nh}`)} swaps.`, run: async (c) => {
        for (let j = 2; j <= nh; j++) {
          const e = items[d.n - j]; face(e, d.hi); await pop(c, e, c.fast ? 0 : 160);
          setV(cSw, j); setV(cVal, '$' + (all + j * step));
        }
        await pulse(c, cVal, 1.1);
      } },
      { cap: `That is exactly the algebra: substitute ${T(`${vl}=${d.n}-${vh}`)}, and ${T(String(all))} is “all ${d.plLo}”, ${T(`${cf(step)}${vh}`)} is the swaps.`, run: async (c) => { await show(c, l3); await show(c, l4); } },
      { cap: `${T(`${vh}=${nh}`)} ${d.plHi} and ${T(`${vl}=${nl}`)} ${d.plLo}. Check: ${T(`${nl}+${nh}=${d.n}`)} ✓ and ${T(`${d.lo}(${nl})+${d.hi}(${nh})=${d.lo * nl}+${d.hi * nh}=${d.total}`)} ✓.`, run: async (c) => {
        await show(c, l5); const s = stamp(stage, `${nl} ${d.plLo}, ${nh} ${d.plHi}`, { ok: true, x: W - 250, y: 396 }); await stampIn(c, s);
      } }
    ];
  }
};

/* =============================== Section 5: investment =============================== */
const IV = {
  ex4: { label: 'Example 4 check', P: 36000, r1: 8, r2: 5, I: 2340 },
  demo: { label: '$10 000 at 6% and 4%, $520', P: 10000, r1: 6, r2: 4, I: 520 }
};
const interest = {
  title: 'Principal and interest: slide the split',
  height: 462,
  choices: [{ v: 'ex4', label: 'Example 4 check' }, { sep: 'More' }, { v: 'demo', label: IV.demo.label }],
  intro: (k) => `${money(IV[k].P)} split between ${IV[k].r1}% and ${IV[k].r2}%, earning ${money(IV[k].I)} in interest. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = IV[k], W = ex.W, a = d.r1 / 100, b = d.r2 / 100, lo = b * d.P, hi = a * d.P, need = d.I - lo, diff = (d.r1 - d.r2) / 100, x = Math.round(need / diff), y = d.P - x;
    const dA = String(a), dB = String(b), dD = String(+diff.toFixed(4));
    /* percent tiles */
    const tile = (r, dec, xx) => { const e = add(stage, box(h('div', 'u8l4-ptile', T(`${r}\\%=\\tfrac{${r}}{100}=${dec}`)), 270, 52), xx, 10); hide(e); return e; };
    const t1 = tile(d.r1, dA, W / 2 - 290), t2 = tile(d.r2, dB, W / 2 + 20);
    /* principal bar */
    const BX = 40, BW = W - 80, BY = 112, BH = 54;
    const bar = add(stage, box(h('div', 'u8l4-pbar'), BW, BH), BX, BY);
    const px = h('div', 'u8l4-pbx'), py = h('div', 'u8l4-pby'); bar.append(px, py);
    const pt = add(stage, h('div', 'u8l4-pcap', `<span class="u8l4-tag u8l4-t1">Eq. 1</span> principal ${T(`\\B{x+y=${tnum(d.P)}}`)}`), BX, BY - 34);
    /* interest meter */
    const MY = 232, MH = 40, sc = BW / hi;
    const meter = add(stage, box(h('div', 'u8l4-meter'), BW, MH), BX, MY);
    const ma = h('div', 'u8l4-ma'), mb = h('div', 'u8l4-mb'); meter.append(ma, mb);
    const tgt = add(stage, box(h('div', 'u8l4-tgt', `<span>target ${money(d.I)}</span>`), 3, MH + 26), BX + d.I * sc, MY - 13);
    const mt = add(stage, h('div', 'u8l4-pcap', `<span class="u8l4-tag u8l4-t2">Eq. 2</span> interest ${T(`\\A{${dA}x+${dB}y=${d.I}}`)}`), BX, MY - 36);
    const mread = add(stage, h('div', 'u8l4-mread', ''), BX + BW, MY + MH + 8); mread.style.translate = '-100% 0';
    hide(bar, pt, meter, tgt, mt, mread);
    let cur = d.P / 3;
    const setP = (v) => {
      cur = v; const fx = v / d.P;
      px.style.width = fx * 100 + '%'; py.style.width = (1 - fx) * 100 + '%';
      px.innerHTML = fx > 0.14 ? `<span>${T('x')} at ${d.r1}%: ${money(Math.round(v))}</span>` : '';
      py.innerHTML = fx < 0.86 ? `<span>${T('y')} at ${d.r2}%: ${money(Math.round(d.P - v))}</span>` : '';
      const ia = a * v, ib = b * (d.P - v);
      ma.style.width = ia * sc + 'px'; mb.style.width = ib * sc + 'px';
      mread.innerHTML = `interest ${money(Math.round(ia))} + ${money(Math.round(ib))} = <b>${money(Math.round(ia + ib))}</b>`;
    };
    setP(cur);
    const rp = panel(stage, 40, 312, W - 80, 144, '', 'u8l4-ivpan');
    const L = (t) => { const e = h('div', 'u8l4-sl', T(t)); rp.appendChild(e); hide(e); return e; };
    const r1 = L(`\\text{all at ${d.r2}\\%: } ${dB}(${tnum(d.P)})=${tnum(lo)}\\qquad \\text{all at ${d.r1}\\%: } ${dA}(${tnum(d.P)})=${tnum(hi)}`);
    const r2 = L(`${dA}x+${dB}(${tnum(d.P)}-x)=${d.I}\\ \\Rightarrow\\ ${tnum(lo)}+${dD}x=${tnum(d.I)}`);
    const r3 = L(`${dD}x=${tnum(need)}\\ \\Rightarrow\\ x=${tnum(x)},\\quad y=${tnum(d.P)}-${tnum(x)}=${tnum(y)}`);
    const slide = (c, to, ms = 900) => { const from = cur; return tween(c, ms, (t) => setP(from + (to - from) * t)); };
    return [
      { cap: `Percents become decimals first: ${T(`${d.r1}\\%=${dA}`)} and ${T(`${d.r2}\\%=${dB}`)}.`, run: async (c) => { await pop(c, t1); await pop(c, t2); } },
      { cap: `Eq. 1 totals the <b>principal</b>: the two amounts make up the whole ${money(d.P)}.`, run: async (c) => { await show(c, pt); await show(c, bar); } },
      { cap: `Eq. 2 totals the <b>interest</b>. The meter shows the interest for this split; the line is the target, ${money(d.I)}.`, run: async (c) => { await show(c, mt); await show(c, meter); await show(c, tgt); await show(c, mread); } },
      { cap: `All at ${d.r2}%: ${money(lo)}, too little. All at ${d.r1}%: ${money(hi)}, too much. The answer is in between.`, run: async (c) => {
        await slide(c, 0); await sleep(c, 300); await slide(c, d.P, 1100); await show(c, r1);
      } },
      { cap: `Each dollar moved from ${d.r2}% to ${d.r1}% earns ${T(dD)} more. We need ${money(need)} more than ${money(lo)}: ${T(`${tnum(need)}\\div${dD}=${tnum(x)}`)}.`, run: async (c) => {
        await slide(c, 0, 500); await slide(c, x, 1400); await show(c, r2); await show(c, r3);
      } },
      { cap: `Check: ${T(`${dA}(${tnum(x)})+${dB}(${tnum(y)})=${tnum(a * x)}+${tnum(b * y)}=${tnum(d.I)}`)} ✓. Overall rate ${T(`${tnum(d.I)}\\div${tnum(d.P)}=${+(d.I / d.P * 100).toFixed(2)}\\%`)}, between ${d.r2}% and ${d.r1}% ✓.`, run: async (c) => {
        const s = stamp(stage, `${money(x)} at ${d.r1}%, ${money(y)} at ${d.r2}%`, { ok: true, x: W - 250, y: 194, size: 'sm' }); await stampIn(c, s);
      } }
    ];
  }
};

/* =============================== Section 6: rates on a graph =============================== */
const RT = {
  printers: { label: 'Two printers', names: ['Printer A', 'Printer B'], r: [20, 30], T: 15, out: 380, unit: 'min', item: 'pages', rate: 'pages per minute',
    p1: [12, 3], p2: [13, 4], sol: [7, 8], g: { xmin: -1.2, xmax: 20.5, ymin: -1.2, ymax: 16.5, xlabels: 2, ylabels: 2 } },
  pumps: { label: 'Two pumps', names: ['Pump A', 'Pump B'], r: [40, 60], T: 30, out: 1400, unit: 'min', item: 'L', rate: 'litres per minute',
    p1: [25, 5], p2: [5, 20], sol: [20, 10], g: { xmin: -2.5, xmax: 37, ymin: -2.5, ymax: 32, xstep: 5, ystep: 5, xlabels: 5, ylabels: 5 } }
};
const rates = {
  title: 'Time line, output line: only the crossing does both',
  height: 470,
  choices: Object.keys(RT).map((k) => ({ v: k, label: RT[k].label })),
  intro: (k) => { const d = RT[k]; return `${d.names[0]} makes ${d.r[0]} ${d.rate}, ${d.names[1]} makes ${d.r[1]}. Together they run ${d.T} min and make ${f5(d.out)} ${d.item}. Press <b>Next</b>.`; },
  make(stage, k, ex) {
    const d = RT[k], W = ex.W, GW = 470, out = (p) => d.r[0] * p[0] + d.r[1] * p[1];
    const G = new Graph(stage, Object.assign({ x: W - GW - 12, y: 8, width: GW, height: 454, xtitle: 'a', ytitle: 'b', fontSize: 16 }, d.g));
    const lp = panel(stage, 12, 8, W - GW - 40, 454, 'The story', 'u8l4-rpan');
    const mk = (i) => {
      const r = h('div', 'u8l4-mach', `<div class="u8l4-mn">${d.names[i]} <span>(${d.r[i]} ${d.item}/min)</span></div><div class="u8l4-mbar"><div class="u8l4-mfill"></div></div><div class="u8l4-mv"></div>`);
      lp.appendChild(r); return { r, fill: r.querySelector('.u8l4-mfill'), v: r.querySelector('.u8l4-mv') };
    };
    const M = [mk(0), mk(1)];
    const rt = h('div', 'u8l4-rrow u8l4-rr1'), ro = h('div', 'u8l4-rrow u8l4-rr2'), sense = h('div', 'u8l4-rsense');
    lp.append(rt, ro, sense); hide(sense);
    const vars = ['a', 'b'];
    const setPt = (p) => {
      M.forEach((m, i) => { m.fill.style.width = Math.max(0, p[i]) / d.T * 100 + '%'; m.v.innerHTML = `${T(`${vars[i]}=${+p[i].toFixed(1)}`)} min → ${f5(Math.round(d.r[i] * p[i]))} ${d.item}`; });
      const tt = p[0] + p[1], oo = out(p), okT = Math.abs(tt - d.T) < 0.05, okO = Math.abs(oo - d.out) < 0.5;
      rt.innerHTML = `<span class="u8l4-tag u8l4-t1">Eq. 1</span> time ${T(`${+p[0].toFixed(1)}+${+p[1].toFixed(1)}=${+tt.toFixed(1)}`)} <b class="${okT ? 'u8l4-ok' : 'u8l4-no'}">${okT ? '✓' : '✗'}</b>`;
      ro.innerHTML = `<span class="u8l4-tag u8l4-t2">Eq. 2</span> output ${T(tnum(Math.round(oo)))} ${d.item} <b class="${okO ? 'u8l4-ok' : 'u8l4-no'}">${okO ? '✓' : '✗'}</b>`;
    };
    const l1 = G.line([0, d.T], [d.T, 0], { color: BLUE, width: 4 }), l2 = G.line([0, d.out / d.r[1]], [d.out / d.r[0], 0], { color: AMB, width: 4 });
    l1.style.opacity = 0; l2.style.opacity = 0;
    const lab1 = G.label(d.g.xmax - 0.05, d.g.ymax - 0.05, T(`\\B{a+b=${d.T}}`), { pos: 'sw', cls: 'bk-ptlab u8l4-glab', dx: -8, dy: 6 }), lab2 = G.label(d.g.xmax - 0.05, d.g.ymax - 0.05, T(`\\A{${d.r[0]}a+${d.r[1]}b=${tnum(d.out)}}`), { pos: 'sw', cls: 'bk-ptlab u8l4-glab', dx: -8, dy: 40 });
    hide(lab1, lab2, rt, ro);
    const start = [2, d.T - 2];
    const pt = G.point(start[0], start[1], { color: INK, r: 8 }); pt.style.opacity = 0;
    const ptLab = G.label(start[0], start[1], '', { pos: 'ne', cls: 'bk-ptlab' }); hide(ptLab);
    let cur = start.slice();
    const moveTo = async (c, p, ms = 1000) => {
      const from = cur.slice();
      await tween(c, ms, (t) => { const q = [from[0] + (p[0] - from[0]) * t, from[1] + (p[1] - from[1]) * t]; G.moveTo(pt, q[0], q[1]); setPt(q); });
      cur = p.slice(); G.moveTo(pt, p[0], p[1]); setPt(p);
      ptLab.remove(); const nl = G.label(p[0], p[1], T(`(${p[0]},\\ ${p[1]})`), { pos: 'ne', cls: 'bk-ptlab' }); return nl;
    };
    let lastLab = null;
    const s = d.sol, avg = d.out / d.T;
    return [
      { cap: `Eq. 1 is <b>time</b>: ${T(`\\B{a+b=${d.T}}`)}. Every way to split ${d.T} minutes is a point on this line.`, run: async (c) => {
        l1.style.opacity = 1; await G.drawIn(l1, 700, c); await show(c, lab1);
        pt.style.opacity = 1; setPt(start); await show(c, rt); await show(c, ro);
        lastLab = await moveTo(c, d.p1, 1500);
      } },
      { cap: `At ${T(`(${d.p1[0]},\\ ${d.p1[1]})`)}: ${d.p1[0]} + ${d.p1[1]} = ${d.T} min ✓, but ${T(`${d.r[0]}(${d.p1[0]})+${d.r[1]}(${d.p1[1]})=${tnum(out(d.p1))}`)} ${d.item} ✗. On Eq. 1 <b>only</b>.`, run: async (c) => { await pulse(c, ro, 1.08); } },
      { cap: `Eq. 2 is <b>output</b>: ${T(`\\A{${d.r[0]}a+${d.r[1]}b=${tnum(d.out)}}`)}. A point on it, like ${T(`(${d.p2[0]},\\ ${d.p2[1]})`)}, makes ${f5(d.out)} ${d.item} ✓ but takes ${d.p2[0] + d.p2[1]} min ✗.`, run: async (c) => {
        l2.style.opacity = 1; await G.drawIn(l2, 700, c); await show(c, lab2);
        if (lastLab) lastLab.remove(); lastLab = await moveTo(c, d.p2, 1200);
      } },
      { cap: `The <b>crossing</b> ${T(`\\P{(${s[0]},\\ ${s[1]})}`)} is on both lines: ${s[0]} + ${s[1]} = ${d.T} min ✓ and ${T(`${d.r[0]}(${s[0]})+${d.r[1]}(${s[1]})=${d.r[0] * s[0]}+${d.r[1] * s[1]}=${tnum(d.out)}`)} ✓.`, run: async (c) => {
        if (lastLab) lastLab.remove(); lastLab = await moveTo(c, s, 1000);
        const sp = G.point(s[0], s[1], { color: PUR, r: 10 }); await G.reveal(sp, c); lastLab.style.color = PUR;
      } },
      { cap: `Check the story: both times are positive, and the average ${T(`${tnum(d.out)}\\div${d.T}\\approx${+avg.toFixed(1)}`)} ${d.rate} lies between ${d.r[0]} and ${d.r[1]} ✓.`, run: async (c) => {
        sense.innerHTML = `<b>${d.names[0]}: ${s[0]} min, ${d.names[1]}: ${s[1]} min.</b><br>Average ${+avg.toFixed(1)} ${d.rate}: between ${d.r[0]} and ${d.r[1]} ✓`;
        await show(c, sense);
      } }
    ];
  }
};

/* =============================== mount =============================== */
mountWarm();
export const explainers = mountExplainers({
  pipeline: pipeDef(['snack', 'sam']),
  method, step4, translate, rect, swap, interest, rates,
  ex1chk: pipeDef(['ex1'], { sep: 'Example 1 check' }),
  ex2chk: pipeDef(['ex2'], { sep: 'Example 2 check' }),
  ex3chk: pipeDef(['ex3'], { sep: 'Example 3 check' }),
  ex4chk: pipeDef(['ex4'], { sep: 'Example 4 check' }),
  ex5chk: pipeDef(['ex5'], { sep: 'Example 5 check' })
});
export const _test = { PIPE, MT, S4, TR, RC, SW, IV, RT };
void liveCtx; void GRN; void RED;
