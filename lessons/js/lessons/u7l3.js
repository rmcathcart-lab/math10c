/* Math 10C · Unit 7 · Lesson 3 — The General Form of a Linear Equation.
 * Warm-up ticket counter, and the explainers:
 *   tidyUp (the tidy-up machine: clear fractions × LCD on every term, move everything left, fix the sign, divide out a
 *   common factor; live rule checklist; Example 1 checks), costumes (one line, six equations; the rules leave exactly
 *   one), solveY (isolate By, divide by B; m = −A/B and b = −C/B; Example 2(a)(b) checks and the general rule),
 *   cover (cover x → y-intercept, cover y → x-intercept, join them), sameInt (Example 2(c): the family 6x − ky − 9 = 0
 *   pivots about (1.5, 0) until its y-intercept is 3), perp (flip the slope triangle a quarter-turn; Example 3 check),
 *   build (Example 4: target slope, target y-intercept, assemble, convert), judge (Example 5: three statements).
 * Colours: run amber, rise purple, lines brand blue, y-intercept green, x-intercept magenta.
 * Equation tiles: x-terms teal, y-terms blue, constants gray. */
import {
  h, tex, add, box, Graph, stamp, stampIn, mountExplainers, anim, pop, fadeIn, appear, sleep, tween,
  pairTex, texNum, liveCtx, pulse, shake, rightMark, COLORS
} from '../blocks.js';

const T = (s) => tex(s);
const RUN = COLORS.amber, RISE = COLORS.purple, LINE = COLORS.blue, YI = COLORS.green, XI = '#b8327a', INK = COLORS.ink,
  GRAY = '#8a909c', TEAL = COLORS.teal, ORANGE = COLORS.orange, NEG = COLORS.red;
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => a / gcd(a, b) * b;
/** reduced [n, d] with d > 0 */
const red = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return [n / g, d / g]; };
/** TeX of a reduced fraction (sign in front); whole numbers plain */
const fr = (n, d = 1, big = true) => { const [a, b] = red(n, d); if (b === 1) return String(a); return (a < 0 ? '-' : '') + `\\${big ? 'd' : 't'}frac{${Math.abs(a)}}{${b}}`; };
const n = (v) => texNum(v).replace('-', '−');
const hide = (el) => { if (el) el.style.opacity = 0; return el; };
const show = (c, el) => fadeIn(c, el, 320);
const fadeOut = (c, el, ms = 260) => (el ? anim(c, el, [{ opacity: 1 }, { opacity: 0 }], ms) : Promise.resolve());
const panel = (stage, x, y, w, hh, title, cls = '') => add(stage, box(h('div', 'u7l3-panel ' + cls, title ? `<div class="u7l3-ph">${title}</div>` : ''), w, hh), x, y);
const line = (p, html, cls = '') => { const d = h('div', 'u7l3-line ' + cls, html); p.appendChild(d); return d; };
/** TeX of a sum of terms [[n, d, v]…] (zeros dropped), e.g. 3x-5y+10 */
function polyTex(terms, big = false) {
  let s = '';
  terms.forEach(([a, b, v]) => {
    const [p, q] = red(a, b); if (!p) return;
    const m = Math.abs(p), mag = q === 1 ? (m === 1 && v ? '' : String(m)) : `\\${big ? 'd' : 't'}frac{${m}}{${q}}`;
    s += (s ? (p < 0 ? '-' : '+') : (p < 0 ? '-' : '')) + mag + v;
  });
  return s || '0';
}
/** Ax + By + C = 0 as TeX */
const gf = (A, B, C) => polyTex([[A, 1, 'x'], [B, 1, 'y'], [C, 1, '']]) + '=0';
/** draw the line Ax + By + C = 0 */
const lineGF = (G, A, B, C, o = {}) => (B ? G.line({ m: -A / B, b: -C / B }, o) : G.line({ x: -C / A }, o));
/** intersection of two general-form lines */
const meet = ([a1, b1, c1], [a2, b2, c2]) => { const D = a1 * b2 - a2 * b1; return [(b1 * c2 - b2 * c1) / D, (c1 * a2 - c2 * a1) / D]; };
/** right-angle mark where two lines (slopes m1, m2; null = vertical) meet at X */
function rmark(G, X, m1, m2, o = {}) {
  const dir = (m) => (m == null ? [0, 1] : [1, m]), V = G.toPx(X[0], X[1]);
  const [d1, d2] = [dir(m1), dir(m2)], s1 = o.s1 || 1, s2 = o.s2 || 1;
  const P = G.toPx(X[0] + d1[0] * s1, X[1] + d1[1] * s1), Q = G.toPx(X[0] + d2[0] * s2, X[1] + d2[1] * s2);
  return rightMark(G.layers.top, V, P, Q, 15, { color: o.color || INK, width: 2.2 });
}
/** slope triangle from P: run leg (amber) then rise leg (purple); labels outside */
function tri(G, P, run, rise, o = {}) {
  const Q = [P[0] + run, P[1]], R = [Q[0], P[1] + rise];
  const a = G.segment(P, Q, { color: RUN, width: 5 }), b = G.segment(Q, R, { color: RISE, width: 5 });
  const lab = (v) => (Number.isInteger(v) ? n(v) : T(fr(Math.round(v * 3000), 3000)));
  const la = G.label((P[0] + Q[0]) / 2, P[1], `<b>run</b> ${o.runText || lab(run)}`, { pos: o.runPos || (rise > 0 ? 's' : 'n'), cls: 'bk-ptlab u7l3-tl u7l3-trun', gap: 6 });
  const lb = G.label(Q[0], (Q[1] + R[1]) / 2, `<b>rise</b> ${o.riseText || lab(rise)}`, { pos: o.risePos || (run > 0 ? 'e' : 'w'), cls: 'bk-ptlab u7l3-tl u7l3-trise', gap: 6 });
  const els = [a, b, la, lb];
  return {
    els, a, b, la, lb,
    async draw(c, ms = 420) { hide(la); hide(lb); await G.drawIn(a, ms, c); await fadeIn(c, la, 200); await G.drawIn(b, ms, c); await fadeIn(c, lb, 200); }
  };
}

/* =============================================================================================================
 * Equation tiles: each term is a tile that can slide across the = sign (changing sign mid-air), take a ×k badge,
 * be covered by a sticky note, or carry an A / B / C label. A state is { L: [tile…], R: [tile…] };
 * tile = { id, n, d, v ('x' | 'y' | ''), sym? (TeX for the size of the coefficient, for letters) }.
 * ============================================================================================================= */
