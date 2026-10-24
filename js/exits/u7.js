/* Math 10C · Unit 7 exit slips (Lessons 7.1–7.7, Equations of Linear Relations) — one short end-of-class check per
 * lesson, written only in test mode. HW.defineExit makes u7l1x … u7l7x ("Exit Slip 7.1" …).
 * Each slip has 3–4 questions (4–5 parts, about 5–8 minutes) that are new but match the skills and difficulty of the
 * lesson's assignment (u7_LXX.tex / js/lessons/u7lN.js), using only what has been taught up to that lesson. The questions
 * are spread over the Beginning, Progressing and Mastery boxes so that "the highest level answered right per outcome"
 * tells students apart. Every part is a generator (each student gets their own numbers) with a key, a worked solution,
 * hints and typical wrong answers (codes u7x-…, labelled and given a partial-credit decision below).
 * Lesson 7.7 is the unit review: its slip mixes RF4–RF7. A scientific calculator is allowed (as on the unit test);
 * nothing needs a graphing calculator. Graphs use the graph pad (the line through any two of its points). */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, B = K.P, ex = HW.ex, Ln = HW.lines, DR = HW.draw, F = HW.fmt, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'u7x-frac-x': 'Slope: used only the numerator of the x-coefficient', 'u7x-mb-swap': 'Slope and y-intercept swapped', 'u7x-b-sign': 'y-intercept sign',
    'u7x-icpt-axis': 'Intercept written as a point off that axis', 'u7x-icpt-swap': 'x- and y-intercepts swapped', 'u7x-xint-sign': 'x-intercept sign',
    'u7x-xint-yint': 'Used the y-intercept as the x-intercept', 'u7x-xint-recip': 'x-intercept: multiplied by the slope instead of dividing', 'u7x-xint-flip': 'x-intercept: divided the wrong way round',
    'u7x-tri-half': 'Triangle area: forgot the ½', 'u7x-tri-slope': 'Triangle: used b for both legs (ignored the slope)', 'u7x-tri-area': 'Gave b² (no square root)', 'u7x-tri-neg': 'Gave a negative b',
    'u7x-gr-sign': 'Graph: slope sign wrong', 'u7x-gr-flip': 'Graph: rise and run swapped', 'u7x-gr-b-xaxis': 'Graph: started at b on the x-axis', 'u7x-gr-b-sign': 'Graph: y-intercept sign wrong',
    'u7x-gr-join': 'Graph: points not joined into a line', 'u7x-gr-slope': 'Graph: right starting point, wrong slope', 'u7x-gr-icpt': 'Graph: right slope, wrong position',
    'u7x-gr-pt-sign': 'Graph: used the point with the signs switched', 'u7x-gr-sp-yint': 'Graph: used the point’s y-value as the y-intercept', 'u7x-gr-icpt-swap': 'Graph: intercepts swapped',
    'u7x-gr-icpt-sign': 'Graph: an intercept with the wrong sign', 'u7x-gr-coef': 'Graph: used the coefficients as the intercepts',
    'u7x-perp-same': 'Perpendicular: used the given slope', 'u7x-perp-nosign': 'Perpendicular: flipped the slope but kept its sign', 'u7x-perp-noflip': 'Perpendicular: changed the sign but didn’t flip',
    'u7x-par-perp': 'Parallel: used the perpendicular slope', 'u7x-b-wrongline': 'Took the intercept from the wrong line', 'u7x-m-wrongline': 'Took the slope from the wrong line', 'u7x-given-line': 'Wrote the given line itself',
    'u7x-notlinear': 'Not the equation of a line', 'u7x-not-divided': 'Did not divide by the coefficient of y', 'u7x-gf-nomult': 'General form: did not multiply every term by the common denominator',
    'u7x-sp-signs': 'Slope–point form: signs of the point switched', 'u7x-sp-swap': 'Slope–point form: x- and y-coordinates switched', 'u7x-sp-pt-sign': 'Read the point from slope–point form with the wrong signs',
    'u7x-ctx-swap': 'Context: the two quantities switched', 'u7x-rate-sign': 'Rate of change: wrong sign', 'u7x-rate-flip': 'Rate of change upside down', 'u7x-rate-change': 'Gave the total change, not the rate',
    'u7x-rate-point': 'Divided one reading by its time', 'u7x-ctx-b-point': 'Used a reading as the starting value', 'u7x-ctx-b-sign': 'Sign slip finding the starting value', 'u7x-ctx-no-b': 'Left out the starting value / fixed fee',
    'u7x-t-early': 'Time: solved for the wrong height', 'u7x-t-start': 'Time counted from a reading instead of from t = 0', 'u7x-k-sign': 'Sign slip solving for k', 'u7x-k-xint': 'Used the x-intercept instead of the y-intercept',
    'u7x-k-recip': 'Divided the wrong way solving for k'
  });
  HW.addPartial({
    'u7x-frac-x': 'b', 'u7x-mb-swap': 'n', 'u7x-b-sign': 's', 'u7x-icpt-axis': 'n', 'u7x-icpt-swap': 'n', 'u7x-xint-sign': 's', 'u7x-xint-yint': 'n', 'u7x-xint-recip': 'b', 'u7x-xint-flip': 'b',
    'u7x-tri-half': 'b', 'u7x-tri-slope': 'b', 'u7x-tri-area': 'b', 'u7x-tri-neg': 's',
    'u7x-gr-sign': 'b', 'u7x-gr-flip': 'b', 'u7x-gr-b-xaxis': 'b', 'u7x-gr-b-sign': 's', 'u7x-gr-join': 'b', 'u7x-gr-slope': 'b', 'u7x-gr-icpt': 'b', 'u7x-gr-pt-sign': 'b', 'u7x-gr-sp-yint': 'b',
    'u7x-gr-icpt-swap': 'n', 'u7x-gr-icpt-sign': 's', 'u7x-gr-coef': 'n',
    'u7x-perp-same': 'n', 'u7x-perp-nosign': 'b', 'u7x-perp-noflip': 'b', 'u7x-par-perp': 'n', 'u7x-b-wrongline': 'b', 'u7x-m-wrongline': 'n', 'u7x-given-line': 'n', 'u7x-notlinear': 'n',
    'u7x-not-divided': 'b', 'u7x-gf-nomult': 'b', 'u7x-sp-signs': 'b', 'u7x-sp-swap': 'n', 'u7x-sp-pt-sign': 'b', 'u7x-ctx-swap': 'b',
    'u7x-rate-sign': 's', 'u7x-rate-flip': 'b', 'u7x-rate-change': 'b', 'u7x-rate-point': 'n', 'u7x-ctx-b-point': 'b', 'u7x-ctx-b-sign': 's', 'u7x-ctx-no-b': 'b',
    'u7x-t-early': 'b', 'u7x-t-start': 'b', 'u7x-k-sign': 's', 'u7x-k-xint': 'n', 'u7x-k-recip': 'b'
  });

  /* ---------------- numbers, fractions [p, q] and LaTeX ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function fr(p, q) { if (Array.isArray(p)) return fr(p[0], p[1]); if (q == null) q = 1; if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g + 0, q / g]; }
  function fv(f) { return Array.isArray(f) ? f[0] / f[1] : f; }
  function fAdd(a, b) { a = fr(a); b = fr(b); return fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function fSub(a, b) { b = fr(b); return fAdd(a, [-b[0], b[1]]); }
  function fMul(a, b) { a = fr(a); b = fr(b); return fr(a[0] * b[0], a[1] * b[1]); }
  function fNeg(a) { a = fr(a); return [-a[0], a[1]]; }
  function fInv(a) { a = fr(a); return fr(a[1], a[0]); }
  function nrec(a) { return fNeg(fInv(a)); }
  function fEq(a, b) { a = fr(a); b = fr(b); return a[0] === b[0] && a[1] === b[1]; }
  function nT(a) { if (typeof a === 'number' && !Number.isInteger(a)) return String(Math.round(a * 1e6) / 1e6); a = fr(a); return Ln.frT(a[0], a[1]); }
  function pT(a) { return fv(a) < 0 ? '\\left(' + nT(a) + '\\right)' : nT(a); }
  function ptT(x, y) { return '(' + nT(x) + ',\\ ' + nT(y) + ')'; }
  function ptK(x, y) { return '(' + nT(x) + ', ' + nT(y) + ')'; }
  function near(a, b) { return Math.abs(a - b) < 1e-9; }
  function nz(r, lo, hi) { var v; do { v = r.int(lo, hi); } while (v === 0); return v; }
  function until(gen, okf) { for (var i = 0; i < 5000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u7 exits: no valid numbers'); }
  function term(c, v, first) { c = fr(c); if (c[0] === 0) return ''; var ab = Math.abs(c[0]), mag = c[1] === 1 ? (ab === 1 && v ? '' : String(ab)) : '\\frac{' + ab + '}{' + c[1] + '}'; return (c[0] < 0 ? '-' : first ? '' : '+') + mag + v; }
  function lin(ts) { var o = ''; ts.forEach(function (x) { o += term(x[0], x[1], o === ''); }); return o || '0'; }
  function SI(m, b, vars) { return Ln.tex({ m: fr(m), b: fr(b) }, 'slope-intercept', null, vars); }
  function GEN(T, vars) { return Ln.tex(T, 'general', null, vars); }
  function PS(m, P) { return Ln.tex({ m: fr(m), point: P }, 'point-slope', P); }
  function L(m, b) { return { m: fr(m), b: fr(b) }; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function cl(x) { return Math.round(x * 1e9) / 1e9; }
  function nf(x) { return F(cl(x)); }

  /* ---------------- checkers ---------------- */
  /* [[value, code, hint, tol?], …] → diag(v); entries equal to the target are dropped */
  function dg(list, T) {
    var L2 = (list || []).filter(function (d) { return d && d[0] != null && isFinite(fv(d[0])) && (T == null || !near(fv(d[0]), fv(T))); });
    return function (v) { for (var i = 0; i < L2.length; i++) if (Math.abs(v - fv(L2[i][0])) < (L2[i][3] || 1e-9)) return { code: L2[i][1], hint: L2[i][2] }; return null; };
  }
  function cleanS(s) { return String(s == null ? '' : s).replace(/\\left|\\right/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\[,;:! ]|~/g, ' ').trim(); }
  function asPoint(s) {
    var m = /^\((.+),(.+)\)$/.exec(cleanS(s).replace(/\s+/g, '')); if (!m) return null;
    var a = ex.parse(m[1]), b = ex.parse(m[2]); if (!a.ok || !b.ok) return null;
    var va = ex.value(a.ast), vb = ex.value(b.ast); if (!isFinite(va) || !isFinite(vb)) return null;
    return [va, vb, m[1], m[2]];
  }
  /* an exact value (fraction, integer or exact decimal); o.axis 'x' | 'y': an intercept, which may be written as a point */
  function valC(T, list, o) {
    o = o || {};
    var base = K.value(fv(T), { only: 'fraction', diag: dg(list, T) });
    return function (resp) {
      var s = cleanS(resp); if (!s) return form('empty', 'Type your answer first.');
      var p = o.axis ? asPoint(s) : null;
      if (p) {
        if (o.axis === 'y') { if (!near(p[0], 0)) return wrong('u7x-icpt-axis', 'A point on the ' + t('y') + '-axis has ' + t('x=0') + ': the ' + t('y') + '-intercept is the point ' + t('(0,\\ b)') + '.'); s = p[3]; }
        else { if (!near(p[1], 0)) return wrong('u7x-icpt-axis', 'A point on the ' + t('x') + '-axis has ' + t('y=0') + ': the ' + t('x') + '-intercept is the point ' + t('(a,\\ 0)') + '.'); s = p[2]; }
      }
      return base(s);
    };
  }
  function numC(ans, list) { return K.number(ans, dg(list, ans)); }
  function slopeC(m, list) { return K.slope(fr(m), { diag: dg(list, m) }); }
  /* a number box (units after it); list = [[v, code, hint, tol?]] */
  function numPart(prompt, ans, list, sol, hints, text, inp) {
    var p = B.number(prompt, ans, dg(list, ans), sol, hints, text, inp);
    p.key = String(cl(ans)); p.answer = t(nf(ans)) + (inp && inp.after ? ' ' + inp.after : '');
    p.bad = (list || []).filter(function (d) { return isFinite(fv(d[0])) && !near(fv(d[0]), ans); }).map(function (d) { var v = fv(d[0]); return d[3] >= 0.001 && !Number.isInteger(cl(v)) ? v.toFixed(2) : String(cl(v)); })
      .filter(function (x, i, arr) { return arr.indexOf(x) === i; });
    return p;
  }
  /* slope and y-intercept in two boxes */
  function mbPart(prompt, m, b, o, sol, hints, text) {
    o = o || {};
    var eqv = near(fv(m), fv(b));
    var mC = slopeC(m, (o.mDiag || []).concat(eqv ? [] : [[b, 'u7x-mb-swap', 'That’s the ' + t('y') + '-intercept. The slope ' + t('m') + ' is the number multiplying ' + t('x') + ' once the equation reads ' + t('y=mx+b') + '.']]));
    var bC = valC(b, (o.bDiag || []).concat(eqv ? [] : [[m, 'u7x-mb-swap', 'That’s the slope. The ' + t('y') + '-intercept ' + t('b') + ' is the constant term once the equation reads ' + t('y=mx+b') + '.']]), { axis: 'y' });
    var keys = [nT(m), nT(b)];
    var p = B.fields(prompt, [{ label: 'Slope', name: 'Slope', before: t('m='), mode: 'math', keys: 'fraction' }, { label: t('y') + '-intercept', name: t('y') + '-intercept', before: t('b='), mode: 'math', keys: 'fraction' }],
      [mC, bC], keys, t('m=' + nT(m)) + ', &nbsp;' + t('b=' + nT(b)), sol, hints, text);
    p.bad = (eqv ? [] : [[keys[1], keys[0]]]).concat(o.bad || []).filter(function (x) { return x.join('|') !== keys.join('|'); });
    return p;
  }
  /* the equation of a line (eq keypad): K.P.line + a nudge for rounded decimals; opt.wrong lines become bad answers */
  function closeL(S, T) {
    if (Math.abs(S[1]) < 1e-12 || Math.abs(T[1]) < 1e-12) return false;
    return Math.abs(-S[0] / S[1] + T[0] / T[1]) < 0.051 && Math.abs(-S[2] / S[1] + T[2] / T[1]) < 0.051;
  }
  function LP(prompt, target, opt, sol, hints, text) {
    opt = opt || {};
    var vars = opt.vars || ['x', 'y'], TL = Ln.of(target);
    var p = B.line(prompt, target, opt, sol, hints, text), c = p.check;
    p.check = function (resp) {
      var res = c(resp);
      if (res.v === 'wrong' && /\d\.\d/.test(String(resp))) { var rr = Ln.read(resp, vars); if (rr.ok && closeL([rr.a, rr.b, rr.c], TL)) return form('u7x-decimal', 'Close — but give the <b>exact</b> equation: write the numbers as fractions, not rounded decimals.'); }
      return res;
    };
    var bad = [];
    (opt.wrong || []).forEach(function (w) { var is = w.is; if (typeof is === 'string') bad.push(is); else if (!Ln.same(Ln.of(is), TL)) bad.push(opt.form === 'point-slope' && is.point ? Ln.tex(is, 'point-slope', is.point, vars) : Ln.tex(is, opt.form === 'general' ? 'general' : 'slope-intercept', null, vars)); });
    p.bad = bad.concat(opt.bad || []).filter(function (x, i, arr) { return arr.indexOf(x) === i; });
    return p;
  }
  function withB(m, base) { var o = { m: fr(m) }; if (base.point) o.point = base.point; else o.b = fr(base.b); return o; }
  function perpW(g, base) {
    var out = [{ is: withB(g, base), code: 'u7x-perp-same', hint: 'That’s the slope of the given line, so your line is <b>parallel</b> to it. A perpendicular line needs the <b>negative reciprocal</b>: flip the slope and change its sign.' }];
    if (!fEq(fInv(g), g)) out.push({ is: withB(fInv(g), base), code: 'u7x-perp-nosign', hint: 'You flipped the slope but kept its sign. Perpendicular slopes multiply to ' + t('-1') + ', so one is positive and the other negative.' });
    if (!fEq(fNeg(g), nrec(g))) out.push({ is: withB(fNeg(g), base), code: 'u7x-perp-noflip', hint: 'You changed the sign but didn’t flip the slope. The perpendicular slope is the negative <b>reciprocal</b>: ' + t(nT(g)) + ' becomes ' + t(nT(nrec(g))) + '.' });
    return out;
  }
  function parW(g, base) { return fEq(nrec(g), g) ? [] : [{ is: withB(nrec(g), base), code: 'u7x-par-perp', hint: 'That’s the negative reciprocal — the slope of a <b>perpendicular</b> line. Parallel lines have <b>equal</b> slopes.' }]; }

  /* an equation with letters: right when it is the same line for every value of the letters.
   * coef(env) -> [A, B, C] of A x + B y + C = 0; diags: [{ coef, code, hint }] */
  var ENVS = [{ a: 2.17, c: -3.41, d: 1.83, e: -2.29, g: 1.37, h: 2.71, j: -1.93, k: 0.61, n: 3.3, p: -1.1, q: 1.6, r: 2.9, s: -0.7, u: 1.45, v: -2.05, w: 0.83, z: -1.66 },
    { a: -1.29, c: 2.53, d: -0.88, e: 1.41, g: -2.6, h: -0.83, j: 3.17, k: 1.9, n: -1.7, p: 2.2, q: -2.4, r: -1.3, s: 2.6, u: -0.95, v: 1.75, w: -2.45, z: 2.15 },
    { a: 3.7, c: 1.13, d: 2.39, e: -0.67, g: 0.77, h: 1.61, j: 1.41, k: -2.23, n: 0.9, p: 1.35, q: 3.05, r: 0.65, s: -1.95, u: 2.85, v: 0.55, w: 1.25, z: -0.45 }];
  function astVars(a, acc) { (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'var') acc[x.n] = 1; ['a', 'b', 'n'].forEach(function (k) { if (x[k]) w(x[k]); }); })(a); return acc; }
  function prop(u, v) { var n = Math.hypot(u[0], u[1], u[2]) * Math.hypot(v[0], v[1], v[2]) || 1; return Math.abs(u[0] * v[1] - u[1] * v[0]) < 1e-7 * n && Math.abs(u[0] * v[2] - u[2] * v[0]) < 1e-7 * n && Math.abs(u[1] * v[2] - u[2] * v[1]) < 1e-7 * n; }
  function symChk(coef, letters, diags) {
    var allowed = ['x', 'y'].concat(letters);
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').replace(/\\cdot/g, '\\times ').trim();
      if (!s) return form('empty', 'Type your equation first.');
      var parts = s.split('=');
      if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) return form('line-no-eq', 'Write an equation with one equals sign, e.g. ' + t('y=2x+1') + '.');
      var la = ex.parse(parts[0]), ra = ex.parse(parts[1]);
      if (!la.ok || !ra.ok) return form('line-unreadable', 'I can’t read that equation. Check the brackets and fractions.');
      var vs = Object.keys(astVars(ra.ast, astVars(la.ast, {}))).filter(function (v) { return allowed.indexOf(v) < 0; });
      if (vs.length) return form('line-vars', 'Use only ' + t('x') + ', ' + t('y') + ' and the letters from the question (' + letters.map(t).join(', ') + ').');
      var match = function (cf) {
        for (var i = 0; i < ENVS.length; i++) {
          var e = ENVS[i], D = function (x, y) { var en = Object.assign({}, e, { x: x, y: y }); return ex.value(la.ast, en) - ex.value(ra.ast, en); };
          var c0 = D(0, 0), A = D(1, 0) - c0, Bc = D(0, 1) - c0, sc = 1 + Math.abs(c0) + Math.abs(A) + Math.abs(Bc);
          if (![c0, A, Bc].every(isFinite)) return 'bad';
          if (Math.abs(D(2, -3) - (c0 + 2 * A - 3 * Bc)) > 1e-7 * sc || Math.abs(D(-1.5, 2.5) - (c0 - 1.5 * A + 2.5 * Bc)) > 1e-7 * sc) return 'nonlin';
          if (Math.abs(A) < 1e-12 && Math.abs(Bc) < 1e-12) return 'nonlin';
          if (!prop([A, Bc, c0], cf(e))) return false;
        }
        return true;
      };
      var m = match(coef);
      if (m === 'bad') return form('line-unreadable', 'I can’t read that equation. Check the brackets and fractions.');
      if (m === 'nonlin') return wrong('u7x-notlinear', 'That isn’t the equation of a line: ' + t('x') + ' and ' + t('y') + ' should only appear to the first power.');
      if (m) return ok();
      for (var i = 0; i < (diags || []).length; i++) if (match(diags[i].coef) === true) return wrong(diags[i].code, diags[i].hint);
      return wrong('line', null);
    };
  }

  /* ---------------- graph pad ---------------- */
  var PADHELP = ' <span style="color:#6a7182;font-size:.92em">(Use <b>╱ Line</b>: tap two points on the line — its ends start as arrows.)</span>';
  function padI(xr, yr) { return { x: xr || [-6, 6], y: yr || [-6, 6], grid: 1, labels: 2, defaultEnd: 'arrow', max: 360 }; }
  function gv(pts, pieces) { return { pts: pts || [], pieces: pieces || [], join: 'none' }; }
  function lineV(p, q) { return gv([], [{ v: [p, q], s: 'arrow', e: 'arrow' }]); }
  function lineThroughSlope(pt, m) { m = fr(m); return lineV(pt, [pt[0] + m[1], pt[1] + m[0]]); }
  function lineMB(m, b) { m = fr(m); var bv = fv(b); return lineV([0, bv], [m[1], bv + m[0]]); }
  /* the lattice points of y = mx + b inside the window (first and last) */
  function latPts(m, b, xr, yr) {
    var out = [];
    for (var x = xr[0]; x <= xr[1]; x++) { var y = fv(m) * x + fv(b); if (Math.abs(y - Math.round(y)) < 1e-9 && y >= yr[0] - 1e-9 && y <= yr[1] + 1e-9) out.push([x, Math.round(y)]); }
    return out;
  }
  function keyLine(m, b, xr, yr) { var s = latPts(m, b, xr || [-6, 6], yr || [-6, 6]); return lineV(s[0], s[s.length - 1]); }
  function lineCoef(v) { var g = DR.geom(v), ks = Object.keys(g.lines); if (ks.length !== 1 || g.pts.length) return null; return g.lines[ks[0]]; }
  function segOf(v) { var n = DR.norm(v); return gv([], n.pieces.map(function (pc) { return { v: pc.v, s: 'closed', e: 'closed' }; })); }
  /* exact line, with "points not joined" and right-intercept / right-slope refinements (o: { m, b } numbers, mq: [p, q]) */
  function exactChk(target, W, o) {
    o = o || {};
    var base = K.graphExact(target, { wrong: W }), TL = lineCoef(target);
    function onT(p) { return Math.abs(TL.A * p[0] + TL.B * p[1] - TL.C) < 1e-6; }
    return function (resp) {
      if (!DR.empty(resp) && DR.same(resp, target)) return ok();
      var n = DR.norm(resp);
      if (!n.pieces.length && n.pts.length >= 2 && n.pts.every(onT)) return wrong('u7x-gr-join', 'Your points are on the line — now join them: choose <b>╱ Line</b> and tap two of them (the ends become arrows, because the line goes on forever).');
      if (!n.pieces.length && n.pts.length === 1 && onT(n.pts[0])) return wrong('u7x-gr-join', 'That point is on the line. Find a second point, then join them with <b>╱ Line</b>.');
      var r = base(resp);
      if (r.v === 'wrong' && r.code === 'graph' && o.m != null) {
        var S = lineCoef(resp);
        if (S && S.B !== 0) {
          var ms = -S.A / S.B, bs = S.C / S.B;
          if (near(bs, o.b) && !near(ms, o.m)) return wrong('u7x-gr-slope', 'Your line crosses the ' + t('y') + '-axis in the right place — now check the slope, ' + t('m=' + nT(o.mq || o.m)) + ': rise over run.');
          if (near(ms, o.m) && !near(bs, o.b)) return wrong('u7x-gr-icpt', 'Your line has the right slope, but it is in the wrong place. Check a point on it: substitute it into the equation.');
        }
      }
      return r;
    };
  }
  function drawPart(prompt, inp, target, W, o, sol, hints, text, extraBad) {
    var p = B.graph(prompt + PADHELP, inp, exactChk(target, W, o), target, sol, hints, text);
    p.bad = W.map(function (w) { return w.is; }).concat(extraBad || []).filter(function (b) { return !DR.same(b, target); });
    return p;
  }
  /* classic graphing errors for y = mx + b (m = [p, q], b a number) */
  function slopeWrongs(m, b) {
    m = fr(m); var W = [], up = m[0] > 0;
    if (m[0] !== 0) W.push({ is: lineMB([-m[0], m[1]], b), code: 'u7x-gr-sign', hint: 'Check the direction: a ' + (up ? 'positive' : 'negative') + ' slope means the line ' + (up ? 'rises' : 'falls') + ' from left to right.' });
    if (m[0] !== 0 && Math.abs(m[0]) !== m[1]) W.push({ is: lineMB(fr(m[0] > 0 ? m[1] : -m[1], Math.abs(m[0])), b), code: 'u7x-gr-flip', hint: 'Rise and run are swapped. In ' + t('m=' + nT(m)) + ' the top number is the <b>rise</b> (up or down) and the bottom number is the <b>run</b> (to the right).' });
    if (fv(b) !== 0) W.push({ is: lineThroughSlope([fv(b), 0], m), code: 'u7x-gr-b-xaxis', hint: 'The ' + t('y') + '-intercept is on the <b>' + t('y') + '-axis</b>: start at ' + t(ptT(0, b)) + ', not at ' + t(ptT(b, 0)) + '.' });
    if (fv(b) !== 0) W.push({ is: lineMB(m, -fv(b)), code: 'u7x-gr-b-sign', hint: 'Check the sign of the ' + t('y') + '-intercept: the line crosses the ' + t('y') + '-axis at ' + t(ptT(0, b)) + '.' });
    return W;
  }
  /* a picture of lines with marked points: ls = [{ m, b }], o = { x, y, points: [{ x, y }] } */
  function clip(m, b, xr, yr) {
    var mv = fv(m), bv = fv(b), out = [];
    if (mv === 0) return [[xr[0], bv], [xr[1], bv]];
    [xr[0], xr[1]].forEach(function (x) { var y = mv * x + bv; if (y >= yr[0] - 1e-9 && y <= yr[1] + 1e-9) out.push([x, y]); });
    [yr[0], yr[1]].forEach(function (y) { var x = (y - bv) / mv; if (x > xr[0] + 1e-9 && x < xr[1] - 1e-9) out.push([x, y]); });
    out.sort(function (p, q) { return p[0] - q[0]; });
    return [out[0], out[out.length - 1]];
  }
  function lineFig(ls, o) {
    o = o || {};
    var xr = o.x || [-6, 6], yr = o.y || [-6, 6], ix = [xr[0] + 0.35, xr[1] - 0.35], iy = [yr[0] + 0.35, yr[1] - 0.35];
    var segs = ls.map(function (l) { return { pts: clip(l.m, l.b, ix, iy), start: 'arrow', end: 'arrow', color: l.color }; });
    return '<div class="fig">' + HW.graph({ x: xr, y: yr, grid: 1, labels: 2, segs: segs, points: (o.points || []).map(function (p) { return { x: p[0], y: p[1], color: '#1c2230' }; }), max: o.max || 300, aria: o.aria || 'graph of a line' }) + '</div>';
  }

  /* ---------------- contexts: domain and range in two boxes ---------------- */
  function bld(v, lo, hi) { return '\\{' + v + '\\mid ' + nf(lo) + '\\le ' + v + '\\le ' + nf(hi) + ',\\ ' + v + '\\in\\mathbb{R}\\}'; }
  function bldK(v, lo, hi) { return '\\{' + v + '\\mid ' + cl(lo) + '\\le ' + v + '\\le ' + cl(hi) + ',\\ ' + v + '\\in\\mathbb{R}\\}'; }
  function prep(s) { return String(s == null ? '' : s).replace(/(\d)(?:\\,|\\ |\\;|~|\s)+(?=\d{3}(?!\d))/g, '$1'); }
  function toY(s, w) { s = prep(s).replace(/\\left|\\right/g, ''); if (w && w !== 'y') s = s.replace(new RegExp('(^|[^A-Za-z\\\\])' + w + '(?![A-Za-z])', 'g'), '$1y'); return s; }
  function drPart(prompt, o, sol, hints, text) {
    var dv = o.dv, w = o.w;
    var Dt = bldK(dv, o.D[0], o.D[1]), Ry = bldK('y', o.R[0], o.R[1]), Rs = bldK(w, o.R[0], o.R[1]);
    var ctxEnd = { 'set-arrow': 'This situation has a start and an end, so the set has an end value on both sides.', 'set-endpoint': 'The end values are right — both ends are included here, so use ' + t('\\le') + ' on both sides.' };
    var bD = K.set(Dt, { v: dv, other: bldK(dv, o.R[0], o.R[1]), otherName: 'range', wrong: o.dW }), bR = K.set(Ry, { v: 'y', other: bldK('y', o.D[0], o.D[1]), otherName: 'domain', wrong: o.rW });
    var cD = function (resp) { var r = bD(prep(resp)); if (r.v === 'wrong' && ctxEnd[r.code]) return wrong(r.code, ctxEnd[r.code]); return r; };
    var cR = function (resp) {
      var r = bR(toY(resp, w));
      if (r.v === 'form' && r.code === 'set-letter') return form('set-letter', 'Right set — but the range is a set of outputs: write it with ' + t(w) + '.');
      if (r.v === 'form' && r.code === 'set-tag') return form('set-tag', 'Right — now finish the set notation with ' + t(',\\ ' + w + '\\in\\mathbb{R}') + '.');
      if (r.v === 'wrong' && ctxEnd[r.code]) return wrong(r.code, ctxEnd[r.code]);
      return r;
    };
    var fl = [{ label: 'Domain', name: 'Domain', mode: 'math', keys: 'set', vars: [dv, w], wide: true, placeholder: 'e.g. {' + dv + ' | 0 <= ' + dv + ' <= 5, ' + dv + ' in R}' },
      { label: 'Range', name: 'Range', mode: 'math', keys: 'set', vars: [dv, w], wide: true, placeholder: 'e.g. {' + w + ' | 1 <= ' + w + ' <= 4, ' + w + ' in R}' }];
    var p = B.fields(prompt, fl, [cD, cR], [Dt, Rs], t('D=' + bld(dv, o.D[0], o.D[1])) + '<br>' + t('R=' + bld(w, o.R[0], o.R[1])), sol, hints, text);
    p.bad = [[Rs, Dt], ['\\{' + dv + '\\mid ' + dv + '\\ge 0,\\ ' + dv + '\\in\\mathbb{R}\\}', Rs]].concat((o.dW || []).map(function (x) { return [x.is, Rs]; }));
    return p;
  }
  function mc(r, prompt, opts, sol, hints, text, keep) {
    var seen = {}, out = [];
    opts.forEach(function (o) { if (!seen[o.html]) { seen[o.html] = 1; out.push(o); } });
    return B.mc(r, prompt, out, sol, hints, text, keep);
  }

  /* =====================================================================================================
   * Exit Slip 7.1 — Slope–intercept form and the graph of a line
   * ===================================================================================================== */
  HW.defineExit({
    lesson: 'u7l1', calc: true, outcome: 'RF6',
    blurb: 'Read m and b from an equation that needs reordering, graph a line from y = mx + b, find the intercepts algebraically, and use the intercept triangle.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF6', level: 'BEG', make: function (r) {
          var q = r.pick([2, 3, 4, 5]), p = until(function () { return r.int(1, 7); }, function (p) { return gcd(p, q) === 1 && p !== q; }), s = r.pick([1, -1]), c = nz(r, -9, 9), rev = r.chance(0.5);
          var m = [s * p, q], fx = '\\frac{' + (p === 1 ? '' : p) + 'x}{' + q + '}';
          var eq = rev ? 'y=' + c + (s < 0 ? '-' : '+') + fx : 'y=' + (s < 0 ? '-' : '') + fx + (c < 0 ? '-' : '+') + Math.abs(c);
          var wrongNum = p === 1 ? s * q : s * p;
          return mbPart('State the slope and the ' + t('y') + '-intercept of the line ' + t(eq) + '.', m, c, {
            mDiag: [[wrongNum, 'u7x-frac-x', t(fx) + ' means ' + t('\\frac{' + p + '}{' + q + '}x') + ': the slope is the whole coefficient of ' + t('x') + ', ' + t(nT(m)) + '.']],
            bDiag: [[-c, 'u7x-b-sign', 'Keep the sign in front of the constant: ' + t('b=' + c) + '.']],
            bad: [[nT(wrongNum), String(c)], [nT(m), String(-c)]] },
            t(fx) + ' is the same as ' + t('\\frac{' + p + '}{' + q + '}x') + (rev ? ', and the order of the terms doesn’t matter' : '') + ', so the equation is ' + t(SI(m, c)) + '.<br>Slope ' + t('m=' + nT(m)) + ', ' + t('y') + '-intercept ' + t('b=' + c) + '.',
            ['Write it as ' + t('y=mx+b') + ': ' + t('\\frac{px}{q}') + ' is the same as ' + t('\\frac{p}{q}x') + '.', 'The constant term, with its sign, is ' + t('b') + '.'], 'm and b of ' + eq);
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF6', level: 'EMG', make: function (r) {
          var o = until(function () { var q = r.pick([2, 3, 4]), p = r.int(1, 3), s = r.pick([1, -1, -1]); return { m: fr(s * p, q), b: nz(r, -4, 4) }; },
            function (o) { if (o.m[1] === 1 || Math.abs(o.m[0]) === o.m[1]) return false; var s = latPts(o.m, o.b, [-6, 6], [-6, 6]); return s.length >= 2 && s[s.length - 1][0] - s[0][0] >= 2 * o.m[1]; });
          var m = o.m, b = o.b, eq = 'y=' + b + (m[0] < 0 ? '-' : '+') + '\\frac{' + Math.abs(m[0]) + '}{' + m[1] + '}x', key = keyLine(m, b);
          var P2 = Math.abs(b + m[0]) <= 6 ? [m[1], b + m[0]] : [-m[1], b - m[0]];
          return drawPart('Graph the line ' + t(eq) + '.', padI(), key, slopeWrongs(m, b), { m: fv(m), b: b, mq: m },
            'Reorder: ' + t(SI(m, b)) + '. Start at the ' + t('y') + '-intercept ' + t(ptT(0, b)) + '. The slope ' + t(nT(m)) + ' means ' + (m[0] < 0 ? 'down ' : 'up ') + t(Math.abs(m[0])) + ' for every ' + t(m[1]) + ' to the right, which gives ' + t(ptT(P2[0], P2[1])) + '. Join the points with a line (arrows at both ends).',
            ['The term on its own is ' + t('b') + ': start on the ' + t('y') + '-axis there.', 'Slope = rise ÷ run: the top number is up/down, the bottom number is to the right.'], 'graph ' + eq, [segOf(key)]);
        } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF5', level: 'PRG', make: function (r) {
          var o = until(function () { return { q: r.pick([2, 3, 4, 5]), p: r.int(2, 7), s: r.pick([1, -1]), b: nz(r, -9, 9) }; }, function (o) { return gcd(o.p, o.q) === 1 && o.p !== o.q && (o.b * o.q) % o.p !== 0; });
          var m = [o.s * o.p, o.q], b = o.b, x0 = fr(-b * o.q, o.s * o.p), eq = SI(m, b), bm = fMul([b, 1], m);
          var xd = [[fNeg(x0), 'u7x-xint-sign', 'Check the sign. Set ' + t('y=0') + ': ' + t('0=' + lin([[m, 'x'], [b, '']])) + '. Move the constant across (its sign changes), then divide by ' + t(nT(m)) + '.'],
            [b, 'u7x-xint-yint', 'That’s the ' + t('y') + '-intercept. For the ' + t('x') + '-intercept, set ' + t('y=0') + ' and solve for ' + t('x') + '.'],
            [fNeg(bm), 'u7x-xint-recip', 'To undo “multiply by ' + t(nT(m)) + '”, multiply by its <b>reciprocal</b> ' + t(nT(fInv(m))) + ' (or divide by ' + t(nT(m)) + ').'], [bm, 'u7x-xint-recip', 'To undo “multiply by ' + t(nT(m)) + '”, divide by it (multiply by its reciprocal).'],
            [fInv(x0), 'u7x-xint-flip', 'You divided the wrong way round: divide the constant by the slope, not the slope by the constant.'], [fNeg(fInv(x0)), 'u7x-xint-flip', 'You divided the wrong way round: divide the constant by the slope.']];
          var p = B.fields('For the line ' + t(eq) + ', state the ' + t('y') + '-intercept and determine the ' + t('x') + '-intercept algebraically. Give exact values (a fraction is fine).',
            [{ label: t('y') + '-intercept', name: t('y') + '-intercept', mode: 'math', keys: 'fraction' }, { label: t('x') + '-intercept', name: t('x') + '-intercept', mode: 'math', keys: 'fraction' }],
            [valC(b, [[x0, 'u7x-icpt-swap', 'That’s the ' + t('x') + '-intercept. The ' + t('y') + '-intercept is ' + t('b') + ' (set ' + t('x=0') + ').']], { axis: 'y' }), valC(x0, xd, { axis: 'x' })],
            [String(b), nT(x0)], t('y') + '-intercept ' + t(b) + ', &nbsp;' + t('x') + '-intercept ' + t(nT(x0)),
            t('y') + '-intercept: set ' + t('x=0') + ' → ' + t('y=' + b) + '.<br>' + t('x') + '-intercept: set ' + t('y=0') + ':<br>' + t('0=' + lin([[m, 'x'], [b, '']])) + '<br>' + t(term(m, 'x', true) + '=' + (-b)) + '<br>' + t('x=' + (-b) + '\\times ' + pT(fInv(m)) + '=' + nT(x0)) + (x0[1] > 1 ? ' ' + t('(=' + nT(fv(x0)) + ')') : '') + '.',
            ['The ' + t('y') + '-intercept is ' + t('b') + '. For the ' + t('x') + '-intercept, replace ' + t('y') + ' with ' + t('0') + ' and solve.', 'Undo the constant first, then multiply by the reciprocal of the slope.'], 'intercepts of ' + eq);
          p.bad = [[nT(x0), String(b)], [String(b), nT(fNeg(x0))], [String(b), nT(fNeg(bm))]];
          return p;
        } }] },
      { num: '4', stem: '', parts: [
        { id: '4', outcome: 'RF5', level: 'ADV', make: function (r) {
          var o = until(function () { return { k: r.int(1, 6), b: r.int(2, 14) }; }, function (o) { var A = o.b * o.b / (2 * o.k); return (o.b * o.b) % o.k === 0 && A >= 4 && A <= 98; });
          var k = o.k, b = o.b, A = b * b / (2 * k), kx = (k === 1 ? '' : k) + 'x';
          var half = Math.sqrt(A * k), legs = Math.sqrt(2 * A);
          var list = [[half, 'u7x-tri-half', 'The area of a triangle is ' + t('\\frac{1}{2}\\times\\text{base}\\times\\text{height}') + ' — check that you used the ' + t('\\frac{1}{2}') + '.', 0.006],
            [legs, 'u7x-tri-slope', 'The two legs are not both ' + t('b') + ': the base is the ' + t('x') + '-intercept, ' + t('\\frac{b}{' + k + '}') + (k === 1 ? ' (here also ' + t('b') + ')' : '') + '.', 0.006],
            [b * b, 'u7x-tri-area', 'That’s ' + t('b^{2}') + '. Take the square root to find ' + t('b') + '.'], [-b, 'u7x-tri-neg', 'The question says ' + t('b>0') + '.']];
          if (k === 1) list.splice(1, 1);
          return numPart('The line ' + t('y=-' + kx + '+b') + ', where ' + t('b>0') + ', forms a triangle with the ' + t('x') + '-axis and the ' + t('y') + '-axis. The area of the triangle is ' + t(nf(A)) + ' square units. Determine the value of ' + t('b') + '.', b, list,
            'The ' + t('y') + '-intercept is ' + t('b') + '. For the ' + t('x') + '-intercept set ' + t('y=0') + ': ' + t('0=-' + kx + '+b') + ', so ' + t('x=\\frac{b}{' + k + '}') + '.<br>The legs of the right triangle are ' + t('b') + ' and ' + t('\\frac{b}{' + k + '}') + ':<br>' +
              t('\\frac{1}{2}\\left(\\frac{b}{' + k + '}\\right)(b)=' + nf(A) + '\\Rightarrow \\frac{b^{2}}{' + 2 * k + '}=' + nf(A) + '\\Rightarrow b^{2}=' + b * b + '\\Rightarrow b=' + b) + ' (positive, since ' + t('b>0') + ').',
            ['Find both intercepts in terms of ' + t('b') + ': they are the legs of a right triangle.', 'Area ' + t('=\\frac{1}{2}\\times\\text{base}\\times\\text{height}') + '. Set it equal to ' + t(nf(A)) + ' and solve for ' + t('b') + '.'], 'b from intercept-triangle area', { before: t('b=') });
        } }] }
    ]
  });

  /* =====================================================================================================
   * Exit Slip 7.2 — Building linear equations with y = mx + b
   * ===================================================================================================== */
  /* the letters for the symbolic question: [intercept line y = Px + Q, slope line R, S] */
  var LETTERS = [['p', 'q', 'r', 's'], ['a', 'c', 'k', 'n'], ['g', 'h', 'j', 'u'], ['c', 'd', 'k', 'w'], ['a', 'e', 'h', 'n'], ['u', 'v', 'w', 'z']];
  var KINDS = { R: function (e, R) { return e[R]; }, nR: function (e, R) { return -e[R]; }, iR: function (e, R) { return 1 / e[R]; }, niR: function (e, R) { return -1 / e[R]; } };
  function kindTex(k, R) { return k === 'R' ? R : k === 'nR' ? '-' + R : k === 'iR' ? '\\frac{1}{' + R + '}' : '-\\frac{1}{' + R + '}'; }
  function kindX(k, R) { return k === 'R' ? R + 'x' : k === 'nR' ? '-' + R + 'x' : k === 'iR' ? '\\frac{x}{' + R + '}' : '-\\frac{x}{' + R + '}'; }
  HW.defineExit({
    lesson: 'u7l2', calc: true, outcome: 'RF7',
    blurb: 'Write y = mx + b from a graph, from a parallel or perpendicular line and another line’s y-intercept, from a perpendicular segment, and with letters.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF7', level: 'BEG', make: function (r) {
          var o = until(function () { var q = r.pick([1, 1, 2, 3]); return { m: fr(nz(r, -3, 3), q), b: nz(r, -5, 5) }; }, function (o) {
            if (Math.abs(o.m[0]) === o.m[1] && r.chance(0.5)) return false;
            var s = latPts(o.m, o.b, [-6, 6], [-6, 6]); return s.length >= 3 && Math.abs(o.b) <= 4 && s.some(function (p) { return p[0] !== 0 && Math.abs(p[0]) <= 4 && Math.abs(p[1]) <= 4; });
          });
          var m = o.m, b = o.b, pts = latPts(m, b, [-5, 5], [-5, 5]).filter(function (p) { return p[0] !== 0; });
          var inner = pts.filter(function (p) { return Math.abs(p[0]) <= 4 && Math.abs(p[1]) <= 4; });
          var P2 = (inner.length ? inner : pts).sort(function (p, q) { return Math.abs(Math.abs(p[0]) - m[1]) - Math.abs(Math.abs(q[0]) - m[1]); })[0];
          var fig = lineFig([{ m: m, b: b }], { points: [[0, b], P2], max: 330, aria: 'a line through two marked points' });
          var W = fEq(m, [b, 1]) ? [] : [{ is: L(b, m), code: 'u7x-mb-swap', hint: 'You swapped them: the slope multiplies ' + t('x') + ', and the ' + t('y') + '-intercept is the constant term.' }];
          var p = LP('The line on the grid passes through the two marked points, which have integer coordinates. Write the equation of the line in slope–intercept form.' + fig, L(m, b), { form: 'slope-intercept', wrong: W, bad: [SI(fNeg(m), b), SI(m, -b)].concat(Math.abs(m[0]) !== m[1] ? [SI(fInv(m), b)] : []) },
            'The line crosses the ' + t('y') + '-axis at ' + t(ptT(0, b)) + ', so ' + t('b=' + b) + '.<br>From ' + t(ptT(0, b)) + ' to ' + t(ptT(P2[0], P2[1])) + ': ' + t('m=\\frac{' + (P2[1] - b) + '}{' + P2[0] + '}' + ((P2[1] - b) / P2[0] !== fv(m) || Math.abs(P2[0]) !== m[1] || P2[0] < 0 ? '=' + nT(m) : '')) + '.<br>So ' + t(SI(m, b)) + '.',
            ['Read ' + t('b') + ' where the line crosses the ' + t('y') + '-axis.', 'Slope = rise ÷ run between the two marked points (falling lines have a negative slope).'], 'equation from a graph');
          return p;
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF7', level: 'EMG', make: function (r) {
          var perp = r.chance(0.5), g = until(function () { return fr(nz(r, -6, 6), r.pick([1, 2, 3, 4, 5])); }, function (g) { return !(Math.abs(g[0]) === 1 && g[1] === 1); });
          var c = nz(r, -9, 9), A = until(function () { return nz(r, -6, 6); }, function (a) { return !fEq([a, 1], g) && !fEq([a, 1], nrec(g)); }), Bq = until(function () { return nz(r, -12, 12); }, function (x) { return x !== c && x !== A; });
          var m = perp ? nrec(g) : g, gT = 'y=' + c + (g[0] < 0 ? '-' : '+') + term([Math.abs(g[0]), g[1]], 'x', true), oT = SI(A, Bq);
          var W = (perp ? perpW(g, { b: Bq }) : parW(g, { b: Bq })).concat([{ is: L(m, c), code: 'u7x-b-wrongline', hint: 'Right slope — but your line meets the ' + t('y') + '-axis where ' + t(oT) + ' does, at ' + t(ptT(0, Bq)) + '.' },
            { is: L(perp ? nrec([A, 1]) : A, Bq), code: 'u7x-m-wrongline', hint: 'The slope comes from the line yours is ' + (perp ? 'perpendicular' : 'parallel') + ' to, ' + t(gT) + '. The other line only gives ' + t('b') + '.' }]);
          return LP('Line ' + t('\\ell') + ' is <b>' + (perp ? 'perpendicular' : 'parallel') + '</b> to the line ' + t(gT) + ' and meets the ' + t('y') + '-axis at the same point as the line ' + t(oT) + '. Write the equation of ' + t('\\ell') + ' in the form ' + t('y=mx+b') + '.', L(m, Bq), { form: 'slope-intercept', wrong: W },
            t(gT) + ' has slope ' + t(nT(g)) + ' (the coefficient of ' + t('x') + ').' + (perp ? ' The negative reciprocal is ' + t(nT(m)) + '.' : ' Parallel lines have equal slopes: ' + t('m=' + nT(m)) + '.') + '<br>' + t(oT) + ' meets the ' + t('y') + '-axis at ' + t(ptT(0, Bq)) + ', so ' + t('b=' + Bq) + '.<br>' + t('\\ell:\\ ' + SI(m, Bq)) + '.',
            [perp ? 'Perpendicular slopes are negative reciprocals: flip the slope and change its sign.' : 'Parallel lines have equal slopes.', 'The ' + t('y') + '-intercept is the constant term of ' + t(oT) + '.'], (perp ? 'perp' : 'parallel') + ' to slope ' + nT(g) + ', b = ' + Bq);
        } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF7', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), a = until(function () { return r.pick([1, 2, 3]); }, function (a) { return gcd(a, k) === 1; }), s = r.pick([-1, -1, 1]), u = r.pick([1, 2]);
          var x1 = r.int(-4, 3), y1 = nz(r, -8, 6), x2 = x1 + k * u, y2 = y1 + s * a * u, g = fr(s * a, k), m = nrec(g), b = nz(r, -9, 9);
          var bAB = fSub([y1, 1], fMul(g, [x1, 1]));
          var W = perpW(g, { b: b }).concat([{ is: L(g, bAB), code: 'u7x-given-line', hint: 'That’s the line through ' + t('A') + ' and ' + t('B') + '. Your line is perpendicular to it and crosses the ' + t('y') + '-axis at ' + t(ptT(0, b)) + '.' }]);
          return LP('Line ' + t('\\ell') + ' has a ' + t('y') + '-intercept of ' + t(b) + ' and is perpendicular to the line segment joining ' + t('A' + ptT(x1, y1)) + ' and ' + t('B' + ptT(x2, y2)) + '. Write the equation of ' + t('\\ell') + ' in slope–intercept form.', L(m, b), { form: 'slope-intercept', wrong: W },
            'Slope of ' + t('AB') + ': ' + t('\\frac{' + y2 + '-' + pT(y1) + '}{' + x2 + '-' + pT(x1) + '}=\\frac{' + (y2 - y1) + '}{' + (x2 - x1) + '}' + ((y2 - y1) === g[0] && (x2 - x1) === g[1] ? '' : '=' + nT(g))) + '.<br>The perpendicular slope is the negative reciprocal, ' + t('m=' + nT(m)) + ', and ' + t('b=' + b) + ':<br>' + t('\\ell:\\ ' + SI(m, b)) + '.<br><b>Check.</b> ' + t(pT(g) + '\\times ' + pT(m) + '=-1') + ' ✓',
            ['Find the slope of ' + t('AB') + ' first: ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + ', reduced.', 'Then flip it and change its sign.'], 'perp to segment, b = ' + b);
        } }] },
      { num: '4', stem: '', parts: [
        { id: '4', outcome: 'RF7', level: 'ADV', make: function (r) {
          var Ls = r.pick(LETTERS), P = Ls[0], Q = Ls[1], R = Ls[2], S = Ls[3], fm = r.int(0, 2), first = r.chance(0.5);
          var MAP = [{ g: 'R', perp: 'niR', nosign: 'iR', noflip: 'nR' }, { g: 'iR', perp: 'nR', nosign: 'R', noflip: 'niR' }, { g: 'nR', perp: 'iR', nosign: 'niR', noflip: 'R' }][fm];
          var slopeLine = fm === 2 ? 'y=' + S + '-' + R + 'x' : 'y=' + kindX(MAP.g, R) + '+' + S, interLine = 'y=' + P + 'x+' + Q;
          var coefK = function (kind, bl) { return function (e) { return [-KINDS[kind](e, R), 1, -e[bl]]; }; };
          var diags = [{ coef: coefK(MAP.g, Q), code: 'u7x-perp-same', hint: 'That line has the same slope as ' + t(slopeLine) + ', so it is <b>parallel</b> to it. You need the negative reciprocal.' },
            { coef: coefK(MAP.nosign, Q), code: 'u7x-perp-nosign', hint: 'You flipped the slope but kept its sign. The perpendicular slope is the <b>negative</b> reciprocal.' },
            { coef: coefK(MAP.noflip, Q), code: 'u7x-perp-noflip', hint: 'You changed the sign but didn’t flip: the perpendicular slope is the negative <b>reciprocal</b>.' },
            { coef: coefK(MAP.perp, S), code: 'u7x-b-wrongline', hint: 'Right slope — but ' + t('b') + ' comes from ' + t(interLine) + ', whose ' + t('y') + '-intercept is ' + t(Q) + '.' },
            { coef: coefK(MAP.perp, P), code: 'u7x-b-wrongline', hint: 'Right slope — but in ' + t(interLine) + ' the ' + t('y') + '-intercept is the constant ' + t(Q) + ', not the slope ' + t(P) + '.' },
            { coef: function (e) { return [1 / e[P], 1, -e[Q]]; }, code: 'u7x-m-wrongline', hint: 'You used the slope of ' + t(interLine) + '. That line only gives ' + t('b') + '; the slope comes from the line yours is perpendicular to.' }];
          var keyTex = 'y=' + kindX(MAP.perp, R) + '+' + Q;
          var p = B.math('Write the equation of the line that ' + (first ? 'is perpendicular to ' + t(slopeLine) + ' and has the same ' + t('y') + '-intercept as ' + t(interLine) : 'has the same ' + t('y') + '-intercept as ' + t(interLine) + ' and is perpendicular to ' + t(slopeLine)) + '. <span class="muted">(Use the letters on the keypad; assume ' + t(R + '\\ne 0') + '.)</span>',
            symChk(coefK(MAP.perp, Q), Ls, diags), keyTex,
            t(interLine) + ' has ' + t('y') + '-intercept ' + t('b=' + Q) + '. ' + t(slopeLine) + ' has slope ' + t(kindTex(MAP.g, R)) + ', so the perpendicular slope is its negative reciprocal, ' + t('m=' + kindTex(MAP.perp, R)) + '.<br>' + t(keyTex) + '.<br><b>Check.</b> ' + t('\\left(' + kindTex(MAP.g, R) + '\\right)\\times\\left(' + kindTex(MAP.perp, R) + '\\right)=-1') + ' ✓',
            ['Do it exactly as with numbers: ' + t('b') + ' is the constant term of ' + t(interLine) + '.', 'Find the slope of ' + t(slopeLine) + ' (the coefficient of ' + t('x') + '), then flip it and change its sign.'], 'symbolic perp line', { keys: 'eq', vars: ['x', 'y'].concat(Ls), placeholder: 'e.g. y = 2x + 1' });
          p.bad = ['y=' + kindX(MAP.g, R) + '+' + Q, 'y=' + kindX(MAP.nosign, R) + '+' + Q, 'y=' + kindX(MAP.noflip, R) + '+' + Q, 'y=' + kindX(MAP.perp, R) + '+' + S];
          return p;
        } }] }
    ]
  });

  /* =====================================================================================================
   * Exit Slip 7.3 — The general form of a linear equation
   * ===================================================================================================== */
  HW.defineExit({
    lesson: 'u7l3', calc: true, outcome: 'RF6',
    blurb: 'Convert y = mx + b to general form (with and without fractions), read m and b from Ax + By + C = 0, and write a parallel or perpendicular line with another line’s y-intercept.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF6', level: 'BEG', make: function (r) {
          var a = r.int(2, 9), c = nz(r, -12, 12), v = r.int(0, 2), s = v === 2 ? 1 : -1;
          var eq = v === 0 ? 'y=' + c + '-' + a + 'x' : 'y=' + (s < 0 ? '-' : '') + a + 'x' + (c < 0 ? '-' : '+') + Math.abs(c);
          var T = L(s * a, c);
          return LP('Write ' + t(eq) + ' in general form, ' + t('Ax+By+C=0') + ', where ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' are integers with no common factor and ' + t('A\\ge 0') + '.', T, { form: 'general', bad: [GEN(L(-s * a, c)), GEN(L(s * a, -c))] },
            'Move every term to one side so the other side is ' + t('0') + (s < 0 ? ' (add ' + t(a + 'x') + ' to both sides and subtract ' + t(pT(c)) + ')' : ' (subtract ' + t('y') + ' from both sides, so the ' + t('x') + '-term stays positive)') + ':<br>' + t(GEN(T)) + '.',
            ['Get everything on one side with ' + t('0') + ' on the other: ' + t('Ax+By+C=0') + '.', 'Keep the ' + t('x') + '-term positive; a term changes sign when it moves across the equals sign.'], 'general form of ' + eq);
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF6', level: 'EMG', make: function (r) {
          var b0 = r.pick([2, 3, 4, 5, 6]), Bc = b0 * r.pick([1, -1]), a = until(function () { return r.int(1, 9); }, function (a) { return gcd(a, b0) === 1 && a % b0 !== 0; }), k = nz(r, -6, 6), C = -Bc * k;
          var eq = lin([[a, 'x'], [Bc, 'y'], [C, '']]) + '=0', m = fr(-a, Bc);
          return mbPart('Determine the slope and the ' + t('y') + '-intercept of the line ' + t(eq) + '.', m, k, {
            mDiag: [[-a, 'u7x-not-divided', 'Solve for ' + t('y') + ' completely: after moving the other terms, divide <b>every</b> term by ' + t(Bc) + '.'], [a, 'u7x-not-divided', 'Get ' + t('y') + ' by itself: move the other terms across, then divide every term by ' + t(Bc) + '.']],
            bDiag: [[-C, 'u7x-not-divided', 'Divide the constant by ' + t(Bc) + ' too.'], [C, 'u7x-not-divided', 'Move the constant across and divide it by ' + t(Bc) + '.']],
            bad: [[nT(-a), String(k)], [nT(m), String(-C)]] },
            'Solve for ' + t('y') + ': ' + t(term(Bc, 'y', true) + '=' + lin([[-a, 'x'], [-C, '']])) + ', so ' + t('y=' + lin([[m, 'x'], [k, '']])) + '.<br>Slope ' + t('m=' + nT(m)) + ', ' + t('y') + '-intercept ' + t('b=' + k) + '.<br>(Shortcut: ' + t('m=-\\frac{A}{B}') + ', ' + t('b=-\\frac{C}{B}') + '.)',
            ['Rearrange into ' + t('y=mx+b') + ': keep the ' + t('y') + '-term on one side, then divide every term by its coefficient.', 'Or use ' + t('m=-\\frac{A}{B}') + ' and ' + t('b=-\\frac{C}{B}') + '.'], 'm and b of ' + eq);
        } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF6', level: 'PRG', make: function (r) {
          var o = until(function () { var q = r.pick([2, 3, 4, 5, 6]), s = r.pick([2, 3, 4, 6, 8, 9, 10]); return { q: q, s: s, p: r.int(1, 7) * r.pick([1, -1]), c: r.int(1, 9) * r.pick([1, -1]) }; },
            function (o) { var Lc = o.q * o.s / gcd(o.q, o.s); return o.q !== o.s && gcd(o.p, o.q) === 1 && gcd(o.c, o.s) === 1 && Lc <= 30 && Math.abs(o.p) !== o.q; });
          var m = [o.p, o.q], b = [o.c, o.s], T = L(m, b), eq = SI(m, b), Lc = o.q * o.s / gcd(o.q, o.s);
          var nm = { A: o.p * Lc / o.q, B: -Lc, C: o.c };
          var bad = [GEN(L(m, fNeg(b))), GEN(L(fNeg(m), b))].concat(Ln.same(Ln.of(nm), Ln.of(T)) ? [] : [Ln.tex(nm, 'general')]);
          return LP('Write ' + t(eq) + ' in general form, ' + t('Ax+By+C=0') + ', where ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' are integers with no common factor and ' + t('A\\ge 0') + '.', T,
            { form: 'general', wrong: [{ is: nm, code: 'u7x-gf-nomult', hint: 'Multiply <b>every</b> term by the common denominator ' + t(Lc) + ' — including the constant ' + t(nT(b)) + '.' }], bad: bad },
            'The common denominator of ' + t(o.q) + ' and ' + t(o.s) + ' is ' + t(Lc) + '. Multiply every term by ' + t(Lc) + ':<br>' + t(Lc + 'y=' + lin([[o.p * Lc / o.q, 'x'], [o.c * Lc / o.s, '']])) + '<br>Move every term to one side (keep the ' + t('x') + '-term positive):<br>' + t(GEN(T)) + '.',
            ['Clear the fractions first: multiply every term by the lowest common denominator.', 'Then move every term to one side so the other side is ' + t('0') + '.'], 'general form of ' + eq);
        } }] },
      { num: '4', stem: '', parts: [
        { id: '4', outcome: 'RF7', level: 'ADV', make: function (r) {
          /* parallel/perpendicular to one line, with the y-intercept of another (Example 4 and Assignment 4–5 of the
           * lesson): the second line is in general form or in the form Ax + By = D, and its y-intercept may be a fraction */
          var o = until(function () {
            return { a1: r.int(1, 6), b1: r.int(2, 6) * r.pick([1, -1]), c1: nz(r, -12, 12), a2: nz(r, -6, 6), b2: r.int(2, 6) * r.pick([1, -1]), c2: nz(r, -24, 24), perp: r.chance(0.5), std: r.chance(0.5) };
          }, function (o) {
            var b = fr(-o.c2, o.b2), b1 = fr(-o.c1, o.b1), xi = fr(-o.c2, o.a2);
            return gcd(o.a1, o.b1) === 1 && o.a1 !== Math.abs(o.b1) && gcd(gcd(o.a2, o.b2), o.c2) === 1 && Math.abs(o.a2) !== Math.abs(o.b2) && !fEq(b, b1) && !fEq(b, xi) && !fEq(b, fNeg(b1)) && !fEq(fr(-o.a2, o.b2), fr(-o.a1, o.b1));
          });
          var g = fr(-o.a1, o.b1), m = o.perp ? nrec(g) : g, b = fr(-o.c2, o.b2), T = L(m, b);
          var L1 = Ln.tex({ A: o.a1, B: o.b1, C: o.c1 }, 'general'), L2 = o.std ? lin([[o.a2, 'x'], [o.b2, 'y']]) + '=' + (-o.c2) : lin([[o.a2, 'x'], [o.b2, 'y'], [o.c2, '']]) + '=0';
          var W = (o.perp ? perpW(g, { b: b }) : parW(g, { b: b })).concat([
            { is: L(m, fr(-o.c1, o.b1)), code: 'u7x-b-wrongline', hint: 'Right slope — but the ' + t('y') + '-intercept comes from ' + t(L2) + ', not from ' + t(L1) + '.' },
            { is: L(m, fr(-o.c2, o.a2)), code: 'u7x-k-xint', hint: 'You used the <b>' + t('x') + '</b>-intercept of ' + t(L2) + '. For the ' + t('y') + '-intercept set ' + t('x=0') + ' and solve for ' + t('y') + '.' },
            { is: L(m, fNeg(b)), code: 'u7x-b-sign', hint: 'Check the sign of the ' + t('y') + '-intercept: set ' + t('x=0') + ' in ' + t(L2) + ' and solve carefully.' }]);
          if (!o.perp) W.push({ is: { A: o.a1, B: o.b1, C: o.c1 }, code: 'u7x-given-line', hint: 'That’s the first line itself. Keep its slope, but your line must cross the ' + t('y') + '-axis where ' + t(L2) + ' does.' });
          var yStep = o.std ? t(term(o.b2, 'y', true) + '=' + (-o.c2)) : t(term(o.b2, 'y', true) + (o.c2 < 0 ? '-' : '+') + Math.abs(o.c2) + '=0');
          return LP('Write the equation of the line that is <b>' + (o.perp ? 'perpendicular' : 'parallel') + '</b> to ' + t(L1) + ' and has the same ' + t('y') + '-intercept as ' + t(L2) + '. Give it in general form, ' + t('Ax+By+C=0') + ' (integers with no common factor, ' + t('A\\ge 0') + ').', T, { form: 'general', wrong: W },
            'Slope of ' + t(L1) + ': ' + t('m=-\\frac{A}{B}=' + nT(g)) + (o.perp ? '; the perpendicular slope is its negative reciprocal, ' + t(nT(m)) : '; a parallel line has the same slope') + '.<br>' +
              t('y') + '-intercept of ' + t(L2) + ': set ' + t('x=0') + ': ' + yStep + ' ' + t('\\Rightarrow y=' + nT(b)) + '.<br>So ' + t(SI(m, b)) + '.<br>' + 'General form' + (m[1] > 1 || b[1] > 1 ? ' (multiply every term by the common denominator, then move every term to one side)' : '') + ': ' + t(GEN(T)) + '.',
            ['Find the slope from ' + t('m=-\\frac{A}{B}') + ' (then flip and change the sign if the line is perpendicular).', 'Set ' + t('x=0') + ' in the second equation to find ' + t('b') + '; write ' + t('y=mx+b') + ', then rearrange to general form.'], (o.perp ? 'perp' : 'par') + ' with y-intercept of a second line');
        } }] }
    ]
  });

  /* =====================================================================================================
   * Exit Slip 7.4 — Slope–point form
   * ===================================================================================================== */
  var BUY = [{ who: 'A gift card', a: 'sweaters', b: 'T-shirts' }, { who: 'A club’s pizza budget', a: 'large pizzas', b: 'garlic breads' }, { who: 'The art room’s budget', a: 'easels', b: 'paint kits' },
    { who: 'A gardener’s budget', a: 'rose bushes', b: 'packs of tulip bulbs' }, { who: 'A team’s equipment fund', a: 'helmets', b: 'jerseys' }];
  HW.defineExit({
    lesson: 'u7l4', calc: true, outcome: 'RF7',
    blurb: 'Write slope–point form from a point and a slope, read the slope and point back from an equation, find a line through two points in general form, and model a fixed-budget situation.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF7', level: 'BEG', make: function (r) {
          var m = r.int(2, 9) * r.pick([1, -1]), P = until(function () { return [nz(r, -9, 9), nz(r, -9, 9)]; }, function (p) { return Math.abs(p[0]) !== Math.abs(p[1]); });
          var T = { m: [m, 1], point: P };
          var W = [{ is: { m: [m, 1], point: [-P[0], -P[1]] }, code: 'u7x-sp-signs', hint: 'In ' + t('y-y_1=m(x-x_1)') + ' you <b>subtract</b> the coordinates: a negative coordinate becomes a plus sign in the brackets.' },
            { is: { m: [m, 1], point: [P[1], P[0]] }, code: 'u7x-sp-swap', hint: 'The ' + t('y') + '-coordinate goes with ' + t('y') + ' and the ' + t('x') + '-coordinate with ' + t('x') + ': ' + t('y-y_1=m(x-x_1)') + '.' }];
          return LP('A line has slope ' + t(m) + ' and passes through the point ' + t(ptT(P[0], P[1])) + '. Write its equation in slope–point form, ' + t('y-y_1=m(x-x_1)') + '.', T,
            { form: 'point-slope', point: P, wrong: W, bad: [PS(-m, P)] },
            'Substitute ' + t('m=' + m) + ', ' + t('x_1=' + P[0]) + ' and ' + t('y_1=' + P[1]) + ' into ' + t('y-y_1=m(x-x_1)') + ':<br>' + t('y-' + pT(P[1]) + '=' + m + '\\left(x-' + pT(P[0]) + '\\right)') + ', which is ' + t(PS(m, P)) + '.',
            ['Slope–point form is ' + t('y-y_1=m(x-x_1)') + ': the point’s coordinates are <b>subtracted</b>.', 'Subtracting a negative number is the same as adding it.'], 'slope-point form');
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF6', level: 'EMG', make: function (r) {
          var v = r.int(0, 3), m = r.chance(0.5) ? fr(r.int(2, 9) * r.pick([1, -1]), 1) : until(function () { var q = r.int(2, 9); return fr(r.int(1, 8) * r.pick([1, -1]), q); }, function (f) { return f[1] > 1; });
          var k = nz(r, -9, 9), P = v < 2 ? [0, k] : [k, 0];
          var mT = m[1] === 1 ? (m[0] === 1 ? '' : m[0] === -1 ? '-' : String(m[0])) : nT(m);
          var eq = v < 2 ? 'y' + (k < 0 ? '+' : '-') + Math.abs(k) + '=' + mT + 'x' : 'y=' + (mT === '' ? '' : mT) + '\\left(x' + (k < 0 ? '+' : '-') + Math.abs(k) + '\\right)';
          var pC = K.point(P, { wrong: [{ is: [-P[0], -P[1]], code: 'u7x-sp-pt-sign', hint: 'In ' + t('y-y_1=m(x-x_1)') + ' the coordinates are subtracted, so read their signs as the opposite of what appears in the equation.' }] });
          var p = B.fields('The equation ' + t(eq) + ' is in slope–point form. State the slope of the line and the point that was used to write the equation.',
            [{ label: 'Slope', name: 'Slope', before: t('m='), mode: 'math', keys: 'slope', placeholder: 'e.g. -2/3' }, { label: 'Point', name: 'Point', mode: 'math', keys: 'point', placeholder: '(x, y)' }],
            [slopeC(m, []), pC], [nT(m), ptK(P[0], P[1])], t('m=' + nT(m)) + ', point ' + t(ptT(P[0], P[1])),
            'Compare with ' + t('y-y_1=m(x-x_1)') + ': ' + (v < 2 ? 'the right side is ' + t(mT + 'x') + ', which is ' + t(mT + '(x-0)') + ', so ' + t('x_1=0') + '; and ' + t('y' + (k < 0 ? '+' : '-') + Math.abs(k)) + ' is ' + t('y-' + pT(k)) + ', so ' + t('y_1=' + k) + '.' : 'the left side is ' + t('y') + ', which is ' + t('y-0') + ', so ' + t('y_1=0') + '; and ' + t('x' + (k < 0 ? '+' : '-') + Math.abs(k)) + ' is ' + t('x-' + pT(k)) + ', so ' + t('x_1=' + k) + '.') + '<br>Slope ' + t(nT(m)) + ', point ' + t(ptT(P[0], P[1])) + '.',
            ['Match the equation to ' + t('y-y_1=m(x-x_1)') + '. A missing number is a hidden ' + t('0') + ': ' + t('y=y-0') + ' and ' + t('x=x-0') + '.', 'The signs inside the form are minus signs, so the coordinates have the opposite signs.'], 'read m and point from ' + eq);
          p.bad = [[nT(m), ptK(-P[0], -P[1])], [nT(m), ptK(P[1], P[0])], [nT(fNeg(m)), ptK(P[0], P[1])]];
          return p;
        } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF7', level: 'PRG', make: function (r) {
          var o = until(function () { var d = r.int(2, 6), a = nz(r, -7, 7), j = r.pick([1, 1, 2]); return { d: d, a: a, j: j, x1: nz(r, -6, 4), y1: nz(r, -8, 8) }; },
            function (o) { var y2 = o.y1 + o.a * o.j; return gcd(o.a, o.d) === 1 && Math.abs(o.a) !== o.d && o.x1 + o.d * o.j <= 9 && Math.abs(y2) <= 14 && y2 !== 0 && o.x1 + o.d * o.j !== 0; });
          var x1 = o.x1, y1 = o.y1, x2 = x1 + o.d * o.j, y2 = y1 + o.a * o.j, m = fr(o.a, o.d), T = { m: m, point: [x1, y1] };
          return LP('The table shows two points on a line. Write the equation of the line in general form, ' + t('Ax+By+C=0') + ' (integers with no common factor, ' + t('A\\ge 0') + ').' + HW.valueTable([['x', x1, x2], ['y', y1, y2]]), T,
            { form: 'general', wrong: [{ is: { m: m, point: [-x1, -y1] }, code: 'u7x-sp-signs', hint: 'Right slope — but your line misses the points. In ' + t('y-y_1=m(x-x_1)') + ' the coordinates are subtracted.' }], bad: [GEN({ m: fNeg(m), point: [x1, y1] }), GEN({ m: fInv(m), point: [x1, y1] })] },
            t('m=\\frac{' + y2 + '-' + pT(y1) + '}{' + x2 + '-' + pT(x1) + '}=\\frac{' + (y2 - y1) + '}{' + (x2 - x1) + '}' + ((y2 - y1) === m[0] && (x2 - x1) === m[1] ? '' : '=' + nT(m))) + '.<br>Slope–point form with ' + t(ptT(x1, y1)) + ': ' + t(PS(m, [x1, y1])) + '.<br>' + (m[1] > 1 ? 'Multiply both sides by ' + t(m[1]) + ', expand and ' : 'Expand and ') + 'move every term to one side: ' + t(GEN(T)) + '.<br><b>Check.</b> ' + t(ptT(x2, y2)) + ' also satisfies it ✓',
            ['Find the slope from the two points, then use slope–point form with either point.', 'Clear any fraction, expand, and move every term to one side (' + t('A\\ge 0') + ').'], 'general form through 2 points');
        } }] },
      { num: '4', stem: '', parts: [
        { id: '4', outcome: 'RF7', level: 'ADV', make: function (r) {
          var c = r.pick(BUY), o = until(function () { var a = r.int(2, 7), b = r.int(2, 7), j = r.pick([1, 2]); return { a: a, b: b, j: j, x1: r.int(1, 4), y1: a * j + r.int(1, 5) }; },
            function (o) { return gcd(o.a, o.b) === 1 && o.a !== o.b && o.x1 + o.b * o.j <= 14 && o.y1 <= 16; });
          var x1 = o.x1, y1 = o.y1, x2 = x1 + o.b * o.j, y2 = y1 - o.a * o.j, M = o.a * x1 + o.b * y1, T = { A: o.a, B: o.b, C: -M }, m = fr(-o.a, o.b);
          return LP(c.who + ' buys exactly ' + t(x1) + ' ' + c.a + ' and ' + t(y1) + ' ' + c.b + ', <i>or</i> exactly ' + t(x2) + ' ' + c.a + ' and ' + t(y2) + ' ' + c.b + '. A linear relationship exists between the number of ' + c.a + ', ' + t('x') + ', and the number of ' + c.b + ', ' + t('y') + ', that can be bought. Determine the equation of this relationship in general form, ' + t('Ax+By+C=0') + ' (integers with no common factor, ' + t('A\\ge 0') + ').', T,
            { form: 'general', wrong: [{ is: { A: o.b, B: o.a, C: -M }, code: 'u7x-ctx-swap', hint: 'The number of ' + c.a + ' is ' + t('x') + ' (first coordinate) and the number of ' + c.b + ' is ' + t('y') + ': the points are ' + t(ptT(x1, y1)) + ' and ' + t(ptT(x2, y2)) + '.' }] },
            'The two purchases are the points ' + t(ptT(x1, y1)) + ' and ' + t(ptT(x2, y2)) + '.<br>' + t('m=\\frac{' + y2 + '-' + y1 + '}{' + x2 + '-' + x1 + '}=\\frac{' + (y2 - y1) + '}{' + (x2 - x1) + '}=' + nT(m)) + '.<br>' + t(PS(m, [x1, y1])) + '. Multiply by ' + t(o.b) + ': ' + t(o.b + 'y-' + o.b * y1 + '=' + (-o.a) + 'x+' + o.a * x1) + '.<br>' + t(GEN(T)) + '.',
            ['Each purchase is a point (number of ' + c.a + ', number of ' + c.b + ').', 'Find the slope, use slope–point form, then clear the fraction and move every term to one side.'], 'budget line ' + c.a);
        } }] }
    ]
  });

  /* =====================================================================================================
   * Exit Slip 7.5 — Graphing linear equations: a strategy for every form
   * ===================================================================================================== */
  HW.defineExit({
    lesson: 'u7l5', calc: true, outcome: 'RF6',
    blurb: 'Choose the graphing strategy that fits the form, then graph a line from slope–point form, from general form by its intercepts, and from general form when the intercepts are not integers.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF6', level: 'BEG', make: function (r) {
          var P = until(function () { return [nz(r, -6, 6), nz(r, -6, 6)]; }, function (p) { return Math.abs(p[0]) !== Math.abs(p[1]); });
          var m = r.chance(0.5) ? fr(r.int(2, 5) * r.pick([1, -1]), 1) : until(function () { return fr(r.int(1, 4) * r.pick([1, -1]), r.int(2, 5)); }, function (f) { return f[1] > 1; });
          var eq = PS(m, P), h = P[0], k = P[1];
          var step = function (mm) { mm = fr(mm); return (mm[0] < 0 ? 'down ' : 'up ') + t(Math.abs(mm[0])) + ' and right ' + t(mm[1]); };
          return mc(r, 'Without changing its form, which steps graph ' + t(eq) + ' correctly?', [
            { html: 'Plot the point ' + t(ptT(h, k)) + ', step ' + step(m) + ' to a second point, and join the points with a line.', right: true },
            { html: 'Plot the point ' + t(ptT(-h, -k)) + ', step ' + step(m) + ' to a second point, and join the points with a line.', why: 'The form ' + t('y-y_1=m(x-x_1)') + ' subtracts the coordinates, so the signs inside the equation are the <b>opposite</b> of the point’s coordinates: the point is ' + t(ptT(h, k)) + '.' },
            { html: 'Plot the point ' + t(ptT(h, k)) + ', step ' + step(fNeg(m)) + ' to a second point, and join the points with a line.', why: 'The slope is ' + t(nT(m)) + ' — the number in front of the bracket, with its sign. It ' + (m[0] < 0 ? 'falls' : 'rises') + ' from left to right.' },
            { html: 'Plot the ' + t('y') + '-intercept ' + t(ptT(0, k)) + ', step ' + step(m) + ' to a second point, and join the points with a line.', why: t(k) + ' is the ' + t('y') + '-coordinate of the point where ' + t('x=' + h) + ', not the ' + t('y') + '-intercept. The equation is in slope–point form: start at ' + t(ptT(h, k)) + '.' }],
            'Slope–point form ' + t('y-y_1=m(x-x_1)') + ' gives a point and the slope directly: the point ' + t(ptT(h, k)) + ' (opposite signs to those in the brackets) and the slope ' + t(nT(m)) + '. Plot the point, step ' + step(m) + ', and join.',
            ['Compare with ' + t('y-y_1=m(x-x_1)') + ': which point and which slope can you read straight off?'], 'graph strategy for ' + eq);
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF6', level: 'EMG', make: function (r) {
          var o = until(function () { return { m: r.pick([-3, -2, 2, 3]), h: nz(r, -4, 4), k: nz(r, -4, 4) }; }, function (o) { var b = o.k - o.m * o.h, s = latPts([o.m, 1], b, [-6, 6], [-6, 6]); return Math.abs(o.h) !== Math.abs(o.k) && s.length >= 3; });
          var m = [o.m, 1], P = [o.h, o.k], b = o.k - o.m * o.h, eq = PS(m, P), key = keyLine(m, b);
          var W = [{ is: lineThroughSlope([-o.h, -o.k], m), code: 'u7x-gr-pt-sign', hint: 'Check the point: ' + t('y-y_1=m(x-x_1)') + ' subtracts the coordinates, so the line passes through ' + t(ptT(o.h, o.k)) + ', not ' + t(ptT(-o.h, -o.k)) + '.' },
            { is: lineThroughSlope(P, [-o.m, 1]), code: 'u7x-gr-sign', hint: 'Right point — check the direction: the slope is ' + t(o.m) + ', so the line ' + (o.m < 0 ? 'falls' : 'rises') + ' from left to right.' },
            { is: lineThroughSlope([0, o.k], m), code: 'u7x-gr-sp-yint', hint: t(o.k) + ' is not the ' + t('y') + '-intercept: it is the ' + t('y') + '-coordinate of the point where ' + t('x=' + o.h) + '. Start at ' + t(ptT(o.h, o.k)) + '.' }];
          var P2 = Math.abs(o.k + o.m) <= 6 && Math.abs(o.h + 1) <= 6 ? [o.h + 1, o.k + o.m] : [o.h - 1, o.k - o.m];
          return drawPart('Graph the line ' + t(eq) + '.', padI(), key, W, { m: o.m, b: b, mq: m },
            'The equation is in slope–point form: it passes through ' + t(ptT(o.h, o.k)) + ' with slope ' + t(o.m) + '. Plot ' + t(ptT(o.h, o.k)) + ', step ' + (o.m < 0 ? 'down ' : 'up ') + t(Math.abs(o.m)) + ' and right ' + t('1') + ' (or the reverse) to ' + t(ptT(P2[0], P2[1])) + ', and join the points with a line.',
            ['Read the point and the slope straight from ' + t('y-y_1=m(x-x_1)') + '.', 'The coordinates have the opposite signs to the numbers in the equation.'], 'graph ' + eq, [segOf(key)]);
        } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF6', level: 'PRG', make: function (r) {
          var o = until(function () { return { x0: nz(r, -6, 6), y0: nz(r, -6, 6) }; }, function (o) { return Math.abs(o.x0) !== Math.abs(o.y0) && (Math.abs(o.x0) > 1 || Math.abs(o.y0) > 1); });
          var x0 = o.x0, y0 = o.y0, T = { A: y0, B: x0, C: -x0 * y0 }, eq = Ln.tex(T, 'general'), key = lineV([x0, 0], [0, y0]);
          var A = y0, Bc = x0, C = -x0 * y0; var gg = gcd(gcd(A, Bc), C); A /= gg; Bc /= gg; C /= gg; if (A < 0) { A = -A; Bc = -Bc; C = -C; }
          var W = [{ is: lineV([0, x0], [y0, 0]), code: 'u7x-gr-icpt-swap', hint: 'The intercepts are swapped: set ' + t('y=0') + ' to find where the line crosses the <b>' + t('x') + '</b>-axis, and ' + t('x=0') + ' for the ' + t('y') + '-axis.' },
            { is: lineV([-x0, 0], [0, y0]), code: 'u7x-gr-icpt-sign', hint: 'Check the sign of the ' + t('x') + '-intercept: set ' + t('y=0') + ' and solve ' + t(A + 'x' + (C < 0 ? '-' : '+') + Math.abs(C) + '=0') + ' carefully.' },
            { is: lineV([x0, 0], [0, -y0]), code: 'u7x-gr-icpt-sign', hint: 'Check the sign of the ' + t('y') + '-intercept: set ' + t('x=0') + ' and solve ' + t(term(Bc, 'y', true) + (C < 0 ? '-' : '+') + Math.abs(C) + '=0') + ' carefully.' }];
          if (Math.abs(A) !== Math.abs(Bc) && Math.abs(A) <= 12 && Math.abs(Bc) <= 12 && !(A === x0 && Bc === y0)) W.push({ is: lineV([A, 0], [0, Bc]), code: 'u7x-gr-coef', hint: 'The coefficients ' + t('A') + ' and ' + t('B') + ' are not the intercepts. Set ' + t('y=0') + ' and solve for ' + t('x') + ', then set ' + t('x=0') + ' and solve for ' + t('y') + '.' });
          return drawPart('Graph the line ' + t(eq) + '.', padI(), key, W, { m: -y0 / x0, b: y0, mq: fr(-y0, x0) },
            'The equation is in general form, so use the intercepts.<br>' + t('y=0') + ': ' + t(A + 'x' + (C < 0 ? '-' : '+') + Math.abs(C) + '=0\\Rightarrow x=' + x0) + ', the point ' + t(ptT(x0, 0)) + '.<br>' + t('x=0') + ': ' + t(term(Bc, 'y', true) + (C < 0 ? '-' : '+') + Math.abs(C) + '=0\\Rightarrow y=' + y0) + ', the point ' + t(ptT(0, y0)) + '.<br>Plot both intercepts and join them with a line.',
            ['In general form, the intercepts are quickest: set ' + t('y=0') + ', then ' + t('x=0') + '.', 'Plot the two intercepts and join them.'], 'graph ' + eq + ' by intercepts', [segOf(key)]);
        } }] },
      { num: '4', stem: '', parts: [
        { id: '4', outcome: 'RF6', level: 'ADV', make: function (r) {
          var o = until(function () { var A = r.int(2, 5), Bc = r.int(2, 5) * r.pick([1, -1]), P = [r.int(-3, 3), r.int(-3, 3)]; return { A: A, B: Bc, C: -(A * P[0] + Bc * P[1]), P: P }; },
            function (o) { if (gcd(o.A, o.B) !== 1 || o.C === 0 || o.C % o.B === 0 || o.C % o.A === 0 || gcd(gcd(o.A, o.B), o.C) !== 1) return false; var s = latPts(fr(-o.A, o.B), fr(-o.C, o.B), [-6, 6], [-6, 6]); return s.length >= 2 && s[s.length - 1][0] - s[0][0] >= Math.abs(o.B); });
          var m = fr(-o.A, o.B), b = fr(-o.C, o.B), T = { A: o.A, B: o.B, C: o.C }, eq = Ln.tex(T, 'general'), pts = latPts(m, b, [-6, 6], [-6, 6]), key = lineV(pts[0], pts[pts.length - 1]);
          var P = o.P, x0 = fr(-o.C, o.A);
          var W = [{ is: lineThroughSlope(P, fNeg(m)), code: 'u7x-gr-sign', hint: 'Check the direction: the slope is ' + t('-\\frac{A}{B}=' + nT(m)) + ', so the line ' + (fv(m) < 0 ? 'falls' : 'rises') + ' from left to right.' },
            { is: lineThroughSlope(P, fr(m[0] > 0 ? m[1] : -m[1], Math.abs(m[0]))), code: 'u7x-gr-flip', hint: 'Rise and run are swapped: the slope is ' + t(nT(m)) + '.' },
            { is: lineV([Math.round(fv(x0)), 0], [0, Math.round(fv(b))]), code: 'u7x-gr-icpt', hint: 'The intercepts here are not integers (' + t('x=' + nT(x0)) + ' and ' + t('y=' + nT(b)) + '), so rounding them moves the line. Find two points with integer coordinates instead.' }];
          var q1 = pts[0], q2 = pts[Math.min(pts.length - 1, 1)];
          return drawPart('Graph the line ' + t(eq) + '. (Its intercepts are not integers.)', padI(), key, W, { m: fv(m), b: fv(b), mq: m },
            'The intercepts are ' + t('x=' + nT(x0)) + ' and ' + t('y=' + nT(b)) + ' — hard to plot. Find points with integer coordinates instead: try ' + t('x') + '-values and solve for ' + t('y') + '.<br>' + t('x=' + q1[0]) + ': ' + t(o.A * q1[0] + (o.B < 0 ? '-' : '+') + Math.abs(o.B) + 'y' + (o.C < 0 ? '-' : '+') + Math.abs(o.C) + '=0\\Rightarrow y=' + q1[1]) + '; &nbsp;' + t('x=' + q2[0]) + ': ' + t('y=' + q2[1]) + '.<br>Plot ' + t(ptT(q1[0], q1[1])) + ' and ' + t(ptT(q2[0], q2[1])) + ' (or use the slope ' + t(nT(m)) + ' from one of them) and join them.',
            ['When the intercepts are fractions, look for points with integer coordinates: substitute small ' + t('x') + '-values and see which give an integer ' + t('y') + '.', 'From one such point, the slope ' + t('-\\frac{A}{B}') + ' leads to the next.'], 'graph ' + eq + ' (fraction intercepts)', [segOf(key)]);
        } }] }
    ]
  });

  /* =====================================================================================================
   * Exit Slip 7.6 — Slope in context: rates of change
   * ===================================================================================================== */
  var RATE_CTX = [
    { s: 1, txt: 'A pool is filled at a constant rate. After {t1} h the water is {v1} cm deep; after {t2} h it is {v2} cm deep.', what: 'the water depth', unit: 'cm/h', r: [3, 9], v0: [10, 40] },
    { s: -1, txt: 'A candle burns down at a constant rate. After {t1} h it is {v1} cm tall; after {t2} h it is {v2} cm tall.', what: 'the candle’s height', unit: 'cm/h', r: [2, 4], v0: [24, 40] },
    { s: 1, txt: 'Theo saves the same amount every week. After {t1} weeks his account holds ${v1}; after {t2} weeks it holds ${v2}.', what: 'the amount in his account', unit: '$ per week', r: [5, 40], v0: [20, 200], step: 5 },
    { s: -1, txt: 'During a road trip, a car’s fuel tank empties at a constant rate. After {t1} h of driving it holds {v1} L; after {t2} h it holds {v2} L.', what: 'the fuel in the tank', unit: 'L/h', r: [4, 9], v0: [52, 70] },
    { s: 1, txt: 'A seedling grows at a constant rate. After {t1} weeks it is {v1} mm tall; after {t2} weeks it is {v2} mm tall.', what: 'the seedling’s height', unit: 'mm per week', r: [4, 12], v0: [5, 30] }];
  function fill(s, o) { return s.replace(/\{(\w+)\}/g, function (m0, k) { return '\\(' + F(o[k]) + '\\)'; }).replace(/\$\\\(/g, '\\(\\$'); }
  var EQ_CTX = [
    { eq: function (a, k) { return 'V=' + a + '-' + k + 't'; }, setup: 'The volume of water, ' + t('V') + ' litres, left in a draining tank after ' + t('t') + ' minutes is modelled by', a: [300, 900, 50], k: [5, 25], neg: true, coefTxt: function (k) { return t('-' + k); },
      right: function (k) { return 'Water drains out of the tank at ' + t(k) + ' L per minute: ' + t('V') + ' goes down by ' + t(k) + ' L every minute.'; },
      wrongs: function (a, k) { return [{ html: 'The tank held ' + t(k) + ' L of water when it started draining.', why: 'The starting volume is the value at ' + t('t=0') + ', which is ' + t(F(a)) + ' L. The number multiplying ' + t('t') + ' is a rate.' }, { html: 'The tank is empty after ' + t(k) + ' minutes.', why: 'Empty means ' + t('V=0') + ': that is ' + t(F(a) + '\\div ' + k) + ' minutes. The slope is how fast the volume changes.' }, { html: 'Water is added to the tank at ' + t(k) + ' L per minute.', why: 'The slope is <b>negative</b>, so the volume is going down, not up.' }]; } },
    { eq: function (a, k) { return 'C=' + k + 'd+' + a; }, setup: 'The cost ' + t('C') + ', in dollars, of a taxi ride of ' + t('d') + ' kilometres is', a: [3, 6, 1], k: [2, 4], coefTxt: function (k) { return t(k); },
      right: function (k) { return 'Each kilometre driven adds ' + t('\\$' + k) + ' to the fare.'; },
      wrongs: function (a, k) { return [{ html: 'Every ride starts with a fixed charge of ' + t('\\$' + k) + '.', why: 'The fixed charge is the value at ' + t('d=0') + ': ' + t('\\$' + a) + '. The coefficient of ' + t('d') + ' is the cost per kilometre.' }, { html: 'The fare goes down by ' + t('\\$' + k) + ' for every kilometre driven.', why: 'The slope is positive, so the cost goes <b>up</b> as the distance increases.' }, { html: 'A ride of ' + t(k) + ' km costs ' + t('\\$' + a) + '.', why: 'Substitute ' + t('d=' + k) + ': that ride costs ' + t('\\$' + (k * k + a)) + '. The slope is the change in cost per kilometre.' }]; } },
    { eq: function (a, k) { return 'h=' + k + 'w+' + a; }, setup: 'The height ' + t('h') + ', in centimetres, of a sunflower ' + t('w') + ' weeks after it was measured first is', a: [8, 30, 1], k: [3, 9], coefTxt: function (k) { return t(k); },
      right: function (k) { return 'The sunflower grows ' + t(k) + ' cm every week.'; },
      wrongs: function (a, k) { return [{ html: 'The sunflower was ' + t(k) + ' cm tall when it was first measured.', why: 'Its first height is the value at ' + t('w=0') + ': ' + t(a) + ' cm. The coefficient of ' + t('w') + ' is the growth per week.' }, { html: 'The sunflower takes ' + t(k) + ' weeks to grow ' + t(a) + ' cm.', why: 'The slope is a rate: centimetres per week. It says how much the height changes in one week.' }, { html: 'The sunflower gets ' + t(k) + ' cm shorter every week.', why: 'The slope is positive, so the height goes <b>up</b>.' }]; } },
    { eq: function (a, k) { return 'A=' + a + '-' + k + 't'; }, setup: 'A hot-air balloon descends at a constant rate. Its altitude ' + t('A') + ', in metres, ' + t('t') + ' minutes after it starts to descend is', a: [600, 1500, 100], k: [15, 40], neg: true, coefTxt: function (k) { return t('-' + k); },
      right: function (k) { return 'The balloon loses ' + t(k) + ' m of altitude every minute.'; },
      wrongs: function (a, k) { return [{ html: 'The balloon started its descent at an altitude of ' + t(k) + ' m.', why: 'The starting altitude is the value at ' + t('t=0') + ': ' + t(F(a)) + ' m. The coefficient of ' + t('t') + ' is a rate.' }, { html: 'The balloon reaches the ground after ' + t(k) + ' minutes.', why: 'Reaching the ground means ' + t('A=0') + ': ' + t(F(a) + '\\div ' + k) + ' minutes. The slope tells how fast the altitude changes.' }, { html: 'The balloon rises ' + t(k) + ' m every minute.', why: 'The slope is <b>negative</b>, so the altitude is going down.' }]; } }];
  var FEE_CTX = [
    { txt: 'A plumber charges a call-out fee plus an hourly rate. A {x1}-hour job costs ${y1} and a {x2}-hour job costs ${y2}.', X: 'h', Y: 'C', xw: 'the number of hours', yw: 'the cost in dollars', m: [40, 95, 5], b: [50, 120, 10], x: [1, 8] },
    { txt: 'A gym charges a one-time sign-up fee plus a monthly fee. After {x1} months Maya has paid ${y1} in total; after {x2} months she has paid ${y2}.', X: 'n', Y: 'C', xw: 'the number of months', yw: 'the total paid in dollars', m: [25, 60, 5], b: [40, 150, 10], x: [2, 12] },
    { txt: 'A print shop charges a set-up fee plus a price per T-shirt. An order of {x1} T-shirts costs ${y1} and an order of {x2} T-shirts costs ${y2}.', X: 'n', Y: 'C', xw: 'the number of T-shirts', yw: 'the cost in dollars', m: [6, 14, 1], b: [30, 90, 5], x: [10, 60], xs: 5 },
    { txt: 'Water drains from a tank at a constant rate. After {x1} min the water level is {y1} cm; after {x2} min it is {y2} cm.', X: 't', Y: 'W', xw: 'the time in minutes', yw: 'the water level in centimetres', m: [-8, -2, 1], b: [60, 120, 4], x: [2, 9], drain: true }];
  function pickStep(r, a) { var s = a[2] || 1, n = Math.round((a[1] - a[0]) / s); return a[0] + s * r.int(0, n); }
  var DR_CTX = [
    { txt: 'A tank holds {V0t} L of water. When a valve is opened, the volume ' + t('V') + ' (in litres) after ' + t('t') + ' minutes is ' + t('V={V0}-{k}t') + '. The model applies from the moment the valve opens until the tank is empty.', dv: 't', w: 'V', k: [5, 25], T: [8, 40] },
    { txt: 'A candle is {V0t} cm tall. Its height ' + t('h') + ' (in cm) after burning for ' + t('t') + ' hours is ' + t('h={V0}-{k}t') + '. The model applies from when the candle is lit until it has burned down completely.', dv: 't', w: 'h', k: [2, 4], T: [5, 12] },
    { txt: 'A hot-air balloon is at {V0t} m when it starts to descend. Its altitude ' + t('A') + ' (in m) after ' + t('t') + ' minutes is ' + t('A={V0}-{k}t') + '. The model applies from the start of the descent until the balloon lands.', dv: 't', w: 'A', k: [15, 40], T: [12, 40] },
    { txt: 'A phone’s battery is at {V0t} when a video call starts. The charge ' + t('B') + ' (in %) after ' + t('t') + ' minutes of the call is ' + t('B={V0}-{k}t') + '. The model applies from the start of the call until the battery is empty.', dv: 't', w: 'B', k: [2, 3], T: [20, 50] }];
  HW.defineExit({
    lesson: 'u7l6', calc: true, outcome: 'RF5',
    blurb: 'Calculate a rate of change from two readings, interpret the slope of a context equation, write the equation of a context line, and state a sensible domain and range.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF5', level: 'BEG', make: function (r) {
          var c = r.pick(RATE_CTX), st = c.step || 1, rate = c.r[0] + st * r.int(0, Math.floor((c.r[1] - c.r[0]) / st)), t1 = r.int(1, 4), t2 = t1 + r.int(2, 5), v0 = c.s > 0 ? c.v0[0] + st * r.int(0, Math.floor((c.v0[1] - c.v0[0]) / st)) : 0;
          if (c.s < 0) v0 = Math.max(c.v0[0], rate * (t2 + 2)) + st * r.int(0, 5);
          var v1 = v0 + c.s * rate * t1, v2 = v0 + c.s * rate * t2, m = c.s * rate;
          return numPart(fill(c.txt, { t1: t1, t2: t2, v1: v1, v2: v2 }) + ' Determine the rate of change of ' + c.what + ' with respect to time (include its sign).', m, [
            [-m, 'u7x-rate-sign', 'Check the sign: ' + c.what + (c.s > 0 ? ' goes <b>up</b>' : ' goes <b>down</b>') + ' as time passes. Subtract in the same order on the top and the bottom.'],
            [1 / m, 'u7x-rate-flip', 'That’s run over rise. The rate is (change in ' + c.what.replace(/^the /, '') + ') ÷ (change in time).', 0.006], [-1 / m, 'u7x-rate-flip', 'That’s run over rise: divide the change in ' + c.what.replace(/^the /, '') + ' by the change in time.', 0.006],
            [v2 - v1, 'u7x-rate-change', 'That’s the total change. Divide it by the change in time, ' + t(t2 + '-' + t1) + '.'], [v2 / t2, 'u7x-rate-point', 'Use the <b>change</b> between the two readings: ' + t('\\frac{' + v2 + '-' + v1 + '}{' + t2 + '-' + t1 + '}') + '.', 0.006]],
            'Rate of change ' + t('=\\frac{\\text{change in value}}{\\text{change in time}}=\\frac{' + v2 + '-' + v1 + '}{' + t2 + '-' + t1 + '}=\\frac{' + (v2 - v1) + '}{' + (t2 - t1) + '}=' + m) + ' ' + c.unit + '.',
            ['Rate of change = (change in the quantity) ÷ (change in time).', 'A quantity that is going down has a negative rate.'], 'rate from two readings', { after: c.unit });
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF5', level: 'EMG', make: function (r) {
          var c = r.pick(EQ_CTX), a = pickStep(r, c.a), k = r.int(c.k[0], c.k[1]);
          return mc(r, c.setup + ' ' + t(c.eq(a, k)) + '. What does the ' + c.coefTxt(k) + ' in the equation represent?', [{ html: c.right(k), right: true }].concat(c.wrongs(a, k)),
            'The number multiplying the variable is the slope: the rate of change. ' + c.right(k) + ' The constant ' + t(F(a)) + ' is the value at the start.',
            ['The coefficient of the variable is the slope: a rate (units of the output per unit of the input).', 'Its sign tells whether the quantity goes up or down.'], 'interpret slope ' + c.eq(a, k));
        } }] },
      { num: '3', stem: '', parts: [
        { id: '3', outcome: 'RF7', level: 'PRG', make: function (r) {
          var c = r.pick(FEE_CTX), m = pickStep(r, c.m), b = pickStep(r, c.b), xs = c.xs || 1;
          var x1 = xs * r.int(Math.ceil(c.x[0] / xs), Math.floor(c.x[1] / xs) - 2), x2 = x1 + xs * r.int(2, Math.max(2, Math.floor((c.x[1] - x1) / xs)));
          var y1 = m * x1 + b, y2 = m * x2 + b, X = c.X, Y = c.Y, eqK = Y + '=' + term(m, X, true) + '+' + b;
          var W = [{ is: { m: m, b: y1 }, code: 'u7x-ctx-b-point', hint: t(F(y1)) + ' is the value when ' + t(X + '=' + x1) + ', not when ' + t(X + '=0') + '. Substitute ' + t(ptT(x1, y1)) + ' into ' + t(Y + '=' + term(m, X, true) + '+b') + ' to find ' + t('b') + '.' },
            { is: { m: m, b: y1 + m * x1 }, code: 'u7x-ctx-b-sign', hint: 'Check the substitution: ' + t(F(y1) + '=' + m + '(' + x1 + ')+b') + ', so ' + t('b=' + F(y1) + '-' + pT(m * x1)) + '.' }];
          if (!c.drain) W.push({ is: { m: m, b: 0 }, code: 'u7x-ctx-no-b', hint: 'There is also a fixed fee: the line doesn’t pass through ' + t('(0,\\ 0)') + '. Find ' + t('b') + ' by substituting one of the given pairs.' });
          var T = { m: m, b: b }, base = K.line(T, { vars: [X, Y], form: 'slope-intercept', wrong: W.filter(function (w) { return !near(w.is.b, b); }) });
          var p = B.math(fill(c.txt, { x1: x1, x2: x2, y1: y1, y2: y2 }) + ' Let ' + t(X) + ' be ' + c.xw + ' and ' + t(Y) + ' ' + c.yw + '. Write an equation in the form ' + t(Y + '=m' + X + '+b') + '.',
            function (resp) { return base(prep(resp)); }, eqK,
            'Slope: ' + t('m=\\frac{' + F(y2) + '-' + F(y1) + '}{' + x2 + '-' + x1 + '}=\\frac{' + (y2 - y1) + '}{' + (x2 - x1) + '}=' + m) + '.<br>Substitute ' + t(ptT(x1, y1)) + ': ' + t(F(y1) + '=' + m + '(' + x1 + ')+b\\Rightarrow b=' + F(y1) + '-' + pT(m * x1) + '=' + b) + '.<br>' + t(eqK) + '. <b>Check</b> with ' + t(ptT(x2, y2)) + ': ' + t(m + '(' + x2 + ')+' + b + '=' + F(y2)) + ' ✓',
            ['Each piece of information is a point ' + t('(' + X + ',\\ ' + Y + ')') + '. The slope is the rate: change in ' + t(Y) + ' ÷ change in ' + t(X) + '.', 'Substitute one point to find ' + t('b') + ', the value when ' + t(X + '=0') + '.'], 'context line ' + eqK,
            { keys: 'eq', vars: [X, Y], placeholder: 'e.g. ' + Y + ' = 2' + X + ' + 5' });
          p.bad = W.filter(function (w) { return !near(w.is.b, b); }).map(function (w) { return Y + '=' + term(m, X, true) + (w.is.b < 0 ? '' : '+') + w.is.b; });
          return p;
        } }] },
      { num: '4', stem: '', parts: [
        { id: '4', outcome: 'RF5', level: 'ADV', make: function (r) {
          var c = r.pick(DR_CTX), k = r.int(c.k[0], c.k[1]), T = r.int(c.T[0], c.T[1]), V0 = k * T;
          if (c.w === 'B') { V0 = until(function () { return r.int(60, 100); }, function (v) { return v % k === 0 && v / k >= 20; }); T = V0 / k; }
          var txt = c.txt.replace(/\{V0t\}/g, t(F(V0) + (c.w === 'B' ? '\\%' : ''))).replace(/\{V0\}/g, String(V0)).replace(/\{k\}/g, String(k));
          return drPart(txt + ' State the domain and the range of the model.', { dv: c.dv, w: c.w, D: [0, T], R: [0, V0],
            dW: [{ is: bldK(c.dv, 0, V0), code: 'set-swap', hint: 'The domain is the set of <b>times</b>: from ' + t(c.dv + '=0') + ' until the model stops. When is ' + t(c.w + '=0') + '?' }],
            rW: [{ is: bldK('y', 0, T), code: 'set-swap', hint: 'The range is the set of values of ' + t(c.w) + ': from ' + t(F(V0)) + ' at the start down to ' + t('0') + '.' }] },
            'The model stops when ' + t(c.w + '=0') + ': ' + t('0=' + V0 + '-' + k + c.dv + '\\Rightarrow ' + c.dv + '=\\frac{' + V0 + '}{' + k + '}=' + T) + '.<br>Domain: ' + t(bld(c.dv, 0, T)) + '.<br>Range: ' + t(c.w) + ' goes from ' + t(F(V0)) + ' down to ' + t('0') + ', so ' + t(bld(c.w, 0, V0)) + '.',
            ['When does the model stop? Set ' + t(c.w + '=0') + ' and solve for ' + t(c.dv) + '.', 'The domain is the times used; the range is the values of ' + t(c.w) + ' from the start to the end.'], 'domain/range ' + c.w);
        } }] }
    ]
  });

  /* =====================================================================================================
   * Exit Slip 7.7 — Unit review (RF4, RF5, RF6, RF7)
   * ===================================================================================================== */
  var DESC_CTX = [
    { txt: 'A hot-air balloon descends at a constant rate. Its height ' + t('h') + ', in metres, is recorded ' + t('t') + ' minutes after the descent began.', X: 't', Y: 'h', xn: 'Time, ' + t('t') + ' (min)', yn: 'Height, ' + t('h') + ' (m)', r: [20, 45], H: [700, 1500, 50], goal: 'does the balloon reach the ground', target: 0 },
    { txt: 'A ski lift carries a chair down the mountain at a constant rate. Its elevation ' + t('E') + ', in metres above the base, is recorded ' + t('t') + ' minutes after it left the top.', X: 't', Y: 'E', xn: 'Time, ' + t('t') + ' (min)', yn: 'Elevation, ' + t('E') + ' (m)', r: [35, 70], H: [600, 1200, 50], goal: 'does the chair reach the base (elevation 0 m)', target: 0 },
    { txt: 'A swimming pool is drained at a constant rate. The water depth ' + t('d') + ', in centimetres, is recorded ' + t('t') + ' hours after draining began.', X: 't', Y: 'd', xn: 'Time, ' + t('t') + ' (h)', yn: 'Depth, ' + t('d') + ' (cm)', r: [7, 15], H: [180, 300, 10], goal: 'is the water down to a depth of 20 cm', target: 20 }];
  HW.defineExit({
    lesson: 'u7l7', calc: true, outcome: 'RF7',
    blurb: 'Unit review: a vertical or horizontal line, slope–point form to general form, a context table (equation and prediction), and two lines that meet on the y-axis.',
    questions: [
      { num: '1', stem: '', parts: [
        { id: '1', outcome: 'RF7', level: 'BEG', make: function (r) {
          var vert = r.chance(0.5), c = nz(r, -9, 9), a = nz(r, -9, 9), b = until(function () { return nz(r, -9, 9); }, function (v) { return v !== a && Math.abs(v) !== Math.abs(c); });
          if (Math.abs(a) === Math.abs(c)) a = a > 0 ? a + (a + 1 === Math.abs(c) ? 2 : 1) : a - 1;
          var A = vert ? [c, a] : [a, c], Bp = vert ? [c, b] : [b, c], T = vert ? { x: c } : { y: c };
          return LP('The points ' + t('A' + ptT(A[0], A[1])) + ' and ' + t('B' + ptT(Bp[0], Bp[1])) + ' lie on a line. Write the equation of the line.', T,
            { wrong: [{ is: vert ? { y: c } : { x: c }, code: 'line-vh', hint: 'Both points have the same ' + t(vert ? 'x' : 'y') + '-coordinate, ' + t(c) + ', so the line is ' + (vert ? 'vertical: ' + t('x=' + c) : 'horizontal: ' + t('y=' + c)) + '.' }], bad: [vert ? 'y=' + c : 'x=' + c, vert ? 'x=' + a : 'y=' + a] },
            'Both points have the same ' + t(vert ? 'x' : 'y') + '-coordinate, ' + t(c) + ', so the line is ' + (vert ? 'vertical (its slope is undefined)' : 'horizontal (slope ' + t('0') + ')') + ': ' + t(vert ? 'x=' + c : 'y=' + c) + '.',
            ['Compare the coordinates of ' + t('A') + ' and ' + t('B') + ': which one stays the same?', 'A vertical line is ' + t('x=k') + '; a horizontal line is ' + t('y=k') + '.'], (vert ? 'vertical' : 'horizontal') + ' through 2 points');
        } }] },
      { num: '2', stem: '', parts: [
        { id: '2', outcome: 'RF6', level: 'EMG', make: function (r) {
          var m = r.int(2, 9) * r.pick([1, -1]), P = until(function () { return [nz(r, -9, 9), nz(r, -9, 9)]; }, function (p) { return Math.abs(p[0]) !== Math.abs(p[1]) && p[1] - m * p[0] !== 0; });
          var T = { m: [m, 1], point: P }, eq = PS([m, 1], P), b = P[1] - m * P[0];
          return LP('Rewrite ' + t(eq) + ' in general form, ' + t('Ax+By+C=0') + ' (integers with no common factor, ' + t('A\\ge 0') + ').', T,
            { form: 'general', wrong: [{ is: { m: [m, 1], point: [-P[0], -P[1]] }, code: 'u7x-sp-signs', hint: 'Check the signs when you expand ' + t(eq) + ': the point on the line is ' + t(ptT(P[0], P[1])) + '.' }], bad: [GEN(L(m, -b)), GEN(L(-m, b))] },
            'Expand: ' + t('y' + (P[1] < 0 ? '+' : '-') + Math.abs(P[1]) + '=' + m + 'x' + (m * P[0] > 0 ? '-' : '+') + Math.abs(m * P[0])) + '.<br>Move every term to one side, keeping the ' + t('x') + '-term positive: ' + t(GEN(T)) + '.',
            ['Expand the bracket first (multiply both terms by the slope).', 'Then move every term to one side so the other side is ' + t('0') + ', with a positive ' + t('x') + '-term.'], 'slope-point to general');
        } }] },
      { num: '3', stem: function (s) { return s.c.txt + HW.valueTable([[s.c.xn].concat(s.ts), [s.c.yn].concat(s.hs)]); },
        shared: function (r) {
          return until(function () {
            var c = r.pick(DESC_CTX), rate = r.int(c.r[0], c.r[1]), H = pickStep(r, c.H), st = r.int(2, 4), t0 = r.int(1, 3);
            var ts = [0, 1, 2, 3].map(function (i) { return t0 + st * i; }), hs = ts.map(function (x) { return H - rate * x; }), T = (H - c.target) / rate;
            return { c: c, rate: rate, H: H, ts: ts, hs: hs, T: T };
          }, function (s) { return s.hs[3] > s.c.target + s.rate && Math.abs(s.T * 10 - Math.round(s.T * 10)) > 0.02 && Math.abs(s.T * 10 - Math.floor(s.T * 10) - 0.5) > 0.06; });
        },
        parts: [
          { id: '3a', outcome: 'RF7', level: 'PRG', make: function (r, s) {
            var X = s.c.X, Y = s.c.Y, m = -s.rate, b = s.H, eqK = Y + '=' + m + X + '+' + b, t1 = s.ts[0], h1 = s.hs[0];
            var W = [{ is: { m: m, b: h1 }, code: 'u7x-ctx-b-point', hint: t(F(h1)) + ' is the value at ' + t(X + '=' + t1) + ', not at ' + t(X + '=0') + '. Substitute a point to find ' + t('b') + '.' }, { is: { m: m, b: h1 + m * t1 }, code: 'u7x-ctx-b-sign', hint: 'Check the substitution: ' + t(F(h1) + '=' + m + '(' + t1 + ')+b') + '.' }];
            var base = K.line({ m: m, b: b }, { vars: [X, Y], form: 'slope-intercept', wrong: W });
            var p = B.math('Write an equation for ' + t(Y) + ' in terms of ' + t(X) + '.', function (resp) { return base(prep(resp)); }, eqK,
              'Slope: ' + t('m=\\frac{' + F(s.hs[1]) + '-' + F(h1) + '}{' + s.ts[1] + '-' + t1 + '}=\\frac{' + (s.hs[1] - h1) + '}{' + (s.ts[1] - t1) + '}=' + m) + '.<br>Substitute ' + t(ptT(t1, h1)) + ': ' + t(F(h1) + '=' + m + '(' + t1 + ')+b\\Rightarrow b=' + F(b)) + '.<br>' + t(Y + '=' + m + X + '+' + F(b)) + '.',
              ['The table goes up in equal steps of time, so the change in ' + t(Y) + ' per step gives the rate.', 'The table doesn’t start at ' + t(X + '=0') + ': substitute a point to find ' + t('b') + '.'], 'context equation from table', { keys: 'eq', vars: [X, Y], placeholder: 'e.g. ' + Y + ' = -20' + X + ' + 900' });
            p.bad = W.map(function (w) { return Y + '=' + m + X + '+' + w.is.b; });
            return p;
          } },
          { id: '3b', outcome: 'RF4', level: 'PRG', make: function (r, s) {
            var X = s.c.X, Y = s.c.Y, T = s.T, u = /\(h\)/.test(s.c.xn) ? 'h' : 'min', R1 = K.roundTo(T, 1);
            var list = [[K.roundTo(T - s.ts[0], 1), 'u7x-t-start', 'Count the time from ' + t(X + '=0') + ', not from the first reading.', 0.06],
              [K.roundTo(s.H / s.rate, 1), 'u7x-t-early', 'Check the value you solved for: here ' + t(Y + '=' + s.c.target) + ', not ' + t('0') + '.', 0.06],
              [K.roundTo(s.H / s.rate + s.c.target / s.rate * 2, 1), 'u7x-t-early', 'Check the value you solved for: here ' + t(Y + '=' + s.c.target) + '.', 0.06]].filter(function (d) { return Math.abs(d[0] - R1) > 0.06 && d[0] > 0; });
            var p = B.approx('To the nearest tenth, after how many ' + (u === 'h' ? 'hours' : 'minutes') + ' (counted from ' + t(X + '=0') + ') ' + s.c.goal + '?', T, 1, { after: u, diag: dg(list) },
              'Set ' + t(Y + '=' + s.c.target) + ' in ' + t(Y + '=' + (-s.rate) + X + '+' + F(s.H)) + ': ' + t(s.c.target + '=' + (-s.rate) + X + '+' + F(s.H) + '\\Rightarrow ' + s.rate + X + '=' + F(s.H - s.c.target) + '\\Rightarrow ' + X + '=\\frac{' + F(s.H - s.c.target) + '}{' + s.rate + '}\\approx ' + R1.toFixed(1)) + ' ' + u + '.',
              ['Substitute the target value for ' + t(Y) + ' in your equation from (a) and solve for ' + t(X) + '.', 'Round to one decimal place at the end.'], 'context time to value');
            p.answer = t(R1.toFixed(1)) + ' ' + u;
            p.bad = list.map(function (d) { return d[0].toFixed(1); });
            return p;
          } }] },
      { num: '4', stem: '', parts: [
        { id: '4', outcome: 'RF5', level: 'ADV', make: function (r) {
          var o = until(function () { return { a: r.int(2, 6), b1: nz(r, -8, 8), k: r.int(2, 9) }; }, function (o) { return Math.abs(o.b1) >= 2 && o.b1 % o.a !== 0; });
          var a = o.a, b1 = o.b1, k = o.k, C2 = k * b1, L1 = Ln.tex({ A: a, B: -1, C: b1 }, 'general'), L2 = 'x-ky' + (C2 < 0 ? '-' : '+') + Math.abs(C2) + '=0', x1 = fr(-b1, a);
          var list = [[-k, 'u7x-k-sign', 'Check the signs: substitute ' + t('(0,\\ ' + b1 + ')') + ' into ' + t(L2) + ' carefully.'], [1 / k, 'u7x-k-recip', 'Solve ' + t('-k(' + b1 + ')' + (C2 < 0 ? '-' : '+') + Math.abs(C2) + '=0') + ' for ' + t('k') + ': divide by ' + t(b1) + '.', 0.006], [-1 / k, 'u7x-k-recip', 'Divide the other way: ' + t('k=\\frac{' + C2 + '}{' + b1 + '}') + '.', 0.006]];
          return numPart('The lines ' + t(L1) + ' and ' + t(L2) + ', where ' + t('k') + ' is a constant, intersect on the ' + t('y') + '-axis. Determine the value of ' + t('k') + '.', k, list,
            'Lines that meet on the ' + t('y') + '-axis share their ' + t('y') + '-intercept. For ' + t(L1) + ', set ' + t('x=0') + ': ' + t('-y' + (b1 < 0 ? '-' : '+') + Math.abs(b1) + '=0\\Rightarrow y=' + b1) + ', the point ' + t(ptT(0, b1)) + '.<br>Substitute it into the second line: ' + t('0-k(' + b1 + ')' + (C2 < 0 ? '-' : '+') + Math.abs(C2) + '=0\\Rightarrow ' + (-b1) + 'k=' + (-C2) + '\\Rightarrow k=' + k) + '.',
            ['Where on the ' + t('y') + '-axis does the first line cross? Set ' + t('x=0') + '.', 'That point is on the second line too: substitute it and solve for ' + t('k') + '.'], 'k: lines meet on y-axis', { before: t('k=') });
        } }] }
    ]
  });
})(window);
