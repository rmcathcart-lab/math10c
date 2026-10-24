/* Math 10C · Unit 8 Test (RF9) — the paper outcomes-based unit test (u8_test_A/B/C.tex) as generators.
 * The paper has three pages (RF9 Part 1 graphing and classifying, Part 2 substitution and elimination, Part 3 modelling),
 * each with BEG / PRG / MAS boxes; every question keeps its box (level) and its paper number, and defineTest puts them
 * Beginning → Progressing → Mastery. Each part takes its numbers from the seed, inside the range Versions A, B and C show
 * (their numbers are possible values), with a key and a worked solution for every version. A scientific calculator is
 * allowed (no graphing calculator); systems are solved by graphing by hand, substitution and elimination.
 * Conversions from paper: reading a graph → ordered pair (point keypad); "verify in both equations" → one box per equation
 * holding the substitution (e.g. 2(3)−(−2)=8), checked for the right numbers and value; graphing → the graph pad (two
 * lines, arrows); "show how you know" → the y = mx + b form of each equation plus the number of solutions; "define
 * variables, write a system, and solve" → the variables are named in the question, then a system part (two equation
 * boxes, any equivalent equations, either order) and an answer part; written explanations → checkable steps or multiple
 * choice with a reason for each wrong option (Q5b, Q12a, Q19 method). */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, Ln = HW.lines, DR = HW.draw, ex = HW.ex, F = HW.fmt;

  HW.addCodes({
    'u8t-gr-line': 'Graph: a line wrong', 'u8t-gr-shift': 'Graph: right slope, wrong place', 'u8t-gr-sign': 'Graph: slope sign wrong', 'u8t-gr-flip': 'Graph: run over rise',
    'u8t-gr-slope': 'Graph: right intercept, wrong slope', 'u8t-point-off': 'Graph: a plotted point is off the line', 'u8t-points-only': 'Graph: points without lines',
    'u8t-line-missing': 'Graph: a line of the system missing', 'u8t-line-extra': 'Graph: an extra line', 'u8t-graph': 'Graph wrong',
    'u8t-pt-swap': 'Solution with x and y swapped', 'u8t-one-eq': 'Point satisfies only one equation', 'u8t-pt-sign': 'Solution: sign of a coordinate',
    'u8t-sub-arith': 'Verification: arithmetic slip', 'u8t-sub-swap': 'Verification: x and y substituted in each other’s places', 'u8t-sub-point': 'Verification: substituted a different point',
    'u8t-sub-show': 'Verification: substitution not shown', 'u8t-sub-read': 'Verification: work can’t be read',
    'u8t-cls-kind': 'Classified the system wrongly (equations right)', 'u8t-cls-eqs': 'Both equations rewritten wrongly (classification right)', 'u8t-kind-read': 'Number of solutions not readable',
    'u8t-several': 'Several boxes wrong', 'u8t-two-slips': 'Two recognized slips',
    'u8t-nodiv': 'Didn’t divide every term by the y-coefficient', 'u8t-neg': 'Sign slip dividing by a negative',
    'u8t-k-mult': 'k: multiplied by the scale factor instead of dividing', 'u8t-k-sign': 'Sign of k', 'u8t-k-copy': 'k: copied the other coefficient without scaling',
    'u8t-6-same': 'Wrote the same line (infinitely many) instead', 'u8t-6-cross': 'Line crosses the given line (one solution)', 'u8t-6-parallel': 'Parallel line instead of the same line', 'u8t-6-misses': 'Line misses the required point',
    'u8t-distribute': 'Bracket multiplied into the first term only', 'u8t-move-const': 'Sign slip moving the constant', 'u8t-elim-rhs': 'Right sides combined the wrong way',
    'u8t-rhs-unscaled': 'Right side not scaled', 'u8t-clear-one-side': 'Fractions cleared on one side only', 'u8t-clear': 'Fractions cleared wrongly', 'u8t-frac-left': 'Fractions not all cleared',
    'u8t-res-true': 'Got a true statement (0 = 0) for a no-solution system', 'u8t-res-arith': 'False statement, but the constant worked out wrongly', 'u8t-res-false': 'Got a false statement for an infinitely-many system', 'u8t-res-not-elim': 'A variable left after eliminating', 'u8t-res-eq': 'Result not written as an equation',
    'u8t-ab-swap': 'Point substituted with the coordinates swapped', 'u8t-sys-one': 'One equation of the system right, the other wrong', 'u8t-sys-derived': 'Equation true for the answer but not a translation',
    'u8t-sum-diff': 'Sum and difference mixed up', 'u8t-diff-order': 'Difference subtracted in the wrong order', 'u8t-facts-swap': 'Totals attached to the wrong facts',
    'u8t-rhs-count': 'Used the count as the money total', 'u8t-price-swap': 'Prices matched to the wrong items', 'u8t-no-prices': 'Left out the prices',
    'u8t-mix-rhs': 'Mixture: percent or total used as the amount', 'u8t-mix-scale': 'Mixture: decimals on one side, percents on the other', 'u8t-mix-swap': 'Mixture: rates on the wrong variables', 'u8t-mix-total': 'Mixture: wrong total',
    'u8t-pct-dec': 'Percent not changed to a decimal', 'u8t-rate-swap': 'Rates matched to the wrong amounts', 'u8t-int-total': 'Interest used as the amount invested',
    'u8t-dist-speed': 'Used the distance as a speed', 'u8t-with-against': 'With/against speeds matched to the wrong times', 'u8t-time-speed': 'Multiplied distance by time',
    'u8t-one-way': 'No-wind time for one way only', 'u8t-concl': 'Times right, conclusion wrong', 'u8t-time': 'Round-trip time wrong',
    'u8t-eq-boxes': 'Equations in each other’s boxes', 'u8t-fee-rate': 'Fixed fee and rate swapped', 'u8t-no-fee': 'Fixed fee left out',
    'u8t-cost': 'Cost worked out wrongly', 'u8t-better': 'Costs right, wrong choice', 'u8t-pick-read': 'Choice not readable'
  });
  HW.addPartial({
    'u8t-gr-line': 'b', 'u8t-gr-shift': 's', 'u8t-gr-sign': 's', 'u8t-gr-flip': 's', 'u8t-gr-slope': 'b', 'u8t-point-off': 'b', 'u8t-points-only': 'b', 'u8t-line-missing': 's', 'u8t-line-extra': 's', 'u8t-graph': 'n',
    'u8t-pt-swap': 'b', 'u8t-one-eq': 'b', 'u8t-pt-sign': 's', 'u8t-sub-arith': 's', 'u8t-sub-swap': 'b', 'u8t-sub-point': 'n', 'u8t-sub-show': 'n',
    'u8t-cls-kind': 'b', 'u8t-cls-eqs': 'b', 'u8t-several': 'n', 'u8t-two-slips': 'b', 'u8t-nodiv': 's', 'u8t-neg': 's',
    'u8t-k-mult': 'b', 'u8t-k-sign': 's', 'u8t-k-copy': 'b', 'u8t-6-same': 'n', 'u8t-6-cross': 'n', 'u8t-6-parallel': 'b', 'u8t-6-misses': 'n',
    'u8t-distribute': 'b', 'u8t-move-const': 's', 'u8t-elim-rhs': 's', 'u8t-rhs-unscaled': 's', 'u8t-clear-one-side': 'b', 'u8t-clear': 'n',
    'u8t-res-true': 'b', 'u8t-res-arith': 's', 'u8t-res-false': 'b', 'u8t-res-not-elim': 'n', 'u8t-ab-swap': 'b', 'u8t-sys-one': 'b', 'u8t-sys-derived': 'n',
    'u8t-sum-diff': 'b', 'u8t-diff-order': 's', 'u8t-facts-swap': 'n', 'u8t-rhs-count': 'b', 'u8t-price-swap': 'b', 'u8t-no-prices': 'n',
    'u8t-mix-rhs': 'b', 'u8t-mix-scale': 's', 'u8t-mix-swap': 'b', 'u8t-mix-total': 'b', 'u8t-pct-dec': 'b', 'u8t-rate-swap': 'b', 'u8t-int-total': 'n',
    'u8t-dist-speed': 'b', 'u8t-with-against': 'b', 'u8t-time-speed': 'b', 'u8t-one-way': 'b', 'u8t-concl': 'b', 'u8t-time': 'n',
    'u8t-fee-rate': 'b', 'u8t-no-fee': 's', 'u8t-cost': 's', 'u8t-better': 'b'
  });

  /* ---------- numbers and LaTeX ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function r6(x) { return Math.round(x * 1e6) / 1e6 + 0; }
  function near(a, b) { return Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(b)); }
  function isInt(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
  function fr(p, q) { if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g + 0, q / g]; }
  function fv(f) { return Array.isArray(f) ? f[0] / f[1] : f; }
  function fT(f) { return Ln.frT(f[0], f[1]); }
  function iT(v) { v = Math.round(v) + 0; return Math.abs(v) >= 10000 ? F(v) : String(v); }
  function nT(x) { var v = r6(fv(x)); if (isInt(v)) return iT(v); var f = Array.isArray(x) ? fr(x[0], x[1]) : Ln.toFr(v); return f[1] <= 200 ? fT(f) : String(v); }   // exact: integer or fraction
  function dT(x) { x = r6(x); return isInt(x) ? iT(x) : String(x); }                                                // decimal display
  function pS(x) { var v = r6(fv(x)); if (isInt(v)) return String(Math.round(v)); var f = Array.isArray(x) ? fr(x[0], x[1]) : Ln.toFr(v); return f[0] + '/' + f[1]; }
  function par(x) { var s = nT(x); return fv(x) < 0 ? '(' + s + ')' : s; }
  function pt(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function ptt(p) { return t(pt(p)); }
  function samePt(a, b) { return near(fv(a[0]), fv(b[0])) && near(fv(a[1]), fv(b[1])); }
  function nz(r, a, b) { var v; do { v = r.int(a, b); } while (v === 0); return v; }
  function find(gen, test, fb) { for (var i = 0; i < 800; i++) { var v = gen(); if (v && test(v)) return v; } return fb; }
  function money(v) { v = r6(v); return '\\$' + (isInt(v) ? iT(v) : v.toFixed(2)); }
  function dp(p) { return isInt(p) ? (p / 100).toFixed(2) : String(r6(p / 100)); }        // 20 -> 0.20, 4.5 -> 0.045
  function pc(p) { return dT(p) + '\\%'; }
  /* terms [[coef, 'x'], …] -> LaTeX; coef a number or [p, q]; dec: non-integer coefficients as decimals */
  function T(terms, dec) {
    var s = '';
    terms.forEach(function (tm) {
      var c0 = tm[0], v = tm[1] || '', cv = r6(fv(c0)); if (Math.abs(cv) < 1e-12) return;
      var neg = cv < 0, a = Math.abs(cv), body;
      if (isInt(a)) body = (a === 1 && v) ? '' : iT(a);
      else if (dec) body = String(a);
      else { var f = Array.isArray(c0) ? fr(Math.abs(c0[0]), c0[1]) : Ln.toFr(a); body = '\\frac{' + Math.abs(f[0]) + '}{' + f[1] + '}'; }
      s += (neg ? '-' : (s ? '+' : '')) + body + v;
    });
    return s || '0';
  }
  function gT(a, b, c, vs, dec) { vs = vs || ['x', 'y']; return T([[a, vs[0]], [b, vs[1]]], dec) + '=' + (dec ? dT(c) : nT(c)); }
  /* "3(4)+2(-2)": the left side a·x + b·y with the point substituted */
  function subT(a, b, P) {
    var s = '';
    [[a, P[0]], [b, P[1]]].forEach(function (cv) {
      var c = cv[0], v = cv[1]; if (!c) return;
      var vt = fv(v) < 0 || Math.abs(c) !== 1 ? '(' + nT(v) + ')' : nT(v), co = Math.abs(c) === 1 ? '' : dT(Math.abs(c));
      s += (c < 0 ? '-' : s ? '+' : '') + co + vt;
    });
    return s;
  }
  function sysTex(e1, e2) { return '<div style="text-align:center;margin:6px 0">' + t('\\displaystyle {' + e1 + '}\\qquad\\quad {' + e2 + '}') + '</div>'; }

  /* ---------- lines: A x + B y + C = 0 (integers) ---------- */
  function line(A, B, C) { var g = gcd(gcd(A, B), C) || 1; A /= g; B /= g; C /= g; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; } return { A: A + 0, B: B + 0, C: C + 0 }; }
  function std(a, b, c) { return line(a, b, -c); }                                    // a x + b y = c
  function mbL(m, b) { var M = Array.isArray(m) ? fr(m[0], m[1]) : [m, 1], Bf = Array.isArray(b) ? fr(b[0], b[1]) : Ln.toFr(b); return line(M[0] * Bf[1], -M[1] * Bf[1], M[1] * Bf[0]); }
  function arr(Lo) { return [Lo.A, Lo.B, Lo.C]; }
  function slopeOf(Lo) { return fr(-Lo.A, Lo.B); }
  function yInt(Lo) { return fr(-Lo.C, Lo.B); }
  function onL(Lo, p) { return Math.abs(Lo.A * fv(p[0]) + Lo.B * fv(p[1]) + Lo.C) < 1e-9; }
  function sameL(a, b) { return a.A === b.A && a.B === b.B && a.C === b.C; }
  function parL(a, b) { return a.A * b.B === a.B * b.A; }
  function si(Lo, vars) { return Ln.tex(Lo, 'slope-intercept', null, vars); }
  function genT(Lo) { return gT(Lo.A, Lo.B, -Lo.C); }
  function mbTex(Lo) { return { m: fT(slopeOf(Lo)), b: fT(yInt(Lo)) }; }

  /* ---------- graphs (as in the Lesson 1 practice) ---------- */
  var W6 = [[-6, 6], [-6, 6]], BLUE = '#2a5db0', RED = '#c4532a';
  function latS(Lo, win) {
    var out = [];
    for (var x = Math.ceil(win[0][0]); x <= win[0][1]; x++) { if (Lo.B === 0) continue; var y = -(Lo.A * x + Lo.C) / Lo.B; if (isInt(y) && y >= win[1][0] - 1e-9 && y <= win[1][1] + 1e-9) out.push([x, r6(y)]); }
    return out;
  }
  function lineV(Lo, win) { var L2 = latS(Lo, win); if (L2.length < 2) L2 = latS(Lo, [[-60, 60], [-1e5, 1e5]]); return { pts: [], pieces: [{ v: [L2[0], L2[L2.length - 1]], s: 'arrow', e: 'arrow' }], join: 'none' }; }
  function clipV(Lo, win) {   // the part of the line inside the window
    var xr = win[0], yr = win[1], P = [];
    [xr[0], xr[1]].forEach(function (x) { var y = -(Lo.A * x + Lo.C) / Lo.B; if (y >= yr[0] - 1e-9 && y <= yr[1] + 1e-9) P.push([x, r6(y)]); });
    if (Lo.A !== 0) [yr[0], yr[1]].forEach(function (y) { var x = -(Lo.B * y + Lo.C) / Lo.A; if (x >= xr[0] - 1e-9 && x <= xr[1] + 1e-9) P.push([r6(x), y]); });
    P.sort(function (a, b) { return a[0] - b[0]; });
    return { v: [P[0], P[P.length - 1]], s: 'none', e: 'none' };
  }
  function sysFig(L1, L2, aria) {
    var seg = function (L, col) { return { pts: clipV(L, W6).v, color: col, start: 'arrow', end: 'arrow' }; };
    return '<div class="fig">' + HW.graph({ x: W6[0], y: W6[1], grid: 1, labels: 2, max: 320, segs: [seg(L1, BLUE), seg(L2, RED)], aria: aria || 'two lines on a grid' }) + '</div>';
  }
  function splitBends(value) {   // the pad continues a line drawn from the end of another one: read each straight run as its own line
    var v = DR.norm(value), out = [];
    v.pieces.forEach(function (pc) {
      if (pc.v.length < 3) { out.push(pc); return; }
      var runs = [[pc.v[0], pc.v[1]]];
      for (var i = 2; i < pc.v.length; i++) {
        var run = runs[runs.length - 1], a = run[run.length - 2], b = run[run.length - 1], c = pc.v[i];
        if (Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) < 1e-9) run.push(c); else runs.push([b, c]);
      }
      runs.forEach(function (rv, k) { out.push({ v: rv, s: k === 0 ? pc.s : (pc.s === 'arrow' && pc.e === 'arrow' ? 'arrow' : 'closed'), e: k === runs.length - 1 ? pc.e : (pc.s === 'arrow' && pc.e === 'arrow' ? 'arrow' : 'closed') }); });
    });
    return { pts: v.pts, pieces: out, join: v.join };
  }
  function propL(S, L) {
    var a = [S.A, S.B, S.C], b = [L.A, L.B, L.C], sa = Math.max.apply(null, a.map(Math.abs)), sb = Math.max.apply(null, b.map(Math.abs));
    for (var i = 0; i < 3; i++) for (var j = i + 1; j < 3; j++) if (Math.abs(a[i] * b[j] - a[j] * b[i]) > 1e-6 * sa * sb) return false;
    return true;
  }
  function geoL(g, k) { var L = g.lines[k]; return { A: L.A, B: L.B, C: -L.C }; }
  /* graph the two lines of a system: arrows on both ends; o.wrong: [{ L, code, hint }] classic wrong lines */
  function sysGraph(prompt, Ls, names, o, sol, hints, text) {
    o = o || {};
    var win = W6, uNames = names.map(function (n) { return t(n); });
    var key = { pts: [], pieces: Ls.map(function (L) { return lineV(L, win).pieces[0]; }), join: 'none' };
    var exact = K.graphExact(key);
    var W0 = (o.wrong || []).filter(function (w) { return !Ls.some(function (L) { return sameL(L, w.L); }) && latS(w.L, win).length >= 2; });
    function diagnose(S, Tl, name) {
      var sm = S.B === 0 ? null : -S.A / S.B, tm = -Tl.A / Tl.B, sb = S.B === 0 ? null : -S.C / S.B, tb = -Tl.C / Tl.B, nr = function (a, b) { return a != null && Math.abs(a - b) < 1e-9; };
      if (S.B === 0) return wrong('u8t-gr-line', 'One of your lines is vertical. Check your line for ' + name + ': substitute two of its points into the equation.');
      if (nr(sm, tm)) return wrong('u8t-gr-shift', 'Your line for ' + name + ' has the right slope but is in the wrong place: it should cross the ' + t('y') + '-axis at ' + ptt([0, Ln.toFr(r6(tb))]) + '.');
      if (nr(sb, tb)) {
        if (nr(sm, -tm)) return wrong('u8t-gr-sign', 'Your line for ' + name + ' starts in the right place, but it goes the wrong way: its slope is ' + t(nT(r6(tm))) + ', so it ' + (tm < 0 ? 'falls' : 'rises') + ' from left to right.');
        if (tm !== 0 && nr(sm, 1 / tm)) return wrong('u8t-gr-flip', 'Your line for ' + name + ' starts in the right place. Slope is <b>rise over run</b>: ' + t('m=' + nT(r6(tm))) + ' — you stepped run over rise.');
        return wrong('u8t-gr-slope', 'Your line for ' + name + ' crosses the ' + t('y') + '-axis in the right place — now check its slope: ' + t('m=' + nT(r6(tm))) + '.');
      }
      if (nr(sm, -tm) && nr(sb, -tb)) return wrong('u8t-gr-sign', 'Your line for ' + name + ' has the signs of the slope and the intercept both switched. When you divide by a negative, every sign changes.');
      return wrong('u8t-gr-line', 'Check your line for ' + name + ': substitute two of the points you used into ' + name + ' — both must make it true.');
    }
    var check = function (resp) {
      var v = splitBends(resp);
      if (DR.empty(v)) return form('empty', 'Draw your answer on the grid first.');
      var r0 = exact(v);
      if (r0.v === 'wrong' && (r0.code === 'graph-length' || r0.code === 'graph-ends')) return wrong('graph-arrows', 'Right lines — but a line keeps going forever: put <b>arrows</b> on both ends of each line (use the <b>Ends</b> tool).');
      if (r0.v !== 'wrong' || r0.code !== 'graph') return r0;
      var g = DR.geom(v), have = Object.keys(g.lines).map(function (k) { return geoL(g, k); });
      if (!have.length) {
        var off = v.pts.filter(function (p) { return !Ls.some(function (L) { return onL(L, p); }); })[0];
        if (off) return wrong('u8t-point-off', ptt(off) + ' is not on either line. Substitute it into the equations to check.');
        return wrong('u8t-points-only', 'Your points are on the lines — now draw the lines through them with the <b>╱ Line</b> tool.');
      }
      var hit = have.map(function (S) { for (var i = 0; i < Ls.length; i++) if (propL(S, Ls[i])) return i; return -1; });
      var extra = have.filter(function (S, j) { return hit[j] < 0; }), miss = [];
      Ls.forEach(function (L, i) { if (hit.indexOf(i) < 0) miss.push(i); });
      for (var j = 0; j < extra.length; j++) for (var w = 0; w < W0.length; w++) if (propL(extra[j], W0[w].L)) return wrong(W0[w].code, W0[w].hint);
      if (!extra.length && miss.length) return wrong('u8t-line-missing', 'Correct so far — still to draw: ' + miss.map(function (i) { return uNames[i]; }).join(' and ') + '.');
      if (extra.length === 1 && miss.length === 1) return diagnose(extra[0], Ls[miss[0]], uNames[miss[0]]);
      if (extra.length && !miss.length) return wrong('u8t-line-extra', 'Both lines are there, but you have drawn ' + (extra.length === 1 ? 'an extra line' : 'extra lines') + ' as well. Undo or clear the extra ' + (extra.length === 1 ? 'one' : 'ones') + '.');
      return wrong('u8t-graph', null);
    };
    var p = K.P.graph(prompt, { x: win[0], y: win[1], grid: 1, labels: 2, mode: 'lines', defaultEnd: 'arrow', max: 360 }, check, key, sol, hints, text);
    p.bad = W0.map(function (w) { return { pts: [], pieces: [lineV(w.L, win).pieces[0], key.pieces[1]], join: 'none' }; }).concat([{ pts: [], pieces: [key.pieces[0]], join: 'none' }]).filter(function (b) { return !DR.same(b, key); });
    return p;
  }

  /* ---------- answer checkers ---------- */
  var REMAP = { 'pt-swap': 'u8t-pt-swap', 'sys-one-eq': 'u8t-one-eq', 'pt-sign': 'u8t-pt-sign' };
  function remap(chk) { return function (resp) { var r = chk(resp); return r && r.code && REMAP[r.code] ? { v: r.v, code: REMAP[r.code], hint: r.hint } : r; }; }
  /* the solution of a system: P = [x, y] | 'none' | 'inf'; Ls the two lines; opt.wrong [{ is: [x, y], code, hint }] */
  function pointPart(prompt, P, Ls, opt, sol, hints, text) {
    opt = opt || {};
    var W = (opt.wrong || []).filter(function (w) { return isFinite(fv(w.is[0])) && isFinite(fv(w.is[1])) && !samePt(w.is, P); });
    var seen = {}; W = W.filter(function (w) { var k = pS(w.is[0]) + ',' + pS(w.is[1]); if (seen[k]) return false; seen[k] = 1; return true; });
    var p = K.P.point(prompt, P, { system: Ls.map(arr), vars: opt.vars, wrong: W }, sol, hints, text);
    p.check = remap(p.check);
    var bad = ['no solution'];
    if (!near(fv(P[0]), fv(P[1]))) bad.push('(' + pS(P[1]) + ', ' + pS(P[0]) + ')');
    W.forEach(function (w) { bad.push('(' + pS(w.is[0]) + ', ' + pS(w.is[1]) + ')'); });
    p.bad = bad;
    return p;
  }
  function numOf(x) {
    var s = String(x == null ? '' : x).replace(/\\(text|mathrm)\{([^{}]*)\}/g, '$2').replace(/\\[;: ]|~/g, ' ').trim();
    s = s.replace(/^[a-zA-Z]\s*=\s*/, '').replace(/\s*(km\/h|km|kg|mL|ml|L|h|hrs?|hours?|°|\^\{?\\circ\}?|degrees?|dollars?|guests?|visits?|wins?|losses|loss|games?|tickets?|bills?|baskets?)\s*\.?\s*$/i, '');   // k = -3, 18 kg, 15 wins
    s = s.replace(/\\\$|\$|\\%|%|\\,|,(?=\d{3}\b)|\s/g, '').trim(); if (!s) return null;
    var p = HW.parse.number(s); if (p.ok) return p.value;
    var a = ex.parse(s); if (!a.ok) return null; var v = ex.value(a.ast); return isFinite(v) ? v : null;
  }
  /* one number (plain or LaTeX, fractions fine); diag(v) -> { code, hint } */
  function valChk(target, diag, opt) {
    opt = opt || {};
    return function (resp) {
      var raw = String(resp == null ? '' : resp).trim();
      if (!raw) return form('empty', 'Type your answer first.');
      var v = numOf(raw);
      if (v == null) return form('notnumber', 'Type a single number' + (opt.frac ? ' (a fraction is fine).' : '.'));
      if (opt.tol ? Math.abs(v - target) <= opt.tol : near(v, target)) return ok();
      var h = diag ? diag(v) : null;
      return h ? wrong(h.code, h.hint) : wrong('value', null);
    };
  }
  /* several boxes, all checked: one wrong box → its code; several → 'u8t-two-slips' if they are all recognized slips,
     else 'u8t-several'; a box left empty while others are filled → 'incomplete' (when the filled ones are right) */
  function isEmptyRes(x) { return x.v === 'form' && x.code === 'empty'; }
  function allChk(checkers, labels, opt) {
    opt = opt || {};
    return function (resp) {
      resp = resp || [];
      if (opt.pre) { var h0 = opt.pre(resp); if (h0) return h0; }
      var res = checkers.map(function (c, i) { return c(resp[i] == null ? '' : resp[i]); });
      var lab = function (i) { return (labels[i] ? '<b>' + labels[i] + ':</b> ' : '') + (res[i].hint || 'Check this one again.'); };
      var W = [], E = [], Fm = -1;
      res.forEach(function (x, i) { if (x.v === 'wrong') W.push(i); else if (isEmptyRes(x)) E.push(i); else if (x.v === 'form' && Fm < 0) Fm = i; });
      if (E.length === res.length) return form('empty', 'Fill in the boxes first.');
      if (!W.length && E.length) return wrong('incomplete', lab(E[0]) + ' Fill in <b>every</b> box.');
      if (!W.length) return Fm < 0 ? ok() : { v: 'form', code: res[Fm].code, hint: lab(Fm) };
      if (W.length === 1 && !E.length) return { v: 'wrong', code: res[W[0]].code, hint: lab(W[0]) };
      if (opt.multi) { var m = opt.multi(W, res); if (m) return { v: 'wrong', code: m, hint: lab(W[0]) }; }
      var P = HW.PARTIAL || {}, known = !E.length && W.every(function (i) { var c = res[i].code; return (P.small && P.small[c]) || (P.big && P.big[c]); });
      return { v: 'wrong', code: known ? 'u8t-two-slips' : 'u8t-several', hint: lab(W[0]) };
    };
  }
  function fieldsPart(prompt, fields, checkers, keys, answer, sol, hints, text, opt) {
    return { prompt: prompt, input: { type: 'fields', fields: fields }, check: allChk(checkers, fields.map(function (f) { return f.name || String(f.label || '').replace(/:\s*$/, ''); }), opt), key: keys, answer: answer, solution: sol, hints: hints || [], text: text };
  }
  /* "verify": the left side with the point substituted, e.g. 2(3)-(-2)=8 (the value after = is optional) */
  function numsIn(ast, out) { if (!ast || typeof ast !== 'object') return out; if (ast.t === 'num') out.push(Math.abs(ast.v)); ['a', 'b', 'n'].forEach(function (k) { if (ast[k]) numsIn(ast[k], out); }); (ast.args || []).forEach(function (x) { numsIn(x, out); }); return out; }
  function hasAll(list, need) { var l = list.slice(); for (var i = 0; i < need.length; i++) { var j = l.indexOf(need[i]); if (j < 0) return false; l.splice(j, 1); } return true; }
  function subChk(E, P) {
    var want = E.a * P[0] + E.b * P[1], swp = E.a * P[1] + E.b * P[0];
    /* the work shows each term: its value, or the coordinate itself (2(3) or 6; (−2) or 2) */
    var shown = function (ns, Q) { return [[E.a, Q[0]], [E.b, Q[1]]].every(function (cv) { return !cv[0] || ns.indexOf(Math.abs(cv[1])) >= 0 || ns.indexOf(Math.abs(cv[0] * cv[1])) >= 0; }); };
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim();
      if (!s) return form('empty', 'Type the substitution, e.g. ' + t('2(3)-(-1)=7') + '.');
      var sides = s.split('=');
      if (sides.length > 2) return form('u8t-sub-read', 'Type the left side with the values put in, then ' + t('=') + ' and its value, e.g. ' + t('2(3)-(-1)=7') + '.');
      var a = ex.parse(sides[0]), v = a.ok ? ex.value(a.ast) : NaN;
      if (!a.ok || !isFinite(v)) return form('u8t-sub-read', 'Put the <b>numbers</b> in place of ' + t('x') + ' and ' + t('y') + ' (with brackets around negatives), e.g. ' + t('2(3)-(-1)') + '.');
      if (sides.length === 2 && sides[1].trim()) { var b = ex.parse(sides[1]), w = b.ok ? ex.value(b.ast) : NaN; if (!isFinite(w)) return form('u8t-sub-read', 'After the ' + t('=') + ' sign, type the value of the left side.'); if (!near(w, v)) return wrong('u8t-sub-arith', 'Your substitution is worth ' + t(dT(v)) + ', not ' + t(dT(w)) + '. Work it out again, carefully with the signs.'); }
      var single = a.ast.t === 'num' || (a.ast.t === 'neg' && a.ast.a && a.ast.a.t === 'num'), ns = numsIn(a.ast, []);
      if (single) return wrong('u8t-sub-show', 'Show the substitution: write the left side with the ' + t('x') + '- and ' + t('y') + '-values put in, like ' + t('2(3)-(-1)=7') + '.');
      if (near(v, want) && shown(ns, P)) return ok();
      if (!near(swp, want) && near(v, swp) && shown(ns, [P[1], P[0]])) return wrong('u8t-sub-swap', 'The ' + t('x') + '-value goes in for ' + t('x') + ' and the ' + t('y') + '-value for ' + t('y') + ' — you have them the other way round.');
      if (near(v, want)) return form('u8t-sub-show', 'Show the substitution: write the left side with the ' + t('x') + '- and ' + t('y') + '-values put in, like ' + t('2(3)-(-1)=7') + '.');
      if (shown(ns, P) || hasAll(ns, [Math.abs(P[0]), Math.abs(P[1])])) return wrong('u8t-sub-arith', 'Check the arithmetic, especially the signs: the left side should work out to the right side, ' + t(dT(E.c)) + '.');
      return wrong('u8t-sub-point', 'Substitute the solution of the system, and check that it makes this equation true.');
    };
  }
  function verifyPart(prompt, E, names, P, text) {
    var keys = E.map(function (e) { return subT(e.a, e.b, P) + '=' + nT(e.c); });
    var work = function (e) { var parts = []; [[e.a, P[0]], [e.b, P[1]]].forEach(function (cv) { if (cv[0]) parts.push(cv[0] * cv[1]); }); return parts.map(function (x, i) { return (x < 0 ? '-' : i ? '+' : '') + iT(Math.abs(x)); }).join(''); };
    return fieldsPart(prompt, E.map(function (e, i) { return { label: 'In ' + t(names[i]) + ':', name: 'In ' + t(names[i]), mode: 'math', keys: 'eq', placeholder: ' ' }; }),
      E.map(function (e) { return subChk(e, P); }), keys,
      keys.map(function (k, i) { return 'In ' + t(names[i]) + ': ' + t(k) + ' ✓'; }).join('<br>'),
      'Substitute ' + t('x=' + nT(P[0])) + ' and ' + t('y=' + nT(P[1])) + ' into <b>each</b> equation:<br>' + E.map(function (e, i) { return t(names[i]) + ': ' + t(subT(e.a, e.b, P) + '=' + work(e) + '=' + nT(e.c)) + ' ✓'; }).join('<br>') + '<br>The point makes <b>both</b> equations true, so it is the solution of the system.',
      ['Put the ' + t('x') + '-value in for ' + t('x') + ' and the ' + t('y') + '-value in for ' + t('y') + ', in <b>both</b> equations.', 'Use brackets around negative values, e.g. ' + t('2(3)-(-2)=8') + '.'], text);
  }
  /* the y = mx + b form of an equation (K.line), with classic rearranging slips */
  function rearrWrongs(Lo) {
    var A = Lo.A, B = Lo.B, C = -Lo.C, m = fr(-A, B), b = fr(C, B), W = [];   // A x + B y = C
    if (Math.abs(B) > 1) { W.push({ is: mbL(fr(-A, B), C), code: 'u8t-nodiv', hint: 'Divide <b>every</b> term by the coefficient of ' + t('y') + ' — the constant too.' }); W.push({ is: mbL(-A * (B < 0 ? -1 : 1), b), code: 'u8t-nodiv', hint: 'Divide <b>every</b> term by the coefficient of ' + t('y') + ' — the ' + t('x') + '-term too.' }); }
    if (B < 0) { W.push({ is: mbL([-m[0], m[1]], [-b[0], b[1]]), code: 'u8t-neg', hint: 'The coefficient of ' + t('y') + ' is negative, so dividing by it changes <b>every</b> sign.' }); W.push({ is: mbL(m, [-b[0], b[1]]), code: 'u8t-neg', hint: 'Dividing by a negative changes the sign of the constant too.' }); W.push({ is: mbL([-m[0], m[1]], b), code: 'u8t-neg', hint: 'Dividing by a negative changes the sign of the ' + t('x') + '-term too.' }); }
    else W.push({ is: mbL([-m[0], m[1]], b), code: 'line-slope-sign', hint: 'Moving the ' + t('x') + '-term to the other side changes its sign.' });
    return W.filter(function (w) { return !sameL(w.is, Lo); });
  }
  function siChk(Lo) { return K.line(Lo, { form: 'slope-intercept', wrong: rearrWrongs(Lo) }); }
  /* write a system: T = [[A, B, C], [A, B, C]] (A·v1 + B·v2 + C = 0); either order, any equivalent equations.
     opt: vars, labels, keyTex, names (what each equation says), tips, wrong: [{ eq: [A, B, C] | text, code, hint }] */
  function eqOf(e, vars) { if (Array.isArray(e)) return e; var r = Ln.read(e, vars); return r.ok ? [r.a, r.b, r.c] : null; }
  function onPt(L, P) { var s = Math.max(1, Math.abs(L[2]), Math.abs(L[0] * P[0]), Math.abs(L[1] * P[1])); return Math.abs(L[0] * P[0] + L[1] * P[1] + L[2]) < 1e-7 * s; }
  function solve2(A, B) { var d = A[0] * B[1] - A[1] * B[0]; if (Math.abs(d) < 1e-12) return null; return [(-A[2] * B[1] + A[1] * B[2]) / d, (-A[0] * B[2] + A[2] * B[0]) / d]; }
  var READWHY = { 'no-eq': 'Each box needs an equation with an equals sign.', unreadable: 'One of your equations can’t be read — check the brackets and signs.', 'not-linear': 'Each equation should be linear: no variables multiplied together or squared.' };
  function sysPart(prompt, Tg, opt, sol, hints, text) {
    var vars = opt.vars, names = opt.names || ['the first fact', 'the second fact'];
    var wr = (opt.wrong || []).map(function (w) { return { L: eqOf(w.eq, vars), code: w.code, hint: w.hint }; }).filter(function (w) { return w.L && !Ln.same(w.L, Tg[0]) && !Ln.same(w.L, Tg[1]); });
    var P = solve2(Tg[0], Tg[1]);
    function match(L) { for (var j = 0; j < 2; j++) if (Ln.same(L, Tg[j])) return j; return -1; }
    var check = function (resp) {
      resp = resp || [];
      var a = String(resp[0] || '').trim(), b = String(resp[1] || '').trim();
      if (!a && !b) return form('empty', 'Write both equations.');
      var rs = [a ? Ln.read(a, vars) : null, b ? Ln.read(b, vars) : null];
      for (var i = 0; i < 2; i++) if (rs[i] && !rs[i].ok) return form('line-' + rs[i].why, rs[i].why === 'vars' ? 'Use only the letters ' + t(vars[0]) + ' and ' + t(vars[1]) + ' from the question.' : READWHY[rs[i].why] || READWHY.unreadable);
      var Ls = rs.map(function (q) { return q ? [q.a, q.b, q.c] : null; }), m = Ls.map(function (L) { return L ? match(L) : -1; });
      if (!a || !b) { var one = Ls[0] || Ls[1], j0 = match(one); return j0 >= 0 ? wrong('incomplete', 'Your equation for ' + names[j0] + ' is right — now write one for ' + names[1 - j0] + ' in the other box.') : wrong('sys-eq', 'Write <b>two</b> equations — one for each fact.'); }
      if (m[0] >= 0 && m[1] >= 0 && m[0] !== m[1]) return ok();
      if (m[0] >= 0 && m[0] === m[1]) return wrong('sys-same', 'Both of your equations describe ' + names[m[0]] + '. Write one equation for each fact.');
      for (i = 0; i < 2; i++) if (m[i] < 0) for (var k = 0; k < wr.length; k++) if (Ln.same(Ls[i], wr[k].L)) return wrong(wr[k].code, wr[k].hint);
      var g = m[0] >= 0 ? 0 : m[1] >= 0 ? 1 : -1;
      if (g >= 0) {
        var miss = 1 - m[g], der = P && onPt(Ls[1 - g], P);
        return wrong(der ? 'u8t-sys-derived' : 'u8t-sys-one', 'Your equation for ' + names[m[g]] + ' is right. ' + (der ? 'Your other equation is true for the answer, but it isn’t a fact of the question translated — write the equation for ' + names[miss] + ' straight from the words.' : 'Check the one for ' + names[miss] + (opt.tips ? ': ' + opt.tips[miss] : '.')));
      }
      if (P && onPt(Ls[0], P) && onPt(Ls[1], P)) return wrong('u8t-sys-derived', 'Both equations are true for the answer, but they aren’t the facts of the question — write one equation straight from each fact (no solving yet).');
      return wrong('sys-eq', null);
    };
    var labels = opt.labels || ['Equation 1', 'Equation 2'];
    var bad = (opt.wrong || []).map(function (w) { return typeof w.eq === 'string' ? [opt.keyTex[0], w.eq] : null; }).filter(Boolean);
    return { prompt: prompt, input: { type: 'fields', fields: labels.map(function (l) { return { label: l, mode: 'math', keys: 'eq', vars: vars, placeholder: ' ' }; }) },
      check: check, key: opt.keyTex, answer: (opt.showTex || opt.keyTex).map(function (k) { return t(k); }).join('<br>'), solution: sol, hints: hints || [], text: text,
      good: [opt.keyTex.slice().reverse()], bad: bad.concat([[opt.keyTex[0], '']]) };
  }
  /* one equation in the question's letters */
  function eqChk(Tg, vars, wrongs) {
    var wr = (wrongs || []).map(function (w) { return { L: eqOf(w.eq, vars), code: w.code, hint: w.hint }; }).filter(function (w) { return w.L && !Ln.same(w.L, Tg); });
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim(); if (!s) return form('empty', 'Type your equation first.');
      var q = Ln.read(s, vars); if (!q.ok) return form('line-' + q.why, q.why === 'vars' ? 'Use only the letters ' + t(vars[0]) + ' and ' + t(vars[1]) + '.' : READWHY[q.why] || READWHY.unreadable);
      var L = [q.a, q.b, q.c]; if (Ln.same(L, Tg)) return ok();
      for (var k = 0; k < wr.length; k++) if (Ln.same(L, wr[k].L)) return wrong(wr[k].code, wr[k].hint);
      return wrong('sys-eq', null);
    };
  }
  /* two (or more) answer numbers. want: numbers; opt: names, sys (two lines, in the order of the boxes), wrong [{ v, code, hint }], money, tol */
  function numsChk(want, opt) {
    opt = opt || {}; var names = opt.names;
    return function (resp) {
      resp = resp || []; var vals = [], blank = 0;
      for (var i = 0; i < want.length; i++) { var s = String(resp[i] == null ? '' : resp[i]).trim(); if (!s) { blank++; vals.push(null); continue; } var v = numOf(s); if (v == null) return form('notnumber', 'Enter a single number for the ' + names[i] + (opt.money ? ' (no $ sign needed).' : '.')); vals.push(v); }
      if (blank === want.length) return form('empty', 'Fill in the boxes first.');
      var eq = function (v, w) { return v != null && (opt.tol ? Math.abs(v - w) <= opt.tol : near(v, w)); };
      if (blank) { var anyR = vals.some(function (v, j) { return eq(v, want[j]); }); return wrong(anyR ? 'incomplete' : 'value', 'Fill in <b>every</b> box.'); }
      if (vals.every(function (v, j) { return eq(v, want[j]); })) return ok();
      var W0 = (opt.wrong || []).filter(function (w) { return w.v.every(function (x, j) { return isFinite(x) && near(vals[j], x); }) && !w.v.every(function (x, j) { return near(x, want[j]); }); })[0];
      if (W0) return wrong(W0.code, W0.hint);
      if (want.length === 2 && near(vals[0], want[1]) && near(vals[1], want[0]) && !near(want[0], want[1])) return wrong('swap-answer', opt.swapHint || 'Right numbers, wrong boxes: which one is the ' + names[0] + '?');
      if (opt.sys && want.length === 2) {
        var s0 = onPt(opt.sys[0], vals), s1 = onPt(opt.sys[1], vals);
        if (s0 !== s1) return wrong('u8t-one-eq', 'Your numbers fit one of the facts but not the other. Substitute them into both equations and look for the slip.');
      }
      var right = vals.map(function (v, j) { return eq(v, want[j]); });
      if (want.length === 2 && right.some(Boolean)) { var j = right.indexOf(false); return wrong('one-value', 'Your ' + names[1 - j] + ' is right — substitute it into one of the equations to find the ' + names[j] + ' again.'); }
      if (opt.diag) { var h = opt.diag(vals); if (h) return wrong(h.code, h.hint); }
      return wrong('value', null);
    };
  }
  function numsPart(prompt, fields, want, opt, sol, hints, text) {
    opt = opt || {};
    var show = function (v) { return opt.money ? money(v).replace('\\$', '') : dT(v); };
    return { prompt: prompt, input: { type: 'fields', fields: fields.map(function (f) { return { label: f.label, before: f.before, after: f.after }; }) },
      check: numsChk(want, Object.assign({ names: fields.map(function (f) { return f.name; }) }, opt)), key: want.map(function (v) { return String(r6(v)); }),
      answer: fields.map(function (f, i) { return f.label + ' ' + (f.before ? f.before : '') + t(show(want[i])) + (f.after ? ' ' + f.after : ''); }).join('<br>'),
      solution: sol, hints: hints || [], text: text, bad: (opt.bad || []).concat(want.length === 2 && !near(want[0], want[1]) ? [[String(r6(want[1])), String(r6(want[0]))]] : []) };
  }
  function mc(r, prompt, opts, sol, hints, text, keep) {
    var seen = {}, o2 = opts.filter(function (o) { if (seen[o.html]) return false; seen[o.html] = 1; return true; });
    return K.P.mc(r, prompt, o2, sol, hints, text, keep);
  }

  /* ---------- worked-solution text ---------- */
  /* solve E1, E2 ({ a, b, c }: a·v1 + b·v2 = c) by eliminating v2, then back-substitute into E1 */
  function backT(E, P, vs) {
    var first = E.a === 1 ? par(P[0]) : E.a === -1 ? '-' + par(P[0]) : dT(E.a) + '(' + nT(P[0]) + ')';
    var rhs = r6(E.c - E.a * fv(P[0]));
    return t(first + T([[E.b, vs[1]]]).replace(/^([^-])/, '+$1') + '=' + dT(E.c)) + ', so ' + t(T([[E.b, vs[1]]]) + '=' + dT(rhs)) + (Math.abs(E.b) === 1 && E.b > 0 ? '' : ' and ' + t(vs[1] + '=' + nT(P[1]))) + '.';
  }
  function elimText(E1, E2, P, vs, dec) {
    vs = vs || ['x', 'y'];
    var b1 = E1.b, b2 = E2.b, L = lcm(Math.abs(b1), Math.abs(b2)), m1 = L / Math.abs(b1), m2 = L / Math.abs(b2), same = (b1 > 0) === (b2 > 0);
    var S1 = { a: m1 * E1.a, b: m1 * b1, c: m1 * E1.c }, S2 = { a: m2 * E2.a, b: m2 * b2, c: m2 * E2.c }, s = '';
    if (m1 !== 1 || m2 !== 1) s += 'Make the ' + t(vs[1]) + '-terms ' + (same ? 'match' : 'opposites') + ': multiply ' + (m1 !== 1 && m2 !== 1 ? 'the first equation by ' + t(m1) + ' and the second by ' + t(m2) : m1 !== 1 ? 'the first equation by ' + t(m1) : 'the second equation by ' + t(m2)) + '.<br>' + t(gT(S1.a, S1.b, S1.c, vs, dec)) + ' &nbsp; and &nbsp; ' + t(gT(S2.a, S2.b, S2.c, vs, dec)) + '<br>';
    else s += 'The ' + t(vs[1]) + '-terms are ' + (same ? 'the same' : 'opposites') + ', so ' + (same ? 'subtract' : 'add') + ' the equations.<br>';
    var A = same ? S1.a - S2.a : S1.a + S2.a, C = same ? S1.c - S2.c : S1.c + S2.c;
    s += (same ? 'Subtract' : 'Add') + ': ' + t(T([[r6(A), vs[0]]], dec) + '=' + dT(C)) + (Math.abs(A) === 1 && A > 0 ? '' : ', so ' + t(vs[0] + '=' + nT(P[0]))) + '.<br>';
    s += 'Substitute into the first equation: ' + backT(E1, P, vs) + '<br>';
    s += 'Check in the second: ' + t(subT(E2.a, E2.b, P) + '=' + dT(E2.c)) + ' ✓. The solution is ' + t('(' + nT(P[0]) + ',\\ ' + nT(P[1]) + ')') + '.';
    return s;
  }
  /* substitution for a count/amount system: v1 + v2 = N, p1·v1 + p2·v2 = V */
  function subsText(vs, N, p1, p2, V, n1, n2, dec) {
    var d = r6(p1 - p2), rhs = r6(V - p2 * N);
    return t(vs[1] + '=' + dT(N) + '-' + vs[0]) + '<br>' + t(T([[p1, vs[0]]], dec) + '+' + dT(p2) + '(' + dT(N) + '-' + vs[0] + ')=' + dT(V)) +
      '<br>' + t(T([[p1, vs[0]]], dec) + '+' + dT(r6(p2 * N)) + T([[-p2, vs[0]]], dec) + '=' + dT(V)) + '<br>' + t(T([[d, vs[0]]], dec) + '=' + dT(rhs)) + (d === 1 ? '' : ', so ' + t(vs[0] + '=' + dT(n1))) +
      '<br>' + t(vs[1] + '=' + dT(N) + '-' + dT(n1) + '=' + dT(n2));
  }

  /* =================================================================================================================== */
  /* Q1: read the solution off a graph, then verify */
  function q1Build(m1, a, x0, y0, first) {
    var s = { B1: -m1, a: a, B2: m1, x0: x0, y0: y0 };
    s.c1 = x0 + s.B1 * y0; s.c2 = a * x0 + s.B2 * y0;
    var E = [{ a: 1, b: s.B1, c: s.c1 }, { a: a, b: s.B2, c: s.c2 }]; if (!first) E.reverse();
    s.E = E; s.L = E.map(function (e) { return std(e.a, e.b, e.c); }); s.n = E.map(function (e) { return gT(e.a, e.b, e.c); }); s.P = [x0, y0];
    return s;
  }
  function q1Shared(r) {
    var s = find(function () { return q1Build(r.pick([1, -1]), r.pick([2, 2, 3]), nz(r, -4, 4), nz(r, -4, 4), r.chance(0.5)); },
      function (s) { return Math.abs(s.x0) !== Math.abs(s.y0) && s.c1 !== 0 && s.c2 !== 0 && Math.abs(s.c2) <= 12; }, null) || q1Build(-1, 2, 3, -2, true);
    s.fig = sysFig(s.L[0], s.L[1], 'the graphs of ' + s.n[0] + ' and ' + s.n[1]);
    return s;
  }
  /* Q2: graph two lines in slope-intercept form */
  function q2Shared(r) {
    var s = find(function () { var s = { m1: r.pick([2, 3, 2, 3, 1]), m2: r.pick([-1, -1, -2]), x0: nz(r, -3, 3), y0: r.int(-4, 4) }; s.b1 = s.y0 - s.m1 * s.x0; s.b2 = s.y0 - s.m2 * s.x0; return s; },
      function (s) { return s.b1 !== 0 && s.b2 !== 0 && Math.abs(s.b1) <= 5 && Math.abs(s.b2) <= 5 && s.b1 !== s.b2; }, null) || { m1: 2, m2: -1, x0: 2, y0: 1, b1: -3, b2: 3 };
    s.L = [mbL(s.m1, s.b1), mbL(s.m2, s.b2)]; s.n = s.L.map(function (L) { return si(L); }); s.P = [s.x0, s.y0];
    return s;
  }
  function stepTxt(m, b) { var a = Math.abs(m); return 'start at ' + ptt([0, b]) + ', ' + (m > 0 ? 'up ' : 'down ') + t(a) + ', right ' + t(1); }
  /* Q3: classify without graphing */
  function slopePick(r) { return find(function () { return [nz(r, -4, 4), r.pick([1, 1, 1, 2, 3])]; }, function (m) { return gcd(m[0], m[1]) === 1 && (m[1] === 1 || Math.abs(m[0]) < 2 * m[1]); }, [2, 1]); }
  function scaledT(L, k) { return gT(k * L.A, k * L.B, -k * L.C); }
  function clsSys(r, kind) {
    var big = function (tx) { return (tx.match(/\d+/g) || []).some(function (d) { return Number(d) > 20; }); };
    return find(function () {
      var m = slopePick(r), L1 = mbL(m, nz(r, -5, 5)), k1 = r.pick([1, 2, 2, 3]), si2 = r.chance(0.5), L2;
      if (kind === 'one') L2 = mbL(slopePick(r), nz(r, -6, 9));
      else if (kind === 'none') L2 = mbL(m, nz(r, -6, 9));
      else L2 = L1;
      return { L1: L1, L2: L2, t1: scaledT(L1, k1), t2: si2 ? si(L2) : scaledT(L2, r.pick(kind === 'inf' ? [1, 2, 3, -1, -2] : [1, 1, 2])), kind: kind };
    }, function (s) {
      if (s.t1 === s.t2 || big(s.t1) || big(s.t2)) return false;
      if (s.kind === 'one') return !parL(s.L1, s.L2);
      if (s.kind === 'none') return !sameL(s.L1, s.L2);
      return true;
    }, null);
  }
  function readKind(s) {
    s = String(s == null ? '' : s).toLowerCase().replace(/\\text\{([^}]*)\}/g, '$1').replace(/\\infty/g, '∞').trim();
    if (!s) return '';
    if (/inf|many|∞|same line|coincid|endless|every/.test(s)) return 'inf';
    if (/^(no|none|zero|0)\b|no sol|parallel|never/.test(s)) return 'none';
    if (/^(one|1|exactly one|a single|single|unique|only one)\b|one sol|1 sol/.test(s)) return 'one';
    return null;
  }
  var KIND_KEY = { one: 'one solution', none: 'no solution', inf: 'infinitely many' };
  function kindChk(kind, why) {
    return function (resp) {
      var k = readKind(resp);
      if (k === '') return form('empty', 'Type one, none or infinitely many.');
      if (k == null) return form('u8t-kind-read', 'Type <b>one</b>, <b>none</b> or <b>infinitely many</b>.');
      return k === kind ? ok() : wrong('u8t-cls-kind', why(k));
    };
  }
  function clsPart(s) {
    var a = mbTex(s.L1), b = mbTex(s.L2), kind = s.kind;
    var why = function (k) {
      if (kind === 'none') return k === 'inf' ? 'The slopes are equal, but compare the ' + t('y') + '-intercepts: ' + t(a.b) + ' and ' + t(b.b) + ' are different, so the lines are parallel and never meet.' : 'The slopes are equal (' + t(a.m) + '), so the lines can’t cross just once: they are parallel or the same line.';
      if (kind === 'inf') return k === 'none' ? 'Same slope <b>and</b> the same ' + t('y') + '-intercept (' + t(a.b) + '): it is the same line, so every point on it is a solution.' : 'Same slope and the same ' + t('y') + '-intercept: it is the same line, not two lines crossing once.';
      return 'The slopes are different (' + t(a.m) + ' and ' + t(b.m) + '), so the lines cross exactly once.';
    };
    var sol = t(s.t1) + ' → ' + t(si(s.L1)) + ': slope ' + t(a.m) + ', ' + t('y') + '-intercept ' + t(a.b) + '.<br>' + t(s.t2) + ' → ' + t(si(s.L2)) + ': slope ' + t(b.m) + ', ' + t('y') + '-intercept ' + t(b.b) + '.<br>' +
      (kind === 'one' ? 'Different slopes: the lines cross once — <b>one solution</b>.' : kind === 'none' ? 'Same slope, different ' + t('y') + '-intercepts: parallel lines — <b>no solution</b>.' : 'Same slope and the same ' + t('y') + '-intercept: the same line — <b>infinitely many solutions</b>.');
    var fields = [{ label: t(s.t1) + ' as ' + t('y=mx+b') + ':', name: 'First equation', mode: 'math', keys: 'eq', placeholder: ' ' }, { label: t(s.t2) + ' as ' + t('y=mx+b') + ':', name: 'Second equation', mode: 'math', keys: 'eq', placeholder: ' ' }, { label: 'Number of solutions (one, none or infinitely many):', name: 'Number of solutions', mode: 'text', wide: true, placeholder: ' ' }];
    var p = fieldsPart(t(s.t1) + ' &ensp;and&ensp; ' + t(s.t2) + '<br>Write each equation in the form ' + t('y=mx+b') + ', then give the number of solutions.',
      fields, [siChk(s.L1), siChk(s.L2), kindChk(kind, why)], [si(s.L1), si(s.L2), KIND_KEY[kind]],
      t(si(s.L1)) + ', ' + t(si(s.L2)) + ' — <b>' + (kind === 'one' ? 'one solution' : kind === 'none' ? 'no solution' : 'infinitely many solutions') + '</b>', sol,
      ['Rearrange each equation to get ' + t('y') + ' by itself, then compare the slopes and the ' + t('y') + '-intercepts.', 'Different slopes: one solution. Same slope, different intercepts: none. Same slope and intercept: infinitely many.'], 'classify ' + s.t1 + ', ' + s.t2,
      { multi: function (W) { return W.length === 2 && W.indexOf(2) < 0 ? 'u8t-cls-eqs' : null; } });
    p.bad = [[si(s.L1), si(s.L2), KIND_KEY[kind === 'none' ? 'inf' : kind === 'inf' ? 'none' : 'none']], [si(s.L1), '', KIND_KEY[kind]]];
    return p;
  }
  /* Q4: rewrite, graph, solve */
  function q4Build(a, b, k1, p, x0) {
    var s = { a: a, b: b, k1: k1, p: p, x0: x0 };
    s.y0 = k1 - a * x0 / b; s.c = b * k1; s.k2 = s.y0 - p * x0;
    s.L = [std(a, b, s.c), std(p, -1, -s.k2)]; s.n = s.L.map(genT); s.P = [x0, s.y0];
    return s;
  }
  function q4Shared(r) {
    return find(function () { var ab = r.pick([[1, 2], [1, 3], [2, 3], [1, 2], [1, 3]]), sg = r.pick([1, 1, -1]); return q4Build(ab[0] * sg, ab[1], nz(r, -3, 3), r.pick([1, 1, 2, 2, 3]), ab[1] * nz(r, -2, 2)); },
      function (s) { return isInt(s.y0) && Math.abs(s.y0) <= 5 && s.y0 !== 0 && s.k2 !== 0 && Math.abs(s.k2) <= 6 && Math.abs(s.x0) <= 6 && latS(s.L[0], W6).length >= 2; }, null) || q4Build(1, 2, 1, 1, 4);
  }
  /* Q5: k for no solution */
  function q5Build(onX, m, k, o, C1, C2) {
    var s = { onX: onX, m: m, k: k, o: o, C1: C1, C2: C2 }, A2 = onX ? m * k : m * o, B2 = onX ? m * o : m * k, sg = A2 < 0 ? -1 : 1;
    s.A2 = sg * A2; s.B2 = sg * B2; s.C2s = sg * C2; s.sg = sg;
    s.e1 = onX ? 'kx' + (o === 1 ? '+y' : o === -1 ? '-y' : (o > 0 ? '+' : '-') + Math.abs(o) + 'y') + '=' + C1 : T([[o, 'x']]) + (k < 0 ? '' : '') + '+ky=' + C1;
    s.e2 = gT(s.A2, s.B2, s.C2s);
    s.m2 = fr(-s.A2, s.B2);
    return s;
  }
  function q5Shared(r) {
    return find(function () { var onX = r.chance(0.6); return q5Build(onX, r.pick([2, 2, 3]), r.pick([-5, -4, -3, -2, 2, 3, 4, 5]), onX ? r.pick([-3, -2, 2, 3, 1, 4]) : r.pick([1, 2, 3, 4]), r.int(2, 9), r.int(1, 12)); },
      function (s) { return s.C2 % s.m !== 0 && Math.abs(s.k) !== Math.abs(s.o) && !(Math.abs(s.o) === 1 && Math.abs(s.k) === 1); }, null) || q5Build(true, 2, 2, 3, 6, 5);
  }
  /* Q6: write a second equation */
  function q6Shared(r) {
    var AB = [[2, -1], [3, 1], [1, -3], [1, 3], [2, 1], [3, -1], [1, -2], [1, 2], [2, 3], [3, -2], [2, -3], [3, 2], [4, -1], [4, 1]];
    return find(function () { var ab = r.pick(AB), x0 = r.pick([3, 3, 2, 4, 1, -2]), y0 = nz(r, -4, 4); return { A: ab[0], B: ab[1], x0: x0, y0: y0, C: ab[0] * x0 + ab[1] * y0, d: nz(r, -5, 5) }; },
      function (s) { return s.C !== 0 && Math.abs(s.C) <= 15 && s.C + s.d !== 0; }, { A: 2, B: -1, x0: 3, y0: 2, C: 4, d: -3 });
  }
  function q6Chk(kind, s) {
    var TL = [s.A, s.B, -s.C], P = [s.x0, s.y0], mt = fT(fr(-s.A, s.B)), given = gT(s.A, s.B, s.C);
    return function (resp) {
      var str = String(resp == null ? '' : resp).trim(); if (!str) return form('empty', 'Type an equation first.');
      var q = Ln.read(str, ['x', 'y']); if (!q.ok) return form('line-' + q.why, q.why === 'vars' ? 'Use the letters ' + t('x') + ' and ' + t('y') + '.' : READWHY[q.why] || READWHY.unreadable);
      var S = [q.a, q.b, q.c], same = Ln.same(S, TL), par = near(S[0] * TL[1], S[1] * TL[0]), thru = onPt(S, P);
      var ms = q.b === 0 ? 'undefined' : nT(r6(-q.a / q.b));
      if (kind === 'none') { if (par && !same) return ok(); if (same) return wrong('u8t-6-same', 'That is the same line as ' + t(given) + ', so the system would have <b>infinitely many</b> solutions. Keep the slope, but change the constant.'); return wrong('u8t-6-cross', 'Your line has slope ' + t(ms) + ', not ' + t(mt) + ', so it crosses ' + t(given) + ' once. Parallel lines need the <b>same slope</b> and a different intercept.'); }
      if (kind === 'inf') { if (same) return ok(); if (par) return wrong('u8t-6-parallel', 'Same slope but a different intercept: parallel lines, so <b>no</b> solution. Multiply <b>every</b> term — the constant too — by the same number.'); return wrong('u8t-6-cross', 'Your line has slope ' + t(ms) + ', not ' + t(mt) + ', so it crosses ' + t(given) + ' once. For infinitely many solutions, write the <b>same line</b> (a multiple of the equation).'); }
      if (thru && !par) return ok();
      if (thru) return wrong('u8t-6-same', 'Your line goes through ' + ptt(P) + ', but it is the same line as ' + t(given) + ', so there would be infinitely many solutions. Use a different slope.');
      return wrong('u8t-6-misses', 'Your line doesn’t pass through ' + ptt(P) + ': substitute ' + t('x=' + s.x0) + ' and ' + t('y=' + s.y0) + ' into your equation — both sides must be equal.');
    };
  }
  /* Q7: substitution */
  function q7Build(m, b, A, B, x0) { var s = { m: m, b: b, A: A, B: B, x0: x0, y0: m * x0 + b }; s.C = A * x0 + B * s.y0; s.L = [mbL(m, b), std(A, B, s.C)]; s.P = [x0, s.y0]; return s; }
  /* Q8: elimination, opposite y-terms */
  function q8Build(a1, a2, b, x0, y0) { var s = { a1: a1, a2: a2, b: b, x0: x0, y0: y0, c1: a1 * x0 + b * y0, c2: a2 * x0 - b * y0 }; s.E = [{ a: a1, b: b, c: s.c1 }, { a: a2, b: -b, c: s.c2 }]; s.n = s.E.map(function (e) { return gT(e.a, e.b, e.c); }); s.L = s.E.map(function (e) { return std(e.a, e.b, e.c); }); s.P = [x0, y0]; return s; }
  function q8Shared(r) {
    return find(function () { return q8Build(r.int(1, 5), r.int(1, 5), r.int(2, 4), nz(r, -5, 5), nz(r, -5, 5)); },
      function (s) { return s.a1 !== s.a2 && gcd(s.a1, s.b) === 1 && gcd(s.a2, s.b) === 1 && s.c1 !== 0 && s.c2 !== 0 && Math.abs(s.c1) <= 40 && Math.abs(s.c2) <= 40 && s.c1 !== s.c2; }, null) || q8Build(3, 5, 4, 4, -4);
  }
  /* Q9: elimination, both equations scaled */
  function q9Build(a1, b1, a2, b2, x0, y0) { var s = { a1: a1, b1: b1, a2: a2, b2: b2, x0: x0, y0: y0 }; s.E = [{ a: a1, b: b1, c: a1 * x0 + b1 * y0 }, { a: a2, b: -b2, c: a2 * x0 - b2 * y0 }]; s.n = s.E.map(function (e) { return gT(e.a, e.b, e.c); }); s.L = s.E.map(function (e) { return std(e.a, e.b, e.c); }); s.P = [x0, y0]; return s; }
  /* Q10: clear the fractions */
  function q10Build(d1, d2, s1, d3, d4, s2, x0, y0) {
    var s = { d: [d1, d2, d3, d4], sg: [s1, s2], x0: x0, y0: y0, P: [x0, y0] };
    s.R1 = r6(x0 / d1 + s1 * y0 / d2); s.R2 = r6(x0 / d3 + s2 * y0 / d4);
    var L1 = lcm(d1, d2), L2 = lcm(d3, d4); s.M = [L1, L2];
    s.E = [{ a: L1 / d1, b: s1 * L1 / d2, c: L1 * s.R1 }, { a: L2 / d3, b: s2 * L2 / d4, c: L2 * s.R2 }];
    s.n = [['\\dfrac{x}{' + d1 + '}' + (s1 > 0 ? '+' : '-') + '\\dfrac{y}{' + d2 + '}=' + nT(s.R1)], ['\\dfrac{x}{' + d3 + '}' + (s2 > 0 ? '+' : '-') + '\\dfrac{y}{' + d4 + '}=' + nT(s.R2)]].map(function (a) { return a[0]; });
    s.L = s.E.map(function (e) { return std(e.a, e.b, e.c); });
    return s;
  }
  function q10Shared(r) {
    return find(function () {
      var dd = r.sample([2, 3, 4], 2), ee = r.sample([2, 3, 4], 2), s1 = r.pick([1, -1]);
      var lx = lcm(dd[0], ee[0]), ly = lcm(dd[1], ee[1]);
      var kx = Math.floor(12 / lx), ky = Math.floor(12 / ly);
      return q10Build(dd[0], dd[1], s1, ee[0], ee[1], -s1, lx * nz(r, -kx, kx), ly * nz(r, -ky, ky));
    }, function (s) { return isInt(s.R1) && isInt(s.R2) && s.R1 !== 0 && s.R2 !== 0 && Math.abs(s.x0) <= 12 && Math.abs(s.y0) <= 12 && Math.abs(s.R1) <= 9 && Math.abs(s.R2) <= 9; }, null) || q10Build(3, 2, 1, 2, 4, -1, 6, 4);
  }
  function clearChk(E, R, M, d) {
    var TL = [E.a, E.b, -E.c], one = [E.a, E.b, -R];
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim(); if (!s) return form('empty', 'Type the equation with the fractions cleared.');
      if (/\\frac|\//.test(s)) return form('u8t-frac-left', 'Clear <b>all</b> the fractions: multiply every term by ' + t(M) + ', the lowest common denominator.');
      var q = Ln.read(s, ['x', 'y']); if (!q.ok) return form('line-' + q.why, 'Write an equation in ' + t('x') + ' and ' + t('y') + ' with whole-number coefficients.');
      var S = [q.a, q.b, q.c];
      if (Ln.same(S, TL)) return /\.\d/.test(s) ? form('u8t-frac-left', 'Right equation — now clear the decimals too: use whole-number coefficients.') : ok();
      if (Ln.same(S, one)) return wrong('u8t-clear-one-side', 'Multiply <b>both</b> sides by ' + t(M) + ': the right side ' + t(nT(R)) + ' becomes ' + t(nT(M * R)) + '.');
      return wrong('u8t-clear', 'Multiply <b>every</b> term by ' + t(M) + ': ' + t('\\frac{x}{' + d[0] + '}\\times ' + M + '=' + T([[M / d[0], 'x']])) + ', and so on.');
    };
  }
  /* Q11: what happens when both variables cancel */
  function q11Build(kind, a1, b1, c1, k, delta) { var s = { kind: kind, a1: a1, b1: b1, c1: c1, k: k }; s.c2 = k * c1 + (kind === 'none' ? delta : 0); s.D = s.c2 - k * c1; s.e1 = gT(a1, b1, c1); s.e2 = gT(k * a1, k * b1, s.c2); return s; }
  function q11Shared(r) {
    var kind = r.pick(['none', 'none', 'inf']);
    return find(function () { return q11Build(kind, r.int(1, 5), nz(r, -5, 5), nz(r, -9, 9), r.pick([-2, -3, 2, 3, -2, -4]), nz(r, -12, 12)); },
      function (s) { return gcd(s.a1, s.b1) === 1 && s.c2 !== 0 && Math.abs(s.c2) <= 30 && Math.abs(s.b1) !== s.a1; }, null) || q11Build(kind, 2, -3, 5, -2, 18);
  }
  function resChk(kind, D) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim(); if (!s) return form('empty', 'Type the equation you get, e.g. ' + t('0=12') + '.');
      var sides = s.split('='); if (sides.length !== 2 || !sides[0].trim() || !sides[1].trim()) return form('u8t-res-eq', 'Type the equation you get after adding or subtracting, e.g. ' + t('0=12') + '.');
      var v = sides.map(function (x) { var a = ex.parse(x); var w = a.ok ? ex.value(a.ast) : NaN; return isFinite(w) ? w : null; });
      if (v[0] == null || v[1] == null) {
        var q = Ln.read(s, ['x', 'y']);
        if (q.ok && Math.abs(q.a) < 1e-9 && Math.abs(q.b) < 1e-9) v = [0, -q.c];
        else if (q.ok) return wrong('u8t-res-not-elim', 'A variable is still there. Here the ' + t('x') + '-terms and the ' + t('y') + '-terms cancel <b>at the same time</b> — check your multiplying.');
        else return form('u8t-res-eq', 'Type the equation you get, e.g. ' + t('0=12') + '.');
      }
      var eq = near(v[0], v[1]);
      if (kind === 'none') return eq ? wrong('u8t-res-true', 'Check the right-hand sides: when you multiply an equation, multiply its right side too. Here the constants do not cancel.')
        : near(Math.abs(v[0] - v[1]), Math.abs(D)) ? ok() : wrong('u8t-res-arith', 'A false statement — but check the arithmetic on the right-hand sides: multiply the first equation’s right side, then add.');
      return eq ? ok() : wrong('u8t-res-false', 'Check the right-hand sides: when you multiply an equation, multiply its right side too. Here the constants cancel as well.');
    };
  }
  /* Q12: find the error in a student's elimination */
  function q12Build(a, b1, b2, x0, y0) {
    var s = { a: a, b1: b1, b2: b2, x0: x0, y0: y0, c1: a * x0 + b1 * y0, c2: a * x0 + b2 * y0 }; s.sw = b1 + b2;
    s.yw = (s.c1 - s.c2) / s.sw; s.xw = (s.c1 - b1 * s.yw) / a; s.xwF = fr(s.c1 - b1 * s.yw, a);
    s.n = [gT(a, b1, s.c1), gT(a, b2, s.c2)]; s.L = [std(a, b1, s.c1), std(a, b2, s.c2)]; s.P = [x0, y0];
    return s;
  }
  function q12Shared(r) {
    return find(function () { return q12Build(r.int(3, 6), nz(r, -5, 5), nz(r, -5, 5), nz(r, -3, 4), nz(r, -4, 4)); },
      function (s) { return s.b1 !== s.b2 && Math.abs(s.sw) >= 2 && Math.abs(s.sw) <= 3 && isInt(s.yw) && s.yw !== s.y0 && s.yw !== 0 && Math.abs(s.yw) <= 20 && !near(s.xw, s.x0) && Math.abs(s.c1) <= 30 && Math.abs(s.c2) <= 30 && s.b1 - s.b2 !== s.sw; }, null) || q12Build(4, -3, 5, 2, 2);
  }
  function xwT(f) { var v = f[0] / f[1], d = f[1]; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1 ? dT(v) : fT(f); }
  /* Q13: the line ax + by = K through two points */
  function q13Build(a, b, x1, y1, k) { var g = gcd(a, b), s = { a: a, b: b, p1: [x1, y1] }; s.K = a * x1 + b * y1; s.p2 = [x1 + k * b / g, y1 - k * a / g]; return s; }
  function q13Shared(r) {
    return find(function () { return q13Build(r.pick([2, 3, 4, 5]), nz(r, -4, 4), nz(r, -4, 5), nz(r, -4, 5), r.pick([-3, -2, -1, 1, 2, 3])); },
      function (s) { return s.K >= 6 && s.K <= 20 && s.p2[0] !== 0 && s.p2[1] !== 0 && Math.abs(s.p2[0]) <= 12 && Math.abs(s.p2[1]) <= 12 && s.p1[0] !== s.p1[1] && s.p2[0] !== s.p2[1] && !(s.p1[0] === s.p2[1] && s.p1[1] === s.p2[0]); }, null) || q13Build(3, 2, 2, 3, -2);
  }
  /* Q14: sum and difference */
  function q14Shared(r) {
    var c = r.pick(['num', 'games', 'angles']);
    if (c === 'num') return find(function () { var S = r.int(30, 90), D = r.int(4, 30); return { c: c, S: S, D: D, big: (S + D) / 2, small: (S - D) / 2, v: ['x', 'y'] }; }, function (s) { return isInt(s.big) && s.small >= 3; }, { c: c, S: 52, D: 14, big: 33, small: 19, v: ['x', 'y'] });
    if (c === 'games') return find(function () { var S = r.int(20, 40), D = r.int(2, 14); return { c: c, S: S, D: D, big: (S + D) / 2, small: (S - D) / 2, v: ['w', 'l'], sport: r.pick(['soccer', 'hockey', 'basketball', 'volleyball']) }; }, function (s) { return isInt(s.big) && s.small >= 2; }, { c: c, S: 26, D: 8, big: 17, small: 9, v: ['w', 'l'], sport: 'soccer' });
    var S2 = r.pick([180, 180, 90]);
    return find(function () { var D = S2 === 180 ? 2 * r.int(5, 50) : 2 * r.int(3, 25); return { c: c, S: S2, D: D, big: (S2 + D) / 2, small: (S2 - D) / 2, v: ['x', 'y'] }; }, function (s) { return s.small >= 10; }, { c: c, S: 180, D: 36, big: 108, small: 72, v: ['x', 'y'] });
  }
  function q14Text(s) {
    if (s.c === 'num') return 'The sum of two numbers is ' + t(s.S) + ' and their difference is ' + t(s.D) + '. Let ' + t('x') + ' be the larger number and ' + t('y') + ' the smaller number.';
    if (s.c === 'games') return 'A ' + s.sport + ' team played ' + t(s.S) + ' games with no ties. It won ' + t(s.D) + ' more games than it lost. Let ' + t('w') + ' be the number of wins and ' + t('l') + ' the number of losses.';
    return 'Two angles are ' + (s.S === 180 ? 'supplementary' : 'complementary') + ': they add to ' + t(s.S + '^\\circ') + '. One angle is ' + t(s.D + '^\\circ') + ' larger than the other. Let ' + t('x') + ' be the larger angle and ' + t('y') + ' the smaller angle, in degrees.';
  }
  /* Q15: counts and values */
  function q15Shared(r) {
    var c = r.pick(['tickets', 'bills', 'baskets']), o;
    if (c === 'tickets') {
      var ev = r.pick(['school play', 'concert', 'talent show', 'band night']);
      return find(function () { var p1 = r.pick([10, 11, 12, 14, 15]), p2 = r.pick([5, 6, 7, 8]), N = 10 * r.int(12, 30), n1 = 5 * r.int(4, N / 5 - 4); return { c: c, ev: ev, p: [p1, p2], N: N, n: [n1, N - n1], v: ['a', 's'], V: p1 * n1 + p2 * (N - n1) }; }, function (s) { return s.n[0] !== s.n[1]; }, { c: c, ev: 'school play', p: [12, 7], N: 180, n: [80, 100], v: ['a', 's'], V: 1660 });
    }
    if (c === 'bills') {
      var den = r.pick([[5, 10, 'f', 't'], [10, 20, 't', 'w'], [5, 20, 'f', 'w']]);
      return find(function () { var N = r.int(20, 50), n1 = r.int(5, N - 5); return { c: c, p: [den[0], den[1]], N: N, n: [n1, N - n1], v: [den[2], den[3]], V: den[0] * n1 + den[1] * (N - n1) }; }, function (s) { return s.n[0] !== s.n[1]; }, { c: c, p: [5, 10], N: 34, n: [16, 18], v: ['f', 't'], V: 260 });
    }
    o = find(function () { var p1 = r.pick([3, 4, 5]), p2 = r.pick([7, 8, 9, 10]), N = r.int(40, 90), n1 = r.int(10, N - 10); return { c: c, p: [p1, p2], N: N, n: [n1, N - n1], v: ['s', 'l'], V: p1 * n1 + p2 * (N - n1), what: r.pick(['berries', 'apples', 'cherries']) }; }, function (s) { return s.n[0] !== s.n[1]; }, { c: c, p: [4, 9], N: 70, n: [39, 31], v: ['s', 'l'], V: 435, what: 'berries' });
    return o;
  }
  function q15Text(s) {
    var v = s.v;
    if (s.c === 'tickets') return 'A ' + s.ev + ' sold ' + t(s.N) + ' tickets for a total of ' + t(money(s.V)) + '. Adult tickets cost ' + t(money(s.p[0])) + ' and student tickets cost ' + t(money(s.p[1])) + '. Let ' + t('a') + ' be the number of adult tickets and ' + t('s') + ' the number of student tickets. One equation is ' + t('a+s=' + s.N) + '.';
    if (s.c === 'bills') return 'A cash box holds only ' + t(money(s.p[0])) + ' bills and ' + t(money(s.p[1])) + ' bills. There are ' + t(s.N) + ' bills worth ' + t(money(s.V)) + ' in total. Let ' + t(v[0]) + ' be the number of ' + t(money(s.p[0])) + ' bills and ' + t(v[1]) + ' the number of ' + t(money(s.p[1])) + ' bills. One equation is ' + t(v[0] + '+' + v[1] + '=' + s.N) + '.';
    return 'A farm stand sold ' + t(s.N) + ' baskets of ' + s.what + ' for a total of ' + t(money(s.V)) + '. Small baskets cost ' + t(money(s.p[0])) + ' and large baskets cost ' + t(money(s.p[1])) + '. Let ' + t('s') + ' be the number of small baskets and ' + t('l') + ' the number of large baskets. One equation is ' + t('s+l=' + s.N) + '.';
  }
  function q15Names(s) { return s.c === 'tickets' ? ['adult tickets', 'student tickets'] : s.c === 'bills' ? ['$' + s.p[0] + ' bills', '$' + s.p[1] + ' bills'] : ['small baskets', 'large baskets']; }
  /* Q16: mixtures */
  function q16Shared(r) {
    var c = r.pick(['antifreeze', 'saline', 'nuts']);
    if (c === 'nuts') return find(function () { var p1 = r.pick([4, 5, 6, 7, 8]), p2 = r.pick([12, 13, 14, 15, 16]), M = r.pick([10, 12, 15, 18, 20, 24]), x = r.int(2, M - 2); var C = (p1 * x + p2 * (M - x)) / M; return { c: c, r1: p1, r2: p2, M: M, x: x, y: M - x, cc: C, v: ['p', 'c'] }; }, function (s) { return isInt(s.cc) && s.x !== s.y; }, { c: c, r1: 6, r2: 15, M: 12, x: 8, y: 4, cc: 9, v: ['p', 'c'] });
    var sal = c === 'saline';
    return find(function () { var r1 = sal ? r.pick([5, 10, 15]) : r.pick([10, 15, 20, 25]), r2 = sal ? r.pick([30, 40, 50]) : r.pick([40, 50, 60, 70]), M = sal ? r.pick([300, 400, 500, 600, 800, 900, 1000]) : r.pick([20, 24, 30, 40, 50, 60]), cc = 5 * r.int(Math.ceil((r1 + 1) / 5), Math.floor((r2 - 1) / 5)); var x = M * (r2 - cc) / (r2 - r1); return { c: c, r1: r1, r2: r2, M: M, cc: cc, x: x, y: M - x, v: ['x', 'y'], who: r.pick(['She', 'He']) }; },
      function (s) { return s.cc > s.r1 && s.cc < s.r2 && isInt(s.x) && s.x > 0 && s.y > 0 && s.x !== s.y && (!sal || s.x % 10 === 0); }, sal ? { c: c, r1: 10, r2: 40, M: 600, cc: 20, x: 400, y: 200, v: ['x', 'y'], who: 'She' } : { c: c, r1: 20, r2: 50, M: 30, cc: 30, x: 20, y: 10, v: ['x', 'y'], who: 'She' });
  }
  function q16Info(s) {
    if (s.c === 'nuts') return { text: 'A store blends peanuts worth ' + t(money(s.r1) + '/\\text{kg}') + ' with cashews worth ' + t(money(s.r2) + '/\\text{kg}') + ' to make ' + t(s.M) + ' kg of a mix worth ' + t(money(s.cc) + '/\\text{kg}') + '. Let ' + t('p') + ' be the kilograms of peanuts and ' + t('c') + ' the kilograms of cashews.', unit: 'kg', names: ['peanuts', 'cashews'], amt: 'the total mass', con: 'the total value' };
    var u = s.c === 'saline' ? 'mL' : 'L', what = s.c === 'saline' ? 'saline' : 'antifreeze';
    return { text: (s.c === 'saline' ? 'A lab technician needs ' : 'A mechanic needs ') + t(s.M) + ' ' + u + ' of a ' + t(pc(s.cc)) + ' ' + what + ' solution. ' + s.who + ' has a ' + t(pc(s.r1)) + ' solution and a ' + t(pc(s.r2)) + ' solution. Let ' + t('x') + ' be the ' + (u === 'mL' ? 'millilitres' : 'litres') + ' of the ' + t(pc(s.r1)) + ' solution and ' + t('y') + ' the ' + (u === 'mL' ? 'millilitres' : 'litres') + ' of the ' + t(pc(s.r2)) + ' solution.', unit: u, names: ['the ' + s.r1 + '% solution', 'the ' + s.r2 + '% solution'], amt: 'the total amount', con: 'the amount of pure ' + what, what: what };
  }
  /* Q17: interest */
  function q17Shared(r) {
    var who = r.pick([['Keira', 'she'], ['Omar', 'he'], ['Mei', 'she'], ['Raj', 'he'], ['The Nguyens', 'they']]);
    return find(function () { var P = 500 * r.int(6, 20), r1 = r.pick([2, 3, 4, 1.5, 2.5]), r2 = r.pick([4.5, 5, 6, 7]), x = 100 * r.int(5, P / 100 - 5); return { who: who, P: P, r1: r1, r2: r2, x: x, y: P - x, I: r6((r1 * x + r2 * (P - x)) / 100) }; },
      function (s) { return s.r2 > s.r1 && isInt(s.I) && s.x !== s.y; }, { who: ['Keira', 'she'], P: 5000, r1: 3, r2: 5, x: 3000, y: 2000, I: 190 });
  }
  /* Q18: with and against the wind / current */
  function q18Shared(r) {
    var c = r.pick(['plane', 'boat', 'cyclist']);
    var R = { plane: { p: [150, 500], w: [20, 100], v: ['p', 'w'] }, boat: { p: [8, 30], w: [1, 8], v: ['b', 'c'] }, cyclist: { p: [12, 35], w: [2, 8], v: ['c', 'w'] } }[c];
    return find(function () { var t1 = r.int(2, 6), t2 = t1 + r.int(1, 4), k = c === 'plane' ? r.int(10, 120) : r.int(1, 12); var p = k * (t1 + t2) / 2, w = k * (t2 - t1) / 2; return { c: c, t1: t1, t2: t2, p: p, w: w, S1: p + w, S2: p - w, D: k * t1 * t2, v: R.v }; },
      function (s) { return isInt(s.p) && isInt(s.w) && s.p >= R.p[0] && s.p <= R.p[1] && s.w >= R.w[0] && s.w <= R.w[1] && (c !== 'plane' ? s.D <= 100 : (s.D % 100 === 0 && s.p % 10 === 0 && s.w % 10 === 0)); }, c === 'plane' ? { c: c, t1: 4, t2: 6, p: 250, w: 50, S1: 300, S2: 200, D: 1200, v: R.v } : c === 'boat' ? { c: c, t1: 3, t2: 5, p: 16, w: 4, S1: 20, S2: 12, D: 60, v: R.v } : { c: c, t1: 3, t2: 4, p: 21, w: 3, S1: 24, S2: 18, D: 72, v: R.v });
  }
  function q18Info(s) {
    var v = s.v;
    if (s.c === 'plane') return { text: 'A small plane flies ' + t(F(s.D)) + ' km between two cities in ' + t(s.t1) + ' h with a tailwind. The return trip, against the same wind, takes ' + t(s.t2) + ' h. Let ' + t('p') + ' be the plane’s speed in still air and ' + t('w') + ' the speed of the wind, in km/h.', with: 'with the wind', against: 'against the wind', still: 'the plane’s speed in still air', other: 'the wind speed', none: 'no wind' };
    if (s.c === 'boat') return { text: 'A tour boat goes ' + t(s.D) + ' km downstream in ' + t(s.t1) + ' h. The trip back upstream takes ' + t(s.t2) + ' h. Let ' + t('b') + ' be the boat’s speed in still water and ' + t('c') + ' the speed of the current, in km/h.', with: 'downstream', against: 'upstream', still: 'the boat’s speed in still water', other: 'the current’s speed', none: 'no current' };
    return { text: 'A cyclist rides ' + t(s.D) + ' km in ' + t(s.t1) + ' h with a tailwind. The ride back, against the wind, takes ' + t(s.t2) + ' h. Let ' + t('c') + ' be the cyclist’s speed in still air and ' + t('w') + ' the wind speed, in km/h.', with: 'with the wind', against: 'against the wind', still: 'the cyclist’s speed in still air', other: 'the wind speed', none: 'no wind', v: v };
  }
  /* Q19: two cost plans */
  function q19Shared(r) {
    var c = r.pick(['gym', 'rental', 'halls']);
    if (c === 'gym') return find(function () { var F1 = 10 * r.int(6, 18), a = r.int(4, 8), b = a + r.int(4, 10), n = F1 / (b - a), N = n + r.pick([-7, -5, -4, -3, 3, 4, 5, 7]); return { c: c, F: [F1, 0], R: [a, b], X: n, C: F1 + a * n, N: N, v: ['n', 'C'], names: ['Plan A', 'Plan B'], who: r.pick(['Sam', 'Lee', 'Ana']) }; },
      function (s) { return isInt(s.X) && s.X >= 8 && s.X <= 30 && s.N >= 3; }, { c: c, F: [120, 0], R: [6, 14], X: 15, C: 210, N: 12, v: ['n', 'C'], names: ['Plan A', 'Plan B'], who: 'Sam' });
    if (c === 'rental') return find(function () { var F1 = 5 * r.int(8, 12), F2 = 5 * r.int(4, 7), r1 = r.pick([0.15, 0.2, 0.25]), r2 = r.pick([0.25, 0.3, 0.35, 0.4]), d = (F1 - F2) / (r2 - r1), N = d + 50 * r.pick([-3, -2, 2, 3]); return { c: c, F: [F1, F2], R: [r1, r2], X: r6(d), C: r6(F1 + r1 * d), N: r6(N), v: ['d', 'C'], names: ['Rental P', 'Rental Q'], who: r.pick(['Maya', 'Jon', 'Priya']) }; },
      function (s) { return s.R[1] > s.R[0] && isInt(s.X) && s.X % 10 === 0 && s.X >= 100 && s.X <= 500 && s.N > 0 && isInt(s.C * 100); }, { c: c, F: [45, 25], R: [0.2, 0.3], X: 200, C: 85, N: 350, v: ['d', 'C'], names: ['Rental P', 'Rental Q'], who: 'Maya' });
    return find(function () { var F1 = 50 * r.int(4, 8), F2 = F1 + 50 * r.int(2, 6), r1 = r.int(12, 20), r2 = r.int(8, 14), g = (F2 - F1) / (r1 - r2), N = g + r.pick([-15, -10, 10, 15, -5, 5]); return { c: c, F: [F1, F2], R: [r1, r2], X: g, C: F1 + r1 * g, N: N, v: ['g', 'C'], names: ['Hall 1', 'Hall 2'], who: r.pick(['Noah', 'Zoe', 'Kai']) }; },
      function (s) { return s.R[0] > s.R[1] && isInt(s.X) && s.X >= 20 && s.X <= 80 && s.N >= 10; }, { c: c, F: [300, 500], R: [15, 10], X: 40, C: 900, N: 30, v: ['g', 'C'], names: ['Hall 1', 'Hall 2'], who: 'Noah' });
  }
  function q19Info(s) {
    var v = s.v[0], cost = function (i) { return s.F[i] ? t(money(s.F[i])) + ' plus ' + t(money(s.R[i])) + (s.c === 'rental' ? '/km' : ' per ' + (s.c === 'gym' ? 'visit' : 'guest')) : t(money(s.R[i])) + ' per visit, no fee'; };
    var unit = s.c === 'gym' ? 'visits' : s.c === 'rental' ? 'km' : 'guests';
    var text = s.c === 'gym' ? 'Gym plan A: a ' + t(money(s.F[0])) + ' fee plus ' + t(money(s.R[0])) + ' per visit. Plan B: ' + t(money(s.R[1])) + ' per visit, no fee. Let ' + t('C') + ' be the total cost (in dollars) of ' + t('n') + ' visits.'
      : s.c === 'rental' ? 'Rental P: ' + t(money(s.F[0])) + ' per day plus ' + t(money(s.R[0])) + '/km. Rental Q: ' + t(money(s.F[1])) + ' per day plus ' + t(money(s.R[1])) + '/km. Let ' + t('C') + ' be the cost (in dollars) of one day, driving ' + t('d') + ' km.'
        : 'Hall 1 costs ' + t(money(s.F[0])) + ' plus ' + t(money(s.R[0])) + ' per guest. Hall 2 costs ' + t(money(s.F[1])) + ' plus ' + t(money(s.R[1])) + ' per guest. Let ' + t('C') + ' be the total cost (in dollars) for ' + t('g') + ' guests.';
    var eqs = [0, 1].map(function (i) { return 'C=' + (s.F[i] ? iT(s.F[i]) + '+' + T([[s.R[i], v]], true) : T([[s.R[i], v]], true)); });
    return { text: text, unit: unit, eqs: eqs, cost: cost };
  }
  function pickChk(names, want) {
    var keyOf = function (s) { return String(s).toLowerCase().replace(/\\text\{([^}]*)\}/g, '$1').replace(/plan|rental|hall|the|\s|\.|!/g, ''); };
    var ks = names.map(function (n) { return keyOf(n); });
    return function (resp) {
      var k = keyOf(resp == null ? '' : resp); if (!k) return form('empty', 'Type which one is better.');
      var i = ks.indexOf(k); if (i < 0) return form('u8t-pick-read', 'Type ' + names[0] + ' or ' + names[1] + '.');
      return i === want ? ok() : wrong('u8t-better', 'Compare your two costs: the better choice is the one that costs <b>less</b>.');
    };
  }

  HW.defineTest({
    id: 'u8test', unit: 8, title: 'Unit 8 Test', outcome: 'RF9', calc: true,
    blurb: 'The Unit 8 outcomes-based test (RF9: systems of linear equations): solving and classifying graphically, substitution and elimination, and modelling problems with a system, each at the BEG, PRG and MAS levels.',
    questions: [
      /* ======================= RF9 · Part 1: solving and classifying graphically ======================= */
      { num: '1', section: 'RF9 · Part 1 — Beginning', outcome: 'RF9', shared: q1Shared,
        stem: function (s) { return 'The graphs of ' + t(s.n[0]) + ' (blue) and ' + t(s.n[1]) + ' (red) are shown.' + s.fig; },
        parts: [
          { id: '1a', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            return pointPart('State the solution of the system as an ordered pair.', s.P, s.L, {},
              'The lines cross at ' + ptt(s.P) + ': across to ' + t('x=' + s.x0) + ', then ' + (s.y0 > 0 ? 'up' : 'down') + ' to ' + t('y=' + s.y0) + '. The solution is ' + ptt(s.P) + '.',
              ['The solution of a system is the point where the two lines cross.', 'Write the ' + t('x') + '-coordinate first: ' + t('(x,\\ y)') + '.'], 'read solution from graph');
          } },
          { id: '1b', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            return verifyPart('Verify the solution algebraically in <b>both</b> equations. In each box, type the left side with the values put in, then what it equals (for example ' + t('2(3)-(-1)=7') + ').', s.E, s.n, s.P, 'verify solution in both equations');
          } }] },
      { num: '2', outcome: 'RF9', shared: q2Shared,
        stem: function (s) { return 'Graph ' + t(s.n[0]) + ' and ' + t(s.n[1]) + ' on the grid. Then state the solution of the system.'; },
        parts: [
          { id: '2a', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            return sysGraph('Graph both lines on the grid (arrows on both ends).', s.L, s.n,
              { wrong: [{ L: mbL(-s.m1, s.b1), code: 'u8t-gr-sign', hint: 'Your line for ' + t(s.n[0]) + ' goes the wrong way: its slope is ' + t(s.m1) + ', so it rises from left to right.' }, { L: mbL(s.m2, -s.b2), code: 'u8t-gr-shift', hint: 'Your line for ' + t(s.n[1]) + ' has the right slope but crosses the ' + t('y') + '-axis at ' + ptt([0, -s.b2]) + ' instead of ' + ptt([0, s.b2]) + '.' }] },
              t(s.n[0]) + ': ' + stepTxt(s.m1, s.b1) + '.<br>' + t(s.n[1]) + ': ' + stepTxt(s.m2, s.b2) + '.<br>Draw each line with arrows on both ends. They cross at ' + ptt(s.P) + '.',
              ['Plot the ' + t('y') + '-intercept ' + t('b') + ', then use the slope ' + t('m') + ' (rise over run) to find more points.', 'Put arrows on both ends of each line.'], 'graph y=mx+b system');
          } },
          { id: '2b', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            return pointPart('State the solution of the system.', s.P, s.L, {},
              'The lines cross at ' + ptt(s.P) + '. Check: ' + t(nT(s.y0) + '=' + s.m1 + '(' + s.x0 + ')' + (s.b1 < 0 ? '' : '+') + s.b1) + ' ✓ and ' + t(nT(s.y0) + '=' + T([[s.m2, '']]).replace(/^1$/, '') + '(' + s.x0 + ')' + (s.b2 < 0 ? '' : '+') + s.b2) + ' ✓. The solution is ' + ptt(s.P) + '.',
              ['The solution is where your two lines cross. Check it in both equations.'], 'solution of graphed system');
          } }] },
      { num: '3', section: 'RF9 · Part 1 — Progressing', outcome: 'RF9', shared: function (r) { return { kinds: r.shuffle(['one', 'none', 'inf']) }; },
        stem: 'Without graphing, decide whether each system has <b>one solution</b>, <b>no solution</b> or <b>infinitely many solutions</b>. Show how you know.',
        parts: [0, 1, 2].map(function (i) { return { id: '3' + 'abc'[i], outcome: 'RF9', level: 'PRG', make: function (r, s) { return clsPart(clsSys(r, s.kinds[i])); } }; }) },
      { num: '4', outcome: 'RF9', shared: q4Shared,
        stem: function (s) { return 'Write each equation in the form ' + t('y=mx+b') + '. Then graph the system and state its solution.' + sysTex(s.n[0], s.n[1]); },
        parts: [
          { id: '4a', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var A = s.L[0], B = s.L[1];
            var p = fieldsPart('Write each equation in the form ' + t('y=mx+b') + '.', [{ label: t(s.n[0]) + ':', name: t(s.n[0]), mode: 'math', keys: 'eq', placeholder: ' ' }, { label: t(s.n[1]) + ':', name: t(s.n[1]), mode: 'math', keys: 'eq', placeholder: ' ' }],
              [siChk(A), siChk(B)], [si(A), si(B)], t(si(A)) + '<br>' + t(si(B)),
              t(s.n[0]) + '<br>' + t(T([[A.B, 'y']]) + '=' + T([[-A.A, 'x'], [-A.C, '']])) + '<br>' + t(si(A)) + ' (divide every term by ' + t(A.B) + ')<br><br>' + t(s.n[1]) + '<br>' + t(T([[B.B, 'y']]) + '=' + T([[-B.A, 'x'], [-B.C, '']])) + '<br>' + t(si(B)) + ' (divide every term by ' + t(B.B) + ')',
              ['Move the ' + t('x') + '-term to the right side, then divide <b>every</b> term by the coefficient of ' + t('y') + '.'], 'rewrite in y=mx+b');
            p.bad = [[si(rearrWrongs(A)[0].is), si(B)], [si(A), si(rearrWrongs(B)[0].is)], [si(A), '']];
            return p;
          } },
          { id: '4b', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var a = mbTex(s.L[0]), b = mbTex(s.L[1]), sl = slopeOf(s.L[0]);
            return sysGraph('Graph both lines on the grid (arrows on both ends).', s.L, s.n, { wrong: [{ L: mbL([-sl[0], sl[1]], yInt(s.L[0])), code: 'u8t-gr-sign', hint: 'Your line for ' + t(s.n[0]) + ' goes the wrong way: its slope is ' + t(a.m) + '.' }] },
              t(si(s.L[0])) + ': start at ' + ptt([0, yInt(s.L[0])]) + ', then ' + (sl[0] > 0 ? 'up ' : 'down ') + t(Math.abs(sl[0])) + ' and right ' + t(sl[1]) + '.<br>' + t(si(s.L[1])) + ': ' + stepTxt(fv(slopeOf(s.L[1])), fv(yInt(s.L[1]))) + '.<br>The lines cross at ' + ptt(s.P) + '.',
              ['Use the ' + t('y=mx+b') + ' forms: plot ' + t('b') + ', then step with the slope.', 'Slope ' + t(a.m) + ' means rise ' + t(sl[0]) + ' over run ' + t(sl[1]) + '.'], 'graph rewritten system');
          } },
          { id: '4c', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var e0 = { a: s.L[0].A, b: s.L[0].B, c: -s.L[0].C }, e1 = { a: s.L[1].A, b: s.L[1].B, c: -s.L[1].C };
            return pointPart('State the solution of the system.', s.P, s.L, {},
              'The lines cross at ' + ptt(s.P) + '.<br>Check: ' + t(subT(e0.a, e0.b, s.P) + '=' + nT(e0.c)) + ' ✓ and ' + t(subT(e1.a, e1.b, s.P) + '=' + nT(e1.c)) + ' ✓.',
              ['Read the crossing point of your lines, then check it in both equations.'], 'solution of rewritten system');
          } }] },
      { num: '5', section: 'RF9 · Part 1 — Mastering', outcome: 'RF9', shared: q5Shared,
        stem: function (s) { return 'Consider the system ' + t(s.e1) + ' and ' + t(s.e2) + '.'; },
        parts: [
          { id: '5a', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var m2 = s.m2, m2T = fT(m2), k = s.k, scale = s.onX ? s.A2 : s.B2;   // k = scale / m (with the shown sign)
            var kW = [{ v: s.sg * s.m * s.m * s.k, code: 'u8t-k-mult', hint: 'The second equation’s coefficient is ' + t(s.m) + ' times the first’s, so ' + t('k') + ' is the coefficient <b>divided</b> by ' + t(s.m) + '.' },
              { v: -k, code: 'u8t-k-sign', hint: 'Check the sign of ' + t('k') + ': the two slopes must be <b>equal</b>, sign included.' },
              { v: s.sg * s.m * s.k, code: 'u8t-k-copy', hint: 'Copying the coefficient isn’t enough: the other coefficient was multiplied by ' + t(s.m) + ', so ' + t('k') + ' must be scaled the same way.' }];
            var diag = function (v) { for (var i = 0; i < kW.length; i++) if (near(v, kW[i].v) && !near(v, k)) return kW[i]; return null; };
            var o = s.o, m1T = s.onX ? (o > 0 ? '-\\frac{k}{' + o + '}' : '\\frac{k}{' + (-o) + '}') : (k > 0 ? '-\\frac{' + o + '}{k}' : '-\\frac{' + o + '}{k}');
            var yi1 = fT(fr(s.C1, s.onX ? o : k)), yi2 = fT(fr(s.C2s, s.B2));
            var p = fieldsPart('Find the value of ' + t('k') + ' that gives the system <b>no solution</b>. First give the slope of ' + t(s.e2) + ', then ' + t('k') + '.',
              [{ label: 'Slope of ' + t(s.e2) + ':', name: 'Slope', before: t('m='), mode: 'math', keys: 'slope', placeholder: ' ' }, { label: 'Value of ' + t('k') + ':', name: 'k', before: t('k='), mode: 'math', keys: 'slope', placeholder: ' ' }],
              [K.slope(m2), valChk(k, diag)], [m2T, String(k)], 'slope ' + t(m2T) + ', ' + t('k=' + k),
              'Slopes: ' + t(s.e1) + ' has ' + t('m=' + m1T) + '; ' + t(s.e2) + ' has ' + t('m=-\\frac{' + s.A2 + '}{' + s.B2 + '}=' + m2T) + '.<br>No solution needs <b>equal slopes</b> and different intercepts: ' + t(m1T + '=' + m2T) + ', so ' + t('k=' + k) + '.<br>' +
                'Check the intercepts: with ' + t('k=' + k) + ' the ' + t('y') + '-intercepts are ' + t(yi1) + ' and ' + t(yi2) + ' (different), so the lines are parallel and distinct.',
              ['No solution means parallel lines: equal slopes, different ' + t('y') + '-intercepts.', 'Write each slope as ' + t('-\\frac{A}{B}') + ' and set them equal.'], 'k for no solution');
            p.bad = [[m2T, String(-k)], [m2T, String(s.sg * s.m * s.k)]].filter(function (b) { return b[1] !== String(k); });
            return p;
          } },
          { id: '5b', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var nm = r.pick([['Mia', 'she'], ['Priya', 'she'], ['Ethan', 'he'], ['Liam', 'he'], ['Ava', 'she']]), k = s.k;
            var f = s.sg * s.m, e1k2 = s.onX ? gT(k, s.o, s.C1) : gT(s.o, k, s.C1), mult = gT(f * (s.onX ? k : s.o), f * (s.onX ? s.o : k), f * s.C1), e2raw = s.e2;
            return mc(r, nm[0] + ' says another value of ' + t('k') + ' gives the system <b>infinitely many</b> solutions. Is ' + nm[1] + ' right? Choose the answer with a correct reason.', [
              { html: '<b>No.</b> Only ' + t('k=' + k) + ' gives equal slopes. Then ' + t(e1k2) + ' times ' + t(f) + ' is ' + t(mult) + ', but the second equation is ' + t(e2raw) + ': parallel lines, not the same line. Any other ' + t('k') + ' gives one solution.', right: true },
              { html: '<b>Yes.</b> With ' + t('k=' + k) + ' the slopes are equal, so the lines are the same and there are infinitely many solutions.', why: 'Equal slopes alone don’t make the same line. With ' + t('k=' + k) + ', the first equation times ' + t(s.m) + ' is ' + t(mult) + ', not ' + t(e2raw) + ': the intercepts differ, so the lines are parallel.' },
              { html: '<b>Yes.</b> Any value of ' + t('k') + ' other than ' + t(k) + ' works, because then the slopes are different.', why: 'Different slopes mean the lines cross exactly <b>once</b>: one solution, not infinitely many.' },
              { html: '<b>No.</b> A system with a letter like ' + t('k') + ' in it can never have infinitely many solutions.', why: 'Right answer, wrong reason: if the second equation had been ' + t(mult) + ', then ' + t('k=' + k) + ' would give the same line. It is the right side, ' + t(s.C2s) + ' and not ' + t(f * s.C1) + ', that rules it out.' }],
              'Infinitely many solutions needs the <b>same line</b>: equal slopes <b>and</b> equal intercepts. Equal slopes happen only for ' + t('k=' + k) + ', and then ' + t(e1k2) + ' times ' + t(f) + ' is ' + t(mult) + ' — the second equation is ' + t(e2raw) + ', a different constant. So the lines are parallel, never the same: ' + nm[0] + ' is <b>not</b> right. Any other ' + t('k') + ' gives one solution.',
              ['What do the two equations need for the same line? Compare every term, the constants too.'], 'is there k for infinitely many: ' + s.e1 + ', ' + s.e2);
          } }] },
      { num: '6', outcome: 'RF9', shared: q6Shared,
        stem: function (s) { return 'One equation of a system is ' + t(gT(s.A, s.B, s.C)) + '. Write a second equation so the system has:'; },
        parts: [
          { id: '6a', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var key = gT(s.A, s.B, s.C + s.d);
            var p = K.P.math('no solution', q6Chk('none', s), key, 'Use the <b>same slope</b> and a different intercept: keep ' + t(T([[s.A, 'x'], [s.B, 'y']])) + ' and change the constant, e.g. ' + t(key) + '. Same slope ' + t(fT(fr(-s.A, s.B))) + ', different intercepts: parallel lines, no solution.',
              ['No solution means parallel lines: same slope, different ' + t('y') + '-intercept.'], 'second equation: no solution', { keys: 'eq', placeholder: ' ' });
            p.answer = 'e.g. ' + t(key) + ' (same slope, new intercept)';
            p.bad = [gT(s.A, s.B, s.C), gT(2 * s.A, 2 * s.B, 2 * s.C), 'x+y=' + (s.x0 + s.y0 + 1)];
            return p;
          } },
          { id: '6b', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var key = gT(2 * s.A, 2 * s.B, 2 * s.C);
            var p = K.P.math('infinitely many solutions', q6Chk('inf', s), key, 'Use the <b>same line</b>: multiply every term by the same number, e.g. ×2: ' + t(key) + '. Same slope and the same intercept, so every point on the line is a solution.',
              ['Infinitely many solutions means the same line: a multiple of the equation, constant included.'], 'second equation: infinitely many', { keys: 'eq', placeholder: ' ' });
            p.answer = 'e.g. ' + t(key) + ' (a multiple of the equation)';
            p.bad = [gT(2 * s.A, 2 * s.B, s.C), gT(s.A, s.B, s.C + s.d)];
            return p;
          } },
          { id: '6c', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var P = [s.x0, s.y0], useSum = !(s.A === s.B), key = useSum ? 'x+y=' + nT(s.x0 + s.y0) : 'x-y=' + nT(s.x0 - s.y0), mk = useSum ? '-1' : '1';
            var p = K.P.math('exactly one solution, ' + ptt(P) + '.', q6Chk('one', s), key,
              'Any line through ' + ptt(P) + ' with a slope other than ' + t(fT(fr(-s.A, s.B))) + ' works, e.g. ' + t(key) + ' (slope ' + t(mk) + ').<br>Check: ' + t(subT(s.A, s.B, P) + '=' + nT(s.C)) + ' ✓ and ' + t(subT(1, useSum ? 1 : -1, P) + '=' + nT(useSum ? s.x0 + s.y0 : s.x0 - s.y0)) + ' ✓; the slopes ' + t(fT(fr(-s.A, s.B))) + ' and ' + t(mk) + ' differ, so the lines cross only at ' + ptt(P) + '.',
              ['Pick a simple left side, like ' + t('x+y') + ', with a different slope, then substitute ' + ptt(P) + ' to find the constant.'], 'second equation: one solution at a point', { keys: 'eq', placeholder: ' ' });
            p.answer = 'e.g. ' + t(key) + ' (any line through ' + ptt(P) + ' with a different slope)';
            p.bad = [gT(s.A, s.B, s.C), (useSum ? 'x+y=' : 'x-y=') + nT((useSum ? s.x0 + s.y0 : s.x0 - s.y0) + 1)];
            return p;
          } }] },

      /* ======================= RF9 · Part 2: solving by substitution and elimination ======================= */
      { num: '7', section: 'RF9 · Part 2 — Beginning', outcome: 'RF9',
        shared: function (r) { return find(function () { return q7Build(nz(r, -3, 3), nz(r, -5, 7), r.int(2, 5), r.pick([1, 1, 2, 3, -2, -3]), nz(r, -3, 4)); }, function (s) { return s.A + s.B * s.m !== 0 && s.y0 !== 0 && Math.abs(s.y0) <= 9 && s.C !== 0 && Math.abs(s.C) <= 40 && Math.abs(s.x0) !== Math.abs(s.y0); }, null) || q7Build(2, -1, 3, 1, 3); },
        stem: function (s) { return 'Solve the system by <b>substitution</b>.' + sysTex('y=' + T([[s.m, 'x'], [s.b, '']]), gT(s.A, s.B, s.C)) + '<i>Hint: substitute the first equation into the second.</i>'; },
        parts: [
          { id: '7', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            var mx = T([[s.m, 'x'], [s.b, '']]), cx = s.A + s.B * s.m, W = [];
            if (s.B !== 1) { var xd = (s.C - s.b) / (s.A + s.B * s.m); W.push({ is: [xd, s.m * xd + s.b], code: 'u8t-distribute', hint: 'Multiply the bracket out fully: ' + t(s.B + '(' + mx + ')') + ' — the ' + t(s.B) + ' multiplies the constant ' + t(s.b) + ' too.' }); }
            var xc = (s.C + s.B * s.b) / cx; W.push({ is: [xc, s.m * xc + s.b], code: 'u8t-move-const', hint: 'Check the step where you move the constant to the other side: its sign changes.' });
            var sub = T([[s.A, 'x']]) + (s.B === 1 ? '+' : s.B === -1 ? '-' : (s.B > 0 ? '+' : '') + s.B) + '(' + mx + ')=' + nT(s.C);
            return pointPart('Solve the system. Give the solution as an ordered pair.', s.P, s.L, { wrong: W },
              'Substitute ' + t('y=' + mx) + ' into the second equation:<br>' + t(sub) + '<br>' + t(T([[s.A, 'x'], [s.B * s.m, 'x']]).replace(/x([+-])/, 'x$1') + (s.B * s.b < 0 ? '' : '+') + nT(s.B * s.b) + '=' + nT(s.C)) + '<br>' + t(T([[cx, 'x']]) + '=' + nT(s.C - s.B * s.b)) + (cx === 1 ? '' : ', so ' + t('x=' + s.x0)) + '<br>' +
                t('y=' + subT(s.m, 0, [s.x0, 0]) + (s.b < 0 ? '' : '+') + s.b + '=' + s.y0) + '<br>Check: ' + t(subT(s.A, s.B, s.P) + '=' + nT(s.C)) + ' ✓. The solution is ' + ptt(s.P) + '.',
              ['Replace ' + t('y') + ' in the second equation with ' + t(mx) + ' (use brackets), then solve for ' + t('x') + '.', 'Substitute your ' + t('x') + ' back into the first equation to find ' + t('y') + '.'], 'substitution y=mx+b into Ax+By=C');
          } }] },
      { num: '8', outcome: 'RF9', shared: q8Shared,
        stem: function (s) { return 'Solve the system by <b>elimination</b>. Then verify your solution in both equations.' + sysTex(s.n[0], s.n[1]); },
        parts: [
          { id: '8a', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            var xw = (s.c1 - s.c2) / (s.a1 + s.a2);
            return pointPart('Solve the system by elimination.', s.P, s.L, { wrong: [{ is: [xw, (s.c1 - s.a1 * xw) / s.b], code: 'u8t-elim-rhs', hint: 'When you add the equations, add the right sides too: ' + t(nT(s.c1) + '+' + par(s.c2)) + '.' }] },
              elimText(s.E[0], s.E[1], s.P), ['The ' + t('y') + '-terms are opposites: add the two equations to eliminate ' + t('y') + '.', 'Substitute your ' + t('x') + ' into either equation to find ' + t('y') + '.'], 'elimination, opposite y');
          } },
          { id: '8b', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            return verifyPart('Verify your solution in <b>both</b> equations. In each box, type the left side with your values put in, then what it equals (for example ' + t('2(3)-(-1)=7') + ').', s.E, s.n, s.P, 'verify elimination solution');
          } }] },
      { num: '9', section: 'RF9 · Part 2 — Progressing', outcome: 'RF9',
        shared: function (r) { return find(function () { return q9Build(r.int(2, 5), r.int(2, 5), r.int(2, 5), r.int(2, 5), nz(r, -4, 4), nz(r, -4, 4)); }, function (s) { return s.b1 !== s.b2 && s.b1 % s.b2 && s.b2 % s.b1 && s.a1 !== s.a2 && s.a1 % s.a2 && s.a2 % s.a1 && s.E[0].c !== 0 && s.E[1].c !== 0 && Math.abs(s.E[0].c) <= 30 && Math.abs(s.E[1].c) <= 30; }, null) || q9Build(3, 4, 5, 3, -2, 4); },
        stem: function (s) { return 'Solve by elimination.' + sysTex(s.n[0], s.n[1]); },
        parts: [
          { id: '9', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var L = lcm(s.b1, s.b2), m1 = L / s.b1, m2 = L / s.b2, den = m1 * s.a1 + m2 * s.a2, c1 = s.E[0].c, c2 = s.E[1].c, W = [];
            [[c1 + m2 * c2, 'first'], [m1 * c1 + c2, 'second']].forEach(function (z) { var x = z[0] / den; W.push({ is: [x, (c1 - s.a1 * x) / s.b1], code: 'u8t-rhs-unscaled', hint: 'When you multiply the ' + z[1] + ' equation, multiply <b>every</b> term — the right side too.' }); });
            return pointPart('Solve the system. Give the solution as an ordered pair.', s.P, s.L, { wrong: W }, elimText(s.E[0], s.E[1], s.P),
              ['Multiply each equation so the ' + t('y') + '-terms become opposites (e.g. ' + t('+' + L + 'y') + ' and ' + t('-' + L + 'y') + '), then add.', 'Multiply every term, the right side too.'], 'elimination, both scaled');
          } }] },
      { num: '10', outcome: 'RF9', shared: q10Shared,
        stem: function (s) { return 'Clear the fractions, then solve the system.' + sysTex(s.n[0], s.n[1]); },
        parts: [
          { id: '10a', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var keys = s.E.map(function (e) { return gT(e.a, e.b, e.c); });
            var p = fieldsPart('Multiply each equation by its lowest common denominator to clear the fractions.', [{ label: 'First equation:', name: 'First equation', mode: 'math', keys: 'eq', placeholder: ' ' }, { label: 'Second equation:', name: 'Second equation', mode: 'math', keys: 'eq', placeholder: ' ' }],
              [clearChk(s.E[0], s.R1, s.M[0], [s.d[0], s.d[1]]), clearChk(s.E[1], s.R2, s.M[1], [s.d[2], s.d[3]])], keys, t(keys[0]) + '<br>' + t(keys[1]),
              '×' + t(s.M[0]) + ': ' + t(keys[0]) + '<br>×' + t(s.M[1]) + ': ' + t(keys[1]) + '<br>(Multiply <b>every</b> term, the right side too.)',
              ['The lowest common denominator of ' + t(s.d[0]) + ' and ' + t(s.d[1]) + ' is ' + t(s.M[0]) + '.', 'Multiply every term on both sides.'], 'clear fractions in a system');
            p.bad = [[gT(s.E[0].a, s.E[0].b, s.R1), keys[1]], [keys[1], keys[0]]];
            return p;
          } },
          { id: '10b', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            return pointPart('Solve the system. Give the solution as an ordered pair.', s.P, s.L, {},
              'Cleared: ' + t(gT(s.E[0].a, s.E[0].b, s.E[0].c)) + ' and ' + t(gT(s.E[1].a, s.E[1].b, s.E[1].c)) + '.<br>' + elimText(s.E[0], s.E[1], s.P),
              ['Solve the cleared system by elimination.', 'Check your answer in the original equations with fractions.'], 'solve after clearing fractions');
          } }] },
      { num: '11', outcome: 'RF9', shared: q11Shared,
        stem: function (s) { return 'Solve algebraically. What happens? What does it tell you about the system and its graph?' + sysTex(s.e1, s.e2); },
        parts: [
          { id: '11a', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var key = '0=' + nT(s.D), mk = -s.k;
            var p = fieldsPart('Multiply the first equation so that a variable will cancel, then add the equations. What equation do you get?', [{ label: 'Result:', name: 'Result', mode: 'math', keys: 'eq', placeholder: 'e.g. 0 = 5' }],
              [resChk(s.kind, s.D)], [key], t(key),
              'Multiply the first equation by ' + t(mk) + ': ' + t(gT(mk * s.a1, mk * s.b1, mk * s.c1)) + '.<br>Add ' + t(s.e2) + ': both variables cancel and ' + t(key) + '.<br>' + (s.kind === 'none' ? 'That is a <b>false</b> statement.' : 'That is <b>always true</b>.'),
              ['Multiply the first equation by ' + t(mk) + ', every term.', 'Add the equations: what is left?'], 'special system: result');
            p.bad = [[s.kind === 'none' ? '0=0' : '0=1']].concat(s.kind === 'none' ? [['0=' + nT(s.D + (s.D > 0 ? 1 : -1))]] : []);
            return p;
          } },
          { id: '11b', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var none = s.kind === 'none';
            var O = [
              { html: '<b>No solution.</b> The result is a false statement, so no pair ' + t('(x,\\ y)') + ' works. The lines are <b>parallel</b>: same slope, different intercepts.', right: none, why: none ? null : 'Here the result is ' + t('0=0') + ', which is always true — not false.' },
              { html: '<b>Infinitely many solutions.</b> The result is always true, so every point on the line works. The two equations describe the <b>same line</b>.', right: !none, why: none ? 'The result ' + t('0=' + nT(s.D)) + ' is never true, so no point satisfies both equations.' : null },
              { html: '<b>One solution, at the origin.</b> Both variables became ' + t('0') + ', so ' + t('x=0') + ' and ' + t('y=0') + '.', why: 'The variables <b>cancelled</b> — that is not the same as ' + t('x=0') + '. Check: ' + t('(0,\\ 0)') + ' doesn’t make ' + t(s.e1) + ' true.' },
              none ? { html: '<b>No solution.</b> The two equations describe the same line, so they never cross.', why: 'Right number of solutions, wrong picture: the same line would give infinitely many solutions. Here the lines are parallel and distinct.' }
                : { html: '<b>Infinitely many solutions.</b> The lines are parallel, so they meet everywhere.', why: 'Right number of solutions, wrong picture: parallel lines never meet. Here the two equations are the same line.' }];
            return mc(r, 'When you solve this system algebraically, both variables cancel. What does the result tell you about the system and its graph?', O,
              none ? 'Both variables cancel and ' + t('0=' + nT(s.D)) + ' is a false statement: <b>no solution</b>. The lines have the same slope ' + t(fT(fr(-s.a1, s.b1))) + ' but different intercepts — they are <b>parallel</b>.' : 'Both variables cancel and ' + t('0=0') + ' is always true: <b>infinitely many solutions</b>. The second equation is ' + t(s.k) + ' times the first — the <b>same line</b>.',
              ['A false statement means no pair works; a statement that is always true means every point on the line works.'], 'special system: meaning');
          } }] },
      { num: '12', section: 'RF9 · Part 2 — Mastering', outcome: 'RF9', shared: function (r) { var s = q12Shared(r); s.who = r.pick([['Jordan', 'His'], ['Liam', 'His'], ['Ava', 'Her'], ['Maya', 'Her'], ['Noah', 'His']]); return s; },
        stem: function (s) {
          var lhs = '(' + T([[s.a, 'x'], [s.b1, 'y']]) + ')-(' + T([[s.a, 'x'], [s.b2, 'y']]) + ')=' + nT(s.c1) + '-' + par(s.c2);
          var l4 = T([[s.a, 'x']]) + (s.b1 < 0 ? '-' : '+') + (Math.abs(s.b1) === 1 ? '' : Math.abs(s.b1)) + '(' + nT(s.yw) + ')=' + nT(s.c1) + '\\ \\Rightarrow\\ x=' + xwT(s.xwF);
          return s.who[0] + ' solved this system by elimination. ' + s.who[1] + ' answer is wrong.' + sysTex(s.n[0], s.n[1]) +
            '<table style="margin:4px auto"><tr><td style="padding:2px 10px;color:#6a7182">Line 1</td><td>' + t(lhs) + '</td></tr><tr><td style="padding:2px 10px;color:#6a7182">Line 2</td><td>' + t(T([[s.sw, 'y']]) + '=' + nT(s.c1 - s.c2)) + '</td></tr><tr><td style="padding:2px 10px;color:#6a7182">Line 3</td><td>' + t('y=' + nT(s.yw)) + '</td></tr><tr><td style="padding:2px 10px;color:#6a7182">Line 4</td><td>' + t(l4) + '</td></tr></table>';
        },
        parts: [
          { id: '12a', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var right = T([[s.b1, 'y']]) + '-(' + T([[s.b2, 'y']]) + ')=' + T([[s.b1 - s.b2, 'y']]);
            return mc(r, 'Find the error and explain it.', [
              { html: '<b>Line 2.</b> Subtracting changes the sign of <b>every</b> term being subtracted: ' + t(right) + ', not ' + t(T([[s.sw, 'y']])) + '.', right: true },
              { html: '<b>Line 1.</b> The right side should be ' + t(nT(s.c1) + '+' + par(s.c2)) + ': the equations must be added.', why: 'Subtracting is the right move: the ' + t('x') + '-terms are equal, so subtracting cancels ' + t('x') + ', and ' + t(nT(s.c1) + '-' + par(s.c2)) + ' is right. The slip is in combining the ' + t('y') + '-terms.' },
              { html: '<b>Line 4.</b> ' + t('y') + ' should be substituted into the second equation, not the first.', why: 'Either original equation works for substituting back. The mistake happens earlier, when the ' + t('y') + '-terms are combined.' },
              { html: '<b>No step is wrong.</b> The answer is right; it just isn’t a whole number.', why: 'Check it in the second equation: ' + t(subT(s.a, s.b2, [s.xw, s.yw]).replace(/\(([^)]*)\)/, '(' + xwT(s.xwF) + ')') + '\\ne ' + nT(s.c2)) + '. A solution must make <b>both</b> equations true, so a step is wrong.' }],
              'Line 2 is wrong. Subtracting the whole second equation changes the sign of every term in it: ' + t(right) + ' (not ' + t(T([[s.sw, 'y']])) + '), while ' + t(nT(s.c1) + '-' + par(s.c2) + '=' + nT(s.c1 - s.c2)) + ' is right.',
              ['Check each line: subtract term by term, with the signs.'], 'find the elimination error');
          } },
          { id: '12b', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var d = s.b1 - s.b2;
            return pointPart('Give the correct solution.', s.P, s.L, { wrong: [{ is: [s.xw, s.yw], code: 'u8t-elim-rhs', hint: 'That is the student’s answer. Redo Line 2: ' + t(T([[s.b1, 'y']]) + '-(' + T([[s.b2, 'y']]) + ')') + '.' }] },
              t('(' + T([[s.a, 'x'], [s.b1, 'y']]) + ')-(' + T([[s.a, 'x'], [s.b2, 'y']]) + ')=' + nT(s.c1) + '-' + par(s.c2)) + '<br>' + t(T([[d, 'y']]) + '=' + nT(s.c1 - s.c2)) + ', so ' + t('y=' + s.y0) + '<br>' +
                t(T([[s.a, 'x']]) + (s.b1 < 0 ? '-' : '+') + (Math.abs(s.b1) === 1 ? '' : Math.abs(s.b1)) + '(' + nT(s.y0) + ')=' + nT(s.c1)) + ', so ' + t(T([[s.a, 'x']]) + '=' + nT(s.c1 - s.b1 * s.y0)) + ' and ' + t('x=' + s.x0) + '.' +
                '<br>Solution: ' + ptt(s.P) + '. Check: ' + t(subT(s.a, s.b2, s.P) + '=' + nT(s.c2)) + ' ✓',
              ['Subtract the equations again, carefully with the signs of the ' + t('y') + '-terms.'], 'correct solution after error');
          } }] },
      { num: '13', outcome: 'RF9', shared: q13Shared,
        stem: function (s) { return 'The line ' + t('ax+by=' + s.K) + ' passes through the points ' + ptt(s.p1) + ' and ' + ptt(s.p2) + '.'; },
        parts: [
          { id: '13a', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var k1 = T([[s.p1[0], 'a'], [s.p1[1], 'b']]) + '=' + s.K, k2 = T([[s.p2[0], 'a'], [s.p2[1], 'b']]) + '=' + s.K;
            return sysPart('Write a system of two equations in ' + t('a') + ' and ' + t('b') + ' (substitute each point for ' + t('x') + ' and ' + t('y') + ').', [[s.p1[0], s.p1[1], -s.K], [s.p2[0], s.p2[1], -s.K]],
              { vars: ['a', 'b'], keyTex: [k1, k2], names: ['the point ' + ptt(s.p1), 'the point ' + ptt(s.p2)], labels: ['Equation 1', 'Equation 2'],
                wrong: [{ eq: T([[s.p1[1], 'a'], [s.p1[0], 'b']]) + '=' + s.K, code: 'u8t-ab-swap', hint: 'The ' + t('x') + '-coordinate multiplies ' + t('a') + ' (because of ' + t('ax') + ') and the ' + t('y') + '-coordinate multiplies ' + t('b') + '.' }, { eq: T([[s.p2[1], 'a'], [s.p2[0], 'b']]) + '=' + s.K, code: 'u8t-ab-swap', hint: 'The ' + t('x') + '-coordinate multiplies ' + t('a') + ' (because of ' + t('ax') + ') and the ' + t('y') + '-coordinate multiplies ' + t('b') + '.' }] },
              'Substitute each point into ' + t('ax+by=' + s.K) + ':<br>' + ptt(s.p1) + ': ' + t(k1) + '<br>' + ptt(s.p2) + ': ' + t(k2),
              ['A point on the line makes ' + t('ax+by=' + s.K) + ' true: put its ' + t('x') + ' in for ' + t('x') + ' and its ' + t('y') + ' in for ' + t('y') + '.'], 'system for a and b');
          } },
          { id: '13b', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var E1 = { a: s.p1[0], b: s.p1[1], c: s.K }, E2 = { a: s.p2[0], b: s.p2[1], c: s.K }, lineKey = gT(s.a, s.b, s.K);
            var p = fieldsPart('Solve your system for ' + t('a') + ' and ' + t('b') + '. Then write the equation of the line.',
              [{ label: t('a='), name: 'a', mode: 'math', keys: 'eq', placeholder: ' ' }, { label: t('b='), name: 'b', mode: 'math', keys: 'eq', placeholder: ' ' }, { label: 'Equation of the line:', name: 'Equation', mode: 'math', keys: 'eq', placeholder: ' ' }],
              [valChk(s.a), valChk(s.b), K.line({ A: s.a, B: s.b, C: -s.K })], [String(s.a), String(s.b), lineKey], t('a=' + s.a) + ', ' + t('b=' + s.b) + '; ' + t(lineKey),
              elimText(E1, E2, [s.a, s.b], ['a', 'b']) + '<br>The line is ' + t(lineKey) + '. Check ' + ptt(s.p2) + ': ' + t(subT(s.a, s.b, s.p2) + '=' + s.K) + ' ✓',
              ['Solve the system from part (a) by elimination.', 'Put your ' + t('a') + ' and ' + t('b') + ' into ' + t('ax+by=' + s.K) + '.'], 'solve for a, b and the line',
              { pre: function (resp) { var a = numOf(resp[0]), b = numOf(resp[1]); return a != null && b != null && s.a !== s.b && near(a, s.b) && near(b, s.a) ? wrong('swap-answer', 'Your values of ' + t('a') + ' and ' + t('b') + ' are in each other’s boxes.') : null; } });
            p.bad = [[String(s.b), String(s.a), gT(s.b, s.a, s.K)], [String(s.a), String(s.b), gT(s.b, s.a, s.K)]].filter(function (b) { return s.a !== s.b; });
            return p;
          } }] },

      /* ======================= RF9 · Part 3: modelling and solving problems ======================= */
      { num: '14', section: 'RF9 · Part 3 — Beginning', outcome: 'RF9', shared: q14Shared,
        stem: function (s) { return q14Text(s); },
        parts: [
          { id: '14a', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            var v = s.v, k1 = v[0] + '+' + v[1] + '=' + s.S, k2 = v[0] + '-' + v[1] + '=' + s.D;
            var nm = s.c === 'games' ? ['the games played', 'the difference between wins and losses'] : ['the sum', 'the difference'];
            return sysPart('Write a system of two equations.', [[1, 1, -s.S], [1, -1, -s.D]],
              { vars: v, keyTex: [k1, k2], names: nm, labels: ['Equation 1', 'Equation 2'],
                wrong: [{ eq: v[1] + '-' + v[0] + '=' + s.D, code: 'u8t-diff-order', hint: t(v[0]) + ' is the larger, so the difference is ' + t(v[0] + '-' + v[1]) + '.' }, { eq: v[0] + '+' + v[1] + '=' + s.D, code: 'u8t-facts-swap', hint: 'The two values add to ' + t(s.S) + '; it is their <b>difference</b> that is ' + t(s.D) + '.' }, { eq: v[0] + '-' + v[1] + '=' + s.S, code: 'u8t-facts-swap', hint: 'The difference is ' + t(s.D) + '; ' + t(s.S) + ' is the <b>sum</b>.' }, { eq: v[0] + '=' + s.D + v[1], code: 'u8t-sum-diff', hint: '“' + s.D + ' more than” means add ' + t(s.D) + ', not multiply by it.' }] },
              t(k1) + ' (' + nm[0] + ')<br>' + t(k2) + ' (' + nm[1] + ')',
              ['One equation for the total, one for the difference.'], 'sum and difference system');
          } },
          { id: '14b', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            var v = s.v, nm = s.c === 'num' ? ['larger number', 'smaller number'] : s.c === 'games' ? ['number of wins', 'number of losses'] : ['larger angle', 'smaller angle'];
            var after = s.c === 'angles' ? '°' : '';
            return numsPart(s.c === 'games' ? 'Solve the system to find the wins and losses.' : s.c === 'num' ? 'Solve the system to find both numbers.' : 'Solve the system to find both angles.',
              [{ label: (s.c === 'games' ? 'Wins' : s.c === 'num' ? 'Larger number' : 'Larger angle') + ':', name: nm[0], after: after }, { label: (s.c === 'games' ? 'Losses' : s.c === 'num' ? 'Smaller number' : 'Smaller angle') + ':', name: nm[1], after: after }],
              [s.big, s.small], { sys: [[1, 1, -s.S], [1, -1, -s.D]] },
              'Add the equations: ' + t('2' + v[0] + '=' + (s.S + s.D)) + ', so ' + t(v[0] + '=' + s.big) + '.<br>' + t(s.big + '+' + v[1] + '=' + s.S) + ', so ' + t(v[1] + '=' + s.small) + '.<br>Check: ' + t(s.big + '-' + s.small + '=' + s.D) + ' ✓',
              ['Add the two equations: ' + t(v[1]) + ' cancels.'], 'solve sum and difference');
          } }] },
      { num: '15', outcome: 'RF9', shared: q15Shared,
        stem: function (s) { return q15Text(s); },
        parts: [
          { id: '15a', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            var v = s.v, key = T([[s.p[0], v[0]], [s.p[1], v[1]]]) + '=' + iT(s.V), what = s.c === 'tickets' ? 'tickets' : s.c === 'bills' ? 'bills' : 'sales';
            var wr = [{ eq: T([[s.p[0], v[0]], [s.p[1], v[1]]]) + '=' + s.N, code: 'u8t-rhs-count', hint: t(s.N) + ' is the number of ' + (s.c === 'bills' ? 'bills' : s.c === 'tickets' ? 'tickets' : 'baskets') + '. The value equation adds up <b>dollars</b>: its total is ' + t(money(s.V)) + '.' },
              { eq: T([[s.p[1], v[0]], [s.p[0], v[1]]]) + '=' + s.V, code: 'u8t-price-swap', hint: 'Check which price goes with which letter: ' + t(v[0]) + ' counts the ' + q15Names(s)[0] + ', worth ' + t(money(s.p[0])) + ' each.' },
              { eq: v[0] + '+' + v[1] + '=' + s.V, code: 'u8t-no-prices', hint: 'Each item is worth its price: multiply each count by its price.' }];
            var p = K.P.math('Write a second equation for the total value of the ' + what + '.', eqChk([s.p[0], s.p[1], -s.V], v, wr), key,
              'Each ' + (s.c === 'bills' ? 'bill' : s.c === 'tickets' ? 'ticket' : 'basket') + ' is worth its price, and the total value is ' + t(money(s.V)) + ':<br>' + t(key),
              ['Multiply each count by its price, then add.'], 'value equation', { keys: 'eq', vars: v, placeholder: ' ' });
            p.bad = wr.map(function (w) { return w.eq; });
            return p;
          } },
          { id: '15b', outcome: 'RF9', level: 'BEG', make: function (r, s) {
            var v = s.v, nm = q15Names(s);
            return numsPart('Solve the system. How many of each ' + (s.c === 'tickets' ? 'ticket were sold' : s.c === 'bills' ? 'bill are there' : 'basket were sold') + '?',
              [{ label: nm[0].charAt(0).toUpperCase() + nm[0].slice(1) + ':', name: 'number of ' + nm[0] }, { label: nm[1].charAt(0).toUpperCase() + nm[1].slice(1) + ':', name: 'number of ' + nm[1] }],
              s.n, { sys: [[1, 1, -s.N], [s.p[0], s.p[1], -s.V]] },
              t(v[0] + '+' + v[1] + '=' + s.N) + ' and ' + t(T([[s.p[0], v[0]], [s.p[1], v[1]]]) + '=' + iT(s.V)) + '.<br>' + subsText(v, s.N, s.p[0], s.p[1], s.V, s.n[0], s.n[1]) + '<br>Check: ' + t(s.p[0] + '(' + s.n[0] + ')+' + s.p[1] + '(' + s.n[1] + ')=' + iT(s.V)) + ' ✓<br><b>' + s.n[0] + ' ' + nm[0] + ' and ' + s.n[1] + ' ' + nm[1] + '.</b>',
              ['Solve the first equation for one letter and substitute into the value equation.'], 'solve count and value');
          } }] },
      { num: '16', section: 'RF9 · Part 3 — Progressing', outcome: 'RF9', shared: q16Shared,
        stem: function (s) { return q16Info(s).text; },
        parts: [
          { id: '16a', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var I = q16Info(s), v = s.v, nuts = s.c === 'nuts', C = r6(s.cc * s.M / (nuts ? 1 : 100)), c1 = nuts ? s.r1 : dp(s.r1), c2 = nuts ? s.r2 : dp(s.r2);
            var k1 = v[0] + '+' + v[1] + '=' + s.M, k2 = c1 + v[0] + '+' + c2 + v[1] + '=' + dT(C);
            var wr = nuts ? [{ eq: s.r1 + v[0] + '+' + s.r2 + v[1] + '=' + s.cc, code: 'u8t-mix-rhs', hint: 'The right side is the value of the <b>whole</b> mix: ' + t(money(s.cc) + '\\times ' + s.M + '=' + money(C)) + '.' }, { eq: s.r2 + v[0] + '+' + s.r1 + v[1] + '=' + C, code: 'u8t-mix-swap', hint: 'Check which price goes with which letter: ' + t(v[0]) + ' is the peanuts, at ' + t(money(s.r1)) + '/kg.' }, { eq: v[0] + '+' + v[1] + '=' + C, code: 'u8t-mix-total', hint: 'The mass equation adds the two masses: they make ' + t(s.M) + ' kg.' }]
              : [{ eq: c1 + v[0] + '+' + c2 + v[1] + '=' + dp(s.cc), code: 'u8t-mix-rhs', hint: 'The right side is the amount of pure ' + I.what + ' in the mixture: ' + t(dp(s.cc) + '(' + s.M + ')=' + dT(C)) + ' ' + I.unit + '.' },
                { eq: c1 + v[0] + '+' + c2 + v[1] + '=' + s.cc, code: 'u8t-mix-rhs', hint: 'The right side is the amount of pure ' + I.what + ': ' + t(pc(s.cc)) + ' of ' + t(s.M) + ' ' + I.unit + ' is ' + t(dT(C)) + ', not ' + t(s.cc) + '.' },
                { eq: s.r1 + v[0] + '+' + s.r2 + v[1] + '=' + C, code: 'u8t-mix-scale', hint: 'Use the same scale on both sides: with decimals, ' + t(dp(s.r1) + 'x+' + dp(s.r2) + 'y=' + dT(C)) + '.' },
                { eq: s.r1 + v[0] + '+' + s.r2 + v[1] + '=' + s.cc, code: 'u8t-pct-dec', hint: 'Change each percent to a decimal, and the right side is the amount of pure ' + I.what + ': ' + t(dp(s.cc) + '(' + s.M + ')=' + dT(C)) + '.' },
                { eq: dp(s.r2) + v[0] + '+' + dp(s.r1) + v[1] + '=' + C, code: 'u8t-mix-swap', hint: 'Check which percent goes with which letter: ' + t(v[0]) + ' is the ' + t(pc(s.r1)) + ' solution.' },
                { eq: v[0] + '+' + v[1] + '=' + C, code: 'u8t-mix-total', hint: 'The amount equation adds the two amounts: they make ' + t(s.M) + ' ' + I.unit + '.' }];
            return sysPart('Write a system of two equations.', [[1, 1, -s.M], [nuts ? s.r1 : s.r1 / 100, nuts ? s.r2 : s.r2 / 100, -C]],
              { vars: v, keyTex: [k1, k2], names: [I.amt, I.con], labels: ['Equation 1', 'Equation 2'], tips: ['the two amounts add to ' + s.M + ' ' + I.unit + '.', nuts ? 'price × mass for each nut, adding to the value of the whole mix.' : 'rate × amount for each solution, adding to the pure ' + I.what + ' in the mixture.'], wrong: wr },
              I.amt.charAt(0).toUpperCase() + I.amt.slice(1) + ': ' + t(k1) + '<br>' + I.con.charAt(0).toUpperCase() + I.con.slice(1) + ': ' + t(k2) + (nuts ? ' (' + t(money(s.cc) + '\\times ' + s.M + '=' + money(C)) + ')' : ' (' + t(dp(s.cc) + '(' + s.M + ')=' + dT(C)) + ')'),
              ['One equation for the amounts, one for ' + (nuts ? 'the value' : 'the pure ' + I.what) + '.', nuts ? 'Value = price × mass.' : 'Change each percent to a decimal.'], 'mixture system');
          } },
          { id: '16b', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var I = q16Info(s), v = s.v, nuts = s.c === 'nuts', C = r6(s.cc * s.M / (nuts ? 1 : 100)), p1 = nuts ? s.r1 : s.r1 / 100, p2 = nuts ? s.r2 : s.r2 / 100;
            return numsPart('Solve the system. How much of each should be mixed?',
              [{ label: (nuts ? 'Peanuts' : 'The ' + s.r1 + '% solution') + ':', name: nuts ? 'mass of peanuts' : 'amount of the ' + s.r1 + '% solution', after: I.unit }, { label: (nuts ? 'Cashews' : 'The ' + s.r2 + '% solution') + ':', name: nuts ? 'mass of cashews' : 'amount of the ' + s.r2 + '% solution', after: I.unit }],
              [s.x, s.y], { sys: [[1, 1, -s.M], [p1, p2, -C]] },
              t(v[0] + '+' + v[1] + '=' + s.M) + ' and ' + t(T([[p1, v[0]], [p2, v[1]]], true) + '=' + dT(C)) + '.<br>' + subsText(v, s.M, p1, p2, C, s.x, s.y, true) + '<br><b>' + s.x + ' ' + I.unit + ' of ' + I.names[0] + ' and ' + s.y + ' ' + I.unit + ' of ' + I.names[1] + '.</b>',
              ['Solve the first equation for one letter and substitute.', nuts ? '' : 'Multiply by ' + t(100) + ' to clear the decimals first if you like.'].filter(Boolean), 'solve mixture');
          } }] },
      { num: '17', outcome: 'RF9', shared: q17Shared,
        stem: function (s) { return s.who[0] + ' invested ' + t(money(s.P)) + ', part at ' + t(pc(s.r1)) + ' per year and the rest at ' + t(pc(s.r2)) + ' per year. After one year the investments earned ' + t(money(s.I)) + ' in interest. Let ' + t('x') + ' be the amount (in dollars) invested at ' + t(pc(s.r1)) + ' and ' + t('y') + ' the amount at ' + t(pc(s.r2)) + '.'; },
        parts: [
          { id: '17a', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var k1 = 'x+y=' + iT(s.P), k2 = dp(s.r1) + 'x+' + dp(s.r2) + 'y=' + iT(s.I);
            return sysPart('Write a system of two equations.', [[1, 1, -s.P], [s.r1 / 100, s.r2 / 100, -s.I]],
              { vars: ['x', 'y'], keyTex: [k1, k2], names: ['the amount invested', 'the interest'], labels: ['Equation 1', 'Equation 2'], tips: ['the two amounts add to ' + money(s.P).replace('\\$', '$') + '.', 'rate × amount for each part, adding to the interest.'],
                wrong: [{ eq: dT(s.r1) + 'x+' + dT(s.r2) + 'y=' + s.I, code: 'u8t-pct-dec', hint: 'Change each percent to a decimal: ' + t(pc(s.r1) + '=' + dp(s.r1)) + '.' }, { eq: dp(s.r2) + 'x+' + dp(s.r1) + 'y=' + s.I, code: 'u8t-rate-swap', hint: 'Check which rate goes with which letter: ' + t('x') + ' is invested at ' + t(pc(s.r1)) + '.' }, { eq: 'x+y=' + s.I, code: 'u8t-int-total', hint: 'The amounts invested add to ' + t(money(s.P)) + '; ' + t(money(s.I)) + ' is the interest.' }, { eq: dp(s.r1) + 'x+' + dp(s.r2) + 'y=' + s.P, code: 'u8t-int-total', hint: 'The interest equation adds up the interest, ' + t(money(s.I)) + ', not the amount invested.' }] },
              'Amount: ' + t(k1) + '<br>Interest: ' + t(k2), ['One equation for the money invested, one for the interest earned.', 'Interest = rate (as a decimal) × amount.'], 'interest system');
          } },
          { id: '17b', outcome: 'RF9', level: 'PRG', make: function (r, s) {
            var p1 = s.r1 / 100, p2 = s.r2 / 100;
            return numsPart('Solve the system. How much was invested at each rate?', [{ label: 'At ' + s.r1 + '%:', name: 'amount at ' + s.r1 + '%', before: '$' }, { label: 'At ' + s.r2 + '%:', name: 'amount at ' + s.r2 + '%', before: '$' }],
              [s.x, s.y], { money: true, sys: [[1, 1, -s.P], [p1, p2, -s.I]], wrong: [{ v: [s.y, s.x], code: 'u8t-rate-swap', hint: 'Check which amount earns which rate.' }] },
              t('x+y=' + iT(s.P)) + ' and ' + t(dp(s.r1) + 'x+' + dp(s.r2) + 'y=' + iT(s.I)) + '.<br>' + subsText(['x', 'y'], s.P, p1, p2, s.I, s.x, s.y, true) + '<br>Check: ' + t(dp(s.r1) + '(' + iT(s.x) + ')+' + dp(s.r2) + '(' + iT(s.y) + ')=' + iT(s.I)) + ' ✓<br><b>' + money(s.x).replace('\\$', '$') + ' at ' + s.r1 + '% and ' + money(s.y).replace('\\$', '$') + ' at ' + s.r2 + '%.</b>',
              ['Substitute ' + t('y=' + iT(s.P) + '-x') + ' into the interest equation.', 'Multiply by ' + t(100) + ' (or ' + t(1000) + ') to clear the decimals first if you like.'], 'solve interest');
          } }] },
      { num: '18', section: 'RF9 · Part 3 — Mastering', outcome: 'RF9', shared: q18Shared,
        stem: function (s) { return q18Info(s).text; },
        parts: [
          { id: '18a', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var I = q18Info(s), v = s.v, k1 = v[0] + '+' + v[1] + '=' + iT(s.S1), k2 = v[0] + '-' + v[1] + '=' + iT(s.S2);
            return sysPart('Set up a system of two equations for the speeds.', [[1, 1, -s.S1], [1, -1, -s.S2]],
              { vars: v, keyTex: [k1, k2], names: ['the trip ' + I.with, 'the trip ' + I.against], labels: ['Equation 1', 'Equation 2'], tips: ['speed ' + I.with + ' = ' + v[0] + ' + ' + v[1] + ', and speed = distance ÷ time.', 'speed ' + I.against + ' = ' + v[0] + ' − ' + v[1] + ', and speed = distance ÷ time.'],
                wrong: [{ eq: v[0] + '+' + v[1] + '=' + s.D, code: 'u8t-dist-speed', hint: t(F(s.D)) + ' km is a distance. The speed ' + I.with + ' is distance ÷ time: ' + t('\\frac{' + s.D + '}{' + s.t1 + '}') + '.' }, { eq: v[0] + '-' + v[1] + '=' + s.D, code: 'u8t-dist-speed', hint: t(F(s.D)) + ' km is a distance. The speed ' + I.against + ' is distance ÷ time: ' + t('\\frac{' + s.D + '}{' + s.t2 + '}') + '.' }, { eq: v[0] + '+' + v[1] + '=' + iT(s.S2), code: 'u8t-with-against', hint: 'Going ' + I.with + ' is the faster trip (' + t(s.t1) + ' h), so ' + t(v[0] + '+' + v[1]) + ' goes with ' + t(s.t1) + ' h.' }, { eq: v[0] + '-' + v[1] + '=' + iT(s.S1), code: 'u8t-with-against', hint: 'Going ' + I.against + ' is the slower trip (' + t(s.t2) + ' h), so ' + t(v[0] + '-' + v[1]) + ' goes with ' + t(s.t2) + ' h.' }, { eq: v[0] + '+' + v[1] + '=' + s.D * s.t1, code: 'u8t-time-speed', hint: 'Speed is distance <b>divided</b> by time.' }] },
              (I.with.charAt(0).toUpperCase() + I.with.slice(1)) + ': ' + t(v[0] + '+' + v[1] + '=\\frac{' + s.D + '}{' + s.t1 + '}=' + iT(s.S1)) + '<br>' + (I.against.charAt(0).toUpperCase() + I.against.slice(1)) + ': ' + t(v[0] + '-' + v[1] + '=\\frac{' + s.D + '}{' + s.t2 + '}=' + iT(s.S2)),
              ['The ' + (s.c === 'boat' ? 'current' : 'wind') + ' adds to the speed one way and subtracts the other way.', 'Speed = distance ÷ time.'], 'wind/current system');
          } },
          { id: '18b', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var I = q18Info(s), v = s.v;
            return numsPart('Solve the system to find both speeds.', [{ label: I.still.charAt(0).toUpperCase() + I.still.slice(1) + ':', name: I.still.replace(/^the /, ''), after: 'km/h' }, { label: I.other.charAt(0).toUpperCase() + I.other.slice(1) + ':', name: I.other.replace(/^the /, ''), after: 'km/h' }],
              [s.p, s.w], { sys: [[1, 1, -s.S1], [1, -1, -s.S2]], wrong: [{ v: [s.S1, s.S2], code: 'u8t-with-against', hint: 'Those are the speeds ' + I.with + ' and ' + I.against + '. Solve the system: add the equations.' }] },
              t(v[0] + '+' + v[1] + '=' + iT(s.S1)) + ' and ' + t(v[0] + '-' + v[1] + '=' + iT(s.S2)) + '.<br>Add: ' + t('2' + v[0] + '=' + iT(s.S1 + s.S2)) + ', so ' + t(v[0] + '=' + iT(s.p)) + '; then ' + t(v[1] + '=' + iT(s.S1) + '-' + iT(s.p) + '=' + iT(s.w)) + '.<br><b>' + I.still.charAt(0).toUpperCase() + I.still.slice(1) + ' ' + s.p + ' km/h; ' + I.other + ' ' + s.w + ' km/h.</b>',
              ['Add the two equations to eliminate ' + t(v[1]) + '.'], 'solve wind/current');
          } },
          { id: '18c', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var I = q18Info(s), T0 = 2 * s.D / s.p, TT = s.t1 + s.t2, T0s = isInt(T0 * 100) ? dT(r6(T0)) : (Math.round(T0 * 100) / 100).toFixed(2);
            var c0 = valChk(T0, function (v) { if (near(v, s.D / s.p)) return { code: 'u8t-one-way', hint: 'That is one way. The round trip is ' + t(F(2 * s.D)) + ' km.' }; return { code: 'u8t-time', hint: 'Round trip with ' + I.none + ': ' + t('\\text{time}=\\frac{\\text{distance}}{\\text{speed}}') + ', and the distance is there and back.' }; }, { tol: isInt(T0 * 100) ? 0 : 0.051 });
            var c1 = valChk(TT, function () { return { code: 'u8t-time', hint: 'Add the two times given in the question.' }; });
            var c2 = function (resp) { var k = String(resp == null ? '' : resp).toLowerCase().replace(/\\text\{([^}]*)\}/g, '$1').trim(); if (!k) return form('empty', 'Type more or less.'); if (/less|short|fast|quick|<|fewer/.test(k)) return ok(); if (/more|long|slow|>/.test(k)) return wrong('u8t-concl', 'Compare your two times: which is smaller?'); return form('u8t-pick-read', 'Type <b>more</b> or <b>less</b>.'); };
            var p = fieldsPart('With <b>' + I.none + '</b>, would the round trip take more or less time? Show why: give both round-trip times.',
              [{ label: 'Round trip with ' + I.none + ':', name: 'Round trip with ' + I.none, after: 'h' }, { label: 'Round trip as in the question:', name: 'Round trip as in the question', after: 'h' }, { label: 'With ' + I.none + ', does it take more or less time?', name: 'More or less', mode: 'text', placeholder: ' ' }],
              [c0, c1, c2], [T0s, String(TT), 'less'], t(T0s) + ' h ' + (isInt(T0 * 100) ? '' : '(about) ') + 'vs ' + t(TT) + ' h — <b>less</b> time',
              'With ' + I.none + ': ' + t('\\frac{2\\times ' + s.D + '}{' + s.p + '}=\\frac{' + 2 * s.D + '}{' + s.p + '}' + (isInt(T0 * 100) ? '=' : '\\approx ') + T0s) + ' h, compared with ' + t(s.t1 + '+' + s.t2 + '=' + TT) + ' h.<br><b>Less</b> time: the slow leg loses more time than the fast leg gains.',
              ['With ' + I.none + ', both legs go at ' + I.still.replace(/^the /, '') + '. Time = distance ÷ speed.'], 'no-wind round trip');
            return p;
          } }] },
      { num: '19', outcome: 'RF9', shared: q19Shared,
        stem: function (s) { return q19Info(s).text; },
        parts: [
          { id: '19a', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var I = q19Info(s), v = s.v, Tg = [0, 1].map(function (i) { return [s.R[i], -1, s.F[i]]; });
            var chk = function (i) { return eqChk(Tg[i], v, [{ eq: 'C=' + dT(s.R[i]) + '+' + T([[s.F[i], v[0]]]), code: 'u8t-fee-rate', hint: 'The fixed amount is added once; the rate multiplies ' + t(v[0]) + '.' }, { eq: 'C=' + T([[s.R[i], v[0]]], true), code: 'u8t-no-fee', hint: 'Don’t forget the fixed amount, ' + t(money(s.F[i])) + '.' }].filter(function (w) { return s.F[i]; })); };
            var p = fieldsPart('Write a system for the total cost ' + t('C') + ' (in dollars).', [{ label: s.names[0] + ':', name: s.names[0], mode: 'math', keys: 'eq', vars: v, placeholder: ' ' }, { label: s.names[1] + ':', name: s.names[1], mode: 'math', keys: 'eq', vars: v, placeholder: ' ' }],
              [chk(0), chk(1)], I.eqs, s.names[0] + ': ' + t(I.eqs[0]) + '<br>' + s.names[1] + ': ' + t(I.eqs[1]),
              s.names[0] + ': ' + t(I.eqs[0]) + '<br>' + s.names[1] + ': ' + t(I.eqs[1]) + '<br>(fixed amount + rate × ' + t(v[0]) + ')',
              ['Cost = fixed amount + rate × ' + t(v[0]) + '.'], 'cost system',
              { pre: function (resp) { var a = Ln.read(String(resp[0] || ''), v), b = Ln.read(String(resp[1] || ''), v); return a.ok && b.ok && Ln.same([a.a, a.b, a.c], Tg[1]) && Ln.same([b.a, b.b, b.c], Tg[0]) ? form('u8t-eq-boxes', 'Both equations are right, but they are in each other’s boxes.') : null; } });
            p.bad = [[I.eqs[1], I.eqs[0]], [I.eqs[0], 'C=' + T([[s.R[1], v[0]]], true) + (s.F[1] ? '' : '+5')]];
            return p;
          } },
          { id: '19b', sub: 'b i', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var I = q19Info(s), v = s.v[0], dR = r6(s.R[1] - s.R[0]), dF = r6(s.F[0] - s.F[1]);
            return numsPart('Solve the system. What does the solution mean?', [{ label: 'Both cost the same at ' + t(v + '=') , name: v, after: I.unit }, { label: 'That cost:', name: 'cost', before: '$' }],
              [s.X, s.C], { money: false, sys: [[s.R[0], -1, s.F[0]], [s.R[1], -1, s.F[1]]], swapHint: 'The first box is the number of ' + I.unit + '; the second is the cost.' },
              'Both equations are solved for ' + t('C') + ', so set them equal (substitution):<br>' + t(I.eqs[0].slice(2) + '=' + I.eqs[1].slice(2)) + '<br>' + t(dT(dF) + '=' + T([[dR, v]], true)) + ', so ' + t(v + '=' + dT(s.X)) + ' and ' + t('C=' + dT(s.C)) + '.<br>At <b>' + s.X + ' ' + I.unit + '</b> both cost <b>$' + dT(s.C) + '</b>.',
              ['Both expressions equal ' + t('C') + ', so set them equal to each other.'], 'break-even point');
          } },
          { id: '19bii', sub: 'b ii', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var I = q19Info(s), v = s.v[0];
            return mc(r, 'Which method is most efficient for solving this system, and why?', [
              { html: '<b>Substitution:</b> both equations are already solved for ' + t('C') + ', so set ' + t(I.eqs[0].slice(2) + '=' + I.eqs[1].slice(2)) + ' and solve for ' + t(v) + '.', right: true },
              { html: '<b>Graphing:</b> it always gives the exact answer fastest.', why: 'Reading a crossing point off a graph is an estimate, and with these numbers the crossing is far from the origin. Algebra gives the exact value.' },
              { html: '<b>Elimination:</b> you must first multiply both equations to make the ' + t('C') + '-terms match.', why: 'The ' + t('C') + '-terms already match (both are ' + t('C') + '), so no multiplying is needed — and since both equations are solved for ' + t('C') + ', substitution is quickest.' },
              { html: '<b>Substitution:</b> substitution always works best for word problems.', why: 'Right method, wrong reason: the method depends on the equations, not the story. Substitution is efficient here because both equations are solved for ' + t('C') + '.' }],
              'Both equations are already solved for ' + t('C') + ', so substitution is efficient: set the two expressions equal. (The solution is the number of ' + I.unit + ' where both cost the same.)',
              ['Look at the form of the two equations.'], 'efficient method for cost system');
          } },
          { id: '19c', sub: 'c', outcome: 'RF9', level: 'MAS', make: function (r, s) {
            var I = q19Info(s), v = s.v[0], c0 = r6(s.F[0] + s.R[0] * s.N), c1 = r6(s.F[1] + s.R[1] * s.N), best = c0 < c1 ? 0 : 1;
            var unitWord = s.c === 'gym' ? 'visits' : s.c === 'rental' ? 'km' : 'guests';
            var lead = s.c === 'gym' ? s.who + ' expects ' + s.N + ' visits.' : s.c === 'rental' ? s.who + ' will drive ' + s.N + ' km.' : s.who + ' expects ' + s.N + ' guests.';
            return fieldsPart(lead + ' Which is better for ' + s.who + '? Justify: give both costs.',
              [{ label: s.names[0] + ':', name: s.names[0] + ' cost', before: '$' }, { label: s.names[1] + ':', name: s.names[1] + ' cost', before: '$' }, { label: 'Better choice (' + s.names[0] + ' or ' + s.names[1] + '):', name: 'Better choice', mode: 'text', placeholder: ' ' }],
              [valChk(c0, function () { return { code: 'u8t-cost', hint: 'Substitute ' + t(v + '=' + s.N) + ' into ' + t(I.eqs[0]) + '.' }; }), valChk(c1, function () { return { code: 'u8t-cost', hint: 'Substitute ' + t(v + '=' + s.N) + ' into ' + t(I.eqs[1]) + '.' }; }), pickChk(s.names, best)],
              [dT(c0), dT(c1), s.names[best]], s.names[0] + ' ' + t(money(c0)) + ', ' + s.names[1] + ' ' + t(money(c1)) + ' — <b>' + s.names[best] + '</b>',
              s.names[0] + ': ' + t(I.eqs[0].slice(2).replace(new RegExp(v, 'g'), '(' + s.N + ')') + '=' + money(c0)) + '<br>' + s.names[1] + ': ' + t(I.eqs[1].slice(2).replace(new RegExp(v, 'g'), '(' + s.N + ')') + '=' + money(c1)) + '<br><b>' + s.names[best] + '</b> costs less' + ' (' + s.N + ' ' + unitWord + ' is ' + (s.N < s.X ? 'fewer' : 'more') + ' than the ' + s.X + ' where they cost the same).',
              ['Substitute ' + t(v + '=' + s.N) + ' into both equations and compare.'], 'which plan is better');
          } }] }
    ]
  });
})(window);
