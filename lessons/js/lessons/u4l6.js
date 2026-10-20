/* Math 10C · Unit 4 · Lesson 6 — Choosing a Factoring Strategy.
 * The Factoring Airport warm-up (a traveller routed through the lanes, with passport stamps), the factoring flowchart
 * that lights up the path for a chosen expression, the "can it board?" tickets, the departures boards (name the route
 * before factoring) and the check-by-expanding explainer. */
import { h, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const T = (s) => tex(s);
const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const box = (el, w, hh) => { el.style.width = w + 'px'; if (hh != null) el.style.height = hh + 'px'; return el; };
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const pulse = (c, el, s = 1.08) => c.anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], 460);
const stampIn = (c, el) => c.anim(el, [{ opacity: 0, transform: 'scale(1.9) rotate(-16deg)' }, { opacity: 1, transform: 'scale(1) rotate(-7deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' });

/* the checklist step → colour family (the same colours as the airport lanes and the flowchart boxes) */
const KIND = { 1: 'k1', 2: 'k2', 3: 'k3', 4: 'k3', 5: 'k4', 6: 'k6' };
const STEP = { 1: 'Common factor', 2: 'Difference of squares', 3: 'Inspection', 4: 'Decomposition', 5: 'Grouping', 6: 'Check' };

/* an arrow along a polyline: a grey base, a coloured overlay that draws itself when lit, and a head */
function polyArrow(svg, pts, o = {}) {
  const g = svgEl('g', { class: 'u4l6-ar' + (o.cls ? ' ' + o.cls : '') });
  const d = 'M' + pts.map((p) => p.join(' ')).join(' L');
  const base = svgEl('path', { d, class: 'u4l6-arb' + (o.dash ? ' dash' : '') });
  const hot = svgEl('path', { d, class: 'u4l6-arh' });
  const [x1, y1] = pts[pts.length - 2], [x2, y2] = pts[pts.length - 1];
  const ang = Math.atan2(y2 - y1, x2 - x1), L = o.head || 14, wd = 0.42;
  const head = svgEl('polygon', { class: 'u4l6-arhd', points: [[x2, y2], [x2 - L * Math.cos(ang - wd), y2 - L * Math.sin(ang - wd)], [x2 - L * Math.cos(ang + wd), y2 - L * Math.sin(ang + wd)]].map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ') });
  g.append(base, hot, head); svg.appendChild(g);
  let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  hot.style.strokeDasharray = len; hot.style.strokeDashoffset = len;
  return {
    g, len,
    async light(c, ms = 520) { g.classList.remove('old'); g.classList.add('lit'); await c.anim(hot, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], ms); }
  };
}
/* move an absolutely-placed element through waypoints (its centre), at a steady speed */
async function travel(c, el, from, pts, speed = 0.75, hw = 0, hh = 0) {
  const all = [from, ...pts], d = [0];
  for (let i = 1; i < all.length; i++) d.push(d[i - 1] + Math.hypot(all[i][0] - all[i - 1][0], all[i][1] - all[i - 1][1]));
  const tot = d[d.length - 1] || 1;
  const kf = all.map((p, i) => ({ transform: `translate(${p[0] - hw}px, ${p[1] - hh}px)`, offset: d[i] / tot }));
  await c.anim(el, kf, Math.max(380, Math.min(1500, tot / speed)), { easing: 'ease-in-out' });
}
/* shrink a line of math until it fits its box */
function fit(el, base, maxW) {
  el.style.fontSize = base + 'px';
  const lim = () => (maxW != null ? maxW : el.clientWidth + 1);
  let f = base;
  while (el.scrollWidth > lim() && f > 14) { f -= 1; el.style.fontSize = f + 'px'; }
}

/* =====================================================================================
 * Warm-up: the Factoring Airport
 * ===================================================================================== */
const LANE_Y = { L2: 84, L3: 190, L4: 296 };
const AP = {
  q1: { name: '1', q: 'x^2-25', s: [
    { to: 'sec', cap: `<b>Security (Lane 1).</b> Do ${T('x^2')} and ${T('25')} share a common factor? No. Nothing to take out, so <b>no stamp</b>.`, log: ['L1', '-'] },
    { to: 'L2', cap: `<b>Two terms</b>, so Lane 2. ${T('x^2-25=x^2-5^2')} is a difference of squares: ${T('(x-5)(x+5)')}. <b>Stamp!</b>`, log: ['L2', '(x-5)(x+5)'], stamp: [2] },
    { to: 'board', cap: `<b>Final check:</b> can ${T('x-5')} or ${T('x+5')} be factored again? No. <b>Time to board!</b> ${T('x^2-25=(x-5)(x+5)')}` }
  ] },
  q2: { name: '2', q: 'x^2+7x+12', s: [
    { to: 'sec', cap: `<b>Security (Lane 1).</b> ${T('x^2')}, ${T('7x')} and ${T('12')} share no common factor. <b>No stamp.</b>`, log: ['L1', '-'] },
    { to: 'L3', cap: `<b>Three terms</b>, so Lane 3. Two integers with product ${T('12')} and sum ${T('7')}: ${T('3')} and ${T('4')}. ${T('(x+3)(x+4)')}. <b>Stamp!</b>`, log: ['L3', '(x+3)(x+4)'], stamp: [3] },
    { to: 'board', cap: `<b>Final check:</b> neither bracket factors again. <b>Boarded:</b> ${T('x^2+7x+12=(x+3)(x+4)')}` }
  ] },
  q3: { name: '3', q: '4x^2-36', s: [
    { to: 'skip', cap: `This traveller <b>skipped security</b> and went straight to Lane 2: ${T('4x^2-36=(2x)^2-6^2=(2x-6)(2x+6)')}. <b>Stamp.</b>`, log: ['L2', '(2x-6)(2x+6)'], stamp: [2] },
    { to: 'chk', yes: true, cap: `<b>Final check: caught!</b> Each bracket still has a common factor ${T('2')}: ${T('2x-6=2(x-3)')} and ${T('2x+6=2(x+3)')}. It can’t board yet.` },
    { to: 'loop', cap: `<b>Back through security.</b> Lane 1 takes the ${T('2')} out of each bracket: ${T('2(x-3)\\cdot2(x+3)=4(x-3)(x+3)')}. <b>Stamp.</b>`, log: ['L1', '4(x-3)(x+3)'], stamp: [1] },
    { to: 'board', cap: `<b>Final check:</b> ${T('4')}, ${T('x-3')} and ${T('x+3')} can’t factor again. <b>Boarded:</b> ${T('4(x-3)(x+3)')}. Lane 1 <b>first</b> is quicker: ${T('4(x^2-9)=4(x-3)(x+3)')}.` }
  ] },
  A: { name: 'A', q: 'x^2-9x+20', s: [
    { to: 'sec', cap: `<b>Security (Lane 1):</b> no common factor. <b>No stamp.</b>`, log: ['L1', '-'] },
    { to: 'L3', cap: `<b>Three terms:</b> Lane 3. Product ${T('20')}, sum ${T('-9')}: ${T('-4')} and ${T('-5')}. ${T('(x-4)(x-5)')}. <b>Stamp!</b>`, log: ['L3', '(x-4)(x-5)'], stamp: [3] },
    { to: 'board', cap: `<b>Boarded:</b> ${T('(x-4)(x-5)')}. Traveller A gets stamps from <b>one</b> lane only.` }
  ] },
  B: { name: 'B', q: '5x^2-45', s: [
    { to: 'sec', cap: `<b>Security (Lane 1):</b> both terms share ${T('5')}. ${T('5x^2-45=5(x^2-9)')}. <b>Stamp!</b>`, log: ['L1', '5(x^2-9)'], stamp: [1] },
    { to: 'L2', cap: `Two terms left in the bracket: Lane 2. ${T('x^2-9=(x-3)(x+3)')}, so ${T('5(x-3)(x+3)')}. <b>Stamp!</b>`, log: ['L2', '5(x-3)(x+3)'], stamp: [2] },
    { to: 'board', cap: `<b>Boarded:</b> ${T('5(x-3)(x+3)')}. Traveller B gets stamps from <b>two</b> lanes: 1 and 2.` }
  ] },
  C: { name: 'C', q: 'x^4-81', s: [
    { to: 'sec', cap: `<b>Security (Lane 1):</b> no common factor. <b>No stamp.</b>`, log: ['L1', '-'] },
    { to: 'L2', cap: `<b>Two terms:</b> Lane 2. ${T('x^4-81=(x^2)^2-9^2=(x^2-9)(x^2+9)')}. <b>Stamp!</b>`, log: ['L2', '(x^2-9)(x^2+9)'], stamp: [2] },
    { to: 'chk', yes: true, cap: `<b>Final check:</b> ${T('x^2-9')} is <b>still</b> a difference of squares. Back through the lanes!` },
    { to: 'loop', cap: `<b>Security again:</b> still no common factor, so no stamp.`, log: ['L1', '-'] },
    { to: 'L2', cap: `Lane 2 again: ${T('x^2-9=(x-3)(x+3)')}. Now ${T('(x-3)(x+3)(x^2+9)')}. <b>Stamp!</b>`, log: ['L2', '(x-3)(x+3)(x^2+9)'], stamp: [2] },
    { to: 'board', cap: `${T('x^2+9')} is a <b>sum</b> of squares: it can’t be factored. <b>Boarded.</b> The trap: two stamps, but both from Lane 2, so only <b>one</b> lane.` }
  ] },
  D: { name: 'D', q: '2x^4-10x^2+8', s: [
    { to: 'sec', cap: `<b>Security (Lane 1):</b> every term shares ${T('2')}. ${T('2x^4-10x^2+8=2(x^4-5x^2+4)')}. <b>Stamp!</b>`, log: ['L1', '2(x^4-5x^2+4)'], stamp: [1] },
    { to: 'L3', cap: `<b>Three terms</b> (degrees 4, 2, 0): Lane 3, with ${T('x^2')} as one block. Product ${T('4')}, sum ${T('-5')}: ${T('-1')} and ${T('-4')}. ${T('2(x^2-1)(x^2-4)')}. <b>Stamp!</b>`, log: ['L3', '2(x^2-1)(x^2-4)'], stamp: [3] },
    { to: 'chk', yes: true, cap: `<b>Final check:</b> ${T('x^2-1')} and ${T('x^2-4')} are both differences of squares. Back through the lanes!` },
    { to: 'loop', cap: `<b>Security again:</b> neither bracket has a common factor. No stamp this time.`, log: ['L1', '-'] },
    { to: 'L2', cap: `<b>Lane 2, twice:</b> ${T('x^2-1=(x-1)(x+1)')} and ${T('x^2-4=(x-2)(x+2)')}. <b>Two stamps!</b>`, log: ['L2', '2(x-1)(x+1)(x-2)(x+2)'], stamp: [2, 2] },
    { to: 'board', cap: `<b>Boarded:</b> ${T('2(x-1)(x+1)(x-2)(x+2)')}. Stamps from <b>three different lanes</b> (1, 3 and 2): D is the answer to the big one.` }
  ] },
  F: { name: '+', title: 'Follow-up', q: '3x^3+3x^2-12x-12', s: [
    { to: 'sec', cap: `<b>Security (Lane 1):</b> every term shares ${T('3')}. ${T('3(x^3+x^2-4x-4)')}. <b>Stamp!</b>`, log: ['L1', '3(x^3+x^2-4x-4)'], stamp: [1] },
    { to: 'L4', cap: `<b>Four terms:</b> Lane 4, grouping. ${T('x^2(x+1)-4(x+1)=(x+1)(x^2-4)')}, so ${T('3(x+1)(x^2-4)')}. <b>Stamp!</b>`, log: ['L4', '3(x+1)(x^2-4)'], stamp: [4] },
    { to: 'chk', yes: true, cap: `<b>Final check:</b> ${T('x^2-4')} is a difference of squares. Back through!` },
    { to: 'loop', cap: `<b>Security again:</b> no common factor in ${T('x^2-4')}. No stamp.`, log: ['L1', '-'] },
    { to: 'L2', cap: `Lane 2: ${T('x^2-4=(x-2)(x+2)')}, so ${T('3(x+1)(x-2)(x+2)')}. <b>Stamp!</b>`, log: ['L2', '3(x+1)(x-2)(x+2)'], stamp: [2] },
    { to: 'board', cap: `<b>Boarded:</b> ${T('3(x+1)(x-2)(x+2)')}. Three different lanes too: 1, 4 and 2.` }
  ] }
};
const LANE_NAME = { L1: 'Lane 1', L2: 'Lane 2', L3: 'Lane 3', L4: 'Lane 4' };

const airport = {
  title: 'Route a traveller through the airport',
  height: 504,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'q1', label: '1' }, { v: 'q2', label: '2' }, { v: 'q3', label: '3' }, { sep: 'The big one:' }, ...'ABCD'.split('').map((k) => ({ v: k, label: k })), { sep: 'Follow-up:' }, { v: 'F', label: '+' }],
  intro: (k) => `${AP[k].title ? 'The follow-up traveller' : 'Traveller <b>' + AP[k].name + '</b>'} is ${T(AP[k].q)}. It starts at check-in. Every expression goes through <b>security (Lane 1)</b> first.`,
  make(stage, key) {
    const tr = AP[key];
    const svg = svgEl('svg', { class: 'u4l6-svg' }); stage.appendChild(svg);
    // boxes
    const sec = add(stage, box(h('div', 'u4l6-lane k1 u4l6-sec', '<div class="u4l6-in"><b>Lane 1</b>Common factor?<br>Take it out <em>first</em>.</div>'), 190, 144), 128, 118);
    add(stage, box(h('div', 'u4l6-arch'), 214, 162), 116, 100);
    add(stage, h('div', 'u4l6-archlab', 'SECURITY'), 223, 100);
    const lanes = {
      sec,
      L2: add(stage, box(h('div', 'u4l6-lane k2', '<div class="u4l6-in"><b>Lane 2 · 2 terms</b>Difference of squares?</div>'), 240, 76), 400, LANE_Y.L2 - 38),
      L3: add(stage, box(h('div', 'u4l6-lane k3', '<div class="u4l6-in"><b>Lane 3 · 3 terms</b>Trinomial</div>'), 240, 76), 400, LANE_Y.L3 - 38),
      L4: add(stage, box(h('div', 'u4l6-lane k4', '<div class="u4l6-in"><b>Lane 4 · 4 terms</b>Grouping</div>'), 240, 76), 400, LANE_Y.L4 - 38),
      chk: add(stage, box(h('div', 'u4l6-lane k6', '<div class="u4l6-in"><b>Final check</b>Can any piece be factored again?</div>'), 160, 132), 712, 124)
    };
    add(stage, h('div', 'u4l6-cilab', 'Check-in'), 62, 236);
    // flow arrows
    polyArrow(svg, [[98, 190], [126, 190]], { head: 11 });
    ['L2', 'L3', 'L4'].forEach((k) => { polyArrow(svg, [[320, 190], [398, LANE_Y[k]]], { head: 12 }); polyArrow(svg, [[642, LANE_Y[k]], [710, 190]], { head: 12 }); });
    const loopA = polyArrow(svg, [[792, 122], [792, 26], [223, 26], [223, 96]], { cls: 'red', head: 13 });
    const loopLab = add(stage, h('div', 'u4l6-aplab red', 'YES: go back through the lanes'), 507, 26);
    const boardA = polyArrow(svg, [[792, 258], [792, 306], [872, 306]], { cls: 'green', head: 13 });
    const noLab = add(stage, h('div', 'u4l6-aplab green', 'NO: time to board!'), 836, 330);
    const plane = add(stage, h('div', 'u4l6-plane', '<svg viewBox="-2 -1.3 4 2.6"><g transform="rotate(-18)"><path d="M-1.4 -.16H1.15L1.6 0L1.15 .16H-1.4Z"/><path d="M-.1 0L-.65 -1.1H-.25L.5 0L-.25 1.1H-.65Z"/><path d="M-1.4 0L-1.62 -.6H-1.27L-1 0Z"/></g></svg>'), 912, 300);
    const planeMsg = add(stage, h('div', 'u4l6-boarded', 'BOARDED ✓'), 836, 332); hide(planeMsg);
    // the suitcase
    const SW = 54, SH = 38, home = [62, 190];
    const suit = h('div', 'u4l6-suit', `<i></i><span>${tr.name}</span>`); box(suit, SW, SH); stage.appendChild(at(suit, 0, 0));
    suit.style.transform = `translate(${home[0] - SW / 2}px, ${home[1] - SH / 2}px)`;
    // itinerary and passport
    const itin = add(stage, box(h('div', 'u4l6-itin', `<div class="u4l6-ith">${tr.title || 'Traveller ' + tr.name}: ${T(tr.q)}</div>`), 586, 140), 14, 354);
    const logBox = h('div', 'u4l6-logs'); itin.appendChild(logBox);
    const pass = add(stage, box(h('div', 'u4l6-pass', '<div class="u4l6-pph">PASSPORT</div>'), 338, 140), 614, 354);
    const stamps = h('div', 'u4l6-stamps'); pass.appendChild(stamps);
    const pfoot = h('div', 'u4l6-pfoot', '<span class="muted">no stamps yet</span>'); pass.appendChild(pfoot);
    const got = [];
    let loc = 'in', pos = home;
    // the suitcase waits on the bottom edge of each box, so the box's words stay readable
    const SEC = [223, 262], LB = (k) => [520, LANE_Y[k] + 38], CHK = [792, 256];
    const toChk = (from) => [[640, LANE_Y[from] + 38], [700, 236], CHK];
    const route = (to) => {
      if (to === 'sec') return [[150, 236], SEC];
      if (to === 'skip') return [[100, 150], [150, 66], [300, 66], [400, LANE_Y.L2 + 38], LB('L2')];
      if (/^L\d/.test(to)) return [[330, 236], [400, LANE_Y[to] + 38], LB(to)];
      if (to === 'chk') return loc === 'chk' ? [] : toChk(loc);
      if (to === 'loop') return [[792, 190], [792, 122], [792, 26], [223, 26], [223, 96], SEC];
      if (to === 'board') {
        const pre = loc === 'chk' ? [] : loc === 'sec' ? [[330, 236], [400, LANE_Y.L2 + 38], [640, LANE_Y.L2 + 38], [700, 236], CHK] : toChk(loc);
        return [...pre, [792, 306], [884, 306]];
      }
      return [];
    };
    const light = (k) => { Object.entries(lanes).forEach(([n, el]) => el.classList.toggle('on', n === k)); };
    const steps = tr.s.map((st) => ({
      cap: st.cap,
      run: async (c) => {
        const pts = route(st.to);
        if (st.to === 'loop') loopA.light(c, 700).catch(() => {});
        if (st.to === 'board') boardA.light(c, 1100).catch(() => {});
        if (st.to === 'loop') c.fadeIn(loopLab, 300).catch(() => {});
        if (st.to === 'chk' || st.to === 'board') light('chk');
        await travel(c, suit, pos, pts, 0.7, SW / 2, SH / 2);
        pos = pts.length ? pts[pts.length - 1] : pos;
        loc = st.to === 'loop' ? 'sec' : st.to === 'skip' ? 'L2' : st.to;
        const jobs = [];
        if (st.to === 'skip') { const tag = add(stage, h('div', 'u4l6-aplab red', 'skipped!'), 223, 74); jobs.push(c.pop(tag, 360)); }
        if (st.to !== 'board') { light(loc); jobs.push(pulse(c, lanes[loc], 1.04)); }
        if (st.yes) { lanes.chk.classList.add('yes'); jobs.push(c.shake(lanes.chk)); }
        else lanes.chk.classList.remove('yes');
        if (st.log) {
          const [ln, src] = st.log, none = src === '-';
          const row = h('div', 'u4l6-log' + (none ? ' none' : ''), `<span class="u4l6-lg ${ln}">${LANE_NAME[ln]}</span><span class="u4l6-lm">${none ? 'no common factor: no stamp' : T(src)}</span>`);
          logBox.appendChild(row); while (logBox.children.length > 3) logBox.firstChild.remove();
          jobs.push(c.fadeIn(row, 300, { from: 'translateX(-10px)' }));
        }
        if (st.stamp) {
          for (const k of st.stamp) {
            got.push(k);
            const sp = h('div', 'u4l6-stamp k' + (k === 1 ? 1 : k === 2 ? 2 : k === 3 ? 3 : 4), `LANE<b>${k}</b>`); stamps.appendChild(sp);
            jobs.push(stampIn(c, sp));
          }
          pfoot.innerHTML = `${got.length} stamp${got.length > 1 ? 's' : ''}`;
        }
        await Promise.all(jobs);
        if (st.to === 'board') {
          const n = new Set(got).size;
          pfoot.innerHTML = `${got.length} stamp${got.length === 1 ? '' : 's'} · <b>${n} different lane${n === 1 ? '' : 's'}</b>`;
          lanes.chk.classList.remove('on');
          await Promise.all([c.anim(suit, [{ opacity: 1, transform: suit.style.transform }, { opacity: 0, transform: `translate(${912 - SW / 2}px, ${300 - SH / 2}px) scale(.3)` }], 450),
            c.anim(plane, [{ transform: 'translate(0,0) rotate(0deg)' }, { transform: 'translate(10px,-34px) rotate(-8deg)' }], 900, { delay: 250 }),
            c.anim(noLab, [{ opacity: 1 }, { opacity: 0 }], 250), stampIn(c, planeMsg), pulse(c, pfoot, 1.08)]);
        }
      }
    }));
    return steps;
  }
};

