/* Math 10C · Unit 5 · Lesson 2 — Describing Relationships Between Two Quantities.
 * Six representations of a relation, independent/dependent variables, equation → table → graph, linear vs nonlinear.
 * Colour code for the whole lesson: independent variable / inputs = amber, dependent variable / outputs = purple
 * (the same colours the blocks use for domain and range shadows). */
import {
  h, tex, add, box, Graph, ValueTable, MappingDiagram, stamp, stampIn, mountExplainers, pop, fadeIn, pulse,
  sleep, tween, anim, drawIn, svgEl, fit, linear
} from '../blocks.js';

const T = (s) => tex(s);
const IV = '#c27a0e', DV = '#7b4fc4', RED = '#c93a33', TEAL = '#13807a';
const ivT = (s) => `\\textcolor{${IV}}{${s}}`;
const dvT = (s) => `\\textcolor{${DV}}{${s}}`;
const ivB = (s) => `<b class="u5l2-ivt">${s}</b>`;
const dvB = (s) => `<b class="u5l2-dvt">${s}</b>`;
const uniq = (a) => [...new Set(a)];

/* centre of el in stage coordinates (the page may be scaled, so divide by the stage's scale) */
function rel(stage, el) {
  const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(), k = s.width / (stage.offsetWidth || s.width) || 1;
  return [(r.left + r.width / 2 - s.left) / k, (r.top + r.height / 2 - s.top) / k];
}
/* a copy of a value flies from one place to another (skipped when replaying fast) */
async function fly(c, stage, html, from, to, ms = 620, cls = '') {
  if (!c || c.fast) return;
  const d = add(stage, h('div', 'u5l2-fly ' + cls, html), from[0], from[1]);
  d.style.translate = '-50% -50%';
  try { await c.anim(d, [{ transform: 'translate(0px, 0px) scale(1)' }, { transform: `translate(${(to[0] - from[0]) / 2}px, ${(to[1] - from[1]) / 2 - 18}px) scale(1.15)`, offset: 0.5 }, { transform: `translate(${to[0] - from[0]}px, ${to[1] - from[1]}px) scale(1)` }], ms, { easing: 'ease-in-out' }); }
  finally { d.remove(); }
}
const fadeOut = async (c, el, ms = 320) => { await anim(c, el, [{ opacity: 1 }, { opacity: 0 }], ms); el.style.visibility = 'hidden'; };
function panel(stage, x, y, w, hh, title, cls = '') {
  const p = add(stage, box(h('div', 'u5l2-panel ' + cls, title ? `<div class="u5l2-ph">${title}</div>` : ''), w, hh), x, y);
  return p;
}
const line = (p, html, cls = '') => { const d = h('div', 'u5l2-line ' + cls, html); p.appendChild(d); return d; };
const showLine = (c, p, html, cls) => { const d = line(p, html, cls); return fadeIn(c, d).then(() => d); };

/* ================= little pictures (64 × 64) ================= */
const ICONS = {
  thermo: '<rect x="26" y="5" width="12" height="40" rx="6" fill="#fff" stroke="#1e2d46" stroke-width="3"/><rect x="29.5" y="19" width="5" height="27" fill="#d23c32"/><circle cx="32" cy="51" r="9" fill="#d23c32" stroke="#1e2d46" stroke-width="3"/><path d="M38 13h6M38 21h6M38 29h6" stroke="#1e2d46" stroke-width="2.5"/>',
  cone: '<path d="M20 30h24L32 61z" fill="#c88c14" stroke="#1e2d46" stroke-width="3" stroke-linejoin="round"/><path d="M25 30l9 18M39 30l-9 18" stroke="#8a5d10" stroke-width="1.6"/><circle cx="32" cy="22" r="13" fill="#f5a0be" stroke="#1e2d46" stroke-width="3"/><circle cx="32" cy="7.5" r="3.5" fill="#d23c32"/>',
  phone: '<rect x="18" y="3" width="28" height="48" rx="5" fill="#1e2d46"/><rect x="21" y="8" width="22" height="37" fill="#e8f0fc"/><rect x="27" y="16" width="10" height="21" rx="1.5" fill="#fff" stroke="#1e2d46" stroke-width="2"/><rect x="29" y="27" width="6" height="9" fill="#3ca05a"/><path d="M32 51v5q0 4 6 4h12" fill="none" stroke="#1e2d46" stroke-width="3" stroke-linecap="round"/>',
  battery: '<rect x="18" y="10" width="28" height="49" rx="5" fill="#fff" stroke="#1e2d46" stroke-width="3"/><rect x="26" y="4" width="12" height="7" rx="1.5" fill="#1e2d46"/><rect x="22" y="31" width="20" height="24" rx="2" fill="#3ca05a"/><text x="32" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#1e2d46">%</text>',
  speedo: '<path d="M8 46a24 24 0 1 1 48 0z" fill="#fff" stroke="#1e2d46" stroke-width="3" stroke-linejoin="round"/><path d="M32 46L46 27" stroke="#d23c32" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="46" r="4.5" fill="#1e2d46"/><path d="M14 32l5 2.5M32 23v6M50 32l-5 2.5" stroke="#1e2d46" stroke-width="2.5"/>',
  pump: '<rect x="11" y="9" width="27" height="47" rx="3" fill="#13807a" stroke="#1e2d46" stroke-width="3"/><rect x="16" y="15" width="17" height="12" rx="2" fill="#e8f0fc"/><path d="M38 19h6l6 8v18a4 4 0 0 1-8 0V35h-4" fill="none" stroke="#1e2d46" stroke-width="3" stroke-linejoin="round"/><rect x="7" y="54" width="35" height="5" rx="2" fill="#1e2d46"/>',
  people: '<circle cx="22" cy="20" r="8" fill="#fbe6b8" stroke="#1e2d46" stroke-width="2.5"/><path d="M8 55q0-19 14-19t14 19z" fill="#7b9fd6" stroke="#1e2d46" stroke-width="2.5"/><circle cx="43" cy="23" r="7" fill="#fbe6b8" stroke="#1e2d46" stroke-width="2.5"/><path d="M31 55q0-16 12-16t12 16z" fill="#e79a8f" stroke="#1e2d46" stroke-width="2.5"/>',
  ticket: '<path d="M7 20h50v8a5 5 0 0 0 0 10v8H7v-8a5 5 0 0 0 0-10z" fill="#ffecb3" stroke="#c88c14" stroke-width="3" stroke-linejoin="round"/><path d="M41 20v26" stroke="#c88c14" stroke-width="2" stroke-dasharray="3 3"/><text x="24" y="39" text-anchor="middle" font-size="17" font-weight="800" fill="#1e2d46">$</text>'
};
const icon = (k, s = 64) => `<svg viewBox="0 0 64 64" width="${s}" height="${s}" aria-hidden="true">${ICONS[k]}</svg>`;

/* =====================================================================================
 * 1. sixViews — one relation, six views. The numbers travel from view to view:
 *    table → ordered pairs → arrow diagram → equation → graph. Views ride a conveyor: the newest view forms on the
 *    right while the previous one is still on the left, then everything shifts left. */
