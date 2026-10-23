/* Math 10C · Unit 9 · Lesson 5 — Solving Right Triangles Completely (M4)
 * Assignment questions 1–14 (u9_L05.tex) and the Lesson 5 Extra Practice (u9_EP05.tex).
 * Every part is a generator: the booklet's numbers are one possible version; the others keep the same kind of triangle,
 * the same given data (which sides / angle), the same rounding and a similar size. Triangle orientation and vertex
 * names vary. "Solve the triangle" parts use one labelled box per unknown; every box is graded from the ORIGINAL data,
 * and a value built on a rounded intermediate (the lesson's main warning) gets its own hint.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, T = HW.trig, rd = K.roundTo;

  HW.addCodes({
    'ratio-inverted': 'Right ratio, rearranged wrong (multiplied instead of divided, or the reverse)',
    'opp-adj-swap': 'Opposite and adjacent swapped (worked from the other acute angle)',
    'wrong-ratio': 'Used the wrong trig ratio',
    radian: 'Calculator in radian mode',
    'other-angle': 'Gave the other acute angle',
    'no-inverse': 'Gave the ratio, not the angle (no inverse)',
    'rounded-early': 'Built on a rounded intermediate value',
    'pyth-op': 'Pythagoras: added the squares instead of subtracting (or the reverse)',
    'angle-180': 'Took the acute angles to add to 180° (ignored the right angle)',
    'same-angle': 'Copied the given acute angle as the other one',
    'depression-angle': 'Put the angle of depression at the wrong vertex',
    'no-half': 'Didn’t halve (the span or the swing angle)',
    'half-only': 'Stopped at half the distance',
    'hyp-only': 'Gave only the return leg, not the total',
    'swap-legs': 'Shorter and longer sides swapped',
    'hyp-base': 'Used the hypotenuse as the base or height of the area',
    'no-half-area': 'Forgot the ½ in the area of a triangle',
    'used-unrounded': 'Used the unrounded angle where the question said to use the rounded one',
    'facts-count': 'Miscounted the independent facts',
    'self-check': 'Picked the wrong self-check',
    'small-triangle': 'Small triangle doesn’t match the ratio',
    'scale-wrong': 'Wrong scale factor'
  });

  /* ---------------- numbers and trig helpers ---------------- */
  var ROLE = { opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' };
  var RULE = { sin: 'SOH', cos: 'CAH', tan: 'TOA' };
  var INV = { sin: 'asin', cos: 'acos', tan: 'atan' };
  var RAD = 'That is what a calculator in <b>radian</b> mode gives. Switch it to <b>degree</b> mode (DEG) and do it again.';
  var CHOP = ' (Or did you chop instead of rounding? Look at the next digit.)';
  function fx(v, dp) { return rd(v, dp).toFixed(dp); }
  function fl(v) { return (Math.round(v * 10000) / 10000).toFixed(4); }
  function tr(v) { return String(Number(v.toFixed(4))); }
  function dg(x) { return x + '^\\circ'; }
  function dec(r, lo, hi) { return r.int(Math.round(lo * 10), Math.round(hi * 10)) / 10; }
  function half(r, lo, hi) { return r.int(Math.round(lo * 2), Math.round(hi * 2)) / 2; }
  function safe(v, dp) { var s = v * Math.pow(10, dp), f = s - Math.floor(s); return Math.abs(f - 0.5) > 0.07; }
  function gen(fn, good) { var o; for (var i = 0; i < 300; i++) { o = fn(); if (good(o)) return o; } return o; }
  function ut(u) { return !u ? '' : u === '°' ? '^\\circ' : /²$/.test(u) ? '\\text{ ' + u.slice(0, -1) + '}^{2}' : '\\text{ ' + u + '}'; }
  function fnFor(a, b) { var s = [a, b]; if (s.indexOf('hyp') >= 0) return s.indexOf('opp') >= 0 ? 'sin' : 'cos'; return 'tan'; }
  function numRole(fn) { return fn === 'cos' ? 'adj' : 'opp'; }
  function denRole(fn) { return fn === 'tan' ? 'adj' : 'hyp'; }
  function rf(role, th) { return role === 'opp' ? T.sin(th) : role === 'adj' ? T.cos(th) : 1; }
  function sideVal(th, kRole, k, uRole) { return k * rf(uRole, th) / rf(kRole, th); }
  function angleFrom(aRole, a, bRole, b) { var fn = fnFor(aRole, bRole), aNum = aRole === numRole(fn); return T[INV[fn]](aNum ? a / b : b / a); }
  function seg(a, b) { return [a, b].sort().join(''); }
  function swapRole(x) { return x === 'opp' ? 'adj' : x === 'adj' ? 'opp' : 'hyp'; }
  function clean(resp) { return String(resp == null ? '' : resp).replace(/\s*(\^\{?\\circ\}?|\\circ|\\degree|°|degrees?|cm\^?2|m\^?2|cm²|m²|mm|cm|km|m)\s*$/i, '').trim(); }

  /* a rounded value with targeted alternatives. An alternative is matched when the response rounds to it (and not to
   * the answer), so a value built on a rounded intermediate is recognised even when it is only one tenth off. */
  function near(x, dp, alts, nr) {
    var want = rd(x, dp), base = K.approx(x, dp, { nr: nr }), tol = 0.6 * Math.pow(10, -dp), trunc = Math.trunc(x * Math.pow(10, dp)) / Math.pow(10, dp);
    var al = (alts || []).filter(function (a) { return isFinite(a.v) && Math.abs(rd(a.v, dp) - want) > 1e-9; });
    return function (resp) {
      var s = clean(resp), p = HW.parse.number(s);
      var dec = (HW.parse.plain(s).split('.')[1] || '').replace(/\D/g, '').length;
      if (p.ok && Math.abs(rd(p.value, dp) - want) > 1e-9 && !(dec > dp && Math.abs(p.value - x) <= tol)) {
        for (var i = 0; i < al.length; i++) {
          var a = al[i];
          if (Math.abs(rd(p.value, dp) - rd(a.v, dp)) < 1e-9 || Math.abs(p.value - a.v) <= tol * 0.85)
            return wrong(a.code, a.hint + (Math.abs(p.value - trunc) < 1e-9 ? CHOP : ''));
        }
      }
      return base(s);
    };
  }
  function badVals(x, dp, alts) {
    var want = fx(x, dp), seen = {}, out = [];
    (alts || []).forEach(function (a) { if (!isFinite(a.v)) return; var s = fx(a.v, dp); if (s !== want && !seen[s] && Number(s) >= 0) { seen[s] = 1; out.push(s); } });
    return out.slice(0, 5);
  }
  function nearPart(prompt, x, dp, unit, alts, sol, hints, text, nr) {
    var key = fx(x, dp);
    return { prompt: prompt, input: { type: 'number', nr: !!nr, after: unit || undefined }, check: near(x, dp, alts, nr), key: key,
      answer: t(key + ut(unit)), solution: sol, hints: hints || [], text: text, bad: badVals(x, dp, alts),
      good: unit && !nr ? [key + (unit === '°' ? '°' : ' ' + unit)] : [] };
  }
  /* several labelled boxes, each graded on its own: fs = [{ tex, name, x, dp, unit, alts }] */
  function fieldsPart(prompt, fs, sol, hints, text) {
    var checks = fs.map(function (f) { return f.check || near(f.x, f.dp, f.alts); });
    var key = fs.map(function (f) { return f.key != null ? f.key : fx(f.x, f.dp); }), n = fs.length;
    var check = function (resp) {
      resp = resp || [];
      var res = checks.map(function (c, i) { return c(resp[i] == null ? '' : String(resp[i])); });
      var nOk = res.filter(function (x) { return x.v === 'correct'; }).length;
      if (nOk === n) return ok();
      var empty = res.filter(function (x) { return x.code === 'empty'; }).length;
      if (empty === n) return form('empty', 'Fill in the boxes first.');
      if (empty) return form('incomplete', 'Fill in every box (' + (n - empty) + ' of ' + n + ' done).');
      for (var i = 0; i < n; i++) if (res[i].v === 'wrong') return wrong(res[i].code, '<b>' + fs[i].name + ':</b> ' + (res[i].hint || 'not right yet — check this one again.') + (nOk ? ' (' + nOk + ' of ' + n + ' boxes are right.)' : ''));
      for (var j = 0; j < n; j++) if (res[j].v === 'form') return form(res[j].code, '<b>' + fs[j].name + ':</b> ' + (res[j].hint || 'check the form of this answer.'));
      return wrong('value', null);
    };
    var bad = [];
    fs.forEach(function (f, i) { if (f.check) return; badVals(f.x, f.dp, f.alts).slice(0, 2).forEach(function (b) { var k = key.slice(); k[i] = b; bad.push(k); }); });
    return { prompt: prompt, input: { type: 'fields', fields: fs.map(function (f) { return { label: t(f.tex + '='), after: f.unit || undefined, name: f.name }; }) },
      check: check, key: key, answer: fs.map(function (f, i) { return t(f.tex + '=' + (f.keyTex || key[i]) + ut(f.unit)); }).join(', '),
      solution: sol, hints: hints || [], text: text, bad: bad.slice(0, 6) };
  }
  function mc(r, prompt, opts, sol, hints, text) { return K.P.mc(r, prompt, opts, sol, hints || [], text); }

  /* ---------------- one unknown: a side from a side and an angle ---------------- */
  function sideCalc(th, kRole, k, kTex, uRole, uTex, dp) {
    var fn = fnFor(kRole, uRole), f = T[fn](th), mult = numRole(fn) === uRole, v = mult ? k * f : k / f;
    var fTex = '\\' + fn + ' ' + dg(th), uH = t(uTex), kH = t(kTex);
    var setup = fTex + '=\\dfrac{' + (numRole(fn) === uRole ? uTex : kTex) + '}{' + (denRole(fn) === uRole ? uTex : kTex) + '}';
    var expr = uTex + '=' + (mult ? kTex + '\\' + fn + ' ' + dg(th) : '\\dfrac{' + kTex + '}{' + fTex + '}');
    var work = setup + '\\ \\Rightarrow\\ ' + expr + '=' + fl(v) + '\\ldots\\approx ' + fx(v, dp);
    var wr = 'From the ' + t(dg(th)) + ' angle, ' + kH + ' is the <b>' + ROLE[kRole] + '</b> and ' + uH + ' is the <b>' + ROLE[uRole] + '</b>. Which ratio uses exactly those two sides?';
    var alts = [{ v: mult ? k / f : k * f, code: 'ratio-inverted', hint: 'Right ratio — but check the rearranging. In ' + t(setup) + ', ' + uH + ' is in the ' +
      (mult ? '<b>numerator</b>, so multiply ' + kH + ' by ' + t(fTex) : '<b>denominator</b>: multiply both sides by ' + uH + ', then divide ' + kH + ' by ' + t(fTex)) + '.' +
      (uRole === 'hyp' ? ' (A hypotenuse is always longer than either leg.)' : kRole === 'hyp' ? ' (A leg is always shorter than the hypotenuse.)' : '') },
      { v: sideVal(90 - th, kRole, k, uRole), code: 'opp-adj-swap', hint: 'Name the sides from the ' + t(dg(th)) + ' angle itself: the <b>opposite</b> side is across from it, the <b>adjacent</b> side touches it. You have them the other way round (as if you stood at the other acute angle).' },
      { v: mult ? k * Math[fn](th) : k / Math[fn](th), code: 'radian', hint: RAD }];
    ['sin', 'cos', 'tan'].forEach(function (g) { if (g === fn) return; alts.push({ v: k * T[g](th), code: 'wrong-ratio', hint: wr }, { v: k / T[g](th), code: 'wrong-ratio', hint: wr }); });
    return { v: v, fn: fn, work: work, setup: setup, expr: expr, alts: alts };
  }
  /* ---------------- one unknown: an angle from two sides ---------------- */
  function angleCalc(aRole, a, aTex, bRole, b, bTex, arg, res, dp) {
    var fn = fnFor(aRole, bRole), aNum = aRole === numRole(fn), num = aNum ? a : b, den = aNum ? b : a, numT = aNum ? aTex : bTex, denT = aNum ? bTex : aTex;
    var ratio = num / den, v = T[INV[fn]](ratio);
    var work = '\\' + fn + ' ' + arg + '=\\dfrac{' + numT + '}{' + denT + '}=' + (Math.round(ratio * 100000) / 100000) + '\\ldots\\ \\Rightarrow\\ ' + res + '=\\' + fn + '^{-1}\\!\\left(\\dfrac{' + numT + '}{' + denT + '}\\right)=' + fl(v) + '^\\circ\\approx ' + fx(v, dp) + '^\\circ';
    var wr = 'From the angle you want, ' + t(aTex) + ' is the <b>' + ROLE[aRole] + '</b> and ' + t(bTex) + ' is the <b>' + ROLE[bRole] + '</b>. Which ratio uses exactly those two sides?';
    var alts = [{ v: 90 - v, code: 'other-angle', hint: 'That is the <b>other</b> acute angle. Name the sides from the angle you want: the opposite side is across from it, the adjacent side touches it.' },
      { v: v * Math.PI / 180, code: 'radian', hint: 'That is the angle in radians — switch your calculator to <b>degree</b> mode (DEG).' },
      { v: ratio, code: 'no-inverse', hint: 'That is the value of the ratio, not the angle. Undo the ratio with the inverse key: ' + t('\\' + fn + '^{-1}') + '.' }];
    ['sin', 'cos', 'tan'].forEach(function (g) { [a / b, b / a].forEach(function (q) { if (g === fn && Math.abs(q - ratio) < 1e-12) return; var w = T[INV[g]](q); if (isFinite(w)) alts.push({ v: w, code: 'wrong-ratio', hint: wr }); }); });
    return { v: v, fn: fn, work: work, alts: alts };
  }

  /* ---------------- figures ---------------- */
  var NAMES = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'J'], ['J', 'K', 'L'], ['K', 'L', 'M'], ['M', 'N', 'P'], ['P', 'Q', 'R'], ['R', 'S', 'T'], ['S', 'T', 'U'], ['V', 'W', 'X'], ['X', 'Y', 'Z'], ['D', 'E', 'G']];
  function pickTri(r) { var s = r.pick(NAMES), p = r.shuffle(s); return { tri: s.join(''), R: p[0], P: p[1], Q: p[2] }; }
  function orient(r) { return { at: r.chance(0.5), rot: r.int(0, 3), flip: r.chance(0.5) }; }
  /* right triangle, angle th at P, right angle at R. lab = { opp, adj, hyp } labels (relative to P) */
  function triFig(o, ori) {
    var sl = o.lab || {}, c = T.cos(o.th), s = T.sin(o.th);
    var spec = ori.at
      ? { w: c, h: s, names: [o.P || 'P', o.Q || 'Q', o.R || 'R'], sides: { a: sl.opp, b: sl.adj, c: sl.hyp }, angles: { A: o.angP, B: o.angQ } }
      : { w: s, h: c, names: [o.Q || 'Q', o.P || 'P', o.R || 'R'], sides: { a: sl.adj, b: sl.opp, c: sl.hyp }, angles: { A: o.angQ, B: o.angP } };
    spec.rot = ori.rot; spec.flip = ori.flip; spec.hideNames = !o.names; spec.width = o.width || 250; spec.height = o.height || 230;
    return HW.tri(spec);
  }
  function sketch(spec) { spec.width = spec.width || 270; spec.height = spec.height || 200; return HW.fig(spec); }

  /* ---------------- solving a whole triangle ---------------- */
  var ACUTE90 = 'The three angles add to ' + t('180^\\circ') + ', and the right angle already takes ' + t('90^\\circ') + ' — so the two acute angles add to ' + t('90^\\circ') + '.';
  /* given one acute angle th at P and one side (kRole relative to P) */
  function solveAS(o) {
    var nm = { opp: seg(o.Q, o.R), adj: seg(o.P, o.R), hyp: seg(o.P, o.Q) }, kS = o.kS || fx(o.k, o.dp);
    var val = { opp: sideVal(o.th, o.kRole, o.k, 'opp'), adj: sideVal(o.th, o.kRole, o.k, 'adj'), hyp: sideVal(o.th, o.kRole, o.k, 'hyp') };
    var us = ['opp', 'adj', 'hyp'].filter(function (x) { return x !== o.kRole; }), F = {}, lines = [];
    F.Q = { tex: '\\angle ' + o.Q, name: '∠' + o.Q, x: 90 - o.th, dp: 0, unit: '°', alts: [
      { v: 180 - o.th, code: 'angle-180', hint: ACUTE90 }, { v: o.th, code: 'same-angle', hint: t('\\angle ' + o.Q) + ' is the <b>other</b> acute angle, not the given one. ' + ACUTE90 }] };
    lines.push(t('\\angle ' + o.Q + '=90^\\circ-' + dg(o.th) + '=' + dg(90 - o.th)) + ' — no trigonometry needed.');
    us.forEach(function (u) {
      var other = us.filter(function (x) { return x !== u; })[0], ro = rd(val[other], o.dp), sc = sideCalc(o.th, o.kRole, o.k, kS, u, nm[u], o.dp);
      var pyth = u === 'hyp' ? Math.sqrt(o.k * o.k + ro * ro) : other === 'hyp' ? Math.sqrt(ro * ro - o.k * o.k) : Math.sqrt(o.k * o.k - ro * ro);
      var reH = 'Close — but that is built on the <b>rounded</b> ' + t(nm[other]) + '. Take ' + t(nm[u]) + ' straight from the given ' + t(kS) + ' and ' + t(dg(o.th)) + ', and round only the final answer.';
      F[u] = { tex: nm[u], name: nm[u], x: val[u], dp: o.dp, unit: o.unit, alts: [{ v: pyth, code: 'rounded-early', hint: reH }, { v: sideVal(o.th, other, ro, u), code: 'rounded-early', hint: reH }].concat(sc.alts) };
      lines.push(t(nm[u]) + ': from the ' + t(dg(o.th)) + ' angle, ' + t(kS) + ' is the ' + ROLE[o.kRole] + ' and ' + t(nm[u]) + ' is the ' + ROLE[u] + ' ⇒ <b>' + RULE[sc.fn] + '</b>:<br>' + t(sc.work + ut(o.unit)));
    });
    lines.push('Both sides come from the <b>given</b> ' + t(kS) + ' and ' + t(dg(o.th)) + ', never from a rounded answer.');
    lines.push('Check: ' + t(dg(o.th) + '+' + dg(90 - o.th) + '+90^\\circ=180^\\circ') + ', and the hypotenuse ' + t(nm.hyp + '=' + fx(val.hyp, o.dp)) + ' is longer than both legs ✓');
    return { fields: (o.order || ['Q'].concat(us)).map(function (k) { return F[k]; }), sol: lines.join('<br>'), val: val, nm: nm };
  }
  /* given two sides (roles relative to P) */
  function solveSS(o) {
    var nm = { opp: seg(o.Q, o.R), adj: seg(o.P, o.R), hyp: seg(o.P, o.Q) }, g = o.g, gS = {}, roles = Object.keys(g), val = {}, F = {}, lines = [];
    roles.forEach(function (x) { val[x] = g[x]; gS[x] = (o.gS && o.gS[x]) || fx(g[x], o.dp); });
    var u = ['opp', 'adj', 'hyp'].filter(function (x) { return roles.indexOf(x) < 0; })[0];
    var legs = ['opp', 'adj'].filter(function (x) { return roles.indexOf(x) >= 0; });
    if (u === 'hyp') val.hyp = Math.sqrt(val.opp * val.opp + val.adj * val.adj); else val[u] = Math.sqrt(val.hyp * val.hyp - val[legs[0]] * val[legs[0]]);
    var th = T.atan(val.opp / val.adj), a = roles[0], b = roles[1];
    // third side
    var sq = function (x) { return tr(x * x); }, pw;
    if (u === 'hyp') pw = nm.hyp + '=\\sqrt{' + gS.opp + '^{2}+' + gS.adj + '^{2}}=\\sqrt{' + tr(val.opp * val.opp + val.adj * val.adj) + '}=' + fl(val.hyp) + '\\ldots\\approx ' + fx(val.hyp, o.dp);
    else pw = nm[u] + '=\\sqrt{' + gS.hyp + '^{2}-' + gS[legs[0]] + '^{2}}=\\sqrt{' + sq(val.hyp) + '-' + sq(val[legs[0]]) + '}=' + fl(val[u]) + '\\ldots\\approx ' + fx(val[u], o.dp);
    var reS = 'Close — but that comes from a <b>rounded</b> angle. Both sides you need are given, so use the Pythagorean theorem on the given sides (or keep the angle at full precision).';
    var uAlts = [{ v: u === 'hyp' ? Math.sqrt(Math.abs(val.opp * val.opp - val.adj * val.adj)) : Math.sqrt(val.hyp * val.hyp + val[legs[0]] * val[legs[0]]), code: 'pyth-op',
      hint: u === 'hyp' ? 'The hypotenuse is the longest side: <b>add</b> the squares of the two legs.' : t(nm[u]) + ' is a <b>leg</b>, so subtract: ' + t('\\text{leg}^2=\\text{hyp}^2-\\text{other leg}^2') + '.' }];
    roles.forEach(function (x) { uAlts.push({ v: sideVal(rd(th, 0), x, val[x], u), code: 'rounded-early', hint: reS }); uAlts.push({ v: sideVal(90 - rd(90 - th, 0), x, val[x], u), code: 'rounded-early', hint: reS }); });
    F.u = { tex: nm[u], name: nm[u], x: val[u], dp: o.dp, unit: o.unit, alts: uAlts };
    // angle at P
    var ac = angleCalc(a, val[a], gS[a], b, val[b], gS[b], o.P, '\\angle ' + o.P, 0), ru = rd(val[u], o.dp);
    var reA = 'Close — but that used the <b>rounded</b> ' + t(nm[u]) + '. Find the angle from the two <b>given</b> sides.';
    var pAlts = [{ v: angleFrom(a, val[a], u, ru), code: 'rounded-early', hint: reA }, { v: angleFrom(b, val[b], u, ru), code: 'rounded-early', hint: reA }].concat(ac.alts);
    F.P = { tex: '\\angle ' + o.P, name: '∠' + o.P, x: th, dp: 0, unit: '°', alts: pAlts };
    var qc = angleCalc(swapRole(a), val[a], gS[a], swapRole(b), val[b], gS[b], o.Q, '\\angle ' + o.Q, 0);
    F.Q = { tex: '\\angle ' + o.Q, name: '∠' + o.Q, x: 90 - th, dp: 0, unit: '°', alts: [{ v: 180 - th, code: 'angle-180', hint: ACUTE90 }].concat(qc.alts) };
    lines.push(t(nm[u]) + ': two sides are given, so use the <b>Pythagorean theorem</b> (only given data, nothing to round):<br>' + t(pw));
    lines.push(t('\\angle ' + o.P) + ': ' + t(gS[a]) + ' is ' + ROLE[a] + ' and ' + t(gS[b]) + ' is ' + ROLE[b] + ' ⇒ <b>' + RULE[ac.fn] + '</b>:<br>' + t(ac.work));
    lines.push(t('\\angle ' + o.Q + '=90^\\circ-' + fl(th) + '^\\circ=' + fl(90 - th) + '^\\circ\\approx ' + dg(fx(90 - th, 0))) + ' (subtract the <b>unrounded</b> angle).');
    lines.push('Check: ' + t(dg(fx(th, 0)) + '+' + dg(fx(90 - th, 0)) + '+90^\\circ=180^\\circ') + ', and the larger acute angle faces the longer leg ✓');
    return { fields: (o.order || ['u', 'P', 'Q']).map(function (k) { return F[k]; }), sol: lines.join('<br>'), val: val, th: th, nm: nm, u: u };
  }
  var SOLVE_HINTS = ['Find the missing angle first: the two acute angles add to ' + t('90^\\circ') + '.', 'Label the sides from a known angle (opposite, adjacent, hypotenuse) and use the ratio — or the Pythagorean theorem — that uses the <b>given</b> numbers. Round only at the end.'];
  var SOLVE_HINTS_SS = ['Two sides are given: the third side comes from the Pythagorean theorem.', 'For an angle, label the given sides from that angle and use the inverse ratio. The other acute angle is ' + t('90^\\circ') + ' minus it.'];

  /* ---------------- question makers ---------------- */
  function oneSidePart(r, o) {
    var kS = fx(o.k, 1), lab = {}; lab[o.kRole] = kS; lab[o.uRole] = o.v;
    var fig = triFig({ th: o.th, lab: lab, angP: o.th + '°' }, orient(r));
    var sc = sideCalc(o.th, o.kRole, o.k, kS, o.uRole, o.v, 1);
    return nearPart(fig + 'Calculate ' + t(o.v) + ', to the nearest tenth.', sc.v, 1, '', sc.alts,
      'From the ' + t(dg(o.th)) + ' angle: ' + t(kS) + ' is the <b>' + ROLE[o.kRole] + '</b> and ' + t(o.v) + ' is the <b>' + ROLE[o.uRole] + '</b> ⇒ <b>' + RULE[sc.fn] + '</b>.<br>' + t(sc.work),
      ['Label the sides from the ' + t(dg(o.th)) + ' angle: opposite (across from it), adjacent (touching it), hypotenuse (across from the right angle).', 'Pick the ratio that uses ' + t(kS) + ' and ' + t(o.v) + ', write the equation, then solve it for ' + t(o.v) + '.'],
      'side ' + o.v + ' (' + RULE[sc.fn] + '), ' + o.th + '°, ' + kS);
  }
  function oneAnglePart(r, o) {
    var aS = fx(o.a, 1), bS = fx(o.b, 1), lab = {}, th = angleFrom(o.aRole, o.a, o.bRole, o.b); lab[o.aRole] = aS; lab[o.bRole] = bS;
    var fig = triFig({ th: th, lab: lab, angP: o.v + '°' }, orient(r));
    var ac = angleCalc(o.aRole, o.a, aS, o.bRole, o.b, bS, o.v + '^\\circ', o.v, 0);
    return nearPart(fig + 'Calculate ' + t(o.v + '^\\circ') + ', to the nearest degree.', th, 0, '°', ac.alts,
      'From the angle ' + t(o.v + '^\\circ') + ': ' + t(aS) + ' is the <b>' + ROLE[o.aRole] + '</b> and ' + t(bS) + ' is the <b>' + ROLE[o.bRole] + '</b> ⇒ <b>' + RULE[ac.fn] + '</b>.<br>' + t(ac.work),
      ['Label the two given sides from the angle ' + t(o.v + '^\\circ') + ' (opposite, adjacent or hypotenuse).', 'Write the ratio, then use the inverse key (' + t('\\sin^{-1}') + ', ' + t('\\cos^{-1}') + ' or ' + t('\\tan^{-1}') + ') in degree mode.'],
      'angle ' + o.v + ' (' + RULE[ac.fn] + '), sides ' + aS + ', ' + bS);
  }
  function anglePair(r, lo, hi, aRole, bRole, aLo, aHi, bk, bkv) {
    if (r.chance(0.2)) return bkv;
    return gen(function () {
      var th = r.int(lo, hi), a = dec(r, aLo, aHi), b = rd(sideVal(th + r.int(-40, 40) / 100, aRole, a, bRole), 1);
      return { a: a, b: b };
    }, function (o) { var v = angleFrom(aRole, o.a, bRole, o.b); return isFinite(v) && v > lo - 1 && v < hi + 1 && safe(v, 0) && o.b > 0; });
  }
  function sideGiven(r, lo, hi, kLo, kHi, kRole, uRole, bkv) {
    if (r.chance(0.2)) return bkv;
    return gen(function () { return { th: r.int(lo, hi), k: dec(r, kLo, kHi) }; }, function (o) { return safe(sideVal(o.th, kRole, o.k, uRole), 1); });
  }

  /* Q2 pipe figure */
  function pipeFig(th, L, flip) {
    var c = T.cos(th) * L, s = T.sin(th) * L, sx = flip ? -1 : 1;
    return HW.fig({ pts: { A: [0, 0], E: [sx * c, 0], B: [sx * c, -s] }, segs: [['A', 'E', { dash: 1 }], ['E', 'B', 'h', { dash: 1 }], ['A', 'B', L + ' m']], right: [['E', 'A', 'B']],
      angles: [['A', 'E', 'B', th + '°', { r: 42 }]], names: false, extra: [{ type: 'text', at: [sx * c * 0.62, s * 0.2], text: 'horizontal' }], width: 330, height: 190, aria: 'sloping pipe' });
  }
  /* Q5 tower figure */
  function towerFig(H, th, flip, labTower, labGround, what) {
    var D = H / T.tan(th), sx = flip ? -1 : 1;
    return HW.fig({ pts: { G: [0, 0], Tp: [0, H], C: [sx * D, 0], Hz: [sx * D * 0.42, H] },
      segs: [['G', 'Tp', labTower], ['G', 'C', labGround || ''], ['Tp', 'C'], ['Tp', 'Hz', { dash: 1 }]], right: [['G', 'Tp', 'C']], angles: [['Tp', 'Hz', 'C', th + '°', { r: 34 }]],
      names: false, extra: [{ type: 'eye', at: [sx * D, 0] }, { type: 'text', at: [sx * D, -H * 0.16], text: what || '' }, { type: 'text', at: [sx * D * 0.26, H * 1.1], text: 'horizontal' }], width: 300, height: 200, aria: 'angle of depression' }).replace(/stroke-width="2.2"/, 'stroke-width="3.2"');
  }

  /* ---------------- the lesson ---------------- */
  HW.defineLesson({
    id: 'u9l5', unit: 9, num: '5', title: 'Solving Right Triangles Completely', outcome: 'M4',
    blurb: 'Choose the right tool — the Pythagorean theorem or SOH CAH TOA — and solve a right triangle completely: every side and every angle, each taken from the original data and rounded only at the end.',
    questions: [
      /* ---------- Q1: one unknown ---------- */
      { num: '1', section: 'Assignment — Solving Right Triangles', stem: 'In each case, calculate the indicated measure. Give angles to the nearest degree and sides to the nearest tenth.', parts: [
        { id: '1a', level: 'BEG', make: function (r) { var o = anglePair(r, 50, 68, 'opp', 'adj', 4, 9.9, true, { a: 13.6, b: 7.5 }); return oneAnglePart(r, { aRole: 'opp', a: o.a, bRole: 'adj', b: o.b, v: 'x' }); } },
        { id: '1b', level: 'EMG', make: function (r) { var o = sideGiven(r, 25, 50, 10, 30, 'adj', 'hyp', { th: 35, k: 18.4 }); return oneSidePart(r, { th: o.th, kRole: 'adj', k: o.k, uRole: 'hyp', v: 'r' }); } },
        { id: '1c', level: 'BEG', make: function (r) { var o = anglePair(r, 28, 60, 'opp', 'hyp', 3, 8, true, { a: 4.6, b: 6.3 }); return oneAnglePart(r, { aRole: 'opp', a: o.a, bRole: 'hyp', b: o.b, v: 't' }); } },
        { id: '1d', level: 'BEG', make: function (r) { var o = sideGiven(r, 40, 65, 20, 60, 'hyp', 'adj', { th: 51, k: 42.8 }); return oneSidePart(r, { th: o.th, kRole: 'hyp', k: o.k, uRole: 'adj', v: 'b' }); } },
        { id: '1e', level: 'EMG', make: function (r) { var o = sideGiven(r, 40, 65, 100, 300, 'opp', 'adj', { th: 55, k: 241.5 }); return oneSidePart(r, { th: o.th, kRole: 'opp', k: o.k, uRole: 'adj', v: 'a' }); } },
        { id: '1f', level: 'BEG', make: function (r) { var o = anglePair(r, 22, 40, 'opp', 'adj', 4, 9.9, true, { a: 3.1, b: 5.4 }); return oneAnglePart(r, { aRole: 'opp', a: o.a, bRole: 'adj', b: o.b, v: 'x' }); } }] },
      /* ---------- Q2: pipe ---------- */
      { num: '2', stem: 'A drainage pipe slopes downward.', parts: [
        { id: '2', level: 'EMG', make: function (r) {
          var o = r.chance(0.2) ? { th: 14, L: 85 } : gen(function () { return { th: r.int(9, 22), L: 5 * r.int(12, 26) }; }, function (o) { return safe(o.L * T.sin(o.th), 0); });
          var sc = sideCalc(o.th, 'hyp', o.L, String(o.L), 'opp', 'h', 0);
          return nearPart(pipeFig(o.th, o.L, r.chance(0.5)) + 'The pipe slopes downward at ' + t(dg(o.th)) + ' to the horizontal and is ' + t(o.L + '\\text{ m}') + ' long. Calculate, to the nearest metre, how much lower its bottom end is than its top end.',
            sc.v, 0, 'm', sc.alts, 'The drop ' + t('h') + ' is <b>opposite</b> the ' + t(dg(o.th)) + ' angle and the pipe (' + t(o.L + '\\text{ m}') + ') is the <b>hypotenuse</b> ⇒ <b>SOH</b>.<br>' + t(sc.work + '\\text{ m}'),
            ['The pipe itself is the hypotenuse. Which side is the drop, measured from the ' + t(dg(o.th)) + ' angle?', 'Opposite and hypotenuse ⇒ sine.'], 'pipe drop ' + o.L + ' m at ' + o.th + '°');
        } }] },
      /* ---------- Q3: drone ---------- */
      { num: '3', stem: function (sh) {
          var a = sh.a, b = sh.b;
          return 'A drone flies ' + t(a + '\\text{ km}') + ' due east from base camp to a checkpoint, then ' + t(b + '\\text{ km}') + ' due north to a second checkpoint, then flies directly back to base camp.' +
            HW.fig({ pts: { Base: [0, 0], C1: [a, 0], C2: [a, b] }, segs: [['Base', 'C1', a + ' km'], ['C1', 'C2', b + ' km'], ['C2', 'Base']], right: [['C1', 'Base', 'C2']], angles: [['C2', 'C1', 'Base', 'x°']], names: { Base: 'Base' }, width: 280, height: 220, aria: 'drone path' });
        },
        shared: function (r) { return r.chance(0.2) ? { a: 8, b: 5.5 } : gen(function () { return { a: half(r, 6, 12), b: half(r, 3, 8) }; }, function (o) { var x = T.atan(o.a / o.b), tot = o.a + o.b + Math.hypot(o.a, o.b); return Math.abs(o.a - o.b) >= 1 && safe(x, 0) && safe(tot, 1); }); },
        parts: [
          { id: '3a', level: 'EMG', make: function (r, sh) {
            var ac = angleCalc('opp', sh.a, String(sh.a), 'adj', sh.b, String(sh.b), 'x^\\circ', 'x', 0);
            return nearPart('Calculate the measure of angle ' + t('x^\\circ') + ', at the second checkpoint, to the nearest degree.', ac.v, 0, '°', ac.alts,
              'From ' + t('x^\\circ') + ' at the second checkpoint: the ' + t(sh.a + '\\text{ km}') + ' east leg is <b>opposite</b> and the ' + t(sh.b + '\\text{ km}') + ' north leg is <b>adjacent</b> ⇒ <b>TOA</b>.<br>' + t(ac.work),
              ['Stand at the second checkpoint. Which leg is across from ' + t('x^\\circ') + ' and which one touches it?', 'Opposite and adjacent ⇒ tangent; then use ' + t('\\tan^{-1}') + '.'], 'drone angle ' + sh.a + ', ' + sh.b);
          } },
          { id: '3b', level: 'PRG', make: function (r, sh) {
            var a = sh.a, b = sh.b, hyp = Math.hypot(a, b), x = T.atan(a / b), tot = a + b + hyp, rx = rd(x, 0);
            var re = 'Close — but that return leg came from the <b>rounded</b> angle ' + t(dg(rx)) + '. Both legs are given, so use the Pythagorean theorem and round only the total.';
            return nearPart('Calculate, to the nearest tenth of a km, the <b>total</b> distance the drone travels.', tot, 1, 'km', [
              { v: hyp, code: 'hyp-only', hint: 'That is only the flight back to base. The total includes the ' + t(a + '\\text{ km}') + ' and ' + t(b + '\\text{ km}') + ' legs as well.' },
              { v: a + b + a / T.sin(rx), code: 'rounded-early', hint: re }, { v: a + b + b / T.cos(rx), code: 'rounded-early', hint: re },
              { v: a + b + Math.sqrt(Math.abs(a * a - b * b)), code: 'pyth-op', hint: 'The return leg is the hypotenuse: <b>add</b> the squares of the legs.' },
              { v: a + b, code: 'incomplete-trip', hint: 'Don’t forget the flight back to base camp.' }],
              'The return leg is the hypotenuse, and both legs are given ⇒ <b>Pythagorean theorem</b> (not the rounded angle):<br>' + t('\\sqrt{' + a + '^{2}+' + b + '^{2}}=\\sqrt{' + tr(a * a + b * b) + '}=' + fl(hyp) + '\\ldots\\text{ km}') + '<br>Total ' + t('=' + a + '+' + b + '+' + fl(hyp) + '=' + fl(tot) + '\\approx ' + fx(tot, 1) + '\\text{ km}'),
              ['The trip has three legs: east, north, and straight back.', 'The straight-back leg is the hypotenuse of a right triangle whose legs are both given.'], 'drone total ' + a + ', ' + b);
          } }] },
      /* ---------- Q4: rectangle diagonal ---------- */
      { num: '4', stem: 'A rectangle and its diagonal.', parts: [
        { id: '4', level: 'PRG', make: function (r) {
          var o = r.chance(0.2) ? { d: 42, th: 51 } : gen(function () { return { d: r.int(28, 60), th: r.int(47, 64) }; }, function (o) { return safe(o.d * T.cos(o.th), 1) && safe(o.d * T.sin(o.th), 1); });
          var d = o.d, th = o.th, sh = d * T.cos(th), lo = d * T.sin(th), vert = r.chance(0.6);
          var pts = vert ? { A: [0, 0], B: [0, sh], C: [lo, sh], D: [lo, 0] } : { A: [0, 0], B: [sh, 0], C: [sh, lo], D: [0, lo] };
          var fig = HW.fig({ pts: pts, segs: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'C', d + ' cm']], right: [['A', 'B', 'D'], ['B', 'A', 'C'], ['C', 'B', 'D'], ['D', 'C', 'A']], angles: [['A', 'B', 'C', th + '°', { r: 26 }]], names: false, width: 260, height: 230, aria: 'rectangle with diagonal' });
          var scS = sideCalc(th, 'hyp', d, String(d), 'adj', '\\text{shorter}', 1), scL = sideCalc(th, 'hyp', d, String(d), 'opp', '\\text{longer}', 1);
          var re = 'Close — but that came from the <b>rounded</b> shorter side. Take the longer side straight from ' + t(d) + ' and ' + t(dg(th)) + '.';
          var fs = [{ tex: '\\text{shorter side}', name: 'Shorter side', x: sh, dp: 1, unit: 'cm', alts: [{ v: lo, code: 'swap-legs', hint: 'That is the <b>longer</b> side. The ' + t(dg(th)) + ' angle sits between the diagonal and the shorter side, so the shorter side is <b>adjacent</b> to it.' }].concat(scS.alts) },
            { tex: '\\text{longer side}', name: 'Longer side', x: lo, dp: 1, unit: 'cm', alts: [{ v: sh, code: 'swap-legs', hint: 'That is the <b>shorter</b> side. The longer side is <b>opposite</b> the ' + t(dg(th)) + ' angle.' }, { v: Math.sqrt(d * d - rd(sh, 1) * rd(sh, 1)), code: 'rounded-early', hint: re }].concat(scL.alts) }];
          return fieldsPart(fig + 'The diagonal of a rectangle is ' + t(d + '\\text{ cm}') + ' long and makes an angle of ' + t(dg(th)) + ' with the <b>shorter</b> side. Determine the length of the shorter side and the longer side, each to the nearest tenth of a cm.', fs,
            'The ' + t(dg(th)) + ' angle is between the diagonal and the shorter side: the shorter side is <b>adjacent</b>, the longer side is <b>opposite</b>, the diagonal ' + t(d) + ' is the <b>hypotenuse</b>. Both come from the given ' + t(d) + ' and ' + t(dg(th)) + ':<br>' +
            t('\\text{shorter}=' + d + '\\cos ' + dg(th) + '=' + fl(sh) + '\\ldots\\approx ' + fx(sh, 1) + '\\text{ cm}') + '<br>' + t('\\text{longer}=' + d + '\\sin ' + dg(th) + '=' + fl(lo) + '\\ldots\\approx ' + fx(lo, 1) + '\\text{ cm}') + '<br>Check: shorter ' + t('<') + ' longer ✓, and ' + t('\\sqrt{' + fl(sh) + '^2+' + fl(lo) + '^2}=' + d) + ' ✓',
            ['The diagonal cuts the rectangle into two right triangles; the diagonal is the hypotenuse.', 'From the ' + t(dg(th)) + ' angle, the shorter side touches it (adjacent) and the longer side is across from it (opposite).'], 'rectangle diagonal ' + d + ' at ' + th + '°');
        } }] },
      /* ---------- Q5: angle of depression ---------- */
      { num: '5', stem: 'From the top of an observation tower, a parked car is sighted below.', parts: [
        { id: '5', level: 'EMG', make: function (r) {
          var o = r.chance(0.2) ? { H: 52, th: 27 } : gen(function () { return { H: r.int(30, 80), th: r.int(18, 40) }; }, function (o) { return safe(o.H / T.tan(o.th), 0); });
          var sc = sideCalc(o.th, 'opp', o.H, String(o.H), 'adj', 'd', 0);
          var alts = [{ v: o.H * T.tan(o.th), code: 'depression-angle', hint: 'The angle of depression is measured <b>down from the horizontal</b> at the top. It equals the angle of elevation at the car (alternate angles), so put the ' + t(dg(o.th)) + ' at the car: the tower is <b>opposite</b> it and ' + t('d') + ' is <b>adjacent</b>.' }].concat(sc.alts);
          return nearPart(towerFig(o.H, o.th, r.chance(0.5), o.H + ' m', 'd', 'car') + 'The tower is ' + t(o.H + '\\text{ m}') + ' tall and the angle of depression to the car is ' + t(dg(o.th)) + '. Calculate, to the nearest metre, the distance ' + t('d') + ' from the base of the tower to the car.',
            sc.v, 0, 'm', alts, 'The angle of depression equals the angle of elevation at the car (alternate angles between parallel horizontals). From that ' + t(dg(o.th)) + ' angle, the tower is <b>opposite</b> and ' + t('d') + ' is <b>adjacent</b> ⇒ <b>TOA</b>.<br>' + t(sc.work + '\\text{ m}'),
            ['Move the ' + t(dg(o.th)) + ' angle down to the car: the angle of depression from the top equals the angle of elevation from the car.', 'Tower and ground distance are opposite and adjacent ⇒ tangent. ' + t('d') + ' ends up in the denominator.'], 'depression ' + o.th + '°, tower ' + o.H);
        } }] },
      /* ---------- Q6: pendulum ---------- */
      { num: '6', stem: 'A pendulum swings from one extreme position to the other.', parts: [
        { id: '6', level: 'PRG', make: function (r) {
          var o = r.chance(0.2) ? { L: 90, th: 34 } : gen(function () { return { L: 5 * r.int(8, 24), th: 2 * r.int(14, 25) }; }, function (o) { return safe(2 * o.L * T.sin(o.th / 2), 1); });
          var L = o.L, th = o.th, h = th / 2, hx = L * T.sin(h), hy = L * T.cos(h), v = 2 * hx;
          var fig = HW.fig({ pts: { O: [0, hy], A: [-hx, 0], B: [hx, 0], M: [0, 0] }, segs: [['O', 'A', L + ' cm'], ['O', 'B'], ['O', 'M', { dash: 1 }]], angles: [['O', 'A', 'B', '', { r: 40 }]], names: false,
            extra: [{ type: 'text', at: [0, hy * 1.08], text: th + '°' }, { type: 'eye', at: [-hx, 0] }, { type: 'eye', at: [hx, 0] }, { type: 'dash', from: [-hx, 0], to: [hx, 0] }], width: 220, height: 230, aria: 'pendulum' });
          return nearPart(fig + 'A pendulum ' + t(L + '\\text{ cm}') + ' long swings through an angle of ' + t(dg(th)) + '. Calculate, to the nearest tenth of a cm, the distance between the two extreme positions of the pendulum bob.', v, 1, 'cm', [
            { v: L * T.sin(h), code: 'half-only', hint: 'That is only <b>half</b> the distance — from the dashed centre line to one bob. Double it.' },
            { v: 2 * L * T.sin(th), code: 'no-half', hint: 'The dashed line cuts the ' + t(dg(th)) + ' angle in half. Each right triangle has the angle ' + t(dg(h)) + ' at the pivot.' },
            { v: L * T.sin(th), code: 'no-half', hint: 'SOH CAH TOA need a right triangle: use the half-angle ' + t(dg(h)) + ' in one of the two right triangles, then double the result.' },
            { v: 2 * L * T.tan(h), code: 'wrong-ratio', hint: 'In each right triangle the ' + t(L + '\\text{ cm}') + ' arm is the <b>hypotenuse</b> and the half-distance is <b>opposite</b> the half-angle. Which ratio is that?' },
            { v: 2 * L * T.cos(h), code: 'wrong-ratio', hint: 'In each right triangle the half-distance is <b>opposite</b> the half-angle ' + t(dg(h)) + ' and the arm is the hypotenuse ⇒ sine, not cosine.' },
            { v: 2 * L * Math.sin(h), code: 'radian', hint: RAD }],
            'The dashed line splits the isosceles triangle into two congruent right triangles, each with hypotenuse ' + t(L) + ' and half-angle ' + t(dg(th) + '\\div 2=' + dg(h)) + '. Half the distance is <b>opposite</b> that angle ⇒ <b>SOH</b>:<br>' +
            t('\\text{half}=' + L + '\\sin ' + dg(h) + '=' + fl(hx) + '\\ldots') + '<br>' + t('\\text{distance}=2(' + fl(hx) + ')=' + fl(v) + '\\ldots\\approx ' + fx(v, 1) + '\\text{ cm}'),
            ['The dashed line makes two right triangles. What is the angle at the pivot in each one?', 'Find half the distance with SOH, then double it.'], 'pendulum ' + L + ' cm, ' + th + '°');
        } }] },
      /* ---------- Q7–Q9: solve the triangle ---------- */
      { num: '7', stem: 'Solve the triangle: find every unknown side and angle.', parts: [
        { id: '7', level: 'PRG', make: function (r) {
          var n = r.chance(0.2) ? { tri: 'ABC', R: 'C', P: 'B', Q: 'A', th: 41, k: 19.6 } : (function () { var nn = pickTri(r); var g = gen(function () { return { th: r.int(28, 62), k: dec(r, 10, 30) }; }, function (o) { return safe(o.k * T.tan(o.th), 1) && safe(o.k / T.cos(o.th), 1) && o.th !== 45; }); nn.th = g.th; nn.k = g.k; return nn; })();
          var s = solveAS({ P: n.P, Q: n.Q, R: n.R, th: n.th, kRole: 'adj', k: n.k, dp: 1, unit: '', order: ['Q', 'opp', 'hyp'] });
          var fig = triFig({ P: n.P, Q: n.Q, R: n.R, th: n.th, names: true, lab: { adj: fx(n.k, 1) }, angP: n.th + '°' }, orient(r));
          return fieldsPart(fig + 'Solve ' + t('\\triangle ' + n.tri) + ', giving angles to the nearest degree and sides to the nearest tenth.', s.fields, s.sol, SOLVE_HINTS, 'solve ' + n.tri + ': angle ' + n.th + ' + adjacent ' + n.k);
        } }] },
      { num: '8', stem: 'Solve the triangle: find every unknown side and angle.', parts: [
        { id: '8', level: 'PRG', make: function (r) {
          var n = r.chance(0.2) ? { tri: 'XYZ', R: 'Y', P: 'X', Q: 'Z', o: 22.3, a: 14.5 } : (function () { var nn = pickTri(r); var g = gen(function () { return { o: dec(r, 8, 30), a: dec(r, 8, 30) }; }, function (g) { var th = T.atan(g.o / g.a); return Math.abs(th - 45) > 6 && safe(th, 0) && safe(Math.hypot(g.o, g.a), 1); }); nn.o = g.o; nn.a = g.a; return nn; })();
          var s = solveSS({ P: n.P, Q: n.Q, R: n.R, g: { opp: n.o, adj: n.a }, dp: 1, unit: '', order: ['P', 'Q', 'u'] });
          var fig = triFig({ P: n.P, Q: n.Q, R: n.R, th: s.th, names: true, lab: { opp: fx(n.o, 1), adj: fx(n.a, 1) } }, orient(r));
          return fieldsPart(fig + 'Solve ' + t('\\triangle ' + n.tri) + ', giving angles to the nearest degree and sides to the nearest tenth.', s.fields, s.sol, SOLVE_HINTS_SS, 'solve ' + n.tri + ': legs ' + n.o + ', ' + n.a);
        } }] },
      { num: '9', stem: 'Solve the triangle: find every unknown side and angle.', parts: [
        { id: '9', level: 'PRG', make: function (r) {
          var n = r.chance(0.2) ? { tri: 'JKL', R: 'K', P: 'J', Q: 'L', th: 43, k: 205 } : (function () { var nn = pickTri(r); var g = gen(function () { return { th: r.int(28, 62), k: r.int(120, 320) }; }, function (o) { return safe(o.k * T.cos(o.th), 0) && safe(o.k * T.sin(o.th), 0) && o.th !== 45; }); nn.th = g.th; nn.k = g.k; return nn; })();
          var s = solveAS({ P: n.P, Q: n.Q, R: n.R, th: n.th, kRole: 'hyp', k: n.k, kS: String(n.k), dp: 0, unit: 'mm', order: ['Q', 'adj', 'opp'] });
          var fig = triFig({ P: n.P, Q: n.Q, R: n.R, th: n.th, names: true, lab: { hyp: n.k + ' mm' }, angP: n.th + '°' }, orient(r));
          var dsc = 'Solve ' + t('\\triangle ' + n.tri) + ', in which ' + t('\\angle ' + n.P + n.R + n.Q + '=90^\\circ') + ', ' + t('\\angle ' + n.R + n.P + n.Q + '=' + dg(n.th)) + ' and ' + t(seg(n.P, n.Q) + '=' + n.k + '\\text{ mm}') + '. Give all answers to the nearest whole number.';
          return fieldsPart(fig + dsc, s.fields, s.sol, SOLVE_HINTS, 'solve ' + n.tri + ': angle ' + n.th + ' + hypotenuse ' + n.k);
        } }] },
      /* ---------- Q10: why not solvable ---------- */
      { num: '10', stem: 'A triangle with three angles given.', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var bkv = r.chance(0.2), s = bkv ? ['M', 'N', 'O'] : r.pick(NAMES), a = bkv ? 52 : gen(function () { return r.int(25, 65); }, function (x) { return x !== 45; }), b = 90 - a;
          var X = s[0], Y = s[1], Z = s[2];
          var fig = triFig({ P: X, Q: Z, R: Y, th: a, names: true, angP: a + '°', angQ: b + '°' }, orient(r));
          return mc(r, fig + 'Why is it <b>not</b> possible to solve ' + t('\\triangle ' + X + Y + Z) + ', in which ' + t('\\angle ' + X + Y + Z + '=90^\\circ') + ', ' + t('\\angle ' + Y + X + Z + '=' + dg(a)) + ' and ' + t('\\angle ' + X + Z + Y + '=' + dg(b)) + '?', [
            { html: 'No side length is given. The angles fix the <b>shape</b> but not the <b>size</b>: infinitely many similar triangles have these angles.', right: true },
            { html: 'The angles don’t add to ' + t('180^\\circ') + ', so the triangle can’t exist.', why: 'Add them: ' + t('90^\\circ+' + dg(a) + '+' + dg(b) + '=180^\\circ') + '. The angles are fine — something else is missing.' },
            { html: 'It can be solved: ' + t('\\tan ' + dg(a)) + ' gives the two legs.', why: t('\\tan ' + dg(a)) + ' gives only the <b>ratio</b> of two legs, not their lengths. Without one length, the size is unknown.' },
            { html: 'SOH CAH TOA only work when one acute angle is ' + t('45^\\circ') + '.', why: 'SOH CAH TOA work for any acute angle. The problem is that no length is given at all.' }],
            'Only the three angles are given. Besides the right angle, solving needs two <b>independent</b> facts, and ' + t(dg(b)) + ' is forced by ' + t(dg(a)) + ' (they add to ' + t('90^\\circ') + '). Every right triangle with these angles is similar to every other, so with no side to fix the scale, the sides cannot be found.',
            ['How many lengths are given?', 'Could a tiny triangle and a huge triangle both have these three angles?'], 'why not solvable: angles only');
        } }] },
      /* ---------- Q11: MC zipline ---------- */
      { num: '11', stem: '<i>(Multiple choice)</i> A straight zipline cable slopes down below the horizontal.', parts: [
        { id: '11', level: 'BEG', make: function (r) {
          var o = r.chance(0.2) ? { L: 120, th: 9 } : gen(function () { return { L: 10 * r.int(8, 20), th: r.int(6, 15) }; }, function (o) {
            var v = [o.L * T.sin(o.th), o.L * T.tan(o.th), o.L * T.cos(o.th), o.L / T.cos(o.th)].map(function (x) { return fx(x, 1); });
            return v.filter(function (x, i) { return v.indexOf(x) === i; }).length === 4 && safe(o.L * T.sin(o.th), 1);
          });
          var L = o.L, th = o.th, v = L * T.sin(th);
          return mc(r, 'The cable is ' + t(L + '\\text{ m}') + ' long and slopes down at an angle of ' + t(dg(th)) + ' below the horizontal. To the nearest tenth of a metre, the vertical drop from the top of the cable to the bottom is', [
            { html: t(fx(v, 1) + '\\text{ m}'), right: true },
            { html: t(fx(L * T.tan(th), 1) + '\\text{ m}'), why: 'That uses tangent, as if the ' + t(L + '\\text{ m}') + ' cable were the horizontal run. The cable is the <b>hypotenuse</b>.' },
            { html: t(fx(L * T.cos(th), 1) + '\\text{ m}'), why: 'That is the horizontal run (adjacent side). The drop is <b>opposite</b> the ' + t(dg(th)) + ' angle.' },
            { html: t(fx(L / T.cos(th), 1) + '\\text{ m}'), why: 'That is longer than the cable itself — the drop must be shorter than the hypotenuse.' }],
            'The cable (' + t(L + '\\text{ m}') + ') is the <b>hypotenuse</b> and the drop is <b>opposite</b> the ' + t(dg(th)) + ' angle ⇒ <b>SOH</b>:<br>' + t('\\text{drop}=' + L + '\\sin ' + dg(th) + '=' + fl(v) + '\\ldots\\approx ' + fx(v, 1) + '\\text{ m}'),
            ['Sketch it: the cable is the slanted side. Is the drop opposite or adjacent to the angle?'], 'MC zipline ' + L + ' m at ' + th + '°');
        } }] },
      /* ---------- Q12–Q14: numerical response ---------- */
      { num: '12', stem: '<i>(Numerical response)</i> An airplane begins a straight descent toward the start of a runway.', parts: [
        { id: '12', level: 'EMG', make: function (r) {
          var o = r.chance(0.2) ? { h: 1.8, th: 3 } : gen(function () { return { h: dec(r, 1.2, 2.4), th: r.int(3, 6) }; }, function (o) { return safe(o.h / T.tan(o.th), 1); });
          var sc = sideCalc(o.th, 'opp', o.h, fx(o.h, 1), 'adj', 'd', 1);
          var alts = [{ v: o.h * T.tan(o.th), code: 'depression-angle', hint: 'The angle of depression from the plane equals the angle of elevation from the runway. From there, the altitude is <b>opposite</b> and the horizontal distance is <b>adjacent</b>.' }].concat(sc.alts);
          return nearPart('The plane is flying at an altitude of ' + t(fx(o.h, 1) + '\\text{ km}') + '. The angle of depression from the plane to the start of the runway is ' + t(dg(o.th)) + '. To the nearest tenth of a kilometre, the horizontal distance from the plane to the start of the runway is ____ km.',
            sc.v, 1, 'km', alts, 'The angle of depression equals the angle of elevation of the plane from the runway. From that ' + t(dg(o.th)) + ' angle the altitude is <b>opposite</b> and the horizontal distance ' + t('d') + ' is <b>adjacent</b> ⇒ <b>TOA</b>, with ' + t('d') + ' in the denominator:<br>' + t(sc.work + '\\text{ km}'),
            ['Sketch it: altitude straight down, horizontal distance along the ground, line of sight from the plane to the runway.', 'Opposite and adjacent ⇒ tangent. A small angle gives a long distance.'], 'NR plane altitude ' + o.h + ', ' + o.th + '°', true);
        } }] },
      { num: '13', stem: '<i>(Numerical response)</i> A children’s slide.', parts: [
        { id: '13', level: 'EMG', make: function (r) {
          var o = r.chance(0.2) ? { L: 3.4, h: 2.1 } : gen(function () { return { L: dec(r, 2.5, 4.5), h: dec(r, 1.2, 3.0) }; }, function (o) { var a = T.asin(o.h / o.L); return o.h < o.L && a > 24 && a < 62 && safe(a, 1); });
          var ac = angleCalc('opp', o.h, fx(o.h, 1), 'hyp', o.L, fx(o.L, 1), '\\theta', '\\theta', 1);
          return nearPart('A children’s slide is ' + t(fx(o.L, 1) + '\\text{ m}') + ' long and reaches a height of ' + t(fx(o.h, 1) + '\\text{ m}') + '. To the nearest tenth of a degree, the angle the slide makes with the ground is ____°.',
            ac.v, 1, '°', ac.alts, 'The height is <b>opposite</b> the angle and the slide is the <b>hypotenuse</b> ⇒ <b>SOH</b>:<br>' + t(ac.work.replace(/\\approx [\d.]+\^\\circ$/, '\\approx ' + fx(ac.v, 1) + '^\\circ')),
            ['The slide itself is the hypotenuse. The height is across from the angle at the ground.', 'Opposite and hypotenuse ⇒ ' + t('\\sin^{-1}') + '.'], 'NR slide ' + o.L + ', ' + o.h, true);
        } }] },
      { num: '14', stem: '<i>(Numerical response)</i> The area of a right triangle.', parts: [
        { id: '14', level: 'PRG', make: function (r) {
          var bkv = r.chance(0.2), n = bkv ? { P: 'P', Q: 'R', R: 'Q', tri: 'PQR' } : pickTri(r);
          var o = bkv ? { hyp: 48, th: 33 } : gen(function () { return { hyp: r.int(30, 60), th: r.int(25, 60) }; }, function (o) { return o.th !== 45 && safe(0.5 * o.hyp * o.hyp * T.sin(o.th) * T.cos(o.th), 0); });
          var adj = o.hyp * T.cos(o.th), opp = o.hyp * T.sin(o.th), A = 0.5 * adj * opp;
          var nm = { adj: seg(n.P, n.R), opp: seg(n.Q, n.R), hyp: seg(n.P, n.Q) };
          return nearPart('In right ' + t('\\triangle ' + n.tri) + ', ' + t('\\angle ' + n.R + '=90^\\circ') + ', ' + t('\\angle ' + n.P + '=' + dg(o.th)) + ' and the hypotenuse ' + t(nm.hyp + '=' + o.hyp + '.0\\text{ cm}') + '. To the nearest square centimetre, the area of the triangle is ____ cm².',
            A, 0, 'cm²', [{ v: 2 * A, code: 'no-half-area', hint: 'The area of a triangle is ' + t('\\tfrac12\\times\\text{base}\\times\\text{height}') + ' — don’t forget the ' + t('\\tfrac12') + '.' },
              { v: 0.5 * o.hyp * opp, code: 'hyp-base', hint: 'The base and height must be <b>perpendicular</b>: use the two legs, not the hypotenuse.' }, { v: 0.5 * o.hyp * adj, code: 'hyp-base', hint: 'The base and height must be <b>perpendicular</b>: use the two legs, not the hypotenuse.' },
              { v: 0.5 * o.hyp * o.hyp * Math.sin(o.th) * Math.cos(o.th), code: 'radian', hint: RAD }, { v: 0.5 * rd(adj, 0) * rd(opp, 0), code: 'rounded-early', hint: 'Close — but you rounded the legs before multiplying. Keep full precision in both legs and round only the area.' }],
            'Find both legs from the <b>given</b> data and keep full precision:<br>' + t(nm.adj + '=' + o.hyp + '\\cos ' + dg(o.th) + '=' + fl(adj) + '\\ldots') + ' (adjacent), ' + t(nm.opp + '=' + o.hyp + '\\sin ' + dg(o.th) + '=' + fl(opp) + '\\ldots') + ' (opposite).<br>The legs are perpendicular, so one is the base and the other the height:<br>' +
            t('A=\\tfrac12(' + fl(adj) + ')(' + fl(opp) + ')=' + tr(A) + '\\ldots\\approx ' + fx(A, 0)), ['You need a base and a height that are perpendicular — in a right triangle, that is the two legs.', 'Find each leg from the hypotenuse and the angle (CAH and SOH), then use ' + t('A=\\tfrac12bh') + '.'], 'NR area hyp ' + o.hyp + ', ' + o.th + '°', true);
        } }] }
    ],

    extra: [
      /* ---------- Part A ---------- */
      { num: '1', section: 'Extra practice A — Is there enough information?', stem: function (sh) {
          return 'Three right triangles are described below. Besides the right angle, how many <b>independent</b> facts does each give, and can it be solved completely?<br>' + sh.rows.map(function (x) { return x.html; }).join('<br>');
        },
        shared: function (r) {
          var ns = r.sample(NAMES, 3).map(function (s) { return r.shuffle(s); }), cases = r.shuffle(['legs', 'side-angle', 'one']), rows = [], keyRows = {};
          cases.forEach(function (c, i) {
            var s = ns[i], R = s[0], P = s[1], Q = s[2], L = '(' + 'abc'[i] + ') ', tri = '\\triangle ' + [P, Q, R].join(''), d;
            if (c === 'legs') { var a = dec(r, 5, 15), b = dec(r, 5, 15); d = t(tri) + ', right angle at ' + t(R) + ', ' + t(seg(P, R) + '=' + fx(a, 1)) + ', ' + t(seg(Q, R) + '=' + fx(b, 1)); }
            else if (c === 'side-angle') { var th = r.int(25, 65), k = dec(r, 8, 20); d = t(tri) + ', right angle at ' + t(R) + ', ' + t(seg(P, R) + '=' + fx(k, 1)) + ', ' + t('\\angle ' + P + '=' + dg(th)) + (r.chance(0.35) ? ', ' + t('\\angle ' + Q + '=' + dg(90 - th)) : ''); }
            else { var w = dec(r, 4, 12); d = t(tri) + ', right angle at ' + t(R) + ', ' + t(seg(P, R) + '=' + fx(w, 1)) + (r.chance(0.5) ? ', and ' + t('\\angle ' + P + '+\\angle ' + Q + '=90^\\circ') : ''); }
            rows.push({ id: 'r' + i, html: L + d, kase: c, P: P, Q: Q, R: R, tri: [P, Q, R].join(''), side: seg(P, R) });
          });
          return { rows: rows };
        },
        parts: [
          { id: 'e1a', sub: 'a–c', level: 'EMG', make: function (r, sh) {
            var want = {}, byId = {};
            sh.rows.forEach(function (x) { want[x.id] = x.kase === 'one' ? 'c1' : 'c2'; byId[x.id] = x; });
            var p = K.P.grid('Choose for each triangle.', sh.rows.map(function (x) { return { id: x.id, html: '(' + 'abc'[Number(x.id.slice(1))] + ') ' + t('\\triangle ' + x.tri) }; }),
              [{ id: 'c1', html: '1 — can’t be solved' }, { id: 'c2', html: '2 — can be solved' }, { id: 'c3', html: '3 — can be solved' }], want, {
                colHead: 'independent facts', why: function (row, got) {
                  var x = byId[row];
                  if (got === 'c3') return { code: 'facts-count', hint: 'In ' + t('\\triangle ' + x.tri) + ', don’t count the right angle (it’s free), and don’t count a fact that follows from another one (the second acute angle is forced by the first).' };
                  if (x.kase === 'one') return { code: 'facts-count', hint: 'In ' + t('\\triangle ' + x.tri) + ' only <b>one length</b> is given. A statement like “the acute angles add to ' + t('90^\\circ') + '” follows from the right angle, so it is not new.' };
                  return { code: 'facts-count', hint: 'In ' + t('\\triangle ' + x.tri) + ', two sides — or one side and one acute angle — are given. That is exactly enough to solve a right triangle.' };
                } }, 'Two independent facts beyond the right angle — two sides, or one side and one acute angle — are enough. ' +
                sh.rows.map(function (x) { return '(' + 'abc'[Number(x.id.slice(1))] + ') ' + (x.kase === 'legs' ? 'two legs: <b>2</b>, solvable.' : x.kase === 'side-angle' ? 'a side and an acute angle: <b>2</b>, solvable (a second acute angle would add nothing new).' : 'one length only: <b>1</b>, not solvable (the angle sum to ' + t('90^\\circ') + ' comes free with the right angle).'); }).join('<br>'),
              ['The right angle is free — don’t count it.', 'A fact that can be worked out from the others is not independent.'], 'enough information? (3 triangles)');
            return p;
          } },
          { id: 'e1c', sub: 'iii', level: 'EMG', make: function (r, sh) {
            var x = sh.rows.filter(function (y) { return y.kase === 'one'; })[0], useAngle = r.chance(0.5);
            return mc(r, 'For the triangle that cannot be solved, ' + t('\\triangle ' + x.tri) + ' (right angle at ' + t(x.R) + ', ' + t(x.side) + ' given), which extra fact would be enough?', [
              { html: useAngle ? 'The measure of ' + t('\\angle ' + x.Q) : 'The length of ' + t(seg(x.Q, x.R)), right: true },
              { html: 'That ' + t('\\angle ' + x.P + '+\\angle ' + x.Q + '=90^\\circ'), why: 'That already follows from the right angle at ' + t(x.R) + ', so it adds nothing new.' },
              { html: 'That ' + t(seg(x.P, x.Q)) + ' is the hypotenuse', why: 'That also follows from the right angle (the hypotenuse is across from it). It gives no new measurement.' },
              { html: 'That the three angles add to ' + t('180^\\circ'), why: 'True of every triangle — it doesn’t fix the shape or the size.' }],
              'One acute angle fixes the shape and the given ' + t(x.side) + ' fixes the size, so ' + (useAngle ? t('\\angle ' + x.Q) : 'a second side such as ' + t(seg(x.Q, x.R))) + ' is enough. Facts that come with the right angle (the acute angles add to ' + t('90^\\circ') + ', which side is the hypotenuse) are not new.',
              ['Which choice gives a new measurement that couldn’t be worked out already?'], 'extra fact needed');
          } },
          { id: 'e1d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var x = sh.rows.filter(function (y) { return y.kase === 'one'; })[0];
            return mc(r, 'A classmate says “' + t('\\triangle ' + x.tri) + ' has a right angle and a side — that’s two things, so it must be solvable.” What is wrong with that?', [
              { html: 'The right angle is given free; only facts <b>beyond</b> it count. ' + t(x.side) + ' is just one such fact, and two independent facts are needed.', right: true },
              { html: 'Nothing — a right angle and a side are enough.', why: 'Try it: with only ' + t(x.side) + ' known, the triangle could be tall and thin or short and wide. The shape isn’t fixed.' },
              { html: 'The side would have to be the hypotenuse for it to work.', why: 'Even the hypotenuse alone doesn’t fix the shape. One more angle or side is needed, whichever side is given.' },
              { html: 'Every side must be given before a triangle can be solved.', why: 'Two independent facts are enough — two sides, or a side and an acute angle.' }],
              'A fact is independent only if it can’t be worked out from what is already given. The right angle is given; its consequences (the acute angles add to ' + t('90^\\circ') + ', which side is the hypotenuse) are old news. So ' + t(x.side) + ' is <b>one</b> fact beyond the right angle, and two are needed.',
              ['What does the classmate count as the “two things”? Is the right angle one of the facts that counts?'], 'counting independent facts');
          } }] },
      { num: '2', stem: function (sh) {
          return 'In ' + t('\\triangle ' + sh.tri) + ' the right angle is at ' + t(sh.R) + ', ' + t('\\angle ' + sh.P + '=' + dg(sh.th)) + ', and the hypotenuse ' + t(seg(sh.P, sh.Q) + '=' + fx(sh.k, 1)) + '.' +
            triFig({ P: sh.P, Q: sh.Q, R: sh.R, th: sh.th, names: true, lab: { hyp: fx(sh.k, 1) }, angP: sh.th + '°' }, sh.ori);
        },
        shared: function (r) {
          var n = r.chance(0.2) ? { tri: 'ABC', R: 'B', P: 'A', Q: 'C', th: 28, k: 24.6 } : (function () { var nn = pickTri(r); var g = gen(function () { return { th: r.int(20, 40), k: dec(r, 15, 30) }; }, function (o) {
            var a = rd(o.k * T.cos(o.th), 1), b = rd(o.k * T.sin(o.th), 1); return safe(o.k * T.cos(o.th), 1) && safe(o.k * T.sin(o.th), 1) && Math.abs(a * a + b * b - o.k * o.k) > 0.05; }); nn.th = g.th; nn.k = g.k; return nn; })();
          n.ori = orient(r); return n;
        },
        parts: [
          { id: 'e2a', sub: 'a', level: 'BEG', make: function (r, sh) {
            return mc(r, 'Of the three unknowns, which is the cheapest to find — it needs <b>no trigonometry at all</b>?', [
              { html: t('\\angle ' + sh.Q), right: true },
              { html: t(seg(sh.P, sh.R)), why: t(seg(sh.P, sh.R)) + ' needs a ratio (it is adjacent to ' + t(dg(sh.th)) + ').' },
              { html: t(seg(sh.Q, sh.R)), why: t(seg(sh.Q, sh.R)) + ' needs a ratio (it is opposite ' + t(dg(sh.th)) + ').' },
              { html: 'None — every unknown needs a trig ratio.', why: 'One unknown needs only a subtraction. Think about the angles.' }],
              t('\\angle ' + sh.Q + '=90^\\circ-' + dg(sh.th)) + ': one subtraction, because the two acute angles add to ' + t('90^\\circ') + '. Then ' + t(seg(sh.P, sh.R) + '=' + fx(sh.k, 1) + '\\cos ' + dg(sh.th)) + ' and ' + t(seg(sh.Q, sh.R) + '=' + fx(sh.k, 1) + '\\sin ' + dg(sh.th)) + ' — each straight from the given data. (Don’t get one side from the other after rounding it.)',
              ['The two acute angles of a right triangle add to ' + t('90^\\circ') + '.'], 'cheapest unknown');
          } },
          { id: 'e2b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var s = solveAS({ P: sh.P, Q: sh.Q, R: sh.R, th: sh.th, kRole: 'hyp', k: sh.k, dp: 1, unit: '', order: ['Q', 'opp', 'adj'] });
            return fieldsPart('Solve the triangle completely: sides to the nearest tenth, angles to the nearest degree.', s.fields, s.sol, SOLVE_HINTS, 'solve ' + sh.tri + ': angle + hyp ' + sh.k);
          } },
          { id: 'e2c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var a = rd(sh.k * T.cos(sh.th), 1), b = rd(sh.k * T.sin(sh.th), 1), q = 90 - sh.th, H = seg(sh.P, sh.Q);
            return mc(r, 'You solved the triangle: ' + t('\\angle ' + sh.Q + '=' + dg(q)) + ', ' + t(seg(sh.P, sh.R) + '=' + a.toFixed(1)) + ', ' + t(seg(sh.Q, sh.R) + '=' + b.toFixed(1)) + '. Which self-check is written correctly <b>and</b> passes?', [
              { html: t(dg(sh.th) + '+' + dg(q) + '+90^\\circ=180^\\circ') + ' ✓', right: true },
              { html: t(dg(sh.th) + '+' + dg(q) + '=180^\\circ') + ' ✓', why: 'The two acute angles add to ' + t('90^\\circ') + '; all <b>three</b> angles add to ' + t('180^\\circ') + '.' },
              { html: t(a.toFixed(1) + '^{2}+' + b.toFixed(1) + '^{2}=' + fx(sh.k, 1) + '^{2}') + ' exactly ✓', why: 'Work it out: ' + t(a.toFixed(1) + '^{2}+' + b.toFixed(1) + '^{2}=' + tr(a * a + b * b)) + ' but ' + t(fx(sh.k, 1) + '^{2}=' + tr(sh.k * sh.k)) + '. Rounded sides almost never fit the Pythagorean theorem exactly.' },
              { html: 'The hypotenuse ' + t(H) + ' faces the smallest angle, ' + t(dg(sh.th)) + ' ✓', why: 'The hypotenuse faces the <b>right angle</b>, the largest angle.' }],
              'Check (i): ' + t(dg(sh.th) + '+' + dg(q) + '+90^\\circ=180^\\circ') + ' ✓. (Check (iii) passes too: ' + t(fx(sh.k, 1)) + ' is longer than both legs.)',
              ['The three self-checks: angles sum to ' + t('180^\\circ') + '; the longest side faces the largest angle; the hypotenuse is longer than both legs.'], 'self-check choice');
          } }] },
      /* ---------- Part B ---------- */
      { num: '3', section: 'Extra practice B — The three starting cases', stem: 'Two sides given.', parts: [
        { id: 'e3', level: 'PRG', make: function (r) {
          var n = r.chance(0.2) ? { tri: 'DEF', R: 'E', P: 'D', Q: 'F', o: 16.5, a: 9.4 } : (function () { var nn = pickTri(r); var g = gen(function () { return { o: dec(r, 6, 20), a: dec(r, 6, 20) }; }, function (g) { var th = T.atan(g.o / g.a); return Math.abs(th - 45) > 6 && safe(th, 0) && safe(Math.hypot(g.o, g.a), 1); }); nn.o = g.o; nn.a = g.a; return nn; })();
          var s = solveSS({ P: n.P, Q: n.Q, R: n.R, g: { opp: n.o, adj: n.a }, dp: 1, unit: '', order: ['u', 'P', 'Q'] });
          var fig = triFig({ P: n.P, Q: n.Q, R: n.R, th: s.th, names: true, lab: { opp: fx(n.o, 1), adj: fx(n.a, 1) } }, orient(r));
          return fieldsPart(fig + 'Solve ' + t('\\triangle ' + n.tri) + ' completely: the right angle is at ' + t(n.R) + ', ' + t(seg(n.P, n.R) + '=' + fx(n.a, 1)) + ' and ' + t(seg(n.Q, n.R) + '=' + fx(n.o, 1)) + '.', s.fields, s.sol, SOLVE_HINTS_SS, 'solve ' + n.tri + ': two legs');
        } }] },
      { num: '4', stem: 'One side and one acute angle given.', parts: [
        { id: 'e4', level: 'PRG', make: function (r) {
          // the given side is opposite the given angle (booklet: ∠J = 41°, GH = 12.8)
          var n = r.chance(0.2) ? { tri: 'GHJ', R: 'H', P: 'J', Q: 'G', th: 41, k: 12.8 } : (function () { var nn = pickTri(r); var g = gen(function () { return { th: r.int(28, 62), k: dec(r, 8, 20) }; }, function (o) { return o.th !== 45 && safe(o.k / T.tan(o.th), 1) && safe(o.k / T.sin(o.th), 1); }); nn.th = g.th; nn.k = g.k; return nn; })();
          var s = solveAS({ P: n.P, Q: n.Q, R: n.R, th: n.th, kRole: 'opp', k: n.k, dp: 1, unit: '', order: ['Q', 'adj', 'hyp'] });
          var fig = triFig({ P: n.P, Q: n.Q, R: n.R, th: n.th, names: true, lab: { opp: fx(n.k, 1) }, angP: n.th + '°' }, orient(r));
          return fieldsPart(fig + 'Solve ' + t('\\triangle ' + n.tri) + ' completely: the right angle is at ' + t(n.R) + ', ' + t('\\angle ' + n.P + '=' + dg(n.th)) + ' and ' + t(seg(n.Q, n.R) + '=' + fx(n.k, 1)) + '.', s.fields, s.sol, SOLVE_HINTS, 'solve ' + n.tri + ': angle + opposite side');
        } }] },
      { num: '5', stem: function (sh) {
          return 'A leg and the hypotenuse given: in ' + t('\\triangle ' + sh.tri) + ' the right angle is at ' + t(sh.R) + ', ' + t(seg(sh.Q, sh.R) + '=' + fx(sh.leg, 1)) + ' and ' + t(seg(sh.P, sh.Q) + '=' + fx(sh.hyp, 1)) + '.' +
            triFig({ P: sh.P, Q: sh.Q, R: sh.R, th: T.asin(sh.leg / sh.hyp), names: true, lab: { opp: fx(sh.leg, 1), hyp: fx(sh.hyp, 1) } }, sh.ori);
        },
        shared: function (r) {
          var n = r.chance(0.2) ? { tri: 'KLM', R: 'L', P: 'K', Q: 'M', leg: 18, hyp: 25 } : (function () { var nn = pickTri(r); var g = gen(function () { var hyp = r.int(15, 40), th = 45 + (r.chance(0.5) ? 1 : -1) * r.int(8, 30) / 10; return { hyp: hyp, leg: rd(hyp * T.sin(th), 0) }; }, function (g) {
            var th = T.asin(g.leg / g.hyp); return safe(th, 0) && safe(Math.sqrt(g.hyp * g.hyp - g.leg * g.leg), 1) && rd(th, 0) !== 45 && Math.abs(th - 45) < 4; }); nn.hyp = g.hyp; nn.leg = g.leg; return nn; })();
          n.ori = orient(r); return n;
        },
        parts: [
          { id: 'e5a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var s = solveSS({ P: sh.P, Q: sh.Q, R: sh.R, g: { opp: sh.leg, hyp: sh.hyp }, dp: 1, unit: '', order: ['u', 'P', 'Q'] });
            return fieldsPart('Solve ' + t('\\triangle ' + sh.tri) + ' completely (sides to the nearest tenth, angles to the nearest degree).', s.fields, s.sol, SOLVE_HINTS_SS, 'solve ' + sh.tri + ': leg + hyp');
          } },
          { id: 'e5b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var th = T.asin(sh.leg / sh.hyp), other = Math.sqrt(sh.hyp * sh.hyp - sh.leg * sh.leg), big = th > 45;
            return mc(r, 'The two acute angles of ' + t('\\triangle ' + sh.tri) + ' are close (' + t(dg(fx(th, 0))) + ' and ' + t(dg(fx(90 - th, 0))) + '). Which self-check does this triangle really put to the test?', [
              { html: '(ii) the longer leg faces the larger acute angle', right: true },
              { html: '(i) the angles add to ' + t('180^\\circ'), why: 'Check (i) passes no matter which acute angle is which — swapping them keeps the sum. It can’t catch a swap.' },
              { html: '(iii) the hypotenuse is longer than both legs', why: 'The hypotenuse here is clearly the longest. The risky part is telling two nearly equal legs and angles apart.' },
              { html: 'None — close angles can’t be checked.', why: 'They can: the slightly longer leg must face the slightly larger angle.' }],
              'With angles ' + t(dg(fx(th, 0))) + ' and ' + t(dg(fx(90 - th, 0))) + ' and legs ' + t(fx(sh.leg, 1)) + ' and ' + t(fx(other, 1)) + ', it is easy to swap them. Check (ii): the larger angle ' + t('\\angle ' + (big ? sh.P : sh.Q) + '=' + dg(fx(Math.max(th, 90 - th), 0))) + ' faces the longer leg ' + t(fx(Math.max(sh.leg, other), 1)) + ' ✓',
              ['Which check would catch the two acute angles being swapped?'], 'which check: close angles');
          } }] },
      { num: '6', stem: function (sh) {
          return 'Too little information: in ' + t('\\triangle ' + sh.tri) + ' the right angle is at ' + t(sh.R) + ', ' + t('\\angle ' + sh.P + '=' + dg(sh.th)) + ' and ' + t('\\angle ' + sh.Q + '=' + dg(90 - sh.th)) + '. A student writes: “Two facts are given besides the right angle, so the triangle can be solved.”' +
            triFig({ P: sh.P, Q: sh.Q, R: sh.R, th: sh.th, names: true, angP: sh.th + '°', angQ: (90 - sh.th) + '°' }, sh.ori);
        },
        shared: function (r) {
          var n = r.chance(0.2) ? { tri: 'ABC', R: 'B', P: 'A', Q: 'C', th: 35, k: 20 } : (function () { var nn = pickTri(r); var g = gen(function () { return { th: r.int(25, 65), k: dec(r, 12, 30) }; }, function (o) { return o.th !== 45 && safe(o.k * T.sin(o.th), 1) && safe(o.k * T.cos(o.th), 1); }); nn.th = g.th; nn.k = g.k; return nn; })();
          n.ori = orient(r); return n;
        },
        parts: [
          { id: 'e6a', sub: 'a', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Why is the student wrong?', [
              { html: t('\\angle ' + sh.Q + '=' + dg(90 - sh.th)) + ' is forced by ' + t('\\angle ' + sh.P + '=' + dg(sh.th)) + ' (they add to ' + t('90^\\circ') + '), so only one independent fact is given. The angles fix the shape, not the size.', right: true },
              { html: 'Angles can never be used to solve a triangle; only sides can.', why: 'A side and an acute angle is a perfectly good starting case. The trouble here is that no side is given.' },
              { html: 'The angles don’t add to ' + t('180^\\circ') + '.', why: 'Add them: ' + t(dg(sh.th) + '+' + dg(90 - sh.th) + '+90^\\circ=180^\\circ') + '.' },
              { html: 'The student is right: two acute angles are two independent facts.', why: 'Could you work out the second angle from the first? Then it isn’t independent.' }],
              'In a right triangle the acute angles add to ' + t('90^\\circ') + ', so ' + t(dg(90 - sh.th)) + ' is the same fact as ' + t(dg(sh.th)) + ' written a second way. Three angles fix the <b>shape</b> but not the <b>size</b>; infinitely many similar triangles fit.',
              ['Could you have worked out ' + t('\\angle ' + sh.Q) + ' from ' + t('\\angle ' + sh.P) + ' alone?'], 'two angles are not independent');
          } },
          { id: 'e6b', sub: 'b', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Which extra fact would make the triangle solvable, and how many different triangles fit the description <b>now</b>?', [
              { html: 'Any one side length; right now infinitely many (all similar) triangles fit.', right: true },
              { html: 'Any one side length; right now exactly one triangle fits.', why: 'If only one fitted, it would already be solved. Picture the same shape drawn small and large.' },
              { html: 'The fact that the acute angles add to ' + t('90^\\circ') + '; right now infinitely many fit.', why: 'That is already known from the right angle — it adds nothing.' },
              { html: 'A third acute angle; right now two triangles fit.', why: 'A right triangle has only two acute angles, and angles never fix the size.' }],
              'One length — ' + t(seg(sh.P, sh.Q)) + ', ' + t(seg(sh.P, sh.R)) + ' or ' + t(seg(sh.Q, sh.R)) + ' — fixes the size; the angle has already fixed the shape. Right now <b>infinitely many</b> similar triangles fit.', ['What is still unknown: the shape or the size?'], 'extra fact + count');
          } },
          { id: 'e6c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var s = solveAS({ P: sh.P, Q: sh.Q, R: sh.R, th: sh.th, kRole: 'hyp', k: sh.k, dp: 1, unit: '', order: ['opp', 'adj'] });
            return fieldsPart('Now suppose ' + t(seg(sh.P, sh.Q) + '=' + fx(sh.k, 1)) + ' is added. Find the two missing sides to the nearest tenth.', s.fields, s.sol, SOLVE_HINTS, 'solve ' + sh.tri + ' with hyp ' + sh.k);
          } }] },
      /* ---------- Part C ---------- */
      { num: '7', section: 'Extra practice C — Original data beats a rounded intermediate', stem: function (sh) {
          return 'In ' + t('\\triangle ' + sh.tri) + ' the right angle is at ' + t(sh.R) + '. The hypotenuse ' + t(seg(sh.P, sh.Q) + '=' + fx(sh.h, 1)) + ' and the leg ' + t(seg(sh.Q, sh.R) + '=' + fx(sh.l, 1)) + ' are given. The leg ' + t(seg(sh.P, sh.R)) + ' is wanted, to the nearest tenth.' +
            triFig({ P: sh.P, Q: sh.Q, R: sh.R, th: T.asin(sh.l / sh.h), names: true, lab: { opp: fx(sh.l, 1), hyp: fx(sh.h, 1), adj: '?' } }, sh.ori);
        },
        shared: function (r) {
          var n = r.chance(0.2) ? { tri: 'ABC', R: 'C', P: 'A', Q: 'B', h: 46, l: 17.5 } : (function () { var nn = pickTri(r); var g = gen(function () { return { h: dec(r, 30, 60), l: dec(r, 10, 25) }; }, function (g) {
            var A = T.asin(g.l / g.h), x = Math.sqrt(g.h * g.h - g.l * g.l), y = g.h * T.cos(rd(A, 0)); return g.l < g.h * 0.7 && safe(A, 0) && safe(x, 1) && safe(y, 1) && fx(x, 1) !== fx(y, 1); }); nn.h = g.h; nn.l = g.l; return nn; })();
          n.ori = orient(r); return n;
        },
        parts: [
          { id: 'e7a', sub: 'Route 1', level: 'EMG', make: function (r, sh) {
            var x = Math.sqrt(sh.h * sh.h - sh.l * sh.l), A = T.asin(sh.l / sh.h), nm = seg(sh.P, sh.R);
            return nearPart('<b>Route 1 — from the original data.</b> Use the Pythagorean theorem on ' + t(seg(sh.P, sh.Q)) + ' and ' + t(seg(sh.Q, sh.R)) + ' to find ' + t(nm) + '.', x, 1, '', [
              { v: Math.hypot(sh.h, sh.l), code: 'pyth-op', hint: t(nm) + ' is a <b>leg</b>: subtract, ' + t(nm + '^2=' + fx(sh.h, 1) + '^2-' + fx(sh.l, 1) + '^2') + '.' }, { v: sh.h * T.cos(rd(A, 0)), code: 'rounded-early', hint: 'That is Route 2’s answer (through a rounded angle). Route 1 uses only the two given lengths.' }],
              t(nm + '=\\sqrt{' + fx(sh.h, 1) + '^{2}-' + fx(sh.l, 1) + '^{2}}=\\sqrt{' + tr(sh.h * sh.h - sh.l * sh.l) + '}=' + fl(x) + '\\ldots\\approx ' + fx(x, 1)) + '<br>Only the two given numbers were used; the rounding happened once, at the end.',
              ['The unknown is a leg: ' + t('\\text{leg}^2=\\text{hyp}^2-\\text{other leg}^2') + '.'], 'route 1 Pythagoras');
          } },
          { id: 'e7b', sub: 'Route 2', level: 'EMG', make: function (r, sh) {
            var A = T.asin(sh.l / sh.h), rA = rd(A, 0), y = sh.h * T.cos(rA), x = Math.sqrt(sh.h * sh.h - sh.l * sh.l), nm = seg(sh.P, sh.R);
            var ac = angleCalc('opp', sh.l, fx(sh.l, 1), 'hyp', sh.h, fx(sh.h, 1), sh.P, '\\angle ' + sh.P, 0);
            return fieldsPart('<b>Route 2 — through a rounded intermediate.</b> First find ' + t('\\angle ' + sh.P) + ' to the nearest degree. Then use that <b>rounded</b> angle and ' + t(seg(sh.P, sh.Q)) + ' to find ' + t(nm) + ' (nearest tenth).', [
              { tex: '\\angle ' + sh.P, name: '∠' + sh.P, x: A, dp: 0, unit: '°', alts: ac.alts },
              { tex: nm, name: nm, x: y, dp: 1, unit: '', alts: [{ v: x, code: 'used-unrounded', hint: 'That is the full-precision answer. This route deliberately uses the <b>rounded</b> angle ' + t(dg(rA)) + ' — use it exactly as rounded to see what happens.' },
                { v: sh.h * T.sin(rA), code: 'wrong-ratio', hint: 'From ' + t('\\angle ' + sh.P) + ', ' + t(nm) + ' is <b>adjacent</b> and ' + t(seg(sh.P, sh.Q)) + ' is the hypotenuse ⇒ cosine.' }, { v: sh.h * Math.cos(rA), code: 'radian', hint: RAD }] }],
              t('\\angle ' + sh.P) + ': ' + t(ac.work) + '<br>Now with the <b>rounded</b> ' + t(dg(rA)) + ': ' + t(nm + '=' + fx(sh.h, 1) + '\\cos ' + dg(rA) + '=' + fl(y) + '\\ldots\\approx ' + fx(y, 1)) + ' — not the same as Route 1 (' + t(fx(x, 1)) + ').',
              ['Relative to ' + t('\\angle ' + sh.P) + ', ' + t(fx(sh.l, 1)) + ' is opposite and ' + t(fx(sh.h, 1)) + ' is the hypotenuse.', 'Then ' + t(nm) + ' is adjacent ⇒ CAH, with the rounded angle.'], 'route 2 rounded angle');
          } },
          { id: 'e7c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var A = T.asin(sh.l / sh.h), rA = rd(A, 0), y = rd(sh.h * T.cos(rA), 1), x = rd(Math.sqrt(sh.h * sh.h - sh.l * sh.l), 1), dd = Math.abs(y - x).toFixed(1);
            return mc(r, 'Two routes to ' + t(seg(sh.P, sh.R)) + ': <b>Route 1</b> uses the Pythagorean theorem on ' + t(seg(sh.P, sh.Q)) + ' and ' + t(seg(sh.Q, sh.R)) + '; <b>Route 2</b> first finds ' + t('\\angle ' + sh.P) + ' to the nearest degree, then uses that rounded angle with ' + t(seg(sh.P, sh.Q)) + '. The two routes disagree by ' + t(dd) + '. Where did the error enter?', [
              { html: 'When ' + t('\\angle ' + sh.P + '=' + fl(A) + '^\\circ') + ' was rounded to ' + t(dg(rA)) + ' and then used. Take every unknown from the original given data, never from a rounded value.', right: true },
              { html: 'In Route 1: the Pythagorean theorem is less accurate than trigonometry.', why: 'Route 1 used only the exact given numbers — nothing was rounded until the end. It is the trustworthy one.' },
              { html: 'When ' + t(fx(sh.h, 1)) + ' was squared: squaring big numbers loses accuracy.', why: 'Squaring is exact (your calculator keeps every digit). Nothing was rounded in Route 1.' },
              { html: 'Nowhere — a difference of ' + t(dd) + ' is just calculator noise.', why: 'Calculators don’t make errors of that size. Something was rounded and then reused.' }],
              'The angle lost ' + t(Math.abs(A - rA).toFixed(2) + '^\\circ') + ' when it was rounded, and multiplying by ' + t(fx(sh.h, 1)) + ' turned that into a length error big enough to change the tenths digit. Route 1 is correct: ' + t(seg(sh.P, sh.R) + '\\approx ' + x.toFixed(1)) + '. Rule: <b>take every unknown from the original given measurements, never from a value you have already rounded.</b>',
              ['Which route used a number that had already been rounded?'], 'where the error entered');
          } }] },
      { num: '8', stem: function (sh) {
          return 'In ' + t('\\triangle ' + sh.tri) + ' the right angle is at ' + t(sh.R) + ', the hypotenuse ' + t(seg(sh.P, sh.Q) + '=' + fx(sh.h, 1)) + ' and the leg ' + t(seg(sh.P, sh.R) + '=' + fx(sh.l, 1)) + '. The leg ' + t(seg(sh.Q, sh.R)) + ' can be reached by Pythagoras <b>or</b> by trigonometry.' +
            triFig({ P: sh.P, Q: sh.Q, R: sh.R, th: T.acos(sh.l / sh.h), names: true, lab: { adj: fx(sh.l, 1), hyp: fx(sh.h, 1) } }, sh.ori);
        },
        shared: function (r) {
          // P is the angle found first (booklet: ∠Z, YZ = 21.0 adjacent, XZ = 34.0)
          var n = r.chance(0.2) ? { tri: 'XYZ', R: 'Y', P: 'Z', Q: 'X', h: 34, l: 21 } : (function () { var nn = pickTri(r); var g = gen(function () { return { h: dec(r, 25, 45), l: dec(r, 12, 30) }; }, function (g) {
            if (g.l > g.h * 0.85) return false; var Z = T.acos(g.l / g.h), x = g.h * T.sin(Z), y = g.h * T.sin(rd(Z, 0)); return safe(Z, 0) && safe(Z, 2) && safe(x, 1) && safe(y, 1) && fx(x, 1) !== fx(y, 1); }); nn.h = g.h; nn.l = g.l; return nn; })();
          n.ori = orient(r); return n;
        },
        parts: [
          { id: 'e8a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var x = Math.sqrt(sh.h * sh.h - sh.l * sh.l), nm = seg(sh.Q, sh.R);
            return nearPart('By the Pythagorean theorem, using only ' + t(seg(sh.P, sh.Q)) + ' and ' + t(seg(sh.P, sh.R)) + ', find ' + t(nm) + ' to the nearest tenth.', x, 1, '', [{ v: Math.hypot(sh.h, sh.l), code: 'pyth-op', hint: t(nm) + ' is a <b>leg</b>: subtract the squares.' }],
              t(nm + '=\\sqrt{' + fx(sh.h, 1) + '^{2}-' + fx(sh.l, 1) + '^{2}}=\\sqrt{' + tr(sh.h * sh.h - sh.l * sh.l) + '}=' + fl(x) + '\\ldots\\approx ' + fx(x, 1)), ['The unknown is a leg: ' + t('\\text{leg}^2=\\text{hyp}^2-\\text{other leg}^2') + '.'], 'route (a) Pythagoras');
          } },
          { id: 'e8b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var Z = T.acos(sh.l / sh.h), x = sh.h * T.sin(Z), nm = seg(sh.Q, sh.R), ac = angleCalc('adj', sh.l, fx(sh.l, 1), 'hyp', sh.h, fx(sh.h, 1), sh.P, '\\angle ' + sh.P, 2);
            return fieldsPart('By trigonometry: find ' + t('\\angle ' + sh.P) + ' first (give it to the nearest <b>hundredth</b> of a degree, and keep full precision in your calculator), then ' + t(nm) + ' to the nearest tenth.', [
              { tex: '\\angle ' + sh.P, name: '∠' + sh.P, x: Z, dp: 2, unit: '°', alts: ac.alts },
              { tex: nm, name: nm, x: x, dp: 1, unit: '', alts: [{ v: sh.h * T.sin(rd(Z, 0)), code: 'rounded-early', hint: 'That used the angle rounded to a whole degree. Keep the angle at full calculator precision for this route.' }, { v: sh.h * T.cos(Z), code: 'wrong-ratio', hint: 'From ' + t('\\angle ' + sh.P) + ', ' + t(nm) + ' is <b>opposite</b> and ' + t(seg(sh.P, sh.Q)) + ' is the hypotenuse ⇒ sine.' }] }],
              t('\\angle ' + sh.P) + ': ' + t(ac.work.replace(/\\approx [\d.]+\^\\circ$/, '\\approx ' + fx(Z, 2) + '^\\circ')) + ' (kept unrounded)<br>' + t(nm + '=' + fx(sh.h, 1) + '\\sin(' + fl(Z) + '^\\circ)=' + fl(x) + '\\ldots\\approx ' + fx(x, 1)) + ' — identical to the Pythagoras route.',
              ['From ' + t('\\angle ' + sh.P) + ': ' + t(fx(sh.l, 1)) + ' is adjacent and ' + t(fx(sh.h, 1)) + ' is the hypotenuse ⇒ ' + t('\\cos^{-1}') + '.', 'Then ' + t(nm) + ' is opposite ⇒ SOH. Use the stored, unrounded angle.'], 'route (b) full precision');
          } },
          { id: 'e8c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var Z = T.acos(sh.l / sh.h), rZ = rd(Z, 0), y = sh.h * T.sin(rZ), nm = seg(sh.Q, sh.R), ac = angleCalc('adj', sh.l, fx(sh.l, 1), 'hyp', sh.h, fx(sh.h, 1), sh.P, '\\angle ' + sh.P, 0);
            return fieldsPart('By trigonometry again, but round ' + t('\\angle ' + sh.P) + ' to the nearest degree <b>before</b> using it. Find the rounded angle, then ' + t(nm) + ' from it.', [
              { tex: '\\angle ' + sh.P, name: '∠' + sh.P, x: Z, dp: 0, unit: '°', alts: ac.alts },
              { tex: nm, name: nm, x: y, dp: 1, unit: '', alts: [{ v: sh.h * T.sin(Z), code: 'used-unrounded', hint: 'That is the full-precision answer. This route deliberately uses the angle rounded to ' + t(dg(rZ)) + '.' }, { v: sh.h * T.cos(rZ), code: 'wrong-ratio', hint: t(nm) + ' is <b>opposite</b> ' + t('\\angle ' + sh.P) + ' ⇒ sine.' }] }],
              t('\\angle ' + sh.P + '=' + fl(Z) + '^\\circ\\approx ' + dg(rZ)) + ', and only then ' + t(nm + '=' + fx(sh.h, 1) + '\\sin ' + dg(rZ) + '=' + fl(y) + '\\ldots\\approx ' + fx(y, 1)) + ' — ' + t(Math.abs(rd(y, 1) - rd(Math.sqrt(sh.h * sh.h - sh.l * sh.l), 1)).toFixed(1)) + ' off the true ' + t(fx(Math.sqrt(sh.h * sh.h - sh.l * sh.l), 1)) + '.',
              ['Round the angle to a whole degree, then use SOH with that rounded angle.'], 'route (c) rounded angle');
          } },
          { id: 'e8d', sub: 'd', level: 'PRG', make: function (r, sh) {
            return mc(r, 'Three routes to ' + t(seg(sh.Q, sh.R)) + ': (a) the Pythagorean theorem on the two given sides; (b) trigonometry with ' + t('\\angle ' + sh.P) + ' kept at full calculator precision; (c) trigonometry with ' + t('\\angle ' + sh.P) + ' rounded to the nearest degree first. Routes (a) and (b) give the same answer; route (c) gives a different tenths digit. Verdict: which routes are trustworthy, and why can’t the Pythagorean route drift?', [
              { html: '(a) and (b) are trustworthy, (c) is not. Pythagoras uses only the given lengths, so there is no intermediate value to round.', right: true },
              { html: 'Only (a): trigonometry always introduces some error.', why: 'Route (b) gave exactly the same answer as (a). Trigonometry is safe as long as nothing is rounded early.' },
              { html: 'All three: the differences are just rounding at the end.', why: 'Route (c) rounded the <b>angle</b> in the middle, and that changed the reported answer.' },
              { html: '(b) and (c) are trustworthy; (a) is not, because squaring loses accuracy.', why: 'Squaring is exact. Route (a) used only the given data — it is the one that cannot drift.' }],
              'Routes (a) and (b) agree; route (c) rounded the angle before using it and drifted. Pythagoras’ only inputs are the given lengths, so however the arithmetic is sequenced, the single rounding happens at the end. Trigonometry is equally safe only with the discipline of never rounding the angle.',
              ['Compare your three answers. Which one used a value rounded in the middle?'], 'verdict on three routes');
          } }] },
      { num: '9', stem: function (sh) {
          return 'In ' + t('\\triangle ' + sh.tri) + ' the right angle is at ' + t(sh.R) + ', ' + t('\\angle ' + sh.P + '=' + dg(sh.th)) + ' and the hypotenuse ' + t(seg(sh.P, sh.Q) + '=' + fx(sh.k, 1)) + '.' +
            triFig({ P: sh.P, Q: sh.Q, R: sh.R, th: sh.th, names: true, lab: { hyp: fx(sh.k, 1) }, angP: sh.th + '°' }, sh.ori);
        },
        shared: function (r) {
          var n = r.chance(0.2) ? { tri: 'PQR', R: 'Q', P: 'P', Q: 'R', th: 34, k: 58 } : (function () { var nn = pickTri(r); var g = gen(function () { return { th: r.int(25, 60), k: r.int(35, 70) }; }, function (o) {
            var a = o.k * T.cos(o.th), b = o.k * T.sin(o.th), a2 = Math.sqrt(o.k * o.k - rd(b, 1) * rd(b, 1)); return o.th !== 45 && safe(a, 1) && safe(b, 1) && fx(a, 1) === fx(a2, 1); }); nn.th = g.th; nn.k = g.k; return nn; })();
          n.ori = orient(r); return n;
        },
        parts: [
          { id: 'e9a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var A = seg(sh.P, sh.R), O = seg(sh.Q, sh.R), k = fx(sh.k, 1), th = dg(sh.th);
            return mc(r, 'Which set of expressions finds each unknown using <b>only</b> the given data ' + t(th) + ' and ' + t(k) + '?', [
              { html: t('\\angle ' + sh.Q + '=90^\\circ-' + th + ',\\ ' + A + '=' + k + '\\cos ' + th + ',\\ ' + O + '=' + k + '\\sin ' + th), right: true },
              { html: t('\\angle ' + sh.Q + '=90^\\circ-' + th + ',\\ ' + A + '=' + k + '\\sin ' + th + ',\\ ' + O + '=' + k + '\\cos ' + th), why: 'From ' + t(th) + ', ' + t(A) + ' touches the angle (adjacent ⇒ cos) and ' + t(O) + ' is across from it (opposite ⇒ sin).' },
              { html: t('\\angle ' + sh.Q + '=90^\\circ-' + th + ',\\ ' + O + '=' + k + '\\sin ' + th + ',\\ ' + A + '=\\sqrt{' + k + '^{2}-' + O + '^{2}}'), why: 'The last expression uses the unknown ' + t(O) + ' — once it is rounded, the error is passed on. Each unknown should come from ' + t(th) + ' and ' + t(k) + ' alone.' },
              { html: t('\\angle ' + sh.Q + '=180^\\circ-' + th + ',\\ ' + A + '=' + k + '\\cos ' + th + ',\\ ' + O + '=' + k + '\\sin ' + th), why: 'The two acute angles add to ' + t('90^\\circ') + ', not ' + t('180^\\circ') + '.' }],
              'Relative to ' + t('\\angle ' + sh.P) + ': ' + t(A) + ' is adjacent and ' + t(O) + ' is opposite, with hypotenuse ' + t(k) + '. Each expression contains only ' + t(th) + ' and ' + t(k) + ' — no unknown is defined from another unknown.',
              ['Look for expressions that contain only the two given numbers.'], 'expressions from given data');
          } },
          { id: 'e9b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var s = solveAS({ P: sh.P, Q: sh.Q, R: sh.R, th: sh.th, kRole: 'hyp', k: sh.k, dp: 1, unit: '', order: ['Q', 'adj', 'opp'] });
            return fieldsPart('Evaluate all three and solve the triangle (angles to the nearest degree, sides to the nearest tenth).', s.fields, s.sol, SOLVE_HINTS, 'solve ' + sh.tri + ': angle + hyp');
          } },
          { id: 'e9c', sub: 'c(i)', level: 'EMG', make: function (r, sh) {
            var O = seg(sh.Q, sh.R), A = seg(sh.P, sh.R), b = rd(sh.k * T.sin(sh.th), 1), v = Math.sqrt(sh.k * sh.k - b * b);
            return nearPart('A student finds ' + t(O) + ' first, rounds it to the nearest tenth, then gets ' + t(A) + ' from ' + t(A + '=\\sqrt{' + fx(sh.k, 1) + '^{2}-' + O + '^{2}}') + '. Carry that out: what does the student get for ' + t(A) + ' (nearest tenth)?', v, 1, '',
              [{ v: Math.sqrt(sh.k * sh.k + b * b), code: 'pyth-op', hint: t(A) + ' is a leg: subtract the squares.' }],
              t(O + '=' + fx(sh.k, 1) + '\\sin ' + dg(sh.th) + '\\approx ' + b.toFixed(1)) + ', then ' + t(A + '=\\sqrt{' + fx(sh.k, 1) + '^{2}-' + b.toFixed(1) + '^{2}}=\\sqrt{' + tr(sh.k * sh.k - b * b) + '}=' + fl(v) + '\\ldots\\approx ' + fx(v, 1)) + ' — the same tenth as the direct route this time.',
              ['First ' + t(O) + ' = hypotenuse × sin of the angle, rounded to a tenth. Then use it in the Pythagorean theorem.'], 'rounded-QR route');
          } },
          { id: 'e9d', sub: 'c(ii)', level: 'PRG', make: function (r, sh) {
            var O = seg(sh.Q, sh.R), A = seg(sh.P, sh.R), k = fx(sh.k, 1), b = rd(sh.k * T.sin(sh.th), 1).toFixed(1);
            return mc(r, 'A student found ' + t(O + '=' + k + '\\sin ' + dg(sh.th)) + ', rounded it to ' + t(b) + ', then got ' + t(A + '=\\sqrt{' + k + '^{2}-' + b + '^{2}}\\approx ' + fx(sh.k * T.cos(sh.th), 1)) + ' — the same tenth as the direct answer ' + t(A + '=' + k + '\\cos ' + dg(sh.th)) + ' this time. Why is the method still the wrong habit?', [
              { html: 'The rounding error just happened not to cross a tenth boundary — luck, not method. With other numbers the same move changes the answer.', right: true },
              { html: 'It isn’t wrong: agreeing once proves the method is reliable.', why: 'With other numbers, building on a rounded value shifts the answer by ' + t('0.1') + ' or more — nothing in the working warns you when.' },
              { html: 'Pythagoras should never be used after trigonometry.', why: 'Pythagoras is fine — on <b>given</b> lengths. The problem is feeding it a rounded value.' },
              { html: 'It takes more keystrokes, so it is more likely to have a typing slip.', why: 'Keystrokes aren’t the issue: a rounded number has already thrown information away.' }],
              'The rounded value was off by only a few hundredths, too little to change the tenths digit here. Nothing in the working tells you in advance which case you are in, so the safe habit is to take every unknown from the original data every time.',
              ['Is there anything in the working that guarantees the rounding error stays too small to change the tenths digit?'], 'why still a bad habit');
          } }] },
      /* ---------- Part D ---------- */
      { num: '10', section: 'Extra practice D — The three self-checks', stem: function (sh) {
          var rows = [['Student', t(seg(sh.n.P, sh.n.Q)), t('\\angle ' + sh.n.P), t('\\angle ' + sh.n.Q)]].concat(sh.order.map(function (s) { var x = sh.subs[s]; return [s, t(x.hyp), t(dg(x.p)), t(dg(x.q))]; }));
          return 'In ' + t('\\triangle ' + sh.n.tri) + ' the right angle is at ' + t(sh.n.R) + ', with ' + t(seg(sh.n.P, sh.n.R) + '=' + sh.a.toFixed(1)) + ' and ' + t(seg(sh.n.Q, sh.n.R) + '=' + sh.b.toFixed(1)) + '. Four students each hand in a solved triangle. Exactly one is correct.' +
            '<div style="overflow-x:auto"><table class="vtab">' + rows.map(function (rw, i) { return '<tr>' + rw.map(function (c) { return i ? '<td>' + c + '</td>' : '<th>' + c + '</th>'; }).join('') + '</tr>'; }).join('') + '</table></div>' +
            '<small>Checks: (i) the angles sum to ' + t('180^\\circ') + '; (ii) the longest side faces the largest angle, the shortest side the smallest; (iii) the hypotenuse is longer than both legs.</small>';
        },
        shared: function (r) {
          var bkv = r.chance(0.2), n = bkv ? { tri: 'ABC', R: 'B', P: 'A', Q: 'C' } : pickTri(r);
          var tri = bkv ? [12, 35] : r.pick([[12, 35], [7, 24], [9, 40], [8, 15], [20, 21], [10, 24], [12, 16], [15, 36], [16, 30], [11, 60]]);
          var sw = !bkv && r.chance(0.5), a = sw ? tri[1] : tri[0], b = sw ? tri[0] : tri[1]; // a = adjacent to P, b = opposite P
          var hyp = Math.hypot(a, b), P = rd(T.atan(b / a), 0), Q = 90 - P, big = Math.max(P, Q), bad = rd(Math.sqrt(Math.abs(b * b - a * a)), 0);
          var subs = { sum: { hyp: hyp.toFixed(1), p: big, q: big }, hyp: { hyp: bad.toFixed(1), p: P, q: Q }, swap: { hyp: hyp.toFixed(1), p: Q, q: P }, ok: { hyp: hyp.toFixed(1), p: P, q: Q } };
          var kinds = bkv ? ['sum', 'hyp', 'swap', 'ok'] : r.shuffle(['sum', 'hyp', 'swap', 'ok']), names = ['Wren', 'Beau', 'Nadia', 'Omar'], map = {}, kindOf = {};
          names.forEach(function (s, i) { map[s] = subs[kinds[i]]; kindOf[s] = kinds[i]; });
          return { n: n, a: a, b: b, hyp: hyp, P: P, Q: Q, subs: map, kind: kindOf, order: names };
        },
        parts: [
          { id: 'e10a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var accept = { sum: ['i'], hyp: ['ii', 'iii'], swap: ['ii'], ok: ['ok'] }, keyK = { sum: 'i', hyp: 'iii', swap: 'ii', ok: 'ok' }, key = {};
            sh.order.forEach(function (s) { key[s] = keyK[sh.kind[s]]; });
            var hyp = seg(sh.n.P, sh.n.Q), why = {
              sum: function (s) { return 'Add ' + s + '’s three angles.'; },
              hyp: function (s) { return s + '’s angles add to ' + t('180^\\circ') + ' — but compare ' + t(hyp) + ' with the legs.'; },
              swap: function (s) { return s + '’s angles add to ' + t('180^\\circ') + ' and ' + t(hyp) + ' is the longest side. Which acute angle should face the <b>longer</b> leg?'; },
              ok: function (s) { return 'Run all three checks on ' + s + '’s triangle — it passes every one.'; } };
            return { prompt: 'For each submission, choose the check that catches it (or “correct”).', input: { type: 'grid', rows: sh.order.map(function (s) { return { id: s, html: s }; }), cols: [{ id: 'ok', html: 'Correct' }, { id: 'i', html: 'Fails (i)' }, { id: 'ii', html: 'Fails (ii)' }, { id: 'iii', html: 'Fails (iii)' }], multi: false },
              check: function (resp) {
                resp = resp || {}; var miss = sh.order.filter(function (s) { return !resp[s]; });
                if (miss.length === sh.order.length) return form('empty', 'Fill in the table first.');
                if (miss.length) return form('incomplete', 'Finish every row (' + (sh.order.length - miss.length) + ' of 4 done).');
                var bad = sh.order.filter(function (s) { return accept[sh.kind[s]].indexOf(resp[s]) < 0; });
                if (!bad.length) return ok();
                return wrong('self-check', why[sh.kind[bad[0]]](bad[0]) + ' (' + (4 - bad.length) + ' of 4 correct.)');
              }, key: key, answer: sh.order.map(function (s) { var k = sh.kind[s]; return s + ': ' + (k === 'ok' ? 'correct' : k === 'hyp' ? 'fails (iii) (and (ii))' : 'fails (' + keyK[k] + ')'); }).join('<br>'),
              solution: 'Correct values: ' + t(hyp + '=\\sqrt{' + sh.a + '^2+' + sh.b + '^2}=' + sh.hyp.toFixed(1)) + ', ' + t('\\angle ' + sh.n.P + '=' + dg(sh.P)) + ', ' + t('\\angle ' + sh.n.Q + '=' + dg(sh.Q)) + '.<br>' + sh.order.map(function (s) {
                var k = sh.kind[s], x = sh.subs[s];
                return '<b>' + s + '</b>: ' + (k === 'ok' ? 'correct — passes all three.' : k === 'sum' ? 'check (i) fails: ' + t(dg(x.p) + '+' + dg(x.q) + '+90^\\circ=' + dg(x.p + x.q + 90)) + '. (Passes (iii).)' :
                  k === 'hyp' ? 'check (iii) fails: the hypotenuse ' + t(x.hyp) + ' is shorter than the leg ' + t(Math.max(sh.a, sh.b).toFixed(1)) + ' (so (ii) fails too). Passes (i).' : 'check (ii) fails: the acute angles are swapped — the larger angle must face the longer leg. Passes (i) and (iii).');
              }).join('<br>'), hints: ['Run each check on each row: add the angles; compare the hypotenuse with the legs; match the larger angle with the longer leg.'], text: 'which check catches each', tries: 3 };
          } },
          { id: 'e10b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var A = seg(sh.n.P, sh.n.R), B = seg(sh.n.Q, sh.n.R), H = seg(sh.n.P, sh.n.Q), sm = sh.a < sh.b ? A : B, lg = sh.a < sh.b ? B : A, sa = Math.min(sh.P, sh.Q), la = Math.max(sh.P, sh.Q);
            var saN = sh.P < sh.Q ? sh.n.P : sh.n.Q, laN = sh.P < sh.Q ? sh.n.Q : sh.n.P;
            var smV = Math.min(sh.a, sh.b).toFixed(1), lgV = Math.max(sh.a, sh.b).toFixed(1);
            return mc(r, 'Run check (ii) on the correct submission. Which pairing is right?', [
              { html: t(sm + '=' + smV + '<' + lg + '=' + lgV + '<' + H + '=' + sh.hyp.toFixed(1)) + ' face ' + t('\\angle ' + saN + '=' + dg(sa) + '<\\angle ' + laN + '=' + dg(la) + '<90^\\circ'), right: true },
              { html: t(sm + '=' + smV + '<' + lg + '=' + lgV + '<' + H + '=' + sh.hyp.toFixed(1)) + ' face ' + t('\\angle ' + laN + '=' + dg(la) + ',\\ \\angle ' + saN + '=' + dg(sa) + ',\\ 90^\\circ'), why: 'Each side faces the angle <b>across</b> from it. ' + t(sm) + ' is across from ' + t('\\angle ' + saN) + '.' },
              { html: 'The hypotenuse ' + t(H) + ' faces the smallest angle.', why: 'The hypotenuse is across from the right angle — the largest.' },
              { html: 'Check (ii) can’t be run without a protractor.', why: 'It only needs the numbers: list the sides in order and the angles across from them.' }],
              'Sides in increasing order ' + t(smV + '<' + lgV + '<' + sh.hyp.toFixed(1)) + ' face ' + t(dg(sa) + '<' + dg(la) + '<90^\\circ') + ' — increasing together ✓', ['A side “faces” the angle at the opposite vertex.'], 'run check (ii)');
          } },
          { id: 'e10c', sub: 'c', level: 'PRG', make: function (r, sh) {
            return mc(r, 'Why is check (iii) really a special case of check (ii)?', [
              { html: 'The right angle is the largest angle, so by (ii) the side facing it — the hypotenuse — must be the longest side.', right: true },
              { html: 'Both checks use the Pythagorean theorem.', why: 'Neither check uses the theorem: they compare sizes of sides and angles.' },
              { html: 'Check (iii) only works when the legs are equal.', why: 'It works for every right triangle.' },
              { html: 'Because the angles always add to ' + t('180^\\circ') + '.', why: 'That is check (i). Think about which angle is the largest.' }],
              'The other two angles are acute and add to ' + t('90^\\circ') + ', so the right angle is the largest. Check (ii) says the largest angle faces the longest side; the side facing the right angle is the hypotenuse — exactly check (iii).',
              ['Which angle is the largest in a right triangle, and which side faces it?'], 'check iii from check ii');
          } }] },
      /* ---------- Part E ---------- */
      { num: '11', section: 'Extra practice E — Solve it completely: applied triangles', stem: function (sh) {
          return '<b>Roof truss.</b> A symmetric roof truss spans ' + t(sh.span.toFixed(1) + '\\text{ m}') + ' from wall to wall and rises ' + t(sh.rise.toFixed(1) + '\\text{ m}') + ' from the top of the walls to the peak. A vertical king post joins the peak to the midpoint of the span, cutting the truss into two identical right triangles.';
        },
        shared: function (r) {
          return r.chance(0.2) ? { span: 9.6, rise: 2.8 } : gen(function () { return { span: 2 * dec(r, 3.5, 6.5), rise: dec(r, 1.8, 3.8) }; }, function (o) { var h = o.span / 2, a = T.atan(o.rise / h); return Math.abs(a - 45) > 5 && safe(Math.hypot(h, o.rise), 1) && safe(a, 0) && Math.abs(rd(o.span, 1) - o.span) < 1e-9; });
        },
        parts: [
          { id: 'e11a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var h = sh.span / 2, ri = sh.rise, hs = rd(h, 1).toFixed(1) + ' m', rs = ri.toFixed(1) + ' m', sp = sh.span.toFixed(1) + ' m', base = { W: [0, 0], M: [h, 0], P: [h, ri] };
            var f = function (segs) { return sketch({ pts: base, segs: segs, right: [['M', 'W', 'P']], names: false }); };
            return mc(r, 'Which sketch of the half-truss is labelled correctly?', [
              { html: f([['W', 'M', hs], ['M', 'P', rs], ['W', 'P', 'rafter']]), right: true },
              { html: f([['W', 'M', sp], ['M', 'P', rs], ['W', 'P', 'rafter']]), why: 'The king post meets the <b>midpoint</b> of the span: the bottom of each half-truss is half of ' + t(sh.span.toFixed(1)) + '.' },
              { html: f([['W', 'M', hs], ['M', 'P', 'post'], ['W', 'P', rs]]), why: 'The rise is the vertical king post, not the sloping rafter.' },
              { html: f([['W', 'M', rs], ['M', 'P', hs], ['W', 'P', 'rafter']]), why: 'The rise is vertical (up the king post) and the half-span is horizontal.' }],
              'Each half-truss has a horizontal leg of ' + t(sh.span.toFixed(1) + '\\div 2=' + rd(h, 1).toFixed(1) + '\\text{ m}') + ', a vertical king post of ' + t(ri.toFixed(1) + '\\text{ m}') + ', and the rafter as hypotenuse, with the right angle where the king post meets the span.',
              ['Where does the king post meet the span? What length is left on each side?'], 'half-truss sketch');
          } },
          { id: 'e11b', sub: 'b', level: 'ADV', make: function (r, sh) {
            var h = sh.span / 2, ri = sh.rise, raf = Math.hypot(h, ri), W = T.atan(ri / h), hS = rd(h, 1).toFixed(1), rS = ri.toFixed(1);
            var ac = angleCalc('opp', ri, rS, 'adj', h, hS, 'W', '\\angle W', 0);
            return fieldsPart('Solve the half-truss completely: the rafter length (nearest tenth of a metre), the pitch angle at the wall, and the angle at the peak (nearest degree).', [
              { tex: '\\text{rafter}', name: 'Rafter', x: raf, dp: 1, unit: 'm', alts: [{ v: Math.hypot(sh.span, ri), code: 'no-half', hint: 'Each right triangle has only <b>half</b> the span as its horizontal leg.' }, { v: Math.sqrt(Math.abs(h * h - ri * ri)), code: 'pyth-op', hint: 'The rafter is the hypotenuse: add the squares of the legs.' }] },
              { tex: '\\text{pitch}', name: 'Pitch at the wall', x: W, dp: 0, unit: '°', alts: [{ v: T.atan(ri / sh.span), code: 'no-half', hint: 'Use half the span as the adjacent side.' }].concat(ac.alts) },
              { tex: '\\text{peak angle}', name: 'Angle at the peak', x: 90 - W, dp: 0, unit: '°', alts: [{ v: 2 * (90 - W), code: 'whole-peak', hint: 'For this half-truss we want the angle at the peak <b>inside one right triangle</b> (half the full peak angle).' }, { v: 180 - W, code: 'angle-180', hint: ACUTE90 }, { v: W, code: 'other-angle', hint: 'That is the pitch at the wall. The angle at the peak is the other acute angle.' }] }],
              'Half-span ' + t(sh.span.toFixed(1) + '\\div 2=' + hS) + ', king post ' + t(rS) + '.<br>' + t('\\text{rafter}=\\sqrt{' + hS + '^2+' + rS + '^2}=\\sqrt{' + tr(h * h + ri * ri) + '}=' + fl(raf) + '\\ldots\\approx ' + fx(raf, 1) + '\\text{ m}') + '<br>Pitch: ' + t(ac.work) + '<br>Peak: ' + t('90^\\circ-' + fl(W) + '^\\circ=' + fl(90 - W) + '^\\circ\\approx ' + dg(fx(90 - W, 0))) + '<br>Check: ' + t(dg(fx(W, 0)) + '+' + dg(fx(90 - W, 0)) + '+90^\\circ=180^\\circ') + ' ✓',
              ['Work in one half: legs ' + t(hS) + ' (half the span) and ' + t(rS) + ' (the king post).', 'Rafter by Pythagoras; pitch at the wall: the king post is opposite, the half-span adjacent.'], 'half-truss solve');
          } }] },
      { num: '12', stem: function (sh) { return '<b>Ramp.</b> A loading ramp rises ' + t(sh.rise.toFixed(2) + '\\text{ m}') + ' from the ground to a doorway sill. The sloping ramp surface itself is ' + t(sh.L.toFixed(1) + '\\text{ m}') + ' long. Consider the right triangle formed by the ground, the vertical rise and the ramp surface.'; },
        shared: function (r) {
          return r.chance(0.2) ? { rise: 0.85, L: 10.2 } : gen(function () { return { rise: r.int(10, 20) * 0.05, L: dec(r, 8, 14) }; }, function (o) { var run = Math.sqrt(o.L * o.L - o.rise * o.rise), a = T.asin(o.rise / o.L); return fx(run, 1) === o.L.toFixed(1) && safe(run, 1) && safe(a, 0) && rd(a, 0) >= 3; });
        },
        parts: [
          { id: 'e12a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var run = Math.sqrt(sh.L * sh.L - sh.rise * sh.rise), a = T.asin(sh.rise / sh.L), ac = angleCalc('opp', sh.rise, sh.rise.toFixed(2), 'hyp', sh.L, sh.L.toFixed(1), '\\theta', '\\theta', 0);
            return fieldsPart('Solve the triangle completely: the horizontal run (nearest tenth of a metre), the angle at the ground and the angle at the top (nearest degree).', [
              { tex: '\\text{run}', name: 'Run', x: run, dp: 1, unit: 'm', alts: [{ v: Math.hypot(sh.L, sh.rise), code: 'pyth-op', hint: 'The ramp surface is the hypotenuse; the run is a leg, so subtract the squares.' }] },
              { tex: '\\text{ground angle}', name: 'Angle at the ground', x: a, dp: 0, unit: '°', alts: ac.alts },
              { tex: '\\text{top angle}', name: 'Angle at the top', x: 90 - a, dp: 0, unit: '°', alts: [{ v: a, code: 'other-angle', hint: 'That is the angle at the ground. The angle at the top (between the ramp and the vertical) is the other acute angle.' }, { v: 180 - a, code: 'angle-180', hint: ACUTE90 }] }],
              t('\\text{run}=\\sqrt{' + sh.L.toFixed(1) + '^2-' + sh.rise.toFixed(2) + '^2}=\\sqrt{' + tr(sh.L * sh.L - sh.rise * sh.rise) + '}=' + fl(run) + '\\ldots\\approx ' + fx(run, 1) + '\\text{ m}') + '<br>Ground angle: ' + t(ac.work) + '<br>Top angle: ' + t('90^\\circ-' + fl(a) + '^\\circ\\approx ' + dg(fx(90 - a, 0))),
              ['The ramp surface is the hypotenuse and the rise is opposite the ground angle.', 'Run by Pythagoras (a leg: subtract); ground angle by ' + t('\\sin^{-1}') + '; the top angle is ' + t('90^\\circ') + ' minus it.'], 'ramp solve');
          } },
          { id: 'e12b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var run = Math.sqrt(sh.L * sh.L - sh.rise * sh.rise);
            return mc(r, 'Rounded to the nearest tenth, the run and the ramp surface are both ' + t(sh.L.toFixed(1) + '\\text{ m}') + ' — yet the hypotenuse must be longer than both legs. How is that possible?', [
              { html: 'The true run is ' + t(fl(run) + '\\ldots\\text{ m}') + ', a little shorter than the ramp; rounding hides a difference smaller than a tenth. Rounded values that tie need not be equal.', right: true },
              { html: 'Check (iii) doesn’t apply to very flat triangles.', why: 'It applies to every right triangle. Look at the unrounded run.' },
              { html: 'The run should have been rounded down to make it shorter.', why: 'Rounding follows the next digit, not the answer you want. The fix is to look at the unrounded value.' },
              { html: 'The ramp must not be a right triangle.', why: 'Ground and vertical rise meet at a right angle. The tie is a rounding effect.' }],
              'The run is ' + t(fl(run) + '\\ldots') + ' and the ramp is exactly ' + t(sh.L.toFixed(1)) + ', so the hypotenuse is longer, by about ' + t(((sh.L - run) * 100).toFixed(1) + '\\text{ cm}') + '. Check (iii) is about the <b>true</b> lengths; a rounded answer is a report, not a measurement — never feed the rounded run back in as if it were exact.',
              ['Compare the unrounded run with the ramp length.'], 'rounded tie explained');
          } }] },
      { num: '13', stem: function (sh) { return '<b>Sail.</b> A triangular sail is right-angled at the <b>tack</b>, the bottom front corner. Its luff — the vertical front edge, from the tack up to the <b>head</b> — is ' + t(sh.luff.toFixed(1) + '\\text{ m}') + '. Its foot — the horizontal bottom edge, from the tack back to the <b>clew</b> — is ' + t(sh.foot.toFixed(1) + '\\text{ m}') + '. The leech is the third edge, joining the head to the clew.'; },
        shared: function (r) {
          return r.chance(0.2) ? { luff: 8.4, foot: 3.5 } : gen(function () { return { luff: dec(r, 6, 10), foot: dec(r, 2.5, 5) }; }, function (o) { var a = T.atan(o.foot / o.luff); return safe(a, 0) && safe(Math.hypot(o.luff, o.foot), 1); });
        },
        parts: [
          { id: 'e13a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var L = sh.luff, Fo = Math.max(sh.foot, 0.7 * L), ls = L.toFixed(1) + ' m', fs = sh.foot.toFixed(1) + ' m'; // sketches: the foot is drawn a little wider so labels don't collide
            var good = sketch({ pts: { T: [0, 0], H: [0, L], C: [Fo, 0] }, segs: [['T', 'H', ls], ['T', 'C', fs], ['H', 'C', 'leech']], right: [['T', 'H', 'C']], names: { T: 'tack', H: 'head', C: 'clew' } });
            var swapN = sketch({ pts: { T: [0, 0], H: [0, L], C: [Fo, 0] }, segs: [['T', 'H', ls], ['T', 'C', fs], ['H', 'C', 'leech']], right: [['T', 'H', 'C']], names: { T: 'tack', H: 'clew', C: 'head' } });
            var rtClew = sketch({ pts: { T: [0, 0], C: [Fo, 0], H: [Fo, L] }, segs: [['C', 'H', ls], ['T', 'C', fs], ['H', 'T', 'leech']], right: [['C', 'T', 'H']], names: { T: 'tack', H: 'head', C: 'clew' } });
            var luffLeech = sketch({ pts: { T: [0, 0], H: [0, L], C: [Fo, 0] }, segs: [['T', 'H', 'luff'], ['T', 'C', fs], ['H', 'C', ls]], right: [['T', 'H', 'C']], names: { T: 'tack', H: 'head', C: 'clew' } });
            return mc(r, 'Which sketch of the sail is labelled correctly?', [
              { html: good, right: true },
              { html: swapN, why: 'The head is at the <b>top</b> of the luff; the clew is at the back end of the foot.' },
              { html: rtClew, why: 'The right angle is at the <b>tack</b>, the bottom front corner, where the luff meets the foot.' },
              { html: luffLeech, why: 'The ' + t(L.toFixed(1) + '\\text{ m}') + ' is the luff (the vertical edge), not the leech.' }],
              'Right angle at the tack; the luff (' + t(L.toFixed(1)) + ') runs up to the head, the foot (' + t(sh.foot.toFixed(1)) + ') runs back to the clew, and the leech is the hypotenuse.', ['Start at the tack: the luff goes up, the foot goes back.'], 'sail sketch');
          } },
          { id: 'e13b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var L = sh.luff, Fo = sh.foot, le = Math.hypot(L, Fo), H = T.atan(Fo / L), ac = angleCalc('opp', Fo, Fo.toFixed(1), 'adj', L, L.toFixed(1), 'H', '\\angle H', 0);
            return fieldsPart('Solve the sail completely: the leech (nearest tenth of a metre) and the angles at the head and at the clew (nearest degree).', [
              { tex: '\\text{leech}', name: 'Leech', x: le, dp: 1, unit: 'm', alts: [{ v: Math.sqrt(Math.abs(L * L - Fo * Fo)), code: 'pyth-op', hint: 'The leech is the hypotenuse: add the squares of the luff and foot.' }] },
              { tex: '\\text{head angle}', name: 'Angle at the head', x: H, dp: 0, unit: '°', alts: ac.alts },
              { tex: '\\text{clew angle}', name: 'Angle at the clew', x: 90 - H, dp: 0, unit: '°', alts: [{ v: H, code: 'other-angle', hint: 'That is the angle at the head. At the clew, the luff is opposite and the foot is adjacent.' }, { v: 180 - H, code: 'angle-180', hint: ACUTE90 }] }],
              t('\\text{leech}=\\sqrt{' + L.toFixed(1) + '^2+' + Fo.toFixed(1) + '^2}=\\sqrt{' + tr(L * L + Fo * Fo) + '}=' + fl(le) + '\\ldots\\approx ' + fx(le, 1) + '\\text{ m}') + '<br>At the head: foot opposite, luff adjacent ⇒ TOA: ' + t(ac.work) + '<br>At the clew: ' + t('90^\\circ-' + fl(H) + '^\\circ\\approx ' + dg(fx(90 - H, 0))) + '<br>Check: ' + t(dg(fx(H, 0)) + '+' + dg(fx(90 - H, 0)) + '+90^\\circ=180^\\circ') + ' ✓',
              ['The leech is the hypotenuse (across from the right angle at the tack).', 'At the head, the foot is across from the angle and the luff touches it.'], 'sail solve');
          } }] },
      { num: '14', stem: function (sh) { return '<b>Surveyed plot corner.</b> A surveyor stands at corner ' + t('A') + ' of a rectangular lot. The boundary ' + t('AB') + ' runs ' + t(sh.ab.toFixed(1) + '\\text{ m}') + ' to corner ' + t('B') + ', where the lot turns through a right angle. Sighting across the lot from ' + t('A') + ' to the far corner ' + t('C') + ', the diagonal ' + t('AC') + ' makes an angle of ' + t(dg(sh.th)) + ' with the boundary ' + t('AB') + '.'; },
        shared: function (r) {
          return r.chance(0.2) ? { ab: 62.5, th: 37 } : gen(function () { return { ab: half(r, 40, 80), th: r.int(25, 55) }; }, function (o) {
            var bc = o.ab * T.tan(o.th), ac = o.ab / T.cos(o.th); return o.th !== 45 && safe(bc, 1) && safe(ac, 1) && fx(o.ab * bc, 1) !== fx(o.ab * rd(bc, 1), 1) && safe(o.ab * bc, 1); });
        },
        parts: [
          { id: 'e14a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var ab = sh.ab, th = sh.th, h = ab * T.tan(th), L = ab.toFixed(1) + ' m', A = th + '°', c2 = T.cos(th) * T.cos(th) * ab, s2 = T.cos(th) * T.sin(th) * ab;
            var base = { A: [0, 0], B: [ab, 0], C: [ab, h] };
            return mc(r, 'Which sketch of ' + t('\\triangle ABC') + ' is labelled correctly?', [
              { html: sketch({ pts: base, segs: [['A', 'B', L], ['B', 'C'], ['A', 'C']], right: [['B', 'A', 'C']], angles: [['A', 'B', 'C', A]] }), right: true },
              { html: sketch({ pts: base, segs: [['A', 'B', L], ['B', 'C'], ['A', 'C']], right: [['B', 'A', 'C']], angles: [['C', 'A', 'B', A]] }), why: 'The surveyor measures the angle at ' + t('A') + ', where she stands — between the boundary ' + t('AB') + ' and the diagonal ' + t('AC') + '.' },
              { html: sketch({ pts: { A: [0, 0], B: [ab, 0], C: [c2, s2] }, segs: [['A', 'B', L], ['B', 'C'], ['A', 'C']], right: [['C', 'A', 'B']], angles: [['A', 'B', 'C', A]] }), why: 'The lot turns through a right angle at corner ' + t('B') + ', so the right angle is at ' + t('B') + ' and the diagonal ' + t('AC') + ' is the hypotenuse.' },
              { html: sketch({ pts: base, segs: [['A', 'B'], ['B', 'C', L], ['A', 'C']], right: [['B', 'A', 'C']], angles: [['A', 'B', 'C', A]] }), why: 'The ' + t(ab.toFixed(1) + '\\text{ m}') + ' is the boundary ' + t('AB') + ', from ' + t('A') + ' to ' + t('B') + '.' }],
              'Right angle at ' + t('B') + '; ' + t('AB=' + ab.toFixed(1)) + '; the ' + t(dg(th)) + ' angle at ' + t('A') + ' between ' + t('AB') + ' and the diagonal ' + t('AC') + ' (the hypotenuse).', ['Where is the right angle? Where does the surveyor stand?'], 'lot sketch');
          } },
          { id: 'e14b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var s = solveAS({ P: 'A', Q: 'C', R: 'B', th: sh.th, kRole: 'adj', k: sh.ab, dp: 1, unit: 'm', order: ['Q', 'opp', 'hyp'] });
            return fieldsPart('Solve ' + t('\\triangle ABC') + ' completely (sides to the nearest tenth of a metre, angles to the nearest degree).', s.fields, s.sol, SOLVE_HINTS, 'lot solve');
          } },
          { id: 'e14c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var bc = sh.ab * T.tan(sh.th), A1 = sh.ab * bc, rb = rd(bc, 1), A2 = sh.ab * rb, ab = sh.ab.toFixed(1);
            return fieldsPart('The surveyor wants the area of the rectangular lot, to the nearest tenth of a square metre. Work it out twice: once from the <b>original</b> data, and once using the <b>rounded</b> ' + t('BC=' + rb.toFixed(1)) + '.', [
              { tex: '\\text{from original data}', name: 'From the original data', x: A1, dp: 1, unit: 'm²', alts: [{ v: A2, code: 'rounded-early', hint: 'That used the rounded ' + t('BC') + '. For this box, use ' + t(ab + '\\tan ' + dg(sh.th)) + ' at full precision.' }, { v: A1 / 2, code: 'half-area', hint: 'The lot is a <b>rectangle</b>: area = length × width, no ' + t('\\tfrac12') + '.' }] },
              { tex: '\\text{from rounded }BC', name: 'From the rounded BC', x: A2, dp: 1, unit: 'm²', alts: [{ v: A1, code: 'used-unrounded', hint: 'For this box use the rounded ' + t('BC=' + rb.toFixed(1)) + ', to see the difference.' }, { v: A2 / 2, code: 'half-area', hint: 'The lot is a rectangle: no ' + t('\\tfrac12') + '.' }] }],
              'Original data: ' + t('A=' + ab + '\\times(' + ab + '\\tan ' + dg(sh.th) + ')=' + ab + '\\times ' + fl(bc) + '=' + fl(A1) + '\\ldots\\approx ' + fx(A1, 1) + '\\text{ m}^2') + '<br>Rounded ' + t('BC') + ': ' + t(ab + '\\times ' + rb.toFixed(1) + '=' + tr(A2) + '\\approx ' + fx(A2, 1) + '\\text{ m}^2') + '<br>The rounding error in ' + t('BC') + ' (' + t(Math.abs(rb - bc).toFixed(4)) + ') is multiplied by ' + t(ab) + ' — big enough to show.',
              ['Rectangle area = ' + t('AB\\times BC') + '.', 'First box: ' + t('BC=' + ab + '\\tan ' + dg(sh.th)) + ' unrounded. Second box: ' + t('BC=' + rb.toFixed(1)) + '.'], 'lot area two ways');
          } },
          { id: 'e14d', sub: 'c (explain)', level: 'PRG', make: function (r, sh) {
            var ab = sh.ab.toFixed(1), bc = sh.ab * T.tan(sh.th), rb = rd(bc, 1), er = Math.abs(rb - bc).toFixed(4);
            return mc(r, 'The lot’s area is ' + t('AB\\times BC') + '. Using the rounded ' + t('BC=' + rb.toFixed(1)) + ' instead of the full-precision ' + t('BC=' + ab + '\\tan ' + dg(sh.th)) + ' changes the area’s tenths digit, even though ' + t('BC') + ' itself was off by less than ' + t('0.05\\text{ m}') + '. Why does multiplying by a large number turn an invisible rounding error into a visible one?', [
              { html: 'Multiplying by ' + t(ab) + ' multiplies the tiny error in ' + t('BC') + ' by ' + t(ab) + ' too, so it can reach the first decimal place.', right: true },
              { html: 'Multiplication is less accurate on a calculator than division.', why: 'The calculator multiplies exactly. The error was already in the rounded ' + t('BC') + '.' },
              { html: 'It doesn’t — the two areas only differ because of the final rounding.', why: 'The two areas differ before the final rounding, because one factor was already rounded.' },
              { html: 'Large numbers have more digits, so they round differently.', why: 'The size of the error matters, not the number of digits. Multiplying scales the error.' }],
              'Rounding ' + t('BC') + ' introduced an error of only ' + t(er + '\\text{ m}') + ' — invisible at the reported precision. Multiplying by ' + t(ab) + ' multiplies that error by ' + t(ab) + ', enough to change the tenths of the area. Round once, at the end.', ['If BC is off by 0.003, how far off is ' + t(ab) + ' × BC?'], 'error amplification');
          } }] },
      /* ---------- Part F: error analysis ---------- */
      { num: '15', section: 'Extra practice F — Error analysis', stem: function (sh) {
          var A = T.asin(sh.l / sh.h), rA = rd(A, 0);
          return 'In ' + t('\\triangle ABC') + ' the right angle is at ' + t('C') + ', the hypotenuse ' + t('AB=' + sh.h.toFixed(1)) + ' and the leg ' + t('BC=' + sh.l.toFixed(1)) + '. Asked for ' + t('AC') + ' to the nearest tenth, a student wrote<br>' +
            t('\\angle A=\\sin^{-1}\\!\\left(\\tfrac{' + sh.l.toFixed(1) + '}{' + sh.h.toFixed(1) + '}\\right)\\approx ' + dg(rA) + ',\\qquad AC=' + sh.h.toFixed(1) + '\\cos ' + dg(rA) + '=' + fx(sh.h * T.cos(rA), 1)) + '<br>The correct answer is ' + t(fx(Math.sqrt(sh.h * sh.h - sh.l * sh.l), 1)) + '.';
        },
        shared: function (r) {
          return r.chance(0.2) ? { h: 58, l: 25 } : gen(function () { return { h: dec(r, 35, 70), l: dec(r, 12, 30) }; }, function (g) {
            var A = T.asin(g.l / g.h), x = Math.sqrt(g.h * g.h - g.l * g.l), y = g.h * T.cos(rd(A, 0)); return g.l < g.h * 0.7 && safe(A, 0) && safe(A, 2) && safe(x, 1) && safe(y, 1) && fx(x, 1) !== fx(y, 1); });
        },
        parts: [
          { id: 'e15a', sub: 'a(i)', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Every keystroke the student made was correct. What is the error?', [
              { html: 'Rounding ' + t('\\angle A') + ' to a whole degree and then computing ' + t('AC') + ' with the rounded angle.', right: true },
              { html: 'Using cosine: ' + t('AC') + ' is opposite ' + t('\\angle A') + '.', why: t('AC') + ' touches ' + t('\\angle A') + ' — it is adjacent, so cosine is right.' },
              { html: 'Using ' + t('\\sin^{-1}') + ' for the angle: it should be ' + t('\\tan^{-1}') + '.', why: t('BC') + ' is opposite ' + t('\\angle A') + ' and ' + t('AB') + ' is the hypotenuse, so ' + t('\\sin^{-1}') + ' is right.' },
              { html: 'Rounding the final answer to a tenth.', why: 'The question asks for a tenth. The rounding that hurt happened earlier.' }],
              'The error is <b>rounding an intermediate value and then computing with it</b>: the angle was rounded before it was used to find a length.', ['The method and the ratios are fine. Which number on the page had already been rounded?'], 'name the error');
          } },
          { id: 'e15b', sub: 'a(ii)', level: 'EMG', make: function (r, sh) {
            var A = T.asin(sh.l / sh.h), ac = angleCalc('opp', sh.l, sh.l.toFixed(1), 'hyp', sh.h, sh.h.toFixed(1), 'A', '\\angle A', 2);
            return nearPart('Give the unrounded value of ' + t('\\angle A') + ' that the student threw away, to the nearest <b>hundredth</b> of a degree.', A, 2, '°', ac.alts,
              t(ac.work.replace(/\\approx [\d.]+\^\\circ$/, '\\approx ' + fx(A, 2) + '^\\circ')) + ' — rounding to ' + t(dg(rd(A, 0))) + ' moved it by ' + t(Math.abs(A - rd(A, 0)).toFixed(4) + '^\\circ') + '.',
              ['Use ' + t('\\sin^{-1}\\!\\left(\\tfrac{' + sh.l.toFixed(1) + '}{' + sh.h.toFixed(1) + '}\\right)') + ' and keep two decimals.'], 'unrounded angle');
          } },
          { id: 'e15c', sub: 'b', level: 'EMG', make: function (r, sh) {
            var x = Math.sqrt(sh.h * sh.h - sh.l * sh.l);
            return nearPart('Find the correct ' + t('AC') + ' by a route that never uses an angle at all (nearest tenth).', x, 1, '', [{ v: Math.hypot(sh.h, sh.l), code: 'pyth-op', hint: t('AC') + ' is a leg: subtract the squares.' }, { v: sh.h * T.cos(rd(T.asin(sh.l / sh.h), 0)), code: 'rounded-early', hint: 'That is the student’s answer. Use only the two given lengths.' }],
              t('AC=\\sqrt{' + sh.h.toFixed(1) + '^2-' + sh.l.toFixed(1) + '^2}=\\sqrt{' + tr(sh.h * sh.h - sh.l * sh.l) + '}=' + fl(x) + '\\ldots\\approx ' + fx(x, 1)), ['Pythagorean theorem: the unknown is a leg.'], 'AC by Pythagoras');
          } },
          { id: 'e15d', sub: 'c', level: 'EMG', make: function (r, sh) {
            var A = T.asin(sh.l / sh.h), x = sh.h * T.cos(A);
            return nearPart('Repeat the student’s trigonometric route, but keep <b>full calculator precision</b> in ' + t('\\angle A') + '. What do you get for ' + t('AC') + ' (nearest tenth)?', x, 1, '', [{ v: sh.h * T.cos(rd(A, 0)), code: 'rounded-early', hint: 'That still uses the rounded angle. Store the full value of ' + t('\\angle A') + ' (or use ANS) and use it directly.' }, { v: sh.h * T.sin(A), code: 'wrong-ratio', hint: t('AC') + ' is adjacent to ' + t('\\angle A') + ' ⇒ cosine.' }],
              t('AC=' + sh.h.toFixed(1) + '\\cos(' + fl(A) + '^\\circ)=' + fl(x) + '\\ldots\\approx ' + fx(x, 1)) + ' — exactly the Pythagoras answer. So the trig route is fine; the fault is entirely in the early rounding.',
              ['Use the stored, unrounded angle in ' + t('AC=' + sh.h.toFixed(1) + '\\cos A') + '.'], 'trig route full precision');
          } },
          { id: 'e15e', sub: 'd', level: 'PRG', make: function (r, sh) {
            return mc(r, 'Which of the three self-checks catches this error?', [
              { html: 'None of them: the student’s triangle passes all three.', right: true },
              { html: '(i) the angle sum', why: 'The student’s angles still add to ' + t('180^\\circ') + '.' },
              { html: '(ii) longest side faces largest angle', why: 'The sides and angles are still in the right order — the error is only a tenth.' },
              { html: '(iii) hypotenuse longer than both legs', why: 'The hypotenuse is still the longest side.' }],
              '<b>None.</b> The self-checks catch <b>blunders</b> that make an impossible triangle. Drift from early rounding makes a triangle that very nearly could exist, so no check flags it. It has to be <b>prevented</b> by taking every unknown from the original data.', ['Run each check on the student’s numbers.'], 'self-checks miss drift');
          } }] },
      { num: '16', stem: function (sh) {
          var P = 90 - sh.th, NP = sh.k * T.tan(sh.th), MP = sh.k * T.cos(sh.th);
          return 'In ' + t('\\triangle MNP') + ' the right angle is at ' + t('N') + ', ' + t('MN=' + sh.k.toFixed(1)) + ' and ' + t('\\angle M=' + dg(sh.th)) + '. Asked to solve the triangle, a student reported<br>' + t('\\angle P=' + dg(P) + ',\\quad NP=' + fx(NP, 1) + ',\\quad MP=' + sh.k.toFixed(1) + '\\cos ' + dg(sh.th) + '=' + fx(MP, 1)) +
            triFig({ P: 'M', Q: 'P', R: 'N', th: sh.th, names: true, lab: { adj: sh.k.toFixed(1) }, angP: sh.th + '°' }, sh.ori);
        },
        shared: function (r) {
          var o = r.chance(0.2) ? { k: 24, th: 58 } : gen(function () { return { k: dec(r, 12, 35), th: r.int(50, 68) }; }, function (o) { return safe(o.k * T.tan(o.th), 1) && safe(o.k / T.cos(o.th), 1) && safe(o.k * T.cos(o.th), 1); });
          o.ori = orient(r); return o;
        },
        parts: [
          { id: 'e16a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var MP = fx(sh.k * T.cos(sh.th), 1);
            return mc(r, 'One self-check kills this answer instantly. Which one?', [
              { html: '(iii): the hypotenuse ' + t('MP=' + MP) + ' is shorter than the legs ' + t(sh.k.toFixed(1)) + ' and ' + t(fx(sh.k * T.tan(sh.th), 1)) + '.', right: true },
              { html: '(i): the angles don’t add to ' + t('180^\\circ') + '.', why: t(dg(sh.th) + '+' + dg(90 - sh.th) + '+90^\\circ=180^\\circ') + ' — that check passes.' },
              { html: '(ii): ' + t('\\angle P') + ' should be larger than ' + t('\\angle M') + '.', why: t('\\angle M=' + dg(sh.th)) + ' is the larger acute angle and it faces the longer leg ' + t('NP') + ' — that part is fine.' },
              { html: 'None — the answer could be right.', why: 'Which side is the hypotenuse? Compare it with the legs.' }],
              t('MP') + ' faces the right angle at ' + t('N') + ', so it is the hypotenuse — yet ' + t(MP + '<' + sh.k.toFixed(1)) + '. No such triangle exists; check (iii) fails.', ['Which side faces the right angle?'], 'check that kills it');
          } },
          { id: 'e16b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var k = sh.k.toFixed(1), c = '\\cos ' + dg(sh.th);
            return mc(r, 'Name the student’s error and give the correct rearrangement for ' + t('MP') + '.', [
              { html: 'Multiplied by the cosine instead of dividing: ' + t('MP=\\dfrac{' + k + '}{' + c + '}'), right: true },
              { html: 'Used the wrong ratio: ' + t('MP=' + k + '\\sin ' + dg(sh.th)), why: 'Cosine is right — ' + t('MN') + ' is adjacent and ' + t('MP') + ' is the hypotenuse. The rearranging is wrong.' },
              { html: 'Used the wrong angle: ' + t('MP=' + k + '\\cos ' + dg(90 - sh.th)), why: 'The given ' + t(dg(sh.th)) + ' at ' + t('M') + ' is the right angle to use; the problem is multiplying by the cosine.' },
              { html: 'Should have used tangent: ' + t('MP=' + k + '\\tan ' + dg(sh.th)), why: 'Tangent uses two legs; ' + t('MP') + ' is the hypotenuse.' }],
              'Relative to ' + t('\\angle M') + ': ' + t('MN=' + k) + ' is adjacent and ' + t('MP') + ' is the hypotenuse: ' + t(c + '=\\dfrac{' + k + '}{MP}\\Rightarrow MP=\\dfrac{' + k + '}{' + c + '}') + '. Multiplying by a cosine (less than 1) always shrinks a length — that is why the “hypotenuse” came out shorter than a leg.',
              ['In ' + t(c + '=\\dfrac{' + k + '}{MP}') + ', where is ' + t('MP') + '?'], 'multiplied instead of divided');
          } },
          { id: 'e16c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var s = solveAS({ P: 'M', Q: 'P', R: 'N', th: sh.th, kRole: 'adj', k: sh.k, dp: 1, unit: '', order: ['Q', 'opp', 'hyp'] });
            return fieldsPart('Solve ' + t('\\triangle MNP') + ' correctly and completely from the original data.', s.fields, s.sol, SOLVE_HINTS, 'MNP corrected');
          } },
          { id: 'e16d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var NP = fx(sh.k * T.tan(sh.th), 1);
            return mc(r, 'Before touching a calculator, how could a student predict that ' + t('MP') + ' must be bigger than ' + t(NP) + '?', [
              { html: t('MP') + ' is the hypotenuse, and the hypotenuse is longer than <b>both</b> legs (including ' + t('NP=' + NP) + ').', right: true },
              { html: t('MP') + ' is opposite the larger acute angle.', why: t('MP') + ' is opposite the <b>right</b> angle at ' + t('N') + '.' },
              { html: 'Cosine is always bigger than tangent.', why: 'Not true for these angles — and the prediction needs no trig at all, only the side names.' },
              { html: 'It can’t be predicted without calculating.', why: 'The side names alone tell you: which side faces the right angle?' }],
              t('MP') + ' faces the right angle, so it is the hypotenuse, and the hypotenuse is longer than both legs — so ' + t('MP>' + NP) + ' before any calculation.', ['Name the side across from the right angle.'], 'predict MP > NP');
          } }] },
      { num: '17', stem: function (sh) {
          return 'In ' + t('\\triangle GHJ') + ' the right angle is at ' + t('H') + ', ' + t('\\angle G=' + dg(sh.th)) + ' and the hypotenuse ' + t('GJ=' + sh.k.toFixed(1)) + '. A student began<br>' + t('\\angle G+\\angle H+\\angle J=90^\\circ\\ \\Rightarrow\\ \\angle J=90^\\circ-90^\\circ-' + dg(sh.th) + '=-' + dg(sh.th)) + '<br>and, deciding the minus sign was a slip, reported ' + t('\\angle J=' + dg(sh.th)) + '.' +
            triFig({ P: 'G', Q: 'J', R: 'H', th: sh.th, names: true, lab: { hyp: sh.k.toFixed(1) }, angP: sh.th + '°' }, sh.ori);
        },
        shared: function (r) {
          var o = r.chance(0.2) ? { k: 30, th: 26 } : gen(function () { return { k: dec(r, 18, 40), th: r.int(18, 40) }; }, function (o) { return safe(o.k * T.sin(o.th), 1) && safe(o.k * T.cos(o.th), 1); });
          o.ori = orient(r); return o;
        },
        parts: [
          { id: 'e17a', sub: 'a', level: 'EMG', make: function (r, sh) {
            return mc(r, 'What is the error, and where does “the two acute angles add to ' + t('90^\\circ') + '” come from?', [
              { html: 'The angles of <b>any</b> triangle add to ' + t('180^\\circ') + '. With ' + t('\\angle H=90^\\circ') + ', ' + t('\\angle G+\\angle J=180^\\circ-90^\\circ=90^\\circ') + ' — true only because one angle is ' + t('90^\\circ') + '.', right: true },
              { html: 'The angles of a right triangle add to ' + t('90^\\circ') + '; the student just subtracted in the wrong order.', why: 'All three angles of every triangle add to ' + t('180^\\circ') + ' — including the right angle itself.' },
              { html: 'Only the minus sign was wrong, so ' + t('\\angle J=' + dg(sh.th)) + ' is correct.', why: 'Try check (i): ' + t(dg(sh.th) + '+' + dg(sh.th) + '+90^\\circ\\ne 180^\\circ') + '.' },
              { html: 'Acute angles always add to ' + t('90^\\circ') + ' in every triangle.', why: 'In a triangle with a ' + t('40^\\circ') + ' angle, the other two add to ' + t('140^\\circ') + '. The ' + t('90^\\circ') + ' rule needs a right angle.' }],
              'The angle sum was misremembered as ' + t('90^\\circ') + '; every triangle’s angles add to ' + t('180^\\circ') + '. With ' + t('\\angle H=90^\\circ') + ': ' + t('\\angle G+\\angle J=90^\\circ') + ' — a consequence of the ' + t('180^\\circ') + ' rule that holds only in a right triangle.',
              ['What do the three angles of any triangle add to?'], 'angle-sum error');
          } },
          { id: 'e17b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var s = solveAS({ P: 'G', Q: 'J', R: 'H', th: sh.th, kRole: 'hyp', k: sh.k, dp: 1, unit: '', order: ['Q', 'opp', 'adj'] });
            return fieldsPart('Solve ' + t('\\triangle GHJ') + ' completely and correctly.', s.fields, s.sol, SOLVE_HINTS, 'GHJ corrected');
          } },
          { id: 'e17c', sub: 'c', level: 'PRG', make: function (r, sh) {
            return mc(r, 'The student’s wrong answer, ' + t(dg(sh.th)) + ', happens to equal ' + t('\\angle G') + '. Why does that make this error unusually dangerous?', [
              { html: 'It looks plausible — a familiar number copied from the page — so it is easy to miss, even though angles of ' + t(dg(sh.th) + ',\\ ' + dg(sh.th) + ',\\ 90^\\circ') + ' can’t make a triangle.', right: true },
              { html: 'It isn’t dangerous: an isosceles right triangle has two equal acute angles.', why: 'That needs both acute angles to be ' + t('45^\\circ') + '. Check (i): ' + t(dg(sh.th) + '+' + dg(sh.th) + '+90^\\circ=' + dg(2 * sh.th + 90)) + '.' },
              { html: 'Because it makes every side wrong by the same amount.', why: 'The sides here come from the given angle and hypotenuse; the danger is that the wrong angle looks believable.' },
              { html: 'Because no self-check can catch it.', why: 'Check (i) catches it in one line: the angles add to ' + t(dg(2 * sh.th + 90)) + '.' }],
              'A wrong answer that repeats a value already on the page looks copied from a correct line, so nothing looks wrong. The triangle would need angles ' + t(dg(sh.th) + ',\\ ' + dg(sh.th) + ',\\ 90^\\circ') + ' — sum ' + t(dg(2 * sh.th + 90)) + ' — so it couldn’t close. Check (i) exposes it.',
              ['Run check (i) on the student’s angles.'], 'why the coincidence is dangerous');
          } }] },
      /* ---------- Part G: stretch ---------- */
      { num: '18', section: 'Extra practice G — A ratio and one side', stem: function (sh) {
          return 'In ' + t('\\triangle ABC') + ' the right angle is at ' + t('C') + ', the hypotenuse ' + t('AB=' + sh.hyp) + ', and ' + t('\\tan A=\\tfrac{' + sh.p + '}{' + sh.q + '}') + '. Work exactly — no calculator until the angles.';
        },
        shared: function (r) {
          if (r.chance(0.2)) return { p: 3, q: 4, c: 5, k: 6.5, hyp: '32.5', k2: 8 };
          var tri = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25]]), k = gen(function () { return r.int(15, 95) / 10; }, function (k) { return Math.round(k * 10) % 10 !== 0 && tri[2] * k <= 70 && tri[2] * k >= 12; });
          var k2 = gen(function () { return r.int(2, 9); }, function (x) { return x !== k && tri[2] * x <= 90; });
          return { p: tri[0], q: tri[1], c: tri[2], k: k, hyp: String(Number((tri[2] * k).toFixed(1))), k2: k2 };
        },
        parts: [
          { id: 'e18a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var check = function (resp) {
              resp = resp || []; var v = resp.map(function (x) { var p = HW.parse.number(clean(x)); return p.ok ? p.value : null; });
              if (v.every(function (x) { return x == null; })) return form('empty', 'Fill in the boxes first.');
              if (v.some(function (x) { return x == null; })) return form('incomplete', 'Fill in all three sides as whole numbers.');
              var o = v[0], a = v[1], h = v[2];
              if (o <= 0 || a <= 0 || h <= 0 || [o, a, h].some(function (x) { return Math.round(x) !== x; })) return form('whole', 'Use positive whole numbers for the small triangle.');
              if (Math.abs(o * sh.q - a * sh.p) > 1e-9) return wrong('small-triangle', Math.abs(a * sh.q - o * sh.p) < 1e-9 ? 'Opposite and adjacent are swapped: ' + t('\\tan A=\\dfrac{\\text{opp}}{\\text{adj}}=\\dfrac{' + sh.p + '}{' + sh.q + '}') + '.' : t('\\tan A=\\dfrac{\\text{opp}}{\\text{adj}}') + ', so opposite : adjacent must be ' + t(sh.p + ':' + sh.q) + '.');
              if (Math.abs(o * o + a * a - h * h) > 1e-9) return wrong('small-triangle', 'Legs ' + t(o) + ' and ' + t(a) + ' are right; find the hypotenuse with the Pythagorean theorem: ' + t('\\sqrt{' + o + '^2+' + a + '^2}') + '.');
              return ok();
            };
            return { prompt: 'From ' + t('\\tan A=\\tfrac{' + sh.p + '}{' + sh.q + '}') + ', write the three sides of a small triangle with this angle as whole numbers (opposite ' + t('A') + ', adjacent to ' + t('A') + ', hypotenuse).',
              input: { type: 'fields', fields: [{ label: 'opposite', name: 'Opposite' }, { label: 'adjacent', name: 'Adjacent' }, { label: 'hypotenuse', name: 'Hypotenuse' }] }, check: check,
              key: [String(sh.p), String(sh.q), String(sh.c)], good: [[String(2 * sh.p), String(2 * sh.q), String(2 * sh.c)]], bad: [[String(sh.q), String(sh.p), String(sh.c)], [String(sh.p), String(sh.q), String(sh.p + sh.q)]],
              answer: t(sh.p + '\\text{–}' + sh.q + '\\text{–}' + sh.c) + ' (or any whole-number multiple)',
              solution: t('\\tan A=\\dfrac{\\text{opp}}{\\text{adj}}=\\dfrac{' + sh.p + '}{' + sh.q + '}') + ': take opposite ' + t(sh.p) + ', adjacent ' + t(sh.q) + '. Hypotenuse ' + t('=\\sqrt{' + sh.p + '^2+' + sh.q + '^2}=\\sqrt{' + (sh.p * sh.p + sh.q * sh.q) + '}=' + sh.c) + '. Any right triangle with ' + t('\\tan A=\\tfrac{' + sh.p + '}{' + sh.q + '}') + ' has the same angles, so ' + t('\\triangle ABC') + ' is a scaled copy of this one.',
              hints: ['Tangent is opposite over adjacent: read the two legs straight from the fraction.', 'Then the Pythagorean theorem on small whole numbers gives the hypotenuse.'], text: 'small triangle from tan ratio' };
          } },
          { id: 'e18b', sub: 'b', level: 'ADV', make: function (r, sh) {
            var k = sh.k, BC = Number((sh.p * k).toFixed(2)), AC = Number((sh.q * k).toFixed(2));
            var dg2 = function (want, alts) { return function (resp) { var s = clean(resp), p = HW.parse.number(s); if (!p.ok) return K.approx(want, 2)(s); if (Math.abs(p.value - want) < 1e-9) return ok(); for (var i = 0; i < alts.length; i++) if (Math.abs(p.value - alts[i].v) < 1e-6) return wrong(alts[i].code, alts[i].hint); return wrong('value', null); }; };
            var fs = [{ tex: '\\text{scale factor}', name: 'Scale factor', check: dg2(k, [{ v: sh.c / Number(sh.hyp), code: 'scale-wrong', hint: 'Scale factor = big ÷ small: ' + t(sh.hyp + '\\div ' + sh.c) + '.' }]), key: String(k) },
              { tex: 'BC', name: 'BC', check: dg2(BC, [{ v: AC, code: 'opp-adj-swap', hint: t('BC') + ' is opposite ' + t('\\angle A') + ': it matches the ' + t(sh.p) + ' of the small triangle.' }]), key: String(BC) },
              { tex: 'AC', name: 'AC', check: dg2(AC, [{ v: BC, code: 'opp-adj-swap', hint: t('AC') + ' is adjacent to ' + t('\\angle A') + ': it matches the ' + t(sh.q) + '.' }]), key: String(AC) }];
            var p = fieldsPart('Using the small ' + t(sh.p + '\\text{–}' + sh.q + '\\text{–}' + sh.c) + ' triangle, find the scale factor to ' + t('\\triangle ABC') + ', then write ' + t('BC') + ' and ' + t('AC') + ' <b>exactly</b>.', fs,
              'Scale factor ' + t('=\\dfrac{' + sh.hyp + '}{' + sh.c + '}=' + k) + ' exactly.<br>' + t('BC') + ' (opposite ' + t('A') + ') ' + t('=' + sh.p + '\\times ' + k + '=' + BC) + ', ' + t('AC') + ' (adjacent) ' + t('=' + sh.q + '\\times ' + k + '=' + AC) + '.<br>Nothing was rounded: a whole-number triple, one exact division and two exact multiplications. No trig ratio was evaluated — that is what creates endless decimals.',
              ['Scale factor = hypotenuse of ' + t('\\triangle ABC') + ' ÷ hypotenuse of the small triangle.', 'Multiply each small leg by the scale factor.'], 'exact sides by scaling');
            p.bad = [[String(k), String(AC), String(BC)]];
            return p;
          } },
          { id: 'e18c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var A = T.atan(sh.p / sh.q), ac = angleCalc('opp', sh.p, String(sh.p), 'adj', sh.q, String(sh.q), 'A', '\\angle A', 0);
            return fieldsPart('Now, and only now, use a calculator: find ' + t('\\angle A') + ' and ' + t('\\angle B') + ' to the nearest degree.', [
              { tex: '\\angle A', name: '∠A', x: A, dp: 0, unit: '°', alts: ac.alts },
              { tex: '\\angle B', name: '∠B', x: 90 - A, dp: 0, unit: '°', alts: [{ v: A, code: 'other-angle', hint: 'That is ' + t('\\angle A') + '. The two acute angles add to ' + t('90^\\circ') + '.' }, { v: 180 - A, code: 'angle-180', hint: ACUTE90 }] }],
              t('\\angle A=\\tan^{-1}\\!\\left(\\tfrac{' + sh.p + '}{' + sh.q + '}\\right)=' + fl(A) + '^\\circ\\approx ' + dg(fx(A, 0))) + '<br>' + t('\\angle B=90^\\circ-' + fl(A) + '^\\circ=' + fl(90 - A) + '^\\circ\\approx ' + dg(fx(90 - A, 0))) + '<br>This is the only rounding in the whole question, and it happens at the very last step.',
              ['Use ' + t('\\tan^{-1}') + ' of the given fraction.'], 'angles from tan ratio');
          } },
          { id: 'e18d', sub: 'd', level: 'PRG', make: function (r, sh) {
            return mc(r, 'All three self-checks pass. Which one can be run <b>exactly</b>, with no rounding at all?', [
              { html: '(iii) the hypotenuse is longer than both legs — it compares three exact lengths.', right: true },
              { html: '(i) the angle sum — the angles are exact.', why: 'The angles came from ' + t('\\tan^{-1}') + ' and were rounded to whole degrees.' },
              { html: 'None — every check needs a calculator.', why: 'One check uses only the three side lengths, which are exact.' },
              { html: 'All three are exact.', why: 'Any check that uses the angles uses rounded values.' }],
              'Check (iii) compares ' + t(sh.hyp) + ' with ' + t(Number((sh.p * sh.k).toFixed(2))) + ' and ' + t(Number((sh.q * sh.k).toFixed(2))) + ' — three exact lengths, no angle, no rounding. (Check (ii) can also be done exactly: ' + t('\\tan A=\\tfrac{' + sh.p + '}{' + sh.q + '}') + (sh.p < sh.q ? t('<1') + ' forces ' + t('\\angle A<45^\\circ<\\angle B') : t('>1') + ' forces ' + t('\\angle A>45^\\circ>\\angle B')) + '.)',
              ['Which check uses only side lengths?'], 'exact self-check');
          } },
          { id: 'e18e', sub: 'e', level: 'ADV', make: function (r, sh) {
            var h2 = sh.c * sh.k2, BC = sh.p * sh.k2, AC = sh.q * sh.k2, A = T.atan(sh.p / sh.q);
            var ex = function (want, other, nm) { return function (resp) { var p = HW.parse.number(clean(resp)); if (!p.ok) return K.approx(want, 1)(clean(resp)); if (Math.abs(p.value - want) < 1e-9) return ok(); if (Math.abs(p.value - other) < 1e-9) return wrong('opp-adj-swap', nm + ' and the other leg are swapped — match opposite with ' + t(sh.p) + ' and adjacent with ' + t(sh.q) + '.'); if (Math.abs(p.value - want / sh.k2 * sh.k) < 1e-6) return wrong('scale-wrong', 'That is the old value. Use the new scale factor ' + t(h2 + '\\div ' + sh.c) + '.'); return wrong('value', null); }; };
            var fs = [{ tex: 'BC', name: 'BC', check: ex(BC, AC, 'BC'), key: String(BC) }, { tex: 'AC', name: 'AC', check: ex(AC, BC, 'AC'), key: String(AC) },
              { tex: '\\angle A', name: '∠A', x: A, dp: 0, unit: '°', alts: [{ v: T.atan(sh.p / sh.q) * sh.k2 / sh.k, code: 'scale-angle', hint: 'Scaling changes lengths, not angles: ' + t('\\tan A') + ' is still ' + t('\\tfrac{' + sh.p + '}{' + sh.q + '}') + '.' }, { v: 90 - A, code: 'other-angle', hint: 'That is ' + t('\\angle B') + '.' }] }];
            var p = fieldsPart('The hypotenuse is now changed to ' + t(h2 + '.0') + ', with ' + t('\\tan A') + ' unchanged. Write ' + t('BC') + ' and ' + t('AC') + ' exactly, and give ' + t('\\angle A') + ' to the nearest degree.', fs,
              'New scale factor ' + t('=' + h2 + '\\div ' + sh.c + '=' + sh.k2) + '. ' + t('BC=' + sh.p + '\\times ' + sh.k2 + '=' + BC) + ', ' + t('AC=' + sh.q + '\\times ' + sh.k2 + '=' + AC) + ' (check: ' + t(BC + '^2+' + AC + '^2=' + (BC * BC + AC * AC) + '=' + h2 + '^2') + ').<br>' + t('\\angle A') + ' is <b>unchanged</b>, ' + t(dg(fx(A, 0))) + ': ' + t('\\tan A=\\tfrac{' + BC + '}{' + AC + '}=\\tfrac{' + sh.p + '}{' + sh.q + '}') + ' still. The ratio fixes the <b>shape</b> (the angles); the one side fixes the <b>size</b>.',
              ['New scale factor = new hypotenuse ÷ ' + t(sh.c) + '.', 'Does changing the size change the angles?'], 'rescaled triangle');
            p.bad = [[String(AC), String(BC), fx(A, 0)]];
            return p;
          } }] }
    ]
  });
  HW.addCodes({ 'incomplete-trip': 'Left out the return leg', 'whole-peak': 'Gave the whole peak angle, not the half', 'half-area': 'Halved a rectangle’s area', 'scale-angle': 'Thought scaling changes the angle' });
})(window);
