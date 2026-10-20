/* Math 10C · Unit 5 · Lesson 9 — Interpreting and Sketching Real-World Graphs:
 * static figures (bathtub warm-up, parking garage, shape vocabulary, Example 2/3 axes) and the explainers.
 * Every "story" explainer plays a scene (bathtub, garage, car, kangaroo, kiln, cyclist, phone) in step with a
 * tracer running along its graph. Colours: increasing green, decreasing red, constant slate. */
import { h, tex, fmt, add, box, Graph, svgEl, mountExplainers, pop, fadeIn, appear, sleep, tween, linear, stamp, stampIn, pulse, anim, COLORS } from '../blocks.js';

const T = (s) => tex(s);
const lerp = (a, b, t) => a + (b - a) * t;
const INK = '#1e2d46', WATER = '#8cc3f0', TRACE = '#2f6fd0', SKETCH = '#c93a33';
const KC = { inc: COLORS.green, dec: COLORS.red, con: '#5d6574' };
const KW = { inc: 'increasing', dec: 'decreasing', con: 'constant' };
const kindOf = (a, b) => (b[1] > a[1] + 1e-9 ? 'inc' : b[1] < a[1] - 1e-9 ? 'dec' : 'con');
const segBadge = (n, cls = '') => `<span class="u5l9-seg ${cls}">${n}</span>`;

/* ---------- polyline helpers (x is always increasing: these are quantities against time) ---------- */
function yAt(pts, x) {
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (x <= b[0] + 1e-9) return b[0] === a[0] ? b[1] : a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
  }
  return pts[pts.length - 1][1];
}
function upTo(pts, x) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (pts[i][0] <= x + 1e-9) out.push(pts[i]); else { out.push([x, yAt(pts, x)]); break; } }
  return out;
}
const sample = (f, a, b, n = 80) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (b - a) * i / n; return [x, f(x)]; });

/* ---------- a real-world graph: no auto numbers, custom tick labels and axis titles ---------- */
function storyGraph(host, o) {
  const G = new Graph(host, Object.assign({ numbers: false, xtitle: '', ytitle: '', pad: [18, 26, o.xticks ? 62 : 40, o.yticks ? 84 : 44] }, o));
  const ax = G.axesHtml, w = G.win;
  (o.xticks || []).forEach(([v, s]) => {
    const [px, py] = G.toPx(v, w.ymin); svgEl('line', { class: 'bk-tick', x1: px, x2: px, y1: py - 4, y2: py + 4 }, G.layers.axes);
    if (s) G.hlabel(px, py, s, { pos: 's', gap: 6, cls: 'u5l9-tk', parent: ax });
  });
  (o.yticks || []).forEach(([v, s]) => {
    const [px, py] = G.toPx(w.xmin, v); svgEl('line', { class: 'bk-tick', x1: px - 4, x2: px + 4, y1: py, y2: py }, G.layers.axes);
    G.hlabel(px, py, s, { pos: 'w', gap: 8, cls: 'u5l9-tk', parent: ax });
  });
  const [x0, y1] = G.toPx(w.xmin, w.ymin), [x1, y0] = G.toPx(w.xmax, w.ymax);
  if (o.xt) G.hlabel((x0 + x1) / 2, G.H - 3, o.xt, { pos: 'n', gap: 0, cls: 'u5l9-axt', parent: ax });
  if (o.yt) G.hlabel(o.ytx ?? 15, (y0 + y1) / 2, o.yt, { pos: 'c', cls: 'u5l9-axt u5l9-rot', parent: ax });
  return G;
}
/** a growing stroke along pts (set(x) shows the part up to time x), and a dot at its tip */
function tracer(G, pts, o = {}) {
  const st = { x: pts[0][0] };
  const el = G.curve(() => ({ subs: [upTo(pts, st.x).map((p) => G.toPx(p[0], p[1]))] }), { color: o.color || TRACE, width: o.width || 5 }, 'u5l9-trace', G.layers.data);
  const dot = o.dot === false ? null : G.point(pts[0][0], pts[0][1], { color: o.dotColor || INK, r: 7.5 });
  el.set = (x) => { st.x = x; el._bkDraw(); if (dot) G.moveTo(dot, x, yAt(pts, x)); };
  el.dot = dot; el.set(st.x);
  return el;
}
/** tween the tracer from x0 to x1, calling onFrame(x, y) */
const run = (c, tr, pts, x0, x1, ms, onFrame) => tween(c, ms, (t) => { const x = lerp(x0, x1, t); tr.set(x); if (onFrame) onFrame(x, yAt(pts, x)); }, linear);
const msFor = (dx, span, lo = 900, hi = 2200) => Math.round(lo + (hi - lo) * Math.min(1, dx / span));

