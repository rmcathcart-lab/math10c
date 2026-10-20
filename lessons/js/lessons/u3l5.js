/* Math 10C · Unit 3 · Lesson 5 — Applying Polynomial Products to Area, Volume, and Equations:
 * the Frame It warm-up, the example figures and the explainers on this page. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

/* KaTeX allowing \htmlClass (terms that light up and cancel) */
const K = (src, display) => {
  src = String(src).replace(/\u202f/g, '\\,'); // a thin space in 1 681 → 1\,681
  try { return window.katex.renderToString(src, { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};
const T = (s) => tex(String(s).replace(/\u202f/g, '\\,')); // inline math in captions

/* Unit 3 tile colours: x² teal, x amber, 1 slate (x³ purple) */
const C3 = '#6a3fb0', C2 = '#0f5f5a', C1 = '#b06e08', C0 = '#3d5878';

/* ================= polynomials (any number of letters) ================= */
const dsum = (e) => e.reduce((a, b) => a + b, 0);
const lex = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
const byDeg = (a, b) => dsum(b.e) - dsum(a.e) || lex(b.e, a.e); // x² before x before 1; p² before pq before q²
const keyE = (k) => k.split(',').map(Number);
class Poly {
  constructor(vars, m) { this.vars = vars; this.m = m || new Map(); }
  static parse(s, vars) {
    const p = new Poly(vars);
    String(s).replace(/\s+/g, '').replace(/−/g, '-').replace(/(?!^)([+-])/g, ' $1').split(' ').forEach((t) => {
      if (!t) return;
      const mm = t.match(/^([+-]?)(\d*\.?\d*)(.*)$/), e = vars.map(() => 0);
      mm[3].replace(/([a-z])(?:\^\{?(\d+)\}?)?/g, (_, v, n) => { const i = vars.indexOf(v); if (i < 0) throw new Error('unknown letter ' + v); e[i] += n ? Number(n) : 1; return ''; });
      p.addTerm(e, (mm[1] === '-' ? -1 : 1) * (mm[2] === '' ? 1 : Number(mm[2])));
    });
    return p;
  }
  addTerm(e, c) { const k = e.join(','), v = Math.round(((this.m.get(k) || 0) + c) * 1e9) / 1e9; if (v === 0) this.m.delete(k); else this.m.set(k, v); return this; }
  plus(o) { const r = new Poly(this.vars, new Map(this.m)); o.m.forEach((c, k) => r.addTerm(keyE(k), c)); return r; }
  scale(s) { const r = new Poly(this.vars); this.m.forEach((c, k) => r.addTerm(keyE(k), c * s)); return r; }
  minus(o) { return this.plus(o.scale(-1)); }
  times(o) { const r = new Poly(this.vars); this.m.forEach((a, ka) => o.m.forEach((b, kb) => { const eb = keyE(kb); r.addTerm(keyE(ka).map((n, i) => n + eb[i]), a * b); })); return r; }
  terms() { return [...this.m].map(([k, c]) => ({ e: keyE(k), c })).sort(byDeg); }
  coef(e) { return this.m.get(e.join(',')) || 0; }
  deg() { return this.m.size ? Math.max(...this.terms().map((t) => dsum(t.e))) : -1; }
  at(vals) { let s = 0; this.m.forEach((c, k) => { s += c * keyE(k).reduce((p, n, i) => p * vals[i] ** n, 1); }); return Math.round(s * 1e9) / 1e9; }
  only(d) { const r = new Poly(this.vars); this.m.forEach((c, k) => { if (dsum(keyE(k)) === d) r.addTerm(keyE(k), c); }); return r; }
  tex(o) { return listTex(this.terms(), this.vars, o); }
  isConst() { return this.deg() <= 0; }
}
const partials = (A, B) => { const out = []; A.terms().forEach((a) => B.terms().forEach((b) => out.push({ e: a.e.map((n, i) => n + b.e[i]), c: a.c * b.c }))); return out; };
const numT = (a) => (Number.isInteger(a) ? fmt(a).replace(/ /g, '\\,') : String(+a.toFixed(4)));
const nv = (a) => (Number.isInteger(a) ? fmt(a) : String(+a.toFixed(4))); // a number in a caption
function colOf(e) { const d = dsum(e); if (e.length > 1 && d === 2) return e[0] === 2 ? C2 : e[e.length - 1] === 2 ? C0 : C1; return [C0, C1, C2, C3][d] || '#1c2230'; }
/* terms → LaTeX. o.color: tile colours; o.lead: wrap the terms of this degree in \htmlClass{u5-lead} (they cancel later) */
function listTex(ts, vars, o = {}) {
  if (!ts.length) return '0';
  return ts.map((t, i) => {
    const a = Math.abs(t.c), mono = t.e.map((n, j) => (n ? vars[j] + (n > 1 ? `^{${n}}` : '') : '')).join('');
    const body = (mono && a === 1 ? '' : numT(a)) + mono, sign = t.c < 0 ? '-' : i ? '+' : '';
    const s = o.color ? `\\textcolor{${colOf(t.e)}}{${body}}` : body;
    if (o.lead != null && dsum(t.e) === o.lead) return `\\htmlClass{u5-lead}{${i ? '{}' : ''}${sign}${s}}`;
    return sign + s;
  }).join('');
}
const one = (c, e, vars) => listTex([{ c, e }], vars);
/* "6x² − x² = 5x², 23x − 3x = 20x, …" for a caption */
function likeCap(A, B, sgn) {
  const keys = [...new Set([...A.m.keys(), ...B.m.keys()])].map((k) => ({ e: keyE(k) })).sort(byDeg), V = A.vars;
  return keys.filter(({ e }) => A.coef(e) && B.coef(e)).map(({ e }) => {
    const a = A.coef(e), b = B.coef(e), r = a + sgn * b, bt = one(b, e, V);
    return T(`${one(a, e, V)}${sgn < 0 ? '-' : '+'}${b < 0 ? `(${bt})` : bt}=${r ? one(r, e, V) : '0'}`);
  }).join(', ');
}
const single = (s) => /^(\d+(\.\d+)?)?[a-z]?(\^\{?\d+\}?)?$/.test(s); // one positive term: 24, 2w, s^2
const isNum = (s) => /^\d+(\.\d+)?$/.test(s);
const br = (s) => (single(s) ? s : `(${s})`);
function prodT(f, g) {
  if (f === g) return `${br(f)}^{2}`;
  if (single(f) && single(g)) return `${f}\\times${g}`;
  if (isNum(g)) return `${g}(${f})`;
  if (isNum(f)) return `${f}(${g})`;
  return `(${f})(${g})`;
}
const brT = (P, o) => (P.m.size === 1 && P.terms()[0].c > 0 ? P.tex(o) : `(${P.tex(o)})`);
/* a polynomial with numbers put in: 5(2)^2+20(2)+18 */
function subT(P, vals) {
  return P.terms().map((t, i) => {
    const a = Math.abs(t.c), hasV = t.e.some((n) => n); let body = hasV && a === 1 ? '' : numT(a);
    t.e.forEach((n, j) => { if (n) body += `(${numT(vals[j])})` + (n > 1 ? `^{${n}}` : ''); });
    return (t.c < 0 ? '-' : i ? '+' : '') + body;
  }).join('');
}
/* "15x + 8x = 23x" for the like partial products */
function collectCap(ts, vars) {
  const groups = new Map(); ts.forEach((t) => { const k = t.e.join(','); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(t); });
  return [...groups.values()].filter((g) => g.length > 1).map((g) => { const r = g.reduce((a, t) => a + t.c, 0); return T(listTex(g, vars) + '=' + (r ? one(r, g[0].e, vars) : '0')); }).join(', ');
}
const subCap = (P, vals) => T(`${subT(P, vals)}=${numT(P.at(vals))}`);

/* ================= drawing helpers ================= */
function stagePos(stage, el) { // element box in stage coordinates (the lesson may be scaled)
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1, r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2 - sr.left) / k, y: (r.top + r.height / 2 - sr.top) / k, l: (r.left - sr.left) / k, t: (r.top - sr.top) / k, r: (r.right - sr.left) / k, b: (r.bottom - sr.top) / k };
}
const ANCH = { a: ['-50%', '-100%', 0, -6], b: ['-50%', '0', 0, 6], l: ['-100%', '-50%', -10, 0], r: ['0', '-50%', 10, 0], c: ['-50%', '-50%', 0, 0] };
/* A figure in tikz-style units: x to the right, y UP, origin at (ox, oy) px in `host`. */
function figure(host, ox, oy, u) {
  const X = (x) => ox + x * u, Y = (y) => oy - y * u;
  let svg = null;
  const S = () => { if (!svg) { svg = svgEl('svg', { class: 'u5-svg' }); host.appendChild(svg); } return svg; };
  const pts = (p) => p.map(([x, y]) => X(x) + ',' + Y(y)).join(' ');
  const F = {
    X, Y, u,
    box: (x1, y1, x2, y2) => ({ l: X(x1), t: Y(y2), w: (x2 - x1) * u, h: (y2 - y1) * u }),
    rect(x1, y1, x2, y2, cls) { const d = h('div', 'u5-rect ' + (cls || '')), b = F.box(x1, y1, x2, y2); at(d, b.l, b.t); d.style.width = b.w + 'px'; d.style.height = b.h + 'px'; host.appendChild(d); return d; },
    path(p, cls, closed) { const e = svgEl(closed ? 'polygon' : 'polyline', { points: pts(p), class: cls || '' }); S().appendChild(e); return e; },
    line(x1, y1, x2, y2, cls) { const e = svgEl('line', { x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2), class: cls || '' }); S().appendChild(e); return e; },
    arrow(x1, y1, x2, y2, cls) { // double-headed dimension arrow
      const g = svgEl('g', { class: 'u5-arr ' + (cls || '') }), a = [X(x1), Y(y1)], b = [X(x2), Y(y2)], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, s = 8, w = 4.5;
      g.appendChild(svgEl('line', { x1: a[0] + ux * 3, y1: a[1] + uy * 3, x2: b[0] - ux * 3, y2: b[1] - uy * 3 }));
      const head = (p, d) => svgEl('polygon', { points: [[p[0], p[1]], [p[0] + d * ux * s - uy * w, p[1] + d * uy * s + ux * w], [p[0] + d * ux * s + uy * w, p[1] + d * uy * s - ux * w]].map((q) => q.join(',')).join(' ') });
      g.append(head(a, 1), head(b, -1)); S().appendChild(g); return g;
    },
    lab(x, y, src, an = 'c', cls = '') {
      const d = h('div', 'u5-lab ' + cls, K(src)), A = ANCH[an];
      at(d, X(x) + A[2], Y(y) + A[3]); d.style.translate = A[0] + ' ' + A[1]; host.appendChild(d); return d;
    }
  };
  return F;
}
/* written work: one LaTeX line per row */
function board(stage, o) {
  const rows = [];
  return {
    rows,
    line(src, p = {}) {
      const y = p.y != null ? p.y : o.y + rows.length * o.lh;
      const el = add(stage, h('div', 'u5-line' + (p.cls ? ' ' + p.cls : ''), K(src)), (p.x != null ? p.x : o.x) + (p.ind ? o.ind || 56 : 0), y); el.style.fontSize = (p.fs || o.fs) + 'px';
      hide(el); const r = { el, q: (s) => el.querySelector(s), qa: (s) => [...el.querySelectorAll(s)] }; rows.push(r); return r;
    }
  };
}
const showRow = (c, row, delay = 0) => c.anim(row.el, [{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], 420, { delay });
const fadeOut = (c, el, ms = 300) => c.anim(el, [{ opacity: getComputedStyle(el).opacity }, { opacity: 0 }], ms);
const glow = (c, el) => c.anim(el, [{ filter: 'drop-shadow(0 0 0 rgba(194,122,14,0))' }, { filter: 'drop-shadow(0 0 10px rgba(194,122,14,.9))', offset: 0.4 }, { filter: 'drop-shadow(0 0 0 rgba(194,122,14,0))' }], 900);
function tween(c, ms, fn) { // drive a redraw from 0 to 1 (eased); instant when replaying
  c.check();
  if (c.fast) { fn(1); return Promise.resolve(); }
  return new Promise((res, rej) => {
    const t0 = performance.now();
    const tick = (now) => { try { c.check(); } catch (e) { rej(e); return; } const t = Math.min(1, (now - t0) / ms); fn(1 - Math.pow(1 - t, 3)); if (t < 1) requestAnimationFrame(tick); else res(); };
    requestAnimationFrame(tick);
  });
}
/* the like terms that cancel: light them up, then strike them out */
async function cancelLeads(c, stage, row) {
  const els = row.qa('.u5-lead'); if (!els.length) return;
  els.forEach((e) => e.classList.add('lit'));
  await c.sleep(c.fast ? 0 : 500);
  const ss = els.map((el) => { const p = stagePos(stage, el), s = add(stage, h('div', 'u5-strike'), p.l - 3, p.y - 2); s.style.width = (p.r - p.l + 6) + 'px'; return s; });
  await Promise.all(ss.map((s, i) => c.anim(s, [{ transform: 'rotate(-14deg) scaleX(0)' }, { transform: 'rotate(-14deg) scaleX(1)' }], 380, { delay: i * 220 })));
  els.forEach((e) => e.classList.add('gone'));
}
const chkBox = (stage, x, y, w, html) => { const d = add(stage, h('div', 'u5-chk', html), x, y); d.style.width = w + 'px'; hide(d); return d; };
const swapLabs = (c, olds, news) => Promise.all([...olds.map((e) => fadeOut(c, e, 250)), ...news.map((e, i) => c.pop(e, 380, { delay: 200 + i * 90 }))]);

/* ============ 1. Strategy B: bounding box minus the notch ============ */
const LS = {
  pr: { W: '2x+3', H: 'x+4', nw: 'x+1', nh: '2', at: 3 },
  ex1: { W: '3x+4', H: '2x+5', nw: 'x+1', nh: 'x+2', at: 2 }
};
const lChoices = [{ v: 'pr', label: 'A new L' }, { sep: 'Example 1 check:' }, { v: 'ex1', label: 'Example 1' }];
function lSetup(stage, S) {
  const V = ['x'], P = (s) => Poly.parse(s, V), W = P(S.W), H = P(S.H), NW = P(S.nw), NH = P(S.nh), a = [S.at];
  const w = W.at(a), hh = H.at(a), nw = NW.at(a), nh = NH.at(a), u = Math.min(220 / w, 250 / hh);
  const F = figure(stage, 86 + (220 - w * u) / 2, 64 + hh * u + (250 - hh * u) / 2, u);
  const pA = F.rect(0, 0, w - nw, hh, 'keep'), pB = F.rect(w - nw, 0, w, hh - nh, 'keep');
  const notch = F.rect(w - nw, hh - nh, w, hh, 'notch'); hide(notch);
  F.path([[0, 0], [w, 0], [w, hh - nh], [w - nw, hh - nh], [w - nw, hh], [0, hh]], 'u5-out', true);
  const dash = F.path([[w - nw, hh], [w, hh], [w, hh - nh]], 'u5-dash');
  const labs = [F.lab(w / 2, 0, S.W, 'b'), F.lab(0, hh / 2, S.H, 'l'), F.lab(w - nw / 2, hh, S.nw, 'a'), F.lab(w, hh - nh / 2, S.nh, 'r')];
  const nums = [F.lab(w / 2, 0, nv(w), 'b', 'num'), F.lab(0, hh / 2, nv(hh), 'l', 'num'), F.lab(w - nw / 2, hh, nv(nw), 'a', 'num'), F.lab(w, hh - nh / 2, nv(nh), 'r', 'num')];
  hide(...nums);
  return { V, W, H, NW, NH, a, w, hh, nw, nh, F, pA, pB, notch, dash, labs, nums };
}
const notch = {
  title: 'Strategy B: the bounding box minus the notch',
  height: 440,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: lChoices,
  intro: (k) => `This L is a rectangle with its top-right corner cut away. <b>Strategy B:</b> find the area of the whole <b>bounding box</b>, then take away the <b>notch</b>.`,
  make(stage, key, ex) {
    const S = LS[key], L = lSetup(stage, S), { V, W, H, NW, NH, a } = L;
    const box = W.times(H), nt = NW.times(NH), area = box.minus(nt), xv = a[0];
    const B = board(stage, { x: 396, y: 18, lh: 47, fs: 24, ind: 62 });
    const pW = partials(W, H), pN = partials(NW, NH), nCol = pN.length !== nt.m.size;
    const r1 = B.line(`\\text{Box}=${prodT(S.W, S.H)}=${listTex(pW, V, { color: 1 })}`), r2 = B.line(`=${box.tex({ color: 1 })}`, { ind: 1 });
    const r3 = B.line(`\\text{Notch}=${prodT(S.nw, S.nh)}=${listTex(pN, V, { color: 1 })}`), r4 = nCol ? B.line(`=${nt.tex({ color: 1 })}`, { ind: 1 }) : null;
    const r5 = B.line(`\\text{Area}=(${box.tex({ color: 1 })})-${brT(nt, { color: 1 })}`), r6 = B.line(`=${area.tex({ color: 1 })}`, { ind: 1, cls: 'u5-res' });
    const boxHL = L.F.rect(0, 0, L.w, L.hh, 'boxhl'); hide(boxHL);
    const wv = L.w, hv = L.hh, nwv = L.nw, nhv = L.nh;
    const chk = chkBox(stage, 16, 378, ex.W - 32, `<b>Check at ${T(`x=${xv}`)}:</b> box ${T(`${nv(wv)}\\times${nv(hv)}=${nv(wv * hv)}`)}, notch ${T(`${nv(nwv)}\\times${nv(nhv)}=${nv(nwv * nhv)}`)}, L ${T(`=${nv(wv * hv - nwv * nhv)}`)}. &nbsp; <span class="nw">Polynomial: ${subCap(area, a)} <b class="ok">✓</b></span>`);
    return [{
      cap: `The <b>bounding box</b> is the smallest rectangle around the whole L: ${T(`(${S.W})`)} by ${T(`(${S.H})`)}. Multiply: <b>${pW.length} partial products</b>.`,
      run: async (c) => { await Promise.all([c.fadeIn(boxHL, 400), showRow(c, r1, 250)]); }
    }, {
      cap: `Collect the like terms (same colour): ${collectCap(pW, V)}. The box is ${T(box.tex())}.`,
      run: (c) => showRow(c, r2)
    }, {
      cap: `The <b>notch</b> is ${T(`(${S.nw})`)} by ${T(`(${S.nh})`)}, so its area is ${T(nt.tex())}.`,
      run: async (c) => { await Promise.all([fadeOut(c, boxHL, 250), c.fadeIn(L.notch, 400), showRow(c, r3, 200)]); if (r4) await showRow(c, r4); }
    }, {
      cap: `Take the notch away. Keep its <b>brackets</b>: the minus sign belongs to <b>every</b> term of the notch.`,
      run: (c) => Promise.all([c.anim(L.notch, [{ opacity: 1, transform: 'none' }, { opacity: 0.8, transform: 'translate(26px,-26px) rotate(6deg)', offset: 0.4 }, { opacity: 0, transform: 'translate(70px,-60px) rotate(12deg)' }], 800), showRow(c, r5, 300)])
    }, {
      cap: `Subtract like terms: ${likeCap(box, nt, -1)}. Area ${T(`=${area.tex()}`)}.`,
      run: (c) => c.pop(r6.el, 450)
    }, {
      cap: `<b>Check at ${T(`x=${xv}`)}</b>: put the number into the <b>figure</b> and into the <b>polynomial</b>. Both give <b>${nv(area.at(a))}</b>.`,
      run: (c) => Promise.all([swapLabs(c, L.labs, L.nums), c.fadeIn(chk, 400, { delay: 300 })])
    }];
  }
};

/* ============ 1b. Strategy A: slice into rectangles and add ============ */
const pieces = {
  title: 'Strategy A: slice it into rectangles and add',
  height: 400,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: lChoices,
  intro: `<b>Strategy A:</b> slice the L into rectangles that don’t overlap, find each area, and <b>add</b>.`,
  make(stage, key) {
    const S = LS[key], L = lSetup(stage, S), { V, W, H, NW, NH, F, w, hh, nw, nh } = L;
    const wA = W.minus(NW), hB = H.minus(NH), A = wA.times(H), Bp = NW.times(hB), sum = A.plus(Bp);
    const cut = F.line(w - nw, hh - nh, w - nw, 0, 'u5-cut'); hide(cut);
    const tA = F.lab((w - nw) / 2, hh / 2, '\\mathbf{A}', 'c', 'tag'), tB = F.lab(w - nw / 2, (hh - nh) / 2, '\\mathbf{B}', 'c', 'tag'); hide(tA, tB);
    const lA = F.lab((w - nw) / 2, hh, wA.tex(), 'a', 'der'), lB = F.lab(w, (hh - nh) / 2, hB.tex(), 'r', 'der'); hide(lA, lB);
    const B = board(stage, { x: 408, y: 18, lh: 50, fs: 24, ind: 62 });
    const r1 = B.line(`\\text{width of A}=(${S.W})-${br(S.nw)}=${wA.tex()}`), r2 = B.line(`\\text{height of B}=(${S.H})-${br(S.nh)}=${hB.tex()}`);
    const r3 = B.line(`A=${prodT(wA.tex(), S.H)}=${A.tex({ color: 1 })}`), r4 = B.line(`B=${prodT(S.nw, hB.tex())}=${Bp.tex({ color: 1 })}`);
    const r5 = B.line(`\\text{Area}=(${A.tex({ color: 1 })})+(${Bp.tex({ color: 1 })})`), r6 = B.line(`=${sum.tex({ color: 1 })}`, { ind: 1, cls: 'u5-res' });
    const same = add(stage, h('div', 'u5-same', `✓ same as Strategy B`), 408 + 62, 18 + 5 * 50 + 60); hide(same);
    return [{
      cap: `Slice straight down from the inside corner. Now there are two rectangles: <b>A</b> (tall) and <b>B</b> (short).`,
      run: async (c) => { L.pA.classList.add('pa'); L.pB.classList.add('pb'); await Promise.all([c.anim(cut, [{ opacity: 0, strokeDashoffset: 60 }, { opacity: 1, strokeDashoffset: 0 }], 500), c.pop(tA, 350, { delay: 300 }), c.pop(tB, 350, { delay: 450 })]); }
    }, {
      cap: `A’s width isn’t labelled. It is the whole bottom minus the part under the notch: ${T(`(${S.W})-${br(S.nw)}=${wA.tex()}`)}.`,
      run: (c) => Promise.all([c.pop(lA, 400), showRow(c, r1, 150)])
    }, {
      cap: `B’s height: the whole height minus the notch: ${T(`(${S.H})-${br(S.nh)}=${hB.tex()}`)}. <b>A missing side is a subtraction.</b>`,
      run: (c) => Promise.all([c.pop(lB, 400), showRow(c, r2, 150)])
    }, {
      cap: `Rectangle A is ${T(`(${wA.tex()})`)} by ${T(`(${S.H})`)}: ${T(`${prodT(wA.tex(), S.H)}=${listTex(partials(wA, H), V)}=${A.tex()}`)}.`,
      run: (c) => Promise.all([glow(c, L.pA), showRow(c, r3)])
    }, {
      cap: `Rectangle B is ${T(`(${S.nw})`)} by ${T(`(${hB.tex()})`)}: ${T(`${prodT(S.nw, hB.tex())}=${listTex(partials(NW, hB), V)}=${Bp.tex()}`)}.`,
      run: (c) => Promise.all([glow(c, L.pB), showRow(c, r4)])
    }, {
      cap: `<b>Add</b> the pieces: ${likeCap(A, Bp, 1)}. The same trinomial as Strategy B, ${T(sum.tex())}. Use whichever strategy is easier to see.`,
      run: async (c) => { await showRow(c, r5); await c.pop(r6.el, 450); await c.pop(same, 350); }
    }];
  }
};

/* ============ 2. Frames: outer area minus the opening ============ */
const FR = {
  photo: { V: ['w'], W: '30+2w', H: '20+2w', sx: 'w', sy: 'w', chk: [5], note: 'the photo itself' },
  mat: { V: ['x'], W: 'x+10', H: 'x+6', sx: '2', sy: '2', chk: [4] },
  ex2: { V: ['p', 'q'], W: '4p+3q', H: '3p+5q', sx: 'p', sy: 'q', chk: [2, 1], disp: { W: 6, H: 4, sx: 1.2, sy: 1 } }
};
const frame = {
  title: 'A frame: the outer area minus the opening',
  height: 460,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'photo', label: 'The warm-up photo frame' }, { v: 'mat', label: 'A picture mat' }, { sep: 'Example 2 check:' }, { v: 'ex2', label: 'Example 2' }],
  intro: (k) => { const S = FR[k]; return `The frame is a big rectangle, ${T(`(${S.W})`)} by ${T(`(${S.H})`)}, with an opening cut out of it. Shaded area = <b>outer − opening</b>. First we need the opening’s size.`; },
  make(stage, key, ex) {
    const S = FR[key], V = S.V, P = (s) => Poly.parse(s, V), W = P(S.W), H = P(S.H), SX = P(S.sx), SY = P(S.sy), cv = S.chk;
    const iW = W.minus(SX.scale(2)), iH = H.minus(SY.scale(2)), outer = W.times(H), inner = iW.times(iH), fr = outer.minus(inner);
    const tv = { W: W.at(cv), H: H.at(cv), sx: SX.at(cv), sy: SY.at(cv) }, dv = S.disp || tv;
    const geo = (d) => { const u = Math.min(240 / d.W, 240 / d.H); return { d, u, ox: 215 - (d.W * u) / 2, oy: 200 + (d.H * u) / 2 }; };
    const g0 = geo(dv), g1 = geo(tv);
    const F = figure(stage, g0.ox, g0.oy, g0.u), d = dv;
    const out = F.rect(0, 0, d.W, d.H, 'keep frame'), hole = F.rect(d.sx, d.sy, d.W - d.sx, d.H - d.sy, 'hole'), plug = F.rect(d.sx, d.sy, d.W - d.sx, d.H - d.sy, 'plug'); hide(plug);
    const qx = d.sx + 0.2 * (d.W - 2 * d.sx);
    const arrs = [F.arrow(0, d.sy / 2, d.sx, d.sy / 2), F.arrow(d.W - d.sx, d.sy / 2, d.W, d.sy / 2), F.arrow(qx, 0, qx, d.sy), F.arrow(qx, d.H - d.sy, qx, d.H)];
    const sm = [F.lab(d.sx / 2, d.sy / 2, S.sx, 'a', 'sm'), F.lab(d.W - d.sx / 2, d.sy / 2, S.sx, 'a', 'sm'), F.lab(qx, d.sy / 2, S.sy, 'r', 'sm'), F.lab(qx, d.H - d.sy / 2, S.sy, 'r', 'sm')];
    sm.forEach((e) => { e.style.marginTop = '-4px'; });
    const labs = [F.lab(d.W / 2, d.H, S.W, 'a'), F.lab(0, d.H / 2, S.H, 'l')];
    const dW = F.lab(d.W / 2, d.H - d.sy, iW.tex(), 'b', 'der'), dH = F.lab(d.W - d.sx, d.sy + (d.H - 2 * d.sy) * 0.27, iH.tex(), 'l', 'der'); hide(dW, dH);
    // numbers at the check values, drawn to scale
    const N = figure(stage, g1.ox, g1.oy, g1.u), t = tv;
    const nums = [N.lab(t.W / 2, t.H, nv(t.W), 'a', 'num'), N.lab(0, t.H / 2, nv(t.H), 'l', 'num'), N.lab(t.W / 2, t.H - t.sy, nv(t.W - 2 * t.sx), 'b', 'num'), N.lab(t.W - t.sx, t.sy + (t.H - 2 * t.sy) * 0.27, nv(t.H - 2 * t.sy), 'l', 'num')]; hide(...nums);
    const B = board(stage, { x: 376, y: 16, lh: 50, fs: 24, ind: 70 });
    const twice = (s, P1) => (P1.isConst() || P1.m.size > 1 ? `2(${s})` : `2${s}`);
    const r1 = B.line(`\\text{opening width}=(${S.W})-${twice(S.sx, SX)}=${iW.tex()}`), r2 = B.line(`\\text{opening height}=(${S.H})-${twice(S.sy, SY)}=${iH.tex()}`);
    const r3 = B.line(`\\text{Outer}=${prodT(S.W, S.H)}=${outer.tex({ color: 1 })}`), r4 = B.line(`\\text{Opening}=${prodT(iW.tex(), iH.tex())}=${inner.tex({ color: 1 })}`);
    const r5 = B.line(`\\text{Frame}=(${outer.tex({ color: 1 })})-${brT(inner, { color: 1 })}`), r6 = B.line(`=${fr.tex({ color: 1 })}`, { ind: 1, cls: 'u5-res' });
    const vs = V.map((v, i) => `${v}=${nv(cv[i])}`).join(',\\ '), ow = t.W - 2 * t.sx, oh = t.H - 2 * t.sy;
    const chk = chkBox(stage, 16, 386, ex.W - 32, `<b>Check at ${T(vs)}:</b> outer ${T(`${nv(t.W)}\\times${nv(t.H)}=${nv(t.W * t.H)}`)}, opening ${T(`${nv(ow)}\\times${nv(oh)}=${nv(ow * oh)}`)}, frame ${T(`=${nv(t.W * t.H - ow * oh)}`)}. &nbsp; <span class="nw">Polynomial: ${subCap(fr, cv)} <b class="ok">✓</b></span>`);
    const morph = async (c) => {
      if (!S.disp) return;
      const to = (x1, y1, x2, y2) => { const b = { l: g1.ox + x1 * g1.u, t: g1.oy - y2 * g1.u, w: (x2 - x1) * g1.u, h: (y2 - y1) * g1.u }; return { left: b.l + 'px', top: b.t + 'px', width: b.w + 'px', height: b.h + 'px' }; };
      const from = (el) => ({ left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height });
      await Promise.all([[out, to(0, 0, t.W, t.H)], [hole, to(t.sx, t.sy, t.W - t.sx, t.H - t.sy)]].map(([el, k]) => c.anim(el, [from(el), k], 900, { easing: 'ease-in-out' })));
    };
    return [{
      cap: `The opening is set in by ${T(S.sx)} on the left <b>and</b> on the right, so ${T(twice(S.sx, SX))} comes off the width: ${T(`(${S.W})-${twice(S.sx, SX)}=${iW.tex()}`)}${iW.isConst() && S.note ? ` (${S.note})` : ''}.`,
      run: async (c) => { await Promise.all([glow(c, arrs[0]), glow(c, arrs[1]), c.pop(dW, 400, { delay: 250 }), showRow(c, r1, 200)]); }
    }, {
      cap: `It is set in by ${T(S.sy)} at the top <b>and</b> at the bottom: ${T(`(${S.H})-${twice(S.sy, SY)}=${iH.tex()}`)}.`,
      run: async (c) => { await Promise.all([glow(c, arrs[2]), glow(c, arrs[3]), c.pop(dH, 400, { delay: 250 }), showRow(c, r2, 200)]); }
    }, {
      cap: `The <b>outer</b> rectangle, opening included: ${T(`${prodT(S.W, S.H)}=${listTex(partials(W, H), V)}`)} ${T(`=${outer.tex()}`)}.`,
      run: async (c) => { plug.className = 'u5-rect plug'; await Promise.all([c.fadeIn(plug, 400, { from: 'scale(.9)' }), showRow(c, r3, 150)]); }
    }, {
      cap: `The <b>opening</b>: ${T(`${prodT(iW.tex(), iH.tex())}=${inner.tex()}`)}.`,
      run: async (c) => { plug.classList.add('red'); await Promise.all([glow(c, plug), showRow(c, r4, 150)]); }
    }, {
      cap: `Cut the opening out: frame = <b>outer − opening</b>. Keep the brackets: the minus sign applies to <b>every</b> term of the opening.`,
      run: (c) => Promise.all([c.anim(plug, [{ opacity: 1, transform: 'none' }, { opacity: 0.85, transform: 'translate(30px,-34px) rotate(-5deg)', offset: 0.4 }, { opacity: 0, transform: 'translate(90px,-80px) rotate(-10deg) scale(.9)' }], 850), showRow(c, r5, 300)])
    }, {
      cap: `Subtract like terms: ${likeCap(outer, inner, -1)}. The frame is ${T(fr.tex())}.`,
      run: (c) => c.pop(r6.el, 450)
    }, {
      cap: `<b>Check at ${T(vs)}</b>: the frame’s own lengths and the polynomial both give <b>${nv(fr.at(cv))}</b>.` + (S.disp ? ` Drawn <b>to scale</b> it looks different: the outside is really a <b>square</b>! Trust the labels, not the sketch.` : ''),
      run: async (c) => { await Promise.all([...[...labs, ...sm, dW, dH].map((e) => fadeOut(c, e, 250)), ...arrs.map((e) => fadeOut(c, e, 250))]); await morph(c); await Promise.all([...nums.map((e, i) => c.pop(e, 380, { delay: i * 90 })), c.fadeIn(chk, 400, { delay: 200 })]); }
    }];
  }
};