/* =====================================================================================
 * 1. The flowchart: light up the path for one expression
 * ===================================================================================== */
const FW = 640; // width of the flowchart; the written work sits to its right
const NODES = {
  top: { x: 324, y: 46, w: 360, h: 70, k: 'k1', n: 1, html: '<b>Common factor? Take it out first.</b><small>(Negative leading coefficient: take out a negative.)</small>' },
  bin: { x: 110, y: 186, w: 196, h: 142, k: 'k2', n: 2, html: `<b>Binomial (2 terms)</b>Difference of squares<br>${T('A^2-B^2')}<small>(sum of squares: does not factor)</small>` },
  tri: { x: 324, y: 186, w: 200, h: 142, k: 'k3', html: `<b>Trinomial (3 terms)</b>${T('ax^2+bx+c')}<small>(degrees 4,&nbsp;2,&nbsp;0 or 6,&nbsp;3,&nbsp;0: treat ${T('x^2')} or ${T('x^3')} as a block)</small>` },
  four: { x: 534, y: 186, w: 150, h: 80, k: 'k4', n: 5, html: '<b>Four terms</b>Try grouping' },
  insp: { x: 236, y: 344, w: 156, h: 68, k: 'k3', n: 3, html: `<b>${T('a=1')}:</b>inspection` },
  dec: { x: 418, y: 344, w: 184, h: 100, k: 'k3', n: 4, html: `<b>${T('a\\neq1')}:</b>decomposition<small>(watch for perfect squares)</small>` },
  chk: { x: 324, y: 484, w: 364, h: 66, k: 'k6 dash', n: 6, html: '<b>Always finish by checking:</b>can any factor be factored again?' }
};
const EDGES = {
  'top-bin': { p: [[256, 81], [152, 114]], lab: [196, 95] },
  'top-tri': { p: [[324, 81], [324, 114]], lab: [324, 98] },
  'top-four': { p: [[392, 81], [510, 145]], lab: [456, 110] },
  'tri-insp': { p: [[290, 257], [256, 309]], lab: [266, 281] },
  'tri-dec': { p: [[358, 257], [398, 293]], lab: [390, 272] },
  'bin-chk': { p: [[110, 257], [110, 484], [140, 484]] },
  'four-chk': { p: [[534, 226], [534, 484], [508, 484]] },
  'insp-chk': { p: [[244, 378], [280, 450]] },
  'dec-chk': { p: [[402, 394], [370, 450]] },
  loop: { p: [[324, 517], [324, 533], [627, 533], [627, 46], [506, 46]], dash: true }
};
const FL = {
  d1: { q: '5x^3-20x', s: [
    { n: 'top', cap: `<b>Step 1: common factor?</b> Both terms share ${T('5x')}. Take it out first: ${T('5x^3-20x=5x(x^2-4)')}.`, w: [1, '5x(x^2-4)'] },
    { e: 'top-bin', lab: '2 terms', n: 'bin', cap: `Count the terms <b>left in the bracket</b>: ${T('x^2-4')} has two. ${T('x^2=(x)^2')} and ${T('4=2^2')} with a minus between: a <b>difference of squares</b>.`, w: [2, '5x(x-2)(x+2)'] },
    { e: 'bin-chk', n: 'chk', cap: `<b>Check:</b> can ${T('5x')}, ${T('x-2')} or ${T('x+2')} be factored again? No. <b>Fully factored.</b>`, done: '5x(x-2)(x+2)' }
  ] },
  d2: { q: '3x^2+12x-36', s: [
    { n: 'top', cap: `<b>Step 1:</b> every term shares ${T('3')}: ${T('3x^2+12x-36=3(x^2+4x-12)')}.`, w: [1, '3(x^2+4x-12)'] },
    { e: 'top-tri', lab: '3 terms', n: 'tri', cap: `Three terms left in the bracket: a trinomial.` },
    { e: 'tri-insp', lab: 'a = 1', n: 'insp', cap: `Inside the bracket ${T('a=1')}, so <b>inspection</b>: product ${T('-12')}, sum ${T('4')}: ${T('6')} and ${T('-2')}.`, w: [3, '3(x+6)(x-2)'] },
    { e: 'insp-chk', n: 'chk', cap: `<b>Check:</b> nothing factors again. Taking the 3 out first turned a decomposition into an easy inspection.`, done: '3(x+6)(x-2)' }
  ] },
  d3: { q: 'x^3+2x^2-9x-18', s: [
    { n: 'top', cap: `<b>Step 1:</b> no factor is common to all four terms (${T('x^3')} and ${T('-18')} share nothing). Nothing to take out.` },
    { e: 'top-four', lab: '4 terms', n: 'four', cap: `Four terms: <b>grouping</b>. ${T('x^2(x+2)-9(x+2)=(x+2)(x^2-9)')}.`, w: [5, '(x+2)(x^2-9)'] },
    { e: 'four-chk', n: 'chk', yes: true, cap: `<b>Check: not finished!</b> ${T('x^2-9')} is a difference of squares.` },
    { e: 'loop', n: 'top', loop: true, cap: `<b>Yes</b>, so ${T('x^2-9')} goes back to the top of the chart on its own. It has no common factor…` },
    { e: 'top-bin', lab: '2 terms', n: 'bin', cap: `…and two terms: ${T('x^2-9=(x-3)(x+3)')}.`, w: [2, '(x+2)(x-3)(x+3)'] },
    { e: 'bin-chk', n: 'chk', cap: `<b>Check:</b> nothing factors again. <b>Fully factored.</b>`, done: '(x+2)(x-3)(x+3)' }
  ] },
  d4: { q: '4x^2+36', s: [
    { n: 'top', cap: `<b>Step 1:</b> both terms share ${T('4')}: ${T('4x^2+36=4(x^2+9)')}.`, w: [1, '4(x^2+9)'] },
    { e: 'top-bin', lab: '2 terms', n: 'bin', cap: `Two terms left, but ${T('x^2+9')} is a <b>sum</b> of squares. A sum of squares <b>does not factor</b>.` },
    { e: 'bin-chk', n: 'chk', cap: `<b>Check:</b> nothing else factors. ${T('4(x^2+9)')} is fully factored, even though only step 1 did anything.`, done: '4(x^2+9)' }
  ] },
  e1a: { q: '8x^2-50', s: [
    { n: 'top', cap: `<b>Step 1:</b> every term shares ${T('2')} (${T('8=2\\cdot4')}, ${T('50=2\\cdot25')}). Take it out first: ${T('8x^2-50=2(4x^2-25)')}.`, w: [1, '2(4x^2-25)'] },
    { e: 'top-bin', lab: '2 terms', n: 'bin', cap: `Two terms left: ${T('4x^2-25=(2x)^2-5^2')}, a <b>difference of squares</b>.`, w: [2, '2(2x-5)(2x+5)'] },
    { e: 'bin-chk', n: 'chk', cap: `<b>Check:</b> no bracket factors further. <b>Fully factored.</b>`, done: '2(2x-5)(2x+5)' }
  ] },
  e1b: { q: '-12x^2+27', s: [
    { n: 'top', cap: `<b>Step 1:</b> the leading coefficient is <b>negative</b>, so take out a negative: GCF ${T('=-3')}. Dividing by ${T('-3')} flips <b>every</b> sign: ${T('-3(4x^2-9)')}.`, w: [1, '-3(4x^2-9)'] },
    { e: 'top-bin', lab: '2 terms', n: 'bin', cap: `Two terms left: ${T('4x^2-9=(2x)^2-3^2')}, a difference of squares.`, w: [2, '-3(2x-3)(2x+3)'] },
    { e: 'bin-chk', n: 'chk', cap: `<b>Check:</b> nothing factors again. <b>Fully factored.</b>`, done: '-3(2x-3)(2x+3)' }
  ] },
  e2a: { q: 'x^2-2x-63', s: [
    { n: 'top', cap: `<b>Step 1:</b> ${T('x^2')}, ${T('-2x')} and ${T('-63')} share no common factor. Nothing to take out.` },
    { e: 'top-tri', lab: '3 terms', n: 'tri', cap: `Three terms: a trinomial ${T('ax^2+bx+c')}.` },
    { e: 'tri-insp', lab: 'a = 1', n: 'insp', cap: `${T('a=1')}, so <b>inspection</b>: two integers with product ${T('-63')} and sum ${T('-2')}: ${T('-9')} and ${T('7')}.`, w: [3, '(x-9)(x+7)'] },
    { e: 'insp-chk', n: 'chk', cap: `<b>Check:</b> neither bracket factors again. <b>Fully factored.</b>`, done: '(x-9)(x+7)' }
  ] },
  e2b: { q: '-6x^2+5x+21', s: [
    { n: 'top', cap: `<b>Step 1:</b> no common number, but the leading coefficient is <b>negative</b>: take out ${T('-1')}. Every sign flips.`, w: [1, '-(6x^2-5x-21)'] },
    { e: 'top-tri', lab: '3 terms', n: 'tri', cap: `Three terms in the bracket: a trinomial.` },
    { e: 'tri-dec', lab: 'a ≠ 1', n: 'dec', cap: `${T('a=6\\neq1')}: <b>decomposition</b>. ${T('ac=6\\times(-21)=-126')}; the pair with sum ${T('-5')} is ${T('-14')} and ${T('9')}. Split the middle term.`, w: [4, '-(6x^2-14x+9x-21)'] },
    { n: 'dec', cap: `Group the pairs: ${T('2x(3x-7)+3(3x-7)=(3x-7)(2x+3)')}.`, w: [4, '-(3x-7)(2x+3)'] },
    { e: 'dec-chk', n: 'chk', cap: `<b>Check:</b> neither bracket factors again. The ${T('-1')} can also go into the first bracket: ${T('(7-3x)(2x+3)')}.`, done: '-(3x-7)(2x+3)=(7-3x)(2x+3)' }
  ] },
  e3a: { q: 'x^2-xy+3x-3y', s: [
    { n: 'top', cap: `<b>Step 1:</b> no factor is common to <b>all four</b> terms. Nothing to take out.` },
    { e: 'top-four', lab: '4 terms', n: 'four', cap: `Four terms: <b>grouping</b>. ${T('(x^2-xy)+(3x-3y)=x(x-y)+3(x-y)')}.`, w: [5, 'x(x-y)+3(x-y)'] },
    { n: 'four', cap: `The bracket ${T('(x-y)')} is a common factor of both groups.`, w: [5, '(x-y)(x+3)'] },
    { e: 'four-chk', n: 'chk', cap: `<b>Check:</b> neither bracket factors again. <b>Fully factored.</b>`, done: '(x-y)(x+3)' }
  ] },
  e3b: { q: 'x^4-13x^2+36', s: [
    { n: 'top', cap: `<b>Step 1:</b> no common factor. Nothing to take out.` },
    { e: 'top-tri', lab: '3 terms', n: 'tri', cap: `Three terms with degrees 4, 2, 0: a trinomial in ${T('x^2')}. Treat ${T('x^2')} as one block.` },
    { e: 'tri-insp', lab: 'a = 1', n: 'insp', cap: `${T('a=1')}: product ${T('36')}, sum ${T('-13')}: ${T('-9')} and ${T('-4')}.`, w: [3, '(x^2-9)(x^2-4)'] },
    { e: 'insp-chk', n: 'chk', yes: true, cap: `<b>Check: not finished!</b> ${T('x^2-9')} and ${T('x^2-4')} are both differences of squares.` },
    { e: 'loop', n: 'top', loop: true, cap: `<b>Yes</b>, so each bracket goes back to the top. Neither has a common factor…` },
    { e: 'top-bin', lab: '2 terms', n: 'bin', cap: `…and each has two terms: ${T('x^2-9=(x-3)(x+3)')} and ${T('x^2-4=(x-2)(x+2)')}.`, w: [2, '(x-3)(x+3)(x-2)(x+2)'] },
    { e: 'bin-chk', n: 'chk', cap: `<b>Check:</b> nothing factors again. <b>Fully factored.</b>`, done: '(x-3)(x+3)(x-2)(x+2)' }
  ] },
  e4a: { q: '4a^2-20ab+25b^2', s: [
    { n: 'top', cap: `<b>Step 1:</b> ${T('4')}, ${T('20')} and ${T('25')} share no common factor, and no letter is in every term.` },
    { e: 'top-tri', lab: '3 terms', n: 'tri', cap: `Three terms: a trinomial.` },
    { e: 'tri-dec', lab: 'a ≠ 1', n: 'dec', cap: `The leading coefficient is 4, so “${T('a\\neq1')}” (that ${T('a')} means the coefficient, not the variable). <b>Watch for a perfect square:</b> ${T('4a^2=(2a)^2')}, ${T('25b^2=(5b)^2')}, ${T('-20ab=-2(2a)(5b)')}.`, w: [4, '(2a-5b)^2'] },
    { e: 'dec-chk', n: 'chk', cap: `<b>Check:</b> ${T('2a-5b')} can’t factor again. <b>Fully factored.</b>`, done: '(2a-5b)^2' }
  ] },
  e4b: { q: '6t^6+5t^3p^2-6p^4', s: [
    { n: 'top', cap: `<b>Step 1:</b> ${T('6')}, ${T('5')} and ${T('6')} share nothing. Nothing to take out.` },
    { e: 'top-tri', lab: '3 terms', n: 'tri', cap: `Three terms: a trinomial in ${T('t^3')} (degrees 6, 3, 0 in ${T('t')}). Treat ${T('t^3')} as one block, just like ${T('x^2')}.` },
    { e: 'tri-dec', lab: 'a ≠ 1', n: 'dec', cap: `${T('a=6\\neq1')}: decomposition. ${T('ac=6\\times(-6)=-36')}, sum ${T('5')}: ${T('9')} and ${T('-4')}.`, w: [4, '6t^6+9t^3p^2-4t^3p^2-6p^4'] },
    { n: 'dec', cap: `Group: ${T('3t^3(2t^3+3p^2)-2p^2(2t^3+3p^2)')}.`, w: [4, '(2t^3+3p^2)(3t^3-2p^2)'] },
    { e: 'dec-chk', n: 'chk', cap: `<b>Check:</b> ${T('2t^3+3p^2')} is a sum, and ${T('3t^3-2p^2')} isn’t a difference of squares (3 and 2 aren’t perfect squares). <b>Fully factored.</b>`, done: '(2t^3+3p^2)(3t^3-2p^2)' }
  ] }
};

