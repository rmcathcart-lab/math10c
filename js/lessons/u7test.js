/* Math 10C · Unit 7 Test (RF4, RF5, RF6, RF7) — the paper outcomes-based unit test (u7_test_A/B/C.tex) as generators.
 * The paper has one page per outcome (RF4 Q1–7, RF5 Q8–14, RF6 Q15–22, RF7 Q23–29), each in BEG / PRG / MAS boxes; every
 * question keeps its box (outcome, level) and its paper number. Each part takes its numbers from the seed, inside the
 * range Versions A, B and C show (their numbers are possible values), with a key and a worked solution for every version.
 * A scientific calculator is allowed (graphing calculators are not).
 * Conversions from paper: "tick linear / non-linear" and "name the form" → grid; "explain how you know" → checkable steps
 * (the changes in y, the rates, a yes/no decision); "what does it mean" → a grid that matches each value to its meaning;
 * "circle every equation" → select; "match each equation to its graph" → grid; graphs → the graph pad (arrow-ended line);
 * "is each line possible? sketch one, or explain why not" → (a) draw it, (b) multiple choice with a reason for each option
 * (the one Mastery MC, like u1test Q17). To give every student different numbers, Q10 is sometimes a vertical line and
 * Q14 gives one intercept as a number (the paper gives only signs). */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, B = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, F = HW.fmt, LN = HW.lines, DR = HW.draw;

  HW.addCodes({
    'u7t-lin-horiz': 'Called a horizontal line non-linear', 'u7t-lin-gen': 'Called a general-form equation non-linear', 'u7t-lin-si': 'Called y = mx + b non-linear',
    'u7t-lin-curve': 'Called a non-linear relation linear', 'u7t-lin-many': 'Several relations classified wrongly', 'u7t-diff': 'A change in y wrong (sign slip)',
    'u7t-lin-decide': 'Right changes, wrong linear / not linear decision', 'u7t-tab-mx': 'Table value: sign slip multiplying by a negative x', 'u7t-tab-b': 'Table value: sign of b',
    'u7t-b-first': 'Used the first table value as the y-intercept', 'u7t-words-order': '“k less than …” / “k minus …” written backwards', 'u7t-words-group': 'Multiplied the whole sum instead of the input',
    'u7t-sub-sign': 'Sign slip substituting a negative input', 'u7t-onpt-decide': 'Is the point on it: decision doesn’t match the value', 'u7t-ctx-nostart': 'Left out the starting amount',
    'u7t-ctx-sign': 'Added the starting amount instead of subtracting', 'u7t-ctx-eval': 'Found the output instead of solving for the input', 'u7t-ctx-swap': 'Rate and starting value swapped',
    'u7t-yn': 'Not answered yes or no', 'u7t-claim': 'Agreed with a wrong claim', 'u7t-icpt-none': 'Said there is no intercept', 'u7t-icpt-has': 'Gave an intercept where there is none',
    'u7t-icpt-axis': 'Intercept written as a point on the wrong axis', 'u7t-icpt-swap': 'x- and y-intercepts swapped', 'u7t-icpt-sign': 'Intercept sign', 'u7t-icpt-read': 'Intercept not readable',
    'u7t-xint-mult': 'x-intercept: multiplied by the slope instead of dividing', 'u7t-tint-mult': 'Time intercept: multiplied instead of dividing', 'u7t-mean-one': 'One value matched to the wrong meaning',
    'u7t-mean-many': 'Values matched to the wrong meanings', 'u7t-sk-slope': 'Sketch: slope has the wrong sign', 'u7t-sk-int': 'Sketch: an intercept is wrong', 'u7t-sk-line': 'Sketch: not one straight line',
    'u7t-form-name': 'One form named wrongly', 'u7t-form-many': 'Forms named wrongly', 'u7t-ps-half': 'Slope–point form: one coordinate’s sign not flipped', 'u7t-mb-swap': 'Slope and y-intercept swapped',
    'u7t-mb-order': 'Read m and b left to right (constant first)', 'u7t-dist': 'Didn’t multiply the slope into the bracket', 'u7t-y1-sign': 'Moved y₁ across without changing its sign',
    'u7t-eqv-extra': 'Chose one equation of a different line', 'u7t-eqv-missed': 'Missed one equation of the same line', 'u7t-eqv-many': 'Several equations chosen wrongly',
    'u7t-match-one': 'One equation matched to the wrong graph', 'u7t-match-swap': 'Two graphs swapped', 'u7t-match-many': 'Matched several graphs wrongly', 'u7t-icpt-pair': 'The two y-intercepts swapped',
    'u7t-agree': 'Agreed that the equation must be rewritten first', 'u7t-pt-same': 'Second point is the same as the first', 'u7t-pt-dir': 'Second point: stepped the slope the wrong way', 'u7t-pt-off': 'Second point not on the line',
    'u7t-strategy': 'Not the fastest graphing strategy', 'u7t-si-swap': 'Swapped m and b in y = mx + b', 'u7t-hv-coord': 'Horizontal / vertical line: used the other coordinate',
    'u7t-perp-par': 'Used the parallel slope instead of the perpendicular one', 'u7t-perp-sign': 'Perpendicular slope: reciprocal without the sign change', 'u7t-mid-diff': 'Midpoint: subtracted instead of added',
    'u7t-mid-half': 'Midpoint: forgot to divide by 2', 'u7t-pb-endpt': 'Perpendicular line through an endpoint, not the midpoint', 'u7t-pb-par': 'Used the slope of AB, not the perpendicular slope'
  });
  HW.addPartial({
    'u7t-lin-horiz': 's', 'u7t-lin-gen': 's', 'u7t-lin-si': 's', 'u7t-lin-curve': 's', 'u7t-lin-many': 'n', 'u7t-diff': 's', 'u7t-lin-decide': 'n', 'u7t-tab-mx': 's', 'u7t-tab-b': 's',
    'u7t-b-first': 'b', 'u7t-words-order': 'n', 'u7t-words-group': 'b', 'u7t-sub-sign': 's', 'u7t-onpt-decide': 'n', 'u7t-ctx-nostart': 'b', 'u7t-ctx-sign': 's', 'u7t-ctx-eval': 'n',
    'u7t-ctx-swap': 'b', 'u7t-claim': 'n', 'u7t-icpt-none': 'n', 'u7t-icpt-has': 'n', 'u7t-icpt-axis': 's', 'u7t-icpt-swap': 'b', 'u7t-icpt-sign': 's', 'u7t-xint-mult': 'b', 'u7t-tint-mult': 'b',
    'u7t-mean-one': 'b', 'u7t-mean-many': 'n', 'u7t-sk-slope': 'b', 'u7t-sk-int': 'b', 'u7t-sk-line': 'n', 'u7t-form-name': 's', 'u7t-form-many': 'n', 'u7t-ps-half': 's', 'u7t-mb-swap': 'b',
    'u7t-mb-order': 'b', 'u7t-dist': 'b', 'u7t-y1-sign': 's', 'u7t-eqv-extra': 's', 'u7t-eqv-missed': 's', 'u7t-eqv-many': 'n', 'u7t-match-one': 'b', 'u7t-match-swap': 'b', 'u7t-match-many': 'n',
    'u7t-icpt-pair': 's', 'u7t-agree': 'n', 'u7t-pt-same': 'n', 'u7t-pt-dir': 's', 'u7t-pt-off': 'n', 'u7t-strategy': 'n', 'u7t-si-swap': 'b', 'u7t-hv-coord': 's', 'u7t-perp-par': 'n',
    'u7t-perp-sign': 'b', 'u7t-mid-diff': 'b', 'u7t-mid-half': 's', 'u7t-pb-endpt': 'b', 'u7t-pb-par': 'n'
  });

  /* ---------------- rational numbers [p, q] (from u7l7) ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function toQ(x) { return Array.isArray(x) ? x : LN.toFr(x); }
  function Q(p, q) { if (Array.isArray(p)) return Q(p[0], p[1]); if (q === undefined) { if (!Number.isInteger(p)) return Q(LN.toFr(p)); q = 1; } if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g + 0, q / g]; }
  function qa(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function qs(a, b) { b = Q(b); return qa(a, [-b[0], b[1]]); }
  function qm(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[0], a[1] * b[1]); }
  function qd(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[1], a[1] * b[0]); }
  function qn(a) { a = Q(a); return [-a[0] + 0, a[1]]; }
  function qv(a) { a = Q(a); return a[0] / a[1]; }
  function qT(a) { a = Q(a); return LN.frT(a[0], a[1]); }
  function isInt(a) { return Q(a)[1] === 1; }
  function near(a, b) { return Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)); }
  function nT(v) { return Array.isArray(v) ? qT(v) : String(v); }
  function ptT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function ptK(p) { return '(' + nT(p[0]) + ', ' + nT(p[1]) + ')'; }
  function sgnP(n) { return n < 0 ? '(' + n + ')' : String(n); }
  function rnz(r, a, b) { var v; do { v = r.int(a, b); } while (v === 0); return v; }
  function find(gen, test, fallback) { for (var i = 0; i < 600; i++) { var v = gen(); if (v != null && test(v)) return v; } return fallback; }
  function num(x) { return F(Math.round(x * 1e6) / 1e6); }
  function money(x) { x = Math.round(x * 100) / 100; return '\\$' + (Number.isInteger(x) ? F(x) : F(x.toFixed(2))); }
  function word(n) { return ['zero', 'one', 'twice', 'three times', 'four times', 'five times', 'six times'][n]; }
  var NAMES = ['Jordan', 'Kai', 'Priya', 'Sam', 'Lena', 'Omar', 'Ava', 'Noah', 'Mei', 'Leo'];

  /* ---------------- lines as A x + B y + C = 0 (integers, A > 0 or A = 0 and B > 0, no common factor) ---------------- */
  function L3(A, Bc, C) { var g = gcd(gcd(A, Bc), C) || 1; A /= g; Bc /= g; C /= g; if (A < 0 || (A === 0 && Bc < 0)) { A = -A; Bc = -Bc; C = -C; } return { A: A + 0, B: Bc + 0, C: C + 0 }; }
  function Lrat(a, b, c) { a = Q(a); b = Q(b); c = Q(c); var d = a[1] * b[1] * c[1]; return L3(a[0] * d / a[1], b[0] * d / b[1], c[0] * d / c[1]); }
  function lineMP(m, pt) { m = Q(toQ(m)); return Lrat([m[0], 1], [-m[1], 1], qs(qm(m[1], toQ(pt[1])), qm(m[0], toQ(pt[0])))); }
  function lineMB(m, b) { m = Q(toQ(m)); return Lrat([m[0], 1], [-m[1], 1], qm(m[1], toQ(b))); }
  function line2(p, q) { return p[0] === q[0] ? L3(1, 0, -p[0]) : lineMP(Q(q[1] - p[1], q[0] - p[0]), p); }
  function slopeOf(L) { return L.B === 0 ? null : Q(-L.A, L.B); }
  function yint(L) { return Q(-L.C, L.B); }
  function xint(L) { return Q(-L.C, L.A); }
  function onL(L, p) { return near(L.A * qv(toQ(p[0])) + L.B * qv(toQ(p[1])) + L.C, 0); }
  function sameL(a, b) { return a.A === b.A && a.B === b.B && a.C === b.C; }
  function gT(L) { return LN.tex(L, 'general'); }
  function sT(L, vars) { return LN.tex(L, 'slope-intercept', null, vars); }
  function pT(L, pt) { return LN.tex(L, 'point-slope', pt); }
  function perpS(m) { m = Q(m); return Q(-m[1], m[0]); }
  function term(c, v, first) {
    var f = Q(c); if (f[0] === 0) return '';
    var s = f[0] < 0 ? '-' : (first ? '' : '+'), ab = Math.abs(f[0]);
    return s + (f[1] === 1 ? (ab === 1 && v ? '' : String(ab)) : '\\frac{' + ab + '}{' + f[1] + '}') + v;
  }
  function pol(list) { var out = ''; list.forEach(function (tm) { out += term(tm[0], tm[1], !out); }); return out || '0'; }
  /* worked steps: slope-point form through pt → general form, and → slope-intercept form */
  function psSteps(m, pt) {
    m = Q(m); var L = lineMP(m, pt), s = t(pT(L, pt));
    if (m[0] === 0) return s + '<br>General form: ' + t(gT(L));
    var q = m[1], lhs = pol([[q, 'y'], [qm(-q, pt[1]), '']]), rhs = pol([[m[0], 'x'], [qm(-m[0], pt[0]), '']]);
    s += '<br>' + (q === 1 ? 'Expand: ' : 'Multiply both sides by ' + t(q) + ': ') + t(lhs + '=' + rhs);
    return s + '<br>Move every term to one side: ' + t(gT(L));
  }
  function siSteps(m, pt) {
    m = Q(m); var b = qs(pt[1], qm(m, pt[0])), L = lineMB(m, b);
    return t(pT(L, pt)) + '<br>Expand: ' + t('y' + (pt[1] ? (pt[1] > 0 ? '-' : '+') + Math.abs(pt[1]) : '') + '=' + pol([[m, 'x'], [qn(qm(m, pt[0])), '']])) +
      '<br>' + (pt[1] ? (pt[1] > 0 ? 'Add ' : 'Subtract ') + t(Math.abs(pt[1])) + ' on both sides: ' : '') + t(sT(L));
  }
  function slopeSteps(p, q) { var d = Q(q[1] - p[1], q[0] - p[0]); return t('m=\\dfrac{' + q[1] + '-' + sgnP(p[1]) + '}{' + q[0] + '-' + sgnP(p[0]) + '}=\\dfrac{' + (q[1] - p[1]) + '}{' + (q[0] - p[0]) + '}' + (isInt(d) || gcd(q[1] - p[1], q[0] - p[0]) > 1 || (q[0] - p[0]) < 0 ? '=' + qT(d) : '')); }

  /* ---------------- checkers ---------------- */
  function lineP(prompt, L, opt, sol, hints, text) {
    opt = opt || {}; var p = B.line(prompt, L, opt, sol, hints, text), vars = opt.vars;
    p.bad = (opt.wrong || []).map(function (w) { return typeof w.is === 'string' ? null : w.is; }).filter(function (W) { return W && !sameL(W, L); }).map(function (W) { return LN.tex(W, 'general', null, vars); });
    return p;
  }
  function numD(ans, alts) { return K.number(ans, function (v) { for (var i = 0; i < (alts || []).length; i++) if (alts[i] && near(v, alts[i].v) && !near(v, ans)) return { code: alts[i].code, hint: alts[i].hint }; return null; }); }
  function valD(target, alts) { var T = qv(target); return K.value(T, { diag: function (v) { for (var i = 0; i < (alts || []).length; i++) if (alts[i] && near(v, qv(alts[i].v)) && !near(v, T)) return { code: alts[i].code, hint: alts[i].hint }; return null; } }); }
  function slopeD(m, alts, opt) { return K.slope(m == null ? null : Q(m), Object.assign({ diag: function (v) { for (var i = 0; i < (alts || []).length; i++) if (alts[i] && near(v, qv(alts[i].v)) && !near(v, qv(m))) return { code: alts[i].code, hint: alts[i].hint }; return null; } }, opt || {})); }
  function ynChk(want, code, hint) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim().toLowerCase().replace(/\\text\{([^}]*)\}/g, '$1');
      if (!s) return form('empty', 'Type yes or no.');
      var y = /^(y|yes|yep|yeah|true|correct)\b/.test(s), n = /^(n|no|nope|not|false|incorrect)\b/.test(s);
      if (!y && !n) return form('u7t-yn', 'Answer with <b>yes</b> or <b>no</b>.');
      return (y ? 'yes' : 'no') === want ? ok() : wrong(code, hint);
    };
  }
  /* an intercept: a number (or the point on the axis); tg = null when there is none */
  function icChk(tg, axis, other, alts) {
    var T = tg == null ? null : qv(tg), O = other == null ? null : qv(other), ax = axis, oth = axis === 'x' ? 'y' : 'x';
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type your answer first.');
      if (/^(\\text\{\s*)?(none|no)\b/i.test(s)) return T == null ? ok() : wrong('u7t-icpt-none', 'This line does cross the ' + t(ax) + '-axis: set ' + t(oth + '=0') + ' and solve for ' + t(ax) + '.');
      var v;
      if (/^(\\left)?\(/.test(s)) {
        var p = LN.readPoint(s);
        if (!p || p.kind !== 'pt') return form('u7t-icpt-read', 'Give the intercept as a number, e.g. ' + t('-3') + '.');
        var px = p.p[0].v, py = p.p[1].v, onAx = ax === 'x' ? near(py, 0) : near(px, 0);
        if (!onAx) { if (T != null && (ax === 'x' ? near(px, 0) && near(py, T) : near(py, 0) && near(px, T))) return wrong('u7t-icpt-axis', 'That point is on the wrong axis: the ' + t(ax) + '-intercept is on the ' + t(ax) + '-axis, so its ' + t(oth) + '-coordinate is ' + t('0') + '.'); return wrong('value', null); }
        v = ax === 'x' ? px : py;
      } else { var a = K.read(s); if (a.res) return a.res; v = a.val; }
      if (T == null) return wrong('u7t-icpt-has', 'This line is parallel to the ' + t(ax) + '-axis, so it never crosses it: type <b>none</b>.');
      if (near(v, T)) return ok();
      for (var i = 0; i < (alts || []).length; i++) if (alts[i] && near(v, qv(alts[i].v))) return wrong(alts[i].code, alts[i].hint);
      if (O != null && near(v, O)) return wrong('u7t-icpt-swap', 'That’s the ' + t(oth) + '-intercept. The ' + t(ax) + '-intercept is where the line crosses the ' + t(ax) + '-axis (where ' + t(oth + '=0') + ').');
      if (T !== 0 && near(v, -T)) return wrong('u7t-icpt-sign', 'Check the sign of the ' + t(ax) + '-intercept.');
      return wrong('value', null);
    };
  }
  /* one ordered pair (from u7l7); name = 'x' | 'y' for an intercept */
  function ptChk(pt, name, alts) {
    var base = K.pairs([[qv(pt[0]), qv(pt[1])]]);
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (s && s.indexOf('(') < 0) { var a = K.read(s); if (!a.res) return form('pt-form', 'Write it as an ordered pair, ' + t('(x,\\ y)') + '.'); }
      var r = base(resp);
      if (r.v === 'wrong') {
        var pp = LN.readPoint(s);
        if (pp && pp.kind === 'pt') for (var i = 0; i < (alts || []).length; i++) if (alts[i] && near(pp.p[0].v, qv(alts[i].p[0])) && near(pp.p[1].v, qv(alts[i].p[1]))) return wrong(alts[i].code, alts[i].hint);
      }
      if (r.v === 'wrong' && r.code === 'pairs-flip') return wrong(name ? 'u7t-icpt-axis' : 'pt-swap', name === 'x' ? 'The ' + t('x') + '-intercept is on the ' + t('x') + '-axis, so its ' + t('y') + '-coordinate is ' + t('0') + ': ' + t('(a,\\ 0)') + '.' : name === 'y' ? 'The ' + t('y') + '-intercept is on the ' + t('y') + '-axis, so its ' + t('x') + '-coordinate is ' + t('0') + ': ' + t('(0,\\ b)') + '.' : 'Your coordinates are swapped: ' + t('(x,\\ y)') + ' — across first, then up or down.');
      if (r.v === 'wrong' && r.code === 'pairs') return wrong('point', null);
      return r;
    };
  }
  /* a grid where the number of wrong rows decides the code: one row → why(row); several → many */
  function gridP(prompt, rows, cols, want, why, many, sol, hints, text) {
    var p = B.grid(prompt, rows, cols, want, { why: why, rowHead: ' ' }, sol, hints, text), base = p.check;
    p.check = function (resp) {
      var res = base(resp); if (res.v !== 'wrong') return res;
      var bad = Object.keys(want).filter(function (k) { return (resp || {})[k] !== want[k]; });
      if (bad.length > 1) return wrong(many.code, (many.hint ? many.hint(bad) : '') || res.hint);
      return res;
    };
    return p;
  }

  /* ---------------- graph pad (from u7l7) ---------------- */
  function gv(pts, pieces) { return { pts: pts || [], pieces: pieces || [], join: 'none' }; }
  function segv(a, b, s, e) { return { v: [a, b], s: s || 'closed', e: e || 'closed' }; }
  function lattice(L, xr, yr) {
    var out = [];
    if (L.B === 0) { var k = -L.C / L.A; if (Number.isInteger(k) && k >= xr[0] && k <= xr[1]) for (var y = yr[0]; y <= yr[1]; y++) out.push([k, y]); return out; }
    for (var x = xr[0]; x <= xr[1]; x++) { var yy = (-L.C - L.A * x) / L.B; if (Math.abs(yy - Math.round(yy)) < 1e-9 && yy >= yr[0] && yy <= yr[1]) out.push([x, Math.round(yy)]); }
    return out;
  }
  function lineDraw(L, xr, yr) { var a = lattice(L, xr, yr); return a.length >= 2 ? gv([], [segv(a[0], a[a.length - 1], 'arrow', 'arrow')]) : null; }
  function clip(L, xr, yr) {
    var pts = [], add = function (p) { if (p[0] >= xr[0] - 1e-9 && p[0] <= xr[1] + 1e-9 && p[1] >= yr[0] - 1e-9 && p[1] <= yr[1] + 1e-9 && !pts.some(function (z) { return Math.abs(z[0] - p[0]) < 1e-9 && Math.abs(z[1] - p[1]) < 1e-9; })) pts.push(p); };
    if (L.B !== 0) { [xr[0], xr[1]].forEach(function (x) { add([x, (-L.C - L.A * x) / L.B]); }); }
    if (L.A !== 0) { [yr[0], yr[1]].forEach(function (y) { add([(-L.C - L.B * y) / L.A, y]); }); }
    return pts.slice(0, 2);
  }
  function exactChk(target, opt) { var base = K.graphExact(target, opt); return function (resp) { if (!DR.empty(resp) && DR.same(resp, target)) return ok(); return base(resp); }; }
  function pad(xr, yr, extra) { return Object.assign({ x: xr, y: yr, labels: 2, defaultEnd: 'arrow', tools: ['line', 'ends'] }, extra || {}); }
  var LINEHELP = ' Use <b>╱ Line</b>: tap two points on the line — its ends start as arrows (a line goes on forever).';
  function graphLine(prompt, L, xr, yr, wrongs, sol, hints, text) {
    var key = lineDraw(L, xr, yr), W = [], bad = [];
    (wrongs || []).forEach(function (w) { if (!w || sameL(w.L, L)) return; var d = lineDraw(w.L, xr, yr); if (d) { W.push({ is: d, code: w.code, hint: w.hint }); bad.push(d); } });
    var a = lattice(L, xr, yr); bad.push(gv([], [segv(a[0], a[a.length - 1])]));
    var p = B.graph(prompt + LINEHELP, pad(xr, yr), exactChk(key, { wrong: W }), key, sol, hints, text);
    p.bad = bad.filter(function (b) { return b && !DR.same(b, key); });
    return p;
  }
  /* a picture of lines (arrow ends) and points */
  function lineFig(Ls, xr, yr, o) {
    o = o || {}; var ix = [xr[0] + 0.3, xr[1] - 0.3], iy = [yr[0] + 0.3, yr[1] - 0.3];
    return '<div class="fig">' + HW.graph({ x: xr, y: yr, grid: 1, labels: o.labels == null ? 2 : o.labels, max: o.max || 280, aria: o.aria || 'graph of a line',
      segs: Ls.map(function (L) { return { pts: clip(L, ix, iy), start: 'arrow', end: 'arrow' }; }), points: o.points || [] }) + '</div>';
  }
  function tab(xs, ys, xh, yh) { return '<div class="fig">' + HW.valueTable([[xh || t('x')].concat(xs.map(function (x) { return t(num(x)); })), [yh || t('y')].concat(ys.map(function (y) { return y == null ? '' : t(num(y)); }))]) + '</div>'; }

  /* ======================= RF4 helpers ======================= */
  /* Q1: three linear relations (y = mx + b, general form, horizontal) and three non-linear ones */
  function q1Rows(r) {
    var m = r.chance(0.3) ? Q(r.pick([1, -1, 1, 3]), 2) : Q(rnz(r, -7, 7)), b = rnz(r, -9, 9);
    var gA = r.int(1, 5), gB = rnz(r, -5, 5), gC = rnz(r, -12, 12), G = L3(gA, gB, gC), k = r.chance(0.25) ? r.pick([2.5, -1.5, 3.5]) : rnz(r, -9, 9);
    var c = r.int(1, 6), a = r.pick([2, 3, 4, 5]), kk = r.pick([2, 4, 6, 8]);
    var non = r.sample([
      { tex: 'y=x^{2}' + (c ? '+' + c : ''), why: t('x') + ' is squared, so the graph is a curve (a parabola)' },
      { tex: 'y=-x^{2}+' + c, why: t('x') + ' is squared, so the graph is a curve (a parabola)' },
      { tex: 'y=x^{3}-' + c, why: t('x') + ' is cubed, so the graph is a curve' },
      { tex: 'y=\\tfrac{' + kk + '}{x}', why: t('x') + ' is in the denominator, so the graph is a curve' },
      { tex: 'y=' + a + '^{x}', why: t('x') + ' is an exponent, so the graph curves upward' },
      { tex: 'y=\\sqrt{x}', why: t('x') + ' is under a square root, so the graph is a curve' }], 3);
    var rows = [{ id: 's', tex: sT(lineMB(m, b)), lin: 1, kind: 'si' }, { id: 'g', tex: gT(G), lin: 1, kind: 'gen' }, { id: 'h', tex: 'y=' + num(k), lin: 1, kind: 'h' }]
      .concat(non.map(function (n, i) { return { id: 'n' + i, tex: n.tex, lin: 0, why: n.why }; }));
    return r.shuffle(rows);
  }
  function linWhy(x) {
    if (!x.lin) return { code: 'u7t-lin-curve', hint: t(x.tex) + ' is <b>not</b> linear: ' + x.why + '.' };
    if (x.kind === 'h') return { code: 'u7t-lin-horiz', hint: t(x.tex) + ' <b>is</b> linear: it is a horizontal line (slope ' + t('0') + ').' };
    if (x.kind === 'gen') return { code: 'u7t-lin-gen', hint: t(x.tex) + ' <b>is</b> linear: it is a line in general form, ' + t('Ax+By+C=0') + ' (both variables to the first power).' };
    return { code: 'u7t-lin-si', hint: t(x.tex) + ' <b>is</b> linear: it is in the form ' + t('y=mx+b') + '.' };
  }
  /* Q2: a table that is linear or not */
  function q2Part(s, lin) {
    var xs = [0, 1, 2, 3, 4], ys = xs.map(function (x) { return lin ? s.m * x + s.b : s.a2 * x * x + s.c; }), ds = [0, 1, 2, 3].map(function (i) { return ys[i + 1] - ys[i]; });
    var fields = ds.map(function (d, i) { return { name: 'Change ' + (i + 1), label: 'Change in ' + t('y') + ', ' + t('x=' + i + '\\to ' + (i + 1)) + ':' }; }).concat([{ name: 'Linear?', label: 'Is the relation linear? (yes or no)', mode: 'text', placeholder: 'yes/no' }]);
    var checks = ds.map(function (d) { return numD(d, [{ v: -d, code: 'u7t-diff', hint: 'Check the sign: ' + t('y') + ' goes ' + (d < 0 ? 'down' : 'up') + ' here, so the change is ' + (d < 0 ? 'negative' : 'positive') + '.' }]); })
      .concat([ynChk(lin ? 'yes' : 'no', 'u7t-lin-decide', lin ? 'Every step in ' + t('x') + ' is the same and ' + t('y') + ' changes by the <b>same amount</b> each time: a constant rate of change means the relation <b>is</b> linear.' : 'The changes in ' + t('y') + ' are <b>not</b> all the same, so the rate of change isn’t constant: the relation is <b>not</b> linear.')]);
    var keys = ds.map(String).concat([lin ? 'yes' : 'no']);
    var p = B.fields('Is this relation linear? Find the change in ' + t('y') + ' each time ' + t('x') + ' increases by ' + t('1') + ', then decide.' + tab(xs, ys), fields, checks, keys,
      'changes ' + t(ds.join(',\\ ')) + ' — ' + (lin ? '<b>linear</b>' : '<b>not linear</b>'),
      (lin ? '<b>Linear.</b> Each time ' + t('x') + ' increases by ' + t('1') + ', ' + t('y') + ' ' + (s.m < 0 ? 'decreases by ' + t(-s.m) : 'increases by ' + t(s.m)) + ' (' + t(ds.join(',\\ ')) + '): a constant rate of change, ' + t(s.m) + '.'
        : '<b>Not linear.</b> The changes in ' + t('y') + ' are ' + t(ds.join(',\\ ')) + ': they are not constant, so the points don’t lie on a line.'),
      ['Subtract each ' + t('y') + '-value from the next one.', 'A relation is linear when equal steps in ' + t('x') + ' always give the same change in ' + t('y') + '.'], (lin ? 'linear' : 'non-linear') + ' table ' + ys.join(','));
    p.bad = [ds.map(String).concat([lin ? 'no' : 'yes']), ds.map(function (d) { return String(-d); }).concat([lin ? 'yes' : 'no'])].filter(function (b, i) { return i === 0 || ds.some(function (d) { return d !== 0; }); });
    return p;
  }
  /* Q6: growing contexts */
  var GROW = [
    { x: 'w', y: 'h', xs: 'week', xp: 'weeks', yu: 'cm', what: 'height', starts: [5, 6, 7, 8, 9, 10, 12], rates: [1.5, 2, 2.5, 3, 3.5, 4, 4.5], W: [8, 16],
      intro: function (s) { return 'When ' + s.name + ' planted a sunflower seedling it was ' + t(num(s.S)) + ' cm tall. It grows ' + t(num(s.R)) + ' cm every week.'; },
      ask: function (s) { return 'When will the sunflower be ' + t(num(s.T)) + ' cm tall?'; }, fmt: function (v) { return num(v); } },
    { x: 't', y: 'h', xs: 'minute', xp: 'min', yu: 'm', what: 'height', starts: [80, 90, 100, 110, 120, 130, 140, 150], rates: [10, 12, 15, 18, 20, 25], W: [8, 16],
      intro: function (s) { return 'A hot-air balloon is ' + t(num(s.S)) + ' m above the ground. It rises ' + t(num(s.R)) + ' m every minute.'; },
      ask: function (s) { return 'When will the balloon be ' + t(num(s.T)) + ' m above the ground?'; }, fmt: function (v) { return num(v); } },
    { x: 'w', y: 'S', xs: 'week', xp: 'weeks', yu: '$', what: 'savings', starts: [20, 25, 30, 35, 40, 45, 50, 60], rates: [7.5, 10, 12.5, 15, 17.5, 20], W: [10, 20], money: true,
      intro: function (s) { return s.name + ' has ' + t(money(s.S)) + ' in a savings jar. ' + s.name + ' adds ' + t(money(s.R)) + ' to the jar every week.'; },
      ask: function (s) { return 'When will ' + s.name + ' have ' + t(money(s.T)) + ' in the jar?'; }, fmt: function (v) { return money(v); } }];
  function cv(c, v) { return c.money ? money(v) : num(v) + '\\text{ ' + c.yu + '}'; }
  /* Q13: decreasing contexts (V = V0 − r t until empty) */
  var DRAIN = [
    { y: 'C', unit: '%', yname: 'battery charge', pairs: [[4, [15, 25]], [5, [12, 20]], [6, [10, 16]], [8, [8, 12]]], tu: 'h', tw: 'hours',
      intro: function (s) { return 'A phone’s battery charge is ' + t('C=' + s.V0 + '-' + s.r + 't') + ' (%), ' + t('t') + ' hours after it is unplugged, until it is empty.'; },
      mean: { start: 'the charge (%) at the moment it is unplugged', end: 'the time (h) when the battery is empty', rate: 'the change in charge each hour (% per h)', inv: 'the number of hours for each 1% of charge (h per %)' } },
    { y: 'V', unit: 'L', yname: 'volume of water', pairs: [[30, [20, 50]], [40, [20, 50]], [45, [20, 50]], [50, [20, 45]], [60, [20, 40]]], tu: 'min', tw: 'minutes',
      intro: function (s) { return 'A hot tub holds ' + t('V=' + F(s.V0) + '-' + s.r + 't') + ' litres of water, ' + t('t') + ' minutes after its drain is opened, until it is empty.'; },
      mean: { start: 'the volume (L) when the drain is opened', end: 'the time (min) when the tub is empty', rate: 'the change in volume each minute (L per min)', inv: 'the minutes needed for each litre (min per L)' } },
    { y: 'h', unit: 'm', yname: 'altitude', pairs: [[150, [16, 30]], [200, [15, 30]], [250, [12, 28]], [300, [12, 25]], [400, [10, 20]]], tu: 'min', tw: 'minutes',
      intro: function (s) { return 'A plane’s altitude is ' + t('h=' + F(s.V0) + '-' + s.r + 't') + ' metres, ' + t('t') + ' minutes after it starts to descend, until it lands.'; },
      mean: { start: 'the altitude (m) when the descent starts', end: 'the time (min) when the plane lands', rate: 'the change in altitude each minute (m per min)', inv: 'the minutes needed for each metre of descent (min per m)' } }];
  /* Q14: is the line possible? */
  function sgnW(v) { return v > 0 ? t('>0') : t('<0'); }
  /* Q28: fixed fee + rate contexts */
  var FEE = [
    { x: 't', xu: 'hours', x1s: 'hour', rateU: 'per hour', fee: 'call-out fee',
      gen: function (r) { var rate = r.pick([45, 50, 55, 60, 65, 70, 75, 80, 85, 90]), fee = r.pick([40, 45, 50, 55, 60, 65, 70, 75, 80, 90]), x1 = r.int(1, 3), x2 = x1 + r.int(2, 5), T = x2 + r.int(1, 4); return { rate: rate, fee: fee, x1: x1, x2: x2, T: T, budget: fee + rate * T }; },
      intro: function (s) { return 'A plumber charges a fixed call-out fee plus an hourly rate. A ' + t(s.x1) + '-hour job costs ' + t(money(s.c1)) + ' and a ' + t(s.x2) + '-hour job costs ' + t(money(s.c2)) + '.'; },
      eq: 'the cost, ' + t('C') + ', of a job that takes ' + t('t') + ' hours', ask: function (s) { return 'A customer can spend at most ' + t(money(s.budget)) + '. What is the longest job the plumber can do?'; }, ansU: 'hours',
      mean: { rate: 'the charge for each hour of work ($ per h)', fee: 'the fixed call-out fee ($)', one: 'the cost of a 1-hour job ($)', inv: 'the hours of work for each dollar (h per $)' } },
    { x: 'd', xu: 'km', x1s: 'kilometre', rateU: 'per kilometre', fee: 'daily fee',
      gen: function (r) { var rate = r.pick([0.15, 0.2, 0.25, 0.3]), fee = r.pick([35, 39, 45, 49, 52, 57, 60, 65]), x1 = r.pick([100, 150, 200]), x2 = x1 + r.pick([150, 200, 250, 300]), T = r.pick([500, 550, 600, 650, 700, 750, 800, 900]); return { rate: rate, fee: fee, x1: x1, x2: x2, T: T, budget: Math.round((fee + rate * T) * 100) / 100 }; },
      intro: function (s) { return 'A rental car costs a fixed daily fee plus a charge per kilometre. Driving ' + t(s.x1) + ' km costs ' + t(money(s.c1)) + ' and driving ' + t(s.x2) + ' km costs ' + t(money(s.c2)) + '.'; },
      eq: 'the cost, ' + t('C') + ', of driving ' + t('d') + ' kilometres', ask: function (s) { return s.name + ' can spend at most ' + t(money(s.budget)) + '. What is the farthest ' + s.name + ' can drive?'; }, ansU: 'km',
      mean: { rate: 'the charge for each kilometre driven ($ per km)', fee: 'the fixed daily fee ($)', one: 'the cost of driving 1 km ($)', inv: 'the kilometres you can drive for each dollar (km per $)' } },
    { x: 'n', xu: 'months', x1s: 'month', rateU: 'per month', fee: 'sign-up fee',
      gen: function (r) { var rate = r.pick([25, 30, 35, 40, 45, 50, 55]), fee = r.pick([49, 59, 69, 79, 89, 99]), x1 = r.int(3, 5), x2 = x1 + r.int(4, 8), T = r.int(12, 24); return { rate: rate, fee: fee, x1: x1, x2: x2, T: T, budget: fee + rate * T }; },
      intro: function (s) { return 'A gym charges a one-time sign-up fee plus a monthly fee. After ' + t(s.x1) + ' months a member has paid ' + t(money(s.c1)) + ' in total, and after ' + t(s.x2) + ' months, ' + t(money(s.c2)) + '.'; },
      eq: 'the total paid, ' + t('C') + ', after ' + t('n') + ' months', ask: function (s) { return 'After how many months will a member have paid ' + t(money(s.budget)) + ' in total?'; }, ansU: 'months',
      mean: { rate: 'the monthly fee ($ per month)', fee: 'the one-time sign-up fee ($)', one: 'the total paid after 1 month ($)', inv: 'the months of membership for each dollar (months per $)' } }];

  HW.defineTest({
    id: 'u7test', unit: 7, title: 'Unit 7 Test', outcome: 'RF4', calc: true,
    blurb: 'The Unit 7 outcomes-based test: RF4 (representing linear relations), RF5 (intercepts, slope, domain and range), RF6 (slope–intercept, general and slope–point form and their graphs) and RF7 (writing the equation of a line), each at the BEG, PRG and MAS levels. A scientific calculator is allowed.',
    questions: [
      /* ======================= RF4 · representing linear relations ======================= */
      { num: '1', outcome: 'RF4', stem: 'Decide whether each relation is <b>linear</b> or <b>non-linear</b>.', parts: [
        { id: '1', outcome: 'RF4', level: 'BEG', make: function (r) {
          var rows = q1Rows(r), want = {}, by = {}; rows.forEach(function (x) { want[x.id] = x.lin ? 'L' : 'N'; by[x.id] = x; });
          return gridP('Choose <b>Linear</b> or <b>Non-linear</b> for each relation.', rows.map(function (x) { return { id: x.id, html: t(x.tex), label: x.id }; }),
            [{ id: 'L', html: 'Linear', label: 'Linear' }, { id: 'N', html: 'Non-linear', label: 'Non-linear' }], want,
            function (id) { return linWhy(by[id]); }, { code: 'u7t-lin-many' },
            rows.map(function (x) { return t(x.tex) + ': ' + (x.lin ? '<b>linear</b> — ' + (x.kind === 'h' ? 'a horizontal line (slope ' + t('0') + ')' : x.kind === 'gen' ? 'general form ' + t('Ax+By+C=0') + ' is a line' : 'it has the form ' + t('y=mx+b')) : '<b>non-linear</b> — ' + x.why) + '.'; }).join('<br>'),
            ['A linear relation can be written as ' + t('y=mx+b') + ' (or ' + t('Ax+By+C=0') + '): ' + t('x') + ' and ' + t('y') + ' only to the first power, no ' + t('x') + ' in a denominator, exponent or root.', 'A horizontal line ' + t('y=k') + ' is linear too.'], 'linear or not: 6 relations');
        } }] },
      { num: '2', outcome: 'RF4', shared: function (r) { return { linFirst: r.chance(0.5), m: rnz(r, -5, 5), b: r.int(-6, 9), a2: r.pick([1, -1, 2]), c: r.int(-5, 6) }; },
        stem: 'Is each relation linear? Explain how you know.', parts: [
          { id: '2a', outcome: 'RF4', level: 'BEG', make: function (r, s) { return q2Part(s, s.linFirst); } },
          { id: '2b', outcome: 'RF4', level: 'BEG', make: function (r, s) { return q2Part(s, !s.linFirst); } }] },
      { num: '3', outcome: 'RF4',
        shared: function (r) { return find(function () { return { m: r.pick([2, 3, -2, -3]), b: rnz(r, -3, 3), x0: r.pick([-2, -1]) }; }, function (s) { for (var x = s.x0; x < s.x0 + 5; x++) if (Math.abs(s.m * x + s.b) > 7) return false; return true; }, { m: 2, b: -3, x0: -1 }); },
        stem: function (s) { return 'Consider the relation ' + t(sT(lineMB(s.m, s.b))) + '.'; }, parts: [
          { id: '3a', outcome: 'RF4', level: 'BEG', make: function (r, s) {
            var xs = [0, 1, 2, 3, 4].map(function (i) { return s.x0 + i; }), ys = xs.map(function (x) { return s.m * x + s.b; }), eq = sT(lineMB(s.m, s.b));
            var p = B.fields('Complete the table of values for ' + t(eq) + '.' + tab(xs, xs.map(function () { return null; })), xs.map(function (x) { return { name: 'x = ' + x, label: t('x=' + x) + ':', before: t('y=') }; }),
              xs.map(function (x, i) { return numD(ys[i], [{ v: -s.m * x + s.b, code: 'u7t-tab-mx', hint: 'Check ' + t(s.m + '\\times ' + sgnP(x)) + ': ' + (x < 0 ? 'a negative times a ' + (s.m < 0 ? 'negative is positive' : 'positive is negative') : 'watch the sign') + '.' }, { v: s.m * x - s.b, code: 'u7t-tab-b', hint: 'Check the sign of the constant: ' + t(eq) + '.' }]); }),
              ys.map(String), xs.map(function (x, i) { return t('(' + x + ',\\ ' + ys[i] + ')'); }).join(', '),
              xs.map(function (x, i) { return t('x=' + x) + ': ' + t('y=' + s.m + '(' + x + ')' + (s.b < 0 ? '-' : '+') + Math.abs(s.b) + '=' + ys[i]); }).join('<br>'),
              ['Substitute each ' + t('x') + '-value into ' + t(eq) + '.', 'Multiply first, then add or subtract.'], 'table for ' + eq + ' from ' + s.x0);
            p.bad = [xs.map(function (x) { return String(-s.m * x + s.b); })].filter(function (b) { return b.join() !== ys.join(); });
            return p;
          } },
          { id: '3b', outcome: 'RF4', level: 'BEG', make: function (r, s) {
            var L = lineMB(s.m, s.b), eq = sT(L);
            return graphLine('Graph ' + t(eq) + ' on the grid (use your table).', L, [-5, 5], [-8, 8], [
              { L: lineMB(-s.m, s.b), code: 'graph-slope-sign', hint: 'Check the direction: the slope ' + t(s.m) + ' is ' + (s.m > 0 ? 'positive, so the line rises' : 'negative, so the line falls') + ' from left to right.' },
              { L: lineMB(s.m, -s.b), code: 'graph-int-sign', hint: 'Check the ' + t('y') + '-intercept: when ' + t('x=0') + ', ' + t('y=' + s.b) + '.' }],
              'Plot the points from the table, e.g. ' + t('(0,\\ ' + s.b + ')') + ' and ' + t('(1,\\ ' + (s.m + s.b) + ')') + ', and draw a line through them with arrows on both ends.', ['Plot two (or more) points from the table.', 'Join them with one straight line.'], 'graph ' + eq);
          } }] },
      { num: '4', outcome: 'RF4',
        shared: function (r) { return find(function () { return { s: r.pick([2, 3, 4]), p: rnz(r, -5, 5), b: r.int(-4, 8) }; }, function (v) { return gcd(v.p, v.s) === 1; }, { s: 3, p: -2, b: 6 }); },
        stem: function (s) { var xs = [-1, 0, 1, 2, 3].map(function (k) { return k * s.s; }); return 'The table shows a linear relation.' + tab(xs, xs.map(function (x) { return s.b + s.p * x / s.s; })); },
        parts: [
          { id: '4a', outcome: 'RF4', level: 'PRG', make: function (r, s) {
            var m = Q(s.p, s.s);
            return B.fields('Show that the rate of change is constant, and state it.', [{ name: 'Change in x', label: 'Change in ' + t('x') + ' each step:' }, { name: 'Change in y', label: 'Change in ' + t('y') + ' each step:' }, { name: 'Rate of change', label: 'Rate of change:', mode: 'math', keys: 'fraction' }],
              [numD(s.s, []), numD(s.p, [{ v: -s.p, code: 'u7t-diff', hint: t('y') + ' goes ' + (s.p < 0 ? 'down' : 'up') + ' each step, so the change is ' + (s.p < 0 ? 'negative' : 'positive') + '.' }]),
                slopeD(m, [{ v: s.p, code: 'rate-step', hint: 'Rate of change = change in ' + t('y') + ' ÷ change in ' + t('x') + ': divide by the step ' + t(s.s) + '.' }])],
              [String(s.s), String(s.p), qT(m)], 'every step: ' + t('\\Delta x=' + s.s) + ', ' + t('\\Delta y=' + s.p) + '; rate ' + t(qT(m)),
              'Every time ' + t('x') + ' increases by ' + t(s.s) + ', ' + t('y') + ' ' + (s.p < 0 ? 'decreases by ' + t(-s.p) : 'increases by ' + t(s.p)) + ' — the same each time.<br>Rate of change ' + t('=\\dfrac{' + s.p + '}{' + s.s + '}=' + qT(m)) + '.',
              ['Look at how much ' + t('x') + ' goes up each step — it isn’t ' + t('1') + '.', 'Rate of change = change in ' + t('y') + ' ÷ change in ' + t('x') + '.'], 'rate of change, step ' + s.s);
          } },
          { id: '4b', outcome: 'RF4', level: 'PRG', make: function (r, s) {
            var m = Q(s.p, s.s), L = lineMB(m, s.b);
            return lineP('Write an equation for the relation.', L, { wrong: [{ is: lineMB(s.p, s.b), code: 'rate-step', hint: 'The slope is the change in ' + t('y') + ' for an increase of ' + t('1') + ' in ' + t('x') + ': divide by the step ' + t(s.s) + '.' }, { is: lineMB(m, s.b - s.p), code: 'u7t-b-first', hint: t('b') + ' is the value of ' + t('y') + ' when ' + t('x=0') + ' — not the first value in the table.' }] },
              'Slope ' + t('m=' + qT(m)) + ' (from (a)); ' + t('b=' + s.b) + ', the value of ' + t('y') + ' when ' + t('x=0') + '.<br>' + t(sT(L)) + ' (or ' + t(gT(L)) + ')',
              ['Use the rate of change as ' + t('m') + '.', 'Read ' + t('b') + ' from the table: the ' + t('y') + '-value when ' + t('x=0') + '.'], 'equation from table');
          } },
          { id: '4c', outcome: 'RF4', level: 'PRG', make: function (r, s) {
            var d = s.p < 0 ? 'down' : 'up', o = s.p < 0 ? 'up' : 'down', P = Math.abs(s.p), y0 = s.b - s.p;
            return B.mc(r, 'Which describes the relation in words?', [
              { html: t('y') + ' starts at ' + t(s.b) + ' when ' + t('x=0') + ', and goes ' + d + ' ' + t(P) + ' every time ' + t('x') + ' goes up ' + t(s.s) + '.', right: true },
              { html: t('y') + ' starts at ' + t(s.b) + ' when ' + t('x=0') + ', and goes ' + d + ' ' + t(s.s) + ' every time ' + t('x') + ' goes up ' + t(P) + '.', why: 'Rise and run are swapped: look at the table — each step, ' + t('x') + ' goes up ' + t(s.s) + ' and ' + t('y') + ' changes by ' + t(P) + '.' },
              { html: t('y') + ' starts at ' + t(s.b) + ' when ' + t('x=0') + ', and goes ' + o + ' ' + t(P) + ' every time ' + t('x') + ' goes up ' + t(s.s) + '.', why: 'Check the direction: as ' + t('x') + ' increases, the ' + t('y') + '-values go <b>' + d + '</b>.' },
              { html: t('y') + ' starts at ' + t(y0) + ', and goes ' + d + ' ' + t(P) + ' every time ' + t('x') + ' goes up ' + t('1') + '.', why: t(y0) + ' is the ' + t('y') + '-value when ' + t('x=' + (-s.s)) + ', and ' + t('x') + ' goes up by ' + t(s.s) + ' each step, not by ' + t('1') + '.' }],
              t('y') + ' starts at ' + t(s.b) + ' when ' + t('x=0') + ' (the ' + t('y') + '-intercept) and goes ' + d + ' ' + t(P) + ' every time ' + t('x') + ' goes up ' + t(s.s) + ' (the rate of change ' + t(qT(Q(s.p, s.s))) + ').',
              ['Where does the relation start (at ' + t('x=0') + ')? How much does ' + t('y') + ' change for each step in ' + t('x') + '?'], 'describe the table in words');
          } }] },
      { num: '5', outcome: 'RF4',
        shared: function (r) {
          var tpl = r.int(0, 2), a = r.int(2, 5), k = r.int(1, 9), m = tpl === 2 ? -a : a, bb = tpl === 1 ? -k : k, qx = rnz(r, -8, 8);
          if (Math.abs(qx) < 4) qx = qx < 0 ? qx - 3 : qx + 3;
          var on = r.chance(0.5), y0 = m * qx + bb + (on ? 0 : r.pick([-2, -1, 1, 2]));
          return { tpl: tpl, a: a, k: k, m: m, bb: bb, x0: r.pick([-2, -1]), qx: qx, on: on, y0: y0 };
        },
        stem: function (s) { return 'A linear relation is described in words: <i>“Each output is ' + (s.tpl === 0 ? s.k + ' more than ' + word(s.a) + ' the input' : s.tpl === 1 ? s.k + ' less than ' + word(s.a) + ' the input' : s.k + ' minus ' + word(s.a) + ' the input') + '.”</i>'; },
        parts: [
          { id: '5a', outcome: 'RF4', level: 'PRG', make: function (r, s) {
            var L = lineMB(s.m, s.bb), W = s.tpl === 0 ? { is: lineMB(s.a, s.a * s.k), code: 'u7t-words-group', hint: 'Only the input is multiplied by ' + t(s.a) + '; then add ' + t(s.k) + ': ' + t('y=' + s.a + 'x+' + s.k) + '.' } :
              { is: lineMB(-s.m, -s.bb), code: 'u7t-words-order', hint: s.tpl === 1 ? '“' + s.k + ' less than ' + word(s.a) + ' the input” starts with ' + t(s.a + 'x') + ' and takes ' + t(s.k) + ' away: ' + t(s.a + 'x-' + s.k) + '.' : '“' + s.k + ' minus ' + word(s.a) + ' the input” starts with ' + t(s.k) + ' and takes ' + t(s.a + 'x') + ' away: ' + t(s.k + '-' + s.a + 'x') + '.' };
            return lineP('Write an equation for the relation (use ' + t('x') + ' for the input and ' + t('y') + ' for the output).', L, { wrong: [W] },
              (s.tpl === 0 ? word(s.a).replace(/^./, function (c) { return c.toUpperCase(); }) + ' the input is ' + t(s.a + 'x') + '; ' + s.k + ' more: ' : s.tpl === 1 ? word(s.a).replace(/^./, function (c) { return c.toUpperCase(); }) + ' the input is ' + t(s.a + 'x') + '; ' + s.k + ' less: ' : 'Start with ' + t(s.k) + ' and subtract ' + t(s.a + 'x') + ': ') +
                t('y=' + (s.tpl === 2 ? s.k + '-' + s.a + 'x' : s.a + 'x' + (s.tpl === 1 ? '-' : '+') + s.k)) + (s.tpl === 2 ? ' (or ' + t(sT(L)) + ')' : ''),
              ['“' + word(s.a).replace(/ the input/, '') + ' the input” means ' + t(s.a + 'x') + '.', 'Write the words in order: what is added to or taken away from what?'], 'words to equation ' + s.tpl);
          } },
          { id: '5b', outcome: 'RF4', level: 'PRG', make: function (r, s) {
            var xs = [0, 1, 2, 3].map(function (i) { return s.x0 + i; }), prs = xs.map(function (x) { return [x, s.m * x + s.bb]; });
            var p = B.pairs('Write the relation as a set of ordered pairs, using ' + t('x=' + xs.join(',\\ ')) + '.', prs, {}, xs.map(function (x) { return t('x=' + x) + ': ' + t('y=' + (s.tpl === 2 ? s.k + '-' + s.a + '(' + x + ')' : s.a + '(' + x + ')' + (s.tpl === 1 ? '-' : '+') + s.k) + '=' + (s.m * x + s.bb)); }).join('<br>') + '<br>' + t('\\{' + prs.map(function (p0) { return '(' + p0[0] + ',\\ ' + p0[1] + ')'; }).join(',\\ ') + '\\}'),
              ['Substitute each input into your equation from (a).', 'Each pair is (input, output).'], 'ordered pairs from ' + s.x0);
            p.bad = ['\\{' + prs.map(function (p0) { return '(' + p0[1] + ', ' + p0[0] + ')'; }).join(', ') + '\\}'];
            return p;
          } },
          { id: '5c', outcome: 'RF4', level: 'PRG', make: function (r, s) {
            var val = s.m * s.qx + s.bb, P0 = t('(' + s.qx + ',\\ ' + s.y0 + ')'), sub = s.tpl === 2 ? s.k + '-' + s.a + '(' + s.qx + ')' : s.a + '(' + s.qx + ')' + (s.tpl === 1 ? '-' : '+') + s.k;
            var p = B.fields('Is ' + P0 + ' part of the relation? Find the output for the input ' + t(s.qx) + ', then decide.', [{ name: 'Output', label: 'Output when ' + t('x=' + s.qx) + ':' }, { name: 'Part of the relation?', label: 'Is ' + P0 + ' part of the relation? (yes or no)', mode: 'text', placeholder: 'yes/no' }],
              [numD(val, [{ v: -s.m * s.qx + s.bb, code: 'u7t-sub-sign', hint: 'Check the sign: ' + t(s.a + '\\times ' + sgnP(s.qx)) + (s.tpl === 2 ? ' is subtracted' : '') + '.' }]), ynChk(s.on ? 'yes' : 'no', 'u7t-onpt-decide', 'The output for ' + t('x=' + s.qx) + ' is ' + t(val) + (s.on ? ', which matches' : ', but the point has ' + t('y=' + s.y0)) + '.')],
              [String(val), s.on ? 'yes' : 'no'], t(sub + '=' + val) + ' — <b>' + (s.on ? 'yes' : 'no') + '</b>',
              t(sub + '=' + val) + '. ' + (s.on ? 'That matches ' + t('y=' + s.y0) + ', so <b>yes</b>, ' + P0 + ' is part of the relation.' : t(val + '\\ne ' + s.y0) + ', so <b>no</b>, ' + P0 + ' is not part of the relation.'),
              ['Substitute ' + t('x=' + s.qx) + ' into your equation.', 'The point is part of the relation only if the output is exactly ' + t(s.y0) + '.'], 'is point on relation');
            p.bad = [[String(val), s.on ? 'no' : 'yes']];
            return p;
          } }] },
      { num: '6', outcome: 'RF4',
        shared: function (r) {
          var c = r.pick(GROW), S = r.pick(c.starts), R = r.pick(c.rates), Wk = r.int(c.W[0], c.W[1]);
          return { c: c, S: S, R: R, W: Wk, T: S + R * Wk, name: r.pick(NAMES) };
        },
        stem: function (s) { return s.c.intro(s); },
        parts: [
          { id: '6a', outcome: 'RF4', level: 'MAS', make: function (r, s) {
            var c = s.c, ks = [0, 1, 2, 3, 4], vs = ks.map(function (k) { return s.S + s.R * k; });
            return B.fields('Complete the table for the first four ' + c.xs + 's.' + tab(ks, ks.map(function () { return null; }), t(c.x) + ' (' + c.xp + ')', t(c.y) + ' (' + c.yu + ')'),
              ks.map(function (k) { return { name: c.x + ' = ' + k, label: t(c.x + '=' + k) + ':', before: t(c.y + '=' + (c.money ? '\\$' : '')), after: c.money ? '' : c.yu }; }),
              ks.map(function (k, i) { return numD(vs[i], [{ v: s.R * k, code: 'u7t-ctx-nostart', hint: 'Don’t forget the starting ' + c.what + ', ' + t(c.fmt(s.S)) + '.' }]); }),
              vs.map(function (v) { return num(v); }), vs.map(function (v) { return t(c.fmt(v)); }).join(', '),
              'Start at ' + t(c.fmt(s.S)) + ' and add ' + t(c.fmt(s.R)) + ' each ' + c.xs + ': ' + vs.map(function (v) { return t(c.fmt(v)); }).join(', ') + '.',
              ['At ' + t(c.x + '=0') + ' the ' + c.what + ' is the starting value.', 'Add the same amount each ' + c.xs + '.'], 'context table ' + c.y);
          } },
          { id: '6b', outcome: 'RF4', level: 'MAS', make: function (r, s) {
            var c = s.c;
            var p = B.fields('Explain why the relation between ' + t(c.x) + ' and ' + t(c.y) + ' is linear: by how much does ' + t(c.y) + ' change each ' + c.xs + ', and is that change always the same?',
              [{ name: 'Change', label: 'Change in ' + t(c.y) + ' each ' + c.xs + ':', before: c.money ? t('\\$') : '', after: c.money ? '' : c.yu }, { name: 'Always the same?', label: 'Is that change the same every ' + c.xs + '? (yes or no)', mode: 'text', placeholder: 'yes/no' }],
              [numD(s.R, [{ v: s.S, code: 'u7t-ctx-swap', hint: 'That’s the starting ' + c.what + '. How much is added each ' + c.xs + '?' }]), ynChk('yes', 'u7t-lin-decide', 'Every ' + c.xs + ' the ' + c.what + ' goes up by the same ' + t(c.fmt(s.R)) + ': a <b>constant</b> rate of change — that is what makes it linear.')],
              [num(s.R), 'yes'], t('+' + c.fmt(s.R)) + ' every ' + c.xs + ', always the same',
              'The ' + c.what + ' changes at a <b>constant rate</b>, ' + t('+' + c.fmt(s.R)) + ' every ' + c.xs + ', so equal changes in ' + t(c.x) + ' always give equal changes in ' + t(c.y) + ': the relation is linear.',
              ['Look at the differences in your table.', 'A linear relation has a constant rate of change.'], 'why linear ' + c.y);
            p.bad = [[num(s.R), 'no']];
            return p;
          } },
          { id: '6c', outcome: 'RF4', level: 'MAS', make: function (r, s) {
            var c = s.c, vars = [c.x, c.y], L = lineMB(s.R, s.S);
            return lineP('Write an equation for ' + t(c.y) + ' in terms of ' + t(c.x) + '.', L, { vars: vars, placeholder: 'e.g. ' + c.y + ' = 2' + c.x + ' + 3', wrong: [{ is: lineMB(s.S, s.R), code: 'u7t-ctx-swap', hint: 'The rate (' + t(c.fmt(s.R)) + ' each ' + c.xs + ') multiplies ' + t(c.x) + '; the starting value is the constant.' }, { is: lineMB(s.R, 0), code: 'u7t-ctx-nostart', hint: 'Add the starting ' + c.what + ', ' + t(c.fmt(s.S)) + '.' }] },
              'Rate of change ' + t(num(s.R)) + ' per ' + c.xs + ' (the slope), starting value ' + t(num(s.S)) + ' (when ' + t(c.x + '=0') + '):<br>' + t(c.y + '=' + num(s.R) + c.x + '+' + num(s.S)),
              ['The slope is the change each ' + c.xs + '; the constant is the value at ' + t(c.x + '=0') + '.'], 'context equation ' + c.y);
          } },
          { id: '6d', outcome: 'RF4', level: 'MAS', make: function (r, s) {
            var c = s.c;
            return B.number(c.ask(s), s.W, function (v) {
              if (near(v, s.T / s.R)) return { code: 'u7t-ctx-nostart', hint: 'Subtract the starting value first: ' + t(num(s.T) + '-' + num(s.S)) + '.' };
              if (near(v, (s.T + s.S) / s.R)) return { code: 'u7t-ctx-sign', hint: 'To undo “+' + num(s.S) + '”, subtract ' + t(num(s.S)) + ' from both sides.' };
              if (near(v, s.S + s.R * s.T)) return { code: 'u7t-ctx-eval', hint: 'You substituted ' + t(num(s.T)) + ' for ' + t(c.x) + '. Here ' + t(c.y + '=' + num(s.T)) + ': solve for ' + t(c.x) + '.' };
              return null;
            }, t(num(s.T) + '=' + num(s.R) + c.x + '+' + num(s.S)) + '<br>' + t(num(s.R) + c.x + '=' + num(s.T - s.S)) + '<br>' + t(c.x + '=' + s.W) + ' — after <b>' + s.W + ' ' + c.xp.replace(/^min$/, 'minutes') + '</b>.',
              ['Set ' + t(c.y + '=' + num(s.T)) + ' in your equation.', 'Subtract the starting value, then divide by the rate.'], 'solve context ' + c.y, { after: c.xp.replace(/^min$/, 'minutes') });
          } }] },
      { num: '7', outcome: 'RF4',
        shared: function (r) {
          return find(function () {
            var m = Q(r.pick([[2, 1], [3, 1], [-2, 1], [-3, 1], [4, 1], [-4, 1], [1, 2], [-1, 2], [3, 2], [-3, 2]]));
            var st = m[1] === 1 ? r.pick([[2, 1, 4], [1, 3, 2], [3, 1, 2], [2, 3, 1], [1, 2, 4], [4, 1, 3], [3, 2, 1]]) : r.pick([[6, 2, 6], [2, 4, 2], [4, 2, 6], [2, 6, 4], [4, 6, 2]]);
            var x0 = m[1] === 1 ? r.int(-4, 2) : r.pick([-4, -2, 0, 2]), b = r.int(-6, 8), xs = [x0, x0 + st[0], x0 + st[0] + st[1], x0 + st[0] + st[1] + st[2]];
            return { m: m, b: b, xs: xs, ys: xs.map(function (x) { return qv(m) * x + b; }), name: r.pick(NAMES) };
          }, function (s) { return s.ys.every(function (y) { return Number.isInteger(y) && Math.abs(y) <= 25; }); }, { m: [3, 1], b: -1, xs: [0, 2, 3, 7], ys: [-1, 5, 8, 20], name: 'Jordan' });
        },
        stem: function (s) { var ds = [0, 1, 2].map(function (i) { return Math.abs(s.ys[i + 1] - s.ys[i]); }); return s.name + ' says the relation in this table is <b>not</b> linear, because the ' + t('y') + '-values go ' + (qv(s.m) > 0 ? 'up' : 'down') + ' by different amounts (' + t(ds[0]) + ', then ' + t(ds[1]) + ', then ' + t(ds[2]) + ').' + tab(s.xs, s.ys); },
        parts: [
          { id: '7a', outcome: 'RF4', level: 'MAS', make: function (r, s) {
            var xs = s.xs, ys = s.ys;
            var p = B.fields('Is ' + s.name + ' correct? Find the rate of change ' + t('\\frac{\\Delta y}{\\Delta x}') + ' between each pair of neighbouring points, then decide.',
              [0, 1, 2].map(function (i) { return { name: 'Rate ' + (i + 1), label: 'Rate from ' + t('x=' + xs[i]) + ' to ' + t('x=' + xs[i + 1]) + ':', mode: 'math', keys: 'fraction' }; }).concat([{ name: s.name + ' correct?', label: 'Is ' + s.name + ' correct? (yes or no)', mode: 'text', placeholder: 'yes/no' }]),
              [0, 1, 2].map(function (i) { return slopeD(s.m, [{ v: ys[i + 1] - ys[i], code: 'rate-step', hint: 'Divide the change in ' + t('y') + ' by the change in ' + t('x') + ' (here ' + t(xs[i + 1] - xs[i]) + ').' }]); }).concat([ynChk('no', 'u7t-claim', 'The steps in ' + t('x') + ' are not equal, so different changes in ' + t('y') + ' don’t prove anything. The <b>rates</b> are all ' + t(qT(s.m)) + ', so the relation is linear and ' + s.name + ' is wrong.')]),
              [qT(s.m), qT(s.m), qT(s.m), 'no'], 'every rate is ' + t(qT(s.m)) + ': <b>no</b>, ' + s.name + ' is not correct',
              '<b>No.</b> The steps in ' + t('x') + ' are not equal (' + t([0, 1, 2].map(function (i) { return xs[i + 1] - xs[i]; }).join(',\\ ')) + '), so compare <b>rates</b>: ' + [0, 1, 2].map(function (i) { return t('\\frac{' + (ys[i + 1] - ys[i]) + '}{' + (xs[i + 1] - xs[i]) + '}=' + qT(s.m)); }).join(', ') + '.<br>The rate of change is always ' + t(qT(s.m)) + ', so the relation <b>is</b> linear.',
              ['The steps in ' + t('x') + ' are not all the same — so divide each change in ' + t('y') + ' by its change in ' + t('x') + '.'], 'uneven table rates');
            p.bad = [[0, 1, 2].map(function (i) { return String(ys[i + 1] - ys[i]); }).concat(['yes']), [qT(s.m), qT(s.m), qT(s.m), 'yes']];
            return p;
          } },
          { id: '7b', outcome: 'RF4', level: 'MAS', make: function (r, s) {
            var L = lineMB(s.m, s.b), W = s.xs[0] !== 0 ? [{ is: lineMB(s.m, s.ys[0]), code: 'u7t-b-first', hint: t('b') + ' is the value of ' + t('y') + ' when ' + t('x=0') + ', and the table doesn’t start at ' + t('x=0') + '. Substitute a point to find ' + t('b') + '.' }] : [];
            return lineP('The relation is linear. Write its equation.', L, { wrong: W },
              t('m=' + qT(s.m)) + '. ' + (s.xs[0] === 0 ? 'At ' + t('x=0') + ', ' + t('y=' + s.b) + ', so ' + t('b=' + s.b) + '.' : 'Substitute ' + t(ptT([s.xs[0], s.ys[0]])) + ': ' + t(s.ys[0] + '=' + qT(s.m) + '(' + s.xs[0] + ')+b') + ', so ' + t('b=' + s.b) + '.') + '<br>' + t(sT(L)),
              ['Use the rate as the slope.', 'Substitute one point into ' + t('y=mx+b') + ' to find ' + t('b') + '.'], 'equation from uneven table');
          } }] },

      /* ======================= RF5 · characteristics of linear graphs ======================= */
      { num: '8', outcome: 'RF5', shared: function (r) { return q8Shared(r, 1); }, stem: function (s) { return 'Use the graph to state each value.' + lineFig([lineMB(s.m, s.b)], [-6, 6], [-6, 6]); }, parts: [
        { id: '8', outcome: 'RF5', level: 'BEG', make: function (r, s) { return q8Part(s); } }] },
      { num: '9', outcome: 'RF5', shared: function (r) { return q8Shared(r, -1); }, stem: function (s) { return 'Use the graph to state each value.' + lineFig([lineMB(s.m, s.b)], [-6, 6], [-6, 6]); }, parts: [
        { id: '9', outcome: 'RF5', level: 'BEG', make: function (r, s) { return q8Part(s); } }] },
      { num: '10', outcome: 'RF5', shared: function (r) { return { vert: r.chance(0.5), k: rnz(r, -5, 5) }; },
        stem: function (s) { return 'Use the graph to state each value. Write <b>none</b> if there isn’t one.' + lineFig([s.vert ? L3(1, 0, -s.k) : L3(0, 1, -s.k)], [-6, 6], [-6, 6]); }, parts: [
          { id: '10', outcome: 'RF5', level: 'BEG', make: function (r, s) {
            var k = s.k, xi = s.vert ? [k, 1] : null, yi = s.vert ? null : [k, 1], m = s.vert ? null : 0;
            var p = B.fields('State the ' + t('x') + '-intercept, the ' + t('y') + '-intercept and the slope of the line. Write <b>none</b> if there isn’t one.',
              [{ name: 'x-intercept', label: t('x') + '-intercept:', mode: 'math', keys: 'slope', none: true, placeholder: 'number or none' }, { name: 'y-intercept', label: t('y') + '-intercept:', mode: 'math', keys: 'slope', none: true, placeholder: 'number or none' }, { name: 'slope', label: 'Slope:', mode: 'math', keys: 'slope', none: true }],
              [icChk(xi, 'x', yi), icChk(yi, 'y', xi), K.slope(m == null ? null : [0, 1])], [xi ? String(k) : 'none', yi ? String(k) : 'none', s.vert ? 'undefined' : '0'],
              s.vert ? t('x') + '-intercept ' + t(k) + '; no ' + t('y') + '-intercept; slope undefined' : 'no ' + t('x') + '-intercept; ' + t('y') + '-intercept ' + t(k) + '; slope ' + t('0'),
              s.vert ? 'The line is <b>vertical</b>: ' + t('x=' + k) + '. It crosses the ' + t('x') + '-axis at ' + t('(' + k + ',\\ 0)') + ', so the ' + t('x') + '-intercept is ' + t(k) + '. It is parallel to the ' + t('y') + '-axis, so there is <b>no</b> ' + t('y') + '-intercept. The run is ' + t('0') + ', so the slope is <b>undefined</b>.'
                : 'The line is <b>horizontal</b>: ' + t('y=' + k) + '. It crosses the ' + t('y') + '-axis at ' + t('(0,\\ ' + k + ')') + ', so the ' + t('y') + '-intercept is ' + t(k) + '. It is parallel to the ' + t('x') + '-axis, so there is <b>no</b> ' + t('x') + '-intercept. The rise is ' + t('0') + ', so the slope is ' + t('0') + '.',
              ['Which axis does the line cross? Which axis is it parallel to?', 'A horizontal line has slope ' + t('0') + '; a vertical line’s slope is undefined (type <b>undefined</b>).'], (s.vert ? 'vertical' : 'horizontal') + ' line intercepts');
            p.input.fields[2].placeholder = 'number or undefined';
            p.bad = s.vert ? [['none', String(k), '0'], [String(k), 'none', '0']] : [[String(k), String(k), '0'], ['none', String(k), 'undefined']];
            return p;
          } }] },
      { num: '11', outcome: 'RF5', stem: 'Determine the ' + t('x') + '-intercept and the ' + t('y') + '-intercept <b>algebraically</b>.', parts: [
        { id: '11a', outcome: 'RF5', level: 'PRG', make: function (r) {
          var v = find(function () { var q = r.int(2, 5), p = r.int(1, 5), sg = r.pick([1, -1]), j = rnz(r, -4, 4); return { m: Q(sg * p, q), b: p * j, X: -sg * q * j }; }, function (v) { return gcd(v.m[0], v.m[1]) === 1 && Math.abs(v.m[0]) !== v.m[1] && Math.abs(v.b) >= 2 && Math.abs(v.b) <= 12 && Math.abs(v.X) <= 20; }, { m: [-2, 5], b: 6, X: 15 });
          var L = lineMB(v.m, v.b), eq = sT(L), mT = qT(v.m);
          return icPart('Determine the intercepts of ' + t(eq) + '.', v.X, v.b, [{ v: qm(qn(v.m), v.b), code: 'u7t-xint-mult', hint: 'To undo multiplying by ' + t(mT) + ', <b>divide</b> by it (multiply by its reciprocal).' }], [],
            t('y') + '-intercept: let ' + t('x=0') + ': ' + t('y=' + v.b) + '.<br>' + t('x') + '-intercept: let ' + t('y=0') + ': ' + t('0=' + eq.replace(/^y=/, '')) + ', so ' + t(pol([[v.m, 'x']]) + '=' + (-v.b)) + ' and ' + t('x=' + (-v.b) + '\\div\\left(' + mT + '\\right)=' + v.X) + '.',
            ['For the ' + t('y') + '-intercept, let ' + t('x=0') + '; for the ' + t('x') + '-intercept, let ' + t('y=0') + ' and solve.'], 'intercepts of ' + eq);
        } },
        { id: '11b', outcome: 'RF5', level: 'PRG', make: function (r) {
          var v = find(function () { var a = rnz(r, -8, 8), c = rnz(r, -10, 10); return { a: a, c: c, L: L3(c, a, -a * c) }; }, function (v) { return Math.abs(v.a) >= 2 && Math.abs(v.c) >= 2 && Math.abs(v.a) !== Math.abs(v.c) && Math.abs(v.L.A) >= 2 && Math.abs(v.L.B) >= 2 && v.L.A <= 9 && Math.abs(v.L.B) <= 9; }, { a: -4, c: 10, L: L3(5, -2, 20) });
          var L = v.L, xi = xint(L), yi = yint(L), eq = gT(L);
          return icPart('Determine the intercepts of ' + t(eq) + '.', qv(xi), qv(yi), [{ v: Q(L.C, L.A), code: 'u7t-icpt-sign', hint: 'Move the constant to the other side: it changes sign. ' + t(pol([[L.A, 'x']]) + '=' + (-L.C)) + '.' }], [{ v: Q(L.C, L.B), code: 'u7t-icpt-sign', hint: 'Move the constant to the other side: it changes sign. ' + t(pol([[L.B, 'y']]) + '=' + (-L.C)) + '.' }],
            t('x') + '-intercept: let ' + t('y=0') + ': ' + t(pol([[L.A, 'x'], [L.C, '']]) + '=0') + ', so ' + t('x=' + qT(xi)) + '.<br>' + t('y') + '-intercept: let ' + t('x=0') + ': ' + t(pol([[L.B, 'y'], [L.C, '']]) + '=0') + ', so ' + t('y=' + qT(yi)) + '.',
            ['For the ' + t('x') + '-intercept, let ' + t('y=0') + '; for the ' + t('y') + '-intercept, let ' + t('x=0') + '.'], 'intercepts of ' + eq);
        } }] },
      { num: '12', outcome: 'RF5',
        shared: function (r) {
          return find(function () {
            var mq = r.pick([[1, 2], [2, 3], [3, 2], [1, 3], [3, 4], [1, 1], [2, 1]]), m = Q(r.pick([1, -1]) * mq[0], mq[1]), b = r.int(-3, 3), q = mq[1];
            var x1 = -q * r.int(1, Math.max(1, Math.floor(6 / q))), x2 = q * r.int(1, Math.max(1, Math.floor(7 / q)));
            var P1 = [x1, b + qv(m) * x1], P2 = [x2, b + qv(m) * x2];
            return { m: m, b: b, P1: P1, P2: P2, open: r.chance(0.5) ? 1 : 2 };
          }, function (s) { return Math.abs(s.P1[1]) <= 7 && Math.abs(s.P2[1]) <= 7 && s.P1[1] !== s.P2[1] && s.P2[0] - s.P1[0] >= 5; }, { m: [-1, 2], b: 3, P1: [-4, 5], P2: [6, 0], open: 2 });
        },
        stem: function (s) {
          var xr = [Math.min(s.P1[0], 0) - 1, Math.max(s.P2[0], 0) + 1], yr = [Math.min(s.P1[1], s.P2[1], 0) - 1, Math.max(s.P1[1], s.P2[1], 0) + 1];
          return 'The graph shows a line segment. One endpoint is closed and one is open.' + '<div class="fig">' + HW.graph({ x: xr, y: yr, grid: 1, labels: 2, max: 300, aria: 'a line segment with one open and one closed endpoint', segs: [{ pts: [s.P1, s.P2], start: s.open === 1 ? 'open' : 'closed', end: s.open === 2 ? 'open' : 'closed' }] }) + '</div>';
        },
        parts: [
          { id: '12a', outcome: 'RF5', level: 'PRG', make: function (r, s) {
            var c1 = s.open !== 1, c2 = s.open !== 2, lo = s.P1, hi = s.P2;
            var dom = '\\{x\\mid ' + lo[0] + (c1 ? '\\le ' : '<') + 'x' + (c2 ? '\\le ' : '<') + hi[0] + ',\\ x\\in\\mathbb{R}\\}';
            var yLo = lo[1] < hi[1] ? lo : hi, yHi = lo[1] < hi[1] ? hi : lo, cl = function (P) { return P === lo ? c1 : c2; };
            var ran = '\\{y\\mid ' + yLo[1] + (cl(yLo) ? '\\le ' : '<') + 'y' + (cl(yHi) ? '\\le ' : '<') + yHi[1] + ',\\ y\\in\\mathbb{R}\\}';
            var p = B.fields('State the domain and the range, in set notation.', [{ name: 'Domain', label: 'Domain:', mode: 'math', keys: 'set', vars: ['x', 'y'], placeholder: 'e.g. {x | -2 <= x < 5, x in R}' }, { name: 'Range', label: 'Range:', mode: 'math', keys: 'set', vars: ['x', 'y'], placeholder: 'e.g. {y | -2 <= y < 5, y in R}' }],
              [K.set(dom, { other: ran, otherName: 'range', v: 'x' }), K.set(ran, { other: dom, otherName: 'domain', v: 'y' })], [dom, ran], 'D: ' + t(dom) + '<br>R: ' + t(ran),
              'The segment runs from ' + t('x=' + lo[0]) + ' to ' + t('x=' + hi[0]) + ' and from ' + t('y=' + yLo[1]) + ' to ' + t('y=' + yHi[1]) + '. The open endpoint ' + t(ptT(s.open === 1 ? lo : hi)) + ' is <b>not</b> included (use ' + t('<') + '); the closed one is (use ' + t('\\le') + ').<br>' + t('D=' + dom) + '<br>' + t('R=' + ran),
              ['Domain: from the leftmost to the rightmost ' + t('x') + '-value. Range: from the lowest to the highest ' + t('y') + '-value.', 'An open dot means that value is not included.'], 'segment domain & range');
            p.bad = [[dom.replace(/\\le /g, '<'), ran.replace(/\\le /g, '<')], [ran.replace(/y/g, 'x'), dom.replace(/x/g, 'y')]].filter(function (bd, i) { return i === 0 || ran.replace(/y/g, 'x') !== dom; });
            return p;
          } },
          { id: '12b', outcome: 'RF5', level: 'PRG', make: function (r, s) {
            var m = s.m, P1 = s.P1, P2 = s.P2;
            var p = B.fields('Determine the slope and the ' + t('y') + '-intercept of the segment.', [{ name: 'Slope', label: 'Slope:', mode: 'math', keys: 'fraction' }, { name: 'y-intercept', label: t('y') + '-intercept:', mode: 'math', keys: 'fraction' }],
              [K.slope(m, { graph: true }), icChk([s.b, 1], 'y', null, [])], [qT(m), String(s.b)], t('m=' + qT(m)) + ', ' + t('y') + '-intercept ' + t(s.b),
              slopeSteps(P1, P2) + '<br>' + t('y') + '-intercept: from ' + t(ptT(P1)) + ' move ' + t(-P1[0]) + ' right to ' + t('x=0') + ': ' + t('y=' + P1[1] + (qv(m) * -P1[0] >= 0 ? '+' : '') + qT(qm(m, -P1[0])) + '=' + s.b) + '.',
              ['Slope = rise ÷ run between the two endpoints.', 'The ' + t('y') + '-intercept is where the segment crosses the ' + t('y') + '-axis.'], 'segment slope & y-int');
            p.bad = [[qT(qn(m)), String(s.b)]].concat(s.b ? [[qT(m), String(-s.b)]] : []);
            return p;
          } }] },
      { num: '13', outcome: 'RF5',
        shared: function (r) { var c = r.pick(DRAIN), pr = r.pick(c.pairs), T = r.int(pr[1][0], pr[1][1]); return { c: c, r: pr[0], T: T, V0: pr[0] * T }; },
        stem: function (s) { return s.c.intro(s); },
        parts: [
          { id: '13a', outcome: 'RF5', level: 'MAS', make: function (r, s) {
            var c = s.c, Y = c.y;
            var p = B.fields('Determine both intercepts and the slope.', [{ name: Y + '-intercept', label: t(Y) + '-intercept:' }, { name: 't-intercept', label: t('t') + '-intercept:' }, { name: 'Slope', label: 'Slope:' }],
              [numD(s.V0, [{ v: s.T, code: 'u7t-icpt-swap', hint: 'That’s the ' + t('t') + '-intercept. The ' + t(Y) + '-intercept is the value of ' + t(Y) + ' when ' + t('t=0') + '.' }]),
                numD(s.T, [{ v: s.V0, code: 'u7t-icpt-swap', hint: 'That’s the ' + t(Y) + '-intercept. The ' + t('t') + '-intercept is the value of ' + t('t') + ' when ' + t(Y + '=0') + '.' }, { v: s.V0 * s.r, code: 'u7t-tint-mult', hint: 'Solve ' + t('0=' + F(s.V0) + '-' + s.r + 't') + ': ' + t(s.r + 't=' + F(s.V0)) + ', so <b>divide</b> by ' + t(s.r) + '.' }, { v: -s.T, code: 'u7t-icpt-sign', hint: 'Time can’t be negative here: check the sign.' }]),
                numD(-s.r, [{ v: s.r, code: 'slope-sign', hint: 'The ' + c.yname + ' goes <b>down</b> as time goes on, so the slope is negative.' }])],
              [String(s.V0), String(s.T), String(-s.r)], t(Y) + '-int ' + t(F(s.V0)) + ', ' + t('t') + '-int ' + t(s.T) + ', slope ' + t(-s.r),
              t(Y) + '-intercept: let ' + t('t=0') + ': ' + t(Y + '=' + F(s.V0)) + '.<br>' + t('t') + '-intercept: let ' + t(Y + '=0') + ': ' + t('0=' + F(s.V0) + '-' + s.r + 't') + ', so ' + t('t=' + F(s.V0) + '\\div ' + s.r + '=' + s.T) + '.<br>Slope: the coefficient of ' + t('t') + ', ' + t(-s.r) + '.',
              ['Let ' + t('t=0') + ' for one intercept and ' + t(Y + '=0') + ' for the other.', 'The slope is the number multiplying ' + t('t') + ' (with its sign).'], 'context intercepts ' + Y);
            p.bad = [[String(s.T), String(s.V0), String(-s.r)], [String(s.V0), String(s.T), String(s.r)]];
            return p;
          } },
          { id: '13b', outcome: 'RF5', level: 'MAS', make: function (r, s) {
            var c = s.c, Y = c.y, M = c.mean, cols = r.shuffle([{ id: 'start', html: M.start, label: 'start' }, { id: 'end', html: M.end, label: 'end' }, { id: 'rate', html: M.rate, label: 'rate' }, { id: 'inv', html: M.inv, label: 'inverse' }]);
            var rows = [{ id: 'yi', html: t(Y) + '-intercept, ' + t(F(s.V0)), label: Y + '-int' }, { id: 'ti', html: t('t') + '-intercept, ' + t(s.T), label: 't-int' }, { id: 'm', html: 'slope, ' + t(-s.r), label: 'slope' }];
            var want = { yi: 'start', ti: 'end', m: 'rate' }, txt = { yi: M.start, ti: M.end, m: M.rate };
            return gridP('What does each value mean here? Choose one meaning for each.', rows, cols, want,
              function (id) { return { code: 'u7t-mean-one', hint: id === 'yi' ? 'The ' + t(Y) + '-intercept is the value of ' + t(Y) + ' when ' + t('t=0') + ': ' + M.start + '.' : id === 'ti' ? 'The ' + t('t') + '-intercept is the time when ' + t(Y + '=0') + ': ' + M.end + '.' : 'A slope is (change in ' + t(Y) + ') ÷ (change in ' + t('t') + '): units of ' + t(Y) + ' per unit of ' + t('t') + '.' }; },
              { code: 'u7t-mean-many' },
              t(Y) + '-intercept ' + t(F(s.V0)) + ': ' + M.start + '.<br>' + t('t') + '-intercept ' + t(s.T) + ': ' + M.end + '.<br>Slope ' + t(-s.r) + ': ' + M.rate + ' — it goes down ' + t(s.r) + ' ' + c.unit + ' each ' + (c.tu === 'h' ? 'hour' : 'minute') + '.',
              ['An intercept is where one variable is ' + t('0') + '.', 'A slope’s units: units of ' + t(Y) + ' per unit of ' + t('t') + '.'], 'meaning of intercepts & slope ' + Y);
          } },
          { id: '13c', outcome: 'RF5', level: 'MAS', make: function (r, s) {
            var c = s.c, Y = c.y, dom = '\\{t\\mid 0\\le t\\le ' + s.T + ',\\ t\\in\\mathbb{R}\\}', ran = '\\{' + Y + '\\mid 0\\le ' + Y + '\\le ' + s.V0 + ',\\ ' + Y + '\\in\\mathbb{R}\\}';
            var p = B.fields('State the domain and range for this situation, in set notation.', [{ name: 'Domain', label: 'Domain:', mode: 'math', keys: 'set', vars: ['t', Y], placeholder: 'e.g. {t | 2 <= t < 5, t in R}' }, { name: 'Range', label: 'Range:', mode: 'math', keys: 'set', vars: ['t', Y], placeholder: 'e.g. {' + Y + ' | 2 <= ' + Y + ' < 5, ' + Y + ' in R}' }],
              [K.set(dom, { other: ran, otherName: 'range', v: 't', wrong: [{ is: '\\{t\\mid t\\in\\mathbb{R}\\}', code: 'set-values', hint: 'Time starts at ' + t('0') + ' and stops when it is empty, at ' + t('t=' + s.T) + '.' }] }), K.set(ran, { other: dom, otherName: 'domain', v: Y })], [dom, ran], 'D: ' + t(dom) + '<br>R: ' + t(ran),
              'Time runs from ' + t('t=0') + ' until it is empty at ' + t('t=' + s.T) + ': ' + t('D=' + dom) + '.<br>The ' + c.yname + ' goes from ' + t(F(s.V0)) + ' down to ' + t('0') + ': ' + t('R=' + ran) + '.',
              ['The situation starts at ' + t('t=0') + ' and ends at the ' + t('t') + '-intercept.', 'The range runs between the two intercept values.'], 'context domain & range ' + Y);
            p.bad = [[dom.replace(/\\le /g, '<'), ran], [ran, dom]];
            return p;
          } }] },
      { num: '14', outcome: 'RF5',
        shared: function (r) { return { s: r.pick([1, -1]), a: rnz(r, -5, 5), which: r.pick(['x', 'y']), s2: r.pick([1, -1]), a2: rnz(r, -5, 5), which2: r.pick(['x', 'y']) }; },
        stem: 'Is each line possible?', parts: [
          { id: '14a', outcome: 'RF5', level: 'MAS', make: function (r, s) {
            /* possible: slope sign s; the given intercept is a; the other intercept has the sign that works */
            var sg = s.s, a = s.a, X = s.which === 'x', otherSign = X ? -sg * Math.sign(a) : -Math.sign(a) * sg;
            var cond = 'slope ' + sgnW(sg) + ', &nbsp;' + (X ? t('x') + '-intercept ' + t('=' + a) + ', &nbsp;' + t('y') + '-intercept ' + sgnW(otherSign) : t('x') + '-intercept ' + sgnW(otherSign) + ', &nbsp;' + t('y') + '-intercept ' + t('=' + a));
            var k = 3, P = X ? [a, 0] : [0, a], Qp = X ? [0, otherSign * k] : [otherSign * k, 0], L = line2(X ? P : Qp, X ? Qp : P), key = lineDraw(L, [-6, 6], [-6, 6]);
            var chk = K.graphRules({ custom: function (v) {
              var g = DR.geom(v), ks = Object.keys(g.lines);
              if (ks.length !== 1 || g.pts.length) return { code: 'u7t-sk-line', hint: 'Draw <b>one</b> straight line.' };
              var Lg = g.lines[ks[0]];
              if (Lg.B === 0 || Lg.A === 0) return { code: 'u7t-sk-slope', hint: 'A ' + (Lg.B === 0 ? 'vertical' : 'horizontal') + ' line doesn’t have slope ' + sgnW(sg) + '.' };
              var m = -Lg.A / Lg.B, xi = Lg.C / Lg.A, yi = Lg.C / Lg.B;
              if (Math.sign(m) !== sg) return { code: 'u7t-sk-slope', hint: 'Your line ' + (m > 0 ? 'rises' : 'falls') + ' from left to right, but the slope must be ' + (sg > 0 ? 'positive (rising)' : 'negative (falling)') + '.' };
              if (X ? !near(xi, a) : !near(yi, a)) return { code: 'u7t-sk-int', hint: 'Your line must cross the ' + t(s.which) + '-axis at ' + t(ptT(P)) + '.' };
              if (Math.sign(X ? yi : xi) !== otherSign) return { code: 'u7t-sk-int', hint: 'Check the ' + t(X ? 'y' : 'x') + '-intercept: it must be ' + (otherSign > 0 ? 'positive' : 'negative') + '.' };
              return null;
            } });
            var p = B.graph('This line <b>is</b> possible: ' + cond + '. Draw one such line.' + LINEHELP, pad([-6, 6], [-6, 6]), chk, key,
              'Possible: start at ' + t(ptT(P)) + ' and draw a line that ' + (sg > 0 ? 'rises' : 'falls') + ' from left to right. For example the line through ' + t(ptT(P)) + ' and ' + t(ptT(Qp)) + ': it ' + (sg > 0 ? 'rises' : 'falls') + ' and its ' + t(X ? 'y' : 'x') + '-intercept, ' + t(otherSign * k) + ', is ' + (otherSign > 0 ? 'positive' : 'negative') + '. (Many lines work.)',
              ['Plot the given intercept first.', 'A ' + (sg > 0 ? 'positive slope rises' : 'negative slope falls') + ' from left to right: which side of the origin does it cross the other axis?'], 'possible line ' + sg + s.which + a);
            var Wr = lineDraw(line2(X ? P : [-otherSign * k, 0], X ? [0, -otherSign * k] : P), [-6, 6], [-6, 6]);
            p.bad = [Wr].filter(Boolean);
            return p;
          } },
          { id: '14b', outcome: 'RF5', level: 'MAS', make: function (r, s) {
            /* impossible: slope sign s2, the given intercept a2, the other intercept with the wrong sign */
            var sg = s.s2, a = s.a2, X = s.which2 === 'x', good = -sg * Math.sign(a), bad = -good, k = 3;
            var cond = 'slope ' + sgnW(sg) + ', &nbsp;' + (X ? t('x') + '-intercept ' + t('=' + a) + ', &nbsp;' + t('y') + '-intercept ' + sgnW(bad) : t('x') + '-intercept ' + sgnW(bad) + ', &nbsp;' + t('y') + '-intercept ' + t('=' + a));
            var P = X ? [a, 0] : [0, a], other = X ? 'y' : 'x', rises = sg > 0, dir = rises ? 'rises' : 'falls';
            var reason = X ? 'The line ' + dir + ' from left to right. From ' + t(ptT(P)) + ' it moves ' + (a > 0 ? 'left' : 'right') + ' to reach ' + t('x=0') + ', so it ends up ' + (good > 0 ? 'above' : 'below') + ' the ' + t('x') + '-axis there: the ' + t('y') + '-intercept must be ' + (good > 0 ? 'positive' : 'negative') + '.'
              : 'The line ' + dir + ' from left to right. From ' + t(ptT(P)) + ' it must ' + (a > 0 ? 'go down' : 'go up') + ' to reach the ' + t('x') + '-axis, which means moving ' + ((a > 0) === rises ? 'left' : 'right') + ': the ' + t('x') + '-intercept must be ' + (good > 0 ? 'positive' : 'negative') + '.';
            var ex2 = X ? [0, bad * k] : [bad * k, 0], exM = X ? qd(-ex2[1], a) : qd(-a, ex2[0]);
            return B.mc(r, 'Is this line possible? ' + cond + '. Choose the answer with a correct reason.', [
              { html: '<b>Not possible.</b> ' + reason, right: true },
              { html: '<b>Possible</b>, for example the line through ' + t(ptT(P)) + ' and ' + t(ptT(ex2)) + '.', why: 'Check that line’s slope: ' + t('m=' + qT(exM)) + ', which is ' + (qv(exM) > 0 ? 'positive' : 'negative') + ' — the slope must be ' + (rises ? 'positive' : 'negative') + '.' },
              { html: '<b>Not possible.</b> A line with a ' + (rises ? 'positive' : 'negative') + ' slope can’t cross the ' + t(s.which2) + '-axis at ' + t(a) + '.', why: 'It can: the line through ' + t(ptT(P)) + ' and ' + t(ptT(X ? [0, good * k] : [good * k, 0])) + ' does. The problem is the sign of the <b>other</b> intercept.' },
              { html: '<b>Possible.</b> Any slope can go with any two intercepts.', why: 'Try to draw it: once the slope’s sign and one intercept are fixed, the side where the line crosses the other axis is fixed too.' }],
              '<b>Not possible.</b> ' + reason + ' (A line through ' + t(ptT(P)) + ' with ' + t(other) + '-intercept ' + sgnW(bad) + ' would have to ' + (rises ? 'fall' : 'rise') + '.)',
              ['Sketch a line through ' + t(ptT(P)) + ' that ' + dir + '. Where does it cross the ' + t(other) + '-axis?'], 'impossible line ' + sg + s.which2 + a);
          } }] },

      /* ======================= RF6 · forms of a linear equation ======================= */
      { num: '15', outcome: 'RF6',
        shared: function (r) {
          var m = rnz(r, -6, 6); if (Math.abs(m) === 1) m *= 3;
          var P = [rnz(r, -7, 7), rnz(r, -7, 7)], si = lineMB(r.chance(0.3) ? Q(r.pick([1, -1, 3, -3]), 2) : rnz(r, -7, 7), rnz(r, -9, 9)), G = L3(r.int(1, 5), rnz(r, -5, 5), rnz(r, -9, 9));
          return { m: m, P: P, L: lineMP(m, P), si: si, G: G, order: r.shuffle(['ps', 'si', 'g']) };
        },
        stem: 'Equations of lines come in three forms: <b>slope–intercept</b> ' + t('y=mx+b') + ', <b>general</b> ' + t('Ax+By+C=0') + ' and <b>point–slope</b> ' + t('y-y_1=m(x-x_1)') + '.',
        parts: [
          { id: '15a', outcome: 'RF6', level: 'BEG', make: function (r, s) {
            var tex = { ps: pT(s.L, s.P), si: sT(s.si), g: gT(s.G) }, nm = { ps: 'point–slope', si: 'slope–intercept', g: 'general' }, want = {};
            s.order.forEach(function (k) { want[k] = k; });
            return gridP('Name the form of each equation.', s.order.map(function (k) { return { id: k, html: t(tex[k]), label: k }; }),
              [{ id: 'si', html: 'slope–intercept', label: 'slope-intercept' }, { id: 'g', html: 'general', label: 'general' }, { id: 'ps', html: 'point–slope', label: 'point-slope' }], want,
              function (id) { return { code: 'u7t-form-name', hint: t(tex[id]) + ' is in <b>' + nm[id] + '</b> form: ' + (id === 'si' ? t('y') + ' by itself, ' + t('y=mx+b') : id === 'g' ? 'every term on one side, ' + t('=0') : t('y-y_1') + ' on the left and ' + t('m(x-x_1)') + ' on the right') + '.' }; },
              { code: 'u7t-form-many' }, s.order.map(function (k) { return t(tex[k]) + ': <b>' + nm[k] + '</b>'; }).join('<br>'),
              ['Slope–intercept: ' + t('y=') + ' something. General: ' + t('=0') + ' with whole numbers. Point–slope: a bracket ' + t('(x-x_1)') + '.'], 'name the form');
          } },
          { id: '15b', outcome: 'RF6', level: 'BEG', make: function (r, s) {
            var P = s.P, ps = pT(s.L, P);
            var p = B.fields('For ' + t(ps) + ', state the slope and the point.', [{ name: 'Slope', label: 'Slope ' + t('m') + ':', mode: 'math', keys: 'pairs', placeholder: 'e.g. -3/2' }, { name: 'Point', label: 'Point:', mode: 'math', keys: 'pairs', placeholder: '(x, y)' }],
              [K.slope([s.m, 1]), ptChk(P, null, [{ p: [-P[0], -P[1]], code: 'ps-sign', hint: 'In ' + t('y-y_1=m(x-x_1)') + ' the coordinates are <b>subtracted</b>, so their signs flip: ' + t(ps) + ' uses ' + t(ptT(P)) + '.' },
                { p: [-P[0], P[1]], code: 'u7t-ps-half', hint: 'Check the sign of ' + t('x_1') + ': ' + t('x' + (P[0] > 0 ? '-' : '+') + Math.abs(P[0])) + ' means ' + t('x_1=' + P[0]) + '.' }, { p: [P[0], -P[1]], code: 'u7t-ps-half', hint: 'Check the sign of ' + t('y_1') + ': ' + t('y' + (P[1] > 0 ? '-' : '+') + Math.abs(P[1])) + ' means ' + t('y_1=' + P[1]) + '.' },
                { p: [-P[1], -P[0]], code: 'ps-sign', hint: 'The signs flip, and the point is ' + t('(x_1,\\ y_1)') + ' — the ' + t('x') + '-value first.' }])],
              [String(s.m), ptK(P)], t('m=' + s.m) + ', point ' + t(ptT(P)),
              'Compare with ' + t('y-y_1=m(x-x_1)') + ': ' + t('m=' + s.m) + ', ' + t('x_1=' + P[0]) + ', ' + t('y_1=' + P[1]) + ' (the signs in the brackets are the opposite of the coordinates). Point ' + t(ptT(P)) + '.',
              ['The number in front of the bracket is the slope.', 'Flip the signs you see: ' + t('x-3') + ' means ' + t('x_1=3') + ', ' + t('y+2') + ' means ' + t('y_1=-2') + '.'], 'slope and point from ' + ps);
            p.bad = [[String(s.m), ptK([-P[0], -P[1]])]];
            return p;
          } }] },
      { num: '16', outcome: 'RF6', stem: 'State the slope and the ' + t('y') + '-intercept of each line.', parts: [
        { id: '16a', outcome: 'RF6', level: 'BEG', make: function (r) { var m = rnz(r, -7, 7), b = rnz(r, -9, 9); if (Math.abs(m) === 1) m *= 4; return mbPart(Q(m), b, sT(lineMB(m, b)), false); } },
        { id: '16b', outcome: 'RF6', level: 'BEG', make: function (r) { var m = fracSlope(r), b = rnz(r, -9, 9); return mbPart(m, b, sT(lineMB(m, b)), false); } },
        { id: '16c', outcome: 'RF6', level: 'BEG', make: function (r) { var m = fracSlope(r), b = rnz(r, -9, 9); return mbPart(m, b, 'y=' + b + term(m, 'x', false), true); } }] },
      { num: '17', outcome: 'RF6', shared: function (r) {
          return find(function () { var mq = r.pick([[1, 2], [2, 3], [3, 4], [2, 5], [3, 2], [1, 3], [4, 3], [3, 5], [5, 2], [1, 4]]); return { m: Q(r.pick([1, -1]) * mq[0], mq[1]), b: rnz(r, -4, 4) }; }, function (s) { return lattice(lineMB(s.m, s.b), [-6, 6], [-6, 6]).length >= 3; }, { m: [-3, 4], b: 2 });
        }, stem: function (s) { return 'Graph ' + t(sT(lineMB(s.m, s.b))) + ' using its slope and ' + t('y') + '-intercept.'; }, parts: [
          { id: '17', outcome: 'RF6', level: 'BEG', make: function (r, s) {
            var m = s.m, b = s.b, L = lineMB(m, b), eq = sT(L), rise = m[0], run = m[1];
            return graphLine('Graph ' + t(eq) + ' on the grid.', L, [-6, 6], [-6, 6], [
              { L: lineMB(qn(m), b), code: 'graph-slope-sign', hint: 'Check the direction: the slope ' + t(qT(m)) + ' is ' + (rise > 0 ? 'positive, so the line rises' : 'negative, so the line falls') + ' from left to right.' },
              { L: lineMB(Q(Math.sign(rise) * run, Math.abs(rise)), b), code: 'graph-flip', hint: 'Rise and run are swapped: in ' + t(qT(m)) + ' the top number is the <b>rise</b> (up or down) and the bottom number is the <b>run</b> (right).' },
              { L: lineMP(m, [b, 0]), code: 'graph-b-x', hint: 'The ' + t('y') + '-intercept is on the ' + t('y') + '-axis: start at ' + t('(0,\\ ' + b + ')') + '.' },
              { L: lineMB(m, -b), code: 'graph-int-sign', hint: 'Check the sign of the ' + t('y') + '-intercept: start at ' + t('(0,\\ ' + b + ')') + '.' }],
              'Plot the ' + t('y') + '-intercept ' + t('(0,\\ ' + b + ')') + '. From there step ' + (rise < 0 ? 'down ' + (-rise) : 'up ' + rise) + ' and right ' + run + ' to ' + t(ptT([run, b + rise])) + ' (and again, or back the other way). Draw the line through the points, with arrows.',
              ['Start at ' + t('(0,\\ b)') + ' on the ' + t('y') + '-axis.', 'Slope ' + t(qT(m)) + ': rise ' + t(rise) + ', run ' + t(run) + '.'], 'graph ' + eq);
          } }] },
      { num: '18', outcome: 'RF6', shared: function (r) {
          return find(function () { var q = r.int(2, 6), p = r.int(1, 5); return { m: Q(r.pick([1, -1]) * p, q), P: [rnz(r, -6, 6), rnz(r, -6, 6)] }; }, function (s) { return s.m[1] > 1 && Math.abs(s.m[0]) !== s.m[1] && gcd(s.m[0], s.m[1]) === 1 && !isInt(qs(s.P[1], qm(s.m, s.P[0]))); }, { m: [-2, 5], P: [-4, 3] });
        }, stem: function (s) { return 'Write ' + t(pT(lineMP(s.m, s.P), s.P)) + ' in:'; }, parts: [
          { id: '18a', outcome: 'RF6', level: 'PRG', make: function (r, s) { return q18Part(s, 'slope-intercept'); } },
          { id: '18b', outcome: 'RF6', level: 'PRG', make: function (r, s) { return q18Part(s, 'general'); } }] },
      { num: '19', outcome: 'RF6', shared: function (r) {
          return find(function () { var a = rnz(r, -6, 6), c = rnz(r, -6, 6); return { a: a, c: c, L: L3(c, a, -a * c) }; }, function (s) { return Math.abs(s.a) >= 2 && Math.abs(s.c) >= 2 && Math.abs(s.a) !== Math.abs(s.c) && s.L.A >= 2 && Math.abs(s.L.B) >= 2; }, { a: 5, c: -3, L: L3(3, -5, -15) });
        }, stem: function (s) { return 'Graph ' + t(gT(s.L)) + ' by finding its intercepts.'; }, parts: [
          { id: '19a', outcome: 'RF6', level: 'PRG', make: function (r, s) {
            var L = s.L;
            return icPart('Find the intercepts of ' + t(gT(L)) + '.', s.a, s.c, [{ v: Q(L.C, L.A), code: 'u7t-icpt-sign', hint: 'Move the constant across: it changes sign.' }], [{ v: Q(L.C, L.B), code: 'u7t-icpt-sign', hint: 'Move the constant across: it changes sign.' }],
              t('y=0') + ': ' + t(pol([[L.A, 'x'], [L.C, '']]) + '=0') + ', ' + t('x=' + s.a) + ' → ' + t(ptT([s.a, 0])) + '<br>' + t('x=0') + ': ' + t(pol([[L.B, 'y'], [L.C, '']]) + '=0') + ', ' + t('y=' + s.c) + ' → ' + t(ptT([0, s.c])),
              ['Let ' + t('y=0') + ' and solve for ' + t('x') + '; then let ' + t('x=0') + ' and solve for ' + t('y') + '.'], 'intercepts for graphing ' + gT(L));
          } },
          { id: '19b', outcome: 'RF6', level: 'PRG', make: function (r, s) {
            var L = s.L;
            return graphLine('Graph ' + t(gT(L)) + ' on the grid.', L, [-7, 7], [-7, 7], [
              { L: line2([s.c, 0], [0, s.a]), code: 'graph-int-swap', hint: 'Your intercepts are swapped: the ' + t('x') + '-intercept ' + t(ptT([s.a, 0])) + ' is on the ' + t('x') + '-axis.' },
              { L: line2([-s.a, 0], [0, -s.c]), code: 'graph-int-sign', hint: 'Check the signs of the intercepts: ' + t(ptT([s.a, 0])) + ' and ' + t(ptT([0, s.c])) + '.' }],
              'Plot the intercepts ' + t(ptT([s.a, 0])) + ' and ' + t(ptT([0, s.c])) + ' and draw the line through them, with arrows.', ['Use the two intercepts from (a).'], 'graph from intercepts ' + gT(L));
          } }] },
      { num: '20', outcome: 'RF6', shared: function (r) {
          return find(function () {
            var m = Q(r.pick([2, -2, 3, -3, 4, -4, [1, 2], [-1, 2], [1, 3], [-1, 3]])), b = rnz(r, -6, 6), L = lineMB(m, b), q = m[1];
            var xs = r.sample([-3, -2, -1, 1, 2, 3, 4, 5].map(function (k) { return k * q; }).filter(function (x) { return Math.abs(x) <= 6; }), 3);
            return { m: m, b: b, L: L, xs: xs, d: r.pick([2, -2, 3, -3]), k: r.pick([2, 2, 3]) };
          }, function (s) { return s.xs.length === 3 && s.xs.every(function (x) { var y = qv(s.m) * x + s.b; return Math.abs(y) <= 9 && y !== 0; }); }, { m: [2, 1], b: -6, L: lineMB(2, -6), xs: [2, 5, 3], d: 2, k: 2 });
        }, stem: function (s) { return 'Select <b>every</b> equation that represents the same line as ' + t(sT(s.L)) + '.'; }, parts: [
          { id: '20', outcome: 'RF6', level: 'PRG', make: function (r, s) {
            var L = s.L, m = s.m, b = s.b, y = function (x) { return qv(m) * x + b; }, P1 = [s.xs[0], y(s.xs[0])], P2 = [s.xs[1], y(s.xs[1])], P3 = [s.xs[2], y(s.xs[2]) + s.d];
            var Wg = lineMB(m, -b), Wp = lineMP(m, P3), k = s.k;
            var opts = [{ value: 'g', html: t(gT(L)), right: 1, simp: sT(L) }, { value: 'p1', html: t(pT(L, P1)), right: 1 }, { value: 'p2', html: t(pT(L, P2)), right: 1 },
              { value: 'w1', html: t(pol([[k * Wg.A, 'x'], [k * Wg.B, 'y'], [k * Wg.C, '']]) + '=0'), right: 0, simp: sT(Wg) }, { value: 'w2', html: t(pT(Wp, P3)), right: 0, simp: sT(Wp) }];
            var by = {}; opts.forEach(function (o) { by[o.value] = o; });
            var want = ['g', 'p1', 'p2'];
            var check = K.selectSet(want, function (extra, missing) {
              if (extra.length + missing.length > 1) return { code: 'u7t-eqv-many', hint: 'Rewrite each one in the form ' + t('y=mx+b') + ' and compare it with ' + t(sT(L)) + '.' };
              if (extra.length) return { code: 'u7t-eqv-extra', hint: by[extra[0]].html + ' rearranges to ' + t(by[extra[0]].simp) + ' — a different line.' };
              return { code: 'u7t-eqv-missed', hint: 'One more is the same line: rearrange ' + by[missing[0]].html + ' to ' + t('y=mx+b') + '.' };
            });
            var shown = r.shuffle(opts);
            return { prompt: 'Select every equation that is the same line as ' + t(sT(L)) + '.', input: { type: 'select', options: shown.map(function (o) { return { value: o.value, html: o.html }; }), help: 'Tap every equation of the same line. Tap again to unselect.' },
              check: check, key: want, answer: want.map(function (v) { return by[v].html; }).join(', '),
              solution: 'Rewrite each one as ' + t('y=mx+b') + ':<br>' + shown.map(function (o) { return o.html + ' → ' + t(o.simp || sT(L)) + (o.right ? ' ✓ same line' : ' ✗'); }).join('<br>'),
              hints: ['Solve each equation for ' + t('y') + '.', 'For a point–slope equation, check that its point is on ' + t(sT(L)) + '.'], text: 'equivalent forms of ' + sT(L), bad: [['g', 'p1', 'p2', 'w1'], ['g', 'p1']] };
          } }] },
      { num: '21', outcome: 'RF6', shared: q21Shared,
        stem: function (s) { return 'Match each equation to its graph. Each graph is used once.<br>' + s.order.map(function (i, n) { return '(' + ROM[n] + ')&nbsp; ' + t(s.tex[i]); }).join(' &nbsp;&nbsp;&nbsp; ') + q21Figs(s); },
        parts: [
          { id: '21a', outcome: 'RF6', level: 'MAS', make: function (r, s) {
            var rows = s.order.map(function (i, n) { return { id: ROM[n], html: '(' + ROM[n] + ') ' + t(s.tex[i]), label: ROM[n] }; }), cols = LET.map(function (l) { return { id: l, html: '<b>' + l + '</b>', label: l }; }), want = {}, of = {};
            s.order.forEach(function (i, n) { want[ROM[n]] = LET[s.pos.indexOf(i)]; of[ROM[n]] = i; });
            var p = B.grid('Choose the graph for each equation.', rows, cols, want, { rowHead: 'Equation', colHead: 'Graph' },
              s.order.map(function (i, n) { var L = s.lines[i]; return '(' + ROM[n] + ') ' + t(s.tex[i]) + ' → ' + t(sT(L)) + ': slope ' + t(qT(slopeOf(L))) + ', ' + t('y') + '-intercept ' + t(qT(yint(L))) + ' → graph <b>' + want[ROM[n]] + '</b>'; }).join('<br>'),
              ['Write each equation as ' + t('y=mx+b') + ' (or read its slope and a point).', 'Two lines have the same slope: tell them apart by their ' + t('y') + '-intercepts.'], 'match equations to graphs'), base = p.check;
            p.check = function (resp) {
              var res = base(resp); if (res.v !== 'wrong') return res;
              var bad = Object.keys(want).filter(function (k) { return (resp || {})[k] !== want[k]; });
              if (bad.length === 2) { var a = s.lines[of[bad[0]]], b = s.lines[of[bad[1]]], same = qv(slopeOf(a)) === qv(slopeOf(b)); return wrong('u7t-match-swap', '(' + bad[0] + ') and (' + bad[1] + ') are swapped.' + (same ? ' They have the same slope, so compare their ' + t('y') + '-intercepts.' : ' Compare their slopes: which line rises and which falls?')); }
              if (bad.length === 1) return wrong('u7t-match-one', 'Check (' + bad[0] + '): rewrite it as ' + t('y=mx+b') + '. (Each graph is used once.)');
              return wrong('u7t-match-many', 'Rewrite each equation as ' + t('y=mx+b') + ' and match its slope and ' + t('y') + '-intercept.');
            };
            var sw = {}; Object.keys(want).forEach(function (k) { sw[k] = want[k]; }); var pr = s.pair.map(function (i) { return ROM[s.order.indexOf(i)]; }), tmp = sw[pr[0]]; sw[pr[0]] = sw[pr[1]]; sw[pr[1]] = tmp;
            p.bad = [sw];
            return p;
          } },
          { id: '21b', outcome: 'RF6', level: 'MAS', make: function (r, s) {
            var pr0 = s.pair.slice().sort(function (a, b) { return s.order.indexOf(a) - s.order.indexOf(b); }), i1 = pr0[0], i2 = pr0[1], R1 = ROM[s.order.indexOf(i1)], R2 = ROM[s.order.indexOf(i2)], m = slopeOf(s.lines[i1]), b1 = yint(s.lines[i1]), b2 = yint(s.lines[i2]);
            var p = B.fields('Equations (' + R1 + ') and (' + R2 + ') have the same slope. How do you tell their graphs apart? Give the slope, then each ' + t('y') + '-intercept.',
              [{ name: 'Slope', label: 'Slope of both:', mode: 'math', keys: 'fraction' }, { name: 'y-int (' + R1 + ')', label: t('y') + '-intercept of (' + R1 + '):', mode: 'math', keys: 'fraction' }, { name: 'y-int (' + R2 + ')', label: t('y') + '-intercept of (' + R2 + '):', mode: 'math', keys: 'fraction' }],
              [K.slope(m), valD(b1, [{ v: b2, code: 'u7t-icpt-pair', hint: 'That’s the ' + t('y') + '-intercept of (' + R2 + ').' }]), valD(b2, [{ v: b1, code: 'u7t-icpt-pair', hint: 'That’s the ' + t('y') + '-intercept of (' + R1 + ').' }])],
              [qT(m), qT(b1), qT(b2)], 'slope ' + t(qT(m)) + '; (' + R1 + ') ' + t('b=' + qT(b1)) + ', (' + R2 + ') ' + t('b=' + qT(b2)),
              'Both have slope ' + t(qT(m)) + ', so they are parallel; use the ' + t('y') + '-intercepts: (' + R1 + ') is ' + t(sT(s.lines[i1])) + ' and (' + R2 + ') is ' + t(sT(s.lines[i2])) + '.',
              ['Rewrite both as ' + t('y=mx+b') + '.'], 'tell apart same slope');
            p.bad = [[qT(m), qT(b2), qT(b1)]];
            return p;
          } }] },
      { num: '22', outcome: 'RF6', shared: function (r) {
          var m = Q(r.pick([2, -2, 3, -3, 4, -4, [2, 3], [-2, 3], [1, 2], [-1, 2], [3, 2], [-3, 2]])), P = [rnz(r, -5, 5), rnz(r, -5, 5)];
          var g = find(function () { var a = rnz(r, -7, 7), c = rnz(r, -7, 7); return { a: a, c: c, L: L3(c, a, -a * c) }; }, function (v) { return Math.abs(v.a) >= 2 && Math.abs(v.c) >= 2 && Math.abs(v.a) !== Math.abs(v.c) && v.L.A >= 2 && Math.abs(v.L.B) >= 2; }, { a: 2, c: -5, L: L3(5, -2, -10) });
          return { m: m, P: P, L: lineMP(m, P), g: g, name: r.pick(NAMES) };
        }, stem: function (s) { return s.name + ' says, “To graph ' + t(pT(s.L, s.P)) + ', I first have to rewrite it as ' + t('y=mx+b') + '.”'; }, parts: [
          { id: '22a', outcome: 'RF6', level: 'MAS', make: function (r, s) {
            var P = s.P, m = s.m, L = s.L, P2 = [P[0] + m[1], P[1] + m[0]], ps = pT(L, P);
            var second = function (resp) {
              var pp = LN.readPoint(resp);
              if (pp.empty) return form('empty', 'Type your answer first.');
              if (!pp || pp.kind !== 'pt') return form('pt-form', 'Write it as an ordered pair, ' + t('(x,\\ y)') + '.');
              var X = [pp.p[0].v, pp.p[1].v];
              if (near(X[0], P[0]) && near(X[1], P[1])) return wrong('u7t-pt-same', 'That’s the first point. Step the slope from it to reach a second point.');
              if (onL(L, X)) return ok();
              if (onL(lineMP(qn(m), P), X)) return wrong('u7t-pt-dir', 'Check the direction: slope ' + t(qT(m)) + ' means ' + (m[0] > 0 ? 'up ' + m[0] : 'down ' + (-m[0])) + ', right ' + m[1] + '.');
              return wrong('u7t-pt-off', 'That point isn’t on the line: from ' + t(ptT(P)) + ' step ' + (m[0] > 0 ? 'up ' + m[0] : 'down ' + (-m[0])) + ' and right ' + m[1] + '.');
            };
            var p = B.fields('Do you agree with ' + s.name + '? Show the fastest way: the point to plot first, the slope, and the second point you reach with the slope.',
              [{ name: 'Agree?', label: 'Do you agree with ' + s.name + '? (yes or no)', mode: 'text', placeholder: 'yes/no' }, { name: 'First point', label: 'Point to plot first:', mode: 'math', keys: 'pairs', placeholder: '(x, y)' }, { name: 'Slope', label: 'Slope:', mode: 'math', keys: 'pairs', placeholder: 'e.g. -3/2' }, { name: 'Second point', label: 'Second point (step the slope):', mode: 'math', keys: 'pairs', placeholder: '(x, y)' }],
              [ynChk('no', 'u7t-agree', 'It is already in point–slope form: it tells you a point and the slope, which is all you need to graph it.'),
                ptChk(P, null, [{ p: [-P[0], -P[1]], code: 'ps-sign', hint: 'The signs in the brackets are the opposite of the coordinates: the point is ' + t(ptT(P)) + '.' }]), K.slope(m), second],
              ['no', ptK(P), qT(m), ptK(P2)], '<b>No</b>: plot ' + t(ptT(P)) + ', use ' + t('m=' + qT(m)) + ' to reach ' + t(ptT(P2)) + ', and join.',
              '<b>No.</b> ' + t(ps) + ' is already in point–slope form: plot the point ' + t(ptT(P)) + ', then use ' + t('m=' + qT(m)) + ' (' + (m[0] > 0 ? 'up ' + m[0] : 'down ' + (-m[0])) + ', right ' + m[1] + ') to reach ' + t(ptT(P2)) + ', and join them with a line.',
              ['What does ' + t('y-y_1=m(x-x_1)') + ' tell you directly?', 'The signs in the brackets are the opposite of the point’s coordinates.'], 'graph from point-slope');
            p.bad = [['yes', ptK(P), qT(m), ptK(P2)], ['no', ptK([-P[0], -P[1]]), qT(m), ptK(P2)]];
            return p;
          } },
          { id: '22b', outcome: 'RF6', level: 'MAS', make: function (r, s) {
            var g = s.g, L = g.L, strat = function (resp) {
              var x = String(resp == null ? '' : resp).toLowerCase();
              if (!x.trim()) return form('empty', 'Type the strategy.');
              var slow = function () { return wrong('u7t-strategy', 'That works, but it isn’t the fastest here: ' + t(gT(L)) + ' would need rearranging first. Setting ' + t('x=0') + ' and ' + t('y=0') + ' gives two points at once.'); };
              if (/slope|table|m\s*x/.test(x)) return slow();   // slope–intercept, slope–point, a table of values
              if (/intercept|x\s*=\s*0|y\s*=\s*0|cover/.test(x)) return ok();   // “intercept points”, “let x = 0 and y = 0”
              if (/point|y\s*=/.test(x)) return slow();
              return form('u7t-yn', 'Name a strategy: <b>intercepts</b>, <b>slope–intercept</b> or <b>slope–point</b>.');
            };
            var p = B.fields('Which strategy is fastest for graphing ' + t(gT(L)) + '? Name it, and give the two points you would plot.',
              [{ name: 'Strategy', label: 'Fastest strategy:', mode: 'text', placeholder: 'name it', wide: true }, { name: 'x-intercept', label: t('x') + '-intercept:', mode: 'math', keys: 'pairs', placeholder: '(x, y)' }, { name: 'y-intercept', label: t('y') + '-intercept:', mode: 'math', keys: 'pairs', placeholder: '(x, y)' }],
              [strat, ptChk([g.a, 0], 'x'), ptChk([0, g.c], 'y')], ['intercepts', ptK([g.a, 0]), ptK([0, g.c])], 'the <b>intercepts</b>: ' + t(ptT([g.a, 0])) + ' and ' + t(ptT([0, g.c])),
              'The <b>intercepts</b>: in general form, setting ' + t('y=0') + ' gives ' + t(pol([[L.A, 'x'], [L.C, '']]) + '=0') + ', so ' + t('x=' + g.a) + '; setting ' + t('x=0') + ' gives ' + t(pol([[L.B, 'y'], [L.C, '']]) + '=0') + ', so ' + t('y=' + g.c) + '. Plot ' + t(ptT([g.a, 0])) + ' and ' + t(ptT([0, g.c])) + ' and join them — no rearranging needed.',
              ['General form: what happens to the equation when ' + t('x=0') + '? When ' + t('y=0') + '?'], 'fastest strategy for ' + gT(L));
            p.bad = [['slope-intercept', ptK([g.a, 0]), ptK([0, g.c])], ['intercepts', ptK([0, g.a]), ptK([g.c, 0])]];
            return p;
          } }] },

      /* ======================= RF7 · equation of a line ======================= */
      { num: '23', outcome: 'RF7', stem: 'Write the equation of each line in slope–intercept form.', parts: [
        { id: '23a', outcome: 'RF7', level: 'BEG', make: function (r) { var m = rnz(r, -6, 6), b = rnz(r, -9, 9); if (Math.abs(m) === 1) m *= 2; return q23Part(Q(m), b); } },
        { id: '23b', outcome: 'RF7', level: 'BEG', make: function (r) { return q23Part(fracSlope(r), rnz(r, -9, 9)); } }] },
      { num: '24', outcome: 'RF7', shared: function (r) {
          return find(function () { var mq = r.pick([[1, 3], [2, 3], [3, 2], [1, 2], [3, 4], [1, 4], [2, 1], [4, 3]]); return { m: Q(r.pick([1, -1]) * mq[0], mq[1]), b: rnz(r, -3, 3) }; }, function (s) { var p = Math.abs(s.m[0]); return Math.abs(s.b) + p <= 5 && s.m[1] <= 4; }, { m: [1, 3], b: -2 });
        }, stem: function (s) { var m = s.m, b = s.b, q = m[1], p = m[0]; return 'Write the equation of the line shown.' + lineFig([lineMB(m, b)], [-5, 5], [-6, 6], { points: [{ x: -q, y: b - p }, { x: 0, y: b }, { x: q, y: b + p }] }); }, parts: [
          { id: '24', outcome: 'RF7', level: 'BEG', make: function (r, s) {
            var m = s.m, b = s.b, L = lineMB(m, b);
            return lineP('Write the equation of the line shown on the graph.', L, {},
              t('y') + '-intercept ' + t(b) + '; from ' + t(ptT([0, b])) + ' to ' + t(ptT([m[1], b + m[0]])) + ': rise ' + t(m[0]) + ', run ' + t(m[1]) + ', so ' + t('m=' + qT(m)) + '.<br>' + t(sT(L)),
              ['Read the ' + t('y') + '-intercept where the line crosses the ' + t('y') + '-axis.', 'Count rise over run between two marked points.'], 'equation from graph');
          } }] },
      { num: '25', outcome: 'RF7', shared: function (r) { return find(function () { return { h: rnz(r, -7, 7), k: rnz(r, -7, 7), hFirst: r.chance(0.5) }; }, function (s) { return Math.abs(s.h) !== Math.abs(s.k); }, { h: -3, k: 4, hFirst: true }); },
        stem: function (s) { return 'Write the equation of each line through the point ' + t(ptT([s.h, s.k])) + '.'; }, parts: [
          { id: '25a', outcome: 'RF7', level: 'BEG', make: function (r, s) { return q25Part(s, s.hFirst); } },
          { id: '25b', outcome: 'RF7', level: 'BEG', make: function (r, s) { return q25Part(s, !s.hFirst); } }] },
      { num: '26', outcome: 'RF7', stem: 'Two points are given.', parts: [
        { id: '26', outcome: 'RF7', level: 'PRG', make: function (r) {
          var v = find(function () { var P = [r.int(-5, 3), r.int(-6, 8)], dx = r.pick([2, 3, 4, 6, 6, 8]), dy = rnz(r, -10, 10); return { P: P, Q2: [P[0] + dx, P[1] + dy] }; }, function (v) { var d = v.Q2[0] - v.P[0], e = v.Q2[1] - v.P[1]; return v.Q2[0] <= 8 && Math.abs(v.Q2[1]) <= 8 && e % d !== 0 && Math.abs(e) !== Math.abs(d); }, { P: [-3, 5], Q2: [3, 1] });
          var P = v.P, Q2 = v.Q2, m = Q(Q2[1] - P[1], Q2[0] - P[0]), L = lineMP(m, P);
          return lineP('Determine the equation of the line through ' + t(ptT(P)) + ' and ' + t(ptT(Q2)) + '. Write it in <b>general form</b>.', L, { form: 'general', wrong: [{ is: lineMP(qd(1, m), P), code: 'line-slope-flip', hint: 'Slope is rise over run: ' + t('\\frac{\\Delta y}{\\Delta x}') + '.' }, { is: lineMP(qn(m), P), code: 'line-slope-sign', hint: 'Subtract the coordinates in the same order on the top and the bottom.' }] },
            slopeSteps(P, Q2) + '<br>' + psSteps(m, P), ['Find the slope first: ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + '.', 'Use slope–point form with either point, then move every term to one side (whole numbers, ' + t('A>0') + ').'], 'two points to general form');
        } }] },
      { num: '27', outcome: 'RF7', shared: function (r) {
          var v = find(function () {
            var mq = r.pick([[1, 2], [2, 3], [3, 4], [1, 3], [3, 2], [2, 1], [4, 1], [3, 1]]), m = Q(r.pick([1, -1]) * mq[0], mq[1]), x0 = mq[1] * rnz(r, -3, 3), y0 = rnz(r, -6, 6);
            var A = r.int(1, 6), Bc = rnz(r, -6, 6), C = rnz(r, -9, 9);
            return { m: m, P: [x0, y0], b0: rnz(r, -9, 9), G: L3(A, Bc, C) };
          }, function (v) { var G = v.G, b1 = qs(v.P[1], qm(v.m, v.P[0])); return Math.abs(v.P[0]) <= 7 && Math.abs(G.A) !== Math.abs(G.B) && Math.abs(G.A) >= 2 && Math.abs(G.B) >= 2 && gcd(G.A, G.B) === 1 && !near(qv(b1), v.b0) && Math.abs(qv(b1)) <= 12; }, { m: [1, 2], P: [-4, 3], b0: 7, G: L3(3, -4, 8) });
          v.parFirst = r.chance(0.5); return v;
        }, stem: function (s) { return 'A line passes through ' + t('P' + ptT(s.P)) + '.'; }, parts: [
          { id: '27a', outcome: 'RF7', level: 'PRG', make: function (r, s) { return s.parFirst ? q27Par(s) : q27Perp(s); } },
          { id: '27b', outcome: 'RF7', level: 'PRG', make: function (r, s) { return s.parFirst ? q27Perp(s) : q27Par(s); } }] },
      { num: '28', outcome: 'RF7', shared: function (r) {
          var c = r.pick(FEE), v = c.gen(r); v.c = c; v.c1 = Math.round((v.fee + v.rate * v.x1) * 100) / 100; v.c2 = Math.round((v.fee + v.rate * v.x2) * 100) / 100; v.name = r.pick(NAMES); return v;
        }, stem: function (s) { return s.c.intro(s); }, parts: [
          { id: '28a', outcome: 'RF7', level: 'MAS', make: function (r, s) {
            var c = s.c, vars = [c.x, 'C'], L = lineMB(s.rate, s.fee), rT = num(s.rate);
            return lineP('Write an equation for ' + c.eq + '.', L, { vars: vars, placeholder: 'e.g. C = 2' + c.x + ' + 3', wrong: [{ is: lineMB(s.fee, s.rate), code: 'u7t-ctx-swap', hint: 'The rate (the slope) multiplies ' + t(c.x) + '; the fixed fee is the constant.' }, { is: lineMB(s.rate, 0), code: 'u7t-ctx-nostart', hint: 'Include the fixed fee: find ' + t('b') + ' by substituting one of the data points.' }] },
              'Slope: ' + t('m=\\dfrac{' + num(s.c2) + '-' + num(s.c1) + '}{' + s.x2 + '-' + s.x1 + '}=\\dfrac{' + num(Math.round((s.c2 - s.c1) * 100) / 100) + '}{' + (s.x2 - s.x1) + '}=' + rT) + '<br>' + t(num(s.c1) + '=' + rT + '(' + s.x1 + ')+b') + ', so ' + t('b=' + num(s.fee)) + '<br>' + t('C=' + rT + c.x + '+' + num(s.fee)),
              ['The two costs are two points ' + t('(' + c.x + ',\\ C)') + ': find the slope between them.', 'Substitute one point to find ' + t('b') + '.'], 'two-point context ' + c.x);
          } },
          { id: '28b', outcome: 'RF7', level: 'MAS', make: function (r, s) {
            var c = s.c, M = c.mean, cols = r.shuffle([{ id: 'rate', html: M.rate, label: 'rate' }, { id: 'fee', html: M.fee, label: 'fee' }, { id: 'one', html: M.one, label: 'one unit' }, { id: 'inv', html: M.inv, label: 'inverse' }]);
            var rows = [{ id: 'm', html: 'slope, ' + t(num(s.rate)), label: 'slope' }, { id: 'b', html: t('C') + '-intercept, ' + t(num(s.fee)), label: 'C-int' }];
            return gridP('What do the slope and the ' + t('C') + '-intercept mean here? Choose one meaning for each.', rows, cols, { m: 'rate', b: 'fee' },
              function (id) { return { code: 'u7t-mean-one', hint: id === 'm' ? 'The slope is the change in cost for each extra ' + c.x1s + ': ' + M.rate + '.' : 'The ' + t('C') + '-intercept is the cost when ' + t(c.x + '=0') + ': ' + M.fee + '.' }; },
              { code: 'u7t-mean-many' },
              'Slope ' + t(money(s.rate)) + ': ' + M.rate + '.<br>' + t('C') + '-intercept ' + t(money(s.fee)) + ': ' + M.fee + ' (the cost when ' + t(c.x + '=0') + ').',
              ['The ' + t('C') + '-intercept is the cost when ' + t(c.x + '=0') + '.', 'A slope is dollars per unit of ' + t(c.x) + '.'], 'meaning slope & intercept ' + c.x);
          } },
          { id: '28c', outcome: 'RF7', level: 'MAS', make: function (r, s) {
            var c = s.c, rT = num(s.rate), B0 = s.budget;
            return B.number(c.ask(s), s.T, function (v) {
              if (near(v, B0 / s.rate)) return { code: 'u7t-ctx-nostart', hint: 'Subtract the fixed fee first: ' + t(num(B0) + '-' + num(s.fee)) + '.' };
              if (near(v, (B0 + s.fee) / s.rate)) return { code: 'u7t-ctx-sign', hint: 'To undo “+' + num(s.fee) + '”, subtract it from both sides.' };
              if (near(v, s.rate * B0 + s.fee)) return { code: 'u7t-ctx-eval', hint: 'Here ' + t('C=' + num(B0)) + ': solve for ' + t(c.x) + '.' };
              return null;
            }, t(num(B0) + '=' + rT + c.x + '+' + num(s.fee)) + '<br>' + t(rT + c.x + '=' + num(Math.round((B0 - s.fee) * 100) / 100)) + '<br>' + t(c.x + '=' + s.T) + ' — <b>' + s.T + ' ' + c.ansU + '</b>',
              ['Set ' + t('C=' + num(B0)) + ' in your equation from (a).', 'Subtract the fee, then divide by the rate.'], 'solve context ' + c.x, { after: c.ansU });
          } }] },
      { num: '29', outcome: 'RF7', shared: function (r) {
          var v = find(function () { var M = [r.int(-3, 3), r.int(-3, 3)], u = r.int(1, 4), w = rnz(r, -4, 4); return { M: M, A: [M[0] - u, M[1] - w], B: [M[0] + u, M[1] + w], u: u, w: w }; }, function (v) { return v.u !== Math.abs(v.w) && [v.A, v.B].every(function (p) { return Math.abs(p[0]) <= 7 && Math.abs(p[1]) <= 7; }); }, { M: [1, -1], A: [-3, 2], B: [5, -4], u: 4, w: -3 });
          v.ctx = r.int(0, 2); return v;
        }, stem: function (s) {
          var nm = ['AB', 'AB', 'PQ'][s.ctx], a = nm[0], b = nm[1];
          return [ 'Points ' + t(a + ptT(s.A)) + ' and ' + t(b + ptT(s.B)) + ' are the endpoints of a segment.', 'Two cell towers are at ' + t(a + ptT(s.A)) + ' and ' + t(b + ptT(s.B)) + ' on a map grid. A road will run along the perpendicular bisector of ' + t(nm) + '.', 'Two wells are at ' + t(a + ptT(s.A)) + ' and ' + t(b + ptT(s.B)) + ' on a farm map. A fence will run along the perpendicular bisector of ' + t(nm) + '.'][s.ctx] +
            ' The <b>perpendicular bisector</b> of ' + t(nm) + ' is the line through the midpoint of ' + t(nm) + ' that is perpendicular to ' + t(nm) + '.';
        }, parts: [
          { id: '29a', outcome: 'RF7', level: 'MAS', make: function (r, s) {
            var nm = ['AB', 'AB', 'PQ'][s.ctx], m = Q(s.w, s.u), n = perpS(m), A = s.A, Bp = s.B, M = s.M;
            var p = B.fields('Find the midpoint of ' + t(nm) + ', the slope of ' + t(nm) + ' and the slope of the perpendicular bisector.',
              [{ name: 'Midpoint', label: 'Midpoint:', mode: 'math', keys: 'pairs', placeholder: '(x, y)' }, { name: 'Slope of ' + nm, label: 'Slope of ' + t(nm) + ':', mode: 'math', keys: 'pairs', placeholder: 'e.g. -3/2' }, { name: 'Perpendicular slope', label: 'Slope of the bisector:', mode: 'math', keys: 'pairs', placeholder: 'e.g. -3/2' }],
              [ptChk(M, null, [{ p: [(Bp[0] - A[0]) / 2, (Bp[1] - A[1]) / 2], code: 'u7t-mid-diff', hint: 'The midpoint <b>averages</b> the coordinates: add them, then divide by ' + t('2') + '.' }, { p: [A[0] + Bp[0], A[1] + Bp[1]], code: 'u7t-mid-half', hint: 'Divide each sum by ' + t('2') + '.' }]),
                K.slope(m), K.slope(n, { diag: function (v) { if (near(v, qv(m))) return { code: 'u7t-pb-par', hint: 'That’s the slope of ' + t(nm) + '. The bisector is <b>perpendicular</b>: take the negative reciprocal.' }; if (near(v, -qv(n))) return { code: 'u7t-perp-sign', hint: 'Flip the fraction <b>and</b> change the sign.' }; return null; } })],
              [ptK(M), qT(m), qT(n)], 'midpoint ' + t(ptT(M)) + ', ' + t('m_{' + nm + '}=' + qT(m)) + ', ' + t('m_{\\perp}=' + qT(n)),
              'Midpoint: ' + t('\\left(\\dfrac{' + A[0] + '+' + sgnP(Bp[0]) + '}{2},\\ \\dfrac{' + A[1] + '+' + sgnP(Bp[1]) + '}{2}\\right)=' + ptT(M)) + '<br>' + slopeSteps(A, Bp) + '<br>Perpendicular: negative reciprocal, ' + t('m_{\\perp}=' + qT(n)) + '.',
              ['Midpoint: average the ' + t('x') + '-coordinates and the ' + t('y') + '-coordinates.', 'Perpendicular slope: flip the fraction and change the sign.'], 'perp bisector pieces');
            p.bad = [[ptK(M), qT(m), qT(m)], [ptK(M), qT(m), qT(qn(n))]];
            return p;
          } },
          { id: '29b', outcome: 'RF7', level: 'MAS', make: function (r, s) {
            var nm = ['AB', 'AB', 'PQ'][s.ctx], m = Q(s.w, s.u), n = perpS(m), L = lineMP(n, s.M);
            return lineP('Determine the equation of the perpendicular bisector of ' + t(nm) + ', in <b>general form</b>.', L, { form: 'general', wrong: [
              { is: lineMP(n, s.A), code: 'u7t-pb-endpt', hint: 'Your line goes through ' + t(nm[0]) + ', not the midpoint. The bisector passes through the midpoint ' + t(ptT(s.M)) + '.' },
              { is: lineMP(n, s.B), code: 'u7t-pb-endpt', hint: 'Your line goes through ' + t(nm[1]) + ', not the midpoint. The bisector passes through the midpoint ' + t(ptT(s.M)) + '.' },
              { is: lineMP(m, s.M), code: 'u7t-pb-par', hint: 'That line has the slope of ' + t(nm) + ', so it is parallel to it. Use the perpendicular slope, ' + t(qT(n)) + '.' },
              { is: lineMP(qn(n), s.M), code: 'u7t-perp-sign', hint: 'Check the perpendicular slope: flip the fraction and change the sign.' }] },
              'Through the midpoint ' + t(ptT(s.M)) + ' with slope ' + t(qT(n)) + ':<br>' + psSteps(n, s.M),
              ['Use the midpoint and the perpendicular slope from (a) in slope–point form.', 'Then move every term to one side, with whole numbers and ' + t('A>0') + '.'], 'perpendicular bisector equation');
          } }] }
    ]
  });

  /* ---------- part makers used above (function declarations are hoisted) ---------- */
  var ROM = ['i', 'ii', 'iii', 'iv'], LET = ['A', 'B', 'C', 'D'];
  function fracSlope(r) { var mq = r.pick([[1, 2], [2, 3], [3, 4], [2, 5], [3, 2], [4, 3], [1, 3], [5, 2], [3, 5], [1, 4], [5, 3]]); return Q(r.pick([1, -1]) * mq[0], mq[1]); }
  function q8Shared(r, sg) {
    return find(function () { var mq = r.pick([[1, 1], [2, 1], [3, 1], [1, 2], [1, 3], [2, 3], [3, 2], [3, 4], [4, 3], [1, 4]]); return { m: Q(sg * mq[0], mq[1]), b: rnz(r, -5, 5) }; },
      function (s) { var X = -s.b / qv(s.m); return Number.isInteger(X) && Math.abs(X) <= 5 && X !== 0 && lattice(lineMB(s.m, s.b), [-6, 6], [-6, 6]).length >= 3; }, sg > 0 ? { m: [2, 3], b: 2 } : { m: [-2, 1], b: 4 });
  }
  function q8Part(s) {
    var m = s.m, b = s.b, L = lineMB(m, b), X = -b / qv(m);
    var p = B.fields('State the ' + t('x') + '-intercept, the ' + t('y') + '-intercept and the slope of the line.',
      [{ name: 'x-intercept', label: t('x') + '-intercept:', mode: 'math', keys: 'fraction' }, { name: 'y-intercept', label: t('y') + '-intercept:', mode: 'math', keys: 'fraction' }, { name: 'slope', label: 'Slope:', mode: 'math', keys: 'fraction' }],
      [icChk([X, 1], 'x', [b, 1]), icChk([b, 1], 'y', [X, 1]), K.slope(m, { graph: true })], [String(X), String(b), qT(m)],
      t('x') + '-intercept ' + t(X) + ', ' + t('y') + '-intercept ' + t(b) + ', slope ' + t(qT(m)),
      'The line crosses the ' + t('x') + '-axis at ' + t(ptT([X, 0])) + ' and the ' + t('y') + '-axis at ' + t(ptT([0, b])) + '.<br>From ' + t(ptT([0, b])) + ' to ' + t(ptT([m[1], b + m[0]])) + ': rise ' + t(m[0]) + ', run ' + t(m[1]) + ', so ' + t('m=' + qT(m)) + '.',
      ['The ' + t('x') + '-intercept is where the line crosses the ' + t('x') + '-axis; the ' + t('y') + '-intercept is where it crosses the ' + t('y') + '-axis.', 'Slope = rise ÷ run between two grid points on the line.'], 'read intercepts & slope ' + sT(L));
    p.bad = [[String(b), String(X), qT(m)], [String(X), String(b), qT(qn(m))]].filter(function (bd, i) { return i > 0 || X !== b; });
    return p;
  }
  function icPart(prompt, X, Y, xAlts, yAlts, sol, hints, text) {
    var p = B.fields(prompt, [{ name: 'x-intercept', label: t('x') + '-intercept:', mode: 'math', keys: 'fraction' }, { name: 'y-intercept', label: t('y') + '-intercept:', mode: 'math', keys: 'fraction' }],
      [icChk(toQ(X), 'x', toQ(Y), xAlts), icChk(toQ(Y), 'y', toQ(X), yAlts)], [qT(toQ(X)), qT(toQ(Y))], t('x') + '-intercept ' + t(qT(toQ(X))) + ', ' + t('y') + '-intercept ' + t(qT(toQ(Y))), sol, hints, text);
    p.bad = [[qT(toQ(Y)), qT(toQ(X))], [qT(qn(toQ(X))), qT(toQ(Y))]].filter(function (b) { return !near(qv(toQ(X)), qv(toQ(Y))); });
    return p;
  }
  function mbPart(m, b, eq, constFirst) {
    var p = B.fields('State the slope and the ' + t('y') + '-intercept of ' + t(eq) + '.', [{ name: 'Slope', label: 'Slope:', mode: 'math', keys: 'fraction' }, { name: 'y-intercept', label: t('y') + '-intercept:', mode: 'math', keys: 'fraction' }],
      [K.slope(m, { diag: function (v) { return near(v, b) ? { code: constFirst ? 'u7t-mb-order' : 'u7t-mb-swap', hint: constFirst ? 'The constant comes first here, but the slope is still the number multiplying ' + t('x') + '.' : 'That’s the ' + t('y') + '-intercept. The slope is the number multiplying ' + t('x') + '.' } : null; } }),
        valD([b, 1], [{ v: m, code: constFirst ? 'u7t-mb-order' : 'u7t-mb-swap', hint: 'That’s the slope. The ' + t('y') + '-intercept is the constant term' + (constFirst ? ' — here it is written first.' : '.') }])],
      [qT(m), String(b)], t('m=' + qT(m)) + ', ' + t('b=' + b),
      (constFirst ? 'Reorder: ' + t(eq) + ' is ' + t(sT(lineMB(m, b))) + '. ' : 'Compare with ' + t('y=mx+b') + ': ') + 'the slope is the coefficient of ' + t('x') + ', ' + t('m=' + qT(m)) + '; the ' + t('y') + '-intercept is the constant, ' + t('b=' + b) + '.',
      ['In ' + t('y=mx+b') + ', ' + t('m') + ' multiplies ' + t('x') + ' and ' + t('b') + ' is the constant.' + (constFirst ? ' The order of the terms doesn’t matter.' : '')], 'slope & y-int of ' + eq);
    p.bad = near(qv(m), b) ? [] : [[String(b), qT(m)]];
    return p;
  }
  function q18Part(s, fm) {
    var m = s.m, P = s.P, L = lineMP(m, P), W = [{ is: lineMB(m, P[1] - P[0]), code: 'u7t-dist', hint: 'Multiply the slope by <b>both</b> terms in the bracket: ' + t(qT(m) + '(x' + (P[0] < 0 ? '+' + (-P[0]) : '-' + P[0]) + ')=' + pol([[m, 'x'], [qn(qm(m, P[0])), '']])) + '.' },
      { is: lineMB(m, qs(-P[1], qm(m, P[0]))), code: 'u7t-y1-sign', hint: 'To get ' + t('y') + ' alone, ' + (P[1] > 0 ? 'add ' : 'subtract ') + t(Math.abs(P[1])) + ' on both sides.' }];
    return lineP(fm === 'general' ? 'Write it in <b>general form</b>.' : 'Write it in <b>slope–intercept form</b>.', L, { form: fm, wrong: W }, fm === 'general' ? psSteps(m, P) : siSteps(m, P),
      fm === 'general' ? ['Multiply both sides by the denominator ' + t(m[1]) + ' to clear the fraction.', 'Move every term to one side; make the ' + t('x') + '-coefficient positive.'] : ['Expand the bracket, then get ' + t('y') + ' by itself.', 'Use a common denominator to combine the constants.'], 'point-slope to ' + fm);
  }
  function q23Part(m, b) {
    var L = lineMB(m, b);
    return lineP('Write the equation of the line with slope ' + t(qT(m)) + ' and ' + t('y') + '-intercept ' + t(b) + '.', L, { form: 'slope-intercept', wrong: [{ is: lineMB(Q(b), m), code: 'u7t-si-swap', hint: 'In ' + t('y=mx+b') + ' the slope multiplies ' + t('x') + ' and the ' + t('y') + '-intercept is the constant.' }] },
      'Substitute ' + t('m=' + qT(m)) + ' and ' + t('b=' + b) + ' into ' + t('y=mx+b') + ': ' + t(sT(L)), ['Use ' + t('y=mx+b') + '.'], 'slope ' + qT(m) + ' and b ' + b);
  }
  function q25Part(s, horiz) {
    var h = s.h, k = s.k, L = horiz ? L3(0, 1, -k) : L3(1, 0, -h);
    return lineP('Write the equation of the <b>' + (horiz ? 'horizontal' : 'vertical') + '</b> line through ' + t(ptT([h, k])) + '.', L, { wrong: [{ is: horiz ? L3(0, 1, -h) : L3(1, 0, -k), code: 'u7t-hv-coord', hint: horiz ? 'Every point on a horizontal line has the same <b>' + t('y') + '</b>-value: here ' + t(k) + '.' : 'Every point on a vertical line has the same <b>' + t('x') + '</b>-value: here ' + t(h) + '.' }] },
      horiz ? 'A horizontal line keeps the same ' + t('y') + '-value at every point: ' + t('y=' + k) + '.' : 'A vertical line keeps the same ' + t('x') + '-value at every point: ' + t('x=' + h) + '.',
      ['Which coordinate stays the same along a ' + (horiz ? 'horizontal' : 'vertical') + ' line?'], (horiz ? 'horizontal' : 'vertical') + ' through point');
  }
  function q27Par(s) {
    var m = s.m, P = s.P, L = lineMP(m, P), given = sT(lineMB(m, s.b0));
    return lineP('Determine its equation if it is <b>parallel</b> to ' + t(given) + '. Write it in slope–intercept form.', L, { form: 'slope-intercept', wrong: [{ is: lineMP(perpS(m), P), code: 'u7t-perp-par', hint: 'That’s the negative reciprocal — a perpendicular line. Parallel lines have the <b>same</b> slope, ' + t(qT(m)) + '.' }, { is: lineMB(m, s.b0), code: 'line-point', hint: 'That is the given line itself. Keep the slope, but the new line must pass through ' + t(ptT(P)) + '.' }] },
      'Parallel ⟹ same slope, ' + t('m=' + qT(m)) + '.<br>' + siSteps(m, P), ['Keep the slope ' + t(qT(m)) + ' and use the point ' + t(ptT(P)) + '.'], 'parallel through P (slope-intercept)');
  }
  function q27Perp(s) {
    var G = s.G, sg = slopeOf(G), n = perpS(sg), P = s.P, L = lineMP(n, P);
    return lineP('Determine its equation if it is <b>perpendicular</b> to ' + t(gT(G)) + '. Write it in general form.', L, { form: 'general', wrong: [
      { is: lineMP(sg, P), code: 'u7t-perp-par', hint: 'That line has the same slope as ' + t(gT(G)) + ', so it is parallel. Use the negative reciprocal of ' + t(qT(sg)) + '.' },
      { is: lineMP(qn(n), P), code: 'u7t-perp-sign', hint: 'Flip the fraction <b>and</b> change the sign: the perpendicular slope is ' + t(qT(n)) + '.' },
      { is: lineMP(perpS(Q(G.A)), P), code: 'u7t-perp-par', hint: 'First find the slope of ' + t(gT(G)) + ': solve for ' + t('y') + ' (it is ' + t(qT(sg)) + ', not ' + t(G.A) + ').' }] },
      'Slope of ' + t(gT(G)) + ': ' + t(pol([[G.B, 'y']]) + '=' + pol([[-G.A, 'x'], [-G.C, '']])) + ', so ' + t('m=' + qT(sg)) + '.<br>Perpendicular: ' + t('m_{\\perp}=' + qT(n)) + '.<br>' + psSteps(n, P),
      ['Rearrange the given line to find its slope.', 'Perpendicular: negative reciprocal. Then use the point ' + t(ptT(P)) + ' and move every term to one side.'], 'perpendicular through P (general)');
  }
  /* Q21: four lines, two slopes, two intercepts each; one general and one point-slope per slope */
  function q21Shared(r) {
    return find(function () {
      var m1, mq = r.pick([[1, 2], [2, 1], [3, 1], [1, 3], [1, 1], [2, 3], [3, 2]]); m1 = Q(r.pick([1, -1]) * mq[0], mq[1]);
      var m2 = r.chance(0.7) ? perpS(m1) : Q(-Math.sign(m1[0]) * r.pick([1, 2, 3]), r.pick([1, 1, 2]));
      var bs = function () { var a = r.int(-3, 3), b = r.int(-3, 3); return Math.abs(a - b) >= 2 ? [a, b] : null; }, b1 = bs(), b2 = bs();
      if (!b1 || !b2 || near(qv(m1), qv(m2))) return null;
      var lines = [lineMB(m1, b1[0]), lineMB(m1, b1[1]), lineMB(m2, b2[0]), lineMB(m2, b2[1])], fm = [r.chance(0.5) ? 'g' : 'p']; fm[1] = fm[0] === 'g' ? 'p' : 'g'; fm[2] = r.chance(0.5) ? 'g' : 'p'; fm[3] = fm[2] === 'g' ? 'p' : 'g';
      var tex = [], okk = true;
      lines.forEach(function (L, i) {
        if (fm[i] === 'g') { tex[i] = gT(L); return; }
        var pts = lattice(L, [-3, 3], [-6, 6]).filter(function (p) { return p[0] !== 0; }); if (!pts.length) { okk = false; return; }
        tex[i] = pT(L, r.pick(pts));
      });
      if (!okk) return null;
      return { lines: lines, tex: tex, order: r.shuffle([0, 1, 2, 3]), pos: r.shuffle([0, 1, 2, 3]), pair: r.chance(0.5) ? [0, 1] : [2, 3] };
    }, function (s) { return s.lines.every(function (L) { return lattice(L, [-4, 4], [-4, 4]).length >= 2; }); }, null) || { lines: [lineMB([1, 2], -2), lineMB([1, 2], 2), lineMB(-2, 4), lineMB(-2, 0)], tex: [gT(lineMB([1, 2], -2)), pT(lineMB([1, 2], 2), [-2, 1]), gT(lineMB(-2, 4)), pT(lineMB(-2, 0), [1, -2])], order: [2, 1, 0, 3], pos: [0, 2, 3, 1], pair: [0, 1] };
  }
  function q21Figs(s) {
    var xr = [-4, 4], yr = [-4, 4], ix = [-3.75, 3.75];
    return '<div style="display:flex;flex-wrap:wrap;gap:10px 18px;justify-content:center;margin:.5em 0">' + s.pos.map(function (i, n) {
      return '<div style="text-align:center"><div style="font-weight:700;margin-bottom:2px">' + LET[n] + '</div>' + HW.graph({ x: xr, y: yr, grid: 1, labels: 2, max: 190, aria: 'graph ' + LET[n], segs: [{ pts: clip(s.lines[i], ix, ix), start: 'arrow', end: 'arrow' }] }) + '</div>';
    }).join('') + '</div>';
  }
})(window);
