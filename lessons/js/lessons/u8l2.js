/* Math 10C · Unit 8 · Lesson 2 — Solving Systems of Equations by Substitution.
 * Warm-up coin tray (swap nickels for dimes until the total matches the jar label) and the explainers:
 *   lift (the star: the isolated expression lifts out of one equation and drops, in brackets, into the other; the value
 *   flies back; the graph's crossing point confirms), choose (which variable to isolate: coefficients of 1 or −1),
 *   checkBoth (a solution balances BOTH equations; a point on one line only does not), fracs (fractions that clear:
 *   multiply every term, or let a coefficient cancel), exact (graphing-calculator decimal vs exact values),
 *   expand (clear the brackets first), vanish (0 = 0 or 0 = k: same line or parallel lines),
 *   three (Extension: three unknowns down to one).
 * Colours: first equation / line blue, second amber, third (Extension) green, solution purple. */
import {
  h, tex, add, box, place, Graph, stamp, stampIn, mountExplainers, pop, fadeIn, appear, sleep,
  svgEl, liveCtx, pulse, shake, anim, arrowHead, drawIn, COLORS
} from '../blocks.js';

const T = (s) => tex(String(s));
const BL = COLORS.blue, AM = COLORS.amber, PU = COLORS.purple, GR = COLORS.green, RED = COLORS.red;
const EQC = [BL, AM, GR];
const tc = (color, s) => `\\textcolor{${color}}{${s}}`;
const show = (c, el) => fadeIn(c, el, 320);
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u8l2-panel ' + cls, title ? `<div class="u8l2-ph">${title}</div>` : ''), w, hh), x, y);
const chunk = (s, cls = '') => h('span', 'u8l2-ch' + (cls ? ' ' + cls : ''), T(s));
const bw = (k, s) => `<b style="color:${EQC[k]}">${s}</b>`;
const gone = (el, on = true) => el.classList.toggle('u8l2-gone', on);
const kbd = (k) => `<kbd${k === '2nd' ? ' class="u8l2-k2"' : ''}>${k}</kbd>`;

/** a row in a work panel: gutter label + math (+ an optional note) */
function wrow(p, gut, t, o = {}) {
  const d = h('div', 'u8l2-row' + (o.cls ? ' ' + o.cls : ''), `<span class="u8l2-gut">${gut || ''}</span>`);
  const m = h('span', 'u8l2-ch' + (o.box ? ' u8l2-resbox' : ''), T(t)); d.appendChild(m);
  if (o.note) d.appendChild(h('span', 'u8l2-why', o.note));
  d.m = m; p.appendChild(d); return d;
}

/** position of el inside stage (stage px, corrected for any CSS zoom) */
function rel(stage, el) {
  const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = (s.width / stage.offsetWidth) || 1;
  return { x: (r.left - s.left) / k - stage.clientLeft, y: (r.top - s.top) / k - stage.clientTop, w: r.width / k, h: r.height / k };
}
/** a copy of src lifts out, arcs over and lands on dst (scaled to dst's font size) */
async function fly(c, stage, src, dst, o = {}) {
  const a = rel(stage, src), b = rel(stage, dst);
  const cl = add(stage, h('div', 'u8l2-fly', o.html || src.innerHTML), 0, 0);
  cl.style.fontSize = getComputedStyle(src).fontSize;
  const r0 = rel(stage, cl);
  const sx = a.x + a.w / 2 - (r0.x + r0.w / 2), sy = a.y + a.h / 2 - (r0.y + r0.h / 2);
  const dx = b.x + b.w / 2 - (r0.x + r0.w / 2), dy = b.y + b.h / 2 - (r0.y + r0.h / 2);
  const s = o.scale ?? (parseFloat(getComputedStyle(dst).fontSize) / parseFloat(getComputedStyle(src).fontSize) || 1);
  const mx = (sx + dx) / 2, my = Math.min(sy, dy) - (o.lift ?? 46), sm = ((1 + s) / 2) * 1.12;
  await anim(c, cl, [{ transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 0.4 },
    { transform: `translate(${sx}px, ${sy - 14}px) scale(1.12)`, opacity: 1, offset: 0.18 },
    { transform: `translate(${mx}px, ${my}px) scale(${sm})`, opacity: 1, offset: 0.58 },
    { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 1 }], o.ms || 1250, { easing: 'ease-in-out' });
  cl.remove();
}

/** a system graph: both lines in their colours, each labelled with its equation */
function sysGraph(stage, d, x, y, w, hh) {
  const G = new Graph(stage, Object.assign({ x, y, width: w, height: hh, fontSize: 15 }, d.g));
  const L = d.lines.map((ln, i) => G.line(ln, { color: EQC[i], width: 4 }));
  (d.labs || []).forEach(([lx, pos], i) => G.label(lx, d.lines[i].m * lx + d.lines[i].b, T(d.eqG ? d.eqG[i] : d.eq[i]), { pos, cls: 'bk-ptlab', color: EQC[i] }));
  return { G, L };
}

/** the two equation cards of a substitution: the top one is isolated (Step 1), its expression lifts into the bottom one (Step 2) */
function subCards(stage, d, x, y, w, o = {}) {
  const top = d.iso, bot = 1 - d.iso, cT = EQC[top], cB = EQC[bot], h1 = o.h1 || 100, h2 = o.h2 || 100;
  const C1 = add(stage, box(h('div', 'u8l2-card' + (top ? ' u8l2-c2' : '')), w, h1), x, y);
  const C2 = add(stage, box(h('div', 'u8l2-card' + (bot ? ' u8l2-c2' : '')), w, h2), x, y + h1 + (o.gap ?? 54));
  C1.appendChild(h('div', 'u8l2-sw')); C2.appendChild(h('div', 'u8l2-sw'));
  const s1 = h('div', 'u8l2-small', d.smallA && d.smallA[top] ? T(tc(cT, d.smallA[top])) : '&nbsp;'), b1 = h('div', 'u8l2-big');
  const bigA = chunk(tc(cT, d.eq[top])), bigB = h('span', 'u8l2-ch u8l2-gone');
  const ex1 = chunk(tc(cT, d.expr), 'u8l2-exbox' + (top ? ' u8l2-xa' : ''));
  bigB.append(chunk(tc(cT, d.lhs)), ex1);
  if (d.preIso) { gone(bigA); gone(bigB, false); }
  b1.append(bigA, bigB); C1.append(s1, b1);
  const s2 = h('div', 'u8l2-small', d.smallA && d.smallA[bot] ? T(tc(cB, d.smallA[bot])) : '&nbsp;'), b2 = h('div', 'u8l2-big');
  const tall = /frac/.test(d.expr) ? `\\vphantom{${d.expr}}` : '';
  const pre = chunk(tc(cB, d.pre)), slot = chunk(tc(cB, d.v)), lp = chunk(tc(cB, `\\left(${tall}\\right.`), 'u8l2-gone');
  const ex2 = chunk(tc(cT, d.expr), 'u8l2-gone'), rp = chunk(tc(cB, `\\left.${tall}\\right)`), 'u8l2-gone'), post = chunk(tc(cB, d.post));
  b2.append(pre, slot, lp, ex2, rp, post); C2.append(s2, b2);
  const tag = h('div', 'u8l2-tag', o.tag || `only ${T(d.sv)} left!`); tag.style.opacity = 0; C2.appendChild(tag);
  return {
    C1, C2, ex1, ex2, slot, tag,
    async isolate(c) {
      if (d.chain) { s1.innerHTML = T(tc(cT, d.chain)); await show(c, s1); }
      gone(bigA); gone(bigB, false); await show(c, bigB); await pulse(c, ex1, 1.1);
    },
    async substitute(c) {
      slot.classList.add('u8l2-strike'); await shake(c, slot); await sleep(c, 250);
      gone(slot); [lp, ex2, rp].forEach((e) => gone(e, false)); ex2.classList.add('u8l2-hid');
      await Promise.all([pop(c, lp), pop(c, rp)]);
      await fly(c, stage, ex1, ex2);
      ex2.classList.remove('u8l2-hid');
      await pop(c, tag, 420);
    }
  };
}