const flow = {
  title: 'Trace it through the flowchart',
  height: 548,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'd1', label: T('5x^3-20x') }, { v: 'd2', label: T('3x^2+12x-36') }, { v: 'd3', label: T('x^3+2x^2-9x-18') }, { v: 'd4', label: T('4x^2+36') },
    { sep: 'Example check:' }, ...['1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b'].map((k) => ({ v: 'e' + k, label: k[0] + '(' + k[1] + ')' }))],
  intro: (k) => `Factor ${T(FL[k].q)} completely. Every expression starts at the <b>top</b> of the chart. Press <b>Next</b>.`,
  make(stage, key, ex) {
    const W = ex.W, d = FL[key];
    const svg = svgEl('svg', { class: 'u4l6-svg' }); stage.appendChild(svg);
    const arrows = {};
    for (const id in EDGES) arrows[id] = polyArrow(svg, EDGES[id].p, { dash: EDGES[id].dash, cls: id === 'loop' ? 'loop' : '' });
    const loopLab = add(stage, h('div', 'u4l6-elab loop', 'yes: back to the top'), 476, 533);
    const nodes = {};
    for (const id in NODES) {
      const n = NODES[id], el = add(stage, box(h('div', 'u4l6-node ' + n.k, '<div class="u4l6-in">' + n.html + '</div>'), n.w, n.h), n.x - n.w / 2, n.y - n.h / 2);
      if (n.n) el.appendChild(h('span', 'u4l6-nb', n.n));
      nodes[id] = el;
    }
    const labs = {};
    // the written work
    const px = FW + 8, pw = W - px - 10;
    const wp = add(stage, box(h('div', 'u4l6-wp'), pw, 524), px, 12);
    wp.innerHTML = `<div class="u4l6-wph">Factor completely</div><div class="u4l6-wpq">${T(d.q)}</div>`;
    const wl = h('div', 'u4l6-wpl'); wp.appendChild(wl);
    const fin = h('div', 'u4l6-wpf'); wp.appendChild(fin); hide(fin);
    const verdict = add(stage, h('div', 'u4l6-verdict'), 196, 533); hide(verdict);
    fit(wp.querySelector('.u4l6-wpq'), 30);
    let cur = null;
    const setOn = (id) => {
      if (cur && cur !== id) { nodes[cur].classList.remove('on'); nodes[cur].classList.add('path'); }
      nodes[id].classList.remove('path', 'old'); nodes[id].classList.add('on'); cur = id;
    };
    const toOld = () => {
      Object.values(nodes).forEach((el) => { if (el.classList.contains('on') || el.classList.contains('path')) { el.classList.remove('on', 'path'); el.classList.add('old'); } });
      Object.values(arrows).forEach((a) => { if (a.g.classList.contains('lit')) { a.g.classList.remove('lit'); a.g.classList.add('old'); } });
      Object.values(labs).forEach((l) => l.classList.add('old'));
      cur = null;
    };
    return d.s.map((st) => ({
      cap: st.cap,
      run: async (c) => {
        if (st.loop) { toOld(); verdict.style.opacity = 0; }
        const jobs = [];
        if (st.e) {
          await arrows[st.e].light(c, st.e === 'loop' ? 900 : 480);
          if (st.loop) jobs.push(c.fadeIn(loopLab, 300));
          if (st.lab && EDGES[st.e].lab) {
            const old = labs[st.e]; if (old) old.remove();
            const l = add(stage, h('div', 'u4l6-elab', st.lab), EDGES[st.e].lab[0], EDGES[st.e].lab[1]); labs[st.e] = l; jobs.push(c.pop(l, 320));
          }
        }
        setOn(st.n);
        jobs.push(pulse(c, nodes[st.n], 1.05));
        if (st.w) {
          const [k, src] = st.w;
          const row = h('div', 'u4l6-wline', `<span class="u4l6-wt ${KIND[k]}">${k}</span><span class="u4l6-wm">${T('=' + src)}</span>`);
          wl.appendChild(row); fit(row.querySelector('.u4l6-wm'), 23);
          jobs.push(c.fadeIn(row, 350, { from: 'translateX(-12px)' }));
        }
        if (st.yes) {
          verdict.className = 'u4l6-verdict no'; verdict.innerHTML = '✗ factor again';
          jobs.push(c.pop(verdict, 360), c.shake(nodes.chk));
        }
        if (st.done) {
          verdict.className = 'u4l6-verdict ok'; verdict.innerHTML = '✓ fully factored';
          fin.innerHTML = `<div class="u4l6-wpfh">Answer</div>${st.done.split('=').map((p, i) => `<div class="u4l6-wpfm">${T((i ? '=' : '') + p)}</div>`).join('')}<div class="u4l6-stampff">FULLY FACTORED</div>`;
          fin.querySelectorAll('.u4l6-wpfm').forEach((e) => fit(e, 25));
          jobs.push(c.pop(verdict, 360), c.fadeIn(fin, 400, { delay: 150 }), stampIn(c, fin.querySelector('.u4l6-stampff')));
        }
        await Promise.all(jobs);
      }
    }));
  }
};