const SIX = {
  phone: {
    label: 'Phone charging', iv: 't', dv: 'b',
    words: `A phone’s ${dvB('battery level, ' + T('b'))} (%) depends on its ${ivB('charging time, ' + T('t'))} (hours). It starts at 10% and gains 20% every hour.`,
    ivN: 'the charging time', dvN: 'the battery level',
    xs: ['0', '1', '2', '3', '4'], ys: ['10', '30', '50', '70', '90'],
    eqL: 'b', eqR: `10+20${ivT('t')}`, sub: ['b=10+20(', 'X', ')=', 'Y'], pick: 2,
    win: { xmin: 0, xmax: 5, ymin: 0, ymax: 100, ystep: 10, ylabels: 20 },
    join: 'seg', stamp: ['Linear', true, 'br'],
    joinCap: `Charging time can be <b>any</b> value from 0 to 4.5 h (when it reaches 100%), so join the points. A straight line: the relation is <b>linear</b>.`
  },
  van: {
    label: 'Van fuel (Section 2)', iv: 's', dv: 'F',
    words: `The van’s ${dvB('fuel consumption rate, ' + T('F'))} (L/100 km) depends on its ${ivB('speed, ' + T('s'))} (km/h). Test data: 20, 40, …, 140 km/h.`,
    ivN: 'the speed', dvN: 'the fuel consumption rate',
    xs: ['20', '40', '60', '80', '100', '120', '140'], ys: ['13.2', '9.2', '6.8', '6.0', '6.8', '9.2', '13.2'],
    eqL: 'F', eqR: `0.002${ivT('s')}^2-0.32${ivT('s')}+18.8`, sub: ['F=0.002(', 'X', ')^2-0.32(', 'X', ')+18.8=', 'Y'], pick: 2,
    win: { xmin: 0, xmax: 150, ymin: 0, ymax: 15, xstep: 10, xlabels: 20, ystep: 1, ylabels: 5 },
    join: 'curve', f: (s) => 0.002 * s * s - 0.32 * s + 18.8, stamp: ['Nonlinear', null, 't'],
    share: `Two speeds can share an output: 40 and 120 km/h both give 9.2. Each output is written <b>once</b>.`,
    joinCap: `Every speed from 20 to 140 km/h has an output, so join the points with a smooth <b>curve</b>. Not a straight line: <b>nonlinear</b>.`
  },
  sq: {
    label: T('y=x^2') + ', five inputs', iv: 'x', dv: 'y',
    words: `Each integer ${ivB('input ' + T('x'))} from ${T('-2')} to ${T('2')} is paired with its ${dvB('square, ' + T('y'))}. Only these five inputs.`,
    ivN: T('x'), dvN: T('y'),
    xs: ['-2', '-1', '0', '1', '2'], ys: ['4', '1', '0', '1', '4'],
    eqL: 'y', eqR: `${ivT('x')}^2`, sub: ['y=(', 'X', ')^2=', 'Y'], pick: 0,
    win: { xmin: -3, xmax: 3, ymin: -1, ymax: 5 },
    join: 'none', stamp: ['Not joined', null, 'br'],
    share: `Two inputs can share an output: ${T('-2')} and ${T('2')} both give ${T('4')}. Each output is written <b>once</b>.`,
    joinCap: `Only the five integers are inputs, so the points are <b>not joined</b>. They don’t lie on a line: the pattern is <b>nonlinear</b>.`
  }
};
const TABS = ['Words', 'Table', 'Ordered pairs', 'Arrow diagram', 'Equation', 'Graph'];
const sixViews = {
  title: 'One relation, six views',
  height: 484,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SIX).map((k) => ({ v: k, label: SIX[k].label })),
  intro: 'One relation, six ways to show it. Watch the <b>same numbers</b> travel from view to view. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = SIX[k], W = ex.W, H = 484, n = d.xs.length;
    const wt = TABS.map((t) => t.length + 4), u = (W - 32 - 5 * 8) / wt.reduce((a, b) => a + b, 0); // tab widths follow the label lengths
    let tx = 16; const tabs = TABS.map((t, i) => { const el = add(stage, box(h('div', 'u5l2-tab6', `<b>${i + 1}</b>${t}`), wt[i] * u, 38), tx, 10); tx += wt[i] * u + 8; return el; });
    const setTab = (i) => tabs.forEach((t, j) => { t.classList.toggle('on', j === i); t.classList.toggle('done', j < i || i > 5); });
    const words = add(stage, box(h('div', 'u5l2-words', `<div>${d.words}</div>`), W - 32, 62), 16, 58); words.style.opacity = 0;
    const y0 = 132, wv = Math.floor((W - 48) / 2), hv = H - y0 - 10, xL = 16, xR = 32 + wv, dx = xR - xL;
    const mk = (x, title) => { const el = add(stage, box(h('div', 'u5l2-view', `<div class="u5l2-vt">${title}</div>`), wv, hv), x, y0); el.style.opacity = 0; const body = el.appendChild(h('div', 'u5l2-vb')); return { el, body }; };
    // table (starts on the left)
    const vT = mk(xL, 'Table of values');
    const tb = new ValueTable(vT.body, { headers: [`\\text{Input }(${ivT(d.iv)})`, `\\text{Output }(${dvT(d.dv)})`], rows: d.xs.map((x, i) => [x, d.ys[i]]), hide: () => true, tap: false, cellW: Math.min(180, Math.floor((wv - 60) / 2)), cellH: n > 6 ? 32 : 42, cls: 'u5l2-six-tb' });
    // ordered pairs
    const vP = mk(xR, `Ordered pairs ${T(`(${ivT(d.iv)},\\ ${dvT(d.dv)})`)}`);
    const plist = vP.body.appendChild(h('div', 'u5l2-plist' + (n > 6 ? ' u5l2-plist3' : '')));
    const pairs = d.xs.map((x, i) => {
      const p = plist.appendChild(h('div', 'u5l2-pair', `${T('(')}<i class="u5l2-sx">${T(ivT(x))}</i>${T(',\\ ')}<i class="u5l2-sy">${T(dvT(d.ys[i]))}</i>${T(')')}`));
      const sx = p.querySelector('.u5l2-sx'), sy = p.querySelector('.u5l2-sy'); sx.style.opacity = 0; sy.style.opacity = 0; return { p, sx, sy };
    });
    // arrow diagram
    const vM = mk(xR, 'Arrow diagram');
    const ran = uniq(d.ys).sort((a, b) => a - b);
    const M = new MappingDiagram(vM.body, { width: wv - 24, height: hv - 44, domain: d.xs, range: ran, pairs: d.xs.map((x, i) => [x, d.ys[i]]), titles: [`Inputs ${T(ivT(d.iv))}`, `Outputs ${T(dvT(d.dv))}`], arrows: false, cls: 'u5l2-map', color: IV });
    M.itemEls[0].forEach((e) => { e.style.color = IV; e.style.opacity = 0; }); M.itemEls[1].forEach((e) => { e.style.color = DV; e.style.opacity = 0; });
    // equation
    const vE = mk(xR, 'Equation');
    vE.body.appendChild(h('div', 'u5l2-eqbig', T(`\\overbrace{${dvT(d.eqL)}}^{\\text{dependent}}=\\underbrace{${d.eqR}}_{\\text{the input }${ivT(d.iv)}\\text{ is in here}}`)));
    const subEl = vE.body.appendChild(h('div', 'u5l2-sub'));
    const xSl = [], ySl = [];
    d.sub.forEach((p) => {
      if (p === 'X') xSl.push(subEl.appendChild(h('i', 'u5l2-slot', '')));
      else if (p === 'Y') ySl.push(subEl.appendChild(h('i', 'u5l2-slot u5l2-slot-y', '')));
      else subEl.appendChild(h('i', 'u5l2-subt', T(p)));
    });
    fit(subEl, wv - 30);
    const setSub = (i) => { xSl.forEach((s) => (s.innerHTML = T(ivT(d.xs[i])))); ySl.forEach((s) => (s.innerHTML = T(dvT(d.ys[i])))); };
    // graph
    const vG = mk(xR, 'Graph');
    const G = new Graph(vG.body, Object.assign({ width: wv - 12, height: hv - 40, xtitle: ivT(d.iv), ytitle: dvT(d.dv), fontSize: 16 }, d.win));
    const pts = d.xs.map((x, i) => { const p = G.point(+x, +d.ys[i], { color: TEAL, r: 6 }); p.style.opacity = 0; return p; });

    const slide = (c, v) => anim(c, v.el, [{ transform: 'translateX(0px)' }, { transform: `translateX(${-dx}px)` }], 650);
    const pk = d.pick, px = d.xs[pk], py = d.ys[pk];
    return [
      { cap: `<b>In words.</b> ${d.dvN[0].toUpperCase() + d.dvN.slice(1)} <b>depends on</b> ${d.ivN}: ${T(dvT(d.dv))} is the <b>dependent</b> variable and ${T(ivT(d.iv))} the <b>independent</b> variable.`,
        run: async (c) => { setTab(0); await fadeIn(c, words); } },
      { cap: `<b>Table of values.</b> The independent variable ${T(ivT(d.iv))} goes in the <b>left</b> column; each output sits beside its input.`,
        run: async (c) => { setTab(1); await fadeIn(c, vT.el); await tb.fill(c, { col: 0, stagger: 70 }); await tb.fill(c, { col: 1, stagger: 70 }); } },
      { cap: `<b>Ordered pairs</b> ${T(`(${ivT(d.iv)},\\ ${dvT(d.dv)})`)}: each row becomes a pair. The <b>first</b> coordinate is always the independent variable.`,
        run: async (c) => {
          setTab(2); await fadeIn(c, vP.el);
          await Promise.all(d.xs.map(async (x, i) => {
            await sleep(c, i * 160); tb.highlight(i, true);
            await Promise.all([fly(c, stage, T(ivT(x)), rel(stage, tb.cell(i, 0)), rel(stage, pairs[i].sx)), fly(c, stage, T(dvT(d.ys[i])), rel(stage, tb.cell(i, 1)), rel(stage, pairs[i].sy))]);
            pairs[i].sx.style.opacity = 1; pairs[i].sy.style.opacity = 1; tb.highlight(i, false);
          }));
        } },
      { cap: `<b>Arrow diagram.</b> Inputs in one oval, outputs in the other. Arrows point <b>from</b> the independent <b>to</b> the dependent variable.` + (d.share ? ' ' + d.share : ''),
        run: async (c) => {
          setTab(3); await Promise.all([fadeOut(c, vT.el), slide(c, vP)]); await fadeIn(c, vM.el);
          await Promise.all(d.xs.map(async (x, i) => {
            await sleep(c, i * 140);
            const a = M.item('d', x), b = M.item('r', d.ys[i]);
            await Promise.all([fly(c, stage, T(ivT(x)), rel(stage, pairs[i].sx), rel(stage, a)), fly(c, stage, T(dvT(d.ys[i])), rel(stage, pairs[i].sy), rel(stage, b))]);
            a.style.opacity = 1; b.style.opacity = 1;
          }));
          await M.drawArrows(c, { stagger: 60, ms: 380 });
        } },
      { cap: `<b>Equation</b> ${T(`${d.eqL}=\\dots`)}: solved for ${T(dvT(d.dv))}, so ${T(dvT(d.dv))} is dependent. Substitute the input ${T(ivT(px))}: out comes ${T(dvT(py))}, just like the arrow.`,
        run: async (c) => {
          setTab(4); await Promise.all([fadeOut(c, vP.el), slide(c, vM)]); await fadeIn(c, vE.el);
          const a = M.item('d', px), b = M.item('r', py), ar = M.arrow(pk);
          a.classList.add('bk-hot'); if (ar) ar.style.color = RED;
          await Promise.all(xSl.map((s) => fly(c, stage, T(ivT(px)), rel(stage, a), rel(stage, s))));
          xSl.forEach((s) => (s.innerHTML = T(ivT(px)))); await Promise.all(xSl.map((s) => pop(c, s)));
          await sleep(c, 250);
          ySl.forEach((s) => (s.innerHTML = T(dvT(py)))); await Promise.all(ySl.map((s) => pop(c, s)));
          b.classList.add('bk-hot'); await pulse(c, b, 1.25);
        } },
      { cap: `<b>Graph.</b> The independent variable ${T(ivT(d.iv))} goes on the <b>horizontal</b> axis, the dependent variable ${T(dvT(d.dv))} on the vertical axis. Each pair is a point.`,
        run: async (c) => {
          setTab(5); await Promise.all([fadeOut(c, vM.el), slide(c, vE)]); await fadeIn(c, vG.el);
          for (let i = 0; i < n; i++) {
            setSub(i); if (!c.fast) await Promise.all(xSl.concat(ySl).map((s) => pulse(c, s, 1.15, 260)));
            const ci = pts[i].querySelector('circle');
            await fly(c, stage, '<b class="u5l2-dot"></b>', rel(stage, ySl[0]), rel(stage, ci), 480);
            await G.reveal(pts[i], c, 260);
          }
        } },
      { cap: d.joinCap,
        run: async (c) => {
          setTab(6);
          if (d.join === 'seg') await G.drawIn(G.segment([0, 10], [4.5, 100], { closedA: true, closedB: true, color: TEAL }), 900, c);
          if (d.join === 'curve') await G.drawIn(G.fn(d.f, { from: 20, to: 140, color: TEAL }), 1000, c);
          const s = stamp(vG.el, d.stamp[0], d.stamp[2] === 't' ? { ok: d.stamp[1], x: wv / 2 + 10, y: 66 } : { ok: d.stamp[1], x: wv - 100, y: hv - 84 }); await stampIn(c, s);
        } }
    ];
  }
};

