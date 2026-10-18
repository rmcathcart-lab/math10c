/* Equations of lines (Units 6–8). Needs js/expr.js, js/kit.js, js/kitx.js, js/poly.js (and widgets for the keypad).
 *
 *   HW.lines.read(text) -> { ok, a, b, c, lhs, rhs, L, R, lAst, rAst } : the equation as a·x + b·y + c = 0 (numbers),
 *       with both sides as polynomials (HW.poly) and ASTs; or { ok:false, why: 'no-eq'|'unreadable'|'not-linear'|'vars' }.
 *   HW.lines.of(target) -> [A, B, C] for a target: { m, b } (y = mx + b), { A, B, C } (Ax + By + C = 0),
 *       { x: k } (vertical line x = k), { y: k } (horizontal line), or { m, point: [x1, y1] }.
 *   HW.lines.tex(target, form, point) -> LaTeX of the line in 'slope-intercept' | 'general' | 'point-slope' form.
 *   HW.lines.slope(target) -> slope as [p, q] (null for a vertical line).
 *
 *   K.line(target, opt) -> checker for "write the equation of the line". opt.form: 'any' (default) | 'slope-intercept' |
 *       'general' | 'point-slope' (a right equation in another form gets a nudge that doesn't use a try);
 *       opt.point: [x1, y1] the point a point-slope answer must use; opt.vars: ['x', 'y'] (other letters for contexts);
 *       opt.wrong: [{ is: target-or-equation-text, code, hint }].
 *       Diagnoses: slope sign, reciprocal slope (run over rise), perpendicular slope, right slope/wrong intercept,
 *       right intercept/wrong slope, horizontal vs vertical, misses the given point.
 *   K.P.line(prompt, target, opt, sol, hints, text) -> part with the 'eq' keypad (digits, x, y, =, fraction, brackets).
 *   K.slope(slope, opt) -> checker for a slope value (slope = [p, q], a number, or null = undefined); opt.diag(v) runs first (fractions, integers, 'undefined' for vertical, 0);
 *       diagnoses run/rise, sign, and a negative written as −(−a/b). K.P.slope(prompt, slope, opt, sol, hints, text).
 */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, ex = HW.ex, P = HW.poly, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;
  var Lns = HW.lines = {};
  function cf(p, k) { var tm = p[k]; return tm ? tm.c[0] / tm.c[1] : 0; }
  function cfR(p, k) { var tm = p[k]; return tm ? tm.c.slice() : [0, 1]; }
  function near(a, b) { return Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function frT(p, q) { if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; p /= g; q /= g; return q === 1 ? String(p) : (p < 0 ? '-' : '') + '\\frac{' + Math.abs(p) + '}{' + q + '}'; }
  function toFr(x) { for (var q = 1; q <= 1000; q++) { var p = Math.round(x * q); if (Math.abs(p / q - x) < 1e-9) return [p, q]; } return [x, 1]; }
  Lns.frT = frT; Lns.toFr = toFr;

  function clean(s) { return String(s == null ? '' : s).replace(/\\left|\\right/g, '').replace(/\\cdot/g, '\\times ').replace(/\\,|\\ |\\;|\\!/g, ' ').trim(); }
  Lns.read = function (text, vars) {
    vars = vars || ['x', 'y'];
    var s = clean(text); if (!s) return { ok: false, why: 'empty' };
    var parts = s.split('='); if (parts.length !== 2) return { ok: false, why: parts.length < 2 ? 'no-eq' : 'unreadable' };
    var la = ex.parse(parts[0]), ra = ex.parse(parts[1]); if (!la.ok || !ra.ok) return { ok: false, why: 'unreadable' };
    var lr = P.read(la.ast), rr = P.read(ra.ast); if (!lr.ok || !rr.ok) return { ok: false, why: 'not-linear' };
    var D = P.sub(lr.p, rr.p), bad = false;
    Object.keys(D).forEach(function (k) { var v = D[k].v, ks = Object.keys(v); if (ks.length > 1 || ks.some(function (x) { return v[x] > 1 || vars.indexOf(x) < 0; })) bad = true; });
    if (bad) { var other = Object.keys(D).some(function (k) { return Object.keys(D[k].v).some(function (x) { return vars.indexOf(x) < 0; }); }); return { ok: false, why: other ? 'vars' : 'not-linear' }; }
    var a = cf(D, vars[0] + '1'), b = cf(D, vars[1] + '1'), c = cf(D, '');
    if (a === 0 && b === 0) return { ok: false, why: 'not-linear' };
    return { ok: true, a: a, b: b, c: c, D: D, L: lr.p, R: rr.p, lAst: la.ast, rAst: ra.ast, vars: vars };
  };
  Lns.of = function (T) {
    if (T.A != null) return [T.A, T.B, T.C];
    if (T.x != null) return [1, 0, -T.x];
    if (T.y != null) return [0, 1, -T.y];
    var m = Array.isArray(T.m) ? T.m[0] / T.m[1] : T.m;
    if (T.point) return [m, -1, T.point[1] - m * T.point[0]];
    var b = Array.isArray(T.b) ? T.b[0] / T.b[1] : T.b;
    return [m, -1, b];
  };
  Lns.slope = function (T) { var L = Lns.of(T); if (L[1] === 0) return null; return toFr(-L[0] / L[1]); };
  function same(a, b) { return near(a[0] * b[1], a[1] * b[0]) && near(a[0] * b[2], a[2] * b[0]) && near(a[1] * b[2], a[2] * b[1]); }
  Lns.same = same;
  function termT(coef, v, first) { var c = toFr(coef); if (c[0] === 0) return ''; var s = (c[0] < 0 ? '-' : first ? '' : '+'), ab = Math.abs(c[0]); var num = c[1] === 1 ? (ab === 1 && v ? '' : String(ab)) : '\\frac{' + ab + '}{' + c[1] + '}'; return s + num + v; }
  Lns.tex = function (T, fm, point, vars) {
    vars = vars || ['x', 'y']; var X = vars[0], Y = vars[1], L = Lns.of(T), A = L[0], B = L[1], C = L[2];
    if (fm === 'general') {   // integers, A > 0 (or B > 0), no common factor
      var den = 1; [A, B, C].forEach(function (v) { den = den * toFr(v)[1] / gcd(den, toFr(v)[1]); });
      var ia = Math.round(A * den), ib = Math.round(B * den), ic = Math.round(C * den), g = gcd(gcd(ia, ib), ic) || 1; ia /= g; ib /= g; ic /= g;
      if (ia < 0 || (ia === 0 && ib < 0)) { ia = -ia; ib = -ib; ic = -ic; }
      var out = termT(ia, X, true); out += termT(ib, Y, !out); out += termT(ic, '', !out); return out + '=0';
    }
    if (B === 0) return X + '=' + frT.apply(null, toFr(-C / A));
    var m = -A / B, b = -C / B;
    if (fm === 'point-slope' && point) {
      var side = function (v, k) { return k === 0 ? v : v + (k > 0 ? '-' : '+') + frT.apply(null, toFr(Math.abs(k))); };
      var mm = toFr(m), mT = mm[0] === mm[1] ? '' : mm[0] === -mm[1] ? '-' : frT(mm[0], mm[1]);
      return side(Y, point[1]) + '=' + (m === 0 ? '0' : point[0] === 0 ? mT + X : mT === '' ? side(X, point[0]) : mT + '(' + side(X, point[0]) + ')');
    }
    var r = termT(m, X, true); r += termT(b, '', !r); return Y + '=' + (r || '0');
  };

  /* form checks for a correct equation */
  function stripP(a) { while (a && a.t === 'paren') a = a.a; return a; }
  function isVar(a, n) { a = stripP(a); return a && a.t === 'var' && a.n === n; }
  function noVar(p, v) { return !Object.keys(p).some(function (k) { return p[k].v[v]; }); }
  function formIssue(ast) { try { return P.formIssue(ast); } catch (e) { return null; } }
  function isNumAst(a) { a = stripP(a); if (!a) return false; if (a.t === 'num') return true; if (a.t === 'neg') return isNumAst(a.a); if (a.t === 'div') return isNumAst(a.a) && isNumAst(a.b); return false; }
  function linBracket(a, v) { a = stripP(a); if (!a) return false; var r = P.read(a); if (!r.ok) return false; return cf(r.p, v + '1') === 1 && Object.keys(r.p).every(function (k) { return k === '' || k === v + '1'; }); }
  function psRight(a, v) {   // m(x − h), (x − h), −(x − h), m·x (h = 0), 0
    a = stripP(a); if (!a) return false;
    if (a.t === 'num' && a.v === 0) return true;
    if (a.t === 'neg') return psRight(a.a, v);
    if (a.t === 'mul') return (isNumAst(a.a) && (a.b.t === 'paren' ? linBracket(a.b, v) : isVar(a.b, v))) || (isNumAst(a.b) && a.a.t === 'paren' && linBracket(a.a, v));
    if (a.t === 'div') return a.a.t === 'paren' && linBracket(a.a, v) && isNumAst(a.b);
    return isVar(a, v) || (a.t === 'paren' || a.t === 'add' || a.t === 'sub') && linBracket(a, v);
  }
  function psLeft(a, v) { var r = P.read(a); return r.ok && cf(r.p, v + '1') === 1 && Object.keys(r.p).every(function (k) { return k === '' || k === v + '1'; }); }
  function checkForm(r, fm, opt) {
    var X = r.vars[0], Y = r.vars[1];
    if (fm === 'slope-intercept') {
      if (r.b === 0) return null;   // vertical line: x = k is the only way
      var yl = isVar(r.lAst, Y) && noVar(r.R, Y), yr = isVar(r.rAst, Y) && noVar(r.L, Y);
      if (!yl && !yr) return form('line-form-si', 'Right line — now write it in slope–intercept form: get ' + t(Y) + ' by itself, ' + t(Y + '=mx+b') + '.');
      if (yr) return form('line-form-si', 'Right — write it with ' + t(Y) + ' on the left: ' + t(Y + '=mx+b') + '.');
      var fi = formIssue(r.rAst); if (fi && fi.code !== 'not-poly') return form('line-form-simplify', 'Right line — now simplify: expand any brackets and collect like terms so it reads ' + t(Y + '=mx+b') + '.');
      return null;
    }
    if (fm === 'general') {
      if (!P.isZero(r.R) && !P.isZero(r.L)) return form('line-form-zero', 'Right line — for general form, move every term to one side so the other side is ' + t('0') + ': ' + t('Ax+By+C=0') + '.');
      var side = P.isZero(r.R) ? r.L : r.R, ast = P.isZero(r.R) ? r.lAst : r.rAst;
      var cs = [cfR(side, X + '1'), cfR(side, Y + '1'), cfR(side, '')];
      if (cs.some(function (c) { return c[1] !== 1; })) return form('line-form-int', 'Right line — general form uses whole numbers: multiply every term by the common denominator.');
      var A = cs[0][0], B = cs[1][0], C = cs[2][0];
      if (A < 0 || (A === 0 && B < 0)) return form('line-form-sign', 'Right line — in general form the ' + t(X) + '-term is positive: multiply every term by ' + t('-1') + '.');
      var g = gcd(gcd(A, B), C); if (g > 1) return form('line-form-gcd', 'Right line — divide every term by the common factor ' + t(String(g)) + '.');
      var fi2 = formIssue(ast); if (fi2 && fi2.code !== 'not-poly') return form('line-form-simplify', 'Right line — simplify: expand brackets and collect like terms.');
      return null;
    }
    if (fm === 'point-slope') {
      if (r.b === 0) return null;
      if (!(psLeft(r.lAst, Y) && psRight(r.rAst, X))) return form('line-form-ps', 'Right line — now write it in slope–point form, ' + t(Y + '-y_1=m(' + X + '-x_1)') + '.');
      if (opt.point) { var lr = P.read(r.lAst).p, y1 = -cf(lr, ''); var rp = P.read(r.rAst).p, mm = cf(rp, X + '1'), x1 = mm === 0 ? 0 : -cf(rp, '') / mm; if (!(near(y1, opt.point[1]) && (mm === 0 || near(x1, opt.point[0])))) return form('line-form-point', 'Right line — but use the point ' + t('(' + opt.point[0] + ',\\ ' + opt.point[1] + ')') + ' in slope–point form.'); }
      return null;
    }
    return null;
  }
  var WHY = { 'no-eq': 'Write an equation with an equals sign, e.g. ' + t('y=2x+3') + '.', unreadable: 'I can’t read that equation. Check the brackets and signs.', 'not-linear': 'That isn’t the equation of a line — the variables should only appear to the first power.', vars: 'Use the letters from the question.' };
  K.line = function (target, opt) {
    opt = opt || {};
    var vars = opt.vars || ['x', 'y'], TL = Lns.of(target), fm = opt.form || 'any';
    var mt = TL[1] === 0 ? null : -TL[0] / TL[1], bt = TL[1] === 0 ? null : -TL[2] / TL[1];
    var wrongs = (opt.wrong || []).map(function (w) { var L; if (typeof w.is === 'string') { var rr = Lns.read(w.is, vars); L = rr.ok ? [rr.a, rr.b, rr.c] : null; } else L = Lns.of(w.is); return L && !same(L, TL) ? { L: L, code: w.code || 'diag', hint: w.hint } : null; }).filter(Boolean);
    return function (resp) {
      var r = Lns.read(resp, vars);
      if (!r.ok) return form(r.why === 'empty' ? 'empty' : 'line-' + r.why, r.why === 'empty' ? 'Type your equation first.' : r.why === 'vars' ? 'Use the letters ' + t(vars[0]) + ' and ' + t(vars[1]) + ' from the question.' : WHY[r.why]);
      var SL = [r.a, r.b, r.c];
      if (same(SL, TL)) { var f = checkForm(r, fm, opt); return f || ok(); }
      for (var i = 0; i < wrongs.length; i++) if (same(SL, wrongs[i].L)) return wrong(wrongs[i].code, wrongs[i].hint);
      var X = vars[0], Y = vars[1];
      if (r.b === 0 && TL[1] !== 0) return wrong(mt === 0 ? 'line-vh' : 'line-vertical', mt === 0 ? 'That’s a vertical line. A horizontal line has the form ' + t(Y + '=k') + '.' : 'That’s a vertical line (' + t(X + '=k') + '), so its slope is undefined. Check the slope.');
      if (r.b !== 0 && TL[1] === 0) return wrong('line-vh', r.a === 0 ? 'That’s a horizontal line. A vertical line has the form ' + t(X + '=k') + '.' : 'This line is vertical: every point has the same ' + t(X) + '-value, so its equation is ' + t(X + '=k') + '.');
      if (TL[1] === 0) return wrong('line-x', 'Right kind of line (vertical) — check the ' + t(X) + '-value.');
      var ms = -r.a / r.b, bs = -r.c / r.b;
      if (near(ms, mt)) return wrong(near(bs, -bt) && bt !== 0 ? 'line-b-sign' : opt.point ? 'line-point' : 'line-intercept', opt.point ? 'Right slope — but your line doesn’t pass through ' + t('(' + opt.point[0] + ',\\ ' + opt.point[1] + ')') + '. Substitute the point to find ' + t('b') + ' (or use slope–point form).' : near(bs, -bt) && bt !== 0 ? 'Right slope — check the sign of the ' + t(Y) + '-intercept.' : 'Right slope — check the ' + t(Y) + '-intercept.');
      if (mt !== 0 && near(ms, -mt)) return wrong('line-slope-sign', 'Check the sign of the slope: does the line go up or down from left to right?');
      if (mt !== 0 && near(ms, 1 / mt)) return wrong('line-slope-flip', 'Slope is rise over run, ' + t('\\frac{\\Delta ' + Y + '}{\\Delta ' + X + '}') + ' — you have run over rise.');
      if (mt !== 0 && near(ms, -1 / mt)) return wrong('line-perp', 'That slope is the negative reciprocal — it belongs to a perpendicular line.');
      if (opt.point && near(r.a * opt.point[0] + r.b * opt.point[1] + r.c, 0) && !near(ms, mt)) return wrong('line-slope', 'Your line passes through ' + t('(' + opt.point[0] + ',\\ ' + opt.point[1] + ')') + ' but its slope is ' + t(frT.apply(null, toFr(ms))) + ', not ' + t(frT.apply(null, toFr(mt))) + '.');
      if (near(bs, bt) && !opt.point) return wrong('line-slope', 'Right ' + t(Y) + '-intercept — check the slope.');
      return wrong('line', null);
    };
  };
  K.P.line = function (prompt, target, opt, sol, hints, text) {
    opt = opt || {}; var vars = opt.vars || ['x', 'y'];
    var fmK = opt.form === 'any' || !opt.form ? 'slope-intercept' : opt.form, ptK = opt.point || target.point;
    if (fmK === 'point-slope' && !ptK) { var LL = Lns.of(target); ptK = LL[1] === 0 ? null : [0, -LL[2] / LL[1]]; if (!ptK) fmK = 'slope-intercept'; }
    var key = opt.keyTex || Lns.tex(target, fmK, ptK, vars);
    return K.P.math(prompt, K.line(target, opt), key, sol, hints, text, { keys: 'eq', vars: vars, placeholder: opt.placeholder || (opt.form === 'general' ? 'e.g. 2x - 3y + 6 = 0' : opt.form === 'point-slope' ? 'e.g. y - 3 = 2(x + 1)' : 'e.g. y = 2x + 3') });
  };

  /* slope as a number (fraction / integer / undefined) */
  function ratAst(a) { a = stripP(a); if (!a) return null; if (a.t === 'neg') { var r = ratAst(a.a); return r && [-r[0], r[1]]; } if (a.t === 'div') { var p = stripP(a.a), q = stripP(a.b); if (p && q && p.t === 'num' && q.t === 'num' && Number.isInteger(p.v) && Number.isInteger(q.v)) return [p.v, q.v]; } return null; }
  K.slope = function (sl, opt) {
    opt = opt || {};
    var und = sl == null, T = und ? null : (Array.isArray(sl) ? sl : toFr(sl));
    return function (resp) {
      var s = clean(resp).replace(/^m\s*=\s*/, '');
      if (!s) return form('empty', 'Type your answer first.');
      if (/^(\\text\{)?\s*(undefined|undef|none|no\s*slope)\s*\}?$/i.test(s)) return und ? ok() : wrong('slope-und', 'This line isn’t vertical, so its slope is a number. Slope = rise ÷ run.');
      var a = ex.parse(s); if (!a.ok) return form('unreadable', 'Write the slope as a number or fraction, e.g. ' + t('-\\frac{2}{3}') + ', or type “undefined”.');
      var v = ex.value(a.ast); if (!isFinite(v)) return form('unreadable', 'Write the slope as a number or fraction.');
      if (und) return wrong(v === 0 ? 'slope-zero-und' : 'slope-num-und', v === 0 ? 'A slope of 0 is a <b>horizontal</b> line. This line is vertical: the run is 0, and you can’t divide by 0 — the slope is undefined.' : 'This line is vertical: the run is 0, so the slope is undefined.');
      var tv = T[0] / T[1];
      if (opt.diag && !near(v, tv)) { var h0 = opt.diag(v); if (h0) return wrong(h0.code || 'slope', h0.hint); }
      if (near(v, tv)) { var r = ratAst(a.ast); if (opt.lowest !== false && r && Math.abs(r[1]) !== 1 && gcd(r[0], r[1]) > 1) return form('slope-lowest', 'Right — now reduce the fraction to lowest terms.'); return ok(); }
      if (tv !== 0 && near(v, -tv)) return wrong('slope-sign', opt.signHint || 'Check the sign of the slope: subtract the coordinates in the same order on the top and the bottom' + (opt.graph ? ' — the line ' + (tv > 0 ? 'rises' : 'falls') + ' from left to right' : '') + '.');
      if (tv !== 0 && near(v, 1 / tv)) return wrong('slope-flip', 'Slope is <b>rise over run</b> (change in ' + t('y') + ' over change in ' + t('x') + ') — you have run over rise.');
      if (tv !== 0 && near(v, -1 / tv)) return wrong('slope-perp', 'That’s the negative reciprocal — the slope of a perpendicular line.');
      return wrong('slope', null);
    };
  };
  K.P.slope = function (prompt, sl, opt, sol, hints, text) {
    var key = sl == null ? '\\text{undefined}' : (function (f) { return frT(f[0], f[1]); })(Array.isArray(sl) ? sl : toFr(sl));
    return K.P.math(prompt, K.slope(sl, opt), key, sol, hints, text, { keys: 'slope', before: (opt && opt.before) || 'm=', placeholder: 'e.g. -2/3 or undefined' });
  };
  if (HW.addCodes) HW.addCodes({ 'line-form-si': 'Not in slope–intercept form', 'line-form-simplify': 'Equation not simplified', 'line-form-zero': 'General form: one side not 0', 'line-form-int': 'General form: fractions left', 'line-form-sign': 'General form: A negative', 'line-form-gcd': 'General form: common factor left', 'line-form-ps': 'Not in slope–point form', 'line-form-point': 'Slope–point form with a different point',
    'line-vertical': 'Wrote a vertical line', 'line-vh': 'Horizontal/vertical mixed up', 'line-x': 'Vertical line: wrong x', 'line-slope': 'Wrong slope', 'line-point': 'Misses the given point', 'line-intercept': 'Wrong y-intercept', 'line-b-sign': 'y-intercept sign', 'line-slope-sign': 'Slope sign', 'line-slope-flip': 'Run over rise', 'line-perp': 'Perpendicular slope used', line: 'Wrong equation',
    'slope-und': 'Called a slope undefined', 'slope-zero-und': 'Slope 0 for a vertical line', 'slope-num-und': 'Number slope for a vertical line', 'slope-lowest': 'Slope not in lowest terms', 'slope-sign': 'Slope sign', 'slope-flip': 'Run over rise', 'slope-perp': 'Negative reciprocal slope', slope: 'Wrong slope' });

  /* keypads */
  var W = HW.widgets;
  if (W && W.KEYSETS) {
    var d = function (n) { return { label: String(n), tex: String(n), plain: String(n) }; };
    var KY = { del: { label: '⌫', fn: 'del', title: 'Delete' }, clear: { label: 'clear', fn: 'clear' }, left: { label: '◀', fn: 'left' }, right: { label: '▶', fn: 'right', title: 'Move right (out of a box)' }, enter: { label: 'Check ↵', fn: 'enter', wide: true },
      plus: { label: '+', tex: '+', plain: '+' }, minus: { label: '−', tex: '-', plain: '-' }, eq: { label: '=', tex: '=', plain: '=' }, frac: { label: '<sup>a</sup>⁄<sub>b</sub>', tex: '\\frac{#@}{#?}', plain: '/', title: 'Fraction' },
      par: { label: '( )', tex: '\\left(#0\\right)', plain: '(', title: 'Brackets' }, dot: { label: '.', tex: '.', plain: '.' } };
    W.KEYSETS.eq = function (opt) {
      var vs = (opt && opt.vars && opt.vars.length ? opt.vars : ['x', 'y']).slice(0, 8).map(function (v) { return { label: '<i>' + v + '</i>', tex: v, plain: v }; });
      var rows = [[d(7), d(8), d(9), KY.plus, KY.minus, KY.del], [d(4), d(5), d(6), KY.frac, KY.par, KY.clear], [d(1), d(2), d(3), KY.eq, KY.left, KY.right]];
      return vs.length <= 3 ? rows.concat([[d(0), KY.dot].concat(vs, [KY.enter])]) : rows.concat([[d(0), KY.dot, KY.enter], vs]);
    };
    W.KEYSETS.slope = function () { return [[d(7), d(8), d(9), KY.frac, KY.del], [d(4), d(5), d(6), KY.minus, KY.clear], [d(1), d(2), d(3), KY.left, KY.right], [d(0), KY.dot, { label: 'undef.', tex: '\\text{undefined}', plain: 'undefined', title: 'Undefined (vertical line)' }, KY.enter]]; };
    W.KEYHELP.eq = ['Type the whole equation, e.g. ' + HW.k('y=-\\frac{2}{3}x+4') + '. Use <b><sup>a</sup>⁄<sub>b</sub></b> for a fraction and <b>▶</b> to step out of it.', 'Type e.g. <code>y = -2/3x + 4</code> or <code>2x - 3y + 6 = 0</code>.'];
    W.KEYHELP.slope = ['Use <b><sup>a</sup>⁄<sub>b</sub></b> for a fraction, or <b>undef.</b> (undefined) for a vertical line.', 'Type e.g. <code>-2/3</code>, or <code>undefined</code>.'];
  }
})(window);