const FLASH = [{ background: '#ffd9d3', borderColor: '#c93a33' }, { background: '#ffd9d3', borderColor: '#c93a33', offset: 0.5 }, { background: '', borderColor: '' }];
class TileEq {
  constructor(stage, o) {
    this.o = o; this.W = o.width; this.H = o.h || 64;
    this.el = add(stage, box(h('div', 'u7l3-eqrow' + (o.cls ? ' ' + o.cls : '')), this.W, this.H), o.x, o.y);
    this.meas = h('div', 'u7l3-tile u7l3-meas'); this.el.appendChild(this.meas);
    this.tiles = {}; this.extras = [];
  }
  texOf(t, first) {
    const neg = t.n < 0;
    let mag;
    if (t.sym != null) mag = t.sym;
    else { const [p, q] = red(Math.abs(t.n), t.d || 1); mag = q === 1 ? (p === 1 && t.v ? '' : String(p)) : `\\dfrac{${p}}{${q}}`; }
    return (first ? (neg ? '-' : '') : (neg ? '-\\,' : '+\\,')) + mag + (t.v || '');
  }
  layout(st) {
    const items = [];
    const side = (arr, s) => { if (!arr.length) items.push({ id: 'z' + s, tex: '0', side: s, kind: 'z' }); else arr.forEach((t, i) => items.push({ id: t.id, tex: this.texOf(t, i === 0), side: s, kind: t.v || 'c' })); };
    side(st.L, 'L'); items.push({ id: 'eq', tex: '=', side: 'M', kind: 'eq' }); side(st.R, 'R');
    let tot = 0;
    items.forEach((it) => { this.meas.className = 'u7l3-tile u7l3-meas u7l3-k' + it.kind; this.meas.innerHTML = T(it.tex); it.w = this.meas.offsetWidth || 60; tot += it.w; });
    const gap = this.o.gap ?? 10; tot += gap * (items.length - 1);
    let x = this.o.align === 'left' ? 4 : (this.W - tot) / 2;
    items.forEach((it) => { it.x = x; x += it.w + gap; });
    return items;
  }
  mk(it) {
    const el = h('div', 'u7l3-tile u7l3-k' + it.kind, T(it.tex));
    el.tex = it.tex; el.side = it.side; el.x = it.x; el.w = it.w; el.style.left = it.x + 'px'; el.style.top = '0px';
    this.el.appendChild(el); return el;
  }
  render(st) {
    Object.values(this.tiles).forEach((e) => e.remove()); this.tiles = {}; this.state = st;
    this.layout(st).forEach((it) => { this.tiles[it.id] = this.mk(it); });
  }
  async morph(c, st, o = {}) {
    const items = this.layout(st), old = Object.assign({}, this.tiles), next = {}, moves = [];
    items.forEach((it) => {
      let el = old[it.id];
      if (el) {
        delete old[it.id];
        const crossed = el.side !== it.side && it.side !== 'M';
        if (!crossed && el.tex !== it.tex) { el.innerHTML = T(it.tex); el.tex = it.tex; el.changed = true; }
        moves.push({ el, x0: el.x, x1: it.x, crossed, tex: it.tex });
      } else { el = this.mk(it); hide(el); moves.push({ el, x0: it.x, x1: it.x, fresh: true }); }
      el.side = it.side; el.w = it.w; next[it.id] = el;
    });
    const gone = Object.values(old);
    this.tiles = next; this.state = st;
    await Promise.all(gone.map((el) => fadeOut(c, el, 260)));
    gone.forEach((el) => el.remove());
    const lift = o.lift ?? 58;
    await tween(c, o.ms || 1000, (t) => {
      moves.forEach((m) => {
        if (m.fresh) return;
        m.el.style.left = (m.x0 + (m.x1 - m.x0) * t) + 'px';
        if (m.crossed) {
          m.el.style.top = (t >= 1 ? 0 : -Math.sin(Math.PI * t) * lift) + 'px';
          if (t >= 0.5 && !m.swapped) { m.swapped = true; m.el.innerHTML = T(m.tex); m.el.tex = m.tex; anim(c, m.el, FLASH, 900); }
        }
      });
    });
    moves.forEach((m) => { m.el.x = m.x1; m.el.style.top = '0px'; });
    const fresh = moves.filter((m) => m.fresh).map((m) => m.el), changed = moves.filter((m) => m.el.changed).map((m) => m.el);
    changed.forEach((e) => { e.changed = false; });
    await Promise.all([...fresh.map((e) => pop(c, e, 320)), ...changed.map((e) => pulse(c, e, 1.1, 380))]);
  }
  /** a small badge (×5, ÷(−4) …) above every tile except = */
  async badges(c, texStr) {
    const bs = Object.entries(this.tiles).filter(([id]) => id !== 'eq').map(([, el]) => {
      const b = h('div', 'u7l3-badge', T(texStr)); this.el.appendChild(b);
      b.style.left = (el.x + el.w / 2) + 'px'; b.style.top = '-36px'; hide(b); return b;
    });
    for (const b of bs) await pop(c, b, 240);
    await sleep(c, 250);
    return bs;
  }
  async unbadge(c, bs) { await Promise.all(bs.map((b) => fadeOut(c, b, 220))); bs.forEach((b) => b.remove()); }
  /** labels under tiles: { id: html } */
  async labels(c, map, cls = '') {
    const out = [];
    for (const [id, html] of Object.entries(map)) {
      const el = this.tiles[id]; if (!el) continue;
      const d = h('div', 'u7l3-under ' + cls, html); this.el.appendChild(d);
      d.style.left = (el.x + el.w / 2) + 'px'; d.style.top = (this.H + 6) + 'px'; hide(d); out.push(d);
      await pop(c, d, 260);
    }
    this.extras.push(...out); return out;
  }
  clearLabels() { this.extras.forEach((e) => e.remove()); this.extras = []; }
  /** a sticky note covering a tile */
  coverCard(id, text) {
    const d = h('div', 'u7l3-cover', `<span>${text}</span>`); this.el.appendChild(d);
    this.card = d; this.placeCard(id); return d;
  }
  placeCard(id) { const el = this.tiles[id], d = this.card; d.style.left = (el.x - 8) + 'px'; d.style.width = (el.w + 16) + 'px'; d.style.top = '-8px'; d.style.height = (this.H + 16) + 'px'; d.on = id; }
  async moveCard(c, id, text) {
    const d = this.card, el = this.tiles[id], from = this.tiles[d.on];
    const x0 = parseFloat(d.style.left), w0 = parseFloat(d.style.width), x1 = el.x - 8, w1 = el.w + 16;
    await tween(c, 800, (t) => { d.style.left = (x0 + (x1 - x0) * t) + 'px'; d.style.width = (w0 + (w1 - w0) * t) + 'px'; d.style.top = (-8 - Math.sin(Math.PI * t) * 40) + 'px'; });
    d.style.top = '-8px'; d.on = id; d.querySelector('span').innerHTML = text;
    if (from) from.style.opacity = 1;
  }
}

/* state helpers */
let uidN = 0;
const mkState = (L, R) => ({ L: L.map(([a, b, v]) => ({ id: 't' + (uidN++), n: a, d: b, v })), R: R.map(([a, b, v]) => ({ id: 't' + (uidN++), n: a, d: b, v })) });
const scaleT = (t, p, q) => { const [a, b] = red(t.n * p, t.d * q); return Object.assign({}, t, { n: a, d: b }); };
const scaleS = (st, p, q = 1) => ({ L: st.L.map((t) => scaleT(t, p, q)), R: st.R.map((t) => scaleT(t, p, q)) });
const ORDER = { x: 0, y: 1, '': 2 };
const allLeft = (st) => ({ L: st.L.concat(st.R.map((t) => Object.assign({}, t, { n: -t.n }))).sort((a, b) => ORDER[a.v] - ORDER[b.v]), R: [] });
const coefOf = (st, v) => { const t = st.L.find((u) => u.v === v); return t ? t.n / t.d : 0; };
const tilesOf = (st) => st.L.concat(st.R);
const eqTex = (st, big) => `${polyTex(st.L.map((t) => [t.n, t.d, t.v]), big)}=${polyTex(st.R.map((t) => [t.n, t.d, t.v]), big)}`;
const trailLine = (host, texStr, tag = '', cls = '') => { const d = h('div', 'u7l3-tline ' + cls, `<span class="u7l3-te">${T(texStr)}</span>${tag ? `<span class="u7l3-tt">${tag}</span>` : ''}`); host.appendChild(d); return d; };

/* =============================== warm-up: concert ticket counter =============================== */
function mountTickets() {
  const host = document.getElementById('u7l3-wgraph'); if (!host) return;
  const G = new Graph(host, { width: 470, height: 330, xmin: 0, xmax: 18, ymin: 0, ymax: 11, xlabels: 2, ylabels: 2, xtitle: '\\text{lawn}', ytitle: '\\text{floor}' });
  let nx = 0, ny = 0, pt = null, okStamp = null, all = [];
  const vx = document.getElementById('u7l3-nx'), vy = document.getElementById('u7l3-ny'), tot = document.getElementById('u7l3-tot');
  const upd = () => {
    const t = 5 * nx + 8 * ny;
    vx.textContent = nx; vy.textContent = ny; tot.textContent = '$' + t;
    document.getElementById('u7l3-sx').innerHTML = T(`${nx}\\times\\$5=\\$${5 * nx}`); document.getElementById('u7l3-sy').innerHTML = T(`${ny}\\times\\$8=\\$${8 * ny}`);
    tot.parentNode.classList.toggle('u7l3-hit', t === 80); tot.parentNode.classList.toggle('u7l3-over', t > 80);
    if (pt) G.remove(pt);
    pt = (nx || ny) ? G.point(nx, ny, { color: t === 80 ? YI : t > 80 ? NEG : LINE, r: 8 }) : null;
    if (okStamp) { okStamp.remove(); okStamp = null; }
    if (t === 80) { okStamp = stamp(document.querySelector('.u7l3-shop'), 'Exactly $80!', { ok: true, size: 'sm' }); okStamp.classList.add('u7l3-okst'); stampIn(liveCtx(), okStamp); }
  };
  document.querySelectorAll('[data-wu]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.wu;
    if (k === 'x+' && nx < 16) nx++; if (k === 'x-' && nx > 0) nx--; if (k === 'y+' && ny < 10) ny++; if (k === 'y-' && ny > 0) ny--;
    upd();
  }));
  document.getElementById('u7l3-wall').addEventListener('click', async () => {
    if (all.length) return;
    const c = liveCtx();
    const s = G.segment([0, 10], [16, 0], { color: LINE, width: 3.5, dash: true }); all.push(s);
    await G.drawIn(s, 900, c);
    const lab = G.label(11, 3.2, T('5x+8y=80'), { pos: 'ne', cls: 'bk-ptlab u7l3-glab' }); all.push(lab); await fadeIn(c, lab);
    for (const [x, y] of [[0, 10], [8, 5], [16, 0]]) { const p = G.point(x, y, { color: YI, r: 7, coords: true, pos: x === 16 ? 'nw' : 'ne' }); all.push(p); await pop(c, p); }
  });
  document.getElementById('u7l3-wreset').addEventListener('click', () => { nx = 0; ny = 0; G.remove(all); all = []; upd(); });
  upd();
}

