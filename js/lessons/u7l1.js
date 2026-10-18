/* Math 10C · Unit 7 · Lesson 1 — Slope–Intercept Form and the Graph of a Line (RF4 / RF5 / RF6 / RF7)
 * Assignment questions 1–14 (u7_L01.tex) and the Lesson 1 Extra Practice (u7_EP01.tex, all 17 questions).
 * Every part is a generator: it keeps the booklet question's structure (a hidden coefficient of 1, b = 0, an equation
 * that must be rearranged first, a fraction slope whose x-intercept is a whole number, a disguised linear relation)
 * and changes the numbers; the booklet's own numbers are among the possible values.
 * Outcomes: RF4 = is it linear / representing a relation, RF5 = characteristics (intercepts, slope read from an
 * equation or graph, domain and range), RF6 = reading m and b from a form and graphing from a form, RF7 = writing the
 * equation of a line. "State the slope and y-intercept" → two boxes (fields); "write the equation" → K.P.line (eq
 * keypad, any correct form); graphs → the graph pad (arrow-ended line, any two points on it). Explain items → MC with
 * misconception hints. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, LN = HW.lines, DR = HW.draw, PL = HW.poly;

  HW.addCodes({
    'mb-swap': 'Slope and y-intercept swapped', 'mb-order': 'Read m and b in left-to-right order', 'not-divided': 'Did not divide every term by the coefficient of y',
    'hidden-1': 'Missed the hidden coefficient 1 (or −1)', 'h-slope': 'Horizontal line: gave the constant as the slope', 'b-zero': 'b = 0 not recognised',
    'si-swap': 'Swapped m and b in y = mx + b', 'si-zero-b': 'Dropped the x-term when b = 0', 'icpt-axis': 'Intercept written as a point on the wrong axis',
    'icpt-swap': 'x- and y-intercepts swapped', 'icpt-none': 'Said there is no intercept', 'icpt-has': 'Gave a value where there is no intercept',
    'xint-sign': 'x-intercept sign error', 'xint-flip': 'x-intercept: divided the wrong way', 'xint-recip': 'x-intercept: multiplied by the slope instead of its reciprocal', 'xint-yint': 'Gave the y-intercept as the x-intercept',
    'gr-sign': 'Graph: slope sign wrong', 'gr-flip': 'Graph: rise and run swapped', 'gr-b-xaxis': 'Graph: plotted b on the x-axis', 'gr-b-sign': 'Graph: y-intercept sign wrong',
    'gr-join': 'Graph: points not joined into a line', 'gr-vh': 'Graph: horizontal/vertical mixed up', 'gr-slope': 'Graph: right y-intercept, wrong slope', 'gr-icpt': 'Graph: right slope, wrong y-intercept', 'gr-xint': 'Graph: wrong x-intercept',
    'lin-said-lin': 'Called a non-linear relation linear', 'lin-said-non': 'Called a linear relation non-linear', 'lin-vert': 'Vertical line sorted wrongly',
    'tri-half': 'Triangle area: forgot the ½', 'tri-hyp': 'Perimeter: left out the hypotenuse', 'tri-area': 'Gave the area for the perimeter',
    'move-sign': 'Sign error moving a term across', 'part-div': 'Divided only some terms', 'no-dist': 'Did not distribute', 'no-mult': 'Multiplied only one term',
    'rate-not-div': 'Rate: did not divide by the step in n', 'rate-flip': 'Rate upside down', 'rate-fee': 'Gave the fixed fee as the rate', 'no-fixed': 'Left out the fixed fee', 'fee-wrong': 'Fee and rate mixed up',
    'sub-swap': 'Substituted x and y the wrong way round', 'sub': 'Substitution equation wrong', 'sub-sign': 'Sign error solving for the constant', 'neg-times-neg': 'Negative × negative sign error',
    'pt-off': 'Point not on the line', 'pt-student': 'Point on the wrong line', 'pt-shared': 'Gave the point both lines share', 'pt-read': 'Point not readable',
    'student-line': 'Wrote the intended line, not the one drawn', 'nr-12m': 'Left out b', 'nr-flip': 'Slope as run over rise'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a || 1; }
  function Q(p, q) { if (Array.isArray(p)) { q = p[1]; p = p[0]; } q = q == null ? 1 : q; if (q < 0) { p = -p; q = -q; } var g = gcd(p, q); return [p / g, q / g]; }
  function qv(f) { return Array.isArray(f) ? f[0] / f[1] : f; }
  function qT(f) { if (!Array.isArray(f)) return nT(f); f = Q(f); return f[1] === 1 ? String(f[0]) : (f[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(f[0]) + '}{' + f[1] + '}'; }
  function qmul(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[0], a[1] * b[1]); }
  function qadd(a, b) { a = Q(a); b = Q(b); return Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function qneg(a) { a = Q(a); return [-a[0], a[1]]; }
  function qinv(a) { a = Q(a); return Q(a[1], a[0]); }
  function near(a, b) { return Math.abs(a - b) < 1e-9; }
  function nT(x) { return String(Math.round(x * 1e6) / 1e6); }
  function ptT(p) { return '(' + qT(p[0]) + ',\\ ' + qT(p[1]) + ')'; }
  function term(c, v, first) {
    var neg, mag;
    if (Array.isArray(c)) { c = Q(c); if (c[0] === 0) return ''; neg = c[0] < 0; var ab = Math.abs(c[0]); mag = c[1] === 1 ? (ab === 1 && v ? '' : String(ab)) : '\\frac{' + ab + '}{' + c[1] + '}'; }
    else { if (c === 0) return ''; neg = c < 0; var a = Math.abs(c); mag = a === 1 && v ? '' : nT(a); }
    return (neg ? '-' : first ? '' : '+') + mag + v;
  }
  function lin(ts) { var o = ''; ts.forEach(function (x) { o += term(x[0], x[1], o === ''); }); return o || '0'; }
  function siT(m, b) { return 'y=' + lin([[m, 'x'], [b, '']]); }
  function coprime(a, b) { return gcd(a, b) === 1; }
  function fracs(qs, maxP, proper) { var o = []; qs.forEach(function (q) { for (var p = 1; p <= maxP; p++) if (coprime(p, q) && (!proper || p < q) && q > 1) o.push([p, q]); }); return o; }
  function figs(list, w) { w = w || 150; return '<div style="display:flex;flex-wrap:wrap;gap:6px 14px;align-items:flex-start">' + list.map(function (f) { return '<div style="flex:1 1 ' + w + 'px;max-width:260px">' + f + '</div>'; }).join('') + '</div>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------------- reading typed answers ---------------- */
  function cleanS(s) { return String(s == null ? '' : s).replace(/\\left|\\right/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\[,;:! ]|~/g, ' ').trim(); }
  function isNone(s) { return /^(\\text\{\s*none\s*\}|\\mathrm\{\s*none\s*\}|none|no\s*y-?intercept)$/i.test(String(s).trim()); }
  function asPoint(s) {
    var m = /^\((.+),(.+)\)$/.exec(cleanS(s).replace(/\s+/g, '')); if (!m) return null;
    var a = ex.parse(m[1]), b = ex.parse(m[2]); if (!a.ok || !b.ok) return null;
    var va = ex.value(a.ast), vb = ex.value(b.ast); if (!isFinite(va) || !isFinite(vb)) return null;
    return [va, vb, m[1], m[2]];
  }
  /* [[value, code, hint], …] → diag(v); entries equal to the target are dropped */
  function dg(list, T) {
    var Tv = T == null ? null : qv(T);
    var L2 = (list || []).filter(function (d) { return d && d[0] != null && isFinite(qv(d[0])) && (Tv == null || !near(qv(d[0]), Tv)); });
    return function (v) { for (var i = 0; i < L2.length; i++) if (near(v, qv(L2[i][0]))) return { code: L2[i][1], hint: L2[i][2] }; return null; };
  }
  function slopeC(m, list) { return m === null ? K.slope(null) : K.slope(Q(m), { diag: dg(list, m), signHint: 'Check the sign: once the equation reads ' + t('y=mx+b') + ', the slope is the number multiplying ' + t('x') + ' <b>with the sign in front of it</b>.' }); }
  /* a value (intercept, constant): exact; a point (0, b) / (a, 0) is accepted for an intercept (o.axis 'y' | 'x');
   * o.isNone: the right answer is "none"; o.exact: fractions only (no decimals) */
  function valC(T, list, o) {
    o = o || {};
    var d = dg(list, o.isNone ? null : T);
    var base = o.isNone ? null : o.exact ? K.fraction(Q(T), { diag: d }) : K.value(T, { only: 'fraction', diag: d });
    return function (resp) {
      var s = cleanS(resp);
      if (!s) return form('empty', 'Type your answer first.');
      if (isNone(s)) return o.isNone ? ok() : wrong('icpt-none', o.noneHint || (o.axis === 'x' ? 'There is one: every line that isn’t horizontal crosses the ' + t('x') + '-axis. Set ' + t('y=0') + ' and solve.' : 'There is one: every line that isn’t vertical crosses the ' + t('y') + '-axis.'));
      if (o.isNone) return wrong('icpt-has', o.hasHint || 'This line never crosses that axis — press <b>none</b>.');
      var p = o.axis ? asPoint(s) : null;
      if (p) {
        if (o.axis === 'y') { if (!near(p[0], 0)) return wrong('icpt-axis', 'A point on the ' + t('y') + '-axis has ' + t('x=0') + ': the ' + t('y') + '-intercept is the point ' + t('(0,\\ b)') + '.'); s = p[3]; }
        else { if (!near(p[1], 0)) return wrong('icpt-axis', 'A point on the ' + t('x') + '-axis has ' + t('y=0') + ': the ' + t('x') + '-intercept is the point ' + t('(a,\\ 0)') + '.'); s = p[2]; }
      }
      return base(s);
    };
  }
  function slopeField(keys) { return { label: 'Slope', name: 'Slope', before: t('m='), mode: 'math', keys: keys || 'fraction' }; }
  function yField(keys, none) { return { label: t('y') + '-intercept', name: t('y') + '-intercept', before: t('b='), mode: 'math', keys: keys || 'fraction', none: !!none }; }
  function xField(keys) { return { label: t('x') + '-intercept', name: t('x') + '-intercept', mode: 'math', keys: keys || 'fraction' }; }
  function mbHints(eqT) { return ['Get ' + t('y') + ' by itself first: ' + t('y=mx+b') + '. Then ' + t('m') + ' is the number multiplying ' + t('x') + ' and ' + t('b') + ' is the constant term.', 'Keep the sign that is in front of each term.']; }
  /* slope and y-intercept in two boxes. m: [p,q] or null (undefined); b: [p,q] / number, or null (none) */
  function mbPart(prompt, m, b, o, sol, hints, text) {
    o = o || {};
    var swapM = [b, 'mb-swap', 'That’s the ' + t('y') + '-intercept. The slope ' + t('m') + ' is the number multiplying ' + t('x') + ' once the equation reads ' + t('y=mx+b') + '.'];
    var swapB = [m, 'mb-swap', 'That’s the slope. The ' + t('y') + '-intercept ' + t('b') + ' is the constant term once the equation reads ' + t('y=mx+b') + '.'];
    var mC = slopeC(m, (o.mDiag || []).concat(b === null || m === null ? [] : [swapM]));
    var bC = valC(b, (o.bDiag || []).concat(m === null || b === null ? [] : [swapB]), { axis: 'y', exact: o.exact, isNone: b === null, noneHint: o.noneHint, hasHint: o.hasHint });
    var keys = [m === null ? 'undefined' : qT(m), b === null ? 'none' : qT(b)];
    var ans = t('m=' + (m === null ? '\\text{undefined}' : qT(m))) + ', &nbsp;' + (b === null ? 'no ' + t('y') + '-intercept' : t('b=' + qT(b)));
    var p = B.fields(prompt, [slopeField(o.keys), yField(o.keys, o.none)], [mC, bC], keys, ans, sol, hints || mbHints(), text);
    p.good = b === null ? [] : [[keys[0], '(0,\\ ' + keys[1] + ')']];
    p.bad = (m !== null && b !== null && !near(qv(m), qv(b))) ? [[keys[1], keys[0]]] : [];
    return p;
  }

  /* ---------------- graphs ---------------- */
  function padI(xr, yr) { return { x: xr || [-6, 6], y: yr || [-6, 6], grid: 1, labels: 2, defaultEnd: 'arrow', max: 360 }; }
  var PADHELP = ' <span style="color:#6a7182;font-size:.92em">(<b>╱ Line</b>: tap two points, then tap the second again.)</span>';
  function gv(pts, pieces) { return { pts: pts || [], pieces: pieces || [], join: 'none' }; }
  function lineV(p, q) { return gv([], [{ v: [p, q], s: 'arrow', e: 'arrow' }]); }
  function lineMB(m, b) { m = Q(m); var bv = qv(b); return lineV([0, bv], [m[1], bv + m[0]]); }
  function lineThroughSlope(pt, m) { m = Q(m); return lineV(pt, [pt[0] + m[1], pt[1] + m[0]]); }
  /* the two lattice points of y = mx + b farthest apart inside the window */
  function spanPts(m, b, xr, yr) {
    var out = [];
    for (var x = xr[0]; x <= xr[1]; x++) { var y = qv(m) * x + qv(b); if (Math.abs(y - Math.round(y)) < 1e-9 && y >= yr[0] - 1e-9 && y <= yr[1] + 1e-9) out.push([x, Math.round(y)]); }
    return [out[0], out[out.length - 1]];
  }
  function keyLine(m, b, xr, yr) { var s = spanPts(m, b, xr || [-6, 6], yr || [-6, 6]); return lineV(s[0], s[1]); }
  function lineCoef(v) { var g = DR.geom(v), ks = Object.keys(g.lines); if (ks.length !== 1 || g.pts.length) return null; var L = g.lines[ks[0]]; return L; }
  /* exact line check + "points not joined" + right y-intercept / right slope refinements (o: { m, b } numbers, or { x0 } for x-int) */
  function exactChk(target, W, o) {
    o = o || {};
    var base = K.graphExact(target, { wrong: W }), TL = lineCoef(target);
    function onT(p) { return Math.abs(TL.A * p[0] + TL.B * p[1] - TL.C) < 1e-6; }
    return function (resp) {
      if (!DR.empty(resp) && DR.same(resp, target)) return ok();
      var n = DR.norm(resp);
      if (!n.pieces.length && n.pts.length >= 2 && n.pts.every(onT)) return wrong('gr-join', 'Your points are on the line — now join them: choose <b>╱ Line</b> and tap two of them (the ends become arrows, because the line goes on forever).');
      if (!n.pieces.length && n.pts.length === 1 && onT(n.pts[0])) return wrong('gr-join', 'That point is on the line. Use the slope to find a second point, then join them with <b>╱ Line</b>.');
      var r = base(resp);
      if (r.v === 'wrong' && r.code === 'graph' && o.m != null) {
        var S = lineCoef(resp);
        if (S && S.B !== 0) {
          var ms = -S.A / S.B, bs = S.C / S.B;
          if (near(bs, o.b) && !near(ms, o.m)) return wrong('gr-slope', 'Your line crosses the ' + t('y') + '-axis in the right place — now check the slope: from ' + t(ptT([0, o.b])) + ' count the rise (up or down) and the run (right) from ' + t('m=' + qT(o.mq || o.m)) + '.');
          if (near(ms, o.m) && !near(bs, o.b)) return wrong('gr-icpt', 'Your line has the right slope — but it must cross the ' + t('y') + '-axis at ' + t(ptT([0, o.b])) + '.');
          if (o.x0 != null && near(bs, o.b)) return wrong('gr-xint', 'Right ' + t('y') + '-intercept — but the line must also cross the ' + t('x') + '-axis at ' + t(ptT([o.x0, 0])) + '.');
        }
      }
      return r;
    };
  }
  function drawPart(prompt, inp, target, W, o, sol, hints, text, extraBad, good) {
    var p = B.graph(prompt + PADHELP, inp, exactChk(target, W, o), target, sol, hints, text);
    p.bad = W.map(function (w) { return w.is; }).concat(extraBad || []).filter(function (b) { return !DR.same(b, target); });
    p.good = good || [];
    return p;
  }
  /* classic graphing errors for y = mx + b (m = [p, q], b a number) */
  function slopeWrongs(m, b) {
    m = Q(m); var W = [], up = m[0] > 0;
    if (m[0] !== 0) W.push({ is: lineMB([-m[0], m[1]], b), code: 'gr-sign', hint: 'Check the direction: a ' + (up ? 'positive' : 'negative') + ' slope means the line ' + (up ? 'rises' : 'falls') + ' from left to right.' });
    if (m[0] !== 0 && Math.abs(m[0]) !== m[1]) W.push({ is: lineMB(Q(m[0] > 0 ? m[1] : -m[1], Math.abs(m[0])), b), code: 'gr-flip', hint: 'Rise and run are swapped. In ' + t('m=' + qT(m)) + ' the top number is the <b>rise</b> (up or down) and the bottom number is the <b>run</b> (to the right).' });
    if (b !== 0) W.push({ is: lineThroughSlope([b, 0], m), code: 'gr-b-xaxis', hint: 'The ' + t('y') + '-intercept is on the <b>' + t('y') + '-axis</b>: start at ' + t(ptT([0, b])) + ', not at ' + t(ptT([b, 0])) + '.' });
    if (b !== 0) W.push({ is: lineMB(m, -b), code: 'gr-b-sign', hint: 'Check the sign of the ' + t('y') + '-intercept: the line crosses the ' + t('y') + '-axis at ' + t(ptT([0, b])) + '.' });
    return W;
  }
  function segOf(v) { var n = DR.norm(v); return gv([], n.pieces.map(function (pc) { return { v: pc.v, s: 'closed', e: 'closed' }; })); }
  /* a picture of lines: ls = [{ m, b } | { x: k }], o = { x, y, points, grid, labels, max, texts: [{ x, y, text, anchor }] } */
  function clip(m, b, xr, yr) {
    var mv = qv(m), bv = qv(b), out = [];
    if (mv === 0) return [[xr[0], bv], [xr[1], bv]];
    [xr[0], xr[1]].forEach(function (x) { var y = mv * x + bv; if (y >= yr[0] - 1e-9 && y <= yr[1] + 1e-9) out.push([x, y]); });
    [yr[0], yr[1]].forEach(function (y) { var x = (y - bv) / mv; if (x > xr[0] + 1e-9 && x < xr[1] - 1e-9) out.push([x, y]); });
    out.sort(function (p, q) { return p[0] - q[0]; });
    return [out[0], out[out.length - 1]];
  }
  function lineFig(ls, o) {
    o = o || {};
    var xr = o.x || [-6, 6], yr = o.y || [-6, 6], ix = [xr[0] + 0.35, xr[1] - 0.35], iy = [yr[0] + 0.35, yr[1] - 0.35];
    var segs = ls.map(function (l) { var P = l.x != null ? [[l.x, iy[0]], [l.x, iy[1]]] : clip(l.m, l.b, ix, iy); return { pts: P, start: o.ends || 'arrow', end: o.ends || 'arrow', color: l.color }; });
    var svg = HW.graph({ x: xr, y: yr, grid: o.grid == null ? 1 : o.grid, labels: o.labels == null ? 2 : o.labels, segs: segs, points: o.points || [], max: o.max || 300, aria: o.aria || 'graph of a line' });
    if (o.texts && o.texts.length) {
      var G = HW.graph.last;
      var add = o.texts.map(function (tx) { return '<text x="' + G.X(tx.x).toFixed(1) + '" y="' + G.Y(tx.y).toFixed(1) + '" font-size="13" font-style="italic" fill="#2b3340" text-anchor="' + (tx.anchor || 'middle') + '">' + esc(tx.text) + '</text>'; }).join('');
      svg = svg.replace('</svg>', add + '</svg>');
    }
    return '<div class="fig">' + svg + '</div>';
  }
  function fnFig(fns, o) { o = o || {}; return '<div class="fig">' + HW.graph({ x: o.x || [-5, 5], y: o.y || [-5, 5], grid: 1, labels: 2, fns: fns, max: o.max || 200, aria: 'graph of a relation' }) + '</div>'; }

  /* ---------------- multiple choice helpers ---------------- */
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* ---------------- Q1: linear or not ---------------- */
  function linTemplates(r) {
    var p1 = r.pick(fracs([2, 3, 4, 5], 4, true)), q4 = r.pick([2, 3, 4, 5]);
    var a = r.int(2, 9), c = r.int(3, 12), k = r.int(2, 9), c3 = r.int(1, 5), c4 = r.int(5, 12);
    var n = r.int(2, 9), a2 = r.int(2, 6), c5 = r.int(1, 9), e = r.int(2, 9), c6 = r.int(1, 9);
    return [
      { lin: 'L', tex: 'y=-' + a + 'x+' + c, why: 'it is already ' + t('y=mx+b') + ' with ' + t('m=-' + a) + ' and ' + t('b=' + c) + '.' },
      { lin: 'N', tex: 'y=\\dfrac{' + n + '}{x}', why: t('x') + ' is in the <b>denominator</b>. That can’t be written as ' + t('y=mx+b') + '; the graph is a curve.' },
      { lin: 'L', tex: 'y=' + k + 'x', why: 'it is ' + t('y=' + k + 'x+0') + ': ' + t('m=' + k) + ', ' + t('b=0') + '.' },
      { lin: 'N', tex: 'y=' + c5 + '-' + a2 + 'x^2', why: t('x') + ' is <b>squared</b>, so the graph is a curve (a parabola).' },
      { lin: 'N', tex: 'y=' + e + '^x', why: t('x') + ' is an <b>exponent</b>, so the graph curves upward faster and faster.' },
      { lin: 'L', tex: 'y=\\tfrac{' + p1[0] + '}{' + p1[1] + '}x-' + c3, why: 'it is ' + t('y=mx+b') + ' with ' + t('m=\\frac{' + p1[0] + '}{' + p1[1] + '}') + ' — a fraction slope is still a slope.' },
      { lin: 'N', tex: 'y=' + c6 + '+x^3', why: t('x') + ' is <b>cubed</b>, so the graph is a curve.' },
      { lin: 'L', tex: 'y=' + c4 + '-\\tfrac{1}{' + q4 + '}x', why: 'reorder it: ' + t('y=-\\frac{1}{' + q4 + '}x+' + c4) + ' — the order of the terms doesn’t matter.' }];
  }

  /* ---------------- Q4 / Q5 / Q7 shared numbers ---------------- */
  function q4Shared(r) {
    var ma = r.pick(fracs([2, 3, 4], 3, true)), ba = r.int(-5, -1);
    var bb = r.pick([2, 3, 4, 5, -2, -3, -4]);
    var mc0 = r.pick([[5, 6], [3, 4], [2, 3], [4, 5], [3, 5], [2, 5], [1, 3], [1, 4]]);
    var kd = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    return { ma: ma, ba: ba, bb: bb, mc: [-mc0[0], mc0[1]], kd: kd };
  }
  function q5Shared(r) {
    var A = [];
    [2, 3, 4].forEach(function (a) { [-3, -2, -1, 1, 2, 3].forEach(function (x0) { var b = -a * x0; if (Math.abs(b) <= 8) A.push([a, x0, b]); }); });
    var aa = r.pick(A);
    var bb = r.int(-6, -2);
    var C = [], D = [];
    for (var q = 2; q <= 5; q++) for (var p = 1; p <= 8; p++) { if (!coprime(p, q)) continue; for (var x0 = q; x0 <= 6; x0 += q) { var c = p * x0 / q; if (c >= 2 && c <= 8) C.push([p, q, x0, c]); if (c >= 1 && c <= 8) D.push([p, q, x0, c]); } }
    return { a: aa, b: bb, c: r.pick(C), d: r.pick(D) };
  }

  /* ---------------- Extra 1: three-way sort ---------------- */
  function ep1Templates(r) {
    var k = r.pick([2, 3]), m = r.int(2, 5), c = r.pick([-9, -7, -5, -3, -1, 1, 3, 5, 7]);
    var A6 = r.int(2, 7), B6 = r.pick([2, 3, 4, 5, 6, 7].filter(function (v) { return v !== A6; })), C6 = B6 * r.int(1, 3);
    var p8 = r.int(2, 6), q8 = r.pick([2, 3, 4, 5, 6].filter(function (v) { return v !== p8; }));
    var u = r.int(1, 6), a10 = r.int(2, 5), v = r.int(1, 5), a11 = r.int(2, 5), c11 = r.pick([1, 3, 5, 7, 9].filter(function (z) { return z % a11 !== 0; }).concat([7]));
    var d12 = r.pick([2, 3, 4, 5]), c12 = r.int(1, 9), xk = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    var mm = Q(A6, B6), bb = Q(C6, B6);
    return [
      { cat: 'L', tex: k + 'y=' + (k * m) + 'x' + (k * c < 0 ? '-' : '+') + Math.abs(k * c), why: 'divide every term by ' + t(k) + ': ' + t(siT(m, c)) + '.' },
      { cat: 'N', tex: 'y=x^{2}+' + r.int(1, 9), why: t('x') + ' is squared — a curve.' },
      { cat: 'N', tex: 'xy=' + r.int(2, 12), why: 'the variables are <b>multiplied</b>: it rearranges to ' + t('y=\\frac{k}{x}') + ', a curve.' },
      { cat: 'V', tex: 'x=' + xk, why: t('y') + ' doesn’t appear: it is the <b>vertical</b> line through ' + t(ptT([xk, 0])) + '. Straight, but it can’t be solved for ' + t('y') + '.' },
      { cat: 'N', tex: 'y=\\dfrac{' + r.int(2, 9) + '}{x}', why: t('x') + ' is in a denominator — a curve.' },
      { cat: 'L', tex: A6 + 'x-' + B6 + 'y+' + C6 + '=0', why: t('-' + B6 + 'y=-' + A6 + 'x-' + C6) + ', so ' + t(siT(mm, bb)) + '.' },
      { cat: 'N', tex: 'y=\\sqrt{x}+' + r.int(1, 5), why: 'the square root of ' + t('x') + ' — a curve.' },
      { cat: 'L', tex: '\\dfrac{x}{' + p8 + '}+\\dfrac{y}{' + q8 + '}=1', why: 'multiply by ' + t(p8 * q8 / gcd(p8, q8)) + ' and solve: ' + t(siT(Q(-q8, p8), q8)) + '.' },
      { cat: 'N', tex: 'y=' + r.int(2, 5) + '^{x}', why: t('x') + ' is an exponent — a curve.' },
      { cat: 'L', tex: 'y-' + u + '=-' + a10 + '(x+' + v + ')', why: 'expand: ' + t(siT(-a10, u - a10 * v)) + '.' },
      { cat: 'V', tex: a11 + 'x+' + c11 + '=0', why: 'it solves to ' + t('x=' + qT(Q(-c11, a11))) + ': a <b>vertical</b> line. No ' + t('y') + ', so no ' + t('y=mx+b') + '.' },
      { cat: 'L', tex: 'y=\\dfrac{x+' + c12 + '}{' + d12 + '}', why: 'split the fraction: ' + t(siT([1, d12], Q(c12, d12))) + '.' }];
  }

  /* ---------------- Extra 3: tables ---------------- */
  function ep3Shared(r) {
    var ma = r.pick([2, 3, 4, 5, -2, -3, -4]), ba = r.pick([-6, -5, -4, -3, 2, 3, 4, 5]);
    var pb = r.pick([1, 3, 5]), sb = r.pick([-1, 1]), bb = r.int(2, 8);
    var cc = r.int(-2, 3), sd = r.pick([2, 3, 4]), kd = r.pick([-5, -3, -2, 2, 3, 4, 5, 6]);
    var xe = r.pick([[0, 1, 3, 7], [0, 2, 3, 7], [0, 1, 4, 6], [0, 2, 5, 6]]), me = r.pick([2, 3, 4]), be = r.int(1, 5);
    var T = {
      a: { xs: [0, 1, 2, 3], m: [ma, 1], b: ba }, b: { xs: [-2, 0, 2, 4], m: [sb * pb, 2], b: bb }, c: { xs: [1, 2, 3, 4], quad: cc },
      d: { xs: [0, sd, 2 * sd, 3 * sd], m: [0, 1], b: kd }, e: { xs: xe, m: [me, 1], b: be } };
    Object.keys(T).forEach(function (k) { var o = T[k]; o.ys = o.xs.map(function (x) { return o.quad != null ? x * x + o.quad : Math.round(qv(o.m) * x + o.b); }); });
    return T;
  }
  function tabHtml(label, o) { return '<div style="margin:4px 0"><b>(' + label + ')</b> ' + HW.valueTable([['x'].concat(o.xs), ['y'].concat(o.ys)]) + '</div>'; }

  /* ---------------- Extra 8 / 10 / 11 / 12 / 13 shared ---------------- */
  function ep8Shared(r) {
    return { a: { m: Q(-1, 1), pq: r.pick([[2, 3], [1, 2], [3, 4], [1, 3], [3, 2]]), b: r.int(1, 5) },
      b: { pq: r.pick([[5, 2], [3, 2], [4, 3], [5, 3], [7, 2]]), c: r.int(2, 5) },
      c: { k: r.int(2, 5), c: r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]) }, d: { k: r.int(2, 5), d: r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]) } };
  }
  function ep10Shared(r) {
    var ma = r.pick([2, 3, -2, -3]), ba = r.pick([-3, -2, -1, 1, 2, 3]), ka = Math.abs(ma) === 2 ? 3 : 2;
    if (Math.abs(ba + ma * ka) > 6) ka = -ka; if (Math.abs(ba + ma * ka) > 6) ka = Math.sign(ka);
    var qb = r.pick([4, 5]), pb = r.pick([1, 2, 3].filter(function (p) { return coprime(p, qb); })), sb = r.pick([-1, 1]), bb = r.pick([-2, -1, 1, 2, 3]);
    return { a: { m: ma, b: ba, k: ka }, b: { m: [sb * pb, qb], b: bb }, c: { k: r.pick([-5, -4, -3, -2, 2, 3, 4, 5]) }, d: { k: r.pick([-5, -4, -3, -2, 2, 3, 4, 5]) } };
  }
  function ep11Shared(r) {
    var pq = r.pick([[3, 2], [2, 3], [1, 2], [2, 1], [3, 1]]), k = r.pick([2, 3, 4]);
    var eqs = { A: { s: 1, bs: -1 }, B: { s: -1, bs: -1 }, C: { s: 1, bs: 1 }, D: { s: -1, bs: 1 } };
    var order = r.shuffle(['A', 'B', 'C', 'D']);   // graph I shows order[0], …
    return { pq: pq, k: k, eqs: eqs, order: order };
  }
  function ep12Shared(r) { return { F: r.pick([15, 20, 25, 30, 35]), c: r.pick([5, 8, 10, 12, 15, 20]), n1: r.pick([200, 225, 275, 325, 350, 375]), n2: r.pick([150, 200, 250, 300, 350]) }; }
  function money(x) { return (Math.round(x * 100) / 100).toFixed(2); }

  var ROMAN = ['I', 'II', 'III', 'IV'];

  HW.defineLesson({
    id: 'u7l1', unit: 7, num: '1', title: 'Slope–Intercept Form and the Graph of a Line', outcome: 'RF6',
    blurb: 'Recognize linear relations, read the slope m and y-intercept b from y = mx + b (after rearranging if needed), and graph a line from its slope and y-intercept or from its two intercepts.',
    questions: [
      /* ================= Q1 ================= */
      { num: '1', section: 'Part A — Linear or not? Reading m and b', stem: 'Each equation below represents a relation. Without sketching the graph, sort each one into the <b>Linear</b> or the <b>Non-linear</b> column.', parts: [
        { id: '1', level: 'BEG', outcome: 'RF4', make: function (r) {
          var T = r.shuffle(linTemplates(r)), letters = 'abcdefgh'.split(''), want = {}, info = {};
          var rows = T.map(function (x, i) { want[letters[i]] = x.lin; info[letters[i]] = x; return { id: letters[i], html: '(' + letters[i] + ') ' + t(x.tex) }; });
          var p = B.grid('Linear or non-linear?', rows, [{ id: 'L', html: 'Linear' }, { id: 'N', html: 'Non-linear' }], want, {
            why: function (id, given) { var x = info[id]; return { code: given === 'L' ? 'lin-said-lin' : 'lin-said-non', hint: '(' + id + ') is ' + (x.lin === 'L' ? '<b>linear</b>: ' : '<b>non-linear</b>: ') + x.why }; } },
            'Linear (can be written ' + t('y=mx+b') + '): ' + letters.filter(function (l) { return want[l] === 'L'; }).map(function (l) { return '(' + l + ')'; }).join(', ') + '.<br>' +
            T.map(function (x, i) { return '(' + letters[i] + ') ' + (x.lin === 'L' ? 'linear — ' : 'non-linear — ') + x.why; }).join('<br>'),
            ['In ' + t('y=mx+b') + ', ' + t('x') + ' appears only to the first power: never squared or cubed, never in a denominator, never an exponent.', 'The order of the terms doesn’t matter, and ' + t('b') + ' may be ' + t('0') + '.'], 'sort 8 relations linear/non-linear');
          return p;
        } }] },
      /* ================= Q2 ================= */
      { num: '2', stem: 'State the slope and ' + t('y') + '-intercept of the graph of each linear equation.', parts: [
        { id: '2a', level: 'BEG', make: function (r) {
          var a = r.int(2, 9), c = r.int(1, 9), eq = 'y=' + a + 'x-' + c;
          return mbPart(t(eq), [a, 1], -c, { bDiag: [[c, 'sign', 'Keep the sign: ' + t(eq) + ' is ' + t('y=' + a + 'x+(-' + c + ')') + ', so ' + t('b=-' + c) + '.']] },
            'Already solved for ' + t('y') + ': slope ' + t('m=' + a) + ', ' + t('y') + '-intercept ' + t('b=-' + c) + '.', null, 'm and b of ' + eq);
        } },
        { id: '2b', level: 'BEG', make: function (r) {
          var m = r.pick(fracs([3, 4, 5, 7, 8], 7, true)), c = r.int(1, 9), eq = 'y=\\frac{' + m[0] + '}{' + m[1] + '}x+' + c;
          return mbPart(t(eq), m, c, {}, 'Already solved for ' + t('y') + ': ' + t('m=' + qT(m)) + ', ' + t('b=' + c) + '.', null, 'm and b of ' + eq);
        } },
        { id: '2c', level: 'BEG', make: function (r) {
          var m = r.pick(fracs([2, 3, 4, 5], 4, true)), c = r.int(4, 12), eq = 'y=' + c + '-\\frac{' + m[0] + '}{' + m[1] + '}x';
          return mbPart(t(eq), qneg(m), c, { mDiag: [[c, 'mb-order', t(c) + ' is the first number you see, but it doesn’t multiply ' + t('x') + '. Reorder: ' + t(siT(qneg(m), c)) + '.']],
            bDiag: [[qneg(m), 'mb-order', 'The number multiplying ' + t('x') + ' is the slope. Reorder: ' + t(siT(qneg(m), c)) + ' — the constant ' + t(c) + ' is ' + t('b') + '.']] },
            'Reorder: ' + t(siT(qneg(m), c)) + '.<br>slope ' + t('m=' + qT(qneg(m))) + ', ' + t('y') + '-intercept ' + t('b=' + c) + '.', null, 'm and b of ' + eq);
        } },
        { id: '2d', level: 'EMG', make: function (r) {
          var k = r.int(2, 6), a = r.int(2, 5), c = r.int(1, 6), eq = k + 'y=' + (k * a) + 'x-' + (k * c);
          return mbPart(t(eq), [a, 1], -c, { mDiag: [[k * a, 'not-divided', 'This equation isn’t solved for ' + t('y') + ' yet — divide <b>every</b> term by ' + t(k) + ' first.']], bDiag: [[-k * c, 'not-divided', 'Divide <b>every</b> term by ' + t(k) + ', including the constant.']] },
            'Divide every term by ' + t(k) + ': ' + t('y=' + a + 'x-' + c) + '.<br>slope ' + t('m=' + a) + ', ' + t('y') + '-intercept ' + t('b=-' + c) + '.', null, 'm and b of ' + eq);
        } },
        { id: '2e', level: 'EMG', make: function (r) {
          var L2 = r.pick([['p', 'q'], ['a', 'c'], ['k', 'n'], ['r', 's'], ['c', 'd'], ['h', 'k']]), u = L2[0], w = L2[1], rev = r.chance(0.3);
          var eq = rev ? 'y=' + w + '+' + u + 'x' : 'y=' + u + 'x+' + w;
          var flds = [{ label: 'Slope', name: 'Slope', before: t('m='), mode: 'math', keys: 'poly', vars: [u, w] }, { label: t('y') + '-intercept', name: t('y') + '-intercept', before: t('b='), mode: 'math', keys: 'poly', vars: [u, w] }];
          var sw = function (other) { return { is: PL.parse(other), code: 'mb-swap', hint: 'You swapped them: the slope is the letter <b>multiplying ' + t('x') + '</b>, the ' + t('y') + '-intercept is the term on its own.' }; };
          var p = B.fields(t(eq), flds, [K.poly(PL.parse(u), { wrong: [sw(w)] }), K.poly(PL.parse(w), { wrong: [sw(u)] })], [u, w], t('m=' + u) + ', &nbsp;' + t('b=' + w),
            'It already has the form ' + t('y=mx+b') + (rev ? ' (after reordering: ' + t('y=' + u + 'x+' + w) + ')' : '') + ': the coefficient of ' + t('x') + ' is ' + t(u) + ' and the constant is ' + t(w) + '.<br>slope ' + t('m=' + u) + ', ' + t('y') + '-intercept ' + t('b=' + w) + '.',
            ['Match ' + t(eq) + ' to ' + t('y=mx+b') + ' term by term.'], 'm and b of y = px + q');
          p.bad = [[w, u]];
          return p;
        } }] },
      /* ================= Q3 ================= */
      { num: '3', stem: 'Write the equation of the line with the given slope and ' + t('y') + '-intercept.', parts: [
        { id: '3a', level: 'BEG', outcome: 'RF7', make: function (r) {
          var m = r.int(2, 9), b = r.int(-9, -1);
          var W = [{ is: { m: b, b: m }, code: 'si-swap', hint: 'In ' + t('y=mx+b') + ' the slope multiplies ' + t('x') + ' and the ' + t('y') + '-intercept is the constant: ' + t('m=' + m) + ' goes in front of ' + t('x') + '.' }];
          var p = B.line('(a) slope ' + t('=' + m) + ', &nbsp;' + t('y') + '-intercept ' + t('=' + b), { m: m, b: b }, { wrong: W },
            'Substitute ' + t('m=' + m) + ' and ' + t('b=' + b) + ' into ' + t('y=mx+b') + ': ' + t(siT(m, b)) + '.', ['Slope–intercept form is ' + t('y=mx+b') + '.'], 'equation from m=' + m + ', b=' + b);
          p.good = ['y=' + b + '+' + m + 'x']; p.bad = ['y=' + b + 'x+' + m, 'y=' + m + 'x+' + (-b)];
          return p;
        } },
        { id: '3b', level: 'BEG', outcome: 'RF7', make: function (r) {
          var m = r.pick(fracs([2, 3, 4, 5], 4, true)), b = r.pick(fracs([3, 4, 5, 7], 6, true).filter(function (f) { return f[1] !== m[1]; }));
          var W = [{ is: { m: b, b: m }, code: 'si-swap', hint: 'The slope ' + t(qT(m)) + ' multiplies ' + t('x') + '; the ' + t('y') + '-intercept ' + t(qT(b)) + ' is the constant.' }];
          var p = B.line('(b) slope ' + t('=' + qT(m)) + ', &nbsp;' + t('y') + '-intercept ' + t('=' + qT(b)), { m: m, b: b }, { wrong: W },
            t('m=' + qT(m)) + ', ' + t('b=' + qT(b)) + ': ' + t(siT(m, b)) + '.', ['Slope–intercept form is ' + t('y=mx+b') + '. Use the fraction key for each fraction.'], 'equation from fraction m and b');
          p.bad = [siT(b, m)];
          return p;
        } },
        { id: '3c', level: 'BEG', outcome: 'RF7', make: function (r) {
          var m = -r.int(2, 9);
          var W = [{ is: { m: 0, b: m }, code: 'si-zero-b', hint: 'A ' + t('y') + '-intercept of ' + t('0') + ' means there is no constant term — but the ' + t('x') + '-term stays: ' + t('y=' + m + 'x+0') + '.' }];
          var p = B.line('(c) slope ' + t('=' + m) + ', &nbsp;' + t('y') + '-intercept ' + t('=0'), { m: m, b: 0 }, { wrong: W },
            t('m=' + m) + ', ' + t('b=0') + ': ' + t('y=' + m + 'x+0') + ', which is ' + t('y=' + m + 'x') + '.', ['Substitute into ' + t('y=mx+b') + ' and simplify.'], 'equation with b = 0');
          p.good = ['y=' + m + 'x+0']; p.bad = ['y=' + m, 'x=' + m];
          return p;
        } },
        { id: '3d', level: 'EMG', outcome: 'RF7', make: function (r) {
          var L2 = r.pick([['k', 'n'], ['p', 'q'], ['a', 'c'], ['r', 's'], ['h', 'k']]), u = L2[0], w = L2[1];
          var p = B.poly('(d) slope ' + t('=' + u) + ', &nbsp;' + t('y') + '-intercept ' + t('=' + w), PL.parse(u + 'x+' + w), { before: 'y=', vars: [u, w, 'x'],
            wrong: [{ is: PL.parse(w + 'x+' + u), code: 'si-swap', hint: 'The slope multiplies ' + t('x') + ': ' + t(u + 'x') + '. The ' + t('y') + '-intercept is the constant ' + t(w) + '.' }] },
            t('m=' + u) + ', ' + t('b=' + w) + ': ' + t('y=' + u + 'x+' + w) + '.', ['Put the letters into ' + t('y=mx+b') + ' just like numbers.'], 'equation from letters');
          var c0 = p.check; p.check = function (resp) { return c0(String(resp == null ? '' : resp).replace(/^\s*y\s*=\s*/, '')); };
          p.answer = t('y=' + u + 'x+' + w);
          p.good = [w + '+' + u + 'x', 'y=' + u + 'x+' + w]; p.bad = [w + 'x+' + u];
          return p;
        } }] },
      /* ================= Q4 ================= */
      { num: '4', section: 'Part B — Graphing from y = mx + b', shared: q4Shared, stem: 'For each line, state the slope and the ' + t('y') + '-intercept, then graph the equation without using a graphing calculator.', parts: [
        { id: '4a', sub: 'a i', level: 'BEG', make: function (r, sh) {
          var eq = siT(sh.ma, sh.ba);
          return mbPart(t(eq), sh.ma, sh.ba, {}, t('m=' + qT(sh.ma)) + ', ' + t('b=' + sh.ba) + '.', null, 'm, b of ' + eq);
        } },
        { id: '4a2', sub: 'a ii', level: 'BEG', make: function (r, sh) {
          var m = sh.ma, b = sh.ba, eq = siT(m, b), key = keyLine(m, b);
          return drawPart('Graph ' + t(eq) + '.', padI(), key, slopeWrongs(m, b), { m: qv(m), b: b, mq: m },
            'Plot the ' + t('y') + '-intercept ' + t(ptT([0, b])) + '. The slope ' + t(qT(m)) + ' means up ' + t(m[0]) + ', right ' + t(m[1]) + ': ' + t(ptT([m[1], b + m[0]])) + '. Join the points with a line (arrows at both ends).',
            ['Start on the ' + t('y') + '-axis at ' + t('b') + '.', 'Slope = rise ÷ run: the top number is up/down, the bottom number is to the right.'], 'graph ' + eq, [segOf(key)], [lineV([0, b], [m[1], b + m[0]]), gv([[0, b], [m[1], b + m[0]]], [{ v: [[0, b], [2 * m[1], b + 2 * m[0]]], s: 'arrow', e: 'arrow' }])]);
        } },
        { id: '4b', sub: 'b i', level: 'BEG', make: function (r, sh) {
          var eq = 'y=-x' + (sh.bb > 0 ? '+' : '') + sh.bb;
          return mbPart(t(eq), [-1, 1], sh.bb, { mDiag: [[0, 'hidden-1', t('-x') + ' means ' + t('-1x') + ': the slope is ' + t('-1') + '.']] },
            t('-x=-1x') + ', so ' + t('m=-1') + ' and ' + t('b=' + sh.bb) + '.', null, 'm, b of ' + eq);
        } },
        { id: '4b2', sub: 'b ii', level: 'BEG', make: function (r, sh) {
          var b = sh.bb, eq = 'y=-x' + (b > 0 ? '+' : '') + b, key = keyLine([-1, 1], b);
          return drawPart('Graph ' + t(eq) + '.', padI(), key, slopeWrongs([-1, 1], b), { m: -1, b: b, mq: [-1, 1] },
            'Plot ' + t(ptT([0, b])) + '. The slope ' + t('-1=\\frac{-1}{1}') + ': down ' + t('1') + ', right ' + t('1') + ' to ' + t(ptT([1, b - 1])) + '. Join with a line.',
            [t('-x') + ' has slope ' + t('-1') + '.', 'Start at the ' + t('y') + '-intercept.'], 'graph ' + eq, [segOf(key)], [lineV([0, b], [1, b - 1])]);
        } },
        { id: '4c', sub: 'c i', level: 'BEG', make: function (r, sh) {
          var eq = siT(sh.mc, 0);
          return mbPart(t(eq), sh.mc, 0, { bDiag: [[qv(sh.mc), 'mb-swap', 'That’s the slope.']] },
            t(eq) + ' is ' + t(eq + '+0') + ': ' + t('m=' + qT(sh.mc)) + ', ' + t('b=0') + ' (the line passes through the origin).', null, 'm, b of ' + eq);
        } },
        { id: '4c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
          var m = sh.mc, eq = siT(m, 0), key = keyLine(m, 0);
          return drawPart('Graph ' + t(eq) + '.', padI(), key, slopeWrongs(m, 0), { m: qv(m), b: 0, mq: m },
            t('b=0') + ': start at the origin ' + t('(0,\\ 0)') + '. Slope ' + t(qT(m)) + ': down ' + t(-m[0]) + ', right ' + t(m[1]) + ' to ' + t(ptT([m[1], m[0]])) + ' (or up ' + t(-m[0]) + ', left ' + t(m[1]) + '). Join with a line.',
            ['With no constant term, the line goes through ' + t('(0,\\ 0)') + '.', 'Negative slope: down the top number, right the bottom number.'], 'graph ' + eq, [segOf(key)], [lineV([0, 0], [-m[1], -m[0]])]);
        } },
        { id: '4d', sub: 'd i', level: 'EMG', make: function (r, sh) {
          var k = sh.kd, eq = 'y=' + k;
          return mbPart(t(eq), [0, 1], k, { mDiag: [[k, 'h-slope', t(eq) + ' is ' + t('y=0x' + (k < 0 ? '' : '+') + k) + ': the ' + t(k) + ' is ' + t('b') + '. With no ' + t('x') + '-term, the slope is ' + t('0') + '.']] },
            t(eq) + ' is ' + t('y=0x' + (k < 0 ? '' : '+') + k) + ': ' + t('m=0') + ', ' + t('b=' + k) + ' — a horizontal line.', ['There is no ' + t('x') + '-term: what is the coefficient of ' + t('x') + '?'], 'm, b of y = k');
        } },
        { id: '4d2', sub: 'd ii', level: 'BEG', make: function (r, sh) {
          var k = sh.kd, eq = 'y=' + k, key = lineV([-5, k], [5, k]);
          var W = [{ is: lineV([k, -5], [k, 5]), code: 'gr-vh', hint: 'That’s the vertical line ' + t('x=' + k) + '. On ' + t('y=' + k) + ' every point has ' + t('y') + '-value ' + t(k) + ': a <b>horizontal</b> line.' },
            { is: lineV([-5, -k], [5, -k]), code: 'gr-b-sign', hint: 'Right kind of line — check its height: ' + t('y=' + k) + '.' }];
          return drawPart('Graph ' + t(eq) + '.', padI(), key, W, {},
            'Slope ' + t('0') + ', ' + t('y') + '-intercept ' + t(k) + ': the horizontal line through ' + t(ptT([0, k])) + '.', ['Every point on the line has the same ' + t('y') + '-value.'], 'graph y = k', [segOf(key)], [lineV([0, k], [1, k])]);
        } }] },
      /* ================= Q5 ================= */
      { num: '5', shared: q5Shared, stem: 'For each line, state the ' + t('y') + '-intercept, determine the ' + t('x') + '-intercept algebraically, and graph the equation without using a graphing calculator.', parts: (function () {
        function eqOf(sh, L) {
          if (L === 'a') return siT(sh.a[0], sh.a[2]);
          if (L === 'b') return 'y=-x' + sh.b;
          if (L === 'c') return siT([sh.c[0], sh.c[1]], -sh.c[3]);
          return siT([-sh.d[0], sh.d[1]], sh.d[3]);
        }
        function data(sh, L) {
          if (L === 'a') return { m: [sh.a[0], 1], b: sh.a[2], x0: sh.a[1] };
          if (L === 'b') return { m: [-1, 1], b: sh.b, x0: sh.b };
          if (L === 'c') return { m: [sh.c[0], sh.c[1]], b: -sh.c[3], x0: sh.c[2] };
          return { m: [-sh.d[0], sh.d[1]], b: sh.d[3], x0: sh.d[2] };
        }
        function icptPart(L, lev) {
          return { id: '5' + L, sub: L + ' i', level: lev, outcome: 'RF5', make: function (r, sh) {
            var d = data(sh, L), eq = eqOf(sh, L), m = d.m, b = d.b, x0 = d.x0, mv = qv(m);
            var step = t('0=' + lin([[m, 'x'], [b, '']])) + '<br>' + t(term(m, 'x', true) + '=' + (-b)) + '<br>' + t('x=' + (m[1] === 1 ? '\\frac{' + (-b) + '}{' + m[0] + '}' : (-b) + '\\times ' + qT(qinv(m))) + '=' + x0);
            var xd = [[-x0, 'xint-sign', 'Check the sign. Set ' + t('y=0') + ': ' + t('0=' + lin([[m, 'x'], [b, '']])) + '. Move the constant to the other side (its sign changes), then divide by the coefficient of ' + t('x') + '.'],
              [b, 'xint-yint', 'That’s the ' + t('y') + '-intercept. For the ' + t('x') + '-intercept, set ' + t('y=0') + ' and solve for ' + t('x') + '.'],
              [-1 / x0, 'xint-flip', 'You divided the wrong way round: from ' + t(term(m, 'x', true) + '=' + (-b)) + ', divide ' + t(-b) + ' by ' + t(qT(m)) + '.'], [1 / x0, 'xint-flip', 'You divided the wrong way round: divide the constant by the coefficient of ' + t('x') + '.']];
            if (m[1] !== 1) xd.push([-b * mv, 'xint-recip', 'To undo “multiply by ' + t(qT(m)) + '”, multiply by its <b>reciprocal</b> ' + t(qT(qinv(m))) + ' (not by ' + t(qT(m)) + ' itself).'], [b * mv, 'xint-recip', 'To undo “multiply by ' + t(qT(m)) + '”, multiply by its reciprocal ' + t(qT(qinv(m))) + '.']);
            var p = B.fields(t(eq), [yField(), xField()], [valC(b, [[x0, 'icpt-swap', 'That’s the ' + t('x') + '-intercept. The ' + t('y') + '-intercept is ' + t('b') + ': set ' + t('x=0') + '.']], { axis: 'y' }), valC(x0, xd, { axis: 'x' })],
              [String(b), String(x0)], t('y') + '-int ' + t(b) + ' &nbsp;' + t(ptT([0, b])) + '; &nbsp;' + t('x') + '-int ' + t(x0) + ' &nbsp;' + t(ptT([x0, 0])),
              t('y') + '-intercept: set ' + t('x=0') + ' → ' + t('y=' + b) + '.<br>' + t('x') + '-intercept: set ' + t('y=0') + ':<br>' + step + '.',
              ['The ' + t('y') + '-intercept is ' + t('b') + '. For the ' + t('x') + '-intercept, replace ' + t('y') + ' with ' + t('0') + ' and solve.', 'Undo the constant first, then the coefficient of ' + t('x') + '.'], 'intercepts of ' + eq);
            p.good = [['(0,\\ ' + b + ')', '(' + x0 + ',\\ 0)']]; p.bad = (x0 !== b ? [[String(x0), String(b)]] : []).concat([[String(b), String(-x0)]]);
            return p;
          } };
        }
        function graphPart(L, lev) {
          return { id: '5' + L + '2', sub: L + ' ii', level: lev, make: function (r, sh) {
            var d = data(sh, L), eq = eqOf(sh, L), key = lineV([0, d.b], [d.x0, 0]);
            var W = [{ is: lineV([0, d.b], [-d.x0, 0]), code: 'gr-xint', hint: 'Check the sign of the ' + t('x') + '-intercept: solve ' + t('0=' + lin([[d.m, 'x'], [d.b, '']])) + ' again.' },
              { is: lineV([0, -d.b], [d.x0, 0]), code: 'gr-b-sign', hint: 'Check the ' + t('y') + '-intercept: ' + t('b=' + d.b) + '.' }];
            if (d.x0 !== d.b) W.push({ is: lineV([0, d.x0], [d.b, 0]), code: 'icpt-swap', hint: 'You swapped the intercepts: the ' + t('y') + '-intercept ' + t(d.b) + ' goes on the ' + t('y') + '-axis, the ' + t('x') + '-intercept ' + t(d.x0) + ' on the ' + t('x') + '-axis.' });
            return drawPart('Graph ' + t(eq) + ' using its two intercepts.', padI([-6, 6], [-8, 8]), key, W, { m: qv(d.m), b: d.b, x0: d.x0, mq: d.m },
              'Mark ' + t(ptT([0, d.b])) + ' on the ' + t('y') + '-axis and ' + t(ptT([d.x0, 0])) + ' on the ' + t('x') + '-axis, and join them with a line.', ['Find both intercepts first (part i).', 'A line through two points: use ╱ Line.'], 'graph ' + eq + ' by intercepts', [segOf(key)], [lineV([d.x0, 0], [0, d.b])]);
          } };
        }
        return [icptPart('a', 'EMG'), graphPart('a', 'BEG'), icptPart('b', 'EMG'), graphPart('b', 'BEG'), icptPart('c', 'PRG'), graphPart('c', 'EMG'), icptPart('d', 'PRG'), graphPart('d', 'EMG')];
      })() },
      /* ================= Q6 ================= */
      { num: '6', parts: [
        { id: '6', level: 'EMG', make: function (r) {
          var k = r.pick([2, 3, 4, 5, 6, 7, 8, 9, -2, -3, -4]), eq = 'y=' + k + 'x';
          return mc(r, 'Why can the linear equation ' + t(eq) + ' be graphed using the slope–intercept method of Question 4, but not by the two-intercept method of Question 5?', [
            { html: 'Both intercepts of ' + t(eq) + ' are the same point, ' + t('(0,\\ 0)') + ', and one point can’t fix a line. The slope method only needs ' + t('(0,\\ 0)') + ' and the slope ' + t(k) + '.', right: true },
            { html: t(eq) + ' has no ' + t('y') + '-intercept, so there is nothing to plot first.', why: 'It does have one: ' + t('b=0') + ', the point ' + t('(0,\\ 0)') + '. The trouble is that the ' + t('x') + '-intercept is the <b>same</b> point.' },
            { html: 'A slope of ' + t(k) + ' is too steep to graph from intercepts.', why: 'Steepness doesn’t matter. Set ' + t('y=0') + ': ' + t('x=0') + ' — the two intercepts are the same point.' },
            { html: t(eq) + ' is not a linear equation, so only one method works.', why: 'It is linear: ' + t(eq + '+0') + ' has the form ' + t('y=mx+b') + '.' }],
            t(eq) + ': set ' + t('x=0') + ' → ' + t('y=0') + '; set ' + t('y=0') + ' → ' + t('x=0') + '. Both intercepts are ' + t('(0,\\ 0)') + ', so the intercept method gives only one point. The slope method uses ' + t('(0,\\ 0)') + ' and ' + t('m=' + k) + ' to step out a second point.',
            ['Find both intercepts of ' + t(eq) + '. How many different points do you get?'], 'why y = kx needs the slope method');
        } }] },
      /* ================= Q7 ================= */
      { num: '7', shared: function (r) { var k = r.pick([[1, 1], [1, 1], [1, 1], [2, 1], [3, 1], [1, 2], [1, 3]]); return { k: k, m: qneg(k) }; },
        stem: function (sh) { return 'Consider the graph of the function with equation ' + t(siT(sh.m, 0)) + '.'; }, parts: [
        { id: '7a', level: 'BEG', make: function (r, sh) {
          var eq = siT(sh.m, 0), one = sh.k[0] === 1 && sh.k[1] === 1;
          return mbPart('(a) State the values of ' + t('m') + ' and ' + t('b') + '.', sh.m, 0, { mDiag: one ? [[0, 'hidden-1', t('-x') + ' means ' + t('-1x') + ': the slope is ' + t('-1') + '.']] : [] },
            'Written as ' + t('y=mx+b') + ': ' + t('y=' + (one ? '-1' : qT(sh.m)) + 'x+0') + '. So ' + t('m=' + qT(sh.m)) + ', ' + t('b=0') + '.', [t(eq) + ' has a hidden constant term: what is it?'], 'm and b of ' + eq);
        } },
        { id: '7b', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
          var eq = siT(sh.m, 0);
          var nh = 'It does cross: set ' + t('x=0') + ' (or ' + t('y=0') + ') in ' + t(eq) + ' and see what you get.';
          var p = B.fields('(b) Determine the ' + t('x') + '- and ' + t('y') + '-intercepts.', [xField(), { label: t('y') + '-intercept', name: t('y') + '-intercept', mode: 'math', keys: 'fraction', none: true }],
            [valC(0, [], { axis: 'x', noneHint: nh }), valC(0, [], { axis: 'y', noneHint: nh })], ['0', '0'], 'Both are ' + t('0') + ': the single point ' + t('(0,\\ 0)') + '.',
            'Set ' + t('x=0') + ': ' + t('y=0') + '. &nbsp;Set ' + t('y=0') + ': ' + t('x=0') + '.<br>Both intercepts are the single point ' + t('(0,\\ 0)') + ' — the line passes through the origin.', ['Substitute ' + t('0') + ' for one variable and solve for the other.'], 'intercepts of y = -kx');
          p.good = [['(0,\\ 0)', '(0,\\ 0)']]; p.bad = [['none', 'none'], ['0', 'none']];
          return p;
        } },
        { id: '7c', level: 'BEG', make: function (r, sh) {
          var m = sh.m, eq = siT(m, 0), key = keyLine(m, 0, [-5, 5], [-5, 5]);
          return drawPart('(c) Sketch the graph of ' + t(eq) + '.', padI([-5, 5], [-5, 5]), key, slopeWrongs(m, 0), { m: qv(m), b: 0, mq: m },
            'Start at ' + t('(0,\\ 0)') + '; slope ' + t(qT(m)) + ': down ' + t(-m[0]) + ', right ' + t(m[1]) + ' to ' + t(ptT([m[1], m[0]])) + '. Join with a line, arrows at both ends.',
            ['Start at the origin.', 'A negative slope falls from left to right.'], 'graph ' + eq, [segOf(key)], [lineV([0, 0], [-m[1], -m[0]])]);
        } },
        { id: '7d', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
          var D = '\\{x\\mid x\\in\\mathbb{R}\\}', R = '\\{y\\mid y\\in\\mathbb{R}\\}';
          var p = B.fields('(d) Determine the domain and range of the function.', [{ label: 'Domain', name: 'Domain', mode: 'math', keys: 'set', vars: ['x', 'y'] }, { label: 'Range', name: 'Range', mode: 'math', keys: 'set', vars: ['x', 'y'] }],
            [K.set(D, { v: 'x' }), K.set(R, { v: 'y' })], [D, R], t('D=' + D) + ', &nbsp;' + t('R=' + R),
            'The line continues forever in both directions (arrows), so every ' + t('x') + ' and every ' + t('y') + ' is used:<br>' + t('D=' + D) + ', &nbsp;' + t('R=' + R) + '.',
            ['A slanted line with arrows at both ends goes on forever left, right, up and down.'], 'domain and range of y = -kx');
          p.good = [['\\mathbb{R}', '\\mathbb{R}']];
          return p;
        } },
        { id: '7e', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
          var eq = siT(sh.m, 0), eq2 = siT(sh.k, 0);
          return mc(r, '(e) How does the graph of ' + t(eq) + ' compare with the graph of ' + t(eq2) + '?', [
            { html: 'They are mirror images of each other across the ' + t('x') + '-axis (and across the ' + t('y') + '-axis): ' + t(eq2) + ' rises, ' + t(eq) + ' falls, and they meet only at the origin.', right: true },
            { html: 'They are parallel lines.', why: 'Parallel lines have equal slopes. These slopes, ' + t(qT(sh.k)) + ' and ' + t(qT(sh.m)) + ', have opposite signs — and the lines meet at ' + t('(0,\\ 0)') + '.' },
            { html: t(eq) + ' is the graph of ' + t(eq2) + ' moved down.', why: 'Both lines have ' + t('b=0') + ': both pass through ' + t('(0,\\ 0)') + ', so nothing has been moved down.' },
            { html: 'They are the same line, since both pass through the origin.', why: 'They share only the origin. At ' + t('x=' + sh.k[1]) + ', one line has ' + t('y=' + sh.k[0]) + ' and the other ' + t('y=-' + sh.k[0]) + '.' }],
            t(eq2) + ' has slope ' + t(qT(sh.k)) + ' (rises); ' + t(eq) + ' has slope ' + t(qT(sh.m)) + ' (falls). Every point ' + t('(a,\\ b)') + ' on one matches ' + t('(a,\\ -b)') + ' on the other: they are reflections across the ' + t('x') + '-axis (equivalently the ' + t('y') + '-axis), meeting only at the origin.',
            ['Compare the slopes and the ' + t('y') + '-intercepts of the two lines.'], 'compare y = -kx and y = kx');
        } }] },
      /* ================= Q8 ================= */
      { num: '8', section: 'Part C — Intercepts, multiple choice and numerical response', stem: 'For each linear equation, determine the slope, the ' + t('y') + '-intercept, and the ' + t('x') + '-intercept to the nearest hundredth.', parts: (function () {
        function part(id, sub, lev, gen) {
          return { id: id, sub: sub, level: lev, outcome: 'RF5', make: function (r) {
            var g = gen(r), m = g.m, b = g.b, x0 = -b / qv(m), eq = g.eq;
            var xd = function (v) { var rv = K.roundTo(v, 2); if (near(rv, K.roundTo(-x0, 2))) return { code: 'xint-sign', hint: 'Check the sign: from ' + t('0=' + lin([[m, 'x'], [b, '']])) + ', move ' + t(b) + ' across (its sign changes), then divide by ' + t(qT(m)) + '.' };
              if (near(rv, K.roundTo(qv(m) / -b, 2)) || near(rv, K.roundTo(-qv(m) / -b, 2))) return { code: 'xint-flip', hint: 'Divide the constant by the slope, not the slope by the constant.' };
              if (near(rv, K.roundTo(-b * qv(m), 2)) || near(rv, K.roundTo(b * qv(m), 2))) return { code: 'xint-recip', hint: 'Divide by the slope (multiply by its reciprocal), don’t multiply by it.' }; return null; };
            var flds = [slopeField(), yField(), xField()];
            var p = B.fields('(' + sub + ') ' + t(eq), flds, [slopeC(m, [[b, 'mb-swap', 'That’s the ' + t('y') + '-intercept; the slope multiplies ' + t('x') + '.']]), valC(b, [[qv(m), 'mb-swap', 'That’s the slope.']], { axis: 'y' }), K.approx(x0, 2, { diag: xd })],
              [qT(m), String(b), K.roundTo(x0, 2).toFixed(2)], t('m=' + qT(m)) + (m[1] !== 1 ? t('=' + nT(qv(m))) : '') + ', &nbsp;' + t('b=' + b) + ', &nbsp;' + t('x') + '-int ' + t('\\approx ' + K.roundTo(x0, 2).toFixed(2)),
              (g.pre ? g.pre + '<br>' : '') + 'slope ' + t(qT(m)) + ', ' + t('y') + '-intercept ' + t(b) + '.<br>' + t('0=' + lin([[m, 'x'], [b, '']])) + ' → ' + t(term(m, 'x', true) + '=' + (-b)) + ' → ' + t('x=' + qT(Q(-b * m[1], m[0]))) + t('\\approx ' + K.roundTo(x0, 2).toFixed(2)) + '.',
              ['Read ' + t('m') + ' and ' + t('b') + ' once the equation reads ' + t('y=mx+b') + '.', 'For the ' + t('x') + '-intercept set ' + t('y=0') + ', solve, and round to two decimal places.'], 'm, b, x-int of ' + eq);
            p.good = [[nT(qv(m)), '(0,\\ ' + b + ')', K.roundTo(x0, 2).toFixed(2)]];
            return p;
          } };
        }
        return [
          part('8i', 'i', 'BEG', function (r) { var a = r.int(3, 9), c; do { c = r.int(5, 20); } while (c % a === 0); return { m: [a, 1], b: -c, eq: 'y=' + a + 'x-' + c }; }),
          part('8ii', 'ii', 'EMG', function (r) { var p = r.pick([13, 15, 17, 19, 21, 23, 25, 27, 29, 31]), c; do { c = r.int(20, 60); } while ((2 * c) % p === 0); return { m: [-p, 2], b: -c, eq: 'y=-\\frac{' + p + '}{2}x-' + c }; }),
          part('8iii', 'iii', 'EMG', function (r) { var p = r.pick([3, 5, 7, 9, 11]), c; do { c = r.int(20, 60); } while ((4 * c) % p === 0); return { m: [-p, 4], b: c, eq: 'y=' + c + '-\\frac{' + p + '}{4}x', pre: 'Reorder: ' + t(siT([-p, 4], c)) + '.' }; })];
      })() },
      /* ================= Q9 ================= */
      { num: '9', parts: [
        { id: '9', level: 'BEG', outcome: 'RF4', make: function (r) {
          var k = r.int(2, 9), c = r.int(8, 20), a = r.int(2, 6), n = r.int(2, 9), useFrac = r.chance(0.35);
          var A = useFrac ? 'y=\\dfrac{x}{' + k + '}' : 'y=' + k + 'x', Bq = 'y=' + c + '-' + a + 'x', C = 'y=\\dfrac{' + n + '}{x}';
          var three = r.shuffle([
            { html: t(A), why: useFrac ? t(A) + ' is ' + t('y=\\frac{1}{' + k + '}x') + ': dividing by a constant is multiplying by ' + t('\\frac{1}{' + k + '}') + ' — linear.' : t(A) + ' is ' + t('y=' + k + 'x+0') + ' — a straight line through the origin.' },
            { html: t(Bq), why: t(Bq) + ' reorders to ' + t('y=-' + a + 'x+' + c) + ' — a straight line.' },
            { html: t(C), right: true }]);
          three.push({ html: 'All of the above represent the equation of a straight line.', why: 'Look again at ' + t(C) + ': the variable ' + t('x') + ' is in the denominator.' });
          return mc(r, 'Which of the following does <b>not</b> represent the equation of a straight line?', three,
            t(A) + ' and ' + t(Bq) + ' can both be written as ' + t('y=mx+b') + '. In ' + t(C) + ', ' + t('x') + ' is in the <b>denominator</b>: it can’t be written as ' + t('y=mx+b') + ' and its graph is a curve.' + (useFrac ? '' : ' (Don’t confuse it with ' + t('y=\\frac{x}{' + n + '}') + ', which is linear.)'),
            ['A straight line can be written as ' + t('y=mx+b') + ' — with ' + t('x') + ' only to the first power, never in a denominator.'], 'which is not a line', true);
        } }] },
      /* ================= Q10 ================= */
      { num: '10', parts: [
        { id: '10', level: 'PRG', outcome: 'RF5', make: function (r) {
          var q = r.int(2, 5), b = r.int(1, 4), x0 = q * b, x1 = q * (b + 1), c = r.int(1, 6), eq = 'y=-\\frac{1}{' + q + '}x+' + b, F = r.pick(['A', 'B', 'C', 'D']);
          var S = {
            A: F === 'A' ? { html: 'The graph rises from left to right.', why: null } : { html: 'The graph falls from left to right.', why: 'True: ' + t('m=-\\frac{1}{' + q + '}<0') + ', so the graph falls.' },
            B: F === 'B' ? { html: 'The ' + t('x') + '-intercept is ' + t(-x0) + '.' } : { html: 'The ' + t('x') + '-intercept is ' + t(x0) + '.', why: 'True: ' + t('0=-\\frac{1}{' + q + '}x+' + b) + ' gives ' + t('x=' + x0) + '.' },
            C: F === 'C' ? { html: 'The graph passes through the point ' + t(ptT([x1, 1])) + '.' } : { html: 'The graph passes through the point ' + t(ptT([x1, -1])) + '.', why: 'True: ' + t('-\\frac{1}{' + q + '}(' + x1 + ')+' + b + '=-' + (b + 1) + '+' + b + '=-1') + '.' },
            D: F === 'D' ? { html: 'The line is perpendicular to the line ' + t('y=-' + q + 'x+' + c) + '.' } : { html: 'The line is perpendicular to the line ' + t('y=' + q + 'x+' + c) + '.', why: 'True: ' + t('\\left(-\\frac{1}{' + q + '}\\right)(' + q + ')=-1') + ' — negative reciprocals.' } };
          S[F].right = true;
          var why = { A: t('m=-\\frac{1}{' + q + '}<0') + ': the graph <b>falls</b>, so “rises” is false.', B: t('0=-\\frac{1}{' + q + '}x+' + b) + ' gives ' + t('x=' + x0) + ', not ' + t(-x0) + '.',
            C: 'At ' + t('x=' + x1) + ': ' + t('y=-\\frac{1}{' + q + '}(' + x1 + ')+' + b + '=-1') + ', not ' + t('1') + '.', D: t('\\left(-\\frac{1}{' + q + '}\\right)(-' + q + ')=1\\ne -1') + ', so the lines are not perpendicular.' };
          return mc(r, 'Which of the following statements is <b>false</b> for the line ' + t(eq) + '?', ['A', 'B', 'C', 'D'].map(function (k) { return S[k]; }),
            'Check each statement: ' + ['A', 'B', 'C', 'D'].map(function (k) { return k === F ? '<b>' + why[k] + ' — false.</b>' : S[k].why; }).join('<br>'),
            ['Test every statement: the sign of the slope, the ' + t('x') + '-intercept (set ' + t('y=0') + '), substitute the point, and multiply the slopes.', 'Perpendicular slopes multiply to ' + t('-1') + '.'], 'false statement about y=-x/q+b', true);
        } }] },
      /* ================= Q11 ================= */
      { num: '11', parts: [
        { id: '11', level: 'PRG', make: function (r) {
          var k = r.int(2, 5), q = r.int(2, 4), b = r.int(1, 3), kq = k * q, eq = k + 'y=\\frac{1}{' + q + '}x+' + (k * b), T = r.pick(['X', 'Y', 'S', 'P']);
          var S = {
            X: T === 'X' ? { html: 'The ' + t('x') + '-intercept is ' + t(-b * kq) + '.' } : { html: 'The ' + t('x') + '-intercept is ' + t(b * kq) + '.', why: 'Sign: ' + t('0=\\frac{1}{' + kq + '}x+' + b) + ' gives ' + t('x=' + (-b * kq)) + '.' },
            Y: T === 'Y' ? { html: 'The ' + t('y') + '-intercept is ' + t(b) + '.' } : { html: 'The ' + t('y') + '-intercept is ' + t(k * b) + '.', why: t(k * b) + ' is the constant <b>before</b> dividing by ' + t(k) + '. Divide every term by ' + t(k) + ': ' + t('b=' + b) + '.' },
            S: T === 'S' ? { html: 'The slope is ' + t('\\frac{1}{' + kq + '}') + '.' } : { html: 'The slope is ' + t('\\frac{1}{' + q + '}') + '.', why: 'Divide <b>every</b> term by ' + t(k) + ': ' + t('\\frac{1}{' + q + '}\\div ' + k + '=\\frac{1}{' + kq + '}') + '.' },
            P: T === 'P' ? { html: 'The graph passes through the point ' + t(ptT([-kq, b - 1])) + '.' } : { html: 'The graph passes through the point ' + t(ptT([-2 * k, b + 1])) + '.', why: 'At ' + t('x=' + (-2 * k)) + ': ' + t('y=\\frac{1}{' + kq + '}(' + (-2 * k) + ')+' + b + '=' + qT(qadd(Q(-2, q), b))) + ', not ' + t(b + 1) + '.' } };
          S[T].right = true;
          return mc(r, 'Which of the following statements is <b>true</b> for the line ' + t(eq) + '?', ['X', 'Y', 'S', 'P'].map(function (z) { return S[z]; }),
            'Divide every term by ' + t(k) + ': ' + t('y=\\frac{1}{' + kq + '}x+' + b) + '. So ' + t('m=\\frac{1}{' + kq + '}') + ', ' + t('b=' + b) + ', and ' + t('0=\\frac{1}{' + kq + '}x+' + b) + ' gives the ' + t('x') + '-intercept ' + t(-b * kq) + '. ' +
            (T === 'P' ? 'At ' + t('x=' + (-kq)) + ': ' + t('y=-1+' + b + '=' + (b - 1)) + ' ✓.' : 'At ' + t('x=' + (-2 * k)) + ', ' + t('y=' + qT(qadd(Q(-2, q), b))) + '.') + ' Only one statement is true.',
            ['Rearrange into ' + t('y=mx+b') + ' first: divide every term by ' + t(k) + '.'], 'true statement about ky = x/q + c', true);
        } }] },
      /* ================= Q12 ================= */
      { num: '12', parts: [
        { id: '12', level: 'EMG', outcome: 'RF5', make: function (r) {
          var roles = { steep: r.pick([2, 2.5, 3]), shallow: r.pick([0.4, 0.5]), neg: r.pick([-1, -1.2, -1.5]) }, L3 = r.shuffle(['a', 'b', 'c']), who = { steep: L3[0], shallow: L3[1], neg: L3[2] };
          var lines = ['steep', 'shallow', 'neg'].map(function (k) { return { m: roles[k], b: 0 }; });
          var texts = ['steep', 'shallow', 'neg'].map(function (k) {
            var s = roles[k], E = clip(s, 0, [-2.6, 2.6], [-2.6, 2.6]), P = s > 0 ? E[1] : E[0];
            if (k === 'shallow') return { x: E[0][0] + 0.05, y: E[0][1] - 0.5, text: 'y = ' + who[k] + 'x', anchor: 'start' };
            return { x: P[0] + (s > 0 ? 0.35 : 0.1), y: P[1] + 0.15, text: 'y = ' + who[k] + 'x', anchor: 'start' }; });
          var fig = lineFig(lines, { x: [-3, 3], y: [-3, 3], grid: 0, labels: 0, ends: 'none', max: 240, texts: texts, aria: 'three lines through the origin' });
          var right = [who.neg, who.shallow, who.steep], mag = [who.shallow, who.neg, who.steep], rev = [who.steep, who.shallow, who.neg];
          var perms = [['a', 'b', 'c'], ['b', 'a', 'c'], ['c', 'a', 'b'], ['c', 'b', 'a'], ['a', 'c', 'b'], ['b', 'c', 'a']], key = function (p) { return p.join(''); };
          var chosen = [right, mag, rev]; perms.forEach(function (p) { if (chosen.length < 4 && !chosen.some(function (c) { return key(c) === key(p); })) chosen.push(p); });
          var whyOf = function (p) {
            if (key(p) === key(mag)) return 'That orders the lines by <b>steepness</b> only. ' + t('y=' + who.neg + 'x') + ' falls, so ' + t(who.neg) + ' is negative — less than both positive slopes.';
            if (key(p) === key(rev)) return 'That is greatest to least. The question’s inequalities go from least to greatest.';
            return 'Start with the sign: only ' + t('y=' + who.neg + 'x') + ' falls (negative slope). Of the two rising lines, the steeper one has the greater slope.';
          };
          var opts = chosen.map(function (p) { return { html: t(p[0] + '<' + p[1] + '<' + p[2]), right: key(p) === key(right), why: key(p) === key(right) ? null : whyOf(p) }; });
          return mc(r, 'The lines ' + t('y=ax') + ', ' + t('y=bx') + ' and ' + t('y=cx') + ' are shown below. Which of the following statements is true?' + fig, opts,
            t('y=' + who.neg + 'x') + ' falls from left to right, so ' + t(who.neg + '<0') + '. ' + t('y=' + who.shallow + 'x') + ' rises gently and ' + t('y=' + who.steep + 'x') + ' rises steeply, so ' + t('0<' + who.shallow + '<' + who.steep) + '. Hence ' + t(right.join('<')) + '.',
            ['Which line falls? Its slope is negative.', 'Of two rising lines, the steeper one has the greater slope.'], 'order slopes from a graph');
        } }] },
      /* ================= Q13 / Q14 ================= */
      { num: '13', shared: function (r) { var a, b; do { a = r.int(2, 6); b = r.int(2, 8); } while (b % a === 0); return { a: a, b: b }; },
        stem: function (sh) { return 'Consider the line with equation ' + t('y=' + sh.a + 'x+' + sh.b) + '. The line intersects the ' + t('x') + '-axis at ' + t('P') + ' and the ' + t('y') + '-axis at ' + t('Q') + '. Triangle ' + t('POQ') + ' is formed, where ' + t('O') + ' is the origin.'; }, parts: [
        { id: '13', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
          var a = sh.a, b = sh.b, x0 = b / a, A = b * b / (2 * a);
          var p = B.approx('<i>(Numerical Response)</i> The area of ' + t('\\triangle POQ') + ', in square units, to the nearest tenth, is ____.', A, 1, { nr: true, diag: function (v) {
            if (near(K.roundTo(v, 1), K.roundTo(2 * A, 1))) return { code: 'tri-half', hint: 'Area of a triangle is ' + t('\\frac{1}{2}\\times\\text{base}\\times\\text{height}') + ' — don’t forget the ' + t('\\frac{1}{2}') + '.' }; return null; } },
            t('Q=(0,\\ ' + b + ')') + '. For ' + t('P') + ' set ' + t('y=0') + ': ' + t('0=' + a + 'x+' + b) + ', ' + t('x=-\\frac{' + b + '}{' + a + '}\\approx ' + nT(-Math.round(x0 * 1e4) / 1e4)) + '.<br>The triangle has legs ' + t('OP=' + qT(Q(b, a))) + ' and ' + t('OQ=' + b) + ':<br>' + t('A=\\frac{1}{2}\\left(' + qT(Q(b, a)) + '\\right)(' + b + ')=' + qT(Q(b * b, 2 * a)) + '\\approx ' + K.roundTo(A, 1).toFixed(1)) + ' square units.',
            ['Find both intercepts: they are the corners ' + t('P') + ' and ' + t('Q') + ' of a right triangle.', 'Lengths are positive: use the distance from the origin.'], 'area of intercept triangle');
          return p;
        } }] },
      { num: '14', shared: function (r) {
          /* skip perimeters within 0.005 of a rounding boundary (3, 4 → 9.5497; 2, 3 → 7.854): rounded intermediate values would flip the tenth */
          var a, b, P; do { a = r.int(2, 6); b = r.int(2, 8); P = b / a + b + Math.sqrt(b * b / (a * a) + b * b); } while (b % a === 0 || Math.abs(P * 10 - Math.floor(P * 10) - 0.5) < 0.05); return { a: a, b: b }; },
        stem: function (sh) { return 'Consider the line with equation ' + t('y=' + sh.a + 'x+' + sh.b) + '. The line intersects the ' + t('x') + '-axis at ' + t('P') + ' and the ' + t('y') + '-axis at ' + t('Q') + '. Triangle ' + t('POQ') + ' is formed, where ' + t('O') + ' is the origin.'; }, parts: [
        { id: '14', level: 'ADV', outcome: 'RF5', make: function (r, sh) {
          var a = sh.a, b = sh.b, x0 = b / a, h = Math.sqrt(x0 * x0 + b * b), Pm = x0 + b + h;
          var p = B.approx('<i>(Numerical Response)</i> To the nearest tenth, the perimeter of ' + t('\\triangle POQ') + ' is ____.', Pm, 1, { nr: true, diag: function (v) {
            var rv = K.roundTo(v, 1);
            if (near(rv, K.roundTo(x0 + b, 1))) return { code: 'tri-hyp', hint: 'The perimeter goes all the way round: add the third side ' + t('PQ') + ' (use the Pythagorean theorem).' };
            if (near(rv, K.roundTo(b * b / (2 * a), 1))) return { code: 'tri-area', hint: 'That’s the area. The perimeter is the sum of the three side lengths.' };
            if (near(rv, K.roundTo(-x0 + b + h, 1))) return { code: 'sign', hint: 'A length can’t be negative: ' + t('OP') + ' is the distance ' + t(qT(Q(b, a))) + '.' }; return null; } },
            t('P=\\left(-' + qT(Q(b, a)) + ',\\ 0\\right)') + ', ' + t('Q=(0,\\ ' + b + ')') + '. Legs ' + t('OP=' + qT(Q(b, a))) + ', ' + t('OQ=' + b) + '.<br>' + t('PQ=\\sqrt{\\left(' + qT(Q(b, a)) + '\\right)^{2}+' + b + '^{2}}\\approx ' + h.toFixed(4)) + '.<br>Perimeter ' + t('\\approx ' + nT(Math.round(x0 * 1e4) / 1e4) + '+' + b + '+' + h.toFixed(4) + '\\approx ' + K.roundTo(Pm, 1).toFixed(1)) + ' units.',
            ['Find both intercepts, then the three sides of the right triangle.', 'The hypotenuse: ' + t('c=\\sqrt{a^{2}+b^{2}}') + '.'], 'perimeter of intercept triangle');
          return p;
        } }] }
    ],

    extra: [
      /* ================= EP Part A ================= */
      { num: '1', section: 'Extra practice A — Is it linear? Three answers, not two', stem: 'A relation is linear when it <i>can</i> be written as ' + t('y=mx+b') + ' — some arrive disguised and must be rearranged first. A vertical line is straight but can’t be written as ' + t('y=mx+b') + ': it gets a column of its own.', parts: [
        { id: 'e1', level: 'EMG', outcome: 'RF4', make: function (r) {
          var T = r.shuffle(ep1Templates(r)), letters = 'abcdefghijkl'.split(''), want = {}, info = {};
          var rows = T.map(function (x, i) { want[letters[i]] = x.cat; info[letters[i]] = x; return { id: letters[i], html: '(' + letters[i] + ') ' + t(x.tex) }; });
          var name = { L: 'linear', N: 'non-linear', V: 'a vertical line (straight, but not ' + t('y=mx+b') + ')' };
          return B.grid('Sort every relation into exactly one column. <b>Vertical</b> = a straight line that can’t be written as ' + t('y=mx+b') + '.', rows, [{ id: 'L', html: 'Linear' }, { id: 'N', html: 'Non-linear' }, { id: 'V', html: 'Vertical' }], want, {
            why: function (id, given) { var x = info[id]; return { code: x.cat === 'V' || given === 'V' ? 'lin-vert' : given === 'L' ? 'lin-said-lin' : 'lin-said-non', hint: '(' + id + ') is ' + name[x.cat] + ': ' + x.why }; } },
            T.map(function (x, i) { return '(' + letters[i] + ') ' + name[x.cat] + ' — ' + x.why; }).join('<br>'),
            ['Rearrange each one: can you get ' + t('y=') + ' an expression with ' + t('x') + ' only to the first power?', 'If ' + t('y') + ' doesn’t appear at all, the line is vertical.'], 'three-way sort of 12 relations');
        } }] },
      { num: '2', stem: 'Each pair looks almost the same, but the two members belong in different columns. Choose the explanation of the difference.', parts: [
        { id: 'e2a', level: 'EMG', outcome: 'RF4', make: function (r) {
          var n = r.int(2, 9);
          return mc(r, '(a) ' + t('y=\\dfrac{x}{' + n + '}') + ' and ' + t('y=\\dfrac{' + n + '}{x}'), [
            { html: t('y=\\frac{x}{' + n + '}=\\frac{1}{' + n + '}x') + ' is linear (dividing by a constant); in ' + t('y=\\frac{' + n + '}{x}') + ' the variable is in the denominator, so it is non-linear.', right: true },
            { html: 'Both are linear — they use the same numbers.', why: 'Where ' + t('x') + ' sits matters. ' + t('x') + ' in a denominator can’t be written as ' + t('y=mx+b') + '.' },
            { html: t('y=\\frac{' + n + '}{x}') + ' is linear and ' + t('y=\\frac{x}{' + n + '}') + ' is not.', why: 'The other way round: ' + t('\\frac{x}{' + n + '}') + ' is ' + t('\\frac{1}{' + n + '}x') + ', a slope times ' + t('x') + '.' },
            { html: 'Both are non-linear because both contain a fraction.', why: 'A fraction <b>coefficient</b> is fine: ' + t('y=\\frac{1}{' + n + '}x') + ' is linear. Only ' + t('x') + ' in the denominator makes it a curve.' }],
            t('y=\\frac{x}{' + n + '}') + ' is ' + t('y=\\frac{1}{' + n + '}x') + ' (' + t('m=\\frac{1}{' + n + '}') + ', ' + t('b=0') + '): linear. In ' + t('y=\\frac{' + n + '}{x}') + ' the variable is in the denominator: non-linear.', ['Rewrite each with ' + t('y') + ' alone and look at where ' + t('x') + ' is.'], 'x/n vs n/x');
        } },
        { id: 'e2b', level: 'EMG', outcome: 'RF4', make: function (r) {
          var n = r.int(2, 12);
          return mc(r, '(b) ' + t('xy=' + n) + ' and ' + t('x+y=' + n), [
            { html: t('xy=' + n) + ' <b>multiplies</b> the variables (' + t('y=\\frac{' + n + '}{x}') + ', non-linear); ' + t('x+y=' + n) + ' only <b>adds</b> them (' + t('y=-x+' + n) + ', linear).', right: true },
            { html: 'Both are linear, because neither has an exponent.', why: 'Multiplying the variables is also not allowed: ' + t('xy=' + n) + ' becomes ' + t('y=\\frac{' + n + '}{x}') + ', a curve.' },
            { html: t('xy=' + n) + ' is linear with slope ' + t(n) + '.', why: 'Solve for ' + t('y') + ': ' + t('y=\\frac{' + n + '}{x}') + ' — ' + t('x') + ' ends up in the denominator.' },
            { html: t('x+y=' + n) + ' is not linear because it isn’t solved for ' + t('y') + '.', why: 'It only needs rearranging: ' + t('y=-x+' + n) + '.' }],
            t('xy=' + n) + ' → ' + t('y=\\frac{' + n + '}{x}') + ': non-linear. ' + t('x+y=' + n) + ' → ' + t('y=-x+' + n) + ': linear, ' + t('m=-1') + ', ' + t('b=' + n) + '.', ['Solve each for ' + t('y') + '.'], 'xy=n vs x+y=n');
        } },
        { id: 'e2c', level: 'EMG', outcome: 'RF4', make: function (r) {
          var k = r.int(2, 5), c = r.pick([1, 3, 5, 7, 9].filter(function (z) { return z % k !== 0; })), v = qT(Q(-c, k));
          return mc(r, '(c) ' + t(k + 'y+' + c + '=0') + ' and ' + t(k + 'x+' + c + '=0'), [
            { html: t(k + 'y+' + c + '=0') + ' gives ' + t('y=' + v) + ', a <b>horizontal</b> line (' + t('y=0x' + v) + ', linear with ' + t('m=0') + '). ' + t(k + 'x+' + c + '=0') + ' gives ' + t('x=' + v) + ', a <b>vertical</b> line: no ' + t('y') + ', so it can’t be written as ' + t('y=mx+b') + '.', right: true },
            { html: 'Both are vertical lines.', why: 'Only the one without ' + t('y') + ' is vertical. ' + t('y=' + v) + ' is horizontal.' },
            { html: 'Both are horizontal lines with slope ' + t('0') + '.', why: t('x=' + v) + ' is vertical: its run is always ' + t('0') + ', so its slope is undefined.' },
            { html: t(k + 'y+' + c + '=0') + ' is vertical and ' + t(k + 'x+' + c + '=0') + ' is horizontal.', why: 'Swapped: ' + t('y=k') + ' is horizontal (same height everywhere); ' + t('x=k') + ' is vertical.' }],
            t('y=' + v) + ': horizontal, ' + t('m=0') + ', ' + t('b=' + v) + ' — of the form ' + t('y=mx+b') + '. ' + t('x=' + v) + ': vertical, undefined slope, no ' + t('y') + '-intercept — not of the form ' + t('y=mx+b') + '.', ['Solve each one. Which letter is left?'], 'horizontal vs vertical');
        } }] },
      { num: '3', shared: ep3Shared, stem: function (T) { return 'Decide whether each table represents a linear relation. <b>Warning:</b> equal first differences in ' + t('y') + ' only settle it when the ' + t('x') + '-values step up by equal amounts.' + ['a', 'b', 'c', 'd', 'e'].map(function (k) { return tabHtml(k, T[k]); }).join(''); }, parts: [
        { id: 'e3', sub: 'a–e', level: 'PRG', outcome: 'RF4', make: function (r, T) {
          var want = { a: 'L', b: 'L', c: 'N', d: 'L', e: 'L' };
          var why = { a: 'Equal steps in ' + t('x') + ' give equal steps in ' + t('y') + ' — linear.', b: t('x') + ' steps by ' + t('2') + ' and ' + t('y') + ' changes by the same amount each time — linear.',
            c: 'The ' + t('x') + '-steps are equal (' + t('1') + ') but the ' + t('y') + '-steps (' + (T.c.ys[1] - T.c.ys[0]) + ', ' + (T.c.ys[2] - T.c.ys[1]) + ', ' + (T.c.ys[3] - T.c.ys[2]) + ') change — not linear.',
            d: t('y') + ' never changes: a constant rate of ' + t('0') + ' — a horizontal line, linear.', e: 'The ' + t('x') + '-steps are unequal, so compare ' + t('\\frac{\\Delta y}{\\Delta x}') + ': it is ' + t(T.e.m[0]) + ' every time — linear.' };
          return B.grid('Is each relation linear?', ['a', 'b', 'c', 'd', 'e'].map(function (k) { return { id: k, html: 'Table (' + k + ')' }; }), [{ id: 'L', html: 'Linear' }, { id: 'N', html: 'Not linear' }], want,
            { why: function (id, given) { return { code: given === 'L' ? 'lin-said-lin' : 'lin-said-non', hint: '(' + id + ') ' + why[id] }; } },
            ['a', 'b', 'c', 'd', 'e'].map(function (k) { return '(' + k + ') ' + (want[k] === 'L' ? '<b>linear</b> — ' : '<b>not linear</b> — ') + why[k]; }).join('<br>'),
            ['Find the change in ' + t('x') + ' and the change in ' + t('y') + ' between neighbouring columns. Linear means ' + t('\\frac{\\Delta y}{\\Delta x}') + ' is always the same.'], 'which tables are linear');
        } },
        { id: 'e3a', sub: 'a', level: 'BEG', outcome: 'RF7', make: function (r, T) {
          var o = T.a, m = o.m[0];
          var p = B.line('(a) Table (a) is linear. Write its equation.', { m: m, b: o.b }, {}, t('x') + ' steps by ' + t('1') + ', ' + t('y') + ' by ' + t(m) + ': ' + t('m=' + m) + '. At ' + t('x=0') + ', ' + t('y=' + o.b) + ', so ' + t('b=' + o.b) + '.<br>' + t(siT(m, o.b)),
            ['The slope is the change in ' + t('y') + ' for each step of ' + t('1') + ' in ' + t('x') + '.', t('b') + ' is the value of ' + t('y') + ' when ' + t('x=0') + '.'], 'equation from table, step 1');
          p.bad = o.b !== m ? [siT(o.b, m)] : [siT(m, -o.b)];
          return p;
        } },
        { id: 'e3b', sub: 'b', level: 'EMG', outcome: 'RF7', make: function (r, T) {
          var o = T.b, m = Q(o.m), dy = o.ys[1] - o.ys[0];
          var p = B.line('(b) Table (b) is linear. Write its equation.', { m: m, b: o.b }, { wrong: [{ is: { m: dy, b: o.b }, code: 'rate-not-div', hint: 'The ' + t('x') + '-values step by ' + t('2') + ', not ' + t('1') + ': slope ' + t('=\\frac{\\Delta y}{\\Delta x}=\\frac{' + dy + '}{2}') + '.' }] },
            t('x') + ' steps by ' + t('2') + ', ' + t('y') + ' by ' + t(dy) + ': ' + t('m=\\frac{' + dy + '}{2}=' + qT(m)) + '. At ' + t('x=0') + ', ' + t('y=' + o.b) + '.<br>' + t(siT(m, o.b)),
            ['Slope = change in ' + t('y') + ' ÷ change in ' + t('x') + '.', 'The table has an ' + t('x=0') + ' column: that gives ' + t('b') + '.'], 'equation from table, step 2');
          p.bad = [siT(dy, o.b)];
          return p;
        } },
        { id: 'e3d', sub: 'd', level: 'EMG', outcome: 'RF7', make: function (r, T) {
          var o = T.d;
          var p = B.line('(d) Table (d) is linear. Write its equation.', { m: 0, b: o.b }, {}, t('y') + ' is always ' + t(o.b) + ': ' + t('m=\\frac{0}{' + o.xs[1] + '}=0') + ', ' + t('b=' + o.b) + '.<br>' + t('y=' + o.b) + ' (a horizontal line)',
            ['If ' + t('y') + ' never changes, the rise is ' + t('0') + '.'], 'equation from constant table');
          p.bad = ['x=' + o.b]; p.good = ['y=0x+' + o.b];
          return p;
        } },
        { id: 'e3e', sub: 'e', level: 'PRG', outcome: 'RF7', make: function (r, T) {
          var o = T.e, m = o.m[0];
          var p = B.line('(e) Table (e) is linear even though its ' + t('y') + '-steps differ. Write its equation.', { m: m, b: o.b }, {},
            t('x') + '-steps ' + [1, 2, 3].map(function (i) { return o.xs[i] - o.xs[i - 1]; }).join(', ') + '; ' + t('y') + '-steps ' + [1, 2, 3].map(function (i) { return o.ys[i] - o.ys[i - 1]; }).join(', ') + '.<br>' + t('\\frac{\\Delta y}{\\Delta x}') + ' is ' + t(m) + ' every time, so ' + t('m=' + m) + '; at ' + t('x=0') + ', ' + t('y=' + o.b) + '.<br>' + t(siT(m, o.b)),
            ['Divide each change in ' + t('y') + ' by the matching change in ' + t('x') + '.'], 'equation from table, unequal steps');
          p.bad = [siT(o.ys[1] - o.ys[0] + 1, o.b)];
          return p;
        } },
        { id: 'e3f', sub: 'f', level: 'EMG', outcome: 'RF4', make: function (r, T) {
          var o = T.e, dx = [1, 2, 3].map(function (i) { return o.xs[i] - o.xs[i - 1]; }), dy = [1, 2, 3].map(function (i) { return o.ys[i] - o.ys[i - 1]; });
          return mc(r, '(f) The first differences in the ' + t('y') + '-row of table (e) are ' + t(dy.join(',\\ ')) + ' — not constant — yet the relation is linear. What has to be divided by what before “constant first difference” becomes a fair test?', [
            { html: 'Each change in ' + t('y') + ' divided by the matching change in ' + t('x') + ': the test is a constant ' + t('\\frac{\\Delta y}{\\Delta x}') + '.', right: true },
            { html: 'Each ' + t('y') + '-value divided by its ' + t('x') + '-value.', why: t('\\frac{y}{x}') + ' isn’t the slope (and fails at ' + t('x=0') + '). Use the <b>changes</b>: ' + t('\\frac{\\Delta y}{\\Delta x}') + '.' },
            { html: 'Each change in ' + t('x') + ' divided by the matching change in ' + t('y') + '.', why: 'That’s run over rise. The rate of change is ' + t('\\frac{\\Delta y}{\\Delta x}') + ' (it gives the same verdict, but it isn’t the slope).' },
            { html: 'The last ' + t('y') + '-value divided by the first.', why: 'Compare <b>neighbouring</b> columns: change in ' + t('y') + ' over change in ' + t('x') + '.' }],
            dy.map(function (d, i) { return t('\\frac{' + d + '}{' + dx[i] + '}=' + (d / dx[i])); }).join(', ') + ': constant. Equal first differences in ' + t('y') + ' are only a fair shortcut when every ' + t('\\Delta x') + ' is the same.', ['Slope = rise ÷ run, for each pair of neighbouring columns.'], 'why divide by delta x');
        } }] },
      { num: '4', shared: function (r) {
          var m = r.pick([1, 2, -1, -2, [1, 2], [-1, 2]]), b = r.pick([-2, -1, 1, 2]), c = r.pick([-3, -2, -4]), k = r.pick([4, 6, -4, -6]);
          return { m: Array.isArray(m) ? m : [m, 1], b: b, c: c, k: k, order: r.shuffle(['L', 'P', 'H']) };
        }, stem: function (sh) {
          var g = { L: lineFig([{ m: sh.m, b: sh.b }], { x: [-5, 5], y: [-5, 5], ends: 'none', max: 200 }), P: fnFig([{ f: function (x) { return x * x + sh.c; }, from: -2.9, to: 2.9 }]),
            H: fnFig([{ f: function (x) { return sh.k / x; }, from: 1.1, to: 5 }, { f: function (x) { return sh.k / x; }, from: -5, to: -1.1 }]) };
          return 'Decide whether each graph shows a linear relation.' + figs(sh.order.map(function (z, i) { return '<b>(' + 'abc'[i] + ')</b>' + g[z]; }), 150);
        }, parts: [
        { id: 'e4', sub: 'a–c', level: 'LIM', outcome: 'RF4', make: function (r, sh) {
          var want = {}, why = { L: 'one straight, unbroken line — linear.', P: 'it curves (a U-shape that turns at its lowest point) — not linear.', H: 'two separate curved branches — not linear.' };
          sh.order.forEach(function (z, i) { want['abc'[i]] = z === 'L' ? 'L' : 'N'; });
          return B.grid('Is each graph linear?', ['a', 'b', 'c'].map(function (k) { return { id: k, html: 'Graph (' + k + ')' }; }), [{ id: 'L', html: 'Linear' }, { id: 'N', html: 'Not linear' }], want,
            { why: function (id) { return { code: want[id] === 'L' ? 'lin-said-non' : 'lin-said-lin', hint: '(' + id + ') ' + why[sh.order['abc'.indexOf(id)]] }; } },
            sh.order.map(function (z, i) { return '(' + 'abc'[i] + ') ' + why[z]; }).join('<br>'), ['A linear graph is a single straight line — it never bends.'], 'which graph is linear');
        } },
        { id: 'e4b', sub: 'm, b', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
          var Lb = 'abc'[sh.order.indexOf('L')], m = sh.m, p2 = [m[1], sh.b + m[0]];
          return mbPart('For the linear graph, (' + Lb + '), state ' + t('m') + ' and ' + t('b') + '.', m, sh.b, {},
            'It crosses the ' + t('y') + '-axis at ' + t(ptT([0, sh.b])) + ', so ' + t('b=' + sh.b) + '. From ' + t(ptT([0, sh.b])) + ' to ' + t(ptT(p2)) + ': rise ' + t(p2[1] - sh.b) + ', run ' + t(p2[0]) + ', so ' + t('m=' + qT(m)) + '.',
            ['Read ' + t('b') + ' where the line crosses the ' + t('y') + '-axis.', 'Count rise over run between two grid points on the line.'], 'm and b from a graph');
        } }] },
      /* ================= EP Part B ================= */
      { num: '5', section: 'Extra practice B — Reading m and b when the equation is not solved for y', stem: 'Rearrange each equation into ' + t('y=mx+b') + ', then state the slope and the ' + t('y') + '-intercept. Leave fractions exact.', parts: (function () {
        function P5(id, lev, gen) {
          return { id: id, level: lev, make: function (r) {
            var g = gen(r);
            return mbPart('(' + id.slice(2) + ') ' + t(g.eq), g.m, g.b, { exact: true, mDiag: g.md, bDiag: g.bd }, g.sol + '<br>slope ' + t('m=' + qT(g.m)) + ', ' + t('y') + '-intercept ' + t('b=' + qT(g.b)) + '.', null, 'rearrange ' + g.eq);
          } };
        }
        return [
          P5('e5a', 'EMG', function (r) { var k = r.pick([4, 6, 8, 10]), m = r.pick(fracs([2, 4, 5].filter(function (q) { return k % q === 0; }), 9, false).filter(function (f) { return f[0] !== f[1]; })), b = r.int(1, 6) * r.pick([1, -1]);
            var A = k * m[0] / m[1], C = k * b, eq = k + 'y=' + term(A, 'x', true) + (C < 0 ? '-' : '+') + Math.abs(C);
            return { eq: eq, m: m, b: Q(b), md: [[A, 'not-divided', 'Divide <b>every</b> term by ' + t(k) + ' first.']], bd: [[C, 'not-divided', 'Divide the constant by ' + t(k) + ' too.']], sol: 'Divide every term by ' + t(k) + ': ' + t('y=\\frac{' + A + '}{' + k + '}x' + (C < 0 ? '-' : '+') + '\\frac{' + Math.abs(C) + '}{' + k + '}') + ', so ' + t(siT(m, b)) + '.' }; }),
          P5('e5b', 'EMG', function (r) { var Bc = r.pick([3, 4, 5, 6]), A = r.pick([1, 2, 3, 4, 5].filter(function (a) { return coprime(a, Bc); })), b = r.int(1, 5), C = Bc * b, eq = term(A, 'x', true) + '+' + Bc + 'y=' + C, m = Q(-A, Bc);
            return { eq: eq, m: m, b: Q(b), md: [[-A, 'not-divided', 'After moving the ' + t('x') + '-term, divide every term by ' + t(Bc) + '.'], [Q(-Bc, A), 'xint-flip', 'Divide by the coefficient of ' + t('y') + ', ' + t(Bc) + '.']], bd: [[C, 'not-divided', 'Divide the constant by ' + t(Bc) + ' too.']], sol: t(Bc + 'y=' + term(-A, 'x', true) + '+' + C) + '. Divide by ' + t(Bc) + ': ' + t(siT(m, b)) + '.' }; }),
          P5('e5c', 'PRG', function (r) { var Bc = r.pick([2, 3, 4, 5, 6]), A = r.pick([1, 2, 3, 4, 5, 7].filter(function (a) { return coprime(a, Bc) && a !== Bc; })), b = r.int(1, 4), C = Bc * b, eq = term(A, 'x', true) + '-' + Bc + 'y-' + C + '=0', m = Q(A, Bc);
            return { eq: eq, m: m, b: Q(-b), md: [], bd: [[Q(C, 1), 'not-divided', 'Divide the constant by ' + t('-' + Bc) + ' as well.']], sol: t('-' + Bc + 'y=' + term(-A, 'x', true) + '+' + C) + '. Divide every term by ' + t('-' + Bc) + ' (every sign flips): ' + t(siT(m, -b)) + '.' }; }),
          P5('e5d', 'EMG', function (r) { var k = r.int(2, 5), c = r.int(1, 7), eq = '\\dfrac{y}{' + k + '}=x-' + c;
            return { eq: eq, m: Q(k), b: Q(-k * c), md: [[Q(1, k), 'part-div', 'Multiply both sides by ' + t(k) + ' (don’t divide).'], [1, 'no-mult', 'Multiply <b>both</b> terms on the right by ' + t(k) + '.']], bd: [[-c, 'no-mult', 'Multiply <b>both</b> terms by ' + t(k) + ': ' + t(k + '(x-' + c + ')=' + k + 'x-' + (k * c)) + '.']], sol: 'Multiply both sides by ' + t(k) + ': ' + t('y=' + k + '(x-' + c + ')=' + k + 'x-' + (k * c)) + '.' }; }),
          P5('e5e', 'PRG', function (r) { var m = r.pick([[2, 3], [3, 4], [1, 2], [3, 2], [2, 5]]), v = m[1] * r.int(1, 3), u = r.int(1, 6), b = qadd(qmul(m, v), u), eq = 'y-' + u + '=' + qT(m) + '(x+' + v + ')';
            return { eq: eq, m: Q(m), b: b, md: [], bd: [[qadd(qmul(m, v), -u), 'move-sign', 'Move ' + t('-' + u) + ' across: add ' + t(u) + ' to both sides.'], [Q(v + u), 'no-dist', 'Expand: multiply ' + t(v) + ' by ' + t(qT(m)) + ' too.'], [qmul(m, v), 'move-sign', 'Don’t forget to add ' + t(u) + ' to both sides.']],
              sol: 'Expand: ' + t('y-' + u + '=' + qT(m) + 'x+' + qT(qmul(m, v))) + '. Add ' + t(u) + ': ' + t(siT(m, b)) + '.' }; }),
          P5('e5f', 'PRG', function (r) { var a = r.int(2, 6), c = r.pick([2, 3, 4, 5, 6].filter(function (z) { return z !== a; })), l = a * c / gcd(a, c), m = Q(c, a), eq = '\\dfrac{x}{' + a + '}-\\dfrac{y}{' + c + '}=1';
            return { eq: eq, m: m, b: Q(-c), md: [], bd: [[Q(-l), 'part-div', 'Careful with the constant: multiplying by ' + t(l) + ' turns the ' + t('1') + ' into ' + t(l) + ', then divide by the coefficient of ' + t('y') + '.']],
              sol: 'Multiply by ' + t(l) + ': ' + t(lin([[l / a, 'x'], [-l / c, 'y']]) + '=' + l) + '. Then ' + t(lin([[-l / c, 'y']]) + '=' + lin([[-l / a, 'x'], [l, '']])) + ', so ' + t(siT(m, -c)) + '.' }; }),
          P5('e5g', 'PRG', function (r) { var k = r.pick([3, 4, 5]), n = r.pick([1, 2, 3, 4].filter(function (z) { return coprime(z, k); })), u, v; do { u = r.int(1, 4); v = r.int(1, 4); } while ((n * v) % k === 0);
            var m = Q(n, k), b = Q(-n * v - k * u, k), eq = k + '(y+' + u + ')=' + (n === 1 ? '' : n) + '(x-' + v + ')';
            return { eq: eq, m: m, b: b, md: [], bd: [[Q(-n * v - k * u), 'not-divided', 'Divide every term by ' + t(k) + ', the constant too.'], [Q(-n * v + k * u, k), 'move-sign', 'Move ' + t('+' + (k * u)) + ' across by subtracting it.'], [Q(-n * v - u, k), 'no-dist', 'Expand ' + t(k + '(y+' + u + ')') + ': ' + t(k + 'y+' + (k * u)) + '.']],
              sol: 'Expand: ' + t(k + 'y+' + (k * u) + '=' + (n === 1 ? '' : n) + 'x-' + (n * v)) + '. Then ' + t(k + 'y=' + (n === 1 ? '' : n) + 'x-' + (n * v + k * u)) + ', so ' + t(siT(m, b)) + '.' }; }),
          P5('e5h', 'EMG', function (r) { var k = r.int(2, 5), a = r.int(1, 4), c = r.int(1, 5), A = k * a, C = k * c, eq = '-' + k + 'y=' + A + 'x-' + C;
            return { eq: eq, m: Q(-a), b: Q(c), md: [[A, 'not-divided', 'Divide every term by ' + t('-' + k) + '.'], [-A, 'not-divided', 'Divide every term by ' + t('-' + k) + '.']], bd: [[-C, 'not-divided', 'Divide the constant by ' + t('-' + k) + ' too.']], sol: 'Divide every term by ' + t('-' + k) + ': ' + t('y=\\frac{' + A + '}{-' + k + '}x+\\frac{-' + C + '}{-' + k + '}') + ', so ' + t(siT(-a, c)) + '.' }; })];
      })() },
      { num: '6', shared: function (r) { var a = r.int(2, 6), c; do { c = r.int(2, 9); } while (c === a); return { a: a, c: c }; },
        stem: function (sh) { return 'Asked for the slope and ' + t('y') + '-intercept of ' + t('y=' + sh.c + '-' + sh.a + 'x') + ', a student writes ' + t('m=' + sh.c + ',\\ b=-' + sh.a) + '.'; }, parts: [
        { id: 'e6a', level: 'EMG', make: function (r, sh) {
          return mc(r, '(a) What did the student match to what, and why is it wrong?', [
            { html: 'They matched ' + t('m') + ' to the first number (' + t(sh.c) + ') and ' + t('b') + ' to the second (' + t('-' + sh.a) + '), reading left to right. But ' + t('m') + ' is the number that multiplies ' + t('x') + ' (' + t('-' + sh.a) + ') and ' + t('b') + ' is the term with no ' + t('x') + ' (' + t(sh.c) + ').', right: true },
            { html: 'They lost the negative sign of the slope.', why: 'The sign isn’t the main problem — the two numbers are in the wrong places altogether.' },
            { html: 'Nothing: the order of the terms doesn’t matter, so ' + t('m=' + sh.c) + ' is right.', why: 'The order of terms doesn’t matter — which is exactly why ' + t('m') + ' must be read from the ' + t('x') + '-term, wherever it is.' },
            { html: 'They should have divided both numbers by ' + t(sh.a) + ' first.', why: 'The equation is already solved for ' + t('y') + '; it only needs reordering.' }],
            'Reorder: ' + t('y=-' + sh.a + 'x+' + sh.c) + '. The coefficient of ' + t('x') + ' is ' + t('m=-' + sh.a) + '; the constant is ' + t('b=' + sh.c) + '. The student read the numbers left to right instead.', ['Which number multiplies ' + t('x') + '?'], 'student read m and b in order');
        } },
        { id: 'e6b', level: 'BEG', make: function (r, sh) {
          return mbPart('(b) Rewrite ' + t('y=' + sh.c + '-' + sh.a + 'x') + ' in the order ' + t('mx+b') + ' and state the correct ' + t('m') + ' and ' + t('b') + '.', [-sh.a, 1], sh.c,
            { mDiag: [[sh.c, 'mb-order', 'That’s the student’s mistake: ' + t(sh.c) + ' doesn’t multiply ' + t('x') + '.']], bDiag: [[-sh.a, 'mb-order', 'That’s the student’s mistake: ' + t('-' + sh.a) + ' multiplies ' + t('x') + ', so it is the slope.']] },
            t('y=-' + sh.a + 'x+' + sh.c) + ': ' + t('m=-' + sh.a) + ', ' + t('b=' + sh.c) + '.', null, 'correct m and b');
        } },
        { id: 'e6c', level: 'PRG', make: function (r, sh) {
          var P0 = [1, sh.c - sh.a];
          var p = B.pairs('(c) The student’s line ' + t('y=' + sh.c + 'x-' + sh.a) + ' and the correct line ' + t('y=-' + sh.a + 'x+' + sh.c) + ' share exactly one point. Find it.', [P0], {},
            t(sh.c + 'x-' + sh.a + '=-' + sh.a + 'x+' + sh.c) + '<br>' + t((sh.c + sh.a) + 'x=' + (sh.c + sh.a)) + ', so ' + t('x=1') + ' and ' + t('y=' + sh.c + '-' + sh.a + '=' + P0[1]) + '.<br>Common point ' + t(ptT(P0)) + '. At ' + t('x=2') + ' the lines give ' + t(2 * sh.c - sh.a) + ' and ' + t(sh.c - 2 * sh.a) + ' — checking a second point exposes the error.',
            ['Set the two right-hand sides equal and solve for ' + t('x') + '.', 'Then substitute to get ' + t('y') + '.'], 'common point of student and correct line');
          p.bad = P0[1] !== 1 ? ['(' + P0[1] + ', 1)'] : ['(1, ' + (P0[1] + 1) + ')'];
          return p;
        } }] },
      { num: '7', stem: 'Every equation in general form, ' + t('Ax+By+C=0') + ', can be converted to slope–intercept form — almost.', parts: [
        { id: 'e7a', level: 'PRG', make: function (r) {
          return mc(r, '(a) Solve ' + t('Ax+By+C=0') + ' for ' + t('y') + '. What are ' + t('m') + ' and ' + t('b') + ' in terms of ' + t('A') + ', ' + t('B') + ' and ' + t('C') + '?', [
            { html: t('m=-\\frac{A}{B},\\ b=-\\frac{C}{B}') + ' (only when ' + t('B\\ne 0') + ')', right: true },
            { html: t('m=\\frac{A}{B},\\ b=\\frac{C}{B}'), why: 'Moving ' + t('Ax') + ' and ' + t('C') + ' to the other side changes their signs: ' + t('By=-Ax-C') + '.' },
            { html: t('m=-\\frac{B}{A},\\ b=-\\frac{C}{A}'), why: 'You divide by the coefficient of ' + t('y') + ', which is ' + t('B') + '.' },
            { html: t('m=-A,\\ b=-C'), why: 'After ' + t('By=-Ax-C') + ', divide every term by ' + t('B') + '.' }],
            t('By=-Ax-C') + ', so ' + t('y=-\\frac{A}{B}x-\\frac{C}{B}') + ': ' + t('m=-\\frac{A}{B}') + ', ' + t('b=-\\frac{C}{B}') + ' — only when ' + t('B\\ne 0') + '.', ['Move ' + t('Ax') + ' and ' + t('C') + ' across, then divide by ' + t('B') + '.'], 'm and b from general form');
        } },
        { id: 'e7b', level: 'EMG', make: function (r) {
          var Bc = r.pick([2, 3, 4, 5]), A = r.pick([1, 3, 5, 7].filter(function (a) { return coprime(a, Bc); })), b = r.int(1, 4), C = Bc * b, eq = term(A, 'x', true) + '-' + Bc + 'y+' + C + '=0', m = Q(A, Bc);
          return mbPart('(b) Use your formulas on ' + t(eq) + '.', m, b, { exact: true, mDiag: [[Q(-A, Bc), 'sign', t('B=-' + Bc) + ': ' + t('m=-\\frac{' + A + '}{-' + Bc + '}=' + qT(m)) + '.']], bDiag: [[-b, 'sign', t('b=-\\frac{C}{B}=-\\frac{' + C + '}{-' + Bc + '}=' + b) + '.']] },
            t('A=' + A + ',\\ B=-' + Bc + ',\\ C=' + C) + ': ' + t('m=-\\frac{' + A + '}{-' + Bc + '}=' + qT(m)) + ', ' + t('b=-\\frac{' + C + '}{-' + Bc + '}=' + b) + '.<br>Check: ' + t('-' + Bc + 'y=' + term(-A, 'x', true) + '-' + C) + ' gives ' + t(siT(m, b)) + ' ✓',
            ['Read ' + t('A') + ', ' + t('B') + ', ' + t('C') + ' with their signs: ' + t('B') + ' is negative here.'], 'm, b from general form');
        } },
        { id: 'e7c', level: 'EMG', make: function (r) {
          var a = r.int(2, 5), k = r.pick([-5, -4, -3, -2, 2, 3, 4, 5]), eq = a + 'x' + (a * -k < 0 ? '-' : '+') + Math.abs(a * k) + '=0';
          return mc(r, '(c) What goes wrong when ' + t('B=0') + '? Describe the graph of ' + t(eq) + '.', [
            { html: 'It is the vertical line ' + t('x=' + k) + ': every run is ' + t('0') + ', so the slope is undefined (the formulas divide by ' + t('B=0') + '), and it never crosses the ' + t('y') + '-axis, so there is no ' + t('b') + '.', right: true },
            { html: 'It is the horizontal line ' + t('y=' + k) + ' with slope ' + t('0') + '.', why: 'There is no ' + t('y') + ' in the equation, so it fixes ' + t('x') + ': ' + t('x=' + k) + ' is vertical.' },
            { html: 'It is the vertical line ' + t('x=' + (-k)) + '.', why: 'Check the sign: ' + t(eq) + ' gives ' + t(a + 'x=' + (a * k)) + ', ' + t('x=' + k) + '.' },
            { html: 'It is a line through the origin with slope ' + t(k) + '.', why: 'With no ' + t('y') + ', every point has the same ' + t('x') + '-value: a vertical line.' }],
            t(eq) + ' gives ' + t('x=' + k) + ': a vertical line through ' + t(ptT([k, 0])) + '. Its slope is undefined (run ' + t('0') + ') and it has no ' + t('y') + '-intercept, so ' + t('m=-\\frac{A}{B}') + ' and ' + t('b=-\\frac{C}{B}') + ' divide by zero.', ['Solve the equation for ' + t('x') + '.'], 'B = 0: vertical line');
        } }] },
      /* ================= EP Part C ================= */
      { num: '8', section: 'Extra practice C — Graphing from y = mx + b', shared: ep8Shared, stem: 'For each equation, state the slope and ' + t('y') + '-intercept, then graph the line. One of the four can’t be put in the form ' + t('y=mx+b') + ' — graph it anyway. (Use <b>undefined</b> and <b>none</b> where they apply.)', parts: [
        { id: 'e8a', sub: 'a i', level: 'BEG', make: function (r, sh) { var m = Q(-sh.a.pq[0], sh.a.pq[1]), eq = siT(m, sh.a.b); return mbPart(t(eq), m, sh.a.b, { keys: 'slope', none: true }, t('m=' + qT(m)) + ', ' + t('b=' + sh.a.b) + '.', null, 'm, b of ' + eq); } },
        { id: 'e8a2', sub: 'a ii', level: 'BEG', make: function (r, sh) {
          var m = Q(-sh.a.pq[0], sh.a.pq[1]), b = sh.a.b, eq = siT(m, b), key = keyLine(m, b);
          return drawPart('Graph ' + t(eq) + '.', padI(), key, slopeWrongs(m, b), { m: qv(m), b: b, mq: m }, 'Plot ' + t(ptT([0, b])) + '. Down ' + t(-m[0]) + ', right ' + t(m[1]) + ': ' + t(ptT([m[1], b + m[0]])) + '. Join the points.', ['Start at the ' + t('y') + '-intercept; a negative slope steps down and to the right.'], 'graph ' + eq, [segOf(key)]);
        } },
        { id: 'e8b', sub: 'b i', level: 'BEG', make: function (r, sh) { var m = Q(sh.b.pq), eq = siT(m, -sh.b.c); return mbPart(t(eq), m, -sh.b.c, { keys: 'slope', none: true }, t('m=' + qT(m)) + ', ' + t('b=-' + sh.b.c) + '.', null, 'm, b of ' + eq); } },
        { id: 'e8b2', sub: 'b ii', level: 'EMG', make: function (r, sh) {
          var m = Q(sh.b.pq), b = -sh.b.c, eq = siT(m, b), key = keyLine(m, b);
          return drawPart('Graph ' + t(eq) + '.', padI(), key, slopeWrongs(m, b), { m: qv(m), b: b, mq: m }, 'Plot ' + t(ptT([0, b])) + '. Up ' + t(m[0]) + ', right ' + t(m[1]) + ': ' + t(ptT([m[1], b + m[0]])) + '. Join the points.', ['A slope greater than 1: the rise is bigger than the run.'], 'graph ' + eq, [segOf(key)]);
        } },
        { id: 'e8c', sub: 'c i', level: 'EMG', make: function (r, sh) {
          var k = sh.c.k, c = sh.c.c, eq = k + 'y' + (k * -c < 0 ? '-' : '+') + Math.abs(k * c) + '=0';
          return mbPart(t(eq), [0, 1], c, { keys: 'slope', none: true, mDiag: [[c, 'h-slope', t('y=' + c) + ' has no ' + t('x') + '-term: ' + t('y=0x' + (c < 0 ? '' : '+') + c) + ', so the slope is ' + t('0') + '.']] },
            t(k + 'y=' + (k * c)) + ', so ' + t('y=' + c) + ', i.e. ' + t('y=0x' + (c < 0 ? '' : '+') + c) + ': ' + t('m=0') + ', ' + t('b=' + c) + '. A horizontal line.', ['Solve for ' + t('y') + '. Is there an ' + t('x') + '-term?'], 'm, b of ky + c = 0');
        } },
        { id: 'e8c2', sub: 'c ii', level: 'BEG', make: function (r, sh) {
          var c = sh.c.c, key = lineV([-5, c], [5, c]);
          var W = [{ is: lineV([c, -5], [c, 5]), code: 'gr-vh', hint: 'That’s vertical. ' + t('y=' + c) + ' is the <b>horizontal</b> line where every point has height ' + t(c) + '.' }, { is: lineV([-5, -c], [5, -c]), code: 'gr-b-sign', hint: 'Check the height: solve for ' + t('y') + ' again.' }];
          return drawPart('Graph the line from (c i).', padI(), key, W, {}, 'The horizontal line ' + t('y=' + c) + ' through ' + t(ptT([0, c])) + '.', ['Every point has the same ' + t('y') + '-value.'], 'graph horizontal line', [segOf(key)]);
        } },
        { id: 'e8d', sub: 'd i', level: 'EMG', make: function (r, sh) {
          var k = sh.d.k, d = sh.d.d, eq = k + 'x' + (-k * d < 0 ? '-' : '+') + Math.abs(k * d) + '=0';
          return mbPart(t(eq), null, null, { keys: 'slope', none: true, hasHint: t('x=' + d) + ' is a vertical line: it never crosses the ' + t('y') + '-axis. Press <b>none</b>.' },
            t(k + 'x=' + (k * d)) + ', so ' + t('x=' + d) + ': a <b>vertical</b> line through ' + t(ptT([d, 0])) + '. It can’t be solved for ' + t('y') + '. Every run is ' + t('0') + ', so the slope is <b>undefined</b>; it never meets the ' + t('y') + '-axis, so there is <b>no</b> ' + t('b') + '.', ['There is no ' + t('y') + ' in this equation. What kind of line is ' + t('x=k') + '?'], 'vertical line: m undefined, no b');
        } },
        { id: 'e8d2', sub: 'd ii', level: 'BEG', make: function (r, sh) {
          var d = sh.d.d, key = lineV([d, -5], [d, 5]);
          var W = [{ is: lineV([-5, d], [5, d]), code: 'gr-vh', hint: 'That’s horizontal. ' + t('x=' + d) + ' is the <b>vertical</b> line where every point has ' + t('x') + '-value ' + t(d) + '.' }, { is: lineV([-d, -5], [-d, 5]), code: 'gr-xint', hint: 'Check the sign: solve for ' + t('x') + ' again.' }];
          return drawPart('Graph the line from (d i).', padI(), key, W, {}, 'The vertical line ' + t('x=' + d) + ' through ' + t(ptT([d, 0])) + '.', ['Every point has the same ' + t('x') + '-value.'], 'graph vertical line', [segOf(key)]);
        } },
        { id: 'e8e', sub: 'e', level: 'EMG', make: function (r, sh) {
          var c = sh.c.c, d = sh.d.d;
          return mc(r, '(e) Parts (c) and (d) look alike on the page. Why does one have a slope of ' + t('0') + ' while the other has no slope value at all?', [
            { html: 'On ' + t('y=' + c) + ' the rise is always ' + t('0') + ': ' + t('0\\div\\text{run}=0') + '. On ' + t('x=' + d) + ' the run is always ' + t('0') + ', and ' + t('\\text{rise}\\div 0') + ' has no value.', right: true },
            { html: 'On ' + t('y=' + c) + ' the run is ' + t('0') + '; on ' + t('x=' + d) + ' the rise is ' + t('0') + '.', why: 'Swapped: a horizontal line has no rise; a vertical line has no run.' },
            { html: 'Both have slope ' + t('0') + ' because neither has both ' + t('x') + ' and ' + t('y') + '.', why: 'Only the horizontal one has slope ' + t('0') + '. Dividing by a run of ' + t('0') + ' is impossible, so the vertical one’s slope is undefined.' },
            { html: 'The vertical line’s slope is infinitely large, so it is written as ' + t('0') + '.', why: 'The slope of a vertical line is <b>undefined</b> — not ' + t('0') + ' and not a number at all.' }],
            'Zero on top is fine: ' + t('\\frac{0}{\\text{run}}=0') + '. Zero on the bottom is not: ' + t('\\frac{\\text{rise}}{0}') + ' is undefined.', ['Which line has rise ' + t('0') + ', and which has run ' + t('0') + '?'], 'slope 0 vs undefined');
        } }] },
      { num: '9', shared: function (r) { var pq = r.pick([[2, 3], [1, 2], [3, 4], [1, 3], [3, 2], [2, 5]]); return { p: pq[0], q: pq[1], b: r.pick([-2, -1, 1, 2, 3]) }; },
        stem: function (sh) { return 'To graph a line of slope ' + t('-\\frac{' + sh.p + '}{' + sh.q + '}') + ' through ' + t(ptT([0, sh.b])) + ', a student starts at ' + t(ptT([0, sh.b])) + ' and counts <b>down ' + sh.q + ' and right ' + sh.p + '</b>, landing on ' + t(ptT([sh.p, sh.b - sh.q])) + ', then joins the two points.'; }, parts: [
        { id: 'e9a', level: 'EMG', make: function (r, sh) {
          var p = sh.p, q = sh.q, b = sh.b;
          return mc(r, '(a) What is the correct count from ' + t(ptT([0, b])) + '?', [
            { html: 'The numerator is the rise and the denominator the run: down ' + t(p) + ', right ' + t(q) + ', to ' + t(ptT([q, b - p])) + '.', right: true },
            { html: 'Down ' + t(q) + ', right ' + t(p) + ', to ' + t(ptT([p, b - q])) + ' — the student is right.', why: 'That is the student’s count: rise and run swapped. The top number of ' + t('\\frac{\\text{rise}}{\\text{run}}') + ' is the rise.' },
            { html: 'Up ' + t(p) + ', right ' + t(q) + ', to ' + t(ptT([q, b + p])) + '.', why: 'The slope is negative, so going right means going <b>down</b>.' },
            { html: 'Down ' + t(p) + ', left ' + t(q) + ', to ' + t(ptT([-q, b - p])) + '.', why: 'Down and left is a positive slope. Go down and right (or up and left).' }],
            'In ' + t('m=\\frac{\\text{rise}}{\\text{run}}=\\frac{-' + p + '}{' + q + '}') + ': down ' + t(p) + ', right ' + t(q) + ' to ' + t(ptT([q, b - p])) + ' (or up ' + t(p) + ', left ' + t(q) + ' to ' + t(ptT([-q, b + p])) + '). The student swapped them.', ['Slope = rise over run: which number is on top?'], 'correct rise/run count');
        } },
        { id: 'e9b', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
          var p = sh.p, q = sh.q, b = sh.b, ms = Q(-q, p);
          var pt = B.line('(b) Write the equation of the line the student <b>actually</b> drew.', { m: ms, b: b }, { wrong: [{ is: { m: Q(-p, q), b: b }, code: 'student-line', hint: 'That’s the line the student <i>meant</i> to draw. Find the slope of the line through ' + t(ptT([0, b])) + ' and ' + t(ptT([p, b - q])) + '.' }] },
            'From ' + t(ptT([0, b])) + ' to ' + t(ptT([p, b - q])) + ': rise ' + t(-q) + ', run ' + t(p) + ', so ' + t('m=' + qT(ms)) + '; ' + t('b=' + b) + '.<br>' + t(siT(ms, b)), ['Rise and run of the student’s step give its slope.', 'It still starts at ' + t(ptT([0, b])) + '.'], 'equation of the student’s line');
          pt.bad = [siT(Q(-p, q), b)];
          return pt;
        } },
        { id: 'e9c', level: 'EMG', make: function (r, sh) {
          var p = sh.p, q = sh.q, b = sh.b, mc0 = -p / q, ms = -q / p, key = [q, b - p];
          var chk = function (resp) {
            var s = cleanS(resp); if (!s) return form('empty', 'Type a point, e.g. ' + t('(3,\\ -1)') + '.');
            var P0 = asPoint(s); if (!P0) return form('pt-read', 'Write one point as ' + t('(x,\\ y)') + ', with brackets and a comma.');
            var onC = near(P0[1], mc0 * P0[0] + b), onS = near(P0[1], ms * P0[0] + b);
            if (onC && onS) return wrong('pt-shared', t(ptT([0, b])) + ' is on <b>both</b> lines — that’s why a glance doesn’t catch the error. Find another point on the correct line.');
            if (onC) return ok();
            if (onS) return wrong('pt-student', 'That point is on the student’s line. Use the correct count: down ' + t(p) + ', right ' + t(q) + '.');
            return wrong('pt-off', 'That point isn’t on the correct line ' + t(siT(Q(-p, q), b)) + '. Substitute your ' + t('x') + ' to check.');
          };
          var pt = B.math('(c) Both lines fall and both cross the ' + t('y') + '-axis at ' + t(ptT([0, b])) + '. Name one point that is on the correct line but not on the student’s.', chk, ptT(key),
            'The correct line ' + t(siT(Q(-p, q), b)) + ' passes through ' + t(ptT(key)) + '. On the student’s line at ' + t('x=' + q) + ': ' + t('y=' + qT(qadd(qmul(Q(-q, p), q), b))) + ' ' + t('\\ne ' + (b - p)) + '. (Any point of the correct line other than ' + t(ptT([0, b])) + ' works.)',
            ['Step out from ' + t(ptT([0, b])) + ' with the correct slope.'], 'point on correct line only', { keys: 'pairs', placeholder: 'e.g. (3, -1)' });
          pt.good = [ptT([-q, b + p]), ptT([2 * q, b - 2 * p])]; pt.bad = [ptT([0, b]), ptT([p, b - q])];
          return pt;
        } }] },
      /* ================= EP Part D ================= */
      { num: '10', section: 'Extra practice D — Backwards: from the graph to the equation', shared: ep10Shared, stem: 'Each line is drawn on a grid. Read its slope and ' + t('y') + '-intercept from the picture and write its equation.', parts: [
        { id: 'e10a', level: 'BEG', outcome: 'RF7', make: function (r, sh) {
          var o = sh.a, P2 = [o.k, o.b + o.m * o.k];
          var fig = lineFig([{ m: o.m, b: o.b }], { points: [{ x: 0, y: o.b }, { x: P2[0], y: P2[1] }] });
          var p = B.line('(a)' + fig, { m: o.m, b: o.b }, {}, 'It crosses the ' + t('y') + '-axis at the marked point ' + t(ptT([0, o.b])) + ': ' + t('b=' + o.b) + '. ' + t(ptT([0, o.b])) + ' to ' + t(ptT(P2)) + ': rise ' + t(o.m * o.k) + ', run ' + t(o.k) + ', ' + t('m=' + o.m) + '.<br>' + t(siT(o.m, o.b)),
            ['Read ' + t('b') + ' where the line crosses the ' + t('y') + '-axis.', 'Count rise ÷ run between the two marked points.'], 'equation from graph, integer slope');
          p.bad = o.b !== o.m ? [siT(o.b, o.m)] : [siT(o.m, -o.b)];
          return p;
        } },
        { id: 'e10b', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
          var o = sh.b, m = Q(o.m), q = m[1], A = [-q, o.b - m[0]], C = [q, o.b + m[0]];
          var fig = lineFig([{ m: m, b: o.b }], { points: [{ x: A[0], y: A[1], label: '(' + A[0] + ', ' + A[1] + ')' }, { x: C[0], y: C[1], label: '(' + C[0] + ', ' + C[1] + ')' }] });
          var p = B.line('(b) This line doesn’t pass through a grid point at every step — use the two marked points.' + fig, { m: m, b: o.b }, {},
            t(ptT(A)) + ' to ' + t(ptT(C)) + ': rise ' + t(2 * m[0]) + ', run ' + t(2 * q) + ', ' + t('m=\\frac{' + (2 * m[0]) + '}{' + (2 * q) + '}=' + qT(m)) + '. From ' + t(ptT(C)) + ': left ' + t(q) + ', ' + (m[0] > 0 ? 'down ' : 'up ') + t(Math.abs(m[0])) + ' gives ' + t(ptT([0, o.b])) + ', so ' + t('b=' + o.b) + '.<br>' + t(siT(m, o.b)),
            ['Slope from the two marked points: ' + t('\\frac{\\Delta y}{\\Delta x}') + '. Reduce the fraction.', 'Then step from a marked point to the ' + t('y') + '-axis.'], 'equation from graph, fraction slope');
          p.bad = [siT(qinv(m), o.b)];
          return p;
        } },
        { id: 'e10c', level: 'BEG', outcome: 'RF7', make: function (r, sh) {
          var k = sh.c.k;
          var p = B.line('(c)' + lineFig([{ m: 0, b: k }]), { m: 0, b: k }, {}, 'Horizontal through ' + t(ptT([0, k])) + ': the rise is always ' + t('0') + '. ' + t('m=0') + ', ' + t('b=' + k) + ': ' + t('y=' + k) + '.', ['Every point has the same ' + t('y') + '-value.'], 'equation of horizontal line');
          p.bad = ['x=' + k]; return p;
        } },
        { id: 'e10d', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
          var k = sh.d.k;
          var p = B.line('(d)' + lineFig([{ x: k }]), { x: k }, {}, 'Vertical through ' + t(ptT([k, 0])) + ': every run is ' + t('0') + ', so the slope is undefined and it never crosses the ' + t('y') + '-axis. ' + t('x=' + k) + '.', ['Every point has the same ' + t('x') + '-value.'], 'equation of vertical line');
          p.bad = ['y=' + k]; return p;
        } },
        { id: 'e10e', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
          var c = sh.c.k, d = sh.d.k;
          return mc(r, '(e) Only one of the four graphs has no ' + t('y') + '-intercept to read. Which one, and what is its equation?', [
            { html: 'Graph (d): ' + t('x=' + d), right: true },
            { html: 'Graph (c): ' + t('y=' + c), why: 'A horizontal line crosses the ' + t('y') + '-axis at ' + t(ptT([0, c])) + ' — it has a ' + t('y') + '-intercept.' },
            { html: 'Graph (d): ' + t('y=' + d), why: 'Right graph, but a vertical line has the form ' + t('x=k') + '.' },
            { html: 'Graph (b): it misses the grid points', why: 'Missing grid points doesn’t matter — it still crosses the ' + t('y') + '-axis.' }],
            'Graph (d) is vertical — parallel to the ' + t('y') + '-axis — so it never crosses it. Its equation is ' + t('x=' + d) + ', not of the form ' + t('y=mx+b') + '.', ['Which line is parallel to the ' + t('y') + '-axis?'], 'which graph has no y-intercept');
        } }] },
      { num: '11', shared: ep11Shared, stem: function (sh) {
          var m = Q(sh.pq), k = sh.k, eqT = function (L) { var e = sh.eqs[L]; return siT([e.s * m[0], m[1]], e.bs * k); };
          var g = sh.order.map(function (L, i) { var e = sh.eqs[L]; return '<b>' + ROMAN[i] + '.</b>' + lineFig([{ m: [e.s * m[0], m[1]], b: e.bs * k }], { max: 190, labels: 2 }); });
          return 'The four equations below differ only in the <b>sign</b> of ' + t('m') + ' or the <b>value</b> of ' + t('b') + ':<br>' + ['A', 'B', 'C', 'D'].map(function (L) { return '<b>' + L + '.</b> ' + t(eqT(L)); }).join(' &nbsp; ') + figs(g, 150);
        }, parts: [
        { id: 'e11', sub: 'I–IV', level: 'EMG', make: function (r, sh) {
          var m = Q(sh.pq), k = sh.k, want = {}, desc = function (L) { var e = sh.eqs[L]; return (e.s > 0 ? 'rises, so ' + t('m>0') : 'falls, so ' + t('m<0')) + '; crosses the ' + t('y') + '-axis at ' + t(ptT([0, e.bs * k])); };
          sh.order.forEach(function (L, i) { want[ROMAN[i]] = L; });
          return B.grid('Match each graph to its equation.', ROMAN.map(function (R) { return { id: R, html: 'Graph ' + R }; }), ['A', 'B', 'C', 'D'].map(function (L) { return { id: L, html: L }; }), want,
            { why: function (id) { return { code: 'row', hint: 'Graph ' + id + ' ' + desc(want[id]) + '.' }; } },
            ROMAN.map(function (R) { return 'Graph ' + R + ' ' + desc(want[R]) + ': <b>' + want[R] + '</b>.'; }).join('<br>'), ['First decide rising (' + t('m>0') + ') or falling (' + t('m<0') + '), then read where the line crosses the ' + t('y') + '-axis.'], 'match 4 graphs to equations');
        } },
        { id: 'e11e', sub: 'e', level: 'BEG', outcome: 'RF5', make: function (r, sh) {
          var m = Q(sh.pq), i = sh.order.indexOf('B'), R = ROMAN[i];
          return mc(r, '(e) Two students both answer “' + t('m=' + qT(m)) + '” for graph ' + R + '. Which feature of the picture settles the sign of ' + t('m') + ' before any counting is done?', [
            { html: 'The direction: graph ' + R + ' falls from left to right, so its slope is negative.', right: true },
            { html: 'Where it crosses the ' + t('y') + '-axis.', why: 'That gives ' + t('b') + ', not the sign of ' + t('m') + '.' },
            { html: 'How steep it is.', why: 'Steepness gives the size of ' + t('m') + ', not its sign.' },
            { html: 'Whether it passes through the origin.', why: 'That tells you whether ' + t('b=0') + '.' }],
            'Graph ' + R + ' falls from left to right; a falling line has a negative slope: ' + t('m=-' + qT(m)) + '. Fix the sign from the direction first, then count rise and run for the size.', ['Does the line go up or down as you move to the right?'], 'what settles the sign of m');
        } }] },
      /* ================= EP Part E ================= */
      { num: '12', section: 'Extra practice E — Recovering the equation from a table in context', shared: ep12Shared, stem: function (sh) {
          var ns = [0, 50, 100, 150];
          return 'A cell-phone plan charges a fixed monthly fee plus a rate per minute of talk time. The table shows the monthly cost ' + t('C') + ', in dollars, for ' + t('n') + ' minutes used.' +
            HW.valueTable([[t('n') + ' (min)'].concat(ns), [t('C') + ' ($)'].concat(ns.map(function (n) { return money(sh.F + sh.c * n / 100); }))]);
        }, parts: [
        { id: 'e12a', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
          var rate = sh.c / 100, step = sh.c / 2;
          var p = B.math('(a) The relation is linear (equal steps in ' + t('n') + ' give equal steps in ' + t('C') + '). Determine ' + t('m') + ' as an exact rate.', K.value(rate, { diag: dg([[step, 'rate-not-div', t(money(step)) + ' is the change in cost for <b>50</b> minutes. Divide by ' + t('50') + ' to get the rate per minute.'], [50 / step, 'rate-flip', 'That’s minutes per dollar. The rate is dollars ÷ minutes: ' + t('\\frac{\\Delta C}{\\Delta n}') + '.'], [sh.F, 'rate-fee', 'That’s the fixed fee (the cost at ' + t('n=0') + '). The rate is how fast the cost changes.']], rate) }),
            String(rate), 'Every ' + t('n') + '-step is ' + t('50') + '; every ' + t('C') + '-step is ' + t(money(step)) + '.<br>' + t('m=\\frac{' + money(step) + '}{50}=' + rate) + ' dollars per minute.', ['Rate = change in ' + t('C') + ' ÷ change in ' + t('n') + '.'], 'rate from a table', { keys: 'fraction', before: 'm=', after: ' dollars per minute' });
          p.good = [qT(Q(sh.c, 100))]; p.bad = [String(step), String(sh.F)];
          return p;
        } },
        { id: 'e12b', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
          var rate = sh.c / 100, step = sh.c / 2;
          var p = B.line('(b) Write the equation in the form ' + t('C=mn+b') + '.', { m: rate, b: sh.F }, { vars: ['n', 'C'], form: 'slope-intercept', keyTex: 'C=' + rate + 'n+' + sh.F, placeholder: 'e.g. C = 0.5n + 10',
            wrong: [{ is: { m: step, b: sh.F }, code: 'rate-not-div', hint: 'The cost rises ' + t(money(step)) + ' per <b>50</b> minutes — the slope is the rate per minute.' }, { is: { m: sh.F, b: rate }, code: 'fee-wrong', hint: 'The fee is the constant (the cost at ' + t('n=0') + '); the rate per minute multiplies ' + t('n') + '.' }] },
            t('m=' + rate) + '; at ' + t('n=0') + ', ' + t('C=' + sh.F) + ', so ' + t('b=' + sh.F) + '.<br>' + t('C=' + rate + 'n+' + sh.F), ['Use ' + t('n') + ' and ' + t('C') + ' instead of ' + t('x') + ' and ' + t('y') + '.'], 'cost equation from table');
          p.good = ['C=' + sh.F + '+' + rate + 'n']; p.bad = ['C=' + step + 'n+' + sh.F, '100C=' + sh.c + 'n+' + (100 * sh.F)];
          return p;
        } },
        { id: 'e12c', level: 'PRG', outcome: 'RF5', make: function (r, sh) {
          var rate = sh.c / 100;
          return mc(r, '(c) What do ' + t('m') + ' and ' + t('b') + ' mean in this plan?', [
            { html: 'The cost rises by $' + money(rate) + ' for each minute of talk time; ' + t('b=' + sh.F) + ' is the fixed monthly fee, $' + money(sh.F) + ', charged even for ' + t('0') + ' minutes.', right: true },
            { html: 'Each minute costs $' + money(sh.F) + ', and the plan starts at $' + money(rate) + '.', why: 'Swapped: the constant ' + t(sh.F) + ' is the cost at ' + t('n=0') + ' (the fee); the coefficient of ' + t('n') + ' is the rate.' },
            { html: 'The cost rises by $' + money(sh.c / 2) + ' for each minute.', why: 'That rise is for each <b>50</b> minutes.' },
            { html: 'The rate is ' + rate + ' minutes per dollar.', why: 'Units upside down: ' + t('\\frac{\\Delta C}{\\Delta n}') + ' is dollars per minute.' }],
            t('m=' + rate) + ' dollars per minute: each extra minute adds $' + money(rate) + '. ' + t('b=' + sh.F) + ': the cost at ' + t('n=0') + ' — the fixed monthly fee.', ['The slope’s units are (units of ' + t('C') + ') per (unit of ' + t('n') + ').'], 'interpret m and b');
        } },
        { id: 'e12d', level: 'EMG', outcome: 'RF5', make: function (r, sh) {
          return mc(r, '(d) Why is reading ' + t('b') + ' off this table easier than reading it off most tables?', [
            { html: t('b') + ' is the value of ' + t('C') + ' when ' + t('n=0') + ', and this table already has an ' + t('n=0') + ' column.', right: true },
            { html: t('b') + ' is always the first ' + t('C') + '-value in any table.', why: 'Only when the first column is ' + t('n=0') + '. Many tables start somewhere else, and ' + t('b') + ' must be worked back.' },
            { html: t('b') + ' is the change in ' + t('C') + ' between columns.', why: 'That’s related to the slope, not the intercept.' },
            { html: t('b') + ' is the largest value in the table.', why: t('b') + ' is the ' + t('C') + '-value at ' + t('n=0') + '.' }],
            t('b') + ' is the value of ' + t('C') + ' when ' + t('n=0') + '. This table has an ' + t('n=0') + ' column, so ' + t('b=' + sh.F) + ' is read straight off.', ['What is ' + t('n') + ' at the ' + t('C') + '-intercept?'], 'why b is easy here');
        } },
        { id: 'e12e', level: 'EMG', outcome: 'RF4', make: function (r, sh) {
          var rate = sh.c / 100, C1 = Math.round((sh.F + rate * sh.n1) * 100) / 100;
          return B.number('(e) Determine the cost of a month with ' + t(sh.n1) + ' minutes of talk time.', C1, function (v) { if (near(v, Math.round(rate * sh.n1 * 100) / 100)) return { code: 'no-fixed', hint: 'Add the fixed fee of $' + money(sh.F) + '.' }; return null; },
            t('C=' + rate + '(' + sh.n1 + ')+' + sh.F + '=' + nT(rate * sh.n1) + '+' + sh.F + '=' + money(C1)) + ': $' + money(C1) + '.', ['Substitute ' + t('n=' + sh.n1) + ' into your equation.'], 'cost for n minutes', { before: '$' });
        } },
        { id: 'e12f', level: 'PRG', outcome: 'RF4', make: function (r, sh) {
          var rate = sh.c / 100, bill = Math.round((sh.F + rate * sh.n2) * 100) / 100;
          return B.number('(f) A bill comes to $' + money(bill) + '. Determine the number of minutes used.', sh.n2, function (v) {
            if (near(v, Math.round(bill / rate * 100) / 100)) return { code: 'no-fixed', hint: 'Subtract the fixed fee first: ' + t(money(bill) + '-' + sh.F) + '.' };
            if (near(v, Math.round((bill + sh.F) / rate * 100) / 100)) return { code: 'move-sign', hint: 'Subtract the fee (don’t add it) before dividing by the rate.' }; return null; },
            t(money(bill) + '=' + rate + 'n+' + sh.F) + '<br>' + t(nT(bill - sh.F) + '=' + rate + 'n') + '<br>' + t('n=\\frac{' + nT(bill - sh.F) + '}{' + rate + '}=' + sh.n2) + ' minutes.', ['Set ' + t('C=' + money(bill)) + ' and solve for ' + t('n') + '.'], 'minutes from a bill', { after: ' minutes' });
        } }] },
      /* ================= EP Part F ================= */
      { num: '13', section: 'Extra practice F — Stretch and review', shared: function (r) { return { m: r.pick([2, 3, 4, -2, -3]), b: r.int(-4, 4), x1: r.int(1, 3), x2: r.pick([-1, -2]) }; },
        stem: function (sh) { return 'The points ' + t(ptT([sh.x1, sh.m * sh.x1 + sh.b])) + ' and ' + t(ptT([sh.x2, sh.m * sh.x2 + sh.b])) + ' both lie on the line ' + t('y=mx+b') + '. <b>Do not use the slope formula.</b>'; }, parts: [
        { id: 'e13a', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
          var P1 = [sh.x1, sh.m * sh.x1 + sh.b], P2 = [sh.x2, sh.m * sh.x2 + sh.b];
          var subChk = function (x, y) {
            var T = [x, 1, -y];
            return function (resp) {
              var s = cleanS(resp); if (!s) return form('empty', 'Type the equation, e.g. ' + t('7=2m+b') + '.');
              var R = LN.read(s, ['m', 'b']);
              if (!R.ok) return form('line-' + R.why, R.why === 'no-eq' ? 'Write an equation with ' + t('=') + ', e.g. ' + t('7=2m+b') + '.' : R.why === 'vars' ? 'The unknowns are ' + t('m') + ' and ' + t('b') + ': substitute the numbers for ' + t('x') + ' and ' + t('y') + '.' : 'I can’t read that equation.');
              var S = [R.a, R.b, R.c];
              if (LN.same(S, T)) return ok();
              if (LN.same(S, [y, 1, -x])) return wrong('sub-swap', 'Swapped: in ' + t('y=mx+b') + ', ' + t('y') + ' is ' + t(y) + ' and ' + t('x') + ' is ' + t(x) + ': ' + t(y + '=' + x + 'm+b') + '.');
              return wrong('sub', 'Replace ' + t('x') + ' and ' + t('y') + ' in ' + t('y=mx+b') + ' with the coordinates of the point.');
            };
          };
          var e1 = P1[1] + '=' + lin([[P1[0], 'm'], [1, 'b']]), e2 = P2[1] + '=' + lin([[P2[0], 'm'], [1, 'b']]);
          var p = B.fields('(a) Substitute each point into ' + t('y=mx+b') + ' to write two equations in the unknowns ' + t('m') + ' and ' + t('b') + '.', [{ label: 'For ' + t(ptT(P1)) + ':', name: 'First point', mode: 'math', keys: 'eq', vars: ['m', 'b'] }, { label: 'For ' + t(ptT(P2)) + ':', name: 'Second point', mode: 'math', keys: 'eq', vars: ['m', 'b'] }],
            [subChk(P1[0], P1[1]), subChk(P2[0], P2[1])], [e1, e2], t(e1) + ', &nbsp;' + t(e2), t(ptT(P1)) + ': ' + t(e1) + '<br>' + t(ptT(P2)) + ': ' + t(e2), ['The ' + t('x') + '-coordinate replaces ' + t('x') + ', the ' + t('y') + '-coordinate replaces ' + t('y') + '.'], 'substitute two points');
          p.bad = P1[0] !== P1[1] ? [[P1[0] + '=' + P1[1] + 'm+b', e2]] : [[e1, e1]];
          return p;
        } },
        { id: 'e13b', level: 'PRG', outcome: 'RF7', make: function (r, sh) {
          var y1 = sh.m * sh.x1 + sh.b, y2 = sh.m * sh.x2 + sh.b, dx = sh.x1 - sh.x2, dy = y1 - y2;
          var p = B.line('(b) Solve the pair for ' + t('m') + ' and ' + t('b') + ', and state the equation of the line.', { m: sh.m, b: sh.b }, {},
            'Subtract the second equation from the first: ' + t(dy + '=' + dx + 'm') + ', so ' + t('m=' + sh.m) + '.<br>Then ' + t(y1 + '=' + sh.m * sh.x1 + '+b') + ', so ' + t('b=' + sh.b) + '.<br>' + t(siT(sh.m, sh.b)) + '. Check ' + t(ptT([sh.x2, y2])) + ': ' + t(sh.m + '(' + sh.x2 + ')' + (sh.b === 0 ? '' : (sh.b < 0 ? '' : '+') + sh.b) + '=' + y2) + ' ✓',
            ['Subtracting the two equations eliminates ' + t('b') + '.', 'Substitute ' + t('m') + ' back to find ' + t('b') + '.'], 'line through two points by substitution');
          p.bad = [siT(sh.m, sh.b + 1)];
          return p;
        } },
        { id: 'e13c', level: 'EMG', outcome: 'RF7', make: function (r, sh) {
          return mc(r, '(c) Check ' + t('m') + ' with the slope formula ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + '. Where is that formula hiding inside your work in (b)?', [
            { html: 'Subtracting the equations gave ' + t('y_1-y_2=m(x_1-x_2)') + '; dividing by ' + t('x_1-x_2') + ' to isolate ' + t('m') + ' <b>is</b> the slope formula.', right: true },
            { html: 'It isn’t: the substitution method finds ' + t('m') + ' a completely different way.', why: 'Same arithmetic: the subtraction step produces the slope formula’s numerator and denominator.' },
            { html: 'In the step where ' + t('b') + ' was found.', why: 'Finding ' + t('b') + ' comes after ' + t('m') + '. The formula is in the step that found ' + t('m') + '.' },
            { html: 'In adding the two equations together.', why: 'Adding would keep ' + t('2b') + '; it is the subtraction that removes ' + t('b') + ' and leaves rise ' + t('=m\\times') + ' run.' }],
            t('m=\\frac{' + (sh.m * sh.x1 + sh.b) + '-(' + (sh.m * sh.x2 + sh.b) + ')}{' + sh.x1 + '-(' + sh.x2 + ')}=' + sh.m) + ' ✓. Subtracting gave ' + t('y_1-y_2=m(x_1-x_2)') + '; dividing by ' + t('x_1-x_2') + ' is the slope formula.', ['Look at the step where ' + t('b') + ' disappeared.'], 'slope formula hidden in elimination');
        } }] },
      { num: '14', stem: 'Determine the missing constant in each case.', parts: [
        { id: 'e14a', level: 'EMG', outcome: 'RF7', make: function (r) {
          var k = r.int(2, 5), c = r.int(1, 6), x1 = r.int(2, 6), y1 = k * x1 - c;
          return B.number('(a) ' + t('y=kx-' + c) + ' passes through ' + t(ptT([x1, y1])) + '. Find ' + t('k') + '.', k, function (v) { if (near(v, (y1 - c) / x1)) return { code: 'sub-sign', hint: 'Undo the ' + t('-' + c) + ' by <b>adding</b> ' + t(c) + ' to both sides.' }; if (near(v, x1 / (y1 + c))) return { code: 'xint-flip', hint: 'Divide by ' + t(x1) + ', the coefficient of ' + t('k') + '.' }; return null; },
            'Substitute: ' + t(y1 + '=' + x1 + 'k-' + c) + '<br>' + t((y1 + c) + '=' + x1 + 'k') + '<br>' + t('k=' + k), ['Substitute the point, then solve for ' + t('k') + '.'], 'find k');
        } },
        { id: 'e14b', level: 'EMG', outcome: 'RF7', make: function (r) {
          var a = r.int(2, 5), x1 = r.int(-4, -1), c = r.int(1, 6), y1 = -a * x1 + c;
          return B.number('(b) ' + t('y=-' + a + 'x+c') + ' passes through ' + t(ptT([x1, y1])) + '. Find ' + t('c') + '.', c, function (v) { if (near(v, y1 - a * x1)) return { code: 'neg-times-neg', hint: t('-' + a + '(' + x1 + ')=+' + (-a * x1)) + ': a negative times a negative is positive.' }; return null; },
            'Substitute: ' + t(y1 + '=-' + a + '(' + x1 + ')+c') + '<br>' + t(y1 + '=' + (-a * x1) + '+c') + '<br>' + t('c=' + c), ['Substitute, and watch the signs: negative times negative.'], 'find c');
        } },
        { id: 'e14c', level: 'EMG', outcome: 'RF7', make: function (r) {
          var m = r.pick([[2, 5], [3, 4], [2, 3], [1, 2], [3, 5]]), x1 = m[1] * r.int(1, 3) * r.pick([1, 2]), b = r.pick([-5, -4, -3, -2, -1, 1, 2]), y1 = m[0] * x1 / m[1] + b;
          return B.number('(c) ' + t('y=' + qT(m) + 'x+b') + ' passes through ' + t(ptT([x1, y1])) + '. Find ' + t('b') + '.', b, function (v) { if (near(v, y1 + m[0] * x1 / m[1])) return { code: 'sub-sign', hint: 'Subtract ' + t(m[0] * x1 / m[1]) + ' from both sides (don’t add it).' }; return null; },
            'Substitute: ' + t(y1 + '=' + qT(m) + '(' + x1 + ')+b') + '<br>' + t(y1 + '=' + (m[0] * x1 / m[1]) + '+b') + '<br>' + t('b=' + b), ['Substitute the point, then solve for ' + t('b') + '.'], 'find b');
        } }] },
      { num: '15', parts: [
        { id: 'e15', level: 'BEG', outcome: 'RF5', make: function (r) {
          var a = r.int(2, 5), c = r.int(2, 8);
          return mc(r, '<i>(Multiple Choice)</i> Which line falls from left to right <b>and</b> crosses the ' + t('y') + '-axis below the origin?', [
            { html: t('y=' + a + 'x-' + c), why: t('m=' + a + '>0') + ': this line rises.' }, { html: t('y=-' + a + 'x+' + c), why: t('b=' + c + '>0') + ': it crosses above the origin.' },
            { html: t('y=-' + a + 'x-' + c), right: true }, { html: t('y=' + a + 'x+' + c), why: 'It rises and crosses above the origin.' }],
            'Falls ⇒ ' + t('m<0') + '; crosses below the origin ⇒ ' + t('b<0') + '. Only ' + t('y=-' + a + 'x-' + c) + ' has both.', ['Falling means a negative slope; below the origin means a negative ' + t('b') + '.'], 'falls and b < 0');
        } }] },
      { num: '16', parts: [
        { id: 'e16', level: 'EMG', outcome: 'RF4', make: function (r) {
          var A = r.int(2, 5), Bc = r.int(2, 5), C = Bc * A * r.int(1, 2), c = r.int(1, 7), n = r.int(2, 12), k = r.int(2, 9);
          return mc(r, '<i>(Multiple Choice)</i> Which relation is <b>not</b> linear?', [
            { html: t(A + 'x-' + Bc + 'y=' + C), why: t('-' + Bc + 'y=-' + A + 'x+' + C) + ', so ' + t(siT(Q(A, Bc), Q(-C, Bc))) + ' — linear.' },
            { html: t('y=\\dfrac{x-' + c + '}{2}'), why: t('y=\\frac{1}{2}x-\\frac{' + c + '}{2}') + ' — linear.' },
            { html: t('xy=' + n), right: true },
            { html: t('y=' + k), why: 'A horizontal line, ' + t('m=0') + ' — linear.' }],
            t('xy=' + n) + ' gives ' + t('y=\\frac{' + n + '}{x}') + ': ' + t('x') + ' in a denominator, so not linear. The others rearrange to ' + t('y=mx+b') + '.', ['Try to rearrange each one into ' + t('y=mx+b') + '.'], 'which is not linear');
        } }] },
      { num: '17', parts: [
        { id: 'e17', level: 'PRG', outcome: 'RF7', make: function (r) {
          var m, b, x1, x2, X, ans;
          do { m = r.int(2, 4); b = r.int(-3, 5); x1 = r.int(-4, -2); x2 = r.int(1, 2); X = r.pick([10, 12, 12, 15, 20]); ans = m * X + b; } while (ans < 0 || ans > 999);
          var y1 = m * x1 + b, y2 = m * x2 + b;
          return B.nr('<i>(Numerical Response)</i> The line ' + t('y=mx+b') + ' passes through ' + t(ptT([x1, y1])) + ' and ' + t(ptT([x2, y2])) + '. The value of ' + t('y') + ' on this line when ' + t('x=' + X) + ' is ____.', ans, function (v) {
            if (near(v, m * X)) return { code: 'nr-12m', hint: 'Don’t forget ' + t('b') + ': find it by substituting a point.' };
            if (near(v, X / m + b)) return { code: 'nr-flip', hint: 'Slope is rise over run: ' + t('\\frac{\\Delta y}{\\Delta x}') + '.' }; return null; },
            t(y1 + '=' + x1 + 'm+b') + ', ' + t(y2 + '=' + x2 + 'm+b') + '. Subtract: ' + t((y2 - y1) + '=' + (x2 - x1) + 'm') + ', ' + t('m=' + m) + '; ' + t('b=' + b) + '.<br>' + t(siT(m, b)) + '; at ' + t('x=' + X) + ': ' + t('y=' + m + '(' + X + ')' + (b === 0 ? '' : (b < 0 ? '' : '+') + b) + '=' + ans) + '.',
            ['Find ' + t('m') + ' and ' + t('b') + ' first.', 'Then substitute ' + t('x=' + X) + '.'], 'y at x for line through two points');
        } }] }
    ]
  });
})(window);