/* =============================== the bathtub =============================== */
let uidN = 0;
const TUB = 'M24 152L376 152C376 220 348 248 296 248L104 248C52 248 24 220 24 152Z';
const lvl = (d) => 248 - d * 2.875; // depth (cm) → svg y; 32 cm reaches just under the rim
function makeTub(host, o = {}) {
  const id = 'u5l9tub' + (++uidN), W = o.w || 400;
  const el = h('div', 'u5l9-tub'); box(el, W, W * 0.7);
  if (o.x != null) { el.style.position = 'absolute'; el.style.left = o.x + 'px'; el.style.top = o.y + 'px'; }
  let tiles = '';
  for (let x = 40; x <= 400; x += 40) tiles += `<line x1="${x}" y1="0" x2="${x}" y2="188"/>`;
  for (const y of [28, 68, 108, 148]) tiles += `<line x1="0" y1="${y}" x2="400" y2="${y}"/>`;
  el.innerHTML = `<svg viewBox="0 0 400 280" width="100%" height="100%" aria-label="A bathtub with a tap, a rubber duck and a plug on a chain">
  <defs><clipPath id="${id}"><path d="${TUB}"/></clipPath></defs>
  <rect x="0" y="0" width="400" height="268" fill="#e8f0fc"/>
  <g stroke="#fff" stroke-width="2.5">${tiles}</g>
  <rect x="0" y="266" width="400" height="14" fill="#d5d9e2"/>
  <g fill="#aab2be" stroke="${INK}" stroke-width="2">
    <rect x="26" y="86" width="50" height="18" rx="4"/><rect x="66" y="86" width="10" height="26" rx="3"/>
    <rect x="38" y="70" width="10" height="16"/><rect x="30" y="62" width="26" height="8" rx="3"/>
    <polygon points="68,266 84,266 92,244 64,244"/><polygon points="316,266 332,266 336,244 308,244"/>
  </g>
  <path d="${TUB}" fill="#fff" stroke="${INK}" stroke-width="3.2"/>
  <g class="u5l9-dog" opacity="0">
    <ellipse cx="128" cy="182" rx="20" ry="26" fill="#b07d4f" stroke="${INK}" stroke-width="2"/>
    <path d="M114 128L106 150L120 146Z M142 128L150 150L136 146Z" fill="#7a5233" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="128" cy="144" r="15" fill="#b07d4f" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="128" cy="152" rx="8" ry="6" fill="#e2c29b"/><circle cx="128" cy="149" r="2.6" fill="${INK}"/>
    <circle cx="122" cy="140" r="1.9" fill="${INK}"/><circle cx="134" cy="140" r="1.9" fill="${INK}"/>
  </g>
  <g class="u5l9-sam" opacity="0">
    <rect x="240" y="158" width="46" height="82" rx="18" fill="#e79a8f" stroke="${INK}" stroke-width="2"/>
    <path d="M282 170Q300 156 314 152" stroke="#fbe6b8" stroke-width="9" stroke-linecap="round" fill="none"/>
    <circle cx="263" cy="140" r="17" fill="#fbe6b8" stroke="${INK}" stroke-width="2"/>
    <path d="M246 136Q248 118 263 120Q278 118 280 136Q271 127 263 128Q255 127 246 136Z" fill="#6e5046"/>
    <circle cx="257" cy="141" r="1.9" fill="${INK}"/><circle cx="269" cy="141" r="1.9" fill="${INK}"/>
    <path d="M257 148Q263 153 269 148" stroke="${INK}" stroke-width="1.8" fill="none"/>
  </g>
  <g clip-path="url(#${id})">
    <rect class="u5l9-water" x="0" y="248" width="400" height="40" fill="${WATER}" fill-opacity=".8"/>
    <line class="u5l9-surf" x1="0" x2="400" y1="248" y2="248" stroke="#fff" stroke-width="2.5" stroke-opacity=".8"/>
    <g class="u5l9-swirl" style="display:none"><path d="M330 0m-14 0a14 6 0 1 0 28 0a9 4 0 1 0 -18 0a4 2 0 1 0 8 0" fill="none" stroke="#fff" stroke-width="2.4"/></g>
  </g>
  <line x1="14" y1="152" x2="386" y2="152" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
  <g class="u5l9-duck"><g transform="translate(186 0)">
    <path d="M-22 0C-24 -20 12 -22 18 -8C24 0 16 6 0 5Q-12 5 -22 0Z" fill="#facd28" stroke="${INK}" stroke-width="2"/>
    <circle cx="6" cy="-26" r="12" fill="#facd28" stroke="${INK}" stroke-width="2"/>
    <polygon points="17,-27 29,-24 17,-21" fill="#c88c14" stroke="${INK}" stroke-width="1.5"/>
    <circle cx="9" cy="-29" r="2" fill="${INK}"/></g></g>
  <g class="u5l9-plugin"><path d="M348 154C360 196 348 228 332 242" stroke="#7d8593" stroke-width="2.4" stroke-dasharray="4 3" fill="none"/>
    <rect x="322" y="240" width="20" height="8" rx="2" fill="#3a4254"/></g>
  <g class="u5l9-plugout" style="display:none"><path d="M348 154C362 150 372 160 376 182" stroke="#7d8593" stroke-width="2.4" stroke-dasharray="4 3" fill="none"/>
    <rect x="368" y="182" width="20" height="8" rx="2" fill="#3a4254" transform="rotate(70 378 186)"/></g>
  <line class="u5l9-stream" x1="71" y1="112" x2="71" y2="248" stroke="${WATER}" stroke-width="7" stroke-dasharray="12 6" style="display:none"/>
</svg>`;
  host.appendChild(el);
  const q = (s) => el.querySelector(s);
  const water = q('.u5l9-water'), surf = q('.u5l9-surf'), duck = q('.u5l9-duck'), stream = q('.u5l9-stream'), swirl = q('.u5l9-swirl');
  const api = {
    el,
    setDepth(d) {
      const y = lvl(d); water.setAttribute('y', y); water.setAttribute('height', Math.max(0, 262 - y)); surf.setAttribute('y1', y); surf.setAttribute('y2', y);
      duck.setAttribute('transform', `translate(0 ${Math.min(y, 244) - 1})`); stream.setAttribute('y2', y);
      swirl.setAttribute('transform', `translate(0 ${y + 10})`);
      surf.style.display = d > 0.3 ? '' : 'none';
    },
    tap(on) { stream.style.display = on ? '' : 'none'; },
    drain(on) { swirl.style.display = on ? '' : 'none'; },
    plug(out) { q('.u5l9-plugin').style.display = out ? 'none' : ''; q('.u5l9-plugout').style.display = out ? '' : 'none'; },
    who(c, sel, on) { const g = q(sel); return anim(c, g, on ? [{ opacity: 0, transform: 'translateY(-110px)' }, { opacity: 1, transform: 'translateY(0)' }] : [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-110px)' }], 650); }
  };
  api.setDepth(o.depth || 0);
  return api;
}

/* =============================== static figures =============================== */
const BATH = [[0, 0], [8, 20], [11, 20], [11.5, 28], [25, 28], [25.5, 20], [30, 0]];
const BATH_BADGES = [[2.6, 11.5], [9.5, 23.3], [13.0, 24], [18.2, 31.2], [23.6, 24], [29.4, 11.5]];
const bathAxes = (o) => Object.assign({ xmin: 0, xmax: 32, ymin: 0, ymax: 34, xstep: 5, ystep: 5,
  xticks: [0, 5, 10, 15, 20, 25, 30].map((v) => [v, String(v)]), yticks: [5, 10, 15, 20, 25, 30].map((v) => [v, String(v)]),
  xt: 'time (minutes)', yt: 'water depth (cm)' }, o);
const GAR = [[0, 0], [2, 160], [4, 160], [5, 180], [6, 120], [10, 120], [11, 0]];
const GAR_N = ['P', 'Q', 'R', 'S', 'T', 'U', 'V'], GAR_POS = ['nw', 'n', 'nw', 'ne', 'se', 'n', 'ne'];
const clockOf = (x) => { const m = Math.round((7 + x) * 60); return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };
const garAxes = (o) => Object.assign({ xmin: 0, xmax: 11.6, ymin: 0, ymax: 212, xstep: 1, ystep: 40,
  xticks: Array.from({ length: 12 }, (_, i) => [i, o.width < 720 && i % 2 ? '' : (7 + i) + ':00']), yticks: [40, 80, 120, 160, 200].map((v) => [v, String(v)]),
  xt: 'time of day', yt: 'cars in garage' }, o);

function mountStatic() {
  const wt = document.getElementById('wu-tub');
  if (wt) makeTub(wt, { w: 380, depth: 23 });
  const wg = document.getElementById('wu-graph');
  if (wg) {
    const G = storyGraph(wg, bathAxes({ width: 560, height: 360 }));
    G.polyline(BATH, { color: '#4f95d6', width: 6 });
    BATH.forEach((p) => G.point(p[0], p[1], { color: INK, r: 5.5 }));
    BATH_BADGES.forEach((p, i) => G.label(p[0], p[1], segBadge(i + 1)));
  }
  const e1 = document.getElementById('ex1-graph');
  if (e1) {
    const G = storyGraph(e1, garAxes({ width: 860, height: 400 }));
    G.polyline(GAR, { color: INK, width: 4 });
    GAR.forEach((p, i) => G.point(p[0], p[1], { color: INK, r: 5, label: T(GAR_N[i]), pos: GAR_POS[i] }));
  }
  const a2 = document.getElementById('ex2a-g'), b2 = document.getElementById('ex2b-g');
  if (a2) storyGraph(a2, { width: 430, height: 230, xmin: 0, xmax: 9.8, ymin: 0, ymax: 3.2, grid: false, xt: 'time', yt: 'speed', pad: [16, 20, 34, 44] }).polyline(EX2A, { color: INK, width: 4 });
  if (b2) storyGraph(b2, { width: 430, height: 230, xmin: 0, xmax: 6.4, ymin: 0, ymax: 2.2, grid: false, xt: 'time', yt: 'height', pad: [16, 20, 34, 44] }).polyline(EX2B, { color: INK, width: 4 });
  const ax = (id, xt, yt, w, hh) => { const el = document.getElementById(id); return el ? storyGraph(el, { width: w, height: hh, xmin: 0, xmax: 10.5, ymin: 0, ymax: 10.5, grid: false, xt, yt, pad: [16, 20, 36, 46] }) : null; };
  ax('ex3a-ax', 'time (hours)', 'kiln temp. (°C)', 440, 280); ax('ex3b-ax', 'distance (km)', 'speed (km/h)', 440, 280);
  const sa = ax('ex3a-ans', 'time (hours)', 'kiln temp. (°C)', 330, 210), sb = ax('ex3b-ans', 'distance (km)', 'speed (km/h)', 330, 210);
  if (sa) sa.polyline(SK.a.pieces.flatMap((p, i) => (i ? p.pts.slice(1) : p.pts)), { color: SKETCH, width: 4 });
  if (sb) sb.polyline(SK.b.pieces.flatMap((p, i) => (i ? p.pts.slice(1) : p.pts)), { color: SKETCH, width: 4 });
  const row = document.getElementById('shape-row');
  if (row) Object.keys(SH).forEach((k) => {
    const d = SH[k], cell = h('div', 'u5l9-shape'); row.appendChild(cell);
    const G = new Graph(cell, { width: 172, height: 150, xmin: 0, xmax: 4.4, ymin: 0, ymax: 4.4, grid: false, numbers: false, xtitle: '', ytitle: '', pad: [10, 12, 10, 12] });
    G.fn(d.f, { from: 0.2, to: 4.1, color: INK, width: 4, arrows: false, samples: 120 });
    cell.appendChild(h('div', 'u5l9-shname', `<span data-reveal>${d.short}</span>`));
  });
  const vc = document.getElementById('vlt-circle');
  if (vc) {
    const G = new Graph(vc, { width: 230, height: 230, xmin: -1.8, xmax: 1.8, ymin: -1.8, ymax: 1.8, grid: false, numbers: false, pad: 14 });
    G.fn((x) => Math.sqrt(1 - x * x), { from: -1, to: 1, arrows: false, color: INK }); G.fn((x) => -Math.sqrt(1 - x * x), { from: -1, to: 1, arrows: false, color: INK });
    G.vline(0, { color: COLORS.red, width: 2.5 }); G.point(0, 1, { color: COLORS.red }); G.point(0, -1, { color: COLORS.red });
  }
}

/* =============================== explainer: the bath, told by its graph =============================== */
const BATHS = {
  bath: {
    pts: BATH, badges: BATH_BADGES,
    caps: [
      `<b>Segment 1:</b> the tap is on. The depth <b>increases</b> from 0 to 20 cm in 8 min: ${T('\\tfrac{20}{8}=2.5')} cm/min.`,
      `<b>Segment 2:</b> the tap is off. The depth stays at 20 cm: <b>constant</b>, a rate of 0.`,
      `<b>Segment 3:</b> Sam gets in! His body pushes the water up from 20 to 28 cm in half a minute: <b>increasing</b>, very steep.`,
      `<b>Segment 4:</b> Sam soaks for 13.5 minutes. The depth is <b>constant</b> at 28 cm.`,
      `<b>Segment 5:</b> Sam gets out. The depth drops straight back to 20 cm: <b>decreasing</b>, very steep.`,
      `<b>Segment 6:</b> the plug is pulled. The depth <b>decreases</b> from 20 cm to 0 in 4.5 min, about ${T('-4.4')} cm/min: faster than filling.`
    ],
    acts: ['tap', 'tapoff', 'samin', null, 'samout', 'plug'],
    end: `The whole story: <b>increasing</b> 1 and 3, <b>constant</b> 2 and 4, <b>decreasing</b> 5 and 6. The steepest pieces, 3 and 5, are the fastest changes.`
  },
  dog: {
    pts: [[0, 0], [8, 20], [11, 20], [11.5, 28], [16, 28], [16.3, 31], [20, 31], [20.3, 28], [25, 28], [25.5, 20], [30, 0]],
    badges: [[2.6, 11.5], [9.5, 23.3], [12.7, 22.6], [13.8, 30.6], [15.0, 33.4], [18.2, 33.6], [21.5, 33.4], [22.7, 30.6], [24.0, 22.5], [29.4, 11.5]],
    caps: [
      `<b>Segment 1:</b> the tap fills the tub: <b>increasing</b>, 2.5 cm/min.`,
      `<b>Segment 2:</b> tap off: <b>constant</b> at 20 cm.`,
      `<b>Segment 3:</b> Sam gets in: a steep <b>increase</b> to 28 cm.`,
      `<b>Segment 4:</b> Sam soaks: <b>constant</b>.`,
      `<b>Segment 5:</b> the dog jumps in! A steep <b>increase</b>, but a smaller jump (28 to 31 cm): the dog is smaller than Sam.`,
      `<b>Segment 6:</b> Sam and the dog soak together: <b>constant</b> at 31 cm.`,
      `<b>Segment 7:</b> the dog leaps out: a sudden <b>decrease</b> back to 28 cm.`,
      `<b>Segment 8:</b> Sam soaks alone again: <b>constant</b>.`,
      `<b>Segment 9:</b> Sam gets out: a steep <b>decrease</b> to 20 cm.`,
      `<b>Segment 10:</b> plug pulled: <b>decreasing</b> to 0.`
    ],
    acts: ['tap', 'tapoff', 'samin', null, 'dogin', null, 'dogout', null, 'samout', 'plug'],
    end: `The dog adds three pieces in the middle: a jump <b>up</b>, a <b>flat</b> piece, and a drop <b>down</b> by the same amount.`
  }
};
const bath = {
  title: 'The bath, told by its graph',
  height: 490,
  choices: [{ v: 'bath', label: 'Sam’s bath' }, { v: 'dog', label: 'Dog jumps in' }],
  intro: (k) => (k === 'bath' ? 'Watch the tub and the graph together, one segment at a time. Press <b>Next</b>.' : 'The warm-up challenge: Sam’s dog jumps in mid-soak, then leaps out. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const S = BATHS[k], pts = S.pts, LW = 392;
    const clock = add(stage, box(h('div', 'u5l9-clock'), LW - 8, null), 4, 4);
    const tub = makeTub(stage, { x: 0, y: 48, w: LW - 6 });
    const tally = add(stage, box(h('div', 'u5l9-tally'), LW - 8, null), 4, 334);
    const rows = {};
    ['inc', 'con', 'dec'].forEach((kk) => { const r = h('div', 'u5l9-trow ' + kk, `<span class="u5l9-tk-k">${KW[kk]}</span><span class="u5l9-tk-b"></span>`); tally.appendChild(r); rows[kk] = r.lastChild; });
    const G = storyGraph(stage, bathAxes({ x: LW, y: 4, width: ex.W - LW - 4, height: 480, ymax: k === 'dog' ? 36 : 34, yticks: (k === 'dog' ? [5, 10, 15, 20, 25, 30, 35] : [5, 10, 15, 20, 25, 30]).map((v) => [v, String(v)]) }));
    const tr = tracer(G, pts);
    const show = (x, d) => { clock.innerHTML = `time <b>${x.toFixed(1)}</b> min &nbsp;·&nbsp; depth <b>${Math.round(d * 10) / 10}</b> cm`; tub.setDepth(d); };
    show(0, 0);
    const steps = S.caps.map((cap, i) => ({
      cap,
      run: async (c) => {
        const a = pts[i], b = pts[i + 1], kk = kindOf(a, b), act = S.acts[i];
        tub.tap(act === 'tap'); tub.drain(act === 'plug'); if (act === 'plug') tub.plug(true);
        const jobs = [run(c, tr, pts, a[0], b[0], msFor(b[0] - a[0], 13), show)];
        if (act === 'samin' || act === 'samout') jobs.push(tub.who(c, '.u5l9-sam', act === 'samin'));
        if (act === 'dogin' || act === 'dogout') jobs.push(tub.who(c, '.u5l9-dog', act === 'dogin'));
        await Promise.all(jobs);
        const seg = G.segment(a, b, { color: KC[kk], width: 6 });
        const bd = G.label(S.badges[i][0], S.badges[i][1], segBadge(i + 1, kk));
        const tb = h('span', '', segBadge(i + 1, kk)); rows[kk].appendChild(tb);
        await Promise.all([appear(c, seg, 300), pop(c, bd), pop(c, tb)]);
      }
    }));
    steps.push({ cap: S.end, run: async (c) => { tub.drain(false); tr.dot && (tr.dot.style.opacity = 0); await Promise.all(Object.values(rows).map((r) => pulse(c, r.parentNode, 1.04))); } });
    return steps;
  }
};

/* =============================== explainer: sorting the pieces =============================== */
const PC = {
  garage: { pts: GAR, axes: garAxes, names: GAR_N, pos: GAR_POS, span: (a, b) => `${clockOf(a)}–${clockOf(b)}`, hrs: (d) => `${d} h`,
    total: (sum, parts) => `Increasing for ${parts.join(' + ')} = <b>${sum} hours</b> in total. That’s Example 1(d).` },
  hike: { pts: [[0, 0], [2.5, 600], [3, 600], [4, 1200], [5, 1200], [7, 0]],
    axes: (o) => Object.assign({ xmin: 0, xmax: 7.6, ymin: 0, ymax: 1400, xstep: 1, ystep: 200, xticks: Array.from({ length: 8 }, (_, i) => [i, String(i)]),
      yticks: [200, 400, 600, 800, 1000, 1200].map((v) => [v, fmt(v)]), xt: 'time (hours)', yt: 'height climbed (m)' }, o),
    span: (a, b) => `${a} h to ${b} h`, hrs: (d) => `${d} h`,
    total: (sum, parts) => `Climbing (increasing) for ${parts.join(' + ')} = <b>${sum} hours</b>. The summit lunch is the flat piece at the top.` }
};
const pieces = {
  title: 'Rising, falling or flat?',
  height: 470,
  choices: [{ v: 'garage', label: 'Example 1 check: parking garage' }, { v: 'hike', label: 'A day hike' }],
  intro: (k) => (k === 'garage' ? 'Sort the six pieces of the parking-garage graph. Press <b>Next</b>.' : 'A hiker’s height above the trailhead through the day. Sort the pieces. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = PC[k], pts = d.pts, PW = 300;
    const G = storyGraph(stage, d.axes({ x: 4, y: 4, width: ex.W - PW - 16, height: 460 }));
    const P = add(stage, box(h('div', 'u5l9-panel', '<div class="u5l9-ph">The pieces</div>'), PW, 458), ex.W - PW - 6, 6);
    const rows = {};
    ['inc', 'dec', 'con'].forEach((kk) => { const r = h('div', 'u5l9-prow ' + kk, `<b>${KW[kk]}</b><div class="u5l9-pl"></div>`); r.style.opacity = 0; P.appendChild(r); rows[kk] = r; });
    const segs = pts.slice(1).map((b, i) => ({ a: pts[i], b, k: kindOf(pts[i], b) }));
    let base;
    const sweep = (kk) => async (c) => {
      const mine = segs.filter((s) => s.k === kk);
      await fadeIn(c, rows[kk]);
      for (const s of mine) {
        const el = G.segment(s.a, s.b, { color: KC[kk], width: 7 });
        const line = h('div', 'u5l9-pli', (k === 'garage' ? T(`${GAR_N[pts.indexOf(s.a)]}\\to ${GAR_N[pts.indexOf(s.b)]}`) + ' ' : '') + `<span class="muted">${d.span(s.a[0], s.b[0])}</span>`);
        rows[kk].lastChild.appendChild(line);
        await Promise.all([G.drawIn(el, 600, c), fadeIn(c, line)]);
      }
    };
    const inc = segs.filter((s) => s.k === 'inc'), durs = inc.map((s) => s.b[0] - s.a[0]), sum = durs.reduce((p, q) => p + q, 0);
    return [
      { cap: 'Here is the graph. Read it <b>left to right</b>, the way time moves.',
        run: async (c) => { base = G.polyline(pts, { color: INK, width: 3.5 }); await G.drawIn(base, 1200, c); if (d.names) await Promise.all(pts.map((p, i) => G.reveal(G.point(p[0], p[1], { color: INK, r: 5, label: T(d.names[i]), pos: d.pos[i] }), c))); } },
      { cap: `Pieces that <b>rise</b> left to right: the quantity is <b>increasing</b>.`, run: sweep('inc') },
      { cap: `Pieces that <b>fall</b>: <b>decreasing</b>.`, run: sweep('dec') },
      { cap: `<b>Flat</b> pieces: <b>constant</b>. Nothing changes there.`, run: sweep('con') },
      { cap: d.total(sum, durs.map(d.hrs)),
        run: async (c) => {
          for (const s of inc) {
            const sh = G.shadeX(s.a[0], s.b[0], { color: 'green', band: true });
            const lab = G.label((s.a[0] + s.b[0]) / 2, G.win.ymax * 0.06, d.hrs(s.b[0] - s.a[0]), { pos: 'n', cls: 'u5l9-dur' });
            await Promise.all([G.drawIn(sh, 600, c), fadeIn(c, lab)]);
          }
          const tot = h('div', 'u5l9-ptot', `increasing: <b>${durs.map(d.hrs).join(' + ')} = ${d.hrs(sum)}</b>`); P.appendChild(tot); await pop(c, tot);
        } }
    ];
  }
};

/* =============================== explainer: rate of change =============================== */
const RT = {
  bath: { graph: 'bath', unit: 'cm/min', segs: [[0, 1], [5, 6]], names: ['segment 1 (fill)', 'segment 6 (drain)'],
    fr: (a, b) => `\\frac{${b[1]}-${a[1]}}{${b[0]}-${a[0]}}=\\frac{${b[1] - a[1]}}{${b[0] - a[0]}}`,
    caps: [`<b>Segment 1:</b> rise ${T('+20')} cm over a run of 8 min. Rate ${T('=\\frac{20}{8}=2.5')} cm/min.`,
      `<b>Segment 6:</b> the depth falls 20 cm in only 4.5 min. Rate ${T('=\\frac{-20}{4.5}\\approx-4.4')} cm/min.`],
    end: `Compare the <b>sizes</b>: 4.4 is bigger than 2.5, so draining is faster. Segment 6 is <b>steeper</b>: same 20 cm, about half the time.` },
  st: { graph: 'garage', unit: 'cars/h', segs: [[3, 4]], names: ['S to T'],
    caps: [`<b>S to T:</b> from 180 cars at 12:00 to 120 cars at 13:00. Rise ${T('-60')}, run 1 h.`],
    end: `Rate ${T('=\\frac{120-180}{13-12}=-60')} cars/h. The negative sign means <b>decreasing</b>: the lunch crowd leaves, 60 cars in one hour.` },
  all: { graph: 'garage', unit: 'cars/h', segs: [[0, 1], [2, 3], [3, 4], [5, 6]], names: ['P to Q', 'R to S', 'S to T', 'U to V'],
    caps: [`<b>P to Q:</b> up 160 cars in 2 h: ${T('\\frac{160}{2}=80')} cars/h.`, `<b>R to S:</b> up 20 cars in 1 h: 20 cars/h. Gentle, so not very steep.`,
      `<b>S to T:</b> down 60 cars in 1 h: ${T('-60')} cars/h.`, `<b>U to V:</b> down 120 cars in 1 h: ${T('-120')} cars/h.`],
    end: `Compare the sizes: 80, 20, 60, <b>120</b>. <b>U to V</b> is the steepest, the fastest change: the evening exodus, almost everyone leaving in the hour before closing.` }
};
const rate = {
  title: 'Steeper means faster',
  height: 470,
  choices: [{ v: 'bath', label: 'Warm-up: fill or drain?' }, { v: 'st', label: 'Example 1(b) check' }, { v: 'all', label: 'Example 1(c) check' }],
  intro: (k) => (k === 'bath' ? 'Which is faster: filling (segment 1) or draining (segment 6)? Press <b>Next</b>.' : k === 'st' ? 'The rate of change from S to T, in cars per hour. Press <b>Next</b>.' : 'Which segment shows the fastest rate of change? Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = RT[k], garage = d.graph === 'garage', pts = garage ? GAR : BATH, PW = 330;
    const G = storyGraph(stage, (garage ? garAxes : bathAxes)({ x: 4, y: 4, width: ex.W - PW - 14, height: 460 }));
    G.polyline(pts, { color: '#9aa3b2', width: 3.5 });
    if (garage) pts.forEach((p, i) => G.point(p[0], p[1], { color: INK, r: 5, label: T(GAR_N[i]), pos: GAR_POS[i] }));
    else BATH_BADGES.forEach((p, i) => G.label(p[0], p[1], segBadge(i + 1, 'sm')));
    const P = add(stage, box(h('div', 'u5l9-panel', `<div class="u5l9-ph">rate of change (${d.unit})</div>`), PW, 458), ex.W - PW - 6, 6);
    const rates = d.segs.map(([i, j]) => { const a = pts[i], b = pts[j]; return { a, b, r: (b[1] - a[1]) / (b[0] - a[0]) }; });
    const tl = (x) => (garage ? `${7 + x}` : `${x}`);
    let prev = null;
    const steps = rates.map((s, n) => ({
      cap: d.caps[n],
      run: async (c) => {
        const { a, b } = s, kk = kindOf(a, b), up = kk === 'inc';
        if (prev) { G.remove(prev); prev = null; }
        const hi = G.segment(a, b, { color: KC[kk], width: 7 });
        await G.drawIn(hi, 500, c);
        // rise and run: rising pieces run first then rise (corner bottom right); falling pieces drop first then run (corner bottom left)
        const corner = up ? [b[0], a[1]] : [a[0], b[1]], dy = b[1] - a[1];
        const runEl = up ? G.segment(a, corner, { color: 'amber', width: 3.5, dash: true }) : G.segment(corner, b, { color: 'amber', width: 3.5, dash: true });
        const riseEl = up ? G.segment(corner, b, { color: 'purple', width: 3.5, ends: [null, 'arrow'] }) : G.segment(a, corner, { color: 'purple', width: 3.5, ends: [null, 'arrow'] });
        const rl = G.label((a[0] + b[0]) / 2, corner[1], `run ${b[0] - a[0]} ${garage ? 'h' : 'min'}`, { pos: 'n', cls: 'u5l9-run', gap: 4 });
        const ril = G.label(corner[0], (a[1] + b[1]) / 2, `rise ${dy > 0 ? '+' : '−'}${Math.abs(dy)}`, { pos: up ? 'e' : 'w', cls: 'u5l9-rise' });
        prev = [runEl, riseEl, rl, ril];
        if (up) { await G.drawIn(runEl, 450, c); await fadeIn(c, rl); await G.drawIn(riseEl, 450, c); await fadeIn(c, ril); }
        else { await G.drawIn(riseEl, 450, c); await fadeIn(c, ril); await G.drawIn(runEl, 450, c); await fadeIn(c, rl); }
        const nm = d.names[n].replace(' to ', '\\to ');
        const head = garage ? T(nm) : d.names[n];
        const r10 = Math.round(s.r * 10) / 10, exact = Math.abs(s.r - r10) < 1e-9;
        const frac = `\\dfrac{${b[1]}-${a[1]}}{${tl(b[0])}-${tl(a[0])}}=` + (Math.abs(s.r - Math.round(s.r)) < 1e-9 ? `${Math.round(s.r)}` : exact ? `\\dfrac{${dy}}{${b[0] - a[0]}}=${r10}` : `{}`);
        const frac2 = exact ? frac : frac.replace(/=\{\}$/, `\\approx${r10}`);
        const line = h('div', 'u5l9-rl', `<div class="u5l9-rh" style="color:${KC[kk]}">${head}</div>${T(frac2)}`);
        P.appendChild(line); await fadeIn(c, line);
      }
    }));
    steps.push({
      cap: d.end,
      run: async (c) => {
        if (rates.length < 2) { const s = stamp(P, 'decreasing', { ok: false }); s.style.alignSelf = 'center'; s.style.marginTop = '16px'; await stampIn(c, s); return; }
        const max = Math.max(...rates.map((s) => Math.abs(s.r)));
        const bars = h('div', 'u5l9-bars', '<div class="u5l9-bh">how fast? (size of the rate)</div>'); P.appendChild(bars);
        for (let n = 0; n < rates.length; n++) {
          const s = rates[n], top = Math.abs(s.r) === max, v = Math.round(Math.abs(s.r) * 10) / 10;
          const row = h('div', 'u5l9-bar' + (top ? ' top' : ''), `<span class="u5l9-bn">${garage ? T(d.names[n].replace(' to ', '\\to ')) : n ? '6' : '1'}</span><i style="width:${Math.round(150 * Math.abs(s.r) / max)}px"></i><span>${v}</span>`);
          bars.appendChild(row); await fadeIn(c, row, 300);
        }
      }
    });
    return steps;
  }
};

/* =============================== explainer: the parking garage, animated =============================== */
const CARC = ['#c93a33', '#1f5bd6', '#12805a', '#c27a0e', '#7b4fc4', '#3a4254', '#e07a5f', '#13807a'];
function makeGarage(host, x, y, w) {
  const el = add(host, box(h('div', 'u5l9-garage'), w, null), x, y);
  const cols = 20, cw = 15, ch = 10, gx = 3, gy = 4, W = cols * (cw + gx) + 24, levels = 5;
  let s = `<svg viewBox="0 0 ${W} 250" width="100%" aria-label="A parking garage with 200 spaces">`;
  s += `<rect x="4" y="30" width="${W - 8}" height="212" rx="6" fill="#e9e6de" stroke="${INK}" stroke-width="2.5"/>`;
  s += `<rect x="${W / 2 - 46}" y="6" width="92" height="28" rx="6" fill="#1f5bd6"/><text x="${W / 2}" y="27" text-anchor="middle" fill="#fff" font-weight="800" font-size="19">PARK</text>`;
  for (let L = 0; L < levels; L++) {
    const ly = 242 - (L + 1) * 42;
    s += `<line x1="4" x2="${W - 4}" y1="${ly}" y2="${ly}" stroke="#b8b1a2" stroke-width="2"/>`;
    for (let r = 0; r < 2; r++) for (let cc = 0; cc < cols; cc++) {
      const i = L * 40 + r * cols + cc, px = 14 + cc * (cw + gx), py = ly + 8 + (1 - r) * (ch + gy);
      s += `<rect class="u5l9-car" data-i="${i}" x="${px}" y="${py}" width="${cw}" height="${ch}" rx="3"/>`;
    }
  }
  s += '</svg>';
  el.innerHTML = s;
  const cars = [...el.querySelectorAll('.u5l9-car')].sort((a, b) => a.dataset.i - b.dataset.i);
  let shown = -1;
  el.set = (n) => { n = Math.round(n); if (n === shown) return; shown = n; cars.forEach((r, i) => { const on = i < n; r.setAttribute('fill', on ? CARC[(i * 5) % CARC.length] : '#fff'); r.setAttribute('stroke', on ? 'none' : '#cfc8b8'); }); };
  el.set(0);
  return el;
}
const GAR_CAPS = [
  `<b>P to Q</b> (7:00 to 9:00): the <b>morning rush</b>. 160 cars arrive in 2 hours: <b>increasing</b>, 80 cars/h.`,
  `<b>Q to R</b> (9:00 to 11:00): <b>constant</b> at 160. Cars come and go at the same rate (or not at all).`,
  `<b>R to S</b> (11:00 to 12:00): a gentle <b>increase</b> to 180: a small wave of lunchtime visitors, 20 cars/h.`,
  `<b>S to T</b> (12:00 to 13:00): the lunch crowd leaves: <b>decreasing</b>, 60 cars in one hour.`,
  `<b>T to U</b> (13:00 to 17:00): flat at 120 for 4 hours: <b>constant</b>, a quiet afternoon.`,
  `<b>U to V</b> (17:00 to 18:00): the <b>evening exodus</b>. 120 cars leave in one hour: the steepest piece, the fastest change.`
];
const garage = {
  title: 'A day at the parking garage',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Example 1: one car in the picture is one car in the garage. Press <b>Next</b> to run the clock.',
  make(stage, v, ex) {
    const LW = 380;
    const clock = add(stage, box(h('div', 'u5l9-clock'), LW - 8, null), 4, 4);
    const gar = makeGarage(stage, 4, 56, LW - 8);
    const tally = add(stage, box(h('div', 'u5l9-tally'), LW - 8, null), 4, 318), rows = {};
    ['inc', 'con', 'dec'].forEach((kk) => { const r = h('div', 'u5l9-trow ' + kk, `<span class="u5l9-tk-k">${KW[kk]}</span><span class="u5l9-tk-b"></span>`); tally.appendChild(r); rows[kk] = r.lastChild; });
    const G = storyGraph(stage, garAxes({ x: LW + 4, y: 4, width: ex.W - LW - 8, height: 460 }));
    GAR.forEach((p, i) => G.point(p[0], p[1], { color: '#9aa3b2', r: 4, label: T(GAR_N[i]), pos: GAR_POS[i] }));
    const tr = tracer(G, GAR);
    const show = (x, n) => { clock.innerHTML = `<b>${clockOf(x)}</b> &nbsp;·&nbsp; <b>${Math.round(n)}</b> cars parked`; gar.set(n); };
    show(0, 0);
    return GAR_CAPS.map((cap, i) => ({
      cap,
      run: async (c) => {
        const a = GAR[i], b = GAR[i + 1], kk = kindOf(a, b);
        await run(c, tr, GAR, a[0], b[0], msFor(b[0] - a[0], 4, 1200, 2400), show);
        const seg = G.segment(a, b, { color: KC[kk], width: 6 });
        const tag = h('span', 'u5l9-chip ' + kk, T(`${GAR_N[i]}\\to ${GAR_N[i + 1]}`)); rows[kk].appendChild(tag);
        await Promise.all([appear(c, seg, 300), pop(c, tag)]);
      }
    }));
  }
};

/* =============================== explainer: vertical line test =============================== */
const VL = {
  circle: { name: 'the circle', make: (stage, ex) => {
    const G = new Graph(stage, { x: 14, y: 6, width: 456, height: 456, xmin: -3, xmax: 3, ymin: -3, ymax: 3 });
    const els = [G.fn((x) => Math.sqrt(4 - x * x), { from: -2, to: 2, arrows: false, color: INK, samples: 200 }), G.fn((x) => -Math.sqrt(4 - x * x), { from: -2, to: 2, arrows: false, color: INK, samples: 200 })];
    return { G, els, test: { hits: (x) => (x * x > 4 ? [] : [Math.sqrt(4 - x * x), -Math.sqrt(4 - x * x)]), minGap: 250, snap: 1 } };
  }, pass: '', fail: (f) => `At ${T('x=0')} the line meets the circle <b>twice</b>, at ${T('y=2')} and ${T('y=-2')}: one input, two outputs. <b>Not a function.</b>` },
  bath: { name: 'the bath graph', make: (stage, ex) => {
    const G = storyGraph(stage, bathAxes({ x: 4, y: 4, width: 560, height: 460 }));
    return { G, els: [G.polyline(BATH, { color: TRACE, width: 4.5 })], test: { hits: (x) => (x >= 0 && x <= 30 ? [yAt(BATH, x)] : []), from: 0, to: 30, ms: 3200 } };
  }, pass: `Every vertical line crosses <b>once</b>: at each instant the water has exactly one depth. A <b>function</b> of time, even though segments 3 and 5 are very steep.` },
  jump: { name: 'a vertical jump', make: (stage, ex) => {
    const G = storyGraph(stage, bathAxes({ x: 4, y: 4, width: 560, height: 460 }));
    const J = [[0, 0], [8, 20], [11, 20], [11, 28], [25, 28], [25.5, 20], [30, 0]];
    return { G, els: [G.polyline(J, { color: COLORS.red, width: 4.5 })], test: { hits: (x) => (Math.abs(x - 11) < 0.03 ? [20, 28] : x >= 0 && x <= 30 ? [yAt(J, x)] : []), snap: 1 } };
  }, fail: () => `At ${T('t=11')} min the line meets the graph at depth 20 cm <b>and</b> 28 cm: two depths at one instant, which is impossible. <b>Not a function.</b> Real changes take time, so a steep piece must still lean right.` }
};
const vlt = {
  title: 'One instant, one value',
  height: 470,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'circle', label: 'The circle' }, { v: 'bath', label: 'The bath graph' }, { v: 'jump', label: 'A vertical jump' }],
  intro: (k) => (k === 'jump' ? 'Someone drew Sam getting in as a perfectly <b>vertical</b> line. Can that be right? Press <b>Next</b>.' : `Slide a vertical line across ${VL[k].name}. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = VL[k], m = d.make(stage, ex), PW = ex.W - 600;
    const P = add(stage, box(h('div', 'u5l9-panel', '<div class="u5l9-ph">verdict</div>'), PW, 440), ex.W - PW - 8, 12);
    let res;
    return [
      { cap: k === 'circle' ? 'A circle: is ' + T('y') + ' a function of ' + T('x') + '?' : 'A graph of water depth against <b>time</b>.', run: (c) => Promise.all(m.els.map((e) => m.G.drawIn(e, 1000, c))) },
      { cap: 'Slide a <b>vertical line</b> from left to right. Each vertical line is <b>one instant</b> (one input).', run: async (c) => { res = await m.G.vlineTest(c, m.test); } },
      { cap: () => (res && res.fail ? d.fail(res.fail) : d.pass),
        run: async (c) => {
          const bad = !!(res && res.fail);
          P.appendChild(h('div', 'u5l9-vtxt', bad ? `one input, <b>${res.fail.ys.length}</b> outputs` : 'every vertical line: <b>one</b> crossing'));
          const s = stamp(P, bad ? 'Not a function' : 'Function', { ok: !bad }); s.style.alignSelf = 'center'; s.style.marginTop = '40px';
          await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== explainer: a vocabulary of shapes =============================== */
const SH = {
  up: { name: 'constant increase', short: 'constant increase', f: (x) => 0.4 + 0.85 * x, xs: [0.2, 1.0, 1.8, 2.6, 3.4, 4.1],
    cap: 'Every step rises by the <b>same amount</b>: a <b>constant rate</b>. That makes a straight line.', ex: ['filling a tub with the tap at a steady flow', 'distance walked at a steady pace'] },
  down: { name: 'constant decrease', short: 'constant decrease', f: (x) => 3.9 - 0.85 * x, xs: [0.2, 1.0, 1.8, 2.6, 3.4, 4.1],
    cap: 'Every step falls by the <b>same amount</b>: a constant rate of decrease. Straight again.', ex: ['a phone battery draining steadily while you stream a video', 'gas in the tank on a long drive at a steady speed'] },
  slow: { name: 'increasing, slowing down', short: 'increasing, slowing down', f: (x) => 0.3 + 3.6 * (1 - Math.exp(-0.9 * (x - 0.2))), xs: [0.2, 1.0, 1.8, 2.6, 3.4, 4.1],
    cap: 'Still rising, but each rise is <b>smaller</b> than the one before: increasing and <b>slowing down</b>. The curve bends toward flat.', ex: ['a sprinter’s speed just after the starting gun', 'total views of a new video: lots at first, then fewer each day'] },
  fast: { name: 'increasing, speeding up', short: 'increasing, speeding up', f: (x) => 0.3 + 0.24 * (x - 0.2) ** 2, xs: [0.2, 1.0, 1.8, 2.6, 3.4, 4.1],
    cap: 'Each rise is <b>bigger</b> than the one before: increasing and <b>speeding up</b>. The curve bends upward, steeper and steeper.', ex: ['the distance a dropped stone has fallen', 'a snowball rolling downhill, growing as it goes'] },
  per: { name: 'repeating (periodic)', short: 'repeating (periodic)', f: (x) => 2.1 + 1.4 * Math.sin(2 * Math.PI * (x - 0.2) / 1.95), xs: [0.2, 0.6875, 1.175, 1.6625, 2.15, 2.6375, 3.125, 3.6125, 4.1],
    cap: 'Up, down, up, down: the <b>same pattern repeats</b> over and over. That’s <b>periodic</b>.', ex: ['the height of a seat on a Ferris wheel', 'the air in your lungs as you breathe in and out'] }
};
const shapes = {
  title: 'Five shapes to recognize',
  height: 440,
  choices: Object.keys(SH).map((k) => ({ v: k, label: SH[k].name })),
  intro: (k) => `Shape: <b>${SH[k].name}</b>. How does the quantity change as time goes on? Press <b>Next</b>.`,
  make(stage, k, ex) {
    const d = SH[k], PW = 340;
    const G = storyGraph(stage, { x: 4, y: 4, width: ex.W - PW - 16, height: 430, xmin: 0, xmax: 4.5, ymin: 0, ymax: 4.3, xstep: 0.5, ystep: 0.5, xt: 'time', yt: 'quantity', pad: [16, 24, 40, 48] });
    const P = add(stage, box(h('div', 'u5l9-panel', '<div class="u5l9-ph">sounds like…</div>'), PW, 428), ex.W - PW - 6, 6);
    const ys = d.xs.map(d.f);
    return [
      { cap: 'Here is the shape.', run: (c) => G.drawIn(G.fn(d.f, { from: 0.2, to: 4.1, color: INK, width: 4.5, arrows: false, samples: 200 }), 1100, c) },
      { cap: 'Cut time into <b>equal steps</b> and look at how much the quantity changes in each one.',
        run: async (c) => {
          for (let i = 0; i + 1 < d.xs.length; i++) {
            const a = [d.xs[i], ys[i]], b = [d.xs[i + 1], ys[i + 1]], up = b[1] >= a[1];
            const r = G.segment(a, [b[0], a[1]], { color: 'amber', width: 2.5, dash: true });
            const bar = G.segment([b[0], a[1]], b, { color: up ? 'green' : 'red', width: 6, cap: 'butt' });
            await G.drawIn(r, 220, c); await G.drawIn(bar, 260, c);
          }
        } },
      { cap: d.cap,
        run: async (c) => {
          const nm = h('div', 'u5l9-shn', d.name); P.appendChild(nm); await pop(c, nm);
          for (const e of d.ex) { const li = h('div', 'u5l9-shx', e); P.appendChild(li); await fadeIn(c, li); }
        } }
    ];
  }
};

/* =============================== explainer: Example 2 stories =============================== */
const EX2A = [[0, 2.6], [2, 2.6], [3, 0.9], [5, 0.9], [6, 2.1], [8, 2.1], [9, 0]];
const ARCH = (x) => { const k = Math.floor(x / 1.7), u = x - k * 1.7; return k > 2 ? 0 : 1.5 * (1 - ((u - 0.85) / 0.85) ** 2); };
const EX2B = sample(ARCH, 0, 5.1, 150);
const carSVG = `<g class="u5l9-carg"><rect x="-34" y="-26" width="68" height="20" rx="7" fill="#c93a33" stroke="${INK}" stroke-width="2"/>
  <path d="M-20 -26L-12 -40H12L22 -26Z" fill="#e8f0fc" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="-19" cy="-5" r="8" fill="${INK}"/><circle cx="19" cy="-5" r="8" fill="${INK}"/><circle cx="-19" cy="-5" r="3" fill="#bbb"/><circle cx="19" cy="-5" r="3" fill="#bbb"/></g>`;
const rooSVG = `<g class="u5l9-roo"><path d="M-10 -20Q-34 -12 -46 4" stroke="#a8693c" stroke-width="7" stroke-linecap="round" fill="none"/>
  <ellipse cx="0" cy="-28" rx="16" ry="22" fill="#c98a52" stroke="${INK}" stroke-width="2"/>
  <path d="M-4 -8L10 0L22 0" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>
  <circle cx="12" cy="-52" r="10" fill="#c98a52" stroke="${INK}" stroke-width="2"/><path d="M8 -60L4 -76L13 -62Z" fill="#c98a52" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="16" cy="-54" r="1.8" fill="${INK}"/><path d="M8 -36L18 -32" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/></g>`;
const E2 = {
  a: { pts: EX2A, axes: { xmin: 0, xmax: 9.8, ymin: 0, ymax: 3.1, xstep: 1, ystep: 0.5, xt: 'time', yt: 'speed' },
    steps: [[0, 1, 'Steady speed: <b>constant</b>. A car cruising on the highway.'], [1, 2, 'The speed <b>decreases</b>: the car slows for a construction zone.'],
      [2, 3, '<b>Constant</b> again, at a <b>lower</b> speed. Not zero: the car is still moving through the zone.'], [3, 4, 'The speed <b>increases</b>: out of the zone, the car speeds up.'],
      [4, 5, '<b>Constant</b>: a new steady speed, faster than in the zone (a little slower than at first).'], [5, 6, 'The speed <b>decreases</b> all the way to 0: the car slows to a stop at its destination.']],
    end: 'One possible story. The road is flat and straight, yet the graph has bumps: a graph shows how a <b>quantity</b> (speed) changes, not a picture of the road.' },
  b: { pts: EX2B, axes: { xmin: 0, xmax: 6.4, ymin: 0, ymax: 2.1, xstep: 0.5, ystep: 0.5, xt: 'time', yt: 'height' },
    steps: [[0, 1.7, 'Hop 1: the height <b>increases</b>, then <b>decreases</b> back to 0. The feet touch the ground.'], [1.7, 3.4, 'Hop 2: the same arch again, to the same height.'], [3.4, 5.1, 'Hop 3: identical again.']],
    end: 'Three identical arches, each back to 0: a <b>kangaroo hopping</b> steadily. Here the graph does look like the path, because the kangaroo moves across at a steady speed.' }
};
const ex2 = {
  title: 'Stories behind the shapes',
  height: 490,
  choices: [{ v: 'a', label: 'Example 2(a) check' }, { v: 'b', label: 'Example 2(b) check' }],
  intro: (k) => (k === 'a' ? 'Graph (a) shows <b>speed</b> against time. One possible story: a car trip. Press <b>Next</b>.' : 'Graph (b) shows <b>height</b> against time. One possible story: a kangaroo. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = E2[k], pts = d.pts, SH_ = 160;
    const G = storyGraph(stage, Object.assign({ x: 4, y: SH_ + 6, width: ex.W - 8, height: 480 - SH_, pad: [14, 26, 40, 50] }, d.axes));
    const sc = add(stage, box(h('div', 'u5l9-scene'), ex.W - 8, SH_), 4, 4);
    const W = ex.W - 8;
    let set;
    if (k === 'a') {
      const segs = pts.slice(1).map((b, i) => [pts[i], b]);
      const sAt = (x) => { let s = 0; for (const [a, b] of segs) { if (x <= a[0]) break; const xe = Math.min(x, b[0]); s += (xe - a[0]) * (a[1] + yAt(pts, xe)) / 2; } return s; };
      const S = sAt(9), px = (x) => 60 + sAt(x) / S * (W - 260);
      const z0 = px(2.6), z1 = px(5.4);
      sc.innerHTML = `<svg viewBox="0 0 ${W} ${SH_}" width="${W}" height="${SH_}">
        <rect x="0" y="0" width="${W}" height="${SH_}" fill="#e8f0fc"/><rect x="0" y="112" width="${W}" height="48" fill="#6b7280"/>
        <line x1="0" x2="${W}" y1="136" y2="136" stroke="#fff" stroke-width="3" stroke-dasharray="18 14"/>
        <rect x="${z0}" y="104" width="${z1 - z0}" height="8" fill="#e8a01e"/>
        ${[0, 0.25, 0.5, 0.75, 1].map((t) => `<path d="M${lerp(z0, z1, t) - 7} 112L${lerp(z0, z1, t)} 92L${lerp(z0, z1, t) + 7} 112Z" fill="#e8a01e" stroke="${INK}" stroke-width="1.5"/>`).join('')}
        <text x="${(z0 + z1) / 2}" y="84" text-anchor="middle" font-size="17" font-weight="800" fill="#a36a00">construction zone</text>
        <rect x="${W - 112}" y="96" width="10" height="16" fill="${INK}"/><rect x="${W - 140}" y="66" width="66" height="32" rx="5" fill="#12805a"/>
        <text x="${W - 107}" y="88" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">HOME</text>
        <g class="u5l9-gauge" transform="translate(${W - 70} 52)"><path d="M-42 0A42 42 0 0 1 42 0" fill="#fff" stroke="${INK}" stroke-width="3"/>
          <text x="0" y="-12" text-anchor="middle" font-size="13" font-weight="800" fill="${INK}">speed</text>
          <line class="u5l9-needle" x1="0" y1="0" x2="-34" y2="0" stroke="${COLORS.red}" stroke-width="4" stroke-linecap="round"/><circle r="5" fill="${INK}"/></g>
        <g class="u5l9-carpos">${carSVG}</g></svg>`;
      const car = sc.querySelector('.u5l9-carpos'), needle = sc.querySelector('.u5l9-needle');
      set = (x, y) => { car.setAttribute('transform', `translate(${px(x)} 128)`); const a = Math.PI * (1 - y / 3.1); needle.setAttribute('x2', 34 * Math.cos(a)); needle.setAttribute('y2', -34 * Math.sin(a)); };
    } else {
      sc.innerHTML = `<svg viewBox="0 0 ${W} ${SH_}" width="${W}" height="${SH_}"><rect x="0" y="0" width="${W}" height="${SH_}" fill="#e8f4fc"/>
        <rect x="0" y="140" width="${W}" height="20" fill="#9cc96b"/><g class="u5l9-roopos">${rooSVG}</g></svg>`;
      const roo = sc.querySelector('.u5l9-roopos');
      set = (x, y) => roo.setAttribute('transform', `translate(${G.toPx(x, 0)[0]} ${140 - y * 52})`);
    }
    const tr = tracer(G, pts);
    set(0, pts[0][1]);
    const steps = d.steps.map(([i, j, cap]) => ({
      cap,
      run: async (c) => {
        const x0 = k === 'a' ? pts[i][0] : i, x1 = k === 'a' ? pts[j][0] : j;
        await run(c, tr, pts, x0, x1, k === 'a' ? msFor(x1 - x0, 2, 1100, 1800) : 1600, set);
        if (k === 'a') { const kk = kindOf(pts[i], pts[j]); const seg = G.segment(pts[i], pts[j], { color: KC[kk], width: 6 }); const tag = G.label((pts[i][0] + pts[j][0]) / 2, (pts[i][1] + pts[j][1]) / 2, KW[kk], { pos: kk === 'con' ? 'n' : kk === 'inc' ? 'se' : 'sw', cls: 'u5l9-ktag ' + kk, gap: 10 }); await Promise.all([appear(c, seg, 300), fadeIn(c, tag)]); }
      }
    }));
    steps.push({ cap: d.end, run: async (c) => { const s = stamp(stage, 'one possible story', { ok: null, x: 150, y: 34, size: 'sm' }); await stampIn(c, s); } });
    return steps;
  }
};

/* =============================== explainer: sketching from a description =============================== */
const SK = {
  phone: { lead: 'Your phone’s battery charge through the day:', xt: 'time', yt: 'battery charge',
    pieces: [{ t: 'it is fully charged when you leave home,', pts: [[0.3, 9.2]], cap: 'Start: <b>full</b>, so the graph starts high.' },
      { t: 'drains slowly during class,', pts: [[0.3, 9.2], [5, 7.2]], cap: '“Drains slowly”: <b>decreasing</b>, gently. A shallow slope down.' },
      { t: 'then quickly while you play a game at lunch.', pts: [[5, 7.2], [6.5, 2.2]], cap: '“Quickly”: <b>decreasing</b> again, but <b>steep</b>. Faster means steeper.' },
      { t: 'You plug it in and it charges fast,', pts: [[6.5, 2.2], [8.3, 9.2]], cap: '“Charges fast”: a steep <b>increase</b>.' },
      { t: 'then it stays full.', pts: [[8.3, 9.2], [10, 9.2]], cap: '“Stays full”: <b>constant</b>, a flat piece at the top.' }],
    end: 'Check the ends: it starts full, it never reaches 0 (the battery never died), and it ends full.' },
  a: { lead: 'The temperature inside a kiln while pottery is fired:', xt: 'time (hours)', yt: 'kiln temp. (°C)',
    pieces: [{ t: 'the kiln heats up steadily,', pts: [[0.3, 1.0], [3.2, 8.8]], cap: '“Heats up steadily”: a straight <b>increase</b> (steady means a constant rate).' },
      { t: 'holds at a high temperature for a long soak,', pts: [[3.2, 8.8], [7, 8.8]], cap: '“Holds … for a long soak”: <b>constant</b>, a long flat piece up high.' },
      { t: 'then is turned off and cools back toward room temperature.', pts: [[7, 8.8], [9.8, 1.6]], cap: '“Cools”: <b>decreasing</b> once it is switched off.' }],
    end: 'Check the ends: it starts at room temperature and cools back <b>toward</b> room temperature, not down to 0 °C. The fall stops above the axis.' },
  b: { lead: 'The speed of a cyclist on a flat trail with one steep hill in the middle:', xt: 'distance (km)', yt: 'speed (km/h)',
    pieces: [{ t: 'she rides at a steady speed,', pts: [[0.3, 7.1], [3, 7.1]], cap: '“A steady speed”: <b>constant</b>.' },
      { t: 'slows sharply climbing the hill,', pts: [[3, 7.1], [4.85, 1.0]], cap: '“Slows sharply”: a steep <b>decrease</b>.' },
      { t: 'nearly stops at the crest,', pts: [[4.85, 1.0], [6.05, 1.0]], cap: '“Nearly stops”: low, but <b>not</b> zero. A short flat piece just above the axis.' },
      { t: 'then speeds up quickly down the far side', pts: [[6.05, 1.0], [8, 8]], cap: '“Speeds up quickly”: a steep <b>increase</b>.' },
      { t: 'before levelling off.', pts: [[8, 8], [10, 8]], cap: '“Levelling off”: <b>constant</b> again.' }],
    end: 'Check: the horizontal axis is <b>distance</b>, not time, and the speed never reaches 0, because she only <b>nearly</b> stops.' }
};
const hill = (x) => (x < 3 || x > 7.9 ? 0 : 1 - Math.cos(2 * Math.PI * (x - 3) / 4.9)) * 30;
const sketch = {
  title: 'From a story to a sketch',
  height: 470,
  choices: [{ v: 'phone', label: 'Phone battery' }, { v: 'a', label: 'Example 3(a) check' }, { v: 'b', label: 'Example 3(b) check' }],
  intro: (k) => (k === 'phone' ? 'Turn each phrase of the story into one piece of graph. Press <b>Next</b>.' : `Example 3(${k}): one phrase, one piece. Press <b>Next</b>.`),
  make(stage, k, ex) {
    const d = SK[k], LW = 330, SCH = 104, GX = LW + 10, GW = ex.W - GX - 4;
    const desc = add(stage, box(h('div', 'u5l9-desc', `<div class="u5l9-lead">${d.lead}</div>`), LW, 456), 6, 6);
    const spans = d.pieces.map((p) => { const s = h('span', 'u5l9-ph-t', p.t + ' '); desc.appendChild(s); return s; });
    const G = storyGraph(stage, { x: GX, y: SCH + 8, width: GW, height: 470 - SCH - 12, xmin: 0, xmax: 10.6, ymin: 0, ymax: 10.4, grid: false, xt: d.xt, yt: d.yt, pad: [12, 22, 38, 50] });
    const sc = add(stage, box(h('div', 'u5l9-scene'), GW, SCH), GX, 4);
    let set;
    if (k === 'b') {
      const xs = sample((x) => x, 0, 10.6, 120).map((p) => p[0]);
      const path = xs.map((x, i) => `${i ? 'L' : 'M'}${G.toPx(x, 0)[0].toFixed(1)} ${(92 - hill(x)).toFixed(1)}`).join('');
      sc.innerHTML = `<svg viewBox="0 0 ${GW} ${SCH}" width="${GW}" height="${SCH}"><rect width="${GW}" height="${SCH}" fill="#e8f4fc"/>
        <path d="${path}L${GW} ${SCH}L0 ${SCH}Z" fill="#9cc96b" stroke="#5f8a3a" stroke-width="2"/>
        <text x="${G.toPx(5.45, 0)[0]}" y="${92 - 60 - 8}" text-anchor="middle" font-size="16" font-weight="800" fill="#3a5a20">crest</text>
        <g class="u5l9-bike"><circle cx="-9" cy="-7" r="7" fill="none" stroke="${INK}" stroke-width="2.5"/><circle cx="9" cy="-7" r="7" fill="none" stroke="${INK}" stroke-width="2.5"/>
        <path d="M-9 -7L-1 -16L9 -7M-1 -16L3 -26" stroke="${INK}" stroke-width="2.5" fill="none"/><circle cx="3" cy="-31" r="5.5" fill="#c93a33"/></g></svg>`;
      const bk = sc.querySelector('.u5l9-bike');
      set = (x) => { const e = hill(x), e2 = hill(x + 0.05); const ang = Math.atan2(-(e2 - e), G.toPx(x + 0.05, 0)[0] - G.toPx(x, 0)[0]) * 180 / Math.PI; bk.setAttribute('transform', `translate(${G.toPx(x, 0)[0]} ${92 - e}) rotate(${ang})`); };
    } else if (k === 'a') {
      sc.innerHTML = `<svg viewBox="0 0 ${GW} ${SCH}" width="${GW}" height="${SCH}"><rect width="${GW}" height="${SCH}" fill="#f3efe6"/>
        <g transform="translate(${GW / 2 - 60} 8)"><rect width="120" height="88" rx="10" fill="#8a8f99" stroke="${INK}" stroke-width="2.5"/>
        <rect class="u5l9-glow" x="22" y="18" width="76" height="52" rx="6" stroke="${INK}" stroke-width="2"/></g>
        <g transform="translate(${GW / 2 + 90} 8)"><rect x="-8" y="0" width="16" height="78" rx="8" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cy="80" r="11" fill="${COLORS.red}" stroke="${INK}" stroke-width="2"/>
        <rect class="u5l9-merc" x="-4" y="70" width="8" height="10" fill="${COLORS.red}"/></g></svg>`;
      const glow = sc.querySelector('.u5l9-glow'), merc = sc.querySelector('.u5l9-merc');
      set = (x, y) => { const t = Math.max(0, Math.min(1, (y - 1) / 7.8)); glow.setAttribute('fill', `rgb(${Math.round(lerp(70, 255, t))},${Math.round(lerp(76, 170, t * t))},${Math.round(lerp(90, 40, t))})`); const hh = 6 + t * 64; merc.setAttribute('y', 76 - hh); merc.setAttribute('height', hh + 4); };
    } else {
      sc.innerHTML = `<svg viewBox="0 0 ${GW} ${SCH}" width="${GW}" height="${SCH}"><rect width="${GW}" height="${SCH}" fill="#eef2f7"/>
        <g transform="translate(${GW / 2 - 90} 22)"><rect width="170" height="60" rx="10" fill="#fff" stroke="${INK}" stroke-width="3"/><rect x="170" y="18" width="10" height="24" rx="3" fill="${INK}"/>
        <rect class="u5l9-bat" x="6" y="6" width="158" height="48" rx="6"/><path class="u5l9-bolt" d="M92 8L70 34H86L78 54L102 26H86Z" fill="#facd28" stroke="${INK}" stroke-width="2" style="display:none"/></g></svg>`;
      const bat = sc.querySelector('.u5l9-bat'), bolt = sc.querySelector('.u5l9-bolt');
      set = (x, y, up) => { const t = Math.max(0, Math.min(1, y / 9.2)); bat.setAttribute('width', Math.max(2, 158 * t)); bat.setAttribute('fill', t < 0.3 ? COLORS.red : COLORS.green); bolt.style.display = up ? '' : 'none'; };
    }
    const p0 = d.pieces[0].pts[0];
    set(p0[0], p0[1], false);
    const steps = d.pieces.map((p, i) => ({
      cap: p.cap,
      run: async (c) => {
        spans.forEach((s, j) => s.classList.toggle('on', j === i)); if (i) spans[i - 1].classList.add('done');
        if (p.pts.length === 1) { await G.reveal(G.point(p.pts[0][0], p.pts[0][1], { color: SKETCH, r: 7 }), c); return; }
        const [a, b] = p.pts, kk = kindOf(a, b);
        const seg = G.segment(a, b, { color: SKETCH, width: 5 });
        const tw = tween(c, 1100, (t) => set(lerp(a[0], b[0], t), lerp(a[1], b[1], t), kk === 'inc'), linear);
        await Promise.all([G.drawIn(seg, 1100, c, { easing: 'linear' }), tw]);
        const tag = h('span', 'u5l9-ptag ' + kk, KW[kk]); spans[i].appendChild(tag); await pop(c, tag);
      }
    }));
    steps.push({
      cap: d.end,
      run: async (c) => {
        spans.forEach((s) => { s.classList.remove('on'); s.classList.add('done'); });
        set(d.pieces[d.pieces.length - 1].pts.slice(-1)[0][0], d.pieces[d.pieces.length - 1].pts.slice(-1)[0][1], false);
        if (k === 'a') { const rl = G.hline(1.0, { color: 'gray', width: 2.5 }); const lb = G.label(8.6, 1.0, 'room temperature', { pos: 'n', cls: 'u5l9-note' }); await Promise.all([G.drawIn(rl, 600, c), fadeIn(c, lb)]); }
        const s = stamp(desc, 'shape, not numbers', { ok: true, size: 'sm' }); s.style.display = 'table'; s.style.margin = '18px auto 0'; await stampIn(c, s);
      }
    });
    return steps;
  }
};

/* =============================== mount =============================== */
mountStatic();
export const explainers = mountExplainers({ bath, pieces, rate, garage, vlt, shapes, ex2, sketch });