/* ============ 3. Garden: big rectangle minus the flower beds ============ */
const GD = {
  two: { V: ['n'], L: '2n+10', W: 'n+6', k: 2, s: 'n+1', chk: [3] },
  ex3: { V: ['n'], L: '3n+12', W: 'n+9', k: 3, s: 'n+2', chk: [2] }
};
const garden = {
  title: 'Grass = garden − flower beds',
  height: 470,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'two', label: 'Two flower beds' }, { sep: 'Example 3 check:' }, { v: 'ex3', label: 'Example 3' }],
  intro: (k) => { const S = GD[k]; return `A garden ${T(`(${S.L})`)} m by ${T(`(${S.W})`)} m holds <b>${S.k}</b> square flower beds, each ${T(`(${S.s})`)} m on a side. How much is <b>grass</b>?`; },
  make(stage, key, ex) {
    const S = GD[key], V = S.V, P = (s) => Poly.parse(s, V), Lp = P(S.L), Wp = P(S.W), Sp = P(S.s), cv = S.chk, n = S.k;
    const gar = Lp.times(Wp), bed = Sp.times(Sp), beds = bed.scale(n), grass = gar.minus(beds), D = gar.deg(), cancels = grass.deg() < D;
    const Lv = Lp.at(cv), Wv = Wp.at(cv), sv = Sp.at(cv), u = Math.min(256 / Lv, 220 / Wv), gap = (Lv - n * sv) / (n + 1), by = (Wv - sv) / 2;
    const F = figure(stage, 212 - (Lv * u) / 2, 196 + (Wv * u) / 2, u);
    const g = F.rect(0, 0, Lv, Wv, 'grass');
    const bx = Array.from({ length: n }, (_, i) => gap + i * (sv + gap));
    const ghosts = bx.map((x) => F.rect(x, by, x + sv, by + sv, 'ghost'));
    const bedEls = bx.map((x) => F.rect(x, by, x + sv, by + sv, 'bed')); hide(...bedEls);
    const labs = [F.lab(Lv / 2, Wv, S.L, 'a'), F.lab(0, Wv / 2, S.W, 'l')];
    const ar = F.arrow(bx[0], by + sv + 0.55, bx[0] + sv, by + sv + 0.55), sl = F.lab(bx[0] + sv, by + sv + 0.55, S.s, 'r', 'sm'); hide(ar, sl);
    const nums = [F.lab(Lv / 2, Wv, nv(Lv), 'a', 'num'), F.lab(0, Wv / 2, nv(Wv), 'l', 'num'), F.lab(bx[0] + sv, by + sv + 0.55, nv(sv), 'r', 'num sm')]; hide(...nums);
    const B = board(stage, { x: 364, y: 16, lh: 50, fs: 23, ind: 84 });
    const r1 = B.line(`\\text{Garden}=${prodT(S.L, S.W)}=${listTex(partials(Lp, Wp), V, { color: 1 })}`), r2 = B.line(`=${gar.tex({ color: 1 })}`, { ind: 1 });
    const r3 = B.line(`\\text{One bed}=(${S.s})^{2}=${bed.tex({ color: 1 })}`), r4 = B.line(`${n}\\text{ beds}=${n}(${bed.tex()})=${beds.tex({ color: 1 })}`);
    const r5 = B.line(`\\text{Grass}=(${gar.tex({ color: 1, lead: cancels ? D : null })})-(${beds.tex({ color: 1, lead: cancels ? D : null })})`), r6 = B.line(`=${grass.tex({ color: 1 })}`, { ind: 1, cls: 'u5-res' });
    const v0 = V[0], gv = Lv * Wv, bv = n * sv * sv;
    const chk = chkBox(stage, 16, 386, ex.W - 32, `<b>Check at ${T(`${v0}=${nv(cv[0])}`)}:</b> garden ${T(`${nv(Lv)}\\times${nv(Wv)}=${nv(gv)}`)}, beds ${T(`${n}\\times${nv(sv)}^2=${nv(bv)}`)}, grass ${T(`=${nv(gv - bv)}`)} m². &nbsp; <span class="nw">Polynomial: ${subCap(grass, cv)} <b class="ok">✓</b></span>`);
    const lead = (p) => p.only(D).tex(), wrong = Sp.only(1).times(Sp.only(1)).plus(Sp.only(0).times(Sp.only(0)));
    return [{
      cap: `The whole garden: ${T(prodT(S.L, S.W))}. Multiply: ${pCount(Lp, Wp)} partial products.`,
      run: (c) => Promise.all([glow(c, g), showRow(c, r1, 150)])
    }, {
      cap: `Collect the like terms: ${collectCap(partials(Lp, Wp), V)}. The garden is ${T(gar.tex())} m².`,
      run: (c) => showRow(c, r2)
    }, {
      cap: `One bed: ${T(`(${S.s})^2=(${S.s})(${S.s})=${listTex(partials(Sp, Sp), V)}=${bed.tex()}`)}. <b>Not</b> ${T(wrong.tex())}!`,
      run: async (c) => { await Promise.all([c.pop(bedEls[0], 400), c.fadeIn(ar, 300), c.pop(sl, 350), showRow(c, r3, 150)]); }
    }, {
      cap: `There are <b>${n}</b> beds. Square first, then multiply by ${n}: ${T(`${n}(${bed.tex()})=${beds.tex()}`)}.`,
      run: (c) => Promise.all([...bedEls.slice(1).map((e, i) => c.pop(e, 400, { delay: i * 200 })), showRow(c, r4, 200)])
    }, {
      cap: `Grass = garden − beds. Keep the brackets.`,
      run: (c) => Promise.all([...bedEls.map((e, i) => c.anim(e, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-40px) scale(.85)' }], 650, { delay: i * 120 })), showRow(c, r5, 250)])
    }, {
      cap: cancels ? `The ${T(lead(gar))} and the ${T(lead(beds))} <b>cancel</b>. Then ${likeCap(gar.minus(gar.only(D)), beds.minus(beds.only(D)), -1)}. Grass ${T(`=${grass.tex()}`)} m².` : `Subtract like terms: ${likeCap(gar, beds, -1)}. Grass ${T(`=${grass.tex()}`)} m².`,
      run: async (c) => { await cancelLeads(c, stage, r5); await c.pop(r6.el, 450); }
    }, {
      cap: `<b>Check at ${T(`${v0}=${nv(cv[0])}`)}</b> with the real dimensions: grass ${T(`=${nv(gv)}-${nv(bv)}=${nv(gv - bv)}`)} m², the same as ${T(`${subT(grass, cv)}`)}.`,
      run: (c) => Promise.all([swapLabs(c, [...labs, sl], nums), ...bedEls.map((e) => c.anim(e, [{ opacity: 0, transform: 'none' }, { opacity: 1, transform: 'none' }], 400)), c.fadeIn(chk, 400, { delay: 300 })])
    }];
  }
};
const pCount = (A, B) => A.m.size * B.m.size;

/* ============ 3b. Volume of a box: base × height ============ */
const BX = {
  a: { l: 'x+1', w: 'x+2', h: 'x+3', chk: 2 },
  b: { l: '2x+1', w: 'x+3', h: 'x-1', chk: 3 },
  c: { l: 'x+2', w: 'x+2', h: 'x+2', chk: 3, cube: true }
};
const box = {
  title: 'Volume = base area × height',
  height: 430,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'a', label: tex('(x+1)(x+2)(x+3)') }, { v: 'b', label: tex('(2x+1)(x+3)(x-1)') }, { v: 'c', label: 'a cube, ' + tex('(x+2)^3') }],
  intro: (k) => { const S = BX[k]; return S.cube ? `A cube with edges ${T(`(${S.l})`)}: its volume is ${T(`(${S.l})^3=(${S.l})(${S.l})(${S.l})`)}. Three factors, so we multiply <b>twice</b>.` : `A box ${T(`(${S.l})`)} long, ${T(`(${S.w})`)} wide and ${T(`(${S.h})`)} high. Three factors, so we multiply <b>twice</b>.`; },
  make(stage, key) {
    const S = BX[key], V = ['x'], P = (s) => Poly.parse(s, V), Lp = P(S.l), Wp = P(S.w), Hp = P(S.h), xv = S.chk;
    const base = Lp.times(Wp), vol = base.times(Hp), lv = Lp.at([xv]), wv = Wp.at([xv]), hv = Hp.at([xv]);
    const u = Math.min(300 / (lv + 0.55 * wv), 280 / (hv + 0.45 * wv)), Lw = lv * u, dx = 0.55 * wv * u, dy = 0.45 * wv * u, Hh = hv * u;
    const x0 = 40 + (340 - Lw - dx) / 2, y0 = 60 + dy + Hh + (280 - Hh - dy) / 2;
    const svg = add(stage, svgEl('svg', { class: 'u5-svg u5-box' }), 0, 0);
    const mk = (cls) => { const p = svgEl('polygon', { class: cls }); svg.appendChild(p); return p; };
    const front = mk('f-front'), side = mk('f-side'), top = mk('f-top');
    const hid = svgEl('polyline', { class: 'u5-hid' }); svg.appendChild(hid);
    const P2 = (pts) => pts.map((p) => p.join(',')).join(' ');
    const draw = (t) => {
      const hh = Hh * t;
      front.setAttribute('points', P2([[x0, y0], [x0 + Lw, y0], [x0 + Lw, y0 - hh], [x0, y0 - hh]]));
      side.setAttribute('points', P2([[x0 + Lw, y0], [x0 + Lw + dx, y0 - dy], [x0 + Lw + dx, y0 - dy - hh], [x0 + Lw, y0 - hh]]));
      top.setAttribute('points', P2([[x0, y0 - hh], [x0 + Lw, y0 - hh], [x0 + Lw + dx, y0 - dy - hh], [x0 + dx, y0 - dy - hh]]));
      hid.setAttribute('points', P2([[x0, y0], [x0 + dx, y0 - dy], [x0 + Lw + dx, y0 - dy], [x0 + dx, y0 - dy], [x0 + dx, y0 - dy - hh]]));
      hid.style.opacity = t > 0.02 ? 1 : 0; front.style.opacity = side.style.opacity = t > 0.02 ? 1 : 0;
      top.classList.toggle('base', t < 0.02);
    };
    draw(0);
    const lab = (x, y, src, an, cls) => { const d = add(stage, h('div', 'u5-lab ' + (cls || ''), K(src)), x + ANCH[an][2], y + ANCH[an][3]); d.style.translate = ANCH[an][0] + ' ' + ANCH[an][1]; return d; };
    const lL = lab(x0 + Lw / 2, y0, S.l, 'b'), lW = lab(x0 + Lw + dx / 2 + 4, y0 - dy / 2 + 14, S.w, 'r'), lH = lab(x0, y0 - Hh / 2, S.h, 'l'); hide(lH);
    const nL = lab(x0 + Lw / 2, y0, nv(lv), 'b', 'num'), nW = lab(x0 + Lw + dx / 2 + 4, y0 - dy / 2 + 14, nv(wv), 'r', 'num'), nH = lab(x0, y0 - Hh / 2, nv(hv), 'l', 'num'); hide(nL, nW, nH);
    const bl = lab(x0 + Lw / 2 + dx / 2, y0 - dy / 2, '\\text{base}', 'c', 'tag'); hide(bl);
    const B = board(stage, { x: 430, y: 18, lh: 54, fs: 25, ind: 30 });
    const pv = partials(base, Hp);
    const r1 = B.line(`\\text{Base}=${prodT(S.l, S.w)}=${base.tex({ color: 1 })}`), r2 = B.line(`V=\\text{base}\\times\\text{height}=(${base.tex({ color: 1 })})(${S.h})`);
    const r3 = B.line(`=${listTex(pv, V, { color: 1 })}`, { ind: 1 }), r4 = B.line(`=${vol.tex({ color: 1 })}`, { ind: 1, cls: 'u5-res' });
    const chk = chkBox(stage, 430, 300, 520, `<b>Check at ${T(`x=${xv}`)}:</b> the box is ${T(`${nv(lv)}\\times${nv(wv)}\\times${nv(hv)}=${nv(lv * wv * hv)}`)}<br>${subCap(vol, [xv])} <b class="ok">✓</b>`);
    return [{
      cap: `Start with the <b>base</b>, a rectangle ${T(`(${S.l})`)} by ${T(`(${S.w})`)}: ${T(`${prodT(S.l, S.w)}=${listTex(partials(Lp, Wp), V)}=${base.tex()}`)}.`,
      run: (c) => Promise.all([c.pop(bl, 380), glow(c, top), showRow(c, r1, 150)])
    }, {
      cap: `Stack the base up to a height of ${T(`(${S.h})`)}. Volume = <b>base × height</b>: a trinomial times a binomial.`,
      run: async (c) => { await c.anim(bl, [{ opacity: 1 }, { opacity: 0 }], 200); await Promise.all([tween(c, 1000, draw), c.fadeIn(lH, 300, { delay: 700 }), showRow(c, r2, 300)]); }
    }, {
      cap: `Every term of the trinomial times every term of the binomial: ${base.m.size} × ${Hp.m.size} = <b>${pv.length} partial products</b>.`,
      run: (c) => showRow(c, r3)
    }, {
      cap: `Collect the like terms (same colour): ${collectCap(pv, V)}. ${T(`V=${vol.tex()}`)}${S.cube ? ', the cube of a binomial' : ''}.`,
      run: (c) => c.pop(r4.el, 450)
    }, {
      cap: `<b>Check at ${T(`x=${xv}`)}</b>: the box is ${nv(lv)} by ${nv(wv)} by ${nv(hv)}, so ${T(`V=${nv(lv * wv * hv)}`)}. The polynomial gives ${T(`${subT(vol, [xv])}=${nv(vol.at([xv]))}`)} ✓`,
      run: (c) => Promise.all([swapLabs(c, [lL, lW, lH], [nL, nW, nH]), c.fadeIn(chk, 400, { delay: 300 })])
    }];
  }
};

