/* Math 10C · Unit 9 · Lesson 8 — Right Triangle Trigonometry: A Cumulative Review (M4)
 * Assignment questions 1–18 (u9_L08.tex; 17–18 are the booklet's Extension) and the Lesson 8 Extra Practice
 * (u9_EP08.tex, questions 1–20). Every part is a generator: the booklet's numbers are one possible version, and the
 * other versions keep the same idea and difficulty. Rounded answers use K.near with targeted alternatives (wrong ratio,
 * ratio inverted, radian mode, the other acute angle, rounding too early, eye height, half-angle, …). */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, T = HW.trig;

  HW.addCodes({
    'trig-ratio': 'Used the wrong trig ratio', 'trig-inv': 'Multiplied instead of dividing by the ratio (or the reverse)',
    'trig-rad': 'Calculator in radian mode', 'trig-other-angle': 'Gave the other acute angle', 'trig-no-inv': 'Gave the ratio, not the angle (no inverse key)',
    'trig-recip': 'Treated sin⁻¹ as 1/sin', 'trig-pyth': 'Pythagorean theorem: added instead of subtracted (or the reverse)',
    'trig-eye': 'Eye height left out or used wrongly', 'trig-half': 'Didn’t halve (or didn’t double) at an isosceles/symmetric figure',
    'trig-sum-diff': 'Added two distances instead of subtracting (or the reverse)', 'trig-early': 'Rounded an intermediate value too early',
    'trig-one-piece': 'Gave only one piece of a combined angle', 'trig-oblique': 'Used SOH CAH TOA on a triangle with no right angle',
    'trig-area-half': 'Forgot the ½ in the area', 'trig-bearing-swap': 'North/south and east/west parts swapped',
    'trig-bearing-angle': 'Gave an angle in the triangle, not the bearing', 'trig-back-bearing': 'Return bearing is not the outward bearing ± 180°',
    'trig-complement': 'Used 180° instead of 90° for the other acute angle', 'trig-cofunction': 'Cofunction mix-up (gave the same-angle ratio)',
    'trig-opp-adj': 'Opposite and adjacent swapped', 'trig-hyp-name': 'Hypotenuse named wrongly', 'trig-base-angle': 'Gave a base angle instead of the apex angle',
    'trig-wrong-side': 'Used the wrong side (an edge instead of the diagonal)', 'trig-angle-diff': 'Subtracted or added angles instead of lengths',
    'trig-scale': 'Scaled the angle along with the sides', 'trig-neg-root': 'Kept the negative root', 'trig-frac-dec': 'Fraction with decimals inside'
  });

  /* ---------------- small helpers ---------------- */
  function rnd(x, dp) { return K.roundTo(x, dp); }
  function fx(x, dp) { return rnd(x, dp).toFixed(dp); }
  function dg(x) { return x + '^\\circ'; }
  function d1(r, a, b) { return r.int(Math.round(a * 10), Math.round(b * 10)) / 10; }
  function s1(x) { return Number(x).toFixed(1); }          // a one-decimal measurement as text (45.0)
  function safe(x, dp) { var f = x * Math.pow(10, dp), fr = f - Math.floor(f); return Math.abs(fr - 0.5) > 0.01; } // not right on a rounding edge
  function gen(r, fn, test) { var v; for (var i = 0; i < 400; i++) { v = fn(r); if (test(v)) return v; } return v; }
  var FN = { sin: T.sin, cos: T.cos, tan: T.tan }, RF = { sin: Math.sin, cos: Math.cos, tan: Math.tan }, INV = { sin: T.asin, cos: T.acos, tan: T.atan }, RINV = { sin: Math.asin, cos: Math.acos, tan: Math.atan };
  var NAME = { sin: 'SOH', cos: 'CAH', tan: 'TOA' }, LONG = { opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' };
  function rel(known, want) { // which ratio links the known side to the wanted side, and whether the unknown is on top
    var key = known + '>' + want;
    return { 'hyp>opp': ['sin', 'mul'], 'hyp>adj': ['cos', 'mul'], 'opp>hyp': ['sin', 'div'], 'opp>adj': ['tan', 'div'], 'adj>opp': ['tan', 'mul'], 'adj>hyp': ['cos', 'div'] }[key];
  }
  function sideVal(k, A, fn, op, rad) { var f = (rad ? RF : FN)[fn](rad ? A : A); return op === 'mul' ? k * f : k / f; }
  /* alternatives for a side found from one angle and one side */
  function sideAlts(k, A, known, want, extra) {
    var rr = rel(known, want), fn = rr[0], op = rr[1], out = [];
    out.push({ v: sideVal(k, A, fn, op === 'mul' ? 'div' : 'mul'), code: 'trig-inv', hint: op === 'div'
      ? 'Right ratio, but the unknown is in the <b>denominator</b> here, so the last step is a <b>division</b>: unknown ' + t('=') + ' known ' + t('\\div') + ' ratio.' + (want === 'hyp' ? ' (A hypotenuse must be longer than either leg.)' : '')
      : 'Right ratio, but the unknown is in the <b>numerator</b>, so multiply the known side by the ratio — don’t divide.' });
    out.push({ v: op === 'mul' ? k * RF[fn](A) : k / RF[fn](A), code: 'trig-rad', hint: 'Your calculator seems to be in <b>radian</b> mode. Switch it to <b>degrees</b> (DEG) and try again.' });
    ['sin', 'cos', 'tan'].forEach(function (f) {
      ['mul', 'div'].forEach(function (o) {
        if (f === fn) return;
        out.push({ v: sideVal(k, A, f, o), code: 'trig-ratio', hint: 'Check the ratio. Relative to the ' + t(dg(A)) + ' angle, the side you know is the <b>' + LONG[known] + '</b> and the side you want is the <b>' + LONG[want] + '</b>. Which of SOH, CAH, TOA uses that pair?' });
      });
    });
    return (extra || []).concat(out);
  }
  /* alternatives for an angle found from two sides */
  function angAlts(num, den, fn, dp, extra) {
    var q = num / den, A = INV[fn](q), out = [];
    out.push({ v: 90 - A, code: 'trig-other-angle', hint: 'That is the <b>other</b> acute angle. Relative to the angle you want, which known side is opposite it and which is next to it?' });
    ['sin', 'cos', 'tan'].forEach(function (f) {
      if (f === fn) return;
      [q, 1 / q].forEach(function (v) { if (f === 'tan' || v <= 1) out.push({ v: INV[f](v), code: 'trig-ratio', hint: 'Check the ratio: name the two known sides (opposite, adjacent or hypotenuse) relative to the angle you want, then pick SOH, CAH or TOA.' }); });
    });
    var radV = RINV[fn](q) / 1, tol = 1.3 * Math.pow(10, -dp);
    if (Math.abs(radV - q) <= tol) out.push({ v: q, code: 'trig-no-inv', hint: 'That looks like a ratio (or a radian value), not an angle in degrees. Use the inverse key (' + t('\\' + fn + '^{-1}') + ') with the calculator in <b>degree</b> mode.' });
    else {
      out.push({ v: radV, code: 'trig-rad', hint: 'Your calculator seems to be in <b>radian</b> mode. Switch it to <b>degrees</b> (DEG) and try again.' });
      out.push({ v: q, code: 'trig-no-inv', hint: 'That is the value of the ratio, not the angle. Use the inverse key: ' + t('\\theta=\\' + fn + '^{-1}(\\ldots)') + '.' });
    }
    return (extra || []).concat(out);
  }
  function sideWork(k, ks, A, known, want, x, dp, unit, vn) {
    var rr = rel(known, want), fn = rr[0], op = rr[1]; vn = vn || 'x';
    var eq = '\\' + fn + ' ' + dg(A) + '=' + (op === 'mul' ? '\\dfrac{' + vn + '}{' + ks + '}' : '\\dfrac{' + ks + '}{' + vn + '}');
    var cal = vn + '=' + (op === 'mul' ? ks + '\\' + fn + ' ' + dg(A) : '\\dfrac{' + ks + '}{\\' + fn + ' ' + dg(A) + '}');
    return 'Relative to ' + t(dg(A)) + ': ' + t(ks) + ' is the <b>' + LONG[known] + '</b> and ' + t(vn) + ' is the <b>' + LONG[want] + '</b> ' + t('\\Rightarrow') + ' <b>' + NAME[fn] + '</b>.<br>' + t(eq) + '<br>' + t(cal + '=' + fx(x, 4) + '\\ldots\\approx ' + fx(x, dp)) + (unit ? ' ' + unit : '');
  }
  function angWork(ns, ds, fn, A, dp, vn) {
    vn = vn || '\\theta';
    return t('\\' + fn + ' ' + vn + '=\\dfrac{' + ns + '}{' + ds + '}') + '<br>' + t(vn + '=\\' + fn + '^{-1}\\!\\left(\\dfrac{' + ns + '}{' + ds + '}\\right)=' + fx(A, 2) + '^\\circ\\approx ' + dg(fx(A, dp)));
  }
  function badOf(x, dp, alts) { var w = fx(x, dp), seen = {}; return (alts || []).filter(function (a) { return isFinite(a.v) && a.v > -1e6 && a.v < 1e6; }).map(function (a) { return fx(a.v, dp); }).filter(function (s) { if (s === w || seen[s]) return false; seen[s] = 1; return true; }).slice(0, 6); }
  function near(prompt, x, dp, unit, alts, sol, hints, text, nr) {
    var p = K.P.near(prompt, x, dp, { unit: unit, alts: alts, nr: nr }, sol, hints, text);
    p.bad = badOf(x, dp, alts);
    return p;
  }
  /* one numeric box of a fields part */
  function nf(label, x, dp, unit, alts) { return { label: label, x: x, dp: dp, unit: unit, alts: alts || [] }; }
  function fieldsPart(prompt, list, sol, hints, text) {
    var fields = list.map(function (f) { return { name: f.name || f.label.replace(/\\\(|\\\)|\\/g, ''), before: f.label.indexOf('\\(') >= 0 ? f.label : t(f.label), after: f.unit }; });
    var checks = list.map(function (f) { return f.check || K.near(f.x, f.dp, { alts: f.alts }); });
    var keys = list.map(function (f) { return f.key != null ? f.key : fx(f.x, f.dp); });
    var ans = list.map(function (f, i) { return fields[i].before + ' ' + (f.ansTex || t(keys[i])) + (f.unit ? ' ' + f.unit : ''); }).join(', &nbsp;');
    var p = P.fields(prompt, fields, checks, keys, ans, sol, hints, text);
    var bad = [];
    list.forEach(function (f, i) { if (f.check) return; badOf(f.x, f.dp, f.alts).slice(0, 2).forEach(function (b) { var k = keys.slice(); k[i] = b; bad.push(k); }); });
    p.bad = bad;
    return p;
  }
  /* fraction box (lowest terms) with a nudge for decimals left inside the fraction */
  function fracChk(fr, diag) {
    var c = K.fraction(fr, { diag: diag }), v = fr[0] / fr[1];
    return function (resp) {
      var res = c(resp);
      if (res.v === 'form' && res.code === 'decimal' && /\\frac|\//.test(String(resp))) return form('trig-frac-dec', 'Right value — now clear the decimals: multiply the top and the bottom by ' + t('10') + ' and reduce.');
      return res;
    };
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }
  function fr(p, q) { var g = gcd(p, q); return [p / g, q / g]; }
  function ftex(f) { return f[1] === 1 ? String(f[0]) : '\\frac{' + f[0] + '}{' + f[1] + '}'; }
  function orient(r) { return { rot: r.int(0, 3), flip: r.chance(0.5) }; }
  function tri(o, r) { var or = r ? orient(r) : {}; return HW.tri(Object.assign({ width: 240 }, or, o)); }
  function figWrap(svg) { return '<div class="fig">' + svg + '</div>'; }
  var RAD_HINT = 'Make sure your calculator is in <b>degree</b> mode.';
  function grid(prompt, rows, cols, want, why, sol, hints, text) { var p = P.grid(prompt, rows, cols, want, { why: why }, sol, hints, text); p.tries = 2; return p; }
  function sideGrid(prompt, nm, sides, rel3, ang, sol, text) { // rows: two-letter sides; cols opp/adj/hyp relative to ang
    var cols = [{ id: 'opp', html: 'opposite' }, { id: 'adj', html: 'adjacent' }, { id: 'hyp', html: 'hypotenuse' }];
    var rows = sides.map(function (s) { return { id: s[0], html: t(s[0] + (s[1] != null ? '=' + s[1] : '')), label: s[0] }; });
    var want = {}; sides.forEach(function (s, i) { want[s[0]] = rel3[i]; });
    return grid(prompt, rows, cols, want, function (row, got, w) {
      if (w === 'hyp' || got === 'hyp') return { code: 'trig-hyp-name', hint: 'The hypotenuse is always the side across from the <b>right angle</b> at ' + t(nm.right) + ' — the longest side. It never changes.' };
      return { code: 'trig-opp-adj', hint: 'Opposite and adjacent are measured from ' + t('\\angle ' + ang) + ': the <b>opposite</b> side does not touch ' + t(ang) + '; the <b>adjacent</b> side runs from ' + t(ang) + ' to the right angle.' };
    }, sol, ['Find the right angle first: the side across from it is the hypotenuse.', 'Stand at ' + t('\\angle ' + ang) + ': the leg that touches it is adjacent, the other leg is opposite.'], text);
  }

  /* ---------------- Assignment makers ---------------- */
  var NAMESETS = [['D', 'E', 'F'], ['P', 'Q', 'R'], ['K', 'L', 'M'], ['X', 'Y', 'Z'], ['G', 'H', 'J'], ['S', 'T', 'U']];
  var TRIPLES = [[6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [9, 12, 15], [12, 9, 15], [7, 24, 25], [20, 21, 29], [12, 16, 20]];

  function q8Shared(r) {
    var map = {}; [12, 15, 16, 20, 21, 24, 30, 36].forEach(function (ad) { var l = []; for (var m = 3; m <= 60; m++) { var h = Math.sqrt(ad * ad + m * m); if (Math.abs(h - Math.round(h)) < 1e-9) l.push(m); } map[ad] = l; });
    return gen(r, function (r) { var ad = r.pick([24, 24, 12, 15, 16, 20, 21, 30, 36]), two = r.sample(map[ad], 2).sort(function (a, b) { return a - b; }); return { ad: ad, bd: two[0], dc: two[1] }; },
      function (s) { var a = T.atan(s.bd / s.ad) + T.atan(s.dc / s.ad); return a > 30 && a < 85 && safe(a, 0); });
  }

  function q10Make(r) {
    var V = r.pick([['W', 'Y'], ['W', 'Y'], ['Y', 'V'], ['Y', 'Y'], ['W', 'V']]), th = 40, p = 2.9, q = 3.3;
    var Lf = V[0] === 'W' ? 'sin' : 'cos', Rf = V[1] === 'Y' ? 'cos' : 'sin';
    var xy = p * FN[Lf](th), wx = p * FN[Lf === 'sin' ? 'cos' : 'sin'](th), yz = q * FN[Rf](th), vz = q * FN[Rf === 'sin' ? 'cos' : 'sin'](th);
    var pts = { X: [0, 0], W: [0, wx], Y: [xy, 0], Z: [xy + yz, 0], V: [xy + yz, vz] };
    var angs = [V[0] === 'W' ? ['W', 'X', 'Y', 'θ°'] : ['Y', 'X', 'W', 'θ°'], V[1] === 'Y' ? ['Y', 'Z', 'V', 'θ°'] : ['V', 'Z', 'Y', 'θ°']];
    var fig = HW.fig({ pts: pts, segs: [['W', 'X'], ['X', 'Y'], ['W', 'Y', 'p'], ['Y', 'Z'], ['Z', 'V'], ['Y', 'V', 'q']], right: [['X', 'W', 'Y'], ['Z', 'Y', 'V']], angles: angs, width: 300, aria: 'two right triangles' });
    var angL = V[0] === 'W' ? '\\angle YWX' : '\\angle WYX', angR = V[1] === 'Y' ? '\\angle VYZ' : '\\angle YVZ';
    var roleL = Lf === 'sin' ? 'opposite' : 'adjacent', roleR = Rf === 'cos' ? 'adjacent' : 'opposite';
    var exprs = [['sin', 'cos', 'p\\sin\\theta^\\circ+q\\cos\\theta^\\circ'], ['cos', 'sin', 'p\\cos\\theta^\\circ+q\\sin\\theta^\\circ'], ['cos', 'cos', '(p+q)\\cos\\theta^\\circ'], ['sin', 'sin', '(p+q)\\sin\\theta^\\circ']];
    var opts = exprs.map(function (e) {
      var right = e[0] === Lf && e[1] === Rf, why = [];
      if (e[0] !== Lf) why.push('In ' + t('\\triangle WXY') + ', ' + t('XY') + ' is <b>' + roleL + '</b> to the ' + t('\\theta^\\circ') + ' at ' + t(V[0]) + ' and ' + t('WY=p') + ' is the hypotenuse, so ' + t('XY=p\\' + Lf + '\\theta^\\circ') + '.');
      if (e[1] !== Rf) why.push('In ' + t('\\triangle YZV') + ', ' + t('YZ') + ' is <b>' + roleR + '</b> to the ' + t('\\theta^\\circ') + ' at ' + t(V[1]) + ' and ' + t('YV=q') + ' is the hypotenuse, so ' + t('YZ=q\\' + Rf + '\\theta^\\circ') + '.');
      return { html: t(e[2]), right: right, why: why.join(' ') };
    });
    var ans = exprs.filter(function (e) { return e[0] === Lf && e[1] === Rf; })[0][2];
    var pm = P.mc(r, 'In the diagram, right angles occur at ' + t('X') + ' and ' + t('Z') + ', ' + t('WY=p') + ', ' + t('YV=q') + ', ' + t(angL + '=\\theta^\\circ') + ' and ' + t(angR + '=\\theta^\\circ') + '. The length of ' + t('XZ') + ' is' + figWrap(fig), opts,
      'In right ' + t('\\triangle WXY') + ' the hypotenuse is ' + t('WY=p') + ' and ' + t('XY') + ' is ' + roleL + ' to ' + t('\\theta^\\circ') + ' ' + t('\\Rightarrow') + ' ' + NAME[Lf] + ': ' + t('XY=p\\' + Lf + '\\theta^\\circ') + '.<br>In right ' + t('\\triangle YZV') + ' the hypotenuse is ' + t('YV=q') + ' and ' + t('YZ') + ' is ' + roleR + ' to ' + t('\\theta^\\circ') + ' ' + t('\\Rightarrow') + ' ' + NAME[Rf] + ': ' + t('YZ=q\\' + Rf + '\\theta^\\circ') + '.<br>' + t('X') + ', ' + t('Y') + ', ' + t('Z') + ' are collinear, so ' + t('XZ=XY+YZ=' + ans) + '.',
      ['Split ' + t('XZ') + ' into ' + t('XY+YZ') + ' and find each piece in its own right triangle.', 'In each triangle, is the piece on the ground opposite or adjacent to the marked ' + t('\\theta^\\circ') + '?'], 'XZ two triangles ' + V.join(''), true);
    return pm;
  }

  /* ---------------- Extra-practice helpers ---------------- */
  var RAMPS = [[60, 11, 61], [40, 9, 41], [24, 7, 25], [84, 13, 85], [63, 16, 65], [35, 12, 37], [48, 14, 50], [80, 18, 82]];
  var HALFTRIP = [[5, 12, 13, 2.5], [5, 12, 13, 1.5], [5, 12, 13, 3.5], [3, 4, 5, 2.5], [3, 4, 5, 3.5], [3, 4, 5, 4.5], [8, 15, 17, 1.5], [8, 15, 17, 2.5], [7, 24, 25, 1.5], [20, 21, 29, 1.5]];
  var QTRIP = [[8, 15, 17], [5, 12, 13], [9, 12, 15], [7, 24, 25], [12, 16, 20], [15, 20, 25], [12, 35, 37], [20, 48, 52]];
  function mcWhy(r, prompt, right, wrongs, sol, hints, text) { return P.mc(r, prompt, [{ html: right, right: true }].concat(wrongs.map(function (w) { return { html: w[0], why: w[1] }; })), sol, hints || [], text); }
  function tfv(r, versions, text) { // versions: [{ s, truth, why, sol }] — one is picked
    var v = r.pick(versions);
    return P.tf(r, '“' + v.s + '”', v.truth, v.why, v.sol, v.hints || ['Test the claim on a triangle you know, such as one with sides 3, 4, 5.'], text);
  }

  function sixRatios(s, ang) { // EP1: the three ratios of angle A or C as exact fractions
    var vals = ang === 'A' ? { sin: fr(s.S, s.Hy), cos: fr(s.L, s.Hy), tan: fr(s.S, s.L) } : { sin: fr(s.L, s.Hy), cos: fr(s.S, s.Hy), tan: fr(s.L, s.S) };
    var opp = ang === 'A' ? 'BC' : 'AB', adj = ang === 'A' ? 'AB' : 'BC', ov = ang === 'A' ? s1(s.bc) : s1(s.ab), av = ang === 'A' ? s1(s.ab) : s1(s.bc);
    function dg2(me) { return function (v) { for (var k in vals) if (k !== me && Math.abs(v - vals[k][0] / vals[k][1]) < 1e-9) return { code: 'trig-ratio', hint: 'That is ' + t('\\' + k + ' ' + ang) + '. Relative to ' + t('\\angle ' + ang) + ': opposite ' + t('=' + opp) + ', adjacent ' + t('=' + adj) + ', hypotenuse ' + t('=AC') + '.' }; return null; }; }
    var p = fieldsPart('Using the three side lengths (' + t('AC=' + s1(s.ac)) + ' m), write ' + t('\\sin ' + ang) + ', ' + t('\\cos ' + ang) + ' and ' + t('\\tan ' + ang) + ' as fractions in lowest terms.',
      ['sin', 'cos', 'tan'].map(function (k) { return { label: t('\\' + k + ' ' + ang + '='), name: k + ' ' + ang, check: fracChk(vals[k], dg2(k)), key: ftex(vals[k]), ansTex: t(ftex(vals[k])) }; }),
      t('\\sin ' + ang + '=\\frac{' + opp + '}{AC}=\\frac{' + ov + '}{' + s1(s.ac) + '}=' + ftex(vals.sin)) + ', ' + t('\\cos ' + ang + '=\\frac{' + adj + '}{AC}=\\frac{' + av + '}{' + s1(s.ac) + '}=' + ftex(vals.cos)) + ', ' + t('\\tan ' + ang + '=\\frac{' + opp + '}{' + adj + '}=\\frac{' + ov + '}{' + av + '}=' + ftex(vals.tan)) + ' (multiply top and bottom by ' + t('10') + ' to clear the decimals).',
      ['Name the opposite and adjacent sides relative to ' + t('\\angle ' + ang) + ' first.', 'Clear the decimals by multiplying the top and bottom by ' + t('10') + '.'], 'six ratios ' + ang);
    p.input.fields.forEach(function (f) { f.mode = 'math'; f.keys = 'fraction'; });
    p.bad = [[ftex(vals.cos), ftex(vals.sin), ftex(vals.tan)], ['\\frac{' + ov + '}{' + s1(s.ac) + '}', ftex(vals.cos), ftex(vals.tan)]];
    return p;
  }
  function bearGeom(s) { // EP11: two-leg route
    var a1 = 180 - s.b1, e1 = s.d1 * T.sin(a1), sv = s.d1 * T.cos(a1), e2 = s.d2 * T.sin(s.b2), n2 = s.d2 * T.cos(s.b2), E = e1 + e2, So = sv - n2;
    return { e1: e1, s1: sv, e2: e2, n2: n2, E: E, S: sv, N: n2, AC: Math.hypot(E, So), br: 180 - T.atan(E / So) };
  }
  function obl(s) { // EP15: triangle with no right angle, altitude from B
    var bd = s.ab * T.sin(s.A), ad = s.ab * T.cos(s.A), dc = s.ac - ad, C = T.atan(bd / dc);
    return { bd: bd, ad: ad, dc: dc, bc: Math.hypot(bd, dc), C: C, B: 180 - s.A - C, wrong: s.ab * T.tan(s.A) };
  }
  function roof(s) { var h = s.sp / (1 / T.tan(s.a1) + 1 / T.tan(s.a2)); return { h: h, l1: h / T.sin(s.a1), l2: h / T.sin(s.a2), lf: h / T.tan(s.a1), fr: h / T.tan(s.a2) }; }
  /* EP16: (distance, angle, walk) where rounding h to a tenth changes the whole-degree answer — booklet 12.5 m, 68°, 40 m */
  var EP16 = [[8,59,40],[8,62,25],[8,65,20],[8,65,25],[8,65,50],[8.5,55,30],[8.5,67,45],[8.5,67,55],[8.5,69,40],[8.5,74,25],[9,57,35],[9,61,25],[9,63,25],[9,64,20],[9,64,25],[9,73,50],[9.5,55,25],[9.5,56,45],[9.5,60,25],[9.5,62,55],[9.5,64,40],[9.5,65,45],[9.5,72,30],[9.5,73,20],[10,56,40],[10,59,50],[10,61,55],[10,67,30],[10,68,60],[10,69,50],[10,70,20],[10,70,30],[10.5,57,25],[10.5,59,45],[10.5,66,60],[10.5,67,35],[11,57,50],[11,60,35],[11,60,40],[11,61,45],[11,69,55],[11,72,60],[11.5,62,30],[11.5,68,35],[12,63,25],[12,66,50],[12,71,55],[12,74,25],[12.5,55,25],[12.5,56,50],[12.5,57,45],[12.5,61,55],[12.5,68,25],[12.5,68,40],[12.5,68,40],[12.5,68,40],[12.5,75,35],[13,59,60],[13,62,20],[13,62,60],[13,74,30],[13,75,55],[13.5,56,40],[13.5,59,50],[13.5,61,40],[13.5,65,60],[14,65,55],[14.5,59,50],[15,56,60],[15,59,20],[15,73,20],[15.5,56,40],[15.5,60,25],[15.5,60,30],[15.5,70,40],[15.5,74,55],[16,66,45],[16.5,59,25],[16.5,65,35],[17,60,20],[17,60,35],[17,64,50],[17.5,56,60],[17.5,59,30],[18,59,35],[18,61,35],[18.5,57,20],[18.5,61,25],[18.5,66,55],[19,64,30],[19,67,25],[19.5,62,25],[20,59,25]];

  HW.defineLesson({
    id: 'u9l8', unit: 9, num: '8', title: 'Right Triangle Trigonometry: A Cumulative Review', outcome: 'M4',
    blurb: 'Naming sides, solving for a side, solving for an angle, elevation and depression, and splitting a figure into right triangles (extension: bearings and 3-D).',
    questions: [
      /* ---------- 1 ---------- */
      { num: '1', section: 'Assignment — Sides, ratios and solving',
        shared: function (r) { var tr = r.pick(TRIPLES), nm = r.pick(NAMESETS); return { adj: tr[0], opp: tr[1], hyp: tr[2], R: nm[0], E: nm[1], F: nm[2], o: orient(r) }; },
        stem: function (s) {
          return 'Triangle ' + t(s.R + s.E + s.F) + ' has a right angle at ' + t(s.R) + ', with ' + t(s.R + s.E + '=' + s.adj) + ', ' + t(s.R + s.F + '=' + s.opp) + ' and ' + t(s.E + s.F + '=' + s.hyp) + '.' +
            figWrap(HW.tri(Object.assign({ w: s.adj, h: s.opp, names: [s.E, s.F, s.R], sides: { a: String(s.opp), b: String(s.adj), c: String(s.hyp) }, width: 220 }, s.o)));
        },
        parts: [
          { id: '1a', level: 'LIM', make: function (r, s) {
            return sideGrid('Relative to angle ' + t(s.E) + ', name each side.', { right: s.R }, [[s.R + s.E, s.adj], [s.R + s.F, s.opp], [s.E + s.F, s.hyp]], ['adj', 'opp', 'hyp'], s.E,
              'Opposite ' + t(s.E) + ' is ' + t(s.R + s.F + '=' + s.opp) + ' (it does not touch ' + t(s.E) + '); adjacent to ' + t(s.E) + ' is ' + t(s.R + s.E + '=' + s.adj) + '; the hypotenuse is ' + t(s.E + s.F + '=' + s.hyp) + ', across from the right angle.', 'name sides rel. ' + s.E);
          } },
          { id: '1b', level: 'BEG', make: function (r, s) {
            var sn = fr(s.opp, s.hyp), cs = fr(s.adj, s.hyp), tn = fr(s.opp, s.adj), vals = { sin: sn, cos: cs, tan: tn };
            function dg2(me) { return function (v) { for (var k in vals) if (k !== me && Math.abs(v - vals[k][0] / vals[k][1]) < 1e-9) return { code: 'trig-ratio', hint: 'That is ' + t('\\' + k + ' ' + s.E) + '. ' + t('\\' + me) + ' uses the ' + { sin: 'opposite and the hypotenuse', cos: 'adjacent side and the hypotenuse', tan: 'opposite and the adjacent side' }[me] + '.' }; return null; }; }
            var list = ['sin', 'cos', 'tan'].map(function (k) { return { label: t('\\' + k + ' ' + s.E + '='), name: k + ' ' + s.E, check: fracChk(vals[k], dg2(k)), key: ftex(vals[k]), ansTex: t(ftex(vals[k])) }; });
            var p = fieldsPart('Write ' + t('\\sin ' + s.E) + ', ' + t('\\cos ' + s.E) + ' and ' + t('\\tan ' + s.E) + ' as fractions in lowest terms.', list,
              'opp ' + t('=' + s.opp) + ', adj ' + t('=' + s.adj) + ', hyp ' + t('=' + s.hyp) + ':<br>' + t('\\sin ' + s.E + '=\\frac{' + s.opp + '}{' + s.hyp + '}=' + ftex(sn) + ',\\quad \\cos ' + s.E + '=\\frac{' + s.adj + '}{' + s.hyp + '}=' + ftex(cs) + ',\\quad \\tan ' + s.E + '=\\frac{' + s.opp + '}{' + s.adj + '}=' + ftex(tn)),
              ['SOH CAH TOA: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent.', 'Reduce each fraction by the common factor.'], 'sin cos tan ' + s.E);
            p.input.fields.forEach(function (f) { f.mode = 'math'; f.keys = 'fraction'; });
            p.bad = [[ftex(cs), ftex(sn), ftex(tn)], [ftex(sn), ftex(cs), '\\frac{' + tn[1] + '}{' + tn[0] + '}']];
            return p;
          } },
          { id: '1c', level: 'EMG', make: function (r, s) {
            var sn = fr(s.opp, s.hyp), cs = fr(s.adj, s.hyp);
            var p = P.fraction('Without further calculation, state the value of ' + t('\\cos ' + s.F) + '.', sn, { before: t('\\cos ' + s.F + '='), diag: function (v) {
              if (Math.abs(v - cs[0] / cs[1]) < 1e-9) return { code: 'trig-cofunction', hint: 'That is ' + t('\\cos ' + s.E) + '. Relative to ' + t(s.F) + ' the legs swap roles: the side adjacent to ' + t(s.F) + ' is the side opposite ' + t(s.E) + '.' };
              return null; } },
              t(s.E) + ' and ' + t(s.F) + ' are complementary, so ' + t('\\cos ' + s.F + '=\\sin ' + s.E + '=' + ftex(sn)) + '. (Check: adjacent to ' + t(s.F) + ' is ' + t(s.R + s.F + '=' + s.opp) + ', so ' + t('\\cos ' + s.F + '=\\frac{' + s.opp + '}{' + s.hyp + '}') + '.)',
              ['The two acute angles add to ' + t('90^\\circ') + '. Which ratio of ' + t(s.E) + ' equals ' + t('\\cos ' + s.F) + '?'], 'cos ' + s.F + ' cofunction');
            p.input.before = t('\\cos ' + s.F + '='); p.bad = [ftex(cs)];
            return p;
          } }] },
      /* ---------- 2 ---------- */
      { num: '2',
        shared: function (r) { return gen(r, function (r) { return { A: r.int(25, 55), k: d1(r, 8, 20), o: orient(r) }; }, function (s) { return safe(s.k * T.tan(s.A), 1) && safe(s.k / T.cos(s.A), 1); }); },
        stem: function (s) { return 'In the right triangle below, one acute angle measures ' + t(dg(s.A)) + ' and the side adjacent to it measures ' + t(s1(s.k)) + ' cm.' + figWrap(HW.tri(Object.assign({ w: 4, h: 4 * T.tan(s.A), sides: { b: s1(s.k) + ' cm' }, angles: { A: s.A + '°' }, hideNames: true, width: 240 }, s.o))); },
        parts: [
          { id: '2a', level: 'BEG', make: function (r, s) { var x = s.k * T.tan(s.A), al = sideAlts(s.k, s.A, 'adj', 'opp');
            return near('Determine the length of the side opposite the ' + t(dg(s.A)) + ' angle, to the nearest tenth of a centimetre.', x, 1, 'cm', al, sideWork(s.k, s1(s.k), s.A, 'adj', 'opp', x, 1, 'cm'), ['Label the sides relative to the ' + t(dg(s.A)) + ' angle first.', RAD_HINT], 'opp from adj ' + s.A); } },
          { id: '2b', level: 'EMG', make: function (r, s) { var x = s.k / T.cos(s.A), al = sideAlts(s.k, s.A, 'adj', 'hyp');
            return near('Determine the length of the hypotenuse, to the nearest tenth of a centimetre.', x, 1, 'cm', al, sideWork(s.k, s1(s.k), s.A, 'adj', 'hyp', x, 1, 'cm', 'h'), ['Which ratio uses the adjacent side and the hypotenuse?', 'The unknown ends up in the denominator — the last step is a division.'], 'hyp from adj ' + s.A); } }] },
      /* ---------- 3 ---------- */
      { num: '3',
        shared: function (r) { return gen(r, function (r) { return { A: r.int(20, 60), k: r.int(12, 40), o: orient(r) }; }, function (s) { return safe(s.k * T.sin(s.A), 1) && safe(s.k * T.cos(s.A), 1); }); },
        stem: function (s) { return 'In the right triangle below, one acute angle measures ' + t(dg(s.A)) + ' and the hypotenuse measures ' + t(s.k) + ' m.' + figWrap(HW.tri(Object.assign({ w: 4, h: 4 * T.tan(s.A), sides: { c: s.k + ' m' }, angles: { A: s.A + '°' }, hideNames: true, width: 240 }, s.o))); },
        parts: [
          { id: '3a', level: 'BEG', make: function (r, s) { var x = s.k * T.sin(s.A), al = sideAlts(s.k, s.A, 'hyp', 'opp');
            return near('Determine the length of the side opposite the ' + t(dg(s.A)) + ' angle, to the nearest tenth of a metre.', x, 1, 'm', al, sideWork(s.k, String(s.k), s.A, 'hyp', 'opp', x, 1, 'm'), ['The side you know is the hypotenuse.', RAD_HINT], 'opp from hyp ' + s.A); } },
          { id: '3b', level: 'BEG', make: function (r, s) { var x = s.k * T.cos(s.A), al = sideAlts(s.k, s.A, 'hyp', 'adj');
            return near('Determine the length of the side adjacent to the ' + t(dg(s.A)) + ' angle, to the nearest tenth of a metre.', x, 1, 'm', al, sideWork(s.k, String(s.k), s.A, 'hyp', 'adj', x, 1, 'm'), ['Which ratio uses the adjacent side and the hypotenuse?', RAD_HINT], 'adj from hyp ' + s.A); } }] },
      /* ---------- 4, 5 ---------- */
      { num: '4', parts: [
        { id: '4', level: 'BEG', make: function (r) {
          var s = gen(r, function (r) { return { o: r.int(5, 20), a: r.int(5, 20) }; }, function (s) { return s.o !== s.a && safe(T.atan(s.o / s.a), 0); }), A = T.atan(s.o / s.a), al = angAlts(s.o, s.a, 'tan', 0);
          return near('The leg opposite angle ' + t('p^\\circ') + ' measures ' + t(s.o) + ' and the leg adjacent to ' + t('p^\\circ') + ' measures ' + t(s.a) + '. Determine the measure of angle ' + t('p^\\circ') + ', to the nearest degree.' +
            figWrap(tri({ w: s.a, h: s.o, sides: { a: String(s.o), b: String(s.a) }, angles: { A: 'p°' }, hideNames: true, width: 230 }, r)), A, 0, '°', al,
            'opp ' + t('=' + s.o) + ', adj ' + t('=' + s.a) + ' ' + t('\\Rightarrow') + ' TOA.<br>' + angWork(s.o, s.a, 'tan', A, 0, 'p^\\circ'), ['Opposite and adjacent: TOA.', 'Use ' + t('\\tan^{-1}') + ' in degree mode.'], 'p from opp ' + s.o + ' adj ' + s.a);
        } }] },
      { num: '5', parts: [
        { id: '5', level: 'BEG', make: function (r) {
          var s = gen(r, function (r) { return { a: d1(r, 2.0, 9.9), o: d1(r, 2.0, 9.9) }; }, function (s) { var q = s.o / s.a; return q > 0.4 && q < 2.6 && Math.abs(q - 1) > 0.08 && safe(T.atan(q), 1); }), A = T.atan(s.o / s.a), al = angAlts(s.o, s.a, 'tan', 1);
          return near('The leg adjacent to angle ' + t('q^\\circ') + ' measures ' + t(s1(s.a)) + ' and the leg opposite ' + t('q^\\circ') + ' measures ' + t(s1(s.o)) + '. Determine the measure of angle ' + t('q^\\circ') + ', to the nearest tenth of a degree.' +
            figWrap(tri({ w: s.a, h: s.o, sides: { a: s1(s.o), b: s1(s.a) }, angles: { A: 'q°' }, hideNames: true, width: 230 }, r)), A, 1, '°', al,
            'opp ' + t('=' + s1(s.o)) + ', adj ' + t('=' + s1(s.a)) + ' ' + t('\\Rightarrow') + ' TOA.<br>' + angWork(s1(s.o), s1(s.a), 'tan', A, 1, 'q^\\circ'), ['Which side is opposite ' + t('q^\\circ') + '? Put it on top.', 'Use ' + t('\\tan^{-1}') + ' in degree mode.'], 'q from adj ' + s.a + ' opp ' + s.o);
        } }] },
      /* ---------- 6, 7 ---------- */
      { num: '6', parts: [
        { id: '6', level: 'EMG', make: function (r) {
          var s = gen(r, function (r) { return { h: d1(r, 8, 25), sh: d1(r, 5, 25) }; }, function (s) { var q = s.h / s.sh; return q > 0.5 && q < 2.5 && safe(T.atan(q), 1); }), A = T.atan(s.h / s.sh);
          var al = angAlts(s.h, s.sh, 'tan', 1); al[0].hint = 'That is the angle at the <b>top</b> of the tree. The angle of elevation of the sun is at the tip of the shadow, on the ground.';
          var fig = HW.fig({ pts: { B: [0, 0], Tp: [0, s.h], S: [s.sh, 0] }, segs: [['B', 'Tp', s1(s.h) + ' m', { color: '#3d7a4f', width: 3 }], ['B', 'S', s1(s.sh) + ' m'], ['S', 'Tp', { dash: 1 }]], right: [['B', 'S', 'Tp']], angles: [['S', 'B', 'Tp', 'θ°']], names: false, extra: [{ type: 'ground', y: 0, x0: -0.15 * s.sh, x1: 1.15 * s.sh }], width: 240, aria: 'tree and its shadow' });
          return near('A tree casts a shadow ' + t(s1(s.sh)) + ' m long while the tree itself is ' + t(s1(s.h)) + ' m tall. Determine, to the nearest tenth of a degree, the angle of elevation of the sun.' + figWrap(fig), A, 1, '°', al,
            'Height (opposite) ' + t('=' + s1(s.h)) + ', shadow (adjacent) ' + t('=' + s1(s.sh)) + ' ' + t('\\Rightarrow') + ' TOA.<br>' + angWork(s1(s.h), s1(s.sh), 'tan', A, 1, '\\theta^\\circ'), ['The angle of elevation is at the tip of the shadow. Which side is opposite it?'], 'sun elevation tree ' + s.h + '/' + s.sh);
        } }] },
      { num: '7', parts: [
        { id: '7', level: 'EMG', make: function (r) {
          var s = gen(r, function (r) { return { H: r.int(25, 90), A: r.int(12, 40) }; }, function (s) { return safe(s.H / T.tan(s.A), 1); }), x = s.H / T.tan(s.A);
          var al = sideAlts(s.H, s.A, 'opp', 'adj'); al[0].hint = 'The angle of depression is measured down from the <b>horizontal</b> at the cliff top, so it equals the angle of elevation at the boat. From the boat, the ' + t(s.H) + ' m cliff is <b>opposite</b> and the distance is <b>adjacent</b> — the unknown is in the denominator, so divide.';
          var fig = HW.fig({ pts: { Bs: [0, 0], C: [0, s.H], Kb: [x, 0], Hz: [x * 0.75, s.H] }, segs: [['Bs', 'C', s.H + ' m'], ['Bs', 'Kb', 'd'], ['C', 'Kb']], right: [['Bs', 'C', 'Kb']], angles: [['C', 'Hz', 'Kb', s.A + '°', { r: 48 }]], names: { Kb: 'boat' },
            extra: [{ type: 'dash', from: [0, s.H], to: [x * 0.75, s.H] }, { type: 'ground', y: 0, x0: -0.05 * x, x1: 1.08 * x }], width: 300, aria: 'cliff and boat' });
          return near('From the top of a cliff ' + t(s.H) + ' m high, the angle of depression of a boat on the water is ' + t(dg(s.A)) + '. Determine, to the nearest tenth of a metre, the horizontal distance ' + t('d') + ' from the base of the cliff to the boat.' + figWrap(fig), x, 1, 'm', al,
            'The angle of depression from the cliff top equals the angle of elevation at the boat (alternate angles), so ' + t(s.H) + ' m is opposite ' + t(dg(s.A)) + ' and ' + t('d') + ' is adjacent ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\tan ' + dg(s.A) + '=\\dfrac{' + s.H + '}{d}\\ \\Rightarrow\\ d=\\dfrac{' + s.H + '}{\\tan ' + dg(s.A) + '}=' + fx(x, 4) + '\\ldots\\approx ' + fx(x, 1)) + ' m',
            ['Move the ' + t(dg(s.A)) + ' down to the boat: the angle of depression equals the angle of elevation.', 'The unknown ends up in the denominator.'], 'cliff ' + s.H + ' depression ' + s.A);
        } }] },
      /* ---------- 8 ---------- */
      { num: '8', shared: q8Shared,
        stem: function (s) {
          var ab = Math.round(Math.hypot(s.ad, s.bd)), ac = Math.round(Math.hypot(s.ad, s.dc));
          var fig = HW.fig({ pts: { B: [0, 0], D: [s.bd, 0], C: [s.bd + s.dc, 0], A: [s.bd, s.ad] }, segs: [['B', 'D', String(s.bd)], ['D', 'C'], ['A', 'B', String(ab)], ['A', 'D'], ['A', 'C', String(ac)]], right: [['D', 'C', 'A']], width: 280, aria: 'two right triangles sharing AD' });
          return 'Two right triangles share the common side ' + t('AD') + ', with ' + t('D') + ' on ' + t('BC') + ' between ' + t('B') + ' and ' + t('C') + '. ' + t('AB=' + ab) + ', ' + t('BD=' + s.bd) + ' and ' + t('AC=' + ac) + '.' + figWrap(fig);
        },
        parts: [
          { id: '8a', level: 'BEG', make: function (r, s) {
            var ab = Math.round(Math.hypot(s.ad, s.bd));
            var p = P.number('Use the Pythagorean Theorem to calculate the length of ' + t('AD') + '.', s.ad, function (v) {
              if (Math.abs(v - Math.hypot(ab, s.bd)) < 0.06) return { code: 'trig-pyth', hint: t('AB') + ' is the <b>hypotenuse</b> of ' + t('\\triangle ABD') + ', so subtract: ' + t('AD^2=AB^2-BD^2') + '.' };
              return null; }, t('\\triangle ABD') + ' is right-angled at ' + t('D') + ' with hypotenuse ' + t('AB=' + ab) + ':<br>' + t('AD=\\sqrt{' + ab + '^2-' + s.bd + '^2}=\\sqrt{' + (ab * ab) + '-' + (s.bd * s.bd) + '}=\\sqrt{' + (s.ad * s.ad) + '}=' + s.ad),
              ['Which side of ' + t('\\triangle ABD') + ' is the hypotenuse?'], 'AD pythag ' + ab + ',' + s.bd, { before: t('AD=') });
            p.bad = [fx(Math.hypot(ab, s.bd), 1)];
            return p;
          } },
          { id: '8b', level: 'PRG', make: function (r, s) {
            var a1 = T.atan(s.bd / s.ad), a2 = T.atan(s.dc / s.ad), A = a1 + a2;
            var al = [{ v: a2, code: 'trig-one-piece', hint: 'That is only ' + t('\\angle DAC') + '. ' + t('\\angle BAC') + ' is made of two pieces: ' + t('\\angle BAD+\\angle DAC') + '.' },
              { v: a1, code: 'trig-one-piece', hint: 'That is only ' + t('\\angle BAD') + '. Add ' + t('\\angle DAC') + ' from the other triangle.' },
              { v: T.atan((s.bd + s.dc) / s.ad), code: 'trig-oblique', hint: t('\\triangle ABC') + ' has no right angle at ' + t('A') + ', so ' + t('\\tan(\\angle BAC)\\ne\\frac{BC}{AD}') + '. Find the two pieces of the angle in the two right triangles and add them.' }];
            al.push({ v: Math.round(a1) + Math.round(a2), code: 'trig-early', hint: 'Add the two pieces <b>before</b> rounding — round only the final angle.' });
            return near('Determine, to the nearest degree, the measure of ' + t('\\angle BAC') + '.', A, 0, '°', al.concat(angAlts(s.dc, s.ad, 'tan', 0).slice(2)),
              'In ' + t('\\triangle ADC') + ': ' + t('DC=\\sqrt{' + Math.round(Math.hypot(s.ad, s.dc)) + '^2-' + s.ad + '^2}=' + s.dc) + '.<br>' + t('\\tan(\\angle BAD)=\\frac{' + s.bd + '}{' + s.ad + '}\\Rightarrow \\angle BAD=' + fx(a1, 2) + '^\\circ') + '<br>' + t('\\tan(\\angle DAC)=\\frac{' + s.dc + '}{' + s.ad + '}\\Rightarrow \\angle DAC=' + fx(a2, 2) + '^\\circ') + '<br>' + t('\\angle BAC=' + fx(a1, 2) + '^\\circ+' + fx(a2, 2) + '^\\circ=' + fx(A, 2) + '^\\circ\\approx ' + dg(fx(A, 0))),
              ['Split ' + t('\\angle BAC') + ' along ' + t('AD') + ' into two angles, one in each right triangle.', 'You need ' + t('DC') + ' first: Pythagoras in ' + t('\\triangle ADC') + '.'], 'angle BAC chain');
          } }] },
      /* ---------- 9 ---------- */
      { num: '9', parts: [
        { id: '9', level: 'ADV', make: function (r) {
          var s = gen(r, function (r) { var e = r.int(12, 40); return { e: e, b: 2 * r.int(4, e - 2) }; }, function (s) { var a = 2 * T.asin(s.b / 2 / s.e); return a > 30 && a < 110 && safe(a, 0); });
          var hf = s.b / 2, half = T.asin(hf / s.e), A = 2 * half;
          var al = [{ v: half, code: 'trig-half', hint: 'That is half of ' + t('\\angle PQR') + ' — the altitude splits the apex angle in two. Double it.' },
            { v: s.b < s.e ? 2 * T.asin(s.b / s.e) : NaN, code: 'trig-half', hint: 'The altitude meets the base at its <b>midpoint</b>, so the side opposite the half-angle is ' + t(hf) + ' cm, not ' + t(s.b) + ' cm.' },
            { v: s.b < s.e ? T.asin(s.b / s.e) : NaN, code: 'trig-half', hint: 'Drop the altitude from ' + t('Q') + ': it cuts the base in half (' + t(hf) + ' cm) and cuts the apex angle in half.' },
            { v: T.acos(hf / s.e), code: 'trig-base-angle', hint: 'That is a base angle (at ' + t('P') + ' or ' + t('R') + '). The question asks for the angle at ' + t('Q') + '.' },
            { v: 2 * T.acos(hf / s.e), code: 'trig-ratio', hint: 'Relative to the half-angle at ' + t('Q') + ', the ' + t(hf) + ' cm half-base is <b>opposite</b> and ' + t(s.e) + ' cm is the hypotenuse — SOH.' },
            { v: 2 * RINV.sin(hf / s.e), code: 'trig-rad', hint: 'Your calculator seems to be in radian mode.' }];
          var hgt = Math.sqrt(s.e * s.e - hf * hf), sc = 1;
          var fig = HW.fig({ pts: { P: [-hf * sc, 0], R: [hf * sc, 0], Q: [0, hgt * sc] }, segs: [['P', 'R', s.b + ' cm'], ['P', 'Q', s.e + ' cm'], ['Q', 'R', s.e + ' cm']], width: 220, aria: 'isosceles triangle' });
          return near('Isosceles triangle ' + t('PQR') + ' has ' + t('PQ=RQ=' + s.e) + ' cm and base ' + t('PR=' + s.b) + ' cm. Determine, to the nearest degree, the measure of ' + t('\\angle PQR') + '.' + figWrap(fig), A, 0, '°', al,
            'Drop the altitude from ' + t('Q') + ' to the midpoint ' + t('N') + ' of ' + t('PR') + ': two congruent right triangles with ' + t('PN=' + hf) + ' and hypotenuse ' + t('PQ=' + s.e) + ' ' + t('\\Rightarrow') + ' SOH.<br>' + t('\\sin(\\angle PQN)=\\frac{' + hf + '}{' + s.e + '}\\Rightarrow \\angle PQN=' + fx(half, 2) + '^\\circ') + '<br>The altitude bisects the apex angle: ' + t('\\angle PQR=2(' + fx(half, 2) + '^\\circ)=' + fx(A, 2) + '^\\circ\\approx ' + dg(fx(A, 0))),
            ['There is no right angle yet. Draw the altitude from ' + t('Q') + ' to the base.', 'The altitude cuts both the base and the angle at ' + t('Q') + ' in half.'], 'isosceles apex ' + s.e + ',' + s.b);
        } }] },
      /* ---------- 10–12 ---------- */
      { num: '10', section: 'Diploma-style questions', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '10', level: 'PRG', make: function (r) { return q10Make(r); } }] },
      { num: '11', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '11', level: 'PRG', make: function (r) {
          var s = gen(r, function (r) { var a = r.int(20, 60), z = r.int(40, 90); return { A: a, y: r.int(25, z - 8), z: z }; }, function (s) { return safe(0.5 * s.y * s.z * T.sin(s.A), 0); });
          var h = s.y * T.sin(s.A), area = 0.5 * s.z * h;
          var al = [{ v: s.z * h, code: 'trig-area-half', hint: 'Area of a triangle is ' + t('\\tfrac{1}{2}\\times\\text{base}\\times\\text{height}') + ' — don’t forget the ' + t('\\tfrac12') + '.' },
            { v: 0.5 * s.z * s.y * T.cos(s.A), code: 'trig-ratio', hint: 'The height ' + t('YW') + ' is <b>opposite</b> ' + t('\\angle X') + ' in right ' + t('\\triangle XYW') + ', with hypotenuse ' + t('XY') + ' — SOH, not CAH.' },
            { v: 0.5 * s.z * s.y * T.tan(s.A), code: 'trig-ratio', hint: 'In right ' + t('\\triangle XYW') + ', ' + t('XY=' + s.y) + ' is the hypotenuse, so the height is ' + t(s.y + '\\sin ' + dg(s.A)) + '.' },
            { v: 0.5 * s.z * s.y, code: 'trig-oblique', hint: t('XY') + ' is not the height — it is slanted. Drop the altitude from ' + t('Y') + ' to ' + t('XZ') + ' and find its length first.' },
            { v: 0.5 * s.z * s.y * Math.sin(s.A), code: 'trig-rad', hint: 'Your calculator seems to be in radian mode.' }];
          var X = [0, 0], Z = [s.z, 0], Y = [s.y * T.cos(s.A), h];
          var fig = HW.fig({ pts: { X: X, Z: Z, Y: Y }, segs: [['X', 'Y', s.y + ' cm'], ['X', 'Z', s.z + ' cm'], ['Y', 'Z']], angles: [['X', 'Z', 'Y', s.A + '°', { r: 30 }]], width: 300, aria: 'triangle XYZ' });
          return near('In triangle ' + t('XYZ') + ', ' + t('\\angle X=' + dg(s.A)) + ', ' + t('XY=' + s.y) + ' cm and ' + t('XZ=' + s.z) + ' cm. The area of triangle ' + t('XYZ') + ', to the nearest square centimetre, is ______ cm².' + figWrap(fig), area, 0, 'cm²', al,
            'Drop the altitude from ' + t('Y') + ' to ' + t('XZ') + ', meeting it at ' + t('W') + '. In right ' + t('\\triangle XYW') + ' the hypotenuse is ' + t('XY=' + s.y) + ' and ' + t('YW') + ' is opposite ' + t('\\angle X') + ' ' + t('\\Rightarrow') + ' SOH.<br>' + t('YW=' + s.y + '\\sin ' + dg(s.A) + '=' + fx(h, 4) + '\\ldots') + ' cm<br>' + t('\\text{Area}=\\tfrac12(' + s.z + ')(' + fx(h, 4) + ')=' + fx(area, 4) + '\\approx ' + fx(area, 0)),
            ['There is no right angle, so you need a height: drop a perpendicular from ' + t('Y') + ' to ' + t('XZ') + '.', 'Area ' + t('=\\tfrac12\\times\\text{base}\\times\\text{height}') + '.'], 'area via altitude ' + s.A, true);
        } }] },
      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '12', level: 'ADV', make: function (r) {
          var s = gen(r, function (r) { var a = r.int(8, 20); return { H: d1(r, 30, 60), a: a, b: r.int(a + 5, 34) }; }, function (s) { var d = s.H / T.tan(s.a) - s.H / T.tan(s.b); return d >= 15 && d <= 99.9 && safe(d, 1); });
          var far = s.H / T.tan(s.a), nr = s.H / T.tan(s.b), x = far - nr;
          var al = [{ v: far + nr, code: 'trig-sum-diff', hint: 'Both lights are on the <b>same</b> side of the tower, in a line, so the distance between them is the far distance <b>minus</b> the near distance.' },
            { v: s.H * T.tan(s.b) - s.H * T.tan(s.a), code: 'trig-inv', hint: 'From each light, the ' + t(s1(s.H)) + ' m tower is opposite and the ground distance is adjacent: ' + t('\\tan(\\text{angle})=\\frac{' + s1(s.H) + '}{d}') + ', so ' + t('d=\\frac{' + s1(s.H) + '}{\\tan(\\text{angle})}') + '.' },
            { v: s.H / T.tan(s.b - s.a), code: 'trig-angle-diff', hint: 'Subtracting the angles doesn’t give an angle of a right triangle. Find each ground distance in its own right triangle, then subtract the distances.' },
            { v: s.H / Math.tan(s.a) - s.H / Math.tan(s.b), code: 'trig-rad', hint: 'Your calculator seems to be in radian mode.' },
            { v: rnd(far, 0) - rnd(nr, 0), code: 'trig-early', hint: 'Keep the two distances at full accuracy and round only the final difference.' }];
          var hz = far * 1.08, fig = HW.fig({ pts: { G: [0, 0], Tw: [0, s.H], N: [nr, 0], Fa: [far, 0], Hz: [hz, s.H] }, segs: [['G', 'Tw', s1(s.H) + ' m'], ['G', 'Fa'], ['Tw', 'N'], ['Tw', 'Fa']], right: [['G', 'Tw', 'N']],
            angles: [['Tw', 'Hz', 'N', s.b + '°', { r: 30 }], ['Tw', 'Hz', 'Fa', s.a + '°', { r: 95 }]], names: { N: 'near', Fa: 'far' }, extra: [{ type: 'dash', from: [0, s.H], to: [hz, s.H] }], width: 320, height: 200, aria: 'control tower and two runway lights' });
          return near('From a control tower window ' + t(s1(s.H)) + ' m above the ground, the angles of depression of two runway lights, which are in a direct line from the tower, are ' + t(dg(s.a)) + ' and ' + t(dg(s.b)) + ' respectively. To the nearest tenth of a metre, the distance between the two runway lights is ______ m.' + figWrap(fig), x, 1, 'm', al,
            'Each angle of depression equals the angle of elevation at the light, and the ' + t(s1(s.H)) + ' m height is opposite it ' + t('\\Rightarrow') + ' TOA.<br>near light: ' + t('\\dfrac{' + s1(s.H) + '}{\\tan ' + dg(s.b) + '}=' + fx(nr, 4)) + ' m<br>far light: ' + t('\\dfrac{' + s1(s.H) + '}{\\tan ' + dg(s.a) + '}=' + fx(far, 4)) + ' m<br>distance ' + t('=' + fx(far, 4) + '-' + fx(nr, 4) + '=' + fx(x, 4) + '\\approx ' + fx(x, 1)),
            ['The bigger angle of depression belongs to the nearer light.', 'Find each ground distance separately, then subtract.'], 'runway lights ' + s.a + ',' + s.b, true);
        } }] },
      /* ---------- 13 ---------- */
      { num: '13', stem: function (s) {
          var Pp = T.atan(s.qr / s.pq), pr = Math.hypot(s.pq, s.qr), pt = pr * pr / (2 * s.pq);
          var Q = [s.pq * T.cos(Pp), s.pq * T.sin(Pp)], Tt = [pt * T.cos(Pp), pt * T.sin(Pp)];
          var fig = HW.fig({ pts: { P: [0, 0], R: [pr, 0], Q: Q, T: Tt, S: [pr / 2, 0] }, segs: [['P', 'Q', s.pq + ' m'], ['Q', 'R', s.qr + ' m'], ['P', 'R'], ['T', 'R'], ['T', 'S', { dash: 1 }]], right: [['Q', 'P', 'R'], ['S', 'R', 'T']], width: 320, aria: 'triangle PQR with point T' });
          return '<i>(Written Response)</i> In the diagram, ' + t('\\angle PQR=90^\\circ') + ', ' + t('PQ=' + s.pq) + ' m, ' + t('QR=' + s.qr) + ' m, and ' + t('T') + ' is a point on ' + t('PQ') + ' such that ' + t('PT=TR') + '. ' + t('S') + ' is the foot of the perpendicular from ' + t('T') + ' to ' + t('PR') + '.' + figWrap(fig);
        },
        shared: function (r) { var tr = r.pick([[30, 16], [30, 16], [24, 10], [15, 8], [24, 7], [40, 9], [35, 12], [16, 12], [20, 15], [45, 24]]); return { pq: tr[0], qr: tr[1] }; },
        parts: [
          { id: '13a', sub: 'i', level: 'BEG', make: function (r, s) {
            var pr = Math.round(Math.hypot(s.pq, s.qr));
            var p = P.number('Sketch triangle ' + t('PQR') + ' only and determine the exact length of ' + t('PR') + '.', pr, function (v) {
              if (Math.abs(v - Math.sqrt(s.pq * s.pq - s.qr * s.qr)) < 0.06) return { code: 'trig-pyth', hint: t('PR') + ' is the <b>hypotenuse</b> (across from the right angle at ' + t('Q') + '), so add the squares of the legs.' };
              if (v === s.pq + s.qr) return { code: 'trig-pyth', hint: 'Side lengths don’t simply add — use the Pythagorean theorem.' };
              return null; }, t('\\triangle PQR') + ' is right-angled at ' + t('Q') + ' with legs ' + t(s.pq) + ' and ' + t(s.qr) + ':<br>' + t('PR=\\sqrt{' + s.pq + '^2+' + s.qr + '^2}=\\sqrt{' + (pr * pr) + '}=' + pr) + ' m',
              ['The right angle is at ' + t('Q') + ', so ' + t('PR') + ' is the hypotenuse.'], 'PR exact', { before: t('PR='), after: 'm' });
            p.bad = [String(s.pq + s.qr), fx(Math.sqrt(s.pq * s.pq - s.qr * s.qr), 1)];
            return p;
          } },
          { id: '13b', sub: 'ii', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'Why does triangle ' + t('QRT') + ' alone (without using the condition ' + t('PT=TR') + ') not give enough information to determine ' + t('\\angle QRT') + '?',
              'It supplies only the right angle ' + t('\\angle TQR') + ' and the side ' + t('QR=' + s.qr) + ' m. One angle and one side can’t fix a second angle — a second side is needed, and where ' + t('T') + ' sits is set by ' + t('PT=TR') + '.',
              [['' + t('\\angle QRT') + ' is the right angle, so there is nothing to work out.', 'The right angle is at ' + t('Q') + ': ' + t('T') + ' lies on ' + t('PQ') + ', so ' + t('\\angle TQR=\\angle PQR=90^\\circ') + '.'],
                ['Triangle ' + t('QRT') + ' has no right angle, so SOH CAH TOA can’t be used.', 'It does have one: ' + t('\\angle TQR=90^\\circ') + ' because ' + t('T') + ' is on ' + t('PQ') + '. The problem is how little is known, not the shape.'],
                ['The ' + t(s.pq) + ' m side ' + t('PQ') + ' is missing from triangle ' + t('QRT') + ', and it is the only length that could help.', t('PQ') + ' isn’t a side of ' + t('\\triangle QRT') + ' — only part of it, ' + t('QT') + ', is. What is missing is a second side of ' + t('\\triangle QRT') + ', and only ' + t('PT=TR') + ' fixes it.']],
              t('T') + ' lies on ' + t('PQ') + ', so ' + t('\\angle TQR=90^\\circ') + '. That right angle and ' + t('QR=' + s.qr) + ' are all triangle ' + t('QRT') + ' supplies; one angle and one side cannot determine a second angle. The missing side (' + t('QT') + ' or ' + t('TR') + ') is fixed by ' + t('PT=TR') + ', which lies outside triangle ' + t('QRT') + '.',
              ['How many facts (sides or angles besides the right angle) do you need to solve a right triangle?'], 'why QRT not enough');
          } },
          { id: '13c', sub: 'iii', level: 'ADV', make: function (r, s) {
            var Pp = T.atan(s.qr / s.pq), qrp = 90 - Pp, qrt = qrp - Pp;
            return fieldsPart('Calculate ' + t('\\angle QPR') + ', and use it to determine ' + t('\\angle QRT') + ', each to the nearest degree.', [
              nf('\\angle QPR=', Pp, 0, '°', angAlts(s.qr, s.pq, 'tan', 0)),
              nf('\\angle QRT=', qrt, 0, '°', [{ v: qrp, code: 'trig-one-piece', hint: 'That is all of ' + t('\\angle QRP') + '. ' + t('\\angle QRT') + ' is what is left after taking away ' + t('\\angle TRP') + '.' },
                { v: Pp, code: 'trig-one-piece', hint: 'That is ' + t('\\angle TRP') + ' (equal to ' + t('\\angle QPR') + ' because ' + t('\\triangle PTR') + ' is isosceles). Subtract it from ' + t('\\angle QRP') + '.' },
                { v: 90 - 2 * Math.round(Pp), code: 'trig-early', hint: 'Use the unrounded ' + t('\\angle QPR') + ' in the subtraction and round at the end.' }])],
              'In right ' + t('\\triangle PQR') + ': opp ' + t('=QR=' + s.qr) + ', adj ' + t('=PQ=' + s.pq) + ' ' + t('\\Rightarrow') + ' TOA: ' + t('\\tan(\\angle QPR)=\\frac{' + s.qr + '}{' + s.pq + '}\\Rightarrow \\angle QPR=' + fx(Pp, 2) + '^\\circ\\approx ' + dg(fx(Pp, 0))) + '.<br>' + t('\\triangle PTR') + ' is isosceles (' + t('PT=TR') + '), so ' + t('\\angle TRP=\\angle TPR=' + fx(Pp, 2) + '^\\circ') + '.<br>' + t('\\angle QRP=90^\\circ-' + fx(Pp, 2) + '^\\circ=' + fx(qrp, 2) + '^\\circ') + ', so ' + t('\\angle QRT=' + fx(qrp, 2) + '^\\circ-' + fx(Pp, 2) + '^\\circ=' + fx(qrt, 2) + '^\\circ\\approx ' + dg(fx(qrt, 0))),
              ['In ' + t('\\triangle PTR') + ', ' + t('PT=TR') + ': which two angles are equal?', t('\\angle QRT=\\angle QRP-\\angle TRP') + '.'], 'QPR and QRT');
          } },
          { id: '13d', sub: 'iv', level: 'EMG', make: function (r, s) {
            var pr = Math.round(Math.hypot(s.pq, s.qr)), pt = pr * pr / (2 * s.pq);
            return mcWhy(r, 'Why is ' + t('S') + ' the midpoint of ' + t('PR') + '?',
              'Triangle ' + t('PTR') + ' is isosceles (' + t('PT=TR') + '), so the perpendicular ' + t('TS') + ' from its apex splits it into two congruent right triangles: ' + t('PS=SR') + '.',
              [['Any perpendicular dropped onto a segment meets it at its midpoint.', 'Not in general — a perpendicular from a point lands at the midpoint only when that point is the same distance from both ends. Here ' + t('PT=TR') + ' is what makes it work.'],
                [t('T') + ' is the midpoint of ' + t('PQ') + ', so ' + t('S') + ' is the midpoint of ' + t('PR') + '.', t('T') + ' is not the midpoint of ' + t('PQ') + ': ' + t('PT\\approx ' + fx(pt, 1)) + ' m while ' + t('PQ=' + s.pq) + ' m.'],
                ['Because ' + t('\\angle QPR=\\angle QRP') + '.', 'Those angles aren’t equal (' + t('\\approx ' + dg(fx(T.atan(s.qr / s.pq), 0))) + ' and ' + t('\\approx ' + dg(fx(90 - T.atan(s.qr / s.pq), 0))) + '). The equal angles are in ' + t('\\triangle PTR') + '.']],
              'Because ' + t('PT=TR') + ', triangle ' + t('PTR') + ' is isosceles. The perpendicular from its apex ' + t('T') + ' splits it into two congruent right triangles, so ' + t('PS=SR=\\tfrac{' + pr + '}{2}=' + (pr / 2)) + ' m.',
              ['Which triangle has two equal sides that meet at ' + t('T') + '?'], 'why S midpoint');
          } },
          { id: '13e', sub: 'v', level: 'PRG', make: function (r, s) {
            var pr = Math.round(Math.hypot(s.pq, s.qr)), Pp = T.atan(s.qr / s.pq), ps = pr / 2, pt = ps / T.cos(Pp);
            var al = [{ v: pr / T.cos(Pp), code: 'trig-half', hint: t('S') + ' is the midpoint, so ' + t('PS') + ' is <b>half</b> of ' + t('PR') + ': ' + t(ps) + ' m.' }].concat(sideAlts(ps, Pp, 'adj', 'hyp')).concat([{ v: ps / T.cos(Math.round(Pp)), code: 'trig-early', hint: 'Use ' + t('\\angle QPR') + ' at full accuracy (or ' + t('\\cos(\\angle QPR)=\\frac{' + s.pq + '}{' + pr + '}') + ' exactly), not the rounded angle.' }]);
            return near('Use ' + t('\\triangle PST') + ' (with ' + t('PS=SR') + ') to calculate the length of ' + t('PT') + ', to the nearest tenth of a metre.', pt, 1, 'm', al,
              t('PS=\\tfrac{' + pr + '}{2}=' + ps) + '. In right ' + t('\\triangle PST') + ', ' + t('\\angle TPS=' + fx(Pp, 2) + '^\\circ') + ' and ' + t('PS') + ' is adjacent ' + t('\\Rightarrow') + ' CAH.<br>' + t('\\cos ' + fx(Pp, 2) + '^\\circ=\\dfrac{' + ps + '}{PT}\\Rightarrow PT=\\dfrac{' + ps + '}{\\cos ' + fx(Pp, 2) + '^\\circ}=' + fx(pt, 4) + '\\approx ' + fx(pt, 1)) + ' m',
              ['In ' + t('\\triangle PST') + ', ' + t('PT') + ' is the hypotenuse and ' + t('PS') + ' is adjacent to ' + t('\\angle P') + '.', t('\\angle TPS=\\angle QPR') + ' (from the previous bullet).'], 'PT via PST');
          } }] },
      /* ---------- 14 ---------- */
      { num: '14', section: 'Calculator values and complete solutions', stem: 'Evaluate (a)–(c) to four decimal places, and determine the acute angle in (d)–(f) to the nearest degree.', parts: ['sin', 'cos', 'tan'].map(function (fn, i) {
          return { id: '14' + 'abc'[i], level: 'LIM', make: function (r) {
            var A = r.int(fn === 'tan' ? 10 : 10, fn === 'tan' ? 75 : 80), x = FN[fn](A);
            var al = [{ v: RF[fn](A), code: 'trig-rad', hint: 'Your calculator is in <b>radian</b> mode — switch to degrees.' }];
            ['sin', 'cos', 'tan'].forEach(function (f) { if (f !== fn) al.push({ v: FN[f](A), code: 'trig-ratio', hint: 'That is ' + t('\\' + f + ' ' + dg(A)) + '. Press the ' + t('\\' + fn) + ' key.' }); });
            return near(t('\\' + fn + ' ' + dg(A) + '=') + ' (to four decimal places)', x, 4, '', al, t('\\' + fn + ' ' + dg(A) + '=' + fx(x, 6) + '\\ldots\\approx ' + fx(x, 4)), [RAD_HINT, 'Round to 4 decimal places: look at the fifth digit.'], fn + ' ' + A);
          } };
        }).concat(['sin', 'cos', 'tan'].map(function (fn, i) {
          return { id: '14' + 'def'[i], level: 'BEG', make: function (r) {
            var A = r.int(10, fn === 'tan' ? 78 : 80), v = rnd(FN[fn](A), 4), x = INV[fn](v), vs = v.toFixed(4);
            var al = [{ v: 1 / v, code: 'trig-recip', hint: t('\\' + fn + '^{-1}') + ' is the <b>inverse</b> (it gives back the angle), not ' + t('\\frac{1}{\\' + fn + '}') + '.' }, { v: RINV[fn](v), code: 'trig-rad', hint: 'Your calculator is in <b>radian</b> mode — switch to degrees.' }, { v: FN[fn](v), code: 'trig-no-inv', hint: 'You pressed ' + t('\\' + fn) + '. To find the angle, use the inverse key ' + t('\\' + fn + '^{-1}') + ' (usually SHIFT/2nd).' }];
            if (fn !== 'tan') al.push({ v: INV[fn === 'sin' ? 'cos' : 'sin'](v), code: 'trig-ratio', hint: 'That is ' + t('\\' + (fn === 'sin' ? 'cos' : 'sin') + '^{-1}(' + vs + ')') + '. Use ' + t('\\' + fn + '^{-1}') + '.' });
            var p = near(t('\\' + fn + '\\theta^\\circ=' + vs) + '. Determine ' + t('\\theta^\\circ') + ' to the nearest degree.', x, 0, '°', al, t('\\theta^\\circ=\\' + fn + '^{-1}(' + vs + ')=' + fx(x, 2) + '^\\circ\\approx ' + dg(fx(x, 0))), ['Use ' + t('\\' + fn + '^{-1}') + ' — the inverse key.', RAD_HINT], fn + '^-1 ' + vs);
            p.input.before = t('\\theta^\\circ=');
            return p;
          } };
        })) },
      /* ---------- 15 ---------- */
      { num: '15', stem: 'Solve each right triangle completely: state every side length to the nearest tenth and every angle to the nearest tenth of a degree.', parts: [
        { id: '15a', level: 'PRG', make: function (r) {
          var s = gen(r, function (r) { return { A: r.int(25, 60), b: r.int(8, 30) }; }, function (s) { return safe(s.b * T.tan(s.A), 1) && safe(s.b / T.cos(s.A), 1); });
          var B = 90 - s.A, bc = s.b * T.tan(s.A), ab = s.b / T.cos(s.A);
          var fig = tri({ w: s.b, h: bc, names: ['A', 'B', 'C'], sides: { b: s.b + ' cm' }, angles: { A: s.A + '°' }, width: 230 }, r);
          return fieldsPart('Triangle ' + t('ABC') + ' has ' + t('\\angle C=90^\\circ') + ', ' + t('\\angle A=' + dg(s.A)) + ' and ' + t('AC=' + s.b) + ' cm. Find ' + t('\\angle B') + ', ' + t('BC') + ' and ' + t('AB') + '.' + figWrap(fig), [
            nf('\\angle B=', B, 1, '°', [{ v: 180 - s.A, code: 'trig-complement', hint: 'The two <b>acute</b> angles of a right triangle add to ' + t('90^\\circ') + ' (the right angle takes the other ' + t('90^\\circ') + ').' }]),
            nf('BC=', bc, 1, 'cm', sideAlts(s.b, s.A, 'adj', 'opp')),
            nf('AB=', ab, 1, 'cm', sideAlts(s.b, s.A, 'adj', 'hyp', [{ v: Math.hypot(s.b, rnd(bc, 1)), code: 'trig-early', hint: 'Find ' + t('AB') + ' from the <b>given</b> data (' + t('AC') + ' and ' + t('\\angle A') + '), or keep ' + t('BC') + ' unrounded.' }]))],
            t('\\angle B=90^\\circ-' + dg(s.A) + '=' + dg(fx(B, 1))) + '<br>' + sideWork(s.b, String(s.b), s.A, 'adj', 'opp', bc, 1, 'cm', 'BC') + '<br>' + sideWork(s.b, String(s.b), s.A, 'adj', 'hyp', ab, 1, 'cm', 'AB'),
            ['Start with the free one: ' + t('\\angle B=90^\\circ-\\angle A') + '.', 'From ' + t('\\angle A') + ', ' + t('AC') + ' is adjacent; ' + t('BC') + ' is opposite and ' + t('AB') + ' is the hypotenuse.'], 'solve ABC angle ' + s.A);
        } },
        { id: '15b', level: 'PRG', make: function (r) {
          var s = gen(r, function (r) { return { de: d1(r, 5, 15), ef: d1(r, 5, 15) }; }, function (s) { var q = s.ef / s.de; return q > 0.45 && q < 2.2 && Math.abs(q - 1) > 0.1 && safe(T.atan(q), 1) && safe(Math.hypot(s.de, s.ef), 1); });
          var df = Math.hypot(s.de, s.ef), D = T.atan(s.ef / s.de), Fa = 90 - D;
          var fig = tri({ w: s.ef, h: s.de, names: ['F', 'D', 'E'], sides: { a: s1(s.de) + ' m', b: s1(s.ef) + ' m' }, width: 230 }, r);
          return fieldsPart('Triangle ' + t('DEF') + ' has ' + t('\\angle E=90^\\circ') + ', ' + t('DE=' + s1(s.de)) + ' m and ' + t('EF=' + s1(s.ef)) + ' m. Find ' + t('DF') + ', ' + t('\\angle D') + ' and ' + t('\\angle F') + '.' + figWrap(fig), [
            nf('DF=', df, 1, 'm', [{ v: Math.sqrt(Math.abs(s.ef * s.ef - s.de * s.de)), code: 'trig-pyth', hint: t('DF') + ' is the hypotenuse, so <b>add</b> the squares of the legs.' }, { v: s.de + s.ef, code: 'trig-pyth', hint: 'Lengths don’t add — use the Pythagorean theorem.' }]),
            nf('\\angle D=', D, 1, '°', angAlts(s.ef, s.de, 'tan', 1)),
            nf('\\angle F=', Fa, 1, '°', angAlts(s.de, s.ef, 'tan', 1))],
            t('DF=\\sqrt{' + s1(s.de) + '^2+' + s1(s.ef) + '^2}=' + fx(df, 4) + '\\approx ' + fx(df, 1)) + ' m<br>From ' + t('\\angle D') + ': opp ' + t('=EF=' + s1(s.ef)) + ', adj ' + t('=DE=' + s1(s.de)) + ' ' + t('\\Rightarrow') + ' TOA:<br>' + angWork(s1(s.ef), s1(s.de), 'tan', D, 1, '\\angle D') + '<br>' + t('\\angle F=90^\\circ-' + fx(D, 2) + '^\\circ=' + dg(fx(Fa, 1))),
            ['Two legs are known: the hypotenuse comes from the Pythagorean theorem.', 'For ' + t('\\angle D') + ', which leg is opposite ' + t('D') + '?'], 'solve DEF legs');
        } }] },
      /* ---------- 16 ---------- */
      { num: '16', parts: [
        { id: '16', level: 'PRG', make: function (r) {
          var s = gen(r, function (r) { return { e: d1(r, 1.5, 1.8), d: r.int(30, 80), A: r.int(20, 50) }; }, function (s) { return safe(s.d * T.tan(s.A) + s.e, 1); });
          var rise = s.d * T.tan(s.A), h = rise + s.e;
          var al = [{ v: rise, code: 'trig-eye', hint: 'The angle is measured from <b>eye level</b>, so the triangle only gives the height above her eyes. Add the ' + t(s1(s.e)) + ' m eye height.' }, { v: rise - s.e, code: 'trig-eye', hint: 'The eye is ' + t(s1(s.e)) + ' m <b>above</b> the ground, so add it to the rise, don’t subtract.' }]
            .concat(sideAlts(s.d, s.A, 'adj', 'opp').map(function (a) { return { v: a.v + s.e, code: a.code, hint: a.hint }; }));
          return near('A surveyor whose eye level is ' + t(s1(s.e)) + ' m above the ground stands ' + t(s.d) + ' m from the base of a grain elevator and measures the angle of elevation of its top as ' + t(dg(s.A)) + '. Determine the height of the grain elevator, to the nearest tenth of a metre.', h, 1, 'm', al,
            'The ' + t(dg(s.A)) + ' is measured from eye level: opp ' + t('=h_1') + ' (height above eye level), adj ' + t('=' + s.d) + ' ' + t('\\Rightarrow') + ' TOA.<br>' + t('h_1=' + s.d + '\\tan ' + dg(s.A) + '=' + fx(rise, 4)) + ' m<br>Height ' + t('=' + fx(rise, 4) + '+' + s1(s.e) + '=' + fx(h, 4) + '\\approx ' + fx(h, 1)) + ' m',
            ['Sketch it: the triangle starts at the surveyor’s eye, not at the ground.', 'Add the eye height at the end.'], 'eye level elevator ' + s.A);
        } }] },
      /* ---------- 17–18 (Extension) ---------- */
      { num: '17', section: 'Extension — Bearings and three dimensions',
        shared: function (r) {
          return gen(r, function (r) { var d = r.int(8, 20), b = r.int(40, 80), n = d * T.cos(b), e = d * T.sin(b); return { d: d, b: b, n: n, e: e, s: rnd(n + d1(r, 1.0, Math.max(1.2, 0.45 * e)), 1) }; },
            function (q) { var dn = q.s - q.n, hn = Math.hypot(q.e, dn), br = 90 + T.atan(dn / q.e); return dn > 0.6 && safe(q.n, 1) && safe(q.e, 1) && safe(hn, 1) && safe(br, 0); });
        },
        stem: function (q) {
          var M = [q.e, q.n], fig = HW.fig({ pts: { H: [0, 0], Nn: [0, q.d * 0.75], M: M }, segs: [['H', 'Nn', { width: 1.6 }], ['H', 'M', q.d + ' km']], angles: [['H', 'Nn', 'M', '0' + q.b + '°', { r: 30 }]], names: { H: 'H', Nn: 'N', M: 'M' }, width: 260, aria: 'bearing diagram' });
          return '<i>(Extension)</i> A boat leaves harbour ' + t('H') + ' and sails ' + t(q.d) + ' km on a bearing of ' + t(dg('0' + q.b)) + ' to a marker ' + t('M') + '.' + figWrap(fig);
        },
        parts: [
          { id: '17a', level: 'PRG', make: function (r, q) {
            return fieldsPart('Determine, to the nearest tenth of a kilometre, how far north of ' + t('H') + ' and how far east of ' + t('H') + ' the marker ' + t('M') + ' is.', [
              nf('\\text{north}=', q.n, 1, 'km', [{ v: q.e, code: 'trig-bearing-swap', hint: 'A bearing is measured from <b>north</b>, so the north distance is <b>adjacent</b> to the ' + t(dg(q.b)) + ' angle: use cosine.' }, { v: q.d * Math.cos(q.b), code: 'trig-rad', hint: 'Radian mode? Switch to degrees.' }]),
              nf('\\text{east}=', q.e, 1, 'km', [{ v: q.n, code: 'trig-bearing-swap', hint: 'The east distance is <b>opposite</b> the ' + t(dg(q.b)) + ' angle at ' + t('H') + ' (measured from north): use sine.' }, { v: q.d * Math.sin(q.b), code: 'trig-rad', hint: 'Radian mode? Switch to degrees.' }])],
              'A bearing of ' + t(dg('0' + q.b)) + ' is ' + t(dg(q.b)) + ' clockwise from north, so with the north line the ' + t(q.d) + ' km leg is the hypotenuse and ' + t(dg(q.b)) + ' sits at ' + t('H') + '.<br>north ' + t('=' + q.d + '\\cos ' + dg(q.b) + '=' + fx(q.n, 4) + '\\approx ' + fx(q.n, 1)) + ' km<br>east ' + t('=' + q.d + '\\sin ' + dg(q.b) + '=' + fx(q.e, 4) + '\\approx ' + fx(q.e, 1)) + ' km',
              ['Draw the right triangle with the north line as one leg.', 'North is adjacent to the bearing angle; east is opposite it.'], 'north/east bearing ' + q.b);
          } },
          { id: '17b', level: 'ADV', make: function (r, q) {
            var dn = q.s - q.n, hn = Math.hypot(q.e, dn), ang = T.atan(dn / q.e), br = 90 + ang;
            return fieldsPart('From ' + t('M') + ' the boat sails due south for ' + t(s1(q.s)) + ' km to a point ' + t('N') + '. Determine the distance ' + t('HN') + ' to the nearest tenth of a kilometre, and the three-figure bearing of ' + t('N') + ' from ' + t('H') + ' to the nearest degree.', [
              nf('HN=', hn, 1, 'km', [{ v: Math.hypot(q.e, q.s), code: 'trig-sum-diff', hint: t('N') + ' is not ' + t(s1(q.s)) + ' km south of ' + t('H') + ': the boat started ' + t(fx(q.n, 1)) + ' km <b>north</b> of ' + t('H') + ', so subtract.' }, { v: Math.hypot(q.e, q.s + q.n), code: 'trig-sum-diff', hint: 'The boat was north of ' + t('H') + ' and then sailed south, so the distances north and south partly cancel: subtract.' }]),
              nf('\\text{bearing}=', br, 0, '°', [{ v: 90 - ang, code: 'trig-bearing-angle', hint: t('N') + ' is <b>south</b> of the east line from ' + t('H') + ', so the bearing is more than ' + t('090^\\circ') + '.' }, { v: ang, code: 'trig-bearing-angle', hint: 'That is the angle below due east. A bearing is measured clockwise from <b>north</b>: add it to ' + t('090^\\circ') + '.' }, { v: 180 - ang, code: 'trig-bearing-angle', hint: 'Measure from north, clockwise: due east is ' + t('090^\\circ') + ', and ' + t('N') + ' is a little past it.' }])],
              t('N') + ' is ' + t(fx(q.e, 4)) + ' km east of ' + t('H') + ' and ' + t(s1(q.s) + '-' + fx(q.n, 4) + '=' + fx(dn, 4)) + ' km <b>south</b> of ' + t('H') + '.<br>' + t('HN=\\sqrt{' + fx(q.e, 4) + '^2+' + fx(dn, 4) + '^2}=' + fx(hn, 4) + '\\approx ' + fx(hn, 1)) + ' km<br>' + t('N') + ' is ' + t('\\tan^{-1}\\!\\left(\\dfrac{' + fx(dn, 4) + '}{' + fx(q.e, 4) + '}\\right)=' + fx(ang, 2) + '^\\circ') + ' below due east, so the bearing is ' + t('90^\\circ+' + fx(ang, 2) + '^\\circ=' + fx(br, 2) + '^\\circ\\approx ' + dg(fx(br, 0))),
              ['Work out how far east and how far south of ' + t('H') + ' the point ' + t('N') + ' is, then use Pythagoras and an inverse tangent.', 'Sketch it: is ' + t('N') + ' north or south of ' + t('H') + '?'], 'HN and bearing');
          } }] },
      { num: '18',
        shared: function (r) { var tr = r.pick([[12, 5], [12, 5], [8, 6], [15, 8], [12, 9], [24, 7], [16, 12], [20, 15]]); return gen(r, function (r) { return { ab: tr[0], ad: tr[1], ap: d1(r, 4.0, 12.0) }; }, function (s) { return safe(T.atan(s.ap / Math.hypot(s.ab, s.ad)), 1); }); },
        stem: function (s) {
          var k = 0.4, A = [0, 0], B = [s.ab * k, 0], D = [s.ad * k * 1.05, s.ad * k * 0.92], C = [B[0] + D[0], D[1]], Pp = [0, s.ap * k];
          var fig = HW.fig({ pts: { A: A, B: B, C: C, D: D, P: Pp }, segs: [['A', 'B', s1(s.ab) + ' m'], ['B', 'C'], ['C', 'D'], ['A', 'D', s1(s.ad) + ' m'], ['A', 'P', s1(s.ap) + ' m'], ['P', 'C'], ['A', 'C', { dash: 1 }]], right: [['A', 'B', 'P']], width: 300, aria: 'flagpole in a courtyard' });
          return '<i>(Extension)</i> A vertical flagpole ' + t('AP') + ' stands at corner ' + t('A') + ' of a horizontal rectangular courtyard ' + t('ABCD') + ', where ' + t('AB=' + s1(s.ab)) + ' m, ' + t('AD=' + s1(s.ad)) + ' m and ' + t('AP=' + s1(s.ap)) + ' m.' + figWrap(fig);
        },
        parts: [
          { id: '18a', level: 'BEG', make: function (r, s) {
            var ac = Math.hypot(s.ab, s.ad);
            return near('Determine the length of the diagonal ' + t('AC') + ', to the nearest tenth of a metre.', ac, 1, 'm', [{ v: Math.sqrt(s.ab * s.ab - s.ad * s.ad), code: 'trig-pyth', hint: t('AC') + ' is the hypotenuse of right ' + t('\\triangle ABC') + ': add the squares.' }, { v: s.ab + s.ad, code: 'trig-pyth', hint: 'Lengths don’t add — use the Pythagorean theorem.' }],
              t('ABCD') + ' is a rectangle, so ' + t('\\angle ABC=90^\\circ') + ' and ' + t('BC=AD=' + s1(s.ad)) + ':<br>' + t('AC=\\sqrt{' + s1(s.ab) + '^2+' + s1(s.ad) + '^2}=\\sqrt{' + (s.ab * s.ab + s.ad * s.ad) + '}=' + fx(ac, 1)) + ' m', ['The diagonal of a rectangle is the hypotenuse of a right triangle with the two sides as legs.'], 'diagonal AC');
          } },
          { id: '18b', level: 'PRG', make: function (r, s) {
            var ac = Math.hypot(s.ab, s.ad), A = T.atan(s.ap / ac);
            var al = [{ v: T.atan(s.ap / s.ab), code: 'trig-wrong-side', hint: 'The angle of elevation from ' + t('C') + ' is in ' + t('\\triangle PAC') + ': the horizontal leg is the diagonal ' + t('AC') + ', not the edge ' + t('AB') + '.' }, { v: T.atan(s.ap / s.ad), code: 'trig-wrong-side', hint: 'From ' + t('C') + ', the horizontal distance to the foot of the pole is the diagonal ' + t('AC') + '.' }].concat(angAlts(s.ap, ac, 'tan', 1));
            return near('Determine the angle of elevation of ' + t('P') + ' from ' + t('C') + ', to the nearest tenth of a degree.', A, 1, '°', al,
              t('AP') + ' is vertical and ' + t('AC') + ' lies in the horizontal courtyard, so ' + t('\\triangle PAC') + ' is right-angled at ' + t('A') + '. From ' + t('C') + ': opp ' + t('=AP=' + s1(s.ap)) + ', adj ' + t('=AC=' + fx(ac, 1)) + ' ' + t('\\Rightarrow') + ' TOA.<br>' + angWork(s1(s.ap), fx(ac, 4), 'tan', A, 1, '\\angle PCA'),
              ['The pole is vertical, so it makes a right angle with every line in the courtyard through ' + t('A') + ' — including ' + t('AC') + '.', 'You need the diagonal ' + t('AC') + ' first.'], 'elevation from C');
          } }] }
    ],
    extra: [
      /* ---------- EP 1 ---------- */
      { num: '1', section: 'Extra practice A — One triangle, every question',
        shared: function (r) { var tr = r.pick(RAMPS); return { L: tr[0], S: tr[1], Hy: tr[2], ab: tr[0] / 10, bc: tr[1] / 10, ac: tr[2] / 10, o: orient(r) }; },
        stem: function (s) {
          return 'In ' + t('\\triangle ABC') + ' the right angle is at ' + t('B') + ', with ' + t('AB=' + s1(s.ab)) + ' m and ' + t('BC=' + s1(s.bc)) + ' m. Sides to the nearest tenth, angles to the nearest degree, and round only at the very end.' +
            figWrap(HW.tri(Object.assign({ w: s.ab, h: s.bc, names: ['A', 'C', 'B'], sides: { a: s1(s.bc) + ' m', b: s1(s.ab) + ' m', c: '?' }, width: 300 }, s.o)));
        },
        parts: [
          { id: 'e1a', level: 'LIM', make: function (r, s) { return sideGrid('Relative to ' + t('\\angle A') + ', name each side.', { right: 'B' }, [['AB', null], ['BC', null], ['AC', null]], ['adj', 'opp', 'hyp'], 'A', 'Relative to ' + t('\\angle A') + ': opposite ' + t('=BC') + ' (it faces ' + t('\\angle A') + '), adjacent ' + t('=AB') + ' (it runs from ' + t('A') + ' to the right angle), hypotenuse ' + t('=AC') + ' (across from the right angle at ' + t('B') + ').', 'sides rel. A'); } },
          { id: 'e1b', level: 'LIM', make: function (r, s) { return sideGrid('Now name each side relative to ' + t('\\angle C') + '.', { right: 'B' }, [['AB', null], ['BC', null], ['AC', null]], ['opp', 'adj', 'hyp'], 'C', 'Relative to ' + t('\\angle C') + ': opposite ' + t('=AB') + ', adjacent ' + t('=BC') + ', hypotenuse ' + t('=AC') + '. Opposite and adjacent swapped; the hypotenuse stayed.', 'sides rel. C'); } },
          { id: 'e1b2', level: 'BEG', make: function (r, s) {
            return mcWhy(r, 'Going from ' + t('\\angle A') + ' to ' + t('\\angle C') + ', which name did <b>not</b> change, and why?', 'The hypotenuse ' + t('AC') + ': it is defined by the <b>right angle</b> at ' + t('B') + ', which is the same whichever acute angle you use.',
              [['The opposite side ' + t('BC') + ': it is always the vertical side.', 'Relative to ' + t('\\angle C') + ' the opposite side is ' + t('AB') + '. Opposite and adjacent depend on which acute angle you stand at.'],
                ['The adjacent side ' + t('AB') + ': it is always the longest leg.', 'Relative to ' + t('\\angle C') + ' the adjacent side is ' + t('BC') + '. Being long has nothing to do with being adjacent.'],
                ['None of them changed: side names belong to the triangle, not to the angle.', 'Opposite and adjacent did change (they swapped). Only one name is fixed by the right angle.']],
              'Relative to ' + t('\\angle C') + ', ' + t('AB') + ' is opposite and ' + t('BC') + ' is adjacent — the two legs swapped names. The <b>hypotenuse</b> ' + t('AC') + ' did not change: it is the side across from the right angle, and the right angle is at ' + t('B') + ' no matter which acute angle you use.', ['Which side is named using the right angle rather than the acute angle?'], 'hyp unchanged');
          } },
          { id: 'e1c', level: 'BEG', make: function (r, s) {
            return near('Determine the length of ' + t('AC') + '.', s.ac, 1, 'm', [{ v: Math.sqrt(s.ab * s.ab - s.bc * s.bc), code: 'trig-pyth', hint: t('AC') + ' is the hypotenuse, so <b>add</b> the squares of the legs.' }, { v: s.ab + s.bc, code: 'trig-pyth', hint: 'Lengths don’t simply add — use the Pythagorean theorem.' }],
              'Two sides are known and no angle is given, so use the <b>Pythagorean theorem</b>:<br>' + t('AC^2=' + s1(s.ab) + '^2+' + s1(s.bc) + '^2=' + rnd(s.ab * s.ab, 2) + '+' + rnd(s.bc * s.bc, 2) + '=' + rnd(s.ac * s.ac, 2)) + '<br>' + t('AC=\\sqrt{' + rnd(s.ac * s.ac, 2) + '}=' + s1(s.ac)) + ' m exactly (' + t(s1(s.ac) + '^2=' + rnd(s.ac * s.ac, 2)) + ').', ['Two legs known, hypotenuse wanted: which tool needs no angle?'], 'AC exact');
          } },
          { id: 'e1c2', level: 'BEG', make: function (r, s) {
            return mcWhy(r, 'Why was trigonometry not needed to find ' + t('AC') + '?', 'Two sides were known and the third side was wanted, with no angle given or asked for — the Pythagorean theorem does that directly.',
              [['Trigonometry can only find angles, never sides.', 'Ratios find sides all the time — but they need a known <b>angle</b>, and none was given here.'],
                [t('AC') + ' is the hypotenuse, and trigonometry can’t find a hypotenuse.', 'It can (with an angle): e.g. ' + t('\\text{hyp}=\\frac{\\text{adj}}{\\cos A}') + '. Here there was simply no angle to use.'],
                ['The triangle is too flat for trigonometry to work.', 'Trigonometry works for any right triangle. The reason is what is known: two sides and no angle.']],
              'With two sides known and a side wanted, the Pythagorean theorem needs no angle at all. A ratio would need an angle first — and finding one would mean extra steps and extra rounding.', ['What is given: sides, angles, or both?'], 'why no trig');
          } },
          { id: 'e1d', level: 'BEG', make: function (r, s) { return sixRatios(s, 'A'); } },
          { id: 'e1d2', level: 'BEG', make: function (r, s) { return sixRatios(s, 'C'); } },
          { id: 'e1e', level: 'EMG', make: function (r, s) {
            var sA = ftex(fr(s.S, s.Hy)), cA = ftex(fr(s.L, s.Hy)), tA = ftex(fr(s.S, s.L)), tC = ftex(fr(s.L, s.S));
            var rows = r.shuffle([{ id: 'sc', html: t('\\sin A') + ' and ' + t('\\cos C') }, { id: 'cs', html: t('\\cos A') + ' and ' + t('\\sin C') }, { id: 'tt', html: t('\\tan A') + ' and ' + t('\\tan C') }, { id: 'ss', html: t('\\sin A') + ' and ' + t('\\sin C') }]);
            return grid('Compare the pairs of ratios for ' + t('\\triangle ABC') + '. Is each pair equal, reciprocals, or neither?', rows, [{ id: 'eq', html: 'equal' }, { id: 'rec', html: 'reciprocals' }, { id: 'no', html: 'neither' }], { sc: 'eq', cs: 'eq', tt: 'rec', ss: 'no' },
              function (row) { return { code: row === 'tt' ? 'trig-ratio' : 'trig-cofunction', hint: { sc: t('\\sin A=\\frac{BC}{AC}') + ' and ' + t('\\cos C=\\frac{BC}{AC}') + ' — the same two sides.', cs: t('\\cos A=\\frac{AB}{AC}') + ' and ' + t('\\sin C=\\frac{AB}{AC}') + ' — the same two sides.', tt: t('\\tan A=\\frac{BC}{AB}') + ' and ' + t('\\tan C=\\frac{AB}{BC}') + ': one is the other upside down.', ss: t('\\sin A=\\frac{BC}{AC}') + ' but ' + t('\\sin C=\\frac{AB}{AC}') + ' — different tops, and not upside down either.' }[row] }; },
              t('\\sin A=\\cos C=' + sA) + ' and ' + t('\\cos A=\\sin C=' + cA) + ' (equal); ' + t('\\tan A=' + tA) + ' and ' + t('\\tan C=' + tC) + ' (reciprocals); ' + t('\\sin A\\ne\\sin C') + '. All of this happens because ' + t('\\angle A+\\angle C=90^\\circ') + ': the side opposite one angle is adjacent to the other — the <b>cofunction relationship</b> ' + t('\\sin x^\\circ=\\cos(90-x)^\\circ') + '.',
              ['Write each ratio as a fraction of two named sides, e.g. ' + t('\\sin A=\\frac{BC}{AC}') + '.'], 'cofunction pairs');
          } },
          { id: 'e1f', level: 'EMG', make: function (r, s) {
            var A = T.atan(s.bc / s.ab), C = 90 - A;
            return fieldsPart('Determine ' + t('\\angle A') + ' and ' + t('\\angle C') + ' to the nearest degree. Find ' + t('\\angle A') + ' from the original side lengths, and get ' + t('\\angle C') + ' from the unrounded ' + t('\\angle A') + '.', [
              nf('\\angle A=', A, 0, '°', angAlts(s.bc, s.ab, 'tan', 0)), nf('\\angle C=', C, 0, '°', [{ v: 180 - A, code: 'trig-complement', hint: 'The two acute angles add to ' + t('90^\\circ') + ', not ' + t('180^\\circ') + '.' }, { v: A, code: 'trig-other-angle', hint: t('\\angle C') + ' is the other acute angle: ' + t('90^\\circ-\\angle A') + '.' }])],
              'Relative to ' + t('\\angle A') + ': opp ' + t('=' + s1(s.bc)) + ', adj ' + t('=' + s1(s.ab)) + ':<br>' + angWork(s1(s.bc), s1(s.ab), 'tan', A, 0, '\\angle A') + '<br>' + t('\\angle C=90^\\circ-' + fx(A, 4) + '^\\circ=' + fx(C, 4) + '^\\circ\\approx ' + dg(fx(C, 0))),
              ['Use the two legs you were given: TOA.', t('\\angle C=90^\\circ-\\angle A') + ' — use the unrounded ' + t('\\angle A') + '.'], 'angles A and C');
          } },
          { id: 'e1g', level: 'BEG', make: function (r, s) {
            var A = rnd(T.atan(s.bc / s.ab), 0), C = 90 - A;
            return mcWhy(r, 'Which is the complete, correctly labelled solution of ' + t('\\triangle ABC') + '?', t('AB=' + s1(s.ab) + '\\text{ m},\\ BC=' + s1(s.bc) + '\\text{ m},\\ AC=' + s1(s.ac) + '\\text{ m};\\ \\angle A=' + dg(A) + ',\\ \\angle B=90^\\circ,\\ \\angle C=' + dg(C)),
              [[t('AB=' + s1(s.ab) + '\\text{ m},\\ BC=' + s1(s.bc) + '\\text{ m},\\ AC=' + s1(s.ac) + '\\text{ m};\\ \\angle A=' + dg(C) + ',\\ \\angle B=90^\\circ,\\ \\angle C=' + dg(A)), t('\\angle A') + ' faces the short side ' + t('BC') + ', so it is the <b>small</b> angle.'],
                [t('AB=' + s1(s.ab) + '\\text{ m},\\ BC=' + s1(s.bc) + '\\text{ m},\\ AC=' + s1(s.ac) + '\\text{ m};\\ \\angle A=' + dg(A) + ',\\ \\angle B=' + dg(C) + ',\\ \\angle C=90^\\circ'), 'The right angle is at ' + t('B') + '.'],
                [t('AB=' + s1(s.ab) + '\\text{ m},\\ BC=' + s1(s.bc) + '\\text{ m},\\ AC=' + s1(s.ab + s.bc) + '\\text{ m};\\ \\angle A=' + dg(A) + ',\\ \\angle B=90^\\circ,\\ \\angle C=' + dg(C)), 'Sides don’t add: ' + t('AC=\\sqrt{AB^2+BC^2}=' + s1(s.ac)) + ' m.']],
              'Three sides: ' + t('AB=' + s1(s.ab)) + ' m, ' + t('BC=' + s1(s.bc)) + ' m, ' + t('AC=' + s1(s.ac)) + ' m. Three angles: ' + t('\\angle A=' + dg(A)) + ', ' + t('\\angle B=90^\\circ') + ', ' + t('\\angle C=' + dg(C)) + '. The smallest angle faces the shortest side.', ['The smallest angle faces the shortest side.'], 'complete solution');
          } },
          { id: 'e1h', level: 'LIM', make: function (r, s) {
            var Au = T.atan(s.bc / s.ab), A = rnd(Au, 0), C = 90 - A;
            return mcWhy(r, 'Run the two self-checks — the angle sum, and “the hypotenuse is longer than both legs” — on the solution ' + t('\\angle A=' + dg(A) + ',\\ \\angle C=' + dg(C) + ',\\ AC=' + s1(s.ac)) + ' m. Which statement is correct?',
              'Both pass: ' + t(dg(A) + '+90^\\circ+' + dg(C) + '=180^\\circ') + ', and ' + t(s1(s.ac) + '>' + s1(s.ab)) + ' and ' + t(s1(s.ac) + '>' + s1(s.bc)) + '.',
              [['The angle sum fails: ' + t(dg(A) + '+' + dg(C) + '=90^\\circ') + ', not ' + t('180^\\circ') + '.', 'Include the right angle: ' + t(dg(A) + '+90^\\circ+' + dg(C) + '=180^\\circ') + '.'],
                ['The hypotenuse check fails: ' + t(s1(s.ac)) + ' is less than ' + t(s1(s.ab) + '+' + s1(s.bc)) + '.', 'Compare the hypotenuse with each leg <b>separately</b>, not with their sum (the sum of two sides is always longer than the third).'],
                ['Neither check can be used until the angles are found exactly.', 'Both checks work with the rounded answers too — and with the unrounded ones the sum is exactly ' + t('180^\\circ') + '.']],
              'Angle sum: ' + t(fx(Au, 4) + '^\\circ+' + fx(90 - Au, 4) + '^\\circ+90^\\circ=180^\\circ') + ' (rounded: ' + t(dg(A) + '+' + dg(C) + '+90^\\circ=180^\\circ') + '). Hypotenuse longest: ' + t(s1(s.ac) + '>' + s1(s.ab)) + ' and ' + t(s1(s.ac) + '>' + s1(s.bc)) + '. Both pass.', ['The three angles of a triangle add to ' + t('180^\\circ') + '.'], 'self-checks');
          } }] },
      /* ---------- EP 2 ---------- */
      { num: '2',
        shared: function (r) {
          var tr = r.pick(RAMPS), h = tr[1] / 10, run = tr[0] / 10, ramp = tr[2] / 10, lim = 12;
          var L2 = gen(r, function (r) { return d1(r, 2.5, 5.0); }, function (L) { var a = T.asin(h / L); return a > lim + 2 && a < 30 && safe(a, 0) && safe(Math.sqrt(L * L - h * h), 1); });
          return { h: h, run: run, ramp: ramp, lim: lim, L2: L2 };
        },
        stem: function (s) {
          var k = 6 / s.run, hv = 2 * s.h, fig = HW.fig({ pts: { F: [0, 0], S: [s.run, 0], Tp: [s.run, hv] }, segs: [['F', 'Tp', s1(s.ramp) + ' m', { width: 3 }], ['F', 'S', s1(s.run) + ' m', { dash: 1 }], ['S', 'Tp', s1(s.h) + ' m', { dash: 1 }]], right: [['S', 'F', 'Tp']], angles: [['F', 'S', 'Tp', 'θ', { r: 40 }]], names: { F: 'foot' },
            extra: [{ type: 'ground', y: 0, x0: -0.05 * s.run, x1: s.run * 1.45 }, { type: 'building', at: [s.run * 1.22, hv], w: s.run * 0.43, h: 3 / k }, { type: 'text', at: [s.run * 1.22, hv + 1.5 / k], text: 'van' }], width: 320, aria: 'ramp into a van (not to scale)' });
          return 'A courier loads barrels into a delivery van up a straight portable ramp. The van’s sill is ' + t(s1(s.h)) + ' m above the ground, the foot of the ramp rests ' + t(s1(s.run)) + ' m out from the van, and the ramp surface is ' + t(s1(s.ramp)) + ' m long. The depot’s safety sheet allows a loaded ramp of at most ' + t(dg(s.lim)) + '.' + figWrap(fig);
        },
        parts: [
          { id: 'e2a', level: 'BEG', make: function (r, s) { var A = T.atan(s.h / s.run);
            return near('State the angle ' + t('\\theta') + ' the ramp makes with the ground, to the nearest degree.', A, 0, '°', angAlts(s.h, s.run, 'tan', 0), angWork(s1(s.h), s1(s.run), 'tan', A, 0) + '<br>(Also ' + t('\\sin\\theta=\\frac{' + s1(s.h) + '}{' + s1(s.ramp) + '}') + ' and ' + t('\\cos\\theta=\\frac{' + s1(s.run) + '}{' + s1(s.ramp) + '}') + ' give the same angle.)', ['The sill height is opposite ' + t('\\theta') + '.'], 'ramp angle'); } },
          { id: 'e2a2', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'Three ratios each give ' + t('\\theta') + '. Which one uses only the two lengths a courier can measure <b>without moving the ramp</b>?', t('\\sin\\theta=\\dfrac{' + s1(s.h) + '}{' + s1(s.ramp) + '}') + ' — the sill height and the ramp length.',
              [[t('\\tan\\theta=\\dfrac{' + s1(s.h) + '}{' + s1(s.run) + '}') + ' — the sill height and the run.', 'The ' + t(s1(s.run)) + ' m run lies along the ground <b>under</b> the ramp, so measuring it means working underneath the ramp.'],
                [t('\\cos\\theta=\\dfrac{' + s1(s.run) + '}{' + s1(s.ramp) + '}') + ' — the run and the ramp length.', 'The run is under the ramp. The two easy lengths are the sill height and the ramp itself.'],
                ['Any of them — every ratio uses the same two lengths.', 'Each ratio uses a different pair of sides: SOH uses opposite and hypotenuse, CAH adjacent and hypotenuse, TOA the two legs.']],
              t('\\sin\\theta=\\frac{' + s1(s.h) + '}{' + s1(s.ramp) + '},\\ \\cos\\theta=\\frac{' + s1(s.run) + '}{' + s1(s.ramp) + '},\\ \\tan\\theta=\\frac{' + s1(s.h) + '}{' + s1(s.run) + '}') + '. The <b>sine</b> uses the sill height and the ramp length — both reachable with the ramp in place.', ['Which lengths can you reach with a tape measure while the ramp is in place?'], 'measurable ratio');
          } },
          { id: 'e2b', level: 'BEG', make: function (r, s) {
            var A = T.atan(s.h / s.run), okk = A < s.lim, a = fx(A, 1);
            return P.mc(r, 'Does this ramp comply with the ' + t(dg(s.lim)) + ' limit?', [
              { html: 'Yes: ' + t('\\theta\\approx ' + dg(a)) + ' and ' + t(dg(a) + '<' + dg(s.lim)) + '.', right: okk, why: okk ? null : t(dg(a)) + ' is <b>more</b> than ' + t(dg(s.lim)) + ', so the ramp is too steep.' },
              { html: 'No: ' + t('\\theta\\approx ' + dg(a)) + ' and ' + t(dg(a) + '>' + dg(s.lim)) + '.', right: !okk, why: okk ? t(dg(a)) + ' is <b>less</b> than ' + t(dg(s.lim)) + ' — compare the two numbers again.' : null },
              { html: 'Yes: the ramp (' + t(s1(s.ramp)) + ' m) is longer than the run (' + t(s1(s.run)) + ' m).', right: false, why: 'Every ramp is longer than its run (it is the hypotenuse). Compliance is about the <b>angle</b>.' }],
              t('\\theta=\\tan^{-1}\\!\\left(\\frac{' + s1(s.h) + '}{' + s1(s.run) + '}\\right)=' + dg(fx(A, 2))) + '. ' + t(dg(fx(A, 2)) + (okk ? '<' : '>') + dg(s.lim)) + ', so the ramp ' + (okk ? '<b>complies</b>.' : '<b>does not comply</b>.'), ['Compare the angle with ' + t(dg(s.lim)) + '.'], 'ramp complies?', true);
          } },
          { id: 'e2c', level: 'EMG', make: function (r, s) { var A = T.asin(s.h / s.L2);
            var al = [{ v: T.atan(s.h / s.L2), code: 'trig-ratio', hint: 'The ' + t(s1(s.L2)) + ' m ramp is the <b>hypotenuse</b>, not the ground run. Opposite and hypotenuse: SOH.' }].concat(angAlts(s.h, s.L2, 'sin', 0));
            return near('A second courier has only a ' + t(s1(s.L2)) + ' m ramp, used against the same ' + t(s1(s.h)) + ' m sill. Determine the angle it makes with the ground, to the nearest degree.', A, 0, '°', al,
              'Known: the side opposite ' + t('\\theta') + ' (the sill) and the hypotenuse (the ramp) ' + t('\\Rightarrow') + ' SOH.<br>' + angWork(s1(s.h), s1(s.L2), 'sin', A, 0) + '<br>' + t(dg(fx(A, 0)) + '>' + dg(s.lim)) + ', so this ramp does not comply.', ['Which two sides do you know: opposite, adjacent, hypotenuse?'], 'short ramp angle');
          } },
          { id: 'e2c2', level: 'LIM', make: function (r, s) {
            var A = T.asin(s.h / s.L2), v = r.chance(0.5);
            return P.tf(r, 'The ' + t(s1(s.L2)) + ' m ramp against the ' + t(s1(s.h)) + ' m sill makes about ' + t(dg(fx(A, 0))) + ' with the ground. True or false: ' + (v ? '“This ramp is too steep for the ' + t(dg(s.lim)) + ' limit.”' : '“This ramp complies with the ' + t(dg(s.lim)) + ' limit.”'), v,
              t(dg(fx(A, 0))) + ' is more than ' + t(dg(s.lim)) + '.', t(dg(fx(A, 0)) + '>' + dg(s.lim)) + ': the shorter ramp is steeper and does <b>not</b> comply.', ['Compare the angle with the limit.'], 'short ramp complies?');
          } },
          { id: 'e2d', level: 'EMG', make: function (r, s) { var L = s.h / T.sin(s.lim);
            var al = [{ v: s.h / T.tan(s.lim), code: 'trig-ratio', hint: 'That is the ground <b>run</b>. The ramp is the hypotenuse: opposite and hypotenuse means sine.' }].concat(sideAlts(s.h, s.lim, 'opp', 'hyp'));
            return near('Determine the <b>shortest</b> ramp, to the nearest tenth of a metre, that reaches a ' + t(s1(s.h)) + ' m sill at exactly ' + t(dg(s.lim)) + '.', L, 1, 'm', al,
              'Let ' + t('L') + ' be the ramp (hypotenuse), with the sill opposite ' + t(dg(s.lim)) + ':<br>' + t('\\sin ' + dg(s.lim) + '=\\dfrac{' + s1(s.h) + '}{L}') + ' — the unknown is in the <b>denominator</b>, so the last step is a division:<br>' + t('L=\\dfrac{' + s1(s.h) + '}{\\sin ' + dg(s.lim) + '}=' + fx(L, 4) + '\\ldots\\approx ' + fx(L, 1)) + ' m',
              ['The ramp is the hypotenuse.', 'The unknown ends up in the denominator.'], 'shortest ramp');
          } },
          { id: 'e2e', level: 'BEG', make: function (r, s) { var run = Math.sqrt(s.L2 * s.L2 - s.h * s.h), A = T.asin(s.h / s.L2);
            return near('How far out from the van does the ' + t(s1(s.L2)) + ' m ramp rest? Give the answer to the nearest tenth of a metre.', run, 1, 'm', [{ v: Math.hypot(s.L2, s.h), code: 'trig-pyth', hint: 'The ramp is the hypotenuse, so <b>subtract</b>: ' + t('\\text{run}^2=' + s1(s.L2) + '^2-' + s1(s.h) + '^2') + '.' }, { v: s.L2 - s.h, code: 'trig-pyth', hint: 'Lengths don’t subtract directly — subtract their <b>squares</b>.' }],
              'Pythagorean theorem: ' + t('\\text{run}=\\sqrt{' + s1(s.L2) + '^2-' + s1(s.h) + '^2}=' + fx(run, 4) + '\\ldots\\approx ' + fx(run, 1)) + ' m.<br>Ratio check: ' + t(s1(s.L2) + '\\cos(' + fx(A, 4) + '^\\circ)=' + fx(run, 4)) + ' — the same, because the angle was kept unrounded.', ['The ramp is the hypotenuse; the run is a leg.'], 'run of short ramp');
          } },
          { id: 'e2e2', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'The run can be checked with the Pythagorean theorem or with ' + t('\\text{run}=' + s1(s.L2) + '\\cos\\theta') + '. Which route can’t drift, no matter how the arithmetic is ordered?', 'The Pythagorean theorem: it uses only the two original measurements and has no angle in it to round.',
              [['The cosine route: cosine is more accurate than squaring.', 'The cosine route needs ' + t('\\theta') + ', which was itself calculated — round it and the run can drift.'],
                ['Both are equally safe as long as one decimal is kept.', 'Rounding ' + t('\\theta') + ' first can move the cosine answer; the Pythagorean route never touches an angle.'],
                ['Neither — any calculation can drift.', 'A calculation that uses only the given measurements (and rounds once at the end) has nothing to drift.']],
              'The Pythagorean route uses only ' + t(s1(s.L2)) + ' and ' + t(s1(s.h)) + ', the original measurements. The trig route needs the angle, so it agrees only when the angle is carried unrounded.', ['Which route uses a value that was itself calculated and could be rounded?'], 'which cannot drift');
          } }] },
      /* ---------- EP 3 ---------- */
      { num: '3', section: 'Extra practice B — Choosing the tool', stem: 'For each triangle, name the tool (Pythagorean theorem, a ratio, an inverse ratio, or the ' + t('90^\\circ') + ' complement) and carry it out.', parts: [
        { id: 'e3a', level: 'BEG', make: function (r) { var tr = r.pick(HALFTRIP), k = tr[3], v = tr[0] * k, h = tr[1] * k, c = tr[2] * k;
          return near('Determine ' + t('PQ') + '.' + figWrap(tri({ w: h, h: v, names: ['Q', 'P', 'R'], sides: { a: s1(v), b: s1(h) }, width: 230 }, r)), c, 1, '', [{ v: Math.sqrt(h * h - v * v), code: 'trig-pyth', hint: t('PQ') + ' is the hypotenuse (across from the right angle at ' + t('R') + '): add the squares.' }, { v: h + v, code: 'trig-pyth', hint: 'Lengths don’t add — use the Pythagorean theorem.' }],
            '<b>Pythagorean theorem</b> — two sides known, no angle given or wanted.<br>' + t('PQ=\\sqrt{' + s1(v) + '^2+' + s1(h) + '^2}=\\sqrt{' + rnd(c * c, 2) + '}=' + s1(c)), ['Two legs known, the hypotenuse wanted.'], 'PQ pythag'); } },
        { id: 'e3b', level: 'LIM', make: function (r) { var A = r.int(20, 70);
          return near('Determine ' + t('\\angle P') + '.' + figWrap(tri({ w: 4, h: 4 * T.tan(A), names: ['M', 'P', 'N'], angles: { A: A + '°' }, width: 220 }, r)), 90 - A, 0, '°', [{ v: 180 - A, code: 'trig-complement', hint: 'The two acute angles of a right triangle add to ' + t('90^\\circ') + '.' }, { v: A, code: 'trig-other-angle', hint: 'That is ' + t('\\angle M') + '. ' + t('\\angle P') + ' is the other acute angle.' }],
            '<b>The ' + t('90^\\circ') + ' complement</b> — the acute angles add to ' + t('90^\\circ') + ': ' + t('\\angle P=90^\\circ-' + dg(A) + '=' + dg(90 - A)), ['No trigonometry needed: what do the two acute angles add to?'], 'complement ' + A); } },
        { id: 'e3c', level: 'BEG', make: function (r) { var s = gen(r, function (r) { return { h: d1(r, 10, 30), A: r.int(25, 65) }; }, function (s) { return safe(s.h * T.sin(s.A), 1); }), x = s.h * T.sin(s.A);
          return near('Determine ' + t('YZ') + '.' + figWrap(tri({ w: 4, h: 4 * T.tan(s.A), names: ['X', 'Z', 'Y'], sides: { c: s1(s.h) }, angles: { A: s.A + '°' }, width: 230 }, r)), x, 1, '', sideAlts(s.h, s.A, 'hyp', 'opp'),
            '<b>A ratio</b> (sine). ' + sideWork(s.h, s1(s.h), s.A, 'hyp', 'opp', x, 1, '', 'YZ'), ['Relative to ' + t('\\angle X') + ', ' + t('YZ') + ' is opposite and ' + t(s1(s.h)) + ' is the hypotenuse.'], 'YZ sine'); } },
        { id: 'e3d', level: 'BEG', make: function (r) { var s = gen(r, function (r) { return { a: d1(r, 4, 12), o: d1(r, 3, 12) }; }, function (s) { var q = s.o / s.a; return q > 0.35 && q < 2.5 && Math.abs(q - 1) > 0.1 && safe(T.atan(q), 0); }), A = T.atan(s.o / s.a);
          return near('Determine ' + t('\\angle D') + '.' + figWrap(tri({ w: s.a, h: s.o, names: ['D', 'E', 'F'], sides: { a: s1(s.o), b: s1(s.a) }, width: 230 }, r)), A, 0, '°', angAlts(s.o, s.a, 'tan', 0),
            '<b>An inverse ratio</b> (inverse tangent): an angle is wanted and the two legs are known — opposite ' + t('FE=' + s1(s.o)) + ', adjacent ' + t('FD=' + s1(s.a)) + '.<br>' + angWork(s1(s.o), s1(s.a), 'tan', A, 0, '\\angle D'), ['An angle is wanted: use an inverse key.'], 'angle D inverse tan'); } },
        { id: 'e3e', level: 'EMG', make: function (r) { var s = gen(r, function (r) { return { a: d1(r, 10, 30), A: r.int(20, 60) }; }, function (s) { return safe(s.a / T.cos(s.A), 1); }), x = s.a / T.cos(s.A);
          return near('Determine ' + t('JL') + '.' + figWrap(tri({ w: 4, h: 4 * T.tan(s.A), names: ['J', 'L', 'K'], sides: { b: s1(s.a) }, angles: { A: s.A + '°' }, width: 230 }, r)), x, 1, '', sideAlts(s.a, s.A, 'adj', 'hyp'),
            '<b>A ratio</b> (cosine). ' + sideWork(s.a, s1(s.a), s.A, 'adj', 'hyp', x, 1, '', 'JL'), ['Relative to ' + t('\\angle J') + ', the given side is adjacent and ' + t('JL') + ' is the hypotenuse.', 'The unknown ends up in the denominator.'], 'JL cosine'); } },
        { id: 'e3g', level: 'EMG', make: function (r) {
          var rows = r.shuffle([{ id: 'a', html: '(a) ' + t('PQ') + ' from two legs' }, { id: 'b', html: '(b) ' + t('\\angle P') + ' from ' + t('\\angle M') }, { id: 'c', html: '(c) ' + t('YZ') + ' from an angle and the hyp.' }, { id: 'd', html: '(d) ' + t('\\angle D') + ' from two legs' }, { id: 'e', html: '(e) ' + t('JL') + ' from an angle and a leg' }]);
          return grid('Name the tool for each triangle.', rows, [{ id: 'py', html: 'Pythag.' }, { id: 'ra', html: 'ratio' }, { id: 'inv', html: 'inverse' }, { id: 'co', html: t('90^\\circ-') }], { a: 'py', b: 'co', c: 'ra', d: 'inv', e: 'ra' },
            function (row, got) { return { code: 'trig-ratio', hint: { a: 'Two sides known and a side wanted, with no angle in sight: no trigonometry needed.', b: 'One acute angle gives the other for free: they add to ' + t('90^\\circ') + '.', c: 'A side is wanted from an angle and a side: a ratio (SOH CAH TOA).', d: 'An <b>angle</b> is wanted from two sides: an inverse ratio.', e: 'A side is wanted from an angle and a side: a ratio.' }[row] }; },
            '(a) Pythagorean theorem; (b) ' + t('90^\\circ') + ' complement; (c) a ratio (sine); (d) an inverse ratio (' + t('\\tan^{-1}') + '); (e) a ratio (cosine).', ['Sides only → Pythagoras. Angle → angle: complement. Angle + side → side: ratio. Two sides → angle: inverse ratio.'], 'tool for each');
        } },
        { id: 'e3f', level: 'EMG', make: function (r) {
          return mcWhy(r, 'Which statement about the five triangles (a)–(e) is correct?', '(a) and (b) used no ratio (Pythagoras and the complement); (c) put the unknown in the numerator (multiply), (e) put it in the denominator (divide), and (d) needed an inverse ratio.',
            [['(a) and (d) used no ratio; (c) and (e) both put the unknown in the numerator.', '(d) used ' + t('\\tan^{-1}') + ', and in (e) ' + t('\\cos 32^\\circ=\\frac{21.0}{JL}') + ' has ' + t('JL') + ' on the bottom.'],
              ['(a) and (b) used no ratio; (c) put the unknown in the denominator and (e) in the numerator.', 'In (c), ' + t('\\sin 52^\\circ=\\frac{YZ}{18.4}') + ' — ' + t('YZ') + ' is on top, so you multiply. (e) is the one with the unknown underneath.'],
              ['Only (a) used no ratio; (b) needed ' + t('\\sin^{-1}') + '.', 'In (b) the other acute angle is simply ' + t('90^\\circ') + ' minus the given one — no ratio at all.']],
            'No ratio: (a) the Pythagorean theorem and (b) the ' + t('90^\\circ') + ' complement. Unknown in the numerator: (c), last step multiply. Unknown in the denominator: (e), last step divide. (d) wanted an angle, so its last step was an inverse ratio.', ['Write the equation for (c) and (e): where does the unknown sit?'], 'numerator vs denominator');
        } }] },
      /* ---------- EP 4 ---------- */
      { num: '4',
        shared: function (r) { return gen(r, function (r) { var h = r.int(25, 50); return { h: h, l: r.int(8, h - 8) }; }, function (s) { var st = Math.sqrt(s.h * s.h - s.l * s.l), a = 0.5 * st * s.l, b = 0.5 * rnd(st, 1) * s.l; return fx(a, 1) !== fx(b, 1) && safe(st, 1) && safe(a, 1) && safe(T.asin(s.l / s.h), 0) && Math.abs(st - Math.round(st)) > 1e-6; }); },
        stem: function (s) {
          var st = Math.sqrt(s.h * s.h - s.l * s.l);
          return 'In ' + t('\\triangle STU') + ' the right angle is at ' + t('T') + ', the hypotenuse ' + t('SU=' + s1(s.h)) + ' and the leg ' + t('TU=' + s1(s.l)) + '. Four quantities are wanted: ' + t('ST') + ', ' + t('\\angle S') + ', ' + t('\\angle U') + ' and the area of the triangle.' + figWrap(HW.tri({ w: s.l, h: st, names: ['U', 'S', 'T'], sides: { a: '?', b: s1(s.l), c: s1(s.h) }, width: 200 }));
        },
        parts: [
          { id: 'e4a', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'Before calculating: which two of the four can be found <b>straight from the given data</b>?', t('ST') + ' (Pythagorean theorem) and ' + t('\\angle S') + ' (inverse sine: ' + t('TU') + ' is opposite ' + t('S') + ', ' + t('SU') + ' is the hypotenuse).',
              [[t('ST') + ' and the area.', 'The area needs ' + t('ST') + ' first (the legs are the base and height), so it isn’t straight from the givens.'],
                [t('\\angle S') + ' and ' + t('\\angle U') + '.', 'Either angle can come from the givens, but the quick route to the second one is ' + t('90^\\circ') + ' minus the first — so ' + t('\\angle U') + ' is best done after ' + t('\\angle S') + '. ' + t('ST') + ' is the other one that needs only the givens.'],
                [t('\\angle U') + ' and the area.', 'Both of these are easiest <b>after</b> something else: ' + t('\\angle U=90^\\circ-\\angle S') + ', and the area needs ' + t('ST') + '.']],
              'From the givens: 1. ' + t('ST') + ' by the Pythagorean theorem; 2. ' + t('\\angle S') + ' by ' + t('\\sin^{-1}\\!\\left(\\frac{' + s1(s.l) + '}{' + s1(s.h) + '}\\right)') + '. Then: 3. ' + t('\\angle U=90^\\circ-\\angle S') + ' (unrounded); 4. area ' + t('=\\tfrac12(ST)(TU)') + '.', ['Which quantities need another answer first?'], 'plan order');
          } },
          { id: 'e4b', level: 'PRG', make: function (r, s) {
            var st = Math.sqrt(s.h * s.h - s.l * s.l), S = T.asin(s.l / s.h), U = 90 - S, ar = 0.5 * st * s.l;
            return fieldsPart('Carry out the plan: ' + t('ST') + ' to the nearest tenth, both angles to the nearest degree, and the area to the nearest tenth of a square unit.', [
              nf('ST=', st, 1, '', [{ v: Math.hypot(s.h, s.l), code: 'trig-pyth', hint: t('SU') + ' is the hypotenuse, so <b>subtract</b>: ' + t('ST^2=SU^2-TU^2') + '.' }]),
              nf('\\angle S=', S, 0, '°', angAlts(s.l, s.h, 'sin', 0)), nf('\\angle U=', U, 0, '°', angAlts(st, s.h, 'sin', 0)),
              nf('\\text{Area}=', ar, 1, '', [{ v: 0.5 * rnd(st, 1) * s.l, code: 'trig-early', hint: 'Use the <b>unrounded</b> ' + t('ST') + ' in the area — the rounding error gets multiplied.' }, { v: st * s.l, code: 'trig-area-half', hint: 'Area of a triangle ' + t('=\\tfrac12\\times\\text{base}\\times\\text{height}') + '.' }, { v: 0.5 * s.h * s.l, code: 'trig-wrong-side', hint: 'The base and height are the two <b>legs</b> (they meet at the right angle), not the hypotenuse.' }])],
              t('ST=\\sqrt{' + s1(s.h) + '^2-' + s1(s.l) + '^2}=\\sqrt{' + (s.h * s.h - s.l * s.l) + '}=' + fx(st, 4) + '\\approx ' + fx(st, 1)) + '<br>' + t('\\sin S=\\frac{' + s1(s.l) + '}{' + s1(s.h) + '}\\Rightarrow \\angle S=' + fx(S, 4) + '^\\circ\\approx ' + dg(fx(S, 0))) + '<br>' + t('\\angle U=90^\\circ-' + fx(S, 4) + '^\\circ=' + fx(U, 4) + '^\\circ\\approx ' + dg(fx(U, 0))) + '<br>' + t('\\text{Area}=\\tfrac12(' + fx(st, 4) + ')(' + s1(s.l) + ')=' + fx(ar, 4) + '\\approx ' + fx(ar, 1)),
              ['The legs ' + t('ST') + ' and ' + t('TU') + ' meet at the right angle, so they are the base and height.', 'Keep ' + t('ST') + ' unrounded for the area.'], 'solve STU + area');
          } },
          { id: 'e4c', level: 'BEG', make: function (r, s) {
            var st = Math.sqrt(s.h * s.h - s.l * s.l), sr = rnd(st, 1), a2 = 0.5 * sr * s.l, ar = 0.5 * st * s.l;
            return near('Work the area out a second time, from the <b>rounded</b> ' + t('ST=' + fx(st, 1)) + '. (Nearest tenth.)', a2, 1, '', [{ v: ar, code: 'trig-early', hint: 'That is the area from the unrounded ' + t('ST') + '. This time use ' + t('ST=' + fx(st, 1)) + ' exactly as rounded.' }, { v: sr * s.l, code: 'trig-area-half', hint: 'Don’t forget the ' + t('\\tfrac12') + '.' }],
              t('\\tfrac12(' + fx(st, 1) + ')(' + s1(s.l) + ')=' + fx(a2, 2)) + ' — against the correct ' + t(fx(ar, 1)) + ', a disagreement of ' + t(fx(Math.abs(a2 - ar), 1)) + '.', ['Area ' + t('=\\tfrac12(ST)(TU)') + ' with ' + t('ST=' + fx(st, 1)) + '.'], 'area from rounded ST');
          } },
          { id: 'e4c2', level: 'EMG', make: function (r, s) {
            var st = Math.sqrt(s.h * s.h - s.l * s.l), d = Math.abs(rnd(st, 1) - st), m = s.l / 2;
            return mcWhy(r, 'Rounding ' + t('ST') + ' moved it by only ' + t(fx(d, 4)) + ', yet the area changed in the first decimal place. Why?', 'The area multiplies ' + t('ST') + ' by ' + t('\\tfrac12(' + s1(s.l) + ')=' + rnd(m, 1)) + ', so the tiny rounding error is multiplied by ' + t(rnd(m, 1)) + ' too.',
              [['The rounded ' + t('ST=' + fx(st, 1)) + ' is wrong in its first decimal place.', t(fx(st, 1)) + ' is ' + t('ST') + ' correct to the nearest tenth — the error is invisible in ' + t('ST') + ' itself.'],
                ['The ' + t('\\tfrac12') + ' in the area formula halves the error, which shows it more clearly.', 'Halving would make the error smaller. The whole factor is ' + t('\\tfrac12\\times ' + s1(s.l) + '=' + rnd(m, 1)) + ', which makes it bigger.'],
                ['The area formula should use the hypotenuse, which was never rounded.', 'The base and height are the legs ' + t('ST') + ' and ' + t('TU') + '. The trouble is rounding ' + t('ST') + ' before multiplying.']],
              t('ST') + ' moved by ' + t(fx(d, 4)) + '; the area formula multiplies it by ' + t(rnd(m, 1)) + ', so the area moves by about ' + t(rnd(m, 1) + '\\times ' + fx(d, 4) + '\\approx ' + fx(m * d, 2)) + '. A harmless-looking rounding error becomes visible once it is multiplied by a large number — carry ' + t('ST') + ' unrounded and round once, at the end.', ['What does the area formula do to ' + t('ST') + '?'], 'why error magnified');
          } }] },
      /* ---------- EP 5 ---------- */
      { num: '5', stem: '<b>Decide before pressing a key.</b> State which quantity is larger — or that they are equal — using SOH CAH TOA reasoning about the sides, not a calculator value. (Then check with a calculator.)', parts: [
        { id: 'e5a', level: 'EMG', make: function (r) {
          var x = gen(r, function (r) { return r.int(30, 60); }, function (x) { return x !== 45; }), cosBig = x < 45;
          return P.mc(r, t('\\sin ' + dg(x)) + ' or ' + t('\\cos ' + dg(x)) + '?', [
            { html: t('\\sin ' + dg(x)) + ' is larger', right: !cosBig, why: 'At ' + t(dg(x)) + ' (less than ' + t('45^\\circ') + ') the side <b>opposite</b> the angle is shorter than the side adjacent to it, and both ratios divide by the same hypotenuse.' },
            { html: t('\\cos ' + dg(x)) + ' is larger', right: cosBig, why: 'At ' + t(dg(x)) + ' (more than ' + t('45^\\circ') + ') the side <b>opposite</b> the angle is longer than the side adjacent to it, and both ratios divide by the same hypotenuse.' },
            { html: 'They are equal', right: false, why: 'They are equal only at ' + t('45^\\circ') + ', where the two legs are equal.' }],
            'Both ratios divide by the hypotenuse, so compare the tops: opposite vs adjacent. At ' + t(dg(x)) + ' ' + (cosBig ? '(less than ' + t('45^\\circ') + ') the adjacent side is longer, so <b>' + t('\\cos ' + dg(x)) + '</b> is larger.' : '(more than ' + t('45^\\circ') + ') the opposite side is longer, so <b>' + t('\\sin ' + dg(x)) + '</b> is larger.') + ' Check: ' + t('\\sin ' + dg(x) + '=' + fx(T.sin(x), 4) + ',\\ \\cos ' + dg(x) + '=' + fx(T.cos(x), 4)) + '.',
            ['Picture the triangle: below ' + t('45^\\circ') + ', is the opposite leg shorter or longer than the adjacent leg?'], 'sin vs cos ' + x, true);
        } },
        { id: 'e5b', level: 'EMG', make: function (r) {
          var x = gen(r, function (r) { return r.int(35, 55); }, function (x) { return x !== 45; }), big = x > 45;
          return P.mc(r, t('\\tan ' + dg(x)) + ' or ' + t('1') + '?', [
            { html: t('\\tan ' + dg(x)) + ' is larger', right: big, why: 'Below ' + t('45^\\circ') + ' the opposite side is shorter than the adjacent side, so ' + t('\\frac{\\text{opp}}{\\text{adj}}<1') + '.' },
            { html: t('1') + ' is larger', right: !big, why: 'Above ' + t('45^\\circ') + ' the opposite side is longer than the adjacent side, so ' + t('\\frac{\\text{opp}}{\\text{adj}}>1') + '.' },
            { html: 'They are equal', right: false, why: t('\\tan\\theta=1') + ' only at ' + t('45^\\circ') + ', where the legs are equal.' }],
            t('\\tan ' + dg(x) + '=\\frac{\\text{opp}}{\\text{adj}}') + '. At ' + t(dg(x)) + ' the opposite side is ' + (big ? 'longer' : 'shorter') + ' than the adjacent side, so the fraction is ' + (big ? 'more' : 'less') + ' than ' + t('1') + '. Check: ' + t('\\tan ' + dg(x) + '=' + fx(T.tan(x), 4)) + '.', ['At ' + t('45^\\circ') + ' the two legs are equal and ' + t('\\tan 45^\\circ=1') + '.'], 'tan vs 1 ' + x, true);
        } },
        { id: 'e5c', level: 'EMG', make: function (r) {
          var a = r.int(55, 82), eq = r.chance(0.5), b = eq ? 90 - a : 90 - a + r.pick([-4, -3, -2, 2, 3, 4]), cv = T.cos(a), sv = T.sin(b);
          var rel = eq ? 'eq' : cv > sv ? 'c' : 's';
          return P.mc(r, t('\\cos ' + dg(a)) + ' or ' + t('\\sin ' + dg(b)) + '?', [
            { html: t('\\cos ' + dg(a)) + ' is larger', right: rel === 'c', why: t('\\cos ' + dg(a) + '=\\sin ' + dg(90 - a)) + ' (cofunctions). Now compare ' + t('\\sin ' + dg(90 - a)) + ' with ' + t('\\sin ' + dg(b)) + ': sine grows as the angle grows.' },
            { html: t('\\sin ' + dg(b)) + ' is larger', right: rel === 's', why: t('\\cos ' + dg(a) + '=\\sin ' + dg(90 - a)) + ' (cofunctions). Now compare ' + t('\\sin ' + dg(90 - a)) + ' with ' + t('\\sin ' + dg(b)) + '.' },
            { html: 'They are equal', right: rel === 'eq', why: t(dg(a) + '+' + dg(b) + '=' + dg(a + b)) + ', not ' + t('90^\\circ') + ', so the cofunction rule doesn’t make them equal.' }],
            t('\\cos ' + dg(a) + '=\\sin(90^\\circ-' + dg(a) + ')=\\sin ' + dg(90 - a)) + ': the side adjacent to ' + t(dg(a)) + ' is the side opposite ' + t(dg(90 - a)) + '. ' + (eq ? 'So the two are <b>equal</b>.' : 'Sine increases with the angle, so the one with the larger angle (' + t(rel === 's' ? '\\sin ' + dg(b) : '\\cos ' + dg(a)) + ') is <b>larger</b>.') + ' Check: ' + t('\\cos ' + dg(a) + '=' + fx(cv, 4) + ',\\ \\sin ' + dg(b) + '=' + fx(sv, 4)) + '.',
            ['Rewrite ' + t('\\cos ' + dg(a)) + ' as the sine of its complement.'], 'cofunction compare ' + a + ',' + b, true);
        } },
        { id: 'e5d', level: 'EMG', make: function (r) {
          var x = r.int(20, 75), tanFirst = r.chance(0.5), A = tanFirst ? '\\tan ' : '\\sin ', B = tanFirst ? '\\sin ' : '\\tan ';
          return P.mc(r, t(A + dg(x)) + ' or ' + t(B + dg(x)) + '?', [
            { html: t(A + dg(x)) + ' is larger', right: tanFirst, why: 'Both have the opposite side on top. Sine divides by the hypotenuse — the longest side — so sine is the smaller.' },
            { html: t(B + dg(x)) + ' is larger', right: !tanFirst, why: 'Both have the opposite side on top. Sine divides by the hypotenuse — the longest side — so sine is the smaller.' },
            { html: 'They are equal', right: false, why: 'They have the same top (opposite) but different bottoms: adjacent vs hypotenuse.' }],
            'Both ratios have the <b>opposite</b> side on top; ' + t('\\tan') + ' divides by the adjacent side and ' + t('\\sin') + ' by the hypotenuse. The hypotenuse is the bigger denominator, so ' + t('\\tan ' + dg(x)) + ' is larger — for every acute angle. Check: ' + t('\\tan ' + dg(x) + '=' + fx(T.tan(x), 4) + ',\\ \\sin ' + dg(x) + '=' + fx(T.sin(x), 4)) + '.', ['Same numerator: the bigger denominator gives the smaller value.'], 'tan vs sin ' + x, true);
        } },
        { id: 'e5e', level: 'BEG', make: function (r) {
          var rows = r.shuffle([['s0', '\\sin 0^\\circ', 'z'], ['c0', '\\cos 0^\\circ', 'o'], ['t0', '\\tan 0^\\circ', 'z'], ['s9', '\\sin 90^\\circ', 'o'], ['c9', '\\cos 90^\\circ', 'z'], ['t9', '\\tan 90^\\circ', 'u']]), want = {};
          rows.forEach(function (x) { want[x[0]] = x[2]; });
          return grid('State the exact value of each.', rows.map(function (x) { return { id: x[0], html: t(x[1]), label: x[1].replace(/\\/g, '') }; }), [{ id: 'z', html: t('0') }, { id: 'o', html: t('1') }, { id: 'u', html: 'undefined' }], want,
            function (row) { return { code: 'trig-ratio', hint: row === 't9' ? 'At ' + t('90^\\circ') + ' the adjacent side has shrunk to ' + t('0') + ': ' + t('\\frac{\\text{opp}}{0}') + ' has no value.' : 'Picture the triangle squashed flat (' + t('0^\\circ') + ': opposite ' + t('\\to 0') + ', adjacent ' + t('\\to') + ' hyp) or stood up (' + t('90^\\circ') + ': adjacent ' + t('\\to 0') + ', opposite ' + t('\\to') + ' hyp).' }; },
            t('\\sin 0^\\circ=0,\\ \\cos 0^\\circ=1,\\ \\tan 0^\\circ=0,\\ \\sin 90^\\circ=1,\\ \\cos 90^\\circ=0') + ', and ' + t('\\tan 90^\\circ') + ' is <b>undefined</b>.', ['Use the calculator to check each, in degree mode.'], 'exact values 0 and 90');
        } },
        { id: 'e5e2', level: 'EMG', make: function (r) {
          var a = r.pick([85, 88, 89]);
          return mcWhy(r, 'Why is ' + t('\\tan 90^\\circ') + ' undefined? (For example, ' + t('\\tan ' + dg(a) + '\\approx ' + fx(T.tan(a), 2)) + '.)', 'As the angle opens toward ' + t('90^\\circ') + ', the adjacent side shrinks toward ' + t('0') + ' while the opposite side does not, so ' + t('\\frac{\\text{opp}}{\\text{adj}}') + ' becomes a division by zero.',
            [['Because ' + t('\\tan 90^\\circ=\\infty') + ', which is too big for the calculator.', 'Infinity isn’t a number the ratio can equal; the ratio is a division by zero, which has no value.'],
              ['Because the hypotenuse becomes ' + t('0') + ' at ' + t('90^\\circ') + '.', 'Tangent doesn’t use the hypotenuse. It is the <b>adjacent</b> side that shrinks to ' + t('0') + '.'],
              ['Because a triangle can’t have a ' + t('90^\\circ') + ' angle.', 'Every right triangle has one! The point is that the <b>acute</b> angle can’t reach ' + t('90^\\circ') + ' — its adjacent side would vanish.']],
            t('\\tan=\\frac{\\text{opp}}{\\text{adj}}') + '. Near ' + t('90^\\circ') + ' the adjacent side shrinks toward ' + t('0') + ' while the opposite side heads toward the hypotenuse, so the fraction grows without bound (' + t('\\tan ' + dg(a) + '\\approx ' + fx(T.tan(a), 2)) + '); at ' + t('90^\\circ') + ' it would be a division by zero.', ['Which side shrinks as the angle opens toward ' + t('90^\\circ') + '?'], 'why tan 90 undefined');
        } },
        { id: 'e5f', level: 'EMG', make: function (r) {
          return mcWhy(r, 'Why does no acute angle have a sine greater than ' + t('1') + ', while the tangent of an acute angle has no upper limit?', t('\\sin=\\frac{\\text{opp}}{\\text{hyp}}') + ' and the hypotenuse is always the longest side; ' + t('\\tan=\\frac{\\text{opp}}{\\text{adj}}') + ' compares two legs, and the adjacent leg can be made as short as we like.',
            [['Sine is always a decimal and tangent is always a whole number.', 'Both give all sorts of values: ' + t('\\sin 30^\\circ=0.5') + ', ' + t('\\tan 30^\\circ\\approx 0.58') + '.'],
              ['The calculator limits sine to ' + t('1') + ' but not tangent.', 'The limit comes from the sides of the triangle, not the calculator.'],
              ['Sine uses the hypotenuse, which is always the shortest side.', 'The hypotenuse is the <b>longest</b> side — that is exactly why the sine fraction is less than ' + t('1') + '.']],
            '<b>Sine:</b> ' + t('\\frac{\\text{opp}}{\\text{hyp}}') + ', and the hypotenuse is the longest side, so the fraction is less than ' + t('1') + '. <b>Tangent:</b> ' + t('\\frac{\\text{opp}}{\\text{adj}}') + ' compares two legs; as the angle opens the adjacent leg can be made as short as we please, so the fraction can be as large as we please.', ['Which side is the denominator of each ratio?'], 'sine ≤ 1, tan unbounded');
        } }] },
      /* ---------- EP 6 ---------- */
      { num: '6', stem: '<b>No diagram is supplied.</b> Sketch and label each triangle yourself — mark the right angle and every given measurement — then choose a tool and finish.', parts: [
        { id: 'e6a', level: 'EMG', make: function (r) { var s = gen(r, function (r) { return { A: r.int(25, 60), ab: d1(r, 8, 25) }; }, function (s) { return safe(s.ab * T.tan(s.A), 1); }), x = s.ab * T.tan(s.A);
          return near('In ' + t('\\triangle ABC') + ', ' + t('\\angle B=90^\\circ') + ', ' + t('\\angle A=' + dg(s.A)) + ' and ' + t('AB=' + s1(s.ab)) + ' cm. Determine ' + t('BC') + ' to the nearest tenth.', x, 1, 'cm', sideAlts(s.ab, s.A, 'adj', 'opp'),
            'Right angle at ' + t('B') + '. ' + sideWork(s.ab, s1(s.ab), s.A, 'adj', 'opp', x, 1, 'cm', 'BC'), ['Sketch it: ' + t('AB') + ' runs from ' + t('A') + ' to the right angle, so it is adjacent to ' + t('\\angle A') + '.'], 'BC from AB ' + s.A); } },
        { id: 'e6b', level: 'PRG', make: function (r) { var s = gen(r, function (r) { return { F: r.int(30, 65), de: d1(r, 5, 20) }; }, function (s) { return safe(s.de / T.sin(s.F), 1); }), x = s.de / T.sin(s.F);
          return near('In ' + t('\\triangle DEF') + ', ' + t('\\angle E=90^\\circ') + ', ' + t('\\angle F=' + dg(s.F)) + ' and ' + t('DE=' + s1(s.de)) + ' m. Determine ' + t('DF') + ' to the nearest tenth.', x, 1, 'm', sideAlts(s.de, s.F, 'opp', 'hyp'),
            'Right angle at ' + t('E') + '; relative to ' + t('\\angle F') + ', ' + t('DE') + ' is opposite and ' + t('DF') + ' is the hypotenuse.<br>' + sideWork(s.de, s1(s.de), s.F, 'opp', 'hyp', x, 1, 'm', 'DF'), ['The angle is at ' + t('F') + ': ' + t('DE') + ' does not touch ' + t('F') + '.', 'The unknown ends up in the denominator.'], 'DF from DE ' + s.F); } },
        { id: 'e6c', level: 'EMG', make: function (r) { var s = gen(r, function (r) { var g = d1(r, 3, 12); return { gh: g, gj: rnd(g + d1(r, 4, 18), 1) }; }, function (s) { return s.gj <= 30 && safe(T.acos(s.gh / s.gj), 0); }), A = T.acos(s.gh / s.gj);
          return near('In ' + t('\\triangle GHJ') + ', ' + t('\\angle H=90^\\circ') + ', ' + t('GH=' + s1(s.gh)) + ' and ' + t('GJ=' + s1(s.gj)) + '. Determine ' + t('\\angle G') + ' to the nearest degree.', A, 0, '°', angAlts(s.gh, s.gj, 'cos', 0),
            'Right angle at ' + t('H') + ', so ' + t('GJ') + ' is the hypotenuse and ' + t('GH') + ' is adjacent to ' + t('\\angle G') + ' ' + t('\\Rightarrow') + ' CAH.<br>' + angWork(s1(s.gh), s1(s.gj), 'cos', A, 0, '\\angle G'), [t('GJ') + ' is across from the right angle at ' + t('H') + '.'], 'angle G cos'); } },
        { id: 'e6d', level: 'BEG', make: function (r) { var s = gen(r, function (r) { var g = d1(r, 3, 12); return { gh: g, gj: rnd(g + d1(r, 4, 18), 1), k: r.int(2, 4) }; }, function (s) { return s.gj <= 30 && safe(T.acos(s.gh / s.gj), 0); }), A = T.acos(s.gh / s.gj), kl = rnd(s.k * s.gh, 1), km = rnd(s.k * s.gj, 1);
          return near('In right ' + t('\\triangle GHJ') + ' (' + t('\\angle H=90^\\circ') + '), ' + t('GH=' + s1(s.gh)) + ', ' + t('GJ=' + s1(s.gj)) + ' and ' + t('\\angle G\\approx ' + dg(fx(A, 0))) + '. ' + t('\\triangle KLM') + ' has every side exactly ' + t(s.k) + ' times the matching side, so ' + t('KL=' + s1(kl)) + ' and ' + t('KM=' + s1(km)) + '. State ' + t('\\angle K') + ' without any new calculation.', A, 0, '°', [{ v: s.k * A, code: 'trig-scale', hint: 'Scaling the sides doesn’t scale the angles: ' + t('\\cos K=\\frac{' + s1(kl) + '}{' + s1(km) + '}') + ' — the factor ' + t(s.k) + ' cancels.' }, { v: A / s.k, code: 'trig-scale', hint: 'The angle doesn’t shrink either: the ratio ' + t('\\frac{KL}{KM}') + ' is exactly the same as ' + t('\\frac{GH}{GJ}') + '.' }],
            t('\\cos K=\\dfrac{' + s1(kl) + '}{' + s1(km) + '}=\\dfrac{' + s.k + '\\times ' + s1(s.gh) + '}{' + s.k + '\\times ' + s1(s.gj) + '}=\\dfrac{' + s1(s.gh) + '}{' + s1(s.gj) + '}') + ' — the same ratio as ' + t('\\cos G') + ', so ' + t('\\angle K=\\angle G\\approx ' + dg(fx(A, 0))) + '. A ratio measures the shape, not the size.', ['Write ' + t('\\cos K') + ' as a fraction and simplify it.'], 'similar triangle angle'); } },
        { id: 'e6e', level: 'EMG', make: function (r) {
          return mcWhy(r, 'In “find a side” problems, the unknown sometimes ends up in the numerator of the ratio and sometimes in the denominator. Which statement is correct?', 'Unknown in the numerator (e.g. ' + t('\\tan 35^\\circ=\\frac{BC}{17.4}') + '): multiply. Unknown in the denominator (e.g. ' + t('\\sin 48^\\circ=\\frac{9.6}{DF}') + '): divide the known side by the ratio. When the unknown is an angle, the last step is an inverse ratio instead.',
            [['The unknown is always in the numerator if you set it up correctly.', 'Not so: when the known side is the opposite and the hypotenuse is wanted, ' + t('\\sin\\theta=\\frac{\\text{opp}}{\\text{hyp}}') + ' puts the unknown underneath.'],
              ['Unknown in the denominator: multiply the known side by the ratio.', 'That gives the wrong answer: from ' + t('\\sin 48^\\circ=\\frac{9.6}{DF}') + ', ' + t('DF=\\frac{9.6}{\\sin 48^\\circ}') + ' — a division.'],
              ['When an angle is the unknown, the last step is a multiplication.', 'For an angle, the ratio is already a number; the last step is the inverse key (e.g. ' + t('\\cos^{-1}') + ').']],
            'Numerator: multiply both sides by the known side. Denominator: bring the unknown up, so the last step is (known side) ' + t('\\div') + ' (ratio). Angle unknown: the last step is an inverse ratio.', ['Write the equation for each case and solve it.'], 'numerator vs denominator 2');
        } }] },
      /* ---------- EP 7 ---------- */
      { num: '7', section: 'Extra practice C — Applied and multi-step',
        shared: function (r) { return gen(r, function (r) { var a2 = r.int(28, 45); return { e: r.int(150, 180) / 100, d: d1(r, 40, 80), a2: a2, a1: a2 - r.int(5, 10), w: d1(r, 10, 30) }; },
          function (s) { var t1 = s.d * T.tan(s.a1), t2 = s.d * T.tan(s.a2); return safe(t1 + s.e, 1) && safe(t2 + s.e, 1) && safe(t2 - t1, 1) && safe(T.atan(t2 / (s.d + s.w)), 0); }); },
        stem: function (s) {
          var b = s.d * T.tan(s.a1) + s.e, tp = s.d * T.tan(s.a2) + s.e, sc = 1;
          var fig = HW.fig({ pts: { G: [0, 0], E: [0, s.e], Bt: [s.d, b], Tp: [s.d, tp], Fo: [s.d, 0], Hz: [s.d, s.e] }, segs: [['Fo', 'Tp', { width: 1.6 }], ['Bt', 'Tp', { width: 5, color: '#c0563b' }], ['G', 'E'], ['E', 'Bt', { dash: 1 }], ['E', 'Tp', { dash: 1 }], ['G', 'Fo', s1(s.d) + ' m']], right: [['Hz', 'E', 'Tp']],
            angles: [['E', 'Hz', 'Tp', s.a2 + '°', { r: 34 }], ['E', 'Hz', 'Bt', s.a1 + '°', { r: 80 }]], names: false, extra: [{ type: 'text', at: [s.d * 1.13, tp], text: 'top' }, { type: 'text', at: [s.d * 1.15, b], text: 'bottom' }, { type: 'dash', from: [0, s.e], to: [s.d, s.e] }, { type: 'person', at: [0, 0], h: s.e * 1.05 }, { type: 'ground', y: 0, x0: -4, x1: s.d + 4 }], width: 320, aria: 'banner on a tower' });
          return 'A sign installer sights a tall vertical banner hanging flat against the front of a tower. Her clinometer is at her eye, ' + t(s.e.toFixed(2)) + ' m above level ground. Standing ' + t(s1(s.d)) + ' m from the foot of the tower, she measures the angle of elevation of the <b>top</b> edge of the banner as ' + t(dg(s.a2)) + ' and of the <b>bottom</b> edge as ' + t(dg(s.a1)) + '.' + figWrap(fig);
        },
        parts: [
          { id: 'e7a', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'Which side do the two right triangles share, and why is the ' + t(s.e.toFixed(2)) + ' m eye height not part of either triangle?', 'They share the horizontal ' + t(s1(s.d)) + ' m from her eye to the tower. The eye height is <b>below</b> that horizontal, so the triangles only give heights above eye level; it is added back at the end.',
              [['They share the vertical tower face; the eye height is part of the ' + t(s1(s.d)) + ' m side.', 'The pieces of the tower face are different for the two triangles. The common side is the horizontal line of sight to the tower, and the eye height is vertical, not part of it.'],
                ['They share the line of sight to the top; the eye height cancels in every answer.', 'The two lines of sight are different (they go to the top and to the bottom). The eye height cancels only in the banner height, not in each edge’s height.'],
                ['They share the ' + t(s1(s.d)) + ' m along the ground, so the eye height is one of the triangle’s sides.', 'The angles are measured at her eye, so the triangles sit on the horizontal at eye level, ' + t(s.e.toFixed(2)) + ' m above the ground.']],
              'Both right triangles have the <b>horizontal ' + t(s1(s.d)) + ' m</b> from her eye to the tower face as a leg. The ' + t(s.e.toFixed(2)) + ' m lies below that line, so trigonometry gives only the rise <b>above eye level</b>; add the eye height at the end.', ['Where are the angles measured from?'], 'shared side banner');
          } },
          { id: 'e7b', level: 'PRG', make: function (r, s) { var rise = s.d * T.tan(s.a1), h = rise + s.e;
            return near('Determine the height of the <b>bottom</b> edge of the banner above the ground, to the nearest tenth of a metre.', h, 1, 'm', [{ v: rise, code: 'trig-eye', hint: 'That is the height above her <b>eye</b>. Add the ' + t(s.e.toFixed(2)) + ' m eye height.' }].concat(sideAlts(s.d, s.a1, 'adj', 'opp').map(function (a) { return { v: a.v + s.e, code: a.code, hint: a.hint }; })),
              'In the ' + t(dg(s.a1)) + ' triangle: adj ' + t('=' + s1(s.d)) + ', opp ' + t('=') + ' rise above eye level ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\text{rise}=' + s1(s.d) + '\\tan ' + dg(s.a1) + '=' + fx(rise, 4) + '\\ldots') + ' m<br>bottom edge ' + t('=' + fx(rise, 4) + '+' + s.e.toFixed(2) + '=' + fx(h, 4) + '\\approx ' + fx(h, 1)) + ' m', ['The triangle starts at eye level.'], 'banner bottom');
          } },
          { id: 'e7c', level: 'PRG', make: function (r, s) { var rise = s.d * T.tan(s.a2), h = rise + s.e;
            return near('Determine the height of the <b>top</b> edge of the banner above the ground, to the nearest tenth of a metre.', h, 1, 'm', [{ v: rise, code: 'trig-eye', hint: 'That is the height above her <b>eye</b>. Add the ' + t(s.e.toFixed(2)) + ' m eye height.' }].concat(sideAlts(s.d, s.a2, 'adj', 'opp').map(function (a) { return { v: a.v + s.e, code: a.code, hint: a.hint }; })),
              'In the ' + t(dg(s.a2)) + ' triangle, same shared leg: ' + t('\\text{rise}=' + s1(s.d) + '\\tan ' + dg(s.a2) + '=' + fx(rise, 4) + '\\ldots') + ' m<br>top edge ' + t('=' + fx(rise, 4) + '+' + s.e.toFixed(2) + '=' + fx(h, 4) + '\\approx ' + fx(h, 1)) + ' m', ['Same method as the bottom edge, with the other angle.'], 'banner top');
          } },
          { id: 'e7d', level: 'PRG', make: function (r, s) { var r1 = s.d * T.tan(s.a1), r2 = s.d * T.tan(s.a2), x = r2 - r1;
            return near('Determine the height of the banner itself, to the nearest tenth of a metre.', x, 1, 'm', [{ v: x + s.e, code: 'trig-eye', hint: 'The eye height was added to <b>both</b> edge heights, so it cancels in the difference.' }, { v: s.d * T.tan(s.a2 - s.a1), code: 'trig-angle-diff', hint: 'Subtracting the angles doesn’t give a right-triangle angle. Subtract the two <b>heights</b> instead.' }, { v: rnd(r2 + s.e, 1) - rnd(r1 + s.e, 1), code: 'trig-early', hint: 'Subtract the unrounded heights, then round.' }],
              'Banner ' + t('=') + ' top ' + t('-') + ' bottom ' + t('=' + fx(r2, 4) + '-' + fx(r1, 4) + '=' + fx(x, 4) + '\\approx ' + fx(x, 1)) + ' m. The ' + t(s.e.toFixed(2)) + ' m was added to both heights, so it cancels: the banner’s height doesn’t depend on her eye height.', ['Subtract the two heights (or the two rises above eye level).'], 'banner height');
          } },
          { id: 'e7e', level: 'ADV', make: function (r, s) { var r2 = s.d * T.tan(s.a2), D = s.d + s.w, A = T.atan(r2 / D);
            return near('The installer steps back a further ' + t(s1(s.w)) + ' m along the same level ground and measures the angle of elevation of the top edge again. Determine that angle, to the nearest degree.', A, 0, '°', [{ v: T.atan((r2 + s.e) / D), code: 'trig-eye', hint: 'Her eye is still ' + t(s.e.toFixed(2)) + ' m up, so the vertical side is the rise above <b>eye level</b> (' + t(fx(r2, 2)) + ' m), not the full height.' }, { v: T.atan(r2 / s.w), code: 'trig-sum-diff', hint: 'She is now ' + t(s1(s.d) + '+' + s1(s.w) + '=' + s1(D)) + ' m from the tower, not ' + t(s1(s.w)) + ' m.' }].concat(angAlts(r2, D, 'tan', 0)),
              'Horizontal: ' + t(s1(s.d) + '+' + s1(s.w) + '=' + s1(D)) + ' m. The rise above eye level is unchanged: ' + t(fx(r2, 4)) + ' m.<br>' + t('\\tan\\theta=\\dfrac{' + fx(r2, 4) + '}{' + s1(D) + '}\\Rightarrow\\theta=' + fx(A, 2) + '^\\circ\\approx ' + dg(fx(A, 0))), ['The eye is at the same height, and the top edge hasn’t moved.', 'The new horizontal distance is the old one plus the step back.'], 'step back elevation');
          } }] },
      /* ---------- EP 8 ---------- */
      { num: '8',
        shared: function (r) { return gen(r, function (r) { var a1 = r.int(14, 24); return { s1: r.int(50, 90) * 10, s2: r.int(40, 80) * 10, a1: a1, a2: a1 + r.int(5, 10) }; },
          function (s) { var R = s.s1 * T.sin(s.a1) + s.s2 * T.sin(s.a2), H = s.s1 * T.cos(s.a1) + s.s2 * T.cos(s.a2), A = T.atan(R / H); return Math.round(A) !== Math.round((s.a1 + s.a2) / 2 + 1e-9) && safe(A, 0) && safe(R, 1) && safe(H, 1) && safe(Math.hypot(R, H), 1); }); },
        stem: function (s) {
          var M = [s.s1 * T.cos(s.a1), s.s1 * T.sin(s.a1)], S = [M[0] + s.s2 * T.cos(s.a2), M[1] + s.s2 * T.sin(s.a2)];
          var fig = HW.fig({ pts: { B: [0, 0], M: M, S: S, Hz: [S[0] * 1.05, M[1]], G: [S[0] * 1.05, 0] }, segs: [['B', 'M', s.s1 + ' m', { width: 3 }], ['M', 'S', s.s2 + ' m', { width: 3 }], ['B', 'G', { width: 1.4 }]], angles: [['B', 'G', 'M', s.a1 + '°', { r: 30 }], ['M', 'Hz', 'S', s.a2 + '°', { r: 34 }]], names: { B: 'B', S: 'S' },
            extra: [{ type: 'text', at: [M[0] + S[0] * 0.03, M[1] - S[0] * 0.035], text: 'M' }, { type: 'dash', from: M, to: [S[0] * 1.05, M[1]] }, { type: 'dash', from: M, to: [M[0], 0] }, { type: 'dash', from: S, to: [S[0], 0] }], width: 320, aria: 'gondola runs' });
          return 'A gondola line climbs in two straight runs. From the base station ' + t('B') + ' the cable rises to a mid-station ' + t('M') + ' along a straight span ' + t(s.s1) + ' m long, at ' + t(dg(s.a1)) + ' to the horizontal. From ' + t('M') + ' it rises to the summit ' + t('S') + ' along a span ' + t(s.s2) + ' m long, at ' + t(dg(s.a2)) + ' to the horizontal.' + figWrap(fig);
        },
        parts: [
          { id: 'e8a', level: 'EMG', make: function (r, s) {
            var r1 = s.s1 * T.sin(s.a1), h1 = s.s1 * T.cos(s.a1), r2 = s.s2 * T.sin(s.a2), h2 = s.s2 * T.cos(s.a2);
            return fieldsPart('For each run, determine the vertical rise and the horizontal advance (nearest tenth of a metre; keep full accuracy for later).', [
              nf('\\text{rise}_{BM}=', r1, 1, 'm', sideAlts(s.s1, s.a1, 'hyp', 'opp')), nf('\\text{advance}_{BM}=', h1, 1, 'm', sideAlts(s.s1, s.a1, 'hyp', 'adj')),
              nf('\\text{rise}_{MS}=', r2, 1, 'm', sideAlts(s.s2, s.a2, 'hyp', 'opp')), nf('\\text{advance}_{MS}=', h2, 1, 'm', sideAlts(s.s2, s.a2, 'hyp', 'adj'))],
              'Each span is a hypotenuse; the rise is opposite the angle and the advance is adjacent.<br>' + t('B\\to M:\\ ' + s.s1 + '\\sin ' + dg(s.a1) + '=' + fx(r1, 4) + ',\\quad ' + s.s1 + '\\cos ' + dg(s.a1) + '=' + fx(h1, 4)) + '<br>' + t('M\\to S:\\ ' + s.s2 + '\\sin ' + dg(s.a2) + '=' + fx(r2, 4) + ',\\quad ' + s.s2 + '\\cos ' + dg(s.a2) + '=' + fx(h2, 4)),
              ['Rise: opposite (SOH). Advance: adjacent (CAH).'], 'gondola components');
          } },
          { id: 'e8b', level: 'EMG', make: function (r, s) {
            var R = s.s1 * T.sin(s.a1) + s.s2 * T.sin(s.a2), H = s.s1 * T.cos(s.a1) + s.s2 * T.cos(s.a2);
            return fieldsPart('Determine the total vertical rise and the total horizontal distance from ' + t('B') + ' to ' + t('S') + ', each to the nearest tenth of a metre.', [
              nf('\\text{total rise}=', R, 1, 'm', [{ v: (s.s1 + s.s2) * T.sin((s.a1 + s.a2) / 2), code: 'trig-angle-diff', hint: 'Find the rise of each run separately (each with its own angle), then add.' }, { v: rnd(s.s1 * T.sin(s.a1), 0) + rnd(s.s2 * T.sin(s.a2), 0), code: 'trig-early', hint: 'Add the unrounded rises, then round.' }]),
              nf('\\text{total horizontal}=', H, 1, 'm', [{ v: (s.s1 + s.s2) * T.cos((s.a1 + s.a2) / 2), code: 'trig-angle-diff', hint: 'Find the advance of each run separately, then add.' }, { v: rnd(s.s1 * T.cos(s.a1), 0) + rnd(s.s2 * T.cos(s.a2), 0), code: 'trig-early', hint: 'Add the unrounded advances, then round.' }])],
              'Total rise ' + t('=' + fx(s.s1 * T.sin(s.a1), 4) + '+' + fx(s.s2 * T.sin(s.a2), 4) + '=' + fx(R, 4) + '\\approx ' + fx(R, 1)) + ' m<br>Total horizontal ' + t('=' + fx(s.s1 * T.cos(s.a1), 4) + '+' + fx(s.s2 * T.cos(s.a2), 4) + '=' + fx(H, 4) + '\\approx ' + fx(H, 1)) + ' m', ['Add the two rises; add the two advances.'], 'gondola totals');
          } },
          { id: 'e8c', level: 'PRG', make: function (r, s) {
            var R = s.s1 * T.sin(s.a1) + s.s2 * T.sin(s.a2), H = s.s1 * T.cos(s.a1) + s.s2 * T.cos(s.a2), A = T.atan(R / H), BS = Math.hypot(R, H);
            return fieldsPart('Determine the angle of elevation of ' + t('S') + ' from ' + t('B') + ' (nearest degree) and the straight-line distance ' + t('BS') + ' (nearest tenth of a metre).', [
              nf('\\theta=', A, 0, '°', [{ v: (s.a1 + s.a2) / 2, code: 'trig-angle-diff', hint: 'Not the average of the two angles: use ' + t('\\tan\\theta=\\frac{\\text{total rise}}{\\text{total horizontal}}') + '.' }].concat(angAlts(R, H, 'tan', 0))),
              nf('BS=', BS, 1, 'm', [{ v: s.s1 + s.s2, code: 'trig-sum-diff', hint: t(s.s1 + '+' + s.s2) + ' is the length of cable along the two runs. ' + t('BS') + ' is the straight line: Pythagoras on the totals.' }])],
              t('\\tan\\theta=\\dfrac{' + fx(R, 4) + '}{' + fx(H, 4) + '}\\Rightarrow\\theta=' + fx(A, 2) + '^\\circ\\approx ' + dg(fx(A, 0))) + '<br>' + t('BS=\\sqrt{' + fx(R, 4) + '^2+' + fx(H, 4) + '^2}=' + fx(BS, 4) + '\\approx ' + fx(BS, 1)) + ' m (shorter than ' + t(s.s1 + s.s2) + ' m along the cable, as it should be).', ['Use the total rise and total horizontal as the legs of one big right triangle.'], 'gondola overall');
          } },
          { id: 'e8d', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'The overall angle is not the average of ' + t(dg(s.a1)) + ' and ' + t(dg(s.a2)) + '. Why not?', 'The overall slope is total rise ' + t('\\div') + ' total advance, so each run counts by how much ground it covers. The ' + t(dg(s.a1)) + ' run is ' + (s.s1 > s.s2 ? 'longer <b>and</b> gentler' : 'gentler and covers a lot of ground') + ', so it pulls the overall angle toward ' + t(dg(s.a1)) + '.',
              [['Angles can never be averaged because they are in degrees.', 'Averaging degrees is fine in itself; the problem is that the two runs don’t count equally.'],
                ['The average would be right if the calculator were in radian mode.', 'The mode has nothing to do with it; the overall angle depends on the total rise and total advance.'],
                ['The overall angle is always the larger of the two angles.', 'It lies between the two, pulled toward the run that covers more horizontal ground.']],
              'The overall angle comes from ' + t('\\frac{\\text{total rise}}{\\text{total advance}}') + ', so each run is weighted by its horizontal advance. A plain average would be right only if the two runs advanced the same horizontal distance.', ['What does each run contribute to the total rise and the total advance?'], 'not the average');
          } }] },
      /* ---------- EP 9 ---------- */
      { num: '9',
        shared: function (r) { return gen(r, function (r) { return { P: r.int(50, 75), pq: d1(r, 15, 30), sr: d1(r, 20, 40) }; }, function (s) { var qs = s.pq * T.sin(s.P), ps = s.pq * T.cos(s.P), R = T.atan(qs / s.sr); return safe(qs, 1) && safe(ps, 1) && safe(ps + s.sr, 1) && safe(R, 0) && safe(180 - s.P - R, 0) && safe(Math.hypot(qs, s.sr), 1); }); },
        stem: function (s) {
          var qs = s.pq * T.sin(s.P), ps = s.pq * T.cos(s.P);
          var fig = HW.fig({ pts: { P: [0, 0], S: [ps, 0], R: [ps + s.sr, 0], Q: [ps, qs] }, segs: [['P', 'S'], ['S', 'R', s1(s.sr)], ['P', 'Q', s1(s.pq)], ['Q', 'R'], ['Q', 'S', { dash: 1 }]], right: [['S', 'R', 'Q']], angles: [['P', 'S', 'Q', s.P + '°']], width: 300, aria: 'triangle PQR with altitude QS' });
          return 'In ' + t('\\triangle PQR') + ' the altitude from ' + t('Q') + ' meets ' + t('PR') + ' at ' + t('S') + '. ' + t('\\angle P=' + dg(s.P)) + ', ' + t('PQ=' + s1(s.pq)) + ' cm and ' + t('SR=' + s1(s.sr)) + ' cm. Note that ' + t('\\triangle PQR') + ' itself has <b>no</b> right angle.' + figWrap(fig);
        },
        parts: [
          { id: 'e9a', level: 'BEG', make: function (r, s) {
            return mcWhy(r, 'Which right triangle must be solved first, and why?', t('\\triangle PQS') + ': it is right-angled at ' + t('S') + ' and already has two facts — ' + t('\\angle P') + ' and the hypotenuse ' + t('PQ') + '.',
              [[t('\\triangle QSR') + ': it contains the given length ' + t('SR') + '.', 'Until ' + t('QS') + ' is known, ' + t('\\triangle QSR') + ' has only one fact (' + t('SR') + ') besides its right angle — not enough.'],
                [t('\\triangle PQR') + ': it contains all the given information.', t('\\triangle PQR') + ' has no right angle, so SOH CAH TOA can’t be used on it.'],
                ['Either one — they share ' + t('QS') + ', so the order doesn’t matter.', 'They do share ' + t('QS') + ', but only ' + t('\\triangle PQS') + ' has enough information to find it.']],
              t('\\triangle PQS') + ' is right-angled at ' + t('S') + ' with ' + t('\\angle P=' + dg(s.P)) + ' and hypotenuse ' + t('PQ=' + s1(s.pq)) + ': two facts, enough to solve it. ' + t('\\triangle QSR') + ' has only ' + t('SR') + ' until ' + t('QS') + ' is known.', ['A right triangle needs two facts besides the right angle (at least one a side).'], 'which triangle first');
          } },
          { id: 'e9a2', level: 'EMG', make: function (r, s) { var qs = s.pq * T.sin(s.P), ps = s.pq * T.cos(s.P);
            return fieldsPart('Determine ' + t('QS') + ' and ' + t('PS') + ', to the nearest tenth of a centimetre.', [nf('QS=', qs, 1, 'cm', sideAlts(s.pq, s.P, 'hyp', 'opp')), nf('PS=', ps, 1, 'cm', sideAlts(s.pq, s.P, 'hyp', 'adj'))],
              'In right ' + t('\\triangle PQS') + ', relative to ' + t('\\angle P') + ': opp ' + t('=QS') + ', adj ' + t('=PS') + ', hyp ' + t('=PQ=' + s1(s.pq)) + '.<br>' + t('QS=' + s1(s.pq) + '\\sin ' + dg(s.P) + '=' + fx(qs, 4) + '\\approx ' + fx(qs, 1)) + ' cm<br>' + t('PS=' + s1(s.pq) + '\\cos ' + dg(s.P) + '=' + fx(ps, 4) + '\\approx ' + fx(ps, 1)) + ' cm', ['Relative to ' + t('\\angle P') + ', ' + t('QS') + ' is opposite and ' + t('PS') + ' is adjacent.'], 'QS and PS');
          } },
          { id: 'e9b', level: 'EMG', make: function (r, s) { var ps = s.pq * T.cos(s.P), x = ps + s.sr;
            return near('Determine ' + t('PR') + ', to the nearest tenth of a centimetre.', x, 1, 'cm', [{ v: s.sr - ps, code: 'trig-sum-diff', hint: t('S') + ' lies <b>between</b> ' + t('P') + ' and ' + t('R') + ', so ' + t('PR=PS+SR') + '.' }, { v: s.pq * T.sin(s.P) + s.sr, code: 'trig-ratio', hint: t('PS') + ' is adjacent to ' + t('\\angle P') + ': ' + t('PS=' + s1(s.pq) + '\\cos ' + dg(s.P)) + '.' }],
              t('PS=' + s1(s.pq) + '\\cos ' + dg(s.P) + '=' + fx(ps, 4)) + ', and ' + t('S') + ' is between ' + t('P') + ' and ' + t('R') + ':<br>' + t('PR=PS+SR=' + fx(ps, 4) + '+' + s1(s.sr) + '=' + fx(x, 4) + '\\approx ' + fx(x, 1)) + ' cm', ['First find ' + t('PS') + ' in ' + t('\\triangle PQS') + '.'], 'PR');
          } },
          { id: 'e9c', level: 'PRG', make: function (r, s) { var qs = s.pq * T.sin(s.P), R = T.atan(qs / s.sr);
            return near('Determine ' + t('\\angle R') + ', to the nearest degree.', R, 0, '°', angAlts(qs, s.sr, 'tan', 0, [{ v: T.atan(s.pq / s.sr), code: 'trig-wrong-side', hint: t('PQ') + ' isn’t a side of ' + t('\\triangle QSR') + '. Use ' + t('QS') + ' (found from ' + t('\\triangle PQS') + ') as the side opposite ' + t('\\angle R') + '.' }]),
              'In right ' + t('\\triangle QSR') + ', relative to ' + t('\\angle R') + ': opp ' + t('=QS=' + fx(qs, 4)) + ', adj ' + t('=SR=' + s1(s.sr)) + ' ' + t('\\Rightarrow') + ' TOA.<br>' + angWork(fx(qs, 4), s1(s.sr), 'tan', R, 0, '\\angle R'), ['You need ' + t('QS') + ' from ' + t('\\triangle PQS') + ' first.'], 'angle R');
          } },
          { id: 'e9d', level: 'PRG', make: function (r, s) { var qs = s.pq * T.sin(s.P), x = Math.hypot(qs, s.sr), R = T.atan(qs / s.sr);
            return near('Determine ' + t('QR') + ', to the nearest tenth of a centimetre.', x, 1, 'cm', [{ v: s.sr / T.cos(Math.round(R)), code: 'trig-early', hint: 'Use ' + t('\\angle R') + ' at full accuracy (or avoid the angle: Pythagoras with ' + t('QS') + ' and ' + t('SR') + ').' }, { v: Math.sqrt(Math.abs(s.sr * s.sr - qs * qs)), code: 'trig-pyth', hint: t('QR') + ' is the hypotenuse of ' + t('\\triangle QSR') + ': add the squares.' }, { v: Math.hypot(s.pq, s.sr), code: 'trig-wrong-side', hint: 'The legs of ' + t('\\triangle QSR') + ' are ' + t('QS') + ' and ' + t('SR') + ', not ' + t('PQ') + '.' }],
              '<b>Without an angle:</b> ' + t('QR=\\sqrt{' + fx(qs, 4) + '^2+' + s1(s.sr) + '^2}=' + fx(x, 4) + '\\approx ' + fx(x, 1)) + ' cm<br><b>With ' + t('\\angle R') + ':</b> ' + t('QR=\\dfrac{' + s1(s.sr) + '}{\\cos ' + fx(R, 4) + '^\\circ}=' + fx(x, 4)) + ' — the same, because ' + t('\\angle R') + ' was kept unrounded.', [t('QR') + ' is the hypotenuse of ' + t('\\triangle QSR') + '.'], 'QR');
          } },
          { id: 'e9e', level: 'PRG', make: function (r, s) { var qs = s.pq * T.sin(s.P), R = T.atan(qs / s.sr), Q = 180 - s.P - R;
            return near('Determine ' + t('\\angle PQR') + ', to the nearest degree.', Q, 0, '°', [{ v: 90 - s.P, code: 'trig-one-piece', hint: 'That is only ' + t('\\angle PQS') + '. ' + t('\\angle PQR') + ' also includes ' + t('\\angle SQR') + '.' }, { v: 90 - R, code: 'trig-one-piece', hint: 'That is only ' + t('\\angle SQR') + '. Add ' + t('\\angle PQS') + '.' }, { v: 90, code: 'trig-oblique', hint: t('\\triangle PQR') + ' has no right angle — the right angles are at ' + t('S') + '.' }, { v: 180 - s.P - Math.round(R), code: 'trig-early', hint: 'Use the unrounded ' + t('\\angle R') + ' and round at the end.' }],
              'Angle sum in ' + t('\\triangle PQR') + ': ' + t('\\angle PQR=180^\\circ-' + dg(s.P) + '-' + fx(R, 4) + '^\\circ=' + fx(Q, 4) + '^\\circ\\approx ' + dg(fx(Q, 0))) + '.<br>(Or add the pieces: ' + t('\\angle PQS=90^\\circ-' + dg(s.P) + '=' + dg(90 - s.P)) + ' and ' + t('\\angle SQR=90^\\circ-' + fx(R, 4) + '^\\circ') + '.) Check: ' + t(dg(s.P) + '+' + dg(fx(R, 0)) + '+' + dg(fx(Q, 0)) + '=180^\\circ') + '.', ['Two angles of ' + t('\\triangle PQR') + ' are now known.'], 'angle PQR');
          } }] },
      /* ---------- EP 10 ---------- */
      { num: '10',
        shared: function (r) { return gen(r, function (r) { return { H: r.int(20, 50) * 10, a: r.int(18, 35), b: r.int(40, 60) }; }, function (s) { var f = s.H / T.tan(s.a), k = s.H / T.tan(s.b); return safe(f, 1) && safe(k, 1) && safe(f + k, 1) && safe(s.H / T.sin(s.a), 1) && safe(s.H / T.sin(s.b), 1); }); },
        stem: function (s) {
          var f = s.H / T.tan(s.a), k = s.H / T.tan(s.b);
          var fig = HW.fig({ pts: { Bl: [0, s.H], G: [0, 0], F: [-f, 0], K: [k, 0], L: [-f * 0.6, s.H], Rr: [k * 0.9, s.H] }, segs: [['Bl', 'G', s.H + ' m', { dash: 1, side: -1 }], ['Bl', 'F', { dash: 1 }], ['Bl', 'K', { dash: 1 }], ['F', 'K', { width: 1.4 }]], right: [['G', 'K', 'Bl']],
            angles: [['Bl', 'L', 'F', s.a + '°', { r: 40 }], ['Bl', 'Rr', 'K', s.b + '°', { r: 30 }]], names: { Bl: 'balloon', G: 'G', F: 'F', K: 'K' }, extra: [{ type: 'dash', from: [-f * 0.6, s.H], to: [k * 0.9, s.H] }], width: 330, aria: 'balloon over two points' });
          return 'A hot-air balloon hovers ' + t(s.H) + ' m above level ground. Looking down one side of the basket, the pilot sees a landing field ' + t('F') + ' at an angle of depression of ' + t(dg(s.a)) + '; looking down the <b>opposite</b> side, she sees a road marker ' + t('K') + ' at an angle of depression of ' + t(dg(s.b)) + '. ' + t('G') + ' is the point on the ground directly below the balloon.' + figWrap(fig);
        },
        parts: [
          { id: 'e10a', level: 'BEG', make: function (r, s) {
            return mcWhy(r, 'Why does the angle of depression of ' + t('F') + ' from the balloon equal the angle of elevation of the balloon from ' + t('F') + '?', 'The horizontal at the balloon and the ground are parallel, and the line of sight crosses both: the two angles are alternate angles, so they are equal.',
              [['Because both angles are measured from the vertical.', 'Both are measured from a <b>horizontal</b> line — the one at the balloon and the ground.'],
                ['Because the triangle is isosceles.', 'Nothing here is isosceles. The reason is parallel lines cut by the line of sight.'],
                ['They are complementary, not equal.', 'The angle of depression and the angle at the <b>top</b> of the triangle are complementary. Depression and elevation are equal.']],
              'The horizontal through the balloon is parallel to the ground; the line of sight to ' + t('F') + ' is a transversal. Depression (at the balloon) and elevation (at ' + t('F') + ') are alternate interior angles, so the angle of elevation at ' + t('F') + ' is also ' + t(dg(s.a)) + '.', ['Look for parallel lines and a transversal.'], 'depression = elevation');
          } },
          { id: 'e10b', level: 'EMG', make: function (r, s) { var f = s.H / T.tan(s.a), k = s.H / T.tan(s.b);
            return fieldsPart('Determine the horizontal distances ' + t('GF') + ' and ' + t('GK') + ', each to the nearest tenth of a metre.', [nf('GF=', f, 1, 'm', sideAlts(s.H, s.a, 'opp', 'adj')), nf('GK=', k, 1, 'm', sideAlts(s.H, s.b, 'opp', 'adj'))],
              'At ' + t('F') + ' the angle of elevation is ' + t(dg(s.a)) + ': opp ' + t('=' + s.H) + ', adj ' + t('=GF') + ' ' + t('\\Rightarrow') + ' TOA: ' + t('GF=\\dfrac{' + s.H + '}{\\tan ' + dg(s.a) + '}=' + fx(f, 4) + '\\approx ' + fx(f, 1)) + ' m<br>' + t('GK=\\dfrac{' + s.H + '}{\\tan ' + dg(s.b) + '}=' + fx(k, 4) + '\\approx ' + fx(k, 1)) + ' m', ['Move each angle down to the ground point (alternate angles).', 'The ground distance is in the denominator.'], 'GF and GK');
          } },
          { id: 'e10c', level: 'PRG', make: function (r, s) { var f = s.H / T.tan(s.a), k = s.H / T.tan(s.b), x = f + k;
            return near('Determine the distance from ' + t('F') + ' to ' + t('K') + ' along the ground, to the nearest tenth of a metre.', x, 1, 'm', [{ v: f - k, code: 'trig-sum-diff', hint: t('F') + ' and ' + t('K') + ' are on <b>opposite</b> sides of ' + t('G') + ', so the distances add.' }, { v: s.H / T.tan(s.a + s.b), code: 'trig-angle-diff', hint: 'Adding the angles doesn’t make a right triangle. Find each ground distance separately and add them.' }, { v: rnd(f, 0) + rnd(k, 0), code: 'trig-early', hint: 'Add the unrounded distances, then round.' }],
              t('F') + ' and ' + t('K') + ' are on opposite sides of ' + t('G') + ', so ' + t('FK=GF+GK=' + fx(f, 4) + '+' + fx(k, 4) + '=' + fx(x, 4) + '\\approx ' + fx(x, 1)) + ' m.', ['Same side → subtract; opposite sides → add.'], 'FK');
          } },
          { id: 'e10d', level: 'EMG', make: function (r, s) { var bf = s.H / T.sin(s.a), bk = s.H / T.sin(s.b);
            return fieldsPart('Determine the straight-line distance from the balloon to ' + t('F') + ' and to ' + t('K') + ', each to the nearest tenth of a metre.', [nf('\\text{to }F=', bf, 1, 'm', sideAlts(s.H, s.a, 'opp', 'hyp')), nf('\\text{to }K=', bk, 1, 'm', sideAlts(s.H, s.b, 'opp', 'hyp'))],
              'Each sight line is a hypotenuse with ' + t(s.H) + ' m opposite the angle ' + t('\\Rightarrow') + ' SOH.<br>' + t('\\dfrac{' + s.H + '}{\\sin ' + dg(s.a) + '}=' + fx(bf, 4) + '\\approx ' + fx(bf, 1)) + ' m, ' + t('\\dfrac{' + s.H + '}{\\sin ' + dg(s.b) + '}=' + fx(bk, 4) + '\\approx ' + fx(bk, 1)) + ' m<br>Check: each is longer than its ground distance (a hypotenuse is longer than either leg).', ['The sight line is the hypotenuse; the height is opposite the angle.'], 'slant distances');
          } },
          { id: 'e10e', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'A student writes: “The two triangles share the ' + t(s.H) + ' m side, so the depression angles can be added to give one triangle with an angle of ' + t(dg(s.a + s.b)) + '.” What is true and what is false?', 'True: the two right triangles share the ' + t(s.H) + ' m vertical. False: ' + t(dg(s.a + s.b)) + ' is not an angle of any triangle here — the angle between the sight lines is ' + t('180^\\circ-' + dg(s.a) + '-' + dg(s.b) + '=' + dg(180 - s.a - s.b)) + ', in a triangle with no right angle.',
              [['Both parts are true: adding the angles is a shortcut.', 'Adding the angles gives ' + t(dg(s.a + s.b)) + ', which isn’t an angle anywhere in the diagram.'],
                ['Both parts are false: the triangles share no side.', 'They do share the vertical ' + t(s.H) + ' m from the balloon down to ' + t('G') + '.'],
                ['True: they share the side. False: the angles should be subtracted, giving ' + t(dg(s.b - s.a)) + '.', 'Subtracting doesn’t help either. Solve the two right triangles separately and add the ground distances.']],
              'The two right triangles do share the ' + t(s.H) + ' m vertical — that is what makes the problem solvable. But the horizontal rays at the balloon point in opposite directions, so the angle between the sight lines is ' + t(dg(180 - s.a - s.b)) + ', not ' + t(dg(s.a + s.b)) + ', and that triangle has no right angle.', ['Where would a ' + t(dg(s.a + s.b)) + ' angle be in the diagram?'], 'true and false');
          } }] },
      /* ---------- EP 11 ---------- */
      { num: '11', section: 'Extra practice D — Bearings and direction',
        shared: function (r) { return gen(r, function (r) { return { b1: r.int(120, 160), d1: d1(r, 1.2, 3.0), b2: r.int(50, 80), d2: d1(r, 2.0, 3.5) }; }, function (s) { var g = bearGeom(s); return g.S - g.N >= 0.25 && safe(g.E, 1) && safe(g.S - g.N, 1) && safe(g.AC, 1) && safe(g.br, 0); }); },
        stem: function (s) {
          var g = bearGeom(s), A = [0, 0], B = [g.e1, -g.s1], C = [g.E, -(g.S - g.N)], L = Math.max(s.d1, s.d2) * 0.45;
          var fig = HW.fig({ pts: { A: A, B: B, C: C, Na: [0, L], Mb: [B[0], B[1] + L] }, segs: [['A', 'Na', { width: 1.4 }], ['B', 'Mb', { width: 1.4 }], ['A', 'B', s1(s.d1) + ' km', { width: 2.6 }], ['B', 'C', s1(s.d2) + ' km', { width: 2.6 }]], names: { A: 'A', B: 'B', C: 'C', Na: 'N', Mb: 'M' }, width: 300, aria: 'two-leg bearing route' });
          return 'An orienteering runner leaves control ' + t('A') + ' and runs ' + t(s1(s.d1)) + ' km on a bearing of ' + t(dg(s.b1)) + ' to control ' + t('B') + '. From ' + t('B') + ' she runs ' + t(s1(s.d2)) + ' km on a bearing of ' + t(dg('0' + s.b2)) + ' to control ' + t('C') + '. ' + t('AN') + ' and ' + t('BM') + ' are north lines.' + figWrap(fig);
        },
        parts: [
          { id: 'e11a', level: 'EMG', make: function (r, s) { var a = 180 - s.b1;
            return mcWhy(r, 'On the first leg (bearing ' + t(dg(s.b1)) + '), which way does the runner go, and through what angle away from the north–south line?', 'South, at ' + t(dg(a)) + ' east of due south (' + t('180^\\circ-' + dg(s.b1)) + ').',
              [['South, at ' + t(dg(s.b1 - 90)) + ' east of due south.', 'That is the angle below due <b>east</b>. Measured from due south it is ' + t('180^\\circ-' + dg(s.b1) + '=' + dg(a)) + '.'],
                ['North, at ' + t(dg(s.b1)) + ' east of due north.', 'A bearing past ' + t('090^\\circ') + ' points below the east line — the runner heads <b>south</b>.'],
                ['South, at ' + t(dg(s.b1)) + ' east of due south.', t(dg(s.b1)) + ' is measured from <b>north</b>. From due south the angle is ' + t('180^\\circ-' + dg(s.b1)) + '.']],
              t(dg(s.b1)) + ' is past east (' + t('090^\\circ') + ') and short of south (' + t('180^\\circ') + '), so the leg heads south-east, ' + t('180^\\circ-' + dg(s.b1) + '=' + dg(a)) + ' east of due south.', ['Sketch a north line at ' + t('A') + ' and turn ' + t(dg(s.b1)) + ' clockwise.'], 'leg 1 direction');
          } },
          { id: 'e11a2', level: 'BEG', make: function (r, s) {
            return mcWhy(r, 'On the second leg (bearing ' + t(dg('0' + s.b2)) + '), which way does the runner go, and through what angle away from the north–south line?', 'North, at ' + t(dg(s.b2)) + ' east of due north.',
              [['North, at ' + t(dg(90 - s.b2)) + ' east of due north.', 'That is the angle above due <b>east</b>. A bearing is measured from north, so the angle from due north is ' + t(dg(s.b2)) + '.'],
                ['South, at ' + t(dg(s.b2)) + ' east of due south.', 'A bearing under ' + t('090^\\circ') + ' points above the east line — north-east.'],
                ['South, at ' + t(dg(180 - s.b2)) + ' from due south.', 'Bearings under ' + t('090^\\circ') + ' head north-east.']],
              t(dg('0' + s.b2)) + ' is short of east, so the leg heads north-east, ' + t(dg(s.b2)) + ' east of due north (measured at the north line ' + t('BM') + ').', ['Use the north line at ' + t('B') + '.'], 'leg 2 direction');
          } },
          { id: 'e11b', level: 'PRG', make: function (r, s) { var g = bearGeom(s);
            return fieldsPart('Determine how far east of ' + t('A') + ', and how far south of ' + t('A') + ', control ' + t('C') + ' is. Answer each to the nearest tenth of a kilometre.', [
              nf('\\text{east}=', g.E, 1, 'km', [{ v: s.d1 * T.cos(180 - s.b1) + s.d2 * T.cos(s.b2), code: 'trig-bearing-swap', hint: 'Measured from the north–south line, the east–west part of each leg is <b>opposite</b> the angle: use sine.' }, { v: g.e2 - g.e1, code: 'trig-sum-diff', hint: 'Both legs carry the runner <b>east</b>, so the east parts add.' }]),
              nf('\\text{south}=', g.S - g.N, 1, 'km', [{ v: g.S + g.N, code: 'trig-sum-diff', hint: 'Leg 1 goes south but leg 2 goes <b>north</b>, so subtract the north part.' }, { v: Math.abs(g.e1 - g.e2), code: 'trig-bearing-swap', hint: 'The north–south part of each leg is <b>adjacent</b> to the angle from the north–south line: use cosine.' }])],
              '<b>Leg 1</b> (' + t(dg(180 - s.b1)) + ' east of south): east ' + t('=' + s1(s.d1) + '\\sin ' + dg(180 - s.b1) + '=' + fx(g.e1, 4)) + ', south ' + t('=' + s1(s.d1) + '\\cos ' + dg(180 - s.b1) + '=' + fx(g.s1, 4)) + '<br><b>Leg 2</b> (' + t(dg(s.b2)) + ' east of north): east ' + t('=' + s1(s.d2) + '\\sin ' + dg(s.b2) + '=' + fx(g.e2, 4)) + ', north ' + t('=' + s1(s.d2) + '\\cos ' + dg(s.b2) + '=' + fx(g.n2, 4)) + '<br>East ' + t('=' + fx(g.e1, 4) + '+' + fx(g.e2, 4) + '=' + fx(g.E, 4) + '\\approx ' + fx(g.E, 1)) + ' km; south ' + t('=' + fx(g.s1, 4) + '-' + fx(g.n2, 4) + '=' + fx(g.S - g.N, 4) + '\\approx ' + fx(g.S - g.N, 1)) + ' km',
              ['Split each leg into an east part and a north/south part, then combine.', 'North and south parts partly cancel.'], 'east/south of A');
          } },
          { id: 'e11c', level: 'ADV', make: function (r, s) { var g = bearGeom(s), as = T.atan(g.E / (g.S - g.N));
            return fieldsPart('Determine the direct distance ' + t('AC') + ' (nearest tenth of a kilometre) and the three-figure bearing of ' + t('C') + ' from ' + t('A') + ' (nearest degree).', [
              nf('AC=', g.AC, 1, 'km', [{ v: s.d1 + s.d2, code: 'trig-sum-diff', hint: 'That is the distance she ran. ' + t('AC') + ' is the straight line: Pythagoras on the east and south totals.' }]),
              nf('\\text{bearing}=', g.br, 0, '°', [{ v: as, code: 'trig-bearing-angle', hint: 'That is the angle east of due <b>south</b>. The bearing is measured clockwise from north: ' + t('180^\\circ-') + ' that angle.' }, { v: 90 - as, code: 'trig-bearing-angle', hint: 'That is the angle below due east. Add it to ' + t('090^\\circ') + '.' }])],
              t('AC=\\sqrt{' + fx(g.E, 4) + '^2+' + fx(g.S - g.N, 4) + '^2}=' + fx(g.AC, 4) + '\\approx ' + fx(g.AC, 1)) + ' km<br>' + t('C') + ' is east and south of ' + t('A') + ': ' + t('\\tan(\\text{angle east of south})=\\dfrac{' + fx(g.E, 4) + '}{' + fx(g.S - g.N, 4) + '}\\Rightarrow ' + fx(as, 2) + '^\\circ') + '<br>bearing ' + t('=180^\\circ-' + fx(as, 2) + '^\\circ=' + fx(g.br, 2) + '^\\circ\\approx ' + dg(('00' + fx(g.br, 0)).slice(-3))),
              ['Use the totals from the previous part as the legs of one right triangle.', 'A point east and south of ' + t('A') + ' has a bearing between ' + t('090^\\circ') + ' and ' + t('180^\\circ') + '.'], 'AC and bearing');
          } },
          { id: 'e11d', level: 'PRG', make: function (r, s) { var g = bearGeom(s), back = rnd(g.br, 0) + 180;
            var p = fieldsPart('At ' + t('C') + ' the runner takes the straight line back to ' + t('A') + '. The bearing of ' + t('C') + ' from ' + t('A') + ' is ' + t(dg(('00' + fx(g.br, 0)).slice(-3))) + ' and ' + t('AC\\approx ' + fx(g.AC, 1)) + ' km. State the bearing she must follow and the distance.', [
              { label: '\\text{bearing}=', unit: '°', check: K.number(back, function (v) { if (v === rnd(g.br, 0)) return { code: 'trig-back-bearing', hint: 'That is the outward bearing. Going back is the opposite direction: ' + t('\\pm180^\\circ') + '.' }; if (v === 360 - rnd(g.br, 0)) return { code: 'trig-back-bearing', hint: 'A return bearing is the outward bearing ' + t('\\pm 180^\\circ') + ', not ' + t('360^\\circ') + ' minus it.' }; if (v === rnd(g.br, 0) - 180) return { code: 'trig-back-bearing', hint: 'Add ' + t('180^\\circ') + ' when the outward bearing is under ' + t('180^\\circ') + '.' }; return null; }), key: String(back) },
              nf('\\text{distance}=', g.AC, 1, 'km', [])],
              'Same straight line, travelled the other way: ' + t(dg(fx(g.br, 0)) + '+180^\\circ=' + dg(back)) + '; distance ' + t('=AC\\approx ' + fx(g.AC, 1)) + ' km.', ['Back along the same line: outward bearing ' + t('\\pm 180^\\circ') + '.'], 'return bearing');
            p.bad = [[String(rnd(g.br, 0)), fx(g.AC, 1)], [String(360 - rnd(g.br, 0)), fx(g.AC, 1)]];
            return p;
          } },
          { id: 'e11e', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'Why is a return bearing always the outward bearing plus or minus ' + t('180^\\circ') + ', and how do you choose?', 'The north lines at the two ends are parallel and the path is a transversal, so the two bearings differ by a half-turn. Add ' + t('180^\\circ') + ' if the outward bearing is under ' + t('180^\\circ') + '; subtract if it is ' + t('180^\\circ') + ' or more.',
              [['Because the return trip is the same length; always add ' + t('180^\\circ') + '.', 'Length has nothing to do with it, and adding to a bearing of ' + t('180^\\circ') + ' or more would go past ' + t('360^\\circ') + ' — subtract instead.'],
                ['Because a bearing is measured anticlockwise on the way back.', 'Bearings are always clockwise from north. The ' + t('180^\\circ') + ' comes from the parallel north lines.'],
                ['Because the return bearing is ' + t('360^\\circ') + ' minus the outward bearing.', 'That reflects the direction across the north line; it doesn’t reverse it. Reversing a direction is a half-turn, ' + t('180^\\circ') + '.']],
              'The north lines at the start and finish are parallel; the straight path is a transversal. The outward and return bearings are measured from those parallel lines on opposite sides, so they differ by exactly ' + t('180^\\circ') + '. Add ' + t('180^\\circ') + ' to a bearing under ' + t('180^\\circ') + '; subtract from one of ' + t('180^\\circ') + ' or more, to stay in ' + t('000^\\circ') + '–' + t('359^\\circ') + '.', ['Draw the north line at both ends.'], 'why ±180');
          } }] },
      /* ---------- EP 12 ---------- */
      { num: '12',
        shared: function (r) { return gen(r, function (r) { return { b: r.int(100, 160), g: d1(r, 3.0, 6.5), h: d1(r, 0.5, 1.5) }; }, function (s) { var a = 180 - s.b; return safe(s.g * T.sin(a), 1) && safe(s.g * T.cos(a), 1) && safe(T.atan(s.h / s.g), 0) && safe(Math.hypot(s.g, s.h), 1); }); },
        stem: function (s) { return 'A light aircraft leaves airfield ' + t('A') + ' and climbs in a straight line on a bearing of ' + t(dg(s.b)) + '. When the point ' + t('G') + ' on the ground directly beneath it is ' + t(s1(s.g)) + ' km from ' + t('A') + ', the aircraft ' + t('P') + ' is ' + t(s1(s.h)) + ' km above the ground.'; },
        parts: [
          { id: 'e12a', level: 'PRG', make: function (r, s) { var a = 180 - s.b, e = s.g * T.sin(a), so = s.g * T.cos(a);
            var fig = HW.fig({ pts: { A: [0, 0], G: [e, -so], E: [e, 0], Nn: [0, s.g * 0.4] }, segs: [['A', 'Nn', { width: 1.4 }], ['A', 'G', s1(s.g) + ' km', { width: 2.6 }], ['A', 'E', { dash: 1 }], ['E', 'G', { dash: 1 }]], right: [['E', 'A', 'G']], angles: [['A', 'Nn', 'G', s.b + '°', { r: 24 }]], names: { A: 'A', G: 'G', E: 'E', Nn: 'N' }, width: 240, aria: 'plan view' });
            return fieldsPart('Plan view (from overhead):' + figWrap(fig) + 'Determine how far east of ' + t('A') + ' and how far south of ' + t('A') + ' the point ' + t('G') + ' is, each to the nearest tenth of a kilometre.', [
              nf('\\text{east}=', e, 1, 'km', [{ v: so, code: 'trig-bearing-swap', hint: 'Measured from due south (' + t('180^\\circ-' + dg(s.b) + '=' + dg(a)) + '), the east part is <b>opposite</b> that angle: sine.' }, { v: s.g * T.sin(s.b - 90), code: 'trig-bearing-swap', hint: 'From the east line the angle is ' + t(dg(s.b - 90)) + ', and the east part is <b>adjacent</b> to it — or use ' + t(dg(a)) + ' from due south with sine.' }]),
              nf('\\text{south}=', so, 1, 'km', [{ v: e, code: 'trig-bearing-swap', hint: 'The south part is <b>adjacent</b> to the angle from due south: cosine.' }])],
              'Bearing ' + t(dg(s.b)) + ' is ' + t('180^\\circ-' + dg(s.b) + '=' + dg(a)) + ' east of due south. In right ' + t('\\triangle AEG') + ':<br>east ' + t('=' + s1(s.g) + '\\sin ' + dg(a) + '=' + fx(e, 4) + '\\approx ' + fx(e, 1)) + ' km, south ' + t('=' + s1(s.g) + '\\cos ' + dg(a) + '=' + fx(so, 4) + '\\approx ' + fx(so, 1)) + ' km<br>Check: ' + t('\\sqrt{' + fx(e, 4) + '^2+' + fx(so, 4) + '^2}=' + s1(s.g)) + ' ✓', ['Find the angle between the track and due south first.'], 'east/south of A plane');
          } },
          { id: 'e12b', level: 'EMG', make: function (r, s) { var A = T.atan(s.h / s.g);
            var fig = HW.fig({ pts: { A: [0, 0], G: [s.g, 0], P: [s.g, s.h] }, segs: [['A', 'G', s1(s.g) + ' km'], ['G', 'P', s1(s.h) + ' km', { dash: 1 }], ['A', 'P', { width: 2.6 }]], right: [['G', 'A', 'P']], width: 280, aria: 'vertical section' });
            return near('Vertical section (side view):' + figWrap(fig) + 'Determine the aircraft’s angle of climb, ' + t('\\angle PAG') + ', to the nearest degree.', A, 0, '°', angAlts(s.h, s.g, 'tan', 0, [{ v: T.asin(s.h / s.g), code: 'trig-ratio', hint: t(s1(s.g)) + ' km is the ground distance ' + t('AG') + ' — a leg, not the flight path. Opposite and adjacent: TOA.' }]),
              'Work in ' + t('\\triangle AGP') + ', right-angled at ' + t('G') + ' because ' + t('GP') + ' is vertical and ' + t('AG') + ' is horizontal. opp ' + t('=' + s1(s.h)) + ', adj ' + t('=' + s1(s.g)) + ' ' + t('\\Rightarrow') + ' TOA.<br>' + angWork(s1(s.h), s1(s.g), 'tan', A, 0, '\\angle PAG'), ['Which triangle contains both the height and the ground distance?'], 'angle of climb');
          } },
          { id: 'e12c', level: 'BEG', make: function (r, s) { var x = Math.hypot(s.g, s.h);
            return near('Determine the straight-line distance ' + t('AP') + ' from the airfield to the aircraft, to the nearest tenth of a kilometre.', x, 1, 'km', [{ v: s.g + s.h, code: 'trig-pyth', hint: 'Lengths don’t add — ' + t('AP') + ' is the hypotenuse of ' + t('\\triangle AGP') + '.' }, { v: Math.sqrt(s.g * s.g - s.h * s.h), code: 'trig-pyth', hint: t('AP') + ' is the hypotenuse: <b>add</b> the squares.' }],
              t('AP=\\sqrt{' + s1(s.g) + '^2+' + s1(s.h) + '^2}=' + fx(x, 4) + '\\approx ' + fx(x, 1)) + ' km — just longer than ' + t('AG') + ', as a shallow climb should give.', ['Pythagoras in ' + t('\\triangle AGP') + '.'], 'AP');
          } },
          { id: 'e12d', level: 'BEG', make: function (r, s) { var back = s.b + 180;
            var p = P.number('The pilot turns and flies straight back to ' + t('A') + '. State the three-figure bearing she must follow.', back, function (v) { if (v === s.b) return { code: 'trig-back-bearing', hint: 'That is the outward bearing. The return is the opposite direction: ' + t('\\pm 180^\\circ') + '.' }; if (v === 360 - s.b) return { code: 'trig-back-bearing', hint: 'Reverse the direction with a half-turn, ' + t('\\pm 180^\\circ') + ' — not ' + t('360^\\circ-') + ' the bearing.' }; if (v === 180 - s.b) return { code: 'trig-bearing-angle', hint: 'That is the angle from due south. The bearing of ' + t('A') + ' from the aircraft is the outward bearing ' + t('+180^\\circ') + '.' }; return null; },
              t(dg(s.b) + '<180^\\circ') + ', so add a half-turn: ' + t(dg(s.b) + '+180^\\circ=' + dg(back)) + '.', ['Return bearing = outward bearing ' + t('\\pm180^\\circ') + '.'], 'return bearing plane', { after: '°' });
            p.bad = [String(s.b), String(360 - s.b)];
            return p;
          } },
          { id: 'e12d2', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'Why does the aircraft’s height above the ground play no part in the return bearing?', 'A bearing is a purely <b>horizontal</b> direction, measured in the plan view: climbing changes how high the aircraft is, not which way its ground track points.',
              [['Because ' + t(s1(s.h)) + ' km is too small to matter.', 'Even a large height wouldn’t change the bearing: bearings are measured on the ground plane.'],
                ['Because the height cancels when you add ' + t('180^\\circ') + '.', 'The height never enters the bearing at all — nothing to cancel.'],
                ['It does: the bearing back should be adjusted by the angle of climb.', 'The angle of climb is in the vertical section. The bearing lives in the plan view, where the return track is the same line as ' + t('AG') + '.']],
              'Bearings are measured in the plan view, clockwise from north. The return track is the line ' + t('GA') + ' — the same line as the outward track, travelled the other way — so the height is irrelevant.', ['Which view — plan or vertical section — shows bearings?'], 'height irrelevant');
          } }] },
      /* ---------- EP 13 ---------- */
      { num: '13', section: 'Extra practice E — Reasoning and error analysis', stem: 'Decide whether each claim is <b>true</b> or <b>false</b>.', parts: [
        { id: 'e13a', level: 'LIM', make: function (r) { return tfv(r, [
          { s: 'The hypotenuse is always the vertical side of the triangle.', truth: false, why: 'The hypotenuse is the side <b>opposite the right angle</b>. Turn the triangle and a leg becomes the vertical side.', sol: '<b>False.</b> The hypotenuse is defined as the side opposite the right angle (the longest side) — the page has nothing to do with it. Counterexample: a right triangle with its right angle at the bottom-left has a slanted hypotenuse and a vertical leg.' },
          { s: 'The hypotenuse is always the side across from the right angle, however the triangle is turned.', truth: true, why: 'That is exactly the definition of the hypotenuse — it doesn’t depend on how the triangle sits on the page.', sol: '<b>True.</b> The hypotenuse is defined by the right angle (it is also the longest side). Rotating the triangle changes which side looks vertical, but no side names change.' }], 'claim hypotenuse'); } },
        { id: 'e13b', level: 'BEG', make: function (r) { return tfv(r, [
          { s: t('\\sin^{-1}') + ' is just another way of writing ' + t('\\dfrac{1}{\\sin}') + '.', truth: false, why: t('\\sin^{-1}') + ' is the <b>inverse</b>: it takes a ratio and gives back an angle. ' + t('\\sin^{-1}(0.5)=30^\\circ') + ' but ' + t('\\frac{1}{\\sin 30^\\circ}=2') + '.', sol: '<b>False.</b> The “' + t('-1') + '” is not an exponent. ' + t('\\sin^{-1}(0.5)=30^\\circ') + ' (an angle), while ' + t('\\frac{1}{\\sin 30^\\circ}=\\frac{1}{0.5}=2') + ' (a plain number).' },
          { s: t('\\sin^{-1}') + ' takes a ratio and gives back the angle that has that sine.', truth: true, why: 'That is what the inverse key does: ' + t('\\sin^{-1}(0.5)=30^\\circ') + '.', sol: '<b>True.</b> ' + t('\\sin^{-1}') + ' undoes ' + t('\\sin') + ': ' + t('\\sin 30^\\circ=0.5') + ', so ' + t('\\sin^{-1}(0.5)=30^\\circ') + '. It is not ' + t('\\frac{1}{\\sin}') + '.' }], 'claim sin^-1'); } },
        { id: 'e13c', level: 'BEG', make: function (r) { return tfv(r, [
          { s: 'Sine, cosine and tangent (SOH CAH TOA) can be used directly on any triangle.', truth: false, why: 'SOH CAH TOA needs a <b>right angle</b> — without one there is no hypotenuse.', sol: '<b>False.</b> The ratios are defined in a right triangle. Counterexample: in a triangle with ' + t('\\angle A=40^\\circ') + ', ' + t('AB=20') + ', ' + t('AC=30') + ' (no right angle), ' + t('20\\tan 40^\\circ\\approx 16.8') + ' but ' + t('BC\\approx 19.5') + '. Split the figure into right triangles first.' },
          { s: 'To use SOH CAH TOA on a triangle with no right angle, you first split it into right triangles (for example with an altitude).', truth: true, why: 'Right — the ratios need a right angle, so you create one.', sol: '<b>True.</b> SOH CAH TOA needs a right angle. Dropping an altitude creates two right triangles you can solve.' }], 'claim any triangle'); } },
        { id: 'e13d', level: 'EMG', make: function (r) { return tfv(r, [
          { s: 'Rounding at each step is fine as long as one decimal place is kept.', truth: false, why: 'Rounded values drift, and the drift is magnified when they are multiplied or fed into an inverse ratio.', sol: '<b>False.</b> Example: a tower ' + t('h=12.5\\tan 68^\\circ=30.9386\\ldots') + ' m; with ' + t('h=30.9') + ' the angle from ' + t('52.5') + ' m away comes out ' + t('30^\\circ') + ' instead of ' + t('31^\\circ') + '. Carry full accuracy; round once, at the end.' },
          { s: 'Keeping full calculator accuracy and rounding only at the end can change the final answer compared with rounding at each step.', truth: true, why: 'It can: rounding early creates small errors that can push an answer across a rounding boundary.', sol: '<b>True.</b> Example: ' + t('\\tan^{-1}\\!\\left(\\frac{30.9386}{52.5}\\right)=30.51^\\circ\\to 31^\\circ') + ' but ' + t('\\tan^{-1}\\!\\left(\\frac{30.9}{52.5}\\right)=30.48^\\circ\\to 30^\\circ') + '.' }], 'claim rounding'); } },
        { id: 'e13e', level: 'EMG', make: function (r) { return tfv(r, [
          { s: 'If every side of a right triangle is doubled, every angle is doubled too.', truth: false, why: 'Doubling every side gives a <b>similar</b> triangle: every ratio — and so every angle — stays the same. (Doubled angles would add to ' + t('360^\\circ') + '.)', sol: '<b>False.</b> Legs ' + t('6.0') + ' and ' + t('1.1') + ' give ' + t('\\tan A=\\frac{1.1}{6.0}') + '; legs ' + t('12.0') + ' and ' + t('2.2') + ' give ' + t('\\frac{2.2}{12.0}=\\frac{1.1}{6.0}') + ' — the same ratio, the same angle.' },
          { s: 'If every side of a right triangle is doubled, every angle stays the same.', truth: true, why: 'Right — the factors of ' + t('2') + ' cancel in every ratio, so every angle is unchanged.', sol: '<b>True.</b> The new triangle is similar: ' + t('\\frac{2a}{2b}=\\frac{a}{b}') + ' for every pair of sides, so every ratio and every angle is the same.' }], 'claim doubling'); } },
        { id: 'e13f', level: 'EMG', make: function (r) { return tfv(r, [
          { s: 'In a big enough right triangle, ' + t('\\sin A') + ' can come out greater than ' + t('1') + '.', truth: false, why: t('\\sin A=\\frac{\\text{opp}}{\\text{hyp}}') + ' and the hypotenuse is always the longest side, so the fraction is always less than ' + t('1') + ' — size makes no difference.', sol: '<b>False.</b> Enlarging the triangle multiplies the opposite side and the hypotenuse by the same factor, so ' + t('\\sin A') + ' doesn’t change; and the hypotenuse is always longer than the opposite side.' },
          { s: 'For any acute angle ' + t('A') + ', ' + t('\\sin A') + ' is less than ' + t('1') + ', however big the triangle is.', truth: true, why: 'Right — the hypotenuse is always longer than the opposite side, in a triangle of any size.', sol: '<b>True.</b> ' + t('\\sin A=\\frac{\\text{opp}}{\\text{hyp}}') + ' with the hypotenuse the longest side, so the fraction is less than ' + t('1') + '. Scaling the triangle doesn’t change the ratio.' }], 'claim sin > 1'); } }] },
      /* ---------- EP 14 ---------- */
      { num: '14',
        shared: function (r) { return gen(r, function (r) { return { b: r.int(190, 260), d: d1(r, 3.0, 9.0) }; }, function (s) { var a = s.b - 180; return a !== 45 && safe(s.d * T.cos(a), 1) && safe(s.d * T.sin(a), 1); }); },
        stem: function (s) { return 'A hiker is told: “From the lodge ' + t('L') + ', the lookout ' + t('K') + ' lies on a bearing of ' + t(dg(s.b)) + ', a distance of ' + t(s1(s.d)) + ' km.” On reaching ' + t('K') + ' she writes: “Bearing of ' + t('L') + ' from ' + t('K') + ' ' + t('=' + dg(s.b)) + ', because it is the same straight line.”'; },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, s) { var c = s.b - 180;
            var p = P.number('Her note is wrong. Give the correct three-figure bearing of ' + t('L') + ' from ' + t('K') + '.', c, function (v) { if (v === s.b) return { code: 'trig-back-bearing', hint: 'That is her (wrong) answer: a bearing describes a direction of travel, and ' + t('K\\to L') + ' is the opposite direction to ' + t('L\\to K') + '.' }; if (v === s.b + 180) return { code: 'trig-back-bearing', hint: 'Bearings stay between ' + t('000^\\circ') + ' and ' + t('359^\\circ') + ': since ' + t(dg(s.b) + '\\ge 180^\\circ') + ', subtract ' + t('180^\\circ') + '.' }; if (v === 360 - s.b) return { code: 'trig-back-bearing', hint: 'Reversing a direction is a half-turn: ' + t('\\pm 180^\\circ') + ', not ' + t('360^\\circ-') + ' the bearing.' }; return null; },
              'A bearing is measured clockwise from north <b>at the point where you stand</b>; going from ' + t('K') + ' to ' + t('L') + ' is the opposite direction. ' + t(dg(s.b) + '\\ge 180^\\circ') + ', so subtract: ' + t(dg(s.b) + '-180^\\circ=' + dg(('00' + c).slice(-3))) + '.', ['The return direction is a half-turn away.'], 'back bearing ' + s.b, { after: '°' });
            p.bad = [String(s.b), String(s.b + 180), String(360 - s.b)];
            p.answer = t(dg(('00' + c).slice(-3)));
            return p;
          } },
          { id: 'e14b', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'Which rule gives the bearing of ' + t('X') + ' from ' + t('Y') + ', if the bearing of ' + t('Y') + ' from ' + t('X') + ' is ' + t('B') + '?', t('B+180^\\circ') + ' when ' + t('B<180^\\circ') + ', and ' + t('B-180^\\circ') + ' when ' + t('B\\ge 180^\\circ') + '.',
              [[t('B+180^\\circ') + ' always.', 'For ' + t('B\\ge 180^\\circ') + ' that goes past ' + t('360^\\circ') + ' (e.g. ' + t(dg(s.b + 180)) + '). Subtract instead.'],
                [t('360^\\circ-B') + ' always.', 'That reflects the direction across the north–south line; reversing a direction is a half-turn.'],
                [t('B') + ' itself — it is the same line.', 'A bearing names a direction of travel, not a line; one line carries two bearings, ' + t('180^\\circ') + ' apart.']],
              'One rule — turn through a half-turn — written in two cases to stay within ' + t('000^\\circ') + '–' + t('359^\\circ') + ': ' + t('B+180^\\circ') + ' if ' + t('B<180^\\circ') + ', ' + t('B-180^\\circ') + ' if ' + t('B\\ge 180^\\circ') + '. Here ' + t(dg(s.b) + '\\ge 180^\\circ') + ', so subtract.', ['Try it on ' + t('090^\\circ') + ' (due east): the way back is due west, ' + t('270^\\circ') + '.'], 'back bearing rule');
          } },
          { id: 'e14c', level: 'PRG', make: function (r, s) { var a = s.b - 180, so = s.d * T.cos(a), w = s.d * T.sin(a);
            return fieldsPart('Determine how far south of ' + t('L') + ' and how far west of ' + t('L') + ' the lookout is, each to the nearest tenth of a kilometre.', [
              nf('\\text{south}=', so, 1, 'km', [{ v: w, code: 'trig-bearing-swap', hint: 'The angle from due south is ' + t(dg(s.b) + '-180^\\circ=' + dg(a)) + '; the south part is <b>adjacent</b> to it: cosine.' }, { v: s.d * Math.abs(T.cos(s.b)), code: 'trig-bearing-angle', hint: 'Use the angle inside the triangle, measured from due south: ' + t(dg(a)) + '.' }]),
              nf('\\text{west}=', w, 1, 'km', [{ v: so, code: 'trig-bearing-swap', hint: 'The west part is <b>opposite</b> the ' + t(dg(a)) + ' angle from due south: sine.' }, { v: s.d * Math.abs(T.sin(s.b)), code: 'trig-bearing-angle', hint: 'Use the angle inside the triangle, measured from due south: ' + t(dg(a)) + '.' }])],
              t(dg(s.b)) + ' is ' + t(dg(s.b) + '-180^\\circ=' + dg(a)) + ' past due south, on the west side.<br>south ' + t('=' + s1(s.d) + '\\cos ' + dg(a) + '=' + fx(so, 4) + '\\approx ' + fx(so, 1)) + ' km, west ' + t('=' + s1(s.d) + '\\sin ' + dg(a) + '=' + fx(w, 4) + '\\approx ' + fx(w, 1)) + ' km', ['Find the angle between the path and due south first.'], 'south/west of L');
          } },
          { id: 'e14d', level: 'EMG', make: function (r, s) { var c = ('00' + (s.b - 180)).slice(-3);
            return mcWhy(r, 'A classmate says “' + t(dg(c)) + ' and ' + t(dg(s.b)) + ' describe the same direction of travel.” Which response is right?', 'False: they point in <b>opposite</b> directions. What they share is the straight line ' + t('LK') + ' — the two bearings are ' + t('180^\\circ') + ' apart.',
              [['True: both describe travel along the line ' + t('LK') + '.', 'Same line, but opposite directions along it: ' + t(dg(c)) + ' heads north-east, ' + t(dg(s.b)) + ' heads south-west.'],
                ['False: they have nothing in common.', 'They describe the same line, travelled opposite ways — exactly ' + t('180^\\circ') + ' apart.'],
                ['True, because both are measured clockwise from north.', 'Every bearing is measured that way. These two still point opposite ways.']],
              t(dg(c)) + ' heads north-east and ' + t(dg(s.b)) + ' heads south-west. They share the line ' + t('LK') + ' and differ by exactly ' + t('180^\\circ') + ' — which is what makes one the reverse of the other.', ['Sketch both directions from one point.'], 'same direction?');
          } }] },
      /* ---------- EP 15 ---------- */
      { num: '15',
        shared: function (r) { return gen(r, function (r) { var A = r.int(30, 55), ab = d1(r, 15, 25); return { A: A, ab: ab, ac: d1(r, ab * 1.2, ab * 1.8) }; }, function (s) { var g = obl(s); return g.dc > 3 && g.bc - g.wrong >= 1 && safe(g.bc, 1) && safe(g.C, 0) && safe(g.B, 0) && safe(g.bd, 1) && safe(g.ad, 1) && safe(g.dc, 1) && safe(g.bc - g.wrong, 1); }); },
        stem: function (s) {
          var g = obl(s), fig = HW.fig({ pts: { A: [0, 0], C: [s.ac, 0], B: [g.ad, g.bd] }, segs: [['A', 'B', s1(s.ab)], ['A', 'C', s1(s.ac)], ['B', 'C']], angles: [['A', 'C', 'B', s.A + '°', { r: 28 }]], width: 300, aria: 'triangle ABC' });
          return 'In ' + t('\\triangle ABC') + ', ' + t('\\angle A=' + dg(s.A)) + ', ' + t('AB=' + s1(s.ab)) + ' and ' + t('AC=' + s1(s.ac)) + '. There is <b>no</b> right angle. Asked for ' + t('BC') + ', a student wrote ' + t('\\tan ' + dg(s.A) + '=\\dfrac{BC}{AB}\\Rightarrow BC=' + s1(s.ab) + '\\tan ' + dg(s.A) + '=' + fx(g.wrong, 1)) + '.' + figWrap(fig);
        },
        parts: [
          { id: 'e15a', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'What is the student’s error?', 'SOH CAH TOA was used on a triangle with <b>no right angle</b> — the ratios need a ' + t('90^\\circ') + ' angle, so ' + t('\\frac{BC}{AB}') + ' isn’t the tangent of anything here.',
              [['The student used tangent instead of sine.', 'No ratio works directly here: with no right angle there is no hypotenuse, and “opposite/adjacent” mean nothing.'],
                ['The student should have divided: ' + t('BC=\\frac{' + s1(s.ab) + '}{\\tan ' + dg(s.A) + '}') + '.', 'Rearranging doesn’t help — the equation itself is false, because the triangle has no right angle.'],
                ['The student should have used ' + t('AC') + ' instead of ' + t('AB') + '.', 'Any SOH CAH TOA equation on this triangle is invalid. Split it into right triangles first.']],
              'The student applied a trigonometric ratio to a triangle with no right angle. SOH CAH TOA requires a ' + t('90^\\circ') + ' angle: only then is one side the hypotenuse and do “opposite” and “adjacent” make sense.', ['What does SOH CAH TOA need that this triangle doesn’t have?'], 'oblique error');
          } },
          { id: 'e15b', level: 'PRG', make: function (r, s) { var g = obl(s);
            return fieldsPart('Repair the method: drop the altitude from ' + t('B') + ' to ' + t('AC') + ', meeting it at ' + t('D') + '. Determine ' + t('BD') + ', ' + t('AD') + ' and ' + t('DC') + ' (nearest tenth).', [
              nf('BD=', g.bd, 1, '', sideAlts(s.ab, s.A, 'hyp', 'opp')), nf('AD=', g.ad, 1, '', sideAlts(s.ab, s.A, 'hyp', 'adj')),
              nf('DC=', g.dc, 1, '', [{ v: s.ac + g.ad, code: 'trig-sum-diff', hint: t('D') + ' lies between ' + t('A') + ' and ' + t('C') + ', so ' + t('DC=AC-AD') + '.' }, { v: s.ac - g.bd, code: 'trig-wrong-side', hint: t('DC=AC-AD') + ' — subtract the piece of ' + t('AC') + ' next to ' + t('A') + ', which is ' + t('AD') + ', not the height.' }])],
              'In right ' + t('\\triangle ABD') + ', relative to ' + t('\\angle A') + ', ' + t('AB=' + s1(s.ab)) + ' is the hypotenuse:<br>' + t('BD=' + s1(s.ab) + '\\sin ' + dg(s.A) + '=' + fx(g.bd, 4) + ',\\quad AD=' + s1(s.ab) + '\\cos ' + dg(s.A) + '=' + fx(g.ad, 4)) + '<br>' + t('DC=AC-AD=' + s1(s.ac) + '-' + fx(g.ad, 4) + '=' + fx(g.dc, 4)), ['In ' + t('\\triangle ABD') + ', ' + t('AB') + ' is the hypotenuse.'], 'BD AD DC');
          } },
          { id: 'e15c', level: 'PRG', make: function (r, s) { var g = obl(s), diff = g.bc - g.wrong;
            return fieldsPart('Determine ' + t('BC') + ' to the nearest tenth, and how far out the student’s ' + t(fx(g.wrong, 1)) + ' was.', [
              nf('BC=', g.bc, 1, '', [{ v: Math.sqrt(Math.abs(g.dc * g.dc - g.bd * g.bd)), code: 'trig-pyth', hint: t('BC') + ' is the hypotenuse of right ' + t('\\triangle BDC') + ': add the squares of ' + t('BD') + ' and ' + t('DC') + '.' }, { v: Math.hypot(g.bd, s.ac), code: 'trig-wrong-side', hint: 'The legs of ' + t('\\triangle BDC') + ' are ' + t('BD') + ' and ' + t('DC') + ' (not all of ' + t('AC') + ').' }]),
              nf('\\text{too small by}', diff, 1, '', [{ v: g.bc + g.wrong, code: 'trig-sum-diff', hint: 'Subtract the student’s value from the correct one.' }])],
              'In right ' + t('\\triangle BDC') + ': ' + t('BC=\\sqrt{' + fx(g.bd, 4) + '^2+' + fx(g.dc, 4) + '^2}=' + fx(g.bc, 4) + '\\approx ' + fx(g.bc, 1)) + '.<br>The student’s value is ' + t(fx(g.bc, 4) + '-' + fx(g.wrong, 4) + '=' + fx(diff, 4) + '\\approx ' + fx(diff, 1)) + ' too small.', ['Pythagoras in ' + t('\\triangle BDC') + '.'], 'BC repaired');
          } },
          { id: 'e15d', level: 'ADV', make: function (r, s) { var g = obl(s);
            return fieldsPart('Determine ' + t('\\angle C') + ' and ' + t('\\angle B') + ', each to the nearest degree.', [
              nf('\\angle C=', g.C, 0, '°', angAlts(g.bd, g.dc, 'tan', 0)),
              nf('\\angle B=', g.B, 0, '°', [{ v: 90 - g.C, code: 'trig-one-piece', hint: 'That is only ' + t('\\angle DBC') + '. ' + t('\\angle ABC') + ' is the whole angle at ' + t('B') + ': use the angle sum of ' + t('\\triangle ABC') + '.' }, { v: 90 - s.A, code: 'trig-one-piece', hint: 'That is only ' + t('\\angle ABD') + '. Use the angle sum: ' + t('180^\\circ-\\angle A-\\angle C') + '.' }, { v: 90 - s.A + 90 - s.A, code: 'trig-oblique', hint: 'Use ' + t('\\angle B=180^\\circ-\\angle A-\\angle C') + '.' }])],
              'In right ' + t('\\triangle BDC') + ', relative to ' + t('\\angle C') + ': opp ' + t('=BD=' + fx(g.bd, 4)) + ', adj ' + t('=DC=' + fx(g.dc, 4)) + ':<br>' + angWork(fx(g.bd, 4), fx(g.dc, 4), 'tan', g.C, 0, '\\angle C') + '<br>' + t('\\angle B=180^\\circ-' + dg(s.A) + '-' + fx(g.C, 2) + '^\\circ=' + fx(g.B, 2) + '^\\circ\\approx ' + dg(fx(g.B, 0))) + '. Check: ' + t(dg(s.A) + '+' + dg(fx(g.C, 0)) + '+' + dg(fx(g.B, 0)) + '=180^\\circ') + '.', ['Use ' + t('\\triangle BDC') + ' for ' + t('\\angle C') + ', then the angle sum.'], 'angles C and B');
          } },
          { id: 'e15e', level: 'EMG', make: function (r, s) { var g = obl(s), pc = Math.round(100 * (g.bc - g.wrong) / g.bc);
            return mcWhy(r, 'The student’s answer was “only” ' + t(fx(g.bc - g.wrong, 1)) + ' too small. Why is that not a small error here?', 'Compared with the length it was meant to be (' + t(fx(g.bc, 1)) + '), it is about ' + t(pc + '\\%') + ' off — a whole wrong piece of material, not a rounding slip.',
              [['It is a small error: anything under ' + t('5') + ' units is a rounding error.', 'Rounding errors here would be in the tenths. And an error only means something next to the size of the quantity.'],
                ['It is not small because any wrong answer gets zero.', 'The point is the <b>size</b> of the error compared with the answer: about ' + t(pc + '\\%') + '.'],
                ['It is not small because ' + t(fx(g.bc - g.wrong, 1)) + ' is bigger than ' + t('\\angle A') + ' in radians.', 'Radians have nothing to do with it. Compare the error with ' + t('BC') + ' itself.']],
              t('\\dfrac{' + fx(g.bc - g.wrong, 1) + '}{' + fx(g.bc, 1) + '}\\approx ' + fx((g.bc - g.wrong) / g.bc, 2)) + ', about ' + t(pc + '\\%') + '. The same error on a length of ' + t('2000') + ' would be negligible; on ' + t(fx(g.bc, 1)) + ' it is not. <b>The size of an error only means something next to the size of the quantity.</b>', ['Compare the error with the correct ' + t('BC') + '.'], 'relative error');
          } }] },
      /* ---------- EP 16 ---------- */
      { num: '16',
        shared: function (r) { var c = r.pick(EP16); return { x: c[0], a: c[1], w: c[2] }; },
        stem: function (s) {
          var h = s.x * T.tan(s.a), D = s.x + s.w, her = T.atan(rnd(h, 1) / D), cor = T.atan(h / D);
          var fig = HW.fig({ pts: { Bs: [0, 0], Tp: [0, h], X: [s.x, 0], Y: [D, 0] }, segs: [['Bs', 'Tp', 'h', { width: 2.6 }], ['Tp', 'X', { dash: 1 }], ['Tp', 'Y', { dash: 1 }], ['Bs', 'X', s1(s.x) + ' m'], ['X', 'Y', s1(s.w) + ' m']], right: [['Bs', 'X', 'Tp']], angles: [['X', 'Bs', 'Tp', s.a + '°', { r: 20 }], ['Y', 'Bs', 'Tp', 'θ', { r: 40 }]], names: false, extra: [{ type: 'text', at: [s.x + D * 0.035, h * 0.07], text: 'X' }, { type: 'text', at: [D * 1.04, h * 0.07], text: 'Y' }, { type: 'ground', y: 0, x0: -D * 0.04, x1: D * 1.06 }], width: 320, aria: 'tower sighted from two points' });
          return 'A surveyor stands at ' + t('X') + ', ' + t(s1(s.x)) + ' m from the foot of a vertical tower, and measures the angle of elevation of the top as ' + t(dg(s.a)) + '. She then walks ' + t(s1(s.w)) + ' m directly away from the tower to ' + t('Y') + '. Her work reads ' + t('h=' + s1(s.x) + '\\tan ' + dg(s.a) + '=' + fx(h, 1) + '\\text{ m},\\ \\theta=\\tan^{-1}\\!\\left(\\frac{' + fx(h, 1) + '}{' + s1(D) + '}\\right)=' + dg(fx(her, 0))) + '. The correct answer is ' + t(dg(fx(cor, 0))) + '.' + figWrap(fig);
        },
        parts: [
          { id: 'e16a', level: 'BEG', make: function (r, s) { var h = s.x * T.tan(s.a);
            return near('Confirm her tower height: determine ' + t('h') + ' to the nearest tenth of a metre.', h, 1, 'm', sideAlts(s.x, s.a, 'adj', 'opp'), sideWork(s.x, s1(s.x), s.a, 'adj', 'opp', h, 1, 'm', 'h') + ' — her height is right to the nearest tenth.', ['From ' + t('X') + ': ' + t('h') + ' is opposite, ' + t(s1(s.x)) + ' m is adjacent.'], 'tower height');
          } },
          { id: 'e16a2', level: 'EMG', make: function (r, s) { var h = s.x * T.tan(s.a);
            return mcWhy(r, 'Her height is correct to the nearest tenth. Where is the error?', 'In the second step: she fed the <b>rounded</b> ' + t(fx(h, 1)) + ' into the inverse tangent instead of the full ' + t(fx(h, 4) + '\\ldots') + '.',
              [['In the height: ' + t(s1(s.x) + '\\tan ' + dg(s.a)) + ' isn’t ' + t(fx(h, 1)) + '.', 'It is: ' + t(s1(s.x) + '\\tan ' + dg(s.a) + '=' + fx(h, 4)) + ', which rounds to ' + t(fx(h, 1)) + '.'],
                ['She should have used ' + t(s1(s.w)) + ' m, not ' + t(s1(s.x + s.w)) + ' m.', 'From ' + t('Y') + ' the horizontal distance to the tower is ' + t(s1(s.x) + '+' + s1(s.w) + '=' + s1(s.x + s.w)) + ' m — she had that right.'],
                ['She should have used sine, not tangent.', 'Height (opposite) and horizontal distance (adjacent): tangent is right.']],
              t('h=' + fx(h, 4) + '\\ldots') + ' rounds to ' + t(fx(h, 1)) + ' correctly. The error is handing the <b>rounded</b> value across to the second triangle: a shared value must never be rounded on the way.', ['Compare the two steps: which one used a rounded number?'], 'where is the error');
          } },
          { id: 'e16b', level: 'EMG', make: function (r, s) { var h = s.x * T.tan(s.a), D = s.x + s.w, cor = T.atan(h / D), her = T.atan(rnd(h, 1) / D);
            return fieldsPart('Redo the second step both ways. Give each angle to the nearest <b>hundredth</b> of a degree (before rounding to a whole degree).', [
              nf('\\theta_{\\text{full }h}=', cor, 2, '°', [{ v: her, code: 'trig-early', hint: 'That is her version (with ' + t('h=' + fx(h, 1)) + '). Here use the full ' + t('h=' + fx(h, 4) + '\\ldots') + '.' }, { v: T.atan(h / s.w), code: 'trig-sum-diff', hint: 'From ' + t('Y') + ' the horizontal is ' + t(s1(D)) + ' m.' }]),
              nf('\\theta_{h=' + fx(h, 1) + '}=', her, 2, '°', [{ v: cor, code: 'trig-early', hint: 'That is the full-accuracy version. Here use her rounded ' + t('h=' + fx(h, 1)) + '.' }])],
              '<b>Full accuracy:</b> ' + t('\\tan^{-1}\\!\\left(\\dfrac{' + fx(h, 4) + '}{' + s1(D) + '}\\right)=' + fx(cor, 4) + '^\\circ\\Rightarrow ' + dg(fx(cor, 0))) + '<br><b>Her version:</b> ' + t('\\tan^{-1}\\!\\left(\\dfrac{' + fx(h, 1) + '}{' + s1(D) + '}\\right)=' + fx(her, 4) + '^\\circ\\Rightarrow ' + dg(fx(her, 0))), ['Horizontal distance from ' + t('Y') + ': ' + t(s1(s.x) + '+' + s1(s.w)) + '.'], 'two thetas');
          } },
          { id: 'e16c', level: 'EMG', make: function (r, s) { var h = s.x * T.tan(s.a), D = s.x + s.w, cor = T.atan(h / D), her = T.atan(rnd(h, 1) / D), cut = Math.round(Math.min(cor, her)) + 0.5;
            return mcWhy(r, 'The two unrounded angles differ by only ' + t(fx(Math.abs(cor - her), 4) + '^\\circ') + ', yet the reported answers differ by a whole degree. How?', 'They sit on opposite sides of ' + t(fx(cut, 1) + '^\\circ') + ', the cut-off between rounding down and rounding up. A tiny drift is enough if it crosses a rounding boundary.',
              [['The calculator is less accurate for small angles.', 'The calculator is fine — the drift came from rounding ' + t('h') + ' before the inverse tangent.'],
                ['A difference of ' + t(fx(Math.abs(cor - her), 2) + '^\\circ') + ' is always enough to change the whole-degree answer.', 'Usually it isn’t; it is here only because the two values straddle ' + t(fx(cut, 1) + '^\\circ') + '.'],
                ['Inverse tangent magnifies every error by about ' + t('30') + ' times.', 'The error stayed tiny. What matters is that it crossed the rounding cut-off.']],
              t(fx(cor, 4) + '^\\circ') + ' and ' + t(fx(her, 4) + '^\\circ') + ' lie on opposite sides of ' + t(fx(cut, 1) + '^\\circ') + '. A drift doesn’t have to be large to change an answer — only large enough to cross a rounding boundary, and you can’t know in advance how close a value sits to one.', ['Where is the cut-off between rounding to ' + t(dg(Math.floor(Math.min(cor, her) + 0.5))) + ' and the next degree?'], 'rounding boundary');
          } },
          { id: 'e16d', level: 'BEG', make: function (r, s) { var h = s.x * T.tan(s.a);
            return mcWhy(r, 'What rule does this question teach, and what should she have stored in her calculator instead of ' + t(fx(h, 1)) + '?', 'Carry every intermediate value at full accuracy and round once, at the end: store ' + t(fx(h, 4) + '\\ldots') + ' (or key in ' + t('\\tan^{-1}\\!\\left(\\frac{' + s1(s.x) + '\\tan ' + dg(s.a) + '}{' + s1(s.x + s.w) + '}\\right)') + ' in one go).',
              [['Always round to two decimal places instead of one.', 'Any early rounding can cross a boundary. Round only at the end.'],
                ['Round every step to the nearest whole number to keep things simple.', 'That makes the drift bigger, not smaller.'],
                ['Measure the angle from ' + t('Y') + ' with a clinometer instead of calculating.', 'That avoids the calculation but not the lesson: shared values must be carried unrounded.']],
              '<b>Rule:</b> round once, at the very end. She should have stored ' + t(fx(h, 4) + '\\ldots') + ' — or, better, entered ' + t('\\theta=\\tan^{-1}\\!\\left(\\dfrac{' + s1(s.x) + '\\tan ' + dg(s.a) + '}{' + s1(s.x + s.w) + '}\\right)') + ' as one keystroke sequence.', ['Which value was handed from one triangle to the next?'], 'rule');
          } }] },
      /* ---------- EP 17 ---------- */
      { num: '17', section: 'Extra practice F — Challenge',
        shared: function (r) { return gen(r, function (r) { return { sp: d1(r, 8, 16), a1: r.int(30, 45), a2: r.int(18, 28) }; }, function (s) { var g = roof(s); return s.a1 - s.a2 >= 6 && safe(g.h, 1) && safe(g.l1, 1) && safe(g.l2, 1) && safe(g.lf, 1) && safe(g.fr, 1); }); },
        stem: function (s) {
          var g = roof(s), fig = HW.fig({ pts: { L: [0, 0], Rg: [g.lf, g.h], R: [s.sp, 0], F: [g.lf, 0] }, segs: [['L', 'Rg', { width: 2.6 }], ['Rg', 'R', { width: 2.6 }], ['L', 'R', s1(s.sp) + ' m'], ['Rg', 'F', 'h', { dash: 1 }]], right: [['F', 'R', 'Rg']], angles: [['L', 'R', 'Rg', s.a1 + '°', { r: 30 }], ['R', 'L', 'Rg', s.a2 + '°', { r: 34 }]], names: { L: 'L', R: 'R', Rg: 'ridge' }, extra: [{ type: 'text', at: [g.lf + s.sp * 0.035, g.h * 0.14], text: 'F' }], width: 320, aria: 'unequal pitch roof' });
          return 'A roof has an <b>unequal pitch</b>. The two walls are ' + t(s1(s.sp)) + ' m apart and their tops are level. The left rafter makes ' + t(dg(s.a1)) + ' with the horizontal and the right rafter makes ' + t(dg(s.a2)) + '. Let ' + t('h') + ' be the height of the ridge above the wall tops, with foot ' + t('F') + '.' + figWrap(fig);
        },
        parts: [
          { id: 'e17a', level: 'PRG', make: function (r, s) {
            var A = s.a1, B = s.a2;
            return P.mc(r, 'Which pair gives ' + t('LF') + ' and ' + t('FR') + ' in terms of ' + t('h') + '?', [
              { html: t('LF=\\dfrac{h}{\\tan ' + dg(A) + '},\\ \\ FR=\\dfrac{h}{\\tan ' + dg(B) + '}'), right: true },
              { html: t('LF=h\\tan ' + dg(A) + ',\\ \\ FR=h\\tan ' + dg(B)), why: t('\\tan ' + dg(A) + '=\\frac{h}{LF}') + ' puts ' + t('LF') + ' in the <b>denominator</b>, so ' + t('LF=\\frac{h}{\\tan ' + dg(A) + '}') + '.' },
              { html: t('LF=\\dfrac{h}{\\sin ' + dg(A) + '},\\ \\ FR=\\dfrac{h}{\\sin ' + dg(B) + '}'), why: 'Those are the <b>rafters</b> (hypotenuses). ' + t('LF') + ' and ' + t('FR') + ' are legs adjacent to the angles: tangent.' },
              { html: t('LF=\\dfrac{h}{\\tan ' + dg(B) + '},\\ \\ FR=\\dfrac{h}{\\tan ' + dg(A) + '}'), why: t('LF') + ' is in the left triangle, with the ' + t(dg(A)) + ' angle at ' + t('L') + '.' }],
              'Left triangle: ' + t('\\tan ' + dg(A) + '=\\frac{h}{LF}\\Rightarrow LF=\\frac{h}{\\tan ' + dg(A) + '}') + '. Right triangle: ' + t('\\tan ' + dg(B) + '=\\frac{h}{FR}\\Rightarrow FR=\\frac{h}{\\tan ' + dg(B) + '}') + '.', ['In each triangle, ' + t('h') + ' is opposite the angle and the horizontal piece is adjacent.'], 'roof expressions');
          } },
          { id: 'e17b', level: 'ADV', make: function (r, s) { var g = roof(s);
            return near('The two distances add to ' + t(s1(s.sp)) + ' m. Solve ' + t('\\dfrac{h}{\\tan ' + dg(s.a1) + '}+\\dfrac{h}{\\tan ' + dg(s.a2) + '}=' + s1(s.sp)) + ' for ' + t('h') + ', to the nearest tenth of a metre.', g.h, 1, 'm', [{ v: s.sp / (T.tan(s.a1) + T.tan(s.a2)), code: 'trig-inv', hint: 'Factor out ' + t('h') + ': ' + t('h\\left(\\frac{1}{\\tan ' + dg(s.a1) + '}+\\frac{1}{\\tan ' + dg(s.a2) + '}\\right)') + ' — the reciprocals of the tangents, not the tangents themselves.' }, { v: s.sp * (T.tan(s.a1) + T.tan(s.a2)), code: 'trig-inv', hint: 'Factor out ' + t('h') + ' and then <b>divide</b> ' + t(s1(s.sp)) + ' by the bracket.' }, { v: s.sp / 2 * T.tan((s.a1 + s.a2) / 2), code: 'trig-angle-diff', hint: 'The ridge isn’t over the middle and the angles can’t be averaged — solve the equation.' }],
              t('h\\left(\\dfrac{1}{\\tan ' + dg(s.a1) + '}+\\dfrac{1}{\\tan ' + dg(s.a2) + '}\\right)=' + s1(s.sp)) + '<br>' + t('h(' + fx(1 / T.tan(s.a1), 4) + '+' + fx(1 / T.tan(s.a2), 4) + ')=' + s1(s.sp)) + '<br>' + t('h=\\dfrac{' + s1(s.sp) + '}{' + fx(1 / T.tan(s.a1) + 1 / T.tan(s.a2), 4) + '}=' + fx(g.h, 4) + '\\approx ' + fx(g.h, 1)) + ' m', ['Factor ' + t('h') + ' out of the left side.'], 'solve for h');
          } },
          { id: 'e17c', level: 'PRG', make: function (r, s) { var g = roof(s);
            return fieldsPart('The ridge height is ' + t('h\\approx ' + fx(g.h, 4) + '\\ldots') + ' m. Determine the length of each rafter, to the nearest tenth of a metre.', [
              nf('\\text{left rafter}=', g.l1, 1, 'm', sideAlts(g.h, s.a1, 'opp', 'hyp', [{ v: rnd(g.h, 1) / T.sin(s.a1), code: 'trig-early', hint: 'Use the unrounded ' + t('h') + '.' }])),
              nf('\\text{right rafter}=', g.l2, 1, 'm', sideAlts(g.h, s.a2, 'opp', 'hyp', [{ v: rnd(g.h, 1) / T.sin(s.a2), code: 'trig-early', hint: 'Use the unrounded ' + t('h') + '.' }]))],
              'In each triangle ' + t('h') + ' is opposite the angle and the rafter is the hypotenuse ' + t('\\Rightarrow') + ' SOH.<br>left ' + t('=\\dfrac{' + fx(g.h, 4) + '}{\\sin ' + dg(s.a1) + '}=' + fx(g.l1, 4) + '\\approx ' + fx(g.l1, 1)) + ' m, right ' + t('=\\dfrac{' + fx(g.h, 4) + '}{\\sin ' + dg(s.a2) + '}=' + fx(g.l2, 4) + '\\approx ' + fx(g.l2, 1)) + ' m', ['Each rafter is the hypotenuse of its triangle.'], 'rafters');
          } },
          { id: 'e17d', level: 'PRG', make: function (r, s) { var g = roof(s);
            return fieldsPart('With ' + t('h\\approx ' + fx(g.h, 4) + '\\ldots') + ' m, determine the horizontal distance from each wall to the point below the ridge (nearest tenth of a metre).', [
              nf('LF=', g.lf, 1, 'm', sideAlts(g.h, s.a1, 'opp', 'adj')), nf('FR=', g.fr, 1, 'm', sideAlts(g.h, s.a2, 'opp', 'adj'))],
              t('LF=\\dfrac{' + fx(g.h, 4) + '}{\\tan ' + dg(s.a1) + '}=' + fx(g.lf, 4) + '\\approx ' + fx(g.lf, 1)) + ' m, ' + t('FR=\\dfrac{' + fx(g.h, 4) + '}{\\tan ' + dg(s.a2) + '}=' + fx(g.fr, 4) + '\\approx ' + fx(g.fr, 1)) + ' m. Check: ' + t(fx(g.lf, 4) + '+' + fx(g.fr, 4) + '=' + s1(s.sp)) + ' ✓', ['The horizontal piece is adjacent to the angle; ' + t('h') + ' is opposite.'], 'LF and FR');
          } },
          { id: 'e17e', level: 'EMG', make: function (r, s) { var A = 180 - s.a1 - s.a2;
            return near('State the angle at the ridge between the two rafters, to the nearest degree.', A, 0, '°', [{ v: s.a1 + s.a2, code: 'trig-complement', hint: 'Each piece of the ridge angle is ' + t('90^\\circ') + ' minus the wall angle: ' + t('(90^\\circ-' + dg(s.a1) + ')+(90^\\circ-' + dg(s.a2) + ')') + '.' }, { v: 90 - s.a1, code: 'trig-one-piece', hint: 'That is only the left piece. Add the right piece, ' + t('90^\\circ-' + dg(s.a2)) + '.' }, { v: 90 - s.a2, code: 'trig-one-piece', hint: 'That is only the right piece. Add the left piece, ' + t('90^\\circ-' + dg(s.a1)) + '.' }],
              'Each right triangle has its ' + t('90^\\circ') + ' at ' + t('F') + ', so its angle at the ridge is the complement of the wall angle: ' + t('90^\\circ-' + dg(s.a1) + '=' + dg(90 - s.a1)) + ' and ' + t('90^\\circ-' + dg(s.a2) + '=' + dg(90 - s.a2)) + '. Ridge angle ' + t('=' + dg(90 - s.a1) + '+' + dg(90 - s.a2) + '=' + dg(A)) + '. (Check: ' + t(dg(s.a1) + '+' + dg(s.a2) + '+' + dg(A) + '=180^\\circ') + '.)', ['The acute angles of each right triangle add to ' + t('90^\\circ') + '.'], 'ridge angle');
          } }] },
      /* ---------- EP 18 ---------- */
      { num: '18',
        shared: function (r) { var tr = r.pick(QTRIP); return { x: tr[0], a: tr[1] - tr[0], b: tr[2] - tr[0] }; },
        stem: function (s) { return 'A right triangle has legs of length ' + t('x') + ' and ' + t('x+' + s.a) + ', and a hypotenuse of length ' + t('x+' + s.b) + ', where ' + t('x') + ' is a positive number. The right angle is at ' + t('C') + ', with ' + t('BC=x') + ', ' + t('CA=x+' + s.a) + ' and ' + t('AB=x+' + s.b) + '.' + figWrap(HW.tri({ w: s.x + s.a, h: s.x, names: ['A', 'B', 'C'], sides: { a: 'x', b: 'x+' + s.a, c: 'x+' + s.b }, width: 240 })); },
        parts: [
          { id: 'e18a', level: 'PRG', make: function (r, s) {
            var B = 2 * s.a - 2 * s.b, Cc = s.a * s.a - s.b * s.b, tex = 'x^{2}' + (B < 0 ? '-' : '+') + Math.abs(B) + 'x' + (Cc < 0 ? '-' : '+') + Math.abs(Cc);
            var p = K.P.poly('Apply the Pythagorean theorem and simplify to a quadratic equation in ' + t('x') + ' with integer coefficients.', tex, { before: t('x^2+(x+' + s.a + ')^2=(x+' + s.b + ')^2\\ \\Rightarrow'), wrong: [{ is: '2x^2+' + (2 * s.a + 2 * s.b) + 'x+' + (s.a * s.a + s.b * s.b), code: 'trig-pyth', hint: 'The hypotenuse ' + t('x+' + s.b) + ' goes alone on one side: ' + t('x^2+(x+' + s.a + ')^2=(x+' + s.b + ')^2') + ', then move everything to one side.' }] },
              t('x^2+(x+' + s.a + ')^2=(x+' + s.b + ')^2') + '<br>' + t('x^2+x^2+' + (2 * s.a) + 'x+' + (s.a * s.a) + '=x^2+' + (2 * s.b) + 'x+' + (s.b * s.b)) + '<br>' + t(tex + '=0'),
              ['Expand ' + t('(x+' + s.a + ')^2') + ' and ' + t('(x+' + s.b + ')^2') + ' — don’t forget the middle terms.', 'Move every term to the left side.'], 'pythag quadratic');
            var c0 = p.check; p.check = function (resp) { var res = c0(resp); if (res.v === 'wrong' && res.code === 'sign-all') return ok(); return res; };
            p.input.after = t('=0');
            p.good = ['-x^2' + (B < 0 ? '+' : '-') + Math.abs(B) + 'x' + (Cc < 0 ? '+' : '-') + Math.abs(Cc)];
            return p;
          } },
          { id: 'e18b', level: 'PRG', make: function (r, s) {
            var neg = (s.a * s.a - s.b * s.b) / s.x, B = 2 * s.a - 2 * s.b, Cc = s.a * s.a - s.b * s.b;
            var p = P.fields('Solve ' + t('x^{2}' + (B < 0 ? '-' : '+') + Math.abs(B) + 'x' + (Cc < 0 ? '-' : '+') + Math.abs(Cc) + '=0') + ' by factoring. Give the root that describes the triangle, and the root that doesn’t.', [{ name: 'triangle root', before: 'describes the triangle: ' + t('x=') }, { name: 'other root', before: 'the other root: ' + t('x=') }],
              [K.number(s.x, function (v) { if (v === neg) return { code: 'trig-neg-root', hint: 'A side length can’t be negative — that root doesn’t describe a triangle.' }; if (v === -s.x || v === -neg) return { code: 'sign', hint: 'Check the signs: ' + t('(x-p)=0') + ' gives ' + t('x=p') + '.' }; return null; }),
                K.number(neg, function (v) { if (v === -neg) return { code: 'sign', hint: 'Check the sign: ' + t('(x+' + (-neg) + ')=0') + ' gives ' + t('x=' + neg) + '.' }; return null; })],
              [String(s.x), String(neg)], t('x=' + s.x) + ' (triangle), ' + t('x=' + neg) + ' (rejected)',
              t('x^{2}' + (B < 0 ? '-' : '+') + Math.abs(B) + 'x' + (Cc < 0 ? '-' : '+') + Math.abs(Cc) + '=(x-' + s.x + ')(x+' + (-neg) + ')=0') + ', so ' + t('x=' + s.x) + ' or ' + t('x=' + neg) + '. Only ' + t('x=' + s.x) + ' describes a triangle: with ' + t('x=' + neg) + ' a leg would have negative length.',
              ['Find two numbers that multiply to ' + t(Cc) + ' and add to ' + t(B) + '.'], 'factor roots');
            p.bad = [[String(neg), String(s.x)]];
            return p;
          } },
          { id: 'e18c', level: 'BEG', make: function (r, s) {
            var o = s.x, a = s.x + s.a, h = s.x + s.b, vals = { sin: fr(o, h), cos: fr(a, h), tan: fr(o, a) };
            function dg2(me) { return function (v) { for (var k in vals) if (k !== me && Math.abs(v - vals[k][0] / vals[k][1]) < 1e-9) return { code: 'trig-ratio', hint: 'That is ' + t('\\' + k + ' A') + '. Relative to ' + t('A') + ': opposite ' + t('=BC') + ', adjacent ' + t('=CA') + ', hypotenuse ' + t('=AB') + '.' }; return null; }; }
            var p = fieldsPart('With ' + t('x=' + s.x) + ', the sides are ' + t('BC=' + o) + ', ' + t('CA=' + a) + ' and ' + t('AB=' + h) + '. Write ' + t('\\sin A') + ', ' + t('\\cos A') + ' and ' + t('\\tan A') + ' as fractions in lowest terms.',
              ['sin', 'cos', 'tan'].map(function (k) { return { label: t('\\' + k + ' A='), name: k + ' A', check: fracChk(vals[k], dg2(k)), key: ftex(vals[k]), ansTex: t(ftex(vals[k])) }; }),
              'Check: ' + t(o + '^2+' + a + '^2=' + (o * o + a * a) + '=' + h + '^2') + ' ✓. Relative to ' + t('\\angle A') + ': opp ' + t('=BC=' + o) + ', adj ' + t('=CA=' + a) + ', hyp ' + t('=AB=' + h) + '.<br>' + t('\\sin A=' + ftex(vals.sin) + ',\\quad \\cos A=' + ftex(vals.cos) + ',\\quad \\tan A=' + ftex(vals.tan)),
              [t('BC') + ' doesn’t touch ' + t('A') + ' — it is opposite.'], 'exact ratios A');
            p.input.fields.forEach(function (f) { f.mode = 'math'; f.keys = 'fraction'; });
            p.bad = [[ftex(vals.cos), ftex(vals.sin), ftex(vals.tan)]];
            return p;
          } },
          { id: 'e18d', level: 'EMG', make: function (r, s) { var o = s.x, a = s.x + s.a, A = T.atan(o / a);
            return fieldsPart('With ' + t('BC=' + o) + ', ' + t('CA=' + a) + ' and ' + t('AB=' + (s.x + s.b)) + ', determine ' + t('\\angle A') + ' and ' + t('\\angle B') + ', each to the nearest degree.', [nf('\\angle A=', A, 0, '°', angAlts(o, a, 'tan', 0)), nf('\\angle B=', 90 - A, 0, '°', angAlts(a, o, 'tan', 0))],
              angWork(o, a, 'tan', A, 0, '\\angle A') + '<br>' + t('\\angle B=90^\\circ-' + fx(A, 4) + '^\\circ=' + fx(90 - A, 4) + '^\\circ\\approx ' + dg(fx(90 - A, 0))) + '<br>Checks: ' + t(dg(fx(A, 0)) + '+' + dg(fx(90 - A, 0)) + '+90^\\circ=180^\\circ') + '; the longest side ' + t('(' + (s.x + s.b) + ')') + ' faces the largest angle; the hypotenuse is longer than both legs.', ['Any of the three exact ratios gives ' + t('\\angle A') + '.'], 'angles A B');
          } },
          { id: 'e18e', level: 'PRG', make: function (r, s) { var c = s.a - 2, B2 = 2 * s.a - 2 * c, C2 = s.a * s.a - c * c;
            return mcWhy(r, 'Suppose instead the legs are ' + t('x') + ' and ' + t('x+' + s.a) + ' but the hypotenuse is ' + t('x+' + c) + '. What does the equation say?', t('x^2+' + B2 + 'x+' + C2 + '=0') + ' has no real solution, so there is <b>no such triangle</b> — as expected, since the hypotenuse ' + t('x+' + c) + ' would be shorter than the leg ' + t('x+' + s.a) + '.',
              [[t('x^2+' + B2 + 'x+' + C2 + '=0') + ' gives a negative ' + t('x') + ', so the triangle is the same size as before.', 'This quadratic has no real roots at all: completing the square gives ' + t('(x+' + (B2 / 2) + ')^2=' + (B2 * B2 / 4 - C2)) + ', and a square can’t be negative.'],
                ['The equation is the same as before, so ' + t('x=' + s.x) + ' again.', 'Changing the hypotenuse changes the equation: ' + t('(x+' + c + ')^2') + ' expands differently.'],
                ['There are two such triangles, one for each root.', 'There are no real roots — so no triangle at all.']],
              t('x^2+(x+' + s.a + ')^2=(x+' + c + ')^2\\Rightarrow x^2+' + B2 + 'x+' + C2 + '=0') + '. Completing the square: ' + t('(x+' + (B2 / 2) + ')^2=' + (B2 * B2 / 4 - C2)) + ' — impossible. Geometry says so first: the hypotenuse must be the longest side, but ' + t('x+' + c + '<x+' + s.a) + ' for every ' + t('x') + '.', ['Which side must a hypotenuse always be?'], 'no such triangle');
          } }] },
      /* ---------- EP 19 ---------- */
      { num: '19', section: 'Extra practice G — Coverage fill',
        shared: function (r) { return gen(r, function (r) { return { rr: d1(r, 3.0, 8.0), c: 2 * r.int(25, 55) }; }, function (s) { var h = s.c / 2; return safe(s.rr / T.sin(h), 1) && safe(s.rr / T.tan(h), 1); }); },
        stem: function (s) {
          var h = s.c / 2, oc = s.rr / T.sin(h), ot = s.rr / T.tan(h), Cc = [oc, 0], Tt = [ot * T.cos(h), ot * T.sin(h)], L = oc + s.rr * 1.4;
          var pts = { O: [0, 0], C: Cc, T: Tt, E1: [L * T.cos(h), L * T.sin(h)], E2: [L * T.cos(h), -L * T.sin(h)] }, segs = [['O', 'E1', { width: 2.6 }], ['O', 'E2', { width: 2.6 }], ['O', 'C', { dash: 1 }], ['C', 'T', s1(s.rr), { dash: 1 }]];
          for (var i = 0; i < 48; i++) { pts['c' + i] = [oc + s.rr * Math.cos(i * Math.PI / 24), s.rr * Math.sin(i * Math.PI / 24)]; if (i) segs.push(['c' + (i - 1), 'c' + i, { width: 1.6, color: '#6a7182' }]); }
          segs.push(['c47', 'c0', { width: 1.6, color: '#6a7182' }]);
          var fig = HW.fig({ pts: pts, segs: segs, right: [['T', 'O', 'C']], angles: [['O', 'E2', 'E1', s.c + '°', { r: 26 }]], names: { O: 'O', C: 'C', T: 'T' }, width: 280, aria: 'silo in a corner' });
          return 'A cylindrical grain silo of radius ' + t(s1(s.rr)) + ' m stands in the corner of a yard, touching both straight fences that meet at the corner ' + t('O') + ' at an angle of ' + t(dg(s.c)) + '. ' + t('C') + ' is the centre of the silo’s circular base and ' + t('T') + ' is where the silo touches one fence.' + figWrap(fig);
        },
        parts: [
          { id: 'e19a', level: 'EMG', make: function (r, s) {
            return mcWhy(r, 'Why is ' + t('\\angle OTC=90^\\circ') + ', and why does ' + t('OC') + ' split the ' + t(dg(s.c)) + ' corner into two equal angles?', 'A tangent is perpendicular to the radius at the point of contact; and the segment from an outside point to the centre bisects the angle between the two tangents.',
              [['Because the fences are perpendicular, and ' + t('OC') + ' is a median.', 'The fences meet at ' + t(dg(s.c)) + ', not ' + t('90^\\circ') + '. The right angle is between the fence (a tangent) and the radius ' + t('CT') + '.'],
                ['Because ' + t('\\triangle OTC') + ' is isosceles, so its angles are ' + t('45^\\circ') + ' and ' + t('90^\\circ') + '.', 'It isn’t isosceles. The right angle comes from the tangent–radius fact.'],
                ['Because the silo is a cylinder, every angle at its base is ' + t('90^\\circ') + '.', 'The key facts are about circles: tangent ' + t('\\perp') + ' radius, and equal tangents from ' + t('O') + ' make ' + t('OC') + ' a bisector.']],
              t('\\angle OTC=90^\\circ') + ': a tangent to a circle is perpendicular to the radius drawn to the point of contact. ' + t('OC') + ' bisects the corner: the two tangent segments from ' + t('O') + ' are equal, and ' + t('OC') + ' joins ' + t('O') + ' to the centre, so ' + t('\\angle TOC=\\tfrac{' + s.c + '^\\circ}{2}=' + dg(s.c / 2)) + '.', ['What is special about a radius drawn to a point of tangency?'], 'tangent facts');
          } },
          { id: 'e19b', level: 'PRG', make: function (r, s) { var h = s.c / 2, x = s.rr / T.sin(h);
            return near('Determine ' + t('OC') + ', the distance from the corner to the centre of the silo, to the nearest tenth of a metre.', x, 1, 'm', [{ v: s.rr / T.sin(s.c), code: 'trig-half', hint: t('OC') + ' bisects the corner, so the angle in ' + t('\\triangle OTC') + ' is ' + t(dg(h)) + ', not ' + t(dg(s.c)) + '.' }].concat(sideAlts(s.rr, h, 'opp', 'hyp')),
              t('\\angle TOC=' + dg(h)) + '. In right ' + t('\\triangle OTC') + ': opp ' + t('=CT=' + s1(s.rr)) + ', hyp ' + t('=OC') + ' ' + t('\\Rightarrow') + ' SOH.<br>' + t('OC=\\dfrac{' + s1(s.rr) + '}{\\sin ' + dg(h) + '}=' + fx(x, 4) + '\\approx ' + fx(x, 1)) + ' m. The unknown is the hypotenuse, so it lands in the denominator.', ['Halve the corner angle first.', 'The radius is opposite the angle at ' + t('O') + '.'], 'OC');
          } },
          { id: 'e19c', level: 'PRG', make: function (r, s) { var h = s.c / 2, x = s.rr / T.tan(h);
            return near('Determine ' + t('OT') + ', the distance along a fence from the corner to the point of contact, to the nearest tenth of a metre.', x, 1, 'm', [{ v: s.rr / T.tan(s.c), code: 'trig-half', hint: 'Use half of the corner angle: ' + t(dg(h)) + '.' }].concat(sideAlts(s.rr, h, 'opp', 'adj')),
              'Relative to ' + t(dg(h)) + ': opp ' + t('=' + s1(s.rr)) + ', adj ' + t('=OT') + ' ' + t('\\Rightarrow') + ' TOA: ' + t('OT=\\dfrac{' + s1(s.rr) + '}{\\tan ' + dg(h) + '}=' + fx(x, 4) + '\\approx ' + fx(x, 1)) + ' m.<br>Check with Pythagoras: ' + t('\\sqrt{OC^2-' + s1(s.rr) + '^2}=' + fx(x, 4)) + ' ✓', [t('OT') + ' is adjacent to the angle at ' + t('O') + '.'], 'OT');
          } },
          { id: 'e19d', level: 'EMG', make: function (r, s) { var h = s.c / 2;
            return mcWhy(r, 'The silo is replaced by a wider one, still touching both fences. What happens to ' + t('OC') + ' and ' + t('OT') + ', and to the ' + t(dg(h)) + ' angle?', 'Both ' + t('OC') + ' and ' + t('OT') + ' increase in proportion to the radius; the ' + t(dg(h)) + ' stays the same, because it is half the fixed ' + t(dg(s.c)) + ' corner.',
              [['Both increase, and the angle increases too.', 'The angle is set by the fences alone: half of ' + t(dg(s.c)) + '. A bigger circle makes a bigger, similar triangle.'],
                [t('OC') + ' increases but ' + t('OT') + ' stays the same.', t('OT=\\frac{r}{\\tan ' + dg(h) + '}') + ' also grows with ' + t('r') + ' — the silo touches the fences further along.'],
                ['Both decrease, because a wider silo sits closer to the corner.', 'A wider silo can’t fit as close to the corner: ' + t('OC=\\frac{r}{\\sin ' + dg(h) + '}') + ' grows with ' + t('r') + '.']],
              t('OC=\\frac{r}{\\sin ' + dg(h) + '}') + ' and ' + t('OT=\\frac{r}{\\tan ' + dg(h) + '}') + ' are ' + t('r') + ' times fixed numbers, so both grow in proportion to the radius. The ' + t(dg(h)) + ' is half of the ' + t(dg(s.c)) + ' corner and doesn’t depend on the circle: every such silo gives a similar triangle.', ['Write ' + t('OC') + ' and ' + t('OT') + ' in terms of the radius ' + t('r') + '.'], 'wider silo');
          } }] },
      /* ---------- EP 20 ---------- */
      { num: '20',
        shared: function (r) { return gen(r, function (r) { return { L: d1(r, 6.0, 14.0), W: d1(r, 2.0, 3.0), H: d1(r, 2.2, 3.0) }; }, function (s) { var ac = Math.hypot(s.L, s.W); return safe(ac, 1) && safe(Math.hypot(ac, s.H), 1) && safe(T.atan(s.H / ac), 0) && safe(T.atan(Math.hypot(s.W, s.H) / s.L), 0); }); },
        stem: function (s) {
          var k = 0.4, dx = s.W * 0.3, dy = s.W * 0.26, A = [0, 0], B = [s.L * k, 0], C = [s.L * k + dx, dy], D = [dx, dy], E = [0, s.H * k], Fp = [s.L * k, s.H * k], G = [s.L * k + dx, dy + s.H * k], Hh = [dx, dy + s.H * k];
          var fig = HW.fig({ pts: { A: A, B: B, C: C, D: D, E: E, F: Fp, G: G, H: Hh }, segs: [['A', 'B', s1(s.L) + ' m'], ['B', 'F'], ['F', 'E'], ['E', 'A', s1(s.H) + ' m'], ['E', 'H'], ['H', 'G'], ['G', 'F'], ['B', 'C', s1(s.W) + ' m'], ['C', 'G'], ['A', 'D', { dash: 1, width: 1.2 }], ['D', 'C', { dash: 1, width: 1.2 }], ['D', 'H', { dash: 1, width: 1.2 }], ['A', 'C', { dash: 1, color: '#13807a' }], ['A', 'G', { color: '#c0563b', width: 2.4 }]], width: 330, aria: 'shipping container with a cable' });
          return 'A shipping container is a rectangular prism ' + t('ABCDEFGH') + ' with floor ' + t('ABCD') + ' and ' + t('E,F,G,H') + ' directly above ' + t('A,B,C,D') + ': ' + t('AB=' + s1(s.L)) + ' m, ' + t('BC=' + s1(s.W)) + ' m and ' + t('AE=' + s1(s.H)) + ' m. A cable runs from the bottom corner ' + t('A') + ' to the top corner ' + t('G') + '.' + figWrap(fig);
        },
        parts: [
          { id: 'e20a', level: 'BEG', make: function (r, s) { var ac = Math.hypot(s.L, s.W);
            return near('Determine the length of the floor diagonal ' + t('AC') + ', to the nearest tenth of a metre.', ac, 1, 'm', [{ v: s.L + s.W, code: 'trig-pyth', hint: 'Lengths don’t add — ' + t('AC') + ' is the hypotenuse of right ' + t('\\triangle ABC') + '.' }, { v: Math.sqrt(s.L * s.L - s.W * s.W), code: 'trig-pyth', hint: t('AC') + ' is the hypotenuse: add the squares.' }],
              t('ABCD') + ' is a rectangle, so ' + t('\\angle ABC=90^\\circ') + ':<br>' + t('AC=\\sqrt{' + s1(s.L) + '^2+' + s1(s.W) + '^2}=\\sqrt{' + rnd(s.L * s.L + s.W * s.W, 2) + '}=' + fx(ac, 4) + '\\approx ' + fx(ac, 1)) + ' m', ['The floor is a rectangle: its corners are right angles.'], 'floor diagonal');
          } },
          { id: 'e20b', level: 'EMG', make: function (r, s) { var ac2 = s.L * s.L + s.W * s.W, ag = Math.sqrt(ac2 + s.H * s.H);
            return near('Determine the cable length ' + t('AG') + ', to the nearest tenth of a metre, using the unrounded ' + t('AC') + '.', ag, 1, 'm', [{ v: Math.hypot(rnd(Math.sqrt(ac2), 1), s.H), code: 'trig-early', hint: 'Use the <b>unrounded</b> ' + t('AC') + ' (or ' + t('AC^2=' + rnd(ac2, 2)) + ' exactly).' }, { v: Math.hypot(s.L, s.H), code: 'trig-wrong-side', hint: t('\\triangle ACG') + ' is right-angled at ' + t('C') + ': its legs are the floor diagonal ' + t('AC') + ' and the vertical edge ' + t('CG') + '.' }, { v: Math.sqrt(Math.abs(ac2 - s.H * s.H)), code: 'trig-pyth', hint: t('AG') + ' is the hypotenuse: add the squares.' }],
              t('CG') + ' is vertical and ' + t('AC') + ' lies in the floor, so ' + t('\\angle ACG=90^\\circ') + '.<br>' + t('AG=\\sqrt{AC^2+CG^2}=\\sqrt{' + rnd(ac2, 2) + '+' + rnd(s.H * s.H, 2) + '}=' + fx(ag, 4) + '\\approx ' + fx(ag, 1)) + ' m', ['Find the right triangle that has the cable as its hypotenuse.'], 'cable length');
          } },
          { id: 'e20c', level: 'PRG', make: function (r, s) { var ac = Math.hypot(s.L, s.W), A = T.atan(s.H / ac);
            return near('Determine the angle the cable makes with the floor, ' + t('\\angle GAC') + ', to the nearest degree.', A, 0, '°', [{ v: T.atan(s.H / s.L), code: 'trig-wrong-side', hint: 'The cable’s “shadow” on the floor is the diagonal ' + t('AC') + ', not the edge ' + t('AB') + '.' }].concat(angAlts(s.H, ac, 'tan', 0)),
              'In right ' + t('\\triangle ACG') + ', relative to ' + t('\\angle GAC') + ': opp ' + t('=CG=' + s1(s.H)) + ', adj ' + t('=AC=' + fx(ac, 4)) + ' ' + t('\\Rightarrow') + ' TOA.<br>' + angWork(s1(s.H), fx(ac, 4), 'tan', A, 0, '\\angle GAC'), ['Work in ' + t('\\triangle ACG') + ', right-angled at ' + t('C') + '.'], 'angle with floor');
          } },
          { id: 'e20d', level: 'ADV', make: function (r, s) { var bg = Math.hypot(s.W, s.H), A = T.atan(bg / s.L), ac = Math.hypot(s.L, s.W);
            return near('Determine the angle the cable makes with the edge ' + t('AB') + ', ' + t('\\angle GAB') + ', to the nearest degree.', A, 0, '°', [{ v: T.atan(s.H / ac), code: 'trig-wrong-side', hint: 'That is ' + t('\\angle GAC') + ' (with the floor). ' + t('\\angle GAB') + ' is in ' + t('\\triangle ABG') + ', right-angled at ' + t('B') + ', with legs ' + t('AB') + ' and ' + t('BG') + '.' }, { v: T.atan(s.W / s.L), code: 'trig-wrong-side', hint: 'That is ' + t('\\angle CAB') + ', in the floor. The cable goes up to ' + t('G') + ': use ' + t('BG') + ', the diagonal of the end face.' }, { v: T.atan(s.H / s.L), code: 'trig-wrong-side', hint: t('BG') + ' is the diagonal of the end face, ' + t('\\sqrt{BC^2+CG^2}') + ', not just the height.' }].concat(angAlts(bg, s.L, 'tan', 0)),
              'Work in ' + t('\\triangle ABG') + ': ' + t('AB') + ' is perpendicular to the whole end face ' + t('BCGF') + ', so ' + t('AB\\perp BG') + '.<br>' + t('BG=\\sqrt{' + s1(s.W) + '^2+' + s1(s.H) + '^2}=' + fx(bg, 4)) + '<br>' + angWork(fx(bg, 4), s1(s.L), 'tan', A, 0, '\\angle GAB'), ['Which triangle contains both ' + t('AB') + ' and the cable ' + t('AG') + ' and has a right angle?'], 'angle with edge');
          } },
          { id: 'e20e', level: 'EMG', make: function (r, s) {
            return mcWhy(r, t('\\angle GAC') + ', ' + t('\\angle GAB') + ' and ' + t('\\angle CAB') + ' are all angles at ' + t('A') + '. Which statement is correct?', t('\\angle CAB') + ' is a turn across the floor, ' + t('\\angle GAC') + ' is a lift off the floor, and ' + t('\\angle GAB') + ' combines both — so ' + t('\\angle GAB') + ' is the largest.',
              [[t('\\angle GAB') + ' is the smallest, because ' + t('AB') + ' is the longest edge.', 'Going from ' + t('AB') + ' to the cable means turning across the floor <b>and</b> lifting up; the other two angles each do only one of those.'],
                ['All three are equal, because they are all made by the same cable.', t('\\angle CAB') + ' doesn’t even involve the cable. Each angle measures a different turn.'],
                [t('\\angle GAB=\\angle GAC+\\angle CAB') + ' exactly.', 'The turns are in different planes, so the angles don’t simply add — but ' + t('\\angle GAB') + ' is still the largest.']],
              t('\\angle CAB') + ' is horizontal (how far the cable’s shadow swings from ' + t('AB') + '); ' + t('\\angle GAC') + ' is vertical (how far the cable lifts off its shadow); ' + t('\\angle GAB') + ' combines both turns, so it is the largest. Each of the other two is a “shadow” of ' + t('\\angle GAB') + ' on one plane.', ['Compare: which angle needs both a sideways turn and a lift?'], 'three angles at A');
          } }] }
    ]

  });
})(window);
