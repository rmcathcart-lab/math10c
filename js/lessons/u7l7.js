/* Math 10C · Unit 7 · Lesson 7 — Equations of Lines Review: Slope, Intercepts, and Perpendicularity (RF4 RF5 RF6 RF7)
 * Assignment questions 1–15 (u7_L07.tex) and the Lesson 7 Extra Practice (u7_EP07.tex, Parts A–G).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible versions) and changes the numbers. Equations are typed on the eq keypad (K.P.line, js/lines.js);
 * graphs are drawn on the graph pad (js/draw.js). Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, B = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, F = HW.fmt, LN = HW.lines, DR = HW.draw, PL = HW.poly;

  /* ---------------- rational numbers [p, q] ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function Q(p, q) { if (Array.isArray(p)) return Q(p[0], p[1]); if (q === undefined) q = 1; if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g, q / g]; }
  function qa(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function qs(a, b) { b = Q(b); return qa(a, [-b[0], b[1]]); }
  function qm(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[0], a[1] * b[1]); }
  function qd(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[1], a[1] * b[0]); }
  function qn(a) { a = Q(a); return [-a[0], a[1]]; }
  function qv(a) { a = Q(a); return a[0] / a[1]; }
  function qT(a) { a = Q(a); return LN.frT(a[0], a[1]); }
  function isInt(a) { return Q(a)[1] === 1; }
  function nT(v) { return Array.isArray(v) ? qT(v) : String(v); }
  function ptT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function ptK(p) { return '(' + nT(p[0]) + ', ' + nT(p[1]) + ')'; }
  function dec(x) { return String(Math.round(x * 1e6) / 1e6); }
  function sgnP(n) { return n < 0 ? '(' + n + ')' : String(n); }   // a number in brackets when negative (for substitutions)

  /* ---------------- lines as A x + B y + C = 0 (integers, A > 0 or A = 0 and B > 0, no common factor) ---------------- */
  function L3(A, Bc, C) { var g = gcd(gcd(A, Bc), C) || 1; A /= g; Bc /= g; C /= g; if (A < 0 || (A === 0 && Bc < 0)) { A = -A; Bc = -Bc; C = -C; } return { A: A + 0, B: Bc + 0, C: C + 0 }; }
  function Lrat(a, b, c) { a = Q(a); b = Q(b); c = Q(c); var d = a[1] * b[1] * c[1]; return L3(a[0] * d / a[1], b[0] * d / b[1], c[0] * d / c[1]); }
  function lineMP(m, pt) { m = Q(m); return Lrat([m[0], 1], [-m[1], 1], qs(qm(m[1], pt[1]), qm(m[0], pt[0]))); }   // slope m through pt
  function lineMB(m, b) { m = Q(m); return Lrat([m[0], 1], [-m[1], 1], qm(m[1], b)); }
  function line2(p, q) { return p[0] === q[0] ? L3(1, 0, -p[0]) : lineMP(Q(q[1] - p[1], q[0] - p[0]), p); }
  function slopeOf(L) { return L.B === 0 ? null : Q(-L.A, L.B); }
  function yint(L) { return Q(-L.C, L.B); }
  function xint(L) { return Q(-L.C, L.A); }
  function onL(L, p) { return qv(qa(qa(qm(L.A, p[0]), qm(L.B, p[1])), L.C)) === 0; }
  function sameL(a, b) { return a.A === b.A && a.B === b.B && a.C === b.C; }
  function gT(L, vars) { return LN.tex(L.B === 0 && L.A != null ? L3(L.A, 0, L.C) : L, 'general', null, vars); }   // (lines.js writes a vertical line as x-5=0 in general form)
  function sT(L, vars) { return LN.tex(L, 'slope-intercept', null, vars); }
  function pT(L, pt, vars) { return LN.tex(L, 'point-slope', pt, vars); }
  function perpS(m) { m = Q(m); return Q(-m[1], m[0]); }
  function term(c, v, first) {
    var f = Q(c); if (f[0] === 0) return '';
    var s = f[0] < 0 ? '-' : (first ? '' : '+'), ab = Math.abs(f[0]);
    return s + (f[1] === 1 ? (ab === 1 && v ? '' : String(ab)) : '\\frac{' + ab + '}{' + f[1] + '}') + v;
  }
  function pol(list) { var out = ''; list.forEach(function (tm) { out += term(tm[0], tm[1], !out); }); return out || '0'; }
  function genLeft(L, vars) { vars = vars || ['x', 'y']; return pol([[L.A, vars[0]], [L.B, vars[1]], [L.C, '']]); }
  /* worked steps: slope-point form through pt → general form */
  function psSteps(m, pt, vars) {
    vars = vars || ['x', 'y']; m = Q(m); var L = lineMP(m, pt), X = vars[0], Y = vars[1], s = t(pT(L, pt, vars));
    if (m[0] === 0) return s + '<br>General form: ' + t(gT(L, vars));
    var q = m[1], lhs = pol([[q, Y], [qm(-q, pt[1]), '']]), rhs = pol([[m[0], X], [qm(-m[0], pt[0]), '']]);
    s += '<br>' + (q === 1 ? 'Expand: ' : 'Multiply both sides by ' + t(q) + ': ') + t(lhs + '=' + rhs);
    s += '<br>Move every term to one side: ' + t(gT(L, vars));
    return s;
  }
  function siSteps(m, pt) {   // slope-point → slope-intercept
    m = Q(m); var b = qs(pt[1], qm(m, pt[0]));
    return t(pT(lineMP(m, pt), pt)) + '<br>' + t('y=' + pol([[m, 'x'], [qn(qm(m, pt[0])), '']]) + (pt[1] ? (pt[1] > 0 ? '+' : '-') + Math.abs(pt[1]) : '')) + '<br>' + t(sT(lineMB(m, b)));
  }
  function slopeSteps(p, q) { return t('m=\\dfrac{' + q[1] + '-' + sgnP(p[1]) + '}{' + q[0] + '-' + sgnP(p[0]) + '}=\\dfrac{' + (q[1] - p[1]) + '}{' + (q[0] - p[0]) + '}' + (isInt(Q(q[1] - p[1], q[0] - p[0])) || gcd(q[1] - p[1], q[0] - p[0]) > 1 || (q[0] - p[0]) < 0 ? '=' + qT(Q(q[1] - p[1], q[0] - p[0])) : '')); }

  /* ---------------- answer checkers ---------------- */
  function toL3(T) { var c = LN.of(T); return Lrat(LN.toFr(c[0]), LN.toFr(c[1]), LN.toFr(c[2])); }
  function lineP(prompt, L, opt, sol, hints, text) {
    opt = opt || {}; var p = B.line(prompt, L, opt, sol, hints, text), T = toL3(L), vars = opt.vars;
    p.bad = (opt.wrong || []).map(function (w) { return typeof w.is === 'string' ? null : toL3(w.is); }).filter(function (W) { return W && !sameL(W, T); }).map(function (W) { return gT(W, vars); });
    if (!opt.form || opt.form === 'any') p.good = [gT(T, vars), sT(T, vars)];
    else if (opt.form === 'general' && T.A > 0 && T.B !== 0) p.good = [pol([[T.B, (vars || ['x', 'y'])[1]], [T.A, (vars || ['x'])[0]], [T.C, '']]) + '=0'];
    return p;
  }
  /* slope-point form through any one of several points */
  function psAny(L, pts, opt) {
    var cs = pts.map(function (p) { return K.line(L, Object.assign({}, opt || {}, { form: 'point-slope', point: p })); });
    return function (resp) {
      var first = cs[0](resp); if (first.v === 'correct') return first;
      if (first.v === 'form' && first.code === 'line-form-point') { for (var i = 1; i < cs.length; i++) { var r = cs[i](resp); if (r.v === 'correct') return r; } return form('line-form-point', 'Right line — but use one of the given points ' + pts.map(function (p) { return t(ptT(p)); }).join(' or ') + ' in slope–point form.'); }
      return first;
    };
  }
  function psAnyP(prompt, L, pts, opt, sol, hints, text) {
    return B.math(prompt, psAny(L, pts, opt), pT(L, pts[0], (opt || {}).vars), sol, hints, text, { keys: 'eq', vars: (opt && opt.vars) || ['x', 'y'], placeholder: 'e.g. y - 3 = 2(x + 1)' });
  }
  /* one ordered pair; name = 'x' | 'y' for an intercept */
  function ptChk(pt, name) {
    var base = K.pairs([[qv(pt[0]), qv(pt[1])]]);
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (s && s.indexOf('(') < 0) { var a = K.read(s); if (!a.res) return form('pt-form', 'Write it as an ordered pair, ' + t('(x,\\ y)') + '.'); }
      var r = base(resp);
      if (r.v === 'wrong' && r.code === 'pairs-flip') return wrong(name ? 'int-swap' : 'pairs-flip', name === 'x' ? 'The ' + t('x') + '-intercept is on the ' + t('x') + '-axis, so its ' + t('y') + '-coordinate is ' + t('0') + ': ' + t('(a,\\ 0)') + '.' : name === 'y' ? 'The ' + t('y') + '-intercept is on the ' + t('y') + '-axis, so its ' + t('x') + '-coordinate is ' + t('0') + ': ' + t('(0,\\ b)') + '.' : 'Your coordinates are swapped: ' + t('(x,\\ y)') + ' — across first, then up or down.');
      if (r.v === 'wrong' && r.code === 'pairs') return wrong('point', null);
      return r;
    };
  }
  function ptP(prompt, pt, sol, hints, text) { return B.math(prompt, ptChk(pt), ptK(pt), sol, hints, text, { keys: 'pairs', placeholder: 'e.g. (3, -2)' }); }
  /* both intercepts of L as ordered pairs */
  function intsP(prompt, L, sol, hints, text) {
    var xi = xint(L), yi = yint(L);
    return B.fields(prompt, [{ label: t('x') + '-intercept', mode: 'math', keys: 'pairs' }, { label: t('y') + '-intercept', mode: 'math', keys: 'pairs' }],
      [ptChk([xi, 0], 'x'), ptChk([0, yi], 'y')], [ptK([xi, 0]), ptK([0, yi])], t(ptT([xi, 0])) + ' and ' + t(ptT([0, yi])), sol, hints, text);
  }
  function intSteps(L) {
    var xi = xint(L), yi = yint(L);
    return t('x') + '-intercept: let ' + t('y=0') + ': ' + t(pol([[L.A, 'x'], [L.C, '']]) + '=0') + ', so ' + t('x=' + qT(xi)) + ' → ' + t(ptT([xi, 0])) + '<br>' +
      t('y') + '-intercept: let ' + t('x=0') + ': ' + t(pol([[L.B, 'y'], [L.C, '']]) + '=0') + ', so ' + t('y=' + qT(yi)) + ' → ' + t(ptT([0, yi]));
  }
  function exactV(x, what) { return K.value(x, { diag: function (v) { return Math.abs(v - x) < 0.01 ? { code: 'decimal', hint: 'Close — give the <b>exact</b> value' + (what ? ' (' + what + ')' : '') + ', not a rounded decimal.' } : null; } }); }
  function mc(r, prompt, opts, sol, hints, text, keep) { return B.mc(r, prompt, opts, sol, hints, text, keep); }

  /* ---------------- graph pad ---------------- */
  function gv(pts, pieces) { return { pts: pts || [], pieces: pieces || [], join: 'none' }; }
  function segv(a, b, s, e) { return { v: [a, b], s: s || 'closed', e: e || 'closed' }; }
  function lattice(L, xr, yr) {
    var out = [];
    if (L.B === 0) { var k = -L.C / L.A; if (Number.isInteger(k) && k >= xr[0] && k <= xr[1]) for (var y = yr[0]; y <= yr[1]; y++) out.push([k, y]); return out; }
    for (var x = xr[0]; x <= xr[1]; x++) { var yy = (-L.C - L.A * x) / L.B; if (Number.isInteger(yy) && yy >= yr[0] && yy <= yr[1]) out.push([x, yy]); }
    return out;
  }
  function lineDraw(L, xr, yr) { var a = lattice(L, xr, yr); return a.length >= 2 ? gv([], [segv(a[0], a[a.length - 1], 'arrow', 'arrow')]) : null; }
  function linesDraw(Ls, xr, yr) { var pcs = []; for (var i = 0; i < Ls.length; i++) { var d = lineDraw(Ls[i], xr, yr); if (!d) return null; pcs.push(d.pieces[0]); } return gv([], pcs); }
  function okWin(L, xr, yr, need) { return lattice(L, xr, yr).length >= (need || 2); }
  function clip(L, xr, yr) {   // the part of L inside the window, as two border points (for background drawings)
    var pts = [], add = function (p) { if (p[0] >= xr[0] - 1e-9 && p[0] <= xr[1] + 1e-9 && p[1] >= yr[0] - 1e-9 && p[1] <= yr[1] + 1e-9 && !pts.some(function (z) { return Math.abs(z[0] - p[0]) < 1e-9 && Math.abs(z[1] - p[1]) < 1e-9; })) pts.push(p); };
    if (L.B !== 0) { [xr[0], xr[1]].forEach(function (x) { add([x, (-L.C - L.A * x) / L.B]); }); }
    if (L.A !== 0) { [yr[0], yr[1]].forEach(function (y) { add([(-L.C - L.B * y) / L.A, y]); }); }
    return pts.slice(0, 2);
  }
  function bgLines(Ls, xr, yr) { return { segs: Ls.map(function (L) { var c = clip(L, xr, yr); return { pts: c, start: 'arrow', end: 'arrow', color: '#7a8296' }; }) }; }
  function exactChk(target, opt) { var base = K.graphExact(target, opt); return function (resp) { if (!DR.empty(resp) && DR.same(resp, target)) return ok(); return base(resp); }; }
  function drawPart(prompt, inp, check, key, sol, hints, text, bad) {
    var p = B.graph(prompt, inp, check, key, sol, hints, text);
    p.bad = (bad || []).filter(function (b) { return b && !DR.same(b, key); });
    return p;
  }
  function pad(xr, yr, extra) { return Object.assign({ x: xr, y: yr, labels: 2, defaultEnd: 'arrow', tools: ['line', 'ends'] }, extra || {}); }
  var LINEHELP = ' Use <b>╱ Line</b>: tap two points on the line — its ends start as arrows (a line goes on forever).';
  /* graph-a-line part: L the target; wrongs [{ L, code, hint }] drawn as lines when they fit the window */
  function graphLine(prompt, L, xr, yr, wrongs, sol, hints, text, extra) {
    var key = lineDraw(L, xr, yr), W = [], bad = [];
    (wrongs || []).forEach(function (w) { if (!w || sameL(w.L, L)) return; var d = lineDraw(w.L, xr, yr); if (d) { W.push({ is: d, code: w.code, hint: w.hint }); bad.push(d); } });
    var a = lattice(L, xr, yr); bad.push(gv([], [segv(a[0], a[a.length - 1])]));
    return drawPart(prompt + LINEHELP, pad(xr, yr, extra), exactChk(key, { wrong: W }), key, sol, hints, text, bad);
  }

  /* ---------------- shared wording ---------------- */
  var SLP = [[1, 2], [1, 3], [2, 3], [3, 4], [3, 2], [4, 3], [2, 5], [5, 2], [1, 4], [3, 5]];
  function sl(r, pool) { var s = r.pick(pool || SLP); return r.chance(0.5) ? Q(s[0], s[1]) : Q(-s[0], s[1]); }
  function rnz(r, a, b) { var v; do { v = r.int(a, b); } while (v === 0); return v; }
  function W8(n) { return n === 1 ? 'i' : n === 2 ? 'ii' : n === 3 ? 'iii' : 'iv'; }

  HW.addCodes({
    'pt-form': 'Point not written as an ordered pair', 'int-swap': 'x- and y-intercept swapped', point: 'Wrong point', 'nr-orig-slope': 'Used the given slope, not the perpendicular one',
    'nr-perp-sign': 'Perpendicular slope sign', 'nr-neg-only': 'Changed the sign but didn’t take the reciprocal', 'k-yint': 'Gave the y-intercept instead of k', 'ac-flip': 'Gave C/A instead of A/C',
    'ac-c': 'Forgot to multiply the intercept by B', 'ps-sign': 'Slope–point form: signs of the point not flipped', 'win-miss': 'Window misses an intercept', 'win-order': 'Window min ≥ max', 'win-scale': 'Window scale unsuitable',
    'win-big': 'Window far too large', 'rate-sign': 'Rate of change sign', 'rate-step': 'Didn’t divide by the step in x', 'rate-units': 'Rate units upside down', 'used-x': 'Used the wrong coordinate',
    'line-parallel': 'Used the parallel slope instead of the perpendicular one', 'line-perp-wrong': 'Used the perpendicular slope instead of the parallel one', 'pct-decimal': 'Rate given as a decimal instead of a %', 'pct-as-coef': 'Percent used as the coefficient',
    'graph-slope-sign': 'Graph: slope sign', 'graph-flip': 'Graph: rise and run swapped', 'graph-b-x': 'Graph: b plotted on the x-axis', 'graph-int-swap': 'Graph: intercepts swapped', 'graph-int-sign': 'Graph: intercept signs', 'graph-hv': 'Graph: horizontal/vertical mixed up', 'graph-xk': 'Graph: wrong x-value',
    'ground-h': 'Solved with the wrong value of h', 'year-t': 'Gave t instead of the year', 'unit-conv': 'Unit conversion slip', 'win-tiny': 'Window too small'
  });

  /* ======================================================================================================== */
  /* Extra practice (u7_EP07.tex) */
  function fld(label, keys, extra) { return Object.assign({ label: label, mode: 'math', keys: keys || 'fraction' }, extra || {}); }
  function valP(prompt, x, keyTex, sol, hints, text, inp) { return B.math(prompt, exactV(x), keyTex, sol, hints, text, Object.assign({ keys: 'fraction' }, inp || {})); }
  function numDec(x) { return Math.round(x * 1e6) / 1e6; }
  /* the smallest window (≤ 14 steps a side, containing the origin) that holds all the points, padded by 1 */
  function fitWin(pts, minSpan) {
    var xs = pts.map(function (p) { return p[0]; }).concat([0]), ys = pts.map(function (p) { return p[1]; }).concat([0]);
    var x0 = Math.min.apply(null, xs) - 1, x1 = Math.max.apply(null, xs) + 1, y0 = Math.min.apply(null, ys) - 1, y1 = Math.max.apply(null, ys) + 1;
    while (x1 - x0 < (minSpan || 10)) { if (x1 - x0 & 1) x1++; else x0--; }
    while (y1 - y0 < (minSpan || 10)) { if (y1 - y0 & 1) y1++; else y0--; }
    return x1 - x0 > 14 || y1 - y0 > 14 ? null : { x: [x0, x1], y: [y0, y1] };
  }
  function sub(L, p, vars) { var s = genLeft(L, vars), X = (vars || ['x'])[0], Y = (vars || ['x', 'y'])[1]; return s.replace(X, '(' + nT(p[0]) + ')').replace(Y, '(' + nT(p[1]) + ')'); }
  function valAt(L, p) { return qa(qa(qm(L.A, p[0]), qm(L.B, p[1])), L.C); }
  function distT(p, q) { var dx = q[0] - p[0], dy = q[1] - p[1]; return '\\sqrt{(' + dx + ')^{2}+(' + dy + ')^{2}}=\\sqrt{' + (dx * dx + dy * dy) + '}'; }
  function dist2(p, q) { var dx = q[0] - p[0], dy = q[1] - p[1]; return dx * dx + dy * dy; }
  function radTex(n2) { var k = 1, m = n2; for (var f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return m === 1 ? String(k) : (k === 1 ? '' : k) + '\\sqrt{' + m + '}'; }
  function setOk(targetTex, opt) { return K.set(targetTex, opt); }   // (K.set no longer asks for “∈ ℝ” on a single-value set)

  function ep1(r) {
    for (var g = 0; g < 400; g++) {
      var a = r.int(3, 9), b = r.int(3, 9); if (a === b) continue;
      var L = line2([a, 0], [0, b]), m = slopeOf(L), lp = lattice(L, [-6, -1], [1, 12]); if (!lp.length) continue;
      var P = r.pick(lp), xq = r.int(1, a - 1), yl = qs(b, qm(Q(b, a), xq)); if (isInt(yl)) continue;
      var yq = Math.round(qv(yl)); if (yq === qv(yl) || yq < 0) continue;
      var G = [r.int(-6, -2), r.int(-8, -3)], H = [r.int(3, 8), r.int(-5, -1)]; if (onL(L, G) || onL(L, H)) continue;
      var Lg = lineMP(m, G), Lh = lineMP(perpS(m), H);
      var dg = [m[1], m[0]], ph = perpS(m), dh = [ph[1], ph[0]];
      var G2 = [G[0] + dg[0], G[1] + dg[1]], H2 = [H[0] - dh[0], H[1] - dh[1]];
      var lp2 = lattice(L, [-9, 11], [-11, 11]), win = null, best = 1e9;
      for (var i = 0; i + 1 < lp2.length; i++) { var w0 = fitWin([G, G2, H, H2, lp2[i], lp2[i + 1]], 10); if (w0) { var ar = (w0.x[1] - w0.x[0]) * (w0.y[1] - w0.y[0]); if (ar < best) { best = ar; win = w0; } } }
      if (!win) continue;
      if (lattice(Lg, win.x, win.y).length < 2 || lattice(Lh, win.x, win.y).length < 2) continue;
      var x5 = r.int(1, a - 1), w5 = qs(b, qm(Q(b, a), x5));
      return { a: a, b: b, L: L, m: m, P: P, Qp: [xq, yq], yl: yl, G: G, H: H, Lg: Lg, Lh: Lh, win: win, x5: x5, w5: w5 };
    }
    var L0 = L3(3, 4, -24); return { a: 8, b: 6, L: L0, m: Q(-3, 4), P: [-4, 9], Qp: [5, 2], yl: Q(9, 4), G: [-4, -5], H: [6, -1], Lg: L3(3, 4, 32), Lh: L3(4, -3, -27), win: { x: [-5, 9], y: [-9, 4] }, x5: 5, w5: Q(9, 4) };
  }
  function ep2(r) {
    for (var g = 0; g < 300; g++) {
      var q = r.pick([2, 3]), p = r.pick([1, 2, 3, 4, 5]) * (r.chance(0.7) ? 1 : -1); if (gcd(p, q) !== 1 || Math.abs(p) === 1 && q === 3) continue;
      var k = rnz(r, -2, 2), b = p * k, a = -k * q, xs = [-1, 0, 1, 2, 3].map(function (j) { return j * q; }), ys = xs.map(function (x, j) { return b + (j - 1) * p; });
      if (ys.some(function (y) { return Math.abs(y) > 10; }) || Math.abs(a) > 8 || Math.abs(a + q) > 9 || Math.abs(b) < 2) continue;
      var c5 = rnz(r, -8, 8); if (c5 === b) continue;
      return { p: p, q: q, b: b, a: a, xs: xs, ys: ys, m: Q(p, q), L: line2([a, 0], [0, b]), c5: c5 };
    }
    return { p: 5, q: 2, b: -5, a: 2, xs: [-2, 0, 2, 4, 6], ys: [-10, -5, 0, 5, 10], m: Q(5, 2), L: L3(5, -2, -10), c5: 5 };
  }

  function BIS(r) {
        for (var g = 0; g < 200; g++) {
          var M = [r.int(-3, 4), r.int(-2, 5)], d = r.pick([[6, -2], [6, 2], [4, -2], [4, 2], [2, -4], [6, -4], [4, 6], [2, 6], [6, 4]]), Cp = [M[0] - d[0], M[1] - d[1]], Dp = [M[0] + d[0], M[1] + d[1]];
          if ([Cp, Dp].some(function (p) { return Math.abs(p[0]) > 9 || Math.abs(p[1]) > 9; })) continue;
          var mCD = Q(d[1], d[0]), n = perpS(mCD), T = lineMP(n, M), pd = [n[1], n[0]], Pt = [M[0] + pd[0], M[1] + pd[1]];
          if (T.C === 0 || Math.abs(Pt[0]) > 12 || Math.abs(Pt[1]) > 12) continue;
          return { M: M, C: Cp, D: Dp, mCD: mCD, n: n, T: T, Pt: Pt };
        }
        return { M: [1, 4], C: [-5, 6], D: [7, 2], mCD: Q(-1, 3), n: Q(3), T: L3(3, -1, 1), Pt: [2, 7] };
      }
  function PP(r) { var h, v; do { h = rnz(r, -7, 7); v = rnz(r, -7, 7); } while (Math.abs(h) === Math.abs(v)); return { P: [h, v] }; }
  var EXTRA = [
    /* ---------------- Part A — Q1 ---------------- */
    { num: '1', section: 'Extra practice A — One line, every form', shared: ep1,
      stem: function (o) { return '<b>The whole unit on one line.</b> Everything Lessons 1–6 taught you can be asked about the single equation ' + t(gT(o.L)) + '. Work through the parts in order; each one feeds the next.'; },
      parts: [
        { id: 'e1a', sub: 'a', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var raw = '-\\frac{' + o.L.A + '}{' + o.L.B + '}';
          return B.slope('State the slope, using ' + t('m=-\\frac{A}{B}') + ' (then confirm it by solving the equation for ' + t('y') + ').', o.m, {}, t('m=-\\frac{A}{B}=' + raw + (raw === qT(o.m) ? '' : '=' + qT(o.m))) + '.<br>Check: ' + t(pol([[o.L.B, 'y']]) + '=' + pol([[-o.L.A, 'x'], [-o.L.C, '']])) + ', so ' + t(sT(o.L)) + ' ✓',
            ['For ' + t('Ax+By+C=0') + ', ' + t('A') + ' is the ' + t('x') + '-coefficient and ' + t('B') + ' is the ' + t('y') + '-coefficient.'], 'slope from general form');
        } },
        { id: 'e1b', sub: 'b', level: 'PRG', outcome: 'RF5', make: function (r, o) { return intsP('Determine both intercepts <b>as ordered pairs</b>.', o.L, intSteps(o.L), ['Set ' + t('y=0') + ' for the ' + t('x') + '-intercept, and ' + t('x=0') + ' for the ' + t('y') + '-intercept.'], 'intercepts from general form'); } },
        { id: 'e1c', sub: 'c', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return lineP('Write the equation in slope–intercept form, ' + t('y=mx+b') + '.', o.L, { form: 'slope-intercept' }, 'From (a) and (b): ' + t('m=' + qT(o.m)) + ' and ' + t('b=' + o.b) + '. ' + t(pol([[o.L.B, 'y']]) + '=' + pol([[-o.L.A, 'x'], [-o.L.C, '']])) + ' ⟹ ' + t(sT(o.L)), ['Isolate ' + t('y') + ': move the ' + t('x') + '-term and the constant across, then divide by the ' + t('y') + '-coefficient.'], 'general → slope-intercept');
        } },
        { id: 'e1d', sub: 'd i', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          var vp = valAt(o.L, o.P), vq = valAt(o.L, o.Qp);
          return B.grid('Decide by substitution — not by graphing — whether ' + t('P' + ptT(o.P)) + ' and ' + t('Q' + ptT(o.Qp)) + ' lie on the line.', [{ id: 'P', html: t('P' + ptT(o.P)) }, { id: 'Q', html: t('Q' + ptT(o.Qp)) }], [{ id: 'on', html: 'on the line' }, { id: 'off', html: 'not on the line' }], { P: 'on', Q: 'off' },
            { why: function (row) { var p = row === 'P' ? o.P : o.Qp; return { code: 'row', hint: 'Substitute ' + t(ptT(p)) + ': ' + t(sub(o.L, p) + '=' + qT(valAt(o.L, p))) + '. A point is on the line exactly when the left side is ' + t('0') + '.' }; } },
            t('P') + ': ' + t(sub(o.L, o.P) + '=' + qT(vp)) + ', so ' + t('P') + ' is <b>on</b> the line.<br>' + t('Q') + ': ' + t(sub(o.L, o.Qp) + '=' + qT(vq) + '\\ne 0') + ', so ' + t('Q') + ' is <b>not</b> on the line.', ['Substitute each point into the left side of the equation.'], 'points on line by substitution');
        } },
        { id: 'e1d2', sub: 'd ii', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          var d = qs(o.yl, o.Qp[1]), above = qv(d) < 0;
          return B.fields('For ' + t('Q' + ptT(o.Qp)) + ', which is not on the line: determine the ' + t('y') + '-value the line really has at ' + t('x=' + o.Qp[0]) + ', and how far ' + t('Q') + ' is from the line vertically.', [fld(t('y') + ' on the line'), fld('vertical distance')], [exactV(qv(o.yl)), exactV(Math.abs(qv(d)))], [qT(o.yl), qT(Q(Math.abs(d[0]), d[1]))],
            t('y=' + qT(o.yl)) + '; ' + t('Q') + ' is ' + t(qT(Q(Math.abs(d[0]), d[1]))) + ' unit ' + (above ? 'above' : 'below') + ' the line.',
            'At ' + t('x=' + o.Qp[0]) + ': ' + t(pol([[o.L.A * o.Qp[0] + o.L.C, ''], [o.L.B, 'y']]) + '=0') + ', so ' + t('y=' + qT(o.yl) + (isInt(qm(o.yl, 100)) ? '=' + dec(qv(o.yl)) : '')) + '.<br>' + t('Q') + ' has ' + t('y=' + o.Qp[1]) + ', so it sits ' + t(qT(Q(Math.abs(d[0]), d[1]))) + ' unit ' + (above ? 'above' : 'below') + ' the line.',
            ['Substitute ' + t('x=' + o.Qp[0]) + ' and solve for ' + t('y') + '. The vertical distance is the difference between the two ' + t('y') + '-values.'], 'vertical distance to line');
        } },
        { id: 'e1e', sub: 'e i', level: 'BEG', outcome: 'RF6', make: function (r, o) {
          var X = [o.a, 0];
          return lineP('Write a slope–point equation, ' + t('y-y_1=m(x-x_1)') + ', using the ' + t('x') + '-intercept as ' + t('(x_1,\\ y_1)') + '.', o.L, { form: 'point-slope', point: X, wrong: [{ is: lineMP(o.m, [-o.a, 0]), code: 'ps-sign', hint: 'In ' + t('y-y_1=m(x-x_1)') + ' the ' + t('x') + '-coordinate is subtracted: ' + t('(x-' + o.a + ')') + '.' }] },
            t(pT(o.L, X)) + '<br>Multiply by ' + t(o.m[1]) + ' and rearrange: ' + t(gT(o.L)) + ' ✓ (the given line)', ['Use ' + t('m=' + qT(o.m)) + ' and the point ' + t(ptT(X)) + '.'], 'slope-point with x-intercept');
        } },
        { id: 'e1e2', sub: 'e ii', level: 'BEG', outcome: 'RF6', make: function (r, o) {
          return lineP('Write a second slope–point equation, using the point ' + t('P' + ptT(o.P)) + ' (from (d)), which is on the line.', o.L, { form: 'point-slope', point: o.P, wrong: [{ is: lineMP(o.m, [-o.P[0], -o.P[1]]), code: 'ps-sign', hint: 'In ' + t('y-y_1=m(x-x_1)') + ' the coordinates are subtracted, so the signs flip: ' + t(pT(o.L, o.P)) + '.' }] },
            t(pT(o.L, o.P)) + '<br>Converting to general form gives ' + t(gT(o.L)) + ' again — both slope–point equations describe the same line ✓', ['Use ' + t('m=' + qT(o.m)) + ' and ' + t('P' + ptT(o.P)) + '.'], 'slope-point with P');
        } },
        { id: 'e1f', sub: 'f', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var xr = [-2, 10], yr = [-2, 10];
          return graphLine('Graph the line ' + t(gT(o.L)) + ' on the grid.', o.L, xr, yr, [
            { L: line2([o.b, 0], [0, o.a]), code: 'graph-int-swap', hint: 'Your intercepts are swapped: the ' + t('x') + '-intercept is ' + t(ptT([o.a, 0])) + ' (on the ' + t('x') + '-axis).' },
            { L: lineMP(qn(o.m), [0, o.b]), code: 'graph-slope-sign', hint: 'Right ' + t('y') + '-intercept, but your line rises. The slope ' + t(qT(o.m)) + ' is negative, so the line falls from left to right.' }],
            'Plot the intercepts ' + t(ptT([o.a, 0])) + ' and ' + t(ptT([0, o.b])) + ' and draw the line through them, with arrows. ' + t('P' + ptT(o.P)) + ' is on it as a check.', ['Use the two intercepts from (b).'], 'graph from intercepts');
        } },
        { id: 'e1g', sub: 'g', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          return lineP('Determine the equation, in general form, of the line through ' + t(ptT(o.G)) + ' that is <b>parallel</b> to the given line.', o.Lg, { form: 'general', wrong: [{ is: lineMP(perpS(o.m), o.G), code: 'line-perp-wrong', hint: 'That slope is the negative reciprocal — it gives a <b>perpendicular</b> line. Parallel lines have the same slope, ' + t(qT(o.m)) + '.' }, { is: o.L, code: 'diag', hint: 'That is the given line itself. The parallel line must pass through ' + t(ptT(o.G)) + '.' }] },
            'Parallel ⟹ same slope, ' + t('m=' + qT(o.m)) + '.<br>' + psSteps(o.m, o.G), ['Keep the slope ' + t(qT(o.m)) + ', use the point ' + t(ptT(o.G)) + ', then rearrange to general form.'], 'parallel through point (general)');
        } },
        { id: 'e1h', sub: 'h', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          var n = perpS(o.m);
          return lineP('Determine the equation, in general form, of the line through ' + t(ptT(o.H)) + ' that is <b>perpendicular</b> to the given line.', o.Lh, { form: 'general', wrong: [{ is: lineMP(o.m, o.H), code: 'line-parallel', hint: 'That line has the same slope as the given line, so it is <b>parallel</b>. Use the negative reciprocal, ' + t(qT(n)) + '.' }] },
            t('m_{\\perp}=' + qT(n)) + ' (negative reciprocal of ' + t(qT(o.m)) + ').<br>' + psSteps(n, o.H), ['Flip the slope and change its sign, then use the point ' + t(ptT(o.H)) + '.'], 'perpendicular through point (general)');
        } },
        { id: 'e1i', sub: 'i', level: 'BEG', outcome: 'RF7', make: function (r, o) {
          var n = perpS(o.m);
          return mc(r, 'In (h), the line through ' + t(ptT(o.H)) + ' perpendicular to the given line is ' + t(gT(o.Lh)) + '. Confirm (h) by multiplying the slopes of the two lines. Which statement is correct?', [
            { html: t('\\left(' + qT(o.m) + '\\right)\\left(' + qT(n) + '\\right)=-1') + ', which proves the lines are perpendicular.', right: true },
            { html: t('\\left(' + qT(o.m) + '\\right)\\left(' + qT(n) + '\\right)=1') + ', which proves the lines are perpendicular.', why: 'Multiply again: a negative times a positive is negative. Perpendicular slopes multiply to ' + t('-1') + '.' },
            { html: t('\\left(' + qT(o.m) + '\\right)\\left(' + qT(n) + '\\right)=-1') + ', which proves the lines are parallel.', why: 'Parallel lines have <b>equal</b> slopes. A product of ' + t('-1') + ' means perpendicular.' },
            { html: t('\\left(' + qT(o.m) + '\\right)\\left(' + qT(n) + '\\right)=0') + ', so the lines meet at the origin.', why: 'Neither slope is ' + t('0') + ', so the product can’t be ' + t('0') + '.' }],
            'Slope of (h): ' + t(qT(n)) + '. ' + t('\\left(' + qT(o.m) + '\\right)\\left(' + qT(n) + '\\right)=-1') + ': a product of ' + t('-1') + ' proves the lines are perpendicular.', ['Multiply the numerators and the denominators.'], 'product of perpendicular slopes');
        } },
        { id: 'e1j', sub: 'j', level: 'PRG', outcome: 'RF6', make: function (r, o) {
          var xr = o.win.x, yr = o.win.y, key = linesDraw([o.Lg, o.Lh], xr, yr), n = perpS(o.m);
          var sw = linesDraw([lineMP(n, o.G), lineMP(o.m, o.H)], xr, yr), W = sw ? [{ is: sw, code: 'diag', hint: 'Your lines go through the right points, but the slopes are swapped: the line through ' + t(ptT(o.G)) + ' is the <b>parallel</b> one (slope ' + t(qT(o.m)) + ').' }] : [];
          var a1 = lattice(o.Lg, xr, yr), b1 = lattice(o.Lh, xr, yr);
          return drawPart('Draw your answers to (g) and (h) on the grid (the given line is shown in grey): the line through ' + t(ptT(o.G)) + ' <b>parallel</b> to the given line, and the line through ' + t(ptT(o.H)) + ' <b>perpendicular</b> to it.' + LINEHELP + ' Draw both lines.', pad(xr, yr, { bg: bgLines([o.L], xr, yr) }), exactChk(key, { wrong: W }), key,
            '(g) ' + t(gT(o.Lg)) + ': through ' + t(ptT(o.G)) + ', step ' + t(qT(o.m)) + ' to ' + t(ptT(a1[0][0] === o.G[0] ? a1[a1.length - 1] : a1[0])) + ' — it never meets the given line.<br>(h) ' + t(gT(o.Lh)) + ': through ' + t(ptT(o.H)) + ', step ' + t(qT(n)) + ' — it crosses the given line at a right angle.',
            ['Start each line at its given point and step its slope: ' + t(qT(o.m)) + ' for the parallel, ' + t(qT(n)) + ' for the perpendicular.'], 'graph parallel and perpendicular', [sw, lineDraw(o.Lg, xr, yr), gv([], [segv(a1[0], a1[a1.length - 1]), segv(b1[0], b1[b1.length - 1])])]);
        } },
        { id: 'e1k', sub: 'k1', level: 'PRG', outcome: 'RF5', make: function (r, o) {
          var rate = qn(o.m), rt = isInt(qm(rate, 100)) ? dec(qv(rate)) : qT(rate);
          return mc(r, '<b>Now give the line a job.</b> On a sea-kayak day trip, ' + t('x') + ' is the number of kilometres paddled and ' + t('y') + ' is the number of litres of drinking water still in the group’s supply. Which sentence interprets the slope?', [
            { html: 'The water supply decreases by ' + t(rt) + ' L for every kilometre paddled.', right: true },
            { html: 'The group paddles ' + t(rt) + ' km for every litre of water.', why: 'The slope is ' + t('\\frac{\\Delta y}{\\Delta x}') + ': litres per kilometre, not kilometres per litre.' },
            { html: 'The water supply increases by ' + t(rt) + ' L for every kilometre paddled.', why: 'The slope ' + t(qT(o.m)) + ' is negative: the supply goes <b>down</b>.' },
            { html: 'The group starts with ' + t(rt) + ' L of water.', why: 'The starting amount is the ' + t('y') + '-intercept, ' + t(o.b) + ' L. The slope is a change per kilometre.' }],
            t('m=' + qT(o.m) + (isInt(qm(o.m, 100)) ? '=' + dec(qv(o.m)) : '')) + ' L/km: the water supply <b>decreases by ' + rt + ' litres for every kilometre paddled</b>.', ['Units of a slope: units of ' + t('y') + ' per unit of ' + t('x') + '.'], 'interpret slope (kayak)');
        } },
        { id: 'e1k2', sub: 'k2', level: 'PRG', outcome: 'RF5', make: function (r, o) {
          return mc(r, 'On the kayak trip (' + t('x') + ' = kilometres paddled, ' + t('y') + ' = litres of water left), which sentence interprets the two intercepts, ' + t(ptT([0, o.b])) + ' and ' + t(ptT([o.a, 0])) + '?', [
            { html: 'The group set out with ' + t(o.b) + ' L of water, and after ' + t(o.a) + ' km the supply runs out.', right: true },
            { html: 'The group set out with ' + t(o.a) + ' L of water, and after ' + t(o.b) + ' km the supply runs out.', why: 'Check which axis is which: ' + t('y') + ' (litres) is ' + t(o.b) + ' when ' + t('x=0') + '; ' + t('x') + ' (km) is ' + t(o.a) + ' when ' + t('y=0') + '.' },
            { html: 'The trip is ' + t(o.b) + ' km long and uses ' + t(o.a) + ' L of water.', why: 'The ' + t('y') + '-intercept is an amount of water at the start, and the ' + t('x') + '-intercept is a distance.' },
            { html: 'The group drinks ' + t(o.b) + ' L per kilometre for ' + t(o.a) + ' km.', why: 'A rate per kilometre is the slope, not an intercept.' }],
            t(ptT([0, o.b])) + ': at ' + t('x=0') + ' km the group has ' + t(o.b) + ' L — what they set out with.<br>' + t(ptT([o.a, 0])) + ': after ' + t(o.a) + ' km the supply is ' + t('0') + ' — the ' + t('x') + '-intercept marks the moment the water runs out.', ['At each intercept, one of the two quantities is zero. What does that mean here?'], 'interpret intercepts (kayak)');
        } },
        { id: 'e1k3', sub: 'k3', level: 'EMG', outcome: 'RF5', make: function (r, o) {
          return B.fields('On the kayak trip (' + t('x') + ' = kilometres paddled, ' + t('y') + ' = litres of water left): how much water is left after ' + t(o.x5) + ' km? After how many kilometres is the supply gone?', [fld('water left', 'fraction', { after: 'L' }), fld('supply gone after', 'fraction', { after: 'km' })], [exactV(qv(o.w5)), exactV(o.a)], [qT(o.w5), String(o.a)],
            t(qT(o.w5)) + ' L; after ' + t(o.a) + ' km',
            'After ' + t(o.x5) + ' km (substitute and <b>evaluate</b>): ' + t('y=' + qT(o.m) + '(' + o.x5 + ')+' + o.b + '=' + qT(o.w5) + (isInt(qm(o.w5, 100)) && !isInt(o.w5) ? '=' + dec(qv(o.w5)) : '')) + ' L.<br>Gone (substitute ' + t('y=0') + ' and <b>solve</b>): ' + t(pol([[o.L.A, 'x'], [o.L.C, '']]) + '=0') + ', ' + t('x=' + o.a) + ' km.',
            ['Evaluate the equation at ' + t('x=' + o.x5) + '. “Gone” means ' + t('y=0') + '.'], 'use the model (kayak)');
        } },
        { id: 'e1l', sub: 'l', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var cols = [{ id: 'si', html: 'slope–intercept form' }, { id: 'gen', html: 'general form' }, { id: 'ps', html: 'slope–point form' }];
          return B.grid('Three forms of this one line have now been written. Which form answers each job with the least work?', [{ id: 'a', html: 'Read the slope and ' + t('y') + '-intercept, (a) and (c)' }, { id: 'b', html: 'Find both intercepts, (b)' }, { id: 'd', html: 'Test whether a point is on the line, (d)' }], cols, { a: 'si', b: 'gen', d: 'gen' },
            { why: function (row) { return { code: 'row', hint: row === 'a' ? 'In ' + t('y=mx+b') + ', ' + t('m') + ' and ' + t('b') + ' are read straight off.' : row === 'b' ? 'Setting ' + t('x=0') + ' or ' + t('y=0') + ' in ' + t('Ax+By+C=0') + ' leaves a one-step equation with no fractions.' : 'Substitute the point into ' + t('Ax+By+C') + ' and see whether you get ' + t('0') + ' — nothing to rearrange.' }; } },
            '(a), (c): <b>slope–intercept form</b> — ' + t('m') + ' and ' + t('b') + ' are read straight off.<br>(b): <b>general form</b> — set ' + t('x=0') + ' or ' + t('y=0') + ': a one-step equation, no fractions.<br>(d): <b>general form</b> — substitute and check for ' + t('0') + '.', ['Think about which form needs no rearranging for each job.'], 'which form for which job');
        } }] },
    /* ---------------- Q2 ---------------- */
    { num: '2', shared: ep2,
      stem: function (o) {
        var gx = [o.a, 0], gy = [o.a + o.q, o.p];
        return '<b>One line, four descriptions.</b> The four descriptions below are all supposed to be the same line. Your job is to check.<br><b>I.</b> The equation ' + t(gT(o.L)) + '.<br><b>II.</b> The graph (the line passes through the two marked lattice points):' +
          HW.graph({ x: [-10, 10], y: [-10, 10], labels: 2, max: 300, segs: [{ pts: clip(o.L, [-10, 10], [-10, 10]), start: 'arrow', end: 'arrow' }], points: [{ x: gx[0], y: gx[1] }, { x: gy[0], y: gy[1] }] }) +
          '<b>III.</b> The table ' + HW.valueTable([[t('x')].concat(o.xs.map(function (x) { return t(String(x)); })), [t('y')].concat(o.ys.map(function (y) { return t(String(y)); }))]) +
          '<b>IV.</b> The two points ' + t(ptT([o.xs[0], o.ys[0]])) + ' and ' + t(ptT([o.xs[4], o.ys[4]])) + '.';
      },
      parts: [
        { id: 'e2a', sub: 'a i', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return B.slope('From <b>I</b>, determine the slope.', o.m, {}, t(pol([[o.L.B, 'y']]) + '=' + pol([[-o.L.A, 'x'], [-o.L.C, '']])) + ' ⟹ ' + t(sT(o.L)) + ', so ' + t('m=' + qT(o.m)) + '.', ['Solve for ' + t('y') + ', or use ' + t('m=-\\frac{A}{B}') + '.'], 'slope from general form');
        } },
        { id: 'e2a2', sub: 'a ii', level: 'PRG', outcome: 'RF5', make: function (r, o) { return intsP('From <b>I</b>, determine both intercepts as ordered pairs.', o.L, intSteps(o.L), ['Set ' + t('y=0') + ', then ' + t('x=0') + '.'], 'intercepts from general form'); } },
        { id: 'e2b', sub: 'b', level: 'BEG', outcome: 'RF5', make: function (r, o) {
          var gx = [o.a, 0], gy = [o.a + o.q, o.p];
          return B.fields('From <b>II</b>, read the slope and the ' + t('y') + '-intercept off the two marked points. (Do they match (a)?)', [fld('slope ' + t('m'), 'slope'), fld(t('y') + '-intercept ' + t('b'), 'slope')], [K.slope(o.m), K.value(o.b)], [qT(o.m), String(o.b)], t('m=' + qT(o.m)) + ', ' + t('b=' + o.b),
            'Marked points ' + t(ptT(gx)) + ' and ' + t(ptT(gy)) + ': ' + t('m=\\frac{' + o.p + '-0}{' + (o.a + o.q) + '-' + sgnP(o.a) + '}=' + qT(o.m)) + '. The line crosses the ' + t('y') + '-axis at ' + t(ptT([0, o.b])) + ', so ' + t('b=' + o.b) + '. <b>Yes</b> — both match (a).', ['Count the rise and the run between the two marked points.'], 'slope and b from graph');
        } },
        { id: 'e2c', sub: 'c', level: 'PRG', outcome: 'RF4', make: function (r, o) {
          return B.slope('From <b>III</b>, determine the slope. (The ' + t('x') + '-values step by ' + t(o.q) + ', not by ' + t('1') + '.)', o.m, { diag: function (v) { return v === o.p ? { code: 'rate-step', hint: 'Each ' + t('y') + ' changes by ' + t(o.p) + ', but that is over a run of ' + t(o.q) + '. Divide each first difference by the ' + t('x') + '-step.' } : null; } },
            'Each ' + t('y') + ' changes by ' + t(o.p) + ' while each ' + t('x') + ' rises by ' + t(o.q) + ': ' + t('m=\\frac{\\Delta y}{\\Delta x}=' + qT(o.m)) + '. The first differences (' + t(o.p) + ') are the rise for a run of ' + t(o.q) + ', so each must be divided by the ' + t('x') + '-step before it is the slope.', ['Slope = change in ' + t('y') + ' ÷ change in ' + t('x') + ' between neighbouring columns.'], 'slope from table, x-step');
        } },
        { id: 'e2d', sub: 'd', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          var P1 = [o.xs[0], o.ys[0]], P2 = [o.xs[4], o.ys[4]];
          return lineP('From <b>IV</b>, build the equation in slope–point form and convert it to general form. Enter the <b>general form</b>. (Does it match I?)', o.L, { form: 'general' }, slopeSteps(P1, P2) + '<br>' + psSteps(o.m, P2) + '<br><b>Matches I</b> ✓', ['Slope from the two points, slope–point form, then clear fractions and move everything to one side.'], 'two points → general');
        } },
        { id: 'e2e', sub: 'e', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          return mc(r, 'Only one of the four descriptions hands you the ' + t('y') + '-intercept with no work at all. Which one, and why?', [
            { html: '<b>III</b>, the table: it contains ' + t('x=0') + ', and ' + t('b') + ' is the ' + t('y') + '-value at ' + t('x=0') + '.', right: true },
            { html: '<b>I</b>, the equation: ' + t('b') + ' is the constant term.', why: 'In general form the constant is ' + t('C=' + o.L.C) + ', not ' + t('b') + '. You still have to solve for ' + t('y') + '.' },
            { html: '<b>II</b>, the graph: the line crosses the ' + t('y') + '-axis.', why: 'The graph shows it only by eye — the crossing isn’t a marked point. The table states it exactly.' },
            { html: '<b>IV</b>, the two points: they give the slope and a point.', why: 'Neither point has ' + t('x=0') + ', so you’d have to build the equation first.' }],
            '<b>III</b>: it contains ' + t('x=0') + ', and ' + t('b') + ' is the ' + t('y') + '-value there, so ' + t('b=' + o.b) + ' is read straight off. (II gives it only by eye; I and IV need working.)', ['Where is ' + t('x=0') + ' given directly?'], 'which description gives b');
        } },
        { id: 'e2f', sub: 'f i', level: 'EMG', outcome: 'RF7', make: function (r, o) {
          var L5 = lineMB(o.m, o.c5);
          return lineP('A classmate adds a fifth description: “slope ' + t(qT(o.m)) + ', through ' + t(ptT([0, o.c5])) + '.” Write its general form.', L5, { form: 'general' }, t('y=' + pol([[o.m, 'x'], [o.c5, '']])) + ' ⟹ ' + t(gT(L5)), ['The point is the ' + t('y') + '-intercept: write ' + t('y=mx+b') + ' first, then clear the fraction.'], 'general from m and b');
        } },
        { id: 'e2f2', sub: 'f ii', level: 'EMG', outcome: 'RF7', make: function (r, o) {
          var d = o.c5 - o.b, up = d > 0;
          return mc(r, 'How is the fifth description related to the other four?', [
            { html: 'Parallel to the line, but not the same line — ' + t(Math.abs(d)) + ' units ' + (up ? 'higher' : 'lower') + '.', right: true },
            { html: 'It is the same line.', why: 'Same slope, but the ' + t('y') + '-intercepts differ (' + t(o.c5) + ' and ' + t(o.b) + '), so it is a different line.' },
            { html: 'Perpendicular to the line.', why: 'The slopes are equal, not negative reciprocals.' },
            { html: 'Parallel to the line, but not the same line — ' + t(Math.abs(d)) + ' units ' + (up ? 'lower' : 'higher') + '.', why: 'Compare the ' + t('y') + '-intercepts: ' + t(o.c5) + ' is ' + (up ? 'above' : 'below') + ' ' + t(o.b) + '.' }],
            'Same ' + t('A') + ' and ' + t('B') + ' (same slope), different ' + t('C') + ': <b>parallel to, but not the same as</b>, the other four — ' + t(Math.abs(d)) + ' units ' + (up ? 'higher' : 'lower') + '.', ['Compare the slopes, then the ' + t('y') + '-intercepts.'], 'relation of fifth description');
        } }] },
    /* ---------------- Part B — Q3 ---------------- */
    { num: '3', section: 'Extra practice B — Building from a condition', stem: 'Determine the equation of each line in <b>general form</b>, ' + t('Ax+By+C=0') + '. (Write down the slope and the point you extracted before you touch a formula.)',
      shared: function (r) { return { bis: BIS(r), P: PP(r) }; }, parts: [
      { id: 'e3a', sub: 'a', level: 'ADV', outcome: 'RF7', make: function (r) {
        var A, Bp, M, s, c, g = 0;
        do { A = [r.int(-8, 0), r.int(-2, 6)]; Bp = [A[0] + 2 * r.int(2, 6), A[1] - 2 * r.int(1, 6)]; M = [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2]; s = r.pick([2, 3, 4, 5]) * (r.chance(0.6) ? 1 : -1); c = rnz(r, -9, 9); g++; } while ((Math.abs(Bp[0]) > 9 || lineMP(Q(-1, s), M).C === 0 || M[0] === 0) && g < 100);
        var Lg = L3(s, -1, c), n = Q(-1, s), T = lineMP(n, M);
        return lineP('through the midpoint of ' + t('A' + ptT(A)) + ' and ' + t('B' + ptT(Bp)) + ', perpendicular to ' + t(gT(Lg)), T, { form: 'general', wrong: [{ is: lineMP(Q(s), M), code: 'line-parallel', hint: 'That line is parallel to ' + t(gT(Lg)) + '. Perpendicular: negative reciprocal of ' + t(s) + '.' }, { is: lineMP(n, A), code: 'diag', hint: 'Right slope, but your line goes through ' + t('A') + '. It must go through the <b>midpoint</b> of ' + t('AB') + '.' }, { is: lineMP(n, Bp), code: 'diag', hint: 'Right slope, but your line goes through ' + t('B') + '. It must go through the <b>midpoint</b> of ' + t('AB') + '.' }] },
          'Midpoint: ' + t('\\left(\\frac{' + A[0] + '+' + sgnP(Bp[0]) + '}{2},\\ \\frac{' + A[1] + '+' + sgnP(Bp[1]) + '}{2}\\right)=' + ptT(M)) + '.<br>' + t(gT(Lg)) + ': ' + t('m=' + s) + ', so ' + t('m_{\\perp}=' + qT(n)) + '.<br>' + psSteps(n, M), ['Two pieces: the point is the midpoint; the slope is the negative reciprocal of the given line’s slope.'], 'perp through midpoint');
      } },
      { id: 'e3b', sub: 'b', level: 'PRG', outcome: 'RF7', make: function (r) {
        var k, u, P1, P2, w, g = 0;
        do { k = rnz(r, -6, 6); u = sl(r, [[3, 5], [2, 3], [3, 4], [2, 5], [4, 3], [1, 3]]); P1 = [r.int(-7, -2), r.int(-3, 4)]; var d = r.pick([[2, -1], [3, -1], [3, 2], [4, -1], [4, 3], [2, 1], [3, -2]]); var kk = r.pick([2, 4]); if (d[0] === 3 || d[0] === 2 && d[1] === 1) kk = r.pick([1, 2]); P2 = [P1[0] + kk * d[0], P1[1] + kk * d[1]]; w = Q(d[1], d[0]); g++; }
        while ((Math.abs(k) < 2 || Math.abs(P2[0]) > 9 || Math.abs(P2[1]) > 9 || qv(w) === qv(u)) && g < 100);
        var Lg = lineMB(u, k), T = lineMB(w, k);
        return lineP('through the ' + t('y') + '-intercept of ' + t(gT(Lg)) + ', parallel to the line joining ' + t(ptT(P1)) + ' and ' + t(ptT(P2)), T, { form: 'general', wrong: [{ is: lineMB(u, k), code: 'diag', hint: 'That is the given line itself. Its ' + t('y') + '-intercept is the point; the slope comes from the line joining ' + t(ptT(P1)) + ' and ' + t(ptT(P2)) + '.' }, { is: lineMP(w, P1), code: 'diag', hint: 'Right slope, but your line goes through ' + t(ptT(P1)) + '. It must go through the ' + t('y') + '-intercept of ' + t(gT(Lg)) + '.' }, { is: lineMB(perpS(w), k), code: 'line-perp-wrong', hint: 'That slope makes a perpendicular line. Parallel: the same slope as the joining line.' }] },
          t('y') + '-intercept of ' + t(gT(Lg)) + ': ' + t('x=0') + ', ' + t(pol([[Lg.B, 'y'], [Lg.C, '']]) + '=0') + ', ' + t('y=' + k) + '; point ' + t(ptT([0, k])) + '.<br>Joining line: ' + slopeSteps(P1, P2) + '.<br>' + t('y=' + pol([[w, 'x'], [k, '']])) + ' ⟹ ' + t(gT(T)), ['Point: set ' + t('x=0') + ' in the given equation. Slope: from the two points.'], 'parallel through y-intercept');
      } },
        { id: 'e3c', sub: 'c', level: 'MAS', outcome: 'RF7', make: function (r, sh) { var o = sh.bis;
          return lineP('the <b>perpendicular bisector</b> of the segment joining ' + t('C' + ptT(o.C)) + ' and ' + t('D' + ptT(o.D)), o.T, { form: 'general', wrong: [{ is: lineMP(o.n, o.C), code: 'diag', hint: 'Right slope, but your line goes through ' + t('C') + '. A bisector goes through the <b>midpoint</b> of ' + t('CD') + '.' }, { is: lineMP(o.n, o.D), code: 'diag', hint: 'Right slope, but your line goes through ' + t('D') + '. A bisector goes through the <b>midpoint</b> of ' + t('CD') + '.' }, { is: lineMP(o.mCD, o.M), code: 'line-parallel', hint: 'That is line ' + t('CD') + ' itself (same slope). The bisector is <b>perpendicular</b> to ' + t('CD') + '.' }] },
            'Midpoint of ' + t('CD') + ': ' + t(ptT(o.M)) + '.<br>' + slopeSteps(o.C, o.D) + ', so ' + t('m_{\\perp}=' + qT(o.n)) + '.<br>' + psSteps(o.n, o.M), ['A perpendicular bisector passes through the midpoint and is perpendicular to the segment.'], 'perpendicular bisector');
        } },
      { id: 'e3d', sub: 'd', level: 'MAS', outcome: 'RF7', make: function (r) {
        var n = r.pick([2, 3, 4]), x0 = r.int(2, 9), y0 = r.int(1, 6), c = x0 + n * y0, T = L3(1, n, -c);
        return lineP('a line with non-zero intercepts whose ' + t('x') + '-intercept is exactly <b>' + ['', '', 'two', 'three', 'four'][n] + ' times</b> its ' + t('y') + '-intercept, passing through ' + t(ptT([x0, y0])), T, { form: 'general', wrong: [{ is: L3(n, 1, -(n * x0 + y0)), code: 'diag', hint: 'For your line the <b>' + t('y') + '-intercept</b> is ' + n + ' times the ' + t('x') + '-intercept. Swap the roles.' }, { is: lineMP(Q(1, n), [x0, y0]), code: 'line-slope-sign', hint: 'With intercepts ' + t('(' + n + 'k,\\ 0)') + ' and ' + t('(0,\\ k)') + ' the slope is ' + t('\\frac{k-0}{0-' + n + 'k}=-\\frac{1}{' + n + '}') + ': negative.' }] },
          'Let the ' + t('y') + '-intercept be ' + t('(0,\\ k)') + ', ' + t('k\\ne 0') + '; then the ' + t('x') + '-intercept is ' + t('(' + n + 'k,\\ 0)') + '.<br>Slope: ' + t('m=\\frac{k-0}{0-' + n + 'k}=-\\frac{1}{' + n + '}') + ' (whatever ' + t('k') + ' is).<br>' + psSteps(Q(-1, n), [x0, y0]) + '<br>Intercepts ' + t(ptT([c, 0])) + ' and ' + t(ptT([0, Q(c, n)])) + ': ' + t(c + '=' + n + '\\times ' + qT(Q(c, n))) + ' ✓',
          ['Call the ' + t('y') + '-intercept ' + t('(0,\\ k)') + '. Write the ' + t('x') + '-intercept in terms of ' + t('k') + ', then find the slope.'], 'intercepts in a ratio');
      } },
        { id: 'e3e', sub: 'e i', level: 'EMG', outcome: 'RF7', make: function (r, sh) { var o = sh.P;
          return lineP('through ' + t(ptT(o.P)) + ', <b>parallel</b> to the ' + t('x') + '-axis', { y: o.P[1] }, { form: 'general' }, 'Parallel to the ' + t('x') + '-axis: horizontal, ' + t('y=' + o.P[1]) + ', so ' + t(gT(L3(0, 1, -o.P[1])) ) + '.', ['A line parallel to the ' + t('x') + '-axis is horizontal: ' + t('y=k') + '.'], 'horizontal through point (general)');
        } },
        { id: 'e3e2', sub: 'e ii', level: 'EMG', outcome: 'RF7', make: function (r, sh) { var o = sh.P;
          return lineP('through ' + t(ptT(o.P)) + ', <b>perpendicular</b> to the ' + t('x') + '-axis', { x: o.P[0] }, { form: 'general' }, 'Perpendicular to the ' + t('x') + '-axis: vertical, ' + t('x=' + o.P[0]) + ', so ' + t(gT(L3(1, 0, -o.P[0]))) + '.', ['A line perpendicular to the ' + t('x') + '-axis is vertical: ' + t('x=k') + '.'], 'vertical through point (general)');
        } },
        { id: 'e3f', sub: 'f', level: 'EMG', outcome: 'RF6', make: function (r, sh) { var o = sh.P;
          var v = o.P[1];
          return mc(r, 'In (e), the line through ' + t(ptT(o.P)) + ' <b>parallel</b> to the ' + t('x') + '-axis is horizontal, so its general form has ' + t('A=0') + ' and cannot have “' + t('A') + ' positive”. What does the unit do instead?', [
            { html: 'Make the leading non-zero coefficient, ' + t('B') + ', positive: ' + t(gT(L3(0, 1, -v))) + ', not ' + t(pol([[-1, 'y'], [v, '']]) + '=0') + '.', right: true },
            { html: 'Make ' + t('C') + ' positive: ' + t(v > 0 ? pol([[-1, 'y'], [v, '']]) + '=0' : gT(L3(0, 1, -v))) + '.', why: 'The sign rule is about the first variable term, not the constant.' },
            { html: 'Nothing — when ' + t('A=0') + ' any sign is fine.', why: 'The unit still fixes the sign so every line has one standard general form: the first non-zero coefficient is made positive.' },
            { html: 'Write it as ' + t('0x+' + pol([[1, 'y'], [-v, '']]) + '=0') + ' so that ' + t('A') + ' appears.', why: 'A zero term is left out. The rule moves to the leading <b>non-zero</b> coefficient.' }],
            t('y-' + sgnP(v) + '=0') + ' has ' + t('A=0') + '. The unit then makes the <b>leading non-zero coefficient</b> positive — here ' + t('B') + '. Write ' + t(gT(L3(0, 1, -v))) + '.', ['Which coefficient comes first once ' + t('A') + ' is zero?'], 'sign rule when A = 0');
        } },
        { id: 'e3g', sub: 'g', level: 'EMG', outcome: 'EXT', make: function (r, sh) { var o = sh.bis;
          var d2 = dist2(o.C, o.Pt);
          return B.fields('Verify (c): the point ' + t(ptT(o.Pt)) + ' is on the perpendicular bisector of ' + t('C' + ptT(o.C)) + ' and ' + t('D' + ptT(o.D)) + '. Determine its exact distance from ' + t('C') + ' and from ' + t('D') + '.', [fld('distance to ' + t('C'), 'radical'), fld('distance to ' + t('D'), 'radical')], [exactV(Math.sqrt(d2), 'a radical'), exactV(Math.sqrt(dist2(o.D, o.Pt)), 'a radical')], [radTex(d2), radTex(d2)], t(radTex(d2)) + ' both',
            t(ptT(o.Pt)) + ' is on (c): ' + t(sub(o.T, o.Pt) + '=0') + ' ✓<br>' + t('C') + ' to ' + t(ptT(o.Pt)) + ': ' + t(distT(o.C, o.Pt)) + '<br>' + t('D') + ' to ' + t(ptT(o.Pt)) + ': ' + t(distT(o.D, o.Pt)) + '<br>Both ' + t(radTex(d2)) + ' — equal, as every point of a perpendicular bisector must be.', ['Distance formula: ' + t('d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}') + '.'], 'equidistant check');
        } }] },
    /* ---------------- Q4 ---------------- */
    { num: '4', stem: function (o) { return 'Consider the line ' + t(pol([[1, 'kx'], [-o.B, 'y'], [o.C, '']]) + '=0') + ', where ' + t('k') + ' is a constant.'; },
      shared: function (r) {
        for (var g = 0; g < 400; g++) {
          var gpq = r.pick([[2, 3], [3, 2], [1, 2], [2, 1], [1, 3], [3, 1], [3, 4]]), sg = r.chance(0.7) ? -1 : 1, Bc = gpq[0] * gpq[1] * r.pick([1, 1, 2]); if (Bc < 2 || Bc > 12) continue;
          var b0 = rnz(r, -5, 5); if (Math.abs(b0) < 2) continue;
          var gS = Q(sg * gpq[0], gpq[1]), Cc = Bc * b0, kp = Bc * qv(gS), kq = Bc * qv(perpS(gS)), Lgv = lineMB(gS, b0);
          var pts = []; for (var x0 = -9; x0 <= 9; x0++) for (var y0 = -5; y0 <= 5; y0++) { if (!x0) continue; var kk = (Bc * y0 - Cc) / x0; if (Number.isInteger(kk) && kk !== 0 && kk !== kp && kk !== kq && Math.abs(kk) <= 12 && y0 !== b0) pts.push([x0, y0, kk]); }
          var hs = []; for (var h = -12; h <= 12; h++) { if (!h) continue; var kh = -Cc / h; if (Number.isInteger(kh) && kh !== 0 && kh !== kp && kh !== kq && Math.abs(kh) <= 12) hs.push([h, kh]); }
          if (!pts.length || !hs.length) continue;
          var pt = r.pick(pts), hh = r.pick(hs.filter(function (z) { return z[1] !== pt[2]; }).concat(hs.length === 1 ? hs : [])); if (!hh) continue;
          return { B: Bc, C: Cc, b0: b0, gS: gS, G: Lgv, kp: kp, kq: kq, pt: pt, h: hh };
        }
        return { B: 6, C: 18, b0: 3, gS: Q(-2, 3), G: L3(2, 3, -9), kp: -4, kq: 9, pt: [-4, 1, 3], h: [-9, 2] };
      },
      parts: [
        { id: 'e4a', sub: 'a', level: 'PRG', outcome: 'RF6', make: function (r, o) {
          return B.fields('Rearrange into ' + t('y=mx+b') + ', carrying ' + t('k') + ' as a letter. State ' + t('m') + ' and ' + t('b') + '.', [fld(t('m='), 'poly', { vars: ['k'] }), fld(t('b='), 'poly', { vars: ['k'] })], [K.poly(PL.parse('\\frac{1}{' + o.B + '}k')), K.value(o.b0)], ['\\frac{k}{' + o.B + '}', String(o.b0)],
            t('m=\\frac{k}{' + o.B + '}') + ', ' + t('b=' + o.b0),
            t(pol([[-o.B, 'y']]) + '=-kx' + (o.C < 0 ? '+' + (-o.C) : '-' + o.C)) + ' ⟹ ' + t('y=\\frac{k}{' + o.B + '}x' + (o.b0 < 0 ? '' : '+') + o.b0) + '.<br>' + t('m=\\frac{k}{' + o.B + '}') + ', ' + t('b=' + o.b0) + ': ' + t('b') + ' does <b>not</b> depend on ' + t('k') + ' — every line in the family crosses the ' + t('y') + '-axis at ' + t(ptT([0, o.b0])) + '.',
            ['Move ' + t('kx') + ' and the constant to the right, then divide every term by ' + t(-o.B) + '.'], 'slope and b with a parameter');
        } },
        { id: 'e4b', sub: 'b i', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          return B.number('Determine ' + t('k') + ' so that the line is <b>parallel</b> to ' + t(gT(o.G)) + '.', o.kp, function (v) { if (v === -o.kp) return { code: 'slope-sign', hint: 'The slope of ' + t(gT(o.G)) + ' is ' + t(qT(o.gS)) + '. Check the sign.' }; if (v === o.kq) return { code: 'slope-perp', hint: 'That value makes the lines perpendicular. Parallel: ' + t('\\frac{k}{' + o.B + '}=' + qT(o.gS)) + '.' }; return null; },
            t(gT(o.G)) + ': ' + t('m=' + qT(o.gS)) + '. ' + t('\\frac{k}{' + o.B + '}=' + qT(o.gS)) + ', so ' + t('k=' + o.kp) + '.', ['Set ' + t('\\frac{k}{' + o.B + '}') + ' equal to the slope of the given line.'], 'k for parallel');
        } },
        { id: 'e4b2', sub: 'b ii', level: 'EMG', outcome: 'RF7', make: function (r, o) {
          return mc(r, 'With ' + t('k=' + o.kp) + ', write your line in the unit’s general form and look hard at the result. What do you find?', [
            { html: 'It is ' + t(gT(o.G)) + ' — the given line itself, not a different parallel line.', right: true },
            { html: 'It is a different line parallel to ' + t(gT(o.G)) + '.', why: 'Write it out: ' + t(pol([[o.kp, 'x'], [-o.B, 'y'], [o.C, '']]) + '=0') + ' reduces to ' + t(gT(o.G)) + ' exactly.' },
            { html: 'It is perpendicular to ' + t(gT(o.G)) + '.', why: 'The slopes are equal, so the lines can’t be perpendicular.' },
            { html: 'It is not a line at all.', why: 'Every ' + t('k') + ' gives a line here (the ' + t('y') + '-term is always there).' }],
            t(pol([[o.kp, 'x'], [-o.B, 'y'], [o.C, '']]) + '=0') + ' reduces to ' + t(gT(o.G)) + ': the given line itself. Both cross the ' + t('y') + '-axis at ' + t(ptT([0, o.b0])) + ', and with equal slopes that makes them the same line.', ['Divide your equation by its common factor and compare.'], 'parallel sting');
        } },
        { id: 'e4c', sub: 'c', level: 'ADV', outcome: 'RF7', make: function (r, o) {
          var kp = o.kp, Bc = o.B, C0 = o.C, eqv = function (c2) { return L3(kp, -Bc, c2); };
          var chk = function (resp) {
            resp = resp || []; var p = HW.parse.number(resp[0]); if (!p.ok) return form('empty', 'Give the new constant (a number) in the first box.');
            var c2 = p.value; if (!Number.isInteger(c2)) return form('notint', 'Use a whole number for the constant so the general form has integer coefficients.');
            if (c2 === C0) return wrong('diag', 'Keeping ' + t(C0) + ' gives the same line again. Pick a different constant.');
            var res = K.line(eqv(c2), { form: 'general' })(resp[1]);
            if (res.v === 'correct') return ok();
            return { v: res.v, code: res.code, hint: '<b>General form:</b> ' + (res.hint || 'Write ' + t(pol([[kp, 'x'], [-Bc, 'y']]) + (c2 < 0 ? '' : '+') + c2 + '=0') + ' in lowest terms with ' + t('A>0') + '.') };
          };
          var key = [String(C0 - Bc), gT(eqv(C0 - Bc))];
          var p = B.fields('With ' + t('k=' + kp) + ' (part (b)), the line ' + t(pol([[kp, 'x'], [-Bc, 'y'], [C0, '']]) + '=0') + ' turns out to be the given line ' + t(gT(o.G)) + ' itself, so it isn’t really “parallel”. Change the constant ' + t(C0) + ' to a value that makes the line parallel to <b>and different from</b> ' + t(gT(o.G)) + ', and write the new line in general form.', [{ label: 'new constant' }, fld('general form', 'eq', { vars: ['x', 'y'] })], [K.number(0), K.number(0)], key,
            'e.g. ' + t(String(C0 - Bc)) + ': ' + t(gT(eqv(C0 - Bc))),
            'Parallel lines are two <b>different</b> lines with one slope, but (b) gave the same line: ' + t('b=' + o.b0) + ' is fixed, and ' + t(gT(o.G)) + ' also crosses at ' + t(ptT([0, o.b0])) + '.<br>Change ' + t(C0) + ' to e.g. ' + t(C0 - Bc) + ': ' + t(pol([[kp, 'x'], [-Bc, 'y'], [C0 - Bc, '']]) + '=0') + ', i.e. ' + t(gT(eqv(C0 - Bc))) + ' (same slope, ' + t('y') + '-intercept ' + t(ptT([0, Q(C0 - Bc, Bc)])) + ').',
            ['Any constant except ' + t(C0) + ' changes the ' + t('y') + '-intercept but keeps the slope.'], 'make it parallel and different');
          p.check = chk; p.good = [[String(C0 + Bc), gT(eqv(C0 + Bc))], [String(C0 + 2 * Bc), gT(eqv(C0 + 2 * Bc))]]; p.bad = [[String(C0), gT(o.G)], [String(C0 - Bc), gT(o.G)]];
          return p;
        } },
        { id: 'e4d', sub: 'd', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          var Lq = L3(o.kq, -o.B, o.C);
          return B.fields('Determine ' + t('k') + ' so that the line is <b>perpendicular</b> to ' + t(gT(o.G)) + ', and give the line in lowest terms in general form.', [{ label: t('k=') }, fld('general form', 'eq', { vars: ['x', 'y'] })],
            [K.number(o.kq, function (v) { return v === o.kp ? { code: 'slope-perp', hint: 'That makes the lines parallel. Perpendicular: ' + t('\\frac{k}{' + o.B + '}') + ' must be the negative reciprocal of ' + t(qT(o.gS)) + '.' } : v === -o.kq ? { code: 'slope-sign', hint: 'Check the sign of the negative reciprocal.' } : null; }), K.line(Lq, { form: 'general' })], [String(o.kq), gT(Lq)],
            t('k=' + o.kq) + '; ' + t(gT(Lq)),
            t('m_{\\perp}=' + qT(perpS(o.gS))) + '. ' + t('\\frac{k}{' + o.B + '}=' + qT(perpS(o.gS))) + ', so ' + t('k=' + o.kq) + '.<br>' + t(pol([[o.kq, 'x'], [-o.B, 'y'], [o.C, '']]) + '=0') + ' ⟹ ' + t(gT(Lq)) + '.<br>Check: ' + t('\\left(' + qT(o.gS) + '\\right)\\left(' + qT(perpS(o.gS)) + '\\right)=-1') + ' ✓',
            ['The family’s slope is ' + t('\\frac{k}{' + o.B + '}') + '. Set it equal to the negative reciprocal of the given slope.'], 'k for perpendicular');
        } },
        { id: 'e4e', sub: 'e', level: 'EMG', outcome: 'RF7', make: function (r, o) {
          var p = o.pt, h = o.h;
          return B.fields('Determine ' + t('k') + ' so that the line passes through ' + t(ptT([p[0], p[1]])) + ', and separately determine ' + t('k') + ' so that the line has ' + t('x') + '-intercept ' + t(ptT([h[0], 0])) + '.', [{ label: t('k') + ' (through the point)' }, { label: t('k') + ' (' + t('x') + '-intercept)' }], [K.number(p[2]), K.number(h[1])], [String(p[2]), String(h[1])],
            t('k=' + p[2]) + '; ' + t('k=' + h[1]),
            'Through ' + t(ptT([p[0], p[1]])) + ': ' + t('k(' + p[0] + ')-' + o.B + '(' + p[1] + ')' + (o.C < 0 ? '' : '+') + o.C + '=0') + ' ⟹ ' + t('k=' + p[2]) + '.<br>' + t('x') + '-intercept ' + t(ptT([h[0], 0])) + ': ' + t('k(' + h[0] + ')-' + o.B + '(0)' + (o.C < 0 ? '' : '+') + o.C + '=0') + ' ⟹ ' + t('k=' + h[1]) + '.',
            ['Substitute the point into the equation and solve for ' + t('k') + '.'], 'k from a point');
        } },
        { id: 'e4f', sub: 'f', level: 'PRG', outcome: 'RF6', make: function (r, o) {
          return mc(r, 'Which is possible — making this line horizontal, or making it vertical?', [
            { html: 'Horizontal, with ' + t('k=0') + '. Vertical is impossible: the ' + t(-o.B + 'y') + ' term is there for every ' + t('k') + ', so the slope ' + t('\\frac{k}{' + o.B + '}') + ' is always a real number.', right: true },
            { html: 'Vertical, with ' + t('k=0') + '. Horizontal is impossible.', why: 'With ' + t('k=0') + ' the ' + t('x') + '-term disappears: ' + t(pol([[-o.B, 'y'], [o.C, '']]) + '=0') + ' is ' + t('y=' + o.b0) + ', a <b>horizontal</b> line.' },
            { html: 'Both: ' + t('k=0') + ' for horizontal and a very large ' + t('k') + ' for vertical.', why: 'However large ' + t('k') + ' is, the slope ' + t('\\frac{k}{' + o.B + '}') + ' is a number, so the line is never vertical.' },
            { html: 'Neither: ' + t('k') + ' only changes the steepness.', why: 'Try ' + t('k=0') + ': the slope becomes ' + t('0') + '.' }],
            '<b>Horizontal is possible</b>: ' + t('k=0') + ' gives ' + t(pol([[-o.B, 'y'], [o.C, '']]) + '=0') + ', i.e. ' + t(gT(L3(0, 1, -o.b0))) + ' (slope ' + t('0') + ').<br><b>Vertical is not</b>: that needs no ' + t('y') + '-term, but ' + t(-o.B + 'y') + ' is there for every ' + t('k') + '.', ['A vertical line has no ' + t('y') + '-term; a horizontal line has no ' + t('x') + '-term.'], 'horizontal vs vertical in a family');
        } }] },
    /* ---------------- Part C — Q5 ---------------- */
    { num: '5', section: 'Extra practice C — Graphs and tables',
      shared: function (r) {
        for (var g = 0; g < 300; g++) {
          var pq = r.pick([[2, 3], [3, 2], [1, 2], [2, 1], [1, 3], [3, 4], [4, 3]]), s = r.chance(0.7) ? 1 : -1, j = r.pick([1, 2]);
          var X = [j * pq[1], j * s * pq[0]], c1 = r.pick([-1, -2]), A1 = [c1 * X[0], c1 * X[1]], d2 = [-s * pq[0], pq[1]], kk = r.pick([1, 2]);
          var U = [X[0] - kk * d2[0], X[1] - kk * d2[1]], V = [X[0] + kk * d2[0], X[1] + kk * d2[1]];
          if ([X, A1, U, V].some(function (p) { return Math.abs(p[0]) > 8 || Math.abs(p[1]) > 8; })) continue;
          var L1 = line2([0, 0], X), L2 = line2(U, V); if (L2.C === 0) continue;
          return { X: X, A1: A1, U: U, V: V, L1: L1, L2: L2, m1: slopeOf(L1), m2: slopeOf(L2) };
        }
        return { X: [3, 2], A1: [-6, -4], U: [1, 5], V: [5, -1], L1: L3(2, -3, 0), L2: L3(3, 2, -13), m1: Q(2, 3), m2: Q(-3, 2) };
      },
      stem: function (o) {
        var xr = [-8, 8];
        return 'Two lines are drawn on the grid; each passes through its two marked lattice points: ' + t('\\ell_1') + ' (teal) through ' + t(ptT(o.A1)) + ' and ' + t(ptT(o.X)) + ', and ' + t('\\ell_2') + ' (orange) through ' + t(ptT(o.U)) + ' and ' + t(ptT(o.V)) + '.' +
          HW.graph({ x: xr, y: xr, labels: 2, max: 320, segs: [{ pts: clip(o.L1, xr, xr), start: 'arrow', end: 'arrow' }, { pts: clip(o.L2, xr, xr), start: 'arrow', end: 'arrow', color: '#c46a1b' }],
            points: [{ x: o.A1[0], y: o.A1[1] }, { x: o.X[0], y: o.X[1] }, { x: o.U[0], y: o.U[1] }, { x: o.V[0], y: o.V[1] }] });
      },
      parts: [
        { id: 'e5a', sub: 'a i', level: 'EMG', outcome: 'RF7', make: function (r, o) {
          return lineP('Write ' + t('\\ell_1') + ' in <b>slope–intercept form</b>.', o.L1, { form: 'slope-intercept' }, slopeSteps(o.A1, o.X) + '. ' + t(o.X[1] + '=' + qT(o.m1) + '(' + o.X[0] + ')+b') + ', so ' + t('b=0') + ': ' + t(sT(o.L1)) + '.', ['Find the slope from the two marked points, then the ' + t('y') + '-intercept.'], 'slope-intercept from graph');
        } },
        { id: 'e5a2', sub: 'a ii', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return lineP('Write ' + t('\\ell_1') + ' in <b>general form</b>.', o.L1, { form: 'general' }, t(sT(o.L1)) + ' ⟹ ' + (o.m1[1] === 1 ? '' : t(o.m1[1] + 'y=' + pol([[o.m1[0], 'x']])) + ' ⟹ ') + t(gT(o.L1)), ['Clear the fraction and move everything to one side.'], 'general form, through origin');
        } },
        { id: 'e5a3', sub: 'a iii', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return psAnyP('Write ' + t('\\ell_1') + ' in <b>slope–point form</b>, using one marked point.', o.L1, [o.X, o.A1], {}, t(pT(o.L1, o.X)) + ' (or ' + t(pT(o.L1, o.A1)) + ')', ['Use ' + t('m=' + qT(o.m1)) + ' and either marked point.'], 'slope-point from graph');
        } },
        { id: 'e5b', sub: 'b', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          return lineP('Write ' + t('\\ell_2') + ' in general form.', o.L2, { form: 'general' }, slopeSteps(o.U, o.V) + '.<br>' + psSteps(o.m2, o.U), ['Slope from the two marked points, then slope–point form, then general form.'], 'general from graph');
        } },
        { id: 'e5c', sub: 'c', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var a = o.L1, b = o.L2;
          return mc(r, t('\\ell_1') + ' has ' + t('(A,\\ B)=(' + a.A + ',\\ ' + a.B + ')') + ' and ' + t('\\ell_2') + ' has ' + t('(A,\\ B)=(' + b.A + ',\\ ' + b.B + ')') + '. Which statement shows that ' + t('\\ell_1\\perp\\ell_2') + '?', [
            { html: 'The slopes multiply to ' + t('-1') + ': ' + t(qT(o.m1) + '\\times\\left(' + qT(o.m2) + '\\right)=-1') + '; and ' + t('A') + ', ' + t('B') + ' are swapped with one sign changed.', right: true },
            { html: 'The ' + t('A') + '-values are different, so the lines are perpendicular.', why: 'Different ' + t('A') + '-values only tell you the lines aren’t the same. Perpendicular slopes multiply to ' + t('-1') + '.' },
            { html: 'The slopes add to ' + t('0') + '.', why: 'Add them: ' + t(qT(o.m1) + '+\\left(' + qT(o.m2) + '\\right)=' + qT(qa(o.m1, o.m2))) + '. The test for perpendicular is a <b>product</b> of ' + t('-1') + '.' },
            { html: 'Both lines pass through ' + t(ptT(o.X)) + '.', why: 'Any two lines that cross share a point; that doesn’t make them perpendicular.' }],
            'Slopes: ' + t(qT(o.m1) + '\\times\\left(' + qT(o.m2) + '\\right)=-1') + ' ✓. Coefficients: ' + t('(' + a.A + ',\\ ' + a.B + ')') + ' and ' + t('(' + b.A + ',\\ ' + b.B + ')') + ' — ' + t('A') + ' and ' + t('B') + ' swapped and one sign changed, the perpendicular pattern ✓.', ['Multiply the two slopes.'], 'show perpendicular two ways');
        } },
        { id: 'e5d', sub: 'd', level: 'BEG', outcome: 'RF7', make: function (r, o) {
          return ptP('Read the point where the two lines cross off the graph (then prove it by substituting into both equations).', o.X, 'From the graph: ' + t(ptT(o.X)) + '.<br>' + t('\\ell_1') + ': ' + t(sub(o.L1, o.X) + '=0') + ' ✓<br>' + t('\\ell_2') + ': ' + t(sub(o.L2, o.X) + '=0') + ' ✓', ['It is one of the marked points.'], 'intersection from graph');
        } },
        { id: 'e5e', sub: 'e', level: 'EMG', outcome: 'RF5', make: function (r, o) {
          return mc(r, t('\\ell_1') + ' has ' + t('C=0') + '. What does that always tell you about a line?', [
            { html: 'It passes through the origin, so both intercepts are the same point, ' + t('(0,\\ 0)') + '.', right: true },
            { html: 'It has no intercepts.', why: 'Substitute ' + t('(0,\\ 0)') + ': ' + t('A(0)+B(0)+0=0') + '. The origin is on the line, and it is both intercepts.' },
            { html: 'It is horizontal.', why: 'A horizontal line has ' + t('A=0') + ', not ' + t('C=0') + '.' },
            { html: 'Its slope is ' + t('0') + '.', why: 'The slope is ' + t('-\\frac{A}{B}') + ', which doesn’t involve ' + t('C') + '.' }],
            t('C=0') + ' means ' + t('(0,\\ 0)') + ' satisfies the equation: the line passes through the <b>origin</b>. Both intercepts are the same point, ' + t('(0,\\ 0)') + '.', ['Substitute ' + t('x=0') + ' and ' + t('y=0') + '.'], 'meaning of C = 0');
        } },
        { id: 'e5f', sub: 'f', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return mc(r, 'One of these two lines cannot be graphed by the two-intercept strategy. Which one, and what would you use instead?', [
            { html: t('\\ell_1') + ': its two intercepts are the single point ' + t('(0,\\ 0)') + '. Use slope and ' + t('y') + '-intercept: plot ' + t('(0,\\ 0)') + ', then step ' + t(qT(o.m1)) + '.', right: true },
            { html: t('\\ell_2') + ': its intercepts are fractions. Use a table of values.', why: 'Fractional intercepts are awkward but still two different points. The real problem line has only <b>one</b> intercept point.' },
            { html: t('\\ell_1') + ': it has no ' + t('x') + '-intercept. Use a table of values.', why: 'It does: ' + t('(0,\\ 0)') + ' — the same point as its ' + t('y') + '-intercept, and one point can’t fix a line.' },
            { html: 'Neither: every line can be graphed from its intercepts.', why: 'A line through the origin has just one intercept point.' }],
            t('\\ell_1') + ': its two intercepts are the single point ' + t('(0,\\ 0)') + ', and one point cannot fix a line. Plot ' + t('(0,\\ 0)') + ' and step the slope ' + t(qT(o.m1)) + ' to ' + t(ptT([o.m1[1], o.m1[0]])) + '.', ['How many different intercept points does each line have?'], 'when the intercept strategy fails');
        } }] },
    /* ---------------- Q6 ---------------- */
    { num: '6',
      shared: function (r) {
        for (var g = 0; g < 300; g++) {
          var s = r.pick([3, 4, 5]), d = r.pick([1, 2, 3, 4, 5, 6, 7]) * (r.chance(0.7) ? -1 : 1); if (gcd(Math.abs(d), s) !== 1 || Math.abs(d) < 2) continue;
          var x0 = r.int(-8, -1); if (x0 % s === 0) continue;
          var y0 = r.int(-6, 14), xs = [0, 1, 2, 3, 4].map(function (j) { return x0 + j * s; }), ys = xs.map(function (x, j) { return y0 + j * d; });
          if (ys.some(function (y) { return Math.abs(y) > 20; }) || xs.indexOf(0) >= 0) continue;
          var m = Q(d, s), b = qs(y0, qm(m, x0)), J = r.int(7, 9), Jy = -r.int(2, 4), Xd = x0 + J * s, Yd = y0 + J * d, Xe = x0 + Jy * s, Ye = y0 + Jy * d;
          return { s: s, d: d, xs: xs, ys: ys, m: m, b: b, L: lineMB(m, b), Xd: Xd, Yd: Yd, Xe: Xe, Ye: Ye };
        }
        return { s: 5, d: -4, xs: [-6, -1, 4, 9, 14], ys: [13, 9, 5, 1, -3], m: Q(-4, 5), b: Q(41, 5), L: L3(4, 5, -41), Xd: 34, Yd: -19, Xe: -21, Ye: 25 };
      },
      stem: function (o) { return 'The table below comes from a linear relation. Note that ' + t('x') + ' steps by ' + t(o.s) + ' and that ' + t('x=0') + ' is not in the table.' + HW.valueTable([[t('x')].concat(o.xs.map(function (x) { return t(String(x)); })), [t('y')].concat(o.ys.map(function (y) { return t(String(y)); }))]); },
      parts: [
        { id: 'e6a', sub: 'a', level: 'PRG', outcome: 'RF4', make: function (r, o) {
          return B.slope('A student reads the ' + t('y') + '-row, sees it changing by ' + t(o.d) + ' each step, and writes ' + t('m=' + o.d) + '. Determine the correct slope.', o.m, { diag: function (v) { return v === o.d ? { code: 'rate-step', hint: 'That is the student’s error: ' + t(o.d) + ' is the change over a run of ' + t(o.s) + ', not ' + t('1') + '.' } : null; } },
            'Slope is the change in ' + t('y') + ' <b>per unit</b> change in ' + t('x') + '; here ' + t('x') + ' steps by ' + t(o.s) + ', so ' + t(o.d) + ' is the change over a run of ' + t(o.s) + '. ' + t('m=\\frac{' + o.d + '}{' + o.s + '}=' + qT(o.m)), ['Divide the change in ' + t('y') + ' by the change in ' + t('x') + '.'], 'slope from table, x-step');
        } },
        { id: 'e6b', sub: 'b', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          var x = o.xs[2], y = o.ys[2];
          return valP('Determine ' + t('b') + ' (it cannot simply be read off this table).', qv(o.b), qT(o.b), t('x=0') + ' is not in the table, so ' + t('b') + ' must be worked out. Substitute ' + t(ptT([x, y])) + ': ' + t(y + '=' + qT(o.m) + '(' + x + ')+b') + ' ⟹ ' + t('b=' + qT(o.b)) + '.<br>Check ' + t(ptT([o.xs[4], o.ys[4]])) + ': ' + t(qT(o.m) + '(' + o.xs[4] + ')' + (qv(o.b) < 0 ? '' : '+') + qT(o.b) + '=' + o.ys[4]) + ' ✓',
            ['Substitute any table point and the slope into ' + t('y=mx+b') + '.'], 'b from table', { before: 'b=' });
        } },
        { id: 'e6c', sub: 'c i', level: 'EMG', outcome: 'RF7', make: function (r, o) { return lineP('Write the relation in <b>slope–intercept form</b>.', o.L, { form: 'slope-intercept' }, t(sT(o.L)), ['Use the slope from (a) and ' + t('b') + ' from (b).'], 'slope-intercept from table'); } },
        { id: 'e6c2', sub: 'c ii', level: 'EMG', outcome: 'RF6', make: function (r, o) { return lineP('Write the relation in <b>general form</b>.', o.L, { form: 'general' }, 'Multiply ' + t(sT(o.L)) + ' by ' + t(o.s) + ' and move everything to one side: ' + t(gT(o.L)), ['Multiply every term by ' + t(o.s) + ' to clear the fractions.'], 'general from table'); } },
        { id: 'e6c3', sub: 'c iii', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var pts = o.xs.map(function (x, j) { return [x, o.ys[j]]; });
          return psAnyP('Write the relation in <b>slope–point form</b>, using a point from the table.', o.L, pts, {}, t(pT(o.L, pts[2])) + ' (any table point works)', ['Use the slope and any column of the table.'], 'slope-point from table');
        } },
        { id: 'e6d', sub: 'd', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          return B.number('Determine ' + t('y') + ' when ' + t('x=' + o.Xd) + '.', o.Yd, null, 'Slope–intercept form: ' + t('y=' + qT(o.m) + '(' + o.Xd + ')' + (qv(o.b) < 0 ? '' : '+') + qT(o.b) + '=' + o.Yd), ['Substitute into the slope–intercept form.'], 'evaluate from table model');
        } },
        { id: 'e6e', sub: 'e', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          var L = o.L;
          return B.number('Determine ' + t('x') + ' when ' + t('y=' + o.Ye) + '.', o.Xe, null, 'General form: ' + t(pol([[L.A, 'x'], [L.B, '(' + o.Ye + ')'], [L.C, '']]) + '=0') + ' ⟹ ' + t(pol([[L.A, 'x']]) + '=' + (-(L.B * o.Ye + L.C))) + ' ⟹ ' + t('x=' + o.Xe), ['Substitute ' + t('y=' + o.Ye) + ' into the general form and solve for ' + t('x') + '.'], 'solve for x from table model');
        } },
        { id: 'e6f', sub: 'f', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return mc(r, 'Which forms make (d), finding ' + t('y') + ' when ' + t('x=' + o.Xd) + ', and (e), finding ' + t('x') + ' when ' + t('y=' + o.Ye) + ', quickest, and why are they not the same form?', [
            { html: '(d): slope–intercept form — ' + t('x') + ' is known and ' + t('y') + ' is already isolated. (e): general form — ' + t('y') + ' is known, leaving a one-step equation in ' + t('x') + ' with no fractions.', right: true },
            { html: '(d): general form; (e): slope–intercept form.', why: 'In (d) you want ' + t('y') + ': the form with ' + t('y') + ' already isolated just needs evaluating.' },
            { html: 'Slope–point form for both, because it uses a table point.', why: 'It works, but it needs extra rearranging either way.' },
            { html: 'It doesn’t matter: every form takes the same work.', why: 'The form depends on which variable you solve <b>for</b>.' }],
            '(d): <b>slope–intercept</b> — ' + t('x') + ' known, ' + t('y') + ' isolated: just evaluate.<br>(e): <b>general</b> — ' + t('y') + ' known; that leaves a one-step equation in ' + t('x') + '. The form depends on the variable you solve for.', ['Which form already has ' + t('y') + ' by itself?'], 'which form for which job (table)');
        } }] },
    /* ---------------- Q7 ---------------- */
    { num: '7',
      shared: function (r) {
        var xr = [-7, 7];
        for (var g = 0; g < 400; g++) {
          var ax = rnz(r, -4, 4), by = rnz(r, -6, 6); if (Math.abs(ax) < 2 || Math.abs(by) < 2 || gcd(ax, by) !== 1) continue;
          var L = line2([ax, 0], [0, by]), m = slopeOf(L), T = [r.int(-3, 3), r.int(-3, 4)]; if (onL(L, T) || T[0] === 0 || T[1] === 0) continue;
          var Lp = lineMP(m, T), Lq = lineMP(perpS(m), T);
          if (lattice(Lp, xr, xr).length < 2 || lattice(Lq, xr, xr).length < 2) continue;
          var intsInt = function (Z) { return Z.A !== 0 && Z.B !== 0 && isInt(xint(Z)) && isInt(yint(Z)); };
          if (intsInt(Lp) || intsInt(Lq)) continue;
          return { L: L, m: m, T: T, Lp: Lp, Lq: Lq, ax: ax, by: by };
        }
        return { L: L3(5, 2, 10), m: Q(-5, 2), T: [2, 3], Lp: L3(5, 2, -16), Lq: L3(2, -5, 11), ax: -2, by: -5 };
      },
      stem: function (o) { return '<b>A family of three lines on one grid.</b> Let ' + t('\\ell') + ' be the line ' + t(gT(o.L)) + '.'; },
      parts: [
        { id: 'e7a', sub: 'a i', level: 'PRG', outcome: 'RF5', make: function (r, o) { return intsP('State both intercepts of ' + t('\\ell') + ' as ordered pairs.', o.L, intSteps(o.L), ['Set ' + t('y=0') + ', then ' + t('x=0') + '.'], 'intercepts of ℓ'); } },
        { id: 'e7a2', sub: 'a ii', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return graphLine('Graph ' + t('\\ell') + ' on the grid.', o.L, [-7, 7], [-7, 7], [{ L: line2([o.by, 0], [0, o.ax]), code: 'graph-int-swap', hint: 'Your intercepts are swapped: set ' + t('y=0') + ' for the ' + t('x') + '-intercept.' }, { L: line2([-o.ax, 0], [0, -o.by]), code: 'graph-int-sign', hint: 'Check the signs of the intercepts.' }],
            'Plot ' + t(ptT([o.ax, 0])) + ' and ' + t(ptT([0, o.by])) + ' and draw the line through them, with arrows.', ['Use the intercepts from (a).'], 'graph ℓ by intercepts');
        } },
        { id: 'e7b', sub: 'b i', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          return lineP('Determine, in general form, the line ' + t('p') + ' through ' + t(ptT(o.T)) + ' <b>parallel</b> to ' + t('\\ell') + '.', o.Lp, { form: 'general', wrong: [{ is: o.Lq, code: 'line-perp-wrong', hint: 'That is the perpendicular line (part c). Parallel: keep the slope ' + t(qT(o.m)) + '.' }] },
            t('m_{\\ell}=' + qT(o.m)) + '; parallel ⟹ same slope.<br>' + psSteps(o.m, o.T), ['Same slope as ' + t('\\ell') + ', through ' + t(ptT(o.T)) + '.'], 'parallel line p');
        } },
        { id: 'e7b2', sub: 'b ii', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var xr = [-7, 7];
          return graphLine('Graph ' + t('p') + ', the line through ' + t(ptT(o.T)) + ' <b>parallel</b> to ' + t('\\ell') + ', on the grid (' + t('\\ell') + ' is shown in grey).', o.Lp, xr, xr, [{ L: o.Lq, code: 'line-perp-wrong', hint: 'That line is perpendicular to ' + t('\\ell') + '. ' + t('p') + ' is parallel: it never meets ' + t('\\ell') + '.' }, { L: lineMP(qn(o.m), o.T), code: 'graph-slope-sign', hint: 'Check the direction: ' + t('p') + ' has the same slope as ' + t('\\ell') + ', ' + t(qT(o.m)) + '.' }],
            'From ' + t(ptT(o.T)) + ', step the slope ' + t(qT(o.m)) + ' (' + Math.abs(o.m[0]) + ' ' + (o.m[0] < 0 ? 'down' : 'up') + ', ' + o.m[1] + ' right).', ['Start at ' + t(ptT(o.T)) + ' and use rise over run.'], 'graph parallel line', { bg: bgLines([o.L], xr, xr) });
        } },
        { id: 'e7c', sub: 'c i', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          var n = perpS(o.m);
          return lineP('Determine, in general form, the line ' + t('q') + ' through ' + t(ptT(o.T)) + ' <b>perpendicular</b> to ' + t('\\ell') + '.', o.Lq, { form: 'general', wrong: [{ is: o.Lp, code: 'line-parallel', hint: 'That is the parallel line ' + t('p') + '. Perpendicular: use the negative reciprocal, ' + t(qT(n)) + '.' }] },
            t('m_{\\perp}=' + qT(n)) + '.<br>' + psSteps(n, o.T), ['Negative reciprocal of ' + t(qT(o.m)) + ', through ' + t(ptT(o.T)) + '.'], 'perpendicular line q');
        } },
        { id: 'e7c2', sub: 'c ii', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var xr = [-7, 7], n = perpS(o.m);
          return graphLine('Graph ' + t('q') + ', the line through ' + t(ptT(o.T)) + ' <b>perpendicular</b> to ' + t('\\ell') + ', on the grid (' + t('\\ell') + ' and ' + t('p') + ' are shown in grey).', o.Lq, xr, xr, [{ L: o.Lp, code: 'line-parallel', hint: 'That line is parallel to ' + t('\\ell') + '. ' + t('q') + ' crosses ' + t('\\ell') + ' at a right angle.' }, { L: lineMP(qn(n), o.T), code: 'graph-slope-sign', hint: 'Check the direction: the slope of ' + t('q') + ' is ' + t(qT(n)) + '.' }],
            'From ' + t(ptT(o.T)) + ', step the slope ' + t(qT(n)) + ' (' + Math.abs(n[0]) + ' ' + (n[0] < 0 ? 'down' : 'up') + ', ' + n[1] + ' right).', ['Start at ' + t(ptT(o.T)) + ' and use rise over run.'], 'graph perpendicular line', { bg: bgLines([o.L, o.Lp], xr, xr) });
        } },
        { id: 'e7d', sub: 'd', level: 'BEG', outcome: 'RF7', make: function (r, o) {
          return ptP('Line ' + t('p') + ' (' + t(gT(o.Lp)) + ') was built in (b) parallel to ' + t('\\ell') + ', and line ' + t('q') + ' (' + t(gT(o.Lq)) + ') in (c) perpendicular to ' + t('\\ell') + ', both through the point ' + t(ptT(o.T)) + '. State the one point ' + t('p') + ' and ' + t('q') + ' have in common, without doing any algebra.', o.T, t(ptT(o.T)) + ': both ' + t('p') + ' and ' + t('q') + ' were built to pass through it, and two lines that are not parallel meet at exactly one point.', ['Both lines were built through the same point.'], 'common point of p and q');
        } },
        { id: 'e7e', sub: 'e', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var A = o.L.A, Bc = o.L.B;
          return mc(r, 'The three general forms are ' + t('\\ell:\\ ' + gT(o.L)) + ', ' + t('p:\\ ' + gT(o.Lp)) + ' (parallel to ' + t('\\ell') + ') and ' + t('q:\\ ' + gT(o.Lq)) + ' (perpendicular to ' + t('\\ell') + '). They share a pattern. Which rule writes a parallel and a perpendicular line straight from the coefficients ' + t('A') + ' and ' + t('B') + ' of ' + t(gT(o.L)) + '?', [
            { html: 'Parallel: keep ' + t('A') + ' and ' + t('B') + ' (' + t(pol([[A, 'x'], [Bc, 'y']])) + '). Perpendicular: swap them and change one sign (' + t(pol([[Bc, 'x'], [-A, 'y']])) + '). Then find ' + t('C') + ' from the point.', right: true },
            { html: 'Parallel: swap ' + t('A') + ' and ' + t('B') + '. Perpendicular: keep them.', why: 'Keeping ' + t('A') + ' and ' + t('B') + ' keeps the slope ' + t('-\\frac{A}{B}') + ' — that is the parallel line.' },
            { html: 'Parallel: keep ' + t('A') + ', ' + t('B') + ' and ' + t('C') + '. Perpendicular: change all the signs.', why: 'Keeping ' + t('C') + ' too gives the same line; changing every sign also gives the same line.' },
            { html: 'Perpendicular: swap ' + t('A') + ' and ' + t('B') + ' (no sign change).', why: 'Swapping alone gives slope ' + t('-\\frac{B}{A}') + ': the reciprocal with the same sign. You also need one sign change.' }],
            'Parallel: <b>keep ' + t('A') + ' and ' + t('B') + '</b>; find the new ' + t('C') + ' by substituting the point.<br>Perpendicular: <b>swap ' + t('A') + ' and ' + t('B') + ' and change one sign</b>, ' + t('Bx-Ay+C=0') + '; then find ' + t('C') + '. (' + t(genLeft(o.Lp).replace(/[+-]\d+$/, '')) + ' for ' + t('p') + '; ' + t(genLeft(o.Lq).replace(/[+-]\d+$/, '')) + ' for ' + t('q') + '.)', ['Compare the ' + t('x') + '- and ' + t('y') + '-coefficients of ' + t('\\ell') + ', ' + t('p') + ' and ' + t('q') + '.'], 'coefficient rule');
        } },
        { id: 'e7f', sub: 'f', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var nice = function (Z) { return Z.A !== 0 && Z.B !== 0 && isInt(xint(Z)) && isInt(yint(Z)); }, want = { l: nice(o.L) ? 'int' : 'step', p: nice(o.Lp) ? 'int' : 'step', q: nice(o.Lq) ? 'int' : 'step' };
          var desc = function (Z) { return t(ptT([xint(Z), 0])) + ', ' + t(ptT([0, yint(Z)])); };
          return B.grid('The lines are ' + t('\\ell:\\ ' + gT(o.L)) + ', ' + t('p:\\ ' + gT(o.Lp)) + ' and ' + t('q:\\ ' + gT(o.Lq)) + ' (' + t('p') + ' and ' + t('q') + ' both pass through ' + t(ptT(o.T)) + '). For which line is the two-intercept strategy the clean one, and for which would you rather step the slope from a known point?', [{ id: 'l', html: t('\\ell') }, { id: 'p', html: t('p') }, { id: 'q', html: t('q') }], [{ id: 'int', html: 'two intercepts' }, { id: 'step', html: 'step the slope from a point' }], want,
            { why: function (row) { var Z = row === 'l' ? o.L : row === 'p' ? o.Lp : o.Lq; return { code: 'row', hint: 'Work out the intercepts of ' + t(row === 'l' ? '\\ell' : row) + ': ' + desc(Z) + '. Whole numbers make the intercepts clean; fractions don’t.' }; } },
            t('\\ell') + ': ' + desc(o.L) + ' — whole numbers: <b>two intercepts</b>.<br>' + t('p') + ': ' + desc(o.Lp) + '; ' + t('q') + ': ' + desc(o.Lq) + ' — fractions, so <b>step the slope</b> from ' + t(ptT(o.T)) + '.', ['Find each line’s intercepts: are they whole numbers?'], 'choose graphing strategy');
        } }] },
    /* ---------------- Q8 ---------------- */
    { num: '8',
      shared: function (r) {
        var a, c, d, b, g = 0;
        do { var xi = rnz(r, -8, 8), yi = rnz(r, -8, 8); a = line2([xi, 0], [0, yi]); g++; } while ((Math.abs(xi) < 2 || Math.abs(yi) < 2 || Math.abs(xi) === Math.abs(yi) || a.A === 1 || a.B === 1 || a.B === -1) && g < 100);
        g = 0; do { var A = r.int(2, 9), Bc = r.int(2, 9) * (r.chance(0.6) ? -1 : 1), C = rnz(r, -11, 11); c = L3(A, Bc, C); g++; } while ((c.C % c.A === 0 || c.C % c.B === 0 || gcd(A, Math.abs(Bc)) !== 1 || c.A !== A) && g < 200);
        var m = sl(r, [[1, 2], [1, 3], [2, 3], [3, 4], [1, 4]]), bb = r.pick([0, 0, rnz(r, -4, 4)]), x1 = m[1] * rnz(r, -3, 3), y1 = qv(qa(qm(m, x1), bb));
        b = { m: m, b: bb, p: [x1, y1], L: lineMB(m, bb) };
        g = 0; do { var a6 = r.int(2, 8), c6 = rnz(r, -15, 15); d = L3(a6, 0, c6); g++; } while ((isInt(Q(-c6, a6)) || d.A !== a6) && g < 100);
        return { a: a, b: b, c: c, d: d };
      },
      stem: function (o) { return 'For each equation, name the hand-graphing strategy you would use. <b>Do not graph anything.</b><br>(a) ' + t(gT(o.a)) + ' &nbsp; (b) ' + t(pT(o.b.L, o.b.p)) + ' &nbsp; (c) ' + t(gT(o.c)) + ' &nbsp; (d) ' + t(gT(o.d)); },
      parts: [
        { id: 'e8', sub: 'a–d', level: 'PRG', outcome: 'RF6', make: function (r, o) {
          var cols = [{ id: 'si', html: 'slope & ' + t('y') + '-int.' }, { id: 'int', html: 'two intercepts' }, { id: 'tab', html: 'table of values' }, { id: 'v', html: 'vertical: just rule it' }];
          var ev = { a: t(o.a.A) + ' and ' + t(Math.abs(o.a.B)) + ' both divide ' + t(Math.abs(o.a.C)) + ', so both intercepts are whole numbers.', b: 'expanding gives ' + t(sT(o.b.L)) + ': the slope and ' + t('y') + '-intercept are read straight off.', c: 'neither ' + t(o.c.A) + ' nor ' + t(Math.abs(o.c.B)) + ' divides ' + t(Math.abs(o.c.C)) + ', so both intercepts are fractions.', d: t('B=0') + ': ' + t('x=' + qT(Q(-o.d.C, o.d.A))) + ' is a vertical line.' };
          return B.grid('Choose the strategy for each equation (a)–(d) above.', [{ id: 'a', html: '(a)' }, { id: 'b', html: '(b)' }, { id: 'c', html: '(c)' }, { id: 'd', html: '(d)' }], cols, { a: 'int', b: 'si', c: 'tab', d: 'v' },
            { why: function (row) { return { code: 'row', hint: 'Look again at (' + row + '): ' + ev[row] }; } },
            ['a', 'b', 'c', 'd'].map(function (k) { return '(' + k + ') ' + ev[k]; }).join('<br>'), ['For general form, check whether ' + t('A') + ' and ' + t('B') + ' divide ' + t('C') + '. For slope–point form, expand it.'], 'strategy for each form');
        } },
        { id: 'e8p', sub: 'a, points', level: 'EMG', outcome: 'RF5', make: function (r, o) { return intsP('For (a), state the two points you would plot.', o.a, intSteps(o.a), ['The two intercepts.'], 'intercepts to plot'); } },
        { id: 'e8e', sub: 'e', level: 'PRG', outcome: 'RF6', make: function (r, o) {
          return mc(r, '(a) and (c) are both in general form with an ' + t('x') + '-term and a ' + t('y') + '-term, but they do not take the same strategy. Which one test on ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' separates them?', [
            { html: 'Do ' + t('A') + ' and ' + t('B') + ' both divide ' + t('C') + '?', right: true },
            { html: 'Is ' + t('A') + ' bigger than ' + t('B') + '?', why: 'The size of ' + t('A') + ' doesn’t decide whether the intercepts ' + t('-\\frac{C}{A}') + ' and ' + t('-\\frac{C}{B}') + ' are whole numbers.' },
            { html: 'Is ' + t('C') + ' positive?', why: 'The sign of ' + t('C') + ' only moves the intercepts to the other side; they can still be fractions.' },
            { html: 'Is ' + t('B') + ' negative?', why: 'The sign of ' + t('B') + ' decides whether the line rises or falls, not whether the intercepts are clean.' }],
            'The intercepts are ' + t('-\\frac{C}{A}') + ' and ' + t('-\\frac{C}{B}') + ', so the test is <b>do ' + t('A') + ' and ' + t('B') + ' both divide ' + t('C') + '?</b> In (a) they do (two intercepts); in (c) they don’t (table of values).', ['What are the intercepts of ' + t('Ax+By+C=0') + ' in terms of ' + t('A') + ', ' + t('B') + ', ' + t('C') + '?'], 'divisibility test');
        } }] },
    /* ---------------- Part D — Q9 ---------------- */
    { num: '9', section: 'Extra practice D — Slope in context',
      shared: function (r) {
        for (var g = 0; g < 300; g++) {
          var Y0 = r.pick([1980, 1985, 1990]), t1 = 5 * r.int(1, 2), t2 = t1 + 5 * r.int(3, 5), m = r.int(15, 60), b = 5 * r.int(3, 20);
          var tp = 5 * r.int(8, 10), T = r.pick([2, 3]) * 1000, te = (T - b) / m;
          if (Math.abs(te - Math.round(te)) > 0.45 || Math.abs(te - Math.floor(te) - 0.5) < 0.06 || te < t2 + 3 || Y0 + tp > 2060) continue;
          return { Y0: Y0, t1: t1, t2: t2, m: m, b: b, D1: m * t1 + b, D2: m * t2 + b, tp: tp, T: T, te: te };
        }
        return { Y0: 1990, t1: 5, t2: 25, m: 41, b: 35, D1: 240, D2: 1060, tp: 40, T: 2000, te: 1965 / 41 };
      },
      stem: function (o) { return 'A glacier’s terminus is surveyed from a fixed rock marker on the valley floor. In ' + t(o.Y0 + o.t1) + ' the terminus stood ' + t(F(o.D1)) + ' m from the marker; in ' + t(o.Y0 + o.t2) + ' it stood ' + t(F(o.D2)) + ' m from it. Let ' + t('t') + ' be the number of years since ' + t(o.Y0) + ' and ' + t('D') + ' the distance from the marker in metres.'; },
      parts: [
        { id: 'e9a', sub: 'a i', level: 'BEG', outcome: 'RF4', make: function (r, o) {
          return B.pairs('Write the two surveys as ordered pairs ' + t('(t,\\ D)') + '.', [[o.t1, o.D1], [o.t2, o.D2]], {}, t(o.Y0 + o.t1) + ': ' + t('t=' + o.t1) + '; ' + t(o.Y0 + o.t2) + ': ' + t('t=' + o.t2) + '. So ' + t('(' + o.t1 + ',\\ ' + F(o.D1) + ')') + ' and ' + t('(' + o.t2 + ',\\ ' + F(o.D2) + ')') + '.', ['' + t('t') + ' counts years since ' + t(o.Y0) + ', not the year itself.'], 'context → ordered pairs');
        } },
        { id: 'e9a2', sub: 'a ii', level: 'EMG', outcome: 'RF5', make: function (r, o) {
          return B.number('Determine the rate of change (the terminus moves this many metres farther from the marker each year).', o.m, function (v) { if (Math.abs(v - 1 / o.m) < 1e-6) return { code: 'rate-units', hint: 'Rate = change in distance ÷ change in time (metres per year).' }; if (v === o.D2 - o.D1) return { code: 'rate-step', hint: 'That is the change over ' + t(o.t2 - o.t1) + ' years. Divide by ' + t(o.t2 - o.t1) + '.' }; return null; },
            t('m=\\frac{' + F(o.D2) + '-' + F(o.D1) + '}{' + o.t2 + '-' + o.t1 + '}=\\frac{' + F(o.D2 - o.D1) + '}{' + (o.t2 - o.t1) + '}=' + o.m) + ': the terminus moves ' + t(o.m) + ' m farther from the marker each year.', ['Change in ' + t('D') + ' ÷ change in ' + t('t') + '.'], 'rate from two surveys', { after: 'm per year' });
        } },
        { id: 'e9b', sub: 'b i', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          return lineP('Use slope–point form to build the model, then write it as ' + t('D=mt+b') + '.', { m: o.m, b: o.b }, { vars: ['t', 'D'], form: 'slope-intercept', keyTex: 'D=' + o.m + 't+' + o.b, wrong: [{ is: { m: o.m, b: o.D1 }, code: 'diag', hint: t(F(o.D1)) + ' is the distance when ' + t('t=' + o.t1) + ', not when ' + t('t=0') + '. Use slope–point form with ' + t('(' + o.t1 + ',\\ ' + F(o.D1) + ')') + '.' }] },
            t('D-' + F(o.D1) + '=' + o.m + '(t-' + o.t1 + ')') + ' ⟹ ' + t('D-' + F(o.D1) + '=' + o.m + 't-' + F(o.m * o.t1)) + ' ⟹ ' + t('D=' + o.m + 't+' + o.b), ['Slope–point form with one survey, then solve for ' + t('D') + '.'], 'model from two data points');
        } },
        { id: 'e9b2', sub: 'b ii', level: 'PRG', outcome: 'RF5', make: function (r, o) {
          return mc(r, 'Interpret ' + t('b=' + o.b) + ' in a sentence carrying units.', [
            { html: 'In ' + t(o.Y0) + ' the terminus stood ' + t(o.b) + ' m from the marker.', right: true },
            { html: 'The terminus moves ' + t(o.b) + ' m every year.', why: 'The yearly change is the slope, ' + t(o.m) + ' m per year.' },
            { html: 'In ' + t(o.Y0 + o.t1) + ' the terminus stood ' + t(o.b) + ' m from the marker.', why: t('b') + ' is the value at ' + t('t=0') + ', which is the year ' + t(o.Y0) + '.' },
            { html: 'The survey took ' + t(o.b) + ' years.', why: t('b') + ' is a distance (it has the units of ' + t('D') + ').' }],
            t('b') + ' is ' + t('D') + ' when ' + t('t=0') + ': in ' + t(o.Y0) + ' the terminus stood ' + t(o.b) + ' m from the marker.', ['What year is ' + t('t=0') + '?'], 'interpret b (glacier)');
        } },
        { id: 'e9c', sub: 'c', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var L = lineMB(Q(o.m), Q(o.b));
          return lineP('Write the model in general form, using ' + t('t') + ' for ' + t('x') + ' and ' + t('D') + ' for ' + t('y') + '.', L, { vars: ['t', 'D'], form: 'general' }, t('D=' + o.m + 't+' + o.b) + ' ⟹ ' + t('0=' + o.m + 't-D+' + o.b) + ' ⟹ ' + t(gT(L, ['t', 'D'])) + ' (' + t('A=' + o.m + '>0') + ', integer coefficients ✓)', ['Move ' + t('D') + ' to the side with the ' + t('t') + '-term so that ' + t('A') + ' is positive.'], 'general form in context');
        } },
        { id: 'e9d', sub: 'd', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          var D = o.m * o.tp + o.b;
          return B.number('Predict the distance in ' + t(o.Y0 + o.tp) + '.', D, function (v) { return v === o.m * (o.Y0 + o.tp) + o.b ? { code: 'year-t', hint: 'Use ' + t('t') + ' = years since ' + t(o.Y0) + ': ' + t('t=' + o.tp) + '.' } : null; },
            t(o.Y0 + o.tp) + ': ' + t('t=' + o.tp) + '. ' + t('D=' + o.m + '(' + o.tp + ')+' + o.b + '=' + F(D)) + ' m', ['Convert the year to ' + t('t') + ' first.'], 'predict (glacier)', { after: 'm' });
        } },
        { id: 'e9e', sub: 'e', level: 'PRG', outcome: 'RF4', make: function (r, o) {
          var tt = Math.round(o.te), Y = o.Y0 + tt, part;
          part = B.number('In which year does the model predict the terminus passes ' + t(o.T / 1000) + ' km from the marker? Answer to the nearest year.', Y, function (v) { if (v === tt) return { code: 'year-t', hint: 'That is ' + t('t') + ', the number of years since ' + t(o.Y0) + '. Add ' + t(o.Y0) + ' to get the year.' }; if (Math.abs(v - (o.Y0 + Math.round((o.T / 1000 - o.b) / o.m))) < 0.5) return { code: 'unit-conv', hint: t(o.T / 1000) + ' km is ' + t(F(o.T)) + ' m: the model is in metres.' }; return null; },
            t(o.T / 1000 + '\\text{ km}=' + F(o.T) + '\\text{ m}') + '. ' + t(o.m + 't+' + o.b + '=' + F(o.T)) + ' ⟹ ' + t(o.m + 't=' + F(o.T - o.b)) + ' ⟹ ' + t('t=' + dec(Math.floor(o.te * 1000) / 1000) + '\\ldots\\approx ' + tt) + '. ' + t(o.Y0 + '+' + tt + '=' + Y), ['Change km to metres, solve for ' + t('t') + ', then add ' + t(o.Y0) + '.'], 'solve for year (glacier)');
          part.answer = t(String(Y)); return part;
        } },
        { id: 'e9f', sub: 'f', level: 'EMG', outcome: 'RF5', make: function (r, o) {
          var k = o.m / 10;
          return B.number('Restate the rate in <b>kilometres per century</b>. (Is the glacier retreating any faster in this new wording?)', k, function (v) { if (Math.abs(v - o.m * 100) < 1e-6) return { code: 'unit-conv', hint: 'That is metres per century. Divide by ' + t(F(1000)) + ' to get kilometres.' }; if (Math.abs(v - o.m / 1000) < 1e-9) return { code: 'unit-conv', hint: 'That is kilometres per <b>year</b>. A century is 100 years.' }; return null; },
            t(o.m + '\\text{ m/year}\\times 100=' + F(o.m * 100) + '\\text{ m per century}=' + k + '\\text{ km per century}') + '. <b>No</b> — same glacier, same motion; only the units (and so the number) changed.', ['Multiply by 100 years, then divide by 1000 m per km.'], 'unit conversion of a rate', { after: 'km per century' });
        } },
        { id: 'e9g', sub: 'g', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return mc(r, 'Parts (d), predicting the distance in ' + t(o.Y0 + o.tp) + ', and (e), finding the year the terminus passes ' + t(o.T / 1000) + ' km, run the same model in opposite directions. Which describes them?', [
            { html: '(d) substitutes a ' + t('t') + '-value and <b>evaluates</b>; (e) substitutes a ' + t('D') + '-value and <b>solves</b>. ' + t('D=mt+b') + ' is quickest for (d).', right: true },
            { html: '(d) solves for ' + t('t') + '; (e) evaluates ' + t('D') + '.', why: 'In (d) the year (so ' + t('t') + ') is given and you want ' + t('D') + ': that is evaluating.' },
            { html: 'Both just evaluate the model.', why: 'In (e) you know ' + t('D') + ' and must undo the operations to find ' + t('t') + ': solving.' },
            { html: 'Both need general form.', why: 'For (d) the form with ' + t('D') + ' already isolated is quickest.' }],
            '(d) substitutes a ' + t('t') + '-value and <b>evaluates</b> (multiply, then add) — quickest from ' + t('D=' + o.m + 't+' + o.b) + '.<br>(e) substitutes a ' + t('D') + '-value and <b>solves</b> (subtract, then divide).', ['Which part gives you ' + t('t') + ', and which gives you ' + t('D') + '?'], 'evaluate vs solve');
        } }] },
    /* ---------------- Q10 ---------------- */
    { num: '10',
      shared: function (r) {
        for (var g = 0; g < 300; g++) {
          var r1 = r.int(6, 12), b = 10 * r.int(2, 5), t1 = 10, t2 = 40, d1 = r1 * t1 + b, d2 = r1 * t2 + b; if (d2 > 500 || r1 * 50 + b > 560) continue;
          var r2 = (2 * r.int(5, 2 * r1 - 3) + 1) / 2; if (r2 >= r1 || r2 < 4) continue;
          var T1 = 5 * r.int(12, 18), T2 = 5 * r.int(10, 14), Dq = r1 * T2 + b, Dt = 100 * r.int(6, 8), ta = (Dt - b) / r1, tb = (Dt - b) / r2;
          if (Math.abs((tb - ta) * 10 - Math.floor((tb - ta) * 10) - 0.5) < 1e-6) continue;
          return { r1: r1, b: b, t1: t1, t2: t2, d1: d1, d2: d2, r2: r2, T1: T1, T2: T2, Dq: Dq, Dt: Dt, ta: ta, tb: tb };
        }
        return { r1: 9, b: 30, t1: 10, t2: 40, d1: 120, d2: 390, r2: 7.5, T1: 75, T2: 60, Dq: 570, Dt: 600, ta: 570 / 9, tb: 76 };
      },
      stem: function (o) {
        return 'The graph shows the depth ' + t('d') + ' below the surface, in metres, of a hoist cage descending a mine shaft, against the time ' + t('t') + ' in seconds since the descent began. <b>Read the tick numbers carefully — the two axes are not on the same scale.</b>' +
          HW.graph({ x: [0, 50], y: [0, 500], grid: 5, gridY: 50, labelsX: 10, labelsY: 50, unitX: 6, unitY: 0.6, firstQuadrant: true, xName: 't', yName: 'd', xTitle: 'Time, t (s)', yTitle: 'Depth, d (m)', max: 360,
            segs: [{ pts: [[0, o.b], [Math.min(50, (500 - o.b) / o.r1), o.b + o.r1 * Math.min(50, (500 - o.b) / o.r1)]], start: 'none', end: 'none' }], points: [{ x: o.t1, y: o.d1, label: '(' + o.t1 + ', ' + o.d1 + ')' }, { x: o.t2, y: o.d2, label: '(' + o.t2 + ', ' + o.d2 + ')' }] });
      },
      parts: [
        { id: 'e10a', sub: 'a', level: 'EMG', outcome: 'RF5', make: function (r, o) {
          return B.number('Determine the rate of change from the two marked points.', o.r1, function (v) { if (Math.abs(v - 1 / o.r1) < 1e-6) return { code: 'rate-units', hint: 'Rise over run: change in depth ÷ change in time.' }; if (Math.abs(v - o.d2 / o.t2) < 1e-6 || Math.abs(v - o.d1 / o.t1) < 1e-6) return { code: 'diag', hint: 'Depth ÷ time for one point includes the starting depth. Use the change between the two points.' }; return null; },
            t('m=\\frac{' + o.d2 + '-' + o.d1 + '}{' + o.t2 + '-' + o.t1 + '}=\\frac{' + (o.d2 - o.d1) + '}{' + (o.t2 - o.t1) + '}=' + o.r1) + ': the cage descends ' + t(o.r1) + ' metres every second.', ['Use the two labelled points.'], 'rate from scaled graph', { after: 'm/s' });
        } },
        { id: 'e10b', sub: 'b i', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          return lineP('Write the model as ' + t('d=mt+b') + '.', { m: o.r1, b: o.b }, { vars: ['t', 'd'], form: 'slope-intercept', keyTex: 'd=' + o.r1 + 't+' + o.b }, t(o.d1 + '=' + o.r1 + '(' + o.t1 + ')+b') + ', so ' + t('b=' + o.b) + ': ' + t('d=' + o.r1 + 't+' + o.b), ['Substitute one marked point and the rate into ' + t('d=mt+b') + '.'], 'model from graph (mine)');
        } },
        { id: 'e10b2', sub: 'b ii', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var L = lineMB(Q(o.r1), Q(o.b));
          return lineP('Write the model in general form.', L, { vars: ['t', 'd'], form: 'general' }, t(gT(L, ['t', 'd'])), ['Move ' + t('d') + ' across so the ' + t('t') + '-term stays positive.'], 'general form (mine)');
        } },
        { id: 'e10b3', sub: 'b iii', level: 'PRG', outcome: 'RF5', make: function (r, o) {
          return mc(r, 'Interpret the ' + t('d') + '-intercept, ' + t('(0,\\ ' + o.b + ')') + ', in context.', [
            { html: 'When timing began, the cage was already ' + t(o.b) + ' m below the surface.', right: true },
            { html: 'The cage descends ' + t(o.b) + ' m every second.', why: 'The rate is the slope, ' + t(o.r1) + ' m/s.' },
            { html: 'The cage reaches the bottom after ' + t(o.b) + ' s.', why: 'The ' + t('d') + '-intercept is a depth at ' + t('t=0') + ', not a time.' },
            { html: 'The shaft is ' + t(o.b) + ' m deep.', why: 'The cage keeps going deeper after ' + t('t=0') + '; ' + t(o.b) + ' m is where it starts.' }],
            t('(0,\\ ' + o.b + ')') + ': when timing began the cage was already ' + t(o.b) + ' m below the surface.', ['What is ' + t('t') + ' at the ' + t('d') + '-intercept?'], 'interpret intercept (mine)');
        } },
        { id: 'e10c', sub: 'c', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          var D1 = o.r1 * o.T1 + o.b;
          return B.fields('How deep is the cage after ' + t(o.T1) + ' s? At what time does it reach ' + t(o.Dq) + ' m?', [{ label: 'depth', after: 'm' }, { label: 'time', after: 's' }], [K.number(D1), K.number(o.T2)], [String(D1), String(o.T2)], t(D1) + ' m; ' + t(o.T2) + ' s',
            t('t=' + o.T1) + ': ' + t('d=' + o.r1 + '(' + o.T1 + ')+' + o.b + '=' + D1) + ' m<br>' + t('d=' + o.Dq) + ': ' + t(o.r1 + 't+' + o.b + '=' + o.Dq) + ', ' + t(o.r1 + 't=' + (o.Dq - o.b)) + ', ' + t('t=' + o.T2) + ' s', ['Evaluate for the first; solve for the second.'], 'evaluate and solve (mine)');
        } },
        { id: 'e10d', sub: 'd', level: 'PRG', outcome: 'RF6', make: function (r, o) {
          var A = 2 * o.r2, C = 2 * o.b;
          return B.fields('A second shaft’s cage is modelled by ' + t(A + 't-2d+' + C + '=0') + '. State its rate and its starting depth.', [{ label: 'rate', after: 'm/s' }, { label: 'starting depth', after: 'm' }],
            [K.number(o.r2, function (v) { return v === A ? { code: 'diag', hint: t(A) + ' is the coefficient of ' + t('t') + ', not the rate. Solve for ' + t('d') + ' first: divide by ' + t('2') + '.' } : null; }), K.number(o.b, function (v) { return v === C ? { code: 'diag', hint: 'Solve for ' + t('d') + ': divide every term by ' + t('2') + '.' } : null; })], [String(o.r2), String(o.b)], t(o.r2) + ' m/s; ' + t(o.b) + ' m',
            t(A + 't-2d+' + C + '=0') + ' ⟹ ' + t('2d=' + A + 't+' + C) + ' ⟹ ' + t('d=' + o.r2 + 't+' + o.b) + '. Rate ' + t(o.r2) + ' m/s down; starting depth ' + t(o.b) + ' m.', ['Solve the equation for ' + t('d') + '.'], 'rate from general form (mine)');
        } },
        { id: 'e10e', sub: 'e i', level: 'EMG', outcome: 'RF5', make: function (r, o) {
          return mc(r, 'The first cage follows the graph; the second is modelled by ' + t(2 * o.r2 + 't-2d+' + 2 * o.b + '=0') + ' (from (d)). Which cage descends faster, and which reaches ' + t(o.Dt) + ' m first?', [
            { html: 'The first cage is faster and reaches ' + t(o.Dt) + ' m first.', right: true },
            { html: 'The second cage is faster and reaches ' + t(o.Dt) + ' m first.', why: 'Compare the rates, not the coefficients: ' + t(o.r1) + ' m/s against ' + t(o.r2) + ' m/s.' },
            { html: 'The first cage is faster, but the second reaches ' + t(o.Dt) + ' m first.', why: 'They start at the same depth, so the faster cage gets there first.' },
            { html: 'They are equally fast.', why: t(o.r1) + ' m/s and ' + t(o.r2) + ' m/s are different rates.' }],
            'Rates: ' + t(o.r1) + ' m/s and ' + t(o.r2) + ' m/s, and both start at ' + t(o.b) + ' m, so the <b>first</b> cage is faster and gets to ' + t(o.Dt) + ' m first.', ['Compare the rates from (a) and (d).'], 'compare two models');
        } },
        { id: 'e10e2', sub: 'e ii', level: 'PRG', outcome: 'RF4', make: function (r, o) {
          var dr = o.r1 - o.r2, dt = o.tb - o.ta;
          return B.fields('The first cage follows the graph; the second is modelled by ' + t(2 * o.r2 + 't-2d+' + 2 * o.b + '=0') + ' (from (d)). By how much is the faster cage faster? By how many seconds (to the nearest tenth) does it reach ' + t(o.Dt) + ' m sooner?', [{ label: 'faster by', after: 'm/s' }, { label: 'sooner by', after: 's' }], [K.number(dr), K.approx(dt, 1)], [String(dr), K.roundTo(dt, 1).toFixed(1)], t(dr) + ' m/s; ' + t(K.roundTo(dt, 1).toFixed(1)) + ' s',
            'Faster by ' + t(o.r1 + '-' + o.r2 + '=' + dr) + ' m/s.<br>First: ' + t(o.r1 + 't+' + o.b + '=' + o.Dt) + ', ' + t('t=\\frac{' + (o.Dt - o.b) + '}{' + o.r1 + '}\\approx ' + dec(Math.round(o.ta * 100) / 100)) + ' s<br>Second: ' + t(o.r2 + 't+' + o.b + '=' + o.Dt) + ', ' + t('t=\\frac{' + (o.Dt - o.b) + '}{' + o.r2 + '}\\approx ' + dec(Math.round(o.tb * 100) / 100)) + ' s<br>Sooner by about ' + t(K.roundTo(dt, 1).toFixed(1)) + ' s.',
            ['Solve each model for ' + t('t') + ' when ' + t('d=' + o.Dt) + ', then subtract.'], 'compare times (mine)');
        } },
        { id: 'e10f', sub: 'f', level: 'PRG', outcome: 'RF6', make: function (r, o) {
          var A = 2 * o.r2;
          return mc(r, 'The two cages are modelled by ' + t('d=' + o.r1 + 't+' + o.b) + ' and ' + t(A + 't-2d+' + 2 * o.b + '=0') + '. A student compares the numbers ' + t(o.r1) + ' and ' + t(A) + ' straight off the two equations and concludes the second cage is faster. What is the mistake?', [
            { html: t(A) + ' is not the rate: the second equation had to be solved for ' + t('d') + ' (slope ' + t('-\\frac{A}{B}=' + o.r2) + ') before comparing.', right: true },
            { html: 'The student should have compared the starting depths instead.', why: 'Speed is the rate of change; the starting depth doesn’t tell you how fast a cage moves.' },
            { html: 'Nothing — the larger coefficient always means faster.', why: 'In ' + t(A + 't-2d+' + 2 * o.b + '=0') + ' the ' + t('d') + '-coefficient is ' + t('-2') + ', so the rate is ' + t(A) + ' ÷ ' + t('2') + '.' },
            { html: 'The student should have added the coefficients.', why: 'The rate is ' + t('-\\frac{A}{B}') + ', a quotient, not a sum.' }],
            'The ' + t(A) + ' is not the rate: the second equation had to be <b>solved for ' + t('d') + '</b> (or its slope computed as ' + t('-\\frac{A}{B}=-\\frac{' + A + '}{-2}=' + o.r2) + ') first — and ' + t(o.r2 + '<' + o.r1) + ', so the first cage is faster.', ['What is the slope of ' + t('At+Bd+C=0') + '?'], 'error: coefficient vs rate');
        } }] },
    /* ---------------- Part E — Q11 ---------------- */
    { num: '11', section: 'Extra practice E — Reasoning and error analysis', stem: 'Decide whether each claim is <b>true</b> or <b>false</b>.', parts: [
      { id: 'e11a', sub: 'a', level: 'EMG', outcome: 'RF7', make: function (r) {
        if (r.chance(0.4)) return B.tf(r, '“Parallel lines have the same slope.”', true, 'Parallel lines rise and run the same way, so they share a slope (they differ only in their ' + t('y') + '-intercepts).',
          '<b>True.</b> Parallel lines have equal slopes and different ' + t('y') + '-intercepts.', ['What does “parallel” say about steepness?'], 'TF parallel same slope');
        var m = rnz(r, -5, 5), b1 = rnz(r, -6, 6), b2; do { b2 = rnz(r, -9, 9); } while (b2 === b1);
        return B.tf(r, '“Parallel lines have the same equation.”', false, 'Parallel lines share a <b>slope</b>; with the same equation they would be one line. ' + t('y=' + pol([[m, 'x'], [b1, '']])) + ' and ' + t('y=' + pol([[m, 'x'], [b2, '']])) + ' are parallel with different equations.',
          '<b>False.</b> Parallel lines share a slope, not an equation: ' + t('y=' + pol([[m, 'x'], [b1, '']])) + ' and ' + t('y=' + pol([[m, 'x'], [b2, '']])) + ' are parallel.', ['If two lines had the same equation, how many lines would there be?'], 'TF parallel same equation');
      } },
      { id: 'e11b', sub: 'b', level: 'EMG', outcome: 'RF6', make: function (r) {
        if (r.chance(0.4)) return B.tf(r, '“A line with an undefined slope is vertical.”', true, 'Undefined slope means the run is ' + t('0') + ': every point has the same ' + t('x') + ', so the line is vertical, ' + t('x=k') + '.',
          '<b>True.</b> Run ' + t('0') + ' means a vertical line ' + t('x=k') + '.', ['What is the run between two points on a vertical line?'], 'TF undefined slope vertical');
        var a = rnz(r, -8, 8);
        return B.tf(r, '“A line with an undefined slope has no equation.”', false, 'An undefined slope means a vertical line, ' + t('x=' + a) + ' for example (general form ' + t(gT(L3(1, 0, -a))) + '). It just has no equation of the <b>form</b> ' + t('y=mx+b') + '.',
          '<b>False.</b> Undefined slope means a vertical line, e.g. ' + t('x=' + a) + '. It has no equation of the form ' + t('y=mx+b') + ', but it does have an equation.', ['Think of a vertical line. Can you write its equation?'], 'TF undefined slope no equation');
      } },
      { id: 'e11c', sub: 'c', level: 'EMG', outcome: 'RF5', make: function (r) {
        if (r.chance(0.4)) return B.tf(r, '“In ' + t('Ax+By+C=0') + ' with ' + t('A\\ne 0') + ', the ' + t('x') + '-intercept is ' + t('-\\frac{C}{A}') + '.”', true, 'Set ' + t('y=0') + ': ' + t('Ax+C=0') + ', so ' + t('x=-\\frac{C}{A}') + '.',
          '<b>True.</b> With ' + t('y=0') + ', ' + t('Ax+C=0') + ' gives ' + t('x=-\\frac{C}{A}') + '.', ['Substitute ' + t('y=0') + '.'], 'TF x-intercept -C/A');
        var L = r.pick([L3(3, 4, -24), L3(2, 5, -20), L3(4, 3, -24), L3(5, 2, -20), L3(3, 2, -12)]);
        return B.tf(r, '“In ' + t('Ax+By+C=0') + ', ' + t('A') + ' is the ' + t('x') + '-intercept and ' + t('B') + ' is the ' + t('y') + '-intercept.”', false, 'The intercepts are ' + t('\\left(-\\frac{C}{A},\\ 0\\right)') + ' and ' + t('\\left(0,\\ -\\frac{C}{B}\\right)') + ', so ' + t('C') + ' matters. ' + t(gT(L)) + ' has intercepts ' + t(ptT([xint(L), 0])) + ' and ' + t(ptT([0, yint(L)])) + ', not ' + t(L.A) + ' and ' + t(L.B) + '.',
          '<b>False.</b> The intercepts are ' + t('-\\frac{C}{A}') + ' and ' + t('-\\frac{C}{B}') + '. E.g. ' + t(gT(L)) + ' has intercepts ' + t(ptT([xint(L), 0])) + ' and ' + t(ptT([0, yint(L)])) + '.', ['Find the intercepts of a specific example.'], 'TF A and B are intercepts');
      } },
      { id: 'e11d', sub: 'd', level: 'EMG', outcome: 'RF6', make: function (r) {
        if (r.chance(0.4)) return B.tf(r, '“Every line can be written in general form ' + t('Ax+By+C=0') + '.”', true, 'General form allows ' + t('B=0') + ', so vertical lines fit too (' + t('x-k=0') + '). Every other line fits as well.',
          '<b>True.</b> General form covers every line, vertical lines included (' + t('B=0') + ').', ['Can you write ' + t('x=3') + ' in general form?'], 'TF every line general form');
        var a = rnz(r, -8, 8);
        return B.tf(r, '“Every line can be written in the form ' + t('y=mx+b') + '.”', false, 'A vertical line such as ' + t('x=' + a) + ' has an undefined slope, so no ' + t('m') + ' works. Every line <i>can</i> be written in general form, which allows ' + t('B=0') + '.',
          '<b>False.</b> A vertical line ' + t('x=' + a) + ' has undefined slope. Corrected: every line can be written in <b>general form</b>.', ['Is there a line with no numerical slope?'], 'TF every line y=mx+b');
      } },
      { id: 'e11e', sub: 'e', level: 'EMG', outcome: 'RF7', make: function (r) {
        if (r.chance(0.4)) return B.tf(r, '“If the slopes of two lines are negative reciprocals, the lines are perpendicular.”', true, 'Negative reciprocals multiply to ' + t('-1') + ', which is the condition for perpendicular lines.',
          '<b>True.</b> Slopes with product ' + t('-1') + ' give perpendicular lines.', ['Multiply ' + t('\\frac{2}{3}') + ' by ' + t('-\\frac{3}{2}') + '.'], 'TF negative reciprocal slopes');
        var pq = r.pick([[3, 2], [4, 3], [5, 2], [2, 5], [3, 4]]);
        return B.tf(r, '“If the slopes of two lines are reciprocals, the lines are perpendicular.”', false, 'They must be <b>negative</b> reciprocals (product ' + t('-1') + '). ' + t('\\frac{' + pq[0] + '}{' + pq[1] + '}') + ' and ' + t('\\frac{' + pq[1] + '}{' + pq[0] + '}') + ' are reciprocals with product ' + t('1') + '; those lines are not perpendicular.',
          '<b>False.</b> Perpendicular slopes are <b>negative</b> reciprocals: ' + t('\\frac{' + pq[0] + '}{' + pq[1] + '}\\times\\frac{' + pq[1] + '}{' + pq[0] + '}=1\\ne -1') + '.', ['Multiply two reciprocals. Is the product ' + t('-1') + '?'], 'TF reciprocal slopes');
      } },
      { id: 'e11f', sub: 'f', level: 'EMG', outcome: 'RF6', make: function (r) {
        var A = r.int(2, 6), Bc = rnz(r, -5, 5), C = rnz(r, -9, 9), L = L3(A, Bc, C), k = r.pick([-2, 2, -3, 3]), same = r.chance(0.65);
        var C2 = same ? k * L.C : k * L.C + r.pick([-4, -2, 2, 4, 5]) * Math.sign(k);
        var eq2 = pol([[k * L.A, 'x'], [k * L.B, 'y'], [C2, '']]) + '=0';
        return B.tf(r, '“' + t(gT(L)) + ' and ' + t(eq2) + ' are parallel lines.”', !same, same ? t(eq2) + ' is ' + t(k) + ' times ' + t(gT(L)) + ', so the two equations describe <b>the same line</b>, not two parallel lines.' : 'Same slope (' + t(qT(slopeOf(L))) + ') but different ' + t('y') + '-intercepts, so they are two different, parallel lines.',
          same ? '<b>False.</b> ' + t(eq2) + ' is ' + t(k) + ' times the first equation: the same line.' : '<b>True.</b> Both have slope ' + t(qT(slopeOf(L))) + ', and dividing the second by ' + t(k) + ' gives a different constant, so they are different parallel lines.', ['Divide the second equation by ' + t(k) + ' and compare.'], 'TF same line vs parallel');
      } },
      { id: 'e11g', sub: 'g', level: 'EMG', outcome: 'RF5', make: function (r) {
        if (r.chance(0.4)) return B.tf(r, '“A line with a positive slope can have a negative ' + t('y') + '-intercept.”', true, t('y=2x-5') + ' has slope ' + t('2') + ' and ' + t('y') + '-intercept ' + t('(0,\\ -5)') + '. The signs of ' + t('m') + ' and ' + t('b') + ' are independent.',
          '<b>True.</b> For example ' + t('y=2x-5') + '.', ['Try to write an example.'], 'TF positive slope negative intercept');
        var pos = r.chance(0.6), m = r.int(2, 6) * (pos ? 1 : -1), b = r.int(3, 9) * (pos ? -1 : 1);
        return B.tf(r, '“A line with a ' + (pos ? 'positive' : 'negative') + ' slope must have a ' + (pos ? 'positive' : 'negative') + ' ' + t('y') + '-intercept.”', false, t('y=' + pol([[m, 'x'], [b, '']])) + ' has ' + (pos ? 'positive' : 'negative') + ' slope ' + t(m) + ' but ' + t('y') + '-intercept ' + t(ptT([0, b])) + '. The signs of ' + t('m') + ' and ' + t('b') + ' are independent.',
          '<b>False.</b> Counterexample: ' + t('y=' + pol([[m, 'x'], [b, '']])) + '.', ['Try to write a counterexample.'], 'TF slope sign and intercept sign');
      } },
      { id: 'e11h', sub: 'h', level: 'EMG', outcome: 'RF7', make: function (r) {
        if (r.chance(0.4)) return B.tf(r, '“Two lines with the same slope are the same line.”', false, 'Equal slopes alone give <b>parallel</b> lines; they are the same line only if the ' + t('y') + '-intercepts match too, e.g. ' + t('y=2x+1') + ' and ' + t('y=2x-3') + ' are different.',
          '<b>False.</b> ' + t('y=2x+1') + ' and ' + t('y=2x-3') + ' have the same slope but are different (parallel) lines.', ['Can two different lines have the same slope?'], 'TF same slope same line');
        return B.tf(r, '“Two lines with the same slope and the same ' + t('y') + '-intercept are the same line.”', true, t('m') + ' and ' + t('b') + ' are the only numbers in ' + t('y=mx+b') + ', so equal ' + t('m') + ' and equal ' + t('b') + ' give identical equations.',
          '<b>True.</b> ' + t('m') + ' and ' + t('b') + ' are the only numbers in ' + t('y=mx+b') + ', so the equations are identical — the same line.', ['Write both lines in ' + t('y=mx+b') + ' form.'], 'TF same m and b');
      } }] },
    /* ---------------- Q12 ---------------- */
    { num: '12',
      shared: function (r) {
        for (var g = 0; g < 300; g++) {
          var ab = r.pick([[2, 3], [3, 2], [1, 2], [3, 4], [2, 5], [4, 3]]), k = r.pick([2, 3]), A = k * ab[0], Bc = k * ab[1], C = rnz(r, -15, 15), pt = [r.int(-5, 5), r.int(-5, 5)];
          if (C === 0) continue;
          var L = L3(A, -Bc, C), m = Q(ab[0], ab[1]), stM = qn(m), stPerp = perpS(stM), Ls = lineMP(stPerp, pt), Lc = lineMP(perpS(m), pt);
          if (sameL(Ls, Lc) || pt[0] === 0 || Ls.C === 0) continue;
          return { A: A, B: Bc, C: C, L: L, m: m, pt: pt, Ls: Ls, Lc: Lc, stPerp: stPerp, raw: [A, -Bc, C] };
        }
        return { A: 6, B: 9, C: 12, L: L3(6, -9, 12), m: Q(2, 3), pt: [2, -1], Ls: L3(3, -2, -8), Lc: L3(3, 2, -4), stPerp: Q(3, 2), raw: [6, -9, 12] };
      },
      stem: function (o) {
        var eq = pol([[o.A, 'x'], [-o.B, 'y'], [o.C, '']]) + '=0';
        var neg = pol([[-o.Ls.A, 'x'], [-o.Ls.B, 'y'], [-o.Ls.C, '']]) + '=0';
        return 'A student was asked for the slope and both intercepts of ' + t(eq) + ', and then for the line through ' + t(ptT(o.pt)) + ' perpendicular to it. Their whole solution reads:<br>' + t('m=-\\tfrac{A}{B}=-\\tfrac{' + o.A + '}{' + o.B + '}=' + qT(qn(o.m))) + '; &nbsp; ' + t('x') + '-int ' + t(o.A) + ', ' + t('y') + '-int ' + t(-o.B) + '; &nbsp; ' + t('m_{\\perp}=' + qT(o.stPerp)) + '; &nbsp; ' + t(pT(o.Ls, o.pt) + '\\ \\Rightarrow\\ ' + neg);
      },
      parts: [
        { id: 'e12a', sub: 'a i', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return B.slope('Determine the true slope of ' + t(pol([[o.A, 'x'], [-o.B, 'y'], [o.C, '']]) + '=0') + '.', o.m, {}, t('A=' + o.A) + ', ' + t('B=' + (-o.B)) + ': ' + t('m=-\\frac{A}{B}=-\\frac{' + o.A + '}{' + (-o.B) + '}=' + qT(o.m)) + '. Check: ' + t(sT(o.L)) + ' ✓', ['' + t('B') + ' is the whole coefficient of ' + t('y') + ', sign included.'], 'true slope (error analysis)');
        } },
        { id: 'e12a2', sub: 'a ii', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return mc(r, 'What exactly did the student do to ' + t('B') + '?', [
            { html: 'Dropped its negative sign: ' + t('B=' + (-o.B)) + ', not ' + t(o.B) + '.', right: true },
            { html: 'Swapped ' + t('A') + ' and ' + t('B') + '.', why: 'The student did use ' + t('\\frac{A}{B}') + ' the right way up; the problem is the sign of ' + t('B') + '.' },
            { html: 'Forgot to reduce the fraction.', why: 'They did reduce ' + t('\\frac{' + o.A + '}{' + o.B + '}') + '. Look at the sign of the ' + t('y') + '-coefficient.' },
            { html: 'Nothing — the slope is right.', why: 'Solve for ' + t('y') + ': ' + t(sT(o.L)) + '. The slope is ' + t(qT(o.m)) + '.' }],
            'In ' + t(pol([[o.A, 'x'], [-o.B, 'y'], [o.C, '']]) + '=0') + ', ' + t('B=' + (-o.B)) + '. The student <b>dropped the negative sign of ' + t('B') + '</b>, so their slope has the wrong sign.', ['What is ' + t('B') + ', exactly?'], 'name the slope error');
        } },
        { id: 'e12b', sub: 'b', level: 'PRG', outcome: 'RF5', make: function (r, o) { return intsP('Determine both intercepts as ordered pairs. (The student ignored ' + t('C') + ' completely and read ' + t('A') + ' and ' + t('B') + ' as the intercepts.)', o.L, intSteps(o.L), ['Set ' + t('y=0') + ', then ' + t('x=0') + ' — ' + t('C') + ' matters.'], 'intercepts (error analysis)'); } },
        { id: 'e12c', sub: 'c', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          var n = perpS(o.m);
          return lineP('Determine the correct perpendicular line through ' + t(ptT(o.pt)) + ' in general form.', o.Lc, { form: 'general', wrong: [{ is: o.Ls, code: 'diag', hint: 'That is the student’s line, built from the wrong slope. Start from the true slope ' + t(qT(o.m)) + '.' }] },
            t('m_{\\perp}=' + qT(n)) + '; point ' + t(ptT(o.pt)) + '.<br>' + psSteps(n, o.pt), ['Use the true slope from (a), then its negative reciprocal.'], 'correct perpendicular (error analysis)');
        } },
        { id: 'e12d', sub: 'd', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          return mc(r, 'The student’s final equation does pass through ' + t(ptT(o.pt)) + '. Why does that check catch neither of their two real errors?', [
            { html: 'They built the line through ' + t(ptT(o.pt)) + ' in slope–point form, so it must pass that test whatever the slope. It tests the point only — not the slope or the intercepts.', right: true },
            { html: 'Because the check was done with the wrong point.', why: 'The point ' + t(ptT(o.pt)) + ' is the right one; the issue is what passing through it proves.' },
            { html: 'Because a perpendicular line never passes through the given point.', why: 'The perpendicular line is supposed to pass through ' + t(ptT(o.pt)) + '.' },
            { html: 'It does catch them: passing through the point proves the line is right.', why: 'Infinitely many lines pass through ' + t(ptT(o.pt)) + '. Only the slope decides which one is perpendicular.' }],
            'Slope–point form forces the line through ' + t(ptT(o.pt)) + ', so that check tests the point only. A check that catches both errors: rewrite the original as ' + t(sT(o.L)) + ' — that shows the true slope and ' + t('y') + '-intercept, and ' + t(qT(o.stPerp) + '\\cdot ' + qT(o.m) + '=' + qT(qm(o.stPerp, o.m)) + '\\ne -1') + '.', ['How was the student’s line built?'], 'why the check fails');
        } },
        { id: 'e12e', sub: 'e', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var neg = pol([[-o.Ls.A, 'x'], [-o.Ls.B, 'y'], [-o.Ls.C, '']]) + '=0';
          return lineP('Even if every slope had been right, the student’s last line, ' + t(neg) + ', would still be marked down: ' + t('A') + ' is negative. Repair it — write the student’s line in proper general form.', o.Ls, { form: 'general' },
            t(neg) + ' has ' + t('A=' + (-o.Ls.A)) + ', but general form needs ' + t('A') + ' positive. Multiply every term by ' + t('-1') + ': ' + t(gT(o.Ls)), ['Multiply every term by ' + t('-1') + ' — the same points still satisfy it.'], 'repair general form sign');
        } }] },
    /* ---------------- Q13 ---------------- */
    { num: '13',
      shared: function (r) { var k, h, v; do { k = rnz(r, -8, 8); h = rnz(r, -8, 8); v = rnz(r, -8, 8); } while (h === k || Math.abs(h) === Math.abs(v) || Math.abs(k - h) === Math.abs(k + h)); return { k: k, h: h, v: v }; },
      stem: function (o) { return 'Asked for the equation of the line through ' + t(ptT([o.h, o.v])) + ' perpendicular to ' + t('x=' + o.k) + ', a student writes: “' + t('x=' + o.k) + ' is a line with slope ' + t('0') + ', so the perpendicular has an undefined slope, and the answer is ' + t('x=' + o.h) + '.”'; },
      parts: [
        { id: 'e13a', sub: 'a', level: 'BEG', outcome: 'RF5', make: function (r, o) {
          return B.fields('State the slope of ' + t('x=' + o.k) + ' (using the correct word), and the slope of the line the question actually wants.', [fld('slope of ' + t('x=' + o.k), 'slope'), fld('slope of the wanted line', 'slope')], [K.slope(null), K.slope(0)], ['\\text{undefined}', '0'], 'undefined; ' + t('0'),
            t('x=' + o.k) + ' is <b>vertical</b>: its slope is <b>undefined</b> (not ' + t('0') + '). The wanted line is perpendicular to a vertical line, so it is <b>horizontal</b>: slope ' + t('0') + '.', ['Is ' + t('x=' + o.k) + ' vertical or horizontal?'], 'slopes of vertical/horizontal');
        } },
        { id: 'e13b', sub: 'b', level: 'EMG', outcome: 'RF7', make: function (r, o) {
          return lineP('Give the correct equation, in general form.', { y: o.v }, { form: 'general', wrong: [{ is: { x: o.h }, code: 'line-vh', hint: 'That is the student’s answer: a vertical line, which is <b>parallel</b> to ' + t('x=' + o.k) + '. The perpendicular is horizontal.' }] },
            'Horizontal through ' + t(ptT([o.h, o.v])) + ': ' + t('y=' + o.v) + ', i.e. ' + t(gT(L3(0, 1, -o.v))) + '. (' + t('A=0') + ', so the leading non-zero coefficient ' + t('B') + ' is made positive.)', ['A horizontal line through the point: ' + t('y=k') + '.'], 'perp to vertical (general)');
        } },
        { id: 'e13c', sub: 'c', level: 'EMG', outcome: 'RF7', make: function (r, o) {
          var d = Math.abs(o.k - o.h), d2 = Math.abs(o.k + o.h);
          return mc(r, 'The student’s line ' + t('x=' + o.h) + ' is a real line. How is it related to ' + t('x=' + o.k) + '?', [
            { html: 'Parallel to it, ' + t(d) + ' units apart.', right: true },
            { html: 'Perpendicular to it, ' + t(d) + ' units apart.', why: 'Both lines are vertical, so they never meet — they are parallel.' },
            { html: 'Parallel to it, ' + t(d2) + ' units apart.', why: 'Distance between ' + t('x=' + o.h) + ' and ' + t('x=' + o.k) + ' is ' + t('|' + o.k + '-' + sgnP(o.h) + '|') + '.' },
            { html: 'The same line.', why: t('x=' + o.h) + ' and ' + t('x=' + o.k) + ' have different ' + t('x') + '-values.' }],
            t('x=' + o.h) + ' is also vertical, so it is <b>parallel</b> to ' + t('x=' + o.k) + ', not perpendicular. They are ' + t('|' + o.k + '-' + sgnP(o.h) + '|=' + d) + ' units apart.', ['Both are of the form ' + t('x=k') + '.'], 'relation of two vertical lines');
        } },
        { id: 'e13d', sub: 'd', level: 'EMG', outcome: 'RF7', make: function (r, o) {
          return mc(r, 'Why can’t the test ' + t('m_1m_2=-1') + ' be applied to a vertical line and a horizontal line?', [
            { html: 'The slope of the vertical line is undefined, so the product can’t even be formed. The unit’s exception: a horizontal and a vertical line are perpendicular.', right: true },
            { html: 'Because ' + t('0\\times 0=0') + ', not ' + t('-1') + '.', why: 'Only the horizontal line has slope ' + t('0') + '; the vertical line’s slope is undefined.' },
            { html: 'Because the lines are not really perpendicular.', why: 'They are: they meet at a right angle. The test just can’t be used.' },
            { html: 'Because the slopes are equal.', why: 'One slope is ' + t('0') + ' and the other is undefined.' }],
            'The slope of ' + t('x=' + o.k) + ' is undefined, so ' + t('m_1m_2') + ' cannot be formed. The unit’s exception: <b>a horizontal line and a vertical line are perpendicular</b>.', ['What is the slope of a vertical line?'], 'perpendicular exception');
        } }] },
    /* ---------------- Part F — Q14 ---------------- */
    { num: '14', section: 'Extra practice F — Challenge',
      shared: function (r) {
        var xr = [-2, 10], yr = [-4, 8];
        for (var g = 0; g < 500; g++) {
          var u = r.pick([[-1, 2], [1, 2], [2, 1], [-2, 1], [1, 3], [3, 1], [-1, 3], [-3, 1], [1, -2], [2, -1]]), w = r.chance(0.5) ? [-u[1], u[0]] : [u[1], -u[0]], s = r.pick([1, 2]);
          if ((u[0] + w[0]) % 2 || (u[1] + w[1]) % 2) s = 2;
          var V = [r.int(1, 8), r.int(-3, 6)], P2 = [V[0] + s * u[0], V[1] + s * u[1]], P3 = [V[0] + s * w[0], V[1] + s * w[1]];
          var inW = function (p) { return p[0] >= xr[0] && p[0] <= xr[1] && p[1] >= yr[0] && p[1] <= yr[1]; };
          if (![P2, P3].every(inW) || P2[0] === P3[0] || P2[1] === P3[1]) continue;
          var M = [(P2[0] + P3[0]) / 2, (P2[1] + P3[1]) / 2]; if (!Number.isInteger(M[0]) || !Number.isInteger(M[1]) || (M[0] === V[0])) continue;
          var L1 = line2(V, P2), L2 = line2(V, P3), L3_ = line2(P2, P3); if (L1.C === 0 && L2.C === 0) continue;
          return { V: V, P2: P2, P3: P3, M: M, L1: L1, L2: L2, L3: L3_, s: s, u: u, xr: xr, yr: yr, Lm: line2(V, M) };
        }
        return { V: [5, 0], P2: [3, 4], P3: [9, 2], M: [6, 3], L1: L3(2, 1, -10), L2: L3(1, -2, -5), L3: L3(1, 3, -15), s: 2, u: [-1, 2], xr: xr, yr: yr, Lm: L3(3, -1, -15) };
      },
      stem: function (o) { return '<b>A triangle delivered as three equations.</b> The three lines ' + t('\\textbf{L1}:\\ ' + gT(o.L1)) + ', ' + t('\\textbf{L2}:\\ ' + gT(o.L2)) + ' and ' + t('\\textbf{L3}:\\ ' + gT(o.L3)) + ' bound a triangle.'; },
      parts: [
        { id: 'e14a', sub: 'a', level: 'ADV', outcome: 'EXT', make: function (r, o) {
          return B.fields('Determine the three vertices algebraically.', [fld('L1 and L2 meet at', 'pairs'), fld('L1 and L3 meet at', 'pairs'), fld('L2 and L3 meet at', 'pairs')], [ptChk(o.V), ptChk(o.P2), ptChk(o.P3)], [ptK(o.V), ptK(o.P2), ptK(o.P3)], t(ptT(o.V)) + ', ' + t(ptT(o.P2)) + ', ' + t(ptT(o.P3)),
            'Solve each pair by substitution (isolate one variable in one equation and substitute into the other):<br>L1 & L2: ' + t(ptT(o.V)) + ' (check: ' + t(sub(o.L1, o.V) + '=0') + ', ' + t(sub(o.L2, o.V) + '=0') + ')<br>L1 & L3: ' + t(ptT(o.P2)) + '<br>L2 & L3: ' + t(ptT(o.P3)),
            ['Solve one equation for ' + t('y') + ' (or ' + t('x') + ') and substitute into the other. Check each vertex in both equations.'], 'triangle vertices');
        } },
        { id: 'e14b', sub: 'b i', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var ms = [slopeOf(o.L1), slopeOf(o.L2), slopeOf(o.L3)];
          return B.fields('State the slope of each line.', [fld('L1: ' + t('m='), 'slope'), fld('L2: ' + t('m='), 'slope'), fld('L3: ' + t('m='), 'slope')], ms.map(function (m) { return K.slope(m); }), ms.map(qT), ms.map(function (m) { return t(qT(m)); }).join(', '),
            ['L1', 'L2', 'L3'].map(function (n, i) { var L = [o.L1, o.L2, o.L3][i]; return n + ': ' + t('m=-\\frac{A}{B}=-\\frac{' + L.A + '}{' + L.B + '}=' + qT(ms[i])); }).join('<br>'), ['Use ' + t('m=-\\frac{A}{B}') + ' for each line.'], 'slopes of three lines');
        } },
        { id: 'e14b2', sub: 'b ii', level: 'EMG', outcome: 'RF7', make: function (r, o) {
          var m1 = slopeOf(o.L1), m2 = slopeOf(o.L2);
          return ptP('Two of the lines meet at ' + t('90^\\circ') + '. At which vertex is the right angle?', o.V, t('m_{L1}m_{L2}=' + qT(m1) + '\\times\\left(' + qT(m2) + '\\right)=-1') + ', so L1 ⊥ L2. The right angle is where they meet, at ' + t(ptT(o.V)) + '.', ['Find the pair of slopes with product ' + t('-1') + ', then the vertex where those lines meet.'], 'right-angle vertex');
        } },
        { id: 'e14c', sub: 'c i', level: 'EMG', outcome: 'EXT', make: function (r, o) {
          var a = dist2(o.V, o.P2), b = dist2(o.V, o.P3), c = dist2(o.P2, o.P3);
          return B.fields('Use the distance formula on all three sides (exact values).', [fld('side ' + t(ptT(o.V)) + '–' + t(ptT(o.P2)), 'radical'), fld('side ' + t(ptT(o.V)) + '–' + t(ptT(o.P3)), 'radical'), fld('side ' + t(ptT(o.P2)) + '–' + t(ptT(o.P3)), 'radical')], [exactV(Math.sqrt(a), 'a radical'), exactV(Math.sqrt(b), 'a radical'), exactV(Math.sqrt(c), 'a radical')], [radTex(a), radTex(b), radTex(c)],
            [a, b, c].map(function (z) { return t(radTex(z)); }).join(', '), t(distT(o.V, o.P2)) + '<br>' + t(distT(o.V, o.P3)) + '<br>' + t(distT(o.P2, o.P3)) + '<br>Check (Pythagoras): ' + t(a + '+' + b + '=' + c) + ' ✓', ['' + t('d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}') + '.'], 'side lengths');
        } },
        { id: 'e14c2', sub: 'c ii', level: 'EMG', outcome: 'EXT', make: function (r, o) {
          return mc(r, 'What kind of triangle is this?', [
            { html: 'An isosceles right triangle.', right: true },
            { html: 'An equilateral triangle.', why: 'The hypotenuse is longer than the two legs.' },
            { html: 'A scalene right triangle.', why: 'Compare the two legs from (c): they are equal.' },
            { html: 'An isosceles triangle with no right angle.', why: 'L1 and L2 are perpendicular (slopes multiply to ' + t('-1') + ').' }],
            'Two equal sides and a right angle (from (b)): an <b>isosceles right triangle</b>. ' + t(dist2(o.V, o.P2) + '+' + dist2(o.V, o.P3) + '=' + dist2(o.P2, o.P3)) + ' ✓', ['Use the side lengths and the right angle.'], 'classify triangle');
        } },
        { id: 'e14d', sub: 'd', level: 'PRG', outcome: 'RF6', make: function (r, o) {
          var xr = o.xr, yr = o.yr, key = linesDraw([o.L1, o.L2, o.L3], xr, yr);
          var bad2 = linesDraw([o.L1, o.L2], xr, yr), tri = gv([], [segv(o.V, o.P2), segv(o.P2, o.P3), segv(o.P3, o.V)]);
          return drawPart('Graph all three lines on the grid. The triangle’s three vertices (found in (a)) must land on the intersections you draw.' + LINEHELP, pad(xr, yr), exactChk(key, { wrong: [{ is: tri, code: 'graph-arrows', hint: 'You drew the triangle — the question asks for the three whole <b>lines</b>: put arrows on the ends.' }] }), key,
            'L1 through ' + t(ptT(o.V)) + ' and ' + t(ptT(o.P2)) + '; L2 through ' + t(ptT(o.V)) + ' and ' + t(ptT(o.P3)) + '; L3 through ' + t(ptT(o.P2)) + ' and ' + t(ptT(o.P3)) + '. The lines cross exactly at the vertices.', ['Each line passes through two of the vertices from (a).'], 'graph three lines', [bad2, tri]);
        } },
        { id: 'e14e', sub: 'e', level: 'EMG', outcome: 'EXT', make: function (r, o) {
          var a = dist2(o.V, o.P2);
          return B.number('Determine the area of the triangle, in square units, using the two legs of the right angle as base and height.', a / 2, function (v) { return v === a ? { code: 'diag', hint: 'Area of a triangle is ' + t('\\frac{1}{2}bh') + '.' } : null; },
            'Each leg is ' + t(radTex(a)) + '. ' + t('A=\\frac{1}{2}bh=\\frac{1}{2}\\left(' + radTex(a) + '\\right)\\left(' + radTex(a) + '\\right)=\\frac{1}{2}(' + a + ')=' + numDec(a / 2)) + ' square units', ['' + t('\\frac{1}{2}bh') + ' with the two equal legs.'], 'triangle area', { after: 'square units' });
        } },
        { id: 'e14f', sub: 'f', level: 'ADV', outcome: 'RF7', make: function (r, o) {
          var mm = slopeOf(o.Lm);
          return lineP('Determine, in general form, the line from the right-angle vertex to the midpoint of the opposite side.', o.Lm, { form: 'general', wrong: [{ is: lineMP(slopeOf(o.L3), o.V), code: 'diag', hint: 'That line through the vertex is parallel to the opposite side. Find the midpoint of the opposite side and join it to ' + t(ptT(o.V)) + '.' }] },
            'Opposite side: ' + t(ptT(o.P2)) + ' to ' + t(ptT(o.P3)) + '. Midpoint ' + t(ptT(o.M)) + '.<br>' + (mm ? slopeSteps(o.V, o.M) + '<br>' + psSteps(mm, o.V) : 'Vertical line ' + t(gT(o.Lm))), ['Midpoint of the hypotenuse first, then the line through it and ' + t(ptT(o.V)) + '.'], 'median to hypotenuse');
        } },
        { id: 'e14g', sub: 'g', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          var mm = slopeOf(o.Lm), m3 = slopeOf(o.L3);
          return mc(r, 'The line in (f), ' + t(gT(o.Lm)) + ', runs from the right-angle vertex ' + t(ptT(o.V)) + ' to the midpoint ' + t(ptT(o.M)) + ' of the opposite side. It is also perpendicular to the opposite side' + (mm ? ' (' + t(qT(mm) + '\\times\\left(' + qT(m3) + '\\right)=-1') + ')' : '') + '. What does that tell you?', [
            { html: 'The triangle is isosceles; the segment is both a <b>median</b> (vertex to midpoint) and an <b>altitude</b> (perpendicular to the opposite side).', right: true },
            { html: 'The triangle is equilateral; the segment is a side.', why: 'The segment runs from a vertex to the middle of the opposite side — it isn’t a side.' },
            { html: 'The segment is a median but not an altitude.', why: 'Perpendicular to the opposite side, from a vertex: that is exactly an altitude.' },
            { html: 'The segment is parallel to the opposite side.', why: 'Its slope is the negative reciprocal, so it is perpendicular.' }],
            'Perpendicular to the opposite side, through its midpoint: the triangle is <b>isosceles</b>, and the segment is both a <b>median</b> and an <b>altitude</b>.', ['Median: vertex to midpoint. Altitude: vertex, perpendicular to the opposite side.'], 'median and altitude');
        } }] },
    /* ---------------- Q15 ---------------- */
    { num: '15',
      shared: function (r) {
        for (var g = 0; g < 300; g++) {
          var n = r.pick([[3, -4], [4, -3], [3, 4], [4, 3]]), sg = r.pick([1, -1]), F0 = [r.int(-2, 6), r.int(-1, 5)], P = [F0[0] + sg * n[0], F0[1] + sg * n[1]];
          var L = L3(n[0], n[1], -(n[0] * F0[0] + n[1] * F0[1])), dir = [-n[1], n[0]], j = r.pick([1, -1]), G = [F0[0] + j * dir[0], F0[1] + j * dir[1]], P2 = [2 * F0[0] - P[0], 2 * F0[1] - P[1]];
          if ([P, G, P2].some(function (p) { return Math.abs(p[0]) > 10 || Math.abs(p[1]) > 10; }) || L.C === 0 || P[1] === 0 && r.chance(0.3)) continue;
          return { n: n, F: F0, P: P, L: L, G: G, P2: P2, Lp: line2(P, F0) };
        }
        return { n: [3, -4], F: [4, 4], P: [7, 0], L: L3(3, -4, 4), G: [8, 7], P2: [1, 8], Lp: L3(4, 3, -28) };
      },
      stem: function (o) { return '<b>How far is a point from a line?</b> “Distance from a point to a line” always means the <b>perpendicular</b> distance — the shortest of all the distances from the point to points of the line. Let ' + t('\\ell') + ' be ' + t(gT(o.L)) + ' and let ' + t('P' + ptT(o.P)) + '.' +
          HW.graph({ x: [-10, 10], y: [-10, 10], labels: 2, max: 300, segs: [{ pts: clip(o.L, [-10, 10], [-10, 10]), start: 'arrow', end: 'arrow' }], points: [{ x: o.P[0], y: o.P[1], label: 'P' }] }); },
      parts: [
        { id: 'e15a', sub: 'a', level: 'PRG', outcome: 'RF7', make: function (r, o) {
          var m = slopeOf(o.L), n = perpS(m);
          return lineP('Determine the equation, in general form, of the line through ' + t('P') + ' perpendicular to ' + t('\\ell') + '.', o.Lp, { form: 'general', wrong: [{ is: lineMP(m, o.P), code: 'line-parallel', hint: 'That line is parallel to ' + t('\\ell') + '. Use the negative reciprocal slope.' }] },
            t('\\ell') + ': ' + t('m=' + qT(m)) + ', so ' + t('m_{\\perp}=' + qT(n)) + '.<br>' + psSteps(n, o.P), ['Slope of ' + t('\\ell') + ' is ' + t('-\\frac{A}{B}') + '; take the negative reciprocal.'], 'perpendicular through P');
        } },
        { id: 'e15b', sub: 'b', level: 'ADV', outcome: 'EXT', make: function (r, o) {
          return ptP('The line through ' + t('P') + ' perpendicular to ' + t('\\ell') + ' is ' + t(gT(o.Lp)) + '. Determine the point ' + t('F') + ' where that perpendicular meets ' + t('\\ell') + ', by solving the two equations together.', o.F, 'Solve ' + t(gT(o.L)) + ' and ' + t(gT(o.Lp)) + ' together (substitution): ' + t('F' + ptT(o.F)) + '.<br>Check on ' + t('\\ell') + ': ' + t(sub(o.L, o.F) + '=0') + ' ✓; on the perpendicular: ' + t(sub(o.Lp, o.F) + '=0') + ' ✓', ['Solve one equation for ' + t('y') + ' and substitute into the other.'], 'foot of perpendicular');
        } },
        { id: 'e15c', sub: 'c', level: 'EMG', outcome: 'EXT', make: function (r, o) {
          return B.number('The perpendicular from ' + t('P') + ' meets ' + t('\\ell') + ' at ' + t('F' + ptT(o.F)) + '. Use the distance formula to find ' + t('PF') + ', the distance from ' + t('P') + ' to ' + t('\\ell') + '.', 5, null, t('PF=' + distT(o.P, o.F) + '=5') + ' units. (The formula ' + t('\\frac{|Ax_1+By_1+C|}{\\sqrt{A^2+B^2}}=\\frac{|' + sub(o.L, o.P) + '|}{' + 5 + '}=5') + ' packages this whole calculation.)', ['Use ' + t('P' + ptT(o.P)) + ' and ' + t('F') + ' from (b).'], 'distance PF', { after: 'units' });
        } },
        { id: 'e15d', sub: 'd', level: 'EMG', outcome: 'EXT', make: function (r, o) {
          var d2 = dist2(o.P, o.G);
          return valP('The point ' + t('G' + ptT(o.G)) + ' is also on ' + t('\\ell') + '. Compute ' + t('PG') + ' exactly (and confirm it is longer than ' + t('PF=5') + ', the perpendicular distance).', Math.sqrt(d2), radTex(d2), t(sub(o.L, o.G) + '=0') + ' ✓ so ' + t('G') + ' is on ' + t('\\ell') + '. ' + t('PG=' + distT(o.P, o.G) + (radTex(d2) !== '\\sqrt{' + d2 + '}' ? '=' + radTex(d2) : '') + '\\approx ' + (Math.round(Math.sqrt(d2) * 100) / 100)) + ' > ' + t('5') + ' ✓', ['Distance formula with ' + t('P') + ' and ' + t('G') + '.'], 'distance PG', { keys: 'radical' });
        } },
        { id: 'e15f', sub: 'f', level: 'PRG', outcome: 'EXT', make: function (r, o) {
          var st = [o.F[0] - o.P[0], o.F[1] - o.P[1]];
          return ptP('Determine the point ' + t("P'") + ' obtained by continuing from ' + t('P') + ' through ' + t('F' + ptT(o.F)) + ' (the foot of the perpendicular from ' + t('P') + ' to ' + t('\\ell') + ') the same distance again — the mirror image of ' + t('P') + ' in ' + t('\\ell') + '.', o.P2, 'Step from ' + t('P') + ' to ' + t('F') + ': ' + t('(' + st[0] + ',\\ ' + st[1] + ')') + '. Repeat it from ' + t('F') + ': ' + t("P'" + ptT(o.P2)) + '.<br>On the perpendicular: ' + t(sub(o.Lp, o.P2) + '=0') + ' ✓', ['' + t('F') + ' is the midpoint of ' + t("PP'") + '.'], 'mirror image');
        } }] },
    /* ---------------- Q16–18 ---------------- */
    { num: '16', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: 'e16', level: 'EMG', outcome: 'RF7', make: function (r) {
        var A, Bc, C0, P, L, g = 0;
        do { A = r.int(2, 9); Bc = r.int(2, 7) * (r.chance(0.7) ? 1 : -1); C0 = rnz(r, -20, 20); P = [rnz(r, -6, 6), r.int(2, 10)]; L = L3(A, Bc, -(A * P[0] + Bc * P[1])); g++; } while ((gcd(A, Math.abs(Bc)) !== 1 || L.C === 0 || L3(A, Bc, C0).C === L.C || L.C === -L.C || Math.abs(P[0]) < 2) && g < 100);
        var G = L3(A, Bc, C0), wC = L3(A, Bc, -L.C), perp = lineMP(perpS(slopeOf(G)), P), wx = L3(A, Bc, -(A * -P[0] + Bc * P[1]));
        var V = [L, wC, perp, wx]; if (sameL(wx, wC) || sameL(wx, L)) V[3] = L3(Bc < 0 ? -A : A, Bc < 0 ? -Bc : Bc, L.C + 7);
        return mc(r, 'The equation, in general form, of the line through ' + t(ptT(P)) + ' parallel to ' + t(gT(G)) + ' is', [
          { html: t(gT(L)), right: true }, { html: t(gT(wC)), why: 'Check the constant: substitute ' + t(ptT(P)) + ' — the left side is not ' + t('0') + '. Watch the sign of ' + t('C') + '.' },
          { html: t(gT(perp)), why: 'That line is perpendicular to ' + t(gT(G)) + '. Parallel lines keep ' + t('A') + ' and ' + t('B') + '.' }, { html: t(gT(V[3])), why: 'Substitute ' + t(ptT(P)) + ' into this one — it doesn’t pass through the point (check the sign of the ' + t('x') + '-coordinate).' }],
          'Parallel ⟹ keep ' + t(pol([[A, 'x'], [Bc, 'y']])) + ': ' + t(A + '(' + P[0] + ')' + (Bc < 0 ? '' : '+') + Bc + '(' + P[1] + ')+C=0') + ', so ' + t('C=' + L.C) + ': ' + t(gT(L)) + '.', ['Keep ' + t('A') + ' and ' + t('B') + ', then find ' + t('C') + ' by substituting the point.'], 'parallel through point (MC)');
      } }] },
    { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: 'e17', level: 'PRG', outcome: 'RF7', make: function (r) {
        var Ls, sl4, truth, g = 0;
        var par = function (a, b) { return qv(sl4[a]) === qv(sl4[b]) && !sameL(L3(Ls[a].A, Ls[a].B, Ls[a].C), L3(Ls[b].A, Ls[b].B, Ls[b].C)); }, perp = function (a, b) { return Math.abs(qv(sl4[a]) * qv(sl4[b]) + 1) < 1e-9; };
        do {
          var ab = r.pick([[3, -2], [2, -1], [3, -4], [1, -3], [4, -3], [2, -5], [1, 2], [2, 3]]), sc = r.int(0, 3), k1 = r.pick([1, 2]), k3 = k1 + r.pick([1, 2]);
          var pa = [ab[1], -ab[0]]; if (pa[0] < 0 || (pa[0] === 0 && pa[1] < 0)) pa = [-pa[0], -pa[1]];
          var i1 = [k1 * ab[0], k1 * ab[1]], i3 = [k3 * ab[0], k3 * ab[1]], i2 = pa.slice(), i4 = [2 * pa[0], 2 * pa[1]];
          if (sc > 0) { i2 = [pa[0] + 1, pa[1]]; i4 = [2 * i2[0], 2 * i2[1]]; }
          if (sc === 2) i4 = [2 * i2[0] + 1, 2 * i2[1]];
          if (sc === 3) i3 = [k3 * ab[0] + 1, k3 * ab[1]];
          Ls = [i1, i2, i3, i4].map(function (cf) { return { A: cf[0], B: cf[1], C: rnz(r, -12, 12) }; });
          var bad = Ls.some(function (L) { return L.A === 0 || L.B === 0; });
          if (!bad) {
            sl4 = Ls.map(slopeOf);
            var p13 = par(0, 2), p24 = par(1, 3), anyPerp = [[0, 1], [0, 3], [1, 2], [2, 3]].some(function (z) { return perp(z[0], z[1]); }), p12 = perp(0, 1);
            truth = [p13 && !p24 && !anyPerp, p24 && !p13 && !anyPerp, p13 && p24 && p12, p13 && p24 && !anyPerp];
            var others = [[0, 1], [0, 3], [1, 2], [2, 3]].some(function (z) { return par(z[0], z[1]); });
            if (others) truth = [false, false, false, false];
          }
          g++;
        } while ((bad || truth.filter(Boolean).length !== 1) && g < 80);
        if (bad || truth.filter(Boolean).length !== 1) { Ls = [[6, -4, 7], [2, 3, -12], [9, -6, -5], [4, 6, 9]].map(function (cf) { return { A: cf[0], B: cf[1], C: cf[2] }; }); sl4 = Ls.map(slopeOf); truth = [false, false, true, false]; }
        var eqs = Ls.map(function (L, i) { return t(W8(i + 1) + ')\\ ' + pol([[L.A, 'x'], [L.B, 'y'], [L.C, '']]) + '=0'); });
        var sls = sl4.map(function (m, i) { return t(W8(i + 1) + ')\\ ' + qT(m)); }).join(', ');
        var ow = 'Find every slope with ' + t('-\\frac{A}{B}') + ' first: ' + sls + '. Then look for equal slopes and for slopes that multiply to ' + t('-1') + '.';
        return mc(r, 'Four lines are given: ' + eqs.join(', ') + '. Which statement is true?', [
          { html: t('i)\\parallel iii)') + ' only', right: truth[0], why: ow }, { html: t('ii)\\parallel iv)') + ' only', right: truth[1], why: ow },
          { html: t('i)\\parallel iii)') + ', ' + t('ii)\\parallel iv)') + ', and ' + t('i)\\perp ii)'), right: truth[2], why: ow }, { html: t('i)\\parallel iii)') + ' and ' + t('ii)\\parallel iv)') + ', but no pair is perpendicular', right: truth[3], why: ow }],
          'Slopes ' + t('-\\frac{A}{B}') + ': ' + sls + '. Equal slopes (different lines) are parallel; slopes with product ' + t('-1') + ' are perpendicular.', ['Compute all four slopes first.'], 'parallel/perpendicular among four lines', true);
      } }] },
    { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
      { id: 'e18', level: 'PRG', outcome: 'RF7', make: function (r) {
        var A, Bc, C, P, T, S, g = 0;
        do { A = r.int(2, 8); Bc = r.int(2, 9) * (r.chance(0.7) ? 1 : -1); C = rnz(r, -30, 30); P = [rnz(r, -7, 7), rnz(r, -7, 7)]; T = lineMP(perpS(Q(-A, Bc)), P); S = T.A + T.B + T.C; g++; } while ((gcd(A, Math.abs(Bc)) !== 1 || S < 1 || S > 999) && g < 300);
        var G = L3(A, Bc, C), m = slopeOf(G), n = perpS(m), par = lineMP(m, P);
        return B.nr('The line through ' + t(ptT(P)) + ' perpendicular to ' + t(gT(G)) + ' is written in general form ' + t('Ax+By+C=0') + ', where ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' are integers with ' + t('A') + ' positive and no common factor greater than ' + t('1') + '. The value of ' + t('A+B+C') + ' is ____.', S,
          function (v) { if (v === par.A + par.B + par.C) return { code: 'line-parallel', hint: 'That is the sum for the <b>parallel</b> line. Use the negative reciprocal slope.' }; if (v === -S) return { code: 'line-form-sign', hint: 'Make ' + t('A') + ' positive first (multiply every term by ' + t('-1') + ').' }; return null; },
          t(gT(G)) + ': ' + t('m=' + qT(m)) + ', so ' + t('m_{\\perp}=' + qT(n)) + '.<br>' + psSteps(n, P) + '<br>' + t('A+B+C=' + T.A + (T.B < 0 ? '' : '+') + T.B + (T.C < 0 ? '' : '+') + T.C + '=' + S), ['Perpendicular slope, slope–point form, general form (A positive, lowest terms), then add the coefficients.'], 'A+B+C of perpendicular (NR)');
      } }] },
    /* ---------------- Part G — Q19 ---------------- */
    { num: '19', section: 'Extra practice G — Two skills this review had not yet touched',
      shared: function (r) {
        var a1 = r.int(2, 5), a2 = r.int(2, 5) * 3, a3 = r.int(1, 5); if (a2 % a1 === 0 && a3 % a1 === 0) a3++;
        var s = {};
        s.a = { tex: a1 + 'y=' + a2 + '-' + (a3 === 1 ? '' : a3) + 'x', L: L3(a3, a1, -a2), kind: 'lin' };
        s.b = { tex: 'y=\\dfrac{' + r.int(2, 9) + '}{x}' + (r.chance(0.5) ? '-' : '+') + r.int(1, 6), kind: 'non' };
        var c1 = r.int(2, 6), c2 = rnz(r, -11, 11); while (c2 % c1 === 0) c2++;
        s.c = { tex: pol([[c1, 'x'], [c2, '']]) + '=0', L: L3(c1, 0, c2), kind: 'vert', k: Q(-c2, c1) };
        var d1 = r.int(2, 5), d2 = r.int(1, 9), d3 = r.pick([3, 4, 5, 6]); if (gcd(gcd(d1, d2), d3) > 1) d2 = 7;
        s.d = { tex: 'y=\\dfrac{' + d1 + 'x-' + d2 + '}{' + d3 + '}', L: L3(d1, -d3, -d2), kind: 'lin' };
        s.e = { tex: 'y^{2}=x' + (r.chance(0.5) ? '+' : '-') + r.int(1, 6), kind: 'non' };
        var f1 = rnz(r, -8, 8); s.f = { tex: pol([[1, 'y'], [f1, '']]) + '=0', L: L3(0, 1, f1), kind: 'lin', k: -f1 };
        var g1 = r.pick([2, 3, 4, 5]), g2 = r.pick([2, 3, 5, 7]); if (g1 === g2) g2 = g1 + 1;
        s.g = { tex: '\\dfrac{x}{' + g1 + '}-\\dfrac{y}{' + g2 + '}=1', L: L3(g2, -g1, -g1 * g2), kind: 'lin', g1: g1, g2: g2 };
        s.h = { tex: 'y=x(x' + (r.chance(0.5) ? '-' : '+') + r.int(2, 6) + ')', kind: 'non' };
        return s;
      },
      stem: function (o) { return '<b>Is it even a line?</b> ' + ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(function (k) { return '(' + k + ') ' + t(o[k].tex); }).join(' &nbsp; '); },
      parts: [
        { id: 'e19', sub: 'sort', level: 'PRG', outcome: 'RF4', make: function (r, o) {
          var ks = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], want = {}, why = { lin: 'it can be rearranged to ' + t('y=mx+b') + '.', non: 'its graph is not a straight line (a variable is squared, multiplied by itself, or in a denominator).', vert: 'it is a vertical line, ' + t('x=k') + ': a straight line with no ' + t('y=mx+b') + ' form.' };
          ks.forEach(function (k) { want[k] = o[k].kind; });
          return B.grid('Sort every relation into exactly one column, rearranging first where you need to. <b>Linear</b>: can be written ' + t('y=mx+b') + '. <b>Non-linear</b>: the graph is not a straight line. <b>Line, not ' + t('y=mx+b') + '</b>: a straight line that can’t be written that way.', ks.map(function (k) { return { id: k, html: '(' + k + ') ' + t(o[k].tex) }; }), [{ id: 'lin', html: 'linear' }, { id: 'non', html: 'non-linear' }, { id: 'vert', html: 'line, not ' + t('y=mx+b') }], want,
            { why: function (row) { return { code: 'row', hint: 'Look again at (' + row + '): ' + (row === 'f' ? 'it is ' + t('y=' + o.f.k) + ', a horizontal line — that is ' + t('y=0x+' + o.f.k) + ', so it can be written ' + t('y=mx+b') + '.' : why[o[row].kind]) }; } },
            'Linear: (a), (d), (f), (g). Non-linear: (b) has ' + t('x') + ' in a denominator; (e) has ' + t('y') + ' squared; (h) is ' + t('y=x^{2}+\\ldots') + ', a parabola. Straight line but not ' + t('y=mx+b') + ': (c), the vertical line ' + t('x=' + qT(o.c.k)) + '.', ['A linear relation has each variable to the first power only, and no variable in a denominator.'], 'linear or not');
        } },
        { id: 'e19g', sub: 'general (g)', level: 'PRG', outcome: 'RF6', make: function (r, o) {
          return lineP('Write relation (g), ' + t(o.g.tex) + ', in general form.', o.g.L, { form: 'general' }, 'Multiply by ' + t(o.g.g1 * o.g.g2) + ': ' + t(o.g.g2 + 'x-' + o.g.g1 + 'y=' + o.g.g1 * o.g.g2) + ' ⟹ ' + t(gT(o.g.L)), ['Multiply every term by the common denominator, ' + t(o.g.g1 * o.g.g2) + '.'], 'general form from fractions');
        } },
        { id: 'e19d', sub: 'general (a), (d)', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return B.fields('Write relations (a) and (d) in general form.', [fld('(a)', 'eq', { vars: ['x', 'y'] }), fld('(d)', 'eq', { vars: ['x', 'y'] })], [K.line(o.a.L, { form: 'general' }), K.line(o.d.L, { form: 'general' })], [gT(o.a.L), gT(o.d.L)], '(a) ' + t(gT(o.a.L)) + '; (d) ' + t(gT(o.d.L)),
            '(a) ' + t(o.a.tex) + ' ⟹ ' + t(gT(o.a.L)) + '<br>(d) multiply by the denominator, then move everything to one side ⟹ ' + t(gT(o.d.L)), ['Move every term to one side; clear fractions; make ' + t('A') + ' positive.'], 'general form of two relations');
        } },
        { id: 'e19i', sub: 'i', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          return mc(r, 'In general form, one of the straight lines has ' + t('B=0') + ' and one has ' + t('A=0') + '. Which statement is correct?', [
            { html: '(c) has ' + t('B=0') + ': no ' + t('y') + '-term, a vertical line. (f) has ' + t('A=0') + ': no ' + t('x') + '-term, a horizontal line.', right: true },
            { html: '(c) has ' + t('A=0') + ': a horizontal line. (f) has ' + t('B=0') + ': a vertical line.', why: t(o.c.tex) + ' has no ' + t('y') + '-term, so its ' + t('B') + ' is ' + t('0') + '.' },
            { html: '(c) has ' + t('B=0') + ': a horizontal line. (f) has ' + t('A=0') + ': a vertical line.', why: 'No ' + t('y') + '-term means every point has the same ' + t('x') + '-value: vertical.' },
            { html: '(a) has ' + t('B=0') + ' and (d) has ' + t('A=0') + '.', why: 'Both (a) and (d) have an ' + t('x') + '-term and a ' + t('y') + '-term.' }],
            t('B=0') + ': (c) ' + t(gT(o.c.L)) + ' — no ' + t('y') + '-term: the <b>vertical</b> line ' + t('x=' + qT(o.c.k)) + ', slope undefined.<br>' + t('A=0') + ': (f) ' + t(gT(o.f.L)) + ' — no ' + t('x') + '-term: the <b>horizontal</b> line ' + t('y=' + o.f.k) + ', slope ' + t('0') + '.', ['Which equation has no ' + t('y') + '? Which has no ' + t('x') + '?'], 'A = 0 and B = 0');
        } },
        { id: 'e19j', sub: 'j', level: 'PRG', outcome: 'RF5', make: function (r, o) {
          var kc = qT(o.c.k), kf = String(o.f.k);
          return B.fields('State the domain and the range of the relations in (c) and (f).', [fld('(c) domain', 'set', { vars: ['x', 'y'] }), fld('(c) range', 'set', { vars: ['x', 'y'] }), fld('(f) domain', 'set', { vars: ['x', 'y'] }), fld('(f) range', 'set', { vars: ['x', 'y'] })],
            [setOk('\\{' + kc + '\\}', { v: 'x', other: '\\{y\\mid y\\in\\mathbb{R}\\}' }), setOk('\\{y\\mid y\\in\\mathbb{R}\\}', { v: 'y', other: '\\{' + kc + '\\}' }), setOk('\\{x\\mid x\\in\\mathbb{R}\\}', { v: 'x', other: '\\{' + kf + '\\}' }), setOk('\\{' + kf + '\\}', { v: 'y', other: '\\{x\\mid x\\in\\mathbb{R}\\}' })],
            ['\\{' + kc + '\\}', '\\{y\\mid y\\in\\mathbb{R}\\}', '\\{x\\mid x\\in\\mathbb{R}\\}', '\\{' + kf + '\\}'], '(c) ' + t('D=\\{' + kc + '\\},\\ R=\\{y\\mid y\\in\\mathbb{R}\\}') + '; (f) ' + t('D=\\{x\\mid x\\in\\mathbb{R}\\},\\ R=\\{' + kf + '\\}'),
            '(c) ' + t('x=' + kc) + ': every point has ' + t('x=' + kc) + ', and ' + t('y') + ' can be anything: ' + t('D=\\{x\\mid x=' + kc + '\\}') + ', ' + t('R=\\{y\\mid y\\in\\mathbb{R}\\}') + '.<br>(f) ' + t('y=' + kf) + ': ' + t('D=\\{x\\mid x\\in\\mathbb{R}\\}') + ', ' + t('R=\\{y\\mid y=' + kf + '\\}') + '.', ['A vertical line has one ' + t('x') + '-value; a horizontal line has one ' + t('y') + '-value.'], 'domain and range of vertical/horizontal');
        } }] },
    /* ---------------- Q20 ---------------- */
    { num: '20',
      shared: function (r) { var a0 = r.pick([2, 3, 4, 5]), A = [0, 1, 2, 3, 4].map(function (j) { return a0 * Math.pow(2, j); }); return { a0: a0, A: A, avg: 15 * a0 / 8, rs: [0, 1, 2, 3].map(function (j) { return (A[j + 1] - A[j]) / 2; }) }; },   // rs: the four interval rates (kg/week)
      stem: function (o) { return '<b>Average rate against constant rate.</b> Pond A and pond B are both monitored for algae. Pond A’s readings are in the table; pond B grows at a <b>constant</b> rate, starting at ' + t(o.a0) + ' kg at ' + t('t=0') + ' and reaching ' + t(16 * o.a0) + ' kg at ' + t('t=8') + ' weeks.' + HW.valueTable([[t('t') + ' (weeks)'].concat([0, 2, 4, 6, 8].map(function (x) { return t(String(x)); })), ['Pond A, ' + t('M') + ' (kg)'].concat(o.A.map(function (y) { return t(String(y)); }))]); },
      parts: [
        { id: 'e20a', sub: 'a i', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          var rs = [0, 1, 2, 3].map(function (j) { return (o.A[j + 1] - o.A[j]) / 2; });
          return B.fields('Calculate pond A’s rate of change across each of the four intervals.', ['0–2', '2–4', '4–6', '6–8'].map(function (lab) { return { label: lab + ' weeks', after: 'kg/week' }; }), rs.map(function (x) { return K.number(x, function (v) { return v === 2 * x ? { code: 'rate-step', hint: 'Divide the change by the ' + t('2') + ' weeks of the interval.' } : null; }); }), rs.map(String), rs.map(function (x) { return t(x); }).join(', ') + ' kg/week',
            [0, 1, 2, 3].map(function (j) { return t('\\frac{' + o.A[j + 1] + '-' + o.A[j] + '}{2}=' + rs[j]); }).join(', ') + ' (kg/week)', ['Each interval is 2 weeks long.'], 'interval rates');
        } },
        { id: 'e20a2', sub: 'a ii', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          return mc(r, 'Is pond A’s relation linear?', [
            { html: 'No — the time steps are equal but the rates of change are not constant (the mass doubles every two weeks).', right: true },
            { html: 'Yes — the mass increases every interval.', why: 'Increasing isn’t enough: a linear relation increases by the <b>same</b> amount each equal step.' },
            { html: 'Yes — the time values go up by a constant ' + t('2') + '.', why: 'Equal steps in ' + t('t') + ' are needed to compare, but the changes in ' + t('M') + ' must also be equal.' },
            { html: 'No — the table doesn’t start at ' + t('M=0') + '.', why: 'A linear relation can start anywhere. Look at the rates of change.' }],
            'Equal ' + t('t') + '-steps, but the rates ' + t(o.rs.map(numDec).join(',\\ ')) + ' are not equal: pond A is <b>not linear</b>.', ['Are the rates from (a) all the same?'], 'linear from rates');
        } },
        { id: 'e20b', sub: 'b', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          return B.number('Calculate pond A’s <b>average</b> rate of change over the whole eight weeks.', o.avg, function (v) { return Math.abs(v - 15 * o.a0) < 1e-9 ? { code: 'rate-step', hint: 'Divide the change in mass by the ' + t('8') + ' weeks.' } : null; },
            t('\\frac{' + 16 * o.a0 + '-' + o.a0 + '}{8-0}=\\frac{' + 15 * o.a0 + '}{8}=' + numDec(o.avg)) + ': over the eight weeks pond A gained an average of ' + t(numDec(o.avg)) + ' kg of algae per week.', ['Use the first and last readings only.'], 'average rate', { after: 'kg/week' });
        } },
        { id: 'e20c', sub: 'c i', level: 'EMG', outcome: 'RF7', make: function (r, o) {
          return lineP('Write pond B’s model as ' + t('M=mt+b') + '.', { m: Q(15 * o.a0, 8), b: o.a0 }, { vars: ['t', 'M'], form: 'slope-intercept', keyTex: 'M=' + numDec(o.avg) + 't+' + o.a0 },
            t('m=\\frac{' + 16 * o.a0 + '-' + o.a0 + '}{8-0}=' + numDec(o.avg)) + ', ' + t('b=' + o.a0) + ': ' + t('M=' + numDec(o.avg) + 't+' + o.a0) + '. Rate: ' + t(numDec(o.avg)) + ' kg per week.', ['Slope from the two given values; ' + t('b') + ' is the mass at ' + t('t=0') + '.'], 'model pond B');
        } },
        { id: 'e20c2', sub: 'c ii', level: 'EMG', outcome: 'RF6', make: function (r, o) {
          var L = lineMB(Q(15 * o.a0, 8), o.a0);
          return lineP('Write pond B’s model in general form.', L, { vars: ['t', 'M'], form: 'general' }, 'Clear the decimal (fraction ' + t(qT(Q(15 * o.a0, 8))) + ') and move everything to one side: ' + t(gT(L, ['t', 'M'])), ['Multiply every term to clear the fraction, then make the ' + t('t') + '-term positive.'], 'general form pond B');
        } },
        { id: 'e20d', sub: 'd', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          var Bm = o.avg * 4 + o.a0, Am = o.A[2], d = Bm - Am;
          return mc(r, 'The two ponds agree at ' + t('t=0') + ' and at ' + t('t=8') + '. Which holds more algae at ' + t('t=4') + ', and by how much?', [
            { html: 'Pond B, by ' + t(numDec(d)) + ' kg.', right: true }, { html: 'Pond A, by ' + t(numDec(d)) + ' kg.', why: 'Pond A has ' + t(Am) + ' kg (table); pond B has ' + t(numDec(o.avg) + '(4)+' + o.a0 + '=' + numDec(Bm)) + ' kg.' },
            { html: 'They hold the same amount.', why: 'They agree only at the start and the end. Work out pond B at ' + t('t=4') + '.' }, { html: 'Pond B, by ' + t(numDec(Bm)) + ' kg.', why: 'That is pond B’s total. Subtract pond A’s ' + t(Am) + ' kg.' }],
            'Pond A at ' + t('t=4') + ': ' + t(Am) + ' kg. Pond B: ' + t(numDec(o.avg) + '(4)+' + o.a0 + '=' + numDec(Bm)) + ' kg. <b>Pond B</b>, by ' + t(numDec(d)) + ' kg.', ['Evaluate pond B’s model at ' + t('t=4') + '.'], 'compare ponds at t=4');
        } },
        { id: 'e20e', sub: 'e', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          return mc(r, 'Over the whole eight weeks, pond A’s average rate of change is ' + t(numDec(o.avg)) + ' kg/week (from (b)). Did pond A ever actually grow at that average rate?', [
            { html: 'No — its interval rates were ' + t(o.rs.map(numDec).join(',\\ ')) + '; ' + t(numDec(o.avg)) + ' matches none. An average describes the whole interval, not any actual stretch.', right: true },
            { html: 'Yes — the average is one of the interval rates.', why: 'Compare ' + t(numDec(o.avg)) + ' with the four rates from (a).' },
            { html: 'Yes — in the middle of the eight weeks.', why: 'Between weeks 2–4 the rate was ' + t(numDec(o.rs[1])) + ' and between 4–6 it was ' + t(numDec(o.rs[2])) + ' — neither is ' + t(numDec(o.avg)) + '.' },
            { html: 'Yes — an average rate is always reached at some interval.', why: 'Not for these intervals: none of the four rates equals ' + t(numDec(o.avg)) + '.' }],
            '<b>No.</b> The interval rates were ' + t(o.rs.map(numDec).join(',\\ ')) + ' kg/week; ' + t(numDec(o.avg)) + ' matches none of them (it falls between ' + t(numDec(o.rs[1])) + ' and ' + t(numDec(o.rs[2])) + ').', ['Look back at the rates in (a).'], 'average vs actual rate');
        } },
        { id: 'e20f', sub: 'f', level: 'EMG', outcome: 'RF4', make: function (r, o) {
          return B.approx('Express pond B’s rate in kilograms per day, to the nearest hundredth. (Is pond B growing any faster in that wording?)', o.avg / 7, 2, { after: 'kg per day', diag: function (v) { return Math.abs(v - K.roundTo(o.avg * 7, 2)) < 1e-9 ? { code: 'unit-conv', hint: 'A week is 7 days, so the rate per day is smaller: divide by 7.' } : null; } },
            t(numDec(o.avg) + '\\div 7=' + dec(Math.floor(o.avg / 7 * 10000) / 10000) + '\\ldots\\approx ' + K.roundTo(o.avg / 7, 2).toFixed(2)) + ' kg per day. <b>No</b> — same pond, same growth; only the unit of time (and so the number) changed.', ['Divide the weekly rate by 7.'], 'rate per day');
        } }] }
  ];

  HW.defineLesson({
    id: 'u7l7', unit: 7, num: '7', title: 'Equations of Lines Review: Slope, Intercepts, and Perpendicularity', outcome: 'RF7',
    blurb: 'The whole unit on one page: read slope and intercepts from any form, write a line from a graph, two points or a condition, use parallel and perpendicular slopes, graph each form, and model rates of change in context.',
    questions: [
      /* ---------- 1 ---------- */
      { num: '1', section: 'Assignment 7 — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '1', level: 'EMG', outcome: 'RF4', make: function (r) {
          var m, b, L, pts, S, tries = 0;
          var SETS = [[0, 1], [0, 2], [0, 1, 2]], OTHER = [[2], [0], [1, 2], [0, 2, 3], [1], [0, 1, 2, 3], [2, 3], [0, 3], [1, 3]];
          do {
            m = sl(r, [[2, 3], [3, 4], [1, 3], [3, 2], [1, 4], [2, 5], [4, 3]]); b = Q(2 * r.int(-4, 3) + 1, 2);
            var ans = r.int(0, 3); S = ans < 3 ? SETS[ans] : r.pick(OTHER);
            var zero = r.int(0, 3), used = {}, q = m[1]; pts = [];
            for (var j = 0; j < 4; j++) {
              var on = S.indexOf(j) >= 0, x, kind;
              if (j === zero) { x = 0; kind = on ? 'on' : 'flip'; }
              else {
                kind = on ? 'on' : r.pick(['near', 'flip', 'shift']);
                var g = 0; do { x = kind === 'near' ? r.pick([-5, -4, -2, -1, 1, 2, 4, 5, 7]) : q * r.pick([-3, -2, -1, 1, 2, 3]); g++; } while ((used[x] || x === 0 || (kind === 'near' && x % q === 0) || Math.abs(x) > 9) && g < 40);
              }
              used[x] = 1;
              var yt = qa(qm(m, x), b), y;
              if (kind === 'on') y = yt; else if (kind === 'flip') y = qn(yt); else if (kind === 'shift') y = qa(yt, r.pick([1, -1])); else y = Q(Math.round(qv(yt) * 10) + r.pick([2, -2, 3, -3]), 10);
              pts.push({ x: x, y: y, yt: yt, on: on });
            }
            L = lineMB(m, b); tries++;
          } while (tries < 50 && (pts.some(function (p) { return Math.abs(qv(p.y)) > 9.9 || (!p.on && qv(p.y) === qv(p.yt)); }) || Object.keys(pts.map(function (p) { return p.x; }).reduce(function (o, x) { o[x] = 1; return o; }, {})).length < 4));
          var lab = function (j) { return t(W8(j + 1) + ')'); }, show = function (p) { return ptT([p.x, dec(qv(p.y))]); };
          var check = function (p) { return 'at ' + t('x=' + p.x) + ': ' + t('y=' + qT(m) + '(' + p.x + ')' + (qv(b) < 0 ? '-' : '+') + dec(Math.abs(qv(b))) + '=' + (isInt(qm(p.yt, 10)) ? dec(qv(p.yt)) : qT(p.yt))) + (p.on ? ' ✓' : ' ≠ ' + t(dec(qv(p.y)))); };
          var optSets = [[0, 1], [0, 2], [0, 1, 2]], key = function (s) { return s.slice().sort().join(); };
          var opts = [{ html: t('i)') + ' and ' + t('ii)') + ' only' }, { html: t('i)') + ' and ' + t('iii)') + ' only' }, { html: t('i)') + ', ' + t('ii)') + ', and ' + t('iii)') + ' only' }, { html: 'some other combination' }];
          var right = optSets.map(key).indexOf(key(S)); if (right < 0) right = 3;
          opts.forEach(function (o, k) {
            o.right = k === right; if (o.right) return;
            if (k === 3) { o.why = 'One of the first three choices matches exactly. Substitute each point into ' + t('y=' + qT(m) + 'x' + (qv(b) < 0 ? '-' : '+') + dec(Math.abs(qv(b)))) + ' again.'; return; }
            var Sk = optSets[k], j = [0, 1, 2, 3].filter(function (i) { return (Sk.indexOf(i) >= 0) !== pts[i].on; })[0];
            o.why = 'Check ' + lab(j) + ' ' + t(show(pts[j])) + ': ' + check(pts[j]) + ', so it is ' + (pts[j].on ? '' : '<b>not</b> ') + 'on the line.';
          });
          return mc(r, 'Which of these ordered pairs can be found on the graph of the line ' + t(gT(L)) + '?<br>' + pts.map(function (p, j) { return lab(j) + ' ' + t(show(p)); }).join(' &nbsp; '), opts,
            'Solve for ' + t('y') + ': ' + t(sT(L)) + '. Then substitute each ' + t('x') + ':<br>' + pts.map(function (p, j) { return lab(j) + ' ' + check(p); }).join('<br>') + '<br>So the points on the line are ' + (S.length ? S.map(function (j) { return lab(j); }).join(', ') : 'none of them') + '.',
            ['Rearrange to ' + t('y=mx+b') + ' (or substitute each point into the equation): a point is on the line exactly when it makes the equation true.'], 'points on ' + gT(L), true);
        } }] },
      /* ---------- 2 ---------- */
      { num: '2', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '2', level: 'PRG', outcome: 'RF6', make: function (r) {
          var V = r.pick([['a', 'b', 'c', 'm', 'n', 'p'], ['a', 'b', 'c', 'd', 'e', 'f'], ['p', 'q', 'r', 'u', 'v', 'w'], ['A', 'B', 'C', 'D', 'E', 'F']]), par = r.chance(0.7);
          var a = V[0], b = V[1], m = V[3], n = V[4], frac = function (x, y) { return '-\\frac{' + x + '}{' + y + '}'; };
          var o = [{ tex: a + n + '-' + b + m + '=0', id: 'par' }, { tex: a + n + '+' + b + m + '=0', id: 'opp' }, { tex: a + m + '-' + b + n + '=0', id: 'flip' }, { tex: a + m + '+' + b + n + '=0', id: 'perp' }];
          var why = par ? { opp: 'This makes ' + t(frac(a, b) + '=\\frac{' + m + '}{' + n + '}') + ': slopes that are opposites, not equal.', flip: 'This comes from ' + t('\\frac{' + a + '}{' + b + '}=\\frac{' + n + '}{' + m + '}') + '. The slope of ' + t(m + 'x+' + n + 'y+' + V[5] + '=0') + ' is ' + t(frac(m, n)) + ', not ' + t(frac(n, m)) + '.', perp: 'That is the <b>perpendicular</b> condition (the slopes multiply to ' + t('-1') + '). Parallel lines have <b>equal</b> slopes.' }
            : { par: 'That is the <b>parallel</b> condition (equal slopes). Perpendicular slopes multiply to ' + t('-1') + '.', opp: 'This makes the slopes opposites, ' + t(frac(a, b) + '=\\frac{' + m + '}{' + n + '}') + ', not negative reciprocals.', flip: 'Check the sign: ' + t('\\left(' + frac(a, b) + '\\right)\\left(' + frac(m, n) + '\\right)=-1') + ' gives ' + t(a + m + '=-' + b + n) + '.' };
          var right = par ? 'par' : 'perp';
          return mc(r, 'If the lines ' + t(a + 'x+' + b + 'y+' + V[2] + '=0') + ' and ' + t(m + 'x+' + n + 'y+' + V[5] + '=0') + ' are ' + (par ? 'parallel' : 'perpendicular') + ', then', o.map(function (x) { return { html: t(x.tex), right: x.id === right, why: why[x.id] }; }),
            'Slopes: ' + t(a + 'x+' + b + 'y+' + V[2] + '=0\\Rightarrow y=' + frac(a, b) + 'x-\\frac{' + V[2] + '}{' + b + '}') + ' and ' + t(m + 'x+' + n + 'y+' + V[5] + '=0\\Rightarrow y=' + frac(m, n) + 'x-\\frac{' + V[5] + '}{' + n + '}') + '.<br>' +
            (par ? 'Parallel: equal slopes, ' + t(frac(a, b) + '=' + frac(m, n)) + ', so ' + t(a + n + '=' + b + m) + ', i.e. ' + t(a + n + '-' + b + m + '=0') + '.' : 'Perpendicular: ' + t('\\left(' + frac(a, b) + '\\right)\\left(' + frac(m, n) + '\\right)=-1') + ', so ' + t('\\frac{' + a + m + '}{' + b + n + '}=-1') + ', i.e. ' + t(a + m + '+' + b + n + '=0') + '.'),
            ['The slope of ' + t('Ax+By+C=0') + ' is ' + t('-\\frac{A}{B}') + '. Write both slopes, set up the ' + (par ? 'parallel' : 'perpendicular') + ' condition, and cross-multiply.'], (par ? 'parallel' : 'perpendicular') + ' condition, general form', true);
        } }] },
      /* ---------- 3 ---------- */
      { num: '3', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '3', level: 'PRG', outcome: 'RF7', make: function (r) {
          var u, v, s, C, x0, y0, j, p, y1, g = 0;
          do {
            var uv = r.pick([[2, 3], [3, 2], [1, 2], [2, 1], [3, 4], [4, 3], [1, 3], [3, 5], [2, 5]]); u = uv[0]; v = uv[1]; s = r.chance(0.65) ? 1 : -1;
            C = rnz(r, -9, 9); x0 = r.int(3, 12); y0 = r.int(-6, 6); j = r.pick([-3, -2, -1, 1, 2, 3]);
            p = x0 + j * u; y1 = y0 - s * v * j; g++;
          } while ((p < 1 || p > 99 || y1 === y0 || Math.abs(y1) > 15) && g < 200);
          var Lg = L3(u, -s * v, C), m = Q(s * u, v), n = perpS(m), Lp = lineMP(n, [x0, y0]);
          var alt = function (sl2) { return x0 + (y1 - y0) / qv(sl2); };
          var diag = function (val) {
            if (Math.abs(val - alt(m)) < 1e-6) return { code: 'nr-orig-slope', hint: 'That uses the slope of ' + t(gT(Lg)) + ' itself. The new line is <b>perpendicular</b>, so use the negative reciprocal of ' + t(qT(m)) + '.' };
            if (Math.abs(val - alt(qn(n))) < 1e-6) return { code: 'nr-perp-sign', hint: 'Check the sign of the perpendicular slope: the negative reciprocal of ' + t(qT(m)) + ' is ' + t(qT(n)) + '.' };
            if (Math.abs(val - alt(qn(m))) < 1e-6) return { code: 'nr-neg-only', hint: 'Negative reciprocal means <b>flip</b> the fraction <b>and</b> change the sign.' };
            return null;
          };
          return B.nr('The line through ' + t(ptT([x0, y0])) + ' that is perpendicular to the line ' + t(gT(Lg)) + ' also passes through the point ' + t('(p,\\ ' + y1 + ')') + '. The value of ' + t('p') + ' is ____.', p, diag,
            t(gT(Lg)) + ' ⟹ ' + t(sT(Lg)) + ', so ' + t('m=' + qT(m)) + ' and the perpendicular slope is ' + t(qT(n)) + '.<br>Slope–point form through ' + t(ptT([x0, y0])) + ': ' + t(pT(Lp, [x0, y0])) + '.<br>Substitute ' + t('y=' + y1) + ': ' + t((y1 - y0) + '=' + qT(n) + '(x-' + sgnP(x0) + ')') + ' ⟹ ' + t('x-' + sgnP(x0) + '=' + qT(qd(y1 - y0, n))) + ' ⟹ ' + t('p=' + p) + '.<br><b>Check.</b> Slope from ' + t(ptT([x0, y0])) + ' to ' + t(ptT([p, y1])) + ': ' + t('\\frac{' + (y1 - y0) + '}{' + (p - x0) + '}=' + qT(n)) + ' ✓',
            ['Find the slope of the given line (solve for ' + t('y') + '), take its negative reciprocal, write the new line through ' + t(ptT([x0, y0])) + ', then substitute ' + t('y=' + y1) + '.'], 'perp through point, find p');
        } }] },
      /* ---------- 4 ---------- */
      { num: '4', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '4', level: 'EMG', outcome: 'RF7', make: function (r) {
          var P0, P1, L, g = 0, pq, sg;
          do { pq = r.pick([[2, 3], [1, 2], [3, 4], [1, 3], [3, 2], [2, 5], [4, 3]]); sg = r.chance(0.6) ? 1 : -1; P0 = [r.int(-8, -2), r.int(-6, -1)]; P1 = [P0[0] + pq[1], P0[1] + sg * pq[0]]; L = line2(P0, P1); g++; }
          while ((L.C === 0 || Math.abs(P1[0]) > 9 || Math.abs(P1[1]) > 9) && g < 100);
          var m = slopeOf(L), V = [L, { A: L.A, B: L.B, C: -L.C }, { A: L.A, B: -L.B, C: L.C }, { A: L.A, B: -L.B, C: -L.C }];
          var val = function (X, p) { return X.A * p[0] + X.B * p[1] + X.C; };
          var opts = V.map(function (X, k) {
            var o = { html: t(gT(X)), right: k === 0 };
            if (k === 1) o.why = 'Substitute ' + t(ptT(P0)) + ': the left side is ' + t(String(val(X, P0))) + ', not ' + t('0') + '. The slope is right, but the constant has the wrong sign.';
            if (k === 2) o.why = 'This line has slope ' + t(qT(slopeOf(X))) + ', but the slope from the two points is ' + t(qT(m)) + '. Check the sign of the ' + t('y') + '-term.';
            if (k === 3) o.why = 'Both the slope (' + t(qT(slopeOf(X))) + ') and the constant are off. Find the slope from the two points first.';
            return o;
          });
          return mc(r, 'The line passing through the points ' + t(ptT(P0)) + ' and ' + t(ptT(P1)) + ' has equation', opts,
            slopeSteps(P0, P1) + '.<br>' + psSteps(m, P1) + '<br><b>Check.</b> ' + t(genLeft(L).replace(/x/, '(' + P0[0] + ')').replace(/y/, '(' + P0[1] + ')') + '=0') + ' ✓',
            ['Find the slope from the two points, write slope–point form, then rearrange to general form. Or substitute both points into each choice.'], 'two points → general (MC)');
        } }] },
      /* ---------- 5 ---------- */
      { num: '5', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '5', level: 'ADV', outcome: 'RF5', make: function (r) {
          var b, k, a1, a2, g = 0;
          do { b = rnz(r, -9, 9); k = r.int(2, 9); a1 = r.int(2, 9); a2 = r.int(1, 9); g++; } while ((a2 * 1 === a1 * k || Math.abs(b) < 2 || k === Math.abs(b)) && g < 100);
          var L1 = pol([[a1, 'x'], [-1, 'y'], [b, '']]) + '=0', L2 = pol([[a2, 'x'], [-1, 'ky'], [k * b, '']]) + '=0';
          return B.nr('The lines ' + t(L1) + ' and ' + t(L2) + ', where ' + t('k\\in W') + ', intersect on the ' + t('y') + '-axis. The value of ' + t('k') + ' is ____.', k,
            function (v) { if (v === Math.abs(b)) return { code: 'k-yint', hint: 'That is where they meet: ' + t(ptT([0, b])) + '. Now substitute that point into the second equation and solve for ' + t('k') + '.' }; return null; },
            'Two lines meet on the ' + t('y') + '-axis exactly when they share a ' + t('y') + '-intercept.<br>' + t(L1) + ' at ' + t('x=0') + ': ' + t(pol([[-1, 'y'], [b, '']]) + '=0') + ', so ' + t('y=' + b) + ': the shared point is ' + t(ptT([0, b])) + '.<br>' +
            t(a2 + '(0)-k(' + b + ')' + (k * b < 0 ? '' : '+') + (k * b) + '=0') + ' ⟹ ' + t(pol([[-b, 'k']]) + '=' + (-k * b)) + ' ⟹ ' + t('k=' + k) + ' (and ' + t(k + '\\in W') + ').',
            ['Where does a line cross the ' + t('y') + '-axis? Set ' + t('x=0') + ' in the first equation, then put that point into the second.'], 'lines meet on y-axis, find k');
        } }] },
      /* ---------- 6 ---------- */
      { num: '6', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '6', level: 'EMG', outcome: 'RF7', make: function (r) {
          var m = r.pick([2, 3, 4, 5]) * (r.chance(0.7) ? 1 : -1), a = rnz(r, -6, 6), c = rnz(r, -6, 6); if (Math.abs(a) < 2) a = 4;
          var T = L3(1, m, -a), V = [T, L3(1, m, a), L3(m, 1, -m * a), L3(m, 1, m * a)];
          var whys = [null, 'Check the ' + t('x') + '-intercept: set ' + t('y=0') + ' — this line crosses the ' + t('x') + '-axis at ' + t(-a) + ', not ' + t(a) + '.',
            'This line passes through ' + t(ptT([a, 0])) + ' but its slope is ' + t(qT(slopeOf(V[2]))) + ': the opposite of ' + t(m) + ', not the negative <b>reciprocal</b>.', 'Its slope is ' + t(qT(slopeOf(V[3]))) + ' (opposite, not negative reciprocal) and its ' + t('x') + '-intercept is ' + t(-a) + '.'];
          return mc(r, 'Line ' + t('\\ell_1') + ' has equation ' + t('y=' + pol([[m, 'x'], [c, '']])) + ', and line ' + t('\\ell_2') + ' has ' + t('x') + '-intercept ' + t(a) + '. Which equation represents a line perpendicular to ' + t('\\ell_1') + ' with the same ' + t('x') + '-intercept as ' + t('\\ell_2') + '?',
            V.map(function (X, k) { return { html: t(gT(X)), right: k === 0, why: whys[k] }; }),
            t('\\ell_1') + ' has ' + t('m=' + m) + ', so the perpendicular slope is ' + t(qT(perpS(Q(m)))) + ', and the line must pass through ' + t(ptT([a, 0])) + '.<br>' + psSteps(perpS(Q(m)), [a, 0]) + '<br><b>Check.</b> ' + t('y=0') + ' gives ' + t('x=' + a) + ' ✓',
            ['Two facts: the slope is the negative reciprocal of ' + t(m) + ', and the line passes through ' + t(ptT([a, 0])) + '.'], 'perp with given x-intercept (MC)');
        } }] },
      /* ---------- 7 ---------- */
      { num: '7', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '7', level: 'PRG', outcome: 'RF6', make: function (r) {
          var Bc, A, k, s, g = 0, x;
          do { Bc = r.int(2, 9); A = r.int(1, 9); k = r.int(1, 9); s = r.chance(0.75) ? 1 : -1; x = A / (Bc * k); g++; }
          while ((gcd(A, Bc) !== 1 || Math.abs(x * 100 - Math.floor(x * 100) - 0.5) < 1e-9 || x >= 10 || Math.round(x * 100) === 0) && g < 200);
          var As = s * A, Cs = s * Bc * k, slope = Q(-As, Bc), yi = Q(-Cs, Bc);
          return B.approx('The equation of a certain line is ' + t('Ax+' + Bc + 'y+C=0') + '. The line has slope ' + t(qT(slope)) + ' and ' + t('y') + '-intercept ' + t(qT(yi)) + '. The value of ' + t('\\dfrac{A}{C}') + ', to the nearest hundredth, is ____.', As / Cs, 2,
            { nr: true, diag: function (v) { if (Math.abs(v - K.roundTo(Cs / As, 2)) < 1e-9) return { code: 'ac-flip', hint: 'That is ' + t('\\frac{C}{A}') + '. The question asks for ' + t('\\frac{A}{C}') + '.' }; if (Math.abs(v - K.roundTo(As / (-qv(yi)) , 2)) < 1e-9 || Math.abs(v - K.roundTo(As / qv(yi), 2)) < 1e-9) return { code: 'ac-c', hint: 'The ' + t('y') + '-intercept is ' + t('-\\frac{C}{' + Bc + '}') + ', so ' + t('C') + ' is ' + t(Bc) + ' times as big (with the sign changed).' }; return null; } },
            t('Ax+' + Bc + 'y+C=0') + ' ⟹ ' + t(Bc + 'y=-Ax-C') + ' ⟹ ' + t('y=-\\frac{A}{' + Bc + '}x-\\frac{C}{' + Bc + '}') + '.<br>' + t('-\\frac{A}{' + Bc + '}=' + qT(slope)) + ' ⟹ ' + t('A=' + As) + '; ' + t('-\\frac{C}{' + Bc + '}=' + qT(yi)) + ' ⟹ ' + t('C=' + Cs) + '.<br>' + t('\\frac{A}{C}=\\frac{' + As + '}{' + Cs + '}\\approx ' + K.roundTo(As / Cs, 2).toFixed(2)),
            ['Solve ' + t('Ax+' + Bc + 'y+C=0') + ' for ' + t('y') + ': the slope is ' + t('-\\frac{A}{' + Bc + '}') + ' and the ' + t('y') + '-intercept is ' + t('-\\frac{C}{' + Bc + '}') + '.'], 'A/C from slope and intercept');
        } }] },
      /* ---------- 8 ---------- */
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'PRG', outcome: 'RF7', make: function (r) {
          var m, b, x1, g = 0;
          do { m = r.pick([2, 3, 4, 5, 6]) * (r.chance(0.6) ? -1 : 1); b = rnz(r, -25, 25); x1 = r.int(-5, -2); g++; } while ((b % m === 0 || Math.abs(m * (x1 + 6) + b) > 45 || Math.abs(m * x1 + b) > 30) && g < 200);
          var x2 = x1 + 2, P1 = [x1, m * x1 + b], P2 = [x2, m * x2 + b], xp = x2 + 4, yp = m * xp + b, xi = Q(-b, m), c = rnz(r, -6, 6);
          var fl = r.int(0, 3);  // 0 none false, 1: i false, 2: ii false, 3: iii false
          var s1 = fl === 1 ? [xp, yp + m] : [xp, yp], s2 = fl === 2 ? qn(xi) : xi, s3 = fl === 3 ? Q(1, m) : Q(-1, m);
          var st = [t('\\ell_1') + ' passes through ' + t(ptT(s1)) + '.', t('\\ell_1') + ' has an ' + t('x') + '-intercept of ' + t(qT(s2)) + '.', t('\\ell_1') + ' is perpendicular to ' + t('y=' + pol([[s3, 'x'], [c, '']])) + '.'];
          var truth = [fl !== 1, fl !== 2, fl !== 3];
          var expl = [t('x=' + xp) + ': ' + t('y=' + m + '(' + xp + ')' + (b < 0 ? '' : '+') + b + '=' + yp) + (truth[0] ? ' ✓' : ', not ' + t(s1[1])),
            t('y=0') + ': ' + t(pol([[m, 'x']]) + '=' + (-b)) + ', ' + t('x=' + qT(xi)) + (truth[1] ? ' ✓' : ', not ' + t(qT(s2))),
            t(m + '\\times ' + (qv(s3) < 0 ? '\\left(' + qT(s3) + '\\right)' : qT(s3)) + '=' + qT(qm(m, s3))) + (truth[2] ? ' ✓' : ' — not ' + t('-1') + ', so not perpendicular')];
          var combos = [[0, 1], [0, 2], [1, 2], [0, 1, 2]], names = [t('i)') + ' and ' + t('ii)') + ' only', t('i)') + ' and ' + t('iii)') + ' only', t('ii)') + ' and ' + t('iii)') + ' only', t('i)') + ', ' + t('ii)') + ', and ' + t('iii)')];
          var rightIdx = fl === 0 ? 3 : fl === 3 ? 0 : fl === 2 ? 1 : 2;
          var opts = combos.map(function (cmb, k) {
            var o = { html: names[k], right: k === rightIdx }; if (o.right) return o;
            var j = [0, 1, 2].filter(function (i) { return (cmb.indexOf(i) >= 0) !== truth[i]; })[0];
            o.why = 'Check statement ' + t(W8(j + 1) + ')') + ': ' + expl[j] + '.'; return o;
          });
          return mc(r, 'The line ' + t('\\ell_1') + ' passes through ' + t(ptT(P1)) + ' and ' + t(ptT(P2)) + '. Which statements are true?<br>' + st.map(function (s, j) { return t(W8(j + 1) + ')') + ' ' + s; }).join('<br>'), opts,
            slopeSteps(P1, P2) + ', so ' + t(pT(lineMP(m, P1), P1)) + ' ⟹ ' + t('y=' + pol([[m, 'x'], [b, '']])) + '.<br>' + expl.map(function (e, j) { return t(W8(j + 1) + ')') + ' ' + e; }).join('<br>'),
            ['Find the equation of ' + t('\\ell_1') + ' first, then test each statement: substitute the point, set ' + t('y=0') + ', and multiply the slopes.'], 'which statements true (MC)', true);
        } }] },
      /* ---------- 9 ---------- */
      { num: '9', section: 'Written response and practice', stem: function (sh) { return '<i>(Written Response)</i> Consider the points ' + t('P' + ptT(sh.P)) + ', ' + t('Q' + ptT(sh.Qp)) + ', ' + t('R' + ptT(sh.R)) + ' and ' + t('S' + ptT(sh.S)) + '.'; },
        shared: function (r) {
          for (var g = 0; g < 300; g++) {
            var pq = r.pick([[3, 4], [2, 3], [4, 3], [3, 2], [1, 2], [2, 1], [2, 5], [5, 2]]), s = r.chance(0.7) ? 1 : -1, m = Q(s * pq[0], pq[1]);
            var P = [r.int(-6, -2), r.int(-4, 0)], k = r.pick([1, 2]), Qp = [P[0] + k * pq[1], P[1] + k * s * pq[0]];
            var n = perpS(m), b1 = r.int(4, 12), jx = n[1] * r.int(1, 4), S = [jx, qv(qa(qm(n, jx), b1))];
            var R = [r.int(-8, -3), r.int(1, 6)], b2 = qs(R[1], qm(m, R[0]));
            if (Math.abs(Qp[0]) > 9 || Math.abs(Qp[1]) > 9 || S[0] < 3 || S[0] > 10 || !Number.isInteger(S[1]) || Math.abs(S[1]) > 8 || qv(b2) === 0 || qv(b2) === b1) continue;
            var L1 = lineMB(n, b1), L2 = lineMB(m, b2), xs = [qv(xint(L1)), qv(xint(L2)), 0], ys = [b1, qv(b2), 0];
            if (xs.concat(ys).some(function (v) { return Math.abs(v) > 22; })) continue;
            return { m: m, n: n, P: P, Qp: Qp, S: S, R: R, b1: b1, b2: b2, L1: L1, L2: L2, xs: xs, ys: ys };
          }
          var mm = Q(3, 4); return { m: mm, n: Q(-4, 3), P: [-5, -3], Qp: [3, 3], S: [9, -2], R: [-6, 4], b1: 10, b2: Q(17, 2), L1: lineMB(Q(-4, 3), 10), L2: lineMB(mm, Q(17, 2)), xs: [7.5, -34 / 3, 0], ys: [10, 8.5, 0] };
        },
        parts: [
          { id: '9a', sub: 'a', level: 'PRG', outcome: 'RF7', make: function (r, o) {
            return lineP('Determine the equation of the line ' + t('L_1') + ', through ' + t('S') + ' and perpendicular to ' + t('PQ') + '. Write it in slope–intercept form. <span class="muted">(The booklet gives the answer and asks you to show it; here you find it.)</span>', o.L1,
              { form: 'slope-intercept', wrong: [{ is: lineMP(o.m, o.S), code: 'line-parallel', hint: 'That line has the same slope as ' + t('PQ') + ', so it is <b>parallel</b> to ' + t('PQ') + '. ' + t('L_1') + ' is perpendicular: use the negative reciprocal.' }, { is: lineMP(qn(o.n), o.S), code: 'nr-perp-sign', hint: 'You flipped the slope but kept its sign. Negative reciprocal: flip <b>and</b> change the sign.' }] },
              slopeSteps(o.P, o.Qp) + ', so ' + t('m_{L_1}=' + qT(o.n)) + '.<br>' + siSteps(o.n, o.S) + '<br><b>Check.</b> ' + t('S' + ptT(o.S)) + ': ' + t(qT(o.n) + '(' + o.S[0] + ')+' + o.b1 + '=' + o.S[1]) + ' ✓',
              ['Slope of ' + t('PQ') + ' first, then its negative reciprocal, then substitute ' + t('S') + '.'], 'L1 through S perp to PQ');
          } },
          { id: '9b', sub: 'b', level: 'PRG', outcome: 'RF7', make: function (r, o) {
            return lineP('Determine the equation of the line ' + t('L_2') + ', through ' + t('R') + ' and parallel to ' + t('PQ') + '. Give the answer in slope–intercept form.', o.L2,
              { form: 'slope-intercept', wrong: [{ is: lineMP(o.n, o.R), code: 'line-perp-wrong', hint: 'That slope is the negative reciprocal — it makes a line <b>perpendicular</b> to ' + t('PQ') + '. Parallel lines have the <b>same</b> slope.' }] },
              'Parallel to ' + t('PQ') + ' means the same slope, ' + t(qT(o.m)) + ', through ' + t('R' + ptT(o.R)) + ':<br>' + siSteps(o.m, o.R) + '<br><b>Check.</b> ' + t(qT(o.m) + '(' + o.R[0] + ')' + (qv(o.b2) < 0 ? '' : '+') + qT(o.b2) + '=' + o.R[1]) + ' ✓',
              ['Parallel lines have equal slopes. Use slope–point form with ' + t('R') + ', then solve for ' + t('y') + '.'], 'L2 through R parallel to PQ');
          } },
          { id: '9c', sub: 'c', level: 'PRG', outcome: 'RF5', make: function (r, o) {
            var xlo = Math.min.apply(null, o.xs), xhi = Math.max.apply(null, o.xs), ylo = Math.min.apply(null, o.ys), yhi = Math.max.apply(null, o.ys);
            var spx = Math.max(xhi - xlo, 4), spy = Math.max(yhi - ylo, 4), num = K.number;
            var kx = [Math.floor(xlo) - 1, Math.ceil(xhi) + 1, 2], ky = [Math.floor(ylo) - 1, Math.ceil(yhi) + 1, 2];
            var chk = function (resp) {
              var v = (resp || []).map(function (s) { var p = HW.parse.number(s); return p.ok ? p.value : NaN; });
              if (v.length < 6 || v.some(function (z) { return !isFinite(z); })) return form('empty', 'Fill in all six boxes with numbers.');
              if (v[0] >= v[1] || v[3] >= v[4]) return wrong('win-order', 'Each minimum must be less than its maximum.');
              if (v[2] <= 0 || v[5] <= 0) return wrong('win-scale', 'A scale is the gap between tick marks, so it must be positive.');
              var mx = [['the ' + t('x') + '-intercept of ' + t('L_1'), o.xs[0], 0], ['the ' + t('x') + '-intercept of ' + t('L_2'), o.xs[1], 0], ['the ' + t('y') + '-intercept of ' + t('L_1'), o.ys[0], 1], ['the ' + t('y') + '-intercept of ' + t('L_2'), o.ys[1], 1]];
              for (var i = 0; i < mx.length; i++) { var lo = mx[i][2] ? v[3] : v[0], hi = mx[i][2] ? v[4] : v[1]; if (mx[i][1] < lo - 1e-9 || mx[i][1] > hi + 1e-9) return wrong('win-miss', 'Your window misses ' + mx[i][0] + ', at ' + t(mx[i][2] ? 'y' : 'x') + '-value ' + t(dec(Math.round(mx[i][1] * 100) / 100)) + '. Work out all four intercepts first.'); }
              if (v[0] > 0 || v[1] < 0 || v[3] > 0 || v[4] < 0) return wrong('win-miss', 'Both axes must be in the window, so it has to include ' + t('x=0') + ' and ' + t('y=0') + '.');
              if (v[1] - v[0] > 10 * spx || v[4] - v[3] > 10 * spy) return wrong('win-big', 'That window is so large the lines would be squeezed into a corner. Fit it more closely around the intercepts.');
              if ((v[1] - v[0]) / v[2] > 60 || (v[4] - v[3]) / v[5] > 60) return wrong('win-scale', 'With that scale there would be a crowd of tick marks. Choose a scale like ' + t('1') + ', ' + t('2') + ' or ' + t('5') + '.');
              if ((v[1] - v[0]) / v[2] < 1 || (v[4] - v[3]) / v[5] < 1) return wrong('win-scale', 'The scale is bigger than the window itself — there would be no tick marks.');
              return ok();
            };
            var p = B.fields('State a suitable window, ' + t('x:[x_{\\min},x_{\\max},x_{\\text{scl}}],\\ y:[y_{\\min},y_{\\max},y_{\\text{scl}}]') + ', for graphing both lines, ' + t('L_1:\\ ' + sT(o.L1)) + ' and ' + t('L_2:\\ ' + sT(o.L2)) + ', so that the ' + t('x') + '- and ' + t('y') + '-intercepts of each line are visible.',
              [{ label: t('x_{\\min}') }, { label: t('x_{\\max}') }, { label: t('x_{\\text{scl}}') }, { label: t('y_{\\min}') }, { label: t('y_{\\max}') }, { label: t('y_{\\text{scl}}') }], [num(0), num(0), num(0), num(0), num(0), num(0)], kx.concat(ky).map(String),
              'e.g. ' + t('x:[' + kx.join(',') + '],\\ y:[' + ky.join(',') + ']'),
              t('L_1') + ': ' + t('x') + '-int ' + t('0=' + sT(o.L1).slice(2)) + ' ⟹ ' + t('x=' + qT(xint(o.L1))) + '; ' + t('y') + '-int ' + t(o.b1) + '.<br>' + t('L_2') + ': ' + t('x') + '-int ' + t('x=' + qT(xint(o.L2)) + (isInt(xint(o.L2)) ? '' : '\\approx ' + dec(Math.round(qv(xint(o.L2)) * 10) / 10))) + '; ' + t('y') + '-int ' + t(qT(o.b2)) + '.<br>The window must reach from ' + t('x=' + dec(Math.round(xlo * 10) / 10)) + ' to ' + t('x=' + dec(Math.round(xhi * 10) / 10)) + ' and from ' + t('y=' + dec(Math.round(ylo * 10) / 10)) + ' to ' + t('y=' + dec(Math.round(yhi * 10) / 10)) + ', e.g. ' + t('x:[' + kx.join(',') + '],\\ y:[' + ky.join(',') + ']') + '.',
              ['Find all four intercepts (set ' + t('y=0') + ', then ' + t('x=0') + ', in each equation). The window must contain all of them, and both axes.'], 'window for both lines');
            p.check = chk; p.good = [[String(Math.floor(xlo) - 3), String(Math.ceil(xhi) + 3), '1', String(Math.floor(ylo) - 2), String(Math.ceil(yhi) + 4), '1']];
            p.bad = [[String(Math.ceil(xlo) + 1), String(Math.ceil(xhi) + 1), '2', String(Math.floor(ylo) - 1), String(Math.ceil(yhi) + 1), '2'], ['-1000', '1000', '1', '-1000', '1000', '1']];
            return p;
          } }] },
      /* ---------- 10 ---------- */
      { num: '10', stem: 'State the equation of each line in slope–point form, ' + t('y-y_1=m(x-x_1)') + ', and then rewrite it in general form, ' + t('Ax+By+C=0') + '.',
        shared: function (r) {
          var a, b, c, g = 0;
          do { a = { m: Q(r.pick([2, 3, 4, 5]) * (r.chance(0.7) ? -1 : 1)), p: [r.int(1, 6), r.int(-9, -2)] }; g++; } while ((qv(a.m) * a.p[0] === a.p[1] || lineMP(a.m, a.p).C === 0) && g < 50);
          g = 0; do { b = { m: sl(r, [[3, 4], [2, 3], [2, 5], [3, 5], [1, 4], [4, 3], [5, 2]]), p: [r.int(-9, -2), r.int(2, 8)] }; g++; } while ((lineMP(b.m, b.p).C === 0 || b.p[0] % b.m[1] === 0 && r.chance(0.5)) && g < 50);
          g = 0; do { var pq = r.pick([[3, 2], [2, 3], [3, 4], [1, 2], [4, 3], [5, 2]]), k = r.pick([2, 3]); var P1 = [r.int(-5, -1), r.int(-7, -2)]; c = { m: Q(pq[0], pq[1]), P1: P1, P2: [P1[0] + k * pq[1], P1[1] + k * pq[0]] }; g++; } while ((Math.abs(c.P2[0]) > 9 || Math.abs(c.P2[1]) > 9 || lineMP(c.m, c.P1).C === 0) && g < 80);
          return { a: a, b: b, c: c };
        },
        parts: [
          { id: '10a', sub: 'a i', level: 'BEG', outcome: 'RF6', make: function (r, o) {
            var L = lineMP(o.a.m, o.a.p), p = o.a.p;
            return lineP('(a) slope ' + t(qT(o.a.m)) + ', through ' + t(ptT(p)) + ': write the equation in <b>slope–point form</b>.', L, { form: 'point-slope', point: p, wrong: [{ is: lineMP(o.a.m, [-p[0], -p[1]]), code: 'ps-sign', hint: 'In ' + t('y-y_1=m(x-x_1)') + ' the coordinates are <b>subtracted</b>: for ' + t(ptT(p)) + ' write ' + t(pT(L, p).split('=')[0]) + ' on the left.' }] },
              'Substitute ' + t('m=' + qT(o.a.m)) + ' and ' + t('(x_1,\\ y_1)=' + ptT(p)) + ' into ' + t('y-y_1=m(x-x_1)') + ': ' + t(pT(L, p)) + '.', ['Subtracting a negative coordinate gives a plus sign: ' + t('y-(-7)=y+7') + '.'], 'slope-point form from m and point');
          } },
          { id: '10a2', sub: 'a ii', level: 'EMG', outcome: 'RF6', make: function (r, o) {
            var L = lineMP(o.a.m, o.a.p);
            return lineP('(a) slope ' + t(qT(o.a.m)) + ', through ' + t(ptT(o.a.p)) + ': now write it in <b>general form</b>.', L, { form: 'general' }, psSteps(o.a.m, o.a.p) + '<br><b>Check.</b> ' + t(genLeft(L).replace('x', '(' + o.a.p[0] + ')').replace('y', '(' + o.a.p[1] + ')') + '=0') + ' ✓',
              ['Expand the right side, then move every term to the left so the right side is ' + t('0') + '. Make the ' + t('x') + '-term positive.'], 'slope-point → general (integer m)');
          } },
          { id: '10b', sub: 'b i', level: 'BEG', outcome: 'RF6', make: function (r, o) {
            var L = lineMP(o.b.m, o.b.p), p = o.b.p;
            return lineP('(b) slope ' + t(qT(o.b.m)) + ', through ' + t(ptT(p)) + ': write the equation in <b>slope–point form</b>.', L, { form: 'point-slope', point: p, wrong: [{ is: lineMP(o.b.m, [-p[0], -p[1]]), code: 'ps-sign', hint: 'In ' + t('y-y_1=m(x-x_1)') + ' the coordinates are <b>subtracted</b>: for ' + t(ptT(p)) + ' write ' + t(pT(L, p).split('=')[0]) + ' on the left and ' + t('(x' + (p[0] < 0 ? '+' + (-p[0]) : '-' + p[0]) + ')') + ' on the right.' }] },
              'Substitute: ' + t(pT(L, p)) + '.', ['Subtracting a negative coordinate gives a plus sign.'], 'slope-point form, fraction slope');
          } },
          { id: '10b2', sub: 'b ii', level: 'PRG', outcome: 'RF6', make: function (r, o) {
            var L = lineMP(o.b.m, o.b.p);
            return lineP('(b) slope ' + t(qT(o.b.m)) + ', through ' + t(ptT(o.b.p)) + ': now write it in <b>general form</b>.', L, { form: 'general' }, psSteps(o.b.m, o.b.p) + '<br><b>Check.</b> ' + t(genLeft(L).replace('x', '(' + o.b.p[0] + ')').replace('y', '(' + o.b.p[1] + ')') + '=0') + ' ✓',
              ['Multiply both sides by ' + t(o.b.m[1]) + ' to clear the fraction, then move every term to one side.'], 'slope-point → general (fraction m)');
          } },
          { id: '10c', sub: 'c i', level: 'EMG', outcome: 'RF7', make: function (r, o) {
            var L = lineMP(o.c.m, o.c.P1);
            return psAnyP('(c) through ' + t(ptT(o.c.P1)) + ' and ' + t(ptT(o.c.P2)) + ': write the equation in <b>slope–point form</b> (use either point).', L, [o.c.P1, o.c.P2], {},
              slopeSteps(o.c.P1, o.c.P2) + '.<br>Using ' + t(ptT(o.c.P2)) + ': ' + t(pT(L, o.c.P2)) + ' (using ' + t(ptT(o.c.P1)) + ' gives ' + t(pT(L, o.c.P1)) + ' — the same line).',
              ['Find the slope from the two points first, ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + '.'], 'slope-point form from two points');
          } },
          { id: '10c2', sub: 'c ii', level: 'PRG', outcome: 'RF7', make: function (r, o) {
            var L = lineMP(o.c.m, o.c.P1), sub = function (p) { return t(genLeft(L).replace('x', '(' + p[0] + ')').replace('y', '(' + p[1] + ')') + '=0'); };
            return lineP('(c) through ' + t(ptT(o.c.P1)) + ' and ' + t(ptT(o.c.P2)) + ': now write it in <b>general form</b>. (Then check that both points satisfy it.)', L, { form: 'general' },
              psSteps(o.c.m, o.c.P2) + '<br><b>Check.</b> ' + sub(o.c.P1) + ' ✓ and ' + sub(o.c.P2) + ' ✓',
              ['Clear the fraction, move every term to one side, then substitute both points to check.'], 'two points → general');
          } }] },
      /* ---------- 11 ---------- */
      { num: '11', stem: function (o) { return 'Consider the points ' + t('A' + ptT(o.A)) + ', ' + t('B' + ptT(o.B)) + ' and ' + t('C' + ptT(o.C)) + '.'; },
        shared: function (r) {
          for (var g = 0; g < 200; g++) {
            var a = rnz(r, -6, 6), c = rnz(r, -8, 8), d = rnz(r, -6, 6), e = rnz(r, -6, 6);
            if (d === c || e === a || Math.abs(a) === Math.abs(c) || Math.abs(d) === Math.abs(e) || a === d || e === c || Math.abs(a) === Math.abs(e) || Math.abs(c) === Math.abs(d)) continue;
            return { A: [a, c], B: [a, d], C: [e, c] };
          }
          return { A: [-4, 7], B: [-4, -2], C: [3, 7] };
        },
        parts: [
          { id: '11a', sub: 'a', level: 'BEG', outcome: 'RF7', make: function (r, o) {
            return lineP('Determine the equation of the line through ' + t('A') + ' and ' + t('B') + '.', { x: o.A[0] }, { wrong: [{ is: { x: o.A[1] }, code: 'used-x', hint: 'A vertical line is ' + t('x=k') + ', where ' + t('k') + ' is the shared <b>' + t('x') + '-coordinate</b> of the points.' }] },
              t('A') + ' and ' + t('B') + ' share the ' + t('x') + '-coordinate ' + t(o.A[0]) + ', so the line is vertical: ' + t('x=' + o.A[0]) + '.', ['Which coordinate do ' + t('A') + ' and ' + t('B') + ' have in common?'], 'vertical line through A, B');
          } },
          { id: '11b', sub: 'b', level: 'BEG', outcome: 'RF7', make: function (r, o) {
            return lineP('Determine the equation of the line through ' + t('A') + ' and ' + t('C') + '.', { y: o.A[1] }, { wrong: [{ is: { y: o.A[0] }, code: 'used-x', hint: 'A horizontal line is ' + t('y=k') + ', where ' + t('k') + ' is the shared <b>' + t('y') + '-coordinate</b> of the points.' }] },
              t('A') + ' and ' + t('C') + ' share the ' + t('y') + '-coordinate ' + t(o.A[1]) + ', so the line is horizontal: ' + t('y=' + o.A[1]) + '.', ['Which coordinate do ' + t('A') + ' and ' + t('C') + ' have in common?'], 'horizontal line through A, C');
          } },
          { id: '11c', sub: 'c', level: 'BEG', outcome: 'RF5', make: function (r, o) {
            return B.fields('State the slope of each of the two lines (type <b>undefined</b> if the slope is undefined).', [{ label: 'Slope of ' + t('AB'), mode: 'math', keys: 'slope' }, { label: 'Slope of ' + t('AC'), mode: 'math', keys: 'slope' }], [K.slope(null), K.slope(0)], ['\\text{undefined}', '0'],
              t('AB') + ': undefined, ' + t('AC') + ': ' + t('0'), t('AB') + ': run ' + t('=' + o.A[0] + '-' + sgnP(o.B[0]) + '=0') + ', and division by ' + t('0') + ' is undefined, so the slope of ' + t('AB') + ' is <b>undefined</b>.<br>' + t('AC') + ': rise ' + t('=' + o.A[1] + '-' + sgnP(o.C[1]) + '=0') + ', so ' + t('m=\\frac{0}{' + (o.C[0] - o.A[0]) + '}=0') + '.',
              ['A vertical line has run ' + t('0') + '; a horizontal line has rise ' + t('0') + '.'], 'slopes of vertical and horizontal');
          } },
          { id: '11d', sub: 'd', level: 'EMG', outcome: 'RF6', make: function (r, o) {
            return mc(r, 'Explain why one of these two lines cannot be written in the form ' + t('y=mx+b') + '.', [
              { html: t('AB') + ', the vertical line: its slope is undefined, so there is no value of ' + t('m') + ' to substitute. It is written ' + t('x=' + o.A[0]) + ' instead.', right: true },
              { html: t('AC') + ', the horizontal line: its slope is ' + t('0') + ', and ' + t('y=mx+b') + ' cannot have ' + t('m=0') + '.', why: t('m=0') + ' is fine: ' + t('y=0x' + (o.A[1] < 0 ? '' : '+') + o.A[1]) + ' is just ' + t('y=' + o.A[1]) + '. The problem is a slope with <b>no</b> value at all.' },
              { html: t('AB') + ', because it has no ' + t('x') + '-intercept.', why: 'It does have an ' + t('x') + '-intercept, ' + t(ptT([o.A[0], 0])) + '. What it lacks is a numerical slope (and a ' + t('y') + '-intercept).' },
              { html: t('AC') + ', because it has no ' + t('y') + '-intercept.', why: t('AC') + ' crosses the ' + t('y') + '-axis at ' + t(ptT([0, o.A[1]])) + '. Look at the line whose slope is undefined.' }],
              t('AB') + ' is vertical. The form ' + t('y=mx+b') + ' needs a number for ' + t('m') + ', and the slope of a vertical line is undefined, so no such number exists. Every vertical line is written ' + t('x=k') + ' instead.', ['Which slope from (c) has no numerical value?'], 'why vertical isn’t y=mx+b');
          } },
          { id: '11e', sub: 'e', level: 'EMG', outcome: 'RF7', make: function (r, o) {
            return lineP('Determine the equation of the line through ' + t('B') + ' that is parallel to line ' + t('AC') + '.', { y: o.B[1] }, { wrong: [{ is: { y: o.A[1] }, code: 'diag', hint: 'That is line ' + t('AC') + ' itself. The parallel line must pass through ' + t('B' + ptT(o.B)) + '.' }, { is: { x: o.B[0] }, code: 'line-vh', hint: 'That vertical line is <b>perpendicular</b> to ' + t('AC') + '. ' + t('AC') + ' is horizontal, so a parallel line is horizontal too.' }] },
              t('AC') + ' is the horizontal line ' + t('y=' + o.A[1]) + ', so a parallel line is also horizontal. Through ' + t('B' + ptT(o.B)) + ': ' + t('y=' + o.B[1]) + '.', ['Parallel to a horizontal line means horizontal: ' + t('y=k') + '.'], 'parallel to horizontal through B');
          } },
          { id: '11f', sub: 'f', level: 'EMG', outcome: 'RF7', make: function (r, o) {
            return lineP('Determine the equation of the line through ' + t('C') + ' that is perpendicular to line ' + t('AC') + '.', { x: o.C[0] }, { wrong: [{ is: { x: o.A[0] }, code: 'diag', hint: 'That is line ' + t('AB') + ' (through ' + t('A') + '). The perpendicular must pass through ' + t('C' + ptT(o.C)) + '.' }, { is: { y: o.C[1] }, code: 'line-vh', hint: 'That is line ' + t('AC') + ' itself. A line perpendicular to a horizontal line is <b>vertical</b>.' }] },
              t('AC') + ' is horizontal, so a perpendicular line is vertical. Through ' + t('C' + ptT(o.C)) + ': ' + t('x=' + o.C[0]) + '.', ['Perpendicular to a horizontal line means vertical: ' + t('x=k') + '.'], 'perp to horizontal through C');
          } }] },
      /* ---------- 12 ---------- */
      { num: '12', stem: 'Graph each line on the grid, using the method best suited to the form the equation is given in.', parts: [
        { id: '12a', sub: 'a', level: 'BEG', outcome: 'RF6', make: function (r) {
          var m, b, g = 0, xr = [-6, 6], yr = [-6, 6], L;
          do { m = sl(r, [[2, 3], [3, 4], [1, 2], [3, 2], [2, 5], [1, 3], [4, 3]]); if (r.chance(0.7) && m[0] > 0) m = qn(m); b = rnz(r, -4, 5); L = lineMB(m, b); g++; } while ((!okWin(L, xr, yr, 3) || Math.abs(b + m[0]) > 6) && g < 100);
          return graphLine('Graph ' + t(sT(L)) + '.', L, xr, yr, [
            { L: lineMB(qn(m), b), code: 'graph-slope-sign', hint: 'Check the direction: the slope ' + t(qT(m)) + ' is ' + (m[0] < 0 ? 'negative, so the line falls' : 'positive, so the line rises') + ' from left to right.' },
            { L: lineMB(Q(m[1] * (m[0] < 0 ? -1 : 1), Math.abs(m[0])), b), code: 'graph-flip', hint: 'Rise and run are swapped. Slope ' + t(qT(m)) + ': move ' + Math.abs(m[0]) + ' ' + (m[0] < 0 ? 'down' : 'up') + ' for every ' + m[1] + ' right.' },
            { L: lineMP(m, [b, 0]), code: 'graph-b-x', hint: 'The ' + t('b') + ' in ' + t('y=mx+b') + ' is the <b>' + t('y') + '-intercept</b>: start at ' + t(ptT([0, b])) + ' on the ' + t('y') + '-axis.' }],
            'Start at the ' + t('y') + '-intercept ' + t(ptT([0, b])) + '. The slope ' + t(qT(m)) + ' means ' + Math.abs(m[0]) + ' ' + (m[0] < 0 ? 'down' : 'up') + ', ' + m[1] + ' right, to ' + t(ptT([m[1], b + m[0]])) + '. Draw the line through them, with arrows.',
            ['Plot ' + t('b') + ' on the ' + t('y') + '-axis, then use rise over run from there.'], 'graph y = mx + b');
        } },
        { id: '12b', sub: 'b', level: 'PRG', outcome: 'RF6', make: function (r) {
          var a, b, g = 0;
          do { a = rnz(r, -6, 6); b = rnz(r, -6, 6); g++; } while ((Math.abs(a) < 2 || Math.abs(b) < 2 || Math.abs(a) === Math.abs(b)) && g < 100);
          var L = line2([a, 0], [0, b]), xr = [-6, 6], yr = [-6, 6];
          return graphLine('Graph ' + t(gT(L)) + '.', L, xr, yr, [
            { L: line2([b, 0], [0, a]), code: 'graph-int-swap', hint: 'Your intercepts are swapped. Set ' + t('y=0') + ' to find where the line crosses the ' + t('x') + '-axis, and ' + t('x=0') + ' for the ' + t('y') + '-axis.' },
            { L: line2([-a, 0], [0, -b]), code: 'graph-int-sign', hint: 'Check the signs of both intercepts when you solve.' },
            { L: line2([a, 0], [0, -b]), code: 'graph-int-sign', hint: 'Your ' + t('x') + '-intercept is right; check the sign of the ' + t('y') + '-intercept.' },
            { L: line2([-a, 0], [0, b]), code: 'graph-int-sign', hint: 'Your ' + t('y') + '-intercept is right; check the sign of the ' + t('x') + '-intercept.' }],
            'General form → use the intercepts.<br>' + intSteps(L) + '<br>Plot both and draw the line through them, with arrows.', ['Set ' + t('y=0') + ' and solve for ' + t('x') + '; then set ' + t('x=0') + ' and solve for ' + t('y') + '.'], 'graph general form by intercepts');
        } },
        { id: '12c', sub: 'c', level: 'BEG', outcome: 'RF6', make: function (r) {
          var k = rnz(r, -5, 5); if (Math.abs(k) < 2) k = -5;
          var L = L3(1, 0, -k);
          return graphLine('Graph ' + t('x=' + k) + '.', L, [-6, 6], [-6, 6], [
            { L: L3(0, 1, -k), code: 'graph-hv', hint: t('x=' + k) + ' means every point has ' + t('x') + '-coordinate ' + t(k) + ': that is a <b>vertical</b> line.' },
            { L: L3(1, 0, k), code: 'graph-xk', hint: 'Right kind of line — check which side of the ' + t('y') + '-axis ' + t('x=' + k) + ' is on.' }],
            'Every point on ' + t('x=' + k) + ' has ' + t('x') + '-coordinate ' + t(k) + ': a vertical line through ' + t(ptT([k, 0])) + '.', ['Which points have ' + t('x') + '-coordinate ' + t(k) + '?'], 'graph vertical line');
        } }] },
      /* ---------- 13 ---------- */
      { num: '13', stem: function (o) { return 'A hot-air balloon descends at a constant rate. Its height ' + t('h') + ', in metres, is recorded against the time ' + t('t') + ', in minutes, since the descent began.' + HW.valueTable([['Time, ' + t('t') + ' (min)'].concat([0, 1, 2, 3].map(function (j) { return t(String(j * o.dt)); })), ['Height, ' + t('h') + ' (m)'].concat([0, 1, 2, 3].map(function (j) { return t(F(o.h0 - o.r * o.dt * j)); }))]); },
        shared: function (r) {
          for (var g = 0; g < 200; g++) {
            var rr = r.pick([15, 20, 25, 30, 35, 40, 45]), dt = r.pick([2, 3, 4, 5]), h0 = 50 * r.int(20, 36), T = h0 / rr, Tc = r.int(15, Math.floor(T) - 5);
            if (Number.isInteger(T) || Math.abs(T * 10 - Math.floor(T * 10) - 0.5) < 1e-6 || Tc % dt === 0 || Tc < 13) continue;
            return { r: rr, dt: dt, h0: h0, T: T, Tc: Tc };
          }
          return { r: 35, dt: 4, h0: 1450, T: 1450 / 35, Tc: 25 };
        },
        parts: [
          { id: '13a', sub: 'a', level: 'EMG', outcome: 'RF4', make: function (r, o) {
            var d = o.r * o.dt;
            return B.number('Determine the rate of change of height with respect to time.', -o.r, function (v) {
              if (v === o.r) return { code: 'rate-sign', hint: 'The height is going <b>down</b>, so the rate of change is negative.' };
              if (Math.abs(v) === d) return { code: 'rate-step', hint: 'That is the change over ' + t(o.dt) + ' minutes. Divide by the change in time, ' + t(o.dt) + ', to get the change per minute.' };
              if (Math.abs(v - (-1 / o.r)) < 1e-6 || Math.abs(v - 1 / o.r) < 1e-6) return { code: 'rate-units', hint: 'Rate of change of height with respect to time is ' + t('\\frac{\\Delta h}{\\Delta t}') + ' (metres per minute), not the other way round.' };
              return null;
            }, t('\\frac{\\Delta h}{\\Delta t}=\\frac{' + F(o.h0 - d) + '-' + F(o.h0) + '}{' + o.dt + '-0}=\\frac{' + (-d) + '}{' + o.dt + '}=' + (-o.r)) + ' m/min. <b>Check</b> another interval: ' + t('\\frac{' + F(o.h0 - 3 * d) + '-' + F(o.h0 - 2 * d) + '}{' + (3 * o.dt) + '-' + (2 * o.dt) + '}=' + (-o.r)) + ' ✓',
              ['Rate of change = change in height ÷ change in time, between any two columns.'], 'rate from table', { after: 'm/min' });
          } },
          { id: '13a2', sub: 'a, meaning', level: 'PRG', outcome: 'RF4', make: function (r, o) {
            return mc(r, 'What does the rate of change ' + t(-o.r + '\\text{ m/min}') + ' mean in this context?', [
              { html: 'The balloon loses ' + t(o.r) + ' m of height every minute.', right: true },
              { html: 'The balloon is ' + t(o.r) + ' m above the ground.', why: 'A rate describes a <b>change</b> per minute, not a height. The starting height is ' + t(F(o.h0)) + ' m.' },
              { html: 'The balloon takes ' + t(o.r) + ' minutes to descend one metre.', why: 'Check the units: m/min is metres <b>per minute</b>, not minutes per metre.' },
              { html: 'The balloon rises ' + t(o.r) + ' m every minute.', why: 'The negative sign means the height is <b>decreasing</b>.' }],
              'The rate is ' + t(-o.r) + ' metres per minute: the height <b>falls by ' + o.r + ' m every minute</b>.', ['Read the units: metres per minute. What does the negative sign say?'], 'meaning of rate (balloon)');
          } },
          { id: '13b', sub: 'b', level: 'PRG', outcome: 'RF7', make: function (r, o) {
            return lineP('Write an equation for ' + t('h') + ' in terms of ' + t('t') + '.', { m: -o.r, b: o.h0 }, { vars: ['t', 'h'], keyTex: 'h=-' + o.r + 't+' + o.h0, wrong: [{ is: { m: o.r, b: o.h0 }, code: 'line-slope-sign', hint: 'The height decreases, so the slope is ' + t(-o.r) + '.' }, { is: { m: -o.r * o.dt, b: o.h0 }, code: 'rate-step', hint: 'Use the rate <b>per minute</b> as the slope: ' + t(-o.r) + ', not the change over ' + t(o.dt) + ' minutes.' }] },
              'The rate of change is the slope, ' + t(-o.r) + ', and the height at ' + t('t=0') + ' is ' + t(F(o.h0)) + ', the vertical intercept: ' + t('h=-' + o.r + 't+' + F(o.h0)) + '.<br><b>Check.</b> ' + t('t=' + (2 * o.dt)) + ': ' + t('-' + o.r + '(' + (2 * o.dt) + ')+' + F(o.h0) + '=' + F(o.h0 - 2 * o.dt * o.r)) + ' ✓',
              ['Slope = the rate of change from (a); the ' + t('h') + '-intercept is the height when ' + t('t=0') + '.'], 'equation from table (balloon)');
          } },
          { id: '13c', sub: 'c', level: 'EMG', outcome: 'RF4', make: function (r, o) {
            var h = o.h0 - o.r * o.Tc;
            return B.number('Determine the height of the balloon ' + t(o.Tc) + ' minutes into the descent.', h, function (v) { return v === o.h0 + o.r * o.Tc ? { code: 'rate-sign', hint: 'The balloon is descending: subtract ' + t(o.r + '\\times ' + o.Tc) + ' from the starting height.' } : null; },
              t('h=-' + o.r + '(' + o.Tc + ')+' + F(o.h0) + '=' + F(-o.r * o.Tc) + '+' + F(o.h0) + '=' + F(h)) + ' m', ['Substitute ' + t('t=' + o.Tc) + ' into your equation from (b).'], 'evaluate h(t)', { after: 'm' });
          } },
          { id: '13d', sub: 'd', level: 'PRG', outcome: 'RF4', make: function (r, o) {
            return B.approx('Determine, to the nearest tenth of a minute, when the balloon reaches the ground.', o.T, 1, { after: 'min', diag: function (v) { return Math.abs(v - K.roundTo(o.r / o.h0, 1)) < 1e-9 ? { code: 'ground-h', hint: 'Divide the height by the rate: ' + t('t=\\frac{' + F(o.h0) + '}{' + o.r + '}') + '.' } : null; } },
              'The ground is ' + t('h=0') + ': ' + t('0=-' + o.r + 't+' + F(o.h0)) + ' ⟹ ' + t(o.r + 't=' + F(o.h0)) + ' ⟹ ' + t('t=\\frac{' + F(o.h0) + '}{' + o.r + '}=' + dec(Math.floor(o.T * 1000) / 1000) + '\\ldots\\approx ' + K.roundTo(o.T, 1).toFixed(1)) + ' min',
              ['At the ground the height is ' + t('0') + '. Substitute ' + t('h=0') + ' and solve for ' + t('t') + '.'], 'solve h = 0 (balloon)');
          } }] },
      /* ---------- 14 ---------- */
      { num: '14', stem: function (o) {
          var dEnd = Math.min(14, (80 - o.F) / o.rate);
          return 'The graph shows the monthly cost ' + t('C') + ', in dollars, of a cell phone plan against the amount of data used, ' + t('d') + ', in gigabytes.' +
            HW.graph({ x: [0, 14], y: [0, 80], grid: 1, gridY: 5, labelsX: 2, labelsY: 10, unitX: 22, unitY: 3.6, firstQuadrant: true, xName: 'd', yName: 'C', xTitle: 'Data used (GB)', yTitle: 'Monthly cost ($)', max: 360,
              segs: [{ pts: [[0, o.F], [dEnd, o.F + o.rate * dEnd]], start: 'none', end: 'none' }], points: [{ x: 0, y: o.F }, { x: o.k, y: o.F + o.rate * o.k }] });
        },
        shared: function (r) {
          for (var g = 0; g < 200; g++) {
            var Fe = r.pick([15, 20, 25, 30, 35]), rate = r.pick([3, 4, 5, 5, 6]), k = r.int(4, 10);
            if ((rate * k) % 5 !== 0 || Fe + rate * k > 75 || (80 - Fe) / rate < 9) continue;
            return { F: Fe, rate: rate, k: k, dd: r.pick([11.5, 12.5, 13.5, 14.5]) };
          }
          return { F: 25, rate: 5, k: 8, dd: 13.5 };
        },
        parts: [
          { id: '14a', sub: 'a', level: 'EMG', outcome: 'RF5', make: function (r, o) {
            var c2 = o.F + o.rate * o.k;
            return B.number('Determine the slope of the graph, using the two marked points.', o.rate, function (v) {
              if (Math.abs(v - o.k / (c2 - o.F)) < 1e-6) return { code: 'rate-units', hint: 'Slope is rise over run: change in cost ÷ change in data.' };
              if (Math.abs(v - (c2 - o.F) / (o.k * 5)) < 1e-6 || Math.abs(v - o.rate / 5) < 1e-6) return { code: 'diag', hint: 'Read the scale on the cost axis: each grid square is ' + t('\\$5') + ', not ' + t('\\$1') + '.' };
              return null;
            }, 'Two lattice points on the line are ' + t(ptT([0, o.F])) + ' and ' + t(ptT([o.k, c2])) + ': ' + t('m=\\frac{' + c2 + '-' + o.F + '}{' + o.k + '-0}=\\frac{' + (c2 - o.F) + '}{' + o.k + '}=' + o.rate) + ' dollars per GB.',
              ['Read the coordinates of the two marked points carefully — the axes have different scales.'], 'slope from scaled graph', { before: '$', after: 'per GB' });
          } },
          { id: '14a2', sub: 'a, meaning', level: 'PRG', outcome: 'RF5', make: function (r, o) {
            return mc(r, 'Which statement interprets the slope, ' + t('\\$' + o.rate) + ' per GB, in context?', [
              { html: 'Each additional gigabyte of data used adds ' + t('\\$' + o.rate) + ' to the monthly cost.', right: true },
              { html: 'The plan costs ' + t('\\$' + o.rate) + ' per month when no data is used.', why: 'The cost with no data used is the vertical intercept, ' + t('\\$' + o.F) + '. The slope is a change per GB.' },
              { html: 'Each additional dollar buys ' + t(o.rate) + ' GB of data.', why: 'Check the units: dollars <b>per GB</b>, not GB per dollar.' },
              { html: 'The plan includes ' + t(o.rate) + ' GB of data each month.', why: 'The slope is a rate of change (dollars per GB), not an amount of data.' }],
              'The slope is ' + t('\\$' + o.rate) + ' per GB: each extra gigabyte adds ' + t('\\$' + o.rate) + ' to the bill.', ['A slope is a rate: how much the cost changes for each extra GB.'], 'meaning of slope (phone plan)');
          } },
          { id: '14b', sub: 'b', level: 'PRG', outcome: 'RF5', make: function (r, o) {
            return mc(r, 'Interpret the vertical intercept in context.', [
              { html: t('\\$' + o.F) + ' is the fixed monthly charge, paid even in a month with no data used.', right: true },
              { html: t('\\$' + o.F) + ' is the cost of each gigabyte.', why: 'The cost per gigabyte is the slope, ' + t('\\$' + o.rate) + '. The vertical intercept is the cost when ' + t('d=0') + '.' },
              { html: 'The plan allows at most ' + t(o.F) + ' GB per month.', why: 'The vertical axis is cost in dollars, not data.' },
              { html: 'The cost goes up by ' + t('\\$' + o.F) + ' every month.', why: 'The graph is cost against data used, not against time.' }],
              'The line meets the ' + t('C') + '-axis at ' + t('\\$' + o.F) + ': the fixed monthly charge, paid when no data is used (' + t('d=0') + ').', ['The vertical intercept is the value of ' + t('C') + ' when ' + t('d=0') + '.'], 'meaning of intercept (phone plan)');
          } },
          { id: '14c', sub: 'c', level: 'EMG', outcome: 'RF7', make: function (r, o) {
            return lineP('Write an equation for ' + t('C') + ' in terms of ' + t('d') + '.', { m: o.rate, b: o.F }, { vars: ['d', 'C'], wrong: [{ is: { m: o.F, b: o.rate }, code: 'diag', hint: 'Slope and intercept are swapped: the slope (per GB) multiplies ' + t('d') + '; the fixed charge is the constant.' }] },
              t('C=' + o.rate + 'd+' + o.F) + '. <b>Check.</b> ' + t('d=' + o.k) + ': ' + t(o.rate + '(' + o.k + ')+' + o.F + '=' + (o.F + o.rate * o.k)) + ' ✓', ['Use the slope from (a) and the vertical intercept from (b).'], 'equation from graph (phone plan)');
          } },
          { id: '14d', sub: 'd', level: 'EMG', outcome: 'RF4', make: function (r, o) {
            var c = o.F + o.rate * o.dd;
            return B.number('Determine the cost of a month in which ' + t(o.dd) + ' GB of data is used.', c, null, t('C=' + o.rate + '(' + o.dd + ')+' + o.F + '=' + (o.rate * o.dd).toFixed(2) + '+' + o.F + '=' + c.toFixed(2)) + ', so ' + t('\\$' + c.toFixed(2)) + '.', ['Substitute ' + t('d=' + o.dd) + ' into your equation.'], 'evaluate C(d)', { before: '$' });
          } }] },
      /* ---------- 15 ---------- */
      { num: '15', stem: function (o) { return '<i>(Written Response)</i> Marisol is paid a fixed weekly base amount plus a commission that is a fixed percentage of her sales. In a week with ' + t('\\$' + F(o.s1)) + ' in sales she was paid ' + t('\\$' + F(o.p1)) + '; in a week with ' + t('\\$' + F(o.s2)) + ' in sales she was paid ' + t('\\$' + F(o.p2)) + '.'; },
        shared: function (r) {
          for (var g = 0; g < 200; g++) {
            var pc = r.pick([2, 3, 4, 5, 6, 8, 10]), base = 20 * r.int(15, 40), s1 = 500 * r.int(4, 12), s2 = s1 + 500 * r.int(6, 14), st = 100 * r.int(100, 300);
            var p1 = base + pc * s1 / 100, p2 = base + pc * s2 / 100, T = base + pc * st / 100;
            if (!Number.isInteger(p1) || !Number.isInteger(p2) || !Number.isInteger(T) || st <= s2) continue;
            return { pc: pc, base: base, s1: s1, s2: s2, p1: p1, p2: p2, st: st, T: T };
          }
          return { pc: 5, base: 560, s1: 4000, s2: 9500, p1: 760, p2: 1035, st: 18800, T: 1500 };
        },
        parts: [
          { id: '15a', sub: 'a', level: 'PRG', outcome: 'RF7', make: function (r, o) {
            var m = o.pc / 100;
            var p = B.number('Determine her commission rate, expressed as a percentage of sales.', o.pc, function (v) {
              if (Math.abs(v - (o.s2 - o.s1) / (o.p2 - o.p1)) < 1e-6) return { code: 'rate-units', hint: 'The rate is change in pay ÷ change in sales, not the other way round.' };
              if (Math.abs(v - o.p1 / o.s1 * 100) < 1e-6 || Math.abs(v - o.p2 / o.s2 * 100) < 1e-6) return { code: 'diag', hint: 'Pay ÷ sales for one week includes the base amount. Use the <b>change</b> in pay over the <b>change</b> in sales.' };
              return null;
            }, 'Pay is linear in sales, so the commission rate is the slope: ' + t('m=\\frac{' + F(o.p2) + '-' + F(o.p1) + '}{' + F(o.s2) + '-' + F(o.s1) + '}=\\frac{' + F(o.p2 - o.p1) + '}{' + F(o.s2 - o.s1) + '}=' + m) + ' = ' + t(o.pc + '\\%') + '.',
              ['The commission rate is the slope: change in pay ÷ change in sales. Then write it as a percentage.'], 'commission rate from two weeks', { after: '%' });
            var c = p.check; p.check = function (resp) { resp = String(resp == null ? '' : resp).replace(/\s*\\?%\s*$/, ''); var q = HW.parse.number(resp); if (q.ok && Math.abs(q.value - m) < 1e-9) return form('pct-decimal', 'Right rate as a decimal — now write it as a percentage (multiply by ' + t('100') + ').'); return c(resp); };
            return p;
          } },
          { id: '15b', sub: 'b', level: 'PRG', outcome: 'RF7', make: function (r, o) {
            var m = o.pc / 100;
            return B.number('Determine her weekly base amount.', o.base, function (v) { if (Math.abs(v - (o.p1 - o.pc * o.s1)) < 1e-6) return { code: 'pct-as-coef', hint: 'Use the rate as a decimal: ' + t(o.pc + '\\%=' + m) + '.' }; return null; },
              'Substitute ' + t(ptT([F(o.s1), F(o.p1)])) + ' into ' + t('P=' + m + 's+b') + ': ' + t(F(o.p1) + '=' + m + '(' + F(o.s1) + ')+b=' + F(m * o.s1) + '+b') + ' ⟹ ' + t('b=' + F(o.base)) + '.<br><b>Check.</b> ' + t(m + '(' + F(o.s2) + ')+' + F(o.base) + '=' + F(o.p2)) + ' ✓',
              ['Substitute one week’s sales and pay into ' + t('P=ms+b') + ' and solve for ' + t('b') + '.'], 'base amount', { before: '$' });
          } },
          { id: '15c', sub: 'c', level: 'EMG', outcome: 'RF7', make: function (r, o) {
            var m = o.pc / 100;
            return lineP('Write an equation for her weekly pay ' + t('P') + ' in terms of her sales ' + t('s') + '.', { m: m, b: o.base }, { vars: ['s', 'P'], keyTex: 'P=' + m + 's+' + o.base, wrong: [{ is: { m: o.pc, b: o.base }, code: 'pct-as-coef', hint: 'The commission is ' + t(o.pc + '\\%') + ' of sales, so the slope is the decimal ' + t(m) + ', not ' + t(o.pc) + '.' }] },
              t('P=' + m + 's+' + F(o.base)), ['Slope = the commission rate as a decimal; the constant = the base amount.'], 'pay equation');
          } },
          { id: '15d', sub: 'd', level: 'PRG', outcome: 'RF4', make: function (r, o) {
            var m = o.pc / 100;
            return B.number('Determine the sales she needs in order to be paid ' + t('\\$' + F(o.T)) + ' in a week.', o.st, function (v) { if (Math.abs(v - o.T / m) < 1e-6) return { code: 'diag', hint: 'Subtract the base amount first: only ' + t('\\$' + F(o.T - o.base)) + ' comes from commission.' }; if (Math.abs(v - (o.T - o.base) * m) < 1e-6) return { code: 'diag', hint: 'Divide by the rate, don’t multiply: ' + t(m + 's=' + F(o.T - o.base)) + '.' }; return null; },
              t(F(o.T) + '=' + m + 's+' + F(o.base)) + ' ⟹ ' + t(m + 's=' + F(o.T - o.base)) + ' ⟹ ' + t('s=\\frac{' + F(o.T - o.base) + '}{' + m + '}=' + F(o.st)) + ', so ' + t('\\$' + F(o.st)) + ' in sales.<br><b>Check.</b> ' + t(m + '(' + F(o.st) + ')+' + F(o.base) + '=' + F(o.T)) + ' ✓',
              ['Substitute ' + t('P=' + F(o.T)) + ' and solve for ' + t('s') + '.'], 'solve for sales', { before: '$' });
          } }] }
    ],
    extra: EXTRA
  });
})(window);
