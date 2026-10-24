/* Math 10C · Unit 9 Test (M4) — the paper outcomes-based unit test (u9_test_A/B/C.tex) as generators.
 * The paper is one outcome (M4) on three pages (Part 1: ratios and finding a side; Part 2: finding angles and solving
 * right triangles; Part 3: elevation, depression, bearings and two triangles), each in BEG / PRG / MAS boxes. Every
 * question keeps its box and its paper number; each part takes its numbers from the seed, inside the range that
 * Versions A, B and C show (their numbers are possible values), with a key and a worked solution for every version.
 * Calculator test: sides to the nearest tenth, angles to the nearest degree (as the paper's instructions say), checked
 * with K.near — the exact rounding is required, and an answer that rounds like a known slip (wrong ratio, multiplied
 * instead of divided, radian mode, the other acute angle, rounded too early, …) gets a coded hint for partial credit.
 * Figures are drawn from the generated numbers (to scale, random orientation).
 * Conversions from paper: "sketch and label" → the sketch is in the worked solution (the answers are typed); "mark the
 * angles on the diagram" → a table of numbered angles; "explain" → labelled reasoning boxes (ratio, increases/decreases,
 * half-base, meets the code?) or, for Q5 (explain the student's error) and Q13b, multiple choice with a reason for each
 * wrong option; "explain why her path turns through 90°" → the turn angle is a box. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, F = HW.fmt, ex = HW.ex, Tg = HW.trig, RT = K.roundTo;

  HW.addCodes({
    'u9t-side-name': 'Named a side with the wrong letters',
    'u9t-pyth-add': 'Pythagoras: added the squares when a leg was missing',
    'u9t-pyth-sub': 'Pythagoras: subtracted the squares when the hypotenuse was missing',
    'u9t-same-error': 'Repeated the student’s error',
    'u9t-range-swap': 'Least and greatest values swapped',
    'u9t-ratio-word': 'Wrong trig ratio in the reasoning step',
    'u9t-direction': 'Increases / decreases mixed up',
    'u9t-verdict': 'Wrong conclusion about the code (compare the angles)',
    'u9t-same-angle': 'Copied the given acute angle as the other one',
    'u9t-turn': 'Wrong turn angle between the two legs',
    'u9t-one-leg': 'Return bearing from one leg only (ignored the angle at the start)',
    'u9t-legs-added': 'Added the two legs instead of using the Pythagorean theorem',
    'u9t-angle-diff': 'Subtracted the angles and used one triangle'
  });
  HW.addPartial({
    'u9t-side-name': 'b', 'u9t-pyth-add': 'b', 'u9t-pyth-sub': 'b', 'u9t-same-error': 'n', 'u9t-range-swap': 's', 'u9t-ratio-word': 'n',
    'u9t-direction': 'n', 'u9t-verdict': 'n', 'u9t-same-angle': 'n', 'u9t-turn': 'n', 'u9t-one-leg': 'n', 'u9t-legs-added': 'n', 'u9t-angle-diff': 'n'
  });

  /* ---------- small helpers ---------- */
  var FN = { sin: '\\sin', cos: '\\cos', tan: '\\tan' }, RULE = { sin: 'SOH', cos: 'CAH', tan: 'TOA' };
  var DEG = { sin: Tg.sin, cos: Tg.cos, tan: Tg.tan }, INV = { sin: Tg.asin, cos: Tg.acos, tan: Tg.atan };
  var RADF = { sin: Math.sin, cos: Math.cos, tan: Math.tan }, RADI = { sin: Math.asin, cos: Math.acos, tan: Math.atan };
  var NUM = { sin: 'o', cos: 'a', tan: 'o' }, DEN = { sin: 'h', cos: 'h', tan: 'a' };
  var ROLE = { o: 'OPP', a: 'ADJ', h: 'HYP' }, ROLEW = { o: 'opposite', a: 'adjacent', h: 'hypotenuse' };
  var RADH = 'That is what a calculator in <b>radian</b> mode gives. Switch to <b>degree</b> (DEG) mode and redo it.';
  var EARLY = 'Very close — but you built this on a <b>rounded</b> value. Keep full calculator precision (or use the given data) until the very end.';
  function dg(a) { return a + '^\\circ'; }
  function fx(x, dp) { return RT(x, dp).toFixed(dp); }
  function fl(x) { return F(x.toFixed(3)); }
  function nf(x) { return String(Number(Number(x).toFixed(2))); }       // 14 or 8.5 (a given measurement)
  function tenth(r, lo, hi) { return r.int(Math.round(lo * 10), Math.round(hi * 10)) / 10; }
  function find(gen, test, fallback) { for (var i = 0; i < 600; i++) { var v = gen(); if (v != null && test(v)) return v; } return fallback; }
  function A(v, code, hint) { return { v: v, code: code, hint: hint }; }
  function okR(x, dp) { var s = x * Math.pow(10, dp), f = s - Math.floor(s); return Math.abs(f - 0.5) > 0.07; }  // not near a rounding tie
  function fnOf(r1, r2) { var s = [r1, r2].sort().join(''); return s === 'ho' ? 'sin' : s === 'ah' ? 'cos' : 'tan'; }
  function sn(p, q) { return [p, q].sort().join(''); }
  function b3(b) { b = ((Math.round(b) % 360) + 360) % 360; return ('00' + b).slice(-3); }
  function norm360(b) { return ((b % 360) + 360) % 360; }
  function sideOf(T, c) { return c === 'o' ? T.o : c === 'a' ? T.a : T.h; }

  /* rounded answer with targeted alternatives; alternatives that round differently become the test's "bad" answers */
  function goodAlts(alts) { return (alts || []).filter(function (a) { return isFinite(a.v) && a.v > 0; }); }
  function badOf(x, dp, alts) { var want = RT(x, dp), seen = {}; return goodAlts(alts).filter(function (a) { var k = RT(a.v, dp); if (Math.abs(k - want) < 1e-9 || seen[k]) return false; seen[k] = 1; return true; }).map(function (a) { return RT(a.v, dp).toFixed(dp); }); }
  function nearC(x, dp, alts) { return K.near(x, dp, { alts: goodAlts(alts) }); }
  function nearP(prompt, x, dp, unit, alts, sol, hints, text, before) {
    var p = K.P.near(prompt, x, dp, { unit: unit, alts: goodAlts(alts), before: before }, sol, hints, text);
    p.bad = badOf(x, dp, alts);
    if (unit === '°') p.answer = t(fx(x, dp) + '^\\circ');
    return p;
  }
  function nearAns(x, dp, unit) { return t(F(fx(x, dp)) + (unit === '°' ? '^\\circ' : '')) + (unit && unit !== '°' ? ' ' + unit : ''); }

  /* a side from an angle and a known side: k has role kr, the unknown has role ur ('o' | 'a' | 'h') */
  function solveSide(k, kr, ur, th, xn) {
    var fn = fnOf(kr, ur), top = NUM[fn] === ur, f = DEG[fn](th), x = top ? k * f : k / f, alts = [];
    alts.push(A(top ? k / f : k * f, 'mult-div', top ? xn + ' is on <b>top</b> of the ratio, so <b>multiply</b> by ' + t(FN[fn] + dg(th)) + ' — don’t divide.' : xn + ' is on the <b>bottom</b> of the ratio, so <b>divide</b> by ' + t(FN[fn] + dg(th)) + ' — don’t multiply.'));
    alts.push(A(top ? k * RADF[fn](th) : k / RADF[fn](th), 'radian', RADH));
    ['sin', 'cos', 'tan'].forEach(function (g) { if (g === fn) return; var h = 'Name the sides from ' + t(dg(th)) + ' first: ' + xn + ' is ' + ROLEW[ur] + ' and the given side is ' + ROLEW[kr] + ', so the ratio is <b>' + RULE[fn] + '</b>.'; alts.push(A(k * DEG[g](th), 'wrong-ratio', h), A(k / DEG[g](th), 'wrong-ratio', h)); });
    alts.push(A(top ? k * DEG[fn](90 - th) : k / DEG[fn](90 - th), 'other-angle', 'That works from the <b>other</b> acute angle. Name opposite and adjacent from the ' + t(dg(th)) + ' angle.'));
    return { x: x, fn: fn, top: top, alts: alts };
  }
  /* worked lines for a side: xn = name (LaTeX), kt = the known side (LaTeX number) */
  function sideWork(s, kr, ur, th, xn, kt, unit, noRoles) {
    var eq = s.top ? '\\frac{' + xn + '}{' + kt + '}' : '\\frac{' + kt + '}{' + xn + '}';
    return (noRoles ? '' : t(xn) + ' is ' + ROLE[ur] + ' and ' + t(kt) + ' is ' + ROLE[kr] + ' ' + t('\\Rightarrow') + ' <b>' + RULE[s.fn] + '</b><br>') +
      t(FN[s.fn] + dg(th) + '=' + eq) + '<br>' + t(xn + '=' + (s.top ? kt + FN[s.fn] + dg(th) : '\\frac{' + kt + '}{' + FN[s.fn] + dg(th) + '}') + '=' + fl(s.x) + '\\approx' + F(fx(s.x, 1))) + (unit ? ' ' + unit : '');
  }
  /* an angle from two sides: p has role pr, q has role qr */
  function solveAngle(p, pr, q, qr) {
    var fn = fnOf(pr, qr), num = pr === NUM[fn] ? p : q, den = pr === NUM[fn] ? q : p, v = num / den, th = INV[fn](v), alts = [];
    ['sin', 'cos', 'tan'].forEach(function (g) { if (g === fn || (g !== 'tan' && v > 1)) return; alts.push(A(INV[g](v), 'wrong-ratio', 'Check which ratio uses these two sides: they are ' + ROLEW[NUM[fn]] + ' and ' + ROLEW[DEN[fn]] + ', so use <b>' + RULE[fn] + '</b> (' + t(FN[fn] + '^{-1}') + ').')); });
    if (fn === 'tan') alts.push(A(INV.tan(den / num), 'other-angle', 'Upside down: ' + t('\\tan\\theta=\\frac{\\text{opp}}{\\text{adj}}') + '. That angle is the <b>other</b> acute angle.'));
    else alts.push(A(90 - th, 'other-angle', 'That is the <b>other</b> acute angle. Name opposite and adjacent from ' + t('\\theta') + '.'));
    alts.push(A(RADI[fn](v), 'radian', RADH));
    alts.push(A(DEG[fn](v), 'tv-ratio-for-angle', 'To find an angle, use the <b>inverse</b> key ' + t(FN[fn] + '^{-1}') + ', not ' + t(FN[fn]) + '.'));
    return { th: th, fn: fn, num: num, den: den, v: v, alts: alts };
  }
  function angleWork(s, nt, dt, nm) {
    nm = nm || '\\theta';
    return ROLE[NUM[s.fn]] + ' and ' + ROLE[DEN[s.fn]] + ' ' + t('\\Rightarrow') + ' <b>' + RULE[s.fn] + '</b><br>' + t(FN[s.fn] + nm + '=\\frac{' + nt + '}{' + dt + '}') + '<br>' +
      t(nm + '=' + FN[s.fn] + '^{-1}\\!\\left(\\frac{' + nt + '}{' + dt + '}\\right)=' + s.th.toFixed(2) + '^\\circ\\approx' + dg(Math.round(s.th)));
  }

  /* ---------- right-triangle figures (HW.fig; plain-text labels) ----------
   * T = { A: reference vertex, B: other acute vertex, R: right angle, o, a, h }; drawn to scale (run a, rise o). */
  var LETS = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'J'], ['J', 'K', 'L'], ['K', 'L', 'M'], ['L', 'M', 'N'], ['M', 'N', 'P'], ['P', 'Q', 'R'], ['Q', 'R', 'S'], ['R', 'S', 'T'], ['S', 'T', 'U'], ['U', 'V', 'W'], ['X', 'Y', 'Z'], ['C', 'D', 'E'], ['F', 'G', 'H']];
  function names(r, mid) { var L = r.pick(LETS); if (mid) return r.chance(0.5) ? { A: L[0], B: L[2], R: L[1], L: L } : { A: L[2], B: L[0], R: L[1], L: L }; var s = r.shuffle(L); return { A: s[0], B: s[1], R: s[2], L: L }; }
  function tri(nm, o, a, h) { return { A: nm.A, B: nm.B, R: nm.R, L: nm.L, o: o, a: a, h: h, opp: sn(nm.B, nm.R), adj: sn(nm.A, nm.R), hyp: sn(nm.A, nm.B) }; }
  function ori(r) { return { rot: r.pick([0, 90, 180, 270]), flip: r.chance(0.5) }; }
  function xf(raw, rot, flip) {
    var c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180), out = {};
    Object.keys(raw).forEach(function (k) { var x = raw[k][0], y = raw[k][1]; if (flip) x = -x; out[k] = [x * c - y * s, x * s + y * c]; });
    return out;
  }
  /* o: { rot, flip, lab: { o, a, h }, angA, angB, names (false hides), width } */
  function triSvg(T, o) {
    o = o || {};
    var q = Math.max(0.28, Math.min(3.2, T.o / T.a)), W = q >= 1 ? 4 / q : 4, H = W * q, raw = {}, lab = o.lab || {};
    raw[T.R] = [0, 0]; raw[T.A] = [W, 0]; raw[T.B] = [0, H];
    var segs = [[T.B, T.R, lab.o], [T.A, T.R, lab.a], [T.A, T.B, lab.h]].map(function (s) { return s[2] == null || s[2] === '' ? [s[0], s[1]] : [s[0], s[1], String(s[2])]; });
    var angs = []; if (o.angA) angs.push([T.A, T.B, T.R, o.angA, { r: 24 }]); if (o.angB) angs.push([T.B, T.A, T.R, o.angB, { r: 24 }]);
    return HW.fig({ pts: xf(raw, o.rot || 0, o.flip), segs: segs, right: [[T.R, T.A, T.B]], angles: angs, names: o.names === false ? false : true, width: o.width || 290, height: o.height || 260, aria: o.aria || 'right triangle' });
  }
  function triFig(T, o) { return '<div class="fig" style="text-align:center;margin:6px 0">' + triSvg(T, o) + '</div>'; }
  function sideRow(a, b) { return '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;margin:4px 0">' + a + b + '</div>'; }
  /* a triangle from an angle and one known side */
  function fromAngle(nm, th, kr, k) {
    var s = DEG.sin(th), c = DEG.cos(th), h = kr === 'h' ? k : kr === 'o' ? k / s : k / c;
    return tri(nm, h * s, h * c, h);
  }

  /* ---------- ratio checkers (Q1, Q4) ---------- */
  var FUN = { sin: 'oh', cos: 'ah', tan: 'oa' }, OTHER = { sin: 'ah', cos: 'oh', tan: 'ao' }, IDS = ['oh', 'ah', 'oa', 'ao', 'ho', 'ha'];
  function rIdV(T, id) { return sideOf(T, id[0]) / sideOf(T, id[1]); }
  function whichId(T, v) { if (!isFinite(v)) return null; for (var i = 0; i < IDS.length; i++) if (Math.abs(v - rIdV(T, IDS[i])) < 1e-9 * Math.max(1, v)) return IDS[i]; return null; }
  function rdiag(f, g, ang) {
    if (!g || g === FUN[f]) return null;
    if (f === 'sin' || f === 'cos') {
      if (g === OTHER[f]) return { code: 'sin-cos-swap', hint: f === 'sin' ? 'That is adj over hyp — the <b>cosine</b>. Sine is <b>opp</b> over hyp (SOH): the opposite side does not touch ' + t(ang) + '.' : 'That is opp over hyp — the <b>sine</b>. Cosine is <b>adj</b> over hyp (CAH): the adjacent side touches ' + t(ang) + '.' };
      if (g === 'oa' || g === 'ao') return { code: 'hyp-wrong', hint: 'The bottom of a ' + (f === 'sin' ? 'sine' : 'cosine') + ' is the <b>hypotenuse</b> — the side across from the right angle.' };
      return { code: 'ratio-flip', hint: 'Upside down: the hypotenuse goes on the <b>bottom</b>. Sine and cosine of an acute angle are less than ' + t('1') + '.' };
    }
    if (g === 'ao') return { code: 'ratio-flip', hint: 'Upside down: tangent is <b>opp</b> over adj (TOA).' };
    return { code: 'tan-hyp', hint: 'Tangent never uses the hypotenuse: TOA is opposite over adjacent, the two legs.' };
  }
  function fracT(p, q) { return ex.texRat(ex.norm(p, q)); }
  function ratioChecks(T, funcs, ang) {
    var cs = funcs.map(function (f) { var id = FUN[f]; return K.fraction(ex.norm(sideOf(T, id[0]), sideOf(T, id[1])), { diag: function (v) { return rdiag(f, whichId(T, v), ang); } }); });
    return function (resp, labs) {
      var res = funcs.map(function (f, i) { return cs[i](resp[i] == null ? '' : resp[i]); });
      if (res.every(function (x) { return x.v === 'correct'; })) return ok();
      var got = funcs.map(function (f, i) { var a = K.read(resp[i] == null ? '' : resp[i]); return a.res ? null : whichId(T, a.val); });
      if (funcs.length > 1 && funcs.every(function (f, i) { return got[i] === OTHER[f]; })) return wrong('opp-adj-swap', 'All of your ratios belong to the <b>other</b> acute angle. Relative to ' + t(ang) + ', the <b>opposite</b> side does not touch ' + t(ang) + '; the <b>adjacent</b> side touches it.');
      for (var i = 0; i < res.length; i++) if (res[i].v === 'wrong') return { v: 'wrong', code: res[i].code, hint: '<b>' + labs[i] + ':</b> ' + (res[i].hint || 'Name opp, adj and hyp relative to ' + t(ang) + ' first, then use SOH CAH TOA.') };
      for (var j = 0; j < res.length; j++) if (res[j].v !== 'correct') return { v: res[j].v, code: res[j].code, hint: '<b>' + labs[j] + ':</b> ' + (res[j].hint || '') };
      return wrong('value', null);
    };
  }
  function ratioKey(T, f) { var id = FUN[f]; return fracT(sideOf(T, id[0]), sideOf(T, id[1])); }

  /* ---------- word / letter / bearing checkers ---------- */
  function clean(s) { return String(s == null ? '' : s).replace(/\\text\{([^{}]*)\}|\\mathrm\{([^{}]*)\}/g, '$1$2').replace(/\\[a-z]+/gi, ' ').replace(/[^a-z ]/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase(); }
  /* right: list of accepted words (any word of the reply may match); wrongs: [{ w: [...], code, hint }] */
  function wordChk(right, wrongs, help) {
    return function (resp) {
      var s = clean(resp); if (!s) return form('empty', 'Type a word: ' + help + '.');
      var ws = s.split(' '), has = function (list) { return list.some(function (w) { return ws.indexOf(w) >= 0 || s === w; }); };
      var r = has(right), bad = (wrongs || []).filter(function (x) { return has(x.w); });
      if (r && !bad.length) return ok();
      if (bad.length) return wrong(bad[0].code, bad[0].hint);
      return form('u9t-word', 'Answer with one word: ' + help + '.');
    };
  }
  var YES = ['yes', 'y', 'meets', 'does', 'ok', 'okay'], NO = ['no', 'n', 'not', 'doesnt', 'fails', 'too'];
  function sideNameChk(T, want, roleWord) {
    var all = [T.opp, T.adj, T.hyp], W = sn(want[0], want[1]);
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/\\overline|\\text|[{}\s]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
      if (!s) return form('empty', 'Type two letters, like ' + t(T.L[0] + T.L[1]) + '.');
      if (s.length !== 2 || s[0] === s[1] || T.L.indexOf(s[0]) < 0 || T.L.indexOf(s[1]) < 0) return form('u9t-side-letters', 'Name a side with its two vertex letters, like ' + t(T.L[0] + T.L[1]) + '.');
      var g = sn(s[0], s[1]);
      if (g === W) return ok();
      if (roleWord === 'hyp') return wrong('hyp-wrong', 'The hypotenuse is the side <b>across from the right angle</b> at ' + t(T.R) + ' — it doesn’t touch ' + t(T.R) + '.');
      if (g === T.hyp) return wrong('hyp-wrong', t(g) + ' is across from the right angle: it is the hypotenuse, not a leg.');
      return wrong('u9t-side-name', 'Relative to ' + t('\\theta') + ' at ' + t(T.A) + ': the <b>opposite</b> side doesn’t touch ' + t(T.A) + '; the <b>adjacent</b> side touches ' + t(T.A) + ' and isn’t the hypotenuse.');
    };
  }
  /* a three-figure bearing (b a whole number of degrees); a missing leading zero is a format nudge */
  function bearingChk(b, alts) {
    b = norm360(Math.round(b));
    return function (resp) {
      var raw = String(resp == null ? '' : resp).replace(/\\circ|\^|\{|\}|°|º|\s/g, '');
      if (!raw) return form('empty', 'Type your answer first.');
      if (!/^-?\d+(\.\d+)?$/.test(raw)) return form('notnumber', 'Enter the bearing as a number of degrees, e.g. ' + t('045') + '.');
      var v = Number(raw), whole = raw.split('.')[0].replace('-', '');
      if (Math.abs(v - b) < 1e-9) return whole.length < 3 ? form('bearing-3digit', 'Right direction! Now write it as a <b>three-figure</b> bearing (e.g. ' + t('45^\\circ\\to 045^\\circ') + ').') : ok();
      if (raw.indexOf('.') >= 0 && Math.round(v) === b) return form('round', 'Right — now round it to the nearest degree.');
      for (var i = 0; i < (alts || []).length; i++) { var a = alts[i]; if (isFinite(a.v) && Math.abs(v - a.v) < 0.6 && Math.round(a.v) !== b) return wrong(a.code, a.hint); }
      if (v >= 360) return wrong('bearing-360', 'A bearing is less than ' + t('360^\\circ') + '. If you went past ' + t('360^\\circ') + ', subtract ' + t('360^\\circ') + '.');
      if (v < 0) return wrong('sign', 'Bearings are never negative: they run clockwise from north, ' + t('000^\\circ') + ' to ' + t('359^\\circ') + '.');
      return wrong('value', null);
    };
  }
  function bearingBad(b, alts) { var seen = {}; seen[norm360(Math.round(b))] = 1; return (alts || []).filter(function (a) { var k = norm360(Math.round(a.v)); if (!isFinite(a.v) || seen[k]) return false; seen[k] = 1; return true; }).map(function (a) { return b3(a.v); }); }
  function intChk(ans, alts) { return K.number(ans, function (v) { for (var i = 0; i < (alts || []).length; i++) if (Math.abs(v - alts[i].v) < 1e-9) return { code: alts[i].code, hint: alts[i].hint }; return null; }); }

  /* ---------- scene figures ---------- */
  var INK = '#2b3340', COL = '#13807a', GREY = '#6a7182', SUN = '#c49a2a';
  function svgWrap(w, h, body, aria, maxw) { return '<div class="fig" style="text-align:center;margin:6px 0"><svg class="fig-svg" viewBox="0 0 ' + w + ' ' + h + '" width="100%" style="max-width:' + (maxw || w) + 'px" role="img" aria-label="' + HW.esc(aria) + '">' + body + '</svg></div>'; }
  function stx(x, y, s, o) { o = o || {}; return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="' + (o.size || 14) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central" fill="' + (o.color || INK) + '"' + (o.it ? ' font-style="italic"' : '') + (o.bold ? ' font-weight="600"' : '') + ' paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">' + HW.esc(s) + '</text>'; }
  function sln(a, b, o) { o = o || {}; return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + (o.color || INK) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="6 4"' : '') + ' stroke-linecap="round"/>'; }
  function dir(b, r, c) { return [c[0] + r * Math.sin(b * Math.PI / 180), c[1] - r * Math.cos(b * Math.PI / 180)]; }
  /* clockwise arc (screen) from bearing b0 to bearing b1 around c */
  function arcB(c, r, b0, b1, color) { var s = dir(b0, r, c), e = dir(b1, r, c), sw = norm360(b1 - b0); return '<path d="M' + s[0].toFixed(1) + ' ' + s[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 ' + (sw > 180 ? 1 : 0) + ' 1 ' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) + '" fill="none" stroke="' + (color || COL) + '" stroke-width="1.8"/>'; }
  function arrowHead(p, b, color) { var a = dir(b + 150, 9, p), c = dir(b - 150, 9, p); return '<polygon points="' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ' ' + a[0].toFixed(1) + ',' + a[1].toFixed(1) + ' ' + c[0].toFixed(1) + ',' + c[1].toFixed(1) + '" fill="' + (color || INK) + '"/>'; }
  /* Q15: compass rose with three points; pts = [{ name, b, from, a }] (arc from bearing `from` to b, or b to `from`) */
  function compassSvg(pts) {
    var c = [140, 132], R = 100, body = '';
    [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']].forEach(function (d) { var e = dir(d[0], R, c); body += sln(c, e, { w: 1.3, color: GREY }) + arrowHead(e, d[0], GREY) + stx(dir(d[0], R + 14, c)[0], dir(d[0], R + 14, c)[1], d[1], { bold: true, size: 15 }); });
    var labs = '';
    pts.forEach(function (p) {
      var e = dir(p.b, 82, c), lo = Math.min(p.b, p.from), hi = Math.max(p.b, p.from), r = 30, lr = r + 18 + (p.a < 30 ? 16 : 0);
      if (p.from === 360) { lo = p.b; hi = 360; }
      body += arcB(c, r, lo, hi) + sln(c, e, { w: 2.6 }) + '<circle cx="' + e[0].toFixed(1) + '" cy="' + e[1].toFixed(1) + '" r="3.5" fill="' + INK + '"/>';
      labs += stx(dir((lo + hi) / 2, lr, c)[0], dir((lo + hi) / 2, lr, c)[1], p.a + '°', { color: COL, size: 13 }) + stx(dir(p.b, 96, c)[0], dir(p.b, 96, c)[1], p.name, { it: true, bold: true, size: 16 });
    });
    body += labs;
    body += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3" fill="' + INK + '"/>';
    return svgWrap(280, 264, body, 'compass with three points', 270);
  }
  /* Q17: a straight trip from S0 on bearing b; distLab on the path */
  function tripSvg(b, distLab, n0, n1, dashed) {
    var c = [150, 125], L = 96, e = dir(b, L, c), body = '';
    body += sln(c, dir(0, 92, c), { w: 1.4, color: GREY }) + arrowHead(dir(0, 92, c), 0, GREY) + stx(c[0], c[1] - 104, 'N', { bold: true, size: 15 });
    if (dashed) { var ns = [c[0], e[1]]; body += sln(c, ns, { dash: 1, w: 1.4, color: GREY }) + sln(ns, e, { dash: 1, w: 1.4, color: GREY }); }
    body += arcB(c, 26, 0, b) + stx(dir(b / 2, 44, c)[0], dir(b / 2, 44, c)[1], b + '°', { color: COL, size: 13 });
    body += sln(c, e, { w: 2.6 }) + arrowHead(e, b, INK) + '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.5" fill="' + INK + '"/>';
    // the distance label beside the path
    var m = dir(b, L * 0.6, c), sg = (b > 90 && b < 180) || b > 270 ? -1 : 1, n = [sg * Math.cos(b * Math.PI / 180), sg * Math.sin(b * Math.PI / 180)];  // away from the dashed components
    body += stx(m[0] + n[0] * 12, m[1] + n[1] * 12, distLab, { size: 14, anchor: n[0] > 0.3 ? 'start' : n[0] < -0.3 ? 'end' : 'middle' });
    var sl = dir((b + 360) / 2, 16, c); body += stx(sl[0], sl[1], n0, { it: true, bold: true, size: 16 }) + stx(dir(b, L + 15, c)[0], dir(b, L + 15, c)[1], n1, { it: true, bold: true, size: 16 });
    var pts = [c, [c[0], c[1] - 112], e, dir(b, L + 15, c), [sl[0] - 8, sl[1]], [m[0] + n[0] * 12 + (n[0] > 0.3 ? 55 : n[0] < -0.3 ? -55 : 0), m[1] + n[1] * 12]];
    if (b > 90) pts.push([c[0], c[1] + 30]); if (b > 180) pts.push([c[0] - 30, c[1]]); var al = dir(b / 2, 44, c); pts.push([al[0] - 18, al[1] - 8], [al[0] + 18, al[1] + 8]);
    var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; }), x0 = Math.min.apply(null, xs) - 22, y0 = Math.min.apply(null, ys) - 14, x1 = Math.max.apply(null, xs) + 22, y1 = Math.max.apply(null, ys) + 16;
    return '<div class="fig" style="text-align:center;margin:6px 0"><svg class="fig-svg" viewBox="' + x0.toFixed(0) + ' ' + y0.toFixed(0) + ' ' + (x1 - x0).toFixed(0) + ' ' + (y1 - y0).toFixed(0) + '" width="100%" style="max-width:' + Math.round((x1 - x0) * 1.15) + 'px" role="img" aria-label="bearing of ' + b + ' degrees">' + body + '</svg></div>';
  }
  /* Q19 solution: two legs at bearings b1, b2 (distances d1, d2), dashed straight line back */
  function twoLegSvg(b1, d1, b2, d2) {
    var p0 = [0, 0], p1 = [d1 * Tg.sin(b1), d1 * Tg.cos(b1)], p2 = [p1[0] + d2 * Tg.sin(b2), p1[1] + d2 * Tg.cos(b2)];
    var xs = [p0[0], p1[0], p2[0]], ys = [p0[1], p1[1], p2[1], p0[1] + d1 * 0.35, p1[1] + d1 * 0.35], x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var sc = Math.min(200 / Math.max(x1 - x0, 1), 170 / Math.max(y1 - y0, 1)), pad = 40, X = function (p) { return [pad + (p[0] - x0) * sc, pad + (y1 - p[1]) * sc]; };
    var W = (x1 - x0) * sc + 2 * pad, H = (y1 - y0) * sc + 2 * pad, a = X(p0), b = X(p1), c = X(p2), nl = d1 * 0.35 * sc, body = '';
    body += sln(a, [a[0], a[1] - nl], { w: 1.3, color: GREY }) + arrowHead([a[0], a[1] - nl], 0, GREY) + stx(a[0], a[1] - nl - 10, 'N', { size: 12 });
    body += sln(b, [b[0], b[1] - nl], { w: 1.3, color: GREY }) + arrowHead([b[0], b[1] - nl], 0, GREY) + stx(b[0], b[1] - nl - 10, 'N', { size: 12 });
    body += sln(a, b, { w: 2.4 }) + sln(b, c, { w: 2.4 }) + sln(a, c, { w: 1.8, dash: 1, color: COL });
    var u = [(a[0] - b[0]), (a[1] - b[1])], v = [(c[0] - b[0]), (c[1] - b[1])], lu = Math.hypot(u[0], u[1]), lv = Math.hypot(v[0], v[1]); u = [u[0] / lu * 11, u[1] / lu * 11]; v = [v[0] / lv * 11, v[1] / lv * 11];
    body += '<polyline points="' + [b[0] + u[0], b[1] + u[1], b[0] + u[0] + v[0], b[1] + u[1] + v[1], b[0] + v[0], b[1] + v[1]].map(function (q) { return q.toFixed(1); }).join(' ') + '" fill="none" stroke="' + INK + '" stroke-width="1.3"/>';
    var mid = function (p, q, lab, side) { var m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], n = [-(q[1] - p[1]), q[0] - p[0]], ln = Math.hypot(n[0], n[1]); return stx(m[0] + n[0] / ln * 14 * side, m[1] + n[1] / ln * 14 * side, lab, { size: 13 }); };
    var cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3, out = function (p, q) { var m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], n = [-(q[1] - p[1]), q[0] - p[0]]; return (m[0] - cx) * n[0] + (m[1] - cy) * n[1] > 0 ? 1 : -1; };
    body += mid(a, b, d1 + ' km', out(a, b)) + mid(b, c, d2 + ' km', out(b, c));
    body += '<circle cx="' + a[0].toFixed(1) + '" cy="' + a[1].toFixed(1) + '" r="3.5" fill="' + INK + '"/>' + stx(a[0] + (a[0] < cx ? -22 : 22), a[1] + 12, 'start', { size: 12 });
    return svgWrap(Math.round(W), Math.round(H), body, 'two legs of a hike', 280);
  }
  /* angle of elevation from eye level (Q16) — from Lesson 6 */
  function eyeScene(o) {
    var W = 10, rise = W * Tg.tan(o.th), e = Math.min(Math.max(rise * 0.2, 1.3), 2.4), top = e + rise;
    var pts = { F: [0, 0], E: [0, e], G: [W, 0], H: [W, e], Q: [W, top], d1: [-1, 0], d2: [-1, e], h1: [W + 1.6, 0], h2: [W + 1.6, top] };
    var segs = [['E', 'Q'], ['F', 'G', o.runLab], ['d1', 'd2', o.eyeLab, { width: 1.2, color: GREY }], ['E', 'H', { dash: 1, width: 1.4, color: GREY }], ['h1', 'h2', 'h', { width: 1.2, color: GREY, side: 1 }]];
    var extra = [{ type: 'ground', y: 0, x0: -1.8, x1: W + 2.6 }, { type: 'person', at: [0, 0], h: e * 1.1 }, { type: 'eye', at: [0, e] }];
    if (o.obj === 'tree') extra.push({ type: 'tree', at: [W, 0], h: top });
    else extra.push({ type: 'building', at: [W + 0.6, 0], w: 1.2, h: top });
    return HW.fig({ pts: pts, segs: segs, right: [['H', 'E', 'Q']], angles: [['E', 'H', 'Q', o.th + '°', { r: 30 }]], names: false, extra: extra, width: 300, aria: 'angle of elevation from eye level' });
  }

  /* ---------- Q5: the student's error ---------- */
  var WHO = ['Jordan', 'Mei', 'Tariq', 'Priya', 'Owen', 'Nadia', 'Liam', 'Ava', 'Sam', 'Zara'];
  function q5Shared(r) {
    return find(function () {
      var v = r.pick(['ratio', 'flipHyp', 'flipTan']), th = r.int(25, 65), k = r.chance(0.5) ? r.int(8, 22) : tenth(r, 6, 20), unit = r.pick(['cm', 'm']), xr, kr, sf;
      if (v === 'ratio') { xr = r.pick(['a', 'o']); kr = 'h'; sf = xr === 'a' ? 'sin' : 'cos'; }
      else if (v === 'flipHyp') { xr = 'h'; kr = r.pick(['a', 'o']); sf = fnOf(kr, 'h'); }
      else { xr = 'a'; kr = 'o'; sf = 'tan'; }
      var s = solveSide(k, kr, xr, th, t('x')), studentX = k * DEG[sf](th);
      return { v: v, th: th, k: k, unit: unit, xr: xr, kr: kr, sf: sf, s: s, sx: studentX, who: r.pick(WHO), o: ori(r) };
    }, function (s) { return okR(s.s.x, 1) && okR(s.sx, 1) && Math.abs(s.th - 45) > 3 && Math.abs(RT(s.s.x, 1) - RT(s.sx, 1)) > 0.25; }, null);
  }
  function q5Fig(s) {
    var nm = { A: 'A', B: 'B', R: 'C' }, T = fromAngle(nm, s.th, s.kr, s.k), lab = {}; lab[s.kr] = nf(s.k) + ' ' + s.unit; lab[s.xr] = 'x';
    var work = '<div style="display:inline-block;border:1.5px solid ' + GREY + ';border-radius:6px;padding:8px 14px;margin:4px 0;line-height:2.2">' + s.who + '’s work:<br>' + t(FN[s.sf] + dg(s.th) + '=\\frac{x}{' + nf(s.k) + '}') + '<br>' + t('x=' + nf(s.k) + FN[s.sf] + dg(s.th) + '\\approx ' + fx(s.sx, 1)) + ' ' + s.unit + '</div>';
    return sideRow('<div style="flex:0 1 240px">' + triSvg(T, { lab: lab, angA: s.th + '°', names: false, rot: s.o.rot, flip: s.o.flip, width: 230 }) + '</div>', work);
  }
  function q5Options(s) {
    var k = nf(s.k), th = t(dg(s.th)), cf = s.s.fn, X = t('x'), kk = t(k);
    if (s.v === 'ratio') return [
      { html: 'Relative to ' + th + ', ' + X + ' is the <b>' + ROLEW[s.xr] + '</b> side' + (s.xr === 'a' ? ' (it touches the angle)' : ' (it does not touch the angle)') + ', not the ' + ROLEW[s.xr === 'a' ? 'o' : 'a'] + '. With the hypotenuse, that is <b>' + RULE[cf] + '</b>: ' + t(FN[cf] + dg(s.th) + '=\\frac{x}{' + k + '}') + '.', right: true },
      { html: 'The equation is upside down: it should be ' + t(FN[s.sf] + dg(s.th) + '=\\frac{' + k + '}{x}') + ', because ' + kk + ' is the longest side.', why: kk + ' is the hypotenuse, so it <b>does</b> belong on the bottom of a sine or cosine. The mistake is the ratio: is ' + X + ' opposite or adjacent to ' + th + '?' },
      { html: kk + ' is a leg, not the hypotenuse, so ' + s.who + ' should have used the tangent.', why: kk + ' is across from the right angle, so it <b>is</b> the hypotenuse. Tangent uses the two legs.' },
      { html: 'The method is right; ' + s.who + ' just rounded ' + t(k + FN[s.sf] + dg(s.th)) + ' wrongly.', why: t(k + FN[s.sf] + dg(s.th) + '=' + s.sx.toFixed(3)) + ', so the rounding is fine. The ratio is the problem: ' + X + ' is ' + ROLEW[s.xr] + ' to ' + th + '.' }];
    if (s.v === 'flipHyp') return [
      { html: X + ' is the <b>hypotenuse</b> (across from the right angle), so it goes on the <b>bottom</b>: ' + t(FN[cf] + dg(s.th) + '=\\frac{' + k + '}{x}') + '. (Check: the hypotenuse must be the longest side, but ' + t(fx(s.sx, 1) + '<' + k) + '.)', right: true },
      { html: RULE[cf] + ' is the wrong ratio: it should be ' + t('\\tan' + dg(s.th) + '=\\frac{x}{' + k + '}') + '.', why: 'Tangent uses two legs, but ' + X + ' is across from the right angle — it is the hypotenuse. ' + RULE[cf] + ' is the right ratio; it is just upside down.' },
      { html: kk + ' is the hypotenuse, so ' + t(FN[s.sf] + dg(s.th) + '=\\frac{x}{' + k + '}') + ' is right; the mistake is in the multiplying.', why: kk + ' touches the right angle, so it is a leg. The side across from the right angle is ' + X + '.' },
      { html: X + ' is ' + (s.kr === 'a' ? 'opposite' : 'adjacent to') + ' ' + th + ', so the ratio should be ' + t(s.kr === 'a' ? '\\sin' : '\\cos') + '.', why: X + ' is across from the right angle, so it is the <b>hypotenuse</b>, not ' + (s.kr === 'a' ? 'the opposite side' : 'the adjacent side') + '.' }];
    var big = s.th > 45;
    return [
      { html: X + ' is <b>adjacent</b> to ' + th + ' and ' + kk + ' is <b>opposite</b>, so ' + t('\\tan' + dg(s.th) + '=\\frac{\\text{opp}}{\\text{adj}}=\\frac{' + k + '}{x}') + ': ' + s.who + '’s ratio is upside down. (Check: ' + th + (big ? ' > ' : ' < ') + t('45^\\circ') + ', so the opposite leg should be ' + (big ? 'longer' : 'shorter') + ' than the adjacent one, but ' + t(fx(s.sx, 1) + (big ? '>' : '<') + k) + '.)', right: true },
      { html: 'Tangent is the wrong ratio; it should be ' + t('\\sin' + dg(s.th) + '=\\frac{x}{' + k + '}') + '.', why: 'Sine needs the hypotenuse, and neither ' + X + ' nor ' + kk + ' is the hypotenuse. Tangent is right; check which leg goes on top.' },
      { html: X + ' is the opposite side, so ' + t('\\tan' + dg(s.th) + '=\\frac{x}{' + k + '}') + ' is right; the answer is just rounded wrongly.', why: X + ' touches the ' + th + ' angle, so it is the <b>adjacent</b> side, not the opposite.' },
      { html: X + ' touches the angle, so ' + s.who + ' should have used ' + t('\\cos' + dg(s.th) + '=\\frac{x}{' + k + '}') + '.', why: 'Cosine needs the hypotenuse, but ' + kk + ' is a leg (it touches the right angle). Tangent is right; it is upside down.' }];
  }

  /* ---------- Q6: a range of angles ---------- */
  var RANGE_CTX = [
    { key: 'ladder', fn: 'cos', L: function (r) { return tenth(r, 5, 9.5); }, lo: [65, 72], span: [4, 8], q: 'distance', v: 'd',
      text: function (s) { return 'A ladder should make an angle between ' + t(dg(s.lo)) + ' and ' + t(dg(s.hi)) + ' with the ground. ' + s.who + ' has a ' + t(nf(s.L)) + ' m ladder.'; },
      ask: 'How far from the wall can the foot of the ladder be? Give the least and greatest distances, to the nearest tenth of a metre.', what: 'the distance from the wall' },
    { key: 'wire', fn: 'sin', L: function (r) { return r.int(20, 40); }, lo: [50, 58], span: [6, 12], q: 'height', v: 'h',
      text: function (s) { return 'A ' + t(nf(s.L)) + ' m guy wire runs from a point on a radio tower down to an anchor on level ground. It must meet the ground at an angle between ' + t(dg(s.lo)) + ' and ' + t(dg(s.hi)) + '.'; },
      ask: 'Between what heights up the tower can the wire be attached? Give the least and greatest heights, to the nearest tenth of a metre.', what: 'the height up the tower' },
    { key: 'slide', fn: 'cos', L: function (r) { return tenth(r, 3.5, 6.5); }, lo: [28, 35], span: [5, 10], q: 'distance', v: 'd',
      text: function (s) { return 'A ' + t(nf(s.L)) + ' m playground slide must make an angle between ' + t(dg(s.lo)) + ' and ' + t(dg(s.hi)) + ' with the ground.'; },
      ask: 'What horizontal distances along the ground can the slide cover? Give the least and greatest distances, to the nearest tenth of a metre.', what: 'the horizontal distance' },
    { key: 'ramp', fn: 'sin', L: function (r) { return tenth(r, 4, 8); }, lo: [14, 20], span: [5, 9], q: 'height', v: 'h',
      text: function (s) { return 'A ' + t(nf(s.L)) + ' m loading ramp must make an angle between ' + t(dg(s.lo)) + ' and ' + t(dg(s.hi)) + ' with the ground, from the ground up to the back of a truck.'; },
      ask: 'How high can the back of the truck be? Give the least and greatest heights, to the nearest tenth of a metre.', what: 'the height of the truck' }];
  function q6Shared(r) {
    return find(function () {
      var c = r.pick(RANGE_CTX), lo = r.int(c.lo[0], c.lo[1]), s = { c: c, L: c.L(r), lo: lo, hi: lo + r.int(c.span[0], c.span[1]), who: r.pick(WHO) };
      s.vLo = s.L * DEG[c.fn](s.lo); s.vHi = s.L * DEG[c.fn](s.hi); s.least = Math.min(s.vLo, s.vHi); s.most = Math.max(s.vLo, s.vHi); return s;
    }, function (s) { return okR(s.vLo, 1) && okR(s.vHi, 1) && RT(s.most, 1) - RT(s.least, 1) >= 0.2; }, null);
  }

  /* ---------- Q11: isosceles triangle ---------- */
  var ISO_CTX = [
    { what: 'A roof truss is an isosceles triangle with sloping sides of', top: 'peak', sides: 'sloping sides', lo: [4.5, 8], q: [1.25, 1.75] },
    { what: 'The front of a tent is an isosceles triangle with sloping sides of', top: 'peak', sides: 'sloping sides', lo: [1.8, 3], q: [1.0, 1.5] },
    { what: 'The end of a swing set is an isosceles triangle with legs of', top: 'top', sides: 'legs', lo: [2.4, 3.5], q: [0.65, 1.0] },
    { what: 'The front of an A-frame cabin is an isosceles triangle with sloping sides of', top: 'peak', sides: 'sloping sides', lo: [6, 9], q: [0.9, 1.3] }];
  function isoFig(s) {
    var hb = s.b / 2, h = s.hgt, pts = { L: [0, 0], R: [s.b, 0], T: [hb, h] };
    return '<div class="fig" style="text-align:center;margin:6px 0">' + HW.fig({ pts: pts, segs: [['L', 'T', nf(s.s) + ' m'], ['R', 'T', nf(s.s) + ' m'], ['L', 'R', nf(s.b) + ' m']], names: false, width: 260, height: 170, aria: 'isosceles triangle' }) + '</div>';
  }

  /* ---------- Q12: building code ---------- */
  var CODE_CTX = [
    { intro: function (s) { return 'By code, a wheelchair ramp may rise at an angle of at most ' + t(dg(s.max)) + '. A ramp must rise ' + t(nf(s.rise)) + ' m to a doorway.'; }, max: [4.5, 5], dec: true, rise: [0.4, 0.9], fn: 'sin',
      a: function (s) { return 'Does a ramp ' + t(nf(s.len)) + ' m long (along its slope) meet the code?'; }, b: 'Find the length of the shortest ramp (along its slope) that meets the code, to the nearest tenth of a metre.', bn: 'L' },
    { intro: function (s) { return 'By law, a ramp up to a loading dock may rise at an angle of at most ' + t(dg(s.max)) + '. The dock is ' + t(nf(s.rise)) + ' m high.'; }, max: [8, 10], rise: [1.0, 1.4], fn: 'tan',
      a: function (s) { return 'Does a ramp that covers ' + t(nf(s.len)) + ' m horizontally meet the rule?'; }, b: 'Find the least horizontal distance a ramp that meets the rule can cover, to the nearest tenth of a metre.', bn: 'd' },
    { intro: function (s) { return 'By code, stairs may rise at an angle of at most ' + t(dg(s.max)) + '. Stairs must climb ' + t(nf(s.rise)) + ' m to the next floor.'; }, max: [35, 38], rise: [2.5, 3.0], fn: 'tan',
      a: function (s) { return 'Do stairs that cover ' + t(nf(s.len)) + ' m horizontally meet the code?'; }, b: 'Find the least horizontal distance that stairs meeting the code can cover, to the nearest tenth of a metre.', bn: 'd' }];
  function q12Shared(r) {
    return find(function () {
      var c = r.pick(CODE_CTX), max = c.dec ? tenth(r, c.max[0], c.max[1]) : r.int(c.max[0], c.max[1]), rise = tenth(r, c.rise[0], c.rise[1]), meets = r.chance(0.45);
      var d = (meets ? -1 : 1) * (c.dec ? r.int(3, 10) / 10 : r.int(8, 30) / 10), want = max + d, len = c.fn === 'sin' ? rise / Tg.sin(want) : rise / Tg.tan(want);
      len = c.dec ? RT(len, 1) : RT(len, 1);
      var ang = c.fn === 'sin' ? Tg.asin(rise / len) : Tg.atan(rise / len);
      return { c: c, max: max, rise: rise, len: len, ang: ang, meets: ang <= max, best: c.fn === 'sin' ? rise / Tg.sin(max) : rise / Tg.tan(max) };
    }, function (s) { return okR(s.ang, 1) && okR(s.best, 1) && Math.abs(RT(s.ang, 1) - s.max) >= 0.2 && s.len > s.rise + 0.3; }, null);
  }

  /* ---------- Q13: depression and elevation ---------- */
  var DEP_CTX = [{ top: 'T', obj: 'C', thing: 'car', tall: 'tower', words: 'From the top ' + t('T') + ' of a tower, a person looks down at a car ' + t('C') + '.' },
    { top: 'K', obj: 'S', thing: 'sailboat', tall: 'cliff', words: 'From the top ' + t('K') + ' of a cliff, a person looks down at a sailboat ' + t('S') + '.' },
    { top: 'B', obj: 'P', thing: 'person', tall: 'building', words: 'From the roof ' + t('B') + ' of a building, a person looks down at a friend ' + t('P') + ' on the ground.' },
    { top: 'L', obj: 'D', thing: 'boat', tall: 'lighthouse', words: 'From the top ' + t('L') + ' of a lighthouse, the keeper looks down at a boat ' + t('D') + '.' }];
  function q13Fig(s) {
    var W = 10, h = W * Tg.tan(s.dep), pts = { G: [0, 0], X: [W, 0], Hh: [W + 1.5, h] };
    pts[s.c.top] = [0, h]; pts[s.c.obj] = [W, 0];
    var nm = {}; nm[s.c.top] = s.c.top; nm[s.c.obj] = s.c.obj;
    var T = s.c.top, C = s.c.obj, lab = s.lab;
    return '<div class="fig" style="text-align:center;margin:6px 0">' + HW.fig({ pts: pts, names: nm,
      segs: [['G', T, { width: 3 }], [T, C], ['G', C, { width: 1.2, color: GREY }], [T, 'Hh', { dash: 1, width: 1.4, color: GREY }]],
      angles: [[T, 'Hh', C, lab.hor, { r: 34 }], [T, 'G', C, lab.wall, { r: 22 }], [C, 'G', T, lab.gr, { r: 30 }]],
      extra: [{ type: 'ground', y: 0, x0: -1.6, x1: W + 2 }, { type: 'text', at: [W, -1.1], text: s.c.thing }, { type: 'text', at: [W * 0.62, h + 0.7], text: 'horizontal', size: 12, color: GREY }].concat(s.c.tall === 'tower' || s.c.tall === 'lighthouse' ? [] : [{ type: 'building', at: [-1.3, 0], w: 2.6, h: h }]),
      width: 320, height: 230, aria: 'angle of depression and angle of elevation' }) + '</div>';
  }

  /* ---------- Q14: one triangle in a scene ---------- */
  var ONE_CTX = [
    { key: 'shadow', fn: 'tan', kr: 'a', th: [30, 55], k: function (r) { return r.int(8, 25); }, text: function (s) { return 'A tree casts a ' + t(nf(s.k)) + ' m shadow when the angle of elevation of the sun is ' + t(dg(s.th)) + '. Find the tree’s height ' + t('h') + '. Round to the nearest tenth.'; } },
    { key: 'kite', fn: 'sin', kr: 'h', th: [40, 65], k: function (r) { return r.int(30, 80); }, text: function (s) { return 'A kite string is ' + t(nf(s.k)) + ' m long, at an angle of elevation of ' + t(dg(s.th)) + '. Find the kite’s height ' + t('h') + ' above the hand holding the string. Round to the nearest tenth.'; } },
    { key: 'plane', fn: 'sin', kr: 'h', th: [8, 18], k: function (r) { return 100 * r.int(12, 40); }, text: function (s) { return 'A plane climbs ' + t(F(s.k)) + ' m along its path at an angle of elevation of ' + t(dg(s.th)) + '. Find its altitude ' + t('h') + '. Round to the nearest tenth.'; } },
    { key: 'ladder', fn: 'sin', kr: 'h', th: [62, 78], k: function (r) { return tenth(r, 4, 9); }, text: function (s) { return 'A ' + t(nf(s.k)) + ' m ladder leans against a wall at an angle of elevation of ' + t(dg(s.th)) + ' with the ground. How high up the wall does it reach? Call the height ' + t('h') + ' and round to the nearest tenth.'; } }];
  function q14Fig(s) {
    var c = s.c, W = 10, h = W * Tg.tan(s.th), pts = { P: [0, 0], B: [W, 0], Q: [W, h] }, segs, extra = [{ type: 'ground', y: 0, x0: -0.8, x1: W + 1.2 }];
    var kl = (c.key === 'plane' ? F(s.k, true) : nf(s.k)) + ' m';
    if (c.key === 'shadow') { segs = [['P', 'B', kl], ['B', 'Q', 'h', { width: 1.2, color: GREY }], ['P', 'Q', { dash: 1, color: SUN }]]; extra.push({ type: 'tree', at: [W, 0], h: h }); }
    else if (c.key === 'kite') { segs = [['P', 'Q', kl], ['B', 'Q', 'h', { dash: 1, width: 1.4, color: GREY }], ['P', 'B', { width: 1.2, color: GREY }]]; extra.push({ type: 'text', at: [W, h + 0.7], text: '◆', size: 18, color: SUN }); }
    else if (c.key === 'plane') { segs = [['P', 'Q', kl], ['B', 'Q', 'h', { dash: 1, width: 1.4, color: GREY }], ['P', 'B', { width: 1.2, color: GREY }]]; extra.push({ type: 'text', at: [W + 0.4, h + 0.6], text: '✈', size: 18 }); }
    else { segs = [['P', 'Q', kl, { width: 3 }], ['B', 'Q', 'h', { width: 1.2, color: GREY }], ['P', 'B', { width: 1.2, color: GREY }]]; extra.push({ type: 'building', at: [W + 0.5, 0], w: 1, h: h * 1.1 }); }
    return HW.fig({ pts: pts, segs: segs, right: [['B', 'P', 'Q']], angles: [['P', 'B', 'Q', s.th + '°', { r: 30 }]], names: false, extra: extra, width: 260, height: 210, aria: c.key + ' triangle' });
  }

  /* ---------- Q17 / Q19 ---------- */
  var TRIP_CTX = [{ who: 'A ship leaves port', n0: 'P', n1: 'S', verb: 'sails', d: [10, 30], int: true },
    { who: 'A small plane flies from airport', n0: 'A', n1: 'B', verb: 'flies', d: [150, 400], int: true },
    { who: 'A boat leaves dock', n0: 'D', n1: 'F', verb: 'travels', d: [12, 40], int: true },
    { who: 'A hiker leaves trailhead', n0: 'H', n1: 'K', verb: 'walks', d: [3, 12], int: false }];
  function quad(b) { return b < 90 ? ['north', 'east', b] : b < 180 ? ['south', 'east', 180 - b] : b < 270 ? ['south', 'west', b - 180] : ['north', 'west', 360 - b]; }

  /* ---------- Q18: two triangles ---------- */
  function q18Shared(r) {
    var v = r.pick(['same', 'opposite', 'across']);
    return find(function () {
      var s = { v: v };
      if (v === 'same') { s.H = r.int(5, 12) * 10 + r.pick([0, 2, 4, 5, 6, 8]); s.a1 = r.int(32, 52); s.a2 = s.a1 - r.int(10, 16); if (s.a2 < 18) return null; s.d1 = s.H / Tg.tan(s.a1); s.d2 = s.H / Tg.tan(s.a2); s.ans = s.d2 - s.d1; s.ctx = r.pick(['buoys', 'boats']); }
      else if (v === 'opposite') { s.H = r.int(30, 80); s.a1 = r.int(25, 45); s.a2 = r.int(40, 65); s.d1 = s.H / Tg.tan(s.a1); s.d2 = s.H / Tg.tan(s.a2); s.ans = s.d1 + s.d2; s.ctx = r.pick(['tower', 'flagpole']); }
      else { s.H = r.int(25, 60); s.a1 = r.int(50, 70); s.a2 = r.int(15, 35); s.d1 = s.H / Tg.tan(s.a1); s.x = s.d1 * Tg.tan(s.a2); s.ans = s.H + s.x; }
      return s;
    }, function (s) { return okR(s.ans, 0) && s.a1 !== s.a2 && s.ans > 5; }, null);
  }
  function q18Fig(s) {
    var o = { names: false, width: 300, height: 220, aria: 'two right triangles' }, H = s.H;
    if (s.v === 'same') return HW.fig(Object.assign(o, { pts: { G: [0, 0], T: [0, H], N: [s.d1, 0], Fb: [s.d2, 0], Hz: [s.d2 * 1.05, H] },
      segs: [['G', 'T', H + ' m', { width: 3 }], ['G', 'Fb', { width: 1.2, color: GREY }], ['T', 'N'], ['T', 'Fb'], ['T', 'Hz', { dash: 1, width: 1.3, color: GREY }]],
      angles: [['T', 'Hz', 'N', s.a1 + '°', { r: 30 }], ['T', 'Hz', 'Fb', s.a2 + '°', { r: 62 }]], right: [['G', 'T', 'Fb']],
      extra: [{ type: 'text', at: [s.d1, -H * 0.12], text: 'near' }, { type: 'text', at: [s.d2, -H * 0.12], text: 'far' }, { type: 'text', at: [(s.d1 + s.d2) / 2, H * 0.08], text: '?' }] }));
    if (s.v === 'opposite') return HW.fig(Object.assign(o, { pts: { A: [-s.d1, 0], G: [0, 0], T: [0, H], B: [s.d2, 0] },
      segs: [['G', 'T', H + ' m', { width: 3 }], ['A', 'B', { width: 1.2, color: GREY }], ['A', 'T'], ['B', 'T']], right: [['G', 'B', 'T']],
      angles: [['A', 'G', 'T', s.a1 + '°', { r: 30 }], ['B', 'G', 'T', s.a2 + '°', { r: 30 }]] }));
    var tot = H + s.x;
    return HW.fig(Object.assign(o, { height: 330, pts: { G: [0, 0], R: [0, H], G2: [s.d1, 0], Tp: [s.d1, tot], M: [s.d1, H] },
      segs: [['G', 'R', H + ' m', { width: 3 }], ['G2', 'Tp', { width: 3 }], ['G', 'G2', 'd', { width: 1.2, color: GREY }], ['R', 'G2'], ['R', 'Tp'], ['R', 'M', { dash: 1, width: 1.3, color: GREY }]],
      angles: [['R', 'M', 'G2', s.a1 + '°', { r: 26 }], ['R', 'M', 'Tp', s.a2 + '°', { r: 34 }]], right: [['M', 'R', 'Tp']],
      extra: [{ type: 'text', at: [s.d1 + tot * 0.07, H + s.x / 2], text: 'x' }] }));
  }

  HW.defineTest({
    id: 'u9test', unit: 9, title: 'Unit 9 Test', outcome: 'M4', calc: true,
    blurb: 'The Unit 9 outcomes-based test (M4, right-triangle trigonometry): naming sides and writing ratios, finding sides and angles, solving right triangles, angles of elevation and depression, bearings and two-triangle problems, at the BEG, PRG and MAS levels. Calculator in degree mode.',
    questions: [
      /* ======================= M4 · Part 1: ratios and finding a side ======================= */
      { num: '1', outcome: 'M4',
        shared: function (r) {
          var tr = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [28, 45, 53], [33, 56, 65], [39, 80, 89], [48, 55, 73], [36, 77, 85]]), nm = names(r, true), sh = r.chance(0.5);
          return { T: tri(nm, sh ? tr[0] : tr[1], sh ? tr[1] : tr[0], tr[2]), o: ori(r) };
        },
        stem: function (s) { var T = s.T; return 'Right triangle ' + t(T.L.join('')) + ' has ' + t('\\angle ' + T.R + '=90^\\circ') + ' and ' + t('\\angle ' + T.A + '=\\theta') + '.' + triFig(T, { lab: { o: T.o, a: T.a, h: T.h }, angA: 'θ', rot: s.o.rot, flip: s.o.flip }); },
        parts: [
          { id: '1a', outcome: 'M4', level: 'BEG', make: function (r, s) {
            var T = s.T, cs = [sideNameChk(T, T.hyp, 'hyp'), sideNameChk(T, T.opp, 'opp'), sideNameChk(T, T.adj, 'adj')];
            var p = P.fields('Relative to ' + t('\\theta') + ', name each side using two letters.',
              [{ name: 'hyp', before: 'hyp =', mode: 'text' }, { name: 'opp', before: 'opp =', mode: 'text' }, { name: 'adj', before: 'adj =', mode: 'text' }],
              cs, [T.hyp, T.opp, T.adj], 'hyp ' + t('=' + T.hyp) + ', opp ' + t('=' + T.opp) + ', adj ' + t('=' + T.adj),
              'The right angle is at ' + t(T.R) + ', so the hypotenuse is the side across from it: ' + t(T.hyp) + '.<br>Relative to ' + t('\\theta') + ' at ' + t(T.A) + ': the side that does not touch ' + t(T.A) + ' is opp ' + t('=' + T.opp) + '; the leg that touches ' + t(T.A) + ' is adj ' + t('=' + T.adj) + '.',
              ['The hypotenuse is across from the right-angle box.', 'Opposite doesn’t touch ' + t('\\theta') + '; adjacent touches ' + t('\\theta') + ' (and isn’t the hypotenuse).'], 'name sides ' + T.L.join(''));
            var base = p.check;
            p.check = function (resp) { resp = resp || []; var n = function (x) { return String(x || '').toUpperCase().replace(/[^A-Z]/g, '').split('').sort().join(''); };
              if (n(resp[1]) === T.adj && n(resp[2]) === T.opp && n(resp[0]) === T.hyp) return wrong('opp-adj-swap', 'Opposite and adjacent are swapped: those belong to the <b>other</b> acute angle. Relative to ' + t('\\theta') + ', the opposite side does <b>not</b> touch ' + t(T.A) + '.');
              return base(resp); };
            p.bad = [[T.hyp, T.adj, T.opp], [T.opp, T.hyp, T.adj]];
            return p;
          } },
          { id: '1b', outcome: 'M4', level: 'BEG', make: function (r, s) {
            var T = s.T, funcs = ['sin', 'cos', 'tan'], ch = ratioChecks(T, funcs, '\\theta'), labs = ['sin θ', 'cos θ', 'tan θ'];
            var keys = funcs.map(function (f) { return ratioKey(T, f); });
            return { prompt: 'Write each ratio as a fraction in simplest form.', input: { type: 'fields', fields: funcs.map(function (f) { return { name: FN[f], before: t(FN[f] + '\\theta='), mode: 'math', keys: 'fraction' }; }) },
              check: function (resp) { return ch(resp || [], labs); }, key: keys, answer: funcs.map(function (f, i) { return t(FN[f] + '\\theta=' + keys[i]); }).join(', '),
              solution: 'Relative to ' + t('\\theta') + ': opp ' + t('=' + T.o) + ', adj ' + t('=' + T.a) + ', hyp ' + t('=' + T.h) + '.<br>' + t('\\sin\\theta=\\frac{\\text{opp}}{\\text{hyp}}=' + keys[0]) + ', ' + t('\\cos\\theta=\\frac{\\text{adj}}{\\text{hyp}}=' + keys[1]) + ', ' + t('\\tan\\theta=\\frac{\\text{opp}}{\\text{adj}}=' + keys[2]),
              hints: ['SOH CAH TOA: ' + t('\\sin=\\frac{\\text{opp}}{\\text{hyp}},\\ \\cos=\\frac{\\text{adj}}{\\text{hyp}},\\ \\tan=\\frac{\\text{opp}}{\\text{adj}}') + '.'], text: 'ratios ' + T.o + '-' + T.a + '-' + T.h,
              bad: [funcs.map(function (f) { var id = OTHER[f]; return fracT(sideOf(T, id[0]), sideOf(T, id[1])); }), funcs.map(function (f) { var id = FUN[f]; return fracT(sideOf(T, id[1]), sideOf(T, id[0])); })] };
          } }] },
      { num: '2', outcome: 'M4', stem: 'Find ' + t('x') + ', to the nearest tenth.',
        shared: function (r) { return { fns: r.sample(['sin', 'cos', 'tan'], 2) }; },
        parts: [0, 1].map(function (i) { return { id: '2' + 'ab'[i], outcome: 'M4', level: 'BEG', make: function (r, sh) {
          var fn = sh.fns[i], xr = NUM[fn], kr = DEN[fn];
          var c = find(function () { var th = r.int(22, 68), k = i === 0 ? r.int(8, 24) : tenth(r, 5, 15), s = solveSide(k, kr, xr, th, t('x')); return { th: th, k: k, s: s }; }, function (c) { return okR(c.s.x, 1); }, null);
          var unit = i === 0 ? r.pick(['cm', 'mm']) : r.pick(['m', 'km']), T = fromAngle({ A: 'A', B: 'B', R: 'C' }, c.th, kr, c.k), lab = {}, o = ori(r);
          lab[kr] = nf(c.k) + ' ' + unit; lab[xr] = 'x';
          return nearP(triFig(T, { lab: lab, angA: c.th + '°', names: false, rot: o.rot, flip: o.flip, width: 290 }), c.s.x, 1, unit, c.s.alts,
            sideWork(c.s, kr, xr, c.th, 'x', nf(c.k), unit), ['Name the sides from the ' + t(dg(c.th)) + ' angle: which one is ' + t('x') + ', and which is the given side?', 'Pick SOH, CAH or TOA, write the equation, then solve for ' + t('x') + '.'], 'find x ' + fn + ' ' + c.th + ' ' + c.k, t('x='));
        } }; }) },
      { num: '3', outcome: 'M4', parts: [
        { id: '3', outcome: 'M4', level: 'PRG', make: function (r) {
          var c = find(function () {
            var nm = names(r), th = r.int(20, 70), kr = r.pick(['a', 'o']), k = tenth(r, 8, 30), ur = kr === 'a' ? 'o' : 'a';
            var hs = solveSide(k, kr, 'h', th, t(sn(nm.A, nm.B))), ls = solveSide(k, kr, ur, th, t(ur === 'o' ? sn(nm.B, nm.R) : sn(nm.A, nm.R)));
            return { nm: nm, th: th, kr: kr, k: k, ur: ur, hs: hs, ls: ls };
          }, function (c) { return okR(c.hs.x, 1) && okR(c.ls.x, 1); }, null);
          var nm = c.nm, hyp = sn(nm.A, nm.B), given = c.kr === 'a' ? sn(nm.A, nm.R) : sn(nm.B, nm.R), other = c.ur === 'a' ? sn(nm.A, nm.R) : sn(nm.B, nm.R), unit = r.pick(['cm', 'm', 'mm']);
          var hr = RT(c.hs.x, 1), early = [A(Math.sqrt(Math.max(hr * hr - c.k * c.k, 0)), 'early-round', EARLY), A(hr * (c.ur === 'o' ? Tg.sin(c.th) : Tg.cos(c.th)), 'early-round', EARLY)];
          var lAlts = c.ls.alts.concat(early, [A(Math.sqrt(c.hs.x * c.hs.x + c.k * c.k), 'u9t-pyth-add', 'The hypotenuse is the longest side: to find a <b>leg</b>, subtract the squares.')]);
          var T = fromAngle(nm, c.th, c.kr, c.k), lab = { h: hyp }; lab[c.kr] = nf(c.k); lab[c.ur] = other;
          var p = P.fields('In ' + t('\\triangle ' + nm.L.join('')) + ', ' + t('\\angle ' + nm.R + '=90^\\circ') + ', ' + t('\\angle ' + nm.A + '=' + dg(c.th)) + ' and ' + t(given + '=' + nf(c.k)) + ' ' + unit + '. Sketch and label the triangle. Then find ' + t(hyp) + ' and ' + t(other) + ', to the nearest tenth.',
            [{ name: hyp, before: t(hyp + '='), after: unit }, { name: other, before: t(other + '='), after: unit }],
            [nearC(c.hs.x, 1, c.hs.alts), nearC(c.ls.x, 1, lAlts)], [fx(c.hs.x, 1), fx(c.ls.x, 1)], t(hyp + '\\approx' + fx(c.hs.x, 1)) + ' ' + unit + ', ' + t(other + '\\approx' + fx(c.ls.x, 1)) + ' ' + unit,
            sideRow('<div style="flex:0 1 220px">' + triSvg(T, { lab: lab, angA: c.th + '°', width: 210 }) + '</div>', '<div>From ' + t('\\angle ' + nm.A) + ': ' + t(given) + ' is ' + ROLE[c.kr] + '.</div>') +
              '<b>' + t(hyp) + ':</b> ' + sideWork(c.hs, c.kr, 'h', c.th, hyp, nf(c.k), unit, true) + '<br><b>' + t(other) + ':</b> ' + sideWork(c.ls, c.kr, c.ur, c.th, other, nf(c.k), unit, true) + '<br>Each side is found from the <b>given</b> data, not from a rounded answer.',
            ['Sketch it: the hypotenuse is across from ' + t('\\angle ' + nm.R) + '. From ' + t('\\angle ' + nm.A) + ', is ' + t(given) + ' opposite or adjacent?', 'Use the given side and the angle for <b>both</b> unknowns, so a rounding error isn’t carried along.'], 'solve for hyp and leg ' + c.th + ' ' + c.k);
          p.bad = [[badOf(c.hs.x, 1, c.hs.alts)[0] || '0', fx(c.ls.x, 1)], [fx(c.hs.x, 1), badOf(c.ls.x, 1, lAlts)[0] || '0']];
          return p;
        } }] },
      { num: '4', outcome: 'M4', parts: [
        { id: '4', outcome: 'M4', level: 'PRG', make: function (r) {
          var tr = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41], [28, 45, 53], [33, 56, 65], [48, 55, 73]]), nm = names(r, true), sh = r.chance(0.5);
          var T = tri(nm, sh ? tr[0] : tr[1], sh ? tr[1] : tr[0], tr[2]), gf = r.pick(['sin', 'cos', 'tan']), id = FUN[gf], p0 = sideOf(T, id[0]), q0 = sideOf(T, id[1]);
          var miss = gf === 'sin' ? 'a' : gf === 'cos' ? 'o' : 'h', mName = miss === 'a' ? T.adj : miss === 'o' ? T.opp : T.hyp, mVal = sideOf(T, miss), rest = ['sin', 'cos', 'tan'].filter(function (f) { return f !== gf; });
          var addV = Math.sqrt(p0 * p0 + q0 * q0), subV = Math.sqrt(Math.abs(q0 * q0 - p0 * p0)), sq = miss === 'h' ? p0 * p0 + q0 * q0 : Math.abs(q0 * q0 - p0 * p0);
          var c0 = K.number(mVal, function (v) {
            if (miss !== 'h' && Math.abs(v - addV) < 0.05) return { code: 'u9t-pyth-add', hint: 'The hypotenuse is the longest side. To find a <b>leg</b>, subtract: ' + t('\\text{leg}^2=\\text{hyp}^2-\\text{leg}^2') + '.' };
            if (miss === 'h' && Math.abs(v - subV) < 0.05) return { code: 'u9t-pyth-sub', hint: 'You are finding the <b>hypotenuse</b>, so add the squares of the legs.' };
            if (Math.abs(v - sq) < 1e-9) return { code: 'pyth-noroot', hint: 'That is the square of the side. Take the square root.' };
            return null; });
          var labs = [mName].concat(rest.map(function (f) { return FN[f].slice(1) + ' ' + T.A; })), ch = ratioChecks(T, rest, T.A);
          var keys = [String(mVal)].concat(rest.map(function (f) { return ratioKey(T, f); }));
          var fig = triSvg(T, { lab: { o: T.o, a: T.a, h: T.h }, angA: ' ', width: 200 });
          return { prompt: 'In right ' + t('\\triangle ' + nm.L.join('')) + ', ' + t('\\angle ' + nm.R + '=90^\\circ') + ' and ' + t(FN[gf] + ' ' + T.A + '=\\frac{' + p0 + '}{' + q0 + '}') + '. Sketch and label a triangle that fits, with sides ' + t(p0) + ' and ' + t(q0) + '. Find the length of the third side, then write ' + t(FN[rest[0]] + ' ' + T.A) + ' and ' + t(FN[rest[1]] + ' ' + T.A) + ' as fractions in simplest form.',
            input: { type: 'fields', fields: [{ name: mName, before: t(mName + '=') }].concat(rest.map(function (f) { return { name: FN[f], before: t(FN[f] + ' ' + T.A + '='), mode: 'math', keys: 'fraction' }; })) },
            check: function (resp) { resp = resp || []; var r0 = c0(resp[0] == null ? '' : resp[0]), rr = ch(resp.slice(1), labs.slice(1));
              if (r0.v === 'wrong') return { v: 'wrong', code: r0.code, hint: '<b>' + t(mName) + ':</b> ' + (r0.hint || 'Use the Pythagorean theorem.') };
              if (rr.v !== 'correct') return rr;
              if (r0.v !== 'correct') return { v: r0.v, code: r0.code, hint: '<b>' + t(mName) + ':</b> ' + (r0.hint || '') };
              return ok(); },
            key: keys, answer: t(mName + '=' + mVal) + ', ' + rest.map(function (f, i) { return t(FN[f] + ' ' + T.A + '=' + keys[i + 1]); }).join(', '),
            solution: sideRow('<div style="flex:0 1 200px">' + fig + '</div>', '<div>' + t(FN[gf] + ' ' + T.A + '=\\frac{\\text{' + (gf === 'cos' ? 'adj' : 'opp') + '}}{\\text{' + (gf === 'tan' ? 'adj' : 'hyp') + '}}') + ', so ' + (gf === 'cos' ? 'adj' : 'opp') + ' ' + t('=' + p0) + ', ' + (gf === 'tan' ? 'adj' : 'hyp') + ' ' + t('=' + q0) + '.</div>') +
              'Pythagorean theorem: ' + t(mName + '=\\sqrt{' + (miss === 'h' ? p0 + '^2+' + q0 + '^2' : q0 + '^2-' + p0 + '^2') + '}=\\sqrt{' + sq + '}=' + mVal) + '<br>' + rest.map(function (f, i) { return t(FN[f] + ' ' + T.A + '=' + keys[i + 1]); }).join(', '),
            hints: ['Label two sides of a right triangle from the ratio (' + RULE[gf] + '), then use the Pythagorean theorem for the third.', 'Then use SOH CAH TOA for the other two ratios.'], text: 'from ' + gf + ' ' + p0 + '/' + q0,
            bad: [[String(miss === 'h' ? RT(subV, 2) : RT(addV, 2))].concat(keys.slice(1)), [String(mVal)].concat(rest.map(function (f) { var id2 = FUN[f]; return fracT(sideOf(T, id2[1]), sideOf(T, id2[0])); }))] };
        } }] },
      { num: '5', outcome: 'M4', shared: q5Shared,
        stem: function (s) { return s.who + ' tried to find ' + t('x') + '. ' + s.who + '’s work is shown.' + q5Fig(s); },
        parts: [
          { id: '5a', outcome: 'M4', level: 'MAS', make: function (r, s) {
            return P.mc(r, 'Which statement explains ' + s.who + '’s error?', q5Options(s),
              'Name the sides from ' + t(dg(s.th)) + ': ' + t('x') + ' is ' + ROLE[s.xr] + ' and ' + t(nf(s.k)) + ' is ' + ROLE[s.kr] + ', so the ratio is <b>' + RULE[s.s.fn] + '</b>: ' + t(FN[s.s.fn] + dg(s.th) + '=' + (s.s.top ? '\\frac{x}{' + nf(s.k) + '}' : '\\frac{' + nf(s.k) + '}{x}')) + '. ' + s.who + ' wrote ' + t(FN[s.sf] + dg(s.th) + '=\\frac{x}{' + nf(s.k) + '}') + '.',
              ['Name the hypotenuse first (across from the right angle), then opposite and adjacent from ' + t(dg(s.th)) + '.'], 'student error ' + s.v + ' ' + s.th);
          } },
          { id: '5b', outcome: 'M4', level: 'MAS', make: function (r, s) {
            var alts = s.s.alts.concat([A(s.sx, 'u9t-same-error', 'That is ' + s.who + '’s answer. Fix the error first: name ' + t('x') + ' and ' + t(nf(s.k)) + ' from the ' + t(dg(s.th)) + ' angle.')]);
            var p = nearP('Find the correct value of ' + t('x') + ', to the nearest tenth.', s.s.x, 1, s.unit, alts, sideWork(s.s, s.kr, s.xr, s.th, 'x', nf(s.k), s.unit),
              ['Is ' + t('x') + ' on top or on the bottom of the correct ratio?', 'A hypotenuse must be longer than either leg — check your answer.'], 'correct x ' + s.v, t('x='));
            p.bad = [fx(s.sx, 1)].concat(p.bad);
            return p;
          } }] },
      { num: '6', outcome: 'M4', shared: q6Shared,
        stem: function (s) { return s.c.text(s); },
        parts: [
          { id: '6a', outcome: 'M4', level: 'MAS', make: function (r, s) {
            var c = s.c, f = c.fn, g = f === 'sin' ? 'cos' : 'sin', loIsLeast = s.vLo <= s.vHi, aL = loIsLeast ? s.lo : s.hi, aM = loIsLeast ? s.hi : s.lo;
            var mk = function (a, x, swapV) { return [A(swapV, 'u9t-range-swap', 'That is the other end of the range. Which angle gives the ' + (x === s.least ? 'smaller' : 'larger') + ' value?'), A(s.L * DEG[g](a), 'wrong-ratio', 'Name the sides: the ' + t(nf(s.L)) + ' m length is the hypotenuse and ' + c.what + ' is ' + (f === 'sin' ? 'opposite' : 'adjacent to') + ' the angle with the ground, so use <b>' + RULE[f] + '</b>.'), A(s.L * RADF[f](a), 'radian', RADH), A(s.L / DEG[f](a), 'mult-div', 'The unknown is on top of the ratio, so multiply: ' + t(c.v + '=' + nf(s.L) + FN[f] + '\\theta') + '.')]; };
            var aLe = mk(aL, s.least, s.most), aMo = mk(aM, s.most, s.least);
            var p = P.fields(c.ask, [{ name: 'Least', label: 'Least:', after: 'm' }, { name: 'Greatest', label: 'Greatest:', after: 'm' }], [nearC(s.least, 1, aLe), nearC(s.most, 1, aMo)], [fx(s.least, 1), fx(s.most, 1)],
              'from ' + t(fx(s.least, 1)) + ' m to ' + t(fx(s.most, 1)) + ' m',
              (f === 'sin' ? 'OPP and HYP ' + t('\\Rightarrow') + ' <b>SOH</b>' : 'ADJ and HYP ' + t('\\Rightarrow') + ' <b>CAH</b>') + ': ' + t(c.v + '=' + nf(s.L) + FN[f] + '\\theta') + '<br>' + t(nf(s.L) + FN[f] + dg(s.lo) + '=' + fl(s.vLo)) + ', ' + t(nf(s.L) + FN[f] + dg(s.hi) + '=' + fl(s.vHi)) + '<br>So ' + c.what + ' is from <b>' + fx(s.least, 1) + ' m</b> to <b>' + fx(s.most, 1) + ' m</b>.',
              ['Use the ratio once with ' + t(dg(s.lo)) + ' and once with ' + t(dg(s.hi)) + '.', 'The ' + t(nf(s.L)) + ' m length is the hypotenuse.'], 'range ' + c.key + ' ' + s.lo + '-' + s.hi);
            var wl = badOf(s.least, 1, aLe.slice(1));
            p.bad = [[fx(s.most, 1), fx(s.least, 1)]].concat(wl.length ? [[wl[0], fx(s.most, 1)]] : []);
            return p;
          } },
          { id: '6b', outcome: 'M4', level: 'MAS', make: function (r, s) {
            var c = s.c, f = c.fn, g = f === 'sin' ? 'cos' : 'sin', dirW = f === 'sin' ? 'increases' : 'decreases', othW = f === 'sin' ? 'decreases' : 'increases', bigger = f === 'sin';
            var rc = wordChk([f, f === 'sin' ? 'sine' : 'cosine'], [{ w: [g, g === 'sin' ? 'sine' : 'cosine'], code: 'u9t-ratio-word', hint: 'Name the sides: the ' + t(nf(s.L)) + ' m length is the hypotenuse and ' + c.what + ' is ' + (f === 'sin' ? 'opposite' : 'adjacent to') + ' the angle, so it is ' + RULE[f] + '.' }, { w: ['tan', 'tangent'], code: 'u9t-ratio-word', hint: 'Tangent uses the two legs, but the ' + t(nf(s.L)) + ' m length is the hypotenuse.' }], 'sin, cos or tan');
            var dc = wordChk([dirW, dirW.replace(/s$/, ''), f === 'sin' ? 'grows' : 'shrinks', f === 'sin' ? 'bigger' : 'smaller', f === 'sin' ? 'larger' : 'less'], [{ w: [othW, othW.replace(/s$/, ''), f === 'sin' ? 'smaller' : 'bigger', f === 'sin' ? 'shrinks' : 'grows', f === 'sin' ? 'less' : 'larger'], code: 'u9t-direction', hint: 'Compare ' + t(FN[f] + dg(s.lo)) + ' and ' + t(FN[f] + dg(s.hi)) + ' on your calculator.' }], 'increases or decreases');
            var p = P.fields('Explain why the larger angle gives the ' + (bigger ? 'greater' : 'smaller') + ' ' + c.q + ': complete the reasoning.',
              [{ name: 'Ratio', before: t(c.v + '=' + nf(s.L) + '\\times'), after: t('\\theta'), mode: 'text', placeholder: 'ratio' }, { name: 'Change', label: 'As ' + t('\\theta') + ' gets larger, this ratio', mode: 'text', placeholder: 'increases or decreases', wide: true }],
              [rc, dc], [f, dirW], t(c.v + '=' + nf(s.L) + FN[f] + '\\theta') + '; as ' + t('\\theta') + ' increases, ' + t(FN[f] + '\\theta') + ' ' + dirW + '.',
              t(c.v + '=' + nf(s.L) + FN[f] + '\\theta') + '. As ' + t('\\theta') + ' increases, ' + t(FN[f] + '\\theta') + ' <b>' + dirW + '</b> (' + t(FN[f] + dg(s.lo) + '=' + DEG[f](s.lo).toFixed(4)) + ', ' + t(FN[f] + dg(s.hi) + '=' + DEG[f](s.hi).toFixed(4)) + '): ' + (f === 'sin' ? 'it stands up more steeply' : 'the triangle gets taller and narrower') + ', so ' + c.what + ' ' + (bigger ? 'grows' : 'shrinks') + '.',
              ['Which ratio did you use in (a)?', 'Compare the ratio of the two angles on your calculator.'], 'explain range ' + c.key + ' ' + s.lo + '-' + s.hi);
            p.bad = [[g, dirW], [f, othW]];
            return p;
          } }] },

      /* ======================= M4 · Part 2: finding angles and solving right triangles ======================= */
      { num: '7', outcome: 'M4', stem: 'Find the acute angle ' + t('\\theta') + ', to the nearest degree.',
        shared: function (r) { return { fns: r.shuffle(['sin', 'cos', 'tan']), kinds: r.shuffle(['dec4', 'short', 'frac']) }; },
        parts: [0, 1, 2].map(function (i) { return { id: '7' + 'abc'[i], outcome: 'M4', level: 'BEG', make: function (r, sh) {
          var fn = sh.fns[i], kind = sh.kinds[i];
          var c = find(function () {
            var vt, v;
            if (kind === 'dec4') { var a = r.int(15, 80); v = Number(DEG[fn](a).toFixed(4)); vt = v.toFixed(4); }
            else if (kind === 'short') { v = fn === 'tan' ? (r.chance(0.5) ? tenth(r, 0.3, 3.2) : r.int(25, 95) / 100) : r.int(12, 95) / 100; vt = String(v); }
            else { var q = r.int(5, 13), p = fn === 'tan' ? r.int(2, 2 * q) : r.int(2, q - 1); if (ex.gcd(p, q) !== 1 || p === q) return null; v = p / q; vt = '\\frac{' + p + '}{' + q + '}'; }
            if (fn !== 'tan' && v >= 1) return null;
            return { v: v, vt: vt, th: INV[fn](v) };
          }, function (c) { return okR(c.th, 0) && c.th > 8 && c.th < 84; }, null);
          var alts = [];
          ['sin', 'cos', 'tan'].forEach(function (g) { if (g !== fn && (g === 'tan' || c.v <= 1)) alts.push(A(INV[g](c.v), 'tv-wrong-fn', 'Check the key: the equation has ' + t(FN[fn]) + ', so use ' + t(FN[fn] + '^{-1}') + '.')); });
          alts.push(A(RADI[fn](c.v), 'radian', RADH), A(DEG[fn](c.v), 'tv-ratio-for-angle', 'To find the angle, use the inverse key ' + t(FN[fn] + '^{-1}') + ', not ' + t(FN[fn]) + '.'));
          return nearP(t(FN[fn] + '\\theta=' + c.vt), c.th, 0, '°', alts, t('\\theta=' + FN[fn] + '^{-1}\\!\\left(' + c.vt + '\\right)=' + c.th.toFixed(2) + '^\\circ\\approx' + dg(Math.round(c.th))),
            ['Use the inverse key ' + t(FN[fn] + '^{-1}') + ' (2nd / shift), in degree mode.'], 'inverse ' + fn + ' ' + c.vt, t('\\theta='));
        } }; }) },
      { num: '8', outcome: 'M4', stem: 'Find ' + t('\\theta') + ', to the nearest degree.',
        shared: function (r) { return { fns: r.sample(['sin', 'cos', 'tan'], 2) }; },
        parts: [0, 1].map(function (i) { return { id: '8' + 'ab'[i], outcome: 'M4', level: 'BEG', make: function (r, sh) {
          var fn = sh.fns[i], nr = NUM[fn], dr = DEN[fn];
          var c = find(function () { var den = r.int(6, 24), num = fn === 'tan' ? r.int(4, 24) : r.int(Math.ceil(den * 0.3), Math.floor(den * 0.92)); if (num === den) return null; return { num: num, den: den, s: solveAngle(num, nr, den, dr) }; },
            function (c) { return c.s.th > 15 && c.s.th < 75 && okR(c.s.th, 0); }, null);
          var T = fn === 'sin' ? tri({ A: 'A', B: 'B', R: 'C' }, c.num, Math.sqrt(c.den * c.den - c.num * c.num), c.den) : fn === 'cos' ? tri({ A: 'A', B: 'B', R: 'C' }, Math.sqrt(c.den * c.den - c.num * c.num), c.num, c.den) : tri({ A: 'A', B: 'B', R: 'C' }, c.num, c.den, Math.hypot(c.num, c.den));
          var lab = {}, o = ori(r), u = 'cm'; lab[nr] = c.num + ' ' + u; lab[dr] = c.den + ' ' + u;
          return nearP(triFig(T, { lab: lab, angA: 'θ', names: false, rot: o.rot, flip: o.flip, width: 290 }), c.s.th, 0, '°', c.s.alts, angleWork(c.s, c.num, c.den),
            ['Name the two given sides from ' + t('\\theta') + ', then choose SOH, CAH or TOA.', 'Use the inverse key, e.g. ' + t(FN[fn] + '^{-1}') + '.'], 'angle from ' + fn + ' ' + c.num + '/' + c.den, t('\\theta='));
        } }; }) },
      { num: '9', outcome: 'M4',
        shared: function (r) {
          return find(function () {
            var nm = names(r), th = r.int(25, 65), kr = r.pick(['a', 'a', 'o']), k = r.chance(0.5) ? r.int(10, 30) : tenth(r, 8, 25), ur = kr === 'a' ? 'o' : 'a';
            return { nm: nm, th: th, kr: kr, k: k, ur: ur, o: ori(r), unit: r.pick(['cm', 'm']), hs: solveSide(k, kr, 'h', th, 'hyp'), ls: solveSide(k, kr, ur, th, 'leg') };
          }, function (s) { return okR(s.hs.x, 1) && okR(s.ls.x, 1); }, null);
        },
        stem: function (s) {
          var nm = s.nm, T = fromAngle(nm, s.th, s.kr, s.k), lab = {}; lab[s.kr] = nf(s.k) + ' ' + s.unit;
          var other = s.ur === 'a' ? sn(nm.A, nm.R) : sn(nm.B, nm.R);
          return 'Solve ' + t('\\triangle ' + nm.L.join('')) + ': find ' + t('\\angle ' + nm.B) + ' and the lengths of ' + t(other) + ' and ' + t(sn(nm.A, nm.B)) + '. Give sides to the nearest tenth.' + triFig(T, { lab: lab, angA: s.th + '°', rot: s.o.rot, flip: s.o.flip });
        },
        parts: [
          { id: '9', outcome: 'M4', level: 'PRG', make: function (r, s) {
            var nm = s.nm, hyp = sn(nm.A, nm.B), other = s.ur === 'a' ? sn(nm.A, nm.R) : sn(nm.B, nm.R), given = s.kr === 'a' ? sn(nm.A, nm.R) : sn(nm.B, nm.R), u = s.unit, B = 90 - s.th;
            var hs = solveSide(s.k, s.kr, 'h', s.th, t(hyp)), ls = solveSide(s.k, s.kr, s.ur, s.th, t(other)), lr = RT(ls.x, 1);
            var hAlts = hs.alts.concat([A(Math.sqrt(lr * lr + s.k * s.k), 'early-round', EARLY)]);
            var p = P.fields('Solve the triangle.', [{ name: '∠' + nm.B, before: t('\\angle ' + nm.B + '='), after: '°' }, { name: other, before: t(other + '='), after: u }, { name: hyp, before: t(hyp + '='), after: u }],
              [intChk(B, [A(180 - s.th, 'angle-180', 'The angles of a triangle add to ' + t('180^\\circ') + ', and one of them is the right angle: ' + t('90^\\circ-' + dg(s.th)) + '.'), A(s.th, 'u9t-same-angle', 'That is the given angle. The other acute angle is ' + t('90^\\circ-' + dg(s.th)) + '.')]), nearC(ls.x, 1, ls.alts), nearC(hs.x, 1, hAlts)],
              [String(B), fx(ls.x, 1), fx(hs.x, 1)], t('\\angle ' + nm.B + '=' + dg(B)) + ', ' + t(other + '\\approx' + fx(ls.x, 1)) + ' ' + u + ', ' + t(hyp + '\\approx' + fx(hs.x, 1)) + ' ' + u,
              t('\\angle ' + nm.B + '=90^\\circ-' + dg(s.th) + '=' + dg(B)) + '<br>From ' + t('\\angle ' + nm.A) + ', ' + t(given) + ' is ' + ROLE[s.kr] + '.<br><b>' + t(other) + ':</b> ' + sideWork(ls, s.kr, s.ur, s.th, other, nf(s.k), u, true) + '<br><b>' + t(hyp) + ':</b> ' + sideWork(hs, s.kr, 'h', s.th, hyp, nf(s.k), u, true),
              ['The acute angles of a right triangle add to ' + t('90^\\circ') + '.', 'From the ' + t(dg(s.th)) + ' angle, is the given side opposite or adjacent? Use it (not a rounded answer) for both sides.'], 'solve triangle ' + s.th + ' ' + s.k);
            p.bad = [[String(180 - s.th), fx(ls.x, 1), fx(hs.x, 1)], [String(B), badOf(ls.x, 1, ls.alts)[0] || '0', fx(hs.x, 1)]];
            return p;
          } }] },
      { num: '10', outcome: 'M4', parts: [
        { id: '10', outcome: 'M4', level: 'PRG', make: function (r) {
          var c = find(function () {
            var nm = names(r, true), x = tenth(r, 6, 25), y = tenth(r, 6, 25), o, a, h, mr;
            if (r.chance(0.6)) { o = x; a = y; h = Math.hypot(x, y); mr = 'h'; }
            else { h = Math.max(x, y); var l = Math.min(x, y); if (h - l < 2) return null; var other = Math.sqrt(h * h - l * l); mr = r.pick(['o', 'a']); if (mr === 'a') { o = l; a = other; } else { a = l; o = other; } }
            return { nm: nm, mr: mr, T: tri(nm, o, a, h), th: Tg.atan(o / a) };
          }, function (c) { return okR(sideOf(c.T, c.mr), 1) && okR(c.th, 0) && okR(90 - c.th, 0) && c.th > 15 && c.th < 75 && Math.abs(c.th - 45) > 2; }, null);
          var T = c.T, nm = c.nm, unit = r.pick(['m', 'cm', 'mm']), A0 = T.A, B0 = T.B, mr = c.mr;
          var giv = r.shuffle(['o', 'a', 'h'].filter(function (x) { return x !== mr; }).map(function (x) { return [x, x === 'o' ? T.opp : x === 'a' ? T.adj : T.hyp, sideOf(T, x)]; }));
          var mName = mr === 'o' ? T.opp : mr === 'a' ? T.adj : T.hyp, mVal = sideOf(T, mr);
          var g0 = giv[0], g1 = giv[1], p0 = g0[2], p1 = g1[2];
          var mAlts = mr === 'h' ? [A(Math.sqrt(Math.abs(p0 * p0 - p1 * p1)), 'u9t-pyth-sub', 'You are finding the <b>hypotenuse</b>, so add the squares of the legs.'), A(p0 + p1, 'u9t-legs-added', 'Square, add, then take the square root: ' + t('c=\\sqrt{a^2+b^2}') + '.')] : [A(Math.hypot(p0, p1), 'u9t-pyth-add', 'The hypotenuse is the longest side: to find a <b>leg</b>, subtract the squares.')];
          mAlts.push(A(mr === 'h' ? p0 * p0 + p1 * p1 : Math.abs(p0 * p0 - p1 * p1), 'pyth-noroot', 'That is the square of the side. Take the square root.'));
          var sA = solveAngle(g0[2], g0[0], g1[2], g1[0]); // the angle at A0 from the two given sides (roles relative to A0)
          var thA = sA.th, thB = 90 - thA, altA = sA.alts;
          var altB = [A(thA, 'other-angle', 'That is ' + t('\\angle ' + A0) + '. The two acute angles add to ' + t('90^\\circ') + '.'), A(180 - thA, 'angle-180', 'The acute angles of a right triangle add to ' + t('90^\\circ') + ', not ' + t('180^\\circ') + '.'), A(RADI[sA.fn](sA.v) , 'radian', RADH)];
          var lab = {}; lab[g0[0]] = nf(g0[2]); lab[g1[0]] = nf(g1[2]); lab[mr] = mName;
          var p = P.fields('Solve right ' + t('\\triangle ' + nm.L.join('')) + ', where ' + t('\\angle ' + nm.R + '=90^\\circ') + ', ' + t(g0[1] + '=' + nf(g0[2])) + ' ' + unit + ' and ' + t(g1[1] + '=' + nf(g1[2])) + ' ' + unit + '. Sketch and label it first. Give the side to the nearest tenth and the angles to the nearest degree.',
            [{ name: mName, before: t(mName + '='), after: unit }, { name: '∠' + A0, before: t('\\angle ' + A0 + '='), after: '°' }, { name: '∠' + B0, before: t('\\angle ' + B0 + '='), after: '°' }],
            [nearC(mVal, 1, mAlts), nearC(thA, 0, altA), nearC(thB, 0, altB)], [fx(mVal, 1), fx(thA, 0), fx(thB, 0)],
            t(mName + '\\approx' + fx(mVal, 1)) + ' ' + unit + ', ' + t('\\angle ' + A0 + '\\approx' + dg(Math.round(thA))) + ', ' + t('\\angle ' + B0 + '\\approx' + dg(Math.round(thB))),
            sideRow('<div style="flex:0 1 200px">' + triSvg(T, { lab: lab, width: 190 }) + '</div>', '<div>' + t(mName + '=\\sqrt{' + (mr === 'h' ? nf(p0) + '^2+' + nf(p1) + '^2' : nf(Math.max(p0, p1)) + '^2-' + nf(Math.min(p0, p1)) + '^2') + '}=' + fl(mVal) + '\\approx' + fx(mVal, 1)) + ' ' + unit + '</div>') +
              '<b>' + t('\\angle ' + A0) + ':</b> ' + t(g0[1]) + ' is ' + ROLE[g0[0]] + ', ' + t(g1[1]) + ' is ' + ROLE[g1[0]] + ' ' + t('\\Rightarrow') + ' <b>' + RULE[sA.fn] + '</b>: ' + t('\\angle ' + A0 + '=' + FN[sA.fn] + '^{-1}\\!\\left(\\frac{' + nf(sA.num) + '}{' + nf(sA.den) + '}\\right)=' + thA.toFixed(2) + '^\\circ\\approx' + dg(Math.round(thA))) +
              '<br><b>' + t('\\angle ' + B0) + ':</b> ' + t('90^\\circ-' + thA.toFixed(2) + '^\\circ=' + thB.toFixed(2) + '^\\circ\\approx' + dg(Math.round(thB))),
            ['The hypotenuse is across from ' + t('\\angle ' + nm.R) + '. Use the Pythagorean theorem for the third side.', 'Use the two <b>given</b> sides and an inverse ratio for one angle; the acute angles add to ' + t('90^\\circ') + '.'], 'solve from two sides ' + p0 + ',' + p1);
          p.bad = [[badOf(mVal, 1, mAlts)[0] || '0', fx(thA, 0), fx(thB, 0)], [fx(mVal, 1), fx(thB, 0), fx(thA, 0)]];
          return p;
        } }] },
      { num: '11', outcome: 'M4', parts: [
        { id: '11', outcome: 'M4', level: 'MAS', make: function (r) {
          var s = find(function () { var c = r.pick(ISO_CTX), sd = tenth(r, c.lo[0], c.lo[1]), b = RT(sd * (c.q[0] + r.next() * (c.q[1] - c.q[0])), 1); if (Math.round(b * 10) % 2) b = RT(b + 0.1, 1); var hp = Tg.asin(b / 2 / sd); return { c: c, s: sd, b: b, half: hp, peak: 2 * hp, hgt: Math.sqrt(sd * sd - b * b / 4) }; },
            function (s) { return okR(s.peak, 0) && okR(s.hgt, 1) && s.b / 2 < s.s - 0.2 && Math.abs(s.peak - 90) > 2; }, null);
          var c = s.c, hb = RT(s.b / 2, 2), top = c.top;
          var pAlts = [A(s.half, 'half-angle', 'That is the angle in <b>one</b> half. The altitude splits the ' + top + ' angle in two, so double it.'), A(90 - s.half, 'base-angle', 'That is a <b>base</b> angle. The question asks for the angle at the ' + top + '.'), A(2 * RADI.sin(s.b / 2 / s.s), 'radian', RADH), A(2 * Tg.atan(s.b / 2 / s.s), 'wrong-ratio', 'In each half, the half-base is opposite the half-angle and the ' + c.sides.replace(/s$/, '') + ' is the hypotenuse: SOH.')];
          if (s.b < s.s) pAlts.push(A(2 * Tg.asin(s.b / s.s), 'full-base', 'Use <b>half</b> the base: the altitude cuts the base into two equal parts.'));
          var hAlts = [A(Math.sqrt(s.s * s.s + s.b * s.b / 4), 'u9t-pyth-add', 'The ' + c.sides.replace(/s$/, '') + ' is the hypotenuse: subtract the squares to find the height.'), A(s.s * Tg.cos(Math.round(s.peak) / 2), 'early-round', EARLY), A(s.s * Tg.sin(s.half), 'wrong-ratio', 'The height is <b>adjacent</b> to the half-angle at the ' + top + ': use cosine (or the Pythagorean theorem).')];
          if (s.b < s.s) hAlts.push(A(Math.sqrt(s.s * s.s - s.b * s.b), 'full-base', 'Use <b>half</b> the base in the Pythagorean theorem.'));
          var p = P.fields(c.what + ' ' + t(nf(s.s)) + ' m and a base of ' + t(nf(s.b)) + ' m.' + isoFig(s) + 'SOH CAH TOA cannot be used on this triangle as it is (explain why in your work). Draw the altitude from the ' + top + ' to the base. Then find the angle at the ' + top + ' (to the nearest degree) and the height (to the nearest tenth).',
            [{ name: 'Half of the base', label: 'Each right triangle has a base of', after: 'm' }, { name: 'Angle at the ' + top, label: 'Angle at the ' + top + ':', after: '°' }, { name: 'Height', label: 'Height:', after: 'm' }],
            [K.number(hb, function (v) { return Math.abs(v - s.b) < 1e-9 ? { code: 'full-base', hint: 'The altitude cuts the base in <b>half</b>.' } : null; }), nearC(s.peak, 0, pAlts), nearC(s.hgt, 1, hAlts)],
            [nf(hb), fx(s.peak, 0), fx(s.hgt, 1)], 'half-base ' + t(nf(hb)) + ' m, ' + top + ' angle ' + t('\\approx' + dg(Math.round(s.peak))) + ', height ' + t('\\approx' + fx(s.hgt, 1)) + ' m',
            'The ratios need a <b>right</b> triangle, and this one has no right angle. The altitude from the ' + top + ' makes two congruent right triangles: it halves the base (' + t(nf(s.b) + '\\div 2=' + nf(hb)) + ' m) and the angle at the ' + top + '.<br>' +
              'SOH: ' + t('\\sin(\\text{half})=\\frac{' + nf(hb) + '}{' + nf(s.s) + '}') + ', half ' + t('=' + s.half.toFixed(2) + '^\\circ') + '<br>Angle at the ' + top + ' ' + t('=2(' + s.half.toFixed(2) + '^\\circ)=' + s.peak.toFixed(2) + '^\\circ\\approx' + dg(Math.round(s.peak))) + '<br>Height ' + t('=\\sqrt{' + nf(s.s) + '^2-' + nf(hb) + '^2}=' + fl(s.hgt) + '\\approx' + fx(s.hgt, 1)) + ' m',
            ['SOH CAH TOA needs a right angle. Where does the altitude meet the base?', 'In each half: the half-base is opposite the half-angle, and the ' + c.sides.replace(/s$/, '') + ' is the hypotenuse.'], 'isosceles ' + s.s + ' ' + s.b);
          p.bad = [[nf(s.b), fx(s.peak, 0), fx(s.hgt, 1)], [nf(hb), fx(s.half, 0), fx(s.hgt, 1)]];
          return p;
        } }] },
      { num: '12', outcome: 'M4', shared: q12Shared,
        stem: function (s) { return s.c.intro(s); },
        parts: [
          { id: '12a', outcome: 'M4', level: 'MAS', make: function (r, s) {
            var c = s.c, f = c.fn, verdict = s.meets ? 'yes' : 'no', g = f === 'sin' ? 'tan' : 'sin';
            var aAlts = [A(INV[g](s.rise / s.len), 'wrong-ratio', f === 'sin' ? 'The length along the slope is the <b>hypotenuse</b>, so use SOH.' : 'The horizontal distance is the <b>adjacent</b> side (not the slope), so use TOA.'), A(RADI[f](s.rise / s.len), 'radian', RADH), A(90 - s.ang, 'other-angle', 'That angle is at the top of the ' + (f === 'sin' ? 'ramp' : 'slope') + '. The angle of rise is at the ground.')];
            var vc = function (resp) {
              var w = clean(resp).split(' '); if (!w[0]) return form('empty', 'Type <b>yes</b> or <b>no</b>.');
              var y = YES.indexOf(w[0]) >= 0, n = NO.indexOf(w[0]) >= 0 || w.indexOf('not') >= 0 || w.indexOf('doesnt') >= 0;
              if (!y && !n) return form('u9t-word', 'Type <b>yes</b> or <b>no</b>.');
              return (n && !s.meets) || (y && !n && s.meets) ? ok() : wrong('u9t-verdict', 'Compare your angle with the limit ' + t(dg(s.max)) + ': the ' + (f === 'sin' ? 'ramp' : 'slope') + ' meets the code only if its angle is at most ' + t(dg(s.max)) + '.');
            };
            var p = P.fields(c.a(s) + ' Find the angle of rise, to the nearest tenth of a degree, then decide.', [{ name: 'Angle', label: 'Angle of rise:', after: '°' }, { name: 'Meets the code?', label: 'Meets the code? (yes / no)', mode: 'text', placeholder: 'yes/no' }],
              [nearC(s.ang, 1, aAlts), vc], [fx(s.ang, 1), verdict], t(fx(s.ang, 1) + '^\\circ') + '; ' + (s.meets ? '<b>yes</b>' : '<b>no</b>'),
              'Rise is OPP, ' + (f === 'sin' ? 'ramp is HYP ' + t('\\Rightarrow') + ' <b>SOH</b>' : 'run is ADJ ' + t('\\Rightarrow') + ' <b>TOA</b>') + ': ' + t(FN[f] + '\\theta=\\frac{' + nf(s.rise) + '}{' + nf(s.len) + '}') + ', ' + t('\\theta=' + s.ang.toFixed(2) + '^\\circ\\approx' + fx(s.ang, 1) + '^\\circ') + '.<br>' +
                t(fx(s.ang, 1) + '^\\circ' + (s.meets ? '\\le ' : '>') + dg(s.max)) + ': ' + (s.meets ? 'not too steep, so <b>yes</b>, it meets the code.' : 'too steep, so <b>no</b>.'),
              ['Find the angle of the ' + (f === 'sin' ? 'ramp' : 'slope') + ' first, then compare it with ' + t(dg(s.max)) + '.', 'Justify by comparing the angle with the code — a bare yes/no is not enough.'], 'code check ' + s.max + ' ' + s.rise + ' ' + s.len);
            p.bad = [[fx(s.ang, 1), s.meets ? 'no' : 'yes'], [badOf(s.ang, 1, aAlts)[0] || '0', verdict]];
            return p;
          } },
          { id: '12b', outcome: 'M4', level: 'MAS', make: function (r, s) {
            var c = s.c, f = c.fn, g = f === 'sin' ? 'tan' : 'sin';
            var alts = [A(s.rise * DEG[f](s.max), 'mult-div', 'The unknown is on the <b>bottom</b> of the ratio, so divide: ' + t(c.bn + '=\\frac{' + nf(s.rise) + '}{' + FN[f] + dg(s.max) + '}') + '.'), A(s.rise / DEG[g](s.max), 'wrong-ratio', f === 'sin' ? 'The ramp along its slope is the hypotenuse: use SOH.' : 'The horizontal distance is adjacent to the angle: use TOA.'), A(s.rise / RADF[f](s.max), 'radian', RADH), A(s.len, 'u9t-same-error', 'That is the length from (a). Use the steepest angle the code allows, ' + t(dg(s.max)) + '.')];
            return nearP(c.b, s.best, 1, 'm', alts, 'The shortest one is as steep as allowed: ' + t('\\theta=' + dg(s.max)) + '.<br>' + t(FN[f] + dg(s.max) + '=\\frac{' + nf(s.rise) + '}{' + c.bn + '}') + ', ' + t(c.bn + '=\\frac{' + nf(s.rise) + '}{' + FN[f] + dg(s.max) + '}=' + fl(s.best) + '\\approx' + fx(s.best, 1)) + ' m',
              ['The shortest ' + (f === 'sin' ? 'ramp' : 'run') + ' is the steepest one allowed: use ' + t(dg(s.max)) + '.', 'Is the unknown on top or on the bottom of the ratio?'], 'shortest ' + s.max + ' ' + s.rise, t(c.bn + '='));
          } }] },

      /* ======================= M4 · Part 3: elevation, depression, bearings and two triangles ======================= */
      { num: '13', outcome: 'M4',
        shared: function (r) { var n = r.shuffle(['1', '2', '3']); return { c: r.pick(DEP_CTX), dep: r.pick([20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 47, 48, 49, 50, 52, 54]), lab: { hor: n[0], wall: n[1], gr: n[2] } }; },
        stem: function (s) { return s.c.words + ' Three angles are numbered on the diagram.' + q13Fig(s); },
        parts: [
          { id: '13a', outcome: 'M4', level: 'BEG', make: function (r, s) {
            var T = s.c.top, C = s.c.obj, cols = ['1', '2', '3'].map(function (n) { return { id: n, html: 'Angle ' + n }; });
            var p = P.grid('Which numbered angle is the angle of depression of ' + t(C) + ' from ' + t(T) + ', and which is the angle of elevation of ' + t(T) + ' from ' + t(C) + '?',
              [{ id: 'dep', html: 'Angle of depression of ' + t(C) + ' from ' + t(T) }, { id: 'elev', html: 'Angle of elevation of ' + t(T) + ' from ' + t(C) }], cols, { dep: s.lab.hor, elev: s.lab.gr }, {},
              'Both are measured from a <b>horizontal</b> line. The angle of depression is at ' + t(T) + ', down from the horizontal line of sight: angle ' + s.lab.hor + '. The angle of elevation is at ' + t(C) + ', up from the ground: angle ' + s.lab.gr + '. (Angle ' + s.lab.wall + ' is measured from the vertical ' + s.c.tall + '.)',
              ['Angles of elevation and depression are always measured from the <b>horizontal</b>.'], 'mark depression/elevation');
            p.check = function (resp) {
              resp = resp || {}; if (!resp.dep || !resp.elev) return form('incomplete', 'Choose one angle in each row.');
              if (resp.dep === s.lab.hor && resp.elev === s.lab.gr) return ok();
              if (resp.dep === s.lab.wall) return wrong('depr-vertical', 'Angle ' + s.lab.wall + ' is measured from the vertical ' + s.c.tall + '. The angle of depression is measured down from the <b>horizontal</b> at ' + t(T) + '.');
              if (resp.dep === s.lab.gr && resp.elev === s.lab.hor) return wrong('u9t-side-name', 'Those are swapped: the angle of depression is at the observer on top, ' + t(T) + '; the angle of elevation is at ' + t(C) + ', looking up.');
              return wrong('row', 'Both angles are measured from a horizontal line: the depression at ' + t(T) + ', the elevation at ' + t(C) + '.');
            };
            p.bad = [{ dep: s.lab.wall, elev: s.lab.gr }, { dep: s.lab.gr, elev: s.lab.hor }];
            return p;
          } },
          { id: '13b', outcome: 'M4', level: 'BEG', make: function (r, s) {
            var p = P.number('The angle of depression is ' + t(dg(s.dep)) + '. What is the angle of elevation?', s.dep, function (v) { return v === 90 - s.dep ? { code: 'other-angle', hint: 'That is the angle at ' + t(s.c.top) + ' between the line of sight and the ' + s.c.tall + '. The angle of elevation is measured from the ground.' } : v === 180 - s.dep ? { code: 'angle-180', hint: 'The angle of elevation is an acute angle measured up from the ground.' } : null; },
              t(dg(s.dep)) + '. The horizontal line at ' + t(s.c.top) + ' and the ground are parallel, and the line of sight crosses both, so the angles are <b>alternate angles</b> and are equal.', ['Look for parallel lines cut by the line of sight.'], 'elevation = depression ' + s.dep, { after: '°' });
            p.answer = t(dg(s.dep)); p.bad = [String(90 - s.dep)];
            return p;
          } },
          { id: '13c', outcome: 'M4', level: 'BEG', make: function (r, s) {
            return P.mc(r, 'Which reason explains your answer to (b)?', [
              { html: 'The horizontal line at ' + t(s.c.top) + ' and the ground are parallel, and the line of sight crosses both, so the two angles are <b>alternate angles</b>: they are equal.', right: true },
              { html: 'The two angles are <b>complementary</b>: they add to ' + t('90^\\circ') + '.', why: 'Complementary angles share a right angle. These two angles are at different points, ' + t(s.c.top) + ' and ' + t(s.c.obj) + ', between parallel lines.' },
              { html: 'The angles of the triangle add to ' + t('180^\\circ') + ', so the elevation is ' + t('180^\\circ-90^\\circ-' + dg(s.dep)) + '.', why: 'That is the angle at ' + t(s.c.top) + ' between the line of sight and the ' + s.c.tall + ', not the elevation.' },
              { html: 'They are <b>vertically opposite</b> angles, so they are equal.', why: 'Vertically opposite angles are at the same point where two lines cross. These are at two different points.' }],
              'The horizontal line at ' + t(s.c.top) + ' and the ground are parallel; the line of sight is a transversal, so the angle of depression and the angle of elevation are alternate angles and are equal.', ['Look for parallel lines cut by the line of sight.'], 'alternate angles reason');
          } }] },
      { num: '14', outcome: 'M4', parts: [
        { id: '14', outcome: 'M4', level: 'BEG', make: function (r) {
          var c = r.pick(ONE_CTX), s = find(function () { var th = r.int(c.th[0], c.th[1]), k = c.k(r); return { c: c, th: th, k: k, ss: solveSide(k, c.kr, 'o', th, t('h')) }; }, function (s) { return okR(s.ss.x, 1); }, null);
          return nearP(c.text(s) + '<div class="fig" style="text-align:center;margin:6px 0">' + q14Fig(s) + '</div>', s.ss.x, 1, 'm', s.ss.alts, sideWork(s.ss, c.kr, 'o', s.th, 'h', c.key === 'plane' ? F(s.k) : nf(s.k), 'm'),
            ['Is the given length the hypotenuse or the side along the ground?', 'Then choose SOH or TOA and solve for ' + t('h') + '.'], c.key + ' height ' + s.th + ' ' + s.k, t('h='));
        } }] },
      { num: '15', outcome: 'M4', stem: 'Write the bearing of each point from the centre.',
        shared: function (r) {
          return find(function () {
            var qs = r.sample([0, 1, 2, 3], 3).sort(), pts = qs.map(function (q) { var a = r.pick([20, 22, 24, 25, 28, 30, 32, 35, 36, 38, 40, 42, 48, 50, 52, 54, 55, 58, 60, 62, 65, 68, 70]), st = q * 90, en = st + 90, fromStart = r.chance(0.5); return { a: a, from: fromStart ? st : en, b: fromStart ? st + a : en - a, st: st, en: en, fs: fromStart }; });
            ['P', 'Q', 'R'].forEach(function (n, i) { pts[i].name = n; });
            return pts;
          }, function (pts) { var vert = pts.filter(function (p) { return p.from % 180 === 0; }).length; return vert >= 1 && vert <= 2; }, null);
        },
        parts: [
          { id: '15', outcome: 'M4', level: 'BEG', make: function (r, pts) {
            var LN = { 0: 'north', 90: 'east', 180: 'south', 270: 'west', 360: 'north' };
            var checks = pts.map(function (p) { return bearingChk(p.b, [A(p.a, 'bearing-ref', 'That is the marked angle. A bearing is measured <b>clockwise from north</b>.'), A(360 - p.b, 'bearing-ccw', 'Bearings go <b>clockwise</b> from north.'), A(p.fs ? p.en - p.a : p.st + p.a, 'bearing-ref', 'Check which line the ' + t(dg(p.a)) + ' is measured from: it is measured from ' + LN[p.from] + '.')]); });
            var p = P.fields(compassSvg(pts), pts.map(function (q) { return { name: q.name, before: t(q.name + ':'), after: '°', placeholder: '000' }; }), checks, pts.map(function (q) { return b3(q.b); }),
              pts.map(function (q) { return t(q.name + ':\\ ' + b3(q.b) + '^\\circ'); }).join(', '),
              'A bearing is measured clockwise from north, with three digits.<br>' + pts.map(function (q) { return t(q.name) + ': ' + (q.fs ? (q.st === 0 ? t(dg(q.a)) + ' clockwise from north: ' + t(b3(q.b) + '^\\circ') : t(dg(q.a)) + ' past ' + LN[q.st] + ': ' + t(dg(q.st) + '+' + dg(q.a) + '=' + b3(q.b) + '^\\circ')) : t(dg(q.a)) + ' before ' + LN[q.en] + ': ' + t(dg(q.en) + '-' + dg(q.a) + '=' + b3(q.b) + '^\\circ')); }).join('<br>'),
              ['Start at north and turn clockwise (towards east) until you reach the point.', 'From east add to ' + t('90^\\circ') + ', from south add to ' + t('180^\\circ') + ', from west add to ' + t('270^\\circ') + '. Write three digits.'], 'bearings ' + pts.map(function (q) { return q.b; }).join(','));
            p.bad = [pts.map(function (q) { return String(q.a); }), pts.map(function (q) { return b3(360 - q.b); })];
            return p;
          } }] },
      { num: '16', outcome: 'M4', parts: [
        { id: '16', outcome: 'M4', level: 'PRG', make: function (r) {
          var CT = [{ who: function (s) { return s.name + '’s eyes are ' + t(nf(s.e)) + ' m above the ground. She stands ' + t(nf(s.d)) + ' m from a building and sees the top at an angle of elevation of ' + t(dg(s.th)) + '. Find the height ' + t('h') + ' of the building.'; }, obj: 'building', names: ['Ava', 'Lena', 'Nadia', 'Priya', 'Zara'] },
            { who: function (s) { return 'A surveyor’s transit is ' + t(nf(s.e)) + ' m tall. It is set up ' + t(nf(s.d)) + ' m from a tree, and the angle of elevation to the top of the tree is ' + t(dg(s.th)) + '. Find the height ' + t('h') + ' of the tree.'; }, obj: 'tree', names: ['x'] },
            { who: function (s) { return s.name + '’s eyes are ' + t(nf(s.e)) + ' m above the floor. He stands ' + t(nf(s.d)) + ' m from a climbing wall and sees its top at an angle of elevation of ' + t(dg(s.th)) + '. Find the height ' + t('h') + ' of the wall.'; }, obj: 'building', names: ['Owen', 'Liam', 'Sam', 'Tariq'] }];
          var c = r.pick(CT), s = find(function () { var o = { e: tenth(r, 1.4, 1.7), d: r.int(12, 40), th: r.int(25, 60), name: r.pick(c.names) }; o.rise = o.d * Tg.tan(o.th); o.h = o.e + o.rise; return o; }, function (o) { return okR(o.h, 1) && okR(o.rise, 1); }, null);
          var alts = [A(s.rise, 'eye-height', 'That is only the part above eye level. Add the ' + t(nf(s.e)) + ' m: the triangle starts at eye level.'), A(s.rise - s.e, 'eye-sub', 'The eye height is <b>below</b> the triangle, so add it.'), A(s.e + s.d / Tg.tan(s.th), 'mult-div', 'The rise is on top of the ratio: ' + t('\\text{rise}=' + s.d + '\\tan' + dg(s.th)) + '.'), A(s.e + s.d * Tg.sin(s.th), 'wrong-ratio', 'The distance along the ground is ADJ and the rise is OPP: TOA.'), A(s.e + s.d * Math.tan(s.th), 'radian', RADH)];
          return nearP(c.who(s) + ' Round to the nearest tenth.' + '<div class="fig" style="text-align:center;margin:6px 0">' + eyeScene({ th: s.th, runLab: nf(s.d) + ' m', eyeLab: nf(s.e) + ' m', obj: c.obj }) + '</div>', s.h, 1, 'm', alts,
            'The ' + t(dg(s.th)) + ' is measured from eye level. The rise above eye level is OPP, ' + t(nf(s.d)) + ' is ADJ ' + t('\\Rightarrow') + ' <b>TOA</b>.<br>' + t('\\text{rise}=' + nf(s.d) + '\\tan' + dg(s.th) + '=' + fl(s.rise)) + ' m<br>' + t('h=' + nf(s.e) + '+' + fl(s.rise) + '=' + fl(s.h) + '\\approx' + fx(s.h, 1)) + ' m (add the eye height: the triangle starts at eye level).',
            ['The angle is measured from eye level, so the right triangle starts ' + t(nf(s.e)) + ' m above the ground.', 'Find the rise above eye level with TOA, then add the eye height.'], 'eye level ' + s.e + ' ' + s.d + ' ' + s.th, t('h='));
        } }] },
      { num: '17', outcome: 'M4', parts: [
        { id: '17', outcome: 'M4', level: 'PRG', make: function (r) {
          var c = r.pick(TRIP_CTX), s = find(function () { var b = r.int(5, 355), D = c.int ? r.int(c.d[0], c.d[1]) : tenth(r, c.d[0], c.d[1]); var q = quad(b); return { b: b, D: D, q: q, ns: D * Tg.cos(q[2]), ew: D * Tg.sin(q[2]) }; },
            function (s) { return s.b % 90 >= 12 && s.b % 90 <= 78 && s.b % 45 !== 0 && okR(s.ns, 1) && okR(s.ew, 1) && Math.abs(RT(s.ns, 1) - RT(s.ew, 1)) > 0.2; }, null);
          var q = s.q, ref = q[2], rL = q[0] === 'north' ? '360^\\circ' : '180^\\circ', refEq = s.b < 90 ? 'The bearing is the angle with the north line: ' + t(dg(ref)) : s.b < 180 ? 'Angle with the south line ' + t('=180^\\circ-' + dg(s.b) + '=' + dg(ref)) : s.b < 270 ? 'Angle with the south line ' + t('=' + dg(s.b) + '-180^\\circ=' + dg(ref)) : 'Angle with the north line ' + t('=360^\\circ-' + dg(s.b) + '=' + dg(ref));
          var u = 'km', Ds = c.int ? String(s.D) : nf(s.D);
          var nsAlts = [A(s.ew, 'trig-bearing-swap', 'That is the ' + q[1] + ' distance. The ' + q[0] + ' distance is <b>adjacent</b> to the ' + t(dg(ref)) + ' angle at the north–south line: CAH.'), A(s.D * Math.cos(ref), 'radian', RADH), A(s.D * Math.abs(Tg.cos(s.b - (s.b < 180 ? 90 : 270))), 'trig-bearing-swap', 'Measure the angle in the triangle from the north–south line.')];
          var ewAlts = [A(s.ns, 'trig-bearing-swap', 'That is the ' + q[0] + ' distance. The ' + q[1] + ' distance is <b>opposite</b> the ' + t(dg(ref)) + ' angle: SOH.'), A(s.D * Math.sin(ref), 'radian', RADH)];
          var p = P.fields(c.who + ' ' + t(c.n0) + ' and ' + c.verb + ' ' + t(Ds) + ' km on a bearing of ' + t(b3(s.b) + '^\\circ') + ' to point ' + t(c.n1) + '. How far ' + q[0] + ' and how far ' + q[1] + ' of ' + t(c.n0) + ' is ' + t(c.n1) + '? Round to the nearest tenth.' + tripSvg(s.b, Ds + ' km', c.n0, c.n1),
            [{ name: q[0], label: 'How far ' + q[0] + ':', after: u }, { name: q[1], label: 'How far ' + q[1] + ':', after: u }], [nearC(s.ns, 1, nsAlts), nearC(s.ew, 1, ewAlts)], [fx(s.ns, 1), fx(s.ew, 1)],
            t(fx(s.ns, 1)) + ' km ' + q[0] + ', ' + t(fx(s.ew, 1)) + ' km ' + q[1],
            tripSvg(s.b, Ds + ' km', c.n0, c.n1, true) + refEq + '.<br>' + q[0][0].toUpperCase() + q[0].slice(1) + ' distance is ADJ to ' + t(dg(ref)) + ' (CAH): ' + t(Ds + '\\cos' + dg(ref) + '=' + fl(s.ns) + '\\approx' + fx(s.ns, 1)) + ' km<br>' + q[1][0].toUpperCase() + q[1].slice(1) + ' distance is OPP to ' + t(dg(ref)) + ' (SOH): ' + t(Ds + '\\sin' + dg(ref) + '=' + fl(s.ew) + '\\approx' + fx(s.ew, 1)) + ' km',
            ['Draw the north–south line through ' + t(c.n0) + ' and a horizontal line through ' + t(c.n1) + ': that makes a right triangle.', 'The angle inside the triangle is measured from the north–south line, not the bearing itself (unless it is under ' + t('90^\\circ') + ').'], 'bearing components ' + s.b + ' ' + s.D);
          p.bad = [[fx(s.ew, 1), fx(s.ns, 1)]];
          return p;
        } }] },
      { num: '18', outcome: 'M4', parts: [
        { id: '18', outcome: 'M4', level: 'MAS', make: function (r) {
          var s = q18Shared(r), alts, prompt, sol;
          if (s.v === 'same') {
            var obj = s.ctx === 'buoys' ? 'two buoys' : 'two boats';
            prompt = 'From the top of a ' + t(s.H) + ' m cliff, the angles of depression to ' + obj + ' due east of the cliff, in line with its base, are ' + t(dg(s.a1)) + ' and ' + t(dg(s.a2)) + '. Draw and label a diagram. Then find the distance between the ' + s.ctx + ', to the nearest metre.';
            alts = [A(s.d1 + s.d2, 'trig-sum-diff', 'Both ' + s.ctx + ' are on the <b>same</b> side of the cliff, so subtract the distances.'), A(s.d2, 'ch-one-piece', 'That is how far the far one is from the cliff. Subtract the near distance.'), A(s.H * Tg.tan(s.a1) - s.H * Tg.tan(s.a2), 'mult-div', 'The height is opposite the angle at each ' + s.ctx.replace(/s$/, '') + ' and the distance is adjacent: ' + t('d=\\frac{' + s.H + '}{\\tan\\theta}') + '.'),
              A(Math.round(s.d2) - Math.round(s.d1), 'ch-early', EARLY), A(s.H / Tg.tan(s.a1 - s.a2), 'u9t-angle-diff', 'You can’t subtract the angles and use one triangle (that triangle has no right angle). Find each distance from the cliff, then subtract.')];
            sol = 'Depression from the top = elevation from each ' + s.ctx.replace(/s$/, '') + ' (alternate angles). Each: ' + t(s.H) + ' is OPP, the distance from the base is ADJ ' + t('\\Rightarrow') + ' TOA.<br>near: ' + t('d_1=\\frac{' + s.H + '}{\\tan' + dg(s.a1) + '}=' + fl(s.d1)) + ' m, far: ' + t('d_2=\\frac{' + s.H + '}{\\tan' + dg(s.a2) + '}=' + fl(s.d2)) + ' m<br>distance ' + t('=d_2-d_1=' + fl(s.ans) + '\\approx' + Math.round(s.ans)) + ' m';
          } else if (s.v === 'opposite') {
            var thing = s.ctx === 'tower' ? 'radio tower' : 'flagpole';
            prompt = 'Two friends stand on opposite sides of a ' + t(s.H) + ' m ' + thing + ', in line with its base. Their angles of elevation to the top are ' + t(dg(s.a1)) + ' and ' + t(dg(s.a2)) + '. Draw and label a diagram. Then find how far apart the friends are, to the nearest metre.';
            alts = [A(Math.abs(s.d1 - s.d2), 'trig-sum-diff', 'The friends are on <b>opposite</b> sides, so add the two distances.'), A(Math.max(s.d1, s.d2), 'ch-one-piece', 'That is only one friend’s distance from the base. Add the other.'), A(s.H * Tg.tan(s.a1) + s.H * Tg.tan(s.a2), 'mult-div', 'The height is opposite each angle and the distance is adjacent: ' + t('d=\\frac{' + s.H + '}{\\tan\\theta}') + '.'), A(Math.round(s.d1) + Math.round(s.d2), 'ch-early', EARLY), A(s.H / Tg.tan(s.a1) + s.H * Tg.tan(s.a2), 'mult-div', 'For each friend: ' + t('d=\\frac{' + s.H + '}{\\tan\\theta}') + '.')];
            sol = 'Each friend: ' + t(s.H) + ' is OPP, the distance to the base is ADJ ' + t('\\Rightarrow') + ' TOA.<br>' + t('d_1=\\frac{' + s.H + '}{\\tan' + dg(s.a1) + '}=' + fl(s.d1)) + ' m, ' + t('d_2=\\frac{' + s.H + '}{\\tan' + dg(s.a2) + '}=' + fl(s.d2)) + ' m<br>distance ' + t('=d_1+d_2=' + fl(s.ans) + '\\approx' + Math.round(s.ans)) + ' m';
          } else {
            prompt = 'From the roof of a ' + t(s.H) + ' m building, the angle of depression to the base of a taller building across the street is ' + t(dg(s.a1)) + ', and the angle of elevation to its top is ' + t(dg(s.a2)) + '. Draw and label a diagram. Then find the height of the taller building, to the nearest metre.';
            alts = [A(s.x, 'ch-one-piece', 'That is only the part above the roof of the first building. Add the ' + t(s.H) + ' m.'), A(s.H + s.H * Tg.tan(s.a1) * Tg.tan(s.a2), 'mult-div', 'Lower triangle: ' + t(s.H) + ' is OPP to the ' + t(dg(s.a1)) + ' angle and the street is ADJ, so ' + t('d=\\frac{' + s.H + '}{\\tan' + dg(s.a1) + '}') + '.'), A(s.H + Math.round(s.d1) * Tg.tan(s.a2), 'ch-early', EARLY), A(s.H + RT(s.d1, 0) * Tg.tan(s.a2), 'ch-early', EARLY), A(s.H * Tg.tan(s.a1 + s.a2) / Tg.tan(s.a1), 'u9t-angle-diff', 'Use two right triangles that share the street width ' + t('d') + ': one below eye level, one above.'), A(s.H + s.d1 * Tg.sin(s.a2), 'ch-ratio', 'In the upper triangle the street width is ADJ and the extra height is OPP: TOA.')];
            sol = 'Lower triangle: ' + t(s.H) + ' is OPP to ' + t(dg(s.a1)) + ', the street width ' + t('d') + ' is ADJ ' + t('\\Rightarrow') + ' TOA: ' + t('d=\\frac{' + s.H + '}{\\tan' + dg(s.a1) + '}=' + fl(s.d1)) + ' m<br>Upper triangle (shared side ' + t('d') + ', not rounded): ' + t('x=d\\tan' + dg(s.a2) + '=' + fl(s.x)) + ' m<br>height ' + t('=' + s.H + '+' + fl(s.x) + '=' + fl(s.ans) + '\\approx' + Math.round(s.ans)) + ' m';
          }
          var p = nearP(prompt, s.ans, 0, 'm', alts, '<div class="fig" style="text-align:center;margin:6px 0">' + q18Fig(s) + '</div>' + sol,
            ['Draw the vertical height and the horizontal ground: there are two right triangles that share the height' + (s.v === 'across' ? ' (here: the street width)' : '') + '.', 'Solve each triangle from the given data, then combine. Round only at the end.'], 'two triangles ' + s.v + ' ' + s.H + ' ' + s.a1 + ' ' + s.a2);
          return p;
        } }] },
      { num: '19', outcome: 'M4', parts: [
        { id: '19', outcome: 'M4', level: 'MAS', make: function (r) {
          var s = find(function () {
            var b1 = r.int(5, 355), cw = r.chance(0.6), b2 = norm360(b1 + (cw ? 90 : -90)), d1 = r.int(3, 9), d2 = r.int(3, 9); if (d1 === d2) return null;
            var al = Tg.atan(d2 / d1), se = norm360(b1 + (cw ? al : -al)), ret = norm360(se + 180);
            return { b1: b1, b2: b2, cw: cw, d1: d1, d2: d2, al: al, se: se, ret: ret, dist: Math.hypot(d1, d2), who: r.pick(WHO) };
          }, function (s) { return s.b1 % 90 > 5 && s.b1 % 90 < 85 && okR(s.ret, 0) && okR(s.dist, 1) && Math.round(s.ret) % 360 !== 0; }, null);
          var R = norm360(Math.round(s.ret));
          var retAlts = [A(s.se, 'bearing-back', 'That is the bearing from the start to where ' + s.who + ' ends. To walk back, turn around: add or subtract ' + t('180^\\circ') + '.'), A(norm360(s.b1 + 180), 'u9t-one-leg', 'That is the way back along the first leg only. Add the angle at the start between the first leg and the straight line to the end.'), A(norm360(s.b2 + 180), 'u9t-one-leg', 'That is the reverse of the second leg only. Find the angle at the start first.'), A(norm360(s.b1 + (s.cw ? 90 - s.al : s.al - 90) + 180), 'opp-adj-swap', 'At the start, the first leg (' + t(s.d1) + ' km) is ADJ and the second leg (' + t(s.d2) + ' km) is OPP: ' + t('\\tan\\alpha=\\frac{' + s.d2 + '}{' + s.d1 + '}') + '.')];
          var turnAlts = [A(norm360(s.b1 + s.b2), 'u9t-turn', 'Don’t add the bearings. Both are measured from parallel north lines, so the turn is the <b>difference</b> of the bearings.'), A(180, 'u9t-turn', 'The hiker doesn’t turn back the way they came: the angle between the legs is the difference of the bearings.')].filter(function (a) { return a.v !== 90; });
          var dAlts = [A(s.d1 + s.d2, 'u9t-legs-added', 'The legs meet at a right angle: use the Pythagorean theorem.'), A(s.d1 * s.d1 + s.d2 * s.d2, 'pyth-noroot', 'Take the square root.'), A(Math.sqrt(Math.abs(s.d1 * s.d1 - s.d2 * s.d2)), 'u9t-pyth-sub', 'You are finding the hypotenuse: add the squares.')];
          var side = s.cw ? '+' : '-', b1s = b3(s.b1), b2s = b3(s.b2);
          var p = P.fields(s.who + ' hikes ' + t(s.d1) + ' km on a bearing of ' + t(b1s + '^\\circ') + ', then turns and hikes ' + t(s.d2) + ' km on a bearing of ' + t(b2s + '^\\circ') + '. Draw a diagram. Find the angle the path turns through at the turn (and why), then how far ' + s.who + ' ends up from the start, and the bearing to walk to return directly to the start.',
            [{ name: 'Turn', label: 'Angle between the two legs:', after: '°' }, { name: 'Distance', label: 'Distance from the start:', after: 'km' }, { name: 'Return bearing', label: 'Bearing back to the start:', after: '°', placeholder: '000' }],
            [intChk(90, turnAlts), nearC(s.dist, 1, dAlts), bearingChk(R, retAlts)], ['90', fx(s.dist, 1), b3(R)], 'turn ' + t('90^\\circ') + ', ' + t(fx(s.dist, 1)) + ' km, return bearing ' + t(b3(R) + '^\\circ'),
            t((s.cw ? b2s + '^\\circ-' + b1s + '^\\circ' : b1s + '^\\circ-' + b2s + '^\\circ') + '=90^\\circ') + (Math.abs(s.b2 - s.b1) !== 90 ? ' (going past ' + t('000^\\circ') + ')' : '') + ': both bearings are measured from parallel north lines, so the path turns through ' + t('90^\\circ') + ' and the legs form a right angle.' +
              '<div class="fig" style="text-align:center">' + twoLegSvg(s.b1, s.d1, s.b2, s.d2) + '</div>' +
              'Distance ' + t('=\\sqrt{' + s.d1 + '^2+' + s.d2 + '^2}=' + fl(s.dist) + '\\approx' + fx(s.dist, 1)) + ' km<br>At the start: ' + t('\\tan\\alpha=\\frac{' + s.d2 + '}{' + s.d1 + '}') + ', ' + t('\\alpha=' + s.al.toFixed(2) + '^\\circ') + '<br>Start to end: ' + t(b1s + '^\\circ' + side + s.al.toFixed(2) + '^\\circ=' + s.se.toFixed(2) + '^\\circ') + '<br>Return: ' + t(s.se.toFixed(2) + '^\\circ' + (s.se >= 180 ? '-' : '+') + '180^\\circ=' + s.ret.toFixed(2) + '^\\circ\\approx ' + b3(R) + '^\\circ'),
            ['Draw a north line at the turn too: the angle between the legs is the difference of the bearings.', 'The return bearing is the bearing from the start to the end, plus or minus ' + t('180^\\circ') + '.'], 'two-leg hike ' + s.b1 + ' ' + s.d1 + ' ' + s.d2);
          p.bad = [['90', fx(s.dist, 1), b3(s.se)], ['90', fx(s.d1 + s.d2, 1), b3(R)]];
          return p;
        } }] }
    ]
  });
})(window);