/* =============================== warm-up: swap coins =============================== */
function mountWarm() {
  const tray = document.getElementById('u8l2-tray'), read = document.getElementById('u8l2-read'); if (!tray) return;
  const coins = []; let dimes = 0;
  for (let i = 0; i < 20; i++) { const s = h('span', 'u8l2-coin u8l2-nk', '5¢'); tray.appendChild(s); coins.push(s); }
  const set = (k) => {
    dimes = Math.max(0, Math.min(20, k));
    coins.forEach((s, i) => { const dm = i >= 20 - dimes; s.className = 'u8l2-coin ' + (dm ? 'u8l2-dm' : 'u8l2-nk'); s.textContent = dm ? '10¢' : '5¢'; });
    const tot = 5 * (20 - dimes) + 10 * dimes, hit = tot === 140;
    read.innerHTML = `${20 - dimes} nickels + ${dimes} dimes = <span class="${hit ? 'u8l2-hit' : 'u8l2-tot'}">$${(tot / 100).toFixed(2)}</span>${hit ? ' <span class="u8l2-hit">✓ matches the label!</span>' : ''}`;
  };
  set(0);
  const c = liveCtx();
  document.getElementById('u8l2-swap1').addEventListener('click', () => { if (dimes >= 20) return; set(dimes + 1); pop(c, coins[20 - dimes], 360); });
  document.getElementById('u8l2-unswap').addEventListener('click', () => { if (dimes <= 0) return; const i = 20 - dimes; set(dimes - 1); pop(c, coins[i], 360); });
  document.getElementById('u8l2-reset').addEventListener('click', () => set(0));
}