/* =============================== explainer 1: the tidy-up machine =============================== */
const TU = {
  a: { label: 'Example 1(a) check', L: [[1, 1, 'y']], R: [[4, 1, 'x'], [-9, 1, '']] },
  b: { label: 'Example 1(b) check', L: [[1, 1, 'y']], R: [[3, 5, 'x'], [2, 1, '']] },
  c: { label: 'Example 1(c) check', L: [[1, 1, 'y']], R: [[-1, 3, 'x'], [5, 6, '']] },
  d: { label: 'Example 1(d): Jordan', L: [[4, 1, 'x'], [-2, 1, 'y'], [-12, 1, '']], R: [], jordan: true },
  hz: { label: 'Horizontal: ' + T('8=2y'), L: [[8, 1, '']], R: [[2, 1, 'y']], kind: 'hz' },
  vt: { label: 'Vertical: ' + T('x=-\\tfrac32'), L: [[1, 1, 'x']], R: [[-3, 2, '']], kind: 'vt' }
};
const STATIONS = [['Clear fractions', '× LCD, every term'], ['Move all left', 'right side → 0'], ['Fix the sign', 'x-term positive'], ['Divide out', 'any common factor']];
function stationsBar(stage, x, y, w) {
  const row = add(stage, box(h('div', 'u7l3-stations'), w, 80), x, y);
  const els = STATIONS.map(([t, s], i) => {
    const d = h('div', 'u7l3-st', `<div class="u7l3-st-n">${i + 1}</div><div class="u7l3-st-t"><b>${t}</b><span>${s}</span></div><div class="u7l3-st-v"></div>`);
    row.appendChild(d); return d;
  });
  return {
    els,
    set(i, mode, note = '') { const d = els[i]; d.classList.remove('on', 'done', 'skip'); if (mode) d.classList.add(mode); d.querySelector('.u7l3-st-v').innerHTML = note; }
  };
}
const RULES = ['One side is ' + T('0'), 'Integers only', T('A\\ge0') + ' <span class="u7l3-mut">(if ' + T('A=0') + ', ' + T('B>0') + ')</span>', 'No common factor'];
function ruleStatus(st) {
  const all = tilesOf(st), zero = st.R.length === 0, ints = all.every((t) => t.d === 1);
  const A = coefOf(st, 'x'), B = coefOf(st, 'y');
  const sign = zero ? (A > 0 || (A === 0 && B > 0)) : null;
  const g = ints ? all.reduce((acc, t) => gcd(acc, t.n), 0) : 0;
  return [zero, ints, sign, ints ? g === 1 : null];
}
function rulesPanel(stage, x, y, w, hh) {
  const P = panel(stage, x, y, w, hh, 'General-form rules');
  const rows = RULES.map((r) => { const d = h('div', 'u7l3-rule', `<span class="u7l3-rk"></span><span>${r}</span>`); P.appendChild(d); return d; });
  return {
    set(st) {
      ruleStatus(st).forEach((s, i) => {
        const k = rows[i].querySelector('.u7l3-rk');
        k.textContent = s === true ? '✓' : s === false ? '✗' : '–';
        rows[i].className = 'u7l3-rule ' + (s === true ? 'ok' : s === false ? 'no' : 'na');
      });
    }
  };
}
const tidyUp = {
  title: 'The tidy-up machine',
  height: 450,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(TU).map((k) => ({ v: k, label: TU[k].label })),
  intro: 'Feed in any equation of a line. Four stations tidy it into general form, and the checklist shows which rules it meets. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = TU[k], W = ex.W;
    const S = stationsBar(stage, 14, 14, W - 28);
    const E = new TileEq(stage, { x: 14, y: 158, width: W - 28, h: 64 });
    const trail = add(stage, box(h('div', 'u7l3-trail'), W - 28 - 414, 168), 14, 270);
    const R = rulesPanel(stage, W - 404, 270, 390, 168);
    let st = mkState(d.L, d.R); E.render(st); R.set(st);
    trailLine(trail, eqTex(st), 'start');
    const steps = [], pend = [];
    const skipCap = () => { const s = pend.map((p) => `${p.why}: skip station ${p.i + 1}.`).join(' '); return s ? `<span class="u7l3-skipcap">${s}</span> ` : ''; };
    const takeSkips = () => { const p = pend.splice(0); return p; };
    const doSkips = (list) => list.forEach((p) => S.set(p.i, 'skip', 'not needed'));
    const op = (i, capMain, next, badge, tag) => {
      const cap = skipCap() + capMain, sk = takeSkips(), to = next;
      steps.push({ cap, run: async (c) => {
        doSkips(sk); S.set(i, 'on');
        let bs = null; if (badge) bs = await E.badges(c, badge);
        await E.morph(c, to);
        if (bs) await E.unbadge(c, bs);
        S.set(i, 'done', tag ? T(tag) : '✓'); R.set(to);
        await show(c, trailLine(trail, eqTex(to), tag ? T(tag) : 'move'));
      } });
    };
    // station 1: clear fractions
    const L = tilesOf(st).reduce((a, t) => lcm(a, t.d), 1);
    if (L > 1) {
      const dens = [...new Set(tilesOf(st).filter((t) => t.d > 1).map((t) => t.d))];
      const next = scaleS(st, L);
      op(0, `<b>Station 1: clear fractions.</b> ${dens.length > 1 ? `Denominators ${dens.map((x) => T(String(x))).join(' and ')}: the LCD is ${T(String(L))}` : `Denominator ${T(String(L))}`}. Multiply <b>every</b> term, on <b>both</b> sides, by ${T(String(L))}.`, next, `\\times${L}`, `\\times${L}`);
      st = next;
    } else pend.push({ i: 0, why: 'No fractions' });
    // station 2: move everything left
    if (st.R.length) {
      const next = allLeft(st);
      op(1, `<b>Station 2: move everything left.</b> Each term on the right crosses the ${T('=')} and <b>changes sign</b>. The right side is left with ${T('0')}; put the ${T('x')}-term first.`, next, null, null);
      st = next;
    } else pend.push({ i: 1, why: 'The right side is already 0' });
    // station 3: fix the sign
    const A3 = coefOf(st, 'x'), B3 = coefOf(st, 'y');
    if (A3 < 0 || (A3 === 0 && B3 < 0)) {
      const next = scaleS(st, -1);
      op(2, A3 < 0 ? `<b>Station 3: fix the sign.</b> ${T('A=' + A3)} is negative. Multiply <b>every</b> term by ${T('-1')}: every sign flips.`
        : `<b>Station 3: fix the sign.</b> No ${T('x')}-term, so ${T('A=0')}; then ${T('B')} must be positive. ${T('B=' + B3)}, so multiply every term by ${T('-1')}.`, next, '\\times(-1)', '\\times(-1)');
      st = next;
    } else pend.push({ i: 2, why: A3 > 0 ? `${T('A=' + A3)} is already positive` : `${T('A=0')} and ${T('B=' + B3)} is positive` });
    // station 4: divide out
    const g = tilesOf(st).reduce((a, t) => gcd(a, t.n), 0);
    if (g > 1) {
      const next = scaleS(st, 1, g);
      op(3, `<b>Station 4: divide out.</b> ${tilesOf(st).map((t) => T(String(t.n))).join(', ')} share the factor ${T(String(g))}. Divide every term by ${T(String(g))}.`, next, `\\div${g}`, `\\div${g}`);
      st = next;
    } else pend.push({ i: 3, why: 'No common factor' });
    // final
    const A = coefOf(st, 'x'), B = coefOf(st, 'y'), C = coefOf(st, ''), fin = st;
    const extra = d.kind === 'hz' ? ` A horizontal line: ${T('A=0')}, and ${T('B')} is positive (not ${T('-y+4=0')}).`
      : d.kind === 'vt' ? ` A vertical line: ${T('B=0')}. ${T('y=mx+b')} can’t write this line at all; general form can.` : '';
    const sk = takeSkips();
    steps.push({ cap: (sk.length ? `<span class="u7l3-skipcap">${sk.map((p) => `${p.why}: skip station ${p.i + 1}.`).join(' ')}</span> ` : '') +
      `<b>Tidy!</b> ${T(gf(A, B, C))}, with ${T(`A=${A},\\ B=${B},\\ C=${C}`)}.${extra}`,
    run: async (c) => {
      doSkips(sk); R.set(fin);
      const map = {}; fin.L.forEach((t) => { map[t.id] = t.v === 'x' ? T('A=' + t.n) : t.v === 'y' ? T('B=' + t.n) : T('C=' + t.n); });
      await E.labels(c, map);
      const s = stamp(stage, 'General form', { ok: true, x: W - 150, y: 192 }); await stampIn(c, s);
    } });
    if (d.jordan) {
      steps.push({ cap: `<b>Same line?</b> Yes: ${T('4x-2y-12=0')} is ${T('2x-y-6=0')} with every term doubled, and that doesn’t change which points work (${T('y=2x-6')} either way). But ${T('4,\\ -2,\\ -12')} share the factor ${T('2')}, so Jordan’s equation is <b>not</b> in general form.`,
        run: async (c) => { await show(c, trailLine(trail, '4x-2y-12=0\\ \\text{ is }\\ 2(2x-y-6)=0', '', 'u7l3-tnote')); } });
    }
    return steps;
  }
};

