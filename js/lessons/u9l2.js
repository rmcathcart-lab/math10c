/* Math 10C · Unit 9 · Lesson 2 — Trig Ratios: Calculator Values and Angle Patterns (M4)
 * Assignment questions 1–12 (u9_L02.tex) and the Lesson 2 Extra Practice (u9_EP02.tex, questions 1–18).
 * Every part is a generator: it keeps the booklet question's structure (a ratio in degree mode, an angle with tenths,
 * a tangent above 1, a pair of complementary angles, a Pythagorean-triple triangle, a ratio whose inverse rounds away
 * from the start, …) and changes the numbers; the booklet's own numbers are among the possible values.
 * Calculator values are rounded answers (K.near) with targeted hints for radian mode, the wrong ratio key, the inverse
 * key instead of the ratio (and the ratio key instead of the inverse), the reciprocal reading of ⁻¹, missing brackets
 * and rounding an intermediate value too early. An exact value typed without the trailing zeros (0.5, 1, 0) is accepted.
 * Explain / justify parts become multiple choice with misconception hints. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, T = HW.trig, F = HW.fmt, ex = HW.ex, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P;

  HW.addCodes({
    'tv-radian': 'Calculator in radian mode', 'tv-wrong-fn': 'Used the wrong ratio key (sin / cos / tan)',
    'tv-inverse': 'Used the inverse key instead of the ratio', 'tv-ratio-for-angle': 'Used the ratio key instead of the inverse (sin instead of sin⁻¹)',
    'tv-reciprocal': 'Read ⁻¹ as “one over” (reciprocal)', 'tv-negative': 'Negative ratio for an acute angle', 'tv-over-1': 'Sine or cosine of an acute angle above 1',
    'tv-early-round': 'Rounded an intermediate value too early', 'tv-brackets': 'Missing brackets / order of operations',
    'tv-ratio-swap': 'Opposite and adjacent swapped', 'tv-hyp': 'Used the hypotenuse in the tangent', 'tv-other-angle': 'Used the ratio of the other acute angle',
    'tv-cof-same': 'Cofunction: kept the same angle instead of 90° − x', 'tv-cof-180': 'Cofunction: used 180° − x instead of 90° − x',
    'tv-cof-plus': 'Cofunction: used 90° + x', 'tv-cof-equal': 'Set the two angles equal instead of complementary', 'tv-gave-ratio': 'Gave a ratio where an angle was asked',
    'tv-not-consecutive': 'Bracket not narrowed to consecutive degrees', 'tv-bracket-off': 'Bracketing degrees on the wrong side', 'tv-bracket-nearest': 'Gave a bracket end instead of the nearest degree',
    'tv-bracket-back': 'Cosine hunt run the wrong way', 'tv-trip': 'Round-trip value wrong', 'tv-out-by': 'Wrong “out by” difference', 'tv-angle-div': 'Divided the angle instead of the ratio',
    'tv-sum': 'Added the given angles (missed the cofunction)', 'tv-wrong-dir': 'Increasing and decreasing mixed up', 'tv-tie': 'Tie in an ordering', 'tv-count': 'Miscounted the true statements', 'tv-pair': 'Wrong pair of equal ratios'
  });

  /* ---------------- trig values and LaTeX ---------------- */
  var FN = { sin: T.sin, cos: T.cos, tan: T.tan }, RAD = { sin: T.radSin, cos: T.radCos, tan: T.radTan };
  var INV = { sin: T.asin, cos: T.acos, tan: T.atan }, IRAD = { sin: Math.asin, cos: Math.acos, tan: Math.atan };
  var CO = { sin: 'cos', cos: 'sin', tan: 'tan' }, NAME = { sin: 'sine', cos: 'cosine', tan: 'tangent' };
  function D(a) { return a + '^\\circ'; }
  function R(x, dp) { return K.roundTo(x, dp); }
  function fx(x, dp) { var v = R(x, dp); if (Math.abs(v) < 1e-12) v = 0; return v.toFixed(dp); }
  function fxT(x, dp) { return F(fx(x, dp)); }                                   // display (thin spaces from 1000)
  function TX(fn, a) { return '\\' + fn + ' ' + D(a); }                          // \sin 72^\circ
  function TXI(fn, v) { return '\\' + fn + '^{-1}(' + v + ')'; }
  function exactish(x) { return Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-7; }
  function full(x) { if (exactish(x)) return F(String(+x.toFixed(4))); return F(x.toFixed(6)) + '\\ldots'; }
  function eqR(x, dp) { return exactish(x) && fx(x, dp) === String(+x.toFixed(4)) ? '=' + fxT(x, dp) : '=' + full(x) + '\\approx ' + fxT(x, dp); }
  function dpWord(dp) { return dp === 0 ? 'the nearest whole number' : dp === 1 ? 'one decimal place' : dp === 2 ? 'two decimal places' : dp === 4 ? 'four decimal places' : dp + ' decimal places'; }
  function range(a, b, st) { var o = []; for (var i = a; i <= b; i += (st || 1)) o.push(i); return o; }
  function pickWhere(gen, okf) { for (var i = 0; i < 4000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u9l2: no valid numbers'); }
  function num(resp) { var p = HW.parse.number(resp == null ? '' : resp); return p.ok ? p.value : null; }
  var RADH = 'That is the value a calculator gives in <b>radian</b> mode. Switch it to <b>degree</b> mode (DEG on the screen) and evaluate it again.';

  /* a rounded value; an exact value typed without trailing zeros (0.5, 1, 0) is accepted too */
  function nearC(x, dp, opt) {
    var c = K.near(x, dp, opt || {});
    return function (resp) {
      var v = num(resp); if (v != null && Math.abs(v - x) < 1e-9) return ok();
      var res = c(resp);
      if (res.code === 'places') return form('places', 'Round to ' + dpWord(dp) + ' (' + dp + ' decimal place' + (dp === 1 ? '' : 's') + ').');
      if (res.code === 'round') return form('round', 'Right — now round it to ' + dpWord(dp) + '.');
      return res;
    };
  }
  function ratioAlts(fn, a) {
    var out = [{ v: RAD[fn](a), code: 'tv-radian', hint: RADH }];
    ['sin', 'cos', 'tan'].forEach(function (g) { if (g !== fn) out.push({ v: FN[g](a), code: 'tv-wrong-fn', hint: 'That is ' + t(TX(g, a)) + '. The question asks for ' + t(TX(fn, a)) + ' — check which key you pressed.' }); });
    if (fn === 'tan') out.push({ v: T.atan(a), code: 'tv-inverse', hint: 'That looks like ' + t(TXI('tan', a)) + ': the inverse key turns a ratio into an angle. Here ' + t(a) + ' is the angle, so press <b>tan</b> (not 2nd tan).' });
    return out;
  }
  function ratioDiag(fn) {
    return function (v) {
      if (v < 0) return { code: 'tv-negative', hint: 'A trig ratio of an acute angle is a ratio of two side lengths, so it is never negative. A negative answer usually means the calculator is in <b>radian</b> mode.' };
      if (fn !== 'tan' && v > 1) return { code: 'tv-over-1', hint: 'The ' + NAME[fn] + ' of an acute angle is less than ' + t('1') + ' (the hypotenuse is the longest side). Check the key you pressed and that the calculator is in degree mode.' };
      return null;
    };
  }
  /* one ratio to dp places */
  function valPart(fn, a, dp, extra) {
    extra = extra || {};
    var x = FN[fn](a), alts = ratioAlts(fn, a);
    var p = B.approx(extra.prompt || t(TX(fn, a)), x, dp, { before: t(TX(fn, a) + '=') },
      'With the calculator in <b>degree</b> mode: ' + t(TX(fn, a) + eqR(x, dp)) + '.' + (extra.note || ''),
      ['Check that the calculator shows <b>DEG</b> (degree mode) before you press anything.', 'Key in ' + t(TX(fn, a)) + ', then round to ' + dpWord(dp) + ': look at the next digit.'], extra.text || (fn + ' ' + a + '° to ' + dp + ' dp'));
    p.answer = t(TX(fn, a) + '\\approx ' + fxT(x, dp));
    p.check = nearC(x, dp, { alts: alts, diag: ratioDiag(fn) });
    p.bad = alts.map(function (al) { return fx(al.v, dp); }).filter(function (s) { return s !== fx(x, dp); });
    return p;
  }
  /* inverse ratio -> angle */
  function angAlts(fn, v) {
    var out = [];
    if (fn === 'tan' || v <= 1) out.push({ v: IRAD[fn](v), code: 'tv-radian', hint: 'That is the angle in <b>radians</b>. Switch the calculator to <b>degree</b> mode and use the inverse key again.' });
    out.push({ v: FN[fn](v), code: 'tv-ratio-for-angle', hint: 'You pressed <b>' + fn + '</b>, which turns an angle into a ratio. To turn a ratio back into an angle use ' + t('\\' + fn + '^{-1}') + ' (2nd ' + fn + ').' });
    if (fn !== 'tan') out.push({ v: INV[CO[fn]](v), code: 'tv-wrong-fn', hint: 'That is ' + t(TXI(CO[fn], R(v, 4))) + ' — the other acute angle. The ratio given is a ' + NAME[fn] + ', so use ' + t('\\' + fn + '^{-1}') + '.' });
    else out.push({ v: T.atan(1 / v), code: 'tv-other-angle', hint: 'That is the other acute angle (it uses adj ÷ opp). For ' + t('\\tan\\theta=' + R(v, 4)) + ' use ' + t(TXI('tan', R(v, 4))) + '.' });
    out.push({ v: 1 / v, code: 'tv-reciprocal', hint: 'The ' + t('-1') + ' in ' + t('\\' + fn + '^{-1}') + ' is not an exponent: ' + t('\\' + fn + '^{-1}') + ' means “the angle whose ' + NAME[fn] + ' is …”, not “one over”. Use the 2nd ' + fn + ' key.' });
    return out;
  }
  function degNear(prompt, x, opt, sol, hints, text) {
    opt = opt || {};
    var p = K.P.near(prompt, x, 0, { unit: '°', alts: opt.alts, diag: opt.diag, before: opt.before, noUnitInAnswer: true }, sol, hints, text);
    p.answer = t(fx(x, 0) + '^\\circ'); p.input.after = '°';
    if (opt.alts) p.bad = opt.alts.map(function (al) { return fx(al.v, 0); }).filter(function (s) { return s !== fx(x, 0); });
    return p;
  }
  function degNum(prompt, ans, diag, sol, hints, text, before) {
    var p = B.number(prompt, ans, diag, sol, hints, text, { after: '°', before: before });
    p.answer = t(ans + '^\\circ'); return p;
  }
  /* several boxes: items [{ label, name, x, dp, alts, diag } | { label, name, check, key, tex }] */
  function boxes(prompt, items, sol, hints, text) {
    var fields = items.map(function (it) { return { label: it.label, name: it.name || it.label, after: it.after }; });
    var checks = items.map(function (it) { return it.check || nearC(it.x, it.dp, { alts: it.alts, diag: it.diag }); });
    var keys = items.map(function (it) { return it.key != null ? String(it.key) : fx(it.x, it.dp); });
    var ans = items.map(function (it, i) { return it.label + ' ' + t(it.tex || (it.key != null ? String(it.key) : fxT(it.x, it.dp))) + (it.after ? it.after : ''); }).join('<br>');
    var p = B.fields(prompt, fields, checks, keys, ans, sol, hints, text);
    p.bad = [keys.map(function (k, i) { return i === 0 ? String(Number(k) + 1) : k; })];
    return p;
  }
  function vBox(fn, a, dp, name) { return { label: t(TX(fn, a) + '='), name: name || t(TX(fn, a)), x: FN[fn](a), dp: dp, alts: ratioAlts(fn, a), diag: ratioDiag(fn) }; }
  function intBox(label, ans, diag, after, name) { return { label: label, name: name, key: String(ans), tex: String(ans), after: after, check: K.number(ans, diag) }; }
  /* multiple choice: 2- and 3-option items get one try */
  function mc(r, prompt, opts, sol, hints, text, keep) {
    var p = B.mc(r, prompt, opts, sol, hints, text, keep);
    if (opts.length <= 3) p.tries = 1;
    if (opts.length === 2) p.input.columns = 2;
    return p;
  }
  function cofDiag(a) { // fill the blank: sin a = cos __  (answer 90 − a)
    return function (v) {
      if (v === a) return { code: 'tv-cof-same', hint: 'Sine and cosine of the <b>same</b> angle are only equal at ' + t(D(45)) + '. Use the other acute angle of the triangle: the two acute angles add to ' + t(D(90)) + '.' };
      if (v === 180 - a) return { code: 'tv-cof-180', hint: 'The two <b>acute</b> angles of a right triangle add to ' + t(D(90)) + ' (the right angle uses up the other ' + t(D(90)) + '). Subtract from ' + t('90') + ', not ' + t('180') + '.' };
      if (v === 90 + a) return { code: 'tv-cof-plus', hint: 'The angle must be between ' + t(D(0)) + ' and ' + t(D(90)) + ': the two acute angles add to ' + t(D(90)) + ', so subtract.' };
      if (v > 0 && v < 1) return { code: 'tv-gave-ratio', hint: 'The blank needs an <b>angle</b> (in degrees), not the value of the ratio.' };
      return null;
    };
  }

  /* ---------------- figures (static SVG, same look as js/geom.js) ---------------- */
  var INK = '#2b3340', C1 = '#13807a', C2 = '#c0571f', GREY = '#9aa3b2';
  function sT(x, y, s, o) { o = o || {}; return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="' + (o.size || 13) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central" fill="' + (o.color || INK) + '"' + (o.weight ? ' font-weight="' + o.weight + '"' : '') + ' paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">' + s + '</text>'; }
  function sL(a, b, o) { o = o || {}; return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + (o.color || INK) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + ' stroke-linecap="round"/>'; }
  /* two angles drawn with the same hypotenuse 1 in a quarter circle; show: 'sin' | 'cos' | 'tan' highlights the legs used */
  function unitFig(a1, a2, show) {
    var O = [34, 206], Rr = 172, rad = Math.PI / 180, s = '';
    var P = function (d) { return [O[0] + Rr * Math.cos(d * rad), O[1] - Rr * Math.sin(d * rad)]; };
    s += sL(O, [O[0] + Rr + 16, O[1]], { w: 1.2, color: GREY }) + sL(O, [O[0], O[1] - Rr - 12], { w: 1.2, color: GREY });
    s += '<path d="M' + (O[0] + Rr) + ' ' + O[1] + ' A' + Rr + ' ' + Rr + ' 0 0 0 ' + O[0] + ' ' + (O[1] - Rr) + '" fill="none" stroke="' + GREY + '" stroke-width="1.2" stroke-dasharray="4 4"/>';
    var vert = show === 'sin' || show === 'tan', hor = show === 'cos' || show === 'tan';
    [a1, a2].forEach(function (d, i) {
      var Bp = P(d), A = [Bp[0], O[1]], c = i ? C2 : C1;
      s += sL(O, Bp, { w: 2, color: c });
      s += sL(A, Bp, { w: vert ? 3.6 : 2, color: c });
      s += '<polyline points="' + (A[0] - 8) + ',' + O[1] + ' ' + (A[0] - 8) + ',' + (O[1] - 8) + ' ' + A[0] + ',' + (O[1] - 8) + '" fill="none" stroke="' + INK + '" stroke-width="1.2"/>';
      var m = [(O[0] + Bp[0]) / 2, (O[1] + Bp[1]) / 2];
      s += sT(m[0] - Math.sin(d * rad) * 11, m[1] - Math.cos(d * rad) * 11, '1', { color: c });
      var rr = 24 + 22 * i, e = [O[0] + rr * Math.cos(d * rad), O[1] - rr * Math.sin(d * rad)];
      s += '<path d="M' + (O[0] + rr) + ' ' + O[1] + ' A' + rr + ' ' + rr + ' 0 0 0 ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) + '" fill="none" stroke="' + c + '" stroke-width="1.6"/>';
      s += sL([196, 16 + 20 * i], [214, 16 + 20 * i], { w: 3, color: c }) + sT(220, 16 + 20 * i, d + '° triangle', { anchor: 'start', color: c, size: 12 });
      if (vert) { var yl = i ? O[1] - Rr * (Math.sin(a1 * rad) + Math.sin(a2 * rad)) / 2 : O[1] - Rr * Math.sin(d * rad) / 2; s += sT(A[0] + 6, yl, (show === 'sin' ? 'sin ' + d + '°' : 'opp'), { anchor: 'start', color: c, size: 12 }); }
      if (hor) { var yb = O[1] + 14 + 16 * i; s += sL([O[0], yb], [A[0], yb], { w: 3, color: c }) + sT(A[0] + 6, yb, (show === 'cos' ? 'cos ' + d + '°' : 'adj'), { anchor: 'start', color: c, size: 12 }); }
    });
    s += sT(O[0] - 10, O[1] + 4, 'O', { weight: 600 });
    var Ht = hor ? 252 : 222;
    return '<svg class="fig-svg" viewBox="0 0 300 ' + Ht + '" width="100%" style="max-width:300px" role="img" aria-label="two right triangles with hypotenuse 1">' + s + '</svg>';
  }
  function triFig(r, opt) { opt.rot = opt.rot == null ? r.int(0, 3) : opt.rot; opt.flip = opt.flip == null ? r.chance(0.5) : opt.flip; return HW.tri(opt); }
  /* one or more rows of a ratio table, as a small HTML table */
  function rowTable(rows, S) {
    var cell = 'style="border:1px solid #c9d1dc;padding:1px 8px;text-align:center"';
    var h = '<table style="border-collapse:collapse;font-size:13px;margin:6px 0"><tr><th ' + cell + '>' + t('\\theta') + '</th>' + rows.map(function (fn) { return '<th ' + cell + '>' + t('\\' + fn + '\\theta') + '</th>'; }).join('') + '</tr>';
    S.forEach(function (a) { h += '<tr><td ' + cell + '>' + t(D(a)) + '</td>' + rows.map(function (fn) { return '<td ' + cell + '>' + (fn === 'tan' && a === 90 ? 'undefined' : t(fxT(FN[fn](a), 4))) + '</td>'; }).join('') + '</tr>'; });
    return h + '</table>';
  }
  /* three right triangles on one baseline with the same adjacent side (EP 9d) */
  function threeTri(A, base) {
    var s = '', adj = 74, x0 = 14, gap = 34, yb = 0, Hs = A.map(function (a) { return adj * T.tan(a); }), Hmax = Math.max.apply(null, Hs), top = 22;
    yb = top + Hmax;
    A.forEach(function (a, i) {
      var xl = x0 + i * (adj + gap + 26), xr = xl + adj, h = Hs[i], P = [xl, yb], Q = [xr, yb], Rr = [xr, yb - h], c = i === 1 ? C2 : C1;
      s += '<polygon points="' + P.join(',') + ' ' + Q.join(',') + ' ' + Rr[0] + ',' + Rr[1].toFixed(1) + '" fill="#f4faf9" stroke="' + INK + '" stroke-width="2"/>';
      s += '<polyline points="' + (xr - 8) + ',' + yb + ' ' + (xr - 8) + ',' + (yb - 8) + ' ' + xr + ',' + (yb - 8) + '" fill="none" stroke="' + INK + '" stroke-width="1.2"/>';
      var rr = 20, e = [xl + rr * Math.cos(a * Math.PI / 180), yb - rr * Math.sin(a * Math.PI / 180)];
      s += '<path d="M' + (xl + rr) + ' ' + yb + ' A' + rr + ' ' + rr + ' 0 0 0 ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) + '" fill="none" stroke="' + c + '" stroke-width="1.6"/>';
      s += sT(xl + 26, yb - 9 - (a > 30 ? 6 : 0), a + '°', { anchor: 'start', color: c, size: 11 });
      s += sT((xl + xr) / 2, yb + 11, String(base), { size: 12 }) + sT(xr + 4, yb - h / 2, String(+(base * T.tan(a)).toFixed(2)), { anchor: 'start', size: 12 });
    });
    var W = x0 + 3 * adj + 2 * (gap + 26) + 34;
    return '<svg class="fig-svg" viewBox="0 0 ' + W + ' ' + (yb + 22).toFixed(0) + '" width="100%" style="max-width:' + W + 'px" role="img" aria-label="three right triangles with the same adjacent side">' + s + '</svg>';
  }
  var SETS = [[0, 5, 25, 45, 65, 85, 90], [0, 10, 30, 45, 60, 80, 90], [0, 15, 35, 45, 55, 75, 90], [0, 5, 20, 45, 70, 85, 90]];

  /* ---------------- Q2–Q4: why a ratio grows or shrinks (MC with a diagram) ---------------- */
  function whyPart(r, fn, a, b) {
    var fig = unitFig(a, b, fn), sA = t(TX(fn, a)), sB = t(TX(fn, b)), opts, sol;
    var vals = t(TX(fn, a) + '\\approx ' + fx(FN[fn](a), 4)) + ', ' + t(TX(fn, b) + '\\approx ' + fx(FN[fn](b), 4));
    if (fn === 'sin') {
      opts = [
        { html: 'With the same hypotenuse, the ' + t(D(b)) + ' triangle reaches higher: its <b>opposite</b> side is longer, so ' + t('\\frac{\\text{opp}}{\\text{hyp}}') + ' is greater.', right: true },
        { html: 'The ' + t(D(b)) + ' triangle has the longer <b>hypotenuse</b>, so its sine is greater.', why: 'Both triangles are drawn with the <b>same</b> hypotenuse (1 unit). Sine is ' + t('\\frac{\\text{opp}}{\\text{hyp}}') + ' — compare the opposite sides.' },
        { html: 'As the angle opens, the <b>adjacent</b> side gets longer, so the sine gets bigger.', why: 'Look at the picture: the adjacent side gets <b>shorter</b> as the angle opens — and sine doesn’t use the adjacent side at all.' },
        { html: b === 2 * a ? 'The angle doubles, so the sine doubles.' : 'The sine grows in proportion to the angle: ' + t('\\frac{' + TX('sin', b) + '}{' + TX('sin', a) + '}=\\frac{' + b + '}{' + a + '}') + '.', why: 'Check on the calculator: ' + vals + '. The sine is a ratio of side lengths; it does not grow in proportion to the angle.' }];
      sol = 'Draw both angles with the same hypotenuse ' + t('OB=1') + ' (above). Opening the angle swings ' + t('B') + ' higher, so the opposite side of the ' + t(D(a)) + ' triangle is shorter than that of the ' + t(D(b)) + ' triangle. Since ' + t('\\sin=\\frac{\\text{opp}}{\\text{hyp}}') + ' and the hypotenuse is the same, the shorter opposite side gives the smaller sine: ' + vals + '.';
    } else if (fn === 'cos') {
      opts = [
        { html: 'With the same hypotenuse, the ' + t(D(a)) + ' triangle is wider: its <b>adjacent</b> side is longer, so ' + t('\\frac{\\text{adj}}{\\text{hyp}}') + ' is greater.', right: true },
        { html: 'The ' + t(D(a)) + ' triangle has the longer <b>opposite</b> side, so its cosine is greater.', why: 'The smaller angle has the <b>shorter</b> opposite side — and cosine uses the adjacent side, ' + t('\\frac{\\text{adj}}{\\text{hyp}}') + '.' },
        { html: 'As the angle opens, the hypotenuse gets longer, so ' + t('\\frac{\\text{adj}}{\\text{hyp}}') + ' gets smaller.', why: 'Both triangles have the <b>same</b> hypotenuse (1 unit). What changes is the adjacent side.' },
        { html: 'Every trig ratio is largest at ' + t(D(0)) + ', and ' + t(D(a)) + ' is closer to ' + t(D(0)) + '.', why: 'Not every ratio: ' + t('\\sin 0^\\circ=0') + ' and ' + t('\\tan 0^\\circ=0') + ' are their <b>smallest</b> values. The reason has to come from the side the cosine uses.' }];
      sol = 'With the hypotenuse fixed at 1 in both triangles, the narrower angle leaves the adjacent side closer to the full length of the hypotenuse, so the adjacent side of the ' + t(D(a)) + ' triangle is longer. Since ' + t('\\cos=\\frac{\\text{adj}}{\\text{hyp}}') + ' and the hypotenuse is the same, the longer adjacent side gives the greater cosine: ' + vals + '.';
    } else {
      opts = [
        { html: 'As the angle opens, the <b>opposite</b> side gets longer and the <b>adjacent</b> side gets shorter, so ' + t('\\frac{\\text{opp}}{\\text{adj}}') + ' grows (bigger top, smaller bottom).', right: true },
        { html: 'The tangent is ' + t('\\frac{\\text{opp}}{\\text{hyp}}') + ', and the opposite side is longer for ' + t(D(b)) + '.', why: 'That is the sine. The tangent is ' + t('\\frac{\\text{opp}}{\\text{adj}}') + '.' },
        { html: 'Both legs get longer as the angle opens, but the opposite side grows faster.', why: 'With the hypotenuse fixed, the adjacent side gets <b>shorter</b> as the angle opens (see the picture).' },
        { html: 'The hypotenuse gets shorter as the angle opens, so the tangent grows.', why: 'The hypotenuse is the same in both triangles, and the tangent doesn’t use it.' }];
      sol = 'Draw both angles with the same hypotenuse. From ' + t(D(a)) + ' to ' + t(D(b)) + ' the opposite side grows while the adjacent side shrinks. Since ' + t('\\tan=\\frac{\\text{opp}}{\\text{adj}}') + ', a bigger numerator over a smaller denominator makes a bigger ratio: ' + vals + '.';
    }
    var stmt = fn === 'sin' ? 'the sine ratio for ' + t(D(a)) + ' is smaller than the sine ratio for ' + t(D(b))
      : fn === 'cos' ? 'the cosine ratio for ' + t(D(a)) + ' is greater than the cosine ratio for ' + t(D(b)) : 'the tangent ratio for ' + t(D(a)) + ' is smaller than the tangent ratio for ' + t(D(b));
    var p = mc(r, 'Both angles are drawn with the same hypotenuse, ' + t('1') + ' unit:' + fig + 'Which explanation shows why ' + stmt + '?', opts, sol,
      ['Name the sides the ' + NAME[fn] + ' uses (SOH CAH TOA), then look at how those sides change in the picture.'], 'why ' + fn + ' ' + a + '° vs ' + b + '°');
    return p;
  }

  /* ---------------- Q5 / EP8: which ratio is greater ---------------- */
  var INCR = { sin: 'Sine <b>increases</b> as the angle increases (the opposite side grows while the hypotenuse stays the same).', cos: 'Careful: cosine <b>decreases</b> as the angle increases — the adjacent side shrinks while the hypotenuse stays the same.', tan: 'Tangent <b>increases</b> as the angle increases (the opposite side grows and the adjacent side shrinks).' };
  function greaterSame(r, fn, a, b) { // compare fn a and fn b
    var big = fn === 'cos' ? (a < b ? a : b) : (a > b ? a : b), small = big === a ? b : a;
    var opts = [{ html: t(TX(fn, big)), right: true }, { html: t(TX(fn, small)), why: INCR[fn] }];
    if (r.chance(0.5)) opts.reverse();
    return mc(r, 'Without a calculator: which is greater, ' + t(TX(fn, a)) + ' or ' + t(TX(fn, b)) + '?', opts,
      INCR[fn].replace('Careful: c', 'C') + ' So ' + t(TX(fn, big)) + ' is greater. (Check: ' + t(TX(fn, big) + '\\approx ' + fx(FN[fn](big), 4)) + ' and ' + t(TX(fn, small) + '\\approx ' + fx(FN[fn](small), 4)) + '.)',
      ['Does the ' + NAME[fn] + ' grow or shrink as the angle opens? Think about the sides it uses.'], fn + ' ' + a + ' vs ' + b, true);
  }
  function sinCos(r, x) { // sin x vs cos x
    var hi = x > 45 ? 'sin' : 'cos';
    var opts = [{ html: t(TX('sin', x)), right: hi === 'sin', why: hi === 'sin' ? null : 'Below ' + t(D(45)) + ' the adjacent side is longer than the opposite side, so the cosine is the greater one.' },
      { html: t(TX('cos', x)), right: hi === 'cos', why: hi === 'cos' ? null : 'Above ' + t(D(45)) + ' the opposite side is longer than the adjacent side, so the sine is the greater one.' },
      { html: 'They are equal', why: 'Sine and cosine of the same angle are equal only at ' + t(D(45)) + ', where opp ' + t('=') + ' adj.' }];
    if (r.chance(0.5)) opts = [opts[1], opts[0], opts[2]];                              // vary the letter of the answer
    return mc(r, 'Without a calculator: which is greater, ' + t(TX('sin', x)) + ' or ' + t(TX('cos', x)) + '?', opts,
      (x < 45 ? 'Since ' + t(D(x) + '<45^\\circ') + ', the adjacent side is longer than the opposite side, so ' + t(TX('cos', x)) + ' is greater.' : 'Since ' + t(D(x) + '>45^\\circ') + ', the opposite side is longer than the adjacent side, so ' + t(TX('sin', x)) + ' is greater.') +
      ' (' + t(TX('sin', x) + '\\approx ' + fx(T.sin(x), 4)) + ', ' + t(TX('cos', x) + '\\approx ' + fx(T.cos(x), 4)) + '.)', ['Compare the angle with the ' + t(D(45)) + ' benchmark, where opp ' + t('=') + ' adj.'], 'sin vs cos ' + x, true);
  }
  function distinctPair(r, lo, hi, gap) { return pickWhere(function () { return [r.int(lo, hi), r.int(lo, hi)]; }, function (p) { return Math.abs(p[0] - p[1]) >= gap; }); }

  /* ---------------- Q7: ratios in a Pythagorean-triple triangle ---------------- */
  var TRIPLES = [[8, 15, 17], [5, 12, 13], [20, 21, 29], [12, 35, 37], [3, 4, 5], [7, 24, 25]];
  function fracBox(label, name, p, q, others) {
    return { label: label, name: name, key: '\\frac{' + p / ex.gcd(p, q) + '}{' + q / ex.gcd(p, q) + '}', tex: '\\frac{' + p / ex.gcd(p, q) + '}{' + q / ex.gcd(p, q) + '}',
      check: K.fraction([p, q], { diag: function (v) { for (var i = 0; i < others.length; i++) if (Math.abs(v - others[i].v) < 1e-9) return { code: others[i].code, hint: others[i].hint }; return null; } }) };
  }
  function ratioBoxes(sh, ang) {
    var o = ang === 'A' ? sh.BC : sh.CA, a = ang === 'A' ? sh.CA : sh.BC, h = sh.AB, os = ang === 'A' ? 'BC' : 'CA', as = ang === 'A' ? 'CA' : 'BC';
    var hint = function (what) { return what + ' Relative to ' + t('\\angle ' + ang) + ': the hypotenuse ' + t('AB') + ' is across from the right angle, the opposite side ' + t(os) + ' is across from ' + t(ang) + ', and the adjacent side ' + t(as) + ' touches ' + t(ang) + '.'; };
    var swap = { code: 'tv-ratio-swap', hint: hint('You used the adjacent side where the opposite side goes (or the reverse).') };
    var other = { code: 'tv-other-angle', hint: hint('That is a ratio for the other acute angle.') };
    return [
      fracBox(t('\\sin ' + ang + '='), t('\\sin ' + ang), o, h, [{ v: a / h, code: swap.code, hint: swap.hint }, { v: o / a, code: 'tv-hyp', hint: 'Sine is ' + t('\\frac{\\text{opp}}{\\text{hyp}}') + ' — it uses the hypotenuse ' + t('AB') + '.' }]),
      fracBox(t('\\cos ' + ang + '='), t('\\cos ' + ang), a, h, [{ v: o / h, code: swap.code, hint: swap.hint }, { v: a / o, code: 'tv-hyp', hint: 'Cosine is ' + t('\\frac{\\text{adj}}{\\text{hyp}}') + ' — it uses the hypotenuse ' + t('AB') + '.' }]),
      fracBox(t('\\tan ' + ang + '='), t('\\tan ' + ang), o, a, [{ v: o / h, code: 'tv-hyp', hint: 'Tangent is ' + t('\\frac{\\text{opp}}{\\text{adj}}') + ' — the two legs, no hypotenuse.' }, { v: a / h, code: 'tv-hyp', hint: 'Tangent is ' + t('\\frac{\\text{opp}}{\\text{adj}}') + ' — the two legs, no hypotenuse.' }, { v: a / o, code: other.code, hint: other.hint }])];
  }

  /* ---------------- Q8 / Q12 / EP18: statement pools ---------------- */
  var ALWAYS_T = [
    { html: t('\\cos x^\\circ') + ' is less than ' + t('1'), sol: t('\\cos x^\\circ=\\frac{\\text{adj}}{\\text{hyp}}') + ' and the hypotenuse is the longest side, so ' + t('\\cos x^\\circ<1') + '.' },
    { html: t('\\sin x^\\circ') + ' is less than ' + t('1'), sol: t('\\sin x^\\circ=\\frac{\\text{opp}}{\\text{hyp}}') + ' and the hypotenuse is the longest side, so ' + t('\\sin x^\\circ<1') + '.' },
    { html: t('\\tan x^\\circ') + ' is greater than ' + t('0'), sol: t('\\tan x^\\circ=\\frac{\\text{opp}}{\\text{adj}}') + ' is a ratio of two positive lengths, so it is positive.' }];
  var ALWAYS_F = [
    { html: t('\\sin x^\\circ') + ' can be greater than ' + t('1'), why: t('\\sin x^\\circ=\\frac{\\text{opp}}{\\text{hyp}}') + ', and the hypotenuse is the longest side, so the sine is always less than ' + t('1') + '.' },
    { html: t('\\cos x^\\circ') + ' can be greater than ' + t('1'), why: t('\\cos x^\\circ=\\frac{\\text{adj}}{\\text{hyp}}') + ', and the hypotenuse is the longest side, so the cosine is always less than ' + t('1') + '.' },
    { html: t('\\tan x^\\circ') + ' is less than ' + t('1'), why: 'Not above ' + t(D(45)) + ': ' + t('\\tan 60^\\circ\\approx 1.7321') + '.' },
    { html: t('\\tan x^\\circ') + ' is greater than ' + t('1'), why: 'Not below ' + t(D(45)) + ': ' + t('\\tan 30^\\circ\\approx 0.5774') + '.' },
    { html: t('\\sin x^\\circ') + ' is less than ' + t('\\cos x^\\circ'), why: 'Only below ' + t(D(45)) + ': ' + t('\\sin 60^\\circ\\approx 0.8660') + ' is greater than ' + t('\\cos 60^\\circ=0.5') + '.' },
    { html: t('\\cos x^\\circ') + ' is less than ' + t('\\sin x^\\circ'), why: 'Only above ' + t(D(45)) + ': ' + t('\\cos 30^\\circ\\approx 0.8660') + ' is greater than ' + t('\\sin 30^\\circ=0.5') + '.' },
    { html: t('\\tan x^\\circ') + ' is less than ' + t('10'), why: 'Not near ' + t(D(90)) + ': ' + t('\\tan 85^\\circ\\approx 11.4301') + '. The tangent has no ceiling.' }];

  /* ---------------- Q9: numerical response ---------------- */
  var NRF = [
    { tex: function (a) { return '\\dfrac{\\cos ' + D(a) + '+\\sin ' + D(a) + '}{\\tan ' + D(a) + '}'; }, f: function (c, s, tn) { return (c + s) / tn; }, nb: function (c, s, tn) { return c + s / tn; } },
    { tex: function (a) { return '\\dfrac{\\sin ' + D(a) + '+\\tan ' + D(a) + '}{\\cos ' + D(a) + '}'; }, f: function (c, s, tn) { return (s + tn) / c; }, nb: function (c, s, tn) { return s + tn / c; } },
    { tex: function (a) { return '\\dfrac{\\tan ' + D(a) + '-\\sin ' + D(a) + '}{\\cos ' + D(a) + '}'; }, f: function (c, s, tn) { return (tn - s) / c; }, nb: function (c, s, tn) { return tn - s / c; } }];

  HW.defineLesson({
    id: 'u9l2', unit: 9, num: '2', title: 'Trig Ratios: Calculator Values and Angle Patterns', outcome: 'M4',
    blurb: 'Evaluating sine, cosine and tangent in degree mode, how each ratio grows or shrinks as the angle opens from 0° to 90°, and the cofunction pattern for complementary angles.',
    questions: [
      { num: '1', section: 'Part A — Calculator values', stem: 'Use a calculator (in <b>degree</b> mode) to determine the value of each trigonometric ratio, to four decimal places.', parts: [
        { id: '1a', sub: 'a', level: 'LIM', make: function (r) { return valPart('sin', r.int(55, 85), 4); } },
        { id: '1b', sub: 'b', level: 'LIM', make: function (r) { return valPart('tan', r.int(20, 44), 4); } },
        { id: '1c', sub: 'c', level: 'LIM', make: function (r) { return valPart('cos', r.int(5, 30), 4); } },
        { id: '1d', sub: 'd', level: 'LIM', make: function (r) { return valPart('tan', r.int(75, 88), 4, { note: ' (Above ' + t(D(45)) + ' the tangent is greater than ' + t('1') + '.)' }); } },
        { id: '1e', sub: 'e', level: 'BEG', make: function (r) { return valPart('sin', r.int(30, 59) + r.int(1, 9) / 10, 4); } },
        { id: '1f', sub: 'f', level: 'BEG', make: function (r) { return valPart('cos', r.int(60, 84) + r.int(1, 9) / 10, 4); } }] },
      { num: '2', section: 'Part B — Why the ratios grow or shrink', stem: 'Explain, using diagrams.', parts: [
        { id: '2', level: 'EMG', make: function (r) { var a = r.int(10, 40), b = r.chance(0.3) ? 2 * a : r.int(a + 15, 80); if (b > 80) b = r.int(a + 15, 80); return whyPart(r, 'sin', a, b); } }] },
      { num: '3', stem: 'Explain, using diagrams.', parts: [
        { id: '3', level: 'EMG', make: function (r) { var a = r.int(10, 40); return whyPart(r, 'cos', a, r.int(a + 20, 80)); } }] },
      { num: '4', stem: 'Explain, using diagrams.', parts: [
        { id: '4', level: 'PRG', make: function (r) { return whyPart(r, 'tan', r.int(5, 30), r.int(40, 75)); } }] },
      { num: '5', section: 'Part C — Comparing ratios without a calculator', stem: 'Without using a calculator, state which ratio in each part has the greater value.', parts: [
        { id: '5a', sub: 'a', level: 'LIM', make: function (r) { var p = distinctPair(r, 10, 85, 15); return greaterSame(r, 'sin', p[0], p[1]); } },
        { id: '5b', sub: 'b', level: 'BEG', make: function (r) { var p = distinctPair(r, 10, 85, 15); return greaterSame(r, 'cos', p[0], p[1]); } },
        { id: '5c', sub: 'c', level: 'LIM', make: function (r) { var p = distinctPair(r, 10, 88, 15); return greaterSame(r, 'tan', p[0], p[1]); } },
        { id: '5d', sub: 'd', level: 'BEG', make: function (r) { return sinCos(r, r.int(10, 40)); } },
        { id: '5e', sub: 'e', level: 'BEG', make: function (r) { return sinCos(r, r.int(55, 85)); } },
        { id: '5f', sub: 'f', level: 'EMG', make: function (r) {
          var x = r.chance(0.5) ? 45 : r.int(50, 65), at45 = x === 45;
          var opts = [{ html: t(TX('tan', x)), right: true },
            { html: t(TX('sin', x)), why: at45 ? 'At ' + t(D(45)) + ', opp ' + t('=') + ' adj, so ' + t('\\sin 45^\\circ=\\cos 45^\\circ\\approx 0.7071') + ', which is less than ' + t('\\tan 45^\\circ=1') + '.' : 'The sine is less than ' + t('1') + ', but ' + t(D(x) + '>45^\\circ') + ' makes ' + t(TX('tan', x)) + ' greater than ' + t('1') + '.' },
            { html: t(TX('cos', x)), why: at45 ? 'At ' + t(D(45)) + ' sine and cosine are equal, and both are less than ' + t('\\tan 45^\\circ=1') + '.' : 'Above ' + t(D(45)) + ' the cosine is the <b>smallest</b> of the three (the adjacent side is the shorter leg).' },
            { html: 'All three are equal', why: 'At ' + t(D(45)) + ' only the sine and cosine are equal (both ' + t('\\approx 0.7071') + '). The tangent is ' + t('\\frac{\\text{opp}}{\\text{adj}}') + (at45 ? t('=1') : t('>1')) + '.' }];
          return mc(r, 'Without a calculator: which is greatest, ' + t(TX('sin', x)) + ', ' + t(TX('cos', x)) + ' or ' + t(TX('tan', x)) + '?', opts,
            at45 ? 'At exactly ' + t(D(45)) + ' the opposite and adjacent sides are equal, so ' + t('\\sin 45^\\circ=\\cos 45^\\circ\\approx 0.7071') + ' and ' + t('\\tan 45^\\circ=\\frac{\\text{opp}}{\\text{adj}}=1') + ' is the greatest.'
              : 'Since ' + t(D(x) + '>45^\\circ') + ', opp ' + t('>') + ' adj, so ' + t(TX('tan', x) + '>1') + ', while the sine and cosine are less than ' + t('1') + '. Order: ' + t(TX('cos', x) + '<' + TX('sin', x) + '<' + TX('tan', x)) + ' (' + t(fx(T.cos(x), 4) + '<' + fx(T.sin(x), 4) + '<' + fx(T.tan(x), 4)) + ').',
            ['Use the ' + t(D(45)) + ' benchmark: sine and cosine are always less than ' + t('1') + '; the tangent passes ' + t('1') + ' at ' + t(D(45)) + '.'], 'greatest of sin/cos/tan ' + x);
        } }] },
      { num: '6', section: 'Part D — The pattern from 0° to 90°', stem: function (sh) { return 'Complete the table of values for the angles ' + sh.S.map(function (a) { return t(D(a)); }).join(', ') + ', rounding to two decimal places.'; },
        shared: function (r) { return { S: r.pick([range(0, 90, 10), range(0, 90, 10), range(0, 90, 15), [0, 12, 24, 36, 48, 60, 72, 84, 90]]) }; },
        parts: [
          { id: '6a', sub: 'a(i)', level: 'BEG', make: function (r, sh) {
            return boxes('The ' + t('\\cos x^\\circ') + ' row:', sh.S.map(function (a) { return vBox('cos', a, 2); }),
              'In degree mode, round each value to two decimal places: ' + sh.S.map(function (a) { return t('\\cos ' + D(a) + '\\approx ' + fx(T.cos(a), 2)); }).join(', ') + '. The cosine row falls steadily, and ' + t('\\cos 90^\\circ') + ' is exactly ' + t('0') + '.',
              ['Check that the calculator is in degree mode.', 'Round to two decimal places: look at the third decimal digit.'], 'cos row ' + sh.S.join(','));
          } },
          { id: '6a2', sub: 'a(ii)', level: 'BEG', make: function (r, sh) {
            var S = sh.S.filter(function (a) { return a < 90; });
            return boxes('The ' + t('\\tan x^\\circ') + ' row (every angle except ' + t(D(90)) + '):', S.map(function (a) { return vBox('tan', a, 2); }),
              'In degree mode: ' + S.map(function (a) { return t('\\tan ' + D(a) + '\\approx ' + fx(T.tan(a), 2)); }).join(', ') + '. The tangent rises slowly at first, passes ' + t('1') + ' at ' + t(D(45)) + ', then faster and faster.',
              ['Check that the calculator is in degree mode.', 'Round to two decimal places: look at the third decimal digit.'], 'tan row ' + S.join(','));
          } },
          { id: '6a3', sub: 'a(iii)', level: 'BEG', make: function (r) {
            return mc(r, 'What goes in the ' + t('\\tan 90^\\circ') + ' box of the table?', [
              { html: 'undefined (the calculator gives an error)', right: true },
              { html: t('0.00'), why: 'That is ' + t('\\cos 90^\\circ') + '. For the tangent, the adjacent side shrinks to ' + t('0') + ' — and you can’t divide by ' + t('0') + '.' },
              { html: t('1.00'), why: 'That is ' + t('\\sin 90^\\circ') + '. The tangent passes ' + t('1') + ' at ' + t(D(45)) + ' and keeps growing.' },
              { html: t('90.00'), why: 'The tangent is a ratio of two sides, not an angle. Try ' + t('\\tan 90^\\circ') + ' on your calculator.' }],
              t('\\tan 90^\\circ=\\frac{\\text{opp}}{\\text{adj}}') + ' would divide by an adjacent side of length ' + t('0') + ', so it is <b>undefined</b> (the calculator gives an error).', ['Try it on your calculator. What happens to the adjacent side as the angle reaches ' + t(D(90)) + '?'], 'tan 90');
          } },
          { id: '6b', sub: 'b(i)', level: 'BEG', make: function (r, sh) {
            var first = function (fn) { return t(sh.S.slice(0, 3).map(function (a) { return fx(FN[fn](a), 2); }).join(',\\ ') + ',\\ldots'); };
            var rows = r.shuffle([{ id: 'cos', html: t('\\cos x^\\circ') }, { id: 'tan', html: t('\\tan x^\\circ') }]);
            return B.grid('As the angle ' + t('x^\\circ') + ' increases from ' + t(D(0)) + ' to ' + t(D(90)) + ', what does each ratio do?', rows,
              [{ id: 'inc', html: 'increases' }, { id: 'dec', html: 'decreases' }, { id: 'same', html: 'stays the same' }], { cos: 'dec', tan: 'inc' },
              { why: function (row) { return { code: 'tv-wrong-dir', hint: row === 'cos' ? 'Read the cosine row of your table from left to right: ' + first('cos') : 'Read the tangent row of your table from left to right: ' + first('tan') }; } },
              'The cosine row falls from ' + t('1') + ' to ' + t('0') + ' (the adjacent side shrinks); the tangent row rises from ' + t('0') + ' (the opposite side grows and the adjacent side shrinks).', ['Read each row of the table from left to right.'], 'cos/tan direction');
          } },
          { id: '6b2', sub: 'b(ii)', level: 'BEG', make: function (r) {
            var items = [intBox('cos from', 1, null, '', 'cos starts at'), intBox('to', 0, null, '', 'cos ends at'), intBox('tan from', 0, null, '', 'tan starts at'),
              intBox('passing ' + t('1') + ' at', 45, function (v) { return v === 1 ? { code: 'value', hint: 'Give the <b>angle</b> where the tangent equals ' + t('1') + '.' } : v === 90 ? { code: 'value', hint: 'At ' + t(D(90)) + ' the tangent is undefined. Where are opp and adj equal?' } : null; }, '°', 'tan = 1 at')];
            if (r.chance(0.5)) items = items.slice(2).concat(items.slice(0, 2));
            return boxes('Complete the statements: as ' + t('x^\\circ') + ' increases from ' + t(D(0)) + ' to ' + t(D(90)) + ', ' + t('\\cos x^\\circ') + ' decreases from ___ to ___, and ' + t('\\tan x^\\circ') + ' increases from ___, passing ' + t('1') + ' at ___.', items,
              t('\\cos x^\\circ') + ' decreases from ' + t('1') + ' to ' + t('0') + '; ' + t('\\tan x^\\circ') + ' increases from ' + t('0') + ', passing ' + t('1') + ' at ' + t(D(45)) + ' (where opp ' + t('=') + ' adj).', ['Read the first and last columns of your table.', 'Where are the opposite and adjacent sides equal?'], 'cos/tan endpoints');
          } }] },
      { num: '7', section: 'Part E — Exact ratios and complementary angles', stem: function (sh) { return 'Triangle ' + t('ABC') + ' has a right angle at ' + t('C') + '.' + sh.fig; },
        shared: function (r) { var tr = r.pick(TRIPLES), sw = r.chance(0.5); var sh = { BC: sw ? tr[1] : tr[0], CA: sw ? tr[0] : tr[1], AB: tr[2] }; sh.fig = triFig(r, { w: sh.CA, h: sh.BC, names: ['A', 'B', 'C'], sides: { a: String(sh.BC), b: String(sh.CA), c: String(sh.AB) }, width: 260 }); return sh; },
        parts: [
          { id: '7a', sub: 'a(i)', level: 'BEG', make: function (r, sh) {
            return boxes('Write each ratio for ' + t('\\angle A') + ' as a fraction in lowest terms.', ratioBoxes(sh, 'A'),
              'Since ' + t('\\angle C=90^\\circ') + ', ' + t('AB=' + sh.AB) + ' is the hypotenuse. Relative to ' + t('\\angle A') + ': opposite ' + t('BC=' + sh.BC) + ', adjacent ' + t('CA=' + sh.CA) + '. So ' + t('\\sin A=\\frac{' + sh.BC + '}{' + sh.AB + '}') + ', ' + t('\\cos A=\\frac{' + sh.CA + '}{' + sh.AB + '}') + ', ' + t('\\tan A=\\frac{' + sh.BC + '}{' + sh.CA + '}') + '.',
              ['The hypotenuse is across from the right angle; the opposite side is across from ' + t('\\angle A') + '.', 'SOH CAH TOA.'], 'ratios of A ' + sh.BC + '-' + sh.CA + '-' + sh.AB);
          } },
          { id: '7a2', sub: 'a(ii)', level: 'BEG', make: function (r, sh) {
            return boxes('Write each ratio for ' + t('\\angle B') + ' as a fraction in lowest terms.', ratioBoxes(sh, 'B'),
              'Relative to ' + t('\\angle B') + ': opposite ' + t('CA=' + sh.CA) + ', adjacent ' + t('BC=' + sh.BC) + ', hypotenuse ' + t('AB=' + sh.AB) + '. So ' + t('\\sin B=\\frac{' + sh.CA + '}{' + sh.AB + '}') + ', ' + t('\\cos B=\\frac{' + sh.BC + '}{' + sh.AB + '}') + ', ' + t('\\tan B=\\frac{' + sh.CA + '}{' + sh.BC + '}') + '.',
              ['The side opposite ' + t('\\angle A') + ' is adjacent to ' + t('\\angle B') + ', and the other way round.'], 'ratios of B ' + sh.BC + '-' + sh.CA + '-' + sh.AB);
          } },
          { id: '7b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var o = [{ value: 'sAcB', html: t('\\sin A=\\cos B') }, { value: 'cAsB', html: t('\\cos A=\\sin B') }, { value: 'sAsB', html: t('\\sin A=\\sin B') }, { value: 'cAcB', html: t('\\cos A=\\cos B') }, { value: 'tAtB', html: t('\\tan A=\\tan B') }, { value: 'sAtB', html: t('\\sin A=\\tan B') }];
            var want = ['sAcB', 'cAsB'];
            return { prompt: 'Which pairs of trigonometric ratios have the same value? Select every true equation.', input: { type: 'select', options: r.shuffle(o) }, key: want, answer: t('\\sin A=\\cos B=\\frac{' + sh.BC + '}{' + sh.AB + '}') + ' and ' + t('\\cos A=\\sin B=\\frac{' + sh.CA + '}{' + sh.AB + '}'), text: 'equal ratio pairs',
              check: K.selectSet(want, function (extra, missing) {
                if (extra.indexOf('tAtB') >= 0) return { code: 'tv-pair', hint: t('\\tan A=\\frac{' + sh.BC + '}{' + sh.CA + '}') + ' and ' + t('\\tan B=\\frac{' + sh.CA + '}{' + sh.BC + '}') + ' — they are reciprocals, not equal.' };
                if (extra.length) return { code: 'tv-pair', hint: 'Write out both fractions for the pair you chose. Are they really the same?' };
                return { code: 'tv-pair', hint: 'There are two pairs. The side opposite ' + t('\\angle A') + ' is adjacent to ' + t('\\angle B') + '.' };
              }),
              solution: t('\\sin A=\\cos B=\\frac{' + sh.BC + '}{' + sh.AB + '}') + ' and ' + t('\\cos A=\\sin B=\\frac{' + sh.CA + '}{' + sh.AB + '}') + '. The two acute angles are complementary, so the side opposite one is adjacent to the other.',
              hints: ['Write all six ratios first, then look for equal fractions.'], bad: [['sAcB'], ['sAcB', 'cAsB', 'tAtB']] };
          } },
          { id: '7c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var tA = '\\frac{' + sh.BC + '}{' + sh.CA + '}', tB = '\\frac{' + sh.CA + '}{' + sh.BC + '}';
            return mc(r, 'How do the values of ' + t('\\tan A') + ' and ' + t('\\tan B') + ' relate to each other?', [
              { html: 'They are reciprocals: ' + t('\\tan A\\times\\tan B=1'), right: true },
              { html: 'They are equal', why: t('\\tan A=' + tA) + ' and ' + t('\\tan B=' + tB) + ' — the same two legs, but upside down.' },
              { html: 'They add to ' + t('1'), why: 'Add them: ' + t(tA + '+' + tB) + ' is more than ' + t('1') + '. Compare the two fractions instead.' },
              { html: t('\\tan B') + ' is the opposite (negative) of ' + t('\\tan A'), why: 'Both are ratios of positive lengths, so both are positive.' }],
              t('\\tan A=' + tA) + ' and ' + t('\\tan B=' + tB) + ' are reciprocals: ' + t('\\tan A\\times\\tan B=' + tA + '\\times' + tB + '=1') + '. The opposite and adjacent legs trade places.', ['Write both tangents as fractions and compare them.'], 'tan A vs tan B');
          } }] },
      { num: '8', section: 'Part F — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '8', level: 'EMG', make: function (r) {
          var tr = r.chance(0.6) ? ALWAYS_T[0] : r.pick(ALWAYS_T.slice(1)), fs = r.sample(ALWAYS_F, 3);
          var opts = [{ html: tr.html, right: true }].concat(fs.map(function (f) { return { html: f.html, why: f.why }; }));
          return mc(r, 'For <b>every</b> acute angle ' + t('x^\\circ') + ', which statement is true?', opts,
            tr.sol + ' The other statements fail for some acute angle:<br>' + fs.map(function (f) { return '• ' + f.html + ': ' + f.why; }).join('<br>'), ['Test each statement with a small angle (like ' + t(D(30)) + ') and a large one (like ' + t(D(60)) + ').'], 'always true for acute angles');
        } }] },
      { num: '9', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { var fm = r.chance(0.5) ? NRF[0] : r.pick(NRF), a = r.pick(range(30, 75, 5)); var c = T.cos(a), s = T.sin(a), tn = T.tan(a), v = fm.f(c, s, tn); return { fm: fm, a: a, v: v, c: c, s: s, tn: tn }; },
            function (o) { var d = o.v * 10 - Math.floor(o.v * 10); return o.v > 0.1 && o.v < 99 && Math.abs(d - 0.5) > 0.06; });
          var a = o.a, x = o.v, alts = [
            { v: o.fm.f(RAD.cos(a), RAD.sin(a), RAD.tan(a)), code: 'tv-radian', hint: RADH },
            { v: o.fm.nb(o.c, o.s, o.tn), code: 'tv-brackets', hint: 'The fraction bar groups the whole top: add (or subtract) the top first, then divide. On a calculator, put brackets around the numerator.' },
            { v: o.fm.f(R(o.c, 1), R(o.s, 1), R(o.tn, 1)), code: 'tv-early-round', hint: 'Keep full calculator values (at least four decimal places) until the very end; rounding each ratio to one decimal place first changes the answer.' }];
          var p = K.P.near('To the nearest tenth, the value of ' + t(o.fm.tex(a)) + ' is ________.', x, 1, { nr: true, alts: alts }, 'Evaluate each ratio in degree mode, keeping full precision: ' + t('\\cos ' + D(a) + eqR(o.c, 4)) + ', ' + t('\\sin ' + D(a) + eqR(o.s, 4)) + ', ' + t('\\tan ' + D(a) + eqR(o.tn, 4)) + '. Then ' + t(o.fm.tex(a) + '=' + fx(x, 4) + '\\ldots\\approx ' + fx(x, 1)) + '.',
            ['Work out the top first, then divide by the bottom.', 'Round only at the end, to the nearest tenth.'], 'NR ratio expression at ' + a + '°');
          p.bad = alts.map(function (al) { return fx(al.v, 1); }).filter(function (s) { return s !== fx(x, 1); });
          return p;
        } }] },
      { num: '10', section: 'Extension — Tangent near 90° and the cofunction relationship', stem: '<i>(Extension)</i> The tangent near ' + t(D(90)) + '.', parts: [
        { id: '10a', sub: 'values', level: 'BEG', make: function (r) {
          var S = r.pick([[89, 89.9, 89.99], [88, 89.5, 89.9], [89, 89.5, 89.99], [87, 89.9, 89.95]]);
          return boxes('Use a calculator to complete, to two decimal places.', S.map(function (a) { return vBox('tan', a, 2); }),
            'In degree mode: ' + S.map(function (a) { return t('\\tan ' + D(a) + '\\approx ' + fxT(T.tan(a), 2)); }).join(', ') + '. The closer the angle gets to ' + t(D(90)) + ', the bigger the tangent.', ['Check degree mode. Type the decimal angle exactly as given.'], 'tan near 90: ' + S.join(', '));
        } },
        { id: '10b', sub: 'statement', level: 'BEG', make: function (r) {
          return mc(r, 'Complete the statement: as the angle ' + t('x^\\circ') + ' increases toward ' + t(D(90)) + ', ' + t('\\tan x^\\circ') + ' …', [
            { html: 'increases without bound (it is undefined at ' + t(D(90)) + ')', right: true },
            { html: 'increases toward ' + t('1'), why: 'That is the sine. ' + t('\\tan 60^\\circ') + ' is already about ' + t('1.73') + ', and ' + t('\\tan 89^\\circ\\approx 57.29') + '.' },
            { html: 'increases toward ' + t('90'), why: 'The tangent is a ratio, not an angle: ' + t('\\tan 89.9^\\circ\\approx 572.96') + ' is already far past ' + t('90') + '.' },
            { html: 'decreases toward ' + t('0'), why: 'That is the cosine. Look at your tangent values near ' + t(D(90)) + '.' }],
            'The tangent values near ' + t(D(90)) + ' (' + t('\\tan 89^\\circ\\approx 57.29,\\ \\tan 89.9^\\circ\\approx 572.96,\\ \\tan 89.99^\\circ\\approx 5729.58') + ') grow without any limit, and ' + t('\\tan 90^\\circ') + ' is undefined.', ['Look at ' + t('\\tan 89^\\circ') + ', ' + t('\\tan 89.9^\\circ') + ' and ' + t('\\tan 89.99^\\circ') + '.'], 'tan toward 90');
        } },
        { id: '10c', sub: 'why', level: 'PRG', make: function (r) {
          return mc(r, 'Using ' + t('\\tan x^\\circ=\\frac{\\text{opp}}{\\text{adj}}') + ', why does the tangent behave this way as ' + t('x^\\circ') + ' approaches ' + t(D(90)) + '?', [
            { html: 'The adjacent side shrinks toward ' + t('0') + ' while the opposite side approaches the hypotenuse, so we divide by a smaller and smaller number.', right: true },
            { html: 'The opposite side becomes infinitely long.', why: 'Picture a fixed hypotenuse: the opposite side can never be longer than it. It is the <b>denominator</b> that changes the story.' },
            { html: 'The opposite side approaches the hypotenuse, so the ratio approaches ' + t('1') + '.', why: 'That describes ' + t('\\frac{\\text{opp}}{\\text{hyp}}') + ', the sine. The tangent divides by the adjacent side.' },
            { html: 'Both legs shrink toward ' + t('0') + ', and ' + t('\\frac{0}{0}') + ' is huge.', why: 'Only the adjacent side shrinks toward ' + t('0') + '; the opposite side grows toward the hypotenuse.' }],
            'As ' + t('x^\\circ') + ' approaches ' + t(D(90)) + ', the adjacent side shrinks toward ' + t('0') + ' while the opposite side approaches the hypotenuse. Dividing by smaller and smaller numbers makes ' + t('\\frac{\\text{opp}}{\\text{adj}}') + ' as large as we like; at exactly ' + t(D(90)) + ' it would be division by ' + t('0') + ', so it is undefined.', ['Picture the triangle standing up straighter and straighter. Which side shrinks?'], 'why tan grows near 90');
        } }] },
      { num: '11', stem: function (sh) { return '<i>(Extension)</i> Right triangle ' + t('PQR') + ' has ' + t('\\angle ' + sh.rt + '=90^\\circ') + ' and ' + t('\\angle ' + sh.xv + '=x^\\circ') + '.'; },
        shared: function (r) { var o = r.chance(0.5) ? ['P', 'Q', 'R'] : r.shuffle(['P', 'Q', 'R']); return { rt: o[0], xv: o[1], th: o[2] }; },
        parts: [
          { id: '11a', sub: 'a', level: 'LIM', make: function (r, sh) {
            var mk = function (rt, xv, th) { return triFig(r, { w: 4, h: 2.6, names: [xv, th, rt], angles: { A: 'x°' }, width: 140 }); };
            return mc(r, 'Which diagram shows this triangle?', [
              { html: mk(sh.rt, sh.xv, sh.th), right: true },
              { html: mk(sh.xv, sh.rt, sh.th), why: 'The right-angle box must be at ' + t(sh.rt) + ', and the ' + t('x^\\circ') + ' angle at ' + t(sh.xv) + '.' },
              { html: mk(sh.rt, sh.th, sh.xv), why: 'The right angle is at ' + t(sh.rt) + ' — good — but ' + t('x^\\circ') + ' belongs at ' + t(sh.xv) + '.' },
              { html: mk(sh.th, sh.xv, sh.rt), why: 'Check where the right-angle box is: it must be at ' + t(sh.rt) + '.' }],
              'The right-angle box is at ' + t(sh.rt) + ' and the angle marked ' + t('x^\\circ') + ' is at ' + t(sh.xv) + '; the third vertex ' + t(sh.th) + ' holds the other acute angle.', ['Find the right-angle box first.'], 'diagram of PQR');
          } },
          { id: '11b', sub: 'b', level: 'BEG', make: function (r, sh) {
            var target = ex.parse('90-x').ast;
            var chk = function (resp) {
              resp = String(resp == null ? '' : resp).replace(/\^\{?\\circ\}?|\\degree|°/g, '');   // (90-x)° is fine: the angle is in degrees
              var a = K.read(resp); if (a.res) return a.res;
              var vs = Object.keys(ex.shape(a.ast).vars || {});
              if (vs.some(function (v) { return v !== 'x'; })) return wrong('var', 'Use the letter ' + t('x') + ' from the question.');
              if (ex.equiv(a.ast, target, ['x'])) return ok();
              var ev = function (s) { return ex.equiv(a.ast, ex.parse(s).ast, ['x']); };
              if (ev('180-x')) return wrong('tv-cof-180', 'The three angles add to ' + t(D(180)) + ', but ' + t('\\angle ' + sh.rt) + ' already uses ' + t(D(90)) + ' of it. What is left for the two acute angles together?');
              if (ev('x-90')) return wrong('sign', 'Check the order: ' + t('\\angle ' + sh.th) + ' and ' + t('x') + ' add to ' + t('90') + ', so ' + t('\\angle ' + sh.th) + ' is ' + t('90') + ' take away ' + t('x') + '.');
              if (ev('90+x')) return wrong('tv-cof-plus', 'The two acute angles add to ' + t(D(90)) + ', so subtract ' + t('x') + ' from ' + t('90') + '.');
              if (ev('90')) return wrong('value', t('90') + ' is the right angle. Take away the ' + t('x^\\circ') + ' too.');
              return wrong('value', null);
            };
            return B.math('Write an expression for the measure of ' + t('\\angle ' + sh.th) + ' in terms of ' + t('x') + ' (in degrees).', chk, '90-x', 'The three angles sum to ' + t(D(180)) + ' and ' + t('\\angle ' + sh.rt + '=90^\\circ') + ', so ' + t('\\angle ' + sh.th + '=180^\\circ-90^\\circ-x^\\circ=(90-x)^\\circ') + '.',
              ['The angles of a triangle add to ' + t(D(180)) + '. How much is left after the right angle?'], 'angle in terms of x', { keys: 'expo', vars: ['x'], before: t('\\angle ' + sh.th + '=') });
          } },
          { id: '11c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var adj = [sh.xv, sh.rt].sort().join(''), hyp = [sh.xv, sh.th].sort().join(''), opp = [sh.rt, sh.th].sort().join('');
            return mc(r, 'Which explanation shows why ' + t('\\cos x^\\circ=\\sin(90-x)^\\circ') + '?', [
              { html: 'Relative to ' + t('\\angle ' + sh.xv) + ', side ' + t(adj) + ' is <b>adjacent</b>; relative to ' + t('\\angle ' + sh.th + '=(90-x)^\\circ') + ', the same side ' + t(adj) + ' is <b>opposite</b>. Both ratios equal ' + t('\\frac{' + adj + '}{' + hyp + '}') + '.', right: true },
              { html: 'Sine and cosine of any angle are always equal.', why: 'Only at ' + t(D(45)) + '. For example ' + t('\\sin 30^\\circ=0.5') + ' but ' + t('\\cos 30^\\circ\\approx 0.8660') + '.' },
              { html: 'Side ' + t(adj) + ' is adjacent to both acute angles, so both ratios use it as the adjacent side.', why: 'A leg touches one acute angle and is across from the other. Relative to ' + t('\\angle ' + sh.th) + ', side ' + t(adj) + ' is the <b>opposite</b> side.' },
              { html: 'Because ' + t('x+(90-x)=180') + ', the angles are supplementary.', why: t('x+(90-x)=90') + ': the two acute angles are <b>complementary</b>. That is why one angle’s adjacent side is the other’s opposite side.' }],
              'The hypotenuse is ' + t(hyp) + ' (across from the right angle at ' + t(sh.rt) + '). Relative to ' + t('\\angle ' + sh.xv + '=x^\\circ') + ' the adjacent side is ' + t(adj) + ', so ' + t('\\cos x^\\circ=\\frac{' + adj + '}{' + hyp + '}') + '. Relative to ' + t('\\angle ' + sh.th + '=(90-x)^\\circ') + ' the opposite side is ' + t(adj) + ', so ' + t('\\sin(90-x)^\\circ=\\frac{' + adj + '}{' + hyp + '}') + '. Both are the same fraction.',
              ['Find the side adjacent to the ' + t('x^\\circ') + ' angle. What is that side for the other acute angle?'], 'why cos x = sin(90-x)');
          } },
          { id: '11d', sub: 'd(i)', level: 'BEG', make: function (r) { var a = r.pick(range(5, 85).filter(function (v) { return v !== 45; })); return degNum('Complete, using an angle between ' + t(D(0)) + ' and ' + t(D(90)) + ': ' + t('\\cos ' + D(a) + '=\\sin\\ \\underline{\\quad}'), 90 - a, cofDiag(a), t('\\cos ' + D(a) + '=\\sin(90-' + a + ')^\\circ=\\sin ' + D(90 - a)) + '. (Both are about ' + t(fx(T.cos(a), 4)) + '.)', ['The two acute angles of a right triangle add to ' + t(D(90)) + '.'], 'cos ' + a + ' = sin ?', t('\\cos ' + D(a) + '=\\sin')); } },
          { id: '11d2', sub: 'd(ii)', level: 'BEG', make: function (r) { var a = r.pick(range(5, 85).filter(function (v) { return v !== 45; })); return degNum('Complete, using an angle between ' + t(D(0)) + ' and ' + t(D(90)) + ': ' + t('\\cos ' + D(a) + '=\\sin\\ \\underline{\\quad}'), 90 - a, cofDiag(a), t('\\cos ' + D(a) + '=\\sin(90-' + a + ')^\\circ=\\sin ' + D(90 - a)) + '. (Both are about ' + t(fx(T.cos(a), 4)) + '.)', ['Subtract the angle from ' + t('90') + '.'], 'cos ' + a + ' = sin ?', t('\\cos ' + D(a) + '=\\sin')); } }] },
      { num: '12', stem: '<i>(Multiple Choice; Extension)</i>', parts: [
        { id: '12', level: 'PRG', make: function (r) {
          var TRUE = [{ tex: '\\sin T=\\cos U', sol: 'true: the side opposite ' + t('T') + ' is adjacent to ' + t('U') + '.' }, { tex: '\\cos T=\\sin U', sol: 'true: the side adjacent to ' + t('T') + ' is opposite ' + t('U') + '.' },
            { tex: '\\tan U=\\frac{1}{k}', sol: 'true: the two legs trade places, so ' + t('\\tan U') + ' is the reciprocal of ' + t('\\tan T') + '.' }, { tex: '\\tan T\\times\\tan U=1', sol: 'true: the tangents are reciprocals.' }];
          var FALSE = [{ tex: '\\tan U=k', sol: 'false: ' + t('\\tan U=\\frac{1}{k}') + ' (equal to ' + t('k') + ' only if ' + t('k=1') + ', which is not given).' }, { tex: '\\sin T=\\sin U', sol: 'false in general: only when both angles are ' + t(D(45)) + '.' },
            { tex: '\\cos T=\\cos U', sol: 'false in general: only when both angles are ' + t(D(45)) + '.' }, { tex: '\\tan T=\\tan U', sol: 'false in general: the tangents are reciprocals, not equal.' }];
          var n = r.pick([0, 1, 2, 2, 3]), st = r.shuffle(r.sample(TRUE, n).concat(r.sample(FALSE, 3 - n)));
          if (n === 2 && r.chance(0.4)) st = [TRUE[0], FALSE[0], TRUE[1]];                       // the booklet's three statements
          var trueN = st.filter(function (s) { return TRUE.indexOf(s) >= 0; }).length;
          var opts = [0, 1, 2, 3].map(function (c) { return { html: t(c), right: c === trueN, why: c > trueN ? 'You counted a false statement as true. Test each one on a ' + t('3') + '-' + t('4') + '-' + t('5') + ' triangle.' : 'One of the statements you rejected is true. Remember: ' + t('\\angle T') + ' and ' + t('\\angle U') + ' are complementary.', code: 'tv-count' }; });
          return mc(r, 'Triangle ' + t('STU') + ' is right-angled at ' + t('S') + ', with ' + t('\\tan T=k') + '. Three statements are made:<br>' + st.map(function (s, i) { return 'Statement ' + (i + 1) + '. ' + t(s.tex); }).join('<br>') + '<br>How many of these statements are true?', opts,
            t('\\angle S=90^\\circ') + ', so ' + t('\\angle T') + ' and ' + t('\\angle U') + ' are complementary: the side opposite one is adjacent to the other.<br>' + st.map(function (s, i) { return 'Statement ' + (i + 1) + ' is ' + s.sol; }).join('<br>') + '<br>So <b>' + trueN + '</b> ' + (trueN === 1 ? 'statement is' : 'statements are') + ' true.',
            ['Sketch triangle ' + t('STU') + ' and label the legs. Which side is opposite ' + t('T') + '? Opposite ' + t('U') + '?'], 'STU statements', true);
        } }] }
    ],
    extra: EXTRA()
  });

  /* ================= Extra practice (u9_EP02.tex) ================= */
  function tripFields(fn, a) { // ratio to 4 dp, then the inverse to the nearest degree
    var x = FN[fn](a), v4 = R(x, 4);
    return [vBox(fn, a, 4), { label: t('\\' + fn + '^{-1}') + ' of that ' + t('='), name: t('\\' + fn + '^{-1}(' + fx(x, 4) + ')'), x: INV[fn](v4), dp: 0, after: '°', tex: fx(INV[fn](v4), 0) + '^\\circ', alts: angAlts(fn, v4) }];
  }
  function bracketCheck(fn, v, withNearest) { // [lower, upper (, nearest)] whole degrees around the angle with fn = v
    var th = INV[fn](v), L = Math.floor(th), N = Math.round(th);
    return function (resp) {
      resp = resp || [];
      var a = num(resp[0]), b = num(resp[1]);
      if (a == null || b == null) return form('incomplete', 'Fill in both bracket boxes with whole numbers of degrees.');
      var lo = Math.min(a, b), hi = Math.max(a, b);
      if (!(lo === L && hi === L + 1)) {
        if (lo <= th && th <= hi && hi - lo > 1) return form('tv-not-consecutive', 'Your two angles do trap ' + t('\\theta') + ', but they are ' + (hi - lo) + '° apart. Keep testing until the two whole degrees are <b>consecutive</b>.');
        if (hi === lo + 1) {
          var flo = FN[fn](lo), fhi = FN[fn](hi);
          return wrong(fn === 'cos' ? 'tv-bracket-back' : 'tv-bracket-off', 'Test them: ' + t(TX(fn, lo) + '\\approx ' + fx(flo, 4)) + ' and ' + t(TX(fn, hi) + '\\approx ' + fx(fhi, 4)) + '. The target ' + t(v) + ' must lie <b>between</b> those two values.' + (fn === 'cos' ? ' Remember the cosine <b>decreases</b> as the angle grows.' : ''));
        }
        return wrong('value', null);
      }
      if (withNearest) {
        var c = nearC(th, 0, { alts: angAlts(fn, v), diag: function (w) { return (w === L || w === L + 1) ? { code: 'tv-bracket-nearest', hint: t(TXI(fn, v) + '=' + th.toFixed(4) + '\\ldots^\\circ') + ' — which whole degree is it <b>closer</b> to?' } : null; } })(resp[2]);
        if (c.v !== 'correct') return { v: c.v, code: c.code, hint: '<b>Nearest degree:</b> ' + (c.hint || 'Check this one again.') };
      }
      return ok();
    };
  }
  function statementMC(r, prompt, pool, sol0, hints, text) { // pool: [{tex|html, truth, sol}] -> how many of three are true
    var st = r.sample(pool, 3), n = st.filter(function (s) { return s.truth; }).length;
    var opts = [0, 1, 2, 3].map(function (c) { return { html: t(c), right: c === n, code: 'tv-count', why: c > n ? 'You counted a false statement as true. Check each one again.' : 'One of the statements you rejected is true. Check each one again.' }; });
    return mc(r, prompt + '<br>' + st.map(function (s, i) { return 'Statement ' + (i + 1) + '. ' + (s.html || t(s.tex)); }).join('<br>') + '<br>How many of these statements are true?', opts,
      (sol0 ? sol0 + '<br>' : '') + st.map(function (s, i) { return '<b>Statement ' + (i + 1) + ': ' + (s.truth ? 'true' : 'false') + '.</b> ' + s.sol; }).join('<br>') + '<br>So <b>' + n + '</b> ' + (n === 1 ? 'statement is' : 'statements are') + ' true.', hints, text, true);
  }

  function EXTRA() {
    return [
      /* ---------- Part A ---------- */
      { num: '1', section: 'Extra practice A — Degree mode, and what a calculator value actually is', stem: 'Use a calculator, in <b>degree</b> mode, to evaluate each ratio to four decimal places.',
        shared: function (r) { var a = r.int(11, 39); return { a: a, b: 90 - a }; },
        parts: [
          { id: 'e1a', sub: 'a', level: 'LIM', make: function (r, sh) { return valPart('sin', sh.a, 4); } },
          { id: 'e1b', sub: 'b', level: 'LIM', make: function (r, sh) { return valPart('cos', sh.a, 4); } },
          { id: 'e1c', sub: 'c', level: 'LIM', make: function (r, sh) { return valPart('tan', sh.a, 4); } },
          { id: 'e1d', sub: 'd', level: 'LIM', make: function (r, sh) { return valPart('sin', sh.b, 4); } },
          { id: 'e1e', sub: 'e', level: 'LIM', make: function (r, sh) { return valPart('cos', sh.b, 4); } },
          { id: 'e1f', sub: 'f', level: 'LIM', make: function (r, sh) { return valPart('tan', sh.b, 4); } },
          { id: 'e1g', sub: 'g', level: 'BEG', make: function (r, sh) {
            var a = sh.a, b = sh.b, o = [{ value: 'sc', html: t(TX('sin', a)) + ' and ' + t(TX('cos', b)) }, { value: 'cs', html: t(TX('cos', a)) + ' and ' + t(TX('sin', b)) },
              { value: 'ss', html: t(TX('sin', a)) + ' and ' + t(TX('sin', b)) }, { value: 'cc', html: t(TX('cos', a)) + ' and ' + t(TX('cos', b)) }, { value: 'tt', html: t(TX('tan', a)) + ' and ' + t(TX('tan', b)) }, { value: 'sca', html: t(TX('sin', a)) + ' and ' + t(TX('cos', a)) }];
            return { prompt: 'Among the six values ' + t('\\sin,\\ \\cos,\\ \\tan') + ' of ' + t(D(a)) + ' and of ' + t(D(b)) + ', exactly two pairs are equal. Select both pairs.', input: { type: 'select', options: r.shuffle(o) }, key: ['sc', 'cs'],
              answer: t(TX('sin', a) + '=' + TX('cos', b) + '\\approx ' + fx(T.sin(a), 4)) + ' and ' + t(TX('cos', a) + '=' + TX('sin', b) + '\\approx ' + fx(T.cos(a), 4)), text: 'equal pairs ' + a + '/' + b,
              check: K.selectSet(['sc', 'cs'], function (extra) { return { code: 'tv-pair', hint: extra.length ? 'Evaluate both ratios in the pair you chose — they are not equal.' : 'There are two pairs. Compare the sine of one angle with the cosine of the other.' }; }),
              solution: t(TX('sin', a) + '=' + TX('cos', b) + '\\approx ' + fx(T.sin(a), 4)) + ' and ' + t(TX('cos', a) + '=' + TX('sin', b) + '\\approx ' + fx(T.cos(a), 4)) + '.', hints: ['Evaluate all six to four decimal places and look for matches.'], bad: [['sc'], ['tt']] };
          } },
          { id: 'e1h', sub: 'h', level: 'EMG', make: function (r, sh) {
            var a = sh.a, b = sh.b;
            return mc(r, 'The calculator gives ' + t(TX('sin', a) + '=' + TX('cos', b)) + ' and ' + t(TX('cos', a) + '=' + TX('sin', b)) + ', and ' + t(a + '+' + b + '=90') + '. Why did those pairs <b>have</b> to come out equal?', [
              { html: t(D(a)) + ' and ' + t(D(b)) + ' are the two acute angles of one right triangle. The side opposite ' + t(D(a)) + ' is the side adjacent to ' + t(D(b)) + ', so ' + t(TX('sin', a)) + ' and ' + t(TX('cos', b)) + ' are the same fraction.', right: true },
              { html: 'Sine and cosine always give the same values, just in a different order.', why: 'That is the pattern, not the reason. The reason comes from the sides of one right triangle.' },
              { html: 'The two angles add to ' + t(D(90)) + ', so their ratios add to ' + t('1') + '.', why: 'Check: ' + t(TX('sin', a) + '+' + TX('sin', b)) + ' is not ' + t('1') + '. The angles add to ' + t(D(90)) + '; the ratios are <b>equal</b>, not adding to 1.' },
              { html: 'The calculator rounds both to four decimal places, so they only look equal.', why: 'They are exactly equal: the same side over the same hypotenuse.' }],
              'Because ' + t(a + '+' + b + '=90') + ', a right triangle with one acute angle of ' + t(D(a)) + ' has its other acute angle equal to ' + t(D(b)) + '. The side <b>opposite</b> ' + t(D(a)) + ' is the side <b>adjacent</b> to ' + t(D(b)) + ', and the hypotenuse belongs to both. So ' + t(TX('sin', a) + '=\\frac{\\text{opp}}{\\text{hyp}}') + ' and ' + t(TX('cos', b) + '=\\frac{\\text{adj}}{\\text{hyp}}') + ' are the same fraction.',
              ['Draw one right triangle with angles ' + t(D(a)) + ' and ' + t(D(b)) + '. Label the side opposite ' + t(D(a)) + '. What is it for ' + t(D(b)) + '?'], 'why cofunction pairs equal');
          } },
          { id: 'e1i', sub: 'i(1)', level: 'BEG', make: function (r, sh) {
            var a = sh.a, b = sh.b, x = T.tan(a) * T.tan(b), early = R(T.tan(a), 4) * R(T.tan(b), 4);
            var p = B.approx('Evaluate ' + t(TX('tan', a) + '\\times' + TX('tan', b)) + ' to four decimal places.', x, 4, { before: t(TX('tan', a) + '\\times' + TX('tan', b) + '=') },
              t(TX('tan', a) + '\\times' + TX('tan', b) + '=' + T.tan(a).toFixed(4) + '\\ldots\\times' + T.tan(b).toFixed(4) + '\\ldots=1.0000') + '. (Keep the full calculator values: the product is exactly ' + t('1') + '.)', ['Use the full calculator values, not the rounded ones — or key the whole product in at once.'], 'tan a × tan b');
            p.check = nearC(1, 4, { alts: [{ v: early, code: 'tv-early-round', hint: 'You multiplied the <b>rounded</b> values. Use the full calculator values (or key in the whole product at once) and round only at the end.' }, { v: RAD.tan(a) * RAD.tan(b), code: 'tv-radian', hint: RADH }] });
            p.answer = t('1.0000'); p.good = ['1']; return p;
          } },
          { id: 'e1i2', sub: 'i(2)', level: 'EMG', make: function (r, sh) {
            var a = sh.a, b = sh.b;
            return mc(r, 'Explain why ' + t(TX('tan', a) + '\\times' + TX('tan', b) + '=1') + '.', [
              { html: 'In one triangle, ' + t(TX('tan', a) + '=\\frac{\\text{opp}}{\\text{adj}}') + ' while ' + t(TX('tan', b)) + ' is ' + t('\\frac{\\text{adj}}{\\text{opp}}') + ' (the legs trade places), so they are reciprocals.', right: true },
              { html: 'Both tangents are close to ' + t('1') + ', so their product is close to ' + t('1') + '.', why: t(TX('tan', a) + '\\approx ' + fx(T.tan(a), 4)) + ' is not close to ' + t('1') + '. The product is <b>exactly</b> ' + t('1') + ' for a reason.' },
              { html: 'The angles add to ' + t(D(90)) + ', and ' + t('\\tan 90^\\circ=1') + '.', why: t('\\tan 90^\\circ') + ' is undefined (and ' + t('\\tan 45^\\circ') + ' is the one equal to ' + t('1') + ').' },
              { html: 'Any tangent times any other tangent is ' + t('1') + '.', why: 'Try ' + t('\\tan 20^\\circ\\times\\tan 30^\\circ') + ' — it is not ' + t('1') + '. It only works for complementary angles.' }],
              'In the right triangle with acute angles ' + t(D(a)) + ' and ' + t(D(b)) + ', the leg opposite one angle is adjacent to the other. So ' + t(TX('tan', a) + '=\\frac{\\text{opp}}{\\text{adj}}') + ' and ' + t(TX('tan', b) + '=\\frac{\\text{adj}}{\\text{opp}}') + ': reciprocals, so the product is exactly ' + t('1') + '.', ['Write both tangents with the side names of one triangle.'], 'why tan product 1');
          } }] },
      { num: '2', stem: function (sh) { return '<b>The radian-mode disaster.</b> A student’s calculator was in <b>radian</b> mode the whole time. Their four answers were ' + t(TX('sin', sh.a) + '=' + fx(RAD.sin(sh.a), 4)) + ', ' + t(TX('cos', sh.b) + '=' + fx(RAD.cos(sh.b), 4)) + ', ' + t(TX('tan', sh.c) + '=' + fx(RAD.tan(sh.c), 4)) + ' and ' + t(TX('sin', sh.d) + '=' + fx(RAD.sin(sh.d), 4)) + '.'; },
        shared: function (r) {
          if (r.chance(0.3)) return { a: 30, b: 40, c: 20, d: 75 };
          var a = pickWhere(function () { return r.int(10, 45); }, function (x) { return RAD.sin(x) < -0.1; }), b = pickWhere(function () { return r.int(15, 60); }, function (x) { return RAD.cos(x) < -0.1 && x !== a; });
          var c = pickWhere(function () { return r.int(5, 40); }, function (x) { return RAD.tan(x) > 1.2 && RAD.tan(x) < 9; }), d = pickWhere(function () { return r.int(50, 85); }, function (x) { return RAD.sin(x) < -0.1; });
          return { a: a, b: b, c: c, d: d };
        },
        parts: [
          { id: 'e2a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var its = [vBox('sin', sh.a, 4), vBox('cos', sh.b, 4), vBox('tan', sh.c, 4), vBox('sin', sh.d, 4)];
            its.forEach(function (it) { it.alts[0].hint = 'That is the student’s radian-mode value. Switch to <b>degree</b> mode.'; });
            return boxes('Write what each of the four values <b>should</b> have been, to four decimal places.', its,
              'In <b>degree</b> mode: ' + [['sin', sh.a], ['cos', sh.b], ['tan', sh.c], ['sin', sh.d]].map(function (q) { return t(TX(q[0], q[1]) + '\\approx ' + fx(FN[q[0]](q[1]), 4)); }).join(', ') + '.', ['Set the calculator to degree mode first (DEG on the screen).'], 'radian disaster: correct values');
          } },
          { id: 'e2b', sub: 'b', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Three of the four answers are negative. Why is a negative answer impossible for an acute angle — and why is that one symptom enough to diagnose the mode?', [
              { html: 'Each ratio is one side length divided by another, and side lengths are positive — so a negative value cannot be a ratio of any triangle’s sides. The calculator must be answering a different question (radians).', right: true },
              { html: 'Negative values only happen for angles bigger than ' + t(D(90)) + ', and these angles are smaller.', why: 'The question is about acute angles in a triangle: argue from the sides. ' + t('\\frac{\\text{opp}}{\\text{hyp}}') + ' is positive over positive.' },
              { html: 'Sine and cosine are always between ' + t('0.5') + ' and ' + t('1') + '.', why: 'Not true: ' + t('\\sin 10^\\circ\\approx 0.1736') + '. The point is that they are never <b>negative</b>, because lengths are positive.' },
              { html: 'Calculators show negative values when they round.', why: 'Rounding never changes the sign. The negative sign comes from radian mode.' }],
              'Every trigonometric ratio of an acute angle is a quotient of two side lengths, and side lengths are positive: ' + t('\\frac{\\text{opp}}{\\text{hyp}},\\ \\frac{\\text{adj}}{\\text{hyp}},\\ \\frac{\\text{opp}}{\\text{adj}}') + ' are positive over positive. A negative answer cannot be a ratio of sides, so the calculator read the angles as radians. One negative value is enough to convict the mode.', ['What kind of numbers are on the top and bottom of every ratio?'], 'why negative impossible');
          } },
          { id: 'e2c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var v = fx(RAD.tan(sh.c), 4);
            return mc(r, 'The answer ' + t(TX('tan', sh.c) + '=' + v) + ' is positive, so the negative test does not catch it. Which symptom exposes it anyway?', [
              { html: 'Since ' + t(D(sh.c) + '<45^\\circ') + ', the tangent must be less than ' + t('\\tan 45^\\circ=1') + '; ' + t(v) + ' is far too big.', right: true },
              { html: 'A tangent can never be bigger than ' + t('1') + '.', why: 'It can: ' + t('\\tan 60^\\circ\\approx 1.7321') + '. But not for an angle <b>below</b> ' + t(D(45)) + '.' },
              { html: 'It has more than four decimal places.', why: 'The number of decimals tells you nothing about the mode. Compare the angle with the ' + t(D(45)) + ' benchmark.' },
              { html: 'The tangent should be the same as the sine of the same angle.', why: 'The tangent is always <b>bigger</b> than the sine for an acute angle. Use the benchmark ' + t('\\tan 45^\\circ=1') + '.' }],
              'The tangent increases from ' + t('0') + ' to ' + t('1') + ' as the angle runs from ' + t(D(0)) + ' to ' + t(D(45)) + '. Since ' + t(D(sh.c) + '<45^\\circ') + ', ' + t(TX('tan', sh.c) + '<1') + '. The student’s ' + t(v) + ' is impossible. (In degree mode, ' + t(TX('tan', sh.c) + '\\approx ' + fx(T.tan(sh.c), 4)) + '.)', ['Compare the angle with ' + t(D(45)) + '. What is ' + t('\\tan 45^\\circ') + '?'], 'second radian symptom');
          } },
          { id: 'e2d', sub: 'd', level: 'BEG', make: function (r) {
            var useTan = r.chance(0.6), k = useTan ? 'tan 45' : 'sin 30', dv = useTan ? '1' : '0.5', rv = useTan ? fx(Math.tan(45), 4) : fx(Math.sin(30), 4);
            return mc(r, 'Which one-keystroke test, run <b>before</b> starting, confirms degree mode?', [
              { html: 'Press <b>' + k + '</b>: degree mode gives exactly ' + t(dv) + '; radian mode gives ' + t(rv) + '.', right: true },
              { html: 'Press <b>' + k + '</b>: degree mode gives ' + t(rv) + '; radian mode gives exactly ' + t(dv) + '.', why: 'Backwards: ' + t(useTan ? '\\tan 45^\\circ=1' : '\\sin 30^\\circ=0.5') + ' is the degree value you know from the lesson.' },
              { html: 'Press <b>cos 0</b>: degree mode gives ' + t('1') + '; radian mode gives ' + t('0') + '.', why: t('0') + ' radians is the same as ' + t(D(0)) + ', so ' + t('\\cos 0') + ' is ' + t('1') + ' in <b>both</b> modes — the test can’t tell them apart.' },
              { html: 'Press <b>sin 0</b>: degree mode gives ' + t('0') + '; radian mode gives an error.', why: t('\\sin 0=0') + ' in both modes, so this test can’t tell them apart.' }],
              'Press <b>' + k + '</b> before starting anything. Degree mode returns exactly ' + t(dv) + '; radian mode returns ' + t(rv) + '. (' + (useTan ? t('\\sin 30') + ' works just as well: ' + t('0.5') + ' versus ' + t(fx(Math.sin(30), 4)) : t('\\tan 45') + ' works just as well: ' + t('1') + ' versus ' + t(fx(Math.tan(45), 4))) + '.)', ['Use an angle whose ratio you know exactly in degrees.'], 'degree-mode test');
          } }] },
      { num: '3', stem: 'Determine the measure of the acute angle to the nearest degree. Carry the full calculator value and round only at the end.', parts: [
        { id: 'e3a', sub: 'a', level: 'BEG', make: function (r) { var a = r.int(20, 70), v = R(T.sin(a), 4); return degNear(t('\\sin a^\\circ=' + v.toFixed(4)), T.asin(v), { alts: angAlts('sin', v), before: t('a^\\circ=') }, t('a=' + TXI('sin', v.toFixed(4)) + '=' + T.asin(v).toFixed(4) + '\\ldots^\\circ\\approx ' + D(a)) + '.', ['Use ' + t('\\sin^{-1}') + ' (2nd sin) in degree mode.'], 'sin^-1 ' + v); } },
        { id: 'e3b', sub: 'b', level: 'BEG', make: function (r) { var a = r.int(55, 85), v = R(T.cos(a), 4); return degNear(t('\\cos b^\\circ=' + v.toFixed(4)), T.acos(v), { alts: angAlts('cos', v), before: t('b^\\circ=') }, t('b=' + TXI('cos', v.toFixed(4)) + '=' + T.acos(v).toFixed(4) + '\\ldots^\\circ\\approx ' + D(a)) + '.', ['Use ' + t('\\cos^{-1}') + ' (2nd cos) in degree mode.'], 'cos^-1 ' + v); } },
        { id: 'e3c', sub: 'c', level: 'BEG', make: function (r) { var a = r.int(10, 40), v = R(T.tan(a), 4); return degNear(t('\\tan P=' + v.toFixed(4)), T.atan(v), { alts: angAlts('tan', v), before: t('\\angle P=') }, t('\\angle P=' + TXI('tan', v.toFixed(4)) + '=' + T.atan(v).toFixed(4) + '\\ldots^\\circ\\approx ' + D(a)) + '.', ['Use ' + t('\\tan^{-1}') + ' (2nd tan) in degree mode.'], 'tan^-1 ' + v); } },
        { id: 'e3d', sub: 'd', level: 'EMG', make: function (r) {
          var f = pickWhere(function () { return r.pick([[7, 25], [8, 17], [5, 13], [20, 29], [9, 41], [12, 37], [3, 5], [11, 61]]); }, function (f) { var d = T.asin(f[0] / f[1]) % 1; return Math.abs(d - 0.5) > 0.08; });
          var v = f[0] / f[1], x = T.asin(v);
          return degNear(t('\\sin C=\\dfrac{' + f[0] + '}{' + f[1] + '}'), x, { alts: angAlts('sin', v), before: t('\\angle C=') },
            t('\\frac{' + f[0] + '}{' + f[1] + '}=' + (+v.toFixed(5))) + ', so ' + t('\\angle C=\\sin^{-1}\\left(\\frac{' + f[0] + '}{' + f[1] + '}\\right)=' + x.toFixed(4) + '\\ldots^\\circ\\approx ' + D(Math.round(x))) + '.', ['Key in ' + t('\\sin^{-1}(' + f[0] + '\\div ' + f[1] + ')') + ' with brackets around the whole fraction.'], 'sin^-1 ' + f.join('/'));
        } },
        { id: 'e3e', sub: 'e', level: 'EMG', make: function (r) {
          var f = pickWhere(function () { return r.pick([[11, 61], [13, 85], [9, 41], [20, 29], [7, 25], [12, 37], [33, 65], [16, 65]]); }, function (f) { var x = T.acos(f[0] / f[1]); return Math.abs(x % 1 - 0.5) > 0.08; });
          var v = f[0] / f[1], x = T.acos(v);
          return degNear(t('\\cos e^\\circ=\\dfrac{' + f[0] + '}{' + f[1] + '}'), x, { alts: angAlts('cos', v).concat([{ v: T.acos(R(v, 2)), code: 'tv-early-round', hint: 'You rounded ' + t('\\frac{' + f[0] + '}{' + f[1] + '}') + ' to two decimal places first. Keep it unrounded: key in ' + t('\\cos^{-1}(' + f[0] + '\\div ' + f[1] + ')') + '.' }]), before: t('e^\\circ=') },
            t('\\frac{' + f[0] + '}{' + f[1] + '}=' + v.toFixed(5) + '\\ldots') + ' (keep it unrounded), so ' + t('e=\\cos^{-1}\\left(\\frac{' + f[0] + '}{' + f[1] + '}\\right)=' + x.toFixed(4) + '\\ldots^\\circ\\approx ' + D(Math.round(x))) + '.', ['Don’t round the fraction first: key in the whole fraction inside the brackets.'], 'cos^-1 ' + f.join('/'));
        } },
        { id: 'e3f', sub: 'f', level: 'EMG', make: function (r) {
          var f = pickWhere(function () { return r.pick([[5, 2], [7, 3], [9, 4], [3, 2], [8, 5], [2, 7], [3, 8], [11, 4]]); }, function (f) { var x = T.atan(f[0] / f[1]); return Math.abs(x % 1 - 0.5) > 0.08 && Math.abs(T.atan(f[0]) / f[1] - x) > 2; });
          var v = f[0] / f[1], x = T.atan(v);
          return degNear(t('\\tan y^\\circ=\\dfrac{' + f[0] + '}{' + f[1] + '}'), x, { alts: angAlts('tan', v).concat([{ v: T.atan(f[0]) / f[1], code: 'tv-brackets', hint: 'It looks like the calculator found ' + t('\\tan^{-1}(' + f[0] + ')') + ' and then divided the <b>angle</b> by ' + t(f[1]) + '. Put brackets around the whole fraction: ' + t('\\tan^{-1}(' + f[0] + '\\div ' + f[1] + ')') + '.' }]), before: t('y^\\circ=') },
            t('\\frac{' + f[0] + '}{' + f[1] + '}=' + (+v.toFixed(5))) + ', so ' + t('y=\\tan^{-1}\\left(\\frac{' + f[0] + '}{' + f[1] + '}\\right)=' + x.toFixed(4) + '\\ldots^\\circ\\approx ' + D(Math.round(x))) + '.', ['Brackets around the whole fraction: ' + t('\\tan^{-1}(' + f[0] + '\\div ' + f[1] + ')') + '.'], 'tan^-1 ' + f.join('/'));
        } }] },
      /* ---------- Part B ---------- */
      { num: '4', section: 'Extra practice B — Round trips: the ratio key and the inverse key undo each other', stem: function (sh) { return 'Start with the angle ' + t(D(sh.a)) + '.'; },
        shared: function (r) { return { a: r.chance(0.3) ? 34 : r.int(20, 70) }; },
        parts: [
          { id: 'e4a', sub: 'a', level: 'BEG', make: function (r, sh) { var a = sh.a; return boxes('Evaluate ' + t(TX('sin', a)) + ', ' + t(TX('cos', a)) + ' and ' + t(TX('tan', a)) + ' to four decimal places.', [vBox('sin', a, 4), vBox('cos', a, 4), vBox('tan', a, 4)], 'In degree mode: ' + ['sin', 'cos', 'tan'].map(function (f) { return t(TX(f, a) + '\\approx ' + fx(FN[f](a), 4)); }).join(', ') + '.', ['Degree mode; round each to four decimal places.'], 'three ratios of ' + a); } },
          { id: 'e4b', sub: 'b', level: 'BEG', make: function (r, sh) {
            var a = sh.a, its = ['sin', 'cos', 'tan'].map(function (f) { var v = R(FN[f](a), 4); return { label: t(TXI(f, v.toFixed(4)) + '='), name: t(TXI(f, v.toFixed(4))), x: INV[f](v), dp: 0, after: '°', tex: D(a), alts: angAlts(f, v) }; });
            return boxes('Feed each answer back through the inverse key. State each result to the nearest degree.', its,
              ['sin', 'cos', 'tan'].map(function (f) { var v = R(FN[f](a), 4); return t(TXI(f, v.toFixed(4)) + '=' + INV[f](v).toFixed(4) + '\\ldots^\\circ\\approx ' + D(a)); }).join('<br>') + '<br>All three come back to the angle we started with.', ['Use the 2nd (inverse) key for each ratio.'], 'inverse round trip ' + a);
          } },
          { id: 'e4c', sub: 'c', level: 'BEG', make: function (r) {
            var b = pickWhere(function () { return r.int(20, 70); }, function (b) { return Math.round(T.asin(R(T.sin(b), 4))) === b; }), v = R(T.sin(b), 4);
            if (r.chance(0.3)) { b = 47; v = 0.7314; }
            return boxes('Run the trip the other way: evaluate ' + t(TXI('sin', v.toFixed(4))) + ' to the nearest degree, then take the sine of that angle to four decimal places.', [
              { label: t(TXI('sin', v.toFixed(4)) + '='), name: t(TXI('sin', v.toFixed(4))), x: T.asin(v), dp: 0, after: '°', tex: D(b), alts: angAlts('sin', v) }, vBox('sin', b, 4, 'the sine of that angle')],
              t(TXI('sin', v.toFixed(4)) + '=' + T.asin(v).toFixed(4) + '\\ldots^\\circ\\approx ' + D(b)) + ', then ' + t(TX('sin', b) + '\\approx ' + fx(T.sin(b), 4)) + '. The trip returns the ratio it started from: the two keys undo each other in either order.', ['First box: 2nd sin. Second box: sin of your whole-degree answer.'], 'reverse trip ' + v);
          } },
          { id: 'e4d', sub: 'd', level: 'EMG', make: function (r) {
            var f = r.pick(['tan', 'tan', 'sin', 'cos']), k = t('\\' + f), ki = t('\\' + f + '^{-1}');
            return mc(r, 'Which sentence correctly describes the relationship between the ' + k + ' key and the ' + ki + ' key?', [
              { html: ki + ' <b>undoes</b> ' + k + ': ' + k + ' takes an <b>angle</b> in and gives a <b>ratio</b> out; ' + ki + ' takes a ratio in and gives an angle out.', right: true },
              { html: ki + ' undoes ' + k + ': ' + k + ' takes a ratio in and gives an angle out; ' + ki + ' takes an angle in and gives a ratio out.', why: 'Backwards: ' + t(TX(f, 30)) + ' takes the angle ' + t(D(30)) + ' and gives a ratio.' },
              { html: ki + ' means ' + t('\\frac{1}{\\' + f + '}') + ': it takes a ratio and gives its reciprocal.', why: 'The ' + t('-1') + ' is not an exponent here. ' + ki + ' means “the angle whose ' + NAME[f] + ' is …”.' },
              { html: 'Both keys take an angle in and give a ratio out; ' + ki + ' just gives the other acute angle.', why: 'The inverse key takes a <b>ratio</b> in (like ' + t('0.5') + ') and returns an <b>angle</b>.' }],
              ki + ' undoes ' + k + ': whatever ' + k + ' does to an angle, ' + ki + ' reverses. ' + k + ' takes an angle in and gives a ratio out; ' + ki + ' takes a ratio in and gives an angle out.', ['What did you type into each key in parts (a) and (b), and what came out?'], 'undo sentence ' + f);
          } }] },
      { num: '5', stem: 'Each part is a round trip with one leg missing. Fill it in, to four decimal places for a ratio and to the nearest degree for an angle.', parts: [
        { id: 'e5a', sub: 'a', level: 'BEG', make: function (r) {
          var f = r.pick(['cos', 'cos', 'sin', 'tan']), a = pickWhere(function () { return r.int(20, 75); }, function (a) { return Math.round(INV[f](R(FN[f](a), 4))) === a; });
          return boxes('Start at ' + t(D(a)) + '.', tripFields(f, a), t(TX(f, a) + '=' + FN[f](a).toFixed(5) + '\\ldots\\approx ' + fx(FN[f](a), 4)) + ', and ' + t(TXI(f, fx(FN[f](a), 4)) + '=' + INV[f](R(FN[f](a), 4)).toFixed(3) + '^\\circ\\approx ' + D(a)) + '.', ['The inverse key brings you back to the starting angle.'], 'trip from ' + a + '° (' + f + ')');
        } },
        { id: 'e5b', sub: 'b', level: 'BEG', make: function (r) {
          var b = pickWhere(function () { return r.int(50, 80); }, function (b) { return Math.round(T.atan(R(T.tan(b), 4))) === b; }), v = fx(T.tan(b), 4);
          return boxes(t('\\tan\\ \\underline{\\quad}=' + v) + ' and ' + t(TXI('tan', v) + '=\\underline{\\quad}') + '.', [
            { label: 'the angle that went in:', name: 'the angle that went in', x: T.atan(Number(v)), dp: 0, after: '°', tex: D(b), alts: angAlts('tan', Number(v)) },
            { label: t(TXI('tan', v) + '='), name: t(TXI('tan', v)), x: T.atan(Number(v)), dp: 0, after: '°', tex: D(b), alts: angAlts('tan', Number(v)) }],
            t(TXI('tan', v) + '=' + T.atan(Number(v)).toFixed(4) + '\\ldots^\\circ') + ', so the angle that went in was ' + t(D(b)) + ', and coming back out ' + t(TXI('tan', v) + '\\approx ' + D(b)) + '. (Check: ' + t(TX('tan', b) + '\\approx ' + v) + '.)', ['To find the missing angle, use the inverse key on the ratio.'], 'missing leg tan ' + v);
        } },
        { id: 'e5c', sub: 'c', level: 'EMG', make: function (r) {
          var v = r.chance(0.3) ? 0.4 : pickWhere(function () { return r.int(2, 18) / 20; }, function (v) { var g = Math.round(T.acos(v)); return Math.abs(T.acos(v) % 1 - 0.5) > 0.1 && Math.abs(T.cos(g) - v) > 0.002; });
          var g = Math.round(T.acos(v)), vs = v.toFixed(4);
          return boxes('Start at ' + t(vs) + '.', [
            { label: t(TXI('cos', vs) + '='), name: t(TXI('cos', vs)), x: T.acos(v), dp: 0, after: '°', tex: D(g), alts: angAlts('cos', v) },
            { label: 'cos of that ' + t('='), name: 'cos of that angle', x: T.cos(g), dp: 4, tex: fx(T.cos(g), 4), alts: [{ v: v, code: 'tv-trip', hint: 'Take the cosine of your <b>rounded</b> whole-degree angle, ' + t(D(g)) + ' — the round trip doesn’t land exactly back on ' + t(vs) + ' this time.' }, { v: RAD.cos(g), code: 'tv-radian', hint: RADH }] }],
            t(TXI('cos', vs) + '=' + T.acos(v).toFixed(4) + '\\ldots^\\circ\\approx ' + D(g)) + ', then ' + t(TX('cos', g) + '=' + T.cos(g).toFixed(5) + '\\ldots\\approx ' + fx(T.cos(g), 4)) + '.', ['Second box: the cosine of the whole-degree angle you got in the first box.'], 'broken trip from ' + vs);
        } },
        { id: 'e5d', sub: 'd', level: 'EMG', make: function (r) {
          return mc(r, 'In a round trip like “start at ' + t('0.4000') + ', take ' + t('\\cos^{-1}') + ' to the nearest degree (' + t(D(66)) + '), then take ' + t('\\cos') + '” you end at ' + t('0.4067') + ', not ' + t('0.4000') + '. Where did the difference come from, and how do you land back on ' + t('0.4000') + '?', [
              { html: 'Rounding the angle ' + t('66.4218\\ldots^\\circ') + ' to ' + t(D(66)) + ' threw away ' + t('0.42^\\circ') + '. Carry the unrounded angle (leave it in the calculator, or use ANS) into the cosine step and round only at the end.', right: true },
              { html: 'The calculator is not accurate enough; a better calculator would give ' + t('0.4000') + '.', why: 'The calculator is fine. The second step took the cosine of a <b>different</b> angle (' + t(D(66)) + ' instead of ' + t('66.42\\ldots^\\circ') + ').' },
              { html: t('\\cos') + ' and ' + t('\\cos^{-1}') + ' don’t really undo each other.', why: 'They do — exactly — as long as nothing is rounded in the middle.' },
              { html: 'Round the starting ratio to two decimal places first.', why: 'Rounding earlier makes it worse. The fix is to round <b>less</b>: carry the full angle.' }],
            'The trip was broken in the middle: the true angle is ' + t('66.4218\\ldots^\\circ') + ', and rounding it to ' + t(D(66)) + ' threw away ' + t('0.4218^\\circ') + '. The second step then took the cosine of a different angle. To land back on ' + t('0.4000') + ', carry the unrounded angle into the cosine step (ANS) and round only at the very end.', ['What exactly did the second step take the cosine of?'], 'why trip broke');
        } }] },
      { num: '6', stem: '<b>Why “round only at the end” is not fussiness.</b>', parts: [
        { id: 'e6a', sub: 'a', level: 'BEG', make: function (r) {
          var a = r.pick([5, 5, 4, 3]);
          return boxes('Evaluate ' + t(TX('cos', a)) + ' to four decimal places, then evaluate ' + t('\\cos^{-1}') + ' of that value to the nearest degree.', tripFields('cos', a),
            t(TX('cos', a) + '=' + T.cos(a).toFixed(5) + '\\ldots\\approx ' + fx(T.cos(a), 4)) + ', and ' + t(TXI('cos', fx(T.cos(a), 4)) + '=' + T.acos(R(T.cos(a), 4)).toFixed(4) + '\\ldots^\\circ\\approx ' + D(a)) + '. The trip is exact to the nearest degree.', ['Four decimal places for the ratio; nearest degree for the angle.'], 'cos trip ' + a);
        } },
        { id: 'e6b', sub: 'b', level: 'EMG', make: function (r) {
          var a = r.pick([5, 5, 4, 3]), v2 = R(T.cos(a), 2), back = T.acos(v2);
          return boxes('Now round ' + t(TX('cos', a)) + ' to <b>two</b> decimal places first, and evaluate ' + t('\\cos^{-1}') + ' of that. By how many degrees is the trip now out?', [
            vBox('cos', a, 2, t(TX('cos', a)) + ' (2 d.p.)'),
            { label: t('\\cos^{-1}') + ' of that ' + t('='), name: t('\\cos^{-1}(' + v2.toFixed(2) + ')'), x: back, dp: 0, after: '°', tex: D(Math.round(back)), alts: [{ v: a, code: 'tv-early-round', hint: 'Use the <b>two-decimal</b> value ' + t(v2.toFixed(2)) + ' in the inverse key — that’s the point of the experiment.' }] },
            intBox('out by', Math.abs(a - Math.round(back)), function (v) { return v === 0 ? { code: 'tv-out-by', hint: 'Compare the angle you ended with to the ' + t(D(a)) + ' you started with.' } : null; }, '°')],
            t(TX('cos', a) + '=' + T.cos(a).toFixed(5) + '\\ldots') + ', which to two decimal places is ' + t(v2.toFixed(2)) + '. Then ' + t('\\cos^{-1}(' + v2.toFixed(2) + ')=' + D(Math.round(back))) + '. The trip is now out by ' + t(D(Math.abs(a - Math.round(back)))) + ' — the whole angle destroyed by rounding one value.', ['Key in the two-decimal value exactly, then use ' + t('\\cos^{-1}') + '.'], 'cos 2dp trip ' + a);
        } },
        { id: 'e6c', sub: 'c', level: 'EMG', make: function (r) {
          var a = r.pick([87, 87, 85, 86, 88]), v2 = R(T.sin(a), 2), back = Math.round(T.asin(v2));
          return boxes('Repeat both steps for ' + t(TX('sin', a)) + ': four decimal places, then two.', tripFields('sin', a).concat([
            Object.assign(vBox('sin', a, 2, t(TX('sin', a)) + ' (2 d.p.)'), { label: t(TX('sin', a)) + ' to 2 d.p. ' + t('=') }),
            { label: t('\\sin^{-1}') + ' of that ' + t('='), name: t('\\sin^{-1}(' + v2.toFixed(2) + ')'), x: T.asin(v2), dp: 0, after: '°', tex: D(back), alts: [{ v: a, code: 'tv-early-round', hint: 'Use the <b>two-decimal</b> value ' + t(v2.toFixed(2)) + ' in the inverse key.' }] },
            intBox('out by', Math.abs(back - a), function (v) { return v === 0 ? { code: 'tv-out-by', hint: 'Compare the two-decimal trip’s angle with ' + t(D(a)) + '.' } : null; }, '°')]),
            t(TX('sin', a) + '\\approx ' + fx(T.sin(a), 4)) + ' and ' + t(TXI('sin', fx(T.sin(a), 4)) + '\\approx ' + D(a)) + ' ✓. To two decimal places ' + t(TX('sin', a) + '\\approx ' + v2.toFixed(2)) + ', and ' + t('\\sin^{-1}(' + v2.toFixed(2) + ')=' + D(back)) + ': out by ' + t(D(back - a)) + '.', ['First two boxes: the four-decimal trip. Next two: the two-decimal trip.'], 'sin trips ' + a);
        } },
        { id: 'e6d', sub: 'd(1)', level: 'BEG', make: function (r) {
          var a = pickWhere(function () { return r.int(50, 70); }, function (a) { return Math.round(T.atan(R(T.tan(a), 2))) === a && Math.round(T.atan(R(T.tan(a), 4))) === a; });
          if (r.chance(0.3)) a = 61;
          var v2 = R(T.tan(a), 2);
          return boxes('Repeat both steps for ' + t(TX('tan', a)) + ': four decimal places, then two.', tripFields('tan', a).concat([Object.assign(vBox('tan', a, 2, t(TX('tan', a)) + ' (2 d.p.)'), { label: t(TX('tan', a)) + ' to 2 d.p. ' + t('=') }),
            { label: t('\\tan^{-1}') + ' of that ' + t('='), name: t('\\tan^{-1}(' + v2.toFixed(2) + ')'), x: T.atan(v2), dp: 0, after: '°', tex: D(a), alts: angAlts('tan', v2) }]),
            t(TX('tan', a) + '\\approx ' + fx(T.tan(a), 4)) + ' and ' + t(TXI('tan', fx(T.tan(a), 4)) + '\\approx ' + D(a)) + '. To two decimals, ' + t(v2.toFixed(2)) + ', and ' + t('\\tan^{-1}(' + v2.toFixed(2) + ')=' + T.atan(v2).toFixed(4) + '\\ldots^\\circ\\approx ' + D(a)) + ' — the trip survives.', ['First two boxes: the four-decimal trip. Last two: the two-decimal trip.'], 'tan trips ' + a);
        } },
        { id: 'e6d2', sub: 'd(2)', level: 'PRG', make: function (r) {
          return mc(r, 'Rounding a ratio to two decimals destroyed the trip near ' + t(D(0)) + ' and ' + t(D(90)) + ' but not for the tangent of an angle in the middle. Why does rounding cost so much near ' + t(D(0)) + ' and ' + t(D(90)) + '?', [
            { html: 'Near ' + t(D(0)) + ' and ' + t(D(90)) + ' the sine and cosine barely change from one degree to the next, so a small rounding error in the ratio stands for <b>several degrees</b> of angle.', right: true },
            { html: 'The calculator is less accurate for small and large angles.', why: 'The calculator is equally accurate everywhere. Look at how much the ratio changes per degree: ' + t('\\sin 85^\\circ=0.9962') + ', ' + t('\\sin 90^\\circ=1') + '.' },
            { html: 'Near ' + t(D(0)) + ' and ' + t(D(90)) + ' the ratios change very quickly, so rounding jumps over many degrees.', why: 'Backwards: there the sine and cosine change very <b>slowly</b> — five whole degrees (' + t(D(85)) + ' to ' + t(D(90)) + ') move the sine by only ' + t('0.0038') + '.' },
            { html: 'The tangent is always more accurate than the sine and cosine.', why: 'The tangent near ' + t(D(0)) + ' is just as sensitive. What matters is how fast the ratio changes per degree where you are.' }],
            'Near ' + t(D(0)) + ' and ' + t(D(90)) + ' the sine and cosine rows barely move: ' + t('\\sin 85^\\circ=0.9962') + ' and ' + t('\\sin 90^\\circ=1.0000') + ' — five degrees buy only ' + t('0.0038') + '. So an error of a few thousandths in the ratio corresponds to several degrees of angle. In the middle of the range the ratios change quickly per degree, so the same rounding error moves the angle only a fraction of a degree.', ['Compare ' + t('\\sin 85^\\circ') + ' with ' + t('\\sin 90^\\circ') + ', and ' + t('\\tan 60^\\circ') + ' with ' + t('\\tan 61^\\circ') + '.'], 'why rounding costs at the ends');
        } }] },
      /* ---------- Part C ---------- */
      { num: '7', section: 'Extra practice C — The pattern from 0° to 90°', stem: function (sh) { return 'Build the table for the angles ' + sh.S.map(function (a) { return t(D(a)); }).join(', ') + ', giving each value to four decimal places.'; },
        shared: function (r) { return { S: r.chance(0.4) ? SETS[0] : r.pick(SETS) }; },
        parts: [
          { id: 'e7a', sub: 'a(i)', level: 'BEG', make: function (r, sh) { return boxes('The ' + t('\\sin\\theta') + ' row:', sh.S.map(function (a) { return vBox('sin', a, 4); }), 'In degree mode: ' + sh.S.map(function (a) { return t('\\sin ' + D(a) + '\\approx ' + fx(T.sin(a), 4)); }).join(', ') + '.', ['Degree mode; four decimal places.'], 'sin row'); } },
          { id: 'e7a2', sub: 'a(ii)', level: 'BEG', make: function (r, sh) { return boxes('The ' + t('\\cos\\theta') + ' row:', sh.S.map(function (a) { return vBox('cos', a, 4); }), 'In degree mode: ' + sh.S.map(function (a) { return t('\\cos ' + D(a) + '\\approx ' + fx(T.cos(a), 4)); }).join(', ') + '. It is the sine row read backwards.', ['Degree mode; four decimal places.'], 'cos row'); } },
          { id: 'e7a3', sub: 'a(iii)', level: 'BEG', make: function (r, sh) { var S = sh.S.filter(function (a) { return a < 90; }); return boxes('The ' + t('\\tan\\theta') + ' row (' + t('\\tan 90^\\circ') + ' is undefined):', S.map(function (a) { return vBox('tan', a, 4); }), 'In degree mode: ' + S.map(function (a) { return t('\\tan ' + D(a) + '\\approx ' + fxT(T.tan(a), 4)); }).join(', ') + ', and ' + t('\\tan 90^\\circ') + ' is undefined.', ['Degree mode; four decimal places.'], 'tan row'); } },
          { id: 'e7b', sub: 'b', level: 'BEG', make: function (r) {
            var rows = r.shuffle([{ id: 'sin', html: t('\\sin\\theta') }, { id: 'cos', html: t('\\cos\\theta') }, { id: 'tan', html: t('\\tan\\theta') }]);
            return B.grid('What does each row do as ' + t('\\theta') + ' grows from ' + t(D(0)) + ' to ' + t(D(90)) + '?', rows,
              [{ id: 'up1', html: 'rises from 0 to 1' }, { id: 'down', html: 'falls from 1 to 0' }, { id: 'upinf', html: 'rises from 0 with no limit' }], { sin: 'up1', cos: 'down', tan: 'upinf' },
              { why: function (row) { return { code: 'tv-wrong-dir', hint: row === 'sin' ? 'Read the sine row: it starts at ' + t('\\sin 0^\\circ=0') + ' and ends at ' + t('\\sin 90^\\circ=1') + '.' : row === 'cos' ? 'Read the cosine row: it starts at ' + t('\\cos 0^\\circ=1') + '.' : 'The tangent passes ' + t('1') + ' at ' + t(D(45)) + ' and keeps going — it has no ceiling.' }; } },
              '<b>Sine</b> rises steadily from ' + t('0') + ' to ' + t('1') + '. <b>Cosine</b> falls from ' + t('1') + ' to ' + t('0') + ' (the sine row backwards). <b>Tangent</b> starts at ' + t('0') + ', climbs ever faster, passes ' + t('1') + ' at ' + t(D(45)) + ', and is undefined at ' + t(D(90)) + '.', ['Read each row of your table from left to right.'], 'row patterns');
          } },
          { id: 'e7c', sub: 'c(1)', level: 'BEG', make: function (r) {
            var S = r.pick([[88, 89.5, 89.999], [87, 89.9, 89.99], [88, 89.8, 89.995], [89, 89.5, 89.999]]);
            return boxes('Your calculator refuses to give ' + t('\\tan 90^\\circ') + '. Evaluate these to four decimal places.', S.map(function (a) { return vBox('tan', a, 4); }),
              S.map(function (a) { return t('\\tan ' + D(a) + '\\approx ' + fxT(T.tan(a), 4)); }).join(', ') + '. The values grow without limit as ' + t('\\theta') + ' approaches ' + t(D(90)) + '.', ['Type the decimal angles exactly.'], 'tan near 90 (4 dp)');
          } },
          { id: 'e7c2', sub: 'c(2)', level: 'EMG', make: function (r) {
            return mc(r, 'What is the calculator’s refusal to give ' + t('\\tan 90^\\circ') + ' telling you?', [
              { html: 'The values grow without limit as ' + t('\\theta') + ' approaches ' + t(D(90)) + ', so there is no number to give: ' + t('\\tan 90^\\circ') + ' does not exist.', right: true },
              { html: t('\\tan 90^\\circ') + ' is a number too big for the calculator to display.', why: 'Any number you name, ' + t('\\tan\\theta') + ' passes it before ' + t(D(90)) + '. There is no number at all — the error means “no such number”.' },
              { html: t('\\tan 90^\\circ=0') + ', but the calculator can’t show it.', why: 'That is ' + t('\\cos 90^\\circ') + '. The tangent near ' + t(D(90)) + ' is huge, not near ' + t('0') + '.' },
              { html: t('\\tan 90^\\circ=1') + ', like ' + t('\\sin 90^\\circ') + '.', why: 'The tangent already equals ' + t('1') + ' at ' + t(D(45)) + ' and keeps growing.' }],
              'The values (' + t('\\tan 88^\\circ\\approx 28.6363') + ', ' + t('\\tan 89.5^\\circ\\approx 114.5887') + ', ' + t('\\tan 89.999^\\circ\\approx 57\\,295.7795') + ') are not closing in on any number. So there is no number to hand back for ' + t('\\tan 90^\\circ') + ': the error means “no such number exists”, not “the calculator can’t manage it”.', ['Look at ' + t('\\tan 88^\\circ') + ', ' + t('\\tan 89.5^\\circ') + ' and ' + t('\\tan 89.999^\\circ') + '. Are they settling down to some number?'], 'tan 90 refusal');
          } },
          { id: 'e7d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var big = fxT(T.tan(sh.S[5]), 4);
            return mc(r, 'Read the largest value in each row of your table. Which statement about the “ceilings” is right?', [
              { html: 'Sine and cosine both have a ceiling of ' + t('1') + '; the tangent has no ceiling at all.', right: true },
              { html: 'All three rows have a ceiling of ' + t('1') + '.', why: 'The tangent passes ' + t('1') + ' at ' + t(D(45)) + ': ' + t('\\tan ' + D(sh.S[5]) + '\\approx ' + big) + '.' },
              { html: 'The tangent’s ceiling is ' + t(big) + ', its largest value in the table.', why: 'That is only the largest value <b>in the table</b>. ' + t('\\tan 89.9^\\circ\\approx 572.96') + ' is bigger still.' },
              { html: 'Only the sine has a ceiling of ' + t('1') + '; the cosine and tangent have none.', why: 'The cosine row starts at ' + t('1') + ' and only falls from there.' }],
              'Largest in the sine row: ' + t('1') + ' (at ' + t(D(90)) + '). Largest in the cosine row: ' + t('1') + ' (at ' + t(D(0)) + '). Both have a ceiling of ' + t('1') + '. The largest tangent shown, ' + t(big) + ', is only the largest <b>in the table</b> — the tangent row has no ceiling.', ['Look at the last column of each row — and at how big the tangent gets near ' + t(D(90)) + ' (' + t('\\tan 89.9^\\circ\\approx 572.96') + ').'], 'ceilings');
          } }] },
      { num: '8', stem: '<b>Calculator down.</b> Answer from the pattern alone — the table and the benchmarks ' + t('\\sin 45^\\circ=\\cos 45^\\circ\\approx 0.7071') + ', ' + t('\\tan 45^\\circ=1') + ' and ' + t('\\sin 30^\\circ=0.5') + '.', parts: [
        { id: 'e8a', sub: 'a', level: 'LIM', make: function (r) { var a = r.int(20, 70), b = a + r.pick([-10, 10, 5, -5]); return greaterSame(r, 'sin', a, b); } },
        { id: 'e8b', sub: 'b', level: 'BEG', make: function (r) { var p = distinctPair(r, 5, 80, 12); return greaterSame(r, 'cos', p[0], p[1]); } },
        { id: 'e8c', sub: 'c', level: 'LIM', make: function (r) { var p = r.chance(0.3) ? [8, 80] : [r.int(5, 15), r.int(70, 85)]; if (r.chance(0.5)) p.reverse(); return greaterSame(r, 'tan', p[0], p[1]); } },
        { id: 'e8d', sub: 'd', level: 'BEG', make: function (r) {
          var f = r.pick(['cos', 'cos', 'sin']), v = r.pick([1.4, 1.2, 1.3, 1.5, 1.05, 1.8]);
          var yn = [
            { html: '<b>No</b>', right: true }, { html: '<b>Yes</b>', why: t('\\' + f + '\\theta=' + (f === 'cos' ? '\\frac{\\text{adj}}{\\text{hyp}}' : '\\frac{\\text{opp}}{\\text{hyp}}')) + ', and the hypotenuse is the longest side, so the fraction is less than ' + t('1') + '.' }];
          if (r.chance(0.5)) yn.reverse();
          return mc(r, 'Can ' + t('\\' + f + '\\theta=' + v) + ' for some acute angle ' + t('\\theta') + '?', yn,
            '<b>No.</b> ' + t('\\' + f + '\\theta=' + (f === 'cos' ? '\\frac{\\text{adj}}{\\text{hyp}}' : '\\frac{\\text{opp}}{\\text{hyp}}')) + ' and the hypotenuse is the longest side, so the ' + NAME[f] + ' of an acute angle is always less than ' + t('1') + '. The row never passes ' + t('1') + '.', ['Which side is on the bottom of the fraction? Can the top ever be longer?'], 'can ' + f + ' = ' + v, true);
        } },
        { id: 'e8e', sub: 'e', level: 'EMG', make: function (r) {
          var v = r.pick([1.4, 1.4, 2.5, 0.6, 0.35, 3, 1.2, 0.8]), up = v > 1;
          return mc(r, 'Can ' + t('\\tan\\theta=' + v) + ' for some acute angle ' + t('\\theta') + '? If so, is ' + t('\\theta') + ' above or below ' + t(D(45)) + '?', [
            { html: 'Yes, and ' + t('\\theta') + ' is above ' + t(D(45)), right: up, why: up ? null : t(v + '<1=\\tan 45^\\circ') + ', and the tangent increases, so ' + t('\\theta') + ' is <b>below</b> ' + t(D(45)) + '.' },
            { html: 'Yes, and ' + t('\\theta') + ' is below ' + t(D(45)), right: !up, why: up ? t(v + '>1=\\tan 45^\\circ') + ', and the tangent increases, so ' + t('\\theta') + ' is <b>above</b> ' + t(D(45)) + '.' : null },
            { html: 'No — no acute angle has that tangent', why: 'The tangent runs through every positive value from ' + t('0') + ' upward (it has no ceiling), so it takes the value ' + t(v) + ' somewhere.' }],
            '<b>Yes.</b> The tangent row runs from ' + t('0') + ' through ' + t('1') + ' (at ' + t(D(45)) + ') and upward without a ceiling, so it takes the value ' + t(v) + ' somewhere. Since ' + t(v + (up ? '>' : '<') + '1=\\tan 45^\\circ') + ', that angle is ' + (up ? 'above' : 'below') + ' ' + t(D(45)) + '.', ['Compare ' + t(v) + ' with ' + t('\\tan 45^\\circ=1') + '.'], 'can tan = ' + v);
        } },
        { id: 'e8f', sub: 'f', level: 'EMG', make: function (r) {
          var c = r.pick([['sin', 0.9999, 'n90'], ['sin', 0.9999, 'n90'], ['cos', 0.9995, 'n0'], ['sin', 0.0015, 'n0'], ['cos', 0.0012, 'n90']]), f = c[0], v = c[1], w = c[2];
          var opts = [{ html: 'Yes — just below ' + t(D(90)), right: w === 'n90' }, { html: 'Yes — just above ' + t(D(0)), right: w === 'n0' }, { html: 'Yes — near ' + t(D(45)), why: 'Near ' + t(D(45)) + ' the ' + NAME[f] + ' is about ' + t('0.7071') + '.' }, { html: 'No — it is too close to ' + t(v > 0.5 ? '1' : '0'), why: 'The ' + NAME[f] + ' takes every value between ' + t('0') + ' and ' + t('1') + '; it just has to be very close to an end of the row.' }];
          opts.forEach(function (o) { if (!o.right && !o.why) o.why = 'Which end of the ' + NAME[f] + ' row is close to ' + t(v) + '? The ' + NAME[f] + ' ' + (f === 'sin' ? 'rises from 0 to 1' : 'falls from 1 to 0') + '.'; });
          return mc(r, 'Can ' + t('\\' + f + '\\theta=' + v) + '? If so, roughly whereabouts is ' + t('\\theta') + '?', opts,
            '<b>Yes — ' + (w === 'n90' ? 'just below ' + t(D(90)) : 'just above ' + t(D(0))) + '.</b> The ' + NAME[f] + ' ' + (f === 'sin' ? 'rises from ' + t('0') + ' at ' + t(D(0)) + ' to ' + t('1') + ' at ' + t(D(90)) : 'falls from ' + t('1') + ' at ' + t(D(0)) + ' to ' + t('0') + ' at ' + t(D(90))) + ', and ' + t(v) + ' is very close to ' + t(v > 0.5 ? '1' : '0') + '. (In fact ' + t(TXI(f, v) + '\\approx ' + INV[f](v).toFixed(1) + '^\\circ') + '.)', ['Which end of the row is the value close to?'], 'where is ' + f + ' = ' + v);
        } },
        { id: 'e8g', sub: 'g', level: 'EMG', make: function (r) {
          var S = r.chance(0.4) ? SETS[0] : r.pick(SETS), f = r.chance(0.65) ? 'sin' : 'cos';
          var o = pickWhere(function () { var i = r.int(1, 4), lo = FN[f](S[i]), hi = FN[f](S[i + 1]), v = R(Math.min(lo, hi) + (Math.abs(hi - lo)) * (0.2 + 0.6 * r.int(0, 10) / 10), 2); return { i: i, v: v, lo: lo, hi: hi }; }, function (o) { return Math.min(Math.abs(o.v - o.lo), Math.abs(o.v - o.hi)) > 0.02; });
          var iv = function (j) { return t(D(S[j])) + ' and ' + t(D(S[j + 1])); }, j0 = o.i, mir = S.length - 2 - o.i;
          var idx = [j0]; if (mir !== j0) idx.push(mir); [0, 1, 2, 3, 4, 5].forEach(function (j) { if (idx.length < 4 && idx.indexOf(j) < 0 && Math.abs(j - j0) <= 2) idx.push(j); });
          var opts = idx.slice(0, 4).sort(function (a, b) { return a - b; }).map(function (j) { return { html: 'between ' + iv(j), right: j === j0, why: j === mir && f === 'cos' ? 'That is where the <b>sine</b> takes this value. The cosine row runs backwards (it decreases).' : 'Read the ' + NAME[f] + ' row: ' + t(TX(f, S[j]) + '\\approx ' + fx(FN[f](S[j]), 4)) + ' and ' + t(TX(f, S[j + 1]) + '\\approx ' + fx(FN[f](S[j + 1]), 4)) + '. Is ' + t(o.v) + ' between them?' }; });
          return mc(r, 'Between which two table angles does the angle with ' + t('\\' + f + '\\theta=' + o.v) + ' lie?' + rowTable([f], S), opts,
            t(TX(f, S[j0]) + '\\approx ' + fx(FN[f](S[j0]), 4)) + ' and ' + t(TX(f, S[j0 + 1]) + '\\approx ' + fx(FN[f](S[j0 + 1]), 4)) + ', and ' + t(o.v) + ' lies between them. So ' + t('\\theta') + ' is between ' + iv(j0) + '.', ['Find the two neighbouring values in the row that ' + t(o.v) + ' sits between.'], f + ' = ' + o.v + ' between');
        } },
        { id: 'e8h', sub: 'h', level: 'EMG', make: function (r) {
          var S = r.chance(0.4) ? SETS[0] : r.pick(SETS);
          var o = pickWhere(function () { var i = r.int(2, 5), lo = T.tan(S[i]), hi = S[i + 1] === 90 ? lo * 6 : T.tan(S[i + 1]), v = R(lo + (hi - lo) * (0.2 + 0.6 * r.int(0, 10) / 10), lo > 5 ? 0 : 1); return { i: i, v: v, lo: lo, hi: hi }; }, function (o) { return o.v - o.lo > 0.1 && o.hi - o.v > 0.1 && o.v > 1.05; });
          var iv = function (j) { return t(D(S[j])) + ' and ' + t(D(S[j + 1])); };
          var idx = [o.i - 1, o.i, o.i + 1, o.i === 5 ? 2 : o.i + 2].filter(function (j, k, arr) { return j >= 0 && j <= 5 && arr.indexOf(j) === k; }).sort();
          var opts = idx.map(function (j) { return { html: 'between ' + iv(j), right: j === o.i, why: 'Read the tangent row: ' + t('\\tan ' + D(S[j]) + '\\approx ' + fxT(T.tan(S[j]), 4)) + (S[j + 1] === 90 ? ' and ' + t('\\tan 90^\\circ') + ' is undefined' : ' and ' + t('\\tan ' + D(S[j + 1]) + '\\approx ' + fxT(T.tan(S[j + 1]), 4))) + '. Is ' + t(o.v) + ' between them?' }; });
          return mc(r, 'Between which two table angles does the angle with ' + t('\\tan\\theta=' + o.v) + ' lie?' + rowTable(['tan'], S), opts,
            t('\\tan ' + D(S[o.i]) + '\\approx ' + fxT(T.tan(S[o.i]), 4)) + (S[o.i + 1] === 90 ? ', and the tangent grows without limit toward ' + t(D(90)) : ' and ' + t('\\tan ' + D(S[o.i + 1]) + '\\approx ' + fxT(T.tan(S[o.i + 1]), 4))) + ', so ' + t(o.v) + ' lies between them: ' + t('\\theta') + ' is between ' + iv(o.i) + '.', ['Find the two neighbouring values in the tangent row that ' + t(o.v) + ' sits between.'], 'tan = ' + o.v + ' between');
        } },
        { id: 'e8i', sub: 'i', level: 'BEG', make: function (r) {
          var a = r.pick([70, 70, 62, 75, 80, 20, 15, 35]), big = a > 45 ? 'sin' : 'cos';
          var opts = [{ html: t(TX('cos', a)), right: big === 'cos', why: big === 'cos' ? null : 'The sine row overtakes the cosine row at ' + t(D(45)) + ', and ' + t(D(a)) + ' is past that.' }, { html: t(TX('sin', a)), right: big === 'sin', why: big === 'sin' ? null : 'Below ' + t(D(45)) + ' the cosine row is still ahead of the sine row.' }];
          return mc(r, 'Without evaluating either: which is bigger, ' + t(TX('cos', a)) + ' or ' + t(TX('sin', a)) + '?', opts,
            t(TX(big, a)) + ' is bigger. The sine row overtakes the cosine row at ' + t(D(45)) + ', and ' + t(D(a)) + ' is ' + (a > 45 ? 'past' : 'before') + ' that. (Equivalently, ' + t(TX('cos', a) + '=' + TX('sin', 90 - a)) + ', and ' + t(D(90 - a)) + (a > 45 ? '<' : '>') + t(D(a)) + '.)', ['Compare the angle with ' + t(D(45)) + '.'], 'cos vs sin ' + a, true);
        } }] },
      { num: '9', stem: function (sh) { return '<b>Where the ceiling comes from.</b> The triangle has acute angle ' + t('\\theta') + ' at ' + t(sh.n[0]) + ' and its right angle at ' + t(sh.n[2]) + '; the sides are named relative to ' + t('\\theta') + '.' + sh.fig; },
        shared: function (r) { var n = r.chance(0.4) ? ['A', 'B', 'C'] : r.pick([['P', 'Q', 'R'], ['D', 'E', 'F'], ['K', 'L', 'M'], ['X', 'Y', 'Z']]); n = r.chance(0.5) ? n : [n[0], n[2], n[1]]; return { n: n, fig: triFig(r, { w: 3.2, h: 1.85, names: n, sides: { a: 'opp', b: 'adj', c: 'hyp' }, angles: { A: 'θ' }, width: 260 }) }; },
        parts: [
          { id: 'e9a', sub: 'a', level: 'EMG', make: function (r) {
            return mc(r, 'Which inequality, from the Pythagorean theorem, shows that the hypotenuse is longer than either leg in every right triangle?', [
              { html: t('\\text{hyp}^2=\\text{opp}^2+\\text{adj}^2>\\text{opp}^2') + ' (and likewise ' + t('>\\text{adj}^2') + '), since both legs have positive length', right: true },
              { html: t('\\text{hyp}=\\text{opp}+\\text{adj}>\\text{opp}'), why: 'The Pythagorean theorem adds the <b>squares</b> of the legs, not the legs: ' + t('3+4\\ne 5') + '.' },
              { html: t('\\text{hyp}^2=\\text{opp}^2-\\text{adj}^2<\\text{opp}^2'), why: 'Pythagoras: ' + t('\\text{hyp}^2=\\text{opp}^2+\\text{adj}^2') + ' — a sum, so it is bigger than either square.' },
              { html: t('\\text{opp}^2+\\text{adj}^2<\\text{hyp}^2'), why: 'For a right triangle the two sides are <b>equal</b>: ' + t('\\text{opp}^2+\\text{adj}^2=\\text{hyp}^2') + '. Use that equality to compare.' }],
              'Pythagoras: ' + t('\\text{hyp}^2=\\text{opp}^2+\\text{adj}^2') + '. Both legs have positive length, so ' + t('\\text{hyp}^2>\\text{opp}^2') + ' and ' + t('\\text{hyp}^2>\\text{adj}^2') + '. Therefore ' + t('\\text{hyp}>\\text{opp}') + ' and ' + t('\\text{hyp}>\\text{adj}') + '.', ['Write the Pythagorean theorem with opp, adj and hyp.'], 'hyp longest by Pythagoras');
          } },
          { id: 'e9b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var n = sh.n, opp = [n[1], n[2]].sort().join(''), adj = [n[0], n[2]].sort().join(''), hyp = [n[0], n[1]].sort().join('');
            var fr = function (a, b) { return t('\\frac{' + a + '}{' + b + '}'); };
            return mc(r, 'Write ' + t('\\sin\\theta') + ' and ' + t('\\cos\\theta') + ' using the side names, and explain why neither can ever exceed ' + t('1') + '.', [
              { html: t('\\sin\\theta=') + fr(opp, hyp) + ', ' + t('\\cos\\theta=') + fr(adj, hyp) + '. Each numerator is a leg, shorter than the hypotenuse ' + t(hyp) + ' on the bottom, so each fraction is less than ' + t('1') + '.', right: true },
              { html: t('\\sin\\theta=') + fr(hyp, opp) + ', ' + t('\\cos\\theta=') + fr(hyp, adj) + '. The hypotenuse is the longest side, so each is less than ' + t('1') + '.', why: 'Those fractions are upside down (and they would be <b>more</b> than ' + t('1') + '). SOH: opposite over hypotenuse.' },
              { html: t('\\sin\\theta=') + fr(opp, adj) + ', ' + t('\\cos\\theta=') + fr(adj, opp) + '. The legs are always shorter than ' + t('1') + '.', why: 'Those use the two legs (that is the tangent and its reciprocal). Sine and cosine divide by the hypotenuse.' },
              { html: t('\\sin\\theta=') + fr(opp, hyp) + ', ' + t('\\cos\\theta=') + fr(adj, hyp) + '. They are less than ' + t('1') + ' because ' + t('\\theta') + ' is less than ' + t(D(90)) + '.', why: 'The fractions are right, but argue from the sides: what do you know about the numerator compared with the denominator?' }],
              t('\\sin\\theta=\\frac{\\text{opp}}{\\text{hyp}}=\\frac{' + opp + '}{' + hyp + '}') + ' and ' + t('\\cos\\theta=\\frac{\\text{adj}}{\\text{hyp}}=\\frac{' + adj + '}{' + hyp + '}') + '. From (a), opp ' + t('<') + ' hyp and adj ' + t('<') + ' hyp, so each fraction has a numerator smaller than its denominator, and any such fraction is less than ' + t('1') + '.', ['SOH CAH: which side is on the bottom of both fractions?'], 'why sin, cos < 1');
          } },
          { id: 'e9c', sub: 'c', level: 'EMG', make: function (r) {
            return mc(r, 'What would have to be true of the triangle for ' + t('\\sin\\theta') + ' to equal exactly ' + t('1') + '?', [
              { html: 'opp ' + t('=') + ' hyp, so ' + t('\\text{adj}^2=\\text{hyp}^2-\\text{opp}^2=0') + ': the triangle flattens into a segment. No real triangle does that — ' + t('\\sin 90^\\circ=1') + ' is the limit the pattern approaches.', right: true },
              { html: 'opp ' + t('=') + ' adj, which happens at ' + t(D(45)) + '.', why: 'At ' + t(D(45)) + ' the <b>tangent</b> is ' + t('1') + '. The sine is ' + t('1') + ' only when opp equals the hypotenuse.' },
              { html: 'The hypotenuse would have to be ' + t('1') + ' unit long.', why: 'With a hypotenuse of ' + t('1') + ', the sine equals the opposite side, which is still shorter than ' + t('1') + '.' },
              { html: 'The angle would have to be ' + t(D(1)) + '.', why: t('\\sin 1^\\circ\\approx 0.0175') + '. The sine is a ratio, not the angle.' }],
              t('\\sin\\theta=1') + ' needs ' + t('\\frac{\\text{opp}}{\\text{hyp}}=1') + ', i.e. opp ' + t('=') + ' hyp. Then ' + t('\\text{adj}^2=\\text{hyp}^2-\\text{opp}^2=0') + ', so the adjacent side has length ' + t('0') + ' and the triangle flattens onto a single segment. No actual triangle can do it; the ' + t(D(90)) + ' column holds ' + t('\\sin 90^\\circ=1') + ' as the limit the pattern approaches.', ['When does a fraction equal ' + t('1') + '? What does Pythagoras then say about the third side?'], 'sin = 1 impossible');
          } },
          { id: 'e9d', sub: 'd', level: 'PRG', make: function (r) {
            var A = r.pick([[15, 45, 61], [15, 45, 61], [20, 45, 62], [10, 45, 60]]), base = r.pick([4, 4, 5, 3]);
            return mc(r, 'The three triangles all have the same adjacent side.' + threeTri(A, base) + 'Why can ' + t('\\tan\\theta') + ' be smaller than ' + t('1') + ', exactly ' + t('1') + ', or as large as anyone names — while the sine cannot pass ' + t('1') + '?', [
              { html: 'The tangent ' + t('\\frac{\\text{opp}}{\\text{adj}}') + ' compares the two <b>legs</b>, and neither leg is forced to be the longer one; the sine divides by the hypotenuse, which always beats its numerator.', right: true },
              { html: 'The tangent uses the hypotenuse on the bottom, and the hypotenuse can be very short.', why: 'The tangent doesn’t use the hypotenuse at all: ' + t('\\tan\\theta=\\frac{\\text{opp}}{\\text{adj}}') + '.' },
              { html: 'The tangent is the sine multiplied by the angle, so it grows with the angle.', why: 'The tangent is a ratio of two sides. Look at the legs in the three triangles.' },
              { html: 'The adjacent side grows as the angle opens, so the tangent grows.', why: 'Here the adjacent side stays the same (' + t(base) + '). It is the opposite side that grows without limit.' }],
              t('\\tan\\theta=\\frac{\\text{opp}}{\\text{adj}}') + ': both parts are legs, and neither is forced to be longer. First triangle: opp ' + t('<') + ' adj, so ' + t('\\tan ' + D(A[0]) + '\\approx ' + fx(T.tan(A[0]), 4) + '<1') + '. Second: the legs are equal, so ' + t('\\tan 45^\\circ=1') + '. Third: opp ' + t('>') + ' adj, so ' + t('\\tan ' + D(A[2]) + '\\approx ' + fx(T.tan(A[2]), 4) + '>1') + '. Keep the adjacent side fixed and stretch the opposite side, and the fraction grows past any number. The sine cannot do this because its denominator is the hypotenuse, which always beats its numerator.', ['Which sides does the tangent compare? Is either of them always the longer one?'], 'why tan has no ceiling');
          } }] },
      { num: '10', stem: '<b>A symmetry hiding in the table.</b>', parts: [
        { id: 'e10a', sub: 'a', level: 'BEG', make: function (r) {
          var S = r.chance(0.4) ? SETS[0] : r.pick(SETS), a1 = S[1], a2 = S[2];
          return boxes('In the table for ' + S.map(function (a) { return t(D(a)); }).join(', ') + ', the sine row read left to right is the cosine row read right to left. Fill in the three equal pairs.', [
            intBox(t('\\sin ' + D(a1) + '=\\cos'), 90 - a1, cofDiag(a1), '°'), intBox(t('\\sin ' + D(a2) + '=\\cos'), 90 - a2, cofDiag(a2), '°'), intBox(t('\\sin 45^\\circ=\\cos'), 45, cofDiag(45), '°')],
            t('\\sin ' + D(a1) + '=\\cos ' + D(90 - a1)) + ' (both ' + t(fx(T.sin(a1), 4)) + '), ' + t('\\sin ' + D(a2) + '=\\cos ' + D(90 - a2)) + ' (both ' + t(fx(T.sin(a2), 4)) + '), ' + t('\\sin 45^\\circ=\\cos 45^\\circ') + ' (both ' + t('0.7071') + ').', ['Match each sine value with the same number in the cosine row.'], 'three cofunction pairs');
        } },
        { id: 'e10b', sub: 'b', level: 'BEG', make: function (r) {
          return mc(r, 'A table of values gives ' + t('\\sin 5^\\circ=\\cos 85^\\circ') + ', ' + t('\\sin 25^\\circ=\\cos 65^\\circ') + ' and ' + t('\\sin 45^\\circ=\\cos 45^\\circ') + '. Which general rule do these equations suggest?', [
            { html: t('\\sin\\theta=\\cos(90^\\circ-\\theta)'), right: true },
            { html: t('\\sin\\theta=\\cos\\theta'), why: 'Only at ' + t(D(45)) + '. In the pairs, the two angles are different and add to ' + t(D(90)) + '.' },
            { html: t('\\sin\\theta=\\cos(180^\\circ-\\theta)'), why: 'Check the pairs: the two angles add to ' + t(D(90)) + ', not ' + t(D(180)) + '.' },
            { html: t('\\sin\\theta=1-\\cos\\theta'), why: 'Test it at ' + t(D(45)) + ': ' + t('0.7071\\ne 1-0.7071') + '.' }],
            'In each pair the two angles add to ' + t(D(90)) + ', so ' + t('\\sin\\theta=\\cos(90^\\circ-\\theta)') + ' for every acute angle ' + t('\\theta') + '.', ['What do the two angles in each pair add to?'], 'cofunction rule');
        } },
        { id: 'e10c', sub: 'c', level: 'BEG', make: function (r) {
          var a = r.chance(0.3) ? 32 : r.pick(range(11, 79).filter(function (v) { return [15, 25, 35, 45, 55, 65, 75, 20, 30, 60, 70, 10, 80].indexOf(v) < 0; }));
          return boxes('Check the rule on a pair not in the table: take ' + t('\\theta=' + D(a)) + '. Evaluate to four decimal places.', [vBox('sin', a, 4), { label: t('\\cos(90^\\circ-' + D(a) + ')='), name: t('\\cos ' + D(90 - a)), x: T.cos(90 - a), dp: 4, alts: ratioAlts('cos', 90 - a).concat([{ v: T.cos(a), code: 'tv-cof-same', hint: 'That is ' + t(TX('cos', a)) + '. Work out ' + t('90-' + a) + ' first.' }]), diag: ratioDiag('cos') }],
            t(TX('sin', a) + '\\approx ' + fx(T.sin(a), 4)) + ' and ' + t('\\cos ' + D(90 - a) + '\\approx ' + fx(T.cos(90 - a), 4)) + ': equal ✓.', ['Work out ' + t('90-' + a) + ' first.'], 'check rule at ' + a);
        } },
        { id: 'e10d', sub: 'd(1)', level: 'BEG', make: function (r) {
          return mc(r, 'Triangle ' + t('PQR') + ' has its right angle at ' + t('Q') + ' and ' + t('\\angle P=\\theta') + '. Write ' + t('\\angle R') + ' in terms of ' + t('\\theta') + '.', [
            { html: t('\\angle R=90^\\circ-\\theta'), right: true }, { html: t('\\angle R=180^\\circ-\\theta'), why: 'The three angles add to ' + t(D(180)) + ', but ' + t('\\angle Q') + ' already uses ' + t(D(90)) + '.' },
            { html: t('\\angle R=\\theta-90^\\circ'), why: 'That would be negative for an acute ' + t('\\theta') + '.' }, { html: t('\\angle R=90^\\circ+\\theta'), why: 'That is more than ' + t(D(90)) + ' — but ' + t('\\angle R') + ' is acute.' }],
            'The three angles sum to ' + t(D(180)) + ' and ' + t('\\angle Q=90^\\circ') + ', so ' + t('\\angle R=90^\\circ-\\theta') + '.', ['Angles in a triangle add to ' + t(D(180)) + '.'], 'angle R');
        } },
        { id: 'e10d2', sub: 'd(2)', level: 'EMG', make: function (r) {
          var fig = HW.tri({ w: 3.1, h: 2.2, names: ['P', 'R', 'Q'], sides: { a: 'b', b: 'a', c: 'c' }, angles: { A: 'θ' }, width: 240, rot: r.int(0, 3), flip: r.chance(0.5) });
          return mc(r, 'Here ' + t('a=QP') + ', ' + t('b=QR') + ' and ' + t('c=PR') + '.' + fig + 'Write ' + t('\\sin\\theta') + ' and ' + t('\\cos(\\angle R)') + ' as fractions of ' + t('a') + ', ' + t('b') + ' and ' + t('c') + '. What do you find?', [
            { html: t('\\sin\\theta=\\frac{b}{c}') + ' and ' + t('\\cos R=\\frac{b}{c}') + ': the same fraction, because side ' + t('b') + ' is opposite one acute angle and adjacent to the other.', right: true },
            { html: t('\\sin\\theta=\\frac{a}{c}') + ' and ' + t('\\cos R=\\frac{b}{c}') + ', which are different.', why: 'Relative to ' + t('\\theta') + ' at ' + t('P') + ', side ' + t('a=QP') + ' touches the angle — it is the <b>adjacent</b> side. The opposite side is ' + t('b') + '.' },
            { html: t('\\sin\\theta=\\frac{b}{c}') + ' and ' + t('\\cos R=\\frac{a}{c}') + ', which are different.', why: 'Relative to ' + t('\\angle R') + ', side ' + t('b=QR') + ' touches ' + t('R') + ' — it is the adjacent side.' },
            { html: t('\\sin\\theta=\\frac{b}{a}') + ' and ' + t('\\cos R=\\frac{a}{b}') + ', which are reciprocals.', why: 'Those use the two legs. Sine and cosine divide by the hypotenuse ' + t('c') + '.' }],
            'Relative to ' + t('\\theta') + ' (at ' + t('P') + '): opp ' + t('=b') + ', adj ' + t('=a') + ', hyp ' + t('=c') + ', so ' + t('\\sin\\theta=\\frac{b}{c}') + '. Relative to ' + t('\\angle R') + ': opp ' + t('=a') + ', adj ' + t('=b') + ', hyp ' + t('=c') + ', so ' + t('\\cos R=\\frac{b}{c}') + '. The same fraction, so ' + t('\\sin\\theta=\\cos(\\angle R)=\\cos(90^\\circ-\\theta)') + '.', ['Name opp, adj and hyp for ' + t('\\theta') + ', then again for ' + t('\\angle R') + '.'], 'why sin = cos(90-θ)');
        } },
        { id: 'e10e', sub: 'e(i)', level: 'BEG', make: function (r) { var a = r.chance(0.3) ? 28 : r.pick(range(8, 82).filter(function (v) { return v !== 45; })); return degNum('Use the rule (no calculator): ' + t('\\sin ' + D(a) + '=\\cos\\ \\underline{\\quad}'), 90 - a, cofDiag(a), t('90-' + a + '=' + (90 - a)) + ', so ' + t('\\sin ' + D(a) + '=\\cos ' + D(90 - a)) + '.', ['The two angles add to ' + t(D(90)) + '.'], 'sin ' + a + ' = cos ?', t('\\sin ' + D(a) + '=\\cos')); } },
        { id: 'e10e2', sub: 'e(ii)', level: 'BEG', make: function (r) { var a = r.chance(0.3) ? 74 : r.pick(range(8, 82).filter(function (v) { return v !== 45; })); return degNum('Use the rule (no calculator): ' + t('\\cos ' + D(a) + '=\\sin\\ \\underline{\\quad}'), 90 - a, cofDiag(a), t('90-' + a + '=' + (90 - a)) + ', so ' + t('\\cos ' + D(a) + '=\\sin ' + D(90 - a)) + '.', ['The two angles add to ' + t(D(90)) + '.'], 'cos ' + a + ' = sin ?', t('\\cos ' + D(a) + '=\\sin')); } },
        { id: 'e10e3', sub: 'e(iii)', level: 'BEG', make: function (r) { var s = r.chance(0.5); return degNum('Use the rule (no calculator): ' + t((s ? '\\sin' : '\\cos') + ' 45^\\circ=' + (s ? '\\cos' : '\\sin') + '\\ \\underline{\\quad}'), 45, function (v) { return v === 135 ? cofDiag(45)(135) : v === 0 ? { code: 'value', hint: 'The angle must make ' + t('45+?=90') + '.' } : null; }, t('90-45=45') + ': ' + t(D(45)) + ' is its own complement.', ['What angle adds to ' + t(D(45)) + ' to make ' + t(D(90)) + '?'], '45 self-complementary', t((s ? '\\sin' : '\\cos') + ' 45^\\circ=' + (s ? '\\cos' : '\\sin'))); } },
        { id: 'e10e4', sub: 'e(iv)', level: 'ADV', make: function (r) {
          var o = r.chance(0.3) ? { p: 2, q: 30, x: 20 } : pickWhere(function () { var p = r.pick([2, 3, 4]), x = r.int(5, 25), q = 90 - (p + 1) * x; return { p: p, q: q, x: x }; }, function (o) { return o.q >= 5 && o.q <= 50 && o.p * o.x < 90 && o.x + o.q < 90 && o.p * o.x !== o.x + o.q; }); // not both 45° (then “set them equal” would also give x)
          var p = o.p, q = o.q, x = o.x, eqv = (o.p - 1) ? q / (p - 1) : null, e180 = (180 - q) / (p + 1);
          var lhs = '\\sin(' + p + 'x)^\\circ', rhs = '\\cos(x+' + q + ')^\\circ';
          return B.number('Solve for ' + t('x') + ': ' + t(lhs + '=' + rhs) + ', where both angles are acute.', x, function (v) {
            if (eqv != null && Math.abs(v - eqv) < 1e-9) return { code: 'tv-cof-equal', hint: 'Setting ' + t(p + 'x=x+' + q) + ' would make <b>the same</b> angle’s sine and cosine equal. The cofunction rule needs the two angles to be <b>complementary</b>: they add to ' + t('90') + '.' };
            if (Math.abs(v - e180) < 1e-9) return { code: 'tv-cof-180', hint: 'Complementary angles add to ' + t('90') + ', not ' + t('180') + '.' };
            return null;
          }, t(lhs + '=' + rhs) + ' needs the two angles to be complementary: ' + t(p + 'x+(x+' + q + ')=90') + ', so ' + t((p + 1) + 'x+' + q + '=90') + ', ' + t((p + 1) + 'x=' + (90 - q)) + ', ' + t('x=' + x) + '. Check: ' + t('\\sin ' + D(p * x) + '\\approx ' + fx(T.sin(p * x), 4)) + ' and ' + t('\\cos ' + D(x + q) + '\\approx ' + fx(T.cos(x + q), 4)) + ' ✓',
            ['When is the sine of one angle equal to the cosine of another?', 'Set the two angles to add to ' + t('90') + ' and solve.'], 'solve sin(' + p + 'x)=cos(x+' + q + ')', { before: t('x=') });
        } }] },
      /* ---------- Part D ---------- */
      { num: '11', section: 'Extra practice D — Cornering an angle by testing', stem: function (sh) { return 'Find, <b>by testing whole-degree angles</b> (tangent key, not ' + t('\\tan^{-1}') + '), the two consecutive whole degrees between which the angle ' + t('\\theta') + ' with ' + t('\\tan\\theta=' + sh.v) + ' must lie.'; },
        shared: function (r) { return { v: r.chance(0.3) ? 1.6 : pickWhere(function () { return r.int(110, 165) / 100; }, function (v) { var th = T.atan(v), d = th % 1; return th > 46 && th < 59.5 && d > 0.004 && d < 0.996 && Math.abs(d - 0.5) > 0.12; }) }; },
        parts: [
          { id: 'e11a', sub: 'a', level: 'BEG', make: function (r, sh) {
            return boxes('Start from ' + t('\\tan 45^\\circ') + ' and ' + t('\\tan 60^\\circ') + ' (four decimal places).', [vBox('tan', 45, 4), vBox('tan', 60, 4)],
              t('\\tan 45^\\circ=1') + ' and ' + t('1<' + sh.v) + ', so ' + t(D(45)) + ' is too small: ' + t('\\theta>45^\\circ') + '. ' + t('\\tan 60^\\circ\\approx 1.7321') + ' and ' + t('1.7321>' + sh.v) + ', so ' + t(D(60)) + ' is too big: ' + t('\\theta<60^\\circ') + '. Therefore ' + t('45^\\circ<\\theta<60^\\circ') + '.', ['Degree mode; four decimal places.'], 'tan 45, tan 60');
          } },
          { id: 'e11b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var th = T.atan(sh.v), L = Math.floor(th);
            return { prompt: 'Keep halving the gap. Finish with the two consecutive whole degrees.', input: { type: 'fields', fields: [{ label: t('\\theta') + ' is between', name: 'lower angle', after: '°' }, { label: 'and', name: 'upper angle', after: '°' }] },
              check: bracketCheck('tan', sh.v, false), key: [String(L), String(L + 1)], answer: t(D(L) + '<\\theta<' + D(L + 1)), text: 'squeeze tan = ' + sh.v,
              solution: 'For example: ' + [Math.round((45 + 60) / 2), L, L + 1].filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (a) { return t('\\tan ' + D(a) + '\\approx ' + fx(T.tan(a), 4)) + ' — ' + (T.tan(a) > sh.v ? 'too big' : 'too small'); }).join('<br>') + '<br>So ' + t(D(L) + '<\\theta<' + D(L + 1)) + '.',
              hints: ['Test the middle of your interval. If its tangent is too big, the angle is too big.'], bad: [[String(L - 1), String(L)], ['45', '60']] };
          } },
          { id: 'e11c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var th = T.atan(sh.v), L = Math.floor(th), near = Math.round(th), dL = sh.v - T.tan(L), dU = T.tan(L + 1) - sh.v;
            return mc(r, 'You found ' + t(D(L) + '<\\theta<' + D(L + 1)) + ', with ' + t('\\tan ' + D(L) + '\\approx ' + fx(T.tan(L), 4)) + ' and ' + t('\\tan ' + D(L + 1) + '\\approx ' + fx(T.tan(L + 1), 4)) + '. Which degree is ' + t('\\theta') + ' nearer to?', [
              { html: 'Nearer ' + t(D(near)) + ': its tangent misses ' + t(sh.v) + ' by less', right: true },
              { html: 'Nearer ' + t(D(near === L ? L + 1 : L)) + ': its tangent misses ' + t(sh.v) + ' by less', why: 'Work out both misses: ' + t(fx(T.tan(L + 1), 4) + '-' + sh.v + '=' + fx(dU, 4)) + ' and ' + t(sh.v + '-' + fx(T.tan(L), 4) + '=' + fx(dL, 4)) + '.' },
              { html: 'Exactly halfway between them', why: 'Compare the two misses — they are not equal.' }],
              t('\\tan ' + D(L + 1)) + ' misses by ' + t(fx(dU, 4)) + ' and ' + t('\\tan ' + D(L)) + ' misses by ' + t(fx(dL, 4)) + ', so ' + t('\\theta') + ' is nearer ' + t(D(near)) + '. (Over one degree the tangent barely curves, so the smaller miss marks the nearer degree.)', ['How far is each tangent value from ' + t(sh.v) + '?'], 'nearer degree tan = ' + sh.v);
          } },
          { id: 'e11d', sub: 'd', level: 'BEG', make: function (r, sh) {
            var th = T.atan(sh.v);
            return degNear('<b>Now</b> use ' + t(TXI('tan', sh.v)) + ' to confirm your squeeze. Give ' + t('\\theta') + ' to the nearest degree.', th, { alts: angAlts('tan', sh.v), before: t('\\theta=') },
              t(TXI('tan', sh.v) + '=' + th.toFixed(4) + '\\ldots^\\circ') + ', which sits between ' + t(D(Math.floor(th))) + ' and ' + t(D(Math.floor(th) + 1)) + ', as the squeeze predicted. To the nearest degree, ' + t('\\theta=' + D(Math.round(th))) + '.', ['2nd tan in degree mode.'], 'tan^-1 ' + sh.v);
          } }] },
      { num: '12', stem: 'Repeat the squeeze. Two or three well-chosen tests each is plenty.', parts: [
        { id: 'e12a', sub: 'a', level: 'EMG', make: function (r) {
          var v = r.chance(0.3) ? 0.62 : pickWhere(function () { return r.int(15, 95) / 100; }, function (v) { var d = T.asin(v) % 1; return d > 0.1 && d < 0.4; });
          var th = T.asin(v), L = Math.floor(th);
          return { prompt: t('\\sin\\theta=' + v) + ': give the two consecutive whole degrees, then check with ' + t('\\sin^{-1}') + ' (nearest degree).', input: { type: 'fields', fields: [{ label: t('\\theta') + ' is between', name: 'lower angle', after: '°' }, { label: 'and', name: 'upper angle', after: '°' }, { label: t(TXI('sin', v) + '\\approx'), name: 'nearest degree', after: '°' }] },
            check: bracketCheck('sin', v, true), key: [String(L), String(L + 1), String(Math.round(th))], answer: t(D(L) + '<\\theta<' + D(L + 1)) + '; ' + t(TXI('sin', v) + '\\approx ' + D(Math.round(th))), text: 'squeeze sin = ' + v,
            solution: t('\\sin ' + D(L) + '\\approx ' + fx(T.sin(L), 4)) + ' — too small, so ' + t('\\theta>' + D(L)) + '.<br>' + t('\\sin ' + D(L + 1) + '\\approx ' + fx(T.sin(L + 1), 4)) + ' — too big, so ' + t('\\theta<' + D(L + 1)) + '.<br>Check: ' + t(TXI('sin', v) + '=' + th.toFixed(4) + '\\ldots^\\circ\\approx ' + D(Math.round(th))) + '.',
            hints: ['Sine increases with the angle: if a test value is too big, the test angle was too big.'], bad: [[String(L), String(L + 1), String(L + 1)]] };
        } },
        { id: 'e12b', sub: 'b', level: 'EMG', make: function (r) {
          var v = r.chance(0.3) ? 0.35 : pickWhere(function () { return r.int(10, 90) / 100; }, function (v) { var d = T.acos(v) % 1; return d > 0.5 && d < 0.75; });
          var th = T.acos(v), L = Math.floor(th);
          return { prompt: t('\\cos\\theta=' + v) + ': give the two consecutive whole degrees, then check with ' + t('\\cos^{-1}') + ' (nearest degree).', input: { type: 'fields', fields: [{ label: t('\\theta') + ' is between', name: 'lower angle', after: '°' }, { label: 'and', name: 'upper angle', after: '°' }, { label: t(TXI('cos', v) + '\\approx'), name: 'nearest degree', after: '°' }] },
            check: bracketCheck('cos', v, true), key: [String(L), String(L + 1), String(Math.round(th))], answer: t(D(L) + '<\\theta<' + D(L + 1)) + '; ' + t(TXI('cos', v) + '\\approx ' + D(Math.round(th))), text: 'squeeze cos = ' + v,
            solution: t('\\cos ' + D(L) + '\\approx ' + fx(T.cos(L), 4)) + ' — too big, so ' + t('\\theta>' + D(L)) + ' (the cosine decreases).<br>' + t('\\cos ' + D(L + 1) + '\\approx ' + fx(T.cos(L + 1), 4)) + ' — too small, so ' + t('\\theta<' + D(L + 1)) + '.<br>Check: ' + t(TXI('cos', v) + '=' + th.toFixed(4) + '\\ldots^\\circ\\approx ' + D(Math.round(th))) + ' — the nearest degree is the <b>upper</b> bracket here.',
            hints: ['The cosine <b>decreases</b> as the angle grows: if a test value is too big, the test angle was too small.'], bad: [[String(L), String(L + 1), String(L)]] };
        } },
        { id: 'e12c', sub: 'c', level: 'EMG', make: function (r) {
          return mc(r, 'The cosine hunt runs <b>backwards</b> compared with the sine hunt. If a test angle gives a cosine that is <b>too big</b>, which way must the next guess move?', [
            { html: '<b>Up</b> — the cosine decreases as the angle grows, so a cosine that is too big means the test angle was too small.', right: true },
            { html: '<b>Down</b> — a value that is too big means the angle was too big.', why: 'That is how the sine hunt works. The cosine <b>decreases</b> as the angle grows.' },
            { html: 'It depends on whether the angle is above or below ' + t(D(45)) + '.', why: 'The cosine decreases across the whole range from ' + t(D(0)) + ' to ' + t(D(90)) + ' — the direction never changes.' }],
            'The cosine decreases as the angle grows, so “cosine too big” means “angle too small”: the next guess must move <b>up</b>. With the (increasing) sine it is the familiar way round.', ['Does the cosine grow or shrink as the angle opens?'], 'cosine hunt direction');
        } },
        { id: 'e12d', sub: 'd', level: 'EMG', make: function (r) {
          return mc(r, 'For ' + t('\\cos\\theta=0.35') + ' the bracket is ' + t('69^\\circ<\\theta<70^\\circ') + ', and ' + t('\\cos^{-1}(0.35)=69.5127\\ldots^\\circ') + '. How is the bracket different from “' + t('\\theta') + ' to the nearest degree”?', [
            { html: 'The bracket names <b>both</b> neighbouring whole degrees; rounding picks the one ' + t('\\theta') + ' is closer to — here ' + t(D(70)) + ', since ' + t('69.51\\ldots') + ' is past halfway.', right: true },
            { html: 'They are the same: the nearest degree is always the lower end of the bracket.', why: t('69.5127\\ldots') + ' is past halfway, so it rounds <b>up</b> to ' + t(D(70)) + '.' },
            { html: 'The bracket is more accurate than rounding.', why: 'They answer different questions: “which two degrees?” versus “which one is closest?”.' },
            { html: 'For the cosine the nearest degree is the upper end because the cosine runs backwards.', why: 'Rounding has nothing to do with the cosine decreasing: ' + t('69.5127\\ldots') + ' rounds to ' + t('70') + ' because its decimal part is more than ' + t('0.5') + '.' }],
            'The bracket ' + t('69^\\circ<\\theta<70^\\circ') + ' answers “which two whole degrees does ' + t('\\theta') + ' sit between?”. “To the nearest degree” asks which of those two it is closer to: ' + t('69.5127\\ldots^\\circ') + ' is just past halfway, so ' + t('\\theta') + ' rounds to ' + t(D(70)) + '. A bracket names both neighbours; rounding picks one.', ['Look at the decimal part of ' + t('69.5127\\ldots') + '.'], 'bracket vs nearest');
        } }] },
      /* ---------- Part E ---------- */
      { num: '13', section: 'Extra practice E — Error analysis: three ways to misread the inverse key', stem: function (sh) { return '<b>The notation trap.</b> Asked for the acute angle with ' + t('\\sin\\theta=' + sh.v) + ', a student wrote ' + t('\\sin^{-1}(' + sh.v + ')=\\frac{1}{' + sh.v + '}=' + sh.rec) + '.'; },
        shared: function (r) { var v = r.chance(0.35) ? 0.8 : r.pick([0.8, 0.4, 0.25, 0.5, 0.625, 0.64]); return { v: v, rec: +(1 / v).toFixed(4) }; },
        parts: [
          { id: 'e13a', sub: 'a', level: 'BEG', make: function (r, sh) {
            return mc(r, 'Name the error precisely.', [
              { html: 'The student read the ' + t('-1') + ' as an exponent (one over). In ' + t('\\sin^{-1}') + ' it means the <b>inverse sine</b>: ' + t('\\sin^{-1}(' + sh.v + ')') + ' is the angle whose sine is ' + t(sh.v) + '.', right: true },
              { html: 'The student should have used ' + t('\\cos^{-1}') + ' instead of ' + t('\\sin^{-1}') + '.', why: 'The ratio given is a sine, so ' + t('\\sin^{-1}') + ' is right. The mistake is what the student did with it.' },
              { html: 'The method is right, but the answer should be rounded to the nearest degree.', why: t(sh.rec) + ' is not an angle at all — the method is wrong, not the rounding.' },
              { html: 'The student should have pressed ' + t('\\sin') + ' and typed ' + t(sh.v) + '.', why: t('\\sin(' + sh.v + '^\\circ)') + ' treats ' + t(sh.v) + ' as an angle. Here ' + t(sh.v) + ' is the ratio; use the inverse key.' }],
              'The student read the ' + t('-1') + ' as an exponent, treating ' + t('\\sin^{-1}(' + sh.v + ')') + ' as ' + t('\\frac{1}{' + sh.v + '}') + '. In ' + t('\\sin^{-1}') + ' the ' + t('-1') + ' is function notation for the inverse sine: ' + t('\\sin^{-1}(' + sh.v + ')') + ' means “the angle whose sine is ' + t(sh.v) + '”.', ['What does the 2nd sin key do?'], 'notation trap');
          } },
          { id: 'e13b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var lo = [0, 5, 25, 45, 65, 85].filter(function (a) { return T.sin(a) < sh.v; }).pop(), hi = [5, 25, 45, 65, 85, 90].filter(function (a) { return T.sin(a) > sh.v; })[0];
            var o = [{ value: 'deg', html: t(sh.rec) + ' is a pure number with no degree sign — it is not an angle.' }, { value: 'tab', html: 'From the table, ' + t('\\sin ' + D(lo) + '<' + sh.v + '<\\sin ' + D(hi)) + ', so the angle is between ' + t(D(lo)) + ' and ' + t(D(hi)) + ' — and ' + t(sh.rec + '^\\circ') + ' is not in that range.' },
              { value: 'big', html: t(sh.rec) + ' is greater than ' + t('1') + ', and a sine can never be more than ' + t('1') + '.' }, { value: 'whole', html: t('\\sin^{-1}') + ' always gives a whole number of degrees.' }];
            return { prompt: 'Select the <b>two</b> good reasons, before any calculation, that ' + t(sh.rec) + ' cannot be the answer.', input: { type: 'select', options: r.shuffle(o) }, key: ['deg', 'tab'], answer: o[0].html + '<br>' + o[1].html, text: 'two reasons 1/v wrong',
              check: K.selectSet(['deg', 'tab'], function (extra) {
                if (extra.indexOf('big') >= 0) return { code: 'tv-ratio-for-angle', hint: t(sh.rec) + ' is the student’s claimed <b>angle</b>, not a sine. Angles can be bigger than ' + t('1') + ' (degree).' };
                if (extra.indexOf('whole') >= 0) return { code: 'value', hint: t('\\sin^{-1}(0.62)\\approx 38.3^\\circ') + ' — inverse values are not always whole numbers.' };
                return { code: 'value', hint: 'There are two good reasons: one about what kind of number the answer is, one from the table.' };
              }),
              solution: '(i) The question asks for an <b>angle</b>; ' + t(sh.rec) + ' carries no degree sign and is a pure number. (ii) From the table, ' + t('\\sin ' + D(lo) + '\\approx ' + fx(T.sin(lo), 4)) + ' and ' + t('\\sin ' + D(hi) + '\\approx ' + fx(T.sin(hi), 4)) + ', so the angle lies between ' + t(D(lo)) + ' and ' + t(D(hi)) + '.', hints: ['What kind of thing should the answer be? Where does ' + t(sh.v) + ' sit in the sine row?'], bad: [['deg', 'big'], ['deg']] };
          } },
          { id: 'e13c', sub: 'c', level: 'BEG', make: function (r, sh) {
            var th = T.asin(sh.v), n = Math.round(th);
            return boxes('Do the question properly, then check with a round trip.', [{ label: t('\\theta=\\sin^{-1}(' + sh.v + ')\\approx'), name: 'the angle', x: th, dp: 0, after: '°', tex: D(n), alts: angAlts('sin', sh.v) }, vBox('sin', n, 4, 'round trip')],
              t('\\theta=\\sin^{-1}(' + sh.v + ')=' + th.toFixed(4) + '\\ldots^\\circ\\approx ' + D(n)) + '. Round trip: ' + t('\\sin ' + D(n) + '\\approx ' + fx(T.sin(n), 4)) + (R(T.sin(n), 4) === sh.v ? ' ✓' : ', close to ' + t(sh.v) + ' ✓ (not exact, because ' + t(D(n)) + ' is the rounded angle).'), ['First box: 2nd sin. Second box: sin of your whole-degree answer.'], 'proper sin^-1 ' + sh.v);
          } },
          { id: 'e13d', sub: 'd(1)', level: 'EMG', make: function (r, sh) {
            var n = Math.round(T.asin(sh.v));
            return boxes('Test the student’s answer directly, then compare with the real angle. (Four decimal places.)', [vBox('sin', sh.rec, 4), { label: t('\\dfrac{1}{\\sin ' + D(n) + '}='), name: t('\\frac{1}{\\sin ' + D(n) + '}'), x: 1 / T.sin(n), dp: 4, alts: [{ v: T.sin(n), code: 'tv-reciprocal', hint: 'That is ' + t('\\sin ' + D(n)) + '. Now take one over it.' }, { v: 1 / RAD.sin(n), code: 'tv-radian', hint: RADH }] }],
              t('\\sin(' + sh.rec + '^\\circ)\\approx ' + fx(T.sin(sh.rec), 4)) + ' — nothing like ' + t(sh.v) + ', so the student’s answer fails its own test. ' + t('\\frac{1}{\\sin ' + D(n) + '}\\approx ' + fx(1 / T.sin(n), 4)) + ' — close to ' + t(sh.rec) + ', because ' + t(sh.rec) + ' really is the reciprocal of the ratio.', ['Degree mode. For the second box, find the sine first, then divide ' + t('1') + ' by it.'], 'test 1/v');
          } },
          { id: 'e13d2', sub: 'd(2)', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Why does the closeness of ' + t('\\frac{1}{\\sin\\theta}') + ' to ' + t(sh.rec) + ' make this error so easy to miss?', [
              { html: t('\\frac{1}{' + sh.v + '}') + ' is a genuine number from the same triangle (hyp ÷ opp), so it looks like it came from real work — but it is a ratio of <b>lengths</b>, not an angle.', right: true },
              { html: 'Because the student’s answer is actually correct, just written differently.', why: t('\\sin(' + sh.rec + '^\\circ)') + ' is nowhere near ' + t(sh.v) + '. The answer is wrong.' },
              { html: 'Because calculators show the reciprocal when the inverse key is pressed.', why: 'The inverse key gives an angle. The reciprocal came from reading ' + t('-1') + ' as an exponent.' },
              { html: 'Because ' + t(sh.rec) + ' rounds to the right angle.', why: 'The right angle is about ' + t(D(Math.round(T.asin(sh.v)))) + ' — far from ' + t(sh.rec) + '.' }],
              t('\\frac{1}{' + sh.v + '}=' + sh.rec) + ' really is the reciprocal of the sine ratio: a real number belonging to the same triangle (hypotenuse over opposite), close to ' + t('\\frac{1}{\\sin\\theta}') + '. So it looks like it came from real work. But it is a ratio of lengths, not the measure of an angle — the missing degree sign is the tell.', ['What does ' + t('\\frac{1}{\\sin\\theta}') + ' measure in the triangle?'], 'why trap is easy to miss');
          } }] },
      { num: '14', stem: function (sh) { return '<b>“The angle is undefined.”</b> Asked for the acute angle with ' + t('\\' + sh.f + '\\theta=' + sh.v) + ', a student typed ' + t(TXI(sh.f, sh.v)) + ', got an error message, and wrote: <i>“The angle is undefined.”</i>'; },
        shared: function (r) { return r.chance(0.35) ? { f: 'sin', v: 1.3 } : { f: r.pick(['sin', 'cos']), v: r.pick([1.3, 1.2, 1.5, 1.1, 1.4]) }; },
        parts: [
          { id: 'e14a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var top = sh.f === 'sin' ? 'opp' : 'adj';
            return mc(r, 'Using ' + top + ' and hyp, why does <b>no</b> angle at all have a ' + NAME[sh.f] + ' of ' + t(sh.v) + '?', [
              { html: t('\\' + sh.f + '\\theta=\\frac{\\text{' + top + '}}{\\text{hyp}}') + ' and the hypotenuse is the longest side, so the fraction is always less than ' + t('1') + '. A ' + NAME[sh.f] + ' of ' + t(sh.v) + ' would need a leg longer than the hypotenuse.', right: true },
              { html: 'The calculator can’t handle numbers bigger than ' + t('1') + '.', why: 'It handles ' + t('\\tan^{-1}(' + sh.v + ')') + ' fine. The reason is about the triangle, not the calculator.' },
              { html: 'There is an angle, but it is bigger than ' + t(D(90)) + '.', why: 'No angle of any size has a ' + NAME[sh.f] + ' above ' + t('1') + '. In a right triangle the reason is that the hypotenuse is the longest side.' },
              { html: 'The ' + NAME[sh.f] + ' must be a whole number.', why: 'Sines and cosines are usually decimals (like ' + t('0.7071') + '). The issue is the size: more than ' + t('1') + '.' }],
              t('\\' + sh.f + '\\theta=\\frac{\\text{' + top + '}}{\\text{hyp}}') + ', and in every right triangle the hypotenuse is the longest side, so ' + t('\\text{' + top + '}<\\text{hyp}') + ' and the fraction is less than ' + t('1') + '. For ' + t('\\' + sh.f + '\\theta=' + sh.v) + ' the ' + (sh.f === 'sin' ? 'opposite' : 'adjacent') + ' side would have to be ' + t(sh.v) + ' times the hypotenuse — a leg longer than the longest side. No angle has that ' + NAME[sh.f] + '.', ['Which side is on the bottom of the fraction? Can the top be bigger?'], 'no angle with ' + sh.f + ' = ' + sh.v);
          } },
          { id: 'e14b', sub: 'b', level: 'BEG', make: function (r, sh) {
            return mc(r, 'In this unit one value genuinely deserves the word “undefined”. Which one, and how is it different from ' + t(TXI(sh.f, sh.v)) + '?', [
              { html: t('\\tan 90^\\circ') + ': as the angle reaches ' + t(D(90)) + ' the adjacent side shrinks to ' + t('0') + ', so one input has no output. ' + t(TXI(sh.f, sh.v)) + ' is different: ' + t(sh.v) + ' is outside the values a ' + NAME[sh.f] + ' can ever produce.', right: true },
              { html: t('\\sin 90^\\circ') + ', because a triangle can’t have two right angles.', why: t('\\sin 90^\\circ=1') + ' — it has a value (the limit of the pattern).' },
              { html: t('\\cos 90^\\circ') + ', because the adjacent side is ' + t('0') + '.', why: t('\\cos 90^\\circ=\\frac{0}{\\text{hyp}}=0') + ' — dividing <b>into</b> zero is fine. Which ratio would divide <b>by</b> zero?' },
              { html: t('\\tan 0^\\circ') + ', because the opposite side is ' + t('0') + '.', why: t('\\tan 0^\\circ=\\frac{0}{\\text{adj}}=0') + ' — that is defined. Which ratio would divide <b>by</b> zero?' }],
              t('\\tan 90^\\circ') + ' genuinely deserves the word: as ' + t('\\theta') + ' climbs toward ' + t(D(90)) + ' the adjacent side shrinks toward ' + t('0') + ', so ' + t('\\frac{\\text{opp}}{\\text{adj}}') + ' grows without bound — one particular input with no output. ' + t(TXI(sh.f, sh.v)) + ' is a different failure: ' + t(sh.v) + ' lies outside the set of values a ' + NAME[sh.f] + ' can produce. “Undefined at one point” versus “no solution at all”.', ['Which ratio would mean dividing by ' + t('0') + '?'], 'tan 90 vs no solution');
          } },
          { id: 'e14c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var f = sh.f, k = t('\\' + f + '^{-1}(k)'), tk = t('\\tan^{-1}(k)');
            return mc(r, 'For which values of ' + t('k') + ' does ' + k + ' return an acute angle? And ' + tk + '?', [
              { html: k + ': exactly when ' + t('0<k<1') + '. ' + tk + ': for every ' + t('k>0') + '.', right: true },
              { html: k + ': ' + t('0<k<1') + '. ' + tk + ': also only ' + t('0<k<1') + '.', why: 'The tangent has no ceiling: ' + t('\\tan^{-1}(50)\\approx 88.9^\\circ') + ' is acute.' },
              { html: k + ': ' + t('0\\le k\\le 1') + '. ' + tk + ': every ' + t('k>0') + '.', why: (f === 'sin' ? t('\\sin^{-1}(0)=0^\\circ') + ' and ' + t('\\sin^{-1}(1)=90^\\circ') : t('\\cos^{-1}(1)=0^\\circ') + ' and ' + t('\\cos^{-1}(0)=90^\\circ')) + ' — neither is acute. The endpoints must be left out.' },
              { html: k + ': every ' + t('k>0') + '. ' + tk + ': ' + t('0<k<1') + '.', why: 'Swapped: the ' + NAME[f] + ' has the ceiling of ' + t('1') + '; the tangent has none.' }],
              k + ' gives an acute angle exactly when ' + t('0<k<1') + ' (' + t('k=0') + ' and ' + t('k=1') + ' give ' + t(D(0)) + ' or ' + t(D(90)) + ', neither acute; ' + t('k>1') + ' is refused). ' + tk + ' gives an acute angle for every ' + t('k>0') + ' — there is no upper limit, because the tangent has no ceiling.', ['The ' + NAME[f] + ' has a ceiling of ' + t('1') + '. Does the tangent?'], 'ranges of inverse keys');
          } },
          { id: 'e14d', sub: 'd', level: 'EMG', make: function (r) {
            var pool = [['s95', '\\sin^{-1}(0.95)', true], ['c105', '\\cos^{-1}(1.05)', false], ['t105', '\\tan^{-1}(1.05)', true], ['t50', '\\tan^{-1}(50)', true], ['c999', '\\cos^{-1}(0.999)', true], ['s12', '\\sin^{-1}(1.2)', false], ['t3', '\\tan^{-1}(3)', true], ['c2', '\\cos^{-1}(2)', false], ['s101', '\\sin^{-1}(1.01)', false], ['t200', '\\tan^{-1}(200)', true]];
            var pick = pickWhere(function () { return r.sample(pool, 5); }, function (s) { var n = s.filter(function (x) { return !x[2]; }).length; return n >= 1 && n <= 2; });
            if (r.chance(0.3)) pick = [pool[0], pool[1], pool[2], pool[3], pool[4]];
            var want = pick.filter(function (x) { return !x[2]; }).map(function (x) { return x[0]; });
            return { prompt: 'Which of these entries will the calculator <b>refuse</b>? Select every one.', input: { type: 'select', options: pick.map(function (x) { return { value: x[0], html: t(x[1]) }; }) }, key: want,
              answer: want.map(function (id) { return t(pick.filter(function (x) { return x[0] === id; })[0][1]); }).join(', '), text: 'refused inverse entries',
              check: K.selectSet(want, function (extra, missing) {
                if (extra.length) { var e = pick.filter(function (x) { return x[0] === extra[0]; })[0]; return { code: 'value', hint: t(e[1]) + ' is fine: ' + (/tan/.test(e[1]) ? 'the tangent has no ceiling, so any positive number is a tangent.' : 'the value is less than ' + t('1') + '.') }; }
                return { code: 'value', hint: 'A sine or cosine can never be more than ' + t('1') + '. Check each sine and cosine entry.' };
              }),
              solution: pick.map(function (x) { return t(x[1]) + (x[2] ? ' ✓ accepted (' + (/tan/.test(x[1]) ? 'the tangent has no ceiling' : 'less than 1') + ')' : ' — <b>refused</b>: no sine or cosine is more than ' + t('1')); }).join('<br>'), hints: ['Sines and cosines are never more than ' + t('1') + '; tangents can be any positive number.'], bad: [want.concat([pick.filter(function (x) { return x[2]; })[0][0]]), want.slice(1).length ? want.slice(1) : [pick.filter(function (x) { return x[2]; })[0][0]]] };
          } }] },
      { num: '15', stem: function (sh) { return '<b>The missing brackets.</b> Asked for the acute angle with ' + t('\\tan\\theta=\\dfrac{' + sh.p + '}{' + sh.q + '}') + ', a student keyed in ' + t('\\tan^{-1}(' + sh.p + ')\\div ' + sh.q) + ' and wrote ' + t('\\theta=' + D(Math.round(T.atan(sh.p) / sh.q))) + '.'; },
        shared: function (r) { if (r.chance(0.3)) return { p: 7, q: 4 }; return pickWhere(function () { return { p: r.int(3, 13), q: r.int(2, 5) }; }, function (o) { var v = o.p / o.q, th = T.atan(v); return ex.gcd(o.p, o.q) === 1 && v > 1.2 && v < 4 && Math.abs(th % 1 - 0.5) > 0.1 && fx(T.tan(Math.round(th)), 4) !== fx(v, 4) && Math.abs((T.atan(o.p) / o.q) % 0.1 - 0.05) > 0.01; }); },
        parts: [
          { id: 'e15a', sub: 'a(1)', level: 'BEG', make: function (r, sh) {
            var x = T.atan(sh.p) / sh.q;
            return K.P.near('What did the student’s keystrokes actually compute? (Nearest tenth of a degree.)', x, 1, { unit: '°', before: t('\\tan^{-1}(' + sh.p + ')\\div ' + sh.q + '='), alts: [{ v: T.atan(sh.p / sh.q), code: 'tv-brackets', hint: 'That is the <b>correct</b> angle. Key in exactly what the student did: ' + t('\\tan^{-1}(' + sh.p + ')') + ' first, then divide by ' + t(sh.q) + '.' }] },
              t('\\tan^{-1}(' + sh.p + ')=' + T.atan(sh.p).toFixed(4) + '\\ldots^\\circ') + ', then ' + t(T.atan(sh.p).toFixed(4) + '\\ldots\\div ' + sh.q + '=' + x.toFixed(4) + '\\ldots\\approx ' + fx(x, 1) + '^\\circ') + '.', ['Do exactly what the student did: inverse tangent of ' + t(sh.p) + ', then divide.'], 'student keystrokes ' + sh.p + '/' + sh.q);
          } },
          { id: 'e15a2', sub: 'a(2)', level: 'EMG', make: function (r, sh) {
            return mc(r, 'In words, what did the student divide by ' + t(sh.q) + '?', [
              { html: 'An <b>angle</b>: the ' + t(sh.q) + ' was meant to be the denominator of the ratio going <b>into</b> the inverse key, but it chopped up the angle coming out.', right: true },
              { html: 'The ratio ' + t('\\frac{' + sh.p + '}{' + sh.q + '}') + ', which is correct.', why: 'The ratio was never formed: ' + t('\\tan^{-1}') + ' acted on ' + t(sh.p) + ' alone.' },
              { html: 'The opposite side.', why: t('\\tan^{-1}(' + sh.p + ')') + ' is already an angle (about ' + t(fx(T.atan(sh.p), 1) + '^\\circ') + ') — that is what got divided.' },
              { html: 'The hypotenuse.', why: 'No hypotenuse is involved. ' + t('\\tan^{-1}(' + sh.p + ')') + ' is an angle, and that is what got divided.' }],
              t('\\tan^{-1}(' + sh.p + ')\\approx ' + fx(T.atan(sh.p), 4) + '^\\circ') + ' is an angle, so the student divided an <b>angle</b> by ' + t(sh.q) + '. The ' + t(sh.q) + ' was meant to be the denominator of the ratio going into the inverse key.', ['What kind of thing does ' + t('\\tan^{-1}') + ' give out?'], 'divided an angle');
          } },
          { id: 'e15b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var w = Math.round(T.atan(sh.p) / sh.q);
            return mc(r, 'Which one-line check, from the pattern alone, condemns ' + t('\\theta=' + D(w)) + '?', [
              { html: t('\\frac{' + sh.p + '}{' + sh.q + '}=' + (+(sh.p / sh.q).toFixed(4)) + '>1=\\tan 45^\\circ') + ', and the tangent increases, so ' + t('\\theta>45^\\circ') + ' — but ' + t(D(w) + '<45^\\circ') + '.', right: true },
              { html: t(D(w)) + ' is not a whole number of degrees.', why: 'It is a whole number. The check is about its <b>size</b>: compare the ratio with ' + t('\\tan 45^\\circ') + '.' },
              { html: t('\\frac{' + sh.p + '}{' + sh.q + '}') + ' is more than ' + t('1') + ', so no angle has this tangent.', why: 'The tangent has no ceiling — any positive number is a tangent. Compare with ' + t('\\tan 45^\\circ=1') + ' instead.' },
              { html: 'The answer should be ' + t(sh.p + '\\div ' + sh.q) + ' degrees.', why: 'That is the ratio, not the angle. Compare the ratio with ' + t('\\tan 45^\\circ=1') + '.' }],
              t('\\frac{' + sh.p + '}{' + sh.q + '}=' + (+(sh.p / sh.q).toFixed(4)) + '>1=\\tan 45^\\circ') + ', and the tangent increases across ' + t(D(0)) + ' to ' + t(D(90)) + '. So ' + t('\\theta') + ' must be greater than ' + t(D(45)) + ' — and ' + t(D(w)) + ' is not. Condemned in one line.', ['Compare the ratio with ' + t('\\tan 45^\\circ') + '.'], 'pattern check');
          } },
          { id: 'e15c', sub: 'c', level: 'BEG', make: function (r, sh) {
            var v = sh.p / sh.q, x = T.atan(v);
            return degNear('Key it in correctly. Give the angle to the nearest degree.', x, { alts: angAlts('tan', v).concat([{ v: T.atan(sh.p) / sh.q, code: 'tv-angle-div', hint: 'That is the student’s mistake again. Do the division first (or put brackets around the whole fraction): ' + t('\\tan^{-1}(' + sh.p + '\\div ' + sh.q + ')') + '.' }]), before: t('\\theta=') },
              'Do the division first, then invert: ' + t(sh.p + '\\div ' + sh.q + '=' + (+v.toFixed(5))) + ', then ' + t('\\tan^{-1}(' + (+v.toFixed(5)) + ')=' + x.toFixed(4) + '\\ldots^\\circ\\approx ' + D(Math.round(x))) + '. (Or key it as ' + t('\\tan^{-1}(' + sh.p + '/' + sh.q + ')') + ' — brackets around the whole ratio.) And ' + t(D(Math.round(x)) + '>45^\\circ') + ' ✓', ['Brackets around the whole fraction.'], 'correct tan^-1 ' + sh.p + '/' + sh.q);
          } },
          { id: 'e15d', sub: 'd(1)', level: 'BEG', make: function (r, sh) {
            var n = Math.round(T.atan(sh.p / sh.q));
            var p = valPart('tan', n, 4, { prompt: 'Round-trip your answer: evaluate the tangent of your rounded angle, ' + t(D(n)) + ', to four decimal places.' });
            p.check = nearC(T.tan(n), 4, { alts: ratioAlts('tan', n).concat([{ v: sh.p / sh.q, code: 'tv-trip', hint: 'That is the starting ratio. Take the tangent of the <b>rounded</b> angle ' + t(D(n)) + ' — it won’t come back exactly.' }]), diag: ratioDiag('tan') });
            return p;
          } },
          { id: 'e15d2', sub: 'd(2)', level: 'EMG', make: function (r, sh) {
            var v = sh.p / sh.q, x = T.atan(v), n = Math.round(x);
            return mc(r, t('\\tan ' + D(n) + '\\approx ' + fx(T.tan(n), 4)) + ' does not come back to exactly ' + t('\\frac{' + sh.p + '}{' + sh.q + '}=' + (+v.toFixed(4))) + '. Why is that expected, and not a sign of an error?', [
              { html: 'The true angle is ' + t(x.toFixed(4) + '\\ldots^\\circ') + '; rounding to ' + t(D(n)) + ' changed the angle a little, so its tangent is a little different. A round trip through a rounded angle comes back close, not exact.', right: true },
              { html: 'The calculator loses accuracy on the second step.', why: 'The calculator is accurate. The difference comes from the rounding in the middle.' },
              { html: 'It means the angle should have been ' + t(D(n + (x > n ? 1 : -1))) + '.', why: t(x.toFixed(4) + '\\ldots') + ' really does round to ' + t(n) + '. A small gap is expected.' },
              { html: 'Tangent and inverse tangent only undo each other for whole-number ratios.', why: 'They always undo each other exactly — when nothing is rounded in between.' }],
              'The true angle is ' + t(x.toFixed(4) + '\\ldots^\\circ') + ', and the part after the decimal was thrown away when the answer was rounded. Taking the tangent of ' + t(D(n)) + ' returns the tangent of a slightly different angle. (Indeed ' + t('\\tan(' + x.toFixed(4) + '^\\circ)\\approx ' + (+v.toFixed(4))) + '.) The gap is small and in the direction the rounding predicts, so it confirms the answer.', ['What exactly did you take the tangent of?'], 'why round trip not exact');
          } }] },
      /* ---------- Part F ---------- */
      { num: '16', section: 'Extra practice F — Stretch: ordering ratios before touching a calculator', stem: function (sh) { return 'The five quantities ' + ['\\sin', '\\cos', '\\tan'].map(function (f) { return t(f + ' ' + D(sh.a)); }).concat([t('\\sin ' + D(sh.b)), t('\\tan ' + D(sh.b))]).join(', ') + ' are to be put in order <b>without a calculator</b>.'; },
        shared: function (r) { var a = r.chance(0.35) ? 25 : r.int(10, 29); return { a: a, b: 90 - a }; },
        parts: [
          { id: 'e16a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var a = sh.a, b = sh.b, o = [{ value: 'sa', html: t(TX('sin', a)) }, { value: 'ca', html: t(TX('cos', a)) }, { value: 'ta', html: t(TX('tan', a)) }, { value: 'sb', html: t(TX('sin', b)) }, { value: 'tb', html: t(TX('tan', b)) }];
            return { prompt: 'Two of the five are <b>equal</b>. Select them.', input: { type: 'select', options: o }, key: ['ca', 'sb'], answer: t(TX('cos', a) + '=' + TX('sin', b)), text: 'equal pair ' + a,
              check: K.selectSet(['ca', 'sb'], function (extra, missing) { return { code: 'tv-pair', hint: extra.indexOf('sa') >= 0 && missing.length ? 'Use the cofunction rule: ' + t('\\sin\\theta=\\cos(90^\\circ-\\theta)') + '. Which angle adds to ' + t(D(a)) + ' to make ' + t(D(90)) + '?' : 'Select exactly two: a sine and a cosine of complementary angles.' }; }),
              solution: t(a + '+' + b + '=90') + ', so the angles are complementary and ' + t('\\sin\\theta=\\cos(90^\\circ-\\theta)') + ' gives ' + t(TX('sin', b) + '=' + TX('cos', a)) + '.', hints: ['Look for a sine and a cosine of complementary angles.'], bad: [['sa', 'sb'], ['ca']] };
          } },
          { id: 'e16b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var a = sh.a, b = sh.b;
            return mc(r, 'Why is ' + t(TX('tan', b)) + ' the largest of the five?', [
              { html: t(D(b) + '>45^\\circ') + ', so ' + t(TX('tan', b) + '>\\tan 45^\\circ=1') + '. The other four are less than ' + t('1') + ': three are sines or cosines, and ' + t(TX('tan', a) + '<1') + ' since ' + t(D(a) + '<45^\\circ') + '.', right: true },
              { html: 'Because ' + t(D(b)) + ' is the largest angle, and every ratio grows with the angle.', why: 'Not every ratio grows: the cosine shrinks. And ' + t(TX('sin', b)) + ' has the same angle — the reason must use ' + t('\\tan 45^\\circ=1') + ' and the ceiling of ' + t('1') + '.' },
              { html: 'Because the tangent is always larger than the sine and cosine of any angle.', why: t(TX('tan', a)) + ' is smaller than ' + t(TX('cos', a)) + '. Compare with ' + t('\\tan 45^\\circ=1') + ' instead.' },
              { html: 'Because ' + t(TX('tan', b)) + ' is undefined.', why: 'Only ' + t('\\tan 90^\\circ') + ' is undefined. ' + t(TX('tan', b)) + ' is an ordinary number, bigger than ' + t('1') + '.' }],
              t(D(b) + '>45^\\circ') + ', so ' + t(TX('tan', b) + '>\\tan 45^\\circ=1') + '. The other four are all less than ' + t('1') + ': three are sines or cosines (ceiling of ' + t('1') + '), and ' + t(TX('tan', a) + '<\\tan 45^\\circ=1') + ' since ' + t(D(a) + '<45^\\circ') + '.', ['Compare each quantity with ' + t('1') + '.'], 'tan b largest');
          } },
          { id: 'e16c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var a = sh.a;
            return mc(r, 'Why is ' + t(TX('tan', a) + '>' + TX('sin', a)) + '? (Both are fractions with the same numerator.)', [
              { html: t(TX('sin', a) + '=\\frac{\\text{opp}}{\\text{hyp}}') + ' and ' + t(TX('tan', a) + '=\\frac{\\text{opp}}{\\text{adj}}') + ': same top, but the hypotenuse is longer than the adjacent side, and a bigger denominator makes a smaller fraction.', right: true },
              { html: 'Same top; the adjacent side is longer than the hypotenuse, so the tangent is bigger.', why: 'The hypotenuse is the longest side. The tangent is bigger because its denominator (adj) is <b>smaller</b>.' },
              { html: 'The tangent is the sine plus the cosine.', why: 'No: ' + t('\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}') + '. Compare the denominators of the two fractions.' },
              { html: 'Because ' + t(D(a)) + ' is below ' + t(D(45)) + '.', why: 'This is true for <b>every</b> acute angle. Compare the denominators of the two fractions.' }],
              t(TX('sin', a) + '=\\frac{\\text{opp}}{\\text{hyp}}') + ' and ' + t(TX('tan', a) + '=\\frac{\\text{opp}}{\\text{adj}}') + '. Same numerator, different denominator. The hypotenuse is longer than the adjacent side, so the sine has the bigger denominator, and a bigger denominator makes a smaller fraction: ' + t(TX('tan', a) + '>' + TX('sin', a)) + '. (This holds for every acute angle.)', ['Write both with opp, adj, hyp. Which denominator is bigger?'], 'tan > sin');
          } },
          { id: 'e16d', sub: 'd', level: 'PRG', make: function (r, sh) {
            var a = sh.a;
            return mc(r, 'Why is ' + t(TX('tan', a) + '<' + TX('cos', a)) + '? (' + t(TX('tan', a) + '=\\frac{' + TX('sin', a) + '}{' + TX('cos', a) + '}') + '.)', [
              { html: 'Top: ' + t(TX('sin', a) + '<\\sin 30^\\circ=0.5') + '. Bottom: ' + t(TX('cos', a) + '>\\cos 45^\\circ\\approx 0.7071') + '. So ' + t(TX('tan', a) + '<\\frac{0.5}{0.7071}\\approx 0.7071<' + TX('cos', a)) + '.', right: true },
              { html: 'The tangent is always less than the cosine.', why: 'Not above ' + t(D(45)) + ': ' + t('\\tan 60^\\circ\\approx 1.73>\\cos 60^\\circ=0.5') + '. Bound the top and the bottom of the fraction.' },
              { html: 'Top: ' + t(TX('sin', a) + '<0.5') + '. Bottom: ' + t(TX('cos', a) + '<0.7071') + '. So the fraction is less than ' + t('0.7071') + '.', why: 'Cosine <b>decreases</b>: since ' + t(D(a) + '<45^\\circ') + ', ' + t(TX('cos', a)) + ' is <b>greater</b> than ' + t('\\cos 45^\\circ') + '. A smaller bottom would not give the bound anyway.' },
              { html: 'Because ' + t(TX('tan', a)) + ' is less than ' + t('1') + '.', why: 'The cosine is also less than ' + t('1') + ' — that alone doesn’t compare them. Bound the top and the bottom.' }],
              t(TX('tan', a) + '=\\frac{' + TX('sin', a) + '}{' + TX('cos', a) + '}') + '. Top: ' + t(D(a) + '<30^\\circ') + ' and sine increases, so ' + t(TX('sin', a) + '<\\sin 30^\\circ=0.5') + '. Bottom: ' + t(D(a) + '<45^\\circ') + ' and cosine decreases, so ' + t(TX('cos', a) + '>\\cos 45^\\circ\\approx 0.7071') + '. A smaller top over a larger bottom: ' + t(TX('tan', a) + '<\\frac{0.5}{0.7071}\\approx 0.7071') + '. But ' + t(TX('cos', a) + '>0.7071') + ' as well, so ' + t(TX('tan', a) + '<0.7071<' + TX('cos', a)) + '.', ['Make the top as big as it could be and the bottom as small as it could be.'], 'tan < cos by bounds');
          } },
          { id: 'e16e', sub: 'e', level: 'PRG', make: function (r, sh) {
            var a = sh.a, b = sh.b, items = [{ id: 'sa', tex: TX('sin', a) }, { id: 'ta', tex: TX('tan', a) }, { id: 'ca', tex: TX('cos', a) }, { id: 'sb', tex: TX('sin', b) }, { id: 'tb', tex: TX('tan', b) }];
            var p = B.order(r, 'Put the five in order from smallest to largest. (The two equal ones may go in either order.)', items, {},
              t(TX('sin', a) + '<' + TX('tan', a) + '<' + TX('cos', a) + '=' + TX('sin', b) + '<' + TX('tan', b)) + ' (' + t(fx(T.sin(a), 4) + '<' + fx(T.tan(a), 4) + '<' + fx(T.cos(a), 4) + '=' + fx(T.sin(b), 4) + '<' + fx(T.tan(b), 4)) + ').',
              ['Use parts (a)–(d): the equal pair, the largest, and the two comparisons with ' + t(TX('tan', a)) + '.'], 'order five ratios ' + a);
            var base = p.check, ord = ['sa', 'ta', 'ca', 'sb', 'tb'], why = { 'sa|ta': 'Same numerator (opp), but the sine divides by the longer hypotenuse.', 'ta|ca': 'Bound it: ' + t(TX('tan', a) + '<\\frac{0.5}{0.7071}<' + TX('cos', a)) + '.', 'sb|tb': t(TX('tan', b) + '>1') + ' while every sine is less than ' + t('1') + '.' };
            p.check = function (resp) {
              if (!resp || resp.length < 5) return base(resp);
              var s = resp.slice(); var i = s.indexOf('ca'), j = s.indexOf('sb'); if (Math.abs(i - j) === 1) { s[Math.min(i, j)] = 'ca'; s[Math.max(i, j)] = 'sb'; }
              for (var k = 0; k < 5; k++) if (s[k] !== ord[k]) break;
              if (k === 5) return ok();
              if (Math.abs(i - j) !== 1) return wrong('tv-tie', t(TX('cos', a)) + ' and ' + t(TX('sin', b)) + ' are <b>equal</b>, so they must sit side by side.');
              for (k = 0; k + 1 < 5; k++) { var x = s[k], y = s[k + 1]; if (ord.indexOf(x) > ord.indexOf(y)) { var key = [y, x].join('|'); return wrong('order', why[key] || t(items.filter(function (q) { return q.id === x; })[0].tex) + ' and ' + t(items.filter(function (q) { return q.id === y; })[0].tex) + ' are in the wrong order.'); } }
              return wrong('order', null);
            };
            p.good = [['sa', 'ta', 'sb', 'ca', 'tb']]; p.bad = [['ta', 'sa', 'ca', 'sb', 'tb'], ['sa', 'ca', 'ta', 'sb', 'tb']];
            return p;
          } },
          { id: 'e16f', sub: 'f', level: 'BEG', make: function (r, sh) {
            var a = sh.a, b = sh.b;
            return boxes('<b>Now</b> evaluate all five to four decimal places and confirm the ordering.', [vBox('sin', a, 4), vBox('tan', a, 4), vBox('cos', a, 4), vBox('sin', b, 4), vBox('tan', b, 4)],
              t(fx(T.sin(a), 4) + '<' + fx(T.tan(a), 4) + '<' + fx(T.cos(a), 4) + '=' + fx(T.sin(b), 4) + '<' + fx(T.tan(b), 4)) + ' ✓ — including the exact tie between ' + t(TX('cos', a)) + ' and ' + t(TX('sin', b)) + '.', ['Degree mode; four decimal places.'], 'five values ' + a);
          } }] },
      { num: '17', stem: function (sh) { return '<b>The crossover.</b> In the table for ' + sh.S.map(function (a) { return t(D(a)); }).join(', ') + ', the cosine starts out ahead of the sine and ends up behind it.' + rowTable(['sin', 'cos'], sh.S); },
        shared: function (r) { return { S: r.chance(0.4) ? SETS[0] : r.pick(SETS) }; },
        parts: [
          { id: 'e17a', sub: 'a(i)', level: 'BEG', make: function (r, sh) {
            var A = sh.S.filter(function (a) { return a > 0 && a < 90; }), want = A.filter(function (a) { return a > 45; });
            return { prompt: 'For which of the acute table angles is ' + t('\\sin\\theta>\\cos\\theta') + '? Select every one.', input: { type: 'select', options: A.map(function (a) { return { value: a, html: t(D(a)) }; }) }, key: want, answer: want.map(function (a) { return t(D(a)); }).join(', '), text: 'sin > cos angles',
              check: K.selectSet(want, function (extra) { return { code: 'value', hint: extra.indexOf(45) >= 0 ? 'At ' + t(D(45)) + ' they are <b>equal</b> (both ' + t('0.7071') + '), not greater.' : extra.length ? 'Compare the two rows at ' + t(D(extra[0])) + ': ' + t('\\sin ' + D(extra[0]) + '\\approx ' + fx(T.sin(extra[0]), 4)) + ', ' + t('\\cos ' + D(extra[0]) + '\\approx ' + fx(T.cos(extra[0]), 4)) + '.' : 'You missed one. Compare the two rows column by column.' }; }),
              solution: want.map(function (a) { return t('\\sin ' + D(a) + '\\approx ' + fx(T.sin(a), 4) + '>\\cos ' + D(a) + '\\approx ' + fx(T.cos(a), 4)); }).join(', ') + '. At ' + t(D(45)) + ' the rows are equal, and below ' + t(D(45)) + ' the cosine is still ahead.', hints: ['Compare the two rows column by column.'], bad: [want.concat([45]), want.slice(1)] };
          } },
          { id: 'e17a2', sub: 'a(ii)', level: 'LIM', make: function (r) { return degNum('Where do the two rows cross (where are they equal)?', 45, function (v) { return v === 0.7071 || v === 0.71 ? { code: 'tv-gave-ratio', hint: 'That is the value where they are equal. Give the <b>angle</b>.' } : null; }, 'At ' + t(D(45)) + ' the two rows are equal, both ' + t('\\approx 0.7071') + ': that is the crossover.', ['Find the column where the sine and cosine values match.'], 'crossover angle', t('\\theta=')); } },
          { id: 'e17b', sub: 'b', level: 'PRG', make: function (r) {
            return mc(r, 'Which argument proves the crossover is at <b>exactly</b> ' + t(D(45)) + '?', [
              { html: 'Replace ' + t('\\cos\\theta') + ' by ' + t('\\sin(90^\\circ-\\theta)') + ': ' + t('\\sin\\theta>\\sin(90^\\circ-\\theta)') + '. Sine increases, so ' + t('\\theta>90^\\circ-\\theta') + ', i.e. ' + t('\\theta>45^\\circ') + '.', right: true },
              { html: 'The table shows the rows are equal at ' + t(D(45)) + ', so that is the crossover.', why: 'The table only shows a few angles. A proof must work for <b>every</b> angle — use the cofunction rule.' },
              { html: t('\\sin\\theta>\\cos\\theta') + ' means ' + t('\\theta>90^\\circ-\\theta') + ' because cosine increases.', why: 'Cosine <b>decreases</b>. Rewrite the cosine as a sine first, then use the fact that sine increases.' },
              { html: t('\\sin 45^\\circ=\\cos 45^\\circ\\approx 0.7071') + ' on the calculator.', why: 'That checks one angle; it doesn’t show the sine is ahead for <b>every</b> angle above ' + t(D(45)) + ' and behind below it.' }],
              'Start from ' + t('\\sin\\theta>\\cos\\theta') + ' and replace ' + t('\\cos\\theta') + ' using ' + t('\\cos\\theta=\\sin(90^\\circ-\\theta)') + ': ' + t('\\sin\\theta>\\sin(90^\\circ-\\theta)') + '. Sine increases across ' + t(D(0)) + ' to ' + t(D(90)) + ', so the bigger sine belongs to the bigger angle: ' + t('\\theta>90^\\circ-\\theta\\Rightarrow 2\\theta>90^\\circ\\Rightarrow\\theta>45^\\circ') + '. So the sine is ahead exactly when ' + t('\\theta>45^\\circ') + ', and the crossover is at exactly ' + t(D(45)) + '.', ['Write the cosine as a sine of another angle, then compare angles.'], 'crossover proof');
          } },
          { id: 'e17c', sub: 'c', level: 'BEG', make: function (r) { return sinCos(r, r.chance(0.3) ? 38 : r.int(20, 42)); } },
          { id: 'e17d', sub: 'd', level: 'BEG', make: function (r) { return sinCos(r, r.chance(0.3) ? 61 : r.int(48, 70)); } },
          { id: 'e17e', sub: 'e', level: 'EMG', make: function (r) {
            return mc(r, 'When is ' + t('\\tan\\theta>1') + ', and why?', [
              { html: 'Exactly when ' + t('\\theta>45^\\circ') + ': ' + t('\\frac{\\text{opp}}{\\text{adj}}>1') + ' means opp ' + t('>') + ' adj, which happens once the angle opens past ' + t(D(45)) + '.', right: true },
              { html: 'Exactly when ' + t('\\theta<45^\\circ') + ': the adjacent side is longer then.', why: 'When the adjacent side (the bottom) is longer, the fraction is <b>less</b> than ' + t('1') + '.' },
              { html: 'Never: a trig ratio can’t be more than ' + t('1') + '.', why: 'That is true of sine and cosine only. ' + t('\\tan 60^\\circ\\approx 1.7321') + '.' },
              { html: 'Exactly when ' + t('\\theta>60^\\circ') + ', where ' + t('\\tan\\theta>\\sqrt{3}') + '.', why: t('\\tan 50^\\circ\\approx 1.19') + ' is already more than ' + t('1') + '. The crossover is where opp ' + t('=') + ' adj.' }],
              t('\\tan\\theta>1') + ' exactly when ' + t('\\theta>45^\\circ') + '. ' + t('\\tan\\theta=\\frac{\\text{opp}}{\\text{adj}}') + ', and a fraction passes ' + t('1') + ' exactly when its numerator beats its denominator. Opening the angle past ' + t(D(45)) + ' lets the opposite side overtake the adjacent one; at ' + t(D(45)) + ' the legs are equal and ' + t('\\tan 45^\\circ=1') + '.', ['When is a fraction bigger than ' + t('1') + '?'], 'tan > 1 rule');
          } }] },
      { num: '18', stem: 'Two exam-style items, both answerable without a calculator.', parts: [
        { id: 'e18a', sub: 'a', level: 'PRG', make: function (r) {
          var v1 = r.pick([1.4, 1.2, 1.6]), v2 = r.pick([1.4, 0.4, 3.2]), x = r.int(20, 70), y = x + r.pick([2, 3, 5]), f1 = r.pick(['cos', 'sin']);
          var pool = [
            { tex: '\\text{There is an acute angle }\\theta\\text{ with }\\' + f1 + '\\theta=' + v1, truth: false, sol: t('\\' + f1 + '\\theta') + ' is a leg over the hypotenuse, always less than ' + t('1') + '.' },
            { tex: '\\text{There is an acute angle }\\theta\\text{ with }\\tan\\theta=' + v2, truth: true, sol: 'The tangent has no ceiling and takes every positive value; ' + t(TXI('tan', v2) + '\\approx ' + T.atan(v2).toFixed(1) + '^\\circ') + '.' },
            { tex: '\\sin ' + D(y) + '>\\sin ' + D(x), truth: true, sol: 'Sine increases with the angle, and ' + t(y + '>' + x) + '.' },
            { tex: '\\cos ' + D(y) + '>\\cos ' + D(x), truth: false, sol: 'Cosine <b>decreases</b> as the angle increases, so ' + t('\\cos ' + D(y) + '<\\cos ' + D(x)) + '.' },
            { tex: '\\tan ' + D(x) + '>\\tan ' + D(y), truth: false, sol: 'Tangent increases with the angle, so ' + t('\\tan ' + D(x) + '<\\tan ' + D(y)) + '.' },
            { tex: '\\sin ' + D(x) + '=\\cos ' + D(90 - x), truth: true, sol: 'The angles are complementary: ' + t(x + '+' + (90 - x) + '=90') + '.' }];
          if (r.chance(0.3)) { pool = [pool[0], pool[1], { tex: '\\sin 41^\\circ>\\sin 39^\\circ', truth: true, sol: 'Sine increases with the angle, and ' + t('41>39') + '.' }]; pool[0].tex = '\\text{There is an acute angle }\\theta\\text{ with }\\cos\\theta=1.4'; pool[1].tex = '\\text{There is an acute angle }\\theta\\text{ with }\\tan\\theta=1.4'; pool[1].sol = 'The tangent has no ceiling; ' + t('\\tan^{-1}(1.4)\\approx 54.5^\\circ') + '.'; pool[0].sol = t('\\cos\\theta=\\frac{\\text{adj}}{\\text{hyp}}<1') + '.'; }
          return statementMC(r, '<i>(Multiple Choice)</i> Three statements are made about acute angles.', pool, '', ['Use the ceilings (sine and cosine below ' + t('1') + ', tangent unlimited) and the directions (sine and tangent increase, cosine decreases).'], 'three statements');
        } },
        { id: 'e18b', sub: 'b', level: 'EMG', make: function (r) {
          var a = r.chance(0.3) ? 63 : r.int(20, 85), b = r.chance(0.3) ? 70 : r.pick(range(15, 80).filter(function (v) { return v !== 45; })), ans = a + 90 - b; // b = 45 would let a + b pass
          return B.nr('<i>(Numerical Response)</i> To the nearest degree, the value of ' + t('\\tan^{-1}\\!\\left(\\tan ' + D(a) + '\\right)+\\sin^{-1}\\!\\left(\\cos ' + D(b) + '\\right)') + ' is ________ degrees.', ans, function (v) {
            if (v === a + b) return { code: 'tv-sum', hint: t('\\sin^{-1}(\\cos ' + D(b) + ')') + ' is not ' + t(D(b)) + ': the inverse <b>sine</b> undoes a sine, not a cosine. Rewrite ' + t('\\cos ' + D(b)) + ' as the sine of another angle first.' };
            if (v === a + 180 - b) return { code: 'tv-cof-180', hint: 'Use ' + t('\\cos\\theta=\\sin(90^\\circ-\\theta)') + ': complementary angles add to ' + t('90') + '.' };
            if (v === a - b + 90 - 2 * (90 - b) || v === a - (90 - b)) return { code: 'sign', hint: 'Add the two angles.' };
            return null;
          }, t('\\tan^{-1}(\\tan ' + D(a) + ')=' + D(a)) + ' — the inverse tangent undoes the tangent. ' + t('\\cos ' + D(b) + '=\\sin ' + D(90 - b)) + ' by the cofunction rule, so ' + t('\\sin^{-1}(\\cos ' + D(b) + ')=\\sin^{-1}(\\sin ' + D(90 - b) + ')=' + D(90 - b)) + '. Total: ' + t(a + '+' + (90 - b) + '=' + ans) + '.' + (ans < 100 ? ' (Record ' + t('0' + ans) + ' if your answer sheet needs three digits.)' : ''),
          ['The inverse key undoes its own ratio. For the second term, write the cosine as a sine first.'], 'NR inverse of ratio ' + a + ', ' + b);
        } }] }
    ];
  }
})(window);
