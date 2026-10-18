/* Math 10C · Unit 7 · Lesson 3 — The General Form of a Linear Equation (RF4–RF7)
 * Assignment questions 1–16 (u7_L03.tex) and the Lesson 3 Extra Practice (u7_EP03.tex).
 * Every part is a generator: it keeps the booklet question's structure (signs, which coefficient carries the fraction,
 * an unreduced equation, a common denominator that is one of the denominators or their product, an intercept that
 * comes out as a fraction, …) and changes the numbers; the booklet's own numbers are among the possible values.
 * Equations are typed with the 'eq' keypad and checked by K.line (js/lines.js): "in general form" questions use
 * form 'general' (integers, A ≥ 0, no common factor — each broken convention is a nudge that doesn't use a try).
 * Slope / intercept answers are boxes (fields); "give the intercepts as ordered pairs" boxes take points.
 * Explain / justify parts become multiple choice with misconception hints. Outcomes: RF6 for converting between forms
 * and reading the slope (and b) from a form, RF5 for intercepts and "is the point on the line", RF7 for writing the
 * equation of a line from conditions. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, L = HW.lines, P = HW.poly;

  HW.addCodes({
    'gf-y-sign': 'Moved y across without changing its sign', 'gf-no-y': 'Didn’t multiply the y-term by the common denominator',
    'gf-no-const': 'Didn’t multiply the constant by the common denominator', 'gf-sym-sign': 'Sign slip in px − y + q = 0',
    'gf-gave-b': 'Gave the y-intercept as the slope', 'gf-slope-A': 'Took the x-coefficient as the slope', 'gf-b-undivided': 'Didn’t divide the constant by B',
    'gf-x-undivided': 'Didn’t divide the constant by A', 'gf-gave-x': 'Gave the x-intercept for the y-intercept', 'gf-gave-y': 'Gave the y-intercept for the x-intercept',
    'gf-gave-m': 'Gave the slope for the y-intercept', 'gf-value-not-point': 'Gave a value where a point was asked', 'gf-pt-swap': 'Gave the other intercept point',
    'gf-other-b': 'Used the y-intercept of the wrong line', 'gf-other-m': 'Used the slope of the wrong line', 'gf-par-for-perp': 'Used the parallel slope for a perpendicular line',
    'gf-k-sign': 'Value of k/a with the wrong sign', 'gf-k-mixed': 'Matched the wrong characteristic', 'gf-k-mult': 'Multiplied instead of dividing',
    'gf-sub-sign': 'Sign slip substituting a point', 'gf-swap-ab': 'Swapped the roles of A and B', 'gf-point-sign': 'Point read with the wrong sign from y − y₁ = m(x − x₁)',
    'gf-none': 'Missed a “none”', 'gf-said-none': 'Said “none” when there is a value', 'gf-perp-par': 'Parallel and perpendicular mixed up',
    'gf-nr-sign': 'Sign of the unknown coordinate', 'gf-nr-parallel': 'Used the given line’s slope instead of the perpendicular slope', 'gf-zero-B': 'Wrote a coefficient for a missing term',
    'gf-near': 'Distance from the line', 'gf-sym': 'Wrong equation with letters'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  var toFr = L.toFr;
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function near(a, b) { return Math.abs(a - b) < 1e-9; }
  function fT(x) { var f = toFr(x); return L.frT(f[0], f[1]); }
  function pT(p) { return '(' + fT(p[0]) + ',\\ ' + fT(p[1]) + ')'; }
  function pK(p) { return '(' + fT(p[0]) + ', ' + fT(p[1]) + ')'; }
  function term(c, v, first) {
    if (near(c, 0)) return '';
    var f = toFr(Math.abs(c)), mag = f[1] === 1 ? String(f[0]) : '\\frac{' + f[0] + '}{' + f[1] + '}';
    if (v && mag === '1') mag = '';
    return (c < 0 ? '-' : first ? '' : '+') + mag + v;
  }
  function lin(list) { var s = ''; list.forEach(function (p) { s += term(p[0], p[1], s === ''); }); return s || '0'; }
  function gT(A, Bc, C) { return lin([[A, 'x'], [Bc, 'y'], [C, '']]) + '=0'; }       // as written (not reduced)
  function siT(m, b) { return 'y=' + lin([[m, 'x'], [b, '']]); }
  function red(A, Bc, C) {                                                            // general form: integers, A ≥ 0, no common factor
    var d = 1; [A, Bc, C].forEach(function (v) { d = lcm(d, toFr(v)[1]); });
    var a = Math.round(A * d), b = Math.round(Bc * d), c = Math.round(C * d), g = gcd(gcd(a, b), c) || 1; a /= g; b /= g; c /= g;
    if (a < 0 || (a === 0 && b < 0)) { a = -a; b = -b; c = -c; }
    return [a, b, c];
  }
  function rT(L3) { return gT(L3[0], L3[1], L3[2]); }                              // reduced general form LaTeX
  function gen(T) { return L.tex(T, 'general'); }
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function pm(a, b) { return range(a, b).concat(range(a, b).map(function (x) { return -x; })); }
  function cop(a, b) { return gcd(a, b) === 1; }
  function pickWhere(gen0, okf) { for (var i = 0; i < 3000; i++) { var o = gen0(); if (okf(o)) return o; } throw new Error('u7l3: no valid numbers'); }
  function sgp(x) { return x < 0 ? '(' + fT(x) + ')' : fT(x); }
  function prn(x) { return '(' + fT(x) + ')'; }                                      // a factor in a product: always bracketed
  function valAt(A, Bc, C, p) { return Math.round((A * p[0] + Bc * p[1] + C) * 1e9) / 1e9 + 0; }

  /* steps for solving Ax + By + C = 0 for y */
  function solveY(A, Bc, C) {
    var m = -A / Bc, b = -C / Bc, s = [];
    if (Bc === 1) s.push(siT(m, b));
    else if (Bc === -1) s.push(siT(m, b));
    else {
      s.push(Bc > 0 ? lin([[Bc, 'y']]) + '=' + lin([[-A, 'x'], [-C, '']]) : lin([[-Bc, 'y']]) + '=' + lin([[A, 'x'], [C, '']]));
      s.push(siT(m, b));
    }
    return s;
  }
  function solveYT(A, Bc, C) { return solveY(A, Bc, C).map(t).join(' &nbsp;→&nbsp; '); }

  /* slope–intercept → general: m = [p,q], b = [p,q] */
  function toGenSol(mF, bF) {
    var D = lcm(mF[1], bF[1]), a = mF[0] * D / mF[1], c = bF[0] * D / bF[1], out = [];
    if (D > 1) out.push('Multiply <b>every</b> term by ' + t(D) + ' (the common denominator): ' + t(lin([[D, 'y']]) + '=' + lin([[a, 'x'], [c, '']])) + '.');
    if (a > 0) out.push('Move every term to the side with the ' + t('x') + '-term (subtract ' + t(lin([[D, 'y']])) + ' from both sides): ' + t(gT(a, -D, c)) + '.');
    else out.push('Move every term to the left side, so the ' + t('x') + '-term is positive: ' + t(gT(-a, D, -c)) + '.');
    return out.join('<br>');
  }
  var HGEN = ['Clear any fractions first: multiply <b>every</b> term (including ' + t('y') + ') by the common denominator.', 'Then move every term to one side so the other side is ' + t('0') + ', with the ' + t('x') + '-term positive.'];

  /* ---------------- checkers for boxes ---------------- */
  function slopeBox(A, Bc, C) {
    var m = -A / Bc;
    return K.slope(toFr(m), { diag: function (v) {
      if (!near(m, -C / Bc) && near(v, -C / Bc)) return { code: 'gf-gave-b', hint: 'That’s the ' + t('y') + '-intercept. The slope is the coefficient of ' + t('x') + ' once the equation reads ' + t('y=mx+b') + '.' };
      if (Math.abs(Bc) !== 1 && (near(v, A) || near(v, -A)) && !near(m, A)) return { code: 'gf-slope-A', hint: 'In general form the slope isn’t the coefficient of ' + t('x') + '. Solve for ' + t('y') + ' — divide every term by the coefficient of ' + t('y') + ' — or use ' + t('m=-\\frac{A}{B}') + '.' };
      return null;
    } });
  }
  function yBox(A, Bc, C) {
    var b = -C / Bc, m = -A / Bc;
    return K.value(b, { diag: function (v) {
      if (Math.abs(Bc) !== 1 && C !== 0 && (near(v, C) || near(v, -C))) return { code: 'gf-b-undivided', hint: 'Divide the constant by the coefficient of ' + t('y') + ' too.' };
      if (A !== 0 && !near(b, -C / A) && near(v, -C / A)) return { code: 'gf-gave-x', hint: 'That’s the ' + t('x') + '-intercept (where ' + t('y=0') + '). For the ' + t('y') + '-intercept, set ' + t('x=0') + '.' };
      if (!near(b, m) && near(v, m)) return { code: 'gf-gave-m', hint: 'That’s the slope. The ' + t('y') + '-intercept is the constant once the equation reads ' + t('y=mx+b') + '.' };
      return null;
    } });
  }
  function xBox(A, Bc, C) {
    var xi = -C / A;
    return K.value(xi, { diag: function (v) {
      if (Math.abs(A) !== 1 && C !== 0 && (near(v, C) || near(v, -C))) return { code: 'gf-x-undivided', hint: 'Set ' + t('y=0') + ', then divide the constant by the coefficient of ' + t('x') + '.' };
      if (!near(xi, -C / Bc) && near(v, -C / Bc)) return { code: 'gf-gave-y', hint: 'That’s the ' + t('y') + '-intercept. For the ' + t('x') + '-intercept set ' + t('y=0') + ' and solve for ' + t('x') + '.' };
      return null;
    } });
  }
  /* an intercept written as an ordered pair */
  function ptBox(pt, other, axis) {
    var base = K.pairs([pt]), ot = other ? K.pairs([other]) : null;
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type your answer first.');
      if (!/\(/.test(s.replace(/\\left|\\right/g, ''))) { var a = K.read(s); if (!a.res) return form('gf-value-not-point', 'Write the intercept as an ordered pair, e.g. ' + t(axis === 'x' ? '(3,\\ 0)' : '(0,\\ 3)') + '.'); }
      var r = base(s); if (r.v === 'correct' || r.v === 'form') return r;
      if (ot && ot(s).v === 'correct' && !(near(pt[0], other[0]) && near(pt[1], other[1]))) return wrong('gf-pt-swap', 'That’s the other intercept. ' + (axis === 'x' ? 'The ' + t('x') + '-intercept is on the ' + t('x') + '-axis: ' + t('y=0') + '.' : 'The ' + t('y') + '-intercept is on the ' + t('y') + '-axis: ' + t('x=0') + '.'));
      if (r.code === 'pairs-flip') return wrong('pairs-flip', 'Coordinates the wrong way round: an ordered pair is ' + t('(x,\\ y)') + '.');
      return r;
    };
  }
  /* a value, or "none" */
  function noneBox(v, what) {
    var c = v == null ? null : K.value(v);
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Fill in every box (press <b>none</b> if there isn’t one).');
      var none = /^none$/i.test(s.replace(/\\text\{\s*none\s*\}/, 'none').replace(/\s/g, ''));
      if (v == null) return none ? ok() : wrong('gf-none', 'Does this line ever cross that axis? ' + what);
      if (none) return wrong('gf-said-none', 'This line does cross that axis — find where.');
      return c(s);
    };
  }

  function mbFields(prompt, A, Bc, C, o) {
    o = o || {};
    var m = -A / Bc, b = -C / Bc, xi = A ? -C / A : null;
    var fl = [{ label: 'Slope:', name: 'Slope', mode: 'math', keys: o.keys || 'fraction', before: t('m=') }, { label: t('y') + '-intercept:', name: 'y-intercept', mode: 'math', keys: o.keys || 'fraction' }];
    var cs = [slopeBox(A, Bc, C), yBox(A, Bc, C)], ks = [fT(m), fT(b)];
    var ans = 'Slope ' + t('m=' + fT(m)) + ', ' + t('y') + '-intercept ' + t(fT(b));
    if (o.x) { fl.push({ label: t('x') + '-intercept:', name: 'x-intercept', mode: 'math', keys: o.keys || 'fraction' }); cs.push(xBox(A, Bc, C)); ks.push(fT(xi)); ans += ', ' + t('x') + '-intercept ' + t(fT(xi)); }
    var sol = 'Solve for ' + t('y') + ': ' + t(o.eqT || gT(A, Bc, C)) + ' &nbsp;→&nbsp; ' + (o.solY || solveYT(A, Bc, C)) + '.<br>So ' + t('m=' + fT(m)) + ' and the ' + t('y') + '-intercept is ' + t(fT(b)) + '.';
    if (o.x) sol += '<br>' + t('x') + '-intercept: set ' + t('y=0') + ': ' + t(lin([[A, 'x'], [C, '']]) + '=0') + ', so ' + t('x=' + fT(xi)) + '.';
    if (o.solPre) sol = o.solPre + '<br>' + sol;
    var p = B.fields(prompt, fl, cs, ks, ans, sol, o.hints || ['Isolate the ' + t('y') + '-term, then divide <b>every</b> term by the coefficient of ' + t('y') + ': the result is ' + t('y=mx+b') + '.', 'Check with the rule ' + t('m=-\\frac{A}{B}') + ', ' + t('y') + '-intercept ' + t('=-\\frac{C}{B}') + (o.x ? ', ' + t('x') + '-intercept ' + t('=-\\frac{C}{A}') : '') + '.'], o.text || 'slope/intercepts of ' + gT(A, Bc, C));
    p.good = o.good; p.bad = o.bad;
    return p;
  }
  /* slope plus both intercepts as points (EP 3) */
  function mPtsFields(prompt, A, Bc, C, o) {
    o = o || {};
    var m = -A / Bc, xp = [-C / A, 0], yp = [0, -C / Bc];
    var fl = [{ label: 'Slope:', name: 'Slope', mode: 'math', keys: 'pairs', before: t('m=') }, { label: t('x') + '-intercept:', name: 'x-intercept', mode: 'math', keys: 'pairs' }, { label: t('y') + '-intercept:', name: 'y-intercept', mode: 'math', keys: 'pairs' }];
    var sol = 'Slope: ' + t('m=-\\frac{A}{B}=-\\frac{' + A + '}{' + sgp(Bc) + '}=' + fT(m)) + '.<br>' + t('x') + '-intercept: ' + t('y=0') + ' gives ' + t(lin([[A, 'x'], [C, '']]) + '=0') + ', so ' + t(pT(xp)) + '.<br>' + t('y') + '-intercept: ' + t('x=0') + ' gives ' + t(lin([[Bc, 'y'], [C, '']]) + '=0') + ', so ' + t(pT(yp)) + '.' + (o.note ? '<br>' + o.note : '');
    var p = B.fields(prompt, fl, [slopeBox(A, Bc, C), ptBox(xp, yp, 'x'), ptBox(yp, xp, 'y')], [fT(m), pK(xp), pK(yp)],
      'Slope ' + t('m=' + fT(m)) + ', ' + t('x') + '-intercept ' + t(pT(xp)) + ', ' + t('y') + '-intercept ' + t(pT(yp)), sol,
      ['Slope: ' + t('m=-\\frac{A}{B}') + '. For the ' + t('x') + '-intercept set ' + t('y=0') + '; for the ' + t('y') + '-intercept set ' + t('x=0') + '.', 'An ' + t('x') + '-intercept point looks like ' + t('(a,\\ 0)') + ' and a ' + t('y') + '-intercept point like ' + t('(0,\\ b)') + '.'], 'slope + intercept points of ' + gT(A, Bc, C));
    p.bad = [[fT(m), pK(yp), pK(xp)].map(String)].filter(function () { return !near(xp[0], 0); });
    return p;
  }

  /* slope–intercept form → general form */
  function lineGen(prompt, T, wr, sol, hints, text, o) {
    o = o || {};
    var p = B.line(prompt, T, { form: 'general', wrong: wr, point: o.point }, sol, hints || HGEN, text);
    p.good = o.good; p.bad = (o.bad || []).filter(function (b) { return p.check(b).v !== 'correct'; });   // drop a "typical wrong answer" that coincides with the right line
    return p;
  }
  function convPart(prompt, mF, bF, o) {
    o = o || {};
    var T = { m: mF, b: bF }, mv = mF[0] / mF[1], bv = bF[0] / bF[1], D = lcm(mF[1], bF[1]), a = mv * D, c = bv * D, wr = [], bad = [];
    wr.push({ is: { A: a, B: D, C: c }, code: 'gf-y-sign', hint: 'When ' + t(lin([[D, 'y']])) + ' moves to the other side it changes sign. Check the sign of your ' + t('y') + '-term.' });
    bad.push(gen({ A: a, B: D, C: c }));
    if (D > 1) {
      wr.push({ is: { A: a, B: -1, C: c }, code: 'gf-no-y', hint: 'Multiply <b>every</b> term by ' + t(D) + ' — the ' + t('y') + '-term too. If you skip a term, the two sides aren’t multiplied by the same number, so you get a different line.' });
      bad.push(gen({ A: a, B: -1, C: c }));
      if (bF[1] === 1) { wr.push({ is: { A: a, B: -D, C: bv }, code: 'gf-no-const', hint: 'Multiply <b>every</b> term by ' + t(D) + ' — the constant ' + t(fT(bv)) + ' too.' }); bad.push(gen({ A: a, B: -D, C: bv })); }
    }
    var eqT = o.eqT || siT(mv, bv), k = gen(T), Lr = red(mv, -1, bv);
    var good = [lin([[Lr[1], 'y'], [Lr[0], 'x'], [Lr[2], '']]) + '=0'];
    var hints = o.hints || (D > 1 ? HGEN : ['Move every term to one side, so the other side is ' + t('0') + '.', 'When a term crosses the equals sign its sign changes. Make the ' + t('x') + '-term positive.']);
    return lineGen(prompt || t(eqT), T, wr, toGenSol(mF, bF) + (o.solPost ? '<br>' + o.solPost : ''), hints, 'general form of ' + eqT, { good: good, bad: bad.concat([siT(mv, bv)]).filter(function (b) { return b !== k; }) });
  }

  /* Q1(c): y = px + q with letters */
  function symCheck(pv, qv) {
    var T = P.parse(pv + 'x-y+' + qv), keys = Object.keys(T);
    function ratio(D) {
      var dk = Object.keys(D); if (dk.length !== keys.length || dk.some(function (k) { return !T[k]; })) return null;
      var k0 = null;
      for (var i = 0; i < keys.length; i++) { var a = D[keys[i]].c, b = T[keys[i]].c, q = (a[0] / a[1]) / (b[0] / b[1]); if (k0 == null) k0 = q; else if (!near(k0, q)) return null; }
      return k0;
    }
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').trim();
      if (!s) return form('empty', 'Type your equation first.');
      var sides = s.split('='); if (sides.length !== 2) return form('line-no-eq', 'Write an equation with an equals sign, ending in ' + t('=0') + '.');
      var la = P.read(sides[0]), ra = P.read(sides[1]);
      if (!la.ok || !ra.ok) return form('line-unreadable', 'I can’t read that equation. Use the letters ' + t(pv) + ', ' + t(qv) + ', ' + t('x') + ' and ' + t('y') + '.');
      var D = P.sub(la.p, ra.p), k = ratio(P.isZero(la.p) ? ra.p : la.p);
      if (ratio(D) != null) {
        if (!P.isZero(la.p) && !P.isZero(ra.p)) return form('line-form-zero', 'Right line — for general form, move every term to one side so the other side is ' + t('0') + '.');
        if (near(k, 1)) return ok();
        if (near(k, -1)) return form('line-form-sign', 'Right line — write it with the ' + t('x') + '-term as ' + t('+' + pv + 'x') + ' (multiply every term by ' + t('-1') + ').');
        return form('line-form-gcd', 'Right line — but divide out the common factor so the ' + t('x') + '-term is just ' + t(pv + 'x') + '.');
      }
      var alts = [[pv + 'x+y+' + qv, 'gf-y-sign', 'When ' + t('y') + ' moves to the right side it becomes ' + t('-y') + '.'], [pv + 'x-y-' + qv, 'gf-sym-sign', 'Check the sign of ' + t(qv) + ': it stays ' + t('+' + qv) + ' when only ' + t('y') + ' moves.'], [pv + 'x+y-' + qv, 'gf-sym-sign', 'Moving ' + t('y') + ' from the left to the right: subtract ' + t('y') + ' from both sides. Nothing else changes sign.']];
      for (var i = 0; i < alts.length; i++) { var Wp = P.parse(alts[i][0]), dd = Object.keys(D); if (dd.length === Object.keys(Wp).length && dd.every(function (kk) { return Wp[kk]; })) { var q0 = null, same = dd.every(function (kk) { var r0 = (D[kk].c[0] / D[kk].c[1]) / (Wp[kk].c[0] / Wp[kk].c[1]); if (q0 == null) q0 = r0; return near(q0, r0); }); if (same) return wrong(alts[i][1], alts[i][2]); } }
      return wrong('gf-sym', 'Start from ' + t('y=' + pv + 'x+' + qv) + ' and subtract ' + t('y') + ' from both sides.');
    };
  }

  /* MC helpers */
  function mc(r, prompt, opts, sol, hints, text, keep) { return B.mc(r, prompt, opts, sol, hints, text, keep); }
  function mc3(r, prompt, opts, sol, hints, text) { var p = B.mc(r, prompt, opts, sol, hints, text, false); p.tries = 1; p.input.columns = 3; return p; }
  function numPart(prompt, ans, diag, sol, hints, text, inp) { return B.number(prompt, ans, diag, sol, hints, text, inp); }

  /* ---------------- question makers ---------------- */
  /* Q2/Q3-style lines */
  function q2a(r) { var c = r.int(5, 20); return [1, 1, -c]; }
  function q2b(r, neg) { // Ax − By ± C, B | C, slope A/B a fraction (> 1 when big)
    return pickWhere(function () { var Bc = r.pick([2, 3, 4, 5]), A = r.int(2, 9), k = r.int(2, 9); return [A, -Bc, (neg ? -1 : 1) * Bc * k]; }, function (L3) { return cop(L3[0], -L3[1]) && L3[0] !== -L3[1] && (!neg || L3[0] > -L3[1]); });
  }

  function q8shared(r) {
    var o = pickWhere(function () {
      var s1 = r.pick([[2, 3], [3, 4], [1, 2], [3, 2], [1, 4]]), e = r.pick([[3, 2], [5, 2], [4, 3], [5, 3], [3, 4], [5, 4]]);
      var cp = r.pick([[7, 3], [5, 2], [4, 3], [5, 3], [7, 2], [6, 5]]);
      var k = r.int(3, 6), y3 = r.pick([-2, -3, -1, 2]), j = r.int(2, 6), f = r.int(2, 5), g = r.int(2, 5), ms = r.int(2, 5), bB = -r.int(3, 7);
      var lines = [red(s1[0] / s1[1], -1, e[0] / e[1]), red(cp[1] / cp[0], -1, 0), red(-1 / k, -1, y3), red(1 / j, -1, f), red(ms, -1, -ms * g)];
      var ch = [{ id: 'A', html: 'Slope ' + t('=' + fT(-1 / k)), test: function (L3) { return near(-L3[0] / L3[1], -1 / k); } },
        { id: 'B', html: t('y') + '-intercept ' + t('=' + bB), test: function (L3) { return near(-L3[2] / L3[1], bB); } },
        { id: 'C', html: 'Passes through ' + t(pT(cp)), test: function (L3) { return near(valAt(L3[0], L3[1], L3[2], cp), 0); } },
        { id: 'D', html: 'Slope ' + t('=0'), test: function (L3) { return near(L3[0], 0); } },
        { id: 'E', html: t('y') + '-intercept ' + t('=' + fT(e[0] / e[1])), test: function (L3) { return near(-L3[2] / L3[1], e[0] / e[1]); } },
        { id: 'F', html: t('y') + '-intercept ' + t('=' + f), test: function (L3) { return near(-L3[2] / L3[1], f); } },
        { id: 'G', html: t('x') + '-intercept ' + t('=' + g), test: function (L3) { return L3[0] !== 0 && near(-L3[2] / L3[0], g); } }];
      return { lines: lines, ch: ch, cp: cp, own: ['E', 'C', 'A', 'F', 'G'] };
    }, function (o) {
      return o.lines.every(function (L3, i) { var hit = o.ch.filter(function (c) { return c.test(L3); }).map(function (c) { return c.id; }); return hit.length === 1 && hit[0] === o.own[i]; });
    });
    /* the booklet's letters are E, C, A, F, G for (i)–(v); shuffle the labels so the right letter isn't fixed per part */
    var labels = r.shuffle(['A', 'B', 'C', 'D', 'E', 'F', 'G']), byKind = {};
    o.ch.forEach(function (c, i) { c.kind = c.id; c.id = labels[i]; byKind[c.kind] = c.id; });
    o.ch.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    o.ownKind = o.own; o.own = o.own.map(function (k) { return byKind[k]; });
    o.unused = [byKind.B, byKind.D].sort();
    return o;
  }
  var Q8IDS = ['i', 'ii', 'iii', 'iv', 'v'];
  function q8stem(o) { return 'Match each equation with the correct characteristic of its graph. Each characteristic (A–G) may be used once, more than once, or not at all.'; }
  function q8part(o, i) {
    var L3 = o.lines[i], own = o.own[i], ownK = o.ownKind[i], m = -L3[0] / L3[1], b = -L3[2] / L3[1], id = Q8IDS[i], how;
    if (ownK === 'C') how = 'substitute ' + t(pT(o.cp)) + ': ' + t(L3[0] + '(' + o.cp[0] + ')' + (L3[1] < 0 ? '-' : '+') + Math.abs(L3[1]) + '(' + o.cp[1] + ')=0') + ', so the point is on the line';
    else if (ownK === 'G') how = t(siT(m, b)) + '; set ' + t('y=0') + ': ' + t(lin([[L3[0], 'x'], [L3[2], '']]) + '=0') + ', so the ' + t('x') + '-intercept is ' + t(fT(-L3[2] / L3[0]));
    else how = t(rT(L3)) + ' → ' + t(siT(m, b)) + ': slope ' + t(fT(m)) + ', ' + t('y') + '-intercept ' + t(fT(b));
    var kind = { A: 'slope', B: 'yint', C: 'pt', D: 'slope', E: 'yint', F: 'yint', G: 'xint' };
    var whyOf = function (c) {
      var k = kind[c.kind];
      if (k === 'slope') return 'Solve for ' + t('y') + ' and check the slope again — it doesn’t match ' + c.id + '.';
      if (k === 'yint') return 'Set ' + t('x=0') + ' and check the ' + t('y') + '-intercept again — it doesn’t match ' + c.id + '.';
      if (k === 'pt') return 'Substitute ' + t(pT(o.cp)) + ' into the left side: you don’t get ' + t('0') + '.';
      return 'Set ' + t('y=0') + ' and check the ' + t('x') + '-intercept again — it doesn’t match ' + c.id + '.';
    };
    var options = o.ch.map(function (c) { return { key: c.id, html: c.html, right: c.id === own, why: c.id === own ? null : whyOf(c), code: 'opt' + c.id }; });
    var right = options.filter(function (x) { return x.right; })[0];
    return { prompt: '(' + id + ') ' + t(rT(L3)), input: { type: 'mc', options: options },
      check: function (resp) { if (!resp) return form('empty', 'Choose an answer.'); if (resp === own) return ok(); var op = options.filter(function (x) { return x.key === resp; })[0]; return wrong('mc-' + (op ? op.code : 'x'), op && op.why ? op.why : null); },
      key: own, answer: HW.tex(right.key + '. ' + right.html), solution: how + ' — <b>' + own + '</b>.' + (i === 4 ? '<br>(Characteristics ' + o.unused[0] + ' and ' + o.unused[1] + ' are not used by any equation.)' : ''),
      hints: ['Solve the equation for ' + t('y') + ' to read its slope and ' + t('y') + '-intercept; set ' + t('y=0') + ' for the ' + t('x') + '-intercept; substitute a point to test it.'], text: 'match characteristic: ' + rT(L3), tries: 3 };
  }

  /* ================= Extra practice (u7_EP03.tex) ================= */
  function twoPts(r, neg) {
    return pickWhere(function () { var q = r.int(2, 5), p = r.int(1, 5), k = 2, x1 = r.int(-6, 6), y1 = r.int(-6, 6); return { p: neg ? -p : p, q: q, k: k, x1: x1, y1: y1 }; },
      function (o) { var x2 = o.x1 + o.q * o.k, y2 = o.y1 + o.p * o.k; return cop(Math.abs(o.p), o.q) && Math.abs(o.p) !== o.q && Math.abs(x2) <= 10 && Math.abs(y2) <= 10; });
  }
  function twoPtPart(r, neg) {
    var o = twoPts(r, neg), P1 = [o.x1, o.y1], P2 = [o.x1 + o.q * o.k, o.y1 + o.p * o.k], m = o.p / o.q, b = o.y1 - m * o.x1;
    var dy = P2[1] - P1[1], dx = P2[0] - P1[0];
    return lineGen('Through ' + t(pT(P1)) + ' and ' + t(pT(P2)), { m: [o.p, o.q], point: P1 }, [], t('m=\\frac{' + P2[1] + '-' + sgp(P1[1]) + '}{' + P2[0] + '-' + sgp(P1[0]) + '}=\\frac{' + dy + '}{' + dx + '}=' + fT(m)) + '.<br>' + t('y=mx+b') + ' through ' + t(pT(P1)) + ': ' + t(P1[1] + '=' + fT(m) + '(' + P1[0] + ')+b') + ', so ' + t('b=' + fT(b)) + ' and ' + t(siT(m, b)) + '.<br>' + toGenSol(toFr(m), toFr(b)),
      ['Find the slope ' + t('\\frac{y_2-y_1}{x_2-x_1}') + ' first (reduce it), then use one point to find ' + t('b') + ' (or use slope–point form).', 'Clear the fractions and move every term to one side.'], 'general form through two points', { point: P1, bad: [gen({ m: [o.q, o.p], point: P1 }), gen({ m: [-o.p, o.q], point: P1 })] });
  }
  function interceptPts(r, signs) { return pickWhere(function () { return { a: r.pick(pm(2, 8)), b: r.pick(pm(2, 8)) }; }, function (o) { return Math.abs(o.a) !== Math.abs(o.b) && (!signs || (o.a < 0 && o.b > 0)); }); }
  function cBox(v, diag) { return K.number(v, diag); }
  var opposite = function (x) { return x === 'x' ? 'y' : 'x'; };

  /* EP 8 pairs */
  function pairMaker(r, kind) {
    var o = pickWhere(function () { return { a: r.int(1, 7), b: r.int(2, 7), s: r.pick([2, 3]), s2: r.pick([2, 3, 4]), c: r.pick(pm(1, 9)), d: r.pick(pm(1, 12)) }; },
      function (o) { return cop(o.a, o.b) && o.a !== o.b && o.s !== o.s2; });
    var L1, L2;
    if (kind === 'par') { L1 = [o.a, -o.b, o.c]; L2 = [o.s * o.a, -o.s * o.b, o.d === o.s * o.c ? o.d + 1 : o.d]; }
    else if (kind === 'perp') { L1 = [o.a, o.b, -Math.abs(o.c)]; L2 = [o.b, -o.a, o.d]; }
    else if (kind === 'par2') { L1 = [o.s * o.a, -o.s * o.b, o.c]; L2 = [o.s2 * o.a, -o.s2 * o.b, o.d * o.s === o.c * o.s2 ? o.d + 1 : o.d]; }
    else if (kind === 'perp2') { L1 = [o.a, o.b, -Math.abs(o.c)]; L2 = [o.s * o.b, -o.s * o.a, o.d]; }
    else if (kind === 'swap') { L1 = [o.a === 1 ? 7 : o.a, o.b, o.c]; L2 = [o.b, o.a === 1 ? 7 : o.a, o.d]; if (L1[0] === L1[1]) L1[0]++; L2[1] = L1[0]; }
    else { L1 = [o.a, -o.b, o.c]; L2 = [o.s * o.a, -o.s * o.b, o.s * o.c]; }
    return [L1, L2];
  }
  function slopeOf(L3) { return -L3[0] / L3[1]; }
  function classPart(r, kind) {
    var pr = pairMaker(r, kind), L1 = pr[0], L2 = pr[1], m1 = slopeOf(L1), m2 = slopeOf(L2);
    var right = near(m1, m2) ? 'par' : near(m1 * m2, -1) ? 'perp' : 'none';
    var sm = function (L3) { return t('-\\frac{' + L3[0] + '}{' + sgp(L3[1]) + '}=' + fT(slopeOf(L3))); };
    var sol = 'Slopes: ' + sm(L1) + ' and ' + sm(L2) + '.<br>' + (right === 'par' ? 'Equal slopes: <b>parallel</b>.' + (kind === 'same' ? ' (In fact every coefficient of the second equation, ' + t('C') + ' included, is ' + t(L2[0] / L1[0]) + ' times the first — they are the <b>same line</b>.)' : '') : right === 'perp' ? t('(' + fT(m1) + ')(' + fT(m2) + ')=-1') + ': <b>perpendicular</b>.' : 'Not equal, and ' + t('(' + fT(m1) + ')(' + fT(m2) + ')=' + fT(m1 * m2) + '\\ne -1') + ': <b>neither</b>.');
    return mc3(r, t(gT(L1[0], L1[1], L1[2])) + ' &nbsp;and&nbsp; ' + t(gT(L2[0], L2[1], L2[2])), [
      { html: 'Parallel', right: right === 'par', why: 'Compare the slopes ' + t('-\\frac{A}{B}') + ': they aren’t equal.' },
      { html: 'Perpendicular', right: right === 'perp', why: right === 'par' ? 'The slopes are equal, so the lines are parallel.' : 'Multiply the slopes: the product is ' + t(fT(m1 * m2)) + ', not ' + t('-1') + '. Perpendicular slopes have opposite signs <b>and</b> are reciprocals.' },
      { html: 'Neither', right: right === 'none', why: right === 'par' ? 'Work out both slopes ' + t('-\\frac{A}{B}') + ' and reduce them: they are equal.' : 'Multiply the slopes: ' + t('(' + fT(m1) + ')(' + fT(m2) + ')=-1') + '.' }],
      sol, ['Write ' + t('-\\frac{A}{B}') + ' for each line and reduce. Equal → parallel; product ' + t('-1') + ' → perpendicular.'], 'classify pair ' + kind);
  }

  var EXTRA = [
    { num: '1', section: 'Extra practice A — Into general form', stem: 'Convert the equation to general form, ' + t('Ax+By+C=0') + ', with integer ' + t('A') + ', ' + t('B') + ', ' + t('C') + ' and ' + t('A>0') + '.', parts: [
      { id: 'e1a', level: 'BEG', make: function (r) { return convPart(null, [r.int(2, 9), 1], [-r.int(2, 9), 1]); } },
      { id: 'e1b', level: 'EMG', make: function (r) { var q = r.int(2, 5), p = pickWhere(function () { return r.int(1, 2 * q); }, function (p) { return cop(p, q) && p !== q; }); return convPart(null, [-p, q], [r.int(2, 9), 1]); } },
      { id: 'e1c', level: 'PRG', make: function (r) { var o = pickWhere(function () { var q = r.pick([2, 3, 4]), s = q * r.pick([2, 3]); return { q: q, s: s, p: r.int(1, 2 * q), rr: r.int(1, s - 1) }; }, function (o) { return o.s <= 12 && cop(o.p, o.q) && cop(o.rr, o.s) && o.p !== o.q; }); return convPart(null, [o.p, o.q], [-o.rr, o.s]); } },
      { id: 'e1d', level: 'PRG', make: function (r) { var o = pickWhere(function () { var q = r.pick([2, 3]), s = q * r.pick([2, 3]); return { q: q, s: s, p: r.int(1, 3 * q), rr: r.int(1, 2 * s - 1) }; }, function (o) { return cop(o.p, o.q) && cop(o.rr, o.s) && o.p !== o.q; }); return convPart(null, [-o.p, o.q], [-o.rr, o.s]); } },
      { id: 'e1e', level: 'PRG', make: function (r) { var o = pickWhere(function () { var dd = r.pick([[3, 2], [2, 3], [5, 2], [4, 3], [3, 4], [2, 5]]); return { q: dd[0], s: dd[1], p: r.int(1, 9), rr: r.int(1, 4) }; }, function (o) { return cop(o.p, o.q) && cop(o.rr, o.s) && o.p !== o.q; }); return convPart(null, [o.p, o.q], [o.rr, o.s]); } },
      { id: 'e1f', level: 'EMG', make: function (r) { var s = r.int(2, 7), rr = pickWhere(function () { return r.int(1, 2 * s); }, function (v) { return cop(v, s); }); return convPart(null, [-1, 1], [rr, s]); } },
      { id: 'e1g', level: 'EMG', make: function (r) {
        var m = r.int(2, 9), b = -r.int(2, 9), att = lin([[-m, 'x'], [1, 'y'], [-b, '']]) + '=0';
        return mc(r, 'Converting ' + t(siT(m, b)) + ', a student leaves ' + t('y') + ' where it is and slides the ' + t('x') + '-term across, getting ' + t(att) + ', so ' + t('A=' + (-m)) + '. Which statement is correct?', [
          { html: 'Multiply every term by ' + t('-1') + ': ' + t(gT(m, -1, b)) + '. This can’t change which points are on the line, because the right side is ' + t('0') + ' and ' + t('-1\\times 0=0') + '.', right: true },
          { html: 'Change the sign of the ' + t('x') + '-term only: ' + t(gT(m, 1, -b)) + '.', why: 'Changing the sign of one term gives a different equation — a different line. Every term must change.' },
          { html: 'Nothing needs fixing: it’s a true equation of the line, so it is in general form.', why: 'It is a true equation of the line, but general form also needs ' + t('A>0') + '.' },
          { html: 'Multiply every term by ' + t('-1') + '; this moves the line, so the slope must be worked out again.', why: 'Multiplying both sides of an equation by a non-zero number keeps exactly the same solutions, so the line doesn’t move.' }],
          'First attempt: ' + t(att) + ' has ' + t('A=' + (-m)) + '. Multiply every term by ' + t('-1') + ': ' + t(gT(m, -1, b)) + '. Both sides are multiplied by ' + t('-1') + ' and ' + t('-1\\times 0=0') + ', so exactly the same points satisfy it.', ['What does general form require of ' + t('A') + '? What does multiplying by ' + t('-1') + ' do to the right side?'], 'repair a negative A');
      } },
      { id: 'e1h', level: 'EMG', make: function (r) {
        var o = pickWhere(function () { var q = r.pick([2, 3, 4]), s = q * r.pick([2, 3]); return { q: q, s: s, p: r.int(1, 2 * q), rr: r.int(1, s - 1) }; }, function (o) { return o.s <= 12 && cop(o.p, o.q) && cop(o.rr, o.s) && o.p !== o.q; });
        var eqT = siT(o.p / o.q, -o.rr / o.s), bad = siT(o.p * o.s / o.q, -o.rr);
        return mc(r, 'To clear the fractions in ' + t(eqT) + ', a student multiplies the two fraction terms by ' + t(o.s) + ' and writes ' + t(bad) + '. What is wrong?', [
          { html: '<b>Every</b> term must be multiplied by ' + t(o.s) + ', including ' + t('y') + ': ' + t(o.s + 'y=' + lin([[o.p * o.s / o.q, 'x'], [-o.rr, '']])) + '. Skipping a term gives a different line.', right: true },
          { html: 'Nothing — ' + t('y') + ' has no fraction, so it doesn’t need to be multiplied.', why: 'Both sides of an equation must be multiplied by the same number. ' + t(bad) + ' is a different line (its slope is ' + t(fT(o.p * o.s / o.q)) + ').' },
          { html: 'The common denominator should be ' + t(o.q) + ', not ' + t(o.s) + '.', why: 'Multiplying by ' + t(o.q) + ' leaves ' + t(fT(-o.rr * o.q / o.s)) + ' — a fraction. ' + t(o.s) + ' clears both denominators.' },
          { html: 'Only the constant should be multiplied by ' + t(o.s) + '.', why: 'Every term must be multiplied, or the two sides are no longer equal for the same points.' }],
          'Multiply <b>every</b> term by ' + t(o.s) + ': ' + t(o.s + 'y=' + lin([[o.p * o.s / o.q, 'x'], [-o.rr, '']])) + ', so ' + t(gen({ m: [o.p, o.q], b: [-o.rr, o.s] })) + '. If one term is skipped, the two sides are multiplied by different numbers and the equation describes a different line.', ['An equation stays equivalent only if <b>both sides</b> (every term) are multiplied by the same number.'], 'why multiply every term');
      } }] },
    { num: '2', stem: 'Determine the equation of the line in general form.', parts: [
      { id: 'e2a', level: 'EMG', outcome: 'RF7', make: function (r) {
        var q = r.int(2, 6), p = pickWhere(function () { return r.int(1, 2 * q); }, function (p) { return cop(p, q) && p !== q; }), b = r.pick(pm(2, 9));
        return lineGen('Slope ' + t(fT(-p / q)) + ', ' + t('y') + '-intercept ' + t('(0,\\ ' + b + ')'), { m: [-p, q], b: b }, [], t(siT(-p / q, b)) + '. ' + toGenSol([-p, q], [b, 1]), null, 'general form from m and b', { bad: [gen({ m: [p, q], b: b }), gen({ m: [-p, q], b: -b })] });
      } },
      { id: 'e2b', level: 'PRG', outcome: 'RF7', make: function (r) { return twoPtPart(r, false); } },
      { id: 'e2c', level: 'PRG', outcome: 'RF7', make: function (r) {
        var o = interceptPts(r, r.chance(0.5)), m = -o.b / o.a;
        return lineGen(t('x') + '-intercept ' + t('(' + o.a + ',\\ 0)') + ', ' + t('y') + '-intercept ' + t('(0,\\ ' + o.b + ')'), { m: toFr(m), b: o.b }, [{ is: { m: toFr(-o.a / o.b), b: o.a }, code: 'gf-swap-ab', hint: 'Your line has the intercepts the wrong way round. The ' + t('x') + '-intercept is where ' + t('y=0') + '.' }],
          t('m=\\frac{' + o.b + '-0}{0-' + sgp(o.a) + '}=' + fT(m)) + ', ' + t('b=' + o.b) + ': ' + t(siT(m, o.b)) + '.<br>' + toGenSol(toFr(m), [o.b, 1]), ['The two intercepts are two points on the line: find the slope between them; the ' + t('y') + '-intercept is ' + t('b') + '.'], 'general form from intercepts', { bad: [gen({ m: toFr(-m), b: o.b })] });
      } },
      { id: 'e2d', level: 'PRG', outcome: 'RF7', make: function (r) { return twoPtPart(r, true); } },
      { id: 'e2e', level: 'EMG', make: function (r) {
        var o = pickWhere(function () { return { a: r.int(2, 9), b: r.int(2, 9) }; }, function (o) { return cop(o.a, o.b); });
        var eqT = '\\frac{x}{' + o.a + '}+\\frac{y}{' + o.b + '}=1';
        return lineGen(t(eqT), { A: o.b, B: o.a, C: -o.a * o.b }, [{ is: { A: o.a, B: o.b, C: -o.a * o.b }, code: 'gf-swap-ab', hint: 'Multiply each fraction by ' + t(o.a * o.b) + ' carefully: ' + t('\\frac{x}{' + o.a + '}\\times ' + o.a * o.b + '=' + o.b + 'x') + ', not ' + t(o.a + 'x') + '.' }],
          'Multiply every term by ' + t(o.a * o.b) + ': ' + t(o.b + 'x+' + o.a + 'y=' + o.a * o.b) + ', so ' + t(gT(o.b, o.a, -o.a * o.b)) + '.', ['Clear both fractions at once: multiply every term (the ' + t('1') + ' too) by ' + t(o.a + '\\times ' + o.b) + '.'], 'general form of intercept form', { bad: [gT(o.a, o.b, -o.a * o.b), gT(o.b, o.a, -1)] });
      } },
      { id: 'e2f', level: 'PRG', make: function (r) {
        var o = pickWhere(function () { return { q: r.int(2, 6), p: r.int(1, 9), x1: -r.int(1, 6), y1: r.int(1, 6) }; }, function (o) { return cop(o.p, o.q) && o.p !== o.q; });
        var eqT = 'y-' + o.y1 + '=\\frac{' + o.p + '}{' + o.q + '}(x+' + (-o.x1) + ')', Cc = o.q * o.y1 - o.p * o.x1;
        return lineGen(t(eqT), { m: [o.p, o.q], point: [o.x1, o.y1] }, [{ is: { m: [o.p, o.q], point: [-o.x1, o.y1] }, code: 'gf-point-sign', hint: 'Expand ' + t('(x+' + (-o.x1) + ')') + ' with a plus sign: ' + t(o.p + '(x+' + (-o.x1) + ')=' + o.p + 'x+' + o.p * -o.x1) + '.' }, { is: { m: [o.p, o.q], point: [o.x1, -o.y1] }, code: 'gf-point-sign', hint: 'Check the sign of the constant on the left: ' + t(o.q + '(y-' + o.y1 + ')=' + o.q + 'y-' + o.q * o.y1) + '.' }],
          'Multiply every term by ' + t(o.q) + ': ' + t(o.q + '(y-' + o.y1 + ')=' + o.p + '(x+' + (-o.x1) + ')') + ' → ' + t(o.q + 'y-' + o.q * o.y1 + '=' + o.p + 'x+' + (-o.p * o.x1)) + '.<br>Gather on the side with the ' + t('x') + '-term: ' + t(gT(o.p, -o.q, Cc)) + '.', ['Multiply both sides by ' + t(o.q) + ' first, expand the brackets, then gather every term on one side.'], 'general form of slope-point form', { bad: [gen({ m: [o.p, o.q], point: [-o.x1, o.y1] })] });
      } },
      { id: 'e2g', level: 'BEG', outcome: 'RF5', make: function (r) {
        var o = pickWhere(function () { return { a: r.pick(pm(2, 9)), b: r.pick(pm(2, 9)) }; }, function (o) { return Math.abs(o.a) !== Math.abs(o.b) && (o.a > 0 || o.b > 0); });
        var eqT = '\\frac{x}{' + o.a + '}+\\frac{y}{' + o.b + '}=1', xp = [o.a, 0], yp = [0, o.b];
        var p = B.fields('The equation ' + t(eqT) + ' is in <b>intercept form</b>. Read both intercepts straight off it, as ordered pairs.', [{ label: t('x') + '-intercept:', name: 'x-intercept', mode: 'math', keys: 'pairs' }, { label: t('y') + '-intercept:', name: 'y-intercept', mode: 'math', keys: 'pairs' }],
          [ptBox(xp, yp, 'x'), ptBox(yp, xp, 'y')], [pK(xp), pK(yp)], t('x') + '-intercept ' + t(pT(xp)) + ', ' + t('y') + '-intercept ' + t(pT(yp)),
          'In ' + t('\\frac{x}{a}+\\frac{y}{b}=1') + ' the denominators <b>are</b> the intercepts: ' + t('y=0') + ' gives ' + t('\\frac{x}{' + o.a + '}=1') + ', so ' + t('x=' + o.a) + '; ' + t('x=0') + ' gives ' + t('y=' + o.b) + '.', ['Set ' + t('y=0') + ': what must ' + t('x') + ' be to make the left side ' + t('1') + '?'], 'intercepts of intercept form');
        p.bad = [[pK(yp), pK(xp)]];
        return p;
      } }] },
    { num: '3', section: 'Extra practice B — Out of general form', stem: 'Determine the slope, the ' + t('x') + '-intercept and the ' + t('y') + '-intercept. Give both intercepts as ordered pairs.', parts: [
      { id: 'e3a', level: 'PRG', outcome: 'RF5', make: function (r) { var o = pickWhere(function () { return { A: r.int(2, 7), Bc: r.int(2, 7), k: r.pick([1, 1, 2]) }; }, function (o) { return cop(o.A, o.Bc) && o.A * o.Bc * o.k <= 60; }); return mPtsFields(t(gT(o.A, -o.Bc, o.A * o.Bc * o.k)), o.A, -o.Bc, o.A * o.Bc * o.k); } },
      { id: 'e3b', level: 'EMG', outcome: 'RF5', make: function (r) { var o = pickWhere(function () { return { A: r.int(2, 7), Bc: r.int(2, 9), k: r.pick([1, 1, 2]) }; }, function (o) { return cop(o.A, o.Bc) && o.A * o.Bc * o.k <= 60; }); return mPtsFields(t(gT(o.A, o.Bc, -o.A * o.Bc * o.k)), o.A, o.Bc, -o.A * o.Bc * o.k); } },
      { id: 'e3c', level: 'PRG', outcome: 'RF5', make: function (r) { var o = pickWhere(function () { return { A: r.int(2, 9), Bc: r.int(2, 5), C: r.int(2, 11) }; }, function (o) { return cop(o.A, o.Bc) && cop(o.C, o.A) && cop(o.C, o.Bc); }); return mPtsFields(t(gT(o.A, -o.Bc, -o.C)), o.A, -o.Bc, -o.C); } },
      { id: 'e3d', level: 'PRG', outcome: 'RF5', make: function (r) {
        var o = pickWhere(function () { return { a: r.int(1, 5), b: r.int(2, 5), k: r.int(2, 6), g: r.pick([2, 3]) }; }, function (o) { return cop(o.a, o.b) && o.a !== o.b && (o.a * o.k) % o.b !== 0; });
        var A = o.g * o.a, Bc = o.g * o.b, C = o.g * o.a * o.k;
        return mPtsFields(t(gT(A, Bc, C)), A, Bc, C, { note: '(Dividing every term by ' + t(o.g) + ' first, ' + t(gT(o.a, o.b, o.a * o.k)) + ', gives the same answers.)' });
      } },
      { id: 'e3e', level: 'EMG', outcome: 'RF5', make: function (r) { var o = pickWhere(function () { return { A: r.pick([1, 1, 2, 3]), Bc: r.int(2, 7) }; }, function (o) { return cop(o.A, o.Bc) && o.A !== o.Bc; }); return mPtsFields(t(gT(o.A, -o.Bc, 0)), o.A, -o.Bc, 0, { note: 'Both intercepts are the origin: with ' + t('C=0') + ' the line passes through ' + t('(0,\\ 0)') + '.' }); } },
      { id: 'e3f', level: 'PRG', outcome: 'RF5', make: function (r) { var o = pickWhere(function () { return { A: r.int(2, 9), Bc: r.int(2, 7), C: r.int(1, 6) }; }, function (o) { return cop(o.A, o.Bc) && o.C % o.A !== 0 && o.C % o.Bc !== 0; }); return mPtsFields(t(gT(o.A, o.Bc, -o.C)), o.A, o.Bc, -o.C); } }] },
    { num: '4', stem: 'Compare the two routes out of general form: solve for ' + t('y') + ' (route 1), or stay in general form — ' + t('m=-\\frac{A}{B}') + ', then set ' + t('y=0') + ' and ' + t('x=0') + ' (route 2).', parts: [
      { id: 'e4a', level: 'EMG', make: function (r) {
        var o = pickWhere(function () { return { A: r.int(2, 7), Bc: r.int(2, 9), k: r.int(2, 5) }; }, function (o) { return cop(o.A, o.Bc); });
        var C = o.Bc * o.k;
        return mc(r, 'Solving ' + t(gT(o.A, o.Bc, -C)) + ' for ' + t('y') + ' takes one division and gives a whole-number ' + t('y') + '-intercept: ' + t(siT(-o.A / o.Bc, o.k)) + '. Which feature of the numbers makes route 1 quick here?', [
          { html: 'The constant ' + t(C) + ' is a multiple of the ' + t('y') + '-coefficient ' + t(o.Bc) + '.', right: true },
          { html: 'The ' + t('x') + '-coefficient is smaller than the ' + t('y') + '-coefficient.', why: 'The size of ' + t('A') + ' doesn’t matter. What matters is whether dividing by ' + t('B') + ' leaves fractions.' },
          { html: 'All the coefficients are positive.', why: 'Signs don’t decide which route is faster.' },
          { html: 'The slope is a whole number.', why: 'Here the slope is ' + t(fT(-o.A / o.Bc)) + '. Look at the constant instead.' }],
          t(o.Bc + 'y=-' + o.A + 'x+' + C) + ' → ' + t(siT(-o.A / o.Bc, o.k)) + ': because ' + t(C + '\\div ' + o.Bc + '=' + o.k) + ', the ' + t('y') + '-intercept comes out whole and ' + t('m') + ' and ' + t('b') + ' arrive together.', ['What do you divide by when you solve for ' + t('y') + '? Which number divides evenly?'], 'when solving for y is quick');
      } },
      { id: 'e4b', level: 'EMG', make: function (r) {
        var o = pickWhere(function () { return { A: r.int(2, 9), Bc: r.int(2, 5), C: r.int(2, 11) }; }, function (o) { return cop(o.A, o.Bc) && cop(o.C, o.A) && cop(o.C, o.Bc); });
        return mc(r, 'For ' + t(gT(o.A, -o.Bc, -o.C)) + ', why is route 2 (staying in general form) quicker than solving for ' + t('y') + '?', [
          { html: t('B=' + (-o.Bc)) + ' divides neither ' + t('A') + ' nor ' + t('C') + ', so solving for ' + t('y') + ' gives fractions that you would have to work with again to find the ' + t('x') + '-intercept.', right: true },
          { html: 'Route 2 is always quicker.', why: 'Not always — when ' + t('C') + ' (and ' + t('A') + ') are multiples of ' + t('B') + ', solving for ' + t('y') + ' is just as quick.' },
          { html: 'Solving for ' + t('y') + ' would give a different slope.', why: 'Both routes always give the same slope and intercepts — they only differ in speed.' },
          { html: 'This equation can’t be solved for ' + t('y') + '.', why: 'It can (' + t(siT(o.A / o.Bc, -o.C / o.Bc)) + '); it just gives fractions.' }],
          'Route 1 gives ' + t(siT(o.A / o.Bc, -o.C / o.Bc)) + ' — two fractions to carry into the ' + t('x') + '-intercept. Route 2: ' + t('m=-\\frac{' + o.A + '}{' + (-o.Bc) + '}=' + fT(o.A / o.Bc)) + ', and ' + t('y=0') + ' gives ' + t(o.A + 'x-' + o.C + '=0') + ' in one step.', ['When does dividing by ' + t('B') + ' leave fractions?'], 'when general form is quicker');
      } },
      { id: 'e4c', level: 'EMG', outcome: 'RF5', make: function (r) {
        var A = r.pick([1, 2, 3]), Bc = pickWhere(function () { return r.int(2, 7); }, function (v) { return cop(A, v) && v !== A; });
        return mc(r, 'In ' + t(gT(A, -Bc, 0)) + ' both intercepts land on the same point. What does ' + t('C=0') + ' always tell you about a line ' + t('Ax+By+C=0') + '?', [
          { html: 'It passes through the origin, ' + t('(0,\\ 0)') + '.', right: true },
          { html: 'It is horizontal.', why: 'A horizontal line has ' + t('A=0') + ' (no ' + t('x') + '-term). This line has slope ' + t(fT(A / Bc)) + '.' },
          { html: 'Its slope is ' + t('0') + '.', why: 'The slope is ' + t('-\\frac{A}{B}') + '; ' + t('C') + ' doesn’t affect it.' },
          { html: 'It has no ' + t('y') + '-intercept.', why: 'It does: substitute ' + t('x=0') + ' — you get ' + t('y=0') + '.' }],
          'Substitute ' + t('(0,\\ 0)') + ': ' + t('A(0)+B(0)+0=0') + ' ✓. So a line with ' + t('C=0') + ' always passes through the origin, and both intercepts are ' + t('(0,\\ 0)') + '. (The intercept formulas ' + t('-\\frac{C}{A}') + ' and ' + t('-\\frac{C}{B}') + ' both give ' + t('0') + '.)', ['Substitute ' + t('x=0') + ' and ' + t('y=0') + ' into ' + t('Ax+By+0=0') + '.'], 'meaning of C = 0');
      } },
      { id: 'e4d', level: 'BEG', make: function (r) {
        var o = pickWhere(function () { return { a: r.int(1, 5), b: r.int(2, 5), k: r.int(2, 6), g: r.pick([2, 3, 4]) }; }, function (o) { return cop(o.a, o.b) && o.a !== o.b; });
        var A = o.g * o.a, Bc = o.g * o.b, C = o.g * o.a * o.k;
        return lineGen('In ' + t(gT(A, Bc, C)) + ' all three coefficients share a common factor. Divide it out and write the equation in general form, in lowest terms.', { A: A, B: Bc, C: C }, [],
          'Divide every term by ' + t(o.g) + ': ' + t(gT(o.a, o.b, o.a * o.k)) + '.<br>The line doesn’t change: dividing every coefficient by the same number keeps their ratios, so the slope ' + t(fT(-o.a / o.b)) + ' and both intercepts stay the same.', ['Find the largest number that divides ' + t(A) + ', ' + t(Bc) + ' and ' + t(C) + '.'], 'remove common factor', { bad: [gT(A, Bc, C)] });
      } }] },
    { num: '5', stem: 'The direct route deserves formulas of its own.', parts: [
      { id: 'e5a', level: 'PRG', outcome: 'RF5', make: function (r) {
        return mc(r, 'Starting from ' + t('Ax+By+C=0') + ', substitute ' + t('y=0') + ' and solve for ' + t('x') + '; then substitute ' + t('x=0') + ' and solve for ' + t('y') + '. Which formulas do you get?', [
          { html: t('x') + '-intercept ' + t('-\\frac{C}{A}') + ', ' + t('y') + '-intercept ' + t('-\\frac{C}{B}'), right: true },
          { html: t('x') + '-intercept ' + t('-\\frac{C}{B}') + ', ' + t('y') + '-intercept ' + t('-\\frac{C}{A}'), why: 'Setting ' + t('y=0') + ' removes the ' + t('By') + ' term, leaving ' + t('Ax+C=0') + ' — so the ' + t('x') + '-intercept is divided by ' + t('A') + '.' },
          { html: t('x') + '-intercept ' + t('\\frac{C}{A}') + ', ' + t('y') + '-intercept ' + t('\\frac{C}{B}'), why: 'Check the sign: ' + t('Ax+C=0') + ' gives ' + t('Ax=-C') + '.' },
          { html: t('x') + '-intercept ' + t('-\\frac{A}{C}') + ', ' + t('y') + '-intercept ' + t('-\\frac{B}{C}'), why: t('Ax=-C') + ': divide both sides by ' + t('A') + ', not by ' + t('C') + '.' }],
          t('y=0') + ': ' + t('Ax+C=0\\Rightarrow x=-\\frac{C}{A}') + ' (if ' + t('A\\ne0') + '). &nbsp; ' + t('x=0') + ': ' + t('By+C=0\\Rightarrow y=-\\frac{C}{B}') + ' (if ' + t('B\\ne0') + ').', ['Do the algebra with letters exactly as you would with numbers.'], 'intercept formulas');
      } },
      { id: 'e5b', level: 'EMG', outcome: 'RF5', make: function (r) {
        var o = pickWhere(function () { return { A: r.int(2, 9), Bc: -r.int(2, 6), k: r.pick([1, 1, 2]) }; }, function (o) { return cop(o.A, -o.Bc) && -o.A * o.Bc * o.k <= 60; });
        var C = -o.A * o.Bc * o.k, xp = [-C / o.A, 0], yp = [0, -C / o.Bc];
        var p = B.fields('Use the formulas ' + t('x') + '-intercept ' + t('=-\\frac{C}{A}') + ' and ' + t('y') + '-intercept ' + t('=-\\frac{C}{B}') + ' on ' + t(gT(o.A, o.Bc, C)) + '. Give both intercepts as ordered pairs.', [{ label: t('x') + '-intercept:', name: 'x-intercept', mode: 'math', keys: 'pairs' }, { label: t('y') + '-intercept:', name: 'y-intercept', mode: 'math', keys: 'pairs' }],
          [ptBox(xp, yp, 'x'), ptBox(yp, xp, 'y')], [pK(xp), pK(yp)], t('x') + '-intercept ' + t(pT(xp)) + ', ' + t('y') + '-intercept ' + t(pT(yp)),
          t('A=' + o.A + ',\\ B=' + o.Bc + ',\\ C=' + C) + '.<br>' + t('x') + '-int: ' + t('-\\frac{' + C + '}{' + o.A + '}=' + fT(xp[0])) + ', so ' + t(pT(xp)) + '. &nbsp; ' + t('y') + '-int: ' + t('-\\frac{' + C + '}{' + o.Bc + '}=' + fT(yp[1])) + ', so ' + t(pT(yp)) + '.<br>Check: ' + t(o.A + sgp(xp[0]) + (o.Bc < 0 ? '' : '+') + o.Bc + '(0)+' + C + '=0') + ' ✓', ['Read ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' with their signs (here ' + t('B') + ' is negative).'], 'intercept formulas on ' + gT(o.A, o.Bc, C));
        p.bad = [[pK([-xp[0], 0]), pK([0, -yp[1]])]];
        return p;
      } }] },
    { num: '6', section: 'Extra practice C — The missing coefficients', shared: function (r) {
        return pickWhere(function () { return { a: r.int(2, 5), k: r.pick(pm(2, 6)), b: r.pick([2, 3, 4, 2]), d: r.pick(pm(1, 9)) }; }, function (o) { return cop(o.b, Math.abs(o.d)) && Math.abs(o.d) !== 1; });
      },
      stem: function (sh) { return 'Two equations, one letter short each: &nbsp; ' + t('L_1:\\ ' + lin([[sh.a, 'x'], [-sh.a * sh.k, '']]) + '=0') + ' &nbsp;&nbsp; ' + t('L_2:\\ ' + lin([[sh.b, 'y'], [sh.d, '']]) + '=0'); }, parts: [
      { id: 'e6a', level: 'BEG', make: function (r, sh) {
        var ks = [sh.a, 0, -sh.a * sh.k, 0, sh.b, sh.d], lab = ['L_1: A', 'L_1: B', 'L_1: C', 'L_2: A', 'L_2: B', 'L_2: C'];
        var cs = ks.map(function (v, i) { return K.number(v, function (x) { if (v === 0 && x !== 0) return { code: 'gf-zero-B', hint: 'That variable doesn’t appear in the equation, so its coefficient is ' + t('0') + '.' }; if (x === -v) return { code: 'sign', hint: 'Keep the sign that is written in front of the term.' }; return null; }); });
        return B.fields('State ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' for each, reading a missing term as a coefficient of ' + t('0') + '.', lab.map(function (l) { return { label: t(l.replace(': ', ':\\ ')) + ' =', name: l.replace('L_1', 'L₁').replace('L_2', 'L₂') }; }), cs, ks.map(String),
          t('L_1:\\ ' + sh.a + 'x+0y' + (sh.a * sh.k < 0 ? '+' : '-') + Math.abs(sh.a * sh.k) + '=0') + ': ' + t('A=' + sh.a + ',\\ B=0,\\ C=' + (-sh.a * sh.k)) + '<br>' + t('L_2:\\ 0x+' + sh.b + 'y' + (sh.d < 0 ? '-' : '+') + Math.abs(sh.d) + '=0') + ': ' + t('A=0,\\ B=' + sh.b + ',\\ C=' + sh.d),
          'Write each with all three terms: ' + t('L_1:\\ ' + sh.a + 'x+0y' + (sh.a * sh.k < 0 ? '+' : '-') + Math.abs(sh.a * sh.k) + '=0') + ' and ' + t('L_2:\\ 0x+' + sh.b + 'y' + (sh.d < 0 ? '-' : '+') + Math.abs(sh.d) + '=0') + '.', ['A missing term has coefficient ' + t('0') + '. Keep the sign in front of each number.'], 'A, B, C with a missing term');
      } },
      { id: 'e6b', level: 'BEG', make: function (r, sh) {
        var xv = sh.k, yv = -sh.d / sh.b;
        return B.fields('Solve each equation for the variable it contains.', [{ label: t('L_1') + ':', name: 'L₁', mode: 'math', keys: 'fraction', before: t('x=') }, { label: t('L_2') + ':', name: 'L₂', mode: 'math', keys: 'fraction', before: t('y=') }],
          [K.value(xv), K.value(yv)], [fT(xv), fT(yv)], t('x=' + fT(xv)) + ', ' + t('y=' + fT(yv)),
          t('L_1') + ': ' + t(sh.a + 'x=' + sh.a * sh.k) + ', so ' + t('x=' + xv) + ' — a <b>vertical</b> line ' + t(Math.abs(xv)) + ' units ' + (xv > 0 ? 'right' : 'left') + ' of the ' + t('y') + '-axis.<br>' + t('L_2') + ': ' + t(sh.b + 'y=' + (-sh.d)) + ', so ' + t('y=' + fT(yv)) + ' — a <b>horizontal</b> line ' + t(fT(Math.abs(yv))) + ' units ' + (yv > 0 ? 'above' : 'below') + ' the ' + t('x') + '-axis.', ['Move the constant across, then divide by the coefficient.'], 'solve one-variable lines');
      } },
      { id: 'e6c', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
        return B.fields('State the slope of each line, using the correct word where there is no number.', [{ label: t('L_1') + ':', name: 'L₁ slope', mode: 'math', keys: 'slope', before: t('m=') }, { label: t('L_2') + ':', name: 'L₂ slope', mode: 'math', keys: 'slope', before: t('m=') }],
          [K.slope(null), K.slope(0)], ['\\text{undefined}', '0'], t('L_1') + ': undefined; ' + t('L_2') + ': ' + t('0'),
          t('L_1') + ' is vertical (' + t('x=' + sh.k) + '): the run is ' + t('0') + ', so its slope is <b>undefined</b>.<br>' + t('L_2') + ' is horizontal (' + t('y=' + fT(-sh.d / sh.b)) + '): the rise is ' + t('0') + ', so its slope is ' + t('0') + '.', ['Which line is vertical and which is horizontal?'], 'slopes of vertical/horizontal');
      } },
      { id: 'e6d', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
        var yv = -sh.d / sh.b;
        var fl = ['L_1:\\ x', 'L_1:\\ y', 'L_2:\\ x', 'L_2:\\ y'].map(function (l) { return { label: t(l) + '-intercept:', name: l.replace('\\ ', ' ').replace('L_1', 'L₁').replace('L_2', 'L₂') + '-intercept', mode: 'math', keys: 'fraction', none: true }; });
        return B.fields('State every intercept each line has (the value). Press <b>none</b> for an intercept a line doesn’t have.', fl,
          [noneBox(sh.k, 'This line crosses the ' + t('x') + '-axis.'), noneBox(null, t('L_1') + ' is vertical: it is parallel to the ' + t('y') + '-axis and never meets it.'), noneBox(null, t('L_2') + ' is horizontal: it is parallel to the ' + t('x') + '-axis and never meets it.'), noneBox(yv, '')],
          [String(sh.k), 'none', 'none', fT(yv)], t('L_1') + ': ' + t('x') + '-intercept ' + t(sh.k) + ', no ' + t('y') + '-intercept; ' + t('L_2') + ': no ' + t('x') + '-intercept, ' + t('y') + '-intercept ' + t(fT(yv)),
          t('L_1') + ' (' + t('x=' + sh.k) + ') crosses the ' + t('x') + '-axis at ' + t('(' + sh.k + ',\\ 0)') + ' and, being parallel to the ' + t('y') + '-axis, has <b>no</b> ' + t('y') + '-intercept.<br>' + t('L_2') + ' (' + t('y=' + fT(yv)) + ') crosses the ' + t('y') + '-axis at ' + t('(0,\\ ' + fT(yv) + ')') + ' and has <b>no</b> ' + t('x') + '-intercept.', ['A vertical line never meets the ' + t('y') + '-axis (unless it is the axis); a horizontal line never meets the ' + t('x') + '-axis.'], 'intercepts of vertical/horizontal');
      } },
      { id: 'e6e', level: 'EMG', make: function (r, sh) {
        return mc(r, 'Apply ' + t('m=-\\frac{A}{B}') + ' to ' + t('L_1') + '. What happens?', [
          { html: 'You get ' + t('-\\frac{' + sh.a + '}{0}') + ': division by zero has no value — the formula is reporting an <b>undefined</b> slope.', right: true },
          { html: 'You get ' + t('-\\frac{' + sh.a + '}{0}=0') + ', so the slope is ' + t('0') + '.', why: t('\\frac{0}{' + sh.a + '}=0') + ', but ' + t('\\frac{' + sh.a + '}{0}') + ' has no value at all: no number times ' + t('0') + ' gives ' + t(sh.a) + '.' },
          { html: 'You get ' + t('-' + sh.a) + ', since dividing by ' + t('0') + ' leaves the number unchanged.', why: 'That’s dividing by ' + t('1') + '. Division by ' + t('0') + ' is undefined.' },
          { html: 'The formula doesn’t apply because ' + t('L_1') + ' isn’t a line.', why: t('L_1') + ' is a line — a vertical one. The formula correctly signals that its slope is undefined.' }],
          t('L_1') + ': ' + t('m=-\\frac{' + sh.a + '}{0}') + ' — undefined, which is exactly right for a vertical line. ' + t('L_2') + ': ' + t('m=-\\frac{0}{' + sh.b + '}=0') + ' — zero on top is fine, and ' + t('0') + ' is the slope of a horizontal line.', ['What is ' + t('B') + ' for ' + t('L_1') + '? Can you divide by it?'], 'm = −A/B with B = 0');
      } },
      { id: 'e6f', level: 'EMG', make: function (r, sh) {
        var yv = -sh.d / sh.b;
        var p = B.line('Exactly one of ' + t('L_1') + ', ' + t('L_2') + ' can be written in the form ' + t('y=mx+b') + '. Write it in that form.', { y: yv }, { form: 'slope-intercept' },
          t('L_2') + ': ' + t(sh.b + 'y=' + (-sh.d)) + ', so ' + t('y=' + fT(yv)) + ' (that is, ' + t('y=0x' + (yv < 0 ? '' : '+') + fT(yv)) + ').<br>' + t('L_1') + ' has no ' + t('y') + ' at all, so it can’t be solved for ' + t('y') + ' — and no real number ' + t('m') + ' gives an undefined slope.', ['Which equation contains ' + t('y') + '? Solve it for ' + t('y') + '.'], 'horizontal line in y = mx + b');
        p.bad = ['x=' + sh.k, lin([[sh.b, 'y'], [sh.d, '']]) + '=0'];
        return p;
      } },
      { id: 'e6g', level: 'PRG', make: function (r) {
        return mc(r, 'Complete the sentence: “Every line in the plane can be written in ____ form, but only ____ lines can be written in ' + t('y=mx+b') + ' form.”', [
          { html: '<b>general</b> … <b>non-vertical</b>', right: true },
          { html: '<b>slope–intercept</b> … <b>non-horizontal</b>', why: 'A vertical line has no ' + t('y') + ' to solve for, so slope–intercept form can’t hold every line. Horizontal lines are fine: ' + t('y=0x+b') + '.' },
          { html: '<b>general</b> … <b>non-horizontal</b>', why: 'A horizontal line can be written ' + t('y=0x+b') + '. It is the vertical lines (slope undefined) that have no ' + t('y=mx+b') + ' form.' },
          { html: '<b>general</b> … <b>those through the origin</b>', why: t('y=mx+b') + ' allows any ' + t('b') + '. The only lines it misses are the vertical ones.' }],
          'General form allows ' + t('B=0') + ', which gives a vertical line such as ' + t('x-4=0') + '. In ' + t('y=mx+b') + ' that would need an undefined slope, but ' + t('m') + ' must be a real number — so vertical lines can’t be written in ' + t('y=mx+b') + ' form.', ['Which kind of line has no slope that ' + t('m') + ' could equal?'], 'general vs slope-intercept');
      } },
      { id: 'e6h', sub: 'h(i)', level: 'EMG', outcome: 'RF7', make: function (r) {
        var x0 = r.pick(pm(2, 7)), y0 = r.pick(pm(2, 7)), keyTex = gen({ x: x0 });
        return lineGen('Write, in general form, the <b>vertical</b> line through ' + t(pT([x0, y0])) + '.', { x: x0 }, [], 'Every point has ' + t('x=' + x0) + ', so the line is ' + t('x=' + x0) + '. In general form: ' + t(keyTex) + ' (' + t('A=1,\\ B=0,\\ C=' + (-x0)) + ').', ['A vertical line: every point has the same ' + t('x') + '-value. Then move it to the left side.'], 'vertical line in general form', { bad: ['y' + (y0 < 0 ? '+' : '-') + Math.abs(y0) + '=0', 'x=' + x0] });
      } },
      { id: 'e6h2', sub: 'h(ii)', level: 'EMG', outcome: 'RF7', make: function (r) {
        var x0 = r.pick(pm(2, 7)), y0 = r.pick(pm(2, 7));
        return lineGen('Write, in general form, the <b>horizontal</b> line through ' + t(pT([x0, y0])) + '.', { y: y0 }, [], 'Every point has ' + t('y=' + y0) + ', so in general form ' + t(gen({ y: y0 })) + ' (' + t('A=0,\\ B=1,\\ C=' + (-y0)) + '; with ' + t('A=0') + ' the leading coefficient ' + t('B') + ' is positive).', ['A horizontal line: every point has the same ' + t('y') + '-value.'], 'horizontal line in general form', { bad: ['x' + (x0 < 0 ? '+' : '-') + Math.abs(x0) + '=0', '-y' + (y0 < 0 ? '-' : '+') + Math.abs(y0) + '=0'] });
      } },
      { id: 'e6i', sub: 'i', level: 'EMG', outcome: 'RF7', make: function (r) {
        return mc(r, 'A vertical line and a horizontal line are perpendicular. Why can’t the test ' + t('m_1m_2=-1') + ' be used to confirm it?', [
          { html: 'The vertical line’s slope is undefined, so there is no number to multiply. Vertical and horizontal lines are the stated exception: they are always perpendicular.', right: true },
          { html: 'The product is ' + t('0\\times m=0\\ne -1') + ', so they aren’t really perpendicular.', why: 'They meet at a right angle. The test can’t be applied because one slope isn’t a number.' },
          { html: 'The test works: an undefined slope counts as ' + t('-1') + '.', why: '“Undefined” isn’t a number — it can’t be replaced by ' + t('-1') + ' or anything else.' },
          { html: 'Because both lines have slope ' + t('0') + '.', why: 'Only the horizontal line has slope ' + t('0') + '; the vertical line’s slope is undefined.' }],
          'The vertical line has an undefined slope, so ' + t('m_1m_2') + ' can’t be formed. The unit treats this as an exception: a vertical line is perpendicular to every horizontal line.', ['What is the slope of a vertical line?'], 'perpendicular test exception');
      } }] },
    { num: '7', section: 'Extra practice D — Is the point on the line?', shared: function (r) {
        return pickWhere(function () { var A = r.pick([2, 4, 5, 7, 5]), Bc = r.pick([2, 3]), k = r.int(2, 5); return { A: A, Bc: Bc, k: k, C: Bc * k }; }, function (o) { return cop(o.A, o.Bc) && o.C % o.A !== 0 && o.A !== o.k; });
      },
      stem: function (sh) { return 'Line ' + t('L') + ' has equation ' + t(gT(sh.A, -sh.Bc, -sh.C)) + '. A point is <b>on</b> ' + t('L') + ' exactly when substituting it makes the left side ' + t('0') + '.'; }, parts: (function () {
      function ptsOf(sh) { return [[sh.Bc, sh.A - sh.k], [2 * sh.Bc, 2 * sh.A - sh.k - 1], [0, -sh.k], [-2 * sh.Bc, -2 * sh.A - sh.k], [sh.C / sh.A, 0], [3 * sh.Bc, 3 * sh.A - sh.k - 1]]; }
      var subs = ['a', 'b', 'c', 'd', 'e', 'f'];
      var parts = subs.map(function (s, i) {
        return { id: 'e7' + s, level: i === 4 ? 'EMG' : 'BEG', outcome: 'RF5', make: function (r, sh) {
          var p = ptsOf(sh)[i], v = valAt(sh.A, -sh.Bc, -sh.C, p), slip = sh.A * p[0] + sh.Bc * p[1] - sh.C, slip2 = sh.A * p[0] - sh.Bc * p[1] + sh.C;
          var sub = t(sh.A + prn(p[0]) + '-' + sh.Bc + prn(p[1]) + '-' + sh.C + '=' + v);
          return numPart('Substitute ' + t(pT(p)) + '. What value does the left side take? (Then decide: on or off ' + t('L') + '?)', v, function (x) {
            if (!near(slip, v) && near(x, slip)) return { code: 'gf-sub-sign', hint: 'Careful with the ' + t('y') + '-term: it is ' + t('-' + sh.Bc + '\\times' + sgp(p[1])) + '.' };
            if (!near(slip2, v) && near(x, slip2)) return { code: 'gf-sub-sign', hint: 'Check the sign of the constant: it is ' + t('-' + sh.C) + '.' };
            return null;
          }, sub + (v === 0 ? ', so ' + t(pT(p)) + ' is <b>ON</b> ' + t('L') + '.' : t('\\ne 0') + ', so ' + t(pT(p)) + ' is <b>OFF</b> ' + t('L') + '.'), ['Replace ' + t('x') + ' and ' + t('y') + ' with the coordinates (use brackets for negatives) and evaluate.'], 'substitute point ' + pK(p));
        } };
      });
      parts.push({ id: 'e7on', sub: 'a–f', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
        var ps = ptsOf(sh), rows = ps.map(function (p, i) { return { id: subs[i], html: '(' + subs[i] + ') ' + t(pT(p)) }; }), want = {};
        ps.forEach(function (p, i) { want[subs[i]] = valAt(sh.A, -sh.Bc, -sh.C, p) === 0 ? 'on' : 'off'; });
        return B.grid('For each point, state <b>ON</b> or <b>OFF</b> the line ' + t('L') + '.', rows, [{ id: 'on', html: 'ON' }, { id: 'off', html: 'OFF' }], want, { why: function (row) { return 'Substitute point (' + row + ') again: it is on the line only if the left side is exactly ' + t('0') + '.'; } },
          ps.map(function (p, i) { var v = valAt(sh.A, -sh.Bc, -sh.C, p); return '(' + subs[i] + ') left side ' + t('=' + v) + ' — ' + (v === 0 ? 'ON' : 'OFF'); }).join('<br>'), ['Substitute each point; ON means the left side is ' + t('0') + '.'], 'on/off line');
      } });
      parts.push({ id: 'e7g', sub: 'g', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
        var x = 2 * sh.Bc, yT = 2 * sh.A - sh.k;
        return B.fields('Point (b), ' + t(pT([x, yT - 1])) + ', is a near miss. Determine the ' + t('y') + '-value ' + t('L') + ' really has when ' + t('x=' + x) + ', and how far ' + t(pT([x, yT - 1])) + ' sits from the line vertically.', [{ label: t('y') + ' on ' + t('L') + ' at ' + t('x=' + x) + ':', name: 'y on L', before: t('y=') }, { label: 'Vertical distance:', name: 'distance', after: 'unit(s)' }],
          [K.number(yT, function (v) { return v === yT - 1 ? { code: 'gf-near', hint: 'That’s the point’s own ' + t('y') + '. Substitute ' + t('x=' + x) + ' into the equation and solve for ' + t('y') + '.' } : null; }), K.number(1, function (v) { return v === sh.Bc ? { code: 'gf-near', hint: 'That’s the value of the left side, not the distance. Compare the two ' + t('y') + '-values.' } : null; })],
          [String(yT), '1'], t('y=' + yT) + '; the point is ' + t('1') + ' unit below the line',
          t(sh.A + '(' + x + ')-' + sh.Bc + 'y-' + sh.C + '=0') + ' → ' + t(sh.A * x - sh.C + '-' + sh.Bc + 'y=0') + ' → ' + t('y=' + yT) + '. The line passes through ' + t(pT([x, yT])) + ', so ' + t(pT([x, yT - 1])) + ' is ' + t('1') + ' unit below it.', ['Substitute ' + t('x=' + x) + ' into the equation of ' + t('L') + ' and solve for ' + t('y') + '.'], 'near miss distance');
      } });
      parts.push({ id: 'e7h', sub: 'h', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
        return mc(r, 'Why is checking a point by graphing a poor test, compared with substituting?', [
          { html: 'On a hand-drawn graph a point one unit off can still look as if it touches the line; substitution gives an exact number, so ' + t('3\\ne 0') + ' is decided by arithmetic, not drawing accuracy.', right: true },
          { html: 'Graphing is just as reliable, only slower.', why: 'A near miss like point (b) can look like it is on a drawn line. Graphs have limited accuracy.' },
          { html: 'A graph can only show points with whole-number coordinates.', why: 'You can plot fractions too, roughly. The problem is accuracy, not which points can be shown.' },
          { html: 'Substitution only works for points on the axes.', why: 'Substitution works for any point — it is exact every time.' }],
          'At a small scale, one unit is about the width of a pencil line, so a near miss looks “on”. Substitution never has that problem: the left side is either exactly ' + t('0') + ' or it isn’t.', ['Think about point (b): would you notice a one-unit miss on a small hand-drawn grid?'], 'graphing vs substitution');
      } });
      parts.push({ id: 'e7i', sub: 'i', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
        var p = [sh.C / sh.A, 0];
        return mc(r, 'Point (e), ' + t(pT(p)) + ', is on ' + t('L') + '. What else does it tell you about ' + t('L') + '?', [
          { html: 'It is the ' + t('x') + '-intercept of ' + t('L') + '.', right: true },
          { html: 'It is the ' + t('y') + '-intercept of ' + t('L') + '.', why: 'Its ' + t('y') + '-coordinate is ' + t('0') + ', so it is on the ' + t('x') + '-axis.' },
          { html: t('L') + ' passes through the origin.', why: 'The origin is ' + t('(0,\\ 0)') + '. This point has ' + t('x=' + fT(p[0])) + '.' },
          { html: 'The slope of ' + t('L') + ' is ' + t(fT(p[0])) + '.', why: 'A single point doesn’t give the slope. Look at its ' + t('y') + '-coordinate.' }],
          'Its ' + t('y') + '-coordinate is ' + t('0') + ', so it lies on the ' + t('x') + '-axis: ' + t(pT(p)) + ' is the <b>' + t('x') + '-intercept</b>. Check: ' + t('-\\frac{C}{A}=-\\frac{' + (-sh.C) + '}{' + sh.A + '}=' + fT(p[0])) + ' ✓', ['Look at the ' + t('y') + '-coordinate of the point.'], 'meaning of (C/A, 0)');
      } });
      parts.push({ id: 'e7j', sub: 'j', level: 'ADV', outcome: 'RF7', make: function (r, sh) {
        var pb = [2 * sh.Bc, 2 * sh.A - sh.k - 1], pf = [3 * sh.Bc, 3 * sh.A - sh.k - 1], T = { A: sh.A, B: -sh.Bc, C: -sh.C - sh.Bc };
        return lineGen('Points (b) ' + t(pT(pb)) + ' and (f) ' + t(pT(pf)) + ' both gave the same non-zero value, ' + t(sh.Bc) + ', for the left side. They lie on a line parallel to ' + t('L') + '. Write that line’s equation in general form.', T,
          [{ is: { A: sh.A, B: -sh.Bc, C: -sh.C + sh.Bc }, code: 'gf-sub-sign', hint: 'At both points ' + t(gT(sh.A, -sh.Bc, -sh.C).replace('=0', '=' + sh.Bc)) + '. Subtract ' + t(sh.Bc) + ' from both sides — the constant becomes ' + t(-sh.C - sh.Bc) + '.' }],
          'Both points satisfy ' + t(gT(sh.A, -sh.Bc, -sh.C).replace('=0', '=' + sh.Bc)) + ', so they satisfy ' + t(gT(sh.A, -sh.Bc, -sh.C - sh.Bc)) + '. No new work: ' + t('A') + ' and ' + t('B') + ' are unchanged (slope still ' + t(fT(sh.A / sh.Bc)) + ', parallel to ' + t('L') + '); only ' + t('C') + ' moved.', ['If the left side equals ' + t(sh.Bc) + ' at both points, what equation do both points satisfy?'], 'parallel line through near misses', { point: pb, bad: [gT(sh.A, -sh.Bc, -sh.C), gT(sh.A, -sh.Bc, -sh.C + sh.Bc)] });
      } });
      return parts;
    })() },
    { num: '8', section: 'Extra practice E — Parallel and perpendicular without rearranging', stem: 'Write ' + t('-\\frac{A}{B}') + ' for both lines and classify the pair as parallel, perpendicular, or neither.', parts: [
      { id: 'e8a', level: 'BEG', make: function (r) { return classPart(r, 'par'); } },
      { id: 'e8b', level: 'EMG', make: function (r) { return classPart(r, 'perp'); } },
      { id: 'e8c', level: 'EMG', make: function (r) { return classPart(r, 'par2'); } },
      { id: 'e8d', level: 'EMG', make: function (r) { return classPart(r, 'perp2'); } },
      { id: 'e8e', level: 'EMG', make: function (r) { return classPart(r, 'swap'); } },
      { id: 'e8f', level: 'EMG', make: function (r) { return classPart(r, 'same'); } },
      { id: 'e8g', level: 'EMG', make: function (r) {
        var pr = pairMaker(r, 'swap'), L1 = pr[0], L2 = pr[1], m1 = slopeOf(L1), m2 = slopeOf(L2);
        return numPart(t(gT(L1[0], L1[1], L1[2])) + ' and ' + t(gT(L2[0], L2[1], L2[2])) + ' have their ' + t('x') + '- and ' + t('y') + '-coefficients swapped, which looks like a reciprocal. Multiply the two slopes: what is the product?', 1, function (v) { return v === -1 ? { code: 'sign', hint: 'Both slopes are negative: ' + t(fT(m1)) + ' and ' + t(fT(m2)) + '. A negative times a negative is positive.' } : null; },
          t('(' + fT(m1) + ')(' + fT(m2) + ')=1') + ', not ' + t('-1') + '. Reciprocals are only half the job: perpendicular slopes must also have <b>opposite signs</b>, so these lines are neither parallel nor perpendicular.', ['Find each slope with ' + t('-\\frac{A}{B}') + ', then multiply.'], 'product of swapped slopes');
      } },
      { id: 'e8h', level: 'EMG', outcome: 'RF7', make: function (r) {
        return mc(r, 'Which rule turns ' + t('Ax+By+C=0') + ' into a line <b>perpendicular</b> to it?', [
          { html: t('Bx-Ay+D=0') + ' — swap ' + t('A') + ' and ' + t('B') + ' <b>and</b> negate one of them', right: true },
          { html: t('Bx+Ay+D=0') + ' — just swap ' + t('A') + ' and ' + t('B'), why: 'Slopes ' + t('-\\frac{A}{B}') + ' and ' + t('-\\frac{B}{A}') + ' multiply to ' + t('+1') + ', not ' + t('-1') + '. One sign must change too.' },
          { html: t('Ax-By+D=0') + ' — negate ' + t('B') + ' only', why: 'That gives slope ' + t('\\frac{A}{B}') + ' — the opposite, not the negative reciprocal.' },
          { html: t('Ax+By+D=0') + ' — change only the constant', why: 'Changing only the constant gives a <b>parallel</b> line.' }],
          'Slopes: ' + t('-\\frac{A}{B}') + ' and ' + t('-\\frac{B}{-A}=\\frac{B}{A}') + '. Product: ' + t('\\left(-\\frac{A}{B}\\right)\\left(\\frac{B}{A}\\right)=-1') + ', so ' + t('Bx-Ay+D=0') + ' is always perpendicular to ' + t('Ax+By+C=0') + '.', ['Work out the slope of each option with ' + t('-\\frac{A}{B}') + ' and multiply by ' + t('-\\frac{A}{B}') + '.'], 'perpendicular rule');
      } },
      { id: 'e8i', level: 'EMG', make: function (r) {
        var pr = pairMaker(r, 'same'), L1 = pr[0], L2 = pr[1], s = L2[0] / L1[0];
        return mc(r, 'The slope test says ' + t(gT(L1[0], L1[1], L1[2])) + ' and ' + t(gT(L2[0], L2[1], L2[2])) + ' are parallel. But something stronger is true. What?', [
          { html: 'They are the <b>same line</b>: every coefficient of the second, ' + t('C') + ' included, is ' + t(s) + ' times the first.', right: true },
          { html: 'They are also perpendicular.', why: 'Equal slopes mean parallel (or the same line) — never perpendicular. Perpendicular slopes multiply to ' + t('-1') + '.' },
          { html: 'They are parallel and ' + t(s) + ' units apart.', why: 'Check the constants: ' + t(L2[2] + '=' + s + '\\times' + sgp(L1[2])) + '. Multiplying a whole equation by ' + t(s) + ' doesn’t move the line.' },
          { html: 'They cross at exactly one point.', why: 'Lines with equal slopes never cross at just one point.' }],
          t(gT(L2[0], L2[1], L2[2])) + ' is ' + t(s + '\\times(' + gT(L1[0], L1[1], L1[2]).replace('=0', '') + ')=0') + ', so the two equations have exactly the same solutions: the <b>same line</b>.', ['Compare all three coefficients, not just ' + t('A') + ' and ' + t('B') + '.'], 'same line');
      } }] },
    { num: '9', stem: 'A shortcut worth proving. Let ' + t('A') + ' and ' + t('B') + ' both be non-zero.', parts: [
      { id: 'e9a', level: 'PRG', make: function (r) {
        return mc(r, 'Write the slopes of ' + t('Ax+By+C=0') + ' and ' + t('Bx-Ay+D=0') + ' and multiply them. What do you conclude?', [
          { html: t('-\\frac{A}{B}') + ' and ' + t('\\frac{B}{A}') + '; the product is ' + t('-1') + ', so the lines are always perpendicular.', right: true },
          { html: t('-\\frac{A}{B}') + ' and ' + t('-\\frac{B}{A}') + '; the product is ' + t('1') + ', so they are never perpendicular.', why: 'The second line has ' + t('B') + ' in place of ' + t('A') + ' and ' + t('-A') + ' in place of ' + t('B') + ': its slope is ' + t('-\\frac{B}{-A}=\\frac{B}{A}') + '.' },
          { html: t('-\\frac{A}{B}') + ' and ' + t('\\frac{B}{A}') + '; the product is ' + t('1') + ', so the lines are parallel.', why: 'Multiply again: ' + t('\\left(-\\frac{A}{B}\\right)\\left(\\frac{B}{A}\\right)=-1') + '. (Parallel lines have equal slopes.)' },
          { html: 'It depends on the values of ' + t('C') + ' and ' + t('D') + '.', why: 'The slopes ' + t('-\\frac{A}{B}') + ' don’t involve ' + t('C') + ' or ' + t('D') + ' at all.' }],
          t('m_1=-\\frac{A}{B}') + ', ' + t('m_2=-\\frac{B}{-A}=\\frac{B}{A}') + '; ' + t('m_1m_2=-1') + ', so ' + t('Bx-Ay+D=0') + ' is always perpendicular to ' + t('Ax+By+C=0') + '.', ['For the second line, the “' + t('A') + '” is ' + t('B') + ' and the “' + t('B') + '” is ' + t('-A') + '.'], 'prove perpendicular rule');
      } },
      { id: 'e9b', level: 'EMG', make: function (r) {
        return mc(r, 'Why is ' + t('Ax+By+D=0') + ' parallel to ' + t('Ax+By+C=0') + ' for every ' + t('D\\ne C') + ', and what does changing ' + t('D') + ' move?', [
          { html: 'The slope ' + t('-\\frac{A}{B}') + ' doesn’t involve ' + t('C') + ' or ' + t('D') + ', so the direction is the same; changing ' + t('D') + ' slides the line, moving both intercepts.', right: true },
          { html: 'Changing ' + t('D') + ' changes the slope a little, but not enough to matter.', why: 'The slope is ' + t('-\\frac{A}{B}') + ' — ' + t('D') + ' isn’t in it at all.' },
          { html: 'Changing ' + t('D') + ' rotates the line about the origin.', why: 'A rotation would change the slope. ' + t('D') + ' only shifts the line.' },
          { html: 'Changing ' + t('D') + ' moves only the ' + t('y') + '-intercept; the ' + t('x') + '-intercept stays put.', why: 'Both intercepts, ' + t('-\\frac{D}{A}') + ' and ' + t('-\\frac{D}{B}') + ', contain ' + t('D') + '.' }],
          'Every line ' + t('Ax+By+D=0') + ' has slope ' + t('-\\frac{A}{B}') + ', so it is parallel to ' + t('Ax+By+C=0') + ' (and a different line when ' + t('D\\ne C') + '). Changing ' + t('D') + ' slides the line: the intercepts ' + t('\\left(-\\frac{D}{A},\\ 0\\right)') + ' and ' + t('\\left(0,\\ -\\frac{D}{B}\\right)') + ' move, the direction doesn’t.', ['Which of ' + t('A') + ', ' + t('B') + ', ' + t('C') + ' appear in the slope?'], 'parallel family');
      } },
      { id: 'e9c', level: 'PRG', outcome: 'RF7', make: function (r) {
        var o = pickWhere(function () { return { A: r.int(2, 7), Bc: r.int(1, 6), C: -r.int(1, 9), x0: r.pick(pm(1, 6)), y0: r.pick(pm(1, 8)) }; }, function (o) { return cop(o.A, o.Bc) && o.A !== o.Bc && valAt(o.A, o.Bc, o.C, [o.x0, o.y0]) !== 0; });
        var D = -(o.A * o.x0 + o.Bc * o.y0);
        return lineGen('Write, in general form, the line through ' + t(pT([o.x0, o.y0])) + ' parallel to ' + t(gT(o.A, o.Bc, o.C)) + '.', { A: o.A, B: o.Bc, C: D }, [],
          'Parallel family: ' + t(lin([[o.A, 'x'], [o.Bc, 'y']]) + '+D=0') + '.<br>Substitute ' + t(pT([o.x0, o.y0])) + ': ' + t(o.A + prn(o.x0) + '+' + o.Bc + prn(o.y0) + '+D=0') + ', so ' + t('D=' + D) + '.<br>' + t(gT(o.A, o.Bc, D)), ['Keep ' + t('A') + ' and ' + t('B') + ', and find the constant that makes the point fit.'], 'parallel through point (general form)', { point: [o.x0, o.y0], bad: [gT(o.A, o.Bc, o.C), gT(o.A, o.Bc, -D)] });
      } },
      { id: 'e9d', level: 'PRG', outcome: 'RF7', make: function (r) {
        var o = pickWhere(function () { return { A: r.int(2, 7), Bc: r.int(1, 6), C: -r.int(1, 9), x0: r.pick(pm(1, 6)), y0: r.pick(pm(1, 8)) }; }, function (o) { return cop(o.A, o.Bc) && o.A !== o.Bc; });
        var D = -(o.Bc * o.x0 - o.A * o.y0), Dp = -(o.A * o.x0 + o.Bc * o.y0);
        return lineGen('Write, in general form, the line through ' + t(pT([o.x0, o.y0])) + ' perpendicular to ' + t(gT(o.A, o.Bc, o.C)) + '.', { A: o.Bc, B: -o.A, C: D }, [{ is: { A: o.A, B: o.Bc, C: Dp }, code: 'gf-par-for-perp', hint: 'That line is <b>parallel</b> to the given one. For a perpendicular line, swap ' + t('A') + ' and ' + t('B') + ' and negate one: ' + t(lin([[o.Bc, 'x'], [-o.A, 'y']]) + '+D=0') + '.' }],
          'Perpendicular family: ' + t(lin([[o.Bc, 'x'], [-o.A, 'y']]) + '+D=0') + '.<br>Substitute ' + t(pT([o.x0, o.y0])) + ': ' + t(o.Bc + prn(o.x0) + '-' + o.A + prn(o.y0) + '+D=0') + ', so ' + t('D=' + D) + '.<br>' + t(gT(o.Bc, -o.A, D)) + (o.Bc === 1 ? '' : '') + '.<br>Check: slopes ' + t(fT(-o.A / o.Bc)) + ' and ' + t(fT(o.Bc / o.A)) + ' multiply to ' + t('-1') + ' ✓', ['Use the rule: ' + t('Ax+By+C=0') + ' is perpendicular to ' + t('Bx-Ay+D=0') + '. Then substitute the point to find ' + t('D') + '.'], 'perpendicular through point (general form)', { point: [o.x0, o.y0], bad: [gT(o.A, o.Bc, Dp), gT(o.Bc, o.A, -(o.Bc * o.x0 + o.A * o.y0))] });
      } }] },
    { num: '10', section: 'Extra practice F — The same line wearing a different coat', shared: function (r) {
        return pickWhere(function () { var a = r.int(1, 5), b = r.int(2, 5); return { a: a, b: b, c: a * b * r.pick([1, 1, 2]), k0: -r.int(2, 4), cR: r.pick(pm(1, 9)), s2: r.int(3, 5), cG: r.int(5, 40) }; },
          function (o) { return cop(o.a, o.b) && o.a !== o.b && o.cR !== 2 * o.c && o.cG !== o.c * o.s2 && o.c <= 30; });
      },
      stem: function (sh) { return 'Consider ' + t('P:\\ ' + gT(sh.a, -sh.b, sh.c)) + ' &nbsp;and&nbsp; ' + t('Q:\\ ' + gT(sh.k0 * sh.a, -sh.k0 * sh.b, sh.k0 * sh.c)) + '.'; }, parts: [
      { id: 'e10a', level: 'EMG', make: function (r, sh) {
        return numPart('Find the number ' + t('k') + ' for which multiplying every term of ' + t('P') + ' by ' + t('k') + ' produces ' + t('Q') + ' exactly.', sh.k0, function (v) { return v === -sh.k0 ? { code: 'sign', hint: 'Check the sign: ' + t(sh.a + 'k') + ' must equal ' + t(sh.k0 * sh.a) + '.' } : null; },
          'Match ' + t('A') + ': ' + t(sh.a + 'k=' + sh.k0 * sh.a) + ', so ' + t('k=' + sh.k0) + '. Check: ' + t(sh.k0 + '(' + gT(sh.a, -sh.b, sh.c).replace('=0', '') + ')=' + gT(sh.k0 * sh.a, -sh.k0 * sh.b, sh.k0 * sh.c).replace('=0', '')) + ' ✓', ['Divide a coefficient of ' + t('Q') + ' by the matching coefficient of ' + t('P') + '.'], 'multiplier between equations');
      } },
      { id: 'e10b', level: 'BEG', make: function (r, sh) {
        return lineGen(t('Q') + ' is not in general form. Put it there, in lowest terms.', { A: sh.a, B: -sh.b, C: sh.c }, [],
          t(gT(sh.k0 * sh.a, -sh.k0 * sh.b, sh.k0 * sh.c)) + ' has ' + t('A<0') + '. Multiply by ' + t('-1') + ': ' + t(gT(-sh.k0 * sh.a, sh.k0 * sh.b, -sh.k0 * sh.c)) + '. Divide by ' + t(-sh.k0) + ': ' + t(gT(sh.a, -sh.b, sh.c)) + ' — identical to ' + t('P') + '.', ['Make ' + t('A') + ' positive, then divide out the common factor.'], 'general form of Q', { bad: [gT(sh.k0 * sh.a, -sh.k0 * sh.b, sh.k0 * sh.c), gT(-sh.k0 * sh.a, sh.k0 * sh.b, -sh.k0 * sh.c)] });
      } },
      { id: 'e10c', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
        var p = mbFields('Confirm that ' + t('P') + ' and ' + t('Q') + ' are the same line: state the slope and both intercepts (they are the same for both).', sh.a, -sh.b, sh.c, { x: true });
        p.solution += '<br>' + t('Q') + ' gives ' + t('m=-\\frac{' + sh.k0 * sh.a + '}{' + (-sh.k0 * sh.b) + '}=' + fT(sh.a / sh.b)) + ' and the same intercepts, so ' + t('P') + ' and ' + t('Q') + ' are the same line.';
        return p;
      } },
      { id: 'e10d', level: 'EMG', make: function (r, sh) {
        var R = [2 * sh.a, -2 * sh.b, sh.cR];
        return mc(r, 'Now take ' + t('R:\\ ' + gT(R[0], R[1], R[2])) + '. No single multiplier turns ' + t('P') + ' into ' + t('R') + '. How are ' + t('P') + ' and ' + t('R') + ' related?', [
          { html: 'Parallel and distinct', right: true },
          { html: 'The same line', why: 'Multiplying ' + t('P') + ' by ' + t('2') + ' gives ' + t('C=' + 2 * sh.c) + ', not ' + t(sh.cR) + ', so the points are different.' },
          { html: 'Perpendicular', why: 'Both slopes are ' + t(fT(sh.a / sh.b)) + ' — equal, not negative reciprocals.' },
          { html: 'They cross at one point', why: 'Their slopes are equal, so they never cross.' }],
          'Match ' + t('A') + ': ' + t('k=2') + '; match ' + t('B') + ': ' + t('k=2') + '; but ' + t(2 * sh.c + '\\ne' + sgp(sh.cR)) + '. Both slopes are ' + t(fT(sh.a / sh.b)) + ', so ' + t('P') + ' and ' + t('R') + ' are <b>parallel and distinct</b>.', ['Compare the slopes, then check whether the constants match the same multiplier.'], 'P and R relation');
      } },
      { id: 'e10e', level: 'EMG', make: function (r) {
        return mc(r, 'Two equations ' + t('A_1x+B_1y+C_1=0') + ' and ' + t('A_2x+B_2y+C_2=0') + ' describe the <b>same line</b> exactly when ____, and are merely <b>parallel</b> when ____.', [
          { html: t('A_2,\\ B_2,\\ C_2') + ' are the same multiple of ' + t('A_1,\\ B_1,\\ C_1') + ' … only ' + t('A') + ' and ' + t('B') + ' share that multiple', right: true },
          { html: t('A_1=A_2') + ' … ' + t('B_1=B_2'), why: t('P') + ' and ' + t('Q') + ' are the same line with different ' + t('A') + '’s. It is the ratios that matter.' },
          { html: 'the slopes are equal … the slopes are negative reciprocals', why: 'Negative reciprocal slopes mean perpendicular. And equal slopes alone don’t make the same line.' },
          { html: t('C_1=C_2') + ' … ' + t('C_1\\ne C_2'), why: 'Compare ' + t('P') + ' and ' + t('Q') + ': different ' + t('C') + '’s, same line. Only the ratio ' + t('A:B:C') + ' matters.' }],
          'Same line: ' + t('A_2=kA_1') + ', ' + t('B_2=kB_1') + ' and ' + t('C_2=kC_1') + ' for one non-zero ' + t('k') + '. Parallel only: ' + t('A_2=kA_1') + ' and ' + t('B_2=kB_1') + ', but ' + t('C_2\\ne kC_1') + '.', ['Use ' + t('P') + ', ' + t('Q') + ' and ' + t('R') + ' as test cases.'], 'same-line test');
      } },
      { id: 'e10f', level: 'PRG', make: function (r, sh) {
        var k = sh.a * sh.s2;
        return numPart('Determine ' + t('k') + ' so that ' + t('kx-' + sh.b * sh.s2 + 'y+' + sh.c * sh.s2 + '=0') + ' is the <b>same line</b> as ' + t('P') + '.', k, function (v) { if (v === -k) return { code: 'sign', hint: 'The multiplier is ' + t(sh.s2) + ' (positive): ' + t('k=' + sh.a + '\\times ' + sh.s2) + '.' }; if (v === sh.s2) return { code: 'gf-k-mixed', hint: t(sh.s2) + ' is the multiplier. Multiply ' + t(sh.a) + ' by it to get ' + t('k') + '.' }; return null; },
          'Match ' + t('B') + ': ' + t('-' + sh.b * sh.s2 + '=' + sh.s2 + '\\times(-' + sh.b + ')') + ', so the multiplier is ' + t(sh.s2) + '. Check ' + t('C') + ': ' + t(sh.c + '\\times ' + sh.s2 + '=' + sh.c * sh.s2) + ' ✓.<br>' + t('k=' + sh.a + '\\times ' + sh.s2 + '=' + k) + '.', ['Find the multiplier from the ' + t('y') + '-coefficients, check it with the constants, then apply it to ' + t('A') + '.'], 'k for same line');
      } },
      { id: 'e10g', level: 'PRG', make: function (r, sh) {
        var k = sh.a * sh.s2;
        return numPart('Determine ' + t('k') + ' so that ' + t('kx-' + sh.b * sh.s2 + 'y+' + sh.cG + '=0') + ' is <b>parallel to but different from</b> ' + t('P') + '.', k, function (v) { if (v === -k) return { code: 'sign', hint: 'The slope must equal ' + t(fT(sh.a / sh.b)) + ': ' + t('-\\frac{k}{-' + sh.b * sh.s2 + '}=\\frac{k}{' + sh.b * sh.s2 + '}') + '.' }; return null; },
          'Slope must match: ' + t('\\frac{k}{' + sh.b * sh.s2 + '}=' + fT(sh.a / sh.b)) + ', so ' + t('k=' + k) + '.<br>Different line: the multiplier ' + t(sh.s2) + ' would need ' + t('C=' + sh.c * sh.s2) + ', but it is ' + t(sh.cG) + ' ✓. ' + t('k') + ' (with ' + t('B') + ') fixes only the direction; ' + t('C') + ' alone decides whether it is ' + t('P') + ' itself or a parallel neighbour.', ['Set the slope ' + t('-\\frac{A}{B}') + ' equal to the slope of ' + t('P') + '.'], 'k for parallel line');
      } },
      { id: 'e10h', level: 'EMG', make: function (r, sh) {
        return mc(r, 'A student says: “' + t('P') + ' and ' + t('Q') + ' can’t be the same line — one has ' + t('A=' + sh.a) + ' and the other has ' + t('A=' + sh.k0 * sh.a) + ', and ' + t('A') + ' is the slope.” Which correction is right?', [
          { html: 'Both halves are wrong: the slope is ' + t('-\\frac{A}{B}') + ' (both give ' + t(fT(sh.a / sh.b)) + '), and multiplying every term by ' + t(sh.k0) + ' changes ' + t('A') + ' without changing the points.', right: true },
          { html: 'The student is right: different ' + t('A') + '’s mean different lines.', why: t('Q') + ' is ' + t(sh.k0) + ' times ' + t('P') + ' — the same equation multiplied through, so the same points.' },
          { html: t('A') + ' is the slope, but the lines are still the same.', why: 'The slope of ' + t('P') + ' is ' + t(fT(sh.a / sh.b)) + ', not ' + t(sh.a) + '.' },
          { html: 'The slope is ' + t('\\frac{A}{B}') + ', so the lines have different slopes.', why: 'The slope is ' + t('-\\frac{A}{B}') + ', and for both equations it is ' + t(fT(sh.a / sh.b)) + '.' }],
          '“' + t('A') + ' is the slope” is wrong: the slope is ' + t('-\\frac{A}{B}') + ', ' + t(fT(sh.a / sh.b)) + ' for both. “Different ' + t('A') + ' means different line” is wrong: ' + t('Q') + ' is ' + t('P') + ' multiplied by ' + t(sh.k0) + ', so ' + t('P') + ' and ' + t('Q') + ' are the same line.', ['What is the slope of a general-form line? What does multiplying every term by a number do?'], 'correct the student');
      } }] },
    { num: '11', section: 'Extra practice G — Error analysis', shared: function (r) { return { m: r.int(2, 9), b: r.int(1, 9) }; },
      stem: function (sh) { return 'Asked to write ' + t(siT(sh.m, sh.b)) + ' in general form, a student slides the ' + t('x') + '-term across and writes ' + t(gT(-sh.m, 1, -sh.b)) + '.'; }, parts: [
      { id: 'e11a', level: 'BEG', make: function (r, sh) {
        var same = r.chance(0.5);
        return B.tf(r, 'Test ' + t('(0,\\ ' + sh.b + ')') + ' and ' + t('(1,\\ ' + (sh.m + sh.b) + ')') + ' in the student’s equation. True or false: ' + (same ? 'it is a true equation of the line ' + t(siT(sh.m, sh.b)) + '.' : 'it describes a different line from ' + t(siT(sh.m, sh.b)) + '.'), same, 'Substitute: ' + t('-' + sh.m + '(0)+' + sh.b + '-' + sh.b + '=0') + ' and ' + t('-' + sh.m + '(1)+' + (sh.m + sh.b) + '-' + sh.b + '=0') + ' — both points of the line fit, so it is the same line.',
          t('(0,\\ ' + sh.b + ')') + ': ' + t('-' + sh.m + '(0)+' + sh.b + '-' + sh.b + '=0') + ' ✓; ' + t('(1,\\ ' + (sh.m + sh.b) + ')') + ': ' + t('-' + sh.m + '(1)+' + (sh.m + sh.b) + '-' + sh.b + '=0') + ' ✓. Both points of ' + t(siT(sh.m, sh.b)) + ' satisfy it, and two points fix a line, so it <b>is</b> a true equation of that line — the statement is <b>' + (same ? 'true' : 'false') + '</b>.', ['Substitute each point into the left side.'], 'student equation true?');
      } },
      { id: 'e11b', level: 'BEG', make: function (r, sh) {
        return mc(r, 'So the student is not wrong about the line. Which part of the general-form convention have they broken?', [
          { html: t('A') + ' must be positive (here ' + t('A=' + (-sh.m)) + ').', right: true },
          { html: t('A') + ', ' + t('B') + ' and ' + t('C') + ' must be integers.', why: t(-sh.m) + ', ' + t('1') + ' and ' + t(-sh.b) + ' are all integers.' },
          { html: 'The coefficients must have no common factor.', why: 'They have none here: ' + t('B=1') + '.' },
          { html: 'The right side must be ' + t('0') + '.', why: 'It is ' + t('0') + '.' }],
          'General form needs ' + t('A>0') + '; the student has ' + t('A=' + (-sh.m)) + '. (Integers, no common factor and ' + t('=0') + ' are all fine.)', ['Check each convention: integers, ' + t('A') + ' positive, no common factor.'], 'which rule broken');
      } },
      { id: 'e11c', level: 'BEG', make: function (r, sh) {
        return lineGen('Repair it: state the correct general form.', { m: sh.m, b: sh.b }, [], 'Multiply every term by ' + t('-1') + ': ' + t(gT(sh.m, -1, sh.b)) + '.', ['Multiply every term by ' + t('-1') + '.'], 'repair general form', { bad: [gT(-sh.m, 1, -sh.b), gT(sh.m, 1, sh.b)] });
      } },
      { id: 'e11d', level: 'EMG', make: function (r) {
        return mc(r, 'Why can’t multiplying an equation by ' + t('-1') + ' change which points satisfy it?', [
          { html: 'It negates the left side <b>and</b> the right side, and ' + t('-1\\times 0=0') + ', so a point makes the new left side ' + t('0') + ' exactly when it made the old one ' + t('0') + '.', right: true },
          { html: 'Because ' + t('-1') + ' is a small number.', why: 'Size has nothing to do with it — multiplying by ' + t('-100') + ' wouldn’t change the points either.' },
          { html: 'It does change the points: they reflect in the ' + t('x') + '-axis.', why: 'Reflecting would need ' + t('y') + ' replaced by ' + t('-y') + ' alone. Multiplying the whole equation keeps every solution.' },
          { html: 'Because only the ' + t('x') + '-term changes sign.', why: '<b>Every</b> term changes sign — and the right side, ' + t('0') + ', stays ' + t('0') + '.' }],
          'Multiplying both sides by ' + t('-1') + ': the right side stays ' + t('0') + ' (' + t('-1\\times0=0') + '), and the left side is ' + t('0') + ' for exactly the same points as before.', ['What happens to the right side, ' + t('0') + ', when you multiply it by ' + t('-1') + '?'], 'why ×(−1) is safe');
      } }] },
    { num: '12', shared: function (r) { return pickWhere(function () { return { A: r.int(2, 7), Bc: r.int(2, 7), j: r.pick([2, 3]) }; }, function (o) { return cop(o.A, o.Bc) && o.A !== o.Bc && o.A * o.Bc * o.j <= 90; }); },
      stem: function (sh) { return 'Asked for the intercepts of ' + t(gT(sh.A, sh.Bc, -sh.A * sh.Bc * sh.j)) + ', a student writes: “' + t('A=' + sh.A) + ' and ' + t('B=' + sh.Bc) + ', so the ' + t('x') + '-intercept is ' + t(sh.A) + ' and the ' + t('y') + '-intercept is ' + t(sh.Bc) + '.”'; }, parts: [
      { id: 'e12a', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
        var C = sh.A * sh.Bc * sh.j, xp = [C / sh.A, 0], yp = [0, C / sh.Bc];
        var p = B.fields('Determine the actual intercepts as ordered pairs.', [{ label: t('x') + '-intercept:', name: 'x-intercept', mode: 'math', keys: 'pairs' }, { label: t('y') + '-intercept:', name: 'y-intercept', mode: 'math', keys: 'pairs' }],
          [ptBox(xp, yp, 'x'), ptBox(yp, xp, 'y')], [pK(xp), pK(yp)], t('x') + '-intercept ' + t(pT(xp)) + ', ' + t('y') + '-intercept ' + t(pT(yp)),
          t('y=0') + ': ' + t(sh.A + 'x-' + C + '=0') + ', ' + t('x=' + xp[0]) + ': ' + t(pT(xp)) + '.<br>' + t('x=0') + ': ' + t(sh.Bc + 'y-' + C + '=0') + ', ' + t('y=' + yp[1]) + ': ' + t(pT(yp)) + '.', ['Set ' + t('y=0') + ' for the ' + t('x') + '-intercept and ' + t('x=0') + ' for the ' + t('y') + '-intercept.'], 'actual intercepts');
        p.bad = [[pK([sh.A, 0]), pK([0, sh.Bc])]];
        return p;
      } },
      { id: 'e12b', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
        return mc(r, 'What do ' + t('A') + ' and ' + t('B') + ' really control between them, and which coefficient did the student ignore?', [
          { html: 'Together they control only the slope, ' + t('-\\frac{A}{B}=' + fT(-sh.A / sh.Bc)) + '; the student ignored ' + t('C') + ', which every intercept needs.', right: true },
          { html: t('A') + ' controls the ' + t('x') + '-intercept and ' + t('B') + ' the ' + t('y') + '-intercept; nothing was ignored.', why: 'Then the student would be right — but ' + t('(' + sh.A + ',\\ 0)') + ' doesn’t satisfy the equation.' },
          { html: 'They control the intercepts; the student ignored the slope.', why: 'The intercepts are ' + t('-\\frac{C}{A}') + ' and ' + t('-\\frac{C}{B}') + ' — they can’t be found without ' + t('C') + '.' },
          { html: 'They control the ' + t('y') + '-intercept only.', why: 'The ' + t('y') + '-intercept is ' + t('-\\frac{C}{B}') + '; ' + t('A') + ' and ' + t('B') + ' together give the slope.' }],
          t('A') + ' and ' + t('B') + ' together give the slope ' + t('-\\frac{A}{B}') + '. Each intercept, ' + t('-\\frac{C}{A}') + ' or ' + t('-\\frac{C}{B}') + ', needs ' + t('C') + ' — which the student ignored completely.', ['Write the intercept formulas. Which letters appear in them?'], 'what A and B control');
      } },
      { id: 'e12c', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
        return lineGen('Find the general form of the line that really does have ' + t('x') + '-intercept ' + t(sh.A) + ' and ' + t('y') + '-intercept ' + t(sh.Bc) + '.', { A: sh.Bc, B: sh.A, C: -sh.A * sh.Bc }, [{ is: { A: sh.A, B: sh.Bc, C: -sh.A * sh.Bc }, code: 'gf-swap-ab', hint: 'Check: ' + t(gT(sh.A, sh.Bc, -sh.A * sh.Bc)) + ' has ' + t('x') + '-intercept ' + t(sh.Bc) + ' — the coefficients are swapped.' }],
          t('\\frac{x}{' + sh.A + '}+\\frac{y}{' + sh.Bc + '}=1') + '; multiply by ' + t(sh.A * sh.Bc) + ': ' + t(sh.Bc + 'x+' + sh.A + 'y=' + sh.A * sh.Bc) + ', so ' + t(gT(sh.Bc, sh.A, -sh.A * sh.Bc)) + '.<br>Its ' + t('A') + ' and ' + t('B') + ' are the student’s numbers <b>swapped</b>.', ['Use intercept form ' + t('\\frac{x}{a}+\\frac{y}{b}=1') + ', or find the slope between the two intercept points.'], 'line from intercepts', { bad: [gT(sh.A, sh.Bc, -sh.A * sh.Bc)] });
      } },
      { id: 'e12d', level: 'EMG', outcome: 'RF5', make: function (r) {
        return mc(r, 'In the formulas ' + t('x') + '-int ' + t('=-\\frac{C}{A}') + ' and ' + t('y') + '-int ' + t('=-\\frac{C}{B}') + ', why does ' + t('A') + ' appear in the ' + t('x') + '-intercept?', [
          { html: 'For the ' + t('x') + '-intercept you set ' + t('y=0') + ', which removes the ' + t('By') + ' term and leaves ' + t('Ax+C=0') + ' — so you divide by ' + t('A') + '.', right: true },
          { html: 'Because ' + t('A') + ' comes first, like ' + t('x') + ' does.', why: 'Order isn’t the reason. Think about which term disappears when ' + t('y=0') + '.' },
          { html: 'For the ' + t('x') + '-intercept you set ' + t('x=0') + ', which leaves ' + t('Ax+C=0') + '.', why: 'Setting ' + t('x=0') + ' removes ' + t('Ax') + '. The ' + t('x') + '-intercept is where ' + t('y=0') + '.' },
          { html: 'Because ' + t('A') + ' is the slope.', why: 'The slope is ' + t('-\\frac{A}{B}') + ', not ' + t('A') + '.' }],
          t('x') + '-intercept: ' + t('y=0') + ' removes ' + t('By') + ', leaving ' + t('Ax+C=0') + ', ' + t('x=-\\frac{C}{A}') + '. ' + t('y') + '-intercept: ' + t('x=0') + ' removes ' + t('Ax') + ', leaving ' + t('By+C=0') + ', ' + t('y=-\\frac{C}{B}') + '.', ['Which term disappears when ' + t('y=0') + '?'], 'why A goes with x-int');
      } }] },
    { num: '13', shared: function (r) { return pickWhere(function () { var A = r.int(3, 9), Bc = r.int(2, 6); return { A: A, Bc: Bc, C: Bc * r.int(2, 6) }; }, function (o) { return cop(o.A, o.Bc) && o.C % o.A !== 0; }); },
      stem: function (sh) { return 'Asked for the slope of ' + t(gT(sh.A, sh.Bc, -sh.C)) + ', a student writes ' + t('m=' + fT(sh.A / sh.Bc)) + ', taking the sizes of ' + t('A') + ' and ' + t('B') + ' and ignoring the signs.'; }, parts: [
      { id: 'e13a', level: 'EMG', make: function (r, sh) {
        return B.slope('Solve the equation for ' + t('y') + ' and state the true slope.', toFr(-sh.A / sh.Bc), {}, t(sh.Bc + 'y=-' + sh.A + 'x+' + sh.C) + ' → ' + t(siT(-sh.A / sh.Bc, sh.C / sh.Bc)) + ', so ' + t('m=' + fT(-sh.A / sh.Bc)) + '. The student dropped the <b>negative sign</b> in ' + t('m=-\\frac{A}{B}') + '.', ['Move the ' + t('x') + '-term across (its sign changes), then divide by ' + t(sh.Bc) + '.'], 'true slope');
      } },
      { id: 'e13b', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
        var xi = sh.C / sh.A, yi = sh.C / sh.Bc;
        return B.fields('Determine both intercepts of this line (values).', [{ label: t('x') + '-intercept:', name: 'x-intercept', mode: 'math', keys: 'fraction' }, { label: t('y') + '-intercept:', name: 'y-intercept', mode: 'math', keys: 'fraction' }], [xBox(sh.A, sh.Bc, -sh.C), yBox(sh.A, sh.Bc, -sh.C)], [fT(xi), fT(yi)], t('x') + '-intercept ' + t(fT(xi)) + ', ' + t('y') + '-intercept ' + t(fT(yi)),
          t('y=0') + ': ' + t(sh.A + 'x=' + sh.C) + ', ' + t('x=' + fT(xi)) + '. &nbsp; ' + t('x=0') + ': ' + t(sh.Bc + 'y=' + sh.C) + ', ' + t('y=' + fT(yi)) + '.<br>Both intercepts are positive, so the line runs from upper left down to lower right: the slope must be <b>negative</b>.', ['Set ' + t('y=0') + ', then ' + t('x=0') + '.'], 'intercepts (sign check)');
      } },
      { id: 'e13c', level: 'EMG', make: function (r, sh) {
        return mc(r, 'Which one-line sign check, using only the signs of ' + t('A') + ' and ' + t('B') + ', catches this error every time?', [
          { html: t('A') + ' and ' + t('B') + ' the <b>same</b> sign → slope negative; <b>opposite</b> signs → slope positive.', right: true },
          { html: t('A') + ' and ' + t('B') + ' the same sign → slope positive; opposite signs → slope negative.', why: 'Test it on ' + t(gT(sh.A, sh.Bc, -sh.C)) + ': ' + t('A') + ' and ' + t('B') + ' are both positive, and the true slope ' + t(fT(-sh.A / sh.Bc)) + ' is negative.' },
          { html: 'The slope has the sign of ' + t('A') + '.', why: t('A=' + sh.A) + ' is positive, but the slope ' + t(fT(-sh.A / sh.Bc)) + ' is negative.' },
          { html: 'The slope has the sign of ' + t('C') + '.', why: t('C') + ' doesn’t affect the slope at all.' }],
          t('m=-\\frac{A}{B}') + ': if ' + t('A') + ' and ' + t('B') + ' share a sign, ' + t('\\frac{A}{B}>0') + ' and the minus makes ' + t('m') + ' negative; if their signs differ, ' + t('m') + ' is positive. Here both are positive, so ' + t(fT(sh.A / sh.Bc)) + ' fails the check.', ['Look at the minus sign in ' + t('m=-\\frac{A}{B}') + '.'], 'slope sign check');
      } },
      { id: 'e13d', level: 'EMG', make: function (r, sh) {
        return mc(r, 'The same student gets the right slope for ' + t(gT(sh.A, -sh.Bc, -sh.C)) + ' by the same method (sizes only). Why is that, and why is it dangerous?', [
          { html: 'The ignored minus in ' + t('-\\frac{A}{B}') + ' and the ignored minus in ' + t('B=' + (-sh.Bc)) + ' cancel, so it is right by luck — and a right answer gives no warning that the method is broken.', right: true },
          { html: 'The method is correct whenever ' + t('B') + ' is negative, so it is safe to use then.', why: 'It only works because two mistakes cancel. A method that is right by luck will fail silently elsewhere.' },
          { html: 'The method is always correct; part (a) was a calculation slip.', why: 'Part (a) shows the method gives the wrong sign when ' + t('A') + ' and ' + t('B') + ' share a sign.' },
          { html: 'It isn’t dangerous: right answers are what count.', why: 'A broken method that sometimes gives right answers goes unnoticed — and then fails on the next question.' }],
          'True slope: ' + t('-\\frac{' + sh.A + '}{-' + sh.Bc + '}=' + fT(sh.A / sh.Bc)) + '. The “sizes only” method gives ' + t(fT(sh.A / sh.Bc)) + ' because the two ignored minus signs would have cancelled anyway. That is more dangerous: no warning, so the method fails silently next time ' + t('A') + ' and ' + t('B') + ' share a sign.', ['Work out ' + t('-\\frac{A}{B}') + ' with the signs. Which signs did the student ignore?'], 'right by luck');
      } }] },
    { num: '14', section: 'Extra practice H — Solving for the coefficients', shared: function (r) {
        return pickWhere(function () { var a = r.int(1, 4), b = -r.int(2, 5), x0 = -r.int(2, 8), s = r.pick([1, 2, 3, -1]); return { a: a, b: b, x0: x0, s: s }; },
          function (o) { var c = -o.a * o.x0, p2 = [o.x0 - o.b * o.s, o.a * o.s]; return cop(o.a, -o.b) && o.a !== -o.b && c <= 24 && Math.abs(p2[0]) <= 10 && Math.abs(p2[1]) <= 10 && p2[0] !== 0; });
      },
      stem: function (sh) { var c = -sh.a * sh.x0; return 'The line ' + t('Ax+By+' + c + '=0') + ' passes through ' + t(pT([sh.x0 - sh.b * sh.s, sh.a * sh.s])) + ' and ' + t('(' + sh.x0 + ',\\ 0)') + '.'; }, parts: [
      { id: 'e14a', level: 'BEG', outcome: 'RF7', make: function (r, sh) {
        var c = -sh.a * sh.x0;
        return mc(r, 'Substituting the point ' + t('(' + sh.x0 + ',\\ 0)') + ' gives an equation with only one unknown. Which?', [
          { html: t(lin([[sh.x0, 'A'], [c, '']]) + '=0'), right: true },
          { html: t(lin([[sh.x0, 'B'], [c, '']]) + '=0'), why: 'The ' + t('x') + '-coordinate goes with ' + t('A') + ' (the coefficient of ' + t('x') + ').' },
          { html: t(lin([[sh.x0, 'A'], [-c, '']]) + '=0'), why: 'The constant stays ' + t('+' + c) + '.' },
          { html: t(lin([[sh.x0, 'A'], [sh.x0, 'B'], [c, '']]) + '=0'), why: 'The ' + t('y') + '-coordinate is ' + t('0') + ', so the ' + t('B') + ' term is ' + t('B(0)=0') + '.' }],
          t('A' + sgp(sh.x0) + '+B(0)+' + c + '=0') + ', i.e. ' + t(lin([[sh.x0, 'A'], [c, '']]) + '=0') + ' — only ' + t('A') + ' is left.', ['Replace ' + t('x') + ' and ' + t('y') + ' with the coordinates.'], 'substitute intercept point');
      } },
      { id: 'e14b', level: 'ADV', outcome: 'RF7', make: function (r, sh) {
        var c = -sh.a * sh.x0, p2 = [sh.x0 - sh.b * sh.s, sh.a * sh.s];
        return B.fields('Solve for ' + t('A') + ' and ' + t('B') + '.', [{ label: t('A') + ' =', name: 'A' }, { label: t('B') + ' =', name: 'B' }],
          [K.number(sh.a, function (v) { return v === -sh.a ? { code: 'sign', hint: t(lin([[sh.x0, 'A']]) + '=-' + c) + ': divide carefully.' } : null; }), K.number(sh.b, function (v) { return v === -sh.b ? { code: 'sign', hint: 'Substitute ' + t('A=' + sh.a) + ' and the other point; check the sign when you solve for ' + t('B') + '.' } : null; })],
          [String(sh.a), String(sh.b)], t('A=' + sh.a) + ', ' + t('B=' + sh.b) + ': ' + t(gT(sh.a, sh.b, c)),
          t(lin([[sh.x0, 'A'], [c, '']]) + '=0') + ', so ' + t('A=' + sh.a) + '.<br>' + t(pT(p2)) + ': ' + t(sh.a + prn(p2[0]) + (p2[1] < 0 ? '' : '+') + p2[1] + 'B+' + c + '=0') + ' → ' + t(lin([[p2[1], 'B']]) + '=' + (-(sh.a * p2[0] + c))) + ' → ' + t('B=' + sh.b) + '.<br>The line is ' + t(gT(sh.a, sh.b, c)) + '.', ['Solve the one-unknown equation for ' + t('A') + ' first, then substitute the other point.'], 'solve for A and B');
      } },
      { id: 'e14c', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
        var c = -sh.a * sh.x0;
        return mbFields('Determine the slope and both intercepts of the line ' + t(gT(sh.a, sh.b, c)) + '.', sh.a, sh.b, c, { x: true });
      } },
      { id: 'e14d', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
        var c = -sh.a * sh.x0;
        return mc(r, 'Two points normally determine one line, but a general-form equation can be multiplied through by any non-zero number. Why does fixing the constant at ' + t(c) + ' make ' + t('A') + ' and ' + t('B') + ' come out to single values?', [
          { html: 'The two points fix only the ratio ' + t('A:B:C') + '; fixing ' + t('C=' + c) + ' picks one equation from that family. (Fixing ' + t('C=0') + ' would force the line through the origin, which this one misses.)', right: true },
          { html: 'Any constant works the same way, including ' + t('0') + '.', why: 'With ' + t('C=0') + ' the line would have to pass through ' + t('(0,\\ 0)') + ' — this line doesn’t, so only ' + t('A=B=0') + ' would fit: no line.' },
          { html: 'Two points always give exactly one set of ' + t('A') + ', ' + t('B') + ', ' + t('C') + '.', why: 'Multiply the equation by ' + t('2') + ': same line, different ' + t('A') + ', ' + t('B') + ', ' + t('C') + '. Without fixing one number there are infinitely many.' },
          { html: 'Because ' + t(c) + ' is a multiple of both coordinates.', why: 'The size of the constant isn’t the point — fixing <b>any</b> non-zero value picks one member of the family.' }],
          'Multiplying ' + t('Ax+By+C=0') + ' by any ' + t('k\\ne0') + ' gives the same line, so the points determine only the ratio ' + t('A:B:C') + '. Fixing ' + t('C') + ' picks one member, so ' + t('A') + ' and ' + t('B') + ' are single values. ' + t('C=0') + ' would force the line through the origin — impossible here.', ['What happens to ' + t('A') + ', ' + t('B') + ', ' + t('C') + ' if you multiply the equation by ' + t('2') + '?'], 'why fixing C works');
      } },
      { id: 'e14e', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
        var c = -sh.a * sh.x0;
        return B.fields('Suppose the question had said ' + t('Ax+By+' + 2 * c + '=0') + ' through the same two points. Find ' + t('A') + ' and ' + t('B') + '.', [{ label: t('A') + ' =', name: 'A' }, { label: t('B') + ' =', name: 'B' }],
          [K.number(2 * sh.a, function (v) { return v === sh.a ? { code: 'gf-k-mixed', hint: 'The constant doubled, so every coefficient doubles.' } : null; }), K.number(2 * sh.b, function (v) { return v === sh.b ? { code: 'gf-k-mixed', hint: 'The constant doubled, so every coefficient doubles.' } : null; })],
          [String(2 * sh.a), String(2 * sh.b)], t('A=' + 2 * sh.a) + ', ' + t('B=' + 2 * sh.b),
          t(2 * c + '=2\\times ' + c) + ', so every coefficient doubles: ' + t('A=' + 2 * sh.a) + ', ' + t('B=' + 2 * sh.b) + ', giving ' + t(gT(2 * sh.a, 2 * sh.b, 2 * c)) + ' — the same line.<br>Verify: ' + t(lin([[sh.x0, 'A'], [2 * c, '']]) + '=0\\Rightarrow A=' + 2 * sh.a) + ' ✓', ['Same line, constant doubled: what happens to the other coefficients?'], 'predict A, B for doubled C');
      } }] },
    { num: '15', shared: function (r) {
        return pickWhere(function () { var A0 = r.pick([4, 6, 8, 12, 8]), pq = r.pick([[3, 4], [1, 2], [3, 2], [5, 4], [1, 3], [2, 3]]), uv = r.pick([[2, 5], [1, 3], [2, 3], [3, 4], [4, 5], [3, 2]]); return { A0: A0, p: pq[0], q: pq[1], u: uv[0], v: uv[1], C0: r.pick([20, 12, 18, 10, 30]), r1: r.int(1, 9) }; },
          function (o) { return o.A0 % o.q === 0 && o.A0 % o.u === 0 && cop(o.u, o.v) && cop(o.p, o.q) && o.C0 % o.A0 !== 0 && -o.A0 * o.p / o.q !== -o.A0 * o.v / o.u; });
      },
      stem: function (sh) { return 'Consider the line ' + t(sh.A0 + 'x+By-' + sh.C0 + '=0') + ', where ' + t('B') + ' is unknown.'; }, parts: [
      { id: 'e15a', level: 'PRG', make: function (r, sh) {
        var Bv = -sh.A0 * sh.p / sh.q, par = sh.A0 * sh.q / sh.p;
        return numPart('Determine ' + t('B') + ' so that this line is <b>perpendicular</b> to ' + t(gT(sh.p, sh.q, -sh.r1)) + '. Use ' + t('-\\frac{A}{B}') + ' for both slopes.', Bv, function (v) {
          if (v === -Bv) return { code: 'sign', hint: 'The slope needed is ' + t(fT(sh.q / sh.p)) + ' (positive). Solve ' + t('-\\frac{' + sh.A0 + '}{B}=' + fT(sh.q / sh.p)) + ' carefully.' };
          if (near(v, par)) return { code: 'gf-perp-par', hint: 'That makes the lines <b>parallel</b>. For perpendicular, use the negative reciprocal of ' + t(fT(-sh.p / sh.q)) + '.' };
          return null;
        }, 'Slopes: ' + t('-\\frac{' + sh.A0 + '}{B}') + ' and ' + t(fT(-sh.p / sh.q)) + '. Perpendicular: ' + t('-\\frac{' + sh.A0 + '}{B}=' + fT(sh.q / sh.p)) + ' → ' + t(sh.q + 'B=' + (-sh.A0 * sh.p)) + ' → ' + t('B=' + Bv) + '.<br>Check: ' + t(gT(sh.A0, Bv, -sh.C0)) + ' has ' + t('m=' + fT(sh.q / sh.p)) + ', and ' + t('(' + fT(sh.q / sh.p) + ')(' + fT(-sh.p / sh.q) + ')=-1') + ' ✓', ['Find the slope of the given line, take its negative reciprocal, and set ' + t('-\\frac{' + sh.A0 + '}{B}') + ' equal to it.'], 'B for perpendicular');
      } },
      { id: 'e15b', level: 'PRG', make: function (r, sh) {
        var Bv = -sh.A0 * sh.v / sh.u, perp = sh.A0 * sh.u / sh.v;
        return numPart('Determine ' + t('B') + ' so that this line is <b>parallel</b> to ' + t(gT(sh.u, -sh.v, 1)) + '.', Bv, function (v) {
          if (v === -Bv) return { code: 'sign', hint: 'The slope of ' + t(gT(sh.u, -sh.v, 1)) + ' is ' + t('-\\frac{' + sh.u + '}{-' + sh.v + '}=' + fT(sh.u / sh.v)) + ' (positive).' };
          if (near(v, perp)) return { code: 'gf-perp-par', hint: 'That makes the lines <b>perpendicular</b>. Parallel lines have equal slopes.' };
          return null;
        }, t(gT(sh.u, -sh.v, 1)) + ': ' + t('m=' + fT(sh.u / sh.v)) + '. Need ' + t('-\\frac{' + sh.A0 + '}{B}=' + fT(sh.u / sh.v)) + ' → ' + t(sh.u + 'B=' + (-sh.A0 * sh.v)) + ' → ' + t('B=' + Bv) + '.', ['Set the two slopes equal.'], 'B for parallel');
      } },
      { id: 'e15c', level: 'EMG', make: function (r, sh) {
        var xv = sh.C0 / sh.A0;
        return B.fields('Determine ' + t('B') + ' so that this line is <b>vertical</b>, and state the line for that ' + t('B') + ' in the form ' + t('x=k') + '.', [{ label: t('B') + ' =', name: 'B', mode: 'math', keys: 'fraction' }, { label: 'Line:', name: 'x =', mode: 'math', keys: 'fraction', before: t('x=') }],
          [K.value(0), K.value(xv, { diag: function (v) { return near(v, sh.A0 / sh.C0) ? { code: 'flip', hint: t(sh.A0 + 'x=' + sh.C0) + ': divide ' + t(sh.C0) + ' by ' + t(sh.A0) + '.' } : null; } })], ['0', fT(xv)], t('B=0') + ': ' + t(sh.A0 + 'x-' + sh.C0 + '=0') + ', i.e. ' + t('x=' + fT(xv)),
          'Vertical means no ' + t('y') + '-term: ' + t('B=0') + '. Then ' + t(sh.A0 + 'x-' + sh.C0 + '=0') + ', so ' + t('x=\\frac{' + sh.C0 + '}{' + sh.A0 + '}=' + fT(xv)) + '.', ['A vertical line has no ' + t('y') + '-term.'], 'B for vertical');
      } },
      { id: 'e15d', level: 'EMG', make: function (r, sh) {
        return mc(r, 'Why does <b>no</b> value of ' + t('B') + ' make ' + t(sh.A0 + 'x+By-' + sh.C0 + '=0') + ' horizontal?', [
          { html: 'A horizontal line needs ' + t('A=0') + ' (no ' + t('x') + '-term), but the ' + t(sh.A0 + 'x') + ' term is there whatever ' + t('B') + ' is: ' + t('-\\frac{' + sh.A0 + '}{B}') + ' is never ' + t('0') + '.', right: true },
          { html: t('B=0') + ' makes it horizontal.', why: t('B=0') + ' removes the ' + t('y') + '-term and makes the line <b>vertical</b>.' },
          { html: 'A very large ' + t('B') + ' makes the slope exactly ' + t('0') + '.', why: 'A large ' + t('B') + ' makes the slope close to ' + t('0') + ', but a fraction with a non-zero top is never exactly ' + t('0') + '.' },
          { html: 'Because ' + t('C') + ' isn’t ' + t('0') + '.', why: t('C') + ' only slides the line; it can’t change its direction.' }],
          'Horizontal means slope ' + t('0') + ', i.e. ' + t('A=0') + '. Here ' + t('A=' + sh.A0) + ' no matter what ' + t('B') + ' is, and ' + t('-\\frac{' + sh.A0 + '}{B}=0') + ' has no solution. Part (c) worked because ' + t('B') + ' itself could be ' + t('0') + '; for a horizontal line the coefficient that would have to change is ' + t('A') + '.', ['Which coefficient must be ' + t('0') + ' for a horizontal line?'], 'no horizontal');
      } }] },
    { num: '16', section: 'Extra practice — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: 'e16', level: 'EMG', outcome: 'RF7', make: function (r) {
        var o = pickWhere(function () { var pq = r.pick([[2, 3], [1, 2], [3, 4], [2, 5], [3, 2], [1, 3]]), g = r.pick([1, 2, 2]); return { p: pq[0], q: pq[1], g: g, c: r.int(1, 9), b0: -r.int(2, 7) }; }, function (o) { return cop(o.p, o.q); });
        var mp = -o.q / o.p, par = o.p / o.q;
        var R = red(mp, -1, o.b0), D1 = red(par, -1, o.b0), D2 = red(mp, -1, -o.b0), D3 = red(-par, -1, o.b0);
        return mc(r, 'The general form of the line through ' + t('(0,\\ ' + o.b0 + ')') + ' that is perpendicular to ' + t(gT(o.p * o.g, -o.q * o.g, o.c)) + ' is', [
          { html: t(rT(R)), right: true },
          { html: t(rT(D1)), why: 'That line has slope ' + t(fT(par)) + ' — the same as the given line, so it is parallel.' },
          { html: t(rT(D2)), why: 'Right slope, but check the ' + t('y') + '-intercept: it must be ' + t(o.b0) + '.' },
          { html: t(rT(D3)), why: 'That slope, ' + t(fT(-par)) + ', is the opposite but not the reciprocal. Perpendicular needs the negative reciprocal.' }],
          t(gT(o.p * o.g, -o.q * o.g, o.c)) + ': ' + t('m=' + fT(par)) + ', so the perpendicular slope is ' + t(fT(mp)) + '; ' + t('b=' + o.b0) + '.<br>' + t(siT(mp, o.b0)) + '; ' + toGenSol(toFr(mp), [o.b0, 1]), ['Find the slope of the given line, take the negative reciprocal, use ' + t('b=' + o.b0) + ', then convert.'], 'perpendicular through y-int (MC)');
      } }] },
    { num: '17', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: 'e17', level: 'EMG', make: function (r) {
        var o = pickWhere(function () { var pq = r.pick([[1, 3], [1, 2], [2, 3], [1, 4], [3, 4], [2, 5]]), g = r.pick([1, 2]); return { p: pq[0], q: pq[1], g: g, B1: r.pick([4, 6, 8, 9, 10, 12]), c1: r.int(1, 9), c2: r.int(1, 9) }; }, function (o) { return cop(o.p, o.q) && o.B1 % o.p === 0 && (o.B1 * o.p) % o.q !== 0; });
        var k = o.B1 * o.q / o.p;
        return mc(r, 'The lines ' + t('kx+' + o.B1 + 'y-' + o.c1 + '=0') + ' and ' + t(gT(o.p * o.g, -o.q * o.g, o.c2)) + ' are perpendicular. The value of ' + t('k') + ' is', [
          { html: t(k), right: true },
          { html: t(-k), why: 'Check the sign: the slope of the first line is ' + t('-\\frac{k}{' + o.B1 + '}') + ', and it must equal ' + t(fT(-o.q / o.p)) + '.' },
          { html: t(fT(o.B1 * o.p / o.q)), why: 'Solve ' + t('-\\frac{k}{' + o.B1 + '}=' + fT(-o.q / o.p)) + ' — multiply both sides by ' + t('-' + o.B1) + '.' },
          { html: t(fT(-o.B1 * o.p / o.q)), why: 'That value makes the lines <b>parallel</b> (equal slopes). Perpendicular needs the negative reciprocal.' }],
          t(gT(o.p * o.g, -o.q * o.g, o.c2)) + ': ' + t('m=' + fT(o.p / o.q)) + ', so the other slope must be ' + t(fT(-o.q / o.p)) + '.<br>' + t('-\\frac{k}{' + o.B1 + '}=' + fT(-o.q / o.p)) + ', so ' + t('k=' + k) + '. Check: ' + t('(' + fT(-o.q / o.p) + ')(' + fT(o.p / o.q) + ')=-1') + ' ✓', ['Write each slope as ' + t('-\\frac{A}{B}') + '. Perpendicular slopes multiply to ' + t('-1') + '.'], 'k for perpendicular (MC)');
      } }] },
    { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
      { id: 'e18', level: 'PRG', outcome: 'RF5', make: function (r) {
        var o = pickWhere(function () { return { A: r.int(2, 9), Bc: r.int(2, 9), j: r.int(1, 4) }; }, function (o) { return cop(o.A, o.Bc) && o.A !== o.Bc && o.A * o.Bc * o.j <= 120; });
        var C = o.A * o.Bc * o.j, p = C / o.A, q = C / o.Bc;
        return B.nr('The line with equation ' + t(gT(o.A, o.Bc, -C)) + ' has ' + t('x') + '-intercept ' + t('(p,\\ 0)') + ' and ' + t('y') + '-intercept ' + t('(0,\\ q)') + '. The value of ' + t('p+q') + ' is ________.', p + q, function (v) {
          if (v === o.A + o.Bc) return { code: 'gf-swap-ab', hint: t('A') + ' and ' + t('B') + ' aren’t the intercepts. Set ' + t('y=0') + ' to find ' + t('p') + '.' };
          return null;
        }, t('y=0') + ': ' + t(o.A + 'x=' + C) + ', ' + t('p=' + p) + '. &nbsp; ' + t('x=0') + ': ' + t(o.Bc + 'y=' + C) + ', ' + t('q=' + q) + '.<br>' + t('p+q=' + p + '+' + q + '=' + (p + q)) + '.', ['Find each intercept: ' + t('y=0') + ' for ' + t('p') + ', ' + t('x=0') + ' for ' + t('q') + '.'], 'p + q from intercepts');
      } }] }
  ];

  HW.defineLesson({
    id: 'u7l3', unit: 7, num: '3', title: 'The General Form of a Linear Equation', outcome: 'RF6',
    blurb: 'Writing Ax + By + C = 0, reading slope and intercepts back out of it, and using it to test parallel and perpendicular lines.',
    questions: [
      { num: '1', section: 'Assignment — General form', stem: 'Convert the equation from slope–intercept form ' + t('(y=mx+b)') + ' to general form ' + t('(Ax+By+C=0)') + ', where ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' are integers, ' + t('A\\ge 0') + ', and ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' have no common factor.', parts: [
        { id: '1a', level: 'BEG', make: function (r) { var m = r.int(2, 9), b = -r.int(2, 9); return convPart(null, [m, 1], [b, 1]); } },
        { id: '1b', level: 'BEG', make: function (r) { var m = -r.int(2, 9), b = r.int(2, 9); return convPart(null, [m, 1], [b, 1]); } },
        { id: '1c', level: 'EMG', make: function (r) {
          var lt = r.pick([['p', 'q'], ['a', 'b'], ['h', 'k'], ['r', 's'], ['c', 'd']]), pv = lt[0], qv = lt[1], key = pv + 'x-y+' + qv + '=0';
          return { prompt: t('y=' + pv + 'x+' + qv), input: { type: 'math', keys: 'eq', vars: ['x', 'y', pv, qv], placeholder: 'e.g. ' + pv + 'x - y + ' + qv + ' = 0' }, check: symCheck(pv, qv), key: key, answer: t(key),
            solution: 'Subtract ' + t('y') + ' from both sides: ' + t('0=' + pv + 'x-y+' + qv) + ', so ' + t(key) + '.<br>(Here ' + t('A=' + pv) + ', ' + t('B=-1') + ', ' + t('C=' + qv) + '.)', hints: ['Treat ' + t(pv) + ' and ' + t(qv) + ' like numbers: move the ' + t('y') + ' to the side with ' + t(pv + 'x') + '.'], text: 'general form of y = ' + pv + 'x + ' + qv,
            good: [qv + '+' + pv + 'x-y=0', '-y+' + pv + 'x+' + qv + '=0', '0=' + pv + 'x-y+' + qv], bad: [pv + 'x+y+' + qv + '=0', pv + 'x-y-' + qv + '=0', 'y=' + pv + 'x+' + qv, '-' + pv + 'x+y-' + qv + '=0'] };
        } },
        { id: '1d', level: 'EMG', make: function (r) { var q = r.int(2, 6), p = pickWhere(function () { return r.int(1, 2 * q - 1); }, function (p) { return cop(p, q) && p !== q; }), b = r.int(2, 9); return convPart(null, [-p, q], [b, 1]); } },
        { id: '1e', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { var q = r.pick([2, 3, 4]), s = q * r.pick([2, 3]), p = r.int(1, 2 * q), rr = r.int(1, s - 1); return { q: q, s: s, p: p, rr: rr }; }, function (o) { return o.s <= 12 && cop(o.p, o.q) && cop(o.rr, o.s) && o.p !== o.q; });
          return convPart(null, [o.p, o.q], [o.rr, o.s]);
        } },
        { id: '1f', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { var dd = r.pick([[2, 3], [3, 2], [2, 5], [3, 4], [4, 3], [5, 2]]); return { q: dd[0], s: dd[1], p: r.int(1, 9), rr: r.int(1, 4) }; }, function (o) { return cop(o.p, o.q) && cop(o.rr, o.s) && o.p !== o.q; });
          return convPart(null, [o.p, o.q], [-o.rr, o.s]);
        } }] },
      { num: '2', stem: 'Determine the slope and ' + t('y') + '-intercept of the graph of the line.', parts: [
        { id: '2a', level: 'BEG', make: function (r) { var L3 = q2a(r); return mbFields(t(gT(L3[0], L3[1], L3[2])), L3[0], L3[1], L3[2]); } },
        { id: '2b', level: 'EMG', make: function (r) { var L3 = q2b(r, false); return mbFields(t(gT(L3[0], L3[1], L3[2])), L3[0], L3[1], L3[2]); } },
        { id: '2c', level: 'EMG', make: function (r) { var L3 = q2b(r, true); return mbFields(t(gT(L3[0], L3[1], L3[2])), L3[0], L3[1], L3[2]); } },
        { id: '2d', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { return { a: r.pick([1, 1, 2, 3]), b: r.pick([2, 3, 4]), c: r.int(1, 9), g: r.pick([2, 3, 4, 5]) }; }, function (o) { return cop(o.a, o.b) && o.c % o.b !== 0 && gcd(gcd(o.a, o.b), o.c) === 1 && o.a !== o.b; });
          var A = o.g * o.a, Bc = o.g * o.b, C = -o.g * o.c;
          var p = mbFields(t(gT(A, Bc, C)), A, Bc, C, { solPre: 'Optional first step: divide every term by the common factor ' + t(o.g) + ': ' + t(gT(o.a, o.b, -o.c)) + '.' });
          return p;
        } },
        { id: '2e', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var Bc = r.pick([4, 6, 8, 6]), A = r.int(2, Bc - 1), k = r.int(2, 6); return { A: A, Bc: Bc, C: Bc * k * r.pick([1, 1, -1]) }; }, function (o) { return gcd(o.A, o.Bc) > 1 && o.A % o.Bc !== 0; });
          var eqT = o.Bc + 'y=' + lin([[o.A, 'x'], [o.C, '']]);
          return mbFields(t(eqT), -o.A, o.Bc, -o.C, { eqT: eqT, solY: t('y=\\frac{' + lin([[o.A, 'x'], [o.C, '']]) + '}{' + o.Bc + '}') + ' &nbsp;→&nbsp; ' + t(siT(o.A / o.Bc, o.C / o.Bc)), text: 'slope/intercept of ' + eqT });
        } },
        { id: '2f', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var A = r.int(2, 9), Bc = r.int(2, 6); return { A: A, Bc: Bc, C: Bc * r.int(2, 7) }; }, function (o) { return cop(o.A, o.Bc) && o.A !== o.Bc; });
          var eqT = lin([[o.A, 'x'], [o.Bc, 'y']]) + '=' + o.C;
          return mbFields(t(eqT), o.A, o.Bc, -o.C, { eqT: eqT, solY: t(o.Bc + 'y=' + lin([[-o.A, 'x'], [o.C, '']])) + ' &nbsp;→&nbsp; ' + t(siT(-o.A / o.Bc, o.C / o.Bc)), text: 'slope/intercept of ' + eqT });
        } }] },
      { num: '3', stem: 'Determine the slope, ' + t('y') + '-intercept and ' + t('x') + '-intercept of the graph of the line.', parts: [
        { id: '3a', level: 'EMG', outcome: 'RF5', make: function (r) { var A = r.int(2, 6), k = r.int(2, 6), L3 = [A, 1, -A * k]; return mbFields(t(gT(L3[0], L3[1], L3[2])), L3[0], L3[1], L3[2], { x: true }); } },
        { id: '3b', level: 'PRG', outcome: 'RF5', make: function (r) {
          var o = pickWhere(function () { return { A: r.int(2, 9), Bc: r.int(2, 6), k: r.pick([1, 1, 2]) }; }, function (o) { return cop(o.A, o.Bc) && o.A * o.Bc * o.k <= 60; });
          return mbFields(t(gT(o.A, -o.Bc, o.A * o.Bc * o.k)), o.A, -o.Bc, o.A * o.Bc * o.k, { x: true });
        } },
        { id: '3c', level: 'PRG', outcome: 'RF5', make: function (r) {
          var o = pickWhere(function () { return { A: r.pick([4, 6, 8, 9, 10, 6]), Bc: r.int(3, 9), C: r.int(2, 9) }; }, function (o) { return cop(o.A, o.Bc) && gcd(o.C, o.A) > 1 && o.C % o.A !== 0 && o.C % o.Bc !== 0; });
          return mbFields(t(gT(o.A, -o.Bc, -o.C)), o.A, -o.Bc, -o.C, { x: true });
        } }] },
      { num: '4', stem: 'Write the equation of the line in general form.', parts: [
        { id: '4', level: 'PRG', outcome: 'RF7', make: function (r) {
          var o = pickWhere(function () { var B1 = r.pick([2, 3, 4]), A1 = r.int(2, 7), k1 = r.int(2, 6), m2 = r.int(2, 8), B2 = r.pick([2, 3]), b = -r.int(2, 7); return { A1: A1, B1: B1, C1: B1 * k1, m2: m2, B2: B2, b: b }; },
            function (o) { return cop(o.A1, o.B1) && !near(o.m2, o.A1 / o.B1) && o.b !== o.C1 / o.B1; });
          var A2 = o.m2 * o.B2, C2 = o.b * o.B2, m = [o.A1, o.B1], T = { m: m, b: o.b }, k1 = o.C1 / o.B1;
          var wr = [{ is: { m: m, b: k1 }, code: 'gf-other-b', hint: 'That line has the ' + t('y') + '-intercept of the <b>first</b> line. The ' + t('y') + '-intercept must match ' + t(gT(A2, -o.B2, C2)) + '.' },
            { is: { m: o.m2, b: o.b }, code: 'gf-other-m', hint: 'That’s the slope of ' + t(gT(A2, -o.B2, C2)) + '. Your line must be parallel to ' + t(gT(o.A1, -o.B1, o.C1)) + ', so it takes <b>that</b> line’s slope.' }];
          return lineGen('Write the equation, in general form, of a line parallel to ' + t(gT(o.A1, -o.B1, o.C1)) + ' and with the same ' + t('y') + '-intercept as ' + t(gT(A2, -o.B2, C2)) + '.', T, wr,
            '<b>Slope:</b> ' + t(gT(o.A1, -o.B1, o.C1)) + ' → ' + t(siT(o.A1 / o.B1, k1)) + '; parallel lines share it: ' + t('m=' + fT(o.A1 / o.B1)) + '.<br><b>' + t('y') + '-intercept:</b> ' + t(gT(A2, -o.B2, C2)) + ' → ' + t(siT(o.m2, o.b)) + ', so ' + t('b=' + o.b) + '.<br>' + t(siT(o.A1 / o.B1, o.b)) + '. ' + toGenSol(toFr(o.A1 / o.B1), [o.b, 1]),
            ['Find the slope of the first line (solve it for ' + t('y') + ') — a parallel line has the same slope.', 'Find the ' + t('y') + '-intercept of the second line, build ' + t('y=mx+b') + ', then convert to general form.'], 'parallel line, same y-int, general form',
            { bad: [gen({ m: m, b: k1 }), gen({ m: o.m2, b: o.b }), gen({ m: [-o.B1, o.A1], b: o.b })] });
        } }] },
      { num: '5', stem: 'Write the equation of the line in general form.', parts: [
        { id: '5', level: 'PRG', outcome: 'RF7', make: function (r) {
          var o = pickWhere(function () { var B1 = r.pick([2, 3, 4, 5]), A1 = r.int(2, 7), k1 = r.int(1, 5) * r.pick([1, -1]), m2 = r.int(2, 8), b = r.int(5, 30) * r.pick([1, 1, -1]); return { A1: A1, B1: B1, C1: B1 * k1, m2: m2, b: b }; },
            function (o) { return cop(o.A1, o.B1) && o.A1 !== o.B1 && o.b !== o.C1 / o.B1; });
          var mp = [-o.B1, o.A1], T = { m: mp, b: o.b }, k1 = o.C1 / o.B1;
          var wr = [{ is: { m: [o.A1, o.B1], b: o.b }, code: 'gf-par-for-perp', hint: 'That line is <b>parallel</b> to ' + t(gT(o.A1, -o.B1, o.C1)) + '. A perpendicular line needs the negative reciprocal of its slope.' },
            { is: { m: mp, b: k1 }, code: 'gf-other-b', hint: 'Right slope, but that’s the ' + t('y') + '-intercept of the <b>first</b> line. Use the ' + t('y') + '-intercept of ' + t(gT(o.m2, -1, o.b)) + '.' }];
          return lineGen('Write the equation, in general form, of a line perpendicular to ' + t(gT(o.A1, -o.B1, o.C1)) + ' and with the same ' + t('y') + '-intercept as ' + t(gT(o.m2, -1, o.b)) + '.', T, wr,
            '<b>Slope:</b> ' + t(gT(o.A1, -o.B1, o.C1)) + ' → ' + t(siT(o.A1 / o.B1, k1)) + ', so the perpendicular slope is ' + t(fT(-o.B1 / o.A1)) + '.<br><b>' + t('y') + '-intercept:</b> ' + t(gT(o.m2, -1, o.b)) + ' → ' + t(siT(o.m2, o.b)) + ', so ' + t('b=' + o.b) + '.<br>' + t(siT(-o.B1 / o.A1, o.b)) + '. ' + toGenSol(mp, [o.b, 1]),
            ['Perpendicular slopes are negative reciprocals: flip the fraction and change the sign.', 'Find the ' + t('y') + '-intercept of the second line, build ' + t('y=mx+b') + ', then convert to general form.'], 'perpendicular line, same y-int, general form',
            { bad: [gen({ m: [o.A1, o.B1], b: o.b }), gen({ m: mp, b: k1 }), gen({ m: [o.B1, o.A1], b: o.b })] });
        } }] },
      { num: '6', shared: function (r) {
          return pickWhere(function () { var a = r.pick([2, 3, 4, 5]), b = r.int(3, 7), y0 = r.pick([2, 3, 4, 2]), s = r.int(2, 4), kb = r.int(2, 8); return { a: a, b: b, y0: y0, A2: a * s, kb: kb, C2: y0 * kb }; },
            function (o) { return cop(o.a, o.b) && o.a !== o.b && -o.A2 * o.b / o.a !== o.kb; });
        },
        stem: function (sh) { return 'Consider the lines ' + t(gT(sh.a, -sh.b, sh.b * sh.y0)) + ' and ' + t(sh.A2 + 'x+ky-' + sh.C2 + '=0') + '.'; }, parts: [
        { id: '6a', level: 'PRG', make: function (r, sh) {
          var k = -sh.A2 * sh.b / sh.a;
          return numPart('Determine the value of ' + t('k') + ' if the lines have the same slope.', k, function (v) {
            if (v === -k) return { code: 'gf-k-sign', hint: 'Check the sign: the slope of the second line is ' + t('-\\frac{' + sh.A2 + '}{k}') + '. Set that equal to ' + t(fT(sh.a / sh.b)) + '.' };
            if (v === sh.kb) return { code: 'gf-k-mixed', hint: 'That value makes the <b>' + t('y') + '-intercepts</b> equal. This part is about the slopes.' };
            return null;
          }, 'First line: ' + t(siT(sh.a / sh.b, sh.y0)) + ', so ' + t('m=' + fT(sh.a / sh.b)) + '.<br>Second line: ' + t('ky=-' + sh.A2 + 'x+' + sh.C2) + ', so ' + t('m=-\\frac{' + sh.A2 + '}{k}') + '.<br>' + t('-\\frac{' + sh.A2 + '}{k}=' + fT(sh.a / sh.b) + '\\ \\Rightarrow\\ ' + sh.a + 'k=' + (-sh.A2 * sh.b) + '\\ \\Rightarrow\\ k=' + k) + '.',
            ['Write the slope of each line in terms of ' + t('k') + ' (use ' + t('m=-\\frac{A}{B}') + ' or solve for ' + t('y') + '), then set them equal.'], 'k for equal slopes');
        } },
        { id: '6b', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
          var k = sh.kb, ka = -sh.A2 * sh.b / sh.a;
          return numPart('Determine the value of ' + t('k') + ' if the lines have the same ' + t('y') + '-intercept.', k, function (v) {
            if (v === -k) return { code: 'gf-k-sign', hint: 'Check the sign: set ' + t('x=0') + ' in the second line: ' + t('ky-' + sh.C2 + '=0') + ', so ' + t('y=\\frac{' + sh.C2 + '}{k}') + '.' };
            if (v === sh.C2 * sh.y0) return { code: 'gf-k-mult', hint: t('\\frac{' + sh.C2 + '}{k}=' + sh.y0) + ' means ' + t('k=\\frac{' + sh.C2 + '}{' + sh.y0 + '}') + ' — divide, don’t multiply.' };
            if (v === ka) return { code: 'gf-k-mixed', hint: 'That value makes the <b>slopes</b> equal. This part is about the ' + t('y') + '-intercepts.' };
            return null;
          }, 'The ' + t('y') + '-intercept of ' + t(gT(sh.a, -sh.b, sh.b * sh.y0)) + ' is ' + t(sh.y0) + ' (set ' + t('x=0') + ': ' + t('-' + sh.b + 'y+' + sh.b * sh.y0 + '=0') + ').<br>For the second line, ' + t('x=0') + ' gives ' + t('ky=' + sh.C2) + ', so the ' + t('y') + '-intercept is ' + t('\\frac{' + sh.C2 + '}{k}') + '.<br>' + t('\\frac{' + sh.C2 + '}{k}=' + sh.y0 + '\\ \\Rightarrow\\ k=' + k) + '.',
            ['Set ' + t('x=0') + ' in each equation to get its ' + t('y') + '-intercept (the second one in terms of ' + t('k') + ').'], 'k for equal y-intercepts');
        } }] },
      { num: '7', shared: function (r) {
          return pickWhere(function () { var pq = r.pick([[2, 3], [1, 2], [3, 4], [2, 5], [1, 3], [3, 2]]), g = r.pick([2, 3]), x1 = r.int(2, 8), s = r.pick([1, 1, 2]), C2 = r.int(5, 15); return { p: pq[0], q: pq[1], g: g, x1: x1, s: s, C2: C2 }; },
            function (o) { return o.C2 % o.x1 !== 0 && o.p * o.g * o.x1 <= 60 && -o.p * o.s !== o.C2 / o.x1; });
        },
        stem: function (sh) { return 'Consider the lines ' + t(gT(sh.p * sh.g, -sh.q * sh.g, -sh.p * sh.g * sh.x1)) + ' and ' + t('ax+' + sh.q * sh.s + 'y-' + sh.C2 + '=0') + '.'; }, parts: [
        { id: '7a', level: 'PRG', make: function (r, sh) {
          var A1 = sh.p * sh.g, B1 = sh.q * sh.g, B2 = sh.q * sh.s, a = -sh.p * sh.s;
          return numPart('Determine the value of ' + t('a') + ' if the lines have the same slope.', a, function (v) {
            if (v === -a) return { code: 'gf-k-sign', hint: 'Check the sign: the slope of ' + t('ax+' + B2 + 'y-' + sh.C2 + '=0') + ' is ' + t('-\\frac{a}{' + B2 + '}') + '.' };
            return null;
          }, t(gT(A1, -B1, -A1 * sh.x1)) + ' → ' + t(siT(sh.p / sh.q, -A1 * sh.x1 / B1)) + ', so ' + t('m=' + fT(sh.p / sh.q)) + '.<br>' + t('ax+' + B2 + 'y-' + sh.C2 + '=0') + ' → ' + t('y=-\\frac{a}{' + B2 + '}x+' + fT(sh.C2 / B2)) + '.<br>' + t('-\\frac{a}{' + B2 + '}=' + fT(sh.p / sh.q) + '\\ \\Rightarrow\\ a=' + a) + '.',
            ['Write the slope of the second line in terms of ' + t('a') + ' and set it equal to the slope of the first line.'], 'a for equal slopes');
        } },
        { id: '7b', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
          var A1 = sh.p * sh.g, aS = -sh.p * sh.s;
          var p = B.fraction('Determine the value of ' + t('a') + ' if the lines have the same ' + t('x') + '-intercept.', [sh.C2, sh.x1], { diag: function (v) {
            if (near(v, sh.C2 * sh.x1)) return { code: 'gf-k-mult', hint: t('\\frac{' + sh.C2 + '}{a}=' + sh.x1) + ' means ' + t('a=\\frac{' + sh.C2 + '}{' + sh.x1 + '}') + ' — divide, don’t multiply.' };
            if (near(v, aS)) return { code: 'gf-k-mixed', hint: 'That value makes the <b>slopes</b> equal. This part is about the ' + t('x') + '-intercepts.' };
            return null;
          } }, t('x') + '-intercept of the first line: set ' + t('y=0') + ': ' + t(A1 + 'x-' + A1 * sh.x1 + '=0') + ', so ' + t('x=' + sh.x1) + '.<br>' + t('x') + '-intercept of the second: ' + t('ax-' + sh.C2 + '=0') + ', so ' + t('x=\\frac{' + sh.C2 + '}{a}') + '.<br>' + t('\\frac{' + sh.C2 + '}{a}=' + sh.x1 + '\\ \\Rightarrow\\ a=\\frac{' + sh.C2 + '}{' + sh.x1 + '}' + (gcd(sh.C2, sh.x1) > 1 ? '=' + fT(sh.C2 / sh.x1) : '')) + '.',
            ['Set ' + t('y=0') + ' in each equation to get its ' + t('x') + '-intercept (the second one in terms of ' + t('a') + ').'], 'a for equal x-intercepts');
          p.input.before = t('a=');
          return p;
        } }] },
      { num: '8', shared: function (r) { return q8shared(r); }, stem: function (sh) { return q8stem(sh); }, parts: [
        { id: '8i', sub: 'i', level: 'EMG', outcome: 'RF5', make: function (r, sh) { return q8part(sh, 0); } },
        { id: '8ii', sub: 'ii', level: 'BEG', outcome: 'RF5', make: function (r, sh) { return q8part(sh, 1); } },
        { id: '8iii', sub: 'iii', level: 'BEG', outcome: 'RF5', make: function (r, sh) { return q8part(sh, 2); } },
        { id: '8iv', sub: 'iv', level: 'BEG', outcome: 'RF5', make: function (r, sh) { return q8part(sh, 3); } },
        { id: '8v', sub: 'v', level: 'EMG', outcome: 'RF5', make: function (r, sh) { return q8part(sh, 4); } }] },
      { num: '9', section: 'Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'BEG', make: function (r) {
          var o = pickWhere(function () { return { A: r.int(2, 9), Bc: r.int(2, 9), C: r.int(1, 9) }; }, function (o) { return cop(o.A, o.Bc) && o.A !== o.Bc && o.C !== o.A && o.C !== o.Bc; });
          return mc(r, 'The slope of the line with equation ' + t(gT(o.A, o.Bc, -o.C)) + ' is', [
            { html: t(fT(-o.A / o.Bc)), right: true },
            { html: t(fT(-o.Bc / o.A)), why: 'That’s ' + t('B') + ' over ' + t('A') + '. Solve for ' + t('y') + ': you divide by the coefficient of ' + t('y') + ', so the slope is ' + t('-\\frac{A}{B}') + '.' },
            { html: t(fT(o.A / o.Bc)), why: 'Check the sign: moving ' + t(o.A + 'x') + ' to the other side makes it ' + t('-' + o.A + 'x') + '.' },
            { html: t(fT(o.C / o.Bc)), why: 'That’s the ' + t('y') + '-intercept. The slope is the coefficient of ' + t('x') + ' once you solve for ' + t('y') + '.' }],
            t(o.Bc + 'y=-' + o.A + 'x+' + o.C) + ' → ' + t(siT(-o.A / o.Bc, o.C / o.Bc)) + ', so the slope is ' + t(fT(-o.A / o.Bc)) + '.', ['Solve for ' + t('y') + ', or use ' + t('m=-\\frac{A}{B}') + '.'], 'slope of ' + gT(o.A, o.Bc, -o.C));
        } }] },
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', outcome: 'RF5', make: function (r) {
          var b0 = -r.int(2, 6), k = r.int(2, 4), k2 = pickWhere(function () { return r.int(2, 5); }, function (v) { return v !== k && v !== -b0; }), c5 = r.int(3, 7);
          var right = [1, -k, b0 * k], dA = [1, -b0, b0], dB = [1, k2, k2];
          return mc(r, 'Which line has a ' + t('y') + '-intercept of ' + t(b0) + '?', [
            { html: t(rT(right)), right: true },
            { html: t(gT(dA[0], dA[1], dA[2])), why: 'The constant ' + t(b0) + ' isn’t the ' + t('y') + '-intercept by itself: ' + t(gT(dA[0], dA[1], dA[2])) + ' gives ' + t(siT(-1 / dA[1], -b0 / dA[1])) + '.' },
            { html: t(gT(dB[0], dB[1], dB[2])), why: 'Solve for ' + t('y') + ': ' + t(siT(-1 / k2, -1)) + ', so its ' + t('y') + '-intercept is ' + t('-1') + '.' },
            { html: t('2y=' + lin([[c5, 'x'], [b0, '']])), why: 'Divide <b>every</b> term by ' + t('2') + ': ' + t(siT(c5 / 2, b0 / 2)) + ', so the ' + t('y') + '-intercept is ' + t(fT(b0 / 2)) + '.' }],
            'Solve each for ' + t('y') + ': ' + t(rT(right)) + ' → ' + t(siT(1 / k, b0)) + ', so its ' + t('y') + '-intercept is ' + t(b0) + '. (The others give ' + t(fT(-b0 / dA[1])) + ', ' + t('-1') + ' and ' + t(fT(b0 / 2)) + '.)', ['Set ' + t('x=0') + ' in each equation and solve for ' + t('y') + '.'], 'which line has y-int ' + b0);
        } }] },
      { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { A: r.pick([1, 1, 2, 3]), Bc: r.int(2, 7), C: r.int(3, 15) }; }, function (o) { return cop(o.A, o.Bc) && o.A !== o.Bc; });
          var m = -o.A / o.Bc;
          return mc(r, 'The slope of a line perpendicular to the line ' + t(gT(o.A, o.Bc, o.C)) + ' is', [
            { html: t(fT(-1 / m)), right: true },
            { html: t(fT(m)), why: 'That’s the slope of the given line itself (a parallel line). A perpendicular line has the negative reciprocal.' },
            { html: t(fT(-m)), why: 'You changed the sign but didn’t flip the fraction. The negative reciprocal does both.' },
            { html: t(fT(1 / m)), why: 'You flipped the fraction but kept the sign. Perpendicular slopes have opposite signs.' }],
            t(o.Bc + 'y=' + lin([[-o.A, 'x'], [-o.C, '']])) + ' → ' + t(siT(m, -o.C / o.Bc)) + ', slope ' + t(fT(m)) + '. The negative reciprocal is ' + t(fT(-1 / m)) + '.', ['Find the slope of the given line first, then take its negative reciprocal.'], 'perpendicular slope to ' + gT(o.A, o.Bc, o.C));
        } }] },
      { num: '12', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'EMG', outcome: 'RF5', make: function (r) {
          var o = pickWhere(function () { var Bc = r.int(2, 5), A = r.int(2, 6), k = r.int(2, 5) * r.pick([1, -1]), qx = r.int(3, 9), qy = r.int(-8, 8); return { Bc: Bc, A: A, C: Bc * k, py: -k, qx: qx, qy: qy }; },
            function (o) { var s = (o.qy - o.py) / o.qx; return cop(o.A, o.Bc) && o.qy !== o.py && !near(s, -o.A / o.Bc) && !near(s, o.A / o.Bc) && Math.abs(o.qy - o.py) !== o.qx && toFr(s)[1] > 1 && !near((o.qy + o.py) / o.qx, -s) && !near((o.qy + o.py) / o.qx, s); });
          var s = (o.qy - o.py) / o.qx, eqT = lin([[o.Bc, 'y'], [o.A, 'x'], [o.C, '']]) + '=0';
          return mc(r, 'The line ' + t(eqT) + ' intersects the ' + t('y') + '-axis at ' + t('P') + '. The slope of the line joining ' + t('P') + ' to ' + t('Q' + pT([o.qx, o.qy])) + ' is', [
            { html: t(fT(s)), right: true },
            { html: t(fT(-s)), why: 'Check the signs in ' + t('\\frac{y_2-y_1}{x_2-x_1}') + ', especially subtracting a negative.' },
            { html: t(fT(-o.A / o.Bc)), why: 'That’s the slope of the line itself. The question asks for the slope of segment ' + t('PQ') + '.' },
            { html: t(fT(1 / s)), why: 'Slope is rise over run: the change in ' + t('y') + ' goes on top.' }],
            t('x=0') + ': ' + t(o.Bc + 'y' + (o.C < 0 ? '' : '+') + o.C + '=0') + ', so ' + t('y=' + o.py) + ' and ' + t('P(0,\\ ' + o.py + ')') + '.<br>' + t('m_{PQ}=\\frac{' + o.qy + '-' + sgp(o.py) + '}{' + o.qx + '-0}=' + fT(s)) + '.', ['Find ' + t('P') + ' by setting ' + t('x=0') + '. Then use ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + '.'], 'slope from y-int to Q');
        } }] },
      { num: '13', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '13', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { c: r.pick([2, 4, 6, 8, 6]), m2: r.int(2, 5), d: r.int(5, 19), e: r.int(2, 9) }; }, function (o) { return o.c !== o.m2; });
          var a = -o.c * o.m2;
          return mc(r, 'The lines with equations ' + t('ay=' + o.c + 'x+' + o.d) + ' and ' + t('y=' + o.m2 + 'x-' + o.e) + ' are perpendicular. The value of ' + t('a') + ' is', [
            { html: t(a), right: true },
            { html: t(fT(o.c / o.m2)), why: 'That value makes the slopes <b>equal</b> (parallel lines). Perpendicular slopes multiply to ' + t('-1') + '.' },
            { html: t(fT(-1 / (o.c * o.m2))), why: 'Solve ' + t('\\frac{' + o.c + '}{a}\\cdot ' + o.m2 + '=-1') + ' carefully: multiply both sides by ' + t('a') + ' first.' },
            { html: t(-a), why: 'Check the sign: perpendicular slopes multiply to ' + t('-1') + ', not ' + t('+1') + '.' }],
            t('ay=' + o.c + 'x+' + o.d) + ' → ' + t('y=\\frac{' + o.c + '}{a}x+\\frac{' + o.d + '}{a}') + ', slope ' + t('\\frac{' + o.c + '}{a}') + '; the other slope is ' + t(o.m2) + '.<br>' + t('\\frac{' + o.c + '}{a}\\cdot ' + o.m2 + '=-1\\ \\Rightarrow\\ \\frac{' + o.c * o.m2 + '}{a}=-1\\ \\Rightarrow\\ a=' + a) + '.', ['Write the slope of the first line in terms of ' + t('a') + '. Perpendicular slopes multiply to ' + t('-1') + '.'], 'a for perpendicular');
        } }] },
      { num: '14', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '14', level: 'PRG', outcome: 'RF5', make: function (r) {
          var famY = r.chance(0.6), Bc = r.int(2, 8), C = Bc * r.int(2, 5);
          var eqT = famY ? 'kx+' + Bc + 'y-' + C + '=0' : Bc + 'x+ky-' + C + '=0';
          var opts = [{ html: '1, 2, and 3', why: 'Test the slope: it is ' + t(famY ? '-\\frac{k}{' + Bc + '}' : '-\\frac{' + Bc + '}{k}') + ', which changes when ' + t('k') + ' changes.' },
            { html: '1 only', why: 'The slope ' + t(famY ? '-\\frac{k}{' + Bc + '}' : '-\\frac{' + Bc + '}{k}') + ' depends on ' + t('k') + ', so the lines don’t share a slope.' },
            { html: '2 only', right: famY, why: famY ? null : 'Set ' + t('x=0') + ': ' + t('ky=' + C) + ', so the ' + t('y') + '-intercept ' + t('\\frac{' + C + '}{k}') + ' depends on ' + t('k') + '.' },
            { html: '3 only', right: !famY, why: famY ? 'Set ' + t('y=0') + ': ' + t('kx=' + C) + ', so the ' + t('x') + '-intercept ' + t('\\frac{' + C + '}{k}') + ' changes with ' + t('k') + '.' : null }];
          var sol = famY ? t(Bc + 'y=-kx+' + C) + ' → ' + t('y=-\\frac{k}{' + Bc + '}x+' + C / Bc) + '.<br>Slope ' + t('-\\frac{k}{' + Bc + '}') + ' changes with ' + t('k') + ' (1 false); ' + t('y') + '-intercept ' + t(C / Bc) + ' for every ' + t('k') + ' (2 true); ' + t('x') + '-intercept ' + t('\\frac{' + C + '}{k}') + ' changes (3 false). <b>2 only</b>.'
            : 'Set ' + t('y=0') + ': ' + t(Bc + 'x=' + C) + ', so the ' + t('x') + '-intercept is ' + t(C / Bc) + ' for every ' + t('k') + ' (3 true).<br>Slope ' + t('-\\frac{' + Bc + '}{k}') + ' and ' + t('y') + '-intercept ' + t('\\frac{' + C + '}{k}') + ' both change with ' + t('k') + ' (1, 2 false). <b>3 only</b>.';
          return mc(r, 'Consider the following statements about all the lines in the form ' + t(eqT) + ', where ' + t('k\\in\\mathbb{R}') + ' (and ' + t('k\\ne 0') + ').<br><b>Statement 1:</b> The lines have the same slope.<br><b>Statement 2:</b> The lines have the same ' + t('y') + '-intercept.<br><b>Statement 3:</b> The lines have the same ' + t('x') + '-intercept.<br>Which of the statement(s) is/are true?', opts, sol, ['Find the slope and both intercepts in terms of ' + t('k') + '. Which ones don’t contain ' + t('k') + '?'], 'family ' + eqT, true);
        } }] },
      { num: '15', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '15', level: 'BEG', outcome: 'RF5', make: function (r) {
          var o = pickWhere(function () { var A = r.int(2, 7), Bc = r.int(2, 7), x0 = r.int(-6, 6), y0 = r.int(-5, 5); return { A: A, Bc: Bc, x0: x0, y0: y0 }; }, function (o) { return cop(o.A, o.Bc) && o.A !== o.Bc && Math.abs(o.x0) + 2 * o.Bc <= 14 && Math.abs(o.y0) + 2 * o.A <= 14; });
          var C = -(o.A * o.x0 - o.Bc * o.y0), on = function (s) { return [o.x0 + o.Bc * s, o.y0 + o.A * s]; };
          var combos = [['A'], ['A', 'B'], ['A', 'C'], ['B', 'C']], ri = r.int(0, 3), want = combos[ri];
          
          var pts = {}, sl = r.pick([[0, 2, -1], [-1, 1, 2], [1, -1, 2]]);
          ['A', 'B', 'C'].forEach(function (nm, i) { var p = on(sl[i]); if (want.indexOf(nm) < 0) { p = [p[0], p[1] + r.pick(pm(1, 6))]; } pts[nm] = p; });
          var Lq = [o.A, -o.Bc, C], vals = {}; ['A', 'B', 'C'].forEach(function (nm) { vals[nm] = valAt(o.A, -o.Bc, C, pts[nm]); });
          var opts = combos.map(function (c, i) { var bad = ['A', 'B', 'C'].filter(function (nm) { return (c.indexOf(nm) >= 0) !== (vals[nm] === 0); })[0]; return { html: c.map(function (x) { return t(x); }).join(' and ') + ' only', right: i === ri, why: i === ri ? null : 'Substitute ' + t(bad) + ' into the equation: ' + t(o.A + prn(pts[bad][0]) + '-' + o.Bc + prn(pts[bad][1]) + (C < 0 ? '' : '+') + C + '=' + vals[bad]) + '.' }; });
          return mc(r, 'Line ' + t('L') + ' has equation ' + t(gT(Lq[0], Lq[1], Lq[2])) + '. ' + t('A') + ' is the point ' + t(pT(pts.A)) + ', ' + t('B') + ' is ' + t(pT(pts.B)) + ', and ' + t('C') + ' is ' + t(pT(pts.C)) + '. Which of these points lie on line ' + t('L') + '?', opts,
            ['A', 'B', 'C'].map(function (nm) { return t(nm + pT(pts[nm])) + ': ' + t(o.A + prn(pts[nm][0]) + '-' + o.Bc + prn(pts[nm][1]) + (C < 0 ? '' : '+') + C + '=' + vals[nm]) + (vals[nm] === 0 ? ' — on ' + t('L') : ' — not on ' + t('L')); }).join('<br>'),
            ['Substitute each point into the left side. The point is on the line exactly when you get ' + t('0') + '.'], 'which points on ' + gT(Lq[0], Lq[1], Lq[2]), true);
        } }] },
      { num: '16', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '16', level: 'PRG', make: function (r) {
          var o = pickWhere(function () { var A = r.int(2, 7), Bc = r.int(2, 5), x1 = r.int(-3, 4), y1 = r.int(-2, 4), s = r.pick([1, 2, 2, 3]); return { A: A, Bc: Bc, x1: x1, y1: y1, s: s, c: r.int(2, 9) }; },
            function (o) { var p = o.Bc * o.s - o.y1; return cop(o.A, o.Bc) && o.A !== o.Bc && p > 0 && p <= 30; });
          var x2 = o.x1 + o.A * o.s, y2 = o.y1 - o.Bc * o.s, p = -y2, mp = -o.Bc / o.A;
          var par = o.y1 + o.A / o.Bc * (x2 - o.x1);
          return B.nr('Given that the line joining the points ' + t(pT([o.x1, o.y1])) + ' and ' + t('(' + x2 + ',\\ -p)') + ', where ' + t('p\\in W') + ', is perpendicular to the line ' + t(gT(o.A, -o.Bc, -o.c)) + ', then the value of ' + t('p') + ' is ________.', p, function (v) {
            if (v === -p) return { code: 'gf-nr-sign', hint: 'The point is ' + t('(' + x2 + ',\\ -p)') + ': its ' + t('y') + '-coordinate is ' + t('-p') + ', not ' + t('p') + '.' };
            if (near(v, -par) || near(v, par)) return { code: 'gf-nr-parallel', hint: 'You used the slope of the given line. The segment is <b>perpendicular</b> to it, so use the negative reciprocal.' };
            return null;
          }, t(gT(o.A, -o.Bc, -o.c)) + ' → ' + t(siT(o.A / o.Bc, -o.c / o.Bc)) + ', slope ' + t(fT(o.A / o.Bc)) + '; the perpendicular slope is ' + t(fT(mp)) + '.<br>' + t('\\frac{-p-' + sgp(o.y1) + '}{' + x2 + '-' + sgp(o.x1) + '}=' + fT(mp)) + ' &nbsp;→&nbsp; ' + t('-p-' + sgp(o.y1) + '=' + (mp * (x2 - o.x1))) + ' &nbsp;→&nbsp; ' + t('p=' + p) + '.',
            ['Find the slope of the given line, then its negative reciprocal.', 'Set ' + t('\\frac{-p-y_1}{x_2-x_1}') + ' equal to that slope and solve for ' + t('p') + '.'], 'p for perpendicular segment');
        } }] }
    ],
    extra: EXTRA
  });
})(window);