/* ============ 4. Equations: expand both sides, the squared terms cancel ============ */
const EQ = {
  grow: { V: ['x'], src: '(x+2)^{2}=x^{2}+24', L: [[1, 'x+2', 'x+2']], R: [[1, 'x', 'x'], [1, '24']], fig: 'grow' },
  photo: { V: ['s'], src: '(s+4)^{2}-s^{2}=96', L: [[1, 's+4', 's+4'], [-1, 's', 's']], R: [[1, '96']], fig: 'photo' },
  ex4: { V: ['x'], src: '(5x+1)^{2}=(4x+8)^{2}+(3x-15)^{2}', L: [[1, '5x+1', '5x+1']], R: [[1, '4x+8', '4x+8'], [1, '3x-15', '3x-15']], fig: 'tri' }
};
const fracT = (p, q) => { const g = (a, b) => (b ? g(b, a % b) : Math.abs(a)); const d = g(p, q) || 1; p /= d; q /= d; if (q < 0) { p = -p; q = -q; } return q === 1 ? numT(p) : `${p < 0 ? '-' : ''}\\dfrac{${Math.abs(p)}}{${q}}`; };
const cancel = {
  title: 'Expand both sides, and watch the squares cancel',
  height: 470,
  choices: [{ v: 'grow', label: 'A growing square' }, { v: 'photo', label: 'Framed photo' }, { sep: 'Example 4 check:' }, { v: 'ex4', label: 'Example 4' }],
  intro: (k) => ({
    grow: `A square’s sides grow by 2 cm, and its area grows by 24 cm². How long were the sides? The rule: <b>new area = old area + 24</b>.`,
    photo: `A square photo gets a 2 cm frame all the way around. The frame’s area is 96 cm². The rule: <b>outside square − photo = frame</b>.`,
    ex4: `A right triangle with polynomial sides. The rule that must hold is the <b>Pythagorean theorem</b>: (leg)² + (leg)² = (hypotenuse)².`
  })[k],
  make(stage, key, ex) {
    const S = EQ[key], V = S.V, v = V[0], P = (s) => Poly.parse(s, V);
    const items = (side) => side.map(([k, f, g]) => ({ k, f, g, p: (g ? P(f).times(P(g)) : P(f)).scale(k) }));
    const Li = items(S.L), Ri = items(S.R);
    const sum = (its) => its.reduce((a, it) => a.plus(it.p), new Poly(V));
    const Lc = sum(Li), Rc = sum(Ri), D = Math.max(...[...Li, ...Ri].map((it) => it.p.deg()));
    const cross = Lc.deg() === D && Rc.deg() === D && Lc.coef([D]) === Rc.coef([D]);
    const side = (its, o) => its.map((it, i) => { const q = it.k < 0 ? it.p.scale(-1) : it.p, s = q.tex(o), br = its.length > 1 && q.m.size > 1; return (it.k < 0 ? '-' : i ? '+' : '') + (br ? `(${s})` : s); }).join('');
    const inner = !cross; // the squares cancel while collecting one side
    const showE2 = `${side(Li, { color: 1 })}=${side(Ri, { color: 1 })}` !== `${Lc.tex({ color: 1 })}=${Rc.tex({ color: 1 })}`;
    const l1 = (p) => ((inner && p.deg() < D) || (cross && !showE2) ? D : null);
    const e1 = `${side(Li, { color: 1, lead: l1(Lc) })}=${side(Ri, { color: 1, lead: l1(Rc) })}`;
    const e2 = `${Lc.tex({ color: 1, lead: cross ? D : null })}=${Rc.tex({ color: 1, lead: cross ? D : null })}`;
    const Ll = cross ? Lc.minus(Lc.only(D)) : Lc, Rl = cross ? Rc.minus(Rc.only(D)) : Rc;
    const a1 = Ll.coef([1]), b1 = Ll.coef([0]), a2 = Rl.coef([1]), b2 = Rl.coef([0]), A = a1 - a2, Bc = b2 - b1, sol = Bc / A;
    // the figure
    const fx = S.fig === 'tri' ? 292 : 300, nums = [], labs = [];
    if (S.fig === 'tri') {
      const F = figure(stage, 100, 230, 38);
      F.path([[0, 0], [5, 0], [0, 3]], 'u5-tri', true); F.path([[0, 0.35], [0.35, 0.35], [0.35, 0]], 'u5-ra');
      labs.push(F.lab(2.5, 0, '4x+8', 'b'), F.lab(0, 1.5, '3x-15', 'l'), F.lab(3.1, 2.0, '5x+1', 'c'));
      const vals = ['4x+8', '3x-15', '5x+1'].map((s) => P(s).at([sol]));
      nums.push(F.lab(2.5, 0, nv(vals[0]), 'b', 'num'), F.lab(0, 1.5, nv(vals[1]), 'l', 'num'), F.lab(3.1, 2.0, nv(vals[2]), 'c', 'num'));
      const rb = add(stage, h('div', 'u5-rulebox', K('a^2+b^2=c^2')), 96, 300); rb.style.width = '196px';
    } else {
      const grow = S.fig === 'grow', side0 = sol, outer = grow ? sol + 2 : sol + 4, u = 210 / outer, F = figure(stage, 50, 280, u);
      if (grow) {
        F.rect(0, 0, outer, outer, 'strip'); F.rect(0, 0, side0, side0, 'keep sq');
        labs.push(F.lab(outer / 2, outer, 'x+2', 'a'), F.lab(side0 / 2, 0, 'x', 'b'), F.lab(side0 + 1, 0, '2', 'b'), F.lab(side0 / 2, side0 / 2, 'x^2', 'c', 'in'), F.lab(outer / 2, side0 + 1, '+24', 'c', 'in'));
        nums.push(F.lab(outer / 2, outer, nv(outer), 'a', 'num'), F.lab(side0 / 2, 0, nv(side0), 'b', 'num'), F.lab(side0 + 1, 0, '2', 'b', 'num'), F.lab(side0 / 2, side0 / 2, nv(side0 * side0), 'c', 'num in'), F.lab(outer / 2, side0 + 1, '+24', 'c', 'num in'));
      } else {
        F.rect(0, 0, outer, outer, 'keep frame'); F.rect(2, 2, outer - 2, outer - 2, 'photo');
        F.arrow(outer - 2, outer / 2, outer, outer / 2);
        labs.push(F.lab(outer / 2, outer, 's+4', 'a'), F.lab(outer / 2, 2, 's', 'a', 'in'), F.lab(outer, outer / 2, '2', 'r', 'sm'));
        nums.push(F.lab(outer / 2, outer, nv(outer), 'a', 'num'), F.lab(outer / 2, 2, nv(side0), 'a', 'num in'), F.lab(outer, outer / 2, '2', 'r', 'num sm'));
        F.lab(outer / 2, outer / 2 + 1.2, '\\text{photo}', 'c', 'in');
        const rb = add(stage, h('div', 'u5-rulebox', `frame = <b>96</b> cm²`), 50, 300); rb.style.width = '210px';
      }
    }
    hide(...nums);
    const B = board(stage, { x: fx + 18, y: 16, lh: 54, fs: 24, ind: 0 });
    const r0 = B.line(S.src), r1 = B.line(e1), r2 = showE2 ? B.line(e2) : null;
    const r3 = cross ? B.line(`${Ll.tex({ color: 1 })}=${Rl.tex({ color: 1 })}`) : null;
    const r4 = B.line(`${one(A, [1], V)}=${numT(Bc)}`), r5 = B.line(`${v}=${fracT(Bc, A)}`, { cls: 'u5-res' });
    const cr = cross ? (r2 || r1) : r1, Dt = (p) => T(p.only(D).tex());
    // check
    let chkHtml;
    const [ta, tb, tc] = S.fig === 'tri' ? ['4x+8', '3x-15', '5x+1'].map((s) => P(s).at([sol])) : [0, 0, 0];
    if (S.fig === 'tri') { const [a, b, c2] = [ta, tb, tc]; chkHtml = `<b>Sides:</b> ${nv(b)} cm, ${nv(a)} cm, ${nv(c2)} cm. &nbsp;${T(`${nv(b)}^2+${nv(a)}^2=${numT(b * b)}+${numT(a * a)}=${numT(a * a + b * b)}=${nv(c2)}^2`)} <b class="ok">✓</b>`; }
    else if (S.fig === 'grow') chkHtml = `<b>Check:</b> new area ${T(`${nv(sol + 2)}^2=${nv((sol + 2) ** 2)}`)} and old area + 24 ${T(`=${nv(sol)}^2+24=${nv(sol * sol + 24)}`)} <b class="ok">✓</b>`;
    else chkHtml = `<b>Check:</b> ${T(`${nv(sol + 4)}^2-${nv(sol)}^2=${nv((sol + 4) ** 2)}-${nv(sol * sol)}=${nv((sol + 4) ** 2 - sol * sol)}`)} <b class="ok">✓</b> The photo is ${nv(sol)} cm by ${nv(sol)} cm.`;
    const chk = chkBox(stage, 16, 418, ex.W - 32, chkHtml);
    const expCap = [...Li, ...Ri].filter((it) => it.g && P(it.f).m.size > 1).map((it) => T(`${prodT(it.f, it.g)}=${P(it.f).times(P(it.g)).tex()}`)).join(', ');
    const steps = [{
      cap: { tri: `Pythagorean theorem: ${T('(\\text{hypotenuse})^2=(\\text{leg})^2+(\\text{leg})^2')}. Put the polynomials in.`, grow: `The new square’s area is the old area plus 24: ${T(S.src)}.`, photo: `The frame is the outside square minus the photo: ${T(S.src)}.` }[S.fig],
      run: (c) => showRow(c, r0)
    }, {
      cap: `<b>Expand</b> each square: ${expCap}.`,
      run: (c) => showRow(c, r1)
    }];
    if (cross) {
      if (r2) steps.push({ cap: `<b>Collect</b> like terms on each side (same colour goes together).`, run: (c) => showRow(c, r2) });
      steps.push({
        cap: `Both sides have ${Dt(Lc)}. Subtract ${Dt(Lc)} from both sides: the squared terms <b>cancel</b>, and a <b>linear</b> equation is left.`,
        run: async (c) => { await cancelLeads(c, stage, cr); await showRow(c, r3); }
      });
    } else {
      steps.push({
        cap: `${T(one(1, [D], V))} and ${T('-' + one(1, [D], V))} add to zero: the squared terms <b>cancel</b>, and a <b>linear</b> equation is left.`,
        run: async (c) => { await cancelLeads(c, stage, r1); if (r2) await showRow(c, r2); }
      });
    }
    const mv = (a2 ? `${T(`${one(a1, [1], V)}${a2 < 0 ? '+' : '-'}${one(Math.abs(a2), [1], V)}`)}` : T(one(a1, [1], V))) + ' = ' + (b1 ? T(`${numT(b2)}${b1 < 0 ? '+' : '-'}${numT(Math.abs(b1))}`) : T(numT(b2)));
    steps.push({
      cap: `Solve: ${v} terms to the left, numbers to the right. ${mv}, so ${T(`${one(A, [1], V)}=${numT(Bc)}`)} and ${T(`${v}=${fracT(Bc, A)}`)}.`,
      run: async (c) => { await showRow(c, r4); await c.pop(r5.el, 450); }
    }, {
      cap: S.fig === 'tri' ? `<b>Check</b>: put ${T(`x=${nv(sol)}`)} into each side. The sides are <b>${nv(tb)} cm, ${nv(ta)} cm and ${nv(tc)} cm</b>, and they really do make a right triangle.` : `<b>Check</b> with real lengths: ${T(`${v}=${nv(sol)}`)} works.`,
      run: (c) => Promise.all([swapLabs(c, labs, nums), c.fadeIn(chk, 400, { delay: 300 })])
    });
    return steps;
  }
};