/* =============================== explainer 1 (the star): lift and drop =============================== */
const SUB = {
  coin: { label: 'Warm-up: the coin jar', eq: ['n+d=20', '5n+10d=140'], iso: 0,
    intro: `Let ${T('n')} = number of nickels and ${T('d')} = number of dimes. Two facts, two equations: ${bw(0, 'coins')} and ${bw(1, 'value in cents')}. The answer is where the lines cross. Press <b>Next</b>.`,
    chain: 'n+d=20\\ \\Rightarrow', lhs: 'n=', expr: '20-d', v: 'n', pre: '5', post: '{}+10d=140',
    why: `${T('n')} has a coefficient of 1 in ${T('n+d=20')}, so ${T('n=20-d')} in one move.`,
    solve: ['100-5d+10d=140', '100+5d=140', '5d=40', 'd=8'], sv: 'd', val: 8,
    back: 'n=20-8=12', sol: [8, 12], solTex: '(8,\\ 12)', solPos: 'e',
    end: `<b>12 nickels and 8 dimes</b>, right where the lines cross. (The ${T('100')} is “all nickels” and the ${T('+5d')} is “each swap adds 5¢”: the warm-up <b>was</b> substitution!)`,
    lines: [{ m: -1, b: 20 }, { m: -2, b: 28 }], labs: [[17, 'ne'], [2.5, 'ne']],
    g: { xmin: -2, xmax: 22, ymin: -2, ymax: 30, xstep: 2, ystep: 2, xlabels: 4, ylabels: 4, xtitle: 'd', ytitle: 'n' } },
  e1a: { label: 'Example 1 (a)', eq: ['x+3y=13', '2x-y=5'], iso: 0,
    chain: 'x+3y=13\\ \\Rightarrow', lhs: 'x=', expr: '13-3y', v: 'x', pre: '2', post: '{}-y=5',
    why: `${T('x')} has a coefficient of 1 in ${T('x+3y=13')}: subtract ${T('3y')} to get ${T('x=13-3y')}.`,
    solve: ['26-6y-y=5', '26-7y=5', '-7y=-21', 'y=3'], sv: 'y', val: 3,
    back: 'x=13-3(3)=13-9=4', sol: [4, 3], solTex: '(4,\\ 3)', solPos: 'w',
    lines: [{ m: -1 / 3, b: 13 / 3 }, { m: 2, b: -5 }], labs: [[7.5, 'n'], [6.2, 'e']],
    g: { xmin: -3, xmax: 9, ymin: -4, ymax: 8, xlabels: 2, ylabels: 2 } },
  e1b: { label: 'Example 1 (b)', eq: ['x+3y=13', '2x-y=5'], iso: 0,
    chain: 'x+3y=13\\ \\Rightarrow\\ 3y=13-x\\ \\Rightarrow', lhs: 'y=', expr: '\\dfrac{13-x}{3}', v: 'y', pre: '2x-{}', post: '{}=5',
    why: `This time solve the same equation for ${T('y')}: ${T('3y=13-x')}, so ${T('y=\\dfrac{13-x}{3}')}. A fraction, and that’s fine.`,
    solve: [{ t: '6x-(13-x)=15', note: 'every term × 3' }, '6x-13+x=15', '7x=28', 'x=4'], sv: 'x', val: 4,
    back: 'y=\\dfrac{13-4}{3}=\\dfrac{9}{3}=3', sol: [4, 3], solTex: '(4,\\ 3)', solPos: 'w',
    end: `The solution is ${T('(4,\\ 3)')} again: the <b>same</b> crossing point as part (a). Either route works.`,
    lines: [{ m: -1 / 3, b: 13 / 3 }, { m: 2, b: -5 }], labs: [[-2.5, 'n'], [6.2, 'e']],
    g: { xmin: -3, xmax: 9, ymin: -4, ymax: 8, xlabels: 2, ylabels: 2 } },
  e2: { label: 'Example 2', eq: ['2x+3y=0', '4x-5y=22'], iso: 0,
    chain: '2x+3y=0\\ \\Rightarrow\\ 2x=-3y\\ \\Rightarrow', lhs: 'x=', expr: '-\\dfrac{3y}{2}', v: 'x', pre: '4', post: '{}-5y=22',
    why: `No coefficient is 1 here. Solve ${T('2x+3y=0')} for ${T('x')}: ${T('2x=-3y')}, so ${T('x=-\\dfrac{3y}{2}')}.`,
    solve: [{ t: '-6y-5y=22', note: 'the 4 cancels the 2' }, '-11y=22', 'y=-2'], sv: 'y', val: -2,
    back: 'x=-\\dfrac{3(-2)}{2}=\\dfrac{6}{2}=3', sol: [3, -2], solTex: '(3,\\ -2)', solPos: 'e',
    lines: [{ m: -2 / 3, b: 0 }, { m: 0.8, b: -4.4 }], labs: [[-2, 'ne'], [7, 'nw']],
    g: { xmin: -3, xmax: 8, ymin: -6, ymax: 5, xlabels: 2, ylabels: 2 } },
  e3: { label: 'Example 3', eq: ['4x+3y=2', '2x-y=5'], iso: 1,
    chain: '2x-y=5\\ \\Rightarrow\\ -y=-2x+5\\ \\Rightarrow', lhs: 'y=', expr: '2x-5', v: 'y', pre: '4x+3', post: '{}=2',
    why: `${T('y')} has a coefficient of ${T('-1')} in ${T('2x-y=5')}: ${T('-y=-2x+5')}, so ${T('y=2x-5')}.`,
    solve: ['4x+6x-15=2', '10x=17', 'x=\\dfrac{17}{10}'], sv: 'x', val: 1.7,
    back: 'y=2\\left(\\dfrac{17}{10}\\right)-5=\\dfrac{34}{10}-\\dfrac{50}{10}=-\\dfrac{8}{5}', sol: [1.7, -1.6],
    solTex: '\\left(\\dfrac{17}{10},\\ -\\dfrac{8}{5}\\right)', solPos: 'e',
    end: `The exact solution ${T('\\left(\\tfrac{17}{10},\\ -\\tfrac{8}{5}\\right)')} is <b>exactly</b> ${T('(1.7,\\ -1.6)')}, the crossing point the calculator found.`,
    lines: [{ m: -4 / 3, b: 2 / 3 }, { m: 2, b: -5 }], labs: [[-2.2, 'e'], [3.2, 'e']],
    g: { xmin: -3, xmax: 6, ymin: -7, ymax: 4, xlabels: 2, ylabels: 2 } },
  e4: { label: 'Example 4', eq: ['a-2b=2', '4a+3b=19'], iso: 0,
    intro: `Example 4 with both equations already <b>expanded</b> (Section 2). The variables are ${T('a')} (across) and ${T('b')} (up). Press <b>Next</b>.`,
    smallA: ['a-2(b-3)=8\\ \\Rightarrow', '4a+3(b-2)=13\\ \\Rightarrow'],
    chain: 'a-2(b-3)=8\\ \\Rightarrow\\ a-2b=2\\ \\Rightarrow', lhs: 'a=', expr: '2b+2', v: 'a', pre: '4', post: '{}+3b=19',
    why: `${T('a')} has a coefficient of 1 in ${T('a-2b=2')}: ${T('a=2b+2')}.`,
    solve: ['8b+8+3b=19', '11b+8=19', '11b=11', 'b=1'], sv: 'b', val: 1,
    back: 'a=2(1)+2=4', sol: [4, 1], solTex: '(4,\\ 1)', solPos: 'e',
    end: `The solution is ${T('a=4,\\ b=1')}: the point ${T('(4,\\ 1)')} where the lines cross.`,
    lines: [{ m: 0.5, b: -1 }, { m: -4 / 3, b: 19 / 3 }], labs: [[5, 'se'], [1, 'e']],
    g: { xmin: -2, xmax: 8, ymin: -3, ymax: 7, xlabels: 2, ylabels: 2, xtitle: 'a', ytitle: 'b' } }
};
const xvOf = (d) => (d.g.xtitle || 'x');
const lift = {
  title: 'Substitution: lift the expression, drop it in',
  height: 540,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'coin', label: SUB.coin.label }, { sep: 'Example checks' }, ...['e1a', 'e1b', 'e2', 'e3', 'e4'].map((k) => ({ v: k, label: SUB[k].label }))],
  intro: (k) => SUB[k].intro || `Two equations, two unknowns. On the graph, the solution is where the ${bw(0, 'blue')} and ${bw(1, 'amber')} lines cross. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SUB[k], GW = 420, LW = ex.W - GW - 44, gx = ex.W - GW - 14;
    const { G } = sysGraph(stage, d, gx, 14, GW, 440);
    const K = subCards(stage, d, 14, 14, LW);
    const P = panel(stage, 14, 282, LW, ex.def.height - 296, '', 'u8l2-work');
    const S = add(stage, box(h('div', 'u8l2-soln'), GW, 60), gx, 466);
    const steps = d.solve.map((s) => (typeof s === 'string' ? { t: s } : s)), res = steps[steps.length - 1].t;
    const hor = d.sv === xvOf(d), valTex = res.split('=')[1];
    const solveRows = [];
    return [
      { cap: `<b>Step 1: Isolate.</b> ${d.why}`, run: (c) => K.isolate(c) },
      { cap: `<b>Step 2: Substitute.</b> ${T(d.v)} <b>is</b> ${T(d.expr)}, so lift that expression into the <b>other</b> equation, in brackets. Now only ${T(d.sv)} is left: one equation, one unknown.`,
        run: (c) => K.substitute(c) },
      { cap: `<b>Step 3: Solve</b> for ${T(d.sv)}: ${T(res)}. On the graph, every point on the dashed line has ${T(d.sv + '=' + valTex)}.`,
        run: async (c) => {
          for (let i = 0; i < steps.length; i++) {
            const last = i === steps.length - 1;
            const r = wrow(P, i ? '' : 'Step 3', last ? tc(PU, steps[i].t) : steps[i].t, { note: steps[i].note, box: last });
            solveRows.push(r); await show(c, r); await sleep(c, 120);
          }
          const gl = hor ? G.vline(d.val, { color: PU, width: 3 }) : G.hline(d.val, { color: PU, width: 3 });
          await G.drawIn(gl, 700, c);
        } },
      { cap: `<b>Step 4: Back-substitute</b> ${T(res)} into ${T(d.lhs + d.expr)}: ${T(d.back)}.`,
        run: async (c) => {
          const src = solveRows[solveRows.length - 1].m;
          await fly(c, stage, src, K.ex1, { html: T(tc(PU, valTex)), scale: 1.1 });
          await pulse(c, K.ex1, 1.12);
          const r = wrow(P, 'Step 4', tc(PU, d.back)); await show(c, r);
        } },
      { cap: d.end || `The solution is ${T(d.solTex)}: exactly where the two lines <b>cross</b>.`,
        run: async (c) => {
          const pt = G.point(d.sol[0], d.sol[1], { color: PU, r: 8, label: T(tc(PU, d.solTex)), pos: d.solPos });
          await G.reveal(pt, c);
          const sp = h('span', 'u8l2-ch', T(tc(PU, d.solTex))); S.appendChild(sp); await show(c, sp);
          const st = stamp(S, 'on both lines', { ok: true }); await stampIn(c, st);
        } }
    ];
  }
};

/* =============================== explainer 2: which variable to isolate? =============================== */
const CH = {
  coin: { label: 'Warm-up', eqs: [[['n', 1], ['+d', 1], ['=20']], [['5n', 5], ['+10d', 10], ['=140']]], vars: ['n', 'd'],
    opts: [[0, 'n', 'n=20-d', true, 'no fraction'], [0, 'd', 'd=20-n', true, 'no fraction'], [1, 'n', 'n=28-2d', true, '5 divides every term evenly'], [1, 'd', 'd=14-\\dfrac{n}{2}', false, 'fraction']],
    used: { 0: 'Warm-up' }, cap2: `Both coefficients in ${T('n+d=20')} are 1: either variable comes out with no dividing at all.`,
    cap4: `The warm-up used ${T('n=20-d')}. Any of the four would give 12 nickels and 8 dimes.` },
  e1: { label: 'Example 1', eqs: [[['x', 1], ['+3y', 3], ['=13']], [['2x', 2], ['-y', -1], ['=5']]], vars: ['x', 'y'],
    opts: [[0, 'x', 'x=13-3y', true, 'no fraction'], [0, 'y', 'y=\\dfrac{13-x}{3}', false, 'fraction'], [1, 'x', 'x=\\dfrac{y+5}{2}', false, 'fraction'], [1, 'y', 'y=2x-5', true, 'no fraction']],
    used: { 0: 'Example 1 (a)', 1: 'Example 1 (b)' }, cap2: `${T('x')} in ${T('x+3y=13')} has coefficient 1 and ${T('y')} in ${T('2x-y=5')} has coefficient ${T('-1')}: no dividing, no fractions.`,
    cap4: `Example 1 (a) uses ${T('x=13-3y')} and (b) uses ${T('y=\\dfrac{13-x}{3}')}. Both reach ${T('(4,\\ 3)')}; one is just tidier.` },
  e2: { label: 'Example 2', eqs: [[['2x', 2], ['+3y', 3], ['=0']], [['4x', 4], ['-5y', -5], ['=22']]], vars: ['x', 'y'],
    opts: [[0, 'x', 'x=-\\dfrac{3y}{2}', true, `into ${T('4x')}: the 4 cancels the 2`], [0, 'y', 'y=-\\dfrac{2x}{3}', false, `into ${T('-5y')}: fraction stays`], [1, 'x', 'x=\\dfrac{22+5y}{4}', false, `into ${T('2x')}: fraction stays`], [1, 'y', 'y=\\dfrac{4x-22}{5}', false, `into ${T('3y')}: fraction stays`]],
    used: { 0: 'Example 2' }, cap2: `No coefficient is 1 or ${T('-1')}: every choice makes a fraction. So pick one that the <b>other</b> equation will cancel.`,
    cap4: `Example 2 uses ${T('x=-\\dfrac{3y}{2}')}: in ${T('4x')} the 4 cancels the 2, and the fraction disappears at once. The others still work, with more fraction work.` },
  e3: { label: 'Example 3', eqs: [[['4x', 4], ['+3y', 3], ['=2']], [['2x', 2], ['-y', -1], ['=5']]], vars: ['x', 'y'],
    opts: [[0, 'x', 'x=\\dfrac{2-3y}{4}', false, 'fraction'], [0, 'y', 'y=\\dfrac{2-4x}{3}', false, 'fraction'], [1, 'x', 'x=\\dfrac{y+5}{2}', false, 'fraction'], [1, 'y', 'y=2x-5', true, 'no fraction']],
    used: { 3: 'Example 3 (a)' }, cap2: `Only ${T('y')} in ${T('2x-y=5')} has coefficient ${T('-1')}.`,
    cap4: `Example 3 (a) asks for exactly that: ${T('y=2x-5')}.` },
  e4: { label: 'Example 4', eqs: [[['a', 1], ['-2b', -2], ['=2']], [['4a', 4], ['+3b', 3], ['=19']]], vars: ['a', 'b'],
    opts: [[0, 'a', 'a=2b+2', true, 'no fraction'], [0, 'b', 'b=\\dfrac{a-2}{2}', false, 'fraction'], [1, 'a', 'a=\\dfrac{19-3b}{4}', false, 'fraction'], [1, 'b', 'b=\\dfrac{19-4a}{3}', false, 'fraction']],
    used: { 0: 'Example 4' }, cap2: `After expanding, ${T('a')} in ${T('a-2b=2')} has coefficient 1.`,
    cap4: `Example 4 uses ${T('a=2b+2')}.` }
};
const choose = {
  title: 'Which variable should I isolate?',
  height: 446, // the four choices sit 2 x 2 beside the sidebar (no minW: the cards stay full size)
  choices: ['coin', 'e1', 'e2', 'e3', 'e4'].map((k) => ({ v: k, label: CH[k].label })),
  intro: () => `Four possible choices: either variable, from either equation. Which is tidiest? Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = CH[k];
    const R = add(stage, box(h('div', 'u8l2-eqrow'), ex.W, 60), 0, 18);
    const terms = [], badges = [];
    d.eqs.forEach((eq, i) => {
      const e = h('span', 'u8l2-ch');
      eq.forEach(([t, kf], j) => {
        const s = h('span', 'u8l2-term', T(tc(EQC[i], (j ? '{}' : '') + t))); e.appendChild(s);
        if (kf != null) { const b = h('span', 'u8l2-coef' + (Math.abs(kf) === 1 ? ' u8l2-one' : ''), String(kf).replace('-', '−')); b.style.opacity = 0; s.appendChild(b); terms.push([s, kf]); badges.push(b); }
      });
      R.appendChild(e);
    });
    const O = add(stage, box(h('div', 'u8l2-opts'), ex.W - 28, 300), 14, 132);
    const cards = d.opts.map(([eqi, v, t, ok, note]) => {
      const eqTex = d.eqs[eqi].map((p) => p[0]).join('');
      const cd = h('div', 'u8l2-opt' + (eqi ? ' u8l2-o2' : ''), `<div class="u8l2-oh">solve ${T(tc(EQC[eqi], eqTex))} for ${T(v)}</div><div class="u8l2-ot">${T(tc(EQC[eqi], t))}</div><div class="u8l2-on">${note}</div>`);
      cd.style.opacity = 0; O.appendChild(cd); cd.ok = ok; return cd;
    });
    return [
      { cap: `Look at the <b>coefficient</b> of each variable.`, run: async (c) => { for (const b of badges) await pop(c, b, 260); } },
      { cap: `A coefficient of ${T('1')} or ${T('-1')} means <b>no dividing</b>, so no fractions. ${d.cap2}`,
        run: async (c) => { terms.forEach(([s, kf]) => s.classList.add(Math.abs(kf) === 1 ? 'u8l2-one' : 'u8l2-notone')); await pulse(c, R, 1.03); } },
      { cap: `All four choices, worked out. Each one is correct.`,
        run: async (c) => {
          for (const cd of cards) {
            await show(c, cd);
            const st = stamp(cd, cd.ok ? '✓ tidy' : 'fraction', { ok: cd.ok ? true : null, size: 'sm' }); await stampIn(c, st);
          }
        } },
      { cap: d.cap4, run: async (c) => {
        for (const [i, lab] of Object.entries(d.used)) { const cd = cards[i]; cd.classList.add('u8l2-pick'); const u = h('div', 'u8l2-used', lab); cd.appendChild(u); await pop(c, u, 320); }
      } }
    ];
  }
};