/* =============================== explainer 2: one line, many costumes =============================== */
const CO = {
  b: { label: 'The line ' + T('y=\\tfrac35x+2'), m: 0.6, b: 2, P: [5, 5], Q: [-5, -1], win: { xmin: -7, xmax: 7, ymin: -5, ymax: 9 },
    list: [
      { t: 'y=\\tfrac{3}{5}x+2', f: (x, y) => y - (3 / 5 * x + 2), fail: 0 },
      { t: '6x-10y+20=0', f: (x, y) => 6 * x - 10 * y + 20, fail: 3, why: 'all share 2' },
      { t: '3x-5y+10=0', f: (x, y) => 3 * x - 5 * y + 10, win: true },
      { t: '0.6x-y+2=0', f: (x, y) => 0.6 * x - y + 2, fail: 1, why: T('0.6') + ' isn’t an integer' },
      { t: '5y=3x+10', f: (x, y) => 5 * y - 3 * x - 10, fail: 0 },
      { t: '-3x+5y-10=0', f: (x, y) => -3 * x + 5 * y - 10, fail: 2, why: T('A=-3') }
    ] },
  d: { label: 'Jordan’s line ' + T('y=2x-6'), m: 2, b: -6, P: [4, 2], Q: [1, -4], win: { xmin: -4, xmax: 8, ymin: -8, ymax: 4 },
    list: [
      { t: '2y=4x-12', f: (x, y) => 2 * y - 4 * x + 12, fail: 0 },
      { t: '-2x+y+6=0', f: (x, y) => -2 * x + y + 6, fail: 2, why: T('A=-2') },
      { t: 'x-0.5y-3=0', f: (x, y) => x - 0.5 * y - 3, fail: 1, why: T('0.5') + ' isn’t an integer' },
      { t: '2x-y-6=0', f: (x, y) => 2 * x - y - 6, win: true },
      { t: '4x-2y-12=0', f: (x, y) => 4 * x - 2 * y - 12, fail: 3, why: 'all share 2' },
      { t: 'y=2x-6', f: (x, y) => y - (2 * x - 6), fail: 0 }
    ] }
};
const RULE_CAP = [
  `<b>Rule: one side is ${T('0')}.</b> Two of them still have terms on both sides: out.`,
  '<b>Rule: integers only.</b> A decimal (or a fraction) is out.',
  `<b>Rule: ${T('A\\ge0')}.</b> A negative ${T('x')}-coefficient is out.`,
  '<b>Rule: no common factor.</b> Every coefficient doubled is out.'
];
const costumes = {
  title: 'One line, many equations',
  height: 440,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(CO).map((k) => ({ v: k, label: CO[k].label })),
  intro: 'A line can be written with many different equations. The general-form rules pick out exactly one. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CO[k], W = ex.W;
    const G = new Graph(stage, Object.assign({ x: 14, y: 14, width: 400, height: 410, xlabels: 2, ylabels: 2 }, d.win));
    const P = panel(stage, 434, 14, W - 448, 410, 'Six equations');
    const rows = d.list.map((e) => {
      const r = h('div', 'u7l3-cos', `<span class="u7l3-cos-e">${T(e.t)}</span><span class="u7l3-cos-k"></span><span class="u7l3-cos-w"></span>`);
      P.appendChild(r); hide(r); return r;
    });
    const ok = d.list.map((e) => Math.abs(e.f(...d.P)) < 1e-9 && Math.abs(e.f(...d.Q)) < 1e-9);
    if (!ok.every(Boolean)) console.error('u7l3 costumes: an equation misses a point', k);
    let ln = null;
    const steps = [
      { cap: `One line: ${T(`y=${polyTex([[Math.round(d.m * 5), 5, 'x'], [d.b, 1, '']])}`)}. Here are <b>six</b> equations someone might write for it.`,
        run: async (c) => { ln = G.line({ m: d.m, b: d.b }, { color: LINE }); await G.drawIn(ln, 700, c); for (const r of rows) await show(c, r); } },
      { cap: `Test two points on the line, ${T(pairTex(...d.P))} and ${T(pairTex(...d.Q))}, in every equation: <b>all six balance</b>. Two points fix a line, so all six are the <b>same line</b>.`,
        run: async (c) => {
          for (const p of [d.P, d.Q]) await pop(c, G.point(p[0], p[1], { color: INK, r: 7, coords: true, pos: 'se' }));
          for (let i = 0; i < rows.length; i++) { const kk = rows[i].querySelector('.u7l3-cos-k'); kk.innerHTML = ok[i] ? '✓ ✓' : '✗'; await pop(c, kk, 200); }
        } }
    ];
    [0, 1, 2, 3].forEach((ri) => {
      steps.push({ cap: RULE_CAP[ri], run: async (c) => {
        for (let i = 0; i < rows.length; i++) {
          if (d.list[i].fail !== ri) continue;
          rows[i].classList.add('out'); const w = rows[i].querySelector('.u7l3-cos-w');
          w.innerHTML = d.list[i].why || 'not ' + T('=0'); await shake(c, rows[i]); await fadeIn(c, w);
        }
      } });
    });
    const wi = d.list.findIndex((e) => e.win);
    steps.push({ cap: `Exactly <b>one</b> survives: ${T(d.list[wi].t)}. The rules make general form <b>unique</b>, so everyone in the class writes the same equation.`,
      run: async (c) => { rows[wi].classList.add('win'); await pulse(c, rows[wi], 1.06); const s = stamp(P, 'General form', { ok: true, size: 'sm' }); s.classList.add('u7l3-cos-st'); await stampIn(c, s); } });
    return steps;
  }
};