/* =====================================================================================
 * 2. Check by expanding (factoring run backwards) and by substitution
 * ===================================================================================== */
const EXP = {
  '1a': { f: '2(2x-5)(2x+5)', q: '8x^2-50', L: [
    [`Multiply the two brackets first. The middle terms cancel, which is exactly why ${T('4x^2-25')} was a difference of squares.`, '(2x-5)(2x+5)=4x^2+10x-10x-25=4x^2-25'],
    [`Then multiply by the common factor ${T('2')}.`, '2(4x^2-25)=8x^2-50']],
  v: { x: 2 }, F: ({ x }) => 2 * (2 * x - 5) * (2 * x + 5), Q: ({ x }) => 8 * x * x - 50, fs: '2(-1)(9)', qs: '8(4)-50' },
  '1b': { f: '-3(2x-3)(2x+3)', q: '-12x^2+27', L: [
    ['Multiply the two brackets first: a difference of squares again.', '(2x-3)(2x+3)=4x^2+6x-6x-9=4x^2-9'],
    [`Then multiply by ${T('-3')}: every sign flips.`, '-3(4x^2-9)=-12x^2+27']],
  v: { x: 2 }, F: ({ x }) => -3 * (2 * x - 3) * (2 * x + 3), Q: ({ x }) => -12 * x * x + 27, fs: '-3(1)(7)', qs: '-12(4)+27' },
  '2a': { f: '(x-9)(x+7)', q: 'x^2-2x-63', L: [
    ['FOIL the two brackets.', '(x-9)(x+7)=x^2+7x-9x-63'],
    ['Collect the middle terms.', '=x^2-2x-63']],
  v: { x: 2 }, F: ({ x }) => (x - 9) * (x + 7), Q: ({ x }) => x * x - 2 * x - 63, fs: '(-7)(9)', qs: '4-4-63' },
  '2b': { f: '(7-3x)(2x+3)', q: '-6x^2+5x+21', L: [
    ['FOIL the two brackets.', '(7-3x)(2x+3)=14x+21-6x^2-9x'],
    ['Collect like terms and write them in descending order.', '=-6x^2+5x+21']],
  v: { x: 2 }, F: ({ x }) => (7 - 3 * x) * (2 * x + 3), Q: ({ x }) => -6 * x * x + 5 * x + 21, fs: '(1)(7)', qs: '-6(4)+10+21' },
  '3a': { f: '(x-y)(x+3)', q: 'x^2-xy+3x-3y', L: [
    ['FOIL the two brackets.', '(x-y)(x+3)=x^2+3x-xy-3y'],
    ['No like terms. The same four terms, in the question’s order:', '=x^2-xy+3x-3y']],
  v: { x: 2, y: 1 }, F: ({ x, y }) => (x - y) * (x + 3), Q: ({ x, y }) => x * x - x * y + 3 * x - 3 * y, fs: '(1)(5)', qs: '4-2+6-3' },
  '3b': { f: '(x-3)(x+3)(x-2)(x+2)', q: 'x^4-13x^2+36', L: [
    ['Multiply in pairs: each pair is a difference of squares.', '(x-3)(x+3)=x^2-9,\\quad(x-2)(x+2)=x^2-4'],
    ['Now multiply the two results.', '(x^2-9)(x^2-4)=x^4-4x^2-9x^2+36'],
    ['Collect the middle terms.', '=x^4-13x^2+36']],
  v: { x: 4 }, F: ({ x }) => (x - 3) * (x + 3) * (x - 2) * (x + 2), Q: ({ x }) => x ** 4 - 13 * x * x + 36, fs: '(1)(7)(2)(6)', qs: '256-208+36',
  subNote: ` Not ${T('x=2')} or ${T('x=3')}: they make a factor ${T('0')}, so both sides give ${T('0')} and the test is weak.` },
  '4a': { f: '(2a-5b)^2', q: '4a^2-20ab+25b^2', L: [
    ['A square is two copies of the bracket.', '(2a-5b)^2=(2a-5b)(2a-5b)'],
    ['FOIL: the O and I terms are the same, so the middle term is doubled.', '=4a^2-10ab-10ab+25b^2=4a^2-20ab+25b^2']],
  v: { a: 2, b: 1 }, F: ({ a, b }) => (2 * a - 5 * b) ** 2, Q: ({ a, b }) => 4 * a * a - 20 * a * b + 25 * b * b, fs: '(-1)^2', qs: '16-40+25' },
  '4b': { f: '(2t^3+3p^2)(3t^3-2p^2)', q: '6t^6+5t^3p^2-6p^4', L: [
    ['FOIL. Exponents add: t³ · t³ = t⁶.', '(2t^3+3p^2)(3t^3-2p^2)=6t^6-4t^3p^2+9t^3p^2-6p^4'],
    ['Collect the middle terms.', '=6t^6+5t^3p^2-6p^4']],
  v: { t: 2, p: 1 }, F: ({ t, p }) => (2 * t ** 3 + 3 * p * p) * (3 * t ** 3 - 2 * p * p), Q: ({ t, p }) => 6 * t ** 6 + 5 * t ** 3 * p * p - 6 * p ** 4, fs: '(19)(22)', qs: '384+40-6' }
};
EXP['4b'].L[0][0] = `FOIL. Exponents add: ${T('t^3\\cdot t^3=t^6')}.`;
const numT = (n) => String(n);
const expand = {
  title: 'Run it backwards: expand the answer',
  height: 412,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(EXP).map((k) => ({ v: k, label: 'Example ' + k[0] + '(' + k[1] + ')' })),
  intro: (k) => `Check the answer to Example ${k[0]}(${k[1]}): ${T(EXP[k].f)}. If it is right, expanding it must give back the question, ${T(EXP[k].q)}.`,
  make(stage, key, ex) {
    const W = ex.W, d = EXP[key], cxL = Math.round(W * 0.26), cxR = Math.round(W * 0.74), bw = Math.min(360, W * 0.38);
    const bL = add(stage, box(h('div', 'u4l6-xb', `<div class="u4l6-xbh">Our answer (factored)</div><div class="u4l6-xbm">${T(d.f)}</div>`), bw), cxL - bw / 2, 22);
    const bR = add(stage, box(h('div', 'u4l6-xb q', `<div class="u4l6-xbh">The question (expanded)</div><div class="u4l6-xbm">${T(d.q)}</div>`), bw), cxR - bw / 2, 22);
    [bL, bR].forEach((b) => fit(b.querySelector('.u4l6-xbm'), 28));
    const svg = svgEl('svg', { class: 'u4l6-svg' }); stage.appendChild(svg);
    const x1 = cxL + bw / 2 + 8, x2 = cxR - bw / 2 - 8;
    const aE = polyArrow(svg, [[x1, 52], [x2, 52]], { cls: 'exp', head: 13 });
    const aF = polyArrow(svg, [[x2, 84], [x1, 84]], { cls: 'fac', head: 13 });
    aF.g.classList.add('lit'); aF.g.querySelector('.u4l6-arh').style.strokeDashoffset = 0;
    add(stage, h('div', 'u4l6-xal exp', 'expand'), (x1 + x2) / 2, 36);
    add(stage, h('div', 'u4l6-xal fac', 'factor'), (x1 + x2) / 2, 100);
    const lines = d.L.map((l, i) => { const e = add(stage, h('div', 'u4l6-xl', T(l[1])), 40, 140 + i * 56); hide(e); fit(e, 27, W - 80); return e; });
    const vars = Object.keys(d.v), vt = vars.map((k) => `${k}=${d.v[k]}`).join(',\\ '), fv = d.F(d.v), qv = d.Q(d.v);
    const sub = add(stage, box(h('div', 'u4l6-xsub', `<div class="u4l6-xsh">Substitute ${T(vt)}</div><div>Answer: ${T(d.fs + '=' + numT(fv))}</div><div>Question: ${T(d.qs + '=' + numT(qv))} <b class="ok">${fv === qv ? '✓ same' : '✗'}</b></div>`), W - 60), 30, 314); hide(sub);
    const steps = [{ cap: `Factoring went from the question to the answer. To <b>check</b>, go the other way: <b>expand</b> ${T(d.f)}.`, run: (c) => Promise.all([aE.light(c, 600), pulse(c, bL, 1.04)]) }];
    d.L.forEach((l, i) => steps.push({ cap: l[0], run: (c) => c.fadeIn(lines[i], 380, { from: 'translateX(-14px)' }) }));
    steps.push({
      cap: `That is the question, ${T(d.q)}. <b>The factoring is right</b> ✓`,
      run: async (c) => { lines[lines.length - 1].classList.add('ok'); bR.classList.add('match'); await Promise.all([pulse(c, bR, 1.06), pulse(c, lines[lines.length - 1], 1.04)]); }
    });
    steps.push({
      cap: `A fast second check: substitute ${T(vt)} into both forms. Both give ${T(numT(fv))}.` + (d.subNote || ''),
      run: (c) => c.fadeIn(sub, 400)
    });
    return steps;
  }
};