/* =============================== explainer 3: check in BOTH equations =============================== */
const CK = {
  e1: { label: 'Example 1 (c)', sys: SUB.e1a, at: 'x=4,\\ y=3', pt: [4, 3], ptTex: '(4,\\ 3)',
    c: [{ eq: 'x+3y=13', L: ['4+3(3)=4+9=13'], v: '13', R: '13', ok: true }, { eq: '2x-y=5', L: ['2(4)-3=8-3=5'], v: '5', R: '5', ok: true }] },
  wrong: { label: 'Is (1, 4) a solution?', sys: SUB.e1a, at: 'x=1,\\ y=4', pt: [1, 4], ptTex: '(1,\\ 4)', real: [4, 3],
    c: [{ eq: 'x+3y=13', L: ['1+3(4)=1+12=13'], v: '13', R: '13', ok: true }, { eq: '2x-y=5', L: ['2(1)-4=2-4=-2'], v: '-2', R: '5', ok: false }] },
  e2: { label: 'Example 2', sys: SUB.e2, at: 'x=3,\\ y=-2', pt: [3, -2], ptTex: '(3,\\ -2)',
    c: [{ eq: '2x+3y=0', L: ['2(3)+3(-2)=6-6=0'], v: '0', R: '0', ok: true }, { eq: '4x-5y=22', L: ['4(3)-5(-2)=12+10=22'], v: '22', R: '22', ok: true }] },
  e3: { label: 'Example 3 (c)', sys: SUB.e3, at: 'x=\\tfrac{17}{10},\\ y=-\\tfrac85', pt: [1.7, -1.6], ptTex: '\\left(\\tfrac{17}{10},\\ -\\tfrac85\\right)',
    c: [{ eq: '4x+3y=2', L: ['4\\left(\\dfrac{17}{10}\\right)+3\\left(-\\dfrac{8}{5}\\right)', '=\\dfrac{68}{10}-\\dfrac{48}{10}=\\dfrac{20}{10}=2'], v: '2', R: '2', ok: true },
      { eq: '2x-y=5', L: ['2\\left(\\dfrac{17}{10}\\right)-\\left(-\\dfrac{8}{5}\\right)', '=\\dfrac{34}{10}+\\dfrac{16}{10}=\\dfrac{50}{10}=5'], v: '5', R: '5', ok: true }] },
  e4: { label: 'Example 4 (b)', sys: SUB.e4, at: 'a=4,\\ b=1', pt: [4, 1], ptTex: '(4,\\ 1)', orig: true,
    c: [{ eq: 'a-2(b-3)=8', L: ['4-2(1-3)=4-2(-2)', '=4+4=8'], v: '8', R: '8', ok: true }, { eq: '4a+3(b-2)=13', L: ['4(4)+3(1-2)=16+3(-1)', '=16-3=13'], v: '13', R: '13', ok: true }] }
};
/** a check card: left side worked out, the right side, then the verdict (rows hidden until played) */
function ckCard(stage, q, i, at, x, y, w, hh) {
  const P = panel(stage, x, y, w, hh, `In ${T(tc(EQC[i], q.eq))} with ${T(at)}`, 'u8l2-ckc u8l2-ck' + (i + 1));
  const rows = q.L.map((t, j) => wrow(P, j ? '' : 'Left side', t));
  rows.push(wrow(P, 'Right side', q.R));
  const vr = wrow(P, '', `${q.v}${q.ok ? '=' : '\\ne'}${q.R}`, { note: q.ok ? '✓ balances' : '✗ does not balance' });
  vr.lastChild.className = 'u8l2-why ' + (q.ok ? 'u8l2-good' : 'u8l2-bad'); vr.m.classList.add(q.ok ? 'u8l2-okbox' : 'u8l2-nobox');
  rows.push(vr); rows.forEach((r) => (r.style.opacity = 0));
  P.play = async (c) => { for (const r of rows) { await show(c, r); await sleep(c, 140); } };
  return P;
}
const checkBoth = {
  title: 'Check the solution in BOTH equations',
  height: 500,
  minW: 900, // the check cards need ~470 px beside the graph
  choices: [{ v: 'e1', label: CK.e1.label }, { v: 'wrong', label: CK.wrong.label }, { sep: 'Example checks' }, ...['e2', 'e3', 'e4'].map((k) => ({ v: k, label: CK[k].label }))],
  intro: (k) => (CK[k].orig ? `Example 4 (b): check ${T('a=4,\\ b=1')} in the <b>original</b> equations, brackets and all. Press <b>Next</b>.` : `Is ${T(CK[k].ptTex)} the solution? It must balance <b>both</b> equations. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = CK[k], s = d.sys, GW = 380, CW = ex.W - GW - 44, CH2 = (ex.def.height - 42) / 2;
    const { G } = sysGraph(stage, s, ex.W - GW - 14, 14, GW, 390);
    const cards = d.c.map((q, i) => ckCard(stage, q, i, d.at, 14, 14 + i * (CH2 + 14), CW, CH2));
    const S = add(stage, box(h('div', 'u8l2-soln'), GW, 76), ex.W - GW - 14, 412);
    const both = d.c.every((q) => q.ok);
    const capC = (i) => { const q = d.c[i]; return `In the ${bw(i, i ? 'amber' : 'blue')} equation ${T(q.eq)}: ${q.ok ? `the left side is ${T(q.v)}, the right side is ${T(q.R)} ✓` : `the left side is ${T(q.v)}, but the right side is ${T(q.R)} ✗`}.`; };
    return [
      { cap: `Plot ${T(d.ptTex)} on the graph.`, run: async (c) => { await G.reveal(G.point(d.pt[0], d.pt[1], { color: PU, r: 8, label: T(tc(PU, d.ptTex)), pos: k === 'wrong' ? 'w' : 'e' }), c); } },
      { cap: capC(0), run: (c) => cards[0].play(c) },
      { cap: capC(1), run: (c) => cards[1].play(c) },
      { cap: both ? `It balances <b>both</b> equations, so it lies on <b>both</b> lines: ${T(d.ptTex)} is the solution.`
        : `It balances only the blue equation, so it lies on the blue line only. <b>Not a solution.</b> The solution is the crossing point ${T('(4,\\ 3)')}.`,
        run: async (c) => {
          if (!both) await G.reveal(G.point(d.real[0], d.real[1], { color: PU, r: 8, open: true, label: T(tc(PU, '(4,\\ 3)')), pos: 'e' }), c);
          const st = stamp(S, both ? 'solution ✓' : 'not a solution ✗', { ok: both }); await stampIn(c, st);
        } }
    ];
  }
};

/* =============================== explainer 4: fractions that clear =============================== */
const FR = {
  b1: { label: 'Example 1 (b): multiply every term', intro: `Example 1 (b), after Step 2: ${T('2x-\\dfrac{13-x}{3}=5')}. A fraction! Press <b>Next</b>.` },
  e2: { label: 'Example 2: the 4 cancels the 2', intro: `Example 2, after Step 2: ${T('4\\left(-\\dfrac{3y}{2}\\right)-5y=22')}. Press <b>Next</b>.` },
  e5: { label: 'Example 5: the 3 cancels the 3', intro: `<span class="u8l2-ext sm">Extension</span> Example 5, after Step 2: ${T('4p-3\\left(\\dfrac{p+5}{3}\\right)-2(2p)=-9')}. Press <b>Next</b>.` }
};
const fracs = {
  title: 'Fractions that clear',
  height: 400,
  choices: Object.keys(FR).map((k) => ({ v: k, label: FR[k].label })),
  intro: (k) => FR[k].intro,
  make(stage, k, ex) {
    const W = ex.W, mrow = (y, t, note, cls = '') => { const r = add(stage, box(h('div', 'u8l2-mrow ' + cls, T(t) + (note ? `<span class="u8l2-why">${note}</span>` : '')), W, 52), 0, y); r.style.opacity = 0; return r; };
    if (k === 'b1') {
      const R1 = add(stage, box(h('div', 'u8l2-tiles'), W, 80), 0, 62);
      const tl = ['2x', '-\\dfrac{13-x}{3}', '=', '5'].map((t, i) => { const e = h('span', 'u8l2-tile' + (i === 2 ? ' u8l2-plain' : ''), T(t)); R1.appendChild(e); return e; });
      const R2 = add(stage, box(h('div', 'u8l2-tiles'), W, 80), 0, 168); R2.style.opacity = 0;
      const t2 = ['6x', '-(13-x)', '=', '15'].map((t, i) => { const e = h('span', 'u8l2-tile' + (i === 2 ? ' u8l2-plain' : i === 1 ? ' u8l2-warn' : ''), T(t)); R2.appendChild(e); return e; });
      const r3 = mrow(268, `6x${tc(PU, '-13+x')}=15`, 'the minus reaches both terms'), r4 = mrow(330, `7x=28\\ \\Rightarrow\\ ${tc(PU, 'x=4')}`);
      const ms = [0, 1, 3].map((i) => { const m = h('span', 'u8l2-mult', '× 3'); m.style.opacity = 0; tl[i].appendChild(m); return m; });
      return [
        { cap: `Multiply <b>every term</b>, on both sides, by the denominator ${T('3')}.`, run: async (c) => { for (const m of ms) await pop(c, m, 300); } },
        { cap: `${T('2x\\times3=6x')}, the ${T('3')} underneath cancels, and ${T('5\\times3=15')}. No more fraction, but <b>keep the bracket</b>: ${T('-(13-x)')}.`,
          run: async (c) => { await show(c, R2); await pulse(c, t2[1], 1.08); } },
        { cap: `The minus belongs to the <b>whole</b> bracket: ${T('-(13-x)=-13+x')}.`, run: (c) => show(c, r3) },
        { cap: `Collect and solve: ${T('7x=28')}, so ${T('x=4')}. Same answer as part (a).`, run: (c) => show(c, r4) }
      ];
    }
    if (k === 'e2') {
      const r1 = mrow(50, '4\\left(-\\dfrac{3y}{2}\\right)-5y=22'), r1b = mrow(50, `${tc(PU, '4')}\\left(-\\dfrac{3y}{${tc(PU, '2')}}\\right)-5y=22`);
      r1.style.opacity = 1;
      const r2 = mrow(140, `\\overset{${tc(PU, '2')}}{\\cancel{4}}\\left(-\\dfrac{3y}{\\cancel{2}}\\right)=2(-3y)=-6y`, '4 ÷ 2 = 2'), r3 = mrow(230, '-6y-5y=22\\ \\Rightarrow\\ -11y=22'), r4 = mrow(310, `${tc(PU, 'y=-2')}`);
      return [
        { cap: `The ${T('4')} in front and the ${T('2')} underneath share a factor of 2.`, run: async (c) => { r1.style.opacity = 0; await show(c, r1b); } },
        { cap: `Cancel: ${T('4\\div2=2')}, so ${T('4\\left(-\\dfrac{3y}{2}\\right)=-6y')}. The fraction is gone in one move.`, run: (c) => show(c, r2) },
        { cap: `No fractions left: ${T('-6y-5y=22')}, so ${T('-11y=22')}.`, run: (c) => show(c, r3) },
        { cap: `${T('y=-2')}. This is why Example 2 isolated ${T('x')}: the ${T('4')} in ${T('4x')} was ready to cancel the ${T('2')}.`, run: (c) => show(c, r4) }
      ];
    }
    const r1 = mrow(50, '4p-3\\left(\\dfrac{p+5}{3}\\right)-2(2p)=-9'), r1b = mrow(50, `4p-${tc(PU, '3')}\\left(\\dfrac{p+5}{${tc(PU, '3')}}\\right)-2(2p)=-9`);
    r1.style.opacity = 1;
    const r2 = mrow(140, '-\\cancel{3}\\left(\\dfrac{p+5}{\\cancel{3}}\\right)=-(p+5)', '3 ÷ 3 = 1'), r3 = mrow(220, `4p${tc(PU, '-p-5')}-4p=-9`, 'the minus reaches both terms');
    const r4 = mrow(300, `-p-5=-9\\ \\Rightarrow\\ -p=-4\\ \\Rightarrow\\ ${tc(PU, 'p=4')}`);
    return [
      { cap: `The ${T('3')} in front cancels the ${T('3')} underneath.`, run: async (c) => { r1.style.opacity = 0; await show(c, r1b); } },
      { cap: `${T('-3\\left(\\dfrac{p+5}{3}\\right)=-(p+5)')}: the fraction is gone, the bracket stays.`, run: (c) => show(c, r2) },
      { cap: `The minus reaches <b>both</b> terms: ${T('-(p+5)=-p-5')}. And ${T('-2(2p)=-4p')}.`, run: (c) => show(c, r3) },
      { cap: `The ${T('4p')} and ${T('-4p')} cancel: ${T('-p-5=-9')}, so ${T('p=4')}.`, run: (c) => show(c, r4) }
    ];
  }
};

/* =============================== explainer 5: exact values vs the graphing calculator =============================== */
const EX = {
  e3: { label: 'Example 3: 1.7 or 17/10?', lines: [{ m: -4 / 3, b: 2 / 3 }, { m: 2, b: -5 }], ys: ['Y_1=(2-4X)/3', 'Y_2=2X-5'], pt: [1.7, -1.6], ro: ['1.7', '-1.6'] },
  third: { label: 'A decimal that never ends', lines: [{ m: -1, b: 1 }, { m: 2, b: 0 }], ys: ['Y_1=1-X', 'Y_2=2X'], pt: [1 / 3, 2 / 3], ro: ['.33333333', '.66666667'] }
};
const exact = {
  title: 'The calculator’s decimal vs the exact value',
  height: 450,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(EX).map((k) => ({ v: k, label: EX[k].label })),
  intro: (k) => (k === 'e3' ? `Lesson 1A, Example 4: ${T(tc(BL, '4x+3y=2'))} and ${T(tc(AM, '2x-y=5'))}, solved on the <b>graphing calculator</b> (TI-84). Press <b>Next</b>.`
    : `A new system: ${T(tc(BL, 'x+y=1'))} and ${T(tc(AM, 'y=2x'))}. Graphing calculator first. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = EX[k], GW = 400;
    const G = new Graph(stage, { x: 14, y: 14, width: GW, height: 300, theme: 'calc', xmin: -10, xmax: 10, ymin: -10, ymax: 10 });
    const L = d.lines.map((ln, i) => G.line(ln, { color: EQC[i], width: 3 })); L.forEach((l) => (l.style.opacity = 0));
    const KB = add(stage, box(h('div', 'u8l2-keys'), GW, 44), 14, 326);
    const note = add(stage, box(h('div', 'u8l2-calcnote', 'TI-83/84 graphing calculator keys (Lesson 1A)'), GW, 24), 14, 376);
    const P = panel(stage, GW + 34, 14, ex.W - GW - 48, ex.def.height - 28, 'Substitution: exact values');
    const keys = async (c, ks) => { KB.innerHTML = ''; for (const kk of ks) { const e = h('span', '', kbd(kk)); KB.appendChild(e); await pop(c, e, 200); } };
    const rows = k === 'e3'
      ? [['Step 2', `4x+3(${tc(AM, '2x-5')})=2`], ['Step 3', '10x=17'], ['', `${tc(PU, 'x=\\dfrac{17}{10}')}`], ['Step 4', `y=2\\left(\\dfrac{17}{10}\\right)-5=${tc(PU, '-\\dfrac{8}{5}')}`]]
      : [['Step 2', `x+${tc(AM, '2x')}=1`], ['Step 3', '3x=1'], ['', `${tc(PU, 'x=\\dfrac13')}`], ['Step 4', `y=2\\left(\\dfrac13\\right)=${tc(PU, '\\dfrac23')}`]];
    const R = rows.map(([g, t]) => { const r = wrow(P, g, t); r.style.opacity = 0; return r; });
    const cmp = k === 'e3'
      ? [['Compare', `\\dfrac{17}{10}=1.7`, '✓ exactly'], ['', `-\\dfrac{8}{5}=-1.6`, '✓ exactly']]
      : [['Check', `2(.33333333)=.66666666`, '✗ not .66666667'], ['', `2\\left(\\dfrac13\\right)=\\dfrac23`, '✓ exactly']];
    const C = cmp.map(([g, t, n]) => { const r = wrow(P, g, t, { note: n }); r.style.opacity = 0; r.lastChild.className = 'u8l2-why ' + (n[0] === '✓' ? 'u8l2-good' : 'u8l2-bad'); return r; });
    return [
      { cap: `${kbd('Y=')} ${T(d.ys[0])} and ${T(d.ys[1])}, then ${kbd('GRAPH')} in the standard window.`,
        run: async (c) => { await keys(c, ['Y=', 'GRAPH']); for (const l of L) { l.style.opacity = 1; await G.drawIn(l, 600, c); } } },
      { cap: `${kbd('2nd')} ${kbd('TRACE')} <b>5:intersect</b>, then ${kbd('ENTER')} three times: X=${d.ro[0]}, Y=${d.ro[1].replace('-', '−')}.`,
        run: async (c) => {
          await keys(c, ['2nd', 'TRACE', '5', 'ENTER', 'ENTER', 'ENTER']);
          const p = G.point(d.pt[0], d.pt[1], { color: PU, r: 6 }); await G.reveal(p, c);
          const ro = G.readout('Intersection', { x: d.pt[0], y: d.pt[1] });
          ro.querySelector('.bk-ro-x').textContent = 'X=' + d.ro[0]; ro.querySelector('.bk-ro-y').textContent = 'Y=' + d.ro[1];
          await appear(c, ro);
        } },
      { cap: k === 'e3' ? `Is ${T('1.7')} exact, or rounded? The screen can’t say. Substitution: ${T('10x=17')}, so ${T('x=\\tfrac{17}{10}')} and ${T('y=-\\tfrac{8}{5}')}.`
        : `Substitution: ${T('x+2x=1')}, so ${T('3x=1')}: ${T('x=\\tfrac13')} and ${T('y=\\tfrac23')}.`,
        run: async (c) => { for (const r of R) { await show(c, r); await sleep(c, 100); } } },
      { cap: k === 'e3' ? `${T('\\tfrac{17}{10}=1.7')} and ${T('-\\tfrac{8}{5}=-1.6')} <b>exactly</b>: this time the screen happened to be exact. Only the algebra proves it.`
        : `The screen <b>rounded</b>: ${T('\\tfrac13=0.333\\ldots')} never ends. Rounded decimals don’t even check: ${T('2(.33333333)=.66666666')}. The fractions check exactly.`,
        run: async (c) => { for (const r of C) { await show(c, r); await sleep(c, 150); } } }
    ];
  }
};