/* =====================================================================================
 * 2. causeEffect — which quantity depends on which? Test the sentence both ways, then put the input first. */
const CE = {
  phone: { label: 'Phone charging', A: { n: 'minutes charging', s: 'the minutes charging', ic: 'phone', ax: 'minutes charging' }, B: { n: 'battery level (%)', s: 'the battery level', ic: 'battery', ax: 'battery level' }, dep: 'B',
    tests: [['Does the number of minutes charging depend on the battery level?', false, 'No: you decide how long to charge it.'], ['Does the battery level depend on the minutes charging?', true, 'Yes: the longer it charges, the fuller it gets.']],
    f: (u) => 0.12 + 0.8 * u },
  van: { label: 'Van: fuel and speed', A: { n: `fuel consumption rate,&nbsp;${T('F')}`, s: `the fuel consumption rate ${T('F')}`, ic: 'pump', ax: 'fuel consumption' }, B: { n: `speed,&nbsp;${T('s')}`, s: `the speed ${T('s')}`, ic: 'speedo', ax: 'speed' }, dep: 'A',
    tests: [['Does the fuel consumption rate depend on the speed?', true, 'Yes: speed changes how much fuel it burns.'], ['Does the speed depend on the fuel consumption rate?', false, 'No: the driver chooses the speed.']],
    f: (u) => { const s = 20 + 120 * u; return (0.002 * s * s - 0.32 * s + 18.8) / 15; } },
  ice: { label: 'Ice cream (warm-up)', A: { n: 'temperature (°C)', s: 'the temperature', ic: 'thermo', ax: 'temperature' }, B: { n: 'ice cream sales', s: 'ice cream sales', ic: 'cone', ax: 'ice cream sales' }, dep: 'B',
    tests: [['Does the temperature depend on ice cream sales?', false, 'No: selling cones doesn’t heat up the day.'], ['Do ice cream sales depend on the temperature?', true, 'Yes: hot days sell more cones.']],
    f: (u) => 0.1 + 0.78 * u * u },
  museum: { label: 'Example 2(c)', A: { n: `number of visitors,&nbsp;${T('v')}`, s: `the number of visitors ${T('v')}`, ic: 'people', ax: 'visitors' }, B: { n: `price of admission,&nbsp;${T('p')}`, s: `the price ${T('p')}`, ic: 'ticket', ax: 'price' }, dep: 'A',
    tests: [['Does the number of visitors depend on the price?', true, 'Yes: a higher price keeps some people away.'], ['Does the price depend on the number of visitors?', false, 'No: the museum sets the price for the day.']],
    f: (u) => 0.88 - 0.68 * u }
};
const causeEffect = {
  title: 'Cause → effect: which one depends on the other?',
  height: 424,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'phone', label: CE.phone.label }, { v: 'van', label: CE.van.label }, { v: 'ice', label: CE.ice.label }, { sep: 'Example check:' }, { v: 'museum', label: CE.museum.label }],
  intro: (k) => `Two quantities, named in the order the sentence gives them. Which one <b>depends on</b> the other? Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = CE[k], W = ex.W, cw = 220, chh = 172, xA = 18, xB = 330, yC = 44;
    const card = (q, x) => {
      const el = add(stage, box(h('div', 'u5l2-qcard', `<div class="u5l2-qic">${icon(q.ic, 72)}</div><div class="u5l2-qname">${q.n}</div><div class="u5l2-meter"><i class="u5l2-mfill"></i><i class="u5l2-mknob"></i></div>`), cw, chh), x, yC);
      el.style.opacity = 0; return el;
    };
    const cA = card(d.A, xA), cB = card(d.B, xB);
    const dep = d.dep === 'A' ? cA : cB, ind = d.dep === 'A' ? cB : cA, swap = d.dep === 'A';
    const setM = (el, v) => { el.querySelector('.u5l2-mfill').style.width = (v * 100).toFixed(1) + '%'; el.querySelector('.u5l2-mknob').style.left = (v * 100).toFixed(1) + '%'; };
    const u0 = 0.1; setM(ind, u0); setM(dep, d.f(u0));
    dep.classList.add('u5l2-q-dep'); ind.classList.add('u5l2-q-ind');
    // the arrow between the cards (input → output once known)
    const arr = add(stage, h('div', 'u5l2-ce-arrow', `<svg viewBox="0 0 80 40" width="80" height="40"><path d="M4 20H62" stroke="${TEAL}" stroke-width="5" stroke-linecap="round"/><path d="M76 20L60 10V30Z" fill="${TEAL}"/></svg><b>affects</b>`), xA + cw + 6, yC + 52); arr.style.opacity = 0;
    // the two tests
    const P = panel(stage, 18, 226, 532, 190, 'Test it both ways', 'u5l2-tests');
    // graph
    const gx = Math.max(W - 410, 566), indQ = d.dep === 'A' ? d.B : d.A, depQ = d.dep === 'A' ? d.A : d.B; // right of the cards and tests
    const G = new Graph(stage, { x: gx, y: 12, width: Math.min(396, W - gx - 12), height: 400, xmin: 0, xmax: 10, ymin: 0, ymax: 10, grid: false, numbers: false, xtitle: `\\textcolor{${IV}}{\\text{${indQ.ax}}}`, ytitle: `\\textcolor{${DV}}{\\text{${depQ.ax}}}` });
    G.el.style.opacity = 0;
    let tr = []; const trace = G.curve(() => ({ subs: [tr.map((p) => G.toPx(p[0], p[1]))] }), { color: TEAL, width: 4 }, 'u5l2-trace', G.layers.data);
    const X = (u) => 1 + 8 * (u - 0.1) / 0.8, Y = (u) => 10 * d.f(u);
    const dot = G.point(X(u0), Y(u0), { color: TEAL, r: 7 }); dot.style.opacity = 0;
    const testLine = (t) => { const row = line(P, `<span class="u5l2-tq">${t[0]}</span><span class="u5l2-tw">${t[2]}</span>`, 'u5l2-test'); const s = stamp(row, t[1] ? '✓' : '✗', { ok: t[1], size: 'sm', rotate: -4 }); s.classList.add('u5l2-tst'); return { row, s }; };
    const sn = (q) => q.s || q.n.replace(/ \(.*\)$/, ''), indName = sn(indQ), depName = sn(depQ);
    return [
      { cap: `Two quantities that change together: <b>${sn(d.A)}</b> and <b>${sn(d.B)}</b>.`,
        run: async (c) => { await Promise.all([pop(c, cA), pop(c, cB, 380, { delay: 120 })]); } },
      { cap: `Test it one way: ${d.tests[0][0].replace('?', '')}? ${d.tests[0][2]}`,
        run: async (c) => { const t = testLine(d.tests[0]); await fadeIn(c, t.row); await stampIn(c, t.s); } },
      { cap: `Now the other way: ${d.tests[1][0].replace('?', '')}? ${d.tests[1][2]}`,
        run: async (c) => { const t = testLine(d.tests[1]); await fadeIn(c, t.row); await stampIn(c, t.s); } },
      { cap: `So <b>${depName}</b> is the ${dvB('dependent variable')} (output), and <b>${indName}</b> is the ${ivB('independent variable')} (input).` + (swap ? ' The input goes <b>first</b>: swap them.' : ''),
        run: async (c) => {
          if (swap) await Promise.all([anim(c, cA, [{ transform: 'translateX(0px)' }, { transform: `translateX(${xB - xA}px)` }], 700), anim(c, cB, [{ transform: 'translateX(0px)' }, { transform: `translateX(${xA - xB}px)` }], 700)]);
          ind.classList.add('on'); dep.classList.add('on');
          const ti = add(stage, box(h('div', 'u5l2-role u5l2-role-i', 'independent · input'), cw, 30), xA, 8), td = add(stage, box(h('div', 'u5l2-role u5l2-role-d', 'dependent · output'), cw, 30), xB, 8);
          await Promise.all([fadeIn(c, ti), fadeIn(c, td)]);
          await fadeIn(c, arr, 350, { from: 'translateX(-16px)' });
        } },
      { cap: `Change the input and the output responds. On a graph the <b>independent</b> variable goes on the <b>horizontal</b> axis, the dependent on the vertical.`,
        run: async (c) => {
          await fadeIn(c, G.el); dot.style.opacity = 1;
          await tween(c, 2600, (t) => {
            const u = u0 + 0.8 * t; setM(ind, u); setM(dep, d.f(u));
            tr = []; for (let i = 0; i <= Math.round(80 * t); i++) { const v = u0 + 0.8 * i / 80; tr.push([X(v), Y(v)]); }
            trace._bkDraw(); G.moveTo(dot, X(u), Y(u));
          }, linear);
        } }
    ];
  }
};

/* =====================================================================================
 * 3. fuelStory — the van's seven test points, the curve between them, reading a speed that wasn't tested,
 *    and why the domain and range matter. */
const VAN = { xs: [20, 40, 60, 80, 100, 120, 140], ys: ['13.2', '9.2', '6.8', '6.0', '6.8', '9.2', '13.2'], f: (s) => 0.002 * s * s - 0.32 * s + 18.8 };
const fuelStory = {
  title: 'The van: points, a curve, domain and range',
  height: 446,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Seven test speeds. What happens <b>between</b> them, and which speeds make sense at all? Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W;
    const G = new Graph(stage, { x: 10, y: 8, width: 580, height: 430, xmin: 0, xmax: 150, xstep: 10, xlabels: 20, ymin: 0, ymax: 15, ystep: 1, ylabels: 5, xtitle: ivT('s') + '\\ (\\text{km/h})', ytitle: dvT('F') });
    const tb = new ValueTable(stage, { x: 620, y: 12, headers: [ivT('s'), dvT('F')], rows: VAN.xs.map((x, i) => [x, VAN.ys[i]]), cellW: 100, cellH: 29, tap: false });
    const P = panel(stage, 620, 254, W - 634, 184, '', 'u5l2-notes');
    const pts = [];
    const f50 = VAN.f(50), fm40 = VAN.f(-40);
    let q50;
    return [
      { cap: `Plot the seven test results: one point for each row ${T(`(${ivT('s')},\\ ${dvT('F')})`)}.`,
        run: async (c) => { for (let i = 0; i < 7; i++) { tb.highlight(i, true); const p = G.point(VAN.xs[i], +VAN.ys[i], { color: TEAL, r: 6 }); pts.push(p); await G.reveal(p, c, 260); await sleep(c, 80); tb.highlight(i, false); } } },
      { cap: `Nobody tested ${T(ivT('s') + '=50')}. But the van <b>can</b> drive at 50 km/h, so it must have <b>some</b> fuel consumption rate there.`,
        run: async (c) => { q50 = G.vline(50, { color: IV }); await G.drawIn(q50, 600, c); q50.q = G.label(50, 14.2, '<b>?</b>', { pos: 'e', cls: 'bk-ptlab', color: IV }); await fadeIn(c, q50.q); } },
      { cap: `An output exists for <b>every</b> speed from 20 to 140 km/h, not just the seven tested, so the points are joined with a smooth <b>curve</b>.`,
        run: async (c) => { await G.drawIn(G.fn(VAN.f, { from: 20, to: 140, color: TEAL }), 1100, c); } },
      { cap: `Read the curve at ${T('s=50')}: about ${T('7.8')}. The equation agrees: ${T(`0.002(50)^2-0.32(50)+18.8=${f50.toFixed(1)}`)}.`,
        run: async (c) => { G.remove(q50, q50.q); const g = G.guides(50, f50); await G.drawIn(g, 600, c); await G.reveal(G.point(50, f50, { color: IV, r: 7, label: T('(50,\\ 7.8)'), pos: 'ne' }), c); await showLine(c, P, `${T('s=50')} → ${T('F=7.8')} L/100 km`); } },
      { cap: `The <b>domain</b> is the set of speeds the relation covers, from the slowest to the fastest tested: the curve’s shadow on the ${T(ivT('s'))}-axis runs from 20 to 140 km/h.`,
        run: async (c) => { await G.drawIn(G.shadeX(20, 140, { band: true }), 800, c); await showLine(c, P, `<b class="u5l2-ivt">Domain:</b> 20 to 140 km/h`); } },
      { cap: `What about ${T('s=-40')}? The equation gives ${T(`F=${fm40.toFixed(1)}`)}, but a speed of ${T('-40')} km/h makes no sense: ${T('-40')} is <b>not in the domain</b>.`,
        run: async (c) => { const l = await showLine(c, P, `${T('s=-40')}: ${T(`F=${fm40.toFixed(1)}`)}?`); const s = stamp(l, 'not in the domain', { ok: false, size: 'sm', rotate: -4 }); s.style.marginLeft = '10px'; await stampIn(c, s); } },
      { cap: `The <b>range</b> is the set of all outputs: the shadow on the ${T(dvT('F'))}-axis, from ${T('6.0')} (the lowest point, at 80 km/h) up to ${T('13.2')}.`,
        run: async (c) => { await G.reveal(G.point(80, 6, { color: DV, r: 7, label: 'lowest', pos: 's' }), c); await G.drawIn(G.shadeY(6, 13.2, { band: true }), 800, c); await showLine(c, P, `<b class="u5l2-dvt">Range:</b> 6.0 to 13.2`); } }
    ];
  }
};

/* =====================================================================================
 * 4. spotRule — Section 3: where the independent variable sits in each representation. */
const spotRule = {
  title: 'Where is the independent variable?',
  height: 456,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'lin', label: T('y=-2x+9') }, { v: 'gen', label: T('4x-3y+24=0') }],
  intro: (k) => (k === 'lin' ? `One relation, ${T('y=-2x+9')}, five views. Find the <b>independent</b> variable in each. Press <b>Next</b>.` : `${T('4x-3y+24=0')} is not solved for either variable. Which one is the input? Press <b>Next</b>.`),
  make(stage, k, ex) {
    const W = ex.W;
    if (k === 'gen') return spotGen(stage, W);
    const xs = [1, 2, 3, 4], f = (x) => -2 * x + 9, pw = Math.floor((W - 28 - 28) / 3), ph = 212, X = (i) => 14 + i * (pw + 14);
    const mkP = (i, row, title, cls = '') => { const p = panel(stage, X(i), row ? 232 : 8, pw, ph, title, 'u5l2-sp ' + cls); p.style.opacity = 0; return p; };
    const p1 = mkP(0, 0, 'Ordered pairs'), p2 = mkP(1, 0, 'Table of values'), p3 = mkP(2, 0, 'Arrow diagram'), p4 = mkP(0, 1, 'Graph'), p5 = mkP(1, 1, 'Equation'), p6 = mkP(2, 1, 'The independent variable is…', 'u5l2-sp6');
    // pairs
    const pl = p1.appendChild(h('div', 'u5l2-sp-pairs'));
    const firsts = xs.map((x) => { const e = pl.appendChild(h('div', 'u5l2-pair', `${T('(')}<i class="u5l2-gx">${T(String(x))}</i>${T(`,\\ ${f(x)})`)}`)); return e.querySelector('.u5l2-gx'); });
    // table
    const tb = new ValueTable(p2, { headers: ['x', 'y'], rows: xs.map((x) => [x, f(x)]), cellW: 84, cellH: 33, tap: false });
    tb.el.style.alignSelf = 'center';
    // arrows
    const M = new MappingDiagram(p3, { width: pw - 20, height: 176, domain: xs, range: xs.map(f).sort((a, b) => a - b), pairs: xs.map((x) => [x, f(x)]), titles: [T('x'), T('y')], cls: 'u5l2-map u5l2-map-sm' });
    // graph
    const G = new Graph(p4, { width: pw - 20, height: 180, xmin: 0, xmax: 5, ymin: 0, ymax: 8, ylabels: 2, fontSize: 15 });
    xs.forEach((x) => G.point(x, f(x), { color: TEAL, r: 5 }));
    // equation
    const e1 = p5.appendChild(h('div', 'u5l2-sp-eq', T('y=-2x+9')));
    const e2 = p5.appendChild(h('div', 'u5l2-sp-eq u5l2-sp-eq2', T(`\\overbrace{${dvT('y')}}^{\\text{dependent}}=\\underbrace{-2${ivT('x')}+9}_{\\text{input inside}}`))); e2.style.opacity = 0;
    const add6 = (c, html) => showLine(c, p6, html, 'u5l2-l6');
    return [
      { cap: `One relation, ${T('y=-2x+9')}, in five views. Where does the <b>independent</b> variable ${T('x')} sit in each one?`,
        run: async (c) => { await Promise.all([p1, p2, p3, p4, p5, p6].map((p, i) => fadeIn(c, p, 350, { delay: i * 80 }))); } },
      { cap: `<b>Ordered pairs:</b> the <b>first</b> coordinate is the independent variable.`,
        run: async (c) => { firsts.forEach((e) => e.classList.add('on')); await Promise.all(firsts.map((e) => pulse(c, e, 1.3))); await add6(c, 'the <b>1st</b> coordinate'); } },
      { cap: `<b>Table:</b> the independent variable is listed <b>first</b>: the left column (or the top row of a sideways table).`,
        run: async (c) => { tb.highlightCol(0, true); await pulse(c, tb.el, 1.05); await add6(c, 'the <b>left</b> column (or top row)'); } },
      { cap: `<b>Arrow diagram:</b> arrows point <b>from</b> the independent variable <b>to</b> the dependent variable.`,
        run: async (c) => { M.ovals[0].style.stroke = IV; M.ovals[0].style.strokeWidth = 4; M.ovals[1].style.stroke = DV; M.arrowEls.forEach((a) => (a.style.color = IV)); for (const a of M.arrowEls) await drawIn(a, 340, c); await add6(c, 'where the <b>arrows start</b>'); } },
      { cap: `<b>Graph:</b> the independent variable is on the <b>horizontal</b> axis; the dependent variable on the vertical axis.`,
        run: async (c) => { const a = G.segment([0, 0], [5, 0], { color: IV, width: 7 }), b = G.segment([0, 0], [0, 8], { color: DV, width: 7 }); a.style.opacity = 0.75; b.style.opacity = 0.75; await G.drawIn(a, 500, c); await G.drawIn(b, 500, c); await add6(c, 'the <b>horizontal</b> axis'); } },
      { cap: `<b>Equation:</b> it is solved for ${T('y')}, so ${T('y')} is the dependent variable; ${T('x')} sits inside the expression.`,
        run: async (c) => { await fadeOut(c, e1, 250); await fadeIn(c, e2); await add6(c, '<b>inside</b> the expression'); } }
    ];
  }
};
function spotGen(stage, W) {
  const top = add(stage, h('div', 'u5l2-gen-eq', T('4x-3y+24=0')), W / 2, 30); top.style.translate = '-50% 0'; top.style.opacity = 0;
  const cw = Math.floor((W - 60) / 2);
  const L = panel(stage, 20, 120, cw, 240, `If ${T(dvT('y'))} depends on ${T(ivT('x'))}: solve for ${T('y')}`, 'u5l2-genp'), R = panel(stage, 40 + cw, 120, cw, 240, `If ${T(dvT('x'))} depends on ${T(ivT('y'))}: solve for ${T('x')}`, 'u5l2-genp');
  L.style.opacity = 0; R.style.opacity = 0;
  const lines = (P, arr) => arr.map((s) => { const d = line(P, T(s), 'u5l2-alg'); d.style.opacity = 0; return d; });
  const la = lines(L, ['4x-3y+24=0', '-3y=-4x-24', `${dvT('y')}=\\tfrac{4}{3}${ivT('x')}+8`]);
  const ra = lines(R, ['4x-3y+24=0', '4x=3y-24', `${dvT('x')}=\\tfrac{3}{4}${ivT('y')}-6`]);
  let s0;
  const showAll = async (c, P, arr) => { await fadeIn(c, P); for (const d of arr) { await fadeIn(c, d); await sleep(c, 160); } };
  return [
    { cap: `${T('4x-3y+24=0')} is <b>not solved</b> for either variable: neither ${T('x')} nor ${T('y')} is on its own.`,
      run: async (c) => { await pop(c, top); s0 = stamp(stage, '?', { ok: null, x: W / 2 + 150, y: 56 }); await stampIn(c, s0); } },
    { cap: `If ${T('y')} depends on ${T('x')}, solve for ${T('y')}: ${T('y=\\tfrac43x+8')}. Now ${T('y')} is the output.`,
      run: (c) => showAll(c, L, la) },
    { cap: `If ${T('x')} depends on ${T('y')}, solve for ${T('x')}: ${T('x=\\tfrac34y-6')}. Now ${T('x')} is the output.`,
      run: (c) => showAll(c, R, ra) },
    { cap: `Same relation either way. The equation alone can’t decide: the <b>context</b> (what ${T('x')} and ${T('y')} measure) decides which quantity depends on the other.`,
      run: async (c) => { s0.remove(); const s = stamp(stage, 'context decides', { ok: null, x: W / 2, y: 400, size: 'lg' }); await stampIn(c, s); } }
  ];
}

/* =====================================================================================
 * 5. exCheck — Example 1 and Example 2, part by part. */
const EXC = {
  '1a': { kind: 'map', iv: 'X', dv: 'Y', ins: ['4', '7', '9'], outs: ['13', '21'] },
  '1b': { kind: 'table', iv: 'n', dv: 'd', ins: ['5', '12', '30'], outs: ['18', '24', '9'] },
  '1c': { kind: 'pairs', iv: 'D', dv: 'm', ins: ['2', '5', '8', '11'], outs: ['9', '21', '33', '45'] },
  '2a': { kind: 'eq', iv: 't', dv: 'd' },
  '2b': { kind: 'graph', iv: '\\text{time}', dv: '\\text{temperature}' },
  '2c': { kind: 'words', iv: 'p', dv: 'v' }
};
const exCheck = {
  title: 'Check Examples 1 and 2',
  height: 392,
  value: '1a',
  choices: [{ sep: 'Example 1:' }, { v: '1a', label: '(a)' }, { v: '1b', label: '(b)' }, { v: '1c', label: '(c)' }, { sep: 'Example 2:' }, { v: '2a', label: '(a)' }, { v: '2b', label: '(b)' }, { v: '2c', label: '(c)' }],
  intro: (k) => `Example ${k[0]}(${k[1]}): find the independent variable first. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = EXC[k], W = ex.W, P = panel(stage, 500, 12, W - 514, 368, `Example ${k[0]}(${k[1]})`, 'u5l2-ans');
    const iL = `(i) independent: ${T(ivT(d.iv))}`, dL = `(ii) dependent: ${T(dvT(d.dv))}`;
    const steps = [];
    const writeID = (c) => showLine(c, P, iL).then(() => showLine(c, P, dL));
    const listSteps = (hiIn, hiOut, outCap) => {
      steps.push({ cap: `(iii) The <b>inputs</b> are the values of ${T(ivT(d.iv))}: ${T(d.ins.join(',\\ '))}.`, run: async (c) => { await hiIn(c); await showLine(c, P, `(iii) inputs: ${T(d.ins.join(',\\ '))}`); } });
      steps.push({ cap: outCap || `(iv) The <b>outputs</b> are the values of ${T(dvT(d.dv))}: ${T(d.outs.join(',\\ '))}.`, run: async (c) => { await hiOut(c); await showLine(c, P, `(iv) outputs: ${T(d.outs.join(',\\ '))}`); } });
    };
    if (d.kind === 'map') {
      const M = new MappingDiagram(stage, { x: 30, y: 14, width: 430, height: 360, domain: [4, 7, 9], range: [13, 21], pairs: [[4, 13], [7, 13], [9, 21]], titles: [T('X'), T('Y')], cls: 'u5l2-map' });
      steps.push({ cap: `The arrows start in ${T('X')} and point to ${T('Y')}: ${T('X')} is the independent variable, ${T('Y')} the dependent.`,
        run: async (c) => { M.ovals[0].style.stroke = IV; M.ovals[0].style.strokeWidth = 4; M.ovals[1].style.stroke = DV; M.ovals[1].style.strokeWidth = 4; M.arrowEls.forEach((a) => (a.style.color = IV)); for (const a of M.arrowEls) await drawIn(a, 380, c); await writeID(c); } });
      listSteps(async (c) => { for (const v of d.ins) { M.highlight('d', v); await pulse(c, M.item('d', v), 1.2); } },
        async (c) => { M.arrowEls.slice(0, 2).forEach((a) => (a.style.color = RED)); const b = M.item('r', '13'); b.classList.add('bk-bad'); await pulse(c, b, 1.3); M.highlight('r', '21'); },
        `(iv) The <b>outputs</b> are the values the arrows reach: ${T('13,\\ 21')}. ${T('13')} is hit <b>twice</b> but listed <b>once</b>.`);
    } else if (d.kind === 'table') {
      const tb = new ValueTable(stage, { x: 150, y: 50, headers: ['n', 'd'], rows: [[5, 18], [12, 24], [30, 9]], cellW: 110, cellH: 62, tap: false });
      steps.push({ cap: `The independent variable is listed <b>first</b> (the left column): ${T('n')}. The dependent variable is ${T('d')}.`, run: async (c) => { tb.highlightCol(0, true); await pulse(c, tb.heads[0], 1.3); await writeID(c); } });
      listSteps(async (c) => { await pulse(c, tb.el, 1.04); }, async (c) => { tb.highlightCol(0, false); tb.highlightCol(1, true); await pulse(c, tb.heads[1], 1.3); });
    } else if (d.kind === 'pairs') {
      const box1 = add(stage, box(h('div', 'u5l2-exc-pairs', `<div class="u5l2-exc-ph">${T('(D,\\ m)')}</div>`), 440, 300), 30, 40);
      const rows = [[2, 9], [5, 21], [8, 33], [11, 45]].map(([a, b]) => { const e = box1.appendChild(h('div', 'u5l2-pair', `${T('(')}<i class="u5l2-gx">${T(String(a))}</i>${T(',\\ ')}<i class="u5l2-gy">${T(String(b))}</i>${T(')')}`)); return [e.querySelector('.u5l2-gx'), e.querySelector('.u5l2-gy')]; });
      steps.push({ cap: `In ${T('(D,\\ m)')} the <b>first</b> coordinate is the independent variable: ${T('D')}. The second, ${T('m')}, is dependent.`, run: async (c) => { await pulse(c, box1.firstChild, 1.2); await writeID(c); } });
      listSteps(async (c) => { rows.forEach((r) => r[0].classList.add('on')); await Promise.all(rows.map((r) => pulse(c, r[0], 1.3))); }, async (c) => { rows.forEach((r) => r[1].classList.add('on')); await Promise.all(rows.map((r) => pulse(c, r[1], 1.3))); });
    } else if (d.kind === 'eq') {
      const e1 = add(stage, h('div', 'u5l2-exc-eq', T('d=4.9t^2')), 245, 150); e1.style.translate = '-50% -50%';
      const e2 = add(stage, h('div', 'u5l2-exc-eq', T(`\\overbrace{${dvT('d')}}^{\\text{isolated}}=\\underbrace{4.9${ivT('t')}^2}_{\\text{input inside}}`)), 245, 170); e2.style.translate = '-50% -50%'; e2.style.opacity = 0;
      steps.push({ cap: `${T('d')} is isolated on the left, so it is the output: the dependent variable. The input ${T('t')} sits inside the expression.`, run: async (c) => { await fadeOut(c, e1, 250); await fadeIn(c, e2); } });
      steps.push({ cap: `(i) independent: ${T('t')} &nbsp; (ii) dependent: ${T('d')}.`, run: writeID });
    } else if (d.kind === 'graph') {
      const G = new Graph(stage, { x: 20, y: 14, width: 450, height: 360, xmin: 0, xmax: 8, ymin: 0, ymax: 6, grid: false, numbers: false, xtitle: '\\text{time}', ytitle: '\\text{temperature}', fnArrows: false });
      G.fn('2*sqrt(x)', { from: 0.3, to: 7, color: 'ink' });
      steps.push({ cap: `<b>time</b> is on the horizontal axis, so it is the independent variable. <b>temperature</b>, on the vertical axis, is dependent.`,
        run: async (c) => { const a = G.segment([0, 0], [8, 0], { color: IV, width: 8 }), b = G.segment([0, 0], [0, 6], { color: DV, width: 8 }); a.style.opacity = 0.7; b.style.opacity = 0.7; await G.drawIn(a, 600, c); await G.drawIn(b, 600, c); } });
      steps.push({ cap: `(i) independent: time &nbsp; (ii) dependent: temperature.`, run: writeID });
    } else {
      const s = add(stage, box(h('div', 'u5l2-exc-words', `The <b>number of visitors</b>, ${T('v')}, to a museum on a given day is related to the <b>price</b>, ${T('p')}, of admission that day.`), 450, 140), 24, 40);
      const t1 = add(stage, box(h('div', 'u5l2-exc-test', `Do the visitors depend on the price?`), 450, 50), 24, 210), t2 = add(stage, box(h('div', 'u5l2-exc-test', `Does the price depend on the visitors?`), 450, 50), 24, 272);
      t1.style.opacity = 0; t2.style.opacity = 0;
      steps.push({ cap: `Test it both ways. The number of visitors <b>depends on</b> the price (a higher price keeps some people away); the museum sets the price.`,
        run: async (c) => { void s; await fadeIn(c, t1); const a = stamp(t1, '✓', { ok: true, size: 'sm' }); await stampIn(c, a); await fadeIn(c, t2); const b = stamp(t2, '✗', { ok: false, size: 'sm' }); await stampIn(c, b); } });
      steps.push({ cap: `(i) independent: ${T('p')} &nbsp; (ii) dependent: ${T('v')}.`, run: writeID });
    }
    return steps;
  }
};

