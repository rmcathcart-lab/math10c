/* Math 10C · Unit 9 · Lesson 4 — Finding the Measure of an Angle in a Right Triangle (M4)
 * Assignment questions 1–16 (u9_L04.tex) and the Lesson 4 Extra Practice (u9_EP04.tex, questions 1–21).
 * Every part is a generator: the booklet's numbers are one possible version; triangles are redrawn in a random
 * orientation (HW.tri rot/flip) with varied letters. Rounded angles use K.P.near with targeted alternatives: the wrong
 * inverse ratio, the other acute angle, the ratio upside down, radian mode, 1/sin read for sin⁻¹, rounding too early. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, t = K.t, TR = HW.trig;
  var FN = { sin: '\\sin', cos: '\\cos', tan: '\\tan' };
  var NAMESETS = [['A', 'B', 'C'], ['P', 'Q', 'R'], ['X', 'Y', 'Z'], ['D', 'E', 'F'], ['L', 'M', 'N'], ['J', 'K', 'L'], ['S', 'T', 'U'], ['G', 'H', 'K']];

  HW.addCodes({
    'wrong-ratio': 'Used the wrong inverse ratio (sides misnamed)', 'other-angle': 'Found the other acute angle', 'ratio-flip': 'Trig ratio upside down',
    radian: 'Calculator in radian mode', reciprocal: 'Read sin⁻¹ as 1 ÷ sin', forward: 'Used sin/cos/tan instead of the inverse',
    'early-round': 'Rounded an intermediate value too early', 'half-angle': 'Gave the half-angle (forgot to double)', 'full-base': 'Used the whole base instead of half',
    'base-angle': 'Gave a base angle instead of the apex angle', 'part-angle': 'Found only part of the angle', 'whole-base': 'Used the whole side instead of the difference',
    'grade-angle': 'Took the % grade as the angle', 'tan-hyp': 'Used tan with the hypotenuse', 'used-sin': 'Used sin with a horizontal run',
    complement: 'Gave the complement (90° − angle)', supplement: 'Gave the supplement (180° − angle)', 'pyth-add': 'Added squares instead of subtracting (Pythagoras)',
    'pyth-sub': 'Subtracted the sides, not their squares', 'no-root': 'Forgot the square root', 'wrong-triangle': 'Used the wrong triangle',
    'from-horizontal': 'Measured from the horizontal instead of the vertical', 'other-T': 'Gave the other angle at the diagonals’ intersection',
    'round-direction': 'Rounded the wrong way for a limit', 'not-rounded': 'Didn’t round the side first (as asked)', 'student-error': 'Repeated the student’s error',
    'smaller-angle': 'Gave the smaller acute angle', 'sum-not-product': 'Added instead of multiplied', 'face-angle': 'Used the face-diagonal angle', 'inverse-used': 'Used an inverse ratio when the angle is known',
    'ratio-sin': 'Chose sin⁻¹', 'ratio-cos': 'Chose cos⁻¹', 'ratio-tan': 'Chose tan⁻¹'
  });

  /* ---------- small helpers ---------- */
  function inv(f, v) { return f === 'sin' ? TR.asin(v) : f === 'cos' ? TR.acos(v) : TR.atan(v); }
  function radInv(f, v) { return f === 'sin' ? Math.asin(v) : f === 'cos' ? Math.acos(v) : Math.atan(v); }
  function rd(x, dp) { return K.roundTo(x, dp); }
  function fx(x, dp) { return rd(x, dp).toFixed(dp); }
  function safe(x, dp, m) { var s = x * Math.pow(10, dp), f = s - Math.floor(s); return Math.abs(f - 0.5) > (m == null ? 0.04 : m); }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function dec(x) { return String(rd(x, 4)); }
  function deg(x, dp) { return fx(x, dp) + '^{\\circ}'; }
  function v4(x) { return x.toFixed(4); }
  function search(r, gen, ok, n) { for (var i = 0; i < (n || 600); i++) { var c = gen(r); if (c && ok(c)) return c; } throw new Error('u9l4: no candidate'); }
  function sq(x) { return x * x; }
  function frac(n, d) { return '\\frac{' + n + '}{' + d + '}'; }
  function an(n) { var s = String(n); return /^8/.test(s) || /^1[18](\D|$)/.test(s) ? 'an' : 'a'; } // “an 8 m ladder”, “an 11% grade”
  function An(n) { var a = an(n); return a.charAt(0).toUpperCase() + a.slice(1); }

  /* strip a typed degree sign before grading */
  function degWrap(p) {
    var c = p.check;
    p.check = function (resp) { return c(String(resp == null ? '' : resp).replace(/\^\s*\{?\s*\\circ\s*\}?|\\circ|°|\\degree|\s*degrees?/g, '')); };
    return p;
  }
  /* rounded answer with targeted alternatives. o: { unit ('°' default), nr, before } */
  function near(prompt, x, dp, alts, sol, hints, text, o) {
    o = o || {}; var unit = o.unit === undefined ? '°' : o.unit;
    alts = alts.filter(function (a) { return isFinite(a.v) && Math.abs(a.v) < 1e6; });
    var p = K.P.near(prompt, x, dp, { unit: unit, nr: o.nr, alts: alts, before: o.before }, sol, hints, text);
    if (unit === '°') { degWrap(p); p.answer = t(deg(x, dp)); p.good = [fx(x, dp) + '°']; }
    var want = fx(x, dp), seen = {};
    p.bad = alts.map(function (a) { return fx(a.v, dp); }).filter(function (s) { if (s === want || seen[s] || (o.nr && s.length > 4)) return false; seen[s] = 1; return true; });
    return p;
  }

  /* ---------- alternatives for an angle found from a ratio n/d ---------- */
  var KIND = { oh: { f: 'sin', n: 'SOH', a: 'OPPOSITE', b: 'the HYPOTENUSE' }, ah: { f: 'cos', n: 'CAH', a: 'ADJACENT', b: 'the HYPOTENUSE' }, oa: { f: 'tan', n: 'TOA', a: 'OPPOSITE', b: 'ADJACENT' } };
  function std(f) { // calculator slips with the right ratio value v
    return function (v) {
      return [{ v: radInv(f, v), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode. Switch it to <b>degree</b> mode and try again.' },
        { v: 1 / TR[f](v), code: 'reciprocal', hint: t(FN[f] + '^{-1}') + ' means “the angle whose ' + f + ' is …”, not ' + t('\\frac{1}{' + FN[f] + '}') + '. Use the inverse key (2nd&nbsp;' + f + ').' },
        { v: TR[f](v), code: 'forward', hint: 'That is ' + t(FN[f] + '(' + dec(v) + ')') + ' — a ratio, not an angle. Run it backward with ' + t(FN[f] + '^{-1}') + ' (2nd&nbsp;' + f + ').' }];
    };
  }
  function sideAlts(kind, n, d, angTex, nS, dS, dp) {
    var f = KIND[kind].f, v = n / d, c = inv(f, v), A = [];
    if (kind === 'oa') {
      A.push({ v: TR.atan(d / n), code: 'ratio-flip', hint: 'Your ratio is upside down, which gives the <b>other</b> acute angle. ' + t('\\tan=\\frac{\\text{opp}}{\\text{adj}}') + ': from ' + t(angTex) + ', which known side is <b>across</b> from the angle?' });
      ['sin', 'cos'].forEach(function (g) { [v, 1 / v].forEach(function (q) { if (q < 1) A.push({ v: inv(g, q), code: 'wrong-ratio', hint: t(FN[g] + '^{-1}') + ' needs the <b>hypotenuse</b>, but neither ' + t(nS) + ' nor ' + t(dS) + ' faces the right angle — they are the two legs. Two legs means TOA.' }); }); });
    } else {
      var g = f === 'sin' ? 'cos' : 'sin';
      A.push({ v: inv(g, v), code: 'wrong-ratio', hint: 'That is the <b>other</b> acute angle: you used ' + t(FN[g] + '^{-1}') + '. From ' + t(angTex) + ', is ' + t(nS) + ' opposite (across from the angle) or adjacent (touching it)?' });
      A.push({ v: TR.atan(v), code: 'tan-hyp', hint: t('\\tan^{-1}') + ' pairs the two legs, but ' + t(dS) + ' is the <b>hypotenuse</b> (it faces the right angle). Opposite or adjacent with the hypotenuse is SOH or CAH.' });
    }
    A = A.concat(std(f)(v));
    if (dp >= 1) A.push({ v: inv(f, rd(v, 2)), code: 'early-round', hint: 'Close, but you rounded the ratio before using ' + t(FN[f] + '^{-1}') + '. Keep every digit of ' + t(nS + '\\div ' + dS) + ' (or type the fraction straight in).' });
    A.push({ v: 90 - c, code: 'other-angle', hint: 'That is the other acute angle of the triangle. Name the sides from the angle you were asked for.' });
    return A;
  }
  function sideSol(kind, n, d, nS, dS, arg, ang, x, dp, pre) {
    var k = KIND[kind], f = k.f, v = n / d;
    return (pre || '') + 'From ' + t(ang) + ': ' + t(nS) + ' is ' + k.a + ', ' + t(dS) + ' is ' + k.b + ' ' + t('\\Rightarrow') + ' <b>' + k.n + '</b>.<br>' +
      t(FN[f] + ' ' + arg + '=' + frac(nS, dS) + '=' + v4(v)) + '<br>' + t(ang + '=' + FN[f] + '^{-1}(' + v4(v) + ')=' + x.toFixed(dp + 2) + '^{\\circ}\\approx ' + deg(x, dp));
  }
  var SIDEHINTS = ['Name the two given sides from the angle: opposite (across from it), adjacent (touching it, not the hypotenuse) or hypotenuse (facing the right angle).',
    'Opposite + hypotenuse ' + t('\\to\\sin^{-1}') + ', adjacent + hypotenuse ' + t('\\to\\cos^{-1}') + ', opposite + adjacent ' + t('\\to\\tan^{-1}') + '. Calculator in degree mode.'];

  /* right-triangle figure. o = { opp, adj (shape), lab: {opp, adj, hyp}, ang: label at the angle, nm: [angle vertex, other, right] or null } */
  function triFig(r, o) {
    var w = o.adj, h = o.opp, q = h / w;
    if (q > 2.8) w = h / 2.8; if (q < 1 / 2.8) h = w / 2.8;
    var ang = {}; if (o.ang) ang.A = o.ang;
    return HW.tri({ w: w, h: h, names: o.nm || ['A', 'B', 'C'], hideNames: !o.nm, sides: { a: o.lab.opp, b: o.lab.adj, c: o.lab.hyp }, angles: ang, rot: r.int(0, 3), flip: r.chance(0.5), width: o.width || 250 });
  }
  /* angle from two sides of a right triangle. c = { kind, n, d (numbers), unit, dp, ang: [figLabel, tex, arg], nm, prompt, noFig, extraAlts } */
  function sidePart(r, c) {
    var unit = c.unit ? ' ' + c.unit : '', nS = String(c.n), dS = String(c.d), opp, adj, hyp, lab = {};
    if (c.kind === 'oh') { opp = c.n; hyp = c.d; adj = Math.sqrt(hyp * hyp - opp * opp); lab = { opp: nS + unit, hyp: dS + unit }; }
    else if (c.kind === 'ah') { adj = c.n; hyp = c.d; opp = Math.sqrt(hyp * hyp - adj * adj); lab = { adj: nS + unit, hyp: dS + unit }; }
    else { opp = c.n; adj = c.d; lab = { opp: nS + unit, adj: dS + unit }; }
    var x = inv(KIND[c.kind].f, c.n / c.d), dp = c.dp || 0;
    var fig = c.noFig ? '' : triFig(r, { opp: opp, adj: adj, lab: lab, ang: c.ang[0], nm: c.nm });
    var alts = (c.extraAlts || []).concat(sideAlts(c.kind, c.n, c.d, c.ang[1], nS, dS, dp));
    return near((c.prompt || '') + fig, x, dp, alts, sideSol(c.kind, c.n, c.d, nS, dS, c.ang[2], c.ang[1], x, dp), SIDEHINTS, 'angle ' + c.kind + ' ' + nS + '/' + dS, { before: t(c.ang[1] + '='), nr: c.nr });
  }
  function angLab(r) { var L = r.pick(['x', 'a', 'b', 'c', 'y', 'θ']); return L === 'θ' ? ['θ', '\\theta', '\\theta'] : [L + '°', L + '^{\\circ}', L + '^{\\circ}']; }
  function vtxLab(L) { return [L, '\\angle ' + L, L]; }
  /* integer sides n/d giving a fair angle */
  function intPair(r, kind, lo, hi, dp, maxD) {
    return search(r, function (r) {
      var n = r.int(lo, hi), d = kind === 'oa' ? r.int(lo, hi) : r.int(n + 3, maxD);
      return { n: n, d: d };
    }, function (c) { if (c.n === c.d) return false; var x = inv(KIND[kind].f, c.n / c.d); return x > 12 && x < 78 && Math.abs(x - 45) > 1.2 && safe(x, dp); });
  }
  function decPair(r, kind, dp) {
    return search(r, function (r) { var n = r.int(15, 99) / 10, d = kind === 'oa' ? r.int(15, 99) / 10 : r.int(Math.round(n * 10) + 5, 120) / 10; return { n: n, d: d }; },
      function (c) { if (c.n === c.d) return false; var x = inv(KIND[kind].f, c.n / c.d); return x > 12 && x < 78 && Math.abs(x - 45) > 1.2 && safe(x, dp); });
  }

  /* ---------- an inverse ratio from a value ---------- */
  function valAlts(f, v) {
    var A = [];
    ['sin', 'cos', 'tan'].forEach(function (g) { if (g !== f && (g === 'tan' || v <= 1)) A.push({ v: inv(g, v), code: 'wrong-ratio', hint: 'You used ' + t(FN[g] + '^{-1}') + ', but the equation gives the <b>' + (f === 'sin' ? 'sine' : f === 'cos' ? 'cosine' : 'tangent') + '</b> of the angle. Use ' + t(FN[f] + '^{-1}') + '.' }); });
    return A.concat(std(f)(v));
  }
  function varLab(r, kind) {
    if (kind === 'deg') { var L = r.pick(['a', 'b', 's', 'x', 'y', 'θ']); return L === 'θ' ? { arg: '\\theta', ans: '\\theta' } : { arg: L + '^{\\circ}', ans: L + '^{\\circ}' }; }
    var M = r.pick(['A', 'C', 'P', 'X', 'M', 'R', 'B', 'K']); return { arg: M, ans: '\\angle ' + M };
  }
  function valPart(r, f, kind, vTex, v, dp, extra) {
    var L = varLab(r, kind), x = inv(f, v);
    var sol = t(L.ans + '=' + FN[f] + '^{-1}\\left(' + vTex + '\\right)' + (/frac|sqrt/.test(vTex) ? '=' + FN[f] + '^{-1}(' + v4(v) + ')' : '') + '=' + x.toFixed(dp + 2) + '^{\\circ}\\approx ' + deg(x, dp)) +
      '<br>Use ' + t(FN[f] + '^{-1}') + ' (2nd&nbsp;' + f + ') in <b>degree</b> mode' + (/frac/.test(vTex) ? '; type the fraction in brackets so the whole ratio goes in.' : '.');
    var alts = valAlts(f, v); if (extra) alts = extra.concat(alts);
    if (dp >= 1 && /frac/.test(vTex)) alts.push({ v: inv(f, rd(v, 2)), code: 'early-round', hint: 'Close — but you rounded the fraction first. Put the whole fraction into ' + t(FN[f] + '^{-1}') + '.' });
    return near(t(FN[f] + ' ' + L.arg + '=' + vTex), x, dp, alts, sol, ['If ' + t(FN[f] + '\\theta=k') + ', then ' + t('\\theta=' + FN[f] + '^{-1}(k)') + '. Look for 2nd&nbsp;' + f + ' on your calculator.', 'Check your calculator is in <b>degree</b> mode (DEG).'],
      f + ' ' + L.ans + ' = ' + vTex, { before: t(L.ans + '=') });
  }
  function specPart(r, pool, kind) { var s = r.pick(pool); return valPart(r, s[0], kind, s[1], s[2], 0); }

  /* ---------- multiple choice ---------- */
  function mc(r, prompt, opts, sol, hints, text, keepOrder) { return K.P.mc(r, prompt, opts, sol, hints, text, keepOrder); }
  function whyRatio(ch, right) {
    if (ch === 'tan') return t('\\tan^{-1}') + ' pairs the two legs (opposite and adjacent), but one of the known sides is the <b>hypotenuse</b> — it faces the right angle.';
    if (right === 'tan') return t(FN[ch] + '^{-1}') + ' needs the hypotenuse as one of the two <b>known</b> sides. Both known sides here are legs (a hypotenuse that is drawn but not given doesn’t count).';
    if (ch === 'sin') return 'The known leg <b>touches</b> the angle, so it is ADJACENT, not opposite.';
    return 'The known leg is <b>across</b> from the angle, so it is OPPOSITE, not adjacent.';
  }
  function ratioMC(r, prompt, right, sol, text) {
    var opts = ['sin', 'cos', 'tan'].map(function (f) { return { html: t(FN[f] + '^{-1}'), right: f === right, why: f === right ? null : whyRatio(f, right), code: 'ratio-' + f }; });
    var p = mc(r, prompt, opts, sol, ['Name the two <b>known</b> sides relative to the angle: opposite, adjacent or hypotenuse. Then match SOH, CAH or TOA.'], text, true);
    p.tries = 1; return p;
  }

  /* ---------- figures for the special questions ---------- */
  function mirror(pts, on, cx) { if (!on) return pts; var o = {}; Object.keys(pts).forEach(function (k) { o[k] = [2 * cx - pts[k][0], pts[k][1]]; }); return o; }
  function flipY(pts, on) { if (!on) return pts; var o = {}; Object.keys(pts).forEach(function (k) { o[k] = [pts[k][0], -pts[k][1]]; }); return o; }
  function isoFig(r, L, b, unit, alt) { // isosceles BAC; alt = height for the altitude version
    var hgt = alt || Math.sqrt(L * L - b * b / 4), up = r.chance(0.5);
    var pts = flipY({ B: [-b / 2, 0], C: [b / 2, 0], A: [0, -hgt], M: [0, 0] }, up);
    if (!alt) { delete pts.M; return HW.fig({ pts: pts, segs: [['B', 'C', b + ' ' + unit], ['A', 'B', L + ' ' + unit], ['A', 'C', L + ' ' + unit]], width: 260, names: { A: 'A', B: 'B', C: 'C' } }); }
    return HW.fig({ pts: pts, segs: [['B', 'C', b + ' ' + unit], ['A', 'B'], ['A', 'C'], ['A', 'M']], right: [['M', 'C', 'A']], width: 280, names: { A: 'A', B: 'B', C: 'C' }, extra: [{ type: 'text', at: [b * 0.13, (up ? 1 : -1) * hgt * 0.3], text: alt + ' ' + unit }] });
  }

  /* ---------- triples ---------- */
  var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41], [28, 45, 53], [11, 60, 61], [16, 63, 65], [33, 56, 65], [48, 55, 73], [13, 84, 85], [36, 77, 85], [39, 80, 89], [65, 72, 97], [10, 24, 26], [15, 36, 39], [24, 45, 51], [20, 48, 52], [16, 30, 34], [21, 72, 75], [24, 70, 74]];
  var SHARED_LEG = { 12: [[5, 13], [9, 15], [16, 20], [35, 37]], 15: [[8, 17], [20, 25], [36, 39]], 16: [[12, 20], [30, 34], [63, 65]], 20: [[15, 25], [21, 29], [48, 52]], 21: [[20, 29], [28, 35], [72, 75]],
    24: [[7, 25], [10, 26], [18, 30], [32, 40], [45, 51], [70, 74]], 35: [[12, 37], [84, 91]], 36: [[15, 39], [27, 45], [48, 60], [77, 85]], 40: [[9, 41], [30, 50], [42, 58], [75, 85]] };
  var BORDER = [[250, 21], [470, 39.5], [500, 42], [720, 60.5], [750, 63], [780, 65.5]]; // run, rise: angle just over 4.8°
  var TAN48 = TR.tan(4.8);

  HW.defineLesson({
    id: 'u9l4', unit: 9, num: '4', title: 'Finding the Measure of an Angle in a Right Triangle', outcome: 'M4',
    blurb: 'Run SOH CAH TOA backward: name the two known sides, choose the ratio, and recover the angle with sin⁻¹, cos⁻¹ or tan⁻¹ — then use it for elevation, depression, isosceles triangles and two-triangle diagrams.',
    questions: [
      { num: '1', section: 'Part A — Inverse trigonometric ratios', stem: 'Use a calculator to determine the measure of the acute angle to the <b>nearest degree</b>.', parts: [
        { id: '1a', level: 'BEG', make: function (r) { var d = search(r, function (r) { return r.int(20, 80); }, function (d) { return Math.abs(d - 45) > 2; }); return valPart(r, 'sin', 'deg', TR.sin(d).toFixed(4), Number(TR.sin(d).toFixed(4)), 0); } },
        { id: '1b', level: 'BEG', make: function (r) { var d = search(r, function (r) { return r.int(15, 80); }, function (d) { return Math.abs(d - 45) > 2; }); return valPart(r, 'cos', 'deg', TR.cos(d).toFixed(4), Number(TR.cos(d).toFixed(4)), 0); } },
        { id: '1c', level: 'BEG', make: function (r) { var d = search(r, function (r) { return r.int(12, 78); }, function (d) { return Math.abs(d - 45) > 2; }); return valPart(r, 'tan', 'ang', TR.tan(d).toFixed(4), Number(TR.tan(d).toFixed(4)), 0); } },
        { id: '1d', level: 'BEG', make: function (r) {
          var c = search(r, function (r) { var q = r.int(3, 12); return { p: r.int(1, q - 1), q: q }; }, function (c) { var x = TR.asin(c.p / c.q); return gcd(c.p, c.q) === 1 && safe(x, 0) && Math.abs(x - 45) > 2 && x < 80; });
          return valPart(r, 'sin', 'ang', frac(c.p, c.q), c.p / c.q, 0);
        } },
        { id: '1e', level: 'BEG', make: function (r) { return specPart(r, [['sin', '\\frac{\\sqrt{3}}{2}', Math.sqrt(3) / 2], ['cos', '\\frac{\\sqrt{3}}{2}', Math.sqrt(3) / 2]], 'deg'); } },
        { id: '1f', level: 'LIM', make: function (r) { return specPart(r, [['tan', '1', 1]], 'deg'); } },
        { id: '1g', level: 'BEG', make: function (r) { return specPart(r, [['cos', '\\frac{1}{2}', 0.5], ['sin', '\\frac{1}{2}', 0.5]], 'ang'); } },
        { id: '1h', level: 'BEG', make: function (r) { return specPart(r, [['sin', '\\frac{\\sqrt{2}}{2}', Math.SQRT2 / 2], ['cos', '\\frac{\\sqrt{2}}{2}', Math.SQRT2 / 2]], 'ang'); } }] },
      { num: '2', stem: 'Use a calculator to determine the indicated acute angle to the <b>nearest tenth of a degree</b>.', parts: [
        { id: '2a', level: 'BEG', make: function (r) { var k = search(r, function (r) { return r.int(1500, 9500) / 10000; }, function (k) { return safe(TR.asin(k), 1); }); return valPart(r, 'sin', 'ang', k.toFixed(4), k, 1); } },
        { id: '2b', level: 'BEG', make: function (r) { var k = search(r, function (r) { return r.int(1000, 9500) / 10000; }, function (k) { return safe(TR.acos(k), 1); }); return valPart(r, 'cos', 'ang', k.toFixed(4), k, 1); } },
        { id: '2c', level: 'BEG', make: function (r) { var k = search(r, function (r) { return r.int(25, 350) / 100; }, function (k) { return safe(TR.atan(k), 1) && Math.abs(k - 1) > 0.02; }); return valPart(r, 'tan', 'ang', k.toFixed(2), k, 1); } },
        { id: '2d', level: 'BEG', make: function (r) {
          var c = search(r, function (r) { var q = r.int(20, 50); return { p: r.int(3, q - 3), q: q }; }, function (c) { return gcd(c.p, c.q) === 1 && safe(TR.acos(c.p / c.q), 1); });
          return valPart(r, 'cos', 'deg', frac(c.p, c.q), c.p / c.q, 1);
        } },
        { id: '2e', level: 'BEG', make: function (r) { var k = search(r, function (r) { return r.int(6, 40); }, function (k) { return safe(TR.atan(k), 1); }); return valPart(r, 'tan', 'ang', String(k), k, 1); } },
        { id: '2f', level: 'BEG', make: function (r) {
          var c = search(r, function (r) { var q = r.int(5, 13); return { p: r.int(2, q - 1), q: q }; }, function (c) { return gcd(c.p, c.q) === 1 && safe(TR.asin(c.p / c.q), 1) && TR.asin(c.p / c.q) < 80; });
          return valPart(r, 'sin', 'ang', frac(c.p, c.q), c.p / c.q, 1);
        } }] },
      { num: '3', section: 'Part B — An angle from two known sides', stem: 'Calculate the measure of the indicated angle to the <b>nearest degree</b>.', parts: [
        { id: '3a', level: 'BEG', make: function (r) { var c = intPair(r, 'oh', 5, 30, 0, 50); return sidePart(r, { kind: 'oh', n: c.n, d: c.d, dp: 0, ang: angLab(r) }); } },
        { id: '3b', level: 'BEG', make: function (r) { var c = intPair(r, 'ah', 5, 30, 0, 50); return sidePart(r, { kind: 'ah', n: c.n, d: c.d, dp: 0, ang: angLab(r) }); } },
        { id: '3c', level: 'BEG', make: function (r) { var c = intPair(r, 'oa', 5, 40, 0); return sidePart(r, { kind: 'oa', n: c.n, d: c.d, dp: 0, ang: angLab(r) }); } }] },
      { num: '4', stem: 'Calculate the measure of the indicated angle to the <b>nearest tenth of a degree</b>.', parts: [
        { id: '4a', level: 'BEG', make: function (r) { var c = intPair(r, 'oh', 8, 40, 1, 60); return sidePart(r, { kind: 'oh', n: c.n, d: c.d, dp: 1, unit: r.pick(['m', 'cm', 'ft']), ang: angLab(r) }); } },
        { id: '4b', level: 'EMG', make: function (r) { var c = intPair(r, 'ah', 8, 40, 1, 60); return sidePart(r, { kind: 'ah', n: c.n, d: c.d, dp: 1, unit: r.pick(['km', 'm', 'in']), ang: angLab(r) }); } },
        { id: '4c', level: 'EMG', make: function (r) { var c = decPair(r, 'oa', 1); return sidePart(r, { kind: 'oa', n: c.n, d: c.d, dp: 1, unit: r.pick(['yd', 'm', 'cm']), ang: angLab(r) }); } }] },
      { num: '5', stem: 'Calculate the measure of the indicated angle(s) to the <b>nearest degree</b>.',
        shared: function (r) {
          var tr = r.pick(TRIPLES.filter(function (q) { return q[2] >= 13 && Math.abs(TR.atan(q[0] / q[1]) - 45) > 1.5; })), sw = r.chance(0.5);
          return { p: sw ? tr[1] : tr[0], q: sw ? tr[0] : tr[1], c: tr[2], mir: r.chance(0.5), up: r.chance(0.5) };
        },
        parts: [
          { id: '5a', level: 'EMG', make: function (r) { var c = intPair(r, 'ah', 5, 30, 0, 50); var p = sidePart(r, { kind: 'ah', n: c.n, d: c.d, dp: 0, ang: angLab(r) }); return p; } },
          { id: '5bx', sub: 'b, x', level: 'EMG', make: function (r, sh) { return fig5(sh, 'x'); } },
          { id: '5by', sub: 'b, y', level: 'EMG', make: function (r, sh) { return fig5(sh, 'y'); } }] },
      { num: '6', stem: function (sh) { return 'The diagram shows two right triangles with a common side ' + t('AD') + ', where ' + t('D') + ' lies on ' + t('BC') + '.' + fig6(sh); },
        shared: function (r) {
          var hs = Object.keys(SHARED_LEG), h = Number(r.pick(hs)), pair = r.sample(SHARED_LEG[h], 2).sort(function (a, b) { return a[0] - b[0]; });
          return { h: h, bd: pair[0][0], ab: pair[0][1], dc: pair[1][0], ac: pair[1][1], mir: r.chance(0.4) };
        },
        parts: [
          { id: '6a', level: 'BEG', make: function (r, sh) {
            var add = Math.sqrt(sq(sh.ab) + sq(sh.bd));
            return { prompt: 'Use the Pythagorean Theorem to calculate the length of ' + t('AD') + '.', input: { type: 'number', before: t('AD=') }, key: String(sh.h), answer: t('AD=' + sh.h), text: 'AD from ' + sh.ab + ', ' + sh.bd,
              check: K.number(sh.h, function (v) {
                if (Math.abs(v - add) < 0.06) return { code: 'pyth-add', hint: t('AB=' + sh.ab) + ' is the <b>hypotenuse</b> of triangle ' + t('ABD') + ', so subtract: ' + t('AD^{2}=AB^{2}-BD^{2}') + '.' };
                if (v === sh.ab - sh.bd) return { code: 'pyth-sub', hint: 'Subtract the <b>squares</b> of the sides, then take the square root.' };
                if (v === sq(sh.ab) - sq(sh.bd)) return { code: 'no-root', hint: 'That is ' + t('AD^{2}') + '. Take the square root.' };
                return null;
              }),
              solution: 'In right triangle ' + t('ABD') + ', ' + t('AB=' + sh.ab) + ' is the hypotenuse and ' + t('BD=' + sh.bd) + ' is a leg:<br>' + t('AD=\\sqrt{' + sh.ab + '^{2}-' + sh.bd + '^{2}}=\\sqrt{' + (sq(sh.ab) - sq(sh.bd)) + '}=' + sh.h),
              hints: ['Which side of triangle ' + t('ABD') + ' faces the right angle at ' + t('D') + '?'], bad: [String(sh.ab - sh.bd), String(sq(sh.ab) - sq(sh.bd))] };
          } },
          { id: '6b', level: 'PRG', make: function (r, sh) {
            var x = TR.asin(sh.h / sh.ac);
            var alts = [{ v: TR.asin(sh.h / sh.ab), code: 'wrong-triangle', hint: 'That is ' + t('\\angle ABC') + ', the angle at ' + t('B') + '. ' + t('\\angle BCA') + ' is at ' + t('C') + ': work in triangle ' + t('ADC') + '.' }].concat(sideAlts('oh', sh.h, sh.ac, '\\angle BCA', 'AD', 'AC', 0));
            return near('Determine the measure of ' + t('\\angle BCA') + ' to the nearest degree.', x, 0, alts,
              'First ' + t('AD=\\sqrt{' + sh.ab + '^{2}-' + sh.bd + '^{2}}=' + sh.h) + '. ' + sideSol('oh', sh.h, sh.ac, String(sh.h), String(sh.ac), '(\\angle BCA)', '\\angle BCA', x, 0, 'Work in right triangle ' + t('ADC') + '. '),
              ['You need ' + t('AD') + ' first (Pythagoras in triangle ' + t('ABD') + ').', 'In triangle ' + t('ADC') + ', name ' + t('AD') + ' and ' + t('AC') + ' from the angle at ' + t('C') + '.'], 'angle BCA two triangles', { before: t('\\angle BCA=') });
          } }] },
      { num: '7', stem: function (sh) { return 'Determine the measure of ' + t('\\angle LKN') + ' to the nearest degree.' + fig7(sh); },
        shared: function (r) { return search(r, function (r) { return { a: r.int(3, 12), h: r.int(5, 15), d: r.int(4, 20), mir: r.chance(0.4) }; }, function (s) { var x = 90 + TR.atan(s.d / s.h); return safe(x, 0) && Math.abs(s.d - s.h) > 1; }); },
        parts: [
          { id: '7', level: 'ADV', make: function (r, s) {
            var b = s.a + s.d, part = TR.atan(s.d / s.h), x = 90 + part;
            return near('Determine ' + t('\\angle LKN') + '.', x, 0, [
              { v: part, code: 'part-angle', hint: 'That is only ' + t('\\angle LKF') + ', the part below the perpendicular. ' + t('\\angle LKN') + ' also includes the right angle ' + t('\\angle FKN') + '.' },
              { v: 90 + TR.atan(s.h / s.d), code: 'ratio-flip', hint: 'Check the ratio in triangle ' + t('KFL') + ': from the angle at ' + t('K') + ', ' + t('LF') + ' is opposite and ' + t('KF') + ' is adjacent.' },
              { v: TR.atan(s.h / s.d), code: 'other-angle', hint: 'That is ' + t('\\angle KLM') + ', the angle at ' + t('L') + '. The question asks for the angle at ' + t('K') + '.' },
              { v: 90 + TR.atan(b / s.h), code: 'whole-base', hint: 'The horizontal leg of the right triangle is not ' + t('LM=' + b) + '. Drop a perpendicular from ' + t('K') + ' to ' + t('LM') + ': the leg is ' + t(b + '-' + s.a) + '.' }],
              'Drop a perpendicular from ' + t('K') + ' to ' + t('LM') + ', foot ' + t('F') + '. Then ' + t('KF=NM=' + s.h) + ' and ' + t('FM=KN=' + s.a) + ', so ' + t('LF=' + b + '-' + s.a + '=' + s.d) + '.<br>In right triangle ' + t('KFL') + ': ' + t('LF') + ' is OPPOSITE ' + t('\\angle LKF') + ' and ' + t('KF') + ' is ADJACENT ' + t('\\Rightarrow') + ' TOA.<br>' +
              t('\\tan(\\angle LKF)=' + frac(s.d, s.h) + '\\Rightarrow\\angle LKF=' + part.toFixed(2) + '^{\\circ}') + '<br>' + t('KN\\parallel LM') + ', so ' + t('\\angle FKN=90^{\\circ}') + ' and ' + t('\\angle LKN=90^{\\circ}+' + part.toFixed(2) + '^{\\circ}=' + x.toFixed(2) + '^{\\circ}\\approx ' + deg(x, 0)),
              ['The shape is not a triangle. Drop a perpendicular from ' + t('K') + ' to ' + t('LM') + ' to make a right triangle.', 'The angle at ' + t('K') + ' is a right angle plus the angle inside your new triangle.'], 'angle LKN trapezoid', { before: t('\\angle LKN=') });
          } }] },
      { num: '8', section: 'Part C — Applications', stem: '', parts: [
        { id: '8', level: 'EMG', make: function (r) {
          var obj = r.pick([['pylon', 'high'], ['flagpole', 'tall'], ['tower', 'tall'], ['tree', 'tall'], ['lamp post', 'tall']]);
          var c = search(r, function (r) { var h = r.int(50, 600) / 10; return { h: h, s: r.int(Math.round(h * 4), Math.round(h * 25)) / 10 }; }, function (c) { var x = TR.atan(c.h / c.s); return safe(x, 1) && x > 10 && x < 75 && Math.abs(x - 45) > 1; });
          var x = TR.atan(c.h / c.s);
          var alts = [{ v: TR.atan(c.s / c.h), code: 'ratio-flip', hint: 'Sketch it: the sun’s angle is at the tip of the shadow, on the ground. From there the ' + obj[0] + ' is OPPOSITE and the shadow is ADJACENT.' }].concat(sideAlts('oa', c.h, c.s, '\\theta', String(c.h), String(c.s), 1));
          return near('A ' + obj[0] + ' ' + c.h + ' m ' + obj[1] + ' casts a shadow ' + c.s + ' m long. Determine the angle of elevation of the sun to the nearest tenth of a degree.', x, 1, alts,
            sideSol('oa', c.h, c.s, String(c.h), String(c.s), '\\theta', '\\theta', x, 1, 'Sketch: the ' + obj[0] + ' is vertical, the shadow is horizontal, and the angle of elevation ' + t('\\theta') + ' is at the tip of the shadow.<br>'),
            ['Sketch a right triangle: vertical ' + obj[0] + ', horizontal shadow, and the sun’s ray from the top of the ' + obj[0] + ' to the tip of the shadow.', 'The angle of elevation is at the tip of the shadow. Name the two sides from there.'], 'sun elevation ' + c.h + '/' + c.s, { before: t('\\theta=') });
        } }] },
      { num: '9', stem: 'Calculate the size of ' + t('\\angle BAC') + ' to the nearest degree.', parts: [
        { id: '9a', level: 'ADV', make: function (r) {
          var unit = r.pick(['cm', 'm', 'mm']);
          var c = search(r, function (r) { var L = r.int(7, 20); return { L: L, b: r.int(4, 2 * L - 3) }; }, function (c) { var x = 2 * TR.asin(c.b / 2 / c.L); return x > 25 && x < 140 && safe(x, 0); });
          var half = TR.asin(c.b / 2 / c.L), x = 2 * half, hb = c.b / 2;
          var alts = [{ v: half, code: 'half-angle', hint: 'That is half of ' + t('\\angle BAC') + '. The perpendicular from ' + t('A') + ' splits the apex angle into two equal parts — double it.' },
            { v: 2 * Math.round(half), code: 'early-round', hint: 'Close — but you rounded the half-angle before doubling. Double the unrounded value, then round.' },
            { v: TR.acos(hb / c.L), code: 'base-angle', hint: 'That is a <b>base</b> angle (at ' + t('B') + ' or ' + t('C') + '). The question asks for the angle at ' + t('A') + '.' },
            { v: 2 * TR.acos(hb / c.L), code: 'wrong-ratio', hint: 'In the half-triangle, half the base is <b>opposite</b> the half-angle at ' + t('A') + ' and ' + t(c.L) + ' is the hypotenuse: SOH.' },
            { v: 2 * TR.atan(hb / c.L), code: 'tan-hyp', hint: t(c.L) + ' is the <b>hypotenuse</b> of the half-triangle, so use SOH, not TOA.' },
            { v: 2 * Math.asin(hb / c.L), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode. Switch to degree mode.' }];
          if (c.b < c.L) alts.push({ v: 2 * TR.asin(c.b / c.L), code: 'full-base', hint: 'The perpendicular cuts the base in half: the side opposite the half-angle is ' + t(F(hb)) + ', not ' + t(c.b) + '.' });
          return near(isoFig(r, c.L, c.b, unit), x, 0, alts,
            'Draw the perpendicular ' + t('AM') + ' to ' + t('BC') + '. It meets ' + t('BC') + ' at its midpoint, so ' + t('BM=' + c.b + '\\div 2=' + F(hb)) + ', and it bisects ' + t('\\angle BAC') + '.<br>In right triangle ' + t('ABM') + ': ' + t('BM') + ' is OPPOSITE ' + t('\\angle BAM') + ', ' + t('AB') + ' is the HYPOTENUSE ' + t('\\Rightarrow') + ' SOH.<br>' +
            t('\\sin(\\angle BAM)=' + frac(F(hb), c.L) + '\\Rightarrow\\angle BAM=' + half.toFixed(2) + '^{\\circ}') + '<br>' + t('\\angle BAC=2(' + half.toFixed(2) + '^{\\circ})=' + x.toFixed(2) + '^{\\circ}\\approx ' + deg(x, 0)),
            ['SOH CAH TOA needs a right triangle. Draw the perpendicular from ' + t('A') + ' to ' + t('BC') + '.', 'The perpendicular halves the base and the angle at ' + t('A') + '.'], 'isosceles apex ' + c.L + ', ' + c.b, { before: t('\\angle BAC=') });
        } },
        { id: '9b', level: 'PRG', make: function (r) {
          var unit = r.pick(['in', 'cm', 'ft']);
          var c = search(r, function (r) { return { b: 2 * r.int(10, 100), h: r.int(15, 120) }; }, function (c) { var x = 2 * TR.atan(c.b / 2 / c.h); return x > 30 && x < 150 && safe(x, 0) && Math.abs(c.b / 2 - c.h) > 2; });
          var hb = c.b / 2, half = TR.atan(hb / c.h), x = 2 * half;
          var alts = [{ v: half, code: 'half-angle', hint: 'That is half of ' + t('\\angle BAC') + '. The altitude bisects the apex angle — double it.' },
            { v: 2 * Math.round(half), code: 'early-round', hint: 'Close — but you rounded the half-angle before doubling. Double the unrounded value, then round.' },
            { v: 2 * TR.atan(c.h / hb), code: 'ratio-flip', hint: 'Your ratio is upside down: from the half-angle at ' + t('A') + ', half the base is OPPOSITE and the altitude is ADJACENT.' },
            { v: 2 * TR.atan(c.b / c.h), code: 'full-base', hint: 'The altitude meets ' + t('BC') + ' at its midpoint, so the opposite side is half the base, ' + t(hb) + '.' },
            { v: TR.atan(c.h / hb), code: 'base-angle', hint: 'That is a <b>base</b> angle. The question asks for the angle at ' + t('A') + '.' },
            { v: 2 * Math.atan(hb / c.h), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode. Switch to degree mode.' }];
          return near(isoFig(r, null, c.b, unit, c.h), x, 0, alts,
            'The altitude meets ' + t('BC') + ' at its midpoint, so half the base is ' + t(c.b + '\\div 2=' + hb) + ' and the altitude is ' + t(c.h) + '; it bisects ' + t('\\angle BAC') + '.<br>For the half-angle: ' + t(hb) + ' is OPPOSITE and ' + t(c.h) + ' is ADJACENT ' + t('\\Rightarrow') + ' TOA.<br>' +
            t('\\tan(\\text{half})=' + frac(hb, c.h) + '\\Rightarrow\\text{half}=' + half.toFixed(2) + '^{\\circ}') + '<br>' + t('\\angle BAC=2(' + half.toFixed(2) + '^{\\circ})=' + x.toFixed(2) + '^{\\circ}\\approx ' + deg(x, 0)),
            ['The altitude makes two congruent right triangles. Work in one of them.', 'Half the base is opposite the half-angle at ' + t('A') + '; the altitude is adjacent.'], 'isosceles altitude ' + c.b + ', ' + c.h, { before: t('\\angle BAC=') });
        } }] },
      { num: '10', stem: '', parts: [
        { id: '10', level: 'ADV', make: function (r) {
          var c = search(r, function (r) { var L = r.int(80, 250) / 10; return { L: L, W: r.int(Math.round(L * 3.5), Math.round(L * 7.5)) / 10 }; }, function (c) { return safe(2 * TR.atan(c.W / c.L), 0) && c.W !== c.L; });
          var part = TR.atan(c.W / c.L), obtuse = 180 - 2 * part, acute = 2 * part, askP = r.chance(0.6), x = askP ? obtuse : acute, nm = askP ? '\\angle PTQ' : '\\angle QTR';
          var fig = HW.fig({ pts: { P: [0, c.W], Q: [c.L, c.W], R: [c.L, 0], S: [0, 0], T: [c.L / 2, c.W / 2] }, segs: [['P', 'Q', c.L + ' cm'], ['Q', 'R', c.W + ' cm'], ['R', 'S'], ['S', 'P'], ['P', 'R', { width: 1.5 }], ['Q', 'S', { width: 1.5 }]], width: 300 });
          var alts = [{ v: askP ? acute : obtuse, code: 'other-T', hint: 'That is the <b>other</b> angle where the diagonals cross. Look at the figure: is ' + t(nm) + ' acute or obtuse?' },
            { v: part, code: 'part-angle', hint: 'That is ' + t('\\angle QPR') + ', the angle a diagonal makes with ' + t('PQ') + '. Use it to find the angle at ' + t('T') + '.' },
            { v: 90 - part, code: 'part-angle', hint: 'That is the angle a diagonal makes with a short side. Use the isosceles triangle with its vertex at ' + t('T') + '.' },
            { v: 180 - part, code: 'part-angle', hint: 'Triangle ' + t(askP ? 'PTQ' : 'QTR') + ' is isosceles: it has <b>two</b> equal base angles to subtract from ' + t('180^{\\circ}') + '.' }];
          return near('In rectangle ' + t('PQRS') + ', ' + t('PQ=' + c.L) + ' cm and ' + t('QR=' + c.W) + ' cm, and the diagonals meet at ' + t('T') + '. Determine the measure of ' + t(nm) + ' to the nearest degree.' + fig, x, 0, alts,
            'The diagonals of a rectangle are equal and bisect each other, so ' + t('PT=QT=RT') + ' and the triangles at ' + t('T') + ' are isosceles.<br>In right triangle ' + t('PQR') + ', from ' + t('\\angle QPR') + ': ' + t('QR') + ' is OPPOSITE, ' + t('PQ') + ' is ADJACENT, so ' + t('\\angle QPT=\\tan^{-1}\\left(' + frac(c.W, c.L) + '\\right)=' + part.toFixed(2) + '^{\\circ}') + '.<br>' +
            (askP ? 'Equal base angles at ' + t('P') + ' and ' + t('Q') + ': ' + t('\\angle PTQ=180^{\\circ}-2(' + part.toFixed(2) + '^{\\circ})=' + x.toFixed(2) + '^{\\circ}\\approx ' + deg(x, 0))
              : t('\\angle PTQ=180^{\\circ}-2(' + part.toFixed(2) + '^{\\circ})=' + obtuse.toFixed(2) + '^{\\circ}') + ', and ' + t('\\angle QTR') + ' is supplementary to it: ' + t('\\angle QTR=180^{\\circ}-' + obtuse.toFixed(2) + '^{\\circ}=' + x.toFixed(2) + '^{\\circ}\\approx ' + deg(x, 0))),
            ['Find the angle a diagonal makes with ' + t('PQ') + ' first (right triangle ' + t('PQR') + ').', 'The diagonals of a rectangle bisect each other and are equal, so the triangles at ' + t('T') + ' are isosceles.'], 'rectangle diagonals ' + c.L + ' x ' + c.W, { before: t(nm + '=') });
        } }] },
      { num: '11', stem: '', parts: [
        { id: '11', level: 'EMG', make: function (r) {
          var g = search(r, function (r) { return r.int(3, 25); }, function (g) { return safe(TR.atan(g / 100), 0); }), x = TR.atan(g / 100);
          return near('The term “% grade” describes the slope of a road: a road with ' + an(g) + ' ' + t(g + '\\%') + ' grade rises ' + t(g) + ' m vertically for every ' + t('100') + ' m of horizontal distance. Calculate, to the nearest degree, the angle a road with ' + an(g) + ' ' + t(g + '\\%') + ' grade makes with the horizontal.', x, 0,
            [{ v: g, code: 'grade-angle', hint: An(g) + ' ' + t(g + '\\%') + ' grade is not ' + t(g + '^{\\circ}') + '. Sketch the triangle: rise ' + t(g) + ', horizontal run ' + t('100') + '.' },
              { v: TR.atan(100 / g), code: 'ratio-flip', hint: 'That is the angle with the <b>vertical</b>. From the angle at the road, the rise is OPPOSITE and the run is ADJACENT.' },
              { v: TR.asin(g / 100), code: 'used-sin', hint: 'The ' + t('100') + ' m is horizontal distance, not the road surface, so it is ADJACENT: use TOA.' }].concat(std('tan')(g / 100)),
            An(g) + ' ' + t(g + '\\%') + ' grade is a rise of ' + t(g) + ' for a run of ' + t('100') + ': the rise is OPPOSITE the angle, the run is ADJACENT ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\tan\\theta=' + frac(g, 100) + '=' + (g / 100) + '\\Rightarrow\\theta=\\tan^{-1}(' + (g / 100) + ')=' + x.toFixed(2) + '^{\\circ}\\approx ' + deg(x, 0)),
            ['Sketch a right triangle with a vertical rise of ' + t(g) + ' and a horizontal run of ' + t('100') + '.'], 'grade ' + g + '%', { before: t('\\theta=') });
        } }] },
      { num: '12', stem: '', parts: [
        { id: '12', level: 'PRG', make: function (r) {
          var c = search(r, function (r) { return { L: r.int(250, 600) / 10, d: r.int(120, 500) / 100 }; }, function (c) { var x = TR.asin(c.d / c.L); return safe(x, 2) && fx(TR.atan(c.d / c.L), 2) !== fx(x, 2); });
          var x = TR.asin(c.d / c.L), m = r.chance(0.5);
          var fig = HW.fig({ pts: mirror({ O: [0, 0], V: [0, 6], T: [2, 6] }, m, 0), segs: [['O', 'V', { dash: 1 }], ['V', 'T', c.d.toFixed(2) + ' m'], ['O', 'T', c.L + ' m', { width: 4 }]], right: [['V', 'O', 'T']], angles: [['O', 'V', 'T', 'θ', { r: 50 }]], names: false, pad: 50,
            extra: [{ type: 'text', at: [m ? 0.8 : -0.8, 3.4], text: 'vertical', size: 12 }, { type: 'text', at: [m ? -1 : 1, -0.7], text: '(not to scale)', size: 12 }], width: 240, height: 300 });
          return near('A leaning clock tower has drifted from the vertical. Using the measurements in the sketch, determine, to the nearest <b>hundredth</b> of a degree, the tower’s angle of lean from the vertical.' + fig, x, 2,
            [{ v: TR.atan(c.d / c.L), code: 'tan-hyp', hint: 'The ' + c.L + ' m is the tower itself, which faces the right angle — it is the <b>hypotenuse</b>, not the vertical height. Use SOH.' },
              { v: 90 - x, code: 'from-horizontal', hint: 'That is the angle with the <b>horizontal</b>. The lean is measured from the vertical dashed line.' }].concat(std('sin')(c.d / c.L)),
            'The right angle is at the top, between the vertical and the ' + c.d.toFixed(2) + ' m offset, so the tower (' + c.L + ' m) is the HYPOTENUSE and the offset is OPPOSITE the lean angle ' + t('\\Rightarrow') + ' SOH.<br>' +
            t('\\sin\\theta=' + frac(c.d.toFixed(2), c.L) + '=' + (c.d / c.L).toFixed(6) + '\\Rightarrow\\theta=' + x.toFixed(4) + '^{\\circ}\\approx ' + deg(x, 2)),
            ['Which side faces the right angle? That is the hypotenuse.', 'The offset is across from the lean angle.'], 'leaning tower ' + c.d + '/' + c.L, { before: t('\\theta=') });
        } }] },
      { num: '13', section: 'Part D — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '13', level: 'BEG', make: function (r) {
          var c = search(r, function (r) { return { a: r.int(5, 15), b: r.int(40, 150) }; }, function (c) { var x = TR.atan(c.a / c.b), f = x - Math.floor(x); return f > 0.55 && f < 0.9 && x > 3; });
          var x = TR.atan(c.a / c.b), R = Math.round(x);
          var opts = [{ html: t(R + '^{\\circ}'), right: true },
            { html: t((R - 1) + '^{\\circ}'), why: 'Round, don’t chop: ' + t('\\tan^{-1}\\left(' + frac(c.a, c.b) + '\\right)=' + x.toFixed(2) + '^{\\circ}') + '.' },
            { html: t((90 - R) + '^{\\circ}'), why: 'That is the other acute angle (between the ramp and the vertical rise). The angle with the floor is opposite the rise.' },
            { html: t((91 - R) + '^{\\circ}'), why: 'That is ' + t('90^{\\circ}-' + (R - 1) + '^{\\circ}') + ': the other acute angle, worked out from a chopped (not rounded) ' + t((R - 1) + '^{\\circ}') + '. The angle with the floor is opposite the rise.' }];
          return mc(r, 'A wheelchair ramp has a vertical rise of ' + t(c.a) + ' cm for every ' + t(c.b) + ' cm of horizontal run. To the nearest degree, the angle between the ramp and the floor is', opts,
            'Rise ' + t(c.a) + ' is OPPOSITE, run ' + t(c.b) + ' is ADJACENT ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\tan\\theta=' + frac(c.a, c.b) + '\\Rightarrow\\theta=' + x.toFixed(2) + '^{\\circ}\\approx ' + R + '^{\\circ}'),
            ['Sketch it: the rise is opposite the angle at the floor and the run is adjacent.'], 'ramp angle MC ' + c.a + '/' + c.b);
        } }] },
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '14', level: 'LIM', make: function (r) {
          var a = r.pick([r.int(22, 44), r.int(46, 75)]), who = r.pick([['A tourist atop a bridge tower spots a boat in the water below.', 'the boat from the tourist', 'the tourist from the boat'], ['A lifeguard in a tall chair spots a swimmer.', 'the swimmer from the lifeguard', 'the lifeguard from the swimmer'], ['A hiker on a ridge sees a campsite in the valley.', 'the campsite from the hiker', 'the hiker from the campsite']]);
          var p = K.P.nr(who[0] + ' The angle of depression of ' + who[1] + ' is ' + t(a + '^{\\circ}') + '. At the same moment, the angle of elevation of ' + who[2] + ', to the nearest degree, is ________.', a, function (v) {
            if (v === 90 - a) return { code: 'complement', hint: 'Both angles are measured from a <b>horizontal</b> line. The two horizontals are parallel and the line of sight crosses both: alternate angles.' };
            if (v === 180 - a) return { code: 'supplement', hint: 'Alternate angles between parallel lines are <b>equal</b>, not supplementary.' };
            return null;
          }, 'The horizontal at the higher point and the horizontal at the lower point are parallel, and the line of sight is a transversal, so the two angles are alternate interior angles and are equal.<br>Angle of elevation ' + t('=' + a + '^{\\circ}') + '.', ['Draw both horizontal lines and the line of sight. Which angle pair do you see?'], 'depression = elevation ' + a);
          p.bad = [String(90 - a), String(180 - a)]; return p;
        } }] },
      { num: '15', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '15', level: 'EMG', make: function (r) {
          var ctx = r.pick([['A window washer on a platform', 'm above the street looks down at a parked bus that is', 'm from the base of the building', 'the bus from the window washer'], ['A lighthouse keeper', 'm above the sea looks down at a sailboat that is', 'm from the base of the lighthouse', 'the sailboat from the keeper'], ['A person on a balcony', 'm above the ground looks down at a dog that is', 'm from the base of the building', 'the dog from the person']]);
          var c = search(r, function (r) { return { h: r.int(20, 90), d: r.int(30, 150) }; }, function (c) { var x = TR.atan(c.h / c.d); return safe(x, 1) && x > 10 && x < 80 && Math.abs(c.h - c.d) > 3; });
          var x = TR.atan(c.h / c.d);
          var alts = [{ v: TR.atan(c.d / c.h), code: 'from-horizontal', hint: 'That angle is measured from the <b>vertical</b> wall. The angle of depression is measured down from the horizontal — it equals the angle of elevation at the ground.' }].concat(sideAlts('oa', c.h, c.d, '\\theta', String(c.h), String(c.d), 1));
          var p = near(ctx[0] + ' ' + t(c.h) + ' ' + ctx[1] + ' ' + t(c.d) + ' ' + ctx[2] + '. To the nearest tenth of a degree, the angle of depression of ' + ctx[3] + ' is ________.', x, 1, alts,
            'The angle of depression from the high point equals the angle of elevation from the low point. From the ground: the height ' + t(c.h) + ' is OPPOSITE and ' + t(c.d) + ' is ADJACENT ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\tan\\theta=' + frac(c.h, c.d) + '=' + v4(c.h / c.d) + '\\Rightarrow\\theta=' + x.toFixed(2) + '^{\\circ}\\approx ' + fx(x, 1)),
            ['Sketch it. The angle of depression equals the angle of elevation from the ground (alternate angles).'], 'depression ' + c.h + '/' + c.d, { nr: true, unit: '' });
          p.answer = t(fx(x, 1)); return p;
        } }] },
      { num: '16', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '16', level: 'EMG', make: function (r) {
          var who = r.pick(['A cargo drone', 'A small plane', 'A delivery drone']);
          var c = search(r, function (r) { var s = r.int(150, 600); return { s: s, h: r.int(Math.round(s * 0.2), Math.round(s * 0.8)) }; }, function (c) { var x = TR.asin(c.h / c.s); return safe(x, 1) && Math.abs(x - 45) > 1; });
          var x = TR.asin(c.h / c.s);
          var p = near(who + ' descends at a constant angle of depression and travels ' + t(c.s) + ' m along its flight path while descending. When it levels off, it has dropped a vertical distance of ' + t(c.h) + ' m. To the nearest tenth of a degree, the angle of depression of the descent is ________.', x, 1,
            sideAlts('oh', c.h, c.s, '\\theta', String(c.h), String(c.s), 1),
            'The flight path (' + t(c.s) + ' m) is the HYPOTENUSE and the vertical drop (' + t(c.h) + ' m) is OPPOSITE the angle of depression ' + t('\\Rightarrow') + ' SOH.<br>' + t('\\sin\\theta=' + frac(c.h, c.s) + '=' + v4(c.h / c.s) + '\\Rightarrow\\theta=' + x.toFixed(2) + '^{\\circ}\\approx ' + fx(x, 1)),
            ['The flight path itself is the sloping side of the triangle. Which side does it face?'], 'drone descent ' + c.h + '/' + c.s, { nr: true, unit: '' });
          p.answer = t(fx(x, 1)); return p;
        } }] }
    ],
    extra: [
      /* ---------------- Part A ---------------- */
      { num: '1', section: 'Extra practice A — Which two sides you have decides the ratio',
        stem: function (sh) { return 'In right triangle ' + t(sh.nm.join('')) + ' the right angle is at ' + t(sh.nm[1]) + '. Only two lengths are known: ' + t(sh.nm[0] + sh.nm[1] + '=' + sh.leg) + ' and ' + t(sh.nm[0] + sh.nm[2] + '=' + sh.hyp) + '. The third side is not given and is not needed.' + sh.fig; },
        shared: function (r) {
          var nm = r.pick(NAMESETS), c = search(r, function (r) { var l = r.int(8, 30); return { leg: l, hyp: r.int(l + 5, 60) }; }, function (c) { var x = TR.asin(c.leg / c.hyp); return x > 12 && x < 78 && Math.abs(x - 45) > 1.5 && safe(x, 0); });
          c.nm = nm; c.fig = triFig(r, { opp: c.leg, adj: Math.sqrt(sq(c.hyp) - sq(c.leg)), lab: { opp: String(c.leg), hyp: String(c.hyp) }, nm: [nm[2], nm[0], nm[1]] }); return c;
        },
        parts: [
          { id: 'e1a', level: 'BEG', make: function (r, s) { var N = s.nm; return sidePart(r, { kind: 'oh', n: s.leg, d: s.hyp, dp: 0, ang: vtxLab(N[2]), noFig: true, prompt: 'Name ' + t(N[0] + N[1]) + ' and ' + t(N[0] + N[2]) + ' relative to ' + t('\\angle ' + N[2]) + ', choose SOH, CAH or TOA, then determine ' + t('\\angle ' + N[2]) + ' to the nearest degree.' }); } },
          { id: 'e1b', level: 'BEG', make: function (r, s) { var N = s.nm; return sidePart(r, { kind: 'ah', n: s.leg, d: s.hyp, dp: 0, ang: vtxLab(N[0]), noFig: true, prompt: 'Name the <b>same two sides</b> relative to ' + t('\\angle ' + N[0]) + ', choose the ratio, then determine ' + t('\\angle ' + N[0]) + ' to the nearest degree.' }); } },
          { id: 'e1c', level: 'EMG', make: function (r, s) {
            var N = s.nm, L = N[0] + N[1];
            return mc(r, 'Not one length changed between ' + t('\\angle ' + N[2]) + ' and ' + t('\\angle ' + N[0]) + ', yet the ratio changed from sine to cosine. Which statement explains it?', [
              { html: 'The <b>reference angle</b> changed: ' + t(L) + ' is opposite ' + t(N[2]) + ' but adjacent to ' + t(N[0]) + '. The hypotenuse kept its name because it is fixed by the right angle at ' + t(N[1]) + '.', right: true },
              { html: 'The hypotenuse became a leg when we switched to ' + t('\\angle ' + N[0]) + '.', why: 'The hypotenuse is the side facing the <b>right angle</b>; that never moves, so its name never changes.' },
              { html: 'Sine and cosine are interchangeable, so either ratio works for either angle.', why: 'Try it: ' + t('\\sin^{-1}\\left(' + frac(s.leg, s.hyp) + '\\right)') + ' gives one angle and ' + t('\\cos^{-1}') + ' of the same fraction gives the other. The ratio depends on the side names.' },
              { html: 'The side lengths are measured differently from each angle.', why: 'The lengths ' + t(s.leg) + ' and ' + t(s.hyp) + ' are the same in both parts. Only the <b>names</b> opposite/adjacent changed.' }],
              'Opposite and adjacent are decided by the reference angle: ' + t(L) + ' lies across from ' + t(N[2]) + ' but runs into ' + t(N[0]) + '. The hypotenuse is chosen by the right angle at ' + t(N[1]) + ', which stayed put. Opp + hyp forced sine; adj + hyp forced cosine.', ['Ask: which side touches each angle?'], 'why the ratio changed');
          } },
          { id: 'e1d', level: 'BEG', make: function (r, s) {
            var N = s.nm, a = Math.round(TR.asin(s.leg / s.hyp)), b = Math.round(TR.acos(s.leg / s.hyp));
            return mc(r, 'You found ' + t('\\angle ' + N[2] + '\\approx ' + a + '^{\\circ}') + ' and ' + t('\\angle ' + N[0] + '\\approx ' + b + '^{\\circ}') + '. They add to ' + t('90^{\\circ}') + '. Why was that guaranteed before you started?', [
              { html: 'The angles of a triangle add to ' + t('180^{\\circ}') + ' and the right angle takes ' + t('90^{\\circ}') + ', leaving ' + t('90^{\\circ}') + ' for the other two.', right: true },
              { html: 'Because ' + t('\\sin') + ' and ' + t('\\cos') + ' are reciprocals.', why: 'They aren’t reciprocals. The reason is about the triangle’s angle sum.' },
              { html: 'Only because of these particular side lengths.', why: 'It happens in <b>every</b> right triangle. Think about the angle sum.' },
              { html: 'Because both angles were rounded to the nearest degree.', why: 'Rounding has nothing to do with it; the exact angles also add to ' + t('90^{\\circ}') + '.' }],
              t(a + '^{\\circ}+' + b + '^{\\circ}=90^{\\circ}') + '. The three angles of any triangle add to ' + t('180^{\\circ}') + '; one is the ' + t('90^{\\circ}') + ' at ' + t(N[1]) + ', so the other two share ' + t('90^{\\circ}') + '.', [], 'acute angles sum to 90');
          } }] },
      { num: '2', stem: function (sh) { return 'In right triangle ' + t(sh.nm.join('')) + ' the right angle is at ' + t(sh.nm[1]) + ', with ' + t(sh.nm[0] + sh.nm[1] + '=' + sh.p) + ' and ' + t(sh.nm[1] + sh.nm[2] + '=' + sh.q) + '. This time the two known sides are the <b>two legs</b>.' + sh.fig; },
        shared: function (r) {
          var nm = r.pick(NAMESETS), c = search(r, function (r) { return { p: r.int(5, 30), q: r.int(10, 50) }; }, function (c) { var x = TR.atan(c.q / c.p); return c.p !== c.q && x > 12 && x < 80 && Math.abs(x - 45) > 2 && safe(x, 0); });
          c.nm = nm; c.fig = triFig(r, { opp: c.q, adj: c.p, lab: { opp: String(c.q), adj: String(c.p) }, nm: [nm[0], nm[2], nm[1]] }); return c;
        },
        parts: [
          { id: 'e2a', level: 'BEG', make: function (r, s) { return sidePart(r, { kind: 'oa', n: s.q, d: s.p, dp: 0, ang: vtxLab(s.nm[0]), noFig: true, prompt: 'Determine ' + t('\\angle ' + s.nm[0]) + ' to the nearest degree. Name the sides first.' }); } },
          { id: 'e2b', level: 'BEG', make: function (r, s) { return sidePart(r, { kind: 'oa', n: s.p, d: s.q, dp: 0, ang: vtxLab(s.nm[2]), noFig: true, prompt: 'Determine ' + t('\\angle ' + s.nm[2]) + ' to the nearest degree.' }); } },
          { id: 'e2c', level: 'EMG', make: function (r, s) {
            var N = s.nm;
            return mc(r, 'With a leg and the hypotenuse, the ratio changed from sine to cosine when the angle changed. Here it did <b>not</b> change. Why do two known legs force the same ratio for both acute angles, and what changes instead?', [
              { html: 'Neither leg can be the hypotenuse, so the known sides are opposite and adjacent in some order: TOA both times. The <b>fraction flips</b>: ' + t(frac(s.q, s.p)) + ' becomes ' + t(frac(s.p, s.q)) + '.', right: true },
              { html: 'The two acute angles are equal, so the ratio is the same.', why: 'The angles are about ' + t(Math.round(TR.atan(s.q / s.p)) + '^{\\circ}') + ' and ' + t(Math.round(TR.atan(s.p / s.q)) + '^{\\circ}') + ' — not equal.' },
              { html: 'Tangent works for any two sides of a right triangle.', why: 'Tangent needs opposite and adjacent. With the hypotenuse known you would use sine or cosine.' },
              { html: 'The fraction stays the same; only the name of the angle changes.', why: 'From ' + t(N[0]) + ', ' + t(N[1] + N[2]) + ' is opposite; from ' + t(N[2]) + ', ' + t(N[0] + N[1]) + ' is opposite. So the fraction flips.' }],
              'The hypotenuse ' + t(N[0] + N[2]) + ' was not given, so whichever acute angle you choose, the known sides are opposite and adjacent: TOA is forced both times. What changes is the fraction: ' + t(frac(s.q, s.p)) + ' for ' + t('\\angle ' + N[0]) + ' and ' + t(frac(s.p, s.q)) + ' for ' + t('\\angle ' + N[2]) + ' — reciprocals.', [], 'two legs: TOA both ways');
          } },
          { id: 'e2d', level: 'EMG', make: function (r, s) {
            var N = s.nm;
            var p = K.P.number('Compute ' + t('\\tan ' + N[0] + '\\times\\tan ' + N[2]) + '. (Use the exact fractions.)', 1, function (v) {
              if (v === 90) return { code: 'sum-not-product', hint: 'That is the sum of the <b>angles</b>. Multiply the two <b>tangents</b>: ' + t(frac(s.q, s.p) + '\\times' + frac(s.p, s.q)) + '.' };
              return null;
            }, t('\\tan ' + N[0] + '\\times\\tan ' + N[2] + '=' + frac(s.q, s.p) + '\\times' + frac(s.p, s.q) + '=1') + '. In every right triangle the tangents of the two acute angles are reciprocals, so their product is ' + t('1') + '.',
              ['Write each tangent as opposite over adjacent, then multiply.'], 'tan product', { before: t('\\tan ' + N[0] + '\\times\\tan ' + N[2] + '=') });
            p.bad = ['90']; return p;
          } }] },
      { num: '3', stem: function (sh) { return '<b>Sorting only — don’t compute an angle.</b> For each part, choose the inverse ratio that would find the angle, by naming the two <b>known</b> sides relative to that angle.<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">' + sh.f1 + sh.f2 + '</div>'; },
        shared: function (r) {
          var s = { l1: r.int(10, 30), h1: r.int(40, 60), useBC: r.chance(0.5), a2: r.int(18, 40), b2: r.int(8, 16), legs: r.chance(0.6) };
          // triangle ABC: right at C; A at the end of the horizontal leg AC, B at the top of the vertical leg BC
          s.f1 = HW.tri({ w: 4, h: 1.4, names: ['A', 'B', 'C'], sides: s.useBC ? { a: String(s.l1), c: String(s.h1) } : { b: String(s.l1), c: String(s.h1) }, rot: r.pick([0, 2]), flip: r.chance(0.5), width: 230 });
          // triangle MNP: right at N; M at the top, P at the end of the horizontal leg
          s.mp = r.int(s.a2 + 3, s.a2 + 15);
          s.f2 = HW.tri({ w: 1.2, h: 2.8, names: ['P', 'M', 'N'], sides: s.legs ? { a: String(s.a2), b: String(s.b2) } : { b: String(s.b2), c: String(s.mp) }, rot: r.pick([0, 2]), flip: r.chance(0.5), width: 170 });
          return s;
        },
        parts: [
          { id: 'e3a', level: 'LIM', make: function (r, s) { var f = s.useBC ? 'sin' : 'cos'; return ratioMC(r, t('\\angle A') + ' in ' + t('\\triangle ABC'), f, s.useBC ? t('BC=' + s.l1) + ' is opposite ' + t('\\angle A') + ' and ' + t('AB=' + s.h1) + ' is the hypotenuse: opp + hyp, so ' + t('\\sin^{-1}') + '.' : t('AC=' + s.l1) + ' touches ' + t('\\angle A') + ' (adjacent) and ' + t('AB=' + s.h1) + ' is the hypotenuse: adj + hyp, so ' + t('\\cos^{-1}') + '.', 'sort: angle A'); } },
          { id: 'e3b', level: 'LIM', make: function (r, s) { var f = s.useBC ? 'cos' : 'sin'; return ratioMC(r, t('\\angle B') + ' in ' + t('\\triangle ABC'), f, s.useBC ? 'The same two sides, but ' + t('BC=' + s.l1) + ' runs into ' + t('B') + ', so it is adjacent; ' + t('AB') + ' is still the hypotenuse: ' + t('\\cos^{-1}') + '.' : t('AC=' + s.l1) + ' is across from ' + t('B') + ' (opposite) and ' + t('AB') + ' is the hypotenuse: ' + t('\\sin^{-1}') + '.', 'sort: angle B'); } },
          { id: 'e3c', level: 'BEG', make: function (r, s) { var f = s.legs ? 'tan' : 'sin'; return ratioMC(r, t('\\angle M') + ' in ' + t('\\triangle MNP'), f, s.legs ? t('NP=' + s.b2) + ' is opposite ' + t('\\angle M') + ' and ' + t('MN=' + s.a2) + ' is adjacent. The hypotenuse ' + t('MP') + ' is drawn but not known: opp + adj, so ' + t('\\tan^{-1}') + '.' : t('NP=' + s.b2) + ' is across from ' + t('\\angle M') + ' (opposite) and ' + t('MP=' + s.mp) + ' is the hypotenuse: opp + hyp, so ' + t('\\sin^{-1}') + '.', 'sort: angle M'); } },
          { id: 'e3d', level: 'LIM', make: function (r, s) { var f = s.legs ? 'tan' : 'cos'; return ratioMC(r, t('\\angle P') + ' in ' + t('\\triangle MNP'), f, s.legs ? t('MN=' + s.a2) + ' is opposite ' + t('\\angle P') + ' and ' + t('NP=' + s.b2) + ' is adjacent — still the two legs, so ' + t('\\tan^{-1}') + '. Only the fraction flips.' : t('NP=' + s.b2) + ' touches ' + t('P') + ' (adjacent) and ' + t('MP=' + s.mp) + ' is the hypotenuse: ' + t('\\cos^{-1}') + '.', 'sort: angle P'); } },
          { id: 'e3e', level: 'BEG', make: function (r) {
            var L = r.int(40, 90), h = r.int(20, L - 5), v = r.chance(0.5);
            return ratioMC(r, v ? 'A kite flies on ' + t(L) + ' m of taut string, ' + t(h) + ' m above the ground. The angle the string makes with the ground.' : 'A kite flies on ' + t(L) + ' m of taut string; the point on the ground directly below the kite is ' + t(h) + ' m from where the string is held. The angle the string makes with the ground.',
              v ? 'sin' : 'cos', 'The taut string is the hypotenuse. ' + (v ? 'The height ' + t(h) + ' is opposite the angle at the ground: opp + hyp, so ' + t('\\sin^{-1}') + '.' : 'The ' + t(h) + ' m along the ground touches the angle (adjacent): adj + hyp, so ' + t('\\cos^{-1}') + '.'), 'sort: kite');
          } },
          { id: 'e3f', level: 'BEG', make: function (r) {
            var h = r.int(30, 90), d = r.int(300, 700), v = r.chance(0.5);
            return ratioMC(r, v ? 'A hill rises ' + t(h) + ' m over a <b>horizontal</b> distance of ' + t(d) + ' m. The angle the hill makes with the horizontal.' : 'A path rises ' + t(h) + ' m over ' + t(d) + ' m measured <b>along the slope</b>. The angle the path makes with the horizontal.',
              v ? 'tan' : 'sin', v ? 'The rise is opposite the angle and the horizontal distance is adjacent: ' + t('\\tan^{-1}') + '.' : 'The rise is opposite the angle and the distance along the slope is the hypotenuse: ' + t('\\sin^{-1}') + '.', 'sort: hill');
          } }] },
      { num: '4', stem: 'A classmate proposes a shortcut: <i>“If the hypotenuse is in the diagram, use sine.”</i>', parts: [
        { id: 'e4a', level: 'EMG', make: function (r) {
          var useAdj = r.chance(0.5);
          var right = useAdj ? { html: 'The hypotenuse and the leg <b>touching</b> the angle are known — the angle needs ' + t('\\cos^{-1}') + '.', right: true }
            : { html: 'The two legs are known and the hypotenuse is drawn but not given — the angle needs ' + t('\\tan^{-1}') + '.', right: true };
          return mc(r, 'Which situation is a <b>counterexample</b> to the rule (the hypotenuse is in the diagram, yet sine is wrong)?', [right,
            { html: 'The hypotenuse and the leg <b>across from</b> the angle are known.', why: 'Opposite + hypotenuse really is sine, so the rule works here — not a counterexample.' },
            { html: 'A kite string (taut) and the kite’s height above the ground are known; find the angle at the ground.', why: 'Height is opposite the angle and the string is the hypotenuse: sine is correct, so the rule works here.' },
            { html: 'A ramp’s sloped length and its vertical rise are known; find the angle with the ground.', why: 'Rise is opposite and the sloped length is the hypotenuse: sine is correct here.' }],
            'Being drawn “in” the diagram settles nothing. ' + (useAdj ? 'With the hypotenuse and the <b>adjacent</b> leg known, the ratio is cosine.' : 'If the hypotenuse is drawn but not <b>known</b>, the two known sides are the legs and the ratio is tangent.') + ' What matters is which two sides you actually know and what they are called relative to the angle.', ['Look for a case where the hypotenuse appears but sine gives the wrong angle.'], 'counterexample to rule');
        } },
        { id: 'e4b', level: 'EMG', make: function (r) {
          return mc(r, 'Which rule is correct in every case?', [
            { html: 'Name the two <b>known</b> sides relative to the angle you want, then use the ratio whose sides match: opp &amp; hyp ' + t('\\to\\sin^{-1}') + ', adj &amp; hyp ' + t('\\to\\cos^{-1}') + ', opp &amp; adj ' + t('\\to\\tan^{-1}') + '.', right: true },
            { html: 'If the hypotenuse is known use sine; otherwise use tangent.', why: 'Adjacent + hypotenuse is cosine, not sine.' },
            { html: 'Use the ratio that involves the longest side drawn.', why: 'The longest side is the hypotenuse, which is not always known — and even when it is, it could be cosine.' },
            { html: 'Use whichever inverse ratio gives an angle less than ' + t('90^{\\circ}') + '.', why: 'Every inverse ratio of a valid fraction gives an angle under ' + t('90^{\\circ}') + '; only one of them is the angle you want.' }],
            'Name the two sides you <b>know</b> relative to the angle you want, then match: opposite and hypotenuse ' + t('\\to\\sin^{-1}') + ', adjacent and hypotenuse ' + t('\\to\\cos^{-1}') + ', opposite and adjacent ' + t('\\to\\tan^{-1}') + '.', [], 'correct rule');
        } }] },
      /* ---------------- Part B ---------------- */
      { num: '5', section: 'Extra practice B — Both acute angles, and the free 90° check',
        stem: function (sh) { return 'In right triangle ' + t(sh.nm.join('')) + ' the right angle is at ' + t(sh.nm[1]) + ', with ' + t(sh.nm[0] + sh.nm[1] + '=' + sh.p) + ' and ' + t(sh.nm[1] + sh.nm[2] + '=' + sh.q) + '.'; },
        shared: function (r) { var c = search(r, function (r) { return { p: r.int(10, 40), q: r.int(15, 60) }; }, function (c) { var x = TR.atan(c.q / c.p); return Math.abs(x - 45) > 3 && safe(x, 0) && x > 12 && x < 78; }); c.nm = r.pick(NAMESETS); return c; },
        parts: [
          { id: 'e5a', level: 'BEG', make: function (r, s) { var N = s.nm; return sidePart(r, { kind: 'oa', n: s.q, d: s.p, dp: 0, ang: vtxLab(N[0]), nm: [N[0], N[2], N[1]], prompt: 'Determine ' + t('\\angle ' + N[0]) + ' from the side lengths, to the nearest degree.' }); } },
          { id: 'e5b', level: 'BEG', make: function (r, s) { var N = s.nm; return sidePart(r, { kind: 'oa', n: s.p, d: s.q, dp: 0, ang: vtxLab(N[2]), nm: [N[2], N[0], N[1]], prompt: 'Determine ' + t('\\angle ' + N[2]) + ' from the side lengths — <b>not</b> by subtracting from ' + t('90^{\\circ}') + '.' }); } },
          { id: 'e5c', level: 'EMG', make: function (r, s) {
            return mc(r, 'Your two angles add to ' + t('90^{\\circ}') + '. Why is this check worth something here, but worth nothing if the second angle had been found by subtracting from ' + t('90^{\\circ}') + '?', [
              { html: 'Both angles were found <b>independently</b> from the sides, so a wrong ratio in either would almost surely make the total miss ' + t('90^{\\circ}') + '. A subtracted angle always totals ' + t('90^{\\circ}') + ', whatever the first one was.', right: true },
              { html: 'It is worth the same either way, since both methods give ' + t('90^{\\circ}') + '.', why: 'That is the problem: subtraction <b>can’t</b> give anything else, so it can’t catch a mistake.' },
              { html: 'Subtraction is less accurate, so its total would be off.', why: 'At the nearest degree subtraction is accurate. Its weakness is that it can’t disagree with the first answer.' },
              { html: 'The check only works when the triangle is isosceles.', why: 'The two acute angles of every right triangle add to ' + t('90^{\\circ}') + '.' }],
              'Two independent trips through the side names can disagree if one is wrong, so agreement is real evidence. An angle made by subtraction is built from the first answer, so the total reads ' + t('90^{\\circ}') + ' no matter what — a check that can’t fail isn’t a check.', [], 'value of 90 check');
          } }] },
      { num: '6', stem: function (sh) { return 'A surveyor measures all three sides of a right-angled plot and records ' + t('AB=' + sh.a) + ' m, ' + t('BC=' + sh.b) + ' m and ' + t('AC=' + sh.h) + ' m, each <b>to the nearest tenth of a metre</b>. The right angle is at ' + t('B') + '.' + sh.fig; },
        shared: function (r) {
          var c = search(r, function (r) { var a = r.int(30, 120) / 10, b = r.int(30, 120) / 10; return { a: a, b: b, h: rd(Math.sqrt(a * a + b * b), 1) }; }, function (c) {
            var A = TR.asin(c.b / c.h), C = TR.asin(c.a / c.h);
            return Math.abs(c.a - c.b) > 1 && Math.round(A) + Math.round(C) !== 90 && safe(A, 0, 0.05) && safe(C, 0, 0.05) && safe(TR.atan(c.b / c.a), 0, 0.05) && c.b / c.h < 1 && c.a / c.h < 1;
          }, 4000);
          c.fig = triFig(r, { opp: c.b, adj: c.a, lab: { opp: c.b + ' m', adj: c.a + ' m', hyp: c.h + ' m' }, nm: ['A', 'C', 'B'] }); return c;
        },
        parts: [
          { id: 'e6a', level: 'BEG', make: function (r, s) {
            var p = sidePart(r, { kind: 'oh', n: s.b, d: s.h, dp: 0, ang: vtxLab('A'), noFig: true, prompt: 'Using the hypotenuse and the side <b>opposite</b> the angle, determine ' + t('\\angle A') + ' to the nearest degree.', extraAlts: [{ v: TR.atan(s.b / s.a), code: 'wrong-ratio', hint: 'This part asks you to use the side <b>opposite</b> ' + t('\\angle A') + ' and the hypotenuse (SOH), not the two legs.' }] });
            return p;
          } },
          { id: 'e6b', level: 'BEG', make: function (r, s) { return sidePart(r, { kind: 'oh', n: s.a, d: s.h, dp: 0, ang: vtxLab('C'), noFig: true, prompt: 'By the same method (opposite and hypotenuse), determine ' + t('\\angle C') + ' to the nearest degree.', extraAlts: [{ v: TR.atan(s.a / s.b), code: 'wrong-ratio', hint: 'Use the side <b>opposite</b> ' + t('\\angle C') + ' and the hypotenuse (SOH), as the question says.' }] }); } },
          { id: 'e6c', level: 'PRG', make: function (r, s) {
            var A = Math.round(TR.asin(s.b / s.h)), C = Math.round(TR.asin(s.a / s.h)), tot = A + C, ex = Math.sqrt(s.a * s.a + s.b * s.b);
            return mc(r, 'Using opposite and hypotenuse, ' + t('\\angle A\\approx ' + A + '^{\\circ}') + ' and ' + t('\\angle C\\approx ' + C + '^{\\circ}') + ', which add to ' + t(tot + '^{\\circ}') + ', not ' + t('90^{\\circ}') + '. Which statement is correct?', [
              { html: 'Neither answer is wrong: the three rounded measurements don’t describe an exactly right triangle (' + t(s.a + '^{2}+' + s.b + '^{2}=' + rd(s.a * s.a + s.b * s.b, 2) + '\\ne ' + rd(s.h * s.h, 2)) + '), and each angle used a different pair of them.', right: true },
              { html: 'One of the two angles must have been calculated with the wrong ratio.', why: 'Both used opposite and hypotenuse correctly. Test the data: does ' + t(s.a + '^{2}+' + s.b + '^{2}') + ' equal ' + t(s.h + '^{2}') + '?' },
              { html: 'The calculator rounds ' + t('\\sin^{-1}') + ' values, which causes the error.', why: 'The calculator is accurate to many digits. The issue is in the measurements themselves.' },
              { html: 'Two exact angles that add to ' + t('90^{\\circ}') + ' often round to ' + t(tot + '^{\\circ}') + '.', why: 'Two exact angles that add to ' + t('90^{\\circ}') + ' have decimal parts that add to 1, so exactly one rounds up — the rounded pair still totals ' + t('90^{\\circ}') + '.' }],
              t(s.a + '^{2}+' + s.b + '^{2}=' + rd(s.a * s.a + s.b * s.b, 2)) + ' and ' + t('\\sqrt{' + rd(s.a * s.a + s.b * s.b, 2) + '}=' + ex.toFixed(4)) + ', not ' + t(s.h) + ': the rounded measurements don’t form an exactly right triangle, so (a) and (b) worked in slightly different triangles. Two exact complementary angles would round to a pair totalling ' + t('90^{\\circ}') + ' (one rounds up, one down). The ' + t(tot + '^{\\circ}') + ' is measurement error becoming visible.', ['Test the data with the Pythagorean theorem.'], 'measured sides inconsistent');
          } },
          { id: 'e6d', level: 'EMG', make: function (r, s) {
            var A = TR.atan(s.b / s.a), C = TR.atan(s.a / s.b);
            var cA = degWrap({ check: K.near(A, 0, { alts: [{ v: C, code: 'ratio-flip', hint: 'From ' + t('\\angle A') + ', ' + t('BC') + ' is opposite and ' + t('AB') + ' is adjacent.' }, { v: TR.asin(s.b / s.h), code: 'wrong-ratio', hint: 'Use only the two legs this time (TOA).' }] }) }).check;
            var cC = degWrap({ check: K.near(C, 0, { alts: [{ v: A, code: 'ratio-flip', hint: 'From ' + t('\\angle C') + ', ' + t('AB') + ' is opposite and ' + t('BC') + ' is adjacent.' }, { v: TR.asin(s.a / s.h), code: 'wrong-ratio', hint: 'Use only the two legs this time (TOA).' }] }) }).check;
            var p = K.P.fields('Now recompute both angles using <b>only the two legs</b>, ' + t(s.a) + ' m and ' + t(s.b) + ' m, to the nearest degree.', [{ label: t('\\angle A='), after: '°' }, { label: t('\\angle C='), after: '°' }], [cA, cC],
              [fx(A, 0), fx(C, 0)], t('\\angle A=' + deg(A, 0)) + ', ' + t('\\angle C=' + deg(C, 0)),
              'Two legs: TOA.<br>' + t('\\angle A=\\tan^{-1}\\left(' + frac(s.b, s.a) + '\\right)=' + A.toFixed(4) + '^{\\circ}\\approx ' + deg(A, 0)) + '<br>' + t('\\angle C=\\tan^{-1}\\left(' + frac(s.a, s.b) + '\\right)=' + C.toFixed(4) + '^{\\circ}\\approx ' + deg(C, 0)) + '<br>' + t(fx(A, 0) + '^{\\circ}+' + fx(C, 0) + '^{\\circ}=90^{\\circ}') + ' ✓. Two legs fix exactly one right triangle, so there is no third measurement to disagree with them.',
              ['From ' + t('\\angle A') + ': ' + t('BC') + ' is opposite and ' + t('AB') + ' is adjacent.'], 'angles from legs ' + s.a + ', ' + s.b);
            return p;
          } }] },
      { num: '7', stem: function (sh) { return 'In right triangle ' + t(sh.nm.join('')) + ' the right angle is at ' + t(sh.nm[1]) + ', with ' + t(sh.nm[0] + sh.nm[1] + '=' + sh.leg) + ' and ' + t(sh.nm[0] + sh.nm[2] + '=' + sh.hyp) + '.'; },
        shared: function (r) { var c = search(r, function (r) { var l = r.int(10, 40); return { leg: l, hyp: r.int(l + 6, 70) }; }, function (c) { var x = TR.asin(c.leg / c.hyp); return x > 12 && x < 78 && Math.abs(x - 45) > 3 && safe(x, 0) && Math.abs(TR.atan(c.leg / c.hyp) - x) > 1.5; }); c.nm = r.pick(NAMESETS); return c; },
        parts: [
          { id: 'e7a', level: 'BEG', make: function (r, s) { var N = s.nm; return sidePart(r, { kind: 'oh', n: s.leg, d: s.hyp, dp: 0, ang: vtxLab(N[2]), nm: [N[2], N[0], N[1]], prompt: 'Determine ' + t('\\angle ' + N[2]) + ' to the nearest degree.' }); } },
          { id: 'e7b', level: 'BEG', make: function (r, s) { var N = s.nm; return sidePart(r, { kind: 'ah', n: s.leg, d: s.hyp, dp: 0, ang: vtxLab(N[0]), nm: [N[0], N[2], N[1]], prompt: 'Determine ' + t('\\angle ' + N[0]) + ' from the side lengths, to the nearest degree.' }); } },
          { id: 'e7c', level: 'EMG', make: function (r, s) {
            var N = s.nm, wrongF = TR.atan(s.leg / s.hyp);
            return mc(r, 'You can find ' + t('\\angle ' + N[0]) + ' from the side lengths or by subtracting ' + t('\\angle ' + N[2]) + ' from ' + t('90^{\\circ}') + '. Which one is a genuine <b>check</b> on ' + t('\\angle ' + N[2]) + '?', [
              { html: 'The side-length method: it never uses ' + t('\\angle ' + N[2]) + '. Subtraction would copy a mistake — if ' + t('\\angle ' + N[2]) + ' had wrongly been ' + t('\\tan^{-1}\\left(' + frac(s.leg, s.hyp) + '\\right)=' + wrongF.toFixed(2) + '^{\\circ}') + ', subtraction gives ' + t((90 - wrongF).toFixed(2) + '^{\\circ}') + ' and the pair still totals ' + t('90^{\\circ}') + '.', right: true },
              { html: 'Subtraction, because it always gives a total of exactly ' + t('90^{\\circ}') + '.', why: 'Always giving ' + t('90^{\\circ}') + ' is exactly why it can’t catch anything.' },
              { html: 'Both are genuine checks, because they agree.', why: 'Subtraction is built out of the answer it is checking, so it will agree even with a wrong answer.' },
              { html: 'Neither — only measuring with a protractor checks an angle.', why: 'An independent calculation from the sides is a real check.' }],
              'The side-length route reaches ' + t('\\angle ' + N[0]) + ' without touching ' + t('\\angle ' + N[2]) + ', so agreement is real evidence. Subtraction is built from ' + t('\\angle ' + N[2]) + ' and will happily copy a mistake.', [], 'which method checks');
          } },
          { id: 'e7d', level: 'EMG', make: function (r, s) {
            var x = TR.asin(s.leg / s.hyp);
            return mc(r, 'Is the subtraction method ever <b>inaccurate</b> at the nearest degree?', [
              { html: 'No (except for an exact half-degree): the decimal parts of ' + t('\\theta') + ' and ' + t('90^{\\circ}-\\theta') + ' add to 1, so exactly one rounds up, and ' + t('90-\\text{round}(\\theta)=\\text{round}(90-\\theta)') + '.', right: true },
              { html: 'Yes — subtracting a rounded angle always loses accuracy.', why: 'Test it: ' + t(x.toFixed(2) + '^{\\circ}\\approx ' + Math.round(x) + '^{\\circ}') + ', and ' + t('90-' + Math.round(x) + '=' + (90 - Math.round(x))) + ', while ' + t((90 - x).toFixed(2) + '^{\\circ}\\approx ' + Math.round(90 - x) + '^{\\circ}') + '. Same answer.' },
              { html: 'Yes — whenever the angle is greater than ' + t('45^{\\circ}') + '.', why: 'Size has nothing to do with it. Think about how the decimal parts of the two angles add up.' },
              { html: 'No, because calculators never round.', why: 'Right verdict, wrong reason: we round the answer ourselves. The reason is about the decimal parts adding to 1.' }],
              'At the nearest degree subtraction is arithmetically safe. The objection to subtracting is about <b>checking</b>, not accuracy: it gives the right number but no new information.', [], 'subtraction accuracy');
          } }] },
      { num: '8', stem: '<i>(Numerical Response)</i>', parts: [
        { id: 'e8', level: 'EMG', make: function (r) {
          var c = search(r, function (r) { return { p: r.int(8, 30), q: r.int(35, 80) }; }, function (c) { return safe(TR.atan(c.q / c.p), 0); });
          var x = TR.atan(c.q / c.p);
          var p = near('A right triangle has legs of length ' + t(c.p) + ' and ' + t(c.q) + '. To the nearest degree, the measure of its <b>larger</b> acute angle is ________. (Record your answer as three digits, e.g. 006.)', x, 0,
            [{ v: TR.atan(c.p / c.q), code: 'smaller-angle', hint: 'That is the <b>smaller</b> acute angle. The larger angle faces the longer leg, ' + t(c.q) + '.' }].concat(sideAlts('oa', c.q, c.p, '\\theta', String(c.q), String(c.p), 0)),
            'The larger acute angle faces the longer leg, ' + t(c.q) + '. From it, ' + t(c.q) + ' is opposite and ' + t(c.p) + ' is adjacent ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\tan^{-1}\\left(' + frac(c.q, c.p) + '\\right)=' + x.toFixed(4) + '^{\\circ}\\approx ' + deg(x, 0)) + '. Recorded as three digits: <b>0' + Math.round(x) + '</b>.',
            ['The larger angle is across from the longer leg.'], 'larger angle legs ' + c.p + ', ' + c.q, { nr: true, unit: '' });
          p.answer = t('0' + Math.round(x)); p.good = ['0' + Math.round(x)]; return p;
        } }] },
      /* ---------------- Part C ---------------- */
      { num: '9', section: 'Extra practice C — When Pythagoras comes first (and when it is a trap)',
        stem: function (sh) { return 'In right triangle ' + t('ABC') + ' the right angle is at ' + t('C') + ', with ' + t('BC=' + sh.a) + ' and ' + t('AC=' + sh.b) + '.'; },
        shared: function (r) { var tr = r.pick(TRIPLES.filter(function (q) { return q[2] >= 13 && Math.abs(TR.atan(q[0] / q[1]) - 45) > 1.2; })), sw = r.chance(0.5); return { a: sw ? tr[1] : tr[0], b: sw ? tr[0] : tr[1], c: tr[2] }; },
        parts: [
          { id: 'e9a', level: 'BEG', make: function (r, s) {
            var p = K.P.number('Determine ' + t('AB') + ' exactly.', s.c, function (v) { if (Math.abs(v - Math.sqrt(Math.abs(s.a * s.a - s.b * s.b))) < 0.06) return { code: 'pyth-sub', hint: t('AB') + ' faces the right angle at ' + t('C') + ': it is the hypotenuse, so <b>add</b> the squares of the legs.' }; if (v === s.a * s.a + s.b * s.b) return { code: 'no-root', hint: 'That is ' + t('AB^{2}') + '. Take the square root.' }; if (v === s.a + s.b) return { code: 'pyth-sub', hint: 'Add the <b>squares</b>, then take the square root.' }; return null; },
              t('AB^{2}=' + s.a + '^{2}+' + s.b + '^{2}=' + (s.a * s.a + s.b * s.b)) + ', so ' + t('AB=\\sqrt{' + (s.a * s.a + s.b * s.b) + '}=' + s.c) + '.', ['The hypotenuse faces the right angle.'], 'hypotenuse ' + s.a + ', ' + s.b, { before: t('AB=') });
            p.bad = [String(s.a + s.b), String(s.a * s.a + s.b * s.b)]; return p;
          } },
          { id: 'e9b', level: 'BEG', make: function (r, s) {
            var p = sidePart(r, { kind: 'oa', n: s.a, d: s.b, dp: 0, ang: vtxLab('A'), nm: ['A', 'B', 'C'], prompt: 'Determine ' + t('\\angle A') + ' to the nearest degree (any of ' + t('\\tan^{-1}') + ', ' + t('\\sin^{-1}') + ' with ' + t('AB=' + s.c) + ', or ' + t('\\cos^{-1}') + ' gives the same angle).' });
            p.solution += '<br>Also ' + t('\\sin^{-1}\\left(' + frac(s.a, s.c) + '\\right)') + ' and ' + t('\\cos^{-1}\\left(' + frac(s.b, s.c) + '\\right)') + ' give the same ' + t(TR.atan(s.a / s.b).toFixed(4) + '^{\\circ}') + '.';
            return p;
          } },
          { id: 'e9c', level: 'EMG', make: function (r, s) {
            return mc(r, '<b>Verdict.</b> You can find ' + t('\\angle A') + ' with ' + t('\\tan^{-1}') + ', ' + t('\\sin^{-1}') + ' or ' + t('\\cos^{-1}') + '. Which route is the least work, and why?', [
              { html: t('\\tan^{-1}') + ': the two given sides are the legs, exactly what TOA needs. Sine and cosine both needed ' + t('AB') + ' from Pythagoras first.', right: true },
              { html: t('\\sin^{-1}') + ': sine is the most accurate ratio.', why: 'All three give the same angle. Count the steps: which route needs no third side?' },
              { html: t('\\cos^{-1}') + ': because ' + t('AB') + ' came out a whole number.', why: 'It still needed the Pythagoras step first. Which route uses only the given sides?' },
              { html: 'All three are equally short.', why: 'Sine and cosine both need the hypotenuse, which wasn’t given.' }],
              'The tangent route answers in one line from the given legs. The sine and cosine routes needed ' + t('AB') + ' first — extra work, an extra place to slip, and (if ' + t('AB') + ' were irrational) a number to carry exactly.', [], 'least-work route');
          } },
          { id: 'e9d', level: 'BEG', make: function (r, s) { var p = sidePart(r, { kind: 'oa', n: s.b, d: s.a, dp: 0, ang: vtxLab('B'), nm: ['B', 'A', 'C'], prompt: 'Determine ' + t('\\angle B') + ' to the nearest degree, then check that the two acute angles add to ' + t('90^{\\circ}') + '.' }); p.solution += '<br>Check: ' + t(Math.round(TR.atan(s.a / s.b)) + '^{\\circ}+' + Math.round(TR.atan(s.b / s.a)) + '^{\\circ}=90^{\\circ}') + ' ✓'; return p; } }] },
      { num: '10', stem: function (sh) { return 'In right triangle ' + t('RST') + ' the right angle is at ' + t('S') + ', with ' + t('RS=' + sh.a) + ' and ' + t('RT=' + sh.h) + '.'; },
        shared: function (r) {
          return search(r, function (r) { var a = r.int(6, 40); return { a: a, h: r.int(a + 2, a + 22) }; }, function (s) {
            var m = s.h * s.h - s.a * s.a, k = 1; for (var i = 2; i * i <= m; i++) if (m % (i * i) === 0) k = i;
            if (k === 1 || k * k === m) return false; s.k = k; s.m = m / (k * k); s.st = Math.sqrt(m);
            var T = TR.asin(s.a / s.h), T2 = TR.atan(s.a / rd(s.st, 1));
            return safe(T, 0, 0.015) && safe(T2, 0, 0.02) && Math.round(T) !== Math.round(T2) && Math.abs(T - 45) > 2;
          }, 6000);
        },
        parts: [
          { id: 'e10a', level: 'BEG', make: function (r, s) { return sidePart(r, { kind: 'oh', n: s.a, d: s.h, dp: 0, ang: vtxLab('T'), nm: ['T', 'R', 'S'], prompt: 'Determine ' + t('\\angle T') + ' directly from the two given sides, to the nearest degree.' }); } },
          { id: 'e10b', level: 'BEG', make: function (r, s) { var p = sidePart(r, { kind: 'ah', n: s.a, d: s.h, dp: 0, ang: vtxLab('R'), nm: ['R', 'T', 'S'], prompt: 'Determine ' + t('\\angle R') + ' directly from the two given sides, to the nearest degree.' }); p.solution += '<br>Check: ' + t(Math.round(TR.asin(s.a / s.h)) + '^{\\circ}+' + Math.round(TR.acos(s.a / s.h)) + '^{\\circ}=90^{\\circ}') + ' ✓'; return p; } },
          { id: 'e10c', level: 'EMG', make: function (r, s) {
            var M = s.h * s.h - s.a * s.a;
            var p = K.P.radical('Now take the long road: determine ' + t('ST') + ' with the Pythagorean theorem as an <b>exact radical in simplest form</b>.', { k: s.k, n: 2, m: s.m }, 'mixed',
              t('ST^{2}=' + s.h + '^{2}-' + s.a + '^{2}=' + M) + '<br>' + t('ST=\\sqrt{' + M + '}=\\sqrt{' + (s.k * s.k) + '\\times ' + s.m + '}=' + s.k + '\\sqrt{' + s.m + '}\\ (\\approx ' + s.st.toFixed(4) + ')') + '<br>Then ' + t('\\angle T=\\tan^{-1}\\left(' + frac(s.a, s.k + '\\sqrt{' + s.m + '}') + '\\right)=' + TR.asin(s.a / s.h).toFixed(4) + '^{\\circ}') + ', the same as before.',
              [t('ST^{2}=RT^{2}-RS^{2}') + ' (' + t('RT') + ' is the hypotenuse).', 'Look for the largest perfect square factor of ' + t(M) + '.'], 'ST exact', { before: t('ST=') });
            p.good = [s.k + '\\sqrt{' + s.m + '}']; p.bad = ['\\sqrt{' + M + '}', String(rd(s.st, 1))]; return p;
          } },
          { id: 'e10d', level: 'EMG', make: function (r, s) {
            var st1 = rd(s.st, 1), x = TR.atan(s.a / st1), good = TR.asin(s.a / s.h);
            return near('Repeat the long road, but this time round ' + t('ST') + ' to the nearest tenth <b>before</b> using ' + t('\\tan^{-1}') + '. What angle ' + t('T') + ' do you get, to the nearest degree?', x, 0,
              [{ v: good, code: 'not-rounded', hint: 'That is the accurate angle. This part asks what happens if ' + t('ST') + ' is first rounded to ' + t(st1) + '.' }, { v: TR.atan(st1 / s.a), code: 'ratio-flip', hint: 'From ' + t('\\angle T') + ', ' + t('RS') + ' is opposite and ' + t('ST') + ' is adjacent.' }],
              'Rounding first: ' + t('ST\\approx ' + st1) + '.<br>' + t('\\angle T=\\tan^{-1}\\left(' + frac(s.a, st1) + '\\right)=' + x.toFixed(4) + '^{\\circ}\\approx ' + deg(x, 0)) + ' — <b>wrong by a whole degree</b>: the exact angle is ' + t(good.toFixed(4) + '^{\\circ}\\approx ' + deg(good, 0)) + '. Rounding the third side pushed the angle across a rounding boundary.',
              ['Use ' + t('ST\\approx ' + st1) + ' as the adjacent side and ' + t('RS=' + s.a) + ' as the opposite side.'], 'rounded ST then angle', { before: t('\\angle T\\approx') });
          } },
          { id: 'e10e', level: 'EMG', make: function (r, s) {
            return mc(r, '<b>Verdict.</b> Which route to ' + t('\\angle T') + ' was the least work, and what does rounding ' + t('ST') + ' early show?', [
              { html: 'Sine straight from the two given sides (a leg and the hypotenuse) — one line. The Pythagoras route added a step, and rounding its irrational result early moved the answer by a degree.', right: true },
              { html: 'The Pythagoras route, because it gives an exact radical.', why: 'Exact, yes — but it was a whole extra step that wasn’t needed.' },
              { html: 'Rounding ' + t('ST') + ' first, because it makes the calculation easier.', why: 'Easier, but it gave the wrong answer (off by a degree).' },
              { html: 'All routes are equal, and early rounding never matters.', why: 'Compare your answers: the rounded route was off by a whole degree.' }],
              'The given sides were a leg and the hypotenuse — exactly what SOH (or CAH for ' + t('\\angle R') + ') needs. Pythagoras added a step that was never needed, and rounding its result on the way through shifted the final answer. If a third side must be found, carry it exactly and round only at the end.', [], 'route verdict');
          } }] },
      /* ---------------- Part D ---------------- */
      { num: '11', section: 'Extra practice D — Applied: draw the triangle yourself', stem: function (sh) { return 'A loading ramp rises a vertical height of ' + t(sh.h) + ' m. Sketch each situation first.'; },
        shared: function (r) { return search(r, function (r) { return { h: r.int(8, 16) / 10, L: r.int(30, 65) / 10 }; }, function (s) { var a = TR.atan(s.h / s.L), b = TR.asin(s.h / s.L); return Math.round(a) !== Math.round(b) && safe(a, 0, 0.05) && safe(b, 0, 0.05); }, 3000); },
        parts: [
          { id: 'e11a', level: 'EMG', make: function (r, s) {
            var x = TR.atan(s.h / s.L);
            return near('The ramp covers a <b>horizontal run</b> of ' + t(s.L) + ' m. Determine the angle the ramp makes with the ground, to the nearest degree.', x, 0,
              [{ v: TR.asin(s.h / s.L), code: 'used-sin', hint: 'Here ' + t(s.L) + ' m is the <b>horizontal run</b>, which touches the angle (adjacent), not the sloped surface. Use TOA.' }].concat(sideAlts('oa', s.h, s.L, '\\theta', String(s.h), String(s.L), 0)),
              'Rise ' + t(s.h) + ' is OPPOSITE, horizontal run ' + t(s.L) + ' is ADJACENT ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\theta=\\tan^{-1}\\left(' + frac(s.h, s.L) + '\\right)=' + x.toFixed(4) + '^{\\circ}\\approx ' + deg(x, 0)),
              ['Sketch: vertical rise, horizontal run along the ground, ramp as the sloping side.'], 'ramp run', { before: t('\\theta=') });
          } },
          { id: 'e11b', level: 'EMG', make: function (r, s) {
            var x = TR.asin(s.h / s.L);
            return near('A second ramp also rises ' + t(s.h) + ' m, but this time ' + t(s.L) + ' m is the length of the <b>sloped ramp surface itself</b>. Determine its angle with the ground, to the nearest degree.', x, 0,
              sideAlts('oh', s.h, s.L, '\\theta', String(s.h), String(s.L), 0),
              'Rise ' + t(s.h) + ' is OPPOSITE, ramp surface ' + t(s.L) + ' is the HYPOTENUSE ' + t('\\Rightarrow') + ' SOH.<br>' + t('\\theta=\\sin^{-1}\\left(' + frac(s.h, s.L) + '\\right)=' + x.toFixed(4) + '^{\\circ}\\approx ' + deg(x, 0)),
              ['The sloped surface is the side facing the right angle.'], 'ramp surface', { before: t('\\theta=') });
          } },
          { id: 'e11c', level: 'EMG', make: function (r, s) {
            var run2 = Math.sqrt(s.L * s.L - s.h * s.h);
            return mc(r, 'The ramp with the ' + t(s.L) + ' m <b>sloped surface</b> came out steeper than the one with the ' + t(s.L) + ' m <b>horizontal run</b>. Why, from the geometry?', [
              { html: 'A sloped surface is longer than its own horizontal run, so the second ramp gains the same rise over a shorter run (' + t('\\approx ' + run2.toFixed(2)) + ' m) — steeper.', right: true },
              { html: 'Sine values are always bigger than tangent values.', why: 'For the same angle, ' + t('\\tan\\theta>\\sin\\theta') + '. Think about the horizontal distance each ramp covers.' },
              { html: 'The second ramp has a greater rise.', why: 'Both ramps rise ' + t(s.h) + ' m.' },
              { html: 'It isn’t really steeper; the difference is rounding.', why: 'The unrounded angles differ too. Compare the horizontal runs.' }],
              'In the first ramp the known sides were rise (opp) and run (adj): <b>tangent</b>. In the second they were rise (opp) and the sloped surface (hyp): <b>sine</b>. The second ramp’s horizontal run is only ' + t('\\sqrt{' + s.L + '^{2}-' + s.h + '^{2}}\\approx ' + run2.toFixed(4)) + ' m, so the same rise over a shorter base is steeper.', [], 'why steeper');
          } }] },
      { num: '12', stem: 'Roofers describe a roof by its <b>pitch</b>: a “7 in 12” roof rises ' + t('7') + ' inches vertically for every ' + t('12') + ' inches of horizontal run.',
        shared: function (r) { return search(r, function (r) { return { p: r.int(3, 11), q: r.int(2, 5), phi: r.int(25, 55) }; }, function (s) { return s.p !== s.q && s.p !== 2 * s.q && safe(TR.atan(s.p / 12), 0) && safe(TR.atan(s.q / 12), 0) && safe(TR.atan(2 * s.q / 12), 0) && safe(12 * TR.tan(s.phi), 1) && Math.round(TR.atan(2 * s.q / 12)) !== Math.round(2 * TR.atan(s.q / 12)); }); },
        parts: [
          { id: 'e12a', level: 'BEG', make: function (r, s) { return pitchPart(s.p); } },
          { id: 'e12b', sub: 'b i', level: 'BEG', make: function (r, s) { return pitchPart(s.q); } },
          { id: 'e12c', sub: 'b ii', level: 'LIM', make: function (r) {
            var p = K.P.number('Which pitch gives a roof angle of exactly ' + t('45^{\\circ}') + '? Complete: “___ in 12”.', 12, function (v) { if (v === 45) return { code: 'grade-angle', hint: 'The pitch is a rise per ' + t('12') + ' of run, not the angle. For ' + t('45^{\\circ}') + ', ' + t('\\tan 45^{\\circ}=1') + ', so rise = run.' }; if (v === 1) return { code: 'value', hint: t('\\tan 45^{\\circ}=1') + ' means rise = run. The run is ' + t('12') + ' inches.' }; return null; },
              'For ' + t('45^{\\circ}') + ', ' + t('\\tan 45^{\\circ}=1') + ', so opposite = adjacent: the rise must equal the run. A <b>12 in 12</b> pitch.', ['What is ' + t('\\tan 45^{\\circ}') + '?'], 'pitch for 45', { after: 'in 12' });
            p.bad = ['45', '1']; return p;
          } },
          { id: 'e12d', sub: 'c', level: 'EMG', make: function (r, s) {
            var x = 12 * TR.tan(s.phi);
            return near('An architect specifies a roof angle of ' + t(s.phi + '^{\\circ}') + '. Determine the rise per ' + t('12') + ' inches of run, to the nearest tenth of an inch.', x, 1,
              [{ v: 12 * TR.sin(s.phi), code: 'wrong-ratio', hint: 'The ' + t('12') + ' inches is the horizontal run (adjacent), and the rise is opposite: use tangent.' }, { v: 12 / TR.tan(s.phi), code: 'ratio-flip', hint: t('\\tan ' + s.phi + '^{\\circ}=\\frac{\\text{rise}}{12}') + ', so <b>multiply</b>: rise ' + t('=12\\tan ' + s.phi + '^{\\circ}') + '.' },
                { v: 12 * Math.tan(s.phi), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode.' }, { v: 12 * TR.atan(s.phi), code: 'inverse-used', hint: 'The angle is known here, so use ' + t('\\tan') + ' forwards, not ' + t('\\tan^{-1}') + '.' }],
              'The angle is known and the rise is wanted, so the ratio is used forwards.<br>' + t('\\tan ' + s.phi + '^{\\circ}=\\frac{\\text{rise}}{12}\\Rightarrow\\text{rise}=12\\tan ' + s.phi + '^{\\circ}=' + x.toFixed(4) + '\\approx ' + fx(x, 1)) + ' inches per ' + t('12') + ' inches of run.',
              ['Rise is opposite the angle; the 12 inches of run is adjacent.'], 'rise for angle ' + s.phi, { unit: 'in' });
          } },
          { id: 'e12e', sub: 'd i', level: 'BEG', make: function (r, s) { var p = pitchPart(2 * s.q); p.prompt = 'Doubling the pitch from “' + s.q + ' in 12” to “' + (2 * s.q) + ' in 12”: determine the angle of the ' + (2 * s.q) + ' in 12 roof to the nearest degree.'; return p; } },
          { id: 'e12f', sub: 'd ii', level: 'EMG', make: function (r, s) {
            var a = TR.atan(s.q / 12), b = TR.atan(2 * s.q / 12);
            return mc(r, 'A “' + s.q + ' in 12” roof is ' + t(a.toFixed(2) + '^{\\circ}') + ' and ' + an(2 * s.q) + ' “' + (2 * s.q) + ' in 12” roof is ' + t(b.toFixed(2) + '^{\\circ}') + '. Does doubling the pitch double the angle?', [
              { html: 'No — the angle is less than double (' + t('2\\times ' + a.toFixed(2) + '^{\\circ}=' + (2 * a).toFixed(2) + '^{\\circ}') + '). ' + t('\\tan^{-1}') + ' is not proportional: each extra unit of rise adds less angle.', right: true },
              { html: 'Yes — angle and pitch are proportional.', why: 'Compare: ' + t('2\\times ' + a.toFixed(2) + '^{\\circ}=' + (2 * a).toFixed(2) + '^{\\circ}') + ', but the steeper roof is ' + t(b.toFixed(2) + '^{\\circ}') + '.' },
              { html: 'No — the angle more than doubles.', why: 'Compare ' + t(b.toFixed(2) + '^{\\circ}') + ' with ' + t((2 * a).toFixed(2) + '^{\\circ}') + '. Which is bigger?' },
              { html: 'Yes, but only for pitches less than 12 in 12.', why: 'Even for small pitches the angles don’t double exactly: ' + t(b.toFixed(2) + '^{\\circ}\\ne ' + (2 * a).toFixed(2) + '^{\\circ}') + '.' }],
              'Twice ' + t(a.toFixed(2) + '^{\\circ}') + ' is ' + t((2 * a).toFixed(2) + '^{\\circ}') + ', but the ' + (2 * s.q) + ' in 12 roof is only ' + t(b.toFixed(2) + '^{\\circ}') + '. The angle is ' + t('\\tan^{-1}') + ' of the pitch, which grows more and more slowly — it can never reach ' + t('90^{\\circ}') + ', so it can’t keep doubling.', [], 'pitch doubling');
          } }] },
      { num: '13', stem: function (sh) { return An(sh.L) + ' ' + t(sh.L) + ' m ladder leans against a vertical wall with its foot ' + t(sh.d) + ' m from the base of the wall. Safety guidance says a leaning ladder should sit between ' + t('70^{\\circ}') + ' and ' + t('80^{\\circ}') + ' to the ground.'; },
        shared: function (r) { return search(r, function (r) { var L = r.int(50, 80) / 10; return { L: L, d: r.int(Math.round(L * 1.2), Math.round(L * 4.2)) / 10, phi: r.int(71, 79) }; }, function (s) { var x = TR.acos(s.d / s.L); return safe(x, 0) && Math.abs(x - 70) > 1 && Math.abs(x - 80) > 1 && x > 62 && x < 86 && Math.abs(x - s.phi) > 1.5 && safe(Math.sqrt(s.L * s.L - s.d * s.d), 1) && safe(s.L * TR.cos(s.phi), 1); }); },
        parts: [
          { id: 'e13a', level: 'EMG', make: function (r, s) { var p = sidePart(r, { kind: 'ah', n: s.d, d: s.L, dp: 0, ang: ['θ', '\\theta', '\\theta'], noFig: true, prompt: 'Sketch and label the situation, then determine the angle the ladder makes with the ground, to the nearest degree.' }); p.solution = 'The ladder is the hypotenuse; the ' + t(s.d) + ' m along the ground touches the angle at the foot. ' + p.solution; return p; } },
          { id: 'e13b', level: 'BEG', make: function (r, s) {
            var hgt = Math.sqrt(s.L * s.L - s.d * s.d);
            return near('Determine how far up the wall the ladder reaches, to the nearest tenth of a metre.', hgt, 1,
              [{ v: Math.sqrt(s.L * s.L + s.d * s.d), code: 'pyth-add', hint: 'The ladder (' + t(s.L) + ' m) is the hypotenuse, so <b>subtract</b>: ' + t('h^{2}=' + s.L + '^{2}-' + s.d + '^{2}') + '.' }, { v: s.L - s.d, code: 'pyth-sub', hint: 'Subtract the <b>squares</b>, then take the square root.' }, { v: s.L * s.L - s.d * s.d, code: 'no-root', hint: 'That is ' + t('h^{2}') + '. Take the square root.' }],
              t('h^{2}+' + s.d + '^{2}=' + s.L + '^{2}') + '<br>' + t('h^{2}=' + rd(s.L * s.L, 2) + '-' + rd(s.d * s.d, 2) + '=' + rd(s.L * s.L - s.d * s.d, 4)) + '<br>' + t('h=' + hgt.toFixed(4) + '\\approx ' + fx(hgt, 1)) + ' m up the wall.',
              ['The ladder is the hypotenuse.'], 'ladder height', { unit: 'm' });
          } },
          { id: 'e13c', level: 'BEG', make: function (r, s) {
            var x = TR.acos(s.d / s.L), okk = x >= 70 && x <= 80;
            var p = mc(r, 'The ladder makes an angle of about ' + t(Math.round(x) + '^{\\circ}') + ' with the ground. Does it meet the guidance?', [
              { html: 'Yes — ' + t(Math.round(x) + '^{\\circ}') + ' is between ' + t('70^{\\circ}') + ' and ' + t('80^{\\circ}') + '.', right: okk, why: okk ? null : t(Math.round(x) + '^{\\circ}') + ' is ' + (x < 70 ? 'less than ' + t('70^{\\circ}') + ' (too shallow — the foot could slide out)' : 'more than ' + t('80^{\\circ}') + ' (too steep — it could tip back)') + '.' },
              { html: 'No — ' + t(Math.round(x) + '^{\\circ}') + ' is outside ' + t('70^{\\circ}') + ' to ' + t('80^{\\circ}') + '.', right: !okk, why: okk ? 'Check: is ' + t(Math.round(x)) + ' between ' + t('70') + ' and ' + t('80') + '?' : null }],
              okk ? 'This ladder meets the guidance: at ' + t(Math.round(x) + '^{\\circ}') + ' it sits inside the range.' : 'This ladder does not meet the guidance: ' + t(Math.round(x) + '^{\\circ}') + ' is outside ' + t('70^{\\circ}') + '–' + t('80^{\\circ}') + '.', [], 'ladder verdict', true);
            p.tries = 1; p.input.columns = 2; return p;
          } },
          { id: 'e13d', level: 'EMG', make: function (r, s) {
            var x = s.L * TR.cos(s.phi);
            return near('How far from the wall should the foot be placed for an angle of exactly ' + t(s.phi + '^{\\circ}') + '? Answer to the nearest tenth of a metre.', x, 1,
              [{ v: s.L * TR.sin(s.phi), code: 'wrong-ratio', hint: 'That is the height up the wall. The distance along the ground touches the ' + t(s.phi + '^{\\circ}') + ' angle: adjacent, so use cosine.' }, { v: s.L / TR.cos(s.phi), code: 'ratio-flip', hint: t('\\cos ' + s.phi + '^{\\circ}=\\frac{d}{' + s.L + '}') + ', so <b>multiply</b>: ' + t('d=' + s.L + '\\cos ' + s.phi + '^{\\circ}') + '.' }, { v: s.L * Math.cos(s.phi), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode.' }],
              t('\\cos ' + s.phi + '^{\\circ}=\\frac{d}{' + s.L + '}\\Rightarrow d=' + s.L + '\\cos ' + s.phi + '^{\\circ}=' + x.toFixed(4) + '\\approx ' + fx(x, 1)) + ' m from the wall.',
              ['The ladder is the hypotenuse; the distance from the wall is adjacent to the angle at the foot.'], 'foot distance for ' + s.phi, { unit: 'm' });
          } }] },
      { num: '14', stem: function (sh) { return 'A solar panel is ' + t(sh.P.toFixed(2)) + ' m long from its front edge to its back edge. It is mounted on a flat roof with the front edge resting on the roof and the back edge propped ' + t(sh.h.toFixed(2)) + ' m above the roof.'; },
        shared: function (r) { return search(r, function (r) { var P = r.int(120, 240) / 100; return { P: P, h: r.int(Math.round(P * 20), Math.round(P * 60)) / 100, phi: r.int(30, 60) }; }, function (s) { var x = TR.asin(s.h / s.P); return safe(x, 0) && Math.round(TR.atan(s.h / s.P)) !== Math.round(x) && safe(s.P * TR.sin(s.phi), 2); }); },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, s) { var p = sidePart(r, { kind: 'oh', n: s.h, d: s.P, dp: 0, ang: ['θ', '\\theta', '\\theta'], noFig: true, prompt: 'Sketch and label the situation, then determine the tilt angle of the panel from the horizontal, to the nearest degree.' }); return p; } },
          { id: 'e14b', level: 'BEG', make: function (r, s) {
            return mc(r, 'In your triangle, which side is the panel, and why does that force sine rather than tangent?', [
              { html: 'The <b>hypotenuse</b>: it faces the right angle where the prop meets the roof. With the prop (opposite) and the hypotenuse, SOH is the only ratio available.', right: true },
              { html: 'The <b>adjacent</b> side, because it lies along the roof.', why: 'The panel is tilted, not flat on the roof. The horizontal stretch of roof under it is the adjacent side — and that wasn’t given.' },
              { html: 'The <b>opposite</b> side, because it is across from the angle.', why: 'The prop is across from the tilt angle. The panel faces the right angle.' },
              { html: 'The <b>hypotenuse</b>, so tangent is the ratio to use.', why: 'Tangent pairs opposite and adjacent. The hypotenuse goes with sine or cosine.' }],
              'The panel runs from the front edge on the roof to the top of the prop; it faces the right angle at the foot of the prop, so it is the hypotenuse. Tangent would need the horizontal distance, which was never given. Using tangent on ' + t(frac(s.h.toFixed(2), s.P.toFixed(2))) + ' gives ' + t(TR.atan(s.h / s.P).toFixed(2) + '^{\\circ}') + ', the answer to a different question.', [], 'panel is hypotenuse');
          } },
          { id: 'e14c', level: 'EMG', make: function (r, s) {
            var x = s.P * TR.sin(s.phi);
            return near('For this latitude the recommended winter tilt is ' + t(s.phi + '^{\\circ}') + '. Determine, to the nearest hundredth of a metre, how high the back edge must be propped.', x, 2,
              [{ v: s.P * TR.cos(s.phi), code: 'wrong-ratio', hint: 'The prop is <b>opposite</b> the tilt angle, and the panel is the hypotenuse: use sine.' }, { v: s.P * TR.tan(s.phi), code: 'tan-hyp', hint: 'The panel is the hypotenuse, so use sine, not tangent.' }, { v: s.P / TR.sin(s.phi), code: 'ratio-flip', hint: t('\\sin ' + s.phi + '^{\\circ}=\\frac{h}{' + s.P.toFixed(2) + '}') + ', so <b>multiply</b>.' }, { v: s.P * Math.sin(s.phi), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode.' }],
              t('\\sin ' + s.phi + '^{\\circ}=\\frac{h}{' + s.P.toFixed(2) + '}\\Rightarrow h=' + s.P.toFixed(2) + '\\sin ' + s.phi + '^{\\circ}=' + x.toFixed(5) + '\\approx ' + fx(x, 2)) + ' m.',
              ['The panel is the hypotenuse; the prop height is opposite the tilt.'], 'prop height ' + s.phi, { unit: 'm' });
          } }] },
      { num: '15', stem: 'A road’s <b>% grade</b> is its vertical rise as a percentage of its horizontal run: a ' + t('9\\%') + ' grade rises ' + t('9') + ' m for every ' + t('100') + ' m of horizontal distance.',
        shared: function (r) { return search(r, function (r) { return { g: r.int(5, 12), a: r.int(3, 12) }; }, function (s) { return safe(TR.atan(s.g / 100), 0) && safe(TR.atan(2 * s.g / 100), 0) && safe(100 * TR.tan(s.a), 0); }); },
        parts: [
          { id: 'e15a', level: 'BEG', make: function (r, s) { return gradePart(s.g); } },
          { id: 'e15b', level: 'BEG', make: function (r, s) { return gradePart(2 * s.g); } },
          { id: 'e15c', level: 'EMG', make: function (r, s) {
            var a = TR.atan(s.g / 100), b = TR.atan(2 * s.g / 100);
            return mc(r, 'Unrounded, ' + an(s.g) + ' ' + t(s.g + '\\%') + ' grade is ' + t(a.toFixed(4) + '^{\\circ}') + ' and ' + an(2 * s.g) + ' ' + t((2 * s.g) + '\\%') + ' grade is ' + t(b.toFixed(4) + '^{\\circ}') + '. The grade doubled. Did the angle double?', [
              { html: 'Not quite: ' + t('2\\times ' + a.toFixed(4) + '^{\\circ}=' + (2 * a).toFixed(4) + '^{\\circ}') + '. For small grades the relationship is nearly proportional, but it fails badly for large grades (' + t('100\\%') + ' is ' + t('45^{\\circ}') + ').', right: true },
              { html: 'Yes, exactly — angle and grade are proportional.', why: 'Compare the unrounded values: ' + t((2 * a).toFixed(4)) + ' vs ' + t(b.toFixed(4)) + '.' },
              { html: 'No — the angle more than doubled.', why: 'Is ' + t(b.toFixed(4)) + ' more or less than ' + t((2 * a).toFixed(4)) + '?' },
              { html: 'Yes, and it keeps doubling: a ' + t('100\\%') + ' grade is ' + t('10') + ' times the ' + t('10\\%') + ' angle.', why: 'A ' + t('100\\%') + ' grade means rise = run, which is ' + t('45^{\\circ}') + ' — not ' + t('57^{\\circ}') + '.' }],
              'Doubling the angle would give ' + t((2 * a).toFixed(4) + '^{\\circ}') + ', but the ' + t((2 * s.g) + '\\%') + ' grade is ' + t(b.toFixed(4) + '^{\\circ}') + ' — close, not equal. “Double the grade, double the angle” is a fair rule of thumb only for gentle roads.', [], 'grade doubling');
          } },
          { id: 'e15d', level: 'EMG', make: function (r, s) {
            var x = 100 * TR.tan(s.a);
            var p = near('A sign warns of ' + an(s.a) + ' ' + t(s.a + '^{\\circ}') + ' descent ahead. Convert it to a % grade, to the nearest percent.', x, 0,
              [{ v: 100 * TR.sin(s.a), code: 'wrong-ratio', hint: 'Grade is rise over <b>horizontal</b> run: that is tangent.' }, { v: 100 * Math.tan(s.a), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode.' }, { v: TR.atan(s.a), code: 'inverse-used', hint: 'The angle is known here, so no inverse is needed: grade ' + t('=100\\tan ' + s.a + '^{\\circ}') + '.' }, { v: TR.tan(s.a), code: 'value', hint: 'That is the ratio as a decimal. Multiply by ' + t('100') + ' to make it a percent.' }],
              'The angle is known and the ratio is wanted, so no inverse is needed.<br>' + t('\\tan ' + s.a + '^{\\circ}=' + TR.tan(s.a).toFixed(6)) + ', so grade ' + t('=' + (100 * TR.tan(s.a)).toFixed(4) + '\\%\\approx ' + Math.round(x) + '\\%'),
              ['Grade = rise ÷ run × 100%, and rise ÷ run is the tangent of the angle.'], 'angle to grade ' + s.a, { unit: '%' });
            var c0 = p.check; // a typed % sign: nudge, like a typed unit
            p.check = function (resp) { var m = /^\s*(.*?)\s*\\?%\s*$/.exec(String(resp == null ? '' : resp)); if (m && HW.parse.number(m[1]).ok) return K.form('units', 'Leave the % sign out — just type the number (the % is already after the box).'); return c0(resp); };
            return p;
          } }] },
      { num: '16', stem: 'A building code requires that a wheelchair ramp make an angle of <b>no more than ' + t('4.8^{\\circ}') + '</b> with the ground. Give each angle to the <b>nearest hundredth of a degree</b>, and don’t round anything before you compare.',
        shared: function (r) {
          var A = search(r, function (r) { return { rise: r.int(10, 25), run: 50 * r.int(4, 8) }; }, function (c) { var x = TR.atan(c.rise / c.run); return x > 2.5 && x < 4.6 && safe(x, 2); });
          var B = search(r, function (r) { return { rise: r.int(15, 40), run: 50 * r.int(4, 8) }; }, function (c) { var x = TR.atan(c.rise / c.run), m = c.rise / TAN48; return x > 4.9 && x < 6.5 && safe(x, 2) && (m * 10 - Math.floor(m * 10)) < 0.45 && (m * 10 - Math.floor(m * 10)) > 0.02; });
          var C = r.pick(BORDER);
          return { A: A, B: B, C: { run: C[0], rise: C[1] } };
        },
        parts: [
          { id: 'e16a', level: 'BEG', make: function (r, s) { return rampPart('A', s.A, true); } },
          { id: 'e16b', level: 'BEG', make: function (r, s) { return rampPart('B', s.B, false); } },
          { id: 'e16c', sub: 'b ii', level: 'ADV', make: function (r, s) {
            var m = s.B.rise / TAN48, up = Math.ceil(m * 10 - 1e-9) / 10;
            return near('Ramp B (rise ' + t(s.B.rise) + ' cm) is too steep. Determine the <b>shortest</b> horizontal run that would make ' + an(s.B.rise) + ' ' + t(s.B.rise) + ' cm rise comply, to the nearest tenth of a centimetre.', up, 1,
              [{ v: Math.floor(m * 10) / 10 + 0.0001, code: 'round-direction', hint: 'Careful: rounding normally gives a run slightly <b>shorter</b> than the minimum, so that ramp would be too steep. The run must be <i>at least</i> the exact value — round <b>up</b>.' },
                { v: s.B.rise * TAN48, code: 'ratio-flip', hint: t('\\tan 4.8^{\\circ}=\\frac{' + s.B.rise + '}{\\text{run}}') + ', so the run is ' + t(s.B.rise + '\\div\\tan 4.8^{\\circ}') + '.' },
                { v: s.B.rise / TR.sin(4.8), code: 'wrong-ratio', hint: 'That is the length along the slope. The <b>horizontal</b> run is adjacent: use tangent.' }, { v: s.B.rise / Math.tan(4.8), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode.' }],
              t('\\tan 4.8^{\\circ}=\\frac{' + s.B.rise + '}{\\text{run}}\\Rightarrow\\text{run}=\\frac{' + s.B.rise + '}{\\tan 4.8^{\\circ}}=' + m.toFixed(4)) + ' cm.<br>The run must be <b>at least</b> this, so round <b>up</b>: ' + t(up.toFixed(1)) + ' cm.',
              ['At the limit, ' + t('\\tan 4.8^{\\circ}=\\frac{\\text{rise}}{\\text{run}}') + '. Solve for the run.', 'A shorter run makes a steeper ramp. Which way must you round?'], 'shortest run', { unit: 'cm' });
          } },
          { id: 'e16d', sub: 'c i', level: 'EMG', make: function (r, s) { var p = rampPart('C', s.C, null); return p; } },
          { id: 'e16e', sub: 'c ii', level: 'PRG', make: function (r, s) {
            var x = TR.atan(s.C.rise / s.C.run);
            return mc(r, 'Ramp C rises ' + t(s.C.rise) + ' cm over a horizontal run of ' + t(s.C.run) + ' cm, an angle of about ' + t('4.80^{\\circ}') + '. Does it comply?', [
              { html: 'No — ' + t(frac(s.C.rise, s.C.run) + '=' + rd(s.C.rise / s.C.run, 6) + '>\\tan 4.8^{\\circ}=' + TAN48.toFixed(6)) + ', so the angle (' + t(x.toFixed(4) + '^{\\circ}') + ') is just over the limit.', right: true },
              { html: 'Yes — its angle rounds to ' + t('4.80^{\\circ}') + ', which equals the limit.', why: 'A rounded value can’t decide a boundary case. Compare before rounding: is ' + t(frac(s.C.rise, s.C.run)) + ' more or less than ' + t('\\tan 4.8^{\\circ}') + '?' },
              { html: 'Yes — to the nearest tenth it is ' + t('4.8^{\\circ}') + '.', why: 'Rounding to the tenth throws away exactly the digits that decide it. Compare unrounded values.' },
              { html: 'No — any ramp whose angle rounds to ' + t('5^{\\circ}') + ' breaks the code.', why: 'False: a ' + t('4.6^{\\circ}') + ' ramp also rounds to ' + t('5^{\\circ}') + ' and it complies. Compare the unrounded values.' }],
              t('\\theta=\\tan^{-1}\\left(' + frac(s.C.rise, s.C.run) + '\\right)=' + x.toFixed(6) + '^{\\circ}') + '. Compare before rounding: ' + t(frac(s.C.rise, s.C.run) + '=' + rd(s.C.rise / s.C.run, 6)) + ' and ' + t('\\tan 4.8^{\\circ}=' + TAN48.toFixed(6) + '\\ldots') + ', so the angle exceeds ' + t('4.8^{\\circ}') + ' by about ' + t((x - 4.8).toFixed(4) + '^{\\circ}') + '. Ramp C does <b>not</b> comply. Rounding an angle before testing it against a limit can land it on either side of the boundary.', [], 'borderline ramp');
          } },
          { id: 'e16f', sub: 'd', level: 'ADV', make: function (r, s) {
            var m = s.C.run * TAN48, down = Math.floor(m * 10 + 1e-9) / 10;
            return near('A builder is committed to a horizontal run of exactly ' + t(s.C.run) + ' cm. Determine the <b>greatest</b> rise, to the nearest tenth of a centimetre, that still complies — be careful which way you round.', down, 1,
              [{ v: Math.ceil(m * 10) / 10, code: 'round-direction', hint: 'Rounding normally gives a rise slightly <b>above</b> the maximum, so that ramp would be too steep. The rise must be <i>no more</i> than the exact value — round <b>down</b>.' },
                { v: s.C.run / TAN48, code: 'ratio-flip', hint: t('\\tan 4.8^{\\circ}=\\frac{\\text{rise}}{' + s.C.run + '}') + ', so <b>multiply</b>.' }, { v: s.C.run * TR.sin(4.8), code: 'wrong-ratio', hint: 'The ' + t(s.C.run) + ' cm is the horizontal run (adjacent): use tangent.' }, { v: s.C.run * Math.tan(4.8), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode.' }],
              t('\\text{rise}=' + s.C.run + '\\tan 4.8^{\\circ}=' + m.toFixed(4)) + ' cm.<br>The rise must be <b>no more</b> than this, so round <b>down</b>: ' + t(down.toFixed(1)) + ' cm. Rounding up would rebuild a non-compliant ramp.',
              ['At the limit, ' + t('\\tan 4.8^{\\circ}=\\frac{\\text{rise}}{' + s.C.run + '}') + '.', 'A bigger rise is steeper. Which way must you round?'], 'greatest rise', { unit: 'cm' });
          } }] },
      /* ---------------- Part E ---------------- */
      { num: '17', section: 'Extra practice E — Error analysis',
        stem: function (sh) { return 'Right triangle ' + t('ABC') + ' has its right angle at ' + t('C') + ', with ' + t('AB=' + sh.h) + ' and ' + t('AC=' + sh.b) + '. Asked for ' + t('\\angle A') + ', a student wrote ' + t('\\sin A=' + frac(sh.b, sh.h) + ',\\ A=\\sin^{-1}\\left(' + frac(sh.b, sh.h) + '\\right)=' + Math.round(TR.asin(sh.b / sh.h)) + '^{\\circ}') + '.'; },
        shared: function (r) { var tr = r.pick([[9, 40, 41], [7, 24, 25], [11, 60, 61], [13, 84, 85], [12, 35, 37], [5, 12, 13], [8, 15, 17], [20, 48, 52], [10, 24, 26]]); return { a: tr[0], b: tr[1], h: tr[2] }; },
        parts: [
          { id: 'e17a', level: 'BEG', make: function (r, s) {
            return mc(r, 'Relative to ' + t('\\angle A') + ', the side of length ' + t(s.b) + ' is the', [
              { html: '<b>adjacent</b> side, so the ratio with the hypotenuse is cosine (CAH).', right: true },
              { html: '<b>opposite</b> side, so the ratio with the hypotenuse is sine (SOH).', why: t('AC') + ' runs into vertex ' + t('A') + ' — it touches the angle. The side opposite ' + t('\\angle A') + ' is ' + t('BC') + '.' },
              { html: '<b>hypotenuse</b>, so the ratio is cosine.', why: 'The hypotenuse faces the right angle at ' + t('C') + ': that is ' + t('AB') + '.' },
              { html: '<b>adjacent</b> side, so the ratio with the hypotenuse is tangent (TOA).', why: 'Tangent pairs opposite and adjacent. Adjacent with the hypotenuse is CAH.' }],
              'Relative to ' + t('\\angle A') + ', ' + t('AC=' + s.b) + ' is a leg running into ' + t('A') + ': <b>adjacent</b>. Adjacent + hypotenuse is <b>CAH</b>, so the student should have used cosine.', [], 'name side for A');
          } },
          { id: 'e17b', level: 'EMG', make: function (r, s) {
            var x = TR.acos(s.b / s.h), st = TR.asin(s.b / s.h);
            var p = sidePart(r, { kind: 'ah', n: s.b, d: s.h, dp: 0, ang: vtxLab('A'), nm: ['A', 'B', 'C'], prompt: 'Write the corrected work: determine the correct ' + t('\\angle A') + ' to the nearest degree.', extraAlts: [{ v: st, code: 'student-error', hint: 'That is the student’s answer. ' + t('AC') + ' touches ' + t('\\angle A') + ', so it is adjacent: use ' + t('\\cos^{-1}') + '.' }] });
            p.solution += '<br>Check: ' + t('BC=\\sqrt{' + s.h + '^{2}-' + s.b + '^{2}}=' + s.a) + ' and ' + t('\\sin^{-1}\\left(' + frac(s.a, s.h) + '\\right)=' + x.toFixed(4) + '^{\\circ}') + ' ✓'; return p;
          } },
          { id: 'e17c', level: 'EMG', make: function (r, s) {
            var st = Math.round(TR.asin(s.b / s.h));
            return mc(r, 'The student’s ' + t(st + '^{\\circ}') + ' is a real angle of this triangle. Which one, and does this happen every time?', [
              { html: t('\\angle B') + ', every time: the side adjacent to ' + t('A') + ' is the side opposite ' + t('B') + ', so ' + t('\\sin^{-1}\\left(\\frac{\\text{adj to }A}{\\text{hyp}}\\right)') + ' always returns the other acute angle.', right: true },
              { html: t('\\angle B') + ', but only for these particular side lengths.', why: 'The two acute angles always share the hypotenuse and trade the two legs, so it happens every time.' },
              { html: t('\\angle C') + ', the right angle.', why: t('\\angle C=90^{\\circ}') + '. The student’s angle is acute.' },
              { html: 'None — it is just a wrong number.', why: 'Compute ' + t('\\angle B') + ': ' + t(s.b) + ' is opposite ' + t('B') + ', so ' + t('\\sin B=' + frac(s.b, s.h)) + '.' }],
              t(st + '^{\\circ}') + ' is ' + t('\\angle B') + ': ' + t('AC') + ' is opposite ' + t('B') + ', so ' + t('\\sin B=' + frac(s.b, s.h)) + '. The two acute angles share the hypotenuse and swap the legs, so ' + t('\\frac{\\text{adj to }A}{\\text{hyp}}=\\frac{\\text{opp to }B}{\\text{hyp}}') + ' — feeding it to ' + t('\\sin^{-1}') + ' always returns the complement.', [], 'student got other angle');
          } },
          { id: 'e17d', level: 'EMG', make: function (r, s) {
            var st = Math.round(TR.asin(s.b / s.h));
            return mc(r, 'Which one-line check, available before any calculation, shows ' + t(st + '^{\\circ}') + ' is impossible for ' + t('\\angle A') + '?', [
              { html: t('AC=' + s.b) + ' is almost as long as the hypotenuse, so the third side ' + t('BC') + ' is short — and ' + t('\\angle A') + ', which faces it, must be small.', right: true },
              { html: 'A sine can’t be greater than 1.', why: 'True, but ' + t(frac(s.b, s.h)) + ' is less than 1, so that doesn’t rule anything out.' },
              { html: t(st + '^{\\circ}+90^{\\circ}') + ' is more than ' + t('180^{\\circ}') + '.', why: 'Check: ' + t(st + 90) + ' is less than ' + t('180') + '.' },
              { html: 'Acute angles in a right triangle are always under ' + t('45^{\\circ}') + '.', why: 'One acute angle is at least ' + t('45^{\\circ}') + ' in every right triangle.' }],
              'The smaller angle faces the shorter side. ' + t('AC') + ' is nearly as long as ' + t('AB') + ', so ' + t('BC') + ' is short and ' + t('\\angle A') + ' (facing it) is small. A rough sketch kills ' + t(st + '^{\\circ}') + ' instantly.', [], 'quick sanity check');
          } }] },
      { num: '18', stem: function (sh) { return 'Right triangle ' + t('PQR') + ' has its right angle at ' + t('Q') + ', with ' + t('PQ=' + sh.L) + ', ' + t('QR=' + sh.S) + ' and ' + t('PR=' + sh.H) + '. Asked for ' + t('\\angle P') + ', a student wrote:<div style="margin:6px 0 0 12px;line-height:2">' + [t('\\text{opp}=' + sh.S + ',\\ \\text{adj}=' + sh.L), t('\\tan P=' + frac(sh.S, sh.L)), t('\\tan^{-1}\\left(' + frac(sh.S, sh.L) + '\\right)=' + TR.atan(sh.S / sh.L).toFixed(4) + '^{\\circ}'), t('\\angle P=' + Math.round(TR.atan(sh.L / sh.S)) + '^{\\circ}')].join('<br>') + '</div>'; },
        shared: function (r) { var tr = r.pick([[7, 24, 25], [8, 15, 17], [5, 12, 13], [9, 40, 41], [11, 60, 61], [12, 35, 37], [28, 45, 53]]); return { S: tr[0], L: tr[1], H: tr[2] }; },
        parts: [
          { id: 'e18a', level: 'EMG', make: function (r, s) {
            var wrongA = Math.round(TR.atan(s.L / s.S));
            return mc(r, 'Every line of trigonometry is correct except one. Where does the work go wrong?', [
              { html: 'The last line, ' + t('\\angle P=' + wrongA + '^{\\circ}') + ': the student reported the <b>complement</b> instead of the angle just found.', right: true },
              { html: 'The side names: ' + t(s.S) + ' should be adjacent to ' + t('P') + '.', why: t('QR=' + s.S) + ' is across from ' + t('P') + ' — opposite is correct.' },
              { html: 'The ratio: it should be ' + t('\\sin P') + '.', why: 'With opposite and adjacent, tangent is correct.' },
              { html: 'The calculator value ' + t(TR.atan(s.S / s.L).toFixed(4) + '^{\\circ}') + '.', why: 'Check it: ' + t('\\tan^{-1}\\left(' + frac(s.S, s.L) + '\\right)') + ' really is ' + t(TR.atan(s.S / s.L).toFixed(4) + '^{\\circ}') + '.' }],
              'Everything up to ' + t(TR.atan(s.S / s.L).toFixed(4) + '^{\\circ}') + ' is correct. The student then reported ' + t('90-' + Math.round(TR.atan(s.S / s.L)) + '=' + wrongA) + ' — a labelling mistake, not a trigonometry mistake.', [], 'find error line');
          } },
          { id: 'e18b', level: 'BEG', make: function (r, s) {
            var x = TR.atan(s.S / s.L);
            return near('State the correct ' + t('\\angle P') + ' to the nearest degree.', x, 0,
              [{ v: 90 - x, code: 'student-error', hint: 'That is the student’s answer — it is ' + t('\\angle R') + '. ' + t('\\angle P') + ' is the angle the student actually calculated.' }].concat(sideAlts('oa', s.S, s.L, '\\angle P', String(s.S), String(s.L), 0)),
              t('\\angle P=\\tan^{-1}\\left(' + frac(s.S, s.L) + '\\right)=' + x.toFixed(4) + '^{\\circ}\\approx ' + deg(x, 0)) + '. The ' + t(Math.round(90 - x) + '^{\\circ}') + ' is ' + t('\\angle R') + ': ' + t('\\tan R=' + frac(s.L, s.S)) + '.', ['The student’s calculator value was right.'], 'correct angle P', { before: t('\\angle P=') });
          } },
          { id: 'e18c', level: 'EMG', make: function (r, s) {
            return mc(r, 'If the student also reports ' + t('\\angle R=' + Math.round(TR.atan(s.S / s.L)) + '^{\\circ}') + ', the error survives the ' + t('90^{\\circ}') + ' check. Why?', [
              { html: 'Swapping two angles that add to ' + t('90^{\\circ}') + ' doesn’t change their sum. The check catches wrong ratios, not wrong labels.', right: true },
              { html: 'The ' + t('90^{\\circ}') + ' check only works for 3-4-5 triangles.', why: 'It works for every right triangle. Think about what swapping two numbers does to their sum.' },
              { html: 'Because the student rounded.', why: 'Rounding isn’t the issue; the two values were attached to the wrong vertices.' },
              { html: 'It doesn’t survive — the sum would be wrong.', why: 'Add them: ' + t(Math.round(TR.atan(s.L / s.S)) + '+' + Math.round(TR.atan(s.S / s.L)) + '=90') + '.' }],
              t(Math.round(TR.atan(s.L / s.S)) + '^{\\circ}+' + Math.round(TR.atan(s.S / s.L)) + '^{\\circ}=90^{\\circ}') + ' either way round. The check tests whether the two angles are consistent with each other, not whether each is attached to the right vertex.', [], 'limits of 90 check');
          } },
          { id: 'e18d', level: 'EMG', make: function (r, s) {
            return mc(r, 'Which check based on <b>side lengths</b> — no calculator — catches the error immediately?', [
              { html: 'The smallest angle faces the shortest side: ' + t('\\angle P') + ' faces ' + t('QR=' + s.S) + ', the shortest side, so ' + t('\\angle P') + ' must be the smallest angle.', right: true },
              { html: 'The largest angle faces the hypotenuse, so ' + t('\\angle P') + ' is the largest.', why: 'The largest angle is the right angle at ' + t('Q') + ', which faces the hypotenuse.' },
              { html: 'The hypotenuse is ' + t(s.H) + ', so ' + t('\\angle P') + ' must be close to ' + t(s.H + '^{\\circ}') + '.', why: 'Side lengths and angle sizes are different units — they can’t be compared directly.' },
              { html: t('\\angle P') + ' faces ' + t('PQ=' + s.L) + ', the longer leg, so it must be large.', why: 'Which side is across from ' + t('P') + '? It’s ' + t('QR') + ', not ' + t('PQ') + '.' }],
              'In any triangle the smallest angle faces the shortest side. ' + t('\\angle P') + ' faces ' + t('QR=' + s.S) + ', so it must be smaller than ' + t('\\angle R') + ' (which faces ' + t(s.L) + ') — nowhere near ' + t(Math.round(TR.atan(s.L / s.S)) + '^{\\circ}') + '.', [], 'side-length check');
          } }] },
      { num: '19', stem: function (sh) { var w = 1 / TR.sin(sh.k); return 'Asked to find the acute angle ' + t('\\theta') + ' for which ' + t('\\sin\\theta=' + sh.k) + ', a student wrote<div style="margin:6px 0 0 12px">' + t('\\theta=\\sin^{-1}(' + sh.k + ')=\\dfrac{1}{\\sin ' + sh.k + '}=' + w.toFixed(4)) + '<br>' + t('\\theta\\approx ' + Math.round(w) + '^{\\circ}') + '</div>'; },
        shared: function (r) { return { k: search(r, function (r) { return r.int(3, 13) / 20; }, function (k) { var w = 1 / TR.sin(k); return safe(TR.asin(k), 0) && w > 90 && w < 1000; }) }; },
        parts: [
          { id: 'e19a', level: 'EMG', make: function (r, s) {
            return mc(r, 'What is the error?', [
              { html: 'The student read the ' + t('-1') + ' in ' + t('\\sin^{-1}') + ' as a reciprocal. The calculator computed ' + t('\\frac{1}{\\sin(' + s.k + '^{\\circ})}') + ' — ' + t(s.k) + ' went in as an <b>angle</b> instead of a <b>ratio</b>.', right: true },
              { html: 'The calculator was in radian mode.', why: 'Radian mode would give ' + t('\\sin^{-1}(' + s.k + ')\\approx ' + Math.asin(s.k).toFixed(4)) + ' — a small number, not ' + t(Math.round(1 / TR.sin(s.k))) + '.' },
              { html: 'The student rounded too early.', why: 'Rounding can’t turn an acute angle into ' + t(Math.round(1 / TR.sin(s.k)) + '^{\\circ}') + '.' },
              { html: 'The student should have used ' + t('\\cos^{-1}') + '.', why: 'The equation gives the <b>sine</b>, so ' + t('\\sin^{-1}') + ' is right — it just isn’t ' + t('\\frac{1}{\\sin}') + '.' }],
              t('\\sin^{-1}') + ' is the inverse function, not a reciprocal. The student computed ' + t('\\frac{1}{\\sin(' + s.k + '^{\\circ})}') + ', the reciprocal of the sine of an angle of ' + t(s.k) + ' degrees.', [], 'name the error');
          } },
          { id: 'e19b', level: 'EMG', make: function (r, s) {
            var w = 1 / TR.sin(s.k), back = TR.sin(w);
            return mc(r, 'Which pair gives two independent reasons that ' + t(Math.round(w) + '^{\\circ}') + ' can’t be right?', [
              { html: 'Geometric: ' + t('\\theta') + ' is acute, so ' + t('\\theta<90^{\\circ}') + '. Checking: ' + t('\\sin ' + w.toFixed(4) + '^{\\circ}=' + back.toFixed(4)) + ', not ' + t(s.k) + '.', right: true },
              { html: 'Geometric: angles can’t have decimals. Checking: ' + t(Math.round(w)) + ' isn’t a multiple of ' + t('15') + '.', why: 'Angles can have decimals, and they needn’t be multiples of 15. Substitute the answer back instead.' },
              { html: 'Geometric: ' + t('\\theta') + ' must be less than ' + t('45^{\\circ}') + ' because ' + t(s.k + '<0.5') + '. Checking: the calculator never gives large numbers.', why: 'Neither reason holds. Use the fact that ' + t('\\theta') + ' is acute, and substitute back into ' + t('\\sin\\theta') + '.' },
              { html: 'Geometric: sines are always under 1. Checking: ' + t(Math.round(w)) + ' is more than ' + t(s.k) + '.', why: 'Compare the angle to ' + t('90^{\\circ}') + ', and check ' + t('\\sin') + ' of the answer.' }],
              '<b>Geometric:</b> an acute angle is less than ' + t('90^{\\circ}') + '; ' + t(Math.round(w) + '^{\\circ}') + ' plus the right angle would already exceed ' + t('180^{\\circ}') + '.<br><b>Checking:</b> ' + t('\\sin ' + w.toFixed(4) + '^{\\circ}=' + back.toFixed(4)) + ', not ' + t(s.k) + ' — the answer fails the equation.', [], 'two reasons');
          } },
          { id: 'e19c', level: 'BEG', make: function (r, s) {
            var x = TR.asin(s.k);
            return near('Determine the correct ' + t('\\theta') + ' to the nearest degree.', x, 0, valAlts('sin', s.k),
              t('\\theta=\\sin^{-1}(' + s.k + ')=' + x.toFixed(4) + '^{\\circ}\\approx ' + deg(x, 0)) + '<br>Verify: ' + t('\\sin ' + x.toFixed(4) + '^{\\circ}=' + s.k) + ' ✓', ['Use 2nd&nbsp;sin in degree mode.'], 'sin theta = ' + s.k, { before: t('\\theta=') });
          } },
          { id: 'e19d', level: 'EMG', make: function (r) {
            return mc(r, 'The student’s defence: “' + t('x^{-1}') + ' means ' + t('\\frac{1}{x}') + ', so ' + t('\\sin^{-1}') + ' must mean ' + t('\\frac{1}{\\sin}') + '.” Which reply is correct?', [
              { html: t('\\sin') + ' is a <b>function</b>, not a number: ' + t('\\sin^{-1}') + ' is its inverse (ratio ' + t('\\to') + ' angle). The reciprocal is written ' + t('\\frac{1}{\\sin\\theta}') + ' or ' + t('(\\sin\\theta)^{-1}') + '.', right: true },
              { html: 'The student is right; ' + t('\\sin^{-1}\\theta') + ' and ' + t('\\frac{1}{\\sin\\theta}') + ' are the same.', why: 'Try ' + t('\\sin^{-1}(0.5)=30^{\\circ}') + ' but ' + t('\\frac{1}{\\sin 0.5^{\\circ}}\\approx 114.6') + '. Not the same.' },
              { html: t('x^{-1}') + ' never means ' + t('\\frac{1}{x}') + '.', why: 'For a number it does. The difference is that ' + t('\\sin') + ' is a function.' },
              { html: 'The reciprocal of sine is written ' + t('\\sin^{-1}\\theta') + ' and the inverse is ' + t('(\\sin\\theta)^{-1}') + '.', why: 'That is backwards: ' + t('(\\sin\\theta)^{-1}') + ' is the reciprocal.' }],
              'For a number, ' + t('x^{-1}=\\frac{1}{x}') + '. But ' + t('\\sin') + ' is a function, and for a function the superscript ' + t('-1') + ' means the inverse function — the same machine run backwards. Write the reciprocal as ' + t('\\frac{1}{\\sin\\theta}') + ' or ' + t('(\\sin\\theta)^{-1}') + '.', [], 'inverse vs reciprocal');
          } }] },
      /* ---------------- Part F ---------------- */
      { num: '20', section: 'Extra practice F — Stretch: shapes that hide a right triangle',
        stem: function (sh) { return 'In isosceles triangle ' + t('ABC') + ', ' + t('AB=AC=' + sh.c) + ' cm. The altitude ' + t('AD') + ' from the apex ' + t('A') + ' to the base ' + t('BC') + ' measures ' + t(sh.h) + ' cm.'; },
        shared: function (r) {
          var c = [];
          TRIPLES.concat([[10, 24, 26], [12, 16, 20], [6, 8, 10], [9, 12, 15]]).forEach(function (q) { [[q[0], q[1]], [q[1], q[0]]].forEach(function (p) {
            var half = TR.asin(p[0] / q[2]), apex = 2 * half, base = TR.atan(p[1] / p[0]);
            if (2 * Math.round(half) !== Math.round(apex) && Math.round(apex) + 2 * Math.round(base) !== 180 && safe(apex, 0, 0.03) && safe(base, 0, 0.03) && q[2] <= 70) c.push({ bd: p[0], h: p[1], c: q[2] });
          }); });
          return r.pick(c);
        },
        parts: [
          { id: 'e20a', level: 'EMG', make: function (r) {
            return mc(r, 'Why can’t SOH CAH TOA be applied directly to ' + t('\\triangle ABC') + ', and what property of ' + t('AD') + ' rescues the situation?', [
              { html: t('\\triangle ABC') + ' has no right angle, so it has no hypotenuse. The altitude ' + t('AD') + ' is perpendicular to ' + t('BC') + ' and bisects both the base and the apex angle, making two congruent right triangles.', right: true },
              { html: 'The sides are too long; ' + t('AD') + ' makes them shorter.', why: 'Length isn’t the issue. The ratios are defined only inside a <b>right</b> triangle.' },
              { html: 'An isosceles triangle has two hypotenuses, so the ratio is ambiguous; ' + t('AD') + ' picks one.', why: 'A hypotenuse faces a right angle — ' + t('\\triangle ABC') + ' has none.' },
              { html: 'SOH CAH TOA can be applied directly; ' + t('AD') + ' is not needed.', why: 'The ratios need a right angle. Where is the right angle in ' + t('\\triangle ABC') + '?' }],
              'SOH CAH TOA works only inside a right triangle. In an isosceles triangle the altitude from the apex is perpendicular to the base, bisects it and bisects the apex angle, so it cuts ' + t('\\triangle ABC') + ' into congruent right triangles ' + t('ABD') + ' and ' + t('ACD') + '.', [], 'why split isosceles');
          } },
          { id: 'e20b', sub: 'b i', level: 'BEG', make: function (r, s) {
            var p = K.P.number('Determine ' + t('BD') + ' (in cm).', s.bd, function (v) { if (Math.abs(v - Math.sqrt(s.c * s.c + s.h * s.h)) < 0.06) return { code: 'pyth-add', hint: t('AB') + ' is the hypotenuse of triangle ' + t('ABD') + ': subtract the squares.' }; if (v === s.c * s.c - s.h * s.h) return { code: 'no-root', hint: 'That is ' + t('BD^{2}') + '. Take the square root.' }; if (v === 2 * s.bd) return { code: 'value', hint: 'That is the whole base ' + t('BC') + '. ' + t('BD') + ' is half of it.' }; return null; },
              t('BD^{2}=AB^{2}-AD^{2}=' + s.c + '^{2}-' + s.h + '^{2}=' + (s.c * s.c - s.h * s.h)) + ', so ' + t('BD=' + s.bd) + ' cm.', ['Use the Pythagorean theorem in right triangle ' + t('ABD') + '.'], 'BD', { before: t('BD='), after: 'cm' });
            p.bad = [String(s.c * s.c - s.h * s.h), String(2 * s.bd)]; return p;
          } },
          { id: 'e20c', sub: 'b ii', level: 'BEG', make: function (r, s) {
            var p = K.P.number('Hence determine ' + t('BC') + ' (in cm).', 2 * s.bd, function (v) { if (v === s.bd) return { code: 'value', hint: 'That is ' + t('BD') + ', half the base. ' + t('AD') + ' bisects ' + t('BC') + ', so double it.' }; return null; },
              'In right triangle ' + t('ABD') + ', ' + t('BD=\\sqrt{' + s.c + '^{2}-' + s.h + '^{2}}=' + s.bd) + '. ' + t('AD') + ' bisects the base, so ' + t('BC=2(' + s.bd + ')=' + 2 * s.bd) + ' cm.', ['The altitude from the apex bisects the base.'], 'BC', { before: t('BC='), after: 'cm' });
            p.bad = [String(s.bd)]; return p;
          } },
          { id: 'e20d', sub: 'c', level: 'PRG', make: function (r, s) {
            var half = TR.asin(s.bd / s.c), x = 2 * half;
            return near('Determine the apex angle ' + t('\\angle BAC') + ' to the nearest degree. (Watch where you round.)', x, 0,
              [{ v: 2 * Math.round(half), code: 'early-round', hint: 'You doubled a <b>rounded</b> half-angle. Double the exact ' + t(half.toFixed(4) + '^{\\circ}') + ', then round.' },
                { v: half, code: 'half-angle', hint: 'That is ' + t('\\angle BAD') + ', half of the apex angle. ' + t('AD') + ' bisects ' + t('\\angle BAC') + ': double it.' },
                { v: TR.atan(s.h / s.bd), code: 'base-angle', hint: 'That is a base angle, ' + t('\\angle ABC') + '. The apex angle is at ' + t('A') + '.' },
                { v: 2 * TR.acos(s.bd / s.c), code: 'wrong-ratio', hint: 'From ' + t('\\angle BAD') + ', ' + t('BD') + ' is <b>opposite</b> (across from ' + t('A') + ') and ' + t('AB') + ' is the hypotenuse: SOH.' },
                { v: 2 * Math.asin(s.bd / s.c), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode.' }],
              'In ' + t('\\triangle ABD') + ', relative to ' + t('\\angle BAD') + ': opp ' + t('=BD=' + s.bd) + ', hyp ' + t('=AB=' + s.c) + ' ' + t('\\Rightarrow') + ' SOH.<br>' + t('\\angle BAD=\\sin^{-1}\\left(' + frac(s.bd, s.c) + '\\right)=' + half.toFixed(4) + '^{\\circ}') + '<br>' + t('\\angle BAC=2(' + half.toFixed(4) + '^{\\circ})=' + x.toFixed(4) + '^{\\circ}\\approx ' + deg(x, 0)) +
              '<br>Rounding in the middle would give ' + t('2\\times ' + Math.round(half) + '^{\\circ}=' + 2 * Math.round(half) + '^{\\circ}') + ' — wrong, because doubling also doubles the rounding error.',
              ['Find ' + t('\\angle BAD') + ' in right triangle ' + t('ABD') + ', then double it.', 'Keep all the digits of the half-angle until the end.'], 'apex angle isosceles', { before: t('\\angle BAC=') });
          } },
          { id: 'e20e', sub: 'd', level: 'EMG', make: function (r, s) {
            var p = sidePart(r, { kind: 'oa', n: s.h, d: s.bd, dp: 0, ang: vtxLab('B'), noFig: true, prompt: 'Determine ' + t('\\angle ABC') + ' (which equals ' + t('\\angle ACB') + ') to the nearest degree.' });
            p.solution = 'In ' + t('\\triangle ABD') + ', relative to ' + t('\\angle ABD') + ': opp ' + t('=AD=' + s.h) + ', adj ' + t('=BD=' + s.bd) + ' (Pythagoras: ' + t('\\sqrt{' + s.c + '^{2}-' + s.h + '^{2}}') + ') ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\angle ABC=\\tan^{-1}\\left(' + frac(s.h, s.bd) + '\\right)=' + TR.atan(s.h / s.bd).toFixed(4) + '^{\\circ}\\approx ' + deg(TR.atan(s.h / s.bd), 0)) + '. The two right triangles are congruent, so ' + t('\\angle ACB') + ' is the same.';
            p.hints = ['You know ' + t('AD=' + s.h) + ' and ' + t('BD') + ' (half of the base, from Pythagoras). From ' + t('B') + ', which is opposite?']; return p;
          } },
          { id: 'e20f', sub: 'e', level: 'EMG', make: function (r, s) {
            var A = 2 * TR.asin(s.bd / s.c), B = TR.atan(s.h / s.bd), tot = Math.round(A) + 2 * Math.round(B);
            return mc(r, 'Your rounded angles ' + t(Math.round(A) + '^{\\circ}') + ', ' + t(Math.round(B) + '^{\\circ}') + ' and ' + t(Math.round(B) + '^{\\circ}') + ' add to ' + t(tot + '^{\\circ}') + ', not ' + t('180^{\\circ}') + '. Why is nothing wrong?', [
              { html: 'Three separate roundings took place, each able to move its angle by up to ' + t('0.5^{\\circ}') + '. The exact angles add to exactly ' + t('180^{\\circ}') + '.', right: true },
              { html: 'Isosceles triangles don’t have to add to ' + t('180^{\\circ}') + '.', why: 'Every triangle’s angles add to ' + t('180^{\\circ}') + '. Look at the exact (unrounded) values.' },
              { html: 'One of the angles was found with the wrong ratio.', why: 'Add the exact values: ' + t(A.toFixed(4) + '+2(' + B.toFixed(4) + ')') + '. What do you get?' },
              { html: 'The altitude changes the angle sum.', why: 'Drawing a line inside doesn’t change the triangle’s angles. Think about rounding.' }],
              'Exact: ' + t(A.toFixed(4) + '^{\\circ}+2(' + B.toFixed(4) + '^{\\circ})=180.0000^{\\circ}') + ' ✓. Each rounding can move an angle by up to ' + t('0.5^{\\circ}') + ', so a rounded total anywhere from ' + t('178.5^{\\circ}') + ' to ' + t('181.5^{\\circ}') + ' is possible. Report the rounded angles; take any exact total from the exact values.', [], 'rounded total not 180');
          } }] },
      { num: '21', stem: function (sh) { return 'The cube has edges of length ' + t(sh.s) + ' cm. ' + t('AC') + ' is a <b>face diagonal</b> of the bottom face, ' + t('CG') + ' is a vertical edge, and ' + t('AG') + ' is a <b>space diagonal</b> from one corner to the opposite corner.' + cubeFig(sh.s); },
        shared: function (r) { return { s: r.int(4, 15) }; },
        parts: [
          { id: 'e21a', level: 'BEG', make: function (r, s) {
            var p = K.P.radical('Determine the length of the face diagonal ' + t('AC') + ', exactly.', { k: s.s, n: 2, m: 2 }, 'mixed',
              t('\\triangle ABC') + ' is right-angled at ' + t('B') + '.<br>' + t('AC^{2}=' + s.s + '^{2}+' + s.s + '^{2}=' + 2 * s.s * s.s) + '<br>' + t('AC=\\sqrt{' + 2 * s.s * s.s + '}=' + s.s + '\\sqrt{2}\\approx ' + fx(s.s * Math.SQRT2, 1)) + ' cm',
              ['Use the Pythagorean theorem in the bottom face.'], 'face diagonal', { before: t('AC=') });
            p.bad = ['\\sqrt{' + s.s * s.s + '}', String(2 * s.s)]; return p;
          } },
          { id: 'e21b', level: 'LIM', make: function (r, s) {
            return near('Determine ' + t('\\angle CAB') + ', the angle between the face diagonal ' + t('AC') + ' and the edge ' + t('AB') + '.', 45, 0,
              [{ v: 90, code: 'wrong-ratio', hint: t('\\sin^{-1}(1)') + ' needs the hypotenuse, but both known sides are legs (opposite and adjacent): ' + t('\\tan^{-1}(1)') + '.' }, { v: Math.atan(1), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode.' }],
              'In ' + t('\\triangle ABC') + ', relative to ' + t('\\angle CAB') + ': opp ' + t('=BC=' + s.s) + ', adj ' + t('=AB=' + s.s) + ' ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\angle CAB=\\tan^{-1}\\left(' + frac(s.s, s.s) + '\\right)=\\tan^{-1}(1)=45^{\\circ}') + ' — the legs are equal, so the two acute angles are equal halves of ' + t('90^{\\circ}') + '.',
              ['Which two sides of ' + t('\\triangle ABC') + ' do you know?'], 'face angle', { before: t('\\angle CAB=') });
          } },
          { id: 'e21c', level: 'EMG', make: function (r, s) {
            var p = K.P.radical(t('CG') + ' is perpendicular to the whole bottom face, so ' + t('\\angle ACG=90^{\\circ}') + '. Determine the length of the space diagonal ' + t('AG') + ', exactly.', { k: s.s, n: 2, m: 3 }, 'mixed',
              t('AG^{2}=AC^{2}+CG^{2}=(' + s.s + '\\sqrt{2})^{2}+' + s.s + '^{2}=' + 2 * s.s * s.s + '+' + s.s * s.s + '=' + 3 * s.s * s.s) + '<br>' + t('AG=\\sqrt{' + 3 * s.s * s.s + '}=' + s.s + '\\sqrt{3}\\approx ' + fx(s.s * Math.sqrt(3), 1)) + ' cm',
              ['The legs of right triangle ' + t('ACG') + ' are the face diagonal ' + t('AC=' + s.s + '\\sqrt{2}') + ' and the edge ' + t('CG=' + s.s) + '.'], 'space diagonal', { before: t('AG=') });
            p.bad = ['\\sqrt{' + 2 * s.s * s.s + '}', s.s + '\\sqrt{2}']; return p;
          } },
          { id: 'e21d', sub: 'd i', level: 'PRG', make: function (r, s) {
            var x = TR.atan(Math.SQRT2);
            return near('Determine ' + t('\\angle AGC') + ', the angle between the space diagonal and the vertical edge ' + t('CG') + ', to the nearest degree.', x, 0,
              [{ v: 90 - x, code: 'other-angle', hint: 'That is ' + t('\\angle GAC') + ', the angle at ' + t('A') + '. From ' + t('G') + ', the face diagonal ' + t('AC') + ' is opposite and ' + t('CG') + ' is adjacent.' }, { v: 45, code: 'face-angle', hint: 'That is the angle in the bottom face. In triangle ' + t('ACG') + ' the legs are ' + t(s.s + '\\sqrt{2}') + ' and ' + t(s.s) + '.' }, { v: Math.atan(Math.SQRT2), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode.' }],
              'In right triangle ' + t('ACG') + ' (right angle at ' + t('C') + '), relative to ' + t('\\angle AGC') + ': opp ' + t('=AC=' + s.s + '\\sqrt{2}') + ', adj ' + t('=CG=' + s.s) + ' ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\angle AGC=\\tan^{-1}\\left(\\frac{' + s.s + '\\sqrt{2}}{' + s.s + '}\\right)=\\tan^{-1}(\\sqrt{2})=' + x.toFixed(4) + '^{\\circ}\\approx 55^{\\circ}'),
              ['Work in right triangle ' + t('ACG') + '. From ' + t('G') + ', which side is opposite?'], 'space diagonal angle G', { before: t('\\angle AGC=') });
          } },
          { id: 'e21e', sub: 'd ii', level: 'PRG', make: function (r, s) {
            var x = TR.atan(1 / Math.SQRT2);
            var p = near('Determine ' + t('\\angle GAC') + ', the angle between the space diagonal and the face diagonal, to the nearest degree, and check the pair with ' + t('\\angle AGC') + '.', x, 0,
              [{ v: 90 - x, code: 'other-angle', hint: 'That is ' + t('\\angle AGC') + ', the angle at ' + t('G') + '. From ' + t('A') + ', the edge ' + t('CG') + ' is opposite.' }, { v: 45, code: 'face-angle', hint: 'That is the angle in the bottom face. Use triangle ' + t('ACG') + '.' }, { v: Math.atan(1 / Math.SQRT2), code: 'radian', hint: 'Your calculator seems to be in <b>radian</b> mode.' }],
              'Relative to ' + t('\\angle GAC') + ': opp ' + t('=CG=' + s.s) + ', adj ' + t('=AC=' + s.s + '\\sqrt{2}') + ' ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\angle GAC=\\tan^{-1}\\left(\\frac{1}{\\sqrt{2}}\\right)=' + x.toFixed(4) + '^{\\circ}\\approx 35^{\\circ}') + '<br>Check: ' + t('55^{\\circ}+35^{\\circ}=90^{\\circ}') + ' ✓',
              ['From ' + t('A') + ' in triangle ' + t('ACG') + ', the vertical edge is opposite and the face diagonal is adjacent.'], 'space diagonal angle A', { before: t('\\angle GAC=') });
            return p;
          } },
          { id: 'e21f', sub: 'e', level: 'EMG', make: function (r, s) {
            var s2 = r.pick([3, 5, 7, 20, 25].filter(function (v) { return v !== s.s; }));
            return mc(r, 'A second cube has edges of ' + t(s2) + ' cm. Without recomputing, what happens to the three angles (' + t('45^{\\circ}') + ', ' + t('55^{\\circ}') + ', ' + t('35^{\\circ}') + ')?', [
              { html: 'They are unchanged: every length scales by the same factor, so every ratio of two lengths — and every angle — stays the same.', right: true },
              { html: 'They scale by ' + t(frac(s2, s.s)) + '.', why: 'Angles depend on <b>ratios</b> of sides. Scaling every side by the same factor cancels out of each fraction.' },
              { html: 'Only the ' + t('45^{\\circ}') + ' angle stays the same.', why: 'The space-diagonal triangle always has legs in the ratio ' + t('\\sqrt{2}:1') + ', whatever the edge.' },
              { html: 'They all get ' + (s2 > s.s ? 'larger' : 'smaller') + ' because the cube is ' + (s2 > s.s ? 'bigger' : 'smaller') + '.', why: 'A bigger cube is the same shape. The edge length cancels out of every ratio.' }],
              'All three angles are unchanged. Every length in the ' + t(s2) + ' cm cube is ' + t(frac(s2, s.s)) + ' of the matching length, so every ratio of two lengths is the same — the edge length cancels before the inverse ratio is taken.', [], 'similar cubes');
          } }] }
    ]
  });

  /* ---------- part makers that need the data above ---------- */
  function fig5(sh, which) {
    var p = sh.p, q = sh.q, c = sh.c, th = TR.acos(p / c) * Math.PI / 180;
    var pts = { L: [0, 0], R: [c, 0], B: [p * Math.cos(th), -p * Math.sin(th)] };
    pts = flipY(mirror(pts, sh.mir, c / 2), sh.up);
    var fig = HW.fig({ pts: pts, segs: [['L', 'R', String(c)], ['L', 'B', String(p)], ['B', 'R', String(q)]], right: [['B', 'L', 'R']], angles: [['L', 'R', 'B', 'x°'], ['R', 'L', 'B', 'y°']], names: false, width: 300 });
    // from x (at L): opposite is BR = q; from y (at R): opposite is LB = p
    var n = which === 'x' ? q : p, x = TR.asin(n / c), o = which === 'x' ? 'y' : 'x';
    var alts = [{ v: 90 - x, code: 'other-angle', hint: 'That is ' + t(o + '^{\\circ}') + ', the angle at the other end of the hypotenuse. From ' + t(which + '^{\\circ}') + ', which leg is across from it?' }].concat(sideAlts('oh', n, c, which + '^{\\circ}', String(n), String(c), 0));
    return near(fig + '<div>Determine ' + t(which + '^{\\circ}') + '.</div>', x, 0, alts,
      'The right angle is at the bottom vertex, so the side ' + t(c) + ' opposite it is the HYPOTENUSE. ' + sideSol('oh', n, c, String(n), String(c), which + '^{\\circ}', which + '^{\\circ}', x, 0) +
      '<br>Check: ' + t(Math.round(TR.asin(q / c)) + '^{\\circ}+' + Math.round(TR.asin(p / c)) + '^{\\circ}=90^{\\circ}') + ' and ' + t(p + '^{2}+' + q + '^{2}=' + (p * p + q * q) + '=' + c + '^{2}') + ' ✓',
      ['Find the right angle first: the side across from it is the hypotenuse, even when it is drawn on top.', SIDEHINTS[1]], 'two angles, hyp ' + c, { before: t(which + '^{\\circ}=') });
  }
  function fig6(sh) {
    var tot = sh.bd + sh.dc, bd = Math.max(sh.bd, 0.2 * tot), dc = tot - bd; // short side widened so its label fits (not to scale)
    var pts = mirror({ B: [0, 0], D: [bd, 0], C: [bd + dc, 0], A: [bd, sh.h] }, sh.mir, tot / 2);
    return HW.fig({ pts: pts, segs: [['B', 'D', String(sh.bd)], ['D', 'C'], ['A', 'B', String(sh.ab)], ['A', 'D', { width: 1.8 }], ['A', 'C', String(sh.ac)]], right: [['D', 'A', 'C']], width: 320, height: 260 });
  }
  function fig7(s) {
    var b = s.a + s.d, pts = mirror({ K: [0, s.h], N: [s.a, s.h], M: [s.a, 0], L: [s.a - b, 0] }, s.mir, (s.a - b + s.a) / 2);
    return HW.fig({ pts: pts, segs: [['K', 'N', String(s.a)], ['N', 'M', String(s.h)], ['M', 'L', String(b)], ['L', 'K']], right: [['N', 'K', 'M'], ['M', 'N', 'L']], width: 300 });
  }
  function cubeFig(s) {
    var P = { A: [0, 0], B: [3, 0], C: [4.2, 0.65], D: [1.2, 0.65], E: [0, 3], F: [3, 3], G: [4.2, 3.65], H: [1.2, 3.65] }; // depth offset chosen so AG doesn’t run along AF
    return HW.fig({ pts: P, segs: [['A', 'B', s + ' cm'], ['B', 'F'], ['F', 'E'], ['E', 'A'], ['B', 'C'], ['C', 'G'], ['G', 'F'], ['E', 'H'], ['H', 'G'],
      ['A', 'D', { dash: 1, width: 1.3 }], ['D', 'C', { dash: 1, width: 1.3 }], ['D', 'H', { dash: 1, width: 1.3 }], ['A', 'C', { dash: 1, color: '#2f5d9e', width: 2 }], ['A', 'G', { color: '#b0452f', width: 2.4 }]], width: 240 });
  }
  function pitchPart(p) {
    var x = TR.atan(p / 12);
    return near('Determine the angle ' + an(p) + ' “' + p + ' in 12” roof makes with the horizontal, to the nearest degree.', x, 0, sideAlts('oa', p, 12, '\\theta', String(p), '12', 0),
      'Rise ' + t(p) + ' is OPPOSITE, run ' + t('12') + ' is ADJACENT ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\theta=\\tan^{-1}\\left(' + frac(p, 12) + '\\right)=' + x.toFixed(4) + '^{\\circ}\\approx ' + deg(x, 0)),
      ['Sketch a right triangle with rise ' + t(p) + ' and horizontal run ' + t('12') + '.'], 'pitch ' + p + ' in 12', { before: t('\\theta=') });
  }
  function gradePart(g) {
    var x = TR.atan(g / 100);
    return near('Sketch a labelled triangle for ' + an(g) + ' ' + t(g + '\\%') + ' grade and determine the angle the road makes with the horizontal, to the nearest degree.', x, 0,
      [{ v: g, code: 'grade-angle', hint: An(g) + ' ' + t(g + '\\%') + ' grade is not ' + t(g + '^{\\circ}') + '. Rise ' + t(g) + ', run ' + t('100') + ': use TOA.' }, { v: TR.atan(100 / g), code: 'ratio-flip', hint: 'That is the angle with the vertical. The rise is opposite the road’s angle and the run is adjacent.' }].concat(std('tan')(g / 100)),
      t('\\tan\\theta=' + frac(g, 100) + '=' + (g / 100)) + '<br>' + t('\\theta=\\tan^{-1}(' + (g / 100) + ')=' + x.toFixed(4) + '^{\\circ}\\approx ' + deg(x, 0)),
      ['Rise ' + t(g) + ' m over a horizontal run of ' + t('100') + ' m.'], 'grade ' + g + '%', { before: t('\\theta=') });
  }
  function rampPart(L, c, complies) {
    var x = TR.atan(c.rise / c.run);
    var p = near('Ramp ' + L + ' rises ' + t(c.rise) + ' cm over a horizontal run of ' + t(c.run) + ' cm. Determine its angle to the nearest hundredth of a degree.', x, 2,
      [{ v: TR.asin(c.rise / c.run), code: 'used-sin', hint: 'The ' + t(c.run) + ' cm is the <b>horizontal</b> run (adjacent), not the ramp surface. Use TOA.' }, { v: TR.atan(c.run / c.rise), code: 'ratio-flip', hint: 'Your ratio is upside down: the rise is opposite the angle at the ground.' }].concat(std('tan')(c.rise / c.run)),
      'The rise is opposite and the run is adjacent ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\theta=\\tan^{-1}\\left(' + frac(c.rise, c.run) + '\\right)=' + x.toFixed(6) + '^{\\circ}\\approx ' + deg(x, 2)) + '<br>' +
      (complies === true ? '<b>Verdict:</b> Ramp ' + L + ' complies — ' + t(deg(x, 2)) + ' is below the ' + t('4.8^{\\circ}') + ' maximum.' : complies === false ? '<b>Verdict:</b> Ramp ' + L + ' does not comply — ' + t(deg(x, 2)) + ' exceeds the ' + t('4.8^{\\circ}') + ' maximum.' : 'To the nearest hundredth it reads ' + t('4.80^{\\circ}') + ' — too close to the limit to decide from the rounded value.'),
      ['The rise is opposite the angle at the ground; the horizontal run is adjacent.'], 'ramp ' + L + ' angle', { before: t('\\theta=') });
    return p;
  }
})(window);
