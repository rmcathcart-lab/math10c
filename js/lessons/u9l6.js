/* Math 10C · Unit 9 · Lesson 6 — Multi-Step Trigonometry: Eye Level, Elevation and Depression (M4)
 * Assignment questions 1–11 (u9_L06.tex; 9–11 are the booklet's bearings extension) and the Lesson 6 Extra Practice
 * (u9_EP06.tex, questions 1–18). Every part is a constrained generator: the booklet's numbers are one possible version.
 * Scene figures use HW.fig (eye level, ground, person / tree / building / tower); rounded answers use K.P.near with
 * targeted alternatives (forgot the eye height, angle of depression measured from the vertical, wrong ratio, ratio
 * inverted, radian mode, rounded too early, …); bearings use a local three-figure bearing checker. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, Tg = HW.trig, RT = K.roundTo;

  HW.addCodes({
    'trig-ratio': 'Used the wrong trig ratio', 'trig-inverted': 'Multiplied instead of dividing (or the reverse) when solving the ratio',
    'trig-rad': 'Calculator in radian mode', 'eye-height': 'Forgot to add the eye height', 'eye-sub': 'Subtracted the eye height instead of adding it',
    'eye-added': 'Added the eye height when only the rise above eye level was asked', 'eye-floor': 'Used the floor height instead of the eye height',
    'depr-vertical': 'Angle of depression measured from the vertical (put in the wrong place in the triangle)', 'early-round': 'Rounded an intermediate value too early',
    'other-angle': 'Found the other acute angle', 'diam-radius': 'Gave the diameter instead of the radius', 'hole-depth': 'Left out the part of the pole in the hole',
    'hole-sub': 'Subtracted the hole depth instead of adding it', 'pyth-add': 'Added the squares when finding a leg', 'moved-away': 'Added the distance moved instead of subtracting',
    'speed-units': 'Speed not converted (or converted the wrong way) between m/s and km/h', 'speed-mult': 'Multiplied by the speed instead of dividing',
    'leg-sum': 'Added the two legs instead of using the east and north parts', 'not-right': 'Used the Pythagorean theorem on a triangle with no right angle',
    'ns-dir': 'North–south part added when it should be subtracted (or the reverse)', 'bearing-ref': 'Used the bearing instead of the reference angle (or the reverse)',
    'bearing-3digit': 'Bearing not written with three digits', 'bearing-360': 'Bearing of 360° or more', 'bearing-ccw': 'Measured the bearing anticlockwise or from the wrong line',
    'bearing-back': 'Gave the outbound bearing instead of the return bearing (or the reverse)', 'back-over': 'Added 180° to a bearing that was already 180° or more',
    'wire-top': 'Sketch: wire not attached to the top of the pole', 'wire-anchor': 'Sketch: wire anchored at the wrong place', 'wire-side': 'Sketch: both wires on the same side',
    'wire-count': 'Sketch: wrong number of wires', 'arrows': 'Sketch: drew lines with arrows instead of segments', 'af-not-x': 'Gave the whole run instead of the unknown part x',
    'elim-sign': 'Sign slip when solving the two-triangle equation', 'recip': 'Used tan instead of 1/tan in the two-observation formula', 'angle-diff': 'Subtracted the angles and used one triangle',
    'not-diff': 'Gave a distance instead of the difference', 'cars-sum': 'Added the two runs when both cars are on the same side', 'time-units': 'Did not convert minutes to hours',
    'runs-diff': 'Subtracted the two runs when they should be added', 'one-tri': 'Used a side that is not in the triangle'
  });

  /* ---------- small helpers ---------- */
  function fx(x, dp) { return F(RT(x, dp).toFixed(dp)); }
  function fl(x) { return F(x.toFixed(4)) + '\\ldots'; }
  function dg(a) { return a + '^\\circ'; }
  function b3(b) { b = ((Math.round(b) % 360) + 360) % 360; return ('00' + b).slice(-3); }
  function tenth(r, lo, hi) { return r.int(Math.round(lo * 10), Math.round(hi * 10)) / 10; }
  function f1(x) { return x.toFixed(1); }
  function until(r, fn, fallback) { for (var i = 0; i < 300; i++) { var v = fn(r); if (v) return v; } return fallback; }
  function A(v, code, hint) { return { v: v, code: code, hint: hint }; }
  var RAD = 'That is what a calculator in <b>radian</b> mode gives. Switch your calculator to <b>degree</b> (DEG) mode and redo it.';
  var EARLY = 'Very close — but you rounded a value in the middle of the problem. Keep full calculator precision until the very end.';
  function aRad(v) { return A(v, 'trig-rad', RAD); }
  function aEarly(v) { return A(v, 'early-round', EARLY); }

  /* rounded answer with targeted alternatives; the alternatives that round differently become test "bad" answers */
  function nearP(prompt, x, dp, unit, alts, sol, hints, text, nr) {
    alts = (alts || []).filter(function (a) { return isFinite(a.v); });
    var p = K.P.near(prompt, x, dp, { unit: unit, alts: alts, nr: nr }, sol, hints, text);
    var want = RT(x, dp), seen = {};
    p.bad = alts.filter(function (a) { var k = RT(a.v, dp); if (Math.abs(k - want) < 1e-9 || seen[k] || k < 0) return false; seen[k] = 1; return !nr || RT(a.v, dp).toFixed(dp).length <= 4; }).map(function (a) { return RT(a.v, dp).toFixed(dp); });
    if (unit === '°') p.answer = t(want.toFixed(dp) + '^\\circ');
    return p;
  }
  function nearC(x, dp, alts) { return K.near(x, dp, { alts: (alts || []).filter(function (a) { return isFinite(a.v); }) }); }

  /* a whole number of degrees (angle sizes) with alternatives */
  function intCheck(ans, alts) {
    return K.number(ans, function (v) { for (var i = 0; i < (alts || []).length; i++) if (Math.abs(v - alts[i].v) < 0.5) return { code: alts[i].code, hint: alts[i].hint }; return null; });
  }

  /* a three-figure bearing (b = whole number of degrees). opt.strict: a missing leading zero is a mistake, not a nudge */
  function bearingCheck(b, alts, opt) {
    opt = opt || {}; b = ((Math.round(b) % 360) + 360) % 360;
    return function (resp) {
      var raw = String(resp == null ? '' : resp).replace(/\\circ|\^|\{|\}|°|º|\s/g, '');
      if (!raw) return form('empty', 'Type your answer first.');
      if (!/^-?\d+(\.\d+)?$/.test(raw)) return form('notnumber', 'Enter the bearing as a number of degrees, e.g. ' + t('045') + '.');
      if (opt.nr && raw.length > 4) return form('nr-long', 'Numerical response answers fit in 4 boxes (digits and a decimal point only).');
      var v = Number(raw), whole = raw.split('.')[0].replace('-', '');
      if (Math.abs(v - b) < 1e-9) {
        if (whole.length < 3) return (opt.strict ? wrong : form)('bearing-3digit', opt.strict ? 'The size is right, but this is a notation question: a bearing is <b>always</b> written with three digits, so keep the leading zero(s).' : 'Right direction! Now write it as a <b>three-figure</b> bearing: put zero(s) in front so it has three digits (e.g. ' + t('45^\\circ\\to 045^\\circ') + ').');
        return ok();
      }
      if (raw.indexOf('.') >= 0 && Math.round(v) === b) return form('round', 'Right — now round it to the nearest degree.');
      for (var i = 0; i < (alts || []).length; i++) { var a = alts[i]; if (isFinite(a.v) && Math.abs(v - a.v) < 0.6 && Math.round(a.v) !== b) return wrong(a.code, a.hint); }
      if (v >= 360) return wrong('bearing-360', 'A bearing is always less than ' + t('360^\\circ') + ' (one full turn). If your value passed ' + t('360^\\circ') + ', subtract ' + t('360^\\circ') + ' — or check whether you should have subtracted ' + t('180^\\circ') + ' instead of adding it.');
      if (v < 0) return wrong('sign', 'Bearings are never negative: they run clockwise from north, from ' + t('000^\\circ') + ' to ' + t('359^\\circ') + '.');
      return wrong('value', null);
    };
  }
  function bearingP(prompt, b, alts, sol, hints, text, opt) {
    opt = opt || {};
    var p = { prompt: prompt, input: { type: 'number', after: '°', nr: !!opt.nr }, check: bearingCheck(b, alts, opt), key: b3(b), answer: t(b3(b) + '^\\circ'), solution: sol, hints: hints || [], text: text };
    var seen = {}; p.bad = (alts || []).filter(function (a) { var k = Math.round(a.v); if (!isFinite(a.v) || k === Math.round(b) || seen[k] || k < 0 || (opt.nr && String(k).length > 4)) return false; seen[k] = 1; return true; }).map(function (a) { return String(Math.round(a.v)); });
    if (Math.round(b) < 100 && !opt.nr) p.good = [b3(b) + '°'];
    if (opt.strict && Math.round(b) < 100) p.bad.push(String(Math.round(b)));
    return p;
  }

  /* ---------- figures (HW.fig; labels are plain text) ---------- */
  var GREY = '#6a7182', SUN = '#c49a2a';
  function deg(a) { return a + '°'; }
  function vis(a, lo, hi) { return Math.min(Math.max(a, lo || 20), hi || 62); } // drawing angle (figures not to scale)
  /* observer on level ground, angle of elevation measured from eye level; obj: 'tree' | 'pole' | 'building' | 'chimney' | 'cliff' */
  function eyeScene(o) {
    var W = 10, rise = W * Tg.tan(vis(o.th)), e = Math.min(Math.max(rise * 0.2, 1.3), 2.4), top = e + rise;
    var pts = { F: [0, 0], E: [0, e], G: [W, 0], H: [W, e], Q: [W, top], d1: [-1, 0], d2: [-1, e] };
    var segs = [['E', 'Q'], ['F', 'G', o.runLab], ['d1', 'd2', o.eyeLab, { width: 1.2, color: GREY }], ['E', 'H', { dash: 1, width: 1.4, color: GREY }]];
    var extra = [{ type: 'ground', y: 0, x0: -1.8, x1: W + 2.6 }, { type: 'person', at: [0, 0], h: e * 1.1 }, { type: 'eye', at: [0, e] }];
    var obj = o.obj || 'pole';
    if (obj === 'tree') { extra.push({ type: 'tree', at: [W, 0], h: top }); segs.push(['G', 'Q', o.topLab, { dash: 1, width: 1.2, color: GREY }]); }
    else if (obj === 'pole') segs.push(['G', 'Q', o.topLab, { width: 3.2 }]);
    else { var bw = obj === 'chimney' ? 1.1 : 2.4; extra.push({ type: 'building', at: [W + bw / 2, 0], w: bw, h: top }); segs.push(['G', 'Q', o.topLab, { width: 1.4 }]); }
    if (o.boots) segs.push(['Q', 'F', { dash: 1, width: 1.3, color: SUN }]);
    return HW.fig({ pts: pts, segs: segs, right: [['H', 'E', 'Q']], angles: [['E', 'H', 'Q', deg(o.th)]], names: false, extra: extra.concat(o.extra || []), width: o.width || 300, aria: o.aria || 'angle of elevation from eye level' });
  }
  /* angle of depression from the top E of a vertical (tower / cliff / building) down to a point S on the ground or water */
  function deprScene(o) {
    var W = 10, h = W * Tg.tan(vis(o.th, 24)), wall = o.obj === 'cliff' || o.obj === 'building';
    var pts = { E: [0, h], G: [0, 0], S: [W, 0], H: [W, h] }, names = o.names || false;
    var segs = [['G', 'E', o.hLab, { width: wall ? 1.4 : 3, side: wall ? -1 : 1 }], ['G', 'S', o.runLab], ['E', 'S', o.sightLab], ['E', 'H', { dash: 1, width: 1.4, color: GREY }]];
    var extra = [{ type: 'ground', y: 0, x0: -3, x1: W + 1.5 }];
    if (o.obj === 'cliff' || o.obj === 'building') extra.push({ type: 'building', at: [-1.4, 0], w: 2.8, h: h });
    if (o.person) extra.push({ type: 'person', at: [0, h], h: Math.max(0.9, h * 0.14) });
    var angles = [['E', 'H', 'S', o.angLab || deg(o.th), { r: 30 }]];
    if (o.elevAt) angles.push(['S', 'G', 'E', o.elevAt]);
    return HW.fig({ pts: pts, segs: segs, right: [['G', 'E', 'S']], angles: angles, names: names, extra: extra.concat(o.extra || []), width: o.width || 300, aria: 'angle of depression' });
  }
  /* two sightings in line with the base: angle a1 from the farther point, a2 from the nearer point */
  function twoObs(o) {
    var v1 = vis(o.a1, 22, 45), v2 = Math.max(vis(o.a2, 22, 68), v1 + 14), h = 6, x = h / Tg.tan(v2), X = h / Tg.tan(v1), nm = o.nm || ['A', 'B', 'F', 'T'];
    var pts = {}; pts[nm[0]] = [0, 0]; pts[nm[1]] = [X - x, 0]; pts[nm[2]] = [X, 0]; pts[nm[3]] = [X, h];
    var names = {}; nm.forEach(function (k) { names[k] = k; });
    var extra = [{ type: 'ground', y: 0, x0: -0.8, x1: X + 2.2 }];
    if (o.obj === 'building') extra.push({ type: 'building', at: [X + 1, 0], w: 2, h: h });
    if (o.dLab) extra.push({ type: 'text', at: [(X - x) / 2, -1.2], text: o.dLab });
    if (o.xLab) extra.push({ type: 'text', at: [X - x / 2, -1.2], text: o.xLab });
    return HW.fig({ pts: pts, segs: [[nm[0], nm[1]], [nm[1], nm[2]], [nm[2], nm[3], o.hLab, { width: 3 }], [nm[0], nm[3]], [nm[1], nm[3]]],
      right: [[nm[2], nm[0], nm[3]]], angles: [[nm[0], nm[2], nm[3], deg(o.a1), { r: 30 }], [nm[1], nm[2], nm[3], deg(o.a2), { r: 22 }]], names: o.hideNames ? false : names, extra: extra, width: 320, aria: 'two angles of elevation' });
  }
  /* bearing diagram helper: points + north lines (length nl) at the listed points */
  function bearFig(pts, legs, north, nl, o) {
    o = o || {}; var P = {}, names = {}, segs = [];
    Object.keys(pts).forEach(function (k) { P[k] = pts[k]; names[k] = k; });
    north.forEach(function (n) { P[n[1]] = [pts[n[0]][0], pts[n[0]][1] + nl]; names[n[1]] = n[2] || 'N'; segs.push([n[0], n[1], { width: 1.4, color: GREY }]); });
    legs.forEach(function (l) { segs.push(l); });
    return HW.fig({ pts: P, segs: segs, names: names, right: o.right, angles: o.angles, width: o.width || 300, extra: o.extra, aria: 'bearings diagram' });
  }
  function compass(name, b, ref, lab) {
    var R = 1.0, L = 1.35, pts = { O: [0, 0], N: [0, L], S: [0, -L], E: [L, 0], W: [-L, 0] };
    pts[name] = [R * Math.sin(b * Math.PI / 180), R * Math.cos(b * Math.PI / 180)];
    var names = { N: 'N', S: 'S', E: 'E', W: 'W' }; names[name] = name;
    return '<div style="flex:1 1 110px;max-width:150px">' + HW.fig({ pts: pts, segs: [['O', 'N', { width: 1.2, color: GREY }], ['O', 'S', { width: 1.2, color: GREY }], ['O', 'E', { width: 1.2, color: GREY }], ['O', 'W', { width: 1.2, color: GREY }], ['O', name, { width: 3 }]],
      angles: [['O', ref, name, lab, { r: 18 }]], names: names, width: 150, pad: 22, extra: [{ type: 'eye', at: [0, 0] }], aria: 'bearing of ' + name }) + '</div>';
  }
  function figRow(html) { return '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">' + html + '</div>'; }

  /* ---------- question-specific figures ---------- */
  function shadowFig(H, th) {
    var W = 10, h = W * Tg.tan(vis(th));
    return HW.fig({ pts: { P: [0, 0], B: [W, 0], Q: [W, h] }, names: false, segs: [['P', 'B', 'shadow'], ['B', 'Q', H + ' m', { width: 3.4 }], ['P', 'Q', { dash: 1, color: SUN }]],
      right: [['B', 'P', 'Q']], angles: [['P', 'B', 'Q', deg(th)]], extra: [{ type: 'text', at: [0, -0.9], text: 'tourist' }, { type: 'ground', y: 0, x0: -0.6, x1: W + 1 }], width: 300, aria: 'tower and its shadow' });
  }
  function circleFig(a, lab) {
    var pts = { A: [-1, 0], B: [1, 0], C: [Tg.cos(2 * a), Tg.sin(2 * a)] }, segs = [], N = 48, i;
    for (i = 0; i < N; i++) pts['c' + i] = [Math.cos(2 * Math.PI * i / N), Math.sin(2 * Math.PI * i / N)];
    for (i = 0; i < N; i++) segs.push(['c' + i, 'c' + ((i + 1) % N), { width: 1.6 }]);
    segs.push(['A', 'B'], ['A', 'C'], ['C', 'B', lab]);
    return HW.fig({ pts: pts, segs: segs, right: [['C', 'A', 'B']], angles: [['A', 'B', 'C', deg(a)]], names: { A: 'A', B: 'B', C: 'C' }, extra: [{ type: 'eye', at: [0, 0] }], width: 250, pad: 44, aria: 'triangle in a semicircle' });
  }
  function cliffFig(d, th, c, phiLab) {
    var W = 10, h = W * Tg.tan(vis(th)), extra = [{ type: 'ground', y: 0, x0: -0.6, x1: W + 3 }, { type: 'building', at: [W + 1.4, 0], w: 2.8, h: h }];
    if (!c) return HW.fig({ pts: { P: [0, 0], F: [W, 0], T: [W, h] }, segs: [['P', 'T'], ['F', 'T', 'h', { width: 1.4 }], ['P', 'F', d + ' m']], right: [['F', 'P', 'T']], angles: [['P', 'F', 'T', deg(th)]], names: false,
      extra: extra.concat([{ type: 'text', at: [0, -1], text: 'boat' }]), width: 300, aria: 'boat and cliff' });
    var q = W * Math.min(Math.max(c / d, 0.3), 0.5);
    return HW.fig({ pts: { P: [0, 0], Q: [q, 0], F: [W, 0], T: [W, h] }, segs: [['P', 'T', { dash: 1, width: 1.4, color: GREY }], ['Q', 'T'], ['F', 'T', { width: 1.4 }], ['P', 'Q', c + ' m'], ['Q', 'F', (d - c) + ' m']],
      right: [['F', 'P', 'T']], angles: [['Q', 'F', 'T', phiLab, { r: 28 }]], names: false, extra: extra, width: 300, aria: 'boat moved closer to the cliff' });
  }
  function roadFig(s, th) {
    var td = vis(th, 24, 40), w = 4 / Tg.tan(td);
    return HW.fig({ pts: { F: [0, 0], A: [0, -4], S: [w, 0], h1: [-0.15 * w, 0], h2: [1.15 * w, 0] }, names: { A: 'Amir', S: 'scooter' },
      segs: [['h1', 'h2', { width: 5, color: '#b5bac4' }], ['F', 'A', s + ' m'], ['A', 'S', { dash: 1 }]], right: [['F', 'A', 'S']], angles: [['S', 'F', 'A', deg(th), { r: 34 }]],
      extra: [{ type: 'text', at: [0.42 * w, 1.1], text: 'highway (east–west)' }, { type: 'text', at: [-0.15 * w, 1.1], text: 'N ↑' }], width: 300, aria: 'top view of the highway' });
  }
  function lifeguardFig(eLab, th) {
    return deprScene({ th: th, hLab: eLab, runLab: 'd', obj: 'tower', extra: [{ type: 'text', at: [10, -0.8], text: 'swimmer' }] });
  }
  function twoLegFig(b1, d1, b2, d2, nm, labs) {
    var V = [d1 * Tg.sin(b1), d1 * Tg.cos(b1)], K2 = [V[0] + d2 * Tg.sin(b2), V[1] + d2 * Tg.cos(b2)], p = {};
    p[nm[0]] = [0, 0]; p[nm[1]] = V; p[nm[2]] = K2;
    var k = Math.max(d1, d2) * 0.12, m1 = [V[0] / 2 + k * Tg.cos(b1), V[1] / 2 - k * Tg.sin(b1)], m2 = [(V[0] + K2[0]) / 2 - k * Tg.cos(b2) * 0.9, (V[1] + K2[1]) / 2 + k * Tg.sin(b2) * 0.9];
    return bearFig(p, [[nm[0], nm[1]], [nm[1], nm[2]]], [[nm[0], nm[3]], [nm[1], nm[4], nm[4]]], Math.max(d1, d2) * 0.5, { width: 300, extra: [{ type: 'text', at: m1, text: labs[0] }, { type: 'text', at: m2, text: labs[1] }] });
  }

  /* ---------- the sketch (Q4a): a graph pad with the ground, the pole and the hole drawn ---------- */
  function wireCheck(a, top) {
    return function (val) {
      var nv = HW.draw.norm(val), segs = [], arrow = false;
      nv.pieces.forEach(function (pc) { if (pc.s === 'arrow' || pc.e === 'arrow') arrow = true; for (var i = 0; i + 1 < pc.v.length; i++) segs.push([pc.v[i], pc.v[i + 1]]); });
      if (!segs.length) return form('empty', 'Use the <b>Line</b> tool: tap the top of the pole, then the point on the ground where a wire is anchored. Draw both wires.');
      if (arrow) return form('arrows', 'A guy wire has two ends — it doesn’t go on forever. Draw it without arrows (tap <b>Ends</b> to change an end).');
      var anchors = [];
      for (var i = 0; i < segs.length; i++) {
        var p = segs[i][0], q = segs[i][1], hi = p[1] >= q[1] ? p : q, lo = hi === p ? q : p;
        if (!(Math.abs(hi[0]) < 1e-6 && Math.abs(hi[1] - top) < 1e-6)) {
          if (Math.abs(hi[0]) < 1e-6 || Math.abs(lo[0]) < 1e-6) return wrong('wire-top', 'The guy wires are attached to the <b>top</b> of the pole. Start each wire at the dot marking the top.');
          return wrong('wire-top', 'Each wire runs from the <b>top of the pole</b> down to the ground. One of your lines doesn’t touch the top of the pole.');
        }
        if (Math.abs(lo[1]) > 1e-6) return wrong('wire-anchor', lo[1] < 0 ? 'The wires are anchored into the <b>ground</b> (the line at height 0), not down in the hole.' : 'Each wire must reach the <b>ground</b> (the line at height 0) — that is where it is anchored.');
        if (Math.abs(Math.abs(lo[0]) - a) > 1e-6) return wrong('wire-anchor', 'Each anchor is ' + t(a + '\\text{ m}') + ' <b>horizontally</b> from the centre of the pole, measured along the ground. Each grid square is 2 m wide.');
        anchors.push(lo[0] > 0 ? 1 : -1);
      }
      if (anchors.length === 1) return wrong('wire-count', 'There are <b>two</b> guy wires. Draw the second one.');
      if (anchors.indexOf(1) < 0 || anchors.indexOf(-1) < 0) return wrong('wire-side', 'The wires are anchored on <b>opposite</b> sides of the pole, one on each side.');
      if (anchors.length > 2) return wrong('wire-count', 'There are only <b>two</b> guy wires — remove the extra line.');
      return ok();
    };
  }

  HW.defineLesson({
    id: 'u9l6', unit: 9, num: '6', title: 'Multi-Step Trigonometry: Eye Level, Elevation and Depression', outcome: 'M4',
    blurb: 'Layered right-triangle problems: two calculations in one triangle, angles measured from eye level, angles of depression, clinometer heights — and bearings as an extension.',
    questions: [
      /* ---------- Q1: shadow ---------- */
      { num: '1', section: 'Assignment 6', shared: function (r) {
          var cn = r.chance(0.5), H = cn ? 553 : r.int(12, 48) * 10, th = tenth(r, 15, 45);
          return { H: H, th: th, who: cn ? 'The CN Tower is ' + t('553') + ' m tall.' : 'A communications tower is ' + t(H) + ' m tall.' };
        },
        stem: function (sh) { return sh.who + ' On a sunny afternoon it casts a shadow, and a tourist standing at the tip of the shadow measures the angle of elevation of the sun to be ' + t(dg(sh.th)) + '.<br>' + shadowFig(sh.H, sh.th); },
        parts: [
          { id: '1', level: 'EMG', make: function (r, sh) {
            var H = sh.H, th = sh.th, x = H / Tg.tan(th);
            return nearP('Determine, to the nearest metre, the length of the shadow.', x, 0, 'm', [
              A(H * Tg.tan(th), 'trig-inverted', 'Check your rearranging: from ' + t('\\tan ' + dg(th) + '=\\frac{' + H + '}{s}') + ' the shadow is in the <b>denominator</b>, so divide: ' + t('s=\\frac{' + H + '}{\\tan ' + dg(th) + '}') + '.'),
              A(H / Tg.sin(th), 'trig-ratio', 'That is the sun’s ray from the top of the tower to the tourist (the hypotenuse). The shadow is <b>adjacent</b> to the angle and the tower is <b>opposite</b>: use tan.'),
              A(H / Tg.cos(th), 'trig-ratio', 'Label the sides from the ' + t(dg(th)) + ' angle: the tower is opposite and the shadow is adjacent ⇒ TOA.'),
              aRad(H / Tg.radTan(th))],
              'From the ' + t(dg(th)) + ' angle at the tourist: the tower (' + t(H) + ') is <b>opposite</b> and the shadow ' + t('s') + ' is <b>adjacent</b> ⇒ TOA.<br>' + t('\\tan ' + dg(th) + '=\\dfrac{' + H + '}{s}') + '<br>' + t('s=\\dfrac{' + H + '}{\\tan ' + dg(th) + '}=' + fl(x) + '\\approx ' + fx(x, 0)) + ' m',
              ['Label the sides from the ' + t(dg(th)) + ' angle at the tourist: which side is the tower, which is the shadow? Which ratio uses those two?', 'Write ' + t('\\tan ' + dg(th) + '=\\frac{' + H + '}{s}') + ' and solve for ' + t('s') + ' — the unknown is in the denominator.'], 'shadow of ' + H + ' m tower, sun ' + th + '°');
          } }] },

      /* ---------- Q2: triangle in a semicircle ---------- */
      { num: '2', shared: function (r) { var a; do { a = r.int(25, 65); } while (a === 45); return { a: a, cb: tenth(r, 5, 14) }; },
        stem: function (sh) { return 'In the diagram, ' + t('AB') + ' is a diameter of a circle. Angle ' + t('CAB=' + dg(sh.a)) + ' and ' + t('CB=' + f1(sh.cb)) + ' cm.<br>' + circleFig(sh.a, f1(sh.cb) + ' cm'); },
        parts: [
          { id: '2a', level: 'BEG', make: function (r, sh) {
            return K.P.mc(r, 'Which statement explains why angle ' + t('ACB=90^\\circ') + '?', [
              { html: t('AB') + ' is a diameter, so ' + t('\\angle ACB') + ' is inscribed in a semicircle — and an angle inscribed in a semicircle is always a right angle.', right: true },
              { html: 'The angles of a triangle add to ' + t('180^\\circ') + ' and ' + t('\\angle CAB=' + dg(sh.a)) + ', so ' + t('\\angle ACB') + ' must be ' + t('90^\\circ') + '.', why: t('180^\\circ-' + dg(sh.a) + '=' + dg(180 - sh.a)) + ' is shared by the <b>two</b> other angles — that alone can’t tell you ' + t('\\angle ACB') + '. What is special about ' + t('AB') + '?' },
              { html: t('C') + ' is at the very top of the circle, directly above the centre.', why: t('C') + ' doesn’t have to be at the top: any point ' + t('C') + ' on the circle gives a right angle. The reason is the <b>diameter</b>.' },
              { html: 'Triangle ' + t('ACB') + ' is isosceles, because ' + t('AB') + ' passes through the centre.', why: t('CA') + ' and ' + t('CB') + ' aren’t equal here (the angle at ' + t('A') + ' is ' + t(dg(sh.a)) + ', not ' + t('45^\\circ') + '). Think about the semicircle.' }],
              'The rays of ' + t('\\angle ACB') + ' pass through the ends of the diameter ' + t('AB') + ' and its vertex ' + t('C') + ' is on the circle, so it is an angle inscribed in a semicircle. Such an angle is always ' + t('90^\\circ') + '.', ['What is special about the side ' + t('AB') + '?'], 'why angle in a semicircle is 90°');
          } },
          { id: '2b', level: 'PRG', make: function (r, sh) {
            var a = sh.a, cb = sh.cb, AB = cb / Tg.sin(a), rad = AB / 2;
            return nearP('Determine the radius of the circle to the nearest tenth of a centimetre.', rad, 1, 'cm', [
              A(AB, 'diam-radius', 'That is the <b>diameter</b> ' + t('AB') + '. The question asks for the radius — half of it.'),
              A(cb / Tg.tan(a) / 2, 'trig-ratio', 'From ' + t('\\angle A') + ': ' + t('CB') + ' is <b>opposite</b> and the diameter ' + t('AB') + ' is the <b>hypotenuse</b> (it is across from the right angle at ' + t('C') + ') ⇒ SOH.'),
              A(cb / Tg.cos(a) / 2, 'trig-ratio', t('CB') + ' is <b>opposite</b> the ' + t(dg(a)) + ' angle (it doesn’t touch ' + t('A') + '), so use sin, not cos.'),
              A(cb * Tg.sin(a) / 2, 'trig-inverted', 'From ' + t('\\sin ' + dg(a) + '=\\frac{' + f1(cb) + '}{AB}') + ', ' + t('AB') + ' is in the denominator: divide, ' + t('AB=\\frac{' + f1(cb) + '}{\\sin ' + dg(a) + '}') + '.'),
              A(cb / Tg.sin(a), 'diam-radius', 'Half the diameter is the radius.'), aRad(cb / Tg.radSin(a) / 2)],
              'Triangle ' + t('ACB') + ' is right-angled at ' + t('C') + '. From ' + t('\\angle A=' + dg(a)) + ': ' + t('CB=' + f1(cb)) + ' is <b>opposite</b> and the diameter ' + t('AB') + ' is the <b>hypotenuse</b> ⇒ SOH.<br>' + t('\\sin ' + dg(a) + '=\\dfrac{' + f1(cb) + '}{AB}\\Rightarrow AB=\\dfrac{' + f1(cb) + '}{\\sin ' + dg(a) + '}=' + fl(AB)) + ' cm<br>radius ' + t('=\\dfrac{' + fl(AB) + '}{2}=' + fl(rad) + '\\approx ' + fx(rad, 1)) + ' cm',
              ['The diameter ' + t('AB') + ' is the hypotenuse of right triangle ' + t('ACB') + '. Find it first.', 'The radius is half the diameter.'], 'radius from inscribed right triangle, A=' + a + '°, CB=' + cb);
          } }] },

      /* ---------- Q3: boat and cliff ---------- */
      { num: '3', shared: function (r) { var d = r.int(15, 40) * 10, th = r.int(12, 32), c = 10 * r.int(Math.ceil(d / 50), Math.floor(d / 20)); return { d: d, th: th, c: c }; },
        stem: function (sh) { return 'A boat is ' + t(sh.d) + ' m from the base of a lighthouse cliff. The angle of elevation from the boat to the top of the cliff is ' + t(dg(sh.th)) + '.<br>' + cliffFig(sh.d, sh.th); },
        parts: [
          { id: '3a', level: 'BEG', make: function (r, sh) {
            var d = sh.d, th = sh.th, h = d * Tg.tan(th);
            return nearP('Determine the height of the cliff to the nearest metre.', h, 0, 'm', [
              A(d / Tg.tan(th), 'trig-inverted', 'From ' + t('\\tan ' + dg(th) + '=\\frac{h}{' + d + '}') + ', ' + t('h') + ' is on top: <b>multiply</b>, ' + t('h=' + d + '\\tan ' + dg(th)) + '.'),
              A(d * Tg.sin(th), 'trig-ratio', 'Using sin would make ' + t(d) + ' m the hypotenuse. It is the side <b>adjacent</b> to the angle, and the cliff is opposite ⇒ TOA.'),
              A(d * Tg.cos(th), 'trig-ratio', 'The cliff is <b>opposite</b> the angle at the boat and ' + t(d) + ' m is <b>adjacent</b> ⇒ TOA.'), aRad(d * Tg.radTan(th))],
              'From ' + t(dg(th)) + ': the cliff ' + t('h') + ' is <b>opposite</b> and ' + t(d) + ' is <b>adjacent</b> ⇒ TOA.<br>' + t('h=' + d + '\\tan ' + dg(th) + '=' + fl(h) + '\\approx ' + fx(h, 0)) + ' m',
              ['Which side is the cliff, seen from the ' + t(dg(th)) + ' angle at the boat? Which side is the ' + t(d) + ' m?', 'Opposite and adjacent ⇒ tan.'], 'cliff height, ' + d + ' m at ' + th + '°');
          } },
          { id: '3b', level: 'PRG', make: function (r, sh) {
            var d = sh.d, th = sh.th, c = sh.c, h = d * Tg.tan(th), n = d - c, phi = Tg.atan(h / n);
            return nearP('The boat then sails ' + t(c) + ' m closer to the cliff. Determine, to the nearest degree, the new angle of elevation of the cliff top from the boat. (Dashed: the first line of sight.)<br>' + cliffFig(d, th, c, 'θ'), phi, 0, '°', [
              A(Tg.atan(h / (d + c)), 'moved-away', 'The boat sails <b>closer</b>, so its new distance is ' + t(d + '-' + c + '=' + n) + ' m, not ' + t(d + c) + ' m.'),
              A(Tg.atan(n / h), 'other-angle', 'That is the angle at the <b>top</b> of the cliff. At the boat, the cliff height is opposite and the new distance is adjacent: ' + t('\\tan\\theta=\\frac{h}{' + n + '}') + '.'),
              A(Tg.atan(h / c), 'one-tri', t(c) + ' m is how far the boat moved — it is not a side of the new triangle. Use the new distance from the cliff, ' + t(d + '-' + c) + '.'),
              A(Tg.atan(Math.round(h) / n), 'early-round', EARLY + ' (Use the unrounded height ' + t(fl(h)) + '.)'),
              A(Tg.asin(h / n), 'trig-ratio', 'The height and the new distance are opposite and adjacent ⇒ use ' + t('\\tan^{-1}') + '.'),
              aRad(Math.atan(h / n))],
              'Cliff height (keep it unrounded): ' + t('h=' + d + '\\tan ' + dg(th) + '=' + fl(h)) + ' m.<br>New distance ' + t('=' + d + '-' + c + '=' + n) + ' m.<br>' + t('\\tan\\theta=\\dfrac{' + fl(h) + '}{' + n + '}=' + fl(h / n)) + '<br>' + t('\\theta=\\tan^{-1}(' + fl(h / n) + ')=' + fx(phi, 2) + '^\\circ\\approx ' + dg(fx(phi, 0))),
              ['First find the height of the cliff (from the original ' + t(dg(th)) + ' sighting) and keep it unrounded.', 'The new triangle has the same height and a horizontal side of ' + t(d + '-' + c) + ' m. Use ' + t('\\tan^{-1}') + '.'], 'new elevation after moving ' + c + ' m closer');
          } }] },

      /* ---------- Q4: guy wires ---------- */
      { num: '4', shared: function (r) {
          return until(r, function (r) { var a = r.pick([8, 10, 12, 14]), L = r.int(a + 4, a + 12), th = Tg.acos(a / L); if (th < 35 || th > 70) return null; return { a: a, L: L, p: r.pick([1.0, 1.2, 1.5, 1.8, 2.0]) }; }, { a: 14, L: 22, p: 1.5 });
        },
        stem: function (sh) { return 'A sculpture pole is being erected in a ' + t(f1(sh.p)) + ' m deep hole. Two guy wires attached to the top of the pole are used to pull it upright, anchored into the ground on <i>opposite</i> sides of the pole until the hole is filled. Each wire is ' + t(sh.L) + ' m long and is anchored into the ground ' + t(sh.a) + ' m horizontally from the centre of the pole.'; },
        parts: [
          { id: '4a', level: 'BEG', make: function (r, sh) {
            var a = sh.a, L = sh.L, h = Math.sqrt(L * L - a * a), top = 2 * Math.round(h / 2), X = a + 2, yTop = top + 2;
            var inp = { x: [-X, X], y: [-4, yTop], grid: 2, labels: 4, labelsY: 1000, xName: ' ', yName: ' ', xTitle: 'distance from the centre of the pole (m)', tools: ['line'], defaultEnd: 'none',
              bg: { segs: [{ pts: [[-X, 0], [X, 0]], color: '#8a7a5c' }, { pts: [[-1, 0], [-1, -sh.p], [1, -sh.p], [1, 0]], color: GREY, dash: true }, { pts: [[-0.4, -sh.p], [-0.4, top], [0.4, top], [0.4, -sh.p]], color: '#2b3340' }], points: [{ x: 0, y: top, color: '#2b3340', label: 'top of pole' }] } };
            var key = { pts: [], pieces: [{ v: [[-a, 0], [0, top]], s: 'none', e: 'none' }, { v: [[0, top], [a, 0]], s: 'none', e: 'none' }], join: 'none' };
            var p = K.P.graph('Complete the sketch: draw the two guy wires. (The pole, the hole and the ground are drawn for you; heights are not to scale.)', inp, wireCheck(a, top), key,
              'Each wire runs from the <b>top of the pole</b> to a point on the ground ' + t(a) + ' m from the centre of the pole — one on each side. Each wire, the ground and the part of the pole <b>above</b> the ground make a right triangle with hypotenuse ' + t(L) + ' m and base ' + t(a) + ' m. The ' + t(f1(sh.p)) + ' m in the hole is below the triangle.',
              ['Each wire starts at the dot at the top of the pole.', 'The anchors are on the ground, ' + t(a) + ' m to the left and ' + t(a) + ' m to the right of the pole.'], 'sketch of guy wires');
            p.bad = [{ pts: [], pieces: [{ v: [[0, top], [a, 0]], s: 'none', e: 'none' }, { v: [[0, top], [a, 0]], s: 'none', e: 'none' }] },
              { pts: [], pieces: [{ v: [[0, top], [a - 2, 0]], s: 'none', e: 'none' }, { v: [[0, top], [-a, 0]], s: 'none', e: 'none' }] },
              { pts: [], pieces: [{ v: [[0, top], [a, 0]], s: 'none', e: 'none' }] },
              { pts: [], pieces: [{ v: [[0, top - 2], [a, 0]], s: 'none', e: 'none' }, { v: [[0, top - 2], [-a, 0]], s: 'none', e: 'none' }] }];
            return p;
          } },
          { id: '4b', level: 'EMG', make: function (r, sh) {
            var a = sh.a, L = sh.L, th = Tg.acos(a / L), h = Math.sqrt(L * L - a * a);
            return nearP('Calculate, to the nearest tenth of a degree, the angle of elevation of the top of the pole from the point where a wire is anchored into the ground.', th, 1, '°', [
              A(Tg.asin(a / L), 'trig-ratio', 'The ' + t(a) + ' m along the ground <b>touches</b> the angle at the anchor, so it is adjacent; the wire is the hypotenuse ⇒ CAH.'),
              A(90 - th, 'other-angle', 'That is the angle at the <b>top</b>, between the wire and the pole. The angle of elevation is at the anchor, between the ground and the wire.'),
              A(Tg.atan(a / L), 'trig-ratio', 'The wire (' + t(L) + ' m) is the hypotenuse, and ' + t(a) + ' m is adjacent ⇒ ' + t('\\cos\\theta=\\frac{' + a + '}{' + L + '}') + '.'),
              A(Tg.atan((h + sh.p) / a), 'hole-depth', 'The hole is underground: the right triangle is the wire, the ground and the part of the pole <b>above</b> the ground.'),
              aRad(Math.acos(a / L))],
              'In the right triangle formed by one wire, the ground and the pole: the wire (' + t(L) + ') is the <b>hypotenuse</b> and ' + t(a) + ' is <b>adjacent</b> to the angle at the anchor ⇒ CAH.<br>' + t('\\cos\\theta=\\dfrac{' + a + '}{' + L + '}=' + fl(a / L)) + '<br>' + t('\\theta=\\cos^{-1}(' + fl(a / L) + ')=' + fx(th, 2) + '^\\circ\\approx ' + dg(fx(th, 1))),
              ['Sketch one wire, the ground and the pole. Label the hypotenuse and the side along the ground.', 'Adjacent and hypotenuse ⇒ ' + t('\\cos^{-1}') + '.'], 'guy-wire angle, ' + a + ' of ' + L);
          } },
          { id: '4c', level: 'PRG', make: function (r, sh) {
            var a = sh.a, L = sh.L, p = sh.p, h = Math.sqrt(L * L - a * a), len = h + p;
            return nearP('Determine, to the nearest tenth of a metre, the length of the pole before it was placed in the ground.', len, 1, 'm', [
              A(h, 'hole-depth', 'That is only the part of the pole <b>above</b> the ground. Before it was placed, the pole also included the ' + t(f1(p)) + ' m that now sits in the hole.'),
              A(Math.sqrt(L * L + a * a) + p, 'pyth-add', 'The wire is the hypotenuse, so the pole’s height is a <b>leg</b>: ' + t('h^{2}=' + L + '^{2}-' + a + '^{2}') + ' (subtract).'),
              A(h - p, 'hole-sub', 'The ' + t(f1(p)) + ' m in the hole is <b>extra</b> pole below the ground — add it, don’t subtract it.'),
              A(Math.sqrt(L * L + a * a), 'pyth-add', 'Subtract the squares to find a leg, then add the hole depth.'),
              A(L * Tg.sin(RT(Tg.acos(a / L), 1)) + p, 'early-round', EARLY + ' (Or use the Pythagorean theorem with the exact lengths.)')],
              'Height of the pole above the ground, by the Pythagorean theorem:<br>' + t('h=\\sqrt{' + L + '^{2}-' + a + '^{2}}=\\sqrt{' + (L * L - a * a) + '}=' + fl(h)) + ' m<br>The pole also fills the ' + t(f1(p)) + ' m deep hole, so before it was placed:<br>length ' + t('=' + fl(h) + '+' + f1(p) + '=' + fl(len) + '\\approx ' + fx(len, 1)) + ' m',
              ['Find the height of the pole above the ground first (the wire is the hypotenuse).', 'Then add the part of the pole that goes into the hole.'], 'pole length incl. ' + p + ' m hole');
          } }] },

      /* ---------- Q5: scooter speed ---------- */
      { num: '5', shared: function (r) {
          return until(r, function (r) { var s = r.int(3, 8) * 10, th = r.int(6, 14), tt = r.int(8, 20), v = s / Tg.tan(th) / tt * 3.6; return v >= 40 && v <= 110 ? { s: s, th: th, tt: tt } : null; }, { s: 50, th: 9, tt: 15 });
        },
        stem: function (sh) { return 'Amir is standing ' + t(sh.s) + ' m south of a straight east–west highway. He looks to his right and notices a motor-scooter approaching along the highway; at that instant, the angle between the highway and his line of sight to the scooter is ' + t(dg(sh.th)) + '. ' + (sh.tt === 15 ? 'Fifteen' : 'Exactly ' + sh.tt) + ' seconds later, the scooter is directly north of Amir. <i>(Top view, not to scale.)</i><br>' + roadFig(sh.s, sh.th); },
        parts: [
          { id: '5', level: 'ADV', make: function (r, sh) {
            var s = sh.s, th = sh.th, tt = sh.tt, d = s / Tg.tan(th), ms = d / tt, kmh = ms * 3.6;
            return nearP('Calculate the scooter’s speed, to the nearest km/h.', kmh, 0, 'km/h', [
              A(ms, 'speed-units', 'That is the speed in <b>m/s</b>. The question asks for km/h: multiply by ' + t('3.6') + ' (3600 s in an hour, 1000 m in a km).'),
              A(ms / 3.6, 'speed-units', 'To change m/s into km/h, <b>multiply</b> by ' + t('3.6') + ' (a km/h number is bigger: you go much farther in an hour than in a second).'),
              A(s * Tg.tan(th) / tt * 3.6, 'trig-inverted', 'From the ' + t(dg(th)) + ' angle at the scooter, Amir’s ' + t(s) + ' m is <b>opposite</b> and the distance along the highway is <b>adjacent</b>: ' + t('\\tan ' + dg(th) + '=\\frac{' + s + '}{d}') + ', so ' + t('d=\\frac{' + s + '}{\\tan ' + dg(th) + '}') + '.'),
              A(s / Tg.sin(th) / tt * 3.6, 'trig-ratio', 'That uses the line of sight (the hypotenuse) as the distance travelled. The scooter drives <b>along the highway</b> — the side adjacent to the ' + t(dg(th)) + ' angle.'),
              A(d / tt, 'speed-units', 'That is the speed in m/s — convert to km/h (× 3.6).'), aRad(s / Tg.radTan(th) / tt * 3.6)],
              'Amir, the point of the highway due north of him and the scooter’s first position make a right triangle. From the ' + t(dg(th)) + ' angle at the scooter: ' + t(s) + ' m is <b>opposite</b>, the distance ' + t('d') + ' along the highway is <b>adjacent</b> ⇒ TOA.<br>' + t('d=\\dfrac{' + s + '}{\\tan ' + dg(th) + '}=' + fl(d)) + ' m, covered in ' + t(tt) + ' s<br>' + t('\\text{speed}=\\dfrac{' + fl(d) + '}{' + tt + '}=' + fl(ms)) + ' m/s<br>' + t(fl(ms) + '\\times 3.6=' + fx(kmh, 2) + '\\approx ' + fx(kmh, 0)) + ' km/h',
              ['First find how far the scooter travels: from its starting point to the point directly north of Amir. That side is adjacent to the ' + t(dg(th)) + ' angle.', 'speed = distance ÷ time gives m/s; multiply by 3.6 for km/h.'], 'scooter speed ' + s + ' m, ' + th + '°, ' + tt + ' s');
          } }] },

      /* ---------- Q6: eye level ---------- */
      { num: '6', shared: function (r) { return { who: r.pick(['Leah', 'Noor', 'Maya', 'Theo', 'Jonah']), e: r.pick([1.4, 1.5, 1.6, 1.7, 1.8]), d: r.int(20, 60), th: r.int(20, 50) }; },
        stem: function (sh) { return sh.who + '’s eyes are ' + t(f1(sh.e)) + ' m above the ground. ' + (/Theo|Jonah/.test(sh.who) ? 'He' : 'She') + ' stands ' + t(sh.d) + ' m from the base of a tree and measures the angle of elevation of the top of the tree, from eye level, as ' + t(dg(sh.th)) + '.<br>' + eyeScene({ th: sh.th, eyeLab: f1(sh.e) + ' m', runLab: sh.d + ' m', obj: 'tree', aria: 'tree and observer' }); },
        parts: [
          { id: '6', level: 'PRG', make: function (r, sh) {
            var e = sh.e, d = sh.d, th = sh.th, rise = d * Tg.tan(th), H = rise + e;
            return nearP('Determine the height of the tree to the nearest tenth of a metre.', H, 1, 'm', [
              A(rise, 'eye-height', 'That is only the rise <b>above eye level</b>: the angle is measured from the eyes, ' + t(f1(e)) + ' m above the ground. Add the eye height back.'),
              A(rise - e, 'eye-sub', 'The eyes are <b>above</b> the ground, so the top of the tree is the rise <b>plus</b> the eye height.'),
              A(d * Tg.sin(th) + e, 'trig-ratio', 'From the ' + t(dg(th)) + ' angle: the rise is opposite and ' + t(d) + ' m is adjacent ⇒ TOA, not SOH.'),
              A(d / Tg.tan(th) + e, 'trig-inverted', 'The rise is on top of the ratio: ' + t('\\text{rise}=' + d + '\\tan ' + dg(th)) + ' (multiply).'), aRad(d * Tg.radTan(th) + e)],
              'The ' + t(dg(th)) + ' is measured from eye level, so the triangle gives only the rise <b>above eye level</b>: rise is opposite, ' + t(d) + ' is adjacent ⇒ TOA.<br>' + t('\\text{rise}=' + d + '\\tan ' + dg(th) + '=' + fl(rise)) + ' m<br>' + t('\\text{height}=' + fl(rise) + '+' + f1(e) + '=' + fl(H) + '\\approx ' + fx(H, 1)) + ' m',
              ['The triangle starts at eye level (the dashed line). What does it give you — the whole tree, or the part above the eyes?', 'Find the rise with tan, then add the eye height.'], 'tree height from eye level');
          } }] },

      /* ---------- Q7: lifeguard ---------- */
      { num: '7', shared: function (r) {
          return until(r, function (r) { var e = tenth(r, 4, 9), th = r.int(6, 16), v = tenth(r, 0.5, 1.5), tm = e / Tg.tan(th) / v; return tm >= 15 && tm <= 120 ? { e: e, th: th, v: v } : null; }, { e: 6.2, th: 9, v: 0.8 });
        },
        stem: function (sh) { return 'A lifeguard’s eyes are ' + t(f1(sh.e)) + ' m above the water, directly above the base of her tower. She spots a swimmer at an angle of depression of ' + t(dg(sh.th)) + '. The swimmer swims straight toward the base of the tower at ' + t(f1(sh.v)) + ' m/s.<br>' + lifeguardFig(f1(sh.e) + ' m', sh.th); },
        parts: [
          { id: '7a', level: 'EMG', make: function (r, sh) {
            var e = sh.e, th = sh.th, d = e / Tg.tan(th);
            return nearP('How far is the swimmer from the base of the tower, to the nearest tenth of a metre?', d, 1, 'm', [
              A(e * Tg.tan(th), 'depr-vertical', 'That treats the ' + t(dg(th)) + ' as if it were measured from the <b>tower</b>. It is measured down from the <b>horizontal</b> at her eyes — so it equals the angle of elevation at the swimmer, where ' + t(f1(e)) + ' m is opposite and ' + t('d') + ' is adjacent.'),
              A(e / Tg.sin(th), 'trig-ratio', 'That is the line of sight (the hypotenuse). The distance along the water is <b>adjacent</b> to the angle at the swimmer ⇒ TOA.'),
              A(e * Tg.cos(th), 'trig-ratio', 'Opposite (' + t(f1(e)) + ' m) and adjacent (' + t('d') + ') ⇒ tan.'), aRad(e / Tg.radTan(th))],
              'The angle of depression from the lifeguard equals the angle of elevation of the lifeguard from the swimmer (' + t(dg(th)) + ', alternate angles). From there: ' + t(f1(e)) + ' is <b>opposite</b> and ' + t('d') + ' is <b>adjacent</b> ⇒ TOA, unknown underneath.<br>' + t('d=\\dfrac{' + f1(e) + '}{\\tan ' + dg(th) + '}=' + fl(d) + '\\approx ' + fx(d, 1)) + ' m',
              ['Move the angle to the swimmer: the angle of elevation of the lifeguard from the swimmer equals the angle of depression.', 'From the swimmer, the ' + t(f1(e)) + ' m is opposite and the distance is adjacent.'], 'lifeguard distance, depression ' + th + '°');
          } },
          { id: '7b', level: 'PRG', make: function (r, sh) {
            var e = sh.e, th = sh.th, v = sh.v, d = e / Tg.tan(th), tm = d / v;
            return nearP('How long, to the nearest second, until the swimmer reaches the base of the tower?', tm, 0, 's', [
              A(RT(d, 1) / v, 'early-round', EARLY + ' (Use the unrounded distance.)'),
              A(d * v, 'speed-mult', 'time = distance ÷ speed. Divide the distance by ' + t(f1(v)) + ' m/s.'),
              A(e * Tg.tan(th) / v, 'depr-vertical', 'Check the distance first: the angle of depression is measured from the horizontal, so at the swimmer ' + t('\\tan ' + dg(th) + '=\\frac{' + f1(e) + '}{d}') + '.'),
              A(e / Tg.sin(th) / v, 'trig-ratio', 'The swimmer swims along the water (the side adjacent to the angle at the swimmer), not along the line of sight.')],
              'Distance (unrounded): ' + t('d=\\dfrac{' + f1(e) + '}{\\tan ' + dg(th) + '}=' + fl(d)) + ' m<br>' + t('t=\\dfrac{' + fl(d) + '}{' + f1(v) + '}=' + fx(tm, 2) + '\\approx ' + fx(tm, 0)) + ' s',
              ['Find the distance to the tower first (keep it unrounded).', 'time = distance ÷ speed.'], 'lifeguard time at ' + v + ' m/s');
          } }] },

      /* ---------- Q8: clinometer NR ---------- */
      { num: '8', shared: function (r) { return { e: r.pick([1.4, 1.5, 1.6, 1.7, 1.8]), d: r.int(20, 45), th: r.int(15, 40) }; },
        stem: function (sh) { return '<i>(Numerical Response)</i> Using a clinometer held at eye level, ' + t(f1(sh.e)) + ' m above the ground, a student standing ' + t(sh.d) + ' m from the base of a flagpole reads an angle of elevation of ' + t(dg(sh.th)) + ' to the top of the pole.'; },
        parts: [
          { id: '8', level: 'PRG', make: function (r, sh) {
            var e = sh.e, d = sh.d, th = sh.th, rise = d * Tg.tan(th), H = rise + e;
            return nearP('To the nearest tenth of a metre, the height of the flagpole is ________ m.', H, 1, 'm', [
              A(rise, 'eye-height', 'That is the height <b>above the clinometer</b>. The clinometer is ' + t(f1(e)) + ' m above the ground — add it.'),
              A(rise - e, 'eye-sub', 'Add the eye height: the clinometer is above the ground, so the pole is taller than the rise.'),
              A(d * Tg.sin(th) + e, 'trig-ratio', 'The rise is opposite and ' + t(d) + ' m is adjacent ⇒ tan.'),
              A(d / Tg.tan(th) + e, 'trig-inverted', t('\\text{rise}=' + d + '\\tan ' + dg(th)) + ' — multiply, the rise is on top.'), aRad(d * Tg.radTan(th) + e)],
              'rise above eye level ' + t('=' + d + '\\tan ' + dg(th) + '=' + fl(rise)) + ' m (TOA)<br>height ' + t('=' + f1(e) + '+' + fl(rise) + '=' + fl(H) + '\\approx ' + fx(H, 1)),
              ['The clinometer measures from eye level. The triangle gives the rise above the eyes.', 'height = eye height + distance × tan(angle).'], 'clinometer flagpole NR', true);
          } }] },

      /* ---------- Q9: two legs (extension: bearings) ---------- */
      { num: '9', section: 'Extension — Bearings', shared: function (r) {
          return until(r, function (r) {
            var b1 = r.int(30, 65), d1 = r.int(10, 25), b2 = r.int(100, 140), d2 = r.int(12, 30);
            var E = d1 * Tg.sin(b1) + d2 * Tg.sin(b2), N = d1 * Tg.cos(b1) + d2 * Tg.cos(b2), be = Tg.atan(E / N);
            if (N < 0.8 || N > 8 || be > 88 || be < 60) return null;
            return { b1: b1, d1: d1, b2: b2, d2: d2, E: E, N: N };
          }, { b1: 48, d1: 16, b2: 112, d2: 21, E: 16 * Tg.sin(48) + 21 * Tg.sin(112), N: 16 * Tg.cos(48) + 21 * Tg.cos(112) });
        },
        stem: function (sh) { return '<i>(Extension)</i> A rescue helicopter flies from a base station, ' + t('B') + ', on a bearing of ' + t(dg(b3(sh.b1))) + ' for ' + t(sh.d1) + ' km to a checkpoint, ' + t('V') + '. At ' + t('V') + ' it changes course and flies on a bearing of ' + t(dg(b3(sh.b2))) + ' for ' + t(sh.d2) + ' km to a platform, ' + t('K') + '. ' + t('BN') + ' and ' + t('VM') + ' are north lines at ' + t('B') + ' and ' + t('V') + '.<br>' + twoLegFig(sh.b1, sh.d1, sh.b2, sh.d2, ['B', 'V', 'K', 'N', 'M'], [sh.d1 + ' km', sh.d2 + ' km']); },
        parts: [
          { id: '9a', level: 'BEG', make: function (r, sh) {
            var b1 = sh.b1, b2 = sh.b2;
            return K.P.fields('State the sizes of angle ' + t('NBV') + ' and angle ' + t('MVK') + ' (the angles you would mark on the diagram).', [{ label: t('\\angle NBV='), after: '°' }, { label: t('\\angle MVK='), after: '°' }],
              [intCheck(b1, [A(90 - b1, 'bearing-ref', 'A bearing is measured from <b>north</b> (the line ' + t('BN') + '), clockwise — not from east.')]),
               intCheck(b2, [A(180 - b2, 'bearing-ref', 'That is the angle between ' + t('VK') + ' and the <b>south</b> direction. ' + t('\\angle MVK') + ' runs from north (' + t('VM') + ') clockwise to ' + t('VK') + ' — it is the bearing itself.'), A(b2 - 90, 'bearing-ref', '∠MVK is measured from the north line ' + t('VM') + ', not from east.')])],
              [String(b1), String(b2)], t('\\angle NBV=' + dg(b1)) + ', ' + t('\\angle MVK=' + dg(b2)),
              'A bearing is the angle turned <b>clockwise from north</b>. At ' + t('B') + ' the turn from ' + t('BN') + ' to ' + t('BV') + ' is the first bearing, ' + t(dg(b1)) + '. At ' + t('V') + ' the turn from ' + t('VM') + ' to ' + t('VK') + ' is the second bearing, ' + t(dg(b2)) + ' (more than ' + t('90^\\circ') + ': ' + t('VK') + ' heads south of east).',
              ['Each bearing is measured at its own north line, clockwise.'], 'mark bearing angles ' + b1 + ', ' + b2);
          } },
          { id: '9b', level: 'PRG', make: function (r, sh) {
            var b1 = sh.b1, d1 = sh.d1, b2 = sh.b2, d2 = sh.d2, ref = 180 - b2, e1 = d1 * Tg.sin(b1), e2 = d2 * Tg.sin(ref), E = e1 + e2;
            return nearP('Determine, to the nearest ' + t('0.1') + ' km, how far ' + t('K') + ' is east of ' + t('B') + '.', E, 1, 'km', [
              A(d1 * Tg.cos(b1) + d2 * Tg.cos(ref), 'trig-ratio', 'The east–west part of a leg is <b>opposite</b> its angle from the north–south line: use ' + t('d\\sin') + ', not ' + t('d\\cos') + '.'),
              A(e1 + d2 * Tg.cos(ref), 'bearing-ref', 'For the second leg the reference angle is ' + t('180^\\circ-' + b2 + '^\\circ=' + dg(ref)) + ' from the <b>south</b> line; its east part is opposite that angle: ' + t(d2 + '\\sin ' + dg(ref)) + '.'),
              A(e1 - e2, 'ns-dir', 'Both legs head <b>east</b> (bearings between ' + t('000^\\circ') + ' and ' + t('180^\\circ') + '), so the east parts add.'),
              aRad(d1 * Tg.radSin(b1) + d2 * Tg.radSin(ref))],
              'Leg ' + t('BV') + ': bearing ' + t(dg(b3(b1))) + ', ' + t(dg(b1)) + ' from north: east part ' + t('=' + d1 + '\\sin ' + dg(b1) + '=' + fl(e1)) + '.<br>Leg ' + t('VK') + ': bearing ' + t(dg(b2)) + ', reference angle ' + t('180^\\circ-' + b2 + '^\\circ=' + dg(ref)) + ' from south: east part ' + t('=' + d2 + '\\sin ' + dg(ref) + '=' + fl(e2)) + '.<br>Both go east: ' + t(fl(e1) + '+' + fl(e2) + '=' + fl(E) + '\\approx ' + fx(E, 1)) + ' km',
              ['Split each leg into an east part (' + t('d\\sin') + ' of its angle from the north–south line) and a north–south part.', 'For the second leg, use ' + t('180^\\circ-' + b2 + '^\\circ') + ' from the south line.'], 'two-leg east component');
          } },
          { id: '9c', level: 'PRG', make: function (r, sh) {
            var b1 = sh.b1, d1 = sh.d1, b2 = sh.b2, d2 = sh.d2, ref = 180 - b2, n1 = d1 * Tg.cos(b1), s2 = d2 * Tg.cos(ref), N = n1 - s2;
            return nearP('Determine, to the nearest ' + t('0.1') + ' km, how far ' + t('K') + ' is north of ' + t('B') + '.', N, 1, 'km', [
              A(n1 + s2, 'ns-dir', 'The second leg (bearing ' + t(dg(b2)) + ') heads <b>south</b>, so its north–south part is subtracted from the first leg’s north part.'),
              A(d1 * Tg.sin(b1) - d2 * Tg.sin(ref), 'trig-ratio', 'The north–south part of a leg is <b>adjacent</b> to its angle from the north–south line: use ' + t('d\\cos') + '.'),
              A(n1 + d2 * Tg.cos(b2 - 90), 'bearing-ref', 'Use the reference angle from the south line, ' + t('180^\\circ-' + b2 + '^\\circ=' + dg(ref)) + ': south part ' + t('=' + d2 + '\\cos ' + dg(ref)) + '.'),
              A(n1 - d2 * Tg.cos(b2 - 90), 'bearing-ref', 'The reference angle for the second leg is measured from the <b>south</b> line: ' + t(dg(ref)) + '.'),
              aRad(d1 * Tg.radCos(b1) - d2 * Tg.radCos(ref))],
              'Leg ' + t('BV') + ' goes north: ' + t(d1 + '\\cos ' + dg(b1) + '=' + fl(n1)) + '.<br>Leg ' + t('VK') + ' goes <b>south</b>: ' + t(d2 + '\\cos ' + dg(ref) + '=' + fl(s2)) + '.<br>North of ' + t('B') + ': ' + t(fl(n1) + '-' + fl(s2) + '=' + fl(N) + '\\approx ' + fx(N, 1)) + ' km',
              ['North–south part of each leg = ' + t('d\\cos') + ' (its angle from the north–south line).', 'Which leg goes north and which goes south?'], 'two-leg north component');
          } },
          { id: '9d', level: 'ADV', make: function (r, sh) {
            var E = sh.E, N = sh.N, D = Math.hypot(E, N);
            return nearP('Determine, to the nearest ' + t('0.1') + ' km, the direct distance from ' + t('B') + ' to ' + t('K') + '.', D, 1, 'km', [
              A(sh.d1 + sh.d2, 'leg-sum', 'That is the total distance flown. The direct distance is the hypotenuse of the triangle made by the east and north parts of ' + t('BK') + '.'),
              A(Math.sqrt(sh.d1 * sh.d1 + sh.d2 * sh.d2), 'not-right', 'The turn at ' + t('V') + ' is not a right angle, so the two legs don’t make a right triangle. Use the east and north parts of ' + t('BK') + ' instead.'),
              A(Math.hypot(RT(E, 1), RT(N, 1)), 'early-round', EARLY), A(E + N, 'leg-sum', 'Combine the east and north parts with the Pythagorean theorem, not by adding them.')],
              'East part ' + t('=' + sh.d1 + '\\sin ' + dg(sh.b1) + '+' + sh.d2 + '\\sin ' + dg(180 - sh.b2) + '=' + fl(E)) + ' km; north part ' + t('=' + sh.d1 + '\\cos ' + dg(sh.b1) + '-' + sh.d2 + '\\cos ' + dg(180 - sh.b2) + '=' + fl(N)) + ' km.<br>Pythagorean theorem on the unrounded parts:<br>' + t('BK=\\sqrt{' + fl(E) + '^{2}+' + fl(N) + '^{2}}=' + fl(D) + '\\approx ' + fx(D, 1)) + ' km',
              ['Find how far ' + t('K') + ' is east and north of ' + t('B') + ' (split each leg into parts).', 'Those two parts are the legs of a right triangle with hypotenuse ' + t('BK') + '.'], 'two-leg direct distance');
          } },
          { id: '9e', level: 'ADV', make: function (r, sh) {
            var E = sh.E, N = sh.N, be = Tg.atan(E / N);
            return bearingP('Determine the three-figure bearing of ' + t('K') + ' from ' + t('B') + '.', be, [
              A(Tg.atan(N / E), 'other-angle', 'That is the angle measured from the <b>east</b> line. A bearing is measured from north: the angle from north is opposite the east part, so ' + t('\\tan\\theta=\\frac{\\text{east}}{\\text{north}}') + '.'),
              A(be + 180, 'bearing-back', 'That is the bearing of ' + t('B') + ' from ' + t('K') + ' (the way back).'), A(90 + Tg.atan(N / E), 'ns-dir', t('K') + ' is slightly <b>north</b> of east, so its bearing is just under ' + t('090^\\circ') + '.'),
              A(Math.atan(E / N), 'trig-rad', RAD)],
              t('K') + ' is ' + t(fl(E)) + ' km east and ' + t(fl(N)) + ' km north of ' + t('B') + ', so its bearing is just under ' + t('090^\\circ') + '. The angle from north is opposite the east part and adjacent to the north part:<br>' + t('\\tan\\theta=\\dfrac{' + fl(E) + '}{' + fl(N) + '}\\Rightarrow\\theta=' + fx(be, 2) + '^\\circ') + ', bearing ' + t('\\approx ' + dg(b3(be))),
              ['Use the east and north parts of ' + t('BK') + '. Which one is opposite the angle measured from north?', 'Write the answer with three digits.'], 'bearing from components');
          } }] },

      /* ---------- Q10, Q11: drone (extension MC) ---------- */
      { num: '10', shared: function (r) { return droneShared(r); },
        stem: function (sh) { return '<i>(Extension, Multiple Choice)</i> ' + droneStem(sh); },
        parts: [
          { id: '10', level: 'PRG', make: function (r, sh) {
            var a = sh.a, b = sh.b, c = Math.round(Math.hypot(a, b)), sub = Math.round(Math.sqrt(Math.abs(b * b - a * a)));
            return K.P.mc(r, 'The direct distance, in m, from ' + t('U') + ' to ' + t('S') + ' is', [
              { html: t(c), right: true },
              { html: t(a + b), why: 'You added the two legs. The drone turns through ' + t('90^\\circ') + ' at ' + t('T') + ', so ' + t('US') + ' is the hypotenuse of a right triangle: use the Pythagorean theorem.' },
              { html: t(sub), why: 'You subtracted the squares. ' + t('US') + ' is the hypotenuse, so ' + t('US^{2}=' + a + '^{2}+' + b + '^{2}') + '.' },
              { html: t(Math.max(a, b)), why: 'That is the length of one leg. ' + t('US') + ' is the hypotenuse — longer than either leg.' }],
              'The bearings ' + t(dg(b3(sh.b1))) + ' and ' + t(dg(b3(sh.b2))) + ' differ by exactly ' + t('90^\\circ') + ', so the drone turns through a right angle at ' + t('T') + ': triangle ' + t('STU') + ' is right-angled at ' + t('T') + '.<br>' + t('US=\\sqrt{' + a + '^{2}+' + b + '^{2}}=\\sqrt{' + F(a * a + b * b) + '}=' + c) + ' m',
              ['Compare the two bearings. What angle does the drone turn through at ' + t('T') + '?'], 'drone direct distance');
          } }] },
      { num: '11', shared: function (r) { return droneShared(r); },
        stem: function (sh) { return '<i>(Extension, Multiple Choice)</i> ' + droneStem(sh); },
        parts: [
          { id: '11', level: 'PRG', make: function (r, sh) {
            var Fb = sh.b1 + Tg.atan(sh.b / sh.a), f = Math.round(Fb), R = f + 180;
            return K.P.mc(r, 'The three-figure bearing the drone uses to fly from ' + t('U') + ' back to ' + t('S') + ' is', [
              { html: t(dg(b3(R))), right: true },
              { html: t(dg(b3(f))), why: 'That is the bearing of ' + t('U') + ' from ' + t('S') + ' — the outbound direction. Flying back from ' + t('U') + ' to ' + t('S') + ' is the opposite direction: add ' + t('180^\\circ') + '.' },
              { html: t(dg(b3(180 - f))), why: 'Bearings are measured <b>clockwise from north</b> at ' + t('U') + '. ' + t('S') + ' is north-west of ' + t('U') + ', so the bearing is between ' + t('270^\\circ') + ' and ' + t('360^\\circ') + '.' },
              { html: t(dg(b3(360 - f))), why: t('S') + ' is north-<b>west</b> of ' + t('U') + ' (between ' + t('270^\\circ') + ' and ' + t('360^\\circ') + '). The return bearing is the outbound bearing ' + t('+180^\\circ') + '.' }],
              'At ' + t('S') + ': ' + t('\\tan(\\angle TSU)=\\dfrac{' + sh.b + '}{' + sh.a + '}') + ', so ' + t('\\angle TSU=' + fx(Tg.atan(sh.b / sh.a), 2) + '^\\circ') + '. The bearing of ' + t('U') + ' from ' + t('S') + ' is ' + t(sh.b1 + '^\\circ+' + fx(Tg.atan(sh.b / sh.a), 2) + '^\\circ\\approx ' + dg(b3(f))) + '.<br>From ' + t('U') + ' back to ' + t('S') + ' is the opposite direction: ' + t(b3(f) + '^\\circ+180^\\circ=' + dg(b3(R))) + '.<br>(' + t(dg(b3(f))) + ' is the outbound bearing, not the return.)',
              ['First find the bearing of ' + t('U') + ' from ' + t('S') + ' (use the right angle at ' + t('T') + ').', 'The return bearing differs from it by ' + t('180^\\circ') + '.'], 'drone return bearing');
          } }] }
    ],

    extra: [
      /* ---------- Part A ---------- */
      { num: '1', section: 'Extra practice A — Both angles are measured from the horizontal', stem: 'In each diagram one angle has been marked. Is it the angle of <b>elevation</b>, the angle of <b>depression</b>, or <b>neither</b>? (If it is neither, which is the correct angle?)', parts: [
        { id: 'e1a', level: 'LIM', make: function (r) {
          var a = r.int(20, 60), W = 10, h = W * Tg.tan(a);
          var fig = HW.fig({ pts: { O: [0, 0], T: [W, h], H: [W * 1.08, 0] }, names: { O: 'O', T: 'T' }, segs: [['O', 'T']], extra: [{ type: 'dash', from: [0, 0], to: [W * 1.08, 0] }, { type: 'eye', at: [0, 0] }, { type: 'eye', at: [W, h] }], angles: [['O', 'H', 'T', deg(a)]], width: 240 });
          return K.P.mc(r, 'A birdwatcher at ' + t('O') + ' sights a nest at ' + t('T') + '. The dashed line is horizontal.<br>' + fig, [
            { html: 'The angle of elevation, ' + t(dg(a)), right: true },
            { html: 'The angle of depression, ' + t(dg(a)), why: 'From ' + t('O') + ' the line of sight goes <b>up</b> to the nest, so it is an elevation.' },
            { html: 'Neither — it is measured from the vertical; the angle of elevation is ' + t(dg(90 - a)), why: 'The dashed line is <b>horizontal</b>, and the angle is between it and the line of sight — exactly how elevation is measured.' },
            { html: 'Neither — it is measured at the nest, not at the observer', why: 'Look at where the arc is: it is at ' + t('O') + ', the observer.' }],
            'The ' + t(dg(a)) + ' is at the observer ' + t('O') + ', between the horizontal and the line of sight <b>up</b> to ' + t('T') + ', so it is the angle of elevation: ' + t(dg(a)) + '.', ['Where is the angle — at the observer? Between which two lines? Is the sight line going up or down?'], 'classify marked angle (elevation)');
        } },
        { id: 'e1b', level: 'BEG', make: function (r) {
          var m = r.int(50, 75), Hc = 3, w = Hc * Tg.tan(m);
          var fig = HW.fig({ pts: { P: [0, Hc], C: [0, 0], B: [w, 0], H: [w, Hc] }, names: { P: 'P', B: 'B' }, segs: [['P', 'B'], ['P', 'C', { width: 1.4 }], ['P', 'H', { dash: 1, width: 1.4, color: GREY }]], angles: [['P', 'C', 'B', deg(m)]], extra: [{ type: 'ground', y: 0, x0: -2.2, x1: w + 0.6 }, { type: 'building', at: [-1, 0], w: 2, h: Hc }], width: 280 });
          return K.P.mc(r, 'A ranger at ' + t('P') + ', on a cliff edge, sights a boat at ' + t('B') + '. The dashed line is horizontal.<br>' + fig, [
            { html: 'Neither — it is measured from the vertical cliff face; the angle of depression is ' + t(dg(90 - m)), right: true },
            { html: 'The angle of depression, ' + t(dg(m)), why: 'Look at which line the angle starts from: the <b>cliff face</b>, which is vertical. An angle of depression is measured down from the <b>horizontal</b> (the dashed line).' },
            { html: 'Neither — it is measured from the vertical; the angle of depression is ' + t(dg(180 - m)), why: 'The horizontal and the vertical meet at ' + t('90^\\circ') + ', so the angle from the horizontal is ' + t('90^\\circ-' + dg(m)) + '.' },
            { html: 'The angle of elevation, ' + t(dg(90 - m)), why: 'From ' + t('P') + ' the ranger looks <b>down</b> at the boat — that is a depression.' }],
            '<b>Neither.</b> The ' + t(dg(m)) + ' is measured from the <b>vertical</b> cliff face at ' + t('P') + ', not from the dashed horizontal. Horizontal and vertical meet at ' + t('90^\\circ') + ', so the angle of depression is ' + t('90^\\circ-' + dg(m) + '=' + dg(90 - m)) + '.', ['Which line does the marked angle start from — the horizontal dashed line, or the cliff?'], 'classify marked angle (from vertical, depression)');
        } },
        { id: 'e1c', level: 'BEG', make: function (r) {
          var k = r.int(25, 60), Hm = 4, w = Hm / Tg.tan(k);
          var fig = HW.fig({ pts: { C: [0, Hm], G: [0, 0], D: [w, 0], H: [w, Hm] }, names: { C: 'C', D: 'D' }, segs: [['C', 'D'], ['G', 'C', { width: 3 }], ['G', 'D'], ['C', 'H', { dash: 1, width: 1.4, color: GREY }]], angles: [['D', 'G', 'C', deg(k)]], extra: [{ type: 'ground', y: 0, x0: -0.8, x1: w + 0.8 }], width: 260 });
          return K.P.mc(r, 'A camera at ' + t('C') + ', on top of a mast, sights a marker at ' + t('D') + '. The dashed line is horizontal.<br>' + fig, [
            { html: 'As drawn it is the angle of elevation of ' + t('C') + ' from ' + t('D') + ', ' + t(dg(k)) + ' — and the angle of depression of ' + t('D') + ' from ' + t('C') + ' is also ' + t(dg(k)), right: true },
            { html: 'The angle of depression from the camera, because the camera looks down', why: 'The arc is drawn at ' + t('D') + ', on the ground, between the ground and the line of sight <b>up</b> to ' + t('C') + ' — at ' + t('D') + ' it is an elevation (the depression from ' + t('C') + ' has the same size).' },
            { html: 'Neither; the angle of depression from ' + t('C') + ' is ' + t(dg(90 - k)), why: 'The horizontal at ' + t('C') + ' and the ground are parallel, so the depression at ' + t('C') + ' and the elevation at ' + t('D') + ' are alternate angles — they are <b>equal</b>.' },
            { html: 'The angle of elevation, ' + t(dg(k)) + '; the angle of depression from ' + t('C') + ' is ' + t(dg(90 - k)), why: 'The depression from ' + t('C') + ' is measured from the dashed horizontal, which is parallel to the ground: alternate angles are equal.' }],
            'The ' + t(dg(k)) + ' is at ' + t('D') + ', between the horizontal ground and the line of sight up to ' + t('C') + ', so as drawn it is the angle of <b>elevation</b> of the camera from the marker. The two horizontals are parallel, so the angle of depression of ' + t('D') + ' from ' + t('C') + ' is also ' + t(dg(k)) + '.', ['Where is the arc drawn, and which two lines make it?'], 'classify marked angle at the ground');
        } },
        { id: 'e1d', level: 'BEG', make: function (r) {
          var m = r.int(20, 70), L = 5, B = [L * Tg.sin(m), L * Tg.cos(m)];
          var fig = HW.fig({ pts: { O: [0, 0], U: [0, L * 1.05], B: B }, names: { O: 'O', B: 'B' }, segs: [['O', 'B'], ['O', 'U', { dash: 1, width: 1.4, color: GREY }]], angles: [['O', 'U', 'B', deg(m)]], extra: [{ type: 'ground', y: 0, x0: -1.2, x1: B[0] + 1 }, { type: 'eye', at: B }, { type: 'text', at: [-0.5, L * 0.9], text: 'vertical' }], width: 230 });
          return K.P.mc(r, 'An observer at ' + t('O') + ' sights a balloon at ' + t('B') + '. The dashed line points straight up.<br>' + fig, [
            { html: 'Neither — it is measured from the vertical; the angle of elevation is ' + t(dg(90 - m)), right: true },
            { html: 'The angle of elevation, ' + t(dg(m)), why: 'The dashed line is <b>vertical</b> (straight up). Elevation is measured up from the <b>horizontal</b>.' },
            { html: 'The angle of depression, ' + t(dg(90 - m)), why: 'The observer looks <b>up</b> at the balloon — that is an elevation, not a depression.' },
            { html: 'Neither — the angle of elevation is ' + t(dg(180 - m)), why: 'The vertical and the horizontal meet at ' + t('90^\\circ') + ': subtract from ' + t('90^\\circ') + ', not ' + t('180^\\circ') + '.' }],
            '<b>Neither.</b> The ' + t(dg(m)) + ' is measured from the vertical “straight up” line at ' + t('O') + '. The angle of elevation is measured from the horizontal: ' + t('90^\\circ-' + dg(m) + '=' + dg(90 - m)) + '.', ['Is the dashed line horizontal or vertical?'], 'classify marked angle (from vertical, elevation)');
        } }] },
      { num: '2', shared: function (r) { var c = r.pick([['A harbour officer stands at the top', 'signal tower', 'a kayak', 'water surface'], ['A lighthouse keeper stands at the top', 'lighthouse', 'a sailboat', 'water surface'], ['A ranger stands at the top', 'fire tower', 'a tent', 'level ground']]); return { c: c, d: r.int(18, 40) }; },
        stem: function (sh) {
          var W = 10, h = W * Tg.tan(vis(sh.d, 26, 40));
          return '<b>The swap, proved once.</b> ' + sh.c[0] + ' ' + t('T') + ' of a ' + sh.c[1] + ' and sights ' + sh.c[2] + ' at ' + t('K') + '. ' + t('TH') + ' is the horizontal line through ' + t('T') + ', and ' + t('BK') + ' is the horizontal ' + sh.c[3] + ' through the base ' + t('B') + '. The angle of depression of ' + t('K') + ' from ' + t('T') + ' is ' + t('d') + ', and the angle of elevation of ' + t('T') + ' from ' + t('K') + ' is ' + t('e') + '.<br>' +
            HW.fig({ pts: { T: [0, h], B: [0, 0], K: [W, 0], H: [W * 1.05, h] }, segs: [['T', 'B', { width: 3 }], ['B', 'K'], ['T', 'K'], ['T', 'H', { dash: 1, width: 1.4, color: GREY }]], right: [['B', 'T', 'K']], angles: [['T', 'H', 'K', 'd', { r: 32 }], ['K', 'B', 'T', 'e', { r: 32 }]], extra: [{ type: 'ground', y: 0, x0: -1, x1: W * 1.08 }], width: 280 });
        },
        parts: [
          { id: 'e2a', level: 'LIM', make: function (r) {
            return K.P.mc(r, 'Name the two parallel lines in the figure, and the transversal that cuts them.', [
              { html: t('TH\\parallel BK') + ', cut by the transversal ' + t('TK'), right: true },
              { html: t('TB\\parallel BK') + ', cut by the transversal ' + t('TK'), why: t('TB') + ' and ' + t('BK') + ' meet at ' + t('B') + ' (at a right angle), so they can’t be parallel.' },
              { html: t('TH\\parallel TK') + ', cut by the transversal ' + t('BK'), why: t('TK') + ' is the line of sight — it meets ' + t('TH') + ' at ' + t('T') + '. Which two lines are both horizontal?' },
              { html: t('TH\\parallel TB') + ', cut by the transversal ' + t('TK'), why: t('TH') + ' is horizontal and ' + t('TB') + ' is vertical: they meet at ' + t('T') + ' at ' + t('90^\\circ') + '.' }],
              t('TH') + ' (the horizontal through ' + t('T') + ') and ' + t('BK') + ' (the horizontal through ' + t('B') + ') are both horizontal, so ' + t('TH\\parallel BK') + '. The line of sight ' + t('TK') + ' cuts them both: it is the transversal.', ['Which two lines are both horizontal?'], 'parallel lines in depression figure');
          } },
          { id: 'e2b', level: 'BEG', make: function (r) {
            return K.P.mc(r, 'Using that pair of parallel lines, why is ' + t('d=e') + '?', [
              { html: t('d') + ' and ' + t('e') + ' are <b>alternate interior angles</b> between the parallel lines ' + t('TH') + ' and ' + t('BK') + ', cut by ' + t('TK') + ', so they are equal.', right: true },
              { html: t('d') + ' and ' + t('e') + ' are vertically opposite angles.', why: 'Vertically opposite angles share a vertex. ' + t('d') + ' is at ' + t('T') + ' and ' + t('e') + ' is at ' + t('K') + '.' },
              { html: t('d') + ' and ' + t('e') + ' add to ' + t('90^\\circ') + ', and the triangle has a right angle.', why: 'It is ' + t('e') + ' and ' + t('\\angle BTK') + ' that add to ' + t('90^\\circ') + '. ' + t('d') + ' and ' + t('e') + ' are equal — look for the “Z” shape between the parallel lines.' },
              { html: t('d') + ' and ' + t('e') + ' are co-interior angles, so they are equal.', why: 'Co-interior angles (on the same side of the transversal) <b>add to</b> ' + t('180^\\circ') + '. ' + t('d') + ' and ' + t('e') + ' are on opposite sides, in a “Z”.' }],
              t('d') + ' and ' + t('e') + ' sit in a “Z” between the parallel lines ' + t('TH') + ' and ' + t('BK') + ', on opposite sides of the transversal ' + t('TK') + ': they are alternate interior angles, so ' + t('d=e') + '. The angle of depression always equals the angle of elevation.', ['Look for a “Z” shape made by the two horizontals and the line of sight.'], 'why depression = elevation');
          } },
          { id: 'e2c', level: 'EMG', make: function (r) {
            var S = [
              { s: 'A classmate says: “The angle of depression is always bigger than the angle of elevation, because you are higher up.”', v: false, why: t('d') + ' and ' + t('e') + ' are alternate angles between parallel horizontals, so they are always <b>equal</b>. Height changes both together.' },
              { s: '“If the tower were taller (at the same distance), the angle of depression ' + t('d') + ' would be bigger than the angle of elevation ' + t('e') + '.”', v: false, why: 'A taller tower makes <b>both</b> angles bigger — but they stay equal: the proof that ' + t('d=e') + ' used no lengths.' },
              { s: '“The angle of elevation ' + t('e') + ' is ' + t('90^\\circ') + ' minus the angle of depression ' + t('d') + '.”', v: false, why: t('90^\\circ-d') + ' is ' + t('\\angle BTK') + ', the angle measured from the tower. ' + t('e') + ' equals ' + t('d') + '.' },
              { s: '“If the object at ' + t('K') + ' moves farther from the base, ' + t('d') + ' and ' + t('e') + ' both get smaller, but they stay equal.”', v: true, why: 'Farther away means a shallower line of sight, so both angles shrink — and they are still alternate angles, so they are equal.' },
              { s: '“The angle of depression from ' + t('T') + ' equals the angle of elevation from ' + t('K') + ' for every tower height and every distance.”', v: true, why: 'The proof (alternate angles between the two horizontals) never used a length, so it works for every height and distance.' },
              { s: '“On a taller tower, at the same distance, both angles would be larger — but still equal to each other.”', v: true, why: 'Both angles grow together; the alternate-angle argument still says they are equal.' }];
            var s = r.pick(S);
            return K.P.tf(r, 'True or false? ' + s.s, s.v, s.why, (s.v ? '<b>True.</b> ' : '<b>False.</b> ') + s.why, ['Use what you proved: ' + t('d') + ' and ' + t('e') + ' are alternate angles.'], 'depression vs elevation claim');
          } },
          { id: 'e2d', level: 'BEG', make: function (r) {
            var askK = r.chance(0.3), right = askK ? 'd' : '90^\\circ-d';
            var opts = [{ tex: 'd', why: askK ? null : t('\\angle BTK') + ' is measured from the <b>vertical</b> tower ' + t('TB') + ', not from the horizontal ' + t('TH') + '. ' + t('\\angle BTH=90^\\circ') + '.' },
              { tex: '90^\\circ-d', why: askK ? t('\\angle TKB') + ' is the angle of elevation ' + t('e') + ' at ' + t('K') + ', which equals ' + t('d') + ' (alternate angles).' : null },
              { tex: '180^\\circ-d', why: 'The tower and the horizontal ' + t('TH') + ' meet at ' + t('90^\\circ') + ', not ' + t('180^\\circ') + '.' },
              { tex: '90^\\circ+d', why: t('\\angle BTK') + ' is inside the right angle ' + t('\\angle BTH') + ', so it is <b>less</b> than ' + t('90^\\circ') + '.' }];
            return K.P.mc(r, askK ? 'Write ' + t('\\angle TKB') + ' (the angle at ' + t('K') + ' inside the triangle) in terms of ' + t('d') + '.' : t('\\angle BTK') + ' is <b>not</b> equal to ' + t('d') + '. Write ' + t('\\angle BTK') + ' in terms of ' + t('d') + '. (It is measured from the tower.)',
              opts.map(function (o) { return { html: t(o.tex), right: o.tex === right, why: o.why }; }),
              askK ? t('\\angle TKB=e=d') + ' (alternate angles between the parallel horizontals).' : t('\\angle BTK') + ' is measured from the <b>vertical</b> tower ' + t('TB') + '. Since ' + t('\\angle BTH=90^\\circ') + ' and ' + t('d') + ' is the part from ' + t('TH') + ' to ' + t('TK') + ': ' + t('\\angle BTK=90^\\circ-d') + '. (This is the angle you get if the protractor is laid along the tower instead of the horizontal.)',
              ['The tower is vertical and ' + t('TH') + ' is horizontal: ' + t('\\angle BTH=90^\\circ') + '.'], askK ? 'angle TKB in terms of d' : 'angle BTK in terms of d');
          } }] },
      { num: '3', shared: function (r) { return { h: tenth(r, 20, 50), th: r.int(15, 40) }; },
        stem: function (sh) { return '<b>Using the swap.</b> From the top of a grain elevator ' + t(f1(sh.h)) + ' m tall, the angle of depression of a parked truck on the level ground below is ' + t(dg(sh.th)) + '.<br>' + deprScene({ th: sh.th, hLab: f1(sh.h) + ' m', obj: 'building', extra: [{ type: 'text', at: [10, -0.8], text: 'truck' }] }); },
        parts: [
          { id: 'e3a', level: 'BEG', make: function (r, sh) {
            var th = sh.th;
            return K.P.mc(r, 'What is the angle of elevation of the top of the elevator from the truck, and why?', [
              { html: t(dg(th)) + ': the horizontal at the top and the ground are parallel, and the line of sight is a transversal, so the angles are alternate interior angles.', right: true },
              { html: t(dg(90 - th)) + ': the two angles add to ' + t('90^\\circ') + '.', why: t(dg(90 - th)) + ' is the angle at the top measured from the elevator wall. The angle of elevation at the truck equals the angle of depression (alternate angles).' },
              { html: t(dg(th)) + ': the angles are vertically opposite.', why: 'Right size, wrong reason: vertically opposite angles share a vertex. These are at different points — they are <b>alternate</b> angles between parallel lines.' },
              { html: t(dg(180 - th)) + ': co-interior angles add to ' + t('180^\\circ') + '.', why: 'The angles are on opposite sides of the line of sight (a “Z”), so they are alternate angles and equal.' }],
              'The horizontal at the top of the elevator and the level ground are parallel; the line of sight is the transversal. The angle of elevation at the truck and the angle of depression at the top are alternate interior angles: both ' + t(dg(th)) + '.', ['Look for a “Z” between the two horizontal lines.'], 'swap: elevation equals depression');
          } },
          { id: 'e3b', level: 'EMG', make: function (r, sh) {
            var h = sh.h, th = sh.th, d = h / Tg.tan(th);
            return nearP('Determine the horizontal distance from the base of the elevator to the truck, to the nearest tenth of a metre.', d, 1, 'm', [
              A(h * Tg.tan(th), 'depr-vertical', 'That puts the ' + t(dg(th)) + ' against the elevator wall. It is measured from the <b>horizontal</b>: use the equal angle at the truck, where ' + t(f1(h)) + ' m is opposite and the distance is adjacent.'),
              A(h / Tg.sin(th), 'trig-ratio', 'That is the line of sight (the hypotenuse). The horizontal distance is adjacent to the angle at the truck ⇒ TOA.'), aRad(h / Tg.radTan(th))],
              'At the truck the angle is ' + t(dg(th)) + ': the height ' + t(f1(h)) + ' m is <b>opposite</b> and the distance ' + t('d') + ' is <b>adjacent</b> (TOA).<br>' + t('\\tan ' + dg(th) + '=\\dfrac{' + f1(h) + '}{d}\\Rightarrow d=\\dfrac{' + f1(h) + '}{\\tan ' + dg(th) + '}=' + fl(d) + '\\approx ' + fx(d, 1)) + ' m',
              ['Work in the triangle at the truck, where the angle is ' + t(dg(th)) + '.', 'Opposite and adjacent ⇒ tan; the unknown is in the denominator.'], 'elevator distance');
          } },
          { id: 'e3c', level: 'EMG', make: function (r, sh) {
            var h = sh.h, th = sh.th, s = h / Tg.sin(th);
            return nearP('Determine the length of the line of sight from the top of the elevator to the truck, to the nearest tenth of a metre.', s, 1, 'm', [
              A(h * Tg.sin(th), 'trig-inverted', 'From ' + t('\\sin ' + dg(th) + '=\\frac{' + f1(h) + '}{s}') + ' the line of sight is in the denominator: divide.'),
              A(h / Tg.cos(th), 'trig-ratio', 'Relative to the ' + t(dg(th)) + ' at the truck, the height is <b>opposite</b> (not adjacent) and the line of sight is the hypotenuse ⇒ SOH.'),
              A(h / Tg.tan(th), 'trig-ratio', 'That is the horizontal distance. The line of sight is the hypotenuse ⇒ SOH.'), aRad(h / Tg.radSin(th))],
              'Relative to the ' + t(dg(th)) + ' at the truck, ' + t(f1(h)) + ' m is <b>opposite</b> and the line of sight is the <b>hypotenuse</b> (SOH).<br>' + t('s=\\dfrac{' + f1(h) + '}{\\sin ' + dg(th) + '}=' + fl(s) + '\\approx ' + fx(s, 1)) + ' m<br>Check by Pythagoras: ' + t('\\sqrt{' + f1(h) + '^{2}+' + fl(h / Tg.tan(th)) + '^{2}}=' + fl(s)) + ' ✓',
              ['The line of sight is the hypotenuse. Which side do you know?'], 'elevator line of sight');
          } }] },

      /* ---------- Part B: eye level ---------- */
      { num: '4', section: 'Extra practice B — Eye level: the triangle gives only the rise above the instrument', shared: function (r) {
          return until(r, function (r) { var e = r.pick([1.5, 1.6, 1.7, 1.8]), d = tenth(r, 30, 70), th = r.int(25, 50), Hh = d * Tg.tan(th) + e; return Math.round(Tg.atan(Hh / d)) !== th ? { e: e, d: d, th: th } : null; }, { e: 1.7, d: 52, th: 41 });
        },
        stem: function (sh) { return 'A hiker’s eyes are ' + t(f1(sh.e)) + ' m above the ground. Standing on level ground ' + t(f1(sh.d)) + ' m horizontally from the foot of an escarpment, she measures the angle of elevation of the rim to be ' + t(dg(sh.th)) + '.<br>' + eyeScene({ th: sh.th, eyeLab: f1(sh.e) + ' m', runLab: f1(sh.d) + ' m', obj: 'cliff', aria: 'hiker and escarpment' }); },
        parts: [
          { id: 'e4a', level: 'BEG', make: function (r, sh) {
            var e = sh.e, d = sh.d, th = sh.th, rise = d * Tg.tan(th);
            return nearP('Calculate the height of the rim <b>above the hiker’s eye level</b>, to the nearest tenth of a metre.', rise, 1, 'm', [
              A(rise + e, 'eye-added', 'This part asks only for the height <b>above eye level</b> — exactly what the triangle gives. Don’t add the eye height here.'),
              A(d * Tg.sin(th), 'trig-ratio', 'The rise is opposite and ' + t(f1(d)) + ' m is adjacent ⇒ TOA.'), A(d / Tg.tan(th), 'trig-inverted', 'The rise is on top of the ratio: multiply, ' + t('\\text{rise}=' + f1(d) + '\\tan ' + dg(th)) + '.'), aRad(d * Tg.radTan(th))],
              'Relative to the ' + t(dg(th)) + ' at her eye: the rise above eye level is <b>opposite</b>, ' + t(f1(d)) + ' m is <b>adjacent</b>.<br>' + t('\\text{rise}=' + f1(d) + '\\tan ' + dg(th) + '=' + fl(rise) + '\\approx ' + fx(rise, 1)) + ' m above eye level',
              ['The triangle sits on the eye-level line. Opposite and adjacent ⇒ tan.'], 'rise above eye level');
          } },
          { id: 'e4b', level: 'PRG', make: function (r, sh) {
            var e = sh.e, d = sh.d, th = sh.th, rise = d * Tg.tan(th), H = rise + e;
            return nearP('Determine the height of the escarpment above the ground, to the nearest tenth of a metre.', H, 1, 'm', [
              A(rise, 'eye-height', 'That is the rise above her <b>eye level</b>. The triangle stands on the eye-level line, ' + t(f1(e)) + ' m above the ground — add it back.'),
              A(rise - e, 'eye-sub', 'Her eyes are above the ground, so add the eye height.'), A(d * Tg.sin(th) + e, 'trig-ratio', 'Opposite and adjacent ⇒ tan.'), aRad(d * Tg.radTan(th) + e)],
              'The triangle stands on the eye-level line, ' + t(f1(e)) + ' m above the ground, so add the eye height back.<br>' + t('h=' + f1(d) + '\\tan ' + dg(th) + '+' + f1(e) + '=' + fl(rise) + '+' + f1(e) + '=' + fl(H) + '\\approx ' + fx(H, 1)) + ' m<br>(Carry ' + t(fl(rise)) + ', not a rounded value.)',
              ['Find the rise above eye level, then add the eye height.'], 'escarpment height');
          } },
          { id: 'e4c', level: 'PRG', make: function (r, sh) {
            var e = sh.e, d = sh.d, th = sh.th, H = d * Tg.tan(th) + e, phi = Tg.atan(H / d);
            return nearP('A second hiker standing on the rim looks down at the first hiker’s <b>boots</b>. Determine the angle of depression of the boots, to the nearest degree. (Why isn’t it ' + t(dg(th)) + '?)<br>' + eyeScene({ th: th, eyeLab: f1(e) + ' m', runLab: f1(d) + ' m', obj: 'cliff', boots: true, aria: 'line of sight to the boots' }), phi, 0, '°', [
              A(th, 'eye-height', t(dg(th)) + ' is the angle to her <b>eyes</b>. The boots are ' + t(f1(e)) + ' m lower, so the drop from the rim is the full height of the escarpment and the line of sight is steeper.'),
              A(Tg.atan(d / H), 'other-angle', 'That angle is measured from the vertical. The angle of depression is from the horizontal: ' + t('\\tan\\theta=\\frac{\\text{drop}}{\\text{run}}') + '.'),
              A(Tg.atan((H - 2 * e) / d), 'eye-sub', 'The drop to the boots is the <b>whole</b> escarpment height (rise + eye height), not less.'),
              aRad(Math.atan(H / d))],
              'From the rim, the vertical drop to the <b>boots</b> is the full height ' + t(fl(H)) + ' m (not just the rise above her eyes); the horizontal run is still ' + t(f1(d)) + ' m.<br>' + t('\\tan\\theta=\\dfrac{' + fl(H) + '}{' + f1(d) + '}=' + fl(H / d)) + '<br>' + t('\\theta=\\tan^{-1}(' + fl(H / d) + ')=' + fx(phi, 2) + '^\\circ\\approx ' + dg(fx(phi, 0))) + '<br>It is not ' + t(dg(th)) + ': that is the depression of her <b>eyes</b>; the boots sit ' + t(f1(e)) + ' m lower, so that line of sight is steeper.',
              ['How far does the second hiker look <b>down</b> to the boots? It is more than the rise above the first hiker’s eyes.', 'Use the full height and the same horizontal distance with ' + t('\\tan^{-1}') + '.'], 'depression to the boots');
          } }] },
      { num: '5', shared: function (r) { return { D: tenth(r, 15, 40), e: r.pick([1.5, 1.6, 1.7, 1.8]), th: r.int(12, 35) }; },
        stem: function (sh) {
          var W = 10, H = W * Tg.tan(vis(sh.th, 28, 45)), ed = Math.max(H * 0.2, 1.2), Dd = H - ed;
          var fig = HW.fig({ pts: { E: [0, H], Df: [0, Dd], G: [0, 0], S: [W, 0], Hh: [W, H], a1: [-1.6, 0], a2: [-1.6, Dd], b1: [-0.6, Dd], b2: [-0.6, H], k1: [-0.9, Dd], k2: [1.2, Dd] }, names: false,
            segs: [['G', 'Df', { width: 3 }], ['G', 'S'], ['E', 'S'], ['E', 'Hh', { dash: 1, width: 1.4, color: GREY }], ['a1', 'a2', f1(sh.D) + ' m', { width: 1.2, color: GREY }], ['b1', 'b2', f1(sh.e) + ' m', { width: 1.2, color: GREY }], ['k1', 'k2', { width: 3 }]],
            right: [['G', 'Df', 'S']], angles: [['E', 'Hh', 'S', deg(sh.th), { r: 40 }]], extra: [{ type: 'ground', y: 0, x0: -2.2, x1: W + 1 }, { type: 'person', at: [0, Dd], h: ed * 1.1 }, { type: 'eye', at: [0, H] }, { type: 'text', at: [W, -0.9], text: 'picnic table' }], width: 300, aria: 'water tower deck' });
          return 'A visitor stands on the observation deck of a water tower. The deck floor is ' + t(f1(sh.D)) + ' m above level ground, and her eyes are ' + t(f1(sh.e)) + ' m above the deck floor. She sights a picnic table on the ground and measures the angle of depression to be ' + t(dg(sh.th)) + '.<br>' + fig;
        },
        parts: [
          { id: 'e5a', level: 'EMG', make: function (r, sh) {
            var D = sh.D, e = sh.e;
            return K.P.mc(r, 'Which vertical distance belongs inside the right triangle?', [
              { html: t(f1(D + e)) + ' m — the angle is measured at her eyes, so the vertical side runs from eye level down to the ground', right: true },
              { html: t(f1(D)) + ' m — the height of the deck floor', why: 'The angle is measured at her <b>eyes</b>, which are ' + t(f1(e)) + ' m above the floor. The triangle’s vertical side starts there.' },
              { html: t(f1(e)) + ' m — her eye height', why: 'That is only from the floor to her eyes. The line of sight goes all the way down to the ground.' },
              { html: t(f1(D - e)) + ' m — the floor height minus her eye height', why: 'Her eyes are <b>above</b> the floor, so the height of her eyes above the ground is the sum.' }],
              'The angle is measured at her <b>eyes</b>, so the horizontal reference line is at eye level and the vertical leg runs from eye level all the way down to the ground: ' + t(f1(D) + '+' + f1(e) + '=' + f1(D + e)) + ' m.', ['Where is the angle measured — at the floor or at her eyes?'], 'which vertical distance');
          } },
          { id: 'e5b', level: 'PRG', make: function (r, sh) {
            var V = sh.D + sh.e, th = sh.th, d = V / Tg.tan(th);
            return nearP('Determine the horizontal distance from the foot of the tower to the table, to the nearest tenth of a metre.', d, 1, 'm', [
              A(sh.D / Tg.tan(th), 'eye-floor', 'That uses the deck-floor height. The angle is measured at her eyes, ' + t(f1(sh.e)) + ' m higher: use ' + t(f1(V)) + ' m.'),
              A(V * Tg.tan(th), 'depr-vertical', 'The ' + t(dg(th)) + ' is measured from the horizontal at her eyes. At the table (the equal angle of elevation) the height is opposite and the distance is adjacent: ' + t('d=\\frac{' + f1(V) + '}{\\tan ' + dg(th) + '}') + '.'),
              A(V / Tg.sin(th), 'trig-ratio', 'That is the line of sight. The horizontal distance is adjacent ⇒ TOA.'), aRad(V / Tg.radTan(th))],
              'By the swap, the angle of elevation of her eyes from the table is also ' + t(dg(th)) + '; relative to it, ' + t(f1(V)) + ' m is opposite and ' + t('d') + ' is adjacent.<br>' + t('d=\\dfrac{' + f1(V) + '}{\\tan ' + dg(th) + '}=' + fl(d) + '\\approx ' + fx(d, 1)) + ' m',
              ['The vertical side of the triangle is floor height + eye height.', 'Opposite and adjacent ⇒ tan; the unknown is in the denominator.'], 'water tower distance');
          } },
          { id: 'e5c', level: 'EMG', make: function (r, sh) {
            var V = sh.D + sh.e, th = sh.th, d1 = V / Tg.tan(th), d0 = sh.D / Tg.tan(th), diff = d1 - d0;
            return nearP('If the deck-floor height (' + t(f1(sh.D)) + ' m) is used instead of the eye height, the answer changes. By how much does leaving out the eye height change the horizontal distance? Give the difference to the nearest tenth of a metre.', diff, 1, 'm', [
              A(sh.e, 'not-diff', 'The change is not just the eye height: each metre of height adds ' + t('\\frac{1}{\\tan ' + dg(th) + '}') + ' metres of horizontal distance. Work out both distances and subtract.'),
              A(d0, 'not-diff', 'That is the distance using the floor height. The question asks for the <b>difference</b> between the two answers.'),
              A(d1, 'not-diff', 'That is the correct distance. Now find the distance with the floor height and subtract.'),
              A(RT(d1, 1) - RT(d0, 1), 'early-round', EARLY)],
              'With the eye height: ' + t('\\dfrac{' + f1(V) + '}{\\tan ' + dg(th) + '}=' + fl(d1)) + ' m. With the floor height: ' + t('\\dfrac{' + f1(sh.D) + '}{\\tan ' + dg(th) + '}=' + fl(d0)) + ' m.<br>Difference ' + t('=' + fl(diff) + '\\approx ' + fx(diff, 1)) + ' m. Leaving out ' + t(f1(sh.e)) + ' m of eye height changes the answer by about ' + t(fx(diff, 1)) + ' m.',
              ['Calculate the distance both ways and subtract.'], 'effect of eye height');
          } }] },

      /* ---------- Part C: two observations ---------- */
      { num: '6', section: 'Extra practice C — Two observations of the same object', shared: function (r) {
          return until(r, function (r) {
            var a1 = r.int(25, 40), a2 = r.int(a1 + 12, Math.min(a1 + 26, 62)), d = r.int(30, 80);
            var x = d * Tg.tan(a1) / (Tg.tan(a2) - Tg.tan(a1)), h = x * Tg.tan(a2);
            if (RT(RT(x, 1) * Tg.tan(a2), 1) === RT(h, 1)) return null;
            return { a1: a1, a2: a2, d: d, x: x, h: h };
          }, (function () { var x = 45 * Tg.tan(34) / (Tg.tan(52) - Tg.tan(34)); return { a1: 34, a2: 52, d: 45, x: x, h: x * Tg.tan(52) }; })());
        },
        stem: function (sh) { return '<b>The signature problem.</b> A technician must find the height of a wind-turbine tower inside a fenced compound, so its base ' + t('F') + ' cannot be reached. From a point ' + t('A') + ' on level ground the angle of elevation of the top ' + t('T') + ' is ' + t(dg(sh.a1)) + '. She walks ' + t(sh.d + '.0') + ' m directly toward the tower to ' + t('B') + ', where the angle of elevation is ' + t(dg(sh.a2)) + '. Her instrument sits at ground level. Let ' + t('BF=x') + ' and ' + t('FT=h') + '.<br>' + twoObs({ a1: sh.a1, a2: sh.a2, dLab: sh.d + '.0 m', xLab: 'x', hLab: 'h' }); },
        parts: [
          { id: 'e6a', level: 'EMG', make: function (r, sh) {
            return K.P.mc(r, 'Why is neither triangle enough on its own, and what do the two triangles share?', [
              { html: 'Each triangle has an angle but no known side — the ' + t(sh.d + '.0') + ' m is ' + t('AB') + ', which is a side of neither. They share the height ' + t('h') + ' (and ' + t('AF=x+' + sh.d + '.0') + ').', right: true },
              { html: 'Triangle ' + t('BFT') + ' is enough: ' + t('\\tan ' + dg(sh.a2) + '=\\frac{h}{' + sh.d + '.0}') + '.', why: t(sh.d + '.0') + ' m is ' + t('AB') + ', the distance walked — not ' + t('BF') + '. Triangle ' + t('BFT') + ' has no known side.' },
              { html: 'They share the angle at ' + t('T') + ', so one triangle gives the other.', why: 'The angles at ' + t('T') + ' are different (' + t(dg(90 - sh.a1)) + ' and ' + t(dg(90 - sh.a2)) + '). What they share is a <b>side</b>.' },
              { html: 'Triangle ' + t('AFT') + ' is enough, because ' + t('AF=' + sh.d + '.0') + ' m.', why: t('AF') + ' is ' + t('x+' + sh.d + '.0') + ', and ' + t('x') + ' is unknown.' }],
              t('\\triangle BFT') + ' has the angle ' + t(dg(sh.a2)) + ' but no side; ' + t('\\triangle AFT') + ' has ' + t(dg(sh.a1)) + ' but no side. The ' + t(sh.d + '.0') + ' m is the difference ' + t('AB') + '. The triangles share the <b>height</b> ' + t('FT=h') + ', and ' + t('AF=x+' + sh.d + '.0') + ' — that shared side links the two equations.', ['Which sides of each triangle do you actually know?'], 'why two triangles');
          } },
          { id: 'e6b', level: 'EMG', make: function (r, sh) {
            var a1 = dg(sh.a1), a2 = dg(sh.a2), D = sh.d + '.0';
            return K.P.mc(r, 'Which pair of tangent equations is correct?', [
              { html: t('\\tan ' + a2 + '=\\dfrac{h}{x}') + ' and ' + t('\\tan ' + a1 + '=\\dfrac{h}{x+' + D + '}'), right: true },
              { html: t('\\tan ' + a2 + '=\\dfrac{h}{x}') + ' and ' + t('\\tan ' + a1 + '=\\dfrac{h}{' + D + '}'), why: 'From ' + t('A') + ' the horizontal side is all of ' + t('AF=x+' + D) + ', not just ' + t(D) + '.' },
              { html: t('\\tan ' + a2 + '=\\dfrac{x}{h}') + ' and ' + t('\\tan ' + a1 + '=\\dfrac{x+' + D + '}{h}'), why: 'tan = opposite ÷ adjacent. The height ' + t('h') + ' is <b>opposite</b> each angle.' },
              { html: t('\\tan ' + a1 + '=\\dfrac{h}{x}') + ' and ' + t('\\tan ' + a2 + '=\\dfrac{h}{x+' + D + '}'), why: 'The bigger angle, ' + t(a2) + ', is at the <b>nearer</b> point ' + t('B') + ', where the horizontal side is ' + t('x') + '.' }],
              t('\\triangle BFT') + ': opposite ' + t('=h') + ', adjacent ' + t('=x') + ', so ' + t('\\tan ' + a2 + '=\\frac{h}{x}') + '.<br>' + t('\\triangle AFT') + ': opposite ' + t('=h') + ', adjacent ' + t('=x+' + D) + ', so ' + t('\\tan ' + a1 + '=\\frac{h}{x+' + D + '}') + '.', ['In each triangle, ' + t('h') + ' is opposite the angle. What is the adjacent side from ' + t('B') + '? From ' + t('A') + '?'], 'two tangent equations');
          } },
          { id: 'e6c', level: 'PRG', make: function (r, sh) {
            var a1 = sh.a1, a2 = sh.a2, d = sh.d, x = sh.x, t1 = Tg.tan(a1), t2 = Tg.tan(a2);
            return nearP('Using ' + t('h=x\\tan ' + dg(a2)) + ' and ' + t('h=(x+' + d + '.0)\\tan ' + dg(a1)) + ', eliminate ' + t('h') + ' and solve for ' + t('x') + ' (to the nearest tenth of a metre). Keep full calculator precision.', x, 1, 'm', [
              A(x + d, 'af-not-x', 'That is ' + t('AF=x+' + d + '.0') + '. The question asks for ' + t('x=BF') + '.'),
              A(d * t1 / (t2 + t1), 'elim-sign', 'Check the step where you collect the ' + t('x') + ' terms: ' + t('x\\tan ' + dg(a2) + '-x\\tan ' + dg(a1) + '=' + d + '.0\\tan ' + dg(a1)) + ', so you divide by the <b>difference</b> of the tangents.'),
              A(d * t2 / (t2 - t1), 'af-not-x', 'Check the right side: ' + t('x(\\tan ' + dg(a2) + '-\\tan ' + dg(a1) + ')=' + d + '.0\\tan ' + dg(a1)) + '.'),
              A(d / (t2 - t1), 'elim-sign', 'When you expand ' + t('(x+' + d + '.0)\\tan ' + dg(a1)) + ', the ' + t(d + '.0') + ' is multiplied by ' + t('\\tan ' + dg(a1)) + ' too.'),
              aRad(d * Tg.radTan(a1) / (Tg.radTan(a2) - Tg.radTan(a1)))],
              t('x\\tan ' + dg(a2) + '=(x+' + d + '.0)\\tan ' + dg(a1)) + '<br>' + t('x\\tan ' + dg(a2) + '-x\\tan ' + dg(a1) + '=' + d + '.0\\tan ' + dg(a1)) + '<br>' + t('x=\\dfrac{' + d + '.0\\tan ' + dg(a1) + '}{\\tan ' + dg(a2) + '-\\tan ' + dg(a1) + '}=\\dfrac{' + fl(d * t1) + '}{' + fl(t2 - t1) + '}=' + fl(x) + '\\approx ' + fx(x, 1)) + ' m (keep ' + t(fl(x)) + ')',
              ['Set the two expressions for ' + t('h') + ' equal.', 'Expand, collect the ' + t('x') + ' terms on one side, then factor out ' + t('x') + '.'], 'solve for x, two observations');
          } },
          { id: 'e6d', level: 'PRG', make: function (r, sh) {
            var a1 = sh.a1, a2 = sh.a2, d = sh.d, x = sh.x, h = sh.h;
            return nearP('Determine the height ' + t('h') + ' of the tower to the nearest tenth of a metre. (' + t('x=BF') + ' is about ' + t(fx(x, 1)) + ' m — use the full value ' + t('x=\\dfrac{' + d + '.0\\tan ' + dg(a1) + '}{\\tan ' + dg(a2) + '-\\tan ' + dg(a1) + '}') + '.)', h, 1, 'm', [
              A(RT(x, 1) * Tg.tan(a2), 'early-round', 'Very close — that comes from the <b>rounded</b> ' + t('x') + '. Use the full calculator value of ' + t('x') + '.'),
              A(x * Tg.tan(a1), 'trig-ratio', 'With ' + t('x=BF') + ', use the angle at ' + t('B') + ': ' + t('h=x\\tan ' + dg(a2)) + '.'),
              A(d * Tg.tan(a2), 'one-tri', t(d + '.0') + ' m is ' + t('AB') + ', not ' + t('BF') + '. Use ' + t('x') + '.'),
              aRad(x * Tg.radTan(a2))],
              t('h=x\\tan ' + dg(a2) + '=' + fl(x) + '\\times ' + fl(Tg.tan(a2)) + '=' + fl(h) + '\\approx ' + fx(h, 1)) + ' m',
              ['In ' + t('\\triangle BFT') + ': ' + t('h=x\\tan ' + dg(a2)) + '.'], 'tower height, two observations');
          } },
          { id: 'e6e', level: 'EMG', make: function (r, sh) {
            var a1 = sh.a1, d = sh.d, x = sh.x, h = sh.h;
            return nearP('Check: substitute the unrounded ' + t('x\\approx ' + fl(x)) + ' into the <i>other</i> equation, ' + t('h=(x+' + d + '.0)\\tan ' + dg(a1)) + '. What height does it give, to the nearest tenth of a metre?', h, 1, 'm', [
              A(x * Tg.tan(a1), 'af-not-x', 'From ' + t('A') + ' the horizontal side is ' + t('x+' + d + '.0') + ', not ' + t('x') + '.'),
              A((RT(x, 1) + d) * Tg.tan(a1), 'early-round', EARLY), A((x + d) * Tg.tan(sh.a2), 'trig-ratio', 'This equation belongs to point ' + t('A') + ', where the angle is ' + t(dg(a1)) + '.'), aRad((x + d) * Tg.radTan(a1))],
              t('h=(' + fl(x) + '+' + d + '.0)\\tan ' + dg(a1) + '=' + fl(x + d) + '\\times ' + fl(Tg.tan(a1)) + '=' + fl(h) + '\\approx ' + fx(h, 1)) + ' m ✓ — the same height, so the two equations agree.',
              ['Add ' + t(d + '.0') + ' to ' + t('x') + ' first, then multiply by ' + t('\\tan ' + dg(a1)) + '.'], 'check with other equation');
          } },
          { id: 'e6f', level: 'EMG', make: function (r, sh) {
            var a2 = sh.a2, x = sh.x, h = sh.h, xr = RT(x, 1), hr = xr * Tg.tan(a2);
            return K.P.fields('Find ' + t('h=x\\tan ' + dg(a2)) + ' twice: once with ' + t('x') + ' rounded to the nearest tenth (' + t(fx(x, 1)) + '), once with the full value ' + t(fl(x)) + '. Give each height to the nearest tenth of a metre.',
              [{ label: 'with rounded ' + t('x') + ':', after: 'm' }, { label: 'with full ' + t('x') + ':', after: 'm' }],
              [nearC(hr, 1, [A(h, 'early-round', 'That is the height from the <b>full</b> value. Use ' + t('x=' + fx(x, 1)) + ' in this box.')]), nearC(h, 1, [A(hr, 'early-round', 'That is the height from the rounded ' + t('x') + '. Use the full calculator value here.')])],
              [RT(hr, 1).toFixed(1), RT(h, 1).toFixed(1)], 'rounded ' + t('x') + ': ' + t(fx(hr, 1)) + ' m; full ' + t('x') + ': ' + t(fx(h, 1)) + ' m',
              'With the rounded ' + t('x=' + fx(x, 1)) + ': ' + t(fx(x, 1) + '\\tan ' + dg(a2) + '=' + fl(hr) + '\\approx ' + fx(hr, 1)) + ' m.<br>With the full ' + t('x=' + fl(x)) + ': ' + t('h=' + fl(h) + '\\approx ' + fx(h, 1)) + ' m.<br>Report ' + t(fx(h, 1)) + ' m. ' + t('x') + ' was an intermediate value; rounding it threw information away, and multiplying by ' + t('\\tan ' + dg(a2)) + ' magnified the error. Round only at the very end.',
              ['Do the multiplication twice with the two different values of ' + t('x') + '.'], 'rounded vs full x');
          } },
          { id: 'e6g', level: 'PRG', make: function (r, sh) {
            var a2 = sh.a2, h = sh.h, bt = h / Tg.sin(a2);
            return nearP('The tower is ' + t('h\\approx ' + fl(h)) + ' m tall. Determine the length of the line of sight ' + t('BT') + ', to the nearest tenth of a metre.', bt, 1, 'm', [
              A(h * Tg.sin(a2), 'trig-inverted', t('BT') + ' is in the denominator of ' + t('\\sin ' + dg(a2) + '=\\frac{h}{BT}') + ': divide.'),
              A(h / Tg.cos(a2), 'trig-ratio', t('h') + ' is <b>opposite</b> the ' + t(dg(a2)) + ' angle at ' + t('B') + ' ⇒ SOH.'),
              A(h / Tg.sin(sh.a1), 'trig-ratio', 'That is ' + t('AT') + ', the line of sight from ' + t('A') + '. Use the angle at ' + t('B') + ', ' + t(dg(a2)) + '.'), aRad(h / Tg.radSin(a2))],
              'In ' + t('\\triangle BFT') + ', ' + t('h') + ' is opposite ' + t(dg(a2)) + ' and ' + t('BT') + ' is the hypotenuse (SOH).<br>' + t('BT=\\dfrac{' + fl(h) + '}{\\sin ' + dg(a2) + '}=' + fl(bt) + '\\approx ' + fx(bt, 1)) + ' m',
              [t('BT') + ' is the hypotenuse of ' + t('\\triangle BFT') + '.'], 'line of sight BT');
          } }] },
      { num: '7', shared: function (r) { var thN = r.int(28, 50); return { H: tenth(r, 15, 40), thN: thN, thF: r.int(12, thN - 8) }; },
        stem: function (sh) {
          var vN = vis(sh.thN, 34, 55), vF = Math.min(vis(sh.thF, 18, 40), vN - 13), W = 10, h = 4, dN = h / Tg.tan(vN), dF = h / Tg.tan(vF), sc = W / dF;
          var fig = HW.fig({ pts: { C: [0, h * sc], G: [0, 0], N: [dN * sc, 0], F: [W, 0], Hh: [W * 1.04, h * sc] }, names: { C: 'C', N: 'N', F: 'F' },
            segs: [['G', 'C', sh.H.toFixed(1) + ' m', { width: 1.4 }], ['G', 'F'], ['C', 'N'], ['C', 'F'], ['C', 'Hh', { dash: 1, width: 1.4, color: GREY }]],
            angles: [['C', 'Hh', 'N', deg(sh.thN), { r: 26 }], ['C', 'Hh', 'F', deg(sh.thF), { r: 58 }]], right: [['G', 'C', 'F']],
            extra: [{ type: 'ground', y: 0, x0: -3, x1: W * 1.06 }, { type: 'building', at: [-1.4, 0], w: 2.8, h: h * sc }], width: 320, aria: 'two cars seen from a garage roof' });
          return 'From the roof of a parking garage ' + t(f1(sh.H)) + ' m above street level, a camera at ' + t('C') + ' sights two parked cars, ' + t('N') + ' and ' + t('F') + ', on the same straight street and on the same side of the garage. The angles of depression are ' + t(dg(sh.thN)) + ' to ' + t('N') + ' and ' + t(dg(sh.thF)) + ' to ' + t('F') + '.<br>' + fig;
        },
        parts: [
          { id: 'e7a', level: 'EMG', make: function (r, sh) {
            return K.P.mc(r, 'Which angle belongs to the <b>nearer</b> car? Choose the answer with the right reason.', [
              { html: t(dg(sh.thN)) + ': the height is fixed, and ' + t('\\tan(\\text{depression})=\\frac{' + f1(sh.H) + '}{\\text{distance}}') + ', so a larger angle means a smaller distance.', right: true },
              { html: t(dg(sh.thF)) + ': a smaller angle means the car is closer to the garage.', why: 'With the height fixed, ' + t('\\text{distance}=\\frac{' + f1(sh.H) + '}{\\tan\\theta}') + '. A smaller angle has a smaller tangent, so the distance is <b>larger</b>.' },
              { html: t(dg(sh.thN)) + ': it is labelled ' + t('N') + ' in the picture.', why: 'Right angle, but the question asks you to justify it from the <b>ratio</b>, not from the picture.' },
              { html: 'You can’t tell without knowing the distances.', why: 'The ratio ' + t('\\tan\\theta=\\frac{\\text{height}}{\\text{distance}}') + ' with a fixed height tells you how angle and distance are related.' }],
              'The camera height is fixed at ' + t(f1(sh.H)) + ' m and ' + t('\\tan(\\text{depression})=\\dfrac{' + f1(sh.H) + '}{\\text{distance}}') + '. A larger angle forces a smaller distance, so ' + t(dg(sh.thN)) + ' belongs to the nearer car ' + t('N') + '.', ['Write the tan ratio for one car. If the angle gets bigger, what happens to the distance?'], 'larger depression = nearer');
          } },
          { id: 'e7b', level: 'EMG', make: function (r, sh) {
            var H = sh.H, dN = H / Tg.tan(sh.thN), dF = H / Tg.tan(sh.thF);
            var mk = function (th, d) { return nearC(d, 1, [A(H * Tg.tan(th), 'depr-vertical', 'The angle of depression is measured from the horizontal: at the car (the equal angle of elevation) the height is opposite and the distance is adjacent, ' + t('d=\\frac{' + f1(H) + '}{\\tan ' + dg(th) + '}') + '.'), A(H / Tg.sin(th), 'trig-ratio', 'That is the line of sight, not the distance along the street. Use tan.'), aRad(H / Tg.radTan(th))]); };
            return K.P.fields('Determine the distance from the foot of the garage to each car, to the nearest tenth of a metre.', [{ label: t('d_N='), after: 'm' }, { label: t('d_F='), after: 'm' }],
              [mk(sh.thN, dN), mk(sh.thF, dF)], [RT(dN, 1).toFixed(1), RT(dF, 1).toFixed(1)], t('d_N=' + fx(dN, 1)) + ' m, ' + t('d_F=' + fx(dF, 1)) + ' m',
              'Each angle of depression equals the angle of elevation at the car, so in each triangle ' + t(f1(H)) + ' m is opposite and the distance is adjacent.<br>' + t('d_N=\\dfrac{' + f1(H) + '}{\\tan ' + dg(sh.thN) + '}=' + fl(dN) + '\\approx ' + fx(dN, 1)) + ' m<br>' + t('d_F=\\dfrac{' + f1(H) + '}{\\tan ' + dg(sh.thF) + '}=' + fl(dF) + '\\approx ' + fx(dF, 1)) + ' m',
              ['Use the equal angle of elevation at each car: tan = height ÷ distance.'], 'distances to two cars');
          } },
          { id: 'e7c', level: 'PRG', make: function (r, sh) {
            var H = sh.H, dN = H / Tg.tan(sh.thN), dF = H / Tg.tan(sh.thF), g = dF - dN;
            return nearP('Determine the distance between the two cars, to the nearest tenth of a metre.', g, 1, 'm', [
              A(dF + dN, 'cars-sum', 'Both cars are on the <b>same side</b> of the garage, so the gap is the difference of the two distances.'),
              A(H / Tg.tan(sh.thN - sh.thF), 'angle-diff', 'You can’t subtract the angles and use one triangle: the gap ' + t('NF') + ' isn’t a side of a right triangle with that angle. Find each distance, then subtract.'),
              A(RT(dF, 1) - RT(dN, 1), 'early-round', EARLY + ' (Subtract the unrounded distances.)'),
              A(H * Tg.tan(sh.thN) - H * Tg.tan(sh.thF), 'depr-vertical', 'Each distance is ' + t('\\frac{' + f1(H) + '}{\\tan\\theta}') + ' — the angles are measured from the horizontal.')],
              t('d_N=\\dfrac{' + f1(H) + '}{\\tan ' + dg(sh.thN) + '}=' + fl(dN)) + ', ' + t('d_F=\\dfrac{' + f1(H) + '}{\\tan ' + dg(sh.thF) + '}=' + fl(dF)) + '.<br>Same side, so subtract the runs: ' + t('NF=' + fl(dF) + '-' + fl(dN) + '=' + fl(g) + '\\approx ' + fx(g, 1)) + ' m',
              ['Find the distance from the garage to each car first.', 'Both cars are on the same side: subtract.'], 'gap between two cars');
          } }] },
      { num: '8', stem: '<b>The general two-observation formula.</b> An object ' + t('FT') + ' of height ' + t('h') + ' stands on level ground. It is sighted from two points ' + t('P') + ' (farther) and ' + t('Q') + ' (nearer), a distance ' + t('d') + ' apart and in line with its base ' + t('F') + ', at angles of elevation ' + t('\\theta_1') + ' (from ' + t('P') + ') and ' + t('\\theta_2') + ' (from ' + t('Q') + '). The formula is ' + t('h=\\dfrac{d}{\\frac{1}{\\tan\\theta_1}-\\frac{1}{\\tan\\theta_2}}') + '.<br>' +
          HW.fig({ pts: { P: [0, 0], Q: [4, 0], F: [10, 0], T: [10, 5] }, segs: [['P', 'Q', 'd'], ['Q', 'F'], ['F', 'T', 'h', { width: 3 }], ['P', 'T'], ['Q', 'T']], right: [['F', 'P', 'T']], angles: [['P', 'F', 'T', 'θ₁', { r: 30 }], ['Q', 'F', 'T', 'θ₂', { r: 22 }]], extra: [{ type: 'ground', y: 0, x0: -0.8, x1: 11 }], width: 300 }),
        parts: [
          { id: 'e8a', level: 'EMG', make: function (r) {
            var askQ = r.chance(0.5), s = askQ ? 'QF' : 'PF', th = askQ ? '\\theta_2' : '\\theta_1', ot = askQ ? '\\theta_1' : '\\theta_2';
            return K.P.mc(r, 'The derivation starts by writing ' + t('PF') + ' and ' + t('QF') + ' in terms of ' + t('h') + '. Which expression is ' + t(s) + '?', [
              { html: t(s + '=\\dfrac{h}{\\tan ' + th + '}'), right: true },
              { html: t(s + '=h\\tan ' + th), why: t('\\tan ' + th + '=\\frac{h}{' + s + '}') + ', so ' + t(s) + ' is in the denominator: ' + t(s + '=\\frac{h}{\\tan ' + th + '}') + '.' },
              { html: t(s + '=\\dfrac{h}{\\tan ' + ot + '}'), why: 'Each point has its own angle: ' + t(askQ ? 'Q' : 'P') + ' goes with ' + t(th) + '.' },
              { html: t(s + '=\\dfrac{h}{\\sin ' + th + '}'), why: t('\\frac{h}{\\sin}') + ' gives the line of sight (the hypotenuse), not the distance along the ground.' }],
              t('\\triangle PFT') + ': ' + t('\\tan\\theta_1=\\frac{h}{PF}') + ', so ' + t('PF=\\frac{h}{\\tan\\theta_1}') + '. ' + t('\\triangle QFT') + ': ' + t('QF=\\frac{h}{\\tan\\theta_2}') + '.<br>' + t('PF-QF=d') + ' gives ' + t('h\\left(\\frac{1}{\\tan\\theta_1}-\\frac{1}{\\tan\\theta_2}\\right)=d') + ', so ' + t('h=\\dfrac{d}{\\frac{1}{\\tan\\theta_1}-\\frac{1}{\\tan\\theta_2}}') + '.',
              ['In the triangle at ' + t(askQ ? 'Q' : 'P') + ', ' + t('h') + ' is opposite and ' + t(s) + ' is adjacent.'], 'derive two-observation formula');
          } },
          { id: 'e8b', level: 'PRG', make: function (r) {
            var v = until(r, function (r) { var a1 = r.int(25, 40), a2 = r.int(a1 + 12, Math.min(a1 + 26, 62)); return { a1: a1, a2: a2, d: r.int(30, 80) }; }, { a1: 34, a2: 52, d: 45 });
            return formulaPart('Use the formula with the data of question 6: ' + t('\\theta_1=' + dg(v.a1)) + ', ' + t('\\theta_2=' + dg(v.a2)) + ', ' + t('d=' + v.d + '.0') + ' m. Find ' + t('h') + ' to the nearest tenth of a metre.', v.a1, v.a2, v.d, 'formula with Q6 data');
          } },
          { id: 'e8c', level: 'PRG', make: function (r) {
            var a1 = r.int(15, 30), a2 = r.int(a1 + 10, a1 + 25), d = r.int(40, 100);
            return formulaPart('A radio mast is sighted at an angle of elevation of ' + t(dg(a1)) + '; from a point ' + t(d + '.0') + ' m closer, in line with the base, the angle of elevation is ' + t(dg(a2)) + '. Find the height of the mast to the nearest tenth of a metre.', a1, a2, d, 'radio mast by formula');
          } },
          { id: 'e8d', level: 'EMG', make: function (r) {
            return K.P.mc(r, 'What does the formula do if ' + t('\\theta_1=\\theta_2') + ', and what does that mean about the two sightings?', [
              { html: 'The bracket is ' + t('0') + ', so it divides by zero and gives no height: equal angles happen only if ' + t('P') + ' and ' + t('Q') + ' are the same point (' + t('d=0') + ').', right: true },
              { html: 'It gives ' + t('h=0') + ': the object has no height.', why: 'Look at the bracket: ' + t('\\frac{1}{\\tan\\theta_1}-\\frac{1}{\\tan\\theta_2}=0') + ' is in the <b>denominator</b>. You can’t divide by zero.' },
              { html: 'It gives ' + t('h=d') + '.', why: 'If the angles are equal the bracket is zero, and the formula divides by it.' },
              { html: 'It still works; the height just comes out very large.', why: 'Dividing by exactly zero gives no value at all — and two different points in line with the base always give different angles.' }],
              'The bracket becomes ' + t('0') + ', so the formula divides by zero and returns no height. That makes sense: two points in line with the base give equal angles of elevation only if they are the <b>same</b> point. Two different sighting points must give two different angles, and the method depends on that difference.', ['What is ' + t('\\frac{1}{\\tan\\theta}-\\frac{1}{\\tan\\theta}') + '?'], 'equal angles in formula');
          } }] },

      /* ---------- Part D: bearings ---------- */
      { num: '9', section: 'Extra practice D — Bearings: clockwise from north, always three digits', stem: 'A <b>bearing</b> is the angle turned clockwise from north, written with three digits.', parts: [
        { id: 'e9a', level: 'BEG', sub: 'a', make: function (r) {
          var card = r.sample([['due east', 90], ['due south', 180], ['due west', 270]], 2), inter = r.pick([['north-east', 45], ['south-east', 135], ['south-west', 225], ['north-west', 315]]);
          var x = r.int(10, 40), y = r.int(10, 40), z = r.int(10, 40);
          var rows = [[card[0][0], card[0][1], []], [inter[0], inter[1], [A(360 - inter[1], 'bearing-ccw', 'Bearings turn <b>clockwise</b> from north.')]], [card[1][0], card[1][1], [A(360 - card[1][1], 'bearing-ccw', 'Bearings turn <b>clockwise</b> from north: N → E → S → W.')]],
            [t(x + '^\\circ') + ' east of due north', x, [A(90 - x, 'bearing-ccw', 'Start at <b>north</b> and turn ' + t(x + '^\\circ') + ' toward east.'), A(360 - x, 'bearing-ccw', 'East of north is clockwise from north: just ' + t(x + '^\\circ') + '.')]],
            [t(y + '^\\circ') + ' south of due west', 270 - y, [A(270 + y, 'bearing-ccw', 'Due west is ' + t('270^\\circ') + '. “South of west” turns back toward south (' + t('180^\\circ') + '), so <b>subtract</b>.'), A(180 + y, 'bearing-ccw', '“South of due west” means start at west (' + t('270^\\circ') + ') and turn ' + t(y + '^\\circ') + ' toward south.')]],
            [t(z + '^\\circ') + ' west of due south', 180 + z, [A(180 - z, 'bearing-ccw', 'Due south is ' + t('180^\\circ') + '. “West of south” turns on toward west (' + t('270^\\circ') + '), so <b>add</b>.'), A(270 - z, 'bearing-ccw', 'Start at <b>south</b> (' + t('180^\\circ') + ') and turn ' + t(z + '^\\circ') + ' toward west.')]]];
          rows = r.shuffle(rows);
          return K.P.fields('Write each direction as a three-figure bearing.', rows.map(function (w) { return { label: w[0] + ':', after: '°' }; }), rows.map(function (w) { return bearingCheck(w[1], w[2]); }), rows.map(function (w) { return b3(w[1]); }),
            rows.map(function (w) { return w[0] + ': ' + t(dg(b3(w[1]))); }).join('<br>'),
            'N = ' + t('000^\\circ') + ', E = ' + t('090^\\circ') + ', S = ' + t('180^\\circ') + ', W = ' + t('270^\\circ') + ', turning clockwise. ' + rows.map(function (w) { return w[0] + ' → ' + t(dg(b3(w[1]))); }).join('; ') + '.',
            ['Picture a compass: N ' + t('000^\\circ') + ', E ' + t('090^\\circ') + ', S ' + t('180^\\circ') + ', W ' + t('270^\\circ') + '.', '“' + t('20^\\circ') + ' south of west”: start at W and turn 20° toward S.'], 'directions to bearings');
        } },
        { id: 'e9b', level: 'BEG', sub: 'b', make: function (r) {
          var p = r.int(10, 75), s = r.int(10, 70), w = r.int(10, 70);
          var figs = figRow(compass('P', p, 'N', deg(p)) + compass('Q', 180 + s, 'S', deg(s)) + compass('R', 360 - w, 'N', deg(w)));
          return K.P.fields('Write the three-figure bearing of each point from the centre.<br>' + figs, [{ label: 'bearing of ' + t('P') + ':', after: '°' }, { label: 'bearing of ' + t('Q') + ':', after: '°' }, { label: 'bearing of ' + t('R') + ':', after: '°' }],
            [bearingCheck(p, [A(90 - p, 'bearing-ccw', 'A bearing is measured from <b>north</b>, not from east.'), A(360 - p, 'bearing-ccw', 'Turn <b>clockwise</b> from north.')]),
             bearingCheck(180 + s, [A(180 - s, 'bearing-ccw', t('Q') + ' is ' + t(s + '^\\circ') + ' <b>past</b> due south (clockwise), so add: ' + t('180^\\circ+' + s + '^\\circ') + '.'), A(s, 'bearing-ref', t(s + '^\\circ') + ' is measured from south. Turn clockwise from <b>north</b>: ' + t('180^\\circ+' + s + '^\\circ') + '.')]),
             bearingCheck(360 - w, [A(w, 'bearing-ccw', t('R') + ' is ' + t(w + '^\\circ') + ' <b>west</b> of north — that is ' + t(w + '^\\circ') + ' short of a full clockwise turn: ' + t('360^\\circ-' + w + '^\\circ') + '.'), A(270 + w, 'bearing-ccw', 'The ' + t(w + '^\\circ') + ' is measured from north, not from west.')])],
            [b3(p), b3(180 + s), b3(360 - w)], t('P') + ': ' + t(dg(b3(p))) + ', ' + t('Q') + ': ' + t(dg(b3(180 + s))) + ', ' + t('R') + ': ' + t(dg(b3(360 - w))),
            t('P') + ': ' + t(p + '^\\circ') + ' clockwise from north → ' + t(dg(b3(p))) + ' (keep the leading zero).<br>' + t('Q') + ': ' + t(s + '^\\circ') + ' past due south → ' + t('180^\\circ+' + s + '^\\circ=' + dg(b3(180 + s))) + '.<br>' + t('R') + ': ' + t(w + '^\\circ') + ' west of north → ' + t('360^\\circ-' + w + '^\\circ=' + dg(b3(360 - w))) + '.',
            ['Each bearing is the clockwise turn from north. For ' + t('Q') + ' start from south (' + t('180^\\circ') + '); for ' + t('R') + ' count back from ' + t('360^\\circ') + '.'], 'read bearings of arrows');
        } }] },
      { num: '10', shared: function (r) { var b; do { b = r.int(20, 160); } while (b === 90); return { b: b }; },
        stem: function (sh) {
          var B = [6 * Tg.sin(sh.b), 6 * Tg.cos(sh.b)];
          return '<b>The return journey.</b> The bearing of ' + t('B') + ' from ' + t('A') + ' is ' + t(dg(b3(sh.b))) + '. ' + t('AN') + ' and ' + t('BM') + ' are north lines at ' + t('A') + ' and ' + t('B') + '.<br>' +
            bearFig({ A: [0, 0], B: B }, [['A', 'B']], [['A', 'N'], ['B', 'M', 'M']], 2.6, { angles: [['A', 'N', 'B', deg(sh.b)]], width: 260 });
        },
        parts: [
          { id: 'e10a', level: 'EMG', make: function (r, sh) {
            var b = sh.b, back = b + 180;
            return K.P.mc(r, 'Why is the bearing of ' + t('A') + ' from ' + t('B') + ' equal to ' + t(dg(b3(b)) + '+180^\\circ=' + dg(b3(back))) + '?', [
              { html: t('AN\\parallel BM') + ' (all north lines are parallel) and ' + t('AB') + ' is a transversal. The ray ' + t('BA') + ' points exactly opposite to ' + t('AB') + ', so from ' + t('BM') + ' the clockwise turn to ' + t('BA') + ' is ' + t(dg(b)) + ' plus a straight angle.', right: true },
              { html: 'To turn around you subtract: ' + t('180^\\circ-' + dg(b)) + '.', why: t(dg(b3(180 - b))) + ' points ' + (b < 90 ? 'south-east' : 'north-east') + ', not back toward ' + t('A') + '. Going the opposite way is a half turn more: add ' + t('180^\\circ') + '.' },
              { html: 'The angles at ' + t('A') + ' and ' + t('B') + ' are co-interior, so the bearing back is ' + t('180^\\circ-' + dg(b)) + '.', why: 'Co-interior angles give ' + t('\\angle ABM=180^\\circ-' + dg(b)) + ', but that angle is measured <b>anticlockwise</b> from ' + t('BM') + '. The bearing (clockwise) is ' + t('360^\\circ-' + dg(180 - b) + '=' + dg(b3(back))) + '.' },
              { html: 'A bearing and its return bearing always add to ' + t('360^\\circ') + '.', why: 'They always <b>differ</b> by ' + t('180^\\circ') + '. ' + t('360^\\circ-' + dg(b)) + ' would be the reflection across the north line.' }],
              t('AN\\parallel BM') + ' (all north lines are parallel) and ' + t('AB') + ' is a transversal. At ' + t('A') + ' the clockwise turn from ' + t('AN') + ' to ' + t('AB') + ' is ' + t(dg(b)) + '. At ' + t('B') + ' the ray ' + t('BA') + ' points the opposite way, so from ' + t('BM') + ' the clockwise turn to ' + t('BA') + ' is a straight angle further round: ' + t(dg(b) + '+180^\\circ=' + dg(b3(back))) + '.', ['Draw the ray from ' + t('B') + ' back to ' + t('A') + '. How does its direction compare with ' + t('AB') + '?'], 'why return bearing +180');
          } },
          { id: 'e10b', level: 'BEG', make: function (r) {
            var f = r.int(200, 340), bk = f - 180;
            return bearingP('The bearing of a lodge ' + t('L') + ' from a dock ' + t('D') + ' is ' + t(dg(f)) + '. Determine the bearing of ' + t('D') + ' from ' + t('L') + '.', bk, [
              A(f + 180, 'back-over', t(f + '^\\circ') + ' is already more than ' + t('180^\\circ') + ', so adding ' + t('180^\\circ') + ' passes a full turn. Subtract ' + t('180^\\circ') + ' instead.'),
              A(360 - f, 'bearing-ccw', 'That reflects the direction across the north line. The return direction is the <b>opposite</b> direction: differ by ' + t('180^\\circ') + '.'),
              A(f, 'bearing-back', 'That is the bearing of ' + t('L') + ' from ' + t('D') + '. The way back is the opposite direction.')],
              t(dg(f)) + ' is already more than ' + t('180^\\circ') + ', so subtract: bearing of ' + t('D') + ' from ' + t('L') + ' ' + t('=' + f + '^\\circ-180^\\circ=' + dg(b3(bk))) + '.<br>Check: ' + t('L') + ' is ' + (f > 270 ? 'north-west' : 'south-west') + ' of ' + t('D') + ', so ' + t('D') + ' is ' + (f > 270 ? 'south-east' : 'north-east') + ' of ' + t('L') + ' ✓',
              ['The return bearing differs by ' + t('180^\\circ') + '. Should you add or subtract to stay between ' + t('000^\\circ') + ' and ' + t('360^\\circ') + '?'], 'return bearing of ' + f);
          } },
          { id: 'e10c', level: 'EMG', make: function (r) {
            var ex = r.int(190, 330);
            return K.P.mc(r, 'A student writes the rule “for the return bearing, always add ' + t('180^\\circ') + '.” When does this rule fail, and what rule always works?', [
              { html: 'It fails when the bearing is ' + t('180^\\circ') + ' or more (e.g. ' + t(dg(ex)) + ' gives ' + t(dg(ex + 180)) + '). Rule: add ' + t('180^\\circ') + ' if the bearing is less than ' + t('180^\\circ') + '; subtract ' + t('180^\\circ') + ' if it is ' + t('180^\\circ') + ' or more.', right: true },
              { html: 'It fails for bearings less than ' + t('180^\\circ') + '. Rule: always subtract ' + t('180^\\circ') + '.', why: 'Try ' + t('060^\\circ') + ': subtracting gives a negative number, which isn’t a bearing. Adding works there.' },
              { html: 'It never fails: ' + t(dg(ex + 180)) + ' is a fine bearing.', why: 'Bearings run from ' + t('000^\\circ') + ' to ' + t('359^\\circ') + '. ' + t(dg(ex + 180)) + ' has gone past a full turn.' },
              { html: 'It fails for bearings over ' + t('180^\\circ') + '. Rule: use ' + t('360^\\circ') + ' minus the bearing.', why: 'Test it on ' + t(dg(ex)) + ': ' + t('360^\\circ-' + dg(ex) + '=' + dg(b3(360 - ex))) + ', which is not the opposite direction (' + t(dg(b3(ex - 180))) + ').' }],
              'It fails whenever the bearing is ' + t('180^\\circ') + ' or more: the sum reaches ' + t('360^\\circ') + ' or beyond, which is not a bearing (' + t(dg(ex) + '+180^\\circ=' + dg(ex + 180)) + '). A rule that always works: <b>add ' + t('180^\\circ') + ' if the bearing is less than ' + t('180^\\circ') + '; subtract ' + t('180^\\circ') + ' if it is ' + t('180^\\circ') + ' or more.</b> (Equivalently: add ' + t('180^\\circ') + ', then subtract ' + t('360^\\circ') + ' if the result reaches ' + t('360^\\circ') + '.)', ['Try the rule on a bearing like ' + t(dg(ex)) + '.'], 'return bearing rule');
          } }] },
      { num: '11', shared: function (r) {
          return until(r, function (r) { var b1 = r.int(20, 75), d1 = tenth(r, 2, 6), d2 = tenth(r, 2, 6); if (Math.abs(d1 - d2) < 0.6) return null; return { b1: b1, b2: b1 + 90, d1: d1, d2: d2 }; }, { b1: 58, b2: 148, d1: 3.2, d2: 4.5 });
        },
        stem: function (sh) { return '<b>A two-leg journey with a right-angled turn.</b> A survey crew leaves camp ' + t('C') + ' and walks ' + t(f1(sh.d1)) + ' km on a bearing of ' + t(dg(b3(sh.b1))) + ' to marker ' + t('M') + '. At ' + t('M') + ' they turn and walk ' + t(f1(sh.d2)) + ' km on a bearing of ' + t(dg(b3(sh.b2))) + ' to marker ' + t('K') + '. ' + t('CN') + ' and ' + t('MW') + ' are north lines.<br>' + twoLegFig(sh.b1, sh.d1, sh.b2, sh.d2, ['C', 'M', 'K', 'N', 'W'], [f1(sh.d1) + ' km', f1(sh.d2) + ' km']); },
        parts: [
          { id: 'e11a', level: 'EMG', make: function (r, sh) {
            var b1 = sh.b1, b2 = sh.b2;
            return K.P.mc(r, 'Which argument shows that angle ' + t('CMK') + ' is exactly ' + t('90^\\circ') + '?', [
              { html: 'From ' + t('M') + ', the bearing of ' + t('C') + ' is the return bearing ' + t(b1 + '^\\circ+180^\\circ=' + (b1 + 180) + '^\\circ') + '; the bearing of ' + t('K') + ' is ' + t(dg(b2)) + '; so ' + t('\\angle CMK=' + (b1 + 180) + '^\\circ-' + b2 + '^\\circ=90^\\circ') + '.', right: true },
              { html: 'The diagram shows a square corner at ' + t('M') + '.', why: 'Don’t measure the picture — show it from the bearings, using the north line at ' + t('M') + '.' },
              { html: t(f1(sh.d1) + '^{2}+' + f1(sh.d2) + '^{2}=CK^{2}') + ', so the triangle is right-angled at ' + t('M') + '.', why: 'That is circular: you can only use the Pythagorean theorem once you <b>know</b> there is a right angle — and ' + t('CK') + ' isn’t known.' },
              { html: 'The two bearings add to ' + t(dg(b1 + b2)) + ', which is more than ' + t('180^\\circ') + '.', why: 'Adding the bearings doesn’t give the angle at ' + t('M') + '. Use the bearing of ' + t('C') + ' from ' + t('M') + ' (the return bearing).' }],
              t('MW') + ' is a north line, so ' + t(dg(b2)) + ' is the clockwise turn from ' + t('MW') + ' to ' + t('MK') + '. ' + t('MC') + ' points back along the first leg, so its bearing from ' + t('M') + ' is ' + t(b1 + '^\\circ+180^\\circ=' + (b1 + 180) + '^\\circ') + '.<br>' + t('\\angle CMK=' + (b1 + 180) + '^\\circ-' + b2 + '^\\circ=90^\\circ') + ' ✓ (the turn is ' + t(b2 + '^\\circ-' + b1 + '^\\circ=90^\\circ') + ').', ['What is the bearing of ' + t('C') + ' from ' + t('M') + '?'], 'show right-angled turn');
          } },
          { id: 'e11b', level: 'EMG', make: function (r, sh) {
            var ck = Math.hypot(sh.d1, sh.d2);
            return nearP('Triangle ' + t('CMK') + ' is right-angled at ' + t('M') + '. Determine the direct distance from ' + t('K') + ' back to camp ' + t('C') + ', to the nearest tenth of a kilometre.', ck, 1, 'km', [
              A(sh.d1 + sh.d2, 'leg-sum', 'That is the distance walked. The direct distance is the hypotenuse: ' + t('CK^{2}=' + f1(sh.d1) + '^{2}+' + f1(sh.d2) + '^{2}') + '.'),
              A(Math.sqrt(Math.abs(sh.d2 * sh.d2 - sh.d1 * sh.d1)), 'pyth-add', t('CK') + ' is the hypotenuse (opposite the right angle at ' + t('M') + '): <b>add</b> the squares.')],
              'Right-angled at ' + t('M') + ', so use the Pythagorean theorem: ' + t('CK^{2}=' + f1(sh.d1) + '^{2}+' + f1(sh.d2) + '^{2}=' + RT(sh.d1 * sh.d1 + sh.d2 * sh.d2, 2)) + '<br>' + t('CK=' + fl(ck) + '\\approx ' + fx(ck, 1)) + ' km',
              [t('CK') + ' is the hypotenuse of the right triangle.'], 'direct distance after right-angled turn');
          } },
          { id: 'e11c', level: 'EMG', make: function (r, sh) {
            var k = Tg.atan(sh.d1 / sh.d2);
            return nearP('Determine the size of angle ' + t('MKC') + ' (at ' + t('K') + '), to the nearest degree.', k, 0, '°', [
              A(Tg.atan(sh.d2 / sh.d1), 'other-angle', 'That is the angle at ' + t('C') + '. At ' + t('K') + ', ' + t('CM=' + f1(sh.d1)) + ' is opposite and ' + t('MK=' + f1(sh.d2)) + ' is adjacent.'),
              A(Tg.asin(sh.d1 / sh.d2), 'trig-ratio', 'Neither ' + t(f1(sh.d1)) + ' nor ' + t(f1(sh.d2)) + ' is the hypotenuse — they are the two legs ⇒ tan.'), aRad(Math.atan(sh.d1 / sh.d2))],
              'Relative to ' + t('\\angle MKC') + ': ' + t('CM=' + f1(sh.d1)) + ' is opposite, ' + t('MK=' + f1(sh.d2)) + ' is adjacent (TOA).<br>' + t('\\tan(\\angle MKC)=\\dfrac{' + f1(sh.d1) + '}{' + f1(sh.d2) + '}\\Rightarrow\\angle MKC=' + fx(k, 2) + '^\\circ\\approx ' + dg(fx(k, 0))),
              ['At ' + t('K') + ': which leg is opposite, which is adjacent?'], 'angle MKC');
          } },
          { id: 'e11d', level: 'ADV', make: function (r, sh) {
            var k = Tg.atan(sh.d1 / sh.d2), back = sh.b2 + 180 - k, fwd = sh.b1 + 90 - k;
            return bearingP('Determine the three-figure bearing the crew must walk to return from ' + t('K') + ' directly to ' + t('C') + '. (' + t('\\angle MKC\\approx ' + fx(k, 1) + '^\\circ') + ')', back, [
              A(sh.b2 + 180 + k, 'bearing-ccw', 'From ' + t('K') + ', the bearing back to ' + t('M') + ' is ' + t((sh.b2 + 180) + '^\\circ') + '. ' + t('C') + ' is ' + t('\\angle MKC') + ' <b>anticlockwise</b> from ' + t('KM') + ', so subtract.'),
              A(sh.b2 + 180 + k - 360, 'bearing-ccw', t('C') + ' lies anticlockwise from ' + t('KM') + ' — subtract ' + t('\\angle MKC') + ' from the bearing of ' + t('M') + '.'),
              A(fwd, 'bearing-back', 'That is the bearing of ' + t('K') + ' from ' + t('C') + '. Walking back from ' + t('K') + ' to ' + t('C') + ' is the opposite direction (±' + t('180^\\circ') + ').'),
              A(sh.b2 - k, 'bearing-back', 'Start from the bearing of ' + t('M') + ' <b>from</b> ' + t('K') + ', the return of ' + t(dg(sh.b2)) + ': ' + t(sh.b2 + '^\\circ+180^\\circ') + '.')],
              'From ' + t('K') + ', the direction back along the second leg to ' + t('M') + ' has bearing ' + t(sh.b2 + '^\\circ+180^\\circ=' + (sh.b2 + 180) + '^\\circ') + '. ' + t('C') + ' lies ' + t('\\angle MKC') + ' anticlockwise from ' + t('KM') + ', so subtract:<br>' + t((sh.b2 + 180) + '^\\circ-' + fx(k, 2) + '^\\circ=' + fx(back, 2) + '^\\circ\\approx ' + dg(b3(back))),
              ['First find the bearing of ' + t('M') + ' from ' + t('K') + ' (the return of ' + t(dg(sh.b2)) + ').', 'Is ' + t('C') + ' clockwise or anticlockwise from ' + t('KM') + '? Look at the diagram.'], 'return bearing K to C');
          } },
          { id: 'e11e', level: 'PRG', make: function (r, sh) {
            var k = Tg.atan(sh.d1 / sh.d2), c = 90 - k, fwd = sh.b1 + c;
            return bearingP('Determine the three-figure bearing of ' + t('K') + ' from ' + t('C') + '. (' + t('\\angle MKC\\approx ' + fx(k, 1) + '^\\circ') + ')', fwd, [
              A(sh.b1 + k, 'other-angle', 'At ' + t('C') + ' the angle in the triangle is ' + t('\\angle MCK=90^\\circ-\\angle MKC') + ', not ' + t('\\angle MKC') + '.'),
              A(fwd + 180, 'bearing-back', 'That is the bearing of ' + t('C') + ' from ' + t('K') + ' (the way back).'),
              A(sh.b1 - c, 'bearing-ccw', t('K') + ' is <b>clockwise</b> from ' + t('CM') + ' (the turn at ' + t('M') + ' is to the right), so add ' + t('\\angle MCK') + ' to ' + t(dg(sh.b1)) + '.')],
              t('\\angle MCK=90^\\circ-' + fx(k, 2) + '^\\circ=' + fx(c, 2) + '^\\circ') + ', and ' + t('CM') + ' has bearing ' + t(dg(b3(sh.b1))) + ', so the bearing of ' + t('K') + ' from ' + t('C') + ' is ' + t(sh.b1 + '^\\circ+' + fx(c, 2) + '^\\circ=' + fx(fwd, 2) + '^\\circ\\approx ' + dg(b3(fwd))) + '.<br>Check with the return rule: ' + t(fx(fwd, 2) + '^\\circ+180^\\circ\\approx ' + dg(b3(fwd + 180))) + ' — the answer to (d) ✓',
              ['Find ' + t('\\angle MCK') + ' (the angles of the triangle add to ' + t('180^\\circ') + ').', 'Add it to the bearing of the first leg.'], 'bearing K from C');
          } }] },
      { num: '12', shared: function (r) { var be; do { be = r.int(300, 340); } while (be === 315); return { d: tenth(r, 4, 12), be: be }; },
        stem: function (sh) { var a = sh.be - 270, Lh = sh.d * Tg.tan(a); return 'A lighthouse ' + t('L') + ' is due north of a harbour ' + t('H') + '. A ship ' + t('S') + ' is anchored ' + t(f1(sh.d)) + ' km due east of ' + t('H') + '. From the ship, the lighthouse lies on a bearing of ' + t(dg(sh.be)) + '.<br>' + bearFig({ H: [0, 0], L: [0, Lh], S: [sh.d, 0] }, [['H', 'S', f1(sh.d) + ' km'], ['H', 'L'], ['S', 'L']], [['S', 'Sn']], Lh * 0.55, { right: [['H', 'S', 'L']], width: 240 }); },
        parts: [
          { id: 'e12a', level: 'EMG', make: function (r, sh) {
            var a = sh.be - 270;
            return { prompt: 'Determine the size of angle ' + t('HSL') + ' (at the ship).', input: { type: 'number', after: '°' }, check: intCheck(a, [A(360 - sh.be, 'bearing-ref', t('360^\\circ-' + sh.be + '^\\circ=' + dg(360 - sh.be)) + ' is the angle between the <b>north</b> line at ' + t('S') + ' and ' + t('SL') + '. ' + t('SH') + ' points due west, ' + t('90^\\circ') + ' from north.'), A(sh.be - 180, 'bearing-ref', 'Work from the north line at ' + t('S') + ': ' + t('SL') + ' is ' + t(dg(360 - sh.be)) + ' west of north, and ' + t('SH') + ' (due west) is ' + t('90^\\circ') + ' from north.')]),
              key: String(a), answer: t(dg(a)), bad: [String(360 - sh.be), String(sh.be - 180)],
              solution: 'The bearing ' + t(dg(sh.be)) + ' is ' + t('360^\\circ-' + sh.be + '^\\circ=' + dg(360 - sh.be)) + ' measured anticlockwise from north: ' + t('L') + ' is ' + t(dg(360 - sh.be)) + ' west of north from ' + t('S') + '. ' + t('SH') + ' points due west, ' + t('90^\\circ') + ' from north, so ' + t('\\angle HSL=90^\\circ-' + dg(360 - sh.be) + '=' + dg(a)) + '.',
              hints: ['Draw the north line at ' + t('S') + '. How far west of north is ' + t('SL') + '? How far is due west from north?'], text: 'angle HSL from bearing ' + sh.be };
          } },
          { id: 'e12b', level: 'PRG', make: function (r, sh) {
            var a = sh.be - 270, d = sh.d, hl = d * Tg.tan(a), sl = d / Tg.cos(a), w = 360 - sh.be;
            return K.P.fields('Angle ' + t('HSL=' + dg(a)) + '. Determine the distance from the harbour to the lighthouse and from the ship to the lighthouse, to the nearest tenth of a kilometre.', [{ label: t('HL='), after: 'km' }, { label: t('SL='), after: 'km' }],
              [nearC(hl, 1, [A(d * Tg.tan(w), 'bearing-ref', 'Use the angle inside the triangle at ' + t('S') + ', ' + t(dg(a)) + ' — not the ' + t(dg(w)) + ' from north.'), A(d / Tg.tan(a), 'trig-inverted', t('HL') + ' is opposite and ' + t('HS') + ' adjacent: ' + t('HL=' + f1(d) + '\\tan ' + dg(a)) + '.'), A(d * Tg.sin(a), 'trig-ratio', 'Opposite and adjacent ⇒ tan.'), aRad(d * Tg.radTan(a))]),
               nearC(sl, 1, [A(d * Tg.cos(a), 'trig-inverted', t('SL') + ' is in the denominator of ' + t('\\cos ' + dg(a) + '=\\frac{' + f1(d) + '}{SL}') + ': divide.'), A(d / Tg.cos(w), 'bearing-ref', 'Use the angle at ' + t('S') + ' inside the triangle, ' + t(dg(a)) + '.'), A(d / Tg.sin(a), 'trig-ratio', t(f1(d)) + ' km is <b>adjacent</b> to ' + t(dg(a)) + ' ⇒ CAH.'), aRad(d / Tg.radCos(a))])],
              [RT(hl, 1).toFixed(1), RT(sl, 1).toFixed(1)], t('HL=' + fx(hl, 1)) + ' km, ' + t('SL=' + fx(sl, 1)) + ' km',
              'Right angle at ' + t('H') + '; relative to ' + t('\\angle HSL=' + dg(a)) + ': ' + t('HL') + ' is opposite, ' + t('HS=' + f1(d)) + ' is adjacent, ' + t('SL') + ' is the hypotenuse.<br>' + t('HL=' + f1(d) + '\\tan ' + dg(a) + '=' + fl(hl) + '\\approx ' + fx(hl, 1)) + ' km<br>' + t('SL=\\dfrac{' + f1(d) + '}{\\cos ' + dg(a) + '}=' + fl(sl) + '\\approx ' + fx(sl, 1)) + ' km',
              ['Opposite & adjacent ⇒ tan; adjacent & hypotenuse ⇒ cos.'], 'lighthouse distances');
          } },
          { id: 'e12c', level: 'EMG', make: function (r, sh) {
            var bk = sh.be - 180;
            return bearingP('Determine the three-figure bearing of the ship from the lighthouse.', bk, [A(sh.be + 180, 'back-over', t(dg(sh.be)) + ' is already ' + t('180^\\circ') + ' or more, so subtract ' + t('180^\\circ') + ' instead of adding.'), A(360 - sh.be, 'bearing-ccw', 'That is the angle from north at ' + t('S') + '. The bearing of ' + t('S') + ' from ' + t('L') + ' is the return bearing: ' + t(sh.be + '^\\circ-180^\\circ') + '.'), A(180 + (360 - sh.be), 'bearing-ccw', t('S') + ' is south-<b>east</b> of ' + t('L') + ', so the bearing is between ' + t('090^\\circ') + ' and ' + t('180^\\circ') + '.')],
              'The bearing of ' + t('L') + ' from ' + t('S') + ' is ' + t(dg(sh.be)) + ', which is ' + t('180^\\circ') + ' or more, so subtract: ' + t(sh.be + '^\\circ-180^\\circ=' + dg(b3(bk))) + '.<br>Check: ' + t('S') + ' is south-east of ' + t('L') + ', and ' + t(dg(b3(bk))) + ' points south-east ✓',
              ['Use the return-bearing rule on ' + t(dg(sh.be)) + '.'], 'ship from lighthouse');
          } }] },

      /* ---------- Part E: which triangle first ---------- */
      { num: '13', section: 'Extra practice E — Which triangle can be solved first?', shared: function (r) {
          return until(r, function (r) { var Hb = tenth(r, 15, 40), al = r.int(20, 40), be = r.int(al + 8, Math.min(al + 20, 60)), PF = Hb / Tg.tan(al), m = PF * Tg.tan(be) - Hb, mr = RT(PF, 1) * Tg.tan(be) - Hb; return RT(m, 1) !== RT(mr, 1) ? { Hb: Hb, al: al, be: be } : null; }, { Hb: 28, al: 32, be: 47 });
        },
        stem: function (sh) {
          var va = vis(sh.al, 22, 38), vb = Math.max(vis(sh.be, 22, 60), va + 14), W = 10, rH = W * Tg.tan(va), tH = W * Tg.tan(vb);
          return 'A radio mast ' + t('RT') + ' stands on the flat roof of a building ' + t(f1(sh.Hb)) + ' m tall. From a point ' + t('P') + ' on level ground, the angle of elevation of the roofline ' + t('R') + ' is ' + t(dg(sh.al)) + ', and the angle of elevation of the top of the mast ' + t('T') + ' is ' + t(dg(sh.be)) + '.<br>' +
            HW.fig({ pts: { P: [0, 0], F: [W, 0], R: [W, rH], T: [W, tH] }, segs: [['P', 'F'], ['F', 'R', f1(sh.Hb) + ' m', { width: 1.4, side: -1 }], ['R', 'T', { width: 3.2 }], ['P', 'R'], ['P', 'T']], right: [['F', 'P', 'R']], angles: [['P', 'F', 'R', deg(sh.al), { r: 60 }], ['P', 'F', 'T', deg(sh.be), { r: 26 }]], extra: [{ type: 'ground', y: 0, x0: -0.6, x1: W + 3 }, { type: 'building', at: [W + 1.2, 0], w: 2.4, h: rH }], width: 300 });
        },
        parts: [
          { id: 'e13a', level: 'EMG', make: function (r, sh) {
            return K.P.mc(r, 'Two right triangles share the side ' + t('PF') + '. Which one can be solved first, and why?', [
              { html: t('\\triangle PFR') + ': besides the right angle it has two facts, the ' + t(dg(sh.al)) + ' angle and ' + t('FR=' + f1(sh.Hb)) + ' m. ' + t('\\triangle PFT') + ' has only an angle.', right: true },
              { html: t('\\triangle PFT') + ': it is the bigger triangle, so it contains all the information.', why: t('\\triangle PFT') + ' has the ' + t(dg(sh.be)) + ' angle but <b>no</b> known side — neither ' + t('PF') + ' nor ' + t('FT') + ' is given.' },
              { html: 'Either one: both contain the side ' + t('PF') + '.', why: 'Sharing ' + t('PF') + ' helps only <b>after</b> ' + t('PF') + ' is found. Which triangle has a known side?' },
              { html: 'Neither: you need the height of the mast first.', why: 'The mast height is what you’re finding. One triangle already has an angle <b>and</b> a side.' }],
              t('\\triangle PFR') + ' can be solved first: it has the angle ' + t(dg(sh.al)) + ' and the side ' + t('FR=' + f1(sh.Hb)) + ' m. ' + t('\\triangle PFT') + ' has only the angle ' + t(dg(sh.be)) + '; neither ' + t('PF') + ' nor ' + t('FT') + ' is known. Once ' + t('PF') + ' comes out of the first triangle, it becomes the known side of the second.', ['Which triangle has an angle <b>and</b> a known side?'], 'which triangle first');
          } },
          { id: 'e13b', level: 'EMG', make: function (r, sh) {
            var PF = sh.Hb / Tg.tan(sh.al);
            return nearP('Determine ' + t('PF') + ', the horizontal distance from ' + t('P') + ' to the building, to the nearest tenth of a metre.', PF, 1, 'm', [
              A(sh.Hb * Tg.tan(sh.al), 'trig-inverted', t('PF') + ' is in the denominator of ' + t('\\tan ' + dg(sh.al) + '=\\frac{' + f1(sh.Hb) + '}{PF}') + ': divide.'), A(sh.Hb / Tg.sin(sh.al), 'trig-ratio', 'That is the line of sight ' + t('PR') + '. ' + t('PF') + ' is adjacent ⇒ TOA.'), A(sh.Hb / Tg.tan(sh.be), 'trig-ratio', 'The ' + t(f1(sh.Hb)) + ' m is the building, so use the roofline angle ' + t(dg(sh.al)) + '.'), aRad(sh.Hb / Tg.radTan(sh.al))],
              'In ' + t('\\triangle PFR') + ', relative to ' + t(dg(sh.al)) + ': ' + t('FR=' + f1(sh.Hb)) + ' is opposite, ' + t('PF') + ' is adjacent.<br>' + t('PF=\\dfrac{' + f1(sh.Hb) + '}{\\tan ' + dg(sh.al) + '}=' + fl(PF) + '\\approx ' + fx(PF, 1)) + ' m (keep ' + t(fl(PF)) + ')',
              ['Use the triangle with the building and the ' + t(dg(sh.al)) + ' angle.'], 'PF from roofline');
          } },
          { id: 'e13c', level: 'PRG', make: function (r, sh) {
            var PF = sh.Hb / Tg.tan(sh.al), FT = PF * Tg.tan(sh.be), m = FT - sh.Hb;
            return K.P.fields(t('PF\\approx ' + fl(PF)) + ' m. Determine ' + t('FT') + ', the total height of building plus mast, then the height of the mast alone (each to the nearest tenth of a metre).', [{ label: t('FT='), after: 'm' }, { label: 'mast:', after: 'm' }],
              [nearC(FT, 1, [A(PF / Tg.tan(sh.be), 'trig-inverted', t('FT') + ' is opposite the ' + t(dg(sh.be)) + ' angle: ' + t('FT=PF\\tan ' + dg(sh.be)) + '.'), A(PF * Tg.tan(sh.be - sh.al), 'angle-diff', t('FT') + ' is the whole height, from the ground: use ' + t(dg(sh.be)) + '.'), A(RT(PF, 1) * Tg.tan(sh.be), 'early-round', EARLY), aRad(PF * Tg.radTan(sh.be))]),
               nearC(m, 1, [A(PF * Tg.tan(sh.be - sh.al), 'angle-diff', 'Tangents don’t subtract like that: the mast is ' + t('PF\\tan ' + dg(sh.be) + '-PF\\tan ' + dg(sh.al)) + ', not ' + t('PF\\tan(' + (sh.be - sh.al) + '^\\circ)') + '.'), A(FT, 'not-diff', 'That is building + mast. Subtract the building’s ' + t(f1(sh.Hb)) + ' m.'), A(RT(PF, 1) * Tg.tan(sh.be) - sh.Hb, 'early-round', EARLY)])],
              [RT(FT, 1).toFixed(1), RT(m, 1).toFixed(1)], t('FT=' + fx(FT, 1)) + ' m, mast ' + t('=' + fx(m, 1)) + ' m',
              'In ' + t('\\triangle PFT') + ', relative to ' + t(dg(sh.be)) + ': ' + t('FT') + ' is opposite, ' + t('PF') + ' is adjacent.<br>' + t('FT=PF\\tan ' + dg(sh.be) + '=' + fl(PF) + '\\times ' + fl(Tg.tan(sh.be)) + '=' + fl(FT) + '\\approx ' + fx(FT, 1)) + ' m<br>Mast ' + t('=FT-FR=' + fl(FT) + '-' + f1(sh.Hb) + '=' + fl(m) + '\\approx ' + fx(m, 1)) + ' m',
              ['Use ' + t('PF') + ' as the known side of ' + t('\\triangle PFT') + '.', 'Mast = total height − building.'], 'mast height');
          } },
          { id: 'e13d', level: 'EMG', make: function (r, sh) {
            var PF = sh.Hb / Tg.tan(sh.al), wrongV = PF * Tg.tan(sh.be - sh.al), m = PF * Tg.tan(sh.be) - sh.Hb, df = sh.be - sh.al;
            return K.P.mc(r, 'A student writes “the mast makes ' + t(sh.be + '^\\circ-' + sh.al + '^\\circ=' + dg(df)) + ' at ' + t('P') + ', so the mast is ' + t('PF\\tan ' + dg(df)) + '.” What value does that give, and why does the reasoning fail?', [
              { html: 'About ' + t(fx(wrongV, 1)) + ' m. It fails because tan isn’t additive: the mast is a <b>difference of two heights</b>, ' + t('PF\\tan ' + dg(sh.be) + '-PF\\tan ' + dg(sh.al)) + ', and ' + t('\\tan ' + dg(sh.be) + '-\\tan ' + dg(sh.al) + '\\ne\\tan ' + dg(df)) + '.', right: true },
              { html: 'About ' + t(fx(m, 1)) + ' m — the reasoning is correct.', why: 'Work it out: ' + t('PF\\tan ' + dg(df) + '\\approx ' + fx(wrongV, 1)) + ' m, which doesn’t match ' + t(fx(m, 1)) + ' m. Something is wrong with the method.' },
              { html: 'About ' + t(fx(wrongV, 1)) + ' m. It fails because the angles should be added: ' + t(dg(sh.be + sh.al)) + '.', why: 'Adding the angles makes no more sense than subtracting them. The mast starts ' + t(f1(sh.Hb)) + ' m up, so it is a difference of two heights measured from the ground.' },
              { html: 'About ' + t(fx(wrongV, 1)) + ' m. It fails because it should be ' + t('PF\\div\\tan ' + dg(df)) + '.', why: 'Changing the operation doesn’t help: no right triangle has the mast as a side and ' + t(dg(df)) + ' as an angle.' }],
              t('PF\\tan ' + dg(df) + '=' + fl(PF) + '\\times ' + fl(Tg.tan(df)) + '\\approx ' + fx(wrongV, 1)) + ' m — not the correct ' + t(fx(m, 1)) + ' m. ' + t('\\tan ' + dg(df)) + ' measures a rise from the horizontal through ' + t('P') + ', but the mast starts ' + t(f1(sh.Hb)) + ' m up. The mast is a <b>difference of two tangent heights</b>, ' + t('PF\\tan ' + dg(sh.be) + '-PF\\tan ' + dg(sh.al)) + ', and ' + t('\\tan ' + dg(sh.be) + '-\\tan ' + dg(sh.al) + '\\ne\\tan ' + dg(df)) + '.', ['Compute ' + t('PF\\tan ' + dg(df)) + ' and compare it with the correct mast height.'], 'angle subtraction error');
          } },
          { id: 'e13e', level: 'EMG', make: function (r, sh) {
            var PF = sh.Hb / Tg.tan(sh.al), m = PF * Tg.tan(sh.be) - sh.Hb, mr = RT(PF, 1) * Tg.tan(sh.be) - sh.Hb;
            return K.P.fields('Work out the mast height twice: with ' + t('PF') + ' rounded to the nearest tenth (' + t(fx(PF, 1)) + ') and with the full value ' + t(fl(PF)) + '. Give each to the nearest tenth of a metre.', [{ label: 'rounded ' + t('PF') + ':', after: 'm' }, { label: 'full ' + t('PF') + ':', after: 'm' }],
              [nearC(mr, 1, [A(m, 'early-round', 'That is the mast from the <b>full</b> value. Use ' + t('PF=' + fx(PF, 1)) + ' in this box.')]), nearC(m, 1, [A(mr, 'early-round', 'That comes from the rounded ' + t('PF') + '. Use the full value here.')])],
              [RT(mr, 1).toFixed(1), RT(m, 1).toFixed(1)], 'rounded: ' + t(fx(mr, 1)) + ' m; full: ' + t(fx(m, 1)) + ' m',
              'Rounded: ' + t(fx(PF, 1) + '\\tan ' + dg(sh.be) + '-' + f1(sh.Hb) + '=' + fl(mr) + '\\approx ' + fx(mr, 1)) + ' m.<br>Full: ' + t(fl(PF) + '\\tan ' + dg(sh.be) + '-' + f1(sh.Hb) + '=' + fl(m) + '\\approx ' + fx(m, 1)) + ' m — this is the correct one. One rounded intermediate value has already moved the answer by a tenth.',
              ['Mast = ' + t('PF\\tan ' + dg(sh.be) + '-' + f1(sh.Hb)) + '. Do it with both values of ' + t('PF') + '.'], 'rounded PF effect');
          } }] },

      /* ---------- Part F: error analysis ---------- */
      { num: '14', section: 'Extra practice F — Error analysis: three students, three different mistakes', shared: function (r) { return { H: tenth(r, 20, 60), th: r.int(20, 40) }; },
        stem: function (sh) { return '<b>Measured from the vertical.</b> From the top ' + t('T') + ' of a fire lookout tower ' + t(f1(sh.H)) + ' m tall, the angle of depression of a canoe ' + t('K') + ' on the level lake below is ' + t(dg(sh.th)) + '. Asked for the horizontal distance from the foot ' + t('B') + ' of the tower to the canoe, a student wrote ' + t('BK=' + f1(sh.H) + '\\tan ' + dg(sh.th) + '=' + fx(sh.H * Tg.tan(sh.th), 1) + '\\text{ m}') + '.<br>' + deprScene({ th: sh.th, hLab: f1(sh.H) + ' m', obj: 'tower', names: { E: 'T', G: 'B', S: 'K' } }); },
        parts: [
          { id: 'e14a', level: 'EMG', make: function (r, sh) {
            return K.P.mc(r, 'Name the student’s error: from what line did the student effectively measure the ' + t(dg(sh.th)) + '?', [
              { html: 'From the <b>vertical</b> tower ' + t('TB') + ' instead of from the horizontal at ' + t('T') + ' — that makes ' + t(f1(sh.H)) + ' m look adjacent to the angle.', right: true },
              { html: 'The student used tan when it should be sin.', why: 'Tan is the right ratio (opposite and adjacent). The problem is <b>where</b> the angle is: which side is opposite it?' },
              { html: 'The student forgot to add an eye height.', why: 'No eye height is involved here. Look at which line the ' + t(dg(sh.th)) + ' is measured from.' },
              { html: 'The student rounded too early.', why: 'The answer isn’t slightly off — it is far off. The angle has been put in the wrong place.' }],
              'The student measured the ' + t(dg(sh.th)) + ' from the <b>vertical</b> tower ' + t('TB') + ' instead of from the horizontal dashed line at ' + t('T') + '. Writing ' + t('BK=' + f1(sh.H) + '\\tan ' + dg(sh.th)) + ' treats ' + t(f1(sh.H)) + ' m as the side adjacent to the angle, which is only true if the angle sits between the tower and the line of sight.', ['In the student’s formula, which side is adjacent to the angle?'], 'error: measured from vertical');
          } },
          { id: 'e14b', level: 'EMG', make: function (r, sh) {
            var bk = sh.H / Tg.tan(sh.th);
            return nearP('Give the correct horizontal distance ' + t('BK') + ', to the nearest tenth of a metre.', bk, 1, 'm', [
              A(sh.H * Tg.tan(sh.th), 'depr-vertical', 'That is the student’s answer — the angle measured from the vertical. Relative to the ' + t(dg(sh.th)) + ' as drawn, ' + t('TB') + ' is <b>opposite</b> and ' + t('BK') + ' is adjacent.'),
              A(sh.H / Tg.sin(sh.th), 'trig-ratio', 'That is the line of sight ' + t('TK') + '. ' + t('BK') + ' is adjacent ⇒ TOA.'), aRad(sh.H / Tg.radTan(sh.th))],
              'Relative to the ' + t(dg(sh.th)) + ' as drawn (between the horizontal at ' + t('T') + ' and ' + t('TK') + '), or the equal angle of elevation at ' + t('K') + ': opposite ' + t('=TB=' + f1(sh.H)) + ' m, adjacent ' + t('=BK') + '.<br>' + t('BK=\\dfrac{' + f1(sh.H) + '}{\\tan ' + dg(sh.th) + '}=' + fl(bk) + '\\approx ' + fx(bk, 1)) + ' m',
              ['Move the angle to the canoe (angle of elevation = angle of depression). From there, which side is the tower?'], 'corrected canoe distance');
          } },
          { id: 'e14c', level: 'BEG', make: function (r, sh) {
            var a = 90 - sh.th;
            return { prompt: 'State angle ' + t('BTK') + ' — the angle at ' + t('T') + ' measured from the tower itself.', input: { type: 'number', after: '°' }, check: intCheck(a, [A(sh.th, 'depr-vertical', t(dg(sh.th)) + ' is measured from the <b>horizontal</b>. The tower is vertical, ' + t('90^\\circ') + ' from the horizontal.'), A(180 - sh.th, 'bearing-ref', 'The tower and the horizontal at ' + t('T') + ' make ' + t('90^\\circ') + ', not ' + t('180^\\circ') + '.')]),
              key: String(a), answer: t(dg(a)), bad: [String(sh.th), String(180 - sh.th)],
              solution: t('\\angle BTK=90^\\circ-' + dg(sh.th) + '=' + dg(a)) + '. Relative to it, ' + t('TB') + ' is adjacent and ' + t('BK') + ' is opposite, so ' + t('BK=' + f1(sh.H) + '\\tan ' + dg(a) + '=' + fx(sh.H * Tg.tan(a), 1)) + ' m — the correct distance. The student’s expression is the right one for the <b>wrong angle</b>.',
              hints: ['The horizontal and the tower meet at ' + t('90^\\circ') + '.'], text: 'angle from the tower' };
          } },
          { id: 'e14d', level: 'EMG', make: function (r, sh) {
            var s = fx(sh.H * Tg.tan(sh.th), 1);
            return K.P.mc(r, 'How would a rough sketch drawn to scale have exposed the student’s ' + t(s) + ' m as impossible?', [
              { html: t(dg(sh.th)) + ' is less than ' + t('45^\\circ') + ', so the line of sight is shallow and ' + t('BK') + ' must be <b>longer</b> than the tower (' + t(f1(sh.H)) + ' m). ' + t(s) + ' m is shorter.', right: true },
              { html: 'A shallow angle puts the canoe close to the tower, so ' + t(s) + ' m is too <b>long</b>.', why: 'It’s the other way round: a shallow (small) angle of depression means the canoe is <b>far</b> away.' },
              { html: 'A sketch can’t show anything; only a calculation can.', why: 'A sketch to scale shows whether the canoe should be nearer or farther than the tower is tall.' },
              { html: 'Distances on a lake must be whole numbers.', why: 'Distances don’t have to be whole numbers. Compare the answer with the tower height.' }],
              t(dg(sh.th)) + ' is well under ' + t('45^\\circ') + ', so the line of sight is shallow and the canoe must be much farther out than the tower is tall. ' + t(s) + ' m is less than the tower’s own ' + t(f1(sh.H)) + ' m, which would need a steep depression of about ' + t(dg(90 - sh.th)) + '. A sketch shows this at once.', ['At ' + t('45^\\circ') + ', the distance would equal the height. Is this angle bigger or smaller?'], 'sketch check');
          } }] },
      { num: '15', shared: function (r) { return { e: r.int(145, 175) / 100, d: tenth(r, 20, 50), th: r.int(25, 50) }; },
        stem: function (sh) { return '<b>Eye height forgotten.</b> Standing on level ground ' + t(f1(sh.d)) + ' m from the base of a stone chimney, a student whose eyes are ' + t(sh.e.toFixed(2)) + ' m above the ground measures the angle of elevation of the top of the chimney to be ' + t(dg(sh.th)) + '. She reported the chimney’s height as ' + t(fx(sh.d * Tg.tan(sh.th), 1)) + ' m.<br>' + eyeScene({ th: sh.th, eyeLab: sh.e.toFixed(2) + ' m', runLab: f1(sh.d) + ' m', obj: 'chimney', aria: 'chimney and observer' }); },
        parts: [
          { id: 'e15a', level: 'BEG', make: function (r, sh) {
            return K.P.mc(r, 'Her arithmetic is perfect. What has she actually calculated?', [
              { html: 'The height of the chimney top <b>above her eye level</b> — the triangle sits on the dashed eye-level line, ' + t(sh.e.toFixed(2)) + ' m up.', right: true },
              { html: 'The length of her line of sight to the top.', why: t(f1(sh.d) + '\\tan ' + dg(sh.th)) + ' is opposite ÷ adjacent rearranged: it gives the <b>opposite</b> side (the rise), not the hypotenuse.' },
              { html: 'The height of the chimney above the ground.', why: 'The triangle starts at her <b>eyes</b>, not at the ground. Look at the dashed line.' },
              { html: 'The horizontal distance to the chimney.', why: 'That was given (' + t(f1(sh.d)) + ' m). ' + t(f1(sh.d) + '\\tan ' + dg(sh.th)) + ' is a vertical length.' }],
              'She calculated ' + t(f1(sh.d) + '\\tan ' + dg(sh.th) + '=' + fl(sh.d * Tg.tan(sh.th))) + ', the height of the chimney top <b>above her eye level</b>. The dashed line is her eye-level horizontal: the triangle sits on it, ' + t(sh.e.toFixed(2)) + ' m up, so it only returns the part of the chimney above it.', ['Where does the triangle start — at the ground or at her eyes?'], 'what was computed');
          } },
          { id: 'e15b', level: 'EMG', make: function (r, sh) {
            var rise = sh.d * Tg.tan(sh.th), H = rise + sh.e;
            return nearP('Give the corrected height of the chimney, to the nearest tenth of a metre.', H, 1, 'm', [
              A(rise, 'eye-height', 'That is her original answer — the rise above eye level. Add her eye height.'), A(rise - sh.e, 'eye-sub', 'Her eyes are above the ground: add the eye height.'), A(RT(rise, 1) + sh.e, 'early-round', EARLY)],
              'Add the eye height back:<br>' + t('\\text{height}=' + f1(sh.d) + '\\tan ' + dg(sh.th) + '+' + sh.e.toFixed(2) + '=' + fl(rise) + '+' + sh.e.toFixed(2) + '=' + fl(H) + '\\approx ' + fx(H, 1)) + ' m',
              ['Rise above eye level + eye height.'], 'corrected chimney height');
          } },
          { id: 'e15c', level: 'EMG', make: function (r) {
            var shadow = r.chance(0.5);
            return K.P.mc(r, 'In which situation does the eye height genuinely <b>not</b> need to be added?', [
              shadow ? { html: 'When the angle is measured at ground level — e.g. the sun’s angle of elevation at the tip of a shadow on the ground.', right: true } : { html: 'When the question asks only for the rise <b>above eye level</b> (or above the instrument).', right: true },
              { html: 'When the eye height is less than ' + t('2') + ' m, because it is too small to matter.', why: 'Even ' + t('1.5') + ' m changes the answer by ' + t('1.5') + ' m. It matters whenever the angle is measured from the eyes.' },
              { html: 'When the angle of elevation is less than ' + t('45^\\circ') + '.', why: 'The size of the angle doesn’t matter. What matters is <b>where</b> the angle is measured from.' },
              { html: 'When the object is very tall, like a skyscraper.', why: 'A tall object makes the eye height a small fraction, but leaving it out is still an error if the angle was measured at the eyes.' }],
              'Two cases: (i) when the question asks only for the rise above eye level — that is exactly what the triangle gives; (ii) when the angle is taken at ground level, e.g. a shadow problem, where the sun’s angle is measured at the tip of the shadow on the ground, so there is nothing underneath the triangle to add.', ['Where is the triangle’s horizontal side in each situation?'], 'when not to add eye height');
          } }] },
      { num: '16', stem: '<b>Three bearings, three slips.</b> A student’s fieldwork sheet is reproduced below. Give the correct three-figure bearing for each entry.', parts: [
        { id: 'e16a', level: 'LIM', make: function (r) {
          var b = r.int(11, 89);
          return bearingP('“The trail leaves the gate on a bearing of ' + t(dg(b)) + '.” Write the correct entry.', b, [A(360 - b, 'bearing-ccw', 'The size of the turn is right — only the <b>notation</b> needs fixing.')],
            'The size is right; the <b>notation</b> is wrong. A bearing is always written with three digits, so keep the leading zero: ' + t(dg(b3(b))) + '.', ['What do all bearings have in common in how they are written?'], 'three-digit notation', { strict: true });
        } },
        { id: 'e16b', level: 'BEG', make: function (r) {
          var a = r.int(100, 170);
          return bearingP('“I put the protractor on north, turned <b>anticlockwise</b> to the path, and read ' + t(dg(a)) + '.” What is the correct bearing of the path?', 360 - a, [A(a, 'bearing-ccw', 'Bearings are measured <b>clockwise</b> from north. The anticlockwise turn was ' + t(dg(a)) + ', so the clockwise turn is ' + t('360^\\circ-' + dg(a)) + '.'), A(a + 180, 'bearing-ccw', 'This isn’t a return bearing: it is the same path measured the other way round, so use ' + t('360^\\circ-' + dg(a)) + '.'), A(180 - a, 'bearing-ccw', 'A full turn is ' + t('360^\\circ') + ': the clockwise turn is ' + t('360^\\circ-' + dg(a)) + '.')],
            'The student turned <b>anticlockwise</b>; bearings are measured clockwise from north. The clockwise turn to the same path is ' + t('360^\\circ-' + dg(a) + '=' + dg(b3(360 - a))) + '.', ['Clockwise and anticlockwise turns to the same direction add up to a full turn.'], 'anticlockwise slip');
        } },
        { id: 'e16c', level: 'EMG', make: function (r) {
          var b = r.int(181, 259);
          return bearingP('“Bearing of ' + t('B') + ' from ' + t('A') + ' is ' + t(dg(b)) + ', so the bearing of ' + t('A') + ' from ' + t('B') + ' is ' + t(b + '^\\circ+180^\\circ=' + dg(b + 180)) + '.” Give the correct bearing of ' + t('A') + ' from ' + t('B') + '.', b - 180, [A(b + 180, 'back-over', 'That is the student’s answer — not a bearing at all (more than ' + t('360^\\circ') + '). Since ' + t(dg(b)) + ' is already more than ' + t('180^\\circ') + ', subtract.'), A(360 - b, 'bearing-ccw', 'The return direction is the <b>opposite</b> direction: subtract ' + t('180^\\circ') + ' from ' + t(dg(b)) + '.'), A(b, 'bearing-back', 'That is the bearing of ' + t('B') + ' from ' + t('A') + '. The way back differs by ' + t('180^\\circ') + '.')],
            t(dg(b)) + ' is already more than ' + t('180^\\circ') + ', so adding ' + t('180^\\circ') + ' runs past a full turn — ' + t(dg(b + 180)) + ' is not a bearing. Subtract instead: ' + t(b + '^\\circ-180^\\circ=' + dg(b3(b - 180))) + ' (three digits). Check: ' + t('B') + ' is south-west of ' + t('A') + ', so ' + t('A') + ' is north-east of ' + t('B') + ' ✓',
            ['Use the return-bearing rule: add 180° only if the bearing is less than 180°.'], 'return bearing over 360');
        } }] },

      /* ---------- Part G: stretch ---------- */
      { num: '17', section: 'Extra practice G — Stretch', shared: function (r) {
          var pairs = [[18, 40], [12, 30], [15, 40], [18, 20], [24, 30], [20, 45], [16, 45], [12, 50], [24, 40], [30, 20], [27, 40], [21, 40]], pr = r.pick(pairs);
          return { v: pr[0], tm: pr[1], b1: r.int(20, 50), b2: r.int(290, 330) };
        },
        stem: function (sh) {
          var AB = sh.v * sh.tm / 60, l1 = 90 - sh.b1, l2 = sh.b2 - 270, h = AB / (1 / Tg.tan(l1) + 1 / Tg.tan(l2)), AF = h / Tg.tan(l1);
          var fig = HW.fig({ pts: { A: [0, 0], B: [AB, 0], F: [AF, 0], L: [AF, h], An: [0, h * 0.8], Bn: [AB, h * 0.8] }, names: { A: 'A', B: 'B', F: 'F', L: 'L', An: 'N', Bn: 'N' },
            segs: [['A', 'B'], ['A', 'L'], ['B', 'L'], ['L', 'F', { dash: 1, width: 1.4 }], ['A', 'An', { width: 1.4, color: GREY }], ['B', 'Bn', { width: 1.4, color: GREY }]], right: [['F', 'B', 'L']], extra: [{ type: 'text', at: [AB / 2, -h * 0.18], text: 'ship’s track (due east) →' }], width: 300 });
          return '<b>A lighthouse on two bearings from a moving ship.</b> A ship sails due east at a steady ' + t(sh.v) + ' km/h. At 09:00 the ship is at ' + t('A') + ' and a lighthouse ' + t('L') + ' is sighted on a bearing of ' + t(dg(b3(sh.b1))) + '. At 09:' + (sh.tm < 10 ? '0' : '') + sh.tm + ' the ship is at ' + t('B') + ' and the lighthouse is on a bearing of ' + t(dg(sh.b2)) + '. ' + t('F') + ' is the foot of the perpendicular from ' + t('L') + ' to the ship’s track.<br>' + fig;
        },
        parts: [
          { id: 'e17a', level: 'BEG', make: function (r, sh) {
            var AB = sh.v * sh.tm / 60;
            return { prompt: 'Determine the distance ' + t('AB') + '.', input: { type: 'number', after: 'km' }, key: String(AB), answer: t(AB) + ' km',
              check: K.number(AB, function (v) { if (Math.abs(v - sh.v * sh.tm) < 1e-9) return { code: 'time-units', hint: 'The speed is in km per <b>hour</b>: change ' + t(sh.tm) + ' minutes to hours first (' + t('\\frac{' + sh.tm + '}{60}') + ').' }; if (Math.abs(v - sh.v / sh.tm) < 0.05 || Math.abs(v - sh.tm / sh.v) < 0.05) return { code: 'speed-mult', hint: 'distance = speed × time (with time in hours).' }; return null; }),
              bad: [String(sh.v * sh.tm)], solution: t(sh.tm + '\\text{ min}=\\frac{' + sh.tm + '}{60}\\text{ h}') + ', so ' + t('AB=' + sh.v + '\\times\\frac{' + sh.tm + '}{60}=' + AB) + ' km.', hints: ['distance = speed × time, with the time in hours.'], text: 'distance AB from speed and time' };
          } },
          { id: 'e17b', level: 'EMG', make: function (r, sh) {
            var l1 = 90 - sh.b1, l2 = sh.b2 - 270;
            return K.P.fields('Determine angle ' + t('LAF') + ' and angle ' + t('LBF') + '.', [{ label: t('\\angle LAF='), after: '°' }, { label: t('\\angle LBF='), after: '°' }],
              [intCheck(l1, [A(sh.b1, 'bearing-ref', t(dg(sh.b1)) + ' is measured from <b>north</b>. ' + t('AF') + ' points due east, ' + t('90^\\circ') + ' from north.')]), intCheck(l2, [A(360 - sh.b2, 'bearing-ref', t(dg(360 - sh.b2)) + ' is ' + t('LB') + '’s angle from <b>north</b>. ' + t('BF') + ' points due west, ' + t('90^\\circ') + ' from north.'), A(sh.b2 - 180, 'bearing-ref', 'Work from the north line at ' + t('B') + ': ' + t('BL') + ' is ' + t(dg(360 - sh.b2)) + ' west of north, and ' + t('BF') + ' points due west.')])],
              [String(l1), String(l2)], t('\\angle LAF=' + dg(l1)) + ', ' + t('\\angle LBF=' + dg(l2)),
              t('\\angle LAF') + ': the bearing of ' + t('L') + ' from ' + t('A') + ' is ' + t(dg(b3(sh.b1))) + ' and ' + t('AF') + ' points due east (' + t('090^\\circ') + '), so ' + t('\\angle LAF=90^\\circ-' + dg(sh.b1) + '=' + dg(l1)) + '.<br>' + t('\\angle LBF') + ': the bearing ' + t(dg(sh.b2)) + ' is ' + t('360^\\circ-' + sh.b2 + '^\\circ=' + dg(360 - sh.b2)) + ' west of north; ' + t('BF') + ' points due west, ' + t('90^\\circ') + ' from north, so ' + t('\\angle LBF=90^\\circ-' + dg(360 - sh.b2) + '=' + dg(l2)) + '.',
              ['Draw the north lines. Due east is ' + t('90^\\circ') + ' from north; due west is ' + t('90^\\circ') + ' the other way.'], 'angles from bearings at A and B');
          } },
          { id: 'e17c', level: 'ADV', make: function (r, sh) {
            var AB = sh.v * sh.tm / 60, l1 = 90 - sh.b1, l2 = sh.b2 - 270, s = 1 / Tg.tan(l1) + 1 / Tg.tan(l2), h = AB / s;
            return nearP('Angle ' + t('LAF=' + dg(l1)) + ', angle ' + t('LBF=' + dg(l2)) + ' and ' + t('AB=' + AB) + ' km. Writing ' + t('LF=h') + ', express ' + t('AF') + ' and ' + t('FB') + ' in terms of ' + t('h') + ' and use ' + t('AF+FB=AB') + ' to find ' + t('h') + ', the closest the ship comes to the lighthouse (nearest tenth of a km).', h, 1, 'km', [
              A(AB / (Tg.tan(l1) + Tg.tan(l2)), 'recip', t('AF=\\frac{h}{\\tan ' + dg(l1) + '}') + ' — the run is ' + t('h') + ' <b>divided</b> by the tangent, so the bracket holds ' + t('\\frac{1}{\\tan}') + ' terms.'),
              A(AB / Math.abs(1 / Tg.tan(l2) - 1 / Tg.tan(l1)), 'runs-diff', t('F') + ' lies <b>between</b> ' + t('A') + ' and ' + t('B') + ' (the ship sails past the lighthouse), so the runs add: ' + t('AF+FB=AB') + '.'),
              A(AB / 2 * Tg.tan(l1), 'one-tri', 'You can’t split ' + t('AB') + ' in half: ' + t('F') + ' is not the midpoint. Use both triangles.'),
              aRad(AB / (1 / Tg.radTan(l1) + 1 / Tg.radTan(l2)))],
              t('\\triangle AFL') + ': ' + t('AF=\\dfrac{h}{\\tan ' + dg(l1) + '}') + '. ' + t('\\triangle BFL') + ': ' + t('FB=\\dfrac{h}{\\tan ' + dg(l2) + '}') + '.<br>' + t('h\\left(\\dfrac{1}{\\tan ' + dg(l1) + '}+\\dfrac{1}{\\tan ' + dg(l2) + '}\\right)=' + AB) + '<br>' + t('h(' + fl(1 / Tg.tan(l1)) + '+' + fl(1 / Tg.tan(l2)) + ')=' + AB) + '<br>' + t('h=\\dfrac{' + AB + '}{' + fl(s) + '}=' + fl(h) + '\\approx ' + fx(h, 1)) + ' km',
              ['In each right triangle, ' + t('h') + ' is opposite and the run along the track is adjacent: run ' + t('=\\frac{h}{\\tan}') + '.', 'Add the two runs, set them equal to ' + t('AB') + ', and factor out ' + t('h') + '.'], 'closest approach, two bearings');
          } },
          { id: 'e17d', level: 'PRG', make: function (r, sh) {
            var AB = sh.v * sh.tm / 60, l1 = 90 - sh.b1, l2 = sh.b2 - 270, h = AB / (1 / Tg.tan(l1) + 1 / Tg.tan(l2)), bl = h / Tg.sin(l2);
            return nearP(t('LF=h\\approx ' + fl(h)) + ' km and angle ' + t('LBF=' + dg(l2)) + '. Determine the distance from the ship to the lighthouse at 09:' + (sh.tm < 10 ? '0' : '') + sh.tm + ' (that is, ' + t('BL') + '), to the nearest tenth of a km.', bl, 1, 'km', [
              A(h / Tg.sin(l1), 'one-tri', 'That is ' + t('AL') + ', the distance at 09:00. At ' + t('B') + ' use ' + t('\\angle LBF=' + dg(l2)) + '.'), A(h * Tg.sin(l2), 'trig-inverted', t('BL') + ' is in the denominator of ' + t('\\sin ' + dg(l2) + '=\\frac{h}{BL}') + ': divide.'), A(h / Tg.cos(l2), 'trig-ratio', t('h') + ' is <b>opposite</b> the angle at ' + t('B') + ' ⇒ SOH.'), aRad(h / Tg.radSin(l2))],
              'In ' + t('\\triangle BFL') + ', ' + t('h') + ' is opposite ' + t(dg(l2)) + ' and ' + t('BL') + ' is the hypotenuse.<br>' + t('BL=\\dfrac{' + fl(h) + '}{\\sin ' + dg(l2) + '}=' + fl(bl) + '\\approx ' + fx(bl, 1)) + ' km',
              [t('BL') + ' is the hypotenuse of ' + t('\\triangle BFL') + '.'], 'distance BL');
          } },
          { id: 'e17e', level: 'EMG', make: function (r) {
            return K.P.mc(r, 'In question 6 (two sightings of a tower) the two runs were <b>subtracted</b> to give the linking equation; here they are <b>added</b>. What is different about the two situations?', [
              { html: 'Here ' + t('F') + ' lies <b>between</b> ' + t('A') + ' and ' + t('B') + ' (the ship sails past the lighthouse), so the runs sit end to end. In question 6 both points were on the same side, so the runs overlapped and the shorter was subtracted.', right: true },
              { html: 'Here the angles come from bearings, and bearings are always added.', why: 'Bearings only gave the angles. The add/subtract decision comes from <b>where</b> ' + t('F') + ' is compared with the two sighting points.' },
              { html: 'Because the ship is moving and the technician was walking.', why: 'Both observers moved. What matters is whether they ended up on the same side of the object or on opposite sides.' },
              { html: 'Because these triangles are not right triangles.', why: 'Both situations use right triangles (at ' + t('F') + '). Look at whether ' + t('F') + ' is between the two points.' }],
              'In question 6 both sighting points were on the <b>same side</b> of the object, so the foot of the perpendicular lay outside ' + t('AB') + ': the runs overlapped and the shorter was subtracted from the longer. Here the ship sails <b>past</b> the lighthouse, so ' + t('F') + ' lies between ' + t('A') + ' and ' + t('B') + ': the runs sit end to end and are added. The giveaway is the second bearing — it points behind the ship.', ['Where is ' + t('F') + ' in each picture?'], 'add vs subtract runs');
          } }] },
      { num: '18', stem: 'Two exam-style items.', parts: [
        { id: 'e18a', level: 'BEG', make: function (r) {
          var H = r.int(30, 90), th = r.int(15, 40);
          return K.P.mc(r, '<i>(Multiple Choice)</i> From the top of a cliff ' + t(H) + ' m high, the angle of depression of a buoy is ' + t(dg(th)) + '. The horizontal distance, in metres, from the foot of the cliff to the buoy is given by<br>' + deprScene({ th: th, hLab: H + ' m', obj: 'cliff', extra: [{ type: 'text', at: [10, -0.8], text: 'buoy' }], width: 260 }), [
            { html: t('\\dfrac{' + H + '}{\\tan ' + dg(th) + '}'), right: true },
            { html: t(H + '\\tan ' + dg(th)), why: 'That is the measured-from-the-vertical trap: it treats the cliff as <b>adjacent</b> to the ' + t(dg(th)) + '. At the buoy (equal angle of elevation) the cliff is opposite.' },
            { html: t(H + '\\sin ' + dg(th)), why: 'Sin involves the hypotenuse (the line of sight), which isn’t given or asked for. Opposite and adjacent ⇒ tan.' },
            { html: t('\\dfrac{' + H + '}{\\sin ' + dg(th) + '}'), why: 'That gives the line of sight from the cliff top to the buoy (the hypotenuse), not the horizontal distance.' }],
            'The ' + t(dg(th)) + ' equals the angle of elevation at the buoy; relative to it the cliff (' + t(H) + ' m) is <b>opposite</b> and the horizontal distance is <b>adjacent</b>: ' + t('\\tan ' + dg(th) + '=\\frac{' + H + '}{\\text{distance}}') + ', so distance ' + t('=\\dfrac{' + H + '}{\\tan ' + dg(th) + '}\\approx ' + fx(H / Tg.tan(th), 1)) + ' m.', ['Move the angle to the buoy. Which side is the cliff from there?'], 'MC distance from depression');
        } },
        { id: 'e18b', level: 'BEG', make: function (r) {
          var b = r.int(181, 279);
          return bearingP('<i>(Numerical Response)</i> The bearing of ' + t('A') + ' from ' + t('B') + ' is ' + t(dg(b)) + '. The bearing of ' + t('B') + ' from ' + t('A') + ', written with three digits, is ________.', b - 180, [A(b + 180, 'back-over', t(dg(b)) + ' is ' + t('180^\\circ') + ' or more, so subtract ' + t('180^\\circ') + '.'), A(360 - b, 'bearing-ccw', 'The return direction is the opposite direction: it differs by ' + t('180^\\circ') + '.'), A(b, 'bearing-back', 'That is the bearing of ' + t('A') + ' from ' + t('B') + '. Reverse it.')],
            t(dg(b)) + ' is ' + t('180^\\circ') + ' or more, so subtract: ' + t(b + '^\\circ-180^\\circ=' + (b - 180) + '^\\circ') + ', written with three digits as ' + t(b3(b - 180)) + '. Check: ' + t('A') + ' is ' + (b < 270 ? 'south-west' : 'north-west') + ' of ' + t('B') + ', so ' + t('B') + ' is ' + (b < 270 ? 'north-east' : 'south-east') + ' of ' + t('A') + ' ✓',
            ['Return bearing: ±' + t('180^\\circ') + ', staying between ' + t('000^\\circ') + ' and ' + t('360^\\circ') + '.'], 'NR return bearing', { nr: true });
        } }] }
    ]
  });

  /* ---------- makers that need the helpers above ---------- */
  function droneShared(r) {
    var trip = r.pick([[3, 4, 50], [3, 4, 40], [3, 4, 60], [3, 4, 80], [5, 12, 20], [5, 12, 30], [8, 15, 20], [7, 24, 10], [20, 21, 10]]), sw = r.chance(0.5);
    var a = (sw ? trip[1] : trip[0]) * trip[2], b = (sw ? trip[0] : trip[1]) * trip[2];
    var b1 = until(r, function (r) { var x = r.int(25, 80), F0 = x + Tg.atan(b / a); return F0 > 95 && F0 < 175 && x + 90 < 180 ? x : null; }, 65);
    if (Tg.atan(b / a) + b1 >= 175 || b1 + Tg.atan(b / a) <= 95) { a = 150; b = 200; b1 = 65; }
    return { a: a, b: b, b1: b1, b2: b1 + 90 };
  }
  function droneStem(sh) {
    var T0 = [sh.a * Tg.sin(sh.b1), sh.a * Tg.cos(sh.b1)], U = [T0[0] + sh.b * Tg.sin(sh.b2), T0[1] + sh.b * Tg.cos(sh.b2)];
    return 'A drone starts from a station ' + t('S') + ' and flies ' + t(sh.a) + ' m on a bearing of ' + t(dg(b3(sh.b1))) + ' to point ' + t('T') + '. At ' + t('T') + ', the drone makes a ' + t('90^\\circ') + ' turn and flies ' + t(sh.b) + ' m on a bearing of ' + t(dg(b3(sh.b2))) + ' to point ' + t('U') + '. At ' + t('U') + ' it changes course and flies directly back to ' + t('S') + '.<br>' +
      bearFig({ S: [0, 0], T: T0, U: U }, [['S', 'T', sh.a + ' m'], ['T', 'U', sh.b + ' m'], ['U', 'S']], [['S', 'Sn'], ['T', 'Tn']], Math.max(sh.a, sh.b) * 0.45, { right: [['T', 'S', 'U']], width: 260 });
  }
  function formulaPart(prompt, a1, a2, d, text) {
    var c1 = 1 / Tg.tan(a1), c2 = 1 / Tg.tan(a2), h = d / (c1 - c2);
    return nearP(prompt, h, 1, 'm', [
      A(d / (c2 - c1), 'sign', t('\\theta_1') + ' is the angle from the <b>farther</b> point (the smaller angle, ' + t(dg(a1)) + '); ' + t('\\frac{1}{\\tan\\theta_1}') + ' comes first.'),
      A(d / (Tg.tan(a2) - Tg.tan(a1)), 'recip', 'The formula uses ' + t('\\frac{1}{\\tan\\theta}') + ', not ' + t('\\tan\\theta') + ': ' + t('h=\\frac{d}{\\frac{1}{\\tan\\theta_1}-\\frac{1}{\\tan\\theta_2}}') + '.'),
      A(d / (c1 + c2), 'elim-sign', 'The bracket is a <b>difference</b>: ' + t('\\frac{1}{\\tan\\theta_1}-\\frac{1}{\\tan\\theta_2}') + '.'),
      aRad(d / (1 / Tg.radTan(a1) - 1 / Tg.radTan(a2)))],
      t('h=\\dfrac{' + d + '.0}{\\frac{1}{\\tan ' + dg(a1) + '}-\\frac{1}{\\tan ' + dg(a2) + '}}=\\dfrac{' + d + '.0}{' + fl(c1) + '-' + fl(c2) + '}=\\dfrac{' + d + '.0}{' + fl(c1 - c2) + '}=' + fl(h) + '\\approx ' + fx(h, 1)) + ' m',
      ['Put ' + t('\\theta_1') + ' (farther, smaller angle), ' + t('\\theta_2') + ' and ' + t('d') + ' into the formula. Work out the bottom first.'], text);
  }
})(window);