/* =============================== explainer 3: solve for y (and the shortcut) =============================== */
const SY = {
  a: { label: 'Example 2(a) check', A: 3, B: -4, C: 20, win: { xmin: -8, xmax: 4, ymin: -3, ymax: 9 }, P0: [-4, 2] },
  b: { label: 'Example 2(b) check', A: 8, B: 3, C: -21, win: { xmin: -3, xmax: 6, ymin: -3, ymax: 9 }, P0: [0, 7] },
  gen: { label: 'Any line ' + T('Ax+By+C=0'), sym: true }
};
const solveY = {
  title: 'Solve for y: isolate By, then divide by B',
  height: 430,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(SY).map((k) => ({ v: k, label: SY[k].label })),
  intro: 'General form hides the slope and the y-intercept. Get y alone (the reverse of the tidy-up machine) and they appear. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = SY[k], W = ex.W, LW = W - 28 - (d.sym ? 0 : 400);
    const E = new TileEq(stage, { x: 14, y: 60, width: d.sym ? LW : LW - 10, h: 70 });
    const trail = add(stage, box(h('div', 'u7l3-trail u7l3-trail2'), Math.min(LW - 10, 560), 130), 24, 176);
    const fbox = add(stage, box(h('div', 'u7l3-fbox'), Math.min(LW - 10, 560), 108), 24, 314); hide(fbox);
    if (d.sym) {
      const s0 = { L: [{ id: 'a', n: 1, sym: 'A', v: 'x' }, { id: 'b', n: 1, sym: 'B', v: 'y' }, { id: 'c', n: 1, sym: 'C', v: '' }], R: [] };
      const s1 = { L: [{ id: 'b', n: 1, sym: 'B', v: 'y' }], R: [{ id: 'a', n: -1, sym: 'A', v: 'x' }, { id: 'c', n: -1, sym: 'C', v: '' }] };
      const s2 = { L: [{ id: 'b', n: 1, sym: '', v: 'y' }], R: [{ id: 'a', n: -1, sym: '\\dfrac{A}{B}', v: 'x' }, { id: 'c', n: -1, sym: '\\dfrac{C}{B}', v: '' }] };
      E.render(s0); trailLine(trail, 'Ax+By+C=0', 'start');
      const side = add(stage, box(h('div', 'u7l3-fbox u7l3-fbig'), 340, 250), W - 360, 176); hide(side);
      return [
        { cap: `The same moves work with letters. ${T('B')} must not be ${T('0')} (a vertical line has no y-intercept form).`,
          run: async (c) => { await E.labels(c, { a: '<b>A</b>', b: '<b>B</b>', c: '<b>C</b>' }); } },
        { cap: `<b>Isolate the ${T('By')}-term:</b> ${T('Ax')} and ${T('C')} cross the ${T('=')} and change sign.`,
          run: async (c) => { E.clearLabels(); await E.morph(c, s1); await show(c, trailLine(trail, 'By=-Ax-C', 'move')); } },
        { cap: `<b>Divide every term by ${T('B')}.</b> Now it is slope–intercept form.`,
          run: async (c) => { const b = await E.badges(c, '\\div B'); await E.morph(c, s2); await E.unbadge(c, b); await show(c, trailLine(trail, 'y=-\\dfrac{A}{B}x-\\dfrac{C}{B}', T('\\div B'))); } },
        { cap: `Read it off: slope ${T('m=-\\dfrac{A}{B}')}, y-intercept ${T('-\\dfrac{C}{B}')}. Covering ${T('y')} (${T('y=0')}) gives ${T('Ax+C=0')}, so the x-intercept is ${T('-\\dfrac{C}{A}')} (when ${T('A\\ne0')}).`,
          run: async (c) => {
            side.innerHTML = `<div class="u7l3-fh">For ${T('Ax+By+C=0')}</div><div>${T('m=-\\dfrac{A}{B}')}</div><div>${T('y\\text{-int}=-\\dfrac{C}{B}')}</div><div>${T('x\\text{-int}=-\\dfrac{C}{A}')}</div>`;
            await show(c, side);
          } },
        { cap: `Use it as a <b>quick check</b> on your rearranging, not instead of it: Example 2(a) ${T('3x-4y+20=0')} gives ${T('m=-\\dfrac{3}{-4}=\\dfrac34')}, y-intercept ${T('-\\dfrac{20}{-4}=5')}.`,
          run: async (c) => { fbox.innerHTML = `${T('3x-4y+20=0:\\quad m=-\\dfrac{3}{-4}=\\dfrac34,\\quad b=-\\dfrac{20}{-4}=5')}`; await show(c, fbox); } }
      ];
    }
    const { A, B, C } = d;
    const G = new Graph(stage, Object.assign({ x: W - 400, y: 10, width: 386, height: 410, xlabels: 2, ylabels: 2 }, d.win));
    const s0 = mkState([[A, 1, 'x'], [B, 1, 'y'], [C, 1, '']], []);
    const [tx, ty, tc] = s0.L;
    const s1 = { L: [ty], R: [Object.assign({}, tx, { n: -A }), Object.assign({}, tc, { n: -C })] };
    const s2 = scaleS(s1, 1, B);
    const m = red(-A, B), b = -C / B;
    E.render(s0); trailLine(trail, gf(A, B, C), 'start');
    const par = (v) => (v < 0 ? `(${v})` : String(v));
    return [
      { cap: `${T(gf(A, B, C))}: name the coefficients. ${T(`A=${A},\\ B=${B},\\ C=${C}`)}.`,
        run: async (c) => { await E.labels(c, { [tx.id]: T('A=' + A), [ty.id]: T('B=' + B), [tc.id]: T('C=' + C) }); } },
      { cap: `<b>Isolate the ${T('By')}-term.</b> Move ${T(polyTex([[A, 1, 'x']]))} and ${T(String(C))} across the ${T('=')}: each changes sign.`,
        run: async (c) => { E.clearLabels(); await E.morph(c, s1); await show(c, trailLine(trail, eqTex(s1), 'move')); } },
      { cap: `<b>Divide every term by ${T('B=' + B)}.</b>${B < 0 ? ' Dividing by a negative flips every sign.' : ''}`,
        run: async (c) => { const bs = await E.badges(c, `\\div${par(B)}`); await E.morph(c, s2); await E.unbadge(c, bs); await show(c, trailLine(trail, eqTex(s2), T(`\\div${par(B)}`))); } },
      { cap: `Slope–intercept form: slope ${T(fr(m[0], m[1]))}, y-intercept ${T(texNum(b))}. Plot ${T(pairTex(0, b))}; a slope triangle shows run ${T(String(m[1]))}, rise ${T(String(m[0]))}.`,
        run: async (c) => {
          const yi = G.point(0, b, { color: YI, r: 8, label: T(pairTex(0, b)), pos: d.P0[0] === 0 ? 'w' : 'e', labelColor: YI }); await pop(c, yi);
          const t = tri(G, d.P0[0] === 0 ? [0, b] : d.P0, m[1], m[0]); await t.draw(c);
          await G.drawIn(G.line({ m: m[0] / m[1], b }, { color: LINE }), 800, c);
        } },
      { cap: `<b>Shortcut check:</b> ${T(`m=-\\dfrac{A}{B}=-\\dfrac{${A}}{${B}}${B > 0 ? '' : '=' + fr(m[0], m[1])}`)} and ${T(`b=-\\dfrac{C}{B}=-\\dfrac{${C}}{${B}}=${texNum(b)}`)} ✓.`,
        run: async (c) => { fbox.innerHTML = `<div>${T(`m=-\\dfrac{A}{B}=-\\dfrac{${A}}{${B}}${B > 0 ? '' : '=' + fr(m[0], m[1])}`)}</div><div>${T(`b=-\\dfrac{C}{B}=-\\dfrac{${C}}{${B}}=${texNum(b)}`)}</div>`; fbox.classList.add('u7l3-fcol'); await show(c, fbox); } }
    ];
  }
};

