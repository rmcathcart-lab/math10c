/* Math 10C · Unit 5 · Lesson 3 — Where Graphs Meet the Axes (RF1)
 * Assignment questions 1–11 (u5_L03.tex) and the Lesson 3 Extra Practice (u5_EP03.tex).
 * Every part is a generator: it keeps the booklet question's structure (which side the constant is on, a coefficient
 * on y, decimals, a fraction coefficient, two x-intercepts, none, the origin) and changes the numbers; the booklet's own
 * numbers are among the possible values.
 * Answer formats follow the booklet's wording: "the value of the intercept" → one number (a point gets a nudge);
 * "write each intercept point as an ordered pair" → two boxes (x-intercept points, y-intercept points) with a
 * "none" key (a bare value gets a nudge). Sketches become multiple choice between small graphs (Q6b, Q7a) or the
 * equation of the line (Q7b–d). Explain-questions become multiple choice with misconception hints.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, P = HW.poly;

  HW.addCodes({
    'int-gave-x': 'Gave the x-intercept instead of the y-intercept', 'int-gave-y': 'Gave the y-intercept instead of the x-intercept',
    'int-no-divide': 'Didn’t divide by the coefficient', 'int-sign': 'Intercept with the wrong sign', 'int-gave-m': 'Gave the coefficient of x',
    'int-zero': 'Dropped the constant term', 'int-one-root': 'Gave only one of two x-intercepts', 'int-no-root': 'Didn’t take the square root',
    'int-point-not-value': 'Gave a point where a value was asked', 'int-value-not-point': 'Gave a value where a point was asked',
    'int-pt-flip': 'Intercept point with the coordinates swapped', 'int-pt-swap': 'x- and y-intercept points swapped', 'int-off-axis': 'Point not on the axis',
    'int-missing': 'Missed an intercept', 'int-extra': 'Extra intercept', 'int-said-none': 'Said “none” when the intercept exists',
    'int-missed-none': 'Gave an intercept that doesn’t exist', 'int-bad-value': 'Wrong intercept value (written as a value)',
    'ctx-no-fee': 'Left out the starting amount', 'ctx-cents': 'Cents/dollars slip', 'ctx-rate-n': 'Added the rate instead of multiplying',
    'ctx-no-sub': 'Didn’t subtract the starting amount', 'ctx-added': 'Added the starting amount instead of subtracting', 'ctx-eval': 'Substituted instead of solving',
    'ctx-mult': 'Multiplied instead of dividing', 'ctx-used': 'Gave the amount used instead of the amount left', 'ctx-rate': 'Gave the rate',
    'ctx-square-coef': 'Squared the coefficient too: (−5t)²', 'ctx-sign-sq': 'Lost the minus sign of −5t²', 'ctx-no-c': 'Left out the constant term',
    'ctx-neg-time': 'Kept the negative time', 'ctx-max-time': 'Gave the time of the maximum', 'ctx-platform': 'Gave the time back at platform height',
    'ctx-hundreds': 'Forgot the units are hundreds', 'ctx-loss-sign': 'Sign of a loss', 'ctx-diff': 'Combined the two solutions', 'ctx-dist': 'Didn’t expand the brackets correctly',
    'eq-no-equals': 'Not written as an equation', 'eq-unreadable': 'Equation unreadable', 'eq-not-line': 'Not a straight line',
    'eq-h-v': 'Mixed up horizontal and vertical lines', 'eq-slanted': 'Wrote a slanted line', 'eq-const': 'Wrong constant in the equation',
    'eq-int-coef': 'Coefficients not integers', 'eq-reduce': 'Common factor left in the coefficients', 'eq-lead-neg': 'Leading coefficient negative',
    'eq-not-zero': 'Right side not 0', 'eq-slope-sign': 'Slope with the wrong sign', 'eq-slope-flip': 'Slope upside down (run over rise)',
    'eq-b-xint': 'Used the x-intercept as b', 'eq-no-a': 'Forgot the factor a', 'nr-one-sign': 'Used a positive value for a negative intercept',
    'nr-sum': 'Added instead of multiplying', 'nr-pos-only': 'Multiplied only the positive intercepts'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function same(a, b) { return Math.abs(a - b) < 1e-9; }
  function nT(x) { return F(cl(x)); }
  function vt(x) { if (Math.abs(x - Math.round(x)) < 1e-9) return F(Math.round(x)); for (var q = 2; q <= 24; q++) if (Math.abs(x * q - Math.round(x * q)) < 1e-6) return ex.texRat(ex.norm(Math.round(x * q), q)); return String(cl(x)); }
  function rT(p, q) { return ex.texRat(ex.norm(p, q)); }
  function sg(c) { c = cl(c); return c < 0 ? nT(c) : '+' + nT(c); }               // signed constant: "+5" / "-5"
  function sgp(c) { c = cl(c); return c < 0 ? '(' + nT(c) + ')' : nT(c); }       // bracket a negative number
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var r = a % b; a = b; b = r; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function pm(a, b) { return range(a, b).concat(range(a, b).map(function (x) { return -x; })); }
  function term(c, v, first) {
    var neg, mag;
    if (Array.isArray(c)) { var q = ex.norm(c[0], c[1]); if (!q[0]) return ''; neg = q[0] < 0; mag = q[1] === 1 ? String(Math.abs(q[0])) : '\\frac{' + Math.abs(q[0]) + '}{' + q[1] + '}'; }
    else { c = cl(c); if (!c) return ''; neg = c < 0; mag = nT(Math.abs(c)); }
    if (v && mag === '1') mag = '';
    return (neg ? '-' : first ? '' : '+') + mag + v;
  }
  function lin(list) { var s = ''; list.forEach(function (p) { s += term(p[0], p[1], s === ''); }); return s || '0'; }
  function ptT(p) { return '(' + vt(p[0]) + ',\\ ' + vt(p[1]) + ')'; }
  function ptsT(ps) { return ps.map(ptT).join(',\\ '); }
  function ptKey(p) { return '(' + vt(p[0]) + ', ' + vt(p[1]) + ')'; }
  function uniqV(a) { var o = []; a.forEach(function (x) { if (!o.some(function (y) { return same(x, y); })) o.push(x); }); return o.sort(function (x, y) { return y - x; }); }
  function pickWhere(gen, okf) { for (var i = 0; i < 2000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u5l3: no valid numbers'); }

  var HX = ['At an ' + t('x') + '-intercept the graph is on the ' + t('x') + '-axis, where ' + t('y=0') + '. Substitute ' + t('y=0') + ' and solve for ' + t('x') + '.',
    'If ' + t('x') + ' has a coefficient, divide by it at the end — and watch the signs.'];
  var HY = ['At a ' + t('y') + '-intercept the graph is on the ' + t('y') + '-axis, where ' + t('x=0') + '. Substitute ' + t('x=0') + ' and solve for ' + t('y') + '.',
    'If ' + t('y') + ' has a coefficient, divide by it at the end — and watch the signs.'];
  var HXY = ['For the ' + t('x') + '-intercept(s) substitute ' + t('y=0') + '; for the ' + t('y') + '-intercept(s) substitute ' + t('x=0') + '.',
    'An ' + t('x') + '-intercept point looks like ' + t('(a,\\ 0)') + ' and a ' + t('y') + '-intercept point like ' + t('(0,\\ b)') + '. If an equation has no solution, press <b>none</b>.'];

  /* ---------------- answer readers ---------------- */
  function strip(s) { return String(s == null ? '' : s).replace(/\\(left|right)/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\\{|\\\}|\\lbrace|\\rbrace/g, ' ').trim(); }
  function looksPoint(s) { return /\([^()]*,[^()]*\)/.test(strip(s)); }
  function isNone(s) { var z = String(s == null ? '' : s).replace(/\\text\{\s*([^}]*)\}/g, '$1').replace(/[\s-]+/g, '').toLowerCase(); return /^(none|no|nointercepts?|dne|no[xy]intercepts?|nosolutions?)$/.test(z); }
  function pairList(resp) {
    var s = strip(resp).trim(); // (only outer braces are removed: the ones inside \frac{}{} must stay)
    if (/^\{[\s\S]*\}$/.test(s) && !/^\{[^{}]*\}\{/.test(s)) s = s.slice(1, -1).trim();
    if (!s) return { empty: true };
    var re = /\(([^()]*)\)/g, m, out = [];
    while ((m = re.exec(s))) {
      var xy = m[1].split(','); if (xy.length !== 2) return { bad: true };
      var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return { bad: true };
      var va = ex.value(a.ast), vb = ex.value(b.ast); if (!isFinite(va) || !isFinite(vb)) return { bad: true };
      out.push([va, vb]);
    }
    if (s.replace(re, '').replace(/[,;\s]|\\[,;!: ]|\\text\{\s*and\s*\}|and/g, '').length || !out.length) return { bad: true };
    return { pairs: out };
  }
  function valueList(resp) {
    var s = strip(resp).replace(/\\text\{\s*(or|and)\s*\}/gi, ',').replace(/\b(or|and)\b/gi, ',').replace(/[a-zA-Z]\s*=\s*/g, '').replace(/\\pm|±/g, '±');
    if (!s.trim()) return null;
    var out = [], ps = s.split(/[,;]/);
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i].trim(); if (!p) continue;
      var both = p.charAt(0) === '±'; if (both) p = p.slice(1);
      var r = ex.parse(p); if (!r.ok) return null;
      var v = ex.value(r.ast); if (!isFinite(v)) return null;
      out.push(v); if (both) out.push(-v);
    }
    return out.length ? uniqV(out) : null;
  }
  function sameVals(A, T) { A = uniqV(A); T = uniqV(T); return A.length === T.length && A.every(function (x, i) { return same(x, T[i]); }); }
  function samePts(A, T) {
    var k = function (p) { return cl(p[0]) + '|' + cl(p[1]); }, a = {}, b = {};
    A.forEach(function (p) { a[k(p)] = 1; }); T.forEach(function (p) { b[k(p)] = 1; });
    var ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every(function (x) { return b[x]; });
  }

  /* ---- one box of intercept points. want: [[x, y], …] or null (no such intercept). axis 'x' | 'y'.
   * o: { other (the other box's points), noneWhy (they gave points but there are none), saidNoneWhy, missWhy, diag(pairs) } ---- */
  function ptsCheck(want, axis, o) {
    o = o || {};
    var zero = axis === 'x' ? 1 : 0, keep = 1 - zero, nm = o.names || { x: 'x', y: 'y' }, other = nm[axis === 'x' ? 'y' : 'x'], name = t(nm[axis]) + '-intercept';
    var vals = want ? want.map(function (p) { return p[keep]; }) : [];
    var sample = axis === 'x' ? t('(3,\\ 0)') : t('(0,\\ 3)');
    axis = nm[axis];
    var an = /^[aefhilmnorsx]$/i.test(axis) ? 'an' : 'a', An = an.charAt(0).toUpperCase() + an.slice(1);
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type the ' + name + ' point(s), or press <b>none</b> if there isn’t one.');
      if (isNone(s)) return want ? wrong('int-said-none', o.saidNoneWhy || 'There is ' + an + ' ' + name + ' here: substitute ' + t(other + '=0') + ' and solve — the equation does have a solution.') : ok();
      var L = pairList(s);
      if (L.bad || L.empty) {
        var V = valueList(s);
        if (V) {
          if (!want) return wrong('int-missed-none', o.noneWhy || 'Check: when you substitute, the equation has no solution — so there is no ' + name + '.');
          if (sameVals(V, vals)) return form('int-value-not-point', 'Right value' + (vals.length > 1 ? 's' : '') + ' — but the question asks for intercept <b>points</b>. Write each one as an ordered pair, like ' + sample + '.');
          return wrong('int-bad-value', 'Write each intercept point as an ordered pair, like ' + sample + ' — and check your value: substitute ' + t(other + '=0') + ' and solve.');
        }
        return form('int-unreadable', 'Write each point as an ordered pair in brackets, like ' + sample + ', with a comma between points — or press <b>none</b>.');
      }
      var A = L.pairs;
      if (!want) return wrong('int-missed-none', o.noneWhy || 'Check: when you substitute ' + t(other + '=0') + ', the equation has no solution — so there is no ' + name + '. Press <b>none</b>.');
      if (samePts(A, want)) return ok();
      if (o.diag) { var h = o.diag(A); if (h) return wrong(h.code, h.hint); }
      var sub = A.every(function (p) { return want.some(function (q) { return same(p[0], q[0]) && same(p[1], q[1]); }); }); // only correct points, some missing
      if (o.other && samePts(A, o.other) && !sub) return wrong('int-pt-swap', 'Those are the ' + t(other) + '-intercept points (they have ' + t(axis + '=0') + '). This box is for where the graph meets the ' + t(axis) + '-axis.');
      if (!sub && A.every(function (p) { return same(p[keep], 0) && vals.some(function (v) { return same(v, p[zero]); }); }) && !vals.every(function (v) { return same(v, 0); }))
        return wrong('int-pt-flip', 'Your coordinates are in the wrong order. ' + An + ' ' + name + ' point lies on the ' + t(axis) + '-axis, so its ' + t(other) + '-coordinate is ' + t('0') + ': ' + (axis === 'x' ? t('(a,\\ 0)') : t('(0,\\ b)')) + '.');
      var off = A.filter(function (p) { return !same(p[zero], 0); });
      if (off.length) return wrong('int-off-axis', t(ptT(off[0])) + ' isn’t on the ' + t(axis) + '-axis: every ' + name + ' point has ' + t(other) + '-coordinate ' + t('0') + '.');
      var got = uniqV(A.map(function (p) { return p[keep]; }));
      var miss = vals.filter(function (v) { return !got.some(function (g) { return same(g, v); }); }), extra = got.filter(function (g) { return !vals.some(function (v) { return same(g, v); }); });
      if (miss.length && !extra.length) return wrong('int-missing', o.missWhy || 'Correct so far — but there is another ' + name + '. When you solve, look for <b>every</b> solution.');
      if (extra.length && !miss.length) return wrong('int-extra', 'One of your points isn’t ' + an + ' ' + name + ': substitute it into the equation to check.');
      if (got.length === vals.length && got.every(function (g) { return vals.some(function (v) { return same(-g, v); }); })) return wrong('int-sign', 'Check the sign' + (vals.length > 1 ? 's' : '') + ' of your ' + name + (vals.length > 1 ? 's' : '') + ' — redo the step where you move a term to the other side.');
      return wrong('value', null);
    };
  }
  /* "Determine the x- and y-intercepts … write each intercept point as an ordered pair": two boxes with a none key.
   * xs / ys: the intercept values (null = none). o: { xNone, yNone, xSaidNone, ySaidNone, xMiss, yMiss, xDiag, yDiag, sol, hints, text, bad, good } */
  function interceptsPart(prompt, xs, ys, o) {
    o = o || {};
    var ord = function (vs) { vs = uniqV(vs); return vs.length === 2 && same(vs[0], -vs[1]) ? vs : vs.reverse(); };
    var xp = xs ? ord(xs).map(function (v) { return [v, 0]; }) : null, yp = ys ? ord(ys).map(function (v) { return [0, v]; }) : null;
    var nm = o.names || { x: 'x', y: 'y' };
    var fields = [{ name: t(nm.x) + '-intercept point(s)', label: t(nm.x) + '-intercept point(s)', mode: 'math', keys: 'pairs', none: true, wide: true, placeholder: 'e.g. (2, 0)  or  none' },
      { name: t(nm.y) + '-intercept point(s)', label: t(nm.y) + '-intercept point(s)', mode: 'math', keys: 'pairs', none: true, wide: true, placeholder: 'e.g. (0, 3)  or  none' }];
    if (o.only) fields = fields.filter(function (f, i) { return o.only === (i ? 'y' : 'x'); });
    var chx = ptsCheck(xp, 'x', { other: yp, noneWhy: o.xNone, saidNoneWhy: o.xSaidNone, missWhy: o.xMiss, diag: o.xDiag, names: o.names });
    var chy = ptsCheck(yp, 'y', { other: xp, noneWhy: o.yNone, saidNoneWhy: o.ySaidNone, missWhy: o.yMiss, diag: o.yDiag, names: o.names });
    var kx = xp ? xp.map(ptKey).join(', ') : 'none', ky = yp ? yp.map(ptKey).join(', ') : 'none';
    var ax = t(nm.x) + '-intercept point' + (xp && xp.length > 1 ? 's' : '') + ': ' + (xp ? t(ptsT(xp)) : '<b>none</b>'), ay = t(nm.y) + '-intercept point' + (yp && yp.length > 1 ? 's' : '') + ': ' + (yp ? t(ptsT(yp)) : '<b>none</b>');
    var checks = o.only === 'x' ? [chx] : o.only === 'y' ? [chy] : [chx, chy], keys = o.only === 'x' ? [kx] : o.only === 'y' ? [ky] : [kx, ky];
    var p = B.fields(prompt, fields, checks, keys, o.only === 'x' ? ax : o.only === 'y' ? ay : ax + '<br>' + ay, o.sol, o.hints || HXY, o.text);
    var rev = function (ps) { return ps.slice().reverse().map(function (q) { return '\\left(' + vt(q[0]) + ',' + vt(q[1]) + '\\right)'; }).join(','); };
    var good = [[xp ? rev(xp) : '\\text{none}', yp ? rev(yp) : 'none']];
    var bad = [];
    if (!o.only) {
      if (xp && yp && !samePts(xp, yp)) bad.push([ky, kx]);
      if (xp && !xp.every(function (q) { return same(q[0], 0); })) bad.push([xp.map(function (q) { return ptKey([q[1], q[0]]); }).join(', '), ky]);
      if (xp) bad.push(['none', ky]); else bad.push(['(1, 0)', ky]);
      if (yp) bad.push([kx, 'none']); else bad.push([kx, '(0, 1)']);
      if (xp && xp.length > 1) bad.push([ptKey(xp[0]), ky]);
      if (xp) bad.push([uniqV(xs).map(vt).join(', '), ky]);
    } else {
      var mine = o.only === 'x' ? xp : yp;
      good = [[good[0][o.only === 'x' ? 0 : 1]]];
      bad.push([mine ? 'none' : (o.only === 'x' ? '(1, 0)' : '(0, 1)')]);
      if (mine && !mine.every(function (q) { return same(q[0], 0) && same(q[1], 0); })) bad.push([mine.map(function (q) { return ptKey([q[1], q[0]]); }).join(', ')]);
      if (mine) bad.push([mine.map(function (q) { return vt(q[o.only === 'x' ? 0 : 1]); }).join(', ')]);
    }
    p.good = good.concat(o.good || []); p.bad = bad.concat(o.bad || []);
    return p;
  }

  /* ---- one number with targeted diagnoses. dl: [[wrongValue, code, hint], …] (entries equal to the answer are dropped) ---- */
  function numPart(prompt, ans, dl, sol, hints, text, inp) {
    ans = cl(ans);
    dl = (dl || []).filter(function (d) { return isFinite(d[0]) && !same(d[0], ans); });
    var p = B.number(prompt, ans, function (v) { for (var i = 0; i < dl.length; i++) if (same(v, dl[i][0])) return { code: dl[i][1], hint: dl[i][2] }; return null; }, sol, hints, text, inp);
    var c = p.check;
    p.check = function (resp) { if (looksPoint(resp)) return form('int-point-not-value', 'The question asks for a <b>value</b> — a single number — not an ordered pair.'); return c(resp); };
    p.bad = dl.map(function (d) { return String(cl(d[0])); });
    return p;
  }
  /* "the value of the x-intercept(s)": one or more values (x = 4, x = -4, ±4). dl: [[values], code, hint] */
  function xValPart(prompt, vals, dl, sol, hints, text) {
    dl = (dl || []).filter(function (d) { return !sameVals(d[0], vals); });
    var p = B.valueSet(prompt, vals, { v: 'x', diag: function (A) { for (var i = 0; i < dl.length; i++) if (sameVals(A, dl[i][0])) return { code: dl[i][1], hint: dl[i][2] }; return null; } }, sol, hints || HX, text);
    var c = p.check;
    p.check = function (resp) {
      if (looksPoint(resp)) return form('int-point-not-value', 'The question asks for the <b>value</b> of the ' + t('x') + '-intercept — a number such as ' + t('x=3') + ' — not the ordered pair.');
      if (/\\times|\\cdot|\*|\+|\^/.test(String(resp || '').replace(/\\pm/g, ''))) { var res = c(resp); return res.v === 'correct' ? form('simplify', 'Right value — now simplify it to a single number.') : res; }
      return c(resp);
    };
    p.good = [vals.map(vt).join(', ')]; p.bad = dl.map(function (d) { return d[0].map(vt).join(', '); }).concat(['(' + vt(vals[0]) + ', 0)']);
    return p;
  }
  /* several number boxes of a table of values */
  function tablePart(prompt, xName, yName, xs, f, diag, sol, hints, text, unitsAfter) {
    var fields = xs.map(function (x) { return { name: t(xName + '=' + nT(x)), label: t(xName + '=' + nT(x)), before: t(yName + '='), after: unitsAfter }; });
    var checks = xs.map(function (x) { return K.number(cl(f(x)), function (v) { return diag ? diag(x, v) : null; }); });
    var p = B.fields(prompt, fields, checks, xs.map(function (x) { return String(cl(f(x))); }),
      HW.valueTable([[t(xName)].concat(xs.map(function (x) { return t(nT(x)); })), [t(yName)].concat(xs.map(function (x) { return t(nT(f(x))); }))]), sol, hints, text);
    return p;
  }
  function mcPart(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  function graphMC(r, prompt, opts, sol, hints, text) { var p = B.mc(r, prompt, opts, sol, hints, text); p.input.columns = 2; return p; }

  /* ---------------- equations of lines ---------------- */
  var EQKEYS = (function () {
    var d = function (n) { return { label: String(n), tex: String(n), plain: String(n) }; };
    return [[d(7), d(8), d(9), { label: '<i>x</i>', tex: 'x', plain: 'x' }, { label: '⌫', fn: 'del', title: 'Delete' }],
      [d(4), d(5), d(6), { label: '<i>y</i>', tex: 'y', plain: 'y' }, { label: 'clear', fn: 'clear' }],
      [d(1), d(2), d(3), { label: '=', tex: '=', plain: '=' }, { label: '◀', fn: 'left', title: 'Move left' }, { label: '▶', fn: 'right', title: 'Move right (out of a box)' }],
      [d(0), { label: '.', tex: '.', plain: '.' }, { label: '−', tex: '-', plain: '-' }, { label: '+', tex: '+', plain: '+' }, { label: '<sup>a</sup>⁄<sub>b</sub>', tex: '\\frac{#@}{#?}', plain: '/', title: 'Fraction' }, { label: 'Check ↵', fn: 'enter', wide: true }]];
  })();
  /* register the equation keypad (namespaced) so the math box shows a matching help line */
  var EQK = 'u5l3eq';
  if (HW.widgets && HW.widgets.KEYSETS && !HW.widgets.KEYSETS[EQK]) {
    HW.widgets.KEYSETS[EQK] = EQKEYS;
    if (HW.widgets.KEYHELP) HW.widgets.KEYHELP[EQK] = ['Type the whole equation with the <b>=</b> key, e.g. ' + HW.k('y=4') + ' or ' + HW.k('x=-2') + '.', 'Type the whole equation, e.g. <code>y = 4</code> or <code>x = -2</code>.'];
  }
  /* A, B, C of a linear equation in x and y (or of an expression, read as "= 0") */
  function linCoefs(resp) {
    var s = strip(resp).replace(/\\cdot|\\times/g, '*'), parts = s.split('=');
    if (parts.length > 2 || !parts[0].trim() || (parts.length === 2 && !parts[1].trim())) return { err: 'unreadable' };
    var L = ex.parse(parts[0].trim()), R = parts.length === 2 ? ex.parse(parts[1].trim()) : null;
    if (!L.ok || (R && !R.ok)) return { err: 'unreadable' };
    var f = function (x, y) { var env = { x: x, y: y }; return ex.value(L.ast, env) - (R ? ex.value(R.ast, env) : 0); };
    var C = f(0, 0), A = f(1, 0) - C, Bc = f(0, 1) - C;
    if (![A, Bc, C].every(isFinite)) return { err: 'var' };
    var pts = [[2.5, -1.5], [-3.25, 4.75], [7, 3]];
    for (var i = 0; i < pts.length; i++) { var v = f(pts[i][0], pts[i][1]), w = A * pts[i][0] + Bc * pts[i][1] + C; if (!isFinite(v) || Math.abs(v - w) > 1e-7 * (1 + Math.abs(w))) return { err: 'nonlinear' }; }
    var rhsZero = !R || [[0, 0], [1, 0], [0, 1]].every(function (q) { return Math.abs(ex.value(R.ast, { x: q[0], y: q[1] })) < 1e-12; });
    return { A: A, B: Bc, C: C, eq: !!R, rhsZero: rhsZero };
  }
  function propLine(c, T) {
    if (same(c.A, 0) && same(c.B, 0)) return false;
    var e = 1e-7 * (1 + Math.abs(c.A) + Math.abs(c.B) + Math.abs(c.C)) * (1 + Math.abs(T[0]) + Math.abs(T[1]) + Math.abs(T[2]));
    return Math.abs(c.A * T[1] - c.B * T[0]) < e && Math.abs(c.A * T[2] - c.C * T[0]) < e && Math.abs(c.B * T[2] - c.C * T[1]) < e;
  }
  function eqTexOf(c) { // a line as the student would write it: y = k, x = h, or y = mx + b
    if (same(c.A, 0)) return 'y=' + vt(-c.C / c.B);
    if (same(c.B, 0)) return 'x=' + vt(-c.C / c.A);
    return 'y=' + lin([[-c.A / c.B, 'x'], [-c.C / c.B, '']]);
  }
  /* "write the equation of the line" (y = k / x = h): target T = [A, B, C] for Ax + By + C = 0 */
  function lineChk(T, o) {
    o = o || {};
    var horiz = same(T[0], 0), vert = same(T[1], 0);
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type the equation of the line, e.g. ' + t('y=4') + '.');
      if (strip(s).indexOf('=') < 0) return form('eq-no-equals', 'Write a full <b>equation</b> with an ' + t('=') + ' sign, like ' + t('y=4') + ' or ' + t('x=-2') + '.');
      var c = linCoefs(s);
      if (c.err === 'nonlinear') return wrong('eq-not-line', 'That equation isn’t a straight line (check for a square or a product of variables).');
      if (c.err) return form('eq-unreadable', 'I can’t read that equation. Use only ' + t('x') + ', ' + t('y') + ' and numbers, like ' + t('y=-3') + ' or ' + t('x=2') + '.');
      if (same(c.A, 0) && same(c.B, 0)) return wrong('eq-not-line', 'That equation has no ' + t('x') + ' or ' + t('y') + ' left in it, so it isn’t a line.');
      if (propLine(c, T)) return ok();
      var cv = same(c.B, 0), ch = same(c.A, 0);
      if (o.diag) { var h = o.diag(c); if (h) return wrong(h.code, h.hint); }
      if (horiz && cv) return wrong('eq-h-v', t(eqTexOf(c)) + ' is a <b>vertical</b> line: it crosses the ' + t('x') + '-axis and never meets the ' + t('y') + '-axis. A line with a ' + t('y') + '-intercept but no ' + t('x') + '-intercept is <b>horizontal</b>: ' + t('y=k') + '.');
      if (vert && ch) return wrong('eq-h-v', t(eqTexOf(c)) + ' is a <b>horizontal</b> line: it crosses the ' + t('y') + '-axis and never meets the ' + t('x') + '-axis. A line with an ' + t('x') + '-intercept but no ' + t('y') + '-intercept is <b>vertical</b>: ' + t('x=h') + '.');
      if ((horiz || vert) && !ch && !cv) return wrong('eq-slanted', 'Your equation has both ' + t('x') + ' and ' + t('y') + ' in it, so its line is slanted — and a slanted line meets <b>both</b> axes. This line must be ' + (horiz ? 'horizontal' : 'vertical') + '.');
      if (horiz && ch) return wrong('eq-const', 'Right kind of line (horizontal). But ' + t(eqTexOf(c)) + ' crosses the ' + t('y') + '-axis at ' + t(ptT([0, -c.C / c.B])) + '. Check the number.');
      if (vert && cv) return wrong('eq-const', 'Right kind of line (vertical). But ' + t(eqTexOf(c)) + ' crosses the ' + t('x') + '-axis at ' + t(ptT([-c.C / c.A, 0])) + '. Check the number.');
      return wrong('value', null);
    };
  }
  function linePart(prompt, T, keyTex, o, sol, hints, text) {
    var p = { prompt: prompt, input: { type: 'math', keys: HW.widgets && HW.widgets.KEYSETS && HW.widgets.KEYSETS[EQK] ? EQK : EQKEYS, placeholder: 'e.g. y = 4' }, check: lineChk(T, o), key: keyTex, answer: t(keyTex), solution: sol, hints: hints || [], text: text };
    return p;
  }
  /* general form Ax + By + C (= 0) with integer coefficients, A > 0, no common factor */
  function stdChk(T, o) {
    o = o || {};
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type the left side of ' + t('Ax+By+C=0') + '.');
      var c = linCoefs(s);
      if (c.err === 'nonlinear') return wrong('eq-not-line', 'That isn’t the equation of a straight line (check for a square or a product of variables).');
      if (c.err) return form('eq-unreadable', 'I can’t read that. Type the left side using ' + t('x') + ', ' + t('y') + ' and numbers, like ' + t('2x-3y-12') + '.');
      if (same(c.A, 0) && same(c.B, 0)) return wrong('eq-not-line', 'There is no ' + t('x') + ' or ' + t('y') + ' left, so that isn’t a line.');
      if (propLine(c, T)) {
        if (c.eq && !c.rhsZero) return form('eq-not-zero', 'Right line — now move every term to the left side so the right side is ' + t('0') + '.');
        var co = [c.A, c.B, c.C];
        if (!co.every(function (x) { return Math.abs(x - Math.round(x)) < 1e-7; })) return form('eq-int-coef', 'Right line — now multiply every term by the same number to clear the fractions or decimals, so ' + t('A') + ', ' + t('B') + ' and ' + t('C') + ' are integers.');
        var g = co.reduce(function (m, x) { return gcd(m, Math.round(x)); }, 0);
        if (g > 1) return form('eq-reduce', 'Right line — but every coefficient has the common factor ' + t(g) + '. Divide every term by ' + t(g) + '.');
        if (c.A < 0 || (same(c.A, 0) && c.B < 0)) return form('eq-lead-neg', 'Right line — in the form ' + t('Ax+By+C=0') + ' the ' + t('x') + '-coefficient ' + t('A') + ' is written positive. Multiply every term by ' + t('-1') + '.');
        return ok();
      }
      var ws = o.wrong || [];
      for (var i = 0; i < ws.length; i++) if (propLine(c, ws[i].is)) return wrong(ws[i].code, ws[i].hint);
      if (Math.abs(c.A * T[1] - c.B * T[0]) < 1e-7 * (1 + Math.abs(c.A) + Math.abs(c.B)) * (1 + Math.abs(T[0]) + Math.abs(T[1]))) return wrong('eq-const', 'Your line has the right slope (it is parallel to the right one) but the wrong constant. Check where it crosses the axes.');
      return wrong('value', null);
    };
  }
  function stdTex(T) { return lin([[T[0], 'x'], [T[1], 'y'], [T[2], '']]); }
  function reduceT(T) { var g = T.reduce(function (m, x) { return gcd(m, x); }, 0) || 1; if (T[0] < 0 || (T[0] === 0 && T[1] < 0)) g = -g; return T.map(function (x) { return x / g; }); }

  /* ---------------- small graphs ---------------- */
  function clipLine(a, b, w) { // line through (a, 0) and (0, b) inside the square [-w, w]²
    var m = -b / a, pts = [];
    [-w, w].forEach(function (x) { var y = b + m * x; if (y >= -w - 1e-9 && y <= w + 1e-9) pts.push([x, y]); });
    [-w, w].forEach(function (y) { var x = (y - b) / m; if (x > -w + 1e-9 && x < w - 1e-9) pts.push([x, y]); });
    pts.sort(function (p, q) { return p[0] - q[0]; });
    return [pts[0], pts[pts.length - 1]];
  }
  function lineGraph(a, b, opt) {
    opt = opt || {};
    var w = opt.w || 6;
    return HW.graph({ x: [-w, w], y: [-w, w], labels: opt.labels || 2, max: opt.max || 200, segs: [{ pts: clipLine(a, b, w - 0.3), start: 'arrow', end: 'arrow' }],
      points: opt.dots === false ? [] : [{ x: a, y: 0 }, { x: 0, y: b }], aria: 'line' });
  }

  /* ================= Question 4–6 contexts ================= */
  function moving(r) {
    var o = pickWhere(function () { return { Fee: r.pick([150, 150, 100, 120, 125, 180, 200, 250]), rc: r.pick([25, 25, 20, 30, 40, 50]) }; }, function (o) { return (o.Fee * 100) % o.rc === 0; });
    o.rate = o.rc / 100; o.cost = function (n) { return o.Fee + o.rc * n / 100; }; o.ni = -o.Fee * 100 / o.rc;
    o.ns = [0].concat(r.pick([[800, 2000, 3200], [800, 2000, 3200], [400, 1200, 2400], [800, 1600, 2400], [400, 2000, 3600], [1200, 2000, 2800], [800, 2400, 4000]]));
    o.d1 = r.pick([1200, 1200, 1000, 1400, 1800, 2200, 2600, 3000].filter(function (x) { return o.ns.indexOf(x) < 0; }));
    o.d2 = r.pick([5000, 5000, 4500, 5500, 6000, 7000, 4800]);
    o.ne = r.pick([2600, 2600, 1500, 1800, 2200, 3400, 3800, 4200].filter(function (x) { return o.ns.indexOf(x) < 0 && x !== o.d1; }));
    o.ce = o.cost(o.ne);
    o.eq = 'C=' + o.Fee + '+' + nT(o.rate) + 'n';
    o.money = '\\$' + o.rate.toFixed(2);
    return o;
  }
  function tank(r) {
    var T = r.pick([40, 40, 20, 60]), s = T / 4, rate = r.pick([60, 60, 30, 40, 50, 75, 80, 90, 120]);
    var cands = range(1, T - 1).filter(function (k) { return k % s !== 0 && (s < 10 || k % 5 === 0); });
    var td = T === 40 && rate === 60 && r.chance(0.5) ? 25 : r.pick(cands), te = T === 40 && rate === 60 && td === 25 ? 35 : r.pick(cands.filter(function (k) { return k !== td; }));
    return { T: T, s: s, rate: rate, V0: rate * T, td: td, te: te, Vr: rate * (T - te), V: function (x) { return rate * (T - x); }, eq: 'V=' + F(rate * T) + '-' + rate + 't' };
  }
  function ball(r) {
    var Lq = r.pick([[7, 1], [7, 1], [5, 1], [6, 2], [8, 2]]), L = Lq[0], q = Lq[1];
    var b = 5 * (L - q), c = 5 * L * q, v = (L - q) / 2;
    var h = function (x) { return cl(-5 * x * x + b * x + c); };
    var halves = range(v, L - 1).map(function (k) { return k + 0.5; });
    var tg = L === 7 && q === 1 && r.chance(0.5) ? 4.5 : r.pick(halves);
    return { L: L, q: q, b: b, c: c, v: v, h: h, hmax: h(v), tg: tg, eq: 'h=-5t^{2}+' + b + 't+' + c };
  }
  function ballGraph(f, L, top, opt) {
    opt = opt || {};
    return HW.graph({ x: [0, L + 0.6], y: [0, top], firstQuadrant: true, unitX: opt.ux || 22, unitY: (opt.hpx || 130) / top, gridY: 10, labels: 1, labelsY: top > 100 ? 40 : 20, xName: 't', yName: 'h', max: opt.max || 210,
      fns: [{ f: f, from: opt.from == null ? 0 : opt.from, to: opt.to == null ? L : opt.to }], aria: 'height-time graph' });
  }

  HW.defineLesson({
    id: 'u5l3', unit: 5, num: '3', title: 'Where Graphs Meet the Axes', outcome: 'RF1',
    blurb: 'The x- and y-intercepts of a graph: substitute y = 0 for the x-intercepts and x = 0 for the y-intercept, write them as values or as points, and read what they mean in a real situation.',
    questions: [
      /* ---------------- Question 1: value of the y-intercept ---------------- */
      { num: '1', section: 'Part A — Intercepts from an equation', stem: 'Determine the <b>value</b> of the ' + t('y') + '-intercept of the graph of each equation.', parts: [
        { id: '1a', level: 'LIM', make: function (r) {
          var c = r.pick([-8, -8].concat(pm(2, 12))), eq = 'y=' + lin([[1, 'x'], [c, '']]);
          return numPart(t(eq), c, [[-c, 'int-sign', 'Check the sign: with ' + t('x=0') + ' the equation becomes ' + t('y=0' + sg(c)) + '. (' + t(-c) + ' is the value of the ' + t('x') + '-intercept, where ' + t('y=0') + '.)']],
            t('x=0') + ': ' + t('y=0' + sg(c)) + ', so ' + t('y=' + c) + '. The value of the ' + t('y') + '-intercept is ' + t(c) + '.', HY, 'y-int value of ' + eq);
        } },
        { id: '1b', level: 'BEG', make: function (r) {
          var m = r.pick([4, 2, 3, 4, 5, 6]), k = r.pick([5, 2, 3, 4, 5, 6]), c = r.chance(0.8) ? -m * k : m * k, eq = 'y=' + lin([[m, 'x'], [c, '']]);
          return numPart(t(eq), c, [[-c / m, 'int-gave-x', 'That is the value of the ' + t('x') + '-intercept (where ' + t('y=0') + '). For the ' + t('y') + '-intercept substitute ' + t('x=0') + '.'],
            [m, 'int-gave-m', t(m) + ' is the coefficient of ' + t('x') + '. Substitute ' + t('x=0') + ': the ' + t('x') + '-term becomes ' + t('0') + ' and only the constant is left.'], [-c, 'int-sign', 'Check the sign of the constant term.']],
            t('x=0') + ': ' + t('y=' + m + '(0)' + sg(c) + '=' + c) + '. The value of the ' + t('y') + '-intercept is ' + t(c) + '.', HY, 'y-int value of ' + eq);
        } },
        { id: '1c', level: 'EMG', make: function (r) {
          var a = r.pick([3, 2, 3, 4, 5, 6]), b = r.pick([4, 2, 3, 4, 5, 7].filter(function (x) { return x !== a; })), k = r.pick([4, 4].concat(pm(1, 8))), d = -a * k;
          var eq = lin([[a, 'y'], [b, 'x'], [d, '']]) + '=0';
          return numPart(t(eq), k, [[-d, 'int-no-divide', 'You have ' + t(a + 'y=' + (-d)) + ' — now divide both sides by ' + t(a) + '.'], [-k, 'int-sign', 'Check the sign when the constant moves to the other side: ' + t(a + 'y' + sg(d) + '=0') + ' gives ' + t(a + 'y=' + (-d)) + '.'],
            [-d / b, 'int-gave-x', 'That is the value of the ' + t('x') + '-intercept (where ' + t('y=0') + '). For the ' + t('y') + '-intercept substitute ' + t('x=0') + '.']],
            t('x=0') + ': ' + t(a + 'y+' + b + '(0)' + sg(d) + '=0') + ', so ' + t(a + 'y=' + (-d)) + ' and ' + t('y=' + k) + '.', HY, 'y-int value of ' + eq);
        } },
        { id: '1d', level: 'EMG', make: function (r) {
          var q10 = r.pick([15, 15, 5, 25, 12, 8]), k = r.pick([2, 2, 1, 3, 4, 5, 6, -1, -2, -3, -4]), p10 = r.pick([4, 4, 2, 6, 8, 12]);
          var q = q10 / 10, s = cl(q10 * k / 10), p = p10 / 10, eq = lin([[p, 'x'], [-q, 'y'], [s, '']]) + '=0';
          return numPart(t(eq), k, [[-k, 'int-sign', 'Careful with the signs: ' + t(nT(-q) + 'y=' + nT(-s)) + '. Dividing by a negative number changes the sign.'], [s, 'int-no-divide', 'You still have to divide by the coefficient of ' + t('y') + ' (' + t(nT(-q)) + ').'], [-s, 'int-no-divide', 'You still have to divide by the coefficient of ' + t('y') + ' (' + t(nT(-q)) + ').'],
            [-s / p, 'int-gave-x', 'That is the value of the ' + t('x') + '-intercept (where ' + t('y=0') + '). For the ' + t('y') + '-intercept substitute ' + t('x=0') + '.']],
            t('x=0') + ': ' + t(nT(p) + '(0)-' + nT(q) + 'y' + sg(s) + '=0') + ', so ' + t(nT(-q) + 'y=' + nT(-s)) + ' and ' + t('y=\\dfrac{' + nT(-s) + '}{' + nT(-q) + '}=' + k) + '.', HY, 'y-int value of ' + eq);
        } },
        { id: '1e', level: 'EMG', make: function (r) {
          var a = r.pick([3, 3, 2, 4, 5]), k = r.pick([-25, -25].concat(range(4, 30).map(function (x) { return -x; }))), c = a * k, eq = a + 'y=x^{2}' + sg(c);
          return numPart(t(eq), k, [[c, 'int-no-divide', 'You have ' + t(a + 'y=' + c) + ' — now divide both sides by ' + t(a) + '.'], [-k, 'int-sign', 'Check the sign: ' + t('0^{2}' + sg(c) + '=' + c) + '.']],
            t('x=0') + ': ' + t(a + 'y=0^{2}' + sg(c) + '=' + c) + ', so ' + t('y=' + k) + '.', HY, 'y-int value of ' + eq);
        } },
        { id: '1f', level: 'BEG', make: function (r) {
          var a = r.pick([2, 2, 1, 3, 4, 5, 6, 8]), b = r.pick([2, 2, 1, 3, 4, 5, 7]), sb = r.chance(0.75) ? -1 : 1;
          var C100 = r.chance(0.3) ? 836 : pickWhere(function () { return r.int(105, 1995); }, function (x) { return x % 10 !== 0; }), C = C100 / 100;
          var eq = 'y=' + lin([[a / 1000, 'x^{2}'], [sb * b / 1000, 'x'], [C, '']]);
          return numPart(t(eq), C, [[0, 'int-zero', 'Substituting ' + t('x=0') + ' makes the ' + t('x^{2}') + '- and ' + t('x') + '-terms zero — but the constant term is still there.'], [-C, 'int-sign', 'Check the sign of the constant term.']],
            t('x=0') + ': ' + t('y=' + nT(a / 1000) + '(0)^{2}' + (sb < 0 ? '-' : '+') + nT(b / 1000) + '(0)+' + nT(C) + '=' + nT(C)) + '. The value of the ' + t('y') + '-intercept is ' + t(nT(C)) + ' — the constant term.', HY, 'y-int value of ' + eq);
        } }] },
      /* ---------------- Question 2: value of the x-intercept(s) ---------------- */
      { num: '2', stem: 'Determine the <b>value</b> of the ' + t('x') + '-intercept(s) of the graph of each equation.', parts: [
        { id: '2a', level: 'BEG', make: function (r) {
          var c = r.pick([-6, -6].concat(pm(2, 12))), eq = 'y=' + lin([[1, 'x'], [c, '']]);
          return xValPart(t(eq), [-c], [[[c], 'int-sign', 'Substitute ' + t('y=0') + ' and solve ' + t('0=x' + sg(c)) + ' for ' + t('x') + ' — watch the sign when ' + t(Math.abs(c)) + ' moves to the other side. (' + t(c) + ' is the value of the ' + t('y') + '-intercept.)']],
            t('y=0') + ': ' + t('0=x' + sg(c)) + ', so ' + t('x=' + (-c)) + '.', HX, 'x-int value of ' + eq);
        } },
        { id: '2b', level: 'BEG', make: function (r) {
          var m = r.pick([3, 2, 3, 4, 5, 6]), k = r.pick([3, 3].concat(range(1, 8), [-1, -2, -3, -4, -5])), c = -m * k, eq = 'y=' + lin([[m, 'x'], [c, '']]);
          return xValPart(t(eq), [k], [[[c], 'int-gave-y', 'That is the value of the ' + t('y') + '-intercept (where ' + t('x=0') + '). For the ' + t('x') + '-intercept substitute ' + t('y=0') + '.'],
            [[-c], 'int-no-divide', 'You have ' + t(m + 'x=' + (-c)) + ' — now divide both sides by ' + t(m) + '.'], [[-k], 'int-sign', 'Check the sign when the constant moves to the other side.']],
            t('y=0') + ': ' + t('0=' + m + 'x' + sg(c)) + ', so ' + t(m + 'x=' + (-c)) + ' and ' + t('x=' + k) + '.', HX, 'x-int value of ' + eq);
        } },
        { id: '2c', level: 'EMG', make: function (r) {
          var a = r.pick([2, 2, 3, 4, 5, 6]), b = r.pick([5, 2, 3, 4, 5, 7].filter(function (x) { return x !== a; })), k = r.pick([4, 4].concat(pm(1, 8))), d = -b * k;
          var eq = lin([[a, 'y'], [b, 'x'], [d, '']]) + '=0';
          return xValPart(t(eq), [k], [[[-d / a], 'int-gave-y', 'That is the value of the ' + t('y') + '-intercept (where ' + t('x=0') + '). For the ' + t('x') + '-intercept substitute ' + t('y=0') + '.'],
            [[-d], 'int-no-divide', 'You have ' + t(b + 'x=' + (-d)) + ' — now divide both sides by ' + t(b) + '.'], [[-k], 'int-sign', 'Check the sign when the constant moves to the other side.']],
            t('y=0') + ': ' + t(a + '(0)+' + b + 'x' + sg(d) + '=0') + ', so ' + t(b + 'x=' + (-d)) + ' and ' + t('x=' + k) + '.', HX, 'x-int value of ' + eq);
        } },
        { id: '2d', level: 'EMG', make: function (r) {
          var p10 = r.pick([8, 8, 2, 4, 5, 6, 12]), k = r.pick([-2, -2, 1, 2, 3, 4, 5, -1, -3, -4, -5, -6]), q = r.pick([4, 4, 2, 3, 5, 2.5, 1.5]);
          var p = p10 / 10, s = cl(-p10 * k / 10), eq = lin([[p, 'x'], [-q, 'y'], [s, '']]) + '=0';
          return xValPart(t(eq), [k], [[[-k], 'int-sign', 'Careful with the signs: ' + t(nT(p) + 'x=' + nT(-s)) + ', and then divide by ' + t(nT(p)) + '.'], [[s / q], 'int-gave-y', 'That is the value of the ' + t('y') + '-intercept (where ' + t('x=0') + '). For the ' + t('x') + '-intercept substitute ' + t('y=0') + '.'],
            [[-s], 'int-no-divide', 'You still have to divide by the coefficient of ' + t('x') + ' (' + t(nT(p)) + ').'], [[s], 'int-no-divide', 'You still have to divide by the coefficient of ' + t('x') + ' (' + t(nT(p)) + ').']],
            t('y=0') + ': ' + t(nT(p) + 'x-' + nT(q) + '(0)' + sg(s) + '=0') + ', so ' + t(nT(p) + 'x=' + nT(-s)) + ' and ' + t('x=\\dfrac{' + nT(-s) + '}{' + nT(p) + '}=' + k) + '.', HX, 'x-int value of ' + eq);
        } },
        { id: '2e', level: 'EMG', make: function (r) {
          var n = r.pick([4, 4, 2, 3, 5, 6, 7, 8, 9]), eq = 'y=x^{2}-' + n * n;
          var two = t('x^{2}=' + n * n) + ' has <b>two</b> solutions: a positive and a negative number both square to ' + t(n * n) + '.';
          return xValPart(t(eq), [n, -n], [[[n], 'int-one-root', two], [[-n], 'int-one-root', two], [[-n * n], 'int-gave-y', 'That is the value of the ' + t('y') + '-intercept. For the ' + t('x') + '-intercepts substitute ' + t('y=0') + '.'],
            [[n * n], 'int-no-root', 'You have ' + t('x^{2}=' + n * n) + ' — now take the square root (both signs).']],
            t('y=0') + ': ' + t('0=x^{2}-' + n * n) + ', so ' + t('x^{2}=' + n * n) + ' and ' + t('x=\\pm' + n) + '. There are two ' + t('x') + '-intercepts, ' + t(n) + ' and ' + t(-n) + '.', HX, 'x-int values of ' + eq);
        } },
        { id: '2f', level: 'BEG', make: function (r) {
          var m = r.pick([4, 4, 2, 3, 5, 6]), k = r.pick([5, 5, 2, 3, 4, 6, 7, 8, 9]), c = m * k, eq = 'y=' + lin([[c, ''], [-m, 'x']]);
          return xValPart(t(eq), [k], [[[c], 'int-gave-y', 'That is the value of the ' + t('y') + '-intercept (where ' + t('x=0') + '). For the ' + t('x') + '-intercept substitute ' + t('y=0') + '.'], [[-k], 'int-sign', 'Check the sign: ' + t('0=' + c + '-' + m + 'x') + ' gives ' + t(m + 'x=' + c) + '.'],
            [[c * m], 'ctx-mult', 'Divide by ' + t(m) + ', don’t multiply.']],
            t('y=0') + ': ' + t('0=' + c + '-' + m + 'x') + ', so ' + t(m + 'x=' + c) + ' and ' + t('x=' + k) + '.', HX, 'x-int value of ' + eq);
        } }] },
      /* ---------------- Question 3: both intercepts as points ---------------- */
      { num: '3', stem: 'Determine the ' + t('x') + '- and ' + t('y') + '-intercepts of each equation. <b>Write each intercept point as an ordered pair.</b> If there is no such intercept, press <b>none</b>.', parts: [
        { id: '3a', level: 'BEG', make: function (r) {
          var m = r.pick([5, 5, 2, 3, 4, 6]), k = r.pick([4, 4].concat(pm(2, 6))), b = m * k, eq = 'y=' + lin([[m, 'x'], [b, '']]);
          return interceptsPart(t(eq), [-k], [b], { text: 'intercept points of ' + eq,
            sol: t('x') + '-intercept, ' + t('y=0') + ': ' + t('0=' + m + 'x' + sg(b)) + ', ' + t(m + 'x=' + (-b)) + ', ' + t('x=' + (-k)) + '.<br>' + t('y') + '-intercept, ' + t('x=0') + ': ' + t('y=' + m + '(0)' + sg(b) + '=' + b) + '.<br>Intercept points: ' + t(ptT([-k, 0])) + ' and ' + t(ptT([0, b])) + '.' });
        } },
        { id: '3b', level: 'BEG', make: function (r) {
          var m = r.pick([8, 8, 2, 3, 4, 5, 6, 7, 9]), k = r.pick([3, 3, 2, 4, 5, 6]), c = m * k, eq = 'y=' + lin([[c, ''], [-m, 'x']]);
          return interceptsPart(t(eq), [k], [c], { text: 'intercept points of ' + eq,
            sol: t('x') + '-intercept, ' + t('y=0') + ': ' + t('0=' + c + '-' + m + 'x') + ', ' + t(m + 'x=' + c) + ', ' + t('x=' + k) + '.<br>' + t('y') + '-intercept, ' + t('x=0') + ': ' + t('y=' + c + '-' + m + '(0)=' + c) + '.<br>Intercept points: ' + t(ptT([k, 0])) + ' and ' + t(ptT([0, c])) + '.' });
        } },
        { id: '3c', level: 'PRG', make: function (r) {
          var o = r.chance(0.25) ? { A: 6, B: 3, C: 18 } : pickWhere(function () { var A = r.int(2, 7), Bc = r.int(2, 7); return { A: A, B: Bc, C: lcm(A, Bc) * r.pick([1, 2, 3, -1, -2, -3]) }; }, function (o) { return o.A !== o.B && Math.abs(o.C) <= 60 && Math.abs(o.C) >= 6; });
          var xi = -o.C / o.A, yi = o.C / o.B, eq = lin([[o.A, 'x'], [-o.B, 'y'], [o.C, '']]) + '=0';
          return interceptsPart(t(eq), [xi], [yi], { text: 'intercept points of ' + eq,
            sol: t('x') + '-intercept, ' + t('y=0') + ': ' + t(o.A + 'x' + sg(o.C) + '=0') + ', ' + t(o.A + 'x=' + (-o.C)) + ', ' + t('x=' + xi) + '.<br>' + t('y') + '-intercept, ' + t('x=0') + ': ' + t('-' + o.B + 'y' + sg(o.C) + '=0') + ', ' + t('-' + o.B + 'y=' + (-o.C)) + ', ' + t('y=' + yi) + '.<br>Intercept points: ' + t(ptT([xi, 0])) + ' and ' + t(ptT([0, yi])) + '.' });
        } },
        { id: '3d', level: 'EMG', make: function (r) {
          var ak = r.pick([[3, 12], [3, 12], [3, 3], [3, 27], [2, 8], [2, 18], [2, 2], [4, 4], [4, 9], [4, 16], [5, 5], [5, 20]]), a = ak[0], k = ak[1], n = Math.round(Math.sqrt(a * k));
          var eq = 'y=\\dfrac{x^{2}}{' + a + '}-' + k;
          return interceptsPart(t(eq), [n, -n], [-k], { text: 'intercept points of ' + eq, xMiss: t('x^{2}=' + n * n) + ' has two solutions — don’t forget the negative square root.',
            sol: t('x') + '-intercepts, ' + t('y=0') + ': ' + t('0=\\dfrac{x^{2}}{' + a + '}-' + k) + ', ' + t('\\dfrac{x^{2}}{' + a + '}=' + k) + ', ' + t('x^{2}=' + n * n) + ', ' + t('x=\\pm' + n) + '.<br>' + t('y') + '-intercept, ' + t('x=0') + ': ' + t('y=\\dfrac{0}{' + a + '}-' + k + '=' + (-k)) + '.<br>Intercept points: ' + t(ptsT([[n, 0], [-n, 0]])) + ' and ' + t(ptT([0, -k])) + '.' });
        } },
        { id: '3e', level: 'EMG', make: function (r) {
          var n = r.pick([3, 3, 2, 4, 5, 6, 7]), c = n * n, eq = 'y=' + c + '-x^{2}';
          return interceptsPart(t(eq), [n, -n], [c], { text: 'intercept points of ' + eq, xMiss: t('x^{2}=' + c) + ' has two solutions — don’t forget the negative square root.',
            sol: t('x') + '-intercepts, ' + t('y=0') + ': ' + t('0=' + c + '-x^{2}') + ', ' + t('x^{2}=' + c) + ', ' + t('x=\\pm' + n) + '.<br>' + t('y') + '-intercept, ' + t('x=0') + ': ' + t('y=' + c + '-0^{2}=' + c) + '.<br>Intercept points: ' + t(ptsT([[n, 0], [-n, 0]])) + ' and ' + t(ptT([0, c])) + '.' });
        } },
        { id: '3f', level: 'EMG', make: function (r) {
          var m = r.pick([5, 5].concat(pm(2, 9))), eq = 'y=' + lin([[m, 'x']]);
          return interceptsPart(t(eq), [0], [0], { text: 'intercept points of ' + eq,
            xSaidNone: 'Substitute ' + t('y=0') + ': ' + t('0=' + m + 'x') + ' does have a solution. The line meets the ' + t('x') + '-axis — where?',
            ySaidNone: 'Substitute ' + t('x=0') + ': ' + t('y=' + m + '(0)') + ' does have a value. The line meets the ' + t('y') + '-axis — where?',
            sol: t('y=0') + ': ' + t('0=' + m + 'x') + ', so ' + t('x=0') + '. ' + t('x=0') + ': ' + t('y=' + m + '(0)=0') + '.<br>Both intercept points are ' + t('(0,\\ 0)') + ': the line passes through the origin, which is on both axes.' });
        } },
        { id: '3g', level: 'EMG', make: function (r) {
          var c = r.pick([9, 9].concat(range(1, 36))), eq = 'y=x^{2}+' + c;
          var rc = Math.sqrt(c), sq = Math.round(rc) * Math.round(rc) === c;
          return interceptsPart(t(eq), null, [c], { text: 'intercept points of ' + eq,
            xNone: 'Check: ' + t('y=0') + ' gives ' + t('x^{2}=-' + c) + '. No real number squares to a negative number, so there is <b>no</b> ' + t('x') + '-intercept.',
            bad: sq ? [['(' + rc + ', 0), (-' + rc + ', 0)', '(0, ' + c + ')']] : [],
            sol: t('x') + '-intercept, ' + t('y=0') + ': ' + t('0=x^{2}+' + c) + ', ' + t('x^{2}=-' + c) + '. A square is never negative, so there is <b>no ' + t('x') + '-intercept</b> (the graph stays above the ' + t('x') + '-axis).<br>' + t('y') + '-intercept, ' + t('x=0') + ': ' + t('y=0^{2}+' + c + '=' + c) + '. Intercept point ' + t(ptT([0, c])) + '.' });
        } },
        { id: '3h', level: 'PRG', make: function (r) {
          var b = r.pick([4, 4].concat(pm(2, 9))), eq = 'y=' + lin([[1, 'x^{2}'], [-b, 'x']]);
          return interceptsPart(t(eq), [0, b], [0], { text: 'intercept points of ' + eq,
            xMiss: 'Factor: ' + t('x(x' + sg(-b) + ')=0') + '. A product is zero when <b>either</b> factor is zero, so there are two solutions.',
            sol: t('x') + '-intercepts, ' + t('y=0') + ': ' + t('0=' + lin([[1, 'x^{2}'], [-b, 'x']]) + '=x(x' + sg(-b) + ')') + ', so ' + t('x=0') + ' or ' + t('x=' + b) + '.<br>' + t('y') + '-intercept, ' + t('x=0') + ': ' + t('y=0^{2}' + sg(-b) + '(0)=0') + '.<br>' + t('x') + '-intercept points ' + t(ptsT([[0, 0], [b, 0]])) + '; ' + t('y') + '-intercept point ' + t('(0,\\ 0)') + '.' });
        } },
        { id: '3i', level: 'EMG', make: function (r) {
          var an = pickWhere(function () { return [r.pick([2, 2, 3, 4, 5]), r.pick([2, 2, 1, 3, 4, 5])]; }, function (z) { return z[0] * z[1] * z[1] <= 80; }), a = an[0], n = an[1], c = a * n * n;
          var eq = 'y=-' + a + 'x^{2}+' + c;
          return interceptsPart(t(eq), [n, -n], [c], { text: 'intercept points of ' + eq, xMiss: t('x^{2}=' + n * n) + ' has two solutions — don’t forget the negative square root.',
            sol: t('x') + '-intercepts, ' + t('y=0') + ': ' + t('0=-' + a + 'x^{2}+' + c) + ', ' + t(a + 'x^{2}=' + c) + ', ' + t('x^{2}=' + n * n) + ', ' + t('x=\\pm' + n) + '.<br>' + t('y') + '-intercept, ' + t('x=0') + ': ' + t('y=-' + a + '(0)^{2}+' + c + '=' + c) + '.<br>Intercept points: ' + t(ptsT([[n, 0], [-n, 0]])) + ' and ' + t(ptT([0, c])) + '.' });
        } }] },
      /* ---------------- Question 4: moving company ---------------- */
      { num: '4', section: 'Part B — Intercepts in context', shared: moving,
        stem: function (o) { return 'Northern Lights Moving Company charges a flat fee of $' + o.Fee + ' plus $' + o.rate.toFixed(2) + ' per km for a long-distance move. The total cost, ' + t('C') + ' dollars, of a move of ' + t('n') + ' km is ' + t(o.eq) + '.'; },
        parts: [
          { id: '4a', level: 'BEG', make: function (r, o) {
            return tablePart('Complete the table of values.' + HW.valueTable([[t('n') + ' (km)'].concat(o.ns.map(function (n) { return t(nT(n)); })), [t('C') + ' ($)'].concat(o.ns.map(function () { return '?'; }))]),
              'n', 'C', o.ns, o.cost, function (n, v) {
                if (n && same(v, o.rc * n / 100)) return { code: 'ctx-no-fee', hint: 'Add the flat fee: ' + t('C=' + o.Fee + '+' + nT(o.rate) + '(' + nT(n) + ')') + '.' };
                if (n && same(v, o.Fee + o.rc * n)) return { code: 'ctx-cents', hint: 'The rate is ' + t(nT(o.rate)) + ' dollars per km, not ' + t(o.rc) + '.' };
                if (n && same(v, (o.Fee + o.rate) * n)) return { code: 'ctx-rate-n', hint: 'Only the ' + t(nT(o.rate)) + ' is multiplied by ' + t('n') + '; the fee is added once.' };
                return null;
              }, 'Substitute each distance: ' + o.ns.map(function (n) { return t('C=' + o.Fee + '+' + nT(o.rate) + '(' + nT(n) + ')=' + nT(o.cost(n))); }).join(', ') + '.',
              ['Substitute each value of ' + t('n') + ' into ' + t(o.eq) + '.', 'Multiply first (' + t(nT(o.rate) + '\\times n') + '), then add the fee.'], 'moving cost table', '');
          } },
          { id: '4b', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'What does the ordered pair ' + t('(0,\\ ' + o.Fee + ')') + ' represent?', [
              { html: 'The flat fee: a move of ' + t('0') + ' km still costs $' + o.Fee + ', before any distance is travelled.', right: true },
              { html: 'The cost per kilometre.', why: 'The cost per km is $' + o.rate.toFixed(2) + ' — the number multiplied by ' + t('n') + '. In ' + t('(0,\\ ' + o.Fee + ')') + ', ' + t('n=0') + '.' },
              { html: 'A move of ' + o.Fee + ' km costs nothing.', why: 'An ordered pair here is ' + t('(n,\\ C)') + ': the first number is the distance. ' + t('(0,\\ ' + o.Fee + ')') + ' means ' + t('n=0') + ' and ' + t('C=' + o.Fee) + '.' },
              { html: 'The ' + t('n') + '-intercept: the distance at which the cost is zero.', why: 'At an ' + t('n') + '-intercept, ' + t('C=0') + '. Here ' + t('n=0') + ', so this point is on the ' + t('C') + '-axis: it is the ' + t('C') + '-intercept.' }],
              'At ' + t('n=0') + ' nothing has been driven, so ' + t('(0,\\ ' + o.Fee + ')') + ' is the flat fee of $' + o.Fee + ' charged before any distance is travelled. It is the ' + t('C') + '-intercept.',
              ['In ' + t('(n,\\ C)') + ', what is ' + t('n') + ' at this point? What is the cost?'], 'meaning of (0, ' + o.Fee + ')');
          } },
          { id: '4c', level: 'EMG', make: function (r, o) {
            return numPart('Determine the ' + t('n') + '-intercept of the graph algebraically.', o.ni, [[-o.ni, 'int-sign', 'Check the sign: ' + t('0=' + o.Fee + '+' + nT(o.rate) + 'n') + ' gives ' + t(nT(o.rate) + 'n=-' + o.Fee) + '.'],
              [o.Fee, 'int-gave-y', 'That is the ' + t('C') + '-intercept (where ' + t('n=0') + '). For the ' + t('n') + '-intercept set ' + t('C=0') + '.'], [-o.Fee * o.rate, 'ctx-mult', 'Divide by ' + t(nT(o.rate)) + ', don’t multiply.'], [-o.Fee, 'int-no-divide', 'You have ' + t(nT(o.rate) + 'n=-' + o.Fee) + ' — now divide by ' + t(nT(o.rate)) + '.']],
              'Set ' + t('C=0') + ': ' + t('0=' + o.Fee + '+' + nT(o.rate) + 'n') + ', so ' + t(nT(o.rate) + 'n=-' + o.Fee) + ' and ' + t('n=\\dfrac{-' + o.Fee + '}{' + nT(o.rate) + '}=' + nT(o.ni)) + '.',
              ['The ' + t('n') + '-intercept is where the graph meets the ' + t('n') + '-axis: set ' + t('C=0') + ' and solve for ' + t('n') + '.'], 'n-intercept of ' + o.eq);
          } },
          { id: '4c2', sub: 'c, why', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'Why is the ' + t('n') + '-intercept, ' + t(nT(o.ni)) + ', not applicable in the context of this problem?', [
              { html: 'A distance travelled cannot be negative, so the model only applies for ' + t('n\\ge 0') + '.', right: true },
              { html: 'The cost would be negative there.', why: 'At the ' + t('n') + '-intercept the cost is exactly ' + t('0') + ' dollars, not negative. Look at the value of ' + t('n') + ' instead.' },
              { html: 'It is too far away to show on the graph.', why: 'You could extend the line to show it. The problem is what a distance of ' + t(nT(o.ni)) + ' km would mean.' },
              { html: 'The company has a maximum distance it will drive.', why: 'Nothing in the problem limits the distance. Look at the sign of ' + t('n=' + nT(o.ni)) + '.' }],
              'At the ' + t('n') + '-intercept, ' + t('n=' + nT(o.ni)) + ' km. A distance travelled cannot be negative, so the graph only makes sense for ' + t('n\\ge 0') + ' — every move costs at least the $' + o.Fee + ' fee.', ['What would a distance of ' + t(nT(o.ni)) + ' km mean?'], 'n-intercept not applicable');
          } },
          { id: '4d1', sub: 'd i', level: 'BEG', make: function (r, o) {
            var n = o.d1;
            return numPart('Use the formula to determine the cost of a move of ' + t(nT(n)) + ' km.', o.cost(n), [[o.rc * n / 100, 'ctx-no-fee', 'Don’t forget the flat fee of $' + o.Fee + '.'], [o.Fee + o.rc * n, 'ctx-cents', 'The rate is ' + t(nT(o.rate)) + ' dollars per km.'], [(o.Fee + o.rate) * n, 'ctx-rate-n', 'Only ' + t(nT(o.rate)) + ' is multiplied by ' + t('n') + '; the fee is added once.']],
              t('C=' + o.Fee + '+' + nT(o.rate) + '(' + nT(n) + ')=' + o.Fee + '+' + nT(o.rc * n / 100) + '=' + nT(o.cost(n))) + '. The move costs $' + nT(o.cost(n)) + '.', ['Substitute ' + t('n=' + nT(n)) + ' into ' + t(o.eq) + '.'], 'cost of ' + n + ' km', { before: '$' });
          } },
          { id: '4d2', sub: 'd ii', level: 'BEG', make: function (r, o) {
            var n = o.d2;
            return numPart('Use the formula to determine the cost of a move of ' + t(nT(n)) + ' km.', o.cost(n), [[o.rc * n / 100, 'ctx-no-fee', 'Don’t forget the flat fee of $' + o.Fee + '.'], [o.Fee + o.rc * n, 'ctx-cents', 'The rate is ' + t(nT(o.rate)) + ' dollars per km.'], [(o.Fee + o.rate) * n, 'ctx-rate-n', 'Only ' + t(nT(o.rate)) + ' is multiplied by ' + t('n') + '; the fee is added once.']],
              t('C=' + o.Fee + '+' + nT(o.rate) + '(' + nT(n) + ')=' + o.Fee + '+' + nT(o.rc * n / 100) + '=' + nT(o.cost(n))) + '. The move costs $' + nT(o.cost(n)) + '.', ['Substitute ' + t('n=' + nT(n)) + ' into ' + t(o.eq) + '.'], 'cost of ' + n + ' km', { before: '$' });
          } },
          { id: '4e', level: 'EMG', make: function (r, o) {
            var c = o.ce, n = o.ne;
            return numPart('If a move costs a total of $' + nT(c) + ', determine the distance travelled.', n, [[c / o.rate, 'ctx-no-sub', 'First subtract the flat fee: ' + t(nT(c) + '-' + o.Fee + '=' + nT(c - o.Fee)) + ' is the part that depends on distance.'],
              [(c + o.Fee) / o.rate, 'ctx-added', 'Subtract the fee from both sides — don’t add it.'], [o.cost(c), 'ctx-eval', 'You substituted ' + t(nT(c)) + ' for ' + t('n') + '. Here ' + t(nT(c)) + ' is the <b>cost</b>: substitute ' + t('C=' + nT(c)) + ' and solve for ' + t('n') + '.'],
              [(c - o.Fee) * o.rate, 'ctx-mult', 'Divide by ' + t(nT(o.rate)) + ', don’t multiply.']],
              t(nT(c) + '=' + o.Fee + '+' + nT(o.rate) + 'n') + ', so ' + t(nT(o.rate) + 'n=' + nT(c - o.Fee)) + ' and ' + t('n=\\dfrac{' + nT(c - o.Fee) + '}{' + nT(o.rate) + '}=' + nT(n)) + '. The move was ' + t(nT(n)) + ' km.',
              ['Substitute ' + t('C=' + nT(c)) + ' and solve for ' + t('n') + '.', 'Undo the steps in reverse: subtract the fee, then divide by the rate.'], 'distance for $' + c, { after: 'km' });
          } }] },
      /* ---------------- Question 5: water tank ---------------- */
      { num: '5', shared: tank,
        stem: function (o) { return 'A water tank initially holds ' + t(F(o.V0)) + ' L. It drains at a constant rate of ' + t(o.rate) + ' L per minute. The volume, ' + t('V') + ' litres, remaining after ' + t('t') + ' minutes is ' + t(o.eq) + '.'; },
        parts: [
          { id: '5a', level: 'BEG', make: function (r, o) {
            var ts = [0, o.s, 2 * o.s, 3 * o.s, 4 * o.s];
            return tablePart('Complete the table of values.' + HW.valueTable([[t('t') + ' (min)'].concat(ts.map(function (x) { return t(x); })), [t('V') + ' (L)'].concat(ts.map(function () { return '?'; }))]),
              't', 'V', ts, o.V, function (x, v) {
                if (x && same(v, o.rate * x)) return { code: 'ctx-used', hint: t(nT(o.rate * x)) + ' L is the water that has drained. Subtract it from ' + t(F(o.V0)) + '.' };
                if (x && same(v, o.V0 + o.rate * x)) return { code: 'ctx-added', hint: 'The tank is draining: subtract ' + t(o.rate + 't') + '.' };
                return null;
              }, ts.map(function (x) { return t('V=' + F(o.V0) + '-' + o.rate + '(' + x + ')=' + F(o.V(x))); }).join(', ') + '.',
              ['Substitute each value of ' + t('t') + ' into ' + t(o.eq) + '.'], 'tank table', '');
          } },
          { id: '5b', level: 'LIM', make: function (r, o) {
            return numPart('How much water is in the tank before draining begins?', o.V0, [[o.rate, 'ctx-rate', t(o.rate) + ' L is how much drains each minute. Before draining begins, ' + t('t=0') + '.'], [o.T, 'ctx-max-time', 'That is the time it takes to empty. Before draining begins, ' + t('t=0') + ': what is ' + t('V') + '?']],
              'Before draining begins, ' + t('t=0') + ': ' + t('V=' + F(o.V0) + '-' + o.rate + '(0)=' + F(o.V0)) + ' L. This is the ' + t('V') + '-intercept, ' + t('(0,\\ ' + F(o.V0) + ')') + '.', ['Before draining begins, ' + t('t=0') + '. Substitute it.'], 'tank initial volume', { after: 'L' });
          } },
          { id: '5c', level: 'EMG', make: function (r, o) {
            return numPart('How many minutes does it take for the tank to drain completely?', o.T, [[o.V0, 'int-gave-y', 'That is the starting volume (the ' + t('V') + '-intercept). The tank is empty when ' + t('V=0') + ': solve for ' + t('t') + '.'], [-o.T, 'int-sign', 'Time can’t be negative — check the signs: ' + t('0=' + F(o.V0) + '-' + o.rate + 't') + ' gives ' + t(o.rate + 't=' + F(o.V0)) + '.'], [o.V0 * o.rate, 'ctx-mult', 'Divide by ' + t(o.rate) + ', don’t multiply.']],
              'Empty means ' + t('V=0') + ': ' + t('0=' + F(o.V0) + '-' + o.rate + 't') + ', so ' + t(o.rate + 't=' + F(o.V0)) + ' and ' + t('t=' + o.T) + ' minutes. This is the ' + t('t') + '-intercept.', ['The tank is empty when ' + t('V=0') + '. Substitute and solve for ' + t('t') + '.'], 'time to drain', { after: 'min' });
          } },
          { id: '5d', level: 'BEG', make: function (r, o) {
            var x = o.td;
            return numPart('How much water remains in the tank after ' + t(x) + ' minutes?', o.V(x), [[o.rate * x, 'ctx-used', t(F(o.rate * x)) + ' L is the water that has <b>drained</b>. How much is <b>left</b>?'], [o.V0 + o.rate * x, 'ctx-added', 'The tank is draining: subtract.']],
              t('V=' + F(o.V0) + '-' + o.rate + '(' + x + ')=' + F(o.V0) + '-' + F(o.rate * x) + '=' + F(o.V(x))) + ' L.', ['Substitute ' + t('t=' + x) + ' into ' + t(o.eq) + '.'], 'tank after ' + x + ' min', { after: 'L' });
          } },
          { id: '5e', level: 'EMG', make: function (r, o) {
            var Vr = o.Vr, x = o.te;
            return numPart('How long will it take for the tank to have ' + t(F(Vr)) + ' L remaining?', x, [[Vr / o.rate, 'ctx-no-sub', 'That is how long ' + t(F(Vr)) + ' L takes to drain. Substitute ' + t('V=' + F(Vr)) + ' into the formula and solve for ' + t('t') + '.'],
              [o.V(Vr), 'ctx-eval', 'You substituted ' + t(F(Vr)) + ' for ' + t('t') + '. Here ' + t(F(Vr)) + ' is the <b>volume</b>: substitute ' + t('V=' + F(Vr)) + ' and solve for ' + t('t') + '.'], [(o.V0 + Vr) / o.rate, 'ctx-added', 'Check the signs: ' + t(F(Vr) + '=' + F(o.V0) + '-' + o.rate + 't') + ' gives ' + t(o.rate + 't=' + F(o.V0) + '-' + F(Vr)) + '.']],
              t(F(Vr) + '=' + F(o.V0) + '-' + o.rate + 't') + ', so ' + t(o.rate + 't=' + F(o.V0 - Vr)) + ' and ' + t('t=' + x) + ' minutes.', ['Substitute ' + t('V=' + F(Vr)) + ' and solve for ' + t('t') + '.'], 'time to ' + Vr + ' L', { after: 'min' });
          } },
          { id: '5f', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'Is this relation linear or nonlinear? How do you know?', [
              { html: '<b>Linear:</b> ' + t('V') + ' changes by the same amount (' + t('-' + o.rate) + ' L) every minute — a constant rate of change.', right: true },
              { html: '<b>Linear:</b> ' + t('V') + ' keeps decreasing.', why: 'Decreasing isn’t enough — a curve can decrease too. What makes a relation linear is that it changes by the <b>same amount</b> for each step in ' + t('t') + '.' },
              { html: '<b>Nonlinear:</b> the volume decreases toward zero.', why: 'Check the table: each ' + t(o.s) + ' minutes, ' + t('V') + ' drops by the same ' + t(F(o.rate * o.s)) + ' L. Equal changes mean linear.' },
              { html: '<b>Nonlinear:</b> the graph stops at ' + t('t=' + o.T) + '.', why: 'Where a graph stops is about its domain, not its shape. Look at how ' + t('V') + ' changes each minute.' }],
              '<b>Linear.</b> ' + t('V') + ' drops by the same ' + t(o.rate) + ' L every minute (in the table, by ' + t(F(o.rate * o.s)) + ' L every ' + t(o.s) + ' minutes) — a constant rate of change, which is what makes a relation linear.',
              ['Look at the table: by how much does ' + t('V') + ' change each time ' + t('t') + ' goes up by ' + t(o.s) + '?'], 'tank linear?');
          } }] },
      /* ---------------- Question 6: ball from a platform ---------------- */
      { num: '6', shared: ball,
        stem: function (o) { return 'A ball is launched upward from a platform. Its height, ' + t('h') + ' metres, above the ground after ' + t('t') + ' seconds (' + t('t\\ge 0') + ') is modelled by ' + t(o.eq) + '.'; },
        parts: [
          { id: '6a', level: 'BEG', make: function (r, o) {
            var v = o.v;
            return numPart('The maximum height is reached after ' + t(v) + ' seconds. Calculate the maximum height.', o.hmax, [[25 * v * v + o.b * v + o.c, 'ctx-square-coef', 'Square only the ' + t('t') + ': ' + t('-5(' + v + ')^{2}=-5(' + v * v + ')=' + (-5 * v * v)) + '. The ' + t('-5') + ' is not squared.'],
              [5 * v * v + o.b * v + o.c, 'ctx-sign-sq', 'The first term is negative: ' + t('-5(' + v + ')^{2}=' + (-5 * v * v)) + '.'], [o.hmax - o.c, 'ctx-no-c', 'Don’t forget the constant term ' + t('+' + o.c) + '.']],
              t('h=-5(' + v + ')^{2}+' + o.b + '(' + v + ')+' + o.c + '=' + (-5 * v * v) + '+' + o.b * v + '+' + o.c + '=' + o.hmax) + ' m.', ['Substitute ' + t('t=' + v) + '. Square first, then multiply by ' + t('-5') + '.'], 'max height', { after: 'm' });
          } },
          { id: '6b', level: 'BEG', make: function (r, o) {
            var ts = range(0, o.L);
            return tablePart('Complete the table of values.', 't', 'h', ts, o.h, function (x, v) {
              if (x && same(v, 25 * x * x + o.b * x + o.c)) return { code: 'ctx-square-coef', hint: 'Square only the ' + t('t') + ', then multiply by ' + t('-5') + ': ' + t('-5(' + x + ')^{2}=' + (-5 * x * x)) + '.' };
              if (x && same(v, 5 * x * x + o.b * x + o.c)) return { code: 'ctx-sign-sq', hint: 'The ' + t('-5t^{2}') + ' term is negative: ' + t('-5(' + x + ')^{2}=' + (-5 * x * x)) + '.' };
              return null;
            }, ts.map(function (x) { return t('h(' + x + ')=' + o.h(x)); }).join(', ') + '. (For example ' + t('h=-5(1)^{2}+' + o.b + '(1)+' + o.c + '=' + o.h(1)) + '.)',
            ['Substitute each value of ' + t('t') + '. Square ' + t('t') + ' first, then multiply by ' + t('-5') + '.', 'The heights should rise and then fall symmetrically.'], 'ball table');
          } },
          { id: '6b2', sub: 'b, graph', level: 'EMG', make: function (r, o) {
            var top = Math.ceil((o.hmax + 6) / 20) * 20, L = o.L, h0 = o.c, hm = o.hmax;
            return graphMC(r, 'Which graph shows ' + t('h') + ' versus ' + t('t') + ', joining the points of your table with a smooth curve?', [
              { html: ballGraph(o.h, L, top), right: true },
              { html: ballGraph(function (x) { return -5 * x * (x - L); }, L, top), why: 'At ' + t('t=0') + ' the ball is on the platform, ' + t(h0) + ' m above the ground — the graph should start at ' + t('(0,\\ ' + h0 + ')') + ', not at the origin.' },
              { html: ballGraph(function (x) { return h0 - h0 * x / L; }, L, top), why: 'Your table goes up to ' + t(hm) + ' m and back down, so the points are not on a straight line. Join them with a smooth curve.' },
              { html: ballGraph(function (x) { return o.h(L - x); }, L, top), why: 'This one starts on the ground and ends on the platform. At ' + t('t=0') + ' the ball is at ' + t(h0) + ' m, and it lands (' + t('h=0') + ') at ' + t('t=' + L) + '.' }],
              'Plot the table — ' + t('(0,\\ ' + h0 + ')') + ', ' + t('(' + o.v + ',\\ ' + hm + ')') + ', …, ' + t('(' + L + ',\\ 0)') + ' — and join them with a smooth curve: it starts at the platform height, rises to ' + t(hm) + ' m at ' + t('t=' + o.v) + ', and falls to the ground at ' + t('t=' + L) + '.',
              ['Where is the ball at ' + t('t=0') + '? Where is it at ' + t('t=' + L) + '? Is the path straight?'], 'ball graph');
          } },
          { id: '6c', level: 'BEG', make: function (r, o) {
            return mcPart(r, 'Is this relation linear or nonlinear?', [
              { html: '<b>Nonlinear:</b> ' + t('h') + ' does not change by the same amount each second — it rises, then falls, along a curve.', right: true },
              { html: '<b>Linear:</b> the values of ' + t('t') + ' go up in equal steps.', why: 'Equal steps in ' + t('t') + ' are just how the table was made. Look at the changes in ' + t('h') + ': ' + t(o.h(1) - o.h(0)) + ', ' + t(o.h(2) - o.h(1)) + ', … — not constant.' },
              { html: '<b>Linear:</b> the heights repeat in reverse, so the change is constant.', why: 'The heights are symmetric, but the change from one second to the next is ' + t(o.h(1) - o.h(0)) + ', then ' + t(o.h(2) - o.h(1)) + ', … — it changes.' },
              { html: '<b>Nonlinear:</b> because ' + t('h') + ' reaches ' + t('0') + '.', why: 'Lines can reach zero too (the water tank did). What matters is whether ' + t('h') + ' changes by the same amount each second.' }],
              '<b>Nonlinear.</b> From the table, ' + t('h') + ' changes by ' + t(o.h(1) - o.h(0)) + ', then ' + t(o.h(2) - o.h(1)) + ', then ' + t(o.h(3) - o.h(2)) + ', … — not a constant amount. The graph is a curve (a parabola), and the equation has a ' + t('t^{2}') + ' term.',
              ['Find the change in ' + t('h') + ' from each second to the next. Is it constant?'], 'ball nonlinear');
          } },
          { id: '6d', level: 'PRG', make: function (r, o) {
            var L = o.L, q = o.q, s = L - q;
            return numPart('For how many seconds is the ball in the air?', L, [[-q, 'ctx-neg-time', 'That solution is negative, but ' + t('t\\ge 0') + ' here. Reject it and use the other solution.'], [o.v, 'ctx-max-time', 'At ' + t('t=' + o.v) + ' the ball is at its <b>highest</b> point. It lands when ' + t('h=0') + '.'],
              [2 * o.v, 'ctx-platform', 'At ' + t('t=' + 2 * o.v) + ' the ball is back at platform height (' + t('h=' + o.c) + '), not on the ground. Solve ' + t('h=0') + '.'], [o.c, 'int-gave-y', 'That is the ' + t('h') + '-intercept (the height at ' + t('t=0') + '). Solve ' + t('h=0') + ' for the time it lands.'], [L + q, 'ctx-diff', 'Use only the positive solution of ' + t('h=0') + ' — the ball starts at ' + t('t=0') + '.']],
              'It lands when ' + t('h=0') + ': ' + t('0=' + o.eq.slice(2)) + '. Divide by ' + t('-5') + ': ' + t('0=t^{2}-' + s + 't-' + L * q + '=(t-' + L + ')(t+' + q + ')') + ', so ' + t('t=' + L) + ' or ' + t('t=-' + q) + '. Reject ' + t('t=-' + q) + ' since ' + t('t\\ge 0') + '. The ball is in the air for ' + t(L) + ' seconds.',
              ['The ball is in the air until it lands, when ' + t('h=0') + '. Divide the equation by ' + t('-5') + ' and factor.', 'Time can’t be negative here.'], 'time in the air', { after: 's' });
          } },
          { id: '6e', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'What does the ' + t('h') + '-intercept represent in the context of this problem?', [
              { html: 'The platform is ' + t(o.c) + ' m above the ground: the height of the ball at launch (' + t('t=0') + ').', right: true },
              { html: 'The maximum height of the ball.', why: 'The maximum, ' + t(o.hmax) + ' m, happens at ' + t('t=' + o.v) + '. The ' + t('h') + '-intercept is where ' + t('t=0') + '.' },
              { html: 'The time when the ball lands.', why: 'The ball lands when ' + t('h=0') + ' — that is the ' + t('t') + '-intercept. The ' + t('h') + '-intercept is where ' + t('t=0') + '.' },
              { html: 'The height when the ball lands.', why: 'When the ball lands its height is ' + t('0') + '. The ' + t('h') + '-intercept is the height at ' + t('t=0') + '.' }],
              'The ' + t('h') + '-intercept is ' + t(o.c) + ' (the point ' + t('(0,\\ ' + o.c + ')') + '): at ' + t('t=0') + ' the ball is ' + t(o.c) + ' m above the ground, so the platform is ' + t(o.c) + ' m high.', ['On the ' + t('h') + '-axis, ' + t('t=0') + '. What is happening at time zero?'], 'meaning of h-intercept');
          } },
          { id: '6f', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'What does the ' + t('t') + '-intercept represent in the context of this problem?', [
              { html: 'The ball lands on the ground ' + t(o.L) + ' seconds after it is launched.', right: true },
              { html: 'The moment the ball is launched.', why: 'The launch is at ' + t('t=0') + ' — the ' + t('h') + '-intercept. The ' + t('t') + '-intercept is where ' + t('h=0') + '.' },
              { html: 'The moment the ball reaches its highest point.', why: 'The highest point is at ' + t('t=' + o.v) + ', where ' + t('h=' + o.hmax) + '. The ' + t('t') + '-intercept is where ' + t('h=0') + '.' },
              { html: 'The moment the ball falls back past the platform.', why: 'That happens at ' + t('t=' + 2 * o.v) + ', where ' + t('h=' + o.c) + ' again. The ' + t('t') + '-intercept is where the height is ' + t('0') + ': ground level.' }],
              'The ' + t('t') + '-intercept is ' + t(o.L) + ' (the point ' + t('(' + o.L + ',\\ 0)') + '): the height is ' + t('0') + ', so the ball lands on the ground ' + t(o.L) + ' seconds after launch.', ['On the ' + t('t') + '-axis the height is ' + t('0') + '. When is the ball at height zero?'], 'meaning of t-intercept');
          } },
          { id: '6g', level: 'BEG', make: function (r, o) {
            var x = o.tg, x2 = cl(x * x);
            return numPart('Use the equation to calculate the exact height of the ball after ' + t(nT(x)) + ' seconds.', o.h(x), [[25 * x2 + o.b * x + o.c, 'ctx-square-coef', 'Square only the ' + t('t') + ': ' + t('-5(' + nT(x) + ')^{2}=-5(' + nT(x2) + ')') + '.'], [5 * x2 + o.b * x + o.c, 'ctx-sign-sq', 'The first term is negative: ' + t('-5(' + nT(x2) + ')=' + nT(-5 * x2)) + '.'], [Math.round(o.h(x)), 'round', 'The question asks for the <b>exact</b> height — don’t round.']],
              t('h=-5(' + nT(x) + ')^{2}+' + o.b + '(' + nT(x) + ')+' + o.c + '=-5(' + nT(x2) + ')+' + nT(o.b * x) + '+' + o.c + '=' + nT(-5 * x2) + '+' + nT(o.b * x + o.c) + '=' + nT(o.h(x))) + ' m.', ['Substitute ' + t('t=' + nT(x)) + '. Square first, then multiply by ' + t('-5') + '.'], 'height at ' + x, { after: 'm' });
          } },
          { id: '6h', level: 'PRG', make: function (r, o) {
            return mcPart(r, 'Does it make sense to extend the graph further in a downward direction, to the left or to the right?', [
              { html: '<b>No, in neither direction.</b> To the left, ' + t('t<0') + ' is time before the launch. To the right, the ball has already landed at ' + t('t=' + o.L) + '.', right: true },
              { html: '<b>Yes, to the right:</b> the curve keeps going down as time goes on.', why: 'Past ' + t('t=' + o.L) + ' the formula gives negative heights, but the ball is lying on the ground — it can’t go below it.' },
              { html: '<b>Yes, to the left:</b> earlier times show the ball rising onto the platform.', why: 'The model starts at the launch, ' + t('t=0') + ' (' + t('t\\ge 0') + '). Negative times are before the ball was launched.' },
              { html: '<b>Yes, in both directions:</b> a parabola goes on forever.', why: 'The equation can be graphed forever, but it only describes the ball from launch (' + t('t=0') + ') until it lands (' + t('t=' + o.L) + ').' }],
              '<b>No.</b> To the left, ' + t('t<0') + ' is time before the launch, which has no meaning here. To the right, the ball strikes the ground at ' + t('t=' + o.L) + ', so the formula no longer describes its height after that. The graph makes sense only for ' + t('0\\le t\\le ' + o.L) + '.',
              ['What would a negative time mean? What happens to the ball at ' + t('t=' + o.L) + '?'], 'extend the ball graph?');
          } }] },
      /* ---------------- Question 7: lines from their intercepts ---------------- */
      { num: '7', section: 'Part C — Lines with one, two, or infinitely many intercepts', stem: 'Each line is described by its intercepts.', parts: [
        { id: '7a', level: 'BEG', make: function (r) {
          var ab = r.chance(0.3) ? [4, -2] : pickWhere(function () { return [r.pick(pm(2, 5)), r.pick(pm(2, 5))]; }, function (z) { return Math.abs(z[0]) !== Math.abs(z[1]); }), a = ab[0], b = ab[1];
          var G = function (x, y) { return lineGraph(x, y, { max: 250 }); };
          return mcPart(r, 'Which graph shows a line with ' + t('x') + '-intercept ' + t(a) + ' and ' + t('y') + '-intercept ' + t(b) + '?', [
            { html: G(a, b), right: true },
            { html: G(b, a), why: 'This line has ' + t('x') + '-intercept ' + t(b) + ' and ' + t('y') + '-intercept ' + t(a) + ' — the two are swapped. The ' + t('x') + '-intercept is on the horizontal axis.' },
            { html: G(-a, -b), why: 'Check the signs: this line crosses the ' + t('x') + '-axis at ' + t(-a) + ' and the ' + t('y') + '-axis at ' + t(-b) + '.' },
            { html: G(a, -b), why: 'The ' + t('x') + '-intercept is right, but this line crosses the ' + t('y') + '-axis at ' + t(-b) + ', not ' + t(b) + '.' }],
            'Plot ' + t(ptT([a, 0])) + ' on the ' + t('x') + '-axis and ' + t(ptT([0, b])) + ' on the ' + t('y') + '-axis, and draw the line through them.', ['The ' + t('x') + '-intercept point is ' + t(ptT([a, 0])) + '; the ' + t('y') + '-intercept point is ' + t(ptT([0, b])) + '.'], 'sketch line ' + a + ', ' + b);
        } },
        { id: '7b', level: 'EMG', make: function (r) {
          var k = r.pick([-3, -3].concat(pm(1, 6)));
          return linePart('A line has ' + t('y') + '-intercept ' + t(k) + ' and <b>no</b> ' + t('x') + '-intercept. Write the equation of the line.', [0, 1, -k], 'y=' + k, {},
            'A line that never meets the ' + t('x') + '-axis is parallel to it: <b>horizontal</b>. A horizontal line through ' + t(ptT([0, k])) + ' has every ' + t('y') + '-value equal to ' + t(k) + ': ' + t('y=' + k) + '.',
            ['Which kind of line never crosses the ' + t('x') + '-axis?', 'On a horizontal line every point has the same ' + t('y') + '-coordinate.'], 'line y-int ' + k + ', no x-int');
        } },
        { id: '7c', level: 'EMG', make: function (r) {
          var h = r.pick([3, 3].concat(pm(1, 6)));
          return linePart('A line has ' + t('x') + '-intercept ' + t(h) + ' and <b>no</b> ' + t('y') + '-intercept. Write the equation of the line.', [1, 0, -h], 'x=' + h, {},
            'A line that never meets the ' + t('y') + '-axis is parallel to it: <b>vertical</b>. A vertical line through ' + t(ptT([h, 0])) + ' has every ' + t('x') + '-value equal to ' + t(h) + ': ' + t('x=' + h) + '.',
            ['Which kind of line never crosses the ' + t('y') + '-axis?', 'On a vertical line every point has the same ' + t('x') + '-coordinate.'], 'line x-int ' + h + ', no y-int');
        } },
        { id: '7d', level: 'PRG', make: function (r) {
          var yInts = r.chance(0.7), T = yInts ? [1, 0, 0] : [0, 1, 0], key = yInts ? 'x=0' : 'y=0', ax = yInts ? 'y' : 'x', oth = yInts ? 'x' : 'y';
          return linePart('A line has <b>infinitely many</b> ' + t(ax) + '-intercepts. Write the equation of the line.', T, key, { diag: function (c) {
            var v = same(c.B, 0), h = same(c.A, 0);
            if ((yInts && h && same(c.C, 0)) || (!yInts && v && same(c.C, 0))) return { code: 'eq-h-v', hint: t(eqTexOf(c)) + ' is the <b>' + oth + '-axis</b>: it has infinitely many ' + t(oth) + '-intercepts. Which line lies along the ' + t(ax) + '-axis?' };
            if ((yInts && v) || (!yInts && h)) return { code: 'eq-const', hint: t(eqTexOf(c)) + ' is parallel to the ' + t(ax) + '-axis, so it never meets it. To meet it at infinitely many points the line must lie <b>on</b> the ' + t(ax) + '-axis.' };
            if ((yInts && h) || (!yInts && v)) return { code: 'eq-h-v', hint: t(eqTexOf(c)) + ' crosses the ' + t(ax) + '-axis only <b>once</b>. To meet the ' + t(ax) + '-axis at infinitely many points the line must lie <b>along</b> it.' };
            return null;
          } }, 'To meet the ' + t(ax) + '-axis at infinitely many points, the line must <b>be</b> the ' + t(ax) + '-axis. Every point on the ' + t(ax) + '-axis has ' + t(oth + '=0') + ', so the equation is ' + t(key) + '.',
          ['A line can only meet an axis at more than one point if it lies along that axis.', 'Which coordinate is ' + t('0') + ' at every point on the ' + t(ax) + '-axis?'], 'infinitely many ' + ax + '-intercepts');
        } }] },
      /* ---------------- Question 8: multiple choice ---------------- */
      { num: '8', section: 'Part D — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'PRG', make: function (r) {
          var booklet = r.chance(0.25), j = booklet ? 6 : r.pick(pm(2, 8)), eqA = 'y=' + lin([[1, 'x'], [j, '']]);
          var kind = booklet ? 0 : r.int(0, 2), c = booklet ? 3 : r.int(2, 5), k = booklet ? 4 : r.int(2, 6), eqB, solB;
          if (kind === 0) { eqB = c + 'x+' + c + 'y=' + c * k; solB = t('y=0') + ': ' + t(c + 'x=' + c * k) + ', ' + t('x=' + k) + '; ' + t('x=0') + ': ' + t(c + 'y=' + c * k) + ', ' + t('y=' + k); }
          else if (kind === 1) { eqB = 'y=-x+' + k; solB = t('y=0') + ': ' + t('x=' + k) + '; ' + t('x=0') + ': ' + t('y=' + k); }
          else { eqB = 'x+y-' + k + '=0'; solB = t('y=0') + ': ' + t('x=' + k) + '; ' + t('x=0') + ': ' + t('y=' + k); }
          var pq = booklet ? [3, 4, 2] : pickWhere(function () { return [r.int(2, 5), r.int(2, 5), r.int(1, 4)]; }, function (z) { return z[0] !== z[1]; }), p = pq[0], q = pq[1], w = pq[2], s = q * w;
          var eqC = lin([[p, 'x'], [-q, 'y'], [s, '']]) + '=0', xC = -s / p;
          var opts = r.shuffle([
            { html: t(eqA), right: false, why: 'For ' + t(eqA) + ': ' + t('x') + '-intercept ' + t(-j) + ', ' + t('y') + '-intercept ' + t(j) + ' — opposites, not equal.' },
            { html: t(eqB), right: true },
            { html: t(eqC), right: false, why: 'For ' + t(eqC) + ': ' + t('x') + '-intercept ' + t(vt(xC)) + ', ' + t('y') + '-intercept ' + t(w) + ' — not equal.' }]);
          opts.push({ html: 'none of the above', why: 'Work out both intercepts of each equation: one of them does have equal values.' });
          return mcPart(r, 'In which of the following relations does the graph have ' + t('x') + '- and ' + t('y') + '-intercepts with <b>equal values</b>?', opts,
            t(eqA) + ': ' + t('x') + '-int ' + t(-j) + ', ' + t('y') + '-int ' + t(j) + ' — not equal.<br>' + t(eqB) + ': ' + solB + ' — <b>equal</b>.<br>' + t(eqC) + ': ' + t('x') + '-int ' + t(vt(xC)) + ', ' + t('y') + '-int ' + t(w) + ' — not equal.',
            ['Find both intercepts of every option: ' + t('y=0') + ' for the ' + t('x') + '-intercept, ' + t('x=0') + ' for the ' + t('y') + '-intercept.'], 'equal intercepts MC', true);
        } }] },
      { num: '9', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'PRG', make: function (r) {
          var ab = r.chance(0.25) ? [8, 6] : pickWhere(function () { return [r.int(2, 9), r.int(2, 9)]; }, function (z) { return z[0] !== z[1]; }), a1 = ab[0], b = ab[1];
          var T = reduceT([b, -a1, a1 * b]), eq = stdTex(T) + '=0', ans = b + a1;
          return B.nr('The line ' + t(eq) + ' has ' + t('x') + '-intercept ' + t('a') + ' and ' + t('y') + '-intercept ' + t('b') + '. The value of ' + t('b-a') + ' is ________.', ans, function (v) {
            if (v === Math.abs(b - a1)) return { code: 'nr-one-sign', hint: 'Check the sign of ' + t('a') + ': ' + t('y=0') + ' gives ' + t(lin([[T[0], 'x'], [T[2], '']]) + '=0') + ', so ' + t('a') + ' is negative. Subtracting a negative adds.' };
            if (v === a1 * b) return { code: 'nr-sum', hint: 'The question asks for ' + t('b-a') + ', a difference, not a product.' };
            return null;
          }, t('y=0') + ': ' + t(lin([[T[0], 'x'], [T[2], '']]) + '=0') + ', ' + t('x=' + (-a1)) + ', so ' + t('a=' + (-a1)) + '.<br>' + t('x=0') + ': ' + t(lin([[T[1], 'y'], [T[2], '']]) + '=0') + ', ' + t('y=' + b) + ', so ' + t('b=' + b) + '.<br>' + t('b-a=' + b + '-(' + (-a1) + ')=' + ans) + '.',
          ['Find ' + t('a') + ' with ' + t('y=0') + ' and ' + t('b') + ' with ' + t('x=0') + '.', 'One of the intercepts is negative — use brackets when you subtract it.'], 'b - a for ' + eq);
        } }] },
      /* ---------------- Extension ---------------- */
      { num: '10', section: 'Extension — Intercepts of other curves', stem: '<i>(Extension)</i> Determine the ' + t('x') + '- and ' + t('y') + '-intercepts of each equation. <b>Write each intercept point as an ordered pair.</b> If there is no such intercept, press <b>none</b>.', parts: [
        { id: '10a', level: 'PRG', make: function (r) {
          var pq = r.chance(0.3) ? [4, 8] : pickWhere(function () { return [r.int(2, 10), r.int(2, 10)]; }, function (z) { var L = lcm(z[0] * z[0], z[1] * z[1]); return z[0] !== z[1] && L <= 400 && L / (z[0] * z[0]) <= 25 && L / (z[1] * z[1]) <= 25; });
          var p = pq[0], q = pq[1], L = lcm(p * p, q * q), a = L / (p * p), b = L / (q * q), co = function (k) { return k === 1 ? '' : String(k); };
          var eq = co(a) + 'x^{2}+' + co(b) + 'y^{2}=' + L;
          return interceptsPart(t(eq), [p, -p], [q, -q], { text: 'intercepts of ' + eq, xMiss: 'A square root has two values: ' + t('\\pm') + '.', yMiss: 'A square root has two values: ' + t('\\pm') + '.',
            sol: t('y=0') + ': ' + t(co(a) + 'x^{2}=' + L) + ', ' + t('x^{2}=' + p * p) + ', ' + t('x=\\pm' + p) + '.<br>' + t('x=0') + ': ' + t(co(b) + 'y^{2}=' + L) + ', ' + t('y^{2}=' + q * q) + ', ' + t('y=\\pm' + q) + '.<br>' + t('x') + '-intercept points ' + t(ptsT([[p, 0], [-p, 0]])) + '; ' + t('y') + '-intercept points ' + t(ptsT([[0, q], [0, -q]])) + '.' });
        } },
        { id: '10b', level: 'PRG', make: function (r) {
          var o = r.chance(0.3) ? [4, 4, 1] : pickWhere(function () { return [r.int(2, 8), r.pick([1, 4, 9]), r.pick([1, 4, 9, 16])]; }, function (z) { return z[1] * z[0] * z[0] <= 200 && z[1] !== z[2]; });
          var p = o[0], a = o[1], b = o[2], c = a * p * p, co = function (k) { return k === 1 ? '' : String(k); }, eq = co(a) + 'x^{2}-' + co(b) + 'y^{2}=' + c;
          return interceptsPart(t(eq), [p, -p], null, { text: 'intercepts of ' + eq, xMiss: 'A square root has two values: ' + t('\\pm') + '.',
            yNone: 'Check: ' + t('x=0') + ' gives ' + t('-' + co(b) + 'y^{2}=' + c) + ', so ' + t('y^{2}') + ' would be negative. No real number squares to a negative, so there is <b>no</b> ' + t('y') + '-intercept.',
            sol: t('y=0') + ': ' + t(co(a) + 'x^{2}=' + c) + ', ' + t('x^{2}=' + p * p) + ', ' + t('x=\\pm' + p) + '.<br>' + t('x=0') + ': ' + t('-' + co(b) + 'y^{2}=' + c) + ', ' + t('y^{2}=' + rT(-c, b)) + ' — no real solution, so there is <b>no ' + t('y') + '-intercept</b>.<br>' + t('x') + '-intercept points ' + t(ptsT([[p, 0], [-p, 0]])) + '.' });
        } },
        { id: '10c', level: 'EMG', make: function (r) {
          var n = r.pick([7, 7].concat(range(2, 12))), eq = 'x^{2}+y^{2}=' + n * n;
          return interceptsPart(t(eq), [n, -n], [n, -n], { text: 'intercepts of ' + eq, xMiss: 'A square root has two values: ' + t('\\pm') + '.', yMiss: 'A square root has two values: ' + t('\\pm') + '.',
            sol: t('y=0') + ': ' + t('x^{2}=' + n * n) + ', ' + t('x=\\pm' + n) + '. ' + t('x=0') + ': ' + t('y^{2}=' + n * n) + ', ' + t('y=\\pm' + n) + '.<br>' + t('x') + '-intercept points ' + t(ptsT([[n, 0], [-n, 0]])) + '; ' + t('y') + '-intercept points ' + t(ptsT([[0, n], [0, -n]])) + '. (The graph is a circle of radius ' + t(n) + '.)' });
        } }] },
      { num: '11', stem: '<i>(Extension)</i>', parts: [
        { id: '11', level: 'PRG', make: function (r) {
          var pq = r.chance(0.3) ? [4, 5] : pickWhere(function () { return [r.int(2, 9), r.int(2, 9)]; }, function (z) { var L = lcm(z[0] * z[0], z[1] * z[1]); return z[0] !== z[1] && z[0] * z[1] <= 99 && L <= 2500; });
          var p = pq[0], q = pq[1], L = lcm(p * p, q * q), a = L / (p * p), b = L / (q * q), co = function (k) { return k === 1 ? '' : String(k); }, ans = p * p * q * q;
          var eq = co(a) + 'x^{2}+' + co(b) + 'y^{2}-' + F(L) + '=0';
          return B.nr('The graph of ' + t(eq) + ' has ' + t('x') + '-intercepts ' + t('a') + ' and ' + t('b') + ', and ' + t('y') + '-intercepts ' + t('c') + ' and ' + t('d') + '. The value of the product ' + t('abcd') + ' is ________.', ans, function (v) {
            if (v === p * q) return { code: 'nr-pos-only', hint: 'Each axis has <b>two</b> intercepts, a positive and a negative one. Multiply all four.' };
            if (v === 0) return { code: 'nr-sum', hint: 'Multiply the four intercepts — don’t add them.' };
            if (v === p * p + q * q || v === 2 * (p + q)) return { code: 'nr-sum', hint: 'Multiply the four intercepts — don’t add them.' };
            return null;
          }, t('y=0') + ': ' + t(co(a) + 'x^{2}=' + F(L)) + ', ' + t('x^{2}=' + p * p) + ', so ' + t('a=' + p) + ', ' + t('b=' + (-p)) + '.<br>' + t('x=0') + ': ' + t(co(b) + 'y^{2}=' + F(L)) + ', ' + t('y^{2}=' + q * q) + ', so ' + t('c=' + q) + ', ' + t('d=' + (-q)) + '.<br>' + t('abcd=(' + p + ')(' + (-p) + ')(' + q + ')(' + (-q) + ')=' + F(ans)) + '.',
          ['Find all four intercepts first: two ' + t('x') + '-intercepts and two ' + t('y') + '-intercepts.', 'Two negatives multiply to a positive.'], 'abcd for ' + eq);
        } }] }
    ],
    extra: EXTRA()
  });

  /* =============================== Extra practice (u5_EP03) =============================== */
  function fracOf(x) { for (var q = 1; q <= 24; q++) if (Math.abs(x * q - Math.round(x * q)) < 1e-6) return ex.norm(Math.round(x * q), q); throw new Error('u5l3: not a simple fraction ' + x); }
  /* the VALUE of one intercept (exact; fractions allowed, a terminating decimal is fine). o: { axis, other, dl: [[v, code, hint]] } */
  function valBox(target, o) {
    o = o || {};
    var oth = o.axis === 'x' ? 'y' : 'x', dl = (o.dl || []).filter(function (d) { return isFinite(d[0]) && !same(d[0], target); });
    var base = K.fraction(fracOf(target), { decimalOk: true, diag: function (v) {
      for (var i = 0; i < dl.length; i++) if (same(v, dl[i][0])) return { code: dl[i][1], hint: dl[i][2] };
      if (o.other != null && same(v, o.other) && !same(o.other, target)) return { code: o.axis === 'x' ? 'int-gave-y' : 'int-gave-x', hint: 'That is the value of the ' + t(oth) + '-intercept. For the ' + t(o.axis) + '-intercept substitute ' + t(oth + '=0') + '.' };
      return null; } });
    return function (resp) {
      if (looksPoint(resp)) return form('int-point-not-value', 'The question asks for the <b>value</b> — a single number — not the ordered pair.');
      if (isNone(resp)) return wrong('int-said-none', 'This line does meet the ' + t(o.axis) + '-axis: substitute ' + t(oth + '=0') + ' and solve.');
      return base(resp);
    };
  }
  /* "the value of the x-intercept and the value of the y-intercept": two boxes */
  function valuesPart(prompt, xv, yv, o) {
    o = o || {};
    var fields = [{ name: 'Value of the ' + t('x') + '-intercept', label: t('x') + '-intercept', mode: 'math', keys: 'fraction', placeholder: 'e.g. -4 or 5/2' }, { name: 'Value of the ' + t('y') + '-intercept', label: t('y') + '-intercept', mode: 'math', keys: 'fraction', placeholder: 'e.g. -4 or 5/2' }];
    var p = B.fields(prompt, fields, [valBox(xv, { axis: 'x', other: yv, dl: o.xdl }), valBox(yv, { axis: 'y', other: xv, dl: o.ydl })], [vt(xv), vt(yv)],
      'Value of the ' + t('x') + '-intercept: ' + t(vt(xv)) + '<br>Value of the ' + t('y') + '-intercept: ' + t(vt(yv)), o.sol, o.hints || HXY.slice(0, 1).concat([HX[1]]), o.text);
    p.bad = (same(xv, yv) ? [] : [[vt(yv), vt(xv)]]).concat([['(' + vt(xv) + ', 0)', '(0, ' + vt(yv) + ')']]);
    p.good = [[String(cl(xv)), String(cl(yv))]].filter(function (g) { return !/e/.test(g[0] + g[1]) && Number.isFinite(Number(g[0])) && Math.abs(Number(g[0]) * 1e6 - Math.round(Number(g[0]) * 1e6)) < 1e-6 && fracOf(xv)[1] && [1, 2, 4, 5, 8, 10, 20, 25].indexOf(fracOf(xv)[1]) >= 0 && [1, 2, 4, 5, 8, 10, 20, 25].indexOf(fracOf(yv)[1]) >= 0; });
    return p;
  }
  function clipFn(f, x0, x1, y0, y1) { // the part of a line y = f(x) inside the box
    var pts = [], n = 400;
    for (var i = 0; i <= n; i++) { var x = x0 + (x1 - x0) * i / n, y = f(x); if (y >= y0 - 1e-9 && y <= y1 + 1e-9) pts.push([x, y]); }
    return [pts[0], pts[pts.length - 1]];
  }
  function axisGraph(spec) { // a ±6 grid labelled every unit (Extra practice Part B)
    return HW.graph(Object.assign({ x: [-6, 6], y: [-6, 6], labels: 1, max: 320 }, spec));
  }

  function EXTRA() {
    return [
      /* ---------- Part A: value or ordered pair ---------- */
      { num: '1', section: 'Extra practice A — A value or an ordered pair?', stem: 'Determine the <b>value</b> of the ' + t('x') + '-intercept and the <b>value</b> of the ' + t('y') + '-intercept of each line. (A value is a single number; a fraction is fine.)', parts: [
        { id: 'e1a', level: 'EMG', make: function (r) {
          var o = r.chance(0.25) ? [5, 2, 30] : pickWhere(function () { var A = r.int(2, 7), Bc = r.int(2, 7); return [A, Bc, lcm(A, Bc) * r.int(1, 3)]; }, function (z) { return z[0] !== z[1] && z[2] <= 60; });
          var A = o[0], Bc = o[1], C = o[2], eq = A + 'x-' + Bc + 'y=' + C;
          return valuesPart(t(eq), C / A, -C / Bc, { text: 'values of intercepts of ' + eq, xdl: [[-C / A, 'int-sign', 'Check the sign.']], ydl: [[C / Bc, 'int-sign', 'Check the sign: ' + t('-' + Bc + 'y=' + C) + ', so you divide by a negative number.']],
            sol: t('y=0') + ': ' + t(A + 'x=' + C) + ', ' + t('x=' + vt(C / A)) + '.<br>' + t('x=0') + ': ' + t('-' + Bc + 'y=' + C) + ', ' + t('y=' + vt(-C / Bc)) + '.<br>Values: ' + t('x') + '-intercept ' + t(vt(C / A)) + ', ' + t('y') + '-intercept ' + t(vt(-C / Bc)) + '.' });
        } },
        { id: 'e1b', level: 'EMG', make: function (r) {
          var p = r.pick([4, 4, 2, 3, 5, 6, 8, 9]), q = r.pick([3, 3].concat(pm(2, 9).filter(function (x) { return x !== p; }))), eq = '\\dfrac{x}{' + p + '}' + (q < 0 ? '-' : '+') + '\\dfrac{y}{' + Math.abs(q) + '}=1';
          return valuesPart(t(eq), p, q, { text: 'values of intercepts of x/' + p + '+y/' + q + '=1', xdl: [[1 / p, 'ctx-mult', t('\\dfrac{x}{' + p + '}=1') + ' means ' + t('x') + ' divided by ' + t(p) + ' is ' + t('1') + ': multiply both sides by ' + t(p) + '.']], ydl: [[1 / q, 'ctx-mult', 'Multiply both sides by the denominator.'], [-q, 'int-sign', 'Check the sign of the ' + t('y') + '-term.']],
            sol: t('y=0') + ': ' + t('\\dfrac{x}{' + p + '}=1') + ', ' + t('x=' + p) + '.<br>' + t('x=0') + ': ' + t((q < 0 ? '-' : '') + '\\dfrac{y}{' + Math.abs(q) + '}=1') + ', ' + t('y=' + q) + '.<br>(In the form ' + t('\\frac{x}{a}+\\frac{y}{b}=1') + ' the intercepts can be read straight off: ' + t('a') + ' and ' + t('b') + '.)' });
        } },
        { id: 'e1c', level: 'EMG', make: function (r) {
          var o = r.chance(0.25) ? [2, 7, 3] : pickWhere(function () { return [r.int(2, 5), r.int(3, 9), r.int(1, 5)]; }, function (z) { return z[0] !== z[1] && (z[1] * z[2]) % z[0] !== 0; });
          var A = o[0], Bc = o[1], C = Bc * o[2], eq = A + 'x-' + Bc + 'y-' + C + '=0';
          return valuesPart(t(eq), C / A, -o[2], { text: 'values of intercepts of ' + eq, xdl: [[-C / A, 'int-sign', 'Check the sign when ' + t(C) + ' moves to the other side.'], [A / C, 'ctx-mult', 'Upside down: ' + t(A + 'x=' + C) + ' gives ' + t('x=\\frac{' + C + '}{' + A + '}') + '.']], ydl: [[o[2], 'int-sign', 'Check the sign: ' + t('-' + Bc + 'y=' + C) + '.']],
            sol: t('y=0') + ': ' + t(A + 'x-' + C + '=0') + ', ' + t(A + 'x=' + C) + ', ' + t('x=' + rT(C, A)) + '.<br>' + t('x=0') + ': ' + t('-' + Bc + 'y-' + C + '=0') + ', ' + t('-' + Bc + 'y=' + C) + ', ' + t('y=' + (-o[2])) + '.<br>An intercept doesn’t have to be a whole number: the value of the ' + t('x') + '-intercept is ' + t(rT(C, A)) + '.' });
        } },
        { id: 'e1d', level: 'EMG', make: function (r) {
          var nd = r.chance(0.25) ? [2, 3] : r.pick([[2, 3], [3, 4], [1, 2], [3, 2], [2, 5], [4, 3], [5, 2]]), n = nd[0], d = nd[1], k = r.chance(0.25) && n === 2 && d === 3 ? 3 : r.int(1, 4), c = n * k;
          var eq = 'y=\\dfrac{' + n + '}{' + d + '}x-' + c;
          return valuesPart(t(eq), k * d, -c, { text: 'values of intercepts of ' + eq, xdl: [[c * n / d, 'ctx-mult', 'To undo ' + t('\\frac{' + n + '}{' + d + '}x') + ', multiply by the reciprocal ' + t('\\frac{' + d + '}{' + n + '}') + '.'], [-k * d, 'int-sign', 'Check the sign.']],
            sol: t('y=0') + ': ' + t('0=\\dfrac{' + n + '}{' + d + '}x-' + c) + ', ' + t('\\dfrac{' + n + '}{' + d + '}x=' + c) + ', ' + t('x=' + c + '\\times\\dfrac{' + d + '}{' + n + '}=' + k * d) + '.<br>' + t('x=0') + ': ' + t('y=\\dfrac{' + n + '}{' + d + '}(0)-' + c + '=' + (-c)) + '.' });
        } },
        { id: 'e1e', level: 'EMG', make: function (r) {
          var o = r.chance(0.25) ? [25, 40, 2] : pickWhere(function () { var ps = r.sample([20, 25, 40, 50, 80], 2); return [ps[0], ps[1], r.int(1, 4)]; }, function (z) { return (z[2] * 100) % z[0] === 0 && (z[2] * 100) % z[1] === 0 && z[2] * 100 / z[0] <= 20 && z[2] * 100 / z[1] <= 20; });
          var p = o[0] / 100, q = o[1] / 100, s = o[2], eq = nT(p) + 'x+' + nT(q) + 'y=' + s, xi = s * 100 / o[0], yi = s * 100 / o[1];
          return valuesPart(t(eq), xi, yi, { text: 'values of intercepts of ' + eq, xdl: [[s * p, 'ctx-mult', 'Divide by ' + t(nT(p)) + ', don’t multiply.']], ydl: [[s * q, 'ctx-mult', 'Divide by ' + t(nT(q)) + ', don’t multiply.']],
            sol: t('y=0') + ': ' + t(nT(p) + 'x=' + s) + ', ' + t('x=\\dfrac{' + s + '}{' + nT(p) + '}=' + xi) + '.<br>' + t('x=0') + ': ' + t(nT(q) + 'y=' + s) + ', ' + t('y=\\dfrac{' + s + '}{' + nT(q) + '}=' + yi) + '.' });
        } },
        { id: 'e1f', level: 'PRG', make: function (r) {
          var o = r.chance(0.25) ? [3, 4, 2, 1] : pickWhere(function () { return [r.int(2, 5), r.int(2, 5), r.int(1, 4), r.int(1, 4)]; }, function (z) { return z[0] !== z[1]; });
          var a = o[0], b = o[1], h = o[2], k = o[3], C = a * h + b * k, eq = a + '(x-' + h + ')=' + b + '(y+' + k + ')';
          return valuesPart(t(eq), C / a, -C / b, { text: 'values of intercepts of ' + eq,
            xdl: [[(a * h + k) / a, 'ctx-dist', 'Multiply ' + t(b) + ' into <b>both</b> terms of ' + t('(y+' + k + ')') + '.'], [h, 'ctx-dist', 'Expand both sides first: the bracket ' + t('(y+' + k + ')') + ' does not disappear when ' + t('y=0') + '.']],
            ydl: [[(-h - b * k) / b, 'ctx-dist', 'Multiply ' + t(a) + ' into <b>both</b> terms of ' + t('(x-' + h + ')') + '.'], [-k, 'ctx-dist', 'Expand both sides first: the bracket ' + t('(x-' + h + ')') + ' does not disappear when ' + t('x=0') + '.']],
            sol: 'Expand: ' + t(a + 'x-' + a * h + '=' + b + 'y+' + b * k) + ', so ' + t(a + 'x-' + b + 'y-' + C + '=0') + '.<br>' + t('y=0') + ': ' + t(a + 'x=' + C) + ', ' + t('x=' + rT(C, a)) + '.<br>' + t('x=0') + ': ' + t('-' + b + 'y=' + C) + ', ' + t('y=' + rT(-C, b)) + '.' });
        } }] },
      { num: '2', stem: 'Determine the ' + t('x') + '-intercept(s) and the ' + t('y') + '-intercept of each parabola. <b>Answer as ordered pairs.</b> If a graph has no ' + t('x') + '-intercept, press <b>none</b>.', parts: [
        { id: 'e2a', level: 'PRG', make: function (r) {
          var o = r.chance(0.25) ? [7, -2] : pickWhere(function () { return [r.int(2, 9), -r.int(1, 6)]; }, function (z) { return z[0] !== -z[1]; }), p = o[0], q = o[1];
          var eq = 'y=' + lin([[1, 'x^{2}'], [-(p + q), 'x'], [p * q, '']]);
          return interceptsPart(t(eq), [p, q], [p * q], { text: 'intercepts of ' + eq, xMiss: 'Factor the trinomial: it has two factors, and each one gives an ' + t('x') + '-intercept.',
            sol: t('y=0') + ': ' + t('0=' + eq.slice(2)) + ', ' + t('0=(x' + sg(-p) + ')(x' + sg(-q) + ')') + ', so ' + t('x=' + p) + ' or ' + t('x=' + q) + '.<br>' + t('x=0') + ': ' + t('y=' + p * q) + '.<br>' + t('x') + '-intercepts ' + t(ptsT([[p, 0], [q, 0]])) + '; ' + t('y') + '-intercept ' + t(ptT([0, p * q])) + '.' });
        } },
        { id: 'e2b', level: 'EMG', make: function (r) {
          var a = r.pick([2, 2, 3, 4, 5]), n = r.pick([3, 3, 2, 4, 5]), eq = 'y=' + a + 'x^{2}-' + a * n * n;
          return interceptsPart(t(eq), [n, -n], [-a * n * n], { text: 'intercepts of ' + eq, xMiss: t('x^{2}=' + n * n) + ' has two solutions — don’t forget the negative square root.',
            sol: t('y=0') + ': ' + t(a + 'x^{2}=' + a * n * n) + ', ' + t('x^{2}=' + n * n) + ', ' + t('x=\\pm' + n) + '. (Or factor: ' + t(a + '(x-' + n + ')(x+' + n + ')') + '.)<br>' + t('x=0') + ': ' + t('y=' + (-a * n * n)) + '.<br>' + t('x') + '-intercepts ' + t(ptsT([[n, 0], [-n, 0]])) + '; ' + t('y') + '-intercept ' + t(ptT([0, -a * n * n])) + '.' });
        } },
        { id: 'e2c', level: 'PRG', make: function (r) {
          var h = r.pick([3, 3].concat(pm(2, 7))), eq = 'y=' + lin([[1, 'x^{2}'], [-2 * h, 'x'], [h * h, '']]);
          return interceptsPart(t(eq), [h], [h * h], { text: 'intercepts of ' + eq, xDiag: function (A) { return A.some(function (p) { return same(p[0], -h) && same(p[1], 0); }) ? { code: 'int-extra', hint: t('0=(x' + sg(-h) + ')^{2}') + ' only when ' + t('x' + sg(-h) + '=0') + '. Both factors are the same, so there is only <b>one</b> ' + t('x') + '-intercept — the graph just touches the axis.' } : null; },
            sol: t('y=0') + ': ' + t('0=(x' + sg(-h) + ')^{2}') + ', so ' + t('x=' + h) + ' only (the graph touches the ' + t('x') + '-axis once).<br>' + t('x=0') + ': ' + t('y=' + h * h) + '.<br>' + t('x') + '-intercept ' + t(ptT([h, 0])) + '; ' + t('y') + '-intercept ' + t(ptT([0, h * h])) + '.' });
        } },
        { id: 'e2d', level: 'ADV', make: function (r) {
          var h = r.pick([2, 2].concat(pm(1, 4))), k = r.pick([3, 3, 1, 2, 4, 5, 6]), c = h * h + k, eq = 'y=' + lin([[1, 'x^{2}'], [2 * h, 'x'], [c, '']]);
          return interceptsPart(t(eq), null, [c], { text: 'intercepts of ' + eq, xNone: 'Check: ' + t(eq.slice(2)) + ' does not factor, and completing the square gives ' + t('y=(x' + sg(h) + ')^{2}+' + k) + '. Can that ever be ' + t('0') + '?',
            sol: t('y=0') + ': ' + t('x^{2}' + sg(2 * h) + 'x+' + c) + ' does not factor. Complete the square: ' + t('y=(x^{2}' + sg(2 * h) + 'x+' + h * h + ')+' + k + '=(x' + sg(h) + ')^{2}+' + k) + '. A square is never negative, so ' + t('y\\ge ' + k) + ' and ' + t('y') + ' is never ' + t('0') + ': <b>no ' + t('x') + '-intercept</b>.<br>' + t('x=0') + ': ' + t('y=' + c) + ', so the ' + t('y') + '-intercept is ' + t(ptT([0, c])) + '.',
            hints: ['Try to factor. If it won’t factor, rewrite the trinomial as a perfect square plus a number.', HXY[1]] });
        } },
        { id: 'e2e', level: 'PRG', make: function (r) {
          var o = r.chance(0.25) ? [4, -2] : pickWhere(function () { return [r.int(2, 7), -r.int(1, 5)]; }, function (z) { return z[0] !== -z[1]; }), p = o[0], q = o[1];
          var eq = 'y=' + lin([[-1, 'x^{2}'], [p + q, 'x'], [-p * q, '']]);
          return interceptsPart(t(eq), [p, q], [-p * q], { text: 'intercepts of ' + eq, xMiss: 'Take out ' + t('-1') + ' and factor the trinomial: each factor gives an ' + t('x') + '-intercept.',
            sol: t('y=0') + ': ' + t('0=-(' + lin([[1, 'x^{2}'], [-(p + q), 'x'], [p * q, '']]) + ')=-(x' + sg(-p) + ')(x' + sg(-q) + ')') + ', so ' + t('x=' + p) + ' or ' + t('x=' + q) + '.<br>' + t('x=0') + ': ' + t('y=' + (-p * q)) + '.<br>' + t('x') + '-intercepts ' + t(ptsT([[p, 0], [q, 0]])) + '; ' + t('y') + '-intercept ' + t(ptT([0, -p * q])) + '.' });
        } },
        { id: 'e2f', level: 'EMG', make: function (r) {
          var a = r.pick([3, 3, 2, 4, 5]), b = r.pick([4, 4].concat(pm(2, 6))), eq = 'y=' + lin([[a, 'x^{2}'], [-a * b, 'x']]);
          return interceptsPart(t(eq), [0, b], [0], { text: 'intercepts of ' + eq, xMiss: 'Factor: ' + t(a + 'x(x' + sg(-b) + ')=0') + '. Each factor that can be zero gives an ' + t('x') + '-intercept — including ' + t(a + 'x=0') + '.',
            sol: t('y=0') + ': ' + t('0=' + eq.slice(2) + '=' + a + 'x(x' + sg(-b) + ')') + ', so ' + t('x=0') + ' or ' + t('x=' + b) + '.<br>' + t('x=0') + ': ' + t('y=0') + '.<br>' + t('x') + '-intercepts ' + t(ptsT([[0, 0], [b, 0]])) + '; ' + t('y') + '-intercept ' + t('(0,\\ 0)') + '.' });
        } }] },
      { num: '3', stem: function (o) { return 'A line has equation ' + t(o.eq) + '.'; },
        shared: function (r) { var o = r.chance(0.3) ? [3, 5, 60] : pickWhere(function () { var A = r.int(2, 7), Bc = r.int(2, 7); return [A, Bc, lcm(A, Bc) * r.int(1, 3)]; }, function (z) { return z[0] !== z[1] && z[2] <= 70; }); return { A: o[0], B: o[1], C: o[2], xi: o[2] / o[0], yi: o[2] / o[1], eq: o[0] + 'x+' + o[1] + 'y=' + o[2] }; },
        parts: [
          { id: 'e3a', level: 'EMG', make: function (r, o) {
            return valuesPart('State the <b>value</b> of the ' + t('x') + '-intercept and the <b>value</b> of the ' + t('y') + '-intercept.', o.xi, o.yi, { text: 'values for ' + o.eq,
              sol: t('y=0') + ': ' + t(o.A + 'x=' + o.C) + ', ' + t('x=' + o.xi) + '. ' + t('x=0') + ': ' + t(o.B + 'y=' + o.C) + ', ' + t('y=' + o.yi) + '.' });
          } },
          { id: 'e3b', level: 'BEG', make: function (r, o) {
            return interceptsPart('State the same two intercepts <b>as ordered pairs</b>.', [o.xi], [o.yi], { text: 'points for ' + o.eq, sol: t('x') + '-intercept ' + t(ptT([o.xi, 0])) + ', ' + t('y') + '-intercept ' + t(ptT([0, o.yi])) + '. Each value gets its partner coordinate ' + t('0') + '.' });
          } },
          { id: 'e3c', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'Only your answers in (b), not those in (a), could be marked as dots on a grid. Why?', [
              { html: 'A dot needs <b>two</b> coordinates. The value ' + t(o.xi) + ' is one number — it fits every point with ' + t('x=' + o.xi) + '. The ordered pair ' + t(ptT([o.xi, 0])) + ' adds the ' + t('0') + ' that puts the point on the ' + t('x') + '-axis.', right: true },
              { html: 'The values in (a) are only estimates; the ordered pairs are exact.', why: 'Both are exact. The difference is how many coordinates they give.' },
              { html: 'Values are used for lines and ordered pairs for curves.', why: 'Lines and curves both have intercept values and intercept points. The difference is how many coordinates you give.' },
              { html: 'The values in (a) could be plotted too — they are the same thing as the points.', why: 'Try to plot “' + t(o.xi) + '”: is it ' + t('(' + o.xi + ',\\ 0)') + ', ' + t('(' + o.xi + ',\\ 5)') + ', …? One number doesn’t pick out a single point.' }],
              'A point on a grid needs two coordinates. A value such as ' + t(o.xi) + ' is a single number — it could belong to any point on the vertical line ' + t('x=' + o.xi) + '. The ordered pair ' + t(ptT([o.xi, 0])) + ' carries the extra information: its ' + t('y') + '-coordinate is ' + t('0') + ', which is what puts it on the ' + t('x') + '-axis.',
              ['How many numbers does it take to locate one point on a grid?'], 'value vs point');
          } }] },
      { num: '4', stem: 'Each statement below is careless. What is wrong with it?', parts: [
        { id: 'e4a', level: 'BEG', make: function (r) {
          var n = r.pick([5, 5, 2, 3, 4, 6, 7, 8, -3, -4]);
          return mcPart(r, '“The intercept is ' + t(n) + '.”', [
            { html: 'It doesn’t say <b>which</b> intercept (' + t('x') + ' or ' + t('y') + '). Better: “The value of the ' + t('x') + '-intercept is ' + t(n) + '.”', right: true },
            { html: t(n) + ' must always be written as a point, ' + t('(' + n + ',\\ 0)') + '.', why: 'A value is fine when the question asks for one. The real problem is that “the intercept” could be the ' + t('x') + '- or the ' + t('y') + '-intercept.' },
            { html: 'An intercept can never be ' + (n > 0 ? 'positive' : 'negative') + '.', why: 'Intercepts can be positive, negative or zero. What is missing is which axis is meant.' },
            { html: 'Nothing — it is complete.', why: 'Most graphs have an ' + t('x') + '-intercept <b>and</b> a ' + t('y') + '-intercept. Which one is ' + t(n) + '?' }],
            'It doesn’t say which intercept is meant (' + t('x') + ' or ' + t('y') + '). Rewrite: “The value of the ' + t('x') + '-intercept is ' + t(n) + '” or “The ' + t('x') + '-intercept point is ' + t('(' + n + ',\\ 0)') + '.”', ['Could a reader tell which axis the graph crosses at ' + t(n) + '?'], 'careless: the intercept is ' + n);
        } },
        { id: 'e4b', level: 'BEG', make: function (r) {
          var n = r.pick([3, 3, 2, 4, 5, 6, -2, -5]);
          return mcPart(r, '“The graph crosses at ' + t(n) + '.”', [
            { html: 'It names no axis, and ' + t(n) + ' alone could be a value or part of a point. Better: “The graph crosses the ' + t('x') + '-axis at ' + t('(' + n + ',\\ 0)') + '.”', right: true },
            { html: 'Graphs “meet” axes; they never “cross” them.', why: 'Graphs can cross or just touch an axis. The problem is that the statement doesn’t say which axis.' },
            { html: 'It should say “crosses at the point ' + t(n) + '.”', why: t(n) + ' is one number, not a point. And which axis is it on?' },
            { html: 'Nothing — every graph crosses at only one place.', why: 'A graph can cross the ' + t('x') + '-axis and the ' + t('y') + '-axis at different places. Which one is meant?' }],
            '“Crosses” names no axis, and ' + t(n) + ' alone is a value, not a point. Rewrite: “The graph crosses the ' + t('x') + '-axis at ' + t('(' + n + ',\\ 0)') + '” or “The value of the ' + t('x') + '-intercept is ' + t(n) + '.”', ['Which axis? And is ' + t(n) + ' a value or a point?'], 'careless: crosses at ' + n);
        } },
        { id: 'e4c', level: 'EMG', make: function (r) {
          var n = r.pick([7, 7, 2, 3, 4, 5, 6, 8, 9, -3, -5]);
          return mcPart(r, '“' + t('x') + '-intercept ' + t('=(0,\\ ' + n + ')') + '.”', [
            { html: 'The point ' + t('(0,\\ ' + n + ')') + ' has ' + t('x') + '-coordinate ' + t('0') + ', so it lies on the ' + t('y') + '-axis. It is the ' + t('y') + '-intercept, not the ' + t('x') + '-intercept.', right: true },
            { html: 'It should be written as the value ' + t(n) + ', not as a point.', why: 'Writing a point is fine. Check where ' + t('(0,\\ ' + n + ')') + ' is: its ' + t('x') + '-coordinate is ' + t('0') + '.' },
            { html: 'The coordinates are in the wrong order: it should be ' + t('(' + n + ',\\ 0)') + '.', why: 'Nothing says the ' + t('x') + '-intercept is ' + t(n) + '. ' + t('(0,\\ ' + n + ')') + ' is a correct point — it just isn’t on the ' + t('x') + '-axis.' },
            { html: 'Nothing — an ' + t('x') + '-intercept always has ' + t('x=0') + '.', why: 'At an ' + t('x') + '-intercept the <b>' + t('y') + '-coordinate</b> is ' + t('0') + '. Points with ' + t('x=0') + ' are on the ' + t('y') + '-axis.' }],
            'The form (a point) is fine, but ' + t('(0,\\ ' + n + ')') + ' has ' + t('x') + '-coordinate ' + t('0') + ', so it is on the ' + t('y') + '-axis. Rewrite: “' + t('y') + '-intercept ' + t('=(0,\\ ' + n + ')') + '” or “the value of the ' + t('y') + '-intercept is ' + t(n) + '.”', ['Which coordinate is ' + t('0') + ' for a point on the ' + t('x') + '-axis?'], 'careless: x-int = (0,' + n + ')');
        } }] },
      /* ---------- Part B: reading intercepts off a graph ---------- */
      { num: '5', section: 'Extra practice B — Reading intercepts off a graph', stem: 'State the ' + t('x') + '-intercept(s) and the ' + t('y') + '-intercept(s) of each graph <b>as ordered pairs</b>. If a graph has no intercept of one kind, press <b>none</b>.', parts: [
        { id: 'e5a', level: 'BEG', make: function (r) {
          var o = r.chance(0.3) ? [-1, 3] : pickWhere(function () { return [-r.int(1, 3), r.int(1, 4)]; }, function (z) { return z[1] - z[0] <= 5 && z[1] !== -z[0]; }), p = o[0], q = o[1];
          var f = function (x) { return (x - p) * (x - q); };
          var g = axisGraph({ y: [-7, 6], fns: [{ f: f, from: -6, to: 6, start: 'arrow', end: 'arrow' }] });
          return interceptsPart(g, [p, q], [p * q], { text: 'read intercepts of parabola ' + p + ',' + q, sol: 'The parabola crosses the ' + t('x') + '-axis at ' + t(p) + ' and ' + t(q) + ', and the ' + t('y') + '-axis at ' + t(p * q) + '.<br>' + t('x') + '-intercepts ' + t(ptsT([[p, 0], [q, 0]])) + '; ' + t('y') + '-intercept ' + t(ptT([0, p * q])) + '.',
            hints: ['Look where the curve meets the horizontal axis (' + t('y=0') + ') and the vertical axis (' + t('x=0') + ').', HXY[1]] });
        } },
        { id: 'e5b', level: 'BEG', make: function (r) {
          var k = r.pick([3, 3].concat(pm(1, 5)));
          var g = axisGraph({ segs: [{ pts: [[-5.8, k], [5.8, k]], start: 'arrow', end: 'arrow' }] });
          return interceptsPart(g, null, [k], { text: 'read intercepts of y=' + k, xNone: 'This line is horizontal at height ' + t(k) + ': it never reaches the ' + t('x') + '-axis, so there is no ' + t('x') + '-intercept.',
            sol: t('x') + '-intercept: <b>none</b> — the line is horizontal at height ' + t(k) + ', so it never reaches the ' + t('x') + '-axis.<br>' + t('y') + '-intercept ' + t(ptT([0, k])) + '.', hints: ['Does the line ever reach the ' + t('x') + '-axis?', HXY[1]] });
        } },
        { id: 'e5c', level: 'BEG', make: function (r) {
          var h = r.pick([-4, -4].concat(pm(1, 5)));
          var g = axisGraph({ segs: [{ pts: [[h, -5.8], [h, 5.8]], start: 'arrow', end: 'arrow' }] });
          return interceptsPart(g, [h], null, { text: 'read intercepts of x=' + h, yNone: 'This line is vertical at ' + t('x=' + h) + ': it never reaches the ' + t('y') + '-axis, so there is no ' + t('y') + '-intercept.',
            sol: t('x') + '-intercept ' + t(ptT([h, 0])) + '.<br>' + t('y') + '-intercept: <b>none</b> — the line is vertical at ' + t('x=' + h) + ', so it never reaches the ' + t('y') + '-axis.', hints: ['Does the line ever reach the ' + t('y') + '-axis?', HXY[1]] });
        } },
        { id: 'e5d', level: 'EMG', make: function (r) {
          var o = r.chance(0.3) ? [0.25, 2, 1] : r.pick([[0.25, 2, 1], [0.25, -2, 1], [0.25, 2, 2], [0.25, -2, 3], [0.5, 2, 1], [0.5, -2, 1], [1, 1, 1], [1, -1, 2], [0.25, 4, 1]]), a = o[0], h = o[1], k = o[2], yi = a * h * h + k;
          var g = axisGraph({ y: [-2, 7], fns: [{ f: function (x) { return a * (x - h) * (x - h) + k; }, from: -6, to: 6, start: 'arrow', end: 'arrow' }] });
          return interceptsPart(g, null, [yi], { text: 'read intercepts of parabola above axis', xNone: 'The lowest point of this parabola is ' + t(ptT([h, k])) + ', above the ' + t('x') + '-axis, and it opens upward — it never reaches the ' + t('x') + '-axis.',
            sol: t('x') + '-intercept: <b>none</b> — the parabola opens upward and its lowest point ' + t(ptT([h, k])) + ' is above the ' + t('x') + '-axis.<br>' + t('y') + '-intercept ' + t(ptT([0, yi])) + '.', hints: ['Does the curve ever reach the ' + t('x') + '-axis? Look at its lowest point.', HXY[1]] });
        } }] },
      { num: '6', stem: function (o) { return 'The line below is the graph of ' + t(o.eq) + '.' + HW.graph({ x: [-3, 7], y: [-3, 6], labels: 1, max: 300, segs: [{ pts: clipFn(function (x) { return o.q - o.q * x / o.p; }, -2.8, 6.8, -2.8, 5.8), start: 'arrow', end: 'arrow' }] }); },
        shared: function (r) { var pq = r.chance(0.3) ? [4, 3] : pickWhere(function () { return [r.int(2, 6), r.int(2, 5)]; }, function (z) { return z[0] !== z[1]; }), p = pq[0], q = pq[1], T = reduceT([q, p, -p * q]); return { p: p, q: q, T: T, eq: lin([[T[0], 'x'], [T[1], 'y']]) + '=' + (-T[2]) }; },
        parts: [
          { id: 'e6a', level: 'BEG', make: function (r, o) {
            return valuesPart('Read the <b>value</b> of the ' + t('x') + '-intercept and the <b>value</b> of the ' + t('y') + '-intercept off the graph.', o.p, o.q, { text: 'read values of ' + o.eq,
              sol: 'The line meets the ' + t('x') + '-axis at ' + t(o.p) + ' and the ' + t('y') + '-axis at ' + t(o.q) + '. Check: ' + t('y=0') + ' gives ' + t(lin([[o.T[0], 'x']]) + '=' + (-o.T[2])) + ', ' + t('x=' + o.p) + ' ✓; ' + t('x=0') + ' gives ' + t(lin([[o.T[1], 'y']]) + '=' + (-o.T[2])) + ', ' + t('y=' + o.q) + ' ✓.',
              hints: ['Find where the line meets each axis on the grid.', 'You can check with the equation: substitute ' + t('y=0') + ', then ' + t('x=0') + '.'] });
          } },
          { id: 'e6c', level: 'BEG', make: function (r, o) {
            return interceptsPart('State the two intercepts <b>as ordered pairs</b>.', [o.p], [o.q], { text: 'points of ' + o.eq, sol: t('x') + '-intercept ' + t(ptT([o.p, 0])) + ', ' + t('y') + '-intercept ' + t(ptT([0, o.q])) + '.' });
          } },
          { id: 'e6d', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'Asked for the <b>values</b> of the intercepts, a classmate answers “' + t(ptT([o.p, 0])) + ' and ' + t(ptT([0, o.q])) + '.” Their points are right. Why is it still not an answer to the question asked?', [
              { html: 'The question asked for <b>values</b> — single numbers, ' + t(o.p) + ' and ' + t(o.q) + ' — and the classmate gave points instead.', right: true },
              { html: 'The points should be written the other way round.', why: 'The points are correct as written. The issue is the <b>form</b>: the question asked for values.' },
              { html: 'Points can only be read off a graph, not a table.', why: 'That isn’t a rule. Look at what kind of answer the question asked for.' },
              { html: 'It is fine — values and points are the same thing.', why: 'A value is one number; a point is an ordered pair. On a test the wording decides which form gets the mark.' }],
              'Part (a) asked for <b>values</b>, which are single numbers: ' + t(o.p) + ' and ' + t(o.q) + '. The classmate gave points. The mathematics is right, but the form doesn’t answer the question asked.', ['Read the question again: “value” or “ordered pair”?'], 'points given for values');
          } }] },
      /* ---------- Part C: intercepts that don't exist ---------- */
      { num: '7', section: 'Extra practice C — When an intercept does not exist', stem: 'Determine the ' + t('x') + '-intercept(s) and the ' + t('y') + '-intercept(s) of each graph <b>as ordered pairs</b>. Press <b>none</b> where there is no such intercept.', parts: [
        { id: 'e7a', level: 'BEG', make: function (r) {
          var k = r.pick([7, 7].concat(pm(2, 9)));
          return interceptsPart(t('y=' + k), null, [k], { text: 'intercepts of y=' + k, xNone: t('y=' + k) + ' is a horizontal line ' + t(Math.abs(k)) + ' units ' + (k > 0 ? 'above' : 'below') + ' the ' + t('x') + '-axis: it never meets the ' + t('x') + '-axis.',
            sol: 'A horizontal line ' + t(Math.abs(k)) + ' units ' + (k > 0 ? 'above' : 'below') + ' the ' + t('x') + '-axis.<br>' + t('x') + '-intercept: <b>none</b>. ' + t('y') + '-intercept ' + t(ptT([0, k])) + '.' });
        } },
        { id: 'e7b', level: 'BEG', make: function (r) {
          var h = r.pick([-5, -5].concat(pm(2, 9)));
          return interceptsPart(t('x=' + h), [h], null, { text: 'intercepts of x=' + h, yNone: t('x=' + h) + ' is a vertical line: it never meets the ' + t('y') + '-axis.',
            sol: 'A vertical line ' + t(Math.abs(h)) + ' units ' + (h > 0 ? 'right' : 'left') + ' of the ' + t('y') + '-axis.<br>' + t('x') + '-intercept ' + t(ptT([h, 0])) + '. ' + t('y') + '-intercept: <b>none</b>.' });
        } },
        { id: 'e7c', level: 'EMG', make: function (r) {
          var o = r.chance(0.3) ? [2, 9] : pickWhere(function () { return [r.int(2, 5), r.pick(pm(1, 15))]; }, function (z) { return z[1] % z[0] !== 0; }), a = o[0], c = o[1], k = -c / a, eq = a + 'y' + sg(c) + '=0';
          return interceptsPart(t(eq), null, [k], { text: 'intercepts of ' + eq, xNone: 'Solve for ' + t('y') + ' first: ' + t('y=' + vt(k)) + ' is a horizontal line, so it never meets the ' + t('x') + '-axis.',
            sol: t(a + 'y=' + (-c)) + ', ' + t('y=' + vt(k)) + ': a horizontal line ' + t(nT(Math.abs(k))) + ' units ' + (k > 0 ? 'above' : 'below') + ' the ' + t('x') + '-axis.<br>' + t('x') + '-intercept: <b>none</b>. ' + t('y') + '-intercept ' + t(ptT([0, k])) + '.' });
        } },
        { id: 'e7d', level: 'EMG', make: function (r) {
          var a = r.pick([3, 3, 2, 4, 5, 6]), h = r.pick([4, 4].concat(pm(1, 6))), eq = a + 'x' + sg(-a * h) + '=0';
          return interceptsPart(t(eq), [h], null, { text: 'intercepts of ' + eq, yNone: 'Solve for ' + t('x') + ' first: ' + t('x=' + h) + ' is a vertical line, so it never meets the ' + t('y') + '-axis.',
            sol: t(a + 'x=' + a * h) + ', ' + t('x=' + h) + ': a vertical line.<br>' + t('x') + '-intercept ' + t(ptT([h, 0])) + '. ' + t('y') + '-intercept: <b>none</b>.' });
        } },
        { id: 'e7e', level: 'BEG', make: function (r) {
          var m = r.pick([4, 4].concat(pm(2, 7))), eq = 'y=' + lin([[m, 'x']]);
          return interceptsPart(t(eq), [0], [0], { text: 'intercepts of ' + eq, xSaidNone: 'Substitute ' + t('y=0') + ': ' + t('0=' + m + 'x') + ' has a solution.', ySaidNone: 'Substitute ' + t('x=0') + ': ' + t('y=' + m + '(0)') + ' has a value.',
            sol: 'A slanted line through the origin. ' + t('y=0') + ': ' + t('x=0') + '; ' + t('x=0') + ': ' + t('y=0') + '.<br>' + t('x') + '-intercept ' + t('(0,\\ 0)') + ' and ' + t('y') + '-intercept ' + t('(0,\\ 0)') + ' — the same point.' });
        } },
        { id: 'e7f', level: 'EMG', make: function (r) {
          var xAxis = r.chance(0.6), eq = xAxis ? 'y=0' : 'x=0', a = xAxis ? 'x' : 'y', b = xAxis ? 'y' : 'x';
          return mcPart(r, 'Which describes the intercepts of the graph of ' + t(eq) + '?', [
            { html: 'Every point of the line is an ' + t(a) + '-intercept (infinitely many — the line <b>is</b> the ' + t(a) + '-axis); the ' + t(b) + '-intercept point is ' + t('(0,\\ 0)') + '.', right: true },
            { html: 'No ' + t(a) + '-intercept; the ' + t(b) + '-intercept point is ' + t('(0,\\ 0)') + '.', why: t(eq) + ' doesn’t miss the ' + t(a) + '-axis — it lies right on it.' },
            { html: 'One ' + t(a) + '-intercept, ' + t('(0,\\ 0)') + ', and one ' + t(b) + '-intercept, ' + t('(0,\\ 0)') + '.', why: 'Every point of ' + t(eq) + ' is on the ' + t(a) + '-axis, so there are far more than one ' + t(a) + '-intercept.' },
            { html: 'No intercepts at all.', why: t(eq) + ' is one of the axes. It meets the other axis at the origin and lies along its own axis.' }],
            t(eq) + ' <b>is</b> the ' + t(a) + '-axis: every point on it is an ' + t(a) + '-intercept, so there is no single one (infinitely many). It crosses the ' + t(b) + '-axis at the origin, ' + t('(0,\\ 0)') + '.', ['What does the graph of ' + t(eq) + ' look like?'], 'intercepts of ' + eq);
        } }] },
      { num: '8', stem: 'Without graphing and without solving, decide whether each parabola has <b>two, one, or no</b> ' + t('x') + '-intercepts.', parts: [
        { id: 'e8', level: 'PRG', make: function (r) {
          var c = r.pick([5, 5, 1, 2, 3, 4, 6, 7, 8]), h = r.pick([4, 4].concat(pm(1, 6))), n = r.pick([3, 3, 2, 4, 5, 6]), hd = r.pick([1, 1, 2, 3, -1, -2]), kd = r.pick([2, 2, 1, 3, 4]);
          var rowsAll = [
            { id: 'pa', html: t('y=x^{2}+' + c), want: 'none', why: t('x^{2}\\ge 0') + ', so ' + t('x^{2}+' + c + '\\ge ' + c) + ': ' + t('y') + ' is never ' + t('0') + '.' },
            { id: 'pb', html: t('y=(x' + sg(-h) + ')^{2}'), want: 'one', why: t('(x' + sg(-h) + ')^{2}=0') + ' only when ' + t('x=' + h) + ': one ' + t('x') + '-intercept (the graph touches the axis).' },
            { id: 'pc', html: t('y=-x^{2}+' + n * n), want: 'two', why: t('y=0') + ' needs ' + t('x^{2}=' + n * n) + ', and ' + t(n * n) + ' has two square roots, ' + t('\\pm' + n) + '.' },
            { id: 'pd', html: t('y=-(x' + sg(hd) + ')^{2}-' + kd), want: 'none', why: t('-(x' + sg(hd) + ')^{2}\\le 0') + ', so ' + t('y\\le -' + kd) + ': ' + t('y') + ' is never ' + t('0') + '.' }];
          var rows = r.shuffle(rowsAll), want = {}, byId = {};
          rows.forEach(function (x) { want[x.id] = x.want; byId[x.id] = x; });
          var cols = [{ id: 'two', html: 'two' }, { id: 'one', html: 'one' }, { id: 'none', html: 'none' }];
          var p = B.grid('How many ' + t('x') + '-intercepts?', rows.map(function (x) { return { id: x.id, html: x.html }; }), cols, want, { why: function (id) { return { code: 'row', hint: byId[id].html + ': ' + byId[id].why }; }, colHead: 'x-intercepts' },
            rows.map(function (x) { return x.html + ': <b>' + x.want + '</b> — ' + x.why; }).join('<br>'),
            ['A square is never negative. For each equation, ask: can ' + t('y') + ' equal ' + t('0') + '? How many ways?'], 'two/one/none x-ints');
          p.tries = 2;
          return p;
        } },
        { id: 'e8e', level: 'PRG', make: function (r) {
          return mcPart(r, 'Every parabola of the form ' + t('y=ax^{2}+bx+c') + ' has a ' + t('y') + '-intercept, but some have no ' + t('x') + '-intercept. Why can a ' + t('y') + '-intercept never be missing?', [
            { html: 'Substituting ' + t('x=0') + ' always gives exactly one value, ' + t('y=a(0)^{2}+b(0)+c=c') + '. An ' + t('x') + '-intercept needs ' + t('ax^{2}+bx+c=0') + ' to be <b>solved</b>, and that equation can have two, one or no solutions.', right: true },
            { html: 'Because ' + t('c') + ' is never zero.', why: t('c') + ' can be zero (e.g. ' + t('y=x^{2}-4x') + '); then the ' + t('y') + '-intercept is ' + t('(0,\\ 0)') + ' — it still exists.' },
            { html: 'Because parabolas always open upward.', why: 'Parabolas can open downward too, and that doesn’t decide whether they reach the ' + t('y') + '-axis. Think about substituting ' + t('x=0') + '.' },
            { html: 'Because the ' + t('y') + '-axis is longer than the ' + t('x') + '-axis.', why: 'Both axes go on forever. Think about what substituting ' + t('x=0') + ' gives.' }],
            'A ' + t('y') + '-intercept comes from substituting ' + t('x=0') + ', and ' + t('y=a(0)^{2}+b(0)+c=c') + ' always gives exactly one value — nothing can fail. An ' + t('x') + '-intercept comes from <b>solving</b> ' + t('ax^{2}+bx+c=0') + ', which may have two solutions, one, or none.', ['Compare what you do to find each kind of intercept: substitute and evaluate, or substitute and solve?'], 'why y-int always exists');
        } }] },
      /* ---------- Part D: both intercepts mean something ---------- */
      { num: '9', section: 'Extra practice D — Both intercepts mean something', shared: function (r) {
          var o = r.chance(0.3) ? [2.5, 6] : pickWhere(function () { return [r.pick([1.5, 2, 2.5, 3, 4, 5]), r.int(2, 8)]; }, function (z) { var F0 = z[0] * 3 * z[1]; return Number.isInteger(F0) && F0 <= 90 && F0 >= 18; });
          var rate = o[0], s = o[1], T = 3 * s, F0 = rate * T, f = function (x) { return cl(F0 - rate * x); };
          var cand = range(1, T - 1).filter(function (x) { return x % s !== 0 && Number.isInteger(rate * x); });
          var td = F0 === 45 && rate === 2.5 && r.chance(0.5) ? 8 : r.pick(cand), te = F0 === 45 && rate === 2.5 && td === 8 ? 10 : r.pick(cand.filter(function (x) { return x !== td; }));
          return { rate: rate, s: s, T: T, F0: F0, f: f, td: td, te: te, Fr: f(te), eq: 'F=' + F0 + '-' + nT(rate) + 'h' };
        },
        stem: function (o) { return 'A portable generator starts a job with a full fuel tank and burns fuel at a steady rate. The fuel remaining, ' + t('F') + ' litres, after ' + t('h') + ' hours of running is ' + t(o.eq) + '.'; },
        parts: [
          { id: 'e9a', level: 'BEG', make: function (r, o) {
            var hs = [0, o.s, 2 * o.s, 3 * o.s];
            return tablePart('Complete the table of values.' + HW.valueTable([[t('h') + ' (h)'].concat(hs.map(function (x) { return t(x); })), [t('F') + ' (L)'].concat(hs.map(function () { return '?'; }))]), 'h', 'F', hs, o.f,
              function (x, v) { return x && same(v, o.rate * x) ? { code: 'ctx-used', hint: t(nT(o.rate * x)) + ' L is the fuel burned. Subtract it from ' + t(o.F0) + '.' } : null; },
              hs.map(function (x) { return t('F=' + o.F0 + '-' + nT(o.rate) + '(' + x + ')=' + nT(o.f(x))); }).join(', ') + '.', ['Substitute each value of ' + t('h') + '.'], 'generator table', 'L');
          } },
          { id: 'e9b', level: 'BEG', make: function (r, o) {
            return numPart('Determine the ' + t('F') + '-intercept algebraically.', o.F0, [[o.T, 'int-gave-x', 'That is the ' + t('h') + '-intercept (where ' + t('F=0') + '). For the ' + t('F') + '-intercept set ' + t('h=0') + '.'], [o.rate, 'ctx-rate', t(nT(o.rate)) + ' is the rate. Set ' + t('h=0') + '.']],
              'Set ' + t('h=0') + ': ' + t('F=' + o.F0 + '-' + nT(o.rate) + '(0)=' + o.F0) + '. The ' + t('F') + '-intercept is ' + t(o.F0) + ' (point ' + t('(0,\\ ' + o.F0 + ')') + '): the full tank holds ' + t(o.F0) + ' L when the generator starts.', ['The ' + t('F') + '-intercept is on the ' + t('F') + '-axis, where ' + t('h=0') + '.'], 'F-intercept', { after: 'L' });
          } },
          { id: 'e9c', level: 'EMG', make: function (r, o) {
            return numPart('Determine the ' + t('h') + '-intercept algebraically.', o.T, [[o.F0, 'int-gave-y', 'That is the ' + t('F') + '-intercept. For the ' + t('h') + '-intercept set ' + t('F=0') + '.'], [-o.T, 'int-sign', 'Check the sign.'], [o.F0 * o.rate, 'ctx-mult', 'Divide by ' + t(nT(o.rate)) + ', don’t multiply.']],
              'Set ' + t('F=0') + ': ' + t('0=' + o.F0 + '-' + nT(o.rate) + 'h') + ', ' + t(nT(o.rate) + 'h=' + o.F0) + ', ' + t('h=' + o.T) + '.', ['The ' + t('h') + '-intercept is on the ' + t('h') + '-axis, where ' + t('F=0') + '.'], 'h-intercept', { after: 'h' });
          } },
          { id: 'e9d', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'What does the ' + t('h') + '-intercept, ' + t(o.T) + ', represent?', [
              { html: 'The generator runs out of fuel after ' + t(o.T) + ' hours of running.', right: true },
              { html: 'The tank holds ' + t(o.T) + ' L when full.', why: 'The full tank is the ' + t('F') + '-intercept, ' + t(o.F0) + ' L. At the ' + t('h') + '-intercept, ' + t('F=0') + '.' },
              { html: 'The generator burns ' + t(o.T) + ' L every hour.', why: 'The burning rate is ' + t(nT(o.rate)) + ' L per hour. The ' + t('h') + '-intercept is a time.' },
              { html: 'The generator has run for ' + t(o.T) + ' hours and the tank is full.', why: 'At the ' + t('h') + '-intercept the fuel left is ' + t('0') + ', not a full tank.' }],
              'At the ' + t('h') + '-intercept, ' + t('(' + o.T + ',\\ 0)') + ', the fuel left is ' + t('0') + ': the generator runs out of fuel after ' + t(o.T) + ' hours.', ['At an ' + t('h') + '-intercept, what is ' + t('F') + '?'], 'meaning of h-intercept');
          } },
          { id: 'e9e', level: 'BEG', make: function (r, o) {
            var x = o.td;
            return numPart('How much fuel is left after ' + t(x) + ' hours?', o.f(x), [[o.rate * x, 'ctx-used', t(nT(o.rate * x)) + ' L is the fuel burned. How much is <b>left</b>?']],
              t('F=' + o.F0 + '-' + nT(o.rate) + '(' + x + ')=' + o.F0 + '-' + nT(o.rate * x) + '=' + nT(o.f(x))) + ' L.', ['Substitute ' + t('h=' + x) + '.'], 'fuel after ' + x + ' h', { after: 'L' });
          } },
          { id: 'e9f', level: 'EMG', make: function (r, o) {
            var Fr = o.Fr, x = o.te;
            return numPart('After how many hours is ' + t(nT(Fr)) + ' L left?', x, [[Fr / o.rate, 'ctx-no-sub', 'That is how long ' + t(nT(Fr)) + ' L takes to burn. Substitute ' + t('F=' + nT(Fr)) + ' and solve for ' + t('h') + '.'], [o.f(Fr), 'ctx-eval', 'You substituted ' + t(nT(Fr)) + ' for ' + t('h') + '. Here it is the fuel, ' + t('F') + '.']],
              t(nT(Fr) + '=' + o.F0 + '-' + nT(o.rate) + 'h') + ', ' + t(nT(o.rate) + 'h=' + nT(o.F0 - Fr)) + ', ' + t('h=' + x) + ' hours.', ['Substitute ' + t('F=' + nT(Fr)) + ' and solve for ' + t('h') + '.'], 'hours until ' + Fr + ' L', { after: 'h' });
          } },
          { id: 'e9g', level: 'PRG', make: function (r, o) {
            return mcPart(r, 'Both intercepts matter here, but for the moving company (' + t('C=150+0.25n') + ', Question 4 of the assignment) the ' + t('n') + '-intercept did not. What is different?', [
              { html: 'Here the fuel really reaches ' + t('0') + ' at a positive time (the tank empties). The moving cost never reaches ' + t('\\$0') + ' for a real distance — its ' + t('n') + '-intercept was a negative distance.', right: true },
              { html: 'This graph decreases and the moving graph increases; only decreasing graphs have intercepts.', why: 'Increasing lines have intercepts too — the moving line’s ' + t('n') + '-intercept was ' + t('-600') + '. The question is whether the value makes sense.' },
              { html: 'The fuel model has no starting value.', why: 'It does: the full tank, ' + t(o.F0) + ' L, is its ' + t('F') + '-intercept. Think about whether each intercept is a value the situation can actually reach.' },
              { html: 'Time can be negative but distance cannot.', why: 'Neither can be negative here. The fuel model’s ' + t('h') + '-intercept is a <b>positive</b> time, ' + t(o.T) + ' h, so it makes sense.' }],
              'The generator’s ' + t('h') + '-intercept, ' + t(o.T) + ' h, is a real event: the tank empties. In the moving-cost model the cost never falls to ' + t('0') + ' (there is a flat fee), and its ' + t('n') + '-intercept was a negative distance, which can’t happen.', ['Is each intercept a value the situation can actually reach?'], 'compare intercept meanings');
          } }] },
      { num: '10', shared: function (r) {
          var o = r.chance(0.3) ? [2, 2, 10] : pickWhere(function () { var r1 = r.int(1, 4); return [r.pick([1, 2, 3]), r1, r1 + 2 * r.int(2, 4)]; }, function (z) { return z[2] <= 11 && z[0] * z[1] * z[2] <= 99; });
          var a = o[0], r1 = o[1], r2 = o[2], v = (r1 + r2) / 2, M = r2 + 2, b = a * (r1 + r2), c = -a * r1 * r2, Pmax = a * (v - r1) * (r2 - v);
          return { a: a, r1: r1, r2: r2, v: v, M: M, b: b, c: c, Pmax: Pmax, poly: lin([[-a, 'x^{2}'], [b, 'x'], [c, '']]) };
        },
        stem: function (o) { return 'A small workshop’s profit, ' + t('P') + ' hundred dollars, on a production run of ' + t('x') + ' hundred items is modelled by ' + t('P=' + o.poly) + ', for ' + t('0\\le x\\le ' + o.M) + '.'; },
        parts: [
          { id: 'e10a', level: 'EMG', make: function (r, o) {
            var c = o.c, box1 = ptsCheck([[0, c]], 'y', { names: { x: 'x', y: 'P' } });
            var box2 = K.number(c * 100, function (v) { if (same(v, c)) return { code: 'ctx-hundreds', hint: t('P') + ' is in <b>hundreds</b> of dollars: multiply by ' + t('100') + '.' }; if (same(v, -c * 100)) return { code: 'ctx-loss-sign', hint: 'The profit is negative: it is a loss, so the answer is negative.' }; return null; });
            var p = B.fields('Determine the ' + t('P') + '-intercept algebraically, as an ordered pair. Then give the profit in dollars when nothing is produced.', [{ name: t('P') + '-intercept point', label: t('P') + '-intercept point', mode: 'math', keys: 'pairs', wide: true, placeholder: 'e.g. (0, 3)' }, { name: 'Profit in dollars', label: 'Profit', before: '$' }],
              [box1, box2], [ptKey([0, c]), String(c * 100)], t('P') + '-intercept point ' + t(ptT([0, c])) + '; profit ' + t(F(c * 100)) + ' dollars (a loss of $' + F(-c * 100, true) + ')',
              'Set ' + t('x=0') + ': ' + t('P=-' + o.a + '(0)^{2}+' + o.b + '(0)' + sg(c) + '=' + c) + '. ' + t('P') + '-intercept ' + t(ptT([0, c])) + ': with nothing produced the workshop is ' + t(-c) + ' hundred dollars down — a profit of ' + t(F(c * 100)) + ' dollars, i.e. a loss of $' + F(-c * 100, true) + ' (its fixed costs).',
              ['The ' + t('P') + '-intercept is where ' + t('x=0') + '.', t('P') + ' is measured in hundreds of dollars.'], 'profit P-intercept');
            p.bad = [[ptKey([c, 0]), String(c * 100)], [ptKey([0, c]), String(c)]];
            return p;
          } },
          { id: 'e10b', level: 'PRG', make: function (r, o) {
            return interceptsPart('Factor ' + t(o.poly) + ', then use it to find both ' + t('x') + '-intercepts. <b>Answer as ordered pairs.</b>', [o.r1, o.r2], null, { only: 'x', names: { x: 'x', y: 'P' }, text: 'profit x-intercepts',
              xMiss: 'The factored form has two brackets; each one gives an ' + t('x') + '-intercept.',
              sol: t(o.poly + '=-' + o.a + '(x^{2}-' + (o.r1 + o.r2) + 'x+' + o.r1 * o.r2 + ')=-' + o.a + '(x-' + o.r1 + ')(x-' + o.r2 + ')').replace('-1(', '-(') + '. Set ' + t('P=0') + ': ' + t('x=' + o.r1) + ' or ' + t('x=' + o.r2) + '.<br>' + t('x') + '-intercepts ' + t(ptsT([[o.r1, 0], [o.r2, 0]])) + '.',
              hints: ['Take out the common factor ' + t('-' + o.a) + ' first, then factor the trinomial.', 'Set each factor equal to zero.'] });
          } },
          { id: 'e10c', level: 'EMG', make: function (r, o) {
            var chk = function (want) { return K.number(want * 100, function (v) { return same(v, want) ? { code: 'ctx-hundreds', hint: t('x') + ' counts <b>hundreds</b> of items: multiply by ' + t('100') + '.' } : null; }); };
            var p = B.fields('Each ' + t('x') + '-intercept is a <b>break-even</b> point (no profit, no loss). How many <b>items</b> does each one represent?', [{ name: 'Smaller run', label: 'Smaller run', after: 'items' }, { name: 'Larger run', label: 'Larger run', after: 'items' }],
              [chk(o.r1), chk(o.r2)], [String(o.r1 * 100), String(o.r2 * 100)], 'Break even at ' + t(F(o.r1 * 100)) + ' items and at ' + t(F(o.r2 * 100)) + ' items.',
              'At ' + t('P=0') + ' there is no profit and no loss. ' + t('x=' + o.r1) + ' means ' + t(F(o.r1 * 100)) + ' items; ' + t('x=' + o.r2) + ' means ' + t(F(o.r2 * 100)) + ' items.', [t('x') + ' is measured in hundreds of items.'], 'break-even items');
            p.bad = [[String(o.r1), String(o.r2)]];
            return p;
          } },
          { id: 'e10d', level: 'EMG', make: function (r, o) {
            var v = o.v;
            return numPart('The maximum profit occurs at ' + t('x=' + v) + '. Calculate it, in dollars.', o.Pmax * 100, [[o.Pmax, 'ctx-hundreds', t('P') + ' is in <b>hundreds</b> of dollars: multiply by ' + t('100') + '.'], [(o.Pmax + 2 * o.a * v * v) * 100, 'ctx-sign-sq', 'The ' + t('x^{2}') + '-term is negative: ' + t('-' + o.a + '(' + v + ')^{2}=' + (-o.a * v * v)) + '.']],
              t('P=-' + o.a + '(' + v + ')^{2}+' + o.b + '(' + v + ')' + sg(o.c) + '=' + (-o.a * v * v) + '+' + o.b * v + sg(o.c) + '=' + o.Pmax) + ' hundred dollars ' + t('=\\$' + F(o.Pmax * 100)) + '.', ['Substitute ' + t('x=' + v) + ', then multiply by ' + t('100') + ' to get dollars.'], 'max profit', { before: '$' });
          } },
          { id: 'e10e', level: 'PRG', make: function (r, o) {
            var lo = F(o.r1 * 100, true), hi = F(o.r2 * 100, true), mx = F(o.M * 100, true);
            return mcPart(r, 'For which production runs is the workshop losing money?', [
              { html: 'Runs of fewer than ' + lo + ' items or more than ' + hi + ' items (up to the model’s limit of ' + mx + ').', right: true },
              { html: 'Runs between ' + lo + ' and ' + hi + ' items.', why: 'Between the break-even points the parabola is <b>above</b> the ' + t('x') + '-axis: the profit is positive there.' },
              { html: 'Only a run of ' + t('0') + ' items.', why: 'At ' + t('x=0') + ' the workshop loses money, but so does every run up to the first break-even point. Where is ' + t('P<0') + '?' },
              { html: 'Runs of more than ' + F(o.v * 100, true) + ' items, after the maximum.', why: 'After the maximum the profit decreases but stays positive until the second break-even point. Where is ' + t('P<0') + '?' }],
              'The workshop loses money where ' + t('P<0') + ': the parabola opens downward, so it is below the ' + t('x') + '-axis outside the two ' + t('x') + '-intercepts — ' + t('0\\le x<' + o.r1) + ' or ' + t(o.r2 + '<x\\le ' + o.M) + ', i.e. fewer than ' + lo + ' items or more than ' + hi + ' items.', ['Where is the graph below the ' + t('x') + '-axis? The parabola opens downward.'], 'losing money');
          } }] },
      /* ---------- Part E: error analysis ---------- */
      { num: '11', section: 'Extra practice E — Error analysis', shared: function (r) {
          var o = r.chance(0.3) ? [2, 5, 20] : pickWhere(function () { var A = r.int(2, 7), Bc = r.int(2, 7); return [A, Bc, lcm(A, Bc) * r.int(1, 2)]; }, function (z) { return z[0] !== z[1] && z[2] <= 60; });
          return { A: o[0], B: o[1], C: o[2], xi: o[2] / o[0], yi: -o[2] / o[1], eq: o[0] + 'x-' + o[1] + 'y=' + o[2] };
        },
        stem: function (o) { return 'Asked to determine the <b>value</b> of the ' + t('x') + '-intercept of ' + t(o.eq) + ', a student writes: ' + t(o.A + '(0)-' + o.B + 'y=' + o.C + '\\ \\Rightarrow\\ -' + o.B + 'y=' + o.C + '\\ \\Rightarrow\\ y=' + o.yi) + ', so the ' + t('x') + '-intercept is ' + t(o.yi) + '.'; },
        parts: [
          { id: 'e11a', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'Every line of their algebra is correct. Which substitution should they have made, and why?', [
              { html: t('y=0') + ', because every point on the ' + t('x') + '-axis has ' + t('y') + '-coordinate ' + t('0') + '.', right: true },
              { html: t('x=0') + ', because it is the ' + t('x') + '-intercept.', why: 'That is what the student did. At an ' + t('x') + '-intercept the point is on the ' + t('x') + '-axis — which coordinate is ' + t('0') + ' there?' },
              { html: 'Both ' + t('x=0') + ' and ' + t('y=0') + ' at once.', why: 'That only checks whether the line passes through the origin. For the ' + t('x') + '-intercept, only one coordinate is ' + t('0') + '.' },
              { html: t('y=' + o.C) + ', the number on the right side.', why: 'Points on the ' + t('x') + '-axis have ' + t('y') + '-coordinate ' + t('0') + ', whatever the equation looks like.' }],
              'They substituted ' + t('x=0') + ', which gives the ' + t('y') + '-intercept. The ' + t('x') + '-intercept is on the ' + t('x') + '-axis, where every point has ' + t('y') + '-coordinate ' + t('0') + ', so they should have substituted ' + t('y=0') + '. Memory rule: <i>at an ' + t('x') + '-intercept the ' + t('y') + '-coordinate is zero</i>.', ['Where on the grid is an ' + t('x') + '-intercept? Which coordinate is ' + t('0') + ' there?'], 'which substitution');
          } },
          { id: 'e11b', level: 'BEG', make: function (r, o) {
            return mcPart(r, 'The number ' + t(o.yi) + ' is not junk — it is a real feature of this line. Which one?', [
              { html: 'The value of the ' + t('y') + '-intercept.', right: true },
              { html: 'The slope of the line.', why: 'The student substituted ' + t('x=0') + ', which finds where the line meets the ' + t('y') + '-axis.' },
              { html: 'The value of the ' + t('x') + '-intercept.', why: 'Substituting ' + t('x=0') + ' finds a point with ' + t('x=0') + ' — on the ' + t('y') + '-axis.' },
              { html: 'The ' + t('y') + '-coordinate of the ' + t('x') + '-intercept.', why: 'The ' + t('y') + '-coordinate of an ' + t('x') + '-intercept is always ' + t('0') + '.' }],
              'With ' + t('x=0') + ' the student found the point ' + t(ptT([0, o.yi])) + ': ' + t(o.yi) + ' is the <b>value of the ' + t('y') + '-intercept</b> — the right calculation with the wrong label.', ['Substituting ' + t('x=0') + ' finds a point on which axis?'], 'what the wrong answer is');
          } },
          { id: 'e11c', level: 'BEG', make: function (r, o) {
            return numPart('Determine the correct <b>value</b> of the ' + t('x') + '-intercept.', o.xi, [[o.yi, 'int-gave-y', 'That is the student’s answer — the ' + t('y') + '-intercept. Substitute ' + t('y=0') + ' instead.'], [-o.xi, 'int-sign', 'Check the sign.']],
              t('y=0') + ': ' + t(o.A + 'x-' + o.B + '(0)=' + o.C) + ', ' + t(o.A + 'x=' + o.C) + ', ' + t('x=' + o.xi) + '. Check: ' + t(o.A + '(' + o.xi + ')-' + o.B + '(0)=' + o.C) + ' ✓.', HX, 'correct x-int of ' + o.eq);
          } }] },
      { num: '12', shared: function (r) { var o = r.chance(0.3) ? [3, 4] : [r.pick([2, 3, 4, 5, 6]), r.pick([2, 3, 4, 5, 6])]; return { m: o[0], k: o[1], c: o[0] * o[1], eq: 'y=' + o[0] + 'x-' + o[0] * o[1] }; },
        stem: function (o) { return 'Two students answer questions about the line ' + t(o.eq) + '.'; },
        parts: [
          { id: 'e12a', level: 'BEG', make: function (r, o) {
            var p = interceptsPart('Asked to “state the ' + t('x') + '-intercept <b>as an ordered pair</b>,” Dana writes ' + t(o.k) + '. The number is right, but the answer isn’t. Write what Dana should have given.', [o.k], [-o.c], { only: 'x', text: 'Dana: x-int as a point',
              sol: t('y=0') + ': ' + t('0=' + o.m + 'x-' + o.c) + ', ' + t('x=' + o.k) + '. The number is right, but an ordered pair was asked for: ' + t(ptT([o.k, 0])) + '.' });
            return p;
          } },
          { id: 'e12b', level: 'BEG', make: function (r, o) {
            return numPart('Asked to “determine the <b>value</b> of the ' + t('y') + '-intercept,” Emeka writes ' + t('(0,\\ ' + (-o.c) + ')') + '. The point is right, but the answer isn’t. Write what Emeka should have given.', -o.c, [[o.c, 'int-sign', 'Check the sign.'], [o.k, 'int-gave-x', 'That is the value of the ' + t('x') + '-intercept.']],
              t('x=0') + ': ' + t('y=' + o.m + '(0)-' + o.c + '=' + (-o.c)) + '. The point is right, but a value was asked for: ' + t(-o.c) + '.', HY, 'Emeka: y-int value');
          } },
          { id: 'e12c', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'Dana and Emeka made opposite mistakes. Which statement describes them, and what decides the correct form on a test?', [
              { html: 'Dana gave a <b>value</b> where a <b>point</b> was asked for; Emeka gave a <b>point</b> where a <b>value</b> was asked for. The wording of the question decides the form — the graph is the same either way.', right: true },
              { html: 'Dana gave a point where a value was asked for; Emeka gave a value where a point was asked for. The graph decides the form.', why: 'Swap them: Dana wrote the number ' + t(o.k) + ' (a value); Emeka wrote ' + t('(0,\\ ' + (-o.c) + ')') + ' (a point). And the graph can’t decide — it is the same graph.' },
              { html: 'Both mixed up the ' + t('x') + '- and ' + t('y') + '-intercepts.', why: 'Both found the right intercept. Their mistakes are about the <b>form</b> of the answer.' },
              { html: 'Both are fine: values and points mean the same thing.', why: 'A value is one number; a point is an ordered pair. On a test, giving the wrong form loses the mark.' }],
              'Dana gave a value where a point was asked for; Emeka gave a point where a value was asked for. The graph is the same either way, so only the instruction word (“value” or “ordered pair”) fixes the form — read it before starting the algebra.', ['What did each student write: one number, or an ordered pair? What did each question ask for?'], 'opposite mistakes');
          } }] },
      /* ---------- Part F: working backwards ---------- */
      { num: '13', section: 'Extra practice F — Working backwards from the intercepts', stem: 'Determine the equation of the line with the given intercepts. Give it in the form ' + t('y=mx+b') + ' <b>and</b> in the form ' + t('Ax+By+C=0') + ' with integer coefficients.', parts: [
        { id: 'e13a', level: 'ADV', make: function (r) { var ab = r.chance(0.3) ? [6, -4] : fracSlope(r, 1, -1); return backPart(ab[0], ab[1], false); } },
        { id: 'e13b', level: 'ADV', make: function (r) { var ab = r.chance(0.3) ? [-3, 5] : fracSlope(r, -1, 1); return backPart(ab[0], ab[1], false); } },
        { id: 'e13c', level: 'ADV', make: function (r) { var ab = r.chance(0.3) ? [-2, -7] : fracSlope(r, -1, -1); return backPart(ab[0], ab[1], true); } }] },
      { num: '14', stem: 'A line has ' + t('x') + '-intercept ' + t('a') + ' and ' + t('y') + '-intercept ' + t('b') + ', where ' + t('a\\ne 0') + ' and ' + t('b\\ne 0') + '. Its equation can be written ' + t('\\dfrac{x}{a}+\\dfrac{y}{b}=1') + ' (the intercept form).', parts: [
        { id: 'e14a', level: 'BEG', make: function (r) {
          return mcPart(r, 'Substitute ' + t('y=0') + ' into ' + t('\\dfrac{x}{a}+\\dfrac{y}{b}=1') + '. What do you get?', [
            { html: t('\\dfrac{x}{a}=1') + ', so ' + t('x=a') + ': the ' + t('x') + '-intercept really is ' + t('a') + '.', right: true },
            { html: t('\\dfrac{x}{a}=0') + ', so ' + t('x=0') + '.', why: 'Only the ' + t('y') + '-term becomes ' + t('0') + '; the right side is still ' + t('1') + '.' },
            { html: t('x=1') + '.', why: t('\\dfrac{x}{a}=1') + ' means ' + t('x') + ' divided by ' + t('a') + ' is ' + t('1') + '. Multiply both sides by ' + t('a') + '.' },
            { html: t('x=b') + '.', why: 'The ' + t('y') + '-term (with ' + t('b') + ') disappears when ' + t('y=0') + '.' }],
            t('y=0') + ': ' + t('\\dfrac{x}{a}+\\dfrac{0}{b}=1') + ', so ' + t('\\dfrac{x}{a}=1') + ' and ' + t('x=a') + ' ✓. Likewise ' + t('x=0') + ' gives ' + t('\\dfrac{y}{b}=1') + ', ' + t('y=b') + ' ✓.', ['After ' + t('\\frac{0}{b}=0') + ', what is left?'], 'intercept form check');
        } },
        { id: 'e14b', level: 'PRG', make: function (r) {
          var pq = r.chance(0.3) ? [5, -2] : pickWhere(function () { return [r.pick(pm(2, 9)), r.pick(pm(2, 9))]; }, function (z) { return Math.abs(z[0]) !== Math.abs(z[1]); }), p = pq[0], q = pq[1], T = reduceT([q, p, -p * q]);
          var fr = '\\dfrac{x}{' + p + '}+\\dfrac{y}{' + q + '}=1', L = Math.abs(p * q) / gcd(p, q);
          var p0 = B.fields('Use the intercept form to write, in one step, the equation of the line with ' + t('x') + '-intercept ' + t(p) + ' and ' + t('y') + '-intercept ' + t(q) + '. Clear the fractions and write it as ' + t('Ax+By+C=0') + '.',
            [{ name: 'Equation', mode: 'math', keys: 'poly', vars: ['x', 'y'], after: t('=0'), wide: true, placeholder: 'e.g. 3x - 4y + 4' }], [stdChk(T, { wrong: [{ is: reduceT([p, q, -p * q]), code: 'eq-slope-flip', hint: 'The ' + t('x') + '-intercept goes under ' + t('x') + ' and the ' + t('y') + '-intercept under ' + t('y') + ': ' + t('\\frac{x}{' + p + '}+\\frac{y}{' + q + '}=1') + '.' }] })], [stdTex(T)],
            t(stdTex(T) + '=0'), t(fr) + '. Multiply every term by ' + t(L) + ': ' + t(lin([[L / p, 'x'], [L / q, 'y']]) + '=' + L) + ', so ' + t(stdTex(T) + '=0') + '. Check: ' + t('y=0') + ' gives ' + t('x=' + p) + ' ✓; ' + t('x=0') + ' gives ' + t('y=' + q) + ' ✓.',
            ['Put ' + t('a=' + p) + ' and ' + t('b=' + q) + ' into ' + t('\\frac{x}{a}+\\frac{y}{b}=1') + '.', 'Multiply every term by a common denominator, then move everything to the left side.'], 'intercept form ' + p + ', ' + q);
          p0.bad = [[stdTex(reduceT([p, q, -p * q]))]];
          return p0;
        } },
        { id: 'e14c', level: 'PRG', make: function (r) {
          return mcPart(r, 'Why does the intercept form fail when ' + t('a=0') + '?', [
            { html: t('\\dfrac{x}{0}') + ' is undefined. An ' + t('x') + '-intercept of ' + t('0') + ' means the line passes through the origin (like ' + t('y=2x') + '), so its ' + t('y') + '-intercept is ' + t('0') + ' too — no line through the origin can be written this way.', right: true },
            { html: 'Because then the line has no ' + t('x') + '-intercept.', why: 'An ' + t('x') + '-intercept of ' + t('0') + ' exists: it is the origin. The trouble is dividing by ' + t('a=0') + '.' },
            { html: 'Because ' + t('\\dfrac{x}{0}=0') + ', so the ' + t('x') + '-term disappears.', why: 'Division by ' + t('0') + ' is undefined — it isn’t ' + t('0') + '.' },
            { html: 'It doesn’t fail: ' + t('\\dfrac{x}{0}+\\dfrac{y}{b}=1') + ' is a vertical line.', why: t('\\dfrac{x}{0}') + ' has no meaning, so this isn’t an equation at all.' }],
            'With ' + t('a=0') + ' the term ' + t('\\dfrac{x}{0}') + ' is undefined (division by zero). An ' + t('x') + '-intercept of ' + t('0') + ' means the line passes through the origin, e.g. ' + t('y=2x') + '; then its ' + t('y') + '-intercept is ' + t('0') + ' too, so no line through the origin fits this form.', ['What is ' + t('\\frac{x}{0}') + '? Which lines have an ' + t('x') + '-intercept of ' + t('0') + '?'], 'intercept form fails');
        } }] },
      { num: '15', shared: function (r) {
          var o = r.chance(0.3) ? [2, -2, 5] : pickWhere(function () { return [r.pick([2, -2, 3, -1, -3, 1]), -r.int(1, 5), r.int(2, 7)]; }, function (z) { return z[1] !== -z[2] && Math.abs(z[0] * z[1] * z[2]) <= 60; });
          return { a: o[0], r1: o[1], r2: o[2], c: o[0] * o[1] * o[2] };
        },
        stem: function (o) { return 'A parabola has ' + t('x') + '-intercepts ' + t(ptT([o.r1, 0])) + ' and ' + t(ptT([o.r2, 0])) + ' and ' + t('y') + '-intercept ' + t(ptT([0, o.c])) + '.'; },
        parts: [
          { id: 'e15a', level: 'EMG', make: function (r, o) {
            var f = 'y=a(x' + sg(-o.r1) + ')(x' + sg(-o.r2) + ')';
            return mcPart(r, 'Why must ' + t(f) + ' have these two ' + t('x') + '-intercepts, whatever the value of ' + t('a') + '?', [
              { html: 'At ' + t('x=' + o.r1) + ' the factor ' + t('(x' + sg(-o.r1) + ')') + ' is ' + t('0') + ', and at ' + t('x=' + o.r2) + ' the factor ' + t('(x' + sg(-o.r2) + ')') + ' is ' + t('0') + '. A zero factor makes the whole product ' + t('0') + ', so ' + t('y=0') + ' at both.', right: true },
              { html: 'Because ' + t('a') + ' is always ' + t('1') + '.', why: t('a') + ' can be any non-zero number; the intercepts come from the brackets.' },
              { html: 'Because the numbers in the brackets are the intercepts, with the same signs.', why: 'Check the signs: ' + t('(x' + sg(-o.r1) + ')=0') + ' when ' + t('x=' + o.r1) + '. The intercept is the value of ' + t('x') + ' that makes the bracket zero.' },
              { html: 'Because ' + t('a') + ' multiplies only the ' + t('y') + '-intercept.', why: 'It multiplies everything — but ' + t('a\\times 0=0') + ', so it can’t change where ' + t('y=0') + '.' }],
              'At ' + t('x=' + o.r1) + ': ' + t('(x' + sg(-o.r1) + ')=0') + '; at ' + t('x=' + o.r2) + ': ' + t('(x' + sg(-o.r2) + ')=0') + '. A zero factor makes the product ' + t('0') + ' (' + t('a\\times 0=0') + '), so ' + t('y=0') + ' at both, whatever ' + t('a') + ' is.', ['What is ' + t('(x' + sg(-o.r1) + ')') + ' when ' + t('x=' + o.r1) + '?'], 'why factored form works');
          } },
          { id: 'e15b', level: 'ADV', make: function (r, o) {
            var mk = function (k) { return P.mul(P.num(k), P.parse('x' + sg(-o.r1)), P.parse('x' + sg(-o.r2))); };
            var T = mk(o.a), base = mk(1);
            var aChk = K.number(o.a, function (v) { if (same(v, -o.a)) return { code: 'int-sign', hint: 'Check the sign: ' + t(o.c + '=a(0' + sg(-o.r1) + ')(0' + sg(-o.r2) + ')=' + (o.r1 * o.r2) + 'a') + '.' }; if (same(v, o.c)) return { code: 'ctx-no-sub', hint: 'Substitute the ' + t('y') + '-intercept point: ' + t('x=0') + ', ' + t('y=' + o.c) + ', then solve for ' + t('a') + '.' }; return null; });
            var pChk = K.poly(T, { wrong: [{ is: base, code: 'eq-no-a', hint: 'Don’t forget to multiply by ' + t('a=' + o.a) + '.' }, { is: mk(-o.a), code: 'int-sign', hint: 'Check the sign of ' + t('a') + '.' }] });
            var p = B.fields('Use the ' + t('y') + '-intercept to determine ' + t('a') + ' in ' + t('y=a(x' + sg(-o.r1) + ')(x' + sg(-o.r2) + ')') + ', then write the equation in the form ' + t('y=ax^{2}+bx+c') + '.',
              [{ name: t('a'), label: t('a=') }, { name: 'Equation', label: t('y='), mode: 'math', keys: 'poly', vars: ['x'], wide: true, placeholder: 'e.g. 3x^2 - 5x + 4' }], [aChk, pChk], [String(o.a), P.tex(T)],
              t('a=' + o.a) + ', ' + t('y=' + P.tex(T)),
              'Substitute ' + t(ptT([0, o.c])) + ': ' + t(o.c + '=a(0' + sg(-o.r1) + ')(0' + sg(-o.r2) + ')=' + (o.r1 * o.r2) + 'a') + ', so ' + t('a=' + o.a) + '.<br>' + t('y=' + o.a + '(x' + sg(-o.r1) + ')(x' + sg(-o.r2) + ')=' + o.a + '(' + P.tex(base) + ')=' + P.tex(T)).replace('=1(', '=(').replace('=-1(', '=-(') + '.<br>Check: ' + t('x=0') + ' gives ' + t('y=' + o.c) + ' ✓.',
              ['Put ' + t('x=0') + ' and ' + t('y=' + o.c) + ' into the factored form and solve for ' + t('a') + '.', 'Expand the two brackets first, then multiply every term by ' + t('a') + '.'], 'parabola from intercepts');
            p.bad = [[String(-o.a), P.tex(mk(-o.a))], [String(o.a), P.tex(base)]].filter(function (b) { return o.a !== 1 || b[1] !== P.tex(base); });
            return p;
          } }] },
      { num: '16', section: 'Extra practice G — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e16', level: 'EMG', make: function (r) {
          var k = r.pick([3, 3, 2, 4, 5, 6]), s = k * k;
          return mcPart(r, 'Which relation has a graph with <b>no</b> ' + t('x') + '-intercept?', [
            { html: t('y=x^{2}-' + s), why: t('x^{2}=' + s) + ' gives ' + t('x=\\pm' + k) + ': two ' + t('x') + '-intercepts.' },
            { html: t('y=x^{2}+' + s), right: true },
            { html: t('x=' + s), why: 'A vertical line crosses the ' + t('x') + '-axis at ' + t(ptT([s, 0])) + '.' },
            { html: t('y=' + s + 'x'), why: 'This line passes through the origin, ' + t('(0,\\ 0)') + ', which is an ' + t('x') + '-intercept.' }],
            t('y=x^{2}+' + s) + ': ' + t('y=0') + ' needs ' + t('x^{2}=-' + s) + ', impossible since ' + t('x^{2}\\ge 0') + ' — <b>no ' + t('x') + '-intercept</b>. The others: ' + t('\\pm' + k) + '; ' + t(ptT([s, 0])) + '; ' + t('(0,\\ 0)') + '.', ['Substitute ' + t('y=0') + ' into each option. Which equation has no solution?'], 'no x-intercept MC');
        } }] },
      { num: '17', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e17', level: 'PRG', make: function (r) {
          var pq = r.chance(0.3) ? [3, 8] : pickWhere(function () { return [r.int(2, 9), r.int(2, 9)]; }, function (z) { return z[0] < z[1] && z[0] * z[1] <= 72; }), p = pq[0], q = pq[1], ans = p + q + p * q;
          var eq = 'y=x^{2}-' + (p + q) + 'x+' + p * q;
          return B.nr('The graph of ' + t(eq) + ' has ' + t('x') + '-intercepts ' + t('p') + ' and ' + t('q') + ', and its ' + t('y') + '-intercept has value ' + t('r') + '. The value of ' + t('p+q+r') + ' is ________.', ans, function (v) {
            if (v === p * q - p - q) return { code: 'int-sign', hint: 'Check the signs of the ' + t('x') + '-intercepts: ' + t('(x-' + p + ')(x-' + q + ')=0') + ' gives ' + t('x=' + p) + ' and ' + t('x=' + q) + '.' };
            if (v === p + q) return { code: 'ctx-no-c', hint: 'Don’t forget ' + t('r') + ', the value of the ' + t('y') + '-intercept.' };
            return null;
          }, t('y=0') + ': ' + t('x^{2}-' + (p + q) + 'x+' + p * q + '=(x-' + p + ')(x-' + q + ')=0') + ', so ' + t('p=' + p) + ', ' + t('q=' + q) + '.<br>' + t('x=0') + ': ' + t('y=' + p * q) + ', so ' + t('r=' + p * q) + '.<br>' + t('p+q+r=' + p + '+' + q + '+' + p * q + '=' + ans) + '.',
          ['Factor the trinomial to find the ' + t('x') + '-intercepts, and substitute ' + t('x=0') + ' for the ' + t('y') + '-intercept.'], 'p+q+r for ' + eq);
        } }] }
    ];
  }
  function fracSlope(r, sa, sb) { return pickWhere(function () { return [sa * r.int(2, 9), sb * r.int(2, 9)]; }, function (z) { return z[1] % z[0] !== 0; }); } // slope -b/a not a whole number (as in the booklet)
  /* E13: equation of a line from its intercepts a (x) and b (y): y = mx + b and Ax + By + C = 0 */
  function backPart(a, b, asPoints) {
    var m = ex.norm(-b, a), T = reduceT([b, a, -a * b]);
    var tgt = P.add(P.mono(m, { x: 1 }), P.num(b));
    var wr = [{ is: P.add(P.mono(ex.norm(b, a), { x: 1 }), P.num(b)), code: 'eq-slope-sign', hint: 'Check the sign of the slope: ' + t('m=\\dfrac{' + b + '-0}{0-' + sgp(a) + '}') + '. Work out the top and the bottom separately, then divide. Does the line go up or down from left to right?' },
      { is: P.add(P.mono(ex.norm(-a, b), { x: 1 }), P.num(b)), code: 'eq-slope-flip', hint: 'Slope is rise over run: ' + t('m=\\dfrac{y_2-y_1}{x_2-x_1}') + '. Put the change in ' + t('y') + ' on top.' },
      { is: P.add(P.mono(m, { x: 1 }), P.num(a)), code: 'eq-b-xint', hint: 'In ' + t('y=mx+b') + ', ' + t('b') + ' is the <b>' + t('y') + '-intercept</b>, ' + t(b) + '.' }].filter(function (w) { return !P.eq(w.is, tgt); });
    var seen = []; wr = wr.filter(function (w) { if (seen.some(function (s) { return P.eq(s, w.is); })) return false; seen.push(w.is); return true; });
    var given = asPoints ? t('x') + '-intercept ' + t(ptT([a, 0])) + ', ' + t('y') + '-intercept ' + t(ptT([0, b])) : t('x') + '-intercept ' + t(a) + ', ' + t('y') + '-intercept ' + t(b);
    var stdW = [{ is: reduceT([b, -a, a * b]), code: 'eq-slope-sign', hint: 'Check the sign of the slope (or of one coefficient): substitute ' + t('y=0') + ' — does your equation give ' + t('x=' + a) + '?' }];
    var p = B.fields(given, [{ name: t('y=mx+b'), label: t('y='), mode: 'math', keys: 'poly', vars: ['x', 'y'], wide: true, placeholder: 'e.g. 3/4x + 1' }, { name: t('Ax+By+C=0'), label: 'General form', mode: 'math', keys: 'poly', vars: ['x', 'y'], after: t('=0'), wide: true, placeholder: 'e.g. 3x - 4y + 4' }],
      [K.poly(tgt, { wrong: wr }), stdChk(T, { wrong: stdW })], [P.tex(tgt), stdTex(T)], t('y=' + P.tex(tgt)) + '<br>' + t(stdTex(T) + '=0'),
      'Points ' + t(ptT([a, 0])) + ' and ' + t(ptT([0, b])) + '. ' + t('m=\\dfrac{' + b + '-0}{0-' + sgp(a) + '}=' + rT(-b, a)) + ', and ' + t('b=' + b) + ' (the ' + t('y') + '-intercept), so ' + t('y=' + P.tex(tgt)) + '.<br>' + (ex.norm(-b, a)[1] > 1 ? 'Multiply every term by ' + t(ex.norm(-b, a)[1]) + ' and move' : 'Move') + ' every term to the left: ' + t(stdTex(T) + '=0') + '.',
      ['Use the two intercept points to find the slope, ' + t('m=\\frac{\\text{rise}}{\\text{run}}') + '. The ' + t('y') + '-intercept is ' + t('b') + '.', 'For ' + t('Ax+By+C=0') + ': multiply by the denominator of the slope and move everything to one side.'], 'line from intercepts ' + a + ', ' + b);
    p.bad = [[P.tex(wr.length ? wr[0].is : P.num(99)), stdTex(T)], [P.tex(tgt), stdTex(reduceT([b, -a, a * b]))]];
    return p;
  }
})(window);
