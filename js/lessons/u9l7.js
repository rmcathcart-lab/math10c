/* Math 10C · Unit 9 · Lesson 7 — Chaining Right Triangles Together (M4)
 * Assignment questions 1–11 (u9_L07.tex) and the Lesson 7 Extra Practice (u9_EP07.tex, Parts A–I).
 * Every part is a generator: it keeps the figure, the idea and the difficulty of the booklet question (the booklet's
 * numbers are one of the possible versions) and changes the numbers. Two-triangle figures are drawn with HW.fig.
 * Where it helps, the shared side (or the first triangle's piece) is a checkable box, and every final answer has a
 * "rounded the shared side too early" diagnosis plus the classic slips (wrong ratio, multiplied instead of divided,
 * radian mode, only one piece of the total, the other acute angle). Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, Tg = HW.trig;
  var DEG = { sin: Tg.sin, cos: Tg.cos, tan: Tg.tan, asin: Tg.asin, acos: Tg.acos, atan: Tg.atan };
  var RAD = { sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan };   // a calculator left in radian mode

  HW.addCodes({
    'ch-early': 'Rounded the shared side (or a piece) before using it',
    'ch-keep-digits': 'Rounded an intermediate value too early (nudge)',
    'ch-radian': 'Calculator in radian mode',
    'ch-inverted': 'Multiplied instead of divided (or the reverse)',
    'ch-ratio': 'Wrong trig ratio for the sides used',
    'ch-one-piece': 'Gave only one piece of the total',
    'ch-complement': 'Gave the other acute angle',
    'ch-not-right': 'Used SOH CAH TOA in a triangle with no right angle',
    'ch-angle-diff': 'Subtracted the two angles instead of chaining the triangles',
    'ch-wrong-triangle': 'Used a side from the other triangle',
    'ch-eye': 'Forgot to add the eye height',
    'ch-full-distance': 'Used the whole distance instead of half',
    'ch-angle-sum': 'Didn’t add the angles at the shared vertex',
    'ch-finish': 'Forgot the 15 m behind the finish line',
    'ch-speed': 'Used the other runner’s speed',
    'ch-who': 'Wrong runner (times compared wrongly)',
    'ch-midpoint': 'Used the whole side instead of half (midpoint)',
    'ch-add-legs': 'Added the legs instead of using the Pythagorean theorem',
    'ch-half-diag': 'Used half a diagonal in the area',
    'ch-no-half': 'Forgot the ½ in the area formula',
    'ch-which-side': 'Named the wrong shared side',
    'ch-pyth': 'Pythagorean theorem set up the wrong way',
    'ch-add-angles': 'Added angles that should be subtracted (or the reverse)',
    'ch-other-piece': 'Solved for the other piece of the base',
    'ch-not-rounded': 'Didn’t round the shared side (asked to)',
    'ch-seg-name': 'Side not named with two letters (nudge)',
    'ch-ab': 'Runner not named with A or B (nudge)'
  });

  /* ---------------- numbers ---------------- */
  function rd(x, n) { return K.roundTo(x, n); }
  function fx(x, n) { return rd(x, n).toFixed(n); }
  function v4(x) { return Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : fx(x, 4) + '\\ldots'; }   // an unrounded value in a solution
  function tenth(r, lo, hi) { return r.int(Math.round(lo * 10), Math.round(hi * 10)) / 10; }
  function g1(x) { return x.toFixed(1); }          // a given one-decimal measurement
  function dg(a) { return a + '^\\circ'; }
  function TAN(a) { return '\\tan ' + a + '^\\circ'; }
  function SIN(a) { return '\\sin ' + a + '^\\circ'; }
  function COS(a) { return '\\cos ' + a + '^\\circ'; }
  function fr(a, b) { return '\\dfrac{' + a + '}{' + b + '}'; }
  function fin(s) { return Object.keys(s).every(function (k) { return typeof s[k] !== 'number' || isFinite(s[k]); }); }
  function gen(r, draw, build, valid, book) { for (var i = 0; i < 400; i++) { var s = build(draw(r)); if (fin(s) && valid(s)) return s; } return build(book); }
  function hyp(a, b) { return Math.sqrt(a * a + b * b); }
  function half(x, dp) { var f = x * Math.pow(10, dp); return Math.abs(f - Math.floor(f) - 0.5) < 1e-6; }   // exactly halfway: the rounding is ambiguous

  /* ---------------- hints used across the lesson ---------------- */
  var RADH = 'Check that your calculator is in <b>degree</b> mode (DEG), not radians.';
  function earlyH(nm) { return 'Very close — that is the answer you get when ' + nm + ' is rounded before it is used. Keep every digit of ' + nm + ' in your calculator and round only the final answer.'; }
  function early(f, s, nm) { return [1, 0].map(function (d) { return { v: f(rd(s, d)), code: 'ch-early', hint: earlyH(nm) }; }); }
  function radAlt(calc) { var v; try { v = calc(RAD); } catch (e) { v = NaN; } return { v: v, code: 'ch-radian', hint: RADH }; }
  function invH(side, ang) { return 'Check the set-up: ' + side + ' is the unknown in the <b>denominator</b> of the ratio for ' + ang + ', so divide — don’t multiply (or the reverse).'; }

  /* ---------------- checkers ---------------- */
  /* an intermediate value (the shared side): at least `need` decimal places, within about ±0.01 */
  function midCheck(x, need, alts, nm) {
    alts = (alts || []).filter(function (a) { return isFinite(a.v) && Math.abs(a.v - x) > 0.02; });
    return function (resp) {
      var raw = String(resp == null ? '' : resp), p = HW.parse.number(raw);
      if (!p.ok) { var a = K.read(raw); if (a.res) return a.res; return form('decimal', 'Type the value as a decimal number (no units).'); }
      var v = p.value, s = HW.parse.plain(raw).replace(/\s/g, ''), dec = (s.split('.')[1] || '').length;
      var tol = need >= 3 ? Math.pow(10, -need) * 1.01 : 0.0101;
      if (Math.abs(v - x) < 1e-9) return ok();
      if (dec >= need && Math.abs(v - x) <= tol) return ok();
      if (dec < need && Math.abs(v - x) <= 0.5 * Math.pow(10, -dec) + 1e-9)
        return form('ch-keep-digits', 'Right so far — but keep at least ' + need + ' decimal places for ' + nm + ' (better: leave every digit in your calculator). It isn’t the final answer, and rounding it now can change the final answer.');
      for (var i = 0; i < alts.length; i++) { var al = alts[i]; if (Math.abs(v - al.v) <= Math.max(0.0101, Math.abs(al.v) * 0.002, dec < need ? 0.5 * Math.pow(10, -dec) : 0)) return wrong(al.code, al.hint); }
      if (Math.abs(v + x) <= 0.0101) return wrong('sign', 'Check the sign — a length is positive.');
      return wrong('value', null);
    };
  }
  /* a side named with two letters (either order) */
  function segCheck(nm, hint) {
    var a = nm.toUpperCase(), b = a.split('').reverse().join('');
    return function (resp) {
      var s = String(resp == null ? '' : resp).toUpperCase().replace(/[^A-Z]/g, '');
      if (!s) return form('empty', 'Type the two letters that name the side.');
      if (s.length !== 2) return form('ch-seg-name', 'Name the side with just its two letters (for example ' + b + ').');
      return s === a || s === b ? ok() : wrong('ch-which-side', hint);
    };
  }
  function absCheck(c) { return function (resp) { var p = HW.parse.number(String(resp == null ? '' : resp)); return p.ok && p.value < 0 ? c(String(-p.value)) : c(resp); }; }

  /* ---------------- part builders ---------------- */
  function badOf(x, dp, alts) {
    var seen = {}, out = []; seen[fx(x, dp)] = 1;
    (alts || []).forEach(function (a) { if (!isFinite(a.v) || a.v < 0) return; var s = fx(a.v, dp); if (!seen[s]) { seen[s] = 1; out.push(s); } });
    return out;
  }
  function ansU(v, unit) { return unit === '°' ? t(v + '^\\circ') : t(v) + (unit ? ' ' + unit : ''); }
  /* one rounded answer */
  function near(prompt, x, dp, unit, alts, sol, hints, text, nr) {
    var p = K.P.near(prompt, x, dp, { unit: unit, alts: alts, nr: nr }, sol, hints, text);
    p.answer = ansU(fx(x, dp), nr ? '' : unit);
    p.bad = badOf(x, dp, alts);
    return p;
  }
  /* several boxes: b = { label, name, unit, x, dp } (rounded answer) | { mid: true, need } (keep digits) | { text: true, check, key, show } */
  function chain(prompt, boxes, sol, hints, text) {
    var fields = [], checks = [], keys = [], ans = [];
    boxes.forEach(function (b) {
      fields.push({ label: b.label, after: b.unit, name: b.name, mode: b.text ? 'text' : undefined });
      if (b.text) { checks.push(b.check); keys.push(b.key); ans.push(b.label + ' ' + b.show); }
      else if (b.mid) { var need = b.need == null ? 2 : b.need; checks.push(midCheck(b.x, need, b.alts, b.nm || (/^[A-Za-z]{1,3}$/.test(b.name) ? t(b.name) : b.name))); keys.push(fx(b.x, Math.max(4, need + 1))); ans.push(b.label + ' ' + ansU(v4(b.x), b.unit) + ' (unrounded)'); }
      else { var c = K.near(b.x, b.dp, { alts: b.alts }); checks.push(b.abs ? absCheck(c) : c); keys.push(fx(b.x, b.dp)); ans.push(b.label + ' ' + ansU(fx(b.x, b.dp), b.unit)); }
    });
    var p = K.P.fields(prompt, fields, checks, keys, ans.join('<br>'), sol, hints, text);
    p.bad = [];
    boxes.forEach(function (b, i) { if (b.mid || b.text) return; badOf(b.x, b.dp, b.alts).slice(0, 2).forEach(function (s) { var k = keys.slice(); k[i] = s; p.bad.push(k); }); });
    return p;
  }
  function mc(r, prompt, opts, sol, hints, text) { return K.P.mc(r, prompt, opts, sol, hints, text); }

  /* ---------------- figures ---------------- */
  function fig(spec) { if (!spec.width) spec.width = 300; return HW.fig(spec); }
  var DASH = { dash: 1, width: 1.6, color: '#6a7182' };
  /* two right triangles on one base, sharing the altitude from the apex: base L–F–R (foot F), apex P above (up) or below */
  function altFig(o) {
    var n = o.names, pts = {}, down = o.down ? -1 : 1;
    pts[n.L] = [-o.l, 0]; pts[n.F] = [0, 0]; pts[n.R] = [o.rr, 0]; pts[n.P] = [0, down * o.h];
    var segs = [[n.L, n.F, o.lab.LF], [n.F, n.R, o.lab.FR], [n.L, n.P, o.lab.LP], [n.P, n.R, o.lab.PR], [n.F, n.P]].map(function (s) { return s[2] == null ? [s[0], s[1]] : s; });
    var mx = 0; [o.lab.LF, o.lab.FR, o.lab.LP, o.lab.PR].forEach(function (x) { if (x) mx = Math.max(mx, String(x).length); });
    var pad = Math.max(30, 16 + mx * 7.2), sc = Math.min((300 - 2 * pad) / (o.l + o.rr), (330 - 2 * pad) / o.h), side = o.rr >= o.l ? 1 : -1;
    var extra = [{ type: 'text', at: [side * 9 / sc, -down * 17 / sc], text: n.F }], names = {}; names[n.L] = n.L; names[n.R] = n.R; names[n.P] = n.P;   // foot name nudged toward the longer piece
    if (o.lab.FP) {   // the altitude's label sits beside it, on the side of the longer base piece, clear of the slanted sides
      extra.push({ type: 'text', at: [side * (10 + String(o.lab.FP).length * 3.7) / sc, down * o.h * 0.36], text: o.lab.FP });
    }
    var ang = [];
    if (o.ang.L) ang.push([n.L, n.F, n.P, o.ang.L]); if (o.ang.R) ang.push([n.R, n.F, n.P, o.ang.R]);
    if (o.ang.PL) ang.push([n.P, n.F, n.L, o.ang.PL, { r: 30 }]); if (o.ang.PR) ang.push([n.P, n.F, n.R, o.ang.PR, { r: 30 }]);
    return fig({ pts: pts, segs: segs, right: [[n.F, n.R, n.P]], angles: ang, extra: extra, names: names, aria: o.aria || 'two right triangles sharing an altitude' });
  }

  /* ======================= REQUIRED QUESTIONS ======================= */

  /* ---- Q1 warm-up frame: XW altitude, angles Y and Z ---- */
  function q1Build(p) { var o = { h: p.h, Y: p.Y, Z: p.Z }; o.yw = p.h / Tg.tan(p.Y); o.wz = p.h / Tg.tan(p.Z); o.yz = o.yw + o.wz; return o; }
  function q1Fig(s, hLab) { return altFig({ names: { L: 'Y', F: 'W', R: 'Z', P: 'X' }, l: s.yw, rr: s.wz, h: s.h, lab: { FP: hLab || g1(s.h) + ' cm' }, ang: { L: s.Y + '°', R: s.Z + '°' } }); }

  /* ---- Q2(b): J right angle, K above, angles at K ---- */
  function q2bFig(s) {
    return fig({ pts: { J: [0, 0], K: [0, s.jk], M: [s.jm, 0], L: [s.jl, 0] }, segs: [['J', 'K', g1(s.jk) + ' cm'], ['J', 'M'], ['M', 'L'], ['K', 'M'], ['K', 'L']],
      right: [['J', 'M', 'K']], angles: [['K', 'J', 'M', s.a1 + '°', { r: 30 }], ['K', 'M', 'L', s.a2 + '°', { r: 54 }]], aria: 'right triangle JKL with segment KM' });
  }

  HW.defineLesson({
    id: 'u9l7', unit: 9, num: '7', title: 'Chaining Right Triangles Together', outcome: 'M4',
    blurb: 'Two right triangles joined by a shared side: solve the one that has enough information, hand the unrounded shared side to the other, and round only at the end.',
    questions: [
      /* ---------------- Q1 ---------------- */
      { num: '1', section: 'Two right triangles sharing a side',
        shared: function (r) { return gen(r, function (r) { return { h: tenth(r, 4.0, 9.0), Y: r.int(45, 60), Z: r.int(28, 40) }; }, q1Build, function (s) { return s.Y - s.Z >= 8; }, { h: 6.0, Y: 50, Z: 35 }); },
        stem: function (s) { return '<i>(Warm-up — fill in the frame.)</i> In the diagram, ' + t('XW') + ' is the altitude from ' + t('X') + ' to ' + t('YZ') + ', ' + t('XW=' + g1(s.h)) + ' cm, ' + t('\\angle Y=' + dg(s.Y)) + ' and ' + t('\\angle Z=' + dg(s.Z)) + '.' + q1Fig(s); },
        parts: [
          { id: '1a', level: 'LIM', make: function (r, s) {
            return mc(r, 'The shared side of right triangles ' + t('XWY') + ' and ' + t('XWZ') + ' is', [
              { html: t('XW') + ', the altitude', right: true },
              { html: t('XY'), why: t('XY') + ' belongs only to ' + t('\\triangle XWY') + ' (it is that triangle’s hypotenuse). A shared side is a side of <b>both</b> triangles.' },
              { html: t('XZ'), why: t('XZ') + ' belongs only to ' + t('\\triangle XWZ') + '. Look for the one segment that is a side of both triangles.' },
              { html: t('YZ'), why: t('YZ') + ' is the whole base — each right triangle has only a piece of it (' + t('YW') + ' or ' + t('WZ') + ').' }],
              'The altitude ' + t('XW') + ' is a leg of both right triangles, and it is given (' + t(g1(s.h)) + ' cm), so each triangle has a side and an angle and can be solved.',
              ['Which segment is a side of both ' + t('\\triangle XWY') + ' and ' + t('\\triangle XWZ') + '?'], 'shared side: altitude');
          } },
          { id: '1b', level: 'EMG', make: function (r, s) {
            var h = g1(s.h);
            return chain('Fill in the frame: ' + t(TAN(s.Y) + '=' + fr(h, 'YW')) + ' and ' + t(TAN(s.Z) + '=' + fr(h, 'WZ')) + '. Give ' + t('YW') + ' and ' + t('WZ') + ' to at least two decimal places (they are not final answers), then ' + t('YZ=YW+WZ') + ' to the nearest tenth of a centimetre.', [
              { label: t('YW='), name: 'YW', unit: 'cm', mid: true, x: s.yw, alts: [{ v: s.h * Tg.tan(s.Y), code: 'ch-inverted', hint: invH(t('YW'), t(TAN(s.Y))) + ' ' + t('YW=' + fr(h, TAN(s.Y))) + '.' }, { v: s.h / Tg.sin(s.Y), code: 'ch-ratio', hint: t(fr(h, SIN(s.Y))) + ' is the hypotenuse ' + t('XY') + '. From ' + t('\\angle Y') + ', ' + t('XW') + ' is opposite and ' + t('YW') + ' is adjacent: use tangent.' }, radAlt(function (T) { return s.h / T.tan(s.Y); })] },
              { label: t('WZ='), name: 'WZ', unit: 'cm', mid: true, x: s.wz, alts: [{ v: s.h * Tg.tan(s.Z), code: 'ch-inverted', hint: invH(t('WZ'), t(TAN(s.Z))) + ' ' + t('WZ=' + fr(h, TAN(s.Z))) + '.' }, { v: s.h / Tg.sin(s.Z), code: 'ch-ratio', hint: 'From ' + t('\\angle Z') + ', ' + t('XW') + ' is opposite and ' + t('WZ') + ' is adjacent: use tangent.' }, radAlt(function (T) { return s.h / T.tan(s.Z); })] },
              { label: t('YZ='), name: 'YZ', unit: 'cm', x: s.yz, dp: 1, alts: [{ v: rd(s.yw, 1) + rd(s.wz, 1), code: 'ch-early', hint: earlyH(t('YW') + ' and ' + t('WZ')) }, { v: rd(s.yw, 0) + rd(s.wz, 0), code: 'ch-early', hint: earlyH(t('YW') + ' and ' + t('WZ')) }, { v: s.h * Tg.tan(s.Y) + s.h * Tg.tan(s.Z), code: 'ch-inverted', hint: invH(t('YW') + ' and ' + t('WZ'), 'each angle') }] }],
              'The shared side is the altitude ' + t('XW=' + h) + ' cm.<br>' + t('YW=' + fr(h, TAN(s.Y)) + '=' + v4(s.yw)) + ' cm<br>' + t('WZ=' + fr(h, TAN(s.Z)) + '=' + v4(s.wz)) + ' cm<br>' + t('YZ=' + v4(s.yw) + '+' + v4(s.wz) + '=' + v4(s.yz) + '\\approx ' + fx(s.yz, 1)) + ' cm. Keep ' + t('YW') + ' and ' + t('WZ') + ' unrounded until the final sum.',
              ['Multiply both sides of ' + t(TAN(s.Y) + '=' + fr(h, 'YW')) + ' by ' + t('YW') + ', then divide by ' + t(TAN(s.Y)) + '.', 'Add the two unrounded pieces, then round.'], 'frame: YZ from altitude ' + h + ', ' + s.Y + '°, ' + s.Z + '°');
          } }] },
      /* ---------------- Q2 ---------------- */
      { num: '2', stem: 'Determine the length of the requested segment, to the nearest ' + t('0.1') + ' cm, in each diagram.',
        shared: function (r) {
          return {
            A: gen(r, function (r) { return { h: tenth(r, 6.0, 9.9), Y: r.int(38, 50), Z: r.int(30, 42) }; }, q1Build, function (s) { return s.Y - s.Z >= 5; }, { h: 8.2, Y: 44, Z: 36 }),
            B: gen(r, function (r) { return { jk: tenth(r, 4.0, 7.0), a1: r.int(22, 35), a2: r.int(10, 20) }; }, function (p) { var o = { jk: p.jk, a1: p.a1, a2: p.a2 }; o.jm = p.jk * Tg.tan(p.a1); o.jl = p.jk * Tg.tan(p.a1 + p.a2); o.ml = o.jl - o.jm; return o; },
              function (s) { return s.a1 + s.a2 <= 52 && s.ml >= 1.0; }, { jk: 5.4, a1: 29, a2: 15 }),
            C: gen(r, function (r) { return { h: tenth(r, 10.0, 18.0), N: r.int(25, 35), Q: r.int(28, 42) }; }, function (p) { var o = { h: p.h, N: p.N, Q: p.Q }; o.nw = p.h / Tg.tan(p.N); o.wp = p.h * Tg.tan(p.Q); o.np = o.nw + o.wp; return o; }, function () { return true; }, { h: 15.6, N: 30, Q: 35 })
          };
        },
        parts: [
          { id: '2a', level: 'PRG', make: function (r, S) { var s = S.A;
            var h = g1(s.h), calc = function (T) { return s.h / T.tan(s.Y) + s.h / T.tan(s.Z); };
            return near(t('XW') + ' is the altitude from ' + t('X') + ' to ' + t('YZ') + '. Determine ' + t('YZ') + '.' + q1Fig(s), s.yz, 1, 'cm', [
              { v: rd(s.yw, 1) + rd(s.wz, 1), code: 'ch-early', hint: earlyH(t('YW') + ' and ' + t('WZ')) }, { v: rd(s.yw, 0) + rd(s.wz, 0), code: 'ch-early', hint: earlyH(t('YW') + ' and ' + t('WZ')) },
              { v: s.h * Tg.tan(s.Y) + s.h * Tg.tan(s.Z), code: 'ch-inverted', hint: 'In each triangle ' + t('XW') + ' is opposite the base angle and the base piece is adjacent: ' + t(TAN(s.Y) + '=' + fr(h, 'YW')) + ', so ' + t('YW=' + fr(h, TAN(s.Y))) + ' — divide, don’t multiply.' },
              { v: s.h / Tg.sin(s.Y) + s.h / Tg.sin(s.Z), code: 'ch-ratio', hint: 'Dividing by sine gives the slanted sides ' + t('XY') + ' and ' + t('XZ') + '. The base pieces are adjacent to the angles: use tangent.' },
              { v: s.yw, code: 'ch-one-piece', hint: 'That is only ' + t('YW') + '. ' + t('W') + ' splits ' + t('YZ') + ' into two pieces — find ' + t('WZ') + ' too and add.' },
              { v: s.wz, code: 'ch-one-piece', hint: 'That is only ' + t('WZ') + '. ' + t('W') + ' splits ' + t('YZ') + ' into two pieces — find ' + t('YW') + ' too and add.' },
              radAlt(calc)],
              'Shared side: the altitude ' + t('XW=' + h) + ' — a leg of both right triangles, and it is given, so either triangle may go first. In each, ' + t('XW') + ' is opposite the base angle and the unknown piece is adjacent (TOA, unknown in the denominator).<br>' +
              t('YW=' + fr(h, TAN(s.Y)) + '=' + v4(s.yw)) + ' cm<br>' + t('WZ=' + fr(h, TAN(s.Z)) + '=' + v4(s.wz)) + ' cm<br>' + t('YZ=' + v4(s.yw) + '+' + v4(s.wz) + '=' + v4(s.yz) + '\\approx ' + fx(s.yz, 1)) + ' cm',
              ['The altitude is a leg of both right triangles. Find ' + t('YW') + ' in one and ' + t('WZ') + ' in the other.', 'Add the unrounded pieces, then round.'], 'YZ from altitude ' + h + ', ' + s.Y + '°, ' + s.Z + '°');
          } },
          { id: '2b', level: 'ADV', make: function (r, S) { var s = S.B;
            var k = g1(s.jk), A = s.a1 + s.a2;
            return chain(t('\\angle JKM=' + dg(s.a1)) + ' and ' + t('\\angle MKL=' + dg(s.a2)) + ', where ' + t('JK\\perp JL') + '. Determine ' + t('ML') + '. (Give ' + t('JM') + ' and ' + t('JL') + ' unrounded, to at least two decimal places.)' + q2bFig(s), [
              { label: t('JM='), name: 'JM', unit: 'cm', mid: true, x: s.jm, alts: [{ v: s.jk / Tg.tan(s.a1), code: 'ch-inverted', hint: 'From ' + t('\\angle JKM') + ', ' + t('JM') + ' is opposite and ' + t('JK') + ' is adjacent: ' + t('JM=' + k + TAN(s.a1)) + '.' }, radAlt(function (T) { return s.jk * T.tan(s.a1); })] },
              { label: t('JL='), name: 'JL', unit: 'cm', mid: true, x: s.jl, alts: [{ v: s.jk * Tg.tan(s.a2), code: 'ch-angle-sum', hint: t('\\angle JKL') + ' is the whole angle at ' + t('K') + ', from ' + t('KJ') + ' to ' + t('KL') + ': ' + t(dg(s.a1) + '+' + dg(s.a2) + '=' + dg(A)) + '.' }, { v: s.jk / Tg.tan(A), code: 'ch-inverted', hint: 'From ' + t('\\angle JKL') + ', ' + t('JL') + ' is opposite and ' + t('JK') + ' is adjacent: multiply.' }, radAlt(function (T) { return s.jk * T.tan(A); })] },
              { label: t('ML='), name: 'ML', unit: 'cm', x: s.ml, dp: 1, alts: [{ v: rd(s.jl, 1) - rd(s.jm, 1), code: 'ch-early', hint: earlyH(t('JM') + ' and ' + t('JL')) }, { v: s.jk * Tg.tan(s.a2), code: 'ch-not-right', hint: t('\\triangle MKL') + ' has no right angle, so its ' + t(dg(s.a2)) + ' can’t go into SOH CAH TOA by itself. Use the right triangles: ' + t('ML=JL-JM') + '.' }, { v: s.jl, code: 'ch-one-piece', hint: 'That is ' + t('JL') + ', the whole base. ' + t('ML') + ' is what is left after taking away ' + t('JM') + '.' }] }],
              'Shared side: the leg ' + t('JK=' + k) + ', common to ' + t('\\triangle JKM') + ' and ' + t('\\triangle JKL') + ' (both right-angled at ' + t('J') + '). The angles at ' + t('K') + ' stack: ' + t('\\angle JKL=' + dg(s.a1) + '+' + dg(s.a2) + '=' + dg(A)) + '.<br>' +
              t('JM=' + k + TAN(s.a1) + '=' + v4(s.jm)) + ' cm<br>' + t('JL=' + k + TAN(A) + '=' + v4(s.jl)) + ' cm<br>' + t('ML=JL-JM=' + v4(s.jl) + '-' + v4(s.jm) + '=' + v4(s.ml) + '\\approx ' + fx(s.ml, 1)) + ' cm<br>Don’t round ' + t('JM') + ' and ' + t('JL') + ' before subtracting — a difference of two close values magnifies rounding errors.',
              [t('\\triangle MKL') + ' has no right angle. Work in the right triangles ' + t('JKM') + ' and ' + t('JKL') + ', which share the leg ' + t('JK') + '.', t('ML=JL-JM') + '. For ' + t('JL') + ' use the whole angle at ' + t('K') + '.'], 'ML = JL − JM, JK ' + k);
          } },
          { id: '2c', level: 'PRG', make: function (r, S) { var s = S.C;
            var h = g1(s.h);
            var F = altFig({ names: { L: 'N', F: 'W', R: 'P', P: 'Q' }, down: true, l: s.nw, rr: s.wp, h: s.h, lab: { FP: h + ' cm' }, ang: { L: s.N + '°', PR: s.Q + '°' } });
            return near(t('QW') + ' is perpendicular to ' + t('NP') + ' and ' + t('\\angle WQP=' + dg(s.Q)) + '. Determine ' + t('NP') + '.' + F, s.np, 1, 'cm', [
              { v: s.nw + s.h / Tg.tan(s.Q), code: 'ch-inverted', hint: t('\\angle WQP') + ' is at the vertex ' + t('Q') + '. From ' + t('Q') + ', ' + t('WP') + ' is <b>opposite</b> and ' + t('QW') + ' is adjacent, so ' + t('WP=' + h + TAN(s.Q)) + ' (multiply).' },
              { v: s.h * Tg.tan(s.N) + s.wp, code: 'ch-inverted', hint: 'From ' + t('\\angle N') + ', ' + t('QW') + ' is opposite and ' + t('NW') + ' is adjacent, so ' + t('NW=' + fr(h, TAN(s.N))) + ' (divide).' },
              { v: rd(s.nw, 1) + rd(s.wp, 1), code: 'ch-early', hint: earlyH(t('NW') + ' and ' + t('WP')) }, { v: rd(s.nw, 0) + rd(s.wp, 0), code: 'ch-early', hint: earlyH(t('NW') + ' and ' + t('WP')) },
              { v: s.nw, code: 'ch-one-piece', hint: 'That is only ' + t('NW') + '. Add the other piece, ' + t('WP') + '.' }, { v: s.wp, code: 'ch-one-piece', hint: 'That is only ' + t('WP') + '. Add the other piece, ' + t('NW') + '.' },
              radAlt(function (T) { return s.h / T.tan(s.N) + s.h * T.tan(s.Q); })],
              'Shared side: the altitude ' + t('QW=' + h) + ', a leg of both ' + t('\\triangle NWQ') + ' and ' + t('\\triangle PWQ') + ' (right angles at ' + t('W') + ').<br>' +
              t('\\triangle NWQ') + ': from ' + t('\\angle N=' + dg(s.N)) + ', ' + t('QW') + ' is opposite and ' + t('NW') + ' adjacent: ' + t('NW=' + fr(h, TAN(s.N)) + '=' + v4(s.nw)) + ' cm<br>' +
              t('\\triangle PWQ') + ': from ' + t('\\angle WQP=' + dg(s.Q)) + ', ' + t('WP') + ' is opposite and ' + t('QW') + ' adjacent: ' + t('WP=' + h + TAN(s.Q) + '=' + v4(s.wp)) + ' cm<br>' +
              t('NP=NW+WP=' + v4(s.np) + '\\approx ' + fx(s.np, 1)) + ' cm',
              ['Name the sides from the angle you are using: the ' + t(dg(s.Q)) + ' angle is at ' + t('Q') + ', not at ' + t('P') + '.', 'Find ' + t('NW') + ' and ' + t('WP') + ', then add.'], 'NP: altitude ' + h + ', ' + s.N + '° at N, ' + s.Q + '° at Q');
          } }] },
      /* ---------------- Q3 ---------------- */
      { num: '3', stem: 'Determine the measure of ' + t('\\angle ABC') + ', to the nearest degree, in each diagram.',
        shared: function (r) {
          return { A: gen(r, function (r) { var bc = tenth(r, 18.0, 26.0), th = r.int(35, 48), bd = bc * Tg.cos(th); return { bc: bc, th: th, ab: rd(bd / Tg.cos(r.int(16, 34)), 1) }; },
            function (p) { var o = { bc: p.bc, th: p.th, ab: p.ab }; o.bd = p.bc * Tg.cos(p.th); o.dc = p.bc * Tg.sin(p.th); o.abd = Tg.acos(o.bd / p.ab); o.ad = Math.sqrt(p.ab * p.ab - o.bd * o.bd); o.abc = o.abd + p.th; return o; },
            function (s) { return s.abd >= 14 && s.abd <= 36; }, { bc: 22.7, th: 41, ab: 18.6 }),
            B: gen(r, function (r) { return { ad: tenth(r, 6.0, 10.0), cd: tenth(r, 3.0, 7.0), al: r.int(10, 20) }; },
              function (p) { var o = { ad: p.ad, cd: p.cd, al: p.al }; o.dac = Tg.atan(p.cd / p.ad); o.dab = o.dac + p.al; o.abc = 90 - o.dab; o.bd = p.ad * Tg.tan(o.dab); return o; },
              function (s) { return s.dac >= 25 && s.dac <= 45 && s.dab <= 62; }, { ad: 8.2, cd: 5.3, al: 15 }) };
        },
        parts: [
          { id: '3a', level: 'PRG', make: function (r, S) { var s = S.A;
            var F = fig({ pts: { A: [-s.ad, 0], D: [0, 0], C: [s.dc, 0], B: [0, -s.bd] }, segs: [['A', 'D'], ['D', 'C'], ['A', 'B', g1(s.ab) + ' m'], ['B', 'C', g1(s.bc) + ' m'], ['D', 'B']], right: [['D', 'C', 'B']], angles: [['B', 'D', 'C', s.th + '°', { r: 34 }]], aria: 'triangle ABC with altitude BD' });
            var f = function (bd) { return Tg.acos(bd / s.ab) + s.th; };
            return chain(t('BD') + ' is the altitude from ' + t('B') + ' to ' + t('AC') + ', and ' + t('\\angle DBC=' + dg(s.th)) + '. Find the shared side ' + t('BD') + ' (to at least two decimal places), then ' + t('\\angle ABC') + ' to the nearest degree.' + F, [
              { label: t('BD='), name: 'BD', unit: 'm', mid: true, x: s.bd, alts: [{ v: s.bc * Tg.sin(s.th), code: 'ch-ratio', hint: 'From ' + t('\\angle DBC') + ', ' + t('BD') + ' is <b>adjacent</b> and ' + t('BC') + ' is the hypotenuse: CAH, ' + t('BD=' + g1(s.bc) + COS(s.th)) + '.' }, { v: s.bc / Tg.cos(s.th), code: 'ch-inverted', hint: invH(t('BD'), t(COS(s.th))) }, radAlt(function (T) { return s.bc * T.cos(s.th); })] },
              { label: t('\\angle ABC='), name: '∠ABC', unit: '°', x: s.abc, dp: 0, alts: early(f, s.bd, t('BD')).concat([
                { v: s.abd, code: 'ch-one-piece', hint: 'That is ' + t('\\angle ABD') + ' only. ' + t('\\angle ABC=\\angle ABD+\\angle DBC') + '.' },
                { v: Tg.asin(s.bd / s.ab) + s.th, code: 'ch-ratio', hint: 'In ' + t('\\triangle ABD') + ', ' + t('BD') + ' is <b>adjacent</b> to ' + t('\\angle ABD') + ' and ' + t('AB') + ' is the hypotenuse: use ' + t('\\cos^{-1}') + '.' },
                radAlt(function (T) { return T.acos(s.bc * T.cos(s.th) / s.ab) + s.th; })]) }],
              'Shared side: the altitude ' + t('BD') + '. Solve ' + t('\\triangle BDC') + ' first — it has the hypotenuse ' + t('BC=' + g1(s.bc)) + ' and the ' + t(dg(s.th)) + ' angle; ' + t('\\triangle BDA') + ' has only ' + t('AB=' + g1(s.ab)) + ' until ' + t('BD') + ' arrives.<br>' +
              t(COS(s.th) + '=' + fr('BD', g1(s.bc)) + '\\Rightarrow BD=' + g1(s.bc) + COS(s.th) + '=' + v4(s.bd)) + ' m<br>' + t('\\cos(\\angle ABD)=' + fr(v4(s.bd), g1(s.ab)) + '\\Rightarrow \\angle ABD=' + v4(s.abd) + '^\\circ') + '<br>' +
              t('\\angle ABC=\\angle ABD+\\angle DBC=' + v4(s.abd) + '^\\circ+' + dg(s.th) + '=' + v4(s.abc) + '^\\circ\\approx ' + dg(fx(s.abc, 0))),
              ['Which triangle has two facts besides its right angle? Solve it for ' + t('BD') + '.', 'Then in ' + t('\\triangle ABD') + ' you know ' + t('BD') + ' and the hypotenuse ' + t('AB') + ': use an inverse ratio, and add ' + t(dg(s.th)) + '.'], '∠ABC via altitude BD');
          } },
          { id: '3b', level: 'ADV', make: function (r, S) { var s = S.B;
            var F = fig({ pts: { D: [0, 0], A: [0, s.ad], C: [-s.cd, 0], B: [-s.bd, 0] }, segs: [['B', 'C'], ['C', 'D', g1(s.cd) + ' cm'], ['D', 'A', g1(s.ad) + ' cm'], ['A', 'B'], ['A', 'C']], right: [['D', 'A', 'C']], angles: [['A', 'B', 'C', s.al + '°', { r: 46 }]], aria: 'right triangle ADB with segment AC' });
            var f = function (d) { return 90 - (d + s.al); };
            return chain(t('AD\\perp BD') + ', ' + t('C') + ' lies on ' + t('BD') + ', and ' + t('\\angle CAB=' + dg(s.al)) + '. Find ' + t('\\angle DAC') + ' (to at least two decimal places), then ' + t('\\angle ABC') + ' to the nearest degree.' + F, [
              { label: t('\\angle DAC='), name: '∠DAC', unit: '°', mid: true, x: s.dac, alts: [{ v: Tg.atan(s.ad / s.cd), code: 'ch-inverted', hint: 'From ' + t('\\angle DAC') + ', ' + t('CD') + ' is opposite and ' + t('AD') + ' is adjacent: ' + t('\\tan^{-1}\\left(' + fr(g1(s.cd), g1(s.ad)) + '\\right)') + '.' }, { v: Math.atan(s.cd / s.ad), code: 'ch-radian', hint: RADH }] },
              { label: t('\\angle ABC='), name: '∠ABC', unit: '°', x: s.abc, dp: 0, alts: early(f, s.dac, t('\\angle DAC')).concat([
                { v: s.dab, code: 'ch-complement', hint: 'That is ' + t('\\angle DAB') + ', the angle at ' + t('A') + '. ' + t('\\angle ABC') + ' is the other acute angle of right ' + t('\\triangle ADB') + ': ' + t('90^\\circ-\\angle DAB') + '.' },
                { v: 90 - s.dac, code: 'ch-one-piece', hint: t('\\angle DAB') + ' is the whole angle at ' + t('A') + ': ' + t('\\angle DAC+' + dg(s.al)) + '. Then subtract it from ' + t('90^\\circ') + '.' },
                { v: 90 - (Tg.atan(s.ad / s.cd) + s.al), code: 'ch-inverted', hint: 'From ' + t('\\angle DAC') + ', ' + t('CD') + ' is opposite and ' + t('AD') + ' adjacent: ' + t('\\tan(\\angle DAC)=' + fr(g1(s.cd), g1(s.ad))) + '.' }]) }],
              'Shared side: the leg ' + t('AD=' + g1(s.ad)) + ', common to right triangles ' + t('ADC') + ' and ' + t('ADB') + '. Solve ' + t('\\triangle ADC') + ' first for ' + t('\\angle DAC') + '.<br>' +
              t('\\tan(\\angle DAC)=' + fr(g1(s.cd), g1(s.ad)) + '\\Rightarrow \\angle DAC=' + v4(s.dac) + '^\\circ') + '<br>' + t('\\angle DAB=' + v4(s.dac) + '^\\circ+' + dg(s.al) + '=' + v4(s.dab) + '^\\circ') + '<br>' +
              'In right ' + t('\\triangle ADB') + ' the acute angles add to ' + t('90^\\circ') + ': ' + t('\\angle ABC=90^\\circ-' + v4(s.dab) + '^\\circ=' + v4(s.abc) + '^\\circ\\approx ' + dg(fx(s.abc, 0))),
              ['Find ' + t('\\angle DAC') + ' in ' + t('\\triangle ADC') + ' (you know two legs).', t('\\angle DAB=\\angle DAC+' + dg(s.al)) + ', and the acute angles of right ' + t('\\triangle ADB') + ' add to ' + t('90^\\circ') + '.'], '∠ABC via ∠DAC');
          } }] },
      /* ---------------- Q4 ---------------- */
      { num: '4', section: 'Indirect measurement across two structures',
        shared: function (r) {
          return gen(r, function (r) { return { half: tenth(r, 6.0, 10.0), e: r.pick([1.55, 1.60, 1.65, 1.70, 1.75, 1.80]), a: r.int(14, 22), b: r.int(24, 34), left: r.chance(0.5) }; },
            function (p) { var o = { half: p.half, e: p.e, a: p.a, b: p.b, left: p.left }; o.ra = p.half * Tg.tan(p.a); o.rb = p.half * Tg.tan(p.b); o.ha = o.ra + p.e; o.hb = o.rb + p.e; return o; },
            function (s) { return s.b - s.a >= 5; }, { half: 8.2, e: 1.75, a: 19, b: 26, left: true });
        },
        stem: function (s) {
          var hl = s.left ? s.ha : s.hb, hr = s.left ? s.hb : s.ha, al = s.left ? s.a : s.b, ar = s.left ? s.b : s.a, H = s.half;
          var sc = 280 / (2 * H + 0.8);
          var F = fig({ pts: { E: [0, s.e], TL: [-H, hl], TR: [H, hr], EL: [-H, s.e], ER: [H, s.e] },
            segs: [['E', 'TL', DASH], ['E', 'TR', DASH], ['EL', 'ER', { dash: 1, width: 1.2, color: '#9aa1ad' }]], angles: [['E', 'EL', 'TL', al + '°', { r: 40 }], ['E', 'ER', 'TR', ar + '°', { r: 40 }]], names: false, width: 340,
            extra: [{ type: 'ground', y: 0, x0: -H - 0.4, x1: H + 0.4 }, { type: 'tree', at: [-H, 0], h: hl }, { type: 'tree', at: [H, 0], h: hr }, { type: 'person', at: [0, 0], h: s.e * 1.06 }, { type: 'eye', at: [0, s.e] }, { type: 'text', at: [-34 / sc, s.e / 2], text: s.e.toFixed(2) + ' m', size: 12 }, { type: 'text', at: [-H / 2, -16 / sc], text: g1(H) + ' m' }, { type: 'text', at: [H / 2, -16 / sc], text: g1(H) + ' m' }], aria: 'two trees with an observer halfway between' });
          return 'Two trees in a park are ' + t(g1(2 * H)) + ' m apart. An observer, whose eyeline is ' + t(s.e.toFixed(2)) + ' m above the ground, stands halfway between the trees. The angles of elevation of the tops of the trees from the observer’s eyeline are ' + t(dg(s.a)) + ' and ' + t(dg(s.b)) + '.' + F;
        },
        parts: [
          { id: '4a', level: 'EMG', make: function (r, s) {
            var e = s.e.toFixed(2);
            return mc(r, 'Why must ' + t(e) + ' m be added to each computed rise?', [
              { html: 'The angles are measured from eye level, so trigonometry gives only the rise of each treetop <b>above eye level</b>; the ' + t(e) + ' m below eye level must be added back.', right: true },
              { html: 'The line of sight is the hypotenuse, and adding ' + t(e) + ' m turns the hypotenuse into the height.', why: 'The tangent ratio gives the vertical leg (the rise), not the hypotenuse. The ' + t(e) + ' m is the part of the tree below the eye-level line.' },
              { html: 'The observer’s height makes each horizontal distance ' + t(e) + ' m longer.', why: 'The horizontal distance is still ' + t(g1(s.half)) + ' m. The eye-level line is horizontal; it is just ' + t(e) + ' m <b>above</b> the ground.' },
              { html: 'It is not needed: the trigonometry already measures from the ground.', why: 'Each right triangle has its horizontal leg on the eye-level line, ' + t(e) + ' m above the ground — so the trig answer starts at eye level, not at the ground.' }],
              'Each right triangle has its horizontal leg on the observer’s eye-level line, ' + t(e) + ' m above the ground. ' + t('\\tan') + ' gives only the rise above that line; the part of the tree below eye level (' + t(e) + ' m) must be added to get the full height.',
              ['Where is the horizontal leg of each right triangle — on the ground, or at eye level?'], 'why add eye height');
          } },
          { id: '4b', level: 'PRG', make: function (r, s) {
            var H = g1(s.half), e = s.e.toFixed(2);
            function alts(a) { return [{ v: s.half * Tg.tan(a), code: 'ch-eye', hint: 'That is only the rise above eye level. Add the ' + t(e) + ' m from the ground up to the observer’s eye.' }, { v: 2 * s.half * Tg.tan(a) + s.e, code: 'ch-full-distance', hint: 'The observer stands <b>halfway</b>: the horizontal leg is ' + t(H) + ' m, not ' + t(g1(2 * s.half)) + ' m.' }, { v: s.half * Tg.sin(a) + s.e, code: 'ch-ratio', hint: 'The horizontal ' + t(H) + ' m is adjacent to the angle and the rise is opposite: use tangent.' }, { v: s.half / Tg.tan(a) + s.e, code: 'ch-inverted', hint: 'The rise is opposite the angle and ' + t(H) + ' m is adjacent: rise ' + t('=' + H + '\\tan\\theta') + '.' }, radAlt(function (T) { return s.half * T.tan(a) + s.e; })]; }
            return chain('Determine the height of each tree, to the nearest ' + t('0.01') + ' m.', [
              { label: 'Tree seen at ' + t(dg(s.a)) + ':', name: 'Tree at ' + s.a + '°', unit: 'm', x: s.ha, dp: 2, alts: alts(s.a) },
              { label: 'Tree seen at ' + t(dg(s.b)) + ':', name: 'Tree at ' + s.b + '°', unit: 'm', x: s.hb, dp: 2, alts: alts(s.b) }],
              'Each horizontal leg is half of ' + t(g1(2 * s.half)) + ': ' + t(H) + ' m. The rise above eye level is opposite the angle (TOA).<br>' +
              t(dg(s.a)) + ': rise ' + t('=' + H + TAN(s.a) + '=' + v4(s.ra)) + ' m, height ' + t('=' + e + '+' + v4(s.ra) + '=' + v4(s.ha) + '\\approx ' + fx(s.ha, 2)) + ' m<br>' +
              t(dg(s.b)) + ': rise ' + t('=' + H + TAN(s.b) + '=' + v4(s.rb)) + ' m, height ' + t('=' + e + '+' + v4(s.rb) + '=' + v4(s.hb) + '\\approx ' + fx(s.hb, 2)) + ' m',
              ['The horizontal leg of each triangle is half the distance between the trees.', 'rise ' + t('=') + ' horizontal ' + t('\\times\\tan(\\text{angle})') + ', then add the eye height.'], 'two tree heights, eye ' + e);
          } }] },
      /* ---------------- Q5 ---------------- */
      { num: '5',
        shared: function (r) {
          return gen(r, function (r) { return { H: 5 * r.int(18, 32), dep: r.int(50, 64), el: r.int(10, 22) }; },
            function (p) { var o = { H: p.H, dep: p.dep, el: p.el }; o.d = p.H / Tg.tan(p.dep); o.up = o.d * Tg.tan(p.el); o.c = p.H + o.up; return o; }, function () { return true; }, { H: 130, dep: 58, el: 15 });
        },
        stem: function (s) {
          var F = fig({ pts: { Wb: [0, 0], Wt: [0, s.H], Cb: [s.d, 0], Ct: [s.d, s.c], Z: [s.d, s.H] },
            segs: [['Wb', 'Wt', s.H + ' m', { width: 4 }], ['Cb', 'Ct', { width: 4 }], ['Wt', 'Ct', DASH], ['Wt', 'Cb', DASH], ['Wt', 'Z', { dash: 1, width: 1.2, color: '#9aa1ad' }]],
            angles: [['Wt', 'Z', 'Ct', s.el + '°', { r: 40 }], ['Wt', 'Z', 'Cb', s.dep + '°', { r: 26 }]], names: false,
            extra: [{ type: 'ground', y: 0, x0: -s.d * 0.15, x1: s.d * 1.15 }, { type: 'text', at: [0, -s.c * 0.06], text: 'Willow' }, { type: 'text', at: [s.d, -s.c * 0.06], text: 'Cedar' }], height: 320, aria: 'two towers' });
          return 'Willow Tower is ' + t(s.H) + ' m tall. From the top of Willow Tower, the angle of depression to the foot of Cedar Tower is ' + t(dg(s.dep)) + ', and the angle of elevation to the top of Cedar Tower is ' + t(dg(s.el)) + '.' + F;
        },
        parts: [
          { id: '5', level: 'PRG', make: function (r, s) {
            var f = function (d) { return s.H + d * Tg.tan(s.el); };
            return chain('Find the shared horizontal distance ' + t('d') + ' between the towers (to at least two decimal places), then the height of Cedar Tower to the nearest tenth of a metre.', [
              { label: t('d='), name: 'd', unit: 'm', mid: true, x: s.d, alts: [{ v: s.H * Tg.tan(s.dep), code: 'ch-inverted', hint: 'The angle of depression equals the angle of elevation from the foot of Cedar. ' + t(s.H) + ' m is opposite that angle and ' + t('d') + ' is adjacent: ' + t('d=' + fr(s.H, TAN(s.dep))) + '.' }, { v: s.H / Tg.sin(s.dep), code: 'ch-ratio', hint: 'Dividing by sine gives the slanted line of sight. ' + t('d') + ' is the horizontal leg, adjacent to the angle: use tangent.' }, radAlt(function (T) { return s.H / T.tan(s.dep); })] },
              { label: 'Cedar:', name: 'Cedar', unit: 'm', x: s.c, dp: 1, alts: early(f, s.d, t('d')).concat([
                { v: s.up, code: 'ch-one-piece', hint: 'That is only how much taller Cedar is than Willow. Add Willow’s ' + t(s.H) + ' m.' },
                { v: s.H + s.H * Tg.tan(s.dep) * Tg.tan(s.el), code: 'ch-inverted', hint: 'Check ' + t('d') + ': ' + t(TAN(s.dep) + '=' + fr(s.H, 'd')) + ', so ' + t('d=' + fr(s.H, TAN(s.dep))) + '.' },
                radAlt(function (T) { return s.H + s.H / T.tan(s.dep) * T.tan(s.el); })]) }],
              'Shared side: the horizontal distance ' + t('d') + ' between the towers — a leg of both right triangles. Solve the Willow triangle first: its height ' + t(s.H) + ' m and the ' + t(dg(s.dep)) + ' depression are both known.<br>' +
              t(TAN(s.dep) + '=' + fr(s.H, 'd') + '\\Rightarrow d=' + fr(s.H, TAN(s.dep)) + '=' + v4(s.d)) + ' m<br>' + 'The same ' + t('d') + ' with the ' + t(dg(s.el)) + ' elevation gives Cedar’s rise above Willow: ' + t(v4(s.d) + TAN(s.el) + '=' + v4(s.up)) + ' m<br>' +
              'Cedar ' + t('=' + s.H + '+' + v4(s.up) + '=' + v4(s.c) + '\\approx ' + fx(s.c, 1)) + ' m' + (fx(f(rd(s.d, 0)), 1) !== fx(s.c, 1) ? '<br>Rounding ' + t('d') + ' to ' + t(fx(s.d, 0)) + ' m first gives ' + t(fx(f(rd(s.d, 0)), 1)) + ' m — carry ' + t('d') + ' at full precision.' : ''),
              ['The angle of depression to Cedar’s foot and Willow’s height give the distance between the towers.', 'That distance and the angle of elevation give how much taller Cedar is. Add the two pieces.'], 'Cedar tower: Willow ' + s.H + ', dep ' + s.dep + ', el ' + s.el);
          } }] },
      /* ---------------- Q6 ---------------- */
      { num: '6',
        shared: function (r) {
          return gen(r, function (r) { return { h: 5 * r.int(12, 26), a: r.int(30, 45), b: r.int(48, 62) }; },
            function (p) { var o = { h: p.h, a: p.a, b: p.b }; o.far = p.h / Tg.tan(p.a); o.nr = p.h / Tg.tan(p.b); o.gap = o.far - o.nr; return o; }, function (s) { return s.b - s.a >= 8; }, { h: 95, a: 41, b: 53 });
        },
        stem: function (s) {
          var F = fig({ pts: { B: [0, 0], T: [0, s.h], N: [s.nr, 0], R: [s.far, 0], Z: [s.far * 1.08, s.h] },
            segs: [['B', 'T', s.h + ' m', { width: 3.5 }], ['T', 'N', DASH], ['T', 'R', DASH], ['T', 'Z', { dash: 1, width: 1.2, color: '#9aa1ad' }]],
            angles: [['T', 'Z', 'R', s.a + '°', { r: 62 }], ['T', 'Z', 'N', s.b + '°', { r: 22 }]], names: false,
            extra: [{ type: 'ground', y: 0, x0: -s.far * 0.06, x1: s.far * 1.1 }, { type: 'eye', at: [s.nr, 0] }, { type: 'eye', at: [s.far, 0] }, { type: 'text', at: [s.nr, -s.h * 0.1], text: 'near' }, { type: 'text', at: [s.far, -s.h * 0.1], text: 'far' }], aria: 'cliff and two boats' });
          return 'From the top of a cliff ' + t(s.h) + ' m high, an observer sees two boats heading toward shore, one directly behind the other. The angle of depression to the farther boat is ' + t(dg(s.a)) + ', and the angle of depression to the nearer boat is ' + t(dg(s.b)) + '.' + F;
        },
        parts: [
          { id: '6', level: 'ADV', make: function (r, s) {
            return chain('Find each boat’s horizontal distance from the base of the cliff (to at least two decimal places), then the distance between the boats to the nearest metre.', [
              { label: 'Far boat:', name: 'far boat', unit: 'm', mid: true, x: s.far, alts: [{ v: s.h * Tg.tan(s.a), code: 'ch-inverted', hint: 'The cliff is opposite the angle and the distance is adjacent: ' + t('\\text{distance}=' + fr(s.h, TAN(s.a))) + '.' }, { v: s.nr, code: 'ch-wrong-triangle', hint: 'That is the near boat. The <b>farther</b> boat has the smaller angle of depression, ' + t(dg(s.a)) + '.' }, radAlt(function (T) { return s.h / T.tan(s.a); })] },
              { label: 'Near boat:', name: 'near boat', unit: 'm', mid: true, x: s.nr, alts: [{ v: s.h * Tg.tan(s.b), code: 'ch-inverted', hint: 'The cliff is opposite the angle and the distance is adjacent: ' + t('\\text{distance}=' + fr(s.h, TAN(s.b))) + '.' }, radAlt(function (T) { return s.h / T.tan(s.b); })] },
              { label: 'Between:', name: 'between', unit: 'm', x: s.gap, dp: 0, alts: [
                { v: rd(s.far, 0) - rd(s.nr, 0), code: 'ch-early', hint: earlyH('each boat’s distance') }, { v: rd(s.far, 1) - rd(s.nr, 1), code: 'ch-early', hint: earlyH('each boat’s distance') },
                { v: s.h / Tg.tan(s.b - s.a), code: 'ch-angle-diff', hint: 'Subtracting the angles doesn’t give a right triangle with the cliff in it. Find each boat’s distance from the cliff in its own right triangle, then subtract the distances.' },
                { v: s.h * (Tg.tan(s.b) - Tg.tan(s.a)), code: 'ch-inverted', hint: 'Each distance is ' + t(fr(s.h, '\\tan(\\text{angle})')) + ' — divide, don’t multiply.' }] }],
              'Shared side: the cliff — the ' + t(s.h) + ' m vertical leg of <b>both</b> right triangles. Each angle of depression equals the angle of elevation from that boat (parallel horizontals).<br>' +
              'far boat: ' + t(fr(s.h, TAN(s.a)) + '=' + v4(s.far)) + ' m &nbsp; near boat: ' + t(fr(s.h, TAN(s.b)) + '=' + v4(s.nr)) + ' m<br>' +
              'distance between ' + t('=' + v4(s.far) + '-' + v4(s.nr) + '=' + v4(s.gap) + '\\approx ' + fx(s.gap, 0)) + ' m' + (fx(rd(s.far, 0) - rd(s.nr, 0), 0) !== fx(s.gap, 0) ? '<br>Rounding each distance first gives ' + t(fx(s.far, 0) + '-' + fx(s.nr, 0) + '=' + fx(rd(s.far, 0) - rd(s.nr, 0), 0)) + ' m — wrong. Subtract at full precision, then round.' : ''),
              ['The cliff is the vertical leg of both right triangles. Each angle of depression is also the angle of elevation from that boat.', 'Find each boat’s distance from the cliff, then subtract.'], 'two boats from a ' + s.h + ' m cliff');
          } }] },
      /* ---------------- Q7 ---------------- */
      { num: '7',
        shared: function (r) {
          var want = r.chance(0.45) ? 'B' : 'A';   // decided once, so both outcomes really occur
          return gen(r, function (r) { return { H: 5 * r.int(10, 18), s: r.pick([10, 12, 15, 18, 20]), al: r.int(28, 38), be: r.int(20, 34), vA: tenth(r, 3.5, 5.5), vB: tenth(r, 3.8, 7.0), want: want, k: r.int(108, 130) / 100 }; },
            function (p) { var o = { H: p.H, s: p.s, al: p.al, be: p.be, vA: p.vA, vB: p.vB, want: p.want }; o.dA = p.H / Tg.tan(p.al); o.dB = p.H / Tg.tan(p.be); if (p.want === 'B' && p.k) o.vB = rd(p.vA * (o.dB - p.s) / (o.dA - p.s) * p.k, 1); o.gap = o.dB - o.dA; o.tA = (o.dA - p.s) / p.vA; o.tB = (o.dB - p.s) / o.vB; o.win = o.tA < o.tB ? 'A' : 'B'; return o; },
            function (s) { return s.win === s.want && s.vB <= 7.5 && s.al - s.be >= 4 && Math.abs(s.tA - s.tB) >= 0.8 && Math.abs(s.vA - s.vB) >= 0.3 && Math.abs(s.dA / s.vA - s.dB / s.vB) >= 0.3; }, { H: 65, s: 15, al: 31, be: 26, vA: 4.2, vB: 4.8, want: 'A' });
        },
        stem: function (s) {
          var w = s.dB * 0.08;
          var F = fig({ pts: { G: [0, 0], T: [0, s.H], Fn: [s.s, 0], A: [s.dA, 0], B: [s.dB, 0], Z: [s.dB * 1.06, s.H], Gw: [-w, 0], Tw: [-w, s.H] },
            segs: [['Gw', 'Tw', s.H + ' m'], ['T', 'A', DASH], ['T', 'B', DASH], ['T', 'Z', { dash: 1, width: 1.2, color: '#9aa1ad' }]],
            angles: [['T', 'Z', 'A', s.al + '°', { r: 28 }], ['T', 'Z', 'B', s.be + '°', { r: 66 }]], names: { A: 'A', B: 'B' }, width: 340,
            extra: [{ type: 'building', at: [-w / 2, 0], w: w, h: s.H }, { type: 'ground', y: 0, x0: -w * 1.3, x1: s.dB * 1.08 }, { type: 'eye', at: [s.dA, 0] }, { type: 'eye', at: [s.dB, 0] }, { type: 'dash', from: [s.s, -s.H * 0.03], to: [s.s, s.H * 0.06], color: '#2b3340' }, { type: 'text', at: [s.s + s.dB * 0.05, -s.H * 0.09], text: 'finish' }], aria: 'apartment window and two runners' });
          return 'An apartment window is ' + t(s.H) + ' m above the ground and ' + t(s.s) + ' m behind the finish line of a race. Two runners, ' + t('A') + ' and ' + t('B') + ', are heading toward the finish line. From the window, the angle of depression to runner ' + t('A') + ' is ' + t(dg(s.al)) + ', and the angle of depression to runner ' + t('B') + ' is ' + t(dg(s.be)) + '.' + F;
        },
        parts: [
          { id: '7a', level: 'ADV', make: function (r, s) {
            return near('Determine the distance between the runners, to the nearest metre.', s.gap, 0, 'm', [
              { v: rd(s.dB, 0) - rd(s.dA, 0), code: 'ch-early', hint: earlyH('each runner’s distance') }, { v: rd(s.dB, 1) - rd(s.dA, 1), code: 'ch-early', hint: earlyH('each runner’s distance') },
              { v: s.H / Tg.tan(s.al - s.be), code: 'ch-angle-diff', hint: 'Subtracting the angles doesn’t give a right triangle. Find each runner’s horizontal distance from the building in its own right triangle, then subtract.' },
              { v: s.H * (Tg.tan(s.al) - Tg.tan(s.be)), code: 'ch-inverted', hint: 'Each distance is ' + t(fr(s.H, '\\tan(\\text{angle})')) + ' — divide, don’t multiply.' },
              { v: s.dB, code: 'ch-one-piece', hint: 'That is runner ' + t('B') + '’s distance from the building. Subtract runner ' + t('A') + '’s distance.' }, { v: s.dA, code: 'ch-one-piece', hint: 'That is runner ' + t('A') + '’s distance from the building. Find ' + t('B') + '’s too and subtract.' },
              radAlt(function (T) { return s.H / T.tan(s.be) - s.H / T.tan(s.al); })],
              'Shared side: the ' + t(s.H) + ' m vertical from the window down to the ground — a leg of both right triangles.<br>' +
              'to ' + t('A') + ': ' + t(fr(s.H, TAN(s.al)) + '=' + v4(s.dA)) + ' m &nbsp; to ' + t('B') + ': ' + t(fr(s.H, TAN(s.be)) + '=' + v4(s.dB)) + ' m<br>' +
              'distance between the runners ' + t('=' + v4(s.dB) + '-' + v4(s.dA) + '=' + v4(s.gap) + '\\approx ' + fx(s.gap, 0)) + ' m<br>(' + t('B') + ' is farther away: the smaller angle of depression belongs to the farther object.)',
              ['The window height is the vertical leg of both right triangles.', 'Find each runner’s horizontal distance from the building, then subtract.'], 'runners: gap from ' + s.H + ' m window');
          } },
          { id: '7b', level: 'MAS', make: function (r, s) {
            function alts(d, v, other, nm) { return [{ v: d / v, code: 'ch-finish', hint: 'The window is ' + t(s.s) + ' m <b>behind</b> the finish line, so runner ' + t(nm) + ' still has (distance from the building ' + t('-\\ ' + s.s) + ' m) to run.' }, { v: (d + s.s) / v, code: 'ch-finish', hint: 'The finish line is between the building and the runners: subtract the ' + t(s.s) + ' m, don’t add it.' }, { v: (d - s.s) / other, code: 'ch-speed', hint: 'Use runner ' + t(nm) + '’s own speed.' }, { v: (rd(d, 0) - s.s) / v, code: 'ch-early', hint: earlyH('the distance from the building') }]; }
            return chain('Runner ' + t('A') + ' runs at a constant ' + t(g1(s.vA)) + ' m/s and runner ' + t('B') + ' runs at a constant ' + t(g1(s.vB)) + ' m/s. Find each runner’s time to the finish line (nearest tenth of a second), then say which runner reaches the finish line first.', [
              { label: 'Time for ' + t('A') + ':', name: 'Time for A', unit: 's', x: s.tA, dp: 1, alts: alts(s.dA, s.vA, s.vB, 'A') },
              { label: 'Time for ' + t('B') + ':', name: 'Time for B', unit: 's', x: s.tB, dp: 1, alts: alts(s.dB, s.vB, s.vA, 'B') },
              { label: 'First to finish (A or B):', name: 'First', text: true, key: s.win, show: 'runner ' + t(s.win), check: function (resp) {
                var x = String(resp == null ? '' : resp).toUpperCase().replace(/RUNNER|FIRST|[^A-Z]/g, '');
                if (!x) return form('empty', 'Type the letter of the runner who finishes first.');
                if (x !== 'A' && x !== 'B') return form('ch-ab', 'Type just the letter ' + t('A') + ' or ' + t('B') + '.');
                return x === s.win ? ok() : wrong('ch-who', 'Compare your two times: the runner with the <b>smaller</b> time reaches the finish line first.');
              } }],
              'The window is ' + t(s.s) + ' m behind the finish line, so each runner’s remaining distance is the horizontal distance from the building minus ' + t(s.s) + ' m.<br>' +
              t('A') + ': ' + t(v4(s.dA) + '-' + s.s + '=' + v4(s.dA - s.s)) + ' m, time ' + t('=' + fr(v4(s.dA - s.s), g1(s.vA)) + '=' + v4(s.tA) + '\\approx ' + fx(s.tA, 1)) + ' s<br>' +
              t('B') + ': ' + t(v4(s.dB) + '-' + s.s + '=' + v4(s.dB - s.s)) + ' m, time ' + t('=' + fr(v4(s.dB - s.s), g1(s.vB)) + '=' + v4(s.tB) + '\\approx ' + fx(s.tB, 1)) + ' s<br>' +
              'So <b>runner ' + t(s.win) + '</b> reaches the finish line first.' + ((s.win === 'A') === (s.vA < s.vB) ? ' (Even though ' + t(s.win) + ' is the slower runner, ' + t(s.win) + ' started much closer.)' : ''),
              ['Each runner’s distance from the building comes from ' + t(fr(s.H, '\\tan(\\text{angle of depression})')) + '. How much of that is left to run?', 'time ' + t('=') + ' distance ' + t('\\div') + ' speed.'], 'runners: who finishes first');
          } }] },
      /* ---------------- Q8 ---------------- */
      { num: '8', section: 'Two sightings, one unknown distance',
        shared: function (r) {
          return gen(r, function (r) { return { d: 5 * r.int(5, 12), a: r.int(18, 30), b: r.int(10, 17) }; },
            function (p) { var o = { d: p.d, a: p.a, b: p.b }; o.ka = 1 / Tg.tan(p.a); o.kb = 1 / Tg.tan(p.b); o.h = p.d / (o.kb - o.ka); o.w = o.h * o.ka; return o; }, function (s) { return s.a - s.b >= 5 && !half(s.h, 0); }, { d: 40, a: 21, b: 14 });
        },
        stem: function (s) {
          var F = fig({ pts: { C: [0, 0], T: [0, s.h], X: [s.w, 0], Y: [s.w + s.d, 0] }, segs: [['T', 'X', DASH], ['T', 'Y', DASH], ['X', 'Y', s.d + ' m', { width: 1.4, side: 1 }]],
            angles: [['X', 'C', 'T', s.a + '°', { r: 30 }], ['Y', 'C', 'T', s.b + '°', { r: 28 }]], names: false, width: 340,
            extra: [{ type: 'ground', y: 0, x0: -s.d * 0.12, x1: s.w + s.d * 1.12 }, { type: 'tree', at: [0, 0], h: s.h }, { type: 'text', at: [s.w, -0.07 * (s.w + s.d)], text: 'X' }, { type: 'text', at: [s.w + s.d, -0.07 * (s.w + s.d)], text: 'Y' }], aria: 'tree across a river, two sightings' });
          return 'Standing at point ' + t('X') + ' directly across a river from a tall tree, Jenny measures the angle of elevation to the top of the tree as ' + t(dg(s.a)) + '. She then walks ' + t(s.d) + ' m straight back from the river to point ' + t('Y') + ' and measures the angle of elevation to the same treetop as ' + t(dg(s.b)) + '.' + F;
        },
        parts: [
          { id: '8', level: 'ADV', make: function (r, s) {
            var eh = s.d / (rd(s.kb, 2) - rd(s.ka, 2)), et = s.d / (1 / rd(Tg.tan(s.b), 2) - 1 / rd(Tg.tan(s.a), 2));
            return near('Determine the height of the tree to the nearest metre. <i>(Neither triangle can be solved alone: write both horizontal distances in terms of the height ' + t('h') + ', then subtract.)</i>', s.h, 0, 'm', [
              { v: eh, code: 'ch-early', hint: earlyH(t(fr('1', TAN(s.b)))) + ' (and ' + t(fr('1', TAN(s.a))) + ')' }, { v: et, code: 'ch-early', hint: earlyH(t(TAN(s.a)) + ' and ' + t(TAN(s.b))) },
              { v: s.d * Tg.tan(s.b), code: 'ch-wrong-triangle', hint: 'The ' + t(s.d) + ' m is not the distance from ' + t('Y') + ' to the tree — it is only the gap between ' + t('X') + ' and ' + t('Y') + '. Write ' + t('w=' + fr('h', TAN(s.a))) + ' and ' + t('w+' + s.d + '=' + fr('h', TAN(s.b))) + ', then subtract.' },
              { v: s.d * Tg.tan(s.a), code: 'ch-wrong-triangle', hint: 'The ' + t(s.d) + ' m is the gap between ' + t('X') + ' and ' + t('Y') + ', not a side of the triangle at ' + t('X') + '. Write both horizontal distances in terms of ' + t('h') + ' and subtract.' },
              { v: s.d * Tg.tan(s.a - s.b), code: 'ch-angle-diff', hint: 'Subtracting the angles doesn’t give a right triangle. Use ' + t('w=' + fr('h', TAN(s.a))) + ' and ' + t('w+' + s.d + '=' + fr('h', TAN(s.b))) + '.' },
              radAlt(function (T) { return s.d / (1 / T.tan(s.b) - 1 / T.tan(s.a)); })],
              'Shared side: the tree — the vertical leg ' + t('h') + ' belongs to <b>both</b> right triangles, and the river width ' + t('w') + ' is part of both bases. Neither triangle has a known side, so write both bases in terms of ' + t('h') + '.<br>' +
              'From ' + t('X') + ': ' + t(TAN(s.a) + '=' + fr('h', 'w') + '\\Rightarrow w=' + fr('h', TAN(s.a))) + '. From ' + t('Y') + ': ' + t(TAN(s.b) + '=' + fr('h', 'w+' + s.d) + '\\Rightarrow w+' + s.d + '=' + fr('h', TAN(s.b))) + '.<br>' +
              'Subtract to eliminate ' + t('w') + ': ' + t('h\\left(' + fr('1', TAN(s.b)) + '-' + fr('1', TAN(s.a)) + '\\right)=' + s.d) + '<br>' +
              t(fr('1', TAN(s.b)) + '=' + v4(s.kb) + ',\\ ' + fr('1', TAN(s.a)) + '=' + v4(s.ka)) + ', difference ' + t('=' + v4(s.kb - s.ka)) + '<br>' + t('h=' + fr(s.d, v4(s.kb - s.ka)) + '=' + v4(s.h) + '\\approx ' + fx(s.h, 0)) + ' m' +
              (fx(eh, 0) !== fx(s.h, 0) ? '<br>Rounding the two quotients to ' + t(fx(s.kb, 2)) + ' and ' + t(fx(s.ka, 2)) + ' first gives ' + t(fx(eh, 0)) + ' m — wrong.' : ''),
              ['Let ' + t('w') + ' be the distance from ' + t('X') + ' to the tree. Write ' + t('w') + ' and ' + t('w+' + s.d) + ' each in terms of ' + t('h') + '.', 'Subtract the two equations so ' + t('w') + ' disappears, then solve for ' + t('h') + '.'], 'tree height from two sightings ' + s.d + ' m apart');
          } }] },
      /* ---------------- Q9 NR ---------------- */
      { num: '9', section: 'Numerical response', stem: '<i>(Numerical Response)</i>',
        shared: function (r) {
          return gen(r, function (r) { return { ab: r.int(14, 24), de: r.int(10, 20), bd: r.int(45, 70), th: r.int(40, 56) }; },
            function (p) { var o = { ab: p.ab, de: p.de, bd: p.bd, th: p.th }; o.bc = p.ab * Tg.tan(p.th); o.cd = p.bd - o.bc; o.ang = Tg.atan(o.cd / p.de); return o; }, function (s) { return s.cd / s.bd >= 0.4 && s.cd / s.bd <= 0.75; }, { ab: 19, de: 15, bd: 58, th: 48 });
        },
        parts: [
          { id: '9', level: 'ADV', make: function (r, s) {
            var F = fig({ pts: { B: [0, 0], C: [s.bc, 0], D: [s.bd, 0], A: [0, -s.ab], E: [s.bd, -s.de] }, segs: [['B', 'C'], ['C', 'D'], ['A', 'B', s.ab + ' m'], ['D', 'E', s.de + ' m'], ['A', 'C'], ['C', 'E']],
              right: [['B', 'A', 'C'], ['D', 'C', 'E']], angles: [['A', 'B', 'C', s.th + '°', { r: 28 }]], extra: [{ type: 'text', at: [s.bd / 2, s.ab * 0.18], text: 'BD = ' + s.bd + ' m' }], aria: 'two right triangles joined at C' });
            var f = function (bc) { return Tg.atan((s.bd - bc) / s.de); };
            return near('In the diagram, ' + t('AB=' + s.ab) + ' m, ' + t('DE=' + s.de) + ' m, ' + t('BD=' + s.bd) + ' m, ' + t('AB\\perp BD') + ', ' + t('ED\\perp BD') + ', and ' + t('\\angle BAC=' + dg(s.th)) + '. To the nearest degree, the measure of ' + t('\\angle CED') + ' is ________°.' + F, s.ang, 0, '°', early(f, s.bc, t('BC')).concat([
              { v: 90 - s.ang, code: 'ch-complement', hint: 'That is ' + t('\\angle DCE') + '. From ' + t('\\angle CED') + ', ' + t('CD') + ' is opposite and ' + t('DE') + ' is adjacent.' },
              { v: Tg.atan((s.bd - s.ab / Tg.tan(s.th)) / s.de), code: 'ch-inverted', hint: 'From ' + t('\\angle BAC') + ', ' + t('BC') + ' is opposite and ' + t('AB') + ' is adjacent: ' + t('BC=' + s.ab + TAN(s.th)) + '.' },
              { v: Tg.atan(s.bc / s.de), code: 'ch-one-piece', hint: t('BC') + ' belongs to the first triangle. The side of ' + t('\\triangle CDE') + ' is ' + t('CD=BD-BC') + '.' },
              radAlt(function (T) { return T.atan((s.bd - s.ab * T.tan(s.th)) / s.de); })]),
              'Shared side: the segment ' + t('BD=' + s.bd) + ' m, which ' + t('C') + ' splits into ' + t('BC') + ' and ' + t('CD') + '. Solve ' + t('\\triangle ABC') + ' first.<br>' +
              t(TAN(s.th) + '=' + fr('BC', s.ab) + '\\Rightarrow BC=' + s.ab + TAN(s.th) + '=' + v4(s.bc)) + ' m<br>' + t('CD=' + s.bd + '-' + v4(s.bc) + '=' + v4(s.cd)) + ' m<br>' +
              t('\\tan(\\angle CED)=' + fr(v4(s.cd), s.de) + '\\Rightarrow \\angle CED=' + v4(s.ang) + '^\\circ\\approx ' + dg(fx(s.ang, 0))),
              ['Find ' + t('BC') + ' in ' + t('\\triangle ABC') + ', then ' + t('CD=BD-BC') + '.', 'In ' + t('\\triangle CDE') + ', ' + t('CD') + ' is opposite ' + t('\\angle CED') + ' and ' + t('DE') + ' is adjacent.'], 'NR: ∠CED through C', true);
          } }] },
      /* ---------------- Q10 (Extension) ---------------- */
      { num: '10', section: 'Extension — Three Dimensions',
        shared: function (r) {
          return gen(r, function (r) { return { ab: r.int(10, 16), bc: tenth(r, 6.0, 10.0), ht: r.pick([1.60, 1.65, 1.70, 1.75, 1.80, 1.85, 1.90]) }; },
            function (p) { var o = { ab: p.ab, bc: p.bc, ht: p.ht }; o.am = hyp(p.ab / 2, p.bc); o.ang = Tg.atan(p.ht / o.am); return o; }, function () { return true; }, { ab: 13, bc: 8.4, ht: 1.75 });
        },
        stem: function (s) {
          var F = fig({ pts: { B: [0, 0], A: [4.33, 0], C: [0.6, -2.8], D: [4.93, -2.8], M: [2.765, -2.8], E: [4.33, 1.0] }, segs: [['A', 'B', s.ab + ' m'], ['B', 'C', g1(s.bc) + ' m'], ['C', 'D'], ['D', 'A'], ['A', 'E', { width: 3 }], ['E', 'M', DASH], ['A', 'M', { dash: 1, width: 1.4, color: '#13807a' }]], names: { B: 'B', C: 'C', D: 'D', M: 'M', E: 'E' }, extra: [{ type: 'text', at: [4.62, -0.3], text: 'A' }, { type: 'text', at: [5.05, 0.55], text: s.ht.toFixed(2) + ' m' }], aria: 'rectangular field with a referee at A' });
          return '<i>(Extension)</i> ' + t('ABCD') + ' represents a rectangular playing field, drawn at a slight angle for perspective. A referee stands at corner ' + t('A') + ', and the tip of the referee’s shadow lands exactly at ' + t('M') + ', the midpoint of ' + t('CD') + '. The referee is ' + t(s.ht.toFixed(2)) + ' m tall, ' + t('AB=' + s.ab) + ' m and ' + t('BC=' + g1(s.bc)) + ' m.' + F;
        },
        parts: [
          { id: '10', level: 'ADV', make: function (r, s) {
            var f = function (am) { return Tg.atan(s.ht / am); }, h = s.ht.toFixed(2);
            return chain('Find the shadow length ' + t('AM') + ' (to at least two decimal places), then ' + t('\\angle EMA') + ', the angle of elevation of the sun, to the nearest degree.', [
              { label: t('AM='), name: 'AM', unit: 'm', mid: true, x: s.am, alts: [{ v: hyp(s.ab, s.bc), code: 'ch-midpoint', hint: t('M') + ' is the <b>midpoint</b> of ' + t('CD') + ', so ' + t('DM=\\tfrac12(' + s.ab + ')=' + g1(s.ab / 2)) + ' m.' }, { v: s.ab / 2 + s.bc, code: 'ch-add-legs', hint: t('AM') + ' is the hypotenuse of right ' + t('\\triangle ADM') + ': use the Pythagorean theorem, not addition.' }] },
              { label: t('\\angle EMA='), name: '∠EMA', unit: '°', x: s.ang, dp: 0, alts: early(f, s.am, t('AM')).concat([
                { v: Tg.atan(s.ht / s.bc), code: 'ch-midpoint', hint: 'The shadow runs from ' + t('A') + ' to ' + t('M') + ', not along ' + t('AD') + '. Find ' + t('AM') + ' first.' },
                { v: Tg.atan(s.ht / hyp(s.ab, s.bc)), code: 'ch-midpoint', hint: t('M') + ' is the midpoint of ' + t('CD') + ': ' + t('DM') + ' is half of ' + t(s.ab) + ' m.' },
                { v: Tg.atan(s.am / s.ht), code: 'ch-complement', hint: 'That is the angle at ' + t('E') + '. From ' + t('M') + ', the referee ' + t('AE') + ' is opposite and the shadow ' + t('AM') + ' is adjacent.' },
                radAlt(function (T) { return T.atan(s.ht / s.am); })]) }],
              'Shared side: the shadow ' + t('AM') + ' — the hypotenuse of a right triangle in the ground (base) plane and the horizontal leg of the vertical triangle ' + t('AME') + '.<br>' +
              t('ABCD') + ' is a true rectangle (only the sketch is skewed), so ' + t('\\angle D=90^\\circ') + ', ' + t('DM=\\tfrac12(' + s.ab + ')=' + g1(s.ab / 2)) + ' m and ' + t('AD=BC=' + g1(s.bc)) + ' m.<br>' +
              t('AM=\\sqrt{' + g1(s.ab / 2) + '^{2}+' + g1(s.bc) + '^{2}}=' + v4(s.am)) + ' m<br>' + t('\\tan(\\angle EMA)=' + fr(h, v4(s.am)) + '\\Rightarrow \\angle EMA=' + v4(s.ang) + '^\\circ\\approx ' + dg(fx(s.ang, 0))),
              ['First solve the right triangle lying flat on the field: ' + t('\\triangle ADM') + ', right-angled at ' + t('D') + '.', 'Then ' + t('\\triangle AME') + ' stands up on ' + t('AM') + ' with the right angle at ' + t('A') + '.'], 'sun angle: shadow to midpoint');
          } }] },
      /* ---------------- Q11 (MC, Extension) ---------------- */
      { num: '11', stem: '<i>(Multiple Choice; Extension)</i>',
        shared: function (r) {
          return gen(r, function (r) { var tr = r.pick([[9, 12], [6, 8], [5, 12], [8, 15], [12, 16], [12, 9], [15, 20], [7, 24]]), q = r.pick([[4, 3], [3, 2], [5, 3], [3, 4], [6, 5], [5, 4], [2, 3], [4, 5]]); return { a: tr[0], b: tr[1], p: q[0], q: q[1] }; },
            function (p) { var c = hyp(p.a, p.b); return { a: p.a, b: p.b, c: Math.round(c), h: Math.round(c) * p.p / p.q, p: p.p, q: p.q }; },
            function (s) { return s.h % 1 === 0 && s.h >= 8 && s.h <= 40; }, { a: 9, b: 12, p: 4, q: 3 });
        },
        parts: [
          { id: '11', level: 'PRG', make: function (r, s) {
            function rat(n, d) { var g = (function G(x, y) { return y ? G(y, x % y) : x; })(n, d); return [n / g, d / g]; }
            function tx(q) { return q[1] === 1 ? String(q[0]) : fr(q[0], q[1]); }
            var right = rat(s.h, s.c), cand = [
              { q: rat(s.c, s.h), why: 'That is the reciprocal. From ' + t('\\angle ACE') + ', ' + t('AE') + ' is <b>opposite</b> and ' + t('AC') + ' is adjacent: ' + t('\\tan=' + fr('AE', 'AC')) + '.' },
              { q: rat(s.c, s.b), why: 'That compares two sides of the base triangle. ' + t('\\angle ACE') + ' is in the vertical triangle ' + t('ACE') + ': ' + t('\\tan=' + fr('AE', 'AC')) + '.' },
              { q: rat(s.h, s.b), why: t('BC') + ' is an edge of the base, not the diagonal. The horizontal leg of ' + t('\\triangle ACE') + ' is ' + t('AC') + ', found with the Pythagorean theorem.' },
              { q: rat(s.h, s.a + s.b), why: t('AC') + ' is not ' + t('AB+BC') + '; it is the hypotenuse of base triangle ' + t('ABC') + ': ' + t('AC=\\sqrt{' + s.a + '^{2}+' + s.b + '^{2}}') + '.' },
              { q: rat(s.h, s.a), why: t('AB') + ' is an edge of the base, not the diagonal ' + t('AC') + '.' }];
            var seen = {}; seen[right.join('/')] = 1; var opts = [{ html: t(tx(right)), right: true }];
            cand.forEach(function (c) { var k = c.q.join('/'); if (opts.length < 4 && !seen[k]) { seen[k] = 1; opts.push({ html: t(tx(c.q)), why: c.why }); } });
            var F = fig({ pts: { A: [0, 0], B: [1.8, 0], D: [0.6, 0.5], C: [2.4, 0.5], E: [0, 3.6], F: [1.8, 3.6], H: [0.6, 4.1], G: [2.4, 4.1] },
              segs: [['A', 'B', s.a + ' m'], ['B', 'F'], ['F', 'E'], ['E', 'A', s.h + ' m'], ['E', 'H'], ['H', 'G'], ['G', 'F'], ['G', 'C'], ['B', 'C', s.b + ' m', { dash: 1, width: 1.4, side: 1 }], ['A', 'D', { dash: 1, width: 1.4 }], ['D', 'C', { dash: 1, width: 1.4 }], ['D', 'H', { dash: 1, width: 1.4 }], ['A', 'C', { dash: 1, width: 1.6, color: '#13807a' }], ['C', 'E', { dash: 1, width: 1.6, color: '#13807a' }]], aria: 'rectangular prism' });
            return mc(r, 'A rectangular prism has base dimensions ' + t('AB=' + s.a) + ' m and ' + t('BC=' + s.b) + ' m, and height ' + t('AE=' + s.h) + ' m (' + t('E') + ' is directly above ' + t('A') + '). The tangent of ' + t('\\angle ACE') + ' (the angle between diagonal ' + t('CE') + ' and the base plane ' + t('ABCD') + ') is' + F, opts,
              'Shared side: the base diagonal ' + t('AC') + ' — the hypotenuse of base triangle ' + t('ABC') + ' and a leg of the vertical triangle ' + t('ACE') + '.<br>' + t('AC=\\sqrt{' + s.a + '^{2}+' + s.b + '^{2}}=' + s.c) + ' m<br>' +
              t('E') + ' is directly above ' + t('A') + ', so ' + t('\\triangle ACE') + ' is right-angled at ' + t('A') + '. From ' + t('\\angle ACE') + ', ' + t('AE') + ' is opposite and ' + t('AC') + ' is adjacent: ' + t('\\tan(\\angle ACE)=' + fr(s.h, s.c) + '=' + tx(right)),
              ['Find the base diagonal ' + t('AC') + ' first (Pythagorean theorem).', 'In ' + t('\\triangle ACE') + ' the right angle is at ' + t('A') + '.'], 'tan of angle between space diagonal and base');
          } }] }
    ],
    extra: EXTRA()
  });

  /* ======================= EXTRA PRACTICE ======================= */
  /* EP1(a) / EP2(b): K apex, altitude KM, base L–M–N. knownRight = the side and angle are in △KMN instead of △KLM */
  function e1aGen(r, swap) {
    return gen(r, function (r) { return { side: tenth(r, 5.0, 9.0), L: r.int(30, 40), N: r.int(50, 60), kr: swap ? r.chance(0.5) : false }; },
      function (p) { var o = { side: p.side, L: p.L, N: p.N, kr: p.kr }; if (p.kr) { o.mn = p.side; o.km = p.side * Tg.tan(p.N); o.lm = o.km / Tg.tan(p.L); } else { o.lm = p.side; o.km = p.side * Tg.tan(p.L); o.mn = o.km / Tg.tan(p.N); } return o; },
      function () { return true; }, { side: 7.4, L: 34, N: 58, kr: false });
  }
  function e1aFig(s) { return altFig({ names: { L: 'L', F: 'M', R: 'N', P: 'K' }, l: s.lm, rr: s.mn, h: s.km, lab: { LF: s.kr ? '?' : g1(s.lm) + ' m', FR: s.kr ? g1(s.mn) + ' m' : '?' }, ang: { L: s.L + '°', R: s.N + '°' } }); }
  /* EP1(b) / EP2(c): right angles at C and A; AB is the hypotenuse of △ABC and a leg of △ABD */
  function e1bGen(r) {
    return gen(r, function (r) { return { ac: tenth(r, 6.0, 10.0), A: r.int(30, 45), abd: r.int(18, 32) }; },
      function (p) { var o = { ac: p.ac, A: p.A, abd: p.abd }; o.bc = p.ac * Tg.tan(p.A); o.ab = p.ac / Tg.cos(p.A); o.ad = o.ab * Tg.tan(p.abd); return o; }, function () { return true; }, { ac: 9.0, A: 37, abd: 25 });
  }
  function e1bFig(s) { var k = s.ad / s.ab; return fig({ pts: { C: [0, 0], A: [s.ac, 0], B: [0, s.bc], D: [s.ac + s.bc * k, s.ac * k] }, segs: [['C', 'A', g1(s.ac) + ' cm'], ['A', 'B'], ['B', 'C'], ['A', 'D', '?'], ['D', 'B']], right: [['C', 'A', 'B'], ['A', 'B', 'D']], angles: [['A', 'C', 'B', s.A + '°', { r: 30 }], ['B', 'A', 'D', s.abd + '°', { r: 40 }]], aria: 'two right triangles sharing AB' }); }
  /* EP1(c): right angles at G and H; two sides of △FGH known */
  function e1cGen(r) {
    return gen(r, function (r) { return { fg: tenth(r, 8.0, 14.0), gh: tenth(r, 10.0, 18.0), f: r.int(25, 40) }; },
      function (p) { var o = { fg: p.fg, gh: p.gh, f: p.f }; o.fh = hyp(p.fg, p.gh); o.hj = o.fh * Tg.tan(p.f); return o; }, function () { return true; }, { fg: 12.0, gh: 16.0, f: 33 });
  }
  function e1cFig(s) { var k = s.hj / s.fh; return fig({ pts: { G: [0, 0], H: [s.gh, 0], F: [0, s.fg], J: [s.gh + s.fg * k, s.gh * k] }, segs: [['F', 'G', g1(s.fg) + ' cm'], ['G', 'H', g1(s.gh) + ' cm'], ['F', 'H'], ['H', 'J'], ['F', 'J', '?']], right: [['G', 'H', 'F'], ['H', 'F', 'J']], angles: [['F', 'H', 'J', s.f + '°', { r: 36 }]], aria: 'two right triangles sharing FH' }); }

  function EXTRA() {
    var E = [];
    /* ---------- Part A ---------- */
    E.push({ num: '1', section: 'Extra practice A — Which triangle first, and what gets handed over',
      stem: '<b>No calculation at all in this question.</b> For each figure, decide which of the two right triangles can be solved first (and what makes it solvable), which side is shared, and which triangle that side is handed to.',
      shared: function (r) { return { A: e1aGen(r, true), B: e1bGen(r), C: e1cGen(r) }; },
      parts: [
        { id: 'e1a', level: 'EMG', make: function (r, S) {
          var s = S.A, f = s.kr ? 'KMN' : 'KLM', o = s.kr ? 'KLM' : 'KMN', ks = s.kr ? 'MN' : 'LM', ka = s.kr ? 'N' : 'L', oa = s.kr ? 'L' : 'N', want = s.kr ? 'LM' : 'MN';
          return mc(r, t('KM') + ' is perpendicular to ' + t('LN') + ', and ' + t('M') + ' lies between ' + t('L') + ' and ' + t('N') + '. The length ' + t(want) + ' is required.' + e1aFig(s), [
            { html: 'Solve ' + t('\\triangle ' + f) + ' first (it has ' + t(ks) + ' and ' + t('\\angle ' + ka) + '); hand the altitude ' + t('KM') + ' to ' + t('\\triangle ' + o) + '.', right: true },
            { html: 'Solve ' + t('\\triangle ' + o) + ' first (it has ' + t('\\angle ' + oa) + ' and a right angle); hand ' + t('KM') + ' to ' + t('\\triangle ' + f) + '.', why: t('\\triangle ' + o) + ' has only one fact besides its right angle (an angle, no side). Every ratio in it would have two unknowns.' },
            { html: 'Solve ' + t('\\triangle ' + f) + ' first; hand ' + t('K' + ka) + ' to ' + t('\\triangle ' + o) + '.', why: t('K' + ka) + ' is not a side of ' + t('\\triangle ' + o) + '. The only side the two triangles have in common is the altitude ' + t('KM') + '.' },
            { html: 'Solve ' + t('\\triangle ' + f) + ' first; hand ' + t('LN') + ' to ' + t('\\triangle ' + o) + '.', why: t('LN') + ' is the whole base — it isn’t a side of either right triangle. The triangles share the altitude ' + t('KM') + '.' }],
            t('\\triangle ' + f) + ' can be solved first: right angle at ' + t('M') + ', the side ' + t(ks) + ' and ' + t('\\angle ' + ka) + ' — two facts besides the right angle.<br>Shared side: the altitude ' + t('KM') + ', a <b>leg</b> of both triangles.<br>It is handed to ' + t('\\triangle ' + o) + ', where ' + t('KM') + ' and ' + t('\\angle ' + oa) + ' give ' + t(want) + '.',
            ['A right triangle can be solved when it has two facts besides its right angle (a side and an angle, or two sides).', 'The shared side is a side of both triangles.'], 'which triangle first: altitude');
        } },
        { id: 'e1b', level: 'EMG', make: function (r, S) {
          var s = S.B;
          return mc(r, 'The right angles are at ' + t('C') + ' and at ' + t('A') + '. The length ' + t('AD') + ' is required.' + e1bFig(s), [
            { html: 'Solve ' + t('\\triangle ABC') + ' first (' + t('AC') + ' and ' + t('\\angle A') + ' are known); hand ' + t('AB') + ' — its hypotenuse — to ' + t('\\triangle ABD') + ', where it is a leg.', right: true },
            { html: 'Solve ' + t('\\triangle ABC') + ' first; hand ' + t('AC') + ' to ' + t('\\triangle ABD') + '.', why: t('AC') + ' is not a side of ' + t('\\triangle ABD') + '. Look for the segment that belongs to both triangles.' },
            { html: 'Solve ' + t('\\triangle ABD') + ' first (right angle at ' + t('A') + ' and ' + t('\\angle ABD') + ' known); hand ' + t('AB') + ' to ' + t('\\triangle ABC') + '.', why: t('\\triangle ABD') + ' has only one fact besides its right angle — an angle and no side.' },
            { html: 'Solve ' + t('\\triangle ABC') + ' first; hand ' + t('AB') + ' to ' + t('\\triangle ABD') + ', where it is again the hypotenuse.', why: 'In ' + t('\\triangle ABD') + ' the right angle is at ' + t('A') + ', so its hypotenuse is ' + t('BD') + '. There ' + t('AB') + ' is a leg.' }],
            t('\\triangle ABC') + ' can be solved first: right angle at ' + t('C') + ', ' + t('AC=' + g1(s.ac)) + ' cm and ' + t('\\angle A=' + dg(s.A)) + '.<br>Shared side: ' + t('AB') + ' — the <b>hypotenuse</b> of ' + t('\\triangle ABC') + ' and a <b>leg</b> of ' + t('\\triangle ABD') + '.<br>It is handed to ' + t('\\triangle ABD') + ' (right angle at ' + t('A') + '), where ' + t('AB') + ' and ' + t('\\angle ABD=' + dg(s.abd)) + ' give ' + t('AD') + '.',
            ['Which triangle has a side and an angle besides its right angle?', 'Which segment is a side of both triangles?'], 'which triangle first: hypotenuse to leg');
        } },
        { id: 'e1c', level: 'EMG', make: function (r, S) {
          var s = S.C;
          return mc(r, 'The right angles are at ' + t('G') + ' and at ' + t('H') + '. The length ' + t('FJ') + ' is required.' + e1cFig(s), [
            { html: 'Solve ' + t('\\triangle FGH') + ' first with the Pythagorean theorem (two sides known — no angle needed); hand ' + t('FH') + ' to ' + t('\\triangle FHJ') + '.', right: true },
            { html: t('\\triangle FGH') + ' can’t be solved because it has no angle, so start with ' + t('\\triangle FHJ') + '.', why: 'Two sides of a right triangle are enough: the Pythagorean theorem gives the third. ' + t('\\triangle FHJ') + ' has only the ' + t(dg(s.f)) + ' angle.' },
            { html: 'Solve ' + t('\\triangle FGH') + ' first; hand ' + t('GH') + ' to ' + t('\\triangle FHJ') + '.', why: t('GH') + ' is not a side of ' + t('\\triangle FHJ') + '. The two triangles share ' + t('FH') + '.' },
            { html: 'Solve ' + t('\\triangle FGH') + ' first; hand ' + t('FH') + ' to ' + t('\\triangle FHJ') + ', where it is the hypotenuse.', why: 'In ' + t('\\triangle FHJ') + ' the right angle is at ' + t('H') + ', so the hypotenuse is ' + t('FJ') + '. ' + t('FH') + ' is a leg there.' }],
            t('\\triangle FGH') + ' can be solved first: right angle at ' + t('G') + ' and <b>two sides</b>, ' + t('FG') + ' and ' + t('GH') + '. No angle is needed — the Pythagorean theorem finds ' + t('FH') + '.<br>Shared side: ' + t('FH') + ' — the hypotenuse of ' + t('\\triangle FGH') + ' and a leg of ' + t('\\triangle FHJ') + '.<br>It is handed to ' + t('\\triangle FHJ') + ', where ' + t('FH') + ' and ' + t('\\angle HFJ=' + dg(s.f)) + ' give ' + t('FJ') + '.',
            ['Careful: the triangle that can be solved first doesn’t need a trig ratio at all.', 'Two sides of a right triangle are enough to find the third.'], 'which triangle first: Pythagoras');
        } }] });
    E.push({ num: '2', stem: '<b>The method, written down.</b>',
      shared: function (r) { return { A: e1aGen(r, false), B: e1bGen(r) }; },
      parts: [
        { id: 'e2a', level: 'BEG', make: function (r) {
          function st(a, b, c, d) { return 'Step 1: look for a triangle with <b>' + a + '</b> facts besides its right angle. Step 2: solve it for the <b>' + b + '</b>, keeping <b>' + c + '</b>. Step 3: carry it into the other triangle, where it is now a <b>' + d + '</b> fact, and finish.'; }
          return mc(r, 'Which version of the three steps describes the method exactly?', [
            { html: st('two', 'shared side', 'full calculator precision', 'known'), right: true },
            { html: st('one', 'shared side', 'full calculator precision', 'known'), why: 'With only one fact besides the right angle (just an angle), every equation has two unknowns. A triangle needs two facts: a side and an angle, or two sides.' },
            { html: st('two', 'hypotenuse', 'one decimal place', 'known'), why: 'What gets handed over is the shared side — it may be a leg — and it must not be rounded until the very end.' },
            { html: st('two', 'shared side', 'one decimal place', 'rounded'), why: 'Rounding the shared side before handing it over puts a wrong number into the second triangle. Keep every digit.' }],
            'Step 1: a triangle can be solved when it has <b>two</b> facts besides its right angle. Step 2: solve it for the <b>shared side</b>, keeping <b>full calculator (unrounded) precision</b>. Step 3: in the second triangle that length is now a <b>known</b> fact, so finish there.',
            ['How many facts (besides the right angle) does a right triangle need before you can solve it?'], 'the method in three steps');
        } },
        { id: 'e2b', level: 'EMG', make: function (r, S) {
          var s = S.A;
          return mc(r, 'In the figure, ' + t('KM\\perp LN') + ' and the length ' + t('MN') + ' is required. A student starts with ' + t('\\triangle KMN') + ' and writes ' + t(TAN(s.N) + '=' + fr('KM', 'MN')) + '. Why can’t this equation be solved?' + e1aFig(s), [
            { html: 'It is <b>one equation</b> with <b>two unknowns</b> (' + t('KM') + ' and ' + t('MN') + '), so infinitely many pairs fit. ' + t('KM') + ' must first come from ' + t('\\triangle KLM') + '.', right: true },
            { html: 'Because ' + t(TAN(s.N)) + ' is greater than ' + t('1') + ', so no triangle can have that ratio.', why: 'Tangents of angles above ' + t('45^\\circ') + ' are greater than 1 — that is fine. The trouble is the number of unknowns.' },
            { html: 'It can be solved: ' + t('MN=' + fr('KM', TAN(s.N))) + '.', why: 'That only rearranges the equation; ' + t('KM') + ' is still unknown. One equation can’t fix two unknowns.' },
            { html: 'Tangent can’t be used in a triangle that shares a side with another triangle.', why: 'SOH CAH TOA works in any right triangle. The problem is that ' + t('\\triangle KMN') + ' has no known side yet.' }],
            'In ' + t('\\triangle KMN') + ' both ' + t('KM') + ' and ' + t('MN') + ' are unknown, so ' + t(TAN(s.N) + '=' + fr('KM', 'MN')) + ' is <b>one equation</b> in <b>two unknowns</b>: every pair whose quotient is ' + t(v4(Tg.tan(s.N))) + ' fits. Only when ' + t('KM') + ' arrives from ' + t('\\triangle KLM') + ' (which has ' + t('LM') + ' and ' + t('\\angle L') + ') does it become one equation in one unknown.',
            ['Count the unknowns in the student’s equation.'], 'one equation, two unknowns');
        } },
        { id: 'e2c', level: 'EMG', make: function (r, S) {
          var s = S.B;
          return mc(r, 'Right angles at ' + t('C') + ' and ' + t('A') + '. The shared side ' + t('AB') + ' is the <b>hypotenuse</b> of ' + t('\\triangle ABC') + ' and a <b>leg</b> of ' + t('\\triangle ABD') + '. What difference does that make?' + e1bFig(s), [
            { html: 'None to the method (solve the triangle with two facts, carry ' + t('AB') + ' across), but it changes the <b>ratio</b>: sides are named from the angle in the triangle you are in, so ' + t('AB') + ' needs CAH in ' + t('\\triangle ABC') + ' and TOA in ' + t('\\triangle ABD') + '.', right: true },
            { html: 'The method changes: you must start with ' + t('\\triangle ABD') + ' because ' + t('AB') + ' is only a leg there.', why: 'You always start with the triangle that has two facts — here ' + t('\\triangle ABC') + '. The role of ' + t('AB') + ' doesn’t change that.' },
            { html: 'No difference at all: it is the same segment, so the same ratio is used in both triangles.', why: 'The segment is the same, but its <b>role</b> changes: hypotenuse in ' + t('\\triangle ABC') + ', adjacent leg in ' + t('\\triangle ABD') + '. The ratio must match the role.' },
            { html: 'A hypotenuse can’t be handed over — only legs can be shared.', why: 'Any side can be shared. Here the hypotenuse of one triangle is a leg of the other, and the method still works.' }],
            'The method is the same: solve ' + t('\\triangle ABC') + ' (it has ' + t('AC') + ' and ' + t('\\angle A') + ') and carry ' + t('AB') + ' over.<br>The ratio changes because a side is named opposite / adjacent / hypotenuse relative to the angle in the triangle you are working in: in ' + t('\\triangle ABC') + ', ' + t(COS(s.A) + '=' + fr('AC', 'AB')) + ' (CAH); in ' + t('\\triangle ABD') + ', ' + t('AB') + ' is the leg adjacent to ' + t('\\angle ABD') + ', so ' + t(TAN(s.abd) + '=' + fr('AD', 'AB')) + ' (TOA).',
            ['Opposite, adjacent and hypotenuse depend on the triangle and the angle you are using.'], 'hypotenuse in one, leg in the other');
        } }] });

    /* ---------- Part B ---------- */
    E.push({ num: '3', section: 'Extra practice B — The two triangles share a leg',
      shared: function (r) {
        return gen(r, function (r) { return { ad: tenth(r, 3.5, 6.5), A: r.int(20, 32), C: r.int(35, 50) }; },
          function (p) { var o = { ad: p.ad, A: p.A, C: p.C }; o.bd = p.ad * Tg.tan(p.A); o.dc = o.bd / Tg.tan(p.C); o.ac = p.ad + o.dc; o.bc = o.bd / Tg.sin(p.C); return o; }, function () { return true; }, { ad: 4.9, A: 26, C: 41 });
      },
      stem: function (s) {
        var F = fig({ pts: { A: [0, 0], D: [s.ad, 0], C: [s.ac, 0], B: [s.ad, s.bd] }, segs: [['A', 'D', g1(s.ad) + ' m'], ['D', 'C'], ['A', 'B'], ['B', 'C'], ['B', 'D']], right: [['D', 'C', 'B']], angles: [['A', 'D', 'B', s.A + '°', { r: 34 }], ['C', 'D', 'B', s.C + '°', { r: 30 }]], aria: 'roof truss' });
        return '<b>A roof truss with an internal strut.</b> The truss has a horizontal bottom chord ' + t('AC') + ', rafters ' + t('AB') + ' and ' + t('BC') + ', and a vertical strut ' + t('BD') + ' from the ridge ' + t('B') + ' down to ' + t('D') + ' on the chord. Rafter ' + t('AB') + ' meets the chord at ' + t(dg(s.A)) + ', rafter ' + t('BC') + ' meets it at ' + t(dg(s.C)) + ', and ' + t('AD=' + g1(s.ad)) + ' m. Give lengths to the nearest tenth of a metre.' + F;
      },
      parts: [
        { id: 'e3a', level: 'EMG', make: function (r, s) {
          return near('Determine the length of the strut ' + t('BD') + '.', s.bd, 1, 'm', [{ v: s.ad / Tg.tan(s.A), code: 'ch-inverted', hint: 'From ' + t('\\angle A') + ', ' + t('BD') + ' is opposite and ' + t('AD') + ' is adjacent: ' + t('BD=' + g1(s.ad) + TAN(s.A)) + '.' }, { v: s.ad * Tg.sin(s.A), code: 'ch-ratio', hint: t('AD') + ' is a leg (adjacent), not the hypotenuse: use tangent.' }, radAlt(function (T) { return s.ad * T.tan(s.A); })],
            t('\\triangle ABD') + ', right angle at ' + t('D') + '. From ' + t('\\angle A=' + dg(s.A)) + ': ' + t('AD') + ' is adjacent, ' + t('BD') + ' is opposite (TOA).<br>' + t('BD=' + g1(s.ad) + TAN(s.A) + '=' + v4(s.bd) + '\\approx ' + fx(s.bd, 1)) + ' m',
            ['Which triangle contains both ' + t('AD') + ' and the ' + t(dg(s.A)) + ' angle?'], 'truss strut BD');
        } },
        { id: 'e3b', level: 'PRG', make: function (r, s) {
          var f = function (bd) { return bd / Tg.tan(s.C); };
          return near('Determine ' + t('DC') + '.', s.dc, 1, 'm', early(f, s.bd, t('BD')).concat([{ v: s.bd * Tg.tan(s.C), code: 'ch-inverted', hint: 'From ' + t('\\angle C') + ', ' + t('BD') + ' is opposite and ' + t('DC') + ' is adjacent: ' + t(TAN(s.C) + '=' + fr('BD', 'DC')) + ', so divide.' }, { v: s.ad * Tg.tan(s.A) * Tg.tan(s.C), code: 'ch-inverted', hint: t('DC=' + fr('BD', TAN(s.C))) + ' — divide by the tangent.' }, radAlt(function (T) { return s.ad * T.tan(s.A) / T.tan(s.C); })]),
            'Solve ' + t('\\triangle ABD') + ' first: ' + t('BD=' + g1(s.ad) + TAN(s.A) + '=' + v4(s.bd)) + ' m (unrounded).<br>Hand ' + t('BD') + ' to ' + t('\\triangle BDC') + ': from ' + t('\\angle C') + ', ' + t('BD') + ' is opposite and ' + t('DC') + ' adjacent (TOA, unknown in the denominator).<br>' + t('DC=' + fr(v4(s.bd), TAN(s.C)) + '=' + v4(s.dc) + '\\approx ' + fx(s.dc, 1)) + ' m',
            ['The strut ' + t('BD') + ' is the shared side: find it first, unrounded.', 'In ' + t('\\triangle BDC') + ', ' + t(TAN(s.C) + '=' + fr('BD', 'DC')) + '.'], 'truss DC');
        } },
        { id: 'e3c', level: 'PRG', make: function (r, s) {
          var f = function (bd) { return s.ad + bd / Tg.tan(s.C); };
          return near('Determine the full span ' + t('AC') + ' of the truss.', s.ac, 1, 'm', early(f, s.bd, t('BD')).concat([{ v: s.dc, code: 'ch-one-piece', hint: 'That is only ' + t('DC') + '. The span is ' + t('AC=AD+DC') + '.' }, { v: s.ad + s.bd * Tg.tan(s.C), code: 'ch-inverted', hint: t('DC=' + fr('BD', TAN(s.C))) + ' — divide by the tangent.' }, radAlt(function (T) { return s.ad + s.ad * T.tan(s.A) / T.tan(s.C); })]),
            t('BD=' + g1(s.ad) + TAN(s.A) + '=' + v4(s.bd)) + ' m, ' + t('DC=' + fr(v4(s.bd), TAN(s.C)) + '=' + v4(s.dc)) + ' m<br>' + t('AC=AD+DC=' + g1(s.ad) + '+' + v4(s.dc) + '=' + v4(s.ac) + '\\approx ' + fx(s.ac, 1)) + ' m',
            ['Find ' + t('BD') + ', then ' + t('DC') + ', then add ' + t('AD') + '.'], 'truss span AC');
        } },
        { id: 'e3d', level: 'PRG', make: function (r, s) {
          var f = function (bd) { return bd / Tg.sin(s.C); };
          return chain('Determine the length of the right rafter ' + t('BC') + ', and name the side that did the handing over.', [
            { label: t('BC='), name: 'BC', unit: 'm', x: s.bc, dp: 1, alts: early(f, s.bd, t('BD')).concat([{ v: s.bd * Tg.sin(s.C), code: 'ch-inverted', hint: t(SIN(s.C) + '=' + fr('BD', 'BC')) + ', so ' + t('BC=' + fr('BD', SIN(s.C))) + ' — divide.' }, { v: s.bd / Tg.cos(s.C), code: 'ch-ratio', hint: 'From ' + t('\\angle C') + ', ' + t('BD') + ' is <b>opposite</b> and ' + t('BC') + ' is the hypotenuse: SOH.' }, { v: s.dc, code: 'ch-ratio', hint: 'That is ' + t('DC') + ', along the chord. The rafter ' + t('BC') + ' is the hypotenuse: SOH.' }]) },
            { label: 'Side handed over:', name: 'Side handed over', text: true, key: 'BD', show: t('BD') + ' (the strut)', check: segCheck('BD', 'The side handed over belongs to <b>both</b> right triangles ' + t('ABD') + ' and ' + t('BDC') + '.') }],
            t('BD=' + v4(s.bd)) + ' m (from ' + t('\\triangle ABD') + ').<br>' + t('\\triangle BDC') + ': ' + t('BD') + ' is opposite ' + t('\\angle C') + ', ' + t('BC') + ' is the hypotenuse (SOH): ' + t('BC=' + fr(v4(s.bd), SIN(s.C)) + '=' + v4(s.bc) + '\\approx ' + fx(s.bc, 1)) + ' m<br>The strut ' + t('BD') + ' did the handing over: it is a <b>leg</b> of both right triangles.',
            ['In ' + t('\\triangle BDC') + ', which side is opposite ' + t('\\angle C') + ' and which is the hypotenuse?'], 'truss rafter BC');
        } }] });
    E.push({ num: '4',
      shared: function (r) {
        return gen(r, function (r) { return { wx: tenth(r, 7.0, 11.0), w: r.int(25, 36), y: r.int(50, 65) }; },
          function (p) { var o = { wx: p.wx, w: p.w, y: p.y }; o.xm = p.wx * Tg.sin(p.w); o.wm = p.wx * Tg.cos(p.w); o.my = o.xm / Tg.tan(p.y); o.wy = o.wm + o.my; o.xy = o.xm / Tg.sin(p.y); o.area = o.wy * o.xm; return o; }, function (s) { return !half(s.xm, 1) && !half(s.wm, 1) && !half(s.my, 1) && !half(s.wy, 1) && !half(s.xy, 1) && !half(s.area, 1); }, { wx: 9.2, w: 31, y: 58 });
      },
      stem: function (s) {
        var F = fig({ pts: { W: [0, 0], M: [s.wm, 0], Y: [s.wy, 0], X: [s.wm, s.xm], Z: [s.wm, -s.xm] }, segs: [['W', 'X', g1(s.wx) + ' cm'], ['X', 'Y'], ['Y', 'Z'], ['Z', 'W'], ['W', 'Y', { width: 1.6 }], ['X', 'Z', { width: 1.6 }]], right: [['M', 'Y', 'X']], angles: [['W', 'M', 'X', s.w + '°', { r: 36 }], ['Y', 'M', 'X', s.y + '°', { r: 20 }]], names: { W: 'W', X: 'X', Y: 'Y', Z: 'Z' }, extra: [{ type: 'text', at: [s.wm - 0.06 * s.wy, -0.16 * s.xm], text: 'M' }], aria: 'kite WXYZ' });
        return '<b>A kite.</b> In kite ' + t('WXYZ') + ', the long diagonal ' + t('WY') + ' cuts the short diagonal ' + t('XZ') + ' at right angles at ' + t('M') + ', and ' + t('WY') + ' bisects ' + t('\\angle W') + ' and ' + t('\\angle Y') + '. Here ' + t('WX=' + g1(s.wx)) + ' cm, ' + t('\\angle XWM=' + dg(s.w)) + ' and ' + t('\\angle XYM=' + dg(s.y)) + '. Give answers to the nearest tenth.' + F;
      },
      parts: [
        { id: 'e4a', level: 'EMG', make: function (r, s) {
          return near('Determine ' + t('XM') + ', the half-length of the short diagonal.', s.xm, 1, 'cm', [{ v: s.wm, code: 'ch-ratio', hint: 'From ' + t('\\angle XWM') + ', ' + t('XM') + ' is <b>opposite</b> and ' + t('WX') + ' is the hypotenuse: SOH.' }, { v: s.wx * Tg.tan(s.w), code: 'ch-ratio', hint: t('WX') + ' is the hypotenuse, not a leg: use sine.' }, { v: s.wx / Tg.sin(s.w), code: 'ch-inverted', hint: t(SIN(s.w) + '=' + fr('XM', g1(s.wx))) + ', so multiply.' }, radAlt(function (T) { return s.wx * T.sin(s.w); })],
            t('\\triangle WXM') + ', right angle at ' + t('M') + '. From ' + t('\\angle XWM=' + dg(s.w)) + ': ' + t('WX') + ' is the hypotenuse, ' + t('XM') + ' is opposite (SOH).<br>' + t('XM=' + g1(s.wx) + SIN(s.w) + '=' + v4(s.xm) + '\\approx ' + fx(s.xm, 1)) + ' cm',
            ['Which side is the hypotenuse of ' + t('\\triangle WXM') + '?'], 'kite XM');
        } },
        { id: 'e4b', level: 'PRG', make: function (r, s) {
          return chain('Determine ' + t('WM') + ' and ' + t('MY') + ', and hence the length of the long diagonal ' + t('WY') + '.', [
            { label: t('WM='), name: 'WM', unit: 'cm', x: s.wm, dp: 1, alts: [{ v: s.xm, code: 'ch-ratio', hint: 'From ' + t('\\angle XWM') + ', ' + t('WM') + ' is <b>adjacent</b>: CAH.' }, radAlt(function (T) { return s.wx * T.cos(s.w); })] },
            { label: t('MY='), name: 'MY', unit: 'cm', x: s.my, dp: 1, alts: early(function (xm) { return xm / Tg.tan(s.y); }, s.xm, t('XM')).concat([{ v: s.xm * Tg.tan(s.y), code: 'ch-inverted', hint: 'From ' + t('\\angle XYM') + ', ' + t('XM') + ' is opposite and ' + t('MY') + ' adjacent: ' + t('MY=' + fr('XM', TAN(s.y))) + '.' }, { v: s.xm / Tg.sin(s.y), code: 'ch-ratio', hint: 'That is ' + t('XY') + ', the hypotenuse. ' + t('MY') + ' is the leg adjacent to ' + t('\\angle Y') + ': TOA.' }]) },
            { label: t('WY='), name: 'WY', unit: 'cm', x: s.wy, dp: 1, alts: [{ v: rd(s.wm, 1) + rd(s.my, 1), code: 'ch-early', hint: earlyH(t('WM') + ' and ' + t('MY')) }, { v: s.wm, code: 'ch-one-piece', hint: t('WY=WM+MY') + '.' }] }],
            t('WM=' + g1(s.wx) + COS(s.w) + '=' + v4(s.wm) + '\\approx ' + fx(s.wm, 1)) + ' cm<br>Hand the unrounded ' + t('XM=' + v4(s.xm)) + ' to ' + t('\\triangle XMY') + ': ' + t('XM') + ' is opposite ' + t(dg(s.y)) + ', ' + t('MY') + ' adjacent (TOA): ' + t('MY=' + fr(v4(s.xm), TAN(s.y)) + '=' + v4(s.my) + '\\approx ' + fx(s.my, 1)) + ' cm<br>' + t('WY=WM+MY=' + v4(s.wy) + '\\approx ' + fx(s.wy, 1)) + ' cm',
            ['The shared side is ' + t('XM') + ', a leg of both ' + t('\\triangle WXM') + ' and ' + t('\\triangle XMY') + '.', 'Add the unrounded pieces for ' + t('WY') + '.'], 'kite long diagonal');
        } },
        { id: 'e4c', level: 'PRG', make: function (r, s) {
          var f = function (xm) { return xm / Tg.sin(s.y); };
          return near('Determine ' + t('XY') + '.', s.xy, 1, 'cm', early(f, s.xm, t('XM')).concat([{ v: s.xm * Tg.sin(s.y), code: 'ch-inverted', hint: t(SIN(s.y) + '=' + fr('XM', 'XY')) + ', so ' + t('XY=' + fr('XM', SIN(s.y))) + '.' }, { v: s.my, code: 'ch-ratio', hint: 'That is ' + t('MY') + '. ' + t('XY') + ' is the hypotenuse of ' + t('\\triangle XMY') + ': SOH.' }, { v: s.xm / Tg.cos(s.y), code: 'ch-ratio', hint: 'From ' + t('\\angle XYM') + ', ' + t('XM') + ' is <b>opposite</b>: SOH.' }, radAlt(function (T) { return s.wx * T.sin(s.w) / T.sin(s.y); })]),
            t('XM=' + g1(s.wx) + SIN(s.w) + '=' + v4(s.xm)) + ' cm (from ' + t('\\triangle WXM') + ').<br>' + t('\\triangle XMY') + ': ' + t('XM') + ' is opposite ' + t(dg(s.y)) + ', ' + t('XY') + ' is the hypotenuse (SOH): ' + t('XY=' + fr(v4(s.xm), SIN(s.y)) + '=' + v4(s.xy) + '\\approx ' + fx(s.xy, 1)) + ' cm',
            ['First find the shared side ' + t('XM') + ' in ' + t('\\triangle WXM') + '.'], 'kite XY');
        } },
        { id: 'e4d', level: 'ADV', make: function (r, s) {
          return near('The area of a kite is ' + t('\\tfrac12 d_1d_2') + ', half the product of its diagonals. Determine the area of ' + t('WXYZ') + ' to the nearest tenth of a square centimetre.', s.area, 1, 'cm²', [
            { v: 0.5 * rd(s.wy, 1) * rd(2 * s.xm, 1), code: 'ch-early', hint: earlyH('each diagonal') }, { v: 0.5 * s.wy * s.xm, code: 'ch-half-diag', hint: t('XM') + ' is only half of the short diagonal: ' + t('XZ=2\\,XM') + '.' }, { v: s.wy * 2 * s.xm, code: 'ch-no-half', hint: 'Area ' + t('=\\tfrac12 d_1d_2') + ' — don’t forget the ' + t('\\tfrac12') + '.' }, radAlt(function (T) { var xm = s.wx * T.sin(s.w); return (s.wx * T.cos(s.w) + xm / T.tan(s.y)) * xm; })],
            t('XM=' + v4(s.xm)) + ', so ' + t('XZ=2\\,XM=' + v4(2 * s.xm)) + ' cm. ' + t('WY=WM+MY=' + v4(s.wy)) + ' cm.<br>Area ' + t('=\\tfrac12(' + v4(s.wy) + ')(' + v4(2 * s.xm) + ')=' + v4(s.area) + '\\approx ' + fx(s.area, 1)) + ' cm²' + (fx(0.5 * rd(s.wy, 1) * rd(2 * s.xm, 1), 1) !== fx(s.area, 1) ? '<br>(Rounding the diagonals first gives ' + t(fx(0.5 * rd(s.wy, 1) * rd(2 * s.xm, 1), 1)) + ' — already wrong in the tenths place.)' : ''),
            ['You need both diagonals: ' + t('WY=WM+MY') + ' and ' + t('XZ=2\\,XM') + '.', 'Keep them unrounded, then use ' + t('\\tfrac12 d_1d_2') + '.'], 'kite area');
        } }] });
    E.push({ num: '5',
      shared: function (r) {
        return gen(r, function (r) { return { ae: tenth(r, 4.0, 8.0), ab: tenth(r, 6.0, 12.0), D: r.int(50, 65), C: r.int(38, 50) }; },
          function (p) { var o = { ae: p.ae, ab: p.ab, D: p.D, C: p.C }; o.de = p.ae / Tg.tan(p.D); o.fc = p.ae / Tg.tan(p.C); o.dc = o.de + p.ab + o.fc; o.ad = p.ae / Tg.sin(p.D); o.bc = p.ae / Tg.sin(p.C); o.per = p.ab + o.bc + o.dc + o.ad; return o; }, function (s) { return s.D !== s.C; }, { ae: 6.2, ab: 9.4, D: 58, C: 43 });
      },
      stem: function (s) {
        var F = fig({ pts: { D: [0, 0], E: [s.de, 0], F: [s.de + s.ab, 0], C: [s.dc, 0], A: [s.de, s.ae], B: [s.de + s.ab, s.ae] }, segs: [['A', 'B', g1(s.ab) + ' m'], ['B', 'C'], ['D', 'E'], ['E', 'F'], ['F', 'C'], ['D', 'A'], ['A', 'E', g1(s.ae) + ' m', { dash: 1, width: 1.6, side: -1 }], ['B', 'F', { dash: 1, width: 1.6 }]], right: [['E', 'F', 'A'], ['F', 'C', 'B']], angles: [['D', 'E', 'A', s.D + '°', { r: 24 }], ['C', 'F', 'B', s.C + '°', { r: 28 }]], width: 340, aria: 'trapezoid ABCD' });
        return '<b>A trapezoid cut into a rectangle and two right triangles.</b> In trapezoid ' + t('ABCD') + ', ' + t('AB\\parallel DC') + ', the perpendicular height ' + t('AE=BF=' + g1(s.ae)) + ' m is drawn at both ends, ' + t('AB=' + g1(s.ab)) + ' m, ' + t('\\angle D=' + dg(s.D)) + ' and ' + t('\\angle C=' + dg(s.C)) + '. Give lengths to the nearest tenth of a metre.' + F;
      },
      parts: [
        { id: 'e5a', level: 'EMG', make: function (r, s) {
          function al(a) { return [{ v: s.ae * Tg.tan(a), code: 'ch-inverted', hint: 'The height is opposite the angle and the base piece is adjacent: piece ' + t('=' + fr(g1(s.ae), '\\tan(\\text{angle})')) + '.' }, { v: s.ae / Tg.sin(a), code: 'ch-ratio', hint: 'That is the slanted side. The base piece is the leg adjacent to the angle: TOA.' }, radAlt(function (T) { return s.ae / T.tan(a); })]; }
          return chain('Determine ' + t('DE') + ' and ' + t('FC') + '.', [{ label: t('DE='), name: 'DE', unit: 'm', x: s.de, dp: 1, alts: al(s.D) }, { label: t('FC='), name: 'FC', unit: 'm', x: s.fc, dp: 1, alts: al(s.C) }],
            t('\\triangle ADE') + ': ' + t('AE') + ' opposite ' + t(dg(s.D)) + ', ' + t('DE') + ' adjacent (TOA): ' + t('DE=' + fr(g1(s.ae), TAN(s.D)) + '=' + v4(s.de) + '\\approx ' + fx(s.de, 1)) + ' m<br>' + t('\\triangle BFC') + ': ' + t('FC=' + fr(g1(s.ae), TAN(s.C)) + '=' + v4(s.fc) + '\\approx ' + fx(s.fc, 1)) + ' m',
            ['In each end triangle the height ' + t(g1(s.ae)) + ' m is opposite the base angle.'], 'trapezoid DE, FC');
        } },
        { id: 'e5b', level: 'PRG', make: function (r, s) {
          return near('Determine ' + t('DC') + '.', s.dc, 1, 'm', [{ v: rd(s.de, 1) + s.ab + rd(s.fc, 1), code: 'ch-early', hint: earlyH(t('DE') + ' and ' + t('FC')) }, { v: s.de + s.fc, code: 'ch-one-piece', hint: t('DC=DE+EF+FC') + ', and the middle piece ' + t('EF') + ' equals ' + t('AB') + '.' }, { v: s.ae * (Tg.tan(s.D) + Tg.tan(s.C)) + s.ab, code: 'ch-inverted', hint: 'Each end piece is ' + t(fr(g1(s.ae), '\\tan(\\text{angle})')) + '.' }, radAlt(function (T) { return s.ae / T.tan(s.D) + s.ab + s.ae / T.tan(s.C); })],
            t('ABFE') + ' is a rectangle, so ' + t('EF=AB=' + g1(s.ab)) + ' m.<br>' + t('DC=DE+EF+FC=' + v4(s.de) + '+' + g1(s.ab) + '+' + v4(s.fc) + '=' + v4(s.dc) + '\\approx ' + fx(s.dc, 1)) + ' m',
            [t('DC') + ' is made of three pieces: ' + t('DE') + ', ' + t('EF') + ' and ' + t('FC') + '.'], 'trapezoid DC');
        } },
        { id: 'e5b2', sub: 'b why', level: 'EMG', make: function (r, s) {
          return mc(r, 'Why is ' + t('EF=AB') + '?', [
            { html: t('AE') + ' and ' + t('BF') + ' are both perpendicular to ' + t('DC') + ' and both ' + t(g1(s.ae)) + ' m long, and ' + t('AB\\parallel DC') + ', so ' + t('ABFE') + ' is a rectangle — its opposite sides are equal.', right: true },
            { html: 'Because the trapezoid is isosceles.', why: 'Its base angles are ' + t(dg(s.D)) + ' and ' + t(dg(s.C)) + ', so it isn’t isosceles — and ' + t('EF=AB') + ' doesn’t need that.' },
            { html: 'Because ' + t('DE=FC') + '.', why: t('DE') + ' and ' + t('FC') + ' are not equal here (the base angles differ). The reason is the rectangle ' + t('ABFE') + '.' },
            { html: 'Because ' + t('EF') + ' and ' + t('AB') + ' are both horizontal.', why: 'Being parallel isn’t enough — parallel segments can have different lengths. ' + t('ABFE') + ' must be a rectangle.' }],
            t('AE\\perp DC') + ' and ' + t('BF\\perp DC') + ', both ' + t(g1(s.ae)) + ' m, and ' + t('AB\\parallel DC') + ': so ' + t('ABFE') + ' is a rectangle and its opposite sides are equal, ' + t('EF=AB=' + g1(s.ab)) + ' m.',
            ['What kind of quadrilateral is ' + t('ABFE') + '?'], 'why EF = AB');
        } },
        { id: 'e5c', level: 'EMG', make: function (r, s) {
          function al(a) { return [{ v: s.ae * Tg.sin(a), code: 'ch-inverted', hint: 'The slant side is the hypotenuse: ' + t('\\sin(\\text{angle})=' + fr(g1(s.ae), '\\text{slant}')) + ', so divide.' }, { v: s.ae / Tg.cos(a), code: 'ch-ratio', hint: 'The height is <b>opposite</b> the base angle: SOH.' }, { v: s.ae / Tg.tan(a), code: 'ch-ratio', hint: 'That is the base piece. The slant side is the hypotenuse: SOH.' }, radAlt(function (T) { return s.ae / T.sin(a); })]; }
          return chain('Determine the slant sides ' + t('AD') + ' and ' + t('BC') + '.', [{ label: t('AD='), name: 'AD', unit: 'm', x: s.ad, dp: 1, alts: al(s.D) }, { label: t('BC='), name: 'BC', unit: 'm', x: s.bc, dp: 1, alts: al(s.C) }],
            t('\\triangle ADE') + ': ' + t('AE') + ' opposite ' + t(dg(s.D)) + ', ' + t('AD') + ' the hypotenuse (SOH): ' + t('AD=' + fr(g1(s.ae), SIN(s.D)) + '=' + v4(s.ad) + '\\approx ' + fx(s.ad, 1)) + ' m<br>' + t('\\triangle BFC') + ': ' + t('BC=' + fr(g1(s.ae), SIN(s.C)) + '=' + v4(s.bc) + '\\approx ' + fx(s.bc, 1)) + ' m',
            ['Each slant side is the hypotenuse of an end triangle.'], 'trapezoid slant sides');
        } },
        { id: 'e5d', level: 'PRG', make: function (r, s) {
          return near('Determine the perimeter of ' + t('ABCD') + '.', s.per, 1, 'm', [{ v: s.ab + rd(s.bc, 1) + rd(s.dc, 1) + rd(s.ad, 1), code: 'ch-early', hint: earlyH('each side') }, { v: s.per - s.ab, code: 'ch-one-piece', hint: 'Include all four sides — ' + t('AB') + ' too.' }, radAlt(function (T) { return s.ab + s.ae / T.sin(s.C) + s.ae / T.tan(s.D) + s.ab + s.ae / T.tan(s.C) + s.ae / T.sin(s.D); })],
            t('P=AB+BC+CD+DA=' + g1(s.ab) + '+' + v4(s.bc) + '+' + v4(s.dc) + '+' + v4(s.ad) + '=' + v4(s.per) + '\\approx ' + fx(s.per, 1)) + ' m<br>Every term is added at full precision and rounded once, at the end.',
            ['You need ' + t('DC') + ' (three pieces) and both slant sides.'], 'trapezoid perimeter');
        } }] });

    /* ---------- Part C ---------- */
    E.push({ num: '6', section: 'Extra practice C — The hypotenuse of one triangle is a leg of the other',
      shared: function (r) {
        return gen(r, function (r) { return { pq: tenth(r, 10.0, 16.0), p1: r.int(28, 40), p2: r.int(20, 32) }; },
          function (p) { var o = { pq: p.pq, p1: p.p1, p2: p.p2 }; o.pr = p.pq / Tg.cos(p.p1); o.qr = p.pq * Tg.tan(p.p1); o.rs = o.pr * Tg.tan(p.p2); o.ps = o.pr / Tg.cos(p.p2); o.per = p.pq + o.qr + o.rs + o.ps; return o; }, function () { return true; }, { pq: 14.0, p1: 34, p2: 27 });
      },
      stem: function (s) {
        var k = s.rs / s.pr, F = fig({ pts: { Q: [0, 0], P: [0, s.pq], R: [s.qr, 0], S: [s.qr + s.pq * k, s.qr * k] }, segs: [['P', 'Q', g1(s.pq) + ' cm'], ['Q', 'R'], ['P', 'R'], ['R', 'S'], ['P', 'S']], right: [['Q', 'R', 'P'], ['R', 'P', 'S']], angles: [['P', 'Q', 'R', s.p1 + '°', { r: 34 }], ['P', 'R', 'S', s.p2 + '°', { r: 54 }]], aria: 'quadrilateral PQRS with diagonal PR' });
        return '<b>A quadrilateral split by a diagonal.</b> In quadrilateral ' + t('PQRS') + ' the diagonal ' + t('PR') + ' creates two right triangles: ' + t('\\triangle PQR') + ' with its right angle at ' + t('Q') + ', and ' + t('\\triangle PRS') + ' with its right angle at ' + t('R') + '. Here ' + t('PQ=' + g1(s.pq)) + ' cm, ' + t('\\angle QPR=' + dg(s.p1)) + ' and ' + t('\\angle RPS=' + dg(s.p2)) + '. Give lengths to the nearest tenth.' + F;
      },
      parts: [
        { id: 'e6a', level: 'EMG', make: function (r, s) {
          return mc(r, 'Which triangle can be solved first, and which side is handed over?', [
            { html: t('\\triangle PQR') + ' (it has ' + t('PQ') + ' and ' + t('\\angle QPR') + '); the diagonal ' + t('PR') + ' — its hypotenuse — is handed to ' + t('\\triangle PRS') + ', where it is a leg.', right: true },
            { html: t('\\triangle PRS') + ' (it has ' + t('\\angle RPS') + '); ' + t('PR') + ' is handed to ' + t('\\triangle PQR') + '.', why: t('\\triangle PRS') + ' has only one fact besides its right angle — an angle and no side.' },
            { html: t('\\triangle PQR') + '; the side ' + t('QR') + ' is handed to ' + t('\\triangle PRS') + '.', why: t('QR') + ' is not a side of ' + t('\\triangle PRS') + '. The two triangles share the diagonal ' + t('PR') + '.' },
            { html: t('\\triangle PQR') + '; the side ' + t('PQ') + ' is handed to ' + t('\\triangle PRS') + '.', why: t('PQ') + ' is not a side of ' + t('\\triangle PRS') + '.' }],
            t('\\triangle PQR') + ' can be solved first: right angle at ' + t('Q') + ', ' + t('PQ=' + g1(s.pq)) + ' cm and ' + t('\\angle QPR=' + dg(s.p1)) + '. ' + t('\\triangle PRS') + ' has only ' + t('\\angle RPS') + '.<br>The side handed over is the diagonal ' + t('PR') + ' — the <b>hypotenuse</b> of ' + t('\\triangle PQR') + ' and a <b>leg</b> of ' + t('\\triangle PRS') + '.',
            ['Which triangle has a side and an angle?'], 'quadrilateral: which first');
        } },
        { id: 'e6b', level: 'EMG', make: function (r, s) {
          return near('Determine the diagonal ' + t('PR') + '.', s.pr, 1, 'cm', [{ v: s.pq * Tg.cos(s.p1), code: 'ch-inverted', hint: t(COS(s.p1) + '=' + fr(g1(s.pq), 'PR')) + ': the hypotenuse is in the denominator, so divide.' }, { v: s.pq / Tg.sin(s.p1), code: 'ch-ratio', hint: 'From ' + t('\\angle QPR') + ', ' + t('PQ') + ' is <b>adjacent</b>: CAH.' }, radAlt(function (T) { return s.pq / T.cos(s.p1); })],
            t('\\triangle PQR') + ', from ' + t('\\angle QPR=' + dg(s.p1)) + ': ' + t('PQ') + ' is adjacent, ' + t('PR') + ' is the hypotenuse (CAH).<br>' + t('PR=' + fr(g1(s.pq), COS(s.p1)) + '=' + v4(s.pr) + '\\approx ' + fx(s.pr, 1)) + ' cm',
            ['Name the sides of ' + t('\\triangle PQR') + ' from ' + t('\\angle QPR') + '.'], 'diagonal PR');
        } },
        { id: 'e6c', level: 'PRG', make: function (r, s) {
          return chain('Determine ' + t('QR') + ' and ' + t('RS') + '.', [
            { label: t('QR='), name: 'QR', unit: 'cm', x: s.qr, dp: 1, alts: [{ v: s.pq / Tg.tan(s.p1), code: 'ch-inverted', hint: 'From ' + t('\\angle QPR') + ', ' + t('QR') + ' is opposite and ' + t('PQ') + ' adjacent: multiply by ' + t(TAN(s.p1)) + '.' }, { v: s.pq * Tg.sin(s.p1), code: 'ch-ratio', hint: t('PQ') + ' is a leg, not the hypotenuse: TOA.' }, radAlt(function (T) { return s.pq * T.tan(s.p1); })] },
            { label: t('RS='), name: 'RS', unit: 'cm', x: s.rs, dp: 1, alts: early(function (pr) { return pr * Tg.tan(s.p2); }, s.pr, t('PR')).concat([{ v: s.pr / Tg.tan(s.p2), code: 'ch-inverted', hint: 'From ' + t('\\angle RPS') + ', ' + t('RS') + ' is opposite and ' + t('PR') + ' adjacent: multiply.' }, { v: s.pr * Tg.sin(s.p2), code: 'ch-ratio', hint: 'In ' + t('\\triangle PRS') + ', ' + t('PR') + ' is a <b>leg</b> (the right angle is at ' + t('R') + '): TOA.' }, { v: s.pq * Tg.tan(s.p2), code: 'ch-wrong-triangle', hint: t('PQ') + ' is in the other triangle. Hand over ' + t('PR') + '.' }]) }],
            t('QR=' + g1(s.pq) + TAN(s.p1) + '=' + v4(s.qr) + '\\approx ' + fx(s.qr, 1)) + ' cm<br>' + t('PR=' + v4(s.pr)) + ' cm (unrounded) is a leg of ' + t('\\triangle PRS') + ', adjacent to ' + t(dg(s.p2)) + ' (TOA):<br>' + t('RS=' + v4(s.pr) + TAN(s.p2) + '=' + v4(s.rs) + '\\approx ' + fx(s.rs, 1)) + ' cm',
            ['In ' + t('\\triangle PRS') + ' the right angle is at ' + t('R') + ', so ' + t('PR') + ' is a leg there.'], 'QR and RS');
        } },
        { id: 'e6d', level: 'PRG', make: function (r, s) {
          var f = function (pr) { return pr / Tg.cos(s.p2); };
          return near('Determine ' + t('PS') + '.', s.ps, 1, 'cm', early(f, s.pr, t('PR')).concat([{ v: s.pr * Tg.cos(s.p2), code: 'ch-inverted', hint: t(COS(s.p2) + '=' + fr('PR', 'PS')) + ', so ' + t('PS=' + fr('PR', COS(s.p2))) + '.' }, { v: s.pq / Tg.cos(s.p2), code: 'ch-wrong-triangle', hint: t('PQ') + ' is in the other triangle. The side handed over is ' + t('PR') + '.' }, radAlt(function (T) { return s.pq / T.cos(s.p1) / T.cos(s.p2); })]),
            t('PR=' + fr(g1(s.pq), COS(s.p1)) + '=' + v4(s.pr)) + ' cm<br>' + t('\\triangle PRS') + ': ' + t('PR') + ' adjacent to ' + t(dg(s.p2)) + ', ' + t('PS') + ' the hypotenuse (CAH): ' + t('PS=' + fr(v4(s.pr), COS(s.p2)) + '=' + v4(s.ps) + '\\approx ' + fx(s.ps, 1)) + ' cm',
            ['Find ' + t('PR') + ' first (unrounded).'], 'PS');
        } },
        { id: 'e6e', level: 'PRG', make: function (r, s) {
          return near('Determine the perimeter of ' + t('PQRS') + ' to the nearest tenth of a centimetre.', s.per, 1, 'cm', [{ v: s.pq + rd(s.qr, 1) + rd(s.rs, 1) + rd(s.ps, 1), code: 'ch-early', hint: earlyH('each side') }, { v: s.per + s.pr, code: 'ch-one-piece', hint: 'The diagonal ' + t('PR') + ' is inside the figure — it isn’t part of the perimeter.' }, { v: s.per - s.pq, code: 'ch-one-piece', hint: 'Include all four sides, ' + t('PQ') + ' too.' }],
            t('P=PQ+QR+RS+SP=' + g1(s.pq) + '+' + v4(s.qr) + '+' + v4(s.rs) + '+' + v4(s.ps) + '=' + v4(s.per) + '\\approx ' + fx(s.per, 1)) + ' cm',
            ['The perimeter is the four outside sides (not the diagonal).'], 'quadrilateral perimeter');
        } }] });
    E.push({ num: '7',
      shared: function (r) {
        return gen(r, function (r) { return { ab: tenth(r, 8.0, 14.0), A: r.int(30, 45) }; },
          function (p) { var o = { ab: p.ab, A: p.A }; o.bc = p.ab * Tg.tan(p.A); o.ac = p.ab / Tg.cos(p.A); o.cd = o.ac * Tg.tan(p.A); o.ad = o.ac / Tg.cos(p.A); o.bd = o.ad - p.ab; return o; }, function () { return true; }, { ab: 11.5, A: 37 });
      },
      stem: function (s) {
        var F = fig({ pts: { A: [0, 0], B: [s.ab, 0], C: [s.ab, s.bc], D: [s.ad, 0] }, segs: [['A', 'B', g1(s.ab) + ' m'], ['B', 'D'], ['B', 'C'], ['A', 'C'], ['C', 'D']], right: [['B', 'D', 'C'], ['C', 'A', 'D']], angles: [['A', 'B', 'C', s.A + '°', { r: 34 }]], aria: 'footbridge' });
        return '<b>A footbridge with two cross-members.</b> The deck ' + t('AD') + ' is horizontal and a vertical post ' + t('BC') + ' stands on it at ' + t('B') + '. One cross-member runs from ' + t('A') + ' to the top of the post at ' + t('C') + '; a second runs from ' + t('C') + ' down to the deck at ' + t('D') + '. The cross-members meet at right angles at ' + t('C') + '. ' + t('AB=' + g1(s.ab)) + ' m and ' + t('\\angle CAB=' + dg(s.A)) + '. Give lengths to the nearest tenth of a metre.' + F;
      },
      parts: [
        { id: 'e7a', level: 'EMG', make: function (r, s) {
          return chain('Determine the height ' + t('BC') + ' of the post and the length ' + t('AC') + ' of the first cross-member.', [
            { label: t('BC='), name: 'BC', unit: 'm', x: s.bc, dp: 1, alts: [{ v: s.ab / Tg.tan(s.A), code: 'ch-inverted', hint: 'From ' + t('\\angle CAB') + ', ' + t('BC') + ' is opposite and ' + t('AB') + ' adjacent: multiply by ' + t(TAN(s.A)) + '.' }, { v: s.ab * Tg.sin(s.A), code: 'ch-ratio', hint: t('AB') + ' is a leg, not the hypotenuse: TOA.' }, radAlt(function (T) { return s.ab * T.tan(s.A); })] },
            { label: t('AC='), name: 'AC', unit: 'm', x: s.ac, dp: 1, alts: [{ v: s.ab * Tg.cos(s.A), code: 'ch-inverted', hint: t(COS(s.A) + '=' + fr(g1(s.ab), 'AC')) + ' — the hypotenuse is in the denominator, so divide.' }, { v: s.ab / Tg.sin(s.A), code: 'ch-ratio', hint: t('AB') + ' is <b>adjacent</b> to ' + t('\\angle A') + ': CAH.' }, radAlt(function (T) { return s.ab / T.cos(s.A); })] }],
            t('\\triangle ABC') + ', right angle at ' + t('B') + ', from ' + t('\\angle CAB=' + dg(s.A)) + ':<br>' + t('BC=' + g1(s.ab) + TAN(s.A) + '=' + v4(s.bc) + '\\approx ' + fx(s.bc, 1)) + ' m (TOA)<br>' + t('AC=' + fr(g1(s.ab), COS(s.A)) + '=' + v4(s.ac) + '\\approx ' + fx(s.ac, 1)) + ' m (CAH)',
            [t('AB') + ' is adjacent to the ' + t(dg(s.A)) + ' angle; ' + t('BC') + ' is opposite; ' + t('AC') + ' is the hypotenuse.'], 'post and first cross-member');
        } },
        { id: 'e7b', level: 'PRG', make: function (r, s) {
          var f = function (ac) { return ac * Tg.tan(s.A); };
          return near('Determine the length ' + t('CD') + ' of the second cross-member.', s.cd, 1, 'm', early(f, s.ac, t('AC')).concat([{ v: s.ac / Tg.tan(s.A), code: 'ch-inverted', hint: 'In ' + t('\\triangle ACD') + ' (right angle at ' + t('C') + '), ' + t('CD') + ' is opposite ' + t('\\angle A') + ' and ' + t('AC') + ' adjacent: multiply.' }, { v: s.ac * Tg.sin(s.A), code: 'ch-ratio', hint: 'In ' + t('\\triangle ACD') + ' the right angle is at ' + t('C') + ', so ' + t('AC') + ' is a leg: TOA.' }, { v: s.bc * Tg.tan(s.A), code: 'ch-wrong-triangle', hint: 'That is ' + t('BD') + '. ' + t('CD') + ' is in ' + t('\\triangle ACD') + ', where the shared side is ' + t('AC') + '.' }, radAlt(function (T) { return s.ab / T.cos(s.A) * T.tan(s.A); })]),
            t('AC=' + fr(g1(s.ab), COS(s.A)) + '=' + v4(s.ac)) + ' m is handed to ' + t('\\triangle ACD') + ', where it is a <b>leg</b> (right angle at ' + t('C') + '). ' + t('D') + ' is on ray ' + t('AB') + ', so ' + t('\\angle CAD=' + dg(s.A)) + '.<br>' + t('CD=' + v4(s.ac) + TAN(s.A) + '=' + v4(s.cd) + '\\approx ' + fx(s.cd, 1)) + ' m',
            ['The shared side is ' + t('AC') + ': the hypotenuse of ' + t('\\triangle ABC') + ' and a leg of ' + t('\\triangle ACD') + '.'], 'second cross-member CD');
        } },
        { id: 'e7c', level: 'ADV', make: function (r, s) {
          var f = function (ac) { return ac / Tg.cos(s.A) - s.ab; };
          return near('Determine ' + t('BD') + ', the distance along the deck from the foot of the post to ' + t('D') + '.', s.bd, 1, 'm', early(f, s.ac, t('AC')).concat([{ v: s.ad, code: 'ch-one-piece', hint: 'That is ' + t('AD') + ', the whole deck. ' + t('BD=AD-AB') + '.' }, { v: s.ac * Tg.cos(s.A) - s.ab, code: 'ch-inverted', hint: 'In ' + t('\\triangle ACD') + ', ' + t('AD') + ' is the hypotenuse: ' + t('AD=' + fr('AC', COS(s.A))) + '.' }, radAlt(function (T) { return s.ab / T.cos(s.A) / T.cos(s.A) - s.ab; })]),
            t('AC=' + v4(s.ac)) + ' m. In ' + t('\\triangle ACD') + ', ' + t('AC') + ' is adjacent to ' + t(dg(s.A)) + ' and ' + t('AD') + ' is the hypotenuse (CAH): ' + t('AD=' + fr(v4(s.ac), COS(s.A)) + '=' + v4(s.ad)) + ' m<br>' + t('BD=AD-AB=' + v4(s.ad) + '-' + g1(s.ab) + '=' + v4(s.bd) + '\\approx ' + fx(s.bd, 1)) + ' m',
            ['Find the whole deck ' + t('AD') + ' from ' + t('\\triangle ACD') + ', then take away ' + t('AB') + '.'], 'deck BD');
        } },
        { id: 'e7d', level: 'ADV', make: function (r, s) {
          var f = function (bc) { return bc * Tg.tan(s.A); };
          return chain(t('BD') + ' can also be found from ' + t('\\triangle CBD') + ' alone, once ' + t('BC') + ' is known. Find ' + t('\\angle BCD') + ', then ' + t('BD') + ' that way as a check, and name the shared side this route uses.', [
            { label: t('\\angle BCD='), name: '∠BCD', unit: '°', x: s.A, dp: 0, alts: [{ v: 90 - s.A, code: 'ch-complement', hint: 'That is ' + t('\\angle BCA') + '. Since ' + t('\\angle ACD=90^\\circ') + ', ' + t('\\angle BCD=90^\\circ-\\angle BCA') + '.' }] },
            { label: t('BD='), name: 'BD', unit: 'm', x: s.bd, dp: 1, alts: early(f, s.bc, t('BC')).concat([{ v: s.bc / Tg.tan(s.A), code: 'ch-inverted', hint: 'From ' + t('\\angle BCD') + ', ' + t('BD') + ' is opposite and ' + t('BC') + ' adjacent: multiply.' }, { v: s.bc * Tg.tan(90 - s.A), code: 'ch-complement', hint: 'Use ' + t('\\angle BCD') + ', not ' + t('\\angle BCA') + '.' }]) },
            { label: 'Shared side:', name: 'Shared side', text: true, key: 'BC', show: t('BC'), check: segCheck('BC', 'This route goes through ' + t('\\triangle CBD') + ': which side does it share with ' + t('\\triangle ABC') + '?') }],
            'In ' + t('\\triangle ABC') + ', ' + t('\\angle BCA=90^\\circ-' + dg(s.A) + '=' + dg(90 - s.A)) + '; since ' + t('\\angle ACD=90^\\circ') + ', ' + t('\\angle BCD=90^\\circ-' + dg(90 - s.A) + '=' + dg(s.A)) + '.<br>' + t('\\triangle CBD') + ', right angle at ' + t('B') + ': ' + t('BC') + ' adjacent to ' + t('\\angle BCD') + ', ' + t('BD') + ' opposite (TOA): ' + t('BD=' + v4(s.bc) + TAN(s.A) + '=' + v4(s.bd) + '\\approx ' + fx(s.bd, 1)) + ' m ✓<br>Route 1 handed over ' + t('AC') + ' (hypotenuse of ' + t('\\triangle ABC') + ', leg of ' + t('\\triangle ACD') + '); this route hands over ' + t('BC') + ' (a leg of both).',
            [t('\\angle BCA') + ' and ' + t('\\angle BCD') + ' together make the right angle ' + t('\\angle ACD') + '.'], 'BD by the second route');
        } }] });
    E.push({ num: '8',
      shared: function (r) {
        return gen(r, function (r) { return { bd: tenth(r, 9.0, 15.0), b: r.int(45, 60) }; },
          function (p) { var o = { bd: p.bd, b: p.b }; o.ad = p.bd * Tg.tan(p.b); o.ac = p.bd / Tg.cos(p.b); o.de = o.ad * Tg.sin(90 - p.b); o.ae = o.ad * Tg.cos(90 - p.b); return o; }, function (s) { return !half(s.ad, 1) && !half(s.ac, 1) && !half(s.de, 1) && !half(s.ae, 1); }, { bd: 13.0, b: 52 });
      },
      stem: function (s) {
        var ce = s.bd * Tg.cos(s.b), k = ce / s.ac, F = fig({ pts: { B: [-s.bd, 0], D: [0, 0], C: [s.bd, 0], A: [0, s.ad], E: [s.bd - s.bd * k, s.ad * k] }, segs: [['B', 'D'], ['D', 'C'], ['A', 'B'], ['A', 'C'], ['A', 'D'], ['D', 'E']], right: [['D', 'C', 'A'], ['E', 'D', 'C']], angles: [['B', 'D', 'A', s.b + '°', { r: 26 }], ['C', 'D', 'A', s.b + '°', { r: 26 }]], extra: [{ type: 'text', at: [s.bd * 0.45, -s.ad * 0.2], text: 'BC = ' + g1(2 * s.bd) + ' cm' }], aria: 'isosceles triangle with altitude AD' });
        return '<b>An isosceles triangle split by its altitude.</b> In ' + t('\\triangle ABC') + ', ' + t('AB=AC') + ', the base ' + t('BC=' + g1(2 * s.bd)) + ' cm and the base angles are each ' + t(dg(s.b)) + '. The altitude ' + t('AD') + ' is drawn to the midpoint ' + t('D') + ' of ' + t('BC') + ', and from ' + t('D') + ' the perpendicular ' + t('DE') + ' is drawn to ' + t('AC') + '. Give lengths to the nearest tenth.' + F;
      },
      parts: [
        { id: 'e8a', level: 'EMG', make: function (r, s) {
          var B = g1(s.bd);
          return chain('Determine the altitude ' + t('AD') + ' and the equal side ' + t('AC') + '.', [
            { label: t('AD='), name: 'AD', unit: 'cm', x: s.ad, dp: 1, alts: [{ v: 2 * s.bd * Tg.tan(s.b), code: 'ch-midpoint', hint: t('D') + ' is the midpoint, so ' + t('BD=\\tfrac12 BC=' + B) + ' cm.' }, { v: s.bd / Tg.tan(s.b), code: 'ch-inverted', hint: 'From ' + t('\\angle B') + ', ' + t('AD') + ' is opposite and ' + t('BD') + ' adjacent: multiply.' }, radAlt(function (T) { return s.bd * T.tan(s.b); })] },
            { label: t('AC='), name: 'AC', unit: 'cm', x: s.ac, dp: 1, alts: [{ v: 2 * s.bd / Tg.cos(s.b), code: 'ch-midpoint', hint: 'Use half the base: ' + t('DC=' + B) + ' cm.' }, { v: s.bd * Tg.cos(s.b), code: 'ch-inverted', hint: t(COS(s.b) + '=' + fr(B, 'AC')) + ' — divide.' }, radAlt(function (T) { return s.bd / T.cos(s.b); })] }],
            t('D') + ' is the midpoint of ' + t('BC') + ', so ' + t('BD=DC=' + B) + ' cm.<br>' + t('AD=' + B + TAN(s.b) + '=' + v4(s.ad) + '\\approx ' + fx(s.ad, 1)) + ' cm (TOA)<br>' + t('AC=AB=' + fr(B, COS(s.b)) + '=' + v4(s.ac) + '\\approx ' + fx(s.ac, 1)) + ' cm (CAH)',
            ['The altitude meets the base at its midpoint: each half is ' + t(B) + ' cm.'], 'isosceles: altitude and side');
        } },
        { id: 'e8b', sub: 'b i', level: 'EMG', make: function (r, s) {
          var a = 90 - s.b;
          return mc(r, 'Why is ' + t('\\angle DAE=' + dg(a)) + '?', [
            { html: 'In ' + t('\\triangle ADC') + ', ' + t('\\angle ADC=90^\\circ') + ' and ' + t('\\angle C=' + dg(s.b)) + ', so ' + t('\\angle DAC=180^\\circ-90^\\circ-' + dg(s.b) + '=' + dg(a)) + '; ' + t('E') + ' lies on ' + t('AC') + ', so ' + t('\\angle DAE=\\angle DAC') + '.', right: true },
            { html: 'The apex angle equals the base angles, ' + t(dg(s.b)) + ', and ' + t(dg(s.b) + '-' + dg(2 * s.b - 90)) + ' leaves ' + t(dg(a)) + '.', why: 'The apex angle is ' + t('180^\\circ-2(' + dg(s.b) + ')=' + dg(180 - 2 * s.b)) + ', not ' + t(dg(s.b)) + '. Use the angle sum in ' + t('\\triangle ADC') + '.' },
            { html: t('\\angle DAE=\\angle C') + ' because ' + t('DE\\perp AC') + '.', why: t('\\angle C') + ' is ' + t(dg(s.b)) + ', not ' + t(dg(a)) + '. In right ' + t('\\triangle ADC') + ' the two acute angles add to ' + t('90^\\circ') + '.' },
            { html: 'The angles of right ' + t('\\triangle ADE') + ' add to ' + t('90^\\circ') + ', and ' + t('\\angle ADE=' + dg(s.b)) + '.', why: 'The angles of every triangle add to ' + t('180^\\circ') + '. Work in ' + t('\\triangle ADC') + ', where two angles are known.' }],
            'In ' + t('\\triangle ADC') + ': ' + t('\\angle ADC=90^\\circ') + ' and ' + t('\\angle C=' + dg(s.b)) + ', so ' + t('\\angle DAC=180^\\circ-90^\\circ-' + dg(s.b) + '=' + dg(a)) + '. ' + t('E') + ' lies on ' + t('AC') + ', so ' + t('\\angle DAE') + ' is the same angle.',
            ['Use the angle sum in ' + t('\\triangle ADC') + '.'], 'why ∠DAE = 90° − base angle');
        } },
        { id: 'e8b2', sub: 'b ii', level: 'PRG', make: function (r, s) {
          var a = 90 - s.b;
          return chain('Using ' + t('\\angle DAE=' + dg(a)) + ', determine ' + t('DE') + ' and ' + t('AE') + '.', [
            { label: t('DE='), name: 'DE', unit: 'cm', x: s.de, dp: 1, alts: early(function (ad) { return ad * Tg.sin(a); }, s.ad, t('AD')).concat([{ v: s.ad * Tg.cos(a), code: 'ch-ratio', hint: 'From ' + t('\\angle DAE') + ', ' + t('DE') + ' is <b>opposite</b> and ' + t('AD') + ' is now the hypotenuse: SOH.' }, { v: s.ad * Tg.tan(a), code: 'ch-ratio', hint: 'In ' + t('\\triangle ADE') + ' the right angle is at ' + t('E') + ', so ' + t('AD') + ' is the <b>hypotenuse</b>: SOH.' }, { v: s.ad / Tg.sin(a), code: 'ch-inverted', hint: t(SIN(a) + '=' + fr('DE', 'AD')) + ', so multiply.' }]) },
            { label: t('AE='), name: 'AE', unit: 'cm', x: s.ae, dp: 1, alts: early(function (ad) { return ad * Tg.cos(a); }, s.ad, t('AD')).concat([{ v: s.ad * Tg.sin(a), code: 'ch-ratio', hint: t('AE') + ' is <b>adjacent</b> to ' + t('\\angle DAE') + ': CAH.' }, { v: s.ad / Tg.cos(a), code: 'ch-inverted', hint: t(COS(a) + '=' + fr('AE', 'AD')) + ', so multiply.' }]) }],
            t('AD=' + v4(s.ad)) + ' cm (unrounded) is now the <b>hypotenuse</b> of ' + t('\\triangle ADE') + ' (right angle at ' + t('E') + ').<br>' + t('DE=' + v4(s.ad) + SIN(a) + '=' + v4(s.de) + '\\approx ' + fx(s.de, 1)) + ' cm (SOH)<br>' + t('AE=' + v4(s.ad) + COS(a) + '=' + v4(s.ae) + '\\approx ' + fx(s.ae, 1)) + ' cm (CAH)',
            ['Find ' + t('AD') + ' first (from ' + t('\\triangle ABD') + '), unrounded.', 'In ' + t('\\triangle ADE') + ', ' + t('AD') + ' is across from the right angle at ' + t('E') + '.'], 'DE and AE');
        } },
        { id: 'e8c', level: 'EMG', make: function (r, s) {
          return near(t('DE') + ' can also be found from ' + t('\\triangle DEC') + ', which uses ' + t('DC') + ' rather than ' + t('AD') + '. Determine ' + t('DE') + ' that way.', s.de, 1, 'cm', [{ v: s.bd * Tg.cos(s.b), code: 'ch-ratio', hint: 'From ' + t('\\angle C') + ', ' + t('DE') + ' is <b>opposite</b> and ' + t('DC') + ' is the hypotenuse: SOH.' }, { v: s.bd * Tg.tan(s.b), code: 'ch-ratio', hint: 'In ' + t('\\triangle DEC') + ' the right angle is at ' + t('E') + ', so ' + t('DC') + ' is the hypotenuse: SOH.' }, { v: 2 * s.bd * Tg.sin(s.b), code: 'ch-midpoint', hint: t('DC') + ' is half of ' + t('BC') + ': ' + t(g1(s.bd)) + ' cm.' }, radAlt(function (T) { return s.bd * T.sin(s.b); })],
            t('\\triangle DEC') + ', right angle at ' + t('E') + ', ' + t('\\angle C=' + dg(s.b)) + ': ' + t('DC=' + g1(s.bd)) + ' is the hypotenuse, ' + t('DE') + ' is opposite (SOH).<br>' + t('DE=' + g1(s.bd) + SIN(s.b) + '=' + v4(s.de) + '\\approx ' + fx(s.de, 1)) + ' cm ✓ — the same value, without using ' + t('AD') + '.',
            ['Which side of ' + t('\\triangle DEC') + ' is across from the right angle at ' + t('E') + '?'], 'DE from triangle DEC');
        } },
        { id: 'e8d', level: 'EMG', make: function (r, s) {
          return mc(r, 'In ' + t('\\triangle ABD') + ' the shared side ' + t('AD') + ' is a <b>leg</b>; in ' + t('\\triangle ADE') + ' it is the <b>hypotenuse</b>. Which statement is right?', [
            { html: 'TOA in ' + t('\\triangle ABD') + ' (' + t('AD') + ' is the leg opposite ' + t('\\angle B') + '); SOH for ' + t('DE') + ' and CAH for ' + t('AE') + ' in ' + t('\\triangle ADE') + ' (' + t('AD') + ' is the hypotenuse). The ratio names the <b>role</b>, not the segment.', right: true },
            { html: 'TOA in both triangles, because ' + t('AD') + ' is the same segment.', why: 'The segment is the same, but in ' + t('\\triangle ADE') + ' it sits across from the right angle at ' + t('E') + ' — so it is the hypotenuse, and tangent doesn’t use the hypotenuse.' },
            { html: 'SOH in ' + t('\\triangle ABD') + ' and TOA in ' + t('\\triangle ADE') + '.', why: 'Backwards: in ' + t('\\triangle ABD') + ' the known sides are two legs (TOA); in ' + t('\\triangle ADE') + ' ' + t('AD') + ' is the hypotenuse (SOH/CAH).' },
            { html: 'CAH in both triangles, because ' + t('AD') + ' is adjacent to every angle at ' + t('A') + '.', why: 'In ' + t('\\triangle ABD') + ' the angle used is ' + t('\\angle B') + ', and ' + t('AD') + ' is opposite it.' }],
            t('\\triangle ABD') + ': ' + t('AD') + ' is the leg opposite ' + t('\\angle B') + ' and ' + t('BD') + ' the adjacent leg ⇒ <b>TOA</b>.<br>' + t('\\triangle ADE') + ': ' + t('AD') + ' is the hypotenuse, so ' + t('DE') + ' (opposite ' + t('\\angle DAE') + ') needs <b>SOH</b> and ' + t('AE') + ' (adjacent) needs <b>CAH</b>.<br>A side is named relative to the angle in the triangle being used: the segment didn’t change, its role did.',
            ['Where is the right angle in each triangle? The hypotenuse is across from it.'], 'role of the shared side changes the ratio');
        } }] });

    /* ---------- Part D ---------- */
    E.push({ num: '9', section: 'Extra practice D — Three triangles: the hand-off happens twice',
      shared: function (r) {
        return gen(r, function (r) { return { ab: tenth(r, 4.0, 7.0), a1: r.int(35, 45), a2: r.int(28, 36), a3: r.int(20, 30) }; },
          function (p) { var o = { ab: p.ab, a1: p.a1, a2: p.a2, a3: p.a3 }; o.ac = p.ab / Tg.cos(p.a1); o.ad = o.ac / Tg.cos(p.a2); o.ae = o.ad / Tg.cos(p.a3); o.de = o.ad * Tg.tan(p.a3); return o; }, function (s) { return s.a1 + s.a2 + s.a3 <= 102; }, { ab: 5.0, a1: 40, a2: 32, a3: 25 });
      },
      stem: function (s) {
        var t2 = s.a1 + s.a2, t3 = t2 + s.a3, P = function (L, a) { return [L * Tg.cos(a), L * Tg.sin(a)]; };
        var F = fig({ pts: { A: [0, 0], B: [s.ab, 0], C: P(s.ac, s.a1), D: P(s.ad, t2), E: P(s.ae, t3) }, segs: [['A', 'B', g1(s.ab) + ' cm'], ['B', 'C'], ['A', 'C'], ['C', 'D'], ['A', 'D'], ['D', 'E'], ['A', 'E']], right: [['B', 'A', 'C'], ['C', 'A', 'D'], ['D', 'A', 'E']],
          angles: [['A', 'B', 'C', s.a1 + '°', { r: 26 }], ['A', 'C', 'D', s.a2 + '°', { r: 44 }], ['A', 'D', 'E', s.a3 + '°', { r: 62 }]], aria: 'three right triangles sharing vertex A' });
        return 'There are <b>three</b> right triangles, all with a vertex at ' + t('A') + '. The right angles are at ' + t('B') + ', ' + t('C') + ' and ' + t('D') + '; ' + t('AB=' + g1(s.ab)) + ' cm; ' + t('\\angle BAC=' + dg(s.a1)) + ', ' + t('\\angle CAD=' + dg(s.a2)) + ', ' + t('\\angle DAE=' + dg(s.a3)) + '. The hypotenuse of each triangle is a leg of the next. Give lengths to the nearest tenth.' + F;
      },
      parts: [
        { id: 'e9a', level: 'BEG', make: function (r, s) {
          return mc(r, 'Which triangle is solvable at the start?', [
            { html: 'Only ' + t('\\triangle ABC') + ': it has ' + t('AB') + ' and ' + t('\\angle BAC') + '. ' + t('\\triangle ACD') + ' and ' + t('\\triangle ADE') + ' each have just one angle until a side arrives.', right: true },
            { html: 'All three: each has a right angle and an angle at ' + t('A') + '.', why: 'A right angle and one acute angle fix the shape, not the size. Each triangle also needs a side.' },
            { html: 'Only ' + t('\\triangle ADE') + ', because it is the largest.', why: 'Size doesn’t matter — a triangle needs two facts besides its right angle. ' + t('\\triangle ADE') + ' has only ' + t('\\angle DAE') + '.' },
            { html: t('\\triangle ABC') + ' and ' + t('\\triangle ACD') + ', because they share ' + t('AC') + '.', why: t('AC') + ' is unknown at the start, so ' + t('\\triangle ACD') + ' has to wait until ' + t('AC') + ' is found.' }],
            'Only ' + t('\\triangle ABC') + ': right angle at ' + t('B') + ' plus ' + t('AB') + ' and ' + t('\\angle BAC') + '. ' + t('\\triangle ACD') + ' has only ' + t('\\angle CAD') + ' until ' + t('AC') + ' arrives, and ' + t('\\triangle ADE') + ' has only ' + t('\\angle DAE') + ' until ' + t('AD') + ' arrives.',
            ['Which triangle has a known side?'], 'three triangles: which first');
        } },
        { id: 'e9b', level: 'EMG', make: function (r, s) {
          return near('Determine ' + t('AC') + '.', s.ac, 1, 'cm', [{ v: s.ab * Tg.cos(s.a1), code: 'ch-inverted', hint: t(COS(s.a1) + '=' + fr(g1(s.ab), 'AC')) + ' — the hypotenuse is in the denominator, so divide.' }, { v: s.ab / Tg.sin(s.a1), code: 'ch-ratio', hint: t('AB') + ' is <b>adjacent</b> to ' + t('\\angle BAC') + ': CAH.' }, { v: s.ab * Tg.tan(s.a1), code: 'ch-ratio', hint: 'That is ' + t('BC') + '. ' + t('AC') + ' is the hypotenuse: CAH.' }, radAlt(function (T) { return s.ab / T.cos(s.a1); })],
            t('\\triangle ABC') + ': ' + t('AB') + ' adjacent to ' + t(dg(s.a1)) + ', ' + t('AC') + ' the hypotenuse (CAH).<br>' + t('AC=' + fr(g1(s.ab), COS(s.a1)) + '=' + v4(s.ac) + '\\approx ' + fx(s.ac, 1)) + ' cm',
            ['Name the sides of ' + t('\\triangle ABC') + ' from ' + t('\\angle BAC') + '.'], 'AC');
        } },
        { id: 'e9c', level: 'PRG', make: function (r, s) {
          return chain('Determine ' + t('AD') + ', then ' + t('AE') + '. Keep full calculator precision the whole way and round only here.', [
            { label: t('AD='), name: 'AD', unit: 'cm', x: s.ad, dp: 1, alts: early(function (ac) { return ac / Tg.cos(s.a2); }, s.ac, t('AC')).concat([{ v: s.ac * Tg.cos(s.a2), code: 'ch-inverted', hint: t(COS(s.a2) + '=' + fr('AC', 'AD')) + ', so divide.' }, { v: s.ab / Tg.cos(s.a2), code: 'ch-wrong-triangle', hint: t('AB') + ' is not in ' + t('\\triangle ACD') + '. Hand over ' + t('AC') + '.' }]) },
            { label: t('AE='), name: 'AE', unit: 'cm', x: s.ae, dp: 1, alts: early(function (ad) { return ad / Tg.cos(s.a3); }, s.ad, t('AD')).concat([{ v: s.ad * Tg.cos(s.a3), code: 'ch-inverted', hint: t(COS(s.a3) + '=' + fr('AD', 'AE')) + ', so divide.' }, { v: s.ab / Tg.cos(s.a1 + s.a2 + s.a3), code: 'ch-angle-sum', hint: 'The three angles are in three different triangles — you can’t put their sum into one ratio. Hand the side across twice.' }]) }],
            'First hand-off: ' + t('AC=' + v4(s.ac)) + ' is a leg of ' + t('\\triangle ACD') + ', adjacent to ' + t(dg(s.a2)) + ', with ' + t('AD') + ' the hypotenuse (CAH): ' + t('AD=' + fr(v4(s.ac), COS(s.a2)) + '=' + v4(s.ad) + '\\approx ' + fx(s.ad, 1)) + ' cm<br>Second hand-off: ' + t('AE=' + fr(v4(s.ad), COS(s.a3)) + '=' + v4(s.ae) + '\\approx ' + fx(s.ae, 1)) + ' cm',
            ['Each hypotenuse becomes the adjacent leg of the next triangle.'], 'AD and AE');
        } },
        { id: 'e9d', level: 'PRG', make: function (r, s) {
          return near('Determine ' + t('DE') + '.', s.de, 1, 'cm', early(function (ad) { return ad * Tg.tan(s.a3); }, s.ad, t('AD')).concat([{ v: s.ad * Tg.sin(s.a3), code: 'ch-ratio', hint: 'In ' + t('\\triangle ADE') + ' the right angle is at ' + t('D') + ', so ' + t('AD') + ' is a leg: TOA.' }, { v: s.ad / Tg.tan(s.a3), code: 'ch-inverted', hint: t('DE') + ' is opposite ' + t('\\angle DAE') + ' and ' + t('AD') + ' adjacent: multiply.' }, radAlt(function (T) { return s.ab / T.cos(s.a1) / T.cos(s.a2) * T.tan(s.a3); })]),
            t('AD=' + v4(s.ad)) + ' cm. In ' + t('\\triangle ADE') + ': ' + t('AD') + ' adjacent to ' + t(dg(s.a3)) + ', ' + t('DE') + ' opposite (TOA).<br>' + t('DE=' + v4(s.ad) + TAN(s.a3) + '=' + v4(s.de) + '\\approx ' + fx(s.de, 1)) + ' cm',
            ['You need ' + t('AD') + ' first (two hand-offs from ' + t('AB') + ').'], 'DE');
        } },
        { id: 'e9e', sub: 'e i', level: 'PRG', make: function (r, s) {
          var b = g1(s.ab);
          return mc(r, 'Which single expression gives ' + t('AE') + ' with no intermediate values in it?', [
            { html: t('AE=' + fr(b, COS(s.a1) + '\\,' + COS(s.a2) + '\\,' + COS(s.a3))), right: true },
            { html: t('AE=' + b + COS(s.a1) + '\\,' + COS(s.a2) + '\\,' + COS(s.a3)), why: 'Each step is ' + t('\\text{hypotenuse}=' + fr('\\text{adjacent}', '\\cos')) + ' — the cosines divide, they don’t multiply.' },
            { html: t('AE=' + fr(b, '\\cos(' + s.a1 + '^\\circ+' + s.a2 + '^\\circ+' + s.a3 + '^\\circ)')), why: 'The three angles belong to three different right triangles. You can’t add them inside one cosine.' },
            { html: t('AE=' + fr(b, COS(s.a1)) + '+' + fr(b, COS(s.a2)) + '+' + fr(b, COS(s.a3))), why: 'The hand-offs are chained (each result feeds the next), not added side by side.' }],
            t('AC=' + fr(b, COS(s.a1))) + ', ' + t('AD=' + fr('AC', COS(s.a2))) + ', ' + t('AE=' + fr('AD', COS(s.a3))) + ', so ' + t('AE=' + fr(b, COS(s.a1) + '\\,' + COS(s.a2) + '\\,' + COS(s.a3)) + '=' + v4(s.ae) + '\\approx ' + fx(s.ae, 1)) + ' cm.',
            ['Substitute ' + t('AC') + ' into the formula for ' + t('AD') + ', then ' + t('AD') + ' into the formula for ' + t('AE') + '.'], 'single expression for AE');
        } },
        { id: 'e9e2', sub: 'e ii', level: 'EMG', make: function (r) {
          return mc(r, 'Why is the single expression for ' + t('AE') + ' the safest way to compute it?', [
            { html: 'No intermediate value is written down, so nothing can be rounded before the end — the calculator keeps full precision through every step.', right: true },
            { html: 'It uses fewer trig ratios.', why: 'It uses the same three cosines. The advantage is that no value in between gets rounded.' },
            { html: 'Dividing by cosines is always more accurate than multiplying.', why: 'The operation isn’t the issue — rounding values part-way through is.' },
            { html: 'It avoids having to identify the hypotenuse of each triangle.', why: 'You still need the right ratio in each triangle to build the expression. Its strength is that nothing is rounded early.' }],
            'Safest because no intermediate value is ever written down, so no intermediate value can be rounded. The calculator holds full precision through all three divisions, and the single rounding happens at the end.',
            ['What usually goes wrong when a value is handed from one triangle to the next?'], 'why one expression is safest');
        } }] });

    /* ---------- Part E ---------- */
    E.push({ num: '10', section: 'Extra practice E — The shared side comes from Pythagoras',
      shared: function (r) {
        return gen(r, function (r) { var tr = r.pick([[5, 12, 13], [8, 15, 17], [7, 24, 25], [9, 12, 15], [20, 21, 29], [12, 16, 20]]), k = r.pick([1, 1.5, 2, 2.5]); return { ml: tr[0] * k, kl: tr[1] * k, km: tr[2] * k, m: r.int(38, 55) }; },
          function (p) { var o = { ml: p.ml, kl: p.kl, km: p.km, m: p.m }; o.ln = p.ml * Tg.tan(p.m); o.mn = p.ml / Tg.cos(p.m); o.kml = Tg.atan(p.kl / p.ml); o.kmn = o.kml + p.m; return o; },
          function (s) { return s.ml >= 6 && s.km <= 40 && s.kmn < 150 && Math.abs(s.kmn - 90) >= 3; }, { ml: 10, kl: 24, km: 26, m: 47 });
      },
      stem: function (s) {
        var F = fig({ pts: { K: [-s.kl, 0], L: [0, 0], N: [s.ln, 0], M: [0, s.ml] }, segs: [['K', 'L', g1(s.kl) + ' mm'], ['L', 'N'], ['K', 'M', g1(s.km) + ' mm'], ['M', 'N'], ['M', 'L']], right: [['L', 'N', 'M']], angles: [['M', 'L', 'N', s.m + '°', { r: 28 }]], aria: 'two right triangles sharing ML' });
        return t('K') + ', ' + t('L') + ' and ' + t('N') + ' lie on a straight line and ' + t('ML\\perp KN') + '. In ' + t('\\triangle KLM') + ' two <b>sides</b> are known and no angle: ' + t('KL=' + g1(s.kl)) + ' mm and the hypotenuse ' + t('KM=' + g1(s.km)) + ' mm. In ' + t('\\triangle MLN') + ', ' + t('\\angle LMN=' + dg(s.m)) + '.' + F;
      },
      parts: [
        { id: 'e10a', level: 'BEG', make: function (r, s) {
          return mc(r, 'Why can’t a trigonometric ratio produce the shared side ' + t('ML') + ' here, and what tool can?', [
            { html: 'Every trig ratio needs an acute angle, and ' + t('\\triangle KLM') + ' gives two sides but no angle. The <b>Pythagorean theorem</b> relates three sides with no angle at all.', right: true },
            { html: 'Trig ratios only work when the hypotenuse is unknown, so use the sine law.', why: 'Trig ratios can use a known hypotenuse. The trouble is that no acute angle is known — and the Pythagorean theorem needs none.' },
            { html: 'Trig ratios can only be used in the second triangle of a chain; use ' + t('\\triangle MLN') + ' first.', why: t('\\triangle MLN') + ' has only the ' + t(dg(s.m)) + ' angle — no side. ' + t('\\triangle KLM') + ' has two sides, which is enough for the Pythagorean theorem.' },
            { html: 'The sides are in millimetres, which are too small for trigonometry.', why: 'Units don’t matter. A trig ratio needs an angle, and none is given in ' + t('\\triangle KLM') + '.' }],
            'Every trigonometric ratio needs an angle, and ' + t('\\triangle KLM') + ' supplies none besides its right angle — it gives two sides. The tool that relates three sides of a right triangle with no angle is the <b>Pythagorean theorem</b>.',
            ['What does every SOH CAH TOA ratio need that ' + t('\\triangle KLM') + ' doesn’t give?'], 'why Pythagoras here');
        } },
        { id: 'e10b', level: 'BEG', make: function (r, s) {
          var p = K.P.number('Determine the shared side ' + t('ML') + '.', s.ml, function (v) {
            if (Math.abs(v - hyp(s.kl, s.km)) < 0.06) return { code: 'ch-pyth', hint: t('KM') + ' is the hypotenuse (across from the right angle at ' + t('L') + '), so subtract: ' + t('ML^{2}=KM^{2}-KL^{2}') + '.' };
            if (Math.abs(v - (s.km - s.kl)) < 1e-9) return { code: 'ch-pyth', hint: 'Subtract the <b>squares</b>, then take the square root: ' + t('ML=\\sqrt{KM^{2}-KL^{2}}') + '.' };
            return null;
          }, t('KM') + ' is the hypotenuse: ' + t('KL^{2}+ML^{2}=KM^{2}') + '.<br>' + t('ML=\\sqrt{' + g1(s.km) + '^{2}-' + g1(s.kl) + '^{2}}=\\sqrt{' + rd(s.km * s.km - s.kl * s.kl, 2) + '}=' + s.ml) + ' mm (exact — nothing is lost in this hand-off).',
            ['Which side is the hypotenuse of ' + t('\\triangle KLM') + '?', t('ML^{2}=KM^{2}-KL^{2}')], 'ML by Pythagoras', { after: 'mm' });
          p.answer = t(s.ml % 1 ? String(s.ml) : s.ml + '.0') + ' mm'; p.good = [s.ml.toFixed(1)]; p.bad = [fx(hyp(s.kl, s.km), 1), String(s.km - s.kl)];
          return p;
        } },
        { id: 'e10c', level: 'PRG', make: function (r, s) {
          return chain('Determine ' + t('LN') + ' and ' + t('MN') + ' to the nearest tenth.', [
            { label: t('LN='), name: 'LN', unit: 'mm', x: s.ln, dp: 1, alts: [{ v: s.ml / Tg.tan(s.m), code: 'ch-inverted', hint: 'From ' + t('\\angle LMN') + ', ' + t('LN') + ' is opposite and ' + t('ML') + ' adjacent: multiply by ' + t(TAN(s.m)) + '.' }, { v: s.ml * Tg.sin(s.m), code: 'ch-ratio', hint: t('ML') + ' is a leg: TOA.' }, radAlt(function (T) { return s.ml * T.tan(s.m); })] },
            { label: t('MN='), name: 'MN', unit: 'mm', x: s.mn, dp: 1, alts: [{ v: s.ml * Tg.cos(s.m), code: 'ch-inverted', hint: t(COS(s.m) + '=' + fr('ML', 'MN')) + ', so divide.' }, { v: s.ml / Tg.sin(s.m), code: 'ch-ratio', hint: t('ML') + ' is <b>adjacent</b> to ' + t('\\angle LMN') + ': CAH.' }, radAlt(function (T) { return s.ml / T.cos(s.m); })] }],
            t('ML=' + s.ml) + ' mm. ' + t('\\triangle MLN') + ', right angle at ' + t('L') + ': ' + t('ML') + ' adjacent to ' + t(dg(s.m)) + '.<br>' + t('LN=' + s.ml + TAN(s.m) + '=' + v4(s.ln) + '\\approx ' + fx(s.ln, 1)) + ' mm (TOA)<br>' + t('MN=' + fr(s.ml, COS(s.m)) + '=' + v4(s.mn) + '\\approx ' + fx(s.mn, 1)) + ' mm (CAH)',
            ['Find ' + t('ML') + ' with the Pythagorean theorem first.'], 'LN and MN');
        } },
        { id: 'e10d', level: 'EMG', make: function (r, s) {
          return near('Determine ' + t('\\angle KML') + ' to the nearest degree.', s.kml, 0, '°', [{ v: 90 - s.kml, code: 'ch-complement', hint: 'That is ' + t('\\angle K') + '. From ' + t('\\angle KML') + ', ' + t('KL') + ' is opposite and ' + t('ML') + ' adjacent.' }, { v: Math.atan(s.kl / s.ml), code: 'ch-radian', hint: RADH }],
            t('\\triangle KLM') + ', from ' + t('\\angle KML') + ': ' + t('KL=' + g1(s.kl)) + ' is opposite, ' + t('ML=' + s.ml) + ' is adjacent (TOA).<br>' + t('\\angle KML=\\tan^{-1}\\left(' + fr(g1(s.kl), s.ml) + '\\right)=' + v4(s.kml) + '^\\circ\\approx ' + dg(fx(s.kml, 0))),
            ['Which side is opposite ' + t('\\angle KML') + '?'], '∠KML');
        } },
        { id: 'e10e', level: 'PRG', make: function (r, s) {
          return near('Determine ' + t('\\angle KMN') + ' to the nearest degree.', s.kmn, 0, '°', [{ v: rd(s.kml, 0) + s.m, code: 'ch-early', hint: earlyH(t('\\angle KML')) }, { v: s.kml, code: 'ch-one-piece', hint: 'That is ' + t('\\angle KML') + ' only. Add ' + t('\\angle LMN') + '.' }, { v: 90 - s.kml + s.m, code: 'ch-complement', hint: 'Check ' + t('\\angle KML') + ': ' + t('KL') + ' is opposite it, ' + t('ML') + ' adjacent.' }],
            t('K') + ', ' + t('L') + ', ' + t('N') + ' are in a line with ' + t('L') + ' between them, so ray ' + t('ML') + ' lies between rays ' + t('MK') + ' and ' + t('MN') + ':<br>' + t('\\angle KMN=\\angle KML+\\angle LMN=' + v4(s.kml) + '^\\circ+' + dg(s.m) + '=' + v4(s.kmn) + '^\\circ\\approx ' + dg(fx(s.kmn, 0))),
            [t('\\angle KMN') + ' is made of two angles that meet along ' + t('ML') + '.'], '∠KMN');
        } },
        { id: 'e10e2', sub: 'e why', level: 'EMG', make: function (r) {
          return mc(r, t('\\angle KMN') + ' lies in neither right triangle. Why can it still be found?', [
            { html: 'The shared side ' + t('ML') + ' is a side of both smaller angles: each right triangle supplies one piece, and the pieces meet along ' + t('ML') + ' to make ' + t('\\angle KMN') + '.', right: true },
            { html: 'Because ' + t('\\triangle KMN') + ' is a right triangle too.', why: 'The right angle is at ' + t('L') + ', which is on ' + t('KN') + ' — ' + t('\\triangle KMN') + ' itself has no right angle in general.' },
            { html: 'Because the angles of ' + t('\\triangle KMN') + ' add to ' + t('90^\\circ') + '.', why: 'The angles of any triangle add to ' + t('180^\\circ') + '. The real reason is that ' + t('\\angle KMN') + ' splits along ' + t('ML') + ' into two angles we can find.' },
            { html: 'Because ' + t('\\angle KMN') + ' is the supplement of ' + t('\\angle LMN') + '.', why: 'Supplementary angles make a straight line; ' + t('\\angle KMN') + ' and ' + t('\\angle LMN') + ' overlap. ' + t('\\angle KMN=\\angle KML+\\angle LMN') + '.' }],
            'Ray ' + t('ML') + ' lies between rays ' + t('MK') + ' and ' + t('MN') + ', so ' + t('\\angle KMN=\\angle KML+\\angle LMN') + ' — one piece from each right triangle, meeting along the shared side.',
            ['Look at where ' + t('ML') + ' sits inside ' + t('\\angle KMN') + '.'], 'why ∠KMN can be found');
        } }] });

    /* ---------- Part F ---------- */
    E.push({ num: '11', section: 'Extra practice F — Carry full precision across the hand-off',
      shared: function (r) {
        return gen(r, function (r) { return { ab: tenth(r, 4.0, 8.0), A: r.int(30, 40), C: r.int(75, 82) }; },
          function (p) { var o = { ab: p.ab, A: p.A, C: p.C }; o.cb = p.ab * Tg.tan(p.A); o.db = o.cb * Tg.tan(p.C); o.d1 = rd(o.cb, 1) * Tg.tan(p.C); o.d0 = rd(o.cb, 0) * Tg.tan(p.C); o.e1 = Math.abs(rd(o.d1, 1) - rd(o.db, 1)); o.e0 = Math.abs(rd(o.d0, 1) - rd(o.db, 1)); return o; },
          function (s) { return Math.abs(s.cb - rd(s.cb, 1)) >= 0.02 && Math.abs(s.cb - rd(s.cb, 0)) >= 0.2 && s.e1 >= 0.1 && s.e0 >= 0.5 && rd(s.cb, 0) > 0; }, { ab: 6.0, A: 36, C: 79 });
      },
      stem: function (s) {
        var ch = Math.max(s.cb * 1.8, s.db * 0.3);   // drawn taller than to scale so the two angle marks have room
        var F = fig({ pts: { D: [s.ab - s.db, 0], A: [0, 0], B: [s.ab, 0], C: [s.ab, ch] }, segs: [['D', 'A'], ['A', 'B', g1(s.ab) + ' m'], ['B', 'C'], ['A', 'C'], ['C', 'D']], right: [['B', 'A', 'C']], angles: [['A', 'B', 'C', s.A + '°', { r: 22 }], ['C', 'B', 'D', s.C + '°', { r: 18 }]], width: 340, aria: 'two right triangles sharing CB (not to scale)' });
        return 'In the figure ' + t('CB\\perp DB') + ', and ' + t('D') + ', ' + t('A') + ', ' + t('B') + ' are on one straight line. ' + t('AB=' + g1(s.ab)) + ' m, ' + t('\\angle CAB=' + dg(s.A)) + ' and ' + t('\\angle BCD=' + dg(s.C)) + '. The length ' + t('DB') + ' is required, to the nearest tenth of a metre. (Not drawn to scale.)' + F;
      },
      parts: [
        { id: 'e11a', level: 'PRG', make: function (r, s) {
          return chain('Determine the shared side ' + t('CB') + ', writing down every digit (at least four decimal places). Then finish the problem from that unrounded value.', [
            { label: t('CB='), name: 'CB', unit: 'm', mid: true, need: 4, x: s.cb, alts: [{ v: s.ab / Tg.tan(s.A), code: 'ch-inverted', hint: 'From ' + t('\\angle CAB') + ', ' + t('CB') + ' is opposite and ' + t('AB') + ' adjacent: multiply.' }, { v: s.ab * Tg.sin(s.A), code: 'ch-ratio', hint: t('AB') + ' is a leg: TOA.' }, radAlt(function (T) { return s.ab * T.tan(s.A); })] },
            { label: t('DB='), name: 'DB', unit: 'm', x: s.db, dp: 1, alts: [{ v: s.d1, code: 'ch-early', hint: earlyH(t('CB')) }, { v: s.d0, code: 'ch-early', hint: earlyH(t('CB')) }, { v: s.cb / Tg.tan(s.C), code: 'ch-inverted', hint: 'From ' + t('\\angle BCD') + ', ' + t('DB') + ' is opposite and ' + t('CB') + ' adjacent: multiply by ' + t(TAN(s.C)) + '.' }, { v: s.db - s.ab, code: 'ch-one-piece', hint: 'That is ' + t('DA') + '. The question asks for ' + t('DB') + '.' }] }],
            t('\\triangle ABC') + ': ' + t('AB') + ' adjacent to ' + t(dg(s.A)) + ', ' + t('CB') + ' opposite (TOA): ' + t('CB=' + g1(s.ab) + TAN(s.A) + '=' + fx(s.cb, 7) + '\\ldots') + ' m (every digit kept)<br>' + t('\\triangle CBD') + ': ' + t('CB') + ' adjacent to ' + t('\\angle BCD') + ', ' + t('DB') + ' opposite (TOA): ' + t('DB=' + v4(s.cb) + TAN(s.C) + '=' + v4(s.db) + '\\approx ' + fx(s.db, 1)) + ' m',
            ['Both triangles are right-angled at ' + t('B') + ' and share ' + t('CB') + '.'], 'DB from unrounded CB');
        } },
        { id: 'e11b', level: 'EMG', make: function (r, s) {
          var c1 = fx(s.cb, 1), c0 = fx(s.cb, 0), nr = { v: s.db, code: 'ch-not-rounded', hint: 'For this part, round ' + t('CB') + ' first (that is the experiment), then multiply by ' + t(TAN(s.C)) + '.' };
          return chain('Repeat the second step twice: once with ' + t('CB') + ' rounded to the nearest tenth, and once with ' + t('CB') + ' rounded to the nearest whole metre. Give each ' + t('DB') + ' to the nearest tenth.', [
            { label: t('CB\\approx ' + c1) + ':', name: 'CB to the tenth', unit: 'm', x: s.d1, dp: 1, alts: [nr] },
            { label: t('CB\\approx ' + c0) + ':', name: 'CB to the metre', unit: 'm', x: s.d0, dp: 1, alts: [nr] }],
            t('CB=' + v4(s.cb)) + '<br>' + t('CB\\approx ' + c1) + ': ' + t('DB=' + c1 + TAN(s.C) + '=' + v4(s.d1) + '\\approx ' + fx(s.d1, 1)) + ' m<br>' + t('CB\\approx ' + c0) + ': ' + t('DB=' + c0 + TAN(s.C) + '=' + v4(s.d0) + '\\approx ' + fx(s.d0, 1)) + ' m<br>Compare with the correct ' + t(fx(s.db, 1)) + ' m.',
            ['Round ' + t('CB') + ' first, then multiply by ' + t(TAN(s.C)) + '.'], 'DB from rounded CB');
        } },
        { id: 'e11c', level: 'EMG', make: function (r, s) {
          return chain('The correct answer is ' + t('DB\\approx ' + fx(s.db, 1)) + ' m. Using ' + t('CB') + ' rounded to the tenth gives ' + t(fx(s.d1, 1)) + ' m, and to the whole metre gives ' + t(fx(s.d0, 1)) + ' m. How far is each from the correct answer?', [
            { label: 'Tenth:', name: 'Tenth', unit: 'm', x: s.e1, dp: 1, abs: true, alts: [] },
            { label: 'Whole metre:', name: 'Whole metre', unit: 'm', x: s.e0, dp: 1, abs: true, alts: [] }],
            t(fx(s.d1, 1) + '-' + fx(s.db, 1)) + ': ' + t(fx(s.e1, 1)) + ' m ' + (s.d1 > s.db ? 'too large' : 'too small') + '; ' + t(fx(s.d0, 1) + '-' + fx(s.db, 1)) + ': ' + t(fx(s.e0, 1)) + ' m ' + (s.d0 > s.db ? 'too large' : 'too small') + '.<br>The second triangle multiplies ' + t('CB') + ' by ' + t(TAN(s.C) + '\\approx ' + fx(Tg.tan(s.C), 2)) + ', so any error in ' + t('CB') + ' is multiplied by about ' + t(fx(Tg.tan(s.C), 2)) + '.',
            ['Subtract the correct answer from each rounded-route answer (give the size of the difference).'], 'size of the rounding errors');
        } },
        { id: 'e11c2', sub: 'c why', level: 'PRG', make: function (r, s) {
          var m = fx(Tg.tan(s.C), 2);
          return mc(r, 'Rounding ' + t('CB') + ' looked harmless — a few hundredths, then a few tenths. What does the factor ' + t(TAN(s.C)) + ' have to do with the size of the final errors?', [
            { html: t('DB=CB\\times' + TAN(s.C)) + ' and ' + t(TAN(s.C) + '\\approx ' + m) + ', so the error in ' + t('CB') + ' is multiplied by about ' + t(m) + '. A steep angle is a big multiplier.', right: true },
            { html: 'Nothing: the errors come from rounding ' + t(TAN(s.C)) + ' itself.', why: 'The calculator’s ' + t(TAN(s.C)) + ' wasn’t rounded. The rounding was in ' + t('CB') + ', and ' + t(TAN(s.C)) + ' then magnified it.' },
            { html: t(TAN(s.C)) + ' is less than 1, so it shrinks the error.', why: t(TAN(s.C) + '\\approx ' + m) + ' — much greater than 1, because the angle is close to ' + t('90^\\circ') + '.' },
            { html: 'The error is always exactly ' + t(TAN(s.C)) + ' metres.', why: 'The error is (error in ' + t('CB') + ') ' + t('\\times') + ' ' + t(TAN(s.C)) + ', so it depends on how much ' + t('CB') + ' was rounded.' }],
            'The second triangle multiplies the shared side by ' + t(TAN(s.C) + '\\approx ' + m) + ', so the error in ' + t('CB') + ' is multiplied by about ' + t(m) + ': ' + t('(' + fx(s.cb, 1) + '-' + fx(s.cb, 4) + ')\\times ' + m + '\\approx ' + fx((rd(s.cb, 1) - s.cb) * Tg.tan(s.C), 2)) + ' m and ' + t('(' + fx(s.cb, 0) + '-' + fx(s.cb, 4) + ')\\times ' + m + '\\approx ' + fx((rd(s.cb, 0) - s.cb) * Tg.tan(s.C), 2)) + ' m. A steep angle is a large multiplier, and a large multiplier magnifies an early rounding error.',
            ['How big is ' + t(TAN(s.C)) + '? What happens to a small error when it is multiplied by that?'], 'tan magnifies the error');
        } },
        { id: 'e11d', level: 'EMG', make: function (r) {
          return mc(r, 'Which rule should a classmate follow in a two-triangle problem?', [
            { html: 'Round once, at the very end, and only the quantity the question asks for. Any value that will be used again — above all the shared side — stays at full calculator precision.', right: true },
            { html: 'Round every value to one decimal place, so all the numbers match the given data.', why: 'That is exactly what put the wrong number into the second triangle. Values that are used again must stay unrounded.' },
            { html: 'Round the shared side to the same place as the final answer.', why: 'Even rounding to the tenth moved the final answer here. The shared side is used again, so keep every digit.' },
            { html: 'Rounding never matters if the angle is less than ' + t('45^\\circ') + '.', why: 'The angle changes how much an error grows, but an early rounding can always change the final digit. Round once, at the end.' }],
            '<b>Round once, at the very end, and only on the quantity the question asks for.</b> Any value that will be used again — above all a shared side — must be carried at full calculator precision (leave it on the display or store it in memory).',
            ['When is a number safe to round?'], 'rounding rule');
        } }] });

    /* ---------- Part G ---------- */
    E.push({ num: '12', section: 'Extra practice G — An angle assembled from two triangles',
      shared: function (r) {
        return gen(r, function (r) { return { ad: tenth(r, 7.0, 11.0), bd: tenth(r, 5.0, 9.0), dc: tenth(r, 9.0, 14.0) }; },
          function (p) { var o = { ad: p.ad, bd: p.bd, dc: p.dc }; o.a1 = Tg.atan(p.bd / p.ad); o.a2 = Tg.atan(p.dc / p.ad); o.bac = o.a1 + o.a2; o.ab = hyp(p.ad, p.bd); o.ac = hyp(p.ad, p.dc); return o; },
          function (s) { return rd(s.a1, 0) + rd(s.a2, 0) !== rd(s.bac, 0) && s.bac >= 70 && s.bac <= 100; }, { ad: 9.2, bd: 7.0, dc: 11.5 });
      },
      stem: function (s) {
        var F = fig({ pts: { B: [-s.bd, 0], D: [0, 0], C: [s.dc, 0], A: [0, s.ad] }, segs: [['B', 'D', g1(s.bd) + ' cm'], ['D', 'C', g1(s.dc) + ' cm'], ['A', 'B'], ['A', 'C'], ['A', 'D', g1(s.ad) + ' cm']], right: [['D', 'C', 'A']], aria: 'triangle ABC with altitude AD' });
        return '<b>A sum.</b> In ' + t('\\triangle ABC') + ', the altitude ' + t('AD') + ' meets ' + t('BC') + ' at ' + t('D') + ', between ' + t('B') + ' and ' + t('C') + '. ' + t('AD=' + g1(s.ad)) + ' cm, ' + t('BD=' + g1(s.bd)) + ' cm and ' + t('DC=' + g1(s.dc)) + ' cm.' + F;
      },
      parts: [
        { id: 'e12a', level: 'EMG', make: function (r, s) {
          return chain('Determine ' + t('\\angle BAD') + ' and ' + t('\\angle DAC') + ', each to the nearest degree.', [
            { label: t('\\angle BAD='), name: '∠BAD', unit: '°', x: s.a1, dp: 0, alts: [{ v: 90 - s.a1, code: 'ch-complement', hint: 'That is ' + t('\\angle B') + '. From ' + t('\\angle BAD') + ', ' + t('BD') + ' is opposite and ' + t('AD') + ' adjacent.' }, { v: Math.atan(s.bd / s.ad), code: 'ch-radian', hint: RADH }] },
            { label: t('\\angle DAC='), name: '∠DAC', unit: '°', x: s.a2, dp: 0, alts: [{ v: 90 - s.a2, code: 'ch-complement', hint: 'That is ' + t('\\angle C') + '. From ' + t('\\angle DAC') + ', ' + t('DC') + ' is opposite and ' + t('AD') + ' adjacent.' }, { v: Math.atan(s.dc / s.ad), code: 'ch-radian', hint: RADH }] }],
            t('\\angle BAD=\\tan^{-1}\\left(' + fr(g1(s.bd), g1(s.ad)) + '\\right)=' + v4(s.a1) + '^\\circ\\approx ' + dg(fx(s.a1, 0))) + '<br>' + t('\\angle DAC=\\tan^{-1}\\left(' + fr(g1(s.dc), g1(s.ad)) + '\\right)=' + v4(s.a2) + '^\\circ\\approx ' + dg(fx(s.a2, 0))),
            ['In each triangle the altitude ' + t('AD') + ' is adjacent to the angle at ' + t('A') + '.'], 'two angles at A');
        } },
        { id: 'e12b', level: 'PRG', make: function (r, s) {
          return near('Determine ' + t('\\angle BAC') + ' to the nearest degree, rounding only at the end.', s.bac, 0, '°', [{ v: rd(s.a1, 0) + rd(s.a2, 0), code: 'ch-early', hint: 'That is the sum of the two <b>rounded</b> angles. Add the unrounded angles, then round once.' }, { v: 180 - s.bac, code: 'ch-complement', hint: 'Check each piece: ' + t('BD') + ' and ' + t('DC') + ' are opposite the angles at ' + t('A') + '.' }],
            t('\\angle BAC=\\angle BAD+\\angle DAC=' + v4(s.a1) + '^\\circ+' + v4(s.a2) + '^\\circ=' + v4(s.bac) + '^\\circ\\approx ' + dg(fx(s.bac, 0))),
            ['Find both angles at ' + t('A') + ' unrounded, add, then round.'], '∠BAC as a sum');
        } },
        { id: 'e12c', level: 'PRG', make: function (r, s) {
          var r1 = rd(s.a1, 0), r2 = rd(s.a2, 0), c1 = r1 - s.a1, c2 = r2 - s.a2, sg = function (x) { return (x >= 0 ? '+' : '-') + fx(Math.abs(x), 2) + '^\\circ'; };
          return mc(r, 'Adding the two rounded angles gives ' + t(dg(r1) + '+' + dg(r2) + '=' + dg(r1 + r2)) + ', but ' + t('\\angle BAC\\approx ' + dg(fx(s.bac, 0))) + '. Where did the difference come from?', [
            { html: 'Rounding each angle changed it a little (' + t(sg(c1)) + ' and ' + t(sg(c2)) + '). Together that is ' + t(sg(c1 + c2)) + ' — enough to cross a halfway mark. Rounding <b>before</b> adding caused it.', right: true },
            { html: 'One of the two rounded angles must have been calculated wrongly.', why: 'Both are correct to the nearest degree. The difference comes from rounding before adding.' },
            { html: 'The angles of a triangle never add exactly, so a degree is always lost.', why: 'They do add exactly to ' + t('180^\\circ') + '. The lost degree is in the arithmetic: rounding happened before the addition.' },
            { html: 'The calculator rounds tangent ratios differently each time.', why: 'The calculator is consistent. We rounded the two angles before adding them — that changed the total.' }],
            'Each rounding changed its angle: ' + t(v4(s.a1) + '^\\circ\\to ' + dg(r1)) + ' and ' + t(v4(s.a2) + '^\\circ\\to ' + dg(r2)) + '. The true sum ' + t(v4(s.bac) + '^\\circ') + ' rounds to ' + t(dg(fx(s.bac, 0))) + ', but the rounded pieces add to ' + t(dg(r1 + r2)) + '. The degree was lost in the arithmetic, because rounding happened <b>before</b> the addition instead of after it.',
            ['How much did rounding change each angle? Add those changes.'], 'where the degree went');
        } },
        { id: 'e12d', level: 'BEG', make: function (r, s) {
          return chain('Determine ' + t('AB') + ' and ' + t('AC') + ' to the nearest tenth. (Then you could check that ' + t('\\angle BAC+\\angle B+\\angle C=180^\\circ') + '.)', [
            { label: t('AB='), name: 'AB', unit: 'cm', x: s.ab, dp: 1, alts: [{ v: s.ad + s.bd, code: 'ch-add-legs', hint: 'Use the Pythagorean theorem: ' + t('AB=\\sqrt{AD^{2}+BD^{2}}') + '.' }] },
            { label: t('AC='), name: 'AC', unit: 'cm', x: s.ac, dp: 1, alts: [{ v: s.ad + s.dc, code: 'ch-add-legs', hint: 'Use the Pythagorean theorem: ' + t('AC=\\sqrt{AD^{2}+DC^{2}}') + '.' }] }],
            t('AB=\\sqrt{' + g1(s.ad) + '^{2}+' + g1(s.bd) + '^{2}}=' + v4(s.ab) + '\\approx ' + fx(s.ab, 1)) + ' cm<br>' + t('AC=\\sqrt{' + g1(s.ad) + '^{2}+' + g1(s.dc) + '^{2}}=' + v4(s.ac) + '\\approx ' + fx(s.ac, 1)) + ' cm<br>Check: ' + t('\\angle B=90^\\circ-' + v4(s.a1) + '^\\circ') + ', ' + t('\\angle C=90^\\circ-' + v4(s.a2) + '^\\circ') + ', and ' + t(v4(s.bac) + '^\\circ+\\angle B+\\angle C=180^\\circ') + ' ✓',
            ['Each is a hypotenuse with two known legs.'], 'AB and AC');
        } }] });
    E.push({ num: '13',
      shared: function (r) {
        return gen(r, function (r) { return { ab: tenth(r, 14.0, 20.0), ad: tenth(r, 6.0, 9.0), am: tenth(r, 4.0, 8.0) }; },
          function (p) { var o = { ab: p.ab, ad: p.ad, am: p.am }; o.adm = Tg.atan(p.am / p.ad); o.adb = Tg.atan(p.ab / p.ad); o.mdb = o.adb - o.adm; o.dm = hyp(p.ad, p.am); o.db = hyp(p.ad, p.ab); return o; },
          function (s) { return s.am <= s.ab / 2 && s.mdb >= 15; }, { ab: 18.0, ad: 7.5, am: 6.4 });
      },
      stem: function (s) {
        var F = fig({ pts: { A: [0, 0], B: [s.ab, 0], C: [s.ab, s.ad], D: [0, s.ad], M: [s.am, 0] }, segs: [['A', 'M', g1(s.am) + ' cm', { side: -1 }], ['M', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A', g1(s.ad) + ' cm'], ['D', 'B', { width: 1.8 }], ['D', 'M', { width: 1.8 }]], right: [['A', 'M', 'D']], extra: [{ type: 'text', at: [s.ab * 0.62, -s.ad * 0.32], text: 'AB = ' + g1(s.ab) + ' cm' }], aria: 'rectangular gate with two braces' });
        return '<b>A difference.</b> ' + t('ABCD') + ' is a rectangular gate panel with ' + t('AB=' + g1(s.ab)) + ' cm and ' + t('AD=' + g1(s.ad)) + ' cm. A diagonal brace runs from ' + t('D') + ' to ' + t('B') + ', and a shorter brace runs from ' + t('D') + ' to the point ' + t('M') + ' on ' + t('AB') + ' where ' + t('AM=' + g1(s.am)) + ' cm.' + F;
      },
      parts: [
        { id: 'e13a', level: 'EMG', make: function (r, s) {
          return chain('Determine ' + t('\\angle ADM') + ' and ' + t('\\angle ADB') + ', each to the nearest degree.', [
            { label: t('\\angle ADM='), name: '∠ADM', unit: '°', x: s.adm, dp: 0, alts: [{ v: 90 - s.adm, code: 'ch-complement', hint: 'That is ' + t('\\angle AMD') + '. From ' + t('\\angle ADM') + ', ' + t('AM') + ' is opposite and ' + t('AD') + ' adjacent.' }, { v: Math.atan(s.am / s.ad), code: 'ch-radian', hint: RADH }] },
            { label: t('\\angle ADB='), name: '∠ADB', unit: '°', x: s.adb, dp: 0, alts: [{ v: 90 - s.adb, code: 'ch-complement', hint: 'That is ' + t('\\angle ABD') + '. From ' + t('\\angle ADB') + ', ' + t('AB') + ' is opposite and ' + t('AD') + ' adjacent.' }, { v: Math.atan(s.ab / s.ad), code: 'ch-radian', hint: RADH }] }],
            t('\\triangle ADM') + ', right angle at ' + t('A') + ': ' + t('\\angle ADM=\\tan^{-1}\\left(' + fr(g1(s.am), g1(s.ad)) + '\\right)=' + v4(s.adm) + '^\\circ\\approx ' + dg(fx(s.adm, 0))) + '<br>' + t('\\triangle ADB') + ': ' + t('\\angle ADB=\\tan^{-1}\\left(' + fr(g1(s.ab), g1(s.ad)) + '\\right)=' + v4(s.adb) + '^\\circ\\approx ' + dg(fx(s.adb, 0))),
            ['Both triangles are right-angled at ' + t('A') + ' and share the leg ' + t('AD') + '.'], 'two angles at D');
        } },
        { id: 'e13b', level: 'PRG', make: function (r, s) {
          return near('Determine ' + t('\\angle MDB') + ' to the nearest degree, rounding only at the end.', s.mdb, 0, '°', [{ v: rd(s.adb, 0) - rd(s.adm, 0), code: 'ch-early', hint: 'That is the difference of the two <b>rounded</b> angles. Subtract the unrounded angles, then round once.' }, { v: s.adb + s.adm, code: 'ch-add-angles', hint: t('M') + ' is between ' + t('A') + ' and ' + t('B') + ', so ' + t('\\angle ADM') + ' is <b>part</b> of ' + t('\\angle ADB') + ': subtract.' }, { v: s.adm, code: 'ch-one-piece', hint: 'That is ' + t('\\angle ADM') + '. ' + t('\\angle MDB=\\angle ADB-\\angle ADM') + '.' }],
            t('\\angle MDB=\\angle ADB-\\angle ADM=' + v4(s.adb) + '^\\circ-' + v4(s.adm) + '^\\circ=' + v4(s.mdb) + '^\\circ\\approx ' + dg(fx(s.mdb, 0))),
            [t('\\angle ADM') + ' sits inside ' + t('\\angle ADB') + '.'], '∠MDB as a difference');
        } },
        { id: 'e13c', level: 'BEG', make: function (r, s) {
          return chain('Determine the lengths of the two braces ' + t('DM') + ' and ' + t('DB') + ' to the nearest tenth.', [
            { label: t('DM='), name: 'DM', unit: 'cm', x: s.dm, dp: 1, alts: [{ v: s.ad + s.am, code: 'ch-add-legs', hint: 'Use the Pythagorean theorem: ' + t('DM=\\sqrt{AD^{2}+AM^{2}}') + '.' }, { v: Math.sqrt(Math.abs(s.ad * s.ad - s.am * s.am)), code: 'ch-pyth', hint: t('DM') + ' is the hypotenuse — add the squares.' }] },
            { label: t('DB='), name: 'DB', unit: 'cm', x: s.db, dp: 1, alts: [{ v: s.ad + s.ab, code: 'ch-add-legs', hint: 'Use the Pythagorean theorem: ' + t('DB=\\sqrt{AD^{2}+AB^{2}}') + '.' }, { v: Math.sqrt(s.ab * s.ab - s.ad * s.ad), code: 'ch-pyth', hint: t('DB') + ' is the hypotenuse — add the squares.' }] }],
            t('DM=\\sqrt{' + g1(s.ad) + '^{2}+' + g1(s.am) + '^{2}}=' + v4(s.dm) + '\\approx ' + fx(s.dm, 1)) + ' cm<br>' + t('DB=\\sqrt{' + g1(s.ad) + '^{2}+' + g1(s.ab) + '^{2}}=' + v4(s.db) + '\\approx ' + fx(s.db, 1)) + ' cm',
            ['Each brace is the hypotenuse of a right triangle with the right angle at ' + t('A') + '.'], 'brace lengths');
        } },
        { id: 'e13d', level: 'EMG', make: function (r) {
          return mc(r, 'In a sum like ' + t('\\angle BAC=\\angle BAD+\\angle DAC') + ' (altitude between the two triangles) the angles are added; here ' + t('\\angle MDB=\\angle ADB-\\angle ADM') + '. What is different about where the two triangles sit?', [
            { html: 'Here both triangles are on the <b>same</b> side of the shared leg ' + t('AD') + ', and ' + t('\\triangle ADM') + ' sits inside ' + t('\\triangle ADB') + ' — so the smaller angle is part of the larger one and is taken away. With the altitude between them, they sit on <b>opposite</b> sides and their angles join.', right: true },
            { html: 'Nothing is different; the subtraction is only because ' + t('AM') + ' is shorter than ' + t('AB') + '.', why: 'Lengths alone don’t decide it. What matters is whether the triangles overlap (same side of the shared leg) or sit side by side (opposite sides).' },
            { html: 'Here the shared side is a hypotenuse, so the angles subtract.', why: t('AD') + ' is a leg of both triangles here. The difference is the position of the triangles relative to it.' },
            { html: 'Angles at the top of a figure always subtract; angles at the bottom always add.', why: 'There is no such rule. Look at whether one triangle lies inside the other.' }],
            'When the shared altitude lies <b>between</b> the triangles, they sit on opposite sides of it and their angles meet edge to edge — they add. Here ' + t('M') + ' lies between ' + t('A') + ' and ' + t('B') + ', so both triangles are on the same side of the shared leg ' + t('AD') + ' and ' + t('\\triangle ADM') + ' sits inside ' + t('\\triangle ADB') + ': the smaller angle is part of the larger, so it is subtracted.',
            ['Does one triangle lie inside the other, or are they side by side?'], 'add or subtract angles');
        } }] });

    /* ---------- Part H ---------- */
    E.push({ num: '14', section: 'Extra practice H — Error analysis: three ways to break the chain',
      shared: function (r) {
        return gen(r, function (r) { return { ad: tenth(r, 8.0, 13.0), A: r.int(32, 42), C: r.int(50, 62) }; },
          function (p) { var o = { ad: p.ad, A: p.A, C: p.C }; o.bd = p.ad * Tg.tan(p.A); o.dc = o.bd / Tg.tan(p.C); o.st = p.ad / Tg.tan(p.C); o.ab = p.ad / Tg.cos(p.A); o.bc = o.bd / Tg.sin(p.C); return o; }, function (s) { return fx(s.st, 1) !== fx(s.dc, 1); }, { ad: 11.0, A: 40, C: 55 });
      },
      stem: function (s) {
        var F = fig({ pts: { A: [-s.ad, 0], D: [0, 0], C: [s.dc, 0], B: [0, s.bd] }, segs: [['A', 'D', g1(s.ad) + ' cm'], ['D', 'C'], ['A', 'B'], ['B', 'C'], ['B', 'D']], right: [['D', 'C', 'B']], angles: [['A', 'D', 'B', s.A + '°', { r: 30 }], ['C', 'D', 'B', s.C + '°', { r: 24 }]], aria: 'triangle with altitude BD' });
        return '<b>The right number in the wrong triangle.</b> ' + t('BD\\perp AC') + ' with ' + t('D') + ' between ' + t('A') + ' and ' + t('C') + ', ' + t('AD=' + g1(s.ad)) + ' cm, ' + t('\\angle A=' + dg(s.A)) + ' and ' + t('\\angle C=' + dg(s.C)) + '. Asked for ' + t('DC') + ' to the nearest tenth, a student wrote ' + t(TAN(s.C) + '=' + fr(g1(s.ad), 'DC') + ',\\ DC=' + fr(g1(s.ad), TAN(s.C)) + '=' + fx(s.st, 1)) + ' cm.' + F;
      },
      parts: [
        { id: 'e14a', level: 'EMG', make: function (r, s) {
          return mc(r, 'The number ' + t(g1(s.ad)) + ' appears nowhere in the student’s triangle. Which triangle does it belong to, and what should the numerator have been?', [
            { html: t(g1(s.ad)) + ' is ' + t('AD') + ', a side of ' + t('\\triangle ABD') + ' (the ' + t(dg(s.A)) + ' triangle). In ' + t('\\triangle BDC') + ' the side opposite ' + t(dg(s.C)) + ' is the shared altitude ' + t('BD') + ', so ' + t(TAN(s.C) + '=' + fr('BD', 'DC')) + '.', right: true },
            { html: t(g1(s.ad)) + ' belongs to ' + t('\\triangle BDC') + '; the numerator should be ' + t('BC') + '.', why: t('AD') + ' is not a side of ' + t('\\triangle BDC') + '. And ' + t('BC') + ' is the hypotenuse there — tangent doesn’t use it.' },
            { html: t(g1(s.ad)) + ' belongs to ' + t('\\triangle ABD') + '; the numerator should be ' + t('AB') + '.', why: t('AB') + ' isn’t in ' + t('\\triangle BDC') + ' either. The only side the triangles share is ' + t('BD') + '.' },
            { html: 'The numerator is fine; the student should have used ' + t(SIN(s.C)) + ' instead of tangent.', why: 'Changing the ratio doesn’t fix it: ' + t(g1(s.ad)) + ' simply isn’t a side of the ' + t(dg(s.C)) + ' triangle.' }],
            t(g1(s.ad)) + ' cm is ' + t('AD') + ', a side of ' + t('\\triangle ABD') + ' — the triangle with the ' + t(dg(s.A)) + ' angle. The ' + t(dg(s.C)) + ' angle is in ' + t('\\triangle BDC') + ', and the only side ' + t('\\triangle BDC') + ' shares with ' + t('\\triangle ABD') + ' is the altitude ' + t('BD') + '. So the numerator should have been ' + t('BD') + ': ' + t(TAN(s.C) + '=' + fr('BD', 'DC')) + '.',
            ['List the three sides of ' + t('\\triangle BDC') + '. Is ' + t('AD') + ' one of them?'], 'wrong triangle: where AD belongs');
        } },
        { id: 'e14b', level: 'PRG', make: function (r, s) {
          var f = function (bd) { return bd / Tg.tan(s.C); };
          return near('Give the corrected solution: determine ' + t('DC') + ' to the nearest tenth.', s.dc, 1, 'cm', early(f, s.bd, t('BD')).concat([{ v: s.st, code: 'ch-wrong-triangle', hint: 'That is the student’s answer: ' + t(g1(s.ad)) + ' is not in ' + t('\\triangle BDC') + '. Find the shared side ' + t('BD') + ' in ' + t('\\triangle ABD') + ' first.' }, { v: s.bd * Tg.tan(s.C), code: 'ch-inverted', hint: t(TAN(s.C) + '=' + fr('BD', 'DC')) + ', so ' + t('DC=' + fr('BD', TAN(s.C))) + '.' }, radAlt(function (T) { return s.ad * T.tan(s.A) / T.tan(s.C); })]),
            t('\\triangle ABD') + ' first (right angle at ' + t('D') + ', ' + t('\\angle A=' + dg(s.A)) + '): ' + t('BD=' + g1(s.ad) + TAN(s.A) + '=' + v4(s.bd)) + ' cm (unrounded)<br>' + t('\\triangle BDC') + ': ' + t('BD') + ' opposite ' + t(dg(s.C)) + ', ' + t('DC') + ' adjacent: ' + t('DC=' + fr(v4(s.bd), TAN(s.C)) + '=' + v4(s.dc) + '\\approx ' + fx(s.dc, 1)) + ' cm',
            ['Find ' + t('BD') + ' first.'], 'corrected DC');
        } },
        { id: 'e14c', level: 'PRG', make: function (r, s) {
          return mc(r, 'The student’s ' + t(fx(s.st, 1)) + ' cm is too large. Which argument (no calculator) explains why?', [
            { html: t('\\angle A=' + dg(s.A)) + ' is less than ' + t('45^\\circ') + ', so ' + t(TAN(s.A) + '<1') + ' and ' + t('BD=AD' + TAN(s.A) + '<AD') + '. Dividing the larger ' + t(g1(s.ad)) + ' by the same ' + t(TAN(s.C)) + ' must give a larger answer.', right: true },
            { html: t(TAN(s.C)) + ' is greater than 1, so dividing by it always makes answers too large.', why: 'Dividing by a number greater than 1 makes things <b>smaller</b>. The issue is the numerator: ' + t(g1(s.ad)) + ' is bigger than the true ' + t('BD') + '.' },
            { html: 'The student should have multiplied, which would have made the answer smaller.', why: 'Dividing was right (' + t('DC') + ' is in the denominator). The numerator ' + t(g1(s.ad)) + ' is too big.' },
            { html: 'Any answer above ' + t('5') + ' cm is impossible in this figure.', why: 'There is no such limit. Compare ' + t('BD') + ' with ' + t('AD') + ' using ' + t(TAN(s.A)) + '.' }],
            t('\\angle A=' + dg(s.A)) + ' is less than ' + t('45^\\circ') + ', so ' + t(TAN(s.A) + '<1') + ' and ' + t('BD=AD' + TAN(s.A) + '<AD=' + g1(s.ad)) + ' — the figure shows it: the altitude is shorter than ' + t('AD') + '. The student divided ' + t(g1(s.ad)) + ' by ' + t(TAN(s.C)) + ' where the correct numerator ' + t('BD') + ' is smaller, so the answer must be too big.',
            ['Compare ' + t('BD') + ' with ' + t('AD') + '. What is ' + t(TAN(s.A)) + ' bigger or smaller than?'], 'why the wrong answer is too large');
        } },
        { id: 'e14d', level: 'PRG', make: function (r, s) {
          return chain('Determine ' + t('AB') + ' and ' + t('BC') + ' to the nearest tenth.', [
            { label: t('AB='), name: 'AB', unit: 'cm', x: s.ab, dp: 1, alts: [{ v: s.ad * Tg.cos(s.A), code: 'ch-inverted', hint: t(COS(s.A) + '=' + fr(g1(s.ad), 'AB')) + ' — divide.' }, { v: s.ad / Tg.sin(s.A), code: 'ch-ratio', hint: t('AD') + ' is <b>adjacent</b> to ' + t('\\angle A') + ': CAH.' }, radAlt(function (T) { return s.ad / T.cos(s.A); })] },
            { label: t('BC='), name: 'BC', unit: 'cm', x: s.bc, dp: 1, alts: early(function (bd) { return bd / Tg.sin(s.C); }, s.bd, t('BD')).concat([{ v: s.bd * Tg.sin(s.C), code: 'ch-inverted', hint: t(SIN(s.C) + '=' + fr('BD', 'BC')) + ' — divide.' }, { v: s.bd / Tg.cos(s.C), code: 'ch-ratio', hint: t('BD') + ' is <b>opposite</b> ' + t('\\angle C') + ': SOH.' }, { v: s.ad / Tg.sin(s.C), code: 'ch-wrong-triangle', hint: t(g1(s.ad)) + ' is not in ' + t('\\triangle BDC') + '. Use the shared side ' + t('BD') + '.' }]) }],
            t('\\triangle ABD') + ': ' + t('AB=' + fr(g1(s.ad), COS(s.A)) + '=' + v4(s.ab) + '\\approx ' + fx(s.ab, 1)) + ' cm (CAH)<br>' + t('\\triangle BDC') + ': ' + t('BC=' + fr(v4(s.bd), SIN(s.C)) + '=' + v4(s.bc) + '\\approx ' + fx(s.bc, 1)) + ' cm (SOH)',
            [t('AB') + ' is the hypotenuse of ' + t('\\triangle ABD') + '; ' + t('BC') + ' is the hypotenuse of ' + t('\\triangle BDC') + '.'], 'AB and BC');
        } }] });
    E.push({ num: '15',
      shared: function (r) {
        return gen(r, function (r) { return { pq: tenth(r, 3.5, 6.0), P: r.int(50, 65) }; },
          function (p) { var o = { pq: p.pq, P: p.P }; o.qs = p.pq * Tg.tan(p.P); o.qsr = rd(o.qs, 1); o.sr = rd(o.qsr + 0.1, 1); o.ang = Tg.acos(o.qs / o.sr); o.st = Tg.acos(o.qsr / o.sr); o.qr = Math.sqrt(o.sr * o.sr - o.qs * o.qs); o.qrs = Math.sqrt(o.sr * o.sr - o.qsr * o.qsr); return o; },
          function (s) { return s.qsr - s.qs >= 0.015 && s.qsr - s.qs <= 0.05 && rd(s.ang, 0) - rd(s.st, 0) >= 1 && fx(s.qr, 1) !== fx(s.qrs, 1); }, { pq: 4.6, P: 58 });
      },
      stem: function (s) {
        var F = fig({ pts: { S: [0, 0], Q: [s.qs, 0], P: [s.qs, -s.pq], R: [s.qs, s.qr] }, segs: [['S', 'Q'], ['Q', 'P', g1(s.pq) + ' m'], ['P', 'S'], ['S', 'R', g1(s.sr) + ' m'], ['Q', 'R']], right: [['Q', 'S', 'P']], angles: [['P', 'Q', 'S', s.P + '°', { r: 26 }]], aria: 'two right triangles sharing QS' });
        return '<b>The shared side rounded too soon.</b> ' + t('P') + ', ' + t('Q') + ' and ' + t('R') + ' lie on one straight line, ' + t('SQ\\perp PR') + ', ' + t('PQ=' + g1(s.pq)) + ' m, ' + t('\\angle QPS=' + dg(s.P)) + ' and ' + t('SR=' + g1(s.sr)) + ' m. Asked for ' + t('\\angle QSR') + ' to the nearest degree, a student wrote ' + t('QS=' + g1(s.pq) + TAN(s.P) + '\\approx ' + g1(s.qsr)) + ', ' + t('\\cos(\\angle QSR)=' + fr(g1(s.qsr), g1(s.sr))) + ', ' + t('\\angle QSR=' + dg(fx(s.st, 0))) + '.' + F;
      },
      parts: [
        { id: 'e15a', sub: 'a i', level: 'EMG', make: function (r, s) {
          return mc(r, 'Every ratio the student chose was the right one. What was the error?', [
            { html: 'Rounding the shared side ' + t('QS') + ' to ' + t(g1(s.qsr)) + ' before handing it to ' + t('\\triangle SQR') + '.', right: true },
            { html: 'Using tangent in ' + t('\\triangle PQS') + ' — it should have been sine.', why: 'From ' + t('\\angle QPS') + ', ' + t('QS') + ' is opposite and ' + t('PQ') + ' is adjacent, so tangent is right.' },
            { html: 'Using cosine in ' + t('\\triangle SQR') + ' — it should have been sine.', why: 'From ' + t('\\angle QSR') + ', ' + t('QS') + ' is adjacent and ' + t('SR') + ' is the hypotenuse, so cosine is right.' },
            { html: 'Rounding the final angle to the nearest degree.', why: 'The question asks for the nearest degree. The problem is a value rounded <b>before</b> the end.' }],
            'The error is <b>rounding the shared side before handing it over</b>. Both ratios (TOA in the first triangle, CAH in the second) were correct; the ' + t(g1(s.qsr)) + ' is what broke the chain.',
            ['Both ratios are right. What else did the student do to ' + t('QS') + '?'], 'name the error');
        } },
        { id: 'e15a2', sub: 'a ii', level: 'BEG', make: function (r, s) {
          return chain('Write down ' + t('QS') + ' with every digit your calculator shows (at least four decimal places).', [
            { label: t('QS='), name: 'QS', unit: 'm', mid: true, need: 4, x: s.qs, nm: t('QS'), alts: [{ v: s.pq / Tg.tan(s.P), code: 'ch-inverted', hint: 'From ' + t('\\angle QPS') + ', ' + t('QS') + ' is opposite and ' + t('PQ') + ' adjacent: multiply.' }, { v: s.pq * Tg.sin(s.P), code: 'ch-ratio', hint: t('PQ') + ' is a leg: TOA.' }, radAlt(function (T) { return s.pq * T.tan(s.P); })] }],
            t('QS=' + g1(s.pq) + TAN(s.P) + '=' + fx(s.qs, 7) + '\\ldots') + ' m — the student’s ' + t(g1(s.qsr)) + ' is too big by ' + t(fx(s.qsr - s.qs, 4)) + ' m.',
            ['From ' + t('\\angle QPS') + ', ' + t('QS') + ' is opposite and ' + t('PQ') + ' is adjacent.'], 'QS to many digits');
        } },
        { id: 'e15b', level: 'PRG', make: function (r, s) {
          return near('Redo the second triangle from the unrounded ' + t('QS') + '. What is ' + t('\\angle QSR') + ' to the nearest degree?', s.ang, 0, '°', [{ v: s.st, code: 'ch-early', hint: earlyH(t('QS')) }, { v: 90 - s.ang, code: 'ch-complement', hint: 'That is ' + t('\\angle QRS') + '. From ' + t('\\angle QSR') + ', ' + t('QS') + ' is adjacent and ' + t('SR') + ' the hypotenuse: CAH.' }, { v: Math.acos(s.qs / s.sr), code: 'ch-radian', hint: RADH }],
            t('\\triangle SQR') + ' is right-angled at ' + t('Q') + ': from ' + t('\\angle QSR') + ', ' + t('QS') + ' is adjacent and ' + t('SR') + ' is the hypotenuse (CAH).<br>' + t('\\cos(\\angle QSR)=' + fr(v4(s.qs), g1(s.sr)) + '=' + fx(s.qs / s.sr, 7)) + '<br>' + t('\\angle QSR=' + v4(s.ang) + '^\\circ\\approx ' + dg(fx(s.ang, 0))) + ', not ' + t(dg(fx(s.st, 0))) + '.',
            ['Use the unrounded ' + t('QS=' + g1(s.pq) + TAN(s.P)) + '.'], 'corrected ∠QSR');
        } },
        { id: 'e15c', level: 'PRG', make: function (r, s) {
          return chain('Determine ' + t('QR') + ' both ways — from the unrounded ' + t('QS') + ' and from the student’s ' + t(g1(s.qsr)) + ' — each to the nearest tenth.', [
            { label: 'Unrounded ' + t('QS') + ':', name: 'Unrounded', unit: 'm', x: s.qr, dp: 1, alts: [{ v: s.qrs, code: 'ch-early', hint: 'That is the value from the student’s ' + t(g1(s.qsr)) + '. This box uses the unrounded ' + t('QS') + '.' }, { v: hyp(s.sr, s.qs), code: 'ch-pyth', hint: t('SR') + ' is the hypotenuse: ' + t('QR=\\sqrt{SR^{2}-QS^{2}}') + '.' }] },
            { label: 'Student’s ' + t(g1(s.qsr)) + ':', name: 'Student', unit: 'm', x: s.qrs, dp: 1, alts: [{ v: s.qr, code: 'ch-not-rounded', hint: 'This box uses the student’s rounded ' + t('QS=' + g1(s.qsr)) + '.' }, { v: hyp(s.sr, s.qsr), code: 'ch-pyth', hint: t('SR') + ' is the hypotenuse: ' + t('QR=\\sqrt{SR^{2}-QS^{2}}') + '.' }] }],
            'From the unrounded ' + t('QS') + ': ' + t('QR=\\sqrt{' + g1(s.sr) + '^{2}-' + v4(s.qs) + '^{2}}=' + v4(s.qr) + '\\approx ' + fx(s.qr, 1)) + ' m<br>From ' + t(g1(s.qsr)) + ': ' + t('QR=\\sqrt{' + g1(s.sr) + '^{2}-' + g1(s.qsr) + '^{2}}=' + v4(s.qrs) + '\\approx ' + fx(s.qrs, 1)) + ' m',
            [t('SR') + ' is the hypotenuse of ' + t('\\triangle SQR') + '.'], 'QR both ways');
        } },
        { id: 'e15d', level: 'PRG', make: function (r, s) {
          return mc(r, 'The shared side was off by less than ' + t('0.05') + ' m, yet the angle moved by about ' + t(dg(fx(s.ang - s.st, 0))) + '. Why does this figure punish early rounding so severely?', [
            { html: t('QS') + ' is almost as long as ' + t('SR') + ', so ' + t(fr('QS', 'SR')) + ' is very close to 1 and the angle is close to ' + t('0^\\circ') + ', where cosine is almost flat: a tiny change in the ratio moves the angle a long way.', right: true },
            { html: 'Because ' + t(dg(s.P)) + ' is a large angle, so its tangent is large.', why: 'That affects ' + t('QS') + ' itself, but the error here is magnified in the second triangle — by how close ' + t('QS') + ' is to ' + t('SR') + '.' },
            { html: 'Because cosine values are always less than 1.', why: 'True, but that alone doesn’t magnify errors. What matters is that the ratio is very close to 1, where the angle changes fast.' },
            { html: 'Because the student should have used the inverse tangent.', why: 'Cosine is the right ratio. The sensitivity comes from ' + t('QS') + ' being nearly equal to ' + t('SR') + '.' }],
            t('QS') + ' is very nearly as long as ' + t('SR') + ', so ' + t(fr('QS', 'SR')) + ' is close to 1 and ' + t('\\angle QSR') + ' is close to ' + t('0^\\circ') + '. The cosine curve is almost flat near ' + t('0^\\circ') + ': a tiny change in the ratio moves the angle a long way. ' + t('QR') + ' shows it too — it comes from the <b>difference</b> of two nearly equal squares.',
            ['Compare ' + t('QS') + ' and ' + t('SR') + '. What is ' + t('\\cos^{-1}') + ' of a number very close to 1?'], 'why early rounding hurts here');
        } }] });
    E.push({ num: '16',
      shared: function (r) {
        return gen(r, function (r) { return { fg: tenth(r, 8.0, 12.0), F: r.int(24, 34), hk: tenth(r, 6.0, 10.0) }; },
          function (p) { var o = { fg: p.fg, F: p.F, hk: p.hk }; o.fh = p.fg / Tg.cos(p.F); o.gh = p.fg * Tg.tan(p.F); o.ang = Tg.atan(p.hk / o.fh); o.fk = hyp(o.fh, p.hk); return o; }, function () { return true; }, { fg: 10.4, F: 29, hk: 8.2 });
      },
      stem: function (s) {
        var k = s.hk / s.fh, F = fig({ pts: { F: [0, s.fg], G: [0, 0], H: [s.gh, 0], K: [s.gh + s.fg * k, s.gh * k] }, segs: [['F', 'G', g1(s.fg) + ' cm'], ['G', 'H'], ['F', 'H'], ['H', 'K', g1(s.hk) + ' cm'], ['F', 'K']], right: [['G', 'H', 'F'], ['H', 'F', 'K']], angles: [['F', 'G', 'H', s.F + '°', { r: 32 }]], aria: 'two right triangles sharing FH' });
        return '<b>Starting with the triangle that can’t be started.</b> The right angles are at ' + t('G') + ' and at ' + t('H') + ', ' + t('FG=' + g1(s.fg)) + ' cm, ' + t('\\angle GFH=' + dg(s.F)) + ' and ' + t('HK=' + g1(s.hk)) + ' cm. Asked for ' + t('\\angle HFK') + ', a student wrote ' + t('\\tan(\\angle HFK)=' + fr('HK', 'FH') + '=' + fr(g1(s.hk), 'FH')) + ' and then stopped: “I’m stuck.”' + F;
      },
      parts: [
        { id: 'e16a', level: 'EMG', make: function (r, s) {
          return mc(r, 'The student’s equation is correct. Why can’t it be solved, and what should the student have noticed first?', [
            { html: 'It is one equation with two unknowns (' + t('\\angle HFK') + ' and ' + t('FH') + '). The student should have noticed that ' + t('\\triangle FGH') + ' already has two facts (' + t('FG') + ' and ' + t('\\angle GFH') + ') and solved it for ' + t('FH') + ' first.', right: true },
            { html: 'Tangent can’t be used for ' + t('\\angle HFK') + ' because ' + t('FH') + ' is a hypotenuse.', why: t('FH') + ' is the hypotenuse of ' + t('\\triangle FGH') + ', but in ' + t('\\triangle FHK') + ' it is a leg — tangent is fine there.' },
            { html: 'The equation needs the Pythagorean theorem instead, using ' + t('FG') + ' and ' + t('HK') + '.', why: t('FG') + ' and ' + t('HK') + ' are in different triangles; they can’t go into one Pythagorean equation.' },
            { html: 'It can be solved: ' + t('\\angle HFK=\\tan^{-1}(' + g1(s.hk) + ')') + '.', why: 'That drops ' + t('FH') + ' from the denominator. The ratio is ' + t(fr(g1(s.hk), 'FH')) + ', and ' + t('FH') + ' is still unknown.' }],
            'The equation contains two unknowns, ' + t('\\angle HFK') + ' and ' + t('FH') + ': <b>one equation</b> with <b>two unknowns</b>, so neither can be isolated. ' + t('\\triangle FGH') + ' already has two facts besides its right angle — ' + t('FG') + ' and ' + t('\\angle GFH') + ' — so it is the solvable triangle, and it produces the missing ' + t('FH') + '.',
            ['Count the unknowns in the student’s equation.'], 'stuck: one equation, two unknowns');
        } },
        { id: 'e16b', level: 'EMG', make: function (r, s) {
          return near('Determine the shared side ' + t('FH') + ' to the nearest tenth.', s.fh, 1, 'cm', [{ v: s.fg * Tg.cos(s.F), code: 'ch-inverted', hint: t(COS(s.F) + '=' + fr(g1(s.fg), 'FH')) + ' — the hypotenuse is in the denominator, so divide.' }, { v: s.fg / Tg.sin(s.F), code: 'ch-ratio', hint: t('FG') + ' is <b>adjacent</b> to ' + t('\\angle GFH') + ': CAH.' }, { v: s.gh, code: 'ch-ratio', hint: 'That is ' + t('GH') + '. ' + t('FH') + ' is the hypotenuse of ' + t('\\triangle FGH') + ': CAH.' }, radAlt(function (T) { return s.fg / T.cos(s.F); })],
            t('\\triangle FGH') + ', right angle at ' + t('G') + '. From ' + t('\\angle GFH=' + dg(s.F)) + ': ' + t('FG') + ' adjacent, ' + t('FH') + ' hypotenuse (CAH).<br>' + t('FH=' + fr(g1(s.fg), COS(s.F)) + '=' + v4(s.fh) + '\\approx ' + fx(s.fh, 1)) + ' cm',
            ['Name the sides of ' + t('\\triangle FGH') + ' from ' + t('\\angle GFH') + '.'], 'shared side FH');
        } },
        { id: 'e16c', level: 'PRG', make: function (r, s) {
          var f = function (fh) { return Tg.atan(s.hk / fh); };
          return near('Finish the student’s own equation: determine ' + t('\\angle HFK') + ' to the nearest degree.', s.ang, 0, '°', early(f, s.fh, t('FH')).concat([{ v: Tg.atan(s.hk / s.fg), code: 'ch-wrong-triangle', hint: t('FG') + ' is in ' + t('\\triangle FGH') + '. The side adjacent to ' + t('\\angle HFK') + ' is ' + t('FH') + '.' }, { v: 90 - s.ang, code: 'ch-complement', hint: 'That is ' + t('\\angle HKF') + '. From ' + t('\\angle HFK') + ', ' + t('HK') + ' is opposite and ' + t('FH') + ' adjacent.' }, radAlt(function (T) { return T.atan(s.hk * T.cos(s.F) / s.fg); })]),
            t('FH=' + fr(g1(s.fg), COS(s.F)) + '=' + v4(s.fh)) + ' cm (unrounded)<br>' + t('\\tan(\\angle HFK)=' + fr(g1(s.hk), v4(s.fh)) + '=' + fx(s.hk / s.fh, 7)) + '<br>' + t('\\angle HFK=' + v4(s.ang) + '^\\circ\\approx ' + dg(fx(s.ang, 0))),
            ['Find ' + t('FH') + ' from ' + t('\\triangle FGH') + ', then substitute.'], '∠HFK');
        } },
        { id: 'e16d', level: 'PRG', make: function (r, s) {
          var f = function (fh) { return hyp(fh, s.hk); };
          return near('Determine ' + t('FK') + ' to the nearest tenth.', s.fk, 1, 'cm', early(f, s.fh, t('FH')).concat([{ v: hyp(s.fg, s.hk), code: 'ch-wrong-triangle', hint: t('FG') + ' is not in ' + t('\\triangle FHK') + '. Use ' + t('FH') + ' and ' + t('HK') + '.' }, { v: Math.sqrt(Math.abs(s.fh * s.fh - s.hk * s.hk)), code: 'ch-pyth', hint: t('FK') + ' is the hypotenuse (across from the right angle at ' + t('H') + '): add the squares.' }]),
            t('FK=\\sqrt{FH^{2}+HK^{2}}=\\sqrt{' + v4(s.fh) + '^{2}+' + g1(s.hk) + '^{2}}=' + v4(s.fk) + '\\approx ' + fx(s.fk, 1)) + ' cm',
            ['In ' + t('\\triangle FHK') + ' the right angle is at ' + t('H') + '.'], 'FK');
        } },
        { id: 'e16d2', sub: 'd roles', level: 'BEG', make: function (r, s) {
          return K.P.grid('Is the shared side ' + t('FH') + ' a leg or the hypotenuse in each triangle?', [{ id: 'g', html: 'In ' + t('\\triangle FGH') }, { id: 'k', html: 'In ' + t('\\triangle FHK') }], [{ id: 'leg', html: 'leg' }, { id: 'hyp', html: 'hypotenuse' }], { g: 'hyp', k: 'leg' },
            { tries: 2, why: function (row) { return row === 'g' ? 'In ' + t('\\triangle FGH') + ' the right angle is at ' + t('G') + ' — which side is across from it?' : 'In ' + t('\\triangle FHK') + ' the right angle is at ' + t('H') + ', so the hypotenuse is ' + t('FK') + '.'; } },
            'In ' + t('\\triangle FGH') + ' (right angle at ' + t('G') + '), ' + t('FH') + ' is across from the right angle: the <b>hypotenuse</b>. In ' + t('\\triangle FHK') + ' (right angle at ' + t('H') + '), the hypotenuse is ' + t('FK') + ' and ' + t('FH') + ' is a <b>leg</b>.',
            ['The hypotenuse is always across from the right angle.'], 'role of FH in each triangle');
        } }] });

    /* ---------- Part I ---------- */
    E.push({ num: '17', section: 'Extra practice I — Stretch',
      shared: function (r) {
        return gen(r, function (r) { return { A: r.int(28, 38), C: r.int(40, 55), ac: tenth(r, 15.0, 25.0) }; },
          function (p) { var o = { A: p.A, C: p.C, ac: p.ac }; o.x = p.ac * Tg.tan(p.C) / (Tg.tan(p.A) + Tg.tan(p.C)); o.bd = o.x * Tg.tan(p.A); return o; }, function (s) { return s.C - s.A >= 6; }, { A: 32, C: 47, ac: 20.0 });
      },
      stem: function (s) {
        var F = fig({ pts: { A: [0, 0], D: [s.x, 0], C: [s.ac, 0], B: [s.x, s.bd] }, segs: [['A', 'D', 'x'], ['D', 'C'], ['A', 'B'], ['B', 'C'], ['B', 'D']], right: [['D', 'C', 'B']], angles: [['A', 'D', 'B', s.A + '°', { r: 32 }], ['C', 'D', 'B', s.C + '°', { r: 28 }]], extra: [{ type: 'text', at: [s.ac * 0.5, -s.bd * 0.42], text: 'AC = ' + g1(s.ac) + ' cm' }], aria: 'triangle with altitude BD' });
        return '<b>The shared side written twice.</b> ' + t('BD\\perp AC') + ' with ' + t('D') + ' between ' + t('A') + ' and ' + t('C') + ', ' + t('\\angle A=' + dg(s.A)) + ', ' + t('\\angle C=' + dg(s.C)) + ' and ' + t('AC=' + g1(s.ac)) + ' cm. <b>Neither</b> triangle can be solved on its own. Let ' + t('AD=x') + ' cm, so ' + t('DC=(' + g1(s.ac) + '-x)') + ' cm.' + F;
      },
      parts: [
        { id: 'e17a', level: 'PRG', make: function (r, s) {
          var c = g1(s.ac);
          return mc(r, 'Which pair of expressions gives the shared side ' + t('BD') + ', first from ' + t('\\triangle ABD') + ' and then from ' + t('\\triangle DBC') + '?', [
            { html: t('BD=x' + TAN(s.A)) + ' and ' + t('BD=(' + c + '-x)' + TAN(s.C)), right: true },
            { html: t('BD=' + fr('x', TAN(s.A))) + ' and ' + t('BD=' + fr(c + '-x', TAN(s.C))), why: 'From ' + t('\\angle A') + ', ' + t('BD') + ' is opposite and ' + t('x') + ' is adjacent: ' + t(TAN(s.A) + '=' + fr('BD', 'x')) + ', so multiply.' },
            { html: t('BD=x' + TAN(s.A)) + ' and ' + t('BD=x' + TAN(s.C)), why: 'In ' + t('\\triangle DBC') + ' the adjacent side is ' + t('DC=' + c + '-x') + ', not ' + t('x') + '.' },
            { html: t('BD=x' + SIN(s.A)) + ' and ' + t('BD=(' + c + '-x)' + SIN(s.C)), why: t('x') + ' and ' + t(c + '-x') + ' are legs, not hypotenuses: use tangent.' }],
            t('\\triangle ABD') + ': ' + t('x') + ' adjacent, ' + t('BD') + ' opposite ' + t('\\angle A') + ' (TOA): ' + t('BD=x' + TAN(s.A)) + '.<br>' + t('\\triangle DBC') + ': ' + t(c + '-x') + ' adjacent, ' + t('BD') + ' opposite ' + t('\\angle C') + ': ' + t('BD=(' + c + '-x)' + TAN(s.C)) + '.',
            ['In each triangle, ' + t('BD') + ' is opposite the given angle and the base piece is adjacent.'], 'BD in terms of x twice');
        } },
        { id: 'e17b', level: 'ADV', make: function (r, s) {
          var c = g1(s.ac), ta = rd(Tg.tan(s.A), 2), tc = rd(Tg.tan(s.C), 2);
          return near('Set the two expressions ' + t('x' + TAN(s.A) + '=(' + c + '-x)' + TAN(s.C)) + ' equal and solve for ' + t('x') + ' (nearest tenth).', s.x, 1, 'cm', [{ v: s.ac - s.x, code: 'ch-other-piece', hint: 'That is ' + t('DC=' + c + '-x') + '. Check which tangent goes with ' + t('x') + ': ' + t('x') + ' is next to the ' + t(dg(s.A)) + ' angle.' }, { v: s.ac * tc / (ta + tc), code: 'ch-early', hint: earlyH('the tangent values') }, { v: s.ac * Tg.tan(s.C) / Math.abs(Tg.tan(s.C) - Tg.tan(s.A)), code: 'ch-add-angles', hint: 'Collect the ' + t('x') + ' terms carefully: ' + t('x' + TAN(s.A) + '+x' + TAN(s.C) + '=' + c + TAN(s.C)) + '.' }, radAlt(function (T) { return s.ac * T.tan(s.C) / (T.tan(s.A) + T.tan(s.C)); })],
            t('x' + TAN(s.A) + '=' + c + TAN(s.C) + '-x' + TAN(s.C)) + '<br>' + t('x(' + TAN(s.A) + '+' + TAN(s.C) + ')=' + c + TAN(s.C)) + '<br>' + t('x=' + fr(c + TAN(s.C), TAN(s.A) + '+' + TAN(s.C)) + '=' + v4(s.x) + '\\approx ' + fx(s.x, 1)) + ' cm',
            ['Expand the right side, then gather the ' + t('x') + ' terms on one side.', 'Factor out ' + t('x') + ' and divide.'], 'solve for x');
        } },
        { id: 'e17c', level: 'ADV', make: function (r, s) {
          var f = function (x) { return x * Tg.tan(s.A); };
          return near('Determine ' + t('BD') + ' to the nearest tenth. (Check it by substituting into the other expression.)', s.bd, 1, 'cm', early(f, s.x, t('x')).concat([{ v: s.x * Tg.tan(s.C), code: 'ch-wrong-triangle', hint: t('x') + ' goes with the ' + t(dg(s.A)) + ' angle: ' + t('BD=x' + TAN(s.A)) + '.' }, { v: s.x, code: 'ch-one-piece', hint: 'That is ' + t('x=AD') + '. Now use ' + t('BD=x' + TAN(s.A)) + '.' }, radAlt(function (T) { var x = s.ac * T.tan(s.C) / (T.tan(s.A) + T.tan(s.C)); return x * T.tan(s.A); })]),
            t('BD=x' + TAN(s.A) + '=' + v4(s.x) + TAN(s.A) + '=' + v4(s.bd) + '\\approx ' + fx(s.bd, 1)) + ' cm<br>Check: ' + t('DC=' + g1(s.ac) + '-' + v4(s.x) + '=' + v4(s.ac - s.x)) + ', and ' + t(v4(s.ac - s.x) + TAN(s.C) + '=' + v4(s.bd)) + ' ✓',
            ['Find ' + t('x') + ' first (unrounded), then ' + t('BD=x' + TAN(s.A)) + '.'], 'BD from x');
        } },
        { id: 'e17d', level: 'PRG', make: function (r) {
          return mc(r, 'In every earlier question one triangle was solvable and handed a <b>number</b> across. What was handed across here, and why is it still the same method?', [
            { html: 'An <b>expression</b> for the shared side ' + t('BD') + '. Both triangles describe the same segment, so the two expressions can be set equal — the equation does the handing over when neither triangle can go first.', right: true },
            { html: 'Nothing was handed across; this is a completely different method.', why: 'The idea is the same: the shared side links the triangles. Here it is linked through an expression instead of a number.' },
            { html: 'The angle ' + t('\\angle B') + ' was handed across.', why: t('\\angle B') + ' was never used. The shared side ' + t('BD') + ' was written twice, once from each triangle.' },
            { html: 'The whole base ' + t('AC') + ' was handed across, as in earlier questions.', why: t('AC') + ' isn’t a side of either right triangle. What links them is the shared side ' + t('BD') + '.' }],
            'What was handed across was an <b>expression</b> for the shared side: each triangle described ' + t('BD') + ' in terms of what it knew (' + t('x') + ' on one side, ' + t('AC-x') + ' on the other), and because both describe the same segment they can be set equal. Same method: find what the two triangles have in common and make one triangle tell the other about it.',
            ['Each triangle gave an expression for ' + t('BD') + ' in terms of ' + t('x') + '. What do the two expressions both describe?'], 'expression handed across');
        } }] });
    E.push({ num: '18', stem: '<i>(Numerical Response)</i>',
      shared: function (r) {
        return gen(r, function (r) { return { ad: tenth(r, 9.0, 15.0), a: r.int(20, 32), bc: tenth(r, 10.0, 20.0) }; },
          function (p) { var o = { ad: p.ad, a: p.a, bc: p.bc }; o.db = p.ad * Tg.tan(p.a); o.dc = o.db + p.bc; o.ang = Tg.atan(o.dc / p.ad); return o; }, function () { return true; }, { ad: 12.0, a: 26, bc: 16.0 });
      },
      parts: [
        { id: 'e18', level: 'ADV', make: function (r, s) {
          var F = fig({ pts: { D: [0, 0], B: [s.db, 0], C: [s.dc, 0], A: [0, s.ad] }, segs: [['D', 'B'], ['B', 'C', g1(s.bc) + ' m'], ['A', 'D', g1(s.ad) + ' m'], ['A', 'B'], ['A', 'C']], right: [['D', 'B', 'A']], angles: [['A', 'D', 'B', s.a + '°', { r: 34 }]], aria: 'two right triangles sharing AD' });
          var f = function (db) { return Tg.atan((db + s.bc) / s.ad); };
          return near('In the figure, ' + t('AD\\perp DC') + ' with ' + t('B') + ' between ' + t('D') + ' and ' + t('C') + ', ' + t('AD=' + g1(s.ad)) + ' m, ' + t('\\angle DAB=' + dg(s.a)) + ' and ' + t('BC=' + g1(s.bc)) + ' m. To the nearest degree, the measure of ' + t('\\angle DAC') + ' is ________°.' + F, s.ang, 0, '°', early(f, s.db, t('DB')).concat([
            { v: Tg.atan(s.bc / s.ad), code: 'ch-one-piece', hint: t('BC') + ' is only part of the side opposite ' + t('\\angle DAC') + ': ' + t('DC=DB+BC') + '.' },
            { v: Tg.atan(s.bc / s.ad) + s.a, code: 'ch-add-angles', hint: t('\\triangle ABC') + ' has no right angle, so ' + t(fr('BC', 'AD')) + ' is not the tangent of ' + t('\\angle BAC') + '. Find ' + t('DC=DB+BC') + ' and use ' + t('\\triangle ADC') + '.' },
            { v: 90 - s.ang, code: 'ch-complement', hint: 'That is ' + t('\\angle ACD') + '. From ' + t('\\angle DAC') + ', ' + t('DC') + ' is opposite and ' + t('AD') + ' adjacent.' },
            radAlt(function (T) { return T.atan((s.ad * T.tan(s.a) + s.bc) / s.ad); })]),
            t('\\triangle ABD') + ': ' + t('DB=' + g1(s.ad) + TAN(s.a) + '=' + v4(s.db)) + ' m (unrounded)<br>' + t('DC=DB+BC=' + v4(s.db) + '+' + g1(s.bc) + '=' + v4(s.dc)) + ' m<br>' + t('\\triangle ADC') + ': ' + t('\\angle DAC=\\tan^{-1}\\left(' + fr(v4(s.dc), g1(s.ad)) + '\\right)=' + v4(s.ang) + '^\\circ\\approx ' + dg(fx(s.ang, 0))),
            ['Find ' + t('DB') + ' in ' + t('\\triangle ABD') + ', then ' + t('DC=DB+BC') + '.', 'In ' + t('\\triangle ADC') + ', ' + t('DC') + ' is opposite ' + t('\\angle DAC') + ' and ' + t('AD') + ' is adjacent.'], 'NR: ∠DAC', true);
        } }] });
    return E;
  }
})(window);