/* =============================== explainer 4: cover x, cover y =============================== */
const CV = {
  warm: { label: 'Warm-up: ' + T('5x+8y-80=0'), A: 5, B: 8, C: -80, win: { xmin: -2, xmax: 22, ymin: -2, ymax: 12, xlabels: 4, ylabels: 2 }, story: true },
  demo: { label: T('2x+3y-12=0'), A: 2, B: 3, C: -12, win: { xmin: -3, xmax: 9, ymin: -3, ymax: 7, xlabels: 2, ylabels: 2 } },
  a: { label: 'Example 2(a) check', A: 3, B: -4, C: 20, win: { xmin: -10, xmax: 3, ymin: -3, ymax: 8, xlabels: 2, ylabels: 2 } },
  b: { label: 'Example 2(b) check', A: 8, B: 3, C: -21, win: { xmin: -3, xmax: 5, ymin: -2, ymax: 9, xlabels: 1, ylabels: 2 } }
};
const cover = {
  title: 'Intercepts: cover x, then cover y',
  height: 440,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(CV).map((k) => ({ v: k, label: CV[k].label })),
  intro: 'Every point on the <b>y</b>-axis has x = 0, and every point on the <b>x</b>-axis has y = 0. A sticky note does the substituting. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = CV[k], W = ex.W, { A, B, C } = d, LW = W - 28 - 420;
    const G = new Graph(stage, Object.assign({ x: W - 424, y: 10, width: 410, height: 420 }, d.win));
    const E = new TileEq(stage, { x: 14, y: 50, width: LW, h: 64 });
    const s0 = mkState([[A, 1, 'x'], [B, 1, 'y'], [C, 1, '']], []), [tx, ty] = s0.L;
    E.render(s0);
    const colY = add(stage, box(h('div', 'u7l3-col u7l3-coly', `<div class="u7l3-colh">y-intercept: ${T('x=0')}</div>`), (LW - 20) / 2, 200), 14, 150);
    const colX = add(stage, box(h('div', 'u7l3-col u7l3-colx', `<div class="u7l3-colh">x-intercept: ${T('y=0')}</div>`), (LW - 20) / 2, 200), 14 + (LW - 20) / 2 + 20, 150);
    hide(colY); hide(colX);
    const yi = red(-C, B), xi = red(-C, A), yv = yi[0] / yi[1], xv = xi[0] / xi[1];
    const yLines = [polyTex([[B, 1, 'y'], [C, 1, '']]) + '=0', ...(B !== 1 ? [polyTex([[B, 1, 'y']]) + '=' + (-C)] : []), 'y=' + fr(-C, B)];
    const xLines = [polyTex([[A, 1, 'x'], [C, 1, '']]) + '=0', ...(A !== 1 ? [polyTex([[A, 1, 'x']]) + '=' + (-C)] : []), 'x=' + fr(-C, A)];
    const ptY = `(0,\\ ${fr(-C, B, false)})`, ptX = `(${fr(-C, A, false)},\\ 0)`;
    let card = null;
    const steps = [
      { cap: `On the <b>y-axis</b>, ${T('x=0')}, so the ${T('x')}-term is worth ${T('0')} there. <b>Cover the x-term.</b>`,
        run: async (c) => { card = E.coverCard(tx.id, T('x=0')); await anim(c, card, [{ opacity: 0, transform: 'translateY(-50px)' }, { opacity: 1, transform: 'none' }], 500); E.tiles[tx.id].style.opacity = 0.15; await show(c, colY); } },
      { cap: `What’s left: ${T(yLines[0])}, so ${T(yLines[yLines.length - 1])}. The <b>y-intercept</b> is ${T(ptY)}.`,
        run: async (c) => {
          for (const L of yLines) await show(c, trailLine(colY, L));
          const p = G.point(0, yv, { color: YI, r: 8, label: T(ptY), pos: A * B > 0 ? 'ne' : 'nw', labelColor: YI }); await pop(c, p);
        } },
      { cap: `On the <b>x-axis</b>, ${T('y=0')}. Slide the note onto the <b>y-term</b>.`,
        run: async (c) => { await E.moveCard(c, ty.id, T('y=0')); E.tiles[ty.id].style.opacity = 0.15; await show(c, colX); } },
      { cap: `What’s left: ${T(xLines[0])}, so ${T(xLines[xLines.length - 1])}. The <b>x-intercept</b> is ${T(ptX)}.`,
        run: async (c) => {
          for (const L of xLines) await show(c, trailLine(colX, L));
          const p = G.point(xv, 0, { color: XI, r: 8, label: T(ptX), pos: xv > 0 ? (A * B > 0 ? 'ne' : 'se') : 'nw', labelColor: XI }); await pop(c, p);
        } },
      { cap: `Two points fix the line: <b>join the intercepts</b>.${d.story ? ' (All lawn: 16 tickets. All floor: 10 tickets. Dashed: only whole tickets count, so the real combos are dots on it.)' : ''}`,
        run: async (c) => {
          await fadeOut(c, card, 300); E.tiles[ty.id].style.opacity = 1; E.tiles[tx.id].style.opacity = 1;
          await G.drawIn(d.story ? G.segment([0, yv], [xv, 0], { color: LINE, width: 3.5, dash: true }) : lineGF(G, A, B, C, { color: LINE }), 900, c);
        } }
    ];
    if (Number.isInteger(xv) && Number.isInteger(yv)) {
      const m = red(-A, B);
      steps.push({ cap: `Bonus: the slope from the intercepts. Run ${T(String(xv))}, rise ${T(String(-yv))}: ${T(`\\dfrac{${-yv}}{${xv}}=${fr(-yv, xv)}`)}, the same as ${T(`-\\dfrac{A}{B}=${fr(m[0], m[1])}`)} ✓.${d.story ? ' Trade 5 floor tickets for 8 lawn tickets and the total stays $80.' : ''}`,
        run: async (c) => { const t = tri(G, [0, yv], xv, -yv, { runPos: 'n', risePos: 'e' }); await t.draw(c); } });
    } else {
      steps.push({ cap: `Covering gives the intercepts fast, even when they’re fractions. (For the <b>slope</b>, solve for ${T('y')} or use ${T('-\\dfrac{A}{B}=' + fr(-A, B))}.)`,
        run: async (c) => { await pulse(c, colY, 1.04); } });
    }
    return steps;
  }
};

/* =============================== explainer 5: Example 2(c), the family 6x − ky − 9 = 0 =============================== */
const sameInt = {
  title: 'Example 2(c): find k for the same y-intercept',
  height: 450,
  minW: 820, // drawn this wide and scaled to fit beside the sidebar
  intro: 'One line is fixed. The other has a k in it, so it is really a whole family of lines. Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W;
    const G = new Graph(stage, { x: 14, y: 10, width: 420, height: 430, xmin: -5, xmax: 5, ymin: -3, ymax: 10, xlabels: 1, ylabels: 2 });
    const P = panel(stage, 454, 10, W - 468, 430, 'Same y-intercept');
    const ro = h('div', 'u7l3-kro', ''); hide(ro); P.appendChild(ro);
    let k = -9;
    const a = [1.5, 0], b = [0, -9 / k];
    let fam = null;
    const setK = (kk) => { k = kk; b[1] = -9 / k; if (fam) fam._bkDraw(); ro.innerHTML = `${T(`k=${texNum(Math.round(k * 10) / 10)}`)}<span class="u7l3-gap"></span>y-int ${T(`=${texNum(Math.round(-90 / k) / 10)}`)}`; };
    return [
      { cap: `Line 1: ${T('4x-5y+15=0')}. Cover x: ${T('-5y+15=0')}, so ${T('y=3')}. Its y-intercept is ${T('3')}.`,
        run: async (c) => {
          await G.drawIn(lineGF(G, 4, -5, 15, { color: LINE }), 700, c);
          await pop(c, G.point(0, 3, { color: YI, r: 8, label: T('(0,\\ 3)'), pos: 'nw', labelColor: YI }));
          await show(c, line(P, `Line 1: ${T('4x-5y+15=0')}<br>${T('-5y+15=0\\ \\Rightarrow\\ y=3')}`));
        } },
      { cap: `Line 2, ${T('6x-ky-9=0')}, is a different line for every value of ${T('k')}. Watch ${T('k')} change.`,
        run: async (c) => {
          fam = G.line(a, b, { color: TEAL }); setK(-9); await show(c, ro); await G.drawIn(fam, 600, c);
          await tween(c, 2200, (t) => setK(-9 + 7.5 * t)); await tween(c, 1500, (t) => setK(-1.5 - 4.5 * t));
        } },
      { cap: `It always swings through ${T('(1.5,\\ 0)')}: cover y and ${T('6x-9=0')} gives ${T('x=1.5')} for <b>every</b> ${T('k')}. Only the y-intercept moves.`,
        run: async (c) => { const p = G.point(1.5, 0, { color: XI, r: 8, label: T('(1.5,\\ 0)'), pos: 'se', labelColor: XI }); await pop(c, p); await tween(c, 1400, (t) => setK(-6 + 3 * Math.sin(Math.PI * t))); } },
      { cap: `Cover x in line 2: ${T('-ky-9=0')}, so ${T('-ky=9')} and ${T('y=-\\dfrac{9}{k}')}. That is its y-intercept.`,
        run: async (c) => { await show(c, line(P, `Line 2: ${T('6x-ky-9=0')}<br>${T('-ky-9=0\\ \\Rightarrow\\ y=-\\dfrac{9}{k}')}`)); } },
      { cap: `Make them equal: ${T('-\\dfrac{9}{k}=3')}, so ${T('-9=3k')} and ${T('k=-3')}.`,
        run: async (c) => { await show(c, line(P, `${T('-\\dfrac{9}{k}=3\\ \\Rightarrow\\ -9=3k\\ \\Rightarrow\\ \\boldsymbol{k=-3}')}`, 'u7l3-key')); await tween(c, 1100, (t) => setK(-6 + 3 * t)); } },
      { cap: `Check: ${T('k=-3')} gives ${T('6x+3y-9=0')}, so ${T('3y=-6x+9')} and ${T('y=-2x+3')}: y-intercept ${T('3')} ✓.`,
        run: async (c) => { setK(-3); await show(c, line(P, `${T('6x+3y-9=0\\ \\Rightarrow\\ y=-2x+3')}`)); const s = stamp(P, 'Same y-int ✓', { ok: true, size: 'sm' }); s.classList.add('u7l3-pst'); await stampIn(c, s); } }
    ];
  }
};

