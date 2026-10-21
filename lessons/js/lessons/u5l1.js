/* Math 10C · Unit 5 · Lesson 1 — The Cartesian Plane, Growing Patterns, and Types of Variables:
 * the Battleship warm-up (a playable board), the static figures, and the explainers.
 * Colours: x-moves amber, y-moves purple, data points blue, discrete = separate dots, continuous = a joined line. */
import {
  Graph, NumberLine, ValueTable, h, tex, add, box, pop, fadeIn, appear, sleep, tween, pairTex, texNum, svgEl,
  stamp, stampIn, mountExplainers, anim, pulse, COLORS, arrowHead, drawIn
} from '../blocks.js';

const T = (s) => tex(s);
const C = COLORS;
const PT = (x, y) => T(pairTex(x, y));
const mns = (n) => String(n).replace('-', '−');
const panel = (stage, x, y, w, hh, title) => add(stage, box(h('div', 'u5l1-panel', title ? `<div class="u5l1-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u5l1-line' + (cls ? ' ' + cls : ''), html); p.appendChild(d); return d; };
const hide = (...els) => { els.forEach((e) => e && (e.style.opacity = 0)); return els[0]; };
const quadOf = (x, y) => (x === 0 || y === 0 ? 0 : x > 0 ? (y > 0 ? 1 : 4) : (y > 0 ? 2 : 3));
const ROMAN = ['', 'I', 'II', 'III', 'IV'];
const where = (x, y) => {
  const q = quadOf(x, y); if (q) return `in <b>Quadrant ${ROMAN[q]}</b>`;
  if (x === 0 && y === 0) return 'at the <b>origin</b>';
  return x === 0 ? `<b>on the ${T('y')}-axis</b> (no quadrant)` : `<b>on the ${T('x')}-axis</b> (no quadrant)`;
};
const TH = (html) => ({ html: `<span class="u5l1-th">${html}</span>` });
const money = (v) => '$' + (Math.round(v * 100 + 1e-9) / 100).toFixed(2);

/* ================= matchsticks ================= */
const WOOD = '#d4934a', HEAD = '#c93a33';
/** a row of n squares made of matchsticks, in counting order: the left side, then the top, bottom and right of each square.
 *  Returns a <g> with .list (every stick), .first (the left side) and .groups (the 3 sticks each square adds). */
function sticks(parent, n, x0, y0, u, o = {}) {
  const g = svgEl('g', { class: 'u5l1-sticks' }, parent), list = [];
  const sw = o.w || Math.max(3, Math.min(6, u * 0.12)), hr = o.r || Math.max(2.6, Math.min(5.5, u * 0.1)), m = Math.max(1.6, u * 0.08);
  const st = (x1, y1, x2, y2) => {
    const s = svgEl('g', { class: 'u5l1-stick' }, g), L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    s.body = svgEl('line', { x1: x1 + ux * m, y1: y1 + uy * m, x2: x2 - ux * m, y2: y2 - uy * m, stroke: o.color || WOOD, 'stroke-width': sw, 'stroke-linecap': 'round' }, s);
    s.head = svgEl('circle', { cx: x2 - ux * m, cy: y2 - uy * m, r: hr, fill: HEAD }, s);
    list.push(s); return s;
  };
  st(x0, y0 + u, x0, y0);
  for (let i = 0; i < n; i++) { const x = x0 + i * u; st(x, y0, x + u, y0); st(x, y0 + u, x + u, y0 + u); st(x + u, y0 + u, x + u, y0); }
  g.list = list; g.first = list[0]; g.groups = [];
  for (let i = 0; i < n; i++) g.groups.push(list.slice(1 + 3 * i, 4 + 3 * i));
  return g;
}
const paint = (sts, color) => [].concat(sts).forEach((s) => s.body.setAttribute('stroke', color));
/** static figures: Figure a, Figure b, … side by side */
function matchFigs(host, figs, u) {
  const gap = u * 1.5, pad = 12; let W = pad;
  const xs = figs.map((n) => { const x = W; W += n * u + gap; return x; }); W = W - gap + pad;
  const H = u + 50, svg = svgEl('svg', { class: 'u5l1-mfig', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, host);
  figs.forEach((n, i) => { sticks(svg, n, xs[i], 10, u); const t = svgEl('text', { x: xs[i] + n * u / 2, y: u + 42, 'text-anchor': 'middle', class: 'u5l1-mcap' }, svg); t.textContent = 'Figure ' + n; });
  return svg;
}

/* ================= Battleship warm-up ================= */
const SCENE = {
  misses: [[-4, 1], [-2, 1], [-3, 3], [1, -2], [4, 1], [-5, -4], [5, -2], [0, 5], [2, -5]],
  hit: [-3, 1],
  sunk: [[3, 4], [4, 4], [5, 4]],
  cruisers: [[[-3, -1], [-3, 0], [-3, 1]], [[-3, 0], [-3, 1], [-3, 2]]]
};
const FLEET = [['battleship', 4], ['cruiser', 3], ['submarine', 3], ['destroyer', 2]];
function mountBattleship() {
  const host = document.getElementById('bship'); if (!host) return;
  const BW = Math.min(470, host.clientWidth || 470); // CSS sets the board width (smaller on one-screen pages)
  const G = new Graph(host, { width: BW, height: BW, xmin: -5.5, xmax: 5.5, ymin: -5.5, ymax: 5.5, numbers: false, pad: [16, 18, 38, 46], cls: 'u5l1-sea' });
  // numbers along the bottom and left edges, like the board
  for (let k = -5; k <= 5; k++) {
    const [px] = G.toPx(k, 0), [, py] = G.toPx(0, k);
    svgEl('text', { class: 'bk-num u5l1-edge', x: px, y: BW - 8, 'text-anchor': 'middle' }, G.layers.axes).textContent = mns(k);
    svgEl('text', { class: 'bk-num u5l1-edge', x: 26, y: py + 6, 'text-anchor': 'end' }, G.layers.axes).textContent = mns(k);
  }
  const hullL = svgEl('g', { class: 'u5l1-hulls' }, G.layers.data), logicL = svgEl('g', { class: 'u5l1-logic' }, G.layers.data), markL = svgEl('g', { class: 'u5l1-marks' }, G.layers.top);
  const logEl = document.getElementById('bs-log'), cntEl = document.getElementById('bs-count');
  const U = G.ux, key = (x, y) => x + ',' + y;
  let S;
  const hull = (cells, cls) => {
    const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
    const [x0, y0] = G.toPx(Math.min(...xs) - 0.42, Math.max(...ys) + 0.42), [x1, y1] = G.toPx(Math.max(...xs) + 0.42, Math.min(...ys) - 0.42);
    return svgEl('rect', { class: 'u5l1-hull ' + (cls || ''), x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: U * 0.4 }, hullL);
  };
  const mark = (x, y, hit) => {
    const [px, py] = G.toPx(x, y), g = svgEl('g', { class: 'u5l1-mk ' + (hit ? 'u5l1-hit' : 'u5l1-miss') }, markL);
    if (hit) {
      svgEl('circle', { cx: px, cy: py, r: U * 0.31 }, g);
      const d = U * 0.17; svgEl('path', { d: `M${px - d} ${py - d}L${px + d} ${py + d}M${px - d} ${py + d}L${px + d} ${py - d}` }, g);
    } else svgEl('circle', { cx: px, cy: py, r: U * 0.26 }, g);
    return g;
  };
  const say = (html) => { logEl.innerHTML = html; logEl.animate([{ opacity: 0.2 }, { opacity: 1 }], 300); };
  const count = () => { cntEl.textContent = 'Shots: ' + S.n; };
  function reset(mode) {
    hullL.innerHTML = ''; logicL.innerHTML = ''; markL.innerHTML = '';
    S = { mode, shots: new Map(), ships: [], n: 0, shown: false, logic: 0 };
    document.querySelectorAll('[data-bs=scene],[data-bs=new]').forEach((b) => b.classList.toggle('on', b.dataset.bs === mode));
    document.querySelectorAll('[data-bs=show]').forEach((b) => { b.textContent = 'Show ships'; });
    if (mode === 'scene') {
      const sunk = { name: 'ship', cells: SCENE.sunk, sunk: true };
      sunk.el = hull(sunk.cells, 'u5l1-sunk');
      const [tx, ty] = G.toPx(4, 4); const tag = svgEl('text', { class: 'u5l1-sunktag', x: tx, y: ty - U * 0.62, 'text-anchor': 'middle' }, hullL); tag.textContent = 'SUNK';
      SCENE.sunk.forEach(([x, y]) => { S.shots.set(key(x, y), 'hit'); mark(x, y, true); });
      SCENE.misses.forEach(([x, y]) => { S.shots.set(key(x, y), 'miss'); mark(x, y, false); });
      const cells = SCENE.cruisers[Math.random() < 0.5 ? 0 : 1];
      S.ships.push(sunk, { name: 'cruiser', cells, sunk: false });
      S.shots.set(key(...SCENE.hit), 'hit'); mark(...SCENE.hit, true);
      say('One ship is sunk. We’ve hit the <b>cruiser</b> once. Your shot!');
    } else {
      const taken = new Set();
      FLEET.forEach(([name, len]) => {
        for (let tries = 0; tries < 500; tries++) {
          const across = Math.random() < 0.5, x = -5 + Math.floor(Math.random() * (across ? 12 - len : 11)), y = -5 + Math.floor(Math.random() * (across ? 11 : 12 - len));
          const cells = []; for (let i = 0; i < len; i++) cells.push(across ? [x + i, y] : [x, y + i]);
          if (cells.some((c) => taken.has(key(...c)))) continue;
          cells.forEach((c) => taken.add(key(...c))); S.ships.push({ name, cells, sunk: false }); break;
        }
      });
      say(`A new fleet is hiding: a battleship (4), a cruiser (3), a submarine (3) and a destroyer (2). <b>Call an ordered pair and tap it.</b>`);
    }
    count();
  }
  function fire(x, y) {
    if (Math.abs(x) > 5 || Math.abs(y) > 5) return;
    if (S.logic) clearLogic();
    const k = key(x, y);
    if (S.shots.has(k)) { say(`Already fired at ${PT(x, y)}. Pick another point.`); return; }
    const ship = S.ships.find((s) => !s.sunk && s.cells.some((c) => c[0] === x && c[1] === y));
    S.shots.set(k, ship ? 'hit' : 'miss'); S.n++; count();
    const m = mark(x, y, !!ship);
    m.animate([{ opacity: 0, transform: 'scale(2.2)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.2,1.3,.4,1)' });
    let msg = `${PT(x, y)} is ${where(x, y)}. ` + (ship ? '<b class="u5l1-red">HIT!</b>' : '<b>Miss.</b>');
    if (ship && ship.cells.every((c) => S.shots.get(key(...c)) === 'hit')) {
      ship.sunk = true; ship.el = hull(ship.cells, 'u5l1-sunk'); msg += ` You sank the <b>${ship.name}</b>!`;
      const left = S.ships.filter((s) => !s.sunk).length;
      if (!left) msg += ` <b>Fleet destroyed in ${S.n} shot${S.n === 1 ? '' : 's'}.</b>`;
    }
    say(msg);
  }
  function showShips() {
    S.shown = !S.shown;
    hullL.querySelectorAll('.u5l1-ghost').forEach((e) => e.remove());
    if (S.shown) S.ships.filter((s) => !s.sunk).forEach((s) => hull(s.cells, 'u5l1-ghost'));
    document.querySelectorAll('[data-bs=show]').forEach((b) => { b.textContent = S.shown ? 'Hide ships' : 'Show ships'; });
  }
  /* "why B?" — the placements of the cruiser, one press at a time */
  const capsule = (cells, ok, dx = 0) => {
    const xs = cells.map((c) => c[0] + dx), ys = cells.map((c) => c[1]), w = 0.3;
    const [x0, y0] = G.toPx(Math.min(...xs) - w, Math.max(...ys) + w), [x1, y1] = G.toPx(Math.max(...xs) + w, Math.min(...ys) - w);
    logicL.querySelectorAll('.u5l1-cap').forEach((e) => e.classList.add('u5l1-old'));
    const g = svgEl('g', { class: 'u5l1-cap ' + (ok ? 'u5l1-ok' : 'u5l1-no') }, logicL);
    svgEl('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: U * 0.3 }, g);
    if (!ok) { const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, d = U * 0.22; svgEl('path', { class: 'u5l1-x', d: `M${cx - d} ${cy - d}L${cx + d} ${cy + d}M${cx - d} ${cy + d}L${cx + d} ${cy - d}` }, g); }
    g.animate([{ opacity: 0 }, { opacity: 1 }], 350);
    return g;
  };
  const LOGIC = [
    () => { capsule([[-4, 1], [-3, 1], [-2, 1]], false); say(`<b>Across?</b> The misses at ${PT(-4, 1)} and ${PT(-2, 1)} are right beside the hit: no room for 3 in a row.`); },
    () => { capsule([[-3, 1], [-3, 2], [-3, 3]], false); say(`<b>Up from the hit?</b> ${PT(-3, 3)} is a miss, so that doesn’t fit either.`); },
    () => { capsule(SCENE.cruisers[0], true, -0.2); say(`<b>Possible:</b> ${PT(-3, -1)}, ${PT(-3, 0)}, ${PT(-3, 1)}.`); },
    () => { capsule(SCENE.cruisers[1], true, 0.2); say(`<b>Also possible:</b> ${PT(-3, 0)}, ${PT(-3, 1)}, ${PT(-3, 2)}.`); },
    () => {
      logicL.querySelectorAll('.u5l1-cap.u5l1-no').forEach((e) => e.classList.add('u5l1-old'));
      logicL.querySelectorAll('.u5l1-cap.u5l1-ok').forEach((e) => e.classList.remove('u5l1-old'));
      const [px, py] = G.toPx(-3, 0), r = svgEl('circle', { class: 'u5l1-sure', cx: px, cy: py, r: U * 0.42 }, logicL);
      r.animate([{ transform: 'scale(1.8)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], 450);
      say(`${PT(-3, 0)} is in <b>both</b> placements: a <b>sure hit</b>. That’s <b>B</b>. Tap it to fire!`);
    }
  ];
  function clearLogic() { logicL.innerHTML = ''; S.logic = 0; document.querySelectorAll('[data-bs=logic]').forEach((b) => { b.textContent = 'Show why on the board ▸'; }); }
  function logic(btn) {
    if (S.mode !== 'scene') reset('scene');
    if (S.logic >= LOGIC.length) { clearLogic(); say('Your shot!'); return; }
    LOGIC[S.logic++]();
    btn.textContent = S.logic >= LOGIC.length ? 'Clear the board' : `Next reason (${S.logic}/${LOGIC.length}) ▸`;
    host.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  G.svg.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return; e.preventDefault();
    const [x, y] = G.fromEvent(e); fire(Math.round(x), Math.round(y));
  });
  G.el.classList.add('bk-ix');
  document.querySelectorAll('[data-bs]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.bs;
    if (k === 'scene' || k === 'new') reset(k); else if (k === 'show') showShips(); else if (k === 'logic') logic(b);
  }));
  reset('scene');
}

/* ================= static figures ================= */
function mountFigures() {
  document.querySelectorAll('[data-match]').forEach((el) => matchFigs(el, el.dataset.match.split(',').map(Number), Number(el.dataset.u || 40)));

  const plane = document.getElementById('fig-plane');
  if (plane) {
    const G = new Graph(plane, { width: 380, height: 380, xmin: -6, xmax: 6, ymin: -6, ymax: 6, xlabels: 2, ylabels: 2, fontSize: 15 });
    const tint = [[1, 0, 6, 0, 6, C.teal], [2, -6, 0, 0, 6, C.amber], [3, -6, 0, -6, 0, C.purple], [4, 0, 6, -6, 0, C.blue]];
    tint.forEach(([q, a, b, c, d, color]) => {
      const [x0, y0] = G.toPx(a, d), [x1, y1] = G.toPx(b, c);
      svgEl('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: color, 'fill-opacity': 0.08 }, G.layers.bg);
      G.label((a + b) / 2 + (q === 1 || q === 4 ? 0.6 : -0.6), (c + d) / 2 + (q < 3 ? 1.2 : -1.2), `<b>${ROMAN[q]}</b>`, { cls: 'u5l1-qnum', color });
    });
    G.label(0, 0, T('O'), { pos: 'sw', gap: 4, cls: 'bk-ptlab' });
    G.label(-4.4, 0, `${T('x')}-axis`, { pos: 'n', cls: 'u5l1-axlab' });
    G.label(0, -4.6, `${T('y')}-axis`, { pos: 'e', cls: 'u5l1-axlab' });
    G.segment([0, 0], [5, 0], { color: 'amber', width: 4.5, arrowB: true });
    G.segment([5, 0], [5, 2], { color: 'purple', width: 4.5, arrowB: true });
    G.point(5, 2, { label: T('P(5,\\ 2)'), pos: 'ne', color: 'red' });
    G.label(2.5, 0, 'right 5', { pos: 'n', cls: 'u5l1-mvlab', color: 'amber' });
    G.label(5, 1, 'up 2', { pos: 'w', cls: 'u5l1-mvlab', color: 'purple' });
  }

  const ex1 = document.getElementById('fig-ex1');
  if (ex1) {
    const G = new Graph(ex1, { width: 400, height: 400, xmin: -6, xmax: 6, ymin: -6, ymax: 6, xlabels: 5, ylabels: 5 });
    G.label(0, 0, T('O'), { pos: 'sw', gap: 4, cls: 'bk-ptlab' });
    [['A', 4, 3, 'ne'], ['B', -3, 5, 'ne'], ['C', -5, -2, 'sw'], ['D', 2, -4, 'se'], ['E', 0, -3, 'e'], ['F', -4, 0, 'n']]
      .forEach(([n, x, y, pos]) => G.point(x, y, { label: T(n), pos, color: 'ink', r: 6 }));
  }

  const ex2 = document.getElementById('fig-ex2c');
  if (ex2) {
    const G = new Graph(ex2, { width: 360, height: 430, xmin: 0, xmax: 6, ymin: 0, ymax: 18, ystep: 1, ylabels: 2, xtitle: 's', ytitle: 'M', fontSize: 16 });
    [[1, 4], [2, 7], [3, 10], [4, 13], [5, 16]].forEach(([s, m]) => G.point(s, m, { color: 'red', r: 6.5, cls: 'u5l1-ansdot' }));
  }

  const ex4 = document.getElementById('fig-ex4a');
  if (ex4) {
    const G = new Graph(ex4, { width: 430, height: 400, xmin: 0, xmax: 12, ymin: 0, ymax: 16, xstep: 1, ystep: 2, xlabels: 2, ylabels: 2, xtitle: 'V', ytitle: 'C', fontSize: 16 });
    const ans = (el) => { el.classList.add('u5l1-ansdot'); return el; };
    ans(G.segment([0, 0], [11, 15.95], { color: 'red', width: 3 }));
    ans(G.segment([5, 0], [5, 7.25], { color: 'red', width: 2, dash: '6 5' })); ans(G.segment([5, 7.25], [0, 7.25], { color: 'red', width: 2, dash: '6 5' }));
    ans(G.segment([7, 0], [7, 10.15], { color: 'red', width: 2, dash: '6 5' })); ans(G.segment([7, 10.15], [0, 10.15], { color: 'red', width: 2, dash: '6 5' }));
    [[2, 2.9], [4, 5.8], [6, 8.7], [8, 11.6], [10, 14.5]].forEach(([v, c]) => G.point(v, c, { color: 'red', r: 6, cls: 'u5l1-ansdot' }));
  }

  document.querySelectorAll('[data-dc]').forEach((el) => {
    const cont = el.dataset.dc === 'cont';
    const G = new Graph(el, { width: 230, height: 150, xmin: 0, xmax: 6, ymin: 0, ymax: 6, numbers: false, xtitle: '', ytitle: '', pad: [10, 12, 12, 14] });
    const pts = [[1, 1.5], [2, 2.25], [3, 3], [4, 3.75], [5, 4.5]];
    if (cont) G.segment([0, 0.75], [5.8, 5.1], { color: 'blue', width: 3.5 });
    pts.forEach(([x, y]) => G.point(x, y, { color: cont ? 'blue' : 'amber', r: 6 }));
    G.label(5.9, 0.4, cont ? 'joined' : 'dots only', { pos: 'nw', cls: 'u5l1-dclab', color: cont ? 'blue' : 'amber' });
  });
}

/* ================= explainer: plotting a point ================= */
const PP = {
  p: { label: T('P(5,\\ 2)'), pts: [['P', 5, 2]] },
  swap: { label: T('(2,\\ 5)') + ' vs ' + T('(5,\\ 2)'), pts: [['', 5, 2], ['', 2, 5]] },
  neg: { label: T('(-4,\\ -3)'), pts: [['', -4, -3]] },
  ex1: { label: 'Example 1 check', pts: [['A', 4, 3], ['B', -3, 5], ['C', -5, -2], ['D', 2, -4], ['E', 0, -3], ['F', -4, 0]] }
};
const ACROSS = (x) => (x > 0 ? `right ${x}` : x < 0 ? `left ${-x}` : 'no move');
const UPDOWN = (y) => (y > 0 ? `up ${y}` : y < 0 ? `down ${-y}` : 'no move');
const plotPoint = {
  title: 'Plotting a point: across, then up or down',
  height: 480,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(PP).map((k) => ({ v: k, label: PP[k].label })),
  intro: (k) => (k === 'ex1' ? 'Read each point of Example 1 as two moves from the origin. Press <b>Next</b>.'
    : 'Start at the origin. The <b>first</b> number moves you <b>across</b>; the <b>second</b> moves you <b>up or down</b>. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const d = PP[k], G = new Graph(stage, { x: 14, y: 10, width: 460, height: 460, xmin: -6, xmax: 6, ymin: -6, ymax: 6, xlabels: 1, ylabels: 1, fontSize: 15 });
    G.label(0, 0, T('O'), { pos: 'nw', gap: 3, cls: 'bk-ptlab' });
    const Pn = panel(stage, 500, 14, ex.W - 514, 452, k === 'ex1' ? 'Example 1 (a)' : 'Moves from the origin');
    if (k !== 'ex1') add(Pn, h('div', 'u5l1-rule', `${T('(x,\\ y)')}<br><b class="u5l1-amb">1st: across</b> · <b class="u5l1-pur">2nd: up or down</b>`), null);
    const tok = G.point(0, 0, { color: 'red', r: 9 }); hide(tok);
    let arrows = [];
    const moveX = async (c, p, keep) => {
      const [, x] = p; if (!keep) { G.remove(arrows); arrows = []; }
      G.moveTo(tok, 0, 0); tok.style.opacity = 1;
      if (!x) return;
      const s = G.segment([0, 0], [x, 0], { color: 'amber', width: 5, arrowB: true }), lab = G.label(x / 2, 0, ACROSS(x), { pos: p[2] >= 0 ? 's' : 'n', cls: 'u5l1-mvlab', color: 'amber' });
      arrows.push(s, lab); hide(lab);
      await Promise.all([G.drawIn(s, 800, c), G.move(c, tok, x, 0, 800)]); await fadeIn(c, lab, 250);
    };
    const moveY = async (c, p) => {
      const [, x, y] = p; if (!y) return;
      const s = G.segment([x, 0], [x, y], { color: 'purple', width: 5, arrowB: true }), lab = G.label(x, y / 2, UPDOWN(y), { pos: x >= 0 || x <= -4 ? 'e' : 'w', cls: 'u5l1-mvlab', color: 'purple' });
      arrows.push(s, lab); hide(lab);
      await Promise.all([G.drawIn(s, 700, c), G.move(c, tok, x, y, 700)]); await fadeIn(c, lab, 250);
    };
    const plot = async (c, p, color = 'blue') => {
      const [n, x, y] = p, pt = G.point(x, y, { color, r: 7, label: n ? T(`${n}(${texNum(x)},\\ ${texNum(y)})`) : T(pairTex(x, y)), pos: x <= -4 ? (y < 0 ? 's' : 'n') : x < 0 ? 'nw' : 'ne', labelColor: 'ink' });
      tok.style.opacity = 0; await G.reveal(pt, c);
    };
    if (k === 'ex1') {
      const steps = d.pts.map((p) => ({
        cap: `${T(p[0])}: ${p[1] ? `<b>${ACROSS(p[1])}</b>` : 'no move across'}, then ${p[2] ? `<b>${UPDOWN(p[2])}</b>` : 'no move up or down'}. ${T(`${p[0]}(${texNum(p[1])},\\ ${texNum(p[2])})`)} is ${where(p[1], p[2])}.`,
        run: async (c) => { await moveX(c, p); await moveY(c, p); await plot(c, p, 'ink'); await fadeIn(c, line(Pn, T(`${p[0]}(${texNum(p[1])},\\ ${texNum(p[2])})`))); }
      }));
      steps.push({ cap: `Quadrant II holds ${T('B(-3,\\ 5)')} and Quadrant IV holds ${T('D(2,\\ -4)')}: Example 1 (b) and (c). ${T('E')} and ${T('F')} sit on the axes.`,
        run: async (c) => { G.remove(arrows); arrows = []; await fadeIn(c, line(Pn, `(b) ${T('B(-3,\\ 5)')} &nbsp; (c) ${T('D(2,\\ -4)')}`, 'u5l1-hl')); } });
      return steps;
    }
    const steps = [];
    d.pts.forEach((p, i) => {
      const [, x, y] = p, col = i ? 'purple' : 'blue';
      steps.push({ cap: `${PT(x, y)}: the <b>${T('x')}-coordinate</b> is ${T(texNum(x))}, so move <b>${ACROSS(x)}</b>.`, run: (c) => moveX(c, p) });
      steps.push({ cap: `The <b>${T('y')}-coordinate</b> is ${T(texNum(y))}, so move <b>${UPDOWN(y)}</b>.`, run: (c) => moveY(c, p) });
      steps.push({ cap: k === 'swap' && i ? `${PT(2, 5)} lands somewhere <b>different</b> from ${PT(5, 2)}. Swap the numbers and you get a new point: the order matters. That is why it is an <b>ordered</b> pair.`
        : `Plot the point ${p[0] ? T(p[0]) + ' ' : ''}${PT(x, y)}. It is ${where(x, y)}.`,
      run: async (c) => { await plot(c, p, col); await fadeIn(c, line(Pn, `${p[0] ? T(p[0]) : ''}${PT(x, y)}: <b class="u5l1-amb">${ACROSS(x)}</b>, <b class="u5l1-pur">${UPDOWN(y)}</b>`)); } });
    });
    return steps;
  }
};

/* ================= explainer: quadrants ================= */
const QD = [null,
  { a: 0, b: 6, c: 0, d: 6, color: C.teal, sx: '+', sy: '+', place: 'top right', wx: 'right', wy: 'up' },
  { a: -6, b: 0, c: 0, d: 6, color: C.amber, sx: '-', sy: '+', place: 'top left', wx: 'left', wy: 'up' },
  { a: -6, b: 0, c: -6, d: 0, color: C.purple, sx: '-', sy: '-', place: 'bottom left', wx: 'left', wy: 'down' },
  { a: 0, b: 6, c: -6, d: 0, color: C.blue, sx: '+', sy: '-', place: 'bottom right', wx: 'right', wy: 'down' }];
const EX1 = [['A', 4, 3], ['B', -3, 5], ['C', -5, -2], ['D', 2, -4], ['E', 0, -3], ['F', -4, 0]];
const word = (s) => (s === '+' ? 'positive' : 'negative');
const quadrants = {
  title: 'The four quadrants',
  height: 470,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'q', label: 'The four quadrants' }, { v: 'ex1', label: 'Example 1 check' }],
  intro: (k) => (k === 'ex1' ? 'Sort the points of Example 1 into quadrants, and fill in the table of signs (part d). Press <b>Next</b>.'
    : 'The axes cut the plane into four <b>quadrants</b>. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const G = new Graph(stage, { x: 14, y: 10, width: 450, height: 450, xmin: -6, xmax: 6, ymin: -6, ymax: 6, xlabels: 2, ylabels: 2, fontSize: 15 });
    G.label(0, 0, T('O'), { pos: 'sw', gap: 3, cls: 'bk-ptlab' });
    const tb = new ValueTable(stage, { x: 500, y: 20, headers: [TH('Quadrant'), TH(T('x') + '-coord.'), TH(T('y') + '-coord.')],
      rows: [1, 2, 3, 4].map((q) => [{ html: '<b>' + ROMAN[q] + '</b>' }, { html: word(QD[q].sx) }, { html: word(QD[q].sy) }]),
      hide: (r, c) => c > 0, tap: false, cellW: Math.min(150, (ex.W - 520) / 3), cellH: 56, cls: 'u5l1-qvt' });
    const note = add(stage, box(h('div', 'u5l1-qnote'), ex.W - 514, 120), 500, 330);
    const ex1 = k === 'ex1';
    const pts = {};
    if (ex1) EX1.forEach(([n, x, y]) => { pts[n] = G.point(x, y, { label: T(n), pos: x < 0 ? 'nw' : 'ne', color: 'ink', r: 6 }); });
    const shade = async (c, q) => {
      const s = QD[q], [x0, y0] = G.toPx(s.a, s.d), [x1, y1] = G.toPx(s.b, s.c);
      const r = svgEl('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: s.color, 'fill-opacity': 0.13 }, G.layers.bg);
      const lab = G.label((s.a + s.b) / 2, (s.c + s.d) / 2 + (ex1 ? (q < 3 ? -1.6 : 1.6) : 0.5), `<b>${ROMAN[q]}</b>`, { cls: 'u5l1-qbig', color: s.color });
      const sg = ex1 ? null : G.label((s.a + s.b) / 2, (s.c + s.d) / 2 - 0.9, T(`(${s.sx},\\ ${s.sy})`), { cls: 'u5l1-qsign', color: s.color });
      hide(r, lab, sg);
      await Promise.all([appear(c, r, 500), pop(c, lab, 420)]); if (sg) await fadeIn(c, sg, 300);
      await tb.reveal(q - 1, 1, c); await tb.reveal(q - 1, 2, c);
    };
    let arc;
    const ccw = (c) => { // a counter-clockwise arrow I → II → III → IV around the origin
      const R = 1.5 * G.ux, [ox, oy] = G.toPx(0, 0), pts2 = [];
      for (let i = 0; i <= 40; i++) { const t = (35 + 290 * i / 40) * Math.PI / 180; pts2.push([ox + R * Math.cos(t), oy - R * Math.sin(t)]); }
      arc = svgEl('g', { class: 'bk-curve' }, G.layers.top); arc.style.color = C.red;
      svgEl('path', { class: 'bk-stroke', d: 'M' + pts2.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L'), fill: 'none', stroke: C.red, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, arc);
      const a = pts2[40], b = pts2[38]; arrowHead(arc, a[0], a[1], a[0] - b[0], a[1] - b[1], { width: 3.5, color: C.red, cls: 'bk-end bk-end1' });
      return drawIn(arc, 1100, c);
    };
    const say = (c, html) => { note.innerHTML = html; return fadeIn(c, note, 300); };
    if (!ex1) {
      const steps = [1, 2, 3, 4].map((q) => ({
        cap: `<b>Quadrant ${ROMAN[q]}</b> is the <b>${QD[q].place}</b>: ${QD[q].wx} and ${QD[q].wy}, so ${T('x')} is <b>${word(QD[q].sx)}</b> and ${T('y')} is <b>${word(QD[q].sy)}</b>.`,
        run: (c) => shade(c, q)
      }));
      steps.push({ cap: `The numbering goes <b>counter-clockwise</b>, starting at the top right.`, run: async (c) => { await ccw(c); await say(c, `I → II → III → IV<br><span class="muted">counter-clockwise, from the top right</span>`); } });
      steps.push({ cap: `The axes are <b>borders</b>, not regions. A point <b>on an axis</b>, like ${PT(0, 3)} or ${PT(-4, 0)}, is in <b>no quadrant</b>.`,
        run: async (c) => {
          const a = G.point(0, 3, { coords: true, pos: 'e', color: 'red' }), b = G.point(-4, 0, { coords: true, pos: 'n', color: 'red' });
          await G.reveal(a, c); await G.reveal(b, c); await say(c, `A coordinate of <b>0</b> puts the point <b>on an axis</b>: no quadrant.`);
        } });
      return steps;
    }
    const inQ = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
    const steps = [1, 2, 3, 4].map((q) => {
      const n = inQ[q], p = EX1.find((e) => e[0] === n);
      return {
        cap: `${T(`${n}(${texNum(p[1])},\\ ${texNum(p[2])})`)}: ${T('x')} is ${word(QD[q].sx)}, ${T('y')} is ${word(QD[q].sy)}, so it is in <b>Quadrant ${ROMAN[q]}</b>.` + (q === 2 ? ' That answers (b).' : q === 4 ? ' That answers (c).' : ''),
        run: async (c) => { await shade(c, q); await pulse(c, pts[n], 1.6); await say(c, `<b>${ROMAN[q]}:</b> ${T(`${n}(${texNum(p[1])},\\ ${texNum(p[2])})`)}`); }
      };
    });
    steps.push({ cap: `${T('E(0,\\ -3)')} and ${T('F(-4,\\ 0)')} lie <b>on the axes</b>: they are in no quadrant. The table of signs is part (d).`,
      run: async (c) => { await Promise.all([pulse(c, pts.E, 1.6), pulse(c, pts.F, 1.6)]); await say(c, `${T('E')} and ${T('F')}: on an axis, <b>no quadrant</b>.`); } });
    return steps;
  }
};

/* ================= explainer: growing the matchstick pattern ================= */
const matchGrow = {
  title: 'Growing the matchstick pattern',
  height: 370,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Figure 1 is a single square: <b>4 matchsticks</b>. Watch what each new square costs. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, u = 44, gap = 46, ns = [1, 2, 3, 4, 5];
    const tot = ns.reduce((a, n) => a + n * u, 0) + gap * 4; let x = (W - tot) / 2;
    const svg = add(stage, svgEl('svg', { class: 'u5l1-msvg', width: W, height: 140, viewBox: `0 0 ${W} 140` }), 0, 10);
    const figs = ns.map((n) => {
      const g = sticks(svg, n, x, 30, u), t = svgEl('text', { x: x + n * u / 2, y: 30 + u + 34, 'text-anchor': 'middle', class: 'u5l1-mcap' }, svg);
      t.textContent = 'Figure ' + n; g.cap = t; x += n * u + gap; hide(g, t); return g;
    });
    const tw = 270 + 5 * 84;
    const tb = new ValueTable(stage, { x: (W - tw) / 2, y: 176, layout: 'h', headers: [TH('Number of squares, ' + T('s')), TH('Matchsticks, ' + T('M'))],
      rows: ns.map((n) => [n, 3 * n + 1]), hide: 1, tap: false, cellW: 84, cellH: 54, headW: 270, diffs: true, diffSpace: 74 });
    const show = async (c, k) => {
      const g = figs[k - 1], news = g.groups[k - 1], olds = g.list.filter((s) => !news.includes(s));
      if (k > 1) paint(news, C.amber);
      g.style.opacity = 1; hide(...g.list, g.cap);
      await Promise.all([fadeIn(c, g.cap, 300), ...olds.map((s) => appear(c, s, 350))]);
      for (const s of k > 1 ? news : g.list) { await pop(c, s, 300); await sleep(c, 90); }
      await tb.reveal(k - 1, 1, c);
    };
    return [
      { cap: `<b>Figure 1:</b> one square, <b>4</b> matchsticks.`, run: (c) => show(c, 1) },
      { cap: `<b>Figure 2:</b> the new square <b>shares a side</b> with the first, so it needs only <b>3 new</b> matchsticks (amber): ${T('4+3=7')}.`, run: (c) => show(c, 2) },
      { cap: `<b>Figure 3:</b> 3 more again: ${T('7+3=10')}.`, run: (c) => show(c, 3) },
      { cap: `<b>Example 2 (a) and (b) check:</b> Figures 4 and 5 each add 3 more: <b>13</b> and <b>16</b> matchsticks.`, run: async (c) => { await show(c, 4); await show(c, 5); } },
      { cap: `Each time ${T('s')} goes up by 1, ${T('M')} goes up by <b>3</b>. A pattern that grows by the same amount every step is a <b>linear</b> pattern.`, run: (c) => tb.diffs(c, { col: 1 }) }
    ];
  }
};

/* ================= explainer: table → graph, join the dots? ================= */
const matchGraph = {
  title: 'Plot the table. Join the dots?',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Example 2 (c) and Example 3 (d) check. Press <b>Next</b>.',
  make(stage, v, ex) {
    const rows = [1, 2, 3, 4, 5].map((s) => [s, 3 * s + 1]);
    const G = new Graph(stage, { x: 10, y: 6, width: 440, height: 456, xmin: 0, xmax: 6, ymin: 0, ymax: 18, ystep: 1, ylabels: 2, xtitle: 's', ytitle: 'M', fontSize: 16 });
    const tb = new ValueTable(stage, { x: 466, y: 30, headers: ['s', 'M'], rows, tap: false, cellW: 78, cellH: 50 });
    const Pn = panel(stage, 638, 30, ex.W - 652, 410, 'Figure 2.5?');
    const fig = add(Pn, svgEl('svg', { width: 200, height: 110, viewBox: '0 0 200 110', class: 'u5l1-half' }), null);
    fig.style.position = 'relative'; hide(fig);
    const u = 46, g = sticks(fig, 2, 14, 22, u);
    const halfT = svgEl('line', { x1: 14 + 2 * u + 4, y1: 22, x2: 14 + 2.5 * u, y2: 22, stroke: WOOD, 'stroke-width': 5.5, 'stroke-linecap': 'round', 'stroke-dasharray': '6 6' }, fig);
    svgEl('line', { x1: 14 + 2 * u + 4, y1: 22 + u, x2: 14 + 2.5 * u, y2: 22 + u, stroke: WOOD, 'stroke-width': 5.5, 'stroke-linecap': 'round', 'stroke-dasharray': '6 6' }, fig);
    const q = svgEl('text', { x: 14 + 2.5 * u + 22, y: 22 + u / 2 + 12, class: 'u5l1-qmark' }, fig); q.textContent = '?';
    void g; void halfT;
    const pts = []; let L, mid, lq;
    return [
      { cap: `Each row of the table is an ordered pair ${T('(s,\\ M)')}. Plot them one at a time.`,
        run: async (c) => { for (let i = 0; i < rows.length; i++) { tb.highlight(i, true); const p = G.point(rows[i][0], rows[i][1], { color: 'blue', r: 7.5 }); pts.push(p); await G.reveal(p, c); await sleep(c, 160); tb.highlight(i, false); } } },
      { cap: `<b>Should we join the dots?</b> A line through them would also pass through points <b>in between</b>, like ${PT(2.5, 8.5)}…`,
        run: async (c) => {
          L = G.segment([0.5, 2.5], [5.5, 17.5], { color: 'gray', width: 3, dash: true }); await G.drawIn(L, 900, c);
          mid = G.point(2.5, 8.5, { color: 'red', open: true, r: 8 }); lq = G.label(2.5, 8.5, T('(2.5,\\ 8.5)'), { pos: 'nw', cls: 'bk-ptlab', color: 'red' });
          hide(lq); await pop(c, mid); await fadeIn(c, lq);
        } },
      { cap: `…which would mean <b>Figure 2.5</b>, built from <b>8.5 matchsticks</b>. There is no such thing!`,
        run: async (c) => { await fadeIn(c, fig, 400); const s = stamp(Pn, '✗ no Figure 2.5', { ok: false, size: 'sm' }); s.style.alignSelf = 'center'; await stampIn(c, s); } },
      { cap: `The number of squares can only be a <b>whole number</b>, so the in-between points mean nothing. Both variables are <b>discrete</b>: leave the points <b>unconnected</b>.`,
        run: async (c) => {
          await Promise.all([anim(c, L, [{ opacity: 1 }, { opacity: 0 }], 500), anim(c, mid, [{ opacity: 1 }, { opacity: 0 }], 500), anim(c, lq, [{ opacity: 1 }, { opacity: 0 }], 500)]);
          await Promise.all(pts.map((p) => pulse(c, p, 1.35)));
          const s = stamp(Pn, 'Discrete:<br>dots only', { ok: true, size: 'lg' }); s.style.alignSelf = 'center'; s.style.marginTop = '26px'; s.style.textAlign = 'center'; await stampIn(c, s);
        } }
    ];
  }
};

/* ================= explainer: where M = 3s + 1 comes from ================= */
const matchRule = {
  title: 'Counting the matchsticks: M = 3s + 1',
  height: 400,
  choices: [{ v: 4, label: T('s=4') + ': count the sticks' }, { v: 34, label: 'Example 3 (g) check: 34 squares' }, { v: 91, label: 'Example 3 (h) check: 91 matchsticks' }],
  intro: (v) => (v === 91 ? 'A row of squares uses <b>91 matchsticks</b>. How many squares? Work <b>backwards</b>. Press <b>Next</b>.'
    : `A row of <b>${v} squares</b>. How many matchsticks? Don’t count them one by one: count them in groups. Press <b>Next</b>.`),
  make(stage, v, ex) {
    const back = v === 91, n = back ? 30 : v, W = ex.W, u = Math.min(64, (W - 90) / n), x0 = (W - n * u) / 2, y0 = 54;
    const svg = add(stage, svgEl('svg', { class: 'u5l1-msvg', width: W, height: 200, viewBox: `0 0 ${W} 200` }), 0, 0);
    const g = sticks(svg, n, x0, y0, u);
    const head = add(stage, h('div', 'u5l1-mhead', back ? `<b>91</b> matchsticks · ${T('s=\\ ?')}` : `${T('s=' + n)} squares · ${T('M=\\ ?')}`), 20, 8);
    const one = add(stage, h('div', 'u5l1-onelab', '1'), x0 - 30, y0 + u / 2 - 16); hide(one);
    const by = y0 + u + 16, mx = x0 + n * u / 2;
    const brace = svgEl('path', { class: 'u5l1-brace', d: `M${x0 + 3} ${by}q0 10 10 10H${mx - 10}q10 0 10 10q0 -10 10 -10H${x0 + n * u - 13}q10 0 10 -10` }, svg); hide(brace);
    const bl = add(stage, h('div', 'u5l1-bracelab', `<b>${n}</b> groups of <b>3</b>`), mx, by + 26); bl.style.translate = '-50% 0'; hide(bl);
    const labs = n <= 8 ? g.groups.map((gr, i) => { const d = add(stage, h('div', 'u5l1-grplab', '3'), x0 + i * u + u / 2, y0 + u + 10); d.style.translate = '-50% 0'; return hide(d); }) : [];
    const eq = add(stage, box(h('div', 'u5l1-eqrow'), W - 40, 120), 20, 270);
    const put = (html, cls = '') => { const d = h('div', 'u5l1-eq ' + cls, html); eq.appendChild(d); hide(d); return d; };
    const tc = (col, s) => `\\textcolor{${col}}{${s}}`;
    const groups = async (c) => {
      const cols = [C.amber, C.purple];
      const ms = n > 10 ? 45 : 160;
      for (let i = 0; i < n; i++) { paint(g.groups[i], cols[i % 2]); if (!c.fast) await Promise.all(g.groups[i].map((s) => pop(c, s, 260))); if (labs[i]) await fadeIn(c, labs[i], 200); await sleep(c, ms); }
      if (!labs.length) { await appear(c, brace, 400); await fadeIn(c, bl, 300); }
    };
    if (!back) {
      const M = 3 * n + 1, e1 = put(T(`M=${tc(C.amber, '3')}s+${tc(C.teal, '1')}`), 'u5l1-eqbig'), e2 = put(T(`M=3(${n})+1`)), e3 = put(T(`=${3 * n}+1`)), e4 = put(T(`=\\boldsymbol{${M}}`), 'u5l1-eqans');
      return [
        { cap: `Start with the <b>1</b> matchstick on the far left.`, run: async (c) => { paint(g.first, C.teal); await pulse(c, g.first, 1.25); await pop(c, one); } },
        { cap: `Every square then adds a <b>⊐ of 3</b>: its top, bottom and right side. ${n} squares, ${n} groups of 3.`, run: groups },
        { cap: `So the number of matchsticks is <b>3 for every square, plus the 1</b> to start: ${T('M=3s+1')}. (Example 3 (e) and (f))`, run: (c) => fadeIn(c, e1) },
        { cap: `Substitute ${T('s=' + n)}: ${T(`M=3(${n})+1=${3 * n}+1=${M}`)} matchsticks.` + (n === 4 ? ' The table agrees: Figure 4 has 13.' : ''),
          run: async (c) => { await fadeIn(c, e2); await fadeIn(c, e3); await fadeIn(c, e4); head.innerHTML = `${T('s=' + n)} squares · ${T('M=' + M)}`; await pulse(c, head, 1.08); } }
      ];
    }
    const e1 = put(T(`91=3s+1`), 'u5l1-eqbig'), e2 = put(T(`3s=90`)), e3 = put(T(`s=\\boldsymbol{30}`), 'u5l1-eqans'), e4 = put(T(`\\text{Check: }3(30)+1=91\\ \\checkmark`), 'u5l1-eqchk');
    return [
      { cap: `Set the equation equal to 91: ${T('91=3s+1')}. Undo the steps in <b>reverse</b> order.`, run: (c) => fadeIn(c, e1) },
      { cap: `First take away the <b>1</b> starting stick: ${T('91-1=90')} matchsticks left, so ${T('3s=90')}.`,
        run: async (c) => { paint(g.first, C.teal); await pop(c, one); await anim(c, g.first, [{ opacity: 1 }, { opacity: 0.3 }], 400); await fadeIn(c, e2); } },
      { cap: `The other 90 come in <b>groups of 3</b>, one group per square: ${T('s=90\\div3=30')} squares.`,
        run: async (c) => { await groups(c); await fadeIn(c, e3); head.innerHTML = `<b>91</b> matchsticks · ${T('s=30')}`; await pulse(c, head, 1.08); } },
      { cap: `Check forwards: ${T('3(30)+1=90+1=91')} ✓`, run: (c) => fadeIn(c, e4) }
    ];
  }
};

/* ================= the gas graph (shared by three explainers) ================= */
const GAS = [[2, 2.9], [4, 5.8], [6, 8.7], [8, 11.6], [10, 14.5]];
const gasGraph = (stage, x, y, w, hh) => new Graph(stage, { x, y, width: w, height: hh, xmin: 0, xmax: 12, ymin: 0, ymax: 16, xstep: 1, ystep: 2, xlabels: 2, ylabels: 2, xtitle: 'V', ytitle: 'C', fontSize: 16 });

const gasLine = {
  title: 'Gasoline: join the points?',
  height: 470,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Example 4 (a) and (b) check: plot the table, then decide whether to join the points. Press <b>Next</b>.',
  make(stage, v, ex) {
    const G = gasGraph(stage, 10, 6, 470, 456);
    const tb = new ValueTable(stage, { x: 500, y: 24, headers: [TH(T('V') + ' (L)'), TH(T('C') + ' ($)')], rows: GAS.map(([a, b]) => [a, b.toFixed(2)]), tap: false, cellW: 96, cellH: 48 });
    const pw = ex.W - 714, pump = add(stage, box(h('div', 'u5l1-pump', `<div class="u5l1-ph">Pump</div><div class="u5l1-pl">Litres</div><div class="u5l1-pv" data-v>0.00</div><div class="u5l1-pl">Dollars</div><div class="u5l1-pv" data-c>$0.00</div>`), pw, 230), 714, 24);
    const pv = pump.querySelector('[data-v]'), pc = pump.querySelector('[data-c]');
    const setPump = (V) => { pv.textContent = (Math.round(V * 100) / 100).toFixed(2); pc.textContent = money(1.45 * V); };
    const out = add(stage, box(h('div', 'u5l1-stampbox'), pw, 150), 714, 290);
    let dot, L;
    return [
      { cap: `Each row is a point ${T('(V,\\ C)')}: plot the five points.`,
        run: async (c) => { for (let i = 0; i < GAS.length; i++) { tb.highlight(i, true); await G.reveal(G.point(GAS[i][0], GAS[i][1], { color: 'blue', r: 7.5 }), c); await sleep(c, 140); tb.highlight(i, false); } } },
      { cap: `<b>Join them?</b> Ask: can you buy an amount <b>in between</b>, like 2.37 L? Squeeze the pump handle…`,
        run: async (c) => {
          dot = G.point(0, 0, { color: 'red', r: 8 });
          await tween(c, 2200, (t) => { const V = 2.37 * t; G.moveTo(dot, V, 1.45 * V); setPump(V); });
          setPump(2.37); G.moveTo(dot, 2.37, 1.45 * 2.37);
        } },
      { cap: `Yes: 2.37 L costs ${money(1.45 * 2.37)}. <b>Every</b> in-between amount has a cost, so volume and cost are <b>continuous</b>. Join the points with a line.`,
        run: async (c) => { L = G.segment([0, 0], [11, 15.95], { color: 'blue', width: 3.5 }); await G.drawIn(L, 1100, c); } },
      { cap: `<b>Example 4 (b):</b> yes, it makes sense to join the points: the variables are <b>continuous</b>, so every point on the line means something.`,
        run: async (c) => { const s = stamp(out, 'Continuous:<br>join them', { ok: true }); s.style.textAlign = 'center'; await stampIn(c, s); } }
    ];
  }
};

const gasRead = {
  title: 'Reading the gas graph forwards and backwards',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'c', label: 'Example 4 (c) check: 5 L' }, { v: 'd', label: 'Example 4 (d) check: $10.15' }],
  intro: (k) => (k === 'c' ? 'How much do <b>5 L</b> cost? Read the graph <b>forwards</b>: from V up to the line, then across. Press <b>Next</b>.'
    : 'How many litres for <b>$10.15</b>? Read the graph <b>backwards</b>: from C across to the line, then down. Press <b>Next</b>.'),
  make(stage, k, ex) {
    const G = gasGraph(stage, 10, 6, 470, 456);
    G.segment([0, 0], [11, 15.95], { color: 'blue', width: 3.5 });
    GAS.forEach(([a, b]) => G.point(a, b, { color: 'blue', r: 6.5 }));
    const Pn = panel(stage, 510, 14, ex.W - 524, 440, 'Estimate, then check');
    const dash = (a, b) => G.segment(a, b, { color: 'amber', width: 3, dash: '7 6', arrowB: true });
    if (k === 'c') {
      let m;
      return [
        { cap: `Find <b>${T('V=5')}</b> on the horizontal axis.`, run: async (c) => { m = G.point(5, 0, { color: 'amber', r: 8 }); await pop(c, m); await pulse(c, m, 1.5); } },
        { cap: `Go <b>straight up</b> to the line.`, run: async (c) => { await G.drawIn(dash([5, 0], [5, 7.1]), 700, c); await G.reveal(G.point(5, 7.25, { color: 'red', r: 7.5 }), c); } },
        { cap: `Go <b>across</b> to the ${T('C')}-axis. It lands halfway between $5.80 and $8.70: about <b>$7.25</b>.`,
          run: async (c) => { await G.drawIn(dash([5, 7.25], [0.15, 7.25]), 700, c); const l = G.label(2.4, 7.25, T('C\\approx7.25'), { pos: 'n', cls: 'bk-ptlab', color: 'red' }); hide(l); await fadeIn(c, l); await fadeIn(c, line(Pn, `Graph: ${T('C\\approx\\$7.25')}`)); } },
        { cap: `<b>Example 4 (f):</b> check with the equation ${T('C=1.45V')}: ${T('C=1.45(5)=7.25')}. The estimate was exact.`,
          run: async (c) => { for (const s of [T('C=1.45V'), T('C=1.45(5)'), T('C=7.25')]) await fadeIn(c, line(Pn, s)); const st = stamp(Pn, '✓ $7.25', { ok: true, size: 'lg' }); st.style.alignSelf = 'center'; st.style.marginTop = '14px'; await stampIn(c, st); } }
      ];
    }
    let m;
    return [
      { cap: `Find <b>${T('C=10.15')}</b> on the vertical axis: between 8.70 and 11.60.`, run: async (c) => { m = G.point(0, 10.15, { color: 'amber', r: 8 }); await pop(c, m); await pulse(c, m, 1.5); } },
      { cap: `Go <b>across</b> to the line.`, run: async (c) => { await G.drawIn(dash([0, 10.15], [6.85, 10.15]), 700, c); await G.reveal(G.point(7, 10.15, { color: 'red', r: 7.5 }), c); } },
      { cap: `Go <b>straight down</b> to the ${T('V')}-axis: about <b>7 L</b>.`,
        run: async (c) => { await G.drawIn(dash([7, 10.15], [7, 0.2]), 700, c); const l = G.label(7, 4.5, T('V\\approx7'), { pos: 'e', cls: 'bk-ptlab', color: 'red' }); hide(l); await fadeIn(c, l); await fadeIn(c, line(Pn, `Graph: ${T('V\\approx7')} L`)); } },
      { cap: `<b>Example 4 (f):</b> check with the equation: ${T('10.15=1.45V')}, so ${T('V=10.15\\div1.45=7')} L ✓`,
        run: async (c) => { for (const s of [T('10.15=1.45V'), T('V=\\dfrac{10.15}{1.45}'), T('V=7')]) await fadeIn(c, line(Pn, s)); const st = stamp(Pn, '✓ 7 L', { ok: true, size: 'lg' }); st.style.alignSelf = 'center'; st.style.marginTop = '14px'; await stampIn(c, st); } }
    ];
  }
};

const gasRate = {
  title: 'The price per litre: C = 1.45V',
  height: 430,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Example 4 (e) and (g) check. Is every litre the same price? Press <b>Next</b>.',
  make(stage, v, ex) {
    const rows = GAS.map(([a, b]) => [a, b.toFixed(2), '1.45']);
    const tb = new ValueTable(stage, { x: 16, y: 24, layout: 'h', headers: [TH(T('V') + ' (L)'), TH(T('C') + ' ($)'), TH(T('C\\div V'))], rows, hide: 2, tap: false, cellW: 84, cellH: 52, headW: 112 });
    const eq = add(stage, box(h('div', 'u5l1-rate'), 540, 170), 16, 236);
    eq.innerHTML = `<div class="u5l1-rate-eq">${T('C=\\textcolor{#c27a0e}{1.45}\\,V')}</div><div class="u5l1-rate-k"><span class="u5l1-amb">1.45</span> = dollars per litre &nbsp;·&nbsp; ${T('V')} = litres</div>`;
    hide(eq);
    const Gw = ex.W - 600, G = new Graph(stage, { x: 590, y: 8, width: Gw, height: 412, xmin: 0, xmax: 6, ymin: 0, ymax: 9, xstep: 1, ystep: 1, xtitle: 'V', ytitle: 'C', fontSize: 16 });
    G.segment([0, 0], [6, 8.7], { color: 'blue', width: 3.5 });
    G.point(2, 2.9, { color: 'blue', r: 6.5 }); G.point(4, 5.8, { color: 'blue', r: 6.5 });
    return [
      { cap: `Divide each cost by its volume: ${T('2.90\\div2')}, ${T('5.80\\div4')}, …`, run: (c) => tb.fill(c, { col: 2 }) },
      { cap: `Every column gives <b>1.45</b>: the cost of <b>one litre</b> never changes.`, run: async (c) => { tb.highlightCol(2, true); await sleep(c, 300); } },
      { cap: `So the cost is always <b>1.45 times the volume</b>: ${T('C=1.45V')}. That is Example 4 (e).`, run: (c) => fadeIn(c, eq, 450) },
      { cap: `<b>Example 4 (g):</b> 1.45 is the <b>price per litre</b>. On the graph, every <b>1 L</b> across adds <b>$1.45</b> up.`,
        run: async (c) => {
          const a = G.segment([2, 2.9], [3, 2.9], { color: 'amber', width: 4 }), b = G.segment([3, 2.9], [3, 4.35], { color: 'purple', width: 4, arrowB: true });
          await G.drawIn(a, 500, c); const la = G.label(2.5, 2.9, '1 L', { pos: 's', cls: 'u5l1-mvlab', color: 'amber' }); hide(la); await fadeIn(c, la, 250);
          await G.drawIn(b, 500, c); const lb = G.label(3, 3.6, '+$1.45', { pos: 'e', cls: 'u5l1-mvlab', color: 'purple' }); hide(lb); await fadeIn(c, lb, 250);
          const a2 = G.segment([4, 5.8], [5, 5.8], { color: 'amber', width: 4 }), b2 = G.segment([5, 5.8], [5, 7.25], { color: 'purple', width: 4, arrowB: true });
          await G.drawIn(a2, 400, c); await G.drawIn(b2, 400, c); const lb2 = G.label(5, 6.5, '+$1.45', { pos: 'e', cls: 'u5l1-mvlab', color: 'purple' }); hide(lb2); await fadeIn(c, lb2, 250);
        } }
    ];
  }
};

/* ================= explainer: zoom in — gaps or no gaps? ================= */
const zoomIn = {
  title: 'Zoom in: gaps or no gaps?',
  height: 400,
  intro: 'Squares are <b>counted</b>; gasoline is <b>measured</b>. Look closely at the values in between. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W - 40;
    const mk = (min, max, step, y) => new NumberLine(stage, { x: 20, y, width: W, height: 110, min, max, step, labelStep: step, arrows: true, fontSize: 18 });
    const tl = add(stage, h('div', 'u5l1-nlh u5l1-amb', `Number of squares, ${T('s')} · <b>discrete</b>`), 30, 18);
    const bl = add(stage, h('div', 'u5l1-nlh u5l1-blu', `Volume of gas, ${T('V')} (L) · <b>continuous</b>`), 30, 200);
    const A = [mk(0, 6, 1, 52), mk(2, 3, 0.1, 52), mk(2.3, 2.4, 0.01, 52)], B = [mk(0, 6, 1, 234), mk(2, 3, 0.1, 234), mk(2.3, 2.4, 0.01, 234)];
    [A[1], A[2], B[1], B[2]].forEach((n) => hide(n.el));
    const zoomBadge = add(stage, h('div', 'u5l1-zoom', '×1'), ex.W - 120, 16);
    const swap = async (c, i, label) => {
      await Promise.all([anim(c, A[i - 1].el, [{ opacity: 1, transform: 'scaleX(1)' }, { opacity: 0, transform: 'scaleX(2.5)' }], 450), anim(c, B[i - 1].el, [{ opacity: 1, transform: 'scaleX(1)' }, { opacity: 0, transform: 'scaleX(2.5)' }], 450)]);
      [A[i - 1].el, B[i - 1].el].forEach((e) => (e.style.visibility = 'hidden'));
      zoomBadge.textContent = label; await pop(c, zoomBadge, 300);
      await Promise.all([appear(c, A[i].el, 350), appear(c, B[i].el, 350)]);
    };
    return [
      { cap: `You <b>count</b> squares: 1, 2, 3, … Only <b>whole numbers</b> are allowed.`,
        run: async (c) => { for (let s = 1; s <= 6; s++) await pop(c, A[0].point(s, { color: 'amber', r: 9 }), 260); } },
      { cap: `You <b>measure</b> gasoline: <b>any</b> amount from 0 L up is possible.`, run: (c) => B[0].drawIn(B[0].interval(0, Infinity, { color: 'blue', width: 9 }), 900, c) },
      { cap: `Zoom in between <b>2 and 3</b>. Squares: nothing at all in between (no Figure 2.5). Volume: 2.37 L, 2.5 L, 2.81 L… every value is still there.`,
        run: async (c) => {
          await swap(c, 1, '×10');
          await Promise.all([pop(c, A[1].point(2, { color: 'amber', r: 9 })), pop(c, A[1].point(3, { color: 'amber', r: 9 }))]);
          const gap = A[1].mark(2.5, '<b>gap</b>: no squares here', { color: 'amber' }); hide(gap); await fadeIn(c, gap);
          await B[1].drawIn(B[1].interval(-Infinity, Infinity, { color: 'blue', width: 9 }), 700, c);
          for (const x of [2.37, 2.5, 2.81]) { const m = B[1].mark(x, String(x), { color: 'blue', lift: 6 }); hide(m); await fadeIn(c, m, 220); }
        } },
      { cap: `Zoom in again, between <b>2.3 and 2.4</b>. Still no gaps in volume: 2.37, 2.375, 2.3751, … A <b>continuous</b> variable never runs out of in-between values.`,
        run: async (c) => {
          await swap(c, 2, '×100');
          const none = A[2].mark(2.35, 'no whole numbers anywhere here', { color: 'amber' }); hide(none); await fadeIn(c, none);
          await B[2].drawIn(B[2].interval(-Infinity, Infinity, { color: 'blue', width: 9 }), 700, c);
          for (const [x, lift] of [[2.37, 6], [2.375, 36]]) { const m = B[2].mark(x, String(x), { color: 'blue', lift }); hide(m); await fadeIn(c, m, 220); }
        } },
      { cap: `<b>Discrete:</b> separate values with <b>gaps</b>, so the graph is separate dots. <b>Continuous:</b> <b>no gaps</b>, so the points are joined.`,
        run: async (c) => { await pulse(c, tl, 1.08); await pulse(c, bl, 1.08); } }
    ];
  }
};

/* ================= explainer: count or measure? ================= */
const SORT = {
  try: { label: 'Count or measure?', items: [
    ['goals scored in a hockey game', 'D', 'You <b>count</b> goals: 0, 1, 2, … There is no such thing as 1.5 goals.'],
    ['length of a phone call', 'C', 'Time is <b>measured</b>: a call can last 3 min 12.4 s, or any time in between.'],
    ['number of people on a bus', 'D', 'You <b>count</b> people: whole numbers only.'],
    ['mass of a backpack', 'C', 'Mass is <b>measured</b>: 6.25 kg, 6.251 kg, … any value in a range.']] },
  ex5: { label: 'Example 5 check', items: [
    ['(a) number of pages in a book', 'D', 'A book has a whole number of pages, with nothing in between: <b>discrete</b>.'],
    ['(b) time taken to run a marathon', 'C', 'Time can be any value, down to fractions of a second (3 h 17 min 42.6 s): <b>continuous</b>.'],
    ['(c) number of siblings a person has', 'D', 'A whole-number count: there is no such thing as 2.5 siblings. <b>Discrete</b>.'],
    ['(d) volume of water in a bathtub', 'C', 'The volume can take any value in a range (73.4 L): <b>continuous</b>.']] }
};
const sortVars = {
  title: 'Discrete or continuous?',
  height: 420,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SORT).map((k) => ({ v: k, label: SORT[k].label })),
  intro: 'Each card asks: do you <b>count</b> it or <b>measure</b> it? Guess before each reveal. Press <b>Next</b>.',
  make(stage, k, ex) {
    const W = ex.W, bw = (W - 60) / 2, by = 140, bh = 270;
    const bins = [['D', 'Discrete', 'count it · dots', 'u5l1-binD', 20], ['C', 'Continuous', 'measure it · joined', 'u5l1-binC', 40 + bw]].map(([id, t, s, cls, x]) => {
      const b = add(stage, box(h('div', 'u5l1-bin ' + cls, `<div class="u5l1-binh"><b>${t}</b> <span>${s}</span></div>`), bw, bh), x, by); b.x = x; b.n = 0; b.id = id; return b;
    });
    const steps = [];
    SORT[k].items.forEach(([txt, kind, why]) => {
      let card;
      steps.push({ cap: `<b>${txt.replace(/^\(\w\) /, '')}</b>: count it or measure it? Discrete or continuous?`,
        run: async (c) => { card = add(stage, box(h('div', 'u5l1-card', txt), 420, null), (W - 420) / 2, 30); card.style.transformOrigin = '0 0'; await pop(c, card, 380); } });
      steps.push({ cap: why,
        run: async (c) => {
          const b = bins.find((q) => q.id === kind), tx = b.x + 14, ty = by + 54 + b.n * 74; b.n++;
          const dx = tx - (W - 420) / 2, dy = ty - 30;
          await anim(c, card, [{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(.78)` }], 650);
          card.classList.add(kind === 'D' ? 'u5l1-cardD' : 'u5l1-cardC');
        } });
    });
    steps.push({ cap: `<b>Count it → discrete</b> (separate dots on a graph). <b>Measure it → continuous</b> (join the points).`, run: async (c) => { await Promise.all(bins.map((b) => pulse(c, b, 1.03))); } });
    return steps;
  }
};

