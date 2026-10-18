/* Math 10C · Unit 6 · Lesson 4 — Slope Relationships: Collinearity, Parallel and Perpendicular Lines (RF3)
 * Assignment questions 1–25 (u6_L04.tex) and the Lesson 4 Extra Practice (u6_EP04.tex, Parts A–H).
 * Every part is a generator: it keeps the structure of the booklet question (signs, which coordinate is unknown, how
 * big the numbers are, whether the slope is an integer, a fraction, 0 or undefined) and changes the numbers; the
 * booklet's own numbers are one of the possible versions (generators fall back to them).
 * Slopes are typed with the slope keypad (K.slope: fractions, integers, "undefined"); "prove / show / test" items are
 * split into checkable steps (the slopes in a fields box, then the conclusion as multiple choice); "explain" items are
 * multiple choice with misconception hints. Q4 asks for k and then the segment on the graph pad; EP 13(a) plots the
 * five points on the graph pad. Distance and midpoint parts (marked Extension in the booklet) have outcome EXT.
 * Levels: LIM BEG EMG PRG ADV MAS (LEVEL_RUBRIC.md, anchored on u6_test_A RF3 part 1 and part 3). */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, Ln = HW.lines;

  HW.addCodes({
    'double-neg': 'Double negative slip in the slope formula', 'perp-same': 'Gave the original slope for a perpendicular',
    'perp-nosign': 'Reciprocal without changing the sign', 'perp-noflip': 'Changed the sign without taking the reciprocal',
    'par-perp': 'Gave the perpendicular slope for a parallel line', 'k-sign': 'Sign slip solving for k', 'k-no-start': 'Forgot the starting coordinate',
    'k-flip': 'Used run over rise when solving for k', 'k-par-perp': 'Used parallel (equal) slopes instead of perpendicular', 'k-perp-par': 'Used the perpendicular slope instead of an equal one',
    'k-divide': 'Divided instead of multiplying', 'k-multiply': 'Multiplied instead of dividing', 'mid-sub': 'Subtracted coordinates for a midpoint', 'mid-half': 'Didn’t halve the sums (midpoint)',
    'len-no-root': 'Forgot the square root', 'median-vertex': 'Used a vertex instead of the midpoint', 'rate-flip': 'Rate upside down (units flipped)', 'rate-one': 'Used one trip only (cost ÷ distance)',
    'rate-no-run': 'Forgot to divide by the change in distance', 'sum-sq': 'Added instead of squaring', 'area-no-half': 'Forgot the ½ in the area', 'sel-rel': 'Picked a pair with the other relationship', 'sel-none': 'Picked an unrelated pair', 'sel-missing': 'Missed a pair'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function red(p, q) { if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g, q / g]; }
  function frT(p, q) { return Ln.frT(p, q); }
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function near(a, b) { return Math.abs(a - b) < 1e-9; }
  function nT(x) { return String(cl(x)); }
  function nb(x) { x = cl(x); return x < 0 ? '(' + x + ')' : String(x); }
  function ptT(P) { return '(' + nT(P[0]) + ',\\ ' + nT(P[1]) + ')'; }
  function nP(n, P) { return t(n + ptT(P)); }
  function isSq(n) { var s = Math.round(Math.sqrt(n)); return s * s === n; }
  function simp(n) { var k = 1, m = n; for (var f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return [k, m]; }
  function radT(k, m) { return m === 1 ? String(k) : (k === 1 ? '' : k) + '\\sqrt{' + m + '}'; }
  function d2(A, P) { return (P[0] - A[0]) * (P[0] - A[0]) + (P[1] - A[1]) * (P[1] - A[1]); }
  function lenT(A, P) { var s = simp(d2(A, P)); return radT(s[0], s[1]); }
  function gen(r, f, fb) { for (var i = 0; i < 800; i++) { var v = f(r); if (v) return v; } return fb; }
  function inBox(P, b) { return Math.abs(P[0]) <= b && Math.abs(P[1]) <= b; }
  function add(P, v, k) { k = k == null ? 1 : k; return [P[0] + k * v[0], P[1] + k * v[1]]; }
  function sameP(P, Q) { return P[0] === Q[0] && P[1] === Q[1]; }
  function distinct(arr) { for (var i = 0; i < arr.length; i++) for (var j = i + 1; j < arr.length; j++) if (sameP(arr[i], arr[j])) return false; return true; }

  /* slopes as [p, q] (lowest terms, q > 0), null = undefined */
  function slopeOf(A, P) { var dx = P[0] - A[0], dy = P[1] - A[1]; return dx === 0 ? null : red(dy, dx); }
  function sT(s) { return s == null ? '\\text{undefined}' : frT(s[0], s[1]); }
  function sP(s) { var x = sT(s); return s && s[0] < 0 ? '\\left(' + x + '\\right)' : x; }
  function sV(s) { return s == null ? null : s[0] / s[1]; }
  function sEq(a, b) { if (a == null || b == null) return a == null && b == null; return a[0] * b[1] === a[1] * b[0]; }
  function perpOf(s) { if (s == null) return [0, 1]; if (s[0] === 0) return null; return red(-s[1], s[0]); }
  function prodT(a, b) { var pr = red(a[0] * b[0], a[1] * b[1]); return sT(a) + '\\times ' + sP(b) + '=' + frT(pr[0], pr[1]); }
  function okSlope(s, maxD, maxN) { return s && s[0] !== 0 && s[1] <= (maxD || 6) && Math.abs(s[0]) <= (maxN || 8); }
  function calc(A, P, nm) {   // m_{AB} = (yB − yA)/(xB − xA) = dy/dx = reduced
    var dy = P[1] - A[1], dx = P[0] - A[0];
    var s = (nm ? 'm_{' + nm + '}=' : '') + '\\frac{' + nT(P[1]) + '-' + nb(A[1]) + '}{' + nT(P[0]) + '-' + nb(A[0]) + '}=\\frac{' + nT(dy) + '}{' + nT(dx) + '}';
    if (dx === 0) return s + ',\\ \\text{undefined}';
    var f = sT(red(dy, dx)); return f === '\\frac{' + dy + '}{' + dx + '}' ? s : s + '=' + f;
  }
  var SLOPE_HINT = 'Slope ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + ' — subtract in the <b>same order</b> on the top and the bottom.';

  /* ---------------- checkers ---------------- */
  function slopeChk(s, diag) {
    var c = K.slope(s, { diag: diag });
    return function (resp) {
      var r = c(resp);
      if (r.v === 'wrong' && r.code === 'slope-sign') return wrong('slope-sign', 'Check the sign. Subtract in the <b>same order</b> on the top and the bottom, ' + t('\\frac{y_2-y_1}{x_2-x_1}') + ', and watch the double negatives.');
      return r;
    };
  }
  function readSlope(resp) {
    var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').replace(/^\s*m[^=]*=\s*/, '').trim();
    if (/undef/i.test(s)) return { und: true };
    var a = ex.parse(s); if (!a.ok) return null; var v = ex.value(a.ast); return isFinite(v) ? { v: v } : null;
  }
  /* the slope of a line parallel ('par') or perpendicular ('perp') to a line of slope m */
  function relChk(m, rel) {
    var T = rel === 'perp' ? perpOf(m) : m, base = slopeChk(T);
    return function (resp) {
      var r0 = base(resp); if (r0.v !== 'wrong') return r0;
      var R = readSlope(resp);
      if (R && R.v != null && m != null && m[0] !== 0) {
        var mv = sV(m);
        if (rel === 'perp') {
          if (near(R.v, mv)) return wrong('perp-same', 'That is the slope of the given segment itself — a line with that slope would be <b>parallel</b>. Perpendicular slopes are <b>negative reciprocals</b>: flip the fraction and change the sign.');
          if (near(R.v, 1 / mv)) return wrong('perp-nosign', 'You took the reciprocal — now change the sign too. Perpendicular slopes have opposite signs (their product is ' + t('-1') + ').');
          if (near(R.v, -mv)) return wrong('perp-noflip', 'You changed the sign — now take the reciprocal too (flip the fraction). Check: the product of the two slopes must be ' + t('-1') + '.');
        } else if (near(R.v, -1 / mv)) return wrong('par-perp', 'That is the negative reciprocal — the slope of a <b>perpendicular</b> line. Parallel lines have <b>equal</b> slopes.');
      }
      return r0;
    };
  }
  function slopeAns(prompt, s, chk, sol, hints, text, before) {
    var p = B.math(prompt, chk || slopeChk(s), sT(s), sol, hints, text, { keys: 'slope', before: before || t('m='), placeholder: 'e.g. -2/3 or undefined' });
    var bad = [];
    if (s && s[0] !== 0) { bad.push(sT([-s[0], s[1]])); bad.push(sT(red(s[1], s[0]))); } else if (s) bad.push('\\text{undefined}'); else bad.push('0');
    p.bad = bad.filter(function (b) { return b !== sT(s); }); return p;
  }
  function slopeFields(prompt, items, sol, hints, text) {
    var fields = items.map(function (it) { return { label: t('m_{' + it.nm + '}='), mode: 'math', keys: 'slope', placeholder: 'e.g. -2/3' }; });
    var p = B.fields(prompt, fields, items.map(function (it) { return it.chk || slopeChk(it.s); }), items.map(function (it) { return sT(it.s); }),
      t(items.map(function (it) { return 'm_{' + it.nm + '}=' + sT(it.s); }).join(',\\quad ')), sol, hints, text);
    p.bad = [items.map(function (it) { return it.s && it.s[0] ? sT([-it.s[0], it.s[1]]) : '5'; })];
    return p;
  }
  /* a number answer with known wrong values: list = [[value, code, hint], …] */
  function dg(list, target) {
    return function (v) { for (var i = 0; i < list.length; i++) if (list[i][0] != null && isFinite(list[i][0]) && !near(list[i][0], target) && near(v, list[i][0])) return { code: list[i][1], hint: list[i][2] }; return null; };
  }
  function numAns(prompt, val, list, sol, hints, text, before) {   // val number or [p, q]
    var fr = Array.isArray(val) ? red(val[0], val[1]) : [val, 1], tv = fr[0] / fr[1];
    var p = fr[1] === 1 ? B.number(prompt, fr[0], dg(list, tv), sol, hints, text, { before: before }) : B.fraction(prompt, fr, { diag: dg(list, tv), before: before, decimalOk: true }, sol, hints, text);
    p.bad = list.filter(function (x) { return x[0] != null && isFinite(x[0]) && !near(x[0], tv); }).slice(0, 3).map(function (x) { var f = Ln.toFr(x[0]); return fr[1] === 1 ? String(cl(x[0])) : frT(f[0], f[1]); });
    return p;
  }
  function radField(lab) { return { label: t(lab + '='), mode: 'math', keys: 'radical', placeholder: 'e.g. 3√5' }; }
  function radChk(A, P) { var s = simp(d2(A, P)), n = d2(A, P); return K.radical({ k: s[0], n: 2, m: s[1] }, 'mixed', { diag: function (v) { if (near(v, n)) return { code: 'len-no-root', hint: 'That is ' + t('d^{2}') + ' — take the square root, then simplify.' }; return null; } }); }

  /* parallel / perpendicular / neither */
  function relKind(a, b) {
    if (sEq(a, b)) return 'par';
    if ((a == null && b && b[0] === 0) || (b == null && a && a[0] === 0)) return 'perp';
    if (a && b && a[0] * b[0] === -a[1] * b[1]) return 'perp';
    return 'nei';
  }
  function relWhy(a, b, kind) {
    var recip = a && b && a[0] * b[0] === a[1] * b[1];
    return {
      par: { perp: 'Perpendicular slopes multiply to ' + t('-1') + '. Reduce both fractions to lowest terms first — are they equal?', nei: 'Reduce both fractions to lowest terms first, then compare them.' },
      perp: { par: 'Parallel slopes are equal — these aren’t. Multiply them: what do you get?', nei: (a == null || b == null) ? 'A slope of ' + t('0') + ' is a horizontal line and an undefined slope is a vertical line — horizontal and vertical lines meet at right angles.' : 'Multiply the two slopes. A product of ' + t('-1') + ' means perpendicular.' },
      nei: { par: 'Parallel slopes are equal (after reducing) — these aren’t.', perp: recip ? 'They are reciprocals, but with the <b>same sign</b>: the product is ' + t('+1') + ', not ' + t('-1') + '. Perpendicular slopes have opposite signs.' : (a == null || b == null) ? 'A vertical segment is perpendicular only to a horizontal one (slope ' + t('0') + ').' : (a && b && a[0] === 0 || b && b[0] === 0) ? 'A horizontal segment is perpendicular only to a vertical one (undefined slope).' : 'Multiply them: the product isn’t ' + t('-1') + ', so they aren’t perpendicular.' }
    }[kind];
  }
  function relSol(a, b, A, Bt) {
    var kind = relKind(a, b), x = A || sT(a), y = Bt || sT(b);
    if (a == null || b == null) {
      if (kind === 'par') return 'Both slopes are undefined: both segments are vertical, so they are <b>parallel</b>.';
      if (kind === 'perp') return 'One slope is ' + t('0') + ' (horizontal) and the other is undefined (vertical): horizontal and vertical meet at a right angle, so they are <b>perpendicular</b> — the special case where the slopes can’t be multiplied.';
      return 'One segment is vertical (undefined slope) but the other is not horizontal, so they are <b>neither</b> parallel nor perpendicular.';
    }
    if (kind === 'par') return t(x + '=' + sT(a)) + (x !== sT(a) || y !== sT(b) ? ' and ' + t(y + '=' + sT(b)) : '') + ': equal slopes, so the segments are <b>parallel</b>.';
    if (a[0] === 0 && b[0] === 0) return 'Both slopes are ' + t('0') + ': <b>parallel</b>.';
    var pr = red(a[0] * b[0], a[1] * b[1]);
    if (kind === 'perp') return t(sT(a) + '\\times ' + sP(b) + '=' + frT(pr[0], pr[1])) + ', so the segments are <b>perpendicular</b>.';
    return 'The slopes are not equal' + (a[0] === 0 || b[0] === 0 ? ', and a horizontal segment is perpendicular only to a vertical one' : ', and ' + t(sT(a) + '\\times ' + sP(b) + '=' + frT(pr[0], pr[1]) + '\\ne -1')) + ': <b>neither</b>.';
  }
  function relMC(r, prompt, a, b, sol, text, hints) {
    var kind = relKind(a, b), w = relWhy(a, b, kind);
    var opts = [{ id: 'par', html: '<b>Parallel</b>' }, { id: 'perp', html: '<b>Perpendicular</b>' }, { id: 'nei', html: '<b>Neither</b>' }].map(function (o) { return { html: o.html, right: o.id === kind, why: o.id === kind ? null : w[o.id], code: 'said-' + o.id }; });
    return B.mc(r, prompt, opts, sol, hints || ['Parallel: equal slopes. Perpendicular: the product of the slopes is ' + t('-1') + ' (or one horizontal and one vertical).'], text);
  }
  function pick3(r, pool, right) { return r.shuffle(pool.filter(function (x) { return x !== right; })).slice(0, 3); }

  /* ---------------- figures ---------------- */
  function flow(arr) { return '<div style="display:flex;flex-wrap:wrap;gap:4px 18px;margin:6px 0">' + arr.map(function (x) { return '<span>' + t(x) + '</span>'; }).join('') + '</div>'; }
  function graphOf(spec) { return '<div class="fig">' + HW.graph(spec) + '</div>'; }
  function lbl(P, name) { return { x: P[0], y: P[1], label: name }; }

  /* ================= Q1: sign of the slope from a picture ================= */
  var DIRS = { UR: [1, 1, 'pos'], DR: [1, -1, 'neg'], UL: [-1, 1, 'neg'], DL: [-1, -1, 'pos'], R: [1, 0, 'zero'], L: [-1, 0, 'zero'], U: [0, 1, 'und'], D: [0, -1, 'und'] };
  var KIND = { pos: 'positive', neg: 'negative', zero: 'zero', und: 'undefined' };
  function q1Fig(S) {
    var cx = 150, cy = 110, R = 78, s = '';
    S.forEach(function (g) {
      var L = Math.hypot(g.dx, g.dy), ux = g.dx / L, uy = -g.dy / L;
      s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + ux * R).toFixed(1) + '" y2="' + (cy + uy * R).toFixed(1) + '" stroke="#2b3340" stroke-width="2.6" stroke-linecap="round"/>';
      s += '<text x="' + (cx + ux * (R + 15)).toFixed(1) + '" y="' + (cy + uy * (R + 15) + 5).toFixed(1) + '" font-size="15" font-weight="700" text-anchor="middle" fill="#13807a">' + g.n + '</text>';
    });
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="4.5" fill="#2b3340"/>';
    return '<div class="fig"><svg class="fig-svg" viewBox="0 0 300 220" width="100%" style="max-width:300px" role="img" aria-label="six numbered segments starting at a centre dot"><rect width="300" height="220" fill="#fff"/>' + s + '</svg></div>';
  }

  /* ================= Q2: slope from two points ================= */
  function ptsSlope(r, o) {
    return gen(r, function (r) {
      var q = r.pick(o.q), p = r.int(o.p[0], o.p[1]); if (gcd(p, q) !== 1 || (o.nonInt && q === 1)) return null;
      var sg = r.chance(0.75) ? -1 : 1, k = r.pick(o.k), dir = r.chance(0.5) ? 1 : -1;
      var A = [r.int(-o.box, o.box), r.int(-o.box, o.box)], P = [A[0] + dir * k * q, A[1] + dir * sg * k * p];
      if (!inBox(P, o.box) || !A[0] || !A[1] || !P[0] || !P[1] || !o.test(A, P)) return null;
      return { A: A, B: P };
    }, o.fb);
  }
  function slopePtsPart(A, P, an, bn, text) {
    var s = slopeOf(A, P), dx = P[0] - A[0], dy = P[1] - A[1], cand = [];
    if (dx) cand.push((P[1] + A[1]) / dx);
    if (P[0] + A[0]) { cand.push(dy / (P[0] + A[0])); cand.push((P[1] + A[1]) / (P[0] + A[0])); }
    var diag = function (v) { for (var i = 0; i < cand.length; i++) if (near(v, cand[i])) return { code: 'double-neg', hint: 'Careful with the negatives: subtracting a negative coordinate means adding, e.g. ' + t('5-(-3)=5+3=8') + '.' }; return null; };
    var sol = t(calc(A, P, an + bn)) + (s == null ? '<br>Both points have ' + t('x=' + A[0]) + ': the run is ' + t('0') + ', so the segment is vertical and its slope is <b>undefined</b>.' : s[0] === 0 ? '<br>Both points have ' + t('y=' + A[1]) + ': the rise is ' + t('0') + ', so the segment is horizontal (slope ' + t('0') + '), however far apart the points are.' : '');
    var hints = s == null || s[0] === 0 ? ['Compare the coordinates first: which one is the same for both points?', SLOPE_HINT] : [SLOPE_HINT, 'Reduce the fraction and keep the sign in front.'];
    return slopeAns(nP(an, A) + ' and ' + nP(bn, P), s, slopeChk(s, diag), sol, hints, text);
  }

  /* ================= Q4: find k, then draw ================= */
  function segVal(P, Q, e) { return { pts: [], pieces: [{ v: [P, Q], s: e || 'closed', e: e || 'closed' }] }; }
  function q4Shared(r) {
    var a = gen(r, function (r) { var m = r.pick([2, 3]), S = [r.int(1, 4), r.int(1, 5)], dx = r.int(2, 4); var k = S[1] + m * dx; if (S[0] + dx > 8 || k > 12) return null; return { m: [m, 1], S: S, T: [S[0] + dx, k], k: k, dx: dx }; }, { m: [2, 1], S: [3, 5], T: [6, 11], k: 11, dx: 3 });
    var b = gen(r, function (r) { var q = r.pick([2, 3, 4]), p = r.pick([1, 1, 2]), j = r.int(1, 4); if (gcd(p, q) !== 1) return null; var M = [r.int(-2, 3), 0], yL = r.int(-6, -1); M[1] = yL - p * j; var k = M[0] - q * j; if (M[1] < -10 || k < -11 || k > -1 || M[0] === 0) return null; return { m: [-p, q], L: [k, yL], M: M, k: k, j: j, p: p, q: q }; }, { m: [-1, 3], L: [-10, -5], M: [2, -9], k: -10, j: 4, p: 1, q: 3 });
    var c = gen(r, function (r) { var q = r.int(5, 8), p = r.int(1, 3); if (gcd(p, q) !== 1) return null; var U = [r.int(1, 5), r.int(1, 8)], k = U[0] + q; if (k > 13 || U[1] + p > 12) return null; return { m: [p, q], U: U, V: [k, U[1] + p], k: k, p: p, q: q }; }, { m: [3, 8], U: [4, 7], V: [12, 10], k: 12, p: 3, q: 8 });
    return { a: a, b: b, c: c };
  }
  function drawPart(prompt, win, P, Q, wrongPts, sol, text) {
    var I = Object.assign({ grid: 1, labels: 2, mode: 'lines', defaultEnd: 'closed', max: 320 }, win);
    var target = segVal(P, Q), W = [];
    var inWin = function (X) { return X[0] >= win.x[0] && X[0] <= win.x[1] && X[1] >= win.y[0] && X[1] <= win.y[1]; };
    (wrongPts || []).forEach(function (w) { if (inWin(w.Q) && !sameP(w.Q, Q) && !sameP(w.Q, P)) W.push({ is: segVal(P, w.Q), code: w.code, hint: w.hint }); });
    var p = K.P.graph(prompt + ' <span class="muted">(Choose <b>Line</b>, tap one endpoint, then the other, then tap it again to finish.)</span>', I, K.graphExact(target, { wrong: W }), target, sol,
      ['Plot both endpoints first — use your value of ' + t('k') + ' — then join them.', 'A segment stops at its endpoints: solid dots, no arrows.'], text);
    p.bad = [segVal(P, Q, 'arrow')].concat(W.map(function (w) { return w.is; }));
    return p;
  }

  /* ================= Q5 / Q6 / EP1: collinear points ================= */
  function collinear3(r, o) {   // three points on a line: P2 = P1 + a·v, P3 = P2 + c·v
    return gen(r, function (r) {
      var q = r.int(o.q[0], o.q[1]), p = r.int(o.p[0], o.p[1]); if (gcd(p, q) !== 1 || p === q) return null;
      var sg = o.sign || (r.chance(0.6) ? -1 : 1), v = [q, sg * p], a = r.pick(o.a), c = r.pick(o.c); if (a === c && !o.sameOk) return null;
      if (o.noSq && isSq(p * p + q * q)) return null;
      var X = [r.int(o.x0[0], o.x0[1]), r.int(o.y0[0], o.y0[1])], Y = add(X, v, a), Z = add(Y, v, c);
      if (!inBox(Y, o.box) || !inBox(Z, o.box)) return null;
      return { X: X, Y: Y, Z: Z, v: v, a: a, c: c, s: red(v[1], v[0]) };
    }, o.fb);
  }

  /* ================= Q16 / EP11 / EP12 / Q20: triangles ================= */
  function rightTri(r, box, legs) {   // right angle at V: V, V + s(a,b), V + t(−b,a)
    return gen(r, function (r) {
      var a = r.int(1, 4), b = r.int(1, 4), s = r.pick(legs || [1, 2]), u = r.pick(legs || [1, 2]); if (gcd(a, b) !== 1 || a === b) return null;
      var sg = r.chance(0.5) ? 1 : -1, V = [r.int(-box + 2, box - 2), r.int(-box + 2, box - 2)], P = add(V, [sg * s * a, sg * s * b]), Q = add(V, [-sg * u * b, sg * u * a]);
      if (r.chance(0.5)) { var tmp = P; P = Q; Q = tmp; }
      if (!inBox(P, box) || !inBox(Q, box)) return null;
      var sPQ = slopeOf(P, Q); if (!okSlope(sPQ, 9, 12)) return null;
      return { V: V, P: P, Q: Q };
    }, null);
  }
  function plainTri(r, box) {
    return gen(r, function (r) {
      var A = [r.int(-box, box), r.int(-box, box)], P = [r.int(-box, box), r.int(-box, box)], C = [r.int(-box, box), r.int(-box, box)];
      var s1 = slopeOf(A, P), s2 = slopeOf(P, C), s3 = slopeOf(A, C);
      if (![s1, s2, s3].every(function (s) { return okSlope(s, 6, 6); })) return null;
      if (sEq(s1, s2) || relKind(s1, s2) === 'perp' || relKind(s2, s3) === 'perp' || relKind(s1, s3) === 'perp') return null;
      if (d2(A, P) < 10 || d2(P, C) < 10 || d2(A, C) < 10) return null;
      return [A, P, C];
    }, null);
  }

  /* ================= Q13: eight slopes ================= */
  var Q13N = ['AB', 'CD', 'EF', 'GH', 'IJ', 'KL', 'MN', 'PQ'];

  /* ================= Q7 rescue ================= */
  function q7Shared(r) {
    var fb = { P: [-14, 22], A1: [30, 10], A2: [10, 18], B1: [10, -14], B2: [2, -2], truck: false, boat: true };
    return gen(r, function (r) {
      var P = [r.int(-16, -10), r.int(16, 22)], out = r.pick(['boat', 'boat', 'truck', 'truck', 'both', 'neither']);
      function crew(reach) {
        var a = r.int(1, 6), b = r.int(1, 5); if (gcd(a, b) !== 1) return null;
        var w = [a, -b], j = r.int(2, 8), near2 = add(P, w, j); if (!(near2[0] >= -18 && near2[0] <= 33 && near2[1] >= -18 && near2[1] <= 23)) return null;
        var w2 = w;
        if (!reach) { var c = r.int(1, 6), d = r.int(0, 5); if (gcd(c, d) !== 1) return null; w2 = [c, -d]; if (w2[0] * w[1] === w2[1] * w[0]) return null; if (w2[0] * w[0] + w2[1] * w[1] <= 0) return null; var ang = Math.abs(Math.atan2(w2[1], w2[0]) - Math.atan2(w[1], w[0])); if (ang > 0.6) return null; }
        var i = r.int(1, 6), far2 = add(near2, w2, i); if (!(far2[0] >= -18 && far2[0] <= 33 && far2[1] >= -18 && far2[1] <= 23)) return null;
        var s1 = slopeOf(far2, near2), s2 = slopeOf(near2, P); if (!okSlope(s1, 6, 6) || !okSlope(s2, 9, 9)) return null;
        return [far2, near2];
      }
      var tr = crew(out === 'truck' || out === 'both'), bo = crew(out === 'boat' || out === 'both'); if (!tr || !bo) return null;
      if (!distinct([P, tr[0], tr[1], bo[0], bo[1]])) return null;
      var D = function (X, Y) { return Math.hypot(X[0] - Y[0], X[1] - Y[1]); };
      if (D(tr[0], bo[0]) < 8 || D(tr[1], bo[1]) < 8 || D(tr[0], bo[1]) < 8 || D(tr[1], bo[0]) < 8) return null;
      if (Math.abs(tr[1][1] - bo[1][1]) < 6 && Math.abs(tr[1][0] - bo[1][0]) < 14) return null;
      return { P: P, A1: tr[0], A2: tr[1], B1: bo[0], B2: bo[1], truck: out === 'truck' || out === 'both', boat: out === 'boat' || out === 'both' };
    }, fb);
  }
  function q7Fig(s) {
    return graphOf({ x: [-20, 35], y: [-20, 25], grid: 5, labels: 10, unit: 6, max: 380, points: [lbl(s.P, 'P'), lbl(s.A1, 'A₁'), lbl(s.A2, 'A₂'), lbl(s.B1, 'B₁'), lbl(s.B2, 'B₂')] });
  }

  /* ================= quadrilaterals (EP9) ================= */
  var QUAD = { para: 'Parallelogram', rect: 'Rectangle', rhom: 'Rhombus', sq: 'Square', trap: 'Trapezoid' };
  function quad(r, type, box) {
    return gen(r, function (r) {
      var a = r.int(1, 4), b = r.int(-3, 3), u, w, A = [r.int(-box, 0), r.int(-box, 0)];
      if (!b || gcd(a, b) !== 1) return null;
      if (type === 'para') { u = [a * r.int(1, 2), b * r.int(1, 2)]; w = [r.int(-2, 3), r.int(2, 5)]; if (u[0] * w[0] + u[1] * w[1] === 0 || d2([0, 0], u) === d2([0, 0], w)) return null; }
      else if (type === 'rect') { var s = r.int(1, 3), tt = r.int(1, 3); if (s === tt) return null; u = [s * a, s * b]; w = [-tt * b, tt * a]; if (w[1] <= 0) { w = [-w[0], -w[1]]; } }
      else if (type === 'rhom') { var f = r.int(1, 2); u = [f * a, f * b]; w = r.chance(0.5) ? [f * a, -f * b] : [f * Math.abs(b), f * a]; if (Math.abs(a) === Math.abs(b) || u[0] * w[0] + u[1] * w[1] === 0 || (u[0] === w[0] && u[1] === w[1])) return null; if (u[0] * w[1] - u[1] * w[0] === 0) return null; }
      else { u = [2 * a * r.int(1, 2), 2 * b]; w = [r.int(-2, 3), r.int(2, 5)]; if (u[0] * w[1] - u[1] * w[0] === 0) return null; }
      if (u[0] * w[1] - u[1] * w[0] === 0) return null;
      var Bq = add(A, u), C = type === 'trap' ? add(add(A, w), u, 0.5) : add(add(A, u), w), D = add(A, w);
      if (u[0] * w[1] - u[1] * w[0] < 0) { var tmp = Bq; Bq = D; D = tmp; }
      var V = [A, Bq, C, D]; if (!V.every(function (P) { return inBox(P, box) && Number.isInteger(P[0]) && Number.isInteger(P[1]); })) return null;
      var sl = [slopeOf(V[0], V[1]), slopeOf(V[1], V[2]), slopeOf(V[2], V[3]), slopeOf(V[3], V[0])];
      if (!sl.every(function (s) { return s && s[0] !== 0 && s[1] <= 6 && Math.abs(s[0]) <= 6; })) return null;
      // classification sanity
      var par1 = sEq(sl[0], sl[2]), par2 = sEq(sl[1], sl[3]), right = relKind(sl[0], sl[1]) === 'perp', eq = d2(V[0], V[1]) === d2(V[1], V[2]);
      var got = par1 && par2 ? (right ? (eq ? 'sq' : 'rect') : (eq ? 'rhom' : 'para')) : (par1 !== par2 ? 'trap' : 'none');
      if (got !== type) return null;
      if (type === 'trap' && (relKind(sl[0], sl[1]) === 'perp' || relKind(sl[1], sl[2]) === 'perp' || relKind(sl[2], sl[3]) === 'perp' || relKind(sl[3], sl[0]) === 'perp')) return null;
      return { V: V, sl: sl };
    }, null);
  }
  var QFB = { para: [[-7, -2], [-1, -4], [5, 2], [-1, 4]], rect: [[-5, -3], [1, 0], [-1, 4], [-7, 1]], rhom: [[-4, 1], [0, -2], [4, 1], [0, 4]], trap: [[-6, -4], [2, 0], [0, 5], [-4, 3]] };

  HW.defineLesson({
    id: 'u6l4', unit: 6, num: '4', title: 'Slope Relationships: Collinearity, Parallel and Perpendicular Lines', outcome: 'RF3',
    blurb: 'The slope formula, then slope as a test: equal slopes through a shared point mean collinear points, equal slopes mean parallel lines, and slopes that multiply to −1 mean perpendicular lines.',
    questions: [
      /* ---------------- Q1 ---------------- */
      { num: '1', section: 'Assignment — The slope formula', shared: function (r) {
          var dirs = r.shuffle(['UR', 'DR', 'UL', 'DL', r.pick(['R', 'L']), r.pick(['U', 'D'])]);
          return dirs.map(function (d, i) { var D = DIRS[d]; return { n: i + 1, d: d, kind: D[2], dx: D[0] * (D[1] === 0 ? 1 : r.pick([2, 3])), dy: D[1] * (D[0] === 0 ? 1 : r.pick([2, 3, 4])) }; });
        },
        stem: function (S) { return 'Each numbered segment below starts at the centre dot.' + q1Fig(S); },
        parts: [
          { id: '1', level: 'BEG', make: function (r, S) {
            var rows = S.map(function (g) { return { id: 's' + g.n, html: 'Segment ' + g.n }; }), cols = ['pos', 'neg', 'zero', 'und'].map(function (k) { return { id: k, html: KIND[k] }; }), want = {};
            S.forEach(function (g) { want['s' + g.n] = g.kind; });
            var why = function (row) {
              var g = S[Number(row.slice(1)) - 1];
              if (g.kind === 'zero') return 'Segment ' + g.n + ' is horizontal: the rise is ' + t('0') + ', so the slope is ' + t('0') + '.';
              if (g.kind === 'und') return 'Segment ' + g.n + ' is vertical: the run is ' + t('0') + ', and dividing by ' + t('0') + ' is undefined.';
              if (g.dx < 0) return 'Segment ' + g.n + ' goes to the <b>left</b> of the dot. Read slope from <b>left to right</b>: from its left end, the segment goes ' + (g.dy > 0 ? 'down' : 'up') + ' to the dot.';
              return 'Segment ' + g.n + ': read it from left to right — does it go up or down?';
            };
            return B.grid('State whether the slope of each segment is positive, negative, zero, or undefined.', rows, cols, want, { why: why, rowHead: 'Segment' },
              'Read every segment from <b>left to right</b>. ' + S.map(function (g) { return 'Segment ' + g.n + (g.kind === 'zero' ? ' is flat: zero' : g.kind === 'und' ? ' is upright (run ' + t('0') + '): undefined' : g.dx > 0 ? (g.dy > 0 ? ' rises: positive' : ' falls: negative') : (g.dy > 0 ? ' falls as ' + t('x') + ' increases towards the dot: negative' : ' rises as ' + t('x') + ' increases towards the dot: positive')) + '.'; }).join(' '),
              ['Up from left to right: positive. Down from left to right: negative. Flat: zero. Straight up and down: undefined.', 'For segments on the left of the dot, start at their left end and move right, towards the dot.'], 'sign of slope from a picture');
          } }] },
      /* ---------------- Q2 ---------------- */
      { num: '2', stem: 'Use the slope formula to calculate the slope of the line segment with the given endpoints.', parts: [
        { id: '2a', level: 'BEG', make: function (r) { var g = ptsSlope(r, { q: [2, 3, 4, 5, 6], p: [1, 5], k: [2, 3, 4], box: 12, nonInt: true, test: function (A, P) { return A[0] * P[0] < 0 && A[1] * P[1] < 0; }, fb: { A: [10, -3], B: [-2, 5] } }); return slopePtsPart(g.A, g.B, 'A', 'B', 'slope from two points (fraction)'); } },
        { id: '2b', level: 'BEG', make: function (r) { var g = ptsSlope(r, { q: [1], p: [1, 3], k: [4, 5, 6, 7, 8], box: 10, test: function (A, P) { return A[0] * P[0] < 0 && A[1] * P[1] < 0; }, fb: { A: [-5, 2], B: [3, -6] } }); return slopePtsPart(g.A, g.B, 'C', 'D', 'slope from two points (integer)'); } },
        { id: '2c', level: 'EMG', make: function (r) { var g = ptsSlope(r, { q: [3, 4, 5, 6], p: [1, 5], k: [2, 3], box: 18, nonInt: true, test: function (A, P) { return A[0] < 0 && A[1] < 0 && P[0] < 0 && P[1] < 0; }, fb: { A: [-15, -4], B: [-3, -13] } }); return slopePtsPart(g.A, g.B, 'P', 'Q', 'slope, all coordinates negative'); } },
        { id: '2d', level: 'EMG', make: function (r) { var g = ptsSlope(r, { q: [7, 9, 11, 13], p: [2, 12], k: [2], box: 40, nonInt: true, test: function (A, P) { return A[0] * P[0] < 0 && Math.max(Math.abs(A[1]), Math.abs(P[1])) >= 25; }, fb: { A: [14, -33], B: [-8, -15] } }); return slopePtsPart(g.A, g.B, 'S', 'T', 'slope with large numbers'); } },
        { id: '2e', level: 'BEG', make: function (r) { var x = -10 * r.int(1, 8), y1 = 10 * r.int(-5, 1), y2 = y1 + 10 * r.int(2, 7); if (r.chance(0.3)) x = -x; return slopePtsPart([x, y1], [x, y2], 'U', 'V', 'vertical segment: undefined'); } },
        { id: '2f', level: 'BEG', make: function (r) { var y = -r.int(11, 49), x1 = r.int(2, 19), x2 = r.int(100, 499); return slopePtsPart([x1, y], [x2, y], 'K', 'L', 'horizontal segment: zero'); } }] },
      /* ---------------- Q3 ---------------- */
      { num: '3', shared: function (r) {
          return gen(r, function (r) { var f = r.pick([[7, 2], [5, 2], [9, 2], [8, 3], [10, 3], [7, 3], [11, 4], [9, 4]]), j = r.int(3, 9), run = f[1] * j, rise = f[0] * j; if (run < 12 || run > 24) return null; var A = [r.int(1, 5), r.int(2, 9)], Pt = [A[0] + run, A[1] + rise]; if (isSq(run * run + rise * rise)) return null; return { A: A, B: Pt, s: red(rise, run) }; }, { A: [2, 5], B: [20, 68], s: [7, 2] });
        },
        stem: function (s) { return 'A coordinate grid is superimposed on the cross-section of a ski hill. The bottom and the top of a straight path up the hill are ' + t(ptT(s.A)) + ' and ' + t(ptT(s.B)) + ', where the units are metres.'; },
        parts: [
          { id: '3a', level: 'EMG', make: function (r, s) { var v = sV(s.s), exact = s.s[1] === 2 || s.s[1] === 4;
            return slopeAns('(a) Calculate the slope of the path.', s.s, slopeChk(s.s, function (x) { if (Math.abs(x - v) < 0.006) return { code: 'slope', hint: 'That decimal is rounded. Give the exact slope as a fraction in lowest terms.' }; return null; }), t(calc(s.A, s.B)) + ' (the path rises ' + t(sT(s.s) + (exact ? '=' : '\\approx ') + (exact ? nT(v) : v.toFixed(2))) + ' m for every metre across).', [SLOPE_HINT, 'Reduce the fraction to lowest terms.'], 'slope of a ski path'); } },
          { id: '3b', level: 'BEG', outcome: 'EXT', make: function (r, s) {
            var M = [(s.A[0] + s.B[0]) / 2, (s.A[1] + s.B[1]) / 2], base = K.pairs([[M[0], M[1]]]), sub = K.pairs([[(s.B[0] - s.A[0]) / 2, (s.B[1] - s.A[1]) / 2]]), sum = K.pairs([[s.A[0] + s.B[0], s.A[1] + s.B[1]]]);
            var chk = function (resp) { var a = base(resp); if (a.v !== 'wrong') return a; if (sub(resp).v === 'correct') return wrong('mid-sub', 'For a midpoint, <b>add</b> the coordinates and then halve them: ' + t('\\left(\\frac{x_1+x_2}{2},\\ \\frac{y_1+y_2}{2}\\right)') + '.'); if (sum(resp).v === 'correct') return wrong('mid-half', 'You added the coordinates — now divide each sum by ' + t('2') + '.'); return a; };
            var p = B.math('(b) <i>(Extension)</i> Calculate the coordinates of the midpoint of the path.', chk, '(' + nT(M[0]) + ', ' + nT(M[1]) + ')', t('\\left(\\frac{' + s.A[0] + '+' + s.B[0] + '}{2},\\ \\frac{' + s.A[1] + '+' + s.B[1] + '}{2}\\right)=' + ptT(M)), ['Midpoint: average the ' + t('x') + '-coordinates and average the ' + t('y') + '-coordinates.'], 'midpoint of the path', { keys: 'pairs', placeholder: 'e.g. (3, 4.5)' });
            p.bad = ['(' + (s.A[0] + s.B[0]) + ', ' + (s.A[1] + s.B[1]) + ')', '(' + nT((s.B[0] - s.A[0]) / 2) + ', ' + nT((s.B[1] - s.A[1]) / 2) + ')']; return p;
          } },
          { id: '3c', level: 'EMG', outcome: 'EXT', make: function (r, s) {
            var dx = s.B[0] - s.A[0], dy = s.B[1] - s.A[1], n = dx * dx + dy * dy, d = Math.sqrt(n);
            return B.approx('(c) <i>(Extension)</i> Calculate the length of the path, to the nearest tenth of a metre.', d, 1, { after: ' m', diag: function (v) { if (near(v, n)) return { code: 'len-no-root', hint: 'That is ' + t('d^{2}') + ' — take the square root.' }; if (near(v, dx + dy) || near(v, K.roundTo(Math.sqrt(dx + dy), 1))) return { code: 'sum-sq', hint: 'Square the run and the rise <b>before</b> adding: ' + t('d=\\sqrt{(\\Delta x)^{2}+(\\Delta y)^{2}}') + '.' }; return null; } },
              t('d=\\sqrt{(' + s.B[0] + '-' + s.A[0] + ')^{2}+(' + s.B[1] + '-' + s.A[1] + ')^{2}}=\\sqrt{' + dx + '^{2}+' + dy + '^{2}}=\\sqrt{' + n + '}\\approx ' + K.roundTo(d, 1).toFixed(1)) + ' m', ['Distance formula: ' + t('d=\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}') + '.'], 'length of the path');
          } }] },
      /* ---------------- Q4 ---------------- */
      { num: '4', shared: q4Shared, stem: 'The line segment joining each pair of points has the given slope. Determine the value of ' + t('k') + ' in each case, and draw the line segment on the grid.', parts: [
        { id: '4a', sub: 'a i', level: 'EMG', make: function (r, s) { var a = s.a, m = a.m[0];
          return numAns(nP('S', a.S) + ', ' + t('T(' + a.T[0] + ',\\ k)') + '; ' + t('m=' + m) + '. Find ' + t('k') + '.', a.k, [[a.S[1] - m * a.dx, 'k-sign', 'The slope is positive, so ' + t('T') + ' is <b>higher</b> than ' + t('S') + '. Check your signs when you solve.'], [m * a.dx, 'k-no-start', 'You found the rise (' + t(m * a.dx) + ') — now add it to the starting height ' + t(a.S[1]) + '.'], [a.S[1] + a.dx / m, 'k-flip', 'Slope is rise ÷ run: the rise is the slope times the run.']],
            t('\\frac{k-' + a.S[1] + '}{' + a.T[0] + '-' + a.S[0] + '}=' + m + '\\ \\Rightarrow\\ k-' + a.S[1] + '=' + m * a.dx + '\\ \\Rightarrow\\ k=' + a.k) + ', so ' + nP('T', a.T) + '.', ['Write the slope formula with ' + t('k') + ' in it and set it equal to ' + t(m) + '.', 'Multiply both sides by the run, then solve.'], 'find k (unknown y, integer slope)', t('k='));
        } },
        { id: '4a2', sub: 'a ii', level: 'BEG', make: function (r, s) { var a = s.a;
          return drawPart('Draw segment ' + t('ST') + ' for ' + nP('S', a.S) + ', ' + t('T(' + a.T[0] + ',\\ k)') + ', ' + t('m=' + a.m[0]) + '.', { x: [0, 8], y: [0, 12], firstQuadrant: true }, a.S, a.T, [{ Q: [a.T[0], a.S[1] - a.m[0] * a.dx], code: 'k-sign', hint: 'Check ' + t('k') + ': a positive slope means ' + t('T') + ' is higher than ' + t('S') + '.' }],
            'With ' + t('k=' + a.k) + ': join ' + nP('S', a.S) + ' to ' + nP('T', a.T) + ' (solid dots at both ends). Check: from ' + t('S') + ', run ' + t(a.dx) + ', rise ' + t(a.m[0] * a.dx) + '.', 'draw segment ST');
        } },
        { id: '4b', sub: 'b i', level: 'PRG', make: function (r, s) { var b = s.b, dy = b.M[1] - b.L[1];
          return numAns(t('L(k,\\ ' + b.L[1] + ')') + ', ' + nP('M', b.M) + '; ' + t('m=' + sT(b.m)) + '. Find ' + t('k') + '.', b.k, [[b.M[0] + b.q * b.j, 'k-sign', 'The slope is negative and ' + t('M') + ' is lower than ' + t('L') + ', so ' + t('L') + ' must be to the <b>left</b> of ' + t('M') + '. Check the signs as you solve.'], [-b.q * b.j, 'k-no-start', 'You found the run (' + t(b.q * b.j) + '). The run is ' + t(b.M[0] + '-k') + ', not ' + t('k') + ' itself.']],
            t('\\frac{' + b.M[1] + '-' + nb(b.L[1]) + '}{' + b.M[0] + '-k}=' + sT(b.m) + '\\ \\Rightarrow\\ \\frac{' + dy + '}{' + b.M[0] + '-k}=' + sT(b.m) + '\\ \\Rightarrow\\ ' + b.M[0] + '-k=' + (b.q * b.j) + '\\ \\Rightarrow\\ k=' + b.k) + ', so ' + nP('L', b.L) + '.', ['Put ' + t('k') + ' into the slope formula: ' + t('\\frac{y_M-y_L}{x_M-k}') + '.', 'Cross-multiply, then solve for ' + t('k') + '.'], 'find k (unknown x, negative fraction slope)', t('k='));
        } },
        { id: '4b2', sub: 'b ii', level: 'BEG', make: function (r, s) { var b = s.b;
          return drawPart('Draw segment ' + t('LM') + ' for ' + t('L(k,\\ ' + b.L[1] + ')') + ', ' + nP('M', b.M) + ', ' + t('m=' + sT(b.m)) + '.', { x: [-11, 3], y: [-10, 1] }, b.L, b.M, [{ Q: [b.M[0] + b.q * b.j, b.L[1]], code: 'k-sign', hint: 'Check ' + t('k') + ': with a negative slope, the higher point ' + t('L') + ' is on the left.' }],
            'With ' + t('k=' + b.k) + ': join ' + nP('L', b.L) + ' to ' + nP('M', b.M) + '. Check: from ' + t('L') + ', run ' + t(b.q * b.j) + ', rise ' + t(b.M[1] - b.L[1]) + '.', 'draw segment LM');
        } },
        { id: '4c', sub: 'c i', level: 'PRG', make: function (r, s) { var c = s.c;
          return numAns(nP('U', c.U) + ', ' + t('V(k,\\ ' + c.V[1] + ')') + '; ' + t('m=' + sT(c.m)) + '. Find ' + t('k') + '.', c.k, [[c.U[0] - c.q, 'k-sign', 'The slope is positive and ' + t('V') + ' is higher, so ' + t('V') + ' is to the <b>right</b> of ' + t('U') + '.'], [c.q, 'k-no-start', 'You found the run (' + t(c.q) + ') — the run is ' + t('k-' + c.U[0]) + ', so add ' + t(c.U[0]) + '.']],
            t('\\frac{' + c.V[1] + '-' + c.U[1] + '}{k-' + c.U[0] + '}=' + sT(c.m) + '\\ \\Rightarrow\\ \\frac{' + c.p + '}{k-' + c.U[0] + '}=' + sT(c.m) + '\\ \\Rightarrow\\ k-' + c.U[0] + '=' + c.q + '\\ \\Rightarrow\\ k=' + c.k) + ', so ' + nP('V', c.V) + '.', ['The rise is ' + t(c.V[1] + '-' + c.U[1] + '=' + c.p) + '. What run gives slope ' + t(sT(c.m)) + '?'], 'find k (unknown x, fraction slope)', t('k='));
        } },
        { id: '4c2', sub: 'c ii', level: 'BEG', make: function (r, s) { var c = s.c;
          return drawPart('Draw segment ' + t('UV') + ' for ' + nP('U', c.U) + ', ' + t('V(k,\\ ' + c.V[1] + ')') + ', ' + t('m=' + sT(c.m)) + '.', { x: [0, 13], y: [0, 12], firstQuadrant: true }, c.U, c.V, [{ Q: [c.U[0] - c.q, c.V[1]], code: 'k-sign', hint: 'Check ' + t('k') + ': a positive slope means the higher point ' + t('V') + ' is to the right.' }],
            'With ' + t('k=' + c.k) + ': join ' + nP('U', c.U) + ' to ' + nP('V', c.V) + '. Check: run ' + t(c.q) + ', rise ' + t(c.p) + '.', 'draw segment UV');
        } }] },
      /* ---------------- Q5 ---------------- */
      { num: '5', section: 'Collinear points', shared: function (r) { return collinear3(r, { q: [3, 8], p: [1, 7], a: [1], c: [2], x0: [-12, -5], y0: [-8, 16], box: 18, noSq: true, fb: { X: [-10, 15], Y: [-3, 12], Z: [11, 6], v: [7, -3], a: 1, c: 2, s: [-3, 7] } }); },
        stem: function (s) { return 'Consider the points ' + nP('X', s.X) + ', ' + nP('Y', s.Y) + ' and ' + nP('Z', s.Z) + '.'; },
        parts: [
          { id: '5a', sub: 'a i', level: 'PRG', make: function (r, s) { return slopeFields('Use the slope formula to prove that ' + t('X') + ', ' + t('Y') + ' and ' + t('Z') + ' are collinear: find ' + t('m_{XY}') + ' and ' + t('m_{YZ}') + '.', [{ nm: 'XY', s: s.s }, { nm: 'YZ', s: s.s }], t(calc(s.X, s.Y, 'XY')) + '<br>' + t(calc(s.Y, s.Z, 'YZ')) + '<br>' + t('m_{XY}=m_{YZ}') + ' and the two segments share the point ' + t('Y') + ', so ' + t('X') + ', ' + t('Y') + ', ' + t('Z') + ' are collinear.', [SLOPE_HINT], 'collinear: two slopes'); } },
          { id: '5a2', sub: 'a ii', level: 'EMG', make: function (r, s) {
            return B.mc(r, 'The slopes are ' + t('m_{XY}=' + sT(slopeOf(s.X, s.Y))) + ' and ' + t('m_{YZ}=' + sT(slopeOf(s.Y, s.Z))) + '. Why do these two slopes prove that the three points are collinear?', [
              { html: 'The slopes are equal <b>and</b> the two segments share the point ' + t('Y') + ', so they lie on one line.', right: true },
              { html: 'The slopes are equal — equal slopes always mean the points are on one line.', why: 'Equal slopes alone only prove the segments are <b>parallel</b>. They are on one line because they also share a point.' },
              { html: 'The product of the two slopes is ' + t('-1') + '.', why: 'Multiply them: the product isn’t ' + t('-1') + ' — and ' + t('-1') + ' is the test for perpendicular, not collinear.' },
              { html: 'The lengths ' + t('XY') + ' and ' + t('YZ') + ' are equal.', why: 'Slopes say nothing about lengths — and the lengths here aren’t even equal. What two facts about the segments ' + t('XY') + ' and ' + t('YZ') + ' put them on one line?' }],
              'Two segments with equal slopes are parallel; if they also share an endpoint (' + t('Y') + '), they must lie on the same line. So ' + t('X') + ', ' + t('Y') + ', ' + t('Z') + ' are collinear.', ['Two parallel segments can be side by side. What stops that here?'], 'why equal slopes prove collinear');
          } },
          { id: '5b', sub: 'b', level: 'PRG', outcome: 'EXT', make: function (r, s) {
            var p = B.fields('(b) <i>(Extension)</i> Use the distance formula to prove that ' + t('X') + ', ' + t('Y') + ' and ' + t('Z') + ' are collinear: find the exact lengths (simplest radical form).', [radField('XY'), radField('YZ'), radField('XZ')], [radChk(s.X, s.Y), radChk(s.Y, s.Z), radChk(s.X, s.Z)], [lenT(s.X, s.Y), lenT(s.Y, s.Z), lenT(s.X, s.Z)],
              t('XY=' + lenT(s.X, s.Y) + ',\\ YZ=' + lenT(s.Y, s.Z) + ',\\ XZ=' + lenT(s.X, s.Z)),
              t('XY=\\sqrt{' + (s.Y[0] - s.X[0]) + '^{2}+' + nb(s.Y[1] - s.X[1]) + '^{2}}=' + lenT(s.X, s.Y)) + '<br>' + t('YZ=\\sqrt{' + (s.Z[0] - s.Y[0]) + '^{2}+' + nb(s.Z[1] - s.Y[1]) + '^{2}}=\\sqrt{' + d2(s.Y, s.Z) + '}=' + lenT(s.Y, s.Z)) + '<br>' + t('XZ=\\sqrt{' + (s.Z[0] - s.X[0]) + '^{2}+' + nb(s.Z[1] - s.X[1]) + '^{2}}=\\sqrt{' + d2(s.X, s.Z) + '}=' + lenT(s.X, s.Z)) + '<br>' + t('XY+YZ=' + lenT(s.X, s.Y) + '+' + lenT(s.Y, s.Z) + '=' + lenT(s.X, s.Z) + '=XZ') + ', so the points lie on one straight line, with ' + t('Y') + ' between ' + t('X') + ' and ' + t('Z') + '.',
              ['Distance formula: ' + t('d=\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}') + ', then simplify the radical.'], 'collinear by distances');
            p.bad = [[String(d2(s.X, s.Y)), lenT(s.Y, s.Z), lenT(s.X, s.Z)]]; return p;
          } }] },
      /* ---------------- Q6 ---------------- */
      { num: '6', shared: function (r) {
          return gen(r, function (r) {
            var q = r.int(2, 5), p = r.int(1, q - 1); if (gcd(p, q) !== 1) return null;
            var a = r.int(2, 6), c = r.int(2, 8); if (a === c) return null;
            var A = [r.int(-12, -4), r.int(-8, 4)], v = [q, p], Bp = add(A, v, a), C = add(Bp, v, c);
            if (!inBox(C, 20) || C[0] <= 0) return null;
            var kn = q * A[1] - p * A[0], kd = q - p; if (kn % kd) return null; var k = kn / kd; if (!(k > A[0] && k < C[0])) return null;
            var E = [k, k]; if (sameP(E, A) || sameP(E, Bp) || sameP(E, C)) return null;
            var j = r.int(1, a + c - 1); if (j === a) return null; var on = r.chance(0.35), D = [A[0] + q * j, A[1] + p * j + (on ? 0 : r.pick([-2, -1, 1, 2]))];
            if (sameP(D, E)) return null; var sD = slopeOf(A, D); if (!sD) return null;
            return { A: A, B: Bp, C: C, s: [p, q], k: k, D: D, on: on, sD: sD };
          }, { A: [-10, -1], B: [2, 5], C: [18, 13], s: [1, 2], k: 8, D: [6, 9], on: false, sD: [5, 8] });
        },
        stem: function (s) { return 'Consider the points ' + nP('A', s.A) + ', ' + nP('B', s.B) + ' and ' + nP('C', s.C) + '.'; },
        parts: [
          { id: '6a', level: 'PRG', make: function (r, s) { return slopeFields('(a) Prove that ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' are collinear: find ' + t('m_{AB}') + ' and ' + t('m_{BC}') + '.', [{ nm: 'AB', s: s.s }, { nm: 'BC', s: s.s }], t(calc(s.A, s.B, 'AB')) + '<br>' + t(calc(s.B, s.C, 'BC')) + '<br>Equal slopes through the shared point ' + t('B') + ', so ' + t('A') + ', ' + t('B') + ', ' + t('C') + ' are collinear.', [SLOPE_HINT, 'Reduce each fraction before comparing.'], 'collinear: two slopes'); } },
          { id: '6b', level: 'EMG', make: function (r, s) {
            var sAC = sT(s.s), sAD = sT(s.sD), opts = s.on ? [
              { html: '<b>Yes</b> — ' + t('m_{AD}=' + sAC + '=m_{AC}') + ', and ' + t('D') + ' is between ' + t('A') + ' and ' + t('C') + '.', right: true },
              { html: '<b>No</b> — ' + t('m_{AD}\\ne m_{AC}') + '.', why: 'Calculate ' + t('m_{AD}=\\frac{y_D-y_A}{x_D-x_A}') + ' carefully and reduce it.' },
              { html: '<b>No</b> — ' + t('m_{AD}\\times m_{AC}\\ne -1') + '.', why: 'A product of ' + t('-1') + ' is the test for <b>perpendicular</b>. To be on the line, ' + t('AD') + ' needs the <b>same</b> slope as ' + t('AC') + '.' },
              { html: '<b>Yes</b> — its ' + t('x') + '-coordinate is between those of ' + t('A') + ' and ' + t('C') + '.', why: 'Being between them left to right isn’t enough — lots of points above or below the segment are too. Compare ' + t('m_{AD}') + ' with ' + t('m_{AC}') + '.' }] : [
              { html: '<b>No</b> — ' + t('m_{AD}=' + sAD) + ', which is not ' + t('m_{AC}=' + sAC) + '.', right: true },
              { html: '<b>Yes</b> — its ' + t('x') + '-coordinate is between those of ' + t('A') + ' and ' + t('C') + '.', why: 'Being between them left to right isn’t enough — the point must be <b>on</b> the line. Compare ' + t('m_{AD}') + ' with ' + t('m_{AC}') + '.' },
              { html: '<b>Yes</b> — ' + t('m_{AD}=' + sAC + '=m_{AC}') + '.', why: 'Recalculate ' + t('m_{AD}=\\frac{y_D-y_A}{x_D-x_A}') + ' — it doesn’t reduce to ' + t(sAC) + '.' },
              { html: '<b>No</b> — ' + t('m_{AD}\\times m_{AC}\\ne -1') + '.', why: 'The conclusion is right but the reason isn’t: a product of ' + t('-1') + ' tests for perpendicular. Being on the line means ' + t('m_{AD}=m_{AC}') + '.' }];
            return B.mc(r, '(b) Does the point ' + nP('D', s.D) + ' lie on line segment ' + t('AC') + '? Explain.', opts,
              t(calc(s.A, s.C, 'AC')) + '<br>' + t(calc(s.A, s.D, 'AD')) + '<br>' + (s.on ? t('m_{AD}=m_{AC}') + ' and the segments share ' + t('A') + ', so ' + t('D') + ' is on line ' + t('AC') + '; its ' + t('x') + ' is between ' + t(s.A[0]) + ' and ' + t(s.C[0]) + ', so it is on the segment: <b>yes</b>.' : t(sAD + '\\ne ' + sAC) + ', so <b>no</b> — ' + t('D') + ' is not on ' + t('AC') + '.'), ['A point is on line ' + t('AC') + ' when the segment from ' + t('A') + ' to it has the same slope as ' + t('AC') + '.'], 'is D on segment AC');
          } },
          { id: '6c', level: 'ADV', make: function (r, s) {
            var p = s.s[0], q = s.s[1];
            return numAns('(c) Find the value of ' + t('k') + ' if the point ' + t('E(k,\\ k)') + ' lies on line segment ' + t('AC') + '.', s.k, [[-s.k, 'k-sign', 'Check the signs as you expand and collect terms.']],
              t('E') + ' must give the same slope from ' + t('A') + ' as ' + t('m_{AC}=' + sT(s.s)) + ':<br>' + t('\\frac{k-' + nb(s.A[1]) + '}{k-' + nb(s.A[0]) + '}=' + sT(s.s) + '\\ \\Rightarrow\\ ' + q + '(k' + (s.A[1] < 0 ? '+' + (-s.A[1]) : '-' + s.A[1]) + ')=' + (p === 1 ? '' : p) + '(k' + (s.A[0] < 0 ? '+' + (-s.A[0]) : '-' + s.A[0]) + ')') + '<br>' + t('k=' + s.k) + ': ' + t('E(' + s.k + ',\\ ' + s.k + ')') + ', and ' + t(s.A[0] + '<' + s.k + '<' + s.C[0]) + ', so it is on the segment.',
              ['Use ' + t('A') + ' and ' + t('E(k,\\ k)') + ' in the slope formula and set it equal to ' + t('m_{AC}') + '.', 'Cross-multiply and collect the ' + t('k') + '-terms on one side.'], 'E(k,k) on AC', t('k='));
          } }] },
      /* ---------------- Q7 ---------------- */
      { num: '7', shared: q7Shared,
        stem: function (s) { return 'A hiking party’s base camp is lost at ' + nP('P', s.P) + '. A rescue crew sets out by truck from ' + nP('A_1', s.A1) + ', driving in a straight line through ' + nP('A_2', s.A2) + '. A second crew sets out by boat from ' + nP('B_1', s.B1) + ', travelling in a straight line through ' + nP('B_2', s.B2) + '. If both crews keep going in these directions, will either of them reach the base camp?' + q7Fig(s); },
        parts: [
          { id: '7a', level: 'EMG', make: function (r, s) { var s1 = slopeOf(s.A1, s.A2), s2 = slopeOf(s.A2, s.P); return slopeFields('(a) The truck: find the slope of its path, ' + t('m_{A_1A_2}') + ', and the slope from ' + t('A_2') + ' to the camp, ' + t('m_{A_2P}') + '.', [{ nm: 'A_1A_2', s: s1 }, { nm: 'A_2P', s: s2 }], t(calc(s.A1, s.A2, 'A_1A_2')) + '<br>' + t(calc(s.A2, s.P, 'A_2P')) + '<br>' + (sEq(s1, s2) ? 'Equal: ' + t('P') + ' is on the truck’s line.' : 'Different: ' + t('P') + ' is not on the truck’s line.'), [SLOPE_HINT], 'rescue: truck slopes'); } },
          { id: '7b', level: 'EMG', make: function (r, s) { var s1 = slopeOf(s.B1, s.B2), s2 = slopeOf(s.B2, s.P); return slopeFields('(b) The boat: find ' + t('m_{B_1B_2}') + ' and ' + t('m_{B_2P}') + '.', [{ nm: 'B_1B_2', s: s1 }, { nm: 'B_2P', s: s2 }], t(calc(s.B1, s.B2, 'B_1B_2')) + '<br>' + t(calc(s.B2, s.P, 'B_2P')) + '<br>' + (sEq(s1, s2) ? 'Equal: ' + t('P') + ' is on the boat’s line.' : 'Different: ' + t('P') + ' is not on the boat’s line.'), [SLOPE_HINT], 'rescue: boat slopes'); } },
          { id: '7c', level: 'EMG', make: function (r, s) {
            var right = s.truck && s.boat ? 'both' : s.truck ? 'truck' : s.boat ? 'boat' : 'neither';
            var txt = { truck: 'Only the <b>truck</b> crew reaches the camp.', boat: 'Only the <b>boat</b> crew reaches the camp.', both: '<b>Both</b> crews reach the camp.', neither: '<b>Neither</b> crew reaches the camp.' };
            var why = function (o) { var w = []; if ((o === 'truck' || o === 'both') && !s.truck) w.push('the truck’s two slopes are different, so ' + t('P') + ' isn’t on its line'); if ((o === 'boat' || o === 'both') && !s.boat) w.push('the boat’s two slopes are different, so ' + t('P') + ' isn’t on its line'); if ((o === 'neither' || o === 'boat') && s.truck) w.push('the truck’s two slopes are equal, so ' + t('P') + ' is on its line'); if ((o === 'neither' || o === 'truck') && s.boat) w.push('the boat’s two slopes are equal, so ' + t('P') + ' is on its line'); return 'Look again: ' + w.join(', and ') + '.'; };
            var sol = function (nm, X1, X2, ok2) { return t('m_{' + nm + '_1' + nm + '_2}=' + sT(slopeOf(X1, X2))) + ', ' + t('m_{' + nm + '_2P}=' + sT(slopeOf(X2, s.P))) + (ok2 ? ': equal, and moving from ' + t(nm + '_1') + ' through ' + t(nm + '_2') + ' heads towards ' + t('P') + '.' : ': different, so it misses ' + t('P') + '.'); };
            return B.mc(r, '(c) The truck: ' + t('m_{A_1A_2}=' + sT(slopeOf(s.A1, s.A2))) + ', ' + t('m_{A_2P}=' + sT(slopeOf(s.A2, s.P))) + '. The boat: ' + t('m_{B_1B_2}=' + sT(slopeOf(s.B1, s.B2))) + ', ' + t('m_{B_2P}=' + sT(slopeOf(s.B2, s.P))) + '. Use these slopes to decide: will either crew reach the base camp?', ['truck', 'boat', 'both', 'neither'].map(function (o) { return { html: txt[o], right: o === right, why: o === right ? null : why(o) }; }),
              'Truck: ' + sol('A', s.A1, s.A2, s.truck) + '<br>Boat: ' + sol('B', s.B1, s.B2, s.boat) + '<br>' + txt[right], ['A crew reaches ' + t('P') + ' only if ' + t('P') + ' is on its line: the slope from its second point to ' + t('P') + ' must equal the slope of its path.'], 'rescue: which crew reaches P', true);
          } }] },
      /* ---------------- Q8 ---------------- */
      { num: '8', section: 'Multiple choice and numerical response', parts: [
        { id: '8', level: 'LIM', make: function (r) {
          var g = gen(r, function (r) { var m = r.pick([2, 3, 4]) * (r.chance(0.7) ? -1 : 1), dx = r.int(2, 5) * (r.chance(0.5) ? 1 : -1), E = [r.int(-6, 8), r.int(-8, 6)], Fp = [E[0] + dx, E[1] + m * dx]; if (!inBox(Fp, 12) || Math.abs(dx) === Math.abs(m)) return null; return { E: E, F: Fp, m: m, dx: dx }; }, { E: [6, -2], F: [2, 10], m: -3, dx: -4 });
          var m = g.m;
          return B.mc(r, '<i>(Multiple choice)</i> The slope of the line segment joining ' + nP('E', g.E) + ' and ' + nP('F', g.F) + ' is', [
            { html: t(String(m)), right: true },
            { html: t(frT(1, m)), why: 'That is run over rise. Slope is <b>rise over run</b>: ' + t('\\frac{y_F-y_E}{x_F-x_E}') + '.' },
            { html: t(frT(-1, m)), why: 'That is run over rise with the sign changed. Slope = ' + t('\\frac{\\text{change in }y}{\\text{change in }x}') + '.' },
            { html: t(String(g.dx)), why: 'That is just the run (the change in ' + t('x') + '). Divide the rise by it.' }],
            t(calc(g.E, g.F, 'EF')) + '.', [SLOPE_HINT], 'MC slope from two points');
        } }] },
      { num: '9', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var g = gen(r, function (r) { var q = r.int(2, 6), p = r.int(1, q - 1); if (gcd(p, q) !== 1) return null; var A = [r.int(1, 7), r.int(1, 8)], dx = q, rise = -p, k = A[1] + rise; return { A: A, x2: A[0] + dx, m: [-p, q], rise: rise, k: k }; }, { A: [5, 4], x2: 11, m: [-5, 6], rise: -5, k: -1 });
          var y1 = g.A[1], seen = {}, alg = 'Check your algebra: ' + t('\\frac{k-' + y1 + '}{' + (g.x2 - g.A[0]) + '}=' + sT(g.m)) + ', so ' + t('k-' + y1 + '=' + g.rise) + '.';
          seen[g.k] = 1;
          var c = [[y1 - g.rise, 'That value would make the segment go <b>up</b>, but the slope is negative. Check the sign when you solve.'], [g.rise - y1, 'Solve ' + t('k-' + y1 + '=' + g.rise) + ' carefully: <b>add</b> ' + t(y1) + ' to both sides.'], [-y1 - g.rise, alg], [y1 + 2 * g.rise, alg], [g.x2 + g.rise, 'Add the rise to the starting <b>' + t('y') + '</b>-coordinate, not the ' + t('x') + '-coordinate.']].filter(function (o) { if (seen[o[0]]) return false; seen[o[0]] = 1; return true; }).slice(0, 3);
          return B.mc(r, '<i>(Multiple choice)</i> If the line segment joining ' + t(ptT(g.A)) + ' and ' + t('(' + g.x2 + ',\\ k)') + ' has slope ' + t(sT(g.m)) + ', then ' + t('k=') + '', [{ html: t(String(g.k)), right: true }].concat(c.map(function (o) { return { html: t(String(o[0])), why: o[1] }; })),
            t('\\frac{k-' + y1 + '}{' + g.x2 + '-' + g.A[0] + '}=' + sT(g.m) + '\\ \\Rightarrow\\ \\frac{k-' + y1 + '}{' + (g.x2 - g.A[0]) + '}=' + sT(g.m) + '\\ \\Rightarrow\\ k-' + y1 + '=' + g.rise + '\\ \\Rightarrow\\ k=' + g.k) + '.', ['Write the slope formula with ' + t('k') + ' and set it equal to the slope.'], 'MC find k from slope');
        } }] },
      { num: '10', parts: [
        { id: '10', level: 'PRG', outcome: 'EXT', make: function (r) {
          var g = gen(r, function (r) { var p = r.int(1, 4), q = r.int(1, 4); if (gcd(p, q) !== 1 || p === q) return null; var y1 = p * r.int(1, 4) * (q % 2 ? 1 : 1); if (y1 < 3 || y1 > 12) return null; var x1 = r.int(-3, 5), x0 = x1 + y1 * q / p; if (!Number.isInteger(x0)) return null; if ((y1 % 2) === 0 && ((x1 + x0) % 2) === 0) return null; return { P: [x1, y1], x0: x0, m: [-p, q] }; }, { P: [2, 9], x0: 8, m: [-3, 2] });
          var M = [(g.P[0] + g.x0) / 2, g.P[1] / 2], xs = g.P[0] - (g.x0 - g.P[0]);
          var c = [[[g.P[0] + g.x0, g.P[1] / 2], 'You added the ' + t('x') + '-coordinates but didn’t divide by ' + t('2') + '.'], [[M[0], g.P[1]], 'The ' + t('y') + '-coordinate of the midpoint is the average of ' + t(g.P[1]) + ' and ' + t('0') + '.'], [[(g.P[0] + xs) / 2, g.P[1] / 2], 'Check the other endpoint: a negative slope means it is to the <b>right</b> of ' + t(ptT(g.P)) + ' (going down to the ' + t('x') + '-axis).'], [[(g.x0 - g.P[0]) / 2, g.P[1] / 2], 'For a midpoint, <b>add</b> the coordinates before halving.']];
          var seen = {}; seen[ptT(M)] = 1; var opts = [{ html: t(ptT(M)), right: true }];
          c.forEach(function (o) { var k = ptT(o[0]); if (!seen[k] && opts.length < 4) { seen[k] = 1; opts.push({ html: t(k), why: o[1] }); } });
          return B.mc(r, '<i>(Multiple choice, Extension)</i> One endpoint of a line segment is ' + t(ptT(g.P)) + '. The other endpoint lies on the ' + t('x') + '-axis. If the slope of the segment is ' + t(sT(g.m)) + ', then the midpoint of the segment is', opts,
            'Let the other endpoint be ' + t('(x,\\ 0)') + ': ' + t('\\frac{0-' + g.P[1] + '}{x-' + nb(g.P[0]) + '}=' + sT(g.m)) + ', so ' + t('x=' + g.x0) + '.<br>Midpoint ' + t('=\\left(\\frac{' + g.P[0] + '+' + g.x0 + '}{2},\\ \\frac{' + g.P[1] + '+0}{2}\\right)=' + ptT(M)) + '.', ['The point on the ' + t('x') + '-axis has ' + t('y=0') + '. Use the slope to find its ' + t('x') + '.'], 'MC endpoint on x-axis then midpoint');
        } }] },
      { num: '11', parts: [
        { id: '11', level: 'PRG', outcome: 'EXT', make: function (r) {
          var g = gen(r, function (r) { var D = [r.int(-5, 6), r.int(-9, 0)], E = [r.int(4, 14), r.int(6, 18)], Fp = [r.int(12, 22), r.int(-2, 8)]; var M = [(E[0] + Fp[0]) / 2, (E[1] + Fp[1]) / 2]; if (M[0] - D[0] < 4) return null; var s = (M[1] - D[1]) / (M[0] - D[0]); if (s < 0.3 || s > 9.4 || Number.isInteger(M[0] + M[1])) return null; if (Math.abs(s * 10 - Math.round(s * 10)) < 0.02 || Math.abs(Math.abs((s * 10) % 1) - 0.5) < 0.01) return null; return { D: D, E: E, F: Fp, M: M, s: s }; }, { D: [3, -7], E: [11, 15], F: [19, 4], M: [15, 9.5], s: 1.375 });
          var sDE = (g.E[1] - g.D[1]) / (g.E[0] - g.D[0]), sDF = (g.F[1] - g.D[1]) / (g.F[0] - g.D[0]);
          return B.approx('<i>(Numerical response, Extension)</i> ' + nP('D', g.D) + ', ' + nP('E', g.E) + ' and ' + nP('F', g.F) + ' are the vertices of a triangle. The slope of the median from ' + t('D') + ' to the midpoint of ' + t('EF') + ', to the nearest tenth, is ____.', g.s, 1, { nr: true, diag: function (v) { if (near(v, K.roundTo(sDE, 1)) || near(v, K.roundTo(sDF, 1))) return { code: 'median-vertex', hint: 'The median goes from ' + t('D') + ' to the <b>midpoint</b> of ' + t('EF') + ', not to ' + t('E') + ' or ' + t('F') + '.' }; if (near(v, K.roundTo(1 / g.s, 1))) return { code: 'slope-flip', hint: 'Slope is rise over run — you have run over rise.' }; return null; } },
            'Midpoint of ' + t('EF') + ': ' + t('\\left(\\frac{' + g.E[0] + '+' + g.F[0] + '}{2},\\ \\frac{' + g.E[1] + '+' + g.F[1] + '}{2}\\right)=' + ptT(g.M)) + '<br>' + t('m=\\frac{' + nT(g.M[1]) + '-' + nb(g.D[1]) + '}{' + nT(g.M[0]) + '-' + nb(g.D[0]) + '}=\\frac{' + nT(g.M[1] - g.D[1]) + '}{' + nT(g.M[0] - g.D[0]) + '}\\approx ' + K.roundTo(g.s, 1).toFixed(1)), ['A median joins a vertex to the midpoint of the opposite side. Find that midpoint first.'], 'NR slope of a median');
        } }] },
      /* ---------------- Q12 ---------------- */
      { num: '12', section: 'Parallel and perpendicular slopes', stem: 'The slopes of two line segments, ' + t('AB') + ' and ' + t('PQ') + ', are given. Are the segments parallel, perpendicular, or neither?', parts: (function () {
        function fracPick(r, maxQ) { return gen(r, function (r) { var q = r.int(2, maxQ || 9), p = r.int(1, (maxQ || 9) + 1); if (gcd(p, q) !== 1 || p === q) return null; return [p, q]; }, [3, 8]); }
        function mk(id, level, kindGen, text) {
          return { id: id, level: level, make: function (r) {
            var g = kindGen(r), a = g[0], b = g[1];
            return relMC(r, t('m_{AB}=' + g[2] + ',\\quad m_{PQ}=' + g[3]), a, b, relSol(a, b, g[2], g[3]), text);
          } };
        }
        return [
          mk('12a', 'BEG', function (r) { var f = fracPick(r, 9), c = r.int(2, 3); return [f, f, '\\frac{' + f[0] * c + '}{' + f[1] * c + '}', frT(f[0], f[1])]; }, 'equal fractions: parallel'),
          mk('12b', 'BEG', function (r) { var f = fracPick(r, 7), sg = r.chance(0.5) ? 1 : -1; var a = [sg * f[0], f[1]], b = red(-sg * f[1], f[0]); return [a, b, sT(a), sT(b)]; }, 'negative reciprocals: perpendicular'),
          mk('12c', 'BEG', function (r) { var f = fracPick(r, 9), c = r.int(2, 4); return [f, f, frT(f[0], f[1]), '\\frac{' + f[0] * c + '}{' + f[1] * c + '}']; }, 'equal fractions: parallel'),
          mk('12d', 'EMG', function (r) { var f = fracPick(r, 11); var a = f, b = [f[1], f[0]]; return [a, b, sT(a), sT(b)]; }, 'reciprocals, same sign: neither'),
          mk('12e', 'BEG', function (r) { var n = r.int(2, 9), sg = r.chance(0.7) ? -1 : 1; var a = [sg * n, 1], b = [-sg, n]; return [a, b, sT(a), sT(b)]; }, 'integer and negative reciprocal: perpendicular'),
          mk('12f', 'EMG', function (r) { var f = fracPick(r, 7); if (r.chance(0.4)) { var a2 = f, b2 = [-f[0], f[1]]; return [a2, b2, sT(a2), sT(b2)]; } var a = f, b = [f[1], f[0]]; return [a, b, sT(a), sT(b)]; }, 'neither (reciprocal or opposite)')];
      })() },
      /* ---------------- Q13 ---------------- */
      { num: '13', shared: function (r) {
          return gen(r, function (r) {
            var mags = r.sample([2, 3, 4, 5, 6, 7, 8], 3), grp = mags.map(function (n) { var sg = r.chance(0.5) ? 1 : -1, s = r.chance(0.6) ? [sg * n, 1] : [sg, n]; return s; });
            var vals = [grp[0], grp[0], perpOf(grp[0]), grp[1], perpOf(grp[1]), perpOf(grp[1]), grp[2], perpOf(grp[2])];
            var order = r.shuffle(vals), S = {}; Q13N.forEach(function (nm, i) { S[nm] = order[i]; });
            return S;
          }, { AB: [8, 1], CD: [-1, 8], EF: [-3, 1], GH: [8, 1], IJ: [1, 3], KL: [-1, 2], MN: [2, 1], PQ: [1, 3] });
        },
        stem: function (S) { return 'The slopes of eight line segments are given.' + flow(Q13N.map(function (nm) { return 'm_{' + nm + '}=' + sT(S[nm]); })); },
        parts: (function () {
          function pairsOf(S) { var out = []; for (var i = 0; i < 8; i++) for (var j = i + 1; j < 8; j++) out.push({ a: Q13N[i], b: Q13N[j], k: relKind(S[Q13N[i]], S[Q13N[j]]) }); return out; }
          function mk(id, level, want) {
            return { id: id, level: level, make: function (r, S) {
              var all = pairsOf(S), right = all.filter(function (p) { return p.k === want; }), other = all.filter(function (p) { return p.k !== want && p.k !== 'nei'; });
              var near2 = all.filter(function (p) { if (p.k !== 'nei') return false; var a = S[p.a], b = S[p.b]; return Math.abs(a[0] * b[0]) === a[1] * b[1] || Math.abs(a[0]) * b[1] === Math.abs(b[0]) * a[1]; });
              var rest = r.shuffle(all.filter(function (p) { return p.k === 'nei' && near2.indexOf(p) < 0; }));
              var shown = right.concat(other).concat(near2.slice(0, 3)).concat(rest.slice(0, Math.max(0, 10 - right.length - other.length - Math.min(3, near2.length))));
              shown.sort(function (x, y) { return (x.a + x.b) < (y.a + y.b) ? -1 : 1; });
              var sym = want === 'par' ? '\\parallel' : '\\perp';
              var opts = shown.map(function (p) { return { value: p.a + '|' + p.b, html: t(p.a + sym + ' ' + p.b) }; });
              var wantV = right.map(function (p) { return p.a + '|' + p.b; });
              var byV = {}; all.forEach(function (p) { byV[p.a + '|' + p.b] = p; });
              var diag = function (extra, missing) {
                if (extra.length) { var p = byV[extra[0]], a = S[p.a], b = S[p.b]; if (p.k !== 'nei') return { code: 'sel-rel', hint: t('m_{' + p.a + '}=' + sT(a)) + ' and ' + t('m_{' + p.b + '}=' + sT(b)) + (p.k === 'par' ? ' are equal: that pair is parallel, not perpendicular.' : ' multiply to ' + t('-1') + ': that pair is perpendicular, not parallel.') }; return { code: 'sel-none', hint: t(p.a) + ' and ' + t(p.b) + ' (slopes ' + t(sT(a)) + ' and ' + t(sT(b)) + ') are ' + (want === 'par' ? 'not equal.' : 'not negative reciprocals: their product isn’t ' + t('-1') + '.') }; }
                return { code: 'sel-missing', hint: 'Correct so far — but there ' + (missing.length === 1 ? 'is one more pair' : 'are ' + missing.length + ' more pairs') + '. A segment can belong to more than one pair.' };
              };
              var sol = 'Parallel (equal slopes): ' + all.filter(function (p) { return p.k === 'par'; }).map(function (p) { return t(p.a + '\\parallel ' + p.b); }).join(', ') + '.<br>Perpendicular (product ' + t('-1') + '): ' + all.filter(function (p) { return p.k === 'perp'; }).map(function (p) { return t(p.a + '\\perp ' + p.b) + ' (' + t(prodT(S[p.a], S[p.b])) + ')'; }).join(', ') + '.';
              return { prompt: (id === '13a' ? '(a) Which pairs of segments are <b>parallel</b>? Select every parallel pair.' : '(b) Which pairs of segments are <b>perpendicular</b>? Select every perpendicular pair.'), input: { type: 'select', options: opts }, check: K.selectSet(wantV, diag), key: wantV,
                answer: right.map(function (p) { return t(p.a + sym + ' ' + p.b); }).join(', '), solution: sol, hints: [want === 'par' ? 'Parallel segments have equal slopes. Sort the slopes into groups of equal values.' : 'Perpendicular slopes are negative reciprocals: for each slope, flip it and change its sign, then look for that value.', 'A segment can be in more than one pair.'], text: want === 'par' ? 'eight slopes: parallel pairs' : 'eight slopes: perpendicular pairs', bad: [wantV.slice(1), wantV.concat(other.slice(0, 1).map(function (p) { return p.a + '|' + p.b; }))] };
            } };
          }
          return [mk('13a', 'BEG', 'par'), mk('13b', 'PRG', 'perp')];
        })() },
      /* ---------------- Q14 ---------------- */
      { num: '14', parts: [
        { id: '14', level: 'EMG', make: function (r) {
          var a = r.int(-4, 6), y1 = r.int(-4, 2), y2 = y1 + r.int(4, 8), b = r.int(-3, 6), x1 = r.int(-6, 0), x2 = x1 + r.int(5, 10), vFirst = r.chance(0.6);
          var V = '(' + a + ',\\ ' + y1 + ')\\text{ to }(' + a + ',\\ ' + y2 + ')', H = '(' + x1 + ',\\ ' + b + ')\\text{ to }(' + x2 + ',\\ ' + b + ')';
          var first = vFirst ? 'first' : 'second', second = vFirst ? 'second' : 'first';
          return B.mc(r, 'Is the segment from ' + t(vFirst ? V : H) + ' perpendicular to the segment from ' + t(vFirst ? H : V) + '? Explain.', [
            { html: '<b>Yes</b> — the ' + first + ' segment is vertical (undefined slope) and the ' + second + ' is horizontal (slope ' + t('0') + '), so they meet at right angles.', right: true },
            { html: '<b>No</b> — their slopes don’t multiply to ' + t('-1') + '.', why: 'The product rule only works when both slopes are numbers. One of these slopes is undefined — and a vertical and a horizontal segment always meet at ' + t('90^{\\circ}') + '.' },
            { html: '<b>No</b> — neither segment is slanted, so they are parallel.', why: 'Compare the coordinates: one segment keeps the same ' + t('x') + ' (vertical), the other keeps the same ' + t('y') + ' (horizontal). Those aren’t parallel.' },
            { html: '<b>Yes</b> — both slopes are ' + t('0') + '.', why: 'Only the horizontal one has slope ' + t('0') + '. The other has run ' + t('0') + ', so its slope is undefined — and two slopes of ' + t('0') + ' would mean parallel anyway.' }],
            'The segment through ' + t('(' + a + ',\\ ' + y1 + ')') + ' and ' + t('(' + a + ',\\ ' + y2 + ')') + ' has equal ' + t('x') + '-coordinates: vertical, slope undefined. The other has equal ' + t('y') + '-coordinates: horizontal, slope ' + t('0') + '. A vertical and a horizontal segment are <b>perpendicular</b> — the special case where the slopes can’t be multiplied.', ['Which coordinate stays the same along each segment?'], 'vertical vs horizontal: perpendicular');
        } }] },
      /* ---------------- Q15 ---------------- */
      { num: '15', shared: function (r) {
          return gen(r, function (r) { var A = [r.int(-8, 8), r.int(-8, 8)], Bp = [r.int(-8, 8), r.int(-8, 8)], C = [r.int(-8, 8), r.int(-8, 8)]; var s1 = slopeOf(A, Bp), s2 = slopeOf(Bp, C), s3 = slopeOf(A, C); if (![s1, s2, s3].every(function (s) { return okSlope(s, 5, 5) && Math.abs(s[0]) !== s[1]; })) return null; if (sEq(s1, s2) || sEq(s2, s3) || sEq(s1, s3)) return null; return { A: A, B: Bp, C: C, s1: s1, s2: s2, s3: s3 }; }, { A: [1, 6], B: [-5, -2], C: [7, 2], s1: [4, 3], s2: [1, 3], s3: [-2, 3] });
        },
        stem: function (s) { return nP('A', s.A) + ', ' + nP('B', s.B) + ' and ' + nP('C', s.C) + ' are three points. Determine the slope of a line'; },
        parts: [
          { id: '15a', level: 'EMG', make: function (r, s) { return slopeAns('(a) parallel to ' + t('AB'), s.s1, relChk(s.s1, 'par'), t(calc(s.A, s.B, 'AB')) + '<br>Parallel lines have equal slopes: ' + t('m=' + sT(s.s1)) + '.', ['Find ' + t('m_{AB}') + ' first. Parallel lines have equal slopes.'], 'slope parallel to AB'); } },
          { id: '15b', level: 'EMG', make: function (r, s) { return slopeAns('(b) perpendicular to ' + t('AB'), perpOf(s.s1), relChk(s.s1, 'perp'), t(calc(s.A, s.B, 'AB')) + '<br>Perpendicular: the negative reciprocal, ' + t('m=' + sT(perpOf(s.s1))) + ' (check: ' + t(prodT(s.s1, perpOf(s.s1))) + ').', ['Find ' + t('m_{AB}') + ' first, then flip it and change its sign.'], 'slope perpendicular to AB'); } },
          { id: '15c', level: 'EMG', make: function (r, s) { return slopeAns('(c) parallel to ' + t('BC'), s.s2, relChk(s.s2, 'par'), t(calc(s.B, s.C, 'BC')) + '<br>Parallel: ' + t('m=' + sT(s.s2)) + '.', ['Find ' + t('m_{BC}') + ' first.'], 'slope parallel to BC'); } },
          { id: '15d', level: 'EMG', make: function (r, s) { return slopeAns('(d) perpendicular to ' + t('AC'), perpOf(s.s3), relChk(s.s3, 'perp'), t(calc(s.A, s.C, 'AC')) + '<br>Perpendicular: ' + t('m=' + sT(perpOf(s.s3))) + ' (check: ' + t(prodT(s.s3, perpOf(s.s3))) + ').', ['Find ' + t('m_{AC}') + ' first, then take the negative reciprocal.'], 'slope perpendicular to AC'); } }] },
      /* ---------------- Q16 ---------------- */
      { num: '16', shared: function (r) {
          var rightA = r.chance(0.35), V = rightTri(r, 9), plain = plainTri(r, 7), names = [['P', 'Q', 'R'], ['A', 'B', 'C']];
          var fbA = [[-2, 4], [0, 0], [-6, -2]], fbB = [[-5, 7], [1, 9], [3, 3]];
          var rt = V ? (function () { var pos = r.int(0, 2), pts = [V.P, V.Q]; pts.splice(pos, 0, V.V); return { pts: pts, at: pos }; })() : null;
          if (!rt || !plain) return { a: { pts: fbA, at: -1 }, b: { pts: fbB, at: 1 }, names: names };
          return rightA ? { a: rt, b: { pts: plain, at: -1 }, names: names } : { a: { pts: plain, at: -1 }, b: rt, names: names };
        },
        stem: 'The vertices of two triangles are given. Determine whether each triangle is right-angled.',
        parts: (function () {
          function tri(s, w) { return { T: s[w], N: s.names[w === 'a' ? 0 : 1] }; }
          function fieldsPart(w) {
            return { id: '16' + w, sub: w + ' i', level: 'EMG', make: function (r, s) {
              var T = tri(s, w).T.pts, N = tri(s, w).N, nm = [N[0] + N[1], N[1] + N[2], N[0] + N[2]], P3 = [[T[0], T[1]], [T[1], T[2]], [T[0], T[2]]];
              return slopeFields(t('\\triangle ' + N.join('')) + ': ' + N.map(function (n, i) { return nP(n, T[i]); }).join(', ') + '. Find the three slopes.', nm.map(function (x, i) { return { nm: x, s: slopeOf(P3[i][0], P3[i][1]) }; }),
                nm.map(function (x, i) { return t(calc(P3[i][0], P3[i][1], x)); }).join('<br>'), [SLOPE_HINT], 'triangle: three slopes');
            } };
          }
          function mcPart(w) {
            return { id: '16' + w + '2', sub: w + ' ii', level: 'EMG', make: function (r, s) {
              var TT = tri(s, w), T = TT.T.pts, N = TT.N, at = TT.T.at, sl = [slopeOf(T[0], T[1]), slopeOf(T[1], T[2]), slopeOf(T[0], T[2])];
              var prods = [[0, 2, 0], [0, 1, 1], [1, 2, 2]];   // vertex i is where sides (a, b) meet
              var sol = prods.map(function (pr) { return t(prodT(sl[pr[0]], sl[pr[1]])) + ' (at ' + t(N[pr[2]]) + ')'; }).join('<br>') + '<br>' + (at < 0 ? 'No product is ' + t('-1') + ', so ' + t('\\triangle ' + N.join('')) + ' is <b>not right-angled</b>.' : 'The sides meeting at ' + t(N[at]) + ' have slopes that multiply to ' + t('-1') + ': <b>right-angled at ' + t(N[at]) + '</b>.');
              var opts = [{ html: 'Not right-angled', right: at < 0, why: 'One pair of sides has slopes that multiply to ' + t('-1') + '. Check each vertex.' }].concat(N.map(function (n, i) { return { html: 'Right-angled at ' + t(n), right: at === i, why: at === i ? null : 'The two sides that meet at ' + t(n) + ' have slopes whose product isn’t ' + t('-1') + '. Multiply the slopes of the two sides at each vertex.' }; }));
              return B.mc(r, 'Is ' + t('\\triangle ' + N.join('')) + ' right-angled? (Vertices ' + N.map(function (n, i) { return nP(n, T[i]); }).join(', ') + '.)', opts, sol, ['A right angle at a vertex means the two sides that meet there are perpendicular: their slopes multiply to ' + t('-1') + '.'], 'is the triangle right-angled', true);
            } };
          }
          return [fieldsPart('a'), mcPart('a'), fieldsPart('b'), mcPart('b')];
        })() },
      /* ---------------- Q17 ---------------- */
      { num: '17', stem: 'In each case, the slopes of two <b>parallel</b> lines are given. Determine the value of the variable.', parts: [
        { id: '17a', level: 'EMG', make: function (r) { var a = r.int(2, 9) * (r.chance(0.25) ? -1 : 1), d = r.int(2, 6), k = a * d;
          return numAns('(a) ' + t(a + ',\\ \\frac{k}{' + d + '}'), k, [[a / d, 'k-divide', 'Undo “divide by ' + t(d) + '” by <b>multiplying</b> both sides by ' + t(d) + '.'], [-d / a, 'k-perp-par', 'These lines are <b>parallel</b>, so the slopes are equal — no reciprocal needed.'], [-k, 'k-sign', 'Check the sign.']],
            'Parallel lines have equal slopes: ' + t('\\frac{k}{' + d + '}=' + a + '\\ \\Rightarrow\\ k=' + k) + '.', ['Set the two slopes equal.'], 'parallel: k/d = a', t('k='));
        } },
        { id: '17b', level: 'PRG', make: function (r) { var a = r.int(2, 6), j = r.int(1, 4) * (r.chance(0.8) ? 1 : -1), c = a * j, n = -j;
          return numAns('(b) ' + t('-' + a + ',\\ \\frac{' + c + '}{n}'), n, [[-c * a, 'k-multiply', 'From ' + t('\\frac{' + c + '}{n}=-' + a) + ': ' + t(c + '=-' + a + 'n') + ', so divide by ' + t('-' + a) + '.'], [-n, 'k-sign', 'Check the sign: ' + t(c + '\\div(-' + a + ')') + '.'], [c * a, 'k-perp-par', 'Set the slopes <b>equal</b> (parallel).'], [-a / c, 'k-flip', 'Solve for ' + t('n') + ' — not ' + t('\\frac{1}{n}') + ': ' + t(c + '=-' + a + 'n') + '.']],
            t('\\frac{' + c + '}{n}=-' + a + '\\ \\Rightarrow\\ ' + c + '=-' + a + 'n\\ \\Rightarrow\\ n=' + n), ['Set the slopes equal, then multiply both sides by ' + t('n') + '.'], 'parallel: c/n = -a', t('n='));
        } },
        { id: '17c', level: 'PRG', make: function (r) { var f = gen(r, function (r) { var q = r.int(3, 9), p = r.int(1, 8), c = r.int(2, 6); if (gcd(p, q) !== 1 || p % c === 0) return null; return [p, q, c]; }, [7, 9, 4]), p = f[0], q = f[1], c = f[2], m = red(p, q * c);
          return numAns('(c) ' + t('\\frac{' + p + '}{' + q + '},\\ ' + c + 'm'), m, [[p * c / q, 'k-multiply', 'Undo “times ' + t(c) + '” by <b>dividing</b> by ' + t(c) + ': ' + t('m=\\frac{' + p + '}{' + q + '}\\div ' + c) + '.'], [-q / (p * c), 'k-perp-par', 'Parallel: set the slopes <b>equal</b>.']],
            t(c + 'm=\\frac{' + p + '}{' + q + '}\\ \\Rightarrow\\ m=\\frac{' + p + '}{' + q + '\\times ' + c + '}=' + sT(m)), ['Set ' + t(c + 'm') + ' equal to the other slope, then divide by ' + t(c) + '.'], 'parallel: cm = p/q', t('m='));
        } },
        { id: '17d', level: 'PRG', make: function (r) { var f = gen(r, function (r) { var q = r.int(2, 6), p = r.int(1, 7), j = r.int(2, 3); if (gcd(p, q) !== 1) return null; return [p, q, q * j]; }, [5, 6, 12]), p = f[0], q = f[1], d = f[2], w = -p * d / q;
          return numAns('(d) ' + t('\\frac{' + p + '}{' + q + '},\\ -\\frac{w}{' + d + '}'), w, [[-w, 'k-sign', 'The minus sign in ' + t('-\\frac{w}{' + d + '}') + ' matters: ' + t('w') + ' must be negative to make the slope positive.'], [q * d / p, 'k-perp-par', 'Parallel: set the slopes <b>equal</b>.']],
            t('-\\frac{w}{' + d + '}=\\frac{' + p + '}{' + q + '}\\ \\Rightarrow\\ -' + q + 'w=' + p * d + '\\ \\Rightarrow\\ w=' + w), ['Set the slopes equal and cross-multiply.'], 'parallel: -w/d = p/q', t('w='));
        } }] },
      /* ---------------- Q18 ---------------- */
      { num: '18', stem: 'In each case, the slopes of two <b>perpendicular</b> lines are given. Determine the value of the variable.', parts: [
        { id: '18a', level: 'EMG', make: function (r) { var n = r.int(2, 7), c = r.pick([n, n, 2, 3, 4]), h = red(-n, c);
          return numAns('(a) ' + t('\\frac{1}{' + n + '},\\ ' + c + 'h'), h, [[1 / (n * c), 'k-perp-par', 'Perpendicular, not parallel: ' + t(c + 'h') + ' must be the <b>negative reciprocal</b> of ' + t('\\frac{1}{' + n + '}') + ', which is ' + t('-' + n) + '.'], [n / c, 'perp-nosign', 'Change the sign too: the negative reciprocal of ' + t('\\frac{1}{' + n + '}') + ' is ' + t('-' + n) + '.']],
            t('\\frac{1}{' + n + '}\\times ' + c + 'h=-1\\ \\Rightarrow\\ ' + c + 'h=-' + n + '\\ \\Rightarrow\\ h=' + sT(h)), ['The product of perpendicular slopes is ' + t('-1') + '.'], 'perpendicular: 1/n and ch', t('h='));
        } },
        { id: '18b', level: 'PRG', make: function (r) { var a = r.int(2, 8), c = r.int(2, 6) * r.pick([1, 2, 3]), p = -a * c;
          return numAns('(b) ' + t(a + ',\\ \\frac{' + c + '}{p}'), p, [[c / a, 'k-perp-par', 'That makes the slopes equal (parallel). For perpendicular, the product must be ' + t('-1') + '.'], [-p, 'k-sign', 'Check the sign: the product must be ' + t('-1') + '.'], [-c / a, 'k-flip', 'From ' + t('\\frac{' + a * c + '}{p}=-1') + ': ' + t('p=-' + a * c) + '.']],
            t(a + '\\times\\frac{' + c + '}{p}=-1\\ \\Rightarrow\\ \\frac{' + a * c + '}{p}=-1\\ \\Rightarrow\\ p=' + p), ['Multiply the slopes and set the product equal to ' + t('-1') + '.'], 'perpendicular: a and c/p', t('p='));
        } },
        { id: '18c', level: 'PRG', make: function (r) { var f = gen(r, function (r) { var a = r.int(2, 6), d = r.int(2, 7); if (d % a === 0) return null; return [a, d]; }, [4, 3]), a = f[0], d = f[1], s = red(d, a);
          return numAns('(c) ' + t('-' + a + ',\\ \\frac{s}{' + d + '}'), s, [[-a * d, 'k-perp-par', 'That makes the slopes equal. Perpendicular slopes multiply to ' + t('-1') + '.'], [-d / a, 'k-sign', 'Check the sign: ' + t('-' + a + '\\times\\frac{s}{' + d + '}=-1') + ' needs ' + t('s') + ' positive.']],
            t('-' + a + '\\times\\frac{s}{' + d + '}=-1\\ \\Rightarrow\\ -\\frac{' + a + 's}{' + d + '}=-1\\ \\Rightarrow\\ s=' + sT(s)), ['The negative reciprocal of ' + t('-' + a) + ' is ' + t('\\frac{1}{' + a + '}') + ': set ' + t('\\frac{s}{' + d + '}') + ' equal to it.'], 'perpendicular: -a and s/d', t('s='));
        } },
        { id: '18d', level: 'PRG', make: function (r) { var f = gen(r, function (r) { var p = r.int(2, 5), q = r.int(3, 7), j = r.int(2, 5); if (gcd(p, q) !== 1 || p * j > 15) return null; return [p, q, p * j]; }, [2, 5, 10]), p = f[0], q = f[1], d = f[2], v = -q * d / p;
          return numAns('(d) ' + t('-\\frac{' + p + '}{' + q + '},\\ -\\frac{q}{' + d + '}'), v, [[p * d / q, 'k-perp-par', 'That makes the slopes equal (parallel). The second slope must be the negative reciprocal, ' + t('\\frac{' + q + '}{' + p + '}') + '.'], [-v, 'k-sign', 'The second slope must be positive (' + t('\\frac{' + q + '}{' + p + '}') + '), and it is written as ' + t('-\\frac{q}{' + d + '}') + ' — so ' + t('q') + ' is negative.']],
            t('-\\frac{q}{' + d + '}=\\frac{' + q + '}{' + p + '}\\ \\Rightarrow\\ -' + p + 'q=' + q * d + '\\ \\Rightarrow\\ q=' + v), ['The negative reciprocal of ' + t('-\\frac{' + p + '}{' + q + '}') + ' is ' + t('\\frac{' + q + '}{' + p + '}') + '.'], 'perpendicular: -p/q and -v/d', t('q='));
        } }] },
      /* ---------------- Q19 ---------------- */
      { num: '19', parts: [
        { id: '19', level: 'EMG', make: function (r) {
          var g = gen(r, function (r) { var P = [r.int(-8, 0), r.int(-6, 2)], R = [r.int(1, 8), r.int(-4, 8)]; var s = slopeOf(P, R); if (!okSlope(s, 5, 6) || Math.abs(s[0]) === s[1] || s[1] === 1) return null; return { P: P, R: R, s: s }; }, { P: [-6, -2], R: [3, 4], s: [2, 3] });
          var ps = perpOf(g.s);
          return slopeAns(nP('P', g.P) + ' and ' + nP('R', g.R) + ' are opposite vertices of a rhombus ' + t('PQRS') + '. Find the slope of the other diagonal, ' + t('QS') + '. (Recall: the diagonals of a rhombus are perpendicular.)', ps, relChk(g.s, 'perp'),
            'The diagonals are perpendicular, so ' + t('QS\\perp PR') + '.<br>' + t(calc(g.P, g.R, 'PR')) + ', so ' + t('m_{QS}=' + sT(ps)) + ' (check: ' + t(prodT(g.s, ps)) + ').', ['Find the slope of the diagonal you know, ' + t('PR') + '.', 'The other diagonal is perpendicular to it.'], 'rhombus: slope of the other diagonal', t('m_{QS}='));
        } }] },
      /* ---------------- Q20 ---------------- */
      { num: '20', shared: function (r) {
          return gen(r, function (r) { var a = r.int(2, 6), b = r.int(1, 6); if (gcd(a, b) !== 1 || a === b) return null; var Bv = [r.int(-3, 3), r.int(2, 8)], A = add(Bv, [-a, -b]), C = add(Bv, [b, -a]); if (r.chance(0.5)) { A = add(Bv, [-b, a]); C = add(Bv, [a, b]); } if (!inBox(A, 9) || !inBox(C, 9)) return null; var s3 = slopeOf(A, C); if (!s3) return null; return { A: A, B: Bv, C: C }; }, { A: [-4, 2], B: [0, 7], C: [5, 3] });
        },
        stem: function (s) { return nP('A', s.A) + ', ' + nP('B', s.B) + ' and ' + nP('C', s.C) + ' are the vertices of ' + t('\\triangle ABC') + '.'; },
        parts: [
          { id: '20a', level: 'EMG', make: function (r, s) {
            var s1 = slopeOf(s.A, s.B), s2 = slopeOf(s.B, s.C);
            var p = B.fields('(a) Use the slope formula to show that ' + t('\\triangle ABC') + ' is right-angled at ' + t('B') + ': find both slopes and their product.', [{ label: t('m_{AB}='), mode: 'math', keys: 'slope' }, { label: t('m_{BC}='), mode: 'math', keys: 'slope' }, { label: t('m_{AB}\\times m_{BC}='), mode: 'math', keys: 'slope' }],
              [slopeChk(s1), slopeChk(s2), K.value(-1, { diag: function (v) { if (near(v, 1)) return { code: 'sign', hint: 'Check the sign of the product: one slope is positive and one is negative.' }; return null; } })], [sT(s1), sT(s2), '-1'],
              t('m_{AB}=' + sT(s1) + ',\\ m_{BC}=' + sT(s2) + ',\\ m_{AB}\\times m_{BC}=-1'), t(calc(s.A, s.B, 'AB')) + '<br>' + t(calc(s.B, s.C, 'BC')) + '<br>' + t(prodT(s1, s2)) + ', so ' + t('AB\\perp BC') + ': the right angle is at ' + t('B') + '.', [SLOPE_HINT, 'Multiply the two slopes: perpendicular slopes give ' + t('-1') + '.'], 'show right angle at B');
            p.bad = [[sT(s1), sT(s2), '1']]; return p;
          } },
          { id: '20b', level: 'EMG', outcome: 'EXT', make: function (r, s) {
            var a = d2(s.A, s.B), b = d2(s.B, s.C), c = d2(s.A, s.C);
            var p = B.fields('(b) <i>(Extension)</i> Use the distance formula and the Pythagorean theorem to confirm that ' + t('\\triangle ABC') + ' is right-angled at ' + t('B') + ': find the three squared lengths.', [{ label: t('AB^{2}=') }, { label: t('BC^{2}=') }, { label: t('AC^{2}=') }], [K.number(a), K.number(b), K.number(c, function (v) { if (near(v, Math.sqrt(c))) return { code: 'len-no-root', hint: 'Give the <b>square</b> of the length here (no square root).' }; return null; })], [String(a), String(b), String(c)],
              t('AB^{2}=' + a + ',\\ BC^{2}=' + b + ',\\ AC^{2}=' + c), t('AB^{2}=' + (s.B[0] - s.A[0]) + '^{2}+' + nb(s.B[1] - s.A[1]) + '^{2}=' + a) + '<br>' + t('BC^{2}=' + (s.C[0] - s.B[0]) + '^{2}+' + nb(s.C[1] - s.B[1]) + '^{2}=' + b) + '<br>' + t('AC^{2}=' + (s.C[0] - s.A[0]) + '^{2}+' + nb(s.C[1] - s.A[1]) + '^{2}=' + c) + '<br>' + t(a + '+' + b + '=' + c) + ': ' + t('AB^{2}+BC^{2}=AC^{2}') + ', so the right angle is at ' + t('B') + ' ✓.', ['Squared length: ' + t('(x_2-x_1)^{2}+(y_2-y_1)^{2}') + ' — no square root needed.'], 'Pythagorean check');
            p.bad = [[String(a), String(b), String(a + b + 1)]]; return p;
          } }] },
      /* ---------------- Q21 ---------------- */
      { num: '21', parts: [
        { id: '21', level: 'BEG', make: function (r) {
          var g = gen(r, function (r) { var A = [r.int(-5, 6), r.int(-5, 8)], Bp = [r.int(-6, 6), r.int(-5, 8)]; var s = slopeOf(A, Bp); if (!okSlope(s, 5, 5) || Math.abs(s[0]) === s[1] || d2(A, Bp) < 8) return null; return { A: A, B: Bp, s: s }; }, { A: [3, 5], B: [-1, 7], s: [-1, 2] });
          var s = g.s, ps = perpOf(s);
          return B.mc(r, '<i>(Multiple choice)</i> ' + nP('A', g.A) + ' and ' + nP('B', g.B) + ' are two points. A line perpendicular to ' + t('AB') + ' will have slope', [
            { html: t(sT(ps)), right: true }, { html: t(sT(s)), why: 'That is the slope of ' + t('AB') + ' itself (a parallel line). Take the negative reciprocal.' },
            { html: t(sT(red(-s[0], s[1]))), why: 'You changed the sign but didn’t flip the fraction. Negative reciprocal: both.' }, { html: t(sT(red(s[1], s[0]))), why: 'You flipped the fraction but kept the sign. Perpendicular slopes have opposite signs.' }],
            t(calc(g.A, g.B, 'AB')) + '. The negative reciprocal is ' + t(sT(ps)) + ' (check: ' + t(prodT(s, ps)) + ').', ['Find ' + t('m_{AB}') + ', then flip it and change its sign.'], 'MC perpendicular slope from two points');
        } }] },
      /* ---------------- Q22 ---------------- */
      { num: '22', parts: [
        { id: '22', level: 'PRG', make: function (r) {
          var g = gen(r, function (r) { var X = [r.int(-2, 4), r.int(2, 8)], a = r.int(1, 4), b = r.int(2, 6); if (gcd(a, b) !== 1) return null; var j = r.int(1, 2), Y = add(X, [b * j, -a * j]); if (!inBox(Y, 10)) return null; var V = [r.int(-4, 0), r.int(-2, 5)], dx = r.int(2, 4), U0 = V[0] - dx, ps = [b, a], p = V[1] - b / a * dx; if (Number.isInteger(p) || Math.abs(p) > 12 || U0 < -9 || Math.abs(Math.abs((p * 10) % 1) - 0.5) < 0.01) return null; return { X: X, Y: Y, U0: U0, V: V, p: p, sXY: red(-a, b), ps: ps, dx: dx }; }, { X: [1, 6], Y: [7, 2], U0: -5, V: [-2, 3], p: -1.5, sXY: [-2, 3], ps: [3, 2], dx: 3 });
          var m = sV(g.ps), pPar = g.V[1] - sV(g.sXY) * g.dx, pSign = g.V[1] + m * g.dx;
          return B.approx('The line segment joining ' + t('U(' + g.U0 + ',\\ p)') + ' and ' + nP('V', g.V) + ' is perpendicular to the segment joining ' + nP('X', g.X) + ' and ' + nP('Y', g.Y) + '. Find the value of ' + t('p') + ', to the nearest tenth.', g.p, 1, { diag: function (v) { if (near(v, K.roundTo(pPar, 1))) return { code: 'k-par-perp', hint: 'You used the slope of ' + t('XY') + ' itself. ' + t('UV') + ' is <b>perpendicular</b>, so it needs the negative reciprocal.' }; if (near(v, K.roundTo(pSign, 1))) return { code: 'k-sign', hint: 'Check the signs: is ' + t('m_{UV}') + ' the <b>negative</b> reciprocal, and did you subtract in the same order top and bottom?' }; return null; } },
            t(calc(g.X, g.Y, 'XY')) + ', so ' + t('m_{UV}=' + sT(g.ps)) + '.<br>' + t('\\frac{' + g.V[1] + '-p}{' + g.V[0] + '-' + nb(g.U0) + '}=' + sT(g.ps) + '\\ \\Rightarrow\\ \\frac{' + g.V[1] + '-p}{' + g.dx + '}=' + sT(g.ps) + '\\ \\Rightarrow\\ ' + g.V[1] + '-p=' + sT(red(g.ps[0] * g.dx, g.ps[1]))) + '<br>' + t('p=' + g.V[1] + '-' + sT(red(g.ps[0] * g.dx, g.ps[1])) + '\\approx ' + K.roundTo(g.p, 1).toFixed(1)) + '.', ['Find ' + t('m_{XY}') + ' and its negative reciprocal first: that is the slope of ' + t('UV') + '.', 'Then set ' + t('\\frac{y_V-p}{x_V-x_U}') + ' equal to it and solve.'], 'perpendicular: find p (decimal)');
        } }] },
      /* ---------------- Q23 ---------------- */
      { num: '23', shared: function (r) {
          return gen(r, function (r) { var m = r.pick([2, 3, 4]) * (r.chance(0.75) ? -1 : 1), dx = r.int(3, 6), M = [r.int(-5, 1), r.int(-2, 8)], N = [M[0] + dx, M[1] + m * dx]; if (!inBox(N, 14)) return null; return { M: M, N: N, m: m }; }, { M: [-2, 7], N: [4, -5], m: -2 });
        },
        stem: function (s) { var dy = s.N[1] - s.M[1], dx2 = s.M[0] - s.N[0]; return 'Dev calculated the slope of the segment from ' + nP('M', s.M) + ' to ' + nP('N', s.N) + ' like this:\\[m_{MN}=\\frac{' + s.N[1] + '-' + nb(s.M[1]) + '}{' + s.M[0] + '-' + nb(s.N[0]) + '}=\\frac{' + dy + '}{' + dx2 + '}=' + (-s.m) + '\\]He then said that a line perpendicular to ' + t('MN') + ' has slope ' + t(sT(perpOf([-s.m, 1]))) + '.'; },
        parts: [
          { id: '23a', level: 'PRG', make: function (r, s) {
            return B.mc(r, '(a) Identify Dev’s error.', [
              { html: 'He subtracted the ' + t('y') + '’s as ' + t('N-M') + ' but the ' + t('x') + '’s as ' + t('M-N') + ' — opposite orders, which flips the sign.', right: true },
              { html: 'He put the run over the rise.', why: 'Look at his fraction: the top has the ' + t('y') + '-coordinates, so it is rise over run. Compare the <b>order</b> of the subtractions on the top and the bottom.' },
              { html: 'His perpendicular step is wrong: the perpendicular of ' + t(-s.m) + ' is ' + t(sT(red(1, -s.m))) + '.', why: 'For his slope of ' + t(-s.m) + ', the negative reciprocal really is ' + t(sT(perpOf([-s.m, 1]))) + '. The error happened earlier.' },
              { html: 'An arithmetic slip: ' + t('\\frac{' + (s.N[1] - s.M[1]) + '}{' + (s.M[0] - s.N[0]) + '}') + ' isn’t ' + t(-s.m) + '.', why: 'That division is correct. Look at which coordinate he subtracted first in each part.' }],
              'On top Dev used ' + t('y_N-y_M') + ', but on the bottom ' + t('x_M-x_N') + '. The subtractions must be in the <b>same</b> order; mixing them flips the sign of the slope.', ['Compare the order of the points on the top and on the bottom of his fraction.'], 'find the error in a slope calculation');
          } },
          { id: '23b', level: 'EMG', make: function (r, s) {
            var mm = [s.m, 1], pp = perpOf(mm);
            var p = B.fields('(b) Determine the correct slope of ' + t('MN') + ' and the slope of a line perpendicular to ' + t('MN') + '.', [{ label: t('m_{MN}='), mode: 'math', keys: 'slope' }, { label: t('m_{\\perp}='), mode: 'math', keys: 'slope' }], [slopeChk(mm), relChk(mm, 'perp')], [sT(mm), sT(pp)],
              t('m_{MN}=' + sT(mm) + ',\\quad m_{\\perp}=' + sT(pp)), 'Same order, ' + t('N') + ' minus ' + t('M') + ': ' + t(calc(s.M, s.N, 'MN')) + '.<br>Perpendicular slope: the negative reciprocal, ' + t(sT(pp)) + ' (check: ' + t(prodT(mm, pp)) + ').', ['Subtract in the same order on the top and bottom.', 'Then take the negative reciprocal of your corrected slope.'], 'correct slope and perpendicular');
            p.bad = [[String(-s.m), sT(perpOf([-s.m, 1]))]]; return p;
          } }] },
      /* ---------------- Q24 ---------------- */
      { num: '24', parts: [
        { id: '24', level: 'EMG', make: function (r) {
          var g = gen(r, function (r) { var rate = r.pick([1.85, 2.1, 2.25, 2.4, 2.6, 2.75, 3.2]), base = r.int(20, 45) / 10, d1 = r.int(2, 6), d2_ = d1 + r.int(3, 10); var c1 = Math.round((base + rate * d1) * 100) / 100, c2 = Math.round((base + rate * d2_) * 100) / 100; return { rate: rate, d1: d1, d2: d2_, c1: c1, c2: c2 }; }, { rate: 2.4, d1: 4, d2: 10, c1: 12.1, c2: 26.5 });
          var m2 = function (x) { return x.toFixed(2); };
          return B.nr('<i>(Numerical response)</i> A taxi’s fare increases at a constant rate with the distance driven. A ' + t(g.d1) + ' km trip costs ' + t('\\$' + m2(g.c1)) + ' and a ' + t(g.d2) + ' km trip costs ' + t('\\$' + m2(g.c2)) + '. The slope of the graph of fare (in dollars) against distance (in kilometres), in dollars per kilometre, is ____.', g.rate,
            function (v) { if (Math.abs(v - 1 / g.rate) < 0.006) return { code: 'rate-flip', hint: 'That is kilometres per dollar. The slope of fare against distance is ' + t('\\frac{\\text{change in fare}}{\\text{change in distance}}') + ' — dollars per kilometre.' }; if (Math.abs(v - g.c2 / g.d2) < 0.006 || Math.abs(v - g.c1 / g.d1) < 0.006) return { code: 'rate-one', hint: 'Dividing one fare by its distance includes the starting fee. Use the <b>change</b> in fare over the <b>change</b> in distance.' }; if (Math.abs(v - (g.c2 - g.c1)) < 0.006) return { code: 'rate-no-run', hint: 'That is the change in fare — divide it by the change in distance.' }; return null; },
            'Points (distance, fare): ' + t('(' + g.d1 + ',\\ ' + m2(g.c1) + ')') + ' and ' + t('(' + g.d2 + ',\\ ' + m2(g.c2) + ')') + '.<br>' + t('m=\\frac{' + m2(g.c2) + '-' + m2(g.c1) + '}{' + g.d2 + '-' + g.d1 + '}=\\frac{' + m2(g.c2 - g.c1) + '}{' + (g.d2 - g.d1) + '}=' + g.rate) + ' — the fare rises ' + t('\\$' + m2(g.rate)) + ' for every kilometre.', ['Treat each trip as a point (distance, fare) and use the slope formula.'], 'NR rate of change: taxi fare');
        } }] },
      /* ---------------- Q25 ---------------- */
      { num: '25', shared: function (r) {
          return gen(r, function (r) { var q = r.int(2, 5), p = r.int(1, 4) * (r.chance(0.7) ? 1 : -1); if (gcd(Math.abs(p), q) !== 1 || Math.abs(p) === q) return null; var Bv = [r.int(-1, 3), r.int(-2, 4)], C = add(Bv, [q * 2, p * 2]), j = r.int(1, 2), A = [Bv[0] - q * j, Bv[1] - p * j]; if (!inBox(C, 12) || !inBox(A, 12)) return null; var D = [r.int(-2, 4), r.int(-4, 3)], dxE = Math.abs(p) * r.int(1, 2), E = [D[0] + dxE, D[1] - q * dxE / p]; if (!inBox(E, 14)) return null; return { A: A, B: Bv, C: C, k: A[1], s: red(p, q), D: D, E: E, t: E[1] }; }, { A: [-3, -1], B: [1, 2], C: [9, 8], k: -1, s: [3, 4], D: [2, -1], E: [5, -5], t: -5 });
        },
        stem: function (s) { return 'Consider the points ' + t('A(' + s.A[0] + ',\\ k)') + ', ' + nP('B', s.B) + ' and ' + nP('C', s.C) + '.'; },
        parts: [
          { id: '25a', level: 'PRG', make: function (r, s) { var dx = s.B[0] - s.A[0], rise = s.B[1] - s.A[1];
            return numAns('(a) Find the value of ' + t('k') + ' so that ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' are collinear.', s.k, [[s.B[1] + rise, 'k-sign', 'Check the sign: ' + t('A') + ' is to the left of ' + t('B') + ', so going from ' + t('B') + ' back to ' + t('A') + ' you go ' + (rise > 0 ? 'down' : 'up') + '.'], [-s.k, 'k-sign', 'Check the sign as you solve.']],
              t(calc(s.B, s.C, 'BC')) + '. Collinear (sharing ' + t('B') + ') needs ' + t('m_{AB}=' + sT(s.s)) + ':<br>' + t('\\frac{' + s.B[1] + '-k}{' + s.B[0] + '-' + nb(s.A[0]) + '}=' + sT(s.s) + '\\ \\Rightarrow\\ \\frac{' + s.B[1] + '-k}{' + dx + '}=' + sT(s.s) + '\\ \\Rightarrow\\ ' + s.B[1] + '-k=' + rise + '\\ \\Rightarrow\\ k=' + s.k) + '.', ['Find ' + t('m_{BC}') + ', then make ' + t('m_{AB}') + ' equal to it.'], 'collinear: find k', t('k='));
          } },
          { id: '25b', level: 'PRG', make: function (r, s) { var ps = perpOf(s.s), dx = s.E[0] - s.D[0], rise = s.E[1] - s.D[1];
            return numAns('(b) The segment from ' + nP('D', s.D) + ' to ' + t('E(' + s.E[0] + ',\\ t)') + ' is perpendicular to line ' + t('AC') + '. Find the value of ' + t('t') + '.', s.t, [[s.D[1] + sV(s.s) * dx, 'k-par-perp', 'That gives ' + t('DE') + ' the same slope as ' + t('AC') + ' (parallel). For perpendicular, use the negative reciprocal, ' + t(sT(ps)) + '.'], [s.D[1] - rise, 'k-sign', 'Check the sign when you solve for ' + t('t') + '.']],
              'Line ' + t('AC') + ' has slope ' + t(sT(s.s)) + ', so ' + t('DE') + ' needs slope ' + t(sT(ps)) + ':<br>' + t('\\frac{t-' + nb(s.D[1]) + '}{' + s.E[0] + '-' + nb(s.D[0]) + '}=' + sT(ps) + '\\ \\Rightarrow\\ \\frac{t-' + nb(s.D[1]) + '}{' + dx + '}=' + sT(ps) + '\\ \\Rightarrow\\ t-' + nb(s.D[1]) + '=' + rise + '\\ \\Rightarrow\\ t=' + s.t) + '.', ['The slope of line ' + t('AC') + ' is the slope from (a). ' + t('DE') + ' needs its negative reciprocal.'], 'perpendicular: find t', t('t='));
          } }] }
    ],

    /* ======================================== EXTRA PRACTICE ======================================== */
    extra: [
      { num: '1', section: 'Extra practice A — Three ways to test collinearity', shared: function (r) { return collinear3(r, { q: [2, 5], p: [1, 4], a: [2, 3], c: [2, 3, 4], x0: [-9, -5], y0: [-7, 2], box: 12, noSq: true, fb: { X: [-8, -5], Y: [-2, -1], Z: [7, 5], v: [3, 2], a: 2, c: 3, s: [2, 3] } }); },
        stem: function (s) { return 'Consider the points ' + nP('A', s.X) + ', ' + nP('B', s.Y) + ' and ' + nP('C', s.Z) + '.'; },
        parts: [
          { id: 'e1a', level: 'EMG', make: function (r, s) { return slopeFields('(a) Test the points for collinearity by comparing ' + t('m_{AB}') + ' with ' + t('m_{BC}') + '.', [{ nm: 'AB', s: s.s }, { nm: 'BC', s: s.s }], t(calc(s.X, s.Y, 'AB')) + '<br>' + t(calc(s.Y, s.Z, 'BC')) + '<br>Equal slopes sharing ' + t('B') + ': <b>collinear</b>.', [SLOPE_HINT], 'collinear test m_AB vs m_BC'); } },
          { id: 'e1b', level: 'BEG', make: function (r, s) { return slopeAns('(b) Test them again: find ' + t('m_{AC}') + ' and compare it with ' + t('m_{AB}') + '.', s.s, null, t(calc(s.X, s.Z, 'AC')) + ' — equal to ' + t('m_{AB}') + ', and the segments share ' + t('A') + ': collinear again.', [SLOPE_HINT], 'm_AC', t('m_{AC}=')); } },
          { id: 'e1c', level: 'PRG', outcome: 'EXT', make: function (r, s) {
            var p = B.fields('(c) Test them a third way: find the exact lengths ' + t('AB') + ', ' + t('BC') + ' and ' + t('AC') + ' (simplest radical form). Does ' + t('AB+BC=AC') + '?', [radField('AB'), radField('BC'), radField('AC')], [radChk(s.X, s.Y), radChk(s.Y, s.Z), radChk(s.X, s.Z)], [lenT(s.X, s.Y), lenT(s.Y, s.Z), lenT(s.X, s.Z)],
              t('AB=' + lenT(s.X, s.Y) + ',\\ BC=' + lenT(s.Y, s.Z) + ',\\ AC=' + lenT(s.X, s.Z)), t('AB=\\sqrt{' + d2(s.X, s.Y) + '}=' + lenT(s.X, s.Y) + ',\\ BC=\\sqrt{' + d2(s.Y, s.Z) + '}=' + lenT(s.Y, s.Z) + ',\\ AC=\\sqrt{' + d2(s.X, s.Z) + '}=' + lenT(s.X, s.Z)) + '<br>' + t('AB+BC=' + lenT(s.X, s.Y) + '+' + lenT(s.Y, s.Z) + '=' + lenT(s.X, s.Z) + '=AC') + ': collinear, with ' + t('B') + ' between ' + t('A') + ' and ' + t('C') + '.', ['Distance formula, then simplify each radical so they can be added.'], 'collinear by distance');
            p.bad = [[String(d2(s.X, s.Y)), lenT(s.Y, s.Z), lenT(s.X, s.Z)]]; return p;
          } },
          { id: 'e1d', level: 'EMG', make: function (r) {
            return B.mc(r, '(d) Three tests of collinearity can be used on ' + t('A') + ', ' + t('B') + ', ' + t('C') + ': compare ' + t('m_{AB}') + ' with ' + t('m_{BC}') + '; compare ' + t('m_{AC}') + ' with ' + t('m_{AB}') + '; or find the exact lengths and check whether ' + t('AB+BC=AC') + '. All three reach the same verdict. Which one is the fastest, and why?', [
              { html: 'A slope test: two subtractions and one fraction each, then compare two numbers.', right: true },
              { html: 'The distance test: it uses all three points at once.', why: 'It needs three lengths, each with two squares, a square root and a simplification, before you can add and compare.' },
              { html: 'They take the same time, because they all use the same coordinates.', why: 'Count the steps: one slope is two subtractions and a fraction; one length is two subtractions, two squares, a sum, a root and a simplification.' },
              { html: 'The distance test, because radicals are exact.', why: 'Slopes are exact too (fractions). Being exact isn’t the same as being fast.' }],
              'A slope is two subtractions and a fraction to reduce, and comparing ' + t('m_{AB}') + ' with ' + t('m_{BC}') + ' is immediate. The distance test needs three lengths, each with squares, a root and a simplification.', ['Count the operations each test needs.'], 'fastest collinearity test');
          } },
          { id: 'e1e', level: 'EMG', make: function (r) {
            return B.mc(r, '(e) Suppose the three points had <b>not</b> been collinear. What would the slope test (compare ' + t('m_{AB}') + ' with ' + t('m_{BC}') + ') and the distance test (does ' + t('AB+BC=AC') + '?) have shown?', [
              { html: 'The two slopes would be different, and the two shorter lengths would add to <b>more</b> than the longest: ' + t('AB+BC>AC') + '.', right: true },
              { html: 'The slopes would multiply to ' + t('-1') + ', and ' + t('AB+BC<AC') + '.', why: 'A product of ' + t('-1') + ' only happens when the bend is a right angle. And a bent path from ' + t('A') + ' through ' + t('B') + ' to ' + t('C') + ' is <b>longer</b> than the straight one, never shorter.' },
              { html: 'The slopes would still be equal, but ' + t('AB+BC\\ne AC') + '.', why: 'If ' + t('m_{AB}=m_{BC}') + ' with ' + t('B') + ' shared, the points ARE collinear. Off the line, the slopes differ.' },
              { html: 'The tests can’t show it — you would need a graph.', why: 'Both tests decide it: different slopes, or ' + t('AB+BC>AC') + '.' }],
              '<b>Slope tests:</b> the two slopes would be different numbers. <b>Distance test:</b> ' + t('AB+BC>AC') + ', because a bent path from ' + t('A') + ' through ' + t('B') + ' to ' + t('C') + ' is longer than the straight path from ' + t('A') + ' to ' + t('C') + '.', ['Picture a bend at ' + t('B') + ': what happens to the slopes, and to the total length?'], 'what non-collinear looks like');
          } }] },
      { num: '2', shared: function (r) {
          return gen(r, function (r) { var g = r.int(2, 6), q = r.int(1, 3), p = r.int(1, 3); if (gcd(p, q) !== 1) return null; var v = [g * q, -g * p], a = r.int(1, 2), b = r.int(1, 2); var D = [r.int(-8, -2), r.int(2, 9)], F = add(D, v, a), E = add(F, v, b); if (!inBox(E, 14)) return null; return { D: D, E: E, F: F, s: red(-p, q) }; }, { D: [-4, 7], E: [8, -5], F: [2, 1], s: [-1, 1] });
        },
        stem: function (s) { return 'Fatima is testing ' + nP('D', s.D) + ', ' + nP('E', s.E) + ' and ' + nP('F', s.F) + ' for collinearity with the distance formula. She calculates ' + t('DE=' + lenT(s.D, s.E)) + ', ' + t('EF=' + lenT(s.E, s.F)) + ' and ' + t('DF=' + lenT(s.D, s.F)) + ', then writes: <i>“' + t('DE+EF=' + lenT(s.D, s.E) + '+' + lenT(s.E, s.F)) + ', which is not ' + t('DF=' + lenT(s.D, s.F)) + ', so the three points are not collinear.”</i> Her three lengths are all correct.'; },
        parts: [
          { id: 'e2a', level: 'EMG', make: function (r, s) {
            var sl = sT(s.s);
            return B.mc(r, '(a) Use slopes to decide whether her conclusion is correct.', [
              { html: 'She is <b>wrong</b>: ' + t('m_{DE}=m_{DF}=' + sl) + ' through the shared point ' + t('D') + ', so the points are collinear.', right: true },
              { html: 'She is <b>right</b>: ' + t('m_{DE}\\ne m_{DF}') + '.', why: 'Calculate both slopes and reduce them — they are equal.' },
              { html: 'She is <b>right</b>: the lengths don’t add up, so the points can’t be collinear.', why: 'She added the wrong pair. Check with slopes: ' + t('m_{DE}') + ' and ' + t('m_{DF}') + '.' },
              { html: 'She is <b>wrong</b>: ' + t('m_{DE}\\times m_{DF}=-1') + '.', why: 'Multiply them — the product isn’t ' + t('-1') + ' (and ' + t('-1') + ' would mean perpendicular, not collinear).' }],
              t(calc(s.D, s.E, 'DE')) + ', ' + t(calc(s.D, s.F, 'DF')) + '. Equal slopes through the shared point ' + t('D') + ', so ' + t('D') + ', ' + t('E') + ', ' + t('F') + ' <b>are</b> collinear: her conclusion is wrong.', [SLOPE_HINT], 'slopes overturn a distance test');
          } },
          { id: 'e2b', level: 'PRG', make: function (r, s) {
            return B.mc(r, '(b) Which point lies between the other two, and which equation should the distance test have checked?', [
              { html: t('F') + ' is between: check ' + t('DF+FE=DE') + '.', right: true },
              { html: t('E') + ' is between: check ' + t('DE+EF=DF') + '.', why: 'That is what Fatima checked — but ' + t('DE') + ' is the longest length, so ' + t('E') + ' can’t be in the middle.' },
              { html: t('D') + ' is between: check ' + t('ED+DF=EF') + '.', why: 'The middle point is the one whose two distances add to the <b>longest</b> length. The longest here is ' + t('DE') + '.' },
              { html: t('F') + ' is between: check ' + t('DE+DF=EF') + '.', why: 'If ' + t('F') + ' is in the middle, the two short pieces are ' + t('DF') + ' and ' + t('FE') + ', and they add to ' + t('DE') + '.' }],
              'The longest length is ' + t('DE=' + lenT(s.D, s.E)) + ', so ' + t('F') + ' is between ' + t('D') + ' and ' + t('E') + '. Check: ' + t('DF+FE=' + lenT(s.D, s.F) + '+' + lenT(s.F, s.E) + '=' + lenT(s.D, s.E) + '=DE') + ' ✓. Fatima checked ' + t('DE+EF=DF') + ', which puts ' + t('E') + ' in the middle.', ['The two short pieces add to the long one. Which length is longest?'], 'which point is in the middle');
          } },
          { id: 'e2c', level: 'EMG', make: function (r) {
            return B.mc(r, '(c) What does the distance test require that the slope test does not?', [
              { html: 'Knowing which point lies <b>between</b> the other two.', right: true },
              { html: 'Exact answers.', why: 'Both tests can be done exactly.' },
              { html: 'A graph of the points.', why: 'Neither test needs a graph.' },
              { html: 'That the points are not on a vertical line.', why: 'Distances work fine on a vertical line; it is the slope test that has to treat “undefined” carefully.' }],
              'The distance test needs to know which point is in the middle (the two short pieces must add to the long one). The slope test works whatever order the points are taken in.', ['Fatima’s mistake shows it.'], 'what the distance test needs');
          } }] },
      { num: '3', shared: function (r) {
          var colA = r.chance(0.5);
          function slanted(r, coll) { return gen(r, function (r) { var q = r.int(2, 6), p = r.int(1, 6); if (gcd(p, q) !== 1 || p === q) return null; var sg = r.chance(0.5) ? 1 : -1, v = [q, sg * p], A = [r.int(-6, -2), r.int(-9, 4)], a = r.int(1, 2), c = r.int(1, 2), Bp = add(A, v, a), C = add(Bp, v, c); if (!coll) C = [C[0], C[1] + r.pick([-1, 1])]; if (!inBox(C, 12)) return null; var s2 = slopeOf(Bp, C); if (!okSlope(s2, 8, 9)) return null; return [A, Bp, C]; }, null); }
          var A = slanted(r, colA), Cc = slanted(r, !colA);
          if (!A || !Cc) return { a: [[-4, -9], [0, -3], [6, 6]], c: [[-3, 4], [2, -1], [8, -6]], colA: true, colC: false, b: [[5, -2], [5, 7], [5, 13]], d: [[-7, 3], [1, 3], [15, 3]] };
          var x = r.int(-6, 6), y1 = r.int(-6, 0), b = [[x, y1], [x, y1 + r.int(3, 9)], [x, y1 + r.int(10, 15)]], y = r.int(-5, 6), x1 = r.int(-9, -3), d = [[x1, y], [x1 + r.int(4, 8), y], [x1 + r.int(10, 22), y]];
          return { a: A, c: Cc, colA: colA, colC: !colA, b: b, d: d };
        },
        stem: 'Decide whether each set of three points is collinear: find the two slopes that settle it.',
        parts: (function () {
          var NM = { a: ['A', 'B', 'C'], b: ['P', 'Q', 'R'], c: ['D', 'E', 'F'], d: ['G', 'H', 'I'] };
          function mk(w, level) {
            return { id: 'e3' + w, level: level, make: function (r, s) {
              var P = s[w], N = NM[w], s1 = slopeOf(P[0], P[1]), s2 = slopeOf(P[1], P[2]);
              var col = sEq(s1, s2), extra = w === 'b' ? ' Both slopes are undefined: every point has ' + t('x=' + P[0][0]) + ', so both segments lie on the one vertical line ' + t('x=' + P[0][0]) + ': collinear.' : w === 'd' ? ' Both slopes are ' + t('0') + ' and the segments share ' + t(N[1]) + '; all three points are on the horizontal line ' + t('y=' + P[0][1]) + ': collinear.' : col ? ' Equal slopes sharing ' + t(N[1]) + ': <b>collinear</b>.' : ' ' + t(sT(s1) + '\\ne ' + sT(s2)) + ': <b>not collinear</b>.';
              return slopeFields('(' + w + ') ' + N.map(function (n, i) { return nP(n, P[i]); }).join(', '), [{ nm: N[0] + N[1], s: s1 }, { nm: N[1] + N[2], s: s2 }], t(calc(P[0], P[1], N[0] + N[1])) + '<br>' + t(calc(P[1], P[2], N[1] + N[2])) + '<br>' + extra, [SLOPE_HINT, 'A run of ' + t('0') + ' means the slope is undefined; a rise of ' + t('0') + ' means the slope is ' + t('0') + '.'], 'collinear? two slopes');
            } };
          }
          return [mk('a', 'BEG'), mk('b', 'BEG'), mk('c', 'BEG'), mk('d', 'BEG'),
            { id: 'e3v', sub: 'verdict', level: 'EMG', make: function (r, s) {
              var rows = ['a', 'b', 'c', 'd'].map(function (w) { return { id: w, html: '(' + w + ') ' + NM[w].map(function (n, i) { return nP(n, s[w][i]); }).join(', ') }; }), cols = [{ id: 'y', html: 'Collinear' }, { id: 'n', html: 'Not collinear' }];
              var want = { a: s.colA ? 'y' : 'n', b: 'y', c: s.colC ? 'y' : 'n', d: 'y' };
              return B.grid('Give the verdict for each set of three points.', rows, cols, want, { why: function (row) { if (row === 'b') return 'In (b) both slopes are undefined: all three points share the same ' + t('x') + ', so they are on one vertical line.'; if (row === 'd') return 'In (d) both slopes are ' + t('0') + ': all three points share the same ' + t('y') + ' — one horizontal line.'; return 'Compare the two slopes in (' + row + '): collinear only if they are equal.'; } },
                '(a) ' + (s.colA ? 'equal slopes: collinear' : 'different slopes: not collinear') + '. (b) both undefined, all on ' + t('x=' + s.b[0][0]) + ': collinear. (c) ' + (s.colC ? 'equal slopes: collinear' : 'different slopes: not collinear') + '. (d) both ' + t('0') + ', all on ' + t('y=' + s.d[0][1]) + ': collinear.', ['Equal slopes through a shared point → collinear.'], 'collinearity verdicts');
            } },
            { id: 'e3e', sub: 'e', level: 'EMG', make: function (r, s) {
              return B.mc(r, 'In (b), ' + NM.b.map(function (n, i) { return nP(n, s.b[i]); }).join(', ') + ' give two undefined slopes; in (d), ' + NM.d.map(function (n, i) { return nP(n, s.d[i]); }).join(', ') + ' give two slopes of ' + t('0') + '. Neither needs a fraction such as ' + t('\\tfrac{3}{4}') + '. Why is the argument there still a slope argument?', [
                { html: '“Undefined” and “' + t('0') + '” are answers the slope formula gives; two segments with the same slope through a shared point lie on one line.', right: true },
                { html: 'It isn’t — collinearity in (b) and (d) can only be seen from a graph.', why: 'The slope formula settles it: in (b) every run is ' + t('0') + ' (undefined), in (d) every rise is ' + t('0') + '.' },
                { html: 'Because ' + t('0') + ' and undefined slopes multiply to ' + t('-1') + '.', why: 'They can’t be multiplied at all — and ' + t('-1') + ' would be about perpendicular lines anyway.' },
                { html: 'Because vertical and horizontal lines are always collinear.', why: 'Collinear is about <b>points</b> on one line. Here the points share an ' + t('x') + ' (one vertical line) or a ' + t('y') + ' (one horizontal line).' }],
                'In (b) every run is ' + t('0') + ', so every slope is undefined, and all three points share ' + t('x=' + s.b[0][0]) + ' — the same vertical line. In (d) every rise is ' + t('0') + ', so every slope is ' + t('0') + ', and all three share ' + t('y=' + s.d[0][1]) + '. “Undefined” and “' + t('0') + '” are results of the slope formula, and equal slopes through a shared point mean one line.', ['What does the slope formula give for each pair of points?'], 'undefined/zero slopes still prove collinear');
            } }];
        })() },
      { num: '4', section: 'Extra practice B — Solving for k', stem: 'Determine the value of ' + t('k') + ' that makes the three points <b>collinear</b>.', parts: [
        { id: 'e4a', level: 'PRG', make: function (r) {
          var g = gen(r, function (r) { var q = r.int(1, 4), p = r.int(1, 4) * (r.chance(0.7) ? 1 : -1); if (gcd(Math.abs(p), q) !== 1) return null; var A = [r.int(-5, -1), r.int(-3, 4)], j = r.int(1, 2), c = r.int(2, 8), Bp = add(A, [q * j * 2, p * j * 2]), C = add(Bp, [q * c, p * c]); if (!inBox(C, 16)) return null; return { A: A, B: Bp, C: C, s: red(p, q) }; }, { A: [-3, 2], B: [1, 6], C: [9, 14], s: [1, 1] });
          return numAns('(a) ' + nP('A', g.A) + ', ' + t('B(' + g.B[0] + ',\\ k)') + ', ' + nP('C', g.C), g.B[1], [[g.A[1] - (g.B[1] - g.A[1]), 'k-sign', 'Check the sign: from ' + t('A') + ' to ' + t('B') + ' you move right, so the rise has the same sign as the slope.']],
            t(calc(g.A, g.C, 'AC')) + '. ' + t('B') + ' must give the same slope from ' + t('A') + ': ' + t('\\frac{k-' + nb(g.A[1]) + '}{' + g.B[0] + '-' + nb(g.A[0]) + '}=' + sT(g.s) + '\\ \\Rightarrow\\ k=' + g.B[1]) + '.', ['Use the two known points to find the slope of the line. Then ' + t('B') + ' must give the same slope.'], 'collinear: unknown y in the middle', t('k='));
        } },
        { id: 'e4b', level: 'PRG', make: function (r) {
          var g = gen(r, function (r) { var q = r.int(1, 3), p = r.int(1, 4) * (r.chance(0.7) ? -1 : 1); if (gcd(Math.abs(p), q) !== 1) return null; var Q = [r.int(-2, 4), r.int(-5, 2)], c = r.int(2, 4), R = add(Q, [q * c, p * c]), j = r.int(1, 4), P = [Q[0] - q * j, Q[1] - p * j]; if (!inBox(R, 16) || !inBox(P, 14)) return null; return { P: P, Q: Q, R: R, s: red(p, q) }; }, { P: [-2, 5], Q: [2, -3], R: [6, -11], s: [-2, 1] });
          return numAns('(b) ' + t('P(k,\\ ' + g.P[1] + ')') + ', ' + nP('Q', g.Q) + ', ' + nP('R', g.R), g.P[0], [[g.Q[0] + (g.Q[0] - g.P[0]), 'k-sign', 'Check the sign when you solve for the run ' + t(g.Q[0] + '-k') + '.']],
            t(calc(g.Q, g.R, 'QR')) + '. ' + t('\\frac{' + g.Q[1] + '-' + nb(g.P[1]) + '}{' + g.Q[0] + '-k}=' + sT(g.s) + '\\ \\Rightarrow\\ ' + g.Q[0] + '-k=' + (g.Q[0] - g.P[0]) + '\\ \\Rightarrow\\ k=' + g.P[0]) + '.', ['Find ' + t('m_{QR}') + ', then make ' + t('m_{PQ}') + ' equal to it.'], 'collinear: unknown x', t('k='));
        } },
        { id: 'e4c', level: 'ADV', make: function (r) {
          var g = gen(r, function (r) { var q = r.int(1, 3), p = r.int(1, 4); if (gcd(p, q) !== 1 || p === q) return null; var A = [r.int(-5, -1), r.int(-9, -3)], Bp = add(A, [q, p], r.int(2, 6)); if (!inBox(Bp, 14)) return null; var kn = q * A[1] - p * A[0], kd = q - p; if (kn % kd) return null; var k = kn / kd; if (Math.abs(k) > 12 || sameP([k, k], A) || sameP([k, k], Bp)) return null; return { A: A, B: Bp, s: red(p, q), k: k }; }, { A: [-2, -8], B: [4, 10], s: [3, 1], k: 1 });
          return numAns('(c) ' + nP('A', g.A) + ', ' + nP('B', g.B) + ' and the point ' + t('M(k,\\ k)'), g.k, [[-g.k, 'k-sign', 'Check the signs as you expand and collect the ' + t('k') + '-terms.']],
            t(calc(g.A, g.B, 'AB')) + '<br>' + t('\\frac{k-' + nb(g.A[1]) + '}{k-' + nb(g.A[0]) + '}=' + sT(g.s)) + ', cross-multiply and collect: ' + t('k=' + g.k) + ', so ' + t('M(' + g.k + ',\\ ' + g.k + ')') + '.', ['Both coordinates of ' + t('M') + ' are ' + t('k') + '. Set ' + t('m_{AM}=m_{AB}') + ', cross-multiply, and collect the ' + t('k') + '-terms.'], 'collinear: M(k,k)', t('k='));
        } },
        { id: 'e4d', level: 'MAS', make: function (r) {
          var g = gen(r, function (r) { var k = r.int(2, 9), c = r.int(1, k - 1); if ((k * k) % c) return null; var d = k * k / c; if (d > 25 || d === c) return null; return { k: k, c: c, d: d }; }, { k: 6, c: 3, d: 12 });
          var p = B.valueSet('(d) ' + t('O(0,\\ 0)') + ', ' + t('S(' + g.c + ',\\ k)') + ', ' + t('T(k,\\ ' + g.d + ')') + ' — there are <b>two</b> answers; find both.', [g.k, -g.k], { v: 'k' },
            t('m_{OS}=\\frac{k}{' + g.c + '},\\ m_{OT}=\\frac{' + g.d + '}{k}') + '<br>' + t('\\frac{k}{' + g.c + '}=\\frac{' + g.d + '}{k}\\ \\Rightarrow\\ k^{2}=' + g.c * g.d + '\\ \\Rightarrow\\ k=\\pm' + g.k) + '<br>Check ' + t('k=' + g.k) + ': both slopes ' + t(sT(red(g.k, g.c))) + '. Check ' + t('k=-' + g.k) + ': both slopes ' + t(sT(red(-g.k, g.c))) + ' ✓', ['Set ' + t('m_{OS}=m_{OT}') + ' and cross-multiply.', 'A square has two square roots.'], 'collinear: k squared');
          p.bad = ['k=' + g.k]; return p;
        } }] },
      { num: '5', stem: 'Determine the value of ' + t('k') + ' that makes ' + t('AB\\parallel CD') + '.', parts: [
        { id: 'e5a', level: 'PRG', make: function (r) {
          var g = gen(r, function (r) { var q = r.int(2, 4), p = r.int(1, 4) * (r.chance(0.7) ? 1 : -1); if (gcd(Math.abs(p), q) !== 1) return null; var A = [r.int(-5, -2), r.int(-2, 3)], Bp = add(A, [q * 2, p * 2]), C = [r.int(-2, 1), r.int(-4, 0)], j = r.int(2, 3), D = add(C, [q * j, p * j]); if (!inBox(D, 14) || !inBox(Bp, 14)) return null; return { A: A, B: Bp, C: C, D: D, s: red(p, q) }; }, { A: [-4, 1], B: [2, 5], C: [0, -3], D: [9, 3], s: [2, 3] });
          return numAns('(a) ' + nP('A', g.A) + ', ' + nP('B', g.B) + ', ' + nP('C', g.C) + ', ' + t('D(' + g.D[0] + ',\\ k)'), g.D[1], [[g.C[1] - (g.D[1] - g.C[1]), 'k-sign', 'Check the sign as you solve.'], [g.C[1] - sV(perpOf(g.s)) * (g.D[0] - g.C[0]) * -1, 'k-perp-par', 'Parallel: use the <b>same</b> slope, not the negative reciprocal.']],
            t(calc(g.A, g.B, 'AB')) + '. Parallel, so ' + t('\\frac{k-' + nb(g.C[1]) + '}{' + g.D[0] + '-' + nb(g.C[0]) + '}=' + sT(g.s) + '\\ \\Rightarrow\\ k=' + g.D[1]) + '.', ['Parallel segments have equal slopes: find ' + t('m_{AB}') + ' and make ' + t('m_{CD}') + ' equal to it.'], 'parallel: unknown y', t('k='));
        } },
        { id: 'e5b', level: 'PRG', make: function (r) {
          var g = gen(r, function (r) { var q = r.int(1, 3), p = r.int(1, 4) * (r.chance(0.7) ? -1 : 1); if (gcd(Math.abs(p), q) !== 1) return null; var C = [r.int(-7, -3), r.int(-2, 4)], D = add(C, [q, p], r.int(2, 4)), Bp = [r.int(1, 5), r.int(3, 8)], j = r.pick([-3, -2, -1, 1, 2, 3]), A = [Bp[0] - q * j, Bp[1] - p * j]; if (!inBox(D, 14) || !inBox(A, 14)) return null; return { A: A, B: Bp, C: C, D: D, s: red(p, q) }; }, { A: [7, -2], B: [4, 7], C: [-6, 3], D: [-2, -9], s: [-3, 1] });
          return numAns('(b) ' + t('A(k,\\ ' + g.A[1] + ')') + ', ' + nP('B', g.B) + ', ' + nP('C', g.C) + ', ' + nP('D', g.D), g.A[0], [[g.B[0] + (g.B[0] - g.A[0]), 'k-sign', 'Check the sign when you solve for the run ' + t(g.B[0] + '-k') + '.']],
            t(calc(g.C, g.D, 'CD')) + '. ' + t('\\frac{' + g.B[1] + '-' + nb(g.A[1]) + '}{' + g.B[0] + '-k}=' + sT(g.s) + '\\ \\Rightarrow\\ ' + g.B[0] + '-k=' + (g.B[0] - g.A[0]) + '\\ \\Rightarrow\\ k=' + g.A[0]) + '.', ['Find ' + t('m_{CD}') + ' first.'], 'parallel: unknown x', t('k='));
        } },
        { id: 'e5c', level: 'ADV', make: function (r) {
          var g = gen(r, function (r) { var q = r.int(1, 4), p = r.int(1, 5) * (r.chance(0.8) ? 1 : -1); if (gcd(Math.abs(p), q) !== 1) return null; var C = [r.int(-1, 3), r.int(-5, -1)], D = add(C, [q, p], r.int(1, 3)); if (!inBox(D, 14)) return null; var e = q * r.int(1, 4), xA = r.int(-6, -2), k = e * p / q; if (!Number.isInteger(k) || !k || Math.abs(k) > 16) return null; return { xA: xA, xB: xA + e, C: C, D: D, k: k, s: red(p, q), e: e }; }, { xA: -5, xB: 3, C: [1, -4], D: [7, 5], k: 12, s: [3, 2], e: 8 });
          return numAns('(c) ' + t('A(' + g.xA + ',\\ k)') + ', ' + t('B(' + g.xB + ',\\ 2k)') + ', ' + nP('C', g.C) + ', ' + nP('D', g.D), g.k, [[-g.k, 'k-sign', 'Check the sign.'], [g.k * 3, 'k-flip', 'The rise from ' + t('A') + ' to ' + t('B') + ' is ' + t('2k-k=k') + ', not ' + t('3k') + '.']],
            t(calc(g.C, g.D, 'CD')) + '<br>' + t('m_{AB}=\\frac{2k-k}{' + g.xB + '-' + nb(g.xA) + '}=\\frac{k}{' + g.e + '}') + ', so ' + t('\\frac{k}{' + g.e + '}=' + sT(g.s) + '\\ \\Rightarrow\\ k=' + g.k) + '.', ['Simplify the rise ' + t('2k-k') + ' first.'], 'parallel: k in both y-coordinates', t('k='));
        } },
        { id: 'e5d', level: 'ADV', make: function (r) {
          var g = gen(r, function (r) { var a = r.int(2, 3), b = r.int(-9, 9), x0 = r.int(-6, 8); if (!b || b % (a - 1)) return null; var k = -b / (a - 1); if (k === x0 || Math.abs(k) > 9) return null; return { a: a, b: b, k: k, x0: x0, y: [r.int(-4, 3), r.int(-6, -1)], cy: [r.int(1, 5), r.int(7, 12)] }; }, { a: 2, b: 3, k: -3, x0: 6, y: [1, -4], cy: [4, 10] });
          var expr = (g.a === 1 ? '' : g.a) + 'k' + (g.b > 0 ? '+' + g.b : g.b);
          return numAns('(d) ' + t('A(' + g.x0 + ',\\ ' + g.y[0] + ')') + ', ' + t('B(' + g.x0 + ',\\ ' + g.y[1] + ')') + ', ' + t('C(k,\\ ' + g.cy[0] + ')') + ', ' + t('D(' + expr + ',\\ ' + g.cy[1] + ')') + ' <i>(Careful — ' + t('m_{AB}') + ' is not a number.)</i>', g.k, [[g.x0, 'k-par-perp', 'That puts ' + t('C') + ' on the line ' + t('x=' + g.x0) + ' itself — but then ' + t('D') + ' wouldn’t share its ' + t('x') + '. ' + t('C') + ' and ' + t('D') + ' need the <b>same</b> ' + t('x') + '-coordinate.'], [-g.k, 'k-sign', 'Solve ' + t('k=' + expr) + ' carefully.']],
            t('m_{AB}=\\frac{' + g.y[1] + '-' + nb(g.y[0]) + '}{' + g.x0 + '-' + nb(g.x0) + '}=\\frac{' + (g.y[1] - g.y[0]) + '}{0}') + ': undefined, so ' + t('AB') + ' is vertical (on ' + t('x=' + g.x0) + ').<br>' + t('CD') + ' must be vertical too, so ' + t('C') + ' and ' + t('D') + ' share an ' + t('x') + '-coordinate: ' + t('k=' + expr + '\\ \\Rightarrow\\ k=' + g.k) + '.', ['A vertical segment is parallel only to another vertical segment.', 'Vertical means both endpoints have the same ' + t('x') + '.'], 'parallel to a vertical segment', t('k='));
        } }] },
      { num: '6', stem: 'Determine the value of ' + t('k') + ' that makes ' + t('AB\\perp CD') + '.', parts: [
        { id: 'e6a', level: 'PRG', make: function (r) {
          var g = gen(r, function (r) { var q = r.int(2, 4), p = r.int(1, 3) * (r.chance(0.7) ? 1 : -1); if (gcd(Math.abs(p), q) !== 1) return null; var A = [r.int(-4, -1), r.int(-3, 1)], Bp = add(A, [q * 2, p * 2]), ps = perpOf(red(p, q)), C = [r.int(-2, 3), r.int(4, 9)], j = r.int(1, 2) * (ps[0] < 0 ? 1 : -1), D = [C[0] + ps[1] * j * (ps[0] < 0 ? 1 : 1), C[1] + ps[0] * j]; if (!inBox(Bp, 12) || !inBox(D, 12)) return null; if (!sEq(slopeOf(C, D), ps)) return null; return { A: A, B: Bp, C: C, D: D, s: red(p, q), ps: ps }; }, { A: [-2, -1], B: [4, 3], C: [1, 8], D: [5, 2], s: [2, 3], ps: [-3, 2] });
          var kPar = g.C[0] + (g.D[1] - g.C[1]) / sV(g.s);
          return numAns('(a) ' + nP('A', g.A) + ', ' + nP('B', g.B) + ', ' + nP('C', g.C) + ', ' + t('D(k,\\ ' + g.D[1] + ')'), g.D[0], [[kPar, 'k-par-perp', 'That makes ' + t('CD') + ' parallel to ' + t('AB') + '. Use the <b>negative reciprocal</b> of ' + t('m_{AB}') + '.'], [g.C[0] - (g.D[0] - g.C[0]), 'k-sign', 'Check the sign as you solve.']],
            t(calc(g.A, g.B, 'AB')) + ', so ' + t('m_{CD}=' + sT(g.ps)) + ':<br>' + t('\\frac{' + g.D[1] + '-' + nb(g.C[1]) + '}{k-' + nb(g.C[0]) + '}=' + sT(g.ps) + '\\ \\Rightarrow\\ k=' + g.D[0]) + '.', ['Find ' + t('m_{AB}') + ', take its negative reciprocal, then set ' + t('m_{CD}') + ' equal to it.'], 'perpendicular: unknown x', t('k='));
        } },
        { id: 'e6b', level: 'PRG', make: function (r) {
          var g = gen(r, function (r) { var q = r.int(2, 4), p = r.int(1, 3) * (r.chance(0.6) ? 1 : -1); if (gcd(Math.abs(p), q) !== 1) return null; var C = [r.int(-1, 2), r.int(-4, 0)], D = add(C, [q * 2, p * 2]), ps = perpOf(red(p, q)), Bp = [r.int(2, 6), r.int(-2, 3)], j = r.int(1, 4), A = [Bp[0] - ps[1] * j, Bp[1] - ps[0] * j]; if (!inBox(D, 12) || !inBox(A, 18)) return null; return { A: A, B: Bp, C: C, D: D, s: red(p, q), ps: ps }; }, { A: [-7, 17], B: [5, 1], C: [0, -2], D: [8, 4], s: [3, 4], ps: [-4, 3] });
          var kPar = g.B[1] - sV(g.s) * (g.B[0] - g.A[0]);
          return numAns('(b) ' + t('A(' + g.A[0] + ',\\ k)') + ', ' + nP('B', g.B) + ', ' + nP('C', g.C) + ', ' + nP('D', g.D), g.A[1], [[kPar, 'k-par-perp', 'That makes ' + t('AB') + ' parallel to ' + t('CD') + '. Use the negative reciprocal of ' + t('m_{CD}') + '.'], [2 * g.B[1] - g.A[1], 'k-sign', 'Check the sign: solve ' + t('\\frac{' + g.B[1] + '-k}{' + (g.B[0] - g.A[0]) + '}=' + sT(g.ps)) + ' carefully.']],
            t(calc(g.C, g.D, 'CD')) + ', so ' + t('m_{AB}=' + sT(g.ps)) + ':<br>' + t('\\frac{' + g.B[1] + '-k}{' + g.B[0] + '-' + nb(g.A[0]) + '}=' + sT(g.ps) + '\\ \\Rightarrow\\ ' + g.B[1] + '-k=' + (g.B[1] - g.A[1]) + '\\ \\Rightarrow\\ k=' + g.A[1]) + '.', ['Find ' + t('m_{CD}') + ' first.'], 'perpendicular: unknown y', t('k='));
        } },
        { id: 'e6c', level: 'PRG', make: function (r) {
          var g = gen(r, function (r) { var n = r.int(2, 4) * (r.chance(0.7) ? -1 : 1), C = [r.int(-3, 1), r.int(2, 7)], D = add(C, [r.int(2, 3) * 2, 0]); D[1] = C[1] + n * (D[0] - C[0]); var A = [r.int(1, 4), r.int(-5, -2)], j = r.int(1, 3), ps = perpOf([n, 1]), Bp = [A[0] + ps[1] * j * 2, A[1] + ps[0] * j * 2]; if (!inBox(D, 14) || !inBox(Bp, 18)) return null; return { A: A, B: Bp, C: C, D: D, s: [n, 1], ps: ps }; }, { A: [3, -4], B: [15, 2], C: [-1, 5], D: [5, -7], s: [-2, 1], ps: [1, 2] });
          return numAns('(c) ' + nP('A', g.A) + ', ' + t('B(k,\\ ' + g.B[1] + ')') + ', ' + nP('C', g.C) + ', ' + nP('D', g.D), g.B[0], [[g.A[0] + (g.B[1] - g.A[1]) / sV(g.s), 'k-par-perp', 'That makes ' + t('AB') + ' parallel to ' + t('CD') + '. Use the negative reciprocal.'], [g.A[0] - (g.B[0] - g.A[0]), 'k-sign', 'Check the sign.']],
            t(calc(g.C, g.D, 'CD')) + ', so ' + t('m_{AB}=' + sT(g.ps)) + ':<br>' + t('\\frac{' + g.B[1] + '-' + nb(g.A[1]) + '}{k-' + nb(g.A[0]) + '}=' + sT(g.ps) + '\\ \\Rightarrow\\ k-' + nb(g.A[0]) + '=' + (g.B[0] - g.A[0]) + '\\ \\Rightarrow\\ k=' + g.B[0]) + '.', ['Find ' + t('m_{CD}') + ', then its negative reciprocal.'], 'perpendicular: unknown x (integer slope)', t('k='));
        } },
        { id: 'e6d', level: 'PRG', make: function (r) {
          var x1 = r.int(-6, -2), x2 = r.int(3, 9), cx = r.int(-3, 5), c1 = r.int(-7, -2), c2 = r.int(3, 9);
          var p = B.mc(r, '(d) ' + t('A(' + x1 + ',\\ k)') + ', ' + t('B(' + x2 + ',\\ k)') + ', ' + t('C(' + cx + ',\\ ' + c1 + ')') + ', ' + t('D(' + cx + ',\\ ' + c2 + ')'), [
            { html: '<b>Every</b> value of ' + t('k') + ' works.', right: true },
            { html: t('k=0') + ' only.', why: t('AB') + ' is horizontal for <b>any</b> ' + t('k') + ' (both points have ' + t('y=k') + '), not only for ' + t('k=0') + '.' },
            { html: '<b>No</b> value of ' + t('k') + ' works — ' + t('0\\times\\text{undefined}') + ' can’t equal ' + t('-1') + '.', why: 'The product rule doesn’t apply to an undefined slope. A horizontal and a vertical segment are always perpendicular.' },
            { html: t('k=' + c1) + ' or ' + t('k=' + c2) + '.', why: 'Those would put ' + t('AB') + ' through ' + t('C') + ' or ' + t('D') + ' — but the segments are perpendicular whatever height ' + t('AB') + ' is at.' }],
            t('m_{AB}=\\frac{k-k}{' + x2 + '-' + nb(x1) + '}=0') + ': horizontal for every ' + t('k') + '. ' + t('m_{CD}=\\frac{' + (c2 - c1) + '}{0}') + ': undefined, so ' + t('CD') + ' is vertical. Horizontal ' + t('\\perp') + ' vertical, so <b>every value of ' + t('k') + ' works</b>.', ['Find both slopes. What kind of segment is each one?'], 'perpendicular for every k');
          return p;
        } },
        { id: 'e6e', level: 'EMG', make: function (r) {
          var x1 = r.int(-6, -2), x2 = r.int(3, 9), cx = r.int(-3, 5), c1 = r.int(-7, -2), c2 = r.int(3, 9);
          return B.mc(r, '(e) Part (d) does not behave like the others: with points such as ' + t('A(' + x1 + ',\\ k)') + ', ' + t('B(' + x2 + ',\\ k)') + ', ' + t('C(' + cx + ',\\ ' + c1 + ')') + ', ' + t('D(' + cx + ',\\ ' + c2 + ')') + ', <b>every</b> value of ' + t('k') + ' makes ' + t('AB\\perp CD') + '. What produces that answer?', [
            { html: t('A') + ' and ' + t('B') + ' always share a ' + t('y') + '-coordinate, so ' + t('AB') + ' is horizontal; ' + t('C') + ' and ' + t('D') + ' share an ' + t('x') + ', so ' + t('CD') + ' is vertical — and horizontal ⊥ vertical, whatever ' + t('k') + ' is.', right: true },
            { html: 'The slopes multiply to ' + t('-1') + ' for every ' + t('k') + '.', why: 'An undefined slope can’t be multiplied at all. The answer comes from the shapes of the segments, not from a product.' },
            { html: t('k') + ' cancels in the product rule, leaving ' + t('-1=-1') + '.', why: 'The product rule can’t even be written down here: ' + t('m_{CD}') + ' is undefined.' },
            { html: t('AB') + ' and ' + t('CD') + ' have the same length.', why: 'Length doesn’t decide perpendicular — direction does.' }],
            'The answer is every value of ' + t('k') + ': ' + t('AB') + ' is horizontal (slope ' + t('0') + ') for any ' + t('k') + ', and ' + t('CD') + ' is vertical (undefined slope). A horizontal and a vertical segment always meet at ' + t('90^{\\circ}') + ', so the condition puts no restriction on ' + t('k') + '. The product rule could not have produced this, since ' + t('0\\times\\text{undefined}') + ' can’t be evaluated.', ['What kind of segment is ' + t('AB') + ', whatever ' + t('k') + ' is?'], 'why every k works');
        } }] },
      { num: '7', section: 'Extra practice C — The one case the product rule cannot handle', shared: function (r) {
          var b = r.int(-1, 5), x1 = r.int(-7, -4), x2 = r.int(3, 6), a = r.int(-2, 2), y1 = r.int(-5, -2), y2 = r.int(6, 10);   // x1 < a < x2 and y1 < b < y2: the segments really cross
          return { P: [x1, b], Q: [x2, b], R: [a, y1], S: [a, y2] };
        },
        stem: function (s) { return 'Segment ' + t('PQ') + ' joins ' + nP('P', s.P) + ' to ' + nP('Q', s.Q) + '. Segment ' + t('RS') + ' joins ' + nP('R', s.R) + ' to ' + nP('S', s.S) + '. Adeyemi writes: <i>“' + t('m_{PQ}=0') + ' and ' + t('m_{RS}') + ' is undefined, so ' + t('m_{PQ}\\times m_{RS}') + ' is not ' + t('-1') + '. Perpendicular lines must have slopes with product ' + t('-1') + '. Therefore ' + t('PQ') + ' and ' + t('RS') + ' are not perpendicular.”</i>' + graphOf({ x: [-8, 7], y: [-6, 11], grid: 1, labels: 2, max: 300, segs: [{ pts: [s.P, s.Q] }, { pts: [s.R, s.S], color: '#c4532a' }], points: [lbl(s.P, 'P'), lbl(s.Q, 'Q'), lbl(s.R, 'R'), lbl(s.S, 'S')] }); },
        parts: [
          { id: 'e7a', level: 'BEG', make: function (r, s) { return slopeFields('(a) Calculate ' + t('m_{PQ}') + ' and ' + t('m_{RS}') + ' to confirm Adeyemi’s slopes.', [{ nm: 'PQ', s: [0, 1] }, { nm: 'RS', s: null }], t(calc(s.P, s.Q, 'PQ')) + '<br>' + t(calc(s.R, s.S, 'RS')) + '<br>Both of Adeyemi’s slopes are correct.', ['A rise of ' + t('0') + ' gives slope ' + t('0') + '; a run of ' + t('0') + ' gives an undefined slope.'], 'slopes 0 and undefined'); } },
          { id: 'e7b', level: 'LIM', make: function (r, s) {
            return B.mc(r, '(b) Look at the figure. At what angle do ' + t('PQ') + ' and ' + t('RS') + ' cross? Are they perpendicular?', [
              { html: t('90^{\\circ}') + ' — <b>yes</b>, they are perpendicular.', right: true }, { html: t('0^{\\circ}') + ' — they are parallel.', why: 'They cross — parallel segments never meet. One is horizontal, the other vertical.' },
              { html: t('45^{\\circ}') + ' — not perpendicular.', why: 'A horizontal and a vertical segment make a square corner.' }, { html: 'They don’t cross, so no angle exists.', why: 'Look at the figure: they cross at ' + t(ptT([s.R[0], s.P[1]])) + '.' }],
              t('PQ') + ' is horizontal and ' + t('RS') + ' is vertical; they cross at ' + t(ptT([s.R[0], s.P[1]])) + ' at exactly ' + t('90^{\\circ}') + '. <b>Yes</b>, they are perpendicular.', ['Horizontal meets vertical…'], 'horizontal meets vertical');
          } },
          { id: 'e7c', level: 'EMG', make: function (r) {
            return B.mc(r, '(c) Adeyemi’s arithmetic is not the problem. Which step of the argument fails?', [
              { html: '“Perpendicular lines <b>must</b> have slopes with product ' + t('-1') + '” — the rule only applies when both slopes are numbers; an undefined slope can’t be multiplied at all.', right: true },
              { html: '“' + t('m_{PQ}=0') + '” — a horizontal segment has an undefined slope.', why: 'Horizontal: rise ' + t('0') + ', so slope ' + t('0') + '. That step is fine.' },
              { html: '“' + t('m_{RS}') + ' is undefined” — its slope is really ' + t('0') + '.', why: 'Vertical: run ' + t('0') + ', so the slope is undefined. That step is fine.' },
              { html: 'The product ' + t('0\\times\\text{undefined}') + ' is really ' + t('-1') + '.', why: 'It isn’t any number: an undefined slope isn’t a number, so there is nothing to multiply.' }],
              'The failing step is “perpendicular lines <i>must</i> have slopes with product ' + t('-1') + '.” That rule only applies when both slopes are numbers. ' + t('m_{RS}') + ' is not a number, so ' + t('0\\times\\text{undefined}') + ' does not exist, and a test that can’t be carried out proves nothing either way.', ['Can you multiply by “undefined”?'], 'where the product-rule argument fails');
          } },
          { id: 'e7d', level: 'EMG', make: function (r) {
            return B.mc(r, '(d) Which two-part rule would classify ' + t('PQ') + ' and ' + t('RS') + ' correctly?', [
              { html: 'Two lines are perpendicular if <b>either</b> both slopes are defined and ' + t('m_1\\times m_2=-1') + ', <b>or</b> one line is horizontal and the other is vertical.', right: true },
              { html: 'Two lines are perpendicular if ' + t('m_1\\times m_2=-1') + ', or if both slopes are ' + t('0') + '.', why: 'Two slopes of ' + t('0') + ' are two horizontal lines — parallel.' },
              { html: 'Two lines are perpendicular if ' + t('m_1=-m_2') + ', or if one slope is undefined.', why: t('m_1=-m_2') + ' is not the rule (' + t('2') + ' and ' + t('-2') + ' aren’t perpendicular), and a vertical line is perpendicular only to a <b>horizontal</b> one.' },
              { html: 'Two lines are perpendicular only if ' + t('m_1\\times m_2=-1') + '.', why: 'That is Adeyemi’s rule — it misses the horizontal–vertical case.' }],
              'Perpendicular if <b>either</b> (1) both slopes are defined and ' + t('m_1\\times m_2=-1') + ' (negative reciprocals), <b>or</b> (2) one line is horizontal (slope ' + t('0') + ') and the other vertical (undefined). ' + t('PQ') + ' and ' + t('RS') + ' fall under (2).', ['The rule needs an ordinary case and an exception.'], 'the complete perpendicular rule');
          } }] },
      { num: '8', stem: 'Each row gives the slopes of two segments. Classify the pair as parallel, perpendicular, or neither.', parts: (function () {
        function mk(id, level, g) { return { id: id, level: level, make: function (r) { var v = g(r), a = v[0], b = v[1]; if (r.chance(0.5)) { var tmp = a; a = b; b = tmp; } return relMC(r, '(' + id.slice(2) + ') ' + t('m_1=' + sT(a) + ',\\quad m_2=' + sT(b)), a, b, relSol(a, b), 'classify slopes with 0 / undefined'); } }; }
        return [mk('e8a', 'LIM', function () { return [[0, 1], [0, 1]]; }), mk('e8b', 'BEG', function () { return [[0, 1], null]; }), mk('e8c', 'BEG', function () { return [null, null]; }),
          mk('e8d', 'BEG', function (r) { return [[0, 1], [r.int(2, 9) * (r.chance(0.5) ? 1 : -1), 1]]; }), mk('e8e', 'EMG', function (r) { return [null, [r.chance(0.5) ? 1 : -1, r.int(2, 6)]]; }),
          mk('e8f', 'EMG', function (r) { var f = gen(r, function (r) { var p = r.int(2, 9), q = r.int(2, 9); return gcd(p, q) === 1 && p !== q ? [p, q] : null; }, [7, 2]), sg = r.chance(0.7) ? -1 : 1; return [[sg * f[0], f[1]], [sg * f[1], f[0]]]; }),
          { id: 'e8g', level: 'EMG', make: function (r) {
            var fq = gen(r, function (r) { var p = r.int(2, 9), q = r.int(2, 9); return gcd(p, q) === 1 && p !== q ? [p, q] : null; }, [7, 2]), sg = r.chance(0.7) ? -1 : 1;
            var rows = [[[0, 1], [0, 1]], [[0, 1], null], [null, null], [[0, 1], [r.int(2, 9) * (r.chance(0.5) ? 1 : -1), 1]], [[r.chance(0.5) ? 1 : -1, r.int(2, 6)], null], [[sg * fq[0], fq[1]], [sg * fq[1], fq[0]]]];
            var list = rows.map(function (v, i) { return '(' + 'abcdef'.charAt(i) + ') ' + t('m_1=' + sT(v[0]) + ',\\ m_2=' + sT(v[1])); }).join('; ');
            return B.mc(r, '(g) The six rows were: ' + list + '. Exactly one of these rows is a pair of perpendicular segments whose slopes do <b>not</b> multiply to ' + t('-1') + '. Which row, and why isn’t it a counterexample to the rule?', [
              { html: 'Row (b): the rule ' + t('m_1m_2=-1') + ' is about two lines whose slopes are both numbers; an undefined slope is outside the rule, and horizontal–vertical is the exception.', right: true },
              { html: 'Row (f): the slopes are reciprocals.', why: 'Row (f) is <b>neither</b>: the reciprocals have the same sign, so the product is ' + t('+1') + '.' },
              { html: 'Row (a): two slopes of ' + t('0') + ' are perpendicular.', why: 'Two horizontal segments are parallel.' },
              { html: 'Row (b), and it shows the rule is wrong.', why: 'It doesn’t break the rule — it is outside the rule’s scope, because an undefined slope can’t be multiplied.' }],
              '<b>Row (b)</b>: ' + t('m_1=0') + ' with ' + t('m_2') + ' undefined. The rule ' + t('m_1m_2=-1') + ' is a statement about two lines whose slopes are both defined numbers; row (b) has an undefined slope, so it lies outside the rule rather than contradicting it — it is the horizontal–vertical exception.', ['Which row has an undefined slope paired with a horizontal one?'], 'the exception row');
          } }];
      })() },
      { num: '9', section: 'Extra practice D — Naming a quadrilateral from its vertices', shared: function (r) {
          var types = r.shuffle(['para', 'rect', 'rhom', 'trap']), out = { types: types, q: [] };
          types.forEach(function (ty) { var g = quad(r, ty, 8); out.q.push(g ? g.V : null); });
          if (out.q.some(function (x) { return !x; })) return { types: ['para', 'rect', 'rhom', 'trap'], q: [QFB.para, QFB.rect, QFB.rhom, QFB.trap] };
          return out;
        },
        stem: 'Four quadrilaterals are given. For each one, calculate what you need, then name it as precisely as you can: parallelogram, rectangle, rhombus, square, or trapezoid. (Slope proves parallel sides and right angles; distance proves equal sides.)',
        parts: (function () {
          var NM = [['A', 'B', 'C', 'D'], ['P', 'Q', 'R', 'S'], ['E', 'F', 'G', 'H'], ['W', 'X', 'Y', 'Z']], W = ['a', 'b', 'c', 'd'];
          function fig(V, N) { var xs = V.map(function (p) { return p[0]; }), ys = V.map(function (p) { return p[1]; }); var x0 = Math.min(-1, Math.min.apply(null, xs) - 1), x1 = Math.max(1, Math.max.apply(null, xs) + 1), y0 = Math.min(-1, Math.min.apply(null, ys) - 1), y1 = Math.max(1, Math.max.apply(null, ys) + 1); return graphOf({ x: [x0, x1], y: [y0, y1], grid: 1, labels: 2, max: 280, segs: [{ pts: V.concat([V[0]]) }], points: V.map(function (p, i) { return lbl(p, N[i]); }) }); }
          function head(s, i) { var V = s.q[i], N = NM[i]; return N.map(function (n, j) { return nP(n, V[j]); }).join(', ') + fig(V, N); }
          function sides(i) { var N = NM[i]; return [N[0] + N[1], N[1] + N[2], N[2] + N[3], N[3] + N[0]]; }
          var out = [];
          [0, 1, 2, 3].forEach(function (i) {
            out.push({ id: 'e9' + W[i], sub: W[i] + ' i', level: 'EMG', make: function (r, s) { var V = s.q[i], sd = sides(i); return slopeFields(head(s, i) + 'Find the slopes of the four sides.', sd.map(function (nm, j) { return { nm: nm, s: slopeOf(V[j], V[(j + 1) % 4]) }; }), sd.map(function (nm, j) { return t(calc(V[j], V[(j + 1) % 4], nm)); }).join('<br>'), [SLOPE_HINT], 'quadrilateral: four slopes'); } });
            out.push({ id: 'e9' + W[i] + '2', sub: W[i] + ' ii', level: 'PRG', make: function (r, s) {
              var V = s.q[i], N = NM[i], ty = s.types[i], sd = sides(i), sl = sd.map(function (nm, j) { return slopeOf(V[j], V[(j + 1) % 4]); }), L = sd.map(function (nm, j) { return lenT(V[j], V[(j + 1) % 4]); });
              var why = { para: 'Check the opposite sides: are both pairs parallel? Then check for a right angle (slopes) and equal sides (distance).', rect: 'A rectangle needs two pairs of parallel sides <b>and</b> a right angle (adjacent slopes multiply to ' + t('-1') + ').', rhom: 'A rhombus needs two pairs of parallel sides <b>and</b> all four sides equal (distance).', sq: 'A square needs right angles <b>and</b> four equal sides — check both.', trap: 'A trapezoid has <b>exactly one</b> pair of parallel sides.' };
              var line = '<br>' + sd.map(function (nm, j) { return t('m_{' + nm + '}=' + sT(sl[j])); }).join(', ') + '<br>';
              var sol = line + (ty === 'trap' ? 'Slope: ' + (sEq(sl[0], sl[2]) ? t(sd[0] + '\\parallel ' + sd[2]) + ', but ' + t(sd[1]) + ' and ' + t(sd[3]) + ' are not parallel' : t(sd[1] + '\\parallel ' + sd[3]) + ', but ' + t(sd[0]) + ' and ' + t(sd[2]) + ' are not parallel') + ': exactly one pair of parallel sides — a <b>trapezoid</b>.' :
                'Slope: ' + t(sd[0] + '\\parallel ' + sd[2]) + ' and ' + t(sd[1] + '\\parallel ' + sd[3]) + ': a parallelogram. ' + (relKind(sl[0], sl[1]) === 'perp' ? 'Slope: ' + t(prodT(sl[0], sl[1])) + ', right angles. ' : 'Slope: ' + t(sT(sl[0]) + '\\times ' + sP(sl[1])) + ' isn’t ' + t('-1') + ', no right angles. ') + 'Distance: ' + t(sd[0] + '=' + L[0] + ',\\ ' + sd[1] + '=' + L[1]) + (L[0] === L[1] ? ', equal sides. ' : ', not equal. ') + 'So it is a <b>' + QUAD[ty].toLowerCase() + '</b>.');
              return B.mc(r, head(s, i) + 'Name quadrilateral ' + t(N.join('')) + ' as precisely as you can.', ['para', 'rect', 'rhom', 'sq', 'trap'].map(function (k) { return { html: QUAD[k], right: k === ty, why: k === ty ? null : why[k] }; }), sol, ['Slopes first: how many pairs of opposite sides are parallel? Any right angles?', 'Then lengths: are adjacent sides equal?'], 'name a quadrilateral', true);
            } });
          });
          return out;
        })() },
      { num: '10', stem: 'Answer each question about the <b>evidence</b> a classification needs.', parts: [
        { id: 'e10a', level: 'EMG', make: function (r) { return B.mc(r, '(a) A student shows that both pairs of opposite sides are parallel and calls the shape a rectangle. What is missing, and which tool supplies it?', [
          { html: 'A right angle — <b>slope</b>: two adjacent sides with slopes that multiply to ' + t('-1') + '.', right: true }, { html: 'Equal sides — <b>distance</b>.', why: 'Equal sides would make a rhombus. A rectangle needs a right angle.' },
          { html: 'Nothing — two pairs of parallel sides make a rectangle.', why: 'Two pairs of parallel sides only prove a <b>parallelogram</b>.' }, { html: 'Equal diagonals — <b>slope</b>.', why: 'Slope doesn’t measure length. The missing evidence is a right angle.' }],
          'Two pairs of parallel sides prove only a parallelogram. A rectangle also needs a <b>right angle</b>, which <b>slope</b> supplies: two adjacent sides whose slopes multiply to ' + t('-1') + ' (or one horizontal, one vertical).', ['What makes a rectangle more than a parallelogram?'], 'evidence: rectangle'); } },
        { id: 'e10b', level: 'EMG', make: function (r) { return B.mc(r, '(b) A student shows that all four sides are equal and calls the shape a square. What is missing, and which tool supplies it?', [
          { html: 'A right angle — <b>slope</b>: two adjacent sides perpendicular (product ' + t('-1') + ').', right: true }, { html: 'Parallel sides — <b>distance</b>.', why: 'Distance can’t prove parallel. And four equal sides already make a rhombus (which has parallel sides).' },
          { html: 'Nothing — four equal sides make a square.', why: 'Four equal sides only prove a <b>rhombus</b>.' }, { html: 'Equal sides again — check with slope.', why: 'Slope measures direction, not length.' }],
          'Four equal sides prove only a rhombus. A square also needs a <b>right angle</b>: <b>slope</b> must show two adjacent sides are perpendicular.', ['What makes a square more than a rhombus?'], 'evidence: square'); } },
        { id: 'e10c', level: 'EMG', make: function (r) { return B.mc(r, '(c) Why does “exactly one pair of parallel sides” need <b>four</b> slopes, not two?', [
          { html: '“Exactly one” is two claims: one pair of opposite sides <b>is</b> parallel (two equal slopes) and the other pair <b>is not</b> (two more slopes, unequal).', right: true },
          { html: 'Because a quadrilateral has four sides and every side must be checked for length.', why: 'Length isn’t the issue — parallel is about slope. Think about what “exactly one” rules out.' },
          { html: 'Two slopes are enough.', why: 'With only two slopes you can’t tell a trapezoid from a parallelogram.' },
          { html: 'Because you need the product of all four slopes to be ' + t('-1') + '.', why: 'Products test perpendicular, not parallel.' }],
          '“Exactly one” means one pair of opposite sides is parallel (two equal slopes) <b>and</b> the other pair is not (two more slopes, unequal). With only two slopes you can’t tell a trapezoid from a parallelogram.', ['What does “exactly” rule out?'], 'evidence: trapezoid'); } }] },
      { num: '11', section: 'Extra practice E — Right triangles: prove it, then measure it', shared: function (r) {
          var fb = { pts: [[2, 1], [-2, 3], [1, 9]], at: 1 };
          var V = gen(r, function (r) { var a = r.pick([1, 2, 1, 2, 3]), b = r.pick([1, 2, 3]), s = r.int(1, 3), u = r.int(1, 3); if (gcd(a, b) !== 1 || s === u && a === b) return null; if (a === b && a !== 1) return null; var C = [r.int(-4, 3), r.int(-2, 4)], P = add(C, [a * s, -b * s]), Q = add(C, [b * u, a * u]); if (!inBox(P, 10) || !inBox(Q, 10)) return null; var s3 = slopeOf(P, Q); if (!s3 || s3[0] === 0 || !slopeOf(C, P) || !slopeOf(C, Q) || slopeOf(C, P)[0] === 0 || slopeOf(C, Q)[0] === 0) return null; var pos = r.int(0, 2), pts = [P, Q]; pts.splice(pos, 0, C); return { pts: pts, at: pos }; }, fb);
          return V;
        },
        stem: function (s) { return 'Consider ' + t('\\triangle ABC') + ' with vertices ' + ['A', 'B', 'C'].map(function (n, i) { return nP(n, s.pts[i]); }).join(', ') + '.'; },
        parts: (function () {
          var N = ['A', 'B', 'C'], SIDE = [['AB', 0, 1], ['BC', 1, 2], ['AC', 0, 2]];
          function legs(s) { var o = [0, 1, 2].filter(function (i) { return i !== s.at; }); return o.map(function (i) { return { nm: s.at < i ? N[s.at] + N[i] : N[i] + N[s.at], P: s.pts[s.at], Q: s.pts[i] }; }); }
          return [
            { id: 'e11a', sub: 'a i', level: 'EMG', make: function (r, s) { return slopeFields('Calculate all three slopes.', SIDE.map(function (x) { return { nm: x[0], s: slopeOf(s.pts[x[1]], s.pts[x[2]]) }; }), SIDE.map(function (x) { return t(calc(s.pts[x[1]], s.pts[x[2]], x[0])); }).join('<br>'), [SLOPE_HINT], 'triangle: three slopes'); } },
            { id: 'e11a2', sub: 'a ii', level: 'EMG', make: function (r, s) {
              var lg = legs(s), s1 = slopeOf(lg[0].P, lg[0].Q), s2 = slopeOf(lg[1].P, lg[1].Q);
              return B.mc(r, 'Use the slopes to prove the triangle is right-angled. At which vertex is the right angle?', N.map(function (n, i) { return { html: 'At ' + t(n), right: i === s.at, why: i === s.at ? null : 'The two sides that meet at ' + t(n) + ' don’t have slopes with product ' + t('-1') + '.' }; }).concat([{ html: 'It isn’t right-angled.', why: 'One pair of slopes multiplies to ' + t('-1') + '. Find it.' }]),
                t(prodT(s1, s2)) + ', so ' + t(lg[0].nm + '\\perp ' + lg[1].nm) + ': the right angle is at <b>' + t(N[s.at]) + '</b>.', ['The right angle is where the two perpendicular sides meet.'], 'right angle at which vertex', true);
            } },
            { id: 'e11b', sub: 'b', level: 'PRG', outcome: 'EXT', make: function (r, s) {
              var lg = legs(s);
              var p = B.fields('(b) Find the exact lengths of the two sides that meet at the right angle (simplest radical form).', lg.map(function (l) { return radField(l.nm); }), lg.map(function (l) { return radChk(l.P, l.Q); }), lg.map(function (l) { return lenT(l.P, l.Q); }), t(lg.map(function (l) { return l.nm + '=' + lenT(l.P, l.Q); }).join(',\\quad ')),
                lg.map(function (l) { var rt = '\\sqrt{' + d2(l.P, l.Q) + '}'; return t(l.nm + '=' + rt + (lenT(l.P, l.Q) === rt ? '' : '=' + lenT(l.P, l.Q))); }).join('<br>'), ['Distance formula, then simplify.'], 'legs of a right triangle');
              p.bad = [lg.map(function (l) { return String(d2(l.P, l.Q)); })]; return p;
            } },
            { id: 'e11c', sub: 'c', level: 'PRG', outcome: 'EXT', make: function (r, s) {
              var lg = legs(s), a2 = d2(lg[0].P, lg[0].Q), b2 = d2(lg[1].P, lg[1].Q), area = Math.sqrt(a2 * b2) / 2;
              return B.number('(c) Calculate the area of ' + t('\\triangle ABC') + ' (square units).', cl(area), function (v) { if (near(v, 2 * area)) return { code: 'area-no-half', hint: 'Area of a triangle is ' + t('\\frac{1}{2}bh') + ' — halve it.' }; return null; },
                'The legs ' + t(lg[0].nm) + ' and ' + t(lg[1].nm) + ' meet at a right angle, so one is the base and the other is already the height (the third side plays no part):<br>' + t('A=\\frac{1}{2}(' + lenT(lg[0].P, lg[0].Q) + ')(' + lenT(lg[1].P, lg[1].Q) + ')=' + nT(area)) + ' square units.', ['The two perpendicular sides are the base and the height.'], 'area of a right triangle');
            } }];
        })() },
      { num: '12', shared: function (r) {
          var fb = { pts: [[1, -4], [3, 2], [-8, -1]], at: 0 };
          return gen(r, function (r) { var a = r.int(1, 3), b = r.int(1, 4), s = r.int(1, 3), u = r.int(1, 3); if (gcd(a, b) !== 1 || a === b) return null; var C = [r.int(-3, 3), r.int(-5, 2)], P = add(C, [a * s, b * s]), Q = add(C, [-b * u, a * u]); if (r.chance(0.5)) Q = add(C, [b * u, -a * u]); if (!inBox(P, 10) || !inBox(Q, 10)) return null; var s3 = slopeOf(P, Q); if (!s3 || s3[0] === 0) return null; var pos = r.int(0, 2), pts = [P, Q]; pts.splice(pos, 0, C); return { pts: pts, at: pos }; }, fb);
        },
        stem: function (s) { return 'Consider ' + t('\\triangle PQR') + ' with vertices ' + ['P', 'Q', 'R'].map(function (n, i) { return nP(n, s.pts[i]); }).join(', ') + '.'; },
        parts: (function () {
          var N = ['P', 'Q', 'R'];
          function legs(s) { return [0, 1, 2].filter(function (i) { return i !== s.at; }).map(function (i) { return { nm: s.at < i ? N[s.at] + N[i] : N[i] + N[s.at], P: s.pts[s.at], Q: s.pts[i] }; }); }
          function hyp(s) { var o = [0, 1, 2].filter(function (i) { return i !== s.at; }); return { nm: N[o[0]] + N[o[1]], P: s.pts[o[0]], Q: s.pts[o[1]] }; }
          return [
            { id: 'e12a', level: 'EMG', make: function (r, s) {
              var lg = legs(s), h = hyp(s), s1 = slopeOf(lg[0].P, lg[0].Q), s2 = slopeOf(lg[1].P, lg[1].Q);
              return B.mc(r, '(a) Prove by slope that ' + t('\\triangle PQR') + ' is right-angled. At which vertex is the right angle?', N.map(function (n, i) { return { html: 'At ' + t(n), right: i === s.at, why: i === s.at ? null : 'Multiply the slopes of the two sides that meet at ' + t(n) + ': the product isn’t ' + t('-1') + '.' }; }).concat([{ html: 'It isn’t right-angled.', why: 'Calculate all three slopes: one pair multiplies to ' + t('-1') + '.' }]),
                t(calc(lg[0].P, lg[0].Q, lg[0].nm)) + '<br>' + t(calc(lg[1].P, lg[1].Q, lg[1].nm)) + '<br>' + t(calc(h.P, h.Q, h.nm)) + '<br>' + t(prodT(s1, s2)) + ', so the right angle is at <b>' + t(N[s.at]) + '</b>.', ['Find all three slopes, then look for a product of ' + t('-1') + '.'], 'prove right-angled by slope', true);
            } },
            { id: 'e12b', level: 'PRG', outcome: 'EXT', make: function (r, s) {
              var lg = legs(s), a2 = d2(lg[0].P, lg[0].Q), b2 = d2(lg[1].P, lg[1].Q), area = Math.sqrt(a2 * b2) / 2;
              return B.number('(b) Calculate the area of ' + t('\\triangle PQR') + ' (square units).', cl(area), function (v) { if (near(v, 2 * area)) return { code: 'area-no-half', hint: 'Area of a triangle is ' + t('\\frac{1}{2}bh') + '.' }; return null; },
                t(lg[0].nm + '=' + lenT(lg[0].P, lg[0].Q) + ',\\ ' + lg[1].nm + '=' + lenT(lg[1].P, lg[1].Q)) + '<br>' + t('A=\\frac{1}{2}(' + lenT(lg[0].P, lg[0].Q) + ')(' + lenT(lg[1].P, lg[1].Q) + ')=' + nT(area)) + ' square units.', ['The sides that meet at the right angle are the base and the height.'], 'area of a right triangle');
            } },
            { id: 'e12c', level: 'EMG', outcome: 'EXT', make: function (r, s) {
              var lg = legs(s), h = hyp(s), a = d2(lg[0].P, lg[0].Q), b = d2(lg[1].P, lg[1].Q), c = d2(h.P, h.Q);
              var p = B.fields('(c) Confirm the right angle a second way with the Pythagorean theorem: find the three squared side lengths.', [{ label: t(lg[0].nm + '^{2}=') }, { label: t(lg[1].nm + '^{2}=') }, { label: t(h.nm + '^{2}=') }], [K.number(a), K.number(b), K.number(c)], [String(a), String(b), String(c)],
                t(lg[0].nm + '^{2}=' + a + ',\\ ' + lg[1].nm + '^{2}=' + b + ',\\ ' + h.nm + '^{2}=' + c), t(a + '+' + b + '=' + c) + ': ' + t(lg[0].nm + '^{2}+' + lg[1].nm + '^{2}=' + h.nm + '^{2}') + ' ✓, so the right angle is opposite ' + t(h.nm) + ', at ' + t(N[s.at]) + '.', ['Squared length: ' + t('(\\Delta x)^{2}+(\\Delta y)^{2}') + '.'], 'Pythagorean confirmation');
              p.bad = [[String(a), String(b), String(c + 1)]]; return p;
            } }];
        })() },
      { num: '13', section: 'Extra practice F — The odd point out', shared: function (r) {
          return gen(r, function (r) { var q = r.pick([2, 3]), p = r.pick(q === 2 ? [1, 3] : [1, 2]) * (r.chance(0.6) ? 1 : -1), y0 = r.int(-2, 2); var pts = [-2, -1, 0, 1, 2].map(function (i) { return [i * q, y0 + i * p]; }); var odd = r.int(0, 4), sh = r.pick([-1, 1]); pts[odd] = [pts[odd][0], pts[odd][1] + sh]; var ys = pts.map(function (P) { return P[1]; }); if (Math.max.apply(null, ys) - Math.min.apply(null, ys) > 12) return null; return { pts: pts, odd: odd, sh: sh, s: red(p, q), good: pts[odd][1] - sh }; }, { pts: [[-6, -4], [-3, -2], [0, 0], [3, 3], [6, 4]], odd: 3, sh: 1, s: [2, 3], good: 2 });
        },
        stem: function (s) { return 'Four of the five points below lie on one straight line. One does not.' + flow(['A', 'B', 'C', 'D', 'E'].map(function (n, i) { return n + ptT(s.pts[i]); })); },
        parts: (function () {
          var N = ['A', 'B', 'C', 'D', 'E'];
          function win(s) { var ys = s.pts.map(function (P) { return P[1]; }), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), xs = s.pts.map(function (P) { return P[0]; }), x1 = Math.max.apply(null, xs) + 1; var lo = Math.min(-1, y0 - 1), hi = Math.max(1, y1 + 1); while (hi - lo < 8) { hi++; if (hi - lo < 8) lo--; } return { x: [-x1, x1], y: [lo, hi] }; }
          return [
            { id: 'e13a', level: 'BEG', make: function (r, s) {
              var w = win(s), I = { type: 'graphpad', x: w.x, y: w.y, grid: 1, labels: 2, mode: 'points', max: 320 }, target = { pts: s.pts.map(function (P) { return P.slice(); }), pieces: [], join: 'none' };
              var p = K.P.graph('(a) Plot all five points on the grid.', I, K.graphExact(target), target, 'Plot each point: across to ' + t('x') + ', then up or down to ' + t('y') + '. ' + N.filter(function (n, i) { return i !== s.odd; }).join(', ') + ' line up; ' + t(N[s.odd]) + ' sits one unit ' + (s.sh > 0 ? 'above' : 'below') + ' the line.', ['Go across to the ' + t('x') + '-coordinate first, then up or down to the ' + t('y') + '-coordinate.'], 'plot five points');
              p.bad = [{ pts: s.pts.slice(0, 4), pieces: [] }, { pts: s.pts.map(function (P) { return [P[1], P[0]]; }), pieces: [] }]; return p;
            } },
            { id: 'e13b', level: 'EMG', make: function (r, s) {
              var ref = s.odd === 2 ? 0 : 2, sl = function (i) { return slopeOf(s.pts[ref], s.pts[i]); };
              return B.mc(r, '(b) Which point is <b>not</b> collinear with the rest? (Support it with slopes — a sketch on its own is not a proof.)', [0, 1, 2, 3, 4].map(function (i) { return { html: t(N[i] + ptT(s.pts[i])), right: i === s.odd, why: i === s.odd ? null : 'Compute the slopes from ' + t(N[ref]) + ' to the other points: the odd point is the one whose slope is different.' }; }),
                [0, 1, 2, 3, 4].filter(function (i) { return i !== ref; }).map(function (i) { return t('m_{' + N[ref] + N[i] + '}=' + sT(sl(i))); }).join(', ') + '. Three of these agree (' + t(sT(s.s)) + '); the odd one out is <b>' + t(N[s.odd] + ptT(s.pts[s.odd])) + '</b>.', ['Fix one reference point and find the slope to each of the others.'], 'odd point out', true);
            } },
            { id: 'e13c', level: 'PRG', make: function (r, s) {
              var P = s.pts[s.odd], ri = s.odd === 2 ? 0 : 2, R0 = s.pts[ri];
              return numAns('(c) Keeping its ' + t('x') + '-coordinate, what should ' + t(N[s.odd]) + '’s ' + t('y') + '-coordinate have been for all five points to be collinear?', s.good, [[P[1], 'k-sign', 'That is where it is now — find the ' + t('y') + ' that gives the common slope ' + t(sT(s.s)) + '.']],
                'From ' + t(N[ri] + ptT(R0)) + ' (or any point on the line) the slope must be ' + t(sT(s.s)) + ': ' + t('\\frac{y-' + nb(R0[1]) + '}{' + P[0] + '-' + nb(R0[0]) + '}=' + sT(s.s) + '\\ \\Rightarrow\\ y=' + s.good) + ', so the point should be ' + t(ptT([P[0], s.good])) + '.', ['Use the common slope from a point on the line.'], 'fix the odd point', t('y='));
            } },
            { id: 'e13d', level: 'PRG', make: function (r, s) {
              // the classmate's two pairs: one holds the odd point, the other (which they blame) does not — as in the booklet
              var o = s.odd, bad = o <= 1 ? [0, 1] : o === 2 ? [2, 3] : [3, 4], clean = o <= 1 ? [3, 4] : [0, 1], pr = [bad, clean].sort(function (x, y) { return x[0] - y[0]; });
              var p1 = N[pr[0][0]] + N[pr[0][1]], p2 = N[pr[1][0]] + N[pr[1][1]];
              return B.mc(r, '(d) A classmate computes only ' + t('m_{' + p1 + '}') + ' and ' + t('m_{' + p2 + '}') + ', finds they differ, and announces that ' + t(N[clean[0]]) + ' or ' + t(N[clean[1]]) + ' must be the odd point. What is wrong, and how many slope calculations always identify the culprit?', [
                { html: 'Two unequal slopes only say the two pairs aren’t on one line — the bad point could be in either pair. Fix one point and compute three slopes from it: <b>three</b> always works.', right: true },
                { html: 'Nothing is wrong: the pair they chose must hold the odd point.', why: 'The bad point spoils every pair it belongs to — it might be in the other pair.' },
                { html: 'You need all ten slopes between the five points.', why: 'Three slopes from one reference point are enough: two agree and one differs (or all three agree, or all differ).' },
                { html: 'Two slopes are always enough if you choose the right pair.', why: 'You don’t know the right pair in advance. With a fixed reference point, three slopes always settle it.' }],
                'Each slope comes from a <i>pair</i> of points, and one bad point spoils every pair it is in. ' + t('m_{' + p1 + '}\\ne m_{' + p2 + '}') + ' can’t say which pair holds it (here the odd point is ' + t(N[o]) + ', in the other pair). Fix a reference point, say ' + t('A') + ', and find ' + t('m_{AB}') + ', ' + t('m_{AC}') + ', ' + t('m_{AD}') + ': if all agree, ' + t('E') + ' is odd; if one differs, that point is odd; if all differ, ' + t('A') + ' is odd. So <b>three</b> calculations always work.', ['One bad point ruins every slope it is part of.'], 'how many slopes find the odd point');
            } }];
        })() },
      { num: '14', shared: function (r) { var x = r.int(-5, 5), ys = r.sample([-4, -3, -2, -1, 0, 1, 2, 3, 5, 6, 7, 8], 3), dx = r.pick([1, 2, -1, -2]), yn = r.int(-3, 7); return { x: x, ys: ys, N: [x + dx, yn] }; },
        stem: function (s) { return 'The points ' + t('J(' + s.x + ',\\ ' + s.ys[0] + ')') + ', ' + t('K(' + s.x + ',\\ ' + s.ys[1] + ')') + ', ' + t('L(' + s.x + ',\\ ' + s.ys[2] + ')') + ' and ' + nP('N', s.N) + ' are given.'; },
        parts: [
          { id: 'e14a', level: 'BEG', make: function (r, s) {
            return B.mc(r, '(a) Which point is not collinear with the other three?', ['J', 'K', 'L', 'N'].map(function (n) { return { html: t(n), right: n === 'N', why: n === 'N' ? null : 'Look at the ' + t('x') + '-coordinates: three of the points share one.' }; }),
              t('J') + ', ' + t('K') + ', ' + t('L') + ' all have ' + t('x=' + s.x) + ' (one vertical line); ' + t('N') + ' has ' + t('x=' + s.N[0]) + ', so the odd point is <b>' + t('N') + '</b>. (Slopes from ' + t('N') + ' to ' + t('J') + ' and ' + t('K') + ' are ' + t(sT(slopeOf([s.x, s.ys[0]], s.N))) + ' and ' + t(sT(slopeOf([s.x, s.ys[1]], s.N))) + ' — different.)', ['Look at the ' + t('x') + '-coordinates.'], 'odd point: vertical line');
          } },
          { id: 'e14b', level: 'EMG', make: function (r, s) {
            return B.mc(r, '(b) Every slope you can form from ' + t('J') + ', ' + t('K') + ', ' + t('L') + ' is <i>undefined</i>. How does “undefined = undefined” still prove those three are collinear here?', [
              { html: 'Each segment is vertical, and the segments share a point (' + t('K') + '), so they are on the <b>same</b> vertical line ' + t('x=' + s.x) + '.', right: true },
              { html: 'Undefined slopes are equal to ' + t('0') + ', so the points are on a horizontal line.', why: 'A run of ' + t('0') + ' means vertical (undefined), not horizontal (slope ' + t('0') + ').' },
              { html: 'Any two undefined slopes always mean the same line.', why: 'Two vertical segments can be side by side (parallel). Here they share a point.' },
              { html: 'It doesn’t — undefined slopes can’t be compared.', why: '“Undefined” is a slope result: it says the segment is vertical. Two vertical segments through a shared point lie on one line.' }],
              t('m_{JK}=\\frac{' + (s.ys[1] - s.ys[0]) + '}{0}') + ' and ' + t('m_{KL}=\\frac{' + (s.ys[2] - s.ys[1]) + '}{0}') + ': both undefined, so each segment is vertical. They share ' + t('K') + ', so they are on the same vertical line ' + t('x=' + s.x) + ': collinear.', ['What does an undefined slope tell you about the segment’s direction?'], 'undefined = undefined proves collinear');
          } },
          { id: 'e14c', level: 'PRG', make: function (r) {
            return B.mc(r, '(c) Why would “undefined = undefined” <b>not</b> prove collinearity if the points did not all share an ' + t('x') + '-coordinate?', [
              { html: 'Two undefined slopes only say both segments are vertical — <b>parallel</b>. They could be on two different vertical lines.', right: true },
              { html: 'Because undefined slopes are never equal.', why: 'Two vertical segments both have undefined slopes; the question is whether they are on the same line.' },
              { html: 'Because the points would then be on a horizontal line.', why: 'Points with different ' + t('x') + '-coordinates and undefined slopes between pairs would be on different vertical lines, not one horizontal line.' },
              { html: 'It would still prove it — undefined always means the same line.', why: 'Two points on ' + t('x=-3') + ' and two on ' + t('x=1') + ' give two undefined slopes but lie on two different lines.' }],
              'Two undefined slopes only say both segments are vertical, i.e. <b>parallel</b>. Collinearity also needs them to be on the same line (share a point, or the same ' + t('x') + '). E.g. two points on ' + t('x=-3') + ' and two on ' + t('x=1') + ': two undefined slopes, two different lines.', ['Equal slopes alone mean parallel.'], 'why undefined = undefined can fail');
          } }] },
      { num: '15', section: 'Extra practice G — Error analysis', shared: function (r) { return gen(r, function (r) { var p = r.int(1, 7), q = r.int(2, 9); return gcd(p, q) === 1 && p !== q ? [p, q] : null; }, [3, 7]); },
        stem: function (f) { return 'Asked for the slope of a segment perpendicular to a segment of slope ' + t(frT(f[0], f[1])) + ', a student answers ' + t(frT(f[1], f[0])) + '.'; },
        parts: [
          { id: 'e15a', level: 'EMG', make: function (r, f) { return B.mc(r, '(a) Half of the instruction was carried out correctly. Which half?', [
            { html: 'The <b>reciprocal</b> (flipping the fraction) was done; the <b>sign change</b> was skipped.', right: true }, { html: 'The sign change was done; the reciprocal was skipped.', why: t(frT(f[1], f[0])) + ' is upside down compared with ' + t(frT(f[0], f[1])) + ' — and it is still positive.' },
            { html: 'Neither half was done.', why: 'Compare: the fraction is flipped.' }, { html: 'Both halves were done.', why: 'Perpendicular slopes have opposite signs. Is ' + t(frT(f[1], f[0])) + ' negative?' }],
            t(frT(f[1], f[0])) + ' is the reciprocal of ' + t(frT(f[0], f[1])) + ' (numerator and denominator swapped), but the sign change was skipped.', ['“Negative reciprocal” = two instructions.'], 'which half was done'); } },
          { id: 'e15b', level: 'EMG', make: function (r, f) { return B.mc(r, '(b) Multiply ' + t(frT(f[0], f[1])) + ' by the student’s answer. What does the product tell you about the two segments?', [
            { html: 'The product is ' + t('+1') + ' (not ' + t('-1') + '), and the slopes aren’t equal, so the segments are <b>neither</b> parallel nor perpendicular.', right: true },
            { html: 'The product is ' + t('1') + ', so they are parallel.', why: 'Parallel means <b>equal</b> slopes, not a product of ' + t('1') + '.' },
            { html: 'The product is ' + t('-1') + ', so they are perpendicular.', why: 'Multiply again: two positive numbers give a positive product.' },
            { html: 'The product is ' + t('0') + ', so one is horizontal.', why: t(frT(f[0], f[1]) + '\\times ' + frT(f[1], f[0])) + ' — multiply the tops and the bottoms.' }],
            t(frT(f[0], f[1]) + '\\times ' + frT(f[1], f[0]) + '=\\frac{' + f[0] * f[1] + '}{' + f[0] * f[1] + '}=1') + '. The product is ' + t('+1') + ', not ' + t('-1') + ', and the slopes are not equal: <b>neither</b>.', ['Multiply the numerators and the denominators.'], 'product +1 means neither'); } },
          { id: 'e15c', level: 'BEG', make: function (r, f) { var ps = perpOf(f); return slopeAns('(c) State the correct perpendicular slope.', ps, relChk(f, 'perp'), 'Correct slope: ' + t(sT(ps)) + '. Check: ' + t(prodT(f, ps)) + ' ✓', ['Flip it <b>and</b> change the sign.'], 'correct perpendicular slope'); } },
          { id: 'e15d', level: 'EMG', make: function (r, f) { return B.mc(r, '(d) Which one-sentence check would have caught this error immediately?', [
            { html: '“Multiply my answer by the original slope — if the product isn’t ' + t('-1') + ', I’m not finished.”', right: true },
            { html: '“Check that my answer is a fraction.”', why: t(frT(f[1], f[0])) + ' is a fraction — the check wouldn’t catch anything.' },
            { html: '“Check that my answer is bigger than the original slope.”', why: 'Size has nothing to do with it: the product with the original must be ' + t('-1') + '.' },
            { html: '“Check that my answer has the same sign as the original.”', why: 'Perpendicular slopes always have <b>opposite</b> signs — that check would approve the mistake.' }],
            'For example: “Multiply my answer by the original slope — if the product is not ' + t('-1') + ', I am not finished.” Here ' + t(frT(f[0], f[1]) + '\\times ' + frT(f[1], f[0]) + '=1') + ' fails at once. (Quicker: perpendicular slopes always have opposite signs.)', ['What is true of every pair of perpendicular slopes?'], 'a self-check for perpendicular'); } }] },
      { num: '16', shared: function (r) {
          return gen(r, function (r) { var a = r.int(2, 5), b = r.int(1, 4), n = r.int(1, 2); if (gcd(a, b) !== 1 || a === b) return null; var A = [r.int(-6, -2), r.int(-2, 4)], Bp = add(A, [a, b], n), C = [r.int(1, 4), r.int(-3, 2)], D = add(C, [b, -a], n); if (!inBox(Bp, 10) || !inBox(D, 10)) return null; return { A: A, B: Bp, C: C, D: D }; }, { A: [-5, 2], B: [1, 6], C: [3, -1], D: [7, -7] });
        },
        stem: function (s) { return 'Asked whether ' + t('AB') + ' and ' + t('CD') + ' are parallel, where ' + nP('A', s.A) + ', ' + nP('B', s.B) + ', ' + nP('C', s.C) + ' and ' + nP('D', s.D) + ', a student calculates ' + t('AB=' + lenT(s.A, s.B)) + ' and ' + t('CD=' + lenT(s.C, s.D)) + ' and concludes: <i>“The segments are the same length, so they are parallel.”</i> Both lengths are correct.'; },
        parts: [
          { id: 'e16a', sub: 'a i', level: 'EMG', make: function (r, s) { return slopeFields('Calculate ' + t('m_{AB}') + ' and ' + t('m_{CD}') + '.', [{ nm: 'AB', s: slopeOf(s.A, s.B) }, { nm: 'CD', s: slopeOf(s.C, s.D) }], t(calc(s.A, s.B, 'AB')) + '<br>' + t(calc(s.C, s.D, 'CD')), [SLOPE_HINT], 'slopes of two equal segments'); } },
          { id: 'e16a2', sub: 'a ii', level: 'EMG', make: function (r, s) { var a = slopeOf(s.A, s.B), b = slopeOf(s.C, s.D); return relMC(r, 'What is the true relationship between ' + t('AB') + ' and ' + t('CD') + '?', a, b, relSol(a, b) + ' — the opposite of the student’s claim.', 'true relationship of equal segments'); } },
          { id: 'e16b', sub: 'b', level: 'EMG', make: function (r) { return B.mc(r, '(b) Why can equal length never establish that two segments are parallel?', [
            { html: 'Length says how far a segment reaches, not which way it points: an equal segment can be turned to face any direction.', right: true },
            { html: 'Because equal segments are always perpendicular.', why: 'Here they happen to be — but two radii of a circle can point in any directions.' },
            { html: 'It can, if the lengths are exact radicals.', why: 'Exact or not, length carries no direction.' },
            { html: 'Because parallel segments must have different lengths.', why: 'Parallel segments can be any lengths, equal or not.' }],
            'Length says how far a segment reaches, not which way it points. A segment can be turned to any direction without changing its length, so two equal segments can be parallel, perpendicular (as here), or anything in between — picture two radii of one circle.', ['Picture two radii of a circle.'], 'length is not direction'); } },
          { id: 'e16c', sub: 'c', level: 'BEG', make: function (r) { return B.mc(r, '(c) Complete: “Distance can prove ____. Slope can prove ____.”', [
            { html: 'Distance: <b>equal lengths</b>. Slope: <b>parallel or perpendicular</b>.', right: true }, { html: 'Distance: parallel. Slope: equal lengths.', why: 'Swapped: distance measures size; slope measures direction.' },
            { html: 'Distance: perpendicular. Slope: collinear only.', why: 'Distance can’t see direction. Slope proves parallel (equal slopes) and perpendicular (product ' + t('-1') + ') as well as collinear.' }, { html: 'Both can prove parallel.', why: 'Distance can’t — that was the student’s error.' }],
            'Distance measures <i>size</i>: it proves sides are <b>equal in length</b>. Slope measures <i>direction</i>: it proves sides are <b>parallel</b> (equal slopes) or <b>perpendicular</b> (product ' + t('-1') + ').', ['Size versus direction.'], 'what each tool proves'); } }] },
      { num: '17', section: 'Extra practice H — Stretch, multiple choice and numerical response', shared: function (r) {
          return gen(r, function (r) { var q = r.int(1, 4), p = r.pick([1, 1, 2]) * (r.chance(0.7) ? 1 : -1); if (gcd(Math.abs(p), q) !== 1 || Math.abs(p) === q) return null; var Bp = [r.int(-2, 4), r.int(2, 8)], A = add(Bp, [-q, -p], r.int(2, 4)); if (!inBox(A, 10)) return null; var m = red(p, q), pm = perpOf(m); var xi = Bp[0] + Bp[1] * p / q, yi = Bp[1] - sV(pm) * Bp[0]; if (!Number.isInteger(xi) || !Number.isInteger(yi) || Math.abs(xi) > 20 || Math.abs(yi) > 20 || Bp[0] === 0 || !xi) return null; return { A: A, B: Bp, m: m, pm: pm, xi: xi, yi: yi }; }, { A: [-6, 2], B: [2, 6], m: [1, 2], pm: [-2, 1], xi: 5, yi: 10 });
        },
        stem: function (s) { return nP('A', s.A) + ' and ' + nP('B', s.B) + ' are given. A third point ' + t('C') + ' is to be chosen so that ' + t('\\angle ABC') + ' is a right angle.'; },
        parts: [
          { id: 'e17a', level: 'EMG', make: function (r, s) { return slopeAns('(a) The right angle is at ' + t('B') + ', so ' + t('BA\\perp BC') + '. What slope must ' + t('BC') + ' have?', s.pm, relChk(s.m, 'perp'), t(calc(s.A, s.B, 'AB')) + ', so ' + t('m_{BC}') + ' must be the negative reciprocal: ' + t(sT(s.pm)) + '.', ['Find ' + t('m_{AB}') + ' first.'], 'slope needed for a right angle at B', t('m_{BC}=')); } },
          { id: 'e17b', level: 'ADV', make: function (r, s) {
            var p = B.math('(b) Determine the coordinates of ' + t('C') + ' if ' + t('C') + ' lies on the ' + t('x') + '-axis.', K.pairs([[s.xi, 0]]), '(' + s.xi + ', 0)', 'Let ' + t('C(x,\\ 0)') + ': ' + t('\\frac{0-' + nb(s.B[1]) + '}{x-' + nb(s.B[0]) + '}=' + sT(s.pm) + '\\ \\Rightarrow\\ x=' + s.xi) + ', so ' + t('C(' + s.xi + ',\\ 0)') + '. Check: ' + t('m_{BC}=' + sT(slopeOf(s.B, [s.xi, 0]))) + ' and ' + t(prodT(s.m, s.pm)) + ' ✓', ['A point on the ' + t('x') + '-axis is ' + t('(x,\\ 0)') + '. Set ' + t('m_{BC}') + ' equal to the slope from (a).'], 'right angle: C on the x-axis', { keys: 'pairs', placeholder: 'e.g. (5, 0)' });
            p.bad = ['(0, ' + s.xi + ')', '(' + (2 * s.B[0] - s.xi) + ', 0)']; return p;
          } },
          { id: 'e17c', level: 'ADV', make: function (r, s) {
            var p = B.math('(c) Determine the coordinates of ' + t('C') + ' if instead ' + t('C') + ' lies on the ' + t('y') + '-axis.', K.pairs([[0, s.yi]]), '(0, ' + s.yi + ')', 'Let ' + t('C(0,\\ y)') + ': ' + t('\\frac{y-' + nb(s.B[1]) + '}{0-' + nb(s.B[0]) + '}=' + sT(s.pm) + '\\ \\Rightarrow\\ y=' + s.yi) + ', so ' + t('C(0,\\ ' + s.yi + ')') + '. Check: ' + t('m_{BC}=' + sT(slopeOf(s.B, [0, s.yi]))) + ' ✓', ['A point on the ' + t('y') + '-axis is ' + t('(0,\\ y)') + '.'], 'right angle: C on the y-axis', { keys: 'pairs', placeholder: 'e.g. (0, 10)' });
            p.bad = ['(' + s.yi + ', 0)', '(0, ' + (2 * s.B[1] - s.yi) + ')']; return p;
          } },
          { id: 'e17d', level: 'PRG', make: function (r) { return B.mc(r, '(d) Infinitely many points ' + t('C') + ' make ' + t('\\angle ABC') + ' a right angle, yet only one is on the ' + t('x') + '-axis. Why — and when would an axis contain <b>no</b> such point?', [
            { html: 'Every valid ' + t('C') + ' lies on the one line through ' + t('B') + ' perpendicular to ' + t('AB') + '; a line crosses an axis once — unless it is <b>parallel</b> to that axis.', right: true },
            { html: 'Because only one point on the ' + t('x') + '-axis has integer coordinates.', why: 'Every point ' + t('(x,\\ 0)') + ' is on the axis; only one is on the perpendicular line.' },
            { html: 'Because the ' + t('x') + '-axis is perpendicular to ' + t('AB') + '.', why: 'The ' + t('x') + '-axis is horizontal; ' + t('AB') + ' isn’t vertical. Think about the line all the valid points ' + t('C') + ' lie on.' },
            { html: 'An axis never misses the line, so there is always exactly one point.', why: 'If ' + t('AB') + ' were vertical, the perpendicular would be horizontal and never meet the ' + t('x') + '-axis (unless it is the axis).' }],
            'Every valid ' + t('C') + ' lies on the single line through ' + t('B') + ' perpendicular to ' + t('AB') + '. That line isn’t horizontal, so it crosses the ' + t('x') + '-axis exactly once. An axis contains no such point when the perpendicular line is <b>parallel to that axis</b>: if ' + t('AB') + ' were vertical, the perpendicular would be horizontal and miss the ' + t('x') + '-axis; if ' + t('AB') + ' were horizontal, it would be vertical and miss the ' + t('y') + '-axis.', ['Where do all the valid points ' + t('C') + ' lie?'], 'why only one C on an axis'); } }] },
      { num: '18', parts: [
        { id: 'e18', level: 'PRG', make: function (r) {
          var g = gen(r, function (r) { var p = r.int(1, 4), q = r.int(2, 5); if (gcd(p, q) !== 1 || p === q) return null; var sg = r.chance(0.7) ? -1 : 1, A = [r.int(-5, -1), r.int(-2, 5)], j = r.int(1, 2), Bp = add(A, [q * 2 * j, sg * p * 2 * j]); if (!inBox(Bp, 10)) return null; return { A: A, B: Bp, m: [sg * p, q] }; }, { A: [-3, 4], B: [5, -2], m: [-3, 4] });
          var m = g.m, seg = function (s) { var P = [r.int(-2, 3), r.int(-1, 3)], k = r.int(1, 2); return [P, add(P, [s[1] * k, s[0] * k])]; };
          var opts = [{ s: perpOf(m), right: true }, { s: m, why: 'That segment has the <b>same</b> slope as ' + t('AB') + ' — it is parallel.' }, { s: red(m[1], m[0]), why: 'That slope is the reciprocal of ' + t('m_{AB}') + ' with the same sign — the product is ' + t('+1') + '.' }, { s: red(-m[0], m[1]), why: 'That slope only has the sign changed — not flipped.' }];
          return B.mc(r, '<i>(Multiple choice)</i> Segment ' + t('AB') + ' joins ' + nP('A', g.A) + ' and ' + nP('B', g.B) + '. Which segment is perpendicular to ' + t('AB') + '?', opts.map(function (o) { var S = seg(o.s); return { html: t(ptT(S[0]) + '\\text{ to }' + ptT(S[1])), right: !!o.right, why: o.why }; }),
            t(calc(g.A, g.B, 'AB')) + ', so a perpendicular segment needs slope ' + t(sT(perpOf(m))) + '. Find each option’s slope; only one gives ' + t(sT(perpOf(m))) + ' (check: ' + t(prodT(m, perpOf(m))) + ').', ['Find ' + t('m_{AB}') + ', then the slope of each option.'], 'MC which segment is perpendicular');
        } }] },
      { num: '19', parts: [
        { id: 'e19', level: 'PRG', make: function (r) {
          var g = gen(r, function (r) { var p = r.int(1, 4), q = r.int(2, 6); if (gcd(p, q) !== 1 || p === q) return null; var C = [r.int(-2, 3), r.int(-2, 3)], j = r.int(1, 2), D = add(C, [q * j, p * j]), A = [r.int(-6, -1), r.int(4, 9)], dy = -p * r.int(2, 6), k = A[0] - dy * p / q; if (!Number.isInteger(k) || k < 0 || k > 99) return null; return { A: A, yB: A[1] + dy, C: C, D: D, k: k, m: [p, q], dy: dy }; }, { A: [-4, 7], yB: -5, C: [2, 1], D: [8, 5], k: 4, m: [2, 3], dy: -12 });
          var ps = perpOf(g.m), kPar = g.A[0] + g.dy / sV(g.m);
          return B.nr('<i>(Numerical response)</i> The segment joining ' + nP('A', g.A) + ' and ' + t('B(k,\\ ' + g.yB + ')') + ' is perpendicular to the segment joining ' + nP('C', g.C) + ' and ' + nP('D', g.D) + '. The value of ' + t('k') + ' is ____.', g.k,
            function (v) { if (near(v, kPar)) return { code: 'k-par-perp', hint: 'That makes ' + t('AB') + ' parallel to ' + t('CD') + '. Use the negative reciprocal of ' + t('m_{CD}') + '.' }; return null; },
            t(calc(g.C, g.D, 'CD')) + ', so ' + t('m_{AB}=' + sT(ps)) + '.<br>' + t('\\frac{' + g.yB + '-' + nb(g.A[1]) + '}{k-' + nb(g.A[0]) + '}=' + sT(ps) + '\\ \\Rightarrow\\ k-' + nb(g.A[0]) + '=' + (g.k - g.A[0]) + '\\ \\Rightarrow\\ k=' + g.k), ['Find ' + t('m_{CD}') + ', take the negative reciprocal, then solve for ' + t('k') + '.'], 'NR perpendicular: find k');
        } }] }
    ]
  });
})(window);