/* =============================== explainer 6: perpendicular — flip the slope triangle =============================== */
const PP = {
  flip: { label: 'Flip the slope triangle' },
  ex3: { label: 'Example 3 check' }
};
const TESTS = [
  { k: '(i)', A: 3, B: 5, C: -8, color: TEAL },
  { k: '(ii)', A: 1, B: 3, C: -9, color: ORANGE },
  { k: '(iii)', A: 2, B: -5, C: 10, color: '#8a5a2b' }
];
const perp = {
  title: 'Perpendicular lines in general form',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(PP).map((k) => ({ v: k, label: PP[k].label })),
  intro: 'Two lines are perpendicular when their slopes are negative reciprocals: they multiply to −1. Turning a slope triangle a quarter-turn shows why. Press <b>Next</b>.',
  make(stage, k, ex) {
    const W = ex.W;
    const G = new Graph(stage, { x: 14, y: 10, width: 440, height: 450, xmin: -7, xmax: 6, ymin: -5, ymax: 8, xlabels: 2, ylabels: 2 });
    const Pn = panel(stage, 474, 10, W - 488, 450, k === 'flip' ? 'Quarter-turn' : 'Which are perpendicular?');
    const base = [5, -3, 6];
    const steps = [];
    steps.push({ cap: `${T('5x-3y+6=0')}: slope ${T('m=-\\dfrac{A}{B}=-\\dfrac{5}{-3}=\\dfrac53')}, y-intercept ${T('2')}.`,
      run: async (c) => {
        await G.drawIn(lineGF(G, ...base, { color: LINE }), 700, c);
        await show(c, line(Pn, `${T('5x-3y+6=0')}: ${T('m=\\dfrac53')}`));
        if (k === 'flip') { const t = tri(G, [0, 2], -3, -5, { runPos: 'n', risePos: 'w' }); await t.draw(c); }
      } });
    if (k === 'flip') {
      // triangle P=(0,2) → Q=(−3,2) → R=(−3,−3); turn a copy −90° about P
      const P0 = [0, 2], Q = [-3, 2], R = [-3, -3];
      const q = Q.slice(), r = R.slice(), p1 = P0.slice(), p2 = R.slice();
      let s1, s2, ln;
      const rot = (pt, th) => { const dx = pt[0] - P0[0], dy = pt[1] - P0[1]; return [P0[0] + dx * Math.cos(th) - dy * Math.sin(th), P0[1] + dx * Math.sin(th) + dy * Math.cos(th)]; };
      const setTh = (th) => { const a = rot(Q, th), b = rot(R, th); q[0] = a[0]; q[1] = a[1]; r[0] = b[0]; r[1] = b[1]; p2[0] = b[0]; p2[1] = b[1]; [s1, s2, ln].forEach((e) => e && e._bkDraw()); };
      steps.push({ cap: 'Copy the triangle and the line, then <b>turn the copy a quarter-turn</b> about the y-intercept.',
        run: async (c) => {
          ln = G.line(p1, p2, { color: TEAL, dash: true }); s1 = G.segment(P0, q, { color: RUN, width: 4, dash: true }); s2 = G.segment(q, r, { color: RISE, width: 4, dash: true });
          await appear(c, ln, 300); await appear(c, s1, 200); await appear(c, s2, 200);
          await tween(c, 1800, (t) => setTh(-Math.PI / 2 * t)); setTh(-Math.PI / 2);
          G.remove(ln); ln = null; await G.drawIn(G.line(P0, [-5, 5], { color: TEAL }), 500, c);
        } });
      steps.push({ cap: `The run turned into a rise and the rise into a run. Read the turned triangle left to right, from ${T('(-5,\\ 5)')} to ${T('(0,\\ 2)')}: run ${T('5')}, rise ${T('-3')}. Slope ${T('-\\dfrac35')}.`,
        run: async (c) => {
          await pop(c, G.label(-2.5, 5, '<b>run</b> 5', { pos: 'n', cls: 'bk-ptlab u7l3-tl u7l3-trise', gap: 6 }));
          await pop(c, G.label(0, 3.5, '<b>rise</b> −3', { pos: 'e', cls: 'bk-ptlab u7l3-tl u7l3-trun', gap: 6 }));
          await appear(c, rmark(G, P0, 5 / 3, -3 / 5, { s1: 0.6, s2: -1 }), 300);
          await show(c, line(Pn, `turned: ${T('m_\\perp=-\\dfrac35')}`, 'u7l3-key'));
        } });
      steps.push({ cap: `<b>Flip the fraction and change the sign</b>: the negative reciprocal. Check: ${T('\\dfrac53\\times\\left(-\\dfrac35\\right)=-1')} ✓.`,
        run: async (c) => { await show(c, line(Pn, T('\\dfrac53\\times\\left(-\\dfrac35\\right)=-\\dfrac{15}{15}=-1'))); } });
      steps.push({ cap: `In general form: the turned line is ${T('y=-\\tfrac35x+2')}, or ${T('3x+5y-10=0')}. Compare ${T('\\textcolor{#13807a}{5}x\\textcolor{#1f5bd6}{-3}y')} with ${T('\\textcolor{#1f5bd6}{3}x+\\textcolor{#13807a}{5}y')}: ${T('A')} and ${T('B')} <b>swap</b>, and one sign changes.`,
        run: async (c) => { await show(c, line(Pn, `${T('5x-3y+6=0')}<br>${T('3x+5y-10=0')}<div class="u7l3-mut">A and B swap; one sign changes</div>`, 'u7l3-soft')); } });
      return steps;
    }
    steps.push({ cap: `A perpendicular line needs the negative reciprocal: ${T('m_\\perp=-\\dfrac35')}. Now find each line’s slope with ${T('-\\dfrac{A}{B}')}.`,
      run: async (c) => { await show(c, line(Pn, `need ${T('m=-\\dfrac35')}`, 'u7l3-key')); } });
    TESTS.forEach((L) => {
      const m = red(-L.A, L.B), ok = m[0] === -3 && m[1] === 5;
      const X = meet(base, [L.A, L.B, L.C]);
      steps.push({ cap: `${L.k} ${T(gf(L.A, L.B, L.C))}: ${T(`m=-\\dfrac{${L.A}}{${L.B}}${L.B > 0 ? '' : '=' + fr(m[0], m[1])}`)}. ${ok ? '<b>Perpendicular.</b>' : `Not ${T('-\\dfrac35')}: <b>not</b> perpendicular.`}`,
        run: async (c) => {
          await G.drawIn(lineGF(G, L.A, L.B, L.C, { color: L.color, width: 3 }), 600, c);
          const lab = G.label(4.4, -L.A / L.B * 4.4 - L.C / L.B, `<b>${L.k}</b>`, { pos: 'n', cls: 'bk-ptlab', color: L.color }); await pop(c, lab);
          if (ok) await appear(c, rmark(G, X, 5 / 3, -3 / 5, { s1: 0.6, s2: 1 }), 300);
          const r = line(Pn, `${L.k} ${T(gf(L.A, L.B, L.C))}<br>${T(`m=${fr(m[0], m[1])}`)} <b class="${ok ? 'u7l3-yes' : 'u7l3-no'}">${ok ? '✓ ⟂' : '✗'}</b>`);
          r.style.borderLeftColor = L.color; await show(c, r);
        } });
    });
    steps.push({ cap: `Only <b>(i)</b> ${T('3x+5y-8=0')} is perpendicular to ${T('5x-3y+6=0')}: ${T('\\dfrac53\\times\\left(-\\dfrac35\\right)=-1')}. (Notice its ${T('A')} and ${T('B')} are swapped with one sign changed.)`,
      run: async (c) => { const s = stamp(Pn, 'Only (i)', { ok: true, size: 'sm' }); s.classList.add('u7l3-pst'); await stampIn(c, s); } });
    return steps;
  }
};