/* ================= mount ================= */
mountBattleship();
mountFigures();
export const explainers = mountExplainers({ plotPoint, quadrants, matchGrow, matchGraph, matchRule, gasLine, gasRead, gasRate, zoomIn, sortVars });

/* ---------- Math History (the brown box): Descartes' fly (a legend) ----------
 * A fly wanders over a tiled ceiling. At each stop, dashed lines measure how many tiles it is from the left wall (x) and
 * from the bottom wall (y), and the ordered pair appears: (3, 4), then (10, 5), then (7, 2). */
(function flyOnCeiling() {
  const svg = document.getElementById('fly-anim'); if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k])); (parent || svg).appendChild(e); return e; };
  const txt = (s, attrs, parent) => { const e = mk('text', attrs, parent); e.textContent = s; return e; };
  const T = 30, GX = 52, GY = 24, NX = 11, NY = 7; // tiles of 30; the corner (0, 0) is at the bottom left
  const X = (x) => GX + x * T, Y = (y) => GY + (NY - y) * T;
  // the ceiling tiles, the two walls, the tile counts
  mk('rect', { x: GX, y: GY, width: NX * T, height: NY * T, class: 'u5l1h-ceil' });
  for (let i = 1; i < NX; i++) mk('line', { x1: X(i), x2: X(i), y1: GY, y2: Y(0), class: 'u5l1h-grid' });
  for (let j = 1; j < NY; j++) mk('line', { x1: GX, x2: X(NX), y1: Y(j), y2: Y(j), class: 'u5l1h-grid' });
  mk('rect', { x: GX - 9, y: GY, width: 9, height: NY * T + 9, class: 'u5l1h-wall' });
  mk('rect', { x: GX - 9, y: Y(0), width: NX * T + 9, height: 9, class: 'u5l1h-wall' });
  for (let i = 1; i <= NX; i++) txt(String(i), { x: X(i), y: Y(0) + 25, 'text-anchor': 'middle', class: 'u5l1h-num' });
  for (let j = 1; j <= NY; j++) txt(String(j), { x: GX - 15, y: Y(j) + 4.5, 'text-anchor': 'end', class: 'u5l1h-num' });
  txt('bottom wall', { x: X(NX / 2), y: 290, 'text-anchor': 'middle', class: 'u5l1h-wl' });
  txt('left wall', { x: 0, y: 0, 'text-anchor': 'middle', class: 'u5l1h-wl', transform: `translate(14 ${Y(NY / 2)}) rotate(-90)` });
  // the measuring lines and the readout
  const trail = mk('polyline', { class: 'u5l1h-trail', points: '' });
  const mx = mk('line', { class: 'u5l1h-mx' }), my = mk('line', { class: 'u5l1h-my' });
  const lx = txt('', { 'text-anchor': 'middle', class: 'u5l1h-lx' }), ly = txt('', { class: 'u5l1h-ly' });
  const RX = 420;
  txt('THE FLY IS AT', { x: RX, y: 64, class: 'u5l1h-cap' });
  const pair = txt('', { x: RX, y: 112, class: 'u5l1h-pair' });
  const p0 = mk('tspan', {}, pair), px = mk('tspan', { class: 'u5l1h-cx' }, pair), p1 = mk('tspan', {}, pair), py = mk('tspan', { class: 'u5l1h-cy' }, pair), p2 = mk('tspan', {}, pair);
  p0.textContent = '('; p1.textContent = ', '; p2.textContent = ')';
  const rx = txt('', { x: RX, y: 146, class: 'u5l1h-rx' }), ry = txt('', { x: RX, y: 168, class: 'u5l1h-ry' });
  const hint = txt('across first, then up', { x: RX, y: 204, class: 'u5l1h-hint' });
  // the fly
  const fly = mk('g', { class: 'u5l1h-fly' });
  const body = mk('g', {}, fly);
  mk('ellipse', { cx: -3, cy: -6, rx: 4.5, ry: 9, transform: 'rotate(-28 -3 -6)', class: 'u5l1h-wing' }, body);
  mk('ellipse', { cx: -3, cy: 6, rx: 4.5, ry: 9, transform: 'rotate(28 -3 6)', class: 'u5l1h-wing' }, body);
  mk('ellipse', { cx: -2, cy: 0, rx: 9, ry: 5, fill: '#3d2817' }, body);
  mk('circle', { cx: 8, cy: 0, r: 4.2, fill: '#2b1b0e' }, body);
  mk('circle', { cx: 9.5, cy: -2.6, r: 1.6, fill: '#c0392b' }, body); mk('circle', { cx: 9.5, cy: 2.6, r: 1.6, fill: '#c0392b' }, body);
  // the flight: three legs, each a smooth wiggly curve ending at a whole-number stop
  const LEGS = [
    [[5.5, 7.3], [6.6, 6.1], [4.4, 5.6], [3.4, 4.9], [3, 4]],
    [[3, 4], [4.6, 2.3], [7.6, 2.9], [8.9, 4.4], [10, 5]],
    [[10, 5], [9.4, 6.4], [6.6, 5.6], [5.6, 3.4], [7, 2]],
  ];
  const STOPS = LEGS.map((l) => l[l.length - 1]);
  const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
  const along = (pts, u) => { // Catmull–Rom through the points, u from 0 to 1
    const n = pts.length - 1, s = Math.min(n - 1e-9, u * n), i = Math.floor(s), t = s - i;
    const P = (k) => pts[Math.max(0, Math.min(n, k))];
    return [0, 1].map((c) => cr(P(i - 1)[c], P(i)[c], P(i + 1)[c], P(i + 2)[c], t));
  };
  const FLY = 1900, STAY = 2300, END = LEGS.length * (FLY + STAY);
  let ang = 200;
  const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  function draw(ms) {
    const leg = Math.min(LEGS.length - 1, Math.floor(ms / (FLY + STAY))), into = ms - leg * (FLY + STAY);
    const moving = into < FLY && ms < END, u = moving ? ease(into / FLY) : 1;
    const [x, y] = along(LEGS[leg], u);
    if (moving) { const [x2, y2] = along(LEGS[leg], Math.min(1, u + 0.02)); if (Math.hypot(x2 - x, y2 - y) > 1e-4) ang = (Math.atan2(-(y2 - y), x2 - x) * 180) / Math.PI; }
    fly.setAttribute('transform', `translate(${X(x).toFixed(1)} ${Y(y).toFixed(1)}) rotate(${ang.toFixed(1)}) scale(1.25)`);
    fly.classList.toggle('moving', moving);
    // trail of this leg so far
    const pts = []; for (let k = 0; k <= 40; k++) { const v = (k / 40) * u; const [a, b] = along(LEGS[leg], v); pts.push(`${X(a).toFixed(1)},${Y(b).toFixed(1)}`); }
    trail.setAttribute('points', pts.join(' '));
    // at a stop: grow the measuring lines, then show the numbers and the pair
    const [sx, sy] = STOPS[leg], g = moving ? 0 : Math.min(1, (into - FLY) / 600), show = !moving && into - FLY > 650;
    mx.setAttribute('x1', X(sx)); mx.setAttribute('y1', Y(sy)); mx.setAttribute('x2', X(sx) - (X(sx) - GX) * g); mx.setAttribute('y2', Y(sy));
    my.setAttribute('x1', X(sx)); my.setAttribute('y1', Y(sy)); my.setAttribute('x2', X(sx)); my.setAttribute('y2', Y(sy) + (Y(0) - Y(sy)) * g);
    mx.style.opacity = my.style.opacity = moving ? 0 : 1;
    lx.textContent = String(sx); lx.setAttribute('x', (X(sx) + GX) / 2); lx.setAttribute('y', Y(sy) - 8);
    ly.textContent = String(sy); ly.setAttribute('x', X(sx) + 8); ly.setAttribute('y', (Y(sy) + Y(0)) / 2 + 5);
    [lx, ly].forEach((e) => e.classList.toggle('on', show));
    px.textContent = String(sx); py.textContent = String(sy);
    [pair, rx, ry, hint].forEach((e) => e.classList.toggle('on', show));
    rx.textContent = `${sx} from the left wall`; ry.textContent = `${sy} from the bottom wall`;
  }
  let t0 = 0, raf = 0;
  function frame(now) { if (!t0) t0 = now; const ms = now - t0; draw(ms); if (ms < END) raf = requestAnimationFrame(frame); }
  function play() {
    cancelAnimationFrame(raf); t0 = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(END); return; }
    raf = requestAnimationFrame(frame);
  }
  draw(0);
  svg.addEventListener('click', play);
  const btn = svg.closest('.hist-anim') && svg.closest('.hist-anim').querySelector('.hist-play'); if (btn) btn.addEventListener('click', play);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.5 });
    io.observe(svg);
  } else play();
})();
