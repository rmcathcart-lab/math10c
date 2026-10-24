/* Math 10C · Unit 9 (Trigonometry, M4) — exit slips for Lessons 9.1–9.8 (ids u9l1x … u9l8x, "Exit Slip 9.1" …).
 * One HW.defineExit per lesson: 3–4 short questions (one per box, Beginning → Progressing → Mastery) that check that day's
 * main skills with new wording and contexts, at the difficulty the lesson's assignment rates them. Every part is a
 * generator (numbers, names, orientation and context change per student) with a key, worked solution, hints and typical
 * wrong answers (codes u9x-… plus the shared trigonometry codes). Calculator allowed (as on the Unit 9 test): sides to the
 * nearest tenth and angles to the nearest degree unless a question says otherwise. Lesson 9.8 (review) mixes the unit. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, TR = HW.trig, ex = HW.ex, F = HW.fmt;

  HW.addCodes({
    'u9x-legs-swap': 'Exit 9: gave the other leg (opposite and adjacent mixed up)',
    'u9x-no-scale': 'Exit 9: used the ratio’s numbers without scaling to the given side',
    'u9x-legs-added': 'Exit 9: added the legs to get the hypotenuse',
    'u9x-order': 'Exit 9: order of operations (divided before adding / multiplied before subtracting)',
    'u9x-sight': 'Exit 9: gave the line of sight (hypotenuse) instead of the horizontal distance',
    'u9x-eye-add': 'Exit 9: added the eye height instead of subtracting it',
    'u9x-sum': 'Exit 9: added the two distances instead of subtracting',
    'u9x-diff': 'Exit 9: subtracted the two distances instead of adding',
    'u9x-angle-diff': 'Exit 9: used the difference of the angles in one triangle',
    'u9x-same-angle': 'Exit 9: gave the same angle twice (the acute angles add to 90°)',
    'u9x-not-90': 'Exit 9: the two acute angles don’t add to 90°',
    'u9x-area-half': 'Exit 9: found the other leg as area ÷ leg (forgot the ½ in a triangle’s area)'
  });
  HW.addPartial({
    'u9x-legs-swap': 'b', 'u9x-no-scale': 'b', 'u9x-legs-added': 'n', 'u9x-order': 's', 'u9x-sight': 'n', 'u9x-eye-add': 's',
    'u9x-sum': 'b', 'u9x-diff': 'b', 'u9x-angle-diff': 'n', 'u9x-same-angle': 'n', 'u9x-not-90': 'b', 'u9x-area-half': 'b'
  });

  /* ---------------- small helpers ---------------- */
  var FN = { sin: '\\sin', cos: '\\cos', tan: '\\tan' }, RN = { sin: 'SOH', cos: 'CAH', tan: 'TOA' };
  var RADF = { sin: TR.radSin, cos: TR.radCos, tan: TR.radTan };
  var INV = { sin: TR.asin, cos: TR.acos, tan: TR.atan }, RINV = { sin: Math.asin, cos: Math.acos, tan: Math.atan };
  var ROLE = { opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' };
  var RAD_HINT = 'That is what a calculator in <b>radian</b> mode gives. Switch your calculator to <b>degree</b> mode (DEG) and redo it.';
  var EARLY = 'Very close — but it looks like a value was rounded in the middle. Keep every digit in your calculator and round only the final answer.';
  function rd(x, dp) { return K.roundTo(x, dp); }
  function fx(x, dp) { return rd(x, dp).toFixed(dp); }
  function fxT(x, dp) { return F(fx(x, dp)); }
  function dots(x) { var v = Math.floor(Math.abs(x) * 1e4 + 1e-7) / 1e4; return (x < 0 ? '-' : '') + F(v.toFixed(4)) + '\\ldots'; }
  function dg(d) { return d + '^\\circ'; }
  function ds(d) { return d + '°'; }
  function tenth(r, lo, hi) { return r.int(Math.round(lo * 10), Math.round(hi * 10)) / 10; }
  function safe(x, dp, m) { var s = Math.abs(x) * Math.pow(10, dp), f = s - Math.floor(s); return Math.abs(f - 0.5) > (m == null ? 0.06 : m); }
  function find(gen, test, fb) { for (var i = 0; i < 600; i++) { var v = gen(); if (v && test(v)) return v; } return fb; }
  function ut(u) { return u ? '\\ \\text{' + u + '}' : ''; }
  function roleW(q) { return '<b>' + ROLE[q] + '</b>' + (q === 'hyp' ? '' : ' side'); }
  function ratioFor(a, b) { var s = [a, b].sort().join(); return s === 'hyp,opp' ? 'sin' : s === 'adj,hyp' ? 'cos' : 'tan'; }
  function onTop(f, u) { return u === 'opp' || (f === 'cos' && u === 'adj'); }
  function A(v, code, hint) { return { v: v, code: code, hint: hint }; }
  function an(n) { var s = String(n); return /^8/.test(s) || /^1[18](\D|$)/.test(s) ? 'an' : 'a'; }

  /* unit typed into the box: mark the number (as test mode does for a single box; in a multi-box part a typed unit
     would otherwise come back as "form" and cost a third of the point) */
  function unitWrap(check) {
    return function (resp) {
      var s = String(resp == null ? '' : resp), bare = s.replace(/\\text\{[^}]*\}|\\mathrm\{[^}]*\}/g, '').replace(/\^?\{?\\circ\}?|°|\s*(cm|mm|km|m|in|ft|km\/h|m\/s|units|degrees?)\s*$/gi, '').trim();
      if (bare !== s.trim() && HW.parse.number(bare).ok) return check(bare);
      return check(resp);
    };
  }
  /* the number in a response (a typed unit dropped), or null */
  function bareNum(resp) {
    var s = String(resp == null ? '' : resp), bare = s.replace(/\\text\{[^}]*\}|\\mathrm\{[^}]*\}/g, '').replace(/\^?\{?\\circ\}?|°|\s*(cm|mm|km|m|in|ft|km\/h|m\/s|units|degrees?)\s*$/gi, '').trim(), p = HW.parse.number(bare);
    return p.ok ? p.value : null;
  }
  /* also accept these values (rounded to dp): answers built on an intermediate value rounded to the answer's own place —
     the Unit 9 test's marking guide accepts them ("a second side built from a rounded first side: accept a tenth off";
     "rounding the shared side early can move the answer; accept it"). */
  function alsoWrap(check, also, dp) {
    var acc = (also || []).filter(function (v) { return isFinite(v); }).map(function (v) { return rd(v, dp); });
    if (!acc.length) return check;
    return function (resp) { var v = bareNum(resp); if (v != null && acc.some(function (a) { return Math.abs(v - a) < 1e-9; })) return ok(); return check(resp); };
  }
  function cleanAlts(x, dp, alts) { return (alts || []).filter(function (a) { return isFinite(a.v) && Math.abs(rd(a.v, dp) - rd(x, dp)) > 1e-9; }); }
  function badOf(x, dp, alts) { var seen = {}, out = []; seen[fx(x, dp)] = 1; cleanAlts(x, dp, alts).forEach(function (a) { if (a.v < 0) return; var s = fx(a.v, dp); if (!seen[s]) { seen[s] = 1; out.push(s); } }); return out; }
  /* one rounded answer: o = { unit, alts, diag, before } */
  function nearPart(prompt, x, dp, o, sol, hints, text) {
    o = o || {};
    var alts = cleanAlts(x, dp, o.alts);
    var p = K.P.near(prompt, x, dp, { unit: o.unit, alts: alts, diag: o.diag, before: o.before }, sol, hints, text);
    p.check = alsoWrap(unitWrap(p.check), o.also, dp);
    if (o.unit === '°') p.answer = t(fx(x, dp) + '^\\circ');
    p.bad = badOf(x, dp, alts).filter(function (b) { return p.check(b).v !== 'correct'; });
    return p;
  }
  /* several boxes: b = { name, label, before, after, x, dp, alts, diag } or { check, key, show } */
  function fieldsPart(prompt, boxes, sol, hints, text) {
    var fields = boxes.map(function (b) { return { name: b.name, label: b.label, before: b.before, after: b.after, mode: b.mode, keys: b.keys }; });
    var checks = boxes.map(function (b) { return alsoWrap(b.check || unitWrap(K.near(b.x, b.dp, { alts: cleanAlts(b.x, b.dp, b.alts), diag: b.diag })), b.also, b.dp); });
    var keys = boxes.map(function (b) { return b.key != null ? b.key : fx(b.x, b.dp); });
    var ans = boxes.map(function (b, i) {
      var v = b.show || (b.after === '°' ? t(fx(b.x, b.dp) + '^\\circ') : t(F(keys[i])) + (b.after ? ' ' + b.after : ''));
      return (b.label ? b.label + ' ' : b.before ? b.before + ' ' : '') + v;
    }).join('<br>');
    var p = P.fields(prompt, fields, checks, keys, ans, sol, hints, text);
    p.bad = [];
    boxes.forEach(function (b, i) { (b.bad || (b.x != null ? badOf(b.x, b.dp, b.alts) : [])).slice(0, 2).forEach(function (s) { var k = keys.slice(); k[i] = s; p.bad.push(k); }); });
    p.bad = p.bad.filter(function (k) { return p.check(k).v !== 'correct'; });
    return p;
  }

  /* ---------------- names ---------------- */
  var TRIPLES = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'J'], ['J', 'K', 'L'], ['K', 'L', 'M'], ['L', 'M', 'N'], ['P', 'Q', 'R'], ['R', 'S', 'T'], ['S', 'T', 'U'], ['U', 'V', 'W'], ['X', 'Y', 'Z']];
  /* ang = vertex of the given acute angle, rt = right angle, oth = the other acute vertex */
  function names3(r) { var s = r.pick(TRIPLES), p = r.shuffle(s.slice()); return { tri: s.join(''), ang: p[0], rt: p[1], oth: p[2] }; }
  function seg(a, b) { return a < b ? a + b : b + a; }
  function sideOf(n, role) { return role === 'opp' ? seg(n.rt, n.oth) : role === 'adj' ? seg(n.ang, n.rt) : seg(n.ang, n.oth); }

  /* ---------------- figures ---------------- */
  function fig(spec) { return '<div class="fig">' + HW.fig(spec) + '</div>'; }
  var GREY = '#6a7182';
  function vis(a, lo, hi) { return Math.min(Math.max(a, lo || 20), hi || 62); } // drawing angle (figures not to scale)
  /* right triangle with the marked angle `deg` (drawn to shape); lab = { opp, adj, hyp } relative to that angle;
     n = names3 object (vertex letters) or null; opt = { at: 'A'|'B', noAngle, angLabel, rot, flip, width } */
  function triFig(r, deg, lab, n, opt) {
    opt = opt || {};
    var at = opt.at || r.pick(['A', 'B']), tn = Math.tan(vis(deg, 14, 76) * Math.PI / 180), w, h;
    if (at === 'A') { w = 4; h = 4 * tn; } else { h = 4; w = 4 * tn; }
    var m = Math.max(w, h); w = w * 4 / m; h = h * 4 / m;
    var nm = n ? (at === 'A' ? [n.ang, n.oth, n.rt] : [n.oth, n.ang, n.rt]) : (at === 'A' ? ['P', 'Q', 'R'] : ['Q', 'P', 'R']);
    var sides = {}; lab = lab || {};
    if (at === 'A') { sides.a = lab.opp; sides.b = lab.adj; } else { sides.b = lab.opp; sides.a = lab.adj; }
    sides.c = lab.hyp;
    var angles = {}; if (!opt.noAngle) angles[at] = opt.angLabel || ds(deg);
    return '<div class="fig">' + HW.tri({ w: w, h: h, names: nm, sides: sides, angles: angles, rot: opt.rot != null ? opt.rot : r.int(0, 3), flip: opt.flip != null ? opt.flip : r.chance(0.5), hideNames: !n, width: opt.width || 250, aria: 'right triangle' }) + '</div>';
  }
  /* a slope on level ground: G = ground end (the angle), F = foot of the vertical, T = top.
     o = { deg, labH, labV, labS, obj: 'ladder' | 'ramp' | 'kite' | 'tree' | 'pole' | 'none', flip, angAtTop } */
  function slopeFig(o) {
    var W = 4, H = W * Math.tan(vis(o.deg, 20, 72) * Math.PI / 180), s = o.flip ? -1 : 1;
    var pts = { G: [s * W, 0], F: [0, 0], T: [0, H] };
    var segs = [['G', 'F', o.labH], ['G', 'T', o.labS, { width: o.obj === 'ladder' ? 3.4 : o.obj === 'kite' ? 1.5 : 2.2 }]];
    var extra = [{ type: 'ground', y: 0, x0: Math.min(0, s * W) - 0.6, x1: Math.max(0, s * W) + 0.6 }];
    if (o.obj === 'ladder') { segs.push(['F', 'T', o.labV, { width: 1.4, side: -1 }]); extra.push({ type: 'building', at: [-s * 0.2, 0], w: 0.4, h: H * 1.12 }); }
    else if (o.obj === 'tree') { segs.push(['F', 'T', null, { dash: 1, width: 1.2, color: GREY }]); extra.push({ type: 'tree', at: [0, 0], h: H }); if (o.labV) extra.push({ type: 'text', at: [-s * (0.22 * H + 0.55), H * 0.45], text: o.labV }); }
    else if (o.obj === 'pole') segs.push(['F', 'T', o.labV, { width: 3.4 }]);
    else segs.push(['F', 'T', o.labV, { dash: o.obj === 'kite' || o.obj === 'none' ? 1 : 0, width: o.obj === 'ramp' ? 2.2 : 1.4 }]);
    if (o.obj === 'kite') { var k = 0.22 * Math.max(H, 2.4); pts.k1 = [-0.45 * k, H + 0.55 * k]; pts.k2 = [0, H + 1.4 * k]; pts.k3 = [0.45 * k, H + 0.55 * k]; segs.push(['T', 'k1', { width: 1.4 }], ['k1', 'k2', { width: 1.4 }], ['k2', 'k3', { width: 1.4 }], ['k3', 'T', { width: 1.4 }]); }
    var spec = { pts: pts, names: false, segs: segs.map(function (q) { return q[2] == null || q[2] === '' ? [q[0], q[1], q[3]].filter(function (z) { return z != null; }) : q; }), right: [['F', 'G', 'T']],
      angles: o.angAtTop ? [['T', 'F', 'G', o.angLab || ds(o.deg)]] : [['G', 'F', 'T', o.angLab || ds(o.deg)]], extra: extra.concat(o.extra || []), width: o.width || 260, aria: o.aria || 'right triangle on level ground' };
    if (o.obj === 'kite') spec.fill = [['T', 'k1', 'k2', 'k3']];
    return fig(spec);
  }
  /* angle of depression from E (height h above G) down to S on the ground. o = { th, hLab, runLab, sightLab, obj: 'tower' | 'cliff' | 'drone', label } */
  function deprFig(o) {
    var W = 10, h = W * Math.tan(vis(o.th, 24) * Math.PI / 180), wall = o.obj === 'cliff';
    var pts = { E: [0, h], G: [0, 0], S: [W, 0], H: [W, h] };
    var segs = [['G', 'E', o.hLab, o.obj === 'drone' ? { dash: 1, width: 1.3, color: GREY } : { width: wall ? 1.4 : 3, side: wall ? -1 : 1 }], ['G', 'S', o.runLab], ['E', 'S', o.sightLab], ['E', 'H', { dash: 1, width: 1.4, color: GREY }]];
    var extra = [{ type: 'ground', y: 0, x0: -3, x1: W + 1.5 }];
    if (wall) extra.push({ type: 'building', at: [-1.4, 0], w: 2.8, h: h });
    if (o.obj === 'drone') extra.push({ type: 'text', at: [0, h + 1.1], text: o.top || 'drone' }, { type: 'eye', at: [0, h] });
    if (o.label) extra.push({ type: 'text', at: [W, -0.9], text: o.label });
    return fig({ pts: pts, segs: segs.map(function (q) { return q[2] == null ? [q[0], q[1], q[3]] : q; }), right: [['G', 'E', 'S']], angles: [['E', 'H', 'S', o.angLab || ds(o.th), { r: 30 }]], names: false, extra: extra, width: o.width || 330, aria: 'angle of depression' });
  }
  /* observer on level ground, angle of elevation measured from eye level (from u9l6) */
  function eyeScene(o) {
    var W = 10, rise = W * Math.tan(vis(o.th) * Math.PI / 180), e = Math.min(Math.max(rise * 0.2, 1.3), 2.4), top = e + rise;
    var pts = { F: [0, 0], E: [0, e], G: [W, 0], H: [W, e], Q: [W, top], d1: [-1, 0], d2: [-1, e] };
    var segs = [['E', 'Q'], ['F', 'G', o.runLab], ['d1', 'd2', o.eyeLab, { width: 1.2, color: GREY }], ['E', 'H', { dash: 1, width: 1.4, color: GREY }]];
    var extra = [{ type: 'ground', y: 0, x0: -1.8, x1: W + 2.6 }, { type: 'person', at: [0, 0], h: e * 1.1 }, { type: 'eye', at: [0, e] }];
    if (o.obj === 'tree') { extra.push({ type: 'tree', at: [W, 0], h: top }, { type: 'text', at: [W + 0.22 * top + 0.4 + String(o.topLab).length * 0.18, top * 0.55], text: o.topLab }); segs.push(['G', 'Q', null, { dash: 1, width: 1.2, color: GREY }]); }
    else if (o.obj === 'pole') segs.push(['G', 'Q', o.topLab, { width: 3.2 }]);
    else { extra.push({ type: 'building', at: [W + 1.2, 0], w: 2.4, h: top }); segs.push(['G', 'Q', o.topLab, { width: 1.4 }]); }
    return fig({ pts: pts, segs: segs.map(function (q) { return q[2] == null ? [q[0], q[1], q[3]].filter(function (z) { return z != null; }) : q; }), right: [['H', 'E', 'Q']], angles: [['E', 'H', 'Q', ds(o.th)]], names: false, extra: extra, width: o.width || 300, aria: 'angle of elevation from eye level' });
  }

  /* ---------------- one side from one side and one acute angle (from u9l3) ----------------
   * o = { deg, k, kStr, kRole, uRole, kName (tex, optional), uName (tex), unit, dp, angTex } */
  function solveSide(o) {
    var f = ratioFor(o.kRole, o.uRole), top = onTop(f, o.uRole), d = o.deg, fv = TR[f](d);
    var x = top ? o.k * fv : o.k / fv, D = dg(d), Fd = FN[f] + ' ' + D, u = o.uName, kv = o.kStr, dp = o.dp;
    var kDesc = o.kName ? t(o.kName + '=' + kv) : 'the ' + t(kv + ut(o.unit)) + ' side';
    var angW = o.angTex ? t(o.angTex) : t(D);
    var flip = top ? o.k / fv : o.k * fv, sense = '';
    if (o.uRole === 'hyp' && flip <= o.k) sense = ' (Notice your answer is shorter than the leg ' + t(kv) + ' — impossible for a hypotenuse.)';
    if (o.uRole !== 'hyp' && o.kRole === 'hyp' && flip >= o.k) sense = ' (Notice your answer is longer than the hypotenuse ' + t(kv) + ' — impossible for a leg.)';
    var auto = [A(flip, 'mult-div', top
      ? 'You divided by ' + t(Fd) + '. Relative to ' + angW + ', ' + t(u) + ' is the ' + roleW(o.uRole) + ', which sits on <b>top</b> of ' + t(FN[f]) + '. An unknown on top is freed by <b>multiplying</b> by the known side.' + sense
      : 'You multiplied by ' + t(Fd) + '. But ' + t(u) + ' is the ' + roleW(o.uRole) + ', which sits in the <b>denominator</b> of ' + t(FN[f]) + '. Cross-multiply, then <b>divide</b> the known side by ' + t(Fd) + '.' + sense)];
    ['sin', 'cos', 'tan'].forEach(function (g) {
      if (g === f) return; var gv = TR[g](d);
      auto.push(A(top ? o.k * gv : o.k / gv, 'wrong-ratio', 'That answer uses ' + t(FN[g] + ' ' + D) + '. Relative to ' + angW + ', ' + kDesc + ' is the ' + roleW(o.kRole) + ' and ' + t(u) + ' is the ' + roleW(o.uRole) + '. Which of SOH, CAH, TOA holds those two sides?'));
    });
    var rv = RADF[f](d); auto.push(A(top ? o.k * rv : o.k / rv, 'radian', RAD_HINT));
    var lines = top
      ? [Fd + '=\\dfrac{' + u + '}{' + kv + '}', u + '=' + kv + FN[f] + ' ' + D + '=' + dots(x) + '\\approx ' + fxT(x, dp) + ut(o.unit)]
      : [Fd + '=\\dfrac{' + kv + '}{' + u + '}', u + '\\,' + FN[f] + ' ' + D + '=' + kv, u + '=\\dfrac{' + kv + '}{' + Fd + '}=' + dots(x) + '\\approx ' + fxT(x, dp) + ut(o.unit)];
    var sol = 'Relative to ' + angW + ': ' + kDesc + ' is the ' + roleW(o.kRole) + ' and ' + t(u) + ' is the ' + roleW(o.uRole) + ' ' + t('\\Rightarrow') + ' <b>' + RN[f] + '</b>, with the unknown ' + (top ? 'on <b>top</b> (multiply).' : '<b>underneath</b> (cross-multiply, then divide).') + '<br>' + lines.map(t).join('<br>');
    var diag = function (v) {
      if (o.uRole === 'hyp' && v <= o.k) return { code: 'hyp-short', hint: 'The hypotenuse is the longest side, so ' + t(u) + ' must be longer than ' + t(kv) + '. Check the ratio and whether to multiply or divide.' };
      if (o.kRole === 'hyp' && v >= o.k) return { code: 'leg-long', hint: t(u) + ' is a leg, so it must be shorter than the hypotenuse ' + t(kv) + '. Check the ratio and whether to multiply or divide.' };
      return null;
    };
    var hints = ['Name the sides relative to ' + angW + ': which side is opposite it, which is adjacent to it, and which is the hypotenuse?',
      'Choose the ratio that holds ' + kDesc + ' and ' + t(u) + '. Is ' + t(u) + ' on top of the ratio (multiply) or underneath (divide)?'];
    return { x: x, f: f, top: top, alts: auto, sol: sol, diag: diag, hints: hints, Fd: Fd };
  }
  function sidePart(o) {
    var s = solveSide(o);
    return nearPart(o.prompt, s.x, o.dp, { unit: o.unit, alts: (o.alts || []).concat(s.alts), diag: s.diag }, (o.solPre || '') + s.sol + (o.solPost || ''), o.hints || s.hints, o.text);
  }
  /* Pythagorean theorem: o = { find: 'hyp'|'leg', a, b (legs) | c, b (hyp, leg), aStr, bStr, cStr, uName, unit, dp, prompt } */
  function pythCalc(o) {
    var x, alts, sol, dp = o.dp, u = o.uName;
    function pl(v) { return fx(v, 4).replace(/\.?0+$/, ''); }
    if (o.find === 'hyp') {
      var s2 = o.a * o.a + o.b * o.b; x = Math.sqrt(s2);
      alts = [A(Math.sqrt(Math.abs(o.a * o.a - o.b * o.b)), 'pyth-sub', t(u) + ' is across from the right angle — it is the <b>hypotenuse</b>, so <b>add</b> the squares of the two legs.'),
        A(o.a + o.b, 'pyth-nosq', 'Square each leg first, add the squares, and then take the square root.'), A(s2, 'no-root', 'That is ' + t(u + '^2') + '. Take the square root to get ' + t(u) + '.')];
      sol = 'Two sides are known and no acute angle ' + t('\\Rightarrow') + ' <b>Pythagorean theorem</b>; ' + t(u) + ' is the hypotenuse.<br>' +
        t(u + '=\\sqrt{' + o.aStr + '^2+' + o.bStr + '^2}=\\sqrt{' + pl(o.a * o.a) + '+' + pl(o.b * o.b) + '}=\\sqrt{' + pl(s2) + '}=' + dots(x) + '\\approx ' + fxT(x, dp) + ut(o.unit));
    } else {
      var d2 = o.c * o.c - o.b * o.b; x = Math.sqrt(d2);
      alts = [A(Math.sqrt(o.c * o.c + o.b * o.b), 'pyth-add', t(u) + ' is a <b>leg</b>; the hypotenuse is ' + t(o.cStr) + '. Subtract: ' + t(u + '^2=' + o.cStr + '^2-' + o.bStr + '^2') + '.'),
        A(o.c - o.b, 'pyth-nosq', 'Square the sides first, subtract the squares, and then take the square root.'), A(d2, 'no-root', 'That is ' + t(u + '^2') + '. Take the square root to get ' + t(u) + '.')];
      sol = 'A leg and the hypotenuse are known, with no acute angle ' + t('\\Rightarrow') + ' <b>Pythagorean theorem</b>.<br>' +
        t(u + '=\\sqrt{' + o.cStr + '^2-' + o.bStr + '^2}=\\sqrt{' + pl(o.c * o.c) + '-' + pl(o.b * o.b) + '}=\\sqrt{' + pl(d2) + '}=' + dots(x) + '\\approx ' + fxT(x, dp) + ut(o.unit));
    }
    var diag = function (v) {
      if (o.find === 'leg' && v >= o.c) return { code: 'leg-long', hint: t(u) + ' is a leg, so it must be shorter than the hypotenuse ' + t(o.cStr) + '.' };
      if (o.find === 'hyp' && v <= Math.max(o.a, o.b)) return { code: 'hyp-short', hint: 'The hypotenuse must be longer than both legs.' };
      return null;
    };
    return { x: x, alts: alts, sol: sol, diag: diag, hints: ['Two sides and no acute angle: use ' + t('c^2=a^2+b^2') + ', where ' + t('c') + ' is the side across from the right angle.', o.find === 'hyp' ? 'Is ' + t(u) + ' the hypotenuse or a leg? Add the squares for the hypotenuse.' : 'Is ' + t(u) + ' the hypotenuse or a leg? For a leg, subtract the squares.'] };
  }

  /* ---------------- an angle from two sides (from u9l4) ---------------- */
  var KIND = { oh: { f: 'sin', n: 'SOH', a: 'opposite', b: 'the hypotenuse' }, ah: { f: 'cos', n: 'CAH', a: 'adjacent', b: 'the hypotenuse' }, oa: { f: 'tan', n: 'TOA', a: 'opposite', b: 'adjacent' } };
  function angAlts(kind, n, d, angTex, nS, dS, dp) {
    var f = KIND[kind].f, v = n / d, c = INV[f](v), out = [];
    if (kind === 'oa') {
      out.push(A(TR.atan(d / n), 'ratio-flip', 'Your ratio is upside down, which gives the <b>other</b> acute angle. ' + t('\\tan=\\frac{\\text{opp}}{\\text{adj}}') + ': from ' + t(angTex) + ', which known side is <b>across</b> from the angle?'));
      ['sin', 'cos'].forEach(function (g) { [v, 1 / v].forEach(function (q) { if (q < 1) out.push(A(INV[g](q), 'wrong-ratio', t(FN[g] + '^{-1}') + ' needs the <b>hypotenuse</b>, but neither ' + t(nS) + ' nor ' + t(dS) + ' faces the right angle — they are the two legs. Two legs means TOA.')); }); });
    } else {
      var g = f === 'sin' ? 'cos' : 'sin';
      out.push(A(INV[g](v), 'wrong-ratio', 'That is the <b>other</b> acute angle: you used ' + t(FN[g] + '^{-1}') + '. From ' + t(angTex) + ', is ' + t(nS) + ' opposite (across from the angle) or adjacent (touching it)?'));
      out.push(A(TR.atan(v), 'tan-hyp', t('\\tan^{-1}') + ' pairs the two legs, but ' + t(dS) + ' is the <b>hypotenuse</b> (it faces the right angle). Opposite or adjacent with the hypotenuse is SOH or CAH.'));
    }
    out.push(A(RINV[f](v), 'radian', 'Your calculator seems to be in <b>radian</b> mode. Switch it to <b>degree</b> mode and try again.'));
    out.push(A(1 / TR[f](v), 'reciprocal', t(FN[f] + '^{-1}') + ' means “the angle whose ' + f + ' is …”, not ' + t('\\frac{1}{' + FN[f] + '}') + '. Use the inverse key (2nd&nbsp;' + f + ').'));
    if (dp >= 1) out.push(A(INV[f](rd(v, 2)), 'early-round', 'Close, but you rounded the ratio before using ' + t(FN[f] + '^{-1}') + '. Keep every digit of ' + t(nS + '\\div ' + dS) + ' (or type the fraction straight in).'));
    out.push(A(90 - c, 'other-angle', 'That is the other acute angle of the triangle. Name the sides from the angle you were asked for.'));
    return out;
  }
  function angSol(kind, n, d, nS, dS, arg, ang, x, dp, pre) {
    var k = KIND[kind], f = k.f, v = n / d;
    return (pre || '') + 'From ' + t(ang) + ': ' + t(nS) + ' is ' + k.a + ', ' + t(dS) + ' is ' + k.b + ' ' + t('\\Rightarrow') + ' <b>' + k.n + '</b>.<br>' +
      t(FN[f] + ' ' + arg + '=\\dfrac{' + nS + '}{' + dS + '}=' + dots(v)) + '<br>' + t(ang + '=' + FN[f] + '^{-1}\\left(\\dfrac{' + nS + '}{' + dS + '}\\right)=' + dots(x) + '^{\\circ}\\approx ' + fx(x, dp) + '^{\\circ}');
  }
  var ANGHINTS = ['Name the two known sides from the angle: opposite (across from it), adjacent (touching it, not the hypotenuse) or hypotenuse (facing the right angle).',
    'Opposite + hypotenuse ' + t('\\to\\sin^{-1}') + ', adjacent + hypotenuse ' + t('\\to\\cos^{-1}') + ', opposite + adjacent ' + t('\\to\\tan^{-1}') + '. Calculator in degree mode.'];
  function angCalc(kind, n, d) { return INV[KIND[kind].f](n / d); }

  /* ================= Lesson 9.1: exact ratios (u9l1 helpers) ================= */
  var LETS = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'J'], ['J', 'K', 'L'], ['K', 'L', 'M'], ['L', 'M', 'N'], ['M', 'N', 'P'], ['P', 'Q', 'R'], ['Q', 'R', 'S'], ['R', 'S', 'T'], ['S', 'T', 'U'], ['U', 'V', 'W'], ['X', 'Y', 'Z']];
  function sn(p, q) { return [p, q].sort().join(''); }
  function cl(x) { return Number(x.toFixed(6)); }
  function nf(x) { return F(cl(x)); }
  function nd(x) { var s = String(cl(x)), i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
  function frc(p, q) { var d = Math.max(nd(p), nd(q)), s = Math.pow(10, d); return ex.norm(Math.round(p * s), Math.round(q * s)); }
  function fT(p, q) { return ex.texRat(frc(p, q)); }
  function uT(p, q) { return '\\frac{' + nf(p) + '}{' + nf(q) + '}'; }
  function steps(p, q) { var out = uT(p, q), d = Math.max(nd(p), nd(q)), s = Math.pow(10, d); if (d) out += '=\\frac{' + Math.round(p * s) + '}{' + Math.round(q * s) + '}'; var f = frc(p, q); if (f[0] !== Math.round(p * s) || f[1] !== Math.round(q * s)) out += '=' + ex.texRat(f); return out; }
  /* A = reference angle, B = other acute angle, R = right angle; o, a, h = opposite, adjacent, hypotenuse of A */
  function tri(nm, o, a, h) { return { A: nm.A, B: nm.B, R: nm.R, o: o, a: a, h: h, opp: sn(nm.B, nm.R), adj: sn(nm.A, nm.R), hyp: sn(nm.A, nm.B) }; }
  function anyNames(r) { var s = r.shuffle(r.pick(LETS)); return { A: s[0], B: s[1], R: s[2] }; }
  function fromTriple(r, nm, tr, k) { k = k || 1; var x = cl(tr[0] * k), y = cl(tr[1] * k), h = cl(tr[2] * k); return r.chance(0.5) ? tri(nm, x, y, h) : tri(nm, y, x, h); }
  function xf(raw, rot, flip) { var c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180), out = {}; Object.keys(raw).forEach(function (k) { var x = raw[k][0], y = raw[k][1]; if (flip) x = -x; out[k] = [x * c - y * s, x * s + y * c]; }); return out; }
  function ori(r, tilt) { return { rot: r.pick([0, 90, 180, 270]) + (tilt ? r.pick([-27, -17, 17, 27]) : 0), flip: r.chance(0.5) }; }
  function triFigT(T, o) {
    o = o || {};
    var q = Math.max(0.38, Math.min(2.6, T.o / T.a)), W = q >= 1 ? 4 / q : 4, H = W * q, raw = {};
    raw[T.R] = [0, 0]; raw[T.A] = [W, 0]; raw[T.B] = [0, H];
    var lab = o.lab || {}, segs = [[T.B, T.R, lab.o], [T.A, T.R, lab.a], [T.A, T.B, lab.h]].map(function (s) { return s[2] == null ? [s[0], s[1]] : [s[0], s[1], String(s[2])]; });
    var angs = o.angA ? [[T.A, T.B, T.R, o.angA]] : [];
    return '<div class="fig" style="text-align:center;margin:6px 0">' + HW.fig({ pts: xf(raw, o.rot || 0, o.flip), segs: segs, right: [[T.R, T.A, T.B]], angles: angs, names: true, width: o.width || 250, aria: 'right triangle' }) + '</div>';
  }
  var FUN = { sin: 'oh', cos: 'ah', tan: 'oa' }, OTHER = { sin: 'ah', cos: 'oh', tan: 'ao' };
  var RULE = { sin: '\\sin=\\frac{\\text{opp}}{\\text{hyp}}', cos: '\\cos=\\frac{\\text{adj}}{\\text{hyp}}', tan: '\\tan=\\frac{\\text{opp}}{\\text{adj}}' };
  var IDS = ['oh', 'ah', 'oa', 'ao', 'ho', 'ha'];
  function pair(T, id) { var m = { o: T.o, a: T.a, h: T.h }; return [m[id[0]], m[id[1]]]; }
  function rv(T, id) { var p = pair(T, id); return p[0] / p[1]; }
  function whichId(T, v, approx) { if (!isFinite(v)) return null; for (var i = 0; i < IDS.length; i++) if (Math.abs(v - rv(T, IDS[i])) < (approx ? 0.006 : 1e-9) * Math.max(1, Math.abs(v))) return IDS[i]; return null; }
  function rdiag(f, g, show, ang) {
    if (!g || g === FUN[f]) return null;
    if (f === 'sin' || f === 'cos') {
      if (g === OTHER[f]) return { code: 'sin-cos-swap', hint: t(show(g)) + ' is ' + (f === 'sin' ? 'adj over hyp — that’s the <b>cosine</b>. Sine is <b>opp</b> over hyp (SOH): the opposite side does not touch ' + t(ang) : 'opp over hyp — that’s the <b>sine</b>. Cosine is <b>adj</b> over hyp (CAH): the adjacent side touches ' + t(ang) + ' and isn’t the hypotenuse') + '.' };
      if (g === 'oa' || g === 'ao') return { code: 'hyp-wrong', hint: 'The bottom of a ' + (f === 'sin' ? 'sine' : 'cosine') + ' is the <b>hypotenuse</b> — the side across from the right angle (the longest side). ' + t(show(g)) + ' uses the two legs.' };
      return { code: 'ratio-flip', hint: 'Upside down: the hypotenuse goes on the <b>bottom</b>. The sine and cosine of an acute angle are always less than ' + t('1') + '.' };
    }
    if (g === 'ao') return { code: 'ratio-flip', hint: 'Upside down: tangent is <b>opp</b> over adj (TOA). The opposite side — across from ' + t(ang) + ', not touching it — goes on top.' };
    return { code: 'tan-hyp', hint: 'Tangent never uses the hypotenuse: TOA is <b>opposite over adjacent</b>, the two legs.' };
  }
  function fracChk(target, opt) {
    var c = K.fraction(target, opt);
    return function (resp) {
      var res = c(resp);
      if (res.v === 'form' && res.code === 'decimal' && /\\frac|\//.test(String(resp))) return form('decimal', 'Right value — now clear the decimals (multiply the top and bottom by ' + t('10') + ') and reduce to lowest terms.');
      return res;
    };
  }
  /* several fraction boxes funcs ⊂ ['sin','cos','tan'] for the angle ang of T; extra(f, value) -> {code, hint} */
  function ratioCheck(T, funcs, ang, extra) {
    var checks = funcs.map(function (f) { return fracChk(frc.apply(null, pair(T, FUN[f]))); });
    var show = function (id) { var p = pair(T, id); return uT(p[0], p[1]); };
    return function (resp) {
      resp = resp || []; var res = [], got = [], vals = [];
      funcs.forEach(function (f, i) { var s = resp[i] == null ? '' : String(resp[i]); res[i] = checks[i](s); var a = K.read(s); vals[i] = a.res ? NaN : a.val; got[i] = a.res ? null : whichId(T, a.val, ex.shape(a.ast).decimals > 0); });
      var lab = function (i) { return '<b>' + t(FN[funcs[i]] + ' ' + ang) + ':</b> '; };
      if (res.every(function (x) { return x.v === 'correct'; })) return ok();
      for (var e = 0; e < funcs.length; e++) if (res[e].v === 'form' && res[e].code === 'empty') return form('empty', 'Fill in every box — ' + lab(e) + 'is still empty.');
      if (funcs.length > 1 && funcs.every(function (f, i) { return got[i] === OTHER[f]; })) return wrong('opp-adj-swap', 'All of your ratios belong to the <b>other</b> acute angle, ' + t('\\angle ' + T.B) + '. Relative to ' + t(ang) + ', the <b>opposite</b> side does not touch ' + t(ang) + '; the <b>adjacent</b> side touches it (and isn’t the hypotenuse).');
      var is = funcs.indexOf('sin'), ic = funcs.indexOf('cos');
      if (is >= 0 && ic >= 0 && got[is] === 'ah' && got[ic] === 'oh') return wrong('sin-cos-swap', 'Your sine and cosine are swapped. SOH: sine is <b>opp</b> over hyp. CAH: cosine is <b>adj</b> over hyp.');
      for (var i = 0; i < funcs.length; i++) if (res[i].v === 'wrong') {
        var d = extra ? extra(funcs[i], vals[i]) : null; if (!d) d = rdiag(funcs[i], got[i], show, ang);
        return wrong(d ? d.code : res[i].code, lab(i) + (d ? d.hint : res[i].hint || 'Not yet. Name opp, adj and hyp relative to ' + t(ang) + ' first, then use ' + t(RULE[funcs[i]]) + '.'));
      }
      for (var j = 0; j < funcs.length; j++) if (res[j].v === 'form') return { v: 'form', code: res[j].code, hint: lab(j) + res[j].hint };
      return wrong('value', null);
    };
  }
  function ratioKeys(T, funcs) { return funcs.map(function (f) { var p = pair(T, FUN[f]); return fT(p[0], p[1]); }); }
  function ratiosPart(T, funcs, ang, prompt, o) {
    o = o || {};
    var keys = ratioKeys(T, funcs);
    var sw = funcs.map(function (f) { var p = pair(T, OTHER[f]); return fT(p[0], p[1]); }), fl = funcs.map(function (f) { var p = pair(T, FUN[f]); return fT(p[1], p[0]); });
    return { prompt: prompt, input: { type: 'fields', fields: funcs.map(function (f) { return { name: FN[f], before: t(FN[f] + ' ' + ang + '='), mode: 'math', keys: 'fraction' }; }) },
      check: ratioCheck(T, funcs, ang, o.extra), key: keys, answer: funcs.map(function (f, i) { return t(FN[f] + ' ' + ang + '=' + keys[i]); }).join(', '),
      solution: o.sol, text: o.text, hints: o.hints, bad: [sw, fl].concat(o.bad || []) };
  }
  var PRIM = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41], [28, 45, 53], [11, 60, 61], [33, 56, 65], [16, 63, 65], [48, 55, 73]];
  /* scaled or decimal triples (not in lowest terms), so the ratios must be reduced */
  var SCALED = [[6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25], [10, 24, 26], [15, 36, 39], [16, 30, 34], [14, 48, 50], [18, 24, 30], [21, 28, 35], [20, 48, 52], [24, 45, 51], [24, 70, 74],
    [1.5, 2, 2.5], [2.4, 3.2, 4], [0.9, 1.2, 1.5], [3.5, 12, 12.5], [4.5, 6, 7.5], [2.5, 6, 6.5], [1.6, 3, 3.4]];

  /* ---------- 9.1 Q3: from sin (or cos) and the hypotenuse to the sides ---------- */
  function q13Part(r) {
    var tr = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]]);
    var k = tr[2] <= 5 ? r.int(2, 9) : tr[2] <= 17 ? r.int(2, 6) : r.int(2, 3);
    var L = r.pick(LETS), nm = { A: L[0], B: L[1], R: L[2] }, T = fromTriple(r, nm, tr, k), useSin = r.chance(0.5), unit = r.pick(['cm', 'm', 'mm']);
    var o0 = T.o / k, a0 = T.a / k, h0 = T.h / k; // the primitive ratio numbers
    var given = useSin ? '\\sin ' + T.A + '=\\frac{' + o0 + '}{' + h0 + '}' : '\\cos ' + T.A + '=\\frac{' + a0 + '}{' + h0 + '}';
    var BC = T.opp, AC = T.adj, AB = T.hyp, tB = frc(T.a, T.o);
    var sideCk = function (want, other, prim, nameW) {
      return unitWrap(K.number(want, function (v) {
        if (v === other) return { code: 'u9x-legs-swap', hint: 'That is the length of the <b>other</b> leg. ' + t(nameW) + ' is ' + (want === T.o ? 'across from' : 'next to') + ' ' + t('\\angle ' + T.A) + ', so it is the ' + (want === T.o ? 'opposite' : 'adjacent') + ' side.' };
        if (v === prim) return { code: 'u9x-no-scale', hint: 'The ratio ' + t(given) + ' gives the <b>shape</b>, not the size. The hypotenuse is ' + t(F(T.h)) + ', which is ' + t(k) + ' times ' + t(h0) + ', so every side is ' + t(k) + ' times its number in the ratio.' };
        return null;
      }));
    };
    var tanCk = fracChk(tB, { diag: function (v) {
      if (Math.abs(v - T.o / T.a) < 1e-9) return { code: 'other-angle', hint: 'That is ' + t('\\tan ' + T.A) + '. Relative to ' + t('\\angle ' + T.B) + ', the opposite side is ' + t(AC) + ' (it doesn’t touch ' + t(T.B) + ') and the adjacent side is ' + t(BC) + '.' };
      if (Math.abs(v - T.a / T.h) < 1e-9 || Math.abs(v - T.o / T.h) < 1e-9) return { code: 'tan-hyp', hint: 'Tangent never uses the hypotenuse: TOA is <b>opposite over adjacent</b>, the two legs.' };
      return null;
    } });
    var prompt = 'In ' + t('\\triangle ' + L.join('')) + ', ' + t('\\angle ' + T.R + '=90^\\circ') + ', ' + t(given) + ' and the hypotenuse ' + t(AB + '=' + F(T.h) + '\\text{ ' + unit + '}') + '. Determine the lengths of ' + t(BC) + ' and ' + t(AC) + ', and ' + t('\\tan ' + T.B) + ' as a fraction in simplest form.';
    var p = P.fields(prompt, [{ name: BC, before: t(BC + '='), after: unit }, { name: AC, before: t(AC + '='), after: unit }, { name: 'tan ' + T.B, before: t('\\tan ' + T.B + '='), mode: 'math', keys: 'fraction' }],
      [sideCk(T.o, T.a, o0, BC), sideCk(T.a, T.o, a0, AC), tanCk], [String(T.o), String(T.a), ex.texRat(tB)],
      t(BC + '=' + F(T.o)) + ' ' + unit + ', ' + t(AC + '=' + F(T.a)) + ' ' + unit + ', ' + t('\\tan ' + T.B + '=' + ex.texRat(tB)),
      'Sketch the triangle: the hypotenuse ' + t(AB) + ' is across from the right angle at ' + t(T.R) + '. Relative to ' + t('\\angle ' + T.A) + ', ' + t(BC) + ' is opposite and ' + t(AC) + ' is adjacent.<br>' +
        t(given) + ' and ' + t(AB + '=' + F(T.h) + '=' + k + '\\times ' + h0) + ', so every side is ' + t(k) + ' times its number in the ratio:<br>' +
        (useSin ? t(BC + '=' + k + '\\times ' + o0 + '=' + F(T.o)) + ' ' + unit + ', and by the Pythagorean theorem ' + t(AC + '=\\sqrt{' + F(T.h) + '^2-' + F(T.o) + '^2}=' + F(T.a)) + ' ' + unit + '.'
          : t(AC + '=' + k + '\\times ' + a0 + '=' + F(T.a)) + ' ' + unit + ', and by the Pythagorean theorem ' + t(BC + '=\\sqrt{' + F(T.h) + '^2-' + F(T.a) + '^2}=' + F(T.o)) + ' ' + unit + '.') +
        '<br>Relative to ' + t('\\angle ' + T.B) + ': opp ' + t('=' + AC) + ', adj ' + t('=' + BC) + ', so ' + t('\\tan ' + T.B + '=\\frac{' + F(T.a) + '}{' + F(T.o) + '}=' + ex.texRat(tB)) + '.',
      ['The ratio gives the shape: ' + t(given) + ' means the ' + (useSin ? 'opposite side and hypotenuse' : 'adjacent side and hypotenuse') + ' are in the ratio ' + t((useSin ? o0 : a0) + ':' + h0) + '. How many times bigger is the real hypotenuse?', 'Find the third side with the Pythagorean theorem, then name opp and adj from ' + t('\\angle ' + T.B) + ' (not ' + t('\\angle ' + T.A) + ').'],
      'sides from ' + given + ', hyp ' + T.h);
    p.bad = [[String(T.a), String(T.o), ex.texRat(tB)], [String(o0), String(a0), ex.texRat(tB)], [String(T.o), String(T.a), ex.texRat(frc(T.o, T.a))]];
    return p;
  }

  /* ================= Lesson 9.2: calculator values and patterns ================= */
  function calcBox(f, deg, label) {
    var x = TR[f](deg), other = f === 'sin' ? 'cos' : f === 'cos' ? 'sin' : null, alts = [A(RADF[f](deg), 'radian', RAD_HINT)];
    if (other) alts.push(A(TR[other](deg), 'sin-cos-swap', 'That is ' + t(FN[other] + ' ' + dg(deg)) + '. Check which key you pressed: the question asks for ' + t(FN[f]) + '.'));
    else alts.push(A(TR.sin(deg), 'wrong-ratio', 'That is ' + t('\\sin ' + dg(deg)) + '. Use the ' + t('\\tan') + ' key.'));
    return { name: label, before: t(FN[f] + ' ' + dg(deg) + '\\approx'), x: x, dp: 4, alts: alts };
  }
  function sinTanSlot(r) {
    var x = r.int(12, 78), claimTan = r.chance(0.5);
    var claim = claimTan ? t('\\tan ' + dg(x) + '>\\sin ' + dg(x)) : t('\\sin ' + dg(x) + '>\\tan ' + dg(x));
    var T = claimTan ? '<b>True.</b> ' : '<b>False.</b> ', Fz = claimTan ? '<b>False.</b> ' : '<b>True.</b> ';
    return { claim: claim, opts: [
      { html: T + 'Both ratios have the opposite side on top. Sine divides it by the hypotenuse and tangent divides it by the adjacent side, which is shorter, so ' + t('\\tan ' + dg(x)) + ' is the larger value.', right: true },
      { html: Fz + 'The hypotenuse is the longest side, so the sine is always the larger ratio.', why: 'A longer bottom makes a fraction <b>smaller</b>: with the same opposite side on top, ' + t('\\frac{\\text{opp}}{\\text{hyp}}<\\frac{\\text{opp}}{\\text{adj}}') + '.' },
      { html: T + 'The tangent of every acute angle is greater than ' + t('1') + '.', why: 'Right answer, wrong reason: ' + t('\\tan 20^\\circ\\approx 0.36') + ' is less than ' + t('1') + '. The reason is that the adjacent side is shorter than the hypotenuse.' },
      { html: '<b>False.</b> They are equal, because both ratios use the opposite side.', why: 'They share the opposite side, but they divide it by <b>different</b> sides (the hypotenuse and the adjacent side), so they are not equal.' }],
      sol: 'Both ratios have the <b>opposite</b> side on top: ' + t('\\sin ' + dg(x) + '=\\frac{\\text{opp}}{\\text{hyp}}') + ' and ' + t('\\tan ' + dg(x) + '=\\frac{\\text{opp}}{\\text{adj}}') + '. The adjacent side is a leg, so it is shorter than the hypotenuse; dividing by a smaller number gives a larger value. So ' + t('\\tan ' + dg(x) + '>\\sin ' + dg(x)) + ' and the statement is <b>' + (claimTan ? 'true' : 'false') + '</b>. (Check: ' + t('\\sin ' + dg(x) + '\\approx ' + fx(TR.sin(x), 3)) + ', ' + t('\\tan ' + dg(x) + '\\approx ' + fx(TR.tan(x), 3)) + '.)' };
  }
  function cosSlot(r) {
    var a = r.int(10, 60), b = a + r.int(12, 28), claimTrue = r.chance(0.5);
    var claim = claimTrue ? t('\\cos ' + dg(a) + '>\\cos ' + dg(b)) : t('\\cos ' + dg(a) + '<\\cos ' + dg(b));
    var T = claimTrue ? '<b>True.</b> ' : '<b>False.</b> ', Fz = claimTrue ? '<b>False.</b> ' : '<b>True.</b> ';
    return { claim: claim, opts: [
      { html: T + 'With the same hypotenuse, as the angle opens from ' + t(dg(a)) + ' to ' + t(dg(b)) + ' the adjacent side gets shorter, so the cosine gets smaller: ' + t('\\cos ' + dg(a) + '>\\cos ' + dg(b)) + '.', right: true },
      { html: Fz + 'A larger angle always has a larger trigonometric ratio, so ' + t('\\cos ' + dg(b)) + ' is larger.', why: 'That is true for sine and tangent, but cosine is ' + t('\\frac{\\text{adj}}{\\text{hyp}}') + ', and the adjacent side <b>shrinks</b> as the angle opens.' },
      { html: T + 'As the angle opens, the opposite side gets longer, so the cosine gets smaller.', why: 'Right answer, wrong reason: the cosine doesn’t use the opposite side. It is ' + t('\\frac{\\text{adj}}{\\text{hyp}}') + ', and it is the adjacent side that gets shorter.' },
      { html: '<b>False.</b> The two cosines are equal, because both triangles can be drawn with the same hypotenuse.', why: 'The hypotenuse can be the same, but the adjacent sides are different lengths, so the cosines are different.' }],
      sol: 'Draw both angles with the same hypotenuse. As the angle opens from ' + t(dg(a)) + ' to ' + t(dg(b)) + ', the adjacent side gets <b>shorter</b>, so ' + t('\\cos=\\frac{\\text{adj}}{\\text{hyp}}') + ' <b>decreases</b>: ' + t('\\cos ' + dg(a) + '>\\cos ' + dg(b)) + '. The statement is <b>' + (claimTrue ? 'true' : 'false') + '</b>. (Check: ' + t('\\cos ' + dg(a) + '\\approx ' + fx(TR.cos(a), 3)) + ', ' + t('\\cos ' + dg(b) + '\\approx ' + fx(TR.cos(b), 3)) + '.)' };
  }
  function tanOneSlot(r) {
    var x; do { x = r.int(14, 76); } while (Math.abs(x - 45) < 7);
    var big = x > 45, claim = t('\\tan ' + dg(x) + '>1');
    return { claim: claim, opts: [
      { html: big ? '<b>True.</b> For an angle greater than ' + t('45^\\circ') + ', the opposite leg is longer than the adjacent leg, so ' + t('\\frac{\\text{opp}}{\\text{adj}}>1') + '.' : '<b>False.</b> For an angle less than ' + t('45^\\circ') + ', the opposite leg is shorter than the adjacent leg, so ' + t('\\frac{\\text{opp}}{\\text{adj}}<1') + '.', right: true },
      { html: '<b>False.</b> No trigonometric ratio can be greater than ' + t('1') + ', because the hypotenuse is the longest side.', why: big ? 'Sine and cosine can’t be greater than ' + t('1') + ', but tangent doesn’t use the hypotenuse: ' + t('\\tan 60^\\circ\\approx 1.73') + '.' : 'Right answer, wrong reason: tangent doesn’t use the hypotenuse and <i>can</i> be greater than ' + t('1') + ' (' + t('\\tan 60^\\circ\\approx 1.73') + '). Here it is less than ' + t('1') + ' because the opposite leg is the shorter leg.' },
      { html: '<b>True.</b> Tangent doesn’t use the hypotenuse, so it is always greater than ' + t('1') + '.', why: big ? 'Right answer, wrong reason: ' + t('\\tan 30^\\circ\\approx 0.58') + ' is less than ' + t('1') + '. It is the angle being more than ' + t('45^\\circ') + ' that makes the opposite leg the longer one.' : 'Not always: ' + t('\\tan ' + dg(x)) + ' is less than ' + t('1') + ' because, for an angle under ' + t('45^\\circ') + ', the opposite leg is shorter than the adjacent leg.' },
      { html: big ? '<b>False.</b> For an angle greater than ' + t('45^\\circ') + ', the adjacent leg is longer than the opposite leg.' : '<b>True.</b> For an angle less than ' + t('45^\\circ') + ', the opposite leg is longer than the adjacent leg.', why: 'That is backwards. At ' + t('45^\\circ') + ' the legs are equal; as the angle opens past ' + t('45^\\circ') + ', the <b>opposite</b> leg becomes the longer one.' }],
      sol: 'At ' + t('45^\\circ') + ' the two legs are equal and ' + t('\\tan 45^\\circ=1') + '. ' + (big ? 'For ' + t(dg(x)) + ', more than ' + t('45^\\circ') + ', the opposite leg is longer than the adjacent leg, so ' + t('\\tan ' + dg(x) + '=\\frac{\\text{opp}}{\\text{adj}}>1') + ': <b>true</b>.' : 'For ' + t(dg(x)) + ', less than ' + t('45^\\circ') + ', the opposite leg is shorter than the adjacent leg, so ' + t('\\tan ' + dg(x) + '=\\frac{\\text{opp}}{\\text{adj}}<1') + ': <b>false</b>.') + ' (Check: ' + t('\\tan ' + dg(x) + '\\approx ' + fx(TR.tan(x), 3)) + '.)' };
  }
  function sinCosSlot(r) {
    var x; do { x = r.int(12, 78); } while (Math.abs(x - 45) < 7);
    var big = x > 45, claim = t('\\sin ' + dg(x) + '>\\cos ' + dg(x));
    return { claim: claim, opts: [
      { html: big ? '<b>True.</b> Both ratios divide by the same hypotenuse. For an angle greater than ' + t('45^\\circ') + ', the opposite side is longer than the adjacent side, so the sine is larger.' : '<b>False.</b> Both ratios divide by the same hypotenuse. For an angle less than ' + t('45^\\circ') + ', the opposite side is shorter than the adjacent side, so the cosine is larger.', right: true },
      { html: '<b>False.</b> The cosine of an angle is always greater than its sine.', why: big ? 'Not always: ' + t('\\sin 70^\\circ\\approx 0.94') + ' and ' + t('\\cos 70^\\circ\\approx 0.34') + '. Past ' + t('45^\\circ') + ' the opposite side is the longer leg.' : 'Right answer, wrong reason: ' + t('\\sin 70^\\circ>\\cos 70^\\circ') + ', so it isn’t “always”. Here the cosine wins because, below ' + t('45^\\circ') + ', the adjacent side is the longer leg.' },
      { html: '<b>True.</b> The sine of an angle is always greater than its cosine.', why: big ? 'Right answer, wrong reason: ' + t('\\sin 20^\\circ<\\cos 20^\\circ') + ', so it isn’t “always”. Here the sine wins because, past ' + t('45^\\circ') + ', the opposite side is the longer leg.' : 'Not always: ' + t('\\sin 20^\\circ\\approx 0.34') + ' and ' + t('\\cos 20^\\circ\\approx 0.94') + '. Below ' + t('45^\\circ') + ' the adjacent side is the longer leg.' },
      { html: big ? '<b>False.</b> For an angle greater than ' + t('45^\\circ') + ', the adjacent side is longer than the opposite side.' : '<b>True.</b> For an angle less than ' + t('45^\\circ') + ', the opposite side is longer than the adjacent side.', why: 'That is backwards. At ' + t('45^\\circ') + ' the legs are equal; as the angle opens past ' + t('45^\\circ') + ' the <b>opposite</b> side becomes the longer leg.' }],
      sol: t('\\sin=\\frac{\\text{opp}}{\\text{hyp}}') + ' and ' + t('\\cos=\\frac{\\text{adj}}{\\text{hyp}}') + ' have the same bottom, so compare the legs. ' + (big ? 'For ' + t(dg(x)) + ' (more than ' + t('45^\\circ') + ') the opposite side is the longer leg, so ' + t('\\sin ' + dg(x) + '>\\cos ' + dg(x)) + ': <b>true</b>.' : 'For ' + t(dg(x)) + ' (less than ' + t('45^\\circ') + ') the opposite side is the shorter leg, so ' + t('\\sin ' + dg(x) + '<\\cos ' + dg(x)) + ': <b>false</b>.') + ' (Check: ' + t('\\sin ' + dg(x) + '\\approx ' + fx(TR.sin(x), 3)) + ', ' + t('\\cos ' + dg(x) + '\\approx ' + fx(TR.cos(x), 3)) + '.)' };
  }

  /* ================= Lesson 9.3: contexts ================= */
  var L3_ON_TOP = [
    { kind: 'ladder-h', obj: 'ladder', make: function (r) { var L = tenth(r, 4.5, 9.5), d = r.int(62, 78); return { deg: d, k: L, kStr: fx(L, 1), kRole: 'hyp', uRole: 'opp', uName: 'h', unit: 'm', lab: { H: '', V: 'h', S: fx(L, 1) + ' m' },
      text: 'A ladder ' + t(fx(L, 1) + '\\text{ m}') + ' long leans against a wall and makes an angle of ' + t(dg(d)) + ' with the level ground. How high up the wall, ' + t('h') + ', does the ladder reach? Answer to the nearest tenth of a metre.' }; } },
    { kind: 'ladder-d', obj: 'ladder', make: function (r) { var L = tenth(r, 4.5, 9.5), d = r.int(62, 78); return { deg: d, k: L, kStr: fx(L, 1), kRole: 'hyp', uRole: 'adj', uName: 'd', unit: 'm', lab: { H: 'd', V: '', S: fx(L, 1) + ' m' },
      text: 'A ladder ' + t(fx(L, 1) + '\\text{ m}') + ' long leans against a wall and makes an angle of ' + t(dg(d)) + ' with the level ground. How far from the wall, ' + t('d') + ', is the foot of the ladder? Answer to the nearest tenth of a metre.' }; } },
    { kind: 'conveyor', obj: 'ramp', make: function (r) { var L = tenth(r, 6, 18), d = r.int(14, 32); return { deg: d, k: L, kStr: fx(L, 1), kRole: 'hyp', uRole: 'opp', uName: 'h', unit: 'm', lab: { H: '', V: 'h', S: fx(L, 1) + ' m' },
      text: 'A straight conveyor belt ' + t(fx(L, 1) + '\\text{ m}') + ' long carries boxes up at an angle of ' + t(dg(d)) + ' to the horizontal. How high, ' + t('h') + ', does it lift the boxes? Answer to the nearest tenth of a metre.' }; } },
    { kind: 'shadow', obj: 'tree', make: function (r) { var s = tenth(r, 8, 30), d = r.int(28, 62); return { deg: d, k: s, kStr: fx(s, 1), kRole: 'adj', uRole: 'opp', uName: 'h', unit: 'm', lab: { H: fx(s, 1) + ' m', V: 'h', S: '' },
      text: 'A tree casts a shadow ' + t(fx(s, 1) + '\\text{ m}') + ' long on level ground when the angle of elevation of the sun is ' + t(dg(d)) + '. How tall, ' + t('h') + ', is the tree? Answer to the nearest tenth of a metre.' }; } },
    { kind: 'zip', obj: 'none', make: function (r) { var L = r.int(80, 260), d = r.int(6, 15); return { deg: d, k: L, kStr: String(L), kRole: 'hyp', uRole: 'adj', uName: 'd', unit: 'm', lab: { H: 'd', V: '', S: L + ' m' },
      text: 'A straight zip-line cable ' + t(L + '\\text{ m}') + ' long slopes down at ' + t(dg(d)) + ' to the horizontal. What horizontal distance, ' + t('d') + ', does it cover? Answer to the nearest tenth of a metre.' }; } }];
  var L3_TWO = [
    { kind: 'ramp', make: function (r) { var h = r.int(35, 95) / 100, d = r.int(3, 6); return { deg: d, h: h, hStr: fx(h, 2), unit: 'm', obj: 'ramp', s: 'L', g: 'd', dp: 2,
      text: 'A wheelchair ramp must rise ' + t(fx(h, 2) + '\\text{ m}') + ' to reach a doorway, and it makes an angle of ' + t(dg(d)) + ' with the level ground.', what: ['the length of the ramp, ' + t('L'), 'the horizontal distance the ramp covers, ' + t('d')] }; } },
    { kind: 'kite', make: function (r) { var h = r.int(24, 70), d = r.int(32, 64); return { deg: d, h: h, hStr: String(h), unit: 'm', obj: 'kite', s: 'L', g: 'd',
      text: 'A kite flies ' + t(h + '\\text{ m}') + ' above the level ground, and its taut string makes an angle of ' + t(dg(d)) + ' with the ground.', what: ['the length of the string, ' + t('L'), 'the horizontal distance from the person holding the string to the point directly under the kite, ' + t('d')] }; } },
    { kind: 'escalator', make: function (r) { var h = tenth(r, 4.2, 9.6), d = r.int(26, 36); return { deg: d, h: h, hStr: fx(h, 1), unit: 'm', obj: 'ramp', s: 'L', g: 'd',
      text: 'A mall escalator rises ' + t(fx(h, 1) + '\\text{ m}') + ' from one floor to the next at an angle of ' + t(dg(d)) + ' to the horizontal.', what: ['the length of the escalator, ' + t('L'), 'the horizontal distance it covers, ' + t('d')] }; } }];

  /* ================= Lesson 9.4 ================= */
  function intPair(r, kind, lo, hi, maxD) {
    return find(function () { var n = r.int(lo, hi), d = kind === 'oa' ? r.int(lo, hi) : r.int(n + 3, maxD); return { n: n, d: d }; },
      function (c) { if (c.n === c.d) return false; var x = angCalc(kind, c.n, c.d); return x > 14 && x < 76 && Math.abs(x - 45) > 1.2 && safe(x, 0); }, { n: 5, d: 12 });
  }
  function decPair(r, kind, dp) {
    return find(function () { var n = r.int(25, 99) / 10, d = kind === 'oa' ? r.int(25, 99) / 10 : r.int(Math.round(n * 10) + 8, 140) / 10; return { n: n, d: d }; },
      function (c) { if (c.n === c.d) return false; var x = angCalc(kind, c.n, c.d); return x > 14 && x < 76 && Math.abs(x - 45) > 1.2 && safe(x, dp); }, { n: 4.5, d: 7.2 });
  }
  /* isosceles figure: apex V at the top, equal sides L, base b */
  function isoFig(o) {
    var hgt = Math.sqrt(o.L * o.L - o.b * o.b / 4), pts = { Q: [-o.b / 2, 0], R: [o.b / 2, 0], V: [0, hgt] };
    var extra = o.ground ? [{ type: 'ground', y: 0, x0: -o.b / 2 - o.b * 0.12, x1: o.b / 2 + o.b * 0.12 }] : [];
    return fig({ pts: pts, segs: [['Q', 'R', o.bLab], ['V', 'Q', o.LLab], ['V', 'R', o.LLab]], angles: [['V', 'Q', 'R', o.angLab || 'x', { r: 20 }]], names: o.names || false, extra: extra, width: 280, aria: 'isosceles triangle' });
  }

  /* ================= Lesson 9.7: two triangles sharing a side ================= */
  function altFig(o) {
    var n = o.names, pts = {};
    pts[n.L] = [-o.l, 0]; pts[n.F] = [0, 0]; pts[n.R] = [o.rr, 0]; pts[n.P] = [0, o.h];
    var segs = [[n.L, n.F, o.lab.LF], [n.F, n.R, o.lab.FR], [n.L, n.P, o.lab.LP], [n.P, n.R, o.lab.PR], [n.F, n.P, null, o.fpStyle]].map(function (s) { return s[2] == null ? [s[0], s[1], s[3]].filter(function (z) { return z != null; }) : s; });
    var mx = 0; [o.lab.LF, o.lab.FR, o.lab.LP, o.lab.PR].forEach(function (x) { if (x) mx = Math.max(mx, String(x).length); });
    var pad = Math.max(30, 16 + mx * 7.2), sc = Math.min((300 - 2 * pad) / (o.l + o.rr), (330 - 2 * pad) / o.h), side = o.rr >= o.l ? 1 : -1;
    o.extra = (o.extra || []).slice();
    if (o.lab.FP) o.extra.push({ type: 'text', at: [side * (10 + String(o.lab.FP).length * 3.7) / sc, o.h * 0.36], text: o.lab.FP });
    var ang = [];
    if (o.ang.L) ang.push([n.L, n.F, n.P, o.ang.L]); if (o.ang.R) ang.push([n.R, n.F, n.P, o.ang.R]);
    var names = o.showNames === false ? false : (function () { var m = {}; [n.L, n.F, n.R, n.P].forEach(function (k) { m[k] = k; }); return m; })();
    return fig({ pts: pts, segs: segs, right: [[n.F, n.R, n.P]], angles: ang, names: names, extra: o.extra, width: 300, aria: o.aria || 'two right triangles sharing a side' });
  }
  /* depression to two points in line: E at height h above G, near point N and far point M on the ground */
  function twoDeprFig(o) {
    var vb = vis(o.b, 24, 30), va = Math.max(vis(o.a, 44, 64), vb + 20), h = 6, xn = h / Math.tan(va * Math.PI / 180), xf2 = h / Math.tan(vb * Math.PI / 180);
    var pts = { E: [0, h], G: [0, 0], N: [xn, 0], M: [xf2, 0], H: [xf2 + 0.4, h] };
    var extra = [{ type: 'ground', y: 0, x0: -0.8, x1: xf2 + 1.2 }, { type: 'text', at: [(xn + xf2) / 2, -0.9], text: o.dLab || '?' }];
    if (o.topText) extra.push({ type: 'text', at: [0, h + 0.9], text: o.topText }, { type: 'eye', at: [0, h] });
    return fig({ pts: pts, segs: [['G', 'E', o.hLab, o.dashH ? { dash: 1, width: 1.3, color: GREY } : { width: 3 }], ['G', 'M'], ['E', 'N'], ['E', 'M'], ['E', 'H', { dash: 1, width: 1.4, color: GREY }]],
      right: [['G', 'E', 'M']], angles: [['E', 'H', 'N', ds(o.a), { r: 24 }], ['E', 'H', 'M', ds(o.b), { r: 56 }]], names: { N: o.nName || 'N', M: o.mName || 'M' }, extra: extra, width: 340, pad: 34, aria: 'two angles of depression' });
  }
  /* elevation from two points in line with a tower: far point P, near point Q, tower base B, top T */
  function twoElevFig(o) {
    var v1 = vis(o.a1, 20, 40), v2 = Math.max(vis(o.a2, 26, 66), v1 + 14), h = 6, xq = h / Math.tan(v2 * Math.PI / 180), xp = h / Math.tan(v1 * Math.PI / 180);
    var pts = { P: [0, 0], Q: [xp - xq, 0], B: [xp, 0], T: [xp, h] };
    return fig({ pts: pts, segs: [['P', 'Q'], ['Q', 'B'], ['B', 'T', o.hLab, { width: 3 }], ['P', 'T'], ['Q', 'T']], right: [['B', 'P', 'T']],
      angles: [['P', 'B', 'T', ds(o.a1), { r: 30 }], ['Q', 'B', 'T', ds(o.a2), { r: 22 }]], names: { P: 'P', Q: 'Q', B: 'B', T: 'T' },
      extra: [{ type: 'ground', y: 0, x0: -0.8, x1: xp + 1.2 }, { type: 'text', at: [(xp - xq) / 2, -1.1], text: '?' }], width: 320, aria: 'two angles of elevation' });
  }

  /* ======================================================================================================
   * EXIT SLIPS
   * ====================================================================================================== */

  /* ---------------- 9.1 ---------------- */
  HW.defineExit({
    lesson: 'u9l1', calc: true, outcome: 'M4',
    blurb: 'Exact sine, cosine and tangent from side lengths (reduced), the other two ratios from a tangent, and side lengths from a ratio and the hypotenuse.',
    questions: [
      { num: '1', outcome: 'M4', stem: 'Write each ratio as a fraction in simplest form.', parts: [
        { id: '1', outcome: 'M4', level: 'BEG', make: function (r) {
          var tr = r.pick(SCALED), nm = anyNames(r), T = fromTriple(r, nm, tr), or = ori(r, r.chance(0.4)), ang = T.A;
          return ratiosPart(T, ['sin', 'cos', 'tan'], ang, 'For the right triangle below, determine ' + t('\\sin ' + ang) + ', ' + t('\\cos ' + ang) + ' and ' + t('\\tan ' + ang) + '.' + triFigT(T, { rot: or.rot, flip: or.flip, angA: ang, lab: { o: nf(T.o), a: nf(T.a), h: nf(T.h) } }), {
            sol: 'The right angle is at ' + t(T.R) + ', so ' + t(T.hyp + '=' + nf(T.h)) + ' is the hypotenuse. Relative to ' + t('\\angle ' + ang) + ': opp ' + t('=' + T.opp + '=' + nf(T.o)) + ' (it doesn’t touch ' + t(ang) + '), adj ' + t('=' + T.adj + '=' + nf(T.a)) + '.<br>' +
              ['sin', 'cos', 'tan'].map(function (f) { var p = pair(T, FUN[f]); return t(FN[f] + ' ' + ang + '=\\frac{\\text{' + (f === 'cos' ? 'adj' : 'opp') + '}}{\\text{' + (f === 'tan' ? 'adj' : 'hyp') + '}}=' + steps(p[0], p[1])); }).join('<br>'),
            hints: ['The hypotenuse is across from the right angle. Relative to ' + t('\\angle ' + ang) + ', the opposite side doesn’t touch ' + t(ang) + ' and the adjacent side does.', 'SOH CAH TOA — then reduce each fraction (divide the top and bottom by a common factor' + (nd(T.o) || nd(T.a) || nd(T.h) ? '; clear the decimals first' : '') + ').'],
            text: 'reduce ratios ' + tr.join('-') });
        } }] },
      { num: '2', outcome: 'M4', stem: 'Sketch and label the triangle first.', parts: [
        { id: '2', outcome: 'M4', level: 'PRG', make: function (r) {
          var tr = r.pick(PRIM.slice(1)), L = r.pick(LETS), nm = { A: L[0], B: L[1], R: L[2] }, T = fromTriple(r, nm, tr), A0 = T.A;
          var tv = T.o / T.a, dec = /^\d+(\.\d{1,3})?$/.test(String(cl(tv))) && r.chance(0.5), given = dec ? String(cl(tv)) : '\\frac{' + T.o + '}{' + T.a + '}';
          return ratiosPart(T, ['sin', 'cos'], A0, 'In ' + t('\\triangle ' + L.join('')) + ', ' + t('\\angle ' + T.R + '=90^\\circ') + ' and ' + t('\\tan ' + A0 + '=' + given) + '. Determine ' + t('\\sin ' + A0) + ' and ' + t('\\cos ' + A0) + ' as fractions in simplest form.', {
            extra: function (f, v) { var bad = (f === 'sin' ? T.o : T.a) / (T.o + T.a); if (Math.abs(v - bad) < 1e-9) return { code: 'u9x-legs-added', hint: 'The hypotenuse isn’t the sum of the legs. Use the Pythagorean theorem: ' + t('\\text{hyp}=\\sqrt{' + T.o + '^2+' + T.a + '^2}') + '.' }; return null; },
            bad: [[ex.texRat(frc(T.o, T.o + T.a)), ex.texRat(frc(T.a, T.o + T.a))]],
            sol: 'Sketch right ' + t('\\triangle ' + L.join('')) + ' with the right angle at ' + t(T.R) + '. ' + t('\\tan ' + A0 + '=' + (dec ? given + '=\\frac{' + T.o + '}{' + T.a + '}' : given) + '=\\frac{\\text{opp}}{\\text{adj}}') + ', so label the side opposite ' + t(A0) + ' (' + t(T.opp) + ') ' + t(T.o) + ' and the adjacent side (' + t(T.adj) + ') ' + t(T.a) + '.<br>' +
              'Hypotenuse: ' + t(T.hyp + '=\\sqrt{' + T.o + '^2+' + T.a + '^2}=\\sqrt{' + (T.o * T.o + T.a * T.a) + '}=' + T.h) + '.<br>' + t('\\sin ' + A0 + '=\\frac{\\text{opp}}{\\text{hyp}}=\\frac{' + T.o + '}{' + T.h + '}') + ', ' + t('\\cos ' + A0 + '=\\frac{\\text{adj}}{\\text{hyp}}=\\frac{' + T.a + '}{' + T.h + '}') + '.',
            hints: [t('\\tan=\\frac{\\text{opp}}{\\text{adj}}') + ': label the two legs of your sketch with ' + (dec ? 'the fraction form of ' + t(given) + ' (' + t('\\frac{' + T.o + '}{' + T.a + '}') + ')' : 'the top and bottom of the fraction') + '.', 'Find the hypotenuse with the Pythagorean theorem, then use SOH and CAH.'],
            text: 'tan ' + T.o + '/' + T.a + ' to sin, cos' });
        } }] },
      { num: '3', outcome: 'M4', stem: 'A trigonometric ratio gives the shape of a right triangle; one side gives its size.', parts: [
        { id: '3', outcome: 'M4', level: 'ADV', make: function (r) { return q13Part(r); } }] }]
  });

  /* ---------------- 9.2 ---------------- */
  HW.defineExit({
    lesson: 'u9l2', calc: true, outcome: 'M4',
    blurb: 'Calculator values of sin, cos and tan (degree mode), an expression with trigonometric ratios, and judging a claim about how the ratios compare.',
    questions: [
      { num: '1', outcome: 'M4', stem: 'Use a calculator in <b>degree</b> mode.', parts: [
        { id: '1', outcome: 'M4', level: 'BEG', make: function (r) {
          var a = find(function () { return r.int(11, 79); }, function (v) { return safe(TR.sin(v), 4); }, 47);
          var b = find(function () { return r.int(105, 795) / 10; }, function (v) { return v % 1 !== 0 && safe(TR.cos(v), 4); }, 23.6);
          var c = find(function () { return r.int(11, 79); }, function (v) { return v !== 45 && v !== a && safe(TR.tan(v), 4); }, 62);
          var boxes = [calcBox('sin', a, 'sin'), calcBox('cos', b, 'cos'), calcBox('tan', c, 'tan')];
          return fieldsPart('Evaluate ' + t('\\sin ' + dg(a)) + ', ' + t('\\cos ' + dg(b)) + ' and ' + t('\\tan ' + dg(c)) + ', each to four decimal places.', boxes,
            t('\\sin ' + dg(a) + '=' + TR.sin(a).toFixed(7) + '\\ldots\\approx ' + fx(TR.sin(a), 4)) + '<br>' + t('\\cos ' + dg(b) + '=' + TR.cos(b).toFixed(7) + '\\ldots\\approx ' + fx(TR.cos(b), 4)) + '<br>' + t('\\tan ' + dg(c) + '=' + TR.tan(c).toFixed(7) + '\\ldots\\approx ' + fx(TR.tan(c), 4)) + '<br>Look at the fifth decimal place to round.',
            ['Check that your calculator shows DEG (not RAD) before you start.', 'Round to four decimal places: look at the fifth digit after the decimal point.'], 'calc sin ' + a + ' cos ' + b + ' tan ' + c);
        } }] },
      { num: '2', outcome: 'M4', stem: 'Use a calculator in degree mode. Keep full calculator values and round only the final answer.', parts: [
        { id: '2', outcome: 'M4', level: 'EMG', make: function (r) {
          var kind = r.pick(['frac', 'sub']), a, b, c, x, wrongOrder, early, rad, tex, sol;
          if (kind === 'frac') {
            var s = find(function () { return { a: r.int(15, 75), b: r.int(15, 75), c: r.int(20, 70) }; }, function (s) { var v = (TR.sin(s.a) + TR.cos(s.b)) / TR.tan(s.c); return s.a !== s.b && s.c !== 45 && safe(v, 2); }, { a: 34, b: 61, c: 52 });
            a = s.a; b = s.b; c = s.c; x = (TR.sin(a) + TR.cos(b)) / TR.tan(c);
            wrongOrder = TR.sin(a) + TR.cos(b) / TR.tan(c); early = (rd(TR.sin(a), 2) + rd(TR.cos(b), 2)) / rd(TR.tan(c), 2); rad = (Math.sin(a) + Math.cos(b)) / Math.tan(c);
            tex = '\\dfrac{\\sin ' + dg(a) + '+\\cos ' + dg(b) + '}{\\tan ' + dg(c) + '}';
            sol = t(tex + '=\\dfrac{' + dots(TR.sin(a)) + '+' + dots(TR.cos(b)) + '}{' + dots(TR.tan(c)) + '}=\\dfrac{' + dots(TR.sin(a) + TR.cos(b)) + '}{' + dots(TR.tan(c)) + '}=' + dots(x) + '\\approx ' + fx(x, 2)) + '<br>Add the top first (the fraction bar groups it), then divide.';
          } else {
            var s2 = find(function () { return { a: r.int(48, 75), b: r.int(15, 75), c: r.int(15, 75) }; }, function (s) { var v = TR.tan(s.a) - TR.sin(s.b) * TR.cos(s.c); return s.b !== s.c && v > 0.2 && safe(v, 2) && Math.abs((TR.tan(s.a) - TR.sin(s.b)) * TR.cos(s.c) - v) > 0.05; }, { a: 58, b: 40, c: 25 });
            a = s2.a; b = s2.b; c = s2.c; x = TR.tan(a) - TR.sin(b) * TR.cos(c);
            wrongOrder = (TR.tan(a) - TR.sin(b)) * TR.cos(c); early = rd(TR.tan(a), 2) - rd(TR.sin(b), 2) * rd(TR.cos(c), 2); rad = Math.tan(a) - Math.sin(b) * Math.cos(c);
            tex = '\\tan ' + dg(a) + '-\\sin ' + dg(b) + '\\cos ' + dg(c);
            sol = t(tex + '=' + dots(TR.tan(a)) + '-(' + dots(TR.sin(b)) + ')(' + dots(TR.cos(c)) + ')=' + dots(TR.tan(a)) + '-' + dots(TR.sin(b) * TR.cos(c)) + '=' + dots(x) + '\\approx ' + fx(x, 2)) + '<br>Multiply before subtracting (order of operations).';
          }
          return nearPart('Evaluate ' + t(tex) + ' to the nearest hundredth.', x, 2, { before: t(tex + '\\approx'), alts: [
            A(wrongOrder, 'u9x-order', kind === 'frac' ? 'Order of operations: the fraction bar groups the whole top. Add ' + t('\\sin ' + dg(a) + '+\\cos ' + dg(b)) + ' first (use brackets on your calculator), then divide by ' + t('\\tan ' + dg(c)) + '.' : 'Order of operations: multiply ' + t('\\sin ' + dg(b) + '\\cos ' + dg(c)) + ' first, then subtract that product from ' + t('\\tan ' + dg(a)) + '.'),
            A(early, 'early-round', 'Close — but you rounded each ratio before combining them. Keep the full calculator values and round only the final answer.'),
            A(rad, 'radian', RAD_HINT)] }, sol,
            ['Find each ratio on your calculator (degree mode) and keep all the digits.', kind === 'frac' ? 'The fraction bar acts like brackets: work out the top, then divide by the bottom.' : 'Multiply before you subtract.'], 'expression ' + kind + ' ' + a + ',' + b + ',' + c);
        } }] },
      { num: '3', outcome: 'M4', stem: 'Without using a calculator, decide whether the statement is true or false. Choose the answer with a correct reason.', parts: [
        { id: '3', outcome: 'M4', level: 'PRG', make: function (r) {
          var slot = r.pick([sinTanSlot, cosSlot, tanOneSlot, sinCosSlot])(r);
          return P.mc(r, '“' + slot.claim + '”', slot.opts, slot.sol, ['Picture a right triangle with the angle: which sides does each ratio use, and which side is longer?'], 'claim ' + slot.claim.replace(/\\\(|\\\)/g, ''));
        } }] }]
  });

  /* ---------------- 9.3 ---------------- */
  HW.defineExit({
    lesson: 'u9l3', calc: true, outcome: 'M4',
    blurb: 'A side in the numerator (context), a side in the denominator from a described triangle, and two unknown sides in a context.',
    questions: [
      { num: '1', outcome: 'M4', stem: 'Use a trigonometric ratio.', parts: [
        { id: '1', outcome: 'M4', level: 'BEG', make: function (r) {
          var c = r.pick(L3_ON_TOP), s = c.make(r), flip = r.chance(0.5);
          return sidePart({ prompt: s.text + slopeFig({ deg: s.deg, labH: s.lab.H, labV: s.lab.V, labS: s.lab.S, obj: c.obj, flip: flip }), deg: s.deg, k: s.k, kStr: s.kStr, kRole: s.kRole, uRole: s.uRole, uName: s.uName, unit: s.unit, dp: 1, text: c.kind + ' ' + s.kStr + ' ' + s.deg });
        } }] },
      { num: '2', outcome: 'M4', stem: 'Sketch and label the triangle first. Round to the nearest tenth.', parts: [
        { id: '2', outcome: 'M4', level: 'PRG', make: function (r) {
          var n = names3(r), deg = r.int(24, 66), roles = r.pick([['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']]), unit = r.pick(['cm', 'm', 'mm']);
          var k = unit === 'mm' ? tenth(r, 120, 480) : tenth(r, 6.5, 48), kStr = fx(k, 1), kS = sideOf(n, roles[0]), uS = sideOf(n, roles[1]);
          return sidePart({ prompt: 'In ' + t('\\triangle ' + n.tri) + ', ' + t('\\angle ' + n.rt + '=90^\\circ') + ', ' + t('\\angle ' + n.ang + '=' + dg(deg)) + ' and ' + t(kS + '=' + F(kStr) + '\\text{ ' + unit + '}') + '. Determine the length of ' + t(uS) + '.',
            deg: deg, k: k, kStr: F(kStr), kRole: roles[0], uRole: roles[1], kName: kS, uName: uS, unit: unit, dp: 1, angTex: '\\angle ' + n.ang,
            solPre: 'Sketch: right angle at ' + t(n.rt) + ', so ' + t(sideOf(n, 'hyp')) + ' is the hypotenuse; ' + t(sideOf(n, 'opp')) + ' is opposite ' + t('\\angle ' + n.ang) + ' and ' + t(sideOf(n, 'adj')) + ' is adjacent to it.' + triFig(r, deg, (function () { var l = {}; l[roles[0]] = F(kStr) + ' ' + unit; l[roles[1]] = uS; return l; })(), n, { width: 200 }),
            text: 'denominator ' + roles.join('>') + ' ' + kStr + ' ' + deg });
        } }] },
      { num: '3', outcome: 'M4', stem: 'Two unknown sides, both found from the same angle. (Diagram not to scale.)', parts: [
        { id: '3', outcome: 'M4', level: 'ADV', make: function (r) {
          var c = r.pick(L3_TWO), s = find(function () { return c.make(r); }, function (s) { var dq = s.dp || 1; return Math.abs(rd(s.h / TR.sin(s.deg), dq) - rd(s.h / TR.tan(s.deg), dq)) > 1.5 * Math.pow(10, -dq) && safe(s.h / TR.sin(s.deg), dq) && safe(s.h / TR.tan(s.deg), dq); }, c.make(r));
          var d = s.deg, h = s.h, hs = s.hStr, dp = s.dp || 1, place = dp === 2 ? 'hundredth' : 'tenth';
          var Ls = solveSide({ deg: d, k: h, kStr: hs, kRole: 'opp', uRole: 'hyp', uName: 'L', unit: s.unit, dp: dp });
          var Ds = solveSide({ deg: d, k: h, kStr: hs, kRole: 'opp', uRole: 'adj', uName: 'd', unit: s.unit, dp: dp });
          var LR = rd(Ls.x, dp), DR = rd(Ds.x, dp), early = [A(Math.sqrt(Math.max(0, LR * LR - h * h)), 'early-round', EARLY), A(LR * TR.cos(d), 'early-round', EARLY)];
          var alsoD = [Math.sqrt(Math.max(0, LR * LR - h * h)), LR * TR.cos(d)], alsoL = [Math.sqrt(DR * DR + h * h), DR / TR.cos(d)];
          return fieldsPart(s.text + ' Determine ' + s.what[0] + ', and ' + s.what[1] + ', each to the nearest ' + place + ' of a metre.' + slopeFig({ deg: d, labH: 'd', labV: hs + ' m', labS: 'L', obj: s.obj, flip: r.chance(0.5) }),
            [{ name: 'L', before: t('L\\approx'), after: s.unit, x: Ls.x, dp: dp, alts: Ls.alts, diag: Ls.diag, also: alsoL }, { name: 'd', before: t('d\\approx'), after: s.unit, x: Ds.x, dp: dp, alts: early.concat(Ds.alts), also: alsoD }],
            '<b>' + t('L') + '</b>: ' + Ls.sol + '<br><b>' + t('d') + '</b>: ' + Ds.sol + '<br>(Using the full value of ' + t('L') + ' with the Pythagorean theorem gives the same ' + t('d') + '; a rounded ' + t('L') + ' can be one place off, which is accepted, but finding each side from the given height is safer.)',
            ['Both unknowns are measured from the ' + t(dg(d)) + ' angle: the height ' + t(hs) + ' is the <b>opposite</b> side. Which ratio links opposite and hypotenuse? Opposite and adjacent?', 'Both unknowns are in the denominator: cross-multiply, then divide the height by the ratio.'],
            c.kind + ' ' + hs + ' ' + d);
        } }] }]
  });

  /* ---------------- 9.4 ---------------- */
  var L4_CTX = [
    { kind: 'ladder', make: function (r) { var p = find(function () { return { L: tenth(r, 5, 9), d: tenth(r, 1.1, 2.6) }; }, function (p) { return safe(angCalc('ah', p.d, p.L), 1); }, { L: 6.5, d: 1.8 });
      return { k: 'ah', n: p.d, d: p.L, nS: fx(p.d, 1), dS: fx(p.L, 1), text: 'A ladder ' + t(fx(p.L, 1) + '\\text{ m}') + ' long leans against a wall with its foot ' + t(fx(p.d, 1) + '\\text{ m}') + ' from the wall. Determine the angle the ladder makes with the level ground, to the nearest tenth of a degree.',
        fig: function (r, x) { return slopeFig({ deg: x, labH: fx(p.d, 1) + ' m', labV: '', labS: fx(p.L, 1) + ' m', obj: 'ladder', angLab: 'θ', flip: r.chance(0.5) }); } }; } },
    { kind: 'plane', make: function (r) { var p = find(function () { return { h: tenth(r, 0.8, 2.6), d: tenth(r, 6, 18) }; }, function (p) { return safe(angCalc('oa', p.h, p.d), 1); }, { h: 1.5, d: 11.2 });
      return { k: 'oa', n: p.h, d: p.d, nS: fx(p.h, 1), dS: fx(p.d, 1), depr: true, text: 'An airplane is flying at an altitude of ' + t(fx(p.h, 1) + '\\text{ km}') + '. The start of the runway is ' + t(fx(p.d, 1) + '\\text{ km}') + ' away horizontally. Determine the angle of depression from the plane to the start of the runway, to the nearest tenth of a degree.',
        fig: function (r, x) { return deprFig({ th: x, hLab: fx(p.h, 1) + ' km', runLab: fx(p.d, 1) + ' km', obj: 'drone', top: 'plane', angLab: 'θ', label: 'runway' }); } }; } },
    { kind: 'slide', make: function (r) { var p = find(function () { return { L: tenth(r, 2.8, 5.5), h: tenth(r, 1.2, 2.6) }; }, function (p) { return p.h < p.L - 0.6 && safe(angCalc('oh', p.h, p.L), 1); }, { L: 4.2, h: 2.1 });
      return { k: 'oh', n: p.h, d: p.L, nS: fx(p.h, 1), dS: fx(p.L, 1), text: 'A straight playground slide is ' + t(fx(p.L, 1) + '\\text{ m}') + ' long, and its top is ' + t(fx(p.h, 1) + '\\text{ m}') + ' above the ground. Determine the angle the slide makes with the ground, to the nearest tenth of a degree.',
        fig: function (r, x) { return slopeFig({ deg: x, labH: '', labV: fx(p.h, 1) + ' m', labS: fx(p.L, 1) + ' m', obj: 'ramp', angLab: 'θ', flip: r.chance(0.5) }); } }; } }];
  HW.defineExit({
    lesson: 'u9l4', calc: true, outcome: 'M4',
    blurb: 'An angle from two sides, an angle of elevation or depression in a context, and the apex angle of an isosceles triangle.',
    questions: [
      { num: '1', outcome: 'M4', stem: 'Use an inverse trigonometric ratio.', parts: [
        { id: '1', outcome: 'M4', level: 'BEG', make: function (r) {
          var kind = r.pick(['oh', 'ah', 'oa']), c = r.chance(0.5) ? decPair(r, kind, 0) : intPair(r, kind, 4, 30, 48), set = r.pick(TRIPLES), nmv = r.shuffle(set.slice()), V = nmv[0];
          var nS = String(c.n), dS = String(c.d), opp, adj, hyp, lab;
          if (kind === 'oh') { opp = c.n; hyp = c.d; adj = Math.sqrt(hyp * hyp - opp * opp); lab = { opp: nS, hyp: dS }; }
          else if (kind === 'ah') { adj = c.n; hyp = c.d; opp = Math.sqrt(hyp * hyp - adj * adj); lab = { adj: nS, hyp: dS }; }
          else { opp = c.n; adj = c.d; lab = { opp: nS, adj: dS }; }
          var x = angCalc(kind, c.n, c.d), w = adj, hh = opp, q = hh / w; if (q > 2.8) w = hh / 2.8; if (q < 1 / 2.8) hh = w / 2.8;
          var figH = '<div class="fig">' + HW.tri({ w: w, h: hh, names: [V, nmv[1], nmv[2]], sides: { a: lab.opp, b: lab.adj, c: lab.hyp }, angles: { A: '?' }, rot: r.int(0, 3), flip: r.chance(0.5), width: 250 }) + '</div>';
          return nearPart('Determine the measure of ' + t('\\angle ' + V) + ', to the nearest degree.' + figH, x, 0, { unit: '°', before: t('\\angle ' + V + '\\approx'), alts: angAlts(kind, c.n, c.d, '\\angle ' + V, nS, dS, 0) },
            angSol(kind, c.n, c.d, nS, dS, V, '\\angle ' + V, x, 0), ANGHINTS, 'angle ' + kind + ' ' + nS + '/' + dS);
        } }] },
      { num: '2', outcome: 'M4', stem: 'Sides are in the diagram (not to scale).', parts: [
        { id: '2', outcome: 'M4', level: 'EMG', make: function (r) {
          var cx = r.pick(L4_CTX), s = cx.make(r), x = angCalc(s.k, s.n, s.d), alts = angAlts(s.k, s.n, s.d, '\\theta', s.nS, s.dS, 1);
          if (s.depr) alts = alts.map(function (a) { return a.code === 'other-angle' || a.code === 'ratio-flip' ? A(a.v, 'depr-vertical', 'That angle is measured from the <b>vertical</b>. An angle of depression is measured down from the <b>horizontal</b> line at the plane’s eye level.') : a; });
          return nearPart(s.text + s.fig(r, x), x, 1, { unit: '°', before: t('\\theta\\approx'), alts: alts }, angSol(s.k, s.n, s.d, s.nS, s.dS, '\\theta', '\\theta', x, 1, s.depr ? 'The angle of depression is measured down from the horizontal; it equals the angle of elevation from the runway, so the altitude is <b>opposite</b> it. ' : ''), ANGHINTS, cx.kind + ' ' + s.nS + '/' + s.dS);
        } }] },
      { num: '3', outcome: 'M4', stem: 'An isosceles triangle splits into two congruent right triangles.', parts: [
        { id: '3', outcome: 'M4', level: 'ADV', make: function (r) {
          var ctx = r.pick(['roof', 'tent', 'geo']);
          var p = find(function () { var L = ctx === 'geo' ? r.int(9, 40) : tenth(r, 2.5, 7.5), b = ctx === 'geo' ? r.int(8, 60) : tenth(r, 2.4, 11); return { L: L, b: b }; }, function (p) { var x = 2 * TR.asin(p.b / 2 / p.L); return p.b < 1.85 * p.L && x > 35 && x < 140 && safe(x, 0) && safe(x / 2, 0); }, { L: 5.2, b: 6.4 });
          var L = p.L, b = p.b, hb = b / 2, x = 2 * TR.asin(hb / L), Ls = ctx === 'geo' ? String(L) : fx(L, 1), bs = ctx === 'geo' ? String(b) : fx(b, 1), u = ctx === 'geo' ? 'cm' : 'm';
          var text = ctx === 'roof' ? 'The two sloping rafters of an A-frame cabin are each ' + t(Ls + '\\text{ m}') + ' long, and their feet are ' + t(bs + '\\text{ m}') + ' apart on the level floor. Determine the angle between the rafters at the peak, ' + t('x') + ', to the nearest degree.'
            : ctx === 'tent' ? 'The front of a tent is an isosceles triangle: the two sloping sides are each ' + t(Ls + '\\text{ m}') + ' long and the floor is ' + t(bs + '\\text{ m}') + ' wide. Determine the angle at the top of the tent, ' + t('x') + ', to the nearest degree.'
              : 'In isosceles ' + t('\\triangle VQR') + ', ' + t('VQ=VR=' + Ls + '\\text{ cm}') + ' and ' + t('QR=' + bs + '\\text{ cm}') + '. Determine ' + t('\\angle QVR=x') + ', to the nearest degree.';
          var half = TR.asin(hb / L);
          var alts = [A(half, 'half-angle', 'That is <b>half</b> of the angle: the altitude splits the angle at the top into two equal parts. Double it.'),
            A(TR.acos(hb / L), 'base-angle', 'That is a <b>base</b> angle (at the bottom corner). The question asks for the angle at the top, between the two equal sides.'),
            A(b < L ? 2 * TR.asin(b / L) : NaN, 'full-base', 'The right triangle has only <b>half</b> the base: ' + t(bs + '\\div 2') + ' is the side opposite half the top angle.'),
            A(b < L ? TR.asin(b / L) : NaN, 'full-base', 'Use half the base (' + t(bs + '\\div 2') + ') in the right triangle, and remember to double the angle you get.'),
            A(2 * TR.acos(hb / L), 'wrong-ratio', 'Relative to half the top angle, half the base is the <b>opposite</b> side (across from it) and ' + t(Ls) + ' is the hypotenuse: use ' + t('\\sin^{-1}') + '.'),
            A(2 * Math.asin(hb / L), 'radian', RAD_HINT)];
          return nearPart(text + isoFig({ L: L, b: b, bLab: bs + ' ' + u, LLab: Ls + ' ' + u, angLab: 'x', ground: ctx !== 'geo', names: ctx === 'geo' ? { V: 'V', Q: 'Q', R: 'R' } : false }), x, 0, { unit: '°', before: t('x\\approx'), alts: alts },
            'Draw the altitude from the top to the base. It meets the base at its midpoint and splits the triangle into two congruent right triangles, each with hypotenuse ' + t(Ls) + ', a leg of ' + t(bs + '\\div 2=' + F(cl(hb))) + ', and half the top angle.<br>' +
              t('\\sin\\left(\\tfrac{x}{2}\\right)=\\dfrac{' + F(cl(hb)) + '}{' + Ls + '}') + ', so ' + t('\\tfrac{x}{2}=\\sin^{-1}\\left(\\dfrac{' + F(cl(hb)) + '}{' + Ls + '}\\right)=' + dots(half) + '^{\\circ}') + '<br>' + t('x=2\\times ' + dots(half) + '^{\\circ}=' + dots(x) + '^{\\circ}\\approx ' + fx(x, 0) + '^{\\circ}'),
            ['Draw the altitude from the top: it cuts the base in half and cuts the top angle in half.', 'In one right triangle, half the base is opposite half the top angle and ' + t(Ls) + ' is the hypotenuse. Find that angle, then double it.'],
            'isosceles apex ' + ctx + ' ' + Ls + '/' + bs);
        } }] }]
  });

  /* ---------------- 9.5 ---------------- */
  HW.defineExit({
    lesson: 'u9l5', calc: true, outcome: 'M4',
    blurb: 'Choosing the Pythagorean theorem or a trigonometric ratio, a distance from an angle of depression, solving a right triangle completely from two sides, and a right triangle given by one leg and its area.',
    questions: [
      { num: '1', outcome: 'M4', stem: 'Decide whether to use the Pythagorean theorem or a trigonometric ratio.', parts: [
        { id: '1', outcome: 'M4', level: 'BEG', make: function (r) {
          var way = r.pick(['pyth-hyp', 'pyth-leg', 'trig']), unit = r.pick(['cm', 'm']);
          if (way === 'trig') {
            var deg = r.int(26, 64), roles = r.pick([['hyp', 'opp'], ['hyp', 'adj'], ['adj', 'opp']]), k = tenth(r, 6, 32), lab = {}; lab[roles[0]] = fx(k, 1) + ' ' + unit; lab[roles[1]] = 'x';
            return sidePart({ prompt: 'Calculate ' + t('x') + ', to the nearest tenth.' + triFig(r, deg, lab, null), deg: deg, k: k, kStr: fx(k, 1), kRole: roles[0], uRole: roles[1], uName: 'x', unit: unit, dp: 1,
              solPre: 'An acute angle and one side are known ' + t('\\Rightarrow') + ' use a <b>trigonometric ratio</b>.<br>', text: 'tool trig ' + roles.join('>') });
          }
          var a = tenth(r, 4, 18), b; do { b = tenth(r, 4, 18); } while (Math.abs(a - b) < 1.5);
          if (way === 'pyth-hyp') {
            var pc = pythCalc({ find: 'hyp', a: a, b: b, aStr: fx(a, 1), bStr: fx(b, 1), uName: 'x', unit: unit, dp: 1 });
            return nearPart('Calculate ' + t('x') + ', to the nearest tenth.' + triFig(r, Math.atan(a / b) * 180 / Math.PI, { opp: fx(a, 1) + ' ' + unit, adj: fx(b, 1) + ' ' + unit, hyp: 'x' }, null, { noAngle: true }), pc.x, 1, { unit: unit, alts: pc.alts, diag: pc.diag }, pc.sol, pc.hints, 'tool pyth hyp ' + a + ',' + b);
          }
          var c = rd(Math.max(a, b) + tenth(r, 2, 9), 1), L = Math.min(a, b);
          var pl = pythCalc({ find: 'leg', c: c, b: L, cStr: fx(c, 1), bStr: fx(L, 1), uName: 'x', unit: unit, dp: 1 });
          return nearPart('Calculate ' + t('x') + ', to the nearest tenth.' + triFig(r, Math.acos(L / c) * 180 / Math.PI, { adj: fx(L, 1) + ' ' + unit, hyp: fx(c, 1) + ' ' + unit, opp: 'x' }, null, { noAngle: true }), pl.x, 1, { unit: unit, alts: pl.alts, diag: pl.diag }, pl.sol, pl.hints, 'tool pyth leg ' + c + ',' + L);
        } }] },
      { num: '2', outcome: 'M4', stem: 'The angle of depression is measured down from the horizontal.', parts: [
        { id: '2', outcome: 'M4', level: 'EMG', make: function (r) {
          var ctx = r.pick(['lighthouse', 'balcony', 'helicopter']), th = r.int(9, 38), h = ctx === 'lighthouse' ? r.int(28, 75) : ctx === 'balcony' ? tenth(r, 12, 40) : r.int(120, 480), hs = ctx === 'balcony' ? fx(h, 1) : String(h), dp = ctx === 'balcony' ? 1 : 0;
          var text = ctx === 'lighthouse' ? 'From the top of a lighthouse ' + t(hs + '\\text{ m}') + ' above the water, the angle of depression of a sailboat is ' + t(dg(th)) + '. How far is the sailboat from the base of the lighthouse, to the nearest metre?'
            : ctx === 'balcony' ? 'From a balcony ' + t(hs + '\\text{ m}') + ' above level ground, the angle of depression of a parked bike is ' + t(dg(th)) + '. How far is the bike from the base of the building, to the nearest tenth of a metre?'
              : 'A helicopter hovers ' + t(hs + '\\text{ m}') + ' above level ground. The angle of depression from the helicopter to a landing pad is ' + t(dg(th)) + '. What is the horizontal distance to the landing pad, to the nearest metre?';
          var x = h / TR.tan(th), alts = [A(h * TR.tan(th), 'depr-vertical', 'The angle of depression is measured from the <b>horizontal</b>. In the right triangle it sits at the top, so the height is <b>opposite</b> it and the distance is <b>adjacent</b>: ' + t('\\tan ' + dg(th) + '=\\frac{' + hs + '}{d}') + ', so divide.'),
            A(h / TR.sin(th), 'u9x-sight', 'That is the <b>line of sight</b> (the slanted side). The question asks for the horizontal distance along the ground.'), A(h / TR.cos(th), 'wrong-ratio', 'Height and horizontal distance are the two legs: use ' + t('\\tan') + '.'), A(h * TR.sin(th), 'wrong-ratio', 'Height and horizontal distance are the two legs: use ' + t('\\tan') + '.'), A(h / Math.tan(th), 'radian', RAD_HINT)];
          return nearPart(text + deprFig({ th: th, hLab: hs + ' m', runLab: 'd', obj: ctx === 'lighthouse' ? 'tower' : ctx === 'balcony' ? 'cliff' : 'drone', top: 'helicopter', label: ctx === 'lighthouse' ? 'sailboat' : ctx === 'balcony' ? 'bike' : 'landing pad' }), x, dp, { unit: 'm', before: t('d\\approx'), alts: alts },
            'The angle of depression is between the horizontal and the line of sight. The horizontal at the top is parallel to the ground, so the angle of elevation from the ground up to the top is also ' + t(dg(th)) + ' (alternate angles). From that angle, the height ' + t(hs) + ' is <b>opposite</b> and ' + t('d') + ' is <b>adjacent</b> ' + t('\\Rightarrow') + ' TOA.<br>' +
              t('\\tan ' + dg(th) + '=\\dfrac{' + hs + '}{d}') + '<br>' + t('d=\\dfrac{' + hs + '}{\\tan ' + dg(th) + '}=' + dots(x) + '\\approx ' + fxT(x, dp) + '\\text{ m}'),
            ['Put the ' + t(dg(th)) + ' angle into the right triangle: an angle of depression equals the angle of elevation from the ground (alternate angles).', 'The height is opposite that angle and ' + t('d') + ' is adjacent. ' + t('d') + ' is in the denominator, so divide.'], 'depression ' + ctx + ' ' + hs + ' ' + th);
        } }] },
      { num: '3', outcome: 'M4', stem: 'Solve the triangle: find every unknown side and angle.', parts: [
        { id: '3', outcome: 'M4', level: 'PRG', make: function (r) {
          var n = names3(r), legs = r.chance(0.5), unit = r.pick(['cm', 'm']), p;
          p = find(function () { var a = tenth(r, 5, 30), b = legs ? tenth(r, 5, 30) : rd(a + tenth(r, 3, 20), 1); return { a: a, b: b }; },
            function (p) { var x = legs ? TR.atan(p.a / p.b) : TR.asin(p.a / p.b); return Math.abs(p.a - p.b) > 1.2 && x > 16 && x < 74 && safe(x, 0) && safe(legs ? Math.hypot(p.a, p.b) : Math.sqrt(p.b * p.b - p.a * p.a), 1); }, { a: 9.4, b: 13.8 });
          var opp = p.a, adj = legs ? p.b : Math.sqrt(p.b * p.b - p.a * p.a), hyp = legs ? Math.hypot(p.a, p.b) : p.b;
          var oS = sideOf(n, 'opp'), aS = sideOf(n, 'adj'), hS = sideOf(n, 'hyp'), angA = INV[legs ? 'tan' : 'sin'](legs ? opp / adj : opp / hyp), angB = 90 - angA;
          var unkS = legs ? hS : aS, unkX = legs ? hyp : adj;
          var UR = rd(unkX, 1), earlyA = legs ? [TR.asin(opp / UR), TR.acos(adj / UR)] : [TR.atan(opp / UR), TR.acos(UR / hyp)];
          var rA = Math.round(angA), RAH = 'Close — but you used the angle <b>rounded</b> to a whole degree. A rounded angle carries its error into the side: find the side from the two <b>given</b> sides (Pythagorean theorem).';
          var earlyS = (legs ? [opp / TR.sin(rA), adj / TR.cos(rA)] : [opp / TR.tan(rA), hyp * TR.cos(rA)]).map(function (v) { return A(v, 'early-round', RAH); });
          var pc = legs ? pythCalc({ find: 'hyp', a: opp, b: adj, aStr: fx(opp, 1), bStr: fx(adj, 1), uName: unkS, unit: unit, dp: 1 }) : pythCalc({ find: 'leg', c: hyp, b: opp, cStr: fx(hyp, 1), bStr: fx(opp, 1), uName: unkS, unit: unit, dp: 1 });
          var kind = legs ? 'oa' : 'oh', nS = fx(opp, 1), dS = legs ? fx(adj, 1) : fx(hyp, 1);
          var aAlts = angAlts(kind, opp, legs ? adj : hyp, '\\angle ' + n.ang, oS, legs ? aS : hS, 0);
          var lab = { opp: fx(opp, 1) + ' ' + unit }; if (legs) lab.adj = fx(adj, 1) + ' ' + unit; else lab.hyp = fx(hyp, 1) + ' ' + unit;
          var bCheck = unitWrap(K.near(angB, 0, { alts: [A(angA, 'u9x-same-angle', 'That is the size of ' + t('\\angle ' + n.ang) + '. The two acute angles add to ' + t('90^\\circ') + ', so ' + t('\\angle ' + n.oth) + ' is the other part.')], diag: function (v) { return v > 0 && v < 90 ? { code: 'u9x-not-90', hint: 'Check: the two acute angles of a right triangle add to ' + t('90^\\circ') + '. Use ' + t('90^\\circ-\\angle ' + n.ang) + '.' } : null; } }));
          return fieldsPart('Solve ' + t('\\triangle ' + n.tri) + ': give the side to the nearest tenth and the angles to the nearest degree.' + triFig(r, angA, lab, n, { noAngle: true }),
            [{ name: unkS, before: t(unkS + '\\approx'), after: unit, x: unkX, dp: 1, alts: pc.alts.concat(earlyS), diag: pc.diag },
              { name: '∠' + n.ang, before: t('\\angle ' + n.ang + '\\approx'), after: '°', x: angA, dp: 0, alts: aAlts, also: earlyA },
              { name: '∠' + n.oth, before: t('\\angle ' + n.oth + '\\approx'), after: '°', x: angB, dp: 0, check: bCheck, key: fx(angB, 0), show: t(fx(angB, 0) + '^\\circ'), bad: [fx(angA, 0)], also: earlyA.map(function (v) { return 90 - v; }) }],
            pc.sol + '<br>' + angSol(kind, opp, legs ? adj : hyp, oS, legs ? aS : hS, n.ang, '\\angle ' + n.ang, angA, 0) + '<br>' + t('\\angle ' + n.oth + '=90^\\circ-' + dots(angA) + '^{\\circ}\\approx ' + fx(angB, 0) + '^{\\circ}') + ' (the acute angles add to ' + t('90^\\circ') + ').',
            ['The third side comes from the Pythagorean theorem; an angle comes from an inverse ratio using the two given sides.', 'The two acute angles add to ' + t('90^\\circ') + '.'], 'solve SS ' + (legs ? 'legs' : 'leg+hyp') + ' ' + nS + ',' + dS);
        } }] },
      { num: '4', outcome: 'M4', stem: 'Only one side is given: the area gives you a second one. (Diagram not to scale.)', parts: [
        { id: '4', outcome: 'M4', level: 'ADV', make: function (r) {
          var s = find(function () { return { a: r.int(5, 16), b: r.int(4, 18) }; }, function (q) { var th = TR.atan(q.b / q.a); var hh = Math.hypot(q.a, q.b); return Math.abs(q.a - q.b) >= 2 && th > 18 && th < 72 && safe(th, 0) && safe(hh, 1) && Math.abs(hh - Math.round(hh)) > 1e-6; }, { a: 9, b: 14 });
          var a = s.a, b = s.b, Ar = a * b / 2, th = TR.atan(b / a), L = Math.hypot(a, b), sail = r.chance(0.5), rA = Math.round(th);
          var text = sail ? 'A sail is a right triangle. Its bottom edge, along the boom, is ' + t(a + '\\text{ m}') + ' long and meets the vertical mast at a right angle. The sail has an area of ' + t(F(Ar) + '\\text{ m}^2') + '. Determine the angle ' + t('\\theta') + ' between the boom and the slanted edge of the sail, to the nearest degree, and the length ' + t('L') + ' of the slanted edge, to the nearest tenth of a metre.'
            : 'A garden bed in the corner of a yard is a right triangle: two of its edges run along fences that meet at a right angle. The edge along one fence is ' + t(a + '\\text{ m}') + ' long and the bed covers ' + t(F(Ar) + '\\text{ m}^2') + '. Determine the angle ' + t('\\theta') + ' between that ' + t(a + '\\text{-m}') + ' edge and the slanted edge, to the nearest degree, and the length ' + t('L') + ' of the slanted edge, to the nearest tenth of a metre.';
          var halfB = Ar / a, RAH = 'Close — but you used the angle <b>rounded</b> to a whole degree. Find ' + t('L') + ' from the two legs (Pythagorean theorem), or keep the full angle.';
          var thAlts = [A(TR.atan(a / b), 'other-angle', 'That is the <b>other</b> acute angle. From ' + t('\\theta') + ', the ' + t(a + '\\text{ m}') + ' edge is <b>adjacent</b> and the edge you found from the area is <b>opposite</b>.'),
            A(TR.atan(halfB / a), 'u9x-area-half', 'Check the other leg: the area of a right triangle is ' + t('\\tfrac12\\times\\text{leg}\\times\\text{leg}') + ', so the leg is ' + t('\\dfrac{2\\times ' + F(Ar) + '}{' + a + '}=' + b) + ', not ' + t(F(Ar) + '\\div ' + a) + '.'),
            A(Math.atan(b / a), 'radian', RAD_HINT)];
          var LAlts = [A(Math.hypot(a, halfB), 'u9x-area-half', 'Check the other leg: ' + t('\\text{Area}=\\tfrac12(' + a + ')(\\text{leg})') + ', so the leg is ' + t('\\dfrac{2\\times ' + F(Ar) + '}{' + a + '}=' + b) + '.'), A(a + b, 'pyth-nosq', 'Square each leg first, add the squares, and then take the square root.'),
            A(Math.sqrt(Math.abs(b * b - a * a)), 'pyth-sub', t('L') + ' is across from the right angle — the <b>hypotenuse</b>, so <b>add</b> the squares of the legs.'), A(a / TR.cos(rA), 'early-round', RAH), A(b / TR.sin(rA), 'early-round', RAH)];
          return fieldsPart(text + triFig(r, th, { adj: a + ' m', hyp: 'L' }, null, { angLabel: 'θ' }),
            [{ name: 'θ', before: t('\\theta\\approx'), after: '°', x: th, dp: 0, alts: thAlts }, { name: 'L', before: t('L\\approx'), after: 'm', x: L, dp: 1, alts: LAlts }],
            'The other leg comes from the area: ' + t('\\tfrac12(' + a + ')(b)=' + F(Ar) + '\\ \\Rightarrow\\ b=\\dfrac{2(' + F(Ar) + ')}{' + a + '}=' + b + '\\text{ m}') + '.<br>' +
              'From ' + t('\\theta') + ': the ' + t(a + '\\text{ m}') + ' edge is adjacent and the ' + t(b + '\\text{ m}') + ' leg is opposite ' + t('\\Rightarrow') + ' <b>TOA</b>: ' + t('\\theta=\\tan^{-1}\\left(\\dfrac{' + b + '}{' + a + '}\\right)=' + dots(th) + '^{\\circ}\\approx ' + fx(th, 0) + '^{\\circ}') + '<br>' +
              'Two legs known ' + t('\\Rightarrow') + ' <b>Pythagorean theorem</b>: ' + t('L=\\sqrt{' + a + '^2+' + b + '^2}=\\sqrt{' + (a * a + b * b) + '}=' + dots(L) + '\\approx ' + fx(L, 1) + '\\text{ m}'),
            ['The two edges along the right angle are the legs, so ' + t('\\text{Area}=\\tfrac12\\times\\text{leg}\\times\\text{leg}') + '. Use it to find the missing leg.', 'Then two legs give ' + t('\\theta') + ' (which ratio uses opposite and adjacent?) and ' + t('L') + ' (Pythagorean theorem).'], 'area to angle ' + (sail ? 'sail ' : 'bed ') + a + ',' + b);
        } }] }]
  });

  /* ---------------- 9.6 ---------------- */
  HW.defineExit({
    lesson: 'u9l6', calc: true, outcome: 'M4',
    blurb: 'A height from an angle of elevation, an eye-level problem (height or distance), and a speed from an angle of depression.',
    questions: [
      { num: '1', outcome: 'M4', stem: 'Angles of elevation are measured up from the horizontal.', parts: [
        { id: '1', outcome: 'M4', level: 'BEG', make: function (r) {
          var ctx = r.pick(['drone', 'balloon', 'tower']), d = ctx === 'tower' ? r.int(45, 160) : r.int(30, 120), th = r.int(22, 64);
          var what = ctx === 'drone' ? 'a drone hovering directly above a point ' + t('P') : ctx === 'balloon' ? 'a hot-air balloon tied directly above a point ' + t('P') : 'the top of a cell tower whose base is ' + t('P');
          var text = 'From a spot on level ground ' + t(d + '\\text{ m}') + ' from ' + t('P') + ', the angle of elevation of ' + what + ' is ' + t(dg(th)) + '. Determine the height ' + t('h') + ', to the nearest metre.';
          return sidePart({ prompt: text + slopeFig({ deg: th, labH: d + ' m', labV: 'h', labS: '', obj: ctx === 'tower' ? 'pole' : 'none', flip: r.chance(0.5), extra: ctx === 'tower' ? [] : [{ type: 'text', at: [0, 4 * Math.tan(vis(th, 18, 72) * Math.PI / 180) + 0.5], text: ctx }] }),
            deg: th, k: d, kStr: String(d), kRole: 'adj', uRole: 'opp', uName: 'h', unit: 'm', dp: 0, text: 'elevation ' + ctx + ' ' + d + ' ' + th });
        } }] },
      { num: '2', outcome: 'M4', stem: 'The angle is measured from eye level, not from the ground.', parts: [
        { id: '2', outcome: 'M4', level: 'PRG', make: function (r) {
          var who = r.pick(['Maya', 'Ravi', 'Lena', 'Omar', 'Tia', 'Jonah']), e = r.int(145, 185) / 100, es = fx(e, 2), th = r.int(18, 48), findH = r.chance(0.5), obj = r.pick(['building', 'pole', 'tree']);
          var objW = obj === 'building' ? 'an office building' : obj === 'pole' ? 'a flagpole' : 'a tree';
          if (findH) {
            var d = r.int(22, 80), x = e + d * TR.tan(th);
            return nearPart(who + '’s eyes are ' + t(es + '\\text{ m}') + ' above level ground. Standing ' + t(d + '\\text{ m}') + ' from the base of ' + objW + ', ' + who + ' measures the angle of elevation of the top, from eye level, as ' + t(dg(th)) + '. Determine the height of ' + objW.replace(/^an? /, 'the ') + ', to the nearest tenth of a metre.' + eyeScene({ th: th, runLab: d + ' m', eyeLab: es + ' m', topLab: 'H', obj: obj }),
              x, 1, { unit: 'm', before: t('H\\approx'), alts: [A(d * TR.tan(th), 'eye-height', 'That is only the rise <b>above eye level</b>. The angle was measured from ' + who + '’s eyes, so add the eye height ' + t(es + '\\text{ m}') + '.'), A(d * TR.tan(th) - e, 'eye-sub', 'The top is <b>higher</b> than the eye line, so add the eye height — don’t subtract it.'),
                A(e + d / TR.tan(th), 'mult-div', 'The rise is <b>opposite</b> the angle and the ' + t(d + '\\text{ m}') + ' is adjacent: ' + t('\\text{rise}=' + d + '\\tan ' + dg(th)) + ' (multiply).'), A(e + d * TR.sin(th), 'wrong-ratio', 'Opposite and adjacent are the two legs: use ' + t('\\tan') + '.'), A(e + d * Math.tan(th), 'radian', RAD_HINT)] },
              'From eye level, the rise ' + t('y') + ' to the top is <b>opposite</b> the ' + t(dg(th)) + ' angle and the ' + t(d + '\\text{ m}') + ' is <b>adjacent</b>:<br>' + t('y=' + d + '\\tan ' + dg(th) + '=' + dots(d * TR.tan(th)) + '\\text{ m}') + '<br>Add the eye height: ' + t('H=' + dots(d * TR.tan(th)) + '+' + es + '=' + dots(x) + '\\approx ' + fx(x, 1) + '\\text{ m}'),
              ['Trigonometry gives only the rise from eye level up to the top.', 'Then add the eye height to get the full height from the ground.'], 'eye height ' + d + ' ' + th + ' ' + es);
          }
          var H = r.int(14, 60) + r.int(0, 9) / 10, Hs = fx(H, 1), xd = (H - e) / TR.tan(th);
          return nearPart(who + '’s eyes are ' + t(es + '\\text{ m}') + ' above level ground. ' + who + ' looks up at the top of ' + objW + ' that is ' + t(Hs + '\\text{ m}') + ' tall; the angle of elevation from eye level is ' + t(dg(th)) + '. How far is ' + who + ' from the base, to the nearest tenth of a metre?' + eyeScene({ th: th, runLab: 'd', eyeLab: es + ' m', topLab: Hs + ' m', obj: obj }),
            xd, 1, { unit: 'm', before: t('d\\approx'), alts: [A(H / TR.tan(th), 'eye-height', 'The angle is measured from eye level, so the side opposite it is only the part of the height <b>above the eyes</b>: ' + t(Hs + '-' + es) + '.'), A((H + e) / TR.tan(th), 'u9x-eye-add', 'Subtract the eye height — the eye line is ' + t(es + '\\text{ m}') + ' <b>above</b> the ground, so the rise above it is less than ' + t(Hs) + '.'),
              A((H - e) * TR.tan(th), 'mult-div', t('d') + ' is the <b>adjacent</b> side, in the denominator of ' + t('\\tan') + ': ' + t('d=\\frac{\\text{rise}}{\\tan ' + dg(th) + '}') + '.'), A((H - e) / TR.sin(th), 'u9x-sight', 'That is the line of sight (the slanted side). The question asks for the distance along the ground.'), A((H - e) / Math.tan(th), 'radian', RAD_HINT)] },
            'The angle is measured from eye level, so the side opposite it is the rise above the eyes: ' + t(Hs + '-' + es + '=' + fx(H - e, 2) + '\\text{ m}') + '. The distance ' + t('d') + ' is adjacent ' + t('\\Rightarrow') + ' TOA.<br>' + t('\\tan ' + dg(th) + '=\\dfrac{' + fx(H - e, 2) + '}{d}') + '<br>' + t('d=\\dfrac{' + fx(H - e, 2) + '}{\\tan ' + dg(th) + '}=' + dots(xd) + '\\approx ' + fx(xd, 1) + '\\text{ m}'),
            ['The triangle starts at eye level: subtract the eye height from the full height first.', 'The distance is adjacent to the angle and in the denominator of tangent: divide.'], 'eye distance ' + Hs + ' ' + th + ' ' + es);
        } }] },
      { num: '3', outcome: 'M4', stem: 'Distance first, then speed.', parts: [
        { id: '3', outcome: 'M4', level: 'ADV', make: function (r) {
          var h = r.int(40, 120), th = r.int(12, 34), tt = r.int(4, 12), d = h / TR.tan(th), v = d / tt * 3.6;
          var s = find(function () { return { h: r.int(40, 120), th: r.int(12, 34), tt: r.int(4, 12) }; }, function (s) { var vv = s.h / TR.tan(s.th) / s.tt * 3.6; return vv > 30 && vv < 130 && safe(vv, 0); }, { h: h, th: th, tt: tt });
          h = s.h; th = s.th; tt = s.tt; d = h / TR.tan(th); v = d / tt * 3.6;
          var veh = r.pick(['car', 'truck', 'motorcycle']);
          var alts = [A(d / tt, 'speed-units', 'That is the speed in <b>metres per second</b>. Change to km/h: multiply by ' + t('3600') + ' s/h and divide by ' + t('1000') + ' m/km (that is, ' + t('\\times 3.6') + ').'), A(d / tt / 3.6, 'speed-units', 'To change m/s to km/h, multiply by ' + t('3.6') + ' (a km/h value is the bigger number).'),
            A(h * TR.tan(th) / tt * 3.6, 'depr-vertical', 'The angle of depression is measured from the <b>horizontal</b>. The height is opposite it and the ground distance is adjacent: ' + t('d=\\frac{' + h + '}{\\tan ' + dg(th) + '}') + '.'),
            A(h / TR.sin(th) / tt * 3.6, 'u9x-sight', 'That uses the line of sight (the slanted side). The ' + veh + ' drives along the <b>ground</b>, the horizontal distance.'), A(h / Math.tan(th) / tt * 3.6, 'radian', RAD_HINT),
            A(rd(d, 0) / tt * 3.6, 'early-round', EARLY)];
          return nearPart('A drone hovers ' + t(h + '\\text{ m}') + ' above a straight, level road. The angle of depression from the drone to an approaching ' + veh + ' is ' + t(dg(th)) + '. The ' + veh + ' passes directly beneath the drone ' + t(tt + '\\text{ s}') + ' later. Assuming a constant speed, how fast is the ' + veh + ' going, in km/h, to the nearest whole number?' + deprFig({ th: th, hLab: h + ' m', runLab: 'd', obj: 'drone', label: veh }),
            v, 0, { unit: 'km/h', alts: alts, also: [rd(d, 0) / tt * 3.6, rd(d, 1) / tt * 3.6] },
            'Distance: the angle of depression equals the angle of elevation from the road, and the height is opposite it ' + t('\\Rightarrow') + ' TOA:<br>' + t('d=\\dfrac{' + h + '}{\\tan ' + dg(th) + '}=' + dots(d) + '\\text{ m}') + '<br>Speed: ' + t('\\dfrac{' + dots(d) + '\\text{ m}}{' + tt + '\\text{ s}}=' + dots(d / tt) + '\\text{ m/s}') + '<br>' + t(dots(d / tt) + '\\text{ m/s}\\times\\dfrac{3600\\text{ s}}{1\\text{ h}}\\times\\dfrac{1\\text{ km}}{1000\\text{ m}}=' + dots(v) + '\\approx ' + fx(v, 0) + '\\text{ km/h}'),
            ['First find the horizontal distance ' + t('d') + ' from the ' + veh + ' to the point under the drone (the height is opposite the angle).', 'Speed = distance ÷ time gives m/s; multiply by ' + t('3.6') + ' to get km/h.'], 'drone speed ' + h + ' ' + th + ' ' + tt);
        } }] }]
  });

  /* ---------------- 9.7 ---------------- */
  HW.defineExit({
    lesson: 'u9l7', calc: true, outcome: 'M4',
    blurb: 'The shared side of two right triangles, a total from two triangles that share a side, and a difference from two angles of depression.',
    questions: [
      { num: '1', outcome: 'M4', stem: 'Two right triangles share the side ' + t('BD') + '.', parts: [
        { id: '1', outcome: 'M4', level: 'BEG', make: function (r) {
          var a = r.int(28, 62), c = r.int(25, 65), viaHyp = r.chance(0.5), k = tenth(r, 6, 24), ks = fx(k, 1), BD = viaHyp ? k * TR.sin(a) : k * TR.tan(a);
          var ad = viaHyp ? k * TR.cos(a) : k, dc = BD / TR.tan(c);
          var lab = viaHyp ? { LP: ks + ' cm' } : { LF: ks + ' cm' };
          var figS = altFig({ names: { L: 'A', F: 'D', R: 'C', P: 'B' }, l: ad, rr: dc, h: BD, lab: lab, ang: { L: a + '°', R: c + '°' } });
          return sidePart({ prompt: 'In the diagram, ' + t('BD\\perp AC') + ', ' + t((viaHyp ? 'AB' : 'AD') + '=' + ks + '\\text{ cm}') + ', ' + t('\\angle A=' + dg(a)) + ' and ' + t('\\angle C=' + dg(c)) + '. Determine the length of the shared side ' + t('BD') + ', to the nearest tenth of a centimetre.' + figS,
            deg: a, k: k, kStr: ks, kRole: viaHyp ? 'hyp' : 'adj', uRole: 'opp', kName: viaHyp ? 'AB' : 'AD', uName: 'BD', unit: 'cm', dp: 1, angTex: '\\angle A',
            solPre: 'Use the triangle where two measurements are known: ' + t('\\triangle ABD') + ' (right angle at ' + t('D') + '). ' + t('\\angle C') + ' isn’t needed for ' + t('BD') + '.<br>', text: 'shared side ' + (viaHyp ? 'hyp' : 'adj') + ' ' + ks + ' ' + a });
        } }] },
      { num: '2', outcome: 'M4', stem: 'Find a piece in each right triangle, then combine them. Keep full calculator values until the end.', parts: [
        { id: '2', outcome: 'M4', level: 'PRG', make: function (r) {
          var ctx = r.pick(['wires', 'tree']), h = ctx === 'wires' ? tenth(r, 8, 24) : tenth(r, 9, 22), a = r.int(40, 68), b; do { b = r.int(30, 65); } while (Math.abs(a - b) < 6);
          var hs = fx(h, 1), p1 = h / TR.tan(a), p2 = h / TR.tan(b), x = p1 + p2;
          var text = ctx === 'wires' ? 'A vertical pole ' + t(hs + '\\text{ m}') + ' tall is held by two guy wires from its top to the ground, on opposite sides of the pole. One wire makes an angle of ' + t(dg(a)) + ' with the ground and the other makes ' + t(dg(b)) + '. How far apart are the two anchor points, to the nearest tenth of a metre?'
            : 'Two friends stand on level ground on opposite sides of a tree ' + t(hs + '\\text{ m}') + ' tall, in line with its base. From the ground, the angles of elevation of the treetop are ' + t(dg(a)) + ' and ' + t(dg(b)) + '. How far apart are the friends, to the nearest tenth of a metre?';
          var alts = [A(p1 + p2 > 0 ? rd(p1, 1) + rd(p2, 1) : NaN, 'early-round', EARLY), A(Math.max(p1, p2), 'ch-one-piece', 'That is only one of the two pieces. The total distance is the piece from <b>each</b> triangle added together.'), A(Math.min(p1, p2), 'ch-one-piece', 'That is only one of the two pieces. The total distance is the piece from <b>each</b> triangle added together.'),
            A(h * TR.tan(a) + h * TR.tan(b), 'mult-div', 'Each piece is the <b>adjacent</b> side, in the denominator of ' + t('\\tan') + ': piece ' + t('=\\frac{' + hs + '}{\\tan\\theta}') + ' (divide).'), A(Math.abs(p1 - p2), 'u9x-diff', 'The two pieces are on <b>opposite</b> sides of the ' + (ctx === 'wires' ? 'pole' : 'tree') + ', so add them.'),
            A(h / Math.tan(a) + h / Math.tan(b), 'radian', RAD_HINT)];
          return nearPart(text + altFig({ names: { L: 'P', F: 'F', R: 'Q', P: 'T' }, l: p1, rr: p2, h: h, lab: { FP: hs + ' m' }, ang: { L: a + '°', R: b + '°' }, showNames: false, fpStyle: { width: ctx === 'wires' ? 3.4 : 2.2 }, extra: [{ type: 'ground', y: 0, x0: -p1 - 0.6, x1: p2 + 0.6 }] }),
            x, 1, { unit: 'm', alts: alts, also: [rd(p1, 1) + rd(p2, 1), rd(p1, 2) + rd(p2, 2)] },
            'The ' + (ctx === 'wires' ? 'pole' : 'tree') + ' is the shared side of two right triangles; in each, it is <b>opposite</b> the given angle and the ground piece is <b>adjacent</b> ' + t('\\Rightarrow') + ' TOA.<br>' + t('x_1=\\dfrac{' + hs + '}{\\tan ' + dg(a) + '}=' + dots(p1)) + ' m<br>' + t('x_2=\\dfrac{' + hs + '}{\\tan ' + dg(b) + '}=' + dots(p2)) + ' m<br>' + t('x_1+x_2=' + dots(x) + '\\approx ' + fx(x, 1) + '\\text{ m}'),
            ['In each right triangle the height ' + t(hs) + ' is opposite the angle and the ground piece is adjacent. Use tan and divide.', 'The two pieces are on opposite sides, so add them. Round only at the end.'], 'sum ' + ctx + ' ' + hs + ' ' + a + ',' + b);
        } }] },
      { num: '3', outcome: 'M4', stem: 'Both points are on the same side, in a straight line with the point below the observer.', parts: [
        { id: '3', outcome: 'M4', level: 'ADV', make: function (r) {
          var s = find(function () { var a = r.int(34, 62), b = r.int(14, a - 8); return { h: r.int(60, 240), a: a, b: b }; }, function (s) { var v = s.h / TR.tan(s.b) - s.h / TR.tan(s.a); return v > 20 && safe(v, 1); }, { h: 150, a: 48, b: 27 });
          var h = s.h, a = s.a, b = s.b, near1 = h / TR.tan(a), far1 = h / TR.tan(b), x = far1 - near1, ctx = r.pick(['balloon', 'cliff']);
          var text = ctx === 'balloon' ? 'A hot-air balloon is ' + t(h + '\\text{ m}') + ' directly above a point ' + t('G') + ' on level farmland. From the balloon, the angles of depression of two barns that are due east of ' + t('G') + ' are ' + t(dg(a)) + ' and ' + t(dg(b)) + '. How far apart are the barns, to the nearest tenth of a metre?'
            : 'From the top of a cliff ' + t(h + '\\text{ m}') + ' above the sea, an observer sees two buoys in a straight line out from the base of the cliff. The angles of depression of the buoys are ' + t(dg(a)) + ' and ' + t(dg(b)) + '. How far apart are the buoys, to the nearest tenth of a metre?';
          var alts = [A(far1 + near1, 'u9x-sum', 'Both points are on the <b>same</b> side, so the gap between them is the far distance <b>minus</b> the near distance.'), A(rd(far1, 1) - rd(near1, 1), 'early-round', EARLY), A(rd(far1, 0) - rd(near1, 0), 'early-round', EARLY),
            A(h / TR.tan(a - b), 'u9x-angle-diff', 'The angle between the two lines of sight is not an angle of a right triangle with the gap as a side. Find each horizontal distance in its own right triangle, then subtract.'),
            A(h * TR.tan(a) - h * TR.tan(b) > 0 ? h * TR.tan(a) - h * TR.tan(b) : h * TR.tan(b) - h * TR.tan(a), 'depr-vertical', 'An angle of depression is measured from the <b>horizontal</b>; the height is <b>opposite</b> it, so each distance is ' + t('\\frac{' + h + '}{\\tan\\theta}') + '.'),
            A(Math.abs(h / Math.tan(b) - h / Math.tan(a)), 'radian', RAD_HINT), A(far1, 'ch-one-piece', 'That is the distance to the <b>farther</b> point only. Subtract the distance to the nearer point.')];
          return nearPart(text + twoDeprFig({ a: a, b: b, h: h, hLab: h + ' m', dashH: ctx === 'balloon', topText: ctx === 'balloon' ? 'balloon' : null, nName: ctx === 'balloon' ? 'barn' : 'buoy', mName: ctx === 'balloon' ? 'barn' : 'buoy' }), x, 1, { unit: 'm', alts: alts, also: [rd(far1, 1) - rd(near1, 1), rd(far1, 2) - rd(near1, 2)] },
            'Each angle of depression equals the angle of elevation from that point up to the observer, and the height ' + t(h) + ' is opposite it ' + t('\\Rightarrow') + ' TOA, distance in the denominator.<br>Near point (' + t(dg(a)) + '): ' + t('\\dfrac{' + h + '}{\\tan ' + dg(a) + '}=' + dots(near1)) + ' m<br>Far point (' + t(dg(b)) + '): ' + t('\\dfrac{' + h + '}{\\tan ' + dg(b) + '}=' + dots(far1)) + ' m<br>Gap: ' + t(dots(far1) + '-' + dots(near1) + '=' + dots(x) + '\\approx ' + fx(x, 1) + '\\text{ m}'),
            ['The larger angle of depression belongs to the nearer point. Find each horizontal distance in its own right triangle.', 'The points are on the same side: subtract the near distance from the far distance. Keep full values until the end.'], 'difference ' + ctx + ' ' + h + ' ' + a + ',' + b);
        } }] }]
  });

  /* ---------------- 9.8 (unit review) ---------------- */
  var L8_ANG = [
    { kind: 'ramp', make: function (r) { var p = find(function () { return { h: r.int(40, 95) / 100, d: tenth(r, 4.5, 11.5) }; }, function (p) { return safe(angCalc('oa', p.h, p.d), 1); }, { h: 0.6, d: 7.2 }); return { k: 'oa', n: p.h, d: p.d, nS: fx(p.h, 2), dS: fx(p.d, 1),
      text: 'A wheelchair ramp rises ' + t(fx(p.h, 2) + '\\text{ m}') + ' over a horizontal distance of ' + t(fx(p.d, 1) + '\\text{ m}') + '. Determine the angle ' + t('\\theta') + ' between the ramp and the ground, to the nearest tenth of a degree.', fig: function (r, x) { return slopeFig({ deg: x, labH: fx(p.d, 1) + ' m', labV: fx(p.h, 2) + ' m', labS: '', obj: 'ramp', angLab: 'θ', flip: r.chance(0.5) }); } }; } },
    { kind: 'zip', make: function (r) { var p = find(function () { return { L: r.int(90, 260), h: r.int(12, 60) }; }, function (p) { return p.h < p.L / 3 && safe(angCalc('oh', p.h, p.L), 1); }, { L: 145, h: 32 }); return { k: 'oh', n: p.h, d: p.L, nS: String(p.h), dS: String(p.L), depr: true,
      text: 'A straight zip-line cable is ' + t(p.L + '\\text{ m}') + ' long and its lower end is ' + t(p.h + '\\text{ m}') + ' below its upper end. Determine the angle of depression ' + t('\\theta') + ' of the cable from its upper end, to the nearest tenth of a degree.', fig: function (r, x) { return deprFig({ th: x, hLab: p.n + ' m', runLab: '', sightLab: p.L + ' m', obj: 'tower', angLab: 'θ' }); } }; } },
    { kind: 'flag', make: function (r) { var p = find(function () { return { h: tenth(r, 6, 18), s: tenth(r, 4, 20) }; }, function (p) { return Math.abs(p.h - p.s) > 0.8 && safe(angCalc('oa', p.h, p.s), 1); }, { h: 11.4, s: 8.6 }); return { k: 'oa', n: p.h, d: p.s, nS: fx(p.h, 1), dS: fx(p.s, 1),
      text: 'A flagpole ' + t(fx(p.h, 1) + '\\text{ m}') + ' tall casts a shadow ' + t(fx(p.s, 1) + '\\text{ m}') + ' long on level ground. Determine the angle of elevation of the sun, ' + t('\\theta') + ', to the nearest tenth of a degree.', fig: function (r, x) { return slopeFig({ deg: x, labH: fx(p.s, 1) + ' m', labV: fx(p.h, 1) + ' m', labS: '', obj: 'pole', angLab: 'θ', flip: r.chance(0.5) }); } }; } }];
  HW.defineExit({
    lesson: 'u9l8', calc: true, outcome: 'M4',
    blurb: 'Unit 9 review mix: a missing side, an angle in a context, solving a right triangle from an angle and a side, and two angles of elevation to one tower.',
    questions: [
      { num: '1', outcome: 'M4', stem: 'Round to the nearest tenth.', parts: [
        { id: '1', outcome: 'M4', level: 'BEG', make: function (r) {
          var n = names3(r), deg = r.int(24, 66), roles = r.pick([['hyp', 'opp'], ['hyp', 'adj'], ['adj', 'opp']]), unit = r.pick(['cm', 'm', 'mm']), k = unit === 'mm' ? r.int(60, 400) : tenth(r, 5, 40), ks = unit === 'mm' ? String(k) : fx(k, 1);
          var kS = sideOf(n, roles[0]), uS = sideOf(n, roles[1]), lab = {}; lab[roles[0]] = ks + ' ' + unit; lab[roles[1]] = '?';
          return sidePart({ prompt: 'Determine the length of ' + t(uS) + '.' + triFig(r, deg, lab, n), deg: deg, k: k, kStr: ks, kRole: roles[0], uRole: roles[1], kName: kS, uName: uS, unit: unit, dp: 1, angTex: '\\angle ' + n.ang, text: 'review side ' + roles.join('>') + ' ' + ks + ' ' + deg });
        } }] },
      { num: '2', outcome: 'M4', stem: 'The diagram is not to scale.', parts: [
        { id: '2', outcome: 'M4', level: 'EMG', make: function (r) {
          var cx = r.pick(L8_ANG), s = cx.make(r), x = angCalc(s.k, s.n, s.d), alts = angAlts(s.k, s.n, s.d, '\\theta', s.nS, s.dS, 1);
          if (s.depr) alts = alts.map(function (a) { return a.code === 'other-angle' ? A(a.v, 'depr-vertical', 'That angle is measured from the <b>vertical</b>. An angle of depression is measured down from the <b>horizontal</b>.') : a; });
          return nearPart(s.text + s.fig(r, x), x, 1, { unit: '°', before: t('\\theta\\approx'), alts: alts }, angSol(s.k, s.n, s.d, s.nS, s.dS, '\\theta', '\\theta', x, 1), ANGHINTS, 'review angle ' + cx.kind + ' ' + s.nS + '/' + s.dS);
        } }] },
      { num: '3', outcome: 'M4', stem: 'Solve the triangle: find every unknown side and angle.', parts: [
        { id: '3', outcome: 'M4', level: 'PRG', make: function (r) {
          var n = names3(r), deg = r.int(24, 66), kRole = r.pick(['hyp', 'opp', 'adj']), unit = r.pick(['cm', 'm']), k = tenth(r, 8, 45), ks = fx(k, 1);
          var others = ['opp', 'adj', 'hyp'].filter(function (q) { return q !== kRole; }), kS = sideOf(n, kRole);
          var s1 = solveSide({ deg: deg, k: k, kStr: ks, kRole: kRole, uRole: others[0], kName: kS, uName: sideOf(n, others[0]), unit: unit, dp: 1, angTex: '\\angle ' + n.ang });
          var s2 = solveSide({ deg: deg, k: k, kStr: ks, kRole: kRole, uRole: others[1], kName: kS, uName: sideOf(n, others[1]), unit: unit, dp: 1, angTex: '\\angle ' + n.ang });
          var lab = {}; lab[kRole] = ks + ' ' + unit; var B = 90 - deg;
          /* the second side found by the Pythagorean theorem from the first, rounded: accepted (one place off at most) */
          var viaP = function (bR, uR, u) { return bR === 'hyp' ? Math.sqrt(k * k + u * u) : uR === 'hyp' ? Math.sqrt(Math.max(0, u * u - k * k)) : Math.sqrt(Math.max(0, k * k - u * u)); };
          var also1 = [viaP(others[0], others[1], rd(s2.x, 1))], also2 = [viaP(others[1], others[0], rd(s1.x, 1))];
          var bCheck = unitWrap(K.number(B, function (v) { if (v === deg) return { code: 'u9x-same-angle', hint: 'That is ' + t('\\angle ' + n.ang) + '. The two acute angles add to ' + t('90^\\circ') + '.' }; if (v === 180 - deg) return { code: 'u9x-not-90', hint: 'The angles of a triangle add to ' + t('180^\\circ') + ', and one of them is the right angle: ' + t('90^\\circ-' + dg(deg)) + '.' }; return null; }));
          return fieldsPart('Solve ' + t('\\triangle ' + n.tri) + ' (sides to the nearest tenth).' + triFig(r, deg, lab, n),
            [{ name: '∠' + n.oth, before: t('\\angle ' + n.oth + '='), after: '°', check: bCheck, key: String(B), show: t(B + '^\\circ'), bad: [String(deg), String(180 - deg)] },
              { name: sideOf(n, others[0]), before: t(sideOf(n, others[0]) + '\\approx'), after: unit, x: s1.x, dp: 1, alts: s1.alts, diag: s1.diag, also: also1 },
              { name: sideOf(n, others[1]), before: t(sideOf(n, others[1]) + '\\approx'), after: unit, x: s2.x, dp: 1, alts: s2.alts, diag: s2.diag, also: also2 }],
            t('\\angle ' + n.oth + '=90^\\circ-' + dg(deg) + '=' + dg(B)) + '.<br><b>' + t(sideOf(n, others[0])) + '</b>: ' + s1.sol + '<br><b>' + t(sideOf(n, others[1])) + '</b>: ' + s2.sol + '<br>(Use the given side each time — not a rounded answer — so a rounding error doesn’t carry forward.)',
            ['The acute angles add to ' + t('90^\\circ') + '. For each side, name it (opposite, adjacent, hypotenuse) relative to ' + t('\\angle ' + n.ang) + ' and pick the ratio with the given side.', 'Use the given side ' + t(kS + '=' + ks) + ' in both ratios.'], 'review solve ' + kRole + ' ' + ks + ' ' + deg);
        } }] },
      { num: '4', outcome: 'M4', stem: 'Points ' + t('P') + ' and ' + t('Q') + ' are in a straight line with the base ' + t('B') + ' of the tower, on the same side.', parts: [
        { id: '4', outcome: 'M4', level: 'ADV', make: function (r) {
          var s = find(function () { var a2 = r.int(36, 66), a1 = r.int(16, a2 - 9); return { h: r.int(25, 120), a1: a1, a2: a2 }; }, function (s) { var v = s.h / TR.tan(s.a1) - s.h / TR.tan(s.a2); return v > 8 && safe(v, 1); }, { h: 60, a1: 24, a2: 41 });
          var h = s.h, a1 = s.a1, a2 = s.a2, PB = h / TR.tan(a1), QB = h / TR.tan(a2), x = PB - QB;
          var alts = [A(PB + QB, 'u9x-sum', t('P') + ' and ' + t('Q') + ' are on the <b>same</b> side of the tower, so ' + t('PQ=PB-QB') + '.'), A(rd(PB, 1) - rd(QB, 1), 'early-round', EARLY), A(h / TR.tan(a2 - a1), 'u9x-angle-diff', 'The angle between the two lines of sight is not in a right triangle with ' + t('PQ') + '. Find ' + t('PB') + ' and ' + t('QB') + ' in their own right triangles, then subtract.'),
            A(Math.abs(h * TR.tan(a2) - h * TR.tan(a1)), 'mult-div', 'Each ground distance is the <b>adjacent</b> side, in the denominator of tangent: ' + t('PB=\\frac{' + h + '}{\\tan ' + dg(a1) + '}') + '.'), A(PB, 'ch-one-piece', 'That is ' + t('PB') + ', the whole distance from ' + t('P') + ' to the tower. Subtract ' + t('QB') + '.'), A(Math.abs(h / Math.tan(a1) - h / Math.tan(a2)), 'radian', RAD_HINT)];
          return nearPart('A tower ' + t('BT') + ' is ' + t(h + '\\text{ m}') + ' tall. The angle of elevation of the top ' + t('T') + ' is ' + t(dg(a1)) + ' from ' + t('P') + ' and ' + t(dg(a2)) + ' from ' + t('Q') + '. Determine the distance ' + t('PQ') + ', to the nearest tenth of a metre.' + twoElevFig({ a1: a1, a2: a2, hLab: h + ' m' }), x, 1, { unit: 'm', before: t('PQ\\approx'), alts: alts, also: [rd(PB, 1) - rd(QB, 1), rd(PB, 2) - rd(QB, 2)] },
            'In each right triangle the tower is <b>opposite</b> the angle and the ground distance is <b>adjacent</b> ' + t('\\Rightarrow') + ' TOA, distance in the denominator.<br>' + t('PB=\\dfrac{' + h + '}{\\tan ' + dg(a1) + '}=' + dots(PB)) + ' m<br>' + t('QB=\\dfrac{' + h + '}{\\tan ' + dg(a2) + '}=' + dots(QB)) + ' m<br>' + t('PQ=PB-QB=' + dots(x) + '\\approx ' + fx(x, 1) + '\\text{ m}'),
            ['Find ' + t('PB') + ' in right triangle ' + t('PBT') + ' and ' + t('QB') + ' in right triangle ' + t('QBT') + '.', t('PQ=PB-QB') + '. Keep full calculator values until the end.'], 'review two elev ' + h + ' ' + a1 + ',' + a2);
        } }] }]
  });
})(window);
