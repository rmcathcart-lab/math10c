/* Math 10C · Unit 8 · Lesson 4 — Solving Word Problems with Systems of Equations (RF9)
 * Assignment questions 1–15 (u8_L04.tex) and the Lesson 4 Extra Practice (u8_EP04.tex, Parts A–I).
 * Every part is a generator: the context stays, the numbers change (kept realistic: whole counts, whole cents,
 * positive lengths), and the booklet's numbers are one of the possible versions. Word problems are split into
 * checkable steps — "write the system" (two equation boxes, any equivalent equations, either order) and the answer —
 * and each card restates the whole situation. "Explain / describe / check" items are multiple choice with a targeted
 * hint on every wrong option. Q15 is marked Extension in the booklet (outcome EXT). Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, LS = HW.lines;

  /* ---------- number formatting ---------- */
  function near(a, b) { return Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b)); }
  function grpAll(s) { s = String(s); var neg = s[0] === '-'; if (neg) s = s.slice(1); var p = s.split('.'), i = p[0], out = ''; while (i.length > 3) { out = '\\,' + i.slice(-3) + out; i = i.slice(0, -3); } return (neg ? '-' : '') + i + out + (p[1] ? '.' + p[1] : ''); }
  function rnd(v) { return Math.round(v * 10000) / 10000; }
  function N(v) { var x = rnd(v); return Math.abs(x) >= 10000 ? grpAll(String(x)) : String(x); }          // TeX number (thin spaces from 10 000)
  function plain(v) { return String(rnd(v)); }                                                            // for keys
  function m2(v) { return (Math.round(v * 100) / 100).toFixed(2); }                                        // 2 decimals, plain
  function mon(v) { var c = Math.round(v * 100), s = c % 100 === 0 ? String(c / 100) : (c / 100).toFixed(2); return Math.abs(c) >= 1000000 ? grpAll(s) : s; } // TeX money digits
  function D(v) { return '\\$' + mon(v); }
  function Dh(v) { return t(D(v)); }
  function pd(p) { return (p / 100).toFixed(2); }                                                          // 8 -> 0.08, 110 -> 1.10
  var NW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  function nw(n) { return NW[n] || String(n); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  var TIMES = { 2: 'twice', 3: 'three times', 4: 'four times', 5: 'five times' };
  var ASMANY = { 2: 'twice', 3: 'three times', 4: 'four times' };
  function gen(f, fb) { for (var g = 0; g < 600; g++) { var o = f(); if (o) return o; } return fb; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function frT(p, q) { return LS.frT(p, q); }

  /* ---------- lines / systems ---------- */
  function eqOf(e, vars) { if (Array.isArray(e)) return e; var r = LS.read(e, vars); return r.ok ? [r.a, r.b, r.c] : null; }
  function onPt(L, P) { var s = Math.max(1, Math.abs(L[2]), Math.abs(L[0] * P[0]), Math.abs(L[1] * P[1])); return Math.abs(L[0] * P[0] + L[1] * P[1] + L[2]) < 1e-7 * s; }
  function solve2(A, B) { var d = A[0] * B[1] - A[1] * B[0]; if (Math.abs(d) < 1e-12) return null; return [(-A[2] * B[1] + A[1] * B[2]) / d, (-A[0] * B[2] + A[2] * B[0]) / d]; }
  var READWHY = { 'no-eq': 'Each box needs an equation with an equals sign.', unreadable: 'One of your equations can’t be read — check the brackets and signs.', 'not-linear': 'Each equation should be linear: no variables multiplied together or squared.', empty: 'Write both equations.' };
  /* Write a system: T = [[A, B, C], [A, B, C]] (Ax + By + C = 0 in opt.vars); either order, any equivalent equation.
   * opt.names: what each equation says ('the total count', …); opt.factHints: hint for each when it is the wrong one;
   * opt.alts: [[other correct forms of eq 1], [… of eq 2]]; opt.wrong: [{ eq, code, hint }] classic mistranslations. */
  function sysCheck(T, opt) {
    var vars = opt.vars, names = opt.names || ['the first fact', 'the second fact'];
    var alts = [0, 1].map(function (j) { return ((opt.alts || [])[j] || []).map(function (e) { return eqOf(e, vars); }).filter(Boolean); });
    var wr = (opt.wrong || []).map(function (w) { return { L: eqOf(w.eq, vars), code: w.code, hint: w.hint }; }).filter(function (w) { return w.L && !LS.same(w.L, T[0]) && !LS.same(w.L, T[1]); });
    var P = solve2(T[0], T[1]);
    function match(L) { for (var j = 0; j < 2; j++) { if (LS.same(L, T[j])) return j; if (alts[j].some(function (a) { return LS.same(L, a); })) return j; } return -1; }
    return function (resp) {
      resp = resp || [];
      var a = String(resp[0] || '').trim(), b = String(resp[1] || '').trim();
      if (!a && !b) return form('empty', 'Write both equations.');
      if (!a || !b) return form('sys-one', 'Write <b>two</b> equations — one in each box.');
      var rs = [LS.read(a, vars), LS.read(b, vars)];
      for (var i = 0; i < 2; i++) if (!rs[i].ok) return form('line-' + rs[i].why, rs[i].why === 'vars' ? 'Use only the letters ' + t(vars[0]) + ' and ' + t(vars[1]) + ' from the question.' : READWHY[rs[i].why] || READWHY.unreadable);
      var Ls = rs.map(function (q) { return [q.a, q.b, q.c]; }), m = Ls.map(match);
      if (m[0] >= 0 && m[1] >= 0 && m[0] !== m[1]) return ok();
      if (m[0] >= 0 && m[0] === m[1]) return wrong('sys-same', 'Both of your equations describe ' + names[m[0]] + '. Write one equation for each fact in the story.');
      for (i = 0; i < 2; i++) if (m[i] < 0) for (var k = 0; k < wr.length; k++) if (LS.same(Ls[i], wr[k].L)) return wrong(wr[k].code, wr[k].hint);
      var g = m[0] >= 0 ? 0 : m[1] >= 0 ? 1 : -1;
      if (g >= 0) {
        var miss = 1 - m[g], der = P && onPt(Ls[1 - g], P);
        return wrong(der ? 'sys-derived' : 'sys-eq', 'Your equation for ' + names[m[g]] + ' is right. ' + (der ? 'Your other equation is true for the answer, but it isn’t a sentence of the story translated — write the equation for ' + names[miss] + ' straight from the words.' : 'Check the one for ' + names[miss] + (opt.factHints ? ': ' + opt.factHints[miss] : '.')));
      }
      if (P && onPt(Ls[0], P) && onPt(Ls[1], P)) return wrong('sys-derived', 'Both equations are true for the answer, but they aren’t the facts of the story — write one equation straight from each sentence (no solving yet).');
      return wrong('sys-eq', null);
    };
  }
  function sysP(prompt, T, opt, sol, hints, text) {
    var labels = opt.labels || ['Equation 1', 'Equation 2'];
    var shown = opt.showTex || opt.keyTex;
    return { prompt: prompt, input: { type: 'fields', fields: labels.map(function (l) { return { label: l, mode: 'math', keys: 'eq', vars: opt.vars, placeholder: ' ' }; }) },
      check: sysCheck(T, opt), key: opt.keyTex, answer: shown.map(function (k) { return t(k); }).join('<br>'), solution: sol, hints: hints || [], text: text,
      good: (opt.good || []).concat([opt.keyTex.slice().reverse()]), bad: opt.bad || [] };
  }
  /* one equation (contexts, so no slope/intercept talk) */
  function eqCheck(T, opt) {
    var vars = opt.vars, wr = (opt.wrong || []).map(function (w) { return { L: eqOf(w.eq, vars), code: w.code, hint: w.hint }; }).filter(function (w) { return w.L && !LS.same(w.L, T); });
    return function (resp) {
      var s = String(resp || '').trim(); if (!s) return form('empty', 'Type your equation first.');
      var q = LS.read(s, vars); if (!q.ok) return form('line-' + q.why, q.why === 'vars' ? 'Use only the letters ' + t(vars[0]) + ' and ' + t(vars[1]) + '.' : q.why === 'no-eq' ? 'Write an equation with an equals sign.' : READWHY[q.why] || READWHY.unreadable);
      var L = [q.a, q.b, q.c]; if (LS.same(L, T)) return ok();
      for (var k = 0; k < wr.length; k++) if (LS.same(L, wr[k].L)) return wrong(wr[k].code, wr[k].hint);
      return wrong('eq', null);
    };
  }
  /* several number boxes. want: numbers; opt.names (plain words for hints), opt.sys (two lines in box order) + opt.sysNames,
   * opt.wrong [{ v: [..], code, hint }], opt.swapHint, opt.wholeHint (counts must be whole: decimals → nudge) */
  function numsCheck(want, opt) {
    opt = opt || {}; var names = opt.names || want.map(function (x, i) { return 'value ' + (i + 1); });
    return function (resp) {
      resp = resp || []; var vals = [];
      for (var i = 0; i < want.length; i++) {
        var s = String(resp[i] == null ? '' : resp[i]).replace(/\\\$|\$/g, '').trim();
        if (!s) return form('empty', want.length > 1 ? 'Fill in every box.' : 'Type your answer first.');
        var p = HW.parse.number(s), fm = !p.ok && s.replace(/\s/g, '').match(/^(-?)(?:\\d?frac\{(-?\d+)\}\{(\d+)\}|(-?\d+)\/(\d+))$/);   // also accept a fraction p/q or \frac{p}{q}
        if (fm && Number(fm[3] || fm[5])) p = { ok: true, value: (fm[1] ? -1 : 1) * Number(fm[2] || fm[4]) / Number(fm[3] || fm[5]) };
        if (!p.ok) return form('notnumber', 'Enter a single number for the ' + names[i] + (opt.money ? ' (no $ sign needed).' : '.'));
        vals.push(p.value);
      }
      if (vals.every(function (v, j) { return near(v, want[j]); })) return ok();
      var W0 = (opt.wrong || []).filter(function (w) { return w.v && w.v.every(function (x, j) { return isFinite(x) && near(vals[j], x); }) && !w.v.every(function (x, j) { return near(x, want[j]); }); })[0];
      if (W0) return wrong(W0.code, W0.hint);
      if (want.length === 2 && near(vals[0], want[1]) && near(vals[1], want[0]) && !near(want[0], want[1])) return wrong('swap-answer', opt.swapHint || 'Right numbers, wrong boxes: which one is the ' + names[0] + '?');
      if (opt.money && vals.every(function (v, j) { return near(v, want[j] * 100); })) return wrong('units-cents', 'Check the units: give the amounts in <b>dollars</b>.');
      if (opt.sys && want.length === 2) {
        var s0 = onPt(opt.sys[0], vals), s1 = onPt(opt.sys[1], vals), sn = opt.sysNames || ['the first equation', 'the second equation'];
        if (s0 !== s1) return wrong('sys-one-eq', 'Your numbers fit ' + (s0 ? sn[0] : sn[1]) + ' but not ' + (s0 ? sn[1] : sn[0]) + '. Substitute them into both equations and look for the slip.');
      }
      var right = vals.map(function (v, j) { return near(v, want[j]); });
      if (right.some(Boolean)) { var j = right.indexOf(false); return wrong('one-value', want.length === 2 ? 'Your ' + names[1 - j] + ' is right — substitute it into one of the equations to find the ' + names[j] + ' again.' : 'Some of your values are right — check the ' + names[j] + '.'); }
      if (opt.diag) { var h = opt.diag(vals); if (h) return wrong(h.code, h.hint); }
      return wrong('value', null);
    };
  }
  function numsP(prompt, fields, want, opt, sol, hints, text) {
    opt = opt || {};
    var show = function (v) { return opt.money ? mon(v) : N(v); };
    return { prompt: prompt, input: { type: 'fields', fields: fields.map(function (f) { return { label: f.label, before: f.before, after: f.after }; }) },
      check: numsCheck(want, opt), key: want.map(function (v) { return opt.money && !Number.isInteger(v) ? m2(v) : plain(v); }),
      answer: fields.map(function (f, i) { return f.label + (f.before === '=' ? ' = ' : ': ' + (f.before ? f.before : '')) + t(show(want[i])) + (f.after ? ' ' + f.after : ''); }).join('<br>'),
      solution: sol, hints: hints || [], text: text, bad: (opt.bad || []).concat(want.length === 2 && !near(want[0], want[1]) ? [[plain(want[1]), plain(want[0])]] : []) };
  }
  function money(f) { return { label: f, before: '$' }; }
  function numP(prompt, ans, diag, sol, hints, text, inp) {
    var p = K.P.number(prompt, ans, diag, sol, hints, text, inp);
    p.check = (function (c) { return function (resp) { return c(String(resp == null ? '' : resp).replace(/\\\$|\$/g, '')); }; })(p.check);
    if (inp && inp.money) { p.answer = t(D(ans)); p.key = Number.isInteger(ans) ? String(ans) : m2(ans); }
    else p.answer = (inp && inp.before ? inp.before : '') + t(N(ans)) + (inp && inp.after ? ' ' + inp.after : '');
    return p;
  }
  function mc(r, prompt, opts, sol, hints, text) { return K.P.mc(r, prompt, opts, sol, hints, text); }
  function chk(s) { return s + ' ✓'; }
  function cf(c, v) { return c === 1 ? v : c === -1 ? '-' + v : c + v; }   // coefficient: 1x -> x

  HW.addCodes({
    'perim-half': 'Perimeter: used l + w instead of 2l + 2w', 'more-than-flip': '“More than” put on the wrong quantity', 'more-times': '“More than” written as times', 'times-more': '“Times” written as more than',
    'more-than-side': '“More than / less than” added to the wrong side', 'coef-swap': 'Coefficients attached to the wrong variables', 'sum-diff': 'Sum written as a difference', 'diff-order': 'Difference subtracted in the wrong order',
    'ratio-flip': '“Twice as many” put on the wrong variable', 'answered-other': 'Gave the other quantity, not the one asked for', 'units-mix': 'Mixed cents and dollars in one equation', 'count-value': 'Count and value mixed up',
    'value-swap': 'Values attached to the wrong items', 'pct-change-only': 'Used only the percent change (0.10I, not 1.10I)', 'pct-direction': 'Percent increase/decrease direction', 'pct-decimal': 'Percent not changed to a decimal',
    'loss-sign': 'A loss added instead of subtracted', 'used-whole': 'Used the whole amount instead of the part invested', 'remainder': 'Gave the amount not invested', 'half-flip': '“Half of” applied to the wrong side',
    'amount-not-interest': 'Compared amounts instead of interest', 'increase-total': 'Used the increase as the new perimeter', 'swap-change': 'Doubled/halved the wrong dimension', 'area-perim': 'Gave the perimeter, not the area',
    'dim-not-area': 'Gave one dimension, not the area', 'added-bills': 'Added the two given totals', 'swap-answer': 'Right numbers in the wrong boxes', 'one-value': 'One value right, the other wrong', 'sys-derived': 'Equation true for the answer but not a translation',
    'units-cents': 'Answer in cents instead of dollars', 'rounded-count': 'Rounded the solution before checking it', 'nr-x-only': 'Gave one variable, not the combination asked for', 'digits-reversed': 'Gave the reversed number',
    'digits-pair': 'Gave the digits, not the number', 'first-diff-const': 'Assumed constant first differences', 'n-offset': 'Used the wrong term number', 'ab-swap': 'Swapped a and b', 'flat-missing': 'Forgot the flat part of a pledge',
    'rate-fixed': 'Fixed fee and rate mixed up', 'round-down': 'Rounded a count down when it had to round up', 'rev-direction': '“More / less” reversed in the digit equation', 'digits-diff': 'Reversal changes the number by 9 × (difference), not the difference',
    'max-wrong': 'Largest possible total computed wrongly', 'not-whole': 'Booking with a fraction of a vehicle', 'booking-wrong': 'Proposed booking doesn’t fit the request', 'same-request': 'Kept the impossible request', 'sign-count': 'Sign of a negative count', 'added-eqs': 'Added the equations instead of subtracting',
    'swapbuy-direction': 'Swapped bill: “more / less” direction reversed', 'swapbuy-diff': 'Used the difference as the swapped bill'
  });

  /* ======================= assignment generators ======================= */
  function q1(r) { return gen(function () { var w = r.int(6, 20), d = r.int(3, 15), l = w + d; if (l > 40) return null; return { l: l, w: w, d: d, P: 2 * (l + w) }; }, { l: 23, w: 12, d: 11, P: 70 }); }
  function q2(r) {
    return gen(function () {
      var ab = r.pick([[2, 3], [2, 3], [3, 2], [2, 5], [3, 4], [4, 3]]), a = ab[0], b = ab[1];
      var x = r.int(4, 20), y = r.chance(0.75) ? -r.int(1, 9) : r.int(1, x - 1), S = x + y, k = a * x - b * y;
      if (S < 1 || k < 5 || k > 120) return null;
      return { a: a, b: b, x: x, y: y, S: S, k: k };
    }, { a: 2, b: 3, x: 12, y: -5, S: 7, k: 39 });
  }
  function q3(r) {
    return gen(function () {
      var uv = r.pick([[2, 1], [2, 1], [1, 2], [3, 1], [1, 3], [3, 2], [2, 3]]), m = r.pick([2, 3]), k = r.pick([2, 3, 4, 5]);
      if (k === m) return null;
      var a1 = m * uv[0], b1 = m * uv[1], a3 = k * uv[0], b3 = k * uv[1]; if (a3 > 15 || b3 > 15 || a1 > 12 || b1 > 12) return null;
      var a2 = r.int(2, 9), b2 = r.int(2, 9); if (a2 * b1 === a1 * b2) return null;
      var n = r.int(12, 60) * 10, f = r.int(10, 50) * 10; if (n === f) return null;
      return { a1: a1, b1: b1, a2: a2, b2: b2, a3: a3, b3: b3, m: m, k: k, n: n / 100, f: f / 100, T1: (a1 * n + b1 * f) / 100, T2: (a2 * n + b2 * f) / 100, T3: (a3 * n + b3 * f) / 100 };
    }, { a1: 6, b1: 3, a2: 4, b2: 7, a3: 10, b3: 5, m: 3, k: 5, n: 3.6, f: 2.3, T1: 28.5, T2: 30.5, T3: 47.5 });
  }
  function q4(r) { return gen(function () { var l = r.int(8, 30), w = 2 * r.int(2, 14); if (w >= l || 2 * (l + w) > 120) return null; return { l: l, w: w, P: 2 * (l + w), I: 2 * l - w }; }, { l: 15, w: 10, P: 50, I: 20 }); }
  function q5(r) {
    return gen(function () {
      var k = r.chance(0.8) ? 2 : 3, b = r.int(12, 40), p = r.int(3, 7), q = r.int(p + 1, k * p - 1), D0 = (k * p - q) * b;
      if (D0 < 10 || D0 > 200 || q > 12) return null;
      return { k: k, b: b, p: p, q: q, D: D0, m: k * b };
    }, { k: 2, b: 27, p: 5, q: 8, D: 54, m: 54 });
  }
  var COINS = [{ c1: 'nickels', c2: 'quarters', s1: 'nickel', s2: 'quarter', v1: 5, v2: 25, x: 'n', y: 'q' }, { c1: 'dimes', c2: 'quarters', s1: 'dime', s2: 'quarter', v1: 10, v2: 25, x: 'd', y: 'q' }, { c1: 'nickels', c2: 'dimes', s1: 'nickel', s2: 'dime', v1: 5, v2: 10, x: 'n', y: 'd' }];
  function q6(r) {
    return gen(function () {
      var c = r.chance(0.6) ? COINS[0] : r.pick(COINS), n = r.int(10, 60), q = r.int(10, 70);
      if (n === q) return null;
      return { c: c, n: n, q: q, Nn: n + q, V: (c.v1 * n + c.v2 * q) / 100, name: r.pick(['Jamal', 'Priya', 'Mateo', 'Aiyana', 'Liam', 'Mei']) };
    }, { c: COINS[0], n: 30, q: 56, Nn: 86, V: 15.5, name: 'Jamal' });
  }
  function q7(r) {
    return gen(function () {
      var I = 1000 * r.int(30, 80), S1 = 100 * r.int(10, 90), E = I - S1, p = r.pick([5, 10, 15, 20]), q = r.pick([5, 10, 15, 20]);
      var S2 = (100 + p) * I / 100 - (100 - q) * E / 100;
      if (S2 < S1 + 1000 || S2 > I / 2) return null;
      return { I: I, E: E, S1: S1, S2: Math.round(S2), p: p, q: q };
    }, { I: 40000, E: 35800, S1: 4200, S2: 13570, p: 10, q: 15 });
  }
  function q8(r) {
    return gen(function () {
      var fr = r.pick([[5, 8], [5, 8], [3, 4], [2, 3], [3, 5], [4, 5], [5, 6]]), j = r.int(2, 20), T = fr[0] * 1000 * j, H = fr[1] * 1000 * j;
      if (T < 20000 || T > 60000) return null;
      var g = r.int(6, 12), l = r.int(1, 4), i = r.int(Math.ceil(T / 1000 * 0.3), Math.floor(T / 1000 * 0.8)), G = 1000 * i, B = T - G, net = (g * G - l * B) / 100;
      if (G === B || net <= 0) return null;
      return { a: fr[0], b: fr[1], T: T, H: H, g: g, l: l, G: G, B: B, net: net };
    }, { a: 5, b: 8, T: 40000, H: 64000, g: 9, l: 2, G: 25000, B: 15000, net: 1950 });
  }
  function q9(r) {
    return gen(function () {
      var rr = r.pick([[8, 5], [8, 5], [6, 4], [6, 5], [10, 4], [9, 6], [7, 5]]), r1 = rr[0], r2 = rr[1], a = 1000 * r.int(2, 9), b = r1 * a / (2 * r2);
      if (!Number.isInteger(b) || b % 100 || a + b > 20000) return null;
      return { r1: r1, r2: r2, a: a, b: b, T: a + b };
    }, { r1: 8, r2: 5, a: 5000, b: 4000, T: 9000 });
  }

  /* ======================= extra practice generators ======================= */
  function ep2(r) {
    var k = r.pick([2, 2, 3, 4]), tt = r.int(4, 21), d7 = r.int(3, 9), bAbove = r.chance(0.6);
    // (g): exactly one of (b) and (c) has the pen above $2
    var pb = bAbove ? (5 * r.int(42, 80)) / 100 : (5 * r.int(20, 37)) / 100, pc = bAbove ? (5 * r.int(16, 37)) / 100 : (5 * r.int(42, 70)) / 100;
    var rv = r.int(30, 120), dd = r.int(3, 15), dN = r.int(8, 30), kN = r.int(3, 9);
    var f6 = gen(function () { var S = r.int(10, 30), Lg = r.int(S + 1, S + 15), c = 5 * S - 3 * Lg; if (c < 2 || c > 30) return null; return { S: S, L: Lg, c: c }; }, { S: 16, L: 24, c: 8 });
    return { k: k, t: tt, d7: d7, pb: pb, Tb: rnd(2 * pb + d7), pc: pc, Tc: rnd((d7 + 1) * pc), bAbove: bAbove, r: rv + dd, f: rv, dd: dd, Tr: 2 * rv + dd, dN: dN, kN: kN, f6: f6 };
  }

  /* ======================= small figures ======================= */
  function machineGraph(o) {
    var xm = o.xmax, ym = o.ymax;
    var svg = HW.graph({ x: [0, xm], y: [0, ym], grid: 2, labels: 4, firstQuadrant: true, xName: 'o', yName: 'n', max: 380,
      segs: [{ pts: [[0, o.T], [o.T, 0]], color: '#2b62b8' }, { pts: [[0, o.B / o.r2], [o.B / o.r1, 0]], color: '#c4532a', dash: true }],
      points: [{ x: o.o, y: o.n, color: '#2b3340', label: '(' + o.o + ', ' + o.n + ')' }, { x: o.o2, y: o.n2, color: '#2b3340', label: '(' + o.o2 + ', ' + o.n2 + ')' }], aria: 'two lines: P (time) and Q (output)' });
    var G = HW.graph.last, lab = function (x, y, s, c) { return '<text x="' + G.X(x).toFixed(1) + '" y="' + G.Y(y).toFixed(1) + '" font-size="12.5" font-weight="600" fill="' + c + '" paint-order="stroke" stroke="#fff" stroke-width="3">' + s + '</text>'; };
    return svg.replace('</svg>', lab(0.6, o.T + 0.6, 'line P', '#2b62b8') + lab(0.6, o.B / o.r2 - 2.2, 'line Q', '#c4532a') + '</svg>');
  }
  function angleFig(e1, e2) {
    return HW.fig({ pts: { A: [-3, 2], B: [3, 2], C: [-3, -1], Dd: [3, -1], U: [1.5, 3], W: [-1.5, -2], T: [0.9, 2], S: [-0.9, -1] },
      segs: [['A', 'B'], ['C', 'Dd'], ['W', 'U']],
      angles: [['T', 'B', 'U', '', { r: 16 }], ['S', 'Dd', 'T', '', { r: 16 }], ['S', 'T', 'C', '', { r: 11, color: '#c4532a' }]],
      names: false, width: 320,
      extra: [{ type: 'text', at: [1.75, 2.35], text: e1 }, { type: 'text', at: [0.55, -0.62], text: e2[0] }, { type: 'text', at: [-1.95, -0.62], text: e2[1] }], aria: 'two parallel lines cut by a transversal' });
  }

  HW.defineLesson({
    id: 'u8l4', unit: 8, num: '4', title: 'Solving Word Problems with Systems of Equations', outcome: 'RF9',
    blurb: 'Name the unknowns, turn the sentences into two equations, solve, and check the answer against the words: numbers, rectangles, prices, coins, investments, rates and digits.',
    questions: [
      /* ---------- 1 ---------- */
      { num: '1', section: 'Assignment — Introduce variables, form a system, solve, answer', shared: q1,
        stem: function (o) { return 'A rectangle is to be drawn with perimeter ' + t(o.P + '\\text{ cm}') + '. If the length is to be ' + t(o.d + '\\text{ cm}') + ' more than the width, determine the area of the rectangle.'; },
        parts: [
          { id: '1a', sub: 'i', level: 'EMG', make: function (r, o) {
            return sysP('Let ' + t('l') + ' be the length and ' + t('w') + ' the width, in centimetres. Write a system of two equations.', [[2, 2, -o.P], [1, -1, -o.d]],
              { vars: ['l', 'w'], keyTex: ['2l+2w=' + o.P, 'l=w+' + o.d], names: ['the perimeter', 'the length–width relationship'],
                factHints: ['the perimeter adds all four sides, ' + t('2l+2w') + '.', '“' + o.d + ' cm more than the width” adds ' + t(o.d) + ' to the width.'],
                wrong: [{ eq: [1, 1, -o.P], code: 'perim-half', hint: 'The perimeter adds <b>all four</b> sides: ' + t('2l+2w=' + o.P) + ' (or ' + t('l+w=' + o.P / 2) + ').' },
                  { eq: [1, -1, o.d], code: 'more-than-flip', hint: 'The length is the longer side: “the length is ' + o.d + ' cm more than the width” means ' + t('l=w+' + o.d) + '. Test it: if ' + t('w=10') + ', then ' + t('l') + ' should be ' + t(10 + o.d) + '.' },
                  { eq: [1, -o.d, 0], code: 'more-times', hint: '“' + o.d + ' more than” <b>adds</b> ' + t(o.d) + ' — it doesn’t multiply.' }],
                good: [['l+w=' + o.P / 2, 'l-w=' + o.d], ['2(l+w)=' + o.P, 'w=l-' + o.d]], bad: [['l+w=' + o.P, 'l=w+' + o.d], ['2l+2w=' + o.P, 'w=l+' + o.d], ['2l+2w=' + o.P, 'l=' + o.d + 'w']] },
              '<b>Perimeter:</b> ' + t('2l+2w=' + o.P) + ' (or ' + t('l+w=' + o.P / 2) + ').<br><b>Length–width:</b> ' + t('l=w+' + o.d) + '.',
              ['One equation comes from the perimeter (all four sides), the other from “the length is ' + o.d + ' cm more than the width”.'], 'rectangle system P ' + o.P + ', l = w + ' + o.d);
          } },
          { id: '1b', sub: 'ii', level: 'EMG', make: function (r, o) {
            return numsP('Solve the system to find the dimensions of the rectangle.', [{ label: 'Length', after: 'cm' }, { label: 'Width', after: 'cm' }], [o.l, o.w],
              { names: ['length', 'width'], sys: [[1, 1, -o.P / 2], [1, -1, -o.d]], sysNames: ['the perimeter', 'the length–width relationship'], swapHint: 'The length is the longer side — it is ' + o.d + ' cm more than the width.',
                wrong: [{ v: [(o.P + o.d) / 2, (o.P - o.d) / 2], code: 'perim-half', hint: 'Check the perimeter: your rectangle has perimeter ' + t(N(2 * o.P) + '\\text{ cm}') + '. Use ' + t('2l+2w=' + o.P) + ', so ' + t('l+w=' + o.P / 2) + '.' }] },
              t('2l+2w=' + o.P) + ' ⟹ ' + t('l+w=' + o.P / 2) + '. Substitute ' + t('l=w+' + o.d) + ': ' + t('(w+' + o.d + ')+w=' + o.P / 2) + ' ⟹ ' + t('2w=' + (o.P / 2 - o.d)) + ' ⟹ ' + t('w=' + o.w) + ', so ' + t('l=' + o.l) + '.<br>' +
              chk('Check: ' + t('2(' + o.l + ')+2(' + o.w + ')=' + o.P)) + ', ' + chk(t(o.l + '-' + o.w + '=' + o.d)) + '<br>The rectangle is <b>' + o.l + ' cm by ' + o.w + ' cm</b>.',
              ['Halve the perimeter equation first: ' + t('l+w=' + o.P / 2) + '. Then substitute ' + t('l=w+' + o.d) + '.'], 'rectangle dimensions');
          } },
          { id: '1c', sub: 'iii', level: 'PRG', make: function (r, o) {
            return numP('Determine the area of the rectangle.', o.l * o.w, function (v) {
              if (v === o.P || v === o.P / 2) return { code: 'area-perim', hint: 'That’s the perimeter (or half of it). Area = length × width — find the dimensions first.' };
              if (v === o.l || v === o.w) return { code: 'dim-not-area', hint: 'That’s one of the dimensions. The question asks for the <b>area</b>: length × width.' };
              if (near(v, (o.P + o.d) / 2 * (o.P - o.d) / 2)) return { code: 'perim-half', hint: 'Check your dimensions against the perimeter: ' + t('2l+2w') + ' must equal ' + t(o.P) + ', so ' + t('l+w=' + o.P / 2) + '.' };
              return null;
            }, 'Let ' + t('l') + ' and ' + t('w') + ' be the length and width in cm: ' + t('2l+2w=' + o.P) + ' and ' + t('l=w+' + o.d) + '.<br>' + t('(w+' + o.d + ')+w=' + o.P / 2) + ' ⟹ ' + t('w=' + o.w) + ', ' + t('l=' + o.l) + '. ' + chk('Check: ' + t('2(' + (o.l + o.w) + ')=' + o.P)) + '<br>Area ' + t('=lw=' + o.l + '\\times ' + o.w + '=' + o.l * o.w) + '.<br><b>The area of the rectangle is ' + o.l * o.w + ' cm².</b>',
              ['Find the length and width with a system first, then multiply them.'], 'rectangle area', { after: 'cm²' });
          } }] },
      /* ---------- 2 ---------- */
      { num: '2', shared: q2,
        stem: function (o) { return 'The sum of two numbers is ' + t(o.S) + '. ' + cap(TIMES[o.a]) + ' the larger number is ' + t(o.k) + ' more than ' + TIMES[o.b] + ' the smaller number. Find the numbers.'; },
        parts: [
          { id: '2a', sub: 'i', level: 'EMG', make: function (r, o) {
            return sysP('Let ' + t('x') + ' be the larger number and ' + t('y') + ' the smaller number. Write a system of two equations.', [[1, 1, -o.S], [o.a, -o.b, -o.k]],
              { vars: ['x', 'y'], keyTex: ['x+y=' + o.S, o.a + 'x=' + o.b + 'y+' + o.k], names: ['the sum', 'the “more than” sentence'],
                factHints: ['“the sum is ' + o.S + '” means ' + t('x+y=' + o.S) + '.', 'start with ' + TIMES[o.b] + ' the smaller number, ' + t(o.b + 'y') + ', and add ' + t(o.k) + '.'],
                wrong: [{ eq: [o.a, -o.b, o.k], code: 'more-than-side', hint: '“' + o.k + ' more than ' + TIMES[o.b] + ' the smaller” is ' + t(o.b + 'y+' + o.k) + ', so ' + t(o.a + 'x=' + o.b + 'y+' + o.k) + '. The ' + t(o.k) + ' goes with the quantity it is “more than”.' },
                  { eq: [o.b, -o.a, -o.k], code: 'coef-swap', hint: 'Match each multiplier to its number: ' + TIMES[o.a] + ' the <b>larger</b> (' + t(o.a + 'x') + '), ' + TIMES[o.b] + ' the <b>smaller</b> (' + t(o.b + 'y') + ').' },
                  { eq: [1, -1, -o.S], code: 'sum-diff', hint: 'A <b>sum</b> adds: ' + t('x+y=' + o.S) + '.' }],
                bad: [['x+y=' + o.S, o.a + 'x+' + o.k + '=' + o.b + 'y'], ['x+y=' + o.S, o.b + 'x=' + o.a + 'y+' + o.k]] },
              '<b>Sum:</b> ' + t('x+y=' + o.S) + '. <b>“' + cap(TIMES[o.a]) + ' the larger is ' + o.k + ' more than ' + TIMES[o.b] + ' the smaller”:</b> ' + t(o.a + 'x=' + o.b + 'y+' + o.k) + '.',
              ['Translate each sentence separately. “' + o.k + ' more than ' + TIMES[o.b] + ' the smaller” is ' + t(o.b + 'y+' + o.k) + '.'], 'two numbers system');
          } },
          { id: '2b', sub: 'ii', level: 'PRG', make: function (r, o) {
            var xf = (o.b * o.S - o.k) / (o.a + o.b);
            return numsP('Solve the system to find the two numbers.', [{ label: 'Larger number' }, { label: 'Smaller number' }], [o.x, o.y],
              { names: ['larger number', 'smaller number'], sys: [[1, 1, -o.S], [o.a, -o.b, -o.k]], sysNames: ['the sum', 'the “more than” sentence'], swapHint: 'The <b>larger</b> number goes in the first box (check: which is bigger?).',
                wrong: [{ v: [xf, o.S - xf], code: 'more-than-side', hint: 'Check the second equation: “' + o.k + ' more than ' + TIMES[o.b] + ' the smaller” gives ' + t(o.a + 'x=' + o.b + 'y+' + o.k) + '.' }, { v: [o.x, -o.y], code: 'sign', hint: 'Check the sign of the smaller number — substitute both numbers back into the sum.' }] },
              t('x+y=' + o.S) + ' ⟹ ' + t('x=' + o.S + '-y') + '. Substitute: ' + t(o.a + '(' + o.S + '-y)=' + o.b + 'y+' + o.k) + ' ⟹ ' + t((o.a * o.S) + '-' + o.a + 'y=' + o.b + 'y+' + o.k) + ' ⟹ ' + t((-(o.a + o.b)) + 'y=' + (o.k - o.a * o.S)) + ' ⟹ ' + t('y=' + o.y) + ', so ' + t('x=' + o.x) + '.<br>' +
              chk('Check: ' + t(o.x + '+(' + o.y + ')=' + o.S)) + ', ' + chk(t(o.a + '(' + o.x + ')=' + o.a * o.x) + ' and ' + t(o.b + '(' + o.y + ')+' + o.k + '=' + (o.b * o.y + o.k))) + '<br><b>The numbers are ' + o.x + ' and ' + o.y + '.</b>',
              ['Solve the sum for ' + t('x') + ' and substitute into the second equation. One of the numbers may be negative.'], 'two numbers solve');
          } }] },
      /* ---------- 3 ---------- */
      { num: '3', shared: q3,
        stem: function (o) { return nw(o.a1).replace(/^./, function (c) { return c.toUpperCase(); }) + ' notebooks and ' + nw(o.b1) + ' folders cost ' + Dh(o.T1) + '. ' + cap(nw(o.a2)) + ' similar notebooks and ' + nw(o.b2) + ' similar folders cost ' + Dh(o.T2) + '. <b>Describe</b> a method to determine how much you would expect to pay for ' + nw(o.a3) + ' notebooks and ' + nw(o.b3) + ' folders, and then calculate the cost.'; },
        parts: [
          { id: '3a', sub: 'a', level: 'EMG', make: function (r, o) {
            return mc(r, 'Which method works?', [
              { html: 'Let ' + t('x') + ' and ' + t('y') + ' be the prices of one notebook and one folder. Write one equation for each purchase, solve the system, then evaluate ' + t(o.a3 + 'x+' + o.b3 + 'y') + '.', right: true },
              { html: 'Add the two purchases: ' + t(o.a1 + o.a2) + ' notebooks and ' + t(o.b1 + o.b2) + ' folders cost ' + Dh(o.T1 + o.T2) + '; then scale that total to the new order.', why: 'Adding the bills gives one bigger purchase with a different mix of notebooks and folders — you can’t scale it to ' + o.a3 + ' and ' + o.b3 + '. You need each price (or a purchase in the same ratio).' },
              { html: 'Find the average price of an item, ' + t('(' + mon(o.T1) + ')\\div ' + (o.a1 + o.b1)) + ', then multiply by ' + t(o.a3 + o.b3) + ' items.', why: 'Notebooks and folders have different prices, so an average price per item doesn’t work for a different mix.' },
              { html: 'Solve the single equation ' + t(o.a1 + 'x+' + o.b1 + 'y=' + mon(o.T1)) + ' for ' + t('x') + ', then evaluate ' + t(o.a3 + 'x+' + o.b3 + 'y') + '.', why: 'One equation in two unknowns has infinitely many solutions — you need both purchases (a system) to pin down both prices.' }],
              'Two unknown prices need two equations: one from each purchase. Solve the system, then evaluate ' + t(o.a3 + 'x+' + o.b3 + 'y') + '.<br>(Shortcut: ' + t('(' + o.a3 + ',' + o.b3 + ')') + ' is ' + t(frT(o.k, o.m)) + ' of ' + t('(' + o.a1 + ',' + o.b1 + ')') + ', so the cost is ' + t(frT(o.k, o.m)) + ' of ' + Dh(o.T1) + '.)',
              ['How many unknowns are there, and how many equations do you need?'], 'method for notebooks and folders');
          } },
          { id: '3b', sub: 'b', level: 'PRG', make: function (r, o) {
            var g = gcd(o.a1, o.b1);
            return numsP('Let ' + t('x') + ' be the price of one notebook and ' + t('y') + ' the price of one folder. Solve the system for both prices.', [money('Notebook'), money('Folder')], [o.n, o.f],
              { names: ['notebook price', 'folder price'], money: true, sys: [[o.a1, o.b1, -o.T1], [o.a2, o.b2, -o.T2]], sysNames: ['the first purchase', 'the second purchase'], swapHint: 'Right prices, wrong boxes — check which one is the notebook.' },
              t(o.a1 + 'x+' + o.b1 + 'y=' + mon(o.T1)) + ' and ' + t(o.a2 + 'x+' + o.b2 + 'y=' + mon(o.T2)) + '.<br>' + (g > 1 ? 'Divide the first by ' + t(g) + ': ' + t(cf(o.a1 / g, 'x') + '+' + cf(o.b1 / g, 'y') + '=' + m2(o.T1 / g)) + '. ' : '') +
              'Eliminate ' + t('x') + ': multiply the first by ' + t(o.a2) + ' and the second by ' + t(o.a1) + ', then subtract: ' + t((o.a1 * o.b2 - o.a2 * o.b1) + 'y=' + m2(o.a1 * o.T2 - o.a2 * o.T1)) + ' ⟹ ' + t('y=' + m2(o.f)) + '. Substitute back: ' + t('x=' + m2(o.n)) + '.<br>' + chk('Check: ' + t(o.a1 + '(' + m2(o.n) + ')+' + o.b1 + '(' + m2(o.f) + ')=' + m2(o.T1))) + ', ' + chk(t(o.a2 + '(' + m2(o.n) + ')+' + o.b2 + '(' + m2(o.f) + ')=' + m2(o.T2))) +
              '<br><b>A notebook costs ' + Dh(o.n) + ' and a folder costs ' + Dh(o.f) + '.</b>',
              ['One equation per purchase: ' + t(o.a1 + 'x+' + o.b1 + 'y=' + mon(o.T1)) + ' and ' + t(o.a2 + 'x+' + o.b2 + 'y=' + mon(o.T2)) + '.', 'Elimination works well: make the ' + t('x') + '-coefficients match.'], 'notebook and folder prices');
          } },
          { id: '3c', sub: 'c', level: 'PRG', make: function (r, o) {
            return numP('Calculate the cost of ' + nw(o.a3) + ' notebooks and ' + nw(o.b3) + ' folders.', o.T3, function (v) {
              if (near(v, (o.a3 * o.f + o.b3 * o.n))) return { code: 'swap-answer', hint: 'You attached the prices to the wrong items: ' + t(o.a3) + ' <b>notebooks</b> and ' + t(o.b3) + ' <b>folders</b>.' };
              if (near(v, o.T1 + o.T2)) return { code: 'added-bills', hint: 'That’s the two given bills added together. Find the price of each item first.' };
              return null;
            }, 'Prices (from the system ' + t(o.a1 + 'x+' + o.b1 + 'y=' + mon(o.T1)) + ', ' + t(o.a2 + 'x+' + o.b2 + 'y=' + mon(o.T2)) + '): notebook ' + Dh(o.n) + ', folder ' + Dh(o.f) + '.<br>' +
              t(o.a3 + '(' + m2(o.n) + ')+' + o.b3 + '(' + m2(o.f) + ')=' + m2(o.a3 * o.n) + '+' + m2(o.b3 * o.f) + '=' + m2(o.T3)) + '.<br><b>Shortcut:</b> ' + t(o.a3 + 'x+' + o.b3 + 'y=' + frT(o.k, o.m) + '(' + o.a1 + 'x+' + o.b1 + 'y)=' + frT(o.k, o.m) + '(' + mon(o.T1) + ')=' + m2(o.T3)) + ' — the new order is exactly ' + t(frT(o.k, o.m)) + ' of the first purchase.<br><b>The cost is ' + Dh(o.T3) + '.</b>',
              ['Find both prices from the system, then evaluate ' + t(o.a3 + 'x+' + o.b3 + 'y') + '.', 'Is ' + t('(' + o.a3 + ',' + o.b3 + ')') + ' a multiple of one of the purchases?'], 'cost of new order', { money: true, before: '$' });
          } }] },
      /* ---------- 4 ---------- */
      { num: '4', shared: q4,
        stem: function (o) { return 'The perimeter of a rectangle is ' + t(o.P + '\\text{ cm}') + '. If the length were doubled and the width halved, the perimeter would be increased by ' + t(o.I + '\\text{ cm}') + '. Find the dimensions of the original rectangle.'; },
        parts: [
          { id: '4a', sub: 'i', level: 'PRG', make: function (r, o) {
            var NP = o.P + o.I;
            return sysP('Let ' + t('l') + ' be the original length and ' + t('w') + ' the original width, in centimetres. Write a system of two equations.', [[2, 2, -o.P], [4, 1, -NP]],
              { vars: ['l', 'w'], keyTex: ['2l+2w=' + o.P, '2\\left(2l+\\frac{w}{2}\\right)=' + NP], names: ['the original perimeter', 'the new perimeter'],
                factHints: ['the original perimeter is ' + t('2l+2w') + '.', 'the new rectangle is ' + t('2l') + ' by ' + t('\\frac{w}{2}') + ', and its perimeter is ' + t(o.P + '+' + o.I + '=' + NP) + '.'],
                alts: [[], [[2, -1, -o.I]]],   // “increased by I”: new − old = I, i.e. 2(2l + w/2) − (2l + 2w) = I ⟹ 2l − w = I
                wrong: [{ eq: [2, 0.5, -NP], code: 'perim-half', hint: 'The new perimeter is <b>twice</b> (length + width): ' + t('2\\left(2l+\\frac{w}{2}\\right)') + '.' }, { eq: [4, 1, -o.I], code: 'increase-total', hint: 'The perimeter is <b>increased by</b> ' + t(o.I) + ', so the new perimeter is ' + t(o.P + '+' + o.I + '=' + NP) + '.' },
                  { eq: [1, 4, -NP], code: 'swap-change', hint: 'The <b>length</b> is doubled (' + t('2l') + ') and the <b>width</b> halved (' + t('\\frac{w}{2}') + ').' }, { eq: [1, 1, -o.P], code: 'perim-half', hint: 'The perimeter adds all four sides: ' + t('2l+2w=' + o.P) + '.' }],
                good: [['l+w=' + o.P / 2, '4l+w=' + NP], ['2l+2w=' + o.P, '2l-w=' + o.I]], bad: [['2l+2w=' + o.P, '4l+w=' + o.I], ['2l+2w=' + o.P, 'l+4w=' + NP]] },
              '<b>Original:</b> ' + t('2l+2w=' + o.P) + '.<br><b>New</b> (' + t('2l') + ' by ' + t('\\frac{w}{2}') + '): ' + t('2\\left(2l+\\frac{w}{2}\\right)=' + o.P + '+' + o.I) + ', i.e. ' + t('4l+w=' + NP) + '.',
              ['Write the new length and width first: ' + t('2l') + ' and ' + t('\\frac{w}{2}') + '. The new perimeter is ' + t(o.P + '+' + o.I) + '.'], 'doubled/halved rectangle system');
          } },
          { id: '4b', sub: 'ii', level: 'ADV', make: function (r, o) {
            var NP = o.P + o.I, li = (o.I - o.P / 2) / 3;
            return numsP('Find the dimensions of the original rectangle.', [{ label: 'Length', after: 'cm' }, { label: 'Width', after: 'cm' }], [o.l, o.w],
              { names: ['length', 'width'], sys: [[1, 1, -o.P / 2], [4, 1, -NP]], sysNames: ['the original perimeter', 'the new perimeter'],
                swapHint: 'Your two numbers are swapped — that is what you get if the width is doubled and the length halved. The <b>length</b> is doubled (' + t('2l') + ') and the <b>width</b> halved (' + t('\\frac{w}{2}') + '), so the new perimeter is ' + t('4l+w') + '.',
                wrong: [{ v: [li, o.P / 2 - li], code: 'increase-total', hint: 'The new perimeter is ' + t(o.P + '+' + o.I + '=' + NP) + ', not ' + t(o.I) + '.' }] },
              t('2l+2w=' + o.P) + ' ⟹ ' + t('l+w=' + o.P / 2) + '. New rectangle ' + t('2l') + ' by ' + t('\\frac{w}{2}') + ': ' + t('2\\left(2l+\\frac{w}{2}\\right)=' + NP) + ' ⟹ ' + t('4l+w=' + NP) + '.<br>Subtract: ' + t('3l=' + (NP - o.P / 2)) + ' ⟹ ' + t('l=' + o.l) + ', ' + t('w=' + o.P / 2 + '-' + o.l + '=' + o.w) + '.<br>' +
              chk('Check: ' + t('2(' + o.l + '+' + o.w + ')=' + o.P)) + '; new rectangle ' + t(2 * o.l + '\\times ' + o.w / 2) + ', ' + chk(t('P=2(' + (2 * o.l + o.w / 2) + ')=' + NP + '=' + o.P + '+' + o.I)) + '<br><b>The original rectangle is ' + o.l + ' cm by ' + o.w + ' cm.</b>',
              ['Original: ' + t('l+w=' + o.P / 2) + '. New: length ' + t('2l') + ', width ' + t('\\frac{w}{2}') + ', perimeter ' + t(o.P + '+' + o.I) + '.'], 'doubled/halved rectangle dimensions');
          } }] },
      /* ---------- 5 ---------- */
      { num: '5', shared: q5,
        stem: function (o) { return 'At a theatre, a main-floor seat costs ' + TIMES[o.k] + ' as much as a balcony seat. If ' + nw(o.p) + ' main-floor seats cost ' + Dh(o.D) + ' more than ' + nw(o.q) + ' balcony seats, find the cost of a main-floor seat.'; },
        parts: [
          { id: '5a', sub: 'i', level: 'EMG', make: function (r, o) {
            return sysP('Let ' + t('m') + ' be the cost of a main-floor seat and ' + t('b') + ' the cost of a balcony seat, in dollars. Write a system of two equations.', [[1, -o.k, 0], [o.p, -o.q, -o.D]],
              { vars: ['m', 'b'], keyTex: ['m=' + o.k + 'b', o.p + 'm=' + o.q + 'b+' + o.D], names: ['the price relationship', 'the “more than” sentence'],
                factHints: ['the main-floor seat is the dearer one: ' + t('m=' + o.k + 'b') + '.', t(o.p) + ' main-floor seats cost ' + t(o.p + 'm') + ', which is ' + t(o.D) + ' more than ' + t(o.q + 'b') + '.'],
                wrong: [{ eq: [o.k, -1, 0], code: 'ratio-flip', hint: 'The main-floor seat costs more, so the ' + t(o.k) + ' goes with ' + t('b') + ': ' + t('m=' + o.k + 'b') + '. Test: if a balcony seat is ' + Dh(10) + ', a main-floor seat is ' + Dh(10 * o.k) + '.' },
                  { eq: [o.p, -o.q, o.D], code: 'more-than-side', hint: '“' + o.D + ' more than ' + nw(o.q) + ' balcony seats” is ' + t(o.q + 'b+' + o.D) + ', so ' + t(o.p + 'm=' + o.q + 'b+' + o.D) + '.' }],
                bad: [['b=' + o.k + 'm', o.p + 'm=' + o.q + 'b+' + o.D], ['m=' + o.k + 'b', o.p + 'm+' + o.D + '=' + o.q + 'b']] },
              t('m=' + o.k + 'b') + ' (a main-floor seat costs ' + TIMES[o.k] + ' as much) and ' + t(o.p + 'm=' + o.q + 'b+' + o.D) + '.',
              ['Test your first equation with a made-up balcony price: the main-floor price should come out bigger.'], 'theatre seat system');
          } },
          { id: '5b', sub: 'ii', level: 'PRG', make: function (r, o) {
            return numP('Find the cost of a main-floor seat.', o.m, function (v) {
              if (v === o.b) return { code: 'answered-other', hint: 'That’s the <b>balcony</b> price. The question asks for a main-floor seat.' };
              return null;
            }, 'Let ' + t('m') + ' and ' + t('b') + ' be the prices in dollars: ' + t('m=' + o.k + 'b') + ' and ' + t(o.p + 'm=' + o.q + 'b+' + o.D) + '.<br>Substitute: ' + t(o.p + '(' + o.k + 'b)=' + o.q + 'b+' + o.D) + ' ⟹ ' + t(cf(o.p * o.k - o.q, 'b') + '=' + o.D) + ' ⟹ ' + t('b=' + o.b) + ', so ' + t('m=' + o.k + '(' + o.b + ')=' + o.m) + '.<br>' +
              chk('Check: ' + t(o.p + '(' + o.m + ')=' + o.p * o.m) + ' and ' + t(o.q + '(' + o.b + ')+' + o.D + '=' + (o.q * o.b + o.D))) + '<br><b>A main-floor seat costs ' + Dh(o.m) + '</b> (a balcony seat costs ' + Dh(o.b) + ').',
              ['Substitute ' + t('m=' + o.k + 'b') + ' into the second equation, solve for ' + t('b') + ', then find ' + t('m') + '.'], 'main-floor seat cost', { money: true, before: '$' });
          } }] },
      /* ---------- 6 ---------- */
      { num: '6', shared: q6,
        stem: function (o) { return o.name + ' has been saving ' + o.c.c1 + ' and ' + o.c.c2 + '. ' + (o.name === 'Priya' || o.name === 'Aiyana' || o.name === 'Mei' ? 'She' : 'He') + ' has ' + t(o.Nn) + ' coins in total, worth ' + Dh(o.V) + '. How many coins of each type ' + (o.name === 'Priya' || o.name === 'Aiyana' || o.name === 'Mei' ? 'does she' : 'does he') + ' have?'; },
        parts: [
          { id: '6a', sub: 'i', level: 'EMG', make: function (r, o) {
            var c = o.c, X = c.x, Y = c.y, d1 = pd(c.v1), d2 = pd(c.v2);
            return sysP('Let ' + t(X) + ' be the number of ' + c.c1 + ' and ' + t(Y) + ' the number of ' + c.c2 + '. Write a system of two equations.', [[1, 1, -o.Nn], [c.v1, c.v2, -Math.round(100 * o.V)]],
              { vars: [X, Y], keyTex: [X + '+' + Y + '=' + o.Nn, d1 + X + '+' + d2 + Y + '=' + m2(o.V)], names: ['the number of coins', 'the value of the coins'],
                factHints: ['one equation counts coins: ' + t(X + '+' + Y + '=' + o.Nn) + '.', 'the other totals value: each ' + c.s1 + ' is worth ' + Dh(c.v1 / 100) + ' and each ' + c.s2 + ' ' + Dh(c.v2 / 100) + '.'],
                wrong: [{ eq: [c.v1, c.v2, -o.V], code: 'units-mix', hint: 'Mixed units: ' + t(c.v1 + X + '+' + c.v2 + Y) + ' is in <b>cents</b> but ' + t(mon(o.V)) + ' is in dollars. Use ' + t(d1 + X + '+' + d2 + Y + '=' + m2(o.V)) + ' (or ' + t(c.v1 + X + '+' + c.v2 + Y + '=' + Math.round(100 * o.V)) + ' cents).' },
                  { eq: [1, 1, -o.V], code: 'count-value', hint: t(X + '+' + Y) + ' counts coins, so it equals the number of coins, ' + t(o.Nn) + ' — not their value.' },
                  { eq: [c.v2, c.v1, -Math.round(100 * o.V)], code: 'value-swap', hint: 'Each ' + c.s1 + ' is worth ' + Dh(c.v1 / 100) + ', so the ' + c.c1 + ' are worth ' + t(d1 + X) + '.' },
                  { eq: [c.v1, c.v2, -100 * o.Nn], code: 'count-value', hint: 'The value equation equals the <b>value</b>, ' + Dh(o.V) + ', not the number of coins.' }],
                good: [[X + '+' + Y + '=' + o.Nn, c.v1 + X + '+' + c.v2 + Y + '=' + Math.round(100 * o.V)]], bad: [[X + '+' + Y + '=' + o.Nn, c.v1 + X + '+' + c.v2 + Y + '=' + m2(o.V)], [X + '+' + Y + '=' + m2(o.V), d1 + X + '+' + d2 + Y + '=' + o.Nn]] },
              '<b>Count:</b> ' + t(X + '+' + Y + '=' + o.Nn) + '. <b>Value</b> (dollars): ' + t(d1 + X + '+' + d2 + Y + '=' + m2(o.V)) + '.',
              ['One equation counts coins, the other totals their value. Keep the value equation in one unit (all dollars or all cents).'], 'coins system');
          } },
          { id: '6b', sub: 'ii', level: 'EMG', make: function (r, o) {
            var c = o.c, X = c.x, Y = c.y, d1 = pd(c.v1), d2 = pd(c.v2), dv = pd(c.v2 - c.v1);
            return numsP('Solve the system. How many coins of each type are there?', [{ label: cap(c.c1) }, { label: cap(c.c2) }], [o.n, o.q],
              { names: ['number of ' + c.c1, 'number of ' + c.c2], sys: [[1, 1, -o.Nn], [c.v1, c.v2, -Math.round(100 * o.V)]], sysNames: ['the number of coins', 'the value'] },
              t(X + '+' + Y + '=' + o.Nn) + ' and ' + t(d1 + X + '+' + d2 + Y + '=' + m2(o.V)) + '.<br>' + t(X + '=' + o.Nn + '-' + Y) + ': ' + t(d1 + '(' + o.Nn + '-' + Y + ')+' + d2 + Y + '=' + m2(o.V)) + ' ⟹ ' + t(m2(c.v1 * o.Nn / 100) + '+' + dv + Y + '=' + m2(o.V)) + ' ⟹ ' + t(Y + '=' + o.q) + ', ' + t(X + '=' + o.n) + '.<br>' +
              chk('Check: ' + t(o.n + '+' + o.q + '=' + o.Nn)) + ', ' + chk(t(d1 + '(' + o.n + ')+' + d2 + '(' + o.q + ')=' + m2(o.V))) + '<br><b>' + o.name + ' has ' + o.n + ' ' + c.c1 + ' and ' + o.q + ' ' + c.c2 + '.</b>',
              ['Solve the count equation for one variable and substitute into the value equation. (Multiplying the value equation by ' + t(100) + ' clears the decimals.)'], 'coins solve');
          } }] },
      /* ---------- 7 ---------- */
      { num: '7', shared: q7,
        stem: function (o) { return 'One year, a woman’s savings (income − expenditure) were ' + Dh(o.S1) + '. The next year her income increased by ' + t(o.p + '\\%') + ' and her expenditure decreased by ' + t(o.q + '\\%') + ', allowing her to save ' + Dh(o.S2) + '. Determine her income in the first year.'; },
        parts: [
          { id: '7a', sub: 'i', level: 'PRG', make: function (r, o) {
            var ci = pd(100 + o.p), ce = pd(100 - o.q);
            return sysP('Let ' + t('I') + ' be her income and ' + t('E') + ' her expenditure in the first year, in dollars. Write a system of two equations.', [[1, -1, -o.S1], [100 + o.p, -(100 - o.q), -100 * o.S2]],
              { vars: ['I', 'E'], keyTex: ['I-E=' + o.S1, ci + 'I-' + ce + 'E=' + o.S2], showTex: ['I-E=' + N(o.S1), ci + 'I-' + ce + 'E=' + N(o.S2)], names: ['the first year', 'the second year'],
                factHints: ['savings = income − expenditure: ' + t('I-E=' + N(o.S1)) + '.', 'the new income is ' + t(ci + 'I') + ' (up ' + o.p + '%) and the new expenditure ' + t(ce + 'E') + ' (down ' + o.q + '%).'],
                alts: [[], [[o.p, o.q, -100 * (o.S2 - o.S1)]]],   // the rise in savings: 0.10I + 0.15E = S2 − S1
                wrong: [{ eq: [o.p, -o.q, -100 * o.S2], code: 'pct-change-only', hint: 'An increase of ' + o.p + '% makes the income ' + t('I+' + pd(o.p) + 'I=' + ci + 'I') + ', not ' + t(pd(o.p) + 'I') + '. The same goes for the expenditure.' },
                  { eq: [100 + o.p, -(100 + o.q), -100 * o.S2], code: 'pct-direction', hint: 'The expenditure <b>decreased</b> by ' + o.q + '%, so it becomes ' + t(ce + 'E') + '.' },
                  { eq: [100 - o.p, -(100 - o.q), -100 * o.S2], code: 'pct-direction', hint: 'The income <b>increased</b> by ' + o.p + '%, so it becomes ' + t(ci + 'I') + '.' }],
                bad: [['I-E=' + o.S1, pd(o.p) + 'I-' + pd(o.q) + 'E=' + o.S2]] },
              '<b>First year:</b> ' + t('I-E=' + N(o.S1)) + '.<br><b>Second year:</b> income ' + t(ci + 'I') + ', expenditure ' + t(ce + 'E') + ': ' + t(ci + 'I-' + ce + 'E=' + N(o.S2)) + '.',
              ['An increase of ' + o.p + '% multiplies by ' + t(ci) + '; a decrease of ' + o.q + '% multiplies by ' + t(ce) + '.'], 'income/expenditure system');
          } },
          { id: '7b', sub: 'ii', level: 'ADV', make: function (r, o) {
            var ci = pd(100 + o.p), ce = pd(100 - o.q), k = (o.p + o.q) / 100;
            return numP('Determine her income in the first year.', o.I, function (v) {
              if (v === o.E) return { code: 'answered-other', hint: 'That’s her <b>expenditure</b> in the first year. The question asks for her income.' };
              if (near(v, (100 + o.p) * o.I / 100)) return { code: 'answered-other', hint: 'That’s her income in the <b>second</b> year. The question asks for the first year.' };
              return null;
            }, 'Let ' + t('I') + ' and ' + t('E') + ' be the first-year income and expenditure: ' + t('I-E=' + N(o.S1)) + ' and ' + t(ci + 'I-' + ce + 'E=' + N(o.S2)) + '.<br>' + t('I=E+' + N(o.S1)) + ': ' + t(ci + '(E+' + N(o.S1) + ')-' + ce + 'E=' + N(o.S2)) + ' ⟹ ' + t(pd(o.p + o.q) + 'E=' + N(o.S2 - (100 + o.p) * o.S1 / 100)) + ' ⟹ ' + t('E=' + N(o.E)) + ', so ' + t('I=' + N(o.I)) + '.<br>' +
              chk('Check: ' + t(N(o.I) + '-' + N(o.E) + '=' + N(o.S1))) + ', ' + chk(t(ci + '(' + N(o.I) + ')-' + ce + '(' + N(o.E) + ')=' + N((100 + o.p) * o.I / 100) + '-' + N((100 - o.q) * o.E / 100) + '=' + N(o.S2))) + '<br><b>Her income in the first year was ' + Dh(o.I) + '.</b>',
              ['Write the second-year savings with ' + t(ci + 'I') + ' and ' + t(ce + 'E') + ', then substitute ' + t('I=E+' + N(o.S1)) + '.'], 'first-year income', { money: true, before: '$' });
          } }] },
      /* ---------- 8 ---------- */
      { num: '8', shared: q8,
        stem: function (o) { return 'Priya invested ' + t('\\dfrac{' + o.a + '}{' + o.b + '}') + ' of her ' + Dh(o.H) + ' inheritance in two mutual funds. By the end of the year, the <i>Growth Fund</i> had gained ' + t(o.g + '\\%') + ' and the <i>Bond Fund</i> had lost ' + t(o.l + '\\%') + '. If the combined value of her investments increased by ' + Dh(o.net) + ', determine the amount invested in each fund.'; },
        parts: [
          { id: '8a', sub: 'i', level: 'BEG', make: function (r, o) {
            return numP('How much did Priya invest in the two funds altogether?', o.T, function (v) {
              if (v === o.H) return { code: 'used-whole', hint: 'She invested only ' + t('\\frac{' + o.a + '}{' + o.b + '}') + ' of the inheritance, not all of it.' };
              if (v === o.H - o.T) return { code: 'remainder', hint: 'That’s the part she did <b>not</b> invest. Find ' + t('\\frac{' + o.a + '}{' + o.b + '}') + ' of ' + Dh(o.H) + '.' };
              return null;
            }, t('\\frac{' + o.a + '}{' + o.b + '}\\times ' + N(o.H) + '=' + N(o.T)) + '. <b>She invested ' + Dh(o.T) + '.</b>', ['“' + o.a + '/' + o.b + ' of” means multiply: ' + t('\\frac{' + o.a + '}{' + o.b + '}\\times ' + N(o.H)) + '.'], 'fraction of inheritance', { money: true, before: '$' });
          } },
          { id: '8b', sub: 'ii', level: 'PRG', make: function (r, o) {
            return sysP('Let ' + t('g') + ' be the amount in the Growth Fund and ' + t('b') + ' the amount in the Bond Fund, in dollars. Write a system of two equations.', [[1, 1, -o.T], [o.g, -o.l, -100 * o.net]],
              { vars: ['g', 'b'], keyTex: ['g+b=' + o.T, pd(o.g) + 'g-' + pd(o.l) + 'b=' + o.net], showTex: ['g+b=' + N(o.T), pd(o.g) + 'g-' + pd(o.l) + 'b=' + N(o.net)], names: ['the amount invested', 'the change in value'],
                factHints: ['the two amounts add to the ' + Dh(o.T) + ' invested.', 'the gain is ' + t(pd(o.g) + 'g') + ' and the loss is ' + t(pd(o.l) + 'b') + '; gain − loss = ' + Dh(o.net) + '.'],
                alts: [[], [[100 + o.g, 100 - o.l, -100 * (o.T + o.net)]]],
                wrong: [{ eq: [o.g, o.l, -100 * o.net], code: 'loss-sign', hint: 'The Bond Fund <b>lost</b> ' + o.l + '%, so its change is ' + t('-' + pd(o.l) + 'b') + '.' }, { eq: [1, 1, -o.H], code: 'used-whole', hint: 'She invested only ' + t('\\frac{' + o.a + '}{' + o.b + '}') + ' of the inheritance: ' + Dh(o.T) + '.' },
                  { eq: [o.g, -o.l, -o.net], code: 'pct-decimal', hint: 'Change the percents to decimals: ' + t(o.g + '\\%=' + pd(o.g)) + ' and ' + t(o.l + '\\%=' + pd(o.l)) + '.' }],
                good: [['g+b=' + o.T, pd(100 + o.g) + 'g+' + pd(100 - o.l) + 'b=' + (o.T + o.net)]], bad: [['g+b=' + o.T, pd(o.g) + 'g+' + pd(o.l) + 'b=' + o.net], ['g+b=' + o.H, pd(o.g) + 'g-' + pd(o.l) + 'b=' + o.net]] },
              '<b>Principal:</b> ' + t('g+b=' + N(o.T)) + ' (' + t('\\frac{' + o.a + '}{' + o.b + '}') + ' of ' + Dh(o.H) + ').<br><b>Change in value:</b> ' + t(pd(o.g) + 'g-' + pd(o.l) + 'b=' + N(o.net)) + ' (a gain on ' + t('g') + ', a loss on ' + t('b') + ').',
              ['First find how much she invested: ' + t('\\frac{' + o.a + '}{' + o.b + '}') + ' of ' + Dh(o.H) + '.', 'A gain adds and a loss subtracts.'], 'mutual funds system');
          } },
          { id: '8c', sub: 'iii', level: 'PRG', make: function (r, o) {
            var Ts = [[1, 1, -o.T], [o.g, -o.l, -100 * o.net]], w1 = solve2([1, 1, -o.T], [o.g, o.l, -100 * o.net]), w2 = solve2([1, 1, -o.H], [o.g, -o.l, -100 * o.net]);
            return numsP('Determine the amount invested in each fund.', [money('Growth Fund'), money('Bond Fund')], [o.G, o.B],
              { names: ['Growth Fund amount', 'Bond Fund amount'], money: true, sys: Ts, sysNames: ['the total invested', 'the change in value'],
                wrong: [{ v: w1, code: 'loss-sign', hint: 'The Bond Fund <b>lost</b> ' + o.l + '%: the change in value is ' + t(pd(o.g) + 'g-' + pd(o.l) + 'b') + '.' }, { v: w2, code: 'used-whole', hint: 'She invested only ' + t('\\frac{' + o.a + '}{' + o.b + '}') + ' of the inheritance, ' + Dh(o.T) + '.' }] },
              'Invested: ' + t('\\frac{' + o.a + '}{' + o.b + '}(' + N(o.H) + ')=' + N(o.T)) + '. ' + t('g+b=' + N(o.T)) + ', ' + t(pd(o.g) + 'g-' + pd(o.l) + 'b=' + N(o.net)) + '.<br>' + t('b=' + N(o.T) + '-g') + ': ' + t(pd(o.g) + 'g-' + pd(o.l) + '(' + N(o.T) + '-g)=' + N(o.net)) + ' ⟹ ' + t(pd(o.g + o.l) + 'g=' + N(o.net + o.l * o.T / 100)) + ' ⟹ ' + t('g=' + N(o.G)) + ', ' + t('b=' + N(o.B)) + '.<br>' +
              chk('Check: ' + t(N(o.G) + '+' + N(o.B) + '=' + N(o.T))) + ', ' + chk(t(N(o.g * o.G / 100) + '-' + N(o.l * o.B / 100) + '=' + N(o.net))) + '<br><b>Priya invested ' + Dh(o.G) + ' in the Growth Fund and ' + Dh(o.B) + ' in the Bond Fund.</b>',
              ['Total invested first (' + t('\\frac{' + o.a + '}{' + o.b + '}') + ' of the inheritance). Then: amounts add to that total; gain − loss = ' + Dh(o.net) + '.'], 'mutual funds amounts');
          } }] },
      /* ---------- 9 ---------- */
      { num: '9', shared: q9,
        stem: function (o) { return 'Ken invested ' + Dh(o.T) + ', part at ' + t(o.r1 + '\\%') + ' interest and part at ' + t(o.r2 + '\\%') + ' interest. The interest earned from the ' + t(o.r2 + '\\%') + ' portion was half of the interest earned from the ' + t(o.r1 + '\\%') + ' portion. How much was invested at each rate?'; },
        parts: [
          { id: '9a', sub: 'i', level: 'PRG', make: function (r, o) {
            var A = pd(o.r1), B = pd(o.r2);
            return sysP('Let ' + t('a') + ' be the amount invested at ' + t(o.r1 + '\\%') + ' and ' + t('b') + ' the amount at ' + t(o.r2 + '\\%') + ', in dollars. Write a system of two equations.', [[1, 1, -o.T], [-o.r1, 2 * o.r2, 0]],
              { vars: ['a', 'b'], keyTex: ['a+b=' + o.T, B + 'b=\\frac{1}{2}(' + A + 'a)'], showTex: ['a+b=' + N(o.T), B + 'b=\\frac{1}{2}(' + A + 'a)'], names: ['the total invested', 'the interest relationship'],
                factHints: ['the two amounts add to ' + Dh(o.T) + '.', 'the interest from the ' + o.r2 + '% part is ' + t(B + 'b') + ', and it is half of ' + t(A + 'a') + '.'],
                wrong: [{ eq: [-2 * o.r1, o.r2, 0], code: 'half-flip', hint: 'The <b>' + o.r2 + '%</b> interest is the smaller one — it is half of the ' + o.r1 + '% interest: ' + t(B + 'b=\\frac{1}{2}(' + A + 'a)') + '.' },
                  { eq: [-1, 2, 0], code: 'amount-not-interest', hint: 'The sentence compares the <b>interest</b> earned, not the amounts invested: ' + t(B + 'b') + ' and ' + t(A + 'a') + '.' },
                  { eq: [o.r1, o.r2, -100 * o.T], code: 'amount-not-interest', hint: 'There is no total interest given. The second fact compares the two interests: ' + t(B + 'b=\\frac{1}{2}(' + A + 'a)') + '.' }],
                bad: [['a+b=' + o.T, B + 'b=2(' + A + 'a)'], ['a+b=' + o.T, 'b=\\frac{1}{2}a']] },
              '<b>Principal:</b> ' + t('a+b=' + N(o.T)) + '.<br><b>Interest:</b> ' + t(B + 'b=\\frac{1}{2}(' + A + 'a)') + ', i.e. ' + t(B + 'b=' + pd(o.r1 / 2) + 'a') + '.',
              ['Interest = rate × amount. Which interest is the smaller one (the “half”)?'], 'interest half system');
          } },
          { id: '9b', sub: 'ii', level: 'PRG', make: function (r, o) {
            var A = pd(o.r1), B = pd(o.r2), w1 = solve2([1, 1, -o.T], [-2 * o.r1, o.r2, 0]), w2 = [2 * o.T / 3, o.T / 3], kk = o.r1 / (2 * o.r2);
            return numsP('How much was invested at each rate?', [{ label: 'At ' + o.r1 + '%', before: '$' }, { label: 'At ' + o.r2 + '%', before: '$' }], [o.a, o.b],
              { names: ['amount at ' + o.r1 + '%', 'amount at ' + o.r2 + '%'], money: true, sys: [[1, 1, -o.T], [-o.r1, 2 * o.r2, 0]], sysNames: ['the total', 'the interest relationship'],
                wrong: [{ v: w1, code: 'half-flip', hint: 'Check which interest is half of which: the <b>' + o.r2 + '%</b> interest is half of the ' + o.r1 + '% interest.' }, { v: w2, code: 'amount-not-interest', hint: 'The sentence compares the <b>interest</b> (' + t(B + 'b') + ' and ' + t(A + 'a') + '), not the amounts.' }] },
              t('a+b=' + N(o.T)) + ' and ' + t(B + 'b=\\frac{1}{2}(' + A + 'a)=' + pd(o.r1 / 2) + 'a') + ', so ' + t('b=' + rnd(kk) + 'a') + '.<br>' + t('a+' + rnd(kk) + 'a=' + N(o.T)) + ' ⟹ ' + t(rnd(1 + kk) + 'a=' + N(o.T)) + ' ⟹ ' + t('a=' + N(o.a)) + ', ' + t('b=' + N(o.b)) + '.<br>' +
              chk('Check: ' + t(N(o.a) + '+' + N(o.b) + '=' + N(o.T))) + '; ' + chk(t(B + '(' + N(o.b) + ')=' + N(o.r2 * o.b / 100)) + ' and ' + t('\\frac{1}{2}(' + A + ')(' + N(o.a) + ')=' + N(o.r1 * o.a / 200))) + '<br><b>Ken invested ' + Dh(o.a) + ' at ' + o.r1 + '% and ' + Dh(o.b) + ' at ' + o.r2 + '%.</b>',
              ['Write ' + t(B + 'b=\\frac{1}{2}(' + A + 'a)') + ', solve it for ' + t('b') + ' and substitute into ' + t('a+b=' + N(o.T)) + '.'], 'interest half amounts');
          } }] },
      /* ---------- 10 ---------- */
      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'EMG', make: function (r) {
          var o = gen(function () { var Nn = 10 * r.int(15, 40), p1 = r.int(4, 8), p2 = p1 + r.int(2, 6), s = r.int(Math.ceil(Nn * 0.3), Math.floor(Nn * 0.7)), a = Nn - s; if (s === a) return null; return { Nn: Nn, p1: p1, p2: p2, s: s, a: a, T: p1 * s + p2 * a }; }, { Nn: 300, p1: 6, p2: 10, s: 190, a: 110, T: 2240 });
          var sys = function (e1, e2) { return t(e1) + ', ' + t(e2); };
          return mc(r, 'A school sold ' + t(o.Nn) + ' tickets to a concert. Student tickets cost ' + Dh(o.p1) + ' and adult tickets cost ' + Dh(o.p2) + ', and the ticket sales totalled ' + Dh(o.T) + '. If ' + t('s') + ' is the number of student tickets and ' + t('a') + ' the number of adult tickets, which system models the situation?', [
            { html: sys('s+a=' + o.Nn, o.p1 + 's+' + o.p2 + 'a=' + N(o.T)), right: true },
            { html: sys('s+a=' + N(o.T), o.p1 + 's+' + o.p2 + 'a=' + o.Nn), why: 'This swaps the count and the value: ' + t('s+a') + ' counts <b>tickets</b> (' + o.Nn + '), and the prices times the counts give the <b>money</b> (' + Dh(o.T) + ').' },
            { html: sys('s+a=' + o.Nn, o.p2 + 's+' + o.p1 + 'a=' + N(o.T)), why: 'Each price must go with its own ticket: student tickets are ' + Dh(o.p1) + ', so the students bring in ' + t(o.p1 + 's') + '.' },
            { html: sys('s+a=' + (o.p1 + o.p2), o.p1 + 's+' + o.p2 + 'a=' + N(o.T)), why: t('s+a') + ' is the number of tickets sold (' + o.Nn + '), not the sum of the two prices.' }],
            'One equation <b>counts</b> tickets: ' + t('s+a=' + o.Nn) + '. The other totals their <b>value</b> in dollars: ' + t(o.p1 + 's+' + o.p2 + 'a=' + N(o.T)) + '. (Solving gives ' + t('s=' + o.s) + ', ' + t('a=' + o.a) + '.)',
            ['Which equation should count tickets, and which should total money?'], 'which system models tickets');
        } }] },
      /* ---------- 11 ---------- */
      { num: '11', shared: function (r) {
          return gen(function () {
            var r1 = r.pick([15, 20, 25, 30]), r2 = r1 + r.pick([5, 10, 15]), T = 2 * r.int(6, 10), o = 2 * r.int(2, T / 2 - 2), n = T - o, o2 = 2 * r.int(1, o / 2 - 1), B = r1 * o + r2 * n;
            if (o2 >= o || o2 < 2) return null;
            var xi = B / r1; if (xi > 26) return null;
            return { r1: r1, r2: r2, T: T, o: o, n: n, o2: o2, n2: T - o2, B: B, B2: r1 * o2 + r2 * (T - o2), xmax: Math.min(26, 2 * Math.ceil((xi + 1) / 2)), ymax: T + 2 };
          }, { r1: 25, r2: 35, T: 18, o: 8, n: 10, o2: 4, n2: 14, B: 550, B2: 590, xmax: 24, ymax: 20 });
        },
        stem: function (o) { return 'The graph shows a system for a factory: an older machine packs ' + t(o.r1) + ' boxes per hour and a newer machine ' + t(o.r2) + ' boxes per hour; ' + t('o') + ' and ' + t('n') + ' are the hours each one ran. Line ' + t('P') + ' is ' + t('o+n=' + o.T) + ' and line ' + t('Q') + ' is ' + t(o.r1 + 'o+' + o.r2 + 'n=' + o.B) + '.' + machineGraph(o); },
        parts: [
          { id: '11a', sub: 'a', level: 'LIM', make: function (r, o) {
            return mc(r, 'Which line shows the total <b>time</b> and which the total <b>output</b>?', [
              { html: t('P') + ' shows the time (it adds hours); ' + t('Q') + ' shows the output (it adds boxes).', right: true },
              { html: t('P') + ' shows the output and ' + t('Q') + ' shows the time.', why: t('o+n') + ' adds two numbers of <b>hours</b>, so ' + t('P') + ' is the time. ' + t(o.r1 + 'o') + ' is boxes per hour × hours = boxes.' },
              { html: 'Both lines show the time, because ' + t('o') + ' and ' + t('n') + ' are hours.', why: 'In ' + t(o.r1 + 'o+' + o.r2 + 'n') + ' each term is (boxes per hour) × (hours) = <b>boxes</b>, so ' + t('Q') + ' totals the output.' },
              { html: t('Q') + ' shows the time because ' + t(o.r1) + ' and ' + t(o.r2) + ' are the times.', why: t(o.r1) + ' and ' + t(o.r2) + ' are <b>rates</b> (boxes per hour), not times.' }],
            'Line ' + t('P') + ', ' + t('o+n=' + o.T) + ', adds hours: total <b>time</b>. Line ' + t('Q') + ', ' + t(o.r1 + 'o+' + o.r2 + 'n=' + o.B) + ', adds boxes (rate × time): total <b>output</b>.', ['Look at the units of each term.'], 'time line vs output line');
          } },
          { id: '11b', sub: 'b', level: 'BEG', make: function (r, o) {
            return mc(r, 'What does the point ' + t('(' + o.o + ',\\ ' + o.n + ')') + ' mean in this context?', [
              { html: 'The older machine ran ' + o.o + ' h and the newer ' + o.n + ' h: ' + o.T + ' h in total <b>and</b> ' + o.B + ' boxes. Both conditions hold — it is the solution.', right: true },
              { html: 'The older machine packed ' + o.o + ' boxes and the newer one packed ' + o.n + ' boxes.', why: t('o') + ' and ' + t('n') + ' are <b>hours</b>. In ' + o.o + ' h the older machine packs ' + t(o.r1 + '(' + o.o + ')=' + o.r1 * o.o) + ' boxes.' },
              { html: 'The machines ran ' + o.o + ' h and ' + o.n + ' h, which satisfies the time condition only.', why: 'The point is on <b>both</b> lines: ' + t(o.r1 + '(' + o.o + ')+' + o.r2 + '(' + o.n + ')=' + o.B) + ' boxes too.' },
              { html: 'Each machine ran ' + o.T + ' hours.', why: 'The two times add to ' + o.T + ' h: ' + t(o.o + '+' + o.n + '=' + o.T) + '.' }],
            'The point is on both lines: ' + t(o.o + '+' + o.n + '=' + o.T) + ' h and ' + t(o.r1 + '(' + o.o + ')+' + o.r2 + '(' + o.n + ')=' + o.B) + ' boxes. The older machine ran <b>' + o.o + ' h</b> and the newer <b>' + o.n + ' h</b>; it is the solution of the system.', ['Check the point in both equations, and remember what ' + t('o') + ' and ' + t('n') + ' stand for.'], 'meaning of intersection');
          } },
          { id: '11c', sub: 'c', level: 'EMG', make: function (r, o) {
            return mc(r, 'The point ' + t('(' + o.o2 + ',\\ ' + o.n2 + ')') + ' lies on line ' + t('P') + ' only. What does it mean, and why is it not the solution?', [
              { html: 'Running ' + o.o2 + ' h and ' + o.n2 + ' h gives ' + o.T + ' h in total, but ' + t(o.r1 + '(' + o.o2 + ')+' + o.r2 + '(' + o.n2 + ')=' + o.B2) + ' boxes, not ' + o.B + '. Only the time condition holds.', right: true },
              { html: 'It is another solution, because it lies on one of the two lines.', why: 'A solution of a system must satisfy <b>both</b> equations: this point is not on line ' + t('Q') + '.' },
              { html: 'It packs ' + o.B + ' boxes but the machines run ' + (o.o2 + o.n2 + 2) + ' h, so only the output condition holds.', why: 'It is on line ' + t('P') + ': ' + t(o.o2 + '+' + o.n2 + '=' + o.T) + ' h. It is the <b>output</b> that is wrong.' },
              { html: 'It means the newer machine packed ' + o.n2 + ' boxes, which is too few.', why: t(o.n2) + ' is the number of <b>hours</b> the newer machine ran.' }],
            t(o.o2 + '+' + o.n2 + '=' + o.T) + ' ✓ (time), but ' + t(o.r1 + '(' + o.o2 + ')+' + o.r2 + '(' + o.n2 + ')=' + (o.r1 * o.o2) + '+' + (o.r2 * o.n2) + '=' + o.B2 + '\\ne ' + o.B) + ' (output). It satisfies the time condition only, so it is not the solution.', ['Substitute the point into the output equation.'], 'point on one line only');
          } }] },
      /* ---------- 12 ---------- */
      { num: '12', shared: function (r) {
          return gen(function () {
            var p1 = r.int(9, 15), df = r.pick([5, 5, 4]), p2 = p1 - df, Nn = r.int(30, 60), a0 = r.int(Math.ceil(Nn / 3), Math.floor(2 * Nn / 3)), dl = df === 4 ? r.pick([1, 3]) : r.int(1, 4);
            if (p2 < 4) return null;
            var a = a0 + dl / df; return { p1: p1, p2: p2, df: df, Nn: Nn, a: a, c: Nn - a, T: p1 * a0 + p2 * (Nn - a0) + dl, a0: a0 };
          }, { p1: 12, p2: 7, df: 5, Nn: 40, a: 22.6, c: 17.4, T: 393, a0: 22 });
        },
        stem: function (o) { return 'A theatre clerk reports that ' + t(o.Nn) + ' tickets were sold — adult tickets at ' + Dh(o.p1) + ' and child tickets at ' + Dh(o.p2) + ' — for a total of ' + Dh(o.T) + '. Let ' + t('a') + ' be the number of adult tickets and ' + t('c') + ' the number of child tickets.'; },
        parts: [
          { id: '12a', sub: 'a', level: 'PRG', make: function (r, o) {
            var p = numsP('Set up and solve the system. Give the exact values of ' + t('a') + ' and ' + t('c') + '.', [{ label: 'Adult, ' + t('a') }, { label: 'Child, ' + t('c') }], [o.a, o.c],
              { names: ['value of a', 'value of c'], sys: [[1, 1, -o.Nn], [o.p1, o.p2, -o.T]], sysNames: ['the number of tickets', 'the total value'] },
              t('a+c=' + o.Nn) + ', ' + t(o.p1 + 'a+' + o.p2 + 'c=' + o.T) + '.<br>' + t('c=' + o.Nn + '-a') + ': ' + t(o.p1 + 'a+' + (o.p2 * o.Nn) + '-' + o.p2 + 'a=' + o.T) + ' ⟹ ' + t(o.df + 'a=' + (o.T - o.p2 * o.Nn)) + ' ⟹ ' + t('a=' + rnd(o.a)) + ', ' + t('c=' + rnd(o.c)) + '.<br>' +
              chk('Check: ' + t(rnd(o.a) + '+' + rnd(o.c) + '=' + o.Nn)) + ', ' + chk(t(o.p1 + '(' + rnd(o.a) + ')+' + o.p2 + '(' + rnd(o.c) + ')=' + o.T)) + ' — the equations are satisfied, but the counts are not whole numbers.',
              ['Count equation: ' + t('a+c=' + o.Nn) + '. Money equation: ' + t(o.p1 + 'a+' + o.p2 + 'c=' + o.T) + '. Don’t round the answer.'], 'clerk report solve');
            p.check = (function (c) { return function (resp) { var res = c(resp); if (res.v !== 'correct') { var v = (resp || []).map(function (s) { var q = HW.parse.number(String(s || '').replace(/\$/g, '')); return q.ok ? q.value : NaN; }); if (Number.isInteger(v[0]) && Number.isInteger(v[1]) && Math.abs(v[0] - o.a) < 1 && Math.abs(v[1] - o.c) < 1) return form('rounded-count', 'Don’t round yet — give the exact solution of the system. Deciding whether it makes sense is the next step.'); } return res; }; })(p.check);
            p.bad.push([String(Math.round(o.a)), String(Math.round(o.c))]);
            return p;
          } },
          { id: '12b', sub: 'b', level: 'EMG', make: function (r, o) {
            var ra = Math.round(o.a), rc = o.Nn - ra, rv = o.p1 * ra + o.p2 * rc;
            return mc(r, 'Solving gives ' + t('a=' + rnd(o.a)) + ' and ' + t('c=' + rnd(o.c)) + '. Does the answer make sense? What can you conclude about the clerk’s report?', [
              { html: 'No — numbers of tickets must be whole numbers, so the report must contain an error (in the count or in the total).', right: true },
              { html: 'Yes — both equations check, so the report is correct.', why: 'The equations check, but the <b>words</b> fail: you can’t sell ' + rnd(o.a) + ' tickets.' },
              { html: 'Round: the clerk sold ' + ra + ' adult and ' + rc + ' child tickets.', why: 'Test it: ' + t(o.p1 + '(' + ra + ')+' + o.p2 + '(' + rc + ')=' + rv) + ', not ' + t(o.T) + '. No whole-number counts give the reported total.' },
              { html: 'No — the clerk should have sold more child tickets than adult tickets.', why: 'Nothing in the story says which kind sold more. The problem is that the counts are not whole.' }],
            'The system is solved correctly (' + t('a=' + rnd(o.a)) + ', ' + t('c=' + rnd(o.c)) + ') and both equations check, but tickets come in whole numbers. Step 4 fails, so <b>the clerk’s report must contain an error</b>.', ['Check the answer against the <b>words</b>, not just the equations.'], 'clerk report conclusion');
          } }] },
      /* ---------- 13 ---------- */
      { num: '13', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '13', level: 'PRG', make: function (r) {
          var o = gen(function () { var ab = r.pick([[2, 4], [2, 4], [1, 5], [3, 3], [2, 3], [1, 4], [3, 6], [2, 7], [4, 5], [1, 2], [2, 10], [4, 2]]), a = ab[0], b = ab[1], x = 180 / (a + b); if (!Number.isInteger(x)) return null; var y = r.int(2, 30), A = a * x - y; if (A < 25 || A > 80) return null; return { a: a, b: b, x: x, y: y, A: A }; }, { a: 2, b: 4, x: 30, y: 12, A: 48 });
          var e1 = (o.a === 1 ? '' : o.a) + 'x − y', e2 = (o.b === 1 ? '' : o.b) + 'x + y', E1 = (o.a === 1 ? '' : o.a) + 'x-y', E2 = (o.b === 1 ? '' : o.b) + 'x+y';
          return K.P.nr('In the diagram, two parallel lines are cut by a transversal. The angle marked ' + t(o.A + '^\\circ') + ' and the angle marked ' + t('(' + E1 + ')^\\circ') + ' are corresponding angles (so they are equal), and the angles marked ' + t('(' + E1 + ')^\\circ') + ' and ' + t('(' + E2 + ')^\\circ') + ' lie on a straight line (so they add to ' + t('180^\\circ') + ').' + angleFig(o.A + '°', ['(' + e1 + ')°', '(' + e2 + ')°']) + 'The value of ' + t('x+y') + ' is ____.', o.x + o.y, function (v) {
            if (v === o.x || v === o.y) return { code: 'nr-x-only', hint: 'That’s ' + (v === o.x ? t('x') : t('y')) + ' on its own. The question asks for ' + t('x+y') + '.' };
            if (v === o.x - o.y) return { code: 'nr-x-only', hint: 'That’s ' + t('x-y') + '. The question asks for ' + t('x+y') + '.' };
            return null;
          }, 'Corresponding angles: ' + t(E1 + '=' + o.A) + '.<br>Straight line: ' + t('(' + E1 + ')+(' + E2 + ')=180') + ' ⟹ ' + t((o.a + o.b) + 'x=180') + ' ⟹ ' + t('x=' + o.x) + '.<br>' + t((o.a * o.x) + '-y=' + o.A) + ' ⟹ ' + t('y=' + o.y) + '.<br>' + chk('Check: ' + t(o.A + '+' + (o.b * o.x + o.y) + '=180')) + ', and the ' + t(o.A + '^\\circ') + ' angles are the acute ones.<br>' + t('x+y=' + o.x + '+' + o.y + '=' + (o.x + o.y)),
            ['Write one equation from each fact. Adding the two angle expressions makes ' + t('y') + ' drop out.'], 'angles system x+y');
        } }] },
      /* ---------- 14 ---------- */
      { num: '14', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '14', level: 'ADV', make: function (r) {
          var o = gen(function () { var more = r.chance(0.7), a = r.int(1, 9), b = r.int(1, 9); if (Math.abs(a - b) < 2) return null; var tt = more ? Math.min(a, b) : Math.max(a, b), u = more ? Math.max(a, b) : Math.min(a, b); return { t: tt, u: u, more: more, s: tt + u, d: 9 * Math.abs(u - tt) }; }, { t: 4, u: 9, more: true, s: 13, d: 45 });
          var num = 10 * o.t + o.u, rev = 10 * o.u + o.t;
          return K.P.nr('A two-digit number has digits whose sum is ' + t(o.s) + '. If the digits are reversed, the new number is ' + t(o.d) + ' ' + (o.more ? 'more' : 'less') + ' than the original number. The original number is ____.', num, function (v) {
            if (v === rev) return { code: 'digits-reversed', hint: 'That’s the <b>reversed</b> number. Check: is it ' + o.d + ' ' + (o.more ? 'more' : 'less') + ' than the original?' };
            return null;
          }, 'Let ' + t('t') + ' be the tens digit and ' + t('u') + ' the units digit: the number is ' + t('10t+u') + ', reversed ' + t('10u+t') + '.<br>' + t('t+u=' + o.s) + '. ' + (o.more ? t('(10u+t)-(10t+u)=' + o.d) + ' ⟹ ' + t('9u-9t=' + o.d) + ' ⟹ ' + t('u-t=' + o.d / 9) : t('(10t+u)-(10u+t)=' + o.d) + ' ⟹ ' + t('9t-9u=' + o.d) + ' ⟹ ' + t('t-u=' + o.d / 9)) + '.<br>Add the equations: ' + t('t=' + o.t) + ', ' + t('u=' + o.u) + '.<br>' + chk('Check: ' + t(o.t + '+' + o.u + '=' + o.s)) + ', ' + chk(t(Math.max(num, rev) + '-' + Math.min(num, rev) + '=' + o.d)) + '<br>The original number is ' + t(num) + '.',
            ['The number with tens digit ' + t('t') + ' and units digit ' + t('u') + ' is ' + t('10t+u') + '; reversed it is ' + t('10u+t') + '.'], 'digit reversal');
        } }] },
      /* ---------- 15 ---------- */
      { num: '15', shared: function (r) { return gen(function () { var A = r.int(2, 15), B = r.int(1, 5); if (A === B) return null; return { A: A, B: B }; }, { A: 5, B: 2 }); },
        stem: function (o) { var h = [1, 2, 3, 4].map(function (n) { return ((o.A + o.B * n * n) / 10).toFixed(1); }); return '<i>(Extension)</i> The heights, in metres, of the vertical support rods of a footbridge canopy, measured as you move out from the centre, form the sequence ' + t(h.join(',\\ ') + ',\\ \\ldots') + '.'; },
        parts: [
          { id: '15a', sub: 'a', level: 'EMG', outcome: 'EXT', make: function (r, o) {
            var h = function (n) { return (o.A + o.B * n * n) / 10; }, d3 = h(4) - h(3), f1 = function (v) { return rnd(v).toFixed(1); };
            return numsP('Without a calculator, determine the next two terms of the sequence.', [{ label: '5th term', after: 'm' }, { label: '6th term', after: 'm' }], [rnd(h(5)), rnd(h(6))],
              { names: ['5th term', '6th term'], wrong: [{ v: [rnd(h(4) + d3), rnd(h(4) + 2 * d3)], code: 'first-diff-const', hint: 'The first differences aren’t constant — each one is ' + t(N(o.B * 2 / 10)) + ' more than the last. Find the next differences first.' }] },
              'First differences: ' + t([f1(h(2) - h(1)), f1(h(3) - h(2)), f1(h(4) - h(3))].join(',\\ ')) + ' — each is ' + t(N(2 * o.B / 10)) + ' more than the last, so the next two are ' + t(f1(h(5) - h(4))) + ' and ' + t(f1(h(6) - h(5))) + '.<br>' + t(f1(h(4)) + '+' + f1(h(5) - h(4)) + '=' + f1(h(5))) + ', ' + t(f1(h(5)) + '+' + f1(h(6) - h(5)) + '=' + f1(h(6))) + '.',
              ['Look at the differences between terms, then at how those differences change.'], 'next terms of quadratic sequence');
          } },
          { id: '15b', sub: 'b', level: 'PRG', outcome: 'EXT', make: function (r, o) {
            var h1 = (o.A + o.B) / 10, h2 = (o.A + 4 * o.B) / 10;
            return numsP('The height, ' + t('h') + ' metres, of the ' + t('n^{\\text{th}}') + ' rod is given by ' + t('h=a+bn^2') + '. Using two terms of the sequence, form a system of equations and determine ' + t('a') + ' and ' + t('b') + '.', [{ label: t('a'), before: '=' }, { label: t('b'), before: '=' }], [o.A / 10, o.B / 10],
              { names: ['value of a', 'value of b'], sys: [[1, 1, -h1], [1, 4, -h2]], sysNames: ['the first term', 'the second term'], swapHint: t('a') + ' is the constant and ' + t('b') + ' multiplies ' + t('n^2') + ' — check which is which.' },
              t('n=1,\\ h=' + N(h1)) + ': ' + t('a+b=' + N(h1)) + '. ' + t('n=2,\\ h=' + N(h2)) + ': ' + t('a+4b=' + N(h2)) + '.<br>Subtract: ' + t('3b=' + N(h2 - h1)) + ' ⟹ ' + t('b=' + N(o.B / 10)) + ', so ' + t('a=' + N(o.A / 10)) + ': ' + t('h=' + N(o.A / 10) + '+' + N(o.B / 10) + 'n^2') + '.<br>' + chk('Test: ' + t('h(3)=' + N(o.A / 10) + '+' + N(9 * o.B / 10) + '=' + N((o.A + 9 * o.B) / 10))),
              ['Substitute ' + t('n=1') + ' and ' + t('n=2') + ' (with their heights) into ' + t('h=a+bn^2') + '.'], 'solve for a and b');
          } },
          { id: '15c', sub: 'c', level: 'BEG', outcome: 'EXT', make: function (r, o) {
            var a = o.A / 10, b = o.B / 10, h = function (n) { return rnd((o.A + o.B * n * n) / 10); };
            return numsP('The formula is ' + t('h=' + N(a) + '+' + N(b) + 'n^2') + '. Use it to find ' + t('h(5)') + ' and ' + t('h(6)') + ', to verify the next two terms of the sequence.', [{ label: t('h(5)'), before: '=', after: 'm' }, { label: t('h(6)'), before: '=', after: 'm' }], [h(5), h(6)],
              { names: ['value of h(5)', 'value of h(6)'], wrong: [{ v: [h(4), h(5)], code: 'n-offset', hint: 'Substitute ' + t('n=5') + ' and ' + t('n=6') + ' (the 5th and 6th rods).' }, { v: [rnd(a + b * 10), rnd(a + b * 12)], code: 'n-offset', hint: 'Square ' + t('n') + ' first: ' + t('5^2=25') + ', not ' + t('5\\times 2') + '.' }] },
              t('h(5)=' + N(a) + '+' + N(b) + '(25)=' + N(h(5))) + ' and ' + t('h(6)=' + N(a) + '+' + N(b) + '(36)=' + N(h(6))) + ' — they match the next two terms found from the differences.',
              ['Square ' + t('n') + ' first, multiply by ' + t(N(b)) + ', then add ' + t(N(a)) + '.'], 'verify with formula');
          } }] }
    ],

    /* ============================ EXTRA PRACTICE ============================ */
    extra: [
      /* ---------- Part A ---------- */
      { num: '1', section: 'Extra practice A — Naming the unknowns', stem: 'For each situation, choose the variable definitions (with units) and what the question actually asks you to report. <b>Do not solve anything.</b>', parts: [
        { id: 'e1a', sub: 'a', level: 'LIM', make: function (r) {
          var m = r.int(20, 50), s = r.int(15, 45), pm = r.pick([2.75, 3, 3.25, 3.5]), ps = r.pick([3.75, 4, 4.25, 4.5]), T = rnd(m * pm + s * ps);
          return mc(r, 'A bakery sold ' + t(m + s) + ' items on Saturday, every one of them either a muffin at ' + Dh(pm) + ' or a scone at ' + Dh(ps) + ', taking in ' + Dh(T) + ' altogether. How many <b>scones</b> were sold?', [
            { html: 'Let ' + t('m') + ' be the number of muffins and ' + t('s') + ' the number of scones (counts of items). Report ' + t('s') + ' only.', right: true },
            { html: 'Let ' + t('m') + ' be the price of a muffin and ' + t('s') + ' the price of a scone, in dollars. Report ' + t('s') + '.', why: 'The prices are already given. The unknowns are <b>how many</b> of each were sold.' },
            { html: 'Let ' + t('m') + ' and ' + t('s') + ' be the numbers of muffins and scones. Report the ordered pair ' + t('(m,\\ s)') + '.', why: 'The question asks only for the number of <b>scones</b> — report ' + t('s') + ' in a sentence.' },
            { html: 'Let ' + t('m') + ' and ' + t('s') + ' be the numbers of muffins and scones. Report ' + t(mon(ps) + 's') + '.', why: t(mon(ps) + 's') + ' is the <b>money</b> from scones; the question asks how many.' }],
            'Let ' + t('m') + ' = number of muffins and ' + t('s') + ' = number of scones (counts of items). The question asks for ' + t('s') + ' alone — not the pair, and not ' + t('m') + '.', ['What is unknown: the prices or the numbers sold? Then reread the question.'], 'define variables: bakery');
        } },
        { id: 'e1b', sub: 'b', level: 'BEG', make: function (r) {
          var g0 = gen(function () { var pa = r.pick([12, 14, 15, 16]), py = r.pick([6, 7, 8, 9]), a = r.int(60, 110), y = r.int(50, 100); return pa * a > py * y ? { pa: pa, py: py, a: a, y: y } : null; }, { pa: 14, py: 8, a: 100, y: 74 });   // adults must bring in more money
          var pa = g0.pa, py = g0.py, a = g0.a, y = g0.y;
          return mc(r, 'A drama club sold adult tickets at ' + Dh(pa) + ' and student tickets at ' + Dh(py) + '. It sold ' + t(a + y) + ' tickets and took in ' + Dh(pa * a + py * y) + '. How much <b>more money</b> came from adults than from students?', [
            { html: 'Let ' + t('a') + ' and ' + t('y') + ' be the numbers of adult and student tickets (counts). Report ' + t(pa + 'a-' + py + 'y') + ', in dollars.', right: true },
            { html: 'Let ' + t('a') + ' and ' + t('y') + ' be the numbers of adult and student tickets. Report ' + t('a-y') + '.', why: t('a-y') + ' is how many more <b>tickets</b> adults bought, not how much more <b>money</b>.' },
            { html: 'Let ' + t('a') + ' and ' + t('y') + ' be the numbers of adult and student tickets. Report ' + t(pa + 'a+' + py + 'y') + '.', why: t(pa + 'a+' + py + 'y') + ' is the total money — it is given (' + Dh(pa * a + py * y) + ').' },
            { html: 'Let ' + t('a') + ' and ' + t('y') + ' be the prices of the tickets. Report ' + t('a-y') + '.', why: 'The prices are given. The unknowns are the <b>numbers</b> of tickets sold.' }],
            'Let ' + t('a') + ' and ' + t('y') + ' be the numbers of adult and student tickets. The question asks for ' + t(pa + 'a-' + py + 'y') + ' dollars — a <b>combination</b> of the two variables, neither one on its own.', ['Money from adults is (price) × (number of adult tickets).'], 'define variables: drama club');
        } },
        { id: 'e1c', sub: 'c', level: 'BEG', make: function (r) {
          var q = r.int(30, 70), n = r.int(20, 50);
          return mc(r, 'A cash box holds only quarters and loonies — ' + t(q + n) + ' coins in all, worth ' + Dh((25 * q + 100 * n) / 100) + '. What is the <b>total value of the quarters</b> in the box?', [
            { html: 'Let ' + t('q') + ' be the number of quarters and ' + t('n') + ' the number of loonies (counts of coins). Report ' + t('0.25q') + ', in dollars.', right: true },
            { html: 'Let ' + t('q') + ' be the number of quarters and ' + t('n') + ' the number of loonies. Report ' + t('q') + '.', why: t('q') + ' is how many quarters there are; the question asks for their <b>value</b>.' },
            { html: 'Let ' + t('q') + ' be the value of the quarters and ' + t('n') + ' the value of the loonies. Report ' + t('q+n') + '.', why: t('q+n') + ' would be the total value, which is given. And defining counts is what lets you write the count equation.' },
            { html: 'Let ' + t('q') + ' be the number of quarters and ' + t('n') + ' the number of loonies. Report ' + t('q+n') + '.', why: t('q+n') + ' is the total number of coins — it is given (' + (q + n) + ').' }],
            'Let ' + t('q') + ' and ' + t('n') + ' be the numbers of quarters and loonies. The question asks for ' + t('0.25q') + ' dollars — the <b>value</b> of the quarters, not how many there are.', ['Value of the quarters = (value of one quarter) × (number of quarters).'], 'define variables: coins');
        } },
        { id: 'e1d', sub: 'd', level: 'BEG', make: function (r) {
          var w = r.int(5, 12), d = r.int(2, 8), P = 2 * (2 * w + d);
          return mc(r, 'A rectangular flower bed is edged on all four sides with ' + t(P + '\\text{ m}') + ' of steel edging. The bed is ' + t(d + '\\text{ m}') + ' longer than it is wide. What is its <b>area</b>?', [
            { html: 'Let ' + t('l') + ' and ' + t('w') + ' be the length and width in metres. Report the area ' + t('lw') + ', in square metres.', right: true },
            { html: 'Let ' + t('l') + ' and ' + t('w') + ' be the length and width in metres. Report ' + t('l') + ' and ' + t('w') + '.', why: 'You need both, but the question asks for the <b>area</b>, ' + t('lw') + '.' },
            { html: 'Let ' + t('l') + ' and ' + t('w') + ' be the length and width in metres. Report ' + t('2l+2w') + '.', why: t('2l+2w') + ' is the perimeter — it is given (' + P + ' m).' },
            { html: 'Let ' + t('l') + ' and ' + t('w') + ' be the length and width in metres. Report ' + t('lw') + ', in metres.', why: 'Right quantity, wrong units: an area is in <b>square</b> metres.' }],
            'Let ' + t('l') + ' and ' + t('w') + ' be the length and width in metres. The question asks for the area ' + t('lw') + ' in m² — both variables are needed, and the answer has different units from either one.', ['What does “area” mean for a rectangle, and what are its units?'], 'define variables: flower bed');
        } }] },
      /* ---------- Part B ---------- */
      { num: '2', section: 'Extra practice B — Translation, and where the number goes', shared: ep2,
        stem: 'For each sentence pair, write the <b>two equations only</b>. Do not solve.', parts: [
          { id: 'e2a', sub: 'a', level: 'BEG', make: function (r, o) {
            var T = (o.k + 1) * o.t;
            return sysP('There are ' + ASMANY[o.k] + ' as many students as teachers on a field trip. Altogether ' + t(T) + ' people are going. Let ' + t('s') + ' be the number of students and ' + t('t') + ' the number of teachers.', [[1, -o.k, 0], [1, 1, -T]],
              { vars: ['s', 't'], keyTex: ['s=' + o.k + 't', 's+t=' + T], names: ['the “' + ASMANY[o.k] + ' as many” sentence', 'the total'],
                factHints: ['test it: with ' + t('t=4') + ' teachers there are ' + t(4 * o.k) + ' students.', 'students and teachers together make ' + t(T) + '.'],
                wrong: [{ eq: [o.k, -1, 0], code: 'ratio-flip', hint: 'Test your equation: with ' + t('t=4') + ' teachers there should be ' + t(4 * o.k) + ' students. The ' + t(o.k) + ' multiplies the <b>smaller</b> group: ' + t('s=' + o.k + 't') + '.' }], bad: [['t=' + o.k + 's', 's+t=' + T]] },
              t('s=' + o.k + 't') + ' (test: ' + t('t=4') + ' gives ' + t('s=' + 4 * o.k) + ' ✓) and ' + t('s+t=' + T) + '.', ['Invent a small pair of numbers that obeys the sentence and test your equation.'], 'translate: as many as');
          } },
          { id: 'e2b', sub: 'b', level: 'BEG', make: function (r, o) {
            return sysP('A notebook costs ' + Dh(o.d7) + ' more than a pen. Together the two cost ' + Dh(o.Tb) + '. Let ' + t('n') + ' be the price of a notebook and ' + t('p') + ' the price of a pen, in dollars.', [[1, -1, -o.d7], [1, 1, -o.Tb]],
              { vars: ['n', 'p'], keyTex: ['n=p+' + o.d7, 'n+p=' + m2(o.Tb)], names: ['the “more than” sentence', 'the total'], factHints: ['the notebook is the dearer one: ' + t('n=p+' + o.d7) + '.', 'together: ' + t('n+p=' + m2(o.Tb)) + '.'],
                wrong: [{ eq: [1, -o.d7, 0], code: 'more-times', hint: '“' + o.d7 + ' more than” <b>adds</b>: ' + t('n=p+' + o.d7) + '. (' + t('n=' + o.d7 + 'p') + ' would mean ' + o.d7 + ' <i>times</i>.)' }, { eq: [1, -1, o.d7], code: 'more-than-flip', hint: 'The notebook costs more, so the ' + t(o.d7) + ' is added to the pen’s price: ' + t('n=p+' + o.d7) + '.' }], bad: [['n=' + o.d7 + 'p', 'n+p=' + m2(o.Tb)], ['p=n+' + o.d7, 'n+p=' + m2(o.Tb)]] },
              t('n=p+' + o.d7) + ' and ' + t('n+p=' + m2(o.Tb)) + '. “More than” <b>adds</b>, so the ' + t(o.d7) + ' is a separate term.', ['“More than” adds; “times” multiplies.'], 'translate: more than');
          } },
          { id: 'e2c', sub: 'c', level: 'BEG', make: function (r, o) {
            return sysP('A notebook costs ' + t(o.d7) + ' times what a pen costs. Together the two cost ' + Dh(o.Tc) + '. Let ' + t('n') + ' be the price of a notebook and ' + t('p') + ' the price of a pen, in dollars.', [[1, -o.d7, 0], [1, 1, -o.Tc]],
              { vars: ['n', 'p'], keyTex: ['n=' + o.d7 + 'p', 'n+p=' + m2(o.Tc)], names: ['the “times” sentence', 'the total'], factHints: ['the notebook is ' + o.d7 + ' times the pen: ' + t('n=' + o.d7 + 'p') + '.', 'together: ' + t('n+p=' + m2(o.Tc)) + '.'],
                wrong: [{ eq: [1, -1, -o.d7], code: 'times-more', hint: '“' + o.d7 + ' times” <b>multiplies</b>: ' + t('n=' + o.d7 + 'p') + '.' }, { eq: [o.d7, -1, 0], code: 'ratio-flip', hint: 'Test: if a pen costs ' + Dh(1) + ', a notebook costs ' + Dh(o.d7) + '. So ' + t('n=' + o.d7 + 'p') + '.' }], bad: [['n=p+' + o.d7, 'n+p=' + m2(o.Tc)], ['p=' + o.d7 + 'n', 'n+p=' + m2(o.Tc)]] },
              t('n=' + o.d7 + 'p') + ' and ' + t('n+p=' + m2(o.Tc)) + '. “Times” <b>multiplies</b>, so the ' + t(o.d7) + ' is a coefficient.', ['“Times” multiplies; test with a pen price of $1.'], 'translate: times');
          } },
          { id: 'e2d', sub: 'd', level: 'BEG', make: function (r, o) {
            return sysP('The difference between Ravi’s savings and Sofia’s savings is ' + Dh(o.dd) + ', and Ravi has the more of the two. Their savings total ' + Dh(o.Tr) + '. Let ' + t('r') + ' be Ravi’s savings and ' + t('f') + ' Sofia’s savings, in dollars.', [[1, -1, -o.dd], [1, 1, -o.Tr]],
              { vars: ['r', 'f'], keyTex: ['r-f=' + o.dd, 'r+f=' + o.Tr], names: ['the difference', 'the total'], factHints: ['Ravi has more, so subtract Sofia’s from Ravi’s.', 'their savings add to ' + Dh(o.Tr) + '.'],
                wrong: [{ eq: [-1, 1, -o.dd], code: 'diff-order', hint: 'Ravi has the more of the two, so the difference is ' + t('r-f') + ' (bigger minus smaller).' }], bad: [['f-r=' + o.dd, 'r+f=' + o.Tr]] },
              t('r-f=' + o.dd) + ' and ' + t('r+f=' + o.Tr) + '. “Ravi has the more” fixes the order of the subtraction.', ['Which one is larger? Subtract the smaller from the larger.'], 'translate: difference');
          } },
          { id: 'e2e', sub: 'e', level: 'BEG', make: function (r, o) {
            var T = 2 * o.dN + o.kN;
            return sysP('A jar holds nickels and dimes. There are ' + t(o.kN) + ' more nickels than dimes, and ' + t(T) + ' coins in all. Let ' + t('n') + ' be the number of nickels and ' + t('d') + ' the number of dimes.', [[1, -1, -o.kN], [1, 1, -T]],
              { vars: ['n', 'd'], keyTex: ['n=d+' + o.kN, 'n+d=' + T], names: ['the “more” sentence', 'the total'], factHints: ['there are more nickels, so add ' + t(o.kN) + ' to the dimes.', 'the coins add to ' + t(T) + '.'],
                wrong: [{ eq: [1, -1, o.kN], code: 'more-than-flip', hint: 'There are <b>more</b> nickels, so the ' + t(o.kN) + ' is added to the smaller count: ' + t('n=d+' + o.kN) + '.' }, { eq: [1, -o.kN, 0], code: 'more-times', hint: '“' + o.kN + ' more” adds: ' + t('n=d+' + o.kN) + '.' }], bad: [['d=n+' + o.kN, 'n+d=' + T]] },
              t('n=d+' + o.kN) + ' and ' + t('n+d=' + T) + '. The ' + t(o.kN) + ' is added to the <b>smaller</b> count.', ['Test: if there were 10 dimes, how many nickels would there be?'], 'translate: more nickels');
          } },
          { id: 'e2f', sub: 'f', level: 'EMG', make: function (r, o) {
            var f6 = o.f6, T = f6.L + f6.S;
            return sysP('Three times the larger of two numbers is ' + t(f6.c) + ' less than five times the smaller. The two numbers add to ' + t(T) + '. Let ' + t('L') + ' be the larger number and ' + t('S') + ' the smaller.', [[3, -5, f6.c], [1, 1, -T]],
              { vars: ['L', 'S'], keyTex: ['3L=5S-' + f6.c, 'L+S=' + T], names: ['the “less than” sentence', 'the sum'], factHints: ['“' + f6.c + ' less than five times the smaller” is ' + t('5S-' + f6.c) + '.', 'the numbers add to ' + t(T) + '.'],
                wrong: [{ eq: [3, -5, -f6.c], code: 'more-than-side', hint: '“' + f6.c + ' less than five times the smaller” takes ' + t(f6.c) + ' away from ' + t('5S') + ': ' + t('3L=5S-' + f6.c) + '.' }, { eq: [3, 5, -f6.c], code: 'more-than-side', hint: '“' + f6.c + ' less than ' + t('5S') + '” is ' + t('5S-' + f6.c) + ', not ' + t(f6.c + '-5S') + '.' }, { eq: [5, -3, f6.c], code: 'coef-swap', hint: 'Three times the <b>larger</b> (' + t('3L') + '), five times the <b>smaller</b> (' + t('5S') + ').' }], bad: [['3L-' + f6.c + '=5S', 'L+S=' + T]] },
              t('3L=5S-' + f6.c) + ' and ' + t('L+S=' + T) + '. “' + f6.c + ' less than ' + t('5S') + '” reduces ' + t('5S') + ' by ' + t(f6.c) + '.', ['“' + f6.c + ' less than A” means ' + t('A-' + f6.c) + '.'], 'translate: less than');
          } },
          { id: 'e2g', sub: 'g', level: 'EMG', make: function (r, o) {
            var pB = o.pb, pC = o.pc, bR = o.bAbove;
            return mc(r, 'Two sentence pairs: <b>(b)</b> a notebook costs ' + Dh(o.d7) + ' more than a pen, and together they cost ' + Dh(o.Tb) + '; <b>(c)</b> a notebook costs ' + t(o.d7) + ' times what a pen costs, and together they cost ' + Dh(o.Tc) + '. Exactly one has the pen costing more than ' + Dh(2) + '. Without solving, which one, and why?', [
              { html: '(b): removing the fixed ' + Dh(o.d7) + ' leaves ' + Dh(o.Tb - o.d7) + ' for two pen-sized shares, about ' + Dh(pB) + ' each.', right: bR, why: bR ? null : 'Work it out: ' + Dh(o.Tb - o.d7) + ' ÷ 2 = ' + Dh(pB) + ', which is <b>less</b> than $2.' },
              { html: '(c): the ' + Dh(o.Tc) + ' splits into ' + t(o.d7 + '+1=' + (o.d7 + 1)) + ' pen-sized shares, about ' + Dh(pC) + ' each.', right: !bR, why: !bR ? null : 'Work it out: ' + Dh(o.Tc) + ' ÷ ' + (o.d7 + 1) + ' = ' + Dh(pC) + ', which is <b>less</b> than $2.' },
              { html: 'Neither can be decided without solving both systems completely.', why: 'You can estimate: in (b) take away the fixed ' + Dh(o.d7) + ' and halve; in (c) divide the total into ' + (o.d7 + 1) + ' equal shares.' },
              { html: 'They give the same pen price, because both sentences use the number ' + o.d7 + '.', why: '“More than” adds a fixed amount; “times” multiplies. The same number gives very different prices.' }],
            '<b>(b):</b> the notebook carries a fixed ' + Dh(o.d7) + '; ' + Dh(o.Tb - o.d7) + ' ÷ 2 = ' + Dh(pB) + ' per pen. <b>(c):</b> the total is ' + (o.d7 + 1) + ' pen-sized shares: ' + Dh(o.Tc) + ' ÷ ' + (o.d7 + 1) + ' = ' + Dh(pC) + '. So <b>(' + (bR ? 'b' : 'c') + ')</b> has the pen above $2.',
            ['In (b), take away the fixed amount and split the rest in two. In (c), split the total into ' + (o.d7 + 1) + ' equal parts.'], 'more than vs times estimate');
          } }] },
      { num: '3', shared: function (r) { var k = r.chance(0.7) ? 2 : 3, tt = r.int(3, 9); return { k: k, t: tt, e: k * tt, N: (k + 1) * tt, test: r.pick([2, 3, 4, 5]) }; },
        stem: function (o) { return 'A school council has ' + ASMANY[o.k] + ' as many Grade 11 representatives as Grade 10 representatives. Let ' + t('e') + ' be the number of Grade 11 representatives and ' + t('t') + ' the number of Grade 10 representatives.'; },
        parts: [
          { id: 'e3a', sub: 'a', level: 'LIM', make: function (r, o) {
            return mc(r, 'One student writes ' + t('e=' + o.k + 't') + '; another writes ' + t(o.k + 'e=t') + '. Decide which is correct by testing ' + t('t=' + o.test) + '.', [
              { html: t('e=' + o.k + 't') + ': with ' + t('t=' + o.test) + ' it gives ' + t('e=' + o.k * o.test) + ', which is ' + ASMANY[o.k] + ' as many Grade 11 reps.', right: true },
              { html: t(o.k + 'e=t') + ': with ' + t('t=' + o.test) + ' it gives ' + t('e=' + N(o.test / o.k)) + '.', why: 'That gives <b>fewer</b> Grade 11 reps than Grade 10 reps — the opposite of the sentence.' + (o.test % o.k ? ' (And ' + t(N(o.test / o.k)) + ' people isn’t even possible.)' : '') },
              { html: 'Both — they are the same equation rearranged.', why: 'Test both with ' + t('t=' + o.test) + ': they give different values of ' + t('e') + '.' },
              { html: 'Neither — it should be ' + t('e=t+' + o.k) + '.', why: '“' + cap(ASMANY[o.k]) + ' as many” multiplies; “' + o.k + ' more” would add.' }],
            'Test ' + t('t=' + o.test) + ': ' + t('e=' + o.k + '(' + o.test + ')=' + o.k * o.test) + ' ✓ — ' + ASMANY[o.k] + ' as many Grade 11 reps. The other version gives ' + t('e=' + N(o.test / o.k)) + ', fewer Grade 11 reps. The ' + t(o.k) + ' belongs beside the <b>smaller</b> group.', ['Substitute ' + t('t=' + o.test) + ' into each and see which gives more Grade 11 reps.'], 'test twice as many');
          } },
          { id: 'e3b', sub: 'b', level: 'BEG', make: function (r, o) {
            return numsP('The council has ' + t(o.N) + ' representatives in total. Write the second equation and solve the system.', [{ label: 'Grade 11, ' + t('e') }, { label: 'Grade 10, ' + t('t') }], [o.e, o.t],
              { names: ['number of Grade 11 reps', 'number of Grade 10 reps'], sys: [[1, -o.k, 0], [1, 1, -o.N]], sysNames: ['the “' + ASMANY[o.k] + ' as many” sentence', 'the total'], swapHint: 'There are <b>more</b> Grade 11 reps (' + ASMANY[o.k] + ' as many). Check which box is which.' },
              'Second equation: ' + t('e+t=' + o.N) + '. Substitute ' + t('e=' + o.k + 't') + ': ' + t(o.k + 't+t=' + o.N) + ' ⟹ ' + t((o.k + 1) + 't=' + o.N) + ' ⟹ ' + t('t=' + o.t) + ', ' + t('e=' + o.e) + '.<br>' + chk('Check: ' + t(o.e + '=' + o.k + '(' + o.t + ')')) + ', ' + chk(t(o.e + '+' + o.t + '=' + o.N)),
              ['The second equation is the total: ' + t('e+t=' + o.N) + '. Substitute ' + t('e=' + o.k + 't') + '.'], 'council solve');
          } },
          { id: 'e3c', sub: 'c', level: 'LIM', make: function (r, o) {
            return mc(r, 'With ' + t(o.N) + ' representatives in total, which answers “how many representatives are in each grade?” and checks against <b>both</b> sentences?', [
              { html: o.e + ' Grade 11 and ' + o.t + ' Grade 10 representatives: ' + o.e + ' is ' + ASMANY[o.k] + ' ' + o.t + ', and ' + t(o.e + '+' + o.t + '=' + o.N) + '.', right: true },
              { html: o.t + ' Grade 11 and ' + o.e + ' Grade 10 representatives: ' + t(o.t + '+' + o.e + '=' + o.N) + '.', why: 'The total checks, but the first sentence fails: there should be <b>more</b> Grade 11 reps.' },
              { html: t('(' + o.e + ',\\ ' + o.t + ')') + ' — the ordered pair is the answer.', why: 'Answer in a sentence that says which number is which grade.' },
              { html: o.e + ' representatives, because ' + t('e=' + o.e) + '.', why: 'The question asks for <b>each</b> grade.' }],
            '<b>The council has ' + o.e + ' Grade 11 and ' + o.t + ' Grade 10 representatives.</b> Against the words: ' + o.e + ' is ' + ASMANY[o.k] + ' ' + o.t + ' ✓ and ' + t(o.e + '+' + o.t + '=' + o.N) + ' ✓; both are whole and positive.', ['Check the pair against each sentence of the problem.'], 'council answer sentence');
          } }] },
      /* ---------- Part C ---------- */
      { num: '4', section: 'Extra practice C — Two prices, two rates, two denominations',
        shared: function (r) {
          return gen(function () { var a1 = r.int(3, 9), b1 = r.int(2, 9), a2 = r.int(3, 9), b2 = r.int(2, 9); if (a1 * b2 === a2 * b1 || Math.abs(a1 * b2 - a2 * b1) < 10) return null; var p = 25 * r.int(24, 72), j = 5 * r.int(40, 160), a3 = r.int(3, 9), b3 = r.int(2, 9); if (p === j) return null; return { a1: a1, b1: b1, a2: a2, b2: b2, a3: a3, b3: b3, p: p / 100, j: j / 100, T1: (a1 * p + b1 * j) / 100, T2: (a2 * p + b2 * j) / 100, T3: (a3 * p + b3 * j) / 100 }; },
            { a1: 7, b1: 4, a2: 5, b2: 9, a3: 6, b3: 5, p: 12.5, j: 5.35, T1: 108.9, T2: 110.65, T3: 101.75 });
        },
        stem: function (o) { return 'A plumber’s first invoice lists ' + t(o.a1 + '\\text{ m}') + ' of copper pipe and ' + t(o.b1) + ' elbow joints for ' + Dh(o.T1) + '. A second invoice, at the same prices, lists ' + t(o.a2 + '\\text{ m}') + ' of the same pipe and ' + t(o.b2) + ' of the same joints for ' + Dh(o.T2) + '.'; },
        parts: [
          { id: 'e4a', sub: 'a', level: 'BEG', make: function (r, o) {
            return sysP('Let ' + t('p') + ' be the price of the pipe in dollars per metre and ' + t('j') + ' the price of one elbow joint in dollars. Write the system.', [[o.a1, o.b1, -o.T1], [o.a2, o.b2, -o.T2]],
              { vars: ['p', 'j'], keyTex: [o.a1 + 'p+' + o.b1 + 'j=' + m2(o.T1), o.a2 + 'p+' + o.b2 + 'j=' + m2(o.T2)], names: ['the first invoice', 'the second invoice'], factHints: ['first invoice: ' + o.a1 + ' m of pipe and ' + o.b1 + ' joints.', 'second invoice: ' + o.a2 + ' m of pipe and ' + o.b2 + ' joints.'],
                wrong: [{ eq: [o.b1, o.a1, -o.T1], code: 'coef-swap', hint: 'In the first invoice, ' + t(o.a1) + ' goes with the pipe (' + t('p') + ') and ' + t(o.b1) + ' with the joints (' + t('j') + ').' }, { eq: [o.b2, o.a2, -o.T2], code: 'coef-swap', hint: 'In the second invoice, ' + t(o.a2) + ' goes with the pipe (' + t('p') + ') and ' + t(o.b2) + ' with the joints (' + t('j') + ').' }],
                bad: o.a2 !== o.b2 ? [[o.a1 + 'p+' + o.b1 + 'j=' + m2(o.T1), o.b2 + 'p+' + o.a2 + 'j=' + m2(o.T2)]] : [] },
              t(o.a1 + 'p+' + o.b1 + 'j=' + m2(o.T1)) + ' and ' + t(o.a2 + 'p+' + o.b2 + 'j=' + m2(o.T2)) + ' — one equation per invoice; each totals money.', ['Each invoice gives one equation: (metres × price per metre) + (joints × price per joint) = total.'], 'invoice system');
          } },
          { id: 'e4b', sub: 'b', level: 'PRG', make: function (r, o) {
            return numsP('Solve the system, and verify your solution in both original equations.', [{ label: 'Pipe', before: '$', after: 'per m' }, money('Elbow joint')], [o.p, o.j],
              { names: ['pipe price', 'joint price'], money: true, sys: [[o.a1, o.b1, -o.T1], [o.a2, o.b2, -o.T2]], sysNames: ['the first invoice', 'the second invoice'] },
              t(o.a1 + 'p+' + o.b1 + 'j=' + m2(o.T1)) + ', ' + t(o.a2 + 'p+' + o.b2 + 'j=' + m2(o.T2)) + '. Eliminate ' + t('j') + ': multiply the first by ' + t(o.b2) + ' and the second by ' + t(o.b1) + ', then subtract: ' + t((o.a1 * o.b2 - o.a2 * o.b1) + 'p=' + m2(o.b2 * o.T1 - o.b1 * o.T2)) + ' ⟹ ' + t('p=' + m2(o.p)) + '. Then ' + t('j=' + m2(o.j)) + '.<br>' +
              chk('Check: ' + t(o.a1 + '(' + m2(o.p) + ')+' + o.b1 + '(' + m2(o.j) + ')=' + m2(o.T1))) + ', ' + chk(t(o.a2 + '(' + m2(o.p) + ')+' + o.b2 + '(' + m2(o.j) + ')=' + m2(o.T2))),
              ['Elimination: make the ' + t('j') + '-coefficients match (multiply by ' + t(o.b2) + ' and ' + t(o.b1) + '), then subtract.'], 'invoice solve');
          } },
          { id: 'e4c', sub: 'c', level: 'PRG', make: function (r, o) {
            return numP('Find what ' + t(o.a3 + '\\text{ m}') + ' of pipe and ' + t(o.b3) + ' joints would cost.', o.T3, function (v) { if (near(v, o.a3 * o.j + o.b3 * o.p)) return { code: 'swap-answer', hint: 'Match each price to its item: ' + t(o.a3) + ' metres of <b>pipe</b>, ' + t(o.b3) + ' <b>joints</b>.' }; return null; },
              'From the system: pipe ' + Dh(o.p) + ' per metre, joint ' + Dh(o.j) + '.<br>' + t(o.a3 + '(' + m2(o.p) + ')+' + o.b3 + '(' + m2(o.j) + ')=' + m2(o.a3 * o.p) + '+' + m2(o.b3 * o.j) + '=' + m2(o.T3)) + '.<br><b>The pipe costs ' + Dh(o.p) + ' per metre and each joint ' + Dh(o.j) + '; ' + o.a3 + ' m of pipe and ' + o.b3 + ' joints would cost ' + Dh(o.T3) + '.</b>',
              ['Find both prices first (solve the system), then evaluate.'], 'invoice new order', { money: true, before: '$' });
          } }] },
      { num: '5', shared: function (r) { return gen(function () { var pa = r.int(14, 22), py = r.int(8, pa - 3), a = r.int(90, 180), y = r.int(60, 150); if (a === y) return null; return { pa: pa, py: py, a: a, y: y, N: a + y, T: pa * a + py * y }; }, { pa: 18, py: 11, a: 155, y: 109, N: 264, T: 3989 }); },
        stem: function (o) { return 'A community theatre charges ' + Dh(o.pa) + ' for an adult ticket and ' + Dh(o.py) + ' for a youth ticket. On opening night it sold ' + t(o.N) + ' tickets and took in ' + Dh(o.T) + '. Let ' + t('a') + ' be the number of adult tickets and ' + t('y') + ' the number of youth tickets.'; },
        parts: [
          { id: 'e5a', sub: 'a i', level: 'BEG', make: function (r, o) {
            return sysP('Write the system.', [[1, 1, -o.N], [o.pa, o.py, -o.T]],
              { vars: ['a', 'y'], keyTex: ['a+y=' + o.N, o.pa + 'a+' + o.py + 'y=' + o.T], showTex: ['a+y=' + o.N, o.pa + 'a+' + o.py + 'y=' + N(o.T)], names: ['the number of tickets', 'the money taken in'], factHints: ['one equation counts tickets.', 'the other totals money: price × number for each kind.'],
                wrong: [{ eq: [o.py, o.pa, -o.T], code: 'value-swap', hint: 'Adult tickets cost ' + Dh(o.pa) + ', so the adults bring in ' + t(o.pa + 'a') + '.' }, { eq: [1, 1, -o.T], code: 'count-value', hint: t('a+y') + ' counts tickets: it equals ' + t(o.N) + ', not the money.' }], bad: [['a+y=' + o.T, o.pa + 'a+' + o.py + 'y=' + o.N]] },
              t('a+y=' + o.N) + ' counts tickets; ' + t(o.pa + 'a+' + o.py + 'y=' + N(o.T)) + ' totals money.', ['One equation counts, the other totals value.'], 'theatre system');
          } },
          { id: 'e5a2', sub: 'a ii', level: 'LIM', make: function (r, o) {
            return mc(r, 'Which of the two equations counts tickets, and which totals money?', [
              { html: t('a+y=' + o.N) + ' counts tickets (its coefficients are pure numbers); ' + t(o.pa + 'a+' + o.py + 'y=' + N(o.T)) + ' totals money (its coefficients are dollars per ticket).', right: true },
              { html: t(o.pa + 'a+' + o.py + 'y=' + N(o.T)) + ' counts tickets, because ' + t('a') + ' and ' + t('y') + ' are numbers of tickets.', why: 'Each term is (dollars per ticket) × (tickets) = <b>dollars</b>, so this equation totals money.' },
              { html: 'Both count tickets.', why: 'Only ' + t('a+y') + ' counts tickets. Multiplying by prices turns tickets into dollars.' },
              { html: 'Both total money.', why: t('a+y') + ' adds numbers of tickets; there are no prices in it.' }],
            t('a+y=' + o.N) + ' — counts tickets. ' + t(o.pa + 'a+' + o.py + 'y=' + N(o.T)) + ' — totals money; each coefficient is dollars per ticket.', ['Look at the units of each term.'], 'count vs value equation');
          } },
          { id: 'e5b', sub: 'b', level: 'EMG', make: function (r, o) {
            return numsP('Solve, and check your solution in both original equations.', [{ label: 'Adult, ' + t('a') }, { label: 'Youth, ' + t('y') }], [o.a, o.y],
              { names: ['number of adult tickets', 'number of youth tickets'], sys: [[1, 1, -o.N], [o.pa, o.py, -o.T]], sysNames: ['the ticket count', 'the money total'] },
              t('y=' + o.N + '-a') + ': ' + t(o.pa + 'a+' + o.py + '(' + o.N + '-a)=' + N(o.T)) + ' ⟹ ' + t((o.pa - o.py) + 'a+' + N(o.py * o.N) + '=' + N(o.T)) + ' ⟹ ' + t('a=' + o.a) + ', ' + t('y=' + o.y) + '.<br>' + chk('Check: ' + t(o.a + '+' + o.y + '=' + o.N)) + ', ' + chk(t(o.pa + '(' + o.a + ')+' + o.py + '(' + o.y + ')=' + N(o.pa * o.a) + '+' + N(o.py * o.y) + '=' + N(o.T))),
              ['Isolate ' + t('y') + ' in the count equation and substitute into the money equation.'], 'theatre solve');
          } },
          { id: 'e5c', sub: 'c', level: 'LIM', make: function (r, o) {
            return mc(r, 'The solution is ' + t('a=' + o.a) + ', ' + t('y=' + o.y) + '. Which response checks it against the <b>words</b> and answers in a sentence?', [
              { html: o.a + ' and ' + o.y + ' are whole, positive and add to ' + o.N + '. The theatre sold ' + o.a + ' adult and ' + o.y + ' youth tickets.', right: true },
              { html: t(o.pa + '(' + o.a + ')+' + o.py + '(' + o.y + ')=' + N(o.T)) + ', so the answer is ' + t('(' + o.a + ',\\ ' + o.y + ')') + '.', why: 'That is a check in an <b>equation</b>, and an ordered pair isn’t a sentence. Check whole/positive counts and state which is which.' },
              { html: 'The theatre sold ' + o.y + ' adult and ' + o.a + ' youth tickets.', why: t('a') + ' is the number of <b>adult</b> tickets: ' + o.a + '.' },
              { html: 'The theatre took in ' + Dh(o.a) + ' from adults and ' + Dh(o.y) + ' from youths.', why: t('a') + ' and ' + t('y') + ' are numbers of <b>tickets</b>, not dollars.' }],
            'Against the words: both counts are whole and positive, and together they give ' + o.N + ' tickets ✓. <b>The theatre sold ' + o.a + ' adult tickets and ' + o.y + ' youth tickets on opening night.</b>', ['Counts of tickets must be whole and not negative.'], 'theatre check against words');
          } }] },
      { num: '6', shared: function (r) { return gen(function () { var big = r.pick([10, 10, 20]), f = r.int(20, 60), tt = r.int(15, 50), dl = r.pick([1, 2, 3, 4, -1, -2, 3]); if (f === tt) return null; return { big: big, f: f, t: tt, N: f + tt, V: 5 * f + big * tt, V2: 5 * f + big * tt + dl }; }, { big: 10, f: 41, t: 27, N: 68, V: 475, V2: 478 }); },
        stem: function (o) { return 'A canteen till holds only five-dollar bills and ' + (o.big === 10 ? 'ten' : 'twenty') + '-dollar bills — ' + t(o.N) + ' bills worth ' + Dh(o.V) + ' altogether. Let ' + t('f') + ' be the number of five-dollar bills and ' + t('t') + ' the number of ' + (o.big === 10 ? 'ten' : 'twenty') + '-dollar bills.'; },
        parts: [
          { id: 'e6a', sub: 'a', level: 'BEG', make: function (r, o) {
            return sysP('Write the system.', [[1, 1, -o.N], [5, o.big, -o.V]],
              { vars: ['f', 't'], keyTex: ['f+t=' + o.N, '5f+' + o.big + 't=' + o.V], names: ['the number of bills', 'the value of the bills'], factHints: ['count the bills.', 'each five is worth $5 and each ' + (o.big === 10 ? 'ten' : 'twenty') + ' $' + o.big + '.'],
                wrong: [{ eq: [o.big, 5, -o.V], code: 'value-swap', hint: 'Five-dollar bills are worth ' + Dh(5) + ' each: ' + t('5f') + '.' }, { eq: [1, 1, -o.V], code: 'count-value', hint: t('f+t') + ' counts bills: it equals ' + t(o.N) + '.' }], bad: [['f+t=' + o.N, o.big + 'f+5t=' + o.V]] },
              t('f+t=' + o.N) + ' and ' + t('5f+' + o.big + 't=' + o.V) + '.', ['One equation counts bills, the other totals their value.'], 'bills system');
          } },
          { id: 'e6b', sub: 'b', level: 'BEG', make: function (r, o) {
            return numsP('Solve, verify in both equations, and give the number of each kind of bill.', [{ label: 'Five-dollar bills' }, { label: (o.big === 10 ? 'Ten' : 'Twenty') + '-dollar bills' }], [o.f, o.t],
              { names: ['number of fives', 'number of ' + (o.big === 10 ? 'tens' : 'twenties')], sys: [[1, 1, -o.N], [5, o.big, -o.V]], sysNames: ['the number of bills', 'the value'] },
              t('f=' + o.N + '-t') + ': ' + t('5(' + o.N + '-t)+' + o.big + 't=' + o.V) + ' ⟹ ' + t(5 * o.N + '+' + (o.big - 5) + 't=' + o.V) + ' ⟹ ' + t('t=' + o.t) + ', ' + t('f=' + o.f) + '.<br>' + chk('Check: ' + t(o.f + '+' + o.t + '=' + o.N)) + ', ' + chk(t('5(' + o.f + ')+' + o.big + '(' + o.t + ')=' + o.V)) + '<br><b>The till holds ' + o.f + ' five-dollar bills and ' + o.t + ' ' + (o.big === 10 ? 'ten' : 'twenty') + '-dollar bills.</b>',
              ['Substitute ' + t('f=' + o.N + '-t') + ' into the value equation.'], 'bills solve');
          } },
          { id: 'e6c', sub: 'c', level: 'EMG', make: function (r, o) {
            return mc(r, 'The till is recounted and the supervisor reports ' + Dh(o.V2) + ' in the same two denominations. Without solving anything, why can that figure not be right?', [
              { html: 'Every bill is worth a multiple of ' + Dh(5) + ', so any total is a multiple of ' + Dh(5) + ' — and ' + Dh(o.V2) + ' is not.', right: true },
              { html: Dh(o.V2) + ' is ' + (o.V2 > o.V ? 'more' : 'less') + ' than ' + Dh(o.V) + ', so the number of bills would have to change.', why: 'A different mix of the same number of bills could change the total — but only in steps of ' + Dh(o.big - 5) + ', and always to a multiple of $5.' },
              { html: 'Solving the new system would give a negative number of bills.', why: 'Not the reason (and you were asked not to solve). Look at what kind of totals fives and ' + (o.big === 10 ? 'tens' : 'twenties') + ' can make.' },
              { html: 'It could be right — solve the new system to find out.', why: 'Fives and ' + (o.big === 10 ? 'tens' : 'twenties') + ' only make multiples of $5. ' + t(o.V2 + '\\div 5=' + N(o.V2 / 5)) + '.' }],
            'Every five-dollar and ' + (o.big === 10 ? 'ten' : 'twenty') + '-dollar bill is a multiple of $5, so any total is a multiple of $5. ' + t(N(o.V2) + '\\div 5=' + N(o.V2 / 5)) + ' is not whole, so <b>no combination of those bills makes ' + Dh(o.V2) + '</b>; the recount must be wrong.', ['What totals can you make with only fives and ' + (o.big === 10 ? 'tens' : 'twenties') + '?'], 'impossible total');
          } }] },
      /* ---------- Part D ---------- */
      { num: '7', section: 'Extra practice D — Numbers and dimensions',
        shared: function (r) { return gen(function () { var tt = r.int(2, 9), u = r.int(1, tt - 1); if (tt - u < 2 && r.chance(0.5)) return null; var dd = 9 * (tt - u), d2 = dd + r.pick([1, -1, 2]); return { t: tt, u: u, s: tt + u, d: dd, d2: d2 }; }, { t: 7, u: 4, s: 11, d: 27, d2: 28 }); },
        stem: function (o) { return 'The two digits of a two-digit number add to ' + t(o.s) + '. When the digits are reversed, the new number is ' + t(o.d) + ' <b>less</b> than the original number. Let ' + t('t') + ' be the tens digit and ' + t('u') + ' the units digit.'; },
        parts: [
          { id: 'e7a', sub: 'a', level: 'PRG', make: function (r, o) {
            return sysP('The original number is ' + t('10t+u') + ' and the reversed number is ' + t('10u+t') + '. Form the system.', [[1, 1, -o.s], [9, -9, -o.d]],
              { vars: ['t', 'u'], keyTex: ['t+u=' + o.s, '10u+t=(10t+u)-' + o.d], names: ['the digit sum', 'the reversal'], factHints: ['the digits add to ' + t(o.s) + '.', 'the reversed number equals the original minus ' + t(o.d) + '.'],
                wrong: [{ eq: [9, -9, o.d], code: 'rev-direction', hint: 'The reversed number is ' + t(o.d) + ' <b>less</b>: ' + t('10u+t=(10t+u)-' + o.d) + '.' }, { eq: [1, -1, -o.d], code: 'digits-diff', hint: 'Reversing changes the number itself, ' + t('10t+u') + ', not just the digits: ' + t('10u+t=(10t+u)-' + o.d) + '.' }, { eq: [1, -1, o.d], code: 'digits-diff', hint: 'Write the numbers, not the digits: original ' + t('10t+u') + ', reversed ' + t('10u+t') + '.' }],
                good: [['t+u=' + o.s, 't-u=' + o.d / 9]], bad: [['t+u=' + o.s, '10u+t=10t+u+' + o.d], ['t+u=' + o.s, 't-u=' + o.d]] },
              t('t+u=' + o.s) + ' and ' + t('10u+t=(10t+u)-' + o.d) + ' (which simplifies to ' + t('9t-9u=' + o.d) + ', i.e. ' + t('t-u=' + o.d / 9) + ').', ['Reversed number = original number − ' + o.d + '.'], 'digit system');
          } },
          { id: 'e7b', sub: 'b', level: 'PRG', make: function (r, o) {
            var num = 10 * o.t + o.u;
            return K.P.nr('Solve the system and state the original number.', num, function (v) {
              if (v === 10 * o.u + o.t) return { code: 'digits-reversed', hint: 'That’s the reversed number. The tens digit of the original is ' + t('t') + '.' };
              return null;
            }, t('10u+t-10t-u=-' + o.d) + ' ⟹ ' + t('9u-9t=-' + o.d) + ' ⟹ ' + t('t-u=' + o.d / 9) + '. With ' + t('t+u=' + o.s) + ', add: ' + t('2t=' + (o.s + o.d / 9)) + ' ⟹ ' + t('t=' + o.t) + ', ' + t('u=' + o.u) + '.<br>The number is ' + t('10(' + o.t + ')+' + o.u + '=' + num) + '. (' + t('(' + o.t + ',\\ ' + o.u + ')') + ' alone is not an answer: the question asks for a <b>number</b>, and those are only its digits.)',
              ['Simplify the reversal equation to ' + t('t-u=\\ldots') + ', then add it to ' + t('t+u=' + o.s) + '.'], 'digit number');
          } },
          { id: 'e7c', sub: 'c', level: 'BEG', make: function (r, o) {
            var num = 10 * o.t + o.u, rev = 10 * o.u + o.t;
            return mc(r, 'The answer is ' + t(num) + '. Which check tests it against <b>both sentences</b> of the problem?', [
              { html: 'Digits ' + o.t + ' and ' + o.u + ': ' + t(o.t + '+' + o.u + '=' + o.s) + ' ✓. Reversed: ' + t(rev) + ', and ' + t(num + '-' + rev + '=' + o.d) + ' ✓.', right: true },
              { html: t('t-u=' + o.d / 9) + ' and ' + t('t+u=' + o.s) + ' are both true for ' + t('t=' + o.t) + ', ' + t('u=' + o.u) + '.', why: 'That checks your <b>equations</b>, not the words. If an equation was mistranslated, this check can’t catch it.' },
              { html: t('10(' + o.t + ')+' + o.u + '=' + num) + ' and ' + t(o.t + '+' + o.u + '=' + o.s) + ' ✓.', why: 'This never tests the reversal sentence: reverse the digits and compare.' },
              { html: 'Reversed: ' + t(rev) + ', which is ' + t(o.d) + ' more than ' + t(num) + ' ✓.', why: 'Check the direction: ' + t(rev) + ' is <b>less</b> than ' + t(num) + ', as the problem says.' }],
            'Against the words: the digits of ' + num + ' add to ' + t(o.s) + ' ✓; reversing gives ' + rev + ', and ' + t(num + '-' + rev + '=' + o.d) + ' ✓. Both digits are whole numbers from 0 to 9 and the tens digit isn’t 0.', ['Test each sentence of the problem with the actual number.'], 'digit check');
          } },
          { id: 'e7d', sub: 'd', level: 'EMG', make: function (r, o) {
            var q = o.d2 / 9, tt = (o.s + q) / 2, uu = (o.s - q) / 2, tF = LS.toFr(tt), uF = LS.toFr(uu);
            return mc(r, 'Suppose the second sentence had said ' + t(o.d2) + ' less instead of ' + t(o.d) + ' less. What happens, and what does it mean?', [
              { html: 'Then ' + t('t-u=\\frac{' + o.d2 + '}{9}') + ', so ' + t('t=' + frT(tF[0], tF[1])) + ' and ' + t('u=' + frT(uF[0], uF[1])) + ' — not whole digits. No such two-digit number exists.', right: true },
              { html: 'The number becomes ' + t(10 * o.t + o.u + (o.d2 - o.d)) + '.', why: 'Changing the difference changes the digits, and reversing a two-digit number always changes it by a multiple of ' + t(9) + '. ' + t(o.d2) + ' is not one.' },
              { html: 'Round the digits: the number is ' + t(10 * Math.round(tt) + Math.round(uu)) + '.', why: 'Rounded digits no longer satisfy the conditions — check the reversal. The fractions mean there is <b>no</b> such number.' },
              { html: 'The system has no solution, because the lines are parallel.', why: 'The system still has one solution — it just isn’t made of whole digits.' }],
            t('9t-9u=' + o.d2) + ' ⟹ ' + t('t-u=\\frac{' + o.d2 + '}{9}') + '; with ' + t('t+u=' + o.s) + ': ' + t('t=' + frT(tF[0], tF[1])) + ', ' + t('u=' + frT(uF[0], uF[1])) + '. Neither is a whole number, so <b>no two-digit number fits</b>. Reversing a two-digit number always changes it by a multiple of 9, and ' + o.d2 + ' isn’t one.', ['Solve with the new number. Are the digits whole?'], 'impossible digit problem');
          } }] },
      { num: '8', shared: function (r) { return gen(function () { var w = 5 * r.int(4, 18), d = 5 * r.int(2, 10), l = w + d; return { w: w, d: d, l: l, P: 2 * (l + w) }; }, { w: 60, d: 35, l: 95, P: 310 }); },
        stem: function (o) { return 'A rectangular banner has a perimeter of ' + t(o.P + '\\text{ cm}') + ', and its length exceeds its width by ' + t(o.d + '\\text{ cm}') + '. Let ' + t('l') + ' be the length and ' + t('w') + ' the width, in centimetres.'; },
        parts: [
          { id: 'e8a', sub: 'a', level: 'BEG', make: function (r, o) {
            return sysP('Write the system. Take care with the order of the subtraction in the second equation.', [[2, 2, -o.P], [1, -1, -o.d]],
              { vars: ['l', 'w'], keyTex: ['2l+2w=' + o.P, 'l-w=' + o.d], names: ['the perimeter', 'the difference'], factHints: ['perimeter: ' + t('2l+2w') + '.', 'length exceeds width: ' + t('l-w') + '.'],
                wrong: [{ eq: [-1, 1, -o.d], code: 'diff-order', hint: '“Length exceeds width” puts ' + t('l') + ' first: ' + t('l-w=' + o.d) + '.' }, { eq: [1, 1, -o.P], code: 'perim-half', hint: 'Perimeter: all four sides, ' + t('2l+2w=' + o.P) + '.' }], bad: [['2l+2w=' + o.P, 'w-l=' + o.d], ['l+w=' + o.P, 'l-w=' + o.d]] },
              t('2l+2w=' + o.P) + ' and ' + t('l-w=' + o.d) + ' (never ' + t('w-l') + ').', ['Which is bigger, the length or the width?'], 'banner system');
          } },
          { id: 'e8b', sub: 'b', level: 'BEG', make: function (r, o) {
            return numsP('Solve the system and verify in both original equations.', [{ label: 'Length', after: 'cm' }, { label: 'Width', after: 'cm' }], [o.l, o.w],
              { names: ['length', 'width'], sys: [[1, 1, -o.P / 2], [1, -1, -o.d]], sysNames: ['the perimeter', 'the difference'], swapHint: 'The length is the longer side — it exceeds the width by ' + o.d + ' cm.', wrong: [{ v: [(o.P + o.d) / 2, (o.P - o.d) / 2], code: 'perim-half', hint: 'Check the perimeter: ' + t('2l+2w=' + o.P) + ' gives ' + t('l+w=' + o.P / 2) + '.' }] },
              'Divide the first by 2: ' + t('l+w=' + o.P / 2) + '. Add ' + t('l-w=' + o.d) + ': ' + t('2l=' + (o.P / 2 + o.d)) + ' ⟹ ' + t('l=' + o.l) + ', ' + t('w=' + o.w) + '.<br>' + chk('Check: ' + t('2(' + o.l + ')+2(' + o.w + ')=' + o.P)) + ', ' + chk(t(o.l + '-' + o.w + '=' + o.d)),
              ['Halve the perimeter equation, then add the two equations.'], 'banner solve');
          } },
          { id: 'e8c', sub: 'c', level: 'EMG', make: function (r, o) {
            return numP('Find the dimensions of the banner, then give its area.', o.l * o.w, function (v) { if (v === o.P || v === o.P / 2) return { code: 'area-perim', hint: 'That’s the perimeter (or half). Area = length × width.' }; if (v === o.l || v === o.w) return { code: 'dim-not-area', hint: 'That’s one dimension; multiply length × width.' }; return null; },
              t('2l+2w=' + o.P) + ', ' + t('l-w=' + o.d) + ' ⟹ ' + t('l=' + o.l) + ', ' + t('w=' + o.w) + '. <b>The banner is ' + o.l + ' cm long and ' + o.w + ' cm wide.</b><br>Area ' + t('=' + o.l + '\\times ' + o.w + '=' + N(o.l * o.w)) + '. <b>The area of the banner is ' + N(o.l * o.w) + ' cm².</b>',
              ['Find the length and width, then multiply.'], 'banner area', { after: 'cm²' });
          } },
          { id: 'e8d', sub: 'd', level: 'EMG', make: function (r, o) {
            return mc(r, 'A classmate wrote the second equation as ' + t('l-w=-' + o.d) + '. What does their system give, and which words rule it out?', [
              { html: t('l=' + o.w) + ', ' + t('w=' + o.l) + ': the banner would be wider than it is long, contradicting “its length exceeds its width by ' + o.d + ' cm”.', right: true },
              { html: t('l=' + o.w) + ', ' + t('w=' + o.l) + ': it contradicts the perimeter of ' + o.P + ' cm.', why: 'The perimeter still works: ' + t('2(' + o.w + ')+2(' + o.l + ')=' + o.P) + '. Only the “length exceeds width” sentence catches the swap.' },
              { html: 'The same answer, ' + t('l=' + o.l) + ', ' + t('w=' + o.w) + ' — the sign doesn’t matter.', why: 'Solve it: ' + t('l+w=' + o.P / 2) + ' and ' + t('l-w=-' + o.d) + ' give ' + t('2l=' + (o.P / 2 - o.d)) + ', so ' + t('l=' + o.w) + '.' },
              { html: 'Negative dimensions, which are impossible for a banner.', why: 'Solve it: both dimensions come out positive (' + o.w + ' and ' + o.l + ') — just swapped.' }],
            t('l+w=' + o.P / 2) + ' and ' + t('l-w=-' + o.d) + ' ⟹ ' + t('2l=' + (o.P / 2 - o.d)) + ', ' + t('l=' + o.w) + ', ' + t('w=' + o.l) + '. The banner would be wider than long, contradicting <i>“its length exceeds its width by ' + o.d + ' cm”</i>. The perimeter equation can’t detect the swap — only the sentence can.', ['Solve their system, then test the result against each sentence.'], 'swapped difference');
          } }] },
      /* ---------- Part E ---------- */
      { num: '9', section: 'Extra practice E — Two-part plans and a fundraiser',
        shared: function (r) {
          return gen(function () { var rA = r.int(3, 12), rB = rA + r.int(4, 12), Dd = r.int(6, 25), m = 100 * Dd / (rB - rA); if (!Number.isInteger(m) || m % 10 || m < 50 || m > 400) return null; var FB = r.int(5, 20), FA = FB + Dd, M = m + r.pick([-1, 1]) * 10 * r.int(3, 8); if (M <= 0) return null; return { FA: FA, FB: FB, rA: rA / 100, rB: rB / 100, m: m, C: FA + rA * m / 100, M: M }; }, { FA: 21, FB: 9, rA: 0.06, rB: 0.14, m: 150, C: 30, M: 200 });
        },
        stem: function (o) { return 'Two phone plans are on offer. <b>Plan A</b> charges ' + Dh(o.FA) + ' per month plus ' + Dh(o.rA) + ' per minute of calling. <b>Plan B</b> charges ' + Dh(o.FB) + ' per month plus ' + Dh(o.rB) + ' per minute. Let ' + t('m') + ' be the number of minutes of calling in a month and ' + t('C') + ' the monthly cost in dollars.'; },
        parts: [
          { id: 'e9a', sub: 'a', level: 'BEG', make: function (r, o) {
            return sysP('Write one equation for each plan.', [[-o.rA * 100, 100, -100 * o.FA], [-o.rB * 100, 100, -100 * o.FB]],
              { vars: ['m', 'C'], keyTex: ['C=' + o.FA + '+' + m2(o.rA) + 'm', 'C=' + o.FB + '+' + m2(o.rB) + 'm'], labels: ['Plan A', 'Plan B'], names: ['Plan A', 'Plan B'], factHints: ['Plan A: ' + Dh(o.FA) + ' fixed plus ' + Dh(o.rA) + ' for each minute.', 'Plan B: ' + Dh(o.FB) + ' fixed plus ' + Dh(o.rB) + ' for each minute.'],
                wrong: [{ eq: [-o.FA, 1, -o.rA], code: 'rate-fixed', hint: 'The monthly fee is the fixed part (it doesn’t multiply ' + t('m') + '); the per-minute charge multiplies ' + t('m') + '.' }, { eq: [-o.FB, 1, -o.rB], code: 'rate-fixed', hint: 'The monthly fee is the fixed part; the per-minute charge multiplies ' + t('m') + '.' }],
                bad: [['C=' + o.FA + 'm+' + m2(o.rA), 'C=' + o.FB + '+' + m2(o.rB) + 'm']] },
              'Plan A: ' + t('C=' + o.FA + '+' + m2(o.rA) + 'm') + '. Plan B: ' + t('C=' + o.FB + '+' + m2(o.rB) + 'm') + '. The fee is the fixed part (intercept); the per-minute charge is the rate (slope).', ['Cost = fixed fee + (rate per minute) × (minutes).'], 'phone plan system');
          } },
          { id: 'e9b', sub: 'b', level: 'EMG', make: function (r, o) {
            return numsP('Solve the system.', [{ label: 'Minutes, ' + t('m') }, { label: 'Cost, ' + t('C'), before: '$' }], [o.m, o.C],
              { names: ['number of minutes', 'cost'], money: true, sys: [[-o.rA * 100, 100, -100 * o.FA], [-o.rB * 100, 100, -100 * o.FB]], sysNames: ['Plan A', 'Plan B'] },
              'Set the costs equal: ' + t(o.FA + '+' + m2(o.rA) + 'm=' + o.FB + '+' + m2(o.rB) + 'm') + ' ⟹ ' + t((o.FA - o.FB) + '=' + m2(o.rB - o.rA) + 'm') + ' ⟹ ' + t('m=' + o.m) + '. ' + t('C=' + o.FA + '+' + m2(o.rA) + '(' + o.m + ')=' + m2(o.C)) + '.<br>' + chk('Check in B: ' + t(o.FB + '+' + m2(o.rB) + '(' + o.m + ')=' + m2(o.C))),
              ['Both equations are solved for ' + t('C') + ': set them equal.'], 'phone plan solve');
          } },
          { id: 'e9c', sub: 'c', level: 'BEG', make: function (r, o) {
            return mc(r, 'The solution is ' + t('(' + o.m + ',\\ ' + mon(o.C) + ')') + '. What does it mean?', [
              { html: 'At ' + o.m + ' minutes of calling a month, the two plans cost the same: ' + Dh(o.C) + ' each.', right: true },
              { html: 'Plan A costs ' + Dh(o.m) + ' and Plan B costs ' + Dh(o.C) + '.', why: 'The first coordinate is <b>minutes</b>, not dollars: both plans cost ' + Dh(o.C) + ' at ' + o.m + ' minutes.' },
              { html: 'Plan B is always ' + Dh(o.C) + ' cheaper.', why: 'The solution is where the costs are <b>equal</b>.' },
              { html: 'You should always call ' + o.m + ' minutes a month.', why: 'It only tells you where the two costs meet; which is cheaper depends on how much you call.' }],
            t('m=' + o.m) + ' and ' + t('C=' + mon(o.C)) + ': <b>the two plans cost the same at ' + o.m + ' minutes of calling per month, and that month costs ' + Dh(o.C) + ' on either plan.</b>', ['What do ' + t('m') + ' and ' + t('C') + ' stand for?'], 'meaning of break-even');
          } },
          { id: 'e9d', sub: 'd i', level: 'BEG', make: function (r, o) {
            var A = o.FA + o.rA * o.M, B = o.FB + o.rB * o.M;
            return numsP('A customer calls about ' + t(o.M) + ' minutes a month. What would each plan cost?', [money('Plan A'), money('Plan B')], [rnd(A), rnd(B)],
              { names: ['Plan A cost', 'Plan B cost'], money: true, wrong: [{ v: [rnd(o.FA + o.rB * o.M), rnd(o.FB + o.rA * o.M)], code: 'value-swap', hint: 'Use each plan’s own rate: Plan A charges ' + Dh(o.rA) + ' per minute.' }] },
              'Plan A: ' + t(o.FA + '+' + m2(o.rA) + '(' + o.M + ')=' + m2(A)) + '. Plan B: ' + t(o.FB + '+' + m2(o.rB) + '(' + o.M + ')=' + m2(B)) + '.', ['Substitute ' + t('m=' + o.M) + ' into each plan’s equation.'], 'plan costs at M');
          } },
          { id: 'e9d2', sub: 'd ii', level: 'EMG', make: function (r, o) {
            var A = rnd(o.FA + o.rA * o.M), B = rnd(o.FB + o.rB * o.M), aCheap = A < B;
            return mc(r, 'At ' + t(o.M) + ' minutes Plan A costs ' + Dh(A) + ' and Plan B costs ' + Dh(B) + '. Which plan should the customer take, and why didn’t the solution of the system answer this on its own?', [
              { html: (aCheap ? 'Plan A' : 'Plan B') + ', saving ' + Dh(Math.abs(A - B)) + ' a month. The solution only shows where the costs are <b>equal</b> (' + o.m + ' min); which is cheaper on each side has to be tested.', right: true },
              { html: (aCheap ? 'Plan B' : 'Plan A') + ', because it has the ' + (aCheap ? 'lower monthly fee' : 'lower rate per minute') + '.', why: 'Compare the actual costs at ' + o.M + ' minutes: ' + Dh(A) + ' vs ' + Dh(B) + '.' },
              { html: 'Either one — the solution says they cost the same.', why: 'They cost the same only at ' + o.m + ' minutes, not at ' + o.M + '.' },
              { html: (aCheap ? 'Plan A' : 'Plan B') + ', because ' + o.M + ' is ' + (o.M > o.m ? 'more' : 'less') + ' than ' + o.m + ' and the bigger fee always wins.', why: 'Right plan, wrong reason: it depends on the costs at ' + o.M + ' minutes, which you have to calculate.' }],
            'At ' + o.M + ' min: Plan A ' + Dh(A) + ', Plan B ' + Dh(B) + '. <b>Take ' + (aCheap ? 'Plan A' : 'Plan B') + ', saving ' + Dh(Math.abs(A - B)) + ' per month.</b> The solution ' + t('(' + o.m + ',\\ ' + mon(o.C) + ')') + ' only locates where the costs are equal.', ['Compare the two costs at ' + o.M + ' minutes.'], 'which plan');
          } }] },
      { num: '10', shared: function (r) {
          return gen(function () { var B = 5 * r.int(5, 12), rG = 0.2 * r.int(1, 3), rS = rG + 0.2 * r.int(1, 2), FG = 5 * r.int(3, 7), FS = 5 * r.int(1, 3); var AG = rnd(FG + rG * B), AS = rnd(FS + rS * B); if (AG <= AS || !Number.isInteger(AG) || !Number.isInteger(AS)) return null; var g = r.int(3, 12), s = r.int(3, 12); if (g === s) return null; var T = AG * g + AS * s, goal = 50 * Math.ceil((T + AG + 1) / 50); var need = Math.ceil((goal - T) / AG); if ((goal - T) % AG === 0 || need < 2 || need > 5) return null; return { B: B, rG: rnd(rG), rS: rnd(rS), FG: FG, FS: FS, AG: AG, AS: AS, g: g, s: s, N: g + s, T: T, goal: goal, need: need }; },
            { B: 45, rG: 0.4, rS: 0.6, FG: 25, FS: 10, AG: 43, AS: 37, g: 7, s: 9, N: 16, T: 634, goal: 700, need: 2 });
        },
        stem: function (o) { return 'In a read-a-thon, a <b>Gold</b> sponsor pledges a flat ' + Dh(o.FG) + ' plus ' + Dh(o.rG) + ' for every book read, and a <b>Silver</b> sponsor pledges a flat ' + Dh(o.FS) + ' plus ' + Dh(o.rS) + ' for every book read. Dana read ' + t(o.B) + ' books. She had ' + t(o.N) + ' sponsors in total, and they pledged ' + Dh(o.T) + ' altogether.'; },
        parts: [
          { id: 'e10a', sub: 'a i', level: 'BEG', make: function (r, o) {
            return numsP('How much does one Gold sponsor owe, and one Silver sponsor?', [money('Gold'), money('Silver')], [o.AG, o.AS],
              { names: ['Gold amount', 'Silver amount'], money: true, wrong: [{ v: [rnd(o.rG * o.B), rnd(o.rS * o.B)], code: 'flat-missing', hint: 'Add the flat part too: Gold is ' + Dh(o.FG) + ' <b>plus</b> ' + Dh(o.rG) + ' per book.' }] },
              'Gold: ' + t(o.FG + '+' + m2(o.rG) + '(' + o.B + ')=' + o.FG + '+' + N(o.rG * o.B) + '=' + o.AG) + '. Silver: ' + t(o.FS + '+' + m2(o.rS) + '(' + o.B + ')=' + o.FS + '+' + N(o.rS * o.B) + '=' + o.AS) + '.', ['Flat amount + (rate per book) × (books read).'], 'pledge amounts');
          } },
          { id: 'e10a2', sub: 'a ii', level: 'LIM', make: function (r, o) {
            return mc(r, 'In the Gold pledge, which part is <b>fixed</b> and which is <b>variable</b>?', [
              { html: 'The ' + Dh(o.FG) + ' is fixed (owed whatever Dana reads); the ' + Dh(o.rG) + ' per book is variable.', right: true },
              { html: 'The ' + Dh(o.rG) + ' per book is fixed; the ' + Dh(o.FG) + ' is variable.', why: 'The ' + Dh(o.FG) + ' doesn’t depend on how many books she reads — it is the fixed part.' },
              { html: 'Both parts are fixed, because Dana read ' + o.B + ' books.', why: 'The per-book part changes with the number of books; it only becomes a number once the ' + o.B + ' books are known.' },
              { html: 'Both parts are variable.', why: 'The flat ' + Dh(o.FG) + ' is owed no matter what.' }],
            'The flat ' + Dh(o.FG) + ' is the <b>fixed</b> part; the ' + Dh(o.rG) + ' per book is the <b>variable</b> part.', ['Which part would change if Dana read more books?'], 'fixed vs variable');
          } },
          { id: 'e10b', sub: 'b', level: 'EMG', make: function (r, o) {
            return sysP('One Gold sponsor owes ' + Dh(o.AG) + ' and one Silver sponsor ' + Dh(o.AS) + '. Let ' + t('g') + ' be the number of Gold sponsors and ' + t('s') + ' the number of Silver sponsors. Write the system.', [[1, 1, -o.N], [o.AG, o.AS, -o.T]],
              { vars: ['g', 's'], keyTex: ['g+s=' + o.N, o.AG + 'g+' + o.AS + 's=' + o.T], names: ['the number of sponsors', 'the total pledged'], factHints: ['count the sponsors.', 'each Gold sponsor gives ' + Dh(o.AG) + ', each Silver ' + Dh(o.AS) + '.'],
                wrong: [{ eq: [o.FG, o.FS, -o.T], code: 'flat-missing', hint: 'Each sponsor gives the flat part <b>and</b> the per-book part: Gold ' + Dh(o.AG) + ', Silver ' + Dh(o.AS) + '.' }, { eq: [o.AS, o.AG, -o.T], code: 'value-swap', hint: 'Each Gold sponsor owes ' + Dh(o.AG) + ': ' + t(o.AG + 'g') + '.' }], bad: [['g+s=' + o.N, o.AS + 'g+' + o.AG + 's=' + o.T]] },
              t('g+s=' + o.N) + ' and ' + t(o.AG + 'g+' + o.AS + 's=' + o.T) + '.', ['One equation counts sponsors, the other totals the money.'], 'sponsor system');
          } },
          { id: 'e10c', sub: 'c', level: 'EMG', make: function (r, o) {
            return numsP('Solve the system. How many sponsors of each kind does Dana have?', [{ label: 'Gold' }, { label: 'Silver' }], [o.g, o.s],
              { names: ['number of Gold sponsors', 'number of Silver sponsors'], sys: [[1, 1, -o.N], [o.AG, o.AS, -o.T]], sysNames: ['the number of sponsors', 'the total pledged'] },
              'Each Gold sponsor owes ' + Dh(o.AG) + ', each Silver ' + Dh(o.AS) + ': ' + t('g+s=' + o.N) + ', ' + t(o.AG + 'g+' + o.AS + 's=' + o.T) + '.<br>' + t('s=' + o.N + '-g') + ': ' + t(o.AG + 'g+' + o.AS + '(' + o.N + '-g)=' + o.T) + ' ⟹ ' + t(cf(o.AG - o.AS, 'g') + '=' + (o.T - o.AS * o.N)) + ' ⟹ ' + t('g=' + o.g) + ', ' + t('s=' + o.s) + '.<br>' + chk('Check: ' + t(o.g + '+' + o.s + '=' + o.N)) + ', ' + chk(t(o.AG + '(' + o.g + ')+' + o.AS + '(' + o.s + ')=' + o.T)) + ' Both are whole and positive.',
              ['Work out what one Gold and one Silver sponsor owe (flat + per book × ' + o.B + '), then write the count and money equations.'], 'sponsor counts');
          } },
          { id: 'e10d', sub: 'd', level: 'PRG', make: function (r, o) {
            return numP('Dana has ' + t(o.g) + ' Gold and ' + t(o.s) + ' Silver sponsors. Her band needs ' + Dh(o.goal) + '. If every additional sponsor she signs is a Gold sponsor and she still reads ' + t(o.B) + ' books, how many more sponsors does she need?', o.need, function (v) {
              if (v === o.need - 1) return { code: 'round-down', hint: 'Check: ' + t(o.need - 1) + ' more Gold sponsors give ' + t(o.T + '+' + (o.need - 1) * o.AG + '=' + (o.T + (o.need - 1) * o.AG)) + ', which is still short of ' + Dh(o.goal) + '. Round <b>up</b>.' };
              if (near(v, (o.goal - o.T) / o.AG)) return { code: 'round-down', hint: 'A number of sponsors must be whole — and here it must be rounded <b>up</b>.' };
              return null;
            }, 'She still needs ' + t(o.goal + '-' + o.T + '=' + (o.goal - o.T)) + ' dollars, and each Gold sponsor brings ' + Dh(o.AG) + ' (' + t(o.FG + '+' + m2(o.rG) + '(' + o.B + ')') + ').<br>' + t((o.goal - o.T) + '\\div ' + o.AG + '\\approx ' + N(Math.round((o.goal - o.T) / o.AG * 100) / 100)) + '. ' + (o.need - 1) + ' more gives ' + Dh(o.T + (o.need - 1) * o.AG) + ' (not enough); ' + o.need + ' give ' + Dh(o.T + o.need * o.AG) + '.<br><b>Dana needs ' + o.need + ' more Gold sponsors</b> — a count must be whole, and here it must round <b>up</b>.',
              ['How much more money is needed? How much does one Gold sponsor bring?'], 'sponsors needed');
          } }] },
      /* ---------- Part F ---------- */
      { num: '11', section: 'Extra practice F — When the algebra is right and the answer is not',
        shared: function (r) { return gen(function () { var p1 = r.int(1, 3), p2 = p1 + r.int(1, 2), Nn = 10 * r.int(6, 15), c = Nn + 10 * r.int(2, 8), h = Nn - c; return { p1: p1, p2: p2, N: Nn, c: c, h: h, T: p1 * h + p2 * c }; }, { p1: 2, p2: 3, N: 120, c: 180, h: -60, T: 420 }); },
        stem: function (o) { return 'A youth club sells hot chocolate at ' + Dh(o.p1) + ' a cup and cookies at ' + Dh(o.p2) + ' each, and nothing else. The Friday cash sheet records ' + t(o.N) + ' items sold for ' + Dh(o.T) + ' in total. Let ' + t('h') + ' be the number of cups of hot chocolate and ' + t('c') + ' the number of cookies sold.'; },
        parts: [
          { id: 'e11a', sub: 'a', level: 'EMG', make: function (r, o) {
            return numsP('Write the system and solve it.', [{ label: 'Hot chocolate, ' + t('h') }, { label: 'Cookies, ' + t('c') }], [o.h, o.c],
              { names: ['value of h', 'value of c'], sys: [[1, 1, -o.N], [o.p1, o.p2, -o.T]], sysNames: ['the item count', 'the money total'], wrong: [{ v: [-o.h, o.c], code: 'sign-count', hint: 'Check the sign: ' + t('h=' + o.N + '-' + o.c) + '. Substitute into both equations.' }] },
              t('h+c=' + o.N) + ', ' + t(cf(o.p1, 'h') + '+' + o.p2 + 'c=' + o.T) + '. ' + t('h=' + o.N + '-c') + ': ' + t((o.p1 === 1 ? '' : o.p1) + '(' + o.N + '-c)+' + o.p2 + 'c=' + o.T) + ' ⟹ ' + t((o.p1 * o.N) + '+' + (o.p2 - o.p1 === 1 ? '' : o.p2 - o.p1) + 'c=' + o.T) + ' ⟹ ' + t('c=' + o.c) + ', ' + t('h=' + o.N + '-' + o.c + '=' + o.h) + '.',
              ['Count equation and money equation, then substitute. Don’t worry if a value looks strange — report what the algebra gives.'], 'cash sheet solve');
          } },
          { id: 'e11b', sub: 'b', level: 'EMG', make: function (r, o) {
            return mc(r, 'Solving gives ' + t('(h,\\ c)=(' + o.h + ',\\ ' + o.c + ')') + ', and the pair satisfies both equations. Why must it still be rejected?', [
              { html: 'The club can’t sell ' + t(o.h) + ' cups of hot chocolate, and ' + o.c + ' cookies is more than the ' + o.N + ' items sold altogether.', right: true },
              { html: 'The algebra must be wrong — redo the substitution.', why: 'The pair satisfies both equations exactly. The algebra is fine; the <b>situation</b> is impossible.' },
              { html: 'It shouldn’t be rejected: read ' + t(o.h) + ' as ' + t(-o.h) + ' cups.', why: 'Then the totals no longer check: ' + t(-o.h + '+' + o.c + '\\ne ' + o.N) + '.' },
              { html: 'Because ' + o.c + ' cookies would cost too much to make.', why: 'Nothing in the story is about cost to make. The problem is a <b>negative</b> count.' }],
            'Check: ' + t(o.h + '+' + o.c + '=' + o.N) + ' ✓, ' + t(o.p1 + '(' + o.h + ')+' + o.p2 + '(' + o.c + ')=' + o.T) + ' ✓ — but a count can’t be negative, and ' + o.c + ' cookies exceeds the ' + o.N + ' items. <b>Reject it.</b>', ['Check the pair against the words: can a count be negative?'], 'reject negative count');
          } },
          { id: 'e11c', sub: 'c', level: 'EMG', make: function (r, o) {
            return numP('The rejection says the cash sheet is wrong. What is the <b>largest</b> amount ' + t(o.N) + ' items could possibly have raised?', o.p2 * o.N, function (v) {
              if (v === o.p1 * o.N) return { code: 'max-wrong', hint: 'That’s the <b>smallest</b> possible total (all hot chocolate). The largest is when every item is a cookie.' };
              if (v === (o.p1 + o.p2) * o.N) return { code: 'max-wrong', hint: 'Each item is either a cup <b>or</b> a cookie — the most an item can bring in is ' + Dh(o.p2) + '.' };
              return null;
            }, 'The most is when every item is a cookie: ' + t(o.N + '\\times ' + o.p2 + '=' + o.p2 * o.N) + '. Since ' + Dh(o.T) + ' > ' + Dh(o.p2 * o.N) + ', no whole, non-negative counts could give that total — the <b>cash sheet</b> is wrong, not the algebra.',
              ['What if every item were the dearer one?'], 'largest possible total', { money: true, before: '$' });
          } }] },
      { num: '12', shared: function (r) {
          return gen(function () { var c1 = r.pick([7, 8, 9, 9, 10, 12]), c2 = r.pick([20, 24, 24, 30, 36]), V = r.int(8, 16), S = r.int(c1 * V + 20, c2 * V - 20), num = c2 * V - S, den = c2 - c1; if (num % den === 0) return null; var v = num / den; if (v <= 1 || v >= V - 1) return null; // nearest workable request
            var best = null; for (var dS = 1; dS < 40 && !best; dS++) [S - dS, S + dS].forEach(function (S2) { if (!best && (c2 * V - S2) % den === 0) { var vv = (c2 * V - S2) / den; if (vv >= 0 && vv <= V) best = { S2: S2, v2: vv, b2: V - vv }; } });
            if (!best) return null; return { c1: c1, c2: c2, V: V, S: S, num: num, den: den, best: best }; },
            { c1: 9, c2: 24, V: 14, S: 250, num: 86, den: 15, best: { S2: 246, v2: 6, b2: 8 } });
        },
        stem: function (o) { return 'A school books minivans seating ' + t(o.c1) + ' students each and buses seating ' + t(o.c2) + ' students each. It wants ' + t(o.V) + ' vehicles carrying exactly ' + t(o.S) + ' students, with every seat filled. Let ' + t('v') + ' be the number of minivans and ' + t('b') + ' the number of buses.'; },
        parts: [
          { id: 'e12a', sub: 'a', level: 'PRG', make: function (r, o) {
            var vF = LS.toFr(o.num / o.den), bF = LS.toFr(o.V - o.num / o.den), vT = frT(vF[0], vF[1]), bT = frT(bF[0], bF[1]);
            var p = { prompt: 'Write the system and solve it exactly — leave the values as fractions.', input: { type: 'fields', fields: [{ label: t('v') + ' =', mode: 'math', keys: 'fraction', placeholder: ' ' }, { label: t('b') + ' =', mode: 'math', keys: 'fraction', placeholder: ' ' }] },
              check: (function () { var c = K.fields([K.fraction(vF), K.fraction(bF)], { labels: ['Minivans', 'Buses'] }), cs = K.fields([K.fraction(bF), K.fraction(vF)], {}); return function (resp) { var res = c(resp); if (res.v === 'wrong' && cs(resp).v === 'correct') return wrong('swap-answer', 'Right values, wrong boxes: ' + t('v') + ' is the number of minivans.'); return res; }; })(),
              key: [vT, bT], answer: t('v=' + vT) + ', ' + t('b=' + bT), text: 'vehicle booking fractions',
              solution: t('v+b=' + o.V) + ', ' + t(o.c1 + 'v+' + o.c2 + 'b=' + o.S) + '. ' + t('b=' + o.V + '-v') + ': ' + t(o.c1 + 'v+' + o.c2 + '(' + o.V + '-v)=' + o.S) + ' ⟹ ' + t((o.c2 * o.V) + '-' + o.den + 'v=' + o.S) + ' ⟹ ' + t(o.den + 'v=' + o.num) + ' ⟹ ' + t('v=' + vT) + ', ' + t('b=' + o.V + '-' + vT + '=' + bT) + '.',
              hints: ['Count equation: ' + t('v+b=' + o.V) + '. Seat equation: ' + t(o.c1 + 'v+' + o.c2 + 'b=' + o.S) + '.'], bad: [[bT, vT]] };
            return p;
          } },
          { id: 'e12b', sub: 'b', level: 'EMG', make: function (r, o) {
            var vv = o.num / o.den, rv = Math.round(vv), rb = o.V - rv;
            return mc(r, 'The system gives ' + t('v=\\frac{' + o.num + '}{' + o.den + '}\\approx ' + N(Math.round(vv * 10) / 10)) + '. The algebra is faultless. Why must the answer still be rejected?', [
              { html: 'A school can’t book a fraction of a minivan, so <b>no booking of ' + o.V + ' vehicles seats exactly ' + o.S + ' students</b> with every seat filled.', right: true },
              { html: 'Round it: book ' + rv + ' minivans and ' + rb + ' buses.', why: 'Test it: ' + t(o.c1 + '(' + rv + ')+' + o.c2 + '(' + rb + ')=' + (o.c1 * rv + o.c2 * rb)) + ' students, not ' + o.S + '.' },
              { html: 'Fractions mean the algebra went wrong somewhere.', why: 'The fractions satisfy both equations exactly. It is the <b>request</b> that is impossible.' },
              { html: 'Book ' + o.num + ' minivans and ' + (o.V * o.den - o.num) + ' buses instead.', why: 'Those are the numerators of the fractions, not a booking of ' + o.V + ' vehicles.' }],
            'The pair satisfies both equations, but a count of vehicles must be whole. <b>No booking of ' + o.V + ' vehicles seats exactly ' + o.S + ' students with every seat filled.</b>', ['Can you book part of a minivan?'], 'reject fractional booking');
          } },
          { id: 'e12c', sub: 'c', level: 'ADV', make: function (r, o) {
            var c1 = o.c1, c2 = o.c2, V = o.V, b0 = o.best;
            return { prompt: 'Keep ' + t(o.V) + ' vehicles but change the number of students so that a whole-number booking is possible. Give the new number of students and the booking it produces.',
              input: { type: 'fields', fields: [{ label: 'Students' }, { label: 'Minivans' }, { label: 'Buses' }] },
              check: function (resp) {
                resp = resp || []; var v = [];
                for (var i = 0; i < 3; i++) { var s = String(resp[i] == null ? '' : resp[i]).trim(); if (!s) return form('empty', 'Fill in all three boxes.'); var q = HW.parse.number(s); if (!q.ok) return form('notnumber', 'Enter a whole number in each box.'); v.push(q.value); }
                if (v.some(function (x) { return !Number.isInteger(x); })) return wrong('not-whole', 'A booking has to use whole numbers of students, minivans and buses.');
                if (v[1] < 0 || v[2] < 0) return wrong('booking-wrong', 'The numbers of vehicles can’t be negative.');
                if (v[1] + v[2] !== V) return wrong('booking-wrong', 'Keep ' + t(V) + ' vehicles: your minivans and buses add to ' + t(v[1] + v[2]) + '.');
                if (c1 * v[1] + c2 * v[2] !== v[0]) return wrong('booking-wrong', 'With every seat filled, ' + t(v[1]) + ' minivans and ' + t(v[2]) + ' buses carry ' + t(c1 + '(' + v[1] + ')+' + c2 + '(' + v[2] + ')=' + (c1 * v[1] + c2 * v[2])) + ' students, not ' + t(v[0]) + '.');
                if (v[0] === o.S) return wrong('same-request', 'That is the original request, which has no whole-number booking.');
                return ok();
              },
              key: [String(b0.S2), String(b0.v2), String(b0.b2)], answer: 'For example ' + b0.S2 + ' students: ' + b0.v2 + ' minivans and ' + b0.b2 + ' buses (any whole booking of ' + V + ' vehicles is correct).', text: 'fix the booking',
              solution: 'Keep ' + t(V) + ' vehicles: ' + t(c2 * V + '-' + o.den + 'v=S') + ', so ' + t('S') + ' must leave ' + t(c2 * V + '-S') + ' divisible by ' + t(o.den) + '.<br>For example ' + t('S=' + b0.S2) + ': ' + t(o.den + 'v=' + (c2 * V - b0.S2)) + ', ' + t('v=' + b0.v2) + ', ' + t('b=' + b0.b2) + '. ' + chk('Check: ' + t(b0.v2 + '+' + b0.b2 + '=' + V)) + ', ' + chk(t(c1 + '(' + b0.v2 + ')+' + c2 + '(' + b0.b2 + ')=' + b0.S2)) + '<br>(Any booking of whole numbers of minivans and buses that add to ' + V + ' works — e.g. ' + t(V + '') + ' buses carry ' + c2 * V + ' students.)',
              hints: ['Choose any whole numbers of minivans and buses that add to ' + t(V) + ', then count the seats.'], good: [[String(c2 * V), '0', String(V)], [String(c1 * V), String(V), '0']], bad: [[String(o.S), String(b0.v2), String(b0.b2)], [String(b0.S2), String(b0.v2 + 1), String(b0.b2)]] };
          } }] },
      { num: '13', shared: function (r) {
          return gen(function () { var a = r.int(6, 12), b = r.int(3, a - 2), S = 25 * r.int(8, 24), d = r.int(1, 4); var shift = (a - b) * d * 100 / (a + b); if (!Number.isInteger(shift) || shift % 5) return null; var L2 = S - shift; if (L2 <= 50) return null; var T = (a + b) * S + b * d * 100; if (T % 100 && T % 50) return null; return { a: a, b: b, S: S / 100, L: S / 100 + d, d: d, T: T / 100, sL: L2 / 100, sS: L2 / 100 + d }; },
            { a: 10, b: 6, S: 3.75, L: 6.75, d: 3, T: 78, sL: 3, sS: 6 });
        },
        stem: function (o) { return 'A stall sells kettle corn in two sizes. A <b>large</b> bag costs ' + Dh(o.d) + ' more than a <b>small</b> bag, and ' + nw(o.a) + ' small bags together with ' + nw(o.b) + ' large bags cost ' + Dh(o.T) + '. A student defines ' + t('S') + ' as the price of a small bag and ' + t('L') + ' as the price of a large bag (dollars), writes ' + t('S=L+' + o.d) + ' and ' + t(o.a + 'S+' + o.b + 'L=' + mon(o.T)) + ', solves, and reports ' + t('(S,\\ L)=(' + mon(o.sS) + ',\\ ' + mon(o.sL) + ')') + '.'; },
        parts: [
          { id: 'e13a', sub: 'a', level: 'LIM', make: function (r, o) {
            return mc(r, 'Substitute ' + t('(' + mon(o.sS) + ',\\ ' + mon(o.sL) + ')') + ' into <b>both</b> of the student’s equations. What do you find?', [
              { html: 'It satisfies both of the student’s equations exactly.', right: true },
              { html: 'It satisfies ' + t('S=L+' + o.d) + ' only.', why: 'Check the second: ' + t(o.a + '(' + mon(o.sS) + ')+' + o.b + '(' + mon(o.sL) + ')=' + mon(o.T)) + ' ✓.' },
              { html: 'It satisfies ' + t(o.a + 'S+' + o.b + 'L=' + mon(o.T)) + ' only.', why: 'Check the first: ' + t(mon(o.sS) + '=' + mon(o.sL) + '+' + o.d) + ' ✓.' },
              { html: 'It satisfies neither equation.', why: 'Substitute carefully: ' + t(mon(o.sS) + '=' + mon(o.sL) + '+' + o.d) + ' ✓ and ' + t(m2(o.a * o.sS) + '+' + m2(o.b * o.sL) + '=' + m2(o.T)) + ' ✓.' }],
            'In ' + t('S=L+' + o.d) + ': ' + t(mon(o.sS) + '=' + mon(o.sL) + '+' + o.d) + ' ✓. In ' + t(o.a + 'S+' + o.b + 'L=' + mon(o.T)) + ': ' + t(m2(o.a * o.sS) + '+' + m2(o.b * o.sL) + '=' + m2(o.T)) + ' ✓. It satisfies both.', ['Substitute ' + t('S=' + mon(o.sS)) + ' and ' + t('L=' + mon(o.sL)) + '.'], 'verify student pair');
          } },
          { id: 'e13b', sub: 'b', level: 'EMG', make: function (r, o) {
            return mc(r, 'The pair passes both of the student’s equations and is still wrong. Which sentence of the problem does it contradict, and what does that show?', [
              { html: '“A large bag costs ' + Dh(o.d) + ' more than a small bag” — the student’s large bag comes out cheaper. An equation tests what you wrote; only the words test whether you wrote the right thing.', right: true },
              { html: '“' + cap(nw(o.a)) + ' small bags together with ' + nw(o.b) + ' large bags cost ' + Dh(o.T) + '” — the total is wrong.', why: 'The total checks: ' + t(m2(o.a * o.sS) + '+' + m2(o.b * o.sL) + '=' + m2(o.T)) + '.' },
              { html: 'None — if a pair satisfies both equations, it must be right.', why: 'The first equation itself was mistranslated, so checking in it can only confirm the mistake.' },
              { html: '“Two sizes” — the prices should be whole dollars.', why: 'Prices need not be whole. Compare the two prices with the “more than” sentence.' }],
            'The student’s answer makes the large bag ' + Dh(o.sL) + ' and the small bag ' + Dh(o.sS) + ', so the large is <b>cheaper</b> — contradicting <i>“A large bag costs ' + Dh(o.d) + ' more than a small bag.”</i> The reversal was built into ' + t('S=L+' + o.d) + ', so checking in that equation could only confirm it.', ['Which bag should cost more?'], 'contradicted sentence');
          } },
          { id: 'e13c', sub: 'c i', level: 'EMG', make: function (r, o) {
            return sysP('Write the correct system.', [[-1, 1, -o.d], [o.a, o.b, -o.T]],
              { vars: ['S', 'L'], keyTex: ['L=S+' + o.d, o.a + 'S+' + o.b + 'L=' + mon(o.T)], names: ['the “more than” sentence', 'the total cost'], factHints: ['the large bag is the dearer one.', t(o.a) + ' small and ' + t(o.b) + ' large bags.'],
                wrong: [{ eq: [1, -1, -o.d], code: 'more-than-flip', hint: 'That is the student’s mistake: the <b>large</b> bag costs ' + Dh(o.d) + ' more, so ' + t('L=S+' + o.d) + '.' }, { eq: [o.b, o.a, -o.T], code: 'coef-swap', hint: t(o.a) + ' <b>small</b> bags: ' + t(o.a + 'S') + '.' }], bad: [['S=L+' + o.d, o.a + 'S+' + o.b + 'L=' + mon(o.T)]] },
              t('L=S+' + o.d) + ' and ' + t(o.a + 'S+' + o.b + 'L=' + mon(o.T)) + '.', ['Test: if a small bag cost $2, what would a large bag cost?'], 'kettle corn correct system');
          } },
          { id: 'e13d', sub: 'c ii', level: 'PRG', make: function (r, o) {
            return numsP('Solve the correct system and give both prices.', [money('Small bag'), money('Large bag')], [o.S, o.L],
              { names: ['small-bag price', 'large-bag price'], money: true, sys: [[-1, 1, -o.d], [o.a, o.b, -o.T]], sysNames: ['the “more than” sentence', 'the total'], swapHint: 'The <b>large</b> bag is the dearer one.', wrong: [{ v: [o.sS, o.sL], code: 'more-than-flip', hint: 'That is the student’s answer. Use ' + t('L=S+' + o.d) + ' (the large bag costs more).' }] },
              t('L=S+' + o.d) + ', ' + t(o.a + 'S+' + o.b + 'L=' + mon(o.T)) + ': ' + t(o.a + 'S+' + o.b + '(S+' + o.d + ')=' + mon(o.T)) + ' ⟹ ' + t((o.a + o.b) + 'S=' + m2(o.T - o.b * o.d)) + ' ⟹ ' + t('S=' + m2(o.S)) + ', ' + t('L=' + m2(o.L)) + '.<br>' + chk('Check: ' + t(m2(o.a * o.S) + '+' + m2(o.b * o.L) + '=' + m2(o.T))) + '; the large bag is now the dearer one ✓.<br><b>A small bag costs ' + Dh(o.S) + ' and a large bag ' + Dh(o.L) + '.</b>',
              ['Substitute ' + t('L=S+' + o.d) + ' into the cost equation.'], 'kettle corn prices');
          } }] },
      /* ---------- Part G ---------- */
      { num: '14', section: 'Extra practice G — One problem, both methods',
        shared: function (r) { return gen(function () { var f = r.int(40, 150), p = 10 * r.int(50, 140), n1 = 5 * r.int(4, 10), n2 = n1 + 5 * r.int(2, 8), n3 = 10 * r.int(8, 15); return { f: f, p: p / 100, n1: n1, n2: n2, n3: n3, C1: (100 * f + n1 * p) / 100, C2: (100 * f + n2 * p) / 100 }; }, { f: 98, p: 9.3, n1: 40, n2: 65, n3: 100, C1: 470, C2: 702.5 }); },
        stem: function (o) { return 'A print shop charges a one-time setup fee plus a fixed price for each shirt. An order of ' + t(o.n1) + ' shirts costs ' + Dh(o.C1) + '; an order of ' + t(o.n2) + ' shirts, placed on the same terms, costs ' + Dh(o.C2) + '. Let ' + t('f') + ' be the setup fee and ' + t('p') + ' the price of one shirt, in dollars.'; },
        parts: [
          { id: 'e14a', sub: 'a', level: 'BEG', make: function (r, o) {
            return sysP('Write the system.', [[1, o.n1, -o.C1], [1, o.n2, -o.C2]],
              { vars: ['f', 'p'], keyTex: ['f+' + o.n1 + 'p=' + mon(o.C1), 'f+' + o.n2 + 'p=' + mon(o.C2)], names: ['the first order', 'the second order'], factHints: ['the first order: fee plus ' + o.n1 + ' shirts.', 'the second order: fee plus ' + o.n2 + ' shirts.'],
                wrong: [{ eq: [o.n1, 1, -o.C1], code: 'coef-swap', hint: 'The fee is paid once; the ' + t(o.n1) + ' multiplies the shirt price: ' + t('f+' + o.n1 + 'p') + '.' }, { eq: [o.n2, 1, -o.C2], code: 'coef-swap', hint: 'The fee is paid once; the ' + t(o.n2) + ' multiplies the shirt price: ' + t('f+' + o.n2 + 'p') + '.' }], bad: [[o.n1 + 'f+p=' + mon(o.C1), 'f+' + o.n2 + 'p=' + mon(o.C2)]] },
              t('f+' + o.n1 + 'p=' + mon(o.C1)) + ' and ' + t('f+' + o.n2 + 'p=' + mon(o.C2)) + '.', ['Cost = setup fee + (number of shirts) × (price per shirt).'], 'print shop system');
          } },
          { id: 'e14b', sub: 'b', level: 'EMG', make: function (r, o) {
            return numsP('Solve the system by <b>substitution</b>.', [money('Setup fee, f'), money('Per shirt, p')], [o.f, o.p],
              { names: ['setup fee', 'price per shirt'], money: true, sys: [[1, o.n1, -o.C1], [1, o.n2, -o.C2]], sysNames: ['the first order', 'the second order'] },
              'From the first: ' + t('f=' + mon(o.C1) + '-' + o.n1 + 'p') + '. Substitute: ' + t('(' + mon(o.C1) + '-' + o.n1 + 'p)+' + o.n2 + 'p=' + mon(o.C2)) + ' ⟹ ' + t((o.n2 - o.n1) + 'p=' + m2(o.C2 - o.C1)) + ' ⟹ ' + t('p=' + m2(o.p)) + '. Back-substitute: ' + t('f=' + mon(o.C1) + '-' + o.n1 + '(' + m2(o.p) + ')=' + o.f) + '.',
              ['Isolate ' + t('f') + ' in the first equation, substitute into the second.'], 'print shop substitution');
          } },
          { id: 'e14c', sub: 'c', level: 'BEG', make: function (r, o) {
            var dn = o.n2 - o.n1, dc = m2(o.C2 - o.C1);
            return mc(r, 'Now use <b>elimination</b>: subtract the first equation from the second. Which equation results?', [
              { html: t(dn + 'p=' + dc), right: true },
              { html: t((o.n1 + o.n2) + 'p=' + m2(o.C1 + o.C2)), why: 'That adds the equations — and ' + t('f') + ' doesn’t cancel (you’d get ' + t('2f') + '). Subtract instead.' },
              { html: t(dn + 'p=-' + dc), why: 'Subtract both sides in the same order: ' + t(mon(o.C2) + '-' + mon(o.C1) + '=' + dc) + '.' },
              { html: t('2f+' + dn + 'p=' + dc), why: 'Subtracting removes ' + t('f') + ' completely: ' + t('f-f=0') + '.' }],
            t('(f+' + o.n2 + 'p)-(f+' + o.n1 + 'p)=' + mon(o.C2) + '-' + mon(o.C1)) + ' ⟹ ' + t(dn + 'p=' + dc) + ' ⟹ ' + t('p=' + m2(o.p)) + ', then ' + t('f=' + o.f) + ' — the same pair as by substitution.', ['The ' + t('f') + '-coefficients are both 1, so subtracting removes ' + t('f') + '.'], 'print shop elimination step');
          } },
          { id: 'e14d', sub: 'd', level: 'LIM', make: function (r, o) {
            return mc(r, 'The solution is ' + t('f=' + o.f) + ', ' + t('p=' + m2(o.p)) + '. Which sentence answers the question with units?', [
              { html: 'The setup fee is ' + Dh(o.f) + ' and each shirt costs ' + Dh(o.p) + '.', right: true },
              { html: 'The setup fee is ' + Dh(o.p) + ' and each shirt costs ' + Dh(o.f) + '.', why: t('f') + ' is the setup fee: ' + Dh(o.f) + '.' },
              { html: t('(' + o.f + ',\\ ' + m2(o.p) + ')') + '.', why: 'A pair on its own doesn’t say which number is which, or the units. Write a sentence.' },
              { html: 'The shop sold ' + o.f + ' shirts at ' + Dh(o.p) + ' each.', why: t('f') + ' is a fee in dollars, not a number of shirts.' }],
            chk('Check: ' + t(o.f + '+' + o.n1 + '(' + m2(o.p) + ')=' + m2(o.C1))) + ', ' + chk(t(o.f + '+' + o.n2 + '(' + m2(o.p) + ')=' + m2(o.C2))) + '. <b>The setup fee is ' + Dh(o.f) + ' and each shirt costs ' + Dh(o.p) + '.</b>', ['Say which number is which, with units.'], 'print shop answer sentence');
          } },
          { id: 'e14e', sub: 'e', level: 'EMG', make: function (r, o) {
            return mc(r, 'Which method suited this system better, and what feature of the equations decided it?', [
              { html: 'Elimination: ' + t('f') + ' has coefficient 1 in both equations, so one subtraction removes it.', right: true },
              { html: 'Substitution, because the equations contain decimals.', why: 'Decimals don’t favour substitution. The identical ' + t('f') + '-coefficients make elimination a one-line step.' },
              { html: 'Graphing, because it always gives exact answers.', why: 'By hand, graphing is only exact for integer solutions — and ' + t('p=' + m2(o.p)) + ' isn’t one.' },
              { html: 'Elimination, because the two orders have different numbers of shirts.', why: 'Right method, wrong reason: what matters is that ' + t('f') + ' has the <b>same</b> coefficient in both.' }],
            '<b>Elimination.</b> Both equations carry ' + t('f') + ' with coefficient 1 and are lined up the same way, so subtracting removes ' + t('f') + ' immediately. Substitution needs an extra rearrangement and a bracket to expand.', ['Look at the coefficients of ' + t('f') + '.'], 'which method');
          } },
          { id: 'e14f', sub: 'f', level: 'BEG', make: function (r, o) {
            return numP('The setup fee is ' + Dh(o.f) + ' and each shirt costs ' + Dh(o.p) + '. What would an order of ' + t(o.n3) + ' shirts cost?', rnd(o.f + o.n3 * o.p), function (v) { if (near(v, o.n3 * o.p)) return { code: 'flat-missing', hint: 'Add the one-time setup fee of ' + Dh(o.f) + '.' }; if (near(v, o.n3 * (o.f + o.p))) return { code: 'flat-missing', hint: 'The setup fee is paid <b>once</b>, not per shirt.' }; return null; },
              t(o.f + '+' + o.n3 + '(' + m2(o.p) + ')=' + o.f + '+' + m2(o.n3 * o.p) + '=' + m2(o.f + o.n3 * o.p)) + '. <b>An order of ' + o.n3 + ' shirts would cost ' + Dh(o.f + o.n3 * o.p) + '.</b>', ['Fee once, plus price × number of shirts.'], 'cost of 100 shirts', { money: true, before: '$' });
          } }] },
      /* ---------- Part H ---------- */
      { num: '15', section: 'Extra practice H — Error analysis',
        shared: function (r) { return gen(function () { var a1 = r.int(2, 6), b1 = r.int(2, 6), a2 = r.int(2, 7), b2 = r.int(1, 5); if (a1 * b2 === a2 * b1) return null; var x = 5 * r.int(40, 70), y = 5 * r.int(Math.ceil(x / 5) + 4, 95); return { a1: a1, b1: b1, a2: a2, b2: b2, x: x / 100, y: y / 100, T1: (a1 * x + b1 * y) / 100, T2: (a2 * x + b2 * y) / 100 }; }, { a1: 3, b1: 5, a2: 6, b2: 2, x: 2.95, y: 3.65, T1: 27.1, T2: 25 }); },
        stem: function (o) { return 'A café sold ' + t(o.a1) + ' small coffees and ' + t(o.b1) + ' large coffees for ' + Dh(o.T1) + ' one morning, and ' + t(o.a2) + ' small and ' + t(o.b2) + ' large for ' + Dh(o.T2) + ' the next. A student writes: <i>“Let ' + t('x') + ' be the number of small coffees and ' + t('y') + ' the number of large coffees. Then ' + t(o.a1 + 'x+' + o.b1 + 'y=' + m2(o.T1)) + ' and ' + t(o.a2 + 'x+' + o.b2 + 'y=' + m2(o.T2)) + ', so ' + t('x=' + m2(o.x)) + ' and ' + t('y=' + m2(o.y)) + '. The café sold ' + m2(o.x) + ' small coffees and ' + m2(o.y) + ' large coffees.”</i>'; },
        parts: [
          { id: 'e15a', sub: 'a', level: 'EMG', make: function (r, o) {
            return mc(r, 'The algebra is correct and the numbers satisfy both equations. Which single step went wrong?', [
              { html: 'The variable definitions: the equations total money, so ' + t('x') + ' and ' + t('y') + ' must be <b>prices</b> — the counts were already given.', right: true },
              { html: 'Solving: the system was solved incorrectly.', why: 'Check: ' + t(o.a1 + '(' + m2(o.x) + ')+' + o.b1 + '(' + m2(o.y) + ')=' + m2(o.T1)) + ' — the solving is fine.' },
              { html: 'Rounding: the answers should be rounded to whole coffees.', why: 'Rounding hides the real problem: ' + t('x') + ' and ' + t('y') + ' were never counts.' },
              { html: 'The equations: they should have been ' + t('x+y=' + (o.a1 + o.b1)) + ' and ' + t('x+y=' + (o.a2 + o.b2)) + '.', why: 'The equations are right for prices. It is what the letters were said to mean that is wrong.' }],
            'The <b>variable definitions</b> went wrong. The equations total money, so their unknowns have to be prices; the counts ' + [o.a1, o.b1, o.a2, o.b2].join(', ') + ' were given in the problem.', ['What do the numbers ' + o.a1 + ' and ' + o.b1 + ' in the problem count?'], 'error: definitions');
          } },
          { id: 'e15b', sub: 'b', level: 'EMG', make: function (r, o) {
            return mc(r, 'Which definitions should the student have written, and how do the <b>units</b> in ' + t(o.a1 + 'x+' + o.b1 + 'y=' + m2(o.T1)) + ' expose the error?', [
              { html: 'Let ' + t('x') + ' and ' + t('y') + ' be the prices of a small and a large coffee, in dollars. The right side is dollars and ' + t(o.a1) + ', ' + t(o.b1) + ' are counts of cups, so ' + t('x') + ', ' + t('y') + ' must be dollars per cup.', right: true },
              { html: 'Let ' + t('x') + ' and ' + t('y') + ' be the numbers of cups, in dollars.', why: 'A number of cups isn’t measured in dollars. Cups × cups can never give dollars.' },
              { html: 'Let ' + t('x') + ' and ' + t('y') + ' be the total spent on small and large coffees.', why: 'Then ' + t(o.a1 + 'x') + ' would be ' + o.a1 + ' times a total — not meaningful. Each of ' + t('x') + ', ' + t('y') + ' is the price of <b>one</b> coffee.' },
              { html: 'The definitions were fine; the units of ' + t(m2(o.T1)) + ' should be cups.', why: m2(o.T1) + ' is an amount of money: ' + Dh(o.T1) + '.' }],
            'Let ' + t('x') + ' = price of a small coffee ($) and ' + t('y') + ' = price of a large coffee ($). In ' + t(o.a1 + 'x+' + o.b1 + 'y=' + m2(o.T1)) + ' the right side is dollars while ' + t(o.a1) + ' and ' + t(o.b1) + ' are cups, so ' + t('x') + ' and ' + t('y') + ' must be <b>dollars per cup</b>.', ['(cups) × (?) = dollars. What must ? be?'], 'error: units');
          } },
          { id: 'e15c', sub: 'c', level: 'LIM', make: function (r, o) {
            return mc(r, 'Which sentence restates the student’s two numbers as a correct answer?', [
              { html: 'A small coffee costs ' + Dh(o.x) + ' and a large coffee costs ' + Dh(o.y) + '.', right: true },
              { html: 'The café sold ' + Math.round(o.x) + ' small coffees and ' + Math.round(o.y) + ' large coffees.', why: 'Rounding doesn’t fix the definitions: the numbers are prices, not counts.' },
              { html: 'A small coffee costs ' + Dh(o.y) + ' and a large coffee costs ' + Dh(o.x) + '.', why: t('x') + ' goes with the small coffees: ' + Dh(o.x) + '.' },
              { html: t('x=' + m2(o.x)) + ' and ' + t('y=' + m2(o.y)) + '.', why: 'Say what the numbers mean, with units, in a sentence.' }],
            '<b>A small coffee costs ' + Dh(o.x) + ' and a large coffee costs ' + Dh(o.y) + '.</b> ' + chk('Check: ' + t(o.a1 + '(' + m2(o.x) + ')+' + o.b1 + '(' + m2(o.y) + ')=' + m2(o.T1))) + ', ' + chk(t(o.a2 + '(' + m2(o.x) + ')+' + o.b2 + '(' + m2(o.y) + ')=' + m2(o.T2))) + ' As prices these need not be whole numbers.', ['The numbers are prices — say so, with units.'], 'error: restate answer');
          } }] },
      { num: '16', shared: function (r) { return gen(function () { var a1 = r.int(6, 14), b1 = r.int(3, 9), a2 = r.int(4, 12), b2 = r.int(3, 12); if (a1 * b2 === a2 * b1) return null; var x = 5 * r.int(100, 200), y = 5 * r.int(60, 120); if (x === y) return null; return { a1: a1, b1: b1, a2: a2, b2: b2, x: x / 100, y: y / 100, T1: (a1 * x + b1 * y) / 100, T2: (a2 * x + b2 * y) / 100, n3: 5 * r.int(2, 6), m3: 5 * r.int(1, 5) }; }, { a1: 12, b1: 5, a2: 8, b2: 9, x: 7.85, y: 4.8, T1: 118.2, T2: 106, n3: 20, m3: 15 }); },
        stem: function (o) { return 'A stationery order of ' + t(o.a1) + ' binders and ' + t(o.b1) + ' packs of paper cost ' + Dh(o.T1) + '. A second order, at the same prices, of ' + t(o.a2) + ' binders and ' + t(o.b2) + ' packs cost ' + Dh(o.T2) + '. Asked for the prices, a student sets the problem up correctly, solves it correctly, and writes the complete answer as ' + t('(' + m2(o.x) + ',\\ ' + m2(o.y) + ')') + '.'; },
        parts: [
          { id: 'e16a', sub: 'a', level: 'BEG', make: function (r, o) {
            var opts = [{ value: 'which', html: 'which number is the binder and which the pack of paper' }, { value: 'units', html: 'what units the numbers carry (dollars? a count?)' }, { value: 'question', html: 'what question is being answered' }, { value: 'positive', html: 'whether the two numbers are positive' }, { value: 'how', html: 'how many numbers the student found' }];
            return { prompt: 'Tap the <b>three</b> things a reader cannot tell from that answer as written.', input: { type: 'select', options: r.shuffle(opts) }, key: ['which', 'units', 'question'],
              check: K.selectSet(['which', 'units', 'question'], function (extra, missing) {
                if (extra.length) return { code: 'set', hint: 'A reader <b>can</b> see ' + (extra[0] === 'positive' ? 'that both numbers are positive' : 'that there are two numbers') + ' — it’s right there in the pair.' };
                return { code: 'set', hint: 'There are three things missing. Think about labels, units, and a sentence.' };
              }), answer: 'Which number is which; the units; what question is being answered.', text: 'what a bare pair hides',
              solution: 'A reader cannot tell (i) which number is the binder and which the pack of paper; (ii) what units the numbers carry; (iii) what question is being answered, since there is no sentence.', hints: ['Imagine reading only “' + t('(' + m2(o.x) + ',\\ ' + m2(o.y) + ')') + '” with no problem in front of you.'], bad: [['which', 'units'], ['which', 'units', 'question', 'positive']] };
          } },
          { id: 'e16b', sub: 'b', level: 'LIM', make: function (r, o) {
            return mc(r, 'Let ' + t('b') + ' be the price of a binder and ' + t('p') + ' the price of a pack of paper, in dollars. The pair satisfies both equations. Which is the proper answer?', [
              { html: 'A binder costs ' + Dh(o.x) + ' and a pack of paper costs ' + Dh(o.y) + '.', right: true },
              { html: 'A binder costs ' + Dh(o.y) + ' and a pack of paper costs ' + Dh(o.x) + '.', why: 'Check: ' + t(o.a1 + '(' + m2(o.y) + ')+' + o.b1 + '(' + m2(o.x) + ')\\ne ' + m2(o.T1)) + '. The first number is the binder.' },
              { html: 'The student bought ' + m2(o.x) + ' binders and ' + m2(o.y) + ' packs.', why: 'The counts are given in the problem; the numbers found are <b>prices</b>.' },
              { html: t('b=' + m2(o.x)) + ', ' + t('p=' + m2(o.y)) + '.', why: 'Better, but still no sentence or units.' }],
            chk('Check: ' + t(o.a1 + '(' + m2(o.x) + ')+' + o.b1 + '(' + m2(o.y) + ')=' + m2(o.T1))) + ', ' + chk(t(o.a2 + '(' + m2(o.x) + ')+' + o.b2 + '(' + m2(o.y) + ')=' + m2(o.T2))) + '. <b>A binder costs ' + Dh(o.x) + ' and a pack of paper costs ' + Dh(o.y) + '.</b>', ['A sentence with labels and units.'], 'stationery answer sentence');
          } },
          { id: 'e16c', sub: 'c', level: 'BEG', make: function (r, o) {
            return numP('A binder costs ' + Dh(o.x) + ' and a pack of paper ' + Dh(o.y) + '. What would ' + t(o.n3) + ' binders and ' + t(o.m3) + ' packs of paper cost?', rnd(o.n3 * o.x + o.m3 * o.y), function (v) { if (near(v, o.n3 * o.y + o.m3 * o.x)) return { code: 'swap-answer', hint: 'Match each price to its item: ' + t(o.n3) + ' <b>binders</b> at ' + Dh(o.x) + '.' }; return null; },
              t(o.n3 + '(' + m2(o.x) + ')+' + o.m3 + '(' + m2(o.y) + ')=' + m2(o.n3 * o.x) + '+' + m2(o.m3 * o.y) + '=' + m2(o.n3 * o.x + o.m3 * o.y)) + '. <b>' + o.n3 + ' binders and ' + o.m3 + ' packs would cost ' + Dh(o.n3 * o.x + o.m3 * o.y) + '.</b>', ['(number × price) for each item, then add.'], 'stationery new order', { money: true, before: '$' });
          } }] },
      { num: '17', shared: function (r) {
          return gen(function () { var pp = r.pick([[12, 30], [12, 30], [10, 30], [15, 25], [10, 25], [20, 50]]), p1 = pp[0], p2 = pp[1], d = r.int(1, 30); if (((p2 - p1) * d) % (p1 + p2)) return null; var B = r.int(40, 150), A = B + d, T = p1 * A + p2 * B, sA = (T - p2 * d) / (p1 + p2); if (!Number.isInteger(sA) || sA <= 0) return null; return { p1: p1, p2: p2, d: d, A: A, B: B, T: T, sA: sA, sB: sA + d }; },
            { p1: 12, p2: 30, d: 14, A: 120, B: 106, T: 4620, sA: 100, sB: 114 });
        },
        stem: function (o) { return 'A charity walk raised ' + Dh(o.T) + ' from two kinds of pledge, a flat ' + Dh(o.p1) + ' pledge and a flat ' + Dh(o.p2) + ' pledge. There were ' + t(o.d) + ' more ' + Dh(o.p1) + ' pledges than ' + Dh(o.p2) + ' pledges. A student defines ' + t('A') + ' as the number of ' + Dh(o.p1) + ' pledges and ' + t('B') + ' as the number of ' + Dh(o.p2) + ' pledges, writes ' + t('B=A+' + o.d) + ' and ' + t(o.p1 + 'A+' + o.p2 + 'B=' + N(o.T)) + ', and reports ' + t('A=' + o.sA) + ', ' + t('B=' + o.sB) + '.'; },
        parts: [
          { id: 'e17a', sub: 'a', level: 'LIM', make: function (r, o) {
            return mc(r, 'Check the student’s pair. Which statement is true?', [
              { html: 'It satisfies both of the student’s equations, and both counts are whole and positive.', right: true },
              { html: 'It fails ' + t(o.p1 + 'A+' + o.p2 + 'B=' + N(o.T)) + '.', why: 'Compute: ' + t(o.p1 + '(' + o.sA + ')+' + o.p2 + '(' + o.sB + ')=' + N(o.p1 * o.sA) + '+' + N(o.p2 * o.sB) + '=' + N(o.T)) + ' ✓.' },
              { html: 'It fails ' + t('B=A+' + o.d) + '.', why: t(o.sB + '=' + o.sA + '+' + o.d) + ' ✓.' },
              { html: 'One of the counts is not a whole number.', why: 'Both ' + o.sA + ' and ' + o.sB + ' are whole numbers.' }],
            'In ' + t('B=A+' + o.d) + ': ' + t(o.sB + '=' + o.sA + '+' + o.d) + ' ✓. In ' + t(o.p1 + 'A+' + o.p2 + 'B=' + N(o.T)) + ': ' + t(N(o.p1 * o.sA) + '+' + N(o.p2 * o.sB) + '=' + N(o.T)) + ' ✓. Both counts are whole and positive — nothing about the pair itself looks wrong.', ['Substitute into both equations.'], 'student pledge pair check');
          } },
          { id: 'e17b', sub: 'b', level: 'EMG', make: function (r, o) {
            return { prompt: 'Write the relationship sentence (“there were ' + o.d + ' more ' + '$' + o.p1 + ' pledges than $' + o.p2 + ' pledges”) correctly as an equation in ' + t('A') + ' and ' + t('B') + '.', input: { type: 'math', keys: 'eq', vars: ['A', 'B'], placeholder: 'e.g. A = B + 3' },
              check: eqCheck([1, -1, -o.d], { vars: ['A', 'B'], wrong: [{ eq: [-1, 1, -o.d], code: 'more-than-flip', hint: 'That is the student’s version — it says there were ' + o.d + ' more $' + o.p2 + ' pledges. The ' + t('+' + o.d) + ' belongs on the <b>smaller</b> count, ' + t('B') + '.' }, { eq: [1, -o.d, 0], code: 'more-times', hint: '“' + o.d + ' more” adds: ' + t('A=B+' + o.d) + '.' }] }),
              key: 'A=B+' + o.d, answer: t('A=B+' + o.d), text: 'pledge relationship', good: ['A-B=' + o.d, 'B=A-' + o.d], bad: ['B=A+' + o.d],
              solution: t('A=B+' + o.d) + '. There were ' + o.d + ' <b>more</b> $' + o.p1 + ' pledges, so the ' + t('+' + o.d) + ' goes on the smaller count ' + t('B') + '. The student attached it to ' + t('A') + ', which says the opposite.', hints: ['Test with small numbers: if there were 10 pledges of $' + o.p2 + ', how many $' + o.p1 + ' pledges were there?'] };
          } },
          { id: 'e17c', sub: 'c', level: 'PRG', make: function (r, o) {
            return numsP('Solve the corrected system (' + t('A=B+' + o.d) + ', ' + t(o.p1 + 'A+' + o.p2 + 'B=' + N(o.T)) + ').', [{ label: Dh(o.p1) + ' pledges, ' + t('A') }, { label: Dh(o.p2) + ' pledges, ' + t('B') }], [o.A, o.B],
              { names: ['number of $' + o.p1 + ' pledges', 'number of $' + o.p2 + ' pledges'], sys: [[1, -1, -o.d], [o.p1, o.p2, -o.T]], sysNames: ['the relationship', 'the money total'], wrong: [{ v: [o.sA, o.sB], code: 'more-than-flip', hint: 'That is the student’s answer: use ' + t('A=B+' + o.d) + '.' }] },
              t(o.p1 + '(B+' + o.d + ')+' + o.p2 + 'B=' + N(o.T)) + ' ⟹ ' + t((o.p1 + o.p2) + 'B+' + o.p1 * o.d + '=' + N(o.T)) + ' ⟹ ' + t('B=' + o.B) + ', ' + t('A=' + o.A) + '.<br>' + chk('Money: ' + t(N(o.p1 * o.A) + '+' + N(o.p2 * o.B) + '=' + N(o.T))) + '; ' + chk('words: ' + t(o.A + '-' + o.B + '=' + o.d) + ' more $' + o.p1 + ' pledges') + '<br><b>There were ' + o.A + ' pledges of ' + Dh(o.p1) + ' and ' + o.B + ' pledges of ' + Dh(o.p2) + '.</b>',
              ['Substitute ' + t('A=B+' + o.d) + ' into the money equation.'], 'pledges solve');
          } },
          { id: 'e17d', sub: 'd', level: 'EMG', make: function (r, o) {
            return mc(r, 'Both ' + t('(' + o.A + ',\\ ' + o.B + ')') + ' and ' + t('(' + o.sA + ',\\ ' + o.sB + ')') + ' satisfy ' + t(o.p1 + 'A+' + o.p2 + 'B=' + N(o.T)) + '. Why could checking the money alone never catch the error, and which check does?', [
              { html: 'Both pairs give exactly ' + Dh(o.T) + ', so the money can’t tell them apart; testing the counts against the relationship sentence does (the right pair has more $' + o.p1 + ' pledges).', right: true },
              { html: 'Checking the money would catch it if done carefully.', why: 'Both pairs give exactly ' + Dh(o.T) + ' — no amount of care helps.' },
              { html: 'Checking that both counts are whole and positive catches it.', why: 'Both pairs have whole, positive counts.' },
              { html: 'Re-solving the student’s system catches it.', why: 'Re-solving the same wrong system gives the same wrong answer.' }],
            'Both pairs give exactly ' + Dh(o.T) + ', so the money equation can never distinguish them. The check that does is <b>testing the counts against the relationship sentence</b>: the correct pair has ' + o.d + ' more $' + o.p1 + ' pledges.', ['Which sentence of the problem was mistranslated?'], 'which check catches it');
          } }] },
      /* ---------- Part I ---------- */
      { num: '18', section: 'Extra practice I — Stretch',
        shared: function (r) { return gen(function () { var ps = r.int(25, 35), pm = ps + r.int(3, 8), pl = pm + r.int(4, 9), k = r.chance(0.75) ? 2 : 3, s = r.int(5, 15), m = r.int(10, 35); if (Math.abs((k + 1) * pm - (ps + k * pl)) < 3) return null; return { ps: ps, pm: pm, pl: pl, k: k, s: s, m: m, l: k * s, N: s + m + k * s, T: ps * s + pm * m + pl * k * s }; }, { ps: 32, pm: 38, pl: 45, k: 2, s: 9, m: 27, l: 18, N: 54, T: 2124 }); },
        stem: function (o) { return 'A school store sells hoodies in three sizes: small at ' + Dh(o.ps) + ', medium at ' + Dh(o.pm) + ' and large at ' + Dh(o.pl) + '. On one day it sold ' + t(o.N) + ' hoodies for ' + Dh(o.T) + ', and the number of large hoodies sold was exactly <b>' + TIMES[o.k] + '</b> the number of small hoodies sold. Let ' + t('s') + ', ' + t('m') + ' and ' + t('l') + ' be the numbers of small, medium and large hoodies sold.'; },
        parts: [
          { id: 'e18a', sub: 'a', level: 'EMG', make: function (r, o) {
            var E = function (a, b, c) { return t(a) + '<br>' + t(b) + '<br>' + t(c); };
            return mc(r, 'Which three equations model the three facts?', [
              { html: E('s+m+l=' + o.N, o.ps + 's+' + o.pm + 'm+' + o.pl + 'l=' + N(o.T), 'l=' + o.k + 's'), right: true },
              { html: E('s+m+l=' + o.N, o.ps + 's+' + o.pm + 'm+' + o.pl + 'l=' + N(o.T), o.k + 'l=s'), why: 'Test: with ' + t('s=5') + ' small there are ' + t(5 * o.k) + ' large. So ' + t('l=' + o.k + 's') + '.' },
              { html: E('s+m+l=' + N(o.T), o.ps + 's+' + o.pm + 'm+' + o.pl + 'l=' + o.N, 'l=' + o.k + 's'), why: 'The count and value are swapped: ' + t('s+m+l') + ' counts hoodies (' + o.N + ').' },
              { html: E('s+m+l=' + o.N, o.pl + 's+' + o.pm + 'm+' + o.ps + 'l=' + N(o.T), 'l=' + o.k + 's'), why: 'Each price goes with its own size: small hoodies bring in ' + t(o.ps + 's') + '.' }],
            t('s+m+l=' + o.N) + ' (counts hoodies), ' + t(o.ps + 's+' + o.pm + 'm+' + o.pl + 'l=' + N(o.T)) + ' (totals money), ' + t('l=' + o.k + 's') + ' (the relationship).', ['One equation counts, one totals money, one states the relationship.'], 'three equations');
          } },
          { id: 'e18b', sub: 'b i', level: 'ADV', make: function (r, o) {
            var c1 = o.k + 1, c2 = o.ps + o.k * o.pl;
            return sysP('Use ' + t('l=' + o.k + 's') + ' to eliminate ' + t('l') + ' from the other two equations. Write the resulting system in ' + t('s') + ' and ' + t('m') + '.', [[c1, 1, -o.N], [c2, o.pm, -o.T]],
              { vars: ['s', 'm'], keyTex: [c1 + 's+m=' + o.N, c2 + 's+' + o.pm + 'm=' + o.T], showTex: [c1 + 's+m=' + o.N, c2 + 's+' + o.pm + 'm=' + N(o.T)], names: ['the count', 'the money'], factHints: ['replace ' + t('l') + ' with ' + t(o.k + 's') + ' in ' + t('s+m+l=' + o.N) + '.', 'replace ' + t('l') + ' with ' + t(o.k + 's') + ' in the money equation: ' + t(o.pl + '(' + o.k + 's)') + '.'],
                wrong: [{ eq: [1 + o.ps, o.pm, -o.T], code: 'coef-swap', hint: 'Substitute ' + t('l=' + o.k + 's') + ': the large hoodies bring in ' + t(o.pl + '(' + o.k + 's)=' + o.pl * o.k + 's') + '.' }, { eq: [o.ps + o.pl, o.pm, -o.T], code: 'ratio-flip', hint: 'There are ' + t(o.k + 's') + ' large hoodies, so they bring in ' + t(o.pl + '(' + o.k + 's)') + ', not ' + t(o.pl + 's') + '.' }, { eq: [2, 1, -o.N], code: 'ratio-flip', hint: 'Replace ' + t('l') + ' with ' + t(o.k + 's') + ': ' + t('s+m+' + o.k + 's=' + o.N) + '.' }],
                bad: [[c1 + 's+m=' + o.N, (o.ps + o.pl) + 's+' + o.pm + 'm=' + o.T]] },
              'Substitute ' + t('l=' + o.k + 's') + ': ' + t('s+m+' + o.k + 's=' + o.N) + ' ⟹ ' + t(c1 + 's+m=' + o.N) + ', and ' + t(o.ps + 's+' + o.pm + 'm+' + o.pl + '(' + o.k + 's)=' + N(o.T)) + ' ⟹ ' + t(c2 + 's+' + o.pm + 'm=' + N(o.T)) + '.',
              ['Replace every ' + t('l') + ' with ' + t(o.k + 's') + ' and collect the ' + t('s') + '-terms.'], 'reduce three to two');
          } },
          { id: 'e18b2', sub: 'b ii', level: 'PRG', make: function (r, o) {
            var c1 = o.k + 1, c2 = o.ps + o.k * o.pl;
            return numsP('Solve the reduced system ' + t(c1 + 's+m=' + o.N) + ', ' + t(c2 + 's+' + o.pm + 'm=' + N(o.T)) + '.', [{ label: 'Small, ' + t('s') }, { label: 'Medium, ' + t('m') }], [o.s, o.m],
              { names: ['number of small hoodies', 'number of medium hoodies'], sys: [[c1, 1, -o.N], [c2, o.pm, -o.T]], sysNames: ['the count equation', 'the money equation'] },
              t('m=' + o.N + '-' + c1 + 's') + ': ' + t(c2 + 's+' + o.pm + '(' + o.N + '-' + c1 + 's)=' + N(o.T)) + ' ⟹ ' + t(cf(c2 - o.pm * c1, 's') + '=' + (o.T - o.pm * o.N)) + ' ⟹ ' + t('s=' + o.s) + ', ' + t('m=' + o.m) + '.',
              ['Isolate ' + t('m') + ' in the count equation and substitute.'], 'reduced system solve');
          } },
          { id: 'e18c', sub: 'c', level: 'BEG', make: function (r, o) {
            return numP('The reduced system gives ' + t('s=' + o.s) + ' and ' + t('m=' + o.m) + '. How many <b>large</b> hoodies were sold?', o.l, function (v) { if (near(v, o.s / o.k)) return { code: 'ratio-flip', hint: 'There are ' + TIMES[o.k] + ' as many large as small: ' + t('l=' + o.k + 's') + '.' }; return null; },
              t('l=' + o.k + 's=' + o.k + '(' + o.s + ')=' + o.l) + '.<br>' + chk('Check: ' + t(o.s + '+' + o.m + '+' + o.l + '=' + o.N)) + ', ' + chk(t(o.ps + '(' + o.s + ')+' + o.pm + '(' + o.m + ')+' + o.pl + '(' + o.l + ')=' + N(o.T))) + ', ' + chk(t(o.l + '=' + o.k + '(' + o.s + ')')) + '<br><b>The store sold ' + o.s + ' small, ' + o.m + ' medium and ' + o.l + ' large hoodies.</b>',
              ['Use ' + t('l=' + o.k + 's') + '.'], 'recover third variable');
          } },
          { id: 'e18d', sub: 'd', level: 'EMG', make: function (r, o) {
            return mc(r, 'Why must “' + TIMES[o.k] + ' as many large as small” be written ' + t('l=' + o.k + 's') + ' and not ' + t(o.k + 'l=s') + '? Use ' + t('s=' + o.s) + ', ' + t('l=' + o.l) + ' as the test.', [
              { html: t(o.l + '=' + o.k + '(' + o.s + ')') + ' is true, while ' + t(o.k + 'l=s') + ' would claim ' + t(o.k * o.l + '=' + o.s) + ', which is false. The ' + t(o.k) + ' multiplies the <b>smaller</b> count.', right: true },
              { html: 'Both are fine — they are the same equation.', why: 'Test them: they give different results for ' + t('s=' + o.s) + '.' },
              { html: 'Because ' + t('l') + ' comes before ' + t('s') + ' in the sentence, so the ' + t(o.k) + ' goes next to ' + t('l') + '.', why: 'Word order doesn’t decide it — that is exactly the trap. Test with numbers.' },
              { html: 'Because large hoodies cost more.', why: 'Prices have nothing to do with the relationship between the counts.' }],
            'With ' + t('s=' + o.s) + ', ' + t('l=' + o.l) + ': ' + t('l=' + o.k + 's') + ' reads ' + t(o.l + '=' + o.k + '(' + o.s + ')') + ' ✓, while ' + t(o.k + 'l=s') + ' would claim ' + t(o.k * o.l + '=' + o.s) + ', false. Multiplying the <b>smaller</b> count by ' + o.k + ' produces the larger one.', ['Substitute the numbers into each version.'], 'why l = 2s');
          } }] },
      { num: '19', shared: function (r) { return gen(function () { var ra = r.int(8, 14), rb = r.int(5, ra - 2), H = r.int(10, 20), a = r.int(3, H - 3), b = H - a, dl = r.int(2, 12); if (a === b) return null; return { ra: ra, rb: rb, H: H, a: a, b: b, A: ra * a + rb * b, A2: ra * H + dl, nm: r.pick([['Amir', 'Bo'], ['Amir', 'Bo'], ['Nadia', 'Theo'], ['Jun', 'Sara']]) }; }, { ra: 11, rb: 8, H: 15, a: 7, b: 8, A: 141, A2: 170, nm: ['Amir', 'Bo'] }); },
        stem: function (o) { return 'Two workers spread mulch. Working on their own, ' + o.nm[0] + ' covers ' + t(o.ra + '\\text{ m}^2') + ' per hour and ' + o.nm[1] + ' covers ' + t(o.rb + '\\text{ m}^2') + ' per hour. On Saturday the two of them logged ' + t(o.H) + ' hours of work between them and covered ' + t(o.A + '\\text{ m}^2') + '. Let ' + t('a') + ' be the hours ' + o.nm[0] + ' worked and ' + t('b') + ' the hours ' + o.nm[1] + ' worked.'; },
        parts: [
          { id: 'e19a', sub: 'a', level: 'BEG', make: function (r, o) {
            return sysP('Build one equation from the <b>total time</b> and the other from the two <b>rates</b>.', [[1, 1, -o.H], [o.ra, o.rb, -o.A]],
              { vars: ['a', 'b'], keyTex: ['a+b=' + o.H, o.ra + 'a+' + o.rb + 'b=' + o.A], labels: ['Total time', 'Total area'], names: ['the total time', 'the total area'], factHints: ['their hours add to ' + t(o.H) + '.', 'rate × time = area for each worker.'],
                wrong: [{ eq: [o.rb, o.ra, -o.A], code: 'value-swap', hint: o.nm[0] + ' covers ' + t(o.ra) + ' m² per hour: ' + t(o.ra + 'a') + '.' }, { eq: [1, 1, -o.A], code: 'count-value', hint: t('a+b') + ' adds hours: it equals ' + t(o.H) + '.' }], bad: [['a+b=' + o.H, o.rb + 'a+' + o.ra + 'b=' + o.A]] },
              t('a+b=' + o.H) + ' — total time (pure numbers). ' + t(o.ra + 'a+' + o.rb + 'b=' + o.A) + ' — from the rates; each term is (m² per hour) × (hours) = m².', ['One equation adds hours; the other adds areas (rate × time).'], 'mulch system');
          } },
          { id: 'e19b', sub: 'b', level: 'EMG', make: function (r, o) {
            return numsP('Solve the system and verify in both original equations.', [{ label: o.nm[0], after: 'h' }, { label: o.nm[1], after: 'h' }], [o.a, o.b],
              { names: ['hours for ' + o.nm[0], 'hours for ' + o.nm[1]], sys: [[1, 1, -o.H], [o.ra, o.rb, -o.A]], sysNames: ['the total time', 'the total area'] },
              t('b=' + o.H + '-a') + ': ' + t(o.ra + 'a+' + o.rb + '(' + o.H + '-a)=' + o.A) + ' ⟹ ' + t((o.ra - o.rb) + 'a+' + o.rb * o.H + '=' + o.A) + ' ⟹ ' + t('a=' + o.a) + ', ' + t('b=' + o.b) + '.<br>' + chk('Check: ' + t(o.a + '+' + o.b + '=' + o.H)) + ', ' + chk(t(o.ra + '(' + o.a + ')+' + o.rb + '(' + o.b + ')=' + o.A)),
              ['Substitute ' + t('b=' + o.H + '-a') + ' into the area equation.'], 'mulch solve');
          } },
          { id: 'e19c', sub: 'c', level: 'LIM', make: function (r, o) {
            return mc(r, 'The solution is ' + t('a=' + o.a) + ', ' + t('b=' + o.b) + '. Which answer checks against the words and answers in a sentence?', [
              { html: o.nm[0] + ' worked ' + o.a + ' hours and ' + o.nm[1] + ' worked ' + o.b + ' hours; both are positive and add to ' + o.H + ' h.', right: true },
              { html: o.nm[0] + ' covered ' + o.a + ' m² and ' + o.nm[1] + ' covered ' + o.b + ' m².', why: t('a') + ' and ' + t('b') + ' are <b>hours</b>, not areas.' },
              { html: o.nm[0] + ' worked ' + o.b + ' hours and ' + o.nm[1] + ' worked ' + o.a + ' hours.', why: t('a') + ' is ' + o.nm[0] + '’s time: ' + o.a + ' h.' },
              { html: t('(' + o.a + ',\\ ' + o.b + ')') + ' ✓', why: 'Say who worked how long, with units.' }],
            '<b>' + o.nm[0] + ' worked ' + o.a + ' hours and ' + o.nm[1] + ' worked ' + o.b + ' hours.</b> Both are positive, neither exceeds ' + o.H + ' h, and they add to exactly ' + o.H + ' ✓.', ['Which letter is whose time?'], 'mulch answer sentence');
          } },
          { id: 'e19d', sub: 'd i', level: 'EMG', make: function (r, o) {
            return numP('The log for the following Saturday claims the same two workers logged ' + t(o.H) + ' hours between them and covered ' + t(o.A2 + '\\text{ m}^2') + '. What is the <b>largest</b> area ' + t(o.H) + ' hours of work could possibly cover?', o.ra * o.H, function (v) { if (v === o.rb * o.H) return { code: 'max-wrong', hint: 'That’s if ' + o.nm[1] + ' (the slower worker) did every hour. The largest is when ' + o.nm[0] + ' does all ' + o.H + ' hours.' }; if (v === (o.ra + o.rb) * o.H) return { code: 'max-wrong', hint: 'The ' + o.H + ' hours are shared between them — not ' + o.H + ' hours each.' }; return null; },
              'The most is when the faster worker, ' + o.nm[0] + ', does every hour: ' + t(o.H + '\\times ' + o.ra + '=' + o.ra * o.H) + ' m².', ['Who covers more per hour? Give that worker all the hours.'], 'largest area', { after: 'm²' });
          } },
          { id: 'e19d2', sub: 'd ii', level: 'EMG', make: function (r, o) {
            var aa = (o.A2 - o.rb * o.H) / (o.ra - o.rb), bb = o.H - aa, aF = LS.toFr(aa), bF = LS.toFr(bb);
            return mc(r, 'Solving the new system (' + t('a+b=' + o.H) + ', ' + t(o.ra + 'a+' + o.rb + 'b=' + o.A2) + ') gives ' + t('a=' + frT(aF[0], aF[1])) + ' and ' + t('b=' + frT(bF[0], bF[1])) + '. What must be wrong with the log?', [
              { html: o.nm[1] + '’s time is negative, and the most ' + o.H + ' hours can cover is ' + (o.ra * o.H) + ' m². Since ' + o.A2 + ' > ' + (o.ra * o.H) + ', no non-negative hours fit: the log must be wrong.', right: true },
              { html: 'Nothing — ' + o.nm[0] + ' just worked overtime.', why: 'The log says ' + o.H + ' hours <b>between them</b>; ' + o.nm[0] + ' alone would need more than that.' },
              { html: 'The algebra must be wrong, because a time can’t come out negative.', why: 'The pair satisfies both equations — the algebra is right. The negative time shows that the <b>log</b> is impossible.' },
              { html: 'Round ' + o.nm[1] + '’s time to 0 h and the log is fine.', why: 'With ' + t('b=0') + ', ' + o.nm[0] + ' covers at most ' + (o.ra * o.H) + ' m² in ' + o.H + ' h — still short of ' + o.A2 + '.' }],
            t('b=' + frT(bF[0], bF[1])) + ' is negative — impossible — and ' + o.nm[0] + '’s ' + t(frT(aF[0], aF[1])) + ' h alone exceeds the ' + o.H + ' h logged. The most ' + o.H + ' hours can cover is ' + t(o.H + '\\times ' + o.ra + '=' + o.ra * o.H) + ' m²; since ' + t(o.A2 + '>' + o.ra * o.H) + ', <b>the log must be wrong</b>.', ['Compare the claimed area with the largest possible area.'], 'impossible log');
          } }] },
      /* ---------- Mastery: the second equation comes from a "what if" ---------- */
      { num: '20', section: 'Mastery challenge', shared: swapBuy,
        stem: function (o) { return o.nm + ' bought some ' + o.A + ' at ' + Dh(o.pa) + ' each and some ' + o.B + ' at ' + Dh(o.pb) + ' each, and the bill came to ' + Dh(o.T) + '. Had the two counts been the other way around — as many ' + o.A + ' as there actually were ' + o.B + ', and as many ' + o.B + ' as there actually were ' + o.A + ' — the bill would have been ' + Dh(o.D) + ' <b>' + (o.more ? 'more' : 'less') + '</b>.'; },
        parts: [
          { id: 'e20', level: 'MAS', outcome: 'RF9', make: function (r, o) {
            var L1 = [o.pa, o.pb, -o.T], L2 = [o.pb, o.pa, -o.T2], S = o.pa + o.pb, Df = o.pb - o.pa, sg = o.more ? '+' : '-';
            var dirP = solve2(L1, [o.pb, o.pa, -(o.more ? o.T - o.D : o.T + o.D)]), dP = solve2(L1, [o.pb, o.pa, -o.D]);
            var W = [];
            if (dirP) W.push({ v: dirP, code: 'swapbuy-direction', hint: 'Check the direction: the swapped bill is ' + Dh(o.D) + ' <b>' + (o.more ? 'more' : 'less') + '</b> than ' + Dh(o.T) + ', so it is ' + t(D(o.T) + sg + D(o.D) + '=' + D(o.T2)) + '.' });
            if (dP) W.push({ v: dP, code: 'swapbuy-diff', hint: Dh(o.D) + ' is the <b>difference</b> between the two bills, not the swapped bill itself. The swapped bill is ' + t(D(o.T) + sg + D(o.D) + '=' + D(o.T2)) + '.' });
            var sol = 'Let ' + t('x') + ' be the number of ' + o.A + ' and ' + t('y') + ' the number of ' + o.B + ' actually bought.<br>' +
              'Actual bill: ' + t(N(o.pa) + 'x+' + N(o.pb) + 'y=' + N(o.T)) + '<br>' +
              'Swapped counts (' + t('y') + ' ' + o.A + ' and ' + t('x') + ' ' + o.B + '): ' + t(N(o.pa) + 'y+' + N(o.pb) + 'x=' + N(o.T) + sg + N(o.D) + '=' + N(o.T2)) + ', i.e. ' + t(N(o.pb) + 'x+' + N(o.pa) + 'y=' + N(o.T2)) + '<br>' +
              '<b>Add</b> the equations: ' + t(N(S) + 'x+' + N(S) + 'y=' + N(o.T + o.T2)) + ', so ' + t('x+y=' + (o.x + o.y)) + '.<br>' +
              '<b>Subtract</b> (second − first): ' + t(N(Df) + 'x-' + N(Df) + 'y=' + N(o.T2 - o.T)) + ', so ' + t('x-y=' + (o.x - o.y)) + '.<br>' +
              'Add these: ' + t('2x=' + (2 * o.x)) + ', ' + t('x=' + o.x) + '; then ' + t('y=' + (o.x + o.y) + '-' + o.x + '=' + o.y) + '.<br>' +
              chk('Check: ' + t(N(o.pa) + '(' + o.x + ')+' + N(o.pb) + '(' + o.y + ')=' + N(o.T))) + ' and ' + chk(t(N(o.pa) + '(' + o.y + ')+' + N(o.pb) + '(' + o.x + ')=' + N(o.T2))) + ', which is ' + Dh(o.D) + ' ' + (o.more ? 'more' : 'less') + '.<br>' +
              '<b>' + o.nm + ' bought ' + o.x + ' ' + o.A + ' and ' + o.y + ' ' + o.B + '.</b>';
            return numsP('How many ' + o.A + ' and how many ' + o.B + ' did ' + o.nm + ' actually buy?', [{ label: cap(o.A) + ':' }, { label: cap(o.B) + ':' }], [o.x, o.y],
              { names: ['number of ' + o.A, 'number of ' + o.B], sys: [L1, L2], sysNames: ['the actual bill', 'the swapped bill'], wrong: W,
                swapHint: 'Those are the counts of the <b>swapped</b> order — they would cost ' + Dh(o.T2) + '. Which count of ' + o.A + ' gives the actual bill of ' + Dh(o.T) + '?',
                bad: W.map(function (w) { return w.v.map(plain); }) },
              sol,
              ['Let ' + t('x') + ' and ' + t('y') + ' be the numbers of ' + o.A + ' and ' + o.B + ' actually bought. Write the actual bill, then the bill for the swapped counts: there would be ' + t('y') + ' ' + o.A + ' and ' + t('x') + ' ' + o.B + '.',
                'The swapped bill is ' + t(D(o.T) + sg + D(o.D)) + '. Try adding the two equations, then subtracting them.'],
              'MAS swapped counts ' + o.x + '/' + o.y + ' at ' + o.pa + '/' + o.pb + (o.more ? ' more ' : ' less ') + o.D);
          } }] }
    ]
  });
  function swapBuy(r) {
    var items = [['pens', 'notebooks', [125, 150, 175, 200, 225, 250], [350, 400, 450, 500, 550, 600]], ['muffins', 'sandwiches', [200, 225, 250, 275, 300], [550, 600, 650, 700, 750]], ['packs of trading cards', 'comic books', [300, 350, 400, 450], [700, 750, 800, 850, 900, 950]], ['bags of soil', 'potted plants', [600, 650, 700, 750, 800], [1200, 1250, 1350, 1400, 1500]]];
    var book = { it: items[0], ca: 150, cb: 450, x: 7, y: 11 };
    var c = gen(function () {
      var it = r.pick(items), ca = r.pick(it[2]), cb = r.pick(it[3]), x = r.int(3, 18), y = r.int(3, 18);
      if (x === y || Math.abs(x - y) < 2) return null;
      return { it: it, ca: ca, cb: cb, x: x, y: y };
    }, book);
    var T = (c.ca * c.x + c.cb * c.y) / 100, T2 = (c.ca * c.y + c.cb * c.x) / 100;
    return { nm: r.pick(['Ravi', 'Maya', 'Tomas', 'Aiko', 'Lena', 'Owen', 'Priya', 'Jonah']), A: c.it[0], B: c.it[1], pa: c.ca / 100, pb: c.cb / 100, x: c.x, y: c.y, T: T, T2: T2, D: Math.round(Math.abs(T2 - T) * 100) / 100, more: T2 > T };
  }
})(window);