/* =====================================================================================
 * Departures boards: name the route before factoring
 * ===================================================================================== */
const BOARDS = {
  'board-ex': [
    { f: '1(a)', q: '8x^2-50', r: [1, 2, 6] },
    { f: '1(b)', q: '-12x^2+27', r: [[1, 'Common factor (negative)'], 2, 6] },
    { f: '2(a)', q: 'x^2-2x-63', r: [3, 6] },
    { f: '2(b)', q: '-6x^2+5x+21', r: [[1, 'Take out ' + T('-1')], 4, 6] },
    { f: '3(a)', q: 'x^2-xy+3x-3y', r: [5, 6] },
    { f: '3(b)', q: 'x^4-13x^2+36', r: [[3, 'Inspection (in ' + T('x^2') + ')'], [6, 'Factor again!'], 2, 6] },
    { f: '4(a)', q: '4a^2-20ab+25b^2', r: [[4, 'Perfect square'], 6] },
    { f: '4(b)', q: '6t^6+5t^3p^2-6p^4', r: [[4, 'Decomposition (in ' + T('t^3') + ')'], 6] }
  ],
  'board-mix': [
    { f: 'FX 201', q: '7x^2-28', r: [1, 2, 6], a: '7(x-2)(x+2)' },
    { f: 'FX 202', q: 'x^2+11x+24', r: [3, 6], a: '(x+3)(x+8)' },
    { f: 'FX 203', q: '2x^2+7x+3', r: [4, 6], a: '(2x+1)(x+3)' },
    { f: 'FX 204', q: 'xy+5x+2y+10', r: [5, 6], a: '(y+5)(x+2)' },
    { f: 'FX 205', q: '9x^2-12x+4', r: [[4, 'Perfect square'], 6], a: '(3x-2)^2' },
    { f: 'FX 206', q: '-x^2+x+20', r: [[1, 'Take out ' + T('-1')], 3, 6], a: '-(x-5)(x+4)' },
    { f: 'FX 207', q: 'x^4-1', r: [2, [6, 'Factor again!'], 2, 6], a: '(x-1)(x+1)(x^2+1)' },
    { f: 'FX 208', q: '3x^3-3x^2-18x', r: [1, 3, 6], a: '3x(x-3)(x+2)' },
    { f: 'FX 209', q: '25x^2+16', r: [[2, 'Sum of squares: stop'], 6], a: '\\text{does not factor}' },
    { f: 'FX 210', q: '2x^3-x^2-8x+4', r: [5, [6, 'Factor again!'], 2, 6], a: '(2x-1)(x-2)(x+2)' }
  ]
};
function mountBoards() {
  document.querySelectorAll('.u4l6-board').forEach((host) => {
    const rows = BOARDS[host.id]; if (!rows) return;
    const ans = host.dataset.answers === '1';
    host.classList.toggle('with-ans', ans);
    host.innerHTML = `<div class="u4l6-bdh no-ink"><span class="u4l6-bdt">✈ Departures</span><span class="u4l6-bdtools"><button class="pill small" type="button" data-all>Reveal all</button><button class="pill small" type="button" data-none>Hide all</button></span></div>
      <div class="u4l6-brow u4l6-bhead"><span>${ans ? 'Flight' : 'Example'}</span><span>Traveller</span><span>Route (checklist steps)</span>${ans ? '<span>Boarding pass</span>' : ''}</div>`;
    rows.forEach((r) => {
      const pills = r.r.map((s, i) => { const [k, lab] = Array.isArray(s) ? s : [s, ans && s === 2 ? 'Diff. of squares' : STEP[s]]; return (i ? '<i class="u4l6-to">→</i>' : '') + `<span class="u4l6-rp ${KIND[k]}"><b>${k}</b>${lab}</span>`; }).join('');
      const row = h('button', 'u4l6-brow', `<span class="u4l6-bf">${r.f}</span><span class="u4l6-bq">${T(r.q)}</span><span class="u4l6-br"><span class="u4l6-bwait">· · · tap to reveal · · ·</span><span class="u4l6-bshow">${pills}</span></span>${ans ? `<span class="u4l6-ba"><span class="u4l6-bshow">${T(r.a)}</span></span>` : ''}`);
      row.type = 'button';
      row.addEventListener('click', () => { row.classList.toggle('shown'); if (row.classList.contains('shown')) row.querySelectorAll('.u4l6-bshow').forEach((e) => e.animate([{ opacity: 0, transform: 'rotateX(80deg)' }, { opacity: 1, transform: 'none' }], 380)); });
      host.appendChild(row);
    });
    const all = [...host.querySelectorAll('.u4l6-brow:not(.u4l6-bhead)')];
    host.querySelector('[data-all]').onclick = () => all.forEach((r, i) => setTimeout(() => { if (!r.classList.contains('shown')) r.click(); }, i * 140));
    host.querySelector('[data-none]').onclick = () => all.forEach((r) => r.classList.remove('shown'));
  });
}

