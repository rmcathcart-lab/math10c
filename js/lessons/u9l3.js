/* Math 10C · Unit 9 · Lesson 3 — Finding a Missing Side Length in a Right Triangle (M4)
 * Assignment questions 1–14 (u9_L03.tex) and the Lesson 3 Extra Practice (u9_EP03.tex).
 * Every part is a generator: it keeps the booklet's idea (which ratio, unknown on top or underneath, figure or
 * description) and changes the numbers, the vertex names and the orientation of the triangle. The booklet's numbers are
 * one possible version. Wrong answers that match a classic slip (multiplied instead of divided, wrong ratio, radian mode,
 * rounded too early, …) get a targeted hint through K.P.near alternatives. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, TR = HW.trig;

  HW.addCodes({
    'mult-div': 'Multiplied instead of dividing (or divided instead of multiplying)',
    'wrong-ratio': 'Used the wrong trig ratio',
    radian: 'Calculator in radian mode',
    'round-early': 'Rounded an intermediate value too early',
    'hyp-short': 'Hypotenuse shorter than a leg',
    'leg-long': 'Leg longer than the hypotenuse',
    'other-angle': 'Named the sides from the other acute angle',
    'pyth-sub': 'Pythagoras: subtracted instead of adding',
    'pyth-add': 'Pythagoras: added instead of subtracting',
    'pyth-nosq': 'Pythagoras: added/subtracted the sides without squaring',
    'no-root': 'Forgot the square root',
    'skip-given': 'Didn’t use the value the question gave',
    'perim-part': 'Left a side out of the perimeter / total',
    'ratio-not-angle': 'Gave the ratio instead of the angle',
    units: 'Typed units in the box'
  });

  /* ---------- small helpers ---------- */
  var FN = { sin: '\\sin', cos: '\\cos', tan: '\\tan' }, RN = { sin: 'SOH', cos: 'CAH', tan: 'TOA' };
  var ROLE = { opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' };
  function roleW(q) { return '<b>' + ROLE[q] + '</b>' + (q === 'hyp' ? '' : ' side'); }
  var RADF = { sin: TR.radSin, cos: TR.radCos, tan: TR.radTan };
  function dg(d) { return d + '^\\circ'; }
  function ds(d) { return d + '°'; }
  function fx(x, dp) { return K.roundTo(x, dp).toFixed(dp); }
  function dots(x) { var v = Math.floor(Math.abs(x) * 1e5 + 1e-7) / 1e5; return (x < 0 ? '-' : '') + v.toFixed(5) + '\\ldots'; }
  function ut(unit) { return unit ? '\\ \\text{' + unit + '}' : ''; }
  function tenth(r, lo, hi) { return r.int(lo, hi) / 10; }
  function angle(r, lo, hi, avoid45) { var d; do { d = r.int(lo, hi); } while (avoid45 && d >= 44 && d <= 46); return d; }
  function ratioFor(a, b) { var s = [a, b].sort().join(); return s === 'hyp,opp' ? 'sin' : s === 'adj,hyp' ? 'cos' : 'tan'; }
  function onTop(f, u) { return u === 'opp' || (f === 'cos' && u === 'adj'); }
  var RAD_HINT = 'That is what a calculator in <b>radian</b> mode gives. Switch your calculator to <b>degree</b> mode (DEG) and redo it.';
  var TRIPLES = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I'], ['J', 'K', 'L'], ['K', 'L', 'M'], ['L', 'M', 'N'], ['P', 'Q', 'R'], ['R', 'S', 'T'], ['S', 'T', 'U'], ['U', 'V', 'W'], ['X', 'Y', 'Z']];
  /* random vertex names: ang = vertex of the given acute angle, rt = right angle, oth = the other acute vertex */
  function names3(r, fixed) { var s = fixed || r.pick(TRIPLES), p = r.shuffle(s.slice()); return { tri: s.join(''), ang: p[0], rt: p[1], oth: p[2] }; }
  function seg(a, b) { return a < b ? a + b : b + a; }
  function sideOf(n, role) { return role === 'opp' ? seg(n.rt, n.oth) : role === 'adj' ? seg(n.ang, n.rt) : seg(n.ang, n.oth); }
  function ang3(n, v) { var o = [n.ang, n.rt, n.oth].filter(function (q) { return q !== v; }).sort(); return o[0] + v + o[1]; }

  /* unit typed into the box -> nudge, not a wrong answer */
  function unitWrap(check) {
    return function (resp) {
      var s = String(resp == null ? '' : resp), bare = s.replace(/\\text\{[^}]*\}|\\mathrm\{[^}]*\}/g, '').replace(/\^?\{?\\circ\}?|°|\s*(cm|mm|km|m|in|ft|units|degrees?)\s*$/gi, '').trim();
      if (bare !== s.trim() && HW.parse.number(bare).ok) return form('units', 'Just the number — the unit is already shown after the box.');
      return check(resp);
    };
  }
  function nearPart(prompt, x, dp, opt, sol, hints, text) {
    var alts = (opt.alts || []).filter(function (a) { return isFinite(a.v) && K.roundTo(a.v, dp) !== K.roundTo(x, dp); });
    var p = K.P.near(prompt, x, dp, { unit: opt.unit, alts: alts, diag: opt.diag, nr: opt.nr }, sol, hints, text);
    var first = alts.filter(function (a) { return a.first; });
    p.check = unitWrap(first.length ? (function (base) { return function (resp) {
      var q = HW.parse.number(resp);
      for (var i = 0; q.ok && i < first.length; i++) if (Math.abs(q.value - K.roundTo(first[i].v, dp)) < 1e-9) return wrong(first[i].code, first[i].hint);
      return base(resp); }; })(p.check) : p.check);
    var seen = {}; p.bad = [];
    alts.forEach(function (a) { var s = fx(a.v, dp); if (!seen[s] && a.v >= 0) { seen[s] = 1; p.bad.push(s); } });
    return p;
  }

  /* ---------- the core: one side from one side and one acute angle ----------
   * o = { deg, k, kStr, kRole, uRole ('opp'|'adj'|'hyp'), kName (tex, optional), uName (tex), unit, dp,
   *       angTex (how the angle is named, default '47^\circ'), alts (problem-specific, checked first) } */
  function solveSide(o) {
    var f = ratioFor(o.kRole, o.uRole), top = onTop(f, o.uRole), d = o.deg, fv = TR[f](d);
    var x = top ? o.k * fv : o.k / fv, D = dg(d), Fd = FN[f] + ' ' + D, u = o.uName, kv = o.kStr, dp = o.dp;
    var kDesc = o.kName ? t(o.kName + '=' + kv) : 'the ' + t(kv + ut(o.unit)) + ' side';
    var angW = o.angTex ? t(o.angTex) : t(D);
    var lim = 1.5 * Math.pow(10, -dp), auto = [];
    var flip = top ? o.k / fv : o.k * fv, sense = '';
    if (o.uRole === 'hyp' && flip <= o.k) sense = ' (Notice your answer is shorter than the leg ' + t(kv) + ' — impossible for a hypotenuse.)';
    if (o.uRole !== 'hyp' && o.kRole === 'hyp' && flip >= o.k) sense = ' (Notice your answer is longer than the hypotenuse ' + t(kv) + ' — impossible for a leg.)';
    auto.push({ v: flip, code: 'mult-div', hint: top
      ? 'You divided by ' + t(Fd) + '. Relative to ' + angW + ', ' + t(u) + ' is the ' + roleW(o.uRole) + ', which sits on <b>top</b> of ' + t(FN[f]) + '. An unknown on top is freed by <b>multiplying</b> by the known side.' + sense
      : 'You multiplied by ' + t(Fd) + '. But ' + t(u) + ' is the ' + roleW(o.uRole) + ', which sits in the <b>denominator</b> of ' + t(FN[f]) + '. Cross-multiply, then <b>divide</b> the known side by ' + t(Fd) + '.' + sense });
    ['sin', 'cos', 'tan'].forEach(function (g) {
      if (g === f) return; var gv = TR[g](d);
      auto.push({ v: top ? o.k * gv : o.k / gv, code: 'wrong-ratio', hint: 'That answer uses ' + t(FN[g] + ' ' + D) + '. Relative to ' + angW + ', ' + kDesc + ' is the ' + roleW(o.kRole) + ' and ' + t(u) + ' is the ' + roleW(o.uRole) + '. Which of SOH, CAH, TOA holds those two sides?' });
    });
    var rv = RADF[f](d); auto.push({ v: top ? o.k * rv : o.k / rv, code: 'radian', hint: RAD_HINT });
    auto = auto.filter(function (a) { return Math.abs(a.v - x) > lim; });
    var alts = (o.alts || []).concat(auto);
    var lines = top
      ? [Fd + '=\\dfrac{' + u + '}{' + kv + '}', u + '=' + kv + FN[f] + ' ' + D + '=' + dots(x) + '\\approx ' + fx(x, dp) + ut(o.unit)]
      : [Fd + '=\\dfrac{' + kv + '}{' + u + '}', u + FN[f] + ' ' + D + '=' + kv, u + '=\\dfrac{' + kv + '}{' + Fd + '}=' + dots(x) + '\\approx ' + fx(x, dp) + ut(o.unit)];
    var sol = 'Relative to ' + angW + ': ' + kDesc + ' is the ' + roleW(o.kRole) + ' and ' + t(u) + ' is the ' + roleW(o.uRole) + ' ' + t('\\Rightarrow') + ' <b>' + RN[f] + '</b>, with the unknown ' + (top ? 'on <b>top</b> (multiply).' : '<b>underneath</b> (cross-multiply, then divide).') + '<br>' + lines.map(t).join('<br>');
    var diag = function (v) {
      if (o.uRole === 'hyp' && v <= o.k) return { code: 'hyp-short', hint: 'The hypotenuse is the longest side, so ' + t(u) + ' must be longer than ' + t(kv) + '. Check the ratio and whether to multiply or divide.' };
      if (o.kRole === 'hyp' && v >= o.k) return { code: 'leg-long', hint: t(u) + ' is a leg, so it must be shorter than the hypotenuse ' + t(kv) + '. Check the ratio and whether to multiply or divide.' };
      return null;
    };
    var hints = ['Name the sides relative to ' + angW + ': which side is opposite it, which is adjacent to it, and which is the hypotenuse?',
      'Choose the ratio that holds ' + kDesc + ' and ' + t(u) + '. Is ' + t(u) + ' on top of the ratio (multiply) or underneath (divide)?'];
    return { x: x, f: f, top: top, alts: alts, sol: sol, diag: diag, hints: hints, Fd: Fd };
  }
  function sidePart(o) {
    var s = solveSide(o);
    var p = nearPart(o.prompt, s.x, o.dp, { unit: o.unit, alts: s.alts, diag: s.diag, nr: o.nr }, (o.solPre || '') + s.sol + (o.solPost || ''), o.hints || s.hints, o.text);
    return p;
  }

  /* ---------- Pythagorean theorem: o = { find: 'hyp'|'leg', a, b (legs) | c, b (hyp, leg), strs, uName, unit, dp } ---------- */
  function pythPart(o) {
    var x, alts, sol, dp = o.dp, u = o.uName;
    if (o.find === 'hyp') {
      var A = o.a, B = o.b, s2 = A * A + B * B; x = Math.sqrt(s2);
      alts = [{ v: Math.sqrt(Math.abs(A * A - B * B)), code: 'pyth-sub', hint: t(u) + ' is across from the right angle — it is the <b>hypotenuse</b>, so <b>add</b> the squares of the two legs.' },
        { v: A + B, code: 'pyth-nosq', hint: 'Square each leg first, add the squares, and then take the square root.' },
        { v: s2, code: 'no-root', hint: 'That is ' + t(u + '^2') + '. Take the square root to get ' + t(u) + '.' }];
      sol = 'Two legs are known and no acute angle ' + t('\\Rightarrow') + ' <b>Pythagorean theorem</b>; ' + t(u) + ' is the hypotenuse.<br>' +
        t(u + '=\\sqrt{' + o.aStr + '^2+' + o.bStr + '^2}=\\sqrt{' + fx(A * A, 4).replace(/\.?0+$/, '') + '+' + fx(B * B, 4).replace(/\.?0+$/, '') + '}=\\sqrt{' + fx(s2, 4).replace(/\.?0+$/, '') + '}=' + dots(x) + '\\approx ' + fx(x, dp) + ut(o.unit));
    } else {
      var C = o.c, L = o.b, d2 = C * C - L * L; x = Math.sqrt(d2);
      alts = [{ v: Math.sqrt(C * C + L * L), code: 'pyth-add', hint: t(u) + ' is a <b>leg</b>; the hypotenuse is ' + t(o.cStr) + '. Subtract: ' + t(u + '^2=' + o.cStr + '^2-' + o.bStr + '^2') + '.' },
        { v: C - L, code: 'pyth-nosq', hint: 'Square the sides first, subtract the squares, and then take the square root.' },
        { v: d2, code: 'no-root', hint: 'That is ' + t(u + '^2') + '. Take the square root to get ' + t(u) + '.' }];
      sol = 'A leg and the hypotenuse are known, with no acute angle ' + t('\\Rightarrow') + ' <b>Pythagorean theorem</b>.<br>' +
        t(u + '=\\sqrt{' + o.cStr + '^2-' + o.bStr + '^2}=\\sqrt{' + fx(C * C, 4).replace(/\.?0+$/, '') + '-' + fx(L * L, 4).replace(/\.?0+$/, '') + '}=\\sqrt{' + fx(d2, 4).replace(/\.?0+$/, '') + '}=' + dots(x) + '\\approx ' + fx(x, dp) + ut(o.unit));
    }
    var diag = function (v) {
      if (o.find === 'leg' && v >= o.c) return { code: 'leg-long', hint: t(u) + ' is a leg, so it must be shorter than the hypotenuse ' + t(o.cStr) + '.' };
      if (o.find === 'hyp' && v <= Math.max(o.a, o.b)) return { code: 'hyp-short', hint: 'The hypotenuse must be longer than both legs.' };
      return null;
    };
    return nearPart(o.prompt, x, dp, { unit: o.unit, alts: alts, diag: diag }, sol,
      ['Two sides and no acute angle: use ' + t('c^2=a^2+b^2') + ', where ' + t('c') + ' is the side across from the right angle.', o.find === 'hyp' ? 'Is ' + t(u) + ' the hypotenuse or a leg? Add the squares for the hypotenuse.' : 'Is ' + t(u) + ' the hypotenuse or a leg? For a leg, subtract the squares.'], o.text);
  }

  /* ---------- figures ---------- */
  /* plain right triangle; n = names3 object or null (no vertex names); lab = { opp, adj, hyp } relative to the given angle */
  function triFig(r, deg, lab, n, opt) {
    opt = opt || {};
    var at = opt.at || r.pick(['A', 'B']), tn = Math.tan(deg * Math.PI / 180), w, h;
    if (at === 'A') { w = 4; h = 4 * tn; } else { h = 4; w = 4 * tn; }
    var m = Math.max(w, h); w = w * 4 / m; h = h * 4 / m;
    var nm = n ? (at === 'A' ? [n.ang, n.oth, n.rt] : [n.oth, n.ang, n.rt]) : (at === 'A' ? ['P', 'Q', 'R'] : ['Q', 'P', 'R']);
    var sides = {}; lab = lab || {};
    if (at === 'A') { sides.a = lab.opp; sides.b = lab.adj; } else { sides.b = lab.opp; sides.a = lab.adj; }
    sides.c = lab.hyp;
    var angles = {}; if (!opt.noAngle) angles[at] = opt.angLabel || ds(deg);
    return '<div class="fig">' + HW.tri({ w: w, h: h, names: nm, sides: sides, angles: angles, rot: opt.rot != null ? opt.rot : r.int(0, 3), flip: opt.flip != null ? opt.flip : r.chance(0.5), hideNames: !n, width: opt.width || 250, aria: 'right triangle' }) + '</div>';
  }
  /* right triangle turned through an arbitrary angle (Extra practice 5) */
  function rotFig(r, deg, lab, n) {
    var tn = Math.tan(deg * Math.PI / 180), La = 4 / Math.max(1, tn), Lo = La * tn;
    var raw = {}; raw[n.ang] = [La, 0]; raw[n.rt] = [0, 0]; raw[n.oth] = [0, Lo];
    var phi = (r.int(18, 72) + 90 * r.int(0, 3)) * Math.PI / 180, fl = r.chance(0.5), pts = {};
    Object.keys(raw).forEach(function (k) { var x = raw[k][0] * (fl ? -1 : 1), y = raw[k][1]; pts[k] = [x * Math.cos(phi) - y * Math.sin(phi), x * Math.sin(phi) + y * Math.cos(phi)]; });
    return '<div class="fig">' + HW.fig({ pts: pts, segs: [[n.ang, n.rt, lab.adj], [n.rt, n.oth, lab.opp], [n.ang, n.oth, lab.hyp]], right: [[n.rt, n.ang, n.oth]], angles: [[n.ang, n.rt, n.oth, ds(deg)]], width: 250, aria: 'rotated right triangle' }) + '</div>';
  }
  function mir(pts, on) { if (!on) return pts; var o = {}; Object.keys(pts).forEach(function (k) { o[k] = [-pts[k][0], pts[k][1]]; }); return o; }
  function fig(spec) { return '<div class="fig">' + HW.fig(spec) + '</div>'; }
  /* kite on a string: string from the ground point G up to the kite K, dashed height h */
  function kiteFig(r, deg, Ltxt, hTxt) {
    var d = 4, h = 4 * Math.tan(deg * Math.PI / 180), s = 0.13 * Math.max(h, 2.5);
    var pts = mir({ G: [d, 0], K: [0, h], F: [0, 0], k1: [-0.45 * s, h + 0.55 * s], k2: [0, h + 1.4 * s], k3: [0.45 * s, h + 0.55 * s] }, r.chance(0.5));
    return fig({ pts: pts, names: false, segs: [['G', 'K', Ltxt], ['K', 'F', hTxt || 'h', { dash: 1, width: 1.6 }], ['F', 'G'], ['K', 'k1', { width: 1.6 }], ['k1', 'k2', { width: 1.6 }], ['k2', 'k3', { width: 1.6 }], ['k3', 'K', { width: 1.6 }]],
      fill: [['K', 'k1', 'k2', 'k3']], right: [['F', 'G', 'K']], angles: [['G', 'F', 'K', ds(deg)]], extra: [{ type: 'ground', y: 0, x0: Math.min(0, pts.G[0]) - 0.4, x1: Math.max(0, pts.G[0]) + 0.4 }], width: 250, aria: 'kite string diagram' });
  }
  /* pole of height h at distance d from P, line of sight dashed */
  function poleFig(r, deg, dTxt, hTxt, opt) {
    opt = opt || {};
    var d = 4, h = 4 * Math.tan(deg * Math.PI / 180), fw = 0.22 * Math.max(h, 2);
    var pts = mir({ P: [0, 0], B: [d, 0], T: [d, h], f1: [d + fw, h - 0.3 * fw], f2: [d, h - 0.6 * fw] }, r.chance(0.5));
    var segs = [['P', 'B', dTxt], ['B', 'T', hTxt, { width: 4 }], ['P', 'T', { dash: 1, width: 1.6 }]];
    if (opt.flag !== false) segs.push(['T', 'f1', { width: 1.4 }], ['f1', 'f2', { width: 1.4 }]);
    return fig({ pts: pts, names: false, segs: segs, fill: opt.flag !== false ? [['T', 'f1', 'f2']] : undefined, right: [['B', 'P', 'T']], angles: [['P', 'B', 'T', ds(deg)]],
      extra: [{ type: 'ground', y: 0, x0: Math.min(pts.P[0], pts.B[0]) - 0.4, x1: Math.max(pts.P[0], pts.B[0]) + 0.4 }], width: 250, aria: opt.aria || 'flagpole diagram' });
  }
  /* guy wire from anchor A to a point W on a pole */
  function wireFig(r, deg, Ltxt, hTxt, dTxt) {
    var d = 2, h = 2 * Math.tan(deg * Math.PI / 180);
    var pts = mir({ B: [0, 0], A: [d, 0], W: [0, h], Tp: [0, h * 1.14] }, r.chance(0.5));
    return fig({ pts: pts, names: false, segs: [['B', 'W', hTxt, { width: 4 }], ['W', 'Tp', { width: 4 }], ['A', 'W', Ltxt], ['B', 'A', dTxt]], right: [['B', 'A', 'W']], angles: [['A', 'B', 'W', ds(deg)]],
      extra: [{ type: 'ground', y: 0, x0: Math.min(0, pts.A[0]) - 0.4, x1: Math.max(0, pts.A[0]) + 0.4 }], width: 230, aria: 'guy wire diagram' });
  }

  /* ---------- description problems (no diagram): names, known side, unknown side ---------- */
  function descSetup(r, cfg) {
    var n = names3(r, cfg.fixed), deg = angle(r, cfg.deg[0], cfg.deg[1], cfg.avoid45), k = cfg.k[2] === 0 ? r.int(cfg.k[0], cfg.k[1]) : tenth(r, cfg.k[0], cfg.k[1]);
    var kStr = cfg.k[2] === 0 ? String(k) : k.toFixed(1), kS = sideOf(n, cfg.kRole), uS = sideOf(n, cfg.uRole);
    return { n: n, deg: deg, k: k, kStr: kStr, kS: kS, uS: uS };
  }
  function descSketch(r, s, cfg, unit) {
    var lab = {}; lab[cfg.kRole] = s.kStr + (unit ? ' ' + unit : ''); lab[cfg.uRole] = s.uS;
    return triFig(r, s.deg, lab, s.n, { width: 200 });
  }

  /* ---------- multiple choice ---------- */
  var mc = K.P.mc;

  /* ---------- question-specific shared setups ---------- */
  function q4Setup(r) {
    for (var i = 0; i < 300; i++) {
      var L = tenth(r, 60, 140), deg = r.int(55, 72), h = L * TR.sin(deg), hR = K.roundTo(h, 1), d = L * TR.cos(deg), dP = Math.sqrt(L * L - hR * hR);
      if (K.roundTo(d, 1) !== K.roundTo(dP, 1)) return { L: L, deg: deg, h: h, hR: hR, d: d, dP: dP };
    }
    return { L: 9.6, deg: 61, h: 9.6 * TR.sin(61), hR: 8.4, d: 9.6 * TR.cos(61), dP: Math.sqrt(9.6 * 9.6 - 8.4 * 8.4) };
  }
  function e7Setup(r) {
    for (var i = 0; i < 300; i++) {
      var deg = angle(r, 30, 55, true), k = tenth(r, 100, 250), hyp = k / TR.cos(deg), hR = K.roundTo(hyp, 1), bc = k * TR.tan(deg), sage = hR * TR.sin(deg);
      if (K.roundTo(bc, 1) !== K.roundTo(sage, 1)) return { deg: deg, k: k, hyp: hyp, hR: hR, bc: bc, sage: sage, n: names3(r) };
    }
    return { deg: 40, k: 17.2, hyp: 17.2 / TR.cos(40), hR: 22.5, bc: 17.2 * TR.tan(40), sage: 22.5 * TR.sin(40), n: { tri: 'ABC', ang: 'A', rt: 'C', oth: 'B' } };
  }
  function e13Setup(r) {
    for (var i = 0; i < 300; i++) {
      var deg = angle(r, 40, 65, true), k = tenth(r, 60, 120), hyp = k / TR.cos(deg), hR = K.roundTo(hyp, 1), qr1 = Math.sqrt(hR * hR - k * k), qr2 = k * TR.tan(deg);
      if (K.roundTo(qr1, 1) === K.roundTo(qr2, 1) && Math.abs(qr1 - qr2) > 0.004) return { deg: deg, k: k, hyp: hyp, hR: hR, qr1: qr1, qr2: qr2, n: names3(r) };
    }
    return { deg: 55, k: 9.6, hyp: 9.6 / TR.cos(55), hR: 16.7, qr1: Math.sqrt(16.7 * 16.7 - 92.16), qr2: 9.6 * TR.tan(55), n: { tri: 'PQR', ang: 'P', rt: 'Q', oth: 'R' } };
  }

  /* Question 7 option set: which piece of information is missing */
  function q7Part(r, which, sh) {
    var why = {
      a: { side: null, right: 'Look for the small square: this triangle <i>does</i> have a right angle. What is missing?', acute: 'An acute angle <i>is</i> given (' + t(dg(sh.a)) + '). What is missing?' },
      b: { side: 'A side <i>is</i> given (' + t(sh.bS + '\\text{ cm}') + '). Look at the corners — is any of them a right angle?', right: null, acute: 'An acute angle <i>is</i> given (' + t(dg(sh.bA)) + '). Look at the corners — is any of them ' + t('90^\\circ') + '?' },
      c: { side: 'Two sides are given (' + t(sh.cL + '\\text{ and }' + sh.cH) + '). Look for an angle.', right: 'There <i>is</i> a right-angle box. What is missing is an acute angle.', acute: null }
    }[which];
    var opts = [
      { html: 'No side length is given, so there is nothing to multiply or divide by.', right: which === 'a', why: why.side },
      { html: 'The triangle has no right angle, so sine, cosine and tangent do not apply.', right: which === 'b', why: why.right },
      { html: 'No acute angle is given — with two sides known, use the Pythagorean theorem instead.', right: which === 'c', why: why.acute },
      { html: 'The unknown is the hypotenuse, and trigonometric ratios cannot find a hypotenuse.', why: 'Trig ratios <i>can</i> find a hypotenuse: divide the known side by ' + t('\\sin') + ' or ' + t('\\cos') + ' (Example 4). Look for what is missing.' }];
    var sol = which === 'a' ? 'An angle is given but <b>no side length is</b>. Every trig ratio relates the unknown side to a <i>known</i> side, so there is nothing to multiply or divide by — infinitely many right triangles have a ' + t(dg(sh.a)) + ' angle.'
      : which === 'b' ? 'There is <b>no right angle</b> in this triangle. Sine, cosine and tangent are defined with opposite, adjacent and hypotenuse <i>in a right triangle</i>, so they cannot be used here.'
        : '<b>No acute angle is given</b> — only the leg ' + t(sh.cL) + ' and the hypotenuse ' + t(sh.cH) + '. With two sides and no angle, use the Pythagorean theorem: ' + t('x=\\sqrt{' + sh.cH + '^2-' + sh.cL + '^2}=' + sh.cX);
    var f = which === 'a' ? triFig(r, sh.a, { opp: 'x' }, null) : which === 'b' ? sh.bFig : triFig(r, sh.cDeg, { hyp: sh.cH, adj: sh.cL, opp: 'x' }, null, { noAngle: true });
    return mc(r, f + 'Why can’t trigonometric ratios be used to calculate ' + t('x') + '?', opts, sol, ['A trig ratio needs a <b>right triangle</b>, one <b>acute angle</b>, and one <b>known side</b>. Which of these is missing?'], 'why no trig (' + which + ')');
  }
  function q7Shared(r) {
    var a = r.int(35, 65);
    // (b) a triangle with no right angle: angle at A, side AB, every angle between 35° and 80°
    var bA, bS, B, C, ang;
    for (var i = 0; i < 200; i++) {
      bA = r.int(40, 60); var L = 4, s = L * (r.int(60, 85) / 100);
      B = [L, 0]; C = [s * Math.cos(bA * Math.PI / 180), s * Math.sin(bA * Math.PI / 180)];
      var angB = Math.atan2(C[1], L - C[0]) * 180 / Math.PI, angC = 180 - bA - angB;
      ang = [angB, angC]; if (angB >= 35 && angB <= 78 && angC >= 35 && angC <= 78) break;
    }
    bS = tenth(r, 50, 99).toFixed(1);
    var fl = r.chance(0.5), pts = mir({ A: [0, 0], B: B, C: C }, fl);
    var bFig = fig({ pts: pts, names: false, segs: [['A', 'B', bS + ' cm'], ['B', 'C'], ['A', 'C', 'x']], angles: [['A', 'B', 'C', ds(bA)]], width: 250, aria: 'triangle with no right angle' });
    var trip = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [3, 4, 5]]), m = trip[0] === 3 ? r.pick([2, 3, 4]) : 1;
    var cL = (trip[0] * m).toFixed(1), cX = (trip[1] * m).toFixed(1), cH = (trip[2] * m).toFixed(1), cDeg = Math.round(Math.atan(trip[1] / trip[0]) * 180 / Math.PI);
    if (r.chance(0.5) && trip[0] === 3) { cL = (trip[1] * m).toFixed(1); cX = (trip[0] * m).toFixed(1); cDeg = 90 - cDeg; }
    return { a: a, bA: bA, bS: bS, bFig: bFig, cL: cL, cX: cX, cH: cH, cDeg: cDeg };
  }

  /* e8 sketch options */
  function ladderSketch(variant, deg, hTxt) {
    var d = 1.7, h = 2.6, pts = { W: [0, 0], T: [0, h], F: [d, 0] }; // a sketch, not to scale
    var segs = [['W', 'T', variant === 'Lwall' ? 'L' : variant === 'hground' ? '' : hTxt, { width: 3.5 }], ['W', 'F', variant === 'hground' ? hTxt : ''], ['F', 'T', variant === 'Lwall' ? hTxt : 'L']];
    segs = segs.map(function (s) { return s[2] === '' ? [s[0], s[1], s[3]] : s; });
    var angles = variant === 'top' ? [['T', 'W', 'F', ds(deg)]] : [['F', 'W', 'T', ds(deg)]];
    return HW.fig({ pts: pts, names: false, segs: segs, right: [['W', 'F', 'T']], angles: angles, width: 200, height: 165, pad: 40, extra: [{ type: 'ground', y: 0, x0: -0.2, x1: d + 0.3 }], aria: 'ladder sketch' });
  }

  HW.defineLesson({
    id: 'u9l3', unit: 9, num: '3', title: 'Finding a Missing Side Length in a Right Triangle', outcome: 'M4',
    blurb: 'Name the sides relative to the given angle, choose the ratio that holds the known side and the unknown, then multiply (unknown on top) or divide (unknown underneath).',
    questions: [
      /* ---------------- Question 1 ---------------- */
      { num: '1', section: 'Assignment', stem: 'Calculate, to the nearest tenth, the length of the indicated side in the triangle.', parts: [
        { id: '1a', level: 'BEG', make: function (r) {
          var deg = r.int(35, 65), k = tenth(r, 85, 190), ks = k.toFixed(1);
          return sidePart({ prompt: triFig(r, deg, { hyp: ks + ' cm', opp: 'a' }, null) + 'Find ' + t('a') + '.', deg: deg, k: k, kStr: ks, kRole: 'hyp', uRole: 'opp', uName: 'a', unit: 'cm', dp: 1, text: 'a = ' + ks + ' sin ' + deg });
        } },
        { id: '1b', level: 'BEG', make: function (r) {
          var a = tenth(r, 50, 120), b; do { b = tenth(r, 50, 120); } while (Math.abs(a - b) < 1);
          return pythPart({ prompt: triFig(r, Math.atan(b / a) * 180 / Math.PI, { adj: a.toFixed(1) + ' cm', opp: b.toFixed(1) + ' cm', hyp: 'b' }, null, { noAngle: true }) + 'Find ' + t('b') + '.', find: 'hyp', a: a, b: b, aStr: a.toFixed(1), bStr: b.toFixed(1), uName: 'b', unit: 'cm', dp: 1, text: 'hyp from legs ' + a + ', ' + b });
        } },
        { id: '1c', level: 'BEG', make: function (r) {
          var deg = r.int(22, 38), k = tenth(r, 100, 190), ks = k.toFixed(1);
          return sidePart({ prompt: triFig(r, deg, { adj: ks + ' cm', opp: 'c' }, null) + 'Find ' + t('c') + '.', deg: deg, k: k, kStr: ks, kRole: 'adj', uRole: 'opp', uName: 'c', unit: 'cm', dp: 1, text: 'c = ' + ks + ' tan ' + deg });
        } },
        { id: '1d', level: 'BEG', make: function (r) {
          var L = tenth(r, 60, 130), c = Math.round((L + tenth(r, 35, 90)) * 10) / 10;
          return pythPart({ prompt: triFig(r, Math.acos(L / c) * 180 / Math.PI, { adj: L.toFixed(1) + ' cm', hyp: c.toFixed(1) + ' cm', opp: 'd' }, null, { noAngle: true }) + 'Find ' + t('d') + '.', find: 'leg', c: c, b: L, cStr: c.toFixed(1), bStr: L.toFixed(1), uName: 'd', unit: 'cm', dp: 1, text: 'leg from hyp ' + c + ', leg ' + L });
        } },
        { id: '1e', level: 'EMG', make: function (r) {
          var deg = r.int(40, 70), k = tenth(r, 40, 95), ks = k.toFixed(1);
          return sidePart({ prompt: triFig(r, deg, { opp: ks + ' cm', hyp: 'e' }, null) + 'Find ' + t('e') + '.', deg: deg, k: k, kStr: ks, kRole: 'opp', uRole: 'hyp', uName: 'e', unit: 'cm', dp: 1, text: 'e = ' + ks + ' / sin ' + deg });
        } },
        { id: '1f', level: 'BEG', make: function (r) {
          var deg = r.int(30, 55), k = tenth(r, 150, 300), ks = k.toFixed(1);
          return sidePart({ prompt: triFig(r, deg, { hyp: ks + ' cm', adj: 'f' }, null) + 'Find ' + t('f') + '.', deg: deg, k: k, kStr: ks, kRole: 'hyp', uRole: 'adj', uName: 'f', unit: 'cm', dp: 1, text: 'f = ' + ks + ' cos ' + deg });
        } }] },
      /* ---------------- Question 2 ---------------- */
      { num: '2', stem: 'A kite string makes an angle with the level ground.', parts: [
        { id: '2', level: 'BEG', make: function (r) {
          var deg = r.int(28, 55), L = r.int(40, 90);
          return sidePart({ prompt: kiteFig(r, deg, L + ' m') + 'The string of a kite is ' + t(L + '\\text{ m}') + ' long and makes an angle of ' + t(dg(deg)) + ' with the ground. Calculate, to the nearest metre, the vertical height, ' + t('h') + ', of the kite above the ground.',
            deg: deg, k: L, kStr: String(L), kRole: 'hyp', uRole: 'opp', uName: 'h', unit: 'm', dp: 0, text: 'kite h = ' + L + ' sin ' + deg });
        } }] },
      /* ---------------- Question 3 ---------------- */
      { num: '3', stem: 'Use the measurements in the diagram to determine the height of the flagpole to the nearest tenth of a metre.', parts: [
        { id: '3', level: 'BEG', make: function (r) {
          var deg = angle(r, 35, 62, true), d = tenth(r, 45, 120), dS = d.toFixed(1);
          return sidePart({ prompt: poleFig(r, deg, dS + ' m', 'h') + 'Find the height ' + t('h') + ' of the flagpole.', deg: deg, k: d, kStr: dS, kRole: 'adj', uRole: 'opp', uName: 'h', unit: 'm', dp: 1, text: 'flagpole h = ' + dS + ' tan ' + deg });
        } }] },
      /* ---------------- Question 4 ---------------- */
      { num: '4', shared: q4Setup,
        stem: function (sh) { return 'A guy wire ' + t(sh.L.toFixed(1) + '\\text{ m}') + ' long is attached to a pole and anchored to the ground, making an angle of ' + t(dg(sh.deg)) + ' with the ground.' + wireFig(HW.rng(Math.round(sh.L * 1000 + sh.deg)), sh.deg, sh.L.toFixed(1) + ' m', 'h', 'd'); },
        parts: [
          { id: '4a', level: 'BEG', make: function (r, sh) {
            var Ls = sh.L.toFixed(1);
            return sidePart({ prompt: 'How high up the pole, ' + t('h') + ', to the nearest tenth of a metre, does the wire attach?', deg: sh.deg, k: sh.L, kStr: Ls, kRole: 'hyp', uRole: 'opp', uName: 'h', unit: 'm', dp: 1, angTex: dg(sh.deg), text: 'guy wire h = ' + Ls + ' sin ' + sh.deg });
          } },
          { id: '4b', level: 'BEG', make: function (r, sh) {
            var Ls = sh.L.toFixed(1);
            return sidePart({ prompt: 'Use trigonometry to determine, to the nearest tenth of a metre, the distance ' + t('d') + ' between the base of the pole and the point where the wire is anchored.', deg: sh.deg, k: sh.L, kStr: Ls, kRole: 'hyp', uRole: 'adj', uName: 'd', unit: 'm', dp: 1, text: 'guy wire d = ' + Ls + ' cos ' + sh.deg });
          } },
          { id: '4c', level: 'EMG', make: function (r, sh) {
            var Ls = sh.L.toFixed(1), hs = sh.hR.toFixed(1), d2 = sh.L * sh.L - sh.hR * sh.hR;
            var p = nearPart('The height up the pole, found with trigonometry and rounded to the nearest tenth, is ' + t('h=' + hs + '\\text{ m}') + '. Use this rounded value and the Pythagorean theorem to determine ' + t('d') + ' again, to the nearest tenth of a metre.', sh.dP, 1,
              { unit: 'm', alts: [{ v: sh.d, code: 'skip-given', first: true, hint: 'That is the trigonometry answer, ' + t('d=' + Ls + '\\cos ' + dg(sh.deg)) + '. This part starts from the <b>rounded</b> height ' + t(hs + '\\text{ m}') + ' and uses the Pythagorean theorem.' },
                { v: Math.sqrt(sh.L * sh.L + sh.hR * sh.hR), code: 'pyth-add', hint: t('d') + ' is a leg; the wire (' + t(Ls) + ') is the hypotenuse. Subtract the squares: ' + t('d^2=' + Ls + '^2-' + hs + '^2') + '.' },
                { v: sh.L - sh.hR, code: 'pyth-nosq', hint: 'Square the sides first, subtract the squares, then take the square root.' },
                { v: d2, code: 'no-root', hint: 'That is ' + t('d^2') + '. Take the square root.' }],
                diag: function (v) { return v >= sh.L ? { code: 'leg-long', hint: t('d') + ' is a leg, so it must be shorter than the wire.' } : null; } },
              'Using the <b>rounded</b> ' + t('h=' + hs) + ':<br>' + t('d=\\sqrt{' + Ls + '^2-' + hs + '^2}=\\sqrt{' + fx(sh.L * sh.L, 2) + '-' + fx(sh.hR * sh.hR, 2) + '}=\\sqrt{' + fx(d2, 2) + '}=' + dots(sh.dP) + '\\approx ' + fx(sh.dP, 1) + '\\text{ m}'),
              ['The wire is the hypotenuse and ' + t('h') + ' is a leg, so ' + t('d^2=\\text{wire}^2-h^2') + '.'], 'guy wire d by Pythagoras (rounded h)');
            return p;
          } },
          { id: '4d', level: 'EMG', make: function (r, sh) {
            var Ls = sh.L.toFixed(1), hs = sh.hR.toFixed(1);
            return mc(r, 'Trigonometry gave ' + t('d\\approx ' + fx(sh.d, 1) + '\\text{ m}') + ', but the Pythagorean theorem with ' + t('h=' + hs) + ' gave ' + t('d\\approx ' + fx(sh.dP, 1) + '\\text{ m}') + '. Why are the answers not exactly the same?', [
              { html: 'The Pythagorean calculation starts from the <b>rounded</b> height ' + t(hs + '\\text{ m}') + ', and that rounding error carries through. The trig calculation uses only the given ' + t(Ls + '\\text{ m}') + ' and ' + t(dg(sh.deg)) + '.', right: true },
              { html: 'One of the two calculations contains an arithmetic mistake.', why: 'Both calculations are done correctly. Look at which numbers each one starts from.' },
              { html: 'The Pythagorean theorem only gives approximate answers; trigonometry is exact.', why: 'The Pythagorean theorem is exact for every right triangle. The difference comes from the number that was put into it.' },
              { html: 'Cosine should not be used for a distance along the ground.', why: 'Cosine is exactly right: the ground distance is adjacent to the angle and the wire is the hypotenuse.' }],
              'The trig answer uses only the two <b>given</b> values, ' + t(Ls + '\\text{ m}') + ' and ' + t(dg(sh.deg)) + '. The Pythagorean answer starts from ' + t('h') + ' already rounded to ' + t(hs) + '; that small error is carried (and amplified by the subtraction under the root) into ' + t('d') + '. With the unrounded ' + t('h=' + dots(sh.h)) + ', the Pythagorean theorem gives ' + t(dots(sh.d)) + ', which agrees with the trig answer.',
              ['Which calculation uses a number that was already rounded?'], 'why (b) and (c) differ');
          } }] },
      /* ---------------- Question 5 ---------------- */
      { num: '5', stem: 'Calculate, to the nearest tenth, the length of the indicated side in the triangle.', parts: [
        { id: '5a', level: 'BEG', make: function (r) {
          var deg = r.int(55, 75), k = tenth(r, 80, 150), ks = k.toFixed(1);
          return sidePart({ prompt: triFig(r, deg, { hyp: ks + ' cm', opp: 'a' }, null) + 'Find ' + t('a') + '.', deg: deg, k: k, kStr: ks, kRole: 'hyp', uRole: 'opp', uName: 'a', unit: 'cm', dp: 1, text: 'a = ' + ks + ' sin ' + deg });
        } },
        { id: '5b', level: 'BEG', make: function (r) {
          var a = tenth(r, 70, 100), b = tenth(r, 40, 65);
          return pythPart({ prompt: triFig(r, Math.atan(b / a) * 180 / Math.PI, { adj: a.toFixed(1) + ' mm', opp: b.toFixed(1) + ' mm', hyp: 'b' }, null, { noAngle: true }) + 'Find ' + t('b') + '.', find: 'hyp', a: a, b: b, aStr: a.toFixed(1), bStr: b.toFixed(1), uName: 'b', unit: 'mm', dp: 1, text: 'hyp from legs ' + a + ', ' + b + ' mm' });
        } },
        { id: '5c', level: 'EMG', make: function (r) {
          var deg = r.int(16, 30), k = r.int(35, 70);
          return sidePart({ prompt: triFig(r, deg, { opp: k + ' in', hyp: 'c' }, null) + 'Find ' + t('c') + '.', deg: deg, k: k, kStr: String(k), kRole: 'opp', uRole: 'hyp', uName: 'c', unit: 'in', dp: 1, text: 'c = ' + k + ' / sin ' + deg });
        } },
        { id: '5d', level: 'BEG', make: function (r) {
          var deg = r.int(35, 55), k = tenth(r, 50, 99), ks = k.toFixed(1);
          return sidePart({ prompt: triFig(r, deg, { hyp: ks + ' ft', adj: 'd' }, null) + 'Find ' + t('d') + '.', deg: deg, k: k, kStr: ks, kRole: 'hyp', uRole: 'adj', uName: 'd', unit: 'ft', dp: 1, text: 'd = ' + ks + ' cos ' + deg });
        } }] },
      /* ---------------- Question 6 ---------------- */
      { num: '6', stem: 'Calculate, to the nearest tenth of a centimetre, the length of the indicated side in the triangle.', parts: [
        { id: '6a', level: 'BEG', make: function (r) {
          var deg = angle(r, 32, 58, true), k = tenth(r, 50, 99), ks = k.toFixed(1);
          return sidePart({ prompt: triFig(r, deg, { adj: ks + ' cm', opp: 'a' }, null) + 'Find ' + t('a') + '.', deg: deg, k: k, kStr: ks, kRole: 'adj', uRole: 'opp', uName: 'a', unit: 'cm', dp: 1, text: 'a = ' + ks + ' tan ' + deg });
        } },
        { id: '6b', level: 'BEG', make: function (r) {
          var deg = r.int(60, 75), k = tenth(r, 110, 190), ks = k.toFixed(1);
          return sidePart({ prompt: triFig(r, deg, { hyp: ks + ' cm', adj: 'b' }, null) + 'Find ' + t('b') + '.', deg: deg, k: k, kStr: ks, kRole: 'hyp', uRole: 'adj', uName: 'b', unit: 'cm', dp: 1, text: 'b = ' + ks + ' cos ' + deg });
        } },
        { id: '6c', level: 'BEG', make: function (r) {
          var a = tenth(r, 25, 45), b; do { b = tenth(r, 30, 60); } while (Math.abs(a - b) < 0.5);
          return pythPart({ prompt: triFig(r, Math.atan(b / a) * 180 / Math.PI, { adj: a.toFixed(1) + ' cm', opp: b.toFixed(1) + ' cm', hyp: 'c' }, null, { noAngle: true }) + 'Find ' + t('c') + '.', find: 'hyp', a: a, b: b, aStr: a.toFixed(1), bStr: b.toFixed(1), uName: 'c', unit: 'cm', dp: 1, text: 'hyp from legs ' + a + ', ' + b });
        } }] },
      /* ---------------- Question 7 ---------------- */
      { num: '7', stem: 'Trigonometric ratios cannot be used to calculate the side marked ' + t('x') + ' in this triangle.', shared: q7Shared, parts: [
        { id: '7a', level: 'BEG', make: function (r, sh) { return q7Part(r, 'a', sh); } },
        { id: '7b', level: 'BEG', make: function (r, sh) { return q7Part(r, 'b', sh); } },
        { id: '7c', level: 'EMG', make: function (r, sh) { return q7Part(r, 'c', sh); } }] },
      /* ---------------- Question 8 ---------------- */
      { num: '8', stem: 'Determine, to the nearest tenth, the length of the hypotenuse. Start by sketching and labelling the triangle.', parts: [
        { id: '8a', level: 'PRG', make: function (r) {
          var cfg = { kRole: 'opp', uRole: 'hyp', deg: [40, 64], k: [150, 350] }, s = descSetup(r, cfg);
          return sidePart({ prompt: 'Triangle ' + t(s.n.tri) + ' in which ' + t('\\angle ' + ang3(s.n, s.n.rt) + '=90^\\circ') + ', ' + t('\\angle ' + ang3(s.n, s.n.ang) + '=' + dg(s.deg)) + ', and ' + t(s.kS + '=' + s.kStr + '\\text{ mm}') + '. Find the hypotenuse ' + t(s.uS) + '.',
            deg: s.deg, k: s.k, kStr: s.kStr, kRole: 'opp', uRole: 'hyp', kName: s.kS, uName: s.uS, unit: 'mm', dp: 1, angTex: '\\angle ' + s.n.ang + '=' + dg(s.deg),
            solPre: descSketch(r, s, cfg, 'mm') + t('\\angle ' + s.n.rt + '=90^\\circ') + ', so ' + t(s.uS) + ' is the hypotenuse.<br>', text: s.uS + ' = ' + s.kStr + ' / sin ' + s.deg });
        } },
        { id: '8b', level: 'PRG', make: function (r) {
          var cfg = { kRole: 'adj', uRole: 'hyp', deg: [30, 55], k: [50, 140] }, s = descSetup(r, cfg);
          return sidePart({ prompt: 'Triangle ' + t(s.n.tri) + ' in which ' + t('\\angle ' + ang3(s.n, s.n.rt) + '=90^\\circ') + ', ' + t('\\angle ' + ang3(s.n, s.n.ang) + '=' + dg(s.deg)) + ', and ' + t(s.kS + '=' + s.kStr + '\\text{ cm}') + '. Find the hypotenuse ' + t(s.uS) + '.',
            deg: s.deg, k: s.k, kStr: s.kStr, kRole: 'adj', uRole: 'hyp', kName: s.kS, uName: s.uS, unit: 'cm', dp: 1, angTex: '\\angle ' + s.n.ang + '=' + dg(s.deg),
            solPre: descSketch(r, s, cfg, 'cm') + t('\\angle ' + s.n.rt + '=90^\\circ') + ', so ' + t(s.uS) + ' is the hypotenuse.<br>', text: s.uS + ' = ' + s.kStr + ' / cos ' + s.deg });
        } }] },
      /* ---------------- Question 9 ---------------- */
      { num: '9', stem: 'Determine the length of the leg ' + t('x') + ', to the nearest tenth of a metre.', parts: [
        { id: '9', level: 'EMG', make: function (r) {
          var deg = angle(r, 40, 65, true), k = tenth(r, 80, 200), ks = k.toFixed(1);
          return sidePart({ prompt: triFig(r, deg, { opp: ks + ' m', adj: 'x' }, null) + 'Find ' + t('x') + '.', deg: deg, k: k, kStr: ks, kRole: 'opp', uRole: 'adj', uName: 'x', unit: 'm', dp: 1, text: 'x = ' + ks + ' / tan ' + deg });
        } }] },
      /* ---------------- Question 10 ---------------- */
      { num: '10', stem: 'Sketch and label the right triangle first.', parts: [
        { id: '10', level: 'PRG', make: function (r) {
          var deg = angle(r, 28, 52, true), k = r.int(12, 40), obj = r.pick(['flagpole', 'flagpole', 'tree', 'light standard']);
          var sk = poleFig(r, deg, 'd', k + ' m', { flag: obj === 'flagpole', aria: obj + ' diagram' });
          return sidePart({ prompt: 'From a point ' + t('P') + ' on level ground, the line of sight to the top of a ' + t(k + '\\text{ m}') + ' ' + obj + ' makes an angle of ' + t(dg(deg)) + ' with the ground. How far is ' + t('P') + ' from the base of the ' + obj + ', to the nearest tenth of a metre?',
            deg: deg, k: k, kStr: String(k), kRole: 'opp', uRole: 'adj', uName: 'd', unit: 'm', dp: 1, solPre: sk + 'The ' + obj + ' is opposite the angle at ' + t('P') + '; the ground distance ' + t('d') + ' is adjacent.<br>', text: 'd = ' + k + ' / tan ' + deg });
        } }] },
      /* ---------------- Question 11 ---------------- */
      { num: '11', shared: function (r) { var n = names3(r), deg = r.int(40, 65), k = tenth(r, 90, 200); return { n: n, deg: deg, k: k, fig: triFig(r, deg, { hyp: k.toFixed(1) + ' cm' }, n) }; },
        stem: function (sh) { return 'Calculate, to the nearest tenth of a centimetre, the lengths of ' + t(sideOf(sh.n, 'adj')) + ' and ' + t(sideOf(sh.n, 'opp')) + ' in the triangle shown.' + sh.fig; },
        parts: [
          { id: '11a', level: 'EMG', make: function (r, sh) {
            var u = sideOf(sh.n, 'adj'), ks = sh.k.toFixed(1);
            return sidePart({ prompt: 'Find ' + t(u) + '.', deg: sh.deg, k: sh.k, kStr: ks, kRole: 'hyp', uRole: 'adj', kName: sideOf(sh.n, 'hyp'), uName: u, unit: 'cm', dp: 1, angTex: '\\angle ' + sh.n.ang + '=' + dg(sh.deg), text: u + ' = ' + ks + ' cos ' + sh.deg });
          } },
          { id: '11b', level: 'EMG', make: function (r, sh) {
            var u = sideOf(sh.n, 'opp'), ks = sh.k.toFixed(1);
            return sidePart({ prompt: 'Find ' + t(u) + '.', deg: sh.deg, k: sh.k, kStr: ks, kRole: 'hyp', uRole: 'opp', kName: sideOf(sh.n, 'hyp'), uName: u, unit: 'cm', dp: 1, angTex: '\\angle ' + sh.n.ang + '=' + dg(sh.deg), text: u + ' = ' + ks + ' sin ' + sh.deg });
          } }] },
      /* ---------------- Question 12 ---------------- */
      { num: '12', section: 'Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '12', level: 'PRG', make: function (r) {
          var n = names3(r), deg = angle(r, 32, 58, true), k = r.int(8, 20), oth = 90 - deg;
          var hyp = sideOf(n, 'hyp'), opp = sideOf(n, 'opp');
          return mc(r, 'Triangle ' + t(n.tri) + ' is right-angled at ' + t(n.rt) + '. ' + t('\\angle ' + ang3(n, n.ang) + '=' + dg(deg)) + ' and ' + t(opp + '=' + k + '\\text{ cm}') + '. The length of ' + t(hyp) + ', in cm, is given by', [
            { html: t(k + '\\sin ' + dg(deg)), why: t(k + '\\sin ' + dg(deg) + '\\approx ' + fx(k * TR.sin(deg), 2)) + ' is shorter than the leg ' + t(k) + ' — impossible for a hypotenuse. ' + t(opp) + ' is opposite ' + t('\\angle ' + n.ang) + ', so ' + t(hyp) + ' sits in the denominator: divide.' },
            { html: t('\\dfrac{' + k + '}{\\cos ' + dg(deg) + '}'), why: 'From ' + t('\\angle ' + n.ang) + ', ' + t(opp) + ' is the <b>opposite</b> side, not the adjacent one, so cosine at ' + t(n.ang) + ' is the wrong ratio.' },
            { html: t(k + '\\tan ' + dg(deg)), why: 'Tangent relates the two legs: ' + t(k + '\\tan ' + dg(deg)) + ' is the other leg, not the hypotenuse.' },
            { html: t('\\dfrac{' + k + '}{\\cos ' + dg(oth) + '}'), right: true }],
            t('\\angle ' + n.rt + '=90^\\circ') + ', so ' + t(hyp) + ' is the hypotenuse. From ' + t('\\angle ' + n.ang + '=' + dg(deg)) + ', ' + t(opp) + ' is opposite, so ' + t(hyp + '=\\dfrac{' + k + '}{\\sin ' + dg(deg) + '}\\approx ' + fx(k / TR.sin(deg), 2)) + '.<br>The third angle is ' + t('\\angle ' + n.oth + '=90^\\circ-' + dg(deg) + '=' + dg(oth)) + ', and from ' + t(n.oth) + ' the side ' + t(opp) + ' is <b>adjacent</b>, so ' + t(hyp + '=\\dfrac{' + k + '}{\\cos ' + dg(oth) + '}') + ' — the same number, because ' + t('\\sin ' + dg(deg) + '=\\cos ' + dg(oth)) + '.',
            ['None of the options is ' + t('\\frac{' + k + '}{\\sin ' + dg(deg) + '}') + '. Try naming the sides from the <b>other</b> acute angle.'], 'MC hyp via other angle');
        } }] },
      /* ---------------- Question 13 ---------------- */
      { num: '13', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '13', level: 'EMG', make: function (r) {
          var deg = r.int(52, 70), d = r.int(40, 99), h = 4 * Math.tan(deg * Math.PI / 180);
          var pts = mir({ B: [0, 0], T: [0, h], S: [4, 0], a1: [0.25, h + 0.5] }, r.chance(0.5));
          var f = fig({ pts: pts, names: false, segs: [['B', 'T', { width: 4.5 }], ['T', 'a1', { width: 1.6 }], ['B', 'S', d + ' m', { dash: 1 }], ['S', 'T', { dash: 1, width: 1.6 }]], right: [['B', 'S', 'T']], angles: [['S', 'B', 'T', ds(deg)]], extra: [{ type: 'ground', y: 0, x0: Math.min(0, pts.S[0]) - 0.4, x1: Math.max(0, pts.S[0]) + 0.4 }], width: 220, aria: 'radio tower and shadow' });
          return sidePart({ prompt: f + 'A radio tower casts a shadow ' + t(d + '\\text{ m}') + ' long. The angle between the ground and the line from the tip of the shadow to the top of the tower is ' + t(dg(deg)) + '. To the nearest metre, the height of the tower is ________ m.',
            deg: deg, k: d, kStr: String(d), kRole: 'adj', uRole: 'opp', uName: 'h', unit: 'm', dp: 0, nr: true, text: 'NR tower h = ' + d + ' tan ' + deg });
        } }] },
      /* ---------------- Question 14 ---------------- */
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '14', level: 'PRG', make: function (r) {
          var n = names3(r), deg = r.int(35, 65), c = r.int(20, 60), a = c * TR.cos(deg), b = c * TR.sin(deg), P = a + b + c;
          var adj = sideOf(n, 'adj'), opp = sideOf(n, 'opp'), hyp = sideOf(n, 'hyp');
          var alts = [{ v: a + b, code: 'perim-part', hint: 'The perimeter is the sum of <b>all three</b> sides — include the hypotenuse ' + t(hyp + '=' + c) + '.' },
            { v: Math.round(a) + Math.round(b) + c, code: 'round-early', hint: 'Keep full calculator precision for ' + t(adj) + ' and ' + t(opp) + '; round only the final perimeter.' },
            { v: c / TR.cos(deg) + c / TR.sin(deg) + c, code: 'mult-div', hint: 'The legs are the unknowns and they sit on <b>top</b> of ' + t('\\cos') + ' and ' + t('\\sin') + ' (the hypotenuse is the known bottom), so multiply: ' + t(adj + '=' + c + '\\cos ' + dg(deg)) + '.' },
            { v: c * TR.radCos(deg) + c * TR.radSin(deg) + c, code: 'radian', hint: RAD_HINT }];
          return nearPart('In right triangle ' + t(n.tri) + ', ' + t('\\angle ' + ang3(n, n.rt) + '=90^\\circ') + ', ' + t('\\angle ' + ang3(n, n.ang) + '=' + dg(deg)) + ', and ' + t(hyp + '=' + c) + ' units. To the nearest whole number, the perimeter of the triangle is ________.', P, 0, { nr: true, alts: alts },
            t('\\angle ' + n.rt + '=90^\\circ') + ', so ' + t(hyp + '=' + c) + ' is the hypotenuse. From ' + t('\\angle ' + n.ang + '=' + dg(deg)) + ': ' + t(adj) + ' is adjacent and ' + t(opp) + ' is opposite — both on top.<br>' +
            t(adj + '=' + c + '\\cos ' + dg(deg) + '=' + dots(a)) + '<br>' + t(opp + '=' + c + '\\sin ' + dg(deg) + '=' + dots(b)) + ' (keep full precision)<br>' + t('P=' + dots(a) + '+' + dots(b) + '+' + c + '=' + dots(P) + '\\approx ' + Math.round(P)),
            ['Find both legs from the hypotenuse and the angle, then add all three sides.', 'Round only the final perimeter.'], 'NR perimeter, hyp ' + c + ', ' + deg + '°');
        } }] }
    ],

    extra: [
      /* ---------------- EP Part A ---------------- */
      { num: '1', section: 'Extra practice A — The unknown on top, the unknown on the bottom', stem: 'The unknown side ' + t('x') + ' sits in the <b>numerator</b> of the ratio, so this one finishes with a multiplication. Solve for ' + t('x') + ' to the nearest tenth of a centimetre.', parts: [
        { id: 'e1a', level: 'BEG', make: function (r) { return epFig(r, 'hyp', 'opp', [42, 62], [120, 250], false); } },
        { id: 'e1b', level: 'BEG', make: function (r) { return epFig(r, 'adj', 'opp', [22, 38], [120, 250], false); } },
        { id: 'e1c', level: 'BEG', make: function (r) { return epFig(r, 'hyp', 'adj', [55, 72], [60, 140], false); } },
        { id: 'e1d', level: 'BEG', make: function (r) { return epFig(r, 'adj', 'opp', [32, 52], [200, 400], false, true); } }] },
      { num: '2', stem: 'The unknown side ' + t('x') + ' sits in the <b>denominator</b>, so cross-multiply and then divide the known side by the ratio. Solve for ' + t('x') + ' to the nearest tenth of a centimetre (lengths in centimetres).', parts: [
        { id: 'e2a', level: 'EMG', make: function (r) { return epFig(r, 'opp', 'hyp', [30, 48], [50, 120], true); } },
        { id: 'e2b', level: 'EMG', make: function (r) { return epFig(r, 'adj', 'hyp', [52, 70], [100, 200], true); } },
        { id: 'e2c', level: 'EMG', make: function (r) { return epFig(r, 'opp', 'adj', [18, 32], [50, 99], true); } },
        { id: 'e2d', level: 'EMG', make: function (r) { return epFig(r, 'opp', 'adj', [38, 58], [150, 300], true, true); } }] },
      { num: '3', stem: 'No diagram is supplied. First decide whether the unknown lands on the <b>top</b> or the <b>bottom</b> of the ratio you choose — and so whether you multiply or divide — then calculate. Round to the nearest tenth.', parts: [
        { id: 'e3a', level: 'EMG', make: function (r) { return e3Part(r, { kRole: 'adj', uRole: 'opp', deg: [30, 55], k: [80, 200], avoid45: true }); } },
        { id: 'e3b', level: 'PRG', make: function (r) { return e3Part(r, { kRole: 'opp', uRole: 'hyp', deg: [45, 70], k: [150, 300] }); } },
        { id: 'e3c', level: 'PRG', make: function (r) { return e3Part(r, { kRole: 'adj', uRole: 'hyp', deg: [25, 50], k: [50, 140] }); } },
        { id: 'e3d', level: 'EMG', make: function (r) { return e3Part(r, { kRole: 'hyp', uRole: 'adj', deg: [55, 75], k: [200, 400] }); } },
        { id: 'e3e', level: 'PRG', make: function (r) { return e3Part(r, { kRole: 'opp', uRole: 'adj', deg: [15, 35], k: [30, 90] }); } },
        { id: 'e3f', level: 'EMG', make: function (r) { return e3Part(r, { kRole: 'hyp', uRole: 'adj', deg: [62, 80], k: [50, 120] }); } },
        { id: 'e3g', level: 'EMG', make: function (r) {
          return mc(r, 'Some of these questions finish with a multiplication and some with a division. What single feature of the <b>given information</b> decides which?', [
            { html: 'Where the <b>known</b> side sits in the ratio: if it is the bottom, the unknown is on top and you multiply; if it is the top, the unknown is underneath and you divide.', right: true },
            { html: 'Which ratio is used: sine and cosine multiply, tangent divides.', why: 'Each ratio can go either way: ' + t('\\tan\\theta=\\frac{x}{k}') + ' multiplies, ' + t('\\tan\\theta=\\frac{k}{x}') + ' divides. Look at where the known side sits.' },
            { html: 'Whether the given angle is bigger or smaller than ' + t('45^\\circ') + '.', why: 'The size of the angle changes the answer, not the operation. Look at where the known side sits in the ratio.' },
            { html: 'Whether the unknown is a leg: legs always multiply, the hypotenuse always divides.', why: 'The second half is true (the hypotenuse is always a denominator), but a leg can need a division too: finding the adjacent leg from the opposite leg means ' + t('x=\\frac{k}{\\tan\\theta}') + '.' }],
            'Every ratio is (top side) ÷ (bottom side). If the <b>known</b> side is the bottom, the unknown is on top and one multiplication finishes it. If the known side is the top, the unknown is underneath: cross-multiply and divide. Because the hypotenuse is always the bottom of sine and cosine, asking for the hypotenuse always means dividing.',
            ['Write the ratio as a fraction. Which side is on top — the known one or the unknown one?'], 'what decides multiply vs divide');
        } }] },
      /* ---------------- EP Part B ---------------- */
      { num: '4', section: 'Extra practice B — Choosing the ratio', shared: function (r) { var n = names3(r), deg = angle(r, 30, 55, true), k = tenth(r, 100, 200); return { n: n, deg: deg, k: k, fig: triFig(r, deg, { adj: k.toFixed(1) + ' cm' }, n) }; },
        stem: function (sh) { var n = sh.n; return 'In ' + t('\\triangle ' + n.tri) + ', ' + t('\\angle ' + n.rt + '=90^\\circ') + ', ' + t('\\angle ' + n.ang + '=' + dg(sh.deg)) + ' and ' + t(sideOf(n, 'adj') + '=' + sh.k.toFixed(1) + '\\text{ cm}') + '. The length of ' + t(sideOf(n, 'opp')) + ' is wanted.' + sh.fig; },
        parts: [
          { id: 'e4a', level: 'BEG', make: function (r, sh) {
            var n = sh.n, rows = r.shuffle([{ id: 'adj', html: t(sideOf(n, 'adj')) }, { id: 'opp', html: t(sideOf(n, 'opp')) }, { id: 'hyp', html: t(sideOf(n, 'hyp')) }]);
            return K.P.grid('Relative to ' + t('\\angle ' + n.ang) + ', name each side.', rows, [{ id: 'opp', html: 'Opposite' }, { id: 'adj', html: 'Adjacent' }, { id: 'hyp', html: 'Hypotenuse' }], { opp: 'opp', adj: 'adj', hyp: 'hyp' },
              { why: function (row, got) { return row === 'hyp' || got === 'hyp' ? 'The hypotenuse is always the side across from the right angle at ' + t(n.rt) + '.' : 'The adjacent side touches ' + t('\\angle ' + n.ang) + ' (and is not the hypotenuse); the opposite side does not touch it.'; } },
              'The hypotenuse ' + t(sideOf(n, 'hyp')) + ' is across from the right angle. ' + t(sideOf(n, 'adj')) + ' touches ' + t('\\angle ' + n.ang) + ', so it is adjacent; ' + t(sideOf(n, 'opp')) + ' does not touch it, so it is opposite.', ['Find the hypotenuse first: it is across from the right angle.'], 'name sides from angle ' + n.ang);
          } },
          { id: 'e4b', level: 'EMG', make: function (r, sh) {
            var n = sh.n, A = sideOf(n, 'adj'), O = sideOf(n, 'opp'), H = sideOf(n, 'hyp'), D = dg(sh.deg), k = sh.k.toFixed(1);
            return mc(r, 'There are two correct routes to ' + t(O) + '. The one-step route is ' + t('\\tan ' + D + '=\\dfrac{' + O + '}{' + k + '}') + '. Which pair of equations reaches ' + t(O) + ' <b>by way of the hypotenuse ' + H + '</b>?', [
              { html: t('\\cos ' + D + '=\\dfrac{' + k + '}{' + H + '}') + ', then ' + t('\\sin ' + D + '=\\dfrac{' + O + '}{' + H + '}'), right: true },
              { html: t('\\sin ' + D + '=\\dfrac{' + k + '}{' + H + '}') + ', then ' + t('\\cos ' + D + '=\\dfrac{' + O + '}{' + H + '}'), why: t(A) + ' is <b>adjacent</b> to ' + t('\\angle ' + n.ang) + ', so the first equation needs cosine, and the second needs sine (' + t(O) + ' is opposite).' },
              { html: t('\\cos ' + D + '=\\dfrac{' + H + '}{' + k + '}') + ', then ' + t('\\sin ' + D + '=\\dfrac{' + O + '}{' + H + '}'), why: 'Cosine is adjacent ÷ hypotenuse: the hypotenuse belongs in the <b>denominator</b>.' },
              { html: t('\\tan ' + D + '=\\dfrac{' + k + '}{' + H + '}') + ', then ' + t('\\sin ' + D + '=\\dfrac{' + O + '}{' + H + '}'), why: 'Tangent relates the two legs only — the hypotenuse never appears in it.' }],
              'Through the hypotenuse: ' + t(A) + ' is adjacent, so ' + t('\\cos ' + D + '=\\dfrac{' + k + '}{' + H + '}') + ' gives ' + t(H) + '; then ' + t(O) + ' is opposite, so ' + t('\\sin ' + D + '=\\dfrac{' + O + '}{' + H + '}') + '.',
              ['Name the sides relative to ' + t('\\angle ' + n.ang) + '. Which ratio links ' + t(A) + ' and ' + t(H) + '? Which links ' + t(O) + ' and ' + t(H) + '?'], 'two-step route through hyp');
          } },
          { id: 'e4c', level: 'EMG', make: function (r, sh) {
            var n = sh.n, O = sideOf(n, 'opp'), k = sh.k.toFixed(1), H1 = K.roundTo(sh.k / TR.cos(sh.deg), 1);
            return sidePart({ prompt: 'Carry out either route, keeping full calculator precision, and give ' + t(O) + ' to the nearest tenth of a centimetre. (Both routes give the same answer.)', deg: sh.deg, k: sh.k, kStr: k, kRole: 'adj', uRole: 'opp', kName: sideOf(n, 'adj'), uName: O, unit: 'cm', dp: 1, angTex: '\\angle ' + n.ang + '=' + dg(sh.deg),
              alts: [{ v: H1 * TR.sin(sh.deg), code: 'round-early', hint: 'Keep the hypotenuse unrounded in your calculator — round only the final answer.' }],
              solPost: '<br>Through the hypotenuse: ' + t(sideOf(n, 'hyp') + '=\\dfrac{' + k + '}{\\cos ' + dg(sh.deg) + '}=' + dots(sh.k / TR.cos(sh.deg))) + ', then ' + t(O + '=' + dots(sh.k / TR.cos(sh.deg)) + '\\times\\sin ' + dg(sh.deg) + '=' + dots(sh.k * TR.tan(sh.deg))) + ' — identical.', text: O + ' = ' + k + ' tan ' + sh.deg });
          } },
          { id: 'e4d', level: 'EMG', make: function (r, sh) {
            var H = sideOf(sh.n, 'hyp');
            return mc(r, 'Two routes reach ' + t(sideOf(sh.n, 'opp')) + ': the one-step tangent route, and the route through the hypotenuse ' + t(H) + ' (cosine first, then sine). Which route is fewer steps, and what is the second, separate reason a marker would prefer it?', [
              { html: 'The one-step tangent route: it never creates an in-between value (like ' + t(H) + ') that could be written down rounded and re-entered.', right: true },
              { html: 'The route through ' + t(H) + ': finding the hypotenuse first is always more accurate.', why: 'It takes two equations instead of one, and the extra in-between value is a chance to round too early.' },
              { html: 'The one-step tangent route: tangent is more accurate than sine or cosine.', why: 'All three ratios are equally accurate on a calculator. The real risk is an in-between value that gets rounded.' },
              { html: 'The route through ' + t(H) + ': it checks the answer with two different ratios.', why: 'It is longer, and it creates an in-between value that can be rounded too early.' }],
              'The tangent route is <b>one</b> equation. It also uses only the given values, so there is no in-between number (like ' + t(H) + ') that could be rounded early and re-entered.', ['Count the equations in each route. Which route creates a number you might be tempted to round?'], 'prefer one-step route');
          } }] },
      { num: '5', stem: 'This triangle has been turned off the page’s axes. <b>Locate the right angle first</b>, then name the sides relative to the marked angle. Determine ' + t('x') + ' to the nearest tenth of a centimetre.', parts: [
        { id: 'e5a', level: 'EMG', make: function (r) { return e5Part(r, 'hyp', 'opp', [28, 45], [120, 200]); } },
        { id: 'e5b', level: 'EMG', make: function (r) { return e5Part(r, 'adj', 'hyp', [40, 60], [80, 150]); } },
        { id: 'e5c', level: 'EMG', make: function (r) { return e5Part(r, 'opp', 'adj', [20, 35], [80, 150]); } },
        { id: 'e5d', level: 'EMG', make: function (r) { return e5Part(r, 'hyp', 'adj', [58, 75], [60, 120]); } }] },
      { num: '6', shared: function (r) { var n = names3(r), deg = r.int(25, 40), k = tenth(r, 150, 300); return { n: n, deg: deg, k: k, fig: triFig(r, deg, { adj: k.toFixed(1) + ' m', opp: sideOf(n, 'opp') }, n) }; },
        stem: function (sh) { return 'In ' + t('\\triangle ' + sh.n.tri) + ' the right angle is at ' + t(sh.n.rt) + '. The angle that has been given is the one at ' + t(sh.n.ang) + '.' + sh.fig; },
        parts: [
          { id: 'e6a', level: 'EMG', make: function (r, sh) {
            var n = sh.n, O = sideOf(n, 'opp'), k = sh.k.toFixed(1);
            return sidePart({ prompt: 'Relative to the given angle of ' + t(dg(sh.deg)) + ', name the sides, then determine ' + t(O) + ' to the nearest tenth of a metre.', deg: sh.deg, k: sh.k, kStr: k, kRole: 'adj', uRole: 'opp', kName: sideOf(n, 'adj'), uName: O, unit: 'm', dp: 1, angTex: '\\angle ' + n.ang + '=' + dg(sh.deg),
              alts: [{ v: sh.k / TR.tan(sh.deg), code: 'other-angle', hint: 'That treats the ' + t(dg(sh.deg)) + ' as the angle at ' + t(n.oth) + '. The marked angle is at ' + t(n.ang) + ': from there, ' + t(sideOf(n, 'adj')) + ' is adjacent and ' + t(O) + ' is opposite.' }], text: O + ' = ' + k + ' tan ' + sh.deg });
          } },
          { id: 'e6b', level: 'EMG', make: function (r, sh) {
            var n = sh.n, O = sideOf(n, 'opp'), A = sideOf(n, 'adj'), k = sh.k.toFixed(1), w = sh.k / TR.tan(sh.deg), c = sh.k * TR.tan(sh.deg);
            return nearPart('A student read the ' + t(dg(sh.deg)) + ' as the angle at ' + t(n.oth) + ' instead. Then ' + t(A) + ' looks <i>opposite</i> and ' + t(O) + ' looks <i>adjacent</i>. What value of ' + t(O) + ' does that student get, to the nearest tenth?', w, 1,
              { unit: 'm', alts: [{ v: c, code: 'skip-given', hint: 'That is the <b>correct</b> length. This part asks what the student gets when the ' + t(dg(sh.deg)) + ' is read as the angle at ' + t(n.oth) + ': then ' + t(O) + ' is in the denominator, ' + t('\\tan ' + dg(sh.deg) + '=\\dfrac{' + k + '}{' + O + '}') + '.' },
                { v: sh.k * TR.radTan(sh.deg), code: 'radian', hint: RAD_HINT }, { v: sh.k / TR.radTan(sh.deg), code: 'radian', hint: RAD_HINT }] },
              'Reading the angle at ' + t(n.oth) + ' swaps the names: ' + t(A) + ' becomes opposite and ' + t(O) + ' adjacent.<br>' + t('\\tan ' + dg(sh.deg) + '=\\dfrac{' + k + '}{' + O + '}') + ', so ' + t(O + '=\\dfrac{' + k + '}{\\tan ' + dg(sh.deg) + '}=' + dots(w) + '\\approx ' + fx(w, 1)) + ' m — wrong, because the angle is really at ' + t(n.ang) + '.',
              ['From the corner at ' + t(n.oth) + ', which side is opposite and which is adjacent?'], 'wrong-vertex answer');
          } },
          { id: 'e6c', level: 'EMG', make: function (r, sh) {
            var n = sh.n, O = sideOf(n, 'opp'), A = sideOf(n, 'adj'), c = fx(sh.k * TR.tan(sh.deg), 1), w = fx(sh.k / TR.tan(sh.deg), 1);
            return mc(r, 'The correct answer is ' + t(O + '\\approx ' + c + '\\text{ m}') + '; the student’s is ' + t(w + '\\text{ m}') + '. Both are plausible sizes. Which check on the diagram rejects the wrong one?', [
              { html: 'The ' + t(dg(sh.deg)) + ' is the smaller acute angle, so the side opposite it, ' + t(O) + ', must be the shorter leg — shorter than ' + t(A + '=' + sh.k.toFixed(1) + '\\text{ m}') + '.', right: true },
              { html: 'The hypotenuse must be the longest side, so it must be longer than both answers.', why: 'True, but the hypotenuse is not known, so this cannot separate the two answers. Compare the two <b>legs</b>.' },
              { html: 'An answer as big as ' + t(w + '\\text{ m}') + ' is impossible for a triangle drawn this small.', why: 'Diagrams are not to scale. Use the angles: the leg opposite the smaller angle is the shorter leg.' },
              { html: 'The side opposite an angle is always longer than the side adjacent to it.', why: 'Only when the angle is more than ' + t('45^\\circ') + '. Here it is ' + t(dg(sh.deg)) + '.' }],
              'The ' + t(dg(sh.deg)) + ' angle is less than ' + t('45^\\circ') + ', so it is the <b>smaller</b> acute angle and the side opposite it, ' + t(O) + ', is the <b>shorter</b> leg. ' + t(c) + ' m is shorter than ' + t(sh.k.toFixed(1)) + ' m ✓; ' + t(w) + ' m is longer ✗.', ['Compare the two acute angles. Which leg is opposite the smaller one?'], 'leg check');
          } }] },
      /* ---------------- EP Part C ---------------- */
      { num: '7', section: 'Extra practice C — Round only at the end', shared: e7Setup,
        stem: function (sh) {
          var n = sh.n, H = sideOf(n, 'hyp'), O = sideOf(n, 'opp'), A = sideOf(n, 'adj'), D = dg(sh.deg), k = sh.k.toFixed(1), hr = sh.hR.toFixed(1);
          return 'In ' + t('\\triangle ' + n.tri) + ', ' + t('\\angle ' + n.rt + '=90^\\circ') + ', ' + t('\\angle ' + n.ang + '=' + D) + ' and ' + t(A + '=' + k + '\\text{ cm}') + '. Two students find ' + t(O) + '.<br>' +
            '<b>Rowan:</b> ' + t('\\tan ' + D + '=\\dfrac{' + O + '}{' + k + '}') + ', ' + t(O + '=' + k + '\\tan ' + D + '=' + dots(sh.bc)) + ', so ' + t(O + '\\approx ' + fx(sh.bc, 1) + '\\text{ cm}') + '.<br>' +
            '<b>Sage:</b> ' + t('\\cos ' + D + '=\\dfrac{' + k + '}{' + H + '}') + ', ' + t(H + '=' + dots(sh.hyp) + '\\approx ' + hr) + '; then ' + t(O + '=' + hr + '\\sin ' + D + '=' + dots(sh.sage)) + ', so ' + t(O + '\\approx ' + fx(sh.sage, 1) + '\\text{ cm}') + '.';
        },
        parts: [
          { id: 'e7a', level: 'EMG', make: function (r, sh) {
            var H = sideOf(sh.n, 'hyp'), hr = sh.hR.toFixed(1);
            return mc(r, 'Sage’s method is legitimate and Sage made no arithmetic slip. Where did the difference come from?', [
              { html: 'Sage wrote the hypotenuse down rounded to ' + t(hr) + ' and then used the rounded value; that small error was multiplied by ' + t('\\sin ' + dg(sh.deg)) + ' and pushed the answer across a rounding boundary.', right: true },
              { html: 'Sage should have used cosine instead of sine in the second step.', why: 'From ' + t('\\angle ' + sh.n.ang) + ', ' + t(sideOf(sh.n, 'opp')) + ' is opposite and ' + t(H) + ' is the hypotenuse — sine is right.' },
              { html: 'Rowan’s tangent route is less accurate than Sage’s route.', why: 'Rowan uses only the given values, which is exactly why Rowan’s answer is accurate.' },
              { html: 'Sage’s calculator must have been in radian mode.', why: 'Radian mode gives a wildly different number, not one that is just ' + t('0.1') + ' off.' }],
              'The true hypotenuse is ' + t(H + '=' + dots(sh.hyp)) + ', so ' + t(hr) + ' is off by about ' + t(fx(Math.abs(sh.hR - sh.hyp), 3)) + '. Multiplying by ' + t('\\sin ' + dg(sh.deg)) + ' passes that error into ' + t(sideOf(sh.n, 'opp')) + ', moving ' + t(dots(sh.bc)) + ' to ' + t(dots(sh.sage)) + ' — enough to round differently.', ['Which number on Sage’s page was not straight from the calculator?'], 'source of rounding error');
          } },
          { id: 'e7b', level: 'BEG', make: function (r, sh) {
            var O = sideOf(sh.n, 'opp'), H = sideOf(sh.n, 'hyp');
            return nearPart('Redo Sage’s second line using the <b>unrounded</b> hypotenuse ' + t(H + '=' + dots(sh.hyp)) + '. What is ' + t(O) + ' to the nearest tenth?', sh.bc, 1,
              { unit: 'cm', alts: [{ v: sh.sage, code: 'round-early', hint: 'That still uses the rounded ' + t(sh.hR.toFixed(1)) + '. Use every digit of the hypotenuse (leave it in your calculator).' }, { v: sh.hyp * TR.radSin(sh.deg), code: 'radian', hint: RAD_HINT }] },
              t(O + '=' + dots(sh.hyp) + '\\times\\sin ' + dg(sh.deg) + '=' + dots(sh.bc) + '\\approx ' + fx(sh.bc, 1)) + ' cm — digit for digit Rowan’s value, so Rowan’s answer is correct.', ['Multiply the full value of the hypotenuse by ' + t('\\sin ' + dg(sh.deg)) + '.'], 'redo with unrounded hyp');
          } },
          { id: 'e7c', level: 'BEG', make: function (r, sh) {
            var H = sideOf(sh.n, 'hyp');
            return mc(r, 'What rule does this question protect, and what should Sage have written instead of ' + t(sh.hR.toFixed(1)) + '?', [
              { html: 'Round only at the very end: keep ' + t(H + '=' + dots(sh.hyp)) + ' in the calculator and use that value.', right: true },
              { html: 'Round every answer to the nearest tenth as soon as you find it.', why: 'That is exactly what caused the problem: a rounded in-between value was reused.' },
              { html: 'Write ' + t(H) + ' to the nearest whole number to keep the numbers simple.', why: 'Rounding more makes the error bigger, not smaller.' },
              { html: 'Never find the hypotenuse first.', why: 'Finding the hypotenuse first is a legitimate method — the problem was rounding it before reusing it.' }],
              '<b>Round only at the end.</b> Carry full calculator precision through every in-between step: Sage should have used ' + t(H + '=' + dots(sh.hyp)) + ' (or left it in the calculator) and rounded only the final answer.', ['What went wrong between Sage’s first and second lines?'], 'round only at the end');
          } }] },
      /* ---------------- EP Part D ---------------- */
      { num: '8', section: 'Extra practice D — No diagram: draw it first', shared: function (r) { return { h: tenth(r, 35, 80), deg: r.int(62, 78) }; },
        stem: function (sh) { return 'A ladder leans against a vertical wall. Its top rests against the wall ' + t(sh.h.toFixed(1) + '\\text{ m}') + ' above the ground, and the ladder makes an angle of ' + t(dg(sh.deg)) + ' with the level ground.'; },
        parts: [
          { id: 'e8a', level: 'EMG', make: function (r, sh) {
            var hs = sh.h.toFixed(1) + ' m';
            var p = mc(r, 'Which sketch is labelled correctly? The length of the ladder is ' + t('L') + '.', [
              { html: ladderSketch('ok', sh.deg, hs), right: true },
              { html: ladderSketch('top', sh.deg, hs), why: 'The ' + t(dg(sh.deg)) + ' is between the ladder and the <b>ground</b>, so it belongs at the foot of the ladder, not at the top.' },
              { html: ladderSketch('hground', sh.deg, hs), why: 'The ' + t(sh.h.toFixed(1) + '\\text{ m}') + ' is the height <b>up the wall</b>, not a distance along the ground.' },
              { html: ladderSketch('Lwall', sh.deg, hs), why: 'The ladder is the slanted side (the hypotenuse); the wall is the vertical side.' }],
              'The wall meets the ground at a right angle. The ladder is the hypotenuse ' + t('L') + ', the ' + t(sh.h.toFixed(1) + '\\text{ m}') + ' runs up the wall, and the ' + t(dg(sh.deg)) + ' is at the foot of the ladder, between the ladder and the ground.', ['Where does the ladder touch the ground? That is where the angle with the ground is.'], 'ladder sketch');
            return p;
          } },
          { id: 'e8b', level: 'PRG', make: function (r, sh) {
            var hs = sh.h.toFixed(1);
            return sidePart({ prompt: 'Determine the length ' + t('L') + ' of the ladder, to the nearest tenth of a metre.', deg: sh.deg, k: sh.h, kStr: hs, kRole: 'opp', uRole: 'hyp', uName: 'L', unit: 'm', dp: 1, solPre: ladderFig(r, sh, 'L', 'd'), text: 'ladder L = ' + hs + ' / sin ' + sh.deg });
          } },
          { id: 'e8c', level: 'PRG', make: function (r, sh) {
            var hs = sh.h.toFixed(1), L = sh.h / TR.sin(sh.deg), LR = K.roundTo(L, 1);
            return sidePart({ prompt: 'Determine how far the foot of the ladder stands from the wall, ' + t('d') + ', to the nearest tenth of a metre. Work from the <b>given</b> ' + t(hs + '\\text{ m}') + '.', deg: sh.deg, k: sh.h, kStr: hs, kRole: 'opp', uRole: 'adj', uName: 'd', unit: 'm', dp: 1,
              alts: [{ v: LR * TR.cos(sh.deg), code: 'round-early', hint: 'Work from the given ' + t(hs + '\\text{ m}') + ', not from a rounded ladder length.' }], solPre: ladderFig(r, sh, 'L', 'd'), text: 'ladder d = ' + hs + ' / tan ' + sh.deg });
          } },
          { id: 'e8d', level: 'BEG', make: function (r, sh) {
            var L = fx(sh.h / TR.sin(sh.deg), 1), d = fx(sh.h / TR.tan(sh.deg), 1), hs = sh.h.toFixed(1);
            return mc(r, 'The ladder is ' + t('L\\approx ' + L + '\\text{ m}') + ' and its foot is ' + t('d\\approx ' + d + '\\text{ m}') + ' from the wall. Which side must be the longest, and do the answers agree?', [
              { html: 'The ladder (the hypotenuse): ' + t(L) + ' m is longer than both ' + t(hs) + ' m and ' + t(d) + ' m, so they agree.', right: true },
              { html: 'The wall height ' + t(hs) + ' m, because it was given.', why: 'Being given doesn’t make a side longest. The side across from the right angle — the ladder — is always longest.' },
              { html: 'The distance along the ground, because it is adjacent to the angle.', why: 'The adjacent leg is usually the shortest side here. The hypotenuse (the ladder) is longest.' },
              { html: 'No side has to be longest; it depends on the angle.', why: 'In every right triangle the hypotenuse is the longest side.' }],
              'The ladder is the hypotenuse, so it must be the longest side: ' + t(L + '>' + hs + '>' + d) + ' ✓.', ['Which side is across from the right angle?'], 'longest side check');
          } }] },
      { num: '9', shared: function (r) { return { h: tenth(r, 80, 160), deg: r.int(48, 66) }; },
        stem: function (sh) { return 'A guy wire is fastened to a vertical transmission tower at a point ' + t(sh.h.toFixed(1) + '\\text{ m}') + ' above level ground and is anchored to the ground, making an angle of ' + t(dg(sh.deg)) + ' with the ground. Sketch and label the triangle.'; },
        parts: [
          { id: 'e9a', level: 'PRG', make: function (r, sh) {
            var hs = sh.h.toFixed(1);
            return sidePart({ prompt: 'Determine the length ' + t('w') + ' of the guy wire to the nearest tenth of a metre.', deg: sh.deg, k: sh.h, kStr: hs, kRole: 'opp', uRole: 'hyp', uName: 'w', unit: 'm', dp: 1, solPre: wireFig(r, sh.deg, 'w', hs + ' m', 'd'), text: 'wire = ' + hs + ' / sin ' + sh.deg });
          } },
          { id: 'e9b', level: 'PRG', make: function (r, sh) {
            var hs = sh.h.toFixed(1), wR = K.roundTo(sh.h / TR.sin(sh.deg), 1);
            return sidePart({ prompt: 'Determine the distance ' + t('d') + ' from the base of the tower to the anchor point, to the nearest tenth of a metre, working from the given ' + t(hs + '\\text{ m}') + '.', deg: sh.deg, k: sh.h, kStr: hs, kRole: 'opp', uRole: 'adj', uName: 'd', unit: 'm', dp: 1,
              alts: [{ v: wR * TR.cos(sh.deg), code: 'round-early', hint: 'Work from the given ' + t(hs + '\\text{ m}') + ', not from a rounded wire length.' }], solPre: wireFig(r, sh.deg, 'w', hs + ' m', 'd'), text: 'anchor d = ' + hs + ' / tan ' + sh.deg });
          } },
          { id: 'e9c', level: 'EMG', make: function (r, sh) {
            return mc(r, 'A second wire is anchored the <b>same distance</b> from the base but runs to a point higher up the tower, so it makes a <b>larger</b> angle with the ground. Is it longer or shorter than the first wire?', [
              { html: 'Longer: wire ' + t('=d\\div\\cos\\theta') + ', and as ' + t('\\theta') + ' grows, ' + t('\\cos\\theta') + ' shrinks — dividing by a smaller number gives a longer wire.', right: true },
              { html: 'Shorter: wire ' + t('=d\\div\\cos\\theta') + ', and a larger angle makes ' + t('\\cos\\theta') + ' larger.', why: 'Check on your calculator: ' + t('\\cos 50^\\circ\\approx 0.64') + ' but ' + t('\\cos 70^\\circ\\approx 0.34') + '. Cosine gets <b>smaller</b> as the angle grows.' },
              { html: 'Shorter: a steeper wire always has less distance to cover.', why: 'It starts from the same anchor but has to reach higher up the tower.' },
              { html: 'The same length, because the anchor distance hasn’t changed.', why: 'The wire is the hypotenuse; the anchor distance is only one leg. The other leg (the height) grows.' }],
              'With the anchor distance ' + t('d') + ' fixed, ' + t('d') + ' is adjacent to the ground angle and the wire is the hypotenuse, so ' + t('\\text{wire}=\\dfrac{d}{\\cos\\theta}') + '. As ' + t('\\theta') + ' increases, ' + t('\\cos\\theta') + ' decreases, so the wire gets <b>longer</b>.', ['Write the wire length using the fixed distance ' + t('d') + ' and the angle. What happens to that ratio as the angle grows?'], 'steeper wire longer');
          } }] },
      { num: '10', shared: function (r) { return { h: r.int(45, 95) / 100, deg: r.int(35, 55) / 10 }; },
        stem: function (sh) { return 'A wheelchair ramp is to rise ' + t(sh.h.toFixed(2) + '\\text{ m}') + ' from the sidewalk to a doorway. The building code caps the angle between the ramp and the horizontal at ' + t(dg(sh.deg)) + '. Sketch and label the triangle.'; },
        parts: [
          { id: 'e10a', level: 'PRG', make: function (r, sh) {
            var hs = sh.h.toFixed(2);
            return sidePart({ prompt: 'Determine the length ' + t('s') + ' of the sloped surface of the ramp, to the nearest tenth of a metre.', deg: sh.deg, k: sh.h, kStr: hs, kRole: 'opp', uRole: 'hyp', uName: 's', unit: 'm', dp: 1, text: 'ramp slope = ' + hs + ' / sin ' + sh.deg });
          } },
          { id: 'e10b', level: 'PRG', make: function (r, sh) {
            var hs = sh.h.toFixed(2);
            return sidePart({ prompt: 'Determine the horizontal run ' + t('d') + ' the ramp needs, to the nearest tenth of a metre.', deg: sh.deg, k: sh.h, kStr: hs, kRole: 'opp', uRole: 'adj', uName: 'd', unit: 'm', dp: 1, text: 'ramp run = ' + hs + ' / tan ' + sh.deg });
          } },
          { id: 'e10c', level: 'EMG', make: function (r, sh) {
            var s = sh.h / TR.sin(sh.deg), d = sh.h / TR.tan(sh.deg), c = TR.cos(sh.deg);
            return mc(r, 'The sloped length and the horizontal run differ by only about ' + t(fx(s - d, 2) + '\\text{ m}') + '. Why are they so nearly equal?', [
              { html: 'The angle is tiny, so the triangle is almost flat: run ÷ slope ' + t('=\\cos ' + dg(sh.deg) + '\\approx ' + fx(c, 4)) + ', almost exactly ' + t('1') + '.', right: true },
              { html: 'One of the two answers must have been rounded wrong.', why: 'Both are right. Think about the shape: how steep is this triangle?' },
              { html: 'The rise is the hypotenuse, so the other two sides must be equal.', why: 'The rise is the shortest leg; the sloped surface is the hypotenuse.' },
              { html: 'Sine and tangent are always nearly equal.', why: 'Only for small angles: ' + t('\\sin 60^\\circ\\approx 0.87') + ' but ' + t('\\tan 60^\\circ\\approx 1.73') + '.' }],
              'The ramp is almost flat. The run is ' + t('\\cos ' + dg(sh.deg) + '\\approx ' + fx(c, 4)) + ' of the slope length, so the hypotenuse is barely longer than its own horizontal leg.', ['Compute run ÷ slope. Which ratio is that?'], 'nearly flat triangle');
          } }] },
      { num: '11', shared: function (r) { return { h: r.int(25, 70), deg: r.int(45, 68) }; },
        stem: function (sh) { return 'A kite is flying at the end of a taut, straight string. The kite is ' + t(sh.h + '\\text{ m}') + ' above the level of the hand holding the string, and the string makes an angle of ' + t(dg(sh.deg)) + ' with the horizontal. Sketch and label the triangle.'; },
        parts: [
          { id: 'e11a', level: 'PRG', make: function (r, sh) {
            return sidePart({ prompt: 'Determine the length ' + t('s') + ' of string let out, to the nearest tenth of a metre.', deg: sh.deg, k: sh.h, kStr: String(sh.h), kRole: 'opp', uRole: 'hyp', uName: 's', unit: 'm', dp: 1, solPre: kiteFig(r, sh.deg, 's', sh.h + ' m'), text: 'string = ' + sh.h + ' / sin ' + sh.deg });
          } },
          { id: 'e11b', level: 'PRG', make: function (r, sh) {
            return sidePart({ prompt: 'Determine the horizontal distance ' + t('d') + ' from the hand to the point directly beneath the kite, to the nearest tenth of a metre.', deg: sh.deg, k: sh.h, kStr: String(sh.h), kRole: 'opp', uRole: 'adj', uName: 'd', unit: 'm', dp: 1, text: 'kite d = ' + sh.h + ' / tan ' + sh.deg });
          } }] },
      { num: '12', shared: function (r) { return { h: tenth(r, 40, 95), deg: angle(r, 25, 55, true) }; },
        stem: function (sh) { return 'A flagpole ' + t(sh.h.toFixed(1) + '\\text{ m}') + ' tall stands vertically on level ground. The sun is at an angle of elevation of ' + t(dg(sh.deg)) + '.'; },
        parts: [
          { id: 'e12a', level: 'PRG', make: function (r, sh) {
            var hs = sh.h.toFixed(1);
            return sidePart({ prompt: 'Sketch and label the triangle, then determine the length ' + t('s') + ' of the flagpole’s shadow to the nearest tenth of a metre.', deg: sh.deg, k: sh.h, kStr: hs, kRole: 'opp', uRole: 'adj', uName: 's', unit: 'm', dp: 1, solPre: poleFig(r, sh.deg, 's', hs + ' m'), text: 'shadow = ' + hs + ' / tan ' + sh.deg });
          } },
          { id: 'e12b', level: 'EMG', make: function (r, sh) {
            var hs = sh.h.toFixed(1);
            return mc(r, 'As the morning goes on, the angle of elevation of the sun increases. What happens to the length of the shadow, and why?', [
              { html: 'It gets shorter: shadow ' + t('=' + hs + '\\div\\tan\\theta') + ', and ' + t('\\tan\\theta') + ' increases as ' + t('\\theta') + ' increases.', right: true },
              { html: 'It gets longer: shadow ' + t('=' + hs + '\\tan\\theta') + ', and ' + t('\\tan\\theta') + ' increases.', why: 'The shadow is the <b>adjacent</b> side and the pole is opposite, so the shadow is underneath: shadow ' + t('=' + hs + '\\div\\tan\\theta') + '.' },
              { html: 'It stays the same, because the flagpole doesn’t change height.', why: 'The pole stays the same, but the ratio ' + t('\\tan\\theta') + ' changes with the angle.' },
              { html: 'It gets shorter, because ' + t('\\tan\\theta') + ' decreases as ' + t('\\theta') + ' increases.', why: 'Right direction, wrong reason: ' + t('\\tan 30^\\circ\\approx 0.58') + ' and ' + t('\\tan 60^\\circ\\approx 1.73') + ', so tangent <b>increases</b>.' }],
              'The pole stays ' + t(hs + '\\text{ m}') + ', so ' + t('\\text{shadow}=\\dfrac{' + hs + '}{\\tan\\theta}') + '. As ' + t('\\theta') + ' increases toward ' + t('90^\\circ') + ', ' + t('\\tan\\theta') + ' increases, and dividing a fixed ' + t(hs) + ' by a larger number gives a <b>shorter</b> shadow.', ['Write the shadow in terms of the pole and ' + t('\\tan\\theta') + '. Then think about what tangent does as the angle grows.'], 'shadow shortens');
          } }] },
      /* ---------------- EP Part E ---------------- */
      { num: '13', section: 'Extra practice E — Pythagoras or trigonometry?', shared: e13Setup,
        stem: function (sh) { var n = sh.n; return 'In ' + t('\\triangle ' + n.tri) + ', ' + t('\\angle ' + n.rt + '=90^\\circ') + ', ' + t('\\angle ' + n.ang + '=' + dg(sh.deg)) + ', ' + t(sideOf(n, 'adj') + '=' + sh.k.toFixed(1) + '\\text{ cm}') + ' and ' + t(sideOf(n, 'hyp') + '=' + sh.hR.toFixed(1) + '\\text{ cm}') + '. The length of ' + t(sideOf(n, 'opp')) + ' is wanted.' + triFig(HW.rng(Math.round(sh.k * 977 + sh.deg)), sh.deg, { adj: sh.k.toFixed(1) + ' cm', hyp: sh.hR.toFixed(1) + ' cm', opp: sideOf(n, 'opp') }, n); },
        parts: [
          { id: 'e13a', level: 'BEG', make: function (r, sh) {
            var O = sideOf(sh.n, 'opp');
            return pythPart({ prompt: 'Determine ' + t(O) + ' using the Pythagorean theorem, to the nearest tenth.', find: 'leg', c: sh.hR, b: sh.k, cStr: sh.hR.toFixed(1), bStr: sh.k.toFixed(1), uName: O, unit: 'cm', dp: 1, text: 'Pythagoras ' + O });
          } },
          { id: 'e13b', level: 'BEG', make: function (r, sh) {
            var n = sh.n, O = sideOf(n, 'opp');
            return sidePart({ prompt: 'Determine ' + t(O) + ' using a trigonometric ratio built on ' + t('\\angle ' + n.ang) + ' and ' + t(sideOf(n, 'adj')) + ', to the nearest tenth.', deg: sh.deg, k: sh.k, kStr: sh.k.toFixed(1), kRole: 'adj', uRole: 'opp', kName: sideOf(n, 'adj'), uName: O, unit: 'cm', dp: 1, angTex: '\\angle ' + n.ang + '=' + dg(sh.deg), text: 'trig ' + O });
          } },
          { id: 'e13c', level: 'EMG', make: function (r, sh) {
            var n = sh.n, H = sideOf(n, 'hyp'), A = sideOf(n, 'adj'), hs = sh.hR.toFixed(1);
            return mc(r, 'The Pythagorean theorem gives ' + t(dots(sh.qr1)) + ' and trigonometry gives ' + t(dots(sh.qr2)) + ': the same to the nearest tenth, but not digit for digit. Which given number is responsible?', [
              { html: 'The ' + t(hs + '\\text{ cm}') + ': it is itself rounded (the exact hypotenuse is ' + t(dots(sh.hyp)) + '), and the Pythagorean theorem starts from it.', right: true },
              { html: 'The ' + t(sh.k.toFixed(1) + '\\text{ cm}') + ': it is rounded, so the trig answer is off.', why: t(A + '=' + sh.k.toFixed(1)) + ' is used by <b>both</b> methods, so it can’t explain a difference between them.' },
              { html: 'The ' + t(dg(sh.deg)) + ': angles are only estimates, so trigonometry is less exact.', why: 'The angle is exact here. Check: ' + t(sh.k.toFixed(1) + '\\div\\cos ' + dg(sh.deg) + '=' + dots(sh.hyp)) + ', not exactly ' + t(hs) + '.' },
              { html: 'None of them — the Pythagorean theorem always has a small error.', why: 'The Pythagorean theorem is exact. The difference comes from a number that was put into it.' }],
              'The hypotenuse should be ' + t(sh.k.toFixed(1) + '\\div\\cos ' + dg(sh.deg) + '=' + dots(sh.hyp)) + ', which was written as ' + t(hs) + '. Pythagoras starts from that rounded number, so it lands slightly off the trigonometric value — only in the second decimal place, so both still round to ' + t(fx(sh.qr2, 1)) + '.', ['Which of the given numbers could be a rounded value of something exact?'], 'which number is rounded');
          } },
          { id: 'e13d', level: 'EMG', make: function (r, sh) {
            var hs = sh.hR.toFixed(1);
            return K.P.grid('Suppose one piece of information were erased. Which tool still finds ' + t(sideOf(sh.n, 'opp')) + '?', [{ id: 'side', html: 'Only the ' + t(hs + '\\text{ cm}') + ' is erased' }, { id: 'ang', html: 'Only the ' + t(dg(sh.deg)) + ' is erased' }],
              [{ id: 'pyth', html: 'Pythagoras' }, { id: 'trig', html: 'Trig ratio' }, { id: 'both', html: 'Both' }, { id: 'none', html: 'Neither' }], { side: 'trig', ang: 'pyth' },
              { why: function (row) { return row === 'side' ? 'With the hypotenuse gone only one side is left. Pythagoras needs <b>two</b> sides; a trig ratio needs one side and one acute angle.' : 'With the angle gone, every trig ratio is missing its angle — but two sides remain.'; } },
              '<b>Erase the ' + t(hs) + ':</b> only one side is left, so the Pythagorean theorem fails; trigonometry still works (one side and one acute angle).<br><b>Erase the ' + t(dg(sh.deg)) + ':</b> trigonometry fails (no angle); the Pythagorean theorem still works (two sides).', ['Pythagoras needs two sides. A trig ratio needs one side and one acute angle.'], 'which tool still works');
          } }] },
      /* ---------------- EP Part F ---------------- */
      { num: '14', section: 'Extra practice F — Is the answer even possible?', shared: function (r) { return { n: names3(r), deg: r.int(25, 40), k: tenth(r, 120, 300) }; },
        stem: function (sh) { var n = sh.n, O = sideOf(n, 'opp'), H = sideOf(n, 'hyp'), D = dg(sh.deg), k = sh.k.toFixed(1); return 'In ' + t('\\triangle ' + n.tri) + ', ' + t('\\angle ' + n.rt + '=90^\\circ') + ', ' + t('\\angle ' + n.ang + '=' + D) + ' and the hypotenuse ' + t(H + '=' + k + '\\text{ cm}') + '. Asked for ' + t(O) + ', a student writes ' + t('\\sin ' + D + '=\\dfrac{' + O + '}{' + k + '}') + ', ' + t(O + '=\\dfrac{' + k + '}{\\sin ' + D + '}=' + fx(sh.k / TR.sin(sh.deg), 1) + '\\text{ cm}') + '.'; },
        parts: [
          { id: 'e14a', level: 'BEG', make: function (r, sh) {
            var O = sideOf(sh.n, 'opp'), H = sideOf(sh.n, 'hyp'), w = fx(sh.k / TR.sin(sh.deg), 1), k = sh.k.toFixed(1);
            return mc(r, 'Without recalculating anything, why can’t ' + t(w + '\\text{ cm}') + ' be right?', [
              { html: t(O) + ' is a leg and ' + t(H + '=' + k) + ' cm is the hypotenuse; a leg can never be longer than the hypotenuse.', right: true },
              { html: 'The answer should be in degrees, not centimetres.', why: t(O) + ' is a side length, so centimetres is right.' },
              { html: 'Sine values are bigger than ' + t('1') + ', so dividing by ' + t('\\sin ' + dg(sh.deg)) + ' should make the answer smaller.', why: 'The sine of an acute angle is between ' + t('0') + ' and ' + t('1') + '.' },
              { html: 'The answer must be less than ' + t(sh.deg) + ' because the angle is ' + t(dg(sh.deg)) + '.', why: 'An angle in degrees and a length in centimetres can’t be compared.' }],
              t(O) + ' is a <b>leg</b> and ' + t(H) + ' is the <b>hypotenuse</b>; a leg is always shorter than the hypotenuse, so ' + t(w + '>' + k) + ' is impossible.', ['Which side of a right triangle is always the longest?'], 'impossible leg');
          } },
          { id: 'e14b', level: 'EMG', make: function (r, sh) {
            var O = sideOf(sh.n, 'opp'), k = sh.k.toFixed(1), D = dg(sh.deg);
            return mc(r, 'The first line the student wrote is correct. What went wrong between the first line and the second?', [
              { html: t(O) + ' is in the <b>numerator</b>, so they should have multiplied by ' + t(k) + '; instead they divided ' + t(k) + ' by ' + t('\\sin ' + D) + '.', right: true },
              { html: 'They should have used cosine, not sine.', why: t(O) + ' is opposite ' + t('\\angle ' + sh.n.ang) + ' and ' + t(sideOf(sh.n, 'hyp')) + ' is the hypotenuse — sine is right. The first line is correct.' },
              { html: 'They should have used the other acute angle, ' + t(dg(90 - sh.deg)) + '.', why: 'Either angle can work, but the first line with ' + t(D) + ' is already correct. The slip is in the next step.' },
              { html: 'Their calculator was in radian mode.', why: 'In radian mode the division gives ' + t(fx(sh.k / TR.radSin(sh.deg), 1)) + ', not ' + t(fx(sh.k / TR.sin(sh.deg), 1)) + '.' }],
              t(O) + ' was in the <b>numerator</b>, so the equation is cleared by <b>multiplying</b> both sides by ' + t(k) + '. Dividing ' + t(k) + ' by ' + t('\\sin ' + D) + ' is the move for an unknown in the denominator — a multiply/divide flip.', ['In ' + t('\\sin ' + D + '=\\frac{' + O + '}{' + k + '}') + ', is ' + t(O) + ' on top or underneath?'], 'multiply/divide flip');
          } },
          { id: 'e14c', level: 'BEG', make: function (r, sh) {
            var n = sh.n, O = sideOf(n, 'opp');
            return sidePart({ prompt: 'Determine ' + t(O) + ' correctly, to the nearest tenth.', deg: sh.deg, k: sh.k, kStr: sh.k.toFixed(1), kRole: 'hyp', uRole: 'opp', kName: sideOf(n, 'hyp'), uName: O, unit: 'cm', dp: 1, angTex: '\\angle ' + n.ang + '=' + dg(sh.deg), text: O + ' = ' + sh.k + ' sin ' + sh.deg });
          } },
          { id: 'e14d', level: 'BEG', make: function (r, sh) {
            var n = sh.n, A = sideOf(n, 'adj');
            return sidePart({ prompt: 'Determine ' + t(A) + ' as well, to the nearest tenth.', deg: sh.deg, k: sh.k, kStr: sh.k.toFixed(1), kRole: 'hyp', uRole: 'adj', kName: sideOf(n, 'hyp'), uName: A, unit: 'cm', dp: 1, angTex: '\\angle ' + n.ang + '=' + dg(sh.deg), solPost: '<br>Sides: ' + t(fx(sh.k * TR.sin(sh.deg), 1) + ',\\ ' + fx(sh.k * TR.cos(sh.deg), 1) + ',\\ ' + sh.k.toFixed(1)) + ' — the hypotenuse is the longest ✓', text: A + ' = ' + sh.k + ' cos ' + sh.deg });
          } },
          { id: 'e14e', level: 'EMG', make: function (r, sh) {
            var n = sh.n, O = sideOf(n, 'opp'), A = sideOf(n, 'adj'), o = fx(sh.k * TR.sin(sh.deg), 1), a = fx(sh.k * TR.cos(sh.deg), 1);
            return mc(r, 'You found ' + t(O + '\\approx ' + o) + ' and ' + t(A + '\\approx ' + a) + '. Since ' + t(dg(sh.deg) + '<45^\\circ') + ', which leg <i>had</i> to be the shorter one?', [
              { html: t(O) + ', the side opposite the ' + t(dg(sh.deg)) + ' angle — and ' + t(o + '<' + a) + ' agrees.', right: true },
              { html: t(A) + ', the side adjacent to the ' + t(dg(sh.deg)) + ' angle.', why: 'The other acute angle is ' + t(dg(90 - sh.deg)) + ', the larger one. The leg opposite the <b>smaller</b> angle is the shorter leg.' },
              { html: t(sideOf(n, 'hyp')) + ', because the angle is small.', why: t(sideOf(n, 'hyp')) + ' is the hypotenuse, not a leg — and it is always the longest side.' },
              { html: 'Neither: the two legs must be equal.', why: 'The legs are equal only when both acute angles are ' + t('45^\\circ') + '.' }],
              'The other acute angle is ' + t(dg(90 - sh.deg)) + ', so ' + t(dg(sh.deg)) + ' is the smaller one and the leg opposite it, ' + t(O) + ', is shorter: ' + t(o + '<' + a) + ' ✓.', ['The longer leg is opposite the larger acute angle.'], 'shorter leg');
          } }] },
      /* ---------------- EP Part G ---------------- */
      { num: '15', section: 'Extra practice G — Error analysis', shared: function (r) { return { n: names3(r), deg: r.int(22, 38), k: tenth(r, 90, 200) }; },
        stem: function (sh) { var n = sh.n; return 'In ' + t('\\triangle ' + n.tri) + ', ' + t('\\angle ' + n.rt + '=90^\\circ') + ', ' + t('\\angle ' + n.ang + '=' + dg(sh.deg)) + ' and ' + t(sideOf(n, 'opp') + '=' + sh.k.toFixed(1) + '\\text{ mm}') + '. Asked for the hypotenuse ' + t(sideOf(n, 'hyp')) + ', a student writes ' + t(sideOf(n, 'hyp') + '=' + sh.k.toFixed(1) + '\\sin ' + dg(sh.deg) + '=' + fx(sh.k * TR.sin(sh.deg), 1) + '\\text{ mm}') + '.'; },
        parts: [
          { id: 'e15a', level: 'BEG', make: function (r, sh) {
            var n = sh.n, H = sideOf(n, 'hyp'), O = sideOf(n, 'opp'), w = fx(sh.k * TR.sin(sh.deg), 1), k = sh.k.toFixed(1);
            return mc(r, 'Which check rejects ' + t(w + '\\text{ mm}') + ' in one line?', [
              { html: t(H) + ' is the hypotenuse, so it must be longer than the leg ' + t(O + '=' + k) + ' mm; ' + t(w) + ' mm is shorter.', right: true },
              { html: 'A side opposite a small angle must be longer than ' + t(k) + ' mm.', why: 'Small angles have <b>short</b> opposite sides. The check is about the hypotenuse.' },
              { html: 'There is no error: multiplying by a sine always gives a side shorter than the one you started with.', why: 'That is exactly why it is wrong here: the hypotenuse must be <b>longer</b> than the leg.' },
              { html: 'The answer should be in degrees.', why: t(H) + ' is a length.' }],
              t(H) + ' is the <b>hypotenuse</b>, so it must be longer than the leg ' + t(O + '=' + k) + ' mm. ' + t(w + '<' + k) + ', which is impossible.', ['Which side of a right triangle is always the longest?'], 'impossibility check');
          } },
          { id: 'e15b', level: 'EMG', make: function (r, sh) {
            var n = sh.n, H = sideOf(n, 'hyp'), k = sh.k.toFixed(1), D = dg(sh.deg);
            return mc(r, 'Where does the unknown ' + t(H) + ' actually sit in the correct ratio, and what operation does that force?', [
              { html: 'In the denominator of ' + t('\\sin ' + D + '=\\dfrac{' + k + '}{' + H + '}') + ', so the last step is a division: ' + t(H + '=' + k + '\\div\\sin ' + D) + '.', right: true },
              { html: 'In the numerator of ' + t('\\sin ' + D + '=\\dfrac{' + H + '}{' + k + '}') + ', so multiply.', why: 'Sine is opposite ÷ hypotenuse: the hypotenuse is always the <b>bottom</b>.' },
              { html: 'In the denominator of ' + t('\\tan ' + D + '=\\dfrac{' + k + '}{' + H + '}') + ', so divide.', why: 'Tangent relates the two legs; the hypotenuse never appears in it.' },
              { html: 'In the numerator of ' + t('\\cos ' + D + '=\\dfrac{' + H + '}{' + k + '}') + ', so multiply.', why: 'Cosine is adjacent ÷ hypotenuse, and ' + t(k) + ' is opposite the angle, not adjacent.' }],
              'Relative to ' + t('\\angle ' + n.ang) + ', ' + t(sideOf(n, 'opp') + '=' + k) + ' is opposite and ' + t(H) + ' is the hypotenuse: ' + t('\\sin ' + D + '=\\dfrac{' + k + '}{' + H + '}') + '. The unknown is in the <b>denominator</b>, so cross-multiply and <b>divide</b>.', ['The hypotenuse is always the bottom of sine and cosine.'], 'where the hyp sits');
          } },
          { id: 'e15c', level: 'EMG', make: function (r, sh) {
            var n = sh.n, H = sideOf(n, 'hyp');
            return sidePart({ prompt: 'Determine ' + t(H) + ' correctly, to the nearest tenth of a millimetre.', deg: sh.deg, k: sh.k, kStr: sh.k.toFixed(1), kRole: 'opp', uRole: 'hyp', kName: sideOf(n, 'opp'), uName: H, unit: 'mm', dp: 1, angTex: '\\angle ' + n.ang + '=' + dg(sh.deg), text: H + ' = ' + sh.k + ' / sin ' + sh.deg });
          } },
          { id: 'e15d', level: 'PRG', make: function (r, sh) {
            var n = sh.n, H = sideOf(n, 'hyp'), O = sideOf(n, 'opp'), A = sideOf(n, 'adj'), w = fx(sh.k * TR.sin(sh.deg), 1), k = sh.k.toFixed(1);
            return mc(r, 'The student’s ' + t(w + '\\text{ mm}') + ' is a correct length for a <i>different</i> question. Which one?', [
              { html: 'If the hypotenuse ' + t(H) + ' were ' + t(k) + ' mm, how long would ' + t(O) + ' be?', right: true },
              { html: 'How long is ' + t(A) + '?', why: t(A + '=' + k + '\\div\\tan ' + dg(sh.deg) + '\\approx ' + fx(sh.k / TR.tan(sh.deg), 1)) + ' mm, not ' + t(w) + '.' },
              { html: 'How long is ' + t(H) + '?', why: t(H) + ' is ' + t(fx(sh.k / TR.sin(sh.deg), 1)) + ' mm — that is the correct answer to the original question.' },
              { html: 'What is the third angle?', why: 'The third angle is ' + t(dg(90 - sh.deg)) + ' — and the student’s answer is a length.' }],
              t(k + '\\sin ' + dg(sh.deg) + '=' + w) + ' is the side <b>opposite</b> a ' + t(dg(sh.deg)) + ' angle in a right triangle whose <b>hypotenuse</b> is ' + t(k) + ' mm. So it answers: “If ' + t(H) + ' were ' + t(k) + ' mm, how long would ' + t(O) + ' be?”', [t(k + '\\sin\\theta') + ' multiplies a <b>hypotenuse</b> by sine. Which side does that give?'], 'what the wrong number means');
          } }] },
      { num: '16', shared: function (r) { return { n: names3(r), deg: r.int(22, 35), k: tenth(r, 120, 260) }; },
        stem: function (sh) { var n = sh.n, O = sideOf(n, 'opp'), k = sh.k.toFixed(1), od = 90 - sh.deg; return 'In ' + t('\\triangle ' + n.tri) + ', ' + t('\\angle ' + n.rt + '=90^\\circ') + ', ' + t('\\angle ' + n.ang + '=' + dg(sh.deg)) + ' and the hypotenuse ' + t(sideOf(n, 'hyp') + '=' + k + '\\text{ cm}') + '. Asked for ' + t(O) + ', a student reasons that the third angle is ' + t(dg(od)) + ' and writes ' + t(O + '=' + k + '\\sin ' + dg(od) + '=' + fx(sh.k * TR.sin(od), 1) + '\\text{ cm}') + '.'; },
        parts: [
          { id: 'e16a', level: 'EMG', make: function (r, sh) {
            var n = sh.n, od = 90 - sh.deg, O = sideOf(n, 'opp'), A = sideOf(n, 'adj');
            return mc(r, 'The ' + t(dg(od)) + ' really is the third angle, so the arithmetic is sound. Why is the answer wrong?', [
              { html: 'A ratio names sides relative to the angle it uses. From ' + t('\\angle ' + n.oth + '=' + dg(od)) + ', sine gives the side opposite ' + t(n.oth) + ', which is ' + t(A) + ', not ' + t(O) + '.', right: true },
              { html: 'The third angle is actually ' + t(dg(180 - sh.deg)) + '.', why: 'The angles add to ' + t('180^\\circ') + ' and one is ' + t('90^\\circ') + ', so the third is ' + t(dg(od)) + '.' },
              { html: 'Sine can only be used with the smallest angle of the triangle.', why: 'Any acute angle works, as long as the sides are named from that angle.' },
              { html: t(sideOf(n, 'hyp')) + ' is not the hypotenuse.', why: t(sideOf(n, 'hyp')) + ' is across from the right angle at ' + t(n.rt) + ', so it is the hypotenuse.' }],
              'Built on ' + t('\\angle ' + n.oth + '=' + dg(od)) + ', the sine ratio returns the side <b>opposite</b> ' + t(n.oth) + ' — that is ' + t(A) + ', not ' + t(O) + '. Switching to the other acute angle switches which side the answer describes.', ['From the ' + t(dg(od)) + ' angle at ' + t(n.oth) + ', which side is opposite?'], 'other angle error');
          } },
          { id: 'e16b', level: 'EMG', make: function (r, sh) {
            var n = sh.n, od = 90 - sh.deg, O = sideOf(n, 'opp'), A = sideOf(n, 'adj'), H = sideOf(n, 'hyp'), w = fx(sh.k * TR.sin(od), 1);
            return mc(r, 'The value ' + t(w + '\\text{ cm}') + ' is in fact the length of one side of this triangle. Which one?', [
              { html: t(A), right: true },
              { html: t(O), why: 'That is the side the student wanted, but from ' + t(n.oth) + ' the sine gives the side opposite ' + t(n.oth) + '.' },
              { html: t(H), why: t(H) + ' is the given hypotenuse, ' + t(sh.k.toFixed(1)) + ' cm.' },
              { html: 'None of the sides', why: 'Sine of ' + t(dg(od)) + ' times the hypotenuse is a real side: the one opposite ' + t(n.oth) + '.' }],
              t(w) + ' cm is ' + t(A) + ', the side opposite ' + t('\\angle ' + n.oth) + ' (equivalently, adjacent to ' + t('\\angle ' + n.ang) + '): ' + t(A + '=' + sh.k.toFixed(1) + '\\sin ' + dg(od) + '=' + sh.k.toFixed(1) + '\\cos ' + dg(sh.deg) + '=' + dots(sh.k * TR.sin(od))) + '.', ['Which side is opposite the ' + t(dg(od)) + ' angle?'], 'which side is it');
          } },
          { id: 'e16c', level: 'BEG', make: function (r, sh) {
            var n = sh.n, O = sideOf(n, 'opp'), od = 90 - sh.deg;
            return sidePart({ prompt: 'Determine ' + t(O) + ' correctly, to the nearest tenth of a centimetre.', deg: sh.deg, k: sh.k, kStr: sh.k.toFixed(1), kRole: 'hyp', uRole: 'opp', kName: sideOf(n, 'hyp'), uName: O, unit: 'cm', dp: 1, angTex: '\\angle ' + n.ang + '=' + dg(sh.deg),
              alts: [{ v: sh.k * TR.sin(od), code: 'other-angle', hint: 'That is the student’s answer — the side opposite the ' + t(dg(od)) + ' angle. ' + t(O) + ' is opposite ' + t('\\angle ' + n.ang + '=' + dg(sh.deg)) + '.' }], text: O + ' = ' + sh.k + ' sin ' + sh.deg });
          } },
          { id: 'e16d', level: 'EMG', make: function (r, sh) {
            var n = sh.n, O = sideOf(n, 'opp'), od = 90 - sh.deg, k = sh.k.toFixed(1), Do = dg(od);
            return mc(r, 'Which is the one correct equation for ' + t(O) + ' that <i>does</i> use the ' + t(Do) + '?', [
              { html: t('\\cos ' + Do + '=\\dfrac{' + O + '}{' + k + '}'), right: true },
              { html: t('\\sin ' + Do + '=\\dfrac{' + O + '}{' + k + '}'), why: 'That is the student’s equation. From ' + t(n.oth) + ', ' + t(O) + ' is <b>adjacent</b>, not opposite.' },
              { html: t('\\tan ' + Do + '=\\dfrac{' + O + '}{' + k + '}'), why: 'Tangent relates the two legs, but ' + t(k) + ' is the hypotenuse.' },
              { html: t('\\cos ' + Do + '=\\dfrac{' + k + '}{' + O + '}'), why: 'Cosine is adjacent ÷ hypotenuse: the hypotenuse ' + t(k) + ' belongs in the denominator.' }],
              'From ' + t('\\angle ' + n.oth + '=' + Do) + ', ' + t(O) + ' is <b>adjacent</b> and ' + t(sideOf(n, 'hyp')) + ' is the hypotenuse, so ' + t('\\cos ' + Do + '=\\dfrac{' + O + '}{' + k + '}') + ' and ' + t(O + '=' + k + '\\cos ' + Do + '=' + dots(sh.k * TR.sin(sh.deg)) + '\\approx ' + fx(sh.k * TR.sin(sh.deg), 1)) + ' — the same answer.', ['Name the sides from the ' + t(Do) + ' angle at ' + t(n.oth) + '.'], 'equation with other angle');
          } }] },
      { num: '17', shared: function (r) { return { n: names3(r), deg: r.int(50, 65), k: tenth(r, 80, 160) }; },
        stem: function (sh) { var n = sh.n, H = sideOf(n, 'hyp'), k = sh.k.toFixed(1), D = dg(sh.deg); return 'In ' + t('\\triangle ' + n.tri) + ', ' + t('\\angle ' + n.rt + '=90^\\circ') + ', ' + t('\\angle ' + n.ang + '=' + D) + ' and ' + t(sideOf(n, 'adj') + '=' + k + '\\text{ cm}') + '. Asked for the hypotenuse ' + t(H) + ', a student writes ' + t('\\tan ' + D + '=\\dfrac{' + k + '}{' + H + '}') + ', so ' + t(H + '=\\dfrac{' + k + '}{\\tan ' + D + '}=' + fx(sh.k / TR.tan(sh.deg), 1) + '\\text{ cm}') + '.'; },
        parts: [
          { id: 'e17a', level: 'BEG', make: function (r, sh) {
            var n = sh.n, H = sideOf(n, 'hyp'), A = sideOf(n, 'adj'), w = fx(sh.k / TR.tan(sh.deg), 1), k = sh.k.toFixed(1);
            return mc(r, 'Which leg-versus-hypotenuse fact does ' + t(w + '\\text{ cm}') + ' break?', [
              { html: 'Every leg is shorter than the hypotenuse — but ' + t(w) + ' is shorter than the leg ' + t(A + '=' + k) + '.', right: true },
              { html: 'The two legs must be equal.', why: 'Only in a ' + t('45^\\circ') + ' right triangle.' },
              { html: 'The hypotenuse must be exactly twice the shorter leg.', why: 'That is true only when one angle is ' + t('30^\\circ') + '.' },
              { html: 'The hypotenuse must be shorter than the sum of the legs, so it can be any length less than that.', why: 'That is true, but ' + t(w) + ' breaks a stronger rule: compare it with the leg ' + t(k) + '.' }],
              t(H) + ' is the hypotenuse, so it must be longer than the leg ' + t(A + '=' + k) + '. ' + t(w + '<' + k) + ', so the answer is impossible.', ['Which side is always the longest?'], 'hyp shorter than leg');
          } },
          { id: 'e17b', level: 'EMG', make: function (r, sh) {
            var n = sh.n, H = sideOf(n, 'hyp'), A = sideOf(n, 'adj'), D = dg(sh.deg), k = sh.k.toFixed(1);
            return mc(r, 'This slip is not a multiply/divide flip — the division was carried out correctly. What is the actual error?', [
              { html: 'The wrong ratio: tangent uses the two legs only, but ' + t(H) + ' is the hypotenuse. The ratio holding ' + t(A) + ' (adjacent) and ' + t(H) + ' is cosine.', right: true },
              { html: 'They should have multiplied by ' + t('\\tan ' + D) + ' instead of dividing.', why: 'That gives ' + t(fx(sh.k * TR.tan(sh.deg), 1)) + ' cm, which is the other leg, not the hypotenuse.' },
              { html: 'Their calculator was in radian mode.', why: 'In radian mode the answer would be ' + t(fx(sh.k / TR.radTan(sh.deg), 1)) + '. The calculation is right; the ratio is not.' },
              { html: 'They should have used ' + t('\\angle ' + n.oth) + ' instead.', why: 'Either acute angle works if the sides are named from it. The problem is the ratio chosen.' }],
              '<b>The wrong ratio was chosen.</b> Tangent relates the two legs only — the hypotenuse never appears in it. With ' + t(A) + ' adjacent to ' + t('\\angle ' + n.ang) + ' and ' + t(H) + ' the hypotenuse, the ratio is ' + t('\\cos ' + D + '=\\dfrac{' + k + '}{' + H + '}') + '.', ['Does the hypotenuse ever appear in ' + t('\\tan=\\frac{\\text{opp}}{\\text{adj}}') + '?'], 'wrong ratio error');
          } },
          { id: 'e17c', level: 'EMG', make: function (r, sh) {
            var n = sh.n, H = sideOf(n, 'hyp');
            return sidePart({ prompt: 'Determine ' + t(H) + ' correctly, to the nearest tenth of a centimetre.', deg: sh.deg, k: sh.k, kStr: sh.k.toFixed(1), kRole: 'adj', uRole: 'hyp', kName: sideOf(n, 'adj'), uName: H, unit: 'cm', dp: 1, angTex: '\\angle ' + n.ang + '=' + dg(sh.deg),
              alts: [{ v: sh.k / TR.tan(sh.deg), code: 'wrong-ratio', hint: 'That is the student’s tangent answer. The hypotenuse appears in sine and cosine, not tangent — which one holds the adjacent side?' }], text: H + ' = ' + sh.k + ' / cos ' + sh.deg });
          } },
          { id: 'e17d', level: 'BEG', make: function (r, sh) {
            var n = sh.n, O = sideOf(n, 'opp');
            return sidePart({ prompt: 'The student’s ' + t(fx(sh.k / TR.tan(sh.deg), 1) + '\\text{ cm}') + ' is not the length of any side. Find the other leg, ' + t(O) + ', to the nearest tenth.', deg: sh.deg, k: sh.k, kStr: sh.k.toFixed(1), kRole: 'adj', uRole: 'opp', kName: sideOf(n, 'adj'), uName: O, unit: 'cm', dp: 1, angTex: '\\angle ' + n.ang + '=' + dg(sh.deg),
              solPost: '<br>The three sides are ' + t(sh.k.toFixed(1)) + ', ' + t(fx(sh.k * TR.tan(sh.deg), 1)) + ' and ' + t(fx(sh.k / TR.cos(sh.deg), 1)) + ' cm — ' + t(fx(sh.k / TR.tan(sh.deg), 1)) + ' is none of them.', text: O + ' = ' + sh.k + ' tan ' + sh.deg });
          } }] },
      /* ---------------- EP Part H ---------------- */
      { num: '18', section: 'Extra practice H — Stretch', shared: function (r) { var short = r.pick(['BC', 'AC']), L = r.pick([9, 12, 15, 18, 21, 24]); return { short: short, L: L, A: short === 'BC' ? 30 : 60, fl: r.chance(0.5), rot: r.int(0, 3) }; },
        stem: function (sh) { var long = sh.short === 'BC' ? 'AC' : 'BC'; return 'In ' + t('\\triangle ABC') + ', ' + t('\\angle C=90^\\circ') + ' and the hypotenuse ' + t('AB') + ' is exactly <b>twice</b> as long as the leg ' + t(sh.short) + '. Write ' + t(sh.short + '=x') + ', so that ' + t('AB=2x') + '.' +
          '<div class="fig">' + HW.tri({ w: 4 / Math.max(1, Math.tan(sh.A * Math.PI / 180)), h: 4 * Math.tan(sh.A * Math.PI / 180) / Math.max(1, Math.tan(sh.A * Math.PI / 180)), names: ['A', 'B', 'C'], sides: sh.short === 'BC' ? { a: 'x', c: '2x' } : { b: 'x', c: '2x' }, angles: {}, rot: sh.rot, flip: sh.fl, width: 240 }) + '</div>'; },
        parts: [
          { id: 'e18a', level: 'ADV', make: function (r, sh) {
            var A = sh.A, fn = sh.short === 'BC' ? 'sin' : 'cos';
            return { prompt: 'Write ' + t('\\' + fn + ' A') + ' as a ratio in terms of ' + t('x') + ' and simplify it. Without using an inverse function, what is ' + t('\\angle A') + '?', input: { type: 'number', after: '°' }, key: String(A), answer: t(dg(A)), text: 'angle with hyp = 2 × leg',
              check: unitWrap(K.number(A, function (v) {
                if (v === 90 - A) return { code: 'other-angle', hint: 'That is ' + t('\\angle B') + '. ' + t(sh.short) + ' is ' + (fn === 'sin' ? 'opposite' : 'adjacent to') + ' ' + t('\\angle A') + ', so ' + t('\\' + fn + ' A=\\frac{x}{2x}') + '. Which angle has that ratio?' };
                if (Math.abs(v - 0.5) < 1e-9) return { code: 'ratio-not-angle', hint: t('\\frac12') + ' is the value of ' + t('\\' + fn + ' A') + '. Which acute angle has ' + (fn === 'sin' ? 'sine' : 'cosine') + ' equal to ' + t('\\frac12') + '?' };
                if (Math.abs(v - 2) < 1e-9) return { code: 'flip', hint: 'The ratio is ' + t(sh.short) + ' over the hypotenuse: ' + t('\\frac{x}{2x}') + ', not ' + t('\\frac{2x}{x}') + '. Then find the angle.' };
                return null;
              })),
              solution: 'Relative to ' + t('\\angle A') + ': ' + t(sh.short + '=x') + ' is the ' + (fn === 'sin' ? '<b>opposite</b>' : '<b>adjacent</b>') + ' side and ' + t('AB=2x') + ' is the hypotenuse.<br>' + t('\\' + fn + ' A=\\dfrac{x}{2x}=\\dfrac12') + '. The ' + t('x') + ' cancels, and since ' + t('\\' + fn + ' ' + dg(A) + '=\\frac12') + ', ' + t('\\angle A=' + dg(A)) + '.',
              hints: ['Which ratio uses ' + t(sh.short) + ' and the hypotenuse, relative to ' + t('\\angle A') + '?', 'After the ' + t('x') + ' cancels, the ratio is ' + t('\\frac12') + '. Try ' + t('\\sin 30^\\circ') + ' and ' + t('\\cos 30^\\circ') + ' on your calculator.'] };
          } },
          { id: 'e18b', level: 'PRG', make: function (r, sh) {
            var long = sh.short === 'BC' ? 'AC' : 'BC', Ls = sh.L.toFixed(1);
            return sidePart({ prompt: 'Given also that ' + t(long + '=' + Ls + '\\text{ cm}') + ' and ' + t('\\angle A=' + dg(sh.A)) + ', use a trigonometric ratio to determine ' + t('AB') + ' to the nearest tenth of a centimetre.', deg: sh.A, k: sh.L, kStr: Ls, kRole: sh.A === 30 ? 'adj' : 'opp', uRole: 'hyp', kName: long, uName: 'AB', unit: 'cm', dp: 1, angTex: '\\angle A=' + dg(sh.A), text: 'AB from ' + long + ' = ' + Ls });
          } },
          { id: 'e18c', level: 'PRG', make: function (r, sh) {
            var long = sh.short === 'BC' ? 'AC' : 'BC', Ls = sh.L.toFixed(1), AB = sh.L / Math.cos(Math.PI / 6);
            return sidePart({ prompt: 'With ' + t(long + '=' + Ls + '\\text{ cm}') + ' and ' + t('\\angle A=' + dg(sh.A)) + ', determine ' + t('x') + ' to the nearest tenth (from ' + t('AB=2x') + ', or from a trigonometric ratio built on ' + t(long) + ' — both give the same value).', deg: sh.A, k: sh.L, kStr: Ls, kRole: sh.A === 30 ? 'adj' : 'opp', uRole: sh.A === 30 ? 'opp' : 'adj', kName: long, uName: 'x', unit: 'cm', dp: 1, angTex: '\\angle A=' + dg(sh.A),
              alts: [{ v: K.roundTo(AB, 1) / 2, code: 'round-early', hint: 'Halve the <b>unrounded</b> ' + t('AB=' + dots(AB)) + ', then round.' }, { v: AB, code: 'skip-given', hint: 'That is ' + t('AB=2x') + '. Halve it to get ' + t('x') + '.' }],
              solPost: '<br>Check: ' + t('x=\\dfrac{AB}{2}=\\dfrac{' + dots(AB) + '}{2}=' + dots(AB / 2)) + ' ✓', text: 'x from ' + long + ' = ' + Ls });
          } },
          { id: 'e18d', level: 'EMG', make: function (r, sh) {
            var long = sh.short === 'BC' ? 'AC' : 'BC', Ls = sh.L.toFixed(1), AB = sh.L / Math.cos(Math.PI / 6), x2 = AB * AB - sh.L * sh.L, ABr = K.roundTo(AB, 1);
            return nearPart('Confirm ' + t('x') + ' a third time with the Pythagorean theorem, using the <b>unrounded</b> ' + t('AB=' + dots(AB)) + ' and ' + t(long + '=' + Ls) + '. To the nearest whole number, ' + t('x^2=AB^2-' + long + '^2=') + ' ?', x2, 0,
              { alts: [{ v: ABr * ABr - sh.L * sh.L, code: 'round-early', hint: 'Use every digit of ' + t('AB') + ', not the rounded ' + t(ABr.toFixed(1)) + '.' }, { v: AB * AB + sh.L * sh.L, code: 'pyth-add', hint: t('x') + ' is a leg and ' + t('AB') + ' the hypotenuse, so subtract: ' + t('x^2=AB^2-' + long + '^2') + '.' }, { v: Math.sqrt(x2), code: 'skip-given', hint: 'That is ' + t('x') + '. This box asks for ' + t('x^2') + '.' }] },
              t('x^2=(' + dots(AB) + ')^2-' + Ls + '^2=' + fx(AB * AB, 0) + '-' + fx(sh.L * sh.L, 0) + '=' + fx(x2, 0)) + ', so ' + t('x=\\sqrt{' + fx(x2, 0) + '}=' + dots(Math.sqrt(x2)) + '\\approx ' + fx(Math.sqrt(x2), 1)) + ' ✓',
              ['Square the full value of ' + t('AB') + ' (use the calculator’s answer memory), then subtract ' + t(Ls + '^2') + '.'], 'x squared by Pythagoras');
          } },
          { id: 'e18e', level: 'EMG', make: function (r, sh) {
            var long = sh.short === 'BC' ? 'AC' : 'BC', fn = sh.short === 'BC' ? 'sin' : 'cos';
            return mc(r, 'Would ' + t('\\angle A') + ' change if ' + t(long) + ' were ' + t('40\\text{ cm}') + ' instead of ' + t(sh.L.toFixed(1) + '\\text{ cm}') + '?', [
              { html: 'No: ' + t('\\' + fn + ' A=\\frac{x}{2x}=\\frac12') + ' no matter what ' + t('x') + ' is, so ' + t('\\angle A=' + dg(sh.A)) + ' for every such triangle. Changing ' + t(long) + ' only rescales it.', right: true },
              { html: 'Yes: a longer ' + t(long) + ' makes ' + t('\\angle A') + ' larger.', why: 'If ' + t('AB') + ' is still twice ' + t(sh.short) + ', the ratio is still ' + t('\\frac12') + ' — the triangle just gets bigger.' },
              { html: 'Yes: ' + t('AB') + ' would change, so the ratio would change.', why: t('AB') + ' and ' + t(sh.short) + ' both change, and ' + t('AB') + ' stays exactly twice ' + t(sh.short) + '. The ratio stays ' + t('\\frac12') + '.' },
              { html: 'It depends on the units used.', why: 'A ratio of two lengths has no units.' }],
              t('\\' + fn + ' A=\\dfrac{x}{2x}=\\dfrac12') + ' for every value of ' + t('x') + ', so ' + t('\\angle A=' + dg(sh.A)) + ' whenever the hypotenuse is twice ' + t(sh.short) + '. Changing ' + t(long) + ' to ' + t('40') + ' cm rescales the triangle (' + t('AB\\approx ' + fx(40 / Math.cos(Math.PI / 6), 1)) + ', ' + t('x\\approx ' + fx(40 * Math.tan(Math.PI / 6), 1)) + ') but keeps the same angles.', ['Does the ratio ' + t('\\frac{x}{2x}') + ' depend on ' + t('x') + '?'], 'angle independent of size');
          } }] },
      { num: '19', shared: function (r) { return { a: r.int(30, 44), c: r.int(50, 65), ad: tenth(r, 60, 120), fl: r.chance(0.5) }; },
        stem: function (sh) {
          var BD = sh.ad * TR.tan(sh.a), DC = BD / TR.tan(sh.c), pts = mir({ A: [0, 0], D: [sh.ad, 0], C: [sh.ad + DC, 0], B: [sh.ad, BD] }, sh.fl);
          return 'Two right triangles share the side ' + t('BD') + ', where ' + t('D') + ' lies on ' + t('AC') + ' and ' + t('BD\\perp AC') + '. Here ' + t('\\angle A=' + dg(sh.a)) + ', ' + t('\\angle C=' + dg(sh.c)) + ' and ' + t('AD=' + sh.ad.toFixed(1) + '\\text{ m}') + '.' +
            fig({ pts: pts, segs: [['A', 'D', sh.ad.toFixed(1) + ' m'], ['D', 'C'], ['A', 'B'], ['B', 'C'], ['B', 'D']], right: [['D', 'C', 'B']], angles: [['A', 'D', 'B', ds(sh.a)], ['C', 'D', 'B', ds(sh.c)]], width: 280, aria: 'two right triangles sharing BD' });
        },
        parts: [
          { id: 'e19a', level: 'EMG', make: function (r, sh) {
            return sidePart({ prompt: 'Determine ' + t('BD') + ' to the nearest <b>hundredth</b> of a metre (and keep every digit in your calculator for the next parts).', deg: sh.a, k: sh.ad, kStr: sh.ad.toFixed(1), kRole: 'adj', uRole: 'opp', kName: 'AD', uName: 'BD', unit: 'm', dp: 2, angTex: '\\angle A=' + dg(sh.a), text: 'BD = ' + sh.ad + ' tan ' + sh.a });
          } },
          { id: 'e19b', level: 'PRG', make: function (r, sh) {
            var BD = sh.ad * TR.tan(sh.a), BDr = K.roundTo(BD, 1);
            return sidePart({ prompt: 'From ' + t('\\triangle ABD') + ', ' + t('BD=' + sh.ad.toFixed(1) + '\\tan ' + dg(sh.a) + '=' + dots(BD)) + '. Using this unrounded value, determine ' + t('DC') + ' to the nearest tenth of a metre.', deg: sh.c, k: BD, kStr: dots(BD), kRole: 'opp', uRole: 'adj', kName: 'BD', uName: 'DC', unit: 'm', dp: 1, angTex: '\\angle C=' + dg(sh.c),
              alts: [{ v: BDr / TR.tan(sh.c), code: 'round-early', hint: 'Use the full value of ' + t('BD') + ', not ' + t(BDr.toFixed(1)) + '.' }, { v: BD / TR.tan(sh.a), code: 'other-angle', hint: 'In ' + t('\\triangle BDC') + ' the angle to use is ' + t('\\angle C=' + dg(sh.c)) + ', not the ' + t(dg(sh.a)) + ' at ' + t('A') + '.' }], text: 'DC = BD / tan ' + sh.c });
          } },
          { id: 'e19c', level: 'PRG', make: function (r, sh) {
            var BD = sh.ad * TR.tan(sh.a), BDr = K.roundTo(BD, 1);
            return sidePart({ prompt: 'Using ' + t('BD=' + dots(BD)) + ', determine ' + t('BC') + ' to the nearest tenth of a metre.', deg: sh.c, k: BD, kStr: dots(BD), kRole: 'opp', uRole: 'hyp', kName: 'BD', uName: 'BC', unit: 'm', dp: 1, angTex: '\\angle C=' + dg(sh.c),
              alts: [{ v: BDr / TR.sin(sh.c), code: 'round-early', hint: 'Use the full value of ' + t('BD') + ', not ' + t(BDr.toFixed(1)) + '.' }, { v: BD / TR.sin(sh.a), code: 'other-angle', hint: 'In ' + t('\\triangle BDC') + ' the angle to use is ' + t('\\angle C=' + dg(sh.c)) + ', not the ' + t(dg(sh.a)) + ' at ' + t('A') + '.' }], text: 'BC = BD / sin ' + sh.c });
          } },
          { id: 'e19d', level: 'ADV', make: function (r, sh) {
            var BD = sh.ad * TR.tan(sh.a), DC = BD / TR.tan(sh.c), AC = sh.ad + DC, ad = sh.ad.toFixed(1);
            return nearPart('Determine the whole length ' + t('AC') + ' to the nearest tenth of a metre.', AC, 1,
              { unit: 'm', alts: [{ v: DC, code: 'perim-part', hint: 'That is only ' + t('DC') + '. ' + t('AC') + ' is the whole base: ' + t('AD+DC') + '.' }, { v: sh.ad + K.roundTo(BD, 1) / TR.tan(sh.c), code: 'round-early', hint: 'Keep ' + t('BD') + ' and ' + t('DC') + ' unrounded until the last step.' },
                { v: sh.ad + BD * TR.tan(sh.c), code: 'mult-div', hint: 'In ' + t('\\triangle BDC') + ', ' + t('DC') + ' is adjacent to ' + t('\\angle C') + ' and sits <b>underneath</b> in ' + t('\\tan ' + dg(sh.c) + '=\\frac{BD}{DC}') + ': divide.' }, { v: sh.ad + BD / TR.tan(sh.a), code: 'other-angle', hint: 'In ' + t('\\triangle BDC') + ' use ' + t('\\angle C=' + dg(sh.c)) + '.' }] },
              t('BD=' + ad + '\\tan ' + dg(sh.a) + '=' + dots(BD)) + '<br>' + t('DC=\\dfrac{BD}{\\tan ' + dg(sh.c) + '}=' + dots(DC)) + '<br>' + t('AC=AD+DC=' + ad + '+' + dots(DC) + '=' + dots(AC) + '\\approx ' + fx(AC, 1) + '\\text{ m}'),
              ['First find ' + t('BD') + ' in ' + t('\\triangle ABD') + ', then ' + t('DC') + ' in ' + t('\\triangle BDC') + '.', t('AC=AD+DC') + '. Keep full precision until the end.'], 'AC = AD + DC');
          } },
          { id: 'e19e', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Which single quantity, if rounded too early, would contaminate ' + t('DC') + ', ' + t('BC') + ' <b>and</b> ' + t('AC') + '?', [
              { html: t('BD'), right: true },
              { html: t('AD'), why: t('AD') + ' is given, not calculated, so there is nothing to round.' },
              { html: t('DC'), why: t('DC') + ' feeds into ' + t('AC') + ', but ' + t('BC') + ' does not use it.' },
              { html: t('\\angle C'), why: t('\\angle C') + ' is given exactly.' }],
              t('BD') + ' is the input to both ' + t('DC') + ' and ' + t('BC') + ', and ' + t('AC') + ' is built on ' + t('DC') + '. A rounded ' + t('BD') + ' would have contaminated all three. (Check: the hypotenuse ' + t('BC') + ' of ' + t('\\triangle BDC') + ' is its longest side ✓.)', ['Which calculated value is used by every later part?'], 'shared side');
          } }] }
    ]
  });

  /* ---------- part makers used in the extra practice (hoisted) ---------- */
  function epFig(r, kRole, uRole, degR, kR, bare, avoid45) {
    var n = names3(r), deg = angle(r, degR[0], degR[1], avoid45), k = tenth(r, kR[0], kR[1]), ks = k.toFixed(1), lab = {};
    lab[kRole] = ks + (bare ? '' : ' cm'); lab[uRole] = 'x';
    return sidePart({ prompt: triFig(r, deg, lab, n) + 'Find ' + t('x') + '.', deg: deg, k: k, kStr: ks, kRole: kRole, uRole: uRole, kName: sideOf(n, kRole), uName: 'x', unit: 'cm', dp: 1, angTex: '\\angle ' + n.ang + '=' + dg(deg), text: 'x: ' + kRole + ' ' + ks + ' → ' + uRole + ', ' + deg + '°' });
  }
  function e3Part(r, cfg) {
    var s = descSetup(r, cfg);
    return sidePart({ prompt: t('\\triangle ' + s.n.tri + ':\\ \\angle ' + s.n.rt + '=90^\\circ,\\ \\angle ' + s.n.ang + '=' + dg(s.deg) + ',\\ ' + s.kS + '=' + s.kStr) + '. Find ' + t(s.uS) + '.', deg: s.deg, k: s.k, kStr: s.kStr, kRole: cfg.kRole, uRole: cfg.uRole, kName: s.kS, uName: s.uS, unit: '', dp: 1, angTex: '\\angle ' + s.n.ang,
      solPre: descSketch(r, s, cfg, '') + '<b>' + (onTop(ratioFor(cfg.kRole, cfg.uRole), cfg.uRole) ? 'Top' : 'Bottom') + '</b> ' + (onTop(ratioFor(cfg.kRole, cfg.uRole), cfg.uRole) ? '(multiply)' : '(divide)') + '.<br>', text: s.uS + ' from ' + s.kS + '=' + s.kStr + ', ' + s.deg + '°' });
  }
  function e5Part(r, kRole, uRole, degR, kR) {
    var n = names3(r), deg = angle(r, degR[0], degR[1]), k = tenth(r, kR[0], kR[1]), ks = k.toFixed(1), lab = {};
    if (n.rt !== 'R' && n.ang !== 'R' && n.oth !== 'R' && r.chance(0.5)) n.rt = 'R';
    lab[kRole] = ks; lab[uRole] = 'x';
    return sidePart({ prompt: rotFig(r, deg, lab, n) + 'Find ' + t('x') + '.', deg: deg, k: k, kStr: ks, kRole: kRole, uRole: uRole, kName: sideOf(n, kRole), uName: 'x', unit: 'cm', dp: 1, angTex: '\\angle ' + n.ang + '=' + dg(deg),
      solPre: 'The right angle is at ' + t(n.rt) + ', so ' + t(sideOf(n, 'hyp')) + ' is the hypotenuse.<br>', text: 'rotated: ' + kRole + ' ' + ks + ' → ' + uRole + ', ' + deg + '°' });
  }
  function ladderFig(r, sh, Ltxt, dTxt) {
    var d = 1.5, h = 1.5 * Math.tan(sh.deg * Math.PI / 180), pts = mir({ W: [0, 0], T: [0, h], F: [d, 0] }, r.chance(0.5));
    return fig({ pts: pts, names: false, segs: [['W', 'T', sh.h.toFixed(1) + ' m', { width: 3.5 }], ['W', 'F', dTxt], ['F', 'T', Ltxt]], right: [['W', 'F', 'T']], angles: [['F', 'W', 'T', ds(sh.deg)]], width: 200, extra: [{ type: 'ground', y: 0, x0: Math.min(0, pts.F[0]) - 0.3, x1: Math.max(0, pts.F[0]) + 0.3 }], aria: 'ladder against a wall' });
  }
})(window);