/* =====================================================================================
 * 6. eqToGraph — equation → table → points → graph, then read it forwards and backwards. */
const EG = {
  c: { label: T('y=-2x+9'), f: (x) => -2 * x + 9, tex: 'y=-2x+9', sub: (x) => `y=-2(${x})+9`, xs: [0, 1, 2, 3, 4], kind: 'line',
    win: { xmin: -2, xmax: 7, ymin: -4, ymax: 12, ylabels: 2 }, fwd: 5, back: 11, stampAt: [4.6, 9] },
  e3: { label: 'Example 3', f: (x) => 3 * x - 4, tex: 'y=3x-4', sub: (x) => `y=3(${x})-4`, xs: [-2, -1, 0, 1, 2], kind: 'line',
    win: { xmin: -6, xmax: 6, ymin: -12, ymax: 12, xlabels: 2, ylabels: 5 }, fwd: 5, back: 8, stampAt: [-3.3, 7] },
  e4: { label: 'Example 4', f: (x) => x * x - 8, tex: 'y=x^2-8', sub: (x) => (x < 0 ? `y=(${x})^2-8` : `y=${x}^2-8`), xs: [4, 3, 2, 1, 0, -1, -2, -3], kind: 'curve',
    win: { xmin: -6, xmax: 6, ymin: -9, ymax: 9, xlabels: 2, ylabels: 4 }, sym: -4, stampAt: [2.4, -6.6] }
};
const pairT = (x, y) => `(${x},\\ ${y})`;
const eqToGraph = {
  title: 'Equation → table → graph',
  height: 484,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'c', label: EG.c.label }, { sep: 'Example checks:' }, { v: 'e3', label: EG.e3.label }, { v: 'e4', label: EG.e4.label }],
  intro: (k) => `Start from the equation ${T(EG[k].tex)}. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = EG[k], W = ex.W, n = d.xs.length;
    const G = new Graph(stage, Object.assign({ x: W - 458, y: 8, width: 448, height: 468 }, d.win));
    const sub = add(stage, box(h('div', 'u5l2-subbox', T(d.tex)), W - 492, 56), 14, 10);
    const cellH = k === 'e4' ? 36 : 44;
    const tb = new ValueTable(stage, { x: 14, y: 78, headers: ['x', 'y', '(x,\\ y)'], rows: d.xs.map((x) => [x, d.f(x), pairT(x, d.f(x))]), hide: (r, c) => c > 0 && r < n, tap: false, cellW: 108, cellH, cls: 'u5l2-eg-tb' });
    const setSub = (html, c) => { sub.innerHTML = html; return pulse(c, sub, 1.04, 300); };
    const steps = [
      { cap: `Substitute each input into ${T(d.tex)} to get its output.`,
        run: async (c) => { for (let i = 0; i < n; i++) { const x = d.xs[i]; tb.highlight(i, true); await setSub(T(`${d.sub(x)}=${d.f(x)}`), c); await tb.reveal(i, 1, c); await sleep(c, 140); tb.highlight(i, false); } await setSub(T(d.tex), c); } },
      { cap: `Each row is an <b>ordered pair</b> ${T('(x,\\ y)')}.`, run: (c) => tb.fill(c, { col: 2, stagger: 90 }) },
      { cap: `Plot each pair as a point.`,
        run: async (c) => { for (let i = 0; i < n; i++) { tb.highlight(i, true); await G.reveal(G.point(d.xs[i], d.f(d.xs[i]), { color: TEAL, r: 6 }), c, 240); await sleep(c, 60); tb.highlight(i, false); } } }
    ];
    const addRow = async (c, x) => { await tb.addRow([x, d.f(x), pairT(x, d.f(x))], c); tb.highlight(tb.rows.length - 1, true); };
    const st = (c, txt, ok) => { const [px, py] = G.toPx(d.stampAt[0], d.stampAt[1]); const s = stamp(stage, txt, { ok, x: W - 458 + px, y: 8 + py, size: 'lg' }); return stampIn(c, s); };
    if (d.kind === 'line') {
      const yF = d.f(d.fwd), xB = (d.back - (d.f(0))) / (d.f(1) - d.f(0));
      steps.push({ cap: `The points line up: join them with a straight line, with <b>arrows</b> at both ends (the pattern keeps going).`,
        run: (c) => G.drawIn(G.line([d.xs[0], d.f(d.xs[0])], [d.xs[n - 1], d.f(d.xs[n - 1])], { color: TEAL }), 900, c) });
      steps.push({ cap: `<b>Forwards:</b> from ${T('x=' + d.fwd)} go ${yF < 0 ? 'down' : 'up'} to the line, then across to the ${T('y')}-axis: ${T('y=' + yF)}.`,
        run: async (c) => { const a = G.segment([d.fwd, 0], [d.fwd, yF], { color: IV, width: 3, dash: true }), b = G.segment([d.fwd, yF], [0, yF], { color: DV, width: 3, dash: true, arrowB: true }); await G.drawIn(a, 500, c); await G.reveal(G.point(d.fwd, yF, { color: RED, r: 7 }), c); await G.drawIn(b, 500, c); await G.reveal(G.label(0, yF, T(String(yF)), { pos: 'w', cls: 'bk-ptlab', color: DV }), c); } });
      steps.push({ cap: `Check with the equation: ${T(`${d.sub(d.fwd)}=${yF}`)} ✓. Record the pair ${T(pairT(d.fwd, yF))} in the table.`,
        run: async (c) => { await setSub(T(`${d.sub(d.fwd)}=${yF}`) + ' <b class="u5l2-ok">✓</b>', c); await addRow(c, d.fwd); } });
      steps.push({ cap: `<b>Backwards:</b> from ${T('y=' + d.back)} go across to the line, then down to the ${T('x')}-axis: ${T('x=' + xB)}.`,
        run: async (c) => { tb.highlight(tb.rows.length - 1, false); const a = G.segment([0, d.back], [xB, d.back], { color: DV, width: 3, dash: true }), b = G.segment([xB, d.back], [xB, 0], { color: IV, width: 3, dash: true, arrowB: true }); await G.drawIn(a, 500, c); await G.reveal(G.point(xB, d.back, { color: RED, r: 7 }), c); await G.drawIn(b, 500, c); await G.reveal(G.label(xB, 0, T(String(xB)), { pos: 's', cls: 'bk-ptlab', color: IV }), c); await setSub(T(`${d.sub(xB)}=${d.back}`) + ' <b class="u5l2-ok">✓</b>', c); await addRow(c, xB); } });
      steps.push({ cap: `Its graph is a straight line, so the relation is called <b>linear</b>.`, run: (c) => st(c, 'Linear', true) });
    } else {
      const ys = d.f(-d.sym);
      steps.push({ cap: `Look for <b>symmetry</b>: ${T('x=\\pm1')} both give ${T('-7')}, ${T('\\pm2')} give ${T('-4')}, ${T('\\pm3')} give ${T('1')}. The graph is a mirror image across ${T('x=0')}.`,
        run: async (c) => { await G.drawIn(G.vline(0, { color: DV }), 500, c); for (const x of [1, 2, 3]) { await G.drawIn(G.segment([-x, d.f(x)], [x, d.f(x)], { color: 'gray', width: 2.5, dash: '6 5' }), 380, c); } } });
      steps.push({ cap: `So ${T('x=-4')} should give the same output as ${T('x=4')}: predict ${T('y=' + ys)}.`,
        run: async (c) => { await G.drawIn(G.segment([-d.sym, ys], [d.sym, ys], { color: 'gray', width: 2.5, dash: '6 5', arrowB: true }), 600, c); const p = G.point(d.sym, ys, { color: RED, r: 7, open: true }); await G.reveal(p, c); } });
      steps.push({ cap: `Check with the equation: ${T(`y=(-4)^2-8=16-8=${ys}`)} ✓. Record ${T(pairT(-4, ys))} in the table.`,
        run: async (c) => { await setSub(T(`y=(-4)^2-8=16-8=${ys}`) + ' <b class="u5l2-ok">✓</b>', c); await addRow(c, d.sym); await G.reveal(G.point(d.sym, ys, { color: TEAL, r: 6 }), c); } });
      steps.push({ cap: `Connect the points with a smooth <b>curve</b> (not straight pieces).`,
        run: (c) => G.drawIn(G.fn(d.f, { from: -4.12, to: 4.12, color: TEAL }), 1100, c) });
      steps.push({ cap: `The graph is a curve, not a straight line: a <b>nonlinear</b> relation.`, run: (c) => st(c, 'Nonlinear', null) });
    }
    return steps;
  }
};

/* =====================================================================================
 * 7. linTest — the table test: equal input steps, then compare the output changes; the graph's "stairs". */
const LT = {
  e3: { label: 'Example 3', xs: [-2, -1, 0, 1, 2], f: (x) => 3 * x - 4, tex: 'y=3x-4', win: { xmin: -3, xmax: 3, ymin: -12, ymax: 4, ylabels: 2 } },
  e4: { label: 'Example 4', xs: [0, 1, 2, 3, 4], f: (x) => x * x - 8, tex: 'y=x^2-8', win: { xmin: -1, xmax: 5, ymin: -9, ymax: 9, ylabels: 3 } },
  c: { label: T('y=-2x+9'), xs: [0, 1, 2, 3, 4], f: (x) => -2 * x + 9, tex: 'y=-2x+9', win: { xmin: -1, xmax: 5, ymin: -1, ymax: 10, ylabels: 2 } },
  un: { label: 'Uneven steps?', xs: [0, 1, 3, 4], f: (x) => 2 * x + 1, tex: 'y=2x+1', win: { xmin: -1, xmax: 5, ymin: -1, ymax: 10, ylabels: 2 } }
};
const sgnN = (v) => (v >= 0 ? '+' : '−') + Math.abs(v);
const linTest = {
  title: 'The table test for linearity',
  height: 446,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  value: 'e3',
  choices: [{ sep: 'Example checks:' }, { v: 'e3', label: LT.e3.label }, { v: 'e4', label: LT.e4.label }, { sep: 'Try:' }, { v: 'c', label: LT.c.label }, { v: 'un', label: LT.un.label }],
  intro: (k) => `Is ${T(LT[k].tex)} linear? Use only the table. Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = LT[k], W = ex.W, n = d.xs.length, ys = d.xs.map(d.f);
    const dx = d.xs.slice(1).map((x, i) => x - d.xs[i]), dy = ys.slice(1).map((y, i) => y - ys[i]);
    const evenX = dx.every((v) => v === dx[0]), evenY = dy.every((v) => v === dy[0]);
    const lin = k !== 'e4';
    const tb = new ValueTable(stage, { x: 20, y: 56, headers: ['x', 'y'], rows: d.xs.map((x, i) => [x, ys[i]]), layout: 'h', cellW: 76, cellH: 50, headW: 60, diffs: true, diffSpace: 70, tap: false });
    const G = new Graph(stage, Object.assign({ x: W - 446, y: 8, width: 436, height: 430 }, d.win));
    const P = panel(stage, 20, 244, W - 490, 194, '', 'u5l2-notes');
    const xlabs = [];
    const perX = dy.map((v, i) => v / dx[i]);
    return [
      { cap: `First check the <b>inputs</b>: do they go up in <b>equal steps</b>?` + (evenX ? ` Yes: ${sgnN(dx[0])} every time.` : ` No: ${dx.map(sgnN).join(', ')}.`),
        run: async (c) => {
          for (let i = 0; i < n - 1; i++) {
            const a = rel(stage, tb.cell(i, 0)), b = rel(stage, tb.cell(i + 1, 0));
            const l = add(stage, h('div', 'u5l2-xstep' + (evenX ? '' : ' bad'), sgnN(dx[i])), (a[0] + b[0]) / 2, 30); l.style.translate = '-50% -50%'; xlabs.push(l); await pop(c, l, 300);
          }
          await showLine(c, P, `inputs: ${dx.map(sgnN).join(', ')} ${evenX ? '<b class="u5l2-ok">equal steps ✓</b>' : '<b class="u5l2-bad">not equal!</b>'}`);
        } },
      { cap: `Now the <b>outputs</b>: how much does ${T('y')} change from each output to the next? ` + (evenY ? `${sgnN(dy[0])} every time.` : `${dy.map(sgnN).join(', ')}: not the same.`),
        run: async (c) => { await tb.diffs(c, { col: 1, color: evenY ? TEAL : RED }); await showLine(c, P, `output changes: ${dy.map(sgnN).join(', ')} ${evenY ? '<b class="u5l2-ok">constant</b>' : '<b class="u5l2-bad">not constant</b>'}`); } },
      { cap: `On the graph each step is a stair: <b>across</b> by the input step, then <b>up or down</b> by the output change.`,
        run: async (c) => {
          for (let i = 0; i < n; i++) await G.reveal(G.point(d.xs[i], ys[i], { color: TEAL, r: 6 }), c, 200);
          for (let i = 0; i < n - 1; i++) {
            const a = G.segment([d.xs[i], ys[i]], [d.xs[i + 1], ys[i]], { color: 'gray', width: 3 }), b = G.segment([d.xs[i + 1], ys[i]], [d.xs[i + 1], ys[i + 1]], { color: IV, width: 4 });
            await G.drawIn(a, 260, c); await G.drawIn(b, 260, c);
            await fadeIn(c, G.label(d.xs[i + 1], (ys[i] + ys[i + 1]) / 2, sgnN(dy[i]), { pos: dy[i] > 0 ? 'e' : 'w', cls: 'bk-ptlab', color: IV }));
          }
        } },
      { cap: k === 'un'
        ? `Trap! The inputs jumped ${dx.map(sgnN).join(', ')}, so the changes can’t be compared directly. Per 1 unit of ${T('x')} it is ${T('+2')} every time: the points <b>are</b> on a line. <b>Linear.</b>`
        : lin ? `The same change every step: identical stairs, so the points lie on a <b>straight line</b>. <b>Linear.</b>`
          : `The changes grow (${dy.map(sgnN).join(', ')}): the stairs get steeper, so the points bend into a <b>curve</b>. <b>Nonlinear.</b>`,
        run: async (c) => {
          if (lin) await G.drawIn(G.line([d.xs[0], ys[0]], [d.xs[n - 1], ys[n - 1]], { color: TEAL, width: 3 }), 800, c);
          else await G.drawIn(G.fn(d.f, { from: -0.6, to: 4.2, color: TEAL, width: 3 }), 900, c);
          if (k === 'un') await showLine(c, P, `per 1 step in ${T('x')}: ${perX.map(sgnN).join(', ')} <b class="u5l2-ok">constant</b>`);
          const s = stamp(P, lin ? 'Linear' : 'Nonlinear', { ok: lin ? true : null, rotate: -5 }); s.classList.add('u5l2-pst'); await stampIn(c, s);
        } }
    ];
  }
};