/* =============================== explainer 6: expand first =============================== */
const XP = {
  first: { label: 'Example 4: first equation', k: 0, parts: ['a', '-2', '(', 'b', '-3', ')', '=8'], m: 1, t: [3, 4],
    prods: ['(-2)(b)=-2b', '(-2)(-3)=+6'], r2: 'a-2b+6=8', r3: `a-2b+6${tc(RED, '-6')}=8${tc(RED, '-6')}`, r4: 'a-2b=2',
    cap1: `The multiplier in front of the bracket is ${T('-2')}, <b>sign included</b>. It multiplies <b>each</b> term inside.`,
    cap3: `Collect the constants: subtract ${T('6')} from both sides.`, cap4: `${T('a-2b=2')}. Ready for Step 1: ${T('a=2b+2')}.`, r5: 'a=2b+2', n5: 'Step 1' },
  second: { label: 'Example 4: second equation', k: 1, parts: ['4a', '+3', '(', 'b', '-2', ')', '=13'], m: 1, t: [3, 4],
    prods: ['(3)(b)=3b', '(3)(-2)=-6'], r2: '4a+3b-6=13', r3: `4a+3b-6${tc(RED, '+6')}=13${tc(RED, '+6')}`, r4: '4a+3b=19',
    cap1: `The multiplier in front of the bracket is ${T('3')}. It multiplies <b>each</b> term inside.`,
    cap3: `Collect the constants: add ${T('6')} to both sides.`, cap4: `${T('4a+3b=19')}. Both equations are expanded: now the same four steps.`, r5: `${tc(BL, 'a-2b=2')}\\qquad${tc(AM, '4a+3b=19')}`, n5: 'ready for the four steps' }
};
const expand = {
  title: 'Clear the brackets first',
  height: 440,
  choices: Object.keys(XP).map((k) => ({ v: k, label: XP[k].label })),
  intro: (k) => `Example 4: ${T(tc(EQC[XP[k].k], XP[k].parts.join('')))}. Brackets first, then the four steps. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = XP[k], W = ex.W, col = EQC[d.k];
    const R1 = add(stage, box(h('div', 'u8l2-mrow'), W, 70), 0, 128); R1.style.fontSize = '48px'; R1.style.gap = '0';
    const ps = d.parts.map((p, i) => { const e = h('span', 'u8l2-ch', T(tc(i === d.m ? PU : col, (i === 4 || i === 1 || i === 6 ? '{}' : '') + p))); R1.appendChild(e); return e; });
    const svg = svgEl('svg', { class: 'u8l2-arcs', width: W, height: ex.def.height }); add(stage, svg, 0, 0);
    const mrow = (y, t, note) => { const r = add(stage, box(h('div', 'u8l2-mrow u8l2-xrow', T(t) + (note ? `<span class="u8l2-why">${note}</span>` : '')), W, 54), 0, y); r.style.opacity = 0; return r; };
    const r2 = mrow(212, tc(col, d.r2), 'expanded'), r3 = mrow(270, d.r3, 'collect the constants'), r4 = mrow(328, `\\boxed{${tc(col, d.r4)}}`), r5 = mrow(388, d.r5, d.n5);
    return [
      { cap: d.cap1, run: async (c) => {
        const m = rel(stage, ps[d.m]);
        for (let j = 0; j < 2; j++) {
          const t = rel(stage, ps[d.t[j]]), x1 = m.x + m.w / 2, y1 = m.y + 6, x2 = t.x + t.w / 2, y2 = t.y + 6, bulge = j ? 56 : 30;
          const p = svgEl('path', { class: 'bk-stroke', d: `M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 - bulge * 2} ${x2} ${y2 - 4}`, fill: 'none', stroke: PU, 'stroke-width': 3 }, svg);
          await drawIn(p, 520, c);
          const hd = arrowHead(svg, x2, y2 - 2, x2 - (x1 + x2) / 2, bulge * 2 + y2 - y1, { color: PU, width: 3 }); await pop(c, hd, 200);
          const lab = h('div', 'u8l2-arclab', T(d.prods[j])); add(stage, lab); place(lab, j ? x2 + 6 : (x1 + x2) / 2 - 10, y1 - bulge - (j ? 4 : 0), j ? 'ne' : 'nw', 4); await pop(c, lab, 300);
        }
      } },
      { cap: `Expanded: ${T(d.r2)}.`, run: (c) => show(c, r2) },
      { cap: d.cap3, run: (c) => show(c, r3) },
      { cap: d.cap4, run: async (c) => { await show(c, r4); await show(c, r5); } }
    ];
  }
};

/* =============================== explainer 7: both variables vanish =============================== */
const VN = {
  inf: { label: '(i) 6x − 2y = 2', k: 2, kk: '2', ok: true },
  none: { label: '(ii) 6x − 2y = 8', k: 8, kk: '8', ok: false }
};
const vanish = {
  title: 'When both variables disappear',
  height: 512,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(VN).map((k) => ({ v: k, label: VN[k].label })),
  intro: (k) => `${T(tc(BL, 'y=3x-1'))} and ${T(tc(AM, '6x-2y=' + VN[k].kk))}. The first is already solved for ${T('y')}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const v = VN[k], GW = 400, LW = ex.W - GW - 44, gx = ex.W - GW - 14;
    const d = { eq: ['y=3x-1', `6x-2y=${v.kk}`], iso: 0, preIso: true, lhs: 'y=', expr: '3x-1', v: 'y', pre: '6x-2', post: `{}=${v.kk}`, sv: 'x',
      lines: [{ m: 3, b: -1 }], labs: [[-1, 'w']], g: { xmin: -4, xmax: 5, ymin: -6, ymax: 7, xlabels: 2, ylabels: 2 } };
    const { G } = sysGraph(stage, d, gx, 14, GW, 420);
    const K = subCards(stage, d, 14, 14, LW, { tag: `no ${T('y')} left` });
    const P = panel(stage, 14, 282, LW, ex.def.height - 296);
    const tiles = h('div', 'u8l2-row', '<span class="u8l2-gut">Expand</span>'); tiles.style.opacity = 0; P.appendChild(tiles);
    const tt = ['6x', '-6x', '+2', `=${v.kk}`].map((t) => { const e = h('span', 'u8l2-ch', T(t)); tiles.appendChild(e); return e; });
    tiles.style.gap = '6px';
    const left = wrow(P, 'Left over', `2=${v.kk}`, { box: true }); left.style.opacity = 0;
    const verdict = wrow(P, '', v.ok ? '0=0' : '0=6', { note: v.ok ? 'always true' : 'never true' }); verdict.style.opacity = 0; verdict.lastChild.className = 'u8l2-why ' + (v.ok ? 'u8l2-good' : 'u8l2-bad');
    const S = add(stage, box(h('div', 'u8l2-soln'), GW, 56), gx, 442);
    return [
      { cap: `<b>Substitute:</b> ${T('y')} <b>is</b> ${T('3x-1')}, so it drops into ${T(d.eq[1])}, in brackets.`, run: (c) => K.substitute(c) },
      { cap: `<b>Expand:</b> ${T(`6x-2(3x-1)=6x-6x+2`)}.`, run: (c) => show(c, tiles) },
      { cap: `${T('6x')} and ${T('-6x')} cancel: the ${T('x')} disappears too! Only ${T(`2=${v.kk}`)} is left.`,
        run: async (c) => {
          const a = rel(stage, tt[0]), b = rel(stage, tt[1]), dx = (b.x - a.x) / 2;
          await Promise.all([anim(c, tt[0], [{ transform: 'none' }, { transform: `translateX(${dx}px)` }], 600), anim(c, tt[1], [{ transform: 'none' }, { transform: `translateX(${-dx}px)` }], 600)]);
          await Promise.all([anim(c, tt[0], [{ opacity: 1 }, { opacity: 0 }], 350), anim(c, tt[1], [{ opacity: 1 }, { opacity: 0 }], 350)]);
          await show(c, left);
        } },
      { cap: v.ok ? `${T('2=2')} (that is, ${T('0=0')}) is <b>always true</b>: every ${T('x')} works. ${T('6x-2y=2')} is ${T('y=3x-1')} again, the <b>same line</b>. <b>Infinitely many solutions.</b>`
        : `${T('2=8')} (that is, ${T('0=6')}) is <b>never true</b>: no ${T('x')} works. ${T('6x-2y=8')} is ${T('y=3x-4')}: same slope ${T('3')}, different intercept. <b>Parallel lines, no solution.</b>`,
        run: async (c) => {
          await show(c, verdict);
          const l2 = v.ok ? G.line({ m: 3, b: -1 }, { color: AM, width: 9 }) : G.line({ m: 3, b: -4 }, { color: AM, width: 4 });
          if (v.ok) l2.style.opacity = 0.5;
          await G.drawIn(l2, 800, c);
          const lb = G.label(v.ok ? 2.2 : 2.6, v.ok ? 5.6 : 3.8, T(v.ok ? '6x-2y=2' : '6x-2y=8'), { pos: 'e', cls: 'bk-ptlab', color: AM }); await pop(c, lb, 260);
          const st = stamp(S, v.ok ? 'infinitely many' : 'no solution', { ok: v.ok ? true : false }); await stampIn(c, st);
        } }
    ];
  }
};