/* ---------- the "can it board?" tickets ---------- */
function mountTickets() {
  document.querySelectorAll('.u4l6-tk').forEach((b) => {
    const ok = b.dataset.ok === '1';
    b.querySelector('.u4l6-tv').innerHTML = ok ? 'BOARD ✓' : 'BACK TO SECURITY';
    b.classList.add(ok ? 'is-ok' : 'is-no');
    b.addEventListener('click', () => {
      b.classList.toggle('shown');
      if (b.classList.contains('shown')) b.querySelector('.u4l6-tv').animate([{ opacity: 0, transform: 'scale(1.8) rotate(-8deg)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,1.4,.4,1)' });
    });
  });
}

/* ---------- warm-up questions and poll ---------- */
let airportEx = null;
function mountWarmup() {
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => {
    const on = b.closest('.poll').classList.toggle('revealed');
    if (on && airportEx && airportEx.value !== 'D') airportEx.choose('D');
  }));
}

/* ================= wiring ================= */
function mountExplainers() {
  const defs = { airport, flow, expand };
  document.querySelectorAll('[data-explainer]').forEach((el) => { const e = new Explainer(el, defs[el.dataset.explainer]); if (el.dataset.explainer === 'airport') airportEx = e; });
}
mountExplainers(); mountBoards(); mountTickets(); mountWarmup();

/* exposed for automated checks (no effect on the lesson) */
export const _test = { AP, FL, EXP, BOARDS };
