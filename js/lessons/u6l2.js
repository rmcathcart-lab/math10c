/* Math 10C · Unit 6 · Lesson 2 — Extension: The Distance and Midpoint Formulas (EXT)
 * Assignment questions 1–18 (u6_L02.tex) and the Lesson 2 Extra Practice (u6_EP02.tex).
 * Every part is a generator: it keeps the booklet question's structure (which coordinates are negative, decimals,
 * halves, a right angle at a named vertex, collinear points, a parallelogram, a context and its scale) and changes the
 * numbers; the booklet's own numbers are among the possible values.
 * Answers: distances → a number, a rounded decimal (K.approx) or an exact length in simplest radical form
 * (K.radical); points → an ordered pair typed with the pairs keypad (a local reader that diagnoses subtracting instead
 * of adding, not halving, averaging instead of "double the midpoint and subtract", swapped coordinates, …);
 * several points → one box with every point. Explain / prove / "what do you notice" items → multiple choice with
 * misconception hints. The booklet asks for no drawings in this lesson, so there are no graph-pad parts; the given
 * figures are HW.graph pictures. Outcome EXT (extension lesson) on every part. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P, P = HW.poly;

  HW.addCodes({
    'd-no-root': 'Distance: forgot the square root (gave d²)', 'd-legs': 'Distance: added the run and rise', 'd-no-square': 'Distance: didn’t square the differences',
    'd-added': 'Distance: added the coordinates instead of subtracting', 'd-sign': 'Distance: sign slip subtracting a negative coordinate',
    'd-units': 'Distance in grid units, not converted with the scale', 'd-metres': 'Gave metres instead of kilometres', 'd-scale-div': 'Divided by the scale instead of multiplying',
    'd-walk': 'Gave the distance walked along the streets', 'd-half': 'Gave half the distance', 'd-straight': 'Gave the straight-line distance instead of the route',
    'd-round-early': 'Rounded each segment before adding', 'd-no-neg': 'Treated west/south as positive', 'd-diff-blocks': 'Subtracted the blocks instead of combining them',
    'mid-subtract': 'Midpoint: subtracted the coordinates', 'mid-no-halve': 'Midpoint: didn’t divide by 2', 'mid-wrong-seg': 'Midpoint of the wrong segment',
    'end-average': 'Missing endpoint: averaged instead of doubling and subtracting', 'end-step': 'Missing endpoint: gave the step from A to M', 'end-sign': 'Missing endpoint: added instead of subtracting',
    'end-sum': 'Missing endpoint: added the midpoint and the endpoint', 'end-double': 'Missing endpoint: doubled the midpoint but didn’t subtract', 'end-used-x': 'Used the wrong coordinate equation',
    'end-gave-y': 'Gave the y-value instead of x', 'pt-swap': 'Coordinates swapped', 'pt-x': 'Wrong x-coordinate', 'pt-y': 'Wrong y-coordinate', pt: 'Wrong point',
    'pt-not-pair': 'Gave one number for a point', 'pt-brackets': 'Point without brackets', 'pt-many': 'Gave several points for one', 'pt-dir': 'West/south not written as negative',
    'pts-missing': 'Missed a point', 'pts-extra': 'A point that doesn’t work', pts: 'Wrong points', 'ax-no-leg': 'Left out the other coordinate’s difference',
    'ax-no-root': 'Didn’t take the square root', 'ax-sign': 'Sign slip solving (x − h)² = …', 'ax-one': 'Gave only one of two points',
    'eq-gave-mid': 'Gave the midpoint of AB', 'eq-mid-y': 'Used the average of the y-coordinates', 'par-one-d': 'Found only one fourth vertex',
    'road-half': 'Gave the road to one town only', 'per-side': 'Perimeter missing a side', 'ctx-swap': 'Mixed up which distance is x and which is y'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function cl(x) { return Math.round(x * 1e6) / 1e6; }
  function same(a, b) { return Math.abs(a - b) < 1e-7; }
  function nT(x) { return F(cl(x)); }
  function sgp(x) { x = cl(x); return x < 0 ? '(' + nT(x) + ')' : nT(x); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var r = a % b; a = b; b = r; } return a; }
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function pm(a, b) { return range(a, b).concat(range(a, b).map(function (x) { return -x; })); }
  function pickWhere(gen, okf) { for (var i = 0; i < 4000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u6l2: no valid numbers'); }
  function isSq(n) { var q = Math.round(Math.sqrt(n)); return q * q === n; }
  function radParts(n) { var k = 1, m = n; for (var f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return { k: k, m: m }; }
  function ptT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function nm(name, p) { return name + ptT(p); }
  function ptKey(p) { return '(' + cl(p[0]) + ', ' + cl(p[1]) + ')'; }
  function samePt(a, b) { return same(a[0], b[0]) && same(a[1], b[1]); }
  function mid(a, b) { return [cl((a[0] + b[0]) / 2), cl((a[1] + b[1]) / 2)]; }
  function add(a, b) { return [cl(a[0] + b[0]), cl(a[1] + b[1])]; }
  function sub(a, b) { return [cl(a[0] - b[0]), cl(a[1] - b[1])]; }
  function scl(a, k) { return [cl(a[0] * k), cl(a[1] * k)]; }
  function d2(a, b) { return cl((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1])); }
  function dist(a, b) { return Math.sqrt(d2(a, b)); }
  function rd(x, dp) { return K.roundTo(x, dp); }
  function fx(x, dp) { return rd(x, dp).toFixed(dp); }
  /* exact length √n / den in simplest form */
  function lenSpec(n, den) { den = den || 1; var r = radParts(n), g = gcd(r.k, den); return { k: [r.k / g, den / g], m: r.m }; }
  function lenTex(n, den) {
    var s = lenSpec(n, den), p = s.k[0], q = s.k[1], core = s.m === 1 ? String(p) : (p === 1 ? '' : p) + '\\sqrt{' + s.m + '}';
    return q === 1 ? core : '\\dfrac{' + core + '}{' + q + '}';
  }
  function lenKey(n, den) {
    var s = lenSpec(n, den), p = s.k[0], q = s.k[1], core = s.m === 1 ? String(p) : (p === 1 ? '' : p) + '\\sqrt{' + s.m + '}';
    return q === 1 ? core : '\\frac{' + core + '}{' + q + '}';
  }
  /* "= √40 = √(4 × 10) = 2√10" (the steps after √n) */
  function simpTail(n) {
    if (isSq(n)) return '=' + Math.round(Math.sqrt(n));
    var r = radParts(n); return r.k === 1 ? '' : '=\\sqrt{' + (r.k * r.k) + '\\times ' + r.m + '}=' + r.k + '\\sqrt{' + r.m + '}';
  }
  /* LaTeX of the distance computation from p to q: "AB = √((x2−x1)² + (y2−y1)²) = √(dx² + dy²) = √(a + b) = √n" */
  function dLine(p, q, name) {
    var dx = cl(q[0] - p[0]), dy = cl(q[1] - p[1]);
    return (name ? name + '=' : '') + '\\sqrt{(' + nT(q[0]) + '-' + sgp(p[0]) + ')^{2}+(' + nT(q[1]) + '-' + sgp(p[1]) + ')^{2}}=\\sqrt{' + sgp(dx) + '^{2}+' + sgp(dy) + '^{2}}=\\sqrt{' + nT(dx * dx) + '+' + nT(dy * dy) + '}=\\sqrt{' + nT(dx * dx + dy * dy) + '}';
  }
  function dSteps(p, q) {
    var dx = cl(q[0] - p[0]), dy = cl(q[1] - p[1]);
    return t('x_2-x_1=' + nT(q[0]) + '-' + sgp(p[0]) + '=' + nT(dx)) + ', &nbsp;' + t('y_2-y_1=' + nT(q[1]) + '-' + sgp(p[1]) + '=' + nT(dy)) + '.';
  }
  function mLine(p, q, name) {
    return (name ? name + '=' : '') + '\\left(\\dfrac{' + nT(p[0]) + '+' + sgp(q[0]) + '}{2},\\ \\dfrac{' + nT(p[1]) + '+' + sgp(q[1]) + '}{2}\\right)=\\left(\\dfrac{' + nT(p[0] + q[0]) + '}{2},\\ \\dfrac{' + nT(p[1] + q[1]) + '}{2}\\right)=' + ptT(mid(p, q));
  }

  var HD = ['Distance formula: ' + t('d=\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}') + '. Find the run and the rise, square each, add, then take the square root.',
    'Watch the signs: subtracting a negative coordinate means adding, e.g. ' + t('3-(-3)=6') + '.'];
  var HM = ['Midpoint formula: ' + t('M\\left(\\dfrac{x_1+x_2}{2},\\ \\dfrac{y_1+y_2}{2}\\right)') + ' — average the ' + t('x') + '-coordinates and average the ' + t('y') + '-coordinates.',
    'Add the coordinates (don’t subtract), then divide each sum by ' + t('2') + '.'];
  var HE = ['If ' + t('M') + ' is the midpoint of ' + t('\\overline{AB}') + ', then ' + t('x_M=\\dfrac{x_A+x_B}{2}') + ', so ' + t('x_B=2x_M-x_A') + ': <b>double the midpoint, then subtract the endpoint you have</b>.',
    'Do the same with the ' + t('y') + '-coordinates. Averaging again is the classic wrong move — the missing endpoint lies <i>beyond</i> the midpoint.'];

  /* ---------------- typical wrong distances ---------------- */
  function dCands(p, q, scale) {
    scale = scale || 1;
    var dx = cl(q[0] - p[0]), dy = cl(q[1] - p[1]), D = Math.sqrt(dx * dx + dy * dy) * scale, out = [];
    function put(v, code, hint) { if (!isFinite(v) || v <= 0 || Math.abs(v - D) < 1e-6 || out.some(function (o) { return Math.abs(o[0] - v) < 1e-6; })) return; out.push([v, code, hint]); }
    if (scale === 1) put(dx * dx + dy * dy, 'd-no-root', 'That is ' + t('d^{2}') + ' — the last step of the distance formula is to take the <b>square root</b>.');
    put((Math.abs(dx) + Math.abs(dy)) * scale, 'd-legs', 'You added the run and the rise. The segment is the <b>hypotenuse</b> of a right triangle: square the run and the rise, add, then take the square root.');
    put(Math.sqrt(Math.abs(dx) + Math.abs(dy)) * scale, 'd-no-square', 'Square each difference before you add them: ' + t('\\sqrt{(\\Delta x)^{2}+(\\Delta y)^{2}}') + '.');
    var sx = cl(q[0] + p[0]), sy = cl(q[1] + p[1]);
    put(Math.sqrt(sx * sx + sy * sy) * scale, 'd-added', 'The distance formula <b>subtracts</b> the coordinates (' + t('x_2-x_1') + ' and ' + t('y_2-y_1') + ') — it doesn’t add them.');
    var ex1 = p[0] < 0 ? t(nT(q[0]) + '-' + sgp(p[0]) + '=' + nT(dx)) : p[1] < 0 ? t(nT(q[1]) + '-' + sgp(p[1]) + '=' + nT(dy)) : q[0] < 0 ? t(nT(p[0]) + '-' + sgp(q[0]) + '=' + nT(-dx)) : t(nT(p[1]) + '-' + sgp(q[1]) + '=' + nT(-dy));
    var sh = 'Check your subtraction — subtracting a negative coordinate means adding: ' + ex1 + '.';
    put(Math.sqrt(sx * sx + dy * dy) * scale, 'd-sign', sh);
    put(Math.sqrt(dx * dx + sy * sy) * scale, 'd-sign', sh);
    return out;
  }
  function matchDiag(cands, dp) {
    return function (v) {
      for (var i = 0; i < cands.length; i++) {
        var c = cands[i][0];
        if (dp == null ? Math.abs(v - c) < 1e-6 : Math.abs(v - rd(c, dp)) < 1e-9 || Math.abs(v - c) < 1e-6) return { code: cands[i][1], hint: cands[i][2] };
      }
      return null;
    };
  }
  /* an exact length √n/den: integer, fraction or simplest mixed radical. o.cands (wrong values), o.dec (also accept a
   * correctly rounded decimal, 1 or 2 decimal places) */
  function lenCheck(n, den, o) {
    o = o || {}; den = den || 1;
    var s = lenSpec(n, den), L = Math.sqrt(n) / den, dg = matchDiag(o.cands || []);
    var base = s.m === 1 ? (s.k[1] === 1 ? K.value(s.k[0], { only: 'integer', diag: dg }) : K.fraction(s.k, { decimalOk: true, diag: dg })) : K.radical({ k: s.k, n: 2, m: s.m }, 'mixed', { diag: dg });
    return function (resp) {
      if (o.dec) {
        var pn = HW.parse.number(String(resp == null ? '' : resp));
        if (pn.ok) { var str = HW.parse.plain(String(resp)).replace(/\s/g, ''), dp = (str.split('.')[1] || '').length; if (dp >= 1 && dp <= 3 && Math.abs(pn.value - rd(L, dp)) < 1e-9) return ok(); }
      }
      return base(resp);
    };
  }
  function lenField(label) { return { label: t(label + '='), name: label, mode: 'math', keys: 'radical' }; }

  /* ---------------- points ---------------- */
  function stripP(s) {
    return String(s == null ? '' : s).replace(/\\(left|right)\b\.?/g, '').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\[,;!: ]/g, '')
      .replace(/\\\{|\\\}|\\lbrace|\\rbrace/g, ' ').replace(/\\text\{\s*and\s*\}/g, ',').trim();
  }
  function simpleNum(ast) { var sh = ex.shape(ast); if (sh.bare) return true; var pf = ex.plainFraction(ast); return !!(pf && pf[1] > 1 && gcd(pf[0], pf[1]) === 1 && !sh.decimals); }
  function coordPair(str) {
    var xy = str.split(','); if (xy.length !== 2 || !xy[0].trim() || !xy[1].trim()) return null;
    var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return null;
    var va = ex.value(a.ast), vb = ex.value(b.ast); if (!isFinite(va) || !isFinite(vb)) return null;
    return { x: va, y: vb, simple: simpleNum(a.ast) && simpleNum(b.ast) };
  }
  function readPts(resp) {
    var s = stripP(resp);
    if (/^\{[\s\S]*\}$/.test(s) && !/^\{[^{}]*\}\{/.test(s)) s = s.slice(1, -1).trim();
    if (!s) return { empty: true };
    var re = /\(([^()]*)\)/g, m, out = [];
    while ((m = re.exec(s))) { var c = coordPair(m[1]); if (!c) return { bad: true }; out.push(c); }
    if (!out.length) {
      var c2 = coordPair(s); if (c2) return { pts: [c2], noParen: true };
      var one = ex.parse(s); if (one.ok && isFinite(ex.value(one.ast))) return { single: true };
      return { bad: true };
    }
    if (s.replace(re, '').replace(/[,;\s]|and/g, '').length) return { bad: true };
    return { pts: out };
  }
  function readRes(L) {
    if (L.empty) return form('empty', 'Type your answer first.');
    if (L.single) return form('pt-not-pair', 'A point needs two coordinates: write it as an ordered pair ' + t('(x,\\ y)') + '.');
    if (L.bad) return form('unreadable', 'Write the point as an ordered pair in brackets, e.g. ' + t('(3,\\ -2)') + ' (press <b>( )</b>, type x, comma, y).');
    return null;
  }
  /* one point. o.cands: [[pt, code, hint]], o.swapHint, o.xHint, o.yHint */
  function ptCheck(W, o) {
    o = o || {};
    return function (resp) {
      var L = readPts(resp), rr = readRes(L); if (rr) return rr;
      if (L.pts.length !== 1) return form('pt-many', 'Give just one point.');
      var p = L.pts[0], Q = [p.x, p.y];
      if (samePt(Q, W)) {
        if (!p.simple) return form('simplify', 'Right point — now simplify each coordinate to a single number (for example ' + t('\\frac{12}{2}=6') + ').');
        if (L.noParen) return form('pt-brackets', 'Right coordinates — write the point in brackets: ' + t('(x,\\ y)') + '.');
        return ok();
      }
      var c = o.cands || [];
      for (var i = 0; i < c.length; i++) if (c[i][0] && samePt(Q, c[i][0])) return wrong(c[i][1], c[i][2]);
      if (same(Q[0], W[1]) && same(Q[1], W[0])) return wrong('pt-swap', o.swapHint || 'Your coordinates are in the wrong order: the ' + t('x') + '-coordinate comes first, then the ' + t('y') + '-coordinate.');
      if (same(Q[0], W[0])) return wrong('pt-y', 'Your ' + t('x') + '-coordinate is right — check the ' + (same(Q[1], -W[1]) ? '<b>sign</b> of the ' : '') + t('y') + '-coordinate.' + (o.yHint ? ' ' + o.yHint : ''));
      if (same(Q[1], W[1])) return wrong('pt-x', 'Your ' + t('y') + '-coordinate is right — check the ' + (same(Q[0], -W[0]) ? '<b>sign</b> of the ' : '') + t('x') + '-coordinate.' + (o.xHint ? ' ' + o.xHint : ''));
      return wrong('pt', null);
    };
  }
  /* several points in one box (any order). o.diag(list) -> {code, hint}, o.missHint */
  function ptsCheck(want, o) {
    o = o || {};
    return function (resp) {
      var L = readPts(resp), rr = readRes(L); if (rr) return rr;
      var A = []; L.pts.forEach(function (p) { if (!A.some(function (q) { return samePt([q.x, q.y], [p.x, p.y]); })) A.push(p); });
      var miss = want.filter(function (w) { return !A.some(function (p) { return samePt([p.x, p.y], w); }); });
      var extra = A.filter(function (p) { return !want.some(function (w) { return samePt([p.x, p.y], w); }); });
      if (!miss.length && !extra.length) {
        if (A.some(function (p) { return !p.simple; })) return form('simplify', 'Right points — now simplify each coordinate to a single number.');
        if (L.noParen) return form('pt-brackets', 'Right coordinates — write each point in brackets: ' + t('(x,\\ y)') + '.');
        return ok();
      }
      if (o.diag) { var h = o.diag(A.map(function (p) { return [p.x, p.y]; })); if (h) return wrong(h.code, h.hint); }
      if (miss.length && !extra.length) return wrong(o.missCode || 'pts-missing', o.missHint || 'Correct so far — but ' + (miss.length === 1 ? 'there is another point' : 'there are more points') + ' that works.');
      if (extra.length && !miss.length) return wrong('pts-extra', 'One of your points doesn’t satisfy the conditions — check each one.');
      return wrong('pts', null);
    };
  }
  function ptPart(prompt, W, o, sol, hints, text) {
    o = o || {};
    var good = ['\\left(' + cl(W[0]) + ',' + cl(W[1]) + '\\right)'], bad = [];
    [[W[1], W[0]]].concat((o.cands || []).map(function (c) { return c[0]; })).forEach(function (q) { if (q && !samePt(q, W)) bad.push(ptKey(q)); });
    return { prompt: prompt, input: { type: 'math', keys: 'pairs', before: o.before, placeholder: 'e.g. (3, -2)' }, check: ptCheck(W, o), key: ptKey(W), answer: t((o.name || '') + ptT(W)),
      solution: sol, hints: hints || HM, text: text, good: good, bad: bad };
  }
  function ptField(label) { return { label: label, name: label.replace(/\\\(|\\\)/g, ''), mode: 'math', keys: 'pairs', placeholder: 'e.g. (3, -2)' }; }
  function midCands(a, b) {
    var h = [cl((b[0] - a[0]) / 2), cl((b[1] - a[1]) / 2)], hs = 'You subtracted the coordinates. The midpoint formula <b>adds</b> them and divides by ' + t('2') + ' — it averages each coordinate.';
    return [[h, 'mid-subtract', hs], [scl(h, -1), 'mid-subtract', hs], [add(a, b), 'mid-no-halve', 'You added the coordinates — now divide each sum by ' + t('2') + '.']];
  }
  function endCands(a, m) {
    return [[mid(a, m), 'end-average', 'You averaged the endpoint and the midpoint — that gives the point halfway between them. The missing endpoint is <i>beyond</i> the midpoint: double the midpoint, then subtract the endpoint you have.'],
      [sub(m, a), 'end-step', 'That is the step from the known endpoint to the midpoint. The missing endpoint is one more such step past the midpoint: ' + t('B=2M-A') + '.'],
      [add(scl(m, 2), a), 'end-sign', 'Double the midpoint, then <b>subtract</b> the endpoint you have — watch the signs.'],
      [add(m, a), 'end-sum', 'Double the midpoint first, then subtract the known endpoint: ' + t('x_B=2x_M-x_A') + '.'],
      [scl(m, 2), 'end-double', 'You doubled the midpoint — now subtract the known endpoint.']];
  }
  function endNum(xA, xM) {
    return [[(xA + xM) / 2, 'end-average', 'You averaged again. The midpoint’s coordinate is the average of the endpoints, so solve ' + t('\\dfrac{' + nT(xA) + '+x}{2}=' + nT(xM)) + ': multiply by ' + t('2') + ', then subtract ' + t(sgp(xA)) + '.'],
      [xM - xA, 'end-step', 'Multiply both sides by ' + t('2') + ' first: ' + t(nT(xA) + '+x=' + nT(2 * xM)) + ', then subtract.'],
      [2 * xM + xA, 'end-sign', 'After doubling, <b>subtract</b> ' + t(sgp(xA)) + ' (it moves to the other side): ' + t('x=' + nT(2 * xM) + '-' + sgp(xA)) + '.'],
      [xM + xA, 'end-sum', 'Double the midpoint coordinate first: ' + t('x=2(' + nT(xM) + ')-' + sgp(xA)) + '.'],
      [2 * xM, 'end-double', 'You doubled the midpoint coordinate — now subtract ' + t(sgp(xA)) + '.']];
  }
  function numDiag(list) { return function (v) { for (var i = 0; i < list.length; i++) if (isFinite(list[i][0]) && same(v, list[i][0])) return { code: list[i][1], hint: list[i][2] }; return null; }; }
  function ptsOpt(r, A, B2, n) { // n random points with |PA| ≠ |PB|, distinct
    var out = [];
    for (var g = 0; out.length < n && g < 4000; g++) {
      var q = [r.int(-12, 12), r.int(-12, 12)];
      if (Math.abs(d2(q, A) - d2(q, B2)) < 4 || out.some(function (o) { return samePt(o, q); })) continue;
      out.push(q);
    }
    return out;
  }
  function eqWhy(q, A, an, B2, bn) { return 'Squared distances from ' + t(ptT(q)) + ': to ' + t(an) + ' it is ' + t(nT(d2(q, A))) + ', to ' + t(bn) + ' it is ' + t(nT(d2(q, B2))) + ' — not equal.'; }
  /* a coordinate grid around some points (even bounds) */
  function win(pts, padv) {
    padv = padv == null ? 1 : padv;
    var xs = pts.map(function (p) { return p[0]; }).concat([0]), ys = pts.map(function (p) { return p[1]; }).concat([0]);
    var lo = function (v) { return Math.floor((Math.min.apply(null, v) - padv) / 2) * 2; }, hi = function (v) { return Math.ceil((Math.max.apply(null, v) + padv) / 2) * 2; };
    return { x: [lo(xs), hi(xs)], y: [lo(ys), hi(ys)] };
  }
  function figPoly(pts, names, o) {
    o = o || {};
    var w = win(pts, 1.5), segs = [];
    if (o.closed) segs.push({ pts: pts.concat([pts[0]]), start: 'none', end: 'none' });
    else if (o.segs) o.segs.forEach(function (s) { segs.push({ pts: s, start: 'none', end: 'none', dash: s.dash }); });
    (o.dash || []).forEach(function (s) { segs.push({ pts: s, start: 'none', end: 'none', dash: true, color: '#c4532a' }); });
    var span = Math.max(w.x[1] - w.x[0], w.y[1] - w.y[0]);
    return '<div class="fig">' + HW.graph({ x: w.x, y: w.y, grid: 1, labels: span > 16 ? 4 : 2, points: pts.map(function (p, i) { return { x: p[0], y: p[1], label: names[i] }; }), segs: segs, max: 340 }) + '</div>';
  }

  /* ---------------- shared generators ---------------- */
  var FIELD = '<div class="fig"><svg class="fig-svg" viewBox="0 0 220 130" width="100%" style="max-width:240px" role="img" aria-label="corner of the field">' +
    '<defs><marker id="u6l2A" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#2b3340"/></marker></defs>' +
    '<line x1="50" y1="100" x2="50" y2="22" stroke="#2b3340" stroke-width="1.8" marker-end="url(#u6l2A)"/><line x1="50" y1="100" x2="170" y2="100" stroke="#2b3340" stroke-width="1.8" marker-end="url(#u6l2A)"/>' +
    '<circle cx="50" cy="100" r="3.5" fill="#2b3340"/><text x="50" y="15" font-size="13" text-anchor="middle" fill="#2b3340">Left sideline</text>' +
    '<text x="176" y="104" font-size="13" fill="#2b3340">Back</text><text x="176" y="119" font-size="13" fill="#2b3340">line</text><text x="44" y="118" font-size="13" text-anchor="end" fill="#2b3340">Corner</text></svg></div>';
  var TRI = [[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5], [9, 12], [12, 9], [8, 15], [15, 8]];
  function triple(r, maxLeg) { var c = TRI.filter(function (p) { return p[0] <= maxLeg && p[1] <= maxLeg; }); return r.pick(c).slice(); }
  function sgn(r, p) { return [p[0] * (r.chance(0.5) ? 1 : -1), p[1] * (r.chance(0.5) ? 1 : -1)]; }
  function rot(v, dir) { return dir > 0 ? [-v[1], v[0]] : [v[1], -v[0]]; }
  function mcPart(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints, text, keepOrder); }

  /* Q4: collinear X, Y, Z (Y between) */
  function q4shared(r) {
    if (r.chance(0.15)) return { X: [-3, -4], v: [2, 3], a: 2, b: 4 };
    return pickWhere(function () {
      var v = [r.int(1, 3), r.int(1, 4)]; if (r.chance(0.3)) v[1] = -v[1];
      var a = r.pick([1, 2, 2, 3]), b = r.pick([2, 3, 4]);
      return { X: [r.int(-6, -1), v[1] > 0 ? r.int(-6, -1) : r.int(1, 8)], v: v, a: a, b: b };
    }, function (o) { var n = o.v[0] * o.v[0] + o.v[1] * o.v[1]; if (gcd(o.v[0], o.v[1]) !== 1 || isSq(n) || radParts(n).k !== 1 || o.a === o.b || o.a + o.b > 6) return false; var Z = add(o.X, scl(o.v, o.a + o.b)); return Math.abs(Z[0]) <= 20 && Math.abs(Z[1]) <= 20; });
  }
  /* right angle at a vertex: V, legs u and s·rot(u) */
  function rightTri(r, uList, sList, lim) {
    return pickWhere(function () {
      var u = sgn(r, r.pick(uList)), s = r.pick(sList), w = scl(rot(u, r.chance(0.5) ? 1 : -1), s), V = [r.int(-6, 6), r.int(-6, 6)];
      return { V: V, U: add(V, u), W: add(V, w) };
    }, function (o) { return [o.V, o.U, o.W].every(function (p) { return Math.abs(p[0]) <= lim && Math.abs(p[1]) <= lim; }); });
  }

  /* ======================================================================================== */
  HW.defineLesson({
    id: 'u6l2', unit: 6, num: '2', title: 'Extension: The Distance and Midpoint Formulas', outcome: 'EXT',
    blurb: 'The distance formula (the Pythagorean theorem on a coordinate grid) and the midpoint formula (average the coordinates): exact and rounded lengths, collinear points and right angles, midpoints, missing endpoints, and both formulas in context.',
    questions: [
      /* ---------------- Question 1: distance (whole-number answers) ---------------- */
      { num: '1', section: 'Distance between two points', stem: 'Determine the distance between each pair of points.', parts: [
        { id: '1a', level: 'BEG', make: function (r) {
          var A, L;
          if (r.chance(0.15)) { A = [1, -3]; L = [8, 6]; } else { L = triple(r, 12); A = [r.int(-3, 5), r.int(-6, -1)]; }
          var Bp = add(A, L), D = Math.sqrt(d2(A, Bp));
          return B.number(t(nm('A', A)) + ' and ' + t(nm('B', Bp)), D, matchDiag(dCands(A, Bp)), dSteps(A, Bp) + '<br>' + t(dLine(A, Bp, 'AB') + simpTail(d2(A, Bp))) + '.', HD, 'distance ' + ptT(A) + ' to ' + ptT(Bp));
        } },
        { id: '1b', level: 'BEG', make: function (r) {
          var C, L;
          if (r.chance(0.15)) { C = [-1, 4]; L = [12, 5]; } else { L = triple(r, 15); C = [r.int(-6, -1), r.int(1, 6)]; }
          var D2 = add(C, L), D = Math.sqrt(d2(C, D2));
          var p = B.number(t(nm('C', C)) + ' and ' + t(nm('D', D2)), D, matchDiag(dCands(C, D2)), dSteps(C, D2) + '<br>' + t(dLine(C, D2, 'CD') + simpTail(d2(C, D2))) + '.', HD, 'distance ' + ptT(C) + ' to ' + ptT(D2));
          return p;
        } }] },
      /* ---------------- Question 2: distance to the nearest hundredth ---------------- */
      { num: '2', stem: 'Determine the distance, to the nearest hundredth, between each pair of points.', parts: [
        { id: '2a', level: 'BEG', make: function (r) {
          var o = r.chance(0.15) ? { P: [5, -1], Q: [-3, 6] } : pickWhere(function () { return { P: [r.int(2, 7), r.int(-5, -1)], Q: [r.int(-6, -1), r.int(2, 8)] }; }, function (z) { return !isSq(d2(z.P, z.Q)); });
          var D = dist(o.P, o.Q);
          return B.approx(t(nm('P', o.P)) + ' and ' + t(nm('Q', o.Q)), D, 2, { diag: matchDiag(dCands(o.P, o.Q), 2) }, dSteps(o.P, o.Q) + '<br>' + t(dLine(o.P, o.Q, 'PQ') + '\\approx ' + fx(D, 2)) + '.', HD, 'distance ' + ptT(o.P) + ' to ' + ptT(o.Q) + ' (2 dp)');
        } },
        { id: '2b', level: 'EMG', make: function (r) {
          var o = r.chance(0.15) ? { R: [-4.5, 7.2], S: [-6.1, -3.6] } : pickWhere(function () { return { R: [-r.int(10, 80) / 10, r.int(20, 90) / 10], S: [-r.int(10, 80) / 10, -r.int(10, 60) / 10] }; },
            function (z) { return Math.abs(z.R[0] - z.S[0]) >= 0.5 && z.R[0] % 1 !== 0 && z.S[0] % 1 !== 0 && z.R[1] % 1 !== 0 && z.S[1] % 1 !== 0; });
          var D = dist(o.R, o.S);
          return B.approx(t(nm('R', o.R)) + ' and ' + t(nm('S', o.S)), D, 2, { diag: matchDiag(dCands(o.R, o.S), 2) }, dSteps(o.R, o.S) + '<br>' + t(dLine(o.R, o.S, 'RS') + '\\approx ' + fx(D, 2)) + '.', HD, 'distance ' + ptT(o.R) + ' to ' + ptT(o.S) + ' (decimals)');
        } }] },
      /* ---------------- Question 3: exact distance, simplest radical form ---------------- */
      { num: '3', stem: 'Determine the exact distance between each pair of points. Answer in simplest radical form.', parts: [
        { id: '3a', level: 'PRG', make: function (r) {
          var o = r.chance(0.15) ? { E: [1, -1], L: [6, 2] } : pickWhere(function () { return { E: [r.int(-2, 4), r.int(-5, -1)], L: [r.int(2, 8), r.int(1, 6)] }; }, function (z) { var n = z.L[0] * z.L[0] + z.L[1] * z.L[1], q = radParts(n); return q.k >= 2 && q.m > 1; });
          var E = o.E, Fp = add(E, o.L), n = d2(E, Fp), s = lenSpec(n);
          return B.radical(t(nm('E', E)) + ' and ' + t(nm('F', Fp)), { k: s.k, n: 2, m: s.m }, 'mixed', dSteps(E, Fp) + '<br>' + t(dLine(E, Fp, 'EF') + simpTail(n)) + '.', HD.concat(['To simplify ' + t('\\sqrt{' + n + '}') + ', look for the largest perfect-square factor of ' + t(n) + '.']), 'exact distance ' + ptT(E) + ' to ' + ptT(Fp), { diag: matchDiag(dCands(E, Fp)) });
        } },
        { id: '3b', level: 'ADV', make: function (r) {
          var PQ = [[5, 5], [1, 7], [7, 1], [3, 3], [3, 9], [9, 3], [7, 7], [5, 1]], o = r.chance(0.2) ? { a: 1, b: 1, p: 5, q: 5 } : pickWhere(function () { var pq = r.pick(PQ); return { a: r.pick([1, 3, 5]), b: r.pick([1, 3, 5]), p: pq[0], q: pq[1] }; }, function (z) { return z.p !== z.a && radParts(z.p * z.p + z.q * z.q).k >= 2; });
          var Kp = [-o.a / 2, o.b / 2], Lp = [(o.p - o.a) / 2, (o.q + o.b) / 2], n = o.p * o.p + o.q * o.q, s = lenSpec(n, 2);
          var kT = function (v) { return Number.isInteger(v) ? String(v) : (v < 0 ? '-' : '') + '\\dfrac{' + Math.abs(v * 2) + '}{2}'; };
          var pr = t('K\\!\\left(' + kT(Kp[0]) + ',\\ ' + kT(Kp[1]) + '\\right)') + ' and ' + t('L(' + kT(Lp[0]) + ',\\ ' + kT(Lp[1]) + ')');
          var sol = t('x_2-x_1=' + kT(Lp[0]) + '-\\left(' + kT(Kp[0]) + '\\right)=\\tfrac{' + o.p + '}{2}') + ', &nbsp;' + t('y_2-y_1=' + kT(Lp[1]) + '-' + kT(Kp[1]) + '=\\tfrac{' + o.q + '}{2}') + '.<br>' +
            t('KL=\\sqrt{\\left(\\tfrac{' + o.p + '}{2}\\right)^{2}+\\left(\\tfrac{' + o.q + '}{2}\\right)^{2}}=\\sqrt{\\tfrac{' + o.p * o.p + '}{4}+\\tfrac{' + o.q * o.q + '}{4}}=\\sqrt{\\tfrac{' + n + '}{4}}=\\dfrac{\\sqrt{' + n + '}}{2}=' + lenTex(n, 2)) + '.';
          var wrongs = [[n / 4, 'd-no-root', 'That is ' + t('d^{2}') + ' — take the square root.'], [Math.sqrt(n), 'd-half', 'Remember the ' + t('\\tfrac{1}{2}') + 's: ' + t('\\sqrt{\\tfrac{' + n + '}{4}}=\\dfrac{\\sqrt{' + n + '}}{\\sqrt{4}}=\\dfrac{\\sqrt{' + n + '}}{2}') + '.'], [Math.sqrt(n) / 4, 'd-half', t('\\sqrt{4}=2') + ', so ' + t('\\sqrt{\\tfrac{' + n + '}{4}}=\\dfrac{\\sqrt{' + n + '}}{2}') + ' (not ' + t('\\div 4') + ').']];
          var p = B.radical(pr, { k: s.k, n: 2, m: s.m }, 'mixed', sol, HD.concat(['Square each fraction: ' + t('\\left(\\tfrac{5}{2}\\right)^{2}=\\tfrac{25}{4}') + '. Then ' + t('\\sqrt{\\tfrac{a}{4}}=\\tfrac{\\sqrt{a}}{2}') + '.']), 'exact distance with halves', { diag: matchDiag(wrongs) });
          p.good = ['\\frac{' + s.k[0] + '}{' + s.k[1] + '}\\sqrt{' + s.m + '}']; p.bad = ['\\sqrt{' + n + '}', '\\frac{\\sqrt{' + n + '}}{4}'];
          return p;
        } }] },
      /* ---------------- Question 4: collinear points ---------------- */
      { num: '4', shared: q4shared,
        stem: function (o) { var Y = add(o.X, scl(o.v, o.a)), Z = add(Y, scl(o.v, o.b)); return 'Consider the points ' + t(nm('X', o.X)) + ', ' + t(nm('Y', Y)) + ', and ' + t(nm('Z', Z)) + '.'; },
        parts: [
          { id: '4a', sub: 'a', level: 'PRG', make: function (r, o) {
            var X = o.X, Y = add(X, scl(o.v, o.a)), Z = add(Y, scl(o.v, o.b)), n = [d2(X, Y), d2(Y, Z), d2(X, Z)];
            var sol = [['XY', X, Y], ['YZ', Y, Z], ['XZ', X, Z]].map(function (s, i) { return t(dLine(s[1], s[2], s[0]) + simpTail(n[i])); }).join('<br>');
            return B.fields('Calculate the exact lengths of ' + t('XY') + ', ' + t('YZ') + ', and ' + t('XZ') + ' (simplest radical form).', [lenField('XY'), lenField('YZ'), lenField('XZ')],
              [lenCheck(n[0], 1, { cands: dCands(X, Y) }), lenCheck(n[1], 1, { cands: dCands(Y, Z) }), lenCheck(n[2], 1, { cands: dCands(X, Z) })], n.map(function (x) { return lenKey(x); }),
              t('XY=' + lenTex(n[0]) + ',\\ YZ=' + lenTex(n[1]) + ',\\ XZ=' + lenTex(n[2])), sol, HD.concat(['Simplify each radical — then the three lengths are easy to compare.']), 'collinear lengths');
          } },
          { id: '4a2', sub: 'a, notice', level: 'EMG', make: function (r, o) {
            var c = o.v[0] * o.v[0] + o.v[1] * o.v[1], a = o.a, b = o.b, rt = '\\sqrt{' + c + '}', L = function (k) { return (k === 1 ? '' : k) + rt; };
            return mcPart(r, 'You found ' + t('XY=' + L(a) + ',\\ YZ=' + L(b) + ',\\ XZ=' + L(a + b)) + '. What do you notice?', [
              { html: t('XY+YZ=XZ') + ': ' + t(L(a) + '+' + L(b) + '=' + L(a + b)) + '.', right: true },
              { html: t('XY=YZ') + '.', why: 'Compare them: ' + t('XY=' + L(a)) + ' but ' + t('YZ=' + L(b)) + '.' },
              { html: t('XY^{2}+YZ^{2}=XZ^{2}') + '.', why: 'Check: ' + t(a * a * c + '+' + b * b * c + '=' + (a * a + b * b) * c) + ', but ' + t('XZ^{2}=' + (a + b) * (a + b) * c) + '.' },
              { html: t('XY\\times YZ=XZ') + '.', why: 'Check: ' + t(L(a) + '\\times ' + L(b) + '=' + a * b * c) + ', not ' + t(L(a + b)) + '.' }],
              'Like radicals add: ' + t(L(a) + '+' + L(b) + '=' + L(a + b)) + ', so ' + t('XY+YZ=XZ') + '.', ['Try adding two of the lengths.'], 'XY + YZ = XZ');
          } },
          { id: '4b', sub: 'b', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'What does ' + t('XY+YZ=XZ') + ' mean with regard to the points ' + t('X') + ', ' + t('Y') + ', and ' + t('Z') + '?', [
              { html: 'The points are <b>collinear</b>: ' + t('Y') + ' lies on segment ' + t('XZ') + ', between ' + t('X') + ' and ' + t('Z') + '.', right: true },
              { html: t('XYZ') + ' is a right triangle with the right angle at ' + t('Y') + '.', why: 'A right angle at ' + t('Y') + ' would need ' + t('XY^{2}+YZ^{2}=XZ^{2}') + '. Here the trip ' + t('X\\to Y\\to Z') + ' is exactly as long as going straight from ' + t('X') + ' to ' + t('Z') + ', so there is no bend at ' + t('Y') + ' at all.' },
              { html: t('Y') + ' is the midpoint of ' + t('\\overline{XZ}') + '.', why: 'The midpoint would need ' + t('XY=YZ') + ' — here they are different.' },
              { html: 'The three points form an isosceles triangle.', why: 'There is no triangle: going via ' + t('Y') + ' adds no extra distance, so ' + t('Y') + ' is on the straight path from ' + t('X') + ' to ' + t('Z') + '.' }],
              'Travelling ' + t('X\\to Y\\to Z') + ' covers exactly the same distance as going straight from ' + t('X') + ' to ' + t('Z') + ', so there is no bend at ' + t('Y') + ': the points are <b>collinear</b>, with ' + t('Y') + ' on segment ' + t('XZ') + '.',
              ['If going through ' + t('Y') + ' is no longer than the straight path, where must ' + t('Y') + ' be?'], 'XY+YZ=XZ means collinear');
          } }] },
      /* ---------------- Question 5: prove a right angle ---------------- */
      { num: '5', shared: function (r) {
          if (r.chance(0.15)) return { A: [5, -1], B: [3, 5], C: [9, 7] };
          var o = pickWhere(function () { return rightTri(r, [[2, 6], [6, 2], [2, 4], [4, 2], [3, 3], [2, 2], [4, 4], [3, 6], [6, 3], [4, 6], [6, 4]], [1, 1, 2], 12); },
            function (z) { var n = d2(z.V, z.U), m = d2(z.V, z.W), h = d2(z.U, z.W); return !isSq(h) && radParts(h).k >= 2 && !isSq(m); });
          return { A: o.U, B: o.V, C: o.W };
        },
        stem: function (o) { return t('A') + ' is the point ' + t(ptT(o.A)) + ', ' + t('B') + ' is ' + t(ptT(o.B)) + ', and ' + t('C') + ' is ' + t(ptT(o.C)) + '.'; },
        parts: [
          { id: '5a', sub: 'a', level: 'PRG', make: function (r, o) {
            var n = [d2(o.A, o.B), d2(o.B, o.C), d2(o.A, o.C)];
            var sol = [['AB', o.A, o.B], ['BC', o.B, o.C], ['AC', o.A, o.C]].map(function (s, i) { return t(dLine(s[1], s[2], s[0]) + simpTail(n[i])); }).join('<br>');
            return B.fields('Calculate the exact lengths of ' + t('AB') + ', ' + t('BC') + ', and ' + t('AC') + ', in simplest radical form.', [lenField('AB'), lenField('BC'), lenField('AC')],
              [lenCheck(n[0], 1, { cands: dCands(o.A, o.B) }), lenCheck(n[1], 1, { cands: dCands(o.B, o.C) }), lenCheck(n[2], 1, { cands: dCands(o.A, o.C) })], n.map(function (x) { return lenKey(x); }),
              t('AB=' + lenTex(n[0]) + ',\\ BC=' + lenTex(n[1]) + ',\\ AC=' + lenTex(n[2])), sol, HD, 'right-angle lengths');
          } },
          { id: '5b', sub: 'b', level: 'EMG', make: function (r, o) {
            var n = [d2(o.A, o.B), d2(o.B, o.C), d2(o.A, o.C)], L = n.map(function (x) { return lenTex(x); });
            var opts = [
              { html: t('AB^{2}+BC^{2}=' + n[0] + '+' + n[1] + '=' + (n[0] + n[1]) + '=AC^{2}') + ', so by the converse of the Pythagorean theorem the right angle is opposite ' + t('AC') + ', at ' + t('B') + '.', right: true },
              { html: t('AB+BC>AC') + ', so ' + t('\\angle ABC') + ' is a right angle.', why: 'Two sides of <i>every</i> triangle add to more than the third side — that says nothing about a right angle. Compare the <b>squares</b> of the sides.' },
              { html: t('AC') + ' is the longest side, so the angle opposite it must be ' + t('90^{\\circ}') + '.', why: 'Every triangle has a longest side, but most have no right angle. You have to show ' + t('AB^{2}+BC^{2}=AC^{2}') + '.' },
              n[0] === n[1] ? { html: t('AB=BC') + ', so ' + t('\\angle ABC=90^{\\circ}') + '.', why: 'Two equal sides make the triangle isosceles, not necessarily right-angled. Test ' + t('AB^{2}+BC^{2}=AC^{2}') + '.' }
                : { html: t('AB^{2}+AC^{2}=BC^{2}') + ', so ' + t('\\angle ABC') + ' is a right angle.', why: 'Check: ' + t('AB^{2}+AC^{2}=' + n[0] + '+' + n[2] + '=' + (n[0] + n[2])) + ', but ' + t('BC^{2}=' + n[1]) + '. The hypotenuse is the longest side, ' + t('AC') + '.' }];
            return mcPart(r, 'Which argument uses your answers to (a) to prove that ' + t('\\angle ABC') + ' is a right angle?', opts,
              t('AC') + ' is the longest side, so it is the candidate hypotenuse. ' + t('AB^{2}+BC^{2}=(' + L[0] + ')^{2}+(' + L[1] + ')^{2}=' + n[0] + '+' + n[1] + '=' + (n[0] + n[1])) + ' and ' + t('AC^{2}=(' + L[2] + ')^{2}=' + n[2]) + '. They are equal, so by the converse of the Pythagorean theorem the right angle is opposite ' + t('AC') + ', at vertex ' + t('B') + '.',
              ['The converse of the Pythagorean theorem: if ' + t('a^{2}+b^{2}=c^{2}') + ' for the sides of a triangle, the angle opposite ' + t('c') + ' is ' + t('90^{\\circ}') + '.'], 'prove angle ABC is right');
          } }] },
      /* ---------------- Question 6: ultimate frisbee ---------------- */
      { num: '6', section: 'Distance in context', shared: function (r) {
          if (r.chance(0.15)) return { T: [12, 20], C: [33, 40] };
          return pickWhere(function () { var T = [r.int(5, 20), r.int(10, 40)]; return { T: T, C: [r.int(T[0] + 6, 36), T[1] + r.int(8, 40)] }; }, function (z) { return z.T[0] !== z.T[1] && z.C[0] !== z.C[1]; });
        },
        stem: function (o) {
          return 'In an ultimate frisbee game, a player releases a throw from a spot ' + t(o.T[1]) + '&nbsp;m from the back line and ' + t(o.T[0]) + '&nbsp;m from the left sideline. A teammate catches the disc at a spot ' + t(o.C[0]) + '&nbsp;m from the left sideline and ' + t(o.C[1]) + '&nbsp;m from the back line. The first quadrant of a coordinate grid is superimposed on the field, with the origin at the corner where the back line meets the left sideline.' +
            FIELD;
        },
        parts: [
          { id: '6a', sub: 'a', level: 'EMG', make: function (r, o) {
            var sw = 'Careful: the ' + t('x') + '-axis runs along the back line, so an ' + t('x') + '-coordinate is the distance from the <b>left sideline</b>; a ' + t('y') + '-coordinate is the distance from the <b>back line</b>.';
            return B.fields('State the coordinates of the thrower and of the receiver with respect to this origin.', [ptField('Thrower'), ptField('Receiver')],
              [ptCheck(o.T, { swapHint: sw }), ptCheck(o.C, { swapHint: sw })], [ptKey(o.T), ptKey(o.C)], 'Thrower ' + t(ptT(o.T)) + ', receiver ' + t(ptT(o.C)),
              'The ' + t('x') + '-axis runs along the back line, so ' + t('x') + ' measures the distance from the left sideline; the ' + t('y') + '-axis runs along the sideline, so ' + t('y') + ' measures the distance from the back line.<br>Thrower: ' + t(o.T[0]) + '&nbsp;m from the sideline, ' + t(o.T[1]) + '&nbsp;m from the back line ' + t('\\Rightarrow ' + ptT(o.T)) + '.<br>Receiver: ' + t(o.C[0]) + '&nbsp;m from the sideline, ' + t(o.C[1]) + '&nbsp;m from the back line ' + t('\\Rightarrow ' + ptT(o.C)) + '.',
              ['Which line does the ' + t('x') + '-axis run along? A point’s ' + t('x') + '-coordinate is how far it is from the ' + t('y') + '-axis.'], 'frisbee coordinates');
          } },
          { id: '6b', sub: 'b', level: 'EMG', make: function (r, o) {
            var D = dist(o.T, o.C), dx = o.C[0] - o.T[0], dy = o.C[1] - o.T[1];
            return B.approx('Determine the length of the throw, to the nearest metre.', D, 0, { after: 'm', diag: matchDiag(dCands(o.T, o.C).concat([[dist([o.T[1], o.T[0]], o.C), 'ctx-swap', 'Check the thrower’s coordinates: ' + t('x') + ' is the distance from the sideline, so the thrower is at ' + t(ptT(o.T)) + '.']]), 0) },
              t('x_2-x_1=' + o.C[0] + '-' + o.T[0] + '=' + dx) + ', ' + t('y_2-y_1=' + o.C[1] + '-' + o.T[1] + '=' + dy) + '.<br>' + t('d=\\sqrt{' + dx + '^{2}+' + dy + '^{2}}=\\sqrt{' + (dx * dx) + '+' + (dy * dy) + '}=\\sqrt{' + (dx * dx + dy * dy) + '}' + (isSq(dx * dx + dy * dy) ? '=' + D : '\\approx ' + fx(D, 2))) + '. The throw is about ' + t(fx(D, 0)) + '&nbsp;m long.',
              HD, 'frisbee throw length');
          } }] },
      /* ---------------- Question 7: Maria and Nathan ---------------- */
      { num: '7', shared: function (r) {
          if (r.chance(0.15)) return { m: [5, 8], n: [7, 4], L: 110 };
          return pickWhere(function () { return { m: [r.int(2, 9), r.int(2, 9)], n: [r.int(2, 9), r.int(2, 9)], L: r.pick([110, 110, 80, 90, 100, 120, 150]) }; }, function (z) { return z.m[0] !== z.m[1] && z.n[0] !== z.n[1] && (z.m[0] !== z.n[0] || z.m[1] !== z.n[1]); });
        },
        stem: function (o) { return 'After school, Maria walks ' + t(o.m[0]) + ' blocks east and ' + t(o.m[1]) + ' blocks north to reach her house from the school. Nathan walks ' + t(o.n[0]) + ' blocks west and ' + t(o.n[1]) + ' blocks south to reach his house from the same school.'; },
        parts: [
          { id: '7a', sub: 'a', level: 'BEG', make: function (r, o) {
            var M = o.m, N = [-o.n[0], -o.n[1]];
            return B.fields('Taking the school as the origin, list the coordinates of each house.', [ptField('Maria'), ptField('Nathan')],
              [ptCheck(M, { swapHint: 'East–west distances are ' + t('x') + '-coordinates and north–south distances are ' + t('y') + '-coordinates: write (east, north).' }),
                ptCheck(N, { cands: [[o.n, 'pt-dir', 'West is the <b>negative</b> ' + t('x') + '-direction and south is the <b>negative</b> ' + t('y') + '-direction.'], [[-o.n[0], o.n[1]], 'pt-dir', 'South is the negative ' + t('y') + '-direction.'], [[o.n[0], -o.n[1]], 'pt-dir', 'West is the negative ' + t('x') + '-direction.'], [[-o.n[1], -o.n[0]], 'pt-swap', 'Write (east–west, north–south): the blocks west give the ' + t('x') + '-coordinate.']] })],
              [ptKey(M), ptKey(N)], 'Maria ' + t(ptT(M)) + ', Nathan ' + t(ptT(N)),
              'East is ' + t('+x') + ' and north is ' + t('+y') + ', with the school at the origin; west and south are negative.<br>Maria: ' + t(o.m[0]) + ' east, ' + t(o.m[1]) + ' north ' + t('\\Rightarrow ' + ptT(M)) + '. Nathan: ' + t(o.n[0]) + ' west, ' + t(o.n[1]) + ' south ' + t('\\Rightarrow ' + ptT(N)) + '.',
              ['East and north are positive; west and south are negative.'], 'house coordinates');
          } },
          { id: '7b', sub: 'b', level: 'PRG', make: function (r, o) {
            var M = o.m, N = [-o.n[0], -o.n[1]], nb = d2(M, N), Db = Math.sqrt(nb), D = Db * o.L, dx = M[0] - N[0], dy = M[1] - N[1];
            var c = [[Db, 'd-units', 'That is the distance in <b>blocks</b>. Multiply by ' + t(o.L) + ' to get metres.'], [(o.m[0] + o.m[1] + o.n[0] + o.n[1]) * o.L, 'd-walk', 'That is how far the two walk along the streets. The <b>direct</b> distance is a straight line between the houses — use the distance formula.'],
              [Math.sqrt(sq(o.m[0] - o.n[0]) + sq(o.m[1] - o.n[1])) * o.L, 'd-no-neg', 'Nathan’s house has negative coordinates, ' + t(ptT(N)) + '. Then ' + t('x_2-x_1=' + M[0] + '-(' + N[0] + ')=' + dx) + '.'], [nb * o.L, 'd-no-root', 'Take the square root before converting to metres.']].concat(dCands(N, M, o.L));
            return B.approx('If a block represents ' + t(o.L) + '&nbsp;metres, determine the direct distance, to the nearest metre, between the two houses.', D, 0, { after: 'm', diag: matchDiag(c, 0) },
              t('x_2-x_1=' + M[0] + '-(' + N[0] + ')=' + dx) + ', ' + t('y_2-y_1=' + M[1] + '-(' + N[1] + ')=' + dy) + '.<br>' + t('d=\\sqrt{' + dx + '^{2}+' + dy + '^{2}}=\\sqrt{' + nb + '}' + simpTail(nb) + (isSq(nb) ? '' : '\\approx ' + fx(Db, 4))) + ' blocks.<br>Each block is ' + t(o.L) + '&nbsp;m: ' + t((isSq(nb) ? nT(Db) + '\\times ' + o.L + '=' : fx(Db, 4) + '\\times ' + o.L + '\\approx ') + fx(D, 0)) + '&nbsp;m.',
              ['Find the distance in blocks with the distance formula, then multiply by the length of one block.', 'Round only at the very end.'], 'direct distance between houses');
          } }] },
      /* ---------------- Question 8: bush plane ---------------- */
      { num: '8', shared: function (r) {
          if (r.chance(0.15)) return { pts: [[0, 140], [255, 195], [300, 160], [410, 205], [495, 165]] };
          return pickWhere(function () {
            var y0 = 5 * r.int(20, 36), xs = [0, 5 * r.int(40, 54), 5 * r.int(6, 12), 5 * r.int(16, 24), 5 * r.int(12, 20)], dy = [5 * r.int(5, 12), -5 * r.int(5, 10), 5 * r.int(5, 12), -5 * r.int(5, 10)];
            var pts = [[0, y0]]; for (var i = 1; i < 5; i++) pts.push([pts[i - 1][0] + xs[i], pts[i - 1][1] + dy[i - 1]]);
            return { pts: pts };
          }, function (z) { return z.pts.every(function (p) { return p[1] >= 60 && p[1] <= 240 && p[0] <= 520; }); });
        },
        stem: function (o) {
          var N = ['A', 'B', 'C', 'D', 'E'];
          return 'A bush plane on a survey flight records GPS checkpoints along its route. The graph shows part of the route (distances in km east and north of the airstrip it took off from): ' + o.pts.map(function (p, i) { return t(nm(N[i], p)); }).join(', ') + '.' +
            '<div class="fig">' + HW.graph({ x: [0, 550], y: [0, 250], grid: 50, labelsX: 100, labelsY: 50, unit: 0.6, firstQuadrant: true, xTitle: 'Distance (km) east of airstrip', yTitle: 'km north', max: 380,
              segs: [{ pts: o.pts, start: 'closed', end: 'closed' }], points: o.pts.map(function (p, i) { return { x: p[0], y: p[1], label: N[i] }; }) }) + '</div>';
        },
        parts: [
          { id: '8a', sub: 'a', level: 'LIM', make: function (r, o) {
            var y = o.pts[0][1];
            return mcPart(r, 'Describe the position of checkpoint ' + t('A') + ' relative to the airstrip.', [
              { html: t(y) + '&nbsp;km due north of the airstrip.', right: true },
              { html: t(y) + '&nbsp;km due east of the airstrip.', why: 'The first coordinate is the distance east. ' + t('A') + '’s first coordinate is ' + t('0') + ', so it is not east of the airstrip at all.' },
              { html: t(y) + '&nbsp;km north-east of the airstrip.', why: 'North-east would need a positive east coordinate too. ' + t('A') + ' is ' + t('0') + '&nbsp;km east.' },
              { html: 'At the airstrip.', why: 'The airstrip is the origin ' + t('(0,\\ 0)') + '. ' + t('A') + ' is ' + t(y) + '&nbsp;km north of it.' }],
              t(nm('A', o.pts[0])) + ': its east-coordinate is ' + t('0') + ' and its north-coordinate is ' + t(y) + ', so checkpoint ' + t('A') + ' is ' + t(y) + '&nbsp;km <b>due north</b> of the airstrip.', ['The first coordinate is km east, the second is km north.'], 'position of checkpoint A');
          } },
          { id: '8b', sub: 'b', level: 'PRG', make: function (r, o) {
            var N = ['A', 'B', 'C', 'D', 'E'], segs = [], tot = 0, totR = 0;
            for (var i = 0; i < 4; i++) { var dd = dist(o.pts[i], o.pts[i + 1]); segs.push(dd); tot += dd; totR += rd(dd, 0); }
            var straight = dist(o.pts[0], o.pts[4]), hv = 0; for (var j = 0; j < 4; j++) hv += Math.abs(o.pts[j + 1][0] - o.pts[j][0]) + Math.abs(o.pts[j + 1][1] - o.pts[j][1]);
            var c = [[straight, 'd-straight', 'That is the straight-line distance from ' + t('A') + ' to ' + t('E') + '. The plane flew along four segments: find each length and add them.'], [hv, 'd-legs', 'You added the east and north changes. Each segment is a hypotenuse: use the distance formula for each one.']];
            if (Math.abs(rd(totR, 0) - rd(tot, 0)) > 0.5) c.push([totR, 'd-round-early', 'Close — you rounded each segment before adding. Keep the decimals and round only the total.']);
            c.push([segs[0], 'd-straight', 'That is only ' + t('AB') + '. Add all four segments.']);
            var sol = 'Add the four segment lengths.<br>' + segs.map(function (s, k) { var a = o.pts[k], b2 = o.pts[k + 1], dx = b2[0] - a[0], dy = b2[1] - a[1]; return t(N[k] + N[k + 1] + '=\\sqrt{' + sgp(dx) + '^{2}+' + sgp(dy) + '^{2}}=\\sqrt{' + F(dx * dx + dy * dy) + '}\\approx ' + fx(s, 2)); }).join('<br>') + '<br>Total ' + t('\\approx ' + segs.map(function (s) { return fx(s, 2); }).join('+') + '\\approx ' + fx(tot, 0)) + '&nbsp;km.';
            return B.approx('Calculate the total distance flown by the plane from ' + t('A') + ' to ' + t('E') + ', to the nearest kilometre.', tot, 0, { after: 'km', diag: matchDiag(c, 0) }, sol,
              ['The route is made of four straight segments: ' + t('AB') + ', ' + t('BC') + ', ' + t('CD') + ' and ' + t('DE') + '. Use the distance formula for each.', 'Keep the decimals until you have added all four, then round.'], 'total distance flown');
          } }] },
      /* ---------------- Question 9: MC distance ---------------- */
      { num: '9', section: 'Multiple choice', parts: [
        { id: '9', level: 'LIM', make: function (r) {
          var P0, L;
          if (r.chance(0.2)) { P0 = [3, -2]; L = [4, 3]; } else { L = triple(r, 8); P0 = [r.int(1, 6), r.int(-5, -1)]; }
          var Q = add(P0, L), dx = L[0], dy = L[1], D = Math.sqrt(dx * dx + dy * dy);
          return mcPart(r, '<i>(Multiple Choice)</i> The distance between the points ' + t(ptT(P0)) + ' and ' + t(ptT(Q)) + ' is', [
            { html: t(D), right: true },
            { html: t('\\sqrt{' + dx * dy + '}'), why: 'That multiplies the run by the rise. Square each one and add: ' + t('\\sqrt{' + dx + '^{2}+' + dy + '^{2}}') + '.' },
            { html: t(dx + dy), why: 'That adds the run and the rise. The distance is the hypotenuse: ' + t('\\sqrt{' + dx + '^{2}+' + dy + '^{2}}') + '.' },
            { html: t(dx * dx + dy * dy), why: 'That is ' + t('d^{2}') + '. Take the square root.' }],
            dSteps(P0, Q) + '<br>' + t('d=\\sqrt{' + dx + '^{2}+' + dy + '^{2}}=\\sqrt{' + dx * dx + '+' + dy * dy + '}=\\sqrt{' + (dx * dx + dy * dy) + '}=' + D) + '.', HD, 'MC distance');
        } }] },
      /* ---------------- Question 10: MC equidistant point ---------------- */
      { num: '10', parts: [
        { id: '10', level: 'PRG', make: function (r) {
          var o = r.chance(0.2) ? { A: [-3, 8], B: [-7, -4], tt: -1, dis: [[0, 0], [6, 6], [-10, -10]] } : pickWhere(function () {
            var A = [r.int(-6, 0), r.int(3, 9)], h = [r.pick(pm(1, 3)), r.pick(pm(2, 6))];
            return { A: A, B: add(A, scl(h, 2)), tt: r.pick([1, -1, 2]) };
          }, function (z) { return Math.abs(z.B[1]) <= 12 && Math.abs(z.B[0]) <= 12; });
          var M = mid(o.A, o.B), h = sub(o.B, M), g = gcd(h[0], h[1]), pp = [h[1] / g, -h[0] / g], X = add(M, scl(pp, o.tt));
          var dis = o.dis || ([[0, 0]].filter(function (q) { return Math.abs(d2(q, o.A) - d2(q, o.B)) >= 4; }).concat(ptsOpt(r, o.A, o.B, 4))).filter(function (q, i, arr) { return !samePt(q, X) && !arr.slice(0, i).some(function (p) { return samePt(p, q); }); }).slice(0, 3);
          var opts = [{ html: t(ptT(X)), right: true }].concat(dis.map(function (q) { return { html: t(ptT(q)), why: eqWhy(q, o.A, 'A', o.B, 'B') + ' Equidistant means the two distances are equal.' }; }));
          return mcPart(r, '<i>(Multiple Choice)</i> Which of the following points is equidistant from ' + t(nm('A', o.A)) + ' and ' + t(nm('B', o.B)) + '?', opts,
            'Compare <b>squared</b> distances to ' + t('A') + ' and ' + t('B') + ' (equal squares mean equal distances).<br>' + t(ptT(X)) + ': ' + t('(' + nT(X[0]) + '-' + sgp(o.A[0]) + ')^{2}+(' + nT(X[1]) + '-' + sgp(o.A[1]) + ')^{2}=' + d2(X, o.A)) + ' and ' + t('(' + nT(X[0]) + '-' + sgp(o.B[0]) + ')^{2}+(' + nT(X[1]) + '-' + sgp(o.B[1]) + ')^{2}=' + d2(X, o.B)) + '. Equal ✓<br>' + dis.map(function (q) { return t(ptT(q)) + ': ' + t(d2(q, o.A)) + ' vs ' + t(d2(q, o.B)) + '.'; }).join(' &nbsp;'),
            ['Use the distance formula from each option to ' + t('A') + ' and to ' + t('B') + '. You can compare the squared distances — no square roots needed.'], 'MC equidistant point');
        } }] },
      /* ---------------- Question 11: midpoints ---------------- */
      { num: '11', section: 'Midpoints', stem: 'Determine the coordinates of the midpoint of the line segment with the given pair of endpoints.', parts: [
        { id: '11a', level: 'BEG', make: function (r) {
          var o = r.chance(0.15) ? { A: [3, 5], C: [9, 13] } : pickWhere(function () { var A = [r.int(1, 8), r.int(1, 8)]; return { A: A, C: [A[0] + 2 * r.int(1, 5), A[1] + 2 * r.int(1, 6)] }; }, function () { return true; });
          return ptPart(t(nm('A', o.A) + ',\\ ' + nm('C', o.C)), mid(o.A, o.C), { cands: midCands(o.A, o.C) }, t(mLine(o.A, o.C)) + '.', HM, 'midpoint ' + ptT(o.A) + ', ' + ptT(o.C));
        } },
        { id: '11b', level: 'EMG', make: function (r) {
          var o = r.chance(0.15) ? { X: [-4, -9], Y: [-12, 3] } : pickWhere(function () { var X = [-r.int(1, 8), -r.int(2, 10)]; return { X: X, Y: [-r.int(5, 14), r.int(1, 9)] }; }, function (z) { return (z.X[0] + z.Y[0]) % 2 === 0 && (z.X[1] + z.Y[1]) % 2 === 0 && z.X[0] !== z.Y[0] && z.X[1] + z.Y[1] !== 0; });
          return ptPart(t(nm('X', o.X) + ',\\ ' + nm('Y', o.Y)), mid(o.X, o.Y), { cands: midCands(o.X, o.Y) }, t(mLine(o.X, o.Y)) + '.', HM, 'midpoint ' + ptT(o.X) + ', ' + ptT(o.Y));
        } },
        { id: '11c', level: 'EMG', make: function (r) {
          var o = r.chance(0.15) ? { K: [11, -15], L: [-9, 7] } : pickWhere(function () { return { K: [r.int(5, 14), -r.int(5, 16)], L: [-r.int(3, 12), r.int(2, 10)] }; }, function (z) { var m = mid(z.K, z.L); return Number.isInteger(m[0]) && Number.isInteger(m[1]) && m[0] !== 0 && m[1] !== 0; });
          return ptPart(t(nm('K', o.K) + ',\\ ' + nm('L', o.L)), mid(o.K, o.L), { cands: midCands(o.K, o.L) }, t(mLine(o.K, o.L)) + '.', HM, 'midpoint ' + ptT(o.K) + ', ' + ptT(o.L));
        } },
        { id: '11d', level: 'BEG', make: function (r) {
          var A = r.chance(0.15) ? [-30, 42] : [-2 * r.int(6, 25), 2 * r.int(6, 25)], O = [0, 0];
          return ptPart(t(nm('A', A) + ',\\ ' + nm('O', O)), mid(A, O), { cands: midCands(A, O).filter(function (c) { return c[1] !== 'mid-subtract'; }) }, t(mLine(A, O)) + '.', HM, 'midpoint with the origin');
        } },
        { id: '11e', level: 'EMG', make: function (r) {
          var o = r.chance(0.15) ? { P: [-3.5, 4.2], Q: [2.5, -7.8] } : pickWhere(function () { return { P: [-r.int(1, 6) - 0.5, r.int(11, 89) / 10], Q: [r.int(0, 5) + 0.5, -r.int(11, 89) / 10] }; },
            function (z) { var sy = Math.round((z.P[1] + z.Q[1]) * 10); return sy % 2 === 0 && sy !== 0 && z.P[1] % 1 !== 0 && z.Q[1] % 1 !== 0 && Math.round(z.P[0] + z.Q[0]) % 2 !== 0; });
          var W = mid(o.P, o.Q), p = ptPart(t(nm('P', o.P) + ',\\ ' + nm('Q', o.Q)), W, { cands: midCands(o.P, o.Q) }, t(mLine(o.P, o.Q)) + '.', HM, 'midpoint with decimals');
          return p;
        } },
        { id: '11f', level: 'BEG', make: function (r) {
          var o = r.chance(0.15) ? { E: [-4, 9], F: [8, 3] } : pickWhere(function () { return { E: [-r.int(1, 8), r.int(3, 12)], F: [r.int(2, 12), r.int(1, 10)] }; }, function (z) { return (z.E[0] + z.F[0]) % 2 === 0 && (z.E[1] + z.F[1]) % 2 === 0 && z.E[1] !== z.F[1] && z.E[0] + z.F[0] !== 0; });
          return ptPart(t(nm('E', o.E) + ',\\ ' + nm('F', o.F)), mid(o.E, o.F), { cands: midCands(o.E, o.F) }, t(mLine(o.E, o.F)) + '.', HM, 'midpoint ' + ptT(o.E) + ', ' + ptT(o.F));
        } }] },
      /* ---------------- Question 12: find x ---------------- */
      { num: '12', stem: 'In each case, ' + t('M') + ' is the midpoint of ' + t('\\overline{AB}') + '. Determine the value of ' + t('x') + '.', parts: [
        { id: '12a', level: 'PRG', make: function (r) {
          var o = r.chance(0.15) ? { A: [3, 7], bx: 9, my: 2 } : pickWhere(function () { var A = [r.int(1, 6), r.int(4, 10)]; return { A: A, bx: A[0] + 2 * r.int(1, 4), my: r.int(-2, A[1] - 2) }; }, function (z) { var x = 2 * z.my - z.A[1]; return x !== 0 && x !== z.my && x !== z.A[1] && z.my !== 0; });
          var A = o.A, mx = (A[0] + o.bx) / 2, x = 2 * o.my - A[1];
          var c = endNum(A[1], o.my).concat([[o.bx, 'end-used-x', 'Here ' + t('x') + ' is the <b>' + t('y') + '-coordinate</b> of ' + t('B') + '. The ' + t('x') + '-coordinates already check out; use the ' + t('y') + '-coordinates: ' + t('\\dfrac{' + A[1] + '+x}{2}=' + o.my) + '.'], [2 * mx - A[0], 'end-used-x', 'Use the ' + t('y') + '-coordinates — the unknown ' + t('x') + ' sits in the ' + t('y') + '-position of ' + t('B') + '.']]);
          return B.number(t(nm('A', A) + ',\\ B(' + o.bx + ',\\ x),\\ ' + nm('M', [mx, o.my])), x, numDiag(c),
            'The ' + t('x') + '-coordinates already check out: ' + t('\\dfrac{' + A[0] + '+' + o.bx + '}{2}=' + nT(mx)) + ' ✓. Use the ' + t('y') + '-equation:<br>' + t('\\dfrac{' + A[1] + '+x}{2}=' + o.my + '\\ \\Rightarrow\\ ' + A[1] + '+x=' + 2 * o.my + '\\ \\Rightarrow\\ x=' + x) + '.', HE, 'missing coordinate (y-position)');
        } },
        { id: '12b', level: 'PRG', make: function (r) {
          var o = r.chance(0.15) ? { A: [5, 8], by: 0, mx: 0 } : pickWhere(function () { var A = [r.int(2, 9), 2 * r.int(1, 5)]; return { A: A, by: 2 * r.int(-2, 2), mx: r.pick([0, 0, -1, 1, 2, -2]) }; }, function (z) { var x = 2 * z.mx - z.A[0]; return x !== 0 && z.by !== z.A[1] && x !== z.A[0]; });
          var A = o.A, my = (A[1] + o.by) / 2, x = 2 * o.mx - A[0];
          var c = endNum(A[0], o.mx).concat([[2 * my - A[1], 'end-used-x', 'Use the ' + t('x') + '-coordinates here — the unknown is the ' + t('x') + '-coordinate of ' + t('B') + '.']]);
          return B.number(t(nm('A', A) + ',\\ B(x,\\ ' + o.by + '),\\ ' + nm('M', [o.mx, my])), x, numDiag(c),
            'The ' + t('y') + '-coordinates already check out: ' + t('\\dfrac{' + A[1] + '+' + sgp(o.by) + '}{2}=' + nT(my)) + ' ✓. Use the ' + t('x') + '-equation:<br>' + t('\\dfrac{' + A[0] + '+x}{2}=' + o.mx + '\\ \\Rightarrow\\ ' + A[0] + '+x=' + 2 * o.mx + '\\ \\Rightarrow\\ x=' + x) + '.', HE, 'missing coordinate (x-position)');
        } }] },
      /* ---------------- Question 13: cell tower ---------------- */
      { num: '13', section: 'Midpoint in context', shared: function (r) {
          if (r.chance(0.15)) return { A: [2148, 1876], B: [3562, 2394], s: 50 };
          return pickWhere(function () { var A = [r.int(1500, 3000), r.int(1200, 2500)]; return { A: A, B: [A[0] + r.int(800, 1800), A[1] + r.int(200, 900)], s: r.pick([50, 50, 25, 40, 20]) }; }, function (z) { return (z.A[0] + z.B[0]) % 2 === 0 && (z.A[1] + z.B[1]) % 2 === 0; });
        },
        stem: function (o) { return 'A cell tower is to be built halfway between the rural towns of Ashford and Birchwood, with a service road connecting both towns to the tower. On a Cartesian plane, Ashford is located at ' + t(ptT(o.A)) + ' and Birchwood is located at ' + t(ptT(o.B)) + '.'; },
        parts: [
          { id: '13a', sub: 'a', level: 'EMG', make: function (r, o) {
            return ptPart('What are the coordinates of the tower?', mid(o.A, o.B), { cands: midCands(o.A, o.B) }, 'The tower is the midpoint of Ashford and Birchwood:<br>' + t(mLine(o.A, o.B)) + '.', HM, 'tower midpoint');
          } },
          { id: '13b', sub: 'b', level: 'PRG', make: function (r, o) {
            var u = dist(o.A, o.B), km = u * o.s / 1000, dx = o.B[0] - o.A[0], dy = o.B[1] - o.A[1];
            var c = [[km / 2, 'road-half', 'The road connects <b>both</b> towns to the tower, so it runs the whole way from Ashford to Birchwood — not just to the halfway point.'], [u, 'd-units', 'That is the length in grid units. Multiply by ' + t(o.s) + '&nbsp;m per unit, then change metres to kilometres.'],
              [u * o.s, 'd-metres', 'That is in metres. Divide by ' + t('1000') + ' to get kilometres.'], [u / o.s, 'd-scale-div', 'Each unit is ' + t(o.s) + '&nbsp;m, so <b>multiply</b> the number of units by ' + t(o.s) + '.'], [u * o.s / 2000, 'road-half', 'The road runs from Ashford to the tower <i>and</i> on to Birchwood: that is the full distance.']];
            return B.approx('Determine the length of the service road, to the nearest kilometre, if the grid scale is 1 unit represents ' + t(o.s) + '&nbsp;metres.', km, 0, { after: 'km', diag: matchDiag(c, 0) },
              'The tower sits on the straight line between the towns, so the road’s total length is the distance from Ashford to Birchwood.<br>' + t('d=\\sqrt{' + F(dx) + '^{2}+' + F(dy) + '^{2}}=\\sqrt{' + F(dx * dx) + '+' + F(dy * dy) + '}=\\sqrt{' + F(dx * dx + dy * dy) + '}\\approx ' + fx(u, 1)) + ' units.<br>' + t(fx(u, 1) + '\\times ' + o.s + '\\approx ' + F(rd(u * o.s, 0))) + '&nbsp;m ' + t('\\approx ' + fx(km, 0)) + '&nbsp;km.',
              ['The road goes from one town to the tower and on to the other town — what total length is that?', 'Convert: units → metres (× the scale) → kilometres (÷ 1000).'], 'service road length');
          } }] },
      /* ---------------- Question 14: right triangle and the midpoint of its hypotenuse ---------------- */
      { num: '14', section: 'Distance and midpoint together', shared: function (r) {
          var o;
          if (r.chance(0.15)) o = { V: [-2, 3], U: [1, 7], W: [-10, 9], at: 'D' };
          else {
            var z = pickWhere(function () { return rightTri(r, [[3, 4], [4, 3], [4, 2], [2, 4], [3, 1], [1, 3], [2, 3], [3, 2], [6, 8], [8, 6]], [2, 2, 1, 3], 13); }, function (q) { return !isSq(d2(q.U, q.W)); });
            o = { V: z.V, U: z.U, W: z.W, at: r.pick(['D', 'D', 'E', 'F']) };
          }
          var pts = {}; // the right angle is at vertex o.at; the other two names in order
          var others = ['D', 'E', 'F'].filter(function (n) { return n !== o.at; });
          pts[o.at] = o.V; pts[others[0]] = o.U; pts[others[1]] = o.W;
          return { P: pts, R: o.at, H: others };
        },
        stem: function (o) { return 'Consider ' + t('\\triangle DEF') + ' with vertices ' + t(nm('D', o.P.D)) + ', ' + t(nm('E', o.P.E)) + ', ' + t(nm('F', o.P.F)) + '.'; },
        parts: [
          { id: '14a', sub: 'a', level: 'PRG', make: function (r, o) {
            var S = [['D', 'E'], ['D', 'F'], ['E', 'F']], n = S.map(function (s) { return d2(o.P[s[0]], o.P[s[1]]); });
            return B.fields('Calculate the length of each side of the triangle (exact, or to the nearest tenth).', S.map(function (s) { return lenField(s[0] + s[1]); }),
              S.map(function (s, i) { return lenCheck(n[i], 1, { dec: true, cands: dCands(o.P[s[0]], o.P[s[1]]) }); }), n.map(function (x) { return lenKey(x); }),
              S.map(function (s, i) { return t(s[0] + s[1] + '=' + lenTex(n[i]) + (isSq(n[i]) ? '' : '\\approx ' + fx(Math.sqrt(n[i]), 1))); }).join(', '),
              S.map(function (s, i) { return t(dLine(o.P[s[0]], o.P[s[1]], s[0] + s[1]) + simpTail(n[i])); }).join('<br>'), HD, 'side lengths of DEF');
          } },
          { id: '14a2', sub: 'a, why', level: 'EMG', make: function (r, o) {
            var R = o.R, h = o.H, hy = h[0] + h[1], l1 = (R < h[0] ? R + h[0] : h[0] + R), l2 = (R < h[1] ? R + h[1] : h[1] + R);
            var n1 = d2(o.P[R], o.P[h[0]]), n2 = d2(o.P[R], o.P[h[1]]), nh = d2(o.P[h[0]], o.P[h[1]]);
            var wrongV = h[0];
            return mcPart(r, 'Explain why the triangle is right angled.', [
              { html: t(l1 + '^{2}+' + l2 + '^{2}=' + n1 + '+' + n2 + '=' + nh + '=' + hy + '^{2}') + ', so by the converse of the Pythagorean theorem the triangle has a right angle at ' + t(R) + '.', right: true },
              { html: t(l1 + '^{2}+' + l2 + '^{2}=' + hy + '^{2}') + ', so the right angle is at ' + t(wrongV) + '.', why: 'The relationship is right, but the right angle is <b>opposite</b> the hypotenuse ' + t(hy) + ' — at the vertex the two shorter sides share, ' + t(R) + '.' },
              { html: 'The three sides have different lengths, so one angle must be ' + t('90^{\\circ}') + '.', why: 'Most triangles with three different sides have no right angle. Test whether the squares of the two shorter sides add to the square of the longest.' },
              { html: t(l1 + '+' + l2 + '>' + hy) + ', so the triangle is right angled.', why: 'That is true for every triangle. A right angle needs the <b>squares</b>: ' + t(l1 + '^{2}+' + l2 + '^{2}=' + hy + '^{2}') + '.' }],
              t(hy) + ' is the longest side. ' + t(l1 + '^{2}+' + l2 + '^{2}=' + n1 + '+' + n2 + '=' + nh) + ' and ' + t(hy + '^{2}=' + nh) + '. They match, so ' + t('\\triangle DEF') + ' is right angled at ' + t(R) + ' — the vertex opposite the longest side.',
              ['Use the converse of the Pythagorean theorem on your three lengths.'], 'why DEF is right angled');
          } },
          { id: '14b', sub: 'b', level: 'EMG', make: function (r, o) {
            var h = o.H, Pa = o.P[h[0]], Pb = o.P[h[1]], R = o.P[o.R], N = mid(Pa, Pb);
            var hs = 'That is the midpoint of a <b>leg</b>. The hypotenuse is the longest side, ' + t(h[0] + h[1]) + ', opposite the right angle.';
            var c = midCands(Pa, Pb).concat([[mid(R, Pa), 'mid-wrong-seg', hs], [mid(R, Pb), 'mid-wrong-seg', hs]]);
            var p = ptPart('Calculate the coordinates of the midpoint, ' + t('N') + ', of the hypotenuse.', N, { cands: c, before: 'N =' }, t(h[0] + h[1]) + ' is the hypotenuse, so ' + t('N') + ' is the midpoint of ' + t(nm(h[0], Pa)) + ' and ' + t(nm(h[1], Pb)) + ':<br>' + t(mLine(Pa, Pb, 'N')) + '.', HM, 'midpoint of the hypotenuse');
            if (!Number.isInteger(N[0]) || !Number.isInteger(N[1])) p.good.push('\\left(' + (Number.isInteger(N[0]) ? N[0] : '\\frac{' + N[0] * 2 + '}{2}') + ',' + (Number.isInteger(N[1]) ? N[1] : '\\frac{' + N[1] * 2 + '}{2}') + '\\right)');
            return p;
          } },
          { id: '14c', sub: 'c', level: 'ADV', make: function (r, o) {
            var h = o.H, N = mid(o.P[h[0]], o.P[h[1]]), nh = d2(o.P[h[0]], o.P[h[1]]), V = ['D', 'E', 'F'];
            var cands = [[nh / 4, 'd-no-root', 'That is the squared distance — take the square root.'], [Math.sqrt(nh), 'd-half', 'That is the whole hypotenuse. ' + t('N') + ' is its midpoint, so the distance from ' + t('N') + ' to an end is half of it.']];
            return B.fields('Calculate the distance from ' + t('N') + ' to each of the three vertices of the triangle (exact, or to the nearest tenth).', V.map(function (v) { return lenField('N' + v); }),
              V.map(function () { return lenCheck(nh, 2, { dec: true, cands: cands }); }), V.map(function () { return lenKey(nh, 2); }),
              t('ND=NE=NF=' + lenTex(nh, 2) + '\\approx ' + fx(Math.sqrt(nh) / 2, 1)),
              V.map(function (v) { var P2 = o.P[v], dx = cl(P2[0] - N[0]), dy = cl(P2[1] - N[1]); return t('N' + v + '=\\sqrt{' + sgp(dx) + '^{2}+' + sgp(dy) + '^{2}}=\\sqrt{' + nT(dx * dx) + '+' + nT(dy * dy) + '}=\\sqrt{' + nT(nh / 4) + '}'); }).join('<br>') + '<br>All three equal ' + t('\\sqrt{' + nT(nh / 4) + '}=\\sqrt{\\tfrac{' + nh + '}{4}}=' + lenTex(nh, 2) + '\\approx ' + fx(Math.sqrt(nh) / 2, 1)) + '.',
              HD.concat(['Use ' + t(nm('N', N)) + ' as one endpoint each time. With decimals, ' + t('2.5^{2}=6.25') + '.']), 'N to each vertex');
          } },
          { id: '14c2', sub: 'c, notice', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'What do you notice about the three distances from ' + t('N') + '?', [
              { html: 'They are equal: the midpoint of the hypotenuse is the same distance from all three vertices (half the hypotenuse).', right: true },
              { html: t('N') + ' is closest to the right-angle vertex ' + t(o.R) + '.', why: 'Compare your three answers — they are all the same.' },
              { html: 'They add up to the perimeter of the triangle.', why: 'Compare your three answers with each other: what do they have in common?' },
              { html: t('N') + ' is the same distance from only the two ends of the hypotenuse.', why: 'Check ' + t('N' + o.R) + ' as well — it matches the other two.' }],
              t('ND=NE=NF') + ': the midpoint of the hypotenuse is equidistant from all three vertices. (It is the centre of the circle through ' + t('D') + ', ' + t('E') + ' and ' + t('F') + ', and each distance is half the hypotenuse.)', ['Look at your three answers from (c).'], 'midpoint of hypotenuse equidistant');
          } }] },
      /* ---------------- Question 15: diagonals of a quadrilateral ---------------- */
      { num: '15', shared: function (r) {
          if (r.chance(0.15)) return { P: [1, 2], Q: [9, 4], R: [11, 10], S: [3, 8], para: true };
          return pickWhere(function () {
            var P0 = [r.int(0, 3), r.int(0, 3)], u = [r.int(5, 9), r.int(0, 3)], w = [r.int(1, 3), r.int(4, 7)], para = r.chance(0.75), sh = para ? [0, 0] : r.pick([[2, 0], [-2, 0], [0, 2], [0, -2]]);
            return { P: P0, Q: add(P0, u), S: add(P0, w), R: add(add(add(P0, u), w), sh), para: para };
          }, function (z) { return (z.Q[0] + z.S[0]) % 2 === 0 && (z.Q[1] + z.S[1]) % 2 === 0 && z.R[0] <= 12 && z.R[1] <= 12; });
        },
        stem: function (o) { return 'Quadrilateral ' + t('PQRS') + ' has vertices ' + t(nm('P', o.P)) + ', ' + t(nm('Q', o.Q)) + ', ' + t(nm('R', o.R)) + ', ' + t(nm('S', o.S)) + '.'; },
        parts: [
          { id: '15a', sub: 'a', level: 'BEG', make: function (r, o) {
            var hs = 'That is the midpoint of a side. A diagonal joins <b>opposite</b> vertices: ' + t('P') + ' and ' + t('R') + '.';
            return ptPart('Calculate the midpoint of diagonal ' + t('\\overline{PR}') + '.', mid(o.P, o.R), { cands: midCands(o.P, o.R).concat([[mid(o.P, o.Q), 'mid-wrong-seg', hs], [mid(o.P, o.S), 'mid-wrong-seg', hs]]) }, t(mLine(o.P, o.R)) + '.', HM, 'midpoint of PR');
          } },
          { id: '15b', sub: 'b', level: 'BEG', make: function (r, o) {
            var hs = 'That is the midpoint of a side. A diagonal joins <b>opposite</b> vertices: ' + t('Q') + ' and ' + t('S') + '.';
            return ptPart('Calculate the midpoint of diagonal ' + t('\\overline{QS}') + '.', mid(o.Q, o.S), { cands: midCands(o.Q, o.S).concat([[mid(o.Q, o.R), 'mid-wrong-seg', hs], [mid(o.P, o.Q), 'mid-wrong-seg', hs]]) }, t(mLine(o.Q, o.S)) + '.', HM, 'midpoint of QS');
          } },
          { id: '15c', sub: 'c', level: 'EMG', make: function (r, o) {
            var m1 = mid(o.P, o.R), m2 = mid(o.Q, o.S), eq = samePt(m1, m2);
            return mcPart(r, 'What do the results of (a) and (b) tell you about quadrilateral ' + t('PQRS') + '? (Recall: if the diagonals of a quadrilateral bisect each other, the quadrilateral is a parallelogram.)', [
              { html: 'The diagonals have the same midpoint, so they bisect each other: ' + t('PQRS') + ' is a parallelogram.', right: eq, why: eq ? null : 'Compare your answers: ' + t(ptT(m1)) + ' and ' + t(ptT(m2)) + ' are different points.' },
              { html: 'The diagonals have different midpoints, so they don’t bisect each other: ' + t('PQRS') + ' is not a parallelogram.', right: !eq, why: eq ? 'Look again: both diagonals have the midpoint ' + t(ptT(m1)) + '.' : null },
              { html: 'The diagonals are equal in length, so ' + t('PQRS') + ' is a rectangle.', why: 'Midpoints tell you where the diagonals cross, not how long they are. Lengths would need the distance formula.' },
              { html: 'Nothing — midpoints only describe a single segment.', why: 'If both diagonals have the same midpoint, each one cuts the other exactly in half. That is a property of parallelograms.' }],
              eq ? 'Both diagonals have the midpoint ' + t(ptT(m1)) + ', so each diagonal cuts the other in half — the diagonals <b>bisect each other</b>, and ' + t('PQRS') + ' is a <b>parallelogram</b>.' : 'The midpoints ' + t(ptT(m1)) + ' and ' + t(ptT(m2)) + ' are different, so the diagonals do not bisect each other: ' + t('PQRS') + ' is <b>not</b> a parallelogram.',
              ['Compare the two midpoints you found.'], 'diagonals bisect → parallelogram');
          } }] },
      /* ---------------- Question 16: MC equidistant from S and a midpoint ---------------- */
      { num: '16', section: 'Multiple choice and numerical response', parts: [
        { id: '16', level: 'PRG', make: function (r) {
          var o = r.chance(0.2) ? { P: [2, 11], Q: [10, 3], S: [-2, -5], tt: 2, bk: true } : pickWhere(function () {
            var P0 = [r.int(-2, 4), r.int(6, 12)], Q0 = [r.int(6, 12), r.int(0, 5)], S0 = [r.int(-6, 0), r.int(-8, -2)];
            return { P: P0, Q: Q0, S: S0, tt: r.pick([1, -1, 2, -2]) };
          }, function (z) { var M = mid(z.P, z.Q), h = sub(M, z.S); return Number.isInteger(M[0]) && Number.isInteger(M[1]) && h[0] % 2 === 0 && h[1] % 2 === 0; });
          var M = mid(o.P, o.Q), c = mid(o.S, M), h = sub(M, c), g = gcd(h[0], h[1]), pp = [h[1] / g, -h[0] / g], X = add(c, scl(pp, o.tt));
          if (Math.abs(X[0]) > 15 || Math.abs(X[1]) > 15) X = add(c, scl(pp, o.tt > 0 ? 1 : -1));
          var dis = [];
          var hP = sub(o.P, o.S); if (hP[0] % 2 === 0 && hP[1] % 2 === 0) { var cP = mid(o.S, o.P), gP = gcd(hP[0], hP[1]) / 2, pP = [hP[1] / 2 / gP, -hP[0] / 2 / gP], XP = add(cP, pP); if (Math.abs(d2(XP, o.S) - d2(XP, M)) >= 4) dis.push({ q: XP, why: 'That point is equidistant from ' + t('S') + ' and ' + t('P') + ' — but the question uses ' + t('M') + ', the midpoint of ' + t('\\overline{PQ}') + ', which is ' + t(ptT(M)) + '. ' + eqWhy(XP, o.S, 'S', M, 'M') }); }
          if (o.bk) dis = [[1, 5], [10, 0], [-4, 1]].map(function (q) { return { q: q, why: eqWhy(q, o.S, 'S', M, 'M') }; });
          ptsOpt(r, o.S, M, 4).forEach(function (q) { if (dis.length < 3 && !samePt(q, X) && !dis.some(function (d) { return samePt(d.q, q); })) dis.push({ q: q, why: eqWhy(q, o.S, 'S', M, 'M') }); });
          var opts = [{ html: t(ptT(X)), right: true }].concat(dis.slice(0, 3).map(function (d) { return { html: t(ptT(d.q)), why: d.why }; }));
          return mcPart(r, '<i>(Multiple Choice)</i> ' + t('\\overline{PQ}') + ' has endpoints ' + t(nm('P', o.P)) + ' and ' + t(nm('Q', o.Q)) + '. Which of the following points is equidistant from ' + t(nm('S', o.S)) + ' and ' + t('M') + ', the midpoint of ' + t('\\overline{PQ}') + '?', opts,
            'First, ' + t(mLine(o.P, o.Q, 'M')) + '. Now compare squared distances to ' + t('S') + ' and to ' + t('M') + ':<br>' + t(ptT(X)) + ': ' + t(d2(X, o.S)) + ' and ' + t(d2(X, M)) + '. Equal ✓<br>' + dis.slice(0, 3).map(function (d) { return t(ptT(d.q)) + ': ' + t(d2(d.q, o.S)) + ' vs ' + t(d2(d.q, M)) + '.'; }).join(' &nbsp;'),
            ['Find ' + t('M') + ' first. Then, for each option, compare the squared distances to ' + t('S') + ' and to ' + t('M') + '.'], 'MC equidistant from S and M');
        } }] },
      /* ---------------- Question 17: MC always true ---------------- */
      { num: '17', parts: [
        { id: '17', level: 'PRG', make: function (r) {
          var FAL = [
            { html: 'Two segments of equal length always share the same midpoint.', why: 'Two segments of length ' + t('4') + ' in different places have equal lengths but different midpoints.' },
            { html: 'Two segments that share the same midpoint are always equal in length.', why: 'The segments from ' + t('(-1,\\ 0)') + ' to ' + t('(1,\\ 0)') + ' and from ' + t('(0,\\ -5)') + ' to ' + t('(0,\\ 5)') + ' share the midpoint ' + t('(0,\\ 0)') + ', but their lengths are ' + t('2') + ' and ' + t('10') + '.' },
            { html: 'Any point equidistant from the endpoints of a segment must be that segment’s midpoint.', why: 'Every point on the perpendicular bisector is equidistant from the endpoints — only one of those points is the midpoint.' },
            { html: 'The midpoint of a segment always has whole-number coordinates when both endpoints do.', why: 'The midpoint of ' + t('(0,\\ 0)') + ' and ' + t('(3,\\ 0)') + ' is ' + t('(1.5,\\ 0)') + '.' },
            { html: 'The distance from ' + t('A') + ' to ' + t('B') + ' can be different from the distance from ' + t('B') + ' to ' + t('A') + '.', why: 'Swapping the points changes the sign of each difference, and squaring erases the sign — the distance is the same.' },
            { html: 'If ' + t('M') + ' is the midpoint of ' + t('\\overline{AB}') + ', then ' + t('AM+MB') + ' is greater than ' + t('AB') + '.', why: t('M') + ' lies on the segment, so ' + t('AM+MB=AB') + ' exactly.' }];
          var TRU = [
            { html: 'The midpoint of a segment is the same distance from both endpoints.' },
            { html: 'If ' + t('M') + ' is the midpoint of ' + t('\\overline{PQ}') + ', then ' + t('PM') + ' is half of ' + t('PQ') + '.' },
            { html: 'Swapping which endpoint is called ' + t('(x_1,\\ y_1)') + ' does not change the distance between two points.' }];
          var three, oneTrue = !r.chance(0.6);
          if (!oneTrue) three = r.chance(0.5) ? FAL.slice(0, 3) : r.sample(FAL, 3);
          else { var tr = r.pick(TRU); three = r.sample(FAL, 2).concat([{ html: tr.html, right: true }]); }
          three = r.shuffle(three);
          var none = { html: 'None of the above statements is always true.', right: !oneTrue, why: oneTrue ? 'One of the statements is always true — look for the one about a single segment and its own midpoint or length.' : null };
          var opts = three.map(function (s) { return s.right ? s : { html: s.html, why: 'Not always: ' + s.why }; }).concat([none]);
          return mcPart(r, '<i>(Multiple Choice)</i> Which statement is always true?', opts,
            three.map(function (s, i) { return '<b>' + 'ABC'[i] + '.</b> ' + (s.right ? 'Always true.' : 'False — ' + s.why); }).join('<br>') + '<br>' + (oneTrue ? 'So the answer is the true statement, not D.' : 'All three fail, so the answer is <b>D</b>.'),
            ['For each statement, try to find one example where it fails (a counterexample).'], 'MC always true (midpoint/distance)', true);
        } }] },
      /* ---------------- Question 18: NR missing endpoint ---------------- */
      { num: '18', parts: [
        { id: '18', level: 'PRG', make: function (r) {
          var o = r.chance(0.2) ? { M: [2, -4], T: [-5, 3] } : pickWhere(function () { return { M: [r.int(1, 6), r.int(-8, 4)], T: [r.int(-8, -1), r.int(-6, 8)] }; }, function (z) { var x = 2 * z.M[0] - z.T[0]; return x > 0 && x < 100 && z.M[1] !== z.T[1]; });
          var x = 2 * o.M[0] - o.T[0], y = 2 * o.M[1] - o.T[1];
          var c = endNum(o.T[0], o.M[0]).concat([[y, 'end-gave-y', 'That is the ' + t('y') + '-coordinate of ' + t('S') + '. The question asks for ' + t('x') + '.']]);
          return B.nr('<i>(Numerical Response)</i> The midpoint of line segment ' + t('ST') + ' is ' + t(nm('M', o.M)) + '. If the coordinates of ' + t('T') + ' are ' + t(ptT(o.T)) + ', and the coordinates of ' + t('S') + ' are ' + t('(x,\\ y)') + ', the value of ' + t('x') + ' is ______.', x, numDiag(c),
            t('M') + ' is the midpoint of ' + t('\\overline{ST}') + ', so work backward: ' + t('S=2M-T') + '.<br>' + t('x=2(' + o.M[0] + ')-' + sgp(o.T[0]) + '=' + 2 * o.M[0] + (o.T[0] < 0 ? '+' + (-o.T[0]) : '-' + o.T[0]) + '=' + x) + ' (and ' + t('y=2(' + o.M[1] + ')-' + sgp(o.T[1]) + '=' + y) + ').', HE, 'NR missing endpoint x');
        } }] }
    ],
    extra: EXTRA()
  });
  function sq(x) { return x * x; }

  /* =============================== Extra practice (u6_EP02) =============================== */
  function EXTRA() {
    return [
      /* ---- EP 1: triangle PQR ---- */
      { num: '1', section: 'Extra practice A — One figure, two formulas', shared: function (r) {
          if (r.chance(0.2)) return { P: [-4, -1], Q: [2, 7], R: [8, -1] };
          var L = triple(r, 12), a = [r.int(-6, 0), r.int(-4, 3)], up = r.chance(0.75) ? 1 : -1;
          return { P: a, Q: [a[0] + L[0], a[1] + up * L[1]], R: [a[0] + 2 * L[0], a[1]] };
        },
        stem: function (o) { return t('\\triangle PQR') + ' has vertices ' + t(nm('P', o.P)) + ', ' + t(nm('Q', o.Q)) + ', and ' + t(nm('R', o.R)) + ', as shown.' + figPoly([o.P, o.Q, o.R], ['P', 'Q', 'R'], { closed: true }); },
        parts: [
          { id: 'e1a', sub: 'a', level: 'EMG', make: function (r, o) {
            var a = dist(o.P, o.Q), b = dist(o.Q, o.R), c = dist(o.P, o.R), per = a + b + c;
            return B.number('Determine the perimeter of ' + t('\\triangle PQR') + '.', per, numDiag([[a + c, 'per-side', 'A perimeter adds <b>all three</b> sides.'], [2 * a, 'per-side', 'Add the third side, ' + t('PR') + ', too.'], [a * a + b * b + c * c, 'd-no-root', 'Take the square root of each squared length before adding.']]),
              t(dLine(o.P, o.Q, 'PQ') + simpTail(d2(o.P, o.Q))) + '<br>' + t(dLine(o.Q, o.R, 'QR') + simpTail(d2(o.Q, o.R))) + '<br>' + t(dLine(o.P, o.R, 'PR') + simpTail(d2(o.P, o.R))) + '<br>Perimeter ' + t('=' + a + '+' + b + '+' + c + '=' + per) + ' units.', HD, 'perimeter of PQR', { after: 'units' });
          } },
          { id: 'e1b', sub: 'b', level: 'BEG', make: function (r, o) {
            var S = [['P', 'Q'], ['Q', 'R'], ['P', 'R']], W = S.map(function (s) { return mid(o[s[0]], o[s[1]]); });
            return B.fields('Determine the coordinates of the midpoint of each of the three sides.', S.map(function (s) { return ptField(t('\\overline{' + s[0] + s[1] + '}')); }),
              S.map(function (s, i) { return ptCheck(W[i], { cands: midCands(o[s[0]], o[s[1]]) }); }), W.map(ptKey), S.map(function (s, i) { return t('\\overline{' + s[0] + s[1] + '}') + ': ' + t(ptT(W[i])); }).join('<br>'),
              'Average each coordinate.<br>' + S.map(function (s) { return t(mLine(o[s[0]], o[s[1]])); }).join('<br>'), HM, 'midpoints of PQR');
          } },
          { id: 'e1c', sub: 'c', level: 'BEG', make: function (r, o) {
            var m1 = mid(o.P, o.Q), m2 = mid(o.Q, o.R), L = dist(m1, m2);
            return B.number('Determine the length of the segment joining the midpoint of ' + t('\\overline{PQ}') + ' to the midpoint of ' + t('\\overline{QR}') + '.', L, numDiag([[dist(o.P, o.R), 'd-half', 'That is the length of ' + t('PR') + '. Use the two midpoints ' + t(ptT(m1)) + ' and ' + t(ptT(m2)) + ' as the endpoints.']]),
              'From ' + t(ptT(m1)) + ' to ' + t(ptT(m2)) + ': ' + t(dLine(m1, m2, 'd') + '=' + nT(L)) + '.', ['Find the two midpoints first (part b), then use the distance formula between them.'], 'midsegment length', { after: 'units' });
          } },
          { id: 'e1c2', sub: 'c, compare', level: 'EMG', make: function (r, o) {
            var L = dist(mid(o.P, o.Q), mid(o.Q, o.R)), PR = dist(o.P, o.R);
            return mcPart(r, 'Compare the length of that segment, ' + t(nT(L)) + ', to the length of ' + t('\\overline{PR}') + '.', [
              { html: 'It is exactly half as long as ' + t('\\overline{PR}') + ' (and parallel to it).', right: true },
              { html: 'It is the same length as ' + t('\\overline{PR}') + '.', why: t('PR=' + nT(PR)) + ' — compare it with ' + t(nT(L)) + '.' },
              { html: 'It is twice as long as ' + t('\\overline{PR}') + '.', why: t('PR=' + nT(PR)) + ' is the longer one.' },
              { html: 'There is no simple relationship.', why: 'Divide: ' + t(nT(PR) + '\\div ' + nT(L) + '=2') + '.' }],
              t('PR=' + nT(PR)) + ' and the segment joining the midpoints is ' + t(nT(L)) + ', so it is exactly <b>half</b> as long as ' + t('\\overline{PR}') + ' (both are horizontal, so they are also parallel).', ['Find ' + t('PR') + ' and compare.'], 'midsegment is half');
          } }] },
      /* ---- EP 2: AB and its midpoint ---- */
      { num: '2', shared: function (r) {
          if (r.chance(0.2)) return { A: [-7, 4], h: [6, -8] };
          var L = triple(r, 8), h = [L[0], -L[1]]; if (r.chance(0.3)) h = [L[0], L[1]];
          return { A: [r.int(-8, -2), h[1] < 0 ? r.int(2, 8) : r.int(-8, -2)], h: h };
        },
        stem: function (o) { return t('\\overline{AB}') + ' has endpoints ' + t(nm('A', o.A)) + ' and ' + t(nm('B', add(o.A, scl(o.h, 2)))) + ', and ' + t('M') + ' is its midpoint.'; },
        parts: [
          { id: 'e2a', sub: 'a', level: 'BEG', make: function (r, o) {
            var Bp = add(o.A, scl(o.h, 2)), D = dist(o.A, Bp);
            return B.number('Determine the length of ' + t('\\overline{AB}') + '.', D, matchDiag(dCands(o.A, Bp)), dSteps(o.A, Bp) + '<br>' + t(dLine(o.A, Bp, 'AB') + simpTail(d2(o.A, Bp))) + '.', HD, 'length of AB');
          } },
          { id: 'e2b', sub: 'b', level: 'BEG', make: function (r, o) {
            var Bp = add(o.A, scl(o.h, 2));
            return ptPart('Determine the coordinates of ' + t('M') + '.', mid(o.A, Bp), { cands: midCands(o.A, Bp), before: 'M =' }, t(mLine(o.A, Bp, 'M')) + '.', HM, 'midpoint of AB');
          } },
          { id: 'e2c', sub: 'c', level: 'EMG', make: function (r, o) {
            var Bp = add(o.A, scl(o.h, 2)), M = mid(o.A, Bp), D = dist(o.A, M);
            return B.fields('Calculate ' + t('AM') + ' and ' + t('MB') + '.', [{ label: t('AM='), name: 'AM' }, { label: t('MB='), name: 'MB' }],
              [K.number(D, matchDiag(dCands(o.A, M))), K.number(D, matchDiag(dCands(M, Bp)))], [String(D), String(D)], t('AM=MB=' + D),
              t(dLine(o.A, M, 'AM') + simpTail(d2(o.A, M))) + '<br>' + t(dLine(M, Bp, 'MB') + simpTail(d2(M, Bp))), HD, 'AM and MB');
          } },
          { id: 'e2c2', sub: 'c, explain', level: 'EMG', make: function (r, o) {
            var Bp = add(o.A, scl(o.h, 2)), D = dist(o.A, Bp);
            return mcPart(r, 'You found ' + t('AM=MB=' + D / 2) + ' and ' + t('AB=' + D) + '. What do these answers confirm?', [
              { html: t('M') + ' is the same distance from both ends and each half is exactly half of ' + t('AB') + ', so ' + t('M') + ' really is the midpoint.', right: true },
              { html: 'Only that ' + t('M') + ' is equidistant from ' + t('A') + ' and ' + t('B') + ' — it could be off the segment.', why: 'An equidistant point off the segment would make ' + t('AM+MB') + ' longer than ' + t('AB') + '. Here ' + t('AM+MB=AB') + ', so ' + t('M') + ' is on the segment, halfway along.' },
              { html: 'That the segment ' + t('\\overline{AB}') + ' is horizontal.', why: 'Equal halves happen for any segment and its midpoint — the direction doesn’t matter.' },
              { html: 'That the distance formula and the midpoint formula give the same answer.', why: 'One formula gives a length, the other a point. The lengths ' + t('AM') + ' and ' + t('MB') + ' check the point ' + t('M') + '.' }],
              t('AM=MB=' + D / 2) + ', each half of ' + t('AB=' + D) + '. ' + t('M') + ' is the same distance from both ends, and the two halves add up to the whole segment, so ' + t('M') + ' is the midpoint.', ['What would be true of the real midpoint?'], 'AM = MB confirms midpoint');
          } }] },
      /* ---- EP 3: which formula ---- */
      { num: '3', parts: [
        { id: 'e3', level: 'EMG', make: function (r) {
          var POOL = [
            { id: 'a', html: 'Locating the centre of a circle when the endpoints of a diameter are known.', w: 'm', why: 'The centre is a <b>location</b> — the point halfway along the diameter.' },
            { id: 'b', html: 'Deciding whether a triangle is isosceles.', w: 'd', why: 'Isosceles means two equal side <b>lengths</b>.' },
            { id: 'c', html: 'Deciding whether the diagonals of a quadrilateral bisect each other.', w: 'm', why: '“Bisect each other” means the two diagonals have the same <b>midpoint</b>.' },
            { id: 'd', html: 'Finding the radius of a circle when its centre and a point on it are known.', w: 'd', why: 'A radius is a <b>length</b>: the distance from the centre to a point on the circle.' },
            { id: 'e', html: 'Deciding whether a given point is the same distance from two other points.', w: 'd', why: '“Same distance” compares two <b>lengths</b>.' },
            { id: 'f', html: 'Finding a fourth vertex that completes a parallelogram.', w: 'm', why: 'The fourth vertex is the <b>point</b> that makes the diagonals share a midpoint.' },
            { id: 'g', html: 'Finding the perimeter of a triangle from its vertices.', w: 'd', why: 'A perimeter adds side <b>lengths</b>.' },
            { id: 'h', html: 'Finding where to put a water station halfway along a straight trail.', w: 'm', why: 'Halfway along is a <b>location</b>.' },
            { id: 'i', html: 'Finding the length of a median of a triangle (from a vertex to the midpoint of the opposite side).', w: 'b', why: 'You need the <b>midpoint</b> of the opposite side first, then the <b>distance</b> to it.' },
            { id: 'j', html: 'Finding how far a given point is from the centre of a circle when only the endpoints of a diameter are known.', w: 'b', why: 'First locate the centre (the <b>midpoint</b> of the diameter), then find the <b>distance</b> from the centre to the point.' }];
          var rows = r.chance(0.3) ? POOL.slice(0, 6) : r.shuffle(r.sample(POOL.slice(0, 8), 5).concat([r.pick(POOL.slice(8))]));
          var cols = [{ id: 'd', html: 'Distance' }, { id: 'm', html: 'Midpoint' }, { id: 'b', html: 'Both' }], want = {}, by = {};
          rows.forEach(function (x) { want[x.id] = x.w; by[x.id] = x; });
          var nmC = { d: 'distance', m: 'midpoint', b: 'both' };
          var p = B.grid('For each task, decide which formula settles it — <b>distance</b>, <b>midpoint</b>, or <b>both</b>. (Do not calculate anything.)', rows.map(function (x) { return { id: x.id, html: x.html }; }), cols, want,
            { why: function (rid) { return { code: 'row', hint: '“' + by[rid].html + '” — ' + by[rid].why }; } },
            rows.map(function (x) { return '<b>' + nmC[x.w].charAt(0).toUpperCase() + nmC[x.w].slice(1) + '.</b> ' + x.html + ' ' + x.why; }).join('<br>'),
            ['Ask: is the question asking for a <b>length</b> (distance formula) or a <b>location</b> (midpoint formula)?'], 'which formula');
          p.tries = 3;
          return p;
        } }] },
      /* ---- EP 4: find B ---- */
      { num: '4', section: 'Extra practice B — Backwards: the midpoint is known', stem: 'In each case ' + t('M') + ' is the midpoint of ' + t('\\overline{AB}') + '. Determine the coordinates of ' + t('B') + '.', parts: [
        { id: 'e4a', level: 'EMG', make: function (r) {
          var o = r.chance(0.2) ? { A: [-5, 4], M: [3, -2] } : pickWhere(function () { return { A: [r.int(-8, -1), r.int(1, 8)], M: [r.int(1, 6), r.int(-6, -1)] }; }, function () { return true; });
          var Bp = sub(scl(o.M, 2), o.A);
          return ptPart(t(nm('A', o.A) + ',\\ ' + nm('M', o.M)), Bp, { cands: endCands(o.A, o.M), before: 'B =' }, t('x_B=2x_M-x_A=2(' + o.M[0] + ')-' + sgp(o.A[0]) + '=' + Bp[0]) + '<br>' + t('y_B=2y_M-y_A=2(' + o.M[1] + ')-' + sgp(o.A[1]) + '=' + Bp[1]) + '<br>' + t(nm('B', Bp)), HE, 'missing endpoint B');
        } },
        { id: 'e4b', level: 'EMG', make: function (r) {
          var o = r.chance(0.2) ? { A: [-9, 3], M: [0, -6] } : pickWhere(function () { return { A: [r.int(-10, -2), r.int(1, 8)], M: [r.pick([0, 0, 1, -1]), r.int(-8, -2)] }; }, function () { return true; });
          var Bp = sub(scl(o.M, 2), o.A);
          return ptPart(t(nm('A', o.A) + ',\\ ' + nm('M', o.M)), Bp, { cands: endCands(o.A, o.M), before: 'B =' }, t('x_B=2(' + o.M[0] + ')-' + sgp(o.A[0]) + '=' + Bp[0]) + '<br>' + t('y_B=2(' + o.M[1] + ')-' + sgp(o.A[1]) + '=' + Bp[1]) + '<br>' + t(nm('B', Bp)), HE, 'missing endpoint B (zero)');
        } },
        { id: 'e4c', level: 'PRG', make: function (r) {
          var o = r.chance(0.2) ? { A: [1.5, -3], M: [-4.5, 2] } : pickWhere(function () { return { A: [r.int(0, 4) + 0.5, -r.int(1, 6)], M: [-r.int(1, 6) - 0.5, r.int(1, 5)] }; }, function () { return true; });
          var Bp = sub(scl(o.M, 2), o.A);
          return ptPart(t(nm('A', o.A) + ',\\ ' + nm('M', o.M)), Bp, { cands: endCands(o.A, o.M), before: 'B =' }, t('x_B=2(' + nT(o.M[0]) + ')-' + sgp(o.A[0]) + '=' + nT(2 * o.M[0]) + '-' + sgp(o.A[0]) + '=' + nT(Bp[0])) + '<br>' + t('y_B=2(' + o.M[1] + ')-' + sgp(o.A[1]) + '=' + Bp[1]) + '<br>' + t(nm('B', Bp)), HE, 'missing endpoint with decimals');
        } },
        { id: 'e4d', level: 'ADV', make: function (r) {
          var o = r.chance(0.25) ? { a: [5, 1], m: [2, -3] } : pickWhere(function () { return { a: [r.int(2, 6), r.pick(pm(1, 3))], m: [r.pick(pm(1, 4)), r.pick(pm(1, 4))] }; }, function (z) { var b = [2 * z.m[0] - z.a[0], 2 * z.m[1] - z.a[1]]; return b[0] !== 0 && b[1] !== 0 && z.a[0] !== z.m[0] && z.a[1] !== z.m[1]; });
          var bx = 2 * o.m[0] - o.a[0], by = 2 * o.m[1] - o.a[1], tt = function (c) { return c === 1 ? 't' : c === -1 ? '-t' : c + 't'; };
          var Pt = function (c) { return P.parse(tt(c)); };
          var wr = function (c, ca, cm) { return [{ is: P.parse(tt(cm - ca === 0 ? 1 : cm - ca)), code: 'end-step', hint: 'That is the step from ' + t('A') + ' to ' + t('M') + '. Double the midpoint, then subtract: ' + t('2(' + tt(cm) + ')-' + (ca < 0 ? '(' + tt(ca) + ')' : tt(ca))) + '.' }, { is: P.parse(tt(2 * cm + ca === 0 ? 1 : 2 * cm + ca)), code: 'end-sign', hint: '<b>Subtract</b> the endpoint after doubling: ' + t('2(' + tt(cm) + ')-' + (ca < 0 ? '(' + tt(ca) + ')' : tt(ca))) + '.' }].filter(function (w) { return !P.eq(w.is, Pt(c)); }); };
          var fl = [{ label: t('x_B='), name: 'x_B', mode: 'math', keys: 'poly', vars: ['t'] }, { label: t('y_B='), name: 'y_B', mode: 'math', keys: 'poly', vars: ['t'] }];
          return B.fields(t('A(' + tt(o.a[0]) + ',\\ ' + tt(o.a[1]) + '),\\ M(' + tt(o.m[0]) + ',\\ ' + tt(o.m[1]) + ')') + ' — give each coordinate of ' + t('B') + ' in terms of ' + t('t') + '.', fl,
            [K.poly(Pt(bx), { wrong: wr(bx, o.a[0], o.m[0]) }), K.poly(Pt(by), { wrong: wr(by, o.a[1], o.m[1]) })], [tt(bx), tt(by)], t('B(' + tt(bx) + ',\\ ' + tt(by) + ')'),
            t('x_B=2x_M-x_A=2(' + tt(o.m[0]) + ')-' + (o.a[0] < 0 ? '(' + tt(o.a[0]) + ')' : tt(o.a[0])) + '=' + tt(2 * o.m[0]) + (o.a[0] > 0 ? '-' + tt(o.a[0]) : '+' + tt(-o.a[0])) + '=' + tt(bx)) + '<br>' + t('y_B=2y_M-y_A=2(' + tt(o.m[1]) + ')-' + (o.a[1] < 0 ? '(' + tt(o.a[1]) + ')' : tt(o.a[1])) + '=' + tt(2 * o.m[1]) + (o.a[1] > 0 ? '-' + tt(o.a[1]) : '+' + tt(-o.a[1])) + '=' + tt(by)) + '<br>' + t('B(' + tt(bx) + ',\\ ' + tt(by) + ')'),
            HE.concat(['Treat ' + t('t') + ' like a unit: ' + t('2(2t)-5t=4t-5t=-t') + '.']), 'missing endpoint with variables');
        } }] },
      /* ---- EP 5: helicopter ---- */
      { num: '5', parts: [
        { id: 'e5', level: 'PRG', make: function (r) {
          var o = r.chance(0.2) ? { H: [14, -6], C: [-3, 11] } : pickWhere(function () { return { H: [r.int(6, 18), -r.int(2, 10)], C: [-r.int(1, 8), r.int(4, 14)] }; }, function () { return true; });
          var X = sub(scl(o.H, 2), o.C);
          return ptPart('A search helicopter hovers at ' + t(nm('H', o.H)) + ', exactly halfway along the straight line from base camp ' + t(nm('C', o.C)) + ' to a stranded hiker. Determine the hiker’s coordinates.', X, { cands: endCands(o.C, o.H) },
            t('H') + ' is the midpoint, so double ' + t('H') + ' and subtract ' + t('C') + ':<br>' + t('x=2(' + o.H[0] + ')-' + sgp(o.C[0]) + '=' + X[0]) + ', &nbsp;' + t('y=2(' + o.H[1] + ')-' + sgp(o.C[1]) + '=' + X[1]) + '. The hiker is at ' + t(ptT(X)) + '.<br>Check: ' + t(mLine(o.C, X)) + ' ' + t('=H') + ' ✓',
            HE, 'hiker coordinates');
        } }] },
      /* ---- EP 6: A, P midpoint of AB, Q midpoint of PB ---- */
      { num: '6', shared: function (r) {
          if (r.chance(0.2)) return { A: [-10, 6], h: [6, -4] };
          var v = pickWhere(function () { return [r.pick([1, 2, 3]), r.pick([1, 2, 3, 4, 5])]; }, function (z) { var n = z[0] * z[0] + z[1] * z[1]; return gcd(z[0], z[1]) === 1 && !isSq(n) && radParts(n).k === 1; });
          var h = r.chance(0.5) ? [2 * v[0], -2 * v[1]] : [2 * v[1], -2 * v[0]];
          return { A: [r.int(-10, -4), r.int(2, 8)], h: h };
        },
        stem: function (o) { var Pp = add(o.A, o.h); return t('\\overline{AB}') + ' has endpoint ' + t(nm('A', o.A)) + '. The point ' + t(nm('P', Pp)) + ' is the midpoint of ' + t('\\overline{AB}') + ', and ' + t('Q') + ' is the midpoint of ' + t('\\overline{PB}') + '.'; },
        parts: [
          { id: 'e6a', sub: 'a', level: 'PRG', make: function (r, o) {
            var Pp = add(o.A, o.h), Bp = add(Pp, o.h);
            return ptPart('Determine the coordinates of ' + t('B') + '.', Bp, { cands: endCands(o.A, Pp), before: 'B =' }, t('P') + ' is the midpoint of ' + t('\\overline{AB}') + ':<br>' + t('x_B=2(' + Pp[0] + ')-' + sgp(o.A[0]) + '=' + Bp[0]) + ', &nbsp;' + t('y_B=2(' + Pp[1] + ')-' + sgp(o.A[1]) + '=' + Bp[1]) + ', so ' + t(nm('B', Bp)) + '.', HE, 'B from A and midpoint P');
          } },
          { id: 'e6b', sub: 'b', level: 'EMG', make: function (r, o) {
            var Pp = add(o.A, o.h), Bp = add(Pp, o.h), Q = mid(Pp, Bp);
            return ptPart('Determine the coordinates of ' + t('Q') + '.', Q, { cands: midCands(Pp, Bp).concat([[mid(o.A, Pp), 'mid-wrong-seg', t('Q') + ' is the midpoint of ' + t('\\overline{PB}') + ', not of ' + t('\\overline{AP}') + '.'], [mid(o.A, Bp), 'mid-wrong-seg', 'That is ' + t('P') + ', the midpoint of ' + t('\\overline{AB}') + '. ' + t('Q') + ' is the midpoint of ' + t('\\overline{PB}') + '.']]), before: 'Q =' },
              t('Q') + ' is the midpoint of ' + t(nm('P', Pp)) + ' and ' + t(nm('B', Bp)) + ':<br>' + t(mLine(Pp, Bp, 'Q')) + '.', ['You need ' + t('B') + ' from part (a). Then average ' + t('P') + ' and ' + t('B') + '.'].concat(HM.slice(0, 1)), 'Q midpoint of PB');
          } },
          { id: 'e6c', sub: 'c', level: 'ADV', make: function (r, o) {
            var Pp = add(o.A, o.h), Bp = add(Pp, o.h), Q = mid(Pp, Bp), nQ = d2(o.A, Q), nB = d2(o.A, Bp);
            var fl = [lenField('AQ'), lenField('AB'), { label: 'fraction of the way', name: 'fraction', mode: 'math', keys: 'radical' }];
            return B.fields('Calculate ' + t('AQ') + ' and ' + t('AB') + ' exactly, and state what fraction of the way from ' + t('A') + ' to ' + t('B') + ' the point ' + t('Q') + ' sits.', fl,
              [lenCheck(nQ, 1, { cands: dCands(o.A, Q) }), lenCheck(nB, 1, { cands: dCands(o.A, Bp) }), K.fraction([3, 4], { decimalOk: true, diag: function (v) { if (same(v, 4 / 3)) return { code: 'flip', hint: 'Fraction of the way = ' + t('AQ\\div AB') + ' (the part over the whole).' }; if (same(v, 0.5)) return { code: 'value', hint: t('P') + ' is halfway; ' + t('Q') + ' is halfway between ' + t('P') + ' and ' + t('B') + ' — further along.' }; return null; } })],
              [lenKey(nQ), lenKey(nB), '\\frac{3}{4}'], t('AQ=' + lenTex(nQ) + ',\\ AB=' + lenTex(nB)) + ', ' + t('Q') + ' sits ' + t('\\tfrac{3}{4}') + ' of the way.',
              t(dLine(o.A, Q, 'AQ') + simpTail(nQ)) + '<br>' + t(dLine(o.A, Bp, 'AB') + simpTail(nB)) + '<br>' + t('AQ\\div AB=\\dfrac{' + lenTex(nQ) + '}{' + lenTex(nB) + '}=\\dfrac{3}{4}') + ', so ' + t('Q') + ' sits ' + t('\\tfrac{3}{4}') + ' of the way from ' + t('A') + ' to ' + t('B') + '.',
              HD.concat(['The fraction of the way is ' + t('AQ\\div AB') + '; the radicals cancel.']), 'AQ, AB and the fraction');
          } }] },
      /* ---- EP 7: variables ---- */
      { num: '7', parts: [
        { id: 'e7', level: 'ADV', make: function (r) {
          var o = r.chance(0.25) ? { mk: 3, mc: -2, ac: 1, ay: 4 } : pickWhere(function () { return { mk: r.pick([2, 3, 4]), mc: r.pick(pm(1, 5)), ac: r.pick(pm(1, 4)), ay: r.pick(pm(1, 6)) }; }, function (z) { return 2 * z.mc - z.ay !== 0 && z.ac !== 0; });
          var lin = function (a, b) { return P.tex(P.add(P.parse(a === 1 ? 'k' : a === -1 ? '-k' : a + 'k'), P.num(b))); };
          var Mx = lin(o.mk, 0), My = lin(1, o.mc), Ax = lin(1, o.ac), Bx = P.add(P.parse((2 * o.mk - 1) + 'k'), P.num(-o.ac)), By = P.add(P.parse('2k'), P.num(2 * o.mc - o.ay));
          var fl = [{ label: t('x_B='), name: 'x_B', mode: 'math', keys: 'poly', vars: ['k'] }, { label: t('y_B='), name: 'y_B', mode: 'math', keys: 'poly', vars: ['k'] }];
          var wx = [{ is: P.add(P.parse((2 * o.mk - 1) + 'k'), P.num(o.ac)), code: 'end-sign', hint: 'Subtracting ' + t('(' + Ax + ')') + ' changes the sign of <b>both</b> terms: ' + t('-(' + Ax + ')=' + P.tex(P.neg(P.parse(Ax)))) + '.' }, { is: P.scale(P.add(P.parse(Ax), P.parse(Mx)), [1, 2]), code: 'end-average', hint: 'You averaged ' + t('A') + ' and ' + t('M') + '. Double the midpoint, then subtract ' + t('A') + '.' }].filter(function (w) { return !P.eq(w.is, Bx); });
          var wy = [{ is: P.add(P.parse('2k'), P.num(2 * o.mc + o.ay)), code: 'end-sign', hint: 'After doubling, <b>subtract</b> ' + t(sgp(o.ay)) + '.' }, { is: P.add(P.parse('k'), P.num(o.mc - o.ay)), code: 'end-double', hint: 'Double the <b>whole</b> midpoint coordinate: ' + t('2(' + My + ')=' + P.tex(P.scale(P.parse(My), 2))) + '.' }].filter(function (w) { return !P.eq(w.is, By); });
          return B.fields('The point ' + t('M(' + Mx + ',\\ ' + My + ')') + ' is the midpoint of ' + t('\\overline{AB}') + ', where ' + t('A') + ' is the point ' + t('(' + Ax + ',\\ ' + o.ay + ')') + '. Determine the coordinates of ' + t('B') + ' in terms of ' + t('k') + '.', fl,
            [K.poly(Bx, { wrong: wx }), K.poly(By, { wrong: wy })], [P.tex(Bx), P.tex(By)], t('B(' + P.tex(Bx) + ',\\ ' + P.tex(By) + ')'),
            'Double the midpoint, then subtract ' + t('A') + ':<br>' + t('x_B=2(' + Mx + ')-(' + Ax + ')=' + P.tex(P.parse(2 * o.mk + 'k')) + '-' + P.btex(P.parse(Ax)) + '=' + P.tex(Bx)) + '<br>' + t('y_B=2(' + My + ')-' + sgp(o.ay) + '=' + P.tex(P.scale(P.parse(My), 2)) + (o.ay > 0 ? '-' + o.ay : '+' + (-o.ay)) + '=' + P.tex(By)) + '<br>Check by averaging: ' + t('\\dfrac{(' + Ax + ')+(' + P.tex(Bx) + ')}{2}=' + Mx) + ' ✓',
            HE.concat(['Use brackets: ' + t('2(k-2)=2k-4') + ' and ' + t('-(k+1)=-k-1') + '.']), 'missing endpoint in terms of k');
        } }] },
      /* ---- EP 8: points at a given distance on a line ---- */
      { num: '8', section: 'Extra practice C — Backwards: the distance is known', stem: 'In each case, determine <b>all</b> points that satisfy the conditions. (Separate two points with a comma.)', parts: [
        { id: 'e8a', level: 'ADV', make: function (r) {
          var o = r.chance(0.2) ? { A: [2, -3], tr: [3, 4, 5] } : (function () { var tr = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13]]); return { A: [r.pick(pm(1, 5)), tr[0] * (r.chance(0.6) ? -1 : 1)], tr: tr }; })();
          var A = o.A, k = A[1], s = o.tr[1], rr = o.tr[2], W = [[A[0] + s, 0], [A[0] - s, 0]];
          return { prompt: t('B') + ' lies on the ' + t('x') + '-axis and ' + t('AB=' + rr) + ', where ' + t('A') + ' is ' + t(ptT(A)) + '.', input: { type: 'math', keys: 'pairs', placeholder: 'e.g. (3, 0), (-1, 0)' },
            check: ptsCheck(W, { missCode: 'ax-one', missHint: 'Correct so far — but ' + t('x-' + sgp(A[0]) + '=\\pm ' + s) + ' gives <b>two</b> values. Find the other point.', diag: function (L) {
              if (L.some(function (p) { return same(p[1], 0); }) && L.every(function (p) { return same(p[1], 0); })) {
                var xs = L.map(function (p) { return p[0]; });
                if (xs.some(function (x) { return same(x, A[0] + rr) || same(x, A[0] - rr); })) return { code: 'ax-no-leg', hint: 'Include the vertical difference: ' + t('(x-' + sgp(A[0]) + ')^{2}+(0-' + sgp(k) + ')^{2}=' + rr + '^{2}') + '.' };
                if (xs.some(function (x) { return same(x, -A[0] + s) || same(x, -A[0] - s); })) return { code: 'ax-sign', hint: 'Check the signs: ' + t('x-' + sgp(A[0]) + '=\\pm ' + s) + ', so ' + t('x=' + A[0] + '\\pm ' + s) + '.' };
                if (xs.some(function (x) { return same(x, A[0] + s * s) || same(x, A[0] - s * s); })) return { code: 'ax-no-root', hint: 'Take the square root: ' + t('(x-' + sgp(A[0]) + ')^{2}=' + s * s) + ' means ' + t('x-' + sgp(A[0]) + '=\\pm ' + s) + '.' };
              }
              if (L.some(function (p) { return !same(p[1], 0); })) return { code: 'pts', hint: 'A point on the ' + t('x') + '-axis has ' + t('y=0') + ': write it as ' + t('(x,\\ 0)') + '.' };
              return null; } }),
            key: ptKey(W[0]) + ', ' + ptKey(W[1]), answer: t('B' + ptT(W[0]) + '\\text{ or }B' + ptT(W[1])), text: 'points on x-axis at distance', hints: ['A point on the ' + t('x') + '-axis is ' + t('(x,\\ 0)') + '. Substitute it into the distance formula and set it equal to ' + t(rr) + '.', 'A squared equation usually has <b>two</b> solutions.'],
            solution: 'On the ' + t('x') + '-axis: ' + t('B(x,\\ 0)') + '.<br>' + t('(x-' + sgp(A[0]) + ')^{2}+(0-' + sgp(k) + ')^{2}=' + rr + '^{2}') + '<br>' + t('(x-' + sgp(A[0]) + ')^{2}+' + k * k + '=' + rr * rr) + ', so ' + t('(x-' + sgp(A[0]) + ')^{2}=' + s * s) + '<br>' + t('x-' + sgp(A[0]) + '=\\pm ' + s) + ', so ' + t('x=' + W[0][0]) + ' or ' + t('x=' + W[1][0]) + ': ' + t('B' + ptT(W[0])) + ' or ' + t('B' + ptT(W[1])) + '.',
            good: ['\\left(' + W[1][0] + ',0\\right),\\left(' + W[0][0] + ',0\\right)'], bad: [ptKey(W[0]), ptKey([A[0] + rr, 0]) + ', ' + ptKey([A[0] - rr, 0])] };
        } },
        { id: 'e8b', level: 'ADV', make: function (r) {
          var o = r.chance(0.2) ? { C: [-1, 4], s: 4 } : pickWhere(function () { return { C: [r.pick(pm(1, 3)), r.pick(pm(1, 6))], s: r.int(2, 6) }; }, function (z) { return !isSq(z.C[0] * z.C[0] + z.s * z.s) && z.C[1] !== z.s && z.C[1] !== -z.s; });
          var C = o.C, h = C[0], s = o.s, R = h * h + s * s, W = [[0, C[1] + s], [0, C[1] - s]];
          return { prompt: t('D') + ' lies on the ' + t('y') + '-axis and ' + t('CD=' + lenTex(R)) + ', where ' + t('C') + ' is ' + t(ptT(C)) + '.', input: { type: 'math', keys: 'pairs', placeholder: 'e.g. (0, 3), (0, -1)' },
            check: ptsCheck(W, { missCode: 'ax-one', missHint: 'Correct so far — ' + t('y-' + sgp(C[1]) + '=\\pm ' + s) + ' gives <b>two</b> values. Find the other point.', diag: function (L) {
              if (L.some(function (p) { return !same(p[0], 0); })) return { code: 'pts', hint: 'A point on the ' + t('y') + '-axis has ' + t('x=0') + ': write it as ' + t('(0,\\ y)') + '.' };
              var ys = L.map(function (p) { return p[1]; });
              if (ys.some(function (y) { return same(y, C[1] + Math.sqrt(R)) || same(y, C[1] - Math.sqrt(R)); })) return { code: 'ax-no-leg', hint: 'Include the horizontal difference: ' + t('(0-' + sgp(h) + ')^{2}+(y-' + sgp(C[1]) + ')^{2}=' + R) + '.' };
              if (ys.some(function (y) { return same(y, -C[1] + s) || same(y, -C[1] - s); })) return { code: 'ax-sign', hint: 'Check the signs: ' + t('y=' + C[1] + '\\pm ' + s) + '.' };
              return null; } }),
            key: ptKey(W[0]) + ', ' + ptKey(W[1]), answer: t('D' + ptT(W[0]) + '\\text{ or }D' + ptT(W[1])), text: 'points on y-axis at distance', hints: ['A point on the ' + t('y') + '-axis is ' + t('(0,\\ y)') + '. Square both sides of the distance: ' + t('(' + lenTex(R) + ')^{2}=' + R) + '.', 'Expect two answers.'],
            solution: 'On the ' + t('y') + '-axis: ' + t('D(0,\\ y)') + '.<br>' + t('(0-' + sgp(h) + ')^{2}+(y-' + sgp(C[1]) + ')^{2}=(' + lenTex(R) + ')^{2}') + '<br>' + t(h * h + '+(y-' + sgp(C[1]) + ')^{2}=' + R) + ', so ' + t('(y-' + sgp(C[1]) + ')^{2}=' + s * s) + '<br>' + t('y=' + C[1] + '\\pm ' + s) + ': ' + t('D' + ptT(W[0])) + ' or ' + t('D' + ptT(W[1])) + '.',
            good: [ptKey(W[1]) + ', ' + ptKey(W[0])], bad: [ptKey(W[1])] };
        } },
        { id: 'e8c', level: 'ADV', make: function (r) {
          var o = r.chance(0.2) ? { E: [3, -2], rr: 4, dir: 1 } : { E: [r.pick(pm(1, 5)), r.pick(pm(1, 5))], rr: r.int(2, 6), dir: r.pick([1, -1]) };
          var E = o.E, c = E[0] + o.dir * o.rr, W = [[c, E[1]]];
          return { prompt: t('F') + ' lies on the vertical line ' + t('x=' + c) + ' and ' + t('EF=' + o.rr) + ', where ' + t('E') + ' is ' + t(ptT(E)) + '.', input: { type: 'math', keys: 'pairs', placeholder: 'e.g. (3, 0)' },
            check: ptsCheck(W, { diag: function (L) { if (L.length === 2 && L.some(function (p) { return samePt(p, W[0]); })) return { code: 'pts-extra', hint: 'Check: ' + t('(y-' + sgp(E[1]) + ')^{2}=0') + ' has only <b>one</b> solution — the two “±” answers are the same point.' }; if (L.some(function (p) { return !same(p[0], c); })) return { code: 'pts', hint: 'Every point on the line ' + t('x=' + c) + ' has ' + t('x') + '-coordinate ' + t(c) + '.' }; return null; } }),
            key: ptKey(W[0]), answer: t('F' + ptT(W[0])) + ' — only one point', text: 'one point at distance (tangent)', hints: ['A point on ' + t('x=' + c) + ' is ' + t('(' + c + ',\\ y)') + '. Set up the distance equation and solve.'],
            solution: 'On ' + t('x=' + c) + ': ' + t('F(' + c + ',\\ y)') + '.<br>' + t('(' + c + '-' + sgp(E[0]) + ')^{2}+(y-' + sgp(E[1]) + ')^{2}=' + o.rr + '^{2}') + '<br>' + t(o.rr * o.rr + '+(y-' + sgp(E[1]) + ')^{2}=' + o.rr * o.rr) + ', so ' + t('(y-' + sgp(E[1]) + ')^{2}=0') + ' and ' + t('y=' + E[1]) + ' only: ' + t('F' + ptT(W[0])) + ' — one point.',
            good: ['\\left(' + c + ',' + E[1] + '\\right)'], bad: [ptKey([c, E[1] + o.rr]) + ', ' + ptKey([c, E[1] - o.rr])] };
        } },
        { id: 'e8d', sub: 'd', level: 'PRG', make: function (r) {
          return mcPart(r, 'In part (c) there is only <b>one</b> point, while (a) and (b) each have two. Which explanation is correct?', [
            { html: 'The points at a fixed distance from a given point form a circle. In (c) the given point is exactly that distance from the line, so the circle only <b>touches</b> the line once; in (a) and (b) the circle crosses the axis twice.', right: true },
            { html: 'In (c) the line is vertical, and vertical lines can only contain one point at a given distance.', why: 'The direction of the line isn’t the reason — a vertical line closer to ' + t('E') + ' would cross the circle twice. What matters is how far the line is from the given point compared with the distance.' },
            { html: 'In (c) one of the two answers was negative, so it had to be rejected.', why: 'Negative coordinates are perfectly good points. In (c) the equation became ' + t('(y-k)^{2}=0') + ', which has only one solution.' },
            { html: 'The question in (c) has a mistake: there should be two points.', why: 'The algebra gives ' + t('(y-k)^{2}=0') + ' — only one solution. Think about the circle around ' + t('E') + ' and the line.' }],
            'The points at a fixed distance from a given point form a <b>circle</b> around it. When the line’s distance from the point equals the radius, the circle just touches the line (one point). When the radius is greater than the gap, the circle cuts the line at two points; when it is smaller, there are none.',
            ['Picture all the points at that distance from the given point. What shape do they make?'], 'why only one point');
        } }] },
      /* ---- EP 9: values of k ---- */
      { num: '9', stem: 'Determine all values of ' + t('k') + ' for which the stated distance is correct.', shared: function (r) {
          if (r.chance(0.2)) return { y0: 3, Q: [1, 7], rr: 3 };
          return pickWhere(function () { var y0 = r.pick(pm(1, 5)); return { y0: y0, Q: [r.pick(pm(1, 5)), y0 + r.pick(pm(3, 6))], rr: r.int(2, 5) }; }, function (z) { return Math.abs(z.Q[1] - z.y0) > z.rr && !isSq(Math.abs(sq(z.Q[1] - z.y0) - z.rr * z.rr)); });
        }, parts: [
        { id: 'e9a', level: 'ADV', make: function (r) {
          var o = r.chance(0.2) ? { y0: 3, Q: [-2, -1], tr: [4, 3, 5] } : (function () { var tr = r.pick([[4, 3, 5], [3, 4, 5], [8, 6, 10], [6, 8, 10], [5, 12, 13], [12, 5, 13]]), y0 = r.pick(pm(1, 5)); return { y0: y0, Q: [r.pick(pm(1, 5)), y0 - tr[0] * r.pick([1, -1])], tr: tr }; })();
          var dy = o.y0 - o.Q[1], s = o.tr[1], rr = o.tr[2], ks = [o.Q[0] + s, o.Q[0] - s];
          var p = B.valueSet('The distance from ' + t('(k,\\ ' + o.y0 + ')') + ' to ' + t(ptT(o.Q)) + ' is ' + t(rr) + '.', ks, { v: 'k', diag: function (A) {
              if (A.some(function (x) { return same(x, o.Q[0] + rr) || same(x, o.Q[0] - rr); })) return { code: 'ax-no-leg', hint: 'Include the vertical difference: ' + t('(' + o.y0 + '-' + sgp(o.Q[1]) + ')^{2}=' + dy * dy) + '.' };
              if (A.some(function (x) { return same(x, -o.Q[0] + s) || same(x, -o.Q[0] - s); })) return { code: 'ax-sign', hint: 'Check the signs: ' + t('k-' + sgp(o.Q[0]) + '=\\pm ' + s) + '.' };
              return null; } },
            t('(k-' + sgp(o.Q[0]) + ')^{2}+(' + o.y0 + '-' + sgp(o.Q[1]) + ')^{2}=' + rr + '^{2}') + '<br>' + t('(k-' + sgp(o.Q[0]) + ')^{2}+' + dy * dy + '=' + rr * rr) + ', so ' + t('(k-' + sgp(o.Q[0]) + ')^{2}=' + s * s) + '<br>' + t('k-' + sgp(o.Q[0]) + '=\\pm ' + s) + ': ' + t('k=' + ks[0]) + ' or ' + t('k=' + ks[1]) + '.',
            ['Substitute into the distance formula, square both sides, and solve for ' + t('k') + '.', 'A squared equation usually has two solutions.'], 'values of k for a distance');
          p.good = ['k=' + ks[1] + ', k=' + ks[0]]; p.bad = ['k=' + ks[0]];
          return p;
        } },
        { id: 'e9b', level: 'ADV', make: function (r) {
          var o = r.chance(0.2) ? { y0: 3, Q: [4, -2], s: 5 } : pickWhere(function () { var y0 = r.pick(pm(1, 5)); return { y0: y0, Q: [r.pick(pm(1, 6)), y0 - r.pick(pm(2, 6))], s: r.int(2, 7) }; }, function (z) { var dy = z.y0 - z.Q[1], R = dy * dy + z.s * z.s; return !isSq(R) && radParts(R).k >= 2; });
          var dy = o.y0 - o.Q[1], s = o.s, R = dy * dy + s * s, ks = [o.Q[0] + s, o.Q[0] - s];
          var p = B.valueSet('The distance from ' + t('(k,\\ ' + o.y0 + ')') + ' to ' + t(ptT(o.Q)) + ' is ' + t(lenTex(R)) + '.', ks, { v: 'k', diag: function (A) {
              if (A.some(function (x) { return same(x, -o.Q[0] + s) || same(x, -o.Q[0] - s); })) return { code: 'ax-sign', hint: 'Check the signs: ' + t('k-' + sgp(o.Q[0]) + '=\\pm ' + s) + '.' };
              if (A.some(function (x) { return same(x, ks[0]) || same(x, ks[1]); })) return null; return { code: 'value', hint: 'Square the radical distance carefully: ' + t('(' + lenTex(R) + ')^{2}=' + R) + '.' }; } },
            t('(k-' + sgp(o.Q[0]) + ')^{2}+(' + o.y0 + '-' + sgp(o.Q[1]) + ')^{2}=(' + lenTex(R) + ')^{2}') + '<br>' + t('(k-' + sgp(o.Q[0]) + ')^{2}+' + dy * dy + '=' + R) + ', so ' + t('(k-' + sgp(o.Q[0]) + ')^{2}=' + s * s) + '<br>' + t('k=' + o.Q[0] + '\\pm ' + s) + ': ' + t('k=' + ks[0]) + ' or ' + t('k=' + ks[1]) + '.',
            ['Square the given distance: ' + t('(a\\sqrt{b})^{2}=a^{2}b') + '.', 'Expect two values of ' + t('k') + '.'], 'values of k for a radical distance');
          p.bad = ['k=' + ks[1]];
          return p;
        } },
        { id: 'e9c', level: 'PRG', make: function (r, o) {
          var dy = o.y0 - o.Q[1], neg = o.rr * o.rr - dy * dy;
          return mcPart(r, 'The distance from ' + t('(k,\\ ' + o.y0 + ')') + ' to ' + t(ptT(o.Q)) + ' is ' + t(o.rr) + '. Which describes the values of ' + t('k') + '?', [
            { html: 'There is no real value of ' + t('k') + '.', right: true },
            { html: t('k=' + o.Q[0] + '\\pm\\sqrt{' + (-neg) + '}'), why: 'Check: ' + t('(k-' + sgp(o.Q[0]) + ')^{2}=' + o.rr * o.rr + '-' + dy * dy + '=' + neg) + ' — a <b>negative</b> number. You can’t take the square root of ' + t(neg) + '.' },
            { html: t('k=' + (o.Q[0] + o.rr)) + ' or ' + t('k=' + (o.Q[0] - o.rr)), why: 'That ignores the vertical difference ' + t('(' + o.y0 + '-' + sgp(o.Q[1]) + ')^{2}=' + dy * dy) + '.' },
            { html: t('k=' + o.Q[0]) + ' only', why: 'At ' + t('k=' + o.Q[0]) + ' the distance is ' + t(Math.abs(dy)) + ', not ' + t(o.rr) + '.' }],
            t('(k-' + sgp(o.Q[0]) + ')^{2}+(' + o.y0 + '-' + sgp(o.Q[1]) + ')^{2}=' + o.rr + '^{2}') + '<br>' + t('(k-' + sgp(o.Q[0]) + ')^{2}+' + dy * dy + '=' + o.rr * o.rr) + ', so ' + t('(k-' + sgp(o.Q[0]) + ')^{2}=' + neg) + '.<br>A square is never negative, so there is <b>no real value</b> of ' + t('k') + '.',
            ['Set up the equation and see what ' + t('(k-' + sgp(o.Q[0]) + ')^{2}') + ' has to equal.'], 'no value of k');
        } },
        { id: 'e9d', sub: 'd', level: 'PRG', make: function (r, o) {
          var g = Math.abs(o.Q[1] - o.y0), Pq = t(ptT(o.Q)), side = o.Q[1] > o.y0 ? 'above' : 'below', foot = t(ptT([o.Q[0], o.y0]));
          return mcPart(r, 'Part (c) has no solution. Explain, without algebra, why no point of the form ' + t('(k,\\ ' + o.y0 + ')') + ' can be ' + t(o.rr) + ' units from ' + Pq + '.', [
            { html: 'Every point ' + t('(k,\\ ' + o.y0 + ')') + ' is on the horizontal line ' + t('y=' + o.y0) + ', and ' + Pq + ' is ' + t(g) + ' units ' + side + ' that line. No point of the line is closer than ' + t(g) + ', so none can be only ' + t(o.rr) + ' away.', right: true },
            { html: 'Because ' + Pq + ' is not on the line ' + t('y=' + o.y0) + ', so no distance from it to the line can be calculated.', why: 'Distances from ' + Pq + ' to points on the line can be calculated — the smallest of them is ' + t(g) + '. Compare that gap with ' + t(o.rr) + '.' },
            { html: 'Because ' + t('k') + ' would have to be negative.', why: 'Negative values of ' + t('k') + ' are allowed. The problem is that every point on ' + t('y=' + o.y0) + ' is at least ' + t(g) + ' units from ' + Pq + '.' },
            { html: 'Because a distance can never be a whole number.', why: 'Distances can be whole numbers (' + t('3') + ', ' + t('4') + ', ' + t('5') + ' …). Think about how close the line ' + t('y=' + o.y0) + ' gets to the point.' }],
            'The closest point of the line ' + t('y=' + o.y0) + ' to ' + Pq + ' is ' + foot + ', straight ' + (side === 'above' ? 'below' : 'above') + ' it, at a distance of ' + t(g) + '. A circle of radius ' + t(o.rr) + ' around ' + Pq + ' never reaches the line.', ['How close can a point on the line ' + t('y=' + o.y0) + ' get to ' + Pq + '?'], 'why no solution');
        } }] },
      /* ---- EP 10: point on the y-axis equidistant from A and B ---- */
      { num: '10', parts: [
        { id: 'e10', level: 'MAS', make: function (r) {
          var o = r.chance(0.2) ? { Pp: [0, -1], u: [-4, 2], w: [2, -4] } : pickWhere(function () {
            var u = [r.pick(pm(1, 5)), r.pick(pm(1, 5))], tf = r.pick([function (v) { return [v[1], v[0]]; }, function (v) { return [-v[1], -v[0]]; }, function (v) { return [v[1], -v[0]]; }, function (v) { return [-v[1], v[0]]; }]);
            return { Pp: [0, r.int(-5, 5)], u: u, w: tf(u) };
          }, function (z) { var A = add(z.Pp, z.u), Bq = add(z.Pp, z.w); return A[0] !== 0 && Bq[0] !== 0 && A[1] !== Bq[1] && A[0] !== Bq[0] && !samePt(A, Bq) && Math.abs(A[1]) <= 9 && Math.abs(Bq[1]) <= 9; });
          var Pp = o.Pp, A = add(Pp, o.u), Bq = add(Pp, o.w), y = Pp[1], Mab = mid(A, Bq);
          var lhs = A[0] * A[0] + A[1] * A[1], rhs = Bq[0] * Bq[0] + Bq[1] * Bq[1], ca = -2 * A[1], cb = -2 * Bq[1];
          var c = [[Mab, 'eq-gave-mid', 'That is the midpoint of ' + t('\\overline{AB}') + ' — it is equidistant, but it isn’t on the ' + t('y') + '-axis. Use a point ' + t('(0,\\ y)') + ' and set its distances to ' + t('A') + ' and ' + t('B') + ' equal.'], [[0, Mab[1]], 'eq-mid-y', 'Averaging the ' + t('y') + '-coordinates doesn’t work here. Set ' + t('(0-' + sgp(A[0]) + ')^{2}+(y-' + sgp(A[1]) + ')^{2}=(0-' + sgp(Bq[0]) + ')^{2}+(y-' + sgp(Bq[1]) + ')^{2}') + ' and solve.']];
          var tl = function (c0, c1) { return 'y^{2}' + (c0 === 0 ? '' : c0 > 0 ? '+' + c0 + 'y' : c0 + 'y') + '+' + c1; };
          return ptPart('Determine the coordinates of the point on the ' + t('y') + '-axis that is equidistant from ' + t(nm('A', A)) + ' and ' + t(nm('B', Bq)) + '.', Pp, { cands: c },
            'A point on the ' + t('y') + '-axis is ' + t('(0,\\ y)') + '. Set the squared distances to ' + t('A') + ' and ' + t('B') + ' equal:<br>' + t('(0-' + sgp(A[0]) + ')^{2}+(y-' + sgp(A[1]) + ')^{2}=(0-' + sgp(Bq[0]) + ')^{2}+(y-' + sgp(Bq[1]) + ')^{2}') + '<br>' + t(tl(ca, lhs) + '=' + tl(cb, rhs)) + '<br>' + t((ca - cb) + 'y=' + (rhs - lhs)) + ', so ' + t('y=' + y) + '. The point is ' + t(ptT(Pp)) + '.<br>Check: ' + t(dLine(Pp, A) + simpTail(d2(Pp, A))) + ' and ' + t(dLine(Pp, Bq) + simpTail(d2(Pp, Bq))) + ' ✓',
            ['A point on the ' + t('y') + '-axis is ' + t('(0,\\ y)') + '. Write its squared distance to ' + t('A') + ' and to ' + t('B') + ', and set them equal.', 'Expand the brackets — the ' + t('y^{2}') + ' terms cancel, leaving a linear equation.'], 'equidistant point on the y-axis');
        } }] },
      /* ---- EP 11: parallelogram ABCD ---- */
      { num: '11', section: 'Extra practice D — Diagonals, midpoints, and parallelograms', shared: function (r) {
          if (r.chance(0.2)) return { A: [-6, -2], u: [8, -2], w: [4, 8] };
          return pickWhere(function () {
            var u = [r.int(5, 9), -r.int(0, 3)], rect = r.chance(0.25), w = rect ? scl([-u[1], u[0]], r.pick([1, 1])) : [r.int(-2, 5), r.int(5, 9)];
                        return { A: [r.int(-7, -4), r.int(-4, 0)], u: u, w: w };
          }, function (z) { var C = add(add(z.A, z.u), z.w), D = add(z.A, z.w), Bq = add(z.A, z.u), ac = d2(z.A, C), bd = d2(Bq, D); return (z.u[0] + z.w[0]) % 2 === 0 && (z.u[1] + z.w[1]) % 2 === 0 && [C, D, Bq].every(function (p) { return Math.abs(p[0]) <= 9 && Math.abs(p[1]) <= 9; }) && !isSq(ac) && !isSq(bd) && (radParts(ac).k > 1 || radParts(bd).k > 1); });
        },
        stem: function (o) { var A = o.A, Bq = add(A, o.u), C = add(Bq, o.w), D = add(A, o.w); return 'Quadrilateral ' + t('ABCD') + ' has vertices ' + t(nm('A', A)) + ', ' + t(nm('B', Bq)) + ', ' + t(nm('C', C)) + ', and ' + t(nm('D', D)) + '.' + figPoly([A, Bq, C, D], ['A', 'B', 'C', 'D'], { closed: true, dash: [[A, C], [Bq, D]] }); },
        parts: [
          { id: 'e11a', sub: 'a', level: 'BEG', make: function (r, o) {
            var A = o.A, Bq = add(A, o.u), C = add(Bq, o.w), D = add(A, o.w);
            return B.fields('Determine the midpoint of diagonal ' + t('\\overline{AC}') + ' and the midpoint of diagonal ' + t('\\overline{BD}') + '.', [ptField(t('\\overline{AC}')), ptField(t('\\overline{BD}'))],
              [ptCheck(mid(A, C), { cands: midCands(A, C) }), ptCheck(mid(Bq, D), { cands: midCands(Bq, D) })], [ptKey(mid(A, C)), ptKey(mid(Bq, D))], t('\\overline{AC}') + ': ' + t(ptT(mid(A, C))) + ', ' + t('\\overline{BD}') + ': ' + t(ptT(mid(Bq, D))),
              t(mLine(A, C)) + '<br>' + t(mLine(Bq, D)), HM, 'midpoints of the diagonals');
          } },
          { id: 'e11b', sub: 'b', level: 'EMG', make: function (r, o) {
            var M = mid(o.A, add(add(o.A, o.u), o.w));
            return mcPart(r, 'Both diagonals have the midpoint ' + t(ptT(M)) + '. What does this prove about ' + t('ABCD') + '?', [
              { html: 'The diagonals bisect each other, and a quadrilateral whose diagonals bisect each other is a <b>parallelogram</b>.', right: true },
              { html: 'It proves the diagonals are equal, so ' + t('ABCD') + ' is a rectangle.', why: 'A shared midpoint says where the diagonals cross, not how long they are.' },
              { html: 'It proves the diagonals are perpendicular, so ' + t('ABCD') + ' is a rhombus.', why: 'Midpoints say nothing about the angle between the diagonals.' },
              { html: 'It proves ' + t('ABCD') + ' is a square.', why: 'A square needs equal and perpendicular diagonals too — midpoints alone can’t show that.' }],
              'The two diagonals have the same midpoint, so they bisect each other. Property: <i>a quadrilateral whose diagonals bisect each other is a parallelogram</i>. So ' + t('ABCD') + ' is a parallelogram.', ['What does it mean when two diagonals share a midpoint?'], 'shared midpoint → parallelogram');
          } },
          { id: 'e11c', sub: 'c', level: 'PRG', make: function (r, o) {
            var A = o.A, Bq = add(A, o.u), C = add(Bq, o.w), D = add(A, o.w), n1 = d2(A, C), n2 = d2(Bq, D);
            return B.fields('Calculate the exact lengths of both diagonals.', [lenField('AC'), lenField('BD')], [lenCheck(n1, 1, { cands: dCands(A, C) }), lenCheck(n2, 1, { cands: dCands(Bq, D) })], [lenKey(n1), lenKey(n2)],
              t('AC=' + lenTex(n1) + ',\\ BD=' + lenTex(n2)), t(dLine(A, C, 'AC') + simpTail(n1)) + '<br>' + t(dLine(Bq, D, 'BD') + simpTail(n2)), HD, 'diagonal lengths');
          } },
          { id: 'e11c2', sub: 'c, rectangle?', level: 'EMG', make: function (r, o) {
            var A = o.A, Bq = add(A, o.u), C = add(Bq, o.w), D = add(A, o.w), n1 = d2(A, C), n2 = d2(Bq, D), eq = n1 === n2;
            return mcPart(r, 'Use the diagonal lengths ' + t('AC=' + lenTex(n1)) + ' and ' + t('BD=' + lenTex(n2)) + ' to decide whether ' + t('ABCD') + ' is a rectangle.', [
              { html: 'Yes — it is a parallelogram with <b>equal</b> diagonals, so it is a rectangle.', right: eq, why: eq ? null : 'The diagonals are not equal: ' + t(lenTex(n1) + '\\ne ' + lenTex(n2)) + '.' },
              { html: 'No — a rectangle’s diagonals are equal, and these are not.', right: !eq, why: eq ? 'Look again: ' + t('AC=BD=' + lenTex(n1)) + '.' : null },
              { html: 'Yes — every parallelogram is a rectangle.', why: 'Most parallelograms are slanted. A rectangle is the special parallelogram whose diagonals are equal.' },
              { html: 'You can’t tell from the diagonals.', why: 'You can: a parallelogram is a rectangle exactly when its diagonals are equal.' }],
              'A rectangle is a parallelogram whose diagonals are equal. ' + (eq ? t('AC=BD=' + lenTex(n1)) + ', so ' + t('ABCD') + ' <b>is a rectangle</b>.' : t(lenTex(n1) + '\\ne ' + lenTex(n2)) + ', so ' + t('ABCD') + ' is <b>not a rectangle</b> — it is a parallelogram only.'), ['Which special parallelogram has equal diagonals?'], 'rectangle from diagonals');
          } }] },
      /* ---- EP 12: is PQRS a parallelogram? ---- */
      { num: '12', shared: function (r) {
          if (r.chance(0.2)) return { P: [-5, -3], Q: [3, -5], R: [7, 3], S: [-3, 5] };
          return pickWhere(function () {
            var P0 = [r.int(-6, -3), r.int(-4, -1)], u = [r.int(6, 9), -r.int(0, 3)], w = [r.int(1, 4), r.int(6, 9)], sh = r.chance(0.7) ? r.pick([[2, 0], [-2, 0], [0, 2], [0, -2], [2, 2]]) : [0, 0];
            return { P: P0, Q: add(P0, u), R: add(add(P0, u), w), S: add(add(P0, w), sh) };
          }, function (z) { return (z.P[0] + z.R[0]) % 2 === 0 && (z.P[1] + z.R[1]) % 2 === 0 && (z.Q[0] + z.S[0]) % 2 === 0 && (z.Q[1] + z.S[1]) % 2 === 0 && [z.Q, z.R, z.S].every(function (p) { return Math.abs(p[0]) <= 10 && Math.abs(p[1]) <= 10; }); });
        },
        stem: function (o) { return 'Quadrilateral ' + t('PQRS') + ' has vertices ' + t(nm('P', o.P)) + ', ' + t(nm('Q', o.Q)) + ', ' + t(nm('R', o.R)) + ', and ' + t(nm('S', o.S)) + '. Use the diagonals to decide whether ' + t('PQRS') + ' is a parallelogram.'; },
        parts: [
          { id: 'e12', sub: 'midpoints', level: 'BEG', make: function (r, o) {
            return B.fields('Determine the midpoint of each diagonal.', [ptField(t('\\overline{PR}')), ptField(t('\\overline{QS}'))],
              [ptCheck(mid(o.P, o.R), { cands: midCands(o.P, o.R) }), ptCheck(mid(o.Q, o.S), { cands: midCands(o.Q, o.S) })], [ptKey(mid(o.P, o.R)), ptKey(mid(o.Q, o.S))],
              t('\\overline{PR}') + ': ' + t(ptT(mid(o.P, o.R))) + ', ' + t('\\overline{QS}') + ': ' + t(ptT(mid(o.Q, o.S))), t(mLine(o.P, o.R)) + '<br>' + t(mLine(o.Q, o.S)), ['The diagonals join opposite vertices: ' + t('P') + ' with ' + t('R') + ', and ' + t('Q') + ' with ' + t('S') + '.'].concat(HM.slice(0, 1)), 'midpoints of PR and QS');
          } },
          { id: 'e12b', sub: 'conclusion', level: 'EMG', make: function (r, o) {
            var m1 = mid(o.P, o.R), m2 = mid(o.Q, o.S), eq = samePt(m1, m2);
            return mcPart(r, 'The diagonals’ midpoints are ' + t(ptT(m1)) + ' and ' + t(ptT(m2)) + '. What is your conclusion?', [
              { html: t('PQRS') + ' is a parallelogram: the diagonals bisect each other.', right: eq, why: eq ? null : 'The midpoints are different points, so the diagonals don’t bisect each other.' },
              { html: t('PQRS') + ' is not a parallelogram: the diagonals do not bisect each other.', right: !eq, why: eq ? 'The two midpoints are the same point — the diagonals bisect each other.' : null },
              { html: t('PQRS') + ' is a parallelogram because its midpoints are close together.', why: 'Close isn’t enough: the diagonals bisect each other only if the midpoints are <b>exactly</b> the same point.' },
              { html: 'You need the side lengths before you can decide.', why: 'The diagonal test settles it: a quadrilateral is a parallelogram exactly when its diagonals bisect each other.' }],
              eq ? 'The midpoints are the same, so the diagonals bisect each other: ' + t('PQRS') + ' <b>is a parallelogram</b>.' : 'The midpoints ' + t(ptT(m1)) + ' and ' + t(ptT(m2)) + ' are different, so the diagonals do not bisect each other: ' + t('PQRS') + ' is <b>not a parallelogram</b>.', ['Are the two midpoints the same point?'], 'parallelogram conclusion');
          } }] },
      /* ---- EP 13: the three fourth vertices ---- */
      { num: '13', shared: function (r) {
          if (r.chance(0.2)) return { A: [-3, 1], B: [5, 3], C: [1, -5] };
          return pickWhere(function () { return { A: [r.int(-6, -1), r.int(-2, 4)], B: [r.int(2, 7), r.int(0, 6)], C: [r.int(-2, 4), r.int(-7, -2)] }; }, function (z) {
            var cr = (z.B[0] - z.A[0]) * (z.C[1] - z.A[1]) - (z.B[1] - z.A[1]) * (z.C[0] - z.A[0]); var Ds = [add(z.A, sub(z.C, z.B)), add(z.A, sub(z.B, z.C)), add(z.B, sub(z.C, z.A))];
            return Math.abs(cr) >= 10 && Ds.every(function (p) { return Math.abs(p[0]) <= 12 && Math.abs(p[1]) <= 12; }); });
        },
        stem: function (o) { return '<i>(Stretch)</i> Three vertices of a parallelogram are ' + t(nm('A', o.A)) + ', ' + t(nm('B', o.B)) + ', and ' + t(nm('C', o.C)) + '. There is more than one point ' + t('D') + ' that completes a parallelogram.'; },
        parts: [
          { id: 'e13a', sub: 'a', level: 'MAS', make: function (r, o) {
            var D1 = sub(add(o.A, o.C), o.B), D2 = sub(add(o.A, o.B), o.C), D3 = sub(add(o.B, o.C), o.A), W = [D1, D2, D3];
            var line = function (d1, d2, other, nmD, nmO, nm1, nm2) { var M = mid(d1, d2); return '<b>Diagonals ' + t('\\overline{' + nm1 + nm2 + '}') + ' and ' + t('\\overline{' + nmO + 'D}') + ':</b> midpoint of ' + t('\\overline{' + nm1 + nm2 + '}') + ' ' + t('=' + ptT(M)) + ', so ' + t('D=(2(' + nT(M[0]) + ')-' + sgp(other[0]) + ',\\ 2(' + nT(M[1]) + ')-' + sgp(other[1]) + ')=' + ptT(nmD)) + '.'; };
            return { prompt: 'Determine <b>all three</b> possible positions of ' + t('D') + '. (Type the three points separated by commas.)', input: { type: 'math', keys: 'pairs', placeholder: 'e.g. (1, 2), (3, -4), (5, 0)' },
              check: ptsCheck(W, { missCode: 'par-one-d', missHint: 'Correct so far — there are <b>three</b> positions. Each of the pairs ' + t('AB') + ', ' + t('AC') + ', ' + t('BC') + ' can be a diagonal; the fourth vertex is the far end of the diagonal through the remaining point.', diag: function (L) {
                var avg = [mid(o.A, o.B), mid(o.A, o.C), mid(o.B, o.C)]; if (L.some(function (p) { return avg.some(function (q) { return samePt(p, q); }); })) return { code: 'end-average', hint: 'One of your points is the midpoint of two vertices — that is where the diagonals cross, not the fourth vertex. Double that midpoint and subtract the third vertex.' }; return null; } }),
              key: W.map(ptKey).join(', '), answer: t(W.map(function (p) { return 'D' + ptT(p); }).join(',\\ ')),
              solution: 'Choose which given pair is a diagonal; ' + t('D') + ' is then the other end of the diagonal through the remaining point (double the midpoint, subtract).<br>' + line(o.A, o.C, o.B, D1, 'B', 'A', 'C') + '<br>' + line(o.A, o.B, o.C, D2, 'C', 'A', 'B') + '<br>' + line(o.B, o.C, o.A, D3, 'A', 'B', 'C'),
              hints: ['In a parallelogram the diagonals share a midpoint. Pick a pair of the given points to be a diagonal, find its midpoint, then ' + t('D=2M-') + '(the third point).', 'Do this for each of the three pairs.'], text: 'three fourth vertices', good: [ptKey(D3) + ', ' + ptKey(D1) + ', ' + ptKey(D2)], bad: [ptKey(D1), ptKey(D1) + ', ' + ptKey(D2)] };
          } },
          { id: 'e13b', sub: 'b', level: 'PRG', make: function (r) {
            return mcPart(r, 'Why do exactly three points work, and not four or more?', [
              { html: t('D') + ' must share a diagonal with one of ' + t('A') + ', ' + t('B') + ', ' + t('C') + ', and the other two then form the second diagonal. There are only three ways to choose that pair, and each choice forces one ' + t('D') + '.', right: true },
              { html: 'A parallelogram has four vertices, and one is already used, so three are left.', why: 'Counting vertices isn’t the reason. Count the ways to choose which pair of the given points is a diagonal.' },
              { html: 'Because three points always make a triangle, and a triangle has three sides.', why: 'Close, but the real reason is the diagonal: each choice of which given pair is a diagonal fixes exactly one ' + t('D') + '.' },
              { html: 'There could be more — we just found three of them.', why: 'Every parallelogram through ' + t('A') + ', ' + t('B') + ', ' + t('C') + ' has one of the three pairs as a diagonal, and each pair gives exactly one ' + t('D') + '.' }],
              t('D') + ' is the far end of a diagonal whose other end is one of ' + t('A') + ', ' + t('B') + ', ' + t('C') + '; the other two given points form the second diagonal. There are only three ways to choose which pair (' + t('AB') + ', ' + t('AC') + ' or ' + t('BC') + ') is the other diagonal, and each choice forces a single ' + t('D') + '.', ['How many ways can you pick which two given points form a diagonal?'], 'why exactly three');
          } }] },
      /* ---- EP 14: park map ---- */
      { num: '14', section: 'Extra practice E — A map with a scale', shared: function (r) {
          if (r.chance(0.2)) return { L: [-5, 8], S: [7, -1], W: [10, 8], k: 2 };
          return pickWhere(function () {
            var tr = r.pick([[12, 9], [8, 6], [9, 12], [6, 8], [12, 5], [4, 3]]), L0 = [r.int(-6, -3), r.int(5, 9)];
            return { L: L0, S: [L0[0] + tr[0], L0[1] - tr[1]], W: r.chance(0.45) ? [L0[0] + r.int(-3, 5), L0[1] + r.int(1, 5)] : [r.int(4, 11), r.int(4, 9)], k: r.pick([2, 2, 3, 5]) };
          }, function (z) { var a = dist(z.L, z.W), b = dist(z.S, z.W); return Math.abs(a - b) > 1 && !samePt(z.W, z.S) && !samePt(z.W, z.L) && z.S[1] >= -4; });
        },
        stem: function (o) { return 'A provincial park prints a map with a coordinate grid laid over it. A fire lookout is at ' + t(nm('L', o.L)) + ', a ranger station is at ' + t(nm('S', o.S)) + ', and a warden’s cabin is at ' + t(nm('W', o.W)) + '. On this map ' + t('1') + ' grid unit represents ' + t(o.k) + '&nbsp;km.' + figPoly([o.L, o.S, o.W], ['L', 'S', 'W'], { segs: [[o.L, o.S]] }); },
        parts: [
          { id: 'e14a', sub: 'a', level: 'EMG', make: function (r, o) {
            var D = dist(o.L, o.S);
            return B.fields('Determine the distance from ' + t('L') + ' to ' + t('S') + ' in grid units, then convert it to kilometres.', [{ label: t('LS='), name: 'units', after: 'units' }, { label: t('LS='), name: 'km', after: 'km' }],
              [K.number(D, matchDiag(dCands(o.L, o.S))), K.number(D * o.k, numDiag([[D, 'd-units', 'Multiply the grid units by ' + t(o.k) + '&nbsp;km per unit.'], [D / o.k, 'd-scale-div', 'Each unit is ' + t(o.k) + '&nbsp;km, so <b>multiply</b> by ' + t(o.k) + '.']]))], [String(D), String(D * o.k)], t('LS=' + D) + ' units ' + t('=' + D * o.k) + '&nbsp;km',
              dSteps(o.L, o.S) + '<br>' + t(dLine(o.L, o.S, 'LS') + '=' + D) + ' units; ' + t(D + '\\times ' + o.k + '=' + D * o.k) + '&nbsp;km.', HD, 'LS in units and km');
          } },
          { id: 'e14b', sub: 'b', level: 'BEG', make: function (r, o) {
            return ptPart('A supply drop is to be made at the point exactly halfway between ' + t('L') + ' and ' + t('S') + '. State its coordinates.', mid(o.L, o.S), { cands: midCands(o.L, o.S) }, 'A location, so use the midpoint formula:<br>' + t(mLine(o.L, o.S)) + '.', HM, 'supply drop midpoint');
          } },
          { id: 'e14c', sub: 'c', level: 'EMG', make: function (r, o) {
            var D = dist(o.L, o.S);
            return B.number('How far, in kilometres, must a crew travel from the lookout to reach the supply drop?', D / 2 * o.k, numDiag([[D / 2, 'd-units', 'That is in grid units. Multiply by ' + t(o.k) + '&nbsp;km per unit.'], [D * o.k, 'd-half', 'That is the whole distance from ' + t('L') + ' to ' + t('S') + '. The drop is halfway.'], [D, 'd-units', 'The drop is halfway, and the answer must be in km.']]),
              'The drop is halfway, so the distance is half of ' + t('LS') + ': ' + t('\\tfrac{1}{2}(' + D + ')=' + nT(D / 2)) + ' units ' + t('=' + nT(D / 2) + '\\times ' + o.k + '=' + nT(D / 2 * o.k)) + '&nbsp;km.', ['The drop is at the midpoint, so the trip is half of ' + t('LS') + '.', 'Then convert grid units to km.'], 'lookout to supply drop', { after: 'km' });
          } },
          { id: 'e14d', sub: 'd', level: 'PRG', make: function (r, o) {
            var a = dist(o.L, o.W) * o.k, b = dist(o.S, o.W) * o.k;
            return B.fields('Find the distance from the cabin ' + t('W') + ' to ' + t('L') + ' and to ' + t('S') + ', in kilometres to the nearest tenth.', [{ label: t('LW='), name: 'LW', after: 'km' }, { label: t('SW='), name: 'SW', after: 'km' }],
              [K.approx(a, 1, { diag: matchDiag([[a / o.k, 'd-units', 'Convert to km: multiply the grid units by ' + t(o.k) + '.']], 1) }), K.approx(b, 1, { diag: matchDiag([[b / o.k, 'd-units', 'Convert to km: multiply the grid units by ' + t(o.k) + '.']], 1) })], [fx(a, 1), fx(b, 1)], t('LW\\approx ' + fx(a, 1)) + '&nbsp;km, ' + t('SW\\approx ' + fx(b, 1)) + '&nbsp;km',
              t(dLine(o.L, o.W, 'LW') + simpTail(d2(o.L, o.W))) + ' units, ' + t('\\times ' + o.k + '\\approx ' + fx(a, 1)) + '&nbsp;km<br>' + t(dLine(o.S, o.W, 'SW') + simpTail(d2(o.S, o.W))) + ' units, ' + t('\\times ' + o.k + '\\approx ' + fx(b, 1)) + '&nbsp;km', HD.concat(['Multiply each length by ' + t(o.k) + ' before rounding.']), 'cabin distances in km');
          } },
          { id: 'e14d2', sub: 'd, closer', level: 'LIM', make: function (r, o) {
            var a = rd(dist(o.L, o.W) * o.k, 1), b = rd(dist(o.S, o.W) * o.k, 1), toS = b < a;
            return mcPart(r, 'With ' + t('LW\\approx ' + fx(a, 1)) + '&nbsp;km and ' + t('SW\\approx ' + fx(b, 1)) + '&nbsp;km, is the cabin closer to ' + t('L') + ' or to ' + t('S') + '?', [
              { html: 'Closer to the lookout ' + t('L') + '.', right: !toS, why: toS ? t(fx(b, 1) + '<' + fx(a, 1)) + ', so the ranger station is closer.' : null },
              { html: 'Closer to the ranger station ' + t('S') + '.', right: toS, why: toS ? null : t(fx(a, 1) + '<' + fx(b, 1)) + ', so the lookout is closer.' },
              { html: 'The same distance from both.', why: 'The two distances are different.' }],
              (toS ? t(fx(b, 1) + '<' + fx(a, 1)) + ', so the cabin is <b>closer to the ranger station ' + t('S') + '</b>.' : t(fx(a, 1) + '<' + fx(b, 1)) + ', so the cabin is <b>closer to the lookout ' + t('L') + '</b>.'), ['The smaller distance wins.'], 'which is closer');
          } }] },
      /* ---- EP 15: Rowan subtracted ---- */
      { num: '15', section: 'Extra practice F — Error analysis', shared: function (r) {
          if (r.chance(0.2)) return { A: [-6, 2], B: [4, 10] };
          return pickWhere(function () { return { A: [r.int(-8, -2), r.int(-3, 4)], B: [r.int(1, 8), r.int(5, 12)] }; }, function (z) { return (z.A[0] + z.B[0]) % 2 === 0 && (z.A[1] + z.B[1]) % 2 === 0 && z.A[1] !== 0; });
        },
        stem: function (o) { var h = [(o.B[0] - o.A[0]) / 2, (o.B[1] - o.A[1]) / 2]; return 'Asked for the midpoint of ' + t('\\overline{AB}') + ' with ' + t(nm('A', o.A)) + ' and ' + t(nm('B', o.B)) + ', Rowan wrote ' + t('M=\\left(\\dfrac{x_2-x_1}{2},\\ \\dfrac{y_2-y_1}{2}\\right)=\\left(\\dfrac{' + o.B[0] + '-' + sgp(o.A[0]) + '}{2},\\ \\dfrac{' + o.B[1] + '-' + sgp(o.A[1]) + '}{2}\\right)=' + ptT(h)) + '.'; },
        parts: [
          { id: 'e15a', sub: 'a, error', level: 'EMG', make: function (r) {
            return mcPart(r, 'What is Rowan’s error?', [
              { html: 'He <b>subtracted</b> the coordinates; the midpoint formula <b>adds</b> them (it averages).', right: true },
              { html: 'He divided by ' + t('2') + ' — the midpoint formula doesn’t divide.', why: 'The midpoint formula does divide by ' + t('2') + ': it averages. The problem is the minus signs.' },
              { html: 'He put the ' + t('x') + '- and ' + t('y') + '-coordinates in the wrong order.', why: 'His ' + t('x') + ' comes first and his ' + t('y') + ' second — that part is fine. Look at the operation inside each bracket.' },
              { html: 'He subtracted in the wrong order: it should be ' + t('x_1-x_2') + '.', why: 'Neither order of subtraction gives the midpoint. The midpoint formula adds: ' + t('\\dfrac{x_1+x_2}{2}') + '.' }],
              'Rowan subtracted; the midpoint formula adds the coordinates and divides by ' + t('2') + ' — it averages.', ['Compare his work with ' + t('M\\left(\\dfrac{x_1+x_2}{2},\\ \\dfrac{y_1+y_2}{2}\\right)') + '.'], 'Rowan’s error');
          } },
          { id: 'e15a2', sub: 'a, correct', level: 'BEG', make: function (r, o) {
            return ptPart('Give the correct midpoint.', mid(o.A, o.B), { cands: midCands(o.A, o.B), before: 'M =' }, t(mLine(o.A, o.B, 'M')) + '.', HM, 'correct Rowan’s midpoint');
          } },
          { id: 'e15b', sub: 'b', level: 'PRG', make: function (r, o) {
            var h = [(o.B[0] - o.A[0]) / 2, (o.B[1] - o.A[1]) / 2], M = mid(o.A, o.B);
            return mcPart(r, 'Rowan’s expression is not meaningless — it computes something. What is ' + t(ptT(h)) + '?', [
              { html: 'Half the run and half the rise: the <b>step</b> from ' + t('A') + ' to the midpoint. Adding it to ' + t('A') + ' gives ' + t('M') + ': ' + t(ptT(o.A) + '+' + ptT(h) + '=' + ptT(M)) + '.', right: true },
              { html: 'Half the distance from ' + t('A') + ' to ' + t('B') + '.', why: 'A distance is a single number (here ' + t('\\tfrac{1}{2}AB') + ' would need a square root). ' + t(ptT(h)) + ' is a pair: a horizontal and a vertical step.' },
              { html: 'The slope of ' + t('\\overline{AB}') + '.', why: 'A slope is one number, rise divided by run. Rowan halved the run and the rise separately.' },
              { html: 'The midpoint of ' + t('\\overline{AB}') + ' measured from ' + t('B') + '.', why: 'Try it: start at ' + t('A') + ' and move ' + t(nT(h[0])) + ' across and ' + t(nT(h[1])) + ' up — where do you land?' }],
              t(ptT(h)) + ' is half the run and half the rise — the <b>step</b> (displacement) from ' + t('A') + ' to the midpoint, a movement rather than a location. Adding it to ' + t('A') + ': ' + t(ptT(o.A) + '+' + ptT(h) + '=' + ptT(M)) + ' ' + t('=M') + '.', ['Start at ' + t('A') + ' and move by Rowan’s numbers. Where do you end up?'], 'what Rowan computed');
          } },
          { id: 'e15c', sub: 'c', level: 'PRG', make: function (r) {
            return mcPart(r, 'For which endpoints would Rowan’s method accidentally give the right answer?', [
              { html: 'Only when the first endpoint ' + t('(x_1,\\ y_1)') + ' is the origin ' + t('(0,\\ 0)') + '.', right: true },
              { html: 'When the second endpoint ' + t('(x_2,\\ y_2)') + ' is the origin.', why: 'Then Rowan gets ' + t('\\left(-\\tfrac{x_1}{2},\\ -\\tfrac{y_1}{2}\\right)') + ' but the midpoint is ' + t('\\left(\\tfrac{x_1}{2},\\ \\tfrac{y_1}{2}\\right)') + ' — the signs are wrong.' },
              { html: 'When the segment is horizontal or vertical.', why: 'Try ' + t('(2,\\ 0)') + ' and ' + t('(6,\\ 0)') + ': Rowan gets ' + t('(2,\\ 0)') + ' but the midpoint is ' + t('(4,\\ 0)') + '.' },
              { html: 'Never.', why: 'Solve ' + t('\\tfrac{x_2-x_1}{2}=\\tfrac{x_1+x_2}{2}') + ': it works when ' + t('x_1=0') + '.' }],
              'Rowan’s method is right when ' + t('\\dfrac{x_2-x_1}{2}=\\dfrac{x_1+x_2}{2}') + ', i.e. ' + t('-x_1=x_1') + ', so ' + t('x_1=0') + '; likewise ' + t('y_1=0') + '. Only when the first endpoint is the <b>origin</b>.', ['Set Rowan’s expression equal to the real one and solve.'], 'when Rowan is right');
          } }] },
      /* ---- EP 16: Simone wrote a point for a distance ---- */
      { num: '16', shared: function (r) {
          if (r.chance(0.2)) return { P: [-2, 5], Q: [6, -1] };
          var L = triple(r, 8); if (L[0] % 2 || L[1] % 2) L = [2 * L[0], 2 * L[1]];
          var P0 = [r.int(-6, -1), r.int(2, 8)]; return { P: P0, Q: [P0[0] + L[0], P0[1] - L[1]] };
        },
        stem: function (o) { return 'Asked for the <b>distance</b> between ' + t(nm('P', o.P)) + ' and ' + t(nm('Q', o.Q)) + ', Simone wrote ' + t(ptT(mid(o.P, o.Q))) + ' and circled it.'; },
        parts: [
          { id: 'e16a', sub: 'a', level: 'EMG', make: function (r, o) {
            return mcPart(r, 'Simone’s answer is correct arithmetic for a different question. Which one?', [
              { html: 'The <b>midpoint</b> of ' + t('\\overline{PQ}') + '.', right: true },
              { html: 'The slope of ' + t('\\overline{PQ}') + '.', why: 'A slope is a single number. ' + t(ptT(mid(o.P, o.Q))) + ' is an ordered pair — average the coordinates and see what you get.' },
              { html: 'The run and the rise from ' + t('P') + ' to ' + t('Q') + '.', why: 'The run and rise are ' + t(nT(o.Q[0] - o.P[0])) + ' and ' + t(nT(o.Q[1] - o.P[1])) + '.' },
              { html: 'Half the distance from ' + t('P') + ' to ' + t('Q') + '.', why: 'Half a distance is still one number, not an ordered pair.' }],
              t(mLine(o.P, o.Q)) + ' — Simone found the <b>midpoint</b>.', ['Try averaging the coordinates of ' + t('P') + ' and ' + t('Q') + '.'], 'Simone answered the midpoint');
          } },
          { id: 'e16b', sub: 'b', level: 'BEG', make: function (r, o) {
            var D = dist(o.P, o.Q);
            return B.number('Give the correct answer to the question that was asked.', D, matchDiag(dCands(o.P, o.Q)), dSteps(o.P, o.Q) + '<br>' + t(dLine(o.P, o.Q, 'PQ') + simpTail(d2(o.P, o.Q))) + '.', HD, 'distance PQ');
          } },
          { id: 'e16c', sub: 'c', level: 'EMG', make: function (r) {
            return mcPart(r, 'Which one-glance check on the <b>form</b> of an answer would have caught this?', [
              { html: 'A distance is a single non-negative <b>number</b>; a midpoint is an <b>ordered pair</b>. A bracketed pair as the answer to “how far?” means the wrong formula was used.', right: true },
              { html: 'A distance is always a whole number.', why: 'Distances are often radicals or decimals, e.g. ' + t('\\sqrt{113}\\approx 10.63') + '.' },
              { html: 'A distance must be larger than both coordinates of each point.', why: 'That isn’t true in general — and it doesn’t check the <b>form</b> of the answer.' },
              { html: 'The answer must contain a square root sign.', why: 'Many distances come out as whole numbers (e.g. ' + t('\\sqrt{100}=10') + ').' }],
              'A distance is one non-negative number; a midpoint is an ordered pair ' + t('(x,\\ y)') + '. An answer with brackets and a comma for a “how far” question signals the wrong formula.', ['What kind of answer does a “how far” question need?'], 'form check: number vs pair');
          } }] },
      /* ---- EP 17: Theo averaged ---- */
      { num: '17', shared: function (r) {
          if (r.chance(0.2)) return { A: [-5, 4], M: [3, -2] };
          return pickWhere(function () { return { A: [r.int(-8, -1), r.int(1, 8)], M: [r.int(1, 7), r.int(-7, -1)] }; }, function (z) { return (z.A[0] + z.M[0]) % 2 === 0 && (z.A[1] + z.M[1]) % 2 === 0; });
        },
        stem: function (o) { var th = mid(o.A, o.M); return 'Asked to find ' + t('B') + ' given ' + t(nm('A', o.A)) + ' and midpoint ' + t(nm('M', o.M)) + ', Theo averaged ' + t('A') + ' and ' + t('M') + ': ' + t('B=\\left(\\dfrac{' + o.M[0] + '+' + sgp(o.A[0]) + '}{2},\\ \\dfrac{' + o.M[1] + '+' + sgp(o.A[1]) + '}{2}\\right)=' + ptT(th)) + '.'; },
        parts: [
          { id: 'e17a', sub: 'a', level: 'PRG', make: function (r, o) {
            return mcPart(r, 'Why is averaging the wrong operation here, and what is Theo’s point ' + t(ptT(mid(o.A, o.M))) + ' actually?', [
              { html: 'Averaging finds the point <i>between</i> the two points used. ' + t('B') + ' lies <i>beyond</i> ' + t('M') + ', so Theo found the midpoint of ' + t('\\overline{AM}') + ' — only a quarter of the way from ' + t('A') + ' to ' + t('B') + '.', right: true },
              { html: 'Averaging is right, but Theo should have averaged ' + t('M') + ' with ' + t('B') + '.', why: t('B') + ' is the unknown — you can’t average with it. Solve ' + t('\\dfrac{x_A+x_B}{2}=x_M') + ' for ' + t('x_B') + ' instead.' },
              { html: 'Theo’s point is ' + t('B') + '; he just forgot to round.', why: 'Test it: the midpoint of ' + t('A') + ' and Theo’s point is not ' + t('M') + ' (see part b).' },
              { html: 'Theo’s point is the midpoint of ' + t('\\overline{AB}') + '.', why: 'The midpoint of ' + t('\\overline{AB}') + ' is ' + t('M') + ' itself. Theo’s point sits halfway between ' + t('A') + ' and ' + t('M') + '.' }],
              'Averaging finds the point halfway between the two points used. ' + t('B') + ' is not between ' + t('A') + ' and ' + t('M') + ' — it lies beyond ' + t('M') + ', twice as far from ' + t('A') + ' as ' + t('M') + ' is. Theo’s ' + t(ptT(mid(o.A, o.M))) + ' is the <b>midpoint of ' + t('\\overline{AM}') + '</b>, a quarter of the way from ' + t('A') + ' to ' + t('B') + '.', ['Where is ' + t('B') + ' compared with ' + t('A') + ' and ' + t('M') + '?'], 'why averaging is wrong');
          } },
          { id: 'e17b', sub: 'b', level: 'EMG', make: function (r, o) {
            var th = mid(o.A, o.M), W = mid(o.A, th);
            var p = ptPart('Test Theo’s answer: find the midpoint of ' + t(nm('A', o.A)) + ' and Theo’s point ' + t(ptT(th)) + '. (Is it ' + t('M') + '?)', W, { cands: midCands(o.A, th).concat([[o.M, 'pt', 'Calculate it: average ' + t('A') + ' and Theo’s point. (It is not ' + t('M') + ' — that is why Theo’s answer fails.)']]) },
              t(mLine(o.A, th)) + '.<br>' + t(ptT(W) + '\\ne ' + ptT(o.M)) + ', so Theo’s answer fails. Correct: ' + t('B=2M-A=' + ptT(sub(scl(o.M, 2), o.A))) + '.', HM, 'test Theo’s point');
            if (!Number.isInteger(W[0]) || !Number.isInteger(W[1])) p.good.push('\\left(' + (Number.isInteger(W[0]) ? W[0] : '\\frac{' + W[0] * 2 + '}{2}') + ',' + (Number.isInteger(W[1]) ? W[1] : '\\frac{' + W[1] * 2 + '}{2}') + '\\right)');
            return p;
          } },
          { id: 'e17c', sub: 'c', level: 'EMG', make: function (r) {
            return mcPart(r, 'Which rule recovers a missing endpoint, and why is it the opposite of averaging?', [
              { html: 'Double the midpoint, then subtract the known endpoint: ' + t('x_B=2x_M-x_A') + '. Averaging adds then divides by ' + t('2') + '; the rule undoes those steps in reverse — multiply by ' + t('2') + ', then subtract.', right: true },
              { html: 'Subtract the known endpoint from the midpoint: ' + t('x_B=x_M-x_A') + '.', why: 'That gives the step from ' + t('A') + ' to ' + t('M') + ', not the endpoint. You have to double the midpoint first.' },
              { html: 'Add the midpoint and the known endpoint, then divide by ' + t('2') + '.', why: 'That is averaging again — Theo’s mistake.' },
              { html: 'Double the known endpoint, then subtract the midpoint: ' + t('x_B=2x_A-x_M') + '.', why: 'That goes the wrong way, past ' + t('A') + '. Solve ' + t('x_M=\\dfrac{x_A+x_B}{2}') + ' for ' + t('x_B') + '.' }],
              '<b>Rule:</b> ' + t('x_B=2x_M-x_A') + ', ' + t('y_B=2y_M-y_A') + '. Averaging adds the endpoints and then divides by ' + t('2') + '; solving ' + t('x_M=\\dfrac{x_A+x_B}{2}') + ' for ' + t('x_B') + ' undoes those steps in reverse order: multiply by ' + t('2') + ', then subtract.', ['Solve ' + t('x_M=\\dfrac{x_A+x_B}{2}') + ' for ' + t('x_B') + '.'], 'rule for a missing endpoint');
          } }] }
    ];
  }
})(window);
