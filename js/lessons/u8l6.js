/* Math 10C · Unit 8 · Lesson 6 — Systems of Linear Equations: Cumulative Review (RF9)
 * Assignment questions 1–18 (u8_L06.tex) and the Lesson 6 Extra Practice (u8_EP06.tex, Parts A–G, questions 1–20).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one of
 * the possible versions) and changes the numbers. Solutions of systems use K.P.point (point keypad with no solution /
 * infinitely many); writing a system uses K.P.system; graphing a system is a graph-pad drawing of two lines followed by
 * a separate point part. "Choose a method and justify" items are multiple choice whose wrong options make a false
 * claim about the actual coefficients. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, Ln = HW.lines, DR = HW.draw, ex = HW.ex, F = HW.fmt, frT = Ln.frT;

  /* ---------- numbers and LaTeX ---------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function rd(x, n) { var f = Math.pow(10, n == null ? 6 : n); return Math.round(x * f) / f + 0; }
  function near(a, b) { return Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(b)); }
  function isInt(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
  function num(x) { x = rd(x); return x < 0 ? '-' + String(-x) : String(x); }                       // a decimal as LaTeX
  function fx(x) { x = rd(x, 9); if (isInt(x)) return String(Math.round(x)); var f = Ln.toFr(x); return frT(f[0], f[1]); }  // exact: integer or fraction
  function fr2(p, q) { return frT(p, q); }
  function money(v) { v = rd(v, 2); return '\\$' + (isInt(v) ? F(Math.round(v)) : F(v.toFixed(2))); }
  function pc(p) { return (p / 100).toFixed(2); }                                                      // 20 -> 0.20
  function pcS(p) { return String(rd(p / 100, 4)); }                                                   // 20 -> 0.2
  function lin(cs, vs) {   // LaTeX of c1·v1 + c2·v2 + …
    var s = '';
    cs.forEach(function (c, i) { c = rd(c); if (!c) return; var a = Math.abs(c); s += (c < 0 ? '-' : s ? '+' : '') + (a === 1 ? '' : num(a)) + vs[i]; });
    return s || '0';
  }
  function eqT(a, b, c, vs) { return lin([a, b], vs || ['x', 'y']) + '=' + num(c); }
  function stack(e1, e2) { return '<div style="margin:4px 0">' + t('\\displaystyle ' + e1) + '</div><div style="margin:4px 0">' + t('\\displaystyle ' + e2) + '</div>'; }
  function both(e1, e2) { return t(e1) + '&ensp;and&ensp;' + t(e2); }
  function L(a, b, c) { return [a, b, -c]; }                // a·x + b·y = c  ->  [A, B, C] with Ax + By + C = 0
  function ptT(p) { return '(' + fx(p[0]) + ',\\ ' + fx(p[1]) + ')'; }
  function ptD(p) { return '(' + num(p[0]) + ',\\ ' + num(p[1]) + ')'; }   // decimals kept as decimals
  function sg(n) { n = rd(n); return n < 0 ? '-' + String(-n) : '+' + String(n); }   // signed term
  function ck(e) { return e + '\\ \\checkmark'; }
  function find(gen, fb) { for (var i = 0; i < 600; i++) { var v = gen(); if (v) return v; } return fb; }
  function nz(r, a, b) { var v; do { v = r.int(a, b); } while (v === 0); return v; }

  HW.addCodes({
    'u8l6-swap': 'Two answers in each other’s boxes',
    'u8l6-eq-boxes': 'Right equations in the wrong boxes',
    'u8l6-gave-x': 'Gave x instead of y',
    'u8l6-early-round': 'Rounded an intermediate value too early',
    'u8l6-sum': 'Gave the sum instead of the asked combination',
    'u8l6-one-value': 'Stopped after finding one value',
    'u8l6-a-sign': 'Sign of a (a = −slope)',
    'u8l6-gave-cost': 'Gave the common value instead of the input (or one cost instead of the difference)',
    'u8l6-rate-sum': 'Added the rates instead of subtracting',
    'u8l6-flat-sum': 'Added the flat charges instead of subtracting',
    'u8l6-rate-flat': 'Flat charge and rate swapped in the equation',
    'u8l6-gr-int-sign': 'Graph: y-intercept sign after rearranging',
    'u8l6-gr-slope-sign': 'Graph: slope sign',
    'u8l6-points-only': 'Graph: points without lines',
    'u8l6-line-missing': 'Graph: a line missing',
    'u8l6-line-wrong': 'Graph: one line wrong',
    'u8l6-line-extra': 'Graph: an extra line',
    'u8l6-mix-percent': 'Mixture: percent used as the amount',
    'u8l6-mix-decimal': 'Percent not written as a decimal',
    'u8l6-mix-total': 'Wrong total in the volume/amount equation',
    'u8l6-rhs-swap': 'Right-hand sides swapped (count vs money)',
    'u8l6-price-swap': 'Prices on the wrong variables',
    'u8l6-perimeter': 'Perimeter: sides not all counted',
    'u8l6-backwards': 'Relationship written backwards',
    'u8l6-cond-sign': 'More than / less than sign',
    'u8l6-isolate': 'Isolating a variable changed the line',
    'u8l6-not-isolated': 'Variable not isolated',
    'u8l6-not-lowest': 'Common multiple, not the lowest',
    'u8l6-mult-swap': 'Multipliers swapped',
    'u8l6-elim-sign': 'Subtracted instead of added (or vice versa)',
    'u8l6-rhs-unscaled': 'Right side not scaled',
    'u8l6-elim-rhs': 'Eliminated equation: right side wrong',
    'u8l6-elim': 'Elimination step wrong',
    'u8l6-elim-scale': 'Didn’t scale before eliminating',
    'u8l6-rate-sign': 'Burn/decrease rate given a positive slope',
    'u8l6-rate-swap': 'Rates matched to the wrong item',
    'u8l6-half': 'Estimate not to the nearest half',
    'u8l6-estimate': 'Graph estimate too far off',
    'u8l6-gave-h': 'Gave the height instead of the time',
    'u8l6-k-x1': 'k for x = 1 given for “no solution”',
    'u8l6-k-solve': 'Didn’t finish solving for k',
    'u8l6-const': 'Constant condition missed (infinitely many)',
    'u8l6-weights-swap': 'Weights swapped',
    'u8l6-weights': 'Final mark not a weighted sum',
    'u8l6-divide': 'Didn’t divide by the coefficient',
    'u8l6-coef-swap': 'Model: mass multiplied the wrong constant',
    'u8l6-sub-swap': 'Model: L and m substituted in the wrong places',
    'u8l6-scale': 'Read squares instead of units on an axis',
    'u8l6-single-frac': 'Not written as a single fraction',
    'u8l6-param': 'Expression in k wrong',
    'u8l6-list': 'List unreadable',
    'u8l6-k-int': 'k not an integer',
    'u8l6-k-none': 'Included the no-solution k',
    'u8l6-k-negx': 'Included a k that gives negative x',
    'u8l6-k-bad': 'Included a k that gives a non-whole x',
    'u8l6-k-missing': 'Some k values missing',
    'u8l6-order': 'List not in order',
    'u8l6-clear-one-side': 'Fractions cleared on one side only',
    'u8l6-distribute': 'Bracket multiplied into the first term only',
    'u8l6-time-speed': 'Used a time where a speed is needed',
    'u8l6-with-against': 'With/against: speeds added or subtracted the wrong way',
    'u8l6-clear-frac': 'Fraction not cleared',
    'u8l6-cross': 'Cross-multiplied the wrong way',
    'u8l6-add-both': 'Forgot the number added to both',
    'u8l6-as-fraction': 'Gave a decimal instead of the fraction',
    'u8l6-equiv-frac': 'Gave an equivalent fraction (not the actual one)',
    'u8l6-frac': 'Wrong fraction',
    'u8l6-swapxy': 'x and y swapped',
    'mc-asn-A': 'Said “always true”',
    'mc-asn-S': 'Said “sometimes true”',
    'mc-asn-N': 'Said “never true”',
    'mc-forms': 'Thought different forms mean different lines'
  });

  /* ---------- part makers ---------- */
  function mc(r, prompt, opts, sol, hints, text, keep) {
    var seen = {}, o2 = opts.filter(function (o) { if (seen[o.html]) return false; seen[o.html] = 1; return true; });
    return K.P.mc(r, prompt, o2, sol, hints, text, keep);
  }
  /* the solution of a system: P = [x, y] | 'none' | 'inf'; sys = [[A, B, C], [A, B, C]] (Ax + By + C = 0) */
  function ptPart(prompt, P, sys, o, sol, hints, text) {
    o = o || {};
    var p = K.P.point(prompt, P, { system: sys, vars: o.vars, wrong: o.wrong }, sol, hints, text);
    if (o.keyTex) { p.key = o.keyTex; p.answer = t(o.keyTex); }
    p.bad = (o.bad || []).slice();
    if (Array.isArray(P) && !near(P[0], P[1])) p.bad.push('(' + num(P[1]) + ',' + num(P[0]) + ')');
    return p;
  }
  /* several plain number boxes. boxes: [{ label, before, after, v, diag, name }]; o.swapHint for two swapped values */
  function numBoxes(prompt, boxes, sol, hints, text, o) {
    o = o || {};
    var vals = boxes.map(function (b) { return b.v; }), names = boxes.map(function (b) { return b.name || String(b.label || '').replace(/:\s*$/, ''); });
    var base = K.fields(boxes.map(function (b) { return b.check || K.number(b.v, b.diag); }), { labels: names });
    var check = function (resp) {
      resp = resp || [];
      if (boxes.length >= 2 && !near(vals[0], vals[1]) && !boxes[0].check && !boxes[1].check) {
        var a = HW.parse.number(String(resp[0] || '')), b = HW.parse.number(String(resp[1] || ''));
        if (a.ok && b.ok && near(a.value, vals[1]) && near(b.value, vals[0])) return wrong(o.swapCode || 'u8l6-swap', o.swapHint || 'Both numbers are right but in the wrong boxes — check which quantity each box asks for.');
      }
      if (o.pre) { var h = o.pre(resp); if (h) return h; }
      return base(resp);
    };
    var keys = boxes.map(function (b) { return b.key != null ? b.key : String(b.v); });
    var bad = (o.bad || []).slice(); if (boxes.length === 2 && !near(vals[0], vals[1])) bad.push([keys[1], keys[0]]);
    return { prompt: prompt, input: { type: 'fields', fields: boxes.map(function (b) { return { label: b.label, before: b.before, after: b.after }; }) }, check: check, key: keys,
      answer: boxes.map(function (b, i) { return (b.label || b.name || '') + ' ' + (b.before ? HW.tex(b.before) : '') + t(b.keyTex || keys[i]) + (b.after ? ' ' + b.after : ''); }).join('<br>'),
      solution: sol, hints: hints || [], text: text, bad: bad };
  }
  /* equation boxes whose order matters. items: [{ label, T (line target), keyTex, form, wrong }] */
  function eqBoxes(prompt, items, o, sol, hints, text) {
    o = o || {}; var vars = o.vars || ['x', 'y'];
    var TL = items.map(function (it) { return Ln.of(it.T); });
    var base = K.fields(items.map(function (it) { return K.line(it.T, { form: it.form || 'any', vars: vars, wrong: it.wrong }); }), { labels: items.map(function (it) { return String(it.label).replace(/:\s*$/, ''); }) });
    var check = function (resp) {
      resp = resp || [];
      if (items.length === 2) {
        var r0 = Ln.read(String(resp[0] || ''), vars), r1 = Ln.read(String(resp[1] || ''), vars);
        if (r0.ok && r1.ok && Ln.same([r0.a, r0.b, r0.c], TL[1]) && Ln.same([r1.a, r1.b, r1.c], TL[0])) return form('u8l6-eq-boxes', 'Both equations are right, but they are in each other’s boxes. Put each equation next to its own label.');
      }
      return base(resp);
    };
    var keys = items.map(function (it) { return it.keyTex; });
    return { prompt: prompt, input: { type: 'fields', fields: items.map(function (it) { return { label: it.label, mode: 'math', keys: 'eq', vars: vars, placeholder: ' ' }; }) }, check: check, key: keys,
      answer: items.map(function (it) { return it.label + ' ' + t(it.keyTex); }).join('<br>'), solution: sol, hints: hints || [], text: text, bad: o.bad || [] };
  }
  /* write a system (either order). o: vars, labels, keyTex, alt: [[lines also accepted for equation 1], [… for 2]],
   * diags: [{ is: 'equation text' | [A, B, C], code, hint }] (a box holding that equation gets the hint), bad */
  function sysPart(prompt, Ts, o, sol, hints, text) {
    o = o || {}; var vars = o.vars || ['x', 'y'];
    var D = (o.diags || []).map(function (d) { var Lx = d.is; if (typeof Lx === 'string') { var rr = Ln.read(Lx, vars); Lx = rr.ok ? [rr.a, rr.b, rr.c] : null; } return Lx ? { L: Lx, code: d.code, hint: d.hint } : null; }).filter(Boolean);
    var TL = Ts.map(function (T) { return Ln.of(T); });
    D = D.filter(function (d) { return !TL.some(function (T) { return Ln.same(T, d.L); }) && !(o.alt || []).some(function (al) { return (al || []).some(function (a) { return Ln.same(a, d.L); }); }); });
    var p = K.P.system(prompt, Ts, { vars: vars, labels: o.labels, keyTex: o.keyTex, form: o.form, diag: function (resp) {
      for (var i = 0; i < 2; i++) { var rr = Ln.read(String(resp[i] || ''), vars); if (!rr.ok) continue; for (var j = 0; j < D.length; j++) if (Ln.same([rr.a, rr.b, rr.c], D[j].L)) return { code: D[j].code, hint: D[j].hint }; }
      return null;
    } }, sol, hints, text);
    var base = p.check;
    p.check = function (resp) {
      resp = resp || [];
      var raw = [0, 1].map(function (i) { return String(resp[i] || ''); });
      if (o.pre) { var h0 = o.pre(raw); if (h0) return h0; }
      var res = base(resp); if (res.v === 'correct' || !o.alt) return res;
      var R = raw.map(function (s) { return Ln.read(s, vars); });
      if (R[0].ok && R[1].ok) {
        var A = R.map(function (q) { return [q.a, q.b, q.c]; });
        var m = function (Lx, i) { return Ln.same(Lx, TL[i]) || (o.alt[i] || []).some(function (a) { return Ln.same(Lx, a); }); };
        if ((m(A[0], 0) && m(A[1], 1)) || (m(A[0], 1) && m(A[1], 0))) return ok();
      }
      return res;
    };
    p.bad = o.bad || [];
    p.good = o.good || [];
    return p;
  }
  /* "Which work verifies the solution?" — P the point, eqs [{ a, b, c }] (a·x + b·y = c), vs letters */
  function subT(a, b, P, vs) {   // "3(4)+2(-2)" style substitution
    var parts = [];
    [[a, P[0]], [b, P[1]]].forEach(function (cv, i) { var c = cv[0], v = cv[1]; if (!c) return; var vt = v < 0 ? '(' + num(v) + ')' : (Math.abs(c) === 1 ? num(v) : '(' + num(v) + ')'); var co = Math.abs(c) === 1 ? '' : num(Math.abs(c)); parts.push((c < 0 ? '-' : parts.length ? '+' : '') + co + vt); });
    return parts.join('');
  }
  function verifyMC(r, prompt, P, eqs, vs, sol, text) {
    vs = vs || ['x', 'y'];
    var line = function (E, Q, val) { return t(subT(E.a, E.b, Q, vs) + '=' + num(val == null ? E.a * Q[0] + E.b * Q[1] : val)); };
    var e0 = eqs[0], e1 = eqs[1], v1 = e1.a * P[0] + e1.b * P[1];
    var slip = v1 + (r.chance(0.5) ? 2 : -2);
    return mc(r, prompt, [
      { html: line(e0, P) + ' ✓ and ' + line(e1, P) + ' ✓, so ' + t(ptD(P)) + ' satisfies <b>both</b> equations.', right: true },
      { html: line(e0, P) + ' ✓. One equation checks, so the point is the solution.', why: 'A point can lie on one line and miss the other. The solution of a system must satisfy <b>both</b> equations — substitute into the second one too.' },
      { html: 'The point is where the two lines cross on the graph, so no algebra is needed.', why: 'Reading a graph is an estimate. To <b>verify algebraically</b>, substitute the point into both original equations.' },
      { html: line(e0, P) + ' ✓ but ' + line(e1, P, slip) + ' ✗, so the point is not the solution.', why: 'Redo the arithmetic in the second equation: ' + t(subT(e1.a, e1.b, P, vs) + '=' + num(v1)) + ', which is exactly ' + t(num(e1.c)) + '.' }],
      sol, ['Substitute both coordinates into <b>each</b> original equation and compare with the right-hand side.'], text);
  }

  /* ---------- lines for the graph pad: A x + B y + C = 0, integers, A > 0 (or A = 0, B > 0) ---------- */
  function line(A, B, C) { var g = gcd(gcd(A, B), C) || 1; A /= g; B /= g; C /= g; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; } return { A: A + 0, B: B + 0, C: C + 0 }; }
  function lat(Lo, xr, yr, sx, sy) {
    sx = sx || 1; sy = sy || 1; var out = [];
    for (var x = Math.ceil(xr[0] / sx) * sx; x <= xr[1] + 1e-9; x += sx) { var y = -(Lo.A * x + Lo.C) / Lo.B; if (isInt(y / sy) && y >= yr[0] - 1e-9 && y <= yr[1] + 1e-9) out.push([rd(x), rd(y)]); }
    return out;
  }
  function far(Lo, win) { var L2 = lat(Lo, win[0], win[1]); return [L2[0], L2[L2.length - 1]]; }
  function lineV(Lo, win) { var e = far(Lo, win); return { pts: [], pieces: [{ v: [e[0], e[1]], s: 'arrow', e: 'arrow' }], join: 'none' }; }
  function linesV(list, win) { var v = { pts: [], pieces: [], join: 'none' }; list.forEach(function (Lo) { v.pieces = v.pieces.concat(lineV(Lo, win).pieces); }); return v; }
  function keyOf(Lo, win) { return Object.keys(DR.geom(lineV(Lo, win)).lines)[0]; }
  function onL(Lo, p) { return Math.abs(Lo.A * p[0] + Lo.B * p[1] + Lo.C) < 1e-9; }
  /* the pad continues a line started at the end of another one; read each straight run of a polyline as its own line */
  function splitBends(value, all) {
    var v = DR.norm(value), out = [];
    v.pieces.forEach(function (pc) {
      if (pc.v.length < 3 || (!all && (pc.s !== 'arrow' || pc.e !== 'arrow'))) { out.push(pc); return; }
      var runs = [[pc.v[0], pc.v[1]]];
      for (var i = 2; i < pc.v.length; i++) {
        var run = runs[runs.length - 1], a = run[run.length - 2], b = run[run.length - 1], c = pc.v[i];
        if (Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) < 1e-9) run.push(c); else runs.push([b, c]);
      }
      runs.forEach(function (rv, j) { out.push({ v: rv, s: j === 0 ? pc.s : pc.s === 'arrow' ? 'arrow' : 'closed', e: j === runs.length - 1 ? pc.e : pc.e === 'arrow' ? 'arrow' : 'closed' }); });
    });
    return { pts: v.pts, pieces: out, join: v.join };
  }
  /* two arrow-ended lines (graphExact) with classic wrong drawings and "still to draw" */
  function graphSys(prompt, Ls, names, win, o, sol, hints, text) {
    o = o || {};
    var key = linesV(Ls, win), keys = Ls.map(function (Lo) { return keyOf(Lo, win); });
    var W = (o.wrong || []).filter(function (w) { return w.Ls.every(function (Lo) { return lat(Lo, win[0], win[1]).length >= 2; }); }).map(function (w) { return { is: linesV(w.Ls, win), code: w.code, hint: w.hint }; }).filter(function (w) { return !DR.same(w.is, key); });
    var base = K.graphExact(key, { wrong: W });
    var check = function (resp) {
      resp = splitBends(resp);
      var res = base(resp); if (res.v !== 'wrong' || res.code !== 'graph') return res;
      var v = DR.norm(resp);
      if (!v.pieces.length && v.pts.length) return wrong('u8l6-points-only', 'Plotting points is a good start — now draw each line through its points with the Line tool (arrows on both ends).');
      var have = Object.keys(DR.geom(resp).lines), miss = [], extra = have.filter(function (k) { return keys.indexOf(k) < 0; });
      keys.forEach(function (k, i) { if (have.indexOf(k) < 0) miss.push(names[i]); });
      if (miss.length && !extra.length) return wrong('u8l6-line-missing', 'Correct so far — still to draw: ' + miss.join(' and ') + '.');
      if (miss.length && extra.length && miss.length < Ls.length) return wrong('u8l6-line-wrong', 'One of your lines is right. Check ' + miss.join(' and ') + ': find its slope and ' + t('y') + '-intercept again.');
      return res;
    };
    var pad = Object.assign({ x: win[0], y: win[1], grid: 1, labels: 2, mode: 'lines', defaultEnd: 'arrow', max: 360 }, o.pad || {});
    var p = K.P.graph(prompt, pad, check, key, sol, hints, text);
    p.bad = W.map(function (w) { return w.is; }).concat([lineV(Ls[0], win)]);
    return p;
  }

  /* ---------- "which method?" options (Q13, EP 2) ---------- */
  var METHOD_HINT = ['Substitution suits a variable that is already isolated or has coefficient ' + t('1') + ' or ' + t('-1') + '. Elimination suits coefficients that already match, are opposites, or scale easily. Graphing gives a picture or an estimate.'];

  /* =================================================================================================== */
  HW.defineLesson({
    id: 'u8l6', unit: 8, num: '6', title: 'Systems of Linear Equations: Cumulative Review', outcome: 'RF9',
    blurb: 'Every method of the unit together — classifying, graphing, substitution, elimination and choosing among them — then mixed problems.',
    questions: [
      /* ---------------- 1 ---------------- */
      { num: '1', section: 'Assignment — Multiple Choice and Numerical Response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '1', level: 'LIM', make: function (r) {
          var a = r.pick([2, 2, 3]), x0, y0;
          do { x0 = r.int(2, 7); y0 = r.int(1, 7); } while (x0 === y0);
          var c1 = a * x0 + y0, c2 = x0 - y0, E1 = eqT(a, 1, c1), E2 = eqT(1, -1, c2);
          var fails = function (p) { var v1 = a * p[0] + p[1], v2 = p[0] - p[1]; return v1 !== c1 ? 'In ' + t(E1) + ': ' + t(subT(a, 1, p) + '=' + v1) + ', not ' + t(c1) + '.' : 'In ' + t(E2) + ': ' + t(subT(1, -1, p) + '=' + v2) + ', not ' + t(c2) + '.'; };
          var opts = [[x0, y0], [y0, x0], [-x0, y0], [x0, -y0]].map(function (p, i) { return { html: t(ptD(p)), right: i === 0, why: i === 0 ? null : fails(p) + (i === 1 ? ' Check the order: the ' + t('x') + '-value comes first.' : ' Substitute each option into <b>both</b> equations.') }; });
          return mc(r, 'Solve the system of equations ' + both(E1, E2) + ' and select the ordered pair ' + t('(x,\\ y)') + ' that satisfies both equations.', opts,
            'The ' + t('y') + '-coefficients are opposites, so add the equations: ' + t('(' + E1.split('=')[0] + ')+(x-y)=' + c1 + (c2 < 0 ? '' : '+') + c2) + ', so ' + t((a + 1) + 'x=' + (c1 + c2)) + ' and ' + t('x=' + x0) + '.<br>Into the first equation: ' + t(subT(a, 0, [x0, 0]) + '+y=' + c1) + ', so ' + t('y=' + y0) + '.<br>Check the second: ' + t(ck(subT(1, -1, [x0, y0]) + '=' + c2)) + '. The solution is ' + t(ptD([x0, y0])) + '.',
            ['Add the two equations: the ' + t('y') + '-terms cancel.'], 'solve ' + E1 + ', ' + E2);
        } }] },
      /* ---------------- 2 ---------------- */
      { num: '2', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '2', level: 'EMG', make: function (r) {
          var m = r.pick([2, 2, 3, 4]), j = r.int(1, 4), k = r.pick([2, 3, 4]), b = -m * j;
          var E1 = eqT(m, -1, m * j), E2 = k + 'y=' + lin([k * m], ['x']) + num(k * b);
          var yi = 'y=' + lin([m], ['x']) + num(b);
          var opts = [
            { html: 'no solution', why: 'Rewrite both in ' + t('y=mx+b') + ': both become ' + t(yi) + '. Same slope <b>and</b> the same ' + t('y') + '-intercept — the lines are not parallel and distinct, they are the same line.' },
            { html: 'one solution, ' + t(ptD([j, 0])), why: t(ptD([j, 0])) + ' does satisfy both equations — but so does ' + t(ptD([0, b])) + ', and every other point on the line. Rewrite both equations in ' + t('y=mx+b') + ' and compare.' },
            { html: 'one solution, ' + t(ptD([0, b])), why: t(ptD([0, b])) + ' does satisfy both equations — but so does ' + t(ptD([j, 0])) + ', and every other point on the line. Rewrite both equations in ' + t('y=mx+b') + ' and compare.' },
            { html: 'infinitely many solutions', right: true }];
          return mc(r, 'The system ' + both(E1, E2) + ' has', opts,
            t(E1 + '\\Rightarrow -y=' + lin([-m], ['x']) + '+' + (m * j) + '\\Rightarrow ' + yi) + '<br>' + t(E2 + '\\Rightarrow ' + yi) + ' (divide every term by ' + t(k) + ')<br>Equal slopes and equal ' + t('y') + '-intercepts: the lines are coincident, so there are <b>infinitely many solutions</b>. (' + t(ptD([j, 0])) + ' and ' + t(ptD([0, b])) + ' are two of them.)',
            ['Write both equations in the form ' + t('y=mx+b') + ' and compare the slopes and the intercepts.'], 'classify ' + E1 + ', ' + E2);
        } }] },
      /* ---------------- 3 ---------------- */
      { num: '3', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '3', level: 'PRG', make: function (r) {
          var s = find(function () {
            var a = r.int(2, 5), c = r.int(4, 12), d = r.int(2, 5), e = r.int(2, 6), f = nz(r, -3, 5), D = a * e + d, x = (c * e + f) / D, y = c - a * x;
            if (isInt(y) || y <= 0 || y >= 10 || isInt(x)) return null;
            var f100 = Math.abs(y * 100 % 1 - 0.5); if (f100 < 0.06) return null;
            if (Math.abs(K.roundTo(x, 2) - K.roundTo(y, 2)) < 0.02) return null;
            return { a: a, c: c, d: d, e: e, f: f, D: D, x: x, y: y };
          }, { a: 3, c: 8, d: 2, e: 5, f: 1, D: 17, x: 41 / 17, y: 13 / 17 });
          if (r.chance(0.25)) s = { a: 3, c: 8, d: 2, e: 5, f: 1, D: 17, x: 41 / 17, y: 13 / 17 };
          var E1 = eqT(s.a, 1, s.c), E2 = eqT(s.d, -s.e, s.f), want = K.roundTo(s.y, 2), xr = K.roundTo(s.x, 2), early = K.roundTo(s.c - s.a * xr, 2);
          var xn = s.c * s.e + s.f, yn = s.c * s.D - s.a * xn;
          var p = K.P.approx('Solve the system ' + both(E1, E2) + ' by substitution or elimination. The ' + t('y') + '-coordinate of the point of intersection, to the nearest hundredth, is ________.', s.y, 2, { nr: true, diag: function (v) {
            if (Math.abs(v - xr) < 1e-9) return { code: 'u8l6-gave-x', hint: 'That’s the ' + t('x') + '-coordinate. The question asks for ' + t('y') + '.' };
            if (Math.abs(v - early) < 1e-9 && early !== want) return { code: 'u8l6-early-round', hint: 'Close — but you rounded ' + t('x') + ' before substituting. Keep ' + t('x') + ' as an exact fraction and round only at the end.' };
            return null;
          } }, '<b>Substitution:</b> ' + t(E1 + '\\Rightarrow y=' + s.c + '-' + s.a + 'x') + '.<br>' + t(lin([s.d], ['x']) + '-' + s.e + '(' + s.c + '-' + s.a + 'x)=' + s.f) + '<br>' + t(s.d + 'x-' + (s.e * s.c) + '+' + (s.e * s.a) + 'x=' + s.f + '\\Rightarrow ' + s.D + 'x=' + xn + '\\Rightarrow x=' + fr2(xn, s.D)) + '<br>' + t('y=' + s.c + '-' + s.a + '\\left(' + fr2(xn, s.D) + '\\right)=' + fr2(yn, s.D) + '\\approx ' + rd(s.y, 4)) + '<br>Rounded to the nearest hundredth: <b>' + want.toFixed(2) + '</b>.',
          ['The first equation has ' + t('y') + ' with coefficient ' + t('1') + ': solve it for ' + t('y') + ' and substitute.', 'Keep fractions exact until the last step, then round.'], 'NR y of ' + E1 + ', ' + E2);
          return p;
        } }] },
      /* ---------------- 4 ---------------- */
      { num: '4', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '4', level: 'PRG', make: function (r) {
          var m = r.pick([2, 3, 3, 4, 5]), k = r.int(1, 5), sg = r.pick([-1, -1, 1]), n = sg * m * k;   // y = m x + n  <=>  x = y/m - n/m
          var E1 = 'y=' + lin([m], ['x']) + (n < 0 ? num(n) : '+' + n), c = -n / m;
          var bc = function (b, cc) { return t('b=' + b + '\\text{ and }c=' + cc); };
          var opts = [
            { html: bc('\\tfrac{1}{' + m + '}', num(c)), right: true },
            { html: bc('\\tfrac{1}{' + m + '}', num(-c)), why: 'Solve ' + t(E1) + ' for ' + t('x') + ' carefully: ' + t(m + 'x=y' + (n < 0 ? '+' + (-n) : '-' + n)) + ', so ' + t('x=\\tfrac{1}{' + m + '}y' + (c < 0 ? num(c) : '+' + c)) + '. Watch the sign of ' + t('c') + '.' },
            { html: bc(String(m), num(-n)), why: 'Those numbers come from ' + t(E1) + ' itself. The second equation is solved for ' + t('x') + ', so solve ' + t(E1) + ' for ' + t('x') + ' and match the coefficients.' },
            { html: bc('0', '0'), why: 'With ' + t('b=0') + ' the second equation is ' + t('x=0') + ', a vertical line — it crosses ' + t(E1) + ' at just one point.' }];
          return mc(r, 'The system ' + both(E1, 'x=by+c') + ' has infinitely many solutions if', opts,
            'Infinitely many solutions means the two equations describe the <b>same line</b>, so solve ' + t(E1) + ' for ' + t('x') + ':<br>' + t(m + 'x=y' + (n < 0 ? '+' + (-n) : '-' + n) + '\\Rightarrow x=\\tfrac{1}{' + m + '}y' + (c < 0 ? num(c) : '+' + c)) + '<br>Matching ' + t('x=by+c') + ': ' + t('b=\\tfrac{1}{' + m + '}') + ' and ' + t('c=' + num(c)) + '.',
            ['The two equations must be the same line. Rearrange ' + t(E1) + ' into the form ' + t('x=\\ldots') + '.'], 'inf many: ' + E1 + ', x=by+c');
        } }] },
      /* ---------------- 5 ---------------- */
      { num: '5', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '5', level: 'EMG', make: function (r) {
          var V = r.pick([['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd'], ['m', 'b', 'n', 'k'], ['p', 'q', 'r', 's']]), a = V[0], b = V[1], c = V[2], d = V[3];
          var kind = r.pick(['one', 'one', 'none', 'inf']);
          var lines = t('y=' + a + 'x+' + b) + ' and ' + t('y=' + c + 'x+' + d);
          var slopes = 'The slopes are ' + t(a) + ' and ' + t(c) + '; the ' + t('y') + '-intercepts are ' + t(b) + ' and ' + t(d) + '.';
          var opts, ask, sol;
          if (kind === 'one') {
            ask = 'intersect at exactly one point. Which statement must be true?';
            opts = [{ html: t(a + '=' + c), why: 'Equal slopes make the lines parallel (or the same line) — they would not meet at exactly one point.' }, { html: t(a + '\\neq ' + c), right: true },
              { html: t(b + '=' + d), why: 'Equal ' + t('y') + '-intercepts are allowed but not required: two lines can cross anywhere, not only on the ' + t('y') + '-axis.' }, { html: t(b + '\\neq ' + d), why: 'The intercepts don’t decide this — lines with different slopes cross once whether or not their intercepts match.' }];
            sol = slopes + ' Two lines meet at exactly one point precisely when their slopes differ, so ' + t(a + '\\neq ' + c) + ' must be true. The intercepts may or may not be equal.';
          } else if (kind === 'none') {
            ask = 'never intersect. Which statement must be true?';
            opts = [{ html: t(a + '=' + c) + ' and ' + t(b + '\\neq ' + d), right: true }, { html: t(a + '\\neq ' + c), why: 'Different slopes means the lines cross somewhere.' },
              { html: t(a + '=' + c) + ' and ' + t(b + '=' + d), why: 'Equal slopes and equal intercepts give the <b>same line</b> — every point is shared.' }, { html: t(b + '\\neq ' + d) + ' only', why: 'Different intercepts alone aren’t enough: if the slopes differ, the lines still cross.' }];
            sol = slopes + ' Lines that never meet are parallel and distinct: equal slopes, different intercepts. So ' + t(a + '=' + c) + ' and ' + t(b + '\\neq ' + d) + '.';
          } else {
            ask = 'are the same line. Which statement must be true?';
            opts = [{ html: t(a + '=' + c) + ' and ' + t(b + '=' + d), right: true }, { html: t(a + '=' + c) + ' and ' + t(b + '\\neq ' + d), why: 'Equal slopes with different intercepts give parallel lines that never meet.' },
              { html: t(a + '\\neq ' + c) + ' and ' + t(b + '=' + d), why: 'Different slopes: these lines meet only at their shared ' + t('y') + '-intercept.' }, { html: t(b + '=' + d) + ' only', why: 'A shared intercept alone gives one shared point. The slopes must match too.' }];
            sol = slopes + ' The same line needs the same slope and the same ' + t('y') + '-intercept: ' + t(a + '=' + c) + ' and ' + t(b + '=' + d) + '.';
          }
          return mc(r, 'The graphs of ' + lines + ' ' + ask, opts, sol, ['In ' + t('y=mx+b') + ', the coefficient of ' + t('x') + ' is the slope. What decides whether two lines cross?'], 'slopes/intercepts: ' + kind);
        } }] },
      /* ---------------- 6 ---------------- */
      { num: '6', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '6', level: 'EMG', make: function (r) {
          var p, k; do { p = r.pick([2, 3, 3, 4, 5]); k = r.pick([2, 3]); } while (k === p);
          var q = k * p, rr = r.int(2, 6), R = rr * q;
          var eqn = '\\dfrac{x}{' + p + '}-\\dfrac{y}{' + q + '}=' + rr;
          var o = function (d, c) { return t('x=\\dfrac{1}{' + d + '}(y+' + c + ')'); };
          var opts = [{ html: o(k, R), right: true },
            { html: o(k, rr), why: 'Multiply <b>every</b> term by the LCD ' + t(q) + ' — the right side too: ' + t(rr + '\\times ' + q + '=' + R) + '.' },
            { html: o(p, R), why: 'After multiplying by ' + t(q) + ', the ' + t('x') + '-term is ' + t(k + 'x') + ' (because ' + t(q + '\\div ' + p + '=' + k) + '), so divide by ' + t(k) + ', not ' + t(p) + '.' },
            { html: o(q, R), why: 'Multiplying by ' + t(q) + ' turns ' + t('\\frac{x}{' + p + '}') + ' into ' + t(k + 'x') + ', not ' + t('x') + '. Divide by ' + t(k) + '.' }];
          return mc(r, 'When solving a system of equations, one of which is ' + t(eqn) + ', a substitution which can be made is', opts,
            'Multiply every term by the LCD, ' + t(q) + ':<br>' + t(k + 'x-y=' + R + '\\Rightarrow ' + k + 'x=y+' + R) + '<br>' + t('x=\\dfrac{y+' + R + '}{' + k + '}=\\dfrac{1}{' + k + '}(y+' + R + ')'),
            ['Clear the fractions first: multiply every term (both sides) by the lowest common denominator. Then solve for ' + t('x') + '.'], 'substitution from x/' + p + ' - y/' + q + ' = ' + rr);
        } }] },
      /* ---------------- 7 ---------------- */
      { num: '7', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var s = find(function () {
            var p = r.int(2, 6), q = r.int(2, 4), sv = r.int(2, 4), c1 = r.int(10, 24), c2 = nz(r, -6, 6);
            if (q === sv || gcd(q, sv) !== 1) return null;
            var A = p * sv + q, R = sv * c1 + q * c2; if (R === 0 || R === sv * c1 || p * sv - q === A) return null;
            return { p: p, q: q, s: sv, c1: c1, c2: c2, A: A, R: R };
          }, { p: 5, q: 2, s: 3, c1: 16, c2: -2, A: 17, R: 44 });
          if (r.chance(0.2)) s = { p: 5, q: 2, s: 3, c1: 16, c2: -2, A: 17, R: 44 };
          var V = ['a', 'b'], E1 = eqT(s.p, s.q, s.c1, V), E2 = eqT(1, -s.s, s.c2, V);
          var opts = [{ html: t(s.A + 'a=' + s.R), right: true },
            { html: t(s.A + 'a=' + (s.s * s.c1)), why: 'Scale <b>every</b> term of the second equation, including its right side: ' + t(s.q + '\\times(' + s.c2 + ')=' + (s.q * s.c2)) + '.' },
            { html: t((s.p * s.s - s.q) + 'a=' + s.R), why: 'After scaling, the ' + t('b') + '-terms are ' + t('+' + (s.q * s.s) + 'b') + ' and ' + t('-' + (s.q * s.s) + 'b') + ' — opposites, so <b>add</b> the equations. Adding gives ' + t((s.p * s.s) + 'a+' + s.q + 'a') + '.' },
            { html: t('-' + s.A + 'a=' + s.R), why: 'Check the sign: ' + t((s.p * s.s) + 'a+' + s.q + 'a=' + s.A + 'a') + ', which is positive.' }];
          return mc(r, 'In solving the system ' + both(E1, E2) + ' by elimination, an equation which arises could be', opts,
            'Eliminate ' + t('b') + ': multiply every term of the first equation by ' + t(s.s) + ' and every term of the second by ' + t(s.q) + ', making the ' + t('b') + '-terms ' + t('+' + (s.q * s.s) + 'b') + ' and ' + t('-' + (s.q * s.s) + 'b') + ':<br>' + t(eqT(s.p * s.s, s.q * s.s, s.s * s.c1, V)) + '<br>' + t(eqT(s.q, -s.q * s.s, s.q * s.c2, V)) + '<br>Add: ' + t(s.A + 'a=' + s.R) + '.',
            ['Make the ' + t('b') + '-coefficients opposites: what do you multiply each equation by?', 'Multiply both sides of each equation.'], 'elimination step ' + E1 + ', ' + E2);
        } }] },
      /* ---------------- 8 ---------------- */
      { num: '8', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'BEG', make: function (r) {
          var x0 = r.int(8, 16), y0 = r.int(2, x0 - 2), S = x0 + y0, D = x0 - y0;
          var ab = r.pick([[2, 1], [2, 1], [1, 2], [3, 1], [1, 3]]), al = ab[0], be = ab[1], ans = al * x0 + be * y0;
          var ex0 = lin([al, be], ['x', 'y']);
          var cands = [{ v: 2 * x0, why: 'That’s ' + t('2x') + ' (what you get by adding the equations). Find ' + t('x') + ' and ' + t('y') + ', then evaluate ' + t(ex0) + '.' },
            { v: al * y0 + be * x0, why: 'It looks like ' + t('x') + ' and ' + t('y') + ' were swapped. Add the equations to find ' + t('x') + ' first.' },
            { v: 2 * S, why: 'That doubles ' + t('x+y') + '. Solve for ' + t('x') + ' and ' + t('y') + ' first, then substitute into ' + t(ex0) + '.' },
            { v: 2 * y0, why: 'That’s ' + t('2y') + ' (what you get by subtracting the equations). Find both values, then evaluate ' + t(ex0) + '.' },
            { v: S + D + y0 + 1, why: 'Check your arithmetic: find ' + t('x') + ' and ' + t('y') + ', then substitute into ' + t(ex0) + '.' }];
          var used = {}; used[ans] = 1; var pick = [];
          cands.forEach(function (c) { if (pick.length < 3 && !used[c.v] && c.v > 0) { used[c.v] = 1; pick.push(c); } });
          var opts = [{ html: t(ans), right: true }].concat(pick.map(function (c) { return { html: t(c.v), why: c.why }; }));
          return mc(r, 'If ' + t('x+y=' + S) + ' and ' + t('x-y=' + D) + ', then ' + t(ex0) + ' is equal to', opts,
            'Add the equations: ' + t('2x=' + (S + D) + '\\Rightarrow x=' + x0) + '. Then ' + t(x0 + '+y=' + S + '\\Rightarrow y=' + y0) + '.<br>Check: ' + t(ck(x0 + '-' + y0 + '=' + D)) + '<br>' + t(ex0 + '=' + subT(al, be, [x0, y0]) + '=' + ans) + '.',
            ['Add the two equations to find ' + t('x') + ', then substitute to find ' + t('y') + '.'], 'x+y=' + S + ', x-y=' + D + ', ' + ex0);
        } }] },
      /* ---------------- 9 ---------------- */
      { num: '9', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var s = find(function () {
            var x0 = r.int(2, 7), y0 = nz(r, -3, 5), a = r.int(2, 4), h = r.int(1, 3), k = r.int(1, 4), b = r.int(2, 5);
            var c1 = a * (x0 - h) - y0, c2 = x0 + k + b * y0, drop = (c1 + a * h) / a;
            if (c1 <= 0 || c2 <= 0 || near(drop, x0) || near(drop, y0) || near(drop, -x0) || y0 === x0 || y0 === -x0 || isInt(drop)) return null;
            return { x0: x0, y0: y0, a: a, h: h, k: k, b: b, c1: c1, c2: c2, drop: drop };
          }, { x0: 5, y0: 2, a: 3, h: 1, k: 2, b: 4, c1: 10, c2: 15, drop: 13 / 3 });
          var E1 = s.a + '(x-' + s.h + ')-y=' + s.c1, E2 = '(x+' + s.k + ')+' + s.b + 'y=' + s.c2, A1 = s.c1 + s.a * s.h, A2 = s.c2 - s.k;
          var opts = [{ html: t(s.x0), right: true }, { html: t(s.y0), why: 'That’s the value of ' + t('y') + '. The question asks for ' + t('x') + '.' },
            { html: t(-s.x0), why: 'Check the sign when you solve for ' + t('x') + '.' },
            { html: t(fx(s.drop)), why: 'That comes from ' + t(s.a + 'x-y=' + A1) + ' with ' + t('y') + ' left out. You need both equations: substitute ' + t('y=' + s.a + 'x-' + A1) + ' into the second one.' }];
          return mc(r, 'If ' + t(E1) + ' and ' + t(E2) + ', then ' + t('x') + ' is equal to', opts,
            'Expand both equations first:<br>' + t(s.a + 'x-' + (s.a * s.h) + '-y=' + s.c1 + '\\Rightarrow ' + s.a + 'x-y=' + A1 + '\\Rightarrow y=' + s.a + 'x-' + A1) + '<br>' + t('x+' + s.k + '+' + s.b + 'y=' + s.c2 + '\\Rightarrow x+' + s.b + 'y=' + A2) + '<br>Substitute: ' + t('x+' + s.b + '(' + s.a + 'x-' + A1 + ')=' + A2 + '\\Rightarrow ' + (1 + s.a * s.b) + 'x=' + (A2 + s.b * A1) + '\\Rightarrow x=' + s.x0) + '.<br>Then ' + t('y=' + s.a + '(' + s.x0 + ')-' + A1 + '=' + s.y0) + '.',
            ['Expand the brackets and collect like terms in each equation before choosing a method.'], 'brackets system, x');
        } }] },
      /* ---------------- 10 ---------------- */
      { num: '10', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '10', level: 'PRG', make: function (r) {
          var s = find(function () {
            var m0 = r.int(3, 9), n0 = nz(r, -5, 4), p = r.int(2, 5), q = r.int(2, 4), sv = r.pick([1, 2, 3, 5]);
            if (p * q === sv) return null;
            var c1 = m0 - p * n0, c2 = q * m0 - sv * n0; if (c1 <= 0 || c2 <= 0 || m0 - n0 <= 0 || m0 + n0 === m0 - n0) return null;
            return { m0: m0, n0: n0, p: p, q: q, s: sv, c1: c1, c2: c2 };
          }, { m0: 7, n0: -2, p: 4, q: 3, s: 2, c1: 15, c2: 25 });
          if (r.chance(0.2)) s = { m0: 7, n0: -2, p: 4, q: 3, s: 2, c1: 15, c2: 25 };
          var V = ['m', 'n'], E1 = lin([1, -s.p], V) + '-' + s.c1, E2 = lin([s.q, -s.s], V) + '-' + s.c2, ans = s.m0 - s.n0;
          return K.P.nr('If ' + t(E1 + '=' + E2 + '=0') + ', then the value of ' + t('m-n') + ' is ________.', ans, function (v) {
            if (v === s.m0 + s.n0) return { code: 'u8l6-sum', hint: 'That’s ' + t('m+n') + '. The question asks for ' + t('m-n') + ' — careful with the sign of ' + t('n') + '.' };
            if (v === s.m0) return { code: 'u8l6-one-value', hint: 'That’s ' + t('m') + '. Now find ' + t('n') + ' and work out ' + t('m-n') + '.' };
            if (v === s.n0 - s.m0 || v === -ans) return { code: 'sign', hint: 'Check the order: ' + t('m-n') + ', not ' + t('n-m') + '.' };
            return null;
          }, 'The chain says both expressions equal ' + t('0') + ': ' + t(lin([1, -s.p], V) + '=' + s.c1) + ' and ' + t(lin([s.q, -s.s], V) + '=' + s.c2) + '.<br>' + t('m=' + s.c1 + '+' + s.p + 'n') + '<br>' + t(s.q + '(' + s.c1 + '+' + s.p + 'n)-' + (s.s === 1 ? '' : s.s) + 'n=' + s.c2 + '\\Rightarrow ' + (s.q * s.p - s.s) + 'n=' + (s.c2 - s.q * s.c1) + '\\Rightarrow n=' + s.n0) + '<br>' + t('m=' + s.c1 + '+' + s.p + '(' + s.n0 + ')=' + s.m0) + '<br>' + t('m-n=' + s.m0 + '-(' + s.n0 + ')=' + ans),
          ['The statement means two equations: each expression equals ' + t('0') + '. Move the constants to the right side.', 'The first equation has ' + t('m') + ' with coefficient ' + t('1') + ' — solve it for ' + t('m') + '.'], 'NR m-n from chain');
        } }] },
      /* ---------------- 11 ---------------- */
      { num: '11', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '11', level: 'ADV', make: function (r) {
          var s = find(function () {
            var x1 = r.int(-2, 3), run = r.int(2, 5), y1 = r.int(-4, 6), rise = r.int(-9, 9);
            if (rise === 0 || rise % run === 0) return null;
            var x2 = x1 + run, y2 = y1 + rise, a = -rise / run, b = y1 + a * x1, ab = a * b;
            if (!(ab > 1 && ab < 99.9) || isInt(rd(ab * 10, 6)) && isInt(ab) || Math.abs(ab * 10 % 1 - 0.5) < 0.06) return null;
            return { x1: x1, y1: y1, x2: x2, y2: y2, a: a, b: b, ab: ab, rise: rise, run: run };
          }, { x1: 1, y1: 3, x2: 4, y2: -4, a: 7 / 3, b: 16 / 3, ab: 112 / 9, rise: -7, run: 3 });
          if (r.chance(0.2)) s = { x1: 1, y1: 3, x2: 4, y2: -4, a: 7 / 3, b: 16 / 3, ab: 112 / 9, rise: -7, run: 3 };
          var aF = fx(s.a), bF = fx(s.b), want = K.roundTo(s.ab, 1), aw = -s.a, bw = s.y1 + aw * s.x1;
          return K.P.approx('The line ' + t('ax+y=b') + ' passes through the points ' + t(ptT([s.x1, s.y1])) + ' and ' + t(ptT([s.x2, s.y2])) + '. The value of ' + t('ab') + ', to the nearest tenth, is ________.', s.ab, 1, { nr: true, diag: function (v) {
            if (Math.abs(v - K.roundTo(aw * bw, 1)) < 1e-9) return { code: 'u8l6-a-sign', hint: 'Rewrite ' + t('ax+y=b') + ' as ' + t('y=-ax+b') + ': the slope is ' + t('-a') + ', so ' + t('a') + ' is the <b>opposite</b> of the slope.' };
            if (Math.abs(v - K.roundTo(s.a + s.b, 1)) < 1e-9) return { code: 'u8l6-sum', hint: 'That’s ' + t('a+b') + '. Multiply: ' + t('ab') + '.' };
            if (Math.abs(v - K.roundTo(s.a, 1)) < 1e-9 || Math.abs(v - K.roundTo(s.b, 1)) < 1e-9) return { code: 'u8l6-one-value', hint: 'You have one of the two constants. Find both ' + t('a') + ' and ' + t('b') + ', then multiply.' };
            return null;
          } }, 'Rewrite ' + t('ax+y=b') + ' as ' + t('y=-ax+b') + ': the slope is ' + t('-a') + ' and the ' + t('y') + '-intercept is ' + t('b') + '.<br>Slope through the points: ' + t('\\frac{' + s.y2 + '-(' + s.y1 + ')}{' + s.x2 + '-(' + s.x1 + ')}=' + fx(s.rise / s.run)) + ', so ' + t('a=' + aF) + '.<br>Using ' + t(ptT([s.x1, s.y1])) + ' in ' + t('ax+y=b') + ': ' + t('b=' + aF + '(' + s.x1 + ')' + sg(s.y1) + '=' + bF) + '.<br>Check with ' + t(ptT([s.x2, s.y2])) + ': ' + t(ck(aF + '(' + s.x2 + ')' + sg(s.y2) + '=' + bF)) + '.<br>' + t('ab=' + aF + '\\times ' + bF + '=' + fx(s.ab) + '\\approx ' + rd(s.ab, 3)) + ', so the answer is <b>' + want.toFixed(1) + '</b>.',
          ['Substitute each point for ' + t('x') + ' and ' + t('y') + ' in ' + t('ax+y=b') + ': that gives a system in ' + t('a') + ' and ' + t('b') + '.', 'Or: ' + t('y=-ax+b') + ', so ' + t('-a') + ' is the slope and ' + t('b') + ' the ' + t('y') + '-intercept.'], 'NR ab for ax+y=b');
        } }] },
      /* ---------------- 12 ---------------- */
      { num: '12', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'EMG', make: function (r) {
          var s1 = r.pick([4, 5, 5, 6, 8]), s2 = s1 * r.pick([2, 3]), t1 = r.int(1, 4), t2 = r.int(1, 4);
          if (r.chance(0.25)) { s1 = 5; s2 = 15; t1 = 3; t2 = 3; }
          var x0 = s1 * t1, y0 = s2 * t2, D = x0 + y0, T = t1 + t2;
          var ctx = r.pick([
            'A rowing club rowed ' + t(D) + ' km to a campsite. Part of the route crossed a lake into a headwind, where their speed was ' + t(s1) + ' km/h; the rest was down a river with the current, where their speed was ' + t(s2) + ' km/h. The whole trip took ' + t(T) + ' hours. If ' + t('x') + ' km were rowed into the headwind and ' + t('y') + ' km with the current,',
            'A cyclist rode ' + t(D) + ' km. Part of the ride was uphill at ' + t(s1) + ' km/h and the rest was on flat road at ' + t(s2) + ' km/h. The whole ride took ' + t(T) + ' hours. If ' + t('x') + ' km were uphill and ' + t('y') + ' km on the flat,']);
          var sys = function (e1, e2) { return t(e1) + ',&ensp;' + t(e2); };
          var opts = [{ html: sys('x+y=' + D, s1 + 'x+' + s2 + 'y=' + T), why: t(s1 + 'x') + ' is speed × distance, which isn’t a time. Each leg’s time is ' + t('t=\\frac{d}{s}') + '.' },
            { html: sys('x+y=' + D, '\\tfrac{x}{' + s1 + '}+\\tfrac{y}{' + s2 + '}=' + T), right: true },
            { html: sys('x+y=' + T, s1 + 'x+' + s2 + 'y=' + D), why: t('x') + ' and ' + t('y') + ' are <b>distances</b>, so they add to the total distance, ' + t(D) + ' km — not the total time.' },
            { html: sys('x+y=' + T, '\\tfrac{x}{' + s1 + '}+\\tfrac{y}{' + s2 + '}=' + D), why: t('x') + ' and ' + t('y') + ' are distances: ' + t('x+y=' + D) + '. The times ' + t('\\frac{x}{' + s1 + '}') + ' and ' + t('\\frac{y}{' + s2 + '}') + ' add to ' + t(T) + ' hours.' }];
          return mc(r, ctx + ' which system could be used to determine ' + t('x') + ' and ' + t('y') + '?', opts,
            t('x') + ' and ' + t('y') + ' are distances, so ' + t('x+y=' + D) + '.<br>Each leg’s time is distance ÷ speed: ' + t('\\frac{x}{' + s1 + '}') + ' and ' + t('\\frac{y}{' + s2 + '}') + ' hours, adding to the total time: ' + t('\\frac{x}{' + s1 + '}+\\frac{y}{' + s2 + '}=' + T) + '. (Solving gives ' + t('x=' + x0) + ', ' + t('y=' + y0) + '.)',
            ['What do ' + t('x') + ' and ' + t('y') + ' measure? What do they add up to?', 'time = distance ÷ speed.'], 'motion system MC');
        } }] },
      /* ---------------- 13 ---------------- */
      { num: '13', section: 'Assignment — Written Response', stem: 'For each system, choose a method (graphing, substitution or elimination) and <b>justify</b> your choice. Then solve the system.', parts: [
        { id: '13a', sub: 'a i', level: 'EMG', make: function (r) { var s = q13a(r); return method13a(r, s); } },
        { id: '13a2', sub: 'a ii', level: 'BEG', make: function (r) { var s = q13a(r);
          return ptPart('(a) ' + both(s.E1, s.E2) + '<br>Solve the system.', [s.m0, s.n0], [L(s.a1, -1, s.c1), L(s.a2, 1, s.c2)], { vars: ['m', 'n'], keyTex: 'm=' + s.m0 + ',\\ n=' + s.n0 },
            '<b>Elimination:</b> the ' + t('n') + '-coefficients are opposites, so add: ' + t('(' + s.E1.split('=')[0] + ')+(' + s.E2.split('=')[0] + ')=' + s.c1 + '+' + s.c2) + '<br>' + t((s.a1 + s.a2) + 'm=' + (s.c1 + s.c2) + '\\Rightarrow m=' + s.m0) + ', and ' + t('n=' + s.c2 + '-' + s.a2 + '(' + s.m0 + ')=' + s.n0) + '.<br>Check: ' + t(ck(subT(s.a1, -1, [s.m0, s.n0]) + '=' + s.c1)) + ', ' + t(ck(subT(s.a2, 1, [s.m0, s.n0]) + '=' + s.c2)) + '.',
            ['Add the equations: the ' + t('n') + '-terms cancel.'], '13a solve');
        } },
        { id: '13b', sub: 'b i', level: 'EMG', make: function (r) { var s = q13b(r); return method13b(r, s); } },
        { id: '13b2', sub: 'b ii', level: 'EMG', make: function (r) { var s = q13b(r);
          return ptPart('(b) ' + both(s.E1, s.E2) + '<br>Solve the system.', [s.x0, s.y0], [L(-s.m, 1, s.b), L(s.p, s.q, s.rr)], {},
            '<b>Substitution</b> (' + t('y') + ' is isolated): ' + t(s.p + 'x+' + s.q + '(' + lin([s.m], ['x']) + num(s.b) + ')=' + s.rr) + '<br>' + t((s.p + s.q * s.m) + 'x' + num(s.q * s.b) + '=' + s.rr + '\\Rightarrow x=' + s.x0) + '<br>' + t('y=' + s.m + '(' + s.x0 + ')' + num(s.b) + '=' + s.y0) + '<br>Check: ' + t(ck(subT(s.p, s.q, [s.x0, s.y0]) + '=' + s.rr)) + '. Solution ' + t(ptT([s.x0, s.y0])) + '.',
            ['Replace ' + t('y') + ' in the second equation by ' + t(lin([s.m], ['x']) + num(s.b)) + '.'], '13b solve');
        } },
        { id: '13c', sub: 'c i', level: 'EMG', make: function (r) { var s = q13c(r); return method13c(r, s); } },
        { id: '13c2', sub: 'c ii', level: 'EMG', make: function (r) { var s = q13c(r);
          return ptPart('(c) ' + both(s.E1, s.E2) + '<br>Solve the system.', [s.x0, s.y0], [L(-s.m1, 1, s.b1), L(-s.m2, 1, s.b2)], { keyTex: ptD([s.x0, s.y0]) },
            '<b>Set the expressions equal</b> (both are solved for ' + t('y') + '):<br>' + t(num(s.m1) + 'x+' + num(s.b1) + '=' + num(s.m2) + 'x+' + num(s.b2)) + '<br>' + t(num(rd(s.m1 - s.m2)) + 'x=' + num(rd(s.b2 - s.b1)) + '\\Rightarrow x=' + s.x0) + '<br>' + t('y=' + num(s.m1) + '(' + s.x0 + ')+' + num(s.b1) + '=' + num(s.y0)) + '<br>Solution ' + t(ptD([s.x0, s.y0])) + '.',
            ['Both equations say what ' + t('y') + ' equals, so set the right sides equal and solve for ' + t('x') + '.', 'Decimals are fine in the answer, e.g. ' + t('(4,\\ 2.6)') + '.'], '13c solve');
        } }] },
      /* ---------------- 14 ---------------- */
      { num: '14', stem: function (sh) { return 'Two parking garages charge as follows: Garage A charges ' + t(money(sh.fA)) + ' flat plus ' + t(money(sh.rA)) + ' per hour. Garage B charges ' + t(money(sh.fB)) + ' flat plus ' + t(money(sh.rB)) + ' per hour.'; },
        shared: function (r) {
          var s = find(function () {
            var rA = r.pick([1, 1.25, 1.5, 1.5, 1.75, 2]), d = r.pick([0.5, 1, 1, 1.5]), h = r.int(3, 8), fB = r.int(2, 6), fA = fB + d * h;
            if (fA > 16 || !isInt(fA * 2)) return null;
            var T = h + r.pick([-2, -1, 1, 1, 2, 3]); if (T < 1) return null;
            return { rA: rA, rB: rA + d, d: d, h: h, fA: fA, fB: fB, T: T };
          }, { rA: 1.5, rB: 2.5, d: 1, h: 5, fA: 8, fB: 3, T: 6 });
          if (r.chance(0.2)) s = { rA: 1.5, rB: 2.5, d: 1, h: 5, fA: 8, fB: 3, T: 6 };
          s.C = s.fA + s.rA * s.h; s.cA = s.fA + s.rA * s.T; s.cB = s.fB + s.rB * s.T; return s;
        },
        parts: [
          { id: '14a', sub: 'a', level: 'EMG', make: function (r, s) {
            var A = { A: s.rA * 4, B: -4, C: s.fA * 4 }, B = { A: s.rB * 4, B: -4, C: s.fB * 4 };
            var kA = 'y=' + num(s.fA) + '+' + num(s.rA) + 'x', kB = 'y=' + num(s.fB) + '+' + num(s.rB) + 'x';
            var swapW = function (f, rate) { return [{ is: { A: f * 4, B: -4, C: rate * 4 }, code: 'u8l6-rate-flat', hint: 'The flat charge is the starting cost — the ' + t('y') + '-intercept. The hourly charge is the slope, the number multiplied by ' + t('x') + '.' }]; };
            return eqBoxes('(a) Write a linear cost equation for each garage, using ' + t('y') + ' for total cost (dollars) and ' + t('x') + ' for hours parked.', [{ label: 'Garage A:', T: A, keyTex: kA, wrong: swapW(s.fA, s.rA) }, { label: 'Garage B:', T: B, keyTex: kB, wrong: swapW(s.fB, s.rB) }], { bad: [['y=' + num(s.rA) + '+' + num(s.fA) + 'x', kB]] },
              'The flat charge is the ' + t('y') + '-intercept (the cost at ' + t('0') + ' hours) and the hourly charge is the slope:<br>Garage A: ' + t(kA) + '<br>Garage B: ' + t(kB),
              ['Total cost = flat charge + (hourly charge) × (hours).'], '14a garage equations');
          } },
          { id: '14b', sub: 'b', level: 'PRG', make: function (r, s) {
            return K.P.number('(b) Determine algebraically the number of hours at which both garages cost the same amount.', s.h, function (v) {
              if (near(v, s.C)) return { code: 'u8l6-gave-cost', hint: 'That’s the common <b>cost</b> in dollars. The question asks for the number of <b>hours</b>.' };
              if (near(v, (s.fA - s.fB) / (s.rA + s.rB))) return { code: 'u8l6-rate-sum', hint: 'When you collect the ' + t('x') + '-terms on one side, the rates are <b>subtracted</b>: ' + t(num(s.rB) + 'x-' + num(s.rA) + 'x') + '.' };
              if (near(v, (s.fA + s.fB) / s.d)) return { code: 'u8l6-flat-sum', hint: 'Move the constants carefully: ' + t(num(s.fA) + '-' + num(s.fB)) + ', not ' + t(num(s.fA) + '+' + num(s.fB)) + '.' };
              return null;
            }, 'Set the two costs equal:<br>' + t(num(s.fA) + '+' + num(s.rA) + 'x=' + num(s.fB) + '+' + num(s.rB) + 'x') + '<br>' + t(num(rd(s.fA - s.fB)) + '=' + lin([s.d], ['x']) + '\\Rightarrow x=' + s.h) + ' hours.<br>Common cost: ' + t(num(s.fA) + '+' + num(s.rA) + '(' + s.h + ')=' + money(s.C)) + ', and ' + t(ck(num(s.fB) + '+' + num(s.rB) + '(' + s.h + ')=' + money(s.C))) + '.',
            ['Set the two cost expressions equal to each other and solve for ' + t('x') + '.'], '14b break-even hours', { after: 'hours' });
          } },
          { id: '14c', sub: 'c i', level: 'EMG', make: function (r, s) {
            var cheapA = s.cA < s.cB;
            return mc(r, '(c) Which garage is cheaper for a stay of ' + t(s.T) + ' hours?', [
              { html: 'Garage A', right: cheapA, why: cheapA ? null : 'Work out both costs at ' + t('x=' + s.T) + ': A costs ' + t(money(s.cA)) + ' and B costs ' + t(money(s.cB)) + '.' },
              { html: 'Garage B', right: !cheapA, why: !cheapA ? null : 'Work out both costs at ' + t('x=' + s.T) + ': A costs ' + t(money(s.cA)) + ' and B costs ' + t(money(s.cB)) + '.' },
              { html: 'They cost the same', why: 'They cost the same only at ' + t(s.h) + ' hours. At ' + t(s.T) + ' hours, compare ' + t(money(s.cA)) + ' and ' + t(money(s.cB)) + '.' }],
              'At ' + t('x=' + s.T) + ': A costs ' + t(num(s.fA) + '+' + num(s.rA) + '(' + s.T + ')=' + money(s.cA)) + ', B costs ' + t(num(s.fB) + '+' + num(s.rB) + '(' + s.T + ')=' + money(s.cB)) + '. <b>Garage ' + (cheapA ? 'A' : 'B') + '</b> is cheaper. ' + (cheapA ? 'Past the ' + s.h + '-hour break-even point, A’s lower hourly rate wins.' : 'Before the ' + s.h + '-hour break-even point, B’s lower flat charge wins.'),
              ['Substitute ' + t('x=' + s.T) + ' into both equations.'], '14c cheaper at ' + s.T + ' h', true);
          } },
          { id: '14c2', sub: 'c ii', level: 'EMG', make: function (r, s) {
            var dif = rd(Math.abs(s.cA - s.cB), 2);
            var p = K.P.number('(c) By how much is the cheaper garage cheaper for a stay of ' + t(s.T) + ' hours?', dif, function (v) {
              if (near(v, s.cA) || near(v, s.cB)) return { code: 'u8l6-gave-cost', hint: 'That’s the cost at one garage. The question asks for the <b>difference</b> between the two costs.' };
              return null;
            }, 'A: ' + t(money(s.cA)) + ', B: ' + t(money(s.cB)) + '. Difference: ' + t(money(Math.max(s.cA, s.cB)) + '-' + money(Math.min(s.cA, s.cB)) + '=' + money(dif)) + '.', ['Find both costs at ' + t('x=' + s.T) + ' and subtract.'], '14c difference', { before: '$' });
            p.answer = t(money(dif)); return p;
          } }] },
      /* ---------------- 15 ---------------- */
      { num: '15', stem: function (sh) { return 'Consider the system of equations ' + both(sh.E1, sh.E2) + '.'; },
        shared: function (r) {
          var s = find(function () {
            var x0 = r.int(1, 4), y0 = r.int(-2, 5), p = r.pick([2, 2, 3]), sv = x0 + y0, c = p * x0 - y0;
            if (Math.abs(sv) > 8 || sv === 0 || Math.abs(c) > 8 || c === 0) return null;
            return { x0: x0, y0: y0, p: p, s: sv, c: c };
          }, { x0: 3, y0: 3, p: 2, s: 6, c: 3 });
          if (r.chance(0.2)) s = { x0: 3, y0: 3, p: 2, s: 6, c: 3 };
          s.E1 = eqT(1, 1, s.s); s.E2 = eqT(s.p, -1, s.c); return s;
        },
        parts: [
          { id: '15a', sub: 'a i', level: 'EMG', make: function (r, s) {
            var win = [[-8, 8], [-8, 8]], L1 = line(1, 1, -s.s), L2 = line(s.p, -1, -s.c);
            return graphSys('(a) Graph both equations on the grid without using technology.', [L1, L2], [t(s.E1), t(s.E2)], win, { wrong: [
              { Ls: [L1, line(s.p, -1, s.c)], code: 'u8l6-gr-int-sign', hint: 'Check the ' + t('y') + '-intercept of ' + t(s.E2) + ': ' + t('-y=-' + s.p + 'x' + sg(s.c)) + ', so ' + t('y=' + s.p + 'x' + sg(-s.c)) + '. The ' + t('y') + '-intercept is ' + t(-s.c) + '.' },
              { Ls: [line(1, -1, s.s), L2], code: 'u8l6-gr-slope-sign', hint: t(s.E1) + ' rearranges to ' + t('y=-x' + sg(s.s)) + ': its slope is ' + t('-1') + ', so it falls from left to right.' },
              { Ls: [L1, line(s.p, 1, -s.c)], code: 'u8l6-gr-slope-sign', hint: t(s.E2) + ' rearranges to ' + t('y=' + s.p + 'x' + sg(-s.c)) + ': its slope is ' + t('+' + s.p) + ', so it rises from left to right.' }] },
              t(s.E1) + ' has intercepts ' + t(ptT([s.s, 0])) + ' and ' + t(ptT([0, s.s])) + ' (slope ' + t('-1') + ').<br>' + t(s.E2 + '\\Rightarrow y=' + s.p + 'x' + sg(-s.c)) + ': start at ' + t(ptT([0, -s.c])) + ', then up ' + t(s.p) + ', right ' + t(1) + '.<br>The lines cross at ' + t(ptT([s.x0, s.y0])) + '.',
              ['Find two easy points on each line (the intercepts work well for ' + t(s.E1) + ').', 'For ' + t(s.E2) + ', solve for ' + t('y') + ' first.'], '15a graph system');
          } },
          { id: '15a2', sub: 'a ii', level: 'BEG', make: function (r, s) {
            return ptPart('(a) State the solution of the system.', [s.x0, s.y0], [L(1, 1, s.s), L(s.p, -1, s.c)], {},
              'The two lines cross at ' + t(ptT([s.x0, s.y0])) + ', so ' + t('x=' + s.x0) + ', ' + t('y=' + s.y0) + '.', ['Read the point where the two lines cross: ' + t('x') + ' first, then ' + t('y') + '.'], '15a solution');
          } },
          { id: '15b', sub: 'b', level: 'LIM', make: function (r, s) {
            return verifyMC(r, '(b) The solution is ' + t(ptT([s.x0, s.y0])) + '. Which work verifies it algebraically?', [s.x0, s.y0], [{ a: 1, b: 1, c: s.s }, { a: s.p, b: -1, c: s.c }], null,
              'Substitute into both original equations: ' + t(ck(subT(1, 1, [s.x0, s.y0]) + '=' + s.s)) + ' and ' + t(ck(subT(s.p, -1, [s.x0, s.y0]) + '=' + s.c)) + '.', '15b verify');
          } },
          { id: '15c', sub: 'c', level: 'EMG', make: function (r) {
            var m = r.pick([2, 3, 3, 4, -2, -3]), b1 = nz(r, -6, 6), kind = r.pick(['none', 'none', 'inf', 'one']), b2 = b1, m2 = m;
            if (kind === 'none') do { b2 = nz(r, -6, 6); } while (b2 === b1);
            if (kind === 'one') do { m2 = r.pick([-4, -3, -2, -1, 1, 2, 3, 4]); } while (m2 === m || m2 === -m);
            if (kind === 'one') b2 = nz(r, -6, 6);
            var kk = kind === 'inf' ? r.pick([1, 2]) : 1;
            var E1 = eqT(kk * m, -kk, -kk * b1), E2 = 'y=' + lin([m2], ['x']) + (b2 < 0 ? num(b2) : '+' + b2);
            var s1 = 'y=' + lin([m], ['x']) + (b1 < 0 ? num(b1) : '+' + b1);
            var opts = [
              { html: '<b>No solution</b> — equal slopes and different ' + t('y') + '-intercepts: the lines are parallel and distinct.', right: kind === 'none', code: 'none' },
              { html: '<b>Infinitely many</b> — equal slopes and equal ' + t('y') + '-intercepts: it is the same line.', right: kind === 'inf', code: 'inf' },
              { html: '<b>One solution</b> — the slopes are different, so the lines cross once.', right: kind === 'one', code: 'one' },
              { html: '<b>One solution</b> — the two equations are written in different forms, so they are different lines.', code: 'forms' }];
            var tell = kind === 'none' ? 'Both slopes are ' + t(m) + ' but the intercepts are ' + t(b1) + ' and ' + t(b2) + '.' : kind === 'inf' ? 'Both are ' + t(s1) + ': same slope, same intercept.' : 'The slopes are ' + t(m) + ' and ' + t(m2) + ' — different.';
            opts.forEach(function (o) { if (!o.right) o.why = o.code === 'forms' ? 'The form an equation is written in doesn’t matter. Rewrite ' + t(E1) + ' as ' + t('y=mx+b') + ' and compare slopes and intercepts.' : 'Rewrite ' + t(E1) + ' in the form ' + t('y=mx+b') + ' and compare it with ' + t(E2) + '.'; });
            return mc(r, '(c) Without graphing, state the number of solutions of the system ' + both(E1, E2) + ', and the reason.', opts,
              t(E1 + '\\Rightarrow ' + s1) + '; the other equation is ' + t(E2) + '.<br>' + tell + ' So the system has <b>' + (kind === 'none' ? 'no solution' : kind === 'inf' ? 'infinitely many solutions' : 'exactly one solution') + '</b>.',
              ['Write both equations in the form ' + t('y=mx+b') + '. Compare slopes first, then intercepts.'], '15c classify ' + kind);
          } }] },
      /* ---------------- 16 ---------------- */
      { num: '16', stem: function (sh) { return 'A chemist mixes a ' + t(sh.p1 + '\\%') + ' acid solution with a ' + t(sh.p2 + '\\%') + ' acid solution to obtain ' + t(sh.V) + ' mL of a ' + t(sh.p3 + '\\%') + ' acid solution. Let ' + t('x') + ' be the number of mL of the ' + t(sh.p1 + '\\%') + ' solution used and ' + t('y') + ' the number of mL of the ' + t(sh.p2 + '\\%') + ' solution used.'; },
        shared: function (r) {
          var s = find(function () {
            var p1 = r.pick([10, 15, 20, 20, 25]), p2 = r.pick([40, 50, 50, 60, 70, 80]), V = r.pick([200, 300, 300, 400, 500, 600]), x0 = 10 * r.int(2, V / 10 - 2), y0 = V - x0;
            var p3 = (p1 * x0 + p2 * y0) / V; if (!isInt(p3) || p3 % 5 || p3 <= p1 || p3 >= p2) return null;
            return { p1: p1, p2: p2, V: V, x0: x0, y0: y0, p3: p3 };
          }, { p1: 20, p2: 50, V: 300, x0: 200, y0: 100, p3: 30 });
          if (r.chance(0.2)) s = { p1: 20, p2: 50, V: 300, x0: 200, y0: 100, p3: 30 };
          s.A = s.p3 * s.V / 100; return s;
        },
        parts: [
          { id: '16a', sub: 'a', level: 'PRG', make: function (r, s) {
            var T1 = { A: 1, B: 1, C: -s.V }, T2 = { A: s.p1, B: s.p2, C: -100 * s.A };
            return sysPart('(a) Write a system of two equations modelling this situation — one for the total volume, one for the total amount of acid.', [T1, T2], {
              labels: ['Total volume:', 'Total acid:'], keyTex: ['x+y=' + s.V, pc(s.p1) + 'x+' + pc(s.p2) + 'y=' + num(s.A)], alt: [[], [[s.p1 - s.p3, s.p2 - s.p3, 0]]],
              diags: [{ is: [s.p1, s.p2, -100 * s.p3], code: 'u8l6-mix-percent', hint: 'The acid equation counts mL of acid: the mixture holds ' + t(pc(s.p3) + '\\times ' + s.V + '=' + num(s.A)) + ' mL of acid, not ' + t(s.p3) + '.' },
                { is: [s.p1, s.p2, -s.p3], code: 'u8l6-mix-percent', hint: 'The right side of the acid equation is an amount of acid in mL: ' + t(pc(s.p3) + '\\times ' + s.V + '=' + num(s.A)) + '.' },
                { is: [100 * s.p1, 100 * s.p2, -100 * s.A], code: 'u8l6-mix-decimal', hint: 'Write the percents as decimals: ' + t(s.p1 + '\\%=' + pc(s.p1)) + ' and ' + t(s.p2 + '\\%=' + pc(s.p2)) + '.' },
                { is: [1, 1, -s.A], code: 'u8l6-mix-total', hint: 'The volume equation uses the total volume of the mixture, ' + t(s.V) + ' mL.' }],
              bad: [['x+y=' + s.V, pc(s.p1) + 'x+' + pc(s.p2) + 'y=' + s.p3]], good: [['x+y=' + s.V, pc(s.p1) + 'x+' + pc(s.p2) + 'y=' + pc(s.p3) + '(x+y)']] },
              '<b>Total volume:</b> ' + t('x+y=' + s.V) + '<br><b>Total acid:</b> each mL of the ' + t(s.p1 + '\\%') + ' solution carries ' + t(pc(s.p1)) + ' mL of acid and each mL of the ' + t(s.p2 + '\\%') + ' solution carries ' + t(pc(s.p2)) + ' mL; the mixture must carry ' + t(pc(s.p3) + '(' + s.V + ')=' + num(s.A)) + ' mL:<br>' + t(pc(s.p1) + 'x+' + pc(s.p2) + 'y=' + num(s.A)),
              ['One equation adds the volumes; the other adds the amounts of pure acid (percent as a decimal × volume).'], '16a mixture system');
          } },
          { id: '16b', sub: 'b', level: 'EMG', make: function (r, s) {
            return ptPart('(b) Solve the system ' + both('x+y=' + s.V, pc(s.p1) + 'x+' + pc(s.p2) + 'y=' + num(s.A)) + '.', [s.x0, s.y0], [L(1, 1, s.V), L(s.p1, s.p2, 100 * s.A)], {},
              'Clear the decimals (multiply the second equation by ' + t(100) + '): ' + t(s.p1 + 'x+' + s.p2 + 'y=' + (100 * s.A)) + '.<br>From the first, ' + t('x=' + s.V + '-y') + ':<br>' + t(s.p1 + '(' + s.V + '-y)+' + s.p2 + 'y=' + (100 * s.A) + '\\Rightarrow ' + (s.p2 - s.p1) + 'y=' + (100 * s.A - s.p1 * s.V) + '\\Rightarrow y=' + s.y0) + '<br>' + t('x=' + s.V + '-' + s.y0 + '=' + s.x0) + '. Solution ' + t(ptT([s.x0, s.y0])) + '.',
              ['Multiply the decimal equation by ' + t(100) + ' (or ' + t(10) + ') first, then substitute ' + t('x=' + s.V + '-y') + '.'], '16b mixture solve');
          } },
          { id: '16c', sub: 'c', level: 'EMG', make: function (r, s) {
            return numBoxes('(c) State how many mL of each stock solution are required, and check against the words: how much pure acid is in the final ' + t(s.V) + ' mL?', [
              { label: t(s.p1 + '\\%') + ' solution:', after: 'mL', v: s.x0, name: t(s.p1 + '\\%') + ' solution' },
              { label: t(s.p2 + '\\%') + ' solution:', after: 'mL', v: s.y0, name: t(s.p2 + '\\%') + ' solution' },
              { label: 'pure acid:', after: 'mL', v: s.A, name: 'pure acid', diag: function (v) { if (near(v, s.p3)) return { code: 'u8l6-mix-percent', hint: 'That’s the percent. The amount of acid is ' + t(pc(s.p3) + '\\times ' + s.V) + ' mL.' }; return null; } }],
              t(s.x0) + ' mL of the ' + t(s.p1 + '\\%') + ' solution and ' + t(s.y0) + ' mL of the ' + t(s.p2 + '\\%') + ' solution.<br>Check: ' + t(ck(s.x0 + '+' + s.y0 + '=' + s.V)) + ' mL; acid: ' + t(pcS(s.p1) + '(' + s.x0 + ')+' + pcS(s.p2) + '(' + s.y0 + ')=' + num(s.p1 * s.x0 / 100) + '+' + num(s.p2 * s.y0 / 100) + '=' + num(s.A)) + ' mL, and ' + t(ck('\\frac{' + num(s.A) + '}{' + s.V + '}=' + pcS(s.p3) + '=' + s.p3 + '\\%')) + '.',
              ['The solution of the system gives the two volumes. The acid in the mixture is ' + t(s.p3 + '\\%') + ' of ' + t(s.V) + ' mL.'], '16c mixture answer', { swapHint: 'Check which solution is which: ' + t('x') + ' is the ' + t(s.p1 + '\\%') + ' solution.' });
          } }] },
      /* ---------------- 17 ---------------- */
      { num: '17', stem: function (sh) { return 'A concession stand sold ' + t(sh.N) + ' items in total — hot dogs at ' + t(money(sh.p1)) + ' each and drinks at ' + t(money(sh.p2)) + ' each — and took in ' + t(money(sh.V)) + '. Determine how many of each were sold.'; },
        shared: function (r) {
          var s = find(function () {
            var p1 = r.pick([3.5, 4, 4.5, 4.5, 5, 5.5, 6]), p2 = r.pick([1.5, 2, 2, 2.5, 3]), h = r.int(60, 200), d = r.int(60, 200);
            if (p1 - p2 < 1.5 || h === d) return null; var V = p1 * h + p2 * d; if (!isInt(V)) return null;
            return { p1: p1, p2: p2, h0: h, d0: d, N: h + d, V: V };
          }, { p1: 4.5, p2: 2, h0: 132, d0: 108, N: 240, V: 810 });
          if (r.chance(0.2)) s = { p1: 4.5, p2: 2, h0: 132, d0: 108, N: 240, V: 810 };
          return s;
        },
        parts: [
          { id: '17a', sub: 'i', level: 'EMG', make: function (r, s) {
            return sysPart('Let ' + t('h') + ' be the number of hot dogs and ' + t('d') + ' the number of drinks. Write a system of two equations — one counting items, one totalling the money.', [{ A: 1, B: 1, C: -s.N }, { A: s.p1 * 2, B: s.p2 * 2, C: -2 * s.V }], {
              vars: ['h', 'd'], labels: ['Items:', 'Money:'], keyTex: ['h+d=' + s.N, num(s.p1) + 'h+' + num(s.p2) + 'd=' + s.V],
              diags: [{ is: [1, 1, -s.V], code: 'u8l6-rhs-swap', hint: 'The count of items, ' + t(s.N) + ', goes with ' + t('h+d') + '; the money, ' + t(money(s.V)) + ', goes with the price equation.' },
                { is: [s.p1 * 2, s.p2 * 2, -2 * s.N], code: 'u8l6-rhs-swap', hint: 'The price equation totals money, so its right side is ' + t(money(s.V)) + ', not the number of items.' },
                { is: [s.p2 * 2, s.p1 * 2, -2 * s.V], code: 'u8l6-price-swap', hint: 'Each hot dog brings in ' + t(money(s.p1)) + ', so ' + t(num(s.p1)) + ' multiplies ' + t('h') + '.' }],
              bad: [['h+d=' + s.V, num(s.p1) + 'h+' + num(s.p2) + 'd=' + s.N]] },
              'Counting items: ' + t('h+d=' + s.N) + '. Totalling value, in dollars: ' + t(num(s.p1) + 'h+' + num(s.p2) + 'd=' + s.V) + '.',
              ['One equation adds the numbers of items; the other adds price × number for each kind.'], '17 concession system');
          } },
          { id: '17b', sub: 'ii', level: 'EMG', make: function (r, s) {
            return numBoxes('Solve the system ' + both('h+d=' + s.N, num(s.p1) + 'h+' + num(s.p2) + 'd=' + s.V) + '. How many of each were sold?', [{ label: 'hot dogs:', v: s.h0 }, { label: 'drinks:', v: s.d0 }],
              'From the first equation, ' + t('d=' + s.N + '-h') + '. Substituting:<br>' + t(num(s.p1) + 'h+' + num(s.p2) + '(' + s.N + '-h)=' + s.V) + '<br>' + t(num(rd(s.p1 - s.p2)) + 'h+' + num(s.p2 * s.N) + '=' + s.V + '\\Rightarrow ' + num(rd(s.p1 - s.p2)) + 'h=' + num(s.V - s.p2 * s.N) + '\\Rightarrow h=' + s.h0) + ', so ' + t('d=' + s.N + '-' + s.h0 + '=' + s.d0) + '.<br>Check: ' + t(ck(s.h0 + '+' + s.d0 + '=' + s.N)) + '; ' + t(ck(num(s.p1) + '(' + s.h0 + ')+' + num(s.p2) + '(' + s.d0 + ')=' + num(s.p1 * s.h0) + '+' + num(s.p2 * s.d0) + '=' + s.V)) + '.<br>The stand sold <b>' + s.h0 + ' hot dogs</b> and <b>' + s.d0 + ' drinks</b>.',
              ['Substitute ' + t('d=' + s.N + '-h') + ' into the money equation.'], '17 concession answer', { swapHint: 'Check which is which: hot dogs cost ' + t(money(s.p1)) + '. Substitute your numbers into the money equation.' });
          } }] },
      /* ---------------- 18 ---------------- */
      { num: '18', stem: function (sh) { return 'A rectangular dog run has a perimeter of ' + t(sh.P) + ' m. Its length is ' + sh.words + ' its width. Determine the dimensions of the dog run.'; },
        shared: function (r) {
          var s = find(function () {
            var w = r.int(6, 20), k = r.pick([2, 2, 3]), c = nz(r, -4, 8), l = k * w + c; if (l <= w + 2) return null;
            return { w0: w, k: k, c: c, l0: l, P: 2 * (l + w) };
          }, { w0: 12, k: 2, c: 6, l0: 30, P: 84 });
          if (r.chance(0.2)) s = { w0: 12, k: 2, c: 6, l0: 30, P: 84 };
          s.words = t(Math.abs(s.c)) + ' m ' + (s.c > 0 ? 'more' : 'less') + ' than ' + (s.k === 2 ? 'twice' : 'three times');
          s.cond = 'l=' + s.k + 'w' + (s.c > 0 ? '+' + s.c : num(s.c)); return s;
        },
        parts: [
          { id: '18a', sub: 'i', level: 'EMG', make: function (r, s) {
            return sysPart('Let ' + t('l') + ' be the length and ' + t('w') + ' the width, in metres. Write a system of two equations.', [{ A: 2, B: 2, C: -s.P }, { A: 1, B: -s.k, C: -s.c }], {
              vars: ['l', 'w'], labels: ['Perimeter:', 'Length:'], keyTex: ['2l+2w=' + s.P, s.cond],
              diags: [{ is: [1, 1, -s.P], code: 'u8l6-perimeter', hint: 'The perimeter goes all the way around: two lengths and two widths, ' + t('2l+2w=' + s.P) + '.' },
                { is: [-s.k, 1, -s.c], code: 'u8l6-backwards', hint: 'Read it again: the <b>length</b> is ' + s.words + ' the width, so the equation starts ' + t('l=') + '.' },
                { is: [1, -s.k, s.c], code: 'u8l6-cond-sign', hint: s.c > 0 ? '“More than” means add: ' + t(s.cond) + '.' : '“Less than” means subtract: ' + t(s.cond) + '.' }],
              bad: [['l+w=' + s.P, s.cond]] },
              'Perimeter: ' + t('2l+2w=' + s.P) + ' (or ' + t('l+w=' + (s.P / 2)) + '). Length condition: ' + t(s.cond) + '.',
              ['A rectangle’s perimeter is ' + t('2l+2w') + '.'], '18 dog run system');
          } },
          { id: '18b', sub: 'ii', level: 'EMG', make: function (r, s) {
            var w2 = (s.P - s.c) / (s.k + 1), l2 = s.k * w2 + s.c;
            return numBoxes('Solve the system ' + both('2l+2w=' + s.P, s.cond) + '. State the dimensions of the dog run.', [{ label: 'length:', after: 'm', v: s.l0, diag: function (v) { return near(v, l2) ? { code: 'u8l6-perimeter', hint: 'Check the perimeter: ' + t('2l+2w=' + s.P) + ', so ' + t('l+w=' + (s.P / 2)) + ', not ' + t(s.P) + '.' } : null; } }, { label: 'width:', after: 'm', v: s.w0 }],
              'Perimeter: ' + t('2(l+w)=' + s.P) + ', so ' + t('l+w=' + (s.P / 2)) + '. Substitute ' + t(s.cond) + ':<br>' + t('(' + s.k + 'w' + (s.c > 0 ? '+' + s.c : num(s.c)) + ')+w=' + (s.P / 2) + '\\Rightarrow ' + (s.k + 1) + 'w=' + (s.P / 2 - s.c) + '\\Rightarrow w=' + s.w0) + ', so ' + t('l=' + s.k + '(' + s.w0 + ')' + (s.c > 0 ? '+' + s.c : num(s.c)) + '=' + s.l0) + '.<br>Check: ' + t(ck('2(' + s.l0 + ')+2(' + s.w0 + ')=' + s.P)) + '. The dog run is <b>' + s.l0 + ' m long and ' + s.w0 + ' m wide</b>.',
              ['Substitute the length condition into the perimeter equation.'], '18 dog run answer', { swapHint: 'Check which is which: the length is the longer side here.' });
          } }] }
    ],
    extra: EXTRA()
  });

  /* ---------- Q13 generators and method questions ---------- */
  function q13a(r) {
    return find(function () {
      var a1 = r.int(3, 7), a2 = r.int(2, 4), m0 = r.int(1, 6), n0 = nz(r, -5, 6); if (a1 === a2) return null;
      var c1 = a1 * m0 - n0, c2 = a2 * m0 + n0; if (c1 === 0 || c2 === 0) return null;
      return { a1: a1, a2: a2, m0: m0, n0: n0, c1: c1, c2: c2, E1: eqT(a1, -1, c1, ['m', 'n']), E2: eqT(a2, 1, c2, ['m', 'n']) };
    }, { a1: 5, a2: 2, m0: 3, n0: 2, c1: 13, c2: 8, E1: '5m-n=13', E2: '2m+n=8' });
  }
  function method13a(r, s) {
    return mc(r, '(a) ' + both(s.E1, s.E2) + '<br>Which method suits this system best, and why?', [
      { html: '<b>Elimination</b> — the ' + t('n') + '-terms, ' + t('-n') + ' and ' + t('+n') + ', are already opposites, so adding the equations removes ' + t('n') + '.', right: true },
      { html: '<b>Substitution</b> — ' + t('m') + ' is already isolated in one of the equations.', why: 'Look again: neither equation has ' + t('m') + ' by itself on one side.' },
      { html: '<b>Graphing</b> — both equations are already in the form ' + t('y=mx+b') + '.', why: 'Neither equation is solved for a variable — and a hand graph is only exact when the answer lands on a grid point.' },
      { html: '<b>Elimination</b> — the ' + t('m') + '-coefficients ' + t(s.a1) + ' and ' + t(s.a2) + ' already match.', why: t(s.a1) + ' and ' + t(s.a2) + ' don’t match. Which variable’s coefficients are already opposites?' }],
      '<b>Elimination:</b> the ' + t('n') + '-coefficients are ' + t('-1') + ' and ' + t('+1') + ' — already opposites — so adding the two equations eliminates ' + t('n') + ' immediately.', METHOD_HINT, '13a method');
  }
  function q13b(r) {
    return find(function () {
      var m = r.int(2, 4), x0 = r.int(1, 5), b = r.int(-8, -1), y0 = m * x0 + b, p = r.int(2, 5), q = r.int(2, 5);
      if (Math.abs(y0) > 6 || y0 === 0 || p === m) return null; var rr = p * x0 + q * y0; if (rr === 0) return null;
      return { m: m, b: b, x0: x0, y0: y0, p: p, q: q, rr: rr, E1: 'y=' + m + 'x' + num(b), E2: eqT(p, q, rr) };
    }, { m: 2, b: -7, x0: 3, y0: -1, p: 3, q: 4, rr: 5, E1: 'y=2x-7', E2: '3x+4y=5' });
  }
  function method13b(r, s) {
    return mc(r, '(b) ' + both(s.E1, s.E2) + '<br>Which method suits this system best, and why?', [
      { html: '<b>Substitution</b> — ' + t('y') + ' is already isolated in ' + t(s.E1) + ', so ' + t(lin([s.m], ['x']) + num(s.b)) + ' can replace ' + t('y') + ' directly.', right: true },
      { html: '<b>Elimination</b> — the ' + t('y') + '-terms are already opposites.', why: 'The ' + t('y') + '-coefficients are ' + t(1) + ' and ' + t(s.q) + ', not opposites — and one equation is already solved for ' + t('y') + '.' },
      { html: '<b>Graphing</b> — both equations are in the form ' + t('y=mx+b') + '.', why: 'Only the first equation is in ' + t('y=mx+b') + ' form.' },
      { html: '<b>Elimination</b> — the ' + t('x') + '-coefficients already match.', why: 'The ' + t('x') + '-coefficients are ' + t(s.m) + ' and ' + t(s.p) + ' — they don’t match.' }],
      '<b>Substitution:</b> ' + t('y') + ' is already isolated in the first equation, so its expression drops straight into the second.', METHOD_HINT, '13b method');
  }
  function q13c(r) {
    var s = find(function () {
      var m1 = r.pick([0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.6]), m2 = r.pick([-0.4, -0.5, -0.6, -0.7, -0.8, -0.9, -1.1, -1.2]), x0 = r.int(2, 8), b1 = r.pick([0.4, 0.8, 1.2, 1.5, 2, 2.4]);
      var y0 = rd(m1 * x0 + b1), b2 = rd(y0 - m2 * x0); if (!isInt(rd(y0 * 100)) || isInt(y0) || b2 <= 0) return null;
      if (isInt(rd(y0 * 10)) === false && r.chance(0.5)) return null;
      return { m1: m1, m2: m2, x0: x0, b1: b1, y0: y0, b2: b2 };
    }, { m1: 0.35, m2: -0.9, x0: 4, b1: 1.2, y0: 2.6, b2: 6.2 });
    if (r.chance(0.2)) s = { m1: 0.35, m2: -0.9, x0: 4, b1: 1.2, y0: 2.6, b2: 6.2 };
    s.E1 = 'y=' + num(s.m1) + 'x+' + num(s.b1); s.E2 = 'y=' + num(s.m2) + 'x+' + num(s.b2); return s;
  }
  function method13c(r, s) {
    return mc(r, '(c) ' + both(s.E1, s.E2) + '<br>Which method suits this system best, and why?', [
      { html: '<b>Substitution</b> (set the two expressions for ' + t('y') + ' equal) — both equations are already solved for ' + t('y') + ', and decimal slopes would make a hand-drawn graph hard to read.', right: true },
      { html: '<b>Graphing</b> — both equations are in ' + t('y=mx+b') + ' form, so the crossing point can be read off exactly.', why: 'They are in ' + t('y=mx+b') + ' form, but slopes like ' + t(num(s.m1)) + ' and ' + t(num(s.m2)) + ' can’t be drawn accurately by hand, so a graph would only give an estimate.' },
      { html: '<b>Elimination</b> — the ' + t('x') + '-coefficients are opposites.', why: t(num(s.m1)) + ' and ' + t(num(s.m2)) + ' are not opposites.' },
      { html: '<b>Substitution</b> — ' + t('x') + ' is already isolated in one equation.', why: 'It’s ' + t('y') + ' that is isolated (in both equations), not ' + t('x') + '.' }],
      '<b>Set the expressions equal</b> (substitution): both equations are in ' + t('y=\\ldots') + ' form, and the decimal coefficients would make a hand-drawn graph hard to read.', METHOD_HINT, '13c method');
  }

  /* =================================================================================================== */
  /* EXTRA PRACTICE                                                                                      */
  /* =================================================================================================== */
  /* ---------- extra-practice helpers ---------- */
  function isoY(T, vars) {   // "solve for y": the same line with y alone on one side
    vars = vars || ['x', 'y']; var TL = Ln.of(T), Y = vars[1];
    var strip = function (a) { while (a && a.t === 'paren') a = a.a; return a; };
    var hasY = function (a) { var f = false; (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'var' && x.n === Y) f = true; ['a', 'b'].forEach(function (k) { if (x[k]) w(x[k]); }); })(a); return f; };
    return function (resp) {
      var rr = Ln.read(resp, vars);
      if (!rr.ok) return form(rr.why === 'empty' ? 'empty' : 'line-' + rr.why, rr.why === 'empty' ? 'Type your equation first.' : 'Write an equation that starts ' + t(Y + '=') + '.');
      if (!Ln.same([rr.a, rr.b, rr.c], TL)) return wrong('u8l6-isolate', 'That isn’t the same line any more. Move the ' + t(vars[0]) + '-term to the other side, then divide <b>every</b> term by the coefficient of ' + t(Y) + '.');
      var l = strip(rr.lAst), rt = strip(rr.rAst);
      if ((l && l.t === 'var' && l.n === Y && !hasY(rr.rAst)) || (rt && rt.t === 'var' && rt.n === Y && !hasY(rr.lAst))) return ok();
      return form('u8l6-not-isolated', 'Right equation — now get ' + t(Y) + ' by itself on one side, e.g. ' + t(Y + '=\\ldots') + '.');
    };
  }
  /* an expression in one letter (e.g. k), equivalent to targetTex; opt.single: nudge unless it is one fraction */
  function exprIn(targetTex, v, opt) {
    opt = opt || {}; var tp = ex.parse(targetTex).ast;
    var vs = function (a) { var acc = {}; (function w(x) { if (!x || typeof x !== 'object') return; if (x.t === 'var') acc[x.n] = 1; ['a', 'b', 'n'].forEach(function (k) { if (x[k]) w(x[k]); }); })(a); return Object.keys(acc); };
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/^\s*[a-z]\s*=/, '');
      var a = K.read(s); if (a.res) return a.res;
      var extra = vs(a.ast).filter(function (x) { return x !== v; }); if (extra.length) return wrong('var', 'Write it using only the letter ' + t(v) + '.');
      if (ex.equiv(a.ast, tp, [v], 6)) {
        if (opt.single) { var top = a.ast; while (top.t === 'paren') top = top.a; if (top.t !== 'div' && !(top.t === 'neg' && top.a.t === 'div')) return form('u8l6-single-frac', 'Right — now write it as a single fraction, e.g. ' + t('\\frac{2' + v + '+12}{7}') + '.'); }
        return ok();
      }
      if (opt.diag) { var h = opt.diag(a.ast); if (h) return wrong(h.code, h.hint); }
      return wrong('u8l6-param', null);
    };
  }
  function clipSeg(Lo, xr, yr) {   // the part of line Lo inside the box, as two points
    var pts = [], add = function (p) { if (p[0] >= xr[0] - 1e-9 && p[0] <= xr[1] + 1e-9 && p[1] >= yr[0] - 1e-9 && p[1] <= yr[1] + 1e-9 && !pts.some(function (q) { return near(q[0], p[0]) && near(q[1], p[1]); })) pts.push(p); };
    if (Lo.B !== 0) { add([xr[0], -(Lo.A * xr[0] + Lo.C) / Lo.B]); add([xr[1], -(Lo.A * xr[1] + Lo.C) / Lo.B]); }
    if (Lo.A !== 0) { add([-(Lo.B * yr[0] + Lo.C) / Lo.A, yr[0]]); add([-(Lo.B * yr[1] + Lo.C) / Lo.A, yr[1]]); }
    return pts.slice(0, 2);
  }
  /* a set of lines on a context grid — ends don't matter; wrongs: [{ Lo, code, hint }] */
  function lineSetCheck(Ls, names, wrongs) {
    var keyOfL = function (Lo) { var p = [0, -Lo.C / Lo.B], q = [4, -(Lo.A * 4 + Lo.C) / Lo.B]; return Object.keys(DR.geom({ pts: [], pieces: [{ v: [p, q], s: 'closed', e: 'closed' }] }).lines)[0]; };
    var keys = Ls.map(keyOfL), W = (wrongs || []).map(function (w) { return { k: keyOfL(w.Lo), code: w.code, hint: w.hint }; });
    return function (resp) {
      if (DR.empty(resp)) return form('empty', 'Draw your answer on the grid first.');
      var v = splitBends(resp, true), have = Object.keys(DR.geom(v).lines);
      if (!have.length) return wrong('u8l6-points-only', 'Plotting points is a good start — now join each candle’s points with a line (Line tool).');
      var miss = [], extra = have.filter(function (k) { return keys.indexOf(k) < 0; });
      keys.forEach(function (k, i) { if (have.indexOf(k) < 0) miss.push(names[i]); });
      if (!miss.length && !extra.length) return ok();
      for (var i = 0; i < W.length; i++) if (have.indexOf(W[i].k) >= 0) return wrong(W[i].code, W[i].hint);
      if (miss.length && !extra.length) return wrong('u8l6-line-missing', 'Correct so far — still to draw: ' + miss.join(' and ') + '.');
      if (!miss.length) return wrong('u8l6-line-extra', 'Both lines are there, but there is an extra line too. Remove it.');
      return wrong('u8l6-line-wrong', miss.length < Ls.length ? 'One line is right. Check ' + miss.join(' and ') + ': its starting height and how much it drops each hour.' : 'Check each line: it starts at the candle’s height at ' + t('t=0') + ' and drops by the burn rate every hour.');
    };
  }
  /* the four "which method?" options of EP question 2 */
  function methodOpts(kind, s) {
    var why = {
      S1: 'Look again: neither equation has ' + t('y') + ' alone on one side.',
      S2: 'Check the ' + t('x') + '-coefficients: ' + t(s.ax.join(',\\ ')) + ' — none of them is ' + t(1) + '.',
      E1: 'The ' + t('x') + '-coefficients are ' + t(s.ax.join('\\text{ and }')) + ' — not the same, so subtracting won’t remove ' + t('x') + '.',
      E2: kind === 'A' ? t('y') + ' has coefficient ' + t(1) + ' and is already isolated, so no scaling is needed.' : kind === 'B' ? 'The ' + t('x') + '-terms already match, so no scaling is needed at all.' : t('x') + ' has coefficient ' + t(1) + ' in the first equation, so it can be isolated with no fractions.'
    };
    return [
      { html: '<b>Substitution</b> — ' + t('y') + ' is already isolated in one equation.', right: kind === 'A', why: kind === 'A' ? null : why.S1 },
      { html: '<b>Substitution</b> — ' + t('x') + ' has coefficient ' + t(1) + ' in one equation, so it can be isolated with no fractions.', right: kind === 'C', why: kind === 'C' ? null : why.S2 },
      { html: '<b>Elimination by subtracting</b> — both equations contain exactly the same ' + t('x') + '-term, so subtracting removes ' + t('x') + ' with no scaling.', right: kind === 'B', why: kind === 'B' ? null : why.E1 },
      { html: '<b>Elimination, scaling both</b> — no coefficient is ' + t('\\pm 1') + ' and none divides its partner, so multiply both equations to reach a common multiple.', right: kind === 'D', why: kind === 'D' ? null : why.E2 }];
  }
  function ep2sys(r, kind) {
    return find(function () {
      var x0 = r.int(-3, 6), y0 = nz(r, -5, 5), E1, E2, L1, L2, ax, sol;
      if (kind === 'A') {
        var m = r.int(2, 4), c = y0 + m * x0, p = r.int(2, 5), q = r.int(2, 5); if (c === 0 || p === m) return null;
        var rr = p * x0 + q * y0; if (rr === 0) return null;
        E1 = 'y=' + c + '-' + m + 'x'; E2 = eqT(p, q, rr); L1 = L(m, 1, c); L2 = L(p, q, rr); ax = [-m, p];
        sol = t(p + 'x+' + q + '(' + c + '-' + m + 'x)=' + rr + '\\Rightarrow ' + (p - q * m) + 'x=' + (rr - q * c) + '\\Rightarrow x=' + x0) + ', ' + t('y=' + c + '-' + m + '(' + x0 + ')=' + y0) + '.';
      } else if (kind === 'B') {
        var k = r.int(2, 7), s1 = r.int(2, 7), u = r.int(2, 7); if (s1 === u) return null;
        var c1 = k * x0 - s1 * y0, c2 = k * x0 + u * y0; if (c1 === 0 || c2 === 0) return null;
        if (isInt(c1 / s1) || isInt(c2 / u)) return null;   // y-intercepts between grid lines (EP 3e)
        E1 = eqT(k, -s1, c1); E2 = eqT(k, u, c2); L1 = L(k, -s1, c1); L2 = L(k, u, c2); ax = [k, k];
        sol = 'Subtract the second equation from the first: ' + t((-s1 - u) + 'y=' + (c1 - c2) + '\\Rightarrow y=' + y0) + '. Then ' + t(k + 'x' + sg(u * y0) + '=' + c2 + '\\Rightarrow ' + k + 'x=' + (c2 - u * y0) + '\\Rightarrow x=' + x0) + '.';
      } else if (kind === 'C') {
        var s2 = r.int(2, 7), p2 = r.int(2, 6), q2 = r.int(2, 6), d1 = x0 - s2 * y0, d2 = p2 * x0 + q2 * y0; if (d1 === 0 || d2 === 0) return null;
        E1 = eqT(1, -s2, d1); E2 = eqT(p2, q2, d2); L1 = L(1, -s2, d1); L2 = L(p2, q2, d2); ax = [1, p2];
        sol = t('x=' + d1 + '+' + s2 + 'y') + '; ' + t(p2 + '(' + d1 + '+' + s2 + 'y)+' + q2 + 'y=' + d2 + '\\Rightarrow ' + (p2 * s2 + q2) + 'y=' + (d2 - p2 * d1) + '\\Rightarrow y=' + y0) + ', ' + t('x=' + d1 + '+' + s2 + '(' + y0 + ')=' + x0) + '.';
      } else {
        var a1 = r.int(2, 9), a2 = r.int(2, 9), b1 = r.int(2, 8), b2 = r.int(2, 8);
        if (a1 === a2 || b1 === b2 || a1 % a2 === 0 || a2 % a1 === 0 || b1 % b2 === 0 || b2 % b1 === 0) return null;
        var e1 = a1 * x0 + b1 * y0, e2 = a2 * x0 - b2 * y0; if (e1 === 0 || e2 === 0) return null;
        var Ly = lcm(b1, b2), m1 = Ly / b1, m2 = Ly / b2;
        E1 = eqT(a1, b1, e1); E2 = eqT(a2, -b2, e2); L1 = L(a1, b1, e1); L2 = L(a2, -b2, e2); ax = [a1, a2];
        sol = t('\\text{Eq.~1}\\times ' + m1 + ':\\ ' + eqT(a1 * m1, b1 * m1, e1 * m1)) + ', ' + t('\\text{Eq.~2}\\times ' + m2 + ':\\ ' + eqT(a2 * m2, -b2 * m2, e2 * m2)) + '. Add: ' + t((a1 * m1 + a2 * m2) + 'x=' + (e1 * m1 + e2 * m2) + '\\Rightarrow x=' + x0) + ', then ' + t('y=' + y0) + '.';
      }
      return { x0: x0, y0: y0, E1: E1, E2: E2, sys: [L1, L2], ax: ax, sol: sol, kind: kind };
    }, null);
  }
  var EP2_BOOK = {
    A: { x0: 2, y0: 1, E1: 'y=5-2x', E2: '3x+4y=10', sys: [L(2, 1, 5), L(3, 4, 10)], ax: [-2, 3], kind: 'A', sol: t('3x+4(5-2x)=10\\Rightarrow -5x=-10\\Rightarrow x=2') + ', ' + t('y=5-2(2)=1') + '.' },
    B: { x0: 3, y0: -4, E1: '5x-6y=39', E2: '5x+2y=7', sys: [L(5, -6, 39), L(5, 2, 7)], ax: [5, 5], kind: 'B', sol: 'Subtract the second equation from the first: ' + t('-8y=32\\Rightarrow y=-4') + '. Then ' + t('5x-8=7\\Rightarrow 5x=15\\Rightarrow x=3') + '.' },
    C: { x0: 2, y0: -1, E1: 'x-7y=9', E2: '4x+3y=5', sys: [L(1, -7, 9), L(4, 3, 5)], ax: [1, 4], kind: 'C', sol: t('x=9+7y') + '; ' + t('4(9+7y)+3y=5\\Rightarrow 31y=-31\\Rightarrow y=-1') + ', ' + t('x=9+7(-1)=2') + '.' },
    D: { x0: 4, y0: -1, E1: '7x+4y=24', E2: '5x-6y=26', sys: [L(7, 4, 24), L(5, -6, 26)], ax: [7, 5], kind: 'D', sol: t('\\text{Eq.~1}\\times 3:\\ 21x+12y=72') + ', ' + t('\\text{Eq.~2}\\times 2:\\ 10x-12y=52') + '. Add: ' + t('31x=124\\Rightarrow x=4') + ', then ' + t('y=-1') + '.' } };
  function ep2(r, kind) { return r.chance(0.2) ? EP2_BOOK[kind] : (ep2sys(r, kind) || EP2_BOOK[kind]); }
  function EXTRA() {
    var E1W = [[-3, 7], [-8, 6]];
    return [
      /* ---------------- EP 1 ---------------- */
      { num: '1', section: 'Extra practice A — One System, Every Method', stem: function (s) { return 'Consider the system ' + both(s.E1, s.E2) + '.'; },
        shared: function (r) {
          var book = { a: 3, b: 2, x0: 3, y0: -2 };
          var s = r.chance(0.2) ? book : find(function () {
            var ab = r.pick([[3, 2], [2, 3], [3, 4], [4, 3], [2, 5], [5, 2], [3, 2]]), a = ab[0], b = ab[1], x0 = r.int(-2, 6), y0 = r.int(-7, 5);
            var L1 = line(a, b, -(a * x0 + b * y0)), L2 = line(b, -a, -(b * x0 - a * y0));
            if (lat(L1, E1W[0], E1W[1]).length < 2 || lat(L2, E1W[0], E1W[1]).length < 2 || a * x0 + b * y0 === 0 || b * x0 - a * y0 === 0) return null;
            if (isInt((a * x0 + b * y0) / b) && isInt((b * x0 - a * y0) / a)) return null;   // keep at least one fractional intercept
            return { a: a, b: b, x0: x0, y0: y0 };
          }, book);
          s.c = s.a * s.x0 + s.b * s.y0; s.f = s.b * s.x0 - s.a * s.y0;
          s.E1 = eqT(s.a, s.b, s.c); s.E2 = eqT(s.b, -s.a, s.f);
          s.T1 = { A: s.a, B: s.b, C: -s.c }; s.T2 = { A: s.b, B: -s.a, C: -s.f };
          s.si1 = Ln.tex(s.T1, 'slope-intercept'); s.si2 = Ln.tex(s.T2, 'slope-intercept');
          s.sys = [L(s.a, s.b, s.c), L(s.b, -s.a, s.f)]; s.P = [s.x0, s.y0];
          s.Lm = lcm(s.a, s.b); s.m1 = s.Lm / s.b; s.m2 = s.Lm / s.a;   // eliminate y: Eq.1 × m1, Eq.2 × m2, then add
          s.cx = s.a * s.m1 + s.b * s.m2; s.cr = s.c * s.m1 + s.f * s.m2;
          return s;
        },
        parts: [
          { id: 'e1a', sub: 'a i', level: 'EMG', make: function (r, s) {
            return eqBoxes('(a) <b>By graphing.</b> First rewrite both equations in slope–intercept form.', [{ label: t(s.E1) + ':', T: s.T1, keyTex: s.si1, form: 'slope-intercept' }, { label: t(s.E2) + ':', T: s.T2, keyTex: s.si2, form: 'slope-intercept' }], {},
              t(s.E1 + '\\Rightarrow ' + s.b + 'y=' + lin([-s.a], ['x']) + sg(s.c) + '\\Rightarrow ' + s.si1) + '<br>' + t(s.E2 + '\\Rightarrow -' + s.a + 'y=' + lin([-s.b], ['x']) + sg(s.f) + '\\Rightarrow ' + s.si2),
              ['Move the ' + t('x') + '-term to the right side, then divide <b>every</b> term by the coefficient of ' + t('y') + '.'], 'EP1a slope-intercept');
          } },
          { id: 'e1a2', sub: 'a ii', level: 'PRG', make: function (r, s) {
            var L1 = line(s.a, s.b, -s.c), L2 = line(s.b, -s.a, -s.f);
            return graphSys('(a) Graph both lines: ' + t(s.si1) + ' and ' + t(s.si2) + '.', [L1, L2], [t(s.si1), t(s.si2)], E1W, { wrong: [
              { Ls: [line(s.a, -s.b, -s.c), L2], code: 'u8l6-gr-slope-sign', hint: 'Check the slope of ' + t(s.si1) + ': it is negative, so the line falls from left to right.' },
              { Ls: [L1, line(s.b, s.a, -s.f)], code: 'u8l6-gr-slope-sign', hint: 'Check the slope of ' + t(s.si2) + ': it is positive, so the line rises from left to right.' }] },
              'Plot each ' + t('y') + '-intercept, then use the slope (rise over run) to reach another grid point — for a fractional intercept, step along the line until you land on a grid point.<br>' + t(s.si1) + ' passes through ' + lat(L1, E1W[0], E1W[1]).slice(0, 2).map(ptT).map(t).join(' and ') + '; ' + t(s.si2) + ' passes through ' + lat(L2, E1W[0], E1W[1]).slice(0, 2).map(ptT).map(t).join(' and ') + '. They cross at ' + t(ptT(s.P)) + '.',
              ['If a ' + t('y') + '-intercept is a fraction, find a grid point on the line instead: try ' + t('x') + '-values until ' + t('y') + ' is a whole number.'], 'EP1a graph');
          } },
          { id: 'e1a3', sub: 'a iii', level: 'BEG', make: function (r, s) {
            return ptPart('(a) State the solution you read off the graph.', s.P, s.sys, {}, 'The lines cross at ' + t(ptT(s.P)) + '.', ['Read the crossing point: ' + t('x') + ' first, then ' + t('y') + '.'], 'EP1a read');
          } },
          { id: 'e1b', sub: 'b i', level: 'EMG', make: function (r, s) {
            var key = 'y=\\frac{' + s.c + '-' + s.a + 'x}{' + s.b + '}';
            var p = K.P.math('(b) <b>By substitution.</b> Isolate ' + t('y') + ' in ' + t(s.E1) + '. Keep it exact — no decimals.', isoY(s.T1), key, t(s.b + 'y=' + s.c + '-' + s.a + 'x\\Rightarrow ' + key) + ' (or ' + t(s.si1) + ').', ['Subtract ' + t(s.a + 'x') + ' from both sides, then divide every term by ' + t(s.b) + '.'], 'EP1b isolate', { keys: 'eq', vars: ['x', 'y'], placeholder: 'e.g. y = (5 - 3x)/2' });
            p.good = [s.si1]; p.bad = [s.E1, 'y=' + s.c + '-' + s.a + 'x'];
            return p;
          } },
          { id: 'e1b2', sub: 'b ii', level: 'PRG', make: function (r, s) {
            return ptPart('(b) Substitute ' + t('y=\\frac{' + s.c + '-' + s.a + 'x}{' + s.b + '}') + ' into ' + t(s.E2) + ' and solve the system. Carry every fraction exactly.', s.P, s.sys, {},
              t(s.b + 'x-' + s.a + '\\left(\\frac{' + s.c + '-' + s.a + 'x}{' + s.b + '}\\right)=' + s.f) + '<br>Multiply every term by ' + t(s.b) + ': ' + t((s.b * s.b) + 'x-' + s.a + '(' + s.c + '-' + s.a + 'x)=' + (s.b * s.f)) + '<br>' + t((s.b * s.b + s.a * s.a) + 'x=' + (s.b * s.f + s.a * s.c) + '\\Rightarrow x=' + s.x0) + ', and ' + t('y=\\frac{' + s.c + '-' + s.a + '(' + s.x0 + ')}{' + s.b + '}=' + s.y0) + '. Solution ' + t(ptT(s.P)) + '.',
              ['After substituting, multiply every term by ' + t(s.b) + ' to clear the fraction.'], 'EP1b solve');
          } },
          { id: 'e1c', sub: 'c i', level: 'EMG', make: function (r, s) {
            return numBoxes('(c) <b>By elimination.</b> To eliminate ' + t('y') + ' from ' + both(s.E1, s.E2) + ', state the lowest common multiple of the ' + t('y') + '-coefficients and the two multipliers.', [
              { label: 'LCM:', v: s.Lm, diag: function (v) { return near(v, s.a * s.b * 2) ? { code: 'u8l6-not-lowest', hint: 'That’s a common multiple, but not the <b>lowest</b> one.' } : null; } },
              { label: 'multiply Eq. 1 by', v: s.m1, name: 'Eq. 1', diag: function (v) { return near(v, s.m2) ? { code: 'u8l6-mult-swap', hint: 'Eq. 1 has ' + t(s.b + 'y') + ': it needs ×' + t(s.m1) + ' to reach ' + t(s.Lm + 'y') + '.' } : null; } },
              { label: 'multiply Eq. 2 by', v: s.m2, name: 'Eq. 2', diag: function (v) { return near(v, s.m1) ? { code: 'u8l6-mult-swap', hint: 'Eq. 2 has ' + t('-' + s.a + 'y') + ': it needs ×' + t(s.m2) + ' to reach ' + t('-' + s.Lm + 'y') + '.' } : null; } }],
              'The ' + t('y') + '-coefficients are ' + t(s.b) + ' and ' + t(-s.a) + '; ' + t('\\text{LCM}(' + s.b + ',' + s.a + ')=' + s.Lm) + ', so multiply Eq. 1 by ' + t(s.m1) + ' and Eq. 2 by ' + t(s.m2) + ':<br>' + t(eqT(s.a * s.m1, s.b * s.m1, s.c * s.m1)) + ' and ' + t(eqT(s.b * s.m2, -s.a * s.m2, s.f * s.m2)) + '.',
              ['The ' + t('y') + '-terms are ' + t(s.b + 'y') + ' and ' + t('-' + s.a + 'y') + '. What is the smallest number both ' + t(s.b) + ' and ' + t(s.a) + ' divide into?'], 'EP1c LCM');
          } },
          { id: 'e1c2', sub: 'c ii', level: 'EMG', make: function (r, s) {
            var check = function (resp) {
              resp = resp || []; var a = HW.parse.number(String(resp[0] || '')), b = HW.parse.number(String(resp[1] || ''));
              if (!a.ok || !b.ok) return form('empty', 'Fill in both boxes with numbers.');
              if (near(a.value, s.cx) && near(b.value, s.cr)) return ok();
              if (a.value !== 0 && near(b.value / a.value, s.x0) && isInt(a.value / s.cx)) return ok();
              if (near(a.value, s.a * s.m1 - s.b * s.m2)) return wrong('u8l6-elim-sign', 'The ' + t('y') + '-terms are ' + t('+' + s.Lm + 'y') + ' and ' + t('-' + s.Lm + 'y') + ' — opposites — so <b>add</b> the equations.');
              if (near(a.value, s.cx) && near(b.value, s.c + s.f)) return wrong('u8l6-rhs-unscaled', 'Multiply the right sides too: ' + t(s.c + '\\times ' + s.m1) + ' and ' + t(s.f + '\\times ' + s.m2) + '.');
              if (near(a.value, s.cx)) return wrong('u8l6-elim-rhs', 'The ' + t('x') + '-coefficient is right. Add the two scaled right sides: ' + t(s.c * s.m1 + '+' + (s.f * s.m2 < 0 ? '(' + s.f * s.m2 + ')' : s.f * s.m2)) + '.');
              return wrong('u8l6-elim', null);
            };
            var res = { prompt: '(c) After multiplying (Eq. 1 × ' + t(s.m1) + ', Eq. 2 × ' + t(s.m2) + ') and adding, the ' + t('y') + '-terms are gone. Complete the equation that is left: ' + t('\\square\\,x=\\square') + '. Then solve it.', input: { type: 'fields', fields: [{ label: 'coefficient:', after: t('x') }, { label: '= ' }] }, check: check,
              key: [String(s.cx), String(s.cr)], answer: t(s.cx + 'x=' + s.cr) + ', so ' + t('x=' + s.x0),
              solution: t(eqT(s.a * s.m1, s.b * s.m1, s.c * s.m1)) + '<br>' + t(eqT(s.b * s.m2, -s.a * s.m2, s.f * s.m2)) + '<br>Add: ' + t(s.cx + 'x=' + s.cr + '\\Rightarrow x=' + s.x0) + '. Back-substitute into an original: ' + t(s.a + '(' + s.x0 + ')+' + s.b + 'y=' + s.c + '\\Rightarrow y=' + s.y0) + '. Solution ' + t(ptT(s.P)) + '.',
              hints: ['Add the left sides term by term and the right sides; the ' + t('y') + '-terms cancel.'], text: 'EP1c eliminated equation', bad: [[String(s.a * s.m1 - s.b * s.m2), String(s.cr)]] };
            return res;
          } },
          { id: 'e1d', sub: 'd', level: 'LIM', make: function (r, s) {
            return verifyMC(r, '(d) Graphing, substitution and elimination all gave ' + t(ptT(s.P)) + '. Which work verifies the common answer in <b>both original</b> equations?', s.P, [{ a: s.a, b: s.b, c: s.c }, { a: s.b, b: -s.a, c: s.f }], null,
              'All three methods agree, as they must. Check: ' + t(ck(subT(s.a, s.b, s.P) + '=' + s.c)) + ' and ' + t(ck(subT(s.b, -s.a, s.P) + '=' + s.f)) + '.', 'EP1d verify');
          } },
          { id: 'e1e', sub: 'e', level: 'EMG', make: function (r, s) {
            var m1 = '-\\frac{' + s.a + '}{' + s.b + '}', m2 = '\\frac{' + s.b + '}{' + s.a + '}';
            return mc(r, '(e) The slopes are ' + t(m1) + ' and ' + t(m2) + '. How many solutions does the system have, and what does the <b>product</b> of the two slopes tell you?', [
              { html: '<b>One solution</b> (the slopes differ). The product is ' + t('-1') + ', so the lines are <b>perpendicular</b>.', right: true },
              { html: '<b>One solution</b> (the slopes differ). The product is ' + t('-1') + ', so the lines are <b>parallel</b>.', why: 'Parallel lines have <b>equal</b> slopes — and they wouldn’t cross. A product of ' + t('-1') + ' means negative reciprocals.' },
              { html: '<b>No solution</b>, because the product of the slopes is negative.', why: 'The number of solutions depends on whether the slopes are equal. These differ, so the lines cross exactly once.' },
              { html: '<b>One solution</b>. The product is ' + t('-1') + ', so the lines cross at the origin.', why: 'The product of the slopes says nothing about <i>where</i> the lines cross — they cross at ' + t(ptT(s.P)) + '. A product of ' + t('-1') + ' means they meet at right angles.' }],
              'The slopes ' + t(m1) + ' and ' + t(m2) + ' are different, so the lines meet at one point: <b>one solution</b>. Product: ' + t('\\left(' + m1 + '\\right)\\left(' + m2 + '\\right)=-1') + ', so the lines are <b>perpendicular</b>.',
              ['Different slopes → the lines cross once. Slopes that multiply to ' + t('-1') + ' are negative reciprocals.'], 'EP1e slopes product');
          } },
          { id: 'e1f', sub: 'f i', level: 'EMG', make: function (r, s) {
            return mc(r, '(f) Which of the three methods suited ' + both(s.E1, s.E2) + ' best, and why?', [
              { html: '<b>Elimination</b> — no coefficient is ' + t(1) + ', so isolating any variable creates fractions, while scaling the equations (×' + t(s.m1) + ', ×' + t(s.m2) + ') is clean.', right: true },
              { html: '<b>Substitution</b> — ' + t('x') + ' has coefficient ' + t(1) + ' in one equation.', why: 'Check: the ' + t('x') + '-coefficients are ' + t(s.a) + ' and ' + t(s.b) + '. Isolating anything here gives a fraction.' },
              { html: '<b>Graphing</b> — a graph always gives the exact answer.', why: 'Graphing worked only because the crossing point happened to be a grid point. A slope like ' + t('-\\frac{' + s.a + '}{' + s.b + '}') + ' is easy to draw one square wrong.' },
              { html: '<b>Substitution</b> — ' + t('y') + ' is already isolated.', why: 'Neither equation is solved for ' + t('y') + ' — that took a rearrangement with fractions.' }],
              '<b>Elimination.</b> Every coefficient is ' + t(s.a) + ' or ' + t(s.b) + ', so isolating a variable gives a fraction right away (substitution needed an extra “multiply through” step). Graphing worked only because the crossing landed on a grid point.',
              METHOD_HINT, 'EP1f best method');
          } },
          { id: 'e1f2', sub: 'f ii', level: 'EMG', make: function (r, s) {
            var nx = s.x0 - s.a * s.y0;
            return mc(r, '(f) Which change to the system ' + both(s.E1, s.E2) + ' would make <b>substitution</b> the better choice?', [
              { html: 'Change the second equation to ' + t(eqT(1, -s.a, nx)) + ', so ' + t('x') + ' has coefficient ' + t(1) + '.', right: true },
              { html: 'Change the right side of the first equation from ' + t(s.c) + ' to ' + t(s.c + 1) + '.', why: 'Changing a constant doesn’t change any coefficient, so isolating a variable would still give fractions.' },
              { html: 'Multiply the first equation by ' + t(2) + '.', why: t(eqT(2 * s.a, 2 * s.b, 2 * s.c)) + ' has even bigger coefficients — no variable is any easier to isolate.' },
              { html: 'Write the two equations in the other order.', why: 'The order doesn’t change any coefficient. Substitution needs a variable with coefficient ' + t(1) + ' (or one already isolated).' }],
              'Substitution is fastest when a variable has coefficient ' + t(1) + ' or ' + t(-1) + ' or is already isolated. With ' + t(eqT(1, -s.a, nx)) + ', ' + t('x=' + nx + sg(s.a) + 'y') + ' costs nothing. (If the question asked only roughly where the lines meet, graphing would be enough.)',
              METHOD_HINT, 'EP1f change');
          } }] },
      /* ---------------- EP 2 ---------------- */
      { num: '2', section: 'Extra practice B — Choosing a Method', stem: 'For each system, state which method — graphing, substitution, or elimination — you would use, and the reason that refers to the actual coefficients. <b>Do not solve these here.</b>', parts: ['A', 'B', 'C', 'D'].map(function (kind, i) {
        var sub = 'abcd'[i];
        return { id: 'e2' + sub, sub: sub, level: 'EMG', make: function (r) {
          var s = ep2(r, kind);
          var sol = { A: '<b>Substitution.</b> ' + t('y') + ' is already isolated in ' + t(s.E1) + ', so its expression drops straight into the other equation with no rearranging.',
            B: '<b>Elimination, by subtracting.</b> Both equations contain exactly ' + t(s.ax[0] + 'x') + ', so Eq. 1 − Eq. 2 removes ' + t('x') + ' with no scaling.',
            C: '<b>Substitution.</b> ' + t('x') + ' has coefficient ' + t(1) + ' in ' + t(s.E1) + ', so isolating it costs no division and leaves no fraction.',
            D: '<b>Elimination, scaling both.</b> No coefficient is ' + t(1) + ' and none divides its partner, so multiply both equations to reach the LCM of one variable’s coefficients.' }[kind];
          return mc(r, '(' + sub + ') ' + both(s.E1, s.E2), methodOpts(kind, s), sol, METHOD_HINT, 'EP2 method ' + kind);
        } };
      }) },
      /* ---------------- EP 3 ---------------- */
      { num: '3', stem: 'Solve each system by the method that suits it, and verify the solution in <b>both</b> of its original equations.', parts: ['A', 'B', 'C', 'D'].map(function (kind, i) {
        var sub = 'abcd'[i];
        return { id: 'e3' + sub, sub: sub, level: { A: 'EMG', B: 'BEG', C: 'EMG', D: 'PRG' }[kind], make: function (r) {
          var s = ep2(r, kind);
          return ptPart('(' + sub + ') ' + both(s.E1, s.E2), [s.x0, s.y0], s.sys, {}, s.sol + '<br>Solution ' + t(ptT([s.x0, s.y0])) + '. Check it in both equations.', METHOD_HINT, 'EP3 solve ' + kind);
        } };
      }).concat([
        { id: 'e3e', sub: 'e i', level: 'EMG', make: function (r) {
          var s = ep2(r, 'B'), T1 = { A: s.sys[0][0], B: s.sys[0][1], C: s.sys[0][2] }, T2 = { A: s.sys[1][0], B: s.sys[1][1], C: s.sys[1][2] };
          var k1 = Ln.tex(T1, 'slope-intercept'), k2 = Ln.tex(T2, 'slope-intercept');
          return eqBoxes('(e) The system ' + both(s.E1, s.E2) + ' has the lattice-point solution ' + t(ptT([s.x0, s.y0])) + '. Write both of its equations in slope–intercept form.', [{ label: t(s.E1) + ':', T: T1, keyTex: k1, form: 'slope-intercept' }, { label: t(s.E2) + ':', T: T2, keyTex: k2, form: 'slope-intercept' }], {},
            t(s.E1 + '\\Rightarrow ' + k1) + '<br>' + t(s.E2 + '\\Rightarrow ' + k2), ['Move the ' + t('x') + '-term across, then divide every term by the coefficient of ' + t('y') + '.'], 'EP3e slope-intercept');
        } },
        { id: 'e3e2', sub: 'e ii', level: 'EMG', make: function (r) {
          var s = ep2(r, 'B'), T1 = { A: s.sys[0][0], B: s.sys[0][1], C: s.sys[0][2] }, T2 = { A: s.sys[1][0], B: s.sys[1][1], C: s.sys[1][2] };
          var k1 = Ln.tex(T1, 'slope-intercept'), k2 = Ln.tex(T2, 'slope-intercept'), b1 = -T1.C / T1.B, b2 = -T2.C / T2.B;
          return mc(r, '(e) ' + t(s.E1 + '\\Rightarrow ' + k1) + ' and ' + t(s.E2 + '\\Rightarrow ' + k2) + '. The solution, ' + t(ptT([s.x0, s.y0])) + ', is a lattice point, yet graphing would still have been a poor choice. Why?', [
              { html: 'Both ' + t('y') + '-intercepts, ' + t(fx(b1)) + ' and ' + t(fx(b2)) + ', fall between grid lines and the slopes are fractions, so neither line can be placed accurately by eye.', right: true },
              { html: 'The solution is not a lattice point, so a graph can’t show it.', why: 'It is a lattice point: ' + t(ptT([s.x0, s.y0])) + '. The trouble is drawing the lines accurately in the first place.' },
              { html: 'The two lines are parallel, so they never cross.', why: 'The slopes are different, so the lines do cross — exactly once.' },
              { html: 'A graph can never give an exact answer, even at a lattice point.', why: 'A graph <i>can</i> show a lattice point exactly — if both lines are drawn accurately. What makes these two lines hard to draw?' }],
            'The ' + t('y') + '-intercepts ' + t(fx(b1)) + ' and ' + t(fx(b2)) + ' sit between grid lines, and fractional slopes are easy to misdraw by one square — which moves the apparent crossing point. A lattice-point answer makes a graph <i>possible</i>, not <i>easy</i>; subtracting the equations is faster and exact.',
            ['Look at where each line meets the ' + t('y') + '-axis, and at the slopes.'], 'EP3e why not graph');
        } }]) },
      /* ---------------- EP 4 ---------------- */
      { num: '4', stem: function (s) { return 'Two candles are lit at the same moment. The taller one starts at ' + t(s.H1) + ' cm and burns down ' + t(num(s.r1)) + ' cm every hour; the shorter one starts at ' + t(s.H2) + ' cm and burns down ' + t(num(s.r2)) + ' cm every hour. Let ' + t('t') + ' be the time in hours since they were lit and ' + t('h') + ' the height of a candle in centimetres. A stage manager only needs to know, <i>roughly</i>, when the two candles will look the same height.'; },
        shared: function (r) {
          var book = { H1: 25, r1: 4, H2: 18, r2: 2.5 };
          var s = r.chance(0.2) ? book : find(function () {
            var H1 = r.int(20, 28), r1 = r.pick([3, 3.5, 4, 4.5, 5]), H2 = r.int(12, H1 - 4), r2 = r.pick([1.5, 2, 2.5, 3]);
            if (r1 - r2 < 1) return null; var ts = (H1 - H2) / (r1 - r2), hs = H1 - r1 * ts;
            if (isInt(ts) || isInt(hs) || ts < 3 || ts > 7 || hs < 1.5 || Math.abs((2 * ts) % 1 - 0.5) < 0.15 || Math.abs(hs % 1 - 0.5) < 0.15) return null;
            return { H1: H1, r1: r1, H2: H2, r2: r2 };
          }, book);
          s.ts = (s.H1 - s.H2) / (s.r1 - s.r2); s.hs = s.H1 - s.r1 * s.ts;
          s.tF = Ln.toFr(s.ts); s.hF = Ln.toFr(s.hs);
          s.e1 = 'h=' + s.H1 + '-' + num(s.r1) + 't'; s.e2 = 'h=' + s.H2 + '-' + num(s.r2) + 't';
          s.T1 = { A: 2 * s.r1, B: 2, C: -2 * s.H1 }; s.T2 = { A: 2 * s.r2, B: 2, C: -2 * s.H2 };   // (t, h) as (x, y)
          return s;
        },
        parts: [
          { id: 'e4a', sub: 'a i', level: 'EMG', make: function (r, s) {
            return eqBoxes('(a) Write an equation for each candle.', [{ label: 'taller:', T: s.T1, keyTex: s.e1, wrong: [{ is: { A: -2 * s.r1, B: 2, C: -2 * s.H1 }, code: 'u8l6-rate-sign', hint: 'The candle gets <b>shorter</b>: its height goes down ' + t(num(s.r1)) + ' cm each hour, so the slope is negative.' }] },
              { label: 'shorter:', T: s.T2, keyTex: s.e2, wrong: [{ is: { A: -2 * s.r2, B: 2, C: -2 * s.H2 }, code: 'u8l6-rate-sign', hint: 'The candle gets <b>shorter</b>: its height goes down ' + t(num(s.r2)) + ' cm each hour, so the slope is negative.' }] }], { vars: ['t', 'h'] },
              'Each starts at its initial height (the ' + t('h') + '-intercept) and loses its burn rate every hour (a negative slope):<br>taller: ' + t(s.e1) + '<br>shorter: ' + t(s.e2),
              ['height = starting height − (burn rate) × (hours).'], 'EP4a equations');
          } },
          { id: 'e4a2', sub: 'a ii', level: 'EMG', make: function (r, s) {
            var win = [[0, 8], [0, 28]];
            var seg = function (H, rt) { var pts = []; for (var tt = 0; tt <= 8; tt++) { var h = H - rt * tt; if (h >= 0 && isInt(h)) pts.push([tt, rd(h)]); } return { v: [pts[0], pts[pts.length - 1]], s: 'closed', e: 'closed' }; };
            var key = { pts: [], pieces: [seg(s.H1, s.r1), seg(s.H2, s.r2)], join: 'none' };
            var Lt = line(2 * s.r1, 2, -2 * s.H1), Ls2 = line(2 * s.r2, 2, -2 * s.H2);
            var check = lineSetCheck([Lt, Ls2], ['the taller candle (' + t(s.e1) + ')', 'the shorter candle (' + t(s.e2) + ')'], [
              { Lo: line(-2 * s.r1, 2, -2 * s.H1), code: 'u8l6-rate-sign', hint: 'The candles burn <b>down</b>: each line should fall from left to right.' },
              { Lo: line(-2 * s.r2, 2, -2 * s.H2), code: 'u8l6-rate-sign', hint: 'The candles burn <b>down</b>: each line should fall from left to right.' },
              { Lo: line(2 * s.r2, 2, -2 * s.H1), code: 'u8l6-rate-swap', hint: 'Check which rate goes with which candle: the taller one burns ' + t(num(s.r1)) + ' cm per hour.' }]);
            var p = K.P.graph('(a) Graph both candles on the grid: ' + t(s.e1) + ' and ' + t(s.e2) + '. (One grid square is ' + t(1) + ' h across and ' + t(2) + ' cm up; you can tap every ' + t(1) + ' cm.)',
              { x: win[0], y: win[1], grid: 1, gridY: 2, snapX: 1, snapY: 1, labelsX: 2, labelsY: 4, unitX: 34, unitY: 11, xName: 't', yName: 'h', xTitle: 't (hours)', yTitle: 'h (cm)', mode: 'lines', defaultEnd: 'closed', firstQuadrant: true, max: 360 },
              check, key, 'Taller: start at ' + t('(0,\\ ' + s.H1 + ')') + ' and drop ' + t(num(s.r1)) + ' cm per hour, e.g. through ' + t(ptD(key.pieces[0].v[1])) + '.<br>Shorter: start at ' + t('(0,\\ ' + s.H2 + ')') + ' and drop ' + t(num(s.r2)) + ' cm per hour, e.g. through ' + t(ptD(key.pieces[1].v[1])) + '.',
              ['Plot each starting height on the ' + t('h') + '-axis, then find the height after ' + t(2) + ' hours.'], 'EP4a graph');
            p.bad = [{ pts: [], pieces: [key.pieces[0]], join: 'none' }, { pts: [], pieces: [{ v: [[0, s.H1], [2, s.H1 + 2 * s.r1]], s: 'closed', e: 'closed' }, key.pieces[1]], join: 'none' }];
            return p;
          } },
          { id: 'e4b', sub: 'b', level: 'EMG', make: function (r, s) {
            var tk = Math.round(s.ts * 2) / 2, hk = Math.round(s.hs);
            var ct = function (resp) { var p = HW.parse.number(String(resp)); if (!p.ok) return form('empty', 'Type the time as a number of hours.'); if (!isInt(p.value * 2)) return form('u8l6-half', 'Give the time to the nearest <b>half</b> hour (e.g. ' + t('4.5') + ').'); if (Math.abs(p.value - s.ts) <= 0.5 + 1e-9) return ok(); return wrong('u8l6-estimate', 'Look again at where the two lines cross: read straight down to the ' + t('t') + '-axis.'); };
            var ch = function (resp) { var p = HW.parse.number(String(resp)); if (!p.ok) return form('empty', 'Type the height as a number of centimetres.'); if (!isInt(p.value)) return form('round', 'Give the height to the nearest centimetre.'); if (Math.abs(p.value - s.hs) <= 1.5) return ok(); return wrong('u8l6-estimate', 'Read across from the crossing point to the ' + t('h') + '-axis.'); };
            return numBoxes('(b) From your graph, estimate when the candles are the same height, to the nearest half hour, and estimate that common height to the nearest centimetre.', [
              { label: 'time:', after: 'hours', v: tk, check: ct }, { label: 'height:', after: 'cm', v: hk, check: ch }],
              'The lines cross a little ' + (s.ts > tk ? 'after' : 'before') + ' ' + t(tk) + ' h, at a height of about ' + t(hk) + ' cm. <b>About ' + tk + ' hours after being lit, both candles are about ' + hk + ' cm tall.</b> (Any reading within half an hour and about a centimetre is a fair estimate.)',
              ['Find the crossing point of the two lines and read each coordinate off its axis.'], 'EP4b estimate', { bad: [['9', '0']] });
          } },
          { id: 'e4c', sub: 'c', level: 'EMG', make: function (r) {
            return mc(r, '(c) Lesson 1 warned that graphs give only estimates. Why is a graph still an entirely reasonable tool for the stage manager?', [
              { html: 'She asked only <i>roughly</i> when, and a graph answers that in one reading; its limitation (no exact value between grid lines) costs her nothing.', right: true },
              { html: 'A graph always gives the exact crossing point.', why: 'Not here: the lines cross between grid lines, so the graph gives only an estimate. Why is an estimate good enough for her?' },
              { html: 'Algebra can’t solve this system, because the rates are decimals.', why: 'Algebra handles decimals fine — part (d) does it. The point is that she doesn’t need an exact answer.' },
              { html: 'The candles never reach the same height, so only a graph can show it.', why: 'They do reach the same height — the lines cross. The question is why an estimate is enough.' }],
              'The question itself asks for nothing better than an estimate. A graph is untrustworthy only when an exact answer is demanded and the crossing falls between grid lines.', ['What exactly did the stage manager ask for?'], 'EP4c why graph');
          } },
          { id: 'e4d', sub: 'd', level: 'PRG', make: function (r, s) {
            var tT = frT(s.tF[0], s.tF[1]), hT = frT(s.hF[0], s.hF[1]);
            return { prompt: '(d) Now find the exact answer algebraically. Give both values as fractions in lowest terms.', input: { type: 'fields', fields: [{ label: 'time:', mode: 'math', keys: 'fraction', after: 'hours' }, { label: 'height:', mode: 'math', keys: 'fraction', after: 'cm' }] },
              check: K.fields([K.fraction(s.tF, { diag: function (v) { return Math.abs(v - s.hs) < 1e-9 ? { code: 'u8l6-gave-h', hint: 'That’s the common height. The time is the value of ' + t('t') + '.' } : null; } }), K.fraction(s.hF)], { labels: ['time', 'height'] }), key: [tT, hT],
              answer: t('t=' + tT) + ' h, ' + t('h=' + hT) + ' cm',
              solution: 'Set the heights equal: ' + t(s.H1 + '-' + num(s.r1) + 't=' + s.H2 + '-' + num(s.r2) + 't\\Rightarrow ' + (s.H1 - s.H2) + '=' + num(rd(s.r1 - s.r2)) + 't') + '<br>' + t('t=\\frac{' + (s.H1 - s.H2) + '}{' + num(rd(s.r1 - s.r2)) + '}=' + tT) + ' h ' + t('\\approx ' + rd(s.ts, 2)) + ' h, and ' + t('h=' + s.H1 + '-' + num(s.r1) + '\\left(' + tT + '\\right)=' + hT) + ' cm ' + t('\\approx ' + rd(s.hs, 2)) + ' cm.<br>Check in the other equation: ' + t(ck(s.H2 + '-' + num(s.r2) + '\\left(' + tT + '\\right)=' + hT)) + '. A half-hour estimate of ' + t(Math.round(s.ts * 2) / 2) + ' h is off by ' + t(rd(Math.abs(s.ts - Math.round(s.ts * 2) / 2) * 60, 0)) + ' minutes.',
              hints: ['Set the two expressions for ' + t('h') + ' equal and solve for ' + t('t') + '. Multiply by ' + t(2) + ' first if the decimals bother you.'], text: 'EP4d exact', bad: [[rd(s.ts, 2).toString(), rd(s.hs, 2).toString()]] };
          } }] },
      /* ---------------- EP 5 ---------------- */
      { num: '5', section: 'Extra practice C — Classifying and Solving for a Parameter', stem: function (s) { return 'In the system ' + both(s.E1, s.E2) + ', ' + t('k') + ' is a constant.'; },
        shared: function (r) {
          var book = { a: 3, b: 4, m: 2, y1: -1, d: 5 };
          var s = r.chance(0.2) ? book : find(function () {
            var a = r.int(2, 5), b = r.int(2, 5), m = r.pick([2, 2, 3]), y1 = nz(r, -3, 3), d = nz(r, -9, 9), c = a - b * y1;
            if (c === 0 || m * c + d === 0 || gcd(a, b) !== 1 || m * c + d - m * a === 0) return null;
            return { a: a, b: b, m: m, y1: y1, d: d };
          }, book);
          s.c = s.a - s.b * s.y1; s.N = s.m * s.c + s.d; s.ma = s.m * s.a; s.k1 = s.N - s.ma;
          s.E1 = eqT(s.a, -s.b, s.c); s.E2 = 'kx+' + (s.m * s.b) + 'y=' + s.d; return s;
        },
        parts: [
          { id: 'e5a', sub: 'a', level: 'PRG', make: function (r, s) {
            return numBoxes('(a) Eliminate ' + t('y') + '. The system reduces to an equation of the form ' + t('(k+\\square)\\,x=\\square') + '. Fill in the two boxes.', [
              { label: t('(k+\\square)') + ':', v: s.ma, name: 'first box', diag: function (v) { return near(v, s.a) ? { code: 'u8l6-rhs-unscaled', hint: 'Multiply <b>every</b> term of ' + t(s.E1) + ' by ' + t(s.m) + ' — the ' + t('x') + '-term becomes ' + t(s.ma + 'x') + '.' } : near(v, -s.ma) ? { code: 'u8l6-elim-sign', hint: 'The ' + t('y') + '-terms are ' + t('-' + (s.m * s.b) + 'y') + ' and ' + t('+' + (s.m * s.b) + 'y') + ': add the equations.' } : null; } },
              { label: t('=\\square') + ':', v: s.N, name: 'second box', diag: function (v) { return near(v, s.c + s.d) ? { code: 'u8l6-rhs-unscaled', hint: 'Scale the right side too: ' + t(s.c + '\\times ' + s.m + '=' + (s.m * s.c)) + '.' } : near(v, s.m * s.c - s.d) ? { code: 'u8l6-elim-sign', hint: 'You are adding the equations, so add the right sides: ' + t((s.m * s.c) + sg(s.d)) + '.' } : null; } }],
              'The ' + t('y') + '-coefficients are ' + t(-s.b) + ' and ' + t(s.m * s.b) + '; multiply Eq. 1 by ' + t(s.m) + ':<br>' + t(eqT(s.ma, -s.m * s.b, s.m * s.c)) + '<br>Add ' + t(s.E2) + ': ' + t(s.ma + 'x+kx=' + (s.m * s.c) + sg(s.d)) + ', so ' + t('(k+' + s.ma + ')x=' + s.N) + '.',
              ['Make the ' + t('y') + '-terms opposites (multiply the first equation), then add.'], 'EP5a reduce', { bad: [[String(s.a), String(s.N)]] });
          } },
          { id: 'e5b', sub: 'b', level: 'ADV', make: function (r, s) {
            return K.P.number('(b) The system reduces to ' + t('(k+' + s.ma + ')x=' + s.N) + '. Determine the value of ' + t('k') + ' for which the system has <b>no solution</b>.', -s.ma, function (v) {
              if (near(v, s.ma)) return { code: 'sign', hint: 'You need ' + t('k+' + s.ma + '=0') + '. Solve that for ' + t('k') + ' — watch the sign.' };
              if (near(v, s.k1)) return { code: 'u8l6-k-x1', hint: 'That value makes ' + t('x=1') + ' — there is a solution. No solution needs the left side to vanish: ' + t('k+' + s.ma + '=0') + '.' };
              return null;
            }, 'No solution needs the left side to vanish while the right does not: ' + t('k+' + s.ma + '=0\\Rightarrow k=' + (-s.ma)) + ', leaving ' + t('0=' + s.N) + ', which is never true.<br>Slopes: ' + t(s.E1) + ' has slope ' + t(fx(s.a / s.b)) + '; with ' + t('k=' + (-s.ma)) + ', ' + t((-s.ma) + 'x+' + (s.m * s.b) + 'y=' + s.d) + ' has slope ' + t(fx(s.ma / (s.m * s.b))) + ' — equal slopes, different intercepts: parallel and distinct.',
            ['When is ' + t('(k+' + s.ma + ')x=' + s.N) + ' impossible for every ' + t('x') + '?'], 'EP5b no solution k');
          } },
          { id: 'e5c', sub: 'c', level: 'PRG', make: function (r, s) {
            return mc(r, '(c) The system reduces to ' + t('(k+' + s.ma + ')x=' + s.N) + '. Why does <b>no</b> value of ' + t('k') + ' give infinitely many solutions?', [
              { html: 'Infinitely many needs ' + t('0=0') + ': both ' + t('k+' + s.ma + '=0') + ' <b>and</b> ' + t(s.N + '=0') + '. The right side is ' + t(s.N) + ' whatever ' + t('k') + ' is, so the constants can never be proportional.', right: true },
              { html: 'Because ' + t('k=' + (-s.ma)) + ' makes the slopes different.', why: 'With ' + t('k=' + (-s.ma)) + ' the slopes are <b>equal</b> (that’s what makes the left side vanish). Look at the right side.' },
              { html: 'Because ' + t('k') + ' would have to be ' + t(0) + '.', why: 'With ' + t('k=0') + ' the equation is ' + t(s.ma + 'x=' + s.N) + ' — one solution. Infinitely many would need ' + t('0=0') + '.' },
              { html: 'It does: ' + t('k=' + (-s.ma)) + ' gives infinitely many solutions.', why: 'With ' + t('k=' + (-s.ma)) + ' you get ' + t('0=' + s.N) + ' — a false statement, so <b>no</b> solution.' }],
              'Infinitely many solutions would need ' + t('(k+' + s.ma + ')x=' + s.N) + ' to collapse to ' + t('0=0') + ', i.e. ' + t('k+' + s.ma + '=0') + ' and ' + t(s.N + '=0') + '. The constant ' + t(s.N) + ' never changes, so that can’t happen: ' + t('k') + ' can make the coefficients proportional, but nothing can make the constants proportional too.',
              ['What would the reduced equation have to look like for infinitely many solutions?'], 'EP5c no k for infinite');
          } },
          { id: 'e5d', sub: 'd i', level: 'ADV', make: function (r, s) {
            return K.P.number('(d) The system reduces to ' + t('(k+' + s.ma + ')x=' + s.N) + '. Determine the value of ' + t('k') + ' for which the ' + t('x') + '-coordinate of the solution is ' + t(1) + '.', s.k1, function (v) {
              if (near(v, s.N)) return { code: 'u8l6-k-solve', hint: 'With ' + t('x=1') + ': ' + t('k+' + s.ma + '=' + s.N) + '. Now subtract ' + t(s.ma) + '.' };
              if (near(v, s.N + s.ma)) return { code: 'sign', hint: t('k+' + s.ma + '=' + s.N) + ': subtract ' + t(s.ma) + ' from both sides.' };
              return null;
            }, t('(k+' + s.ma + ')(1)=' + s.N + '\\Rightarrow k=' + s.N + '-' + s.ma + '=' + s.k1) + '.', ['Substitute ' + t('x=1') + ' into the reduced equation.'], 'EP5d k for x=1');
          } },
          { id: 'e5d2', sub: 'd ii', level: 'PRG', make: function (r, s) {
            var E2 = eqT(s.k1, s.m * s.b, s.d);
            return ptPart('(d) With ' + t('k=' + s.k1) + ' the system is ' + both(s.E1, E2) + ', and ' + t('x=1') + '. State the complete solution.', [1, s.y1], [L(s.a, -s.b, s.c), L(s.k1, s.m * s.b, s.d)], {},
              t(s.a + '(1)-' + s.b + 'y=' + s.c + '\\Rightarrow -' + s.b + 'y=' + (s.c - s.a) + '\\Rightarrow y=' + s.y1) + '. Solution ' + t(ptT([1, s.y1])) + '.<br>Check: ' + t(ck(subT(s.a, -s.b, [1, s.y1]) + '=' + s.c)) + ', ' + t(ck(subT(s.k1, s.m * s.b, [1, s.y1]) + '=' + s.d)) + '.',
              ['Substitute ' + t('x=1') + ' into the first equation to find ' + t('y') + '.'], 'EP5d solution');
          } }] },
      /* ---------------- EP 6 ---------------- */
      { num: '6', stem: function (s) { return 'In the system ' + both(s.E1, s.E2) + ', both ' + t('k') + ' and ' + t('c') + ' are constants.'; },
        shared: function (r) {
          var book = { u: 5, v: 2, al: 2, bb: 3, ee: 5 };
          var s = r.chance(0.2) ? book : find(function () {
            var uv = r.pick([[5, 2], [3, 2], [4, 3], [5, 3], [3, 4], [5, 4]]), al = r.pick([1, 2]), bb = r.int(1, 4), ee = r.int(1, 5);
            var a = uv[1] * al, p = uv[0] * al, b = uv[1] * bb, e = uv[1] * ee; if (a < 2 || b === a || e === b || a + b > 14) return null;
            return { u: uv[0], v: uv[1], al: al, bb: bb, ee: ee };
          }, book);
          s.a = s.v * s.al; s.p = s.u * s.al; s.b = s.v * s.bb; s.e = s.v * s.ee;   // booklet: 4x + 6y = 10, 10x + ky = c
          s.Lm = lcm(s.a, s.p); s.ma = s.Lm / s.a; s.mp = s.Lm / s.p;            // Eq.1 × ma, Eq.2 × mp, subtract
          s.kInf = s.b * s.u / s.v; s.cInf = s.e * s.u / s.v; s.qT = frT(s.u, s.v);
          s.E1 = eqT(s.a, s.b, s.e); s.E2 = s.p + 'x+ky=c';
          s.red = '(' + (s.b * s.ma) + '-' + (s.mp === 1 ? '' : s.mp) + 'k)\\,y=' + (s.e * s.ma) + '-' + (s.mp === 1 ? '' : s.mp) + 'c';
          return s;
        },
        parts: [
          { id: 'e6a', sub: 'a', level: 'PRG', make: function (r, s) {
            var want = [s.b * s.ma, s.mp, s.e * s.ma, s.mp];
            var check = function (resp) {
              resp = resp || []; var v = [0, 1, 2, 3].map(function (i) { var q = HW.parse.number(String(resp[i] || '')); return q.ok ? q.value : null; });
              if (v.some(function (x) { return x == null; })) return form('empty', 'Fill in all four boxes with numbers.');
              var lam = v[1] / want[1];
              if (lam > 0 && v.every(function (x, i) { return near(x, lam * want[i]); })) return ok();
              if (near(v[0], s.b) || near(v[2], s.e)) return wrong('u8l6-rhs-unscaled', 'Scale <b>every</b> term of the first equation: ×' + t(s.ma) + ' gives ' + t(eqT(s.a * s.ma, s.b * s.ma, s.e * s.ma)) + '.');
              return wrong('u8l6-elim', 'Make the ' + t('x') + '-coefficients equal (' + t(s.Lm) + '): multiply the first equation by ' + t(s.ma) + ' and the second by ' + t(s.mp) + ', then subtract.');
            };
            return { prompt: '(a) Eliminate ' + t('x') + '. The system reduces to ' + t('(\\square-\\square k)\\,y=\\square-\\square c') + '. Fill in the four numbers.', input: { type: 'fields', fields: [{ label: t('(\\square') + ':' }, { label: t('-\\square k)') + ':' }, { label: t('y=\\square') + ':' }, { label: t('-\\square c') + ':' }] }, check: check,
              key: want.map(String), answer: t(s.red), bad: [[String(s.b), String(s.mp), String(s.e), String(s.mp)]],
              solution: 'The ' + t('x') + '-coefficients are ' + t(s.a) + ' and ' + t(s.p) + '; ' + t('\\text{LCM}=' + s.Lm) + '.<br>' + t('\\text{Eq.~1}\\times ' + s.ma + ':\\ ' + eqT(s.Lm, s.b * s.ma, s.e * s.ma)) + '<br>' + t('\\text{Eq.~2}\\times ' + s.mp + ':\\ ' + s.Lm + 'x+' + (s.mp === 1 ? '' : s.mp) + 'ky=' + (s.mp === 1 ? '' : s.mp) + 'c') + '<br>Subtract: ' + t(s.red) + '.',
              hints: ['Multiply each equation so both have ' + t(s.Lm + 'x') + ', then subtract.'], text: 'EP6a reduce' };
          } },
          { id: 'e6b', sub: 'b', level: 'ADV', make: function (r, s) {
            return { prompt: '(b) The system reduces to ' + t(s.red) + '. Determine the values of ' + t('k') + ' and ' + t('c') + ' for which the system has <b>infinitely many solutions</b>, and the multiplier that links the two equations.', input: { type: 'fields', fields: [{ label: t('k=') }, { label: t('c=') }, { label: 'multiplier:', mode: 'math', keys: 'fraction' }] },
              check: K.fields([K.number(s.kInf), K.number(s.cInf, function (v) { return near(v, s.e) ? { code: 'u8l6-const', hint: 'Both sides must vanish: ' + t((s.e * s.ma) + '-' + (s.mp === 1 ? '' : s.mp) + 'c=0') + '.' } : null; }), K.fraction([s.u, s.v], { decimalOk: true })], { labels: ['k', 'c', 'multiplier'] }),
              key: [String(s.kInf), String(s.cInf), s.qT], answer: t('k=' + s.kInf) + ', ' + t('c=' + s.cInf) + ', multiplier ' + t(s.qT),
              solution: 'Infinitely many needs ' + t('0=0') + ': ' + t((s.b * s.ma) + '-' + (s.mp === 1 ? '' : s.mp) + 'k=0\\Rightarrow k=' + s.kInf) + ' and ' + t((s.e * s.ma) + '-' + (s.mp === 1 ? '' : s.mp) + 'c=0\\Rightarrow c=' + s.cInf) + '.<br>The second equation is then ' + t(eqT(s.p, s.kInf, s.cInf)) + ', which is ' + t(s.qT) + ' times ' + t(s.E1) + ' — the same line written twice.',
              hints: ['Both brackets must be zero: the coefficient of ' + t('y') + ' <b>and</b> the right side.', 'The multiplier turns ' + t(s.a + 'x') + ' into ' + t(s.p + 'x') + '.'], text: 'EP6b infinite k, c', bad: [[String(s.kInf), String(s.e), s.qT]] };
          } },
          { id: 'e6c', sub: 'c', level: 'PRG', make: function (r, s) {
            var K0 = s.kInf, C0 = s.cInf;
            return mc(r, '(c) Using ' + t(s.red) + ' (not the slopes), which conditions give <b>no solution</b> and <b>one solution</b>?', [
              { html: 'No solution: ' + t('k=' + K0) + ' and ' + t('c\\neq ' + C0) + '. One solution: ' + t('k\\neq ' + K0) + ' (any ' + t('c') + ').', right: true },
              { html: 'No solution: ' + t('k\\neq ' + K0) + '. One solution: ' + t('k=' + K0) + '.', why: 'When ' + t('k\\neq ' + K0) + ' the bracket on the left isn’t zero, so you can divide by it: exactly one ' + t('y') + '.' },
              { html: 'No solution: ' + t('k=' + K0) + ' and ' + t('c=' + C0) + '. One solution: ' + t('k\\neq ' + K0) + '.', why: 'With ' + t('k=' + K0) + ' and ' + t('c=' + C0) + ' both sides are ' + t(0) + ': ' + t('0=0') + ', infinitely many.' },
              { html: 'No solution: ' + t('k=' + K0) + ' and ' + t('c\\neq ' + C0) + '. One solution: ' + t('k\\neq ' + K0) + ' and ' + t('c\\neq ' + C0) + '.', why: 'If ' + t('k\\neq ' + K0) + ', then ' + t('y=\\frac{\\text{right side}}{\\text{left bracket}}') + ' exists whatever ' + t('c') + ' is — even ' + t('c=' + C0) + '.' }],
              '<b>No solution:</b> the left bracket is ' + t(0) + ' but the right side isn’t: ' + t('k=' + K0) + ' and ' + t('c\\neq ' + C0) + ' (the equation becomes ' + t('0=\\text{non-zero}') + ').<br><b>One solution:</b> the left bracket isn’t ' + t(0) + ': ' + t('k\\neq ' + K0) + ', and then ' + t('c') + ' may be anything.',
              ['Ask: when is the bracket on the left zero? Then look at the right side.'], 'EP6c conditions');
          } },
          { id: 'e6d', sub: 'd', level: 'PRG', make: function (r, s) {
            var K0 = s.kInf, C0 = s.cInf;
            return mc(r, '(d) The system reduces to ' + t(s.red) + '. A classmate says “if ' + t('k=' + K0) + ' then the system has no solution.” When is the classmate right?', [
              { html: 'Right whenever ' + t('c\\neq ' + C0) + '; wrong when ' + t('c=' + C0) + ', where there are infinitely many solutions instead.', right: true },
              { html: 'Always right: ' + t('k=' + K0) + ' makes the lines parallel.', why: 'Parallel <i>or the same line</i>. With ' + t('c=' + C0) + ' the two equations are the same line.' },
              { html: 'Never right: ' + t('k=' + K0) + ' always gives infinitely many solutions.', why: 'Only when ' + t('c=' + C0) + ' too. For any other ' + t('c') + ', the equation is ' + t('0=\\text{non-zero}') + '.' },
              { html: 'Right only when ' + t('c=' + C0) + '.', why: 'With ' + t('c=' + C0) + ' you get ' + t('0=0') + ' — infinitely many solutions, not none.' }],
              'With ' + t('k=' + K0) + ' the left side is ' + t('0\\cdot y') + '. If ' + t('c\\neq ' + C0) + ' the right side isn’t ' + t(0) + ': no solution (parallel and distinct). If ' + t('c=' + C0) + ' it is ' + t('0=0') + ': the same line, infinitely many. ' + t('k') + ' settles “parallel”; the constant decides which kind.',
              ['Setting ' + t('k=' + K0) + ' makes the slopes equal. What else decides the number of solutions?'], 'EP6d classmate');
          } }] },
      /* ---------------- EP 7 ---------------- */
      { num: '7', section: 'Extra practice D — Modelling a Situation', stem: function (s) { return 'At Ravenscliff High the final mark in a course is built from two pieces: the coursework mark counts for ' + t(s.w1 + '\\%') + ' and the final exam mark counts for ' + t(s.w2 + '\\%') + '. Amara’s exam mark was ' + t(s.d) + ' percentage points higher than her coursework mark, and her final mark came out at ' + t(num(s.F)) + '.'; },
        shared: function (r) {
          var book = { w1: 40, w2: 60, c0: 73, d: 14, c2: 82 };
          var s = r.chance(0.2) ? book : find(function () {
            var w = r.pick([[40, 60], [40, 60], [30, 70], [25, 75]]), c0 = r.int(55, 85), d = r.int(6, 18), e0 = c0 + d; if (e0 > 98) return null;
            var F = (w[0] * c0 + w[1] * e0) / 100; if (!isInt(F * 10)) return null;
            var c2 = null; for (var j = 3; j <= 15 && c0 + j <= 100; j++) { var F2 = (w[0] * (c0 + j) + w[1] * e0) / 100; if (isInt(F2)) { c2 = c0 + j; break; } }
            if (c2 == null) return null;
            return { w1: w[0], w2: w[1], c0: c0, d: d, c2: c2 };
          }, book);
          s.e0 = s.c0 + s.d; s.F = rd((s.w1 * s.c0 + s.w2 * s.e0) / 100); s.F2 = rd((s.w1 * s.c2 + s.w2 * s.e0) / 100);
          s.q1 = pcS(s.w1); s.q2 = pcS(s.w2); s.eq1 = 'e=c+' + s.d; s.eq2 = s.q1 + 'c+' + s.q2 + 'e=' + num(s.F); return s;
        },
        parts: [
          { id: 'e7a', sub: 'a', level: 'PRG', make: function (r, s) {
            return sysPart('(a) Let ' + t('c') + ' be Amara’s coursework mark and ' + t('e') + ' her exam mark, both in percent. Write a system of two equations.', [{ A: 1, B: -1, C: s.d }, { A: s.w1, B: s.w2, C: -100 * s.F }], {
              vars: ['c', 'e'], labels: ['Marks:', 'Final:'], keyTex: [s.eq1, s.eq2],
              diags: [{ is: [1, -1, -s.d], code: 'u8l6-backwards', hint: 'The <b>exam</b> mark is the higher one: ' + t('e=c+' + s.d) + '.' },
                { is: [s.w2, s.w1, -100 * s.F], code: 'u8l6-weights-swap', hint: 'Coursework counts ' + t(s.w1 + '\\%') + ', so ' + t(s.q1) + ' multiplies ' + t('c') + '.' },
                { is: [100 * s.w1, 100 * s.w2, -100 * s.F], code: 'u8l6-mix-decimal', hint: 'Write the weights as decimals: ' + t(s.w1 + '\\%=' + s.q1) + ', ' + t(s.w2 + '\\%=' + s.q2) + '.' },
                { is: [1, 1, -s.F], code: 'u8l6-weights', hint: 'The final mark is a <b>weighted</b> sum: ' + t(s.q1 + 'c+' + s.q2 + 'e') + '.' }],
              bad: [['e=c-' + s.d, s.eq2]] },
              'Exam is ' + t(s.d) + ' points higher: ' + t(s.eq1) + '.<br>Final mark: ' + t(s.eq2) + '.', ['One equation compares the two marks; the other builds the final mark from the weights.'], 'EP7a system');
          } },
          { id: 'e7b', sub: 'b i', level: 'EMG', make: function (r, s) {
            return mc(r, '(b) ' + both(s.eq1, s.eq2) + '<br>Which method suits this system, and why?', [
              { html: '<b>Substitution</b> — ' + t('e') + ' is already isolated in ' + t(s.eq1) + '.', right: true },
              { html: '<b>Elimination</b> — the ' + t('c') + '-coefficients already match.', why: 'They are ' + t(1) + ' and ' + t(s.q1) + '. But ' + t('e') + ' is already alone on one side of the first equation…' },
              { html: '<b>Graphing</b> — marks are always whole numbers, so the lines cross at a grid point.', why: 'A graph would need a huge grid to show ' + t(s.c0) + ' and ' + t(s.e0) + ' accurately — and nothing guarantees whole numbers.' },
              { html: '<b>Substitution</b> — ' + t('c') + ' has coefficient ' + t(1) + ' in the second equation.', why: 'In the second equation ' + t('c') + ' has coefficient ' + t(s.q1) + '. Look at the first equation.' }],
              '<b>Substitution</b>, because ' + t('e') + ' is already isolated in the first equation.', METHOD_HINT, 'EP7b method');
          } },
          { id: 'e7b2', sub: 'b ii', level: 'EMG', make: function (r, s) {
            return ptPart('(b) Solve ' + both(s.eq1, s.eq2) + '.', [s.c0, s.e0], [L(1, -1, -s.d), L(s.w1, s.w2, 100 * s.F)], { vars: ['c', 'e'], keyTex: 'c=' + s.c0 + ',\\ e=' + s.e0 },
              t(s.q1 + 'c+' + s.q2 + '(c+' + s.d + ')=' + num(s.F)) + '<br>' + t(s.q1 + 'c+' + s.q2 + 'c+' + num(s.w2 * s.d / 100) + '=' + num(s.F) + '\\Rightarrow c=' + num(s.F) + '-' + num(s.w2 * s.d / 100) + '=' + s.c0) + '<br>' + t('e=' + s.c0 + '+' + s.d + '=' + s.e0) + '. (Clearing the decimals first gives the same answer.)',
              ['Replace ' + t('e') + ' with ' + t('c+' + s.d) + ' in the second equation.', 'Answer as ' + t('c=\\ldots,\\ e=\\ldots') + ' or as an ordered pair ' + t('(c,\\ e)') + '.'], 'EP7b solve');
          } },
          { id: 'e7c', sub: 'c', level: 'BEG', make: function (r, s) {
            return mc(r, '(c) The solution is ' + t('c=' + s.c0) + ', ' + t('e=' + s.e0) + '. Which sentence answers the question?', [
              { html: 'Amara’s coursework mark was ' + t(s.c0 + '\\%') + ' and her final exam mark was ' + t(s.e0 + '\\%') + '.', right: true },
              { html: 'Amara’s coursework mark was ' + t(s.e0 + '\\%') + ' and her final exam mark was ' + t(s.c0 + '\\%') + '.', why: 'The exam mark was the <b>higher</b> one — ' + t('e') + ' is the exam.' },
              { html: 'Amara’s final mark was ' + t(num(s.F) + '\\%') + '.', why: 'That was given. The question is about her two separate marks.' },
              { html: 'Amara scored ' + t(s.c0) + ' and ' + t(s.e0) + ' out of ' + t(num(s.F)) + '.', why: 'Both marks are percents (out of ' + t(100) + '). Say which is which.' }],
              'Check: ' + t(ck(s.e0 + '=' + s.c0 + '+' + s.d)) + ' and ' + t(ck(s.q1 + '(' + s.c0 + ')+' + s.q2 + '(' + s.e0 + ')=' + num(s.w1 * s.c0 / 100) + '+' + num(s.w2 * s.e0 / 100) + '=' + num(s.F))) + '.<br><b>Amara’s coursework mark was ' + s.c0 + '% and her final exam mark was ' + s.e0 + '%.</b>',
              ['Which letter is the exam mark?'], 'EP7c sentence');
          } },
          { id: 'e7d', sub: 'd', level: 'PRG', make: function (r, s) {
            return K.P.number('(d) Amara’s exam mark was ' + t(s.e0 + '\\%') + ' (coursework ' + t(s.w1 + '\\%') + ', exam ' + t(s.w2 + '\\%') + ' of the final mark). With the same exam mark, what coursework mark would she have needed for a final mark of exactly ' + t(num(s.F2)) + '?', s.c2, function (v) {
              if (near(v, (s.F2 - s.w1 * s.e0 / 100) / (s.w2 / 100))) return { code: 'u8l6-weights-swap', hint: 'Coursework is weighted ' + t(s.q1) + ': ' + t(s.q1 + 'c+' + s.q2 + '(' + s.e0 + ')=' + num(s.F2)) + '.' };
              if (near(v, s.F2 - s.w2 * s.e0 / 100)) return { code: 'u8l6-divide', hint: 'Almost: that is ' + t(s.q1 + 'c') + '. Divide by ' + t(s.q1) + '.' };
              return null;
            }, t(s.q1 + 'c+' + s.q2 + '(' + s.e0 + ')=' + num(s.F2) + '\\Rightarrow ' + s.q1 + 'c=' + num(s.F2) + '-' + num(s.w2 * s.e0 / 100) + '=' + num(rd(s.F2 - s.w2 * s.e0 / 100)) + '\\Rightarrow c=' + s.c2) + '.<br>With the same exam mark of ' + s.e0 + '%, Amara would have needed a coursework mark of <b>' + s.c2 + '%</b>.',
            ['Keep ' + t('e=' + s.e0) + ' and replace the final mark with ' + t(num(s.F2)) + '.'], 'EP7d needed coursework', { after: '%' });
          } },
          { id: 'e7e', sub: 'e', level: 'EMG', make: function (r, s) {
            var m2 = frT(-s.w1, s.w2);
            return mc(r, '(e) Without solving anything further: how do the equations ' + both(s.eq1, s.eq2) + ' guarantee exactly one answer?', [
              { html: 'As lines, their slopes are ' + t(1) + ' and ' + t(m2) + ' — different — so they meet exactly once.', right: true },
              { html: 'They are both linear, and two linear equations always have exactly one solution.', why: 'Two linear equations can have no solution (parallel) or infinitely many (the same line). What do the slopes say here?' },
              { html: 'The marks are whole numbers, so only one pair can work.', why: 'Being whole numbers doesn’t limit the count. It’s the slopes that decide.' },
              { html: 'The slopes are equal, so the lines meet once.', why: 'Equal slopes means parallel or the same line — never exactly one meeting point.' }],
              t(s.eq1) + ' has slope ' + t(1) + '; ' + t(s.eq2) + ' has slope ' + t('-\\frac{' + s.q1 + '}{' + s.q2 + '}=' + m2) + '. Different slopes: the lines cross exactly once, so exactly one pair of marks fits both conditions.',
              ['Think of each equation as a line in the ' + t('ce') + '-plane. What decides how many times two lines meet?'], 'EP7e one solution');
          } }] },
      /* ---------------- EP 8 ---------------- */
      { num: '8', stem: function (s) { return 'A steel spring hangs from a hook. With a ' + t(s.m1) + ' kg mass attached its length is ' + t(s.L1) + ' cm; with a ' + t(s.m2) + ' kg mass attached its length is ' + t(s.L2) + ' cm. Within this range the length ' + t('L') + ', in cm, is modelled by ' + t('L=a+bm') + ', where ' + t('m') + ' is the mass in kg and ' + t('a') + ' and ' + t('b') + ' are constants.'; },
        shared: function (r) {
          var book = { a0: 17, b0: 3, m1: 3, m2: 7, b2: 2, ms: 6, mp: 5 };
          var s = r.chance(0.2) ? book : find(function () {
            var a0 = r.int(10, 25), b0 = r.int(2, 5), m1 = r.int(2, 4), m2 = m1 + r.int(3, 5), b2 = r.int(1, b0 - 1), ms = r.int(4, 9), mp = r.int(m1 + 1, m2 - 1);
            if (ms === m1 || ms === m2 || (b0 - b2) * ms < 3) return null;
            return { a0: a0, b0: b0, m1: m1, m2: m2, b2: b2, ms: ms, mp: mp };
          }, book);
          s.L1 = s.a0 + s.b0 * s.m1; s.L2 = s.a0 + s.b0 * s.m2; s.a2 = s.a0 + (s.b0 - s.b2) * s.ms; s.Ls = s.a0 + s.b0 * s.ms; s.Lp = s.a0 + s.b0 * s.mp;
          s.V = ['a', 'b']; s.q1 = 'a+' + s.m1 + 'b=' + s.L1; s.q2 = 'a+' + s.m2 + 'b=' + s.L2; return s;
        },
        parts: [
          { id: 'e8a', sub: 'a', level: 'EMG', make: function (r, s) {
            return sysPart('(a) Substitute each measurement into ' + t('L=a+bm') + ' to form a system of two equations in ' + t('a') + ' and ' + t('b') + '.', [{ A: 1, B: s.m1, C: -s.L1 }, { A: 1, B: s.m2, C: -s.L2 }], {
              vars: s.V, labels: [t(s.m1) + ' kg:', t(s.m2) + ' kg:'], keyTex: [s.q1, s.q2],
              diags: [{ is: [s.m1, 1, -s.L1], code: 'u8l6-coef-swap', hint: 'In ' + t('L=a+bm') + ' the mass multiplies ' + t('b') + ': ' + t('a+' + s.m1 + 'b') + '.' },
                { is: [1, s.L1, -s.m1], code: 'u8l6-sub-swap', hint: 'Substitute ' + t('L=' + s.L1) + ' and ' + t('m=' + s.m1) + ' — the length goes on the left, the mass multiplies ' + t('b') + '.' }],
              bad: [[s.m1 + 'a+b=' + s.L1, s.q2]] },
              t('m=' + s.m1 + ',\\ L=' + s.L1) + ': ' + t(s.q1) + '<br>' + t('m=' + s.m2 + ',\\ L=' + s.L2) + ': ' + t(s.q2),
              ['Replace ' + t('L') + ' and ' + t('m') + ' by each pair of measurements; ' + t('a') + ' and ' + t('b') + ' stay as letters.'], 'EP8a system');
          } },
          { id: 'e8b', sub: 'b', level: 'BEG', make: function (r, s) {
            return ptPart('(b) Solve ' + both(s.q1, s.q2) + '.', [s.a0, s.b0], [L(1, s.m1, s.L1), L(1, s.m2, s.L2)], { vars: s.V, keyTex: 'a=' + s.a0 + ',\\ b=' + s.b0 },
              '<b>Elimination by subtracting</b> — ' + t('a') + ' has coefficient ' + t(1) + ' in both:<br>' + t('(a+' + s.m2 + 'b)-(a+' + s.m1 + 'b)=' + s.L2 + '-' + s.L1 + '\\Rightarrow ' + (s.m2 - s.m1) + 'b=' + (s.L2 - s.L1) + '\\Rightarrow b=' + s.b0) + '<br>' + t('a=' + s.L1 + '-' + s.m1 + '(' + s.b0 + ')=' + s.a0) + '. Check: ' + t(ck(s.a0 + '+' + s.m2 + '(' + s.b0 + ')=' + s.L2)) + '.',
              ['Subtract the equations: ' + t('a') + ' cancels.', 'Answer as ' + t('a=\\ldots,\\ b=\\ldots') + '.'], 'EP8b solve');
          } },
          { id: 'e8c', sub: 'c i', level: 'EMG', make: function (r, s) {
            return mc(r, '(c) The model is ' + t('L=' + s.a0 + '+' + s.b0 + 'm') + '. What do ' + t('a=' + s.a0) + ' and ' + t('b=' + s.b0) + ' mean for this spring?', [
              { html: 'The spring is ' + t(s.a0) + ' cm long with no mass on it, and it stretches ' + t(s.b0) + ' cm for each kilogram added.', right: true },
              { html: 'The spring stretches ' + t(s.a0) + ' cm per kilogram and is ' + t(s.b0) + ' cm long unloaded.', why: t('a') + ' is the value of ' + t('L') + ' when ' + t('m=0') + ' (the intercept); ' + t('b') + ' is the rate (the slope).' },
              { html: 'The spring can hold at most ' + t(s.a0) + ' kg, and ' + t(s.b0) + ' kg stretches it ' + t(1) + ' cm.', why: 'Check the units: ' + t('L') + ' is in cm, so ' + t('a') + ' is a length in cm and ' + t('b') + ' is in cm per kg.' },
              { html: t(s.a0) + ' cm is the length with a ' + t(s.m1) + ' kg mass, and ' + t(s.b0) + ' is the number of masses.', why: 'With ' + t(s.m1) + ' kg the length was ' + t(s.L1) + ' cm. ' + t('a') + ' is the length at ' + t('m=0') + '.' }],
              t('a=' + s.a0) + ' is ' + t('L') + ' when ' + t('m=0') + ': the unloaded length. ' + t('b=' + s.b0) + ' is the slope: the stretch per kilogram. <b>The spring is ' + s.a0 + ' cm long unloaded and stretches ' + s.b0 + ' cm for each additional kilogram.</b>',
              ['What is ' + t('L') + ' when ' + t('m=0') + '? What does the coefficient of ' + t('m') + ' measure?'], 'EP8c meaning');
          } },
          { id: 'e8c2', sub: 'c ii', level: 'BEG', make: function (r, s) {
            return K.P.number('(c) Using ' + t('L=' + s.a0 + '+' + s.b0 + 'm') + ', predict the length with a ' + t(s.mp) + ' kg mass.', s.Lp, function (v) { return near(v, s.b0 + s.a0 * s.mp) ? { code: 'u8l6-coef-swap', hint: 'The mass multiplies ' + t('b=' + s.b0) + ': ' + t(s.a0 + '+' + s.b0 + '(' + s.mp + ')') + '.' } : null; },
              t('L=' + s.a0 + '+' + s.b0 + '(' + s.mp + ')=' + s.Lp) + ' cm.', ['Substitute ' + t('m=' + s.mp) + '.'], 'EP8c predict', { after: 'cm' });
          } },
          { id: 'e8d', sub: 'd', level: 'EMG', make: function (r, s) {
            return numBoxes('(d) The first spring is ' + t('L=' + s.a0 + '+' + s.b0 + 'm') + '. A second spring on the same hook is modelled by ' + t('L=' + s.a2 + '+' + s.b2 + 'm') + '. Determine the mass at which the two springs have the same length, and that common length.', [
              { label: 'mass:', after: 'kg', v: s.ms, diag: function (v) { return near(v, s.Ls) ? { code: 'u8l6-gave-cost', hint: 'That’s the common <b>length</b>. The mass is the value of ' + t('m') + '.' } : null; } }, { label: 'length:', after: 'cm', v: s.Ls }],
              t(s.a0 + '+' + s.b0 + 'm=' + s.a2 + '+' + s.b2 + 'm\\Rightarrow ' + (s.b0 - s.b2 === 1 ? 'm=' + s.ms : (s.b0 - s.b2) + 'm=' + (s.a2 - s.a0) + '\\Rightarrow m=' + s.ms)) + '<br>' + t('L=' + s.a0 + '+' + s.b0 + '(' + s.ms + ')=' + s.Ls) + ', and ' + t(ck(s.a2 + '+' + s.b2 + '(' + s.ms + ')=' + s.Ls)) + '.<br><b>With ' + s.ms + ' kg attached, both springs measure ' + s.Ls + ' cm.</b>',
              ['Set the two expressions for ' + t('L') + ' equal.'], 'EP8d equal length', { swapHint: 'Check which is which: the mass is in kg, the length in cm.' });
          } },
          { id: 'e8e', sub: 'e', level: 'EMG', make: function (r, s) {
            return mc(r, '(e) Classify the system ' + both('L=' + s.a0 + '+' + s.b0 + 'm', 'L=' + s.a2 + '+' + s.b2 + 'm') + ', and say what a “no solution” answer would have meant physically.', [
              { html: '<b>One solution</b> (slopes ' + t(s.b0) + ' and ' + t(s.b2) + ' differ). “No solution” would mean the springs stretch at the same rate but start at different lengths, so one is always longer.', right: true },
              { html: '<b>One solution</b>. “No solution” would mean the springs break.', why: 'A system’s solution count is about the lines: no solution means equal slopes and different intercepts. What would that mean for the springs?' },
              { html: '<b>No solution</b>, because the springs start at different lengths.', why: 'Different starting lengths alone don’t prevent a meeting — the slopes differ, so the lines cross (at ' + t(s.ms) + ' kg).' },
              { html: '<b>Infinitely many</b>, because both are springs on the same hook.', why: 'Infinitely many would need the same equation. These have different slopes and intercepts.' }],
              'The slopes are ' + t(s.b0) + ' and ' + t(s.b2) + ' — different — so there is exactly <b>one solution</b>: one mass makes the springs equal. “No solution” would need equal slopes and different intercepts: springs that stretch the same amount per kilogram but start at different lengths, so one stays longer forever.',
              ['Compare the slopes. What would equal slopes with different intercepts mean for two springs?'], 'EP8e classify');
          } }] },
      /* ---------------- EP 9 ---------------- */
      { num: '9', section: 'Extra practice E — Reasoning and Error Analysis', stem: 'Is the statement <b>always</b> true, <b>sometimes</b> true, or <b>never</b> true?', parts: [
        { id: 'e9a', sub: 'a', level: 'PRG', make: function (r) { return asn(r, 'a', r.pick([
          { s: 'A system made of two <i>different</i> linear equations has exactly one solution.', v: 'S', sol: '<b>Sometimes</b> — only when the slopes differ. ' + t('x+y=4') + ' and ' + t('2x+2y=9') + ' are different equations with <b>no</b> solution (parallel); ' + t('x+y=4') + ' and ' + t('3x+3y=12') + ' look different but have <b>infinitely many</b>. “Looking different” isn’t the test — the slopes and intercepts are.',
            w: { A: 'Find a counter-example: try two different equations with the same slope, like ' + t('x+y=4') + ' and ' + t('2x+2y=9') + '.', N: 'Most pairs of different equations do have one solution — e.g. ' + t('x+y=4') + ' and ' + t('x-y=2') + '.' } },
          { s: 'A system of two linear equations whose lines have different slopes has exactly one solution.', v: 'A', sol: '<b>Always</b> — lines with different slopes are not parallel, so they cross at exactly one point.', w: { S: 'Can you find two lines with different slopes that don’t cross exactly once? Non-parallel lines always meet once.', N: 'Try ' + t('y=x') + ' and ' + t('y=-x') + ': different slopes, one crossing point.' } },
          { s: 'A system of two linear equations with the same slope and the same ' + t('y') + '-intercept has exactly one solution.', v: 'N', sol: '<b>Never</b> — same slope and same intercept means the same line: infinitely many solutions, never exactly one.', w: { A: 'Same slope and same intercept: the two equations describe the same line. How many points do they share?', S: 'Is there any case where the same line meets itself only once?' } },
          { s: 'A system made of two <i>different</i> linear equations has exactly one solution.', v: 'S', sol: '<b>Sometimes</b> — only when the slopes differ. ' + t('x+y=4') + ' and ' + t('2x+2y=9') + ' have <b>no</b> solution; ' + t('x+y=4') + ' and ' + t('3x+3y=12') + ' have <b>infinitely many</b>.',
            w: { A: 'Find a counter-example: two different equations with the same slope, like ' + t('x+y=4') + ' and ' + t('2x+2y=9') + '.', N: 'Most pairs of different equations do have one solution — e.g. ' + t('x+y=4') + ' and ' + t('x-y=2') + '.' } }])); } },
        { id: 'e9b', sub: 'b', level: 'EMG', make: function (r) { return asn(r, 'b', r.pick([
          { s: 'If elimination reduces a system to ' + t('0=0') + ', then the solution is ' + t('(0,\\ 0)') + '.', v: 'N', sol: '<b>Never</b> — ' + t('0=0') + ' says the two equations are the same line, so there are <b>infinitely many</b> solutions, not one. E.g. ' + t('x+y=4') + ' and ' + t('2x+2y=8') + ' give ' + t('0=0') + ', and ' + t('(0,\\ 0)') + ' isn’t even <i>a</i> solution: ' + t('0+0\\neq 4') + '.',
            w: { A: 'Try ' + t('x+y=4') + ' and ' + t('2x+2y=8') + ': elimination gives ' + t('0=0') + ', but does ' + t('(0,\\ 0)') + ' satisfy ' + t('x+y=4') + '?', S: t('0=0') + ' means infinitely many solutions — so “the solution is ' + t('(0,0)') + '” (a single point) can never be right.' } },
          { s: 'If elimination reduces a system to ' + t('0=0') + ', the system has infinitely many solutions.', v: 'A', sol: '<b>Always</b> — ' + t('0=0') + ' is true for every point, which happens exactly when the two equations describe the same line.', w: { S: 'When could ' + t('0=0') + ' mean anything else? It is true no matter what ' + t('x') + ' and ' + t('y') + ' are.', N: t('0=0') + ' is a true statement for every ' + t('(x,\\ y)') + ' on the line.' } },
          { s: 'If elimination reduces a system to ' + t('0=0') + ', then ' + t('(0,\\ 0)') + ' is one of its solutions.', v: 'S', sol: '<b>Sometimes</b> — only when the line passes through the origin. ' + t('x+y=0') + ' and ' + t('2x+2y=0') + ': yes. ' + t('x+y=4') + ' and ' + t('2x+2y=8') + ': no, ' + t('0+0\\neq 4') + '.', w: { A: 'Try ' + t('x+y=4') + ' and ' + t('2x+2y=8') + ': does ' + t('(0,\\ 0)') + ' satisfy them?', N: 'Try ' + t('x+y=0') + ' and ' + t('2x+2y=0') + ': does ' + t('(0,\\ 0)') + ' satisfy them?' } },
          { s: 'If elimination reduces a system to ' + t('0=0') + ', then the solution is ' + t('(0,\\ 0)') + '.', v: 'N', sol: '<b>Never</b> — ' + t('0=0') + ' means the same line: infinitely many solutions, not the single point ' + t('(0,\\ 0)') + '.', w: { A: 'Try ' + t('x+y=4') + ' and ' + t('2x+2y=8') + ': does ' + t('(0,\\ 0)') + ' satisfy ' + t('x+y=4') + '?', S: t('0=0') + ' means infinitely many solutions — so a single point can never be “the” solution.' } }])); } },
        { id: 'e9c', sub: 'c', level: 'EMG', make: function (r) { return asn(r, 'c', r.pick([
          { s: 'Graphing is the safest method for solving a system, because you can see the answer on the page.', v: 'S', sol: '<b>Sometimes</b> — a graph is reliable only when the crossing point is a lattice point inside the grid. ' + t('5x-4y=3') + ' and ' + t('x+2y=7') + ' meet at ' + t('\\left(\\frac{17}{7},\\ \\frac{16}{7}\\right)') + ' — no ordinary grid shows sevenths. Substitution and elimination are exact every time.',
            w: { A: 'Try a system whose solution is ' + t('\\left(\\frac{17}{7},\\ \\frac{16}{7}\\right)') + ': can you read that off a grid?', N: 'When the lines cross at a grid point (like ' + t('(3,\\ 3)') + '), a careful graph does give the answer.' } },
          { s: 'Substitution and elimination give the same solution for any system that has exactly one solution.', v: 'A', sol: '<b>Always</b> — both methods are exact, and a system has only one solution, so done correctly they must agree. If they disagree, there is an arithmetic error.', w: { S: 'The solution is a fact about the system, not the method. Can two correct methods give different points?', N: 'Try one: ' + t('x+y=5') + ', ' + t('x-y=1') + ' — both methods give ' + t('(3,\\ 2)') + '.' } },
          { s: 'A hand-drawn graph on a one-unit grid can show the solution ' + t('\\left(\\frac{17}{7},\\ \\frac{16}{7}\\right)') + ' exactly.', v: 'N', sol: '<b>Never</b> — sevenths fall between the grid lines, so a graph can only estimate this point (about ' + t('(2.4,\\ 2.3)') + '). Use substitution or elimination for exact values.', w: { A: 'Where is ' + t('\\frac{17}{7}\\approx 2.43') + ' on a one-unit grid? Between lines — you can only estimate it.', S: 'Is there any one-unit grid on which ' + t('\\frac{17}{7}') + ' falls exactly on a line?' } }])); } },
        { id: 'e9d', sub: 'd', level: 'PRG', make: function (r) { return asn(r, 'd', r.pick([
          { s: 'Two lines with different ' + t('y') + '-intercepts must cross somewhere.', v: 'S', sol: '<b>Sometimes</b> — only when the slopes differ. ' + t('y=2x+1') + ' and ' + t('y=2x+5') + ' have different intercepts and never meet. The <i>slopes</i> decide whether lines cross; the intercepts only separate “parallel and distinct” from “the same line”.',
            w: { A: 'Counter-example: ' + t('y=2x+1') + ' and ' + t('y=2x+5') + '. Do they ever meet?', N: t('y=x+1') + ' and ' + t('y=-x+5') + ' have different intercepts and do cross.' } },
          { s: 'Two lines with different slopes must cross somewhere.', v: 'A', sol: '<b>Always</b> — lines with different slopes aren’t parallel, so they meet at exactly one point.', w: { S: 'Can you draw two lines with different slopes that never meet?', N: 'Try ' + t('y=x') + ' and ' + t('y=2x') + ': they cross at the origin.' } },
          { s: 'Two lines with the same slope and different ' + t('y') + '-intercepts cross somewhere.', v: 'N', sol: '<b>Never</b> — same slope and different intercepts means parallel and distinct: the lines never meet.', w: { A: 'Try ' + t('y=2x+1') + ' and ' + t('y=2x+5') + ': the gap between them never changes.', S: 'Parallel, distinct lines stay the same distance apart everywhere — is there any case where they meet?' } }])); } }] },
      /* ---------------- EP 10 ---------------- */
      { num: '10', stem: function (s) { return 'The system ' + both(s.E1, s.E2) + ' is graphed below (blue: ' + t(s.E1) + ', red: ' + t(s.E2) + '), with the point of intersection marked. <b>On this grid one square is ' + t(1) + ' unit wide and ' + t(2) + ' units high.</b> A student reports the solution as ' + t(ptT(s.bad)) + '.' + s.fig; },
        shared: function (r) {
          var book = { x0: 3, y0: 4, p: 2 };
          var s = r.chance(0.2) ? book : { x0: r.int(2, 6), y0: r.pick([2, 4, 4, 6, 8, 10]), p: r.pick([2, 3]) };
          var c1 = s.p * s.x0 - s.y0, c2 = s.x0 + s.y0;
          if (c2 > 12 || Math.abs(c1) > 10) s = book, c1 = 2, c2 = 7;
          s.c1 = c1; s.c2 = c2; s.E1 = eqT(s.p, -1, c1); s.E2 = eqT(1, 1, c2); s.bad = [s.x0, s.y0 / 2]; s.P = [s.x0, s.y0];
          var xr = [-2, 8], yr = [-4, 12];
          var seg1 = clipSeg(line(s.p, -1, -c1), xr, yr), seg2 = clipSeg(line(1, 1, -c2), xr, yr);
          s.fig = '<div style="text-align:center">' + HW.graph({ x: xr, y: yr, grid: 1, gridY: 2, labelsX: 2, labelsY: 4, unitX: 26, unitY: 13, max: 320, segs: [{ pts: seg1, color: '#2563a8' }, { pts: seg2, color: '#c0392b' }], points: [{ x: s.x0, y: s.y0, color: '#1c2230' }], aria: 'two lines crossing' }) + '</div>';
          s.sys = [L(s.p, -1, c1), L(1, 1, c2)]; return s;
        },
        parts: [
          { id: 'e10a', sub: 'a', level: 'EMG', make: function (r, s) {
            var v1 = s.p * s.bad[0] - s.bad[1], v2 = s.bad[0] + s.bad[1];
            return mc(r, '(a) ' + t(ptT(s.bad)) + ' fails both equations: ' + t(subT(s.p, -1, s.bad) + '=' + num(v1) + '\\neq ' + s.c1) + ' and ' + t(subT(1, 1, s.bad) + '=' + num(v2) + '\\neq ' + s.c2) + '. What did the student do wrong when reading the graph?', [
              { html: 'Counted vertical <b>squares</b> instead of <b>units</b>: one square up is ' + t(2) + ' units here.', right: true },
              { html: 'Swapped the ' + t('x') + '- and ' + t('y') + '-coordinates.', why: 'Swapping would give ' + t(ptT([s.bad[1], s.bad[0]])) + '. The ' + t('x') + '-value ' + t(s.x0) + ' is right — look at the ' + t('y') + '-axis scale.' },
              { html: 'Read the wrong crossing point.', why: 'Two lines cross only once. The marked point is the right one — the reading of its height is off.' },
              { html: 'Made an arithmetic error when substituting.', why: 'The substitution is fine — ' + t(ptT(s.bad)) + ' really does fail. The problem is how the point was read off the grid.' }],
              'The marked point is ' + t(s.x0) + ' squares right and ' + t(s.y0 / 2) + ' squares up. Each square up is ' + t(2) + ' units, so ' + t('y=' + (s.y0 / 2) + '\\times 2=' + s.y0) + ', not ' + t(s.y0 / 2) + '. The student counted squares instead of units.',
              ['Look at the numbers on the ' + t('y') + '-axis: how many units is one square?'], 'EP10a reading error');
          } },
          { id: 'e10b', sub: 'b', level: 'BEG', make: function (r, s) {
            return ptPart('(b) Read the marked point correctly and state the solution as an ordered pair.', s.P, s.sys, { wrong: [{ is: s.bad, code: 'u8l6-scale', hint: 'That counts squares. On the ' + t('y') + '-axis one square is ' + t(2) + ' units — read the labels.' }], bad: ['(' + s.bad[0] + ',' + s.bad[1] + ')'] },
              'Reading the axes properly, the point is ' + t(ptT(s.P)) + '.<br>Check: ' + t(ck(subT(s.p, -1, s.P) + '=' + s.c1)) + ', ' + t(ck(subT(1, 1, s.P) + '=' + s.c2)) + '. (Algebra agrees: adding the equations gives ' + t((s.p + 1) + 'x=' + (s.c1 + s.c2) + '\\Rightarrow x=' + s.x0) + ', then ' + t('y=' + s.y0) + '.)',
              ['Use the axis labels, not a count of squares.'], 'EP10b read correctly');
          } },
          { id: 'e10c', sub: 'c', level: 'BEG', make: function (r, s) {
            return mc(r, '(c) Solving algebraically confirms ' + t(ptT(s.P)) + '. What must you check on any grid <b>before</b> reading a coordinate from it?', [
              { html: 'The scale on <b>each axis separately</b> — how many units one square represents.', right: true },
              { html: 'That the two lines are different colours.', why: 'Colours help tell the lines apart, but they don’t affect the coordinates you read.' },
              { html: 'That the lines have arrows on both ends.', why: 'Arrows show the lines continue. The reading error here came from the axis scale.' },
              { html: 'That the origin is in the centre of the grid.', why: 'The origin can be anywhere. What went wrong was the number of units per square.' }],
              'Check the scale on each axis separately — the two axes need not use the same scale. Here one square is ' + t(1) + ' unit across but ' + t(2) + ' units up.', ['What was different about the two axes on this grid?'], 'EP10c check scale');
          } }] },
      /* ---------------- EP 11 ---------------- */
      { num: '11', stem: function (s) { return 'A bicycle shop charges a flat ' + t(money(s.p1)) + ' for a tune-up and ' + t(money(s.p2)) + ' for a safety check. Last week the shop performed ' + t(s.N) + ' of these services altogether and collected ' + t(money(s.V)) + ' for them. A student writes the system ' + both(s.p1 + 'x+' + s.p2 + 'y=' + s.N, 'x+y=' + s.V) + ', where ' + t('x') + ' is the number of tune-ups and ' + t('y') + ' the number of safety checks.'; },
        shared: function (r) {
          var book = { p1: 45, p2: 20, x0: 24, y0: 14 };
          var s = r.chance(0.2) ? book : find(function () { var p1 = r.pick([35, 40, 45, 50, 55, 60]), p2 = r.pick([15, 20, 25, 30]); if (p1 - p2 < 15) return null; var x0 = r.int(10, 30), y0 = r.int(8, 30); if (x0 === y0) return null; return { p1: p1, p2: p2, x0: x0, y0: y0 }; }, book);
          s.N = s.x0 + s.y0; s.V = s.p1 * s.x0 + s.p2 * s.y0; s.sx = (s.N - s.p2 * s.V) / (s.p1 - s.p2); s.sy = s.V - s.sx; return s;
        },
        parts: [
          { id: 'e11a', sub: 'a i', level: 'EMG', make: function (r, s) {
            return mc(r, '(a) What is the student’s error?', [
              { html: 'The right-hand sides are swapped: ' + t(s.N) + ' counts services, so it belongs with ' + t('x+y') + '; ' + t(money(s.V)) + ' is money, so it belongs with ' + t(s.p1 + 'x+' + s.p2 + 'y') + '.', right: true },
              { html: 'The prices are on the wrong variables: it should be ' + t(s.p2 + 'x+' + s.p1 + 'y') + '.', why: 'A tune-up (' + t('x') + ') costs ' + t(money(s.p1)) + ', so ' + t(s.p1 + 'x') + ' is right. Look at what each equation is set equal to.' },
              { html: 'The second equation should be ' + t('x-y=' + s.V) + '.', why: 'The services add up: ' + t('x+y') + '. What should that sum equal?' },
              { html: 'There is no error — the system is correct.', why: 'Read each equation in words: ' + t(s.p1 + 'x+' + s.p2 + 'y') + ' is money. Can it equal ' + t(s.N) + ', a number of services?' }],
              'The two right-hand sides have been swapped. ' + t(s.N) + ' counts services, so it goes with ' + t('x+y') + '; ' + t(money(s.V)) + ' is money, so it goes with ' + t(s.p1 + 'x+' + s.p2 + 'y') + '.', ['Read each equation aloud with units: what does each side measure?'], 'EP11a error');
          } },
          { id: 'e11a2', sub: 'a ii', level: 'EMG', make: function (r, s) {
            return sysPart('(a) Write the system as it should have been written.', [{ A: 1, B: 1, C: -s.N }, { A: s.p1, B: s.p2, C: -s.V }], {
              labels: ['Services:', 'Money:'], keyTex: ['x+y=' + s.N, s.p1 + 'x+' + s.p2 + 'y=' + s.V],
              diags: [{ is: [1, 1, -s.V], code: 'u8l6-rhs-swap', hint: 'That’s the student’s equation. ' + t(s.V) + ' is money — it doesn’t count services.' }, { is: [s.p1, s.p2, -s.N], code: 'u8l6-rhs-swap', hint: 'That’s the student’s equation. The money equation must equal the money collected, ' + t(money(s.V)) + '.' }],
              bad: [[s.p1 + 'x+' + s.p2 + 'y=' + s.N, 'x+y=' + s.V]] },
              'Correct system: ' + t('x+y=' + s.N) + ' and ' + t(s.p1 + 'x+' + s.p2 + 'y=' + s.V) + '.', ['Count services in one equation and total money in the other.'], 'EP11a correct system');
          } },
          { id: 'e11b', sub: 'b', level: 'EMG', make: function (r, s) {
            return ptPart('(b) Solve the corrected system ' + both('x+y=' + s.N, s.p1 + 'x+' + s.p2 + 'y=' + s.V) + '.', [s.x0, s.y0], [L(1, 1, s.N), L(s.p1, s.p2, s.V)], {},
              'Substitution — ' + t('y=' + s.N + '-x') + ' costs nothing:<br>' + t(s.p1 + 'x+' + s.p2 + '(' + s.N + '-x)=' + s.V + '\\Rightarrow ' + (s.p1 - s.p2) + 'x=' + (s.V - s.p2 * s.N) + '\\Rightarrow x=' + s.x0) + ', ' + t('y=' + s.N + '-' + s.x0 + '=' + s.y0) + '.<br>Check: ' + t(ck(s.x0 + '+' + s.y0 + '=' + s.N)) + ', ' + t(ck(s.p1 + '(' + s.x0 + ')+' + s.p2 + '(' + s.y0 + ')=' + F(s.V))) + '.',
              ['Isolate ' + t('y') + ' in ' + t('x+y=' + s.N) + ' and substitute.'], 'EP11b solve');
          } },
          { id: 'e11c', sub: 'c', level: 'BEG', make: function (r, s) {
            return mc(r, '(c) The solution is ' + t('x=' + s.x0) + ', ' + t('y=' + s.y0) + '. Which check against the <b>words</b> of the problem confirms it?', [
              { html: t(s.x0 + '+' + s.y0 + '=' + s.N) + ' services, and ' + t(s.x0 + '\\times ' + money(s.p1) + '+' + s.y0 + '\\times ' + money(s.p2) + '=' + money(s.V)) + '; both counts are whole and positive.', right: true },
              { html: 'Only ' + t(s.p1 + '(' + s.x0 + ')+' + s.p2 + '(' + s.y0 + ')=' + s.V) + ' needs checking.', why: 'The words give two facts — the number of services and the money. Check both.' },
              { html: 'The values satisfy the student’s original equations.', why: 'The student’s equations were wrong. Check against the words of the problem.' },
              { html: t(s.x0 + '-' + s.y0 + '=' + (s.x0 - s.y0)) + ', so there were more tune-ups.', why: 'That’s true but doesn’t check either fact in the problem.' }],
              '<b>The shop performed ' + s.x0 + ' tune-ups and ' + s.y0 + ' safety checks.</b> Against the words: ' + t(s.x0 + '+' + s.y0 + '=' + s.N) + ' services; ' + t(s.x0 + '\\times ' + money(s.p1) + '=' + money(s.p1 * s.x0)) + ' and ' + t(s.y0 + '\\times ' + money(s.p2) + '=' + money(s.p2 * s.y0)) + ', total ' + t(money(s.V)) + '. Both are whole, positive numbers, as counts must be.',
              ['Go back to each sentence of the problem and test the numbers.'], 'EP11c words check');
          } },
          { id: 'e11d', sub: 'd', level: 'EMG', make: function (r, s) {
            var sx = rd(s.sx, 2), sy = rd(s.sy, 2);
            return mc(r, '(d) Solving the student’s system as written gives ' + t('x=' + F(sx)) + ' and ' + t('y=' + F(sy)) + '. What is wrong, and why didn’t checking in the equations catch it?', [
              { html: 'A negative number of tune-ups and decimal counts are impossible — yet both values satisfy the student’s equations, so only a check against the <b>words</b> catches a system set up wrongly.', right: true },
              { html: 'Nothing is wrong: the values satisfy both equations, so they must be right.', why: 'They satisfy the student’s equations — but those equations don’t describe the shop. Can there be ' + t(F(sx)) + ' tune-ups?' },
              { html: 'The student made an arithmetic slip while solving.', why: 'The solving is fine — substitute back and the student’s equations check. The error is in setting them up.' },
              { html: 'Decimals are fine, but the negative value means the student should have used elimination.', why: 'The method can’t fix a wrong system. And a count of services can’t be a decimal either.' }],
              'From ' + t('x=' + s.V + '-y') + ': ' + t(s.p1 + '(' + s.V + '-y)+' + s.p2 + 'y=' + s.N) + ' gives ' + t('y=' + F(sy)) + ' and ' + t('x=' + F(sx)) + '. A negative count of tune-ups is impossible, and counts can’t be decimals. Both values satisfy the student’s equations exactly, so substituting back into those equations would pass — only a check against the words reveals that the system itself is wrong.',
              ['Could a shop do a negative number of tune-ups?'], 'EP11d impossible solution');
          } }] },
      /* ---------------- EP 12 ---------------- */
      { num: '12', section: 'Extra practice F — Challenge', stem: function (s) { return 'In the system ' + both(s.E1, s.E2) + ', ' + t('k') + ' is a constant.'; },
        shared: function (r) {
          var book = { a: 2, p: 3, q: 2, rr: 12, sh: -5 };
          var s = r.chance(0.2) ? book : find(function () {
            var a = r.pick([1, 2, 2, 3]), p = r.int(2, 5), q = r.int(2, 4), rr = r.pick([6, 8, 9, 10, 12, 15]), sh = nz(r, -6, 4); if (p === q) return null;
            var D = p + a * q, k = (rr * (1 + a) + sh * D) / (p - q); if (!isInt(k) || k === 0 || Math.abs(k) > 30) return null;
            var x = (q * k + rr) / D, y = (p * k - a * rr) / D; if (!isInt(x) || !isInt(y) || gcd(gcd(q, rr), D) !== 1 || gcd(gcd(p, a * rr), D) !== 1) return null;
            return { a: a, p: p, q: q, rr: rr, sh: sh };
          }, book);
          s.D = s.p + s.a * s.q; s.k = (s.rr * (1 + s.a) + s.sh * s.D) / (s.p - s.q); s.x = (s.q * s.k + s.rr) / s.D; s.y = (s.p * s.k - s.a * s.rr) / s.D;
          s.E1 = lin([s.a, 1], ['x', 'y']) + '=k'; s.E2 = eqT(s.p, -s.q, s.rr);
          s.xT = '\\frac{' + lin([s.q], ['k']) + '+' + s.rr + '}{' + s.D + '}'; s.yT = '\\frac{' + lin([s.p], ['k']) + '-' + (s.a * s.rr) + '}{' + s.D + '}';
          s.E3 = 'y=x' + sg(s.sh); return s;
        },
        parts: [
          { id: 'e12a', sub: 'a', level: 'ADV', make: function (r, s) {
            var xs = '\\frac{' + lin([s.q], ['k']) + '-' + s.rr + '}{' + s.D + '}';
            return { prompt: '(a) Solve the system in terms of ' + t('k') + '. Write each coordinate as a single fraction with denominator ' + t(s.D) + '.', input: { type: 'fields', fields: [{ label: t('x='), mode: 'math', keys: 'poly', vars: ['k'], placeholder: ' ' }, { label: t('y='), mode: 'math', keys: 'poly', vars: ['k'], placeholder: ' ' }] },
              check: (function () { var cx = exprIn(s.xT, 'k', { single: true, diag: function (a) { return ex.equiv(a, ex.parse(xs).ast, ['k']) ? { code: 'sign', hint: 'Check the sign of the constant: ' + t(s.D + 'x=' + s.q + 'k+' + s.rr) + '.' } : null; } }), cy = exprIn(s.yT, 'k', { single: true });
                return function (resp) { resp = resp || []; var sw = [cx(String(resp[1] || '')), cy(String(resp[0] || ''))]; if (sw[0].v === 'correct' && sw[1].v === 'correct') return form('u8l6-eq-boxes', 'Both expressions are right, but they are in each other’s boxes.'); var a = cx(String(resp[0] || '')); if (a.v !== 'correct') return { v: a.v, code: a.code, hint: '<b>x:</b> ' + (a.hint || 'Check this one again.') }; var b = cy(String(resp[1] || '')); if (b.v !== 'correct') return { v: b.v, code: b.code, hint: '<b>y:</b> ' + (b.hint || 'Check this one again: back-substitute ' + t('x') + ' into ' + t('y=k-' + (s.a === 1 ? '' : s.a) + 'x') + '.') }; return ok(); }; })(),
              key: [s.xT, s.yT], answer: t('x=' + s.xT) + ', ' + t('y=' + s.yT),
              solution: 'From ' + t(s.E1) + ': ' + t('y=k-' + (s.a === 1 ? '' : s.a) + 'x') + '. Substitute into ' + t(s.E2) + ':<br>' + t(s.p + 'x-' + s.q + '(k-' + (s.a === 1 ? '' : s.a) + 'x)=' + s.rr + '\\Rightarrow ' + s.D + 'x=' + s.q + 'k+' + s.rr + '\\Rightarrow x=' + s.xT) + '<br>' + t('y=k-' + (s.a === 1 ? '' : s.a) + '\\left(' + s.xT + '\\right)=\\frac{' + s.D + 'k-' + (s.a * s.q) + 'k-' + (s.a * s.rr) + '}{' + s.D + '}=' + s.yT),
              hints: ['Solve the first equation for ' + t('y') + ' (keep ' + t('k') + ' as a letter) and substitute.'], text: 'EP12a in terms of k', bad: [[xs, s.yT]] };
          } },
          { id: 'e12b', sub: 'b i', level: 'ADV', make: function (r, s) {
            return K.P.number('(b) The solution of the system is ' + t('x=' + s.xT) + ', ' + t('y=' + s.yT) + '. Determine the value of ' + t('k') + ' for which the solution also lies on the line ' + t(s.E3) + '.', s.k, function (v) { return near(v, -s.k) ? { code: 'sign', hint: 'Check the sign when you collect the ' + t('k') + '-terms.' } : null; },
              'Require ' + t(s.E3) + ': ' + t(s.yT + '=' + s.xT + sg(s.sh)) + '<br>Multiply by ' + t(s.D) + ': ' + t(lin([s.p], ['k']) + '-' + (s.a * s.rr) + '=' + lin([s.q], ['k']) + '+' + s.rr + sg(s.sh * s.D)) + '<br>' + t(s.p - s.q === 1 ? 'k=' + s.k : (s.p - s.q) + 'k=' + (s.rr + s.a * s.rr + s.sh * s.D) + '\\Rightarrow k=' + s.k) + '.',
              ['Substitute both coordinates into ' + t(s.E3) + ' and clear the denominator ' + t(s.D) + '.'], 'EP12b k on line');
          } },
          { id: 'e12b2', sub: 'b ii', level: 'PRG', make: function (r, s) {
            var E1k = eqT(s.a, 1, s.k);
            return ptPart('(b) With ' + t('k=' + s.k) + ', the system is ' + both(E1k, s.E2) + '. State the solution point.', [s.x, s.y], [L(s.a, 1, s.k), L(s.p, -s.q, s.rr)], {},
              t('x=\\frac{' + s.q + '(' + s.k + ')+' + s.rr + '}{' + s.D + '}=' + s.x) + ' and ' + t('y=\\frac{' + s.p + '(' + s.k + ')-' + (s.a * s.rr) + '}{' + s.D + '}=' + s.y) + '. The solution point is ' + t(ptT([s.x, s.y])) + '.',
              ['Substitute ' + t('k=' + s.k) + ' into your expressions for ' + t('x') + ' and ' + t('y') + ', or solve the system directly.'], 'EP12b point');
          } },
          { id: 'e12c', sub: 'c', level: 'BEG', make: function (r, s) {
            var P = [s.x, s.y], E1k = eqT(s.a, 1, s.k);
            var c1 = t(subT(s.a, 1, P) + '=' + s.k), c2 = t(subT(s.p, -s.q, P) + '=' + s.rr), c3 = t(num(s.y) + '=' + num(s.x) + sg(s.sh));
            return mc(r, '(c) Which work verifies that ' + t(ptT(P)) + ' satisfies all <b>three</b> equations ' + t(E1k) + ', ' + t(s.E2) + ' and ' + t(s.E3) + '?', [
              { html: c1 + ' ✓, ' + c2 + ' ✓ and ' + c3 + ' ✓.', right: true },
              { html: c1 + ' ✓ and ' + c2 + ' ✓ — the third line doesn’t need checking.', why: 'The point was chosen to lie on ' + t(s.E3) + ' as well — that is the whole question. Check all three.' },
              { html: c3 + ' ✓ — the point is on the line, so it’s done.', why: 'Being on ' + t(s.E3) + ' isn’t enough: it must solve the system too. Check all three equations.' },
              { html: c1 + ' ✓ but ' + t(subT(s.p, -s.q, P) + '=' + (s.rr + 2)) + ' ✗.', why: 'Redo the arithmetic: ' + t(subT(s.p, -s.q, P) + '=' + s.rr) + '.' }],
              'In ' + t(E1k) + ': ' + t(ck(subT(s.a, 1, P) + '=' + s.k)) + '. In ' + t(s.E2) + ': ' + t(ck(subT(s.p, -s.q, P) + '=' + s.rr)) + '. In ' + t(s.E3) + ': ' + t(ck(num(s.y) + '=' + num(s.x) + sg(s.sh))) + '.',
              ['Substitute the point into each of the three equations.'], 'EP12c verify three');
          } },
          { id: 'e12d', sub: 'd', level: 'PRG', make: function (r, s) {
            var Ez = eqT(s.p, -s.q, 0);
            return mc(r, '(d) Why is there <b>no</b> value of ' + t('k') + ' for which the solution of ' + both(s.E1, s.E2) + ' lies on the line ' + t(Ez) + '?', [
              { html: 'The solution always satisfies ' + t(s.E2) + ', so ' + t(lin([s.p, -s.q], ['x', 'y'])) + ' would have to equal both ' + t(s.rr) + ' and ' + t(0) + '. ' + t('k') + ' doesn’t appear in that expression, so it can’t help: the two lines are parallel.', right: true },
              { html: 'Because ' + t('k') + ' would have to be ' + t(0) + ', and then there is no solution.', why: 'With ' + t('k=0') + ' the system still has a solution. Compare ' + t(Ez) + ' with the second equation.' },
              { html: 'Because the solution always has a fractional ' + t('x') + '-coordinate.', why: 'It doesn’t — in (b) the solution was ' + t(ptT([s.x, s.y])) + '. Compare ' + t(Ez) + ' with ' + t(s.E2) + '.' },
              { html: 'There is such a value: ' + t('k=' + s.k) + '.', why: 'With ' + t('k=' + s.k) + ' the point is ' + t(ptT([s.x, s.y])) + ': ' + t(subT(s.p, -s.q, [s.x, s.y]) + '=' + s.rr + '\\neq 0') + '.' }],
              'Every solution satisfies ' + t(s.E2) + '. A point on ' + t(Ez) + ' would make ' + t(lin([s.p, -s.q], ['x', 'y'])) + ' equal ' + t(0) + ' and ' + t(s.rr) + ' at once — impossible, and ' + t('k') + ' appears nowhere in that expression. Geometrically, ' + t(Ez) + ' and ' + t(s.E2) + ' are parallel and distinct (same slope ' + t(frT(s.p, s.q)) + ').',
              ['Compare ' + t(Ez) + ' with the second equation of the system.'], 'EP12d no k');
          } }] },
      /* ---------------- EP 13 ---------------- */
      { num: '13', stem: function (s) { return 'In the system ' + both(s.E1, s.E2) + ', ' + t('k') + ' is an <b>integer</b>.'; },
        shared: function (r) {
          var book = { q: 3, p: 2, sv: 4, N: 24 };
          var s = r.chance(0.2) ? book : find(function () { var q = r.int(2, 4), p = r.int(1, 3), sv = r.int(1, 6), N = r.pick([12, 18, 20, 24, 24, 30, 36]); if (N - q * sv <= 0) return null; return { q: q, p: p, sv: sv, N: N }; }, book);
          s.c = s.N - s.q * s.sv; s.qp = s.q * s.p; s.E1 = 'kx+' + s.q + 'y=' + s.c; s.E2 = eqT(s.p, -1, s.sv);
          s.divs = []; for (var d = 1; d <= s.N; d++) if (s.N % d === 0) s.divs.push(d);
          s.ks = s.divs.map(function (d) { return d - s.qp; }); s.kMax = s.N - s.qp; return s;
        },
        parts: [
          { id: 'e13a', sub: 'a', level: 'PRG', make: function (r, s) {
            return numBoxes('(a) Substituting ' + t('y=' + lin([s.p], ['x']) + '-' + s.sv) + ' reduces the system to ' + t('(k+\\square)\\,x=\\square') + '. Fill in the boxes, and state the one value of ' + t('k') + ' for which the system has no solution.', [
              { label: t('(k+\\square)') + ':', v: s.qp, name: 'first box' }, { label: t('=\\square') + ':', v: s.N, name: 'second box', diag: function (v) { return near(v, s.c) ? { code: 'u8l6-rhs-unscaled', hint: 'The ' + t(-s.q * s.sv) + ' from ' + t(s.q + '(' + lin([s.p], ['x']) + '-' + s.sv + ')') + ' moves to the right side too: ' + t(s.c + '+' + (s.q * s.sv)) + '.' } : null; } },
              { label: 'no solution when ' + t('k='), v: -s.qp, name: 'k', diag: function (v) { return near(v, s.qp) ? { code: 'sign', hint: 'Solve ' + t('k+' + s.qp + '=0') + '.' } : null; } }],
              t(s.E2 + '\\Rightarrow y=' + lin([s.p], ['x']) + '-' + s.sv) + '. Substitute into ' + t(s.E1) + ': ' + t('kx+' + s.q + '(' + lin([s.p], ['x']) + '-' + s.sv + ')=' + s.c + '\\Rightarrow kx+' + s.qp + 'x-' + (s.q * s.sv) + '=' + s.c) + ', so ' + t('(k+' + s.qp + ')x=' + s.N) + '.<br>No solution when the left side vanishes but the right doesn’t: ' + t('k+' + s.qp + '=0') + ', i.e. ' + t('k=' + (-s.qp)) + ', leaving ' + t('0=' + s.N) + '.',
              ['Solve the second equation for ' + t('y') + ' and substitute into the first.'], 'EP13a reduce', {});
          } },
          { id: 'e13b', sub: 'b', level: 'ADV', make: function (r, s) {
            var want = s.ks.slice().sort(function (a, b) { return a - b; }), neg = s.divs.map(function (d) { return -d - s.qp; });
            var check = function (resp) {
              var raw = String(resp == null ? '' : resp).replace(/\\left|\\right|\\lbrace|\\rbrace|\\\{|\\\}|[{}]|\\text\{[^}]*\}|k\s*=|\\in/g, ' ').replace(/\\,|\\ |\\;/g, ' ').trim();
              if (!raw) return form('empty', 'Type the list of values of ' + t('k') + ', separated by commas.');
              var bits = raw.split(/[,;]+/).map(function (b) { return b.trim(); }).filter(Boolean), vals = [];
              for (var i = 0; i < bits.length; i++) { var a = ex.parse(bits[i]); if (!a.ok) return form('u8l6-list', 'Write the values as a list of integers separated by commas, e.g. ' + t('-5,\\ -4,\\ 0') + '.'); var v = ex.value(a.ast); if (!isInt(v)) return wrong('u8l6-k-int', t('k') + ' must be an integer.'); vals.push(Math.round(v)); }
              var seen = {}; for (var j = 0; j < vals.length; j++) { if (seen[vals[j]]) return form('duplicate', 'You listed ' + t(vals[j]) + ' more than once.'); seen[vals[j]] = 1; }
              if (vals.indexOf(-s.qp) >= 0) return wrong('u8l6-k-none', 'With ' + t('k=' + (-s.qp)) + ' the system has no solution at all, so there is no ' + t('x') + '-coordinate.');
              var negIn = vals.filter(function (v) { return neg.indexOf(v) >= 0; }); if (negIn.length) return wrong('u8l6-k-negx', 'With ' + t('k=' + negIn[0]) + ', ' + t('x=\\frac{' + s.N + '}{' + (negIn[0] + s.qp) + '}') + ' is negative — not a whole number. ' + t('k+' + s.qp) + ' must be a <b>positive</b> divisor of ' + t(s.N) + '.');
              var bad = vals.filter(function (v) { return want.indexOf(v) < 0; }); if (bad.length) return wrong('u8l6-k-bad', 'With ' + t('k=' + bad[0]) + ', ' + t('x=\\frac{' + s.N + '}{' + (bad[0] + s.qp) + '}') + ' isn’t a whole number.');
              var miss = want.filter(function (v) { return vals.indexOf(v) < 0; }); if (miss.length) return wrong('u8l6-k-missing', 'Correct so far — but you have ' + vals.length + ' of the ' + want.length + ' values. List every positive divisor of ' + t(s.N) + ' first.');
              for (var q = 1; q < vals.length; q++) if (vals[q] < vals[q - 1]) return form('u8l6-order', 'Right values — now list them in order, from least to greatest.');
              return ok();
            };
            var key = want.join(',\\ ');
            return { prompt: '(b) The system reduces to ' + t('(k+' + s.qp + ')x=' + s.N) + '. Determine <b>every</b> integer ' + t('k') + ' for which the ' + t('x') + '-coordinate of the solution is a whole number. List them in order, separated by commas.',
              input: { type: 'math', keys: 'set', vars: ['k'], placeholder: 'e.g. -5, -4, 0' }, check: check, key: key, answer: t(key),
              solution: t('x=\\frac{' + s.N + '}{k+' + s.qp + '}') + ' is a whole number exactly when ' + t('k+' + s.qp) + ' is a <b>positive</b> divisor of ' + t(s.N) + ' (a negative one makes ' + t('x') + ' negative):<br>' + t('k+' + s.qp + '\\in\\{' + s.divs.join(',') + '\\}') + ', so ' + t('k\\in\\{' + want.join(',\\ ') + '\\}') + ', giving ' + t('x=' + s.divs.map(function (d) { return s.N / d; }).join(',\\ ')) + ' in that order.',
              hints: ['Write ' + t('x=\\frac{' + s.N + '}{k+' + s.qp + '}') + '. When is that a whole number?', 'List the positive divisors of ' + t(s.N) + ', then subtract ' + t(s.qp) + ' from each.'], text: 'EP13b integer k list',
              bad: [want.slice(1).join(','), want.concat([neg[0]]).join(','), want.slice().reverse().join(',')], good: ['\\left\\lbrace ' + want.join(',') + '\\right\\rbrace'] };
          } },
          { id: 'e13c', sub: 'c', level: 'PRG', make: function (r, s) {
            var E1k = eqT(s.kMax, s.q, s.c), P = [1, s.p - s.sv];
            return ptPart('(c) The largest ' + t('k') + ' on the list is ' + t('k=' + s.kMax) + '. Solve ' + both(E1k, s.E2) + ' completely.', P, [L(s.kMax, s.q, s.c), L(s.p, -1, s.sv)], {},
              t('(' + s.kMax + '+' + s.qp + ')x=' + s.N + '\\Rightarrow ' + s.N + 'x=' + s.N + '\\Rightarrow x=1') + ', ' + t('y=' + s.p + '(1)-' + s.sv + '=' + P[1]) + '. Solution ' + t(ptT(P)) + '.<br>Check: ' + t(ck(subT(s.kMax, s.q, P) + '=' + s.c)) + ', ' + t(ck(subT(s.p, -1, P) + '=' + s.sv)) + '.',
              ['The largest ' + t('k') + ' makes ' + t('k+' + s.qp + '=' + s.N) + ', so ' + t('x=1') + '.'], 'EP13c largest k');
          } },
          { id: 'e13d', sub: 'd', level: 'PRG', make: function (r, s) {
            return mc(r, '(d) For ' + t('x=\\frac{' + s.N + '}{k+' + s.qp + '}') + ': why does the list of ' + t('k') + '-values stop at ' + t('k=' + s.kMax) + ', and why can ' + t('x=0') + ' never occur?', [
              { html: 'For ' + t('k>' + s.kMax) + ', ' + t('k+' + s.qp + '>' + s.N) + ', so ' + t('x') + ' is strictly between ' + t(0) + ' and ' + t(1) + '. And ' + t('x=0') + ' would need ' + t(s.N + '=0') + ': a fraction with a non-zero numerator is never ' + t(0) + '.', right: true },
              { html: 'For larger ' + t('k') + ' the system has no solution, and ' + t('x=0') + ' happens only when ' + t('k=0') + '.', why: 'Larger ' + t('k') + ' still gives a solution, just not a whole-number ' + t('x') + '. And ' + t('k=0') + ' gives ' + t('x=\\frac{' + s.N + '}{' + s.qp + '}') + '.' },
              { html: t('x') + ' becomes negative for larger ' + t('k') + ', and ' + t('x=0') + ' happens when ' + t('k=-' + s.qp) + '.', why: 'For ' + t('k>' + s.kMax) + ' the denominator is positive, so ' + t('x>0') + '. And ' + t('k=-' + s.qp) + ' gives no solution at all.' },
              { html: 'Integers stop at ' + t(s.kMax) + ', and ' + t('x=0') + ' needs a very large ' + t('k') + '.', why: 'There are integers beyond ' + t(s.kMax) + '. As ' + t('k') + ' grows, ' + t('x') + ' gets closer to ' + t(0) + ' but never reaches it.' }],
              'For every ' + t('k>' + s.kMax) + ', the denominator ' + t('k+' + s.qp) + ' exceeds ' + t(s.N) + ', so ' + t('x') + ' is positive but less than ' + t(1) + ' — never a whole number. ' + t('x=0') + ' would require ' + t('\\frac{' + s.N + '}{k+' + s.qp + '}=0') + ', i.e. ' + t(s.N + '=0') + ': impossible, however large the denominator.',
              ['What happens to a fraction with a fixed numerator as its denominator grows?'], 'EP13d explain');
          } }] },
      /* ---------------- EP 14 ---------------- */
      { num: '14', section: 'Extra practice G — Loose Ends From Lessons 1 to 5', stem: 'Each system must be tidied up before any method can start. Clear it, choose a method, and solve.', parts: [
        { id: 'e14a', sub: 'a', level: 'PRG', make: function (r) {
          var book = { x0: 3, y0: 1, d1: 5, d2: 2, al: 2, be: 3, d3: 4, d4: 3 };
          var s = r.chance(0.25) ? book : find(function () {
            var x0 = r.int(1, 6), y0 = nz(r, -2, 4), dd = r.pick([[5, 2], [3, 2], [2, 3], [5, 3], [3, 5]]), al = r.int(1, 3), be = r.int(1, 3), d34 = r.pick([[4, 3], [3, 4], [2, 3], [4, 5], [6, 4], [5, 2]]);
            var R1 = (al * x0 - y0) / dd[0] + (x0 + be * y0) / dd[1]; if (!isInt(R1) || R1 === 0) return null;
            if (x0 / d34[0] - y0 / d34[1] === 0) return null;
            var L2t = lcm(d34[0], d34[1]); if ((al * dd[1] + dd[0]) * (-L2t / d34[1]) - (L2t / d34[0]) * (-dd[1] + be * dd[0]) === 0) return null;
            return { x0: x0, y0: y0, d1: dd[0], d2: dd[1], al: al, be: be, d3: d34[0], d4: d34[1] };
          }, book);
          var R1 = rd((s.al * s.x0 - s.y0) / s.d1 + (s.x0 + s.be * s.y0) / s.d2), L1 = s.d1 * s.d2, A1 = s.al * s.d2 + s.d1, B1 = -s.d2 + s.be * s.d1, C1 = R1 * L1;
          var L2 = lcm(s.d3, s.d4), A2 = L2 / s.d3, B2 = -L2 / s.d4, R2n = s.x0 * L2 / s.d3 - s.y0 * L2 / s.d4, R2 = Ln.toFr(R2n / L2);
          var det = A1 * B2 - A2 * B1;
          var w = function (c1, c2) { var xx = (c1 * B2 - B1 * c2) / det, yy = (A1 * c2 - A2 * c1) / det; return [xx, yy]; };   // RHS not scaled
          var wp = w(R1, R2n / L2);
          var E1 = '\\dfrac{' + lin([s.al, -1], ['x', 'y']) + '}{' + s.d1 + '}+\\dfrac{' + lin([1, s.be], ['x', 'y']) + '}{' + s.d2 + '}=' + R1, E2 = '\\dfrac{x}{' + s.d3 + '}-\\dfrac{y}{' + s.d4 + '}=' + frT(R2[0], R2[1]).replace('\\frac', '\\dfrac');
          var W = []; if (isFinite(wp[0]) && !(near(wp[0], s.x0) && near(wp[1], s.y0))) W.push({ is: wp, code: 'u8l6-clear-one-side', hint: 'It looks like the fractions were cleared on the left side only. Multiply <b>both</b> sides of each equation by its LCD.' });
          return ptPart(stack(E1, E2), [s.x0, s.y0], [[A1, B1, -C1], [A2, B2, -R2n]], { wrong: W },
            'First equation, LCD ' + t(L1) + ': ' + t(s.d2 + '(' + lin([s.al, -1], ['x', 'y']) + ')+' + s.d1 + '(' + lin([1, s.be], ['x', 'y']) + ')=' + C1 + '\\Rightarrow ' + eqT(A1, B1, C1)) + '<br>Second equation, LCD ' + t(L2) + ': ' + t(eqT(A2, B2, R2n)) + '<br>Solve (substitution or elimination): ' + t(ptT([s.x0, s.y0])) + '.<br>Check in the originals: ' + t(ck('\\frac{' + (s.al * s.x0 - s.y0) + '}{' + s.d1 + '}+\\frac{' + (s.x0 + s.be * s.y0) + '}{' + s.d2 + '}=' + R1)) + ' and ' + t(ck('\\frac{' + s.x0 + '}{' + s.d3 + '}-\\frac{' + s.y0 + '}{' + s.d4 + '}=' + frT(R2[0], R2[1]))) + '.',
            ['Multiply every term of each equation (both sides) by its lowest common denominator, then collect like terms.'], 'EP14a fractions system');
        } },
        { id: 'e14b', sub: 'b', level: 'PRG', make: function (r) {
          var book = { x0: 9, y0: 0, e: [[2, 1, -3, 5, 3, 1, 1, -4], [4, 2, 1, -7, 5, 1, -1, 20]] };
          var s = r.chance(0.25) ? book : find(function () {
            var x0 = r.int(-3, 9), y0 = r.int(-3, 4), eqs = [], rows = [];
            for (var i = 0; i < 2; i++) {
              var A = r.int(2, 5), p1 = r.pick([1, 1, 2]), q1 = nz(r, -3, 3), C = nz(r, -9, 9), D = r.int(2, 5), p2 = r.pick([1, 1, 2]), q2 = nz(r, -3, 3);
              if (A === D) return null;
              var G = A * (p1 * x0 + q1 * y0) + C - D * (p2 * x0 + q2 * y0); if (G === 0) return null;
              var ax = A * p1 - D * p2, by = A * q1 - D * q2; if (ax === 0 || by === 0) return null;
              eqs.push([A, p1, q1, C, D, p2, q2, G]); rows.push([ax, by]);
            }
            if (rows[0][0] * rows[1][1] - rows[1][0] * rows[0][1] === 0) return null;
            return { x0: x0, y0: y0, e: eqs };
          }, book);
          var side = function (A, p, q) { return A + '(' + lin([p, q], ['x', 'y']) + ')'; };
          var Ts = s.e.map(function (e) { return side(e[0], e[1], e[2]) + sg(e[3]) + '=' + side(e[4], e[5], e[6]) + sg(e[7]); });
          var simp = s.e.map(function (e) { return [e[0] * e[1] - e[4] * e[5], e[0] * e[2] - e[4] * e[6], e[7] - e[3]]; });
          var bad = s.e.map(function (e) { return [e[0] * e[1] - e[4] * e[5], e[2] - e[6], e[7] - e[3]]; });   // bracket multiplied into the first term only
          var d0 = simp[0][0] * simp[1][1] - simp[1][0] * simp[0][1], db = bad[0][0] * bad[1][1] - bad[1][0] * bad[0][1], W = [];
          if (db !== 0) { var bx = (bad[0][2] * bad[1][1] - bad[0][1] * bad[1][2]) / db, by2 = (bad[0][0] * bad[1][2] - bad[1][0] * bad[0][2]) / db; if (!(near(bx, s.x0) && near(by2, s.y0))) W.push({ is: [bx, by2], code: 'u8l6-distribute', hint: 'Check the brackets: the number in front multiplies <b>every</b> term inside, e.g. ' + t(s.e[0][0] + '(' + lin([s.e[0][1], s.e[0][2]], ['x', 'y']) + ')=' + lin([s.e[0][0] * s.e[0][1], s.e[0][0] * s.e[0][2]], ['x', 'y'])) + '.' }); }
          return ptPart(stack(Ts[0], Ts[1]), [s.x0, s.y0], simp.map(function (q) { return [q[0], q[1], -q[2]]; }), { wrong: W },
            'Expand and collect each equation:<br>' + t(Ts[0] + '\\Rightarrow ' + eqT(simp[0][0], simp[0][1], simp[0][2])) + '<br>' + t(Ts[1] + '\\Rightarrow ' + eqT(simp[1][0], simp[1][1], simp[1][2])) + '<br>Solving gives ' + t(ptT([s.x0, s.y0])) + '.<br>Check in the originals: both sides of the first equal ' + t(s.e[0][0] * (s.e[0][1] * s.x0 + s.e[0][2] * s.y0) + s.e[0][3]) + ', both sides of the second equal ' + t(s.e[1][0] * (s.e[1][1] * s.x0 + s.e[1][2] * s.y0) + s.e[1][3]) + ' ✓.',
            ['Expand every bracket, then move the variable terms to the left and the constants to the right.'], 'EP14b brackets system');
        } }] },
      /* ---------------- EP 15 ---------------- */
      { num: '15', stem: function (s) { return 'An airport moving walkway runs ' + t(s.D) + ' m from one end to the other. Walking <i>with</i> the walkway, Nadia covers its full length in ' + t(s.t1) + ' s. Walking <i>against</i> it at the same walking pace, she covers the same ' + t(s.D) + ' m in ' + t(s.t2) + ' s.'; },
        shared: function (r) {
          var book = { w: 2, c: 1, D: 120 };
          var s = r.chance(0.2) ? book : find(function () { var wc = r.pick([[2, 1], [1.5, 0.5], [3, 1], [2.5, 0.5], [2, 0.5], [2.5, 1.5]]), D = r.pick([60, 72, 90, 96, 120, 150, 180]); var w = wc[0], c = wc[1]; if (![D / (w + c), D / (w - c), D / c, D / w].every(isInt)) return null; return { w: w, c: c, D: D }; }, book);
          s.t1 = s.D / (s.w + s.c); s.t2 = s.D / (s.w - s.c); s.s1 = rd(s.w + s.c); s.s2 = rd(s.w - s.c); return s;
        },
        parts: [
          { id: 'e15a', sub: 'a', level: 'PRG', make: function (r, s) {
            return sysPart('(a) Let ' + t('w') + ' be Nadia’s walking speed and ' + t('c') + ' the speed of the walkway, both in m/s. Using speed ' + t('=') + ' distance ÷ time, write a system of two equations.', [{ A: 1, B: 1, C: -s.s1 }, { A: 1, B: -1, C: -s.s2 }], {
              vars: ['w', 'c'], labels: ['With:', 'Against:'], keyTex: ['w+c=' + num(s.s1), 'w-c=' + num(s.s2)],
              diags: [{ is: [1, 1, -s.t1], code: 'u8l6-time-speed', hint: t(s.t1) + ' s is a time. The equation needs a <b>speed</b>: ' + t('\\frac{' + s.D + '}{' + s.t1 + '}=' + num(s.s1)) + ' m/s.' }, { is: [1, -1, -s.t2], code: 'u8l6-time-speed', hint: t(s.t2) + ' s is a time. The equation needs a <b>speed</b>: ' + t('\\frac{' + s.D + '}{' + s.t2 + '}=' + num(s.s2)) + ' m/s.' },
                { is: [1, -1, -s.s1], code: 'u8l6-with-against', hint: 'With the walkway the two speeds <b>add</b>: ' + t('w+c') + '. Against it they subtract.' }, { is: [1, 1, -s.s2], code: 'u8l6-with-against', hint: 'Against the walkway the speeds <b>subtract</b>: ' + t('w-c') + '. With it they add.' }],
              bad: [['w+c=' + s.t1, 'w-c=' + s.t2]] },
              'With the walkway the speeds add; against it they subtract.<br>With: ' + t('w+c=\\frac{' + s.D + '}{' + s.t1 + '}=' + num(s.s1)) + '<br>Against: ' + t('w-c=\\frac{' + s.D + '}{' + s.t2 + '}=' + num(s.s2)),
              ['Her speed relative to the floor is ' + t('w+c') + ' with the walkway and ' + t('w-c') + ' against it.'], 'EP15a system');
          } },
          { id: 'e15b', sub: 'b', level: 'BEG', make: function (r, s) {
            return ptPart('(b) Solve ' + both('w+c=' + num(s.s1), 'w-c=' + num(s.s2)) + ' by elimination.', [s.w, s.c], [L(1, 1, s.s1), L(1, -1, s.s2)], { vars: ['w', 'c'], keyTex: 'w=' + num(s.w) + ',\\ c=' + num(s.c) },
              'Add: ' + t('2w=' + num(s.s1 + s.s2) + '\\Rightarrow w=' + num(s.w)) + '. Subtract: ' + t('2c=' + num(rd(s.s1 - s.s2)) + '\\Rightarrow c=' + num(s.c)) + '.<br>Check: ' + t(ck(num(s.w) + '+' + num(s.c) + '=' + num(s.s1))) + ', ' + t(ck(num(s.w) + '-' + num(s.c) + '=' + num(s.s2))) + '.',
              ['Add the equations to eliminate ' + t('c') + '.', 'Answer as ' + t('w=\\ldots,\\ c=\\ldots') + '.'], 'EP15b solve');
          } },
          { id: 'e15c', sub: 'c', level: 'BEG', make: function (r, s) {
            return mc(r, '(c) The solution is ' + t('w=' + num(s.w)) + ', ' + t('c=' + num(s.c)) + '. Which sentence states both speeds correctly?', [
              { html: 'Nadia walks at ' + t(num(s.w)) + ' m/s and the walkway moves at ' + t(num(s.c)) + ' m/s.', right: true },
              { html: 'Nadia walks at ' + t(num(s.c)) + ' m/s and the walkway moves at ' + t(num(s.w)) + ' m/s.', why: t('w') + ' is Nadia’s walking speed. (She can walk against the walkway, so she must be faster than it.)' },
              { html: 'Nadia walks at ' + t(num(s.w)) + ' s/m and the walkway moves at ' + t(num(s.c)) + ' s/m.', why: 'Speed is distance per time: metres per second, m/s.' },
              { html: 'Nadia’s total speed is ' + t(num(s.s1)) + ' m/s.', why: 'That’s her speed <i>with</i> the walkway. The question asks for each speed separately.' }],
              '<b>Nadia walks at ' + num(s.w) + ' m/s and the walkway moves at ' + num(s.c) + ' m/s.</b>', ['Which letter is Nadia, and which is the walkway? What are the units?'], 'EP15c sentence');
          } },
          { id: 'e15d', sub: 'd', level: 'EMG', make: function (r, s) {
            return numBoxes('(d) Nadia walks at ' + t(num(s.w)) + ' m/s and the walkway moves at ' + t(num(s.c)) + ' m/s. How long would the walkway take to carry a passenger who just stands still on it, and how long would Nadia take to walk ' + t(s.D) + ' m on ordinary floor?', [
              { label: 'standing on the walkway:', after: 's', v: s.D / s.c, diag: function (v) { return near(v, s.D * s.c) ? { code: 'u8l6-time-speed', hint: 'time ' + t('=') + ' distance ÷ speed: ' + t('\\frac{' + s.D + '}{' + num(s.c) + '}') + '.' } : null; } },
              { label: 'walking on the floor:', after: 's', v: s.D / s.w, diag: function (v) { return near(v, s.D * s.w) ? { code: 'u8l6-time-speed', hint: 'time ' + t('=') + ' distance ÷ speed: ' + t('\\frac{' + s.D + '}{' + num(s.w) + '}') + '.' } : null; } }],
              'Standing still, the walkway alone carries her: ' + t('t=\\frac{' + s.D + '}{' + num(s.c) + '}=' + (s.D / s.c)) + ' s. Walking on the floor: ' + t('t=\\frac{' + s.D + '}{' + num(s.w) + '}=' + (s.D / s.w)) + ' s.',
              ['time ' + t('=') + ' distance ÷ speed.'], 'EP15d times', { swapHint: 'Check which is which: standing still, only the walkway’s speed counts.' });
          } }] },
      /* ---------------- EP 16 ---------------- */
      { num: '16', stem: function (s) { return 'A dairy blends cream that is ' + t(s.p1 + '\\%') + ' butterfat with skim milk that is ' + t(s.p2 + '\\%') + ' butterfat to produce ' + t(s.V) + ' L of a product that is ' + t(s.pt + '\\%') + ' butterfat. Let ' + t('x') + ' be the litres of cream and ' + t('y') + ' the litres of skim milk.'; },
        shared: function (r) {
          var book = { p1: 32, p2: 2, pt: 10, V: 60 };
          var s = r.chance(0.2) ? book : find(function () { var p1 = r.pick([30, 32, 35, 36, 40]), p2 = r.pick([1, 2, 3, 4]), pt = r.pick([6, 8, 10, 12, 15, 20]), V = r.pick([40, 50, 60, 80, 100, 120]); if (pt <= p2 + 2 || pt >= p1 - 5) return null; var x0 = V * (pt - p2) / (p1 - p2); if (!isInt(x0) || x0 <= 0 || x0 >= V) return null; return { p1: p1, p2: p2, pt: pt, V: V }; }, book);
          s.x0 = s.V * (s.pt - s.p2) / (s.p1 - s.p2); s.y0 = s.V - s.x0; s.B = s.pt * s.V / 100; s.k = s.p1 - s.p2; s.hi = s.p1 + 3; return s;
        },
        parts: [
          { id: 'e16a', sub: 'a', level: 'PRG', make: function (r, s) {
            return sysPart('(a) Write a system — one equation for total volume, one for total butterfat.', [{ A: 1, B: 1, C: -s.V }, { A: s.p1, B: s.p2, C: -100 * s.B }], {
              labels: ['Volume:', 'Butterfat:'], keyTex: ['x+y=' + s.V, pc(s.p1) + 'x+' + pc(s.p2) + 'y=' + num(s.B)], alt: [[], [[s.p1 - s.pt, s.p2 - s.pt, 0]]],
              diags: [{ is: [s.p1, s.p2, -100 * s.pt], code: 'u8l6-mix-percent', hint: 'The butterfat equation counts litres of butterfat: ' + t(pc(s.pt) + '\\times ' + s.V + '=' + num(s.B)) + ' L, not ' + t(s.pt) + '.' },
                { is: [100 * s.p1, 100 * s.p2, -100 * s.B], code: 'u8l6-mix-decimal', hint: 'Write the percents as decimals: ' + t(s.p1 + '\\%=' + pc(s.p1)) + ', ' + t(s.p2 + '\\%=' + pc(s.p2)) + '.' },
                { is: [s.p1, s.p2, -s.pt], code: 'u8l6-mix-percent', hint: 'The right side is an amount of butterfat in litres: ' + t(pc(s.pt) + '\\times ' + s.V + '=' + num(s.B)) + '.' }],
              bad: s.B === s.pt ? [] : [['x+y=' + s.V, pc(s.p1) + 'x+' + pc(s.p2) + 'y=' + s.pt]], good: [['x+y=' + s.V, pc(s.p1) + 'x+' + pc(s.p2) + 'y=' + pc(s.pt) + '(x+y)']] },
              'Volume: ' + t('x+y=' + s.V) + '<br>Butterfat: ' + t(pc(s.p1) + 'x+' + pc(s.p2) + 'y=' + pc(s.pt) + '(' + s.V + ')=' + num(s.B)),
              ['One equation adds litres of liquid; the other adds litres of butterfat (percent as a decimal × volume).'], 'EP16a system');
          } },
          { id: 'e16b', sub: 'b', level: 'EMG', make: function (r, s) {
            var g = s.p2, a = s.p1 / g, rhs = 100 * s.B / g;   // after ×100 and ÷p2: a x + y = rhs
            var check = function (resp) {
              resp = resp || []; var A = HW.parse.number(String(resp[0] || '')), Bv = HW.parse.number(String(resp[1] || ''));
              if (!A.ok || !Bv.ok) return form('empty', 'Fill in both boxes with numbers.');
              if (A.value !== 0 && near(Bv.value / A.value, s.x0)) return ok();
              if (near(A.value, s.p1 - s.p2) && near(Bv.value, 100 * s.B - s.V)) return wrong('u8l6-elim-scale', 'Scale the volume equation to match the ' + t('y') + '-coefficient first (×' + t(s.p2) + '), then subtract.');
              return wrong('u8l6-elim', 'Clear the decimals (×' + t(100) + '), make the ' + t('y') + '-coefficients match, then subtract the volume equation.');
            };
            var cx = s.p1 - s.p2, cr = 100 * s.B - s.p2 * s.V, gg = (cx % s.p2 === 0 && cr % s.p2 === 0) ? s.p2 : 1;
            return { prompt: '(b) Clear the decimals in ' + t(pc(s.p1) + 'x+' + pc(s.p2) + 'y=' + num(s.B)) + ' and eliminate ' + t('y') + ' using ' + t('x+y=' + s.V) + '. The result has the form ' + t('\\square\\,x=\\square') + '.', input: { type: 'fields', fields: [{ label: 'coefficient:', after: t('x') }, { label: '= ' }] }, check: check,
              key: [String(cx / gg), String(cr / gg)], answer: t((cx / gg) + 'x=' + (cr / gg)) + ' (or any multiple), so ' + t('x=' + s.x0),
              solution: 'Clear the decimals (×' + t(100) + '): ' + t(eqT(s.p1, s.p2, 100 * s.B)) + (g > 1 ? ', i.e. ' + t(eqT(a, 1, rhs)) : '') + '.<br>Subtract ' + (g > 1 ? t('x+y=' + s.V) : t(s.p2 + '(x+y)=' + (s.p2 * s.V))) + ': ' + t((g > 1 ? (a - 1) + 'x=' + (rhs - s.V) : cx + 'x=' + cr) + '\\Rightarrow x=' + s.x0) + ', and ' + t('y=' + s.V + '-' + s.x0 + '=' + s.y0) + '.<br>Check: ' + t(ck(pcS(s.p1) + '(' + s.x0 + ')+' + pcS(s.p2) + '(' + s.y0 + ')=' + num(s.p1 * s.x0 / 100) + '+' + num(s.p2 * s.y0 / 100) + '=' + num(s.B))) + '.',
              hints: ['Multiply the butterfat equation by ' + t(100) + '. Then make the ' + t('y') + '-terms match and subtract.'], text: 'EP16b eliminate', bad: [[String(cx / gg), String(cr / gg + cx / gg)]] };
          } },
          { id: 'e16c', sub: 'c', level: 'EMG', make: function (r, s) {
            return numBoxes('(c) Solving gives ' + t('x=' + s.x0) + '. State how many litres of each ingredient are needed.', [{ label: 'cream:', after: 'L', v: s.x0 }, { label: 'skim milk:', after: 'L', v: s.y0 }],
              '<b>The dairy needs ' + s.x0 + ' L of the ' + s.p1 + '% cream and ' + s.y0 + ' L of the ' + s.p2 + '% skim milk.</b> (' + t('y=' + s.V + '-' + s.x0 + '=' + s.y0) + ')', ['The skim milk makes up the rest of the ' + t(s.V) + ' L.'], 'EP16c litres', { swapHint: t('x') + ' is the cream. Check which box is which.' });
          } },
          { id: 'e16d', sub: 'd', level: 'EMG', make: function (r, s) {
            return mc(r, '(d) Why could no blend of the ' + t(s.p1 + '\\%') + ' cream and the ' + t(s.p2 + '\\%') + ' skim milk ever be ' + t(s.hi + '\\%') + ' butterfat?', [
              { html: 'Every litre poured in is between ' + t(s.p2 + '\\%') + ' and ' + t(s.p1 + '\\%') + ' butterfat, so the blend must land between those two — it can’t be richer than the richest ingredient.', right: true },
              { html: 'Because ' + t(s.hi) + ' doesn’t divide evenly into the total volume.', why: 'Divisibility isn’t the issue. Think about the richest ingredient in the blend.' },
              { html: 'It could — just use more cream.', why: 'Even pure cream is only ' + t(s.p1 + '\\%') + '. Adding skim milk can only lower that.' },
              { html: 'Because the system would have infinitely many solutions.', why: 'Solving gives a negative volume of one ingredient — impossible — not infinitely many solutions.' }],
              'A blend’s percentage is a weighted average of its ingredients, so it lies between ' + t(s.p2 + '\\%') + ' and ' + t(s.p1 + '\\%') + '. Algebraically, ' + t(pcS(s.p1) + 'x+' + pcS(s.p2) + 'y=' + pcS(s.hi) + '(x+y)') + ' forces ' + t('x') + ' and ' + t('y') + ' to have opposite signs — a negative volume.',
              ['What is the butterfat percentage of pure cream? Can mixing in skim milk raise it?'], 'EP16d impossible blend');
          } }] },
      /* ---------------- EP 17 ---------------- */
      { num: '17', stem: function (s) { return 'In a certain fraction the numerator is ' + t(s.dl) + ' less than the denominator. When ' + t(s.a) + ' is added to <i>both</i> the numerator and the denominator, the new fraction is exactly ' + t('\\dfrac{' + s.p + '}{' + s.q + '}') + '.'; },
        shared: function (r) {
          var book = { p: 4, q: 5, dl: 5, a: 3 };
          var s = r.chance(0.2) ? book : find(function () { var pq = r.pick([[4, 5], [2, 3], [3, 4], [5, 6], [3, 5], [5, 7], [2, 5]]), dl = r.int(2, 8), a = r.int(1, 5), tt = dl / (pq[1] - pq[0]); if (!isInt(tt)) return null; var n = pq[0] * tt - a, d = pq[1] * tt - a; if (n <= 0 || gcd(n, d) !== 1 || tt < 2) return null; return { p: pq[0], q: pq[1], dl: dl, a: a }; }, book);
          var tt = s.dl / (s.q - s.p); s.n0 = s.p * tt - s.a; s.d0 = s.q * tt - s.a; s.C2 = (s.p - s.q) * s.a;   // q n − p d = (p − q) a
          s.e1 = 'n=d-' + s.dl; s.e2 = s.q + 'n-' + s.p + 'd=' + s.C2; return s;
        },
        parts: [
          { id: 'e17a', sub: 'a', level: 'PRG', make: function (r, s) {
            return sysPart('(a) Let ' + t('n') + ' be the numerator and ' + t('d') + ' the denominator. Write a system of two equations, clearing the fraction in the second one.', [{ A: 1, B: -1, C: s.dl }, { A: s.q, B: -s.p, C: -s.C2 }], {
              vars: ['n', 'd'], labels: ['Difference:', 'New fraction:'], keyTex: [s.e1, s.e2],
              pre: function (raw) { for (var i = 0; i < 2; i++) if (/\\frac\{[^}]*\}\{[^}]*[nd][^}]*\}|\/\s*\(?\s*[nd]/.test(raw[i])) return form('u8l6-clear-frac', 'Clear the fraction first: cross-multiply ' + t('\\frac{n+' + s.a + '}{d+' + s.a + '}=\\frac{' + s.p + '}{' + s.q + '}') + ' to get ' + t(s.q + '(n+' + s.a + ')=' + s.p + '(d+' + s.a + ')') + '.'); return null; },
              diags: [{ is: [s.p, -s.q, (s.p - s.q) * s.a], code: 'u8l6-cross', hint: 'Cross-multiply carefully: the numerator ' + t('n+' + s.a) + ' goes with the denominator ' + t(s.q) + ': ' + t(s.q + '(n+' + s.a + ')=' + s.p + '(d+' + s.a + ')') + '.' },
                { is: [1, -1, -s.dl], code: 'u8l6-backwards', hint: 'The numerator is the <b>smaller</b> one: ' + t('n=d-' + s.dl) + '.' },
                { is: [s.q, -s.p, 0], code: 'u8l6-add-both', hint: 'Remember the ' + t(s.a) + ' added to both: ' + t('\\frac{n+' + s.a + '}{d+' + s.a + '}') + '.' }],
              bad: [[s.e1, s.p + 'n-' + s.q + 'd=' + (-s.C2)]] },
              'Numerator ' + t(s.dl) + ' less than the denominator: ' + t(s.e1) + '.<br>' + t('\\frac{n+' + s.a + '}{d+' + s.a + '}=\\frac{' + s.p + '}{' + s.q + '}\\Rightarrow ' + s.q + '(n+' + s.a + ')=' + s.p + '(d+' + s.a + ')\\Rightarrow ' + s.e2) + '.',
              ['Cross-multiply to clear the fraction, then collect the variables on the left.'], 'EP17a system');
          } },
          { id: 'e17b', sub: 'b', level: 'PRG', make: function (r, s) {
            var check = function (resp) {
              var a = K.read(resp); if (a.res) return a.res;
              var pf = ex.plainFraction(a.ast);
              if (!pf) return near(a.val, s.n0 / s.d0) ? form('u8l6-as-fraction', 'Write the fraction itself, ' + t('\\frac{n}{d}') + ', not a decimal.') : wrong('u8l6-frac', null);
              if (pf[0] === s.n0 && pf[1] === s.d0) return ok();
              if (near(pf[0] / pf[1], s.n0 / s.d0)) return wrong('u8l6-equiv-frac', 'Same value — but the conditions are about the actual numerator and denominator. Check: is your numerator ' + t(s.dl) + ' less than your denominator?');
              if (pf[0] === s.d0 && pf[1] === s.n0) return wrong('flip', 'Upside down: the numerator is the smaller number.');
              return wrong('u8l6-frac', null);
            };
            var p = { prompt: '(b) Solve ' + both(s.e1, s.e2) + ' and state the original fraction.', input: { type: 'math', keys: 'fraction' }, check: check, key: '\\frac{' + s.n0 + '}{' + s.d0 + '}', answer: t('\\frac{' + s.n0 + '}{' + s.d0 + '}'),
              solution: 'Substitute ' + t(s.e1) + ' into ' + t(s.e2) + ': ' + t(s.q + '(d-' + s.dl + ')-' + s.p + 'd=' + s.C2 + '\\Rightarrow ' + (s.q - s.p === 1 ? 'd=' + s.d0 : (s.q - s.p) + 'd=' + (s.C2 + s.q * s.dl) + '\\Rightarrow d=' + s.d0)) + ', ' + t('n=' + s.n0) + '.<br>The original fraction is ' + t('\\frac{' + s.n0 + '}{' + s.d0 + '}') + '. Against the words: ' + t(ck(s.d0 + '-' + s.dl + '=' + s.n0)) + ' and ' + t(ck('\\frac{' + s.n0 + '+' + s.a + '}{' + s.d0 + '+' + s.a + '}=\\frac{' + (s.n0 + s.a) + '}{' + (s.d0 + s.a) + '}=\\frac{' + s.p + '}{' + s.q + '}')) + '.',
              hints: ['Substitute ' + t('n=d-' + s.dl) + ' into the second equation.'], text: 'EP17b fraction', bad: ['\\frac{' + (2 * s.n0) + '}{' + (2 * s.d0) + '}', '\\frac{' + s.d0 + '}{' + s.n0 + '}'] };
            return p;
          } },
          { id: 'e17c', sub: 'c', level: 'EMG', make: function (r, s) {
            var n2 = 2 * s.n0, d2 = 2 * s.d0;
            return mc(r, '(c) The fraction is ' + t('\\frac{' + s.n0 + '}{' + s.d0 + '}') + '. A classmate says any equivalent fraction, such as ' + t('\\frac{' + n2 + '}{' + d2 + '}') + ', would do just as well. What goes wrong?', [
              { html: t('\\frac{' + n2 + '}{' + d2 + '}') + ' fails both sentences: ' + t(d2 + '-' + n2 + '=' + (d2 - n2) + '\\neq ' + s.dl) + ', and ' + t('\\frac{' + (n2 + s.a) + '}{' + (d2 + s.a) + '}\\neq\\frac{' + s.p + '}{' + s.q + '}') + '. The conditions are about the actual numbers, not the value.', right: true },
              { html: 'Nothing — equivalent fractions are equal, so ' + t('\\frac{' + n2 + '}{' + d2 + '}') + ' works too.', why: 'Test it: is ' + t(n2) + ' exactly ' + t(s.dl) + ' less than ' + t(d2) + '?' },
              { html: 'It only fails the first sentence; adding ' + t(s.a) + ' to both still gives ' + t('\\frac{' + s.p + '}{' + s.q + '}') + '.', why: 'Compute ' + t('\\frac{' + (n2 + s.a) + '}{' + (d2 + s.a) + '}') + ': ' + t(s.q + '\\times ' + (n2 + s.a) + '=' + s.q * (n2 + s.a)) + ' but ' + t(s.p + '\\times ' + (d2 + s.a) + '=' + s.p * (d2 + s.a)) + '.' },
              { html: 'It only fails because ' + t('\\frac{' + n2 + '}{' + d2 + '}') + ' isn’t in lowest terms.', why: 'Lowest terms isn’t the issue. Test it against both sentences of the problem.' }],
              'Doubling gives ' + t('\\frac{' + n2 + '}{' + d2 + '}') + ', equal in value. But ' + t(d2 + '-' + n2 + '=' + (d2 - n2)) + ', not ' + t(s.dl) + ' (fails), and ' + t('\\frac{' + (n2 + s.a) + '}{' + (d2 + s.a) + '}') + ': ' + t(s.q + '\\times ' + (n2 + s.a) + '=' + s.q * (n2 + s.a)) + ' while ' + t(s.p + '\\times ' + (d2 + s.a) + '=' + s.p * (d2 + s.a)) + ' (fails). Both conditions are about the actual numerator and denominator, so only one fraction works.',
              ['Test the doubled fraction against each sentence.'], 'EP17c equivalent');
          } }] },
      /* ---------------- EP 18 ---------------- */
      { num: '18', stem: 'Two more situations, each needing a system of two equations.', parts: [
        { id: 'e18a', sub: 'a i', level: 'EMG', make: function (r) { var s = ep18a(r);
          return sysPart(s.st + '<br>Let ' + t('b') + ' be the base and ' + t('s') + ' each equal side, in cm. Write a system of two equations.', [{ A: 1, B: 2, C: -s.P }, { A: -s.k, B: 1, C: -s.c }], {
            vars: ['b', 's'], labels: ['Perimeter:', 'Equal side:'], keyTex: ['b+2s=' + s.P, 's=' + s.k + 'b+' + s.c],
            diags: [{ is: [1, 1, -s.P], code: 'u8l6-perimeter', hint: 'An isosceles triangle has <b>two</b> equal sides: ' + t('b+2s=' + s.P) + '.' }, { is: [2, 1, -s.P], code: 'u8l6-perimeter', hint: 'There is one base and two equal sides: ' + t('b+2s') + '.' }, { is: [1, -s.k, s.c], code: 'u8l6-backwards', hint: 'Each <b>equal side</b> is ' + t(s.c) + ' cm more than ' + (s.k === 2 ? 'twice' : 'three times') + ' the base: ' + t('s=' + s.k + 'b+' + s.c) + '.' }],
            bad: [['b+s=' + s.P, 's=' + s.k + 'b+' + s.c]] },
            'Perimeter: ' + t('b+2s=' + s.P) + '. Each equal side: ' + t('s=' + s.k + 'b+' + s.c) + '.', ['Perimeter = base + two equal sides.'], 'EP18a system');
        } },
        { id: 'e18a2', sub: 'a ii', level: 'EMG', make: function (r) { var s = ep18a(r);
          return numBoxes(s.st + '<br>Solve ' + both('b+2s=' + s.P, 's=' + s.k + 'b+' + s.c) + ' and state the base and each equal side.', [{ label: 'base:', after: 'cm', v: s.b0 }, { label: 'each equal side:', after: 'cm', v: s.s0 }],
            'Substitution (' + t('s') + ' is isolated): ' + t('b+2(' + s.k + 'b+' + s.c + ')=' + s.P + '\\Rightarrow ' + (2 * s.k + 1) + 'b=' + (s.P - 2 * s.c) + '\\Rightarrow b=' + s.b0) + ', ' + t('s=' + s.k + '(' + s.b0 + ')+' + s.c + '=' + s.s0) + '.<br>Check: ' + t(ck(s.b0 + '+2(' + s.s0 + ')=' + s.P)) + '; and ' + t(s.s0 + '+' + s.s0 + '>' + s.b0) + ', so it really is a triangle.<br><b>The base is ' + s.b0 + ' cm and each equal side is ' + s.s0 + ' cm.</b>',
            ['Substitute the second equation into the first.'], 'EP18a answer', { swapHint: 'Check which is which: each equal side is longer than the base here.' });
        } },
        { id: 'e18b', sub: 'b i', level: 'PRG', make: function (r) { var s = ep18b(r);
          return sysPart(s.st + '<br>Let ' + t('x') + ' be the dollars in the savings bond and ' + t('y') + ' the dollars in the term deposit. Write a system of two equations.', [{ A: 1, B: 1, C: -s.T }, { A: s.r1 * 10, B: s.r2 * 10, C: -1000 * s.I }], {
            labels: ['Amount:', 'Interest:'], keyTex: ['x+y=' + s.T, s.q1 + 'x+' + s.q2 + 'y=' + num(s.I)],
            diags: [{ is: [s.r1 * 10, s.r2 * 10, -10 * s.I], code: 'u8l6-mix-decimal', hint: 'Write the rates as decimals: ' + t(num(s.r1) + '\\%=' + s.q1) + ', ' + t(num(s.r2) + '\\%=' + s.q2) + '.' }, { is: [1, 1, -s.I], code: 'u8l6-mix-total', hint: 'The amounts invested add to ' + t(money(s.T)) + '. The interest goes in the other equation.' }, { is: [s.r2 * 10, s.r1 * 10, -1000 * s.I], code: 'u8l6-rate-swap', hint: 'The savings bond (' + t('x') + ') pays ' + t(num(s.r1) + '\\%') + '.' }],
            bad: [['x+y=' + s.T, num(s.r1) + 'x+' + num(s.r2) + 'y=' + num(s.I)]] },
            'Amounts: ' + t('x+y=' + s.T) + '. Interest after one year: ' + t(s.q1 + 'x+' + s.q2 + 'y=' + num(s.I)) + '.', ['One equation adds the amounts; the other adds the interest (rate as a decimal × amount).'], 'EP18b system');
        } },
        { id: 'e18b2', sub: 'b ii', level: 'PRG', make: function (r) { var s = ep18b(r);
          return numBoxes(s.st + '<br>Solve ' + both('x+y=' + s.T, s.q1 + 'x+' + s.q2 + 'y=' + num(s.I)) + '. How much went into each?', [{ label: 'savings bond:', before: '$', v: s.x0 }, { label: 'term deposit:', before: '$', v: s.y0 }],
            'Clear the decimals: ' + t(eqT(s.r1 * 10, s.r2 * 10, 1000 * s.I)) + '. From the first equation, ' + t('x=' + s.T + '-y') + ':<br>' + t(num(s.r1 * 10) + '(' + s.T + '-y)+' + num(s.r2 * 10) + 'y=' + num(1000 * s.I) + '\\Rightarrow ' + num(rd(10 * (s.r2 - s.r1))) + 'y=' + num(rd(1000 * s.I - 10 * s.r1 * s.T)) + '\\Rightarrow y=' + s.y0) + ', ' + t('x=' + s.x0) + '.<br>Check: ' + t(ck(s.q1 + '(' + s.x0 + ')+' + s.q2 + '(' + s.y0 + ')=' + num(s.r1 * s.x0 / 100) + '+' + num(s.r2 * s.y0 / 100) + '=' + num(s.I))) + '.<br><b>Mei put ' + t(money(s.x0)) + ' into the savings bond and ' + t(money(s.y0)) + ' into the term deposit.</b>',
            ['Clear the decimals, then substitute ' + t('x=' + s.T + '-y') + '.'], 'EP18b answer', { swapHint: 'Check which is which: ' + t('x') + ' is the savings bond at ' + t(num(s.r1) + '\\%') + '.' });
        } }] },
      /* ---------------- EP 19 ---------------- */
      { num: '19', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: 'e19', level: 'EMG', make: function (r) {
          var a = r.pick([3, 5, 5, 7, 9]), b = r.pick([3, 5, 7, 9, 11, 13, 15, 17, 19, 19, 21]), x = a / 2, y = b / 4;
          var gx = r.chance(0.5) ? Math.floor(x) : Math.ceil(x), gy = Math.round(y) === y ? y + 1 : (y % 1 === 0.25 ? Math.floor(y) : Math.ceil(y));
          return mc(r, 'One system of two linear equations is handed to three students. The first solves it by graphing and reports ' + t(ptT([gx, gy])) + '; the second solves it by substitution and reports ' + t(ptD([x, y])) + '; the third solves it by elimination and reports ' + t('\\left(\\dfrac{' + a + '}{2},\\ \\dfrac{' + b + '}{4}\\right)') + '. Which statement is correct?', [
            { html: 'The grapher must be right, since a graph shows the actual point of intersection.', why: 'A hand graph on a one-unit grid can’t show quarters of a unit — the grapher read the nearest grid point.' },
            { html: 'All three are right, because each used a different method.', why: 'A system has one solution, whatever the method. Different answers mean someone made an error.' },
            { html: 'The second and third students agree exactly, and the first has misread a point that no one-unit grid can display.', right: true },
            { html: 'The system has infinitely many solutions, since three different answers were obtained.', why: 'Three <i>reported</i> answers say nothing about the solution set. Two of them are actually the same point.' }],
            t(num(x) + '=\\frac{' + a + '}{2}') + ' and ' + t(num(y) + '=\\frac{' + b + '}{4}') + ', so the second and third students reported the <b>same</b> point in two notations — both methods are exact. The grapher’s ' + t(ptT([gx, gy])) + ' is a reading error from a grid that cannot display quarters. <b>C</b>',
            ['Convert the decimals to fractions and compare the second and third answers.'], 'EP19 three students', true);
        } }] },
      /* ---------------- EP 20 ---------------- */
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e20', level: 'PRG', make: function (r) {
          var book = { a: 5, b: 2, c: 3, x0: 6, y0: 4, al: 20, be: 6 };
          var s = r.chance(0.2) ? book : find(function () { var a = r.int(2, 7), b = r.int(1, 4), c = r.int(2, 6), x0 = r.int(1, 9), y0 = r.int(1, 9), al = r.pick([10, 15, 20, 25, 30]), be = r.int(2, 9); var v = al * x0 + be * y0; if (v < 100 || v > 999 || x0 === y0 || c * x0 - 2 * b * y0 === 0 || be * x0 + al * y0 === v) return null; return { a: a, b: b, c: c, x0: x0, y0: y0, al: al, be: be }; }, book);
          var c1 = s.a * s.x0 + s.b * s.y0, c2 = s.c * s.x0 - 2 * s.b * s.y0, ans = s.al * s.x0 + s.be * s.y0, E1 = eqT(s.a, s.b, c1), E2 = eqT(s.c, -2 * s.b, c2), ex0 = lin([s.al, s.be], ['x', 'y']);
          return K.P.nr('The system ' + both(E1, E2) + ' has solution ' + t('(x,\\ y)') + '. The value of ' + t(ex0) + ' is ________. <i>(Record your answer as a three-digit number.)</i>', ans, function (v) {
            if (v === s.al * s.y0 + s.be * s.x0) return { code: 'u8l6-swapxy', hint: 'It looks like ' + t('x') + ' and ' + t('y') + ' were swapped: ' + t('x=' + s.x0) + ', ' + t('y=' + s.y0) + '.' };
            if (v === s.x0 + s.y0) return { code: 'u8l6-one-value', hint: 'That’s ' + t('x+y') + '. Now evaluate ' + t(ex0) + '.' };
            return null;
          }, 'Eliminate ' + t('y') + ': ' + t('\\text{Eq.~1}\\times 2:\\ ' + eqT(2 * s.a, 2 * s.b, 2 * c1)) + '. Add ' + t(E2) + ': ' + t((2 * s.a + s.c) + 'x=' + (2 * c1 + c2) + '\\Rightarrow x=' + s.x0) + '.<br>' + t(s.a + '(' + s.x0 + ')+' + (s.b === 1 ? '' : s.b) + 'y=' + c1 + '\\Rightarrow y=' + s.y0) + '. Check: ' + t(ck(subT(s.c, -2 * s.b, [s.x0, s.y0]) + '=' + c2)) + '.<br>' + t(ex0 + '=' + s.al + '(' + s.x0 + ')+' + s.be + '(' + s.y0 + ')=' + ans) + '.',
          ['Multiply the first equation by ' + t(2) + ' so the ' + t('y') + '-terms are opposites, then add.'], 'NR value of ' + ex0);
        } }] }
    ];
  }
  function ep18a(r) {
    var book = { b0: 12, k: 2, c: 7 };
    var s = r.chance(0.25) ? book : { b0: r.int(6, 20), k: r.pick([2, 2, 3]), c: r.int(2, 9) };
    s.s0 = s.k * s.b0 + s.c; s.P = 2 * s.s0 + s.b0;
    s.st = 'An isosceles triangle has a perimeter of ' + t(s.P) + ' cm. Each of its two equal sides is ' + t(s.c) + ' cm more than ' + (s.k === 2 ? 'twice' : 'three times') + ' the length of the base.';
    return s;
  }
  function ep18b(r) {
    var book = { T: 7500, r1: 3, r2: 4.5, x0: 3500 };
    var s = r.chance(0.25) ? book : find(function () { var T = r.pick([5000, 6000, 7500, 8000, 9000, 10000]), r1 = r.pick([2, 2.5, 3, 3.5, 4]), r2 = r.pick([4.5, 5, 5.5, 6]); if (r2 - r1 < 1) return null; var x0 = 500 * r.int(2, T / 500 - 2); var I = (r1 * x0 + r2 * (T - x0)) / 100; if (!isInt(I * 100)) return null; return { T: T, r1: r1, r2: r2, x0: x0 }; }, book);
    s.y0 = s.T - s.x0; s.I = rd((s.r1 * s.x0 + s.r2 * s.y0) / 100, 2); s.q1 = pcS(s.r1); s.q2 = pcS(s.r2);
    s.st = 'Mei invested ' + t(money(s.T)) + ' in two places: part in a savings bond paying ' + t(num(s.r1) + '\\%') + ' per year, and the rest in a term deposit paying ' + t(num(s.r2) + '\\%') + ' per year. After one year the two together had earned ' + t(money(s.I)) + ' in interest.';
    return s;
  }
  function asn(r, sub, it) {
    var names = { A: 'Always true', S: 'Sometimes true', N: 'Never true' };
    var opts = ['A', 'S', 'N'].map(function (k) { return { html: '<b>' + names[k] + '</b>', right: it.v === k, why: it.v === k ? null : it.w[k], code: 'asn-' + k }; });
    return K.P.mc(r, '(' + sub + ') “' + it.s + '”', opts, it.sol, ['One counter-example is enough to rule out “always”; one example is enough to rule out “never”.'], 'EP9' + sub + ' ' + it.v, true);
  }
})(window);