/* =============================== explainer 8 (Extension): three unknowns =============================== */
const three = {
  title: 'Extension: three equations, three unknowns',
  height: 500,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar (the unknowns panel needs ~150 px)
  intro: () => `<span class="u8l2-ext sm">Extension</span> Example 5: ${T(tc(BL, '4p-3q-2r=-9'))}, ${T(tc(AM, 'r=2p'))}, ${T(tc(GR, '3q-p-5=0'))}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const W = ex.W;
    const CB = add(stage, box(h('div', 'u8l2-card u8l2-c2'), 260, 100), 14, 14);
    const CC = add(stage, box(h('div', 'u8l2-card u8l2-c3'), 390, 100), 290, 14);
    const U = panel(stage, 696, 14, W - 710, 100, 'unknowns');
    [CB, CC].forEach((e) => e.appendChild(h('div', 'u8l2-sw')));
    CB.append(h('div', 'u8l2-small', '&nbsp;')); const bB = h('div', 'u8l2-big'); CB.appendChild(bB);
    const exR = chunk(tc(AM, '2p'), 'u8l2-exbox u8l2-xa'); bB.append(chunk(tc(AM, 'r=')), exR);
    const sC = h('div', 'u8l2-small', '&nbsp;'), bC = h('div', 'u8l2-big'); CC.append(sC, bC);
    const cA0 = chunk(tc(GR, '3q-p-5=0')), cA1 = h('span', 'u8l2-ch u8l2-gone'), exQ = chunk(tc(GR, '\\dfrac{p+5}{3}'), 'u8l2-exbox u8l2-xg');
    cA1.append(chunk(tc(GR, 'q=')), exQ); bC.append(cA0, cA1);
    const ur = h('div', 'u8l2-unk'); U.appendChild(ur);
    const us = ['p', 'q', 'r'].map((s) => { const e = h('span', 'u8l2-u', T(s)); ur.appendChild(e); return e; });
    const CA = add(stage, box(h('div', 'u8l2-card'), W - 28, 92), 14, 168); CA.appendChild(h('div', 'u8l2-sw'));
    const bA = h('div', 'u8l2-big'); bA.style.justifyContent = 'center'; CA.appendChild(bA);
    const tall = '\\vphantom{\\dfrac{p+5}{3}}';
    const A = {
      pre: chunk(tc(BL, '4p-3')), sq: chunk(tc(BL, 'q')), lq: chunk(tc(BL, `\\left(${tall}\\right.`), 'u8l2-gone'), eq: chunk(tc(GR, '\\dfrac{p+5}{3}'), 'u8l2-gone'), rq: chunk(tc(BL, `\\left.${tall}\\right)`), 'u8l2-gone'),
      mid: chunk(tc(BL, '{}-2')), sr: chunk(tc(BL, 'r')), lr: chunk(tc(BL, '('), 'u8l2-gone'), er: chunk(tc(AM, '2p'), 'u8l2-gone'), rr: chunk(tc(BL, ')'), 'u8l2-gone'), post: chunk(tc(BL, '{}=-9'))
    };
    bA.append(A.pre, A.sq, A.lq, A.eq, A.rq, A.mid, A.sr, A.lr, A.er, A.rr, A.post);
    const P = panel(stage, 14, 278, W - 28, ex.def.height - 292);
    const rows = [
      ['Step 3', '4p-(p+5)-4p=-9\\ \\Rightarrow\\ -p-5=-9'], ['', `-p=-4\\ \\Rightarrow\\ ${tc(PU, 'p=4')}`, true],
      ['Step 4', `${tc(AM, 'r=2(4)=8')}\\qquad ${tc(GR, 'q=\\dfrac{4+5}{3}=\\dfrac{9}{3}=3')}`],
      ['Check', '4(4)-3(3)-2(8)=-9\\ \\checkmark\\qquad 8=2(4)\\ \\checkmark\\qquad 3(3)-4-5=0\\ \\checkmark']
    ].map(([g, t, bx]) => { const r = wrow(P, g, t, { box: bx }); r.style.opacity = 0; return r; });
    const drop = async (c, slot, l, e, r, src) => {
      slot.classList.add('u8l2-strike'); await shake(c, slot); gone(slot); [l, e, r].forEach((x) => gone(x, false)); e.classList.add('u8l2-hid');
      await Promise.all([pop(c, l), pop(c, r)]); await fly(c, stage, src, e); e.classList.remove('u8l2-hid');
    };
    return [
      { cap: `<b>Step 1:</b> ${T('r=2p')} is already isolated. Rearrange the third: ${T('3q=p+5')}, so ${T('q=\\dfrac{p+5}{3}')}.`,
        run: async (c) => {
          await pulse(c, exR, 1.12); sC.innerHTML = T(tc(GR, '3q-p-5=0\\ \\Rightarrow\\ 3q=p+5\\ \\Rightarrow')); await show(c, sC);
          gone(cA0); gone(cA1, false); await show(c, cA1); await pulse(c, exQ, 1.1);
        } },
      { cap: `<b>Step 2:</b> Substitute <b>both</b> into the first equation, in brackets. Three unknowns become one: only ${T('p')} is left.`,
        run: async (c) => {
          await drop(c, A.sq, A.lq, A.eq, A.rq, exQ); us[1].classList.add('u8l2-out'); await pop(c, us[1], 260);
          await drop(c, A.sr, A.lr, A.er, A.rr, exR); us[2].classList.add('u8l2-out'); await pop(c, us[2], 260);
          us[0].classList.add('u8l2-last'); await pulse(c, us[0], 1.2);
        } },
      { cap: `<b>Step 3:</b> The 3s cancel and ${T('4p-4p=0')}: ${T('-p-5=-9')}, so ${T('p=4')}.`,
        run: async (c) => { await show(c, rows[0]); await show(c, rows[1]); } },
      { cap: `<b>Step 4:</b> Back-substitute ${T('p=4')}: ${T('r=2(4)=8')} and ${T('q=\\dfrac{4+5}{3}=3')}.`,
        run: async (c) => {
          const src = rows[1].m;
          await Promise.all([fly(c, stage, src, exR, { html: T(tc(PU, '4')), scale: 1.1 }), fly(c, stage, src, exQ, { html: T(tc(PU, '4')), scale: 1.1, lift: 70 })]);
          await show(c, rows[2]);
        } },
      { cap: `Check in <b>all three</b> equations ✓ ✓ ✓. The solution is ${T('p=4,\\ q=3,\\ r=8')}.`, run: (c) => show(c, rows[3]) }
    ];
  }
};

/* =============================== mount =============================== */
mountWarm();
export const explainers = mountExplainers({ lift, choose, checkBoth, fracs, exact, expand, vanish, three });
export const _test = { SUB, CH, CK, FR, EX, XP, VN };