/* =====================================================================================
 * 8. linOrNot — sort equations: is the input only to the first power? */
const LN = [
  { t: 'y=3x-4', lin: true, f: (x) => 3 * x - 4, r: [-3, 4], why: `${T('x')} only to the first power` },
  { t: 'y=x^2-8', lin: false, f: (x) => x * x - 8, r: [-4, 4], why: `${T('x^2')}: the input is squared` },
  { t: 'b=10+20t', lin: true, f: (t) => 10 + 20 * t, r: [0, 4.5], why: `${T('t')} only to the first power` },
  { t: 'd=4.9t^2', lin: false, f: (t) => 4.9 * t * t, r: [0, 3], why: `${T('t^2')}: the input is squared` },
  { t: 'y=-2x+9', lin: true, f: (x) => -2 * x + 9, r: [0, 5], why: `${T('x')} only to the first power` },
  { t: 'F=0.002s^2-0.32s+18.8', lin: false, f: (s) => 0.002 * s * s - 0.32 * s + 18.8, r: [20, 140], why: `${T('s^2')}: the input is squared` },
  { t: '4x-3y+24=0', lin: true, f: (x) => (4 * x + 24) / 3, r: [-6, 3], why: `no squares (it is ${T('y=\\tfrac43x+8')})` }
];
function miniPlot(f, r, w = 132, hh = 70) {
  const N = 40, xs = [], ys = [];
  for (let i = 0; i <= N; i++) { const x = r[0] + (r[1] - r[0]) * i / N; xs.push(x); ys.push(f(x)); }
  const y0 = Math.min(...ys), y1 = Math.max(...ys), sy = (y1 - y0) || 1;
  const P = xs.map((x, i) => [6 + (w - 12) * (x - r[0]) / (r[1] - r[0]), hh - 6 - (hh - 12) * (ys[i] - y0) / sy]);
  return `<svg viewBox="0 0 ${w} ${hh}" width="${w}" height="${hh}" aria-hidden="true"><rect x="1" y="1" width="${w - 2}" height="${hh - 2}" rx="6" fill="#fff" stroke="#e2ddd1"/><path class="u5l2-mini bk-stroke" d="M${P.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')}" fill="none" stroke="${TEAL}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
const linOrNot = {
  title: 'From the equation: linear or nonlinear?',
  height: 486,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Sort the equations. Is the input only to the <b>first power</b>, or is it <b>squared</b>? Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, cw = Math.floor((W - 28 - 3 * 10) / 4);
    const chips = LN.map((e, i) => { const d = add(stage, box(h('div', 'u5l2-lnchip', T(e.t)), cw, 42), 14 + (i % 4) * (cw + 10) + (i >= 4 ? (cw + 10) / 2 : 0), 8 + Math.floor(i / 4) * 50); if (e.t.length > 14) d.style.fontSize = '15px'; fit(d, d.clientWidth, 12); return d; });
    const bw = Math.floor((W - 42) / 2), by = 112, bh = 366;
    const bins = [panel(stage, 14, by, bw, bh, '<b>Linear</b>: a straight line', 'u5l2-bin u5l2-bin-l'), panel(stage, 28 + bw, by, bw, bh, '<b>Nonlinear</b>: a curve', 'u5l2-bin u5l2-bin-n')];
    const sw = Math.floor((bw - 36) / 2), shh = 146;
    const cnt = [0, 0];
    const slots = LN.map((e) => {
      const b = e.lin ? 0 : 1, j = cnt[b]++, x = (b ? 28 + bw : 14) + 12 + (j % 2) * (sw + 12), y = by + 44 + Math.floor(j / 2) * (shh + 10);
      const s = add(stage, box(h('div', 'u5l2-slot2', `<div class="u5l2-s2eq">${T(e.t)}</div>${miniPlot(e.f, e.r)}<div class="u5l2-s2why">${e.why}</div>`), sw, shh), x, y);
      if (e.t.length > 14) s.firstChild.style.fontSize = '15px'; fit(s.firstChild, s.firstChild.clientWidth, 12); s.style.opacity = 0; return s;
    });
    const steps = LN.map((e, i) => ({
      cap: `${T(e.t)}: ${e.why}. ${e.lin ? 'Its graph is a straight line: <b>linear</b>.' : 'Its graph is a curve: <b>nonlinear</b>.'}`,
      run: async (c) => { chips[i].classList.add('used'); await fly(c, stage, T(e.t), rel(stage, chips[i]), rel(stage, slots[i]), 650, 'u5l2-flychip'); await fadeIn(c, slots[i], 300); const p = slots[i].querySelector('.u5l2-mini'); if (p) await drawIn(p.parentNode, 500, c); }
    }));
    steps.push({ cap: `<b>Rule of thumb:</b> if the input appears only to the <b>first power</b> (no ${T('x^2')}, no ${T('t^2')}), the graph is a straight line and the relation is linear.`,
      run: async (c) => { await Promise.all(bins.map((b) => pulse(c, b, 1.02))); } });
    return steps;
  }
};

/* =====================================================================================
 * static figures on the cards */
function mountFigures() {
  const vt = document.getElementById('vanfig-t');
  if (vt) new ValueTable(vt, { headers: [`\\text{Input }(${ivT('s')})`, `\\text{Output }(${dvT('F')})`], rows: VAN.xs.map((x, i) => [x, VAN.ys[i]]), cellW: 150, cellH: 40, tap: false });
  const vg = document.getElementById('vanfig-g');
  if (vg) {
    const G = new Graph(vg, { width: 540, height: 340, xmin: 0, xmax: 150, xstep: 10, xlabels: 20, ymin: 0, ymax: 15, ystep: 1, ylabels: 5, xtitle: ivT('s') + '\\ (\\text{km/h})', ytitle: dvT('F') });
    G.fn(VAN.f, { from: 20, to: 140, color: 'ink' });
    VAN.xs.forEach((x, i) => G.point(x, +VAN.ys[i], { color: 'ink', r: 5.5 }));
  }
  const e1a = document.getElementById('ex1a-fig');
  if (e1a) new MappingDiagram(e1a, { width: 270, height: 210, domain: [4, 7, 9], range: [13, 21], pairs: [[4, 13], [7, 13], [9, 21]], titles: [T('X'), T('Y')], cls: 'u5l2-map', color: 'ink' });
  const e1b = document.getElementById('ex1b-fig');
  if (e1b) new ValueTable(e1b, { headers: ['n', 'd'], rows: [[5, 18], [12, 24], [30, 9]], cellW: 76, cellH: 44, tap: false });
  const e2b = document.getElementById('ex2b-fig');
  if (e2b) { const G = new Graph(e2b, { width: 290, height: 200, xmin: 0, xmax: 8, ymin: 0, ymax: 6, grid: false, numbers: false, xtitle: '\\text{time}', ytitle: '\\text{temperature}', fnArrows: false }); G.fn('2*sqrt(x)', { from: 0.3, to: 7, color: 'ink' }); }
  const tag = (el, id) => { el.setAttribute('data-show', id); return el; };
  const g3 = document.getElementById('ex3-grid');
  if (g3) {
    const G = new Graph(g3, { width: 430, height: 450, xmin: -6, xmax: 6, ymin: -12, ymax: 12, xlabels: 2, ylabels: 5 });
    tag(G.line([-2, -10], [2, 2], { color: 'red', width: 3 }), 'ex3ab');
    [-2, -1, 0, 1, 2].forEach((x) => tag(G.point(x, 3 * x - 4, { color: 'red', r: 5.5 }), 'ex3ab'));
    tag(G.point(5, 11, { color: 'red', r: 5.5 }), 'ex3e'); tag(G.point(4, 8, { color: 'red', r: 5.5 }), 'ex3f');
  }
  const g4 = document.getElementById('ex4-grid');
  if (g4) {
    const G = new Graph(g4, { width: 430, height: 470, xmin: -6, xmax: 6, ymin: -9, ymax: 9, xlabels: 2, ylabels: 4 });
    [4, 3, 2, 1, 0, -1, -2, -3].forEach((x) => tag(G.point(x, x * x - 8, { color: 'red', r: 5.5 }), 'ex4ab'));
    tag(G.fn((x) => x * x - 8, { from: -4.12, to: 4.12, color: 'red', width: 3 }), 'ex4e');
    tag(G.point(-4, 8, { color: 'red', r: 5.5 }), 'ex4e');
  }
  // answers that belong to one part but live in a shared table or grid
  const sync = (p) => { const on = p.classList.contains('shown'); document.querySelectorAll(`[data-show="${p.dataset.part}"]`).forEach((e) => e.classList.toggle('u5l2-on', on)); };
  document.querySelectorAll('.part[data-part]').forEach((p) => { new MutationObserver(() => sync(p)).observe(p, { attributes: true, attributeFilter: ['class'] }); sync(p); });
}

/* =====================================================================================
 * warm-up: does it depend? */
function smooth(P) {
  let d = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
function mountWarm() {
  const wu = document.getElementById('wu'); if (!wu) return;
  wu.querySelectorAll('[data-icon]').forEach((e) => (e.innerHTML = icon(e.dataset.icon, 70)));
  const setCause = (pc, side, right) => {
    pc.dataset.cause = side;
    pc.querySelectorAll('.u5l2-q').forEach((q) => { q.querySelector('.u5l2-qt').textContent = q.dataset.side === side ? 'the cause: you control it' : 'depends on it'; });
    pc.querySelector('.u5l2-mq').textContent = 'affects';
    pc.classList.toggle('u5l2-right', !!right);
  };
  wu.querySelectorAll('.u5l2-pc').forEach((pc) => pc.querySelectorAll('.u5l2-q').forEach((q) => q.addEventListener('click', () => setCause(pc, q.dataset.side, false))));
  const link = (wq, pc) => { const w = document.getElementById(wq), p = document.getElementById(pc); if (!w || !p) return; new MutationObserver(() => { if (w.classList.contains('shown')) setCause(p, 'l', true); }).observe(w, { attributes: true, attributeFilter: ['class'] }); };
  link('wq1', 'pc1'); link('wq2', 'pc2');
  // the beach town graph (made-up data, as in the booklet's warm-up)
  const host = document.getElementById('beach'); if (!host) return;
  const X = (i) => 62 + (i + 0.5) * 32.5, Y = (v) => 262 - v * 23.5;
  const ice = [1.2, 1.4, 2.2, 3.4, 5.0, 7.0, 8.4, 8.0, 6.0, 3.6, 1.9, 1.3], shark = [0.5, 0.6, 1.0, 1.8, 3.2, 4.8, 6.3, 6.0, 4.2, 2.2, 1.0, 0.6];
  const temp = [2.6, 3.0, 4.0, 5.4, 6.9, 8.4, 9.4, 9.2, 7.7, 5.8, 4.0, 2.9];
  const P = (a) => smooth(a.map((v, i) => [X(i), Y(v)]));
  const months = 'JFMAMJJASOND'.split('');
  host.innerHTML = `<div class="u5l2-beach-h">A beach town, month by month</div>
  <svg viewBox="0 0 470 316" aria-label="Ice cream sales and shark attacks rise and fall together over the year">
    <rect x="0" y="0" width="470" height="316" rx="12" fill="#e8f0fc"/>
    <path d="M62 262H458M62 262V18" stroke="#1e2d46" stroke-width="2.5" fill="none"/><path d="M466 262l-11-6v12zM62 10l-6 11h12z" fill="#1e2d46"/>
    <text x="36" y="150" transform="rotate(-90 36 150)" text-anchor="middle" class="u5l2-bt">more →</text>
    ${months.map((m, i) => `<text x="${X(i)}" y="284" text-anchor="middle" class="u5l2-bt">${m}</text>`).join('')}
    <text x="260" y="306" text-anchor="middle" class="u5l2-bt u5l2-bi">(made-up data)</text>
    <path class="u5l2-temp" d="${P(temp)}" pathLength="1" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
    <path d="${P(ice)}" fill="none" stroke="#d9708f" stroke-width="5" stroke-linecap="round"/>
    <path d="${P(shark)}" fill="none" stroke="#6e7d8c" stroke-width="5" stroke-dasharray="11 8" stroke-linecap="round"/>
    <path d="M76 26H104" stroke="#d9708f" stroke-width="5" stroke-linecap="round"/><text x="112" y="32" class="u5l2-bl" fill="#b5527a">ice cream sales</text>
    <path d="M76 48H104" stroke="#6e7d8c" stroke-width="5" stroke-dasharray="11 6"/><text x="112" y="54" class="u5l2-bl" fill="#556472">shark attacks</text>
    <g class="u5l2-templab"><path d="M76 70H104" stroke="${RED}" stroke-width="4" stroke-linecap="round"/><text x="112" y="76" class="u5l2-bl" fill="${RED}">temperature</text></g>
  </svg>`;
  const poll = document.getElementById('wpoll');
  if (poll) { const s = () => host.classList.toggle('temp-on', poll.classList.contains('revealed')); new MutationObserver(s).observe(poll, { attributes: true, attributeFilter: ['class'] }); s(); }
}

mountFigures();
mountWarm();
export const explainers = mountExplainers({ sixViews, causeEffect, fuelStory, spotRule, exCheck, eqToGraph, linTest, linOrNot });