/* ================= static figures for the example cards (the booklet's own) ================= */
function mountFigures() {
  document.querySelectorAll('.u5-fig[data-fig]').forEach((host) => {
    const k = host.dataset.fig;
    if (k === 'ex1') { // L-shape: box 6 by 5, notch 2 by 2 in the top-right corner
      const F = figure(host, 76, 232, 34);
      F.rect(0, 0, 4, 5, 'keep'); F.rect(4, 0, 6, 3, 'keep');
      F.path([[0, 0], [6, 0], [6, 3], [4, 3], [4, 5], [0, 5]], 'u5-out', true); F.path([[4, 5], [6, 5], [6, 3]], 'u5-dash');
      F.lab(3, 0, '3x+4', 'b'); F.lab(0, 2.5, '2x+5', 'l'); F.lab(5, 5, 'x+1', 'a'); F.lab(6, 4, 'x+2', 'r');
    } else if (k === 'ex2') { // frame 6 by 4, opening (1.2,1)-(4.8,3)
      const F = figure(host, 76, 224, 44);
      F.rect(0, 0, 6, 4, 'keep frame'); F.rect(1.2, 1, 4.8, 3, 'hole');
      F.arrow(0, 0.5, 1.2, 0.5); F.arrow(4.8, 0.5, 6, 0.5); F.arrow(2, 0, 2, 1); F.arrow(2, 3, 2, 4);
      F.lab(3, 4, '4p+3q', 'a'); F.lab(0, 2, '3p+5q', 'l');
      [[0.6, 0.5, 'p', 'a'], [5.4, 0.5, 'p', 'a'], [2, 0.5, 'q', 'r'], [2, 3.5, 'q', 'r']].forEach(([x, y, s, an]) => { F.lab(x, y, s, an, 'sm').style.marginTop = '-4px'; });
    } else if (k === 'ex3') { // garden 9 by 4 with three beds 1.7 square
      const F = figure(host, 52, 188, 32);
      F.rect(0, 0, 9, 4, 'grass');
      [0.7, 3.7, 6.6].forEach((x) => F.rect(x, 1.2, x + 1.7, 2.9, 'bed'));
      F.lab(4.5, 4, '\\text{length}=3n+12', 'a');
      const wl = F.lab(0, 2, '\\text{width}=n+9', 'c'); wl.style.left = (52 - 22) + 'px'; wl.style.rotate = '-90deg';
      F.arrow(0.7, 3.4, 2.4, 3.4); F.lab(2.4, 3.4, 'n+2', 'r', 'sm');
    } else if (k === 'ex4') { // right triangle, legs 5 and 3
      const F = figure(host, 84, 180, 40);
      F.path([[0, 0], [5, 0], [0, 3]], 'u5-tri', true); F.path([[0, 0.35], [0.35, 0.35], [0.35, 0]], 'u5-ra');
      F.lab(2.5, 0, '4x+8', 'b'); F.lab(0, 1.5, '3x-15', 'l'); F.lab(3.1, 2.0, '5x+1', 'c');
    }
  });
}