/* =============================== explainer 7: Example 4, build a line =============================== */
const BL = {
  ex4: { label: 'Example 4 check', perp: true },
  par: { label: 'Parallel instead (same y-intercept)', perp: false }
};
const build = {
  title: 'Build a line in four steps',
  height: 470,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(BL).map((k) => ({ v: k, label: BL[k].label })),
  intro: 'One line gives the slope, another gives the y-intercept. Find each, assemble y = mx + b, then tidy it. Press <b>Next</b>.',
  make(stage, k, ex) {
    const d = BL[k], W = ex.W;
    const G = new Graph(stage, { x: 14, y: 10, width: 430, height: 450, xmin: -9, xmax: 7, ymin: -3, ymax: 12, xlabels: 2, ylabels: 4 });
    const P = panel(stage, 464, 10, W - 478, 450, d.perp ? 'Perpendicular to line 1, y-int of line 2' : 'Parallel to line 1, y-int of line 2');
    const rows = ['Target slope', 'Target y-intercept', 'Assemble ' + T('y=mx+b'), 'Convert to general form'].map((t, i) => {
      const r = h('div', 'u7l3-bstep', `<div class="u7l3-bn">${i + 1}</div><div><div class="u7l3-bt">${t}</div><div class="u7l3-bv"></div></div>`); P.appendChild(r); return r;
    });
    const setRow = async (c, i, html) => { rows[i].classList.add('on'); const v = rows[i].querySelector('.u7l3-bv'); v.innerHTML = html; await fadeIn(c, v); };
    const m = d.perp ? [4, 3] : [-3, 4], mT = fr(m[0], m[1]), mt = fr(m[0], m[1], false);
    const fin = d.perp ? [4, -3, 30] : [3, 4, -40], mult = m[1];
    return [
      { cap: `<b>1. Target slope.</b> Line 1: ${T('3x+4y-8=0')}, so ${T('4y=-3x+8')} and ${T('y=-\\tfrac34x+2')}: slope ${T('-\\dfrac34')}. ${d.perp ? `Perpendicular: flip and change sign, ${T('\\dfrac43')}.` : `Parallel: the same slope, ${T('-\\dfrac34')}.`}`,
        run: async (c) => {
          await G.drawIn(lineGF(G, 3, 4, -8, { color: GRAY }), 600, c);
          await pop(c, G.label(-8.6, 8.45, '<b>line 1</b>', { pos: 'n', cls: 'bk-ptlab', color: GRAY }));
          const t = tri(G, [0, 2], 4, -3, { runPos: 'n' }); await t.draw(c, 300);
          await setRow(c, 0, `${T('-\\tfrac34')} ${d.perp ? '→ flip, change sign → ' : '→ same → '}${T('\\boldsymbol{' + mt + '}')}`);
        } },
      { cap: `<b>2. Target y-intercept.</b> Line 2: ${T('5x+y-10=0')}. Cover x: ${T('y-10=0')}, so the y-intercept is ${T('10')}.`,
        run: async (c) => {
          await G.drawIn(lineGF(G, 5, 1, -10, { color: GRAY, dash: true }), 600, c);
          await pop(c, G.label(1.2, 4, '<b>line 2</b>', { pos: 'e', cls: 'bk-ptlab', color: GRAY }));
          await pop(c, G.point(0, 10, { color: YI, r: 8, label: T('(0,\\ 10)'), pos: d.perp ? 'e' : 'w', labelColor: YI }));
          await setRow(c, 1, T('\\boldsymbol{b=10}'));
        } },
      { cap: `<b>3. Assemble:</b> ${T(`y=${mt}x+10`)}. From ${T('(0,\\ 10)')} step ${d.perp ? `run ${T('-3')}, rise ${T('-4')}` : `run ${T('4')}, rise ${T('-3')}`} and draw it.${d.perp ? ' It meets line 1 at a right angle.' : ' It never meets line 1.'}`,
        run: async (c) => {
          const t = d.perp ? tri(G, [0, 10], -3, -4, { runPos: 's', risePos: 'w' }) : tri(G, [0, 10], 4, -3, { runPos: 'n', risePos: 'e' }); await t.draw(c, 300);
          await G.drawIn(G.line({ m: m[0] / m[1], b: 10 }, { color: LINE, width: 4 }), 800, c);
          if (d.perp) { const X = meet([3, 4, -8], [4, -3, 30]); await appear(c, rmark(G, X, -3 / 4, 4 / 3, { s1: 1, s2: 1 }), 300); }
          await setRow(c, 2, T(`\\boldsymbol{y=${mt}x+10}`));
        } },
      { cap: `<b>4. Convert:</b> multiply every term by ${T(String(mult))}: ${T(d.perp ? '3y=4x+30' : '4y=-3x+40')}. Gather on one side with ${T('A')} positive: ${T(gf(...fin))}.`,
        run: async (c) => {
          await setRow(c, 3, `${T(d.perp ? '3y=4x+30' : '4y=-3x+40')}<br>${T('\\boldsymbol{' + gf(...fin) + '}')}`);
          const s = stamp(P, 'Done ✓', { ok: true, size: 'sm' }); s.classList.add('u7l3-pst'); await stampIn(c, s);
        } }
    ];
  }
};

/* =============================== explainer 8: Example 5, judge three statements =============================== */
const JD = {
  ex5: { label: 'Example 5 check' },
  pts: { label: 'Test points' }
};
const judge = {
  title: 'Judge the statements about 4x − 3y + 18 = 0',
  height: 460,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: Object.keys(JD).map((k) => ({ v: k, label: JD[k].label })),
  intro: 'General form answers questions fast: slope and intercepts by the rule, and a point by substituting. Press <b>Next</b>.',
  make(stage, k, ex) {
    const W = ex.W;
    const G = new Graph(stage, { x: 14, y: 10, width: 420, height: 440, xmin: -7, xmax: 5, ymin: -3, ymax: 12, xlabels: 2, ylabels: 2 });
    const P = panel(stage, 454, 10, W - 468, 440, k === 'ex5' ? 'Three statements' : 'Substitute: is the left side 0?');
    if (k === 'pts') {
      const PTS = [[3, 10], [-3, 3], [-6, -2]];
      const steps = [{ cap: `A point is on the line exactly when it makes ${T('4x-3y+18')} equal ${T('0')}.`,
        run: async (c) => { await G.drawIn(lineGF(G, 4, -3, 18, { color: LINE }), 700, c); } }];
      PTS.forEach(([x, y]) => {
        const v = 4 * x - 3 * y + 18, on = v === 0;
        const sub = `4(${x})-3(${y})+18=${4 * x}${-3 * y < 0 ? '' : '+'}${-3 * y}+18=${v}`;
        steps.push({ cap: `${T(pairTex(x, y))}: ${T(sub)}. ${on ? '<b>On the line.</b>' : `Not ${T('0')}: <b>not</b> on the line.`}`,
          run: async (c) => {
            await pop(c, G.point(x, y, { color: on ? YI : NEG, r: 8, coords: true, pos: x > 0 ? 'w' : 'e', labelColor: on ? YI : NEG }));
            await show(c, line(P, `${T(pairTex(x, y))}<br>${T(sub)} <b class="${on ? 'u7l3-yes' : 'u7l3-no'}">${on ? '✓' : '✗'}</b>`));
          } });
      });
      return steps;
    }
    const cards = [
      ['Statement 1', 'The line has a slope of ' + T('4') + '.'],
      ['Statement 2', 'The line is parallel to ' + T('8x-6y+15=0') + '.'],
      ['Statement 3', 'The line passes through ' + T('(3,\\ 10)') + '.']
    ].map(([a, b]) => { const r = h('div', 'u7l3-stmt', `<b>${a}</b> ${b}<div class="u7l3-sv"></div>`); P.appendChild(r); return r; });
    const verdict = async (c, i, ok, html) => {
      const v = cards[i].querySelector('.u7l3-sv'); v.innerHTML = html; await fadeIn(c, v);
      const s = stamp(cards[i], ok ? 'True' : 'False', { ok, size: 'sm' }); s.classList.add('u7l3-sst'); await stampIn(c, s);
    };
    return [
      { cap: `${T('4x-3y+18=0')}: ${T('m=-\\dfrac{A}{B}=-\\dfrac{4}{-3}=\\dfrac43')}, y-intercept ${T('-\\dfrac{C}{B}=-\\dfrac{18}{-3}=6')}.`,
        run: async (c) => { await G.drawIn(lineGF(G, 4, -3, 18, { color: LINE }), 700, c); await pop(c, G.point(0, 6, { color: YI, r: 7, label: T('(0,\\ 6)'), pos: 'w', labelColor: YI })); } },
      { cap: `<b>Statement 1:</b> ${T('4')} is ${T('A')}, the coefficient of ${T('x')}, not the slope. Run ${T('3')}, rise ${T('4')}: the slope is ${T('\\dfrac43')}. <b>False.</b>`,
        run: async (c) => { const t = tri(G, [-3, 2], 3, 4, { runPos: 'n', risePos: 'e' }); await t.draw(c, 300); await verdict(c, 0, false, `${T('m=\\dfrac43\\ne4')}`); } },
      { cap: `<b>Statement 2:</b> ${T('8x-6y+15=0')} has ${T('m=-\\dfrac{8}{-6}=\\dfrac43')} (same) and y-intercept ${T('-\\dfrac{15}{-6}=\\dfrac52')} (different from ${T('6')}). Same slope, different lines: <b>parallel. True.</b>`,
        run: async (c) => {
          await G.drawIn(lineGF(G, 8, -6, 15, { color: TEAL }), 700, c);
          await pop(c, G.point(0, 2.5, { color: TEAL, r: 6, label: T('(0,\\ \\tfrac52)'), pos: 'se', labelColor: TEAL }));
          await verdict(c, 1, true, `${T('m=\\dfrac43')}, ${T('b=\\dfrac52\\ne6')}`);
        } },
      { cap: `<b>Statement 3:</b> substitute ${T('(3,\\ 10)')}: ${T('4(3)-3(10)+18=12-30+18=0')} ✓. The point is on the line. <b>True.</b>`,
        run: async (c) => { await pop(c, G.point(3, 10, { color: YI, r: 8, coords: true, pos: 'w', labelColor: YI })); await verdict(c, 2, true, T('12-30+18=0')); } },
      { cap: 'Statements 2 and 3 only: answer <b>C</b>.',
        run: async (c) => { const s = h('div', 'u7l3-ansC', 'Answer: <b>C</b> (2 and 3 only)'); P.appendChild(s); await pop(c, s); } }
    ];
  }
};

/* =============================== mount =============================== */
mountTickets();
export const explainers = mountExplainers({ tidyUp, costumes, solveY, cover, sameInt, perp, build, judge });
export const _test = { TU, CO, SY, CV, red, fr, polyTex, gf, ruleStatus, scaleS, allLeft, mkState };
