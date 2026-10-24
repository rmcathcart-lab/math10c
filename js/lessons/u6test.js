/* Math 10C · Unit 6 Test (RF3) — the paper outcomes-based unit test (u6_test_A/B/C.tex) as generators.
 * The paper has three pages for RF3 (Part 1 calculating slope, Part 2 slope as a rate of change, Part 3 parallel and
 * perpendicular lines and collinear points), each in BEG / PRG / MAS boxes; every question keeps its box and its paper
 * number (defineTest reorders them Beginning → Progressing → Mastery). Each part takes its numbers from the seed, inside
 * the range Versions A, B and C show (their numbers are possible values), with a key and a worked solution.
 * Distance (the side lengths in Q22) is regular RF3 content since the 2026 restructure.
 * Conversions from paper: the slope / type table → slope boxes plus a choice table; "explain each error" → a table that
 * names each student's error plus the correct slope; true/false with a justification → multiple choice whose options are
 * reasoned claims (as u1test Q17); "what does it mean / what do you notice" → multiple choice at BEG/PRG, and labelled
 * boxes (the amount used per km, yes/no conclusions, a name) at MAS; "show it is a rectangle / right angle" → the slopes
 * and their product in labelled boxes; "parallel / perpendicular / collinear?" → the slopes, then the conclusion. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, Ln = HW.lines, F = HW.fmt;

  HW.addCodes({
    'u6t-one-entry': 'One box wrong (the rest right)', 'u6t-rows': 'Several rows of the table wrong', 'u6t-copied': 'Gave a student’s wrong answer',
    'u6t-run-sign': 'Run with the wrong sign', 'u6t-run-mult': 'Multiplied the rise by the slope instead of dividing', 'u6t-no-run': 'Gave the change in y (did not divide by the run)',
    'u6t-rate-one': 'Divided one total cost by its amount (ignored the fee)', 'u6t-fee-once': 'Subtracted the rate only once for the fee', 'u6t-fee-add': 'Added the variable cost instead of subtracting',
    'u6t-fee-cost': 'Gave the variable cost instead of the fee', 'u6t-from-last': 'Counted the time from the last column, not from t = 0', 'u6t-time-sign': 'Time with the wrong sign',
    'u6t-uses-sign': 'Amount used per unit given as a negative', 'u6t-conv': 'Converted the rate with the wrong factor', 'u6t-steeper': 'Picked the less steep line',
    'u6t-range-mult': 'Multiplied the amount by the rate instead of dividing', 'u6t-range-flip': 'Divided the rate by the amount', 'u6t-yesno': 'Wrong yes/no conclusion',
    'u6t-rule-dir': 'Read the slope rule the wrong way (at most / at least)', 'u6t-limit-div': 'Divided by the limit slope instead of multiplying (or the reverse)', 'u6t-slope-round': 'Slope rounded too far',
    'u6t-perp-same': 'Gave the same slope for a perpendicular', 'u6t-perp-noflip': 'Changed the sign without taking the reciprocal', 'u6t-par-perp': 'Gave the perpendicular slope for a parallel line',
    'u6t-k-rel': 'Used the other relationship (parallel ↔ perpendicular)', 'u6t-k-same': 'Used the given slope instead of its negative reciprocal', 'u6t-k-nosign': 'Used the reciprocal without changing the sign',
    'u6t-len-add': 'Added the differences instead of using the distance formula', 'u6t-square': 'Wrong square / not a square decision', 'u6t-prod-sign': 'Product of the slopes with the wrong sign',
    'u6t-yesno-form': 'Not a yes/no answer', 'u6t-name-form': 'Not one of the names', 'u6t-k-flip-x': 'Solved for k with run over rise'
  });
  HW.addPartial({
    'u6t-one-entry': 's', 'u6t-rows': 'n', 'u6t-copied': 'n', 'u6t-run-sign': 's', 'u6t-run-mult': 'n', 'u6t-no-run': 'b',
    'u6t-rate-one': 'n', 'u6t-fee-once': 'b', 'u6t-fee-add': 's', 'u6t-fee-cost': 'b', 'u6t-from-last': 'b', 'u6t-time-sign': 's',
    'u6t-uses-sign': 's', 'u6t-conv': 'b', 'u6t-steeper': 'n', 'u6t-range-mult': 'n', 'u6t-range-flip': 'n', 'u6t-yesno': 'b',
    'u6t-rule-dir': 'b', 'u6t-limit-div': 'n', 'u6t-slope-round': 's', 'u6t-perp-same': 'n', 'u6t-perp-noflip': 'b', 'u6t-par-perp': 'n',
    'u6t-k-rel': 'n', 'u6t-k-same': 'n', 'u6t-k-nosign': 'b', 'u6t-len-add': 'n', 'u6t-square': 'b', 'u6t-prod-sign': 's', 'u6t-k-flip-x': 'b'
  });

  /* ---------------- numbers and LaTeX ---------------- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function red(p, q) { if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g, q / g]; }
  function cl(x) { return Math.round(x * 1e9) / 1e9; }
  function near(a, b) { return Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)); }
  function frT(p, q) { return Ln.frT(p, q); }
  function sT(s) { return s == null ? '\\text{undefined}' : frT(s[0], s[1]); }
  function sP(s) { var x = sT(s); return s && s[0] < 0 ? '\\left(' + x + '\\right)' : x; }
  function sV(s) { return s == null ? null : s[0] / s[1]; }
  function vT(v) { var f = Ln.toFr(v); return frT(f[0], f[1]); }       // a value as a fraction / integer
  function dT(x) { return F(cl(x)); }                                    // a decimal, LaTeX
  function nb(x) { return x < 0 ? '(' + x + ')' : String(x); }
  function ptT(p) { return '(' + p[0] + ',\\ ' + p[1] + ')'; }
  function nP(n, p) { return t(n + ptT(p)); }
  function slopeOf(A, B) { var dx = B[0] - A[0], dy = B[1] - A[1]; return dx === 0 ? null : red(dy, dx); }
  function sEq(a, b) { if (a == null || b == null) return a == null && b == null; return a[0] * b[1] === a[1] * b[0]; }
  function perpOf(s) { if (s == null) return [0, 1]; if (s[0] === 0) return null; return red(-s[1], s[0]); }
  function find(gen, test, fb) { for (var i = 0; i < 1500; i++) { var v = gen(); if (v != null && test(v)) return v; } return fb; }
  function inBox(p, b) { return Math.abs(p[0]) <= b && Math.abs(p[1]) <= b; }
  function art(n) { return /^(8|11|18)(\.|$)|^8/.test(String(n)) ? 'an' : 'a'; }   // “an 8 km trail”, “an 80 km route”
  function money(c) { return c % 100 === 0 ? String(c / 100) : (c / 100).toFixed(2); }   // cents → "19.70"
  /* m_{AB} = (yB − yA)/(xB − xA) = dy/dx = reduced */
  function calc(A, B, nm) {
    var dy = B[1] - A[1], dx = B[0] - A[0];
    var s = (nm ? 'm_{' + nm + '}=' : '') + '\\frac{' + B[1] + '-' + nb(A[1]) + '}{' + B[0] + '-' + nb(A[0]) + '}=\\frac{' + dy + '}{' + dx + '}';
    if (dx === 0) return s + ',\\ \\text{undefined}';
    var f = sT(red(dy, dx)); return f === '\\frac{' + dy + '}{' + dx + '}' ? s : s + '=' + f;
  }
  var SLOPE_HINT = 'Slope ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + ': subtract in the <b>same order</b> on the top and the bottom.';
  var FIELDHELP = 'Type <b>undefined</b> (the <b>undef.</b> key) for a vertical segment.';

  /* ---------------- checkers ---------------- */
  /* one number (an integer, a decimal or a fraction); alts = [[value, code, hint], …] known wrong values */
  function numChk(target, alts) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/^\s*\\?\$\s*/, '').trim(), pn = HW.parse.number(s), v;
      if (pn.ok) v = pn.value;
      else {
        if (pn.code === 'empty') return form('empty', 'Type your answer first.');
        var r0 = K.number(target)(s); if (r0.v === 'form' && r0.code === 'units') return r0;
        var a = K.read(s); if (a.res) return a.res; v = a.val;
        if (!isFinite(v)) return form('notnumber', 'Enter a single number.');
      }
      if (near(v, target)) return ok();
      for (var i = 0; i < (alts || []).length; i++) { var w = alts[i]; if (w[0] != null && isFinite(w[0]) && !near(w[0], target) && near(v, w[0])) return wrong(w[1], w[2]); }
      return wrong('value', null);
    };
  }
  function altBad(target, alts) { return (alts || []).filter(function (w) { return w[0] != null && isFinite(w[0]) && !near(w[0], target); }).slice(0, 3).map(function (w) { return vT(w[0]); }); }
  function numPart(prompt, target, alts, sol, hints, text, inp) {
    var p = P.math(prompt, numChk(target, alts), vT(target), sol, hints, text, Object.assign({ keys: 'fraction' }, inp || {}));
    p.answer = t((inp && inp.beforeAns || '') + (inp && inp.ansTex || dT(target))) + (inp && inp.unitAns ? ' ' + inp.unitAns : '');
    p.bad = altBad(target, alts);
    return p;
  }
  function slopeChk(s, diag) {
    var c = K.slope(s, { diag: diag });
    return function (resp) {
      var r = c(resp);
      if (r.v === 'wrong' && r.code === 'slope-sign') return wrong('slope-sign', 'Check the sign. Subtract in the <b>same order</b> on the top and the bottom, ' + t('\\frac{y_2-y_1}{x_2-x_1}') + ', and watch the double negatives.');
      return r;
    };
  }
  function readSlope(resp) {
    var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').replace(/^\s*m[^=]*=\s*/, '').trim();
    if (/undef/i.test(s)) return { und: true };
    var a = ex.parse(s); if (!a.ok) return null; var v = ex.value(a.ast); return isFinite(v) ? { v: v } : null;
  }
  /* the slope of a line parallel ('par') or perpendicular ('perp') to a line of slope m */
  function relChk(m, rel) {
    var T = rel === 'perp' ? perpOf(m) : m, base = slopeChk(T);
    return function (resp) {
      var r0 = base(resp); if (r0.v !== 'wrong') return r0;
      var R = readSlope(resp);
      if (R && R.v != null && m != null && m[0] !== 0) {
        var mv = sV(m);
        if (rel === 'perp') {
          if (near(R.v, mv)) return wrong('u6t-perp-same', 'That is the given slope itself — a line with that slope is <b>parallel</b>. Perpendicular slopes are <b>negative reciprocals</b>: flip the fraction and change the sign.');
          if (near(R.v, 1 / mv)) return wrong('perp-nosign', 'You took the reciprocal — now change the sign too. Perpendicular slopes have opposite signs (their product is ' + t('-1') + ').');
          if (near(R.v, -mv)) return wrong('u6t-perp-noflip', 'You changed the sign — now take the reciprocal too (flip the fraction). The product of the two slopes must be ' + t('-1') + '.');
        } else if (near(R.v, -1 / mv)) return wrong('u6t-par-perp', 'That is the negative reciprocal — the slope of a <b>perpendicular</b> line. Parallel lines have <b>equal</b> slopes.');
      }
      return r0;
    };
  }
  function slopeKeyBad(s) {
    var bad = [];
    if (s && s[0] !== 0) { bad.push(sT([-s[0], s[1]])); bad.push(sT(red(s[1], s[0]))); } else if (s) bad.push('\\text{undefined}'); else bad.push('0');
    return bad.filter(function (b) { return b !== sT(s); });
  }
  function slopeAns(prompt, s, chk, sol, hints, text, before) {
    var p = P.math(prompt, chk || slopeChk(s), sT(s), sol, hints, text, { keys: 'slope', before: before || t('m='), placeholder: 'e.g. -2/3 or undefined' });
    p.bad = slopeKeyBad(s);
    return p;
  }
  function sField(nm, lab) { return { name: lab || 'Slope of ' + nm, label: t('m_{' + nm + '}='), mode: 'math', keys: 'slope', placeholder: 'e.g. -2/3' }; }
  /* several boxes; oneSlip: with 3 or more boxes, exactly one wrong box (the rest right) is a small mistake */
  function fieldsChk(checkers, names, oneSlip) {
    return function (resp) {
      resp = resp || []; var firstForm = null, wrongs = [];
      checkers.forEach(function (c, i) {
        var r = c(resp[i] == null ? '' : resp[i]); if (r.v === 'correct') return;
        var out = { v: r.v, code: r.code, hint: (names[i] ? '<b>' + names[i] + ':</b> ' : '') + (r.hint || 'Check this one again.') };
        if (r.v === 'form') { if (!firstForm) firstForm = out; } else wrongs.push(out);
      });
      if (wrongs.length === 1 && oneSlip && checkers.length >= 3 && !firstForm) return { v: 'wrong', code: 'u6t-one-entry', hint: wrongs[0].hint };
      return wrongs[0] || firstForm || ok();
    };
  }
  function fieldsPart(prompt, fields, checkers, keys, answer, sol, hints, text, oneSlip) {
    var p = P.fields(prompt, fields, checkers, keys, answer, sol, hints, text);
    p.check = fieldsChk(checkers, fields.map(function (f) { return f.name || ''; }), oneSlip);
    return p;
  }
  /* a choice table; one wrong row is a small mistake ('row'), more than one is no credit */
  function gridPart(prompt, rows, cols, want, why, sol, hints, text, rowHead) {
    var p = P.grid(prompt, rows, cols, want, { rowHead: rowHead }, sol, hints, text);
    p.check = function (resp) {
      resp = resp || {};
      var ids = Object.keys(want), miss = ids.filter(function (k) { return resp[k] == null; });
      if (miss.length === ids.length) return form('empty', 'Fill in the table first.');
      if (miss.length) return form('incomplete', 'Finish every row (' + (ids.length - miss.length) + ' of ' + ids.length + ' done).');
      var bad = ids.filter(function (k) { return resp[k] !== want[k]; });
      if (!bad.length) return ok();
      var h = why ? why(bad[0], resp[bad[0]]) : null;
      return wrong(bad.length === 1 ? 'row' : 'u6t-rows', (h || 'Check that row again.') + (bad.length > 1 ? ' (' + bad.length + ' rows aren’t right yet.)' : ''));
    };
    var cids = cols.map(function (c) { return c.id; }), ids = Object.keys(want);
    p.bad = [ids.reduce(function (o, k, i) { o[k] = i === 0 ? cids[(cids.indexOf(want[k]) + 1) % cids.length] : want[k]; return o; }, {})];
    return p;
  }
  function ynChk(want, code, hint) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/\\text\{([^}]*)\}/g, '$1').trim().toLowerCase().replace(/[.!]+$/, '');
      if (!s) return form('empty', 'Type <b>yes</b> or <b>no</b>.');
      var y = /^(y|yes|yep|yeah|true)$/.test(s), n = /^(n|no|nope|false)$/.test(s);
      if (!y && !n) return form('u6t-yesno-form', 'Type <b>yes</b> or <b>no</b>.');
      return y === (want === 'yes') ? ok() : wrong(code || 'u6t-yesno', hint);
    };
  }
  function ynField(name, label) { return { name: name, label: label, mode: 'text', placeholder: 'yes/no' }; }
  function nameChk(want, other, hint) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).replace(/\\text\{([^}]*)\}/g, '$1').trim().toLowerCase().replace(/[’']s$/, '').replace(/[.!]+$/, '');
      if (!s) return form('empty', 'Type a name.');
      if (s === want.toLowerCase()) return ok();
      if (s === other.toLowerCase()) return wrong('u6t-steeper', hint);
      return form('u6t-name-form', 'Type one of the names: ' + want + ' or ' + other + '.');
    };
  }
  /* a slope as a fraction, or a decimal to 3 places */
  function approxChk(x) {
    var ev = K.value(x);
    return function (resp) {
      var pn = HW.parse.number(resp);
      if (pn.ok) {
        if (Math.abs(pn.value - x) <= 0.0006) return ok();
        if (Math.abs(pn.value - x) < 0.006) return form('u6t-slope-round', 'Close — give the slope to 3 decimal places (or as a fraction) so you can compare it with the rule.');
        return wrong('value', null);
      }
      return ev(resp);
    };
  }
  /* a length: exact radical in any form, or a calculator decimal */
  function lenChk(d2) {
    var s = simp(d2), L = Math.sqrt(d2), base = K.radical({ k: s[0], n: 2, m: s[1] }, 'any');
    return function (resp, diag) {
      var pn = HW.parse.number(resp);
      if (pn.ok) {
        if (Math.abs(pn.value - L) < 0.051) return ok();
        if (near(pn.value, d2)) return wrong('len-no-root', 'That is ' + t('d^{2}') + ' — take the square root.');
        if (diag) { var h = diag(pn.value); if (h) return wrong(h.code, h.hint); }
        return wrong('value', null);
      }
      var r = base(resp);
      if (r.v === 'correct' || r.v === 'form') return r.v === 'correct' ? r : ok();
      var a = K.read(resp);
      if (!a.res && near(a.val, d2)) return wrong('len-no-root', 'That is ' + t('d^{2}') + ' — take the square root.');
      if (!a.res && diag) { var h2 = diag(a.val); if (h2) return wrong(h2.code, h2.hint); }
      return r;
    };
  }
  function simp(n) { var k = 1, m = n; for (var f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return [k, m]; }
  function radT(n) { var s = simp(n); return s[1] === 1 ? String(s[0]) : (s[0] === 1 ? '' : s[0]) + '\\sqrt{' + s[1] + '}'; }

  /* ---------------- figures ---------------- */
  function distSeg(p, a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy, u = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2)) : 0; return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy); }
  /* place segments (types: {rise, run}, run >= 0) with integer endpoints in [-lim, lim], endpoints apart and off the other segments */
  function placeSegs(r, types, lim) {
    for (var tries = 0; tries < 6000; tries++) {
      var segs = [], bad = false;
      types.forEach(function (ty) {
        var xlo = -lim, xhi = lim - ty.run, ylo = Math.max(-lim, -lim - ty.rise), yhi = Math.min(lim, lim - ty.rise);
        if (xhi < xlo || yhi < ylo) { bad = true; return; }
        var A = [r.int(xlo, xhi), r.int(ylo, yhi)]; segs.push([A, [A[0] + ty.run, A[1] + ty.rise]]);
      });
      if (bad) continue;
      var ends = []; segs.forEach(function (s) { ends.push(s[0], s[1]); });
      for (var i = 0; i < ends.length && !bad; i++) { if (ends[i][0] === 0 || ends[i][1] === 0) bad = true; for (var j = 0; j < i; j++) if (Math.hypot(ends[i][0] - ends[j][0], ends[i][1] - ends[j][1]) < 2) { bad = true; break; } }
      for (var k = 0; k < segs.length && !bad; k++) for (var e = 0; e < ends.length; e++) if (Math.floor(e / 2) !== k && distSeg(ends[e], segs[k][0], segs[k][1]) < 0.9) { bad = true; break; }
      for (var a = 0; a < segs.length && !bad; a++) for (var b = 0; b < a; b++) if (segsCross(segs[a], segs[b])) { bad = true; break; }
      if (!bad) return segs;
    }
    return null;
  }
  function segsCross(s, u) {
    function o(a, b, c) { var v = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); return v > 0 ? 1 : v < 0 ? -1 : 0; }
    return o(s[0], s[1], u[0]) * o(s[0], s[1], u[1]) <= 0 && o(u[0], u[1], s[0]) * o(u[0], u[1], s[1]) <= 0;
  }
  /* segments on a grid, each endpoint labelled beyond its end of the segment */
  function segGraph(segs, names, lim, aria) {
    var svg = HW.graph({ x: [-lim - 1, lim + 1], y: [-lim - 1, lim + 1], labels: 2, segs: segs.map(function (s) { return { pts: [s[0], s[1]], start: 'closed', end: 'closed' }; }), max: 360, aria: aria || 'line segments on a grid' });
    var L = HW.graph.last, extra = '';
    segs.forEach(function (s, i) {
      [0, 1].forEach(function (e) {
        var A = s[e], O = s[1 - e], ax = L.X(A[0]), ay = L.Y(A[1]), dx = ax - L.X(O[0]), dy = ay - L.Y(O[1]), len = Math.hypot(dx, dy) || 1;
        var x = Math.max(9, Math.min(L.W - 9, ax + dx / len * 14)), y = Math.max(9, Math.min(L.H - 9, ay + dy / len * 14));
        extra += '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" font-size="14" font-weight="700" font-style="italic" text-anchor="middle" dominant-baseline="central" fill="#2b3340" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">' + names[i].charAt(e) + '</text>';
      });
    });
    return '<div class="fig">' + svg.replace(/<\/svg>$/, extra + '</svg>') + '</div>';
  }

  /* ======================= Q1: four segments on a grid ======================= */
  var KIND = { pos: 'positive', neg: 'negative', zero: 'zero', und: 'undefined' };
  var Q1N = ['AB', 'CD', 'EF', 'GH'];
  function q1Shared(r) {
    var kinds = r.shuffle(['pos', 'neg', 'zero', 'und']);
    var types = kinds.map(function (k) {
      if (k === 'zero') return { run: r.int(3, 5), rise: 0 };
      if (k === 'und') return { run: 0, rise: -r.int(3, 5) };
      var run = r.int(2, 5), rise = find(function () { return r.int(2, 6); }, function (v) { return v !== run; }, 4);
      return { run: run, rise: k === 'pos' ? rise : -rise };
    });
    var segs = placeSegs(r, types, 5);
    if (!segs) { kinds = ['pos', 'neg', 'zero', 'und']; segs = [[[-5, -1], [-2, 5]], [[1, 5], [4, 1]], [[-5, -4], [-1, -4]], [[3, -1], [3, -5]]]; }
    return { kinds: kinds, segs: segs, sl: segs.map(function (s) { return slopeOf(s[0], s[1]); }) };
  }
  function q1Line(s, i) {
    var A = s.segs[i][0], B = s.segs[i][1], rise = B[1] - A[1], run = B[0] - A[0], nm = Q1N[i];
    var dir = run === 0 ? 'straight ' + (rise > 0 ? 'up' : 'down') : rise === 0 ? 'straight across' : (rise > 0 ? 'up' : 'down');
    return t(nm) + ': from ' + t(nm.charAt(0)) + ' to ' + t(nm.charAt(1)) + ' the rise is ' + t(rise) + ' and the run is ' + t(run) + ' (' + dir + '), so ' + t('m_{' + nm + '}=\\frac{' + rise + '}{' + run + '}' + (run === 0 ? '' : (sT(s.sl[i]) !== '\\frac{' + rise + '}{' + run + '}' ? '=' + sT(s.sl[i]) : ''))) + (run === 0 ? ': you can’t divide by ' + t('0') + ', so the slope is <b>undefined</b>.' : rise === 0 ? ' (horizontal).' : '.');
  }

  /* ======================= Q6: two students’ errors ======================= */
  var STUD = [['Amara', 'Ben'], ['Sofia', 'Dev'], ['Lena', 'Omar'], ['Priya', 'Noah'], ['Jas', 'Kai'], ['Maya', 'Liam']];
  var PAIRN = [['W', 'Z'], ['J', 'K'], ['E', 'F'], ['M', 'N'], ['S', 'T']];

  /* ======================= Q8: true / false about quadrants ======================= */
  var REG = { I: [1, 1], II: [-1, 1], III: [-1, -1], IV: [1, -1], '+x': [1, 0], '-x': [-1, 0], '+y': [0, 1], '-y': [0, -1] };
  function regTxt(k) { if (/^I/.test(k)) return 'in quadrant ' + k; return 'on the ' + (k.charAt(0) === '+' ? 'positive' : 'negative') + ' ' + t(k.charAt(1)) + '-axis'; }
  function sgnW(v) { return v > 0 ? 'positive' : v < 0 ? 'negative' : t('0'); }
  function regPt(r, k) { var g = REG[k]; return [g[0] ? g[0] * r.int(1, 6) : 0, g[1] ? g[1] * r.int(1, 6) : 0]; }
  function exPts(r, a, b, want) {   // P in a, Q in b with slope sign want (+1 / −1)
    return find(function () { return [regPt(r, a), regPt(r, b)]; }, function (pq) { var s = slopeOf(pq[0], pq[1]); return s && s[0] !== 0 && Math.sign(s[0]) === want; }, null);
  }
  var TRUE_PAIRS = [['II', 'IV'], ['IV', 'II'], ['I', 'III'], ['III', 'I'], ['II', 'IV'], ['III', 'I'], ['+x', '+y'], ['+y', '+x'], ['-x', '+y'], ['+x', '-y'], ['-y', '-x'], ['I', '-x'], ['II', '+x'], ['-y', 'II']];
  var FALSE_PAIRS = [['I', 'II'], ['II', 'I'], ['II', 'III'], ['III', 'II'], ['III', 'IV'], ['IV', 'III'], ['I', 'IV'], ['IV', 'I']];
  function claimTxt(c) { return 'If ' + t('P') + ' is ' + regTxt(c.a) + ' and ' + t('Q') + ' is ' + regTxt(c.b) + ', then ' + t('PQ') + ' must have a <b>' + (c.sign > 0 ? 'positive' : 'negative') + '</b> slope.'; }
  function exTxt(pq) { var s = slopeOf(pq[0], pq[1]); return t('P' + ptT(pq[0])) + ' and ' + t('Q' + ptT(pq[1])) + ' give ' + t('m=' + calc(pq[0], pq[1]).replace(/^/, '')) ; }
  function tfTrue(r, c) {
    var gP = REG[c.a], gQ = REG[c.b], runS = Math.sign(gQ[0] - gP[0]), riseS = Math.sign(gQ[1] - gP[1]), S = c.sign > 0 ? 'positive' : 'negative';
    var why = 'From ' + t('P') + ' to ' + t('Q') + ', ' + t('x') + ' goes from ' + sgnW(gP[0]) + ' to ' + sgnW(gQ[0]) + ', so the run is <b>' + sgnW(runS) + '</b>; ' + t('y') + ' goes from ' + sgnW(gP[1]) + ' to ' + sgnW(gQ[1]) + ', so the rise is <b>' + sgnW(riseS) + '</b>. ' + (riseS > 0 ? 'A positive' : 'A negative') + ' rise over ' + (runS > 0 ? 'a positive' : 'a negative') + ' run is always ' + S + '.';
    var e1 = exPts(r, c.a, c.b, c.sign);
    return {
      opts: [
        { html: '<b>True.</b> ' + why, right: true },
        { html: '<b>True.</b> For example, ' + exTxt(e1) + ', which is ' + S + '.', why: 'Right answer, but one example can’t show the slope <b>must</b> be ' + S + '. Use the signs of the rise and the run: they are the same for <b>every</b> ' + t('P') + ' and ' + t('Q') + ' in these places.' },
        { html: '<b>False.</b> If you start at ' + t('Q') + ' instead of ' + t('P') + ', the slope has the opposite sign.', why: 'Swapping the order changes the sign of <b>both</b> the rise and the run, so the slope stays the same.' },
        { html: '<b>False.</b> The points could be close together or far apart, so the slope could be positive or negative.', why: 'Distance changes how steep the segment is, not the sign of its slope: the signs of the rise and the run are fixed by where the points are.' }],
      sol: '<b>True.</b> ' + why };
  }
  function tfFalse(r, c) {
    var S = c.sign > 0 ? 'positive' : 'negative', O = c.sign > 0 ? 'negative' : 'positive', gP = REG[c.a], gQ = REG[c.b];
    var ce = exPts(r, c.a, c.b, -c.sign), ag = exPts(r, c.a, c.b, c.sign), ag2 = find(function () { return exPts(r, c.a, c.b, c.sign); }, function (x) { return x && (x[0].join() !== ag[0].join() || x[1].join() !== ag[1].join()); }, ag);
    var fixedX = gP[0] !== gQ[0], fixW = fixedX ? 'run' : 'rise', freeW = fixedX ? 'rise' : 'run', freeV = fixedX ? 'y' : 'x', fixS = fixedX ? Math.sign(gQ[0] - gP[0]) : Math.sign(gQ[1] - gP[1]);
    return {
      opts: [
        { html: '<b>False.</b> Counterexample: ' + exTxt(ce) + ', which is ' + O + '.', right: true },
        { html: '<b>True.</b> For example, ' + exTxt(ag) + ', which is ' + S + '.', why: 'One example that works can’t show the slope <b>must</b> be ' + S + '. Try other points: ' + exTxt(ce) + '.' },
        { html: '<b>True.</b> From ' + t('P') + ' to ' + t('Q') + ' the ' + fixW + ' is always ' + sgnW(fixS) + ', so the slope is always ' + S + '.', why: 'The ' + fixW + ' does keep its sign, but the ' + freeW + ' doesn’t: both ' + t(freeV) + '-values have the same sign, so either one can be bigger. ' + exTxt(ce) + '.' },
        { html: '<b>False.</b> ' + exTxt(ag2) + ', so the statement fails.', why: 'That slope is ' + S + ' — it agrees with the statement, so it isn’t a counterexample. A counterexample needs a ' + O + ' (or zero) slope.' }],
      sol: '<b>False.</b> One counterexample is enough: ' + exTxt(ce) + ', which is ' + O + '. (Both ' + t(freeV) + '-values have the same sign, so the ' + freeW + ' can be positive or negative.)' };
  }
  function tfPart(r, kind, c, lab) {
    var o = kind === 'T' ? tfTrue(r, c) : tfFalse(r, c);
    return P.mc(r, '<b>True or false?</b> Choose the answer with a correct reason.<br>“' + claimTxt(c) + '”', o.opts, o.sol,
      ['Think about the signs of the run (change in ' + t('x') + ') and the rise (change in ' + t('y') + ') from ' + t('P') + ' to ' + t('Q') + '.', 'If the statement is false, one counterexample is enough.'], 'true/false ' + lab + ': ' + c.a + '→' + c.b + ' ' + c.sign);
  }

  /* ======================= Q9: rate of change from a graph ======================= */
  var Q9C = [
    { intro: 'The graph shows the volume of water in a tank as it fills.', xT: 'Time (min)', yT: 'Volume (L)', xM: 10, yM: 240, gy: 20, ms: [15, 20, 25], bs: [0, 20, 40], qty: 'volume of water', yu: 'L', xu: 'min', xw: 'minute', unit: '\\text{L/min}', flip: '\\text{min/L}' },
    { intro: 'The graph shows a cyclist’s distance from home during a ride.', xT: 'Time (h)', yT: 'Distance (km)', xM: 8, yM: 140, gy: 10, ms: [10, 15, 20], bs: [0, 10, 20], qty: 'distance from home', yu: 'km', xu: 'h', xw: 'hour', unit: '\\text{km/h}', flip: '\\text{h/km}' },
    { intro: 'The graph shows the temperature of a pot of water as it heats.', xT: 'Time (min)', yT: 'Temperature (°C)', xM: 12, yM: 100, gy: 10, ms: [4, 5, 6], bs: [10, 15, 20], qty: 'temperature', yu: '°C', xu: 'min', xw: 'minute', unit: '^{\\circ}\\text{C/min}', flip: '\\text{min}/^{\\circ}\\text{C}' },
    { intro: 'The graph shows the money in Jo’s savings account.', xT: 'Time (weeks)', yT: 'Savings ($)', xM: 10, yM: 300, gy: 20, ms: [15, 20, 25], bs: [20, 40, 60], qty: 'money saved', yu: 'dollars', xu: 'weeks', xw: 'week', unit: '\\text{\\$/week}', flip: '\\text{weeks/\\$}' }];
  function q9Shared(r) {
    return find(function () {
      var c = r.pick(Q9C), m = r.pick(c.ms), b = r.pick(c.bs);
      if (b + m * c.xM > c.yM || b === m) return null;
      var xs = []; for (var x = 1; x < c.xM; x++) if ((b + m * x) % c.gy === 0) xs.push(x);
      if (xs.length < 2) return null;
      var x1 = r.pick(xs), x2 = r.pick(xs); if (x2 - x1 < 3) return null;
      return { c: c, m: m, b: b, x1: x1, x2: x2, y1: b + m * x1, y2: b + m * x2 };
    }, function () { return true; }, { c: Q9C[0], m: 20, b: 40, x1: 2, x2: 8, y1: 80, y2: 200 });
  }
  function q9Fig(s) {
    var c = s.c;
    return '<div class="fig">' + HW.graph({ x: [0, c.xM + 1], y: [0, c.yM + c.gy], grid: 1, gridY: c.gy, labelsX: 2, labelsY: 2 * c.gy, unitX: 300 / c.xM, unitY: 230 / c.yM, firstQuadrant: true, xName: ' ', yName: ' ', xTitle: c.xT, yTitle: c.yT,
      segs: [{ pts: [[0, s.b], [c.xM, s.b + s.m * c.xM]] }], points: [{ x: s.x1, y: s.y1 }, { x: s.x2, y: s.y2 }], max: 400, aria: c.qty + ' graph with two marked points' }) + '</div>';
  }

  /* ======================= Q10 / Q11 ======================= */
  var Q10C = [['A skateboard ramp', 'rises'], ['A roof', 'rises'], ['A staircase', 'rises'], ['A wheelchair ramp', 'rises'], ['A hiking trail', 'climbs'], ['A playground slide', 'drops']];
  var Q11P = { pos: ['cost of gas vs litres bought', 'cost of apples vs mass bought', 'total pay vs hours worked', 'distance walked vs time, walking at a steady pace', 'height of a growing sunflower vs days', 'water in a filling bathtub vs time'],
    neg: ['water in a draining tub vs time', 'a lit candle’s height vs time', 'fuel left in a mower vs time', 'charge left on a phone in use vs time', 'money left on a bus pass vs rides taken', 'height of a melting snowman vs time'],
    zero: ['a parked car’s speed vs time', 'height of a flagpole vs time', 'height of a clock tower vs time', 'length of a pencil in a drawer vs time', 'number of days in a week vs weeks of school'] };

  /* ======================= Q12: a table with a constant rate ======================= */
  var Q12C = [
    { intro: 'A hot-air balloon comes down at a constant rate. The table shows its height above the ground.', xh: 'Time (min)', yh: 'Height (m)', u: '\\text{m/min}', uw: 'm', xw: 'minute', xs: 'minutes', qty: 'height', thing: 'the balloon', rs: [-30, -36, -40, -45, -50, -60], T: [12, 25], end: 'the balloon reach the ground' },
    { intro: 'A snowplow spreads salt at a constant rate. The table shows the mass of salt left in its hopper.', xh: 'Time (h)', yh: 'Salt (kg)', u: '\\text{kg/h}', uw: 'kg', xw: 'hour', xs: 'hours', qty: 'mass of salt', thing: 'the plow', rs: [-100, -120, -125, -150, -160, -200], T: [6, 10], end: 'the hopper be empty' },
    { intro: 'A submarine rises at a constant rate. The table shows its elevation relative to the surface.', xh: 'Time (min)', yh: 'Elevation (m)', u: '\\text{m/min}', uw: 'm', xw: 'minute', xs: 'minutes', qty: 'elevation', thing: 'the submarine', rs: [12, 15, 16, 18, 20, 24, 25, 30], T: [10, 20], end: 'the submarine reach the surface (elevation ' + t('0') + ')' },
    { intro: 'A swimming pool is drained at a constant rate. The table shows the volume of water left in it.', xh: 'Time (h)', yh: 'Volume (kL)', u: '\\text{kL/h}', uw: 'kL', xw: 'hour', xs: 'hours', qty: 'volume of water', thing: 'the pool', rs: [-15, -18, -20, -24, -25, -30], T: [9, 16], end: 'the pool be empty' }];
  function q12Shared(r) {
    return find(function () {
      var c = r.pick(Q12C), rt = r.pick(c.rs), T = r.int(c.T[0], c.T[1]), t1 = r.int(1, 3), t2 = t1 + r.int(2, 4), t3 = t2 + r.int(3, 5);
      if (t3 >= T) return null;
      var V0 = -rt * T, ts = [0, t1, t2, t3];
      return { c: c, r: rt, T: T, ts: ts, vs: ts.map(function (x) { return V0 + rt * x; }) };
    }, function () { return true; }, { c: Q12C[0], r: -45, T: 20, ts: [0, 2, 5, 9], vs: [900, 810, 675, 495] });
  }

  /* ======================= Q13: a fee plus a rate ======================= */
  var Q13C = [
    { k: 'plumber', intro: 'A plumber charges a call-out fee plus an hourly rate.', each: function (x, c) { return 'A ' + t(x) + '-hour job costs ' + t('\\$' + money(c)); }, per: 'per hour', fee: 'call-out fee', rates: [5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000], fees: [4000, 5000, 6000, 7500, 8000], x1: [1, 2, 3], dx: [2, 3, 4] },
    { k: 'taxi', intro: 'A taxi charges a starting fee plus a rate per kilometre.', each: function (x, c) { return 'A ride of ' + t(x) + ' km costs ' + t('\\$' + money(c)); }, per: 'per km', fee: 'starting fee', rates: [160, 175, 180, 190, 210, 225, 240], fees: [350, 375, 425, 480, 530], x1: [5, 6, 7, 8, 9], dx: [5, 6, 7, 8, 9] },
    { k: 'hall', intro: 'A banquet hall charges a room fee plus a cost per guest.', each: function (x, c) { return t(x) + ' guests cost ' + t('\\$' + F(money(c))); }, per: 'per guest', fee: 'room fee', rates: [2000, 2500, 3000, 3500, 4000, 4500], fees: [25000, 30000, 35000, 40000, 50000], x1: [30, 40, 50], dx: [50, 60, 70] },
    { k: 'bike', intro: 'A bike rental shop charges a base fee plus an hourly rate.', each: function (x, c) { return 'Renting for ' + t(x) + ' hours costs ' + t('\\$' + money(c)); }, per: 'per hour', fee: 'base fee', rates: [600, 700, 800, 900, 1200], fees: [1000, 1200, 1500, 2000], x1: [2, 3], dx: [2, 3, 4, 5] }];
  function q13Shared(r) {
    var c = r.pick(Q13C), rate = r.pick(c.rates), fee = r.pick(c.fees), x1 = r.pick(c.x1), x2 = x1 + r.pick(c.dx);
    return { c: c, rate: rate, fee: fee, x1: x1, x2: x2, c1: fee + rate * x1, c2: fee + rate * x2 };
  }

  /* ======================= Q14: a rate in context ======================= */
  var HER = ['Mira', 'Riya', 'Tara', 'Ava', 'Noor', 'Elena', 'Maya', 'Jun'], OTH = ['Jas', 'Kai', 'Leo', 'Sam', 'Ali', 'Theo'];
  var Q14C = [
    { k: 'gas', S: [45, 50, 55, 60], rs: [0.06, 0.07, 0.08, 0.09], ds: [300, 400, 500], f: 100, du: [-1.5, -1, -0.5, 0.5, 1, 1.5],
      intro: function (s) { return s.N + ' fills her car with ' + t(s.S) + ' L of gas and resets the trip meter. After ' + t(s.d) + ' km, the tank holds ' + t(dT(s.E)) + ' L.'; },
      u: '\\text{L/km}', use: 'The car uses', useAfter: 'L of gas for every kilometre', cu: 'L/100 km', cuT: '\\text{L/100 km}', conv: 'L/100 km',
      other: function (s) { return s.O + '’s car uses ' + t(dT(s.o)) + ' L/100 km.'; }, graph: 'gas in the tank vs distance', can: function (s) { return 'With ' + t(s.S) + ' L, can ' + s.N + ' drive ' + t(s.D) + ' km without refuelling?'; }, maxL: 'Distance on a full tank', ul: 'L' },
    { k: 'ebike', S: [100], rs: [0.8, 1.25, 1.6, 2, 2.5], ds: [12, 16, 20, 24], f: 10, du: [-5, -2.5, 2.5, 5],
      intro: function (s) { return s.N + ' charges her e-bike to ' + t('100\\%') + ' and resets the trip meter. After ' + t(s.d) + ' km, the battery shows ' + t(dT(s.E) + '\\%') + '.'; },
      u: '\\%\\text{/km}', use: 'The battery loses', useAfter: '% of its charge for every kilometre', cu: '% per 10 km', cuT: '\\%\\text{ per 10 km}', conv: '% per 10 km',
      other: function (s) { return s.O + '’s e-bike uses ' + t(dT(s.o) + '\\%') + ' per 10 km.'; }, graph: 'charge vs distance', can: function (s) { return 'On a full charge, can ' + s.N + ' ride ' + art(s.D) + ' ' + t(s.D) + ' km route?'; }, maxL: 'Distance on a full charge', ul: '%' },
    { k: 'water', S: [2, 2.5, 3, 3.5, 4], rs: [0.2, 0.25, 0.4, 0.5], ds: [3, 4, 5, 6], f: 1000, du: [-100, -50, 50, 100],
      intro: function (s) { return s.N + ' starts a hike with ' + t(dT(s.S)) + ' L of water. After ' + t(s.d) + ' km, she has ' + t(dT(s.E)) + ' L left.'; },
      u: '\\text{L/km}', use: 'She drinks', useAfter: 'L of water for every kilometre', cu: 'mL/km', cuT: '\\text{mL/km}', conv: 'mL/km',
      other: function (s) { return s.O + ' drinks ' + t(dT(s.o)) + ' mL/km.'; }, graph: 'water carried vs distance', can: function (s) { return 'At this rate, can ' + s.N + ' hike ' + art(s.D) + ' ' + t(s.D) + ' km trail with her ' + t(dT(s.S)) + ' L?'; }, maxL: 'Distance her water lasts', ul: 'L' }];
  function q14Shared(r) {
    return find(function () {
      var c = r.pick(Q14C), S = r.pick(c.S), rt = r.pick(c.rs), d = r.pick(c.ds), E = cl(S - rt * d);
      if (E < 0.15 * S || E > 0.85 * S) return null;
      var mx = cl(S / rt); if (cl(mx * 10) % 1 !== 0) return null;
      var conv = cl(rt * c.f), o = cl(conv + r.pick(c.du)); if (o <= 0) return null;
      var yes = r.chance(0.5), step = mx >= 300 ? 50 : mx >= 40 ? 5 : 1, D = yes ? Math.floor(mx / step) * step : Math.ceil(mx / step) * step;
      if (D === mx) D = yes ? D - step : D + step;
      if (D <= d) return null;
      var nm = r.sample(HER, 1)[0], on = r.pick(OTH);
      return { c: c, S: S, r: rt, d: d, E: E, mx: mx, conv: conv, o: o, D: D, yes: yes, N: nm, O: on, steep: conv > o ? nm : on, flat: conv > o ? on : nm };
    }, function () { return true; }, { c: Q14C[0], S: 55, r: 0.08, d: 400, E: 23, mx: 687.5, conv: 8, o: 6.5, D: 700, yes: false, N: 'Mira', O: 'Jas', steep: 'Mira', flat: 'Jas' });
  }

  /* ======================= Q15: a slope rule ======================= */
  function q15Shared(r) {
    var k = r.pick(['ramp', 'truck', 'roof']);
    if (k === 'ramp') {
      var den = r.pick([12, 12, 15]), h = r.pick(den === 12 ? [0.5, 0.6, 0.7, 0.75, 0.8, 0.9] : [0.4, 0.6, 0.8]), sh = cl(h * den), R = Math.floor(sh) < sh ? Math.floor(sh) : sh - 1;
      if (r.chance(0.3)) R -= 1;
      return { k: k, den: den, h: h, R: R, x: h / R, lim: 1 / den, ans: sh, want: 'no' };
    }
    if (k === 'truck') {
      var pc = r.pick([6, 8, 8, 10]), c = r.pick(pc === 6 ? [18, 24, 30, 36] : pc === 8 ? [24, 30, 36, 42, 48] : [25, 30, 35, 40, 45]), sh2 = cl(c * 100 / pc), R2 = sh2 - r.pick([25, 50, 100]);
      return { k: k, pc: pc, c: c, R: R2, x: c / R2, lim: pc / 100, ans: sh2, want: 'yes' };
    }
    var den3 = r.pick([4, 4, 3]), w = r.pick(den3 === 4 ? [2, 2.4, 3, 3.6, 4] : [1.5, 2.4, 3, 3.6]), lr = cl(w / den3), hp = cl(lr - r.pick([0.05, 0.1, 0.15]));
    return { k: k, den: den3, w: w, hp: hp, x: hp / w, lim: 1 / den3, ans: lr, want: 'no' };
  }

  /* ======================= Q17 / Q18 / Q19 helpers: parallel or perpendicular ======================= */
  function relKind(a, b) { if (sEq(a, b)) return 'par'; if (a && b && a[0] * b[0] === -a[1] * b[1]) return 'perp'; return 'nei'; }
  function relWhy(a, b, kind) {
    var recip = a && b && a[0] * b[0] === a[1] * b[1];
    return {
      par: { perp: 'Perpendicular slopes multiply to ' + t('-1') + '. Reduce both fractions first — are they equal?', nei: 'Reduce both fractions to lowest terms first, then compare them.' },
      perp: { par: 'Parallel slopes are equal — these aren’t. Multiply them: what do you get?', nei: 'Multiply the two slopes. A product of ' + t('-1') + ' means perpendicular.' },
      nei: { par: 'Parallel slopes are equal (after reducing) — these aren’t.', perp: recip ? 'They are reciprocals, but with the <b>same sign</b>: the product is ' + t('+1') + ', not ' + t('-1') + '. Perpendicular slopes have opposite signs.' : 'Multiply them: the product isn’t ' + t('-1') + ', so they aren’t perpendicular.' }
    }[kind];
  }
  function relSol(a, b, x, y) {
    var kind = relKind(a, b); x = x || sT(a); y = y || sT(b);
    if (kind === 'par') return t(x + (x !== sT(a) ? '=' + sT(a) : '')) + ' and ' + t(y + (y !== sT(b) ? '=' + sT(b) : '')) + ': equal slopes, so <b>parallel</b>.';
    var pr = red(a[0] * b[0], a[1] * b[1]);
    if (kind === 'perp') return t(sT(a) + '\\times ' + sP(b) + '=' + frT(pr[0], pr[1])) + ', so <b>perpendicular</b>.';
    return 'The slopes are not equal, and ' + t(sT(a) + '\\times ' + sP(b) + '=' + frT(pr[0], pr[1]) + '\\ne -1') + ': <b>neither</b>.';
  }
  var REL_COLS = [{ id: 'par', html: 'Parallel', label: 'Parallel' }, { id: 'perp', html: 'Perpendicular', label: 'Perpendicular' }, { id: 'nei', html: 'Neither', label: 'Neither' }];
  var NICE = [[1, 2], [2, 3], [3, 2], [1, 3], [3, 4], [4, 3], [2, 5], [1, 4], [3, 5], [5, 2], [2, 1], [3, 1]];

  /* ======================= Q22: rectangle ======================= */
  var QUADN = ['ABCD', 'PQRS', 'WXYZ', 'JKLM', 'EFGH'];
  function q22Shared(r) {
    return find(function () {
      var b0 = r.pick([[1, 4], [1, 3], [2, 3], [1, 2], [3, 2], [3, 1], [4, 1], [2, 1], [3, 4]]), g = r.pick([1, 1, 2]), sq = r.chance(0.25);
      var n = sq ? g : r.pick([1, 2, 3].filter(function (x) { return x !== g; })), sx = r.chance(0.5) ? 1 : -1;
      var u = [g * b0[0], sx * g * b0[1]], v = [n * b0[1] * sx, -n * b0[0]];
      if (r.chance(0.5)) v = [-v[0], -v[1]];
      var A = [r.int(-7, 4), r.int(-7, 4)], B = [A[0] + u[0], A[1] + u[1]], C = [B[0] + v[0], B[1] + v[1]], D = [A[0] + v[0], A[1] + v[1]];
      if (![A, B, C, D].every(function (p) { return inBox(p, 8); })) return null;
      if (Math.max(Math.abs(u[0]), Math.abs(u[1]), Math.abs(v[0]), Math.abs(v[1])) > 10) return null;
      return { nm: r.pick(QUADN), V: [A, B, C, D], sq: sq };
    }, function () { return true; }, { nm: 'ABCD', V: [[-4, -2], [-3, 2], [5, 0], [4, -4]], sq: false });
  }

  /* ======================= the test ======================= */
  HW.defineTest({
    id: 'u6test', unit: 6, title: 'Unit 6 Test', outcome: 'RF3', calc: true,
    blurb: 'The Unit 6 outcomes-based test on RF3: slope from a graph and from two points, working backwards to a missing coordinate, slope as a rate of change, and parallel, perpendicular and collinear — each page at the BEG, PRG and MAS levels.',
    questions: [
      /* ======================= RF3 · Part 1 — calculating slope ======================= */
      { num: '1', outcome: 'RF3', shared: q1Shared,
        stem: function (s) { return 'The grid shows four line segments. Count the rise and the run to find the slope of each one, then classify each slope.' + segGraph(s.segs, Q1N, 5, 'four line segments AB, CD, EF and GH on a grid'); },
        parts: [
          { id: '1a', outcome: 'RF3', level: 'BEG', make: function (r, s) {
            var keys = s.sl.map(sT), p = fieldsPart('Find the slope of each segment. ' + FIELDHELP, Q1N.map(function (nm) { return sField(nm); }), s.sl.map(function (sl) { return slopeChk(sl); }), keys,
              t(Q1N.map(function (nm, i) { return 'm_{' + nm + '}=' + keys[i]; }).join(',\\quad ')), Q1N.map(function (nm, i) { return q1Line(s, i); }).join('<br>'),
              ['Start at the first letter. Count squares up (+) or down (−): that’s the rise. Count squares right (+) or left (−): that’s the run.', 'Slope ' + t('=\\frac{\\text{rise}}{\\text{run}}') + '. A vertical segment has a run of ' + t('0') + ': its slope is undefined.'], 'four slopes on a grid', true);
            p.bad = [s.sl.map(function (sl) { return sl == null ? '0' : sl[0] === 0 ? '\\text{undefined}' : sT(sl); }), s.sl.map(function (sl, i) { return sl && sl[0] && i === s.sl.findIndex(function (x) { return x && x[0]; }) ? sT([-sl[0], sl[1]]) : sT(sl); })];
            return p;
          } },
          { id: '1b', outcome: 'RF3', level: 'BEG', make: function (r, s) {
            var want = {}; Q1N.forEach(function (nm, i) { want[nm] = s.kinds[i]; });
            var why = function (row, got) {
              var k = want[row];
              if (k === 'und') return t(row) + ' is vertical: the run is ' + t('0') + ' and you can’t divide by ' + t('0') + ', so its slope is <b>undefined</b>' + (got === 'zero' ? ' (a slope of ' + t('0') + ' is a horizontal segment).' : '.');
              if (k === 'zero') return t(row) + ' is horizontal: the rise is ' + t('0') + ', so its slope is ' + t('\\frac{0}{\\text{run}}=0') + (got === 'und' ? ' — zero, not undefined.' : '.');
              return t(row) + ' goes ' + (k === 'pos' ? 'up' : 'down') + ' from left to right, so its slope is ' + KIND[k] + '.';
            };
            return gridPart('Classify the slope of each segment.', Q1N.map(function (nm) { return { id: nm, html: t(nm), label: nm }; }),
              ['pos', 'neg', 'zero', 'und'].map(function (k) { return { id: k, html: KIND[k], label: KIND[k] }; }), want, why,
              Q1N.map(function (nm, i) { return t(nm) + ': ' + t('m=' + sT(s.sl[i])) + ', <b>' + KIND[s.kinds[i]] + '</b>' + (s.kinds[i] === 'und' ? ' (vertical)' : s.kinds[i] === 'zero' ? ' (horizontal)' : ' (it goes ' + (s.kinds[i] === 'pos' ? 'up' : 'down') + ' from left to right)'); }).join('<br>'),
              ['Up from left to right: positive. Down: negative.', 'Horizontal: rise ' + t('0') + ', slope ' + t('0') + '. Vertical: run ' + t('0') + ', slope undefined.'], 'classify four slopes', 'Segment');
          } }] },
      { num: '2', outcome: 'RF3', parts: [
        { id: '2', outcome: 'RF3', level: 'BEG', make: function (r) {
          var v = find(function () {
            var q = r.pick([2, 3, 4, 5]), p = r.int(1, 5), k = r.pick([2, 2, 3]), dir = r.chance(0.6) ? 1 : -1;
            if (gcd(p, q) !== 1 || p === q) return null;
            var A = [r.int(-7, 7), r.int(-7, 7)], B = [A[0] + dir * k * q, A[1] - dir * k * p];
            return { A: A, B: B };
          }, function (v) { return inBox(v.B, 7) && v.A[0] * v.B[0] < 0 && v.A[1] * v.B[1] < 0; }, { A: [-3, 4], B: [5, -2] });
          var A = v.A, B = v.B, s = slopeOf(A, B), dx = B[0] - A[0];
          var diag = function (x) { if ((dx && near(x, (B[1] + A[1]) / dx)) || (B[0] + A[0] && near(x, (B[1] - A[1]) / (B[0] + A[0])))) return { code: 'double-neg', hint: 'Careful with the negatives: subtracting a negative coordinate means adding, e.g. ' + t('5-(-3)=5+3=8') + '.' }; return null; };
          return slopeAns('Use the slope formula to find the slope of the line through ' + nP('P', A) + ' and ' + nP('Q', B) + '.', s, slopeChk(s, diag),
            t('m_{PQ}=\\frac{y_Q-y_P}{x_Q-x_P}=' + calc(A, B)), [SLOPE_HINT, 'Reduce the fraction and keep the sign in front.'], 'slope formula ' + ptT(A) + ptT(B), t('m_{PQ}='));
        } }] },
      { num: '3', outcome: 'RF3', parts: [
        { id: '3', outcome: 'RF3', level: 'PRG', make: function (r) {
          var v = find(function () {
            var pq = r.pick([[5, 4], [2, 3], [3, 4], [3, 2], [4, 3], [1, 2], [2, 5], [5, 2], [3, 5], [1, 3]]), sg = r.chance(0.6) ? -1 : 1, j = r.int(1, 4), run = pq[1] * j;
            var x1 = r.int(-6, -1), y1 = r.int(-6, 6), k = y1 + sg * pq[0] * j;
            return { p: pq[0], q: pq[1], sg: sg, j: j, run: run, A: [x1, y1], x2: x1 + run, k: k };
          }, function (v) { return v.run >= 6 && v.run <= 12 && v.x2 >= 1 && v.x2 <= 9 && v.A[1] !== 0 && v.k !== 0 && Math.abs(v.k) <= 14 && v.k !== v.A[1]; }, { p: 5, q: 4, sg: -1, j: 2, run: 8, A: [-2, 5], x2: 6, k: -5 });
          var nm = r.pick([['P', 'Q'], ['A', 'B'], ['M', 'N'], ['G', 'H']]), m = [v.sg * v.p, v.q], A = v.A, rise = v.k - A[1], mv = sV(m);
          return numPart('The line through ' + nP(nm[0], A) + ' and ' + t(nm[1] + '(' + v.x2 + ',\\ k)') + ' has a slope of ' + t(sT(m)) + '. Find ' + t('k') + '.', v.k,
            [[A[1] - rise, 'k-sign', 'Check the sign: the slope is ' + (mv < 0 ? 'negative' : 'positive') + ' and the run is positive, so the rise is ' + (rise < 0 ? 'negative' : 'positive') + '.'], [rise, 'k-no-start', 'That is the rise. ' + t('k') + ' is the ' + t('y') + '-coordinate: start from ' + t('y=' + A[1]) + ' and add the rise.'],
              [A[1] + v.run / mv, 'k-flip', 'Slope is rise over run: the rise is the slope <b>times</b> the run.'], [A[1] + mv / v.run, 'u6t-run-mult', 'Multiply the slope by the run to get the rise (don’t divide).']],
            t('\\frac{k-' + nb(A[1]) + '}{' + v.x2 + '-' + nb(A[0]) + '}=' + sT(m) + '\\ \\Rightarrow\\ \\frac{k-' + nb(A[1]) + '}{' + v.run + '}=' + sT(m) + '\\ \\Rightarrow\\ k-' + nb(A[1]) + '=' + sT(m) + '\\times ' + v.run + '=' + rise + '\\ \\Rightarrow\\ k=' + v.k),
            ['Put the coordinates into ' + t('m=\\frac{y_2-y_1}{x_2-x_1}') + ' with ' + t('k') + ' on top.', 'The rise is the slope times the run.'], 'find k (y) from slope', { before: t('k='), beforeAns: 'k=' });
        } }] },
      { num: '4', outcome: 'RF3', parts: [
        { id: '4', outcome: 'RF3', level: 'PRG', make: function (r) {
          var v = find(function () {
            var pq = r.pick([[3, 2], [4, 3], [6, 5], [2, 3], [3, 4], [5, 4], [5, 2], [2, 5], [1, 2]]), sg = r.chance(0.5) ? -1 : 1, sr = r.chance(0.5) ? -1 : 1, j = r.int(2, 4);
            var rise = sr * pq[0] * j, run = sr * sg * pq[1] * j, x2 = r.int(-4, 5), y1 = r.int(-7, 6);
            return { m: [sg * pq[0], pq[1]], rise: rise, run: run, x2: x2, y1: y1, y2: y1 + rise, k: x2 - run };
          }, function (v) { return Math.abs(v.rise) >= 6 && Math.abs(v.rise) <= 15 && Math.abs(v.run) >= 4 && v.k !== 0 && Math.abs(v.k) <= 14 && v.k !== v.x2 && v.y1 !== 0 && v.y2 !== 0 && Math.abs(v.y2) <= 10; }, { m: [3, 2], rise: 12, run: 8, x2: 4, y1: -3, y2: 9, k: -4 });
          var nm = r.pick([['R', 'S'], ['C', 'D'], ['G', 'H'], ['U', 'V']]), mv = sV(v.m);
          return numPart('The line through ' + t(nm[0] + '(k,\\ ' + v.y1 + ')') + ' and ' + nP(nm[1], [v.x2, v.y2]) + ' has a slope of ' + t(sT(v.m)) + '. Find ' + t('k') + '.', v.k,
            [[v.x2 + v.run, 'k-sign', 'Check the sign: the run is ' + t(v.x2 + '-k') + ', so ' + t('k=' + v.x2 + '-\\text{run}') + '.'], [v.run, 'k-no-start', 'That is the run. ' + t('k') + ' is the ' + t('x') + '-coordinate: ' + t(v.x2 + '-k=\\text{run}') + '.'], [-v.run, 'k-no-start', 'Remember the ' + t('x') + '-coordinate of ' + t(nm[1]) + ': ' + t(v.x2 + '-k=\\text{run}') + '.'],
              [v.x2 - v.rise * mv, 'u6t-k-flip-x', 'The run is the rise <b>divided by</b> the slope: ' + t('\\text{run}=\\frac{\\text{rise}}{m}') + '.']],
            t('\\frac{' + v.y2 + '-' + nb(v.y1) + '}{' + v.x2 + '-k}=' + sT(v.m) + '\\ \\Rightarrow\\ \\frac{' + v.rise + '}{' + v.x2 + '-k}=' + sT(v.m) + '\\ \\Rightarrow\\ ' + v.x2 + '-k=' + v.rise + '\\div ' + sP(v.m) + '=' + v.run + '\\ \\Rightarrow\\ k=' + v.k) + '<br>Check: ' + t('\\frac{' + v.rise + '}{' + v.x2 + '-' + nb(v.k) + '}=\\frac{' + v.rise + '}{' + v.run + '}=' + sT(v.m)) + ' ✓',
            ['Put the coordinates into the slope formula with ' + t('k') + ' in the denominator.', 'The run is the rise divided by the slope.'], 'find k (x) from slope', { before: t('k='), beforeAns: 'k=' });
        } }] },
      { num: '5', outcome: 'RF3',
        shared: function (r) {
          return find(function () {
            var pq = r.pick([[5, 2], [3, 4], [4, 3], [2, 3], [3, 2], [5, 3], [1, 2], [2, 5]]), sg = r.chance(0.5) ? -1 : 1, j = r.int(2, 4), run = -pq[1] * j, rise = -sg * pq[0] * j;
            var A = [r.int(-3, 5), r.int(-4, 4)];
            return { m: [sg * pq[0], pq[1]], run: run, rise: rise, A: A, E: [A[0] + run, A[1] + rise] };
          }, function (v) { return v.A[0] !== 0 && v.A[1] !== 0 && Math.abs(v.rise) >= 6 && Math.abs(v.rise) <= 12 && inBox(v.E, 16) && v.E[1] !== 0 && v.E[0] !== 0; }, { m: [5, 2], run: -4, rise: -10, A: [1, -2], E: [-3, -12] });
        },
        stem: function (s) { return 'A line segment starts at ' + t(ptT(s.A)) + '. It has a slope of ' + t(sT(s.m)) + ' and a rise of ' + t(s.rise) + '.'; },
        parts: [
          { id: '5a', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            return numPart('Find the run.', s.run, [[-s.run, 'u6t-run-sign', 'Check the sign: ' + t('\\text{run}=\\frac{\\text{rise}}{m}') + ', and the rise ' + t(s.rise) + ' and the slope ' + t(sT(s.m)) + ' have ' + (s.rise * s.m[0] > 0 ? 'the same sign' : 'opposite signs') + '.'],
              [s.rise * sV(s.m), 'u6t-run-mult', 'Since ' + t('m=\\frac{\\text{rise}}{\\text{run}}') + ', the run is the rise <b>divided by</b> the slope.'], [sV(s.m) / s.rise, 'u6t-run-mult', 'Since ' + t('m=\\frac{\\text{rise}}{\\text{run}}') + ', ' + t('\\text{run}=\\frac{\\text{rise}}{m}') + '.']],
              t('\\frac{\\text{rise}}{\\text{run}}=' + sT(s.m) + '\\ \\Rightarrow\\ \\frac{' + s.rise + '}{\\text{run}}=' + sT(s.m) + '\\ \\Rightarrow\\ \\text{run}=' + s.rise + '\\div ' + sP(s.m) + '=' + s.run) + '. The run is negative: the other endpoint is to the <b>left</b>.',
              ['Slope ' + t('=\\frac{\\text{rise}}{\\text{run}}') + ', so ' + t('\\text{run}=\\text{rise}\\div\\text{slope}') + '.', 'A rise and a slope with ' + (s.rise * s.m[0] > 0 ? 'the same sign' : 'opposite signs') + ' give a ' + (s.run > 0 ? 'positive' : 'negative') + ' run.'], 'run from slope and rise', { before: t('\\text{run}='), beforeAns: '\\text{run}=' });
          } },
          { id: '5b', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var A = s.A, E = s.E, x = E[0], y = E[1];
            var chk = function (resp) {
              resp = resp || []; var px = HW.parse.number(resp[0] || ''), py = HW.parse.number(resp[1] || '');
              if (!px.ok || !py.ok) return form(!String(resp[0] || '').trim() && !String(resp[1] || '').trim() ? 'empty' : 'notnumber', 'Type the ' + t('x') + '- and ' + t('y') + '-coordinates as numbers.');
              var X = px.value, Y = py.value;
              if (near(X, x) && near(Y, y)) return ok();
              if (near(X, A[0] - s.run) && near(Y, y)) return wrong('end-sign', 'The run is ' + t(s.run) + ' (negative), so the ' + t('x') + '-coordinate goes <b>left</b>: ' + t(A[0] + '+(' + s.run + ')') + '.');
              if (near(X, A[0] + s.rise) && near(Y, A[1] + s.run)) return wrong('end-swap', 'The run changes the ' + t('x') + '-coordinate and the rise changes the ' + t('y') + '-coordinate.');
              if (near(X, s.run) && near(Y, s.rise)) return wrong('end-nostart', 'That is the run and the rise. Start from ' + t(ptT(A)) + ' and add them.');
              if (near(X, x)) return wrong('pt-y', '<b>y:</b> start at ' + t(A[1]) + ' and add the rise ' + t(s.rise) + '.');
              if (near(Y, y)) return wrong('pt-x', '<b>x:</b> start at ' + t(A[0]) + ' and add the run.');
              return wrong('value', null);
            };
            var p = P.fields('Find the coordinates of the other endpoint.', [{ name: 'x', label: 'Other endpoint: ' + t('x') + '-coordinate', before: '' }, { name: 'y', label: 'Other endpoint: ' + t('y') + '-coordinate', before: '' }], [numChk(x), numChk(y)], [String(x), String(y)],
              t(ptT(E)), t('(' + A[0] + '+(' + s.run + '),\\ ' + A[1] + '+' + nb(s.rise) + ')=' + ptT(E)) + '. Add the run to the ' + t('x') + '-coordinate and the rise to the ' + t('y') + '-coordinate.',
              ['Add the run to ' + t('x') + ' and the rise to ' + t('y') + '.', 'A negative run moves left; a negative rise moves down.'], 'other endpoint');
            p.check = chk; p.bad = [[String(A[0] - s.run), String(y)], [String(A[0] + s.rise), String(A[1] + s.run)], [String(s.run), String(s.rise)]];
            return p;
          } }] },
      { num: '6', outcome: 'RF3',
        shared: function (r) {
          var v = find(function () {
            var pq = r.pick(NICE.filter(function (x) { return x[0] !== x[1]; })), sg = r.chance(0.5) ? -1 : 1, j = r.int(1, 4), A = [r.int(-6, 2), r.int(-6, 7)], dir = r.chance(0.75) ? 1 : -1;
            return { A: A, B: [A[0] + dir * pq[1] * j, A[1] + dir * sg * pq[0] * j] };
          }, function (v) { var dx = v.B[0] - v.A[0], dy = v.B[1] - v.A[1]; return inBox(v.B, 7) && Math.abs(dx) >= 4 && Math.abs(dy) >= 4 && Math.abs(dx) !== Math.abs(dy) && v.A[0] && v.A[1] && v.B[0] && v.B[1]; }, { A: [-3, 7], B: [5, -5] });
          var st = r.pick(STUD), nm = r.pick(PAIRN);
          return { A: v.A, B: v.B, nm: nm, st: st, orderFirst: r.chance(0.5) };
        },
        stem: function (s) {
          var A = s.A, B = s.B, w1 = '\\frac{' + B[1] + '-' + nb(A[1]) + '}{' + A[0] + '-' + nb(B[0]) + '}=\\frac{' + (B[1] - A[1]) + '}{' + (A[0] - B[0]) + '}=' + sT(red(B[1] - A[1], A[0] - B[0])),
            w2 = '\\frac{' + B[0] + '-' + nb(A[0]) + '}{' + B[1] + '-' + nb(A[1]) + '}=\\frac{' + (B[0] - A[0]) + '}{' + (B[1] - A[1]) + '}=' + sT(red(B[0] - A[0], B[1] - A[1]));
          var a = s.orderFirst ? w1 : w2, b = s.orderFirst ? w2 : w1;
          return s.st[0] + ' and ' + s.st[1] + ' each found the slope of the segment joining ' + nP(s.nm[0], A) + ' and ' + nP(s.nm[1], B) + '. Both made an error.' +
            '<div style="margin:.5em 0 .2em"><b>' + s.st[0] + ':</b>&nbsp; ' + t('\\displaystyle m=' + a) + '</div><div style="margin:.4em 0"><b>' + s.st[1] + ':</b>&nbsp; ' + t('\\displaystyle m=' + b) + '</div>';
        },
        parts: [
          { id: '6a', outcome: 'RF3', level: 'MAS', make: function (r, s) {
            var want = {}; want.s0 = s.orderFirst ? 'order' : 'flip'; want.s1 = s.orderFirst ? 'flip' : 'order';
            var nmOf = { s0: s.st[0], s1: s.st[1] };
            var why = function (row, got) { var w = want[row]; return w === 'order' ? 'Look at ' + nmOf[row] + '’s top and bottom: the top starts with ' + t(s.nm[1]) + '’s coordinate but the bottom starts with ' + t(s.nm[0]) + '’s.' : 'Look at what ' + nmOf[row] + ' put on top: the change in ' + t('x') + ' (the run) is on top, so it is run over rise.'; };
            return gridPart('Explain each student’s error: choose the error each one made.', [{ id: 's0', html: '<b>' + s.st[0] + '</b>', label: s.st[0] }, { id: 's1', html: '<b>' + s.st[1] + '</b>', label: s.st[1] }],
              [{ id: 'order', html: 'Subtracted in different orders on the top and the bottom', label: 'order' }, { id: 'flip', html: 'Put the run over the rise', label: 'run over rise' }, { id: 'neg', html: 'Subtracted a negative number wrongly', label: 'negative' }], want, why,
              (s.orderFirst ? s.st[0] : s.st[1]) + ' subtracted in different orders: ' + t(s.nm[1] + '-' + s.nm[0]) + ' on the top, but ' + t(s.nm[0] + '-' + s.nm[1]) + ' on the bottom.<br>' + (s.orderFirst ? s.st[1] : s.st[0]) + ' put the run (change in ' + t('x') + ') over the rise (change in ' + t('y') + ').',
              ['Check that each student subtracts in the same order on the top and the bottom.', 'Slope is rise (change in ' + t('y') + ') over run (change in ' + t('x') + ').'], 'name the two slope errors', 'Student');
          } },
          { id: '6b', outcome: 'RF3', level: 'MAS', make: function (r, s) {
            var m = slopeOf(s.A, s.B), dy = s.B[1] - s.A[1], dx = s.B[0] - s.A[0], wo = red(dy, -dx), wf = red(dx, dy), ord = s.orderFirst ? s.st[0] : s.st[1], fl = s.orderFirst ? s.st[1] : s.st[0];
            var diag = function (v) { if (near(v, sV(wo))) return { code: 'u6t-copied', hint: 'That is ' + ord + '’s answer. Subtract in the same order on the top and the bottom.' }; if (near(v, sV(wf))) return { code: 'u6t-copied', hint: 'That is ' + fl + '’s answer: it is run over rise.' }; return null; };
            return slopeAns('Find the correct slope of ' + t(s.nm[0] + s.nm[1]) + '.', m, slopeChk(m, diag), t(calc(s.A, s.B, s.nm[0] + s.nm[1])) + ': ' + t(s.nm[1] + '-' + s.nm[0]) + ' on the top <b>and</b> the bottom, rise over run.',
              [SLOPE_HINT], 'correct slope after error analysis', t('m_{' + s.nm[0] + s.nm[1] + '}='));
          } }] },
      { num: '7', outcome: 'RF3', parts: [
        { id: '7', outcome: 'RF3', level: 'MAS', make: function (r) {
          var v = find(function () {
            var pq = r.pick([[1, 2], [1, 3], [2, 3], [3, 2], [1, 4], [3, 4], [2, 1], [3, 1], [2, 5]]), f2 = r.chance(0.4), a = r.int(-6, 6), b = r.int(-6, 8), p = pq[0], q = pq[1];
            var num = f2 ? p * b + q * a : q * b + p * a; if (num % (p + q)) return null;
            var k = num / (p + q), A = f2 ? [k, a] : [a, k], B = f2 ? [b, k] : [k, b];
            return { p: p, q: q, f2: f2, a: a, b: b, k: k, A: A, B: B };
          }, function (v) { return v.k !== 0 && Math.abs(v.k) <= 9 && v.A[0] !== v.B[0] && v.A[1] !== v.B[1] && v.a !== 0 && v.k !== v.a && v.k !== v.b; }, { p: 1, q: 2, f2: false, a: -1, b: 5, k: 3, A: [-1, 3], B: [3, 5] });
          var m = [v.p, v.q], mv = v.p / v.q, kFor = function (mm) { if (near(1 + mm, 0)) return null; return v.f2 ? (mm * v.b + v.a) / (1 + mm) : (v.b + mm * v.a) / (1 + mm); };
          var At = v.f2 ? t('A(k,\\ ' + v.a + ')') : t('A(' + v.a + ',\\ k)'), Bt = v.f2 ? t('B(' + v.b + ',\\ k)') : t('B(k,\\ ' + v.b + ')');
          var top = v.f2 ? 'k-' + nb(v.a) : v.b + '-k', bot = v.f2 ? v.b + '-k' : 'k-' + nb(v.a);
          var sol = t('\\frac{' + top + '}{' + bot + '}=\\frac{' + v.p + '}{' + v.q + '}\\ \\Rightarrow\\ ' + v.q + '(' + top + ')=' + v.p + '(' + bot + ')') + '<br>' +
            (v.f2 ? t(v.q + 'k' + (-v.q * v.a >= 0 ? '+' : '') + (-v.q * v.a) + '=' + (v.p * v.b) + (v.p === 1 ? '-k' : '-' + v.p + 'k') + '\\ \\Rightarrow\\ ' + (v.p + v.q) + 'k=' + (v.p * v.b + v.q * v.a) + '\\ \\Rightarrow\\ k=' + v.k)
              : t((v.q * v.b) + (v.q === 1 ? '-k' : '-' + v.q + 'k') + '=' + (v.p === 1 ? '' : v.p) + 'k' + (-v.p * v.a >= 0 ? '+' : '') + (-v.p * v.a) + '\\ \\Rightarrow\\ ' + (v.q * v.b + v.p * v.a) + '=' + (v.p + v.q) + 'k\\ \\Rightarrow\\ k=' + v.k)) +
            '<br>Check: ' + nP('A', v.A) + ', ' + nP('B', v.B) + ': ' + t(calc(v.A, v.B)) + ' ✓';
          return numPart('The segment joining ' + At + ' and ' + Bt + ' has a slope of ' + t(sT(m)) + '. Find ' + t('k') + ' (then check your answer).', v.k,
            [[kFor(-mv), 'k-sign', 'Check your signs when you solve: the slope is positive.'], [kFor(1 / mv), 'k-flip', 'Slope is rise over run: the change in ' + t('y') + ' goes on top.']],
            sol, ['Write the slope formula with ' + t('k') + ' in it and set it equal to ' + t(sT(m)) + '.', 'Cross-multiply, then collect the ' + t('k') + '-terms on one side.'], 'k in both points', { before: t('k='), beforeAns: 'k=' });
        } }] },
      { num: '8', outcome: 'RF3',
        shared: function (r) {
          var tp = r.pick(TRUE_PAIRS), fp = r.pick(FALSE_PAIRS), gP = REG[tp[0]], gQ = REG[tp[1]];
          return { trueFirst: r.chance(0.5), tc: { a: tp[0], b: tp[1], sign: Math.sign(gQ[0] - gP[0]) * Math.sign(gQ[1] - gP[1]) }, fc: { a: fp[0], b: fp[1], sign: r.chance(0.5) ? 1 : -1 } };
        },
        stem: '<b>True or false?</b> Each statement is about two points ' + t('P') + ' and ' + t('Q') + '. Justify with a reason or a counterexample.',
        parts: [
          { id: '8a', outcome: 'RF3', level: 'MAS', make: function (r, s) { return s.trueFirst ? tfPart(r, 'T', s.tc, 'a') : tfPart(r, 'F', s.fc, 'a'); } },
          { id: '8b', outcome: 'RF3', level: 'MAS', make: function (r, s) { return s.trueFirst ? tfPart(r, 'F', s.fc, 'b') : tfPart(r, 'T', s.tc, 'b'); } }] },

      /* ======================= RF3 · Part 2 — slope as a rate of change ======================= */
      { num: '9', outcome: 'RF3', shared: q9Shared,
        stem: function (s) { return s.c.intro + q9Fig(s); },
        parts: [
          { id: '9a', outcome: 'RF3', level: 'BEG', make: function (r, s) {
            var rise = s.y2 - s.y1, run = s.x2 - s.x1;
            return numPart('Use the two marked points to find the slope.', s.m, [[run / rise, 'slope-flip', 'Slope is rise over run: the change in ' + s.c.qty + ' over the change in time.'], [s.y2 / s.x2, 'rate-point', 'Use the <b>changes</b> between the two points, not one point’s coordinates.'], [rise, 'u6t-no-run', 'That is the rise. Divide it by the run (the change in time).']],
              'Points ' + t(ptT([s.x1, s.y1])) + ' and ' + t(ptT([s.x2, s.y2])) + ': ' + t('m=\\frac{' + s.y2 + '-' + s.y1 + '}{' + s.x2 + '-' + s.x1 + '}=\\frac{' + rise + '}{' + run + '}=' + s.m),
              ['Read the coordinates of the two marked points.', t('m=\\frac{\\text{rise}}{\\text{run}}') + ' between them.'], 'slope from a context graph', { before: t('m=') });
          } },
          { id: '9b', outcome: 'RF3', level: 'BEG', make: function (r, s) {
            var c = s.c, M = t(s.m + '\\ ' + c.unit);
            return P.mc(r, 'Write the slope as a rate of change, with units. What does it mean?', [
              { html: M + ': the ' + c.qty + ' increases by ' + s.m + ' ' + c.yu + ' every ' + c.xw + '.', right: true },
              { html: t(s.m + '\\ ' + c.flip) + ': it takes ' + s.m + ' ' + c.xu + ' for each ' + (c.yu === 'dollars' ? 'dollar' : c.yu) + '.', why: 'The units of a rate are the units of the vertical axis <b>per</b> unit of the horizontal axis: ' + t(c.unit) + '.' },
              { html: M + ': the ' + c.qty + ' decreases by ' + s.m + ' ' + c.yu + ' every ' + c.xw + '.', why: 'The line goes <b>up</b> from left to right: the slope is positive, so the ' + c.qty + ' increases.' },
              { html: t(s.b) + ' ' + c.yu + ': the starting ' + c.qty + '.', why: 'That is where the line starts on the vertical axis, not how fast it changes. The rate is the slope.' }],
              'The slope is ' + t(s.m) + ', in ' + t(c.unit) + ': the ' + c.qty + ' goes up by ' + s.m + ' ' + c.yu + ' for every ' + c.xw + ' that passes.', ['The units are (vertical-axis unit) per (horizontal-axis unit).'], 'rate with units: ' + c.qty);
          } }] },
      { num: '10', outcome: 'RF3', parts: [
        { id: '10', outcome: 'RF3', level: 'BEG', make: function (r) {
          var v = find(function () { var pq = r.pick([[1, 8], [3, 8], [3, 4], [2, 5], [1, 6], [5, 8], [3, 10], [2, 3], [1, 4], [3, 5], [1, 5]]), s = r.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]); return { p: pq[0], q: pq[1], s: s, rise: cl(pq[0] * s), run: cl(pq[1] * s) }; },
            function (v) { return v.run <= 6 && v.rise >= 0.2 && (v.rise % 1 !== 0 || v.run % 1 !== 0) && cl(v.rise * 10) % 1 === 0 && cl(v.run * 10) % 1 === 0; }, { p: 1, q: 8, s: 0.6, rise: 0.6, run: 4.8 });
          var c = r.pick(Q10C), d = cl(v.run * 10) % 10 === 0 && cl(v.rise * 10) % 10 === 0 ? 1 : 10;
          var p10 = P.fraction(c[0] + ' ' + c[1] + ' ' + t(dT(v.rise)) + ' m over a run of ' + t(dT(v.run)) + ' m. Find its slope in lowest terms.', [v.p, v.q], { diag: function (x) { return near(x, v.q / v.p) ? { code: 'slope-flip', hint: 'Slope is rise over run: ' + t('\\frac{' + dT(v.rise) + '}{' + dT(v.run) + '}') + '.' } : null; } },
            t('m=\\frac{' + dT(v.rise) + '}{' + dT(v.run) + '}=\\frac{' + cl(v.rise * d) + '}{' + cl(v.run * d) + '}=' + frT(v.p, v.q)) + ', so it rises ' + t(v.p) + ' m for every ' + t(v.q) + ' m of run.',
            ['Slope ' + t('=\\frac{\\text{rise}}{\\text{run}}') + '.', 'Multiply the top and bottom by ' + t('10') + ' to clear the decimals, then reduce.'], 'decimal rise/run to a fraction');
          p10.bad = [frT(v.q, v.p)]; return p10;
        } }] },
      { num: '11', outcome: 'RF3', parts: [
        { id: '11', outcome: 'RF3', level: 'BEG', make: function (r) {
          var ks = r.shuffle(['pos', 'neg', 'zero']), rows = ks.map(function (k, i) { return { id: 'abc'.charAt(i), k: k, txt: r.pick(Q11P[k]) }; }), want = {};
          rows.forEach(function (x) { want[x.id] = x.k; });
          var by = {}; rows.forEach(function (x) { by[x.id] = x; });
          var why = function (id) { var x = by[id]; return x.k === 'zero' ? '“' + x.txt + '”: the quantity doesn’t change at all as time passes, so the rate of change is zero.' : '“' + x.txt + '”: as the second quantity grows, the first one ' + (x.k === 'pos' ? 'goes up' : 'goes down') + ', so the rate is ' + KIND[x.k] + '.'; };
          return gridPart('Is the rate of change <b>positive</b>, <b>negative</b> or <b>zero</b>?', rows.map(function (x) { return { id: x.id, html: x.id + ')&nbsp; ' + x.txt, label: x.id }; }),
            [{ id: 'pos', html: 'positive', label: 'positive' }, { id: 'neg', html: 'negative', label: 'negative' }, { id: 'zero', html: 'zero', label: 'zero' }], want, why,
            rows.map(function (x) { return x.id + ') ' + x.txt + ': <b>' + KIND[x.k] + '</b> (' + (x.k === 'pos' ? 'it increases' : x.k === 'neg' ? 'it decreases' : 'it stays the same') + ').'; }).join('<br>'),
            ['Increasing: positive. Decreasing: negative. Not changing: zero.'], 'sign of a rate in context', 'Situation');
        } }] },
      { num: '12', outcome: 'RF3', shared: q12Shared,
        stem: function (s) { return s.c.intro + '<div class="fig">' + HW.valueTable([[s.c.xh].concat(s.ts), [s.c.yh].concat(s.vs)]) + '</div>'; },
        parts: [
          { id: '12ai', sub: 'a i', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var ts = s.ts, vs = s.vs, c = s.c, R = s.r;
            var c1 = numChk(R, [[-R, 'rate-sign', 'Check the sign: the ' + c.qty + ' ' + (R < 0 ? 'goes down' : 'goes up') + ', so the rate is ' + (R < 0 ? 'negative' : 'positive') + '.'], [vs[1] - vs[0], 'u6t-no-run', 'That is the change in ' + c.qty + '. Divide it by the change in time (' + t(ts[1]) + ').'], [vs[1] / ts[1], 'rate-point', 'Use the <b>changes</b>: ' + t('\\frac{\\Delta y}{\\Delta x}') + ', not one column’s values.'], [1 / R, 'rate-flip', 'Change in ' + c.qty + ' over change in time — not the other way.']]);
            var c2 = numChk(R, [[-R, 'rate-sign', 'Check the sign.'], [vs[3] - vs[2], 'u6t-no-run', 'That is the change in ' + c.qty + '. Divide it by the change in time (' + t(ts[3] - ts[2]) + ').'], [vs[3] / ts[3], 'rate-point', 'Use the <b>changes</b> between the last two columns.'], [(vs[3] - vs[2]) / ts[3], 'u6t-no-run', 'Divide by the change in time, ' + t(ts[3] + '-' + ts[2]) + '.']]);
            var p = fieldsPart('Find the rate of change for the first two columns and for the last two columns.', [{ name: 'First two columns', label: 'First two columns:', after: t(c.u) }, { name: 'Last two columns', label: 'Last two columns:', after: t(c.u) }],
              [c1, c2], [String(R), String(R)], t(R + '\\ ' + c.u) + ' and ' + t(R + '\\ ' + c.u),
              t('\\frac{' + vs[1] + '-' + nb(vs[0]) + '}{' + ts[1] + '-0}=\\frac{' + (vs[1] - vs[0]) + '}{' + ts[1] + '}=' + R) + ' and ' + t('\\frac{' + vs[3] + '-' + nb(vs[2]) + '}{' + ts[3] + '-' + ts[2] + '}=\\frac{' + (vs[3] - vs[2]) + '}{' + (ts[3] - ts[2]) + '}=' + R) + ' ' + t(c.u) + '.',
              ['Rate of change ' + t('=\\frac{\\text{change in } y}{\\text{change in } x}') + '.', 'The time steps are not equal: divide by each change in time.'], 'two rates from a table');
            p.bad = [[String(-R), String(R)], [String(vs[1] - vs[0]), String(R)]].filter(function (b) { return b[0] !== String(R); });
            return p;
          } },
          { id: '12aii', sub: 'a ii', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var c = s.c, R = s.r, A = Math.abs(R), dn = R < 0, u = t(R + '\\ ' + c.u);
            return P.mc(r, 'What do you notice about the two rates? What does the sign mean?', [
              { html: 'Both are ' + u + ': the rate is constant. The ' + (dn ? 'negative' : 'positive') + ' sign means the ' + c.qty + ' ' + (dn ? 'decreases' : 'increases') + ' by ' + A + ' ' + c.uw + ' every ' + c.xw + '.', right: true },
              { html: 'Both are ' + u + ': the rate is constant. The ' + (dn ? 'negative' : 'positive') + ' sign means the ' + c.qty + ' ' + (dn ? 'increases' : 'decreases') + ' by ' + A + ' ' + c.uw + ' every ' + c.xw + '.', why: 'Look at the table: the ' + c.qty + ' ' + (dn ? 'goes down' : 'goes up') + '. A ' + (dn ? 'negative' : 'positive') + ' rate means the quantity ' + (dn ? 'decreases' : 'increases') + '.' },
              { html: 'The rates are equal, so the ' + c.qty + ' stays the same.', why: 'Equal rates mean the ' + c.qty + ' changes by the <b>same amount</b> each ' + c.xw + ' (a constant rate), not that it doesn’t change.' },
              { html: 'The rates are different, because the time steps in the table are different.', why: 'Work them out: both are ' + u + '. Different time steps don’t change a constant rate.' }],
              'Both rates are ' + u + ', so the rate of change is <b>constant</b> (the relation is linear). The sign is ' + (dn ? 'negative' : 'positive') + ': the ' + c.qty + ' <b>' + (dn ? 'decreases' : 'increases') + '</b> by ' + A + ' ' + c.uw + ' every ' + c.xw + '.',
              ['Compare the two rates. Then ask: is the ' + c.qty + ' going up or down?'], 'constant rate and its sign');
          } },
          { id: '12b', sub: 'b', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var c = s.c, V0 = s.vs[0];
            return numPart('At this rate, how many ' + c.xs + ' after ' + t('t=0') + ' will ' + c.end + '?', s.T, [[s.T - s.ts[3], 'u6t-from-last', 'That is the time after the <b>last</b> column. The question asks for the time after ' + t('t=0') + '.'], [-s.T, 'u6t-time-sign', 'Time can’t be negative: the change needed and the rate have the same sign.'], [V0 * s.r, 'u6t-range-mult', 'Divide the change needed by the rate (don’t multiply).']],
              'Change needed: ' + t('0-' + nb(V0) + '=' + (-V0)) + '. Time: ' + t((-V0) + '\\div ' + nb(s.r) + '=' + s.T) + ' ' + c.xs + '.',
              ['How much does the ' + c.qty + ' have to change to reach ' + t('0') + '?', 'Divide that change by the rate.'], 'time to reach zero', { after: c.xs, unitAns: c.xs });
          } }] },
      { num: '13', outcome: 'RF3', shared: q13Shared,
        stem: function (s) { return s.c.intro + ' ' + s.c.each(s.x1, s.c1) + ' and ' + s.c.each(s.x2, s.c2).replace(/^A /, 'a ').replace(/^Renting/, 'renting') + '.'; },
        parts: [
          { id: '13a', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var rt = s.rate / 100, d = s.x2 - s.x1;
            return numPart('Find the rate of change of the cost, with units.', rt, [[s.c1 / 100 / s.x1, 'u6t-rate-one', 'Dividing one total by its amount includes the fee. Use the <b>change</b> in cost over the <b>change</b> in ' + (s.c.k === 'taxi' ? 'distance' : s.c.k === 'hall' ? 'guests' : 'time') + '.'], [(s.c2 - s.c1) / 100, 'u6t-no-run', 'That is the change in cost. Divide it by the change of ' + t(d) + '.'], [d / ((s.c2 - s.c1) / 100), 'rate-flip', 'Cost over amount, not amount over cost.']],
              t('\\frac{' + money(s.c2) + '-' + money(s.c1) + '}{' + s.x2 + '-' + s.x1 + '}=\\frac{' + money(s.c2 - s.c1) + '}{' + d + '}=' + money(s.rate)) + ': <b>' + t('\\$' + money(s.rate)) + ' ' + s.c.per + '</b>.',
              ['Rate ' + t('=\\frac{\\text{change in cost}}{\\text{change in amount}}') + '.'], 'rate from two costs: ' + s.c.k, { before: t('\\$'), after: s.c.per, beforeAns: '\\$', unitAns: s.c.per, ansTex: money(s.rate), placeholder: 'e.g. 12.50' });
          } },
          { id: '13b', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var fee = s.fee / 100;
            return numPart('Find the ' + s.c.fee + '.', fee, [[(s.c1 - s.rate) / 100, 'u6t-fee-once', 'The rate is charged for each of the ' + t(s.x1) + ' ' + (s.c.k === 'taxi' ? 'km' : s.c.k === 'hall' ? 'guests' : 'hours') + ': subtract ' + t(s.x1) + ' × the rate.'], [(s.c1 + s.rate * s.x1) / 100, 'u6t-fee-add', 'Subtract the variable cost from the total (don’t add it).'], [s.rate * s.x1 / 100, 'u6t-fee-cost', 'That is the cost of the ' + t(s.x1) + ' ' + (s.c.k === 'taxi' ? 'km' : s.c.k === 'hall' ? 'guests' : 'hours') + '. The fee is what is left of the total.']],
              t(money(s.c1) + '-' + s.x1 + '(' + money(s.rate) + ')=' + money(s.c1) + '-' + money(s.rate * s.x1) + '=' + money(s.fee)) + ': the ' + s.c.fee + ' is <b>' + t('\\$' + money(s.fee)) + '</b>. (Check with the other one: ' + t(money(s.c2) + '-' + s.x2 + '(' + money(s.rate) + ')=' + money(s.fee)) + ' ✓)',
              ['Total cost ' + t('=') + ' fee ' + t('+') + ' rate × amount.', 'Subtract the cost of the ' + t(s.x1) + ' from the total.'], 'fee from rate: ' + s.c.k, { before: t('\\$'), beforeAns: '\\$', ansTex: money(s.fee), placeholder: 'e.g. 12.50' });
          } }] },
      { num: '14', outcome: 'RF3', shared: q14Shared,
        stem: function (s) { return s.c.intro(s); },
        parts: [
          { id: '14a', outcome: 'RF3', level: 'MAS', make: function (r, s) {
            var c = s.c, R = -s.r, ch = cl(s.E - s.S);
            var p = fieldsPart('Find the rate of change of the ' + (c.k === 'ebike' ? 'battery charge' : c.k === 'gas' ? 'gas in the tank' : 'water she carries') + ', with units. Then explain what it means.',
              [{ name: 'Rate of change', label: 'Rate of change:', after: t(c.u) }, { name: 'Meaning', label: c.use, after: c.useAfter }],
              [numChk(R, [[s.r, 'rate-sign', 'Check the sign: the amount goes <b>down</b>, so the rate is negative.'], [ch, 'u6t-no-run', 'That is the change in the amount. Divide it by the distance, ' + t(s.d) + ' km.'], [s.E / s.d, 'rate-point', 'Use the <b>change</b> in the amount, ' + t(dT(s.E) + '-' + dT(s.S)) + ', over the distance.'], [-1 / s.r, 'rate-flip', 'Amount over distance, not distance over amount.']]),
                numChk(s.r, [[R, 'u6t-uses-sign', 'The amount used each kilometre is a positive number: the minus sign in the rate already says it is used up.']])],
              [dT(R), dT(s.r)], t(dT(R) + '\\ ' + c.u) + '; ' + c.use.toLowerCase().replace(/^the /, 'the ') + ' ' + t(dT(s.r)) + ' ' + c.useAfter,
              t('\\frac{' + dT(s.E) + '-' + dT(s.S) + '}{' + s.d + '-0}=\\frac{' + dT(ch) + '}{' + s.d + '}=' + dT(R)) + ' ' + t(c.u) + '. The rate is negative because the amount goes down: ' + c.use.charAt(0).toLowerCase() + c.use.slice(1) + ' ' + t(dT(s.r)) + ' ' + c.useAfter + '.',
              ['Rate ' + t('=\\frac{\\text{change in amount}}{\\text{change in distance}}') + '.', 'A negative rate means the amount is being used up.'], 'rate in context: ' + c.k);
            p.bad = [[dT(s.r), dT(s.r)], [dT(R), dT(R)]];
            return p;
          } },
          { id: '14b', outcome: 'RF3', level: 'MAS', make: function (r, s) {
            var c = s.c, conv = s.conv;
            var cv = function (resp) { var x = numChk(conv, [[s.r * (c.f === 100 ? 10 : c.f === 10 ? 100 : 100), 'u6t-conv', 'Check the factor: ' + (c.f === 1000 ? t('1\\text{ L}=1000\\text{ mL}') : c.f === 100 ? 'the rate is for <b>100</b> km' : 'the rate is for <b>10</b> km') + '.'], [s.r / c.f, 'u6t-conv', 'Multiply by ' + t(c.f) + ' (don’t divide).']])(resp); if (x.v === 'wrong' && x.code === 'value') { var y = numChk(-conv)(resp); if (y.v === 'correct') return ok(); } return x; };
            var p = fieldsPart('Write ' + s.N + '’s rate in ' + c.conv + '. ' + c.other(s) + ' Whose line on a graph of ' + c.graph + ' is steeper?',
              [{ name: 'Rate', label: s.N + '’s rate:', after: t(c.cuT) }, { name: 'Steeper line', label: 'Steeper line:', mode: 'text', placeholder: 'a name' }],
              [cv, nameChk(s.steep, s.flat, 'Compare ' + t(dT(conv)) + ' with ' + t(dT(s.o)) + ': the line that loses more for each kilometre is steeper.')], [dT(conv), s.steep],
              t(dT(conv)) + ' ' + c.cu + '; <b>' + s.steep + '</b>’s line is steeper',
              t(dT(s.r) + '\\times ' + c.f + '=' + dT(conv)) + ' ' + c.cu + '. ' + t(dT(Math.max(conv, s.o)) + '>' + dT(Math.min(conv, s.o))) + ', so <b>' + s.steep + '</b>’s line is steeper: it uses more for every kilometre (the slope is bigger in size).',
              ['Multiply the rate by ' + t(c.f) + '.', 'The steeper line has the slope that is bigger in size.'], 'convert a rate and compare: ' + c.k);
            p.bad = [[dT(conv), s.flat], [dT(s.r / c.f), s.steep]];
            return p;
          } },
          { id: '14c', outcome: 'RF3', level: 'MAS', make: function (r, s) {
            var c = s.c, mx = s.mx;
            var p = fieldsPart(c.can(s) + ' Find how far the full amount lasts, then answer.', [{ name: c.maxL, label: c.maxL + ':', after: 'km' }, ynField('Yes or no', 'Can ' + (c.k === 'gas' ? 'she drive' : c.k === 'ebike' ? 'she ride' : 'she hike') + ' ' + s.D + ' km?')],
              [numChk(mx, [[cl(s.S * s.r), 'u6t-range-mult', 'Divide the full amount by the amount used per km (don’t multiply).'], [s.r / s.S, 'u6t-range-flip', 'Divide the full amount by the rate: ' + t(dT(s.S) + '\\div ' + dT(s.r)) + '.']]),
                ynChk(s.yes ? 'yes' : 'no', 'u6t-yesno', 'Compare ' + t(dT(mx)) + ' km with ' + t(s.D) + ' km.')], [dT(mx), s.yes ? 'yes' : 'no'],
              t(dT(mx)) + ' km; <b>' + (s.yes ? 'yes' : 'no') + '</b>',
              t(dT(s.S) + '\\div ' + dT(s.r) + '=' + dT(mx)) + ' km, and ' + t(dT(mx) + (s.yes ? '>' : '<') + s.D) + ' km: <b>' + (s.yes ? 'yes' : 'no') + '</b>. (Or: ' + t(s.D) + ' km uses ' + t(dT(s.r) + '\\times ' + s.D + '=' + dT(s.r * s.D)) + ' ' + c.ul + (s.yes ? ', less than ' : ', more than ') + t(dT(s.S)) + ' ' + c.ul + '.)',
              ['Divide the full amount by the amount used per kilometre.', 'Then compare with ' + t(s.D) + ' km.'], 'how far it lasts: ' + c.k);
            p.bad = [[dT(cl(s.S * s.r)), s.yes ? 'yes' : 'no'], [dT(mx), s.yes ? 'no' : 'yes']];
            return p;
          } }] },
      { num: '15', outcome: 'RF3', shared: q15Shared,
        stem: function (s) {
          if (s.k === 'ramp') return 'A wheelchair ramp may have a slope of <b>at most</b> ' + t('\\frac{1}{' + s.den + '}') + '. A doorway is ' + t(dT(s.h)) + ' m above the sidewalk. A plan has a ramp with a horizontal run of ' + t(dT(s.R)) + ' m.';
          if (s.k === 'truck') return 'A road needs a truck warning sign if its slope is <b>more than</b> ' + t('\\frac{' + s.pc + '}{100}') + '. A road climbs ' + t(s.c) + ' m over a horizontal ' + t(s.R) + ' m.';
          return 'To shed snow, a shed roof must have a slope of <b>at least</b> ' + t('\\frac{1}{' + s.den + '}') + '. A plan has the roof rising ' + t(dT(s.hp)) + ' m over a horizontal run of ' + t(dT(s.w)) + ' m.';
        },
        parts: [
          { id: '15', outcome: 'RF3', level: 'MAS', make: function (r, s) {
            var x = s.x, xk = String(cl(Math.round(x * 1000) / 1000)), yes = s.want, f, chk, prompt, sol, lab3;
            if (s.k === 'ramp') {
              prompt = 'Does the planned ramp meet the rule? If not, find the shortest run that does.'; lab3 = 'Shortest run that meets the rule';
              chk = numChk(s.ans, [[cl(s.h / s.den), 'u6t-limit-div', 'Solve ' + t('\\frac{' + dT(s.h) + '}{\\text{run}}=\\frac{1}{' + s.den + '}') + ': the run is ' + t(dT(s.h) + '\\times ' + s.den) + '.'], [cl(s.h * s.den / 10), 'value', null]]);
              sol = t('m=\\frac{' + dT(s.h) + '}{' + dT(s.R) + '}\\approx ' + xk + '>\\frac{1}{' + s.den + '}\\approx ' + String(cl(Math.round(1000 / s.den) / 1000))) + ': too steep, so <b>no</b>.<br>' + t('\\frac{' + dT(s.h) + '}{\\text{run}}=\\frac{1}{' + s.den + '}\\ \\Rightarrow\\ \\text{run}=' + dT(s.h) + '\\times ' + s.den + '=' + dT(s.ans)) + ' m. A shorter run makes the slope bigger than ' + t('\\frac{1}{' + s.den + '}') + '.';
            } else if (s.k === 'truck') {
              prompt = 'Does the road need a sign? If so, find the shortest horizontal run for a ' + t(s.c) + ' m climb with no sign.'; lab3 = 'Shortest run with no sign';
              chk = numChk(s.ans, [[cl(s.c * s.pc / 100), 'u6t-limit-div', 'Solve ' + t('\\frac{' + s.c + '}{\\text{run}}=\\frac{' + s.pc + '}{100}') + ': the run is ' + t(s.c + '\\div ' + dT(s.pc / 100)) + '.']]);
              sol = t('m=\\frac{' + s.c + '}{' + s.R + '}\\approx ' + xk + '>\\frac{' + s.pc + '}{100}=' + dT(s.pc / 100)) + ': too steep, so <b>yes</b>, it needs a sign.<br>' + t('\\frac{' + s.c + '}{\\text{run}}=\\frac{' + s.pc + '}{100}\\ \\Rightarrow\\ \\text{run}=' + s.c + '\\div ' + dT(s.pc / 100) + '=' + dT(s.ans)) + ' m. A shorter run makes the slope bigger than ' + t(dT(s.pc / 100)) + '.';
            } else {
              prompt = 'Does the plan meet the rule? If not, find the least rise over the ' + t(dT(s.w)) + ' m run that does.'; lab3 = 'Least rise that meets the rule';
              chk = numChk(s.ans, [[cl(s.w * s.den), 'u6t-limit-div', 'Solve ' + t('\\frac{\\text{rise}}{' + dT(s.w) + '}=\\frac{1}{' + s.den + '}') + ': the rise is ' + t(dT(s.w) + '\\div ' + s.den) + '.']]);
              sol = t('m=\\frac{' + dT(s.hp) + '}{' + dT(s.w) + '}\\approx ' + xk + '<\\frac{1}{' + s.den + '}\\approx ' + String(cl(Math.round(1000 / s.den) / 1000))) + ': too flat, so <b>no</b>.<br>' + t('\\frac{\\text{rise}}{' + dT(s.w) + '}=\\frac{1}{' + s.den + '}\\ \\Rightarrow\\ \\text{rise}=' + dT(s.w) + '\\div ' + s.den + '=' + dT(s.ans)) + ' m. A smaller rise makes the slope less than ' + t('\\frac{1}{' + s.den + '}') + '.';
            }
            var ruleHint = s.k === 'roof' ? 'The rule is a <b>minimum</b> (at least): a slope below it breaks the rule.' : s.k === 'truck' ? 'A sign is needed when the slope is <b>more than</b> the limit.' : 'The rule is a <b>maximum</b> (at most): a slope above it breaks the rule.';
            var p = fieldsPart(prompt + ' Give the slope to 3 decimal places (or as a fraction).', [{ name: 'Slope', label: 'Slope of the plan:', before: t('m=') }, ynField(s.k === 'truck' ? 'Sign needed' : 'Meets the rule', s.k === 'truck' ? 'Does it need a sign?' : 'Does it meet the rule?'), { name: lab3, label: lab3 + ':', after: 'm' }],
              [approxChk(x), ynChk(yes, 'u6t-rule-dir', ruleHint), chk], [xk, yes, dT(s.ans)], t('m\\approx ' + xk) + '; <b>' + yes + '</b>; ' + t(dT(s.ans)) + ' m', sol,
              ['Find the slope of the plan as a decimal and compare it with the rule.', 'Set the slope equal to the limit and solve for the missing length.'], 'slope rule: ' + s.k);
            p.bad = [[xk, yes === 'yes' ? 'no' : 'yes', dT(s.ans)], [xk, yes, String(s.k === 'ramp' ? cl(s.h / s.den) : s.k === 'truck' ? cl(s.c * s.pc / 100) : cl(s.w * s.den))]];
            return p;
          } }] },

      /* ======================= RF3 · Part 3 — parallel, perpendicular, collinear ======================= */
      { num: '16', outcome: 'RF3',
        shared: function (r) {
          var m = r.chance(0.3) ? [(r.chance(0.5) ? -1 : 1) * r.int(2, 8), 1] : find(function () { var p = r.int(1, 8), q = r.int(2, 9); return gcd(p, q) === 1 && p !== q ? [(r.chance(0.5) ? -1 : 1) * p, q] : null; }, function () { return true; }, [3, 7]);
          return { m: m, nm: r.pick(['AB', 'PQ', 'ST', 'MN', 'CD']) };
        },
        stem: function (s) { return 'Segment ' + t(s.nm) + ' has a slope of ' + t(sT(s.m)) + '. Write the slope of a segment that is'; },
        parts: [
          { id: '16a', outcome: 'RF3', level: 'BEG', make: function (r, s) { var p = slopeAns('parallel to ' + t(s.nm) + ':', s.m, relChk(s.m, 'par'), 'Parallel lines have <b>equal</b> slopes: ' + t('m=' + sT(s.m)) + '.', ['Parallel segments rise and run the same way.'], 'parallel slope'); p.bad = [sT(perpOf(s.m))]; return p; } },
          { id: '16b', outcome: 'RF3', level: 'BEG', make: function (r, s) { var pm = perpOf(s.m), p = slopeAns('perpendicular to ' + t(s.nm) + ':', pm, relChk(s.m, 'perp'), 'Perpendicular slopes are <b>negative reciprocals</b>: flip ' + t(sT(s.m)) + ' and change the sign, ' + t('m=' + sT(pm)) + '. Check: ' + t(sT(s.m) + '\\times ' + sP(pm) + '=-1') + '.', ['Flip the fraction and change the sign.', 'The product of the two slopes must be ' + t('-1') + '.'], 'perpendicular slope'); p.bad = [sT(s.m), sT(red(s.m[1], s.m[0]))]; return p; } }] },
      { num: '17', outcome: 'RF3', parts: [
        { id: '17', outcome: 'RF3', level: 'BEG', make: function (r) {
          var fr = function (p, q) { return (p < 0 ? '-' : '') + (q === 1 ? Math.abs(p) : '\\dfrac{' + Math.abs(p) + '}{' + q + '}'); };
          var a = r.pick(NICE.filter(function (x) { return x[1] > 1; })), k = r.int(2, 4), sa = r.chance(0.5) ? -1 : 1;
          var par = r.shuffle([fr(sa * a[0], a[1]), fr(sa * a[0] * k, a[1] * k)]), parS = [[sa * a[0], a[1]], [sa * a[0], a[1]]];
          var b = r.chance(0.4) ? [r.int(2, 8), 1] : r.pick(NICE.filter(function (x) { return x[1] > 1 && x.join() !== a.join(); })), sb = r.chance(0.5) ? -1 : 1, bp = red(-sb * b[1], b[0]);
          var perp = [fr(sb * b[0], b[1]), fr(bp[0], bp[1])];
          var c = find(function () { return r.pick(NICE.filter(function (x) { return x[1] > 1 && x[0] !== 1; })); }, function (x) { return x.join() !== a.join() && x.join() !== b.join(); }, [2, 3]), sc = r.chance(0.5) ? -1 : 1;
          var n1 = [fr(sc * c[0], c[1]), fr(sc * c[1], c[0])], n1S = [[sc * c[0], c[1]], [sc * c[1], c[0]]];
          var d = find(function () { return r.pick(NICE.filter(function (x) { return x[1] > 1; })); }, function (x) { return x.join() !== c.join() && x.join() !== a.join(); }, [7, 4]), sd = r.chance(0.5) ? -1 : 1, oppo = r.chance(0.5);
          var n2S = oppo ? [[sd * d[0], d[1]], [-sd * d[0], d[1]]] : [[sd * d[0], d[1]], [sd * d[1], d[0]]].map(function (x) { return red(x[0], x[1]); }), n2 = n2S.map(function (x) { return fr(x[0], x[1]); });
          var rows = r.shuffle([{ id: 'w', tex: par.join(',\\ \\ '), k: 'par', s: parS }, { id: 'x', tex: perp.join(',\\ \\ '), k: 'perp', s: [[sb * b[0], b[1]], bp] }, { id: 'y', tex: n1.join(',\\ \\ '), k: 'nei', s: n1S.map(function (x) { return red(x[0], x[1]); }) }, { id: 'z', tex: n2.join(',\\ \\ '), k: 'nei', s: n2S }]);
          var want = {}, by = {}; rows.forEach(function (x, i) { x.id = 'r' + (i + 1); want[x.id] = x.k; by[x.id] = x; });
          return gridPart('Each row gives the slopes of two lines. Are the lines parallel, perpendicular or neither?', rows.map(function (x) { return { id: x.id, html: t(x.tex), label: x.tex }; }), REL_COLS, want,
            function (id, got) { var x = by[id]; return t(x.tex) + ': ' + (relWhy(x.s[0], x.s[1], x.k)[got] || ''); },
            rows.map(function (x) { return t(x.tex) + ': ' + relSol(x.s[0], x.s[1]); }).join('<br>'),
            ['Parallel: equal slopes (reduce first). Perpendicular: negative reciprocals (product ' + t('-1') + ').'], 'parallel / perpendicular / neither table', 'Slopes');
        } }] },
      { num: '18', outcome: 'RF3',
        shared: function (r) {
          var v = find(function () {
            var pq = r.pick([[1, 2], [2, 3], [3, 2], [1, 3], [2, 1], [3, 1], [1, 4], [3, 4]]), sg = r.chance(0.5) ? -1 : 1, j1 = r.pick([1, 2]), j2 = r.pick([1, 2, 3]), j3 = r.pick([1, 2]);
            var types = [{ run: pq[1] * j1, rise: sg * pq[0] * j1 }, { run: pq[1] * j2, rise: sg * pq[0] * j2 }, { run: pq[0] * j3, rise: -sg * pq[1] * j3 }];
            if (types.some(function (x) { return x.run > 7 || Math.abs(x.rise) > 7 || x.run + Math.abs(x.rise) < 3; })) return null;
            var segs = placeSegs(r, types, 5); if (!segs) return null;
            var order = r.shuffle([0, 1, 2]);
            return { segs: order.map(function (i) { return segs[i]; }), roles: order };
          }, function () { return true; }, { segs: [[[-4, -3], [0, -1]], [[0, 2], [4, 4]], [[-3, 4], [-1, 0]]], roles: [0, 1, 2] });
          v.sl = v.segs.map(function (s) { return slopeOf(s[0], s[1]); });
          return v;
        },
        stem: function (s) { return 'The grid shows three line segments.' + segGraph(s.segs, ['AB', 'CD', 'EF'], 5, 'three line segments AB, CD and EF on a grid'); },
        parts: [
          { id: '18a', outcome: 'RF3', level: 'BEG', make: function (r, s) {
            var nms = ['AB', 'CD', 'EF'], keys = s.sl.map(sT);
            var p = fieldsPart('Find the slope of each segment.', nms.map(function (n) { return sField(n); }), s.sl.map(function (x) { return slopeChk(x); }), keys, t(nms.map(function (n, i) { return 'm_{' + n + '}=' + keys[i]; }).join(',\\quad ')),
              nms.map(function (n, i) { var A = s.segs[i][0], B = s.segs[i][1]; return t(n) + ': rise ' + t(B[1] - A[1]) + ', run ' + t(B[0] - A[0]) + ', ' + t('m_{' + n + '}=\\frac{' + (B[1] - A[1]) + '}{' + (B[0] - A[0]) + '}' + (sT(s.sl[i]) !== '\\frac{' + (B[1] - A[1]) + '}{' + (B[0] - A[0]) + '}' ? '=' + sT(s.sl[i]) : '')); }).join('<br>'),
              ['Count the rise and the run from the first letter to the second.', 'Reduce each slope.'], 'three slopes on a grid', true);
            p.bad = [s.sl.map(function (x, i) { return i === 1 ? sT([-x[0], x[1]]) : sT(x); })];
            return p;
          } },
          { id: '18b', outcome: 'RF3', level: 'BEG', make: function (r, s) {
            var nms = ['AB', 'CD', 'EF'], pairs = [[0, 1], [0, 2], [1, 2]], want = {}, rows = [];
            pairs.forEach(function (pr, i) { var id = 'p' + i; want[id] = relKind(s.sl[pr[0]], s.sl[pr[1]]); rows.push({ id: id, html: t(nms[pr[0]]) + ' and ' + t(nms[pr[1]]), label: nms[pr[0]] + '/' + nms[pr[1]], pr: pr }); });
            return gridPart('Use your slopes: is each pair of segments parallel, perpendicular or neither?', rows, REL_COLS, want,
              function (id, got) { var x = rows.filter(function (y) { return y.id === id; })[0]; return t(nms[x.pr[0]]) + ' and ' + t(nms[x.pr[1]]) + ': ' + relWhy(s.sl[x.pr[0]], s.sl[x.pr[1]], want[id])[got]; },
              rows.map(function (x) { return t(nms[x.pr[0]]) + ' and ' + t(nms[x.pr[1]]) + ': ' + relSol(s.sl[x.pr[0]], s.sl[x.pr[1]]); }).join('<br>'),
              ['Equal slopes: parallel. Negative reciprocals: perpendicular.'], 'name parallel and perpendicular pairs', 'Segments');
          } }] },
      { num: '19', outcome: 'RF3',
        shared: function (r) {
          return find(function () {
            var pq = r.pick(NICE.filter(function (x) { return x[0] !== x[1]; })), sg = r.chance(0.5) ? -1 : 1, rel = r.pick(['par', 'perp', 'nei']), m1 = [sg * pq[0], pq[1]];
            var m2 = rel === 'par' ? m1 : rel === 'perp' ? red(-m1[1], m1[0]) : r.chance(0.5) ? [-m1[0], m1[1]] : red(m1[1], m1[0]);
            var j1 = r.int(1, 3), j2 = r.int(1, 3), A = [r.int(-6, 2), r.int(-6, 6)], B = [A[0] + m1[1] * j1, A[1] + m1[0] * j1], d2 = r.chance(0.4) ? -1 : 1, C = [r.int(-5, 5), r.int(-6, 6)], D = [C[0] + d2 * m2[1] * j2, C[1] + d2 * m2[0] * j2];
            return { A: A, B: B, C: C, D: D, rel: rel, m1: m1, m2: m2 };
          }, function (v) { return [v.A, v.B, v.C, v.D].every(function (p) { return inBox(p, 8) && p[0] && p[1]; }) && Math.abs(v.B[0] - v.A[0]) + Math.abs(v.B[1] - v.A[1]) >= 5 && Math.abs(v.D[0] - v.C[0]) + Math.abs(v.D[1] - v.C[1]) >= 5 && !sEq(slopeOf(v.A, v.C), v.m1); }, { A: [-5, 1], B: [3, 7], C: [2, -3], D: [-1, 1], rel: 'perp', m1: [3, 4], m2: [-4, 3] });
        },
        stem: function (s) { return 'Segment ' + t('AB') + ' joins ' + nP('A', s.A) + ' and ' + nP('B', s.B) + '. Segment ' + t('CD') + ' joins ' + nP('C', s.C) + ' and ' + nP('D', s.D) + '.'; },
        parts: [
          { id: '19a', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var p = fieldsPart('Find the slope of each segment.', [sField('AB'), sField('CD')], [slopeChk(s.m1), slopeChk(s.m2)], [sT(s.m1), sT(s.m2)], t('m_{AB}=' + sT(s.m1) + ',\\quad m_{CD}=' + sT(s.m2)),
              t(calc(s.A, s.B, 'AB')) + '<br>' + t(calc(s.C, s.D, 'CD')), [SLOPE_HINT], 'two slopes from coordinates');
            p.bad = [[sT([-s.m1[0], s.m1[1]]), sT(s.m2)]];
            return p;
          } },
          { id: '19b', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var kind = relKind(s.m1, s.m2), w = relWhy(s.m1, s.m2, kind);
            var opts = REL_COLS.map(function (o) { return { html: '<b>' + o.html + '</b>' + (o.id === 'par' ? ': the slopes are equal' : o.id === 'perp' ? ': the slopes multiply to ' + t('-1') : ': the slopes are not equal and their product is not ' + t('-1')), right: o.id === kind, why: o.id === kind ? null : w[o.id], code: 'said-' + o.id }; });
            return P.mc(r, 'Are the segments parallel, perpendicular or neither? Choose the answer with the right reason.', opts, t('m_{AB}=' + sT(s.m1)) + ' and ' + t('m_{CD}=' + sT(s.m2)) + '. ' + relSol(s.m1, s.m2), ['Parallel: equal slopes. Perpendicular: product ' + t('-1') + '.'], 'parallel/perpendicular from coordinates');
          } }] },
      { num: '20', outcome: 'RF3',
        shared: function (r) {
          return find(function () {
            var pq = r.pick([[2, 3], [3, 4], [3, 2], [1, 2], [2, 5], [5, 4], [4, 3], [1, 3]]), sg = r.chance(0.5) ? -1 : 1, col = r.chance(0.6), j1 = r.int(1, 2), j2 = r.int(2, 3);
            var Pp = [r.int(-7, -2), r.int(-8, 8)], Q = [Pp[0] + pq[1] * j1 * 2, Pp[1] + sg * pq[0] * j1 * 2], R = [Q[0] + pq[1] * j2, Q[1] + sg * pq[0] * j2];
            if (!col) R = [R[0] + r.pick([-1, 1, 2]), R[1] + r.pick([-1, 1])];
            return { P: Pp, Q: Q, R: R, col: col };
          }, function (v) { var a = slopeOf(v.P, v.Q), b = slopeOf(v.Q, v.R); return [v.P, v.Q, v.R].every(function (p) { return inBox(p, 12) && p[0] && p[1]; }) && a && b && sEq(a, b) === v.col && b[1] <= 9 && Math.abs(b[0]) <= 9; }, { P: [-4, -7], Q: [2, -3], R: [11, 3], col: true });
        },
        stem: function (s) { return 'Are the points ' + nP('P', s.P) + ', ' + nP('Q', s.Q) + ' and ' + nP('R', s.R) + ' collinear? Justify using slopes.'; },
        parts: [
          { id: '20a', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var a = slopeOf(s.P, s.Q), b = slopeOf(s.Q, s.R);
            var p = fieldsPart('Find ' + t('m_{PQ}') + ' and ' + t('m_{QR}') + '.', [sField('PQ'), sField('QR')], [slopeChk(a), slopeChk(b)], [sT(a), sT(b)], t('m_{PQ}=' + sT(a) + ',\\quad m_{QR}=' + sT(b)),
              t(calc(s.P, s.Q, 'PQ')) + '<br>' + t(calc(s.Q, s.R, 'QR')), [SLOPE_HINT, 'Reduce both fractions so you can compare them.'], 'collinear: two slopes');
            p.bad = [[sT([-a[0], a[1]]), sT(b)]];
            return p;
          } },
          { id: '20b', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var a = slopeOf(s.P, s.Q), b = slopeOf(s.Q, s.R), col = s.col;
            return P.mc(r, 'Are ' + t('P') + ', ' + t('Q') + ' and ' + t('R') + ' collinear? Choose the answer with the right reason.', [
              { html: '<b>Collinear</b>: ' + t('m_{PQ}=m_{QR}') + ', and the two segments share the point ' + t('Q') + ', so they lie on one line.', right: col, why: col ? null : 'Reduce both slopes: ' + t(sT(a) + '\\ne ' + sT(b)) + '.' },
              { html: '<b>Not collinear</b>: ' + t('m_{PQ}\\ne m_{QR}') + ', so ' + t('R') + ' is not on the line through ' + t('P') + ' and ' + t('Q') + '.', right: !col, why: col ? 'Reduce both slopes: ' + t(sT(a) + '=' + sT(b)) + '.' : null },
              { html: '<b>' + (col ? 'Collinear' : 'Not collinear') + '</b>: ' + t('PQ') + ' and ' + t('QR') + ' have ' + (col ? 'the same' : 'different') + ' lengths.', why: 'Lengths don’t decide it: points on one line can be any distance apart. Compare the <b>slopes</b>.' },
              { html: '<b>Collinear</b>: the slopes are both ' + (a[0] > 0 ? 'positive' : 'negative') + ', so the points all go the same way.', why: 'Having the same sign isn’t enough: the slopes must be <b>equal</b>' + (col ? ' (here they are — and the segments share ' + t('Q') + ')' : ', and ' + t(sT(a) + '\\ne ' + sT(b))) + '.' }],
              t('m_{PQ}=' + sT(a)) + ', ' + t('m_{QR}=' + sT(b)) + '. ' + (col ? 'The slopes are equal and the segments share the point ' + t('Q') + ', so the points are <b>collinear</b>.' : 'The slopes are different, so the points are <b>not collinear</b>.'),
              ['Two segments with equal slopes that share a point lie on the same line.'], 'collinear conclusion');
          } }] },
      { num: '21', outcome: 'RF3',
        shared: function (r) {
          return find(function () { var pq = r.pick(NICE.filter(function (x) { return x[1] > 1 || x[0] > 1; })), sg = r.chance(0.5) ? -1 : 1, L = lcm(pq[0], pq[1]), D = L * r.pick([1, 2]); return { m: [sg * pq[0], pq[1]], D: D }; },
            function (v) { return v.D <= 24 && v.D >= 6 && v.D !== v.m[1]; }, { m: [-2, 3], D: 12 });
        },
        stem: function (s) { return 'Two lines have slopes ' + t(sT(s.m)) + ' and ' + t('\\frac{k}{' + s.D + '}') + '. Find ' + t('k') + ' if the lines are'; },
        parts: [
          { id: '21a', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var m = s.m, D = s.D, kp = m[0] * D / m[1], kq = -m[1] * D / m[0];
            return numPart('parallel', kp, [[kq, 'u6t-k-rel', 'That makes the lines perpendicular. Parallel lines have <b>equal</b> slopes.'], [-kp, 'k-sign', 'Check the sign: equal slopes have the same sign.'], [m[1] * D / m[0], 'u6t-k-rel', 'Parallel slopes are equal — don’t flip the fraction.']],
              t('\\frac{k}{' + D + '}=' + sT(m) + '\\ \\Rightarrow\\ k=' + D + '\\times ' + sP(m) + '=' + kp), ['Parallel: set the slopes equal.', 'Multiply both sides by ' + t(D) + '.'], 'k for parallel', { before: t('k='), beforeAns: 'k=' });
          } },
          { id: '21b', outcome: 'RF3', level: 'PRG', make: function (r, s) {
            var m = s.m, D = s.D, kp = m[0] * D / m[1], pm = perpOf(m), kq = pm[0] * D / pm[1];
            return numPart('perpendicular', kq, [[kp, 'u6t-k-rel', 'That makes the lines parallel. Perpendicular slopes are <b>negative reciprocals</b>.'], [-kq, 'perp-nosign', 'You took the reciprocal — perpendicular slopes also have <b>opposite signs</b>.'], [-kp, 'u6t-perp-noflip', 'You changed the sign — now take the reciprocal too.']],
              'The negative reciprocal of ' + t(sT(m)) + ' is ' + t(sT(pm)) + '.<br>' + t('\\frac{k}{' + D + '}=' + sT(pm) + '\\ \\Rightarrow\\ k=' + D + '\\times ' + sP(pm) + '=' + kq), ['Perpendicular: the second slope is the negative reciprocal of the first.', 'Then multiply by ' + t(D) + '.'], 'k for perpendicular', { before: t('k='), beforeAns: 'k=' });
          } }] },
      { num: '22', outcome: 'RF3', shared: q22Shared,
        stem: function (s) { var n = s.nm; return 'Quadrilateral ' + t(n) + ' has vertices ' + s.V.slice(0, 3).map(function (p, i) { return nP(n.charAt(i), p); }).join(', ') + ' and ' + nP(n.charAt(3), s.V[3]) + '.'; },
        parts: [
          { id: '22a', outcome: 'RF3', level: 'MAS', make: function (r, s) {
            var n = s.nm, sides = [0, 1, 2, 3].map(function (i) { return [n.charAt(i) + n.charAt((i + 1) % 4), s.V[i], s.V[(i + 1) % 4]]; }), sl = sides.map(function (x) { return slopeOf(x[1], x[2]); });
            var prod = red(sl[0][0] * sl[1][0], sl[0][1] * sl[1][1]);
            var fields = sides.map(function (x) { return sField(x[0]); }).concat([{ name: 'Product', label: t('m_{' + sides[0][0] + '}\\times m_{' + sides[1][0] + '}='), mode: 'math', keys: 'slope', placeholder: 'a number' }]);
            var pc = function (resp) { var c = numChk(-1, [[1, 'u6t-prod-sign', 'Check the signs: one slope is positive and the other negative.']])(resp); return c; };
            var p = fieldsPart('Use slopes to show that ' + t(n) + ' is a rectangle: find the slope of each side, then multiply the slopes of two sides that meet at ' + t(n.charAt(1)) + '.', fields, sl.map(function (x) { return slopeChk(x); }).concat([pc]), sl.map(sT).concat(['-1']),
              t(sides.map(function (x, i) { return 'm_{' + x[0] + '}=' + sT(sl[i]); }).join(',\\ ') + ',\\ m_{' + sides[0][0] + '}\\times m_{' + sides[1][0] + '}=-1'),
              sides.map(function (x) { return t(calc(x[1], x[2], x[0])); }).join('<br>') + '<br>Opposite sides have equal slopes (' + t(sides[0][0] + '\\parallel ' + sides[2][0]) + ', ' + t(sides[1][0] + '\\parallel ' + sides[3][0]) + '): a parallelogram.<br>' + t(sT(sl[0]) + '\\times ' + sP(sl[1]) + '=' + frT(prod[0], prod[1])) + ', so adjacent sides are perpendicular: every angle is ' + t('90^{\\circ}') + '. <b>' + t(n) + ' is a rectangle.</b>',
              ['Opposite sides of a rectangle are parallel (equal slopes); adjacent sides are perpendicular.', 'Perpendicular slopes multiply to ' + t('-1') + '.'], 'rectangle by slopes', true);
            p.bad = [sl.map(sT).concat(['1']), sl.map(function (x, i) { return i === 2 ? sT(red(x[1], x[0])) : sT(x); }).concat(['-1'])];
            return p;
          } },
          { id: '22b', outcome: 'RF3', level: 'MAS', make: function (r, s) {
            var n = s.nm, A = s.V[0], B = s.V[1], C = s.V[2], ab = (B[0] - A[0]) * (B[0] - A[0]) + (B[1] - A[1]) * (B[1] - A[1]), bc = (C[0] - B[0]) * (C[0] - B[0]) + (C[1] - B[1]) * (C[1] - B[1]);
            var d1 = function (dx, dy) { return function (v) { return near(v, Math.abs(dx) + Math.abs(dy)) ? { code: 'u6t-len-add', hint: 'Use the distance formula ' + t('d=\\sqrt{(\\Delta x)^{2}+(\\Delta y)^{2}}') + ' — don’t just add the changes.' } : null; }; };
            var lc = function (d2, dx, dy) { var c = lenChk(d2); return function (resp) { return c(resp, d1(dx, dy)); }; };
            var sq = s.sq, nAB = n.charAt(0) + n.charAt(1), nBC = n.charAt(1) + n.charAt(2);
            var p = fieldsPart('Is ' + t(n) + ' a square? Find the lengths of two sides that meet, then decide.', [{ name: nAB, label: t(nAB + '='), mode: 'math', keys: 'radical', placeholder: 'exact or decimal' }, { name: nBC, label: t(nBC + '='), mode: 'math', keys: 'radical', placeholder: 'exact or decimal' }, ynField('Square?', 'Is ' + n + ' a square?')],
              [lc(ab, B[0] - A[0], B[1] - A[1]), lc(bc, C[0] - B[0], C[1] - B[1]), ynChk(sq ? 'yes' : 'no', 'u6t-square', sq ? 'Adjacent sides are equal and every angle is ' + t('90^{\\circ}') + ': that is a square.' : 'A square needs all four sides equal: compare ' + t(nAB) + ' and ' + t(nBC) + '.')],
              [radT(ab), radT(bc), sq ? 'yes' : 'no'], t(nAB + '=' + radT(ab) + ',\\ ' + nBC + '=' + radT(bc)) + '; <b>' + (sq ? 'yes' : 'no') + '</b>',
              t(nAB + '=\\sqrt{(' + (B[0] - A[0]) + ')^{2}+(' + (B[1] - A[1]) + ')^{2}}=\\sqrt{' + ab + '}' + (radT(ab) !== '\\sqrt{' + ab + '}' ? '=' + radT(ab) : '')) + '<br>' + t(nBC + '=\\sqrt{(' + (C[0] - B[0]) + ')^{2}+(' + (C[1] - B[1]) + ')^{2}}=\\sqrt{' + bc + '}' + (radT(bc) !== '\\sqrt{' + bc + '}' ? '=' + radT(bc) : '')) + '<br>' +
                (sq ? 'Adjacent sides are equal (and it is a rectangle), so <b>yes</b>, it is a square.' : 'Adjacent sides are not equal, so <b>no</b>, it is not a square (it is a rectangle).'),
              ['Distance formula: ' + t('d=\\sqrt{(x_2-x_1)^{2}+(y_2-y_1)^{2}}') + '.', 'A rectangle is a square when two sides that meet are equal.'], 'square? side lengths');
            p.bad = [[String(ab), radT(bc), sq ? 'yes' : 'no'], [radT(ab), radT(bc), sq ? 'no' : 'yes']];
            return p;
          } }] },
      { num: '23', outcome: 'RF3', parts: [
        { id: '23', outcome: 'RF3', level: 'MAS', make: function (r) {
          var v = find(function () {
            var pq = r.pick([[1, 3], [2, 5], [1, 2], [2, 3], [3, 2], [1, 4], [3, 4], [2, 1]]), sg = r.chance(0.5) ? -1 : 1, j1 = r.int(1, 2), j2 = r.int(1, 3), w = r.chance(0.5) ? 1 : -1;
            var Pp = [r.int(-5, 2), r.int(-4, 6)], Q = [Pp[0] + pq[1] * j1 * (pq[1] < 3 ? 2 : 1), 0];
            var run1 = Q[0] - Pp[0], rise1 = sg * pq[0] * run1 / pq[1]; if (rise1 % 1) return null; Q[1] = Pp[1] + rise1;
            var R = [Q[0] + w * pq[0] * j2, Q[1] - w * sg * pq[1] * j2];
            return { P: Pp, Q: Q, R: R, m: [sg * pq[0], pq[1]] };
          }, function (v) { return [v.P, v.Q, v.R].every(function (p) { return inBox(p, 16) && p[0] !== 0; }) && v.R[1] !== v.Q[1] && Math.abs(v.R[1]) <= 16 && v.R[0] !== v.P[0]; }, { P: [-2, 3], Q: [4, 5], R: [6, -1], m: [1, 3] });
          var nm = r.pick([['P', 'Q', 'R'], ['D', 'E', 'F'], ['J', 'K', 'L'], ['A', 'B', 'C']]), m = v.m, pm = perpOf(m), dy = v.R[1] - v.Q[1], k = v.R[0], run = k - v.Q[0];
          var kWith = function (mm) { return v.Q[0] + dy / mm; };
          var sol = 'The right angle is at ' + t(nm[1]) + ', so ' + t(nm[0] + nm[1] + '\\perp ' + nm[1] + nm[2]) + '.<br>' + t(calc(v.P, v.Q, nm[0] + nm[1])) + ', so ' + t('m_{' + nm[1] + nm[2] + '}') + ' must be its negative reciprocal, ' + t(sT(pm)) + '.<br>' +
            t('\\frac{' + v.R[1] + '-' + nb(v.Q[1]) + '}{k-' + nb(v.Q[0]) + '}=' + sT(pm) + '\\ \\Rightarrow\\ k-' + nb(v.Q[0]) + '=' + dy + '\\div ' + sP(pm) + '=' + run + '\\ \\Rightarrow\\ k=' + k) + '<br>Check: ' + t(calc(v.Q, v.R, nm[1] + nm[2])) + ' ✓';
          var kc = numChk(k, [[kWith(sV(m)), 'u6t-k-same', 'You used ' + t('m_{' + nm[0] + nm[1] + '}') + ' itself. For a right angle at ' + t(nm[1]) + ', ' + t(nm[1] + nm[2]) + ' needs the <b>negative reciprocal</b> slope.'], [kWith(-sV(pm)), 'u6t-k-nosign', 'Perpendicular slopes have <b>opposite signs</b> as well as being reciprocals.'], [v.Q[0] - run, 'k-sign', 'Check the sign when you solve for ' + t('k') + '.']]);
          var p = fieldsPart('Triangle ' + t(nm.join('')) + ' has vertices ' + nP(nm[0], v.P) + ', ' + nP(nm[1], v.Q) + ' and ' + t(nm[2] + '(k,\\ ' + v.R[1] + ')') + '. The triangle has a right angle at ' + t(nm[1]) + '. Find the slope of ' + t(nm[0] + nm[1]) + ', the slope ' + t(nm[1] + nm[2]) + ' must have, and ' + t('k') + '.',
            [sField(nm[0] + nm[1]), sField(nm[1] + nm[2], 'Slope ' + nm[1] + nm[2] + ' must have'), { name: 'k', label: t('k='), mode: 'math', keys: 'slope', placeholder: 'a number' }],
            [slopeChk(m), relChk(m, 'perp'), kc], [sT(m), sT(pm), String(k)], t('m_{' + nm[0] + nm[1] + '}=' + sT(m) + ',\\ m_{' + nm[1] + nm[2] + '}=' + sT(pm) + ',\\ k=' + k), sol,
            ['A right angle at ' + t(nm[1]) + ' means the two sides that meet there are perpendicular.', 'Set the slope of ' + t(nm[1] + nm[2]) + ' (with ' + t('k') + ' in it) equal to the negative reciprocal and solve.'], 'right angle: find k');
          p.bad = [[sT(m), sT(m), String(cl(kWith(sV(m))))], [sT(m), sT(red(m[1], m[0])), String(cl(kWith(-sV(pm))))]];
          return p;
        } }] }
    ]
  });
})(window);