/* ================= warm-up: Frame It ================= */
const PHOTO = 600;
const fiRow = (w) => ({ out: `${20 + 2 * w} by ${30 + 2 * w}`, area: (20 + 2 * w) * (30 + 2 * w), frame: (20 + 2 * w) * (30 + 2 * w) - PHOTO });
function mountFrameIt() {
  const host = document.getElementById('fi-pic'); if (!host) return;
  const BW = 470, BH = 392, k = 7.4, cx = BW / 2, cy = BH / 2, PL = cx - 15 * k, PR = cx + 15 * k, PT = cy - 10 * k, PB = cy + 10 * k;
  const svg = svgEl('svg', { class: 'fi-svg', width: BW, height: BH, viewBox: `0 0 ${BW} ${BH}` });
  const defs = svgEl('defs'), cp = svgEl('clipPath', { id: 'fi-clip' }); cp.appendChild(svgEl('rect', { x: 0, y: 0, width: 30, height: 20 })); defs.appendChild(cp); svg.appendChild(defs);
  const gF = svgEl('g'), gP = svgEl('g', { transform: `translate(${PL} ${PB}) scale(${k} ${-k})` }), gM = svgEl('g');
  svg.append(gF, gP, gM); host.appendChild(svg);
  // the photo: a Rocky Mountain lake (tikz coordinates, y up)
  const art = svgEl('g', { 'clip-path': 'url(#fi-clip)' }); gP.appendChild(art);
  const poly = (pts, fill) => art.appendChild(svgEl('polygon', { points: pts.map((p) => p.join(',')).join(' '), fill }));
  art.appendChild(svgEl('rect', { x: 0, y: 0, width: 30, height: 20, fill: 'rgb(170,205,240)' }));
  art.appendChild(svgEl('circle', { cx: 24, cy: 15.5, r: 2.2, fill: 'rgb(255,236,179)' }));
  poly([[-2, 6], [7, 17], [12, 11], [17, 16.5], [25, 7], [33, 13], [33, 6]], 'rgb(110,120,140)');
  poly([[7, 17], [5.2, 14.8], [6.4, 15.3], [7.3, 14.4], [8.6, 15.2]], '#fff');
  poly([[17, 16.5], [15.3, 14.5], [16.6, 15], [17.4, 14.1], [18.6, 15.1]], '#fff');
  poly([[0, 3], [0, 8], [2, 11], [4, 6.5], [6, 9.5], [8, 5.5], [22, 5.5], [24, 9], [26, 6], [28, 10], [30, 7], [30, 3]], 'rgb(40,100,60)');
  art.appendChild(svgEl('rect', { x: 0, y: 0, width: 30, height: 5.5, fill: 'rgb(80,150,190)' }));
  [[6, 2.5, 10], [15, 3.8, 20], [21, 1.4, 26]].forEach(([a, y, b]) => art.appendChild(svgEl('line', { x1: a, y1: y, x2: b, y2: y, stroke: '#fff', 'stroke-width': 0.28, 'stroke-linecap': 'round' })));
  gP.appendChild(svgEl('rect', { x: 0, y: 0, width: 30, height: 20, fill: 'none', stroke: '#1e2d46', 'stroke-width': 0.2 }));
  // the frame (redrawn as w changes)
  const P2 = (pts) => pts.map((p) => p.join(',')).join(' ');
  const fOut = svgEl('rect', { fill: 'rgb(160,105,55)' }), fTop = svgEl('polygon', { fill: 'rgb(200,145,85)' }), fLeft = svgEl('polygon', { fill: 'rgb(190,134,76)' });
  const mitre = svgEl('path', { stroke: 'rgb(112,74,38)', 'stroke-width': 1.2, fill: 'none' }), fEdge = svgEl('rect', { fill: 'none', stroke: 'rgb(96,63,33)', 'stroke-width': 2.4 });
  gF.append(fOut, fTop, fLeft, mitre, fEdge);
  const arr = svgEl('g', { class: 'fi-w' }), aLine = svgEl('line'), aH1 = svgEl('polygon'), aH2 = svgEl('polygon'), wTag = svgEl('g', { class: 'fi-wtag' }), wBg = svgEl('rect', { rx: 8 }), wTx = svgEl('text');
  arr.append(aLine, aH1, aH2); wTag.append(wBg, wTx); gM.append(arr, wTag);
  let cur = 0;
  const draw = (w) => {
    cur = w; const d = w * k, L = PL - d, R = PR + d, Tt = PT - d, Bb = PB + d, vis = w > 0.01 ? 1 : 0;
    [fOut, fEdge].forEach((r) => { r.setAttribute('x', L); r.setAttribute('y', Tt); r.setAttribute('width', R - L); r.setAttribute('height', Bb - Tt); });
    fTop.setAttribute('points', P2([[L, Tt], [R, Tt], [PR, PT], [PL, PT]])); fLeft.setAttribute('points', P2([[L, Tt], [L, Bb], [PL, PB], [PL, PT]]));
    mitre.setAttribute('d', `M${L} ${Tt}L${PL} ${PT}M${R} ${Tt}L${PR} ${PT}M${L} ${Bb}L${PL} ${PB}M${R} ${Bb}L${PR} ${PB}`);
    gF.style.opacity = vis; arr.style.opacity = wTag.style.opacity = vis;
    const y = PB - 20; aLine.setAttribute('x1', PR + 2); aLine.setAttribute('x2', R - 2); aLine.setAttribute('y1', y); aLine.setAttribute('y2', y);
    const hw = Math.min(7, d / 2.4);
    aH1.setAttribute('points', P2([[PR, y], [PR + hw * 1.4, y - hw * 0.8], [PR + hw * 1.4, y + hw * 0.8]])); aH2.setAttribute('points', P2([[R, y], [R - hw * 1.4, y - hw * 0.8], [R - hw * 1.4, y + hw * 0.8]]));
    const txt = 'w = ' + (Math.abs(w - Math.round(w)) < 0.05 ? Math.round(w) : w.toFixed(1)) + ' cm'; wTx.textContent = txt;
    const tw = 104, tx = PR - tw - 8; wBg.setAttribute('x', tx); wBg.setAttribute('y', y - 15); wBg.setAttribute('width', tw); wBg.setAttribute('height', 30);
    wTx.setAttribute('x', tx + tw / 2); wTx.setAttribute('y', y + 7);
  };
  let anim = 0;
  const go = (w) => {
    const g = ++anim, w0 = cur, t0 = performance.now(), ms = 650;
    const tick = (now) => { if (g !== anim) return; const t = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 3); draw(w0 + (w - w0) * e); if (t < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  draw(1);
  // the table, the chips and the read-out
  const tab = document.getElementById('fi-tab'), read = document.getElementById('fi-read');
  const fillRow = (w, flash) => {
    const tr = tab.querySelector(`tr[data-row="${w}"]`); if (!tr) return;
    const r = fiRow(w), vals = [r.out, fmt(r.area), fmt(r.frame)];
    if (tr.classList.contains('test')) {
      if (tr.classList.contains('done')) return;
      tr.classList.add('done'); tr.innerHTML = `<td>${w} cm</td>` + vals.map((s, i) => `<td${i === 2 ? ` class="${r.frame === PHOTO ? 'eq' : 'big'}"` : ''}>${s}</td>`).join('');
      if (flash) tr.animate([{ background: '#fff4dd' }, { background: 'transparent' }], 1200);
    } else tr.querySelectorAll('.fi-q').forEach((b, i) => { if (!b.classList.contains('open')) { b.classList.add('open'); b.textContent = vals[i]; } });
  };
  tab.querySelectorAll('tr[data-row]').forEach((tr) => {
    const w = Number(tr.dataset.row), r = fiRow(w), vals = [r.out, fmt(r.area), fmt(r.frame)];
    tr.querySelectorAll('.fi-q').forEach((b, i) => b.addEventListener('click', () => { b.classList.add('open'); b.textContent = vals[i]; b.animate([{ opacity: 0.3, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], 300); }));
  });
  const chips = [...document.querySelectorAll('[data-w]')];
  const choose = (w) => {
    chips.forEach((b) => b.classList.toggle('on', Number(b.dataset.w) === w));
    go(w); const r = fiRow(w), ratio = r.frame / PHOTO, maxA = 2400, bw = 290;
    read.innerHTML = `<div class="fi-eq"><b>${w} cm:</b> outside ${r.out} = <b>${fmt(r.area)}</b>; frame ${fmt(r.area)} − 600 = <b>${fmt(r.frame)}</b> cm²</div>
      <div class="fi-bar"><span>photo</span><i class="ph" style="width:${(bw * PHOTO) / maxA}px"></i><em>600</em></div>
      <div class="fi-bar"><span>frame</span><i class="fr${r.frame === PHOTO ? ' eq' : ''}" style="width:${(bw * r.frame) / maxA}px"></i><em>${fmt(r.frame)}${r.frame === PHOTO ? ' <b class="ok">= photo!</b>' : ratio > 1 ? ` <b class="red">${nv(Math.round(ratio * 100) / 100)} photos</b>` : ''}</em></div>`;
    read.querySelectorAll('i').forEach((b) => b.animate([{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 500, easing: 'ease-out' }));
    if (w >= 5) fillRow(w, true);
  };
  chips.forEach((b) => b.addEventListener('click', () => choose(Number(b.dataset.w))));
  chips[0].classList.add('on');
  read.innerHTML = `<div class="fi-eq muted">Tap a width. The frame grows, and the shop’s numbers appear here.</div>`;
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => {
    const on = b.closest('.wq').classList.toggle('shown');
    if (on && b.dataset.wq === 'fill') { fillRow(2); fillRow(3); }
  }));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => { const on = b.closest('.poll').classList.toggle('revealed'); if (on) choose(5); }));
}

/* ================= wiring ================= */
function mountExplainers() {
  const defs = { notch, pieces, frame, garden, box, cancel };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}
mountFrameIt(); mountFigures(); mountExplainers();

/* exposed for automated checks (no effect on the lesson) */
export const _test = { Poly, partials, LS, FR, GD, BX, EQ };
